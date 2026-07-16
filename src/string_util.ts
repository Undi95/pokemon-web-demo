/**
 * string_util.ts — miroir 1:1 de `decomp/src/string_util.c` (+ include/string_util.h).
 *
 * ⚠️ MIGRATION STRUCTURELLE EN COURS (charmap u8). Les chaînes du décomp sont des
 * `u8*` charmap terminés par `EOS` (0xFF). Notre code est HYBRIDE : JS string en
 * OW/menus, `Uint8Array` charmap en combat (décodeur byte-level). Cette 1ère passe
 * porte les fns SIMPLES « pures buffer » (longueur/copie/compare/fill) opérant sur
 * `Uint8Array`, 1:1. Les `gStringVar1-4` (hybrides), `ConvertIntToDecimalStringN`,
 * `StringExpandPlaceholders`, les ext-ctrl-codes et le bridge des callers JS-string
 * = passes suivantes (cf. ledger).
 *
 * Sémantique POINTEUR (`u8*`) : un pointeur C est représenté par une **vue
 * `Uint8Array`** (`buf.subarray(offset)`) — écrire dans la vue écrit le buffer
 * sous-jacent, et le chaînage (`StringAppend(StringCopy(a,b), c)`) fonctionne 1:1.
 */
import {
  EOS, CHAR_SPACER, CHAR_QUESTION_MARK,
  CHAR_0, CHAR_1, CHAR_2, CHAR_3, CHAR_4, CHAR_5, CHAR_6, CHAR_7, CHAR_8, CHAR_9,
  CHAR_A, CHAR_B, CHAR_C, CHAR_D, CHAR_E, CHAR_F,
  CHAR_SPACE, CHAR_NEWLINE, CHAR_EXTRA_SYMBOL, JAPANESE_CHAR_END, NUM_BRAILLE_CHARS,
  EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR, EXT_CTRL_CODE_HIGHLIGHT, EXT_CTRL_CODE_SHADOW,
  EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, EXT_CTRL_CODE_PALETTE, EXT_CTRL_CODE_FONT,
  EXT_CTRL_CODE_RESET_FONT, EXT_CTRL_CODE_PAUSE, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS,
  EXT_CTRL_CODE_WAIT_SE, EXT_CTRL_CODE_PLAY_BGM, EXT_CTRL_CODE_ESCAPE,
  EXT_CTRL_CODE_SHIFT_RIGHT, EXT_CTRL_CODE_SHIFT_DOWN, EXT_CTRL_CODE_FILL_WINDOW,
  EXT_CTRL_CODE_PLAY_SE, EXT_CTRL_CODE_CLEAR, EXT_CTRL_CODE_SKIP, EXT_CTRL_CODE_CLEAR_TO,
  EXT_CTRL_CODE_MIN_LETTER_SPACING, EXT_CTRL_CODE_JPN, EXT_CTRL_CODE_ENG,
  EXT_CTRL_CODE_PAUSE_MUSIC, EXT_CTRL_CODE_RESUME_MUSIC,
  PLACEHOLDER_BEGIN, CHAR_PROMPT_SCROLL, CHAR_PROMPT_CLEAR,
  PLACEHOLDER_ID_UNKNOWN, PLACEHOLDER_ID_PLAYER, PLACEHOLDER_ID_STRING_VAR_1,
  PLACEHOLDER_ID_STRING_VAR_2, PLACEHOLDER_ID_STRING_VAR_3, PLACEHOLDER_ID_KUN,
  PLACEHOLDER_ID_RIVAL, PLACEHOLDER_ID_VERSION, PLACEHOLDER_ID_AQUA,
  PLACEHOLDER_ID_MAGMA, PLACEHOLDER_ID_ARCHIE, PLACEHOLDER_ID_MAXIE,
  PLACEHOLDER_ID_KYOGRE, PLACEHOLDER_ID_GROUDON,
} from '../include/constants/characters';
import { POKEMON_NAME_LENGTH, PLAYER_NAME_LENGTH, LANGUAGE_JAPANESE, MALE } from '../include/constants/global';
import { FONT_BRAILLE } from '../include/text';
import { STR_CONV_MODE_RIGHT_ALIGN, STR_CONV_MODE_LEADING_ZEROS } from '../include/string_util';
// 1:1 décomp string_util.c `#include "strings.h"` : gText_ExpandedPlaceholder_*
// (+ bridge transitoire d'encodage FR — cf. strings.ts).
import {
  gText_ExpandedPlaceholder_Empty, gText_ExpandedPlaceholder_Kun,
  gText_ExpandedPlaceholder_Chan, gText_ExpandedPlaceholder_Emerald,
  gText_ExpandedPlaceholder_Aqua, gText_ExpandedPlaceholder_Magma,
  gText_ExpandedPlaceholder_Archie, gText_ExpandedPlaceholder_Maxie,
  gText_ExpandedPlaceholder_Kyogre, gText_ExpandedPlaceholder_Groudon,
  gText_ExpandedPlaceholder_Brendan, gText_ExpandedPlaceholder_May,
  EncodePlayerNameFR,
} from '../include/strings';
// 1:1 décomp `#include "global.h"` (gSaveBlock2Ptr) : ExpandPlaceholder_PlayerName /
// _KunChan / _RivalName lisent gSaveBlock2Ptr->playerName / ->playerGender.
import { gSaveBlock2Ptr } from './engine/save/save-block-state';


