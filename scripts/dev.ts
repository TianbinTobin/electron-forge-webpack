#!/usr/bin/env node

import path from 'node:path';

import { configDotenv } from 'dotenv';

import { spawnForge } from './utils';

configDotenv({ path: path.join(process.cwd(), './env/.env') });
configDotenv({ path: path.join(process.cwd(), `./env/.env.beta`), override: true });

spawnForge(['start', '--enable-logging', '--inspect-electron', '--']);
