import { net, shell } from 'electron';

import { AppEnv } from '../utils/env';

let uniqueId = 0;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function uniqueID() {
  return String(uniqueId++);
}

export const platform = {
  isWin: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
};

export function openExternalBrowser(url: string) {
  shell.openExternal(url);
}

export function mimeTypeToDownloads(mimeType: string) {
  switch (mimeType) {
    case 'image/png':
      return [{ name: 'Images', extensions: ['png'] }];
    case 'image/jpg':
      return [{ name: 'Images', extensions: ['jpg'] }];
    case 'application/pdf':
      return [{ name: 'Portable Document Format', extensions: ['pdf'] }];
    case 'image/svg+xml':
      return [{ name: 'Scalable Vector Graphics', extensions: ['svg'] }];
    case 'application/svg':
      return [{ name: 'Scalable Vector Graphics', extensions: ['svg'] }];
    case 'application/bdx':
      return [{ name: 'boardmix', extensions: ['bdx'] }];
    default:
      return [];
  }
}

export function requestRemoteURL(url: string) {
  return new Promise<{ type: string; buffer: ArrayBufferLike }>((resolve, reject) => {
    const request = net.request({ url, method: 'GET' });
    request.on('response', (response) => {
      let arrLength = 0;
      const contentType = response.headers['content-type'];
      const contentLength = response.headers['content-length'];
      const unit8Array = new Uint8Array(Number(contentLength));
      response.on('data', (data) => {
        unit8Array.set(data, arrLength);
        arrLength += data.byteLength;
      });
      response.on('end', () => {
        resolve({ buffer: unit8Array.buffer, type: String(contentType) });
      });
      response.on('aborted', () => {
        reject(new Error('abort'));
      });
      response.on('error', () => {
        reject(new Error('error'));
      });
    });
    request.on('abort', () => {
      reject(new Error('abort'));
    });
    request.on('error', () => {
      reject(new Error('error'));
    });
    request.setHeader('Cache-Control', 'no-cache');
    request.end();
  });
}

export function replaceBaseUrl(url: string, baseUrl?: string) {
  const { pathname, search } = new URL(url);
  return new URL(`${pathname}${search}`, baseUrl).href;
}

export function getAppEnvByUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    const prefix = hostname.split('.')[0];
    if (/^\d+$|localhost/.test(prefix)) {
      return 'dev';
    } else if (prefix.startsWith('board')) {
      return 'prod';
    } else {
      return prefix;
    }
  } catch (error) {
    return '';
  }
}

export function isSameAppEnv(url: string) {
  return getAppEnvByUrl(url) === AppEnv.APP_ENV;
}