// ─── 1:1 décomp string_util.c:6-10 : buffers EWRAM ──────────────────────────
// `EWRAM_DATA u8 gStringVarN[…] = {0}`. Sémantique pointeur `u8*` = vue subarray.
// ⚠️ STAGE 0 (migration texte 1:1) : ces buffers byte-level COEXISTENT avec la
// voie ASCII `gba-text-system.ts` (gStringVarN = JS-string) jusqu'au flip
// `__USE_DECOMP_TEXT__` (Stages 1-5). Rien de live ne les lit encore.
export const gStringVar1 = new Uint8Array(0x100);
export const gStringVar2 = new Uint8Array(0x100);
export const gStringVar3 = new Uint8Array(0x100);
export const gStringVar4 = new Uint8Array(0x3E8);
const sUnknownStringVar = new Uint8Array(16);  // `static` (module-privé) 1:1 décomp

// 1:1 décomp `static const s32 sPowersOfTen[]` (string_util.c:14-26).
const sPowersOfTen: readonly number[] = [
  1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000,
];

// 1:1 décomp `static const u8 sDigits[] = __("0123456789ABCDEF")` (string_util.c:12) —
// chaque digit = sa constante charmap CHAR_* (PAS un hardcode : on liste les CHAR_*).
const sDigits: readonly number[] = [
  CHAR_0, CHAR_1, CHAR_2, CHAR_3, CHAR_4, CHAR_5, CHAR_6, CHAR_7, CHAR_8, CHAR_9,
  CHAR_A, CHAR_B, CHAR_C, CHAR_D, CHAR_E, CHAR_F,
];

// État de `ConvertIntToDecimalStringN` etc. (enum local 1:1).
const WAITING_FOR_NONZERO_DIGIT = 0;
const WRITING_DIGITS = 1;
const WRITING_SPACES = 2;

/** 1:1 décomp `u8 *StringCopy_Nickname(u8 *dest, const u8 *src)` (string_util.c:28). */
export function StringCopy_Nickname(dest: Uint8Array, src: Uint8Array): Uint8Array {
  let i: number;
  const limit = POKEMON_NAME_LENGTH;
  for (i = 0; i < limit; i++) {
    dest[i] = src[i];
    if (dest[i] === EOS)
      return dest.subarray(i);
  }
  dest[i] = EOS;
  return dest.subarray(i);
}

/** 1:1 décomp `u8 *StringGet_Nickname(u8 *str)` (string_util.c:45). */
export function StringGet_Nickname(str: Uint8Array): Uint8Array {
  let i: number;
  const limit = POKEMON_NAME_LENGTH;
  for (i = 0; i < limit; i++)
    if (str[i] === EOS)
      return str.subarray(i);
  str[i] = EOS;
  return str.subarray(i);
}

/** 1:1 décomp `u8 *StringCopy_PlayerName(u8 *dest, const u8 *src)` (string_util.c:58). */
export function StringCopy_PlayerName(dest: Uint8Array, src: Uint8Array): Uint8Array {
  let i: number;
  const limit = PLAYER_NAME_LENGTH;
  for (i = 0; i < limit; i++) {
    dest[i] = src[i];
    if (dest[i] === EOS)
      return dest.subarray(i);
  }
  dest[i] = EOS;
  return dest.subarray(i);
}

/** 1:1 décomp `u8 *StringCopy(u8 *dest, const u8 *src)` (string_util.c:75). */
export function StringCopy(dest: Uint8Array, src: Uint8Array): Uint8Array {
  // GARDE MOTEUR (Règle 3) : en ROM une string a TOUJOURS un EOS ; ici une string JS
  // (getString non encodé) ou un buffer sans EOS ferait boucler `src[s] !== EOS` à
  // l'infini = freeze dur du navigateur (2 fois payé). On hurle au lieu de figer.
  if (!(src instanceof Uint8Array))
    throw new Error(`[StringCopy] src n'est pas un buffer GBA (${typeof src}) — encoder via encodeOwText()`);
  let d = 0, s = 0;
  while (src[s] !== EOS) {
    if (s >= src.length)
      throw new Error(`[StringCopy] src sans EOS (len=${src.length}) — buffer malformé`);
    dest[d] = src[s];
    d++;
    s++;
  }
  dest[d] = EOS;
  return dest.subarray(d);
}

/** 1:1 décomp `u8 *StringAppend(u8 *dest, const u8 *src)` (string_util.c:88). */
export function StringAppend(dest: Uint8Array, src: Uint8Array): Uint8Array {
  let d = 0;
  while (dest[d] !== EOS)
    d++;
  return StringCopy(dest.subarray(d), src);
}

/** 1:1 décomp `u8 *StringCopyN(u8 *dest, const u8 *src, u8 n)` (string_util.c:96).
 *  NB : ne pose PAS de EOS (copie `n` octets bruts). */
