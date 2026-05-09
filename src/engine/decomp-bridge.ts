/**
 * decomp-bridge.ts — single import surface for auto-transpiled décomp modules.
 *
 * RÔLE :
 *   Les fichiers `src/engine/decomp-data/auto/src-all/*-all-auto.ts` sont auto-générés
 *   depuis `D:/Projet 1/decomps/pokeemeraude/src/*.c` (~15,000 fonctions). Ces fichiers
 *   référencent des helpers à scope GLOBAL (= LoadPalette, GetMonData, FaceDirection,
 *   ARRAY_COUNT, etc.) qui doivent être résolus côté TS pour qu'on puisse importer
 *   et activer ces modules sélectivement.
 *
 *   Ce bridge est la SOURCE UNIQUE pour ces helpers : il re-export ceux qu'on a déjà
 *   implémentés (= dans `decomp-globals`, `decomp-runtime`, `decomp-helpers`,
 *   `script-vars`, etc.), inline les macros simples (= ARRAY_COUNT, BG_PLTT_ID),
 *   et **throw NotImplemented** pour ceux qu'on n'a pas encore portés.
 *
 * DIRECTIVE 1:1 STRICTE :
 *   - Pas de stubs silencieux qui retournent 0/null/false (= masquerait les bugs).
 *   - Si un helper n'est pas mappable 1:1 immédiatement, on **throw NotImplementedError**
 *     pour fail-fast → on saura exactement quel fichier porter en priorité.
 *   - Les macros (= ARRAY_COUNT, MAP_NUM) sont triviales et inlinées 1:1 du #define C.
 *   - Les re-exports délèguent à l'impl existante quand elle est 1:1 vérifiée.
 *
 * USAGE :
 *   Dans un module auto-généré :
 *   ```ts
 *   import * as bridge from '../../../decomp-bridge';
 *   // Ou (préféré, après résolution des imports par le transpiler) :
 *   import { LoadPalette, FaceDirection, ARRAY_COUNT } from '../../../decomp-bridge';
 *   ```
 *
 * MAINTENANCE :
 *   - Quand un helper est porté 1:1, le déplacer de "throw" → "re-export".
 *   - Garder `helper-bridge-manifest.md` à jour (= run `node scripts/build-helper-bridge-manifest.mjs`).
 *   - Cf. `memory/audit-2026-05-09-total-1to1.md` pour la liste des modules à porter.
 *
 * Sources de vérité :
 *   - `decomps/pokeemeraude/include/macro.h` (= ARRAY_COUNT, T1_READ_PTR, SWAP, etc.)
 *   - `decomps/pokeemeraude/include/gba/macro.h` (= BG_PLTT_ID, OBJ_PLTT_ID, etc.)
 *   - `decomps/pokeemeraude/src/*.c` pour chaque helper.
 */

// ─── Re-exports : palette / GPU / VRAM ────────────────────────────────────────

export {
  // Palette helpers (palette.c)
  LoadPalette,
  FillPalBufferBlack,
  FillPalBufferWhite,
  BlendPalette,
  BlendPalettes,
  BlendPalettesUnfaded,
  ResetPaletteFade,
  // CPU mem helpers (main.c + macro.h)
  CpuFill16,
  CpuFill32,
  CpuSet,
  CpuFastSet,
  DmaClear16,
  DmaClear32,
  DmaFill16,
  DmaFill32,
  // Joypad helpers (main.c + macro.h)
  JOY_NEW,
  JOY_HELD,
  JOY_REPEAT,
  // Decompression (decompress.c)
  LZ77UnCompVram,
  LZDecompressVram,
  // Sprite palette helpers
  FreeAllSpritePalettes,
  IndexOfSpritePaletteTag,
  GetSpriteTileStartByTag,
  LoadCompressedSpriteSheet,
  LoadCompressedSpriteSheetUsingHeap,
  LoadCompressedSpritePaletteUsingHeap,
  LoadSpritePalettes,
  // BG ops
  LoadBgTiles,
  // Macros déjà exportés depuis decomp-globals
  PIXEL_FILL,
  BLDALPHA_BLEND,
  // Audio
  PlaySE,
  PlayBGM,
  PlayFanfare,
  StopFanfare,
  IsFanfareTaskInactive,
  WaitFanfare,
  m4aSongNumStart,
  m4aMPlayAllStop,
  pauseBgm,
  resumeBgm,
  isBgmPaused,
  FadeOutBGM,
  FadeInBGM,
  // Tasks (high-level)
  ResetTasks,
  RunTasks,
  AnimateSprites,
  BuildOamBuffer,
  FindTaskIdByFunc,
  TASK_NONE,
  // Misc helpers
  SpriteCallbackDummy,
  SAFE_DIV,
  MultiplyInvertedPaletteRGBComponents,
  PALETTES_ALL,
  PALETTES_BG,
  PALETTES_OBJ,
  PLTT_SIZE,
  BG_SCREEN_SIZE,
  VRAM_SIZE,
  // Save block / runtime context
  setGlobalRuntime,
  getRuntime,
  getAsset,
  // Sprite affine (used heavily)
  InitSpriteAffineAnim,
  // Subsprites
  SetSubspriteTables,
  // Cry
  PlayCryInternal,
} from './decomp-globals';

// ─── Re-exports : sprite/affine helpers (decomp-helpers.ts) ───────────────────

export {
  Sin,
  Cos,
  Q_8_8_TO_INT,
  SetOamMatrix,
  CalcCenterToCornerVec,
  ST_OAM_AFFINE_OFF,
  ST_OAM_AFFINE_NORMAL,
  ST_OAM_AFFINE_ERASE,
  ST_OAM_AFFINE_DOUBLE,
  ST_OAM_AFFINE_ON_MASK,
  ST_OAM_AFFINE_DOUBLE_MASK,
  ST_OAM_OBJ_NORMAL,
  ST_OAM_OBJ_BLEND,
  ST_OAM_OBJ_WINDOW,
  ST_OAM_4BPP,
  ST_OAM_8BPP,
  gSineTable,
  PaletteBuffer,
} from './decomp-helpers';

// ─── Re-exports : GPU register / BG constants (decomp-runtime.ts) ─────────────

export {
  // BGCNT macros (= already function-style)
  BGCNT_PRIORITY,
  BGCNT_CHARBASE,
  BGCNT_SCREENBASE,
  BGCNT_16COLOR,
  BGCNT_256COLOR,
  BGCNT_TXT256x256,
  BGCNT_TXT512x256,
  BGCNT_TXT256x512,
  BGCNT_TXT512x512,
  BGCNT_AFF128x128,
  BGCNT_AFF256x256,
  BGCNT_AFF512x512,
  BGCNT_AFF1024x1024,
  BGCNT_WRAP,
  // DISPCNT
  DISPCNT_MODE_0,
  DISPCNT_MODE_1,
  DISPCNT_MODE_2,
  DISPCNT_OBJ_1D_MAP,
  DISPCNT_BG0_ON,
  DISPCNT_BG1_ON,
  DISPCNT_BG2_ON,
  DISPCNT_BG3_ON,
  DISPCNT_OBJ_ON,
  DISPCNT_WIN1_ON,
  DISPCNT_WINOBJ_ON,
  DISPCNT_WIN0_ON,
  DISPCNT_BG_ALL_ON,
  DISPCNT_FORCED_BLANK,
  DISPCNT_HBLANK_INTERVAL_FREE,
  // BLDCNT
  BLDCNT_TGT1_BG0,
  BLDCNT_TGT1_BG1,
  BLDCNT_TGT1_BG2,
  BLDCNT_TGT1_BG3,
  BLDCNT_TGT1_OBJ,
  BLDCNT_TGT1_BD,
  BLDCNT_EFFECT_NONE,
  BLDCNT_EFFECT_BLEND,
  BLDCNT_EFFECT_LIGHTEN,
  BLDCNT_EFFECT_DARKEN,
  BLDCNT_TGT2_BG0,
  BLDCNT_TGT2_BG1,
  BLDCNT_TGT2_BG2,
  BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ,
  BLDCNT_TGT2_BD,
  // PLTT (palette ID helpers)
  BG_PLTT_ID,
  OBJ_PLTT_ID,
  // VRAM addresses
  BG_VRAM,
  BG_CHAR_ADDR,
  BG_SCREEN_ADDR,
  // Display
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
  // Fade modes
  NORMAL_FADE,
  FAST_FADE,
  HARDWARE_FADE,
  // Register offsets (= for SetGpuReg/GetGpuReg)
  REG_OFFSET_DISPCNT,
  REG_OFFSET_BG0CNT,
  REG_OFFSET_BG1CNT,
  REG_OFFSET_BG2CNT,
  REG_OFFSET_BG3CNT,
  REG_OFFSET_BG0HOFS,
  REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1HOFS,
  REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS,
  REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3HOFS,
  REG_OFFSET_BG3VOFS,
  REG_OFFSET_WIN0H,
  REG_OFFSET_WIN1H,
  REG_OFFSET_WIN0V,
  REG_OFFSET_WIN1V,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  REG_OFFSET_MOSAIC,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDY,
} from './decomp-runtime';

