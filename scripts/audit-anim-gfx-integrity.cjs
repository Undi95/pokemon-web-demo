// AUDIT INTÉGRITÉ DONNÉES ANIMS (plan 100% anims, point 1 — 2026-06-13).
// Croise : gBattleAnimPicTable/gBattleAnimPaletteTable (LA vérité décomp,
// src/data/battle_anim.h) ↔ anim-gfx-manifest.json (notre loader par tag)
// ↔ fichiers extraits (public/) ↔ palettes sources (PLTE des png décomp).
// Usage : node scripts/audit-anim-gfx-integrity.cjs > audit-reports/anim-gfx-integrity.txt
const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const PUB = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/battle_anims/sprites';
const manifest = JSON.parse(fs.readFileSync('D:/Projet 1/pokemon-web-demo/public/decomp/em/battle_anims/anim-gfx-manifest.json', 'utf8'));

// ── 1. la table décomp : tag → {gfxSym, palSym} ─────────────────────────────
const dataH = fs.readFileSync(path.join(DECOMP, 'src', 'data', 'battle_anim.h'), 'utf8');
// const struct CompressedSpriteSheet gBattleAnimPicTable[] = { {gBattleAnimSpriteGfx_Bone, 0x200, ANIM_TAG_BONE}, ... }
const picTable = new Map();
const picBlock = /gBattleAnimPicTable\[\]\s*=\s*\{([\s\S]*?)\n\};/.exec(dataH);
if (picBlock) {
  for (const m of picBlock[1].matchAll(/\{(\w+),\s*(0x[0-9A-Fa-f]+|\d+),\s*(\w+)\}/g)) {
    picTable.set(m[3], { gfxSym: m[1], size: parseInt(m[2], m[2].startsWith('0x') ? 16 : 10) });
  }
}
const palTable = new Map();
const palBlock = /gBattleAnimPaletteTable\[\]\s*=\s*\{([\s\S]*?)\n\};/.exec(dataH);
if (palBlock) {
  for (const m of palBlock[1].matchAll(/\{(\w+),\s*(\w+)\}/g)) {
    palTable.set(m[2], { palSym: m[1] });
  }
}

// ── 2. symbole → fichier source (graphics-data.ts, déjà généré) ─────────────
const gd = fs.readFileSync('D:/Projet 1/pokemon-web-demo/src/engine/decomp-data/src/graphics-data.ts', 'utf8');
const symToPath = new Map();
for (const m of gd.matchAll(/'(\w+)':\s*\{\s*path:\s*'([^']+)'/g)) symToPath.set(m[1], m[2]);

// ── 3. PLTE d'un png décomp → 16 u16 RGB15 ──────────────────────────────────
function plteRgb15(pngPath) {
  try {
    const b = fs.readFileSync(pngPath);
    let i = 8;
    while (i < b.length) {
      const len = b.readUInt32BE(i);
      const type = b.toString('ascii', i + 4, i + 8);
      if (type === 'PLTE') {
        const n = Math.min(16, len / 3);
        const out = [];
        for (let k = 0; k < n; k++) {
          out.push((b[i + 8 + k * 3] >> 3) | ((b[i + 8 + k * 3 + 1] >> 3) << 5) | ((b[i + 8 + k * 3 + 2] >> 3) << 10));
        }
        return out;
      }
      i += 12 + len;
    }
  } catch { /* absent */ }
  return null;
}

// ── 4. croisement ────────────────────────────────────────────────────────────
let ok = 0;
const issues = [];
for (const [tagName, entry] of Object.entries(manifest)) {
  const probs = [];
  const pic = picTable.get(tagName);
  const pal = palTable.get(tagName);
  if (!pic) probs.push('tag absent de gBattleAnimPicTable');
  if (!pal) probs.push('tag absent de gBattleAnimPaletteTable');
  // taille attendue vs manifest
  if (pic && entry.size !== pic.size) probs.push(`size manifest ${entry.size} != table ${pic.size}`);
  // fichiers extraits présents + tailles
  const binP = path.join(PUB, entry.bin);
  const palP = path.join(PUB, entry.pal);
  if (!fs.existsSync(binP)) probs.push(`MANQUANT bin ${entry.bin}`);
  else if (pic) {
    const realLen = fs.statSync(binP).size;
    if (realLen !== pic.size) probs.push(`bin ${realLen}o != size table ${pic.size}o`);
  }
  if (!fs.existsSync(palP)) probs.push(`MANQUANT pal ${entry.pal}`);
  else if (fs.statSync(palP).size !== 32) probs.push(`pal ${fs.statSync(palP).size}o != 32o`);
  // palette extraite == PLTE du png SOURCE pointé par gBattleAnimPaletteTable ?
  if (pal && fs.existsSync(palP)) {
    const srcRel = symToPath.get(pal.palSym);
    if (!srcRel) probs.push(`palSym ${pal.palSym} absent de graphics-data`);
    else {
      const srcCols = plteRgb15(path.join(DECOMP, srcRel));
      if (srcCols) {
        const b = fs.readFileSync(palP);
        const ours = new Uint16Array(b.buffer, b.byteOffset, 16);
        let diff = 0;
        for (let k = 0; k < Math.min(16, srcCols.length); k++) if ((ours[k] & 0x7FFF) !== srcCols[k]) diff++;
        // index 0 = transparent (tolérer), au-delà : compare
        if (diff > 1) probs.push(`palette ≠ source PLTE (${diff}/16 couleurs)`);
      }
    }
  }
  if (probs.length) issues.push({ tagName, probs });
  else ok++;
}
// tags de la table décomp ABSENTS du manifest
const missing = [];
for (const tagName of picTable.keys()) if (!manifest[tagName]) missing.push(tagName);

console.log(`═══ INTÉGRITÉ DONNÉES ANIMS — table décomp ${picTable.size} tags · manifest ${Object.keys(manifest).length} · OK ${ok} ═══`);
if (missing.length) { console.log(`\n🔴 tags de gBattleAnimPicTable ABSENTS du manifest (${missing.length}) :`); missing.forEach(t => console.log('  ' + t)); }
if (issues.length) {
  console.log(`\n⚠ entrées avec écarts (${issues.length}) :`);
  for (const i of issues) console.log(`  ${i.tagName}: ${i.probs.join(' | ')}`);
} else {
  console.log('\n✅ aucun écart manifest/fichiers/palettes.');
}
