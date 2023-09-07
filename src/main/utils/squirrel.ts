import { app } from 'electron';
import { spawn } from 'node:child_process';
import path from 'node:path';

async function spawnCommand(command: string, args?: readonly string[]) {
  return new Promise<void>((resolve, reject) => {
    spawn(command, args || [], { detached: true, stdio: 'ignore' })
      .on('close', resolve)
      .on('error', reject);
  });
}

export function shouldQuit() {
  if (process.platform !== 'win32' || process.argv.length <= 1) {
    return false;
  }

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));

  const spawnUpdate = function (args?: readonly string[]) {
    return spawnCommand(updateDotExe, args);
  };

  const exeName = path.basename(process.execPath);

  const squirrelEvent = process.argv[1];

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName])
        .catch(() => {})
        .then(() => app.quit());

      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName])
        .catch(() => {})
        .then(() => app.quit());

      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }

  return false;
}