export function StringCopyN(dest: Uint8Array, src: Uint8Array, n: number): Uint8Array {
  for (let i = 0; i < n; i++)
    dest[i] = src[i];
  return dest.subarray(n);
}

/** 1:1 décomp `u8 *StringAppendN(u8 *dest, const u8 *src, u8 n)` (string_util.c:106). */
export function StringAppendN(dest: Uint8Array, src: Uint8Array, n: number): Uint8Array {
  let d = 0;
  while (dest[d] !== EOS)
    d++;
  return StringCopyN(dest.subarray(d), src, n);
}

/** 1:1 décomp `u16 StringLength(const u8 *str)` (string_util.c:114). */
export function StringLength(str: Uint8Array): number {
  let length = 0;
  while (str[length] !== EOS)
    length++;
  return length;
}

/** 1:1 décomp `s32 StringCompare(const u8 *str1, const u8 *str2)` (string_util.c:124). */
export function StringCompare(str1: Uint8Array, str2: Uint8Array): number {
  let i1 = 0, i2 = 0;
  while (str1[i1] === str2[i2]) {
    if (str1[i1] === EOS)
      return 0;
    i1++;
    i2++;
  }
  return str1[i1] - str2[i2];
}

/** 1:1 décomp `s32 StringCompareN(const u8 *str1, const u8 *str2, u32 n)` (string_util.c:137). */
export function StringCompareN(str1: Uint8Array, str2: Uint8Array, n: number): number {
  let i1 = 0, i2 = 0;
  while (str1[i1] === str2[i2]) {
    if (str1[i1] === EOS)
      return 0;
    i1++;
    i2++;
    if (--n === 0)
      return 0;
  }
  return str1[i1] - str2[i2];
}

/** 1:1 décomp `bool8 IsStringLengthAtLeast(const u8 *str, s32 n)` (string_util.c:152). */
export function IsStringLengthAtLeast(str: Uint8Array, n: number): boolean {
  for (let i = 0; i < n; i++)
    if (str[i] && str[i] !== EOS)
      return true;
  return false;
}

/** 1:1 décomp `u8 *StringFill(u8 *dest, u8 c, u16 n)` (string_util.c:527) :
 *  remplit `n` octets de `c`, puis pose EOS, retourne le pointeur sur le EOS. */
export function StringFill(dest: Uint8Array, c: number, n: number): Uint8Array {
  let d = 0;
  for (let i = 0; i < n; i++)
    dest[d++] = c;
  dest[d] = EOS;
  return dest.subarray(d);
}

/** 1:1 décomp `u8 *StringCopyPadded(u8 *dest, const u8 *src, u8 c, u16 n)` (string_util.c:538) :
 *  copie src (en décomptant n, clampé à 0), puis pad avec `c` jusqu'à n octets, EOS.
 *  NB : `n != (u16)-1` (= 0xFFFF) — l'arithmétique de pad est en u16 (wrap à 0xFFFF). */
export function StringCopyPadded(dest: Uint8Array, src: Uint8Array, c: number, n: number): Uint8Array {
  let d = 0, s = 0;
  while (src[s] !== EOS) {
    dest[d++] = src[s++];
    if (n)
      n--;
  }
  n = (n - 1) & 0xFFFF;
  while (n !== 0xFFFF) {
    dest[d++] = c;
    n = (n - 1) & 0xFFFF;
  }
  dest[d] = EOS;
  return dest.subarray(d);
}

/** 1:1 décomp `u8 *StringFillWithTerminator(u8 *dest, u16 n)` (string_util.c:560). */
export function StringFillWithTerminator(dest: Uint8Array, n: number): Uint8Array {
  return StringFill(dest, EOS, n);
}

/** 1:1 décomp `u8 *ConvertIntToDecimalStringN(u8 *dest, s32 value, mode, u8 n)`
 *  (string_util.c:163). `n` = nb de chiffres. Division entière C = `Math.trunc`. */
export function ConvertIntToDecimalStringN(dest: Uint8Array, value: number, mode: number, n: number): Uint8Array {
  let state = WAITING_FOR_NONZERO_DIGIT;
  const largestPowerOfTen = sPowersOfTen[n - 1];

  if (mode === STR_CONV_MODE_RIGHT_ALIGN) state = WRITING_SPACES;
  if (mode === STR_CONV_MODE_LEADING_ZEROS) state = WRITING_DIGITS;

  let d = 0;
  for (let powerOfTen = largestPowerOfTen; powerOfTen > 0; powerOfTen = Math.trunc(powerOfTen / 10)) {
    let c: number;
    const digit = Math.trunc(value / powerOfTen) & 0xFFFF;      // u16 digit = value / powerOfTen
    const temp = value - (powerOfTen * digit);

    if (state === WRITING_DIGITS) {
      const out = d++;
      c = digit <= 9 ? sDigits[digit] : CHAR_QUESTION_MARK;
      dest[out] = c;
    } else if (digit !== 0 || powerOfTen === 1) {
      state = WRITING_DIGITS;
      const out = d++;
      c = digit <= 9 ? sDigits[digit] : CHAR_QUESTION_MARK;
      dest[out] = c;
    } else if (state === WRITING_SPACES) {
      dest[d++] = CHAR_SPACER;
    }

    value = temp;
  }

  dest[d] = EOS;
  return dest.subarray(d);
}

