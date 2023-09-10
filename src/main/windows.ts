import { BrowserWindow, app, shell } from 'electron';

import { ipcMainManager } from './ipc';
import { MainWindow, ROOT_PATH } from './utils/url';
import { IpcEvents } from '../ipc-events';

// Keep a global reference of the window objects, if we don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
export let browserWindows: Array<BrowserWindow | null> = [];

let mainIsReadyResolver: () => void;
const mainIsReadyPromise = new Promise<void>((resolve) => (mainIsReadyResolver = resolve));

export function mainIsReady() {
  mainIsReadyResolver();
}

/**
 * Gets default options for the main window
 *
 * @returns {Electron.BrowserWindowConstructorOptions}
 */
export function getMainWindowOptions(): Electron.BrowserWindowConstructorOptions {
  const HEADER_COMMANDS_HEIGHT = 40;
  const MACOS_TRAFFIC_LIGHTS_HEIGHT = 16;

  return {
    title: app.getName(),
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    show: false,
    frame: false,
    acceptFirstMouse: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : undefined,
    titleBarOverlay: process.platform === 'darwin',
    trafficLightPosition: {
      x: 20,
      y: HEADER_COMMANDS_HEIGHT / 2 - MACOS_TRAFFIC_LIGHTS_HEIGHT / 2,
    },
    webPreferences: {
      sandbox: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      preload: ROOT_PATH.preloadWindow,
    },
  };
}

/**
 * Creates a new main window.
 *
 * @export
 * @returns {Electron.BrowserWindow}
 */
export function createMainWindow(): Electron.BrowserWindow {
  console.log(`Creating main window`);
  let browserWindow: BrowserWindow | null;
  browserWindow = new BrowserWindow(getMainWindowOptions());
  browserWindow.loadURL(MainWindow.HEADER);

  browserWindow.webContents.once('dom-ready', () => {
    if (browserWindow) {
      browserWindow.show();
    }
  });

  browserWindow.on('closed', () => {
    browserWindows = browserWindows.filter((bw) => browserWindow !== bw);

    browserWindow = null;
  });

  browserWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  browserWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  ipcMainManager.on(IpcEvents.RELOAD_WINDOW, () => {
    browserWindow?.reload();
  });

  browserWindows.push(browserWindow);

  return browserWindow;
}

/**
 * Gets or creates the main window, returning it in both cases.
 *
 * @returns {Promise<Electron.BrowserWindow>}
 */
export async function getOrCreateMainWindow(): Promise<Electron.BrowserWindow> {
  await mainIsReadyPromise;
  return BrowserWindow.getFocusedWindow() || browserWindows[0] || createMainWindow();
}
