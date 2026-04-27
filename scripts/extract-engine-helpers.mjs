#!/usr/bin/env node
/**
 * extract-engine-helpers.mjs
 * --------------------------
 * Extrait les bodyC des fonctions HELPER d'engine — celles que les Tasks /
 * SpriteCBs / scènes appellent mais qui sont définies dans le runtime du
 * décomp (sprite.c, palette.c, etc.) et qu'on doit transcrire en TS pour
 * faire fonctionner les sites d'appel extraits.
 *
 * Pour chaque fonction non-static (ou static utile) trouvée :
 *   - name        : function name
 *   - returnType  : C return type (e.g. "u8", "void", "struct Sprite *")
 *   - params      : raw param list (e.g. "u8 spriteId, s16 x, s16 y")
 *   - bodyC       : body source (balanced braces)
 *   - callsTo     : sorted unique list of function calls in body
 *   - lineCount   : non-empty line count
 *
 * Sortie : src/engine/decomp-data/auto-engine/src/<file>-engine.ts
 *   export const ENGINE_FUNCTIONS = { Name: { ... }, ... } as const;
 *
 * Usage : node scripts/extract-engine-helpers.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outRoot = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto-engine', 'src');

const NOW = new Date().toISOString().slice(0, 10);

// Engine .c files. Notes:
//   - SetGpuReg lives in gpu_regs.c, NOT io_reg.c (which is data only).
//   - We still scan io_reg.c so its data tables come along, but no functions.
const SOURCES = [
  // ── Core engine runtime ──────────────────────────────────────────────
  'src/sprite.c',
  'src/palette.c',
  'src/scanline_effect.c',
  'src/random.c',
  'src/decompress.c',
  'src/main.c',
  'src/task.c',
  'src/window.c',
  'src/text_window.c',
  'src/io_reg.c',
  'src/gpu_regs.c', // for SetGpuReg / GetGpuReg / SetGpuRegBits / ClearGpuRegBits
  'src/bg.c',       // BG control helpers (LoadBgTiles, etc.)
  // ── Scene-specific helper modules ────────────────────────────────────
  // Their bodyC bodies are referenced by sprite callbacks / tasks but
  // they live in scene-specific .c files (not "engine" runtime). They
  // still need to be transcribed in TS to drive the menus/credits/intros.
  'src/pokemon_icon.c',           // CreateMonIcon, CreateMonSpriteFromNationalDexNumber, etc.
  'src/trainer_pokemon_sprites.c',// CreateTrainerPicSprite, FreeAndDestroyMonPicSprite, etc.
  'src/pokemon_animation.c',      // LaunchAnimationTaskForFrontSprite, ...
  'src/naming_screen.c',          // SetCursorInvisibility, SetCursorPos, GetCurrentPageColumnCount, ...
  'src/item.c',                   // item table accessors (ItemId_GetXxx)
  'src/item_icon.c',              // CreateItemIconSprite, ...
  'src/item_menu_icons.c',        // CreateBerryTagSprite, ...
  'src/menu.c',                   // generic menu helpers
  'src/menu_helpers.c',           // ditto

  // ── Cross-cutting engine helpers (high-frequency in audit bodies) ────
  'src/string_util.c',            // StringCopy, StringExpandPlaceholders, ConvertIntToDecimalStringN, ...
  'src/malloc.c',                 // Alloc, AllocZeroed, Free, FREE_AND_SET_NULL
  'src/sound.c',                  // PlaySE, PlayBGM, PlayFanfare, ...
  'src/text.c',                   // RunTextPrinters, AddTextPrinterParameterized, ...
  'src/pokemon.c',                // GetMonData, SetMonData, ...
  'src/event_data.c',             // FlagSet/FlagGet/VarSet/VarGet
  'src/link.c',                   // IsLinkTaskFinished, OpenLink, SendBlock, ...
  'src/script.c',                 // ScriptContext_Enable, ...
  'src/field_player_avatar.c',    // LockPlayerFieldControls, UnlockPlayerFieldControls
  'src/overworld.c',              // CleanupOverworldWindowsAndTilemaps, WarpIntoMap
  'src/list_menu.c',              // ListMenuInit
  'src/dynamic_placeholder_text_util.c', // PrintMessage helpers
  'src/blit.c',                   // BlitBitmap*
  'src/util.c',                   // misc utils (RoundTowardsZero, etc.)

  // ── Additional cross-cutting helpers found via audit ─────────────────
  'src/party_menu.c',             // InitPartyMenu, PartyMenuDisplayYesNoMenu, ...
  'src/pokemon_storage_system.c', // SetPokeStorageTask, ...
  'src/field_message_box.c',      // PrintMessage, ClearBottomWindow
  'src/field_weather.c',          // IsWeatherNotFadingIn, WaitForWeatherFadeIn
  'src/event_object_movement.c',  // ObjectEventSetHeldMovement, FreezeObjectEvents
  'src/script_menu.c',            // FadeScreen
  'src/battle_anim_throw.c',      // StartSendOutAnim, UpdateBallPos
  'src/field_effect.c',           // FieldEffectStop
  'src/battle_main.c',            // GetBattlerAtPosition, IsDoubleBattle
  'src/contest.c',                // ContestPrintLinkStandby, ContestClearGeneralTextWindow
  'src/contest_link.c',           // contest link helpers
  'src/contest_painting.c',       // contest painting
  'src/new_game.c',               // NewGameBirchSpeech_* helpers
  'src/load_save.c',              // load_save helpers
  'src/main_menu.c',              // main_menu helpers
  'src/credits.c',                // credits helpers (may have tasks)
  'src/save_failed_screen.c',     // SaveFailedScreen helpers
  'src/start_menu.c',             // StartMenu helpers
  'src/option_menu.c',            // OptionMenu helpers
  'src/title_screen.c',           // TitleScreen helpers
  'src/save.c',                   // Save helpers

  // ── Future-scope features: multiplayer / link / wireless ─────────────
  'src/union_room.c',
  'src/union_room_chat.c',
  'src/union_room_player_avatar.c',
  'src/cable_club.c',
  'src/cable_car.c',
  'src/link_rfu_2.c',
  'src/link_rfu_3.c',
  'src/wireless_communication_status_screen.c',

  // ── Future-scope features: mystery gift / mystery event ──────────────
  'src/mystery_event_menu.c',
  'src/mystery_event_msg.c',
  'src/mystery_event_script.c',
  'src/mystery_gift.c',
  'src/mystery_gift_menu.c',
  'src/mystery_gift_view.c',

  // ── Future-scope features: pokedex ───────────────────────────────────
  'src/pokedex.c',
  'src/pokedex_area_screen.c',
  'src/pokedex_cry_screen.c',

  // ── Future-scope features: mini-games / corners ──────────────────────
  'src/berry_blender.c',
  'src/roulette.c',
  'src/slot_machine.c',
  'src/safari_zone.c',
  'src/lottery_corner.c',
  'src/dewford_trend.c',
  'src/mauville_old_man.c',

  // ── Future-scope features: contests (extra) ──────────────────────────
  'src/contest_util.c',

  // ── Future-scope features: eggs / evolution ──────────────────────────
  'src/egg_hatch.c',
  'src/evolution_graphics.c',
  'src/evolution_scene.c',

  // ── Future-scope features: trade / chat / scripts ────────────────────
  'src/trade.c',
  'src/match_call.c',
  'src/easy_chat.c',
  'src/scrcmd.c',
  'src/script_pokemon_util.c',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

/** Find matching closing brace from an open-brace position. */
function findMatchingBrace(src, openBraceIdx) {
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Find the matching closing paren from an open-paren position. */
function findMatchingParen(src, openParenIdx) {
  let depth = 0;
  for (let i = openParenIdx; i < src.length; i++) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Find all function calls in a body. */
function findCallsTo(body) {
  const calls = new Set();
  const re = /\b([A-Za-z_]\w*)\s*\(/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = m[1];
    if (['if','else','while','for','switch','case','return','sizeof','do',
         'static','const','void','int','char','unsigned','signed','struct',
         'enum','typedef','goto','break','continue','default','union'].includes(name)) continue;
    calls.add(name);
  }
  return [...calls].sort();
}

function countLines(body) {
  return body.split('\n').filter(l => l.trim().length > 0).length;
}

// ─── Function-definition scanner ─────────────────────────────────────────────

/**
 * Scan a stripped C source for top-level function DEFINITIONS (not declarations).
 * Heuristic: at column 0, optional storage class + return type + name + (params) + {.
 *
 * Yields { returnType, name, params, bodyC, startIdx, endIdx }.
 */
function* iterFunctionDefs(src) {
  // Match a return type + name + open-paren at line start. Allow:
  //   void Name(
  //   static void Name(
  //   inline u8 Name(
  //   struct Sprite *Name(
  //   const struct Foo *Name(
  //   COMMON_DATA u32 Name(  (rare; harmless to allow)
  // We require the line to begin (m.index after \n) at column 0 to avoid
  // matching nested calls.
  //
  // We then verify the next non-whitespace after the closing ')' is a '{'.
  // (Skipping forward decls ending with `;` and old-K&R style.)
  const re = /(^|\n)((?:(?:static|inline|extern|EWRAM_DATA|COMMON_DATA|IWRAM_CODE|IWRAM_DATA|ROM_DATA|__attribute__\s*\(\s*\([^)]*\)\s*\))\s+)*)((?:const\s+)?(?:struct\s+\w+\s*\*?\s*|union\s+\w+\s*\*?\s*|enum\s+\w+\s+|[A-Za-z_]\w*\s*\*?\s*))(\w+)\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const lineStartOffset = m[1].length;          // 0 or 1 (the \n)
    const startIdx = m.index + lineStartOffset;
    const storageClass = m[2].trim();
    const returnTypeRaw = m[3].trim();
    const name = m[4];

    // Skip C keywords as function names (defensive)
    if (['if','else','while','for','switch','case','return','sizeof','do',
         'typedef','goto','break','continue','default','union','enum','struct'].includes(name)) {
      continue;
    }
    // Skip macro-like patterns
    if (returnTypeRaw === '' || /^\d/.test(returnTypeRaw)) continue;

    // Find matching closing paren
    const openParenIdx = m.index + m[0].length - 1;
    const closeParenIdx = findMatchingParen(src, openParenIdx);
    if (closeParenIdx === -1) continue;
    const params = src.slice(openParenIdx + 1, closeParenIdx).trim();

    // Skip K&R / forward-decl: next non-whitespace must be `{`
    let p = closeParenIdx + 1;
    while (p < src.length && /\s/.test(src[p])) p++;
    if (src[p] !== '{') {
      re.lastIndex = closeParenIdx + 1;
      continue;
    }
    const closeBraceIdx = findMatchingBrace(src, p);
    if (closeBraceIdx === -1) continue;
    const bodyC = src.slice(p + 1, closeBraceIdx);

    yield {
      returnType: (storageClass + ' ' + returnTypeRaw).trim().replace(/\s+/g, ' '),
      name,
      params,
      bodyC,
      startIdx,
      endIdx: closeBraceIdx + 1,
    };
    re.lastIndex = closeBraceIdx + 1;
  }
}