/** 1:1 décomp `u8 *ConvertUIntToDecimalStringN(u8 *dest, u32 value, mode, u8 n)`
 *  (string_util.c:219). Identique à la version signée (valeurs positives). */
export function ConvertUIntToDecimalStringN(dest: Uint8Array, value: number, mode: number, n: number): Uint8Array {
  let state = WAITING_FOR_NONZERO_DIGIT;
  const largestPowerOfTen = sPowersOfTen[n - 1];

  if (mode === STR_CONV_MODE_RIGHT_ALIGN) state = WRITING_SPACES;
  if (mode === STR_CONV_MODE_LEADING_ZEROS) state = WRITING_DIGITS;

  let d = 0;
  for (let powerOfTen = largestPowerOfTen; powerOfTen > 0; powerOfTen = Math.trunc(powerOfTen / 10)) {
    let c: number;
    const digit = Math.trunc(value / powerOfTen) & 0xFFFF;
    const temp = value - (powerOfTen * digit);

    if (state === WRITING_DIGITS) {
      const out = d++;
      c = digit <= 9 ? sDigits[digit] : CHAR_QUESTION_MARK;
      dest[out] = c;
    } else if (digit !== 0 || powerOfTen === 1) {
      state = WRITING_DIGITS;
      const out = d++;
      c = digit <= 9 ? sDigits[digit] : CHAR_QUESTION_MARK;
      dest[out] = c;
    } else if (state === WRITING_SPACES) {
      dest[d++] = CHAR_SPACER;
    }

    value = temp;
  }

  dest[d] = EOS;
  return dest.subarray(d);
}

/** 1:1 décomp `u8 *ConvertIntToHexStringN(u8 *dest, s32 value, mode, u8 n)`
 *  (string_util.c:275). `largestPowerOfSixteen` = 16^(n-1). */
export function ConvertIntToHexStringN(dest: Uint8Array, value: number, mode: number, n: number): Uint8Array {
  let state = WAITING_FOR_NONZERO_DIGIT;
  let largestPowerOfSixteen = 1;
  for (let i = 1; i < n; i++)
    largestPowerOfSixteen *= 16;

  if (mode === STR_CONV_MODE_RIGHT_ALIGN) state = WRITING_SPACES;
  if (mode === STR_CONV_MODE_LEADING_ZEROS) state = WRITING_DIGITS;

  let d = 0;
  for (let powerOfSixteen = largestPowerOfSixteen; powerOfSixteen > 0; powerOfSixteen = Math.trunc(powerOfSixteen / 16)) {
    let c: number;
    const digit = Math.trunc(value / powerOfSixteen);          // u32 digit
    const temp = value % powerOfSixteen;

    if (state === WRITING_DIGITS) {
      const out = d++;
      c = digit <= 0xF ? sDigits[digit] : CHAR_QUESTION_MARK;
      dest[out] = c;
    } else if (digit !== 0 || powerOfSixteen === 1) {
      state = WRITING_DIGITS;
      const out = d++;
      c = digit <= 0xF ? sDigits[digit] : CHAR_QUESTION_MARK;
      dest[out] = c;
    } else if (state === WRITING_SPACES) {
      dest[d++] = CHAR_SPACER;
    }

    value = temp;
  }

  dest[d] = EOS;
  return dest.subarray(d);
}

// ════════════════════════════════════════════════════════════════════════════
//  2e passe (2026-06-05) : fns SANS ÉTAT restantes (vérifiables headless 1:1).
//  Reste après cette passe = gStringVar1-4 + StringExpandPlaceholders +
//  GetExpandedPlaceholder (nœud à état, migration transverse — cf. ledger).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `u8 *StringBraille(u8 *dest, const u8 *src)` (string_util.c:385).
 *  Préfixe la police braille, puis émet chaque char + (char + NUM_BRAILLE_CHARS). */
export function StringBraille(dest: Uint8Array, src: Uint8Array): Uint8Array {
  const setBrailleFont: readonly number[] = [
    EXT_CTRL_CODE_BEGIN,
    EXT_CTRL_CODE_FONT,
    FONT_BRAILLE,
    EOS,
  ];
  const gotoLine2: readonly number[] = [
    CHAR_NEWLINE,
    EXT_CTRL_CODE_BEGIN,
    EXT_CTRL_CODE_SHIFT_DOWN,
    2,
    EOS,
  ];

  dest = StringCopy(dest, Uint8Array.from(setBrailleFont));

  let s = 0;
  for (;;) {
    const c = src[s++];

    switch (c) {
      case EOS:
        dest[0] = c;
        return dest;
      case CHAR_NEWLINE:
        dest = StringCopy(dest, Uint8Array.from(gotoLine2));
        break;
      default:
        dest[0] = c;
        dest = dest.subarray(1);
        dest[0] = (c + NUM_BRAILLE_CHARS) & 0xFF;
        dest = dest.subarray(1);
        break;
    }
  }
}

