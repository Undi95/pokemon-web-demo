/**
 * scripts/m4a-oracle/compare-traces.cjs — Oracle son étage A : diff des traces.
 *   node scripts/m4a-oracle/compare-traces.cjs [trace-mgba.jsonl] [trace-ts.jsonl]
 *
 * - Isole le DERNIER segment continu (f strictement +1) de la trace mGBA — elle
 *   peut être en plusieurs morceaux (script chargé en cours de jeu puis reset).
 * - Le restreint à la sous-plage contiguë au sh de la trace TS (MUS_INTRO).
 * - Auto-aligne les deux traces (offsets testés, score sur les 30 premières
 *   frames TS) : l'instant exact de capture mGBA dans la frame est inconnu.
 * - Compare champ par champ. « chan » (12e champ) compté À PART : sans mixeur
 *   (lot 2) les canaux DS ne se libèrent jamais côté TS → l'allocation diverge
 *   légitimement après saturation ; idem si des SE jouent côté mGBA. Les 11
 *   champs de séquence pure doivent matcher EXACTEMENT.
 */
'use strict';
const fs = require('fs');

const FIELDS = ['flags', 'wait', 'key', 'velocity', 'gateTime', 'keyM', 'pitM',
  'volMR', 'volML', 'patternLevel', 'cmdPtr', 'chan'];
const CHAN = 11; // index du champ toléré

const mgbaPath = process.argv[2] ?? 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-mgba-bgm.jsonl';
const tsPath = process.argv[3] ?? 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-bgm.jsonl';

function load(p) {
  return fs.readFileSync(p, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
}
const mgbaAll = load(mgbaPath);
const ts = load(tsPath);

// 1. Dernier segment continu de la trace mGBA.
const segments = [];
let cur = [mgbaAll[0]];
for (let i = 1; i < mgbaAll.length; i++) {
  if (mgbaAll[i].f === mgbaAll[i - 1].f + 1) cur.push(mgbaAll[i]);
  else { segments.push(cur); cur = [mgbaAll[i]]; }
}
segments.push(cur);
let seg = segments[segments.length - 1];
console.log(`mGBA: ${mgbaAll.length} lignes, ${segments.length} segment(s) — dernier: f=${seg[0].f}..${seg[seg.length - 1].f} (${seg.length} frames)`);

// 2. Sous-plage contiguë au sh de la trace TS.
const shWanted = ts[0].sh;
const first = seg.findIndex((r) => r.sh === shWanted);
if (first < 0) {
  console.error(`sh=0x${shWanted.toString(16)} absent du segment mGBA (sh vus: ${[...new Set(seg.map((r) => r.sh))].map((s) => '0x' + s.toString(16)).join(', ')})`);
  process.exit(1);
}
let last = first;
while (last + 1 < seg.length && seg[last + 1].sh === shWanted) last++;
seg = seg.slice(first, last + 1);
console.log(`mGBA: plage sh=0x${shWanted.toString(16).toUpperCase()} → ${seg.length} frames (f=${seg[0].f}..${seg[seg.length - 1].f})`);

// 3. Auto-alignement : ts[k] ↔ seg[k + o].
function frameMismatches(a, b) {
  let n = 0;
  const tn = Math.min(a.tr.length, b.tr.length);
  for (let t = 0; t < tn; t++) {
    for (let c = 0; c < CHAN; c++) if (a.tr[t][c] !== b.tr[t][c]) n++;
  }
  return n;
}
let bestO = 0;
let bestScore = Infinity;
for (let o = -10; o <= 10; o++) {
  let score = 0;
  let counted = 0;
  for (let k = 0; k < ts.length && counted < 30; k++) {
    const j = k + o;
    if (j < 0 || j >= seg.length) continue;
    score += frameMismatches(ts[k], seg[j]);
    counted++;
  }
  if (counted >= 10 && (score < bestScore || (score === bestScore && Math.abs(o) < Math.abs(bestO)))) {
    bestScore = score; bestO = o;
  }
}
console.log(`Alignement: offset ${bestO} (score 30 premières frames: ${bestScore})`);

// 4. Comparaison complète sur le recouvrement.
const perField = new Array(FIELDS.length).fill(0);
const perTrack = {};
let framesCompared = 0;
let stMismatch = 0;
const details = [];
for (let k = 0; k < ts.length; k++) {
  const j = k + bestO;
  if (j < 0 || j >= seg.length) continue;
  const a = ts[k];
  const b = seg[j];
  framesCompared++;
  if ((a.st >>> 0) !== (b.st >>> 0)) stMismatch++;
  const tn = Math.min(a.tr.length, b.tr.length);
  for (let t = 0; t < tn; t++) {
    for (let c = 0; c < FIELDS.length; c++) {
      if (a.tr[t][c] !== b.tr[t][c]) {
        perField[c]++;
        perTrack[t] = (perTrack[t] ?? 0) + 1;
        if (c !== CHAN && details.length < 15) {
          details.push(`  fTS=${a.f}/fGBA=${b.f} piste ${t} ${FIELDS[c]}: TS=${a.tr[t][c]} mGBA=${b.tr[t][c]}`
            + ` (cmdPtr TS=0x${a.tr[t][10].toString(16)} mGBA=0x${b.tr[t][10].toString(16)})`);
        }
      }
    }
  }
}

const seqMismatches = perField.slice(0, CHAN).reduce((s, n) => s + n, 0);
console.log(`\n=== ${framesCompared} frames comparées ===`);
console.log('Par champ: ' + FIELDS.map((f, i) => `${f}=${perField[i]}`).join(' '));
console.log(`st (status) divergents: ${stMismatch}`);
if (Object.keys(perTrack).length) {
  console.log('Par piste: ' + Object.entries(perTrack).map(([t, n]) => `#${t}=${n}`).join(' '));
}
if (details.length) {
  console.log('\nPremiers écarts (hors chan):');
  for (const d of details) console.log(d);
}
console.log(seqMismatches === 0
  ? `\n✅ SÉQUENCE EXACTE sur ${framesCompared} frames (chan toléré: ${perField[CHAN]} écarts)`
  : `\n❌ ${seqMismatches} écarts de séquence (+ ${perField[CHAN]} chan tolérés)`);
process.exit(seqMismatches === 0 ? 0 : 2);