// ─── Per-file processor ──────────────────────────────────────────────────────

function processFile(absPath, relPath) {
  let raw;
  try { raw = readFileSync(absPath, 'utf8'); }
  catch { return null; }
  if (!raw.trim()) return null;
  const src = stripComments(raw);

  const funcs = {};
  const seen = new Set();

  for (const fn of iterFunctionDefs(src)) {
    if (seen.has(fn.name)) continue; // first definition wins
    seen.add(fn.name);
    funcs[fn.name] = {
      returnType: fn.returnType,
      params: fn.params,
      callsTo: findCallsTo(fn.bodyC),
      lineCount: countLines(fn.bodyC),
      bodyC: fn.bodyC.trim(),
    };
  }

  return funcs;
}

// ─── Output formatter ────────────────────────────────────────────────────────

function renderFunc(name, info) {
  const lines = [`  ${JSON.stringify(name)}: {`];
  lines.push(`    returnType: ${JSON.stringify(info.returnType)},`);
  lines.push(`    params: ${JSON.stringify(info.params)},`);
  if (info.callsTo?.length) lines.push(`    callsTo: ${JSON.stringify(info.callsTo)},`);
  lines.push(`    lineCount: ${info.lineCount},`);
  lines.push(`    bodyC: ${JSON.stringify(info.bodyC)},`);
  lines.push(`  },`);
  return lines.join('\n');
}