/** 1:1 décomp `u8 *StringCopyN_Multibyte(u8 *dest, u8 *src, u32 n)` (string_util.c:565).
 *  Copie jusqu'à `n` « caractères » (un CHAR_EXTRA_SYMBOL consomme 2 octets). */
export function StringCopyN_Multibyte(dest: Uint8Array, src: Uint8Array, n: number): Uint8Array {
  let d = 0, s = 0;
  // for (i = n - 1; i != (u32)-1; i--) — boucle u32, s'arrête au wrap 0 → 0xFFFFFFFF.
  for (let i = (n - 1) >>> 0; i !== 0xFFFFFFFF; i = (i - 1) >>> 0) {
    if (src[s] === EOS) {
      break;
    } else {
      dest[d++] = src[s++];
      if (src[s - 1] === CHAR_EXTRA_SYMBOL)
        dest[d++] = src[s++];
    }
  }

  dest[d] = EOS;
  return dest.subarray(d);
}

/** 1:1 décomp `u32 StringLength_Multibyte(const u8 *str)` (string_util.c:587). */
export function StringLength_Multibyte(str: Uint8Array): number {
  let length = 0;
  let s = 0;

  while (str[s] !== EOS) {
    if (str[s] === CHAR_EXTRA_SYMBOL)
      s++;
    s++;
    length++;
  }

  return length;
}

/** 1:1 décomp `u8 *WriteColorChangeControlCode(u8 *dest, u32 colorType, u8 color)`
 *  (string_util.c:602). ⚠️ écrit le `EOS` final (que la version locale easy_chat
 *  OMETTAIT — divergence 1:1 corrigée par cette consolidation). */
export function WriteColorChangeControlCode(dest: Uint8Array, colorType: number, color: number): Uint8Array {
  let d = 0;
  dest[d++] = EXT_CTRL_CODE_BEGIN;

  switch (colorType) {
    case 0:
      dest[d++] = EXT_CTRL_CODE_COLOR;
      break;
    case 1:
      dest[d++] = EXT_CTRL_CODE_SHADOW;
      break;
    case 2:
      dest[d++] = EXT_CTRL_CODE_HIGHLIGHT;
      break;
  }

  dest[d++] = color;
  dest[d] = EOS;
  return dest.subarray(d);
}

/** 1:1 décomp `bool32 IsStringJapanese(u8 *str)` (string_util.c:629). */
export function IsStringJapanese(str: Uint8Array): boolean {
  let s = 0;
  while (str[s] !== EOS) {
    if (str[s] <= JAPANESE_CHAR_END)
      if (str[s] !== CHAR_SPACE)
        return true;
    s++;
  }

  return false;
}

/** 1:1 décomp `bool32 IsStringNJapanese(u8 *str, s32 n)` (string_util.c:642). */
export function IsStringNJapanese(str: Uint8Array, n: number): boolean {
  let s = 0;
  for (let i = 0; str[s] !== EOS && i < n; i++) {
    if (str[s] <= JAPANESE_CHAR_END)
      if (str[s] !== CHAR_SPACE)
        return true;
    s++;
  }

  return false;
}

// 1:1 décomp : `static const u8 lengths[]` LOCAL à GetExtCtrlCodeLength (string_util.c:659),
// initialiseurs désignés (gaps → 0). Indices 0..EXT_CTRL_CODE_RESUME_MUSIC tous renseignés.
const sExtCtrlCodeLengths: readonly number[] = (() => {
  const lengths: number[] = new Array(EXT_CTRL_CODE_RESUME_MUSIC + 1).fill(0);
  lengths[0]                                    = 1;
  lengths[EXT_CTRL_CODE_COLOR]                  = 2;
  lengths[EXT_CTRL_CODE_HIGHLIGHT]              = 2;
  lengths[EXT_CTRL_CODE_SHADOW]                 = 2;
  lengths[EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW] = 4;
  lengths[EXT_CTRL_CODE_PALETTE]                = 2;
  lengths[EXT_CTRL_CODE_FONT]                   = 2;
  lengths[EXT_CTRL_CODE_RESET_FONT]             = 1;
  lengths[EXT_CTRL_CODE_PAUSE]                  = 2;
  lengths[EXT_CTRL_CODE_PAUSE_UNTIL_PRESS]      = 1;
  lengths[EXT_CTRL_CODE_WAIT_SE]                = 1;
  lengths[EXT_CTRL_CODE_PLAY_BGM]               = 3;
  lengths[EXT_CTRL_CODE_ESCAPE]                 = 2;
  lengths[EXT_CTRL_CODE_SHIFT_RIGHT]            = 2;
  lengths[EXT_CTRL_CODE_SHIFT_DOWN]             = 2;
  lengths[EXT_CTRL_CODE_FILL_WINDOW]            = 1;
  lengths[EXT_CTRL_CODE_PLAY_SE]                = 3;
  lengths[EXT_CTRL_CODE_CLEAR]                  = 2;
  lengths[EXT_CTRL_CODE_SKIP]                   = 2;
  lengths[EXT_CTRL_CODE_CLEAR_TO]               = 2;
  lengths[EXT_CTRL_CODE_MIN_LETTER_SPACING]     = 2;
  lengths[EXT_CTRL_CODE_JPN]                    = 1;
  lengths[EXT_CTRL_CODE_ENG]                    = 1;
  lengths[EXT_CTRL_CODE_PAUSE_MUSIC]            = 1;
  lengths[EXT_CTRL_CODE_RESUME_MUSIC]           = 1;
  return lengths;
})();

