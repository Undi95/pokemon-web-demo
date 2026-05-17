// One-off audit : nos trainer-parties (public/decomp/em/trainer-parties.json)
// vs décomp 1:1 (src/data/trainers.h + src/data/trainer_parties.h). Les
// équipes dresseur (species/level/iv/moves/heldItem) + aiFlags + doubleBattle
// pilotent chaque combat dresseur → dérive = combats faux vs ROM. Read-only.
// Assertion = party + aiFlags(set) + doubleBattle. class/name/items = info.
import { readFileSync } from 'node:fs';

const TR = 'D:/Projet 1/decomps/pokeemeraude/src/data/trainers.h';
const PA = 'D:/Projet 1/decomps/pokeemeraude/src/data/trainer_parties.h';
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/trainer-parties.json';

const ours = JSON.parse(readFileSync(J, 'utf8'));
const trSrc = readFileSync(TR, 'utf8');
const paSrc = readFileSync(PA, 'utf8');

// 1) trainer_parties.h : sParty_X -> [{iv,lvl,species,heldItem?,moves?}]
const partyArr = {};
for (const mm of paSrc.matchAll(/struct\s+\w+\s+(sParty_\w+)\[\]\s*=\s*\{([\s\S]*?)\};/g)) {
  const sym = mm[1];
  const body = mm[2];
  const mons = [];
  // Split body en blocs mon de profondeur-1 (un mon peut contenir
  // `.moves = { MOVE_A, MOVE_B }` = profondeur 2 → splitter doit gérer
  // l'imbrication, sinon .iv/.lvl/.species hors des accolades moves = null).
  let depth = 0, start = -1;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '{') { if (depth === 0) start = i + 1; depth++; }
    else if (c === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        const t = body.slice(start, i);
        const g = (k) => { const r = t.match(new RegExp('\\.' + k + '\\s*=\\s*([^,\\n}]+)')); return r ? r[1].trim() : null; };
        const movesM = t.match(/\.moves\s*=\s*\{([^}]*)\}/);
        mons.push({
          iv: g('iv'), lvl: g('lvl'), species: g('species'),
          heldItem: g('heldItem'),
          moves: movesM ? movesM[1].split(',').map(x => x.trim()).filter(Boolean) : null,
        });
        start = -1;
      }
    }
  }
  partyArr[sym] = mons;
}

// 2) trainers.h : [TRAINER_X] = { ... .party = MACRO(sParty_X) ... }
const trData = {};
for (const mm of trSrc.matchAll(/\[(TRAINER_[A-Z0-9_]+)\]\s*=\s*\{/g)) {
  const name = mm[1];
  const chunk = trSrc.slice(mm.index, mm.index + 900);
  const pm = chunk.match(/\.party\s*=\s*\w+\(\s*(sParty_\w+)\s*\)/);
  const af = chunk.match(/\.aiFlags\s*=\s*([^\n]+?),?\s*\n/);
  const db = chunk.match(/\.doubleBattle\s*=\s*(TRUE|FALSE)/);
  trData[name] = {
    partySym: pm ? pm[1] : null,
    aiFlags: af ? af[1].replace(/,$/, '').trim() : '',
    doubleBattle: db ? db[1] === 'TRUE' : false,
  };
}

const flagSet = (s) => Array.isArray(s)
  ? [...s].map(x => x.trim()).filter(v => v && v !== '0').sort().join('|')
  : String(s || '').split('|').map(x => x.trim()).filter(v => v && v !== '0').sort().join('|');

let compared = 0, missingInOurs = 0, badTrainers = 0, partyMis = 0, aiMis = 0, dbMis = 0;
const bad = [];
for (const [name, d] of Object.entries(trData)) {
  if (name === 'TRAINER_NONE' || !d.partySym) continue;
  const dParty = partyArr[d.partySym];
  if (!dParty) continue;
  const o = ours[name];
  if (!o) { missingInOurs++; continue; }
  compared++;
  let tBad = false;
  const op = o.party || [];
  if (op.length !== dParty.length) { tBad = true; partyMis++; bad.push(`${name}: party len ours=${op.length} decomp=${dParty.length}`); }
  const n = Math.min(op.length, dParty.length);
  for (let i = 0; i < n; i++) {
    const a = op[i], b = dParty[i];
    if (Number(a.iv) !== Number(b.iv) || Number(a.level) !== Number(b.lvl) || String(a.species) !== String(b.species)) {
      tBad = true; partyMis++;
      if (bad.length < 50) bad.push(`${name}[${i}]: ours={iv:${a.iv},lvl:${a.level},${a.species}} decomp={iv:${b.iv},lvl:${b.lvl},${b.species}}`);
    }
    if (b.heldItem && String(a.heldItem || '') !== String(b.heldItem)) {
      tBad = true; partyMis++;
      if (bad.length < 50) bad.push(`${name}[${i}].heldItem: ours=${a.heldItem} decomp=${b.heldItem}`);
    }
    if (b.moves) {
      const om = (a.moves || []).map(String).join(',');
      const dm = b.moves.map(String).join(',');
      if (om !== dm) { tBad = true; partyMis++; if (bad.length < 50) bad.push(`${name}[${i}].moves: ours=[${om}] decomp=[${dm}]`); }
    }
  }
  if (flagSet(o.aiFlags) !== flagSet(d.aiFlags)) { tBad = true; aiMis++; if (bad.length < 50) bad.push(`${name}.aiFlags: ours=[${flagSet(o.aiFlags)}] decomp=[${flagSet(d.aiFlags)}]`); }
  if (Boolean(o.doubleBattle) !== d.doubleBattle) { tBad = true; dbMis++; bad.push(`${name}.doubleBattle: ours=${o.doubleBattle} decomp=${d.doubleBattle}`); }
  if (tBad) badTrainers++;
}
console.log(`[audit trainer-parties] trainersInH=${Object.keys(trData).length} compared=${compared} missingInOurs=${missingInOurs} badTrainers=${badTrainers} (partyMis=${partyMis} aiMis=${aiMis} dbMis=${dbMis})`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 50)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — trainer parties (party/aiFlags/doubleBattle) 1:1 décomp.');
process.exit(badTrainers ? 1 : 0);