function renderRecord(funcs) {
  if (!funcs || Object.keys(funcs).length === 0) return '';
  const keys = Object.keys(funcs).sort();
  const lines = [`export const ENGINE_FUNCTIONS = {`];
  for (const k of keys) lines.push(renderFunc(k, funcs[k]));
  lines.push(`} as const;`);
  return lines.join('\n');
}

function getOutputName(relInput) {
  const fileName = relInput.replace(/\\/g, '/').split('/').pop();
  return fileName.replace(/\.c$/, '') + '-engine.ts';
}

// ─── Run ─────────────────────────────────────────────────────────────────────

console.log(`[engine-helpers] Source: ${decompRoot}`);
console.log(`[engine-helpers] Output: ${outRoot}`);

if (!existsSync(decompRoot)) {
  console.error(`[engine-helpers] FATAL: decomp not found`);
  process.exit(1);
}

if (existsSync(outRoot)) rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

let totalFuncs = 0;
let okCount = 0;
let warnCount = 0;
const indexEntries = [];
const summary = [];
const startTime = Date.now();

for (const rel of SOURCES) {
  const abs = join(decompRoot, rel);
  if (!existsSync(abs)) {
    console.warn(`[engine-helpers] SKIP ${rel} — file not found`);
    continue;
  }

  let funcs;
  try { funcs = processFile(abs, rel); }
  catch (e) {
    console.error(`[engine-helpers] FAIL ${rel}: ${e.message}`);
    continue;
  }
  if (!funcs) { console.warn(`[engine-helpers] SKIP ${rel} — empty`); continue; }

  const count = Object.keys(funcs).length;
  if (count === 0) {
    console.warn(`[engine-helpers] WARN ${rel} produced 0 function defs`);
    warnCount++;
    continue;
  }

  const outName = getOutputName(rel);
  const outAbs = join(outRoot, outName);
  const header = [
    `// AUTO-GENERATED from ${rel.replace(/\\/g, '/')} by extract-engine-helpers.mjs`,
    `// Do not edit — re-run \`node scripts/extract-engine-helpers.mjs\` to refresh.`,
    `//`,
    `// Generated: ${NOW}`,
    `// Functions: ${count}`,
    '',
  ].join('\n');

  writeFileSync(outAbs, header + '\n' + renderRecord(funcs) + '\n');
  console.log(`[engine-helpers] OK  ${outName} — ${count} functions`);

  okCount++;
  totalFuncs += count;
  indexEntries.push({ outName, count, source: rel, names: Object.keys(funcs).sort() });
  summary.push({ rel, count });
}

