/**
 * confetti_util.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/confetti_util.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/confetti_util.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 *
 * Adaptations moteur (toutes citées) :
 *  - Alloc/Free → repo GC (exemption). AllocZeroed = objet zéro littéral ;
 *    FREE_AND_SET_NULL = affectation « null » commentée GC, comme
 *    src/digit_obj_util.ts:116,119,145 (fichier frère, même sous-système).
 *  - memcpy/memset → opérations de champs/struct explicites 1:1 (cf. précédent
 *    CpuFill16 → boucle dans src/digit_obj_util.ts:209).
 *  - OAM runtime : la struct `oam` utilise la shape runtime de `gMain.oamBuffer[]`
 *    (harness/runtime/decomp-globals.ts:1586, `mosaic: boolean`) — c'est aussi
 *    celle de `gDummyOamData` (src/sprite.ts:1981, `mosaic: false`). La struct
 *    hardware stricte `OamData` (include/gba/types.ts:37, `mosaic: 0|1`) n'est PAS
 *    la représentation d'instance runtime dans ce repo.
 */

import { gMain } from '../harness/runtime/decomp-globals';
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from '../include/gba/defines';
import { GetTilesPerImage } from './digit_obj_util';
import { GetSpriteTileStartByTag, IndexOfSpritePaletteTag, gDummyOamData } from './sprite';

/** Représentation runtime d'une entrée OAM = shape exacte de `gMain.oamBuffer[]`
 *  (harness/runtime/decomp-globals.ts:1586). Voir l'en-tête du fichier. */
interface OamDataRT {
  y: number; affineMode: number; objMode: number; mosaic: boolean; bpp: number;
  shape: number; x: number; matrixNum: number; size: number; tileNum: number;
  priority: number; paletteNum: number; affineParam: number;
}

/** 1:1 `struct ConfettiUtil` (include/confetti_util.h:4-24). Bitfields
 *  active:1/allowUpdates:1/dummied:1 → boolean ; priority:2 → number (0..3). */
interface ConfettiUtil {
  oam: OamDataRT;
  x: number;        // s16
  y: number;        // s16
  xDelta: number;   // s16
  yDelta: number;   // s16
  tileTag: number;  // u16
  palTag: number;   // u16
  tileNum: number;  // u16
  id: number;       // u8
  filler: number;   // u8
  animNum: number;  // u8
  active: boolean;       // u8:1
  allowUpdates: boolean; // u8:1
  dummied: boolean;      // u8:1
  priority: number;      // u8:2
  data: number[];        // s16[8]
  callback: ((structPtr: ConfettiUtil) => void) | null; // void (*)(struct ConfettiUtil *)
}

/** 1:1 struct anonyme de `sWork` (confetti_util.c:7-11) : `{ u8 count; struct ConfettiUtil *array; }`. */
interface ConfettiUtilWork {
  count: number;
  array: ConfettiUtil[] | null;
}

/** Zéro-objet OAM (AllocZeroed / memset 0) — mirroir de src/digit_obj_util.ts:211-214. */
function emptyOamData(): OamDataRT {
  return {
    y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0, shape: 0, x: 0,
    matrixNum: 0, size: 0, tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0,
  };
}

/** Zéro-objet `struct ConfettiUtil` (AllocZeroed / memset 0) — mirroir du pattern
 *  emptyDigitPrinter() de src/digit_obj_util.ts:60-66. */
function emptyConfettiUtil(): ConfettiUtil {
  return {
    oam: emptyOamData(), x: 0, y: 0, xDelta: 0, yDelta: 0, tileTag: 0, palTag: 0,
    tileNum: 0, id: 0, filler: 0, animNum: 0, active: false, allowUpdates: false,
    dummied: false, priority: 0, data: [0, 0, 0, 0, 0, 0, 0, 0], callback: null,
  };
}

// ewram

/** 1:1 `static EWRAM_DATA struct { u8 count; struct ConfettiUtil *array; } *sWork = NULL;` (confetti_util.c:7-11). */
let sWork: ConfettiUtilWork | null = null;

