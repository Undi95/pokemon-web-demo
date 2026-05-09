#!/usr/bin/env node
/**
 * Detect SpriteTemplate references to anim tables that are NOT defined in
 * SPRITE_ANIM_TABLES. Same bug pattern as title screen (= sStartCopyright
 * BannerAnimTable referenced but missing because extractor doesn't handle
 * designated initializer C syntax `[INDEX] = value`).
 */
import { readFileSync } from 'fs';

const src = readFileSync('src/engine/decomp-data/auto/src/sprite-system.ts', 'utf8');

// Extract SPRITE_ANIM_TABLES keys
const tableMatch = src.match(/export const SPRITE_ANIM_TABLES = \{([\s\S]+?)\n\}\s*as const;/);
const definedTables = new Set();
if (tableMatch) {
  const re = /"([^"]+)":\s*\{"anims":/g;
  let m;
  while ((m = re.exec(tableMatch[1]))) definedTables.add(m[1]);
}

// Extract SPRITE_TEMPLATES anim references
const templateBlock = src.match(/export const SPRITE_TEMPLATES = \{([\s\S]+?)\n\}\s*as const;/);
const referenced = new Map(); // animTableName → [templateName1, ...]
if (templateBlock) {
  const re = /"([^"]+)":\s*\{[^}]*"anims":"([^"]+)"/g;
  let m;
  while ((m = re.exec(templateBlock[1]))) {
    const [, templateName, animTable] = m;
    if (animTable === 'gDummySpriteAnimTable' || animTable === 'NULL') continue;
    if (!referenced.has(animTable)) referenced.set(animTable, []);
    referenced.get(animTable).push(templateName);
  }
}

// Find missing
const missing = [];
for (const [animTable, templates] of referenced) {
  if (!definedTables.has(animTable)) {
    missing.push({ animTable, usedBy: templates });
  }
}

console.log(`SPRITE_ANIM_TABLES defined : ${definedTables.size}`);
console.log(`SPRITE_TEMPLATES referenced anim tables : ${referenced.size}`);
console.log(`Missing tables : ${missing.length}`);
console.log();
if (missing.length > 0) {
  console.log('MISSING anim tables (= same bug as sStartCopyrightBannerAnimTable) :');
  for (const m of missing) {
    console.log(`  ⚠️ ${m.animTable}`);
    for (const t of m.usedBy) console.log(`     used by ${t}`);
  }
} else {
  console.log('✅ All anim tables defined.');
}

// ─── Affine anim tables ────────────────────────────────────────────────────
console.log();
const affineTableMatch = src.match(/export const SPRITE_AFFINE_ANIM_TABLES = \{([\s\S]+?)\n\}\s*as const;/);
const definedAffine = new Set();
if (affineTableMatch) {
  const re = /"([^"]+)":\s*\{"affineAnims":/g;
  let m;
  while ((m = re.exec(affineTableMatch[1]))) definedAffine.add(m[1]);
}

const referencedAffine = new Map();
if (templateBlock) {
  const re = /"([^"]+)":\s*\{[^}]*"affineAnims":"([^"]+)"/g;
  let m;
  while ((m = re.exec(templateBlock[1]))) {
    const [, templateName, animTable] = m;
    if (animTable === 'gDummySpriteAffineAnimTable' || animTable === 'NULL') continue;
    if (!referencedAffine.has(animTable)) referencedAffine.set(animTable, []);
    referencedAffine.get(animTable).push(templateName);
  }
}

const missingAffine = [];
for (const [animTable, templates] of referencedAffine) {
  if (!definedAffine.has(animTable)) {
    missingAffine.push({ animTable, usedBy: templates });
  }
}

console.log(`SPRITE_AFFINE_ANIM_TABLES defined : ${definedAffine.size}`);
console.log(`SPRITE_TEMPLATES referenced affine tables : ${referencedAffine.size}`);
console.log(`Missing affine tables : ${missingAffine.length}`);
if (missingAffine.length > 0) {
  console.log();
  console.log('MISSING affine anim tables :');
  for (const m of missingAffine) {
    console.log(`  ⚠️ ${m.animTable}`);
    for (const t of m.usedBy) console.log(`     used by ${t}`);
  }
} else {
  console.log('✅ All affine anim tables defined.');
}
