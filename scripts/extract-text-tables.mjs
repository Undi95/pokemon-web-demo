#!/usr/bin/env node
/**
 * Parse les `data/text/*.h` du décomp pour produire les tables de noms FR
 * et descriptions, regroupés dans public/decomp/em/text-tables.json.
 *
 * Sources (toutes dans `src/data/text/`) :
 *   - species_names.h        → species      { SPECIES_X: "NOM" }
 *   - move_names.h           → moves        { MOVE_X: "NOM" }
 *   - trainer_class_names.h  → trainer_classes { TRAINER_CLASS_X: "NOM" }
 *   - nature_names.h         → natures      { NATURE_X: "NOM" }
 *   - item_descriptions.h    → item_descriptions { sXxxDesc: "description multi-lignes" }
 *   - move_descriptions.h    → move_descriptions { sXxxDesc: "..." }
 *   - abilities.h            → ability_descriptions { sXxxDescription: "..." }
 *   - nature_names.h         → natures (parsing par label `sHardyNatureName` → NATURE_HARDY)
 *
 * Permet : opcodes bufferspeciesname, buffermovename, buffertrainerclassname,
 *          résolution des `descriptionLabel` dans items.json, etc.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'text-tables.json');
mkdirSync(dirname(outPath), { recursive: true });

const textDir = join(decompPath, 'src', 'data', 'text');

/** Parse `[ENUM_X] = _("text")` arrays. */
function parseEnumArray(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  const re = /\[(\w+)\]\s*=\s*_\("((?:[^"\\]|\\.)*)"\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out[m[1]] = m[2].replace(/\\n/g, '\n');
  }
  return out;
}

/** Parse `static const u8 sLabel[] = _("text");` ou multi-lines avec
 *  `_("..." "..." "...")`. */
function parseStaticLabels(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  // Match : `static const u8 sLabel[] = _( ... )` jusqu'au `);`
  const re = /static\s+const\s+u8\s+(\w+)\s*\[\s*\]\s*=\s*_\(\s*([\s\S]*?)\s*\)\s*;/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const label = m[1];
    // Le contenu peut être plusieurs strings concatenées : "abc" "def\n"
    const stringsRe = /"((?:[^"\\]|\\.)*)"/g;
    let s;
    let combined = '';
    while ((s = stringsRe.exec(m[2])) !== null) {
      combined += s[1].replace(/\\n/g, '\n');
    }
    out[label] = combined;
  }
  return out;
}

/** Convertit `sHardyNatureName` → `NATURE_HARDY`, `sBoldNatureName` → `NATURE_BOLD`. */
function natureLabelToEnum(label) {
  // sHardyNatureName → Hardy → HARDY
  const m = label.match(/^s(\w+)NatureName$/);
  if (!m) return null;
  return 'NATURE_' + m[1].toUpperCase();
}

const out = {
  species: parseEnumArray(join(textDir, 'species_names.h')),
  moves: parseEnumArray(join(textDir, 'move_names.h')),
  trainer_classes: parseEnumArray(join(textDir, 'trainer_class_names.h')),
  item_descriptions: parseStaticLabels(join(textDir, 'item_descriptions.h')),
  move_descriptions: parseStaticLabels(join(textDir, 'move_descriptions.h')),
  ability_descriptions: parseStaticLabels(join(textDir, 'abilities.h')),
  natures: {},
};

// Natures : conversion labels → enum
const natureLabels = parseStaticLabels(join(textDir, 'nature_names.h'));
for (const [label, name] of Object.entries(natureLabels)) {
  const en = natureLabelToEnum(label);
  if (en) out.natures[en] = name;
}

writeFileSync(outPath, JSON.stringify(out));
console.log('[text-tables]', {
  species: Object.keys(out.species).length,
  moves: Object.keys(out.moves).length,
  trainer_classes: Object.keys(out.trainer_classes).length,
  natures: Object.keys(out.natures).length,
  item_descriptions: Object.keys(out.item_descriptions).length,
  move_descriptions: Object.keys(out.move_descriptions).length,
  ability_descriptions: Object.keys(out.ability_descriptions).length,
  output: outPath
});
