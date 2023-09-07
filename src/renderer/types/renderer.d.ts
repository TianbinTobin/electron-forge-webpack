interface AppManagerAPI {
  init: () => void;
  closeAbout: () => void;
  closeUpdater: () => void;
  closeWindow: () => void;
  openNewTab: () => void;
  showTab: (tab_id: string) => void;
  closeTab: (tab_id: string) => void;
  toggleMaximize: () => void;
  toggleMinimize: () => void;
  toggleAppRefresh: () => void;
  showAppMenu: () => void;
  showHomepage: () => void;
  showTabContextMenu: (tab_id: string) => void;
  showHomepageContextMenu: () => void;
  closeDialogPrivate: () => void;
  submitDialogPrivate: (serverUrl: string) => void;
  autoUpdaterRun: (operate: string, data?: unknown) => void;
  sensorTrack: <Event extends keyof SensorsTrack>(event: Event, properties: SensorsTrack[Event]) => void;
  getServerUrl: () => Promise<string>;
  getSystemLang: () => Promise<string>;
  getSystemInfo: () => Promise<SystemInfo>;
  getVersionInfo: () => Promise<VersionInfo>;
  platform: { isWin: boolean; isMac: boolean; isLinux: boolean };
}

type Obj = Record<string, unknown> | unknown[];

interface Sensors {
  track: <Event extends keyof SensorsTrack>(event: Event, properties: SensorsTrack[Event]) => void;
  init: (properties: Obj) => void;
  quick: (type: string) => void;
  login: (userId: number) => void;
  logout: (clearDeviceId?: boolean) => void;
  setProfile: (properties: Obj) => void;
  registerPage: (properties: Obj) => void;
}

interface VersionInfo {
  webTime: number;
  webVersion: string;
  buildTime: number;
  buildVersion: string;
}

interface SystemInfo {
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

declare global {
  const appManagerAPI: AppManagerAPI;

  interface Window {
    sensors: Sensors;
    sensorsDataAnalytic201505: Sensors;
    appManagerAPI: AppManagerAPI;
  }

  interface TabInfo {
    id: string;
    path: string;
    title: string;
    isActive: boolean;
  }

  interface MessageToWeb {
    message: string;
    data?: Record<string, unknown>;
  }
}

export {};
