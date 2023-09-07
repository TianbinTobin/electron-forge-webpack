import { ipcMain } from 'electron';

import i18next from 'i18next';

import appManager from '../core/manager';
import type AppView from '../core/view';
import setting from '../setting';
import { requestRemoteURL } from '../utils';
import { AppEnv } from '../utils/env';
import log from '../utils/logger';
import { sensors } from '../utils/sensors';
import system from '../utils/system';
import { AppURL } from '../utils/url';
// import { updateRenderMemoryDetail } from '@/perf';

const logger = log.scope('Channel::View');

function mainAddViewEventListener<K extends keyof ViewEventPayload>(
  channel: K,
  listener: ChannelEventCallback<AppView, ViewEventPayload[K]>,
) {
  ipcMain.on('view:' + channel, (event, payload) => {
    const channelView = appManager.getAppView(event.sender);
    logger.info(`[View Event::${channelView?.id ?? 'null'}]: `, channel);
    listener(channelView, payload);
  });
}

export function bindMainViewEventListener() {
  mainAddViewEventListener('on-init', (view) => {
    if (view) {
      view.handleOnSuccess();
    }
    if (view?.isHomepage) {
      sensors.init();
    }
  });

  mainAddViewEventListener('on-close', (view) => {
    view?.close();
  });

  mainAddViewEventListener('on-login', (_view, payload) => {
    setting.set('userId', payload.userInfo.user_id);
  });

  mainAddViewEventListener('on-logout', () => {
    appManager.logout();
  });

  mainAddViewEventListener('set-lang', (_view, payload) => {
    i18next.changeLanguage(payload.lang);
  });

  mainAddViewEventListener('set-title', (view, payload) => {
    if (view) {
      view.title = payload.title;
    }
  });

  mainAddViewEventListener('open-file', (view, payload) => {
    const url = new URL(`${AppURL.APP_URL}editor/${payload.fileKey}`);
    if (payload.config && payload.config.query) {
      for (const key in payload.config.query) {
        url.searchParams.set(key, payload.config.query[key]);
      }
    }
    view?.window.openTab(url.href, payload.title);
  });

  mainAddViewEventListener('update-homepage-file', (view, payload) => {
    view?.window.homepage.postMessageToWeb({
      message: 'updateFileInfo',
      data: { file_key: payload.fileKey },
    });
  });

  mainAddViewEventListener('update-client-version', (_, payload) => {
    AppEnv.setBoardVersion(payload);
  });

  ipcMain.handle('view:request-remote-url', async (_, payload: { url: string }) => {
    return requestRemoteURL(payload.url);
  });

  ipcMain.handle('view:get-system-info', async () => {
    return {
      setting: setting.store,
      systemInfo: { ...system },
    };
  });
}
