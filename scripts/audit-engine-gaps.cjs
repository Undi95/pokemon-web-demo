// AUDIT ENGINE GAPS — généralisation de audit-objmode.cjs (demande user 2026-06-13).
// Inventorie TOUT ce que les .c de COMBAT consomment côté plateforme GBA
// (registres GPU, champs OAM, champs struct Sprite, fonctions sprite/palette/
// decompress/trig/scanline, globals) et croise avec ce que l'engine TS
// implémente réellement (compositor/gba/runtime/system + miroirs plateforme).
// Usage : node scripts/audit-engine-gaps.cjs > audit-reports/engine-gaps.txt
const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const REPO = 'D:/Projet 1/pokemon-web-demo/src';

// ── fichiers .c de combat (les consommateurs) ────────────────────────────────
const BATTLE_C = fs.readdirSync(path.join(DECOMP, 'src'))
  .filter(f => /^(battle_|pokeball|reshow_battle)/.test(f) && f.endsWith('.c'));
const battleTexts = new Map(BATTLE_C.map(f => [f, fs.readFileSync(path.join(DECOMP, 'src', f), 'utf8')]));
// + les data headers d'anim (templates)
for (const h of ['battle_anim.h']) {
  const p = path.join(DECOMP, 'src', 'data', h);
  if (fs.existsSync(p)) battleTexts.set('data/' + h, fs.readFileSync(p, 'utf8'));
}

// ── côté ENGINE : fichiers où chercher les implémentations ──────────────────
function readAll(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/decomp-data|devtools/.test(p)) readAll(p, out); }
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}
const RENDER_FILES = ['gba/compositor.ts', 'gba/gba.ts'].map(f => path.join(REPO, 'engine', f)).filter(fs.existsSync);
const SYSTEM_FILES = readAll(path.join(REPO, 'engine', 'system'));
const PLAT_MIRRORS = ['scanline_effect.ts', 'trig.ts'].map(f => path.join(REPO, 'game', f)).filter(fs.existsSync);
const renderTxt = RENDER_FILES.map(p => fs.readFileSync(p, 'utf8')).join('\n');
const systemTxt = SYSTEM_FILES.concat(PLAT_MIRRORS).map(p => fs.readFileSync(p, 'utf8')).join('\n');
const engineAllFiles = readAll(path.join(REPO, 'engine')).concat(readAll(path.join(REPO, 'game')));

function countIn(txt, re) { const m = txt.match(re); return m ? m.length : 0; }

