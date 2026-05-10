#!/usr/bin/env node
/**
 * Extract item_icon_table.h + graphics/items.h → JSON mapping ITEM_X → file slug.
 *
 * Le décomp utilise gItemIcon_X partagé pour plusieurs items (TM/HM/Orb...).
 * Cette extraction donne le mapping 1:1 décomp pour _itemIconUrlBase().
 */
import fs from 'node:fs';

const TABLE_PATH = 'D:/Projet 1/decomps/pokeemeraude/src/data/item_icon_table.h';
const GFX_PATH = 'D:/Projet 1/decomps/pokeemeraude/src/data/graphics/items.h';
const OUT_PATH = 'public/decomp/em/items/item-icon-map.json';

const tableTxt = fs.readFileSync(TABLE_PATH, 'utf8');
const gfxTxt = fs.readFileSync(GFX_PATH, 'utf8');

const itemToIcon = {};
const tableRe = /\[(ITEM_[A-Z_0-9]+)\]\s*=\s*\{(gItemIcon_[A-Za-z0-9]+),/g;
let m;
while ((m = tableRe.exec(tableTxt))) itemToIcon[m[1]] = m[2];

const iconToPng = {};
const gfxRe = /const\s+u32\s+(gItemIcon_[A-Za-z0-9]+)\[\]\s*=\s*INCGFX_U32\("graphics\/items\/icons\/([a-z_0-9]+)\.png"/g;
while ((m = gfxRe.exec(gfxTxt))) iconToPng[m[1]] = m[2];

const itemToSlug = {};
for (const [item, icon] of Object.entries(itemToIcon)) {
  if (iconToPng[icon]) itemToSlug[item] = iconToPng[icon];
}

fs.writeFileSync(OUT_PATH, JSON.stringify(itemToSlug));
console.log(`items in table : ${Object.keys(itemToIcon).length}`);
console.log(`icon → png     : ${Object.keys(iconToPng).length}`);
console.log(`mapped         : ${Object.keys(itemToSlug).length}`);
console.log(`written        : ${OUT_PATH}`);