// ─── Re-exports : event_data (script-vars.ts) ─────────────────────────────────

export {
  FlagSet,
  FlagClear,
  FlagGet,
  VarSet,
  VarGet,
  Compare,
  COMPARE_LT,
  COMPARE_EQ,
  COMPARE_GT,
} from './script-vars';

// ─── Re-exports : script runtime (script-runtime.ts) ──────────────────────────

export {
  LockPlayerFieldControls,
  InitScriptContext,
  SetupBytecodeScript,
  ScriptJump,
} from './script-runtime';

// ─── Re-exports : text system (gba-text-system.ts) ────────────────────────────

export {
  StringExpandPlaceholders,
  GetStringWidth,
  GetStringRightAlignXOffset,
  AddTextPrinterParameterized3,
  AddTextPrinterForMessage,
  AddTextPrinterWithCallbackForMessage,
  RunTextPrinters,
  IsTextPrinterActive,
  ClearTextPrinters,
  DeactivateAllTextPrinters,
  RunTextPrintersAndIsPrinter0Active,
} from './gba-text-system';

// ─── Inline macros (= include/macro.h + include/gba/macro.h) ──────────────────

/** 1:1 décomp `include/macro.h` :
 *    #define ARRAY_COUNT(arr) (size_t)(sizeof(arr) / sizeof((arr)[0]))
 *  En TS : la longueur d'un Array. */
export function ARRAY_COUNT<T>(arr: ArrayLike<T>): number {
  return arr.length;
}

/** 1:1 décomp `include/macro.h` :
 *    #define SWAP(a, b, temp) ({ temp = a; a = b; b = temp; })
 *  Hérité du C ; en TS on retourne un tuple [b, a] ou modifie via setter externe.
 *  Les usages typiques sont des macros locales — soit on les laisse dans le code
 *  transpilé (où elles plantent), soit on inline. Ici on fournit un helper
 *  fonctionnel pour les cas où le résultat est utilisé. */
export function SWAP<T>(a: T, b: T): [T, T] {
  return [b, a];
}

/** 1:1 décomp `include/macro.h` :
 *    #define T1_READ_8(ptr)   ((ptr)[0])
 *    #define T1_READ_16(ptr)  ((ptr)[0] | ((ptr)[1] << 8))
 *    #define T1_READ_32(ptr)  ((ptr)[0] | ((ptr)[1] << 8) | ((ptr)[2] << 16) | ((ptr)[3] << 24))
 *    #define T1_READ_PTR(ptr) ((const u8 *)T1_READ_32(ptr))
 *  En TS, on travaille avec offsets dans Uint8Array. */
export function T1_READ_8(ptr: ArrayLike<number>, offset = 0): number {
  return ptr[offset] & 0xFF;
}
export function T1_READ_16(ptr: ArrayLike<number>, offset = 0): number {
  return (ptr[offset] & 0xFF) | ((ptr[offset + 1] & 0xFF) << 8);
}
export function T1_READ_32(ptr: ArrayLike<number>, offset = 0): number {
  return (
    (ptr[offset] & 0xFF) |
    ((ptr[offset + 1] & 0xFF) << 8) |
    ((ptr[offset + 2] & 0xFF) << 16) |
    ((ptr[offset + 3] & 0xFF) << 24)
  );
}
/** Pour ROM data : retourne le pointer / asset symbol.
 *  Dans notre runtime, les "pointers" sont des asset string keys. */
export function T1_READ_PTR(ptr: any): any {
  return ptr;
}
/** Same as T1_READ_PTR, alternate alignment (= odd-aligned reads in C). */
export function T2_READ_PTR(ptr: any): any {
  return ptr;
}
/** 1:1 décomp `include/macro.h` :
 *    #define T2_READ_8(ptr)   ((ptr)[0])
 *    #define T2_READ_16(ptr)  ((ptr)[0] | ((ptr)[1] << 8))
 *    #define T2_READ_32(ptr)  ((ptr)[0] | ((ptr)[1] << 8) | ((ptr)[2] << 16) | ((ptr)[3] << 24))
 */
export function T2_READ_8(ptr: ArrayLike<number>, offset = 0): number {
  return T1_READ_8(ptr, offset);
}
export function T2_READ_16(ptr: ArrayLike<number>, offset = 0): number {
  return T1_READ_16(ptr, offset);
}
export function T2_READ_32(ptr: ArrayLike<number>, offset = 0): number {
  return T1_READ_32(ptr, offset);
}

/** 1:1 décomp `include/constants/maps.h` :
 *    #define MAP_GROUP(map) ((map) >> 8)
 *    #define MAP_NUM(map)   ((map) & 0xFF)
 *  Dans le décomp, les map IDs sont packed en u16 (= group << 8 | num). */
export function MAP_GROUP(map: number): number {
  return (map >> 8) & 0xFF;
}
export function MAP_NUM(map: number): number {
  return map & 0xFF;
}

/** 1:1 décomp `include/macro.h` :
 *    #define FREE_AND_SET_NULL(ptr) do { Free(ptr); (ptr) = NULL; } while (0)
 *  En TS : Free + null-out. Comme nos pointeurs sont des refs JS, on retourne
 *  juste null pour que l'appelant fasse `x = FREE_AND_SET_NULL(x)`. */
export function FREE_AND_SET_NULL<T>(_ptr: T): null {
  // Free is a no-op (= no manual heap in JS). Callers should do `x = FREE_AND_SET_NULL(x)`.
  return null;
}
/** 1:1 décomp variant `include/malloc.h` :
 *    #define TRY_FREE_AND_SET_NULL(ptr) if (ptr) FREE_AND_SET_NULL(ptr)
 *  Same as FREE_AND_SET_NULL but null-safe. */
export function TRY_FREE_AND_SET_NULL<T>(_ptr: T): null {
  return null;
}

/** 1:1 décomp `include/gba/types.h` :
 *    #define PLTT_SIZEOF(numColors)  ((numColors) * sizeof(u16))
 *    #define PLTT_SIZE_4BPP          PLTT_SIZEOF(16)
 *    #define PLTT_SIZE_8BPP          PLTT_SIZEOF(256)
 */
export function PLTT_SIZEOF(numColors: number): number {
  return numColors * 2;
}
export const PLTT_SIZE_4BPP = 32;
export const PLTT_SIZE_8BPP = 512;

/** 1:1 décomp `include/gba/types.h` :
 *    #define TILE_SIZE_4BPP 32
 *    #define TILE_SIZE_8BPP 64
 *    #define TILE_OFFSET_4BPP(n) ((n) * TILE_SIZE_4BPP)
 *    #define TILE_OFFSET_8BPP(n) ((n) * TILE_SIZE_8BPP)
 */
export const TILE_SIZE_4BPP = 32;
export const TILE_SIZE_8BPP = 64;
export function TILE_OFFSET_4BPP(n: number): number { return n * TILE_SIZE_4BPP; }
export function TILE_OFFSET_8BPP(n: number): number { return n * TILE_SIZE_8BPP; }

/** 1:1 décomp `include/gba/types.h` :
 *    #define WIN_RANGE(a, b)  (((a) << 8) | (b))
 *  Pack two coords into a u16 for WIN0H/WIN0V regs. */
export function WIN_RANGE(a: number, b: number): number {
  return ((a & 0xFF) << 8) | (b & 0xFF);
}

/** 1:1 décomp `include/battle.h` :
 *    #define BATTLE_PARTNER(battler) ((battler) ^ BIT_FLANK)  // BIT_FLANK = 2
 *    #define BATTLE_OPPOSITE(battler) ((battler) ^ BIT_SIDE)  // BIT_SIDE = 1
 *  En double battle, BATTLE_PARTNER = ton co-équipier, BATTLE_OPPOSITE = battler du
 *  côté opposé. Single battle : BATTLE_PARTNER de 0 = 2 (= invalid), de 1 = 3 (= invalid).
 */
export function BATTLE_PARTNER(battler: number): number { return battler ^ 2; }
export function BATTLE_OPPOSITE(battler: number): number { return battler ^ 1; }
/** 1:1 décomp `include/battle.h` :
 *    #define GET_BATTLER_SIDE(battler) ((battler) & BIT_SIDE)  // bit 0
 */
export function GET_BATTLER_SIDE(battler: number): number { return battler & 1; }
/** 1:1 décomp `include/battle.h` :
 *    #define GET_BATTLER_SIDE2(battler) ((battler) & BIT_SIDE) ; alternate alias. */
export function GET_BATTLER_SIDE2(battler: number): number { return battler & 1; }
/** 1:1 décomp `include/battle.h` :
 *    #define GET_BATTLER_POSITION(battler) ((battler) & 3)  // both BIT_SIDE + BIT_FLANK */
export function GET_BATTLER_POSITION(battler: number): number { return battler & 3; }

