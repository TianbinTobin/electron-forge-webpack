import fs from 'node:fs';
import path from 'node:path';

import dayjs from 'dayjs';
import electronLog from 'electron-log';

import { AppEnv } from '../utils/env';

const log = electronLog.create('Main Process');

const logFile = log.transports.file.getFile();
const logFileDir = path.resolve(logFile.path, '..');

if (!AppEnv.ENABLE_DEVTOOLS) {
  log.transports.file.level = 'info';
  log.transports.console.level = 'info';
}

log.transports.file.resolvePath = (variables) => {
  const type = process.type === 'browser' ? 'main' : process.type;
  const LogsFileName = `${type}-${dayjs().format('YYYY-MM-DD')}.log`;
  return path.join(variables.libraryDefaultDir, LogsFileName);
};

function removeOvertimeLog(file: string) {
  const filePath = path.resolve(logFileDir, file);
  const statInfo = fs.statSync(filePath);
  const isLogFile = path.extname(filePath) === '.log';
  const birthtime = dayjs(statInfo.birthtime).startOf('day');
  const isOvertime = birthtime.isBefore(dayjs().subtract(7, 'day'));
  if (isLogFile && isOvertime) {
    fs.rmSync(filePath, { force: true });
  }
}

fs.readdir(logFileDir, (_err, files) => {
  if (_err === null) {
    files.forEach(removeOvertimeLog);
  }
});

export default log;
