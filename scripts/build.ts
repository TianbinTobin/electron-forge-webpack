#!/usr/bin/env node

import { readdir } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';
import { consola } from 'consola';
import { configDotenv } from 'dotenv';

import { promptsEdition, promptsPlatform, spawnForge } from './utils';
import pkg from '../package.json';

/**
 * @return {Promise<string>}
 */
async function generateVersion() {
  return new Promise<string>((resolve) => {
    readdir(join(dirname(fileURLToPath(process.cwd())), './release/测试版/'), (err, files) => {
      if (err === null && files.length) {
        const file = files[files.length - 1];
        const versionArr = file.split('-');
        const betaVersion = versionArr.length > 1 ? file.split('-')[1].split('.')[1] : 0;
        pkg.version === file.split('-')[0]
          ? resolve(`${pkg.version}-beta.${Number(betaVersion) + 1}`)
          : resolve(`${pkg.version}-beta.1`);
      } else {
        resolve(`${pkg.version}-beta.1`);
      }
    });
  });
}

async function main() {
  const command = process.argv[process.argv.length - 1];

  const edition = await promptsEdition();

  if (!edition) {
    process.exit(0);
  }

  configDotenv({ path: join(process.cwd(), './env/.env') });
  configDotenv({ path: join(process.cwd(), `./env/.env.${edition}`), override: true });

  const platform = await promptsPlatform();

  if (!platform) {
    process.exit(0);
  }

  if (edition === 'beta') {
    const version = await generateVersion();
    process.env.BUILD_VERSION = version;
    consola.info(chalk.green('Build version: ', version));
  }

  consola.info(chalk.green(`Running electron-forge ${command}`));

  spawnForge([command, `--platform=${platform}`]);
}

main();
