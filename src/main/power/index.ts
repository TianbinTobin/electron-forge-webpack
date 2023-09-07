import { powerMonitor, powerSaveBlocker } from 'electron';

import appManager from '../core/manager';
import log from '../utils/logger';

const logger = log.scope('Power');

let appPowerBlocker = 0;

function onResume() {
  logger.info('resume');
}

function onSuspend() {
  logger.info('suspend');
  appManager.getLastFocusedWindow()?.focus();
}

function onPowerAC() {
  logger.info('on-ac');
  startPowerSaveBlocker();
}

function onPowerBattery() {
  logger.info('on-batter');
  stopPowerSaveBlocker();
}

function startPowerSaveBlocker() {
  if (!powerSaveBlocker.isStarted(appPowerBlocker)) {
    logger.info('阻止系统休眠');
    appPowerBlocker = powerSaveBlocker.start('prevent-app-suspension');
  }
}

function stopPowerSaveBlocker() {
  if (powerSaveBlocker.isStarted(appPowerBlocker)) {
    logger.info('取消阻止系统休眠');
    powerSaveBlocker.stop(appPowerBlocker);
  }
}

export function init() {
  powerMonitor.on('resume', onResume);
  powerMonitor.on('suspend', onSuspend);
  powerMonitor.on('on-ac', onPowerAC);
  powerMonitor.on('on-battery', onPowerBattery);

  if (!powerMonitor.isOnBatteryPower()) {
    startPowerSaveBlocker();
  }
}