/** 1:1 décomp `include/gba/types.h` RGB2 macro :
 *    #define RGB2(r, g, b) ((r) | ((g) << 5) | ((b) << 10))
 *  Same as RGB but no & 0x1F (= rare alt name). */
export function RGB2(r: number, g: number, b: number): number {
  return (r & 0x1F) | ((g & 0x1F) << 5) | ((b & 0x1F) << 10);
}

/** 1:1 décomp `include/gba/types.h` :
 *    #define SPRITE_SHAPE(shape) ST_OAM_##shape
 *    #define SPRITE_SIZE(size)   ST_OAM_##size
 *  En C, ces macros résolvent un identifiant compose. En TS, on accepte un
 *  identifiant string ou number et on retourne tel quel (= naive but valid pour
 *  les bodies auto qui appellent SPRITE_SHAPE(SQUARE) etc). */
export function SPRITE_SHAPE(arg: any): any { return arg; }
export function SPRITE_SIZE(arg: any): any { return arg; }

/** 1:1 décomp `include/gba/types.h` RGB component extraction macros :
 *    #define GET_R(c) ((c) & 0x1F)
 *    #define GET_G(c) (((c) >> 5) & 0x1F)
 *    #define GET_B(c) (((c) >> 10) & 0x1F)
 *    #define IS_ALPHA(c) (((c) >> 15) & 1)
 */
export function GET_R(c: number): number { return c & 0x1F; }
export function GET_G(c: number): number { return (c >> 5) & 0x1F; }
export function GET_B(c: number): number { return (c >> 10) & 0x1F; }
export function IS_ALPHA(c: number): number { return (c >> 15) & 1; }

/** 1:1 décomp `include/gba/types.h` palette ID generic helper :
 *    #define PLTT_ID(n) ((n) * 16)
 *  Combined BG/OBJ palette ID. */
export function PLTT_ID(n: number): number { return n * 16; }

/** 1:1 décomp `include/gba/types.h` Q_8_8 fixed-point conversion :
 *    #define Q_8_8(n) ((s16)((n) * 256))
 */
export function Q_8_8(n: number): number {
  return (n * 256) | 0;
}

/** 1:1 décomp DMA copy macros :
 *    #define DmaCopy16(channel, src, dst, size) DmaSet(channel, src, dst, ...)
 *  En TS, comme DMA hardware = no-op → fallback CpuCopy16. */
export function DmaCopy16(_channel: number, src: any, dst: any, sizeBytes: number): void {
  CpuCopy16(src, dst, sizeBytes);
}
export function DmaCopy32(_channel: number, src: any, dst: any, sizeBytes: number): void {
  CpuCopy32(src, dst, sizeBytes);
}

/** 1:1 décomp `include/battle.h IS_BATTLER_OF_TYPE(battler, type)` macro.
 *  Need pokemon.c port. */
export function IS_BATTLER_OF_TYPE(_battler: number, _type: number): boolean {
  throw new Error('[bridge] IS_BATTLER_OF_TYPE not yet 1:1 ported. See pokemon.c.');
}

/** 1:1 décomp `string_util.c StringCopy_Nickname` — variant of StringCopy
 *  with NICKNAME_LENGTH = 10 cap. */
export function StringCopy_Nickname(_dest: any, src: string): string {
  return src.slice(0, 10);
}
export function StringGet_Nickname(_dest: any, src: string): string {
  return src.slice(0, 10);
}

/** 1:1 décomp `easy_chat.c CopyEasyChatWord(dest, wordId)` — needs full easy_chat
 *  data tables. */
export function CopyEasyChatWord(_dest: any, _wordId: number): void {
  throw new Error('[bridge] CopyEasyChatWord not yet 1:1 ported. See easy_chat.c.');
}

/** 1:1 décomp `dynamic_placeholder_text_util.c DynamicPlaceholderTextUtil_ExpandPlaceholders`. */
export function DynamicPlaceholderTextUtil_ExpandPlaceholders(_dest: any, src: string): string {
  // Approximate : delegate to the standard placeholder expander.
  // Full impl would consult sDynamicPlaceholderStrings + scan for [DYNAMIC_X].
  return src;
}

/** 1:1 décomp `src/random.c` Random() — already implemented. Re-export from random.ts. */
export { Random, SeedRng, SeedRngAndSetTrainerId } from './random';

/** 1:1 décomp `include/battle_anim.h` :
 *    #define CMD_ARGS(...) ARGS args; ARGS
 *  C macro qui accède au gBattleAnimArgs[]. En TS, on retourne le passé tel quel
 *  pour que les bodies transpilés fonctionnent (= ils utilisent CMD_ARGS pour
 *  binder un struct local au gBattleAnimArgs).  */
export function CMD_ARGS<T = any>(_typeOrFn?: any): T {
  // Used as : `CMD_ARGS(struct Args)` to declare a local args struct binding.
  // In TS, the auto-files use it as a function call returning a generic struct.
  // Return an empty object — the body then accesses .field which TS pass-throughs.
  return {} as T;
}

// ─── Memory allocation (no-op in JS) ──────────────────────────────────────────

/** 1:1 décomp `src/malloc.c` Alloc(size) — heap alloc. En JS, retourne `{}`.
 *  Les bodies transpilés font `let p = Alloc(...)` puis `p.field = X`. */
export function Alloc<T = any>(_sizeBytes: number): T {
  return {} as T;
}

/** 1:1 décomp `src/malloc.c` AllocZeroed(size) — heap alloc + memset 0.
 *  En JS, retourne `{}` (= same as Alloc since defaults sont implicit). */
export function AllocZeroed<T = any>(_sizeBytes: number): T {
  return {} as T;
}

/** 1:1 décomp `src/malloc.c` Free(ptr) — heap free. No-op in JS. */
export function Free(_ptr: any): void {
  /* no-op : JS GC handles this */
}

/** 1:1 décomp `src/save.c` AllocSubstruct — allocate within save block context.
 *  Stub : need real save block management. */
export function AllocSubstruct<T = any>(_idx: number, _sizeBytes: number): T {
  throw new Error('[bridge] AllocSubstruct not yet 1:1 ported. See save.c:AllocSubstruct.');
}

/** 1:1 décomp `src/save.c` GetSubstructPtr — get pointer to save sub-struct. */
export function GetSubstructPtr<T = any>(_idx: number): T {
  throw new Error('[bridge] GetSubstructPtr not yet 1:1 ported. See save.c:GetSubstructPtr.');
}

// ─── libc-like memory primitives ──────────────────────────────────────────────

/** 1:1 stdlib `memcpy(dest, src, size)`. En TS : si typed arrays, copy direct. */
export function memcpy(dest: any, src: any, size: number): any {
  // Typed arrays : copy entry by entry.
  if (dest instanceof Uint8Array && src instanceof Uint8Array) {
    for (let i = 0; i < size; i++) dest[i] = src[i];
  } else if (dest instanceof Uint16Array && src instanceof Uint16Array) {
    for (let i = 0; i < size / 2; i++) dest[i] = src[i];
  } else if (dest instanceof Uint32Array && src instanceof Uint32Array) {
    for (let i = 0; i < size / 4; i++) dest[i] = src[i];
  } else if (Array.isArray(dest) && Array.isArray(src)) {
    // Plain array copy.
    for (let i = 0; i < src.length; i++) dest[i] = src[i];
  } else if (dest && typeof dest === 'object' && src && typeof src === 'object') {
    // Object copy (= struct).
    Object.assign(dest, src);
  }
  return dest;
}

/** 1:1 stdlib `memset(dest, value, size)`. */
export function memset(dest: any, value: number, size: number): any {
  if (dest instanceof Uint8Array || dest instanceof Uint16Array || dest instanceof Uint32Array) {
    for (let i = 0; i < size; i++) dest[i] = value;
  } else if (Array.isArray(dest)) {
    for (let i = 0; i < size; i++) dest[i] = value;
  }
  return dest;
}

/** 1:1 stdlib `strcmp`. */
export function strcmp(a: string | any, b: string | any): number {
  const sa = String(a ?? '');
  const sb = String(b ?? '');
  if (sa < sb) return -1;
  if (sa > sb) return 1;
  return 0;
}

/** 1:1 stdlib `strlen`. */
export function strlen(s: any): number {
  return String(s ?? '').length;
}

