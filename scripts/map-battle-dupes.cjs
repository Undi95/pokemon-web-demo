// Cartographie des doublons de fonctions entre game/ (miroir 1:1) et engine/battle/ (ad-hoc).
// Pour chaque nom défini des DEUX côtés : localisation + taille du corps (wrapper vs logique)
// + si la version engine est encore importée ailleurs (= encore vivante).
const fs = require('fs');
const path = require('path');
const SRC = 'D:/Projet 1/pokemon-web-demo/src';

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.ts')) acc.push(p);
  }
}
// indexe les définitions de fonctions : name -> [{file, line, bodyLines, exported}]
function indexDefs(root) {
  const files = []; walk(root, files);
  const defs = {};
  const re = /^(export\s+)?function\s+([A-Za-z0-9_]+)\s*\(/;
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(re);
      if (!m) continue;
      const name = m[2];
      // mesure du corps : compte les lignes jusqu'à équilibre des accolades
      let depth = 0, started = false, body = 0;
      for (let j = i; j < lines.length && j < i + 400; j++) {
        for (const ch of lines[j]) { if (ch === '{') { depth++; started = true; } else if (ch === '}') depth--; }
        body++;
        if (started && depth <= 0) break;
      }
      (defs[name] = defs[name] || []).push({ file: path.relative(SRC, f).replace(/\\/g,'/'), line: i+1, body, exported: !!m[1] });
    }
  }
  return defs;
}
const game = indexDefs(path.join(SRC, 'game'));
const eng = indexDefs(path.join(SRC, 'engine/battle'));
const common = Object.keys(game).filter(n => eng[n]).sort();

const logic = [], wrappers = [];
for (const n of common) {
  const g = game[n][0], e = eng[n][0];
  const entry = { n, g: `${g.file}:${g.line}(${g.body}l)`, e: `${e.file}:${e.line}(${e.body}l)`, maxBody: Math.max(g.body, e.body) };
  if (n.startsWith('_') || entry.maxBody <= 6) wrappers.push(entry); else logic.push(entry);
}
console.log(`=== ${common.length} noms communs game/ ∩ engine/battle ===`);
console.log(`\n--- VRAIS DOUBLONS DE LOGIQUE (${logic.length}) [corps > 6 lignes, pas de préfixe _] ---`);
for (const x of logic.sort((a,b)=>b.maxBody-a.maxBody)) console.log(`  ${x.n.padEnd(26)} game ${x.g.padEnd(40)} | engine ${x.e}`);
console.log(`\n--- WRAPPERS / triviaux (${wrappers.length}) [préfixe _ ou ≤6 lignes] ---`);
for (const x of wrappers) console.log(`  ${x.n.padEnd(30)} game ${x.g.padEnd(36)} | engine ${x.e}`);
