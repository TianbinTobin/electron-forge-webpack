import { app } from 'electron';

import { REGEX_DOMAIN_PATH } from '../utils/regex';
import { reportError } from '../utils/report';

export function catchError() {
  process.on('uncaughtException', (error, origin) => {
    const errorStr = error instanceof Error ? (error.stack ? error.stack : error.toString()) : JSON.stringify(error);
    reportError({
      eventType: 'exception',
      type: 'Process_Uncaught_Exception',
      errorMessage: JSON.stringify({ error: errorStr, origin }),
    });
  });

  app.addListener('render-process-gone', (_event, webContents, details) => {
    reportError({
      eventType: 'exception',
      type: 'Render_Process_Gone',
      detailReason: details.reason,
      detailExitCode: details.exitCode,
      errorMessage: JSON.stringify({ url: webContents.getURL(), details }),
    });
  });

  app.addListener('child-process-gone', (_event, details) => {
    reportError({
      eventType: 'exception',
      type: 'Child_Process_Gone',
      errorMessage: JSON.stringify(details),
      detailServiceName: details.serviceName,
      detailExitCode: details.exitCode,
      detailReason: details.reason,
      detailType: details.type,
      detailName: details.name,
    });
  });

  app.addListener('certificate-error', (event, _webContents, url, error, _certificate, callback) => {
    if (REGEX_DOMAIN_PATH.test(url)) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
    // 上报证书异常
    reportError({
      eventType: 'exception',
      type: 'Certificate_Error',
      errorMessage: JSON.stringify({ url, error }),
    });
  });
}
