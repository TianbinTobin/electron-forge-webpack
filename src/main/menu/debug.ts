import { Menu, MenuItem } from 'electron';

import i18next from 'i18next';

import appManager from '../core/manager';
import { AppEnv } from '../utils/env';

function createEnvMenuOptionsClick(appEnv: string) {
  return function (menuItem: MenuItem) {
    menuItem.checked = true;
    AppEnv.setAppEnv(appEnv);
    appManager.resetBasePath(AppEnv.BASE_URL);
  };
}

const envList = ['local', 'dev', 'test', 'tmp', 'pre', 'prod', 'hotfix'];

function createEnvMenu() {
  return Menu.buildFromTemplate(
    envList.map((envItem) => ({
      type: 'radio',
      label: envItem,
      checked: envItem === AppEnv.APP_ENV,
      click: createEnvMenuOptionsClick(envItem),
    })),
  );
}

function createEnvMenuItem() {
  return new MenuItem({ label: i18next.t('切换环境'), submenu: createEnvMenu() });
}

function createDevtoolsMenuItem() {
  return new MenuItem({
    label: i18next.t('开发者工具'),
    click() {
      appManager.openAllDevtools();
    },
  });
}

function createCrashTestMenuItem() {
  return new MenuItem({
    label: i18next.t('崩溃测试', { env: AppEnv.APP_ENV }),
    click() {
      process.crash();
    },
  });
}

function createDebuggerMenuItem() {
  return new MenuItem({
    label: i18next.t('开发调试工具'),
    submenu: Menu.buildFromTemplate([createDevtoolsMenuItem(), createEnvMenuItem()]),
  });
}

function createSeparatorMenuItem() {
  return new MenuItem({ type: 'separator' });
}

export function createDebugMenuItem(menu: Menu) {
  if (AppEnv.ENABLE_DEVTOOLS) {
    menu.append(createSeparatorMenuItem());
    menu.append(createDebuggerMenuItem());
    menu.append(createCrashTestMenuItem());
  }
  return menu;
}
