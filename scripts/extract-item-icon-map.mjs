#!/usr/bin/env node
/**
 * Extract item_icon_table.h + graphics/items.h → JSON mappings ITEM_X → file slugs.
 *
 * Le décomp utilise gItemIcon_X partagé pour plusieurs items (TM/HM/Orb...)
 * avec une palette gItemIconPalette_X DIFFÉRENTE par item (= Red Orb vs
 * Blue Orb = même sprite, palettes différentes).
 *
 * Génère 2 JSON :
 *   - item-icon-map.json : ITEM_X → sprite file slug
 *   - item-palette-map.json : ITEM_X → palette file slug
 *
 * Copie aussi tous les .pal vers public/decomp/em/items/icon_palettes/.
 */
import fs from 'node:fs';
import path from 'node:path';

const TABLE_PATH = 'D:/Projet 1/decomps/pokeemeraude/src/data/item_icon_table.h';
const GFX_PATH = 'D:/Projet 1/decomps/pokeemeraude/src/data/graphics/items.h';
const PAL_SRC_DIR = 'D:/Projet 1/decomps/pokeemeraude/graphics/items/icon_palettes';
const PAL_DST_DIR = 'public/decomp/em/items/icon_palettes';
const ICON_OUT_PATH = 'public/decomp/em/items/item-icon-map.json';
const PAL_OUT_PATH = 'public/decomp/em/items/item-palette-map.json';

const tableTxt = fs.readFileSync(TABLE_PATH, 'utf8');
const gfxTxt = fs.readFileSync(GFX_PATH, 'utf8');

// Parse item_icon_table.h : [ITEM_X] = {gItemIcon_Y, gItemIconPalette_Z}
const itemToIcon = {};
const itemToPaletteSym = {};
const tableRe = /\[(ITEM_[A-Z_0-9]+)\]\s*=\s*\{\s*(gItemIcon_[A-Za-z0-9]+)\s*,\s*(gItemIconPalette_[A-Za-z0-9]+)\s*\}/g;
let m;
while ((m = tableRe.exec(tableTxt))) {
  itemToIcon[m[1]] = m[2];
  itemToPaletteSym[m[1]] = m[3];
}

// Parse graphics/items.h pour mapper symbole → file slug.
const iconToPng = {};
const gfxIconRe = /const\s+u32\s+(gItemIcon_[A-Za-z0-9]+)\[\]\s*=\s*INCGFX_U32\("graphics\/items\/icons\/([a-z_0-9]+)\.png"/g;
while ((m = gfxIconRe.exec(gfxTxt))) iconToPng[m[1]] = m[2];

const palSymToFile = {};
// Le décomp utilise INCGFX_U32 + suffix ".gbapal.lz" (compressed). Source = .pal.
const gfxPalRe = /const\s+u32\s+(gItemIconPalette_[A-Za-z0-9]+)\[\]\s*=\s*INCGFX_U32\("graphics\/items\/icon_palettes\/([a-z_0-9]+)\.pal"/g;
while ((m = gfxPalRe.exec(gfxTxt))) palSymToFile[m[1]] = m[2];

// Combine.
const itemToIconSlug = {};
const itemToPalSlug = {};
for (const [item, icon] of Object.entries(itemToIcon)) {
  if (iconToPng[icon]) itemToIconSlug[item] = iconToPng[icon];
  const palSym = itemToPaletteSym[item];
  if (palSym && palSymToFile[palSym]) itemToPalSlug[item] = palSymToFile[palSym];
}

// Extra : map nos items.json nommés (ITEM_TM_FOCUS_PUNCH) vers la palette
// de ITEM_TM01 (décomp). descriptionLabel = "sTM01Desc" → numéro TM01.
// Sans ça, TOUS nos CT partagent la même palette (= bug "tous mêmes
// sprite" reporté par user). Pareil pour CS / HMs.
const ourItems = JSON.parse(fs.readFileSync('public/decomp/em/items.json', 'utf8'));
for (const [itemKey, def] of Object.entries(ourItems)) {
  if (!itemKey.startsWith('ITEM_TM_') && !itemKey.startsWith('ITEM_HM_')) continue;
  const label = def?.descriptionLabel;
  if (!label) continue;
  // sTM01Desc → ITEM_TM01, sHM03Desc → ITEM_HM03.
  const m2 = label.match(/^s(TM|HM)(\d+)Desc$/);
  if (!m2) continue;
  const decompKey = `ITEM_${m2[1]}${m2[2]}`;
  if (itemToIconSlug[decompKey]) itemToIconSlug[itemKey] = itemToIconSlug[decompKey];
  if (itemToPalSlug[decompKey]) itemToPalSlug[itemKey] = itemToPalSlug[decompKey];
}

fs.writeFileSync(ICON_OUT_PATH, JSON.stringify(itemToIconSlug));
fs.writeFileSync(PAL_OUT_PATH, JSON.stringify(itemToPalSlug));

// Copy all .pal files.
fs.mkdirSync(PAL_DST_DIR, { recursive: true });
const palFiles = fs.readdirSync(PAL_SRC_DIR).filter(f => f.endsWith('.pal'));
for (const f of palFiles) {
  fs.copyFileSync(path.join(PAL_SRC_DIR, f), path.join(PAL_DST_DIR, f));
}

console.log(`items in table   : ${Object.keys(itemToIcon).length}`);
console.log(`icon → png       : ${Object.keys(iconToPng).length}`);
console.log(`palette → file   : ${Object.keys(palSymToFile).length}`);
console.log(`item icon mapped : ${Object.keys(itemToIconSlug).length}`);
console.log(`item pal mapped  : ${Object.keys(itemToPalSlug).length}`);
console.log(`palettes copied  : ${palFiles.length} → ${PAL_DST_DIR}/`);
console.log(`written          : ${ICON_OUT_PATH}, ${PAL_OUT_PATH}`);
