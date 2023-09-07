import { Menu, MenuItem, app } from 'electron';

import i18next from 'i18next';

import { createAboutPanelOptions, createApplicationMenuItem } from './app';
import appManager from '../core/manager';
import { langList } from '../locales';
import { createDebugMenuItem } from '../menu/debug';
import { createToolsMenuItem } from '../menu/tools';
import { AppEnv } from '../utils/env';
import { sensors } from '../utils/sensors';

function createLngMenuOptionsClick(lang: string) {
  return async function (menuItem: MenuItem) {
    menuItem.checked = true;
    await i18next.changeLanguage(lang);
    appManager.getLastFocusedWindow()?.activeView?.postMessageToWeb({ message: 'setLang', data: { lang } });
  };
}

function createLngMenu() {
  return Menu.buildFromTemplate(
    langList.map((lang) => ({
      type: 'radio',
      label: i18next.getFixedT(lang)('语言'),
      checked: lang === i18next.language,
      click: createLngMenuOptionsClick(lang),
    })),
  );
}

function createLngMenuItem() {
  return new MenuItem({ label: i18next.t('切换语言'), submenu: createLngMenu() });
}

export function createApplicationMenu() {
  return createDebugMenuItem(
    Menu.buildFromTemplate([
      {
        label: i18next.t('新建文件'),
        click() {
          appManager.getLastFocusedWindow()?.openNewTab();
          sensors.track('PCTopMore', { PCTop_More: '新建文件' });
        },
      },
      {
        label: i18next.t('创建新窗口'),
        click() {
          appManager.createWindow();
          sensors.track('PCTopMore', { PCTop_More: '创建新窗口' });
        },
      },
      {
        label: i18next.t('关闭标签页'),
        click() {
          appManager.getLastFocusedWindow()?.closeCurrentTab();
          sensors.track('PCTopMore', { PCTop_More: '关闭标签页' });
        },
      },
      {
        label: i18next.t('关于boardmix'),
        click() {
          appManager.openAbout();
          sensors.track('PCTopMore', { PCTop_More: '关于boardmix' });
        },
      },
      {
        label: i18next.t('更换服务器'),
        click() {
          appManager.openPrivate();
        },
        visible: AppEnv.IS_PRIVATIZED_EDITION,
      },
      {
        label: i18next.t('环境检测'),
        click() {
          appManager.openChecker();
          sensors.track('PCTopMore', { PCTop_More: '环境检测' });
        },
        visible: AppEnv.IS_STANDARD_EDITION || AppEnv.IS_BETA_EDITION,
      },
      {
        label: i18next.t('检查更新'),
        click() {
          appManager.checkForUpdate();
          sensors.track('PCTopMore', { PCTop_More: '检查更新' });
        },
        visible: AppEnv.ENABLE_AUTO_UPDATER,
      },
      createToolsMenuItem(),
      createLngMenuItem(),
    ]),
  );
}

export function buildApplicationMenu() {
  app.setAboutPanelOptions(createAboutPanelOptions());
  Menu.setApplicationMenu(createApplicationMenuItem());
}
