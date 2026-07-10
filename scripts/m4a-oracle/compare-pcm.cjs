/**
 * scripts/m4a-oracle/compare-pcm.cjs — Oracle son étage B : diff sample-exact
 * du pcmBuffer DirectSound entre mGBA (trace-m4a-pcm.lua) et le runner TS.
 *   node scripts/m4a-oracle/compare-pcm.cjs [trace-mgba-pcm.bin] [trace-ts-pcm.bin]
 *
 * Compare, frame par frame, LA TRANCHE ÉCRITE par SoundMain cette frame
 * (cur = f(pcmDmaCounter), spv octets par moitié L/R) — pas le buffer entier
 * (les vieilles tranches portent l'historique d'avant l'alignement).
 * Alignement : première frame mGBA au sh du runner, phase vérifiée par
 * pcmDmaCounter, offset affiné sur ±10 en maximisant les tranches égales.
 * ⚠️ Les frames où mGBA joue des SE DirectSound divergent LÉGITIMEMENT
 * (le runner ne joue que le BGM) — le rapport les liste pour tri manuel.
 */
'use strict';
const fs = require('fs');

const REC_HEAD = 12;
const BUF = 3168;
const HALF = 1584;
const REC = REC_HEAD + BUF;

function load(p) {
  const b = fs.readFileSync(p);
  if (b.readUInt32LE(0) !== 0x5041344d) throw new Error(`${p}: magic M4AP absent`);
  const period = b.readUInt8(5);
  const spv = b.readUInt16LE(6);
  const frames = [];
  for (let off = 8; off + REC <= b.length; off += REC) {
    frames.push({
      f: b.readUInt32LE(off),
      sh: b.readUInt32LE(off + 4),
      dc: b.readUInt8(off + 8),
      reverb: b.readUInt8(off + 9),
      buf: b.subarray(off + REC_HEAD, off + REC_HEAD + BUF),
    });
  }
  return { period, spv, frames };
}

const mgba = load(process.argv[2] ?? 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-mgba-pcm.bin');
const ts = load(process.argv[3] ?? 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-pcm.bin');
console.log(`mGBA: ${mgba.frames.length} frames (period=${mgba.period} spv=${mgba.spv}) · TS: ${ts.frames.length} (period=${ts.period} spv=${ts.spv})`);
if (mgba.period !== ts.period || mgba.spv !== ts.spv) {
  console.error('period/spv divergents — mode son différent, abort.');
  process.exit(1);
}
const spv = ts.spv;

// Dernier segment continu mGBA, restreint au sh du runner.
const segs = [];
let cur = [mgba.frames[0]];
for (let i = 1; i < mgba.frames.length; i++) {
  if (mgba.frames[i].f === mgba.frames[i - 1].f + 1) cur.push(mgba.frames[i]);
  else { segs.push(cur); cur = [mgba.frames[i]]; }
}
segs.push(cur);
let seg = segs[segs.length - 1];
const shWanted = ts.frames[0].sh;
const first = seg.findIndex((r) => r.sh === shWanted);
if (first < 0) { console.error(`sh=0x${shWanted.toString(16)} absent`); process.exit(1); }
let last = first;
while (last + 1 < seg.length && seg[last + 1].sh === shWanted) last++;
seg = seg.slice(first, last + 1);
console.log(`mGBA: plage sh=0x${shWanted.toString(16).toUpperCase()} → ${seg.length} frames`);

// Tranche écrite par la frame. TS : formule de SoundMain (dc dumpé = celui
// qu'il a utilisé). mGBA : le dc capturé par le callback "frame" est DÉJÀ
// décrémenté pour la frame suivante → tranche = period - dc (validé
// empiriquement par cartographie d'énergie du ring).
function sliceTs(rec, half) {
  const c = rec.dc - 1 > 0 ? spv * (ts.period - (rec.dc - 1)) : 0;
  return rec.buf.subarray(c + half, c + half + spv);
}
function sliceGba(rec, half) {
  const c = spv * ((ts.period - rec.dc) % ts.period);
  return rec.buf.subarray(c + half, c + half + spv);
}
function sliceEq(a, b) {
  for (const half of [0, HALF]) {
    const sa = sliceGba(a, half);
    const sb = sliceTs(b, half);
    for (let i = 0; i < spv; i++) if (sa[i] !== sb[i]) return false;
  }
  return true;
}

// Alignement : offset qui maximise les tranches égales sur les 60 premières.
let bestO = 0;
let bestScore = -1;
for (let o = -5; o <= 5; o++) {
  let score = 0;
  let n = 0;
  for (let k = 0; k < ts.frames.length && n < 60; k++) {
    const j = k + o;
    if (j < 0 || j >= seg.length) continue;
    if (sliceEq(seg[j], ts.frames[k])) score++;
    n++;
  }
  if (score > bestScore) { bestScore = score; bestO = o; }
}
console.log(`Alignement: offset ${bestO} (${bestScore}/60 tranches égales en tête)`);

// Diff complet.
let compared = 0;
let equal = 0;
const dcMismatch = 0;
const divergentFrames = [];
let firstDiff = null;
for (let k = 0; k < ts.frames.length; k++) {
  const j = k + bestO;
  if (j < 0 || j >= seg.length) continue;
  const a = ts.frames[k];
  const b = seg[j];
  compared++;
  if (sliceEq(b, a)) { equal++; continue; }
  divergentFrames.push(a.f);
  if (!firstDiff) {
    for (const [half, name] of [[0, 'R'], [HALF, 'L']]) {
      const sa = sliceTs(a, half);
      const sb = sliceGba(b, half);
      for (let i = 0; i < spv; i++) {
        if (sa[i] !== sb[i]) {
          firstDiff = `fTS=${a.f}/fGBA=${b.f} ${name}[${i}] TS=${sa[i] << 24 >> 24} mGBA=${sb[i] << 24 >> 24} (dc=${a.dc})`;
          break;
        }
      }
      if (firstDiff) break;
    }
  }
}

console.log(`\n=== ${compared} frames comparées ===`);
console.log(`tranches identiques: ${equal} · divergentes: ${divergentFrames.length}`);
if (firstDiff) console.log(`Première divergence: ${firstDiff}`);
if (divergentFrames.length) {
  const ranges = [];
  let s = divergentFrames[0];
  let p = s;
  for (let i = 1; i <= divergentFrames.length; i++) {
    const v = divergentFrames[i];
    if (v !== p + 1) { ranges.push(s === p ? `${s}` : `${s}-${p}`); s = v; }
    p = v;
  }
  console.log(`Frames divergentes (SE mGBA attendus par plages): ${ranges.slice(0, 30).join(', ')}${ranges.length > 30 ? ` … (${ranges.length} plages)` : ''}`);
}
console.log(equal === compared - dcMismatch
  ? `\n✅ PCM SAMPLE-EXACT sur ${equal} frames`
  : `\n${equal / (compared - dcMismatch) > 0.9 ? '🟡' : '❌'} ${equal}/${compared - dcMismatch} tranches exactes (${(100 * equal / (compared - dcMismatch)).toFixed(1)} %)`);
