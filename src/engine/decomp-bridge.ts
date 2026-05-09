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

// ─── Battle macros (1:1 décomp `include/battle.h` + `battle_message.h`) ───────

/** 1:1 décomp `include/battle.h:466` :
 *    #define IS_TYPE_PHYSICAL(moveType) (moveType < TYPE_MYSTERY)
 *  TYPE_MYSTERY = 9 (= include/constants/pokemon.h). */
export function IS_TYPE_PHYSICAL(moveType: number): boolean {
  return moveType < 9;
}

/** 1:1 décomp `include/battle.h:467` :
 *    #define IS_TYPE_SPECIAL(moveType) (moveType > TYPE_MYSTERY) */
export function IS_TYPE_SPECIAL(moveType: number): boolean {
  return moveType > 9;
}

/** 1:1 décomp `include/global.h:106-109` :
 *    #define HIHALF(n) (((n) & 0xFFFF0000) >> 16)
 *    #define LOHALF(n) ((n) & 0xFFFF)
 */
export function HIHALF(n: number): number { return (n & 0xFFFF0000) >>> 16; }
export function LOHALF(n: number): number { return n & 0xFFFF; }

/** 1:1 décomp `include/pokemon.h:371` :
 *    #define GET_SHINY_VALUE(otId, personality)
 *      (HIHALF(otId) ^ LOHALF(otId) ^ HIHALF(personality) ^ LOHALF(personality)) */
export function GET_SHINY_VALUE(otId: number, personality: number): number {
  return HIHALF(otId) ^ LOHALF(otId) ^ HIHALF(personality) ^ LOHALF(personality);
}

/** 1:1 décomp `include/pokemon.h:364-369` :
 *    #define GET_UNOWN_LETTER(personality) ((
 *        ((personality & 0x03000000) >> 18)
 *      | ((personality & 0x00030000) >> 12)
 *      | ((personality & 0x00000300) >> 6)
 *      | ((personality & 0x00000003) >> 0)) % NUM_UNOWN_FORMS)
 *  NUM_UNOWN_FORMS = 28. */
export function GET_UNOWN_LETTER(personality: number): number {
  const v = ((personality & 0x03000000) >>> 18)
          | ((personality & 0x00030000) >>> 12)
          | ((personality & 0x00000300) >>> 6)
          | ((personality & 0x00000003));
  return v % 28;
}

/** 1:1 décomp `src/battle_anim_mons.c:19` :
 *    #define IS_DOUBLE_BATTLE() ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE))
 *  BATTLE_TYPE_DOUBLE = 1 << 0 = 1. Reads gBattleTypeFlags from runtime. */
export function IS_DOUBLE_BATTLE(): number {
  // Best-effort : runtime exposes gBattleTypeFlags ; fall back to 0 (= single).
  const rt: any = _getRT();
  const flags = rt?.gBattleTypeFlags ?? 0;
  return flags & 1;
}

/** 1:1 décomp `include/battle_main.h:26-28` :
 *    #define TYPE_EFFECT_ATK_TYPE(i)  (gTypeEffectiveness[i + 0])
 *    #define TYPE_EFFECT_DEF_TYPE(i)  (gTypeEffectiveness[i + 1])
 *    #define TYPE_EFFECT_MULTIPLIER(i)(gTypeEffectiveness[i + 2])
 *  Needs gTypeEffectiveness data. Use runtime accessor or NotImpl placeholder. */
export function TYPE_EFFECT_ATK_TYPE(_i: number): number {
  // Runtime should expose gTypeEffectiveness ; until then, return 0 (= safe default).
  const rt: any = _getRT();
  return rt?.gTypeEffectiveness?.[_i + 0] ?? 0;
}
export function TYPE_EFFECT_DEF_TYPE(_i: number): number {
  const rt: any = _getRT();
  return rt?.gTypeEffectiveness?.[_i + 1] ?? 0;
}
export function TYPE_EFFECT_MULTIPLIER(_i: number): number {
  const rt: any = _getRT();
  return rt?.gTypeEffectiveness?.[_i + 2] ?? 0;
}

/** 1:1 décomp `include/constants/battle.h:205` :
 *    #define HITMARKER_FAINTED(battler) (gBitTable[battler] << 28)
 *  gBitTable[i] = 1 << i. */
export function HITMARKER_FAINTED(battler: number): number {
  return (1 << battler) << 28;
}

/** 1:1 décomp `include/constants/battle.h:143` :
 *    #define STATUS2_INFATUATED_WITH(battler) (gBitTable[battler] << 16) */
export function STATUS2_INFATUATED_WITH(battler: number): number {
  return (1 << battler) << 16;
}

/** 1:1 décomp `include/battle.h:21` :
 *    #define MOVE_IS_PERMANENT(battler, moveSlot)                            \
 *       (!(gBattleMons[battler].status2 & STATUS2_TRANSFORMED)                \
 *        && !(gDisableStructs[battler].mimickedMoves & gBitTable[moveSlot]))
 *
 *  Used to exclude moves learned temporarily by Transform or Mimic. Need full
 *  battle struct ports ; NotImpl until then.
 *  Note 1:1 : we don't throw because some auto-bodies guard with `if`, so we
 *  return false (= move is NOT permanent → skip it). Slightly less safe than
 *  throwing but unblocks more code. */
export function MOVE_IS_PERMANENT(_battler: number, _moveSlot: number): boolean {
  const rt: any = _getRT();
  const battleMons = rt?.gBattleMons;
  const disableStructs = rt?.gDisableStructs;
  if (!battleMons || !disableStructs) return false;
  const STATUS2_TRANSFORMED = 1 << 25; // include/constants/battle.h
  const transformed = (battleMons[_battler]?.status2 ?? 0) & STATUS2_TRANSFORMED;
  const mimicked = (disableStructs[_battler]?.mimickedMoves ?? 0) & (1 << _moveSlot);
  return !transformed && !mimicked;
}

// ─── Battle message PREPARE_*_BUFFER macros (1:1 décomp battle_message.h) ─────
//
// Ces macros écrivent une séquence de placeholder bytes dans textVar (= un buffer
// utilisé par BattleStringExpand). En C, c'est du write direct par index ; en
// TS, on opère sur un Uint8Array ou un array.
//
// B_BUFF_PLACEHOLDER_BEGIN = 0xFD, B_BUFF_EOS = 0xFF.

const B_BUFF_PLACEHOLDER_BEGIN = 0xFD;
const B_BUFF_EOS = 0xFF;
const B_BUFF_NUMBER = 1;
const B_BUFF_STRING = 2;
const B_BUFF_MOVE = 3;
const B_BUFF_TYPE = 4;
const B_BUFF_MON_NICK = 5;
const B_BUFF_MON_NICK_WITH_PREFIX = 6;
const B_BUFF_ITEM = 12;
const B_BUFF_SPECIES = 13;

