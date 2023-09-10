declare namespace NodeJS {
  interface ProcessEnv {
    /** 应用域名 */
    readonly DEFINE_APP_DOMAIN: string;

    /** API环境 */
    readonly DEFINE_APP_API_ENV: string;

    /** 打包时间 */
    readonly DEFINE_PKG_BUILD_TIME: string;

    /** 开启开发者工具 */
    readonly DEFINE_ENABLE_DEVTOOLS: boolean;

    /** 开启自动更新 */
    readonly DEFINE_ENABLE_AUTO_UPDATER: boolean;

    /** 是否内部测试版本 */
    readonly DEFINE_BUILD_EDITION: 'beta' | 'lenovo' | 'standard' | 'international' | 'privatization';
  }
}
