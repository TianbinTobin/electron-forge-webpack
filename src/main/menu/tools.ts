import { Menu, MenuItem, app, dialog } from 'electron';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import i18next from 'i18next';

import setting from '../setting';
import { AppEnv } from '../utils/env';
import { generateHardwareInfo } from '../utils/hardware';

function createDisableHAMenu() {
  return new MenuItem({
    type: 'checkbox',
    checked: setting.store.disableHardwareAcceleration,
    label: i18next.t('禁用硬件加速'),
    click() {
      const result = dialog.showMessageBoxSync({
        type: 'none',
        title: 'boardmix',
        message: i18next.t('重新启动以应用更改'),
        detail: i18next.t('boardmix需要重新启动以应用更改'),
        buttons: [i18next.t('重新启动'), i18next.t('取消')],
        defaultId: 0,
        cancelId: 1,
      });
      if (result) {
        return;
      }
      setting.set('disableHardwareAcceleration', !setting.store.disableHardwareAcceleration);
      app.relaunch();
      app.quit();
    },
  });
}

function createEnableVulkanMenu() {
  return new MenuItem({
    type: 'checkbox',
    checked: setting.store.enableVulkan,
    label: i18next.t('启用 Vulkan API'),
    click() {
      const result = dialog.showMessageBoxSync({
        type: 'none',
        title: 'boardmix',
        message: i18next.t('重新启动以应用更改'),
        detail: i18next.t('boardmix需要重新启动以应用更改'),
        buttons: [i18next.t('重新启动'), i18next.t('取消')],
        defaultId: 0,
        cancelId: 1,
      });
      if (result) {
        return;
      }
      setting.set('enableVulkan', !setting.store.enableVulkan);
      app.relaunch();
      app.quit();
    },
  });
}

function createHardwareInfoMenu() {
  return new MenuItem({
    type: 'normal',
    label: i18next.t('获取硬件信息'),
    click: async () => {
      const hardwareInfo = await generateHardwareInfo();
      const result = await dialog.showSaveDialog({
        title: i18next.t('获取硬件信息'),
        defaultPath: join(app.getPath('desktop'), 'boardmix-debug.html'),
      });
      if (!result.canceled && result.filePath) {
        writeFileSync(result.filePath, hardwareInfo, { encoding: 'utf8' });
      }
    },
  });
}

function createToolsMenu() {
  return Menu.buildFromTemplate([createEnableVulkanMenu(), createDisableHAMenu(), createHardwareInfoMenu()]);
}

export function createToolsMenuItem() {
  return new MenuItem({ label: i18next.t('故障排除'), submenu: createToolsMenu(), visible: !AppEnv.IS_WINDOWS_7 });
}
