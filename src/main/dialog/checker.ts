import BaseDialog from './base';
import appManager from '../core/manager';
import log from '../utils/logger';
import { AppURL } from '../utils/url';

const logger = log.scope('Dialog::Checker');

class CheckerDialog extends BaseDialog {
  constructor() {
    super({ width: 900, height: 770, frame: true, backgroundColor: '#ffffff' });
    this.browserWindow.setMenu(null);
    this.browserWindow.loadURL(AppURL.AUTO_CHECK_ENV_URL);
  }

  onReadyToShow() {
    logger.info('ready-to-show');
  }

  onShow() {
    logger.info('show');
  }

  onClosed() {
    logger.info('closed');
    appManager.closeChecker();
  }
}

export default CheckerDialog;
