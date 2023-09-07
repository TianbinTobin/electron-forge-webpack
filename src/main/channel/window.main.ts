import { ipcMain } from 'electron';

import i18next from 'i18next';

import appManager from '../core/manager';
import type AppWindow from '../core/window';
import { createApplicationMenu } from '../menu';
import { createHomeContextMenu, createTabContextMenu } from '../menu/context';
import setting from '../setting';
import { platform } from '../utils';
import { WINDOW_HEADER_HEIGHT } from '../utils/config';
import { AppEnv } from '../utils/env';
import log from '../utils/logger';
import { sensors } from '../utils/sensors';
import system from '../utils/system';

const logger = log.scope('Channel::Window');

function mainAddWindowEventListener<K extends keyof WindowEventPayload>(
  channel: K,
  listener: ChannelEventCallback<AppWindow, WindowEventPayload[K]>,
) {
  ipcMain.on('window:' + channel, (event, payload) => {
    const channelWindow = appManager.getAppWindow(event.sender);
    logger.info(`[Window Event::${channelWindow?.id ?? 'Dialog'}]: `, channel);
    listener(channelWindow, payload);
  });
}

export function bindMainWindowEventListener() {
  mainAddWindowEventListener('on-init', (win) => {
    win?.updateHeaderInfo();
  });

  mainAddWindowEventListener('on-close', (win) => {
    win?.close();
  });

  mainAddWindowEventListener('open-tab', (win) => {
    win?.openNewTab();
  });

  mainAddWindowEventListener('show-tab', (win, payload) => {
    win?.showTab(payload.tabId);
    win?.activeView?.postMessageToWeb({ message: 'CHECK_PAGE_LANG' });
  });

  mainAddWindowEventListener('close-tab', (win, payload) => {
    win?.closeTab(payload.tabId);
  });

  mainAddWindowEventListener('toggle-maximize', (win) => {
    win?.toggleMaximize();
  });

  mainAddWindowEventListener('toggle-minimize', (win) => {
    win?.minimize();
  });

  mainAddWindowEventListener('toggle-refresh', (win) => {
    win?.refresh();
  });

  mainAddWindowEventListener('show-homepage', (win) => {
    win?.showHomepage();
    win?.activeView?.postMessageToWeb({ message: 'CHECK_PAGE_LANG' });
  });

  mainAddWindowEventListener('show-app-menu', (win) => {
    if (win) {
      const bounds = win.browserWindow.getContentBounds();
      const captionButtonsWidth = platform.isMac ? 40 : 160;
      const tabBarHeight = WINDOW_HEADER_HEIGHT;
      const x = bounds.width - captionButtonsWidth;
      const y = tabBarHeight;
      createApplicationMenu().popup({
        window: win.browserWindow,
        x,
        y,
        callback: () => {
          win?.postMessageToWeb({ message: 'CLEAR_HOVER', data: { hover: false } });
        },
      });
    }
  });

  mainAddWindowEventListener('show-homepage-context-menu', (win) => {
    if (win) {
      const homeContextMenu = createHomeContextMenu(win);
      homeContextMenu.popup({ window: win.browserWindow });
    }
  });

  mainAddWindowEventListener('show-tab-context-menu', (win, payload) => {
    if (win) {
      const tabContextMenu = createTabContextMenu(win, payload.tabId);
      tabContextMenu.popup({ window: win.browserWindow });
    }
  });

  mainAddWindowEventListener('close-dialog-about', () => {
    appManager.closeAbout();
  });

  mainAddWindowEventListener('close-dialog-updater', () => {
    appManager.closeUpdater();
  });

  mainAddWindowEventListener('close-dialog-private', () => {
    appManager.closePrivate();
  });

  mainAddWindowEventListener('submit-dialog-private', (_, payload) => {
    appManager.setServerUrl(payload.serverUrl);
  });

  mainAddWindowEventListener('updater-run-operator', (_, payload) => {
    logger.info('updater-run-operator ', payload);
    switch (payload.operate) {
      case 'init-updater':
        appManager.updaterDialog?.updateWebContents();
        break;
      case 'start-to-download':
        appManager.updaterDialog?.downloadUpdate();
        break;
      case 'cancel-to-download':
        appManager.updaterDialog?.cancelDownload();
        break;
      case 'restart-to-download':
        appManager.updaterDialog?.downloadUpdate();
        break;
      case 'start-to-setup':
        appManager.updaterDialog?.quitAndInstall();
        break;
      case 'reset-window-size':
        if (payload.data) {
          appManager.updaterDialog?.resetWindowSize(payload.data);
        }
        break;
      default:
        break;
    }
  });

  mainAddWindowEventListener('send-sensor-track', (_, payload) => {
    sensors.track(payload.event, payload.properties);
  });

  ipcMain.handle('window:get-server-url', () => {
    return setting.store.serverUrl;
  });

  ipcMain.handle('window:get-system-info', () => {
    return { ...system };
  });
  ipcMain.handle('window:get-version-info', () => {
    return {
      webTime: AppEnv.WEB_TIME,
      webVersion: AppEnv.WEB_VERSION,
      buildTime: AppEnv.BUILD_TIME,
      buildVersion: AppEnv.BUILD_VERSION,
    };
  });
  ipcMain.handle('window:get-system-lang', () => {
    return i18next.language;
  });
}
