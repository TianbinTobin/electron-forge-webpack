import { net } from 'electron';
import { join } from 'node:path';

import dayjs from 'dayjs';
import electronLog from 'electron-log';

import setting from '../setting';
import { AppEnv } from '../utils/env';
import log from '../utils/logger';
import system from '../utils/system';

const logger = log.scope('Report::Log');

const errorLog = electronLog.create('Error');

errorLog.transports.file.resolvePath = (variables) => {
  const LogsFileName = `error-${dayjs().format('YYYY-MM-DD')}.log`;
  return join(variables.libraryDefaultDir, LogsFileName);
};

const errorLogger = errorLog.scope('Report');

enum ErrorTypeString {
  Load_Content_Fail = 'Load_Content_Fail',
  Certificate_Error = 'Certificate-Error',
  Child_Process_Gone = 'Child_Process_Gone',
  Render_Process_Gone = 'Render_Process_Gone',
  Process_Uncaught_Exception = 'Process_Uncaught_Exception',
}

interface ExceptionMessage {
  eventType: 'exception';
  type: ErrorTypeString | string;
  errorMessage: string;
  errorDescription?: string;
  validatedURL?: string;
  isMainFrame?: boolean;
  errorCode?: number;
  detailServiceName?: string;
  detailExitCode?: number;
  detailReason?: string;
  detailType?: string;
  detailName?: string;
}

interface BusinessMessage {
  eventType: 'business';
  type: string;
  content?: string;
}

function getBaseInfo() {
  const timestamp = Date.now();
  const userId = setting.store.userId;
  return { ...system, timestamp, userId };
}

function uploadLog(chunk: string | Buffer) {
  const request = net.request({ url: `${AppEnv.BASE_URL}/api/web/report/log`, method: 'POST' });
  request.on('error', onUploadError);
  request.setHeader('Content-Type', 'application/json;charset=UTF-8');
  request.write(chunk);
  request.end();
}

function onUploadError(error: Error) {
  const errorStr = error instanceof Error ? (error.stack ? error.stack : error.toString()) : JSON.stringify(error);
  errorLogger.error(errorStr);
}

export function reportLog(data: ExceptionMessage | BusinessMessage) {
  const params = Object.assign(data, getBaseInfo());
  const paramsStr = JSON.stringify(params);
  logger.info(paramsStr);
  uploadLog(paramsStr);
}

export function reportError(data: ExceptionMessage) {
  const params = Object.assign(data, getBaseInfo());
  const paramsStr = JSON.stringify(params);
  errorLogger.error(paramsStr);
  uploadLog(paramsStr);
}
