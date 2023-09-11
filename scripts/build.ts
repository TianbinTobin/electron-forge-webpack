#!/usr/bin/env node

import { join } from 'node:path';

import chalk from 'chalk';
import { consola } from 'consola';
import { configDotenv } from 'dotenv';

import { promptsEdition, promptsPlatform, spawnForge } from './utils';

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

  consola.info(chalk.green(`Running electron-forge ${command}`));

  spawnForge([command, `--platform=${platform}`]);
}

main();
