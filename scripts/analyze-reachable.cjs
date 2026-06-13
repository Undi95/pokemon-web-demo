// Analyse d'accessibilité depuis src/main.ts (le point d'entrée Vite réel).
// Suit les imports statiques (from '...') ET dynamiques littéraux (import('...')).
// Liste les fichiers .ts de decomp-data NON atteignables = morts (Vite ne les bundle pas).
const fs = require('fs');
const path = require('path');
const SRC = 'D:/Projet 1/pokemon-web-demo/src';
const ENTRY = path.join(SRC, 'main.ts');

function resolve(fromFile, spec) {
  if (!spec.startsWith('.')) return null; // externe (node_modules/phaser/alias)
  let p = path.resolve(path.dirname(fromFile), spec);
  const tries = [p, p + '.ts', p + '.tsx', path.join(p, 'index.ts')];
  for (const t of tries) {
    try { if (fs.statSync(t).isFile()) return t; } catch {}
  }
  return null;
}

const importRe = /from\s*['"]([^'"]+)['"]/g;
const dynRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
const sideRe = /^\s*import\s+['"]([^'"]+)['"]/gm;

const visited = new Set();
const queue = [ENTRY];
while (queue.length) {
  const f = queue.pop();
  if (visited.has(f)) continue;
  visited.add(f);
  let code;
  try { code = fs.readFileSync(f, 'utf8'); } catch { continue; }
  for (const re of [importRe, dynRe, sideRe]) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(code))) {
      const r = resolve(f, m[1]);
      if (r && !visited.has(r)) queue.push(r);
    }
  }
}

// Tous les .ts de decomp-data
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.ts')) acc.push(p);
  }
}
const ddRoot = path.join(SRC, 'engine/decomp-data');
const all = [];
walk(ddRoot, all);

let deadFiles = 0, deadLines = 0, liveFiles = 0, liveLines = 0;
const deadByDir = {};
for (const f of all) {
  const lines = fs.readFileSync(f, 'utf8').split('\n').length;
  const rel = path.relative(ddRoot, f).split(path.sep)[0];
  if (visited.has(f)) { liveFiles++; liveLines += lines; }
  else {
    deadFiles++; deadLines += lines;
    deadByDir[rel] = deadByDir[rel] || { f: 0, l: 0 };
    deadByDir[rel].f++; deadByDir[rel].l += lines;
  }
}
console.log('Fichiers .ts atteignables depuis main.ts (tout src):', visited.size);
console.log('decomp-data : VIVANTS', liveFiles, 'fich /', liveLines, 'l  |  MORTS', deadFiles, 'fich /', deadLines, 'l');
console.log('--- morts par sous-dossier decomp-data ---');
for (const [d, v] of Object.entries(deadByDir).sort((a,b)=>b[1].l-a[1].l))
  console.log(`  ${d.padEnd(22)} ${String(v.f).padStart(4)} fich  ${String(v.l).padStart(7)} l`);

// Sanity : les fichiers critiques (importés dynamiquement) DOIVENT être vivants.
console.log('--- SANITY : fichiers critiques connus, vivant ? ---');
const crit = ['species-data','moves-data','opponents-data','battle_scripts_1-bytecode',
  'battle_scripts_2-bytecode','mon-anim-tables-data','battle_anim_pic_table-data','battle_bg-data'];
for (const c of crit) {
  const hit = all.find(f => path.basename(f) === c + '.ts');
  console.log(`  ${c.padEnd(30)} ${hit ? (visited.has(hit) ? 'VIVANT ✓' : '*** MORT (BUG resolver !) ***') : 'introuvable'}`);
}
console.log('--- atteignabilité chaîne combat (debug battle_bg-data) ---');
for (const cf of ['engine/battle/battle-script-commands.ts','engine/battle/battle-windows.ts',
  'engine/battle/battle-bg.ts','engine/battle/battle-levelup-box.ts','engine/battle/battle-decomp-loop.ts',
  'engine/battle/battle-setup-helpers.ts','engine/battle/battle-controllers.ts','game/battle_main.ts',
  'game/battle_controller_player.ts']) {
  console.log(`  ${cf.padEnd(46)} ${visited.has(path.join(SRC, cf)) ? 'VIVANT' : '*** MORT ***'}`);
}
// écrit la liste des morts pour la suppression
const deadList = all.filter(f => !visited.has(f));
const repoRoot = path.dirname(SRC);
const relList = deadList.map(f => path.relative(repoRoot, f).replace(/\\/g, '/'));
fs.writeFileSync(path.join(repoRoot, 'scripts/.dead-decomp-data.txt'), relList.join('\n') + '\n');
console.log('--- liste des', deadList.length, 'morts (chemins relatifs) écrite dans scripts/.dead-decomp-data.txt ---');
