/**
 * script_menu.ts — AMORCE miroir 1:1 `src/script_menu.c` (partie multichoice ; le reste,
 * dont `ScriptMenu_Multichoice`/`ScriptMenu_MultichoiceWithDefault`, = TODO complétion 1:1).
 * Loader pour `public/decomp/em/multichoice-lists.json`.
 *
 * Source : 1:1 décomp `src/data/script_menu.h` (= 102 lists + 114 index).
 * Extraction : `scripts/extract-multichoice-lists.mjs`.
 *
 * Usage :
 *   await loadMultichoiceLists();              // au boot, idempotent
 *   const items = getMultichoiceList(MULTI_TV_LATI);  // → [{ text: "..." }, ...]
 *
 * Le `text` est résolu via `script-runtime.getText` qui lookup dans `_common.json`.
 * Si le label `gText_X` n'est pas trouvé, fallback `[MISSING:X]` (= cohérent
 * avec le msgbox fix de session 126).
 */

import { getText } from './script';  // bytes charmap (migration texte)
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { getString } from '../harness/runtime/decomp-strings';
import { CreateYesNoMenu, GetYesNoWindowId, InitMenuInUpperLeftCornerNormal, Menu_ProcessInputNoWrapClearOnChoose } from './menu';
import { AddTextPrinterParameterized3 } from './menu';
import { AddWindow, ClearStdWindowAndFrame, CopyWindowToVram, SetStandardWindowBorderStyle, PutWindowTilemap, RemoveWindow } from './window';
import type { WindowTemplate } from './window';
import { VarSet, FlagGet } from './event_data';
import { VAR_RESULT } from '../include/constants/vars';
import { GetStringWidth, GetPlayerNameString } from './text';
import { StringExpandPlaceholders } from './string_util';
import { FONT_NORMAL } from '../include/text';
import { MAX_MULTICHOICE_WIDTH } from '../include/constants/script_menu';

/** 1:1 décomp `int ConvertPixelWidthToTileWidth(int width)` (script_menu.c:743). */
export function ConvertPixelWidthToTileWidth(width: number): number {
  return (Math.trunc((width + 9) / 8) + 1) > MAX_MULTICHOICE_WIDTH ? MAX_MULTICHOICE_WIDTH : (Math.trunc((width + 9) / 8) + 1);
}

/** 1:1 décomp `static int DisplayTextAndGetWidthInternal(const u8 *str)` (script_menu.c:726-731).
 *  `u8 temp[64]` → buffer 64 octets ; StringExpandPlaceholders(temp, str) puis
 *  GetStringWidth(FONT_NORMAL, temp, 0) (ordre args ts = (str, fontId, spacing)). */
function DisplayTextAndGetWidthInternal(str: string | Uint8Array): number {
  const temp = new Uint8Array(64);
  StringExpandPlaceholders(temp, str);
  return GetStringWidth(temp, FONT_NORMAL, 0);
}

/** 1:1 décomp `int DisplayTextAndGetWidth(const u8 *str, int prevWidth)` (script_menu.c:733-740). */
export function DisplayTextAndGetWidth(str: string | Uint8Array, prevWidth: number): number {
  let width = DisplayTextAndGetWidthInternal(str);
  if (width < prevWidth)
    width = prevWidth;
  return width;
}

interface RawMultichoiceData {
  lists: Record<string, string[]>;     // MultichoiceList_X → [gText_A, gText_B, ...]
  index: Record<string, string>;        // MULTI_X → MultichoiceList_X
}

let _data: RawMultichoiceData | null = null;
let _loadingPromise: Promise<void> | null = null;

export async function loadMultichoiceLists(): Promise<void> {
  if (_data) return;
  if (_loadingPromise) return _loadingPromise;
  _loadingPromise = (async () => {
    try {
      const r = await fetch('/decomp/em/multichoice-lists.json');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      _data = await r.json() as RawMultichoiceData;
      console.log(`[multichoice-data] loaded ${Object.keys(_data.lists).length} lists, ${Object.keys(_data.index).length} index entries`);
    } catch (e) {
      console.warn('[multichoice-data] load failed:', e);
      _data = { lists: {}, index: {} };
    }
  })();
  return _loadingPromise;
}

/** Retourne les choix d'un multichoice résolus en strings finaux (FR).
 *  Args :
 *    multichoiceId : numeric ID (= MULTI_X enum value).
 *    multichoiceName : optional, name for warning logs (= "MULTI_TV_LATI"). */
