/**
 * gfx-verify-palette.cjs — Vérificateur 1:1 de la palette BG overworld.
 *
 * ORACLE INTERNE NON-CIRCULAIRE :
 *   référence  = les .pal de la décomp (D:/Projet 1/decomps/pokeemeraude)
 *   sujet      = le dump de gPlttBufferUnfaded live (audit-reports/gfx/pal-dump.json)
 *
 * Modélise LoadTilesetPalette (fieldmap.c:875) à l'identique :
 *   - PRIMAIRE   : slot 0 forcé RGB_BLACK, puis colors[1..] du tileset (bloc contigu, 6 banques)
 *   - SECONDAIRE : chargement direct depuis palettes[NUM_PALS_IN_PRIMARY] (banques 6..12)
 *   - ApplyGlobalTintToPaletteEntries = stub vide → aucune teinte.
 *
 * Conversion couleur = gbagfx : rgb15 = (r>>3) | ((g>>3)<<5) | ((b>>3)<<10).
 *
 * Usage : node scripts/gfx-verify-palette.cjs [chemin-dump.json]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const NUM_PALS_IN_PRIMARY = 6;
const NUM_PALS_TOTAL = 13;
const RGB_BLACK = 0;

const dumpPath = process.argv[2] || path.join(__dirname, '..', 'audit-reports', 'gfx', 'pal-dump.json');

function parsePal(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length);
  // JASC-PAL / 0100 / <count> / <count lignes "R G B">
  const count = parseInt(lines[2], 10);
  const colors = [];
  for (let i = 0; i < count; i++) {
    const [r, g, b] = lines[3 + i].split(/\s+/).map(Number);
    colors.push(((r >> 3) | ((g >> 3) << 5) | ((b >> 3) << 10)) & 0xffff);
  }
  while (colors.length < 16) colors.push(0);
  return colors;
}

function loadTilesetBanks(kind, name) {
  const dir = path.join(DECOMP, 'data', 'tilesets', kind, name, 'palettes');
  const banks = [];
  for (let b = 0; b < 16; b++) {
    const f = path.join(dir, String(b).padStart(2, '0') + '.pal');
    banks.push(fs.existsSync(f) ? parsePal(f) : null);
  }
  return banks;
}

// Aplati banques → tableau de couleurs contiguës (banque*16 + color)
function flatten(banks) {
  const flat = [];
  for (let b = 0; b < 16; b++) {
    const bank = banks[b];
    for (let c = 0; c < 16; c++) flat.push(bank ? bank[c] : null);
  }
  return flat;
}

function buildExpected(primaryName, secondaryName) {
  const flatPrim = flatten(loadTilesetBanks('primary', primaryName));
  const flatSec = flatten(loadTilesetBanks('secondary', secondaryName));
  const exp = new Array(NUM_PALS_TOTAL * 16).fill(null);
  // PRIMAIRE : slot 0 = noir forcé ; slots 1..95 = flatPrim[1..95]
  exp[0] = RGB_BLACK;
  for (let i = 1; i < NUM_PALS_IN_PRIMARY * 16; i++) exp[i] = flatPrim[i];
  // SECONDAIRE : slots 96..207 = flatSec[96..207] (banques 6..12 du tileset secondaire)
  for (let i = NUM_PALS_IN_PRIMARY * 16; i < NUM_PALS_TOTAL * 16; i++) exp[i] = flatSec[i];
  return exp;
}

function hex15(v) {
  return v == null ? ' null ' : '0x' + v.toString(16).padStart(4, '0');
}
// rgb15 → #rrggbb approx (pour lecture humaine)
function toHexRGB(v) {
  if (v == null) return '——————';
  const r = (v & 31) << 3, g = ((v >> 5) & 31) << 3, b = ((v >> 10) & 31) << 3;
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// ── run ──────────────────────────────────────────────────────────────────────
const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
const exp = buildExpected(dump.primaryName, dump.secondaryName);
const live = dump.bgPalette;

const mismatches = [];
for (let i = 0; i < NUM_PALS_TOTAL * 16; i++) {
  if (exp[i] !== live[i]) mismatches.push({ slot: i, bank: i >> 4, color: i & 15, exp: exp[i], live: live[i] });
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(' VÉRIF PALETTE BG  —  ' + dump.mapId);
console.log('  primaire = ' + dump.primaryName + '   secondaire = ' + dump.secondaryName);
console.log('  slots vérifiés : 0..' + (NUM_PALS_TOTAL * 16 - 1) + ' (13 banques tileset)');
console.log('═══════════════════════════════════════════════════════════════');

if (mismatches.length === 0) {
  console.log('✅ PALETTE 1:1 — les 208 slots tileset correspondent à la décomp au bit près.');
} else {
  console.log('❌ ' + mismatches.length + ' slot(s) divergent(s) :');
  console.log('');
  console.log(' slot  bank.col   attendu (décomp)      live (moteur)        source');
  console.log(' ────  ────────   ──────────────────    ─────────────────    ──────');
  for (const m of mismatches) {
    const kind = m.bank < NUM_PALS_IN_PRIMARY ? 'prim ' + dump.primaryName : 'sec ' + dump.secondaryName;
    const file = (m.bank < NUM_PALS_IN_PRIMARY ? m.bank : m.bank) + '.pal';
    console.log(
      '  ' + String(m.slot).padStart(3) +
      '   b' + m.bank + '.c' + String(m.color).padStart(2) +
      '    ' + hex15(m.exp) + ' ' + toHexRGB(m.exp) +
      '    ' + hex15(m.live) + ' ' + toHexRGB(m.live) +
      '    ' + kind + ' / ' + String(m.bank).padStart(2, '0') + '.pal',
    );
  }
}
console.log('');
console.log('Récap : ' + (NUM_PALS_TOTAL * 16 - mismatches.length) + '/' + (NUM_PALS_TOTAL * 16) + ' slots conformes.');
