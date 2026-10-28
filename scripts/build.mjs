import { existsSync, readdirSync, rmSync, rmdirSync, readFileSync, writeFileSync, mkdirSync, lstatSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = join(root, 'dist');
const generatedNames = new Set(['index.html', 'styles.css', 'site.js','updates']);
const channels=['latest.json','macos-arm64.json','macos-arm64-auto.json','macos-x86_64.json','macos-x86_64-auto.json'];

if (existsSync(output)) {
  for (const name of readdirSync(output)) {
    if (!generatedNames.has(name)) {
      throw new Error(`Unexpected file in dist: ${name}`);
    }
    if(name==='updates') {
      const folder=join(output,name);
      if(lstatSync(folder).isSymbolicLink())throw new Error('Unexpected updates symlink');
      for(const entry of readdirSync(folder)) {
        if(!channels.includes(entry)||!lstatSync(join(folder,entry)).isFile())throw new Error('Unexpected update asset');
        rmSync(join(folder,entry));
      }
      rmdirSync(folder);
    } else rmSync(join(output, name));
  }
}

execFileSync(
  process.execPath,
  [join(root, 'source', 'scripts', 'build-retiehe.mjs'), output],
  { stdio: 'inherit' },
);
let version;
for(const name of channels) {
  const source=join(root,'source','public','updates',name);
  if(!existsSync(source))throw new Error('Missing verified update channel '+name);
  const body=readFileSync(source,'utf8'),data=JSON.parse(body);
  if(data.schema_version!==1||!/^\d+\.\d+\.\d+$/.test(data.version)||!data.installer?.url?.startsWith('https://gitee.com/rooogerluo/'))throw new Error('Invalid update channel '+name);
  if(version&&version!==data.version)throw new Error('Mixed release versions');
  version=data.version;
  mkdirSync(join(output,'updates'),{recursive:true});
  writeFileSync(join(output,'updates',name),body);
}
