import { IpcRendererEvent, ipcRenderer } from 'electron';

import { BoardEvent } from '../interfaces';
import { IpcEvents, WEB_CONTENTS_READY_FOR_IPC_SIGNAL } from '../ipc-events';

const channelMapping: Record<BoardEvent, IpcEvents> = {
  'clear-window-hover': IpcEvents.CLEAR_WINDOW_HOVER,
  'catch-window-error': IpcEvents.CATCH_WINDOW_ERROR,
  'update-window-tabs': IpcEvents.UPDATE_WINDOW_TABS,
  'update-window-loading': IpcEvents.UPDATE_WINDOW_LOADING,
  'update-window-maximized': IpcEvents.UPDATE_WINDOW_MAXIMIZED,
  'update-window-fullscreen': IpcEvents.UPDATE_WINDOW_FULLSCREEN,
} as const;

export function setupBoardMixGlobal() {
  window.BoardGlobal = {
    platform: process.platform,
    addEventListener(type: BoardEvent, listener: (...args: any[]) => void, options?: { signal: AbortSignal }) {
      const channel = channelMapping[type];
      if (channel) {
        const ipcListener = (_event: IpcRendererEvent, ...args: any[]) => {
          listener(...args);
        };
        ipcRenderer.on(channel, ipcListener);
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            ipcRenderer.off(channel, ipcListener);
          });
        }
      }
    },
    sendReady() {
      ipcRenderer.send(WEB_CONTENTS_READY_FOR_IPC_SIGNAL);
    },
    loadView() {
      ipcRenderer.send(IpcEvents.LOAD_VIEW);
    },
    showView(viewId) {
      ipcRenderer.send(IpcEvents.SHOW_VIEW, { viewId });
    },
    closeView(viewId) {
      ipcRenderer.send(IpcEvents.CLOSE_VIEW, { viewId });
    },
    reloadView(viewId) {
      ipcRenderer.send(IpcEvents.RELOAD_VIEW, { viewId });
    },
    showWindow() {
      ipcRenderer.send(IpcEvents.SHOW_WINDOW);
    },
    closeWindow() {
      ipcRenderer.send(IpcEvents.CLOSE_WINDOW);
    },
    reloadWindow() {
      ipcRenderer.send(IpcEvents.RELOAD_WINDOW);
    },
    maximizeWindow() {
      ipcRenderer.send(IpcEvents.MAXIMIZE_WINDOW);
    },
    minimizeWindow() {
      ipcRenderer.send(IpcEvents.MINIMIZE_WINDOW);
    },
    showWindowMenu() {
      ipcRenderer.send(IpcEvents.SHOW_WINDOW_MENU);
    },
    closeModal(type) {
      ipcRenderer.send(IpcEvents.CLOSE_SUB_WINDOW, { type });
    },
    showContextMenu(viewId) {
      ipcRenderer.send(IpcEvents.SHOW_WINDOW_MENU, { viewId });
    },
    saveServerURL(url) {
      ipcRenderer.send(IpcEvents.SAVE_SERVER_URL, { url });
    },
    sendSensorTrack(event, properties) {
      ipcRenderer.send(IpcEvents.SEND_SENSOR_TRACK, event, properties);
    },
    getServerURL() {
      return ipcRenderer.invoke(IpcEvents.GET_SERVER_URL);
    },
    getSystemLang() {
      return ipcRenderer.invoke(IpcEvents.GET_SYSTEM_LANG);
    },
    getSystemInfo() {
      return ipcRenderer.invoke(IpcEvents.GET_SYSTEM_INFO);
    },
    getVersionInfo() {
      return ipcRenderer.invoke(IpcEvents.GET_VERSION_INFO);
    },
  };
}

setupBoardMixGlobal();