// ─── Index file ──────────────────────────────────────────────────────────────

const indexLines = [
  `// AUTO-GENERATED by extract-engine-helpers.mjs — Generated: ${NOW}`,
  `// Re-export every per-file engine module under a unique namespace.`,
  '',
];
indexEntries.sort((a, b) => a.outName.localeCompare(b.outName));
for (const e of indexEntries) {
  const ns = e.outName.replace(/-engine\.ts$/, '').replace(/[^A-Za-z0-9]/g, '_');
  indexLines.push(`export * as ${ns}Engine from './${e.outName.replace(/\.ts$/, '')}';`);
}
indexLines.push('');
writeFileSync(join(outRoot, '_all-engine-index.ts'), indexLines.join('\n'));

writeFileSync(join(outRoot, '_stats.json'), JSON.stringify({
  generatedAt: NOW,
  filesProcessed: okCount,
  filesWarned: warnCount,
  totalFunctions: totalFuncs,
  perFile: summary,
  durationMs: Date.now() - startTime,
}, null, 2));

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n[engine-helpers] Done in ${elapsed}s`);
console.log(`  Files OK    : ${okCount}/${SOURCES.length}`);
console.log(`  Total funcs : ${totalFuncs}`);
console.log(`  Output      : ${outRoot.replace(/\\/g, '/')}`);

// Sanity checks: top engine helpers must exist
console.log(`\n[engine-helpers] Sanity checks:`);
const allFuncs = new Set();
for (const e of indexEntries) for (const n of e.names) allFuncs.add(n);
const expected = [
  'CreateSprite', 'CalcCenterToCornerVec', 'StartSpriteAffineAnim',
  'DestroySprite', 'StartSpriteAnim', 'BeginNormalPaletteFade',
  'UpdatePaletteFade', 'FillPalette', 'ScanlineEffect_InitWave',
  'ScanlineEffect_Stop', 'Random', 'LZ77UnCompVram', 'AgbMain',
  'SetMainCallback2', 'CreateTask', 'DestroyTask', 'AddWindow',
  'CopyWindowToVram', 'FillWindowPixelBuffer', 'LoadStdWindowGfxOnBg',
  'SetGpuReg',
];
for (const fn of expected) {
  console.log(`  ${allFuncs.has(fn) ? 'OK ' : 'MISS'}  ${fn}`);
}
