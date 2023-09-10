import setting from '../setting';
import system from '../utils/system';

class GlobalAppEnv {
  #WEB_TIME = '';
  #WEB_VERSION = '';

  #APP_API_ENV = process.env.DEFINE_APP_API_ENV || (process.env.ENV_MODE === 'development' ? 'dev' : 'prod');

  get APP_ENV() {
    return this.#APP_API_ENV;
  }
  get WEB_TIME() {
    return this.#WEB_TIME;
  }
  get WEB_VERSION() {
    return this.#WEB_VERSION;
  }
  get BUILD_TIME() {
    return process.env.DEFINE_PKG_BUILD_TIME;
  }
  get BUILD_VERSION() {
    return system.appVersion;
  }
  get BASE_URL() {
    return this.#getBaseURL(this.APP_ENV);
  }
  get BASE_DOMAIN() {
    return process.env.DEFINE_APP_DOMAIN;
  }
  get IS_WINDOWS_7() {
    return system.osPlatform === 'win32' && system.osRelease.startsWith('6.1');
  }
  /** 是否开启开发者工具 */
  get ENABLE_DEVTOOLS() {
    return process.env.DEFINE_ENABLE_DEVTOOLS;
  }
  /** 是否开启自动更新 */
  get ENABLE_AUTO_UPDATER() {
    return process.env.DEFINE_ENABLE_AUTO_UPDATER && !process.mas && !process.windowsStore;
  }
  /** 版本代码 */
  get APP_EDITION_CODE() {
    return process.env.DEFINE_BUILD_EDITION;
  }
  /** 是否内部测试版本 */
  get IS_BETA_EDITION() {
    return process.env.DEFINE_BUILD_EDITION === 'beta';
  }
  /** 是否联想应用版本 */
  get IS_LENOVO_EDITION() {
    return process.env.DEFINE_BUILD_EDITION === 'lenovo';
  }
  /** 是否标准版本 */
  get IS_STANDARD_EDITION() {
    return process.env.DEFINE_BUILD_EDITION === 'standard';
  }
  /** 是否国际版 */
  get IS_INTERNATIONAL_EDITION() {
    return process.env.DEFINE_BUILD_EDITION === 'international';
  }
  /** 是否私有化版本 */
  get IS_PRIVATIZATION_EDITION() {
    return process.env.DEFINE_BUILD_EDITION === 'privatization';
  }

  get PLATFORM_NAME() {
    if (this.IS_LENOVO_EDITION) {
      return '联想';
    } else if (process.mas) {
      return '苹果';
    } else if (process.windowsStore) {
      return '微软';
    }
    return '官网';
  }

  get UPDATER_BASE_URL() {
    const channel = this.IS_LENOVO_EDITION ? 'lenovo' : 'bosyun';
    return `${this.BASE_URL}/api/upgrade/desktop/${channel}/`;
  }

  setAppEnv(appEnv: string) {
    this.#APP_API_ENV = appEnv;
  }
  setBoardVersion(data: { version: string; time: string }) {
    this.#WEB_TIME = data.time;
    this.#WEB_VERSION = data.version;
  }
  #getBaseURL(appEnv: string) {
    if (this.IS_PRIVATIZATION_EDITION) {
      return setting.store.serverUrl;
    }
    switch (appEnv) {
      case 'prod':
        return `https://${this.BASE_DOMAIN}`;
      case 'local':
        return 'http://localhost:3000';
      default:
        return `https://${appEnv}.${this.BASE_DOMAIN}`;
    }
  }
}

export const AppEnv = new GlobalAppEnv();
