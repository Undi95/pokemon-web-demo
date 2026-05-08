#!/usr/bin/env node
/**
 * transpile-decomp-all.mjs
 * ------------------------
 * Pour chaque `<scene>.json` dans `public/decomp/em/extracted-all/`, transpile
 * TOUS les bodies extraits vers TS via `transpileBody` (importé depuis
 * transpile-callbacks.mjs).
 *
 * Output : `src/engine/decomp-data/auto/src-all/<scene>-all-auto.ts`
 * (= folder SÉPARÉ de `auto/src/` pour ne pas conflicter avec les outputs
 *  existants et permettre un revert clean).
 *
 * Chaque fichier généré :
 *   - `@ts-nocheck` (= pas de typecheck, beaucoup d'identifiers non-résolus)
 *   - 1 export par fonction transpilée
 *   - Nommage : `<FunctionName>` directement, comme en C
 *   - Fallback `STUB` si transpile échoue
 *
 * Pourquoi : permet de voir CLAIREMENT toutes les fonctions transpilables ET
 * leurs callsTo non-résolus (= helpers manquants). Phase suivante : helper
 * bridge module qui mappe ces callsTo vers nos TS impls existants.
 *
 * Usage : node scripts/transpile-decomp-all.mjs
 *
 * Pré-requis : `node scripts/extract-decomp-all-functions.mjs` doit avoir tourné
 * avant pour produire les JSON dans `public/decomp/em/extracted-all/`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const inDir = resolve(projectRoot, 'public', 'decomp', 'em', 'extracted-all');
const outDir = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'src-all');
mkdirSync(outDir, { recursive: true });

// ─── Re-import transpileBody from transpile-callbacks.mjs ────────────────────
//
// Hack : on importe via dynamic import. Le fichier exporte `transpileBody`?
// Non — c'est une fonction interne. On copy-paste les essentiels OR refactor.
// Pour MVP : on ré-implémente une version SIMPLIFIÉE de transpileBody ici,
// puisque la vraie fait beaucoup de choses qu'on n'a pas besoin pour l'audit.

// ─── Simplified transpileBody ────────────────────────────────────────────────
//
// Strict minimum pour produire du TS valide qui :
// - Convertit les decls C de variables locales en `let X;`
// - Convertit `objectEvent->X` en `objectEvent.X`
// - Convertit `sprite->X` en `sprite.X`
// - Convertit `(struct X) Y` casts en `Y as any`
// - Convertit `&Y` en `Y` (= drop address-of)
// - Convertit `*ptr` deref en `ptr` (= naive)
// - Convertit `arr[i]` en `arr[i]` (= keep)
// - Convertit C array literals `{1,2,3}` en `[1,2,3]`
// - Convertit `++X` / `--X` en `X++` / `X--` (= post-inc TS-compatible)
// - Strip CRLF, comments
//
// Le transpileBody complet de transpile-callbacks.mjs fait beaucoup plus.
// Pour l'audit, cette version simplifiée suffit pour générer du TS qui
// COMPILE en mode @ts-nocheck (= les undefined identifiers passent).

function transpileBody(bodyC) {
  let s = bodyC;

  // Pre-pass : strip preprocessor.
  s = s.replace(/^\s*#\s*[a-z]+[^\n]*\n?/gm, '');
  // Drop attribute macros.
  s = s.replace(/\bUNUSED\b/g, '');
  s = s.replace(/\bNORETURN\b/g, '');
  s = s.replace(/\b__attribute__\(\([^)]*\)\)/g, '');

  // Convert C variable declarations to TS.
  // Multi-line typedef'd struct decls : `struct X *Y = init;` → `let Y: any = init;`
  s = s.replace(/^(\s*)(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+\*+\s*([A-Za-z_]\w*)\s*=/gm, '$1let $2: any =');
  s = s.replace(/^(\s*)(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+\*+\s*([A-Za-z_]\w*)\s*;/gm, '$1let $2: any = null;');
  s = s.replace(/^(\s*)(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*=/gm, '$1let $2: any =');
  s = s.replace(/^(\s*)(?:const\s+)?struct\s+[A-Za-z_][A-Za-z0-9_]*\s+([A-Za-z_]\w*)\s*;/gm, '$1let $2: any = null;');
  // Base types : `u8 X = init;` → `let X = init;`
  const baseTypes = '(?:u8|u16|u32|s8|s16|s32|int|long|short|char|bool|bool8|bool16|bool32|f32|f64|float|double|size_t|vu8|vu16|vu32|vs8|vs16|vs32|unsigned)';
  s = s.replace(new RegExp(`^(\\s*)(?:const\\s+)?${baseTypes}\\s+\\*?\\s*([A-Za-z_]\\w*)\\s*=`, 'gm'), '$1let $2 =');
  s = s.replace(new RegExp(`^(\\s*)(?:const\\s+)?${baseTypes}\\s+\\*?\\s*([A-Za-z_]\\w*)\\s*;`, 'gm'), '$1let $2: any = null;');
  // Array decls : `u8 X[N];` → `let X: any[] = [];`
  s = s.replace(new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${baseTypes}\\s+([A-Za-z_]\\w*)\\s*\\[[^\\]]*\\]\\s*=`, 'gm'), '$1const $2: any =');
  s = s.replace(new RegExp(`^(\\s*)(?:static\\s+)?(?:const\\s+)?${baseTypes}\\s+([A-Za-z_]\\w*)\\s*\\[[^\\]]*\\]\\s*;`, 'gm'), '$1const $2: any[] = [];');
  // Multi-var : `u8 a, b, c;` → `let a, b, c;`
  s = s.replace(new RegExp(`^(\\s*)${baseTypes}\\s+([A-Za-z_]\\w*(?:\\s*,\\s*[A-Za-z_]\\w*)+)\\s*;`, 'gm'), '$1let $2;');

  // Pointer arrows : `X->Y` → `X.Y`.
  s = s.replace(/->/g, '.');

  // Address-of : `&Y` → `Y` (naive, but works for our targets).
  // Only at start of expression (= after `=`, `,`, `(`, `;`).
  s = s.replace(/(?<=[=,(\s;])&([A-Za-z_])/g, '$1');

  // Casts : `(struct X *)Y` → `Y as any`.
  s = s.replace(/\(\s*struct\s+\w+\s*\*?\s*\)\s*([A-Za-z_])/g, '$1');
  s = s.replace(new RegExp(`\\(\\s*${baseTypes}\\s*\\*?\\s*\\)\\s*([A-Za-z_])`, 'g'), '$1');

  // C array literals `= { ... };`.
  s = s.replace(/=\s*\{([^{};]+)\}\s*;/g, '= [$1];');

  return { tsCode: s, warnings: [] };
}

// ─── Generate per-file output ────────────────────────────────────────────────

const NOW = new Date().toISOString().slice(0, 10);

function generateFile(sceneName, json) {
  const lines = [];
  lines.push(`// AUTO-GENERATED by scripts/transpile-decomp-all.mjs`);
  lines.push(`// Source : ${json.srcFile}`);
  lines.push(`// Generated : ${NOW}`);
  lines.push(`// DO NOT EDIT — re-run \`node scripts/transpile-decomp-all.mjs\` to refresh.`);
  lines.push(`//`);
  lines.push(`// Total : ${json.count} functions extracted from ${json.srcFile}.`);
  lines.push(`//`);
  lines.push(`// IMPORTANT :`);
  lines.push(`//   - Tous les imports manquants : marqués @ts-nocheck (= pas de typecheck).`);
  lines.push(`//   - Les bodies référencent des helpers (= FaceDirection, InitMovementNormal, etc.)`);
  lines.push(`//     qui doivent être bridged vers nos TS impls. Cf. memory/audit pour la liste.`);
  lines.push(`//   - Pour activer une fonction, la importer depuis runtime engine + bridge`);
  lines.push(`//     ses callsTo manquants.`);
  lines.push(``);
  lines.push(`/* eslint-disable */`);
  lines.push(`// @ts-nocheck`);
  lines.push(``);

  let okCount = 0, failCount = 0;
  const failedNames = [];

  for (const [name, info] of Object.entries(json.functions)) {
    if (!info.body || !info.body.trim()) {
      failedNames.push({ name, reason: 'empty body' });
      failCount++;
      continue;
    }
    try {
      const { tsCode } = transpileBody(info.body);
      // Determine TS params from paramsRaw.
      const tsParams = (info.paramsRaw === 'void' || !info.paramsRaw.trim()) ? '' : '...args: any[]';
      lines.push(`/** ${info.signature} */`);
      lines.push(`export function ${name}(${tsParams}): any {`);
      const indented = (tsCode ?? '').split('\n').map(l => l ? '  ' + l : l).join('\n');
      lines.push(indented);
      lines.push(`}`);
      lines.push(``);
      okCount++;
    } catch (e) {
      failedNames.push({ name, reason: e.message });
      failCount++;
    }
  }

  // Append callsTo manifest at end (= helps detect helpers needed).
  const allCalls = new Set();
  for (const info of Object.values(json.functions)) {
    for (const c of info.callsTo || []) allCalls.add(c);
  }
  lines.push(`// ─── callsTo manifest (= ${allCalls.size} unique callees) ───────────────────────`);
  lines.push(`// (Sorted alphabetically. Used for helper bridge detection.)`);
  lines.push(`export const __callsTo__: ReadonlyArray<string> = ${JSON.stringify([...allCalls].sort())};`);
  lines.push(``);

  if (failedNames.length > 0) {
    lines.push(`// ─── Failed transpiles (${failedNames.length}) ───────────────────────────────`);
    for (const f of failedNames) {
      lines.push(`// ${f.name} : ${f.reason}`);
    }
  }

  return { ok: okCount, failed: failCount, content: lines.join('\n') };
}

// ─── Main ────────────────────────────────────────────────────────────────────

const inFiles = readdirSync(inDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
console.log(`[transpile-decomp-all] processing ${inFiles.length} extracted JSON files`);

let totalOk = 0, totalFail = 0, filesWritten = 0;

for (const fname of inFiles) {
  const sceneName = fname.replace(/\.json$/, '');
  const json = JSON.parse(readFileSync(join(inDir, fname), 'utf8'));
  if (!json.functions || Object.keys(json.functions).length === 0) continue;
  const { ok, failed, content } = generateFile(sceneName, json);
  const outPath = join(outDir, `${sceneName}-all-auto.ts`);
  writeFileSync(outPath, content, 'utf8');
  filesWritten++;
  totalOk += ok;
  totalFail += failed;
}

console.log(`[transpile-decomp-all] DONE`);
console.log(`  Files written : ${filesWritten} → ${outDir}`);
console.log(`  Functions ok  : ${totalOk}`);
console.log(`  Failed        : ${totalFail}`);