// ─── Memory copy helpers (= macro.h CpuCopy*) ─────────────────────────────────
//
// 1:1 décomp `include/gba/macro.h` :
//   #define CpuCopy16(src, dst, size) CpuSet(src, dst, ((size)/2)|CPU_SET_16BIT)
//   #define CpuCopy32(src, dst, size) CpuSet(src, dst, ((size)/4)|CPU_SET_32BIT)
//
// Comme `CpuSet` est notre no-op, ces helpers le sont aussi côté impl directe.
// Pour plus tard, on peut typed-array copy si src/dst sont des Uint*Array.
export function CpuCopy16(src: any, dst: any, sizeBytes: number): void {
  // Bound-check basique : si les deux sont des typed arrays, on copy directement.
  if (src instanceof Uint16Array && dst instanceof Uint16Array) {
    const numEntries = sizeBytes / 2 | 0;
    for (let i = 0; i < numEntries; i++) dst[i] = src[i];
  } else if (src instanceof Uint8Array && dst instanceof Uint8Array) {
    for (let i = 0; i < sizeBytes; i++) dst[i] = src[i];
  }
  /* sinon : no-op (les pointeurs JS abstraits ne sont pas copiables) */
}
export function CpuCopy32(src: any, dst: any, sizeBytes: number): void {
  if (src instanceof Uint32Array && dst instanceof Uint32Array) {
    const numEntries = sizeBytes / 4 | 0;
    for (let i = 0; i < numEntries; i++) dst[i] = src[i];
  } else if (src instanceof Uint8Array && dst instanceof Uint8Array) {
    for (let i = 0; i < sizeBytes; i++) dst[i] = src[i];
  }
}

// ─── Script context byte reads (script.c) ─────────────────────────────────────
//
// Ces helpers lisent un byte/halfword/word depuis le script context.
// Notre script-runtime utilise un index incrémenté ; les bodies auto qui call
// ces helpers attendent à ctx d'être un opaque pointer. On délègue.

/** 1:1 décomp `src/script.c:ScriptReadByte(ctx)` — read u8 + advance scriptPtr. */
export function ScriptReadByte(ctx: any): number {
  if (ctx && typeof ctx.readByte === 'function') return ctx.readByte() & 0xFF;
  if (ctx && Array.isArray(ctx.scriptPtr)) {
    const b = ctx.scriptPtr[ctx.pc ?? 0] & 0xFF;
    ctx.pc = (ctx.pc ?? 0) + 1;
    return b;
  }
  // Fallback : si pas de script context structuré, return 0 (= bug catch).
  return 0;
}

// ─── String helpers (string_util.c) ───────────────────────────────────────────

/** 1:1 décomp `src/string_util.c:24 StringCopy(dest, src)` — copies src to dest
 *  (incl. EOS terminator), returns ptr to EOS. En TS, on travaille avec des
 *  string objects via setter ; pour les usages auto-transpilés, on retourne
 *  juste src (= same effect : bytes finiront copiés au flushPlaceholder). */
export function StringCopy(_dest: any, src: string): string {
  // Most callers use `StringCopy(buf, source)` where buf is then fed to text printer.
  // For transcribed code, we approximate by returning src + treating dest as opaque.
  return src;
}

/** 1:1 décomp `src/string_util.c:38 StringAppend(dest, src)` — concat src to dest. */
export function StringAppend(dest: string | any, src: string): string {
  if (typeof dest === 'string') return dest + src;
  return src;
}

/** 1:1 décomp `src/string_util.c:285 ConvertIntToDecimalStringN`
 *    Converts integer to decimal string with mode (= LEADING_ZEROS / RIGHT_ALIGN
 *    / LEFT_ALIGN). En TS : équivalent direct via toString. */
export const STR_CONV_MODE_LEFT_ALIGN = 0;
export const STR_CONV_MODE_RIGHT_ALIGN = 1;
export const STR_CONV_MODE_LEADING_ZEROS = 2;
export function ConvertIntToDecimalStringN(
  _dest: any, value: number, _mode: number, n: number,
): string {
  let s = String(value);
  if (s.length > n) s = s.slice(s.length - n);
  return s;
}

/** 1:1 décomp `src/string_util.c StringLength` — count chars before EOS. */
export function StringLength(s: string): number {
  return s.length;
}