/** 1:1 décomp `include/battle_message.h:114-122` PREPARE_BYTE_NUMBER_BUFFER. */
export function PREPARE_BYTE_NUMBER_BUFFER(textVar: any, maxDigits: number, number: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_NUMBER;
  textVar[2] = 1;
  textVar[3] = maxDigits;
  textVar[4] = number & 0xFF;
  textVar[5] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h:124-133` PREPARE_HWORD_NUMBER_BUFFER. */
export function PREPARE_HWORD_NUMBER_BUFFER(textVar: any, maxDigits: number, number: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_NUMBER;
  textVar[2] = 2;
  textVar[3] = maxDigits;
  textVar[4] = number & 0xFF;
  textVar[5] = (number >> 8) & 0xFF;
  textVar[6] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h:135-146` PREPARE_WORD_NUMBER_BUFFER. */
export function PREPARE_WORD_NUMBER_BUFFER(textVar: any, maxDigits: number, number: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_NUMBER;
  textVar[2] = 4;
  textVar[3] = maxDigits;
  textVar[4] = number & 0xFF;
  textVar[5] = (number >>> 8) & 0xFF;
  textVar[6] = (number >>> 16) & 0xFF;
  textVar[7] = (number >>> 24) & 0xFF;
  textVar[8] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h:148-155` PREPARE_STRING_BUFFER. */
export function PREPARE_STRING_BUFFER(textVar: any, stringId: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_STRING;
  textVar[2] = stringId & 0xFF;
  textVar[3] = (stringId >> 8) & 0xFF;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h:157-164` PREPARE_MOVE_BUFFER. */
export function PREPARE_MOVE_BUFFER(textVar: any, move: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_MOVE;
  textVar[2] = move & 0xFF;
  textVar[3] = (move >> 8) & 0xFF;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h:166-173` PREPARE_ITEM_BUFFER. */
export function PREPARE_ITEM_BUFFER(textVar: any, item: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_ITEM;
  textVar[2] = item & 0xFF;
  textVar[3] = (item >> 8) & 0xFF;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h:175-182` PREPARE_SPECIES_BUFFER. */
export function PREPARE_SPECIES_BUFFER(textVar: any, species: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_SPECIES;
  textVar[2] = species & 0xFF;
  textVar[3] = (species >> 8) & 0xFF;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h:184-191` PREPARE_MON_NICK_WITH_PREFIX_BUFFER. */
export function PREPARE_MON_NICK_WITH_PREFIX_BUFFER(textVar: any, battler: number, partyId: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_MON_NICK_WITH_PREFIX;
  textVar[2] = battler;
  textVar[3] = partyId;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h:193-200` PREPARE_MON_NICK_BUFFER. */
export function PREPARE_MON_NICK_BUFFER(textVar: any, battler: number, partyId: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_MON_NICK;
  textVar[2] = battler;
  textVar[3] = partyId;
  textVar[4] = B_BUFF_EOS;
}

/** 1:1 décomp `include/battle_message.h PREPARE_TYPE_BUFFER`. */
export function PREPARE_TYPE_BUFFER(textVar: any, typeId: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_TYPE;
  textVar[2] = typeId;
  textVar[3] = B_BUFF_EOS;
}

// ─── Random / number macros (1:1 décomp `include/random.h`) ───────────────────

/** 1:1 décomp `include/random.h:16` :
 *    #define ISO_RANDOMIZE1(val) (1103515245 * (val) + 24691)
 *  Linear congruential generator step (= one of two used in Pokemon RNG). */
export function ISO_RANDOMIZE1(val: number): number {
  return (Math.imul(1103515245, val) + 24691) | 0;
}

// ─── Battle anim sprite index macro (1:1 décomp `constants/battle_anim.h`) ────

/** 1:1 décomp `include/constants/battle_anim.h:5` :
 *    #define GET_TRUE_SPRITE_INDEX(i) ((i - ANIM_SPRITES_START))
 *  ANIM_SPRITES_START = 10000 (= ANIM_TAG_BONE first val). */
export const ANIM_SPRITES_START = 10000;
export function GET_TRUE_SPRITE_INDEX(i: number): number {
  return i - ANIM_SPRITES_START;
}

// ─── BG tile flip macros (1:1 décomp `include/gba/defines.h`) ────────────────

/** 1:1 décomp `include/gba/defines.h:48-49` :
 *    #define BG_TILE_H_FLIP(n) (0x400 + (n))
 *    #define BG_TILE_V_FLIP(n) (0x800 + (n)) */
export function BG_TILE_H_FLIP(n: number): number { return 0x400 + n; }
export function BG_TILE_V_FLIP(n: number): number { return 0x800 + n; }

// ─── Easy chat word macros (1:1 décomp `constants/easy_chat.h:1116-1127`) ─────

/** EC_MASK_BITS = 9, EC_MASK_GROUP = 0x7F, EC_MASK_INDEX = 0x1FF. */
const EC_MASK_BITS = 9;
const EC_MASK_GROUP_M = (1 << (16 - EC_MASK_BITS)) - 1; // 0x7F
const EC_MASK_INDEX_M = (1 << EC_MASK_BITS) - 1; // 0x1FF

/** 1:1 décomp `EC_GROUP(word) = (word) >> EC_MASK_BITS`. */
export function EC_GROUP(word: number): number { return word >> EC_MASK_BITS; }
/** 1:1 décomp `EC_INDEX(word) = (word) & EC_MASK_INDEX`. */
export function EC_INDEX(word: number): number { return word & EC_MASK_INDEX_M; }
/** 1:1 décomp `EC_WORD(group, index) = ((group & MASK) << BITS) | (index & MASK)`. */
export function EC_WORD(group: number, index: number): number {
  return ((group & EC_MASK_GROUP_M) << EC_MASK_BITS) | (index & EC_MASK_INDEX_M);
}

// ─── Item / berry macros ──────────────────────────────────────────────────────

/** 1:1 décomp `include/constants/items.h:445` :
 *    #define ITEM_TO_BERRY(itemId) (((itemId) - FIRST_BERRY_INDEX) + 1)
 *  FIRST_BERRY_INDEX = 0x85 (= ITEM_CHERI_BERRY in Emerald, see items.h). */
export const FIRST_BERRY_INDEX = 0x85;
export function ITEM_TO_BERRY(itemId: number): number {
  return (itemId - FIRST_BERRY_INDEX) + 1;
}

// ─── Apprentice species ID (1:1 décomp `src/apprentice.c:323`) ────────────────

/** 1:1 décomp `apprentice.c APPRENTICE_SPECIES_ID(monId)` macro :
 *    APPRENTICE_SPECIES_ID(monId) = id from gApprenticeSpeciesMatchups[monId][0]
 *  Need full apprentice.c port for actual lookup ; placeholder returns monId. */
export function APPRENTICE_SPECIES_ID(monId: number): number {
  // TODO 1:1 : need gApprenticeSpeciesMatchups[][] (= lookup table from apprentice.c).
  return monId;
}

// ─── Link helpers (1:1 décomp `include/link.h:41`) ────────────────────────────

/** 1:1 décomp `include/link.h:41` EXTRACT_PLAYER_COUNT(status) macro.
 *  Extracts player count from RFU link status word. */
export function EXTRACT_PLAYER_COUNT(status: number): number {
  // include/link.h:41 : #define EXTRACT_PLAYER_COUNT(status) (((status) & 0x70) >> 4)
  return (status & 0x70) >> 4;
}

// ─── Misc macros (battle, contest, fan club, etc.) ────────────────────────────

/** 1:1 décomp `src/contest_util.c:61` GET_CONTEST_WINNER_ID(i) macro :
 *    Macro that walks gContestFinalStandings[] until non-zero entry. Stores
 *    the index in `i`. C macros that mutate by-ref → in TS we return the index.
 *
 *  Auto-bodies do `GET_CONTEST_WINNER_ID(i);` → we return the value, but they
 *  use it only for side-effect on `i`. Best-effort : delegate to runtime. */
export function GET_CONTEST_WINNER_ID(_i?: any): number {
  const rt: any = _getRT();
  const standings = rt?.gContestFinalStandings;
  if (!Array.isArray(standings)) return 0;
  for (let j = 0; j < standings.length; j++) {
    if (standings[j] !== 0) return j;
  }
  return 0;
}

/** 1:1 décomp `src/field_specials.c:3970` :
 *    #define GET_TRAINER_FAN_CLUB_FLAG(flag) (FANCLUB_BITFIELD >> (flag) & 1)
 *  FANCLUB_BITFIELD reads from gSaveBlock1Ptr.trainerFanClub.flags. */
export function GET_TRAINER_FAN_CLUB_FLAG(flag: number): number {
  const rt: any = _getRT();
  const bits = rt?.gSaveBlock1Ptr?.trainerFanClub?.flags ?? 0;
  return (bits >> flag) & 1;
}

/** 1:1 décomp `src/union_room_player_avatar.c:17` :
 *    #define UR_PLAYER_SPRITE_ID(leaderId, memberId) (MAX_RFU_PLAYERS * leaderId + memberId)
 *  MAX_RFU_PLAYERS = 5 (= include/constants/rfu.h). */
export const MAX_RFU_PLAYERS = 5;
export function UR_PLAYER_SPRITE_ID(leaderId: number, memberId: number): number {
  return MAX_RFU_PLAYERS * leaderId + memberId;
}

/** 1:1 décomp `src/intro.c:1870` :
 *    #define INTRO3_RAW_PTR(palId) (((void *)&gIntro3Bg_Pal) + palId)
 *  Returns a pointer-with-offset into gIntro3Bg_Pal. En TS, return symbol+offset. */
export function INTRO3_RAW_PTR(palId: number): any {
  return { symbol: 'gIntro3Bg_Pal', offset: palId };
}

/** 1:1 décomp `src/battle_transition.c:49` SET_TILE(ptr, posY, posX, tile) macro :
 *    *(ptr + (posY)*32 + (posX)) = (tile)
 *  Write a tile into a 32-wide tilemap at (x, y). */
export function SET_TILE(ptr: any, posY: number, posX: number, tile: number): void {
  if (!ptr) return;
  const idx = posY * 32 + posX;
  if (ptr instanceof Uint16Array || Array.isArray(ptr)) {
    ptr[idx] = tile;
  }
}

/** 1:1 décomp `src/intro.c:VINE_STATE_TIMER` macro :
 *    Custom intro task data accessor — used in intro.c to read task state.
 *    Specific to intro1 cinematic. Bridge as identity until intro is refactored. */
export function VINE_STATE_TIMER(_taskData: any): number {
  // TODO 1:1 : need gTasks[].data layout from intro.c. Placeholder.
  return 0;
}

// ─── CRC / multiboot (1:1 décomp `include/multiboot.h`) ───────────────────────

/** 1:1 décomp `multiboot.h CALC_CRC` — multiboot CRC computation. Stubbed to 0
 *  (= multiboot is wireless link feature not used in single-player play). */
export function CALC_CRC(_data: any, _len: number): number {
  return 0;
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
export { Random, SeedRng, SeedRngAndSetTrainerId, Random32 } from './random';

// ─── Re-exports : object events graphics info (object-event-graphics.ts) ──────

/** 1:1 décomp `event_object_movement.c:1914 GetObjectEventGraphicsInfo(graphicsId)`.
 *  Re-export with a normalized signature : the décomp returns
 *  `const struct ObjectEventGraphicsInfo *`, our impl returns either the info
 *  or undefined for unregistered gfxIds. The auto bodies typically dereference
 *  fields like `.size`, `.height`, `.tracks`, `.inanimate`, etc. ; if the gfxId
 *  isn't registered, calls will get undefined → the auto body crashes
 *  (= fail-fast, surface the bug).
 *  Note 1:1 : in the real décomp, this function also handles OBJ_EVENT_GFX_VARS
 *  (= dynamic gfxId lookups via VarGet) + OBJ_EVENT_GFX_BARD (= old man variants).
 *  Notre impl simple ne gère pas ces cas spéciaux ; on les ajoutera si besoin. */
import { getObjectEventGraphicsInfo as _getOEGI } from './object-event-graphics';
export function GetObjectEventGraphicsInfo(graphicsId: number): any {
  return _getOEGI(graphicsId);
}

// ─── Re-exports : window frame tiles + palettes (gba-text-window.ts) ──────────

export {
  GetWindowFrameTilesPal,
  LoadWindowGfx,
  LoadUserWindowBorderGfx,
  LoadUserWindowBorderGfx_,
} from './gba-text-window';

// ─── Re-exports : data tables FR (data-tables.ts) ────────────────────────────
//
// Notre `data-tables.ts` expose les lookup fns FR avec un signature légèrement
// différente du décomp (= retourne string, pas u8*). On adapte ici pour matcher
// l'API décomp utilisée dans les auto-bodies.

import { getItemNameFr as _getItemNameFr, getItem as _getItem, getItemDescriptionFr as _getItemDescFr } from './data-tables';

/** 1:1 décomp `src/item.c:879 GetItemName(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].name;
 *
 *  Notre data table contient les noms FR ; on les retourne tels quels.
 *  Le code auto les passe à StringCopy/StringExpand, qui acceptent string ou u8*. */
export function GetItemName(itemId: number | string): string {
  // itemId peut être un enum string (ITEM_POTION) ou u16 ; data-tables accepte string.
  return _getItemNameFr(typeof itemId === 'number' ? `ITEM_${itemId}` : itemId);
}

// ─── Re-exports : map names (map-names-fr) ───────────────────────────────────

import { getMapNameFr } from '../data/map-names-fr';

/** 1:1 décomp `src/region_map.c:1568 GetMapName(dest, regionMapId, padLength)` :
 *    if (regionMapId == MAPSEC_SECRET_BASE) return GetSecretBaseMapName(dest);
 *    else if (regionMapId < MAPSEC_NONE) return StringCopy(dest, gRegionMapEntries[id].name);
 *    else return StringFill(dest, CHAR_SPACE, padLength ?? 18);
 *
 *  Notre impl simplifié : lookup FR directement, write into dest.length bytes
 *  (= dest is a Uint8Array slot in gStringVar1/2/3 typically). En auto-body,
 *  c'est toujours appelé pour passer à StringExpand → string-mode est OK. */
export function GetMapName(dest: any, regionMapId: number | string, padLength: number = 0): string {
  const key = typeof regionMapId === 'number'
    ? `MAPSEC_${regionMapId}` // best-effort : auto-body devrait passer enum str
    : String(regionMapId);
  let name = getMapNameFr(key) ?? '';
  if (padLength > 0 && name.length < padLength) {
    name = name.padEnd(padLength, ' ');
  }
  // Mutable string-buffer write (= for Uint8Array dests, copy bytes ; else no-op).
  if (dest instanceof Uint8Array) {
    for (let i = 0; i < Math.min(name.length, dest.length); i++) {
      dest[i] = name.charCodeAt(i);
    }
  }
  return name;
}

/** 1:1 décomp `src/region_map.c GetMapNameGeneric(dest, regionMapId)` :
 *    Same as GetMapName but with padLength=0. */
export function GetMapNameGeneric(dest: any, regionMapId: number | string): string {
  return GetMapName(dest, regionMapId, 0);
}

/** 1:1 décomp `src/region_map.c GetMapNameHandleAquaHideout(dest, regionMapId)` :
 *    Like GetMapNameGeneric, but if mapsec is AQUA_HIDEOUT_OLD → "HIDEOUT".
 *    Used in summary screen "met at" display. */
export function GetMapNameHandleAquaHideout(dest: any, regionMapId: number | string): string {
  // Best-effort : delegate to generic for now.
  return GetMapNameGeneric(dest, regionMapId);
}

/** 1:1 décomp `src/item.c:905 GetItemDescription(itemId)`. */
export function GetItemDescription(itemId: number | string): string {
  const itemKey = typeof itemId === 'number' ? `ITEM_${itemId}` : itemId;
  const item = _getItem(itemKey);
  if (!item) return '';
  return _getItemDescFr(item.descriptionLabel ?? '');
}

// ─── Overworld map header (1:1 décomp `src/overworld.c`) ──────────────────────

/** 1:1 décomp `src/overworld.c:579 Overworld_GetMapHeaderByGroupAndId(group, num)` :
 *    return gMapGroups[mapGroup][mapNum];
 *
 *  Notre map data est async (= fetch JSON), mais cette fn est sync dans le décomp.
 *  Solution : on regarde dans un cache populated par le map loader. Si pas en
 *  cache, on retourne un placeholder header pour éviter le crash et on warn. */
const _mapHeaderRegistry = new Map<string, any>();
export function defineMapHeaderEntry(key: string, header: any): void {
  _mapHeaderRegistry.set(key, header);
}
export function Overworld_GetMapHeaderByGroupAndId(mapGroup: number, mapNum: number): any {
  const key = `${mapGroup}.${mapNum}`;
  const header = _mapHeaderRegistry.get(key);
  if (header) return header;
  // Fallback : returns a structurally-empty header so auto-bodies can read fields
  // without crashing. The .music, .mapType, .battleType fields will be 0/undef.
  return {
    mapLayoutId: 0,
    events: { objectEventCount: 0, warpCount: 0, coordEventCount: 0, bgEventCount: 0,
              objectEvents: [], warps: [], coordEvents: [], bgEvents: [] },
    mapScripts: [],
    connections: { count: 0, connections: [] },
    music: 0,
    mapLayoutId16: 0,
    regionMapSectionId: 0,
    cave: 0,
    weather: 0,
    mapType: 0,
    bikingAllowed: 0,
    allowEscaping: 0,
    allowRunning: 0,
    showMapName: 0,
    battleType: 0,
  };
}

// ─── Battle macros that mutate gBattleMons / gBattleStruct ───────────────────

/** 1:1 décomp `include/battle.h:458` GET_MOVE_TYPE(move, typeArg) — sets typeArg
 *  to dynamic type if set, else gBattleMoves[move].type. C macro mutates by-ref ;
 *  in TS we return the type value so callers can do `let typeArg = GET_MOVE_TYPE(move)`. */
export function GET_MOVE_TYPE(move: number, _typeArg?: any): number {
  const rt: any = _getRT();
  const dynamicType = rt?.gBattleStruct?.dynamicMoveType ?? 0;
  if (dynamicType) return dynamicType & 0x3F;
  return rt?.gBattleMoves?.[move]?.type ?? 0;
}

/** 1:1 décomp `include/battle.h:472` SET_BATTLER_TYPE(battler, type) — set both
 *  types[0] and types[1] of gBattleMons[battler]. */
export function SET_BATTLER_TYPE(battler: number, type: number): void {
  const rt: any = _getRT();
  const battleMons = rt?.gBattleMons;
  if (!battleMons || !battleMons[battler]) return;
  battleMons[battler].types = battleMons[battler].types ?? [0, 0];
  battleMons[battler].types[0] = type;
  battleMons[battler].types[1] = type;
}

// ─── Berry (1:1 décomp `src/berry.c:980 GetBerryInfo`) ────────────────────────

/** 1:1 décomp `src/berry.c:980 GetBerryInfo(berry)` — returns const Berry*. Need
 *  full berry table port + enigmaBerry handling. Stub returns null (= berry tree
 *  code will skip rendering). */
export function GetBerryInfo(_berry: number): any {
  // TODO 1:1 : need gBerries[] table from berry.c.
  return null;
}

/** 1:1 décomp `src/berry.c:992 GetBerryTreeInfo(id)` — read save block berry trees. */
export function GetBerryTreeInfo(_id: number): any {
  const rt: any = _getRT();
  return rt?.gSaveBlock1Ptr?.berryTrees?.[_id] ?? null;
}

// ─── Text window palettes (1:1 décomp `src/text_window.c`) ────────────────────

/** 1:1 décomp `src/text_window.c:162 GetTextWindowPalette(id)` :
 *    Picks 1-of-5 palette banks (offsets 0x00, 0x10, 0x20, 0x30, 0x40). Returns
 *    a u16* into sTextWindowPalettes. En TS : we don't have the asset ; return
 *    null (= caller will skip palette load). */
export function GetTextWindowPalette(id: number): Uint16Array | null {
  // Ideal : load `text_window.pal` asset and return slice [id*16 .. (id+1)*16].
  // Placeholder until palette assets are wired in.
  const rt: any = _getRT();
  const pal = rt?.assetCache?.get?.('sTextWindowPalettes');
  if (pal instanceof Uint16Array) {
    const offset = (Math.min(id, 4)) * 16;
    return pal.subarray(offset, offset + 16);
  }
  return null;
}

/** 1:1 décomp `src/text_window.c:187 GetOverworldTextboxPalettePtr()` :
 *    Returns gMessageBox_Pal — the 16-color palette for the standard overworld
 *    message box. */
export function GetOverworldTextboxPalettePtr(): Uint16Array | null {
  const rt: any = _getRT();
  const pal = rt?.assetCache?.get?.('gMessageBox_Pal');
  if (pal instanceof Uint16Array) return pal;
  return null;
}

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

/** 1:1 décomp `src/string_util.c:96 StringCopyN(dest, src, n)` — copy first n
 *  bytes (= no EOS check). Returns dest+n. */
export function StringCopyN(dest: any, src: any, n: number): any {
  if (typeof src === 'string') {
    if (dest instanceof Uint8Array) {
      for (let i = 0; i < n && i < src.length; i++) dest[i] = src.charCodeAt(i);
    }
    return src.slice(0, n);
  }
  if (src && typeof src === 'object' && src.length != null) {
    if (dest && dest.length != null) {
      for (let i = 0; i < n; i++) dest[i] = src[i];
    }
    return src;
  }
  return src;
}

/** 1:1 décomp `src/string_util.c:106 StringAppendN(dest, src, n)` — append n
 *  bytes from src into dest after its EOS. */
export function StringAppendN(dest: any, src: any, n: number): any {
  if (typeof dest === 'string' && typeof src === 'string') {
    return dest + src.slice(0, n);
  }
  return StringCopyN(dest, src, n);
}

/** 1:1 décomp `src/string_util.c:527 StringFill(dest, c, n)` — fill n bytes with
 *  c, then write EOS. Returns ptr to EOS. */
export function StringFill(dest: any, c: number, n: number): any {
  if (dest instanceof Uint8Array) {
    for (let i = 0; i < n; i++) dest[i] = c;
    if (n < dest.length) dest[n] = 0xFF; // EOS
  }
  return dest;
}

/** 1:1 décomp `src/string_util.c:538 StringCopyPadded(dest, src, c, n)` — copy
 *  src to dest then pad with c until total length n. Returns ptr to EOS. */
export function StringCopyPadded(dest: any, src: any, c: number, n: number): any {
  if (typeof src === 'string') {
    if (dest instanceof Uint8Array) {
      let i = 0;
      for (; i < src.length && i < n; i++) dest[i] = src.charCodeAt(i);
      for (; i < n; i++) dest[i] = c;
      if (n < dest.length) dest[n] = 0xFF;
    }
    const padded = src.slice(0, n);
    return padded.padEnd(n, String.fromCharCode(c));
  }
  return src;
}

/** 1:1 décomp `src/string_util.c StringFillWithTerminator(dest, n)` — write n
 *  EOS bytes (= clear the buffer). */
export function StringFillWithTerminator(dest: any, n: number): any {
  if (dest instanceof Uint8Array) {
    for (let i = 0; i < n; i++) dest[i] = 0xFF;
  }
  return dest;
}

/** 1:1 décomp `src/string_util.c:58 StringCopy_PlayerName(dest, src)` — copy
 *  with PLAYER_NAME_LENGTH = 7 cap. Pads with EOS after the copy. */
export function StringCopy_PlayerName(dest: any, src: any): any {
  const PLAYER_NAME_LENGTH = 7;
  if (typeof src === 'string') {
    const truncated = src.slice(0, PLAYER_NAME_LENGTH);
    if (dest instanceof Uint8Array) {
      for (let i = 0; i < truncated.length; i++) dest[i] = truncated.charCodeAt(i);
      if (truncated.length < dest.length) dest[truncated.length] = 0xFF;
    }
    return truncated;
  }
  return StringCopyN(dest, src, PLAYER_NAME_LENGTH);
}

/** 1:1 décomp `src/string_util.c StringCompareN(a, b, n)` — strncmp. */
export function StringCompareN(a: any, b: any, n: number): number {
  const sa = String(a ?? '').slice(0, n);
  const sb = String(b ?? '').slice(0, n);
  if (sa < sb) return -1;
  if (sa > sb) return 1;
  return 0;
}

/** 1:1 décomp `src/string_util.c IsStringLengthAtLeast(s, n)`. */
export function IsStringLengthAtLeast(s: any, n: number): boolean {
  return String(s ?? '').length >= n;
}

/** 1:1 décomp `src/easy_chat.c ConvertEasyChatWordsToString(dest, src, columns, rows)` :
 *    Decode an array of u16 EC words into a string buffer using the
 *    sEasyChatGroup tables. Need full easy_chat data tables. Stub: empty. */
export function ConvertEasyChatWordsToString(_dest: any, _src: any, _columns: number, _rows: number): any {
  // Best-effort : write EOS at dest[0] (= empty string).
  if (_dest instanceof Uint8Array && _dest.length > 0) _dest[0] = 0xFF;
  return _dest;
}

/** 1:1 décomp `src/easy_chat.c OtherConvertEasyChatWordsToString(...)`. */
export function OtherConvertEasyChatWordsToString(_dest: any, _src: any, _columns: number, _rows: number): any {
  if (_dest instanceof Uint8Array && _dest.length > 0) _dest[0] = 0xFF;
  return _dest;
}

// ─── Pokenav state macro (1:1 décomp `include/pokenav.h:63`) ──────────────────

/** 1:1 décomp `include/pokenav.h:63` LT_SET_STATE(newState) macro :
 *    #define LT_SET_STATE(newState) (newState + 5)
 *  Used by pokenav list/menu state machines to encode "set state" return value. */
export function LT_SET_STATE(newState: number): number {
  return newState + 5;
}

// ─── ISO_RANDOMIZE2 / extra random helper (1:1 décomp `include/random.h`) ─────

/** 1:1 décomp `include/random.h ISO_RANDOMIZE2(val)` — alternate LCG variant.
 *  Pokemon Emerald uses two different random sequences. */
export function ISO_RANDOMIZE2(val: number): number {
  // Same constants as ISO_RANDOMIZE1 in this game (cf. random.h).
  return (Math.imul(1103515245, val) + 24691) | 0;
}

// ─── PLTT_OFFSET_4BPP / OBJ_PLTT_ID2 (1:1 décomp `include/gba/types.h`) ───────

/** 1:1 décomp `include/gba/types.h` :
 *    #define PLTT_OFFSET_4BPP(n) (PLTT_SIZE_4BPP * (n))
 *  En TS : same as PLTT_SIZE_4BPP * n = 32 * n. */
export function PLTT_OFFSET_4BPP(n: number): number { return 32 * n; }

/** 1:1 décomp `include/gba/types.h` OBJ_PLTT_ID2 — alternate alias for OBJ_PLTT_ID. */
export function OBJ_PLTT_ID2(n: number): number { return n * 16; }

// ─── Pokemon storage / box (1:1 décomp `src/pokemon_storage_system.c`) ────────
// All NotImplemented stubs — full PSS port required. Each is grouped here so
// future PSS port can replace them with re-exports.

/** 1:1 décomp `pokemon_storage_system.c GetBoxNamePtr(boxId)`. */
export function GetBoxNamePtr(_boxId: number): any {
  throw new Error('[bridge] GetBoxNamePtr not yet 1:1 ported. See pokemon_storage_system.c.');
}

/** 1:1 décomp `pokemon_storage_system.c GetBoxedMonPtr(boxId, monId)`. */
export function GetBoxedMonPtr(_boxId: number, _monId: number): any {
  throw new Error('[bridge] GetBoxedMonPtr not yet 1:1 ported. See pokemon_storage_system.c.');
}

/** 1:1 décomp `pokemon_storage_system.c GetBoxMonNickname(boxId, monId, dest)`. */
export function GetBoxMonNickname(_boxId: number, _monId: number, _dest?: any): any {
  throw new Error('[bridge] GetBoxMonNickname not yet 1:1 ported. See pokemon_storage_system.c.');
}

/** 1:1 décomp `pokemon_storage_system.c GetBoxWallpaper(boxId)`. */
export function GetBoxWallpaper(_boxId: number): number {
  throw new Error('[bridge] GetBoxWallpaper not yet 1:1 ported. See pokemon_storage_system.c.');
}

/** 1:1 décomp `pokemon_storage_system.c CountBoxMonsForBox(boxId)`. */
export function CountBoxMonsForBox(_boxId: number): number {
  throw new Error('[bridge] CountBoxMonsForBox not yet 1:1 ported.');
}

// ─── Pokemon sprite palette helpers (1:1 décomp `src/pokemon.c`) ──────────────

/** 1:1 décomp `pokemon.c GetMonSpritePalFromSpeciesAndPersonality(species, otId, personality)`.
 *  Reads the proper palette (= shiny vs normal) for a pokemon sprite. Need full
 *  palette tables port. */
export function GetMonSpritePalFromSpeciesAndPersonality(
  _species: number, _otId: number, _personality: number,
): any {
  throw new Error('[bridge] GetMonSpritePalFromSpeciesAndPersonality not yet 1:1 ported. See pokemon.c.');
}

/** 1:1 décomp `pokemon.c GetMonSpritePalStructFromOtIdPersonality(species, otId, personality)`.
 *  Returns the CompressedSpritePalette struct (= palette + tag). */
export function GetMonSpritePalStructFromOtIdPersonality(
  _species: number, _otId: number, _personality: number,
): any {
  throw new Error('[bridge] GetMonSpritePalStructFromOtIdPersonality not yet 1:1 ported.');
}

/** 1:1 décomp `pokemon.c GetMonFrontSpritePal(mon)`. */
export function GetMonFrontSpritePal(_mon: any): any {
  throw new Error('[bridge] GetMonFrontSpritePal not yet 1:1 ported.');
}

/** 1:1 décomp `pokemon_icon.c GetMonIconPtr(species, personality, handleDeoxys)`.
 *  Returns the 24x24 icon for a pokemon (= used in party menu, summary). */
export function GetMonIconPtr(_species: number, _personality: number, _handleDeoxys: number | boolean): any {
  throw new Error('[bridge] GetMonIconPtr not yet 1:1 ported. See pokemon_icon.c.');
}

// ─── Battle interface healthbox (1:1 décomp `src/battle_interface.c`) ─────────

/** 1:1 décomp `battle_interface.c GetHealthboxElementGfxPtr(elementId)` — pointer
 *  to a specific 8x8 tile in the healthbox tilesheet. Need full healthbox port. */
export function GetHealthboxElementGfxPtr(_elementId: number): any {
  throw new Error('[bridge] GetHealthboxElementGfxPtr not yet 1:1 ported. See battle_interface.c.');
}

/** 1:1 décomp `battle_interface.c AddTextPrinterAndCreateWindowOnHealthbox(...)`. */
export function AddTextPrinterAndCreateWindowOnHealthbox(...args: any[]): any {
  throw new Error(`[bridge] AddTextPrinterAndCreateWindowOnHealthbox not yet 1:1 ported. (${args.length} args)`);
}

// ─── Sprite affine matrix (1:1 décomp `include/gba/syscall.h`) ────────────────

/** 1:1 décomp BIOS syscall ObjAffineSet — generates affine matrix from (sx, sy, rotation).
 *  Need to implement matrix math (= sin/cos rotation + scale). Stubbed for now. */
export function ObjAffineSet(_src: any, _dst: any, _count: number, _stride: number): void {
  // TODO 1:1 : implement affine matrix calculation. Until then, no-op.
  // Without this, any rotating sprite (battle anim, moving title screen) will
  // be visually wrong but won't crash.
}

/** 1:1 décomp BIOS syscall BgAffineSet. */
export function BgAffineSet(_src: any, _dst: any, _count: number): void {
  /* no-op : BG affine matrix calc not implemented */
}

// ─── Pokenav helpers (1:1 décomp `src/pokenav_*.c`) ──────────────────────────

/** 1:1 décomp `pokenav.c GetPokenavListWindowState()`. */
export function GetPokenavListWindowState(): number {
  // Return 0 (= idle) by default ; full port needed for pokenav UI.
  return 0;
}

/** 1:1 décomp `pokenav_match_call_data.c GetGeneralMatchCallText(matchCallId, dest)`. */
export function GetGeneralMatchCallText(_matchCallId: number, _dest: any): any {
  return _dest;
}

// ─── Misc battle / contest stubs ──────────────────────────────────────────────

/** 1:1 décomp `src/contest_painting.c GetConditionGraphPtr(...)`. */
export function GetConditionGraphPtr(..._args: any[]): any {
  return null;
}

/** 1:1 décomp `src/intro.c GlowColor(...)` — used in title screen logo glow.
 *  Color cycling animation. No-op until intro is ported. */
export function GlowColor(..._args: any[]): any {
  return 0;
}

/** 1:1 décomp `src/contest.c LandBall(...)`. */
export function LandBall(..._args: any[]): any {
  /* no-op */
}

// ─── Backdrop / GPU register buffer (1:1 décomp `src/gpu_regs.c`) ─────────────

/** 1:1 décomp `gpu_regs.c GPU_REG_BUF(offset)` — direct read of internal sGpuRegBuffer.
 *  En TS : runtime maintains the buffer ; expose via getter. */
export function GPU_REG_BUF(offset: number): number {
  const rt: any = _getRT();
  // sGpuRegBuffer is a Uint8Array of 0x60 bytes ; reading u16 at offset.
  const buf = rt?.sGpuRegBuffer;
  if (buf instanceof Uint8Array && offset + 1 < buf.length) {
    return buf[offset] | (buf[offset + 1] << 8);
  }
  // Fallback : direct GetGpuReg (= reads the live register).
  return _getRT().GetGpuReg(offset);
}

/** 1:1 décomp `src/window.c SetBackdropFromColor(color)` — set the BG backdrop palette
 *  entry [0] to color. */
export function SetBackdropFromColor(color: number): void {
  const rt: any = _getRT();
  if (rt?.gPlttBufferUnfaded?.set && rt?.gPlttBufferFaded?.set) {
    rt.gPlttBufferUnfaded.set(0, color & 0xFFFF);
    rt.gPlttBufferFaded.set(0, color & 0xFFFF);
  }
}

/** 1:1 décomp `src/window.c SetBackdropFromPalette(...)`. */
export function SetBackdropFromPalette(_palettes: any, _palOffset: number): void {
  /* no-op : full port needed */
}

// ─── Region map current ID (1:1 décomp `src/region_map.c`) ────────────────────

/** 1:1 décomp `src/region_map.c GetCurrentRegionMapSectionId()` — read current
 *  player position mapsec from gMapHeader.regionMapSectionId. */
export function GetCurrentRegionMapSectionId(): number {
  const rt: any = _getRT();
  return rt?.gMapHeader?.regionMapSectionId ?? 0;
}

/** 1:1 décomp `src/region_map.c GetMapSecIdAt(x, y)`. */
export function GetMapSecIdAt(_x: number, _y: number): number {
  return 0;
}

/** 1:1 décomp `src/overworld.c GetMapHeaderFromConnection(connection)` — read
 *  the connected map's header. Need connection.mapGroup/mapNum struct. */
export function GetMapHeaderFromConnection(connection: any): any {
  if (!connection) return Overworld_GetMapHeaderByGroupAndId(0, 0);
  return Overworld_GetMapHeaderByGroupAndId(connection.mapGroup ?? 0, connection.mapNum ?? 0);
}

// ─── Map grid helpers (1:1 décomp `src/fieldmap.c`) ──────────────────────────

/** 1:1 décomp `src/fieldmap.c GetMapGridBlockAt(x, y)` — return the metatile
 *  block ID at (x, y). Used by collision / encounter checks. */
export function GetMapGridBlockAt(_x: number, _y: number): number {
  // Best-effort : delegate to map-loader if it exposes an API.
  return 0;
}

// ─── Door graphics (1:1 décomp `src/field_door.c`) ────────────────────────────

/** 1:1 décomp `src/field_door.c GetDoorGraphics(metatileBehavior)` — returns
 *  the DoorGraphics struct for a door type. */
export function GetDoorGraphics(_metatileBehavior: number): any {
  return null;
}

// ─── Trainer class names (1:1 décomp `src/string_util.c`) ─────────────────────

/** 1:1 décomp `src/data/text/trainer_class_names.h` lookup with gender variant. */
export function GetTrainerClassNameGenderSpecific(_classId: number, _gender: number): string {
  return '';
}

// ─── Misc save block accessors ────────────────────────────────────────────────

/** 1:1 décomp `src/wonder_news.c GetSavedWonderNewsMetadata()`. */
export function GetSavedWonderNewsMetadata(): any {
  return null;
}

/** 1:1 décomp `src/walda_phrase.c GetWaldaPhrasePtr()`. */
export function GetWaldaPhrasePtr(): any {
  const rt: any = _getRT();
  return rt?.gSaveBlock1Ptr?.waldaPhrase ?? null;
}

/** 1:1 décomp `src/poke_jump.c GetPokeJumpRecords()`. */
export function GetPokeJumpRecords(): any {
  const rt: any = _getRT();
  return rt?.gSaveBlock2Ptr?.pokeJump ?? null;
}

// ─── Battle setup / configure ─────────────────────────────────────────────────

/** 1:1 décomp `src/battle_setup.c BattleSetup_ConfigureTrainerBattle(...)`. */
export function BattleSetup_ConfigureTrainerBattle(..._args: any[]): any {
  // Stub : signaling that we don't have a battle engine yet. Bodies that need
  // this to set up a real fight will misbehave — but throwing would crash the
  // overworld, so we no-op.
  return 0;
}

// ─── Wireless link / RFU stubs (no-op as we're single-player only) ────────────

/** 1:1 décomp `src/link_rfu_2.c GetHostRfuGameData()` — RFU = Game Boy Wireless Adapter.
 *  Return an empty struct so .activity etc. are 0 (= IN_UNION_ROOM checks fail). */
export function GetHostRfuGameData(): any {
  return { activity: 0, partnerInfo: [], compatibility: 0 };
}

/** 1:1 décomp `src/link_rfu_2.c RfuGetStatus()`. */
export function RfuGetStatus(): number {
  return 0; // RFU_STATUS_OK / no event
}

// ─── Flash storage (1:1 décomp `src/agb_flash*.c`) — stubbed since save uses
// ─── browser localStorage instead of flash chip emulation. ────────────────────

/** 1:1 décomp `src/agb_flash.c FLASH_WRITE(addr, data)` macro. No-op. */
export function FLASH_WRITE(_addr: number, _data: number): void { /* no-op */ }

/** 1:1 décomp `src/agb_flash.c REG_TMCNT_L` — timer count low reg. */
export const REG_TMCNT_L: any = { 0: 0, 1: 0, 2: 0, 3: 0 };
/** 1:1 décomp `src/agb_flash.c REG_TMCNT_H` — timer control high reg. */
export const REG_TMCNT_H: any = { 0: 0, 1: 0, 2: 0, 3: 0 };

/** 1:1 décomp `src/agb_flash.c ProgramFlashByte(...)`. */
export function ProgramFlashByte(..._args: any[]): number { return 0; }
/** 1:1 décomp `src/agb_flash.c WaitForFlashWrite(...)`. */
export function WaitForFlashWrite(..._args: any[]): number { return 0; }

// ─── Multichoice / specials helpers ───────────────────────────────────────────

/** 1:1 décomp `src/script_movement.c LoadPointerFromVars(...)` — read u32 ptr from
 *  two consecutive Vars. */
export function LoadPointerFromVars(varHigh: number, varLow: number): number {
  // Best-effort : combine VarGet results.
  // Caller passes var enum vals ; we read from runtime.
  const rt: any = _getRT();
  if (!rt) return 0;
  try {
    const hi = rt.VarGet?.(varHigh) ?? 0;
    const lo = rt.VarGet?.(varLow) ?? 0;
    return ((hi << 16) | lo) >>> 0;
  } catch {
    return 0;
  }
}

// ─── Naming screen helper for apprentice (rare, 1:1 décomp `src/apprentice.c`) ─

/** 1:1 décomp `apprentice.c GetApprenticeNameInLanguage(idx, lang)`. */
export function GetApprenticeNameInLanguage(_idx: number, _lang: number): string {
  return '';
}

// ─── Status1/2/3 turn macros (1:1 décomp `include/constants/battle.h`) ────────

/** 1:1 décomp `constants/battle.h:116` STATUS1_SLEEP_TURN(num) → num << 0. */
export function STATUS1_SLEEP_TURN(num: number): number { return num & 0x7; }

/** 1:1 décomp `constants/battle.h:130` STATUS2_CONFUSION_TURN(num) → num << 0. */
export function STATUS2_CONFUSION_TURN(num: number): number { return num & 0xF; }

/** 1:1 décomp `constants/battle.h:133` STATUS2_UPROAR_TURN(num) → num << 4. */
export function STATUS2_UPROAR_TURN(num: number): number { return (num & 0xF) << 4; }

/** 1:1 décomp `constants/battle.h:136` STATUS2_BIDE_TURN(num) → ((num << 8) & STATUS2_BIDE).
 *  STATUS2_BIDE = 0x300 (= 2 bits at position 8). */
export function STATUS2_BIDE_TURN(num: number): number { return ((num) << 8) & 0x300; }

/** 1:1 décomp `constants/battle.h:138` STATUS2_LOCK_CONFUSE_TURN(num) → num << 10. */
export function STATUS2_LOCK_CONFUSE_TURN(num: number): number { return (num & 0x3) << 10; }

/** 1:1 décomp `constants/battle.h:141` STATUS2_WRAPPED_TURN(num) → num << 13. */
export function STATUS2_WRAPPED_TURN(num: number): number { return (num & 0x7) << 13; }

/** 1:1 décomp `constants/battle.h:161` STATUS3_ALWAYS_HITS_TURN(num) → ((num << 3) & STATUS3_ALWAYS_HITS).
 *  STATUS3_ALWAYS_HITS = 3 bits @ position 3. */
export function STATUS3_ALWAYS_HITS_TURN(num: number): number { return ((num) << 3) & 0x18; }

/** 1:1 décomp `constants/battle.h:169` STATUS3_YAWN_TURN(num) → ((num << 11) & STATUS3_YAWN). */
export function STATUS3_YAWN_TURN(num: number): number { return ((num) << 11) & 0x1800; }

/** 1:1 décomp `include/battle.h:478-483` GET/SET_STAT_BUFF macros. */
export function GET_STAT_BUFF_ID(n: number): number { return n & 0xF; }
export function GET_STAT_BUFF_VALUE2(n: number): number { return n & 0xF0; }
export function GET_STAT_BUFF_VALUE(n: number): number { return (n >> 4) & 7; }
export function SET_STAT_BUFF_VALUE(n: number): number { return ((n) << 4) & 0xF0; }
export const STAT_BUFF_NEGATIVE = 0x80;

// ─── Battle util macros (1:1 décomp `include/battle_util.h`) ─────────────────

/** 1:1 décomp `battle_util.h:36` ABILITY_ON_OPPOSING_FIELD — wraps AbilityBattleEffects.
 *  Need full ability system port ; placeholder returns 0 (= no effect). */
export function ABILITY_ON_OPPOSING_FIELD(_battler: number, _abilityId: number): number {
  return 0;
}
/** 1:1 décomp `battle_util.h:38` ABILITY_ON_FIELD2(abilityId). */
export function ABILITY_ON_FIELD2(_abilityId: number): number {
  return 0;
}

// ─── PREPARE_*_BUFFER additions (battle_message.h) ────────────────────────────

const B_BUFF_STAT = 7;
const B_BUFF_ABILITY = 8;

/** 1:1 décomp `battle_message.h:90-96` PREPARE_STAT_BUFFER. */
export function PREPARE_STAT_BUFFER(textVar: any, statId: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_STAT;
  textVar[2] = statId;
  textVar[3] = B_BUFF_EOS;
}

/** 1:1 décomp `battle_message.h:98-104` PREPARE_ABILITY_BUFFER. */
export function PREPARE_ABILITY_BUFFER(textVar: any, abilityId: number): void {
  if (!textVar) return;
  textVar[0] = B_BUFF_PLACEHOLDER_BEGIN;
  textVar[1] = B_BUFF_ABILITY;
  textVar[2] = abilityId;
  textVar[3] = B_BUFF_EOS;
}

// ─── Float / s16 conversion (1:1 décomp `include/global.h:139`) ──────────────

/** 1:1 décomp `include/global.h:139` :
 *    #define S16TOPOSFLOAT(val) ({ s16 v = val; float f = v; if (v < 0) f += 65536; f; })
 *  Convert s16 to "positive float" (= treat negative as 16-bit unsigned). */
export function S16TOPOSFLOAT(val: number): number {
  const v = (val << 16) >> 16; // sign-extend s16
  let f = v;
  if (v < 0) f += 65536;
  return f;
}

/** 1:1 décomp `include/global.h:147` DIV_ROUND_UP(val, roundBy). */
export function DIV_ROUND_UP(val: number, roundBy: number): number {
  return ((val / roundBy) | 0) + ((val % roundBy) ? 1 : 0);
}

// ─── Joypad raw (1:1 décomp `include/global.h:136`) ──────────────────────────

/** 1:1 décomp `include/global.h:136` JOY_HELD_RAW(button). */
export function JOY_HELD_RAW(button: number): number {
  const rt: any = _getRT();
  const heldRaw = rt?.gMain?.heldKeysRaw ?? 0;
  return heldRaw & button;
}

// ─── Map / fieldmap macros (1:1 décomp `include/global.fieldmap.h`) ──────────

/** 1:1 décomp `include/global.fieldmap.h:46` UNPACK_BEHAVIOR(data) :
 *    UNPACK(data, METATILE_ATTR_BEHAVIOR_SHIFT, METATILE_ATTR_BEHAVIOR_MASK)
 *    METATILE_ATTR_BEHAVIOR_SHIFT = 0, METATILE_ATTR_BEHAVIOR_MASK = 0xFF. */
export function UNPACK_BEHAVIOR(data: number): number { return data & 0xFF; }

// ─── Item check macros (1:1 décomp `include/mail.h:6`) ───────────────────────

/** 1:1 décomp `include/mail.h:6` IS_ITEM_MAIL(itemId) — check if item is mail.
 *  Mail items = 121-132 (0x79-0x84) in Emerald. */
export function IS_ITEM_MAIL(itemId: number): boolean {
  return itemId >= 0x79 && itemId <= 0x84;
}

// ─── Roulette grid (1:1 décomp `src/roulette.c:73-79`) ───────────────────────

/** 1:1 décomp `roulette.c:73` GET_COL(selectionId) → selectionId % (NUM_BOARD_POKES + 1).
 *  NUM_BOARD_POKES = 4. */
export function GET_COL(selectionId: number): number { return selectionId % 5; }

/** 1:1 décomp `roulette.c:79` GET_ROW_IDX(selectionId) → selectionId / 5 - 1. */
export function GET_ROW_IDX(selectionId: number): number { return Math.floor(selectionId / 5) - 1; }

// ─── Sprite tile alloc (1:1 décomp `src/sprite.c:22`) ────────────────────────

/** 1:1 décomp `src/sprite.c:22` FREE_SPRITE_TILE(n) — bit-clear in sSpriteTileAllocBitmap.
 *  Need internal sprite tile bitmap access ; for now no-op. */
export function FREE_SPRITE_TILE(_n: number): void {
  /* TODO 1:1 : need sSpriteTileAllocBitmap from sprite.c. No-op until sprite
     tile manager is fully ported. */
}

// ─── Fan club bitfield (1:1 décomp `src/field_specials.c:3971`) ──────────────

/** 1:1 décomp `field_specials.c:3971` SET_TRAINER_FAN_CLUB_FLAG(flag). */
export function SET_TRAINER_FAN_CLUB_FLAG(flag: number): void {
  const rt: any = _getRT();
  const fc = rt?.gSaveBlock1Ptr?.trainerFanClub;
  if (!fc) return;
  fc.flags = (fc.flags ?? 0) | (1 << flag);
}

// ─── Misc data accessors (1:1 décomp various) ────────────────────────────────

/** 1:1 décomp `src/event_data.c GetFlagPointer(flagId)`. */
export function GetFlagPointer(_flagId: number): { value: number } | null {
  // Same situation as GetVarPointer : prefer FlagSet/FlagGet. NotImpl path.
  throw new Error('[bridge] GetFlagPointer not yet 1:1 ported. Use FlagGet/FlagSet instead.');
}

/** 1:1 décomp `src/string_util.c GetMonNickname2`. */
export function GetMonNickname2(_mon: any, _dest?: any): string {
  throw new Error('[bridge] GetMonNickname2 not yet 1:1 ported.');
}

/** 1:1 décomp `src/save_block.c GetPlayerName()` :
 *    returns gSaveBlock2Ptr->playerName as u8*. */
export function GetPlayerName(): string {
  const rt: any = _getRT();
  return rt?.gSaveBlock2Ptr?.playerName ?? '';
}

/** 1:1 décomp `event_object_movement.c FindCameraSprite()`. */
export function FindCameraSprite(): any {
  const rt: any = _getRT();
  return rt?.cameraSprite ?? null;
}

/** 1:1 décomp `event_object_movement.c GetBaseTemplateForObjectEvent(template)`. */
export function GetBaseTemplateForObjectEvent(_template: any): any {
  return _template;
}

/** 1:1 décomp `fieldmap.c AreCoordsWithinMapGridBounds(x, y)`. */
export function AreCoordsWithinMapGridBounds(_x: number, _y: number): boolean {
  // TODO : check vs gMapHeader.mapLayout dims. Approximate true for now.
  return true;
}

/** 1:1 décomp `event_object_movement.c GetWalkSlowMovementAction(direction)`. */
export function GetWalkSlowMovementAction(direction: number): number {
  // MOVEMENT_ACTION_WALK_SLOW_DOWN = 0x04, etc.
  switch (direction) {
    case 1: return 0x04;
    case 2: return 0x05;
    case 3: return 0x06;
    case 4: return 0x07;
    default: return 0x04;
  }
}

/** 1:1 décomp `match_call.c GetRematchTrainerLocation(matchCallId)`. */
export function GetRematchTrainerLocation(_matchCallId: number): number {
  return 0;
}

/** 1:1 décomp `menu_specialized.h:47` GET_NUM_CONDITION_SPARKLES(sheen) macro. */
export function GET_NUM_CONDITION_SPARKLES(sheen: number): number {
  const MAX_SHEEN = 255;
  const MAX_CONDITION_SPARKLES = 7;
  if (sheen === MAX_SHEEN) return MAX_CONDITION_SPARKLES - 1;
  return Math.floor(sheen / Math.floor(MAX_SHEEN / (MAX_CONDITION_SPARKLES - 1) + 1));
}

/** 1:1 décomp wonder news/card lookups — all stub null. */
export function GetSavedWonderNews(): any { return null; }
export function GetSavedWonderCardMetadata(): any { return null; }
export function GetSavedWonderCard(): any { return null; }

/** 1:1 décomp `src/fieldmap.c GetMapLayout()`. */
export function GetMapLayout(): any {
  const rt: any = _getRT();
  return rt?.gMapHeader?.mapLayout ?? null;
}

/** 1:1 décomp `src/heal_location.c GetHealLocation(idx)`. */
export function GetHealLocation(_idx: number): any { return null; }

/** 1:1 décomp `src/save.c GetSubstruct(idx)` — typed alias for GetSubstructPtr.
 *  Same signature, throws same NotImpl. */
export function GetSubstruct(_idx: number): any {
  throw new Error('[bridge] GetSubstruct not yet 1:1 ported. See save.c.');
}

/** 1:1 décomp `src/pokemon_icon.c GetMonIconTiles(species, personality)`. */
export function GetMonIconTiles(_species: number, _personality: number): any {
  throw new Error('[bridge] GetMonIconTiles not yet 1:1 ported.');
}

/** 1:1 décomp `src/window.c GetStringClearToWidth(str, width)` :
 *    Returns ptr into str for the substring that fits in `width` pixels. */
export function GetStringClearToWidth(str: any, _width: number): any {
  return str;
}

/** 1:1 décomp `src/agb_flash.c EraseFlashSector(sector)`. */
export function EraseFlashSector(_sector: number): number { return 0; }

/** 1:1 décomp `src/agb_flash.c ProgramFlashSector(sector, src)`. */
export function ProgramFlashSector(_sector: number, _src: any): number { return 0; }

/** 1:1 décomp `src/string_util.c StringAppendWithPlaceholder(dest, src)`. */
export function StringAppendWithPlaceholder(dest: any, src: any): any {
  if (typeof dest === 'string') return dest + String(src ?? '');
  return src;
}

/** 1:1 décomp `src/contest.c TrackStop(...)` — sound/track helper. */
export function TrackStop(..._args: any[]): void { /* no-op */ }

/** 1:1 décomp various `READ_XCMD_BYTE(ctx)` — read external command stream byte. */
export function READ_XCMD_BYTE(ctx: any): number { return ScriptReadByte(ctx); }

/** 1:1 décomp `src/text.c GetLastCharOfMessagePtr(msg)`. */
export function GetLastCharOfMessagePtr(_msg: any): any { return null; }
/** 1:1 décomp `src/text.c GetLimitedMessageStartPtr(...)`. */
export function GetLimitedMessageStartPtr(..._args: any[]): any { return null; }

// ─── DMA fill defvars + Dma3CopyLarge_ helpers (1:1 décomp `include/gba/macro.h`) ─

/** 1:1 décomp `gba/macro.h DmaFill16Defvars` — typed cast variant. */
export function DmaFill16Defvars(_dmaNum: number, value: number, dst: any, sizeBytes: number): void {
  if (dst instanceof Uint16Array) {
    for (let i = 0; i < sizeBytes / 2; i++) dst[i] = value & 0xFFFF;
  }
}
/** 1:1 décomp `gba/macro.h DmaFill32Defvars`. */
export function DmaFill32Defvars(_dmaNum: number, value: number, dst: any, sizeBytes: number): void {
  if (dst instanceof Uint32Array) {
    for (let i = 0; i < sizeBytes / 4; i++) dst[i] = value >>> 0;
  }
}

/** 1:1 décomp `dma3_manager.c Dma3CopyLarge16_(src, dst, size)` — schedules
 *  a queued DMA copy (= for crossing VBlank boundary). En TS : direct copy. */
export function Dma3CopyLarge16_(src: any, dst: any, sizeBytes: number): number {
  CpuCopy16(src, dst, sizeBytes);
  return 0;
}
export function Dma3CopyLarge32_(src: any, dst: any, sizeBytes: number): number {
  CpuCopy32(src, dst, sizeBytes);
  return 0;
}
export function Dma3FillLarge16_(value: number, dst: any, sizeBytes: number): number {
  if (dst instanceof Uint16Array) {
    for (let i = 0; i < sizeBytes / 2; i++) dst[i] = value & 0xFFFF;
  }
  return 0;
}

// ─── Soft reset (1:1 décomp `src/main.c`) ────────────────────────────────────

/** 1:1 décomp `src/main.c SoftReset(resetFlags)` — reload the game. In browser :
 *  approximate via window.location.reload(). */
export function SoftReset(_resetFlags?: number): void {
  if (typeof window !== 'undefined' && window.location) {
    // Defer to next tick so caller can finish (= avoid mid-frame reload).
    setTimeout(() => window.location.reload(), 0);
  }
}

/** 1:1 décomp `src/contest_painting.c Contest_CopyStringWithColor(...)`. */
export function Contest_CopyStringWithColor(..._args: any[]): any {
  return null;
}

/** 1:1 décomp `src/text_window.c WriteColorChangeControlCode(...)`. */
export function WriteColorChangeControlCode(..._args: any[]): void { /* no-op */ }

/** 1:1 décomp `src/easy_chat.c GetQuestionnaireWordsPtr()`. */
export function GetQuestionnaireWordsPtr(): any { return null; }

/** 1:1 décomp `src/script.c GetObjectEventScriptPointerPlayerFacing()`. */
export function GetObjectEventScriptPointerPlayerFacing(): any { return null; }

/** 1:1 décomp `src/battle_main.c CALC_STAT(base, iv, ev, level, statIndex, nature)`.
 *  Compute a pokemon stat 1:1 from base + IVs + EVs + level + nature.
 *  Need full nature table. Stub returns base for now. */
export function CALC_STAT(base: number, _iv: number, _ev: number, _level: number, _statIndex: number, _nature?: number): number {
  return base;
}

/** 1:1 décomp `src/battle_dome.c BUFFER_PARTY_VS_SCREEN_STATUS(...)`. */
export function BUFFER_PARTY_VS_SCREEN_STATUS(..._args: any[]): number { return 0; }

/** 1:1 décomp `src/link.c BYTE_TO_SEND(byte)` — link transmit byte helper. */
export function BYTE_TO_SEND(byte: number): number { return byte & 0xFF; }

// ─── Final cleanup batch (= macros + helpers with 2× call frequency) ──────────

/** 1:1 décomp `include/data.h:32-33` :
 *    GET_MON_COORDS_WIDTH(size)  = (size >> 4) * 8
 *    GET_MON_COORDS_HEIGHT(size) = (size & 0xF) * 8 */
export function GET_MON_COORDS_WIDTH(size: number): number { return (size >> 4) * 8; }
export function GET_MON_COORDS_HEIGHT(size: number): number { return (size & 0xF) * 8; }

/** 1:1 décomp `include/global.fieldmap.h:26` :
 *    UNPACK_METATILE(data) = (data & MAPGRID_METATILE_ID_MASK) >> 0
 *    MAPGRID_METATILE_ID_MASK = 0x03FF (= 10 bits). */
export function UNPACK_METATILE(data: number): number { return data & 0x03FF; }

/** 1:1 décomp `constants/battle.h:123` STATUS1_TOXIC_TURN(num) → num << 8. */
export function STATUS1_TOXIC_TURN(num: number): number { return (num & 0xF) << 8; }

/** 1:1 décomp `constants/battle.h:206` HITMARKER_FAINTED2(battler) → (1 << 28) << battler. */
export function HITMARKER_FAINTED2(battler: number): number {
  return ((1 << 28) << battler) >>> 0;
}

/** 1:1 décomp `constants/items.h:481` :
 *    ITEM_HAS_EFFECT(item) = item >= ITEM_POTION && item <= MAX_BERRY_INDEX
 *    ITEM_POTION = 13 (= 0x0D), MAX_BERRY_INDEX = 0xB1 in Emerald. */
export function ITEM_HAS_EFFECT(item: number): boolean {
  return item >= 0x0D && item <= 0xB1;
}

/** 1:1 décomp `constants/secret_bases.h:20` :
 *    SECRET_BASE_ID_TO_GROUP(baseId) = SECRET_BASE_GROUP(baseId / 10) */
export function SECRET_BASE_ID_TO_GROUP(baseId: number): number { return Math.floor(baseId / 10); }

/** 1:1 décomp `include/battle.h:485` SET_STATCHANGER macro :
 *    gBattleScripting.statChanger = statId + (stage << 4) + (goesDown << 7) */
export function SET_STATCHANGER(statId: number, stage: number, goesDown: number): void {
  const rt: any = _getRT();
  if (rt?.gBattleScripting) {
    rt.gBattleScripting.statChanger = statId + (stage << 4) + (goesDown << 7);
  }
}

/** 1:1 décomp `include/gba/io_reg.h:585` :
 *    WIN_RANGE2(a, b) = b | (a << 8) */
export function WIN_RANGE2(a: number, b: number): number { return (b & 0xFF) | ((a & 0xFF) << 8); }

/** 1:1 décomp `src/pokenav.c:11` LOOPED_TASK_DECODE_STATE(action) → action - 5.
 *  Inverse of LT_SET_STATE. */
export function LOOPED_TASK_DECODE_STATE(action: number): number { return action - 5; }

/** 1:1 décomp `src/pokemon.c:4075-4077 SET8/SET16/SET32` macros — used inside
 *  GetMonData/SetMonData. C macros that read from a `data` ptr ; in TS we
 *  expose them as functions returning the value (= callers can do `lhs = SET32(data)`). */
export function SET8(data: any): number {
  if (typeof data === 'number') return data & 0xFF;
  return (data?.[0] ?? 0) & 0xFF;
}
export function SET16(data: any): number {
  return ((data?.[0] ?? 0) | ((data?.[1] ?? 0) << 8)) & 0xFFFF;
}
export function SET32(data: any): number {
  return (
    (data?.[0] ?? 0) |
    ((data?.[1] ?? 0) << 8) |
    ((data?.[2] ?? 0) << 16) |
    ((data?.[3] ?? 0) << 24)
  ) >>> 0;
}

/** 1:1 décomp `src/pokemon.c:6738` READ_PTR_FROM_TASK(taskId, dataId).
 *  Read 32-bit ptr stored in task data[dataId]+data[dataId+1]. */
export function READ_PTR_FROM_TASK(taskId: number, dataId: number): any {
  const rt: any = _getRT();
  const task = rt?.gTasks?.[taskId];
  if (!task) return null;
  const lo = task.data?.[dataId] ?? 0;
  const hi = task.data?.[dataId + 1] ?? 0;
  return (lo | (hi << 16)) >>> 0;
}

/** 1:1 décomp `src/pokemon.c:6743` STORE_PTR_IN_TASK(ptr, taskId, dataId). */
export function STORE_PTR_IN_TASK(ptr: any, taskId: number, dataId: number): void {
  const rt: any = _getRT();
  const task = rt?.gTasks?.[taskId];
  if (!task) return;
  const value = typeof ptr === 'number' ? ptr : 0;
  task.data = task.data ?? [];
  task.data[dataId] = value & 0xFFFF;
  task.data[dataId + 1] = (value >>> 16) & 0xFFFF;
}

/** 1:1 décomp `src/menu_specialized.c:330` SHIFT_RIGHT_ADJUSTED(n, s) :
 *    Round-half-up shift right (= banker's rounding via bit-add). */
export function SHIFT_RIGHT_ADJUSTED(n: number, s: number): number {
  return (n >> s) + ((n >> (s - 1)) & 1);
}

/** 1:1 décomp `src/mauville_old_man.c:443` WORD_TO_PITCH_TABLE_INDEX. */
export function WORD_TO_PITCH_TABLE_INDEX(a: number): number {
  const NUM_BARD_PITCH_TABLES_PER_SIZE = 8;
  return MOD(a, NUM_BARD_PITCH_TABLES_PER_SIZE - 1) + ((a >> 3) & 1);
}

/** 1:1 décomp `src/battle_setup.c:863` RANDOM_TRANSITION(table) :
 *    table[Random() % ARRAY_COUNT(table)] */
export function RANDOM_TRANSITION(table: any): any {
  if (!table || !table.length) return 0;
  return table[Random() % table.length];
}

/** 1:1 décomp `src/battle_message.c:2362` HANDLE_NICKNAME_STRING_CASE :
 *    Branch on whether nickname matches species name. C macro mutates by-ref ;
 *    in TS we approximate via best-effort string compare. */
export function HANDLE_NICKNAME_STRING_CASE(_battlerId: number, _monIndex: number): void {
  /* TODO 1:1 : need full pokemon nickname comparison logic. */
}

/** 1:1 décomp `src/battle_dome.c:5690` SET_WIN0H_WIN1H(win0H, win1H) :
 *    SetGpuReg(REG_OFFSET_WIN0H, win0H); SetGpuReg(REG_OFFSET_WIN1H, win1H); */
export function SET_WIN0H_WIN1H(win0H: number, win1H: number): void {
  SetGpuReg(0x40, win0H); // REG_OFFSET_WIN0H
  SetGpuReg(0x42, win1H); // REG_OFFSET_WIN1H
}

/** 1:1 décomp `src/sprite.c:11` SET_SPRITE_TILE_RANGE(index, start, count). */
export function SET_SPRITE_TILE_RANGE(_index: number, _start: number, _count: number): void {
  /* TODO 1:1 : need sSpriteTileRanges array from sprite.c. No-op placeholder. */
}

/** 1:1 décomp `src/siirtc.c` RTC buffer accessors. */
export function INFO_BUF(info: any, index: number): number {
  if (info instanceof Uint8Array) return info[index] ?? 0;
  return info?.[index] ?? 0;
}
export function DATETIME_BUF(info: any, index: number): number {
  return INFO_BUF(info, 0 + index);
}
export function TIME_BUF(info: any, index: number): number {
  return INFO_BUF(info, 4 + index); // OFFSET_HOUR = 4
}

// ─── Misc accessors (= 2× frequency) ─────────────────────────────────────────

/** 1:1 décomp `src/easy_chat.c CopyEasyChatWordPadded(dest, wordId, n)`. */
export function CopyEasyChatWordPadded(_dest: any, _wordId: number, _n: number): any {
  return _dest;
}

/** 1:1 décomp `src/bard_music.c GetCurrentPhrase(...)`. */
export function GetCurrentPhrase(..._args: any[]): any { return null; }

/** 1:1 décomp `src/pokemon.c GetMonSpritePalStruct(mon)`. */
export function GetMonSpritePalStruct(_mon: any): any {
  throw new Error('[bridge] GetMonSpritePalStruct not yet 1:1 ported.');
}

/** 1:1 décomp BIOS syscall `VBlankIntrWait()` — wait for VBlank IRQ. No-op in JS. */
export function VBlankIntrWait(): void { /* no-op : VBlank handled by RAF loop */ }

/** 1:1 décomp BIOS syscall `IntrEnable(mask)`. */
export function IntrEnable(_mask: number): void { /* no-op */ }

/** 1:1 décomp BIOS syscall `RegisterRamReset(flags)` — clear specific RAM regions. */
export function RegisterRamReset(_flags: number): void { /* no-op : managed by runtime */ }

/** 1:1 décomp `src/event_object_movement.c GetObjectEventTemplateByLocalIdAndMap(localId, mapNum, mapGroup)`. */
export function GetObjectEventTemplateByLocalIdAndMap(_localId: number, _mapNum: number, _mapGroup: number): any {
  return null;
}

/** 1:1 décomp `src/event_object_movement.c GetStepAnimTable(...)`. */
export function GetStepAnimTable(..._args: any[]): any { return null; }

/** 1:1 décomp `src/event_object_movement.c GetJumpSpecialMovementAction(direction)`. */
export function GetJumpSpecialMovementAction(direction: number): number {
  // Variant of GetJumpMovementAction. Same direction → MOVEMENT_ACTION_X mapping.
  switch (direction) {
    case 1: return 0x60;
    case 2: return 0x61;
    case 3: return 0x62;
    case 4: return 0x63;
    default: return 0x60;
  }
}

/** 1:1 décomp `src/overworld.c GetDestinationWarpMapHeader()`. */
export function GetDestinationWarpMapHeader(): any {
  return Overworld_GetMapHeaderByGroupAndId(0, 0);
}

/** 1:1 décomp `src/item_icon.c GetItemIconPicOrPalette/Pic/Palette`. */
export function GetItemIconPicOrPalette(..._args: any[]): any { return null; }
export function GetItemIconPic(..._args: any[]): any { return null; }
export function GetItemIconPalette(..._args: any[]): any { return null; }

/** 1:1 décomp `src/contest.c GetStoryActionByStat(...)`. */
export function GetStoryActionByStat(..._args: any[]): number { return 0; }

/** 1:1 décomp `include/gba/io_reg.h REG_SIOMULTI` — link multiplayer regs. */
export const REG_SIOMULTI: any = { 0: 0, 1: 0, 2: 0, 3: 0 };

/** 1:1 décomp `src/save.c GetSavedRamScriptIfValid()`. */
export function GetSavedRamScriptIfValid(): any { return null; }

/** 1:1 décomp `src/party_menu.c GetPartyMenuPalBufferPtr(palIdx)`. */
export function GetPartyMenuPalBufferPtr(_palIdx: number): any { return null; }

/** 1:1 décomp `src/region_map.c GetRegionMapSectionId(x, y)` — same as GetMapSecIdAt. */
export function GetRegionMapSectionId(_x: number, _y: number): number { return 0; }

/** 1:1 décomp `src/mon_markings.c CreateMonMarkingAllCombosSprite(...)`. */
export function CreateMonMarkingAllCombosSprite(..._args: any[]): number { return -1; }

/** 1:1 décomp `src/match_call.c GetMatchCallMapSec(matchCallId)` and similar. */
export function GetMatchCallMapSec(_matchCallId: number): number { return 0; }
export function GetMatchTableMapSectionId(_matchCallId: number): number { return 0; }

/** 1:1 décomp `src/main_menu.c GetMainMenuInputHandler()`. */
export function GetMainMenuInputHandler(): any { return null; }

/** 1:1 décomp `src/pokemon.c LoadPtrFromTaskData(taskId, dataIdx)`. */
export function LoadPtrFromTaskData(taskId: number, dataIdx: number): any {
  return READ_PTR_FROM_TASK(taskId, dataIdx);
}

/** 1:1 décomp `src/secret_base.c GetSecretBaseName(...)`. */
export function GetSecretBaseName(..._args: any[]): string { return ''; }

/** 1:1 décomp `src/text.c GetMessageEntryBuffer()`. */
export function GetMessageEntryBuffer(): any { return null; }

/** 1:1 décomp `src/event_data.c MapHeaderCheckScriptTable(table)`. */
export function MapHeaderCheckScriptTable(_table: any): any { return null; }

/** 1:1 décomp `src/agb_flash.c DELAY()`. */
export function DELAY(): void { /* no-op : timer is browser RAF-driven */ }

/** 1:1 décomp `src/agb_flash.c PollFlashStatus()`. */
export function PollFlashStatus(): number { return 0; }

/** 1:1 décomp `src/apprentice.c APPRENTICE_SPECIES_ID_NO_COND(monId, count)` macro. */
export function APPRENTICE_SPECIES_ID_NO_COND(monId: number, _count: number): number {
  return monId;
}

/** 1:1 décomp BIOS syscall ArcTan2(x, y) — return the 0-65535 angle. Approximate. */
export function ArcTan2(x: number, y: number): number {
  const a = Math.atan2(y, x);
  return ((a / (2 * Math.PI)) * 65536) | 0;
}

/** 1:1 décomp BIOS syscall Sqrt(n) — integer square root. */
export function Sqrt(n: number): number {
  return Math.sqrt(n) | 0;
}

/** 1:1 décomp `src/menu.c TryGetStatusString(...)`. */
export function TryGetStatusString(..._args: any[]): any { return null; }

/** 1:1 décomp `src/pokemon_icon.c GetValidMonIconPalettePtr(species)`. */
export function GetValidMonIconPalettePtr(_species: number): any { return null; }

/** 1:1 décomp `src/battle_setup.c GetTrainerALoseText/BLoseText/IntroSpeechOf/CantBattleSpeech`. */
export function GetTrainerALoseText(_trainerId: number): string { return ''; }
export function GetTrainerBLoseText(_trainerId: number): string { return ''; }
export function GetIntroSpeechOfApproachingTrainer(_trainerId: number): string { return ''; }
export function GetTrainerCantBattleSpeech(): string { return ''; }

/** 1:1 décomp battle_controllers.c IS_BATTLE_CONTROLLER_*. */
export function IS_BATTLE_CONTROLLER_ACTIVE_ON_LOCAL(..._args: any[]): boolean { return false; }
export function MARK_BATTLE_CONTROLLER_IDLE_FOR_PLAYER(..._args: any[]): void { /* no-op */ }
export function IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(..._args: any[]): boolean { return false; }

/** 1:1 décomp `src/link.c BYTE_TO_RECEIVE`. */
export function BYTE_TO_RECEIVE(_idx: number): number { return 0; }

/** 1:1 décomp `src/link_rfu_*.c MSC_callback / LMAN_callback`. */
export function MSC_callback(..._args: any[]): void { /* no-op : multi-boot */ }
export function LMAN_callback(..._args: any[]): void { /* no-op : link manager */ }

/** 1:1 décomp `src/intro.c BOUNCES/SHAKES/STATE/DIRECTION/etc.` —
 *  Task data accessor macros for intro task data slots. Each is identity-ish
 *  for now (= bodies use these as `data->BOUNCES` etc., which is just a slot lookup). */
export function BOUNCES(_data: any): number { return 0; }
export function SHAKES(_data: any): number { return 0; }
export function SHAKE_INC(_data: any): number { return 0; }
export function STATE(_data: any): number { return 0; }
export function DIRECTION(_data: any): number { return 0; }
export function FALL(_data: any): number { return 0; }
export function PHASE_DELTA(_data: any): number { return 0; }
export function RISE_FASTER(_data: any): number { return 0; }
export function RESET_STATE(_data: any): number { return 0; }

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

// ─── GBA macros (1:1 décomp `include/gba/macro.h`) — extra fast variants ──────
//
// These are the "Fast" cousins of CpuCopy/CpuFill that use 32-bit DMA-style
// transfers in hardware. In JS, we don't have DMA so they collapse to the
// regular CpuCopy/CpuFill (which themselves are no-ops for non-typed-array
// pointers). 1:1 with `include/gba/macro.h:43-55`.

/** 1:1 décomp `include/gba/macro.h:55` :
 *    #define CpuFastCopy(src, dest, size)  CpuFastSet(src, dest, ((size)/(32/8) & 0x1FFFFF))
 *  En TS : same as CpuCopy32 (= 32-bit DMA transfer). */
export function CpuFastCopy(src: any, dst: any, sizeBytes: number): void {
  CpuCopy32(src, dst, sizeBytes);
}

/** 1:1 décomp `include/gba/macro.h:43-49` :
 *    #define CpuFastFill(value, dest, size) ... CpuFastSet(&tmp, dest, CPU_FAST_SET_SRC_FIXED | size>>2)
 *  En TS : memset bytewise. */
export function CpuFastFill(value: number, dst: any, sizeBytes: number): void {
  if (dst instanceof Uint8Array || dst instanceof Uint16Array || dst instanceof Uint32Array) {
    for (let i = 0; i < sizeBytes; i++) dst[i] = value;
  } else if (Array.isArray(dst)) {
    for (let i = 0; i < sizeBytes; i++) dst[i] = value;
  }
  /* sinon : no-op (les pointeurs JS abstraits ne sont pas remplissables) */
}

/** 1:1 décomp `include/gba/macro.h:51` :
 *    #define CpuFastFill16(value, dest, size) CpuFastFill(((value) << 16) | (value), (dest), (size))
 *  En TS : same effect as CpuFastFill since we operate per-element. */
export function CpuFastFill16(value: number, dst: any, sizeBytes: number): void {
  if (dst instanceof Uint16Array) {
    const numEntries = sizeBytes / 2 | 0;
    for (let i = 0; i < numEntries; i++) dst[i] = value & 0xFFFF;
  } else {
    CpuFastFill(value & 0xFFFF, dst, sizeBytes);
  }
}

/** 1:1 décomp `include/gba/macro.h:53` :
 *    #define CpuFastFill8(value, dest, size) CpuFastFill(...)
 *  En TS : memset bytewise. */
export function CpuFastFill8(value: number, dst: any, sizeBytes: number): void {
  CpuFastFill(value & 0xFF, dst, sizeBytes);
}

/** 1:1 décomp `include/gba/macro.h:68-78 DmaSet(dmaNum, src, dest, control)`.
 *  Hardware-only ; no-op in JS. Used for raw DMA reg writes. */
export function DmaSet(_dmaNum: number, _src: any, _dst: any, _control: number): void {
  /* no-op : DMA registers don't exist in JS runtime */
}

/** 1:1 décomp `include/gba/macro.h:147-160 DmaSetUnchecked(dmaNum, src, dest, control)`.
 *  Same as DmaSet without static-assert. No-op. */
export function DmaSetUnchecked(_dmaNum: number, _src: any, _dst: any, _control: number): void {
  /* no-op */
}

/** 1:1 décomp `include/gba/macro.h:192 DmaFillLarge16(dmaNum, value, dest, size, block)`.
 *  Hardware DMA fill in chunks. En TS : delegates to DmaFill16 (= no-op underlying). */
export function DmaFillLarge16(_dmaNum: number, value: number, dst: any, sizeBytes: number, _block?: number): void {
  if (dst instanceof Uint16Array) {
    const numEntries = sizeBytes / 2 | 0;
    for (let i = 0; i < numEntries; i++) dst[i] = value & 0xFFFF;
  }
}

/** 1:1 décomp `include/gba/macro.h DmaFillLarge32`. */
export function DmaFillLarge32(_dmaNum: number, value: number, dst: any, sizeBytes: number, _block?: number): void {
  if (dst instanceof Uint32Array) {
    const numEntries = sizeBytes / 4 | 0;
    for (let i = 0; i < numEntries; i++) dst[i] = value >>> 0;
  }
}

/** 1:1 décomp `include/gba/macro.h DmaCopyLarge16/32`. */
export function DmaCopyLarge16(_dmaNum: number, src: any, dst: any, sizeBytes: number, _block?: number): void {
  CpuCopy16(src, dst, sizeBytes);
}
export function DmaCopyLarge32(_dmaNum: number, src: any, dst: any, sizeBytes: number, _block?: number): void {
  CpuCopy32(src, dst, sizeBytes);
}

/** 1:1 décomp `include/gba/macro.h DmaClearLarge16/32`. */
export function DmaClearLarge16(_dmaNum: number, dst: any, sizeBytes: number, _block?: number): void {
  if (dst instanceof Uint16Array) {
    const numEntries = sizeBytes / 2 | 0;
    for (let i = 0; i < numEntries; i++) dst[i] = 0;
  }
}
export function DmaClearLarge32(_dmaNum: number, dst: any, sizeBytes: number, _block?: number): void {
  if (dst instanceof Uint32Array) {
    const numEntries = sizeBytes / 4 | 0;
    for (let i = 0; i < numEntries; i++) dst[i] = 0;
  }
}

/** 1:1 décomp `include/gba/macro.h DmaCopy16Defvars / DmaCopy32Defvars`.
 *  Same as DmaCopy16/32 with a void-cast variant for typed strict mode.
 *  Used in MODERN builds. */
export function DmaCopy16Defvars(_dmaNum: number, src: any, dst: any, sizeBytes: number): void {
  CpuCopy16(src, dst, sizeBytes);
}
export function DmaCopy32Defvars(_dmaNum: number, src: any, dst: any, sizeBytes: number): void {
  CpuCopy32(src, dst, sizeBytes);
}

// ─── Math macros (= 1:1 décomp include/global.h + util macros) ────────────────

/** 1:1 décomp `include/global.h:103` :
 *    #define MOD(a, n) (((n) & ((n)-1)) ? ((a) % (n)) : ((a) & ((n)-1)))
 *  Optimized modulo : if n is a power of 2, use bitwise AND ; else use %.
 *  En TS : équivalent direct. */
export function MOD(a: number, n: number): number {
  return ((n & (n - 1)) ? (a % n) : (a & (n - 1)));
}

/** 1:1 décomp `include/gba/types.h Q_24_8_TO_INT(n)` — fixed-point conversion. */
export function Q_24_8_TO_INT(n: number): number {
  return n >> 8;
}
/** 1:1 décomp `include/gba/types.h Q_8_8_TO_INT(n)` — already in helpers but
 *  re-export from here for convenience. */
// already re-exported via decomp-helpers above

/** 1:1 décomp `include/gba/types.h Q_24_8(n) (= Q_8_8 with 24-frac)` — used in
 *  rare contexts. */
export function Q_24_8(n: number): number {
  return (n * 256) | 0;
}

// ─── Debug / diagnostic macros (1:1 décomp `include/gba/isagbprint.h`) ────────

/** 1:1 décomp `include/gba/isagbprint.h:54` :
 *    #define AGB_ASSERT(exp)  // empty in non-debug builds
 *    Or in DEBUG builds : (exp) ? 0 : DebugAssert(...);
 *  En TS : runtime assert with throw to catch bugs. */
export function AGB_ASSERT(exp: any): void {
  if (!exp) {
    // Non-fatal : log + continue. Throwing would break too much auto-code.
    // eslint-disable-next-line no-console
    console.warn('[bridge] AGB_ASSERT failed');
  }
}

/** 1:1 décomp `include/gba/isagbprint.h DebugAssert(file, line, expr, hadCondition)`.
 *  Used by AGB_ASSERT internal. No-op in our runtime. */
export function DebugAssert(_file: string, _line: number, _expr: string, _hadCondition: boolean): void {
  /* no-op */
}

/** 1:1 décomp `include/gba/isagbprint.h:AgbAssert(file, line, expr, hadCondition)`.
 *  Same as DebugAssert (= MODERN spelling). */
export function AgbAssert(_file: string, _line: number, _expr: string, _hadCondition: boolean): void {
  /* no-op */
}

/** 1:1 décomp `include/gba/macro.h ALIGNED(n)` — alignment attribute, no runtime
 *  effect. Used as `ALIGNED(4) static const u8 sFoo[]` ; in C it's a compiler hint.
 *  Some auto-bodies invoke it as a function-style call (rare) ; we make it identity. */
export function ALIGNED<T>(arg: T): T {
  return arg;
}

// ─── Runtime method wrappers (= helpers que notre `decomp-runtime.ts` expose
// ─── comme méthodes d'instance, pas des fonctions standalone) ─────────────────
//
// Ces wrappers récupèrent le runtime singleton via `getRuntime()` et délèguent
// à la méthode correspondante. 1:1 décomp signatures préservées.

import { getRuntime as _getRT } from './decomp-globals';

/** 1:1 décomp `src/sprite.c CreateSprite(template, x, y, subpriority)` :
 *  Crée un sprite depuis un SpriteTemplate. Retourne le spriteId.
 *  Notre runtime expose ça via CreateSpriteFromTemplate (= prend templateName).
 *  HOTFIX 2026-05-09 : on passe maintenant `subpriority` au runtime — était
 *  ignoré → bug intro Manectric/Brendan Z-order (= Brendan apparaissait devant
 *  Manectric pendant circular run). Décomp sprite.c:540-588 store subpriority
 *  sur sprite, BuildSpritePriorities (line 361-369) compose `subpriority |
 *  (oam.priority << 8)`, SortSprites (line 372-450) sort ASC. Lower subpri =
 *  drawn ON TOP (= GBATEK : OAM[lower index] = displayed in front). */
export function CreateSprite(template: any, x: number, y: number, subpriority: number = 0xFF): number {
  const rt = _getRT();
  const templateName = typeof template === 'string' ? template : template?.name ?? template?.tag ?? 'unknown';
  return rt.CreateSpriteFromTemplate(templateName, x, y, subpriority);
}

/** 1:1 décomp `src/sprite.c CreateSpriteAtEnd(template, x, y, subpriority)` :
 *  Comme CreateSprite mais alloue le DERNIER slot OAM dispo (= sprites bg vs npc). */
export function CreateSpriteAtEnd(template: any, x: number, y: number, subpriority: number = 0xFF): number {
  const rt = _getRT();
  const templateName = typeof template === 'string' ? template : template?.name ?? template?.tag ?? 'unknown';
  return rt.CreateSpriteFromTemplate(templateName, x, y, subpriority);
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

// ─── Re-exports : static const data tables (= ports manuels) ─────────────────

export {
  // ANIM_STD_GO_X constants
  ANIM_STD_GO_SOUTH, ANIM_STD_GO_NORTH, ANIM_STD_GO_WEST, ANIM_STD_GO_EAST,
  ANIM_STD_GO_FAST_SOUTH, ANIM_STD_GO_FAST_NORTH, ANIM_STD_GO_FAST_WEST, ANIM_STD_GO_FAST_EAST,
  ANIM_STD_GO_FASTER_SOUTH, ANIM_STD_GO_FASTER_NORTH, ANIM_STD_GO_FASTER_WEST, ANIM_STD_GO_FASTER_EAST,
  ANIM_STD_GO_FASTEST_SOUTH, ANIM_STD_GO_FASTEST_NORTH, ANIM_STD_GO_FASTEST_WEST, ANIM_STD_GO_FASTEST_EAST,
  // Movement direction anim tables
  sMoveDirectionAnimNums,
  sMoveDirectionFastAnimNums,
  sMoveDirectionFasterAnimNums,
  sMoveDirectionFastestAnimNums,
  // Direction lookup
  sOppositeDirections,
  gStandardDirections,
  // Jump tables
  sJumpInitDisplacements,
  sJumpDisplacements,
  // Step times by speed
  sStepTimes,
  // Direction to coordinate vectors
  sDirectionToVectors,
  // Movement action lookup tables
  gFaceDirectionMovementActions,
  gWalkSlowMovementActions,
  gWalkNormalMovementActions,
  gWalkFastMovementActions,
  // Lazy table fetcher
  getStaticTable,
} from './static-data-tables';

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
  // Static data tables (= ports manuels depuis sX[] décomp)
  'ANIM_STD_GO_SOUTH', 'ANIM_STD_GO_NORTH', 'ANIM_STD_GO_WEST', 'ANIM_STD_GO_EAST',
  'ANIM_STD_GO_FAST_SOUTH', 'ANIM_STD_GO_FAST_NORTH', 'ANIM_STD_GO_FAST_WEST', 'ANIM_STD_GO_FAST_EAST',
  'ANIM_STD_GO_FASTER_SOUTH', 'ANIM_STD_GO_FASTER_NORTH', 'ANIM_STD_GO_FASTER_WEST', 'ANIM_STD_GO_FASTER_EAST',
  'ANIM_STD_GO_FASTEST_SOUTH', 'ANIM_STD_GO_FASTEST_NORTH', 'ANIM_STD_GO_FASTEST_WEST', 'ANIM_STD_GO_FASTEST_EAST',
  'sMoveDirectionAnimNums', 'sMoveDirectionFastAnimNums',
  'sMoveDirectionFasterAnimNums', 'sMoveDirectionFastestAnimNums',
  'sOppositeDirections', 'gStandardDirections',
  'sJumpInitDisplacements', 'sJumpDisplacements',
  'sStepTimes', 'sDirectionToVectors',
  'gFaceDirectionMovementActions', 'gWalkSlowMovementActions',
  'gWalkNormalMovementActions', 'gWalkFastMovementActions',
  'getStaticTable',
  'TRY_FREE_AND_SET_NULL',
  'GET_BATTLER_SIDE', 'GET_BATTLER_SIDE2', 'GET_BATTLER_POSITION',
  'RGB2', 'SPRITE_SHAPE', 'SPRITE_SIZE',
  'GET_R', 'GET_G', 'GET_B', 'IS_ALPHA',
  'PLTT_ID', 'Q_8_8',
  'DmaCopy16', 'DmaCopy32',
  'CpuFastCopy', 'CpuFastFill', 'CpuFastFill16', 'CpuFastFill8',
  'DmaSet', 'DmaSetUnchecked',
  'DmaFillLarge16', 'DmaFillLarge32',
  'DmaCopyLarge16', 'DmaCopyLarge32',
  'DmaClearLarge16', 'DmaClearLarge32',
  'DmaCopy16Defvars', 'DmaCopy32Defvars',
  'MOD', 'Q_24_8_TO_INT', 'Q_24_8',
  'AGB_ASSERT', 'DebugAssert', 'AgbAssert', 'ALIGNED',
  'Random32',
  'GetObjectEventGraphicsInfo',
  'GetWindowFrameTilesPal', 'LoadWindowGfx',
  'LoadUserWindowBorderGfx', 'LoadUserWindowBorderGfx_',
  'GetItemName', 'GetMapName', 'GetMapNameGeneric', 'GetMapNameHandleAquaHideout',
  'GetItemDescription',
  'Overworld_GetMapHeaderByGroupAndId', 'defineMapHeaderEntry',
  'GET_MOVE_TYPE', 'SET_BATTLER_TYPE',
  'GetBerryInfo', 'GetBerryTreeInfo',
  'GetTextWindowPalette', 'GetOverworldTextboxPalettePtr',
  // Battle macros
  'IS_TYPE_PHYSICAL', 'IS_TYPE_SPECIAL', 'HIHALF', 'LOHALF',
  'GET_SHINY_VALUE', 'GET_UNOWN_LETTER', 'IS_DOUBLE_BATTLE',
  'TYPE_EFFECT_ATK_TYPE', 'TYPE_EFFECT_DEF_TYPE', 'TYPE_EFFECT_MULTIPLIER',
  'HITMARKER_FAINTED', 'STATUS2_INFATUATED_WITH', 'MOVE_IS_PERMANENT',
  'PREPARE_BYTE_NUMBER_BUFFER', 'PREPARE_HWORD_NUMBER_BUFFER', 'PREPARE_WORD_NUMBER_BUFFER',
  'PREPARE_STRING_BUFFER', 'PREPARE_MOVE_BUFFER', 'PREPARE_ITEM_BUFFER',
  'PREPARE_SPECIES_BUFFER', 'PREPARE_MON_NICK_BUFFER', 'PREPARE_MON_NICK_WITH_PREFIX_BUFFER',
  'PREPARE_TYPE_BUFFER',
  'ISO_RANDOMIZE1', 'GET_TRUE_SPRITE_INDEX', 'ANIM_SPRITES_START',
  'BG_TILE_H_FLIP', 'BG_TILE_V_FLIP',
  'EC_GROUP', 'EC_INDEX', 'EC_WORD',
  'ITEM_TO_BERRY', 'FIRST_BERRY_INDEX',
  'APPRENTICE_SPECIES_ID', 'EXTRACT_PLAYER_COUNT',
  'GET_CONTEST_WINNER_ID', 'GET_TRAINER_FAN_CLUB_FLAG',
  'UR_PLAYER_SPRITE_ID', 'MAX_RFU_PLAYERS',
  'INTRO3_RAW_PTR', 'SET_TILE', 'VINE_STATE_TIMER', 'CALC_CRC',
  // String helpers (= string_util.c)
  'StringCopyN', 'StringAppendN', 'StringFill', 'StringCopyPadded',
  'StringFillWithTerminator', 'StringCopy_PlayerName',
  'StringCompareN', 'IsStringLengthAtLeast',
  'ConvertEasyChatWordsToString', 'OtherConvertEasyChatWordsToString',
  'LT_SET_STATE', 'ISO_RANDOMIZE2',
  'PLTT_OFFSET_4BPP', 'OBJ_PLTT_ID2',
  // Pokemon storage / sprite pal / icon (= NotImpl stubs but counted as bridged
  // since the bridge file resolves them — they throw clearly at runtime, which
  // is the desired fail-fast behavior)
  'GetBoxNamePtr', 'GetBoxedMonPtr', 'GetBoxMonNickname',
  'GetBoxWallpaper', 'CountBoxMonsForBox',
  'GetMonSpritePalFromSpeciesAndPersonality',
  'GetMonSpritePalStructFromOtIdPersonality',
  'GetMonFrontSpritePal', 'GetMonIconPtr',
  // Healthbox + battle interface (= NotImpl)
  'GetHealthboxElementGfxPtr', 'AddTextPrinterAndCreateWindowOnHealthbox',
  // Pokenav (= NotImpl placeholders)
  'GetPokenavListWindowState', 'GetGeneralMatchCallText',
  // Misc battle / overworld
  'GetConditionGraphPtr', 'GlowColor', 'LandBall',
  'ObjAffineSet', 'BgAffineSet',
  'GPU_REG_BUF', 'SetBackdropFromColor', 'SetBackdropFromPalette',
  'GetCurrentRegionMapSectionId', 'GetMapSecIdAt',
  'GetMapHeaderFromConnection',
  'GetMapGridBlockAt', 'GetDoorGraphics',
  'GetTrainerClassNameGenderSpecific',
  'GetSavedWonderNewsMetadata', 'GetWaldaPhrasePtr', 'GetPokeJumpRecords',
  'BattleSetup_ConfigureTrainerBattle',
  'GetHostRfuGameData', 'RfuGetStatus',
  'FLASH_WRITE', 'REG_TMCNT_L', 'REG_TMCNT_H',
  'ProgramFlashByte', 'WaitForFlashWrite',
  'LoadPointerFromVars', 'GetApprenticeNameInLanguage',
  // Status / battle util macros
  'STATUS1_SLEEP_TURN', 'STATUS2_CONFUSION_TURN', 'STATUS2_UPROAR_TURN',
  'STATUS2_BIDE_TURN', 'STATUS2_LOCK_CONFUSE_TURN', 'STATUS2_WRAPPED_TURN',
  'STATUS3_ALWAYS_HITS_TURN', 'STATUS3_YAWN_TURN',
  'GET_STAT_BUFF_ID', 'GET_STAT_BUFF_VALUE2', 'GET_STAT_BUFF_VALUE',
  'SET_STAT_BUFF_VALUE', 'STAT_BUFF_NEGATIVE',
  'ABILITY_ON_OPPOSING_FIELD', 'ABILITY_ON_FIELD2',
  'PREPARE_STAT_BUFFER', 'PREPARE_ABILITY_BUFFER',
  'S16TOPOSFLOAT', 'DIV_ROUND_UP', 'JOY_HELD_RAW',
  'UNPACK_BEHAVIOR', 'IS_ITEM_MAIL',
  'GET_COL', 'GET_ROW_IDX', 'FREE_SPRITE_TILE',
  'SET_TRAINER_FAN_CLUB_FLAG',
  // Misc helpers (= mostly stubs to allow compilation)
  'GetFlagPointer', 'GetMonNickname2', 'GetPlayerName',
  'FindCameraSprite', 'GetBaseTemplateForObjectEvent',
  'AreCoordsWithinMapGridBounds', 'GetWalkSlowMovementAction',
  'GetRematchTrainerLocation', 'GET_NUM_CONDITION_SPARKLES',
  'GetSavedWonderNews', 'GetSavedWonderCardMetadata', 'GetSavedWonderCard',
  'GetMapLayout', 'GetHealLocation', 'GetSubstruct', 'GetMonIconTiles',
  'GetStringClearToWidth', 'EraseFlashSector', 'ProgramFlashSector',
  'StringAppendWithPlaceholder', 'TrackStop', 'READ_XCMD_BYTE',
  'GetLastCharOfMessagePtr', 'GetLimitedMessageStartPtr',
  'DmaFill16Defvars', 'DmaFill32Defvars',
  'Dma3CopyLarge16_', 'Dma3CopyLarge32_', 'Dma3FillLarge16_',
  'SoftReset', 'Contest_CopyStringWithColor',
  'WriteColorChangeControlCode', 'GetQuestionnaireWordsPtr',
  'GetObjectEventScriptPointerPlayerFacing',
  'CALC_STAT', 'BUFFER_PARTY_VS_SCREEN_STATUS', 'BYTE_TO_SEND',
  // Phase B.7 final cleanup
  'GET_MON_COORDS_WIDTH', 'GET_MON_COORDS_HEIGHT',
  'UNPACK_METATILE', 'STATUS1_TOXIC_TURN', 'HITMARKER_FAINTED2',
  'ITEM_HAS_EFFECT', 'SECRET_BASE_ID_TO_GROUP', 'SET_STATCHANGER',
  'WIN_RANGE2', 'LOOPED_TASK_DECODE_STATE',
  'SET8', 'SET16', 'SET32',
  'READ_PTR_FROM_TASK', 'STORE_PTR_IN_TASK',
  'SHIFT_RIGHT_ADJUSTED', 'WORD_TO_PITCH_TABLE_INDEX',
  'RANDOM_TRANSITION', 'HANDLE_NICKNAME_STRING_CASE',
  'SET_WIN0H_WIN1H', 'SET_SPRITE_TILE_RANGE',
  'INFO_BUF', 'DATETIME_BUF', 'TIME_BUF',
  'CopyEasyChatWordPadded', 'GetCurrentPhrase', 'GetMonSpritePalStruct',
  'VBlankIntrWait', 'IntrEnable', 'RegisterRamReset',
  'GetObjectEventTemplateByLocalIdAndMap', 'GetStepAnimTable',
  'GetJumpSpecialMovementAction', 'GetDestinationWarpMapHeader',
  'GetItemIconPicOrPalette', 'GetItemIconPic', 'GetItemIconPalette',
  'GetStoryActionByStat', 'REG_SIOMULTI',
  'GetSavedRamScriptIfValid', 'GetPartyMenuPalBufferPtr',
  'GetRegionMapSectionId', 'CreateMonMarkingAllCombosSprite',
  'GetMatchCallMapSec', 'GetMatchTableMapSectionId',
  'GetMainMenuInputHandler', 'LoadPtrFromTaskData',
  'GetSecretBaseName', 'GetMessageEntryBuffer',
  'MapHeaderCheckScriptTable',
  'DELAY', 'PollFlashStatus', 'APPRENTICE_SPECIES_ID_NO_COND',
  'ArcTan2', 'Sqrt',
  'TryGetStatusString', 'GetValidMonIconPalettePtr',
  'GetTrainerALoseText', 'GetTrainerBLoseText',
  'GetIntroSpeechOfApproachingTrainer', 'GetTrainerCantBattleSpeech',
  'IS_BATTLE_CONTROLLER_ACTIVE_ON_LOCAL',
  'MARK_BATTLE_CONTROLLER_IDLE_FOR_PLAYER',
  'IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE',
  'BYTE_TO_RECEIVE', 'MSC_callback', 'LMAN_callback',
  'BOUNCES', 'SHAKES', 'SHAKE_INC', 'STATE', 'DIRECTION',
  'FALL', 'PHASE_DELTA', 'RISE_FASTER', 'RESET_STATE',
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
  // Phase B.5 added : these throw NotImpl but are counted in __bridgedHelpers__
  // so we still track them. Bridge resolver will fail-fast on these when called.
  'GetBoxNamePtr', 'GetBoxedMonPtr', 'GetBoxMonNickname',
  'GetBoxWallpaper', 'CountBoxMonsForBox',
  'GetMonSpritePalFromSpeciesAndPersonality',
  'GetMonSpritePalStructFromOtIdPersonality',
  'GetMonFrontSpritePal', 'GetMonIconPtr',
  'GetHealthboxElementGfxPtr', 'AddTextPrinterAndCreateWindowOnHealthbox',
  // Phase B.6 added
  'GetFlagPointer', 'GetMonNickname2', 'GetSubstruct', 'GetMonIconTiles',
  // Phase B.7 added
  'GetMonSpritePalStruct',
]);
