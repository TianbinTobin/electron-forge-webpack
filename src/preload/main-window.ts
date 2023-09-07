import { contextBridge, ipcRenderer } from 'electron';

function invokeMainListener<K extends keyof WindowEventPayload>(channel: K, payload?: WindowEventPayload[K]) {
  ipcRenderer.send('window:' + channel, payload);
}

const appManagerAPI = {
  init() {
    invokeMainListener('on-init');
  },
  closeWindow() {
    invokeMainListener('on-close');
  },
  showTab(tabId: string) {
    invokeMainListener('show-tab', { tabId });
  },
  openNewTab() {
    invokeMainListener('open-tab');
  },
  closeTab(tabId: string) {
    invokeMainListener('close-tab', { tabId });
  },
  toggleMaximize() {
    invokeMainListener('toggle-maximize');
  },
  toggleMinimize() {
    invokeMainListener('toggle-minimize');
  },
  toggleAppRefresh() {
    invokeMainListener('toggle-refresh');
  },
  showHomepage() {
    invokeMainListener('show-homepage');
  },
  showAppMenu() {
    invokeMainListener('show-app-menu');
  },
  closeAbout() {
    invokeMainListener('close-dialog-about');
  },
  closeUpdater() {
    invokeMainListener('close-dialog-updater');
  },
  showTabContextMenu(tabId: string) {
    invokeMainListener('show-tab-context-menu', { tabId });
  },
  showHomepageContextMenu() {
    invokeMainListener('show-homepage-context-menu');
  },
  closeDialogPrivate() {
    invokeMainListener('close-dialog-private');
  },
  submitDialogPrivate(serverUrl: string) {
    invokeMainListener('submit-dialog-private', { serverUrl });
  },
  autoUpdaterRun(operate: string, data: { width: number; height: number }) {
    invokeMainListener('updater-run-operator', { operate, data });
  },
  sensorTrack<Event extends keyof SensorsTrack>(event: Event, properties: SensorsTrack[Event]) {
    invokeMainListener('send-sensor-track', { event, properties });
  },
  getServerUrl() {
    return ipcRenderer.invoke('window:get-server-url');
  },
  getSystemInfo() {
    return ipcRenderer.invoke('window:get-system-info');
  },
  getVersionInfo() {
    return ipcRenderer.invoke('window:get-version-info');
  },
  getSystemLang() {
    return ipcRenderer.invoke('window:get-system-lang');
  },
  platform: {
    isWin: process.platform === 'win32',
    isMac: process.platform === 'darwin',
    isLinux: process.platform === 'linux',
  },
};

contextBridge.exposeInMainWorld('appManagerAPI', appManagerAPI);

ipcRenderer.on('postMessage', (_event, message: { message: string; data?: unknown }) => {
  window.postMessage(message, '*');
});
