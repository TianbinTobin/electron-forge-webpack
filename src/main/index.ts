import { app, crashReporter, session } from 'electron';

import { bindMainViewEventListener } from './channel/view.main';
import { bindMainWindowEventListener } from './channel/window.main';
import appManager from './core/manager';
import { initLocales } from './locales';
import { buildApplicationMenu } from './menu';
import * as power from './power';
import setting from './setting';
import { catchError } from './utils/catch';
import { AppEnv } from './utils/env';
import log from './utils/logger';
import { shouldQuit } from './utils/squirrel';
import system from './utils/system';
import { AppURL } from './utils/url';

let argv: string[] = [];

// Log file location:
// MacOS: ~/Library/Logs/{app name}/{process type}.log
// Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
// levels: error, warn, info, verbose, debug, silly... Set false to disable logging.
const logger = log.scope('Index');

if (!process.mas) {
  // 处理崩溃日志
  const crashReportConfig = {
    rateLimit: !AppEnv.ENABLE_DEVTOOLS,
    submitURL: AppURL.API_CRASH_REPORTER_URL,
  };
  crashReporter.start(crashReportConfig);
  logger.info('CrashReporter: ', crashReportConfig);
}

async function onReady() {
  logger.info('[app event]: ready');

  // 初始化主线程事件
  bindMainViewEventListener();
  bindMainWindowEventListener();

  try {
    logger.info('[Session::clearHostResolverCache]');
    await session.defaultSession.clearHostResolverCache();
    await initLocales();
    // 初始化应用菜单
    buildApplicationMenu();
  } catch (error) {
    logger.error('[Session::clearHostResolverCache]: ', error);
  } finally {
    if (AppEnv.IS_PRIVATIZATION_EDITION && !setting.store.serverUrl) {
      appManager.openPrivate();
    } else {
      // 创建窗口
      appManager.createWindow();

      if (AppEnv.ENABLE_AUTO_UPDATER && !AppEnv.IS_WINDOWS_7) {
        // 初始化自动更新
        appManager.firstAutoUpdate();
      }
    }
  }
}

function main(argv_in: string[]) {
  argv = argv_in;

  logger.info(`App v${app.getVersion()} starting...`, argv);
  logger.info(`Operating System Release: ${system.osPlatform}-${system.osArch}-${system.osRelease}`);

  // Handle creating/removing shortcuts on Windows when
  // installing/uninstalling.
  if (shouldQuit()) {
    return;
  }

  // catch Error
  catchError();

  // 电源模式优化
  power.init();

  app.commandLine.appendSwitch('ignore-gpu-blocklist', 'true');
  app.disableDomainBlockingFor3DAPIs();

  // Electron 在部分windows7上运行黑屏或者不显示
  // Disable GPU Acceleration for Windows 7
  if (AppEnv.IS_WINDOWS_7) {
    app.disableHardwareAcceleration();
    logger.warn('DisableHardwareAcceleration');
  } else {
    if (setting.store.disableHardwareAcceleration) {
      app.disableHardwareAcceleration();
      logger.warn('DisableHardwareAcceleration');
    }
    // 启用Vulkan
    if (setting.store.enableVulkan) {
      logger.warn('use-vulkan');
      app.commandLine.appendSwitch('--use-vulkan');
    }
  }

  if (AppEnv.ENABLE_DEVTOOLS) {
    logger.info('disable-http-cache');
    app.commandLine.appendSwitch('disable-http-cache');
  }
  // 设置语言
  if (setting.store.language) {
    app.commandLine.appendSwitch('lang', setting.store.language);
  }

  // Set application name for Windows 10+ notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId(app.getName());
    logger.info(`SetAppUserModelId: ${app.getName()}`);
  }

  if (!process.mas) {
    logger.info('requestSingleInstanceLock');
    if (!app.requestSingleInstanceLock()) {
      logger.warn('requestSingleInstanceLock failed, app will quit.');
      app.quit();
      process.exit(0);
    }
  }

  app.whenReady().then(onReady);

  app.on('second-instance', () => {
    logger.info('[app event]: second-instance');
    appManager.getLastFocusedWindow()?.show();
  });

  app.on('window-all-closed', () => {
    logger.info('[app event]: window-all-closed');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    logger.info('[app event]: activate');
    if (appManager.allWindows.length) {
      appManager.getLastFocusedWindow()?.show();
    } else {
      appManager.createWindow();
    }
  });
}

// only call main() if this is the main module
main(process.argv);
