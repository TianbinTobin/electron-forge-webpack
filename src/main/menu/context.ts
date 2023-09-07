import { Menu } from 'electron';

import i18next from 'i18next';

import appManager from '../core/manager';
import type AppWindow from '../core/window';

function createTabContextMenuFunc(win: AppWindow, tabId: string) {
  const currentTab = win.tabsStore.get(tabId);
  return {
    openByNewWindow: () => {
      const newWin = appManager.createWindow();
      if (currentTab) {
        newWin.openTab(currentTab.browserView.webContents.getURL());
      }
      win.closeTab(tabId);
    },
    reloadCurrentTab: () => {
      if (currentTab) {
        currentTab.browserView.webContents.reload();
      }
    },
    closeCurrentTab: () => {
      win.closeTab(tabId);
    },
    closeOtherTabs: () => {
      win.closeOtherTabs(tabId);
    },
    closeAllTabs: () => {
      win.closeAllTabs();
    },
  };
}

export function createTabContextMenu(win: AppWindow, tabId: string) {
  const contextMenuFun = createTabContextMenuFunc(win, tabId);
  return Menu.buildFromTemplate([
    {
      label: i18next.t('新窗口中打开'),
      click: contextMenuFun.openByNewWindow,
    },
    {
      type: 'separator',
    },
    {
      label: i18next.t('刷新'),
      accelerator: 'Shift+F5',
      click: contextMenuFun.reloadCurrentTab,
    },
    {
      type: 'separator',
    },
    {
      label: i18next.t('关闭标签页'),
      accelerator: 'CmdOrCtrl+W',
      click: contextMenuFun.closeCurrentTab,
    },
    {
      label: i18next.t('关闭其他标签页'),
      click: contextMenuFun.closeOtherTabs,
    },
    {
      label: i18next.t('关闭所有标签页'),
      click: contextMenuFun.closeAllTabs,
    },
  ]);
}

export function createHomeContextMenu(win: AppWindow) {
  return Menu.buildFromTemplate([
    {
      label: i18next.t('刷新'),
      accelerator: 'Shift+F5',
      click() {
        win.homepage.browserView.webContents.reload();
      },
    },
  ]);
}