export function getMultichoiceList(multichoiceId: number, multichoiceName?: string): (string | Uint8Array)[] {
  if (!_data) {
    console.warn('[multichoice-data] not loaded — call loadMultichoiceLists() first');
    return [];
  }
  // Reverse lookup ID → MULTI_X name. Si caller fournit `multichoiceName`
  // (= literal arg from script `MULTI_TV_LATI`), l'utiliser directement.
  // Sinon, reverse lookup via decomp-constants (= script_menu-data namespace).
  let multiName = (multichoiceName && multichoiceName.startsWith('MULTI_')) ? multichoiceName : '';
  if (!multiName) {
    multiName = reverseDecompConstant(multichoiceId, 'MULTI_') ?? '';
  }
  if (!multiName) {
    console.warn(`[multichoice-data] no name for ID ${multichoiceId}`);
    return [];
  }
  const listName = _data.index[multiName];
  if (!listName) {
    console.warn(`[multichoice-data] no list for ${multiName} (id=${multichoiceId})`);
    return [];
  }
  const labels = _data.lists[listName];
  if (!labels) {
    console.warn(`[multichoice-data] list "${listName}" not found`);
    return [];
  }
  // Resolve gText_X labels → FR strings via 2 sources :
  // 1. `getString` (= `strings.json` via decomp-strings.ts) pour les `gText_*`
  //    définis dans `src/strings.c` (e.g. gText_Exit = "ANNULER", gText_Yes,
  //    gText_Petalburg, etc).
  // 2. `getText` (= `_common.json` via script-runtime.ts) fallback pour les
  //    rares cas où le label vient de `data/text/*.inc`.
  return labels.map(label => {
    const fromStrings = getString(label);
    if (fromStrings && !fromStrings.startsWith('[MISSING:')) return fromStrings;
    const fromCommon = getText(label);  // bytes charmap (migration texte)
    if (fromCommon) return fromCommon;
    return `[MISSING:${label}]`;
  });
}