/** 1:1 décomp `u8 GetExtCtrlCodeLength(u8 code)` (string_util.c:657). */
export function GetExtCtrlCodeLength(code: number): number {
  let length = 0;
  if (code < sExtCtrlCodeLengths.length)
    length = sExtCtrlCodeLengths[code];
  return length;
}

/** 1:1 décomp `static const u8 *SkipExtCtrlCode(const u8 *s)` (string_util.c:694).
 *  Module-privé (static). Avance la vue `s` au-delà des séquences ext-ctrl-code. */
function SkipExtCtrlCode(s: Uint8Array): Uint8Array {
  while (s[0] === EXT_CTRL_CODE_BEGIN) {
    s = s.subarray(1);
    s = s.subarray(GetExtCtrlCodeLength(s[0]));
  }

  return s;
}

/** 1:1 décomp `s32 StringCompareWithoutExtCtrlCodes(const u8 *str1, const u8 *str2)`
 *  (string_util.c:705). */
export function StringCompareWithoutExtCtrlCodes(str1: Uint8Array, str2: Uint8Array): number {
  let s1 = str1, s2 = str2;
  let retVal = 0;

  while (true) {
    s1 = SkipExtCtrlCode(s1);
    s2 = SkipExtCtrlCode(s2);

    if (s1[0] > s2[0])
      break;

    if (s1[0] < s2[0]) {
      retVal = -1;
      if (s2[0] === EOS)
        retVal = 1;
    }

    if (s1[0] === EOS)
      return retVal;

    s1 = s1.subarray(1);
    s2 = s2.subarray(1);
  }

  retVal = 1;

  if (s1[0] === EOS)
    retVal = -1;

  return retVal;
}

/** 1:1 décomp `void ConvertInternationalString(u8 *s, u8 language)` (string_util.c:739).
 *  No-op hors japonais (projet FR-only → jamais le chemin JPN, porté pour le miroir). */
export function ConvertInternationalString(s: Uint8Array, language: number): void {
  if (language === LANGUAGE_JAPANESE) {
    StripExtCtrlCodes(s);
    // u8 i = StringLength(s) ; arithmétique u8 (wrap 0 → 0xFF) sur i.
    let i = StringLength(s) & 0xFF;
    s[i] = EXT_CTRL_CODE_BEGIN; i = (i + 1) & 0xFF;
    s[i] = EXT_CTRL_CODE_ENG;   i = (i + 1) & 0xFF;
    s[i] = EOS;                 i = (i + 1) & 0xFF;

    i = (i - 1) & 0xFF;

    while (i !== 0xFF) {
      s[i + 2] = s[i];
      i = (i - 1) & 0xFF;
    }

    s[0] = EXT_CTRL_CODE_BEGIN;
    s[1] = EXT_CTRL_CODE_JPN;
  }
}

/** 1:1 décomp `void StripExtCtrlCodes(u8 *str)` (string_util.c:764). In-place. */
export function StripExtCtrlCodes(str: Uint8Array): void {
  let srcIndex = 0;
  let destIndex = 0;
  while (str[srcIndex] !== EOS) {
    if (str[srcIndex] === EXT_CTRL_CODE_BEGIN) {
      srcIndex++;
      srcIndex += GetExtCtrlCodeLength(str[srcIndex]);
    } else {
      str[destIndex++] = str[srcIndex++];
    }
  }
  str[destIndex] = EOS;
}

// ════════════════════════════════════════════════════════════════════════════
//  STAGE 0 (2026-06-05) — NŒUD À ÉTAT : gStringVar1-4 byte-level + expand.
//  1:1 décomp string_util.c:335 (StringExpandPlaceholders) + :423-524
//  (14× ExpandPlaceholder_* + GetExpandedPlaceholder). NON-BREAKING : rien de
//  live ne l'appelle encore — la voie ASCII `gba-text-system.ts` reste la voie
//  OW jusqu'au flip `__USE_DECOMP_TEXT__` (Stages 1-5). Vérifiable headless.
//  cf. docs/TEXT-DATA-1TO1-MIGRATION-PLAN.md.
// ════════════════════════════════════════════════════════════════════════════

/**
 * 1:1 décomp `u8 *StringExpandPlaceholders(u8 *dest, const u8 *src)` (string_util.c:335).
 * RÉCURSIF : `PLACEHOLDER_BEGIN(0xFD) <id>` → GetExpandedPlaceholder(id) réexpansé.
 * `EXT_CTRL_CODE_BEGIN(0xFC) <code> [args]` copié tel quel (0..3 args selon le code).
 * Sémantique pointeur `u8*` = vue `Uint8Array.subarray`. Retourne le ptr sur le EOS final.
 */
