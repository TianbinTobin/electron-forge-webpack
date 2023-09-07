import { BrowserWindow } from 'electron';
import type { BrowserWindowConstructorOptions } from 'electron';

import { openExternalBrowser, uniqueID } from '../utils';
import { defaultDialogBrowserWindowOptions } from '../utils/config';
import log from '../utils/logger';

const logger = log.scope('Dialog::Base');

class BaseDialog {
  constructor(options?: BrowserWindowConstructorOptions) {
    this.browserWindow = new BrowserWindow({
      ...defaultDialogBrowserWindowOptions,
      ...options,
    });
    this.id = uniqueID();
    this.initBaseBrowserWindow();
    logger.info('New Dialog Created');
  }

  id: string;
  browserWindow: BrowserWindow;

  initBaseBrowserWindow() {
    this.browserWindow.on('ready-to-show', () => {
      this.onReadyToShow();
      this.browserWindow.show();
    });
    this.browserWindow.on('show', () => {
      this.onShow();
    });
    this.browserWindow.on('closed', () => {
      this.onClosed();
    });
    this.browserWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:')) {
        openExternalBrowser(url);
      }
      return { action: 'deny' };
    });
  }

  onReadyToShow() {
    logger.info('ready-to-show');
  }

  onShow() {
    logger.info('show');
  }

  onClosed() {
    logger.info('closed');
  }

  show() {
    this.browserWindow.show();
  }

  close() {
    this.browserWindow.close();
  }

  destroy() {
    this.browserWindow.destroy();
  }

  openDevTools() {
    this.browserWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

export default BaseDialog;
