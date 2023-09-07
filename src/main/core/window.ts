import type { Rectangle } from 'electron';
import { BrowserWindow, dialog } from 'electron';

import i18next from 'i18next';

import appManager from '../core/manager';
import AppView from '../core/view';
import { mimeTypeToDownloads, uniqueID } from '../utils';
import { defaultBrowserWindowOptions } from '../utils/config';
import log from '../utils/logger';
import { AppURL, MainWindow } from '../utils/url';

const logger = log.scope('Core::Window');

export default class AppWindow {
  static lastFocusedWindow: AppWindow | null = null;

  constructor() {
    this.id = uniqueID();
    this.browserWindow = new BrowserWindow(defaultBrowserWindowOptions);
    this.bounds = this.browserWindow.getBounds();
    this.browserWindow.loadURL(MainWindow.HEADER);
    logger.info('new BrowserWindow id: ', this.id);
    this.#bindBrowserWindowListener();
    this.homepage = this.createHomepage();
  }

  id: string;
  bounds: Rectangle;
  homepage: AppView;
  activeView?: AppView;
  browserWindow: BrowserWindow;
  tabsStore = new Map<string, AppView>();

  get isHomeActive() {
    return this.homepage.id === this.activeView?.id;
  }

  get effectiveTabs() {
    return Array.from(this.tabsStore.values()).filter((view) => !view.willDestroy);
  }

