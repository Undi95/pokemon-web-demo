/**
 * scripts/m4a-oracle/compare-chans.cjs — Oracle étage A-bis : diff champ à
 * champ des SoundChannels (+ verdict pcm au mapping validé).
 *   node scripts/m4a-oracle/compare-chans.cjs [trace-mgba-chans.bin] [trace-ts-chans.bin]
 *
 * Alignement : TS[k] ↔ mGBA[k+lag], lag auto (score sur statusFlags des chans).
 * Tranche pcm écrite : TS = period-(dc-1) ; mGBA = period-dc (son dc capturé
 * est déjà décrémenté pour la frame suivante — validé empiriquement).
 * Champs comparés seulement quand l'un des deux canaux est SF_ON (sinon
 * vieilles valeurs de canal mort, non significatives).
 */
'use strict';
const fs = require('fs');

const NCH = 5, CH = 64, HALF = 1584;
const REC = 12 + NCH * CH + 3168;
const U8_FIELDS = [
  ['statusFlags', 0x00], ['type', 0x01], ['rightVolume', 0x02], ['leftVolume', 0x03],
  ['attack', 0x04], ['decay', 0x05], ['sustain', 0x06], ['release', 0x07],
  ['key', 0x08], ['envelopeVolume', 0x09], ['envVolR', 0x0a], ['envVolL', 0x0b],
  ['echoVol', 0x0c], ['echoLen', 0x0d], ['gateTime', 0x10], ['midiKey', 0x11],
  ['velocity', 0x12], ['priority', 0x13], ['rhythmPan', 0x14],
];
const U32_FIELDS = [['count', 0x18], ['fw', 0x1c], ['frequency', 0x20], ['wav', 0x24], ['currentPointer', 0x28]];
const SF_ON = 0xc7;

function load(p) {
  const b = fs.readFileSync(p);
  if (b.readUInt32LE(0) !== 0x4341344d) throw new Error(`${p}: magic M4AC absent`);
  const period = b.readUInt8(5), spv = b.readUInt16LE(6);
  const fr = [];
  for (let off = 8; off + REC <= b.length; off += REC) {
    fr.push({
      f: b.readUInt32LE(off), sh: b.readUInt32LE(off + 4), dc: b.readUInt8(off + 8),
      chans: b.subarray(off + 12, off + 12 + NCH * CH),
      pcm: b.subarray(off + 12 + NCH * CH, off + REC),
    });
  }
  return { period, spv, frames: fr };
}
const G0 = load(process.argv[2] ?? 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-mgba-chans.bin');
const T = load(process.argv[3] ?? 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-chans.bin');
const { period, spv } = T;

let segs = [[G0.frames[0]]];
for (let i = 1; i < G0.frames.length; i++) {
  if (G0.frames[i].f === G0.frames[i - 1].f + 1) segs[segs.length - 1].push(G0.frames[i]);
  else segs.push([G0.frames[i]]);
}
const G = segs[segs.length - 1].filter((r) => r.sh === T.frames[0].sh);
console.log(`mGBA: ${G.length} frames · TS: ${T.frames.length} (period=${period} spv=${spv})`);

// Lag auto sur les statusFlags.
let bestLag = 1, bestScore = -1;
for (let lag = -3; lag <= 4; lag++) {
  let score = 0;
  for (let k = 0; k < 60; k++) {
    const j = k + lag;
    if (j < 0 || j >= G.length) continue;
    for (let c = 0; c < NCH; c++) {
      if (G[j].chans[c * CH] === T.frames[k].chans[c * CH]) score++;
    }
  }
  if (score > bestScore) { bestScore = score; bestLag = lag; }
}
console.log(`Lag: ${bestLag} (score sf ${bestScore}/300)`);

// Diff champ à champ.
const per = {};
let first = [];
let framesCmp = 0;
for (let k = 0; k < T.frames.length; k++) {
  const j = k + bestLag;
  if (j < 0 || j >= G.length) continue;
  framesCmp++;
  for (let c = 0; c < NCH; c++) {
    const a = G[j].chans.subarray(c * CH, c * CH + CH);
    const b = T.frames[k].chans.subarray(c * CH, c * CH + CH);
    if (!((a[0] | b[0]) & SF_ON)) continue;
    for (const [name, off] of U8_FIELDS) {
      if (a[off] !== b[off]) {
        per[name] = (per[name] || 0) + 1;
        if (first.length < 12) first.push(`fTS=${T.frames[k].f} chan${c} ${name}: TS=${b[off]} mGBA=${a[off]} (sf TS=0x${b[0].toString(16)}/GBA=0x${a[0].toString(16)})`);
      }
    }
    for (const [name, off] of U32_FIELDS) {
      const av = a.readUInt32LE(off), bv = b.readUInt32LE(off);
      if (av !== bv) {
        per[name] = (per[name] || 0) + 1;
        if (first.length < 12) first.push(`fTS=${T.frames[k].f} chan${c} ${name}: TS=0x${bv.toString(16)} mGBA=0x${av.toString(16)}`);
      }
    }
  }
}
console.log(`\n=== ${framesCmp} frames, champs divergents ===`);
console.log(Object.entries(per).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k}=${v}`).join(' ') || 'AUCUN');
if (first.length) { console.log('\nPremiers écarts:'); for (const l of first) console.log(' ', l); }

// Verdict pcm au mapping validé.
const sT = (r, h) => { const c = spv * (r.dc - 1 > 0 ? period - (r.dc - 1) : 0); return r.pcm.subarray(h + c, h + c + spv); };
const sG = (r, h) => { const c = spv * ((period - r.dc) % period); return r.pcm.subarray(h + c, h + c + spv); };
let eq = 0, tot = 0;
for (let k = 0; k < T.frames.length; k++) {
  const j = k + bestLag;
  if (j < 0 || j >= G.length) continue;
  for (const h of [0, HALF]) {
    const a = sG(G[j], h), b = sT(T.frames[k], h);
    let same = true;
    for (let i = 0; i < spv; i++) if (a[i] !== b[i]) { same = false; break; }
    tot++;
    if (same) eq++;
  }
}
console.log(`\nPCM tranches identiques: ${eq}/${tot} (${(100 * eq / tot).toFixed(1)} %)`);
