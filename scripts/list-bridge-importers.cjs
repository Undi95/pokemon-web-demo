#!/usr/bin/env node
/* Liste, par symbole donné, les fichiers qui l'importent DEPUIS decomp-bridge
 * (multi-ligne aware). Usage : node scripts/list-bridge-importers.cjs Sym1 Sym2 ... */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BRIDGE = path.join(ROOT, 'harness/runtime/decomp-bridge.ts');
const want = new Set(process.argv.slice(2));
const ID = /^[A-Za-z_$][\w$]*$/;
const files = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})){ if(['node_modules','.git','dist'].includes(e.name))continue; const p=path.join(d,e.name); if(e.isDirectory())walk(p); else if(e.name.endsWith('.ts')&&p!==BRIDGE)files.push(p);} })(ROOT);
const re = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]*decomp-bridge)['"]/g;
const out = {};
for (const f of files) {
  const src = fs.readFileSync(f,'utf8');
  for (const m of src.matchAll(re)) {
    for (const raw of m[1].replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').split(',')) {
      const p = raw.trim(); if(!p)continue;
      const mm = p.match(/^([A-Za-z_$][\w$]*)\s+as\s+/);
      const name = mm ? mm[1] : p.replace(/^type\s+/,'').trim();
      if (ID.test(name) && want.has(name)) { (out[name] ||= []).push(path.relative(ROOT,f)); }
    }
  }
}
for (const s of want) console.log(`\n${s} (${(out[s]||[]).length}):\n  ${(out[s]||[]).join('\n  ')||'(aucun)'}`);
