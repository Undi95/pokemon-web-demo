// Classe les fichiers engine/battle : INFRA (orchestrateur/émulation, reste) vs
// LOGIQUE (.c décomp, à migrer vers game/). Le .c cible est lu dans l'en-tête de chaque
// fichier (commentaires "Source: xxx.c" / "1:1 décomp xxx.c" / "battle_xxx.c").
const fs = require('fs');
const path = require('path');
const ROOT = 'D:/Projet 1/pokemon-web-demo/src/engine/battle';

const INFRA_RE = /(decomp-loop|^state$|party-storage|wire-bytecode|devtools|controllers-ipc|controllers-init|controller-tick|event-queue|memory-map|anim-registry|anim-generated-bridge|^battle-cb2|vblank-helpers|main-functions|turn-helpers|turn-dispatch|action-selection|sprite-callbacks|sprites-data|opcode-names|trainer-data-bridge|^data$|script-interpreter|string-decoder|text-buffers)/;

function walk(dir, acc){ for (const e of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,e.name); if(e.isDirectory()) walk(p,acc); else if(e.name.endsWith('.ts')) acc.push(p);} }
const files=[]; walk(ROOT, files);

function declaredC(file) {
  const head = fs.readFileSync(file,'utf8').split('\n').slice(0,45).join('\n');
  const counts = {};
  const re = /([a-z0-9_]+)\.c\b/gi; let m;
  while ((m = re.exec(head))) { const n=m[1]; counts[n]=(counts[n]||0)+1; }
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  return sorted.length ? sorted[0][0]+'.c' : '(aucun .c déclaré)';
}

const logic = [], infra = [];
for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g,'/');
  const base = path.basename(f).replace(/\.ts$/,'');
  const lines = fs.readFileSync(f,'utf8').split('\n').length;
  const entry = { rel, lines, c: declaredC(f) };
  if (INFRA_RE.test(base) || INFRA_RE.test('/'+rel) || base.startsWith('data') || rel.startsWith('data/')) infra.push(entry);
  else logic.push(entry);
}
// regroupe la logique par .c cible
const byC = {};
for (const e of logic) (byC[e.c] = byC[e.c] || []).push(e);
console.log('=== LOGIQUE À MIGRER vers game/ (groupé par .c cible décomp) ===');
let totL=0, totLf=0;
for (const [c, arr] of Object.entries(byC).sort((a,b)=>b[1].reduce((s,x)=>s+x.lines,0)-a[1].reduce((s,x)=>s+x.lines,0))) {
  const sum = arr.reduce((s,x)=>s+x.lines,0); totL+=sum; totLf+=arr.length;
  console.log(`\n  ${c.padEnd(28)} (${arr.length} fich / ${sum} l)`);
  for (const e of arr.sort((a,b)=>b.lines-a.lines)) console.log(`      ${e.rel.padEnd(34)} ${String(e.lines).padStart(6)} l`);
}
console.log(`\n=== INFRA (reste en engine/) : ${infra.length} fich ===`);
for (const e of infra.sort((a,b)=>b.lines-a.lines)) console.log(`  ${e.rel.padEnd(36)} ${String(e.lines).padStart(6)} l`);
console.log(`\n=== TOTAUX : LOGIQUE ${totLf} fich / ${totL} l à migrer | INFRA ${infra.length} fich ===`);
