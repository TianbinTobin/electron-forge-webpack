import type { WebContents } from 'electron';
import { app } from 'electron';

import AppWindow from './window';
import AboutDialog from '../dialog/about';
import type BaseDialog from '../dialog/base';
import CheckerDialog from '../dialog/checker';
import PrivateDialog from '../dialog/private';
import UpdaterDialog from '../dialog/updater';
import setting from '../setting';
import { removeAllCookie } from '../utils/cookie';
import { AppEnv } from '../utils/env';
import log from '../utils/logger';
import { sensors } from '../utils/sensors';

const logger = log.scope('Core::AppManager');

class AppManager {
  constructor() {
    this.#windows = new Map();
    this.#dialogs = new Map();
  }

  #windows: Map<string, AppWindow>;
  #dialogs: Map<string, BaseDialog>;

  aboutDialog?: AboutDialog;
  checkerDialog?: CheckerDialog;
  updaterDialog?: UpdaterDialog;
  privateDialog?: PrivateDialog;

  get allWindows() {
    return Array.from(this.#windows.values());
  }

  createWindow() {
    const win = new AppWindow();
    this.#windows.set(win.id, win);
    return win;
  }

  deleteWindow(win: AppWindow) {
    this.#windows.delete(win.id);
  }

  getLastFocusedWindow() {
    if (AppWindow.lastFocusedWindow) {
      return AppWindow.lastFocusedWindow;
    }
    return null;
  }

  getAppWindow(webContent: WebContents) {
    for (const win of this.#windows.values()) {
      if (win.browserWindow.webContents.id === webContent.id) {
        return win;
      }
    }
    return null;
  }

  getAppView(webContent: WebContents) {
    for (const win of this.#windows.values()) {
      if (win.homepage.browserView.webContents.id === webContent.id) {
        return win.homepage;
      }
      for (const view of win.tabsStore.values()) {
        if (view.browserView.webContents.id === webContent.id) {
          return view;
        }
      }
    }
    return null;
  }

  onAfterAppStart() {
    if (this.allWindows.length === 1) {
      sensors.track('PCStart', { PCStart_type: '客户端启动', PCStart_platform: AppEnv.PLATFORM_NAME });
    }
  }

  onAfterAppExit() {
    if (this.allWindows.length === 0) {
      sensors.track('PCExit', { PCExit_type: '客户端退出' });
    }
  }

  openAbout() {
    if (!this.aboutDialog) {
      this.aboutDialog = new AboutDialog();
      this.#dialogs.set(this.aboutDialog.id, this.aboutDialog);
    } else {
      this.aboutDialog.show();
    }
  }

  closeAbout() {
    if (this.aboutDialog) {
      this.#dialogs.delete(this.aboutDialog.id);
      this.aboutDialog.close();
      this.aboutDialog = undefined;
    }
  }

  openChecker() {
    if (!this.checkerDialog) {
      this.checkerDialog = new CheckerDialog();
      this.#dialogs.set(this.checkerDialog.id, this.checkerDialog);
    } else {
      this.checkerDialog.show();
    }
  }

  closeChecker() {
    if (this.checkerDialog) {
      this.#dialogs.delete(this.checkerDialog.id);
      this.checkerDialog = undefined;
    }
  }

  openUpdater() {
    logger.info('Open Updater');
    if (!this.updaterDialog) {
      this.updaterDialog = new UpdaterDialog();
      this.#dialogs.set(this.updaterDialog.id, this.updaterDialog);
    } else {
      this.updaterDialog.show();
    }
  }

  closeUpdater() {
    if (this.updaterDialog) {
      this.#dialogs.delete(this.updaterDialog.id);
      this.updaterDialog.close();
      this.updaterDialog = undefined;
    }
  }

  openPrivate() {
    logger.info('Open Private');
    if (!this.privateDialog) {
      this.privateDialog = new PrivateDialog();
      this.#dialogs.set(this.privateDialog.id, this.privateDialog);
    } else {
      this.privateDialog.show();
    }
  }

  closePrivate() {
    if (this.privateDialog) {
      this.#dialogs.delete(this.privateDialog.id);
      this.privateDialog.close();
      this.privateDialog = undefined;
    }
  }

  setServerUrl(url: string) {
    setting.set('serverUrl', url);
    app.relaunch();
    app.quit();
  }

  firstAutoUpdate() {
    UpdaterDialog.firstAutoUpdate();
  }

  async checkForUpdate() {
    this.openUpdater();
    this.updaterDialog?.checkForUpdate();
  }

  logout() {
    removeAllCookie(AppEnv.BASE_URL);
    for (const win of this.#windows.values()) {
      if (win !== this.getLastFocusedWindow()) {
        win.close();
      } else {
        win.closeAllTabs();
        win.resetHomepage();
      }
    }
  }

  openAllDevtools() {
    for (const win of this.#windows.values()) {
      win.browserWindow.webContents.openDevTools({ mode: 'detach' });
      win.activeView?.browserView.webContents.openDevTools({ mode: 'detach' });
    }
    this.openAllDialogDevtools();
  }

  openAllDialogDevtools() {
    for (const dialog of this.#dialogs.values()) {
      dialog.openDevTools();
    }
    this.getLastFocusedWindow()?.browserWindow.webContents.openDevTools({ mode: 'detach' });
  }

  openLastFocusDevtools() {
    this.getLastFocusedWindow()?.activeView?.browserView.webContents.openDevTools({ mode: 'detach' });
  }

  resetBasePath(basePath: string) {
    for (const win of this.#windows.values()) {
      win.homepage.reloadURL(basePath);
      for (const tabView of win.effectiveTabs) {
        tabView.reloadURL(basePath);
      }
    }
  }
}

const appManager = new AppManager();

export default appManager;