// ── 1. REGISTRES GPU : offsets réels depuis io_reg.h ─────────────────────────
const ioReg = fs.readFileSync(path.join(DECOMP, 'include', 'gba', 'io_reg.h'), 'utf8');
const regOffsets = new Map(); // BLDCNT → 0x50
for (const m of ioReg.matchAll(/#define REG_OFFSET_(\w+)\s+(0x[0-9A-Fa-f]+)/g)) {
  regOffsets.set(m[1], parseInt(m[2], 16));
}
const regUse = new Map();
for (const [, txt] of battleTexts) {
  for (const m of txt.matchAll(/REG_OFFSET_(\w+)/g)) regUse.set(m[1], (regUse.get(m[1]) ?? 0) + 1);
  for (const m of txt.matchAll(/REG_(\w+)\s*=/g)) regUse.set(m[1], (regUse.get(m[1]) ?? 0) + 1); // écritures directes REG_X =
}
const regReport = [];
for (const [reg, n] of [...regUse.entries()].sort((a, b) => b[1] - a[1])) {
  const off = regOffsets.get(reg);
  const hexes = off !== undefined ? ['0x' + off.toString(16), '0x' + off.toString(16).toUpperCase()] : [];
  // côté rendu : le compositor honore-t-il ce registre ? (nom OU offset)
  const inRender = countIn(renderTxt, new RegExp(`\\b${reg}\\b`, 'g'))
    + hexes.reduce((a, h) => a + countIn(renderTxt, new RegExp(`[^\\w]${h.replace('0x', '0x')}\\b`, 'g')), 0);
  const inSystem = countIn(systemTxt, new RegExp(`\\b${reg}\\b`, 'g'));
  regReport.push({ reg, n, inRender, inSystem });
}

// ── 2. CHAMPS OAM utilisés dans les .c combat ────────────────────────────────
const oamUse = new Map();
for (const [, txt] of battleTexts) {
  for (const m of txt.matchAll(/\.oam\.(\w+)/g)) oamUse.set(m[1], (oamUse.get(m[1]) ?? 0) + 1);
}
const oamReport = [];
for (const [f, n] of [...oamUse.entries()].sort((a, b) => b[1] - a[1])) {
  // mapping noms TS connus (tileNum→tileId, paletteNum→paletteBank, matrixNum→affineParamIndex)
  const tsNames = { tileNum: 'tileId', paletteNum: 'paletteBank', matrixNum: 'affineParamIndex' }[f] ?? f;
  const inRender = countIn(renderTxt, new RegExp(`\\b(${f}|${tsNames})\\b`, 'g'));
  const inSync = countIn(systemTxt, new RegExp(`oam\\.(${f}|${tsNames})\\b`, 'g'));
  oamReport.push({ f, n, inRender, inSync });
}

// ── 3. CHAMPS struct Sprite (sprite->X, hors oam/data) ──────────────────────
const SKIP_SPRITE = new Set(['oam', 'data', 'callback', 'x', 'y', 'x2', 'y2']);
const spriteFieldUse = new Map();
for (const [, txt] of battleTexts) {
  for (const m of txt.matchAll(/(?:sprite|gSprites\[\w+\])(?:->|\.)(\w+)/g)) {
    if (SKIP_SPRITE.has(m[1])) continue;
    spriteFieldUse.set(m[1], (spriteFieldUse.get(m[1]) ?? 0) + 1);
  }
}
const spriteReport = [];
for (const [f, n] of [...spriteFieldUse.entries()].sort((a, b) => b[1] - a[1])) {
  if (n < 3) continue; // bruit
  const inSystem = countIn(systemTxt, new RegExp(`\\b${f}\\b`, 'g'));
  spriteReport.push({ f, n, inSystem });
}

// ── 4. FONCTIONS plateforme : définies dans sprite/palette/util/decompress/
//        trig/gpu_regs/scanline_effect/dma3/malloc .c → appels dans battle .c ─
const PLAT_C = ['sprite.c', 'palette.c', 'util.c', 'decompress.c', 'trig.c', 'gpu_regs.c', 'scanline_effect.c', 'dma3_manager.c', 'malloc.c', 'blit.c', 'bg.c'];
const platFns = new Map(); // fn → fichier
for (const f of PLAT_C) {
  const p = path.join(DECOMP, 'src', f);
  if (!fs.existsSync(p)) continue;
  const txt = fs.readFileSync(p, 'utf8');
  for (const m of txt.matchAll(/^(?:static\s+)?(?:const\s+)?\w[\w\s*]*?\b(\w+)\s*\([^;{)]*\)\s*\n?\{/gm)) {
    const name = m[1];
    if (/^(if|for|while|switch|return)$/.test(name)) continue;
    if (!/^[A-Z]/.test(name) && !/^m4a|^sub_/.test(name)) continue; // API publiques = PascalCase
    platFns.set(name, f);
  }
}
const fnUse = new Map();
for (const [, txt] of battleTexts) {
  for (const [fn] of platFns) {
    const c = countIn(txt, new RegExp(`\\b${fn}\\s*\\(`, 'g'));
    if (c) fnUse.set(fn, (fnUse.get(fn) ?? 0) + c);
  }
}
// présence engine : déclaration/affectation du nom quelque part dans engine+game
const engineAllTxt = engineAllFiles.map(p => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }).join('\n');
const fnReport = [];
for (const [fn, n] of [...fnUse.entries()].sort((a, b) => b[1] - a[1])) {
  if (n < 2) continue; // bruit
  const decl = countIn(engineAllTxt, new RegExp(`(function ${fn}\\b|\\b${fn}\\s*[:=]\\s*(\\(|function)|${fn}\\s*\\()`, 'g'));
  fnReport.push({ fn, src: platFns.get(fn), n, decl });
}

// ── 5. GLOBALS plateforme ────────────────────────────────────────────────────
const GLOBALS = ['gSpriteCoordOffsetX', 'gSpriteCoordOffsetY', 'gOamMatrices', 'gPlttBufferUnfaded', 'gPlttBufferFaded', 'gScanlineEffect', 'gScanlineEffectRegBuffers', 'gSineTable', 'gPaletteFade', 'gMosaicReg', 'gWeatherPtr'];
const globalReport = [];
for (const gname of GLOBALS) {
  let n = 0;
  for (const [, txt] of battleTexts) n += countIn(txt, new RegExp(`\\b${gname}\\b`, 'g'));
  if (!n) continue;
  const inEngine = countIn(engineAllTxt, new RegExp(`\\b${gname}\\b`, 'g'));
  globalReport.push({ gname, n, inEngine });
}

// ── SORTIE ───────────────────────────────────────────────────────────────────
const flag = (used, impl) => impl === 0 ? '🔴' : impl < 3 ? '🟡' : '✅';
console.log('═══ AUDIT ENGINE GAPS — combat .c → engine TS (' + new Date().toISOString().slice(0, 10) + ') ═══');
console.log('\n── 1. REGISTRES GPU (usages combat | mentions rendu compositor/gba | mentions system) ──');
for (const r of regReport) console.log(`${flag(r.n, r.inRender)} ${r.reg.padEnd(18)} use:${String(r.n).padEnd(4)} render:${String(r.inRender).padEnd(4)} system:${r.inSystem}`);
console.log('\n── 2. CHAMPS OAM (usages | rendu | sync system) ──');
for (const r of oamReport) console.log(`${flag(r.n, r.inRender)} ${r.f.padEnd(18)} use:${String(r.n).padEnd(4)} render:${String(r.inRender).padEnd(4)} sync:${r.inSync}`);
console.log('\n── 3. CHAMPS struct Sprite (≥3 usages) ──');
for (const r of spriteReport) console.log(`${flag(r.n, r.inSystem)} ${r.f.padEnd(22)} use:${String(r.n).padEnd(4)} system:${r.inSystem}`);
console.log('\n── 4. FONCTIONS plateforme (≥2 appels combat) ──');
for (const r of fnReport) console.log(`${flag(r.n, r.decl)} ${r.fn.padEnd(34)} (${(r.src ?? '?').padEnd(16)}) use:${String(r.n).padEnd(4)} engine:${r.decl}`);
console.log('\n── 5. GLOBALS plateforme ──');
for (const r of globalReport) console.log(`${flag(r.n, r.inEngine)} ${r.gname.padEnd(26)} use:${String(r.n).padEnd(4)} engine:${r.inEngine}`);
console.log('\nLégende : 🔴 = utilisé par le combat, INTROUVABLE côté engine (manque probable)');
console.log('          🟡 = trouvé <3 fois (impl partielle possible) · ✅ = présent');
console.log('NB : matching par NOM (faux ✅ possibles si homonyme ; faux 🔴 si renommé) — vérifier au drill-down.');
