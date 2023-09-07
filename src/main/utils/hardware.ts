import { app } from 'electron';
import { exec } from 'node:child_process';

import iconv from 'iconv-lite';

import setting from '../setting';
import system from '../utils/system';

function getPlatformName() {
  switch (process.platform) {
    case 'darwin':
      return 'MacOS';
    case 'win32':
      return 'Windows';
    case 'linux':
      return 'Linux';
  }
  return process.platform;
}

function execStdout(command: string) {
  return new Promise<string>((resolve) => {
    exec(command, { encoding: 'buffer' }, (err, stdout) => {
      if (err) {
        resolve('');
      }
      resolve(
        iconv
          .decode(Buffer.from(stdout), 'cp936')
          .trim()
          .replace(
            /\r\n/g,
            `
    `,
          ),
      );
    });
  });
}

export async function generateHardwareInfo() {
  const time = new Intl.DateTimeFormat([], { dateStyle: 'full', timeStyle: 'long' }).format(new Date());

  let html = `
<html>
<body>
<style>
html {
  font-family: sans-serif;
}

table, th, td {
  border: 1px solid #888;
  border-collapse: collapse;
  padding: 2px
}
</style>
`;

  html += `<h2>${app.getName()} ${app.getVersion()}</h2>`;

  html += `<p>${getPlatformName()} ${system.osRelease} ${system.osArch}${
    app.runningUnderARM64Translation ? '(ARM64 Translation)' : ''
  }</p>`;

  html += `<p><p>Electron ${system.electronVersion}, Chromium ${system.chromiumVersion}, Node.js ${system.nodeVersion}</p>`;

  html += `<p>Hardware acceleration disabled: ${setting.store.disableHardwareAcceleration}</p>`;

  html += `<p>Time: ${time}</p>`;

  html += `<p>App path: ${app.getAppPath()}</p>`;

  html += '<h2>Hardware</h2>';

  html += `<pre>
    `;

  if (system.osPlatform === 'darwin') {
    html += (await execStdout('system_profiler SPHardwareDataType -detailLevel mini'))
      .replace(
        /\n[ ]{6}/g,
        `
    `,
      )
      .replace('Hardware:', '')
      .replace('Hardware Overview:', '')
      .trim();
  } else if (system.osPlatform === 'win32') {
    html += await execStdout('wmic ComputerSystem get Manufacturer,Model,TotalPhysicalMemory /format:list');
    html += `

    CPU:
    `;
    html += await execStdout('wmic CPU get Name,NumberOfCores,NumberOfLogicalProcessors /format:list');
    html += '</pre>';
  }

  html += '<h2>Graphics</h2>';
  html += '<table>';

  for (const [key, value] of Object.entries(app.getGPUFeatureStatus())) {
    html += '<tr>';
    html += `<td><b>${key}</b></td>`;
    if (typeof value === 'string' && value.startsWith('disabled') && !value.endsWith('_ok')) {
      html += `<td style="color: red">${value}</td>`;
    } else {
      html += `<td>${value}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';

  html += `<pre>
    `;

  if (system.osPlatform === 'darwin') {
    html += (await execStdout('system_profiler SPDisplaysDataType'))
      .replace(
        /\n[ ]{4}/g,
        `
    `,
      )
      .replace('Graphics/Displays:', '')
      .trim();
  } else if (system.osPlatform === 'win32') {
    html += await execStdout(
      'wmic Path Win32_VideoController get Name,Description,VideoProcessor,VideoModeDescription,DriverDate,DriverVersion,CurrentHorizontalResolution,CurrentVerticalResolution /format:list',
    );
    html += `

    Monitor:
    `;

    html += await execStdout('wmic DesktopMonitor get Name,MonitorManufacturer /format:list');
  }

  html += '</pre>';

  html += '</body></html>';

  return html;
}