// code

/** 1:1 `bool32 ConfettiUtil_Init(u8 count)` (confetti_util.c:13-40). */
export function ConfettiUtil_Init(count: number): boolean {
  let i = 0;
  if (count == 0)
    return false;
  if (count > 64)
    count = 64;
  sWork = { count: 0, array: null } /* AllocZeroed(sizeof(*sWork)) — cf. digit_obj_util.ts:116 */;
  if (sWork == null)
    return false;
  sWork!.array = Array.from({ length: count }, emptyConfettiUtil) /* AllocZeroed(count * sizeof(struct ConfettiUtil)) — cf. digit_obj_util.ts:119 */;
  if (sWork!.array == null)
  {
    sWork = null /* FREE_AND_SET_NULL — GC */;
    return false;
  }
  sWork!.count = count;
  for (i = 0; i < count; i++)
  {
    // 1:1 `memcpy(&sWork->array[i].oam, &gDummyOamData, sizeof(struct OamData))` — copie struct OAM.
    sWork!.array![i].oam = { ...gDummyOamData };
    sWork!.array![i].dummied = true;
  }
  return true;
}

/** 1:1 `bool32 ConfettiUtil_Free(void)` (confetti_util.c:42-58). */
export function ConfettiUtil_Free(): boolean {
  let i = 0;
  if (sWork == null)
    return false;
  for (i = 0; i < sWork!.count; i++)
  {
    // 1:1 `memcpy(&gMain.oamBuffer[i + 64], &gDummyOamData, sizeof(struct OamData))`.
    gMain.oamBuffer[i + 64] = { ...gDummyOamData };
  }
  // 1:1 `memset(sWork->array, 0, sWork->count * sizeof(struct ConfettiUtil))` — clear
  //      subsumé par le GC : `sWork->array` est libéré à la ligne suivante (FREE_AND_SET_NULL).
  sWork!.array = null /* FREE_AND_SET_NULL — GC */;
  // 1:1 `memset(sWork, 0, sizeof(*sWork))` — idem : `sWork` libéré à la ligne suivante.
  sWork = null /* FREE_AND_SET_NULL — GC */;
  return true;
}

/** 1:1 `bool32 ConfettiUtil_Update(void)` (confetti_util.c:60-90). */
export function ConfettiUtil_Update(): boolean {
  let i = 0;
  if (sWork == null || sWork!.array == null)
    return false;
  for (i = 0; i < sWork!.count; i++)
  {
    if (sWork!.array![i].active && sWork!.array![i].allowUpdates)
    {
      if (sWork!.array![i].callback != null)
        sWork!.array![i].callback!(sWork!.array![i]);
      if (sWork!.array![i].dummied)
      {
        // 1:1 `memcpy(&gMain.oamBuffer[i + 64], &gDummyOamData, sizeof(struct OamData))`.
        gMain.oamBuffer[i + 64] = { ...gDummyOamData };
      }
      else
      {
        sWork!.array![i].oam.y = sWork!.array![i].y + sWork!.array![i].yDelta;
        sWork!.array![i].oam.x = sWork!.array![i].x + sWork!.array![i].xDelta;
        sWork!.array![i].oam.priority = sWork!.array![i].priority;
        sWork!.array![i].oam.tileNum = sWork!.array![i].tileNum;
        // 1:1 `memcpy(&gMain.oamBuffer[i + 64], &sWork->array[i], sizeof(struct OamData))` :
        //      `oam` est le 1er membre de struct ConfettiUtil → &array[i] ≡ &array[i].oam,
        //      donc sizeof(OamData) octets copient l'oam.
        gMain.oamBuffer[i + 64] = { ...sWork!.array![i].oam };
      }
    }
  }
  return true;
}

