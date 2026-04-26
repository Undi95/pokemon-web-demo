#!/usr/bin/env node
/**
 * Parse `src/field_door.c` du décomp pour extraire :
 *   - `sDoorAnimGraphicsTable[]` (50+ entries METATILE → door asset)
 *   - Mapping nom asset → chemin PNG dans `graphics/door_anims/`
 *
 * Sortie : `public/decomp/em/doors.json`
 *   {
 *     "METATILE_Petalburg_Door_Littleroot": { png: "littleroot.png", paletteSet: "Littleroot", sound: "DOOR_SOUND_NORMAL" },
 *     ...
 *   }
 *
 * Cf. DECOMP_ORIGIN_FILES.md F. World/Map.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'doors.json');
mkdirSync(dirname(outPath), { recursive: true });

const text = readFileSync(join(decompPath, 'src', 'field_door.c'), 'utf8');

// ─── 1. Map sDoorAnimTiles_X → png path ────────────────────────────────────
//   static const u8 sDoorAnimTiles_Littleroot[] = INCGFX_U8("graphics/door_anims/littleroot.png", ".4bpp");
const tilesToPng = {};
const tilesRe = /sDoorAnimTiles_(\w+)\s*\[\]\s*=\s*INCGFX_U8\(\s*"graphics\/door_anims\/([^"]+)"/g;
let m;
while ((m = tilesRe.exec(text)) !== null) {
  tilesToPng[m[1]] = m[2];
}

// ─── 2. Parse sDoorAnimPalettes_X[] (palette slots par tile) ───────────────
//   static const u8 sDoorAnimPalettes_Littleroot[] = {10, 10, 6, 6, 6, 6, 6, 6};
const palettesByName = {};
const palRe = /sDoorAnimPalettes_(\w+)\s*\[\]\s*=\s*\{([^}]+)\}/g;
while ((m = palRe.exec(text)) !== null) {
  const name = m[1];
  const slots = m[2].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  palettesByName[name] = slots;
}

// ─── 3. Parse sDoorAnimGraphicsTable[] entries ─────────────────────────────
//   { METATILE_X, DOOR_SOUND_Y, 1, sDoorAnimTiles_Z, sDoorAnimPalettes_W },
const out = {};
const tableMatch = text.match(/static const struct DoorGraphics sDoorAnimGraphicsTable\[\]\s*=\s*\{([\s\S]*?)\n\};/);
if (!tableMatch) {
  console.error('[doors] sDoorAnimGraphicsTable introuvable');
  process.exit(1);
}
const tableBody = tableMatch[1];
const entryRe = /\{\s*(METATILE_\w+)\s*,\s*(DOOR_SOUND_\w+)\s*,\s*(\d+)\s*,\s*sDoorAnimTiles_(\w+)\s*,\s*sDoorAnimPalettes_(\w+)\s*\}/g;
while ((m = entryRe.exec(tableBody)) !== null) {
  const metatileLabel = m[1];
  const sound = m[2];
  const size = parseInt(m[3], 10);
  const tilesName = m[4];
  const paletteName = m[5];
  const png = tilesToPng[tilesName] ?? null;
  out[metatileLabel] = {
    png,
    paletteSet: paletteName,
    paletteSlots: palettesByName[paletteName] ?? null,
    sound,
    size, // 1 = 16x32 (8 tiles), 2 = 32x32 (16 tiles)
    tilesName,
  };
}

writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('[doors]', {
  png_assets: Object.keys(tilesToPng).length,
  catalog_entries: Object.keys(out).length,
  sample: Object.entries(out).slice(0, 5).map(([mt, e]) => ({ mt, png: e.png, sound: e.sound })),
  output: outPath,
});
