/**
 * international_string_util.ts — port 1:1 de
 * `decomps/pokeemeraude/src/international_string_util.c` (COMPLET, 18/18 fns).
 *
 * Conventions frontière : les strings save/data JS sont encodées charmap via
 * `encodeOwText` aux frontières u8* ; `GetStringWidth` repo = `(str, fontId,
 * letterSpacing)` (ordre C `(fontId, str, ls)` inversé).
 */

import { LANGUAGE_ENGLISH, LANGUAGE_JAPANESE, PLAYER_NAME_LENGTH } from '../include/constants/global';
import { EOS, EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN, EXT_CTRL_CODE_RESET_FONT } from '../include/constants/characters';
import { StringLength, StripExtCtrlCodes, StringCopy, ConvertInternationalString } from './string_util';
import { encodeOwText } from './text';

/**
 * 1:1 décomp `void PadNameString(u8 *dest, u8 padChar)` (international_string_util.c:125).
 * Strip les ext-ctrl-codes, mesure la longueur (StringLength), puis pad le buffer
 * `dest` jusqu'à `PLAYER_NAME_LENGTH - 1` avec `padChar` — ou, si `padChar`
 * vaut `EXT_CTRL_CODE_BEGIN`, avec des paires `[EXT_CTRL_CODE_BEGIN, RESET_FONT]`
 * (usage record_mixing otName) — puis termine par `EOS`. Opère IN-PLACE sur le u8*.
 */
export function PadNameString(dest: Uint8Array, padChar: number): void {
  StripExtCtrlCodes(dest);
  let length = StringLength(dest);
  if (padChar === EXT_CTRL_CODE_BEGIN) {
    while (length < PLAYER_NAME_LENGTH - 1) {
      dest[length] = EXT_CTRL_CODE_BEGIN;
      dest[length + 1] = EXT_CTRL_CODE_RESET_FONT;
      length += 2;
    }
  } else {
    while (length < PLAYER_NAME_LENGTH - 1) {
      dest[length] = padChar;
      length++;
    }
  }
  dest[length] = EOS;
}

/** 1:1 décomp `void TVShowConvertInternationalString(u8 *dest, const u8 *src, int language)`
 *  (international_string_util.c:203). `src` accepte aussi une string JS (convention
 *  save : les noms des TV shows sont stockés en string — encodés à la frontière). */
export function TVShowConvertInternationalString(dest: Uint8Array, src: Uint8Array | string, language: number): void {
  StringCopy(dest, typeof src === 'string' ? encodeOwText(src) : src);
  ConvertInternationalString(dest, language);
}

/** 1:1 décomp `int GetNicknameLanguage(u8 *str)` (international_string_util.c:210) :
 *  JAPANESE si le nom commence par EXT_CTRL_CODE_BEGIN+EXT_CTRL_CODE_JPN, sinon
 *  ENGLISH. Accepte aussi une string JS (nickname save) — jamais JPN chez nous. */
export function GetNicknameLanguage(str: Uint8Array | string): number {
  if (typeof str === 'string') return LANGUAGE_ENGLISH;
  if (str[0] === EXT_CTRL_CODE_BEGIN && str[1] === EXT_CTRL_CODE_JPN)
    return LANGUAGE_JAPANESE;
  else
    return LANGUAGE_ENGLISH;
}

// ═══════════════════════════════════════════════════════════════════════════
// Fns restantes de international_string_util.c (merge transpile-c, REVUES).
// ═══════════════════════════════════════════════════════════════════════════

import { EXT_CTRL_CODE_CLEAR, EXT_CTRL_CODE_ENG, PLACEHOLDER_BEGIN } from '../include/constants/characters';
import { TRAINER_CLASS_LEADER, TRAINER_CLASS_RIVAL, TRAINER_CLASS_RS_PROTAG, TRAINER_CLASS_SCHOOL_KID } from '../include/constants/trainers';
import * as _trainersConstants from '../include/constants/trainers';
import { FONT_NORMAL } from '../include/text';
import { gPokedexEntries } from './data/pokemon/pokedex_entries';
import { getString } from './engine/ui/gba-strings';
import { ConvertPixelWidthToTileWidth } from './script_menu';
import { StringCompare, StringCopyN } from './string_util';
import { GetStringWidth } from './text';
import { FillWindowPixelRect } from './window';
import type { ListMenuTemplate } from './list_menu';
import type { MenuAction } from './menu';