// Pont transitoire (chantier texte) : les textes PRÉ-CAMION (main_menu / intro
// Birch) ne sont PAS encore migrés byte-level → ils passent encore des `string`
// (cf. gText_Birch_* dans gba-global-scope). On les encode ici via `encodeOwText`,
// chargé en DIFFÉRÉ pour ne pas tirer le module `text` (lourd) dans ce module
// foundational (leçon menu_helpers) ; l'import est résolu pendant le boot, bien
// avant tout appel runtime (l'intro vient après le main menu). À terme : migrer
// ces callers en bytes (chantier texte pré-camion).
let _encodeOwTextForExpand: ((s: string) => Uint8Array) | null = null;
void import('./text').then((m) => { _encodeOwTextForExpand = m.encodeOwText; });

export function StringExpandPlaceholders(dest: Uint8Array, src: Uint8Array | string): Uint8Array {
  if (typeof src === 'string') src = _encodeOwTextForExpand ? _encodeOwTextForExpand(src) : new Uint8Array([EOS]);
  for (;;) {
    let c = src[0]; src = src.subarray(1);                   // u8 c = *src++;

    switch (c) {
      case PLACEHOLDER_BEGIN: {
        const placeholderId = src[0]; src = src.subarray(1); // placeholderId = *src++;
        const expandedString = GetExpandedPlaceholder(placeholderId);
        dest = StringExpandPlaceholders(dest, expandedString);
        break;
      }
      case EXT_CTRL_CODE_BEGIN: {
        dest[0] = c; dest = dest.subarray(1);                // *dest++ = c;
        c = src[0]; src = src.subarray(1);                   // c = *src++;
        dest[0] = c; dest = dest.subarray(1);                // *dest++ = c;

        // 1:1 décomp string_util.c:355-371 : le switch décomp utilise le
        // FALLTHROUGH comme compteur d'args (COLOR_HIGHLIGHT_SHADOW→3, PLAY_BGM→2,
        // default→1, les 7 codes sans arg→0). `noFallthroughCasesInSwitch` interdit
        // le fallthrough non-vide en TS → on calcule nArgs puis on copie en boucle
        // (= byte-pour-byte identique).
        let nArgs: number;
        switch (c) {
          case EXT_CTRL_CODE_RESET_FONT:
          case EXT_CTRL_CODE_PAUSE_UNTIL_PRESS:
          case EXT_CTRL_CODE_FILL_WINDOW:
          case EXT_CTRL_CODE_JPN:
          case EXT_CTRL_CODE_ENG:
          case EXT_CTRL_CODE_PAUSE_MUSIC:
          case EXT_CTRL_CODE_RESUME_MUSIC:
            nArgs = 0;
            break;
          case EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW:
            nArgs = 3;
            break;
          case EXT_CTRL_CODE_PLAY_BGM:
            nArgs = 2;
            break;
          default:
            nArgs = 1;
            break;
        }
        for (let k = 0; k < nArgs; k++) {
          dest[0] = src[0]; dest = dest.subarray(1); src = src.subarray(1); // *dest++ = *src++;
        }
        break;
      }
      case EOS:
        dest[0] = EOS;                                        // *dest = EOS;
        return dest;
      case CHAR_PROMPT_SCROLL:
      case CHAR_PROMPT_CLEAR:
      case CHAR_NEWLINE:
      default:
        dest[0] = c; dest = dest.subarray(1);                // *dest++ = c;
    }
  }
}

// ─── 1:1 décomp string_util.c:423-497 : ExpandPlaceholder_* (14, `static`) ───
// Chacune retourne un pointeur (vue) sur la chaîne à expanser.

/** Buffer statique du bridge PlayerName (cf. ExpandPlaceholder_PlayerName). */
const _sPlayerNameBytes = new Uint8Array(PLAYER_NAME_LENGTH + 1);

/** 1:1 décomp string_util.c:423 `ExpandPlaceholder_UnknownStringVar`. */
function ExpandPlaceholder_UnknownStringVar(): Uint8Array {
  return sUnknownStringVar;
}

/**
 * 1:1 décomp string_util.c:428 `ExpandPlaceholder_PlayerName` (`return gSaveBlock2Ptr->playerName`).
 * BRIDGE TRANSITOIRE : tant que playerName = JS-string, on l'encode dans un buffer
 * statique (Stage 4 = playerName u8[] natif → retour direct).
 */
function ExpandPlaceholder_PlayerName(): Uint8Array {
  const pn = (gSaveBlock2Ptr as { playerName?: unknown }).playerName;
  if (pn instanceof Uint8Array) return pn;
  _sPlayerNameBytes.fill(EOS);
  if (Array.isArray(pn)) {
    // Stage 4 : playerName = number[] bytes charmap natif → copie directe (1:1
    // `return gSaveBlock2Ptr->playerName`, plus de round-trip d'encodage).
    const n = Math.min(pn.length, _sPlayerNameBytes.length);
    for (let i = 0; i < n; i++) _sPlayerNameBytes[i] = (pn as number[])[i];
  } else {
    // legacy : ancienne save JS-string → encode FR transitoire.
    const enc = EncodePlayerNameFR(typeof pn === 'string' ? pn : '');
    _sPlayerNameBytes.set(enc.subarray(0, Math.min(enc.length, _sPlayerNameBytes.length)));
  }
  return _sPlayerNameBytes;
}

