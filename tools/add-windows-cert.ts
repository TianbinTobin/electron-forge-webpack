import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export async function generateWindowsSigningCert() {
  try {
    const dir = await fs.mkdtemp.__promisify__(path.resolve(os.tmpdir(), 'builder-folder-'));

    const certAsBase64 = process.env.WINDOWS_CODESIGN_P12;
    if (!certAsBase64) {
      throw new Error(`Could not find code sign cert base value`);
    }

    const certificatePath = path.resolve(dir, 'win-certificate.pfx');
    await fs.writeFile.__promisify__(certificatePath, certAsBase64.replace(/\\n/g, ''), {
      encoding: 'base64',
    });

    if (!certificatePath) {
      throw new Error(`Could not generate cert at ${certificatePath}`);
    }
    return certificatePath;
  } catch (err) {
    throw new Error(`Could not generate code signing cert: ${err}`);
  }
}

if (require.main === module) {
  (async () => {
    console.log(await generateWindowsSigningCert());
  })();
}
