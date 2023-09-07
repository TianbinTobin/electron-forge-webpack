import type { BrowserWindow } from 'electron';
import { app, autoUpdater } from 'electron';

import BaseDialog from './base';
import appManager from '../core/manager';
import { delay } from '../utils';
import { AppEnv } from '../utils/env';
import log from '../utils/logger';
import { MainWindow, updaterURL } from '../utils/url';

const logger = log.scope('Dialog::Updater');

const enum UpdaterStatus {
  None,
  Checking,
  IsLatest,
  NeedUpdate,
  Downloading,
  Downloaded,
  DownloadFailed,
}

let status = UpdaterStatus.None;
// let hasDownloaded = false;
let hasInitialized = false;
// let updateInfo: UpdateInfo | null = null;
// const progressInfo: ProgressInfo | null = null;
let browserWindow: BrowserWindow | null = null;
// let updateCheckResult: UpdateCheckResult | null = null;

function updateAvailable() {
  // if (hasDownloaded && updateInfo && updateInfo.version === value.version) {
  //   status = UpdaterStatus.Downloaded;
  // } else {
  //   updateInfo = value;
  //   status = UpdaterStatus.NeedUpdate;
  // }
  status = UpdaterStatus.NeedUpdate;
}

function updateWebContents() {
  if (!browserWindow || browserWindow.webContents.isDestroyed()) {
    return;
  }
  logger.info('Update WebContents', 'status:', status);
  browserWindow.webContents.send('postMessage', {
    message: 'update-for-client',
    data: { status },
  });
}

async function firstAutoUpdate() {
  if (hasInitialized) {
    return;
  }

  if (!app.isPackaged) {
    return;
  }

  await delay(3000);
  await autoUpdater.checkForUpdates();
  logger.info('firstAutoUpdate');

  hasInitialized = true;
}

function initAutoUpdater() {
  const config = updaterURL[AppEnv.APP_EDITION_CODE];
  if (config && AppEnv.UPDATER_BASE_URL) {
    config.url = AppEnv.UPDATER_BASE_URL;
    logger.info('setFeedURL', config.channel, config.url);
    autoUpdater.setFeedURL({ url: config.url });
  }
  // 检查更新错误
  autoUpdater.on('error', () => {
    status = UpdaterStatus.DownloadFailed;
    updateWebContents();
  });
  // 正在检查更新
  autoUpdater.on('checking-for-update', () => {
    status = UpdaterStatus.Checking;
    updateWebContents();
  });
  // 有新的可用更新
  autoUpdater.on('update-available', async () => {
    appManager.openUpdater();
    updateAvailable();
    updateWebContents();
  });
  // 没有可用的更新
  autoUpdater.on('update-not-available', () => {
    // updateInfo = data;
    status = UpdaterStatus.IsLatest;
    updateWebContents();
  });
  // 正在下载更新
  // autoUpdater.on('download-progress', (data: ProgressInfo) => {
  //   logger.info('download-progress', data.percent + '%');
  //   progressInfo = data;
  //   status = UpdaterStatus.Downloading;
  //   updateWebContents();
  // });
  // 安装包下载完成
  autoUpdater.on('update-downloaded', () => {
    // updateInfo = data;
    // hasDownloaded = true;
    status = UpdaterStatus.Downloaded;
    updateWebContents();
  });
  // 取消更新
  // autoUpdater.on('update-cancelled', async () => {
  //   status = UpdaterStatus.None;
  //   updateWebContents();
  //   updateCheckResult = await autoUpdater.checkForUpdates();
  // });
}

class UpdaterDialog extends BaseDialog {
  constructor() {
    super({ width: 480, height: 298 });
    browserWindow = this.browserWindow;
    this.browserWindow.loadURL(MainWindow.UPDATER);
  }

  static firstAutoUpdate() {
    initAutoUpdater();
    firstAutoUpdate();
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

  updateWebContents() {
    updateWebContents();
  }

  async checkForUpdate() {
    await autoUpdater.checkForUpdates();
    logger.info('checkForUpdates');
  }

  cancelDownload() {
    // if (updateCheckResult) {
    //   logger.info('cancelDownload');
    //   updateCheckResult.cancellationToken?.cancel();
    // }
  }

  downloadUpdate() {
    status = UpdaterStatus.Downloading;
    this.updateWebContents();
    logger.info('downloadUpdate');
    // autoUpdater.downloadUpdate(updateCheckResult?.cancellationToken);
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall();
  }

  resetWindowSize(data: { width: number; height: number }) {
    this.browserWindow.setSize(data.width, data.height);
  }
}

export default UpdaterDialog;
