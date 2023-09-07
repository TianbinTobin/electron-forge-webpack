#!/usr/bin/env node

import { SpawnOptions, spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import prompts from 'prompts';

export const electronForgePath = path.join(process.cwd(), './node_modules/@electron-forge/cli/dist/electron-forge.js');

export function spawnForge(args: readonly string[], options?: SpawnOptions) {
  return spawn('node', [electronForgePath, ...args], { stdio: 'inherit', ...options });
}

export const editionName = {
  beta: '测试版',
  lenovo: '联想版',
  production: '标准版',
  international: '国际版',
  privatization: '私有化版',
};

const editionList = Object.keys(editionName).map((item: keyof typeof editionName) => ({
  title: editionName[item],
  value: item,
}));

/**
 * 选择构建版本
 * @returns {Promise<string>}
 */
export async function promptsEdition() {
  const { edition } = await prompts({
    type: 'select',
    name: 'edition',
    message: '请选择构建版本',
    choices: editionList,
    initial: 2,
  });

  return edition;
}

/**
 * 选择构建平台
 * @returns {Promise<string>}
 */
export async function promptsPlatform() {
  const osPlatform = os.platform();
  const { platform } = await prompts({
    type: 'select',
    name: 'platform',
    message: '请选择构建平台',
    choices: [
      { title: 'Window', value: 'win32', disabled: osPlatform !== 'win32' },
      { title: 'Window Appx', value: 'appx', disabled: osPlatform !== 'win32' },
      { title: 'MacOS', value: 'darwin', disabled: osPlatform !== 'darwin' },
      { title: 'MacOS Mas', value: 'mas', disabled: osPlatform !== 'darwin' },
      { title: 'Linux', value: 'linux', disabled: osPlatform === 'win32' },
    ],
    initial: osPlatform === 'win32' ? 0 : osPlatform === 'darwin' ? 1 : 2,
  });

  return platform;
}
