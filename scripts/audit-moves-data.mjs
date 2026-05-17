// One-off audit : nos données moves (public/decomp/em/moves-data.json) vs
// décomp 1:1 (src/data/battle_moves.h). Move power/type/effect/pp/accuracy/
// priority/target alimentent TOUT damage+AI → une dérive d'extraction casse
// silencieusement le 1:1. Pur read-only.
import { readFileSync } from 'node:fs';

const H = 'D:/Projet 1/decomps/pokeemeraude/src/data/battle_moves.h';
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/moves-data.json';

const hSrc = readFileSync(H, 'utf8');
const ours = JSON.parse(readFileSync(J, 'utf8'));

const norm = (s) => String(s).trim();
const flagSet = (s) => (s ? String(s).split('|').map(x => x.trim()).filter(Boolean).sort().join('|') : '');

const decomp = {};
const re = /\[(MOVE_[A-Z0-9_]+)\]\s*=\s*\{/g;
let m;
while ((m = re.exec(hSrc)) !== null) {
  const name = m[1];
  const chunk = hSrc.slice(m.index, m.index + 900);
  const g = (k) => { const mm = chunk.match(new RegExp('\\.' + k + '\\s*=\\s*([^,\\n]+)')); return mm ? mm[1].trim() : null; };
  decomp[name] = {
    effect: g('effect'), power: g('power'), type: g('type'),
    accuracy: g('accuracy'), pp: g('pp'),
    secondaryEffectChance: g('secondaryEffectChance'),
    target: g('target'), priority: g('priority'), flags: g('flags'),
  };
}

const NUM = ['power', 'accuracy', 'pp', 'secondaryEffectChance', 'priority'];
const STR = ['effect', 'type', 'target'];
let compared = 0, mismatches = 0, missingInOurs = 0;
const bad = [];
for (const [name, d] of Object.entries(decomp)) {
  if (d.effect === null) continue;
  const o = ours[name];
  if (!o) { missingInOurs++; continue; }
  compared++;
  for (const f of NUM) {
    if (Number(o[f] ?? 0) !== Number(d[f])) { mismatches++; bad.push(`${name}.${f}: ours=${o[f]} decomp=${d[f]}`); }
  }
  for (const f of STR) {
    if (norm(o[f]) !== norm(d[f])) { mismatches++; bad.push(`${name}.${f}: ours=${o[f]} decomp=${d[f]}`); }
  }
  if (flagSet(o.flags) !== flagSet(d.flags)) { mismatches++; bad.push(`${name}.flags: ours=[${flagSet(o.flags)}] decomp=[${flagSet(d.flags)}]`); }
}
console.log(`[audit moves data] decompMoves=${Object.keys(decomp).length} compared=${compared} missingInOurs=${missingInOurs} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 80)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — moves data extraites 1:1 décomp.');
process.exit(mismatches ? 1 : 0);
