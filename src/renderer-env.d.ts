import { ModalType, SensorsTrack, SystemInfo, VersionInfo } from './interfaces';

declare global {
  interface Window {
    BoardGlobal: {
      platform: NodeJS.Platform;
      sendReady(): void;
      loadView(): void;
      showView(viewId: string): void;
      closeView(viewId: string): void;
      reloadView(viewId: string): void;
      showWindow(): void;
      closeWindow(): void;
      reloadWindow(): void;
      maximizeWindow(): void;
      minimizeWindow(): void;
      showWindowMenu(): void;
      closeModal(type: ModalType): void;
      showContextMenu(viewId: string): void;
      saveServerURL(url: string): void;
      getServerURL(): Promise<string>;
      getSystemLang(): Promise<string>;
      getSystemInfo(): Promise<SystemInfo>;
      getVersionInfo(): Promise<VersionInfo>;
      sendSensorTrack<Event extends keyof SensorsTrack>(event: Event, properties: SensorsTrack[Event]): void;
      addEventListener(type: BoardEvent, listener: () => void, options?: { signal: AbortSignal }): void;
    };
  }
}
