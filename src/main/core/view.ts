import { BrowserView, app, ipcMain } from 'electron';

import appManager from './manager';
import type AppWindow from './window';
import { replaceBaseUrl, uniqueID } from '../utils';
import { NetErrorCode, WINDOW_HEADER_HEIGHT, defaultBrowserViewOptions } from '../utils/config';
import { AppEnv } from '../utils/env';
import * as interceptUtils from '../utils/intercept';
import log from '../utils/logger';
import { REGEX_APP_EDITOR_PATH } from '../utils/regex';
import { reportError } from '../utils/report';
import { AppURL } from '../utils/url';

interface ViewConfig {
  id?: string;
  title?: string;
}

const logger = log.scope('Core::View');

const MAX_LOAD_FAILED_NUM = 3;

export default class AppView {
  constructor(window: AppWindow, url: string, config: ViewConfig = {}) {
    this.id = config.id ?? uniqueID();
    this.#title = config.title ?? '';
    this.#isAlive = true;
    this.#loadFailedNum = 0;
    this.willDestroy = false;

    this.path = url;
    this.window = window;
    this.browserView = new BrowserView(defaultBrowserViewOptions);
    this.#resetUserAgent();

    this.browserView.webContents.loadURL(url || AppURL.APP_HOME_URL);
    logger.info('new BrowserView id: ', this.id, 'path: ', this.path);
    this.#bindEventListener();
  }

  id: string;
  path: string;
  window: AppWindow;
  willDestroy: boolean;
  browserView: BrowserView;

  #title: string;
  #isAlive: boolean;
  #loadFailedNum: number;
  #reloadTimer?: NodeJS.Timeout;
  #destroyTimer?: NodeJS.Timeout;

  get title() {
    return this.#title;
  }

  set title(value) {
    this.#title = value;
    this.window.updateTabsInfo();
  }

  get isAlive() {
    return this.#isAlive;
  }

  get isHomepage() {
    return this.window.homepage.id === this.id;
  }

