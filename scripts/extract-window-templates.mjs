#!/usr/bin/env node
/**
 * Parse les `static const struct WindowTemplate s<Name>[]` dans les fichiers
 * C du décomp pour extraire toutes les positions/tailles/palettes des boxes UI.
 *
 * Sortie : public/decomp/em/window-templates.json
 *   { "sStandardTextBox": [{bg, tilemapLeft, tilemapTop, width, height, paletteNum, baseBlock}, ...], ... }
 *
 * Cf. WINDOWS_BOXES_REFERENCE.md pour le catalogue exhaustif.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'window-templates.json');
mkdirSync(dirname(outPath), { recursive: true });

/** Scan récursif de tous les .c dans src/. */
function listAllCFiles(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listAllCFiles(full));
    else if (f.endsWith('.c')) out.push(full);
  }
  return out;
}

/** Parse une valeur literal C : décimal, hex, ou expression simple. */
function parseValue(s) {
  s = s.trim().replace(/,$/, '').trim();
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return Number(s);
  // Expressions trop complexes (ex: TILE_BASE) → renvoyer le string tel quel
  return s;
}

/** Extrait les champs d'un struct body. */
function parseStructBody(body) {
  const fields = {};
  const re = /\.(\w+)\s*=\s*([^,}]+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    fields[m[1]] = parseValue(m[2]);
  }
  return fields;
}

/** Pour un fichier source, extrait tous les WindowTemplate trouvés. */
function parseFile(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  // Pattern : static [const] struct WindowTemplate sName[OPT_SIZE] = { ... };
  //       OU: static [const] struct WindowTemplate sName = { ... };
  //       OU: const struct WindowTemplate gName[] = { ... };
  const re = /(?:static\s+)?(?:const\s+)?struct\s+WindowTemplate\s+(\w+)(?:\[[^\]]*\])?\s*=\s*\{([\s\S]*?)\n\};/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const body = m[2];
    // Détecte si c'est un array de structs ({{...},{...}}) ou un struct simple ({.x=...})
    const structRe = /\{([\s\S]*?)\}/g;
    const entries = [];
    let s;
    while ((s = structRe.exec(body)) !== null) {
      const fields = parseStructBody(s[1]);
      if (Object.keys(fields).length > 0) entries.push(fields);
    }
    if (entries.length === 0) {
      // Pas de braces nested : le body EST le struct (cas sYesNo).
      const fields = parseStructBody(body);
      if (Object.keys(fields).length > 0) out[name] = fields;
    } else if (entries.length === 1) {
      out[name] = entries[0];
    } else {
      out[name] = entries;
    }
  }
  return out;
}

const srcDir = join(decompPath, 'src');
const all = {};
for (const f of listAllCFiles(srcDir)) {
  Object.assign(all, parseFile(f));
}

writeFileSync(outPath, JSON.stringify(all, null, 2));
console.log('[window-templates]', {
  count: Object.keys(all).length,
  sample_keys: Object.keys(all).slice(0, 5),
  output: outPath
});
