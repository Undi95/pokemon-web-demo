#!/usr/bin/env node
/**
 * check-auto-syntax.mjs
 * --------------------
 * Per-file TS1 syntax error sweep across `src/engine/decomp-data/auto/src-all/`.
 *
 * Outputs : for each file, count of TS1xxx errors (= syntax errors).
 * Final : total count + list of files with > 0 errors.
 */
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const dir = resolve(projectRoot, 'src/engine/decomp-data/auto/src-all');
const files = readdirSync(dir).filter(f => f.endsWith('.ts'));

const CONCURRENCY = 4;

let total = 0;
const offenders = [];

function checkOne(f) {
  return new Promise(resolve => {
    const proc = spawn('npx', ['tsc', '--noEmit', '--allowJs', '--skipLibCheck', join(dir, f)], {
      shell: true, windowsHide: true,
    });
    let buf = '';
    proc.stdout.on('data', (d) => { buf += d.toString(); });
    proc.stderr.on('data', (d) => { buf += d.toString(); });
    proc.on('exit', () => {
      const n = (buf.match(/error TS1\d{3}/g) || []).length;
      resolve({ f, n });
    });
  });
}

async function main() {
  let i = 0;
  let done = 0;
  const tasks = [];
  while (i < files.length) {
    while (tasks.length < CONCURRENCY && i < files.length) {
      const f = files[i++];
      const p = checkOne(f).then(r => {
        tasks.splice(tasks.indexOf(p), 1);
        if (r.n > 0) {
          offenders.push(r);
          total += r.n;
        }
        done++;
        if (done % 20 === 0) console.error(`  [progress] ${done} / ${files.length}`);
      });
      tasks.push(p);
    }
    await Promise.race(tasks);
  }
  await Promise.all(tasks);

  console.log(`Total TS1 errors : ${total}`);
  console.log(`Files with errors : ${offenders.length} / ${files.length}`);
  console.log(`Files passing : ${files.length - offenders.length}`);
  console.log('Top 30 offenders :');
  offenders.sort((a, b) => b.n - a.n);
  for (const { f, n } of offenders.slice(0, 30)) {
    console.log(`  ${n.toString().padStart(4)}  ${f}`);
  }
}

main();
