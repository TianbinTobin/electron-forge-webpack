import { app } from 'electron';
import type { BrowserViewConstructorOptions, BrowserWindowConstructorOptions } from 'electron';

import { ROOT_PATH } from '../utils/url';

export const defaultBrowserWindowOptions: BrowserWindowConstructorOptions = {
  title: app.getName(),
  width: 1400,
  height: 900,
  minWidth: 1000,
  minHeight: 600,
  show: false,
  frame: false,
  titleBarStyle: 'hiddenInset',
  webPreferences: {
    sandbox: false,
    nodeIntegration: true,
    nodeIntegrationInWorker: true,
    contextIsolation: false,
    preload: ROOT_PATH.preloadWindow,
  },
};

export const defaultBrowserViewOptions: BrowserViewConstructorOptions = {
  webPreferences: {
    sandbox: false,
    webviewTag: true,
    webSecurity: false,
    nodeIntegration: false,
    contextIsolation: true,
    preload: ROOT_PATH.preloadView,
  },
};

export const defaultDialogBrowserWindowOptions: BrowserWindowConstructorOptions = {
  show: false,
  frame: false,
  resizable: false,
  fullscreen: false,
  transparent: false,
  backgroundColor: '#00000000',
  webPreferences: {
    sandbox: false,
    nodeIntegration: true,
    nodeIntegrationInWorker: true,
    contextIsolation: false,
    preload: ROOT_PATH.preloadWindow,
  },
};

export const WINDOW_HEADER_HEIGHT = 40;

// https://source.chromium.org/chromium/chromium/src/+/main:net/base/net_error_list.h
export const enum NetErrorCode {
  IO_PENDING = -1,
  FAILED = -2,
  ABORTED = -3,
}
