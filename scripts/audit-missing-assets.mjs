// Comprehensive audit: every asset-loader call site vs what exists in public/.
// Resolves static literals AND dynamic `${...}` paths via directory globbing.
import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';

const PUB = 'public';
const grep = cp.execSync(
  'grep -rnE "load(TileBin|GbaPal|TilemapBin|AffineTilemapBin|IndexedPngStrict|IndexedPng|IndexedPngWithPal)\\(|extractPngPlte\\(|fetch\\([\'\\"\\\x60]/decomp" src/engine --include=*.ts',
  { encoding: 'utf8' },
);
const lines = grep.split('\n').filter(Boolean);

// loader → expected variant of the .png path (or null = the path itself)
function expectedFor(loader, url, bpp) {
  if (loader === 'loadTileBin') return url.replace(/\.png$/, `.${bpp || 4}bpp.bin`);
  return url; // others load the path directly (png/pal/bin)
}

const missing = new Map(); // file -> {loaders:Set, sites:Set}
const dynamicDirs = new Map(); // dir -> {suffix, loader, bpp, sites:Set}
let staticChecked = 0;

const reCall = /(loadTileBin|loadGbaPal|loadTilemapBin|loadAffineTilemapBin|loadIndexedPngStrict|loadIndexedPngWithPal|loadIndexedPng|extractPngPlte)\(\s*([`'"])([^`'"]*)\2(?:\s*,\s*([0-9]))?/;
const reFetch = /fetch\(\s*([`'"])(\/decomp\/[^`'"]*)\1/;

for (const ln of lines) {
  const file = ln.split(':').slice(0, 2).join(':');
  if (/function (loadTileBin|loadGbaPal|loadTilemapBin|loadAffineTilemapBin|loadIndexedPng|extractPngPlte)/.test(ln)) continue;
  let m = ln.match(reCall);
  let loader, raw, bpp;
  if (m) { loader = m[1]; raw = m[3]; bpp = m[4]; }
  else { const f = ln.match(reFetch); if (!f) continue; loader = 'fetch'; raw = f[2]; }
  if (!raw.includes('/decomp/')) {
    // could be a `${BASE}...` — try to recover a /decomp/ literal segment
    const seg = raw.match(/\/decomp\/[^`'"]*/);
    if (!seg) continue;
    raw = seg[0];
  }
  if (raw.includes('${')) {
    // dynamic: take static prefix dir + static suffix
    const before = raw.split('${')[0];
    const after = raw.includes('}') ? raw.split('}').pop() : '';
    const dir = PUB + before.slice(0, before.lastIndexOf('/') + 1);
    const key = dir + '|' + after + '|' + loader + '|' + (bpp || '');
    if (!dynamicDirs.has(key)) dynamicDirs.set(key, { dir, suffix: after, loader, bpp, sites: new Set() });
    dynamicDirs.get(key).sites.add(file);
    continue;
  }
  staticChecked++;
  const want = PUB + expectedFor(loader, raw, bpp);
  if (!fs.existsSync(want)) {
    if (!missing.has(want)) missing.set(want, { loaders: new Set(), sites: new Set() });
    missing.get(want).loaders.add(loader);
    missing.get(want).sites.add(file);
  }
}

// Resolve dynamic dirs: list dir, for each matching base file check the variant.
const dynMissing = [];
for (const { dir, suffix, loader, bpp, sites } of dynamicDirs.values()) {
  if (!fs.existsSync(dir)) { dynMissing.push(`DIR ABSENT: ${dir} (suffix ${suffix}, ${loader}) <- ${[...sites].join(',')}`); continue; }
  // base files = those ending with the *source* extension implied by loader
  const srcExt = loader === 'loadTileBin' ? '.png'
    : (suffix && suffix.startsWith('.')) ? suffix : '.png';
  const entries = fs.readdirSync(dir).filter((f) => f.endsWith(srcExt));
  let miss = 0;
  for (const e of entries) {
    const pngUrl = (dir + e).replace(/^public/, '');
    const want = PUB + (loader === 'loadTileBin'
      ? pngUrl.replace(/\.png$/, `.${bpp || 4}bpp.bin`)
      : pngUrl);
    if (!fs.existsSync(want)) { miss++; }
  }
  if (miss > 0) dynMissing.push(`${dir}*${srcExt} → ${loader}: ${miss}/${entries.length} variants MISSING (bpp${bpp || 4}) <- ${[...sites].join(',')}`);
}

console.log(`=== STATIC sites checked: ${staticChecked} | missing: ${missing.size} ===`);
for (const [f, info] of [...missing.entries()].sort()) {
  console.log(`MISSING ${f.replace(/^public/, '')}  [${[...info.loaders].join(',')}]  <- ${[...info.sites].join(', ')}`);
}
console.log(`\n=== DYNAMIC dir globs: ${dynamicDirs.size} | with gaps: ${dynMissing.length} ===`);
for (const d of dynMissing.sort()) console.log(d);