/** 1:1 `static bool32 SetAnimAndTileNum(struct ConfettiUtil *structPtr, u8 animNum)` (confetti_util.c:92-106). */
function SetAnimAndTileNum(structPtr: ConfettiUtil | null, animNum: number): boolean {
  let tileStart = 0;
  if (structPtr == null)
    return false;
  tileStart = GetSpriteTileStartByTag(structPtr.tileTag);
  if (tileStart == 0xFFFF)
    return false;
  structPtr.animNum = animNum;
  structPtr.tileNum = (GetTilesPerImage(structPtr.oam.shape, structPtr.oam.size) * animNum) + tileStart;
  return true;
}

/** 1:1 `u8 ConfettiUtil_SetCallback(u8 id, void (*func)(struct ConfettiUtil *))` (confetti_util.c:108-117). */
export function ConfettiUtil_SetCallback(id: number, func: (structPtr: ConfettiUtil) => void): number {
  if (sWork == null || id >= sWork!.count)
    return 0xFF;
  else if (!sWork!.array![id].active)
    return 0xFF;
  sWork!.array![id].callback = func;
  return id;
}

/** 1:1 `u8 ConfettiUtil_SetData(u8 id, u8 dataArrayId, s16 dataValue)` (confetti_util.c:119-128). */
export function ConfettiUtil_SetData(id: number, dataArrayId: number, dataValue: number): number {
  if (sWork == null || id >= sWork!.count)
    return 0xFF;
  else if (!sWork!.array![id].active || dataArrayId > sWork!.array![id].data.length - 1) // - 1 b/c last slot is reserved for taskId
    return 0xFF;
  sWork!.array![id].data[dataArrayId] = dataValue;
  return id;
}

/** 1:1 `u8 ConfettiUtil_AddNew(const struct OamData *oam, u16 tileTag, u16 palTag, s16 x, s16 y, u8 animNum, u8 priority)` (confetti_util.c:130-168). */
export function ConfettiUtil_AddNew(oam: OamDataRT, tileTag: number, palTag: number, x: number, y: number, animNum: number, priority: number): number {
  let structPtr: ConfettiUtil | null = null;
  let i = 0;
  if (sWork == null || oam == null)
    return 0xFF;
  for (i = 0; i < sWork!.count; i++)
  {
    if (!sWork!.array![i].active)
    {
      structPtr = sWork!.array![i];
      // 1:1 `memset(structPtr, 0, sizeof(*structPtr))` — reset IN-PLACE (structPtr ≡ &sWork->array[i]).
      Object.assign(structPtr, emptyConfettiUtil());
      structPtr.id = i;
      structPtr.active = true;
      structPtr.allowUpdates = true;
      break;
    }
  }
  if (structPtr == null)
    return 0xFF;
  // 1:1 `memcpy(&structPtr->oam, oam, sizeof(*oam))` — copie struct OAM.
  structPtr.oam = { ...oam };
  structPtr.tileTag = tileTag;
  structPtr.palTag = palTag;
  structPtr.x = x;
  structPtr.y = y;
  structPtr.oam.paletteNum = IndexOfSpritePaletteTag(palTag);
  if (priority < 4)
  {
    structPtr.priority = priority;
    structPtr.oam.priority = priority;
  }
  SetAnimAndTileNum(structPtr, animNum);
  return structPtr.id;
}

/** 1:1 `u8 ConfettiUtil_Remove(u8 id)` (confetti_util.c:170-181). */
export function ConfettiUtil_Remove(id: number): number {
  if (sWork == null || !sWork!.array![id].active)
    return 0xFF;
  // 1:1 `memset(&sWork->array[id], 0, sizeof(struct ConfettiUtil))` — reset IN-PLACE.
  Object.assign(sWork!.array![id], emptyConfettiUtil());
  sWork!.array![id].oam.y = DISPLAY_HEIGHT;
  sWork!.array![id].oam.x = DISPLAY_WIDTH;
  sWork!.array![id].dummied = true;
  // 1:1 `memcpy(&gMain.oamBuffer[id + 64], &gDummyOamData, sizeof(struct OamData))`.
  gMain.oamBuffer[id + 64] = { ...gDummyOamData };
  return id;
}
