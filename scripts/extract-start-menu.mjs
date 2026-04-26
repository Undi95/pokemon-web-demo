#!/usr/bin/env node
/**
 * Parse `src/start_menu.c` du décomp pour extraire :
 *   - `sStartMenuItems[]` : MENU_ACTION_* → { textKey, callbackName }
 *   - `BuildNormalStartMenu()` : ordre + flags conditionnels
 *   - `BuildSafariZoneStartMenu()`, `BuildLinkModeStartMenu()`, etc. (variantes)
 *
 * Sortie : `public/decomp/em/start-menu.json`
 *
 * Cf. DECOMP_ORIGIN_FILES.md B. Menu System.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'start-menu.json');
mkdirSync(dirname(outPath), { recursive: true });

const text = readFileSync(join(decompPath, 'src', 'start_menu.c'), 'utf8');

// ─── 1. Parse sStartMenuItems[] ─────────────────────────────────────────────
//   [MENU_ACTION_POKEDEX] = {gText_MenuPokedex, {.u8_void = StartMenuPokedexCallback}},
const items = {};
const itemRe = /\[(MENU_ACTION_\w+)\]\s*=\s*\{(\w+),\s*\{\.[\w_]+\s*=\s*(\w+)\}\}/g;
let m;
while ((m = itemRe.exec(text)) !== null) {
  items[m[1]] = { textKey: m[2], callbackName: m[3] };
}

// ─── 2. Parse les BuildXxxStartMenu() ───────────────────────────────────────
// Pattern : "if (FlagGet(FLAG_X) == TRUE) AddStartMenuAction(MENU_ACTION_Y);"
// ou simplement "AddStartMenuAction(MENU_ACTION_Y);" (no-flag).
function parseBuilder(funcName) {
  // Match "static void <funcName>(void) { ... }"
  const re = new RegExp(`static\\s+void\\s+${funcName}\\s*\\(\\s*void\\s*\\)\\s*\\{([\\s\\S]*?)\\n\\}`);
  const fnMatch = re.exec(text);
  if (!fnMatch) return [];
  const body = fnMatch[1];
  const result = [];
  // Split en blocs : chaque AddStartMenuAction precédé optionnellement d'un if/else.
  // Simple parsing : iterate ligne par ligne, track le dernier flag si présent.
  const lines = body.split('\n');
  let pendingFlag = null;
  let braceDepth = 0;
  for (const line of lines) {
    const trim = line.trim();
    if (trim.startsWith('//')) continue;
    // FlagGet(FLAG_X)
    const flagMatch = trim.match(/FlagGet\((FLAG_\w+)\)\s*==\s*TRUE/);
    if (flagMatch) {
      pendingFlag = flagMatch[1];
      continue;
    }
    // AddStartMenuAction(MENU_ACTION_X)
    const addMatch = trim.match(/AddStartMenuAction\((MENU_ACTION_\w+)\)/);
    if (addMatch) {
      result.push({ action: addMatch[1], flag: pendingFlag });
      pendingFlag = null;
    }
    // Reset flag si on sort d'un bloc
    if (trim.includes('{')) braceDepth++;
    if (trim.includes('}')) {
      braceDepth--;
      if (braceDepth <= 1) pendingFlag = null;
    }
  }
  return result;
}

const out = {
  items,
  builders: {
    normal: parseBuilder('BuildNormalStartMenu'),
    safari: parseBuilder('BuildSafariZoneStartMenu'),
    linkMode: parseBuilder('BuildLinkModeStartMenu'),
    unionRoom: parseBuilder('BuildUnionRoomStartMenu'),
    multiPartner: parseBuilder('BuildMultiPartnerRoomStartMenu'),
    battlePike: parseBuilder('BuildBattlePikeStartMenu'),
    battlePyramid: parseBuilder('BuildBattlePyramidStartMenu'),
  },
};

writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('[start-menu]', {
  items_count: Object.keys(items).length,
  normal_actions: out.builders.normal.length,
  normal_with_flag: out.builders.normal.filter(a => a.flag).length,
  output: outPath,
});
