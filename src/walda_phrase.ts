/**
 * walda_phrase.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/walda_phrase.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/walda_phrase.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 *
 * INERTE : non câblé (aucun import de ce module ailleurs). Les 7 accesseurs Walda du
 * SaveBlock (GetWaldaPhrasePtr/SetWaldaPhrase/… définis dans pokemon_storage_system.c)
 * existent dans src/pokemon_storage_system.ts mais n'y sont PAS exportés ; ce fichier ne
 * devant pas modifier d'existant, ils sont transcrits localement en bas du module, en
 * accès direct au Proxy gSaveBlock1Ptr « comme le .c ». À remplacer par un import quand
 * pokemon_storage_system.ts exportera ces symboles.
 */

import { CHAR_B, CHAR_C, CHAR_D, CHAR_F, CHAR_G, CHAR_H, CHAR_J, CHAR_K, CHAR_L, CHAR_M, CHAR_N, CHAR_P, CHAR_Q, CHAR_R, CHAR_S, CHAR_T, CHAR_V, CHAR_W, CHAR_Z, CHAR_b, CHAR_c, CHAR_d, CHAR_f, CHAR_g, CHAR_h, CHAR_j, CHAR_k, CHAR_m, CHAR_n, CHAR_p, CHAR_q, CHAR_s, EOS } from '../include/constants/characters';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { getString } from '../harness/runtime/decomp-strings';
import { encodeOwText } from './text';
import { VarGet, VarSet } from './event_data';
import { FieldCB_ContinueScriptHandleMusic } from './field_screen_effect';
import { SetMainCallback2 } from './main';
import { DoNamingScreen } from './naming_screen';
import { GetTrainerId } from './new_game';
import { CB2_ReturnToField_Manual } from './overworld';
import { StringCompare, StringCopy, StringLength, gStringVar1, gStringVar2 } from './string_util';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const NAMING_SCREEN_WALDA = 4; // 1:1 include/naming_screen.h:0 (à consolider dans include/)
const CB2_ReturnToField = CB2_ReturnToField_Manual; // variante repo (src/overworld.ts)
const WALDA_PHRASE_LENGTH = 15; // 1:1 include/walda_phrase.h:4 (à consolider dans include/)

// There are 32 (2^5) unique letters allowed in a successful phrase for Walda.

const BITS_PER_LETTER = 5; // 1:1 walda_phrase.c:24

// The letters allowed in a successful phrase for Walda

// All vowels are excluded, as well as X/x, Y/y, l, r, t, v, w, and z.

/** 1:1 (walda_phrase.c:28) */
const sWaldaLettersTable = Uint8Array.from([
  CHAR_B,
  CHAR_C,
  CHAR_D,
  CHAR_F,
  CHAR_G,
  CHAR_H,
  CHAR_J,
  CHAR_K,
  CHAR_L,
  CHAR_M,
  CHAR_N,
  CHAR_P,
  CHAR_Q,
  CHAR_R,
  CHAR_S,
  CHAR_T,
  CHAR_V,
  CHAR_W,
  CHAR_Z,
  CHAR_b,
  CHAR_c,
  CHAR_d,
  CHAR_f,
  CHAR_g,
  CHAR_h,
  CHAR_j,
  CHAR_k,
  CHAR_m,
  CHAR_n,
  CHAR_p,
  CHAR_q,
  CHAR_s,
]);

// enum walda_phrase.c:34
const PHRASE_CHANGED = 0;
const PHRASE_NO_CHANGE = 1;
const PHRASE_EMPTY = 2;

/** 1:1 `u16 TryBufferWaldaPhrase(void)` (walda_phrase.c:41-48). */
export function TryBufferWaldaPhrase(): boolean {
  if (IsWaldaPhraseEmpty())
    return false;
  StringCopy(gStringVar1, GetWaldaPhrasePtr());
  return true;
}