/** 1:1 décomp string_util.c:433 `ExpandPlaceholder_StringVar1`. */
function ExpandPlaceholder_StringVar1(): Uint8Array { return gStringVar1; }
/** 1:1 décomp string_util.c:438 `ExpandPlaceholder_StringVar2`. */
function ExpandPlaceholder_StringVar2(): Uint8Array { return gStringVar2; }
/** 1:1 décomp string_util.c:443 `ExpandPlaceholder_StringVar3`. */
function ExpandPlaceholder_StringVar3(): Uint8Array { return gStringVar3; }

/** 1:1 décomp string_util.c:448 `ExpandPlaceholder_KunChan` (suffixe ♂/♀, vide en FR). */
function ExpandPlaceholder_KunChan(): Uint8Array {
  if ((gSaveBlock2Ptr as { playerGender?: number }).playerGender === MALE)
    return gText_ExpandedPlaceholder_Kun;
  else
    return gText_ExpandedPlaceholder_Chan;
}

/** 1:1 décomp string_util.c:456 `ExpandPlaceholder_RivalName` (rival = sexe OPPOSÉ au joueur). */
function ExpandPlaceholder_RivalName(): Uint8Array {
  if ((gSaveBlock2Ptr as { playerGender?: number }).playerGender === MALE)
    return gText_ExpandedPlaceholder_May;
  else
    return gText_ExpandedPlaceholder_Brendan;
}

/** 1:1 décomp string_util.c:464 `ExpandPlaceholder_Version` (= EMERAUDE). */
function ExpandPlaceholder_Version(): Uint8Array { return gText_ExpandedPlaceholder_Emerald; }
/** 1:1 décomp string_util.c:469 `ExpandPlaceholder_Aqua`. */
function ExpandPlaceholder_Aqua(): Uint8Array { return gText_ExpandedPlaceholder_Aqua; }
/** 1:1 décomp string_util.c:474 `ExpandPlaceholder_Magma`. */
function ExpandPlaceholder_Magma(): Uint8Array { return gText_ExpandedPlaceholder_Magma; }
/** 1:1 décomp string_util.c:479 `ExpandPlaceholder_Archie`. */
function ExpandPlaceholder_Archie(): Uint8Array { return gText_ExpandedPlaceholder_Archie; }
/** 1:1 décomp string_util.c:484 `ExpandPlaceholder_Maxie`. */
function ExpandPlaceholder_Maxie(): Uint8Array { return gText_ExpandedPlaceholder_Maxie; }
/** 1:1 décomp string_util.c:489 `ExpandPlaceholder_Kyogre`. */
function ExpandPlaceholder_Kyogre(): Uint8Array { return gText_ExpandedPlaceholder_Kyogre; }
/** 1:1 décomp string_util.c:494 `ExpandPlaceholder_Groudon`. */
function ExpandPlaceholder_Groudon(): Uint8Array { return gText_ExpandedPlaceholder_Groudon; }

// 1:1 décomp string_util.c:503 `static const ExpandPlaceholderFunc funcs[]`
// (init désigné par PLACEHOLDER_ID_*). Indices 0..GROUDON(13) tous renseignés
// → `.length` === 14 === ARRAY_COUNT(funcs).
const sExpandPlaceholderFuncs: Array<() => Uint8Array> = [];
sExpandPlaceholderFuncs[PLACEHOLDER_ID_UNKNOWN]      = ExpandPlaceholder_UnknownStringVar;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_PLAYER]       = ExpandPlaceholder_PlayerName;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_STRING_VAR_1] = ExpandPlaceholder_StringVar1;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_STRING_VAR_2] = ExpandPlaceholder_StringVar2;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_STRING_VAR_3] = ExpandPlaceholder_StringVar3;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_KUN]          = ExpandPlaceholder_KunChan;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_RIVAL]        = ExpandPlaceholder_RivalName;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_VERSION]      = ExpandPlaceholder_Version;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_AQUA]         = ExpandPlaceholder_Aqua;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_MAGMA]        = ExpandPlaceholder_Magma;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_ARCHIE]       = ExpandPlaceholder_Archie;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_MAXIE]        = ExpandPlaceholder_Maxie;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_KYOGRE]       = ExpandPlaceholder_Kyogre;
sExpandPlaceholderFuncs[PLACEHOLDER_ID_GROUDON]      = ExpandPlaceholder_Groudon;

/**
 * 1:1 décomp `const u8 *GetExpandedPlaceholder(u32 id)` (string_util.c:499).
 * id hors borne (`>= ARRAY_COUNT(funcs)`) → gText_ExpandedPlaceholder_Empty.
 */
export function GetExpandedPlaceholder(id: number): Uint8Array {
  if (id >= sExpandPlaceholderFuncs.length)
    return gText_ExpandedPlaceholder_Empty;
  else
    return sExpandPlaceholderFuncs[id]();
}
