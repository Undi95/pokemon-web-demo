/**
 * gfx-verify-metatiles.cjs — Vérif 1:1 des métatiles + attributs (définitions tileset).
 *
 * Transport ANTI-CORRUPTION : le moteur calcule un FNV-1a 32-bit sur les octets LE de
 * ses Uint16Array (metatiles / metatileAttributes) et ne transporte que le HASH.
 * On recompute le FNV des .bin décomp en node et on compare. Hash identique = 1:1
 * (collision FNV-1a astronomiquement improbable). Zéro hex recopié à la main.
 *
 * référence = data/tilesets/.../metatiles.bin + metatile_attributes.bin (décomp)
 * sujet     = tileset.metatiles / .metatileAttributes live (hash dans le dump)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
// Hash + longueurs venus du moteur (eval) — 4 nombres, incorruptibles.
const ENGINE = {
  primaryName: 'building', secondaryName: 'shop',
  primMeta: { len: 64,   fnv: 1708424039 },
  secMeta:  { len: 2312, fnv: 2297137240 },
  primAttr: { len: 8,    fnv: 1649158677 },
  secAttr:  { len: 289,  fnv: 1297553163 },
};

function fnv1a(buf) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < buf.length; i++) { h ^= buf[i]; h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function checkBin(label, kind, name, file, eng) {
  const full = path.join(DECOMP, 'data/tilesets', kind, name, file);
  const buf = fs.readFileSync(full);
  const fnv = fnv1a(buf);
  const lenU16 = buf.length / 2;
  const lenOk = lenU16 === eng.len;
  const fnvOk = fnv === eng.fnv;
  const ok = lenOk && fnvOk;
  console.log(
    (ok ? '  ✅ ' : '  ❌ ') + label.padEnd(22) +
    ' décomp[len ' + lenU16 + ', fnv ' + fnv + ']  moteur[len ' + eng.len + ', fnv ' + eng.fnv + ']' +
    (ok ? '' : (lenOk ? '  ← HASH DIFFÈRE' : '  ← LONGUEUR DIFFÈRE')),
  );
  return ok;
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(' VÉRIF MÉTATILES  —  primaire ' + ENGINE.primaryName + ' / secondaire ' + ENGINE.secondaryName);
console.log('═══════════════════════════════════════════════════════════════');
let all = true;
all &= checkBin('metatiles (' + ENGINE.primaryName + ')', 'primary', ENGINE.primaryName, 'metatiles.bin', ENGINE.primMeta);
all &= checkBin('metatiles (' + ENGINE.secondaryName + ')', 'secondary', ENGINE.secondaryName, 'metatiles.bin', ENGINE.secMeta);
all &= checkBin('attributs (' + ENGINE.primaryName + ')', 'primary', ENGINE.primaryName, 'metatile_attributes.bin', ENGINE.primAttr);
all &= checkBin('attributs (' + ENGINE.secondaryName + ')', 'secondary', ENGINE.secondaryName, 'metatile_attributes.bin', ENGINE.secAttr);
console.log('');
console.log(all ? '✅ MÉTATILES 1:1 — définitions + attributs conformes à la décomp.' : '❌ Divergence métatile détectée.');