/** 1:1 `int GetStringCenterAlignXOffset(int fontId, const u8 *str, int totalWidth)` (international_string_util.c:15). */
export function GetStringCenterAlignXOffset(fontId: number, str: Uint8Array | string, totalWidth: number): number {
  return GetStringCenterAlignXOffsetWithLetterSpacing(fontId, str, totalWidth, 0);
}

/** 1:1 `int GetStringRightAlignXOffset(int fontId, const u8 *str, int totalWidth)` (international_string_util.c:20). */
export function GetStringRightAlignXOffset(fontId: number, str: Uint8Array | string, totalWidth: number): number {
  return GetStringWidthDifference(fontId, str, totalWidth, 0);
}

/** 1:1 `int GetStringCenterAlignXOffsetWithLetterSpacing(...)` (international_string_util.c:25). */
export function GetStringCenterAlignXOffsetWithLetterSpacing(fontId: number, str: Uint8Array | string, totalWidth: number, letterSpacing: number): number {
  return Math.trunc(GetStringWidthDifference(fontId, str, totalWidth, letterSpacing) / 2);
}

/** 1:1 `int GetStringWidthDifference(int fontId, const u8 *str, int totalWidth, int letterSpacing)` (international_string_util.c:30). */
export function GetStringWidthDifference(fontId: number, str: Uint8Array | string, totalWidth: number, letterSpacing: number): number {
  const stringWidth = GetStringWidth(str, fontId, letterSpacing);
  if (totalWidth > stringWidth)
    return totalWidth - stringWidth;
  else
    return 0;
}

/** 1:1 `int GetMaxWidthInMenuTable(const struct MenuAction *actions, int numActions)` (international_string_util.c:39). */
export function GetMaxWidthInMenuTable(actions: readonly MenuAction[], numActions: number): number {
  let maxWidth = 0;
  for (let i = 0; i < numActions; i++) {
    const stringWidth = GetStringWidth(actions[i].text, FONT_NORMAL, 0);
    if (stringWidth > maxWidth)
      maxWidth = stringWidth;
  }
  return ConvertPixelWidthToTileWidth(maxWidth);
}

/** 1:1 `int GetMaxWidthInSubsetOfMenuTable(const struct MenuAction *actions, const u8 *actionIds, int numActions)` (international_string_util.c:53). */
export function GetMaxWidthInSubsetOfMenuTable(actions: readonly MenuAction[], actionIds: Uint8Array | number[], numActions: number): number {
  let maxWidth = 0;
  for (let i = 0; i < numActions; i++) {
    const stringWidth = GetStringWidth(actions[actionIds[i]].text, FONT_NORMAL, 0);
    if (stringWidth > maxWidth)
      maxWidth = stringWidth;
  }
  return ConvertPixelWidthToTileWidth(maxWidth);
}

/** 1:1 `int Intl_GetListMenuWidth(const struct ListMenuTemplate *listMenu)` (international_string_util.c:67). */
export function Intl_GetListMenuWidth(listMenu: ListMenuTemplate): number {
  const items = listMenu.items;
  let maxWidth = 0;
  for (let i = 0; i < listMenu.totalItems; i++) {
    const width = GetStringWidth(items[i].name, listMenu.fontId, 0);
    if (width > maxWidth)
      maxWidth = width;
  }
  let finalWidth = maxWidth + listMenu.item_X + 9;
  finalWidth = Math.trunc(finalWidth / 8);
  if (finalWidth > 28)
    finalWidth = 28;
  return finalWidth;
}

/** 1:1 `void CopyMonCategoryText(int dexNum, u8 *dest)` (international_string_util.c:88).
 *  `categoryName` (pokedex_entries repo) = string FR → encodée charmap à la frontière. */
export function CopyMonCategoryText(dexNum: number, dest: Uint8Array): void {
  const str = StringCopy(dest, encodeOwText(gPokedexEntries[dexNum].categoryName));
  void str;
  //!< French Difference
  // *str = CHAR_SPACE;
  // StringCopy(str + 1, gText_Pokemon);
}

