/**
 * digit_obj_util.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/digit_obj_util.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/digit_obj_util.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { GetDecompressedDataSize, LoadCompressedSpriteSheet, gMain } from '../harness/runtime/decomp-globals';
import { ST_OAM_AFFINE_ERASE, ST_OAM_AFFINE_OFF } from '../include/sprite';
import { FreeSpritePaletteByTag, FreeSpriteTilesByTag, GetSpriteTileStartByTag, IndexOfSpritePaletteTag, LoadSpritePalette, LoadSpriteSheet } from './sprite';

/** 1:1 `struct DigitObjUtilTemplate` (include/digit_obj_util.h:4). Convention repo :
 *  spriteSheet.data = Uint8Array (non compressé, size != 0) ou symbole string
 *  (compressé, size == 0 → branche LoadCompressedSpriteSheet). */
export interface DigitObjUtilTemplate {
  strConvMode: number;
  shape: number;
  size: number;
  priority: number;
  oamCount: number;
  xDelta: number;
  x: number;
  y: number;
  spriteSheet: { data: Uint8Array | string; size: number; tag: string | number };
  spritePal: { data: string; tag: string | number };
}

/** 1:1 `struct DigitPrinter` (digit_obj_util.c:8). */
interface DigitPrinter {
  isActive: boolean;
  firstOamId: number;
  strConvMode: number;
  oamCount: number;
  palTagIndex: number;
  size: number;
  shape: number;
  priority: number;
  xDelta: number;
  tilesPerImage: number;
  tileStart: number;
  x: number;
  y: number;
  tileTag: string | number;
  palTag: string | number;
  pow10: number;
  lastPrinted: number;
}

/** 1:1 `struct DigitPrinterAlloc` (digit_obj_util.c:29). */
interface DigitPrinterAlloc {
  count: number;
  array: DigitPrinter[] | null;
}

// this file's functions

/** Slot zéro `struct DigitPrinter` (Alloc C → champs indéfinis ; Init pose
 *  isActive/firstOamId explicitement — zéro-objet côté TS). */
function emptyDigitPrinter(): DigitPrinter {
  return {
    isActive: false, firstOamId: 0, strConvMode: 0, oamCount: 0, palTagIndex: 0,
    size: 0, shape: 0, priority: 0, xDelta: 0, tilesPerImage: 0, tileStart: 0,
    x: 0, y: 0, tileTag: 0, palTag: 0, pow10: 0, lastPrinted: 0,
  };
}

// ewram

/** 1:1 `static EWRAM_DATA struct DigitPrinterAlloc *sOamWork = {0};` (digit_obj_util.c:45) — pointeur NULL. */
let sOamWork: DigitPrinterAlloc | null = null;

// const rom data

/** 1:1 (digit_obj_util.c:48) */
const sTilesPerImage: number[][] = [
  [
    // SPRITE_SIZE_8x8
    // SPRITE_SIZE_16x16
    // SPRITE_SIZE_32x32
    // SPRITE_SIZE_64x64
    0x01, // [ST_OAM_SIZE_0]
    0x04, // [ST_OAM_SIZE_1]
    0x10, // [ST_OAM_SIZE_2]
    0x40, // [ST_OAM_SIZE_3]
  ], // [ST_OAM_SQUARE]
  [
    // SPRITE_SIZE_16x8
    // SPRITE_SIZE_32x8
    // SPRITE_SIZE_32x16
    // SPRITE_SIZE_64x32
    0x02, // [ST_OAM_SIZE_0]
    0x04, // [ST_OAM_SIZE_1]
    0x08, // [ST_OAM_SIZE_2]
    0x20, // [ST_OAM_SIZE_3]
  ], // [ST_OAM_H_RECTANGLE]
  [
    // SPRITE_SIZE_8x16
    // SPRITE_SIZE_8x32
    // SPRITE_SIZE_16x32
    // SPRITE_SIZE_32x64
    0x02, // [ST_OAM_SIZE_0]
    0x04, // [ST_OAM_SIZE_1]
    0x08, // [ST_OAM_SIZE_2]
    0x20, // [ST_OAM_SIZE_3]
  ], // [ST_OAM_V_RECTANGLE]
];

// code

