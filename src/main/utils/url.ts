import { AppEnv } from '../utils/env';

export const ROOT_PATH = {
  renderer: MAIN_WINDOW_WEBPACK_ENTRY,
  preloadView: MAIN_VIEW_PRELOAD_WEBPACK_ENTRY,
  preloadWindow: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
};

export const MainWindow = {
  ABOUT: `${ROOT_PATH.renderer}#/about`,
  HEADER: `${ROOT_PATH.renderer}#/header`,
  UPDATER: `${ROOT_PATH.renderer}#/updater`,
  PRIVATE: `${ROOT_PATH.renderer}#/private`,
};

export const updaterURL = {
  beta: {
    channel: 'beta',
    url: 'http://10.90.10.11:9000/release',
  },
  lenovo: {
    channel: 'latest',
    url: 'https://boardmix-public.oss-cn-hangzhou.aliyuncs.com/cms/download/lenovo/',
  },
  standard: {
    channel: 'latest',
    url: 'https://boardmix-public.oss-cn-hangzhou.aliyuncs.com/cms/download/package',
  },
  privatization: {
    channel: 'latest',
    url: 'https://boardmix-public.oss-cn-hangzhou.aliyuncs.com/cms/download/package',
  },
  international: {
    channel: 'latest',
    url: 'https://boardmix-public-ff.oss-eu-central-1.aliyuncs.com/cms/package/',
  },
};

class GlobalAppURL {
  get APP_URL() {
    return `${AppEnv.BASE_URL}/app/`;
  }
  get APP_HOME_URL() {
    return `${AppEnv.BASE_URL}/app/my-space`;
  }
  get ROOT_RENDER_URL() {
    return ROOT_PATH.renderer;
  }
  get COMMUNITY_URL() {
    return `${AppEnv.BASE_URL}/community/`;
  }
  get AUTO_CHECK_ENV_URL() {
    return `https://${AppEnv.BASE_DOMAIN}/env-check/`;
  }
  get API_CRASH_REPORTER_URL() {
    return `${AppEnv.BASE_URL}/api/web/report/client-crash`;
  }
}

export const AppURL = new GlobalAppURL();
