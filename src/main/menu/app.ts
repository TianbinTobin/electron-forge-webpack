import { Menu, MenuItem, app } from 'electron';

import i18next from 'i18next';

import appManager from '../core/manager';
import system from '../utils/system';

function createFileMenuItem() {
  return new MenuItem({
    label: i18next.t('文件'),
    submenu: [
      {
        label: i18next.t('新建窗口'),
        accelerator: 'CmdOrCtrl+Shift+N',
        click() {
          appManager.createWindow();
        },
      },
      {
        label: i18next.t('新建文件'),
        accelerator: 'CmdOrCtrl+N',
        click() {
          appManager.getLastFocusedWindow()?.openNewTab();
        },
      },
      {
        role: 'cut',
        label: i18next.t('剪切'),
      },
      {
        role: 'copy',
        label: i18next.t('复制'),
      },
      {
        role: 'paste',
        label: i18next.t('粘贴'),
      },
      {
        label: i18next.t('关闭文件'),
        accelerator: 'CmdOrCtrl+W',
        click() {
          const tabId = appManager.getLastFocusedWindow()?.activeView?.id;
          if (!tabId || tabId == appManager.getLastFocusedWindow()?.homepage.id) {
            return;
          }
          appManager.getLastFocusedWindow()?.closeTab(tabId);
        },
      },
      {
        label: i18next.t('回到首页'),
        accelerator: 'CmdOrCtrl+O',
        click() {
          appManager.getLastFocusedWindow()?.showHomepage();
        },
      },
    ],
  });
}

function createAboutMenuItem() {
  return new MenuItem({
    label: app.name,
    submenu: [
      {
        role: 'about',
        label: i18next.t('关于boardmix'),
      },
      {
        role: 'minimize',
        label: i18next.t('最小化'),
      },
      {
        role: 'quit',
        label: i18next.t('退出程序'),
      },
    ],
  });
}

function createDevMenuItem() {
  return new MenuItem({
    label: '工具',
    submenu: [
      {
        label: '子窗口DevTools',
        accelerator: 'CmdOrCtrl+Alt+F12',
        click() {
          appManager.openAllDialogDevtools();
        },
      },
      {
        label: '当前窗口DevTools',
        accelerator: 'CmdOrCtrl+F12',
        click() {
          appManager.openLastFocusDevtools();
        },
      },
    ],
    visible: !process.mas,
  });
}

export function createAboutPanelOptions() {
  return {
    applicationName: 'boardmix',
    applicationVersion: `    Electron: ${process.versions.electron}\n
    Node.JS: ${process.versions.node}\n
    Chromium: ${process.versions.chrome}\n
    V8: ${process.versions.v8}\n
    OS: ${system.osPlatform} ${system.osArch} ${system.osRelease}\n
    Version: `,
    version: app.getVersion(),
    copyright: i18next.t('版权信息'),
  };
}

export function createApplicationMenuItem() {
  return Menu.buildFromTemplate([createAboutMenuItem(), createFileMenuItem(), createDevMenuItem()]);
}