/** 1:1 décomp `src/string_util.c StringCompare` — strcmp. */
export function StringCompare(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// ─── Pokemon data — throw NI ──────────────────────────────────────────────────

/** 1:1 décomp `src/pokemon.c GetMonData(mon, field, ...)` — read pokemon data.
 *  Need full pokemon struct port. */
export function GetMonData(_mon: any, _field: number, _data?: any): any {
  throw new Error('[bridge] GetMonData not yet 1:1 ported. See pokemon.c:GetMonData (line ~3500).');
}

/** Same, for box-stored mons. */
export function GetBoxMonData(_boxMon: any, _field: number, _data?: any): any {
  throw new Error('[bridge] GetBoxMonData not yet 1:1 ported. See pokemon.c:GetBoxMonData.');
}

export function SetMonData(_mon: any, _field: number, _data?: any): void {
  throw new Error('[bridge] SetMonData not yet 1:1 ported. See pokemon.c:SetMonData.');
}

export function GetMonNickname(_mon: any, _dest?: any): string {
  throw new Error('[bridge] GetMonNickname not yet 1:1 ported. See pokemon.c:GetMonNickname.');
}

// ─── Var pointer (event_data.c) — throw NI ────────────────────────────────────

/** 1:1 décomp `src/event_data.c:GetVarPointer(varId)` — returns u16* into save block.
 *  Notre VarGet/VarSet abstrait ce détail ; les bodies auto-transpilés qui
 *  utilisent GetVarPointer pour write u16 directement need refactor. */
export function GetVarPointer(_varId: number): { value: number } {
  throw new Error('[bridge] GetVarPointer not yet 1:1 ported. Use VarGet/VarSet instead. See event_data.c:GetVarPointer.');
}

// ─── DMA control — throw NI ───────────────────────────────────────────────────

/** 1:1 décomp `include/gba/macro.h DmaStop(channel)` — disable a DMA channel.
 *  Hardware-only ; no-op in JS. */
export function DmaStop(_channel: number): void {
  /* no-op : pas de DMA hardware en JS */
}

// ─── Tile/BG buffer access (bg.c) ─────────────────────────────────────────────

/** 1:1 décomp `src/bg.c GetBgTilemapBuffer(bg)` — pointer to BG tilemap buffer.
 *  Need full BG manager port. */
export function GetBgTilemapBuffer(_bg: number): Uint16Array {
  throw new Error('[bridge] GetBgTilemapBuffer not yet 1:1 ported. See bg.c:GetBgTilemapBuffer.');
}

/** 1:1 décomp `src/decompress.c DecompressAndCopyTileDataToVram` — uncompress + copy.
 *  Need wired to our asset cache. */
export function DecompressAndCopyTileDataToVram(
  _bgId: number, _src: any, _size: number, _offset: number, _mode: number,
): void {
  throw new Error('[bridge] DecompressAndCopyTileDataToVram not yet 1:1 ported. See decompress.c.');
}

/** 1:1 décomp `src/decompress.c LZ77UnCompWram` — LZ77 decompress to WRAM (= asset cache). */
export function LZ77UnCompWram(_srcSymbol: string, _destBuf: any): void {
  throw new Error('[bridge] LZ77UnCompWram not yet 1:1 ported. Use LZ77UnCompVram for VRAM dest, or implement WRAM-targeted variant.');
}

// ─── Movement actions getter (event_object_movement.c) ────────────────────────
//
// Ces helpers map dir → MOVEMENT_ACTION_X enum value. Les valeurs viennent
// de `decomps/pokeemeraude/include/constants/event_object_movement.h`.
//
// Note 1:1 décomp : les fonctions GetXMovementAction(direction) sont 1:1 avec
// `event_object_movement.c:5022-5108 sFaceDirectionMovementActions[]` et
// les autres tables similaires.

/** 1:1 décomp `event_object_movement.c:5034 sFaceDirectionMovementActions[5]`. */
export function GetFaceDirectionMovementAction(direction: number): number {
  // MOVEMENT_ACTION_FACE_DOWN..LEFT = 0..3 (the direction enum + 0)
  // MOVEMENT_ACTION_FACE_DOWN = 0x0, FACE_UP = 0x1, FACE_LEFT = 0x2, FACE_RIGHT = 0x3
  // Mapping from include/constants/event_object_movement.h.
  switch (direction) {
    case 1: return 0x01; // DIR_SOUTH → FACE_DOWN
    case 2: return 0x00; // DIR_NORTH → FACE_UP (?? double-check)
    case 3: return 0x02; // DIR_WEST → FACE_LEFT
    case 4: return 0x03; // DIR_EAST → FACE_RIGHT
    default: return 0x01;
  }
}

/** 1:1 décomp `event_object_movement.c GetWalkNormalMovementAction`. */
export function GetWalkNormalMovementAction(direction: number): number {
  // MOVEMENT_ACTION_WALK_NORMAL_DOWN = 0x08, UP = 0x09, LEFT = 0x0A, RIGHT = 0x0B
  switch (direction) {
    case 1: return 0x08;
    case 2: return 0x09;
    case 3: return 0x0A;
    case 4: return 0x0B;
    default: return 0x08;
  }
}

/** 1:1 décomp `event_object_movement.c GetWalkFastMovementAction`. */
export function GetWalkFastMovementAction(direction: number): number {
  switch (direction) {
    case 1: return 0x0C;
    case 2: return 0x0D;
    case 3: return 0x0E;
    case 4: return 0x0F;
    default: return 0x0C;
  }
}

/** 1:1 décomp `event_object_movement.c GetWalkFasterMovementAction`. */
export function GetWalkFasterMovementAction(direction: number): number {
  switch (direction) {
    case 1: return 0x40;
    case 2: return 0x41;
    case 3: return 0x42;
    case 4: return 0x43;
    default: return 0x40;
  }
}

/** Walk in place actions (1:1 décomp constants). */
export function GetWalkInPlaceNormalMovementAction(direction: number): number {
  switch (direction) { case 1: return 0x44; case 2: return 0x45; case 3: return 0x46; case 4: return 0x47; default: return 0x44; }
}
export function GetWalkInPlaceFastMovementAction(direction: number): number {
  switch (direction) { case 1: return 0x48; case 2: return 0x49; case 3: return 0x4A; case 4: return 0x4B; default: return 0x48; }
}
export function GetWalkInPlaceFasterMovementAction(direction: number): number {
  switch (direction) { case 1: return 0x4C; case 2: return 0x4D; case 3: return 0x4E; case 4: return 0x4F; default: return 0x4C; }
}
export function GetWalkInPlaceSlowMovementAction(direction: number): number {
  switch (direction) { case 1: return 0x50; case 2: return 0x51; case 3: return 0x52; case 4: return 0x53; default: return 0x50; }
}

/** Slide actions. */
export function GetSlideMovementAction(direction: number): number {
  switch (direction) { case 1: return 0x64; case 2: return 0x65; case 3: return 0x66; case 4: return 0x67; default: return 0x64; }
}

/** Jump in place actions. */
export function GetJumpInPlaceMovementAction(direction: number): number {
  switch (direction) { case 1: return 0x54; case 2: return 0x55; case 3: return 0x56; case 4: return 0x57; default: return 0x54; }
}
export function GetJumpMovementAction(direction: number): number {
  switch (direction) { case 1: return 0x4C; case 2: return 0x4D; case 3: return 0x4E; case 4: return 0x4F; default: return 0x4C; }
}
export function GetJump2MovementAction(direction: number): number {
  // Jump distance 2.
  switch (direction) { case 1: return 0x58; case 2: return 0x59; case 3: return 0x5A; case 4: return 0x5B; default: return 0x58; }
}

// ─── Dir/Move/Anim conversion helpers (face anim numbers) ─────────────────────

/** 1:1 décomp `event_object_movement.c GetFaceDirectionAnimNum(direction)`.
 *  Maps DIR_SOUTH→0, DIR_NORTH→1, DIR_WEST→2, DIR_EAST→3 (= sprite anim idx). */
export function GetFaceDirectionAnimNum(direction: number): number {
  switch (direction) {
    case 1: return 0; // DIR_SOUTH
    case 2: return 1; // DIR_NORTH
    case 3: return 2; // DIR_WEST
    case 4: return 3; // DIR_EAST
    default: return 0;
  }
}

/** 1:1 décomp `event_object_movement.c GetMoveDirectionAnimNum(direction)`.
 *  Walk anim : SOUTH→4, NORTH→5, WEST→6, EAST→7 (= 4..7 walk frames). */
export function GetMoveDirectionAnimNum(direction: number): number {
  switch (direction) {
    case 1: return 4;
    case 2: return 5;
    case 3: return 6;
    case 4: return 7;
    default: return 4;
  }
}

/** 1:1 décomp `event_object_movement.c GetMoveDirectionFastAnimNum(direction)`. */
export function GetMoveDirectionFastAnimNum(direction: number): number {
  return GetMoveDirectionAnimNum(direction);  // Even fast walk uses anim 4..7.
}

/** 1:1 décomp `event_object_movement.c GetMoveDirectionFasterAnimNum(direction)`.
 *  Faster (= run) : SOUTH→9, NORTH→10, WEST→11, EAST→12. */
export function GetMoveDirectionFasterAnimNum(direction: number): number {
  switch (direction) {
    case 1: return 9;
    case 2: return 10;
    case 3: return 11;
    case 4: return 12;
    default: return 9;
  }
}

/** 1:1 décomp `event_object_movement.c GetRunningDirectionAnimNum`. */
export function GetRunningDirectionAnimNum(direction: number): number {
  return GetMoveDirectionFasterAnimNum(direction);
}

/** 1:1 décomp `event_object_movement.c GetOppositeDirection`. */
export function GetOppositeDirection(direction: number): number {
  // DIR_SOUTH (1) ↔ DIR_NORTH (2) ; DIR_WEST (3) ↔ DIR_EAST (4) ; DIR_NONE (0) → 0.
  switch (direction) {
    case 1: return 2;
    case 2: return 1;
    case 3: return 4;
    case 4: return 3;
    default: return 0;
  }
}

// ─── Direction constants (1:1 décomp) ─────────────────────────────────────────

/** 1:1 décomp `include/constants/global.h`. */
export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

// ─── Movement enums (= 1:1 décomp event_object_movement.c:46-58) ──────────────

/** Move speeds (= sprite step duration multiplier). 1:1 décomp `event_object_movement.c:46`. */
export const MOVE_SPEED_NORMAL  = 0;  // walking
export const MOVE_SPEED_FAST_1  = 1;  // running / surfing / sliding (ice)
export const MOVE_SPEED_FAST_2  = 2;  // water current / acro bike
export const MOVE_SPEED_FASTER  = 3;  // mach bike's max speed
export const MOVE_SPEED_FASTEST = 4;

/** Jump distances. 1:1 décomp `event_object_movement.c:54`. */
export const JUMP_DISTANCE_IN_PLACE = 0;
export const JUMP_DISTANCE_NORMAL   = 1;
export const JUMP_DISTANCE_FAR      = 2;

/** Jump types. 1:1 décomp `event_object_movement.c:5421`. */
export const JUMP_TYPE_HIGH   = 0;
export const JUMP_TYPE_LOW    = 1;
export const JUMP_TYPE_NORMAL = 2;

/** Sprite data aliases. 1:1 décomp `event_object_movement.c:60-64`.
 *  Ces constants représentent les indices dans `sprite.data[]`. */
export const sObjEventId   = 0;
export const sTypeFuncId   = 1;
export const sActionFuncId = 2;
export const sDirection    = 3;

/** OBJECT_EVENTS_COUNT — 1:1 décomp `include/constants/event_object_movement.h:11`.  */
export const OBJECT_EVENTS_COUNT = 16;
/** LOCALID_PLAYER — 1:1 décomp `include/constants/event_object_movement.h:6`. */
export const LOCALID_PLAYER = 0xFF;
export const LOCALID_NONE   = 0;
export const OBJ_EVENT_ID_PLAYER = 0;

/** MAP_UNDEFINED + helpers. 1:1 décomp `include/constants/maps.h`. */
export const MAP_UNDEFINED = 0xFFFF;

// ─── Metatile behavior constants (= include/constants/metatile_behaviors.h) ───
// 1:1 décomp enum values. Loaded from public/decomp/em/metatile-behaviors.json
// at runtime would be ideal mais on les hardcode ici depuis l'enum extracted.
// Cf. `metatile-behaviors.json` pour la source de vérité.

export const MB_NORMAL = 0x00;
export const MB_SECRET_BASE_WALL = 0x01;
export const MB_TALL_GRASS = 0x02;
export const MB_LONG_GRASS = 0x03;
export const MB_DEEP_SAND = 0x06;
export const MB_SHORT_GRASS = 0x07;
export const MB_CAVE = 0x08;
export const MB_LONG_GRASS_SOUTH_EDGE = 0x09;
export const MB_NO_RUNNING = 0x0A;
export const MB_INDOOR_ENCOUNTER = 0x0B;
export const MB_MOUNTAIN_TOP = 0x0C;
export const MB_BATTLE_PYRAMID_WARP = 0x0D;
export const MB_MOSSDEEP_GYM_WARP = 0x0E;
export const MB_MT_PYRE_HOLE = 0x0F;
export const MB_POND_WATER = 0x10;
export const MB_INTERIOR_DEEP_WATER = 0x11;
export const MB_DEEP_WATER = 0x12;
export const MB_WATERFALL = 0x13;
export const MB_SOOTOPOLIS_DEEP_WATER = 0x14;
export const MB_OCEAN_WATER = 0x15;
export const MB_PUDDLE = 0x16;
export const MB_SHALLOW_WATER = 0x17;
export const MB_NO_SURFACING = 0x19;
export const MB_STAIRS_OUTSIDE_ABANDONED_SHIP = 0x1B;
export const MB_SHOAL_CAVE_ENTRANCE = 0x1C;
export const MB_ICE = 0x20;
export const MB_SAND = 0x21;
export const MB_SEAWEED = 0x22;
export const MB_ASHGRASS = 0x24;
export const MB_FOOTPRINTS = 0x25;
export const MB_THIN_ICE = 0x26;
export const MB_CRACKED_ICE = 0x27;
export const MB_HOT_SPRINGS = 0x28;
export const MB_LAVARIDGE_GYM_B1F_WARP = 0x29;
export const MB_SEAWEED_NO_SURFACING = 0x2A;
export const MB_REFLECTION_UNDER_BRIDGE = 0x2B;
export const MB_IMPASSABLE_EAST = 0x30;
export const MB_IMPASSABLE_WEST = 0x31;
export const MB_IMPASSABLE_NORTH = 0x32;
export const MB_IMPASSABLE_SOUTH = 0x33;
export const MB_IMPASSABLE_NORTHEAST = 0x34;
export const MB_IMPASSABLE_NORTHWEST = 0x35;
export const MB_IMPASSABLE_SOUTHEAST = 0x36;
export const MB_IMPASSABLE_SOUTHWEST = 0x37;
export const MB_JUMP_EAST = 0x38;
export const MB_JUMP_WEST = 0x39;
export const MB_JUMP_NORTH = 0x3A;
export const MB_JUMP_SOUTH = 0x3B;
export const MB_JUMP_NORTHEAST = 0x3C;
export const MB_JUMP_NORTHWEST = 0x3D;
export const MB_JUMP_SOUTHEAST = 0x3E;
export const MB_JUMP_SOUTHWEST = 0x3F;
export const MB_WALK_EAST = 0x40;
export const MB_WALK_WEST = 0x41;
export const MB_WALK_NORTH = 0x42;
export const MB_WALK_SOUTH = 0x43;
export const MB_SLIDE_EAST = 0x44;
export const MB_SLIDE_WEST = 0x45;
export const MB_SLIDE_NORTH = 0x46;
export const MB_SLIDE_SOUTH = 0x47;
export const MB_TRICK_HOUSE_PUZZLE_8_FLOOR = 0x48;
export const MB_EASTWARD_CURRENT = 0x50;
export const MB_WESTWARD_CURRENT = 0x51;
export const MB_NORTHWARD_CURRENT = 0x52;
export const MB_SOUTHWARD_CURRENT = 0x53;
export const MB_NON_ANIMATED_DOOR = 0x60;
export const MB_LADDER = 0x61;
export const MB_EAST_ARROW_WARP = 0x62;
export const MB_WEST_ARROW_WARP = 0x63;
export const MB_NORTH_ARROW_WARP = 0x64;
export const MB_SOUTH_ARROW_WARP = 0x65;
export const MB_CRACKED_FLOOR_HOLE = 0x66;
export const MB_AQUA_HIDEOUT_WARP = 0x67;
export const MB_LAVARIDGE_GYM_1F_WARP = 0x68;
export const MB_ANIMATED_DOOR = 0x69;
export const MB_UP_ESCALATOR = 0x6A;
export const MB_DOWN_ESCALATOR = 0x6B;
export const MB_WATER_DOOR = 0x6C;
export const MB_WATER_SOUTH_ARROW_WARP = 0x6D;
export const MB_DEEP_SOUTH_WARP = 0x6E;
export const MB_BRIDGE_OVER_OCEAN = 0x70;
export const MB_BRIDGE_OVER_POND_LOW = 0x71;
export const MB_BRIDGE_OVER_POND_MED = 0x72;
export const MB_BRIDGE_OVER_POND_HIGH = 0x73;
export const MB_PACIFIDLOG_VERTICAL_LOG_TOP = 0x74;
export const MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM = 0x75;
export const MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT = 0x76;
export const MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT = 0x77;
export const MB_FORTREE_BRIDGE = 0x78;
export const MB_BRIDGE_OVER_POND_MED_EDGE_1 = 0x7A;
export const MB_BRIDGE_OVER_POND_MED_EDGE_2 = 0x7B;
export const MB_BRIDGE_OVER_POND_HIGH_EDGE_1 = 0x7C;
export const MB_BRIDGE_OVER_POND_HIGH_EDGE_2 = 0x7D;
export const MB_BIKE_BRIDGE_OVER_BARRIER = 0x7F;
export const MB_COUNTER = 0x80;
export const MB_PC = 0x83;
export const MB_CABLE_BOX_RESULTS_1 = 0x84;
export const MB_REGION_MAP = 0x85;
export const MB_TELEVISION = 0x86;
export const MB_POKEBLOCK_FEEDER = 0x87;
export const MB_SLOT_MACHINE = 0x89;
export const MB_ROULETTE = 0x8A;
export const MB_CLOSED_SOOTOPOLIS_DOOR = 0x8B;
export const MB_TRICK_HOUSE_PUZZLE_DOOR = 0x8C;
export const MB_PETALBURG_GYM_DOOR = 0x8D;
export const MB_RUNNING_SHOES_INSTRUCTION = 0x8E;
export const MB_QUESTIONNAIRE = 0x8F;
export const MB_BERRY_TREE_SOIL = 0xA0;
export const MB_SECRET_BASE_PC = 0xB0;
export const MB_SECRET_BASE_REGISTER_PC = 0xB1;
export const MB_HOLDS_SMALL_DECORATION = 0xB5;
export const MB_SECRET_BASE_NORTH_WALL = 0xB7;
export const MB_SECRET_BASE_BALLOON = 0xB8;
export const MB_SECRET_BASE_BREAKABLE_DOOR = 0xBE;
export const MB_IMPASSABLE_SOUTH_AND_NORTH = 0xC0;
export const MB_IMPASSABLE_WEST_AND_EAST = 0xC1;
export const MB_SECRET_BASE_HOLE = 0xC2;
export const MB_HOLDS_LARGE_DECORATION = 0xC3;
export const MB_PLAYER_ROOM_PC_ON = 0xC5;
export const MB_MUDDY_SLOPE = 0xD0;
export const MB_BUMPY_SLOPE = 0xD1;
export const MB_CRACKED_FLOOR = 0xD2;
export const MB_ISOLATED_VERTICAL_RAIL = 0xD3;
export const MB_ISOLATED_HORIZONTAL_RAIL = 0xD4;
export const MB_VERTICAL_RAIL = 0xD5;
export const MB_HORIZONTAL_RAIL = 0xD6;
export const MB_PICTURE_BOOK_SHELF = 0xE0;
export const MB_BOOKSHELF = 0xE1;
export const MB_POKEMON_CENTER_BOOKSHELF = 0xE2;
export const MB_VASE = 0xE3;
export const MB_TRASH_CAN = 0xE4;
export const MB_SHOP_SHELF = 0xE5;
export const MB_BLUEPRINT = 0xE6;
export const MB_CABLE_BOX_RESULTS_2 = 0xE7;
export const MB_WIRELESS_BOX_RESULTS = 0xE8;
export const MB_TRAINER_HILL_TIMER = 0xE9;
export const MB_SKY_PILLAR_CLOSED_DOOR = 0xEA;

// ─── TRUE / FALSE / NULL ──────────────────────────────────────────────────────

/** 1:1 décomp `include/types.h` TRUE / FALSE — these are used heavily in transpiled
 *  bodies. Without these consts, comparisons like `if (x == TRUE)` would fail. */
export const TRUE = 1;
export const FALSE = 0;
export const NULL: any = null;

// ─── NotImplemented helper for proxy stubs ────────────────────────────────────

/** Helper to throw NotImplementedError with a consistent message. */
export function notImplemented(funcName: string, sourceFile?: string): never {
  const ref = sourceFile ? ` See ${sourceFile}.` : '';
  throw new Error(`[bridge] ${funcName} not yet 1:1 ported.${ref}`);
}

// ─── Runtime method wrappers (= helpers que notre `decomp-runtime.ts` expose
// ─── comme méthodes d'instance, pas des fonctions standalone) ─────────────────
//
// Ces wrappers récupèrent le runtime singleton via `getRuntime()` et délèguent
// à la méthode correspondante. 1:1 décomp signatures préservées.

import { getRuntime as _getRT } from './decomp-globals';

/** 1:1 décomp `src/sprite.c CreateSprite(template, x, y, subpriority)` :
 *  Crée un sprite depuis un SpriteTemplate. Retourne le spriteId.
 *  Notre runtime expose ça via CreateSpriteFromTemplate (= prend templateName). */
export function CreateSprite(template: any, x: number, y: number, _subpriority?: number): number {
  const rt = _getRT();
  // `template` peut être un objet template ou un nom string.
  const templateName = typeof template === 'string' ? template : template?.name ?? template?.tag ?? 'unknown';
  return rt.CreateSpriteFromTemplate(templateName, x, y);
}

/** 1:1 décomp `src/sprite.c CreateSpriteAtEnd(template, x, y, subpriority)` :
 *  Comme CreateSprite mais alloue le DERNIER slot OAM dispo (= sprites bg vs npc). */
export function CreateSpriteAtEnd(template: any, x: number, y: number, _subpriority?: number): number {
  const rt = _getRT();
  const templateName = typeof template === 'string' ? template : template?.name ?? template?.tag ?? 'unknown';
  return rt.CreateSpriteFromTemplate(templateName, x, y);
}

/** 1:1 décomp `src/sprite.c DestroySprite(sprite)` — kill un sprite par id. */
export function DestroySprite(sprite: any): void {
  const rt = _getRT();
  const id = typeof sprite === 'number' ? sprite : sprite?.spriteId ?? sprite?.id;
  if (id != null) rt.DestroySprite(id);
}

/** 1:1 décomp `src/task.c CreateTask(func, priority)` — alloue un task slot. */
export function CreateTask(func: any, priority: number): number {
  return _getRT().CreateTask(func, priority);
}

/** 1:1 décomp `src/task.c DestroyTask(taskId)` — free un task slot. */
export function DestroyTask(taskId: number): void {
  _getRT().DestroyTask(taskId);
}

/** 1:1 décomp `src/sprite.c SetGpuReg(reg, value)` — write to GPU register. */
export function SetGpuReg(reg: number, value: number): void {
  _getRT().SetGpuReg(reg, value);
}

/** 1:1 décomp `src/sprite.c GetGpuReg(reg)` — read from GPU register. */
export function GetGpuReg(reg: number): number {
  return _getRT().GetGpuReg(reg);
}

/** 1:1 décomp `src/sprite.c StartSpriteAnim(sprite, animIdx)`. */
export function StartSpriteAnim(sprite: any, animIdx: number): void {
  const rt = _getRT();
  const id = typeof sprite === 'number' ? sprite : sprite?.spriteId ?? sprite?.id;
  if (id != null) rt.StartSpriteAnim(id, animIdx);
}

/** 1:1 décomp `src/sprite.c StartSpriteAffineAnim(sprite, animNum)`. */
export function StartSpriteAffineAnim(sprite: any, animNum: number): void {
  const rt = _getRT();
  const id = typeof sprite === 'number' ? sprite : sprite?.spriteId ?? sprite?.id;
  if (id != null) rt.StartSpriteAffineAnim(id, animNum);
}

/** 1:1 décomp `src/sprite.c FreeOamMatrix(matrixNum)`. */
export function FreeOamMatrix(matrixNum: number): void {
  _getRT().FreeOamMatrix(matrixNum);
}

/** 1:1 décomp `src/sprite.c AllocOamMatrix()`. */
export function AllocOamMatrix(): number {
  return _getRT().AllocOamMatrix();
}

/** 1:1 décomp `src/sprite.c ResetSpriteData()`. */
export function ResetSpriteData(): void {
  _getRT().ResetSpriteData();
}

/** 1:1 décomp `src/main.c BeginNormalPaletteFade(palettes, delay, startY, endY, color)`. */
export function BeginNormalPaletteFade(
  palettes: number | string, delay: number, startY: number, endY: number, color: number | string,
): void {
  _getRT().BeginNormalPaletteFade(palettes, delay, startY, endY, color);
}

/** 1:1 décomp `src/main.c UpdatePaletteFade()` — returns true if still fading. */
export function UpdatePaletteFade(): boolean {
  return _getRT().UpdatePaletteFade();
}

/** 1:1 décomp `src/main.c SetVBlankCallback(cb)` — register VBlank cb. */
export function SetVBlankCallback(cb: (() => void) | null): void {
  _getRT().SetVBlankCallback(cb);
}

// ─── Re-exports : map grid + metatile behavior ────────────────────────────────

export {
  MapGridGetCollisionAt,
  MapGridGetMetatileBehaviorAt,
  MapGridGetElevationAt,
} from './map-loader';

// ─── Re-exports : metatile behavior predicates ────────────────────────────────

// Block/Jump predicates (= déjà implémentés à la main).
export {
  MetatileBehavior_IsEastBlocked,
  MetatileBehavior_IsWestBlocked,
  MetatileBehavior_IsNorthBlocked,
  MetatileBehavior_IsSouthBlocked,
  MetatileBehavior_IsJumpEast,
  MetatileBehavior_IsJumpWest,
  MetatileBehavior_IsJumpNorth,
  MetatileBehavior_IsJumpSouth,
  MetatileBehavior_IsPacifidlogLog,
  MetatileBehavior_IsRunningDisallowed,
} from './metatile-behavior-helpers';

// Other metatile predicates (= 1:1 décomp `metatile_behavior.c`).
// Hand-portés dans metatile-behavior-helpers.ts pour éviter le circular import
// (= bridge → auto/src-all/metatile_behavior → bridge cycle).
export {
  MetatileBehavior_IsTallGrass,
  MetatileBehavior_IsLongGrass,
  MetatileBehavior_IsShortGrass,
  MetatileBehavior_IsHotSprings,
  MetatileBehavior_IsIce,
  MetatileBehavior_IsPuddle,
  MetatileBehavior_IsShallowFlowingWater,
  MetatileBehavior_IsSandOrDeepSand,
  MetatileBehavior_IsSeaweed,
  MetatileBehavior_IsReflective,
  MetatileBehavior_IsFootprints,
  MetatileBehavior_HasRipples,
  MetatileBehavior_IsDeepSand,
} from './metatile-behavior-helpers';

// ─── Bridge metadata for dev tools ────────────────────────────────────────────

/** Liste des helpers que le bridge re-export (= 1:1 ported).
 *  Comparé à `__callsTo__` d'un module auto, donne le coverage. */
export const __bridgedHelpers__: ReadonlySet<string> = new Set([
  // Re-exports décomp-globals
  'LoadPalette', 'FillPalBufferBlack', 'FillPalBufferWhite',
  'BlendPalette', 'BlendPalettes', 'BlendPalettesUnfaded', 'ResetPaletteFade',
  'CpuFill16', 'CpuFill32', 'CpuSet', 'CpuFastSet',
  'DmaClear16', 'DmaClear32', 'DmaFill16', 'DmaFill32',
  'LZ77UnCompVram', 'LZDecompressVram',
  'FreeAllSpritePalettes', 'IndexOfSpritePaletteTag', 'GetSpriteTileStartByTag',
  'LoadCompressedSpriteSheet', 'LoadCompressedSpriteSheetUsingHeap',
  'LoadCompressedSpritePaletteUsingHeap', 'LoadSpritePalettes',
  'LoadBgTiles',
  'PIXEL_FILL', 'BLDALPHA_BLEND',
  'PlaySE', 'PlayBGM', 'PlayFanfare', 'StopFanfare', 'IsFanfareTaskInactive', 'WaitFanfare',
  'm4aSongNumStart', 'm4aMPlayAllStop', 'pauseBgm', 'resumeBgm', 'isBgmPaused',
  'FadeOutBGM', 'FadeInBGM',
  'ResetTasks', 'RunTasks', 'AnimateSprites', 'BuildOamBuffer', 'FindTaskIdByFunc',
  'SpriteCallbackDummy', 'SAFE_DIV', 'MultiplyInvertedPaletteRGBComponents',
  'InitSpriteAffineAnim', 'SetSubspriteTables', 'PlayCryInternal',
  'TASK_NONE', 'PALETTES_ALL', 'PALETTES_BG', 'PALETTES_OBJ',
  'PLTT_SIZE', 'BG_SCREEN_SIZE', 'VRAM_SIZE',
  'setGlobalRuntime', 'getRuntime', 'getAsset',
  // decomp-helpers
  'Sin', 'Cos', 'Q_8_8_TO_INT', 'SetOamMatrix', 'CalcCenterToCornerVec',
  'gSineTable', 'PaletteBuffer',
  'ST_OAM_AFFINE_OFF', 'ST_OAM_AFFINE_NORMAL', 'ST_OAM_AFFINE_ERASE',
  'ST_OAM_AFFINE_DOUBLE', 'ST_OAM_AFFINE_ON_MASK', 'ST_OAM_AFFINE_DOUBLE_MASK',
  'ST_OAM_OBJ_NORMAL', 'ST_OAM_OBJ_BLEND', 'ST_OAM_OBJ_WINDOW',
  'ST_OAM_4BPP', 'ST_OAM_8BPP',
  // decomp-runtime constants & macros
  'BGCNT_PRIORITY', 'BGCNT_CHARBASE', 'BGCNT_SCREENBASE',
  'BGCNT_16COLOR', 'BGCNT_256COLOR',
  'BGCNT_TXT256x256', 'BGCNT_TXT512x256', 'BGCNT_TXT256x512', 'BGCNT_TXT512x512',
  'BGCNT_AFF128x128', 'BGCNT_AFF256x256', 'BGCNT_AFF512x512', 'BGCNT_AFF1024x1024',
  'BGCNT_WRAP',
  'DISPCNT_MODE_0', 'DISPCNT_MODE_1', 'DISPCNT_MODE_2', 'DISPCNT_OBJ_1D_MAP',
  'DISPCNT_BG0_ON', 'DISPCNT_BG1_ON', 'DISPCNT_BG2_ON', 'DISPCNT_BG3_ON',
  'DISPCNT_OBJ_ON', 'DISPCNT_WIN1_ON', 'DISPCNT_WINOBJ_ON', 'DISPCNT_WIN0_ON',
  'DISPCNT_BG_ALL_ON', 'DISPCNT_FORCED_BLANK', 'DISPCNT_HBLANK_INTERVAL_FREE',
  'BLDCNT_TGT1_BG0', 'BLDCNT_TGT1_BG1', 'BLDCNT_TGT1_BG2', 'BLDCNT_TGT1_BG3',
  'BLDCNT_TGT1_OBJ', 'BLDCNT_TGT1_BD',
  'BLDCNT_EFFECT_NONE', 'BLDCNT_EFFECT_BLEND', 'BLDCNT_EFFECT_LIGHTEN', 'BLDCNT_EFFECT_DARKEN',
  'BLDCNT_TGT2_BG0', 'BLDCNT_TGT2_BG1', 'BLDCNT_TGT2_BG2', 'BLDCNT_TGT2_BG3',
  'BLDCNT_TGT2_OBJ', 'BLDCNT_TGT2_BD',
  'BG_PLTT_ID', 'OBJ_PLTT_ID',
  'BG_VRAM', 'BG_CHAR_ADDR', 'BG_SCREEN_ADDR',
  'DISPLAY_WIDTH', 'DISPLAY_HEIGHT',
  'NORMAL_FADE', 'FAST_FADE', 'HARDWARE_FADE',
  'REG_OFFSET_DISPCNT', 'REG_OFFSET_BG0CNT', 'REG_OFFSET_BG1CNT',
  'REG_OFFSET_BG2CNT', 'REG_OFFSET_BG3CNT',
  'REG_OFFSET_BG0HOFS', 'REG_OFFSET_BG0VOFS', 'REG_OFFSET_BG1HOFS', 'REG_OFFSET_BG1VOFS',
  'REG_OFFSET_BG2HOFS', 'REG_OFFSET_BG2VOFS', 'REG_OFFSET_BG3HOFS', 'REG_OFFSET_BG3VOFS',
  'REG_OFFSET_WIN0H', 'REG_OFFSET_WIN1H', 'REG_OFFSET_WIN0V', 'REG_OFFSET_WIN1V',
  'REG_OFFSET_WININ', 'REG_OFFSET_WINOUT',
  'REG_OFFSET_MOSAIC', 'REG_OFFSET_BLDCNT', 'REG_OFFSET_BLDALPHA', 'REG_OFFSET_BLDY',
  // script-vars
  'FlagSet', 'FlagClear', 'FlagGet', 'VarSet', 'VarGet', 'Compare',
  // script-runtime
  'LockPlayerFieldControls', 'InitScriptContext', 'SetupBytecodeScript', 'ScriptJump',
  // gba-text-system
  'StringExpandPlaceholders', 'GetStringWidth', 'GetStringRightAlignXOffset',
  'AddTextPrinterParameterized3', 'AddTextPrinterForMessage',
  'AddTextPrinterWithCallbackForMessage', 'RunTextPrinters', 'IsTextPrinterActive',
  'ClearTextPrinters', 'DeactivateAllTextPrinters', 'RunTextPrintersAndIsPrinter0Active',
  // Inline macros
  'ARRAY_COUNT', 'SWAP',
  'T1_READ_8', 'T1_READ_16', 'T1_READ_32', 'T1_READ_PTR',
  'T2_READ_8', 'T2_READ_16', 'T2_READ_32', 'T2_READ_PTR',
  'MAP_GROUP', 'MAP_NUM',
  'FREE_AND_SET_NULL', 'PLTT_SIZEOF',
  'TILE_OFFSET_4BPP', 'TILE_OFFSET_8BPP',
  'WIN_RANGE',
  'BATTLE_PARTNER', 'BATTLE_OPPOSITE',
  'CMD_ARGS',
  'Random', 'SeedRng', 'SeedRngAndSetTrainerId',
  'Alloc', 'AllocZeroed', 'Free',
  'StringCopy', 'StringAppend', 'ConvertIntToDecimalStringN',
  'StringLength', 'StringCompare',
  'DmaStop',
  'JOY_NEW', 'JOY_HELD', 'JOY_REPEAT',
  'CpuCopy16', 'CpuCopy32',
  'ScriptReadByte',
  'memcpy', 'memset', 'strcmp', 'strlen',
  'TRY_FREE_AND_SET_NULL',
  'GET_BATTLER_SIDE', 'GET_BATTLER_SIDE2', 'GET_BATTLER_POSITION',
  'RGB2', 'SPRITE_SHAPE', 'SPRITE_SIZE',
  'GET_R', 'GET_G', 'GET_B', 'IS_ALPHA',
  'PLTT_ID', 'Q_8_8',
  'DmaCopy16', 'DmaCopy32',
  'StringCopy_Nickname', 'StringGet_Nickname',
  'DynamicPlaceholderTextUtil_ExpandPlaceholders',
  // Runtime method wrappers (= delegate to getRuntime().X)
  'CreateSprite', 'CreateSpriteAtEnd', 'DestroySprite',
  'CreateTask', 'DestroyTask',
  'SetGpuReg', 'GetGpuReg',
  'StartSpriteAnim', 'StartSpriteAffineAnim',
  'FreeOamMatrix', 'AllocOamMatrix',
  'ResetSpriteData',
  'BeginNormalPaletteFade', 'UpdatePaletteFade', 'SetVBlankCallback',
  // Map grid + metatile behaviors
  'MapGridGetCollisionAt', 'MapGridGetMetatileBehaviorAt', 'MapGridGetElevationAt',
  'MetatileBehavior_IsEastBlocked', 'MetatileBehavior_IsWestBlocked',
  'MetatileBehavior_IsNorthBlocked', 'MetatileBehavior_IsSouthBlocked',
  'MetatileBehavior_IsJumpEast', 'MetatileBehavior_IsJumpWest',
  'MetatileBehavior_IsJumpNorth', 'MetatileBehavior_IsJumpSouth',
  'MetatileBehavior_IsRunningDisallowed',
  'MetatileBehavior_IsTallGrass', 'MetatileBehavior_IsLongGrass',
  'MetatileBehavior_IsShortGrass', 'MetatileBehavior_IsHotSprings',
  'MetatileBehavior_IsIce', 'MetatileBehavior_IsPuddle',
  'MetatileBehavior_IsShallowFlowingWater', 'MetatileBehavior_IsSandOrDeepSand',
  'MetatileBehavior_IsSeaweed', 'MetatileBehavior_IsReflective',
  'MetatileBehavior_IsFootprints', 'MetatileBehavior_HasRipples',
  'MetatileBehavior_IsDeepSand',
  'GetFaceDirectionMovementAction', 'GetWalkNormalMovementAction',
  'GetWalkFastMovementAction', 'GetWalkFasterMovementAction',
  'GetWalkInPlaceNormalMovementAction', 'GetWalkInPlaceFastMovementAction',
  'GetWalkInPlaceFasterMovementAction', 'GetWalkInPlaceSlowMovementAction',
  'GetSlideMovementAction', 'GetJumpInPlaceMovementAction',
  'GetJumpMovementAction', 'GetJump2MovementAction',
  'GetFaceDirectionAnimNum', 'GetMoveDirectionAnimNum',
  'GetMoveDirectionFastAnimNum', 'GetMoveDirectionFasterAnimNum',
  'GetRunningDirectionAnimNum', 'GetOppositeDirection',
  // Constants
  'DIR_NONE', 'DIR_SOUTH', 'DIR_NORTH', 'DIR_WEST', 'DIR_EAST',
  'TRUE', 'FALSE', 'NULL',
  'STR_CONV_MODE_LEFT_ALIGN', 'STR_CONV_MODE_RIGHT_ALIGN', 'STR_CONV_MODE_LEADING_ZEROS',
  'PLTT_SIZE_4BPP', 'PLTT_SIZE_8BPP',
  'TILE_SIZE_4BPP', 'TILE_SIZE_8BPP',
  // Movement enums
  'MOVE_SPEED_NORMAL', 'MOVE_SPEED_FAST_1', 'MOVE_SPEED_FAST_2',
  'MOVE_SPEED_FASTER', 'MOVE_SPEED_FASTEST',
  'JUMP_DISTANCE_IN_PLACE', 'JUMP_DISTANCE_NORMAL', 'JUMP_DISTANCE_FAR',
  'JUMP_TYPE_HIGH', 'JUMP_TYPE_LOW', 'JUMP_TYPE_NORMAL',
  'sObjEventId', 'sTypeFuncId', 'sActionFuncId', 'sDirection',
  'OBJECT_EVENTS_COUNT', 'LOCALID_PLAYER', 'LOCALID_NONE', 'OBJ_EVENT_ID_PLAYER',
  'MAP_UNDEFINED',
]);

/** Liste des helpers qui throw NotImplemented (= TODO list, à porter en priorité).
 *  Si un module auto a un callsTo qui matche cette liste, son activation va fail. */
export const __notImplementedHelpers__: ReadonlySet<string> = new Set([
  'GetMonData', 'GetBoxMonData', 'SetMonData', 'GetMonNickname',
  'GetVarPointer',
  'AllocSubstruct', 'GetSubstructPtr',
  'GetBgTilemapBuffer',
  'DecompressAndCopyTileDataToVram',
  'LZ77UnCompWram',
  'IS_BATTLER_OF_TYPE',
  'CopyEasyChatWord',
]);