  #bindBrowserWindowListener() {
    this.browserWindow.once('ready-to-show', () => {
      this.browserWindow.show();
      appManager.onAfterAppStart();
      logger.info('[BrowserWindow Event]: ready-to-show');
    });
    this.browserWindow.on('resize', () => {
      this.activeView?.resize();
      this.updateWindowInfo();
      logger.info('[BrowserWindow Event]: resize');
    });
    this.browserWindow.on('maximize', () => {
      this.updateWindowInfo();
      logger.info('[BrowserWindow Event]: maximize');
    });
    this.browserWindow.on('restore', () => {
      this.activeView?.resize();
      logger.info('[BrowserWindow Event]: restore');
    });
    this.browserWindow.on('unmaximize', () => {
      this.updateWindowInfo();
      logger.info('[BrowserWindow Event]: unmaximize');
    });
    this.browserWindow.on('focus', () => {
      logger.info(`[BrowserWindow Event]: focus id: ${this.id}`);
      AppWindow.lastFocusedWindow = this;
      this.focus();
    });
    this.browserWindow.on('close', () => {
      this.destroy();
      appManager.deleteWindow(this);
      if (AppWindow.lastFocusedWindow === this) {
        AppWindow.lastFocusedWindow = null;
      }
      appManager.onAfterAppExit();
      logger.info('[BrowserWindow Event]: close');
    });
    this.browserWindow.webContents.session.on('will-download', (_event, item) => {
      const mimeType = item.getMimeType();
      const downloadItemFilters = mimeTypeToDownloads(mimeType);
      item.setSaveDialogOptions({ filters: downloadItemFilters });
      logger.info('[BrowserWindow Event]: will-download', item.getURL());
    });
  }

  focus() {
    if (!this.activeView) {
      return;
    }
    if (!this.activeView.isAlive) {
      this.#setView(this.#aliveView(this.activeView));
    } else {
      this.activeView.browserView.webContents.focus();
    }
  }

  #setView(view: AppView) {
    if (this.browserWindow.isDestroyed()) {
      return;
    }
    if (view.willDestroy || this.activeView === view) {
      return;
    }
    this.activeView = view;
    this.toggleLoading(false);
    logger.info('setBrowserView', view.path);
    this.browserWindow.setBrowserView(view.browserView);
    view.resize();
    view.browserView.webContents.focus();
    this.updateTabsInfo();
  }

  #aliveView(view: AppView) {
    if (view.isAlive) {
      return view;
    } else {
      const newView = new AppView(this, view.path, { id: view.id, title: view.title });
      if (view.isHomepage) {
        this.homepage = newView;
      } else {
        this.tabsStore.set(view.id, newView);
      }
      return newView;
    }
  }

  updateWindowInfo() {
    const isMaximized = this.browserWindow.isMaximized();
    const isFullScreen = this.browserWindow.isFullScreen();
    this.postMessageToWeb({ message: 'HEADER_INFO', data: { isMaximized, isFullScreen } });
  }

  updateHeaderInfo() {
    this.updateTabsInfo();
    this.updateWindowInfo();
  }

  updateTabsInfo() {
    const tabList = this.effectiveTabs.map((view) => ({
      id: view.id,
      path: view.path,
      title: view.title,
      isActive: view.id === this.activeView?.id,
    }));
    this.postMessageToWeb({ message: 'TABS_SET', data: { tabList, isHomeActive: this.isHomeActive } });
  }

  toggleMaximize() {
    const isMaximized = this.browserWindow.isMaximized();
    if (isMaximized) {
      this.browserWindow.unmaximize();
    } else {
      this.browserWindow.maximize();
    }
    this.updateWindowInfo();
  }

  minimize() {
    this.browserWindow.minimize();
  }

  refresh() {
    if (this.activeView) {
      this.activeView.reload();
    } else {
      this.homepage.reload();
    }
  }

  createHomepage() {
    const homepage = new AppView(this, AppURL.APP_HOME_URL);
    homepage.browserView.webContents.once('dom-ready', () => {
      setTimeout(() => {
        this.#setView(homepage);
      }, 3000);
    });
    return homepage;
  }

  showHomepage() {
    this.#setView(this.#aliveView(this.homepage));
    this.homepage.postMessageToWeb({ message: 'UPDATE_HOME_PAGE' });
  }

  resetHomepage(isShow = true) {
    if (this.homepage) {
      this.homepage.close();
    }
    this.homepage = new AppView(this, AppURL.APP_HOME_URL);
    if (isShow) {
      this.#setView(this.homepage);
    }
  }

  closeAllTabs() {
    this.showHomepage();
    this.tabsStore.forEach((view) => view.close());
  }

  closeOtherTabs(tabId: string) {
    this.tabsStore.forEach((view) => {
      if (view.id !== tabId) {
        view.close();
      } else {
        this.#setView(view);
      }
    });
  }

  closeCurrentTab() {
    if (this.activeView && this.activeView !== this.homepage) {
      this.closeTab(this.activeView.id);
    }
  }

  createNewTab(path: string, config: { title?: string }) {
    if (this.effectiveTabs.length >= 10) {
      if (AppWindow.lastFocusedWindow) {
        dialog.showMessageBox(AppWindow.lastFocusedWindow.browserWindow, {
          message: i18next.t('当前仅支持最多10个文件同时打开'),
        });
      }
      return;
    }
    return new AppView(this, path, { ...config });
  }

  postMessageToWeb<K extends keyof WebEventPayload>(data: { message: K; data?: WebEventPayload[K] }) {
    if (!this.browserWindow.isDestroyed()) {
      this.browserWindow.webContents.send('postMessage', data);
    }
  }

  toggleError(error: boolean) {
    this.postMessageToWeb({ message: 'PAGE_ERROR', data: { error } });
    if (!this.activeView) {
      return;
    }
    if (error) {
      this.browserWindow.removeBrowserView(this.activeView.browserView);
    } else {
      this.browserWindow.setBrowserView(this.activeView.browserView);
    }
  }

  toggleLoading(loading: boolean) {
    this.postMessageToWeb({ message: 'PAGE_LOADING', data: { loading } });
  }

  homeLoadUrl(url: string) {
    this.homepage.postMessageToWeb({ message: 'CHANGE_PAGE_PATH', data: url });
  }

  openNewTab() {
    if (this.homepage.isAlive) {
      this.homepage.postMessageToWeb({ message: 'newFile' });
    } else {
      this.resetHomepage(false);
      this.homepage.browserView.webContents.on('did-finish-load', () => {
        this.homepage.postMessageToWeb({ message: 'newFile' });
      });
    }
  }

  openTab(tabPath: string, title?: string) {
    const origin = tabPath.split('?')[0];
    for (const tab of this.effectiveTabs) {
      if (origin === tab.path.split('?')[0]) {
        this.showTab(tab.id);
        return;
      }
    }
    const newTab = this.createNewTab(tabPath, { title });
    if (newTab) {
      this.tabsStore.set(newTab.id, newTab);
      this.#setView(newTab);
    }
  }

  showTab(tabId: string) {
    const view = this.tabsStore.get(tabId);
    if (view) {
      this.#setView(this.#aliveView(view));
    }
  }

  showNearTab(tabId: string) {
    const tabsArray = Array.from(this.tabsStore.values());
    const index = tabsArray.findIndex((item) => item.id === tabId);
    if (index + 1 < tabsArray.length) {
      this.#setView(tabsArray[index + 1]);
    } else if (index - 1 >= 0) {
      this.#setView(tabsArray[index - 1]);
    } else {
      this.showHomepage();
    }
  }

  deleteTab(tabId: string) {
    this.tabsStore.delete(tabId);
  }

  closeTab(tabId: string) {
    const closeView = this.tabsStore.get(tabId);
    if (!closeView) {
      return;
    }

    if (this.activeView == closeView) {
      this.showNearTab(tabId);
    }

    closeView.close();
  }

  show() {
    if (this.browserWindow.isMinimized()) {
      this.browserWindow.restore();
    }
    this.browserWindow.focus();
  }

  close() {
    this.browserWindow.close();
  }

  destroy() {
    this.homepage.destroy();
    this.tabsStore.forEach((view) => view.destroy());
  }
}