/** Helper : returns le NAME (= "MULTI_X") depuis un ID numeric. */
export function getMultichoiceName(multichoiceId: number): string | undefined {
  if (!_data) return undefined;
  for (const name of Object.keys(_data.index)) {
    // Lookup via decomp-constants — done by caller normally.
    void multichoiceId; void name;
  }
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// Multichoice / YesNo menus — 1:1 décomp `script_menu.c` (ScriptMenu_Multichoice
// /WithDefault/Grid, ScriptMenu_YesNo). Logique partagée VOIE A : appelée par le
// moteur parsé (scrcmd.ts) ET le byte-VM (scrcmd_bytevm.ts). Chaque fonction
// renvoie le POLL de native script (ou null = pas de menu → handler renvoie false).
// gSpecialVar_Result = VarSet(VAR_RESULT) (= gSpecialVar.Result, même store).
// ═══════════════════════════════════════════════════════════════════════════

let _multichoiceWindowId = -1;

/** 1:1 décomp `ScriptMenu_AdjustLeftCoordFromWidth` (script_menu.c:748-764) :
 *  clamp du bord gauche pour que le menu tienne dans MAX_MULTICHOICE_WIDTH (=28,
 *  importé de include/constants/script_menu). */
function ScriptMenu_AdjustLeftCoordFromWidth(left: number, width: number): number {
  if (left + width > MAX_MULTICHOICE_WIDTH) {
    return MAX_MULTICHOICE_WIDTH - width < 0 ? 0 : MAX_MULTICHOICE_WIDTH - width;
  }
  return left;
}

function _spawnMultichoiceMenu(left: number, top: number, items: (string | Uint8Array)[], cursorPos: number): void {
  const count = items.length;
  if (count === 0) return;
  // 1:1 décomp DrawMultichoiceMenuInternal : width = max(GetStringWidth(FONT_NORMAL, item))
  // par item puis ConvertPixelWidthToTileWidth (script_menu.c:104-106).
  let maxPixels = 0;
  for (const t of items) {
    const w = GetStringWidth(t ?? '', FONT_NORMAL, 0);
    if (w > maxPixels) maxPixels = w;
  }
  const width = ConvertPixelWidthToTileWidth(maxPixels);
  // 1:1 décomp DrawMultichoiceMenu (script_menu.c:107-108) : clamp à droite PUIS
  // `CreateWindowFromRect(left, top, …)` (:628) = `CreateWindowTemplate(0, x+1, y+1, …)`.
  // Le +1/+1 est LA marge du CADRE : DrawStdFrame écrit à (x-1, y-1) — sans lui, un
  // multichoice script à (0,0) (ex. menu Boîtes du PC, pc.inc) dessine son cadre hors
  // fenêtre et CORROMPT le tilemap field voisin (bug user 2026-07-17, rayures sous le
  // menu ; même famille que diag-pc-center-magenta CAS 1 `59ae3a26`, jamais généralisé).
  const adjLeft = ScriptMenu_AdjustLeftCoordFromWidth(left, width);
  // 1:1 décomp `CreateWindowFromRect` (script_menu.c:628-630) : baseBlock = 100.
  // (0x125 auparavant = le baseBlock de la YESNO (menu.c:98) → un multichoice ouvert
  // en même temps qu'une YesNo, ou assez large pour déborder sur la msgbox 0x194,
  // écrasait les tiles VRAM de l'autre fenêtre.)
  const tmpl: WindowTemplate = { bg: 0, tilemapLeft: adjLeft + 1, tilemapTop: top + 1, width, height: count * 2, paletteNum: 15, baseBlock: 100 };
  _multichoiceWindowId = AddWindow(tmpl);
  // 1:1 décomp `script_menu.c:109` DrawMultichoiceMenuInternal : `SetStandardWindowBorderStyle(id,
  // FALSE)` dessine le cadre du menu (le gfx du thème `optionsWindowFrameType` est déjà chargé en
  // VRAM par le field msgbox précédent — pas de re-load ici). L'ancien
  // `DrawStdFrameWithCustomTileAndPalette(id, TRUE, 0x214, 14)` (helper inventé) avait copyToVram
  // = TRUE : il flushait le pixelBuffer du window (VIDE à ce stade) → écrasait le cadre du MESSAGE
  // field partagé (message rayé/cassé après le PC). copyToVram = FALSE (1:1) : le CopyWindowToVram
  // plus bas suffit. NB : le cadre rayé bleu/blanc du multichoice n'est PAS un bug = c'est le
  // thème de fenêtre choisi dans OPTIONS (optionsWindowFrameType, ex. type 3).
  SetStandardWindowBorderStyle(_multichoiceWindowId, false);
  for (let i = 0; i < count; i++) {
    AddTextPrinterParameterized3(_multichoiceWindowId, 1, 8, 1 + i * 16, [1, 2, 3], 255, items[i] ?? '');
  }
  PutWindowTilemap(_multichoiceWindowId);
  CopyWindowToVram(_multichoiceWindowId, 3 /* COPYWIN_FULL */);
  InitMenuInUpperLeftCornerNormal(_multichoiceWindowId, count, cursorPos);
}

function _cleanupMultichoiceMenu(): void {
  if (_multichoiceWindowId >= 0) {
    ClearStdWindowAndFrame(_multichoiceWindowId, true);
    RemoveWindow(_multichoiceWindowId);
    _multichoiceWindowId = -1;
  }
}

/** Poll commun multichoice : A → VAR_RESULT = index ; B → MULTI_B_PRESSED(0x7F)
 *  ou (items-1) si ignoreBPress ; cleanup à la sélection. */
function makeMultichoiceTick(items: (string | Uint8Array)[], ignoreBPress: boolean): () => boolean {
  let menuActive = true;
  return (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;                       // MENU_NOTHING_CHOSEN
    if (result === -1) VarSet(VAR_RESULT, ignoreBPress ? items.length - 1 : 0x7F);  // B pressed
    else VarSet(VAR_RESULT, result);
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
}

/** 1:1 décomp `ScrCmd_multichoice` (scrcmd.c:1353) → ScriptMenu_Multichoice. */
export function ScriptMenu_Multichoice(left: number, top: number, multichoiceId: number, ignoreBPress: boolean, nameHint?: string): (() => boolean) | null {
  const items = getMultichoiceList(multichoiceId, nameHint);
  if (items.length === 0) { console.warn(`[multichoice] no items id=${multichoiceId} — VAR_RESULT=0`); VarSet(VAR_RESULT, 0); return null; }
  _spawnMultichoiceMenu(left, top, items, 0);
  return makeMultichoiceTick(items, ignoreBPress);
}

/** 1:1 décomp `ScrCmd_multichoicedefault` (scrcmd.c:1371) → cursor à defaultChoice. */
export function ScriptMenu_MultichoiceWithDefault(left: number, top: number, multichoiceId: number, ignoreBPress: boolean, defaultChoice: number, nameHint?: string): (() => boolean) | null {
  const items = getMultichoiceList(multichoiceId, nameHint);
  if (items.length === 0) { console.warn(`[multichoicedefault] no items id=${multichoiceId} — VAR_RESULT=${defaultChoice}`); VarSet(VAR_RESULT, defaultChoice); return null; }
  _spawnMultichoiceMenu(left, top, items, defaultChoice);
  return makeMultichoiceTick(items, ignoreBPress);
}

/** 1:1 décomp `ScrCmd_multichoicegrid` (scrcmd.c:1401) → fallback vertical (dette R3 :
 *  numColumns ignoré, layout grille N×M non porté ; même comportement que le parsé). */
export function ScriptMenu_MultichoiceGrid(left: number, top: number, multichoiceId: number, ignoreBPress: boolean, numColumns: number, nameHint?: string): (() => boolean) | null {
  void numColumns;
  const items = getMultichoiceList(multichoiceId, nameHint);
  if (items.length === 0) { console.warn(`[multichoicegrid] no items id=${multichoiceId} — VAR_RESULT=0`); VarSet(VAR_RESULT, 0); return null; }
  _spawnMultichoiceMenu(left, top, items, 0);
  return makeMultichoiceTick(items, ignoreBPress);
}

/** 1:1 décomp menu.c CreateYesNoMenu — fenêtre OUI/NON. */
export function spawnYesNoMenu(left: number, top: number): void {
  const tmpl: WindowTemplate = { bg: 0, tilemapLeft: left, tilemapTop: top, width: 5, height: 4, paletteNum: 15, baseBlock: 0x125 };
  CreateYesNoMenu(tmpl, 0x214, 14, 0);
}

/** 1:1 décomp `ScrCmd_yesnobox` (scrcmd.c:1337) → ScriptMenu_YesNo. Poll : OUI(0)→
 *  VAR_RESULT=1, NON(1)/B→VAR_RESULT=0, cleanup window. Renvoie toujours un poll. */
export function ScriptMenu_YesNo(left: number, top: number): () => boolean {
  spawnYesNoMenu(left, top);
  let menuActive = true;
  return (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;                       // MENU_NOTHING_CHOSEN
    VarSet(VAR_RESULT, result === 0 ? 1 : 0);              // OUI(0)→1 ; NON(1)/B→0
    const wid = GetYesNoWindowId();
    if (wid >= 0) { ClearStdWindowAndFrame(wid, true); RemoveWindow(wid); }
    menuActive = false;
    return true;
  };
}

// ═══ PC multichoice — 1:1 décomp `script_menu.c:314` ═════════════════════════
// FLAG_SYS_GAME_CLEAR = SYSTEM_FLAGS(0x860)+0x4 ; FLAG_SYS_PC_LANETTE = +0x4B (flags.h:1354/1437).
const FLAG_SYS_GAME_CLEAR = 0x864;
const FLAG_SYS_PC_LANETTE = 0x8AB;

/** 1:1 décomp `ScriptMenu_CreatePCMultichoice` (script_menu.c:314) + `CreatePCMultichoice`
 *  (:328) : menu du PC (Pokémon Center) — PC DE QUELQU'UN/ANNETTE (0), PC DE [JOUEUR] (1),
 *  [PANTHEON (2) si FLAG_SYS_GAME_CLEAR], DECONNEXION (dernier). Le décomp rend x=8,
 *  y=1/17/33/49 = exactement les positions de `_spawnMultichoiceMenu` (AddTextPrinter
 *  y=1+i*16). `gText_PlayersPC` = "PC de {PLAYER}" → nom joueur résolu (StringExpandPlaceholders
 *  + PrintPlayerNameOnWindow décomp). Renvoie le poll (makeMultichoiceTick → VAR_RESULT = index).
 *  Câblé comme special waitstate=1 (specials.inc:281) via special_flows.ts. */
export function ScriptMenu_CreatePCMultichoice(): () => boolean {
  VarSet(VAR_RESULT, 0xFF);  // décomp :322 gSpecialVar_Result = 0xFF
  const someones = getString(FlagGet(FLAG_SYS_PC_LANETTE) ? 'gText_LanettesPC' : 'gText_SomeonesPC');  // :367-370
  const players = getString('gText_PlayersPC').replace('{PLAYER}', GetPlayerNameString() || 'PLAYER');  // :372-373
  const items: (string | Uint8Array)[] = [someones, players];
  if (FlagGet(FLAG_SYS_GAME_CLEAR)) items.push(getString('gText_HallOfFame'));  // :344-355 champion → PANTHEON
  items.push(getString('gText_LogOff'));  // :356/363 DECONNEXION
  // 1:1 décomp `CreatePCMultichoice` : `CreateWindowFromRect(0, 0, width, …)` — le +1/+1
  // de marge cadre est désormais DANS _spawnMultichoiceMenu (généralisation du fix CAS 1
  // `59ae3a26` à tous les multichoices script) → on repasse les coords BRUTES du décomp.
  _spawnMultichoiceMenu(0, 0, items, 0);
  return makeMultichoiceTick(items, false);  // InitMultichoiceCheckWrap(FALSE, numChoices, windowId, MULTI_PC)
}