/** 1:1 `u8 *GetStringClearToWidth(u8 *dest, int fontId, const u8 *str, int totalStringWidth)`
 *  (international_string_util.c:96). Pointeur `buffer` (post-incréments C) = subarray. */
export function GetStringClearToWidth(dest: Uint8Array, fontId: number, str: Uint8Array | null, totalStringWidth: number): Uint8Array {
  let buffer: Uint8Array;
  let width: number;
  if (str) {
    buffer = StringCopy(dest, str);
    width = GetStringWidth(str, fontId, 0);
  } else {
    buffer = dest;
    width = 0;
  }
  const clearWidth = totalStringWidth - width;
  if (clearWidth > 0) {
    buffer[0] = EXT_CTRL_CODE_BEGIN;   // *(buffer++) = EXT_CTRL_CODE_BEGIN;
    buffer[1] = EXT_CTRL_CODE_CLEAR;   // *(buffer++) = EXT_CTRL_CODE_CLEAR;
    buffer[2] = clearWidth;            // *(buffer++) = clearWidth;
    buffer = buffer.subarray(3);
    buffer[0] = EOS;                   // *buffer = EOS; (sans avancer)
  }
  return buffer;
}

/** 1:1 `void ConvertInternationalPlayerName(u8 *str)` (international_string_util.c:152). */
export function ConvertInternationalPlayerName(str: Uint8Array): void {
  if (StringLength(str) < PLAYER_NAME_LENGTH - 1)
    ConvertInternationalString(str, LANGUAGE_JAPANESE);
  else
    StripExtCtrlCodes(str);
}

/** 1:1 `void ConvertInternationalPlayerNameStripChar(u8 *str, u8 removeChar)`
 *  (international_string_util.c:160). Pointeur `buffer` → index (`buffer >= str` → `b >= 0`). */
export function ConvertInternationalPlayerNameStripChar(str: Uint8Array, removeChar: number): void {
  if (StringLength(str) < PLAYER_NAME_LENGTH - 1) {
    ConvertInternationalString(str, LANGUAGE_JAPANESE);
  } else if (removeChar === EXT_CTRL_CODE_BEGIN) {
    StripExtCtrlCodes(str);
  } else {
    let b = 0;
    while (str[b + 1] !== EOS)
      b++;
    while (b >= 0 && str[b] === removeChar) {
      str[b] = EOS;
      b--;
    }
  }
}

/** 1:1 `void ConvertInternationalContestantName(u8 *str)` (international_string_util.c:185).
 *  Pointeur `str` (post-incréments C, short-circuit `&&` préservé) → index `i`. */
export function ConvertInternationalContestantName(str: Uint8Array): void {
  let i = 0;
  if (str[i++] === EXT_CTRL_CODE_BEGIN && str[i++] === EXT_CTRL_CODE_JPN) {
    while (str[i] !== EOS) {
      if (str[i] === EXT_CTRL_CODE_BEGIN && str[i + 1] === EXT_CTRL_CODE_ENG)
        return;
      i++;
    }
    str[i++] = EXT_CTRL_CODE_BEGIN;
    str[i++] = EXT_CTRL_CODE_ENG;
    str[i] = EOS;
  }
}

// It's impossible to distinguish between Latin languages just from a string alone, so the function defaults to LANGUAGE_ENGLISH. This is the case in all of the versions of the game.

// Used by Pokénav's Match Call to erase the previous trainer's flavor text when switching between their info pages.

/** 1:1 `void FillWindowTilesByRow(int windowId, int columnStart, int rowStart, int numFillTiles, int numRows)`
 *  (international_string_util.c:219). Décomp : CpuFastFill8(0x11) sur le tileData 4bpp
 *  (`numFillTiles` tiles × `numRows` rangées depuis (columnStart, rowStart)) = pixels à la
 *  couleur 1. Adaptation harness : notre Window = pixelBuffer 1 byte/pixel (pas de tileData
 *  packé) → même rect en pixels via FillWindowPixelRect (masque `fill & 0xF` → 0x11 = 1). */