/** 1:1 `bool32 DigitObjUtil_Init(u32 count)` (digit_obj_util.c:71-97). */
export function DigitObjUtil_Init(count: number): boolean {
  let i = 0;
  if (sOamWork != null)
    DigitObjUtil_Free();
  sOamWork = { count: 0, array: null } /* Alloc(sizeof(*sOamWork)) */;
  if (sOamWork == null)
    return false;
  sOamWork!.array = Array.from({ length: count }, emptyDigitPrinter) /* Alloc(sizeof(struct DigitPrinter) * count) */;
  if (sOamWork!.array == null)
  {
    void sOamWork /* Free — GC */;
    return false;
  }
  sOamWork!.count = count;
  for (i = 0; i < count; i++)
  {
    sOamWork!.array![i].isActive = false;
    sOamWork!.array![i].firstOamId = 0xFF;
  }
  return true;
}

/** 1:1 `void DigitObjUtil_Free(void)` (digit_obj_util.c:99-115). */
export function DigitObjUtil_Free(): void {
  if (sOamWork != null)
  {
    if (sOamWork!.array != null)
    {
      let i = 0;
      for (i = 0; i < sOamWork!.count; i++)
        DigitObjUtil_DeletePrinter(i);
      void sOamWork!.array /* Free — GC */;
    }
    sOamWork = null /* FREE_AND_SET_NULL — GC */;
  }
}

/** 1:1 `bool32 DigitObjUtil_CreatePrinter(u32 id, s32 num, const struct DigitObjUtilTemplate *template)` (digit_obj_util.c:117-176). */
export function DigitObjUtil_CreatePrinter(id: number, num: number, template: DigitObjUtilTemplate): boolean {
  let i = 0;
  if (sOamWork == null)
    return false;
  if (sOamWork!.array![id].isActive)
    return false;
  sOamWork!.array![id].firstOamId = GetFirstOamId(template.oamCount);
  if (sOamWork!.array![id].firstOamId == 0xFF)
    return false;
  sOamWork!.array![id].tileStart = GetSpriteTileStartByTag(template.spriteSheet.tag);
  if (sOamWork!.array![id].tileStart == 0xFFFF)
  {
    if (template.spriteSheet.size != 0)
    {
      sOamWork!.array![id].tileStart = LoadSpriteSheet(template.spriteSheet as { data: Uint8Array; size: number; tag: string | number });
    }
    else
    {
      // 1:1 `compSpriteSheet = *(struct CompressedSpriteSheet *)(template->spriteSheet)` — COPIE de struct.
      const compSpriteSheet = { ...template.spriteSheet, data: template.spriteSheet.data as string };
      compSpriteSheet.size = GetDecompressedDataSize(template.spriteSheet.data as string);
      // Harness : LoadCompressedSpriteSheet est void chez nous → tileStart relu par tag
      // (décomp : valeur de retour de LoadSpriteSheet interne, même sémantique 0xFFFF si échec).
      LoadCompressedSpriteSheet(compSpriteSheet);
      sOamWork!.array![id].tileStart = GetSpriteTileStartByTag(compSpriteSheet.tag);
    }
    if (sOamWork!.array![id].tileStart == 0xFFFF)
      return false;
  }
  sOamWork!.array![id].palTagIndex = IndexOfSpritePaletteTag(template.spritePal.tag);
  if (sOamWork!.array![id].palTagIndex == 0xFF)
    sOamWork!.array![id].palTagIndex = LoadSpritePalette(template.spritePal);
  sOamWork!.array![id].strConvMode = template.strConvMode;
  sOamWork!.array![id].oamCount = template.oamCount;
  sOamWork!.array![id].x = template.x;
  sOamWork!.array![id].y = template.y;
  sOamWork!.array![id].shape = template.shape;
  sOamWork!.array![id].size = template.size;
  sOamWork!.array![id].priority = template.priority;
  sOamWork!.array![id].xDelta = template.xDelta;
  sOamWork!.array![id].tilesPerImage = GetTilesPerImage(template.shape, template.size);
  sOamWork!.array![id].tileTag = template.spriteSheet.tag;
  sOamWork!.array![id].palTag = template.spritePal.tag;
  sOamWork!.array![id].isActive = true;
  // Decimal left shift
  sOamWork!.array![id].pow10 = 1;
  for (i = 1; i < template.oamCount; i++)
    sOamWork!.array![id].pow10 *= 10;
  CopyWorkToOam(sOamWork!.array![id]);
  DigitObjUtil_PrintNumOn(id, num);
  return true;
}

