declare namespace NodeJS {
  interface ProcessEnv {
    /** 打包时间 */
    readonly DEFINE_PKG_BUILD_TIME: string;

    /** API环境 */
    readonly DEFINE_APP_API_ENV: string;

    /** 应用域名 */
    readonly DEFINE_APP_DOMAIN: string;

    /** 开启开发者工具 */
    readonly DEFINE_ENABLE_DEVTOOLS: 'enabled' | 'disabled';

    /** 开启自动更新 */
    readonly DEFINE_ENABLE_AUTO_UPDATER: 'enabled' | 'disabled';

    /** 是否内部测试版本 */
    readonly DEFINE_APP_EDITION: 'beta' | 'lenovo' | 'standard' | 'international' | 'privatization';
  }
}
