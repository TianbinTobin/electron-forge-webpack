import { app } from 'electron';
import { arch, platform, release } from 'node:os';

export default {
  appName: app.getName(),
  appVersion: app.getVersion(),
  v8Version: process.versions.v8,
  nodeVersion: process.versions.node,
  chromiumVersion: process.versions.chrome,
  electronVersion: process.versions.electron,
  osArch: arch(),
  osRelease: release(),
  osPlatform: platform(),
};