/** 1:1 `static void CopyWorkToOam(struct DigitPrinter *objWork)` (digit_obj_util.c:178-203). */
function CopyWorkToOam(objWork: DigitPrinter): void {
  let i = 0;
  let oamId = objWork.firstOamId;
  let x = objWork.x;
  let oamCount = objWork.oamCount + 1;
  // 1:1 `CpuFill16(0, &gMain.oamBuffer[oamId], sizeof(struct OamData) * oamCount)` — zérote oamCount entrées OAM.
  for (i = 0; i < oamCount; i++)
    gMain.oamBuffer[oamId + i] = {
      y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0, shape: 0, x: 0,
      matrixNum: 0, size: 0, tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0,
    };
  for ((i = 0, oamId = objWork.firstOamId); i < oamCount; (i++, oamId++))
  {
    gMain.oamBuffer[oamId].y = objWork.y;
    gMain.oamBuffer[oamId].x = x;
    gMain.oamBuffer[oamId].shape = objWork.shape;
    gMain.oamBuffer[oamId].size = objWork.size;
    gMain.oamBuffer[oamId].tileNum = objWork.tileStart;
    gMain.oamBuffer[oamId].priority = objWork.priority;
    gMain.oamBuffer[oamId].paletteNum = objWork.palTagIndex;
    x += objWork.xDelta;
  }
  oamId--;
  gMain.oamBuffer[oamId].x = objWork.x - objWork.xDelta;
  gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
  gMain.oamBuffer[oamId].tileNum = objWork.tileStart + (objWork.tilesPerImage * 10);
}

/** 1:1 `void DigitObjUtil_PrintNumOn(u32 id, s32 num)` (digit_obj_util.c:205-238). */
export function DigitObjUtil_PrintNumOn(id: number, num: number): void {
  let sign = false;
  if (sOamWork == null)
    return;
  if (!sOamWork!.array![id].isActive)
    return;
  sOamWork!.array![id].lastPrinted = num;
  if (num < 0)
  {
    sign = true;
    num *= -1;
  }
  else
  {
    sign = false;
  }
  switch (sOamWork!.array![id].strConvMode) {
    case 0:
    default:
      DrawNumObjsLeadingZeros(sOamWork!.array![id], num, sign);
      break;
    case 1:
      DrawNumObjsMinusInFront(sOamWork!.array![id], num, sign);
      break;
    case 2:
      DrawNumObjsMinusInBack(sOamWork!.array![id], num, sign);
      break;
  }
}

/** 1:1 `static void DrawNumObjsLeadingZeros(struct DigitPrinter *objWork, s32 num, bool32 sign)` (digit_obj_util.c:240-259). */
function DrawNumObjsLeadingZeros(objWork: DigitPrinter, num: number, sign: boolean): void {
  let pow10 = objWork.pow10;
  let oamId = objWork.firstOamId;
  while (pow10 != 0)
  {
    let digit = Math.trunc(num / pow10);
    num -= (digit * pow10);
    pow10 = Math.trunc(pow10 / 10);
    gMain.oamBuffer[oamId].tileNum = (digit * objWork.tilesPerImage) + objWork.tileStart;
    oamId++;
  }
  if (sign)
    gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;
  else
    gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
}

/** 1:1 `static void DrawNumObjsMinusInFront(struct DigitPrinter *objWork, s32 num, bool32 sign)` (digit_obj_util.c:261-304). */
function DrawNumObjsMinusInFront(objWork: DigitPrinter, num: number, sign: boolean): void {
  let pow10 = objWork.pow10;
  let oamId = 0;
  let curDigit = 0;
  let firstDigit = 0;
  oamId = objWork.firstOamId;
  curDigit = 0;
  firstDigit = -1;
  while (pow10 != 0)
  {
    let digit = Math.trunc(num / pow10);
    num -= (digit * pow10);
    pow10 = Math.trunc(pow10 / 10);
    if (digit != 0 || firstDigit != -1 || pow10 == 0)
    {
      gMain.oamBuffer[oamId].tileNum = (digit * objWork.tilesPerImage) + objWork.tileStart;
      gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;
      if (firstDigit == -1)
        firstDigit = curDigit;
    }
    else
    {
      gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
    }
    oamId++;
    curDigit++;
  }
  if (sign)
  {
    gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;
    gMain.oamBuffer[oamId].x = objWork.x + ((firstDigit - 1) * objWork.xDelta);
  }
  else
  {
    gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
  }
}

