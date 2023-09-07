import { contextBridge, ipcRenderer } from 'electron';

function invokeMainListener<T extends keyof ViewEventPayload>(channel: T, payload?: ViewEventPayload[T]) {
  return ipcRenderer.send('view:' + channel, payload);
}

const desktopManagerApi = {
  version: '1.0.0',
  features: {
    webviewTag: true,
    mas: Boolean(process.mas),
  },
  init() {
    invokeMainListener('on-init');
  },
  login(userInfo: UserInfo) {
    invokeMainListener('on-login', { userInfo });
  },
  logout() {
    invokeMainListener('on-logout');
  },
  closeView() {
    invokeMainListener('on-close');
  },
  setLang(lang: string) {
    invokeMainListener('set-lang', { lang });
  },
  setTitle(title: string) {
    invokeMainListener('set-title', { title });
  },
  openFile(fileKey: string, title: string, config: { query: { [key: string]: string } }) {
    invokeMainListener('open-file', { fileKey, title, config });
  },
  homePage_updateFileInfo(fileKey: string) {
    invokeMainListener('update-homepage-file', { fileKey });
  },
  initClientVersion(data: { version: string; time: string }) {
    invokeMainListener('update-client-version', data);
  },
  requestRemoteURL(url: string) {
    return ipcRenderer.invoke('view:request-remote-url', { url });
  },
  getSystemInfo() {
    return ipcRenderer.invoke('view:get-system-info');
  },
};

contextBridge.exposeInMainWorld('desktopManagerApi', desktopManagerApi);

ipcRenderer.on('postMessage', (_, message: { message: string; data?: unknown }) => {
  window.postMessage(message, '*');
});
