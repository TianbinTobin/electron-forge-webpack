import fs from 'node:fs';
import path from 'node:path';

import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import type { ForgeConfig } from '@electron-forge/shared-types';

import packageJson from './package.json';
import { mainConfig } from './tools/webpack/webpack.main.config';
import { rendererConfig } from './tools/webpack/webpack.renderer.config';

const { version } = packageJson;
const iconDir = path.resolve(__dirname, 'assets', 'icons');

if (process.env['WINDOWS_CODESIGN_FILE']) {
  const certPath = process.env['WINDOWS_CODESIGN_FILE'];

  if (!fs.existsSync(certPath) && process.env['SIGN_OR_DIE']) {
    throw new Error('Did not find Windows codesign file');
  }
}

if (process.env['SIGN_OR_DIE'] && !(process.env['WINDOWS_CODESIGN_FILE'] && process.env['WINDOWS_CODESIGN_PASSWORD'])) {
  throw new Error('Did not find "WINDOWS_CODESIGN_{FILE|PASSWORD}" env variable(s)');
}

const config: ForgeConfig = {
  rebuildConfig: {},
  packagerConfig: {
    asar: true,
    name: 'boardmix',
    executableName: 'boardmix',
    appCopyright: 'Copyright © 2023 深圳市博思云创科技有限公司. All rights reserved.',
    icon: './assets/icons/icon',
    appBundleId: 'com.bosyun.boardmix',
    appCategoryType: 'public.app-category.productivity',
    protocols: [
      {
        name: 'Boardmix Launch Protocol',
        schemes: ['boardmix'],
      },
    ],
    win32metadata: {
      CompanyName: '深圳市博思云创科技有限公司',
      OriginalFilename: 'boardmix',
    },
    extendInfo: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  makers: [
    new MakerSquirrel((arch) => ({
      name: 'boardmix',
      exe: 'boardmix.exe',
      authors: 'board@boardmix.cn',
      iconUrl: 'https://cms.boardmix.cn/images/board.ico',
      setupExe: `boardmix-${version}-win32-${arch}-setup.exe`,
      setupIcon: path.resolve(iconDir, 'icon.ico'),
      certificateFile: process.env['WINDOWS_CODESIGN_FILE'],
      certificatePassword: process.env['WINDOWS_CODESIGN_PASSWORD'],
    })),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
    new WebpackPlugin({
      devServer: {
        // Disallow browser from opening/reloading with HMR in development mode.
        hot: 'only',
        open: false,
        liveReload: false,
      },
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            name: 'main_window',
            html: './static/index.html',
            js: './src/renderer/renderer.ts',
            preload: {
              js: './src/preload/main-window.ts',
            },
          },
          {
            name: 'main_view',
            preload: {
              js: './src/preload/main-view.ts',
            },
          },
        ],
      },
    }),
  ],
};

export default config;
