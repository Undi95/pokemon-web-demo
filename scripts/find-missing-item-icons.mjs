#!/usr/bin/env node
import fs from 'node:fs';

const items = JSON.parse(fs.readFileSync('public/decomp/em/items.json', 'utf8'));
const iconMap = JSON.parse(fs.readFileSync('public/decomp/em/items/item-icon-map.json', 'utf8'));
const iconDir = 'public/decomp/em/items/icons';
const existingPngs = new Set(
  fs.readdirSync(iconDir).filter(f => f.endsWith('.png')).map(f => f.replace(/\.png$/, ''))
);
const missing = [];
for (const itemKey of Object.keys(items)) {
  if (itemKey === 'ITEM_NONE' || itemKey.startsWith('ITEM_B_USE')) continue;
  let slug;
  if (iconMap[itemKey]) slug = iconMap[itemKey];
  else if (itemKey.startsWith('ITEM_TM_')) slug = 'tm';
  else if (itemKey.startsWith('ITEM_HM_')) slug = 'hm';
  else slug = itemKey.replace(/^ITEM_/, '').toLowerCase();
  if (!existingPngs.has(slug)) {
    missing.push({ itemKey, slug });
  }
}
console.log(`total items checked: ${Object.keys(items).length - 1}`);
console.log(`missing PNGs: ${missing.length}`);
console.log('first 30 missing:');
for (const m of missing.slice(0, 30)) console.log(`  ${m.itemKey} → ${m.slug}.png`);

// Save list for next step
fs.writeFileSync('scripts/_missing-icons.json', JSON.stringify(missing.map(m => m.slug).filter((s, i, a) => a.indexOf(s) === i)));
console.log(`\nUnique slugs missing: ${JSON.parse(fs.readFileSync('scripts/_missing-icons.json', 'utf8')).length}`);
