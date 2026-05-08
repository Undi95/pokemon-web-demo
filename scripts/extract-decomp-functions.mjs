#!/usr/bin/env node
/**
 * extract-decomp-functions.mjs
 * ----------------------------
 * Extracteur générique de bodies de fonctions C depuis le décomp Pokémon Emerald.
 *
 * Pour chaque "category" déclarée, scanne tous les fichiers `.c` dans
 * `decomps/pokeemeraude/src/` et extrait le body des fonctions matching
 * la signature regex.
 *
 * Output : un fichier JSON par category dans `public/decomp/em/extracted/<cat>.json`
 *   { "FunctionName": { signature, body, callsTo: [...], srcFile } }
 *
 * Categories actuelles :
 *   - specials       : void Special_X(void)
 *   - scrcmd         : bool8 ScrCmd_X(struct ScriptContext *ctx)
 *   - metatile       : bool8 MetatileBehavior_IsX(u8 metatileBehavior)
 *   - fieldeffect    : bool8 FldEff_X(...) + helpers
 *   - movementtype   : void MovementType_X_Step*(struct ObjectEvent *, struct Sprite *)
 *
 * Cf. roadmap session 124 — Plan B/C : auto-port via transpiler.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDir = join(decompPath, 'src');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'extracted');
mkdirSync(outDir, { recursive: true });

// ─── Categories ──────────────────────────────────────────────────────────────

const categories = [
  {
    name: 'specials',
    // void Special_X(void) OR void X(void) referenced in specials.inc
    sigRegex: /(?:^|\n)(?:static\s+|inline\s+)*(?:void|bool8|u8|u16|u32|s8|s16|s32)\s+([A-Z][A-Za-z0-9_]*)\s*\(\s*(?:void|struct\s+ScriptContext\s*\*\s*\w+|u\d+\s+\w+)?\s*\)\s*\{/g,
    // Filter post-extract : keep only names from specials.inc list.
    filter: (name) => specialsListFromInc.has(name),
  },
  {
    name: 'scrcmd',
    // bool8 ScrCmd_X(struct ScriptContext *ctx)
    sigRegex: /(?:^|\n)(?:static\s+|inline\s+)*bool8\s+(ScrCmd_[A-Za-z0-9_]+)\s*\(\s*struct\s+ScriptContext\s*\*\s*\w+\s*\)\s*\{/g,
  },
  {
    name: 'metatile',
    // bool8 MetatileBehavior_IsX(u8 metatileBehavior)
    sigRegex: /(?:^|\n)(?:static\s+|inline\s+)*bool8\s+(MetatileBehavior_Is[A-Za-z0-9_]+)\s*\(\s*u8\s+\w+\s*\)\s*\{/g,
  },
  {
    name: 'movementtype',
    // u8 MovementType_X_StepN(struct ObjectEvent *, struct Sprite *)
    sigRegex: /(?:^|\n)(?:static\s+|inline\s+)*u8\s+(MovementType_[A-Za-z0-9_]+)\s*\(\s*struct\s+ObjectEvent\s*\*\s*\w+\s*,\s*struct\s+Sprite\s*\*\s*\w+\s*\)\s*\{/g,
  },
  {
    name: 'fieldeffect',
    // bool8 FldEff_X(...) — variable args
    sigRegex: /(?:^|\n)(?:static\s+|inline\s+)*(?:bool8|u8|u32|void)\s+(FldEff_[A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/g,
  },
];

// ─── Pre-pass : parse specials.inc to get the ordered name list ─────────────

const specialsListFromInc = new Set();
const specialsIncPath = join(decompPath, 'data', 'specials.inc');
if (existsSync(specialsIncPath)) {
  const inc = readFileSync(specialsIncPath, 'utf8');
  const re = /^\s*def_special\s+([A-Za-z_][A-Za-z0-9_]*)/gm;
  let m;
  while ((m = re.exec(inc)) !== null) specialsListFromInc.add(m[1]);
  console.log(`[extract-decomp-functions] specials.inc list : ${specialsListFromInc.size} names`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findMatchingBrace(s, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

function extractCallsTo(body) {
  const calls = new Set();
  const re = /\b([A-Z_][A-Za-z0-9_]+)\s*\(/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = m[1];
    // Skip macros / common keywords / types
    const skip = new Set(['TRUE', 'FALSE', 'NULL', 'DIR_SOUTH', 'DIR_NORTH', 'DIR_WEST', 'DIR_EAST',
      'IF', 'IFDEF', 'IFNDEF', 'ELSE', 'ENDIF', 'COLOR', 'RGB', 'RGB_BLACK', 'RGB_WHITE']);
    if (skip.has(name)) continue;
    calls.add(name);
  }
  return [...calls].sort();
}

// ─── Scan all .c files ───────────────────────────────────────────────────────

const cFiles = globSync(`${srcDir.replace(/\\/g, '/')}/*.c`);
console.log(`[extract-decomp-functions] scanning ${cFiles.length} .c files`);

const extractedByCategory = {};
for (const cat of categories) extractedByCategory[cat.name] = {};

let totalExtracted = 0;
for (const fpath of cFiles) {
  const fname = basename(fpath, '.c');
  const raw = readFileSync(fpath, 'utf8');
  const cleaned = stripComments(raw);

  for (const cat of categories) {
    cat.sigRegex.lastIndex = 0;  // reset state
    let m;
    while ((m = cat.sigRegex.exec(cleaned)) !== null) {
      const name = m[1];
      if (cat.filter && !cat.filter(name)) continue;
      const sigStart = m.index + (m[0].startsWith('\n') ? 1 : 0);
      const openBrace = m.index + m[0].length - 1;
      const closeBrace = findMatchingBrace(cleaned, openBrace);
      if (closeBrace === -1) continue;
      const signature = cleaned.slice(sigStart, openBrace).trim();
      const body = cleaned.slice(openBrace + 1, closeBrace).trim();
      // Skip if already extracted (= keep longest body if duplicate)
      const prev = extractedByCategory[cat.name][name];
      if (prev && prev.body.length >= body.length) continue;
      extractedByCategory[cat.name][name] = {
        signature,
        body,
        callsTo: extractCallsTo(body),
        srcFile: `src/${fname}.c`,
      };
      if (!prev) totalExtracted++;
    }
  }
}

// ─── Write per-category JSONs ───────────────────────────────────────────────

const summary = { generatedAt: new Date().toISOString().slice(0, 10), totalExtracted };
for (const cat of categories) {
  const data = extractedByCategory[cat.name];
  const outPath = join(outDir, `${cat.name}.json`);
  writeFileSync(outPath, JSON.stringify({
    category: cat.name,
    count: Object.keys(data).length,
    functions: data,
  }, null, 2));
  summary[cat.name] = Object.keys(data).length;
  console.log(`[extract-decomp-functions] ${cat.name} : ${Object.keys(data).length} functions → ${outPath}`);
}

writeFileSync(join(outDir, '_summary.json'), JSON.stringify(summary, null, 2));
console.log(`[extract-decomp-functions] DONE — total ${totalExtracted} functions extracted`);