export function FillWindowTilesByRow(windowId: number, columnStart: number, rowStart: number, numFillTiles: number, numRows: number): void {
  if (numRows > 0)
    FillWindowPixelRect(windowId, 0x11, columnStart * 8, rowStart * 8, numFillTiles * 8, numRows * 8);
}

/**
 * French Specific Functions
*/

/** 1:1 `u8 *StringAppendWithPlaceholder(u8 *dest, const u8 *src, u8 *placeholderStr)`
 *  (international_string_util.c:241). Copie `placeholderStr` dans `text[32]` AVANT
 *  d'écrire dans `dest` (les callers passent `dest` comme placeholder — aliasing voulu,
 *  cf. berry_blender/secret_base). Pointeurs → index/subarray, retour = position EOS. */
export function StringAppendWithPlaceholder(dest: Uint8Array, src: Uint8Array, placeholderStr: Uint8Array): Uint8Array {
  const text = new Uint8Array(32);
  let c = 0;
  StringCopyN(text, placeholderStr, 31);
  text[31] = EOS;
  placeholderStr = text;
  let s = 0;
  let d = dest;
  while ((c = src[s++]) !== EOS) {
    if (c === PLACEHOLDER_BEGIN) {
      s++;
      d = StringCopy(d, placeholderStr);
    } else {
      d[0] = c;
      d = d.subarray(1);
    }
  }
  d[0] = EOS;
  return d;
}

/** 1:1 (international_string_util.c:265) `const u8 gText_LevyTatia[] = _("LEVY&TATIA");`
 *  Lazy : encodeOwText à la 1re utilisation — la charmap (text.ts) est en TDZ si on
 *  l'appelle au top-level du module (cycle ESM text ↔ ce fichier). */
let _gText_LevyTatia: Uint8Array | undefined;
export function gText_LevyTatia(): Uint8Array {
  return (_gText_LevyTatia ??= encodeOwText('LEVY&TATIA'));
}

/** gTrainerClassNames[id] (décomp data.c ← data/text/trainer_class_names.h). Chez nous les
 *  noms FR vivent dans gameData.trainerClassNamesFr (Record clé "TRAINER_CLASS_X") →
 *  résolution id numérique → clé via l'inversion des constantes include/constants/trainers. */
let _classIdToKey: Map<number, string> | null = null;
function _gTrainerClassName(trainerClassId: number): Uint8Array {
  if (!_classIdToKey) {
    _classIdToKey = new Map();
    for (const [k, v] of Object.entries(_trainersConstants)) {
      if (k.startsWith('TRAINER_CLASS_') && typeof v === 'number' && !_classIdToKey.has(v))
        _classIdToKey.set(v, k);
    }
  }
  const key = _classIdToKey.get(trainerClassId);
  const classMap = (globalThis as { gameDataTrainerClassesFr?: Record<string, string> }).gameDataTrainerClassesFr;
  const name = (key && classMap?.[key]) ?? key?.replace(/^TRAINER_CLASS_/, '') ?? '';
  return encodeOwText(name);
}

/** 1:1 `const u8 *GetTrainerClassNameGenderSpecific(s32 trainerClassId, u32 trainerGender, const u8 *trainerName)`
 *  (international_string_util.c:267) — French specific : ELEVE/DRESSEUR au féminin,
 *  CHAMPION pour LEVY&TATIA. Retour u8* (bytes charmap). */
export function GetTrainerClassNameGenderSpecific(trainerClassId: number, trainerGender: number, trainerName: Uint8Array | null): Uint8Array {
  switch (trainerClassId) {
    case TRAINER_CLASS_SCHOOL_KID:
      if (trainerGender !== 0)
        return encodeOwText(getString('gText_Eleve')); // ELEVE
      return _gTrainerClassName(trainerClassId);
    case TRAINER_CLASS_RIVAL:
    case TRAINER_CLASS_RS_PROTAG:
      if (trainerGender !== 0)
        return encodeOwText(getString('gText_Dresseur')); // DRESSEUR
      break;
    case TRAINER_CLASS_LEADER:
      if (trainerName !== null && StringCompare(trainerName, gText_LevyTatia()) === 0)
        return encodeOwText(getString('gText_Champion')); // CHAMPION
      break;
  }
  return _gTrainerClassName(trainerClassId);
}