  #resetUserAgent() {
    if (AppEnv.IS_LENOVO_EDITION) {
      const userAgent = this.browserView.webContents.getUserAgent();
      this.browserView.webContents.setUserAgent(`${userAgent} boardmixLenovo/${app.getVersion()}`);
    }
    if (process.mas) {
      const userAgent = this.browserView.webContents.getUserAgent();
      this.browserView.webContents.setUserAgent(`${userAgent} boardmixMas/${app.getVersion()}`);
    }
  }

  #bindEventListener() {
    this.browserView.webContents.setWindowOpenHandler((details) => {
      logger.info('WindowOpenHandler', details.url);
      interceptUtils.interceptWindowOpen(details.url);
      return { action: 'deny' };
    });
    this.browserView.webContents.on('did-navigate', (event, url) => {
      logger.info('did-navigate', url);
      clearTimeout(this.#reloadTimer);
      event.preventDefault();
    });
    // 单页应用
    this.browserView.webContents.on('did-navigate-in-page', (event, url) => {
      this.path = url;
      logger.info('did-navigate-in-page', url);
      interceptUtils.interceptDidNavigateInPage(event, url, this);
    });
    this.browserView.webContents.on('will-redirect', (_event, url) => {
      logger.info('will-redirect', url);
    });
    // 页面跳转
    this.browserView.webContents.on('will-navigate', (event, url) => {
      logger.info('will-navigate', url);
      interceptUtils.interceptWillNavigate(event, url, this);
    });
    this.browserView.webContents.on('did-create-window', () => {
      logger.info('did-create-window');
      return false;
    });
    this.browserView.webContents.on('page-title-updated', (_event, title) => {
      this.title = title;
      logger.info('page-title-updated', title);
    });
    this.browserView.webContents.on('before-input-event', (event, input) => {
      if (this.isHomepage) {
        interceptUtils.interceptKeyEventWithHomepage(event, input, this);
      } else {
        interceptUtils.interceptKeyEvent(event, input, this);
      }
    });
    this.browserView.webContents.on(
      'did-fail-load',
      (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        reportError({
          eventType: 'exception',
          type: 'Load_Content_Fail',
          errorDescription,
          validatedURL,
          isMainFrame,
          errorCode,
          errorMessage: JSON.stringify({ errorCode, errorDescription, validatedURL, isMainFrame }),
        });
        if (![NetErrorCode.ABORTED].includes(errorCode) && isMainFrame) {
          this.viewProtect();
        }
      },
    );
    this.browserView.webContents.on('render-process-gone', (_event, details) => {
      this.#isAlive = false;
      logger.info('render-process-gone', details);
    });
    this.browserView.webContents.on('destroyed', () => {
      this.window.deleteTab(this.id);
      this.#isAlive = false;
      logger.info('destroyed');
    });
  }

  close() {
    this.willDestroy = true;
    this.window.updateTabsInfo();
    if (REGEX_APP_EDITOR_PATH.test(this.browserView.webContents?.getURL())) {
      logger.info('close view', this.id);
      this.postMessageToWeb({ message: 'saveCoverAndCloseView' });
      this.#destroyTimer = setTimeout(() => this.destroy(), 1500);
      ipcMain.on('view:update-homepage-file', this.handleOnDestroy);
    } else {
      this.destroy();
    }
  }

  destroy() {
    clearTimeout(this.#reloadTimer);
    clearTimeout(this.#destroyTimer);
    ipcMain.removeListener('view:update-homepage-file', this.handleOnDestroy);

    if (this.browserView.webContents && !this.browserView.webContents.isDestroyed()) {
      this.#destroyTimer = setTimeout(() => {
        this.browserView.webContents.close();
      }, 100);
    }
  }

  handleOnDestroy(event: Electron.IpcMainEvent) {
    appManager.getAppView(event.sender)?.destroy();
  }

  handleOnSuccess() {
    logger.info('success');
    this.#loadFailedNum = 0;
    this.window.toggleError(false);
    this.title = this.browserView.webContents.getTitle();
  }

  reloadURL(base?: string) {
    const viewUrl = this.browserView.webContents.getURL();
    const oldUrl = new URL(viewUrl);
    const redirectUrl = oldUrl.searchParams.get('redirect_uri');
    if (redirectUrl) {
      const redirect = replaceBaseUrl(redirectUrl, base);
      oldUrl.searchParams.delete('redirect_uri');
      oldUrl.searchParams.append('redirect_uri', redirect);
    }
    const newUrl = new URL(`${oldUrl.pathname}${oldUrl.search}`, base);
    this.browserView.webContents.loadURL(newUrl.href);
  }

  reload() {
    if (this.browserView.webContents && !this.browserView.webContents.isDestroyed()) {
      this.browserView.webContents.reloadIgnoringCache();
    }
  }

  resize() {
    const windowBounds = this.window.browserWindow.getContentBounds();
    const viewWidth = windowBounds.width - 2;
    const viewHeight = windowBounds.height - WINDOW_HEADER_HEIGHT - 1;
    this.browserView.setBounds({ x: 1, y: WINDOW_HEADER_HEIGHT, width: viewWidth, height: viewHeight });
  }

  postMessageToWeb<K extends keyof WebEventPayload>(data: { message: K; data?: WebEventPayload[K] }) {
    if (this.browserView.webContents && !this.browserView.webContents.isDestroyed()) {
      this.browserView.webContents.send('postMessage', data);
    }
  }

  viewProtect() {
    clearTimeout(this.#reloadTimer);
    this.#reloadTimer = setTimeout(() => {
      if (this.#loadFailedNum < MAX_LOAD_FAILED_NUM) {
        this.#loadFailedNum += 1;
        this.#isAlive = true;
        this.reload();
      } else {
        this.#isAlive = false;
        logger.info('重试超过3次');
        if (this.window.activeView === this) {
          this.window.toggleError(true);
        }
      }
    }, 300);
  }
}