/** 1:1 `void DoWaldaNamingScreen(void)` (walda_phrase.c:50-54). */
export function DoWaldaNamingScreen(): void {
  StringCopy(gStringVar2, GetWaldaPhrasePtr());
  DoNamingScreen(NAMING_SCREEN_WALDA, gStringVar2 as unknown as number[], 0, 0, 0, CB2_HandleGivenWaldaPhrase);
}

/** 1:1 `static void CB2_HandleGivenWaldaPhrase(void)` (walda_phrase.c:56-80). */
function CB2_HandleGivenWaldaPhrase(): void {
  VarSet(0x8004 /* gSpecialVar_0x8004 */, +(GetWaldaPhraseInputCase(gStringVar2)));
  switch (VarGet(0x8004) /* gSpecialVar_0x8004 */) {
    case PHRASE_EMPTY:
      // If saved phrase is also empty, set default phrase
      // Otherwise keep saved phrase
      if (IsWaldaPhraseEmpty())
        SetWaldaPhrase(encodeOwText(getString('gText_Peekaboo')));
      else
        VarSet(0x8004 /* gSpecialVar_0x8004 */, +(PHRASE_NO_CHANGE));
      break;
    case PHRASE_CHANGED:
      SetWaldaPhrase(gStringVar2);
      break;
    case PHRASE_NO_CHANGE:
      break;
  }
  StringCopy(gStringVar1, GetWaldaPhrasePtr());
  (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_ContinueScriptHandleMusic;
  SetMainCallback2(CB2_ReturnToField);
}

/** 1:1 `static u32 GetWaldaPhraseInputCase(u8 *inputPtr)` (walda_phrase.c:82-94). */
function GetWaldaPhraseInputCase(inputPtr: Uint8Array): number {
  // No input given
  if (inputPtr[0] == EOS)
    return PHRASE_EMPTY;
  // Input given is the same as saved phrase
  if (StringCompare(inputPtr, GetWaldaPhrasePtr()) == 0)
    return PHRASE_NO_CHANGE;
  // Input is new phrase
  return PHRASE_CHANGED;
}

/** 1:1 `u16 TryGetWallpaperWithWaldaPhrase(void)` (walda_phrase.c:96-112). */
export function TryGetWallpaperWithWaldaPhrase(): boolean {
  const backgroundClr = { v: 0 }; // TRANSPILER: &backgroundClr pris → box
  const foregroundClr = { v: 0 }; // TRANSPILER: &foregroundClr pris → box
  const patternId = { v: 0 }; // TRANSPILER: &patternId pris → box
  const iconId = { v: 0 }; // TRANSPILER: &iconId pris → box
  let trainerId = GetTrainerId(gSaveBlock2Ptr.playerTrainerId);
  VarSet(0x800D /* gSpecialVar_Result */, TryCalculateWallpaper(backgroundClr, foregroundClr, iconId, patternId, trainerId, GetWaldaPhrasePtr()) ? 1 : 0);
  if (VarGet(0x800D) /* gSpecialVar_Result */)
  {
    SetWaldaWallpaperPatternId(patternId.v);
    SetWaldaWallpaperIconId(iconId.v);
    SetWaldaWallpaperColors(backgroundClr.v, foregroundClr.v);
  }
  SetWaldaWallpaperLockedOrUnlocked(VarGet(0x800D) /* gSpecialVar_Result */);
  return !!(VarGet(0x800D) & 0xFF /* (bool8)gSpecialVar_Result */);
}

/** 1:1 `static u8 GetLetterTableId(u8 letter)` (walda_phrase.c:114-125). */
function GetLetterTableId(letter: number): number {
  let i = 0;
  for (i = 0; i < sWaldaLettersTable.length; i++)
  {
    if (sWaldaLettersTable[i] == letter)
      return i;
  }
  return sWaldaLettersTable.length;
}

// Attempts to generate a wallpaper based on the given trainer id and phrase.

// Returns TRUE if successful and sets the wallpaper results to the given pointers.

// Returns FALSE if no wallpaper was generated (Walda "didn't like" the phrase).

// A 9-byte array is used to calculate the wallpaper's data.

// The elements of this array are defined below.

// #define BG_COLOR_LO data[0]  (alias — expansé aux usages)

// #define BG_COLOR_HI data[1]  (alias — expansé aux usages)

// #define FG_COLOR_LO data[2]  (alias — expansé aux usages)

// #define FG_COLOR_HI data[3]  (alias — expansé aux usages)

// #define ICON_ID data[4]  (alias — expansé aux usages)

// #define PATTERN_ID data[5]  (alias — expansé aux usages)

// #define TID_CHECK_HI data[6]  (alias — expansé aux usages)

// #define TID_CHECK_LO data[7]  (alias — expansé aux usages)

// #define KEY data[8]  (alias — expansé aux usages)

const NUM_WALLPAPER_DATA_BYTES = 9; // 1:1 walda_phrase.c:141

// TO_BIT_OFFSET(i) : convertit une position dans la phrase en n° de bit dans le tableau data.
const TO_BIT_OFFSET = (i: number): number => (3 + (8 * (i))); // 1:1 macro walda_phrase.c:142

/** 1:1 `static bool32 TryCalculateWallpaper(u16 *backgroundClr, u16 *foregroundClr, u8 *iconId, u8 *patternId, u16 trainerId, u8 *phrase)` (walda_phrase.c:143-199). */
function TryCalculateWallpaper(backgroundClr: { v: number }, foregroundClr: { v: number }, iconId: { v: number }, patternId: { v: number }, trainerId: number, phrase: Uint8Array): boolean {
  let i = 0;
  const data = new Uint8Array(NUM_WALLPAPER_DATA_BYTES);
  const charsByTableId = new Uint8Array(WALDA_PHRASE_LENGTH);
  let ptr: Uint16Array;
  // Reject any phrase that does not use the full length
  if (StringLength(phrase) != WALDA_PHRASE_LENGTH)
    return false;
  // Reject any phrase that uses characters not in sWaldaLettersTable
  for (i = 0; i < WALDA_PHRASE_LENGTH; i++)
  {
    charsByTableId[i] = GetLetterTableId(phrase[i]);
    if (charsByTableId[i] == sWaldaLettersTable.length)
      return false;
  }
  // Use the given phrase to populate the wallpaper data array
  // The data array is 9 bytes (72 bits) long, and each letter contributes to 5 bits of the array
  // Because the phrase is 15 letters long there are 75 bits from the phrase to distribute
  // Therefore the last letter contributes to the last 2 bits of the array, and the remaining 3 bits wrap around
  for (i = 0; i < WALDA_PHRASE_LENGTH - 1; i++)
    SetWallpaperDataFromLetter(data, charsByTableId, BITS_PER_LETTER * i, TO_BIT_OFFSET(i), BITS_PER_LETTER);
  // Do first 2 bits of the last letter
  SetWallpaperDataFromLetter(data, charsByTableId, BITS_PER_LETTER * (WALDA_PHRASE_LENGTH - 1), TO_BIT_OFFSET(WALDA_PHRASE_LENGTH - 1), 2);
  // Check the first 3 bits of the data array against the remaining 3 bits of the last letter
  // Reject the phrase if they are not already the same
  if (GetWallpaperDataBits(data, 0, 3) != GetWallpaperDataBits(charsByTableId, TO_BIT_OFFSET(WALDA_PHRASE_LENGTH - 1) + 2, 3))
    return false;
  // Perform some relatively arbitrary changes to the wallpaper data using the last byte (KEY)
  RotateWallpaperDataLeft(data, NUM_WALLPAPER_DATA_BYTES, 21);
  RotateWallpaperDataLeft(data, NUM_WALLPAPER_DATA_BYTES - 1, data[8] /* KEY */ & 0xF);
  MaskWallpaperData(data, NUM_WALLPAPER_DATA_BYTES - 1, data[8] /* KEY */ >> 4);
  // Reject the results of any phrase that are 'incompatible' with the player's trainer id
  if (data[6] /* TID_CHECK_HI */ != (data[0] /* BG_COLOR_LO */ ^ data[2] /* FG_COLOR_LO */ ^ data[4] /* ICON_ID */ ^ (trainerId >> 8)))
    return false;
  if (data[7] /* TID_CHECK_LO */ != (data[1] /* BG_COLOR_HI */ ^ data[3] /* FG_COLOR_HI */ ^ data[5] /* PATTERN_ID */ ^ (trainerId & 0xFF)))
    return false;
  // Successful phrase, save resulting wallpaper
  // ptr = (u16 *) &BG_COLOR_LO; *backgroundClr = *ptr;  (lecture u16 little-endian ; data est ALIGNED(2))
  ptr = new Uint16Array(data.buffer, data.byteOffset + 0, 1);
  backgroundClr.v = ptr[0];
  // ptr = (u16 *) &FG_COLOR_LO; *foregroundClr = *ptr;
  ptr = new Uint16Array(data.buffer, data.byteOffset + 2, 1);
  foregroundClr.v = ptr[0];
  iconId.v = data[4] /* ICON_ID */;
  patternId.v = data[5] /* PATTERN_ID */;
  return true;
}

/** 1:1 `static void RotateWallpaperDataLeft(u8 *data, s32 size, s32 numShifts)` (walda_phrase.c:201-218). */
function RotateWallpaperDataLeft(data: Uint8Array, size: number, numShifts: number): void {
  let i = 0;
  let j = 0;
  let temp1 = 0;
  let temp2 = 0;
  for (i = numShifts - 1; i != -1; i--)
  {
    temp1 = (data[0] & (1 << 7)) >> 7;
    for (j = size - 1; j >= 0; j--)
    {
      temp2 = (data[j] & (1 << 7)) >> 7;
      data[j] <<= 1;
      data[j] |= temp1;
      temp1 = temp2;
    }
  }
}

/** 1:1 `static void MaskWallpaperData(u8 *data, u32 size, u8 mask)` (walda_phrase.c:220-228). */
function MaskWallpaperData(data: Uint8Array, size: number, mask: number): void {
  let i = 0;
  mask |= (mask << 4);
  for (i = 0; i < size; i++)
    data[i] ^= mask;
}

/** 1:1 `static bool8 GetWallpaperDataBit(u8 *data, u32 bitNum)` (walda_phrase.c:230-236). */
function GetWallpaperDataBit(data: Uint8Array, bitNum: number): boolean {
  let i = Math.trunc(bitNum / 8);
  let flag = (1 << 7) >> (bitNum % 8);
  return (data[i] & flag) != 0;
}

/** 1:1 `static void SetWallpaperDataBit(u8 *data, u32 bitNum)` (walda_phrase.c:238-244). */
function SetWallpaperDataBit(data: Uint8Array, bitNum: number): void {
  let i = Math.trunc(bitNum / 8);
  let flag = (1 << 7) >> (bitNum % 8);
  data[i] |= flag;
}

/** 1:1 `static void ClearWallpaperDataBit(u8 *data, u32 bitNum)` (walda_phrase.c:246-252). */
function ClearWallpaperDataBit(data: Uint8Array, bitNum: number): void {
  let i = Math.trunc(bitNum / 8);
  let mask = ~((1 << 7) >> (bitNum % 8));
  data[i] &= mask;
}

/** 1:1 `static void SetWallpaperDataFromLetter(u8 *data, u8 *letterTableIds, u32 setOffset, u32 getOffset, u32 numBits)` (walda_phrase.c:254-265). */
function SetWallpaperDataFromLetter(data: Uint8Array, letterTableIds: Uint8Array, setOffset: number, getOffset: number, numBits: number): void {
  let i = 0;
  for (i = 0; i < numBits; i++)
  {
    if (GetWallpaperDataBit(letterTableIds, getOffset + i))
      SetWallpaperDataBit(data, setOffset + i);
    else
      ClearWallpaperDataBit(data, setOffset + i);
  }
}

/** 1:1 `static u32 GetWallpaperDataBits(u8 *data, u32 offset, u32 numBits)` (walda_phrase.c:267-278). */
function GetWallpaperDataBits(data: Uint8Array, offset: number, numBits: number): number {
  let bits = 0;
  let i = 0;
  for ((bits = 0, i = 0); i < numBits; i++)
  {
    bits <<= 1;
    bits |= GetWallpaperDataBit(data, offset + i) ? 1 : 0; // bool8 → bit (coercion 1:1)
  }
  return bits;
}

// ─────────────────────────────────────────────────────────────────────────────
// Accesseurs Walda du SaveBlock — 1:1 pokemon_storage_system.c:9671-9727.
// Ces fonctions sont définies dans src/pokemon_storage_system.ts mais NON exportées ;
// ce module ne devant modifier aucun fichier existant, on les transcrit ici en accès
// direct au Proxy gSaveBlock1Ptr (`any`), exactement comme le .c. Provisoire : à
// remplacer par un import de pokemon_storage_system.ts quand ces symboles y seront exportés.
// ─────────────────────────────────────────────────────────────────────────────
const WALDA_WALLPAPERS_COUNT = 5;       // ARRAY_COUNT(sWaldaWallpapers) — cf. pokemon_storage_system.ts:5315
const WALDA_WALLPAPER_ICONS_COUNT = 20; // ARRAY_COUNT(sWaldaWallpaperIcons) — cf. pokemon_storage_system.ts:5316

/** 1:1 `void SetWaldaWallpaperLockedOrUnlocked(bool32 unlocked)` (pokemon_storage_system.c:9671). */
function SetWaldaWallpaperLockedOrUnlocked(unlocked: number): void {
  gSaveBlock1Ptr.waldaPhrase.patternUnlocked = unlocked;
}

/** 1:1 `void SetWaldaWallpaperPatternId(u8 id)` (pokemon_storage_system.c:9686). */
function SetWaldaWallpaperPatternId(id: number): void {
  if (id < WALDA_WALLPAPERS_COUNT)
    gSaveBlock1Ptr.waldaPhrase.patternId = id;
}

/** 1:1 `void SetWaldaWallpaperIconId(u8 id)` (pokemon_storage_system.c:9697). */
function SetWaldaWallpaperIconId(id: number): void {
  if (id < WALDA_WALLPAPER_ICONS_COUNT)
    gSaveBlock1Ptr.waldaPhrase.iconId = id;
}

/** 1:1 `void SetWaldaWallpaperColors(u16 color1, u16 color2)` (pokemon_storage_system.c:9708). */
function SetWaldaWallpaperColors(color1: number, color2: number): void {
  gSaveBlock1Ptr.waldaPhrase.colors[0] = color1;
  gSaveBlock1Ptr.waldaPhrase.colors[1] = color2;
}

/** 1:1 `u8 *GetWaldaPhrasePtr(void)` (pokemon_storage_system.c:9714). */
function GetWaldaPhrasePtr(): Uint8Array {
  return gSaveBlock1Ptr.waldaPhrase.text;
}

/** 1:1 `void SetWaldaPhrase(const u8 *src)` (pokemon_storage_system.c:9719). */
function SetWaldaPhrase(src: Uint8Array): void {
  StringCopy(gSaveBlock1Ptr.waldaPhrase.text, src);
}

/** 1:1 `bool32 IsWaldaPhraseEmpty(void)` (pokemon_storage_system.c:9724). */
function IsWaldaPhraseEmpty(): boolean {
  return (gSaveBlock1Ptr.waldaPhrase.text[0] == EOS);
}
