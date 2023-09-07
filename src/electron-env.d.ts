declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_VIEW_PRELOAD_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

declare interface UserInfo {
  title: string;
  email: string;
  mobile: string;
  user_id: number;
  nick_name: string;
  account_id: number;
  avatar_url: string;
  department: string;
  created_at: string;
}

declare interface SensorsTrack {
  PCStart: {
    PCStart_type: '客户端启动';
    PCStart_platform: '官网' | '联想' | '苹果' | '微软';
  };
  PCExit: {
    PCExit_type: '客户端退出';
  };
  PCTopFunction: {
    PCTop_Function: '回到首页' | '最大化' | '最小化' | '展开更多' | '关闭' | '刷新页面';
  };
  PCTopMore: {
    PCTop_More: '新建文件' | '创建新窗口' | '关闭标签页' | '关于boardmix' | '环境检测' | '检查更新';
  };
}

declare interface WebEventPayload {
  newFile: void;
  setLang: { lang: string };
  updateFileInfo: { file_key: string };
  saveCoverAndCloseView: void;
  CHECK_PAGE_LANG: void;
  UPDATE_HOME_PAGE: void;
  CHANGE_PAGE_PATH: string;
  SENSORS_TRACK: { event: keyof SensorsTrack; properties: SensorsTrack[keyof SensorsTrack] };
  HEADER_INFO: { isMaximized: boolean; isFullScreen: boolean };
  TABS_SET: { isHomeActive: boolean; tabList: { id: string; path: string; title: string; isActive: boolean }[] };
  CLEAR_HOVER: { hover: boolean };
  PAGE_LOADING: { loading: boolean };
  PAGE_ERROR: { error: boolean };
}

declare interface ViewEventPayload {
  'on-init': void;
  'on-close': void;
  'on-login': { userInfo: UserInfo };
  'on-logout': void;
  'set-lang': { lang: string };
  'set-title': { title: string };
  'open-file': { fileKey: string; title: string; config: { query: { [key: string]: string } } };
  'update-homepage-file': { fileKey: string };
  'update-client-version': { version: string; time: string };
  'get-system-info': void;
}

declare interface WindowEventPayload {
  'on-init': void;
  'on-close': void;
  'open-tab': void;
  'show-tab': { tabId: string };
  'close-tab': { tabId: string };
  'toggle-maximize': void;
  'toggle-minimize': void;
  'toggle-refresh': void;
  'show-homepage': void;
  'show-app-menu': void;
  'show-tab-context-menu': { tabId: string };
  'show-homepage-context-menu': void;
  'close-dialog-about': void;
  'close-dialog-updater': void;
  'close-dialog-private': void;
  'submit-dialog-private': { serverUrl: string };
  'updater-run-operator': { operate: string; data?: { width: number; height: number } };
  'send-sensor-track': { event: keyof SensorsTrack; properties: SensorsTrack[keyof SensorsTrack] };
}

declare type ChannelEventCallback<T, K> = (win: T | null, payload: K) => void;
