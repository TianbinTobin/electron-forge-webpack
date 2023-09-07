import BaseDialog from './base';
import log from '../utils/logger';
import { MainWindow } from '../utils/url';

const logger = log.scope('Dialog::Private');

class PrivateDialog extends BaseDialog {
  constructor() {
    super({ width: 400, height: 226, transparent: true });
    this.browserWindow.setMenu(null);
    this.browserWindow.loadURL(MainWindow.PRIVATE);
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
}

export default PrivateDialog;