/** 1:1 `static void DrawNumObjsMinusInBack(struct DigitPrinter *objWork, s32 num, bool32 sign)` (digit_obj_util.c:306-341). */
function DrawNumObjsMinusInBack(objWork: DigitPrinter, num: number, sign: boolean): void {
  let pow10 = objWork.pow10;
  let oamId = objWork.firstOamId;
  let printingDigits = false;
  let nsprites = 0;
  while (pow10 != 0)
  {
    let digit = Math.trunc(num / pow10);
    num -= (digit * pow10);
    pow10 = Math.trunc(pow10 / 10);
    if (digit != 0 || printingDigits || pow10 == 0)
    {
      printingDigits = true;
      gMain.oamBuffer[oamId].tileNum = (digit * objWork.tilesPerImage) + objWork.tileStart;
      gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;
      oamId++;
      nsprites++;
    }
  }
  while (nsprites < objWork.oamCount)
  {
    gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
    oamId++;
    nsprites++;
  }
  if (sign)
    gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;
  else
    gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
}

/** 1:1 `void DigitObjUtil_DeletePrinter(u32 id)` (digit_obj_util.c:343-364). */
export function DigitObjUtil_DeletePrinter(id: number): void {
  let oamId = 0;
  let oamCount = 0;
  let i = 0;
  if (sOamWork == null)
    return;
  if (!sOamWork!.array![id].isActive)
    return;
  oamCount = sOamWork!.array![id].oamCount + 1;
  oamId = sOamWork!.array![id].firstOamId;
  for (i = 0; i < oamCount; (i++, oamId++))
    gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
  if (!SharesTileWithAnyActive(id))
    FreeSpriteTilesByTag(sOamWork!.array![id].tileTag);
  if (!SharesPalWithAnyActive(id))
    FreeSpritePaletteByTag(sOamWork!.array![id].palTag);
  sOamWork!.array![id].isActive = false;
}

/** 1:1 `void DigitObjUtil_HideOrShow(u32 id, bool32 hide)` (digit_obj_util.c:366-389). */
export function DigitObjUtil_HideOrShow(id: number, hide: boolean): void {
  let oamId = 0;
  let oamCount = 0;
  let i = 0;
  if (sOamWork == null)
    return;
  if (!sOamWork!.array![id].isActive)
    return;
  oamCount = sOamWork!.array![id].oamCount + 1;
  oamId = sOamWork!.array![id].firstOamId;
  if (hide)
  {
    for (i = 0; i < oamCount; (i++, oamId++))
      gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
  }
  else
  {
    for (i = 0; i < oamCount; (i++, oamId++))
      gMain.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;
    DigitObjUtil_PrintNumOn(id, sOamWork!.array![id].lastPrinted);
  }
}

/** 1:1 `static u8 GetFirstOamId(u8 oamCount)` (digit_obj_util.c:391-413). */
function GetFirstOamId(oamCount: number): number {
  let i = 0;
  let firstOamId = 64;
  for (i = 0; i < sOamWork!.count; i++)
  {
    if (!sOamWork!.array![i].isActive)
    {
      if (sOamWork!.array![i].firstOamId != 0xFF && sOamWork!.array![i].oamCount <= oamCount)
        return sOamWork!.array![i].firstOamId;
    }
    else
    {
      firstOamId += 1 + sOamWork!.array![i].oamCount;
    }
  }
  if (firstOamId + oamCount + 1 > 128)
    return 0xFF;
  else
    return firstOamId;
}

/** 1:1 `static bool32 SharesTileWithAnyActive(u32 id)` (digit_obj_util.c:415-429). */
function SharesTileWithAnyActive(id: number): boolean {
  let i = 0;
  for (i = 0; i < sOamWork!.count; i++)
  {
    if (sOamWork!.array![i].isActive && i != id && sOamWork!.array![i].tileTag == sOamWork!.array![id].tileTag)
    {
      return true;
    }
  }
  return false;
}

/** 1:1 `static bool32 SharesPalWithAnyActive(u32 id)` (digit_obj_util.c:431-445). */
function SharesPalWithAnyActive(id: number): boolean {
  let i = 0;
  for (i = 0; i < sOamWork!.count; i++)
  {
    if (sOamWork!.array![i].isActive && i != id && sOamWork!.array![i].palTag == sOamWork!.array![id].palTag)
    {
      return true;
    }
  }
  return false;
}

/** 1:1 `u8 GetTilesPerImage(u32 shape, u32 size)` (digit_obj_util.c:447-450). */
export function GetTilesPerImage(shape: number, size: number): number {
  return sTilesPerImage[shape][size];
}
