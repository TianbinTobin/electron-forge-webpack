import BaseDialog from './base';
import log from '../utils/logger';
import { MainWindow } from '../utils/url';

const logger = log.scope('Dialog::About');

class AboutDialog extends BaseDialog {
  constructor() {
    super({ width: 720, height: 440 });
    this.browserWindow.loadURL(MainWindow.ABOUT);
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

export default AboutDialog;
