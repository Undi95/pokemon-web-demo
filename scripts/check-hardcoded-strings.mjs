#!/usr/bin/env node
/**
 * check-hardcoded-strings.mjs
 * ----------------------------
 * Détecte les literals string capitalisés (≥4 chars, "TYPE", "POKéMON", etc.)
 * dans src/engine/ qui devraient être chargés via getString('gText_*') depuis
 * /decomp/em/strings.json.
 *
 * Usage :
 *   node scripts/check-hardcoded-strings.mjs              # rapport stdout
 *   node scripts/check-hardcoded-strings.mjs --json       # JSON output
 *   node scripts/check-hardcoded-strings.mjs file=bag     # filter
 *
 * Heuristique :
 *   1. Charger /decomp/em/strings.json → set des `gText_*` disponibles.
 *   2. Pour chaque .ts dans src/engine/, grep literals (single or double quoted) :
 *      - Skip comments
 *      - Skip imports / from clauses
 *      - Skip types / interfaces
 *      - Skip URL paths (/decomp/em/...)
 *      - Filter : long enough (≥4 chars), capitalized words (= probable UI text)
 *   3. Check si la string apparaît comme valeur dans strings.json :
 *      - Si OUI → suggère replacement par `getString('gText_X')`
 *      - Si NON → flag comme "hardcode pas dans strings.json — vérifier"
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const srcEngine = join(projectRoot, 'src', 'engine');
const stringsJsonPath = join(projectRoot, 'public', 'decomp', 'em', 'strings.json');

// ─── Load strings.json ───────────────────────────────────────────────────────

if (!existsSync(stringsJsonPath)) {
  console.error('strings.json not found:', stringsJsonPath);
  process.exit(1);
}
const stringsJson = JSON.parse(readFileSync(stringsJsonPath, 'utf8'));
// Reverse map : string value → gText_* key (for suggestion)
const valueToKey = new Map();
for (const [key, value] of Object.entries(stringsJson)) {
  if (!key.startsWith('gText_')) continue;
  // Some strings have escape codes — strip $$$ trailing
  const cleaned = String(value).trim();
  if (!valueToKey.has(cleaned)) valueToKey.set(cleaned, key);
}

console.error(`Loaded ${valueToKey.size} gText_* values from strings.json`);

// ─── Walk src/engine ─────────────────────────────────────────────────────────

function walk(dir, results = []) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (f === 'auto' || f === 'auto-asm' || f === 'auto-asm-bytecode' || f === 'auto-engine' || f === 'auto-tasks' || f === 'auto-test') continue;
      walk(full, results);
    } else if (f.endsWith('.ts') && !f.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

const tsFiles = walk(srcEngine);

// ─── Heuristic string detection ──────────────────────────────────────────────

const LITERAL_RE = /(['"])((?:\\\1|(?:(?!\1).))*)\1/g;

// Capitalized = first char uppercase A-Z OR special POKé / etc.
const isUiTextHeuristic = (s) => {
  if (s.length < 4) return false;
  if (s.length > 200) return false;
  if (s.includes('\n')) return false;
  // Skip imports / paths / urls
  if (s.startsWith('/') || s.startsWith('./') || s.startsWith('../') || s.startsWith('http')) return false;
  if (s.includes('@')) return false;
  // Skip TS identifiers (camelCase or PascalCase without space/accents)
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) return false;
  // Skip CSS / hex / digits-only
  if (/^[0-9a-fA-F]+$/.test(s)) return false;
  // Heuristic : contains uppercase letter + accent or space
  if (/[A-ZÀ-ÿ]/.test(s) && /[A-ZÀ-ÿa-zàéèêëïîôöùûü\s'!?\.,]{4,}/.test(s)) {
    // Skip code-like : "ITEM_X", "FLAG_X", "PALETTE_X", "OBJECT_X", etc.
    if (/^[A-Z_0-9]+$/.test(s)) return false;
    return true;
  }
  return false;
};

function stripCommentsAndImports(content) {
  // remove /* ... */ multiline comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // remove // single-line comments
  content = content.replace(/^\s*\/\/.*$/gm, '');
  // remove import/export lines
  content = content.replace(/^\s*(import|export)\s.*$/gm, '');
  return content;
}

// ─── Scan ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isJson = args.includes('--json');
const fileFilter = args.find(a => a.startsWith('file='))?.split('=')[1];
const outputArg = args.find(a => a.startsWith('--output='));
const outputFile = outputArg?.split('=')[1];

const findings = [];
for (const tsFile of tsFiles) {
  if (fileFilter && !tsFile.includes(fileFilter)) continue;
  const content = readFileSync(tsFile, 'utf8');
  const stripped = stripCommentsAndImports(content);
  const lines = content.split('\n');

  let m;
  LITERAL_RE.lastIndex = 0;
  while ((m = LITERAL_RE.exec(stripped))) {
    const value = m[2];
    if (!isUiTextHeuristic(value)) continue;
    // Find original line number from raw content
    const charsBefore = stripped.slice(0, m.index);
    // Approximate line number via newlines in stripped — not exact but close.
    // Better : search the literal in raw content.
    const idxRaw = content.indexOf(m[0]);
    const lineNum = idxRaw >= 0 ? content.slice(0, idxRaw).split('\n').length : -1;
    const suggested = valueToKey.get(value);
    findings.push({
      file: tsFile.replace(projectRoot, '').replace(/\\/g, '/'),
      line: lineNum,
      value,
      suggested,
      context: lines[lineNum - 1]?.trim().slice(0, 120),
    });
  }
}

// ─── Output ──────────────────────────────────────────────────────────────────

if (isJson || outputFile?.endsWith('.json')) {
  const json = JSON.stringify(findings, null, 2);
  if (outputFile) writeFileSync(outputFile, json);
  else console.log(json);
} else if (outputFile?.endsWith('.md')) {
  let out = '# Hardcoded strings audit\n\n';
  out += `Generated : ${new Date().toISOString()}\n\n`;
  out += `Total findings : ${findings.length}\n\n`;
  const matchedCount = findings.filter(f => f.suggested).length;
  out += `Suggestions available (matched in strings.json) : ${matchedCount}\n\n`;
  out += `Hardcodes WITHOUT match in strings.json : ${findings.length - matchedCount}\n\n`;
  // Group by file
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  for (const [file, items] of byFile) {
    out += `## \`${file}\` (${items.length} findings)\n\n`;
    for (const item of items) {
      out += `- line ${item.line}: \`"${item.value}"\``;
      if (item.suggested) {
        out += ` → suggested: \`getString('${item.suggested}')\``;
      } else {
        out += ` → **no match in strings.json**`;
      }
      out += '\n';
    }
    out += '\n';
  }
  writeFileSync(outputFile, out);
  console.error(`Markdown report written to ${outputFile}`);
} else {
  // stdout summary
  console.log(`Total findings : ${findings.length}`);
  console.log(`With suggestion : ${findings.filter(f => f.suggested).length}`);
  console.log(`Without suggestion : ${findings.filter(f => !f.suggested).length}`);
  console.log('');
  for (const f of findings.slice(0, 100)) {
    const sugg = f.suggested ? ` → gText: ${f.suggested}` : ' [no match]';
    console.log(`${f.file}:${f.line}: "${f.value}"${sugg}`);
  }
  if (findings.length > 100) console.log(`... +${findings.length - 100} more`);
}
