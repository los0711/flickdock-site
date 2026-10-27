import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = join(root, 'dist');
const generatedNames = new Set(['index.html', 'styles.css', 'site.js']);

if (existsSync(output)) {
  for (const name of readdirSync(output)) {
    if (!generatedNames.has(name)) {
      throw new Error(`Unexpected file in dist: ${name}`);
    }
    rmSync(join(output, name));
  }
}

execFileSync(
  process.execPath,
  [join(root, 'source', 'scripts', 'build-retiehe.mjs'), output],
  { stdio: 'inherit' },
);
