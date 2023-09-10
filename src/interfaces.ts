export interface UserInfo {
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

export interface VersionInfo {
  webTime: number;
  webVersion: string;
  buildTime: number;
  buildVersion: string;
}

export interface SystemInfo {
  appName: string;
  v8Version: string;
  appVersion: string;
  nodeVersion: string;
  electronVersion: string;
  chromiumVersion: string;
  osArch: string;
  osRelease: string;
  osPlatform: string;
}

export interface SensorsTrack {
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

export enum ModalType {
  ABOUT,
  CHECK,
  UPDATE,
  PRIVATE,
}

export type BoardEvent =
  | 'clear-window-hover'
  | 'catch-window-error'
  | 'update-window-tabs'
  | 'update-window-loading'
  | 'update-window-maximized'
  | 'update-window-fullscreen';
