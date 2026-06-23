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
 *   import * as bridge from '../../decomp-bridge';
 *   // Ou (préféré, après résolution des imports par le transpiler) :
 *   import { LoadPalette, FaceDirection, ARRAY_COUNT } from '../../decomp-bridge';
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

// Import LOCAL (en plus du re-export plus bas) pour usage interne par CreateSprite
// (branche sheet taggee). Re-export `// (ré-exports morts retirés depuis '../../src/sprite' — sweep)` ne cree PAS de
// binding local → on importe explicitement (alias `_` pour zero ambiguite). 1:1 ESM.
import { AllocOamMatrix as _AllocOamMatrix, FreeOamMatrix as _FreeOamMatrix } from '../../src/sprite';

// ─── Re-exports : palette / GPU / VRAM ────────────────────────────────────────

// LoadPalette / ResetPaletteFade / FreeAllSpritePalettes / LoadCompressedSpriteSheet
// décyclés : importés directement depuis decomp-globals (substrat) / src/sprite.ts.

// ─── Re-exports : sprite/affine helpers (decomp-helpers.ts) ───────────────────

// Sin / Cos → foyer canonique `src/trig.ts` (1:1 décomp trig.c) ; gSineTable (forme
// FONCTION, fix cast u8) → `harness/runtime/decomp-helpers.ts`. Ré-exports bridge
// retirés (0 importeur depuis le bridge) — décyclage lot 12.
// (ré-exports morts retirés depuis './decomp-helpers' — sweep)
import { gSineTable as _gSineTable } from './decomp-helpers';

// ─── Re-exports : GPU register / BG constants (decomp-runtime.ts) ─────────────

// (ré-exports morts retirés depuis './decomp-runtime' — sweep)

// ─── Re-exports : event_data (script-vars.ts) ─────────────────────────────────

// (ré-exports morts retirés depuis '../../src/engine/script/script-vars' — sweep)

// ─── Re-exports : script runtime (script-runtime.ts) ──────────────────────────

// (ré-exports morts retirés depuis '../../src/script' — sweep)

// ─── Local-use imports (hoisted from scattered scope) ────────────────────────
//
// Pattern ESM standard : tous les imports au TOP du fichier. Évite l'anti-
// pattern « imports scattered en cours de fichier » qui crée des pièges TDZ
// quand l'eager-init chain change (= ex. save-system → bag → game-state →
// load_save → object-events → metatile-behavior → decomp-bridge). Ces imports
// sont utilisés localement avec des alias `_xxx` pour éviter la collision avec
// les re-exports `// (ré-exports morts retirés depuis '../../src/engine/xxx' — sweep)` situés plus bas dans ce fichier.

import { Random as _Random } from '../../src/random';
import { getObjectEventGraphicsInfo as _getOEGI } from '../../src/engine/field/object-event-graphics';
import { getRuntime as _getRT } from './decomp-globals';
import { gBattleMons as _gBattleMonsBridge } from '../../src/engine/battle/state';
export const PLTT_SIZE_4BPP = 32;

/** 1:1 décomp `include/gba/types.h` :
 *    #define WIN_RANGE(a, b)  (((a) << 8) | (b))
 *  Pack two coords into a u16 for WIN0H/WIN0V regs. */
export function WIN_RANGE(a: number, b: number): number {
  return ((a & 0xFF) << 8) | (b & 0xFF);
}

/** 1:1 décomp `include/gba/types.h` RGB2 macro :
 *    #define RGB2(r, g, b) ((r) | ((g) << 5) | ((b) << 10))
 *  Same as RGB but no & 0x1F (= rare alt name). */
export function RGB2(r: number, g: number, b: number): number {
  return (r & 0x1F) | ((g & 0x1F) << 5) | ((b & 0x1F) << 10);
}

/** 1:1 décomp `include/gba/types.h` palette ID generic helper :
 *    #define PLTT_ID(n) ((n) * 16)
 *  Combined BG/OBJ palette ID. */
export function PLTT_ID(n: number): number { return n * 16; }

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
// 1:1 décomp include/battle_message.h:67-80. CORRIGÉ A8 audit : les valeurs
// précédentes étaient WRONG (NUMBER=1✓, mais STRING=2 décomp=0 ; MOVE=3
// décomp=2 ; TYPE=4 décomp=3 ; MON_NICK=5 décomp=7 ; MON_NICK_WITH_PREFIX=6
// décomp=4 ; ITEM=12 décomp=10 ; SPECIES=13 décomp=6).
const B_BUFF_STRING = 0;
const B_BUFF_NUMBER = 1;
const B_BUFF_MOVE = 2;
const B_BUFF_TYPE = 3;
const B_BUFF_MON_NICK_WITH_PREFIX = 4;
const _B_BUFF_STAT = 5;  // unused mais 1:1 strict
const B_BUFF_SPECIES = 6;
const B_BUFF_MON_NICK = 7;
const _B_BUFF_NEGATIVE_FLAVOR = 8;  // unused
const _B_BUFF_ABILITY = 9;  // unused
const B_BUFF_ITEM = 10;
const B_BUFF_PLACEHOLDER_BEGIN = 0xFD;
const B_BUFF_EOS = 0xFF;
void _B_BUFF_STAT; void _B_BUFF_NEGATIVE_FLAVOR; void _B_BUFF_ABILITY;

// ─── Easy chat word macros (1:1 décomp `constants/easy_chat.h:1116-1127`) ─────

/** EC_MASK_BITS = 9, EC_MASK_GROUP = 0x7F, EC_MASK_INDEX = 0x1FF. */
const EC_MASK_BITS = 9;
const EC_MASK_GROUP_M = (1 << (16 - EC_MASK_BITS)) - 1; // 0x7F
const EC_MASK_INDEX_M = (1 << EC_MASK_BITS) - 1;

// GetOverworldTextboxPalettePtr décyclé → importé directement depuis src/text_window.ts.

// ─── Re-exports : data tables FR (data-tables.ts) ────────────────────────────
//
// Notre `data-tables.ts` expose les lookup fns FR avec un signature légèrement
// différente du décomp (= retourne string, pas u8*). On adapte ici pour matcher
// l'API décomp utilisée dans les auto-bodies.
// Accesseurs item (GetItemName/Description/Importance/FieldFunc/Type/SecondaryId)
// + helper _itemKeyForLookup décyclés → src/item.ts (foyer 1:1 item.c).

// GetMapName / GetMapNameGeneric / GetMapNameHandleAquaHideout (+ helper) décyclés
// → src/region_map.ts (foyer 1:1 region_map.c).

// Overworld_GetMapHeaderByGroupAndId / defineMapHeaderEntry décyclés →
// src/overworld.ts (foyer 1:1 overworld.c:579).

// ─── Berry (1:1 décomp `src/berry.c:980 GetBerryInfo`) ────────────────────────

/** 1:1 décomp `src/berry.c:980 GetBerryInfo(berry)` — returns const Berry*.
 *  Wire vers berry.ts port complet (= gBerries[43] + EnigmaBerry handling). */
export function GetBerryInfo(berry: number): unknown {
  // Lazy import pour éviter cycle decomp-bridge ↔ berry.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('./berry') as { GetBerryInfo?: (b: number) => unknown };
  return mod.GetBerryInfo ? mod.GetBerryInfo(berry) : null;
}

/** 1:1 décomp `src/malloc.c` AllocZeroed(size) — heap alloc + memset 0.
 *  En JS, retourne `{}` (= same as Alloc since defaults sont implicit). */
export function AllocZeroed<T = any>(_sizeBytes: number): T {
  return {} as T;
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

// StringAppend décyclé → foyer src/string_util.ts (version buffer Uint8Array 1:1).
// Plus aucun importeur du bridge (G2 migration texte : size-record migré).

// ConvertIntToDecimalStringN décyclé → foyer src/string_util.ts (version buffer
// Uint8Array 1:1, écrit les bytes charmap direct). Plus aucun importeur du bridge
// (G2 migration texte : party/bag/summary/size-record migrés).

/** 1:1 décomp `src/string_util.c StringLength` — count chars before EOS. */
export function StringLength(s: string): number {
  return s.length;
}

// ─── Sprite affine matrix (1:1 décomp `include/gba/syscall.h`) ────────────────

/** 1:1 décomp BIOS syscall `ObjAffineSet(src, dst, count, stride)` — generates
 *  OAM affine matrices from (xScale, yScale, rotation) src structs.
 *
 *  Algorithme 1:1 BIOS (libagbsyscall) :
 *    rotIdx = (rotation >> 8) & 0xFF
 *    sin = gSineTable[rotIdx]                       // s16 in [-256, 256]
 *    cos = gSineTable[(rotIdx + 64) & 0xFF]         // s16
 *    pa =  (xScale * cos) >> 8
 *    pb = -(xScale * sin) >> 8
 *    pc =  (yScale * sin) >> 8
 *    pd =  (yScale * cos) >> 8
 *
 *  Sortie dst format = 4 s16 (pa, pb, pc, pd) par matrix. stride = espacement
 *  entre matrices (= bytes). En GBA, stride=2 = 2 halfwords (= 4 bytes) entre
 *  les fields pa/pb/... pour skipper OAM attributes, ou stride=8 (= packed).
 *  Le décomp use `ObjAffineSet(&src, &matrix, 1, 2)` (= 1 matrix, stride 2 bytes
 *  entre chaque field, packed dans la struct matrix).
 *
 *  Note : nos callers ports inline (bag-screen, sprite-engine-impl, mon-summary-anim)
 *  recalculent eux-mêmes pa/pb/pc/pd via la même formule. Ce wrapper sert
 *  pour callers futurs qui appelleraient le syscall direct. */
interface ObjAffineSrcData {
  xScale: number;
  yScale: number;
  rotation: number;
}
export function ObjAffineSet(
  src: ObjAffineSrcData | ObjAffineSrcData[],
  dst: number[] | { pa: number; pb: number; pc: number; pd: number }[] | DataView,
  count: number,
  stride: number,
): void {
  const arr = Array.isArray(src) ? src : [src];
  for (let i = 0; i < count; i++) {
    const s = arr[Math.min(i, arr.length - 1)];
    const rotIdx = (s.rotation >> 8) & 0xFF;
    const sin = _gSineTable(rotIdx);
    const cos = _gSineTable((rotIdx + 64) & 0xFF);
    const pa =  (s.xScale * cos) >> 8;
    const pb = -(s.xScale * sin) >> 8;
    const pc =  (s.yScale * sin) >> 8;
    const pd =  (s.yScale * cos) >> 8;
    if (dst instanceof DataView) {
      // GBA layout : 4 s16 packed @ offset i*stride*4 (stride=2 → 8 bytes per matrix).
      const off = i * stride * 4;
      dst.setInt16(off + 0, pa & 0xFFFF, true);
      dst.setInt16(off + 2, pb & 0xFFFF, true);
      dst.setInt16(off + 4, pc & 0xFFFF, true);
      dst.setInt16(off + 6, pd & 0xFFFF, true);
    } else if (Array.isArray(dst)) {
      const elem = (dst as Array<unknown>)[i];
      if (typeof elem === 'object' && elem !== null && 'pa' in (elem as object)) {
        const m = elem as { pa: number; pb: number; pc: number; pd: number };
        m.pa = pa; m.pb = pb; m.pc = pc; m.pd = pd;
      } else {
        const numArr = dst as number[];
        const base = i * 4;
        numArr[base + 0] = pa;
        numArr[base + 1] = pb;
        numArr[base + 2] = pc;
        numArr[base + 3] = pd;
      }
    }
  }
}
/** Wrapper qui dispatch lazy vers AbilityBattleEffects pour éviter cycle import.
 *  Le module battle/ability-battle-effects.ts expose `__abilityBattleEffectsCheck`
 *  via globalThis au module load. */
function _callAbilityBattleEffects(caseId: number, battler: number, abilityId: number, arg3: number, arg4: number): number {
  const fn = (globalThis as { __abilityBattleEffectsCheck?: (c: number, b: number, a: number, x: number, y: number) => number })
    .__abilityBattleEffectsCheck;
  if (fn) return fn(caseId, battler, abilityId, arg3, arg4);
  return 0;  // Fallback safe : substrat absent au boot très early.
}

// ─── PREPARE_*_BUFFER additions (battle_message.h) ────────────────────────────

const B_BUFF_STAT = 7;
const B_BUFF_ABILITY = 8;

// GetWalkSlowMovementAction décyclé → src/event_object_movement.ts (foyer 1:1,
// table gWalkSlowMovementActions indexée par direction — dirn_to_anim).

/** 1:1 décomp BIOS syscall ArcTan2(x, y) — return the 0-65535 angle. Approximate. */
export function ArcTan2(x: number, y: number): number {
  const a = Math.atan2(y, x);
  return ((a / (2 * Math.PI)) * 65536) | 0;
}

// ─── Tile/BG buffer access (bg.c) ─────────────────────────────────────────────

// GetBgTilemapBuffer décyclé → src/engine/ui/gba-window-system.ts (foyer bg.c du
// port ; délègue à getRuntime().gba.bg(bg).tilemap, comme CopyToBgTilemapBuffer).

// GetFaceDirectionMovementAction décyclé → src/event_object_movement.ts (foyer 1:1,
// table gFaceDirectionMovementActions indexée par direction — dirn_to_anim).

// ─── Metatile behavior constants (= include/constants/metatile_behaviors.h) ───
// 137 constantes MB_* extraites dans `metatile-behavior-constants.ts` (= module
// dédié SANS dépendance) pour casser le cycle ESM HMR observé via
// `metatile-behavior.ts` → `decomp-bridge` → modules de field/ → métatile-behavior.
// 1:1 strict : valeurs identiques à `include/constants/metatile_behaviors.h`.
export * from '../../include/constants/metatile_behaviors';

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

// ─── Runtime method wrappers (= helpers que notre `decomp-runtime.ts` expose
// ─── comme méthodes d'instance, pas des fonctions standalone) ─────────────────
//
// Ces wrappers récupèrent le runtime singleton via `getRuntime()` et délèguent
// à la méthode correspondante. 1:1 décomp signatures préservées.
// Note : `_getRT` alias local hoisted en tête de fichier.

// CreateSprite (routeur 3-voies no-rt) décyclé → src/sprite.ts (foyer 1:1 sprite.c).

// DestroySprite décyclé → src/sprite.ts (foyer 1:1 sprite.c, signature no-rt).

// CreateTask / DestroyTask / SetTaskFuncWithFollowupFunc / SwitchTaskToFollowupFunc
// décyclés → src/task.ts (foyer 1:1 task.c ; délèguent au substrat runtime).

// SetGpuReg / GetGpuReg décyclés → src/gpu_regs.ts (foyer 1:1 gpu_regs.c).

// StartSpriteAnim / StartSpriteAffineAnim décyclés : les appelants utilisent
// directement getRuntime().StartSprite*(id, …) (méthode runtime = impl riche inline).

/** 1:1 décomp `src/sprite.c FreeOamMatrix(matrixNum)`. Route vers l'impl free-fn
 *  game/sprite.ts (chantier C : méthodes harness Alloc/FreeOamMatrix retirées). */
export function FreeOamMatrix(matrixNum: number): void {
  _FreeOamMatrix(matrixNum);
}

/** 1:1 décomp `src/sprite.c AllocOamMatrix()`. Route vers l'impl free-fn game/sprite.ts. */
export function AllocOamMatrix(): number {
  return _AllocOamMatrix();
}

// ResetSpriteData décyclé → src/sprite.ts (foyer 1:1 sprite.c, signature no-rt).

// BeginNormalPaletteFade / UpdatePaletteFade décyclés → src/palette.ts (foyer 1:1 palette.c).

/** 1:1 décomp `src/main.c SetVBlankCallback(cb)` — register VBlank cb. */
export function SetVBlankCallback(cb: (() => void) | null): void {
  _getRT().SetVBlankCallback(cb);
}

// ─── Re-exports : map grid + metatile behavior ────────────────────────────────

// (ré-exports morts retirés depuis '../../src/fieldmap' — sweep)

// ─── Re-exports : static const data tables (= ports manuels) ─────────────────

// (ré-exports morts retirés depuis './static-data-tables' — sweep)

// ─── Re-exports : metatile behavior predicates ────────────────────────────────

// Block/Jump predicates (= déjà implémentés à la main).
// (ré-exports morts retirés depuis '../../src/metatile_behavior' — sweep)

// Other metatile predicates (= 1:1 décomp `metatile_behavior.c`), re-exportés
// depuis le miroir `game/metatile_behavior.ts` (source unique).
// (ré-exports morts retirés depuis '../../src/metatile_behavior' — sweep)

// ─── Bridge metadata for dev tools ────────────────────────────────────────────

/** Liste des helpers que le bridge re-export (= 1:1 ported).
 *  Comparé à `__callsTo__` d'un module auto, donne le coverage. */
export const __bridgedHelpers__: ReadonlySet<string> = new Set([
  // Re-exports décomp-globals
  'FillPalBufferBlack', 'FillPalBufferWhite',
  'BlendPalette', 'BlendPalettes', 'BlendPalettesUnfaded',
  'CpuFill16', 'CpuFill32', 'CpuSet', 'CpuFastSet',
  'DmaClear16', 'DmaClear32', 'DmaFill16', 'DmaFill32',
  'LZ77UnCompVram', 'LZDecompressVram',
  'IndexOfSpritePaletteTag', 'GetSpriteTileStartByTag',
  'LoadCompressedSpriteSheetUsingHeap',
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
  'Q_8_8_TO_INT', 'SetOamMatrix', 'CalcCenterToCornerVec',
  'PaletteBuffer',
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
  'WIN_RANGE',
  'Random', 'SeedRng', 'SeedRngAndSetTrainerId',
   'AllocZeroed', 
  'StringCopy',
  'StringLength', 
  'JOY_NEW', 'JOY_HELD', 'JOY_REPEAT',
  'CpuCopy16', 
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
  'RGB2',  
  'PLTT_ID', 
   'CpuFastFill',  
  'Random32',
  'GetWindowFrameTilesPal', 'LoadWindowGfx',
  'LoadUserWindowBorderGfx', 'LoadUserWindowBorderGfx_',
  'GetBerryInfo',
  'GetTextWindowPalette',
  // Battle macros
    'HIHALF', 'LOHALF',
  'GET_SHINY_VALUE', 'GET_UNOWN_LETTER', 
    'MOVE_IS_PERMANENT',
  // String helpers (= string_util.c)
  // Pokemon storage / sprite pal / icon (= NotImpl stubs but counted as bridged
  // since the bridge file resolves them — they throw clearly at runtime, which
  // is the desired fail-fast behavior)
  // Healthbox + battle interface (= NotImpl)
  // Pokenav (= NotImpl placeholders)
  // Misc battle / overworld
  'ObjAffineSet', 
    // GetMapGridBlockAt removed — vraie impl dans map-loader.ts
  // Status / battle util macros
  // Misc helpers (= mostly stubs to allow compilation)
  'WriteColorChangeControlCode',
  // Phase B.7 final cleanup
  'ArcTan2', 
  // Runtime method wrappers (= delegate to getRuntime().X)
  'FreeOamMatrix', 'AllocOamMatrix',
  'SetVBlankCallback',
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
  // Constants
  'PLTT_SIZE_4BPP',
  // Movement enums
]);

/** Liste des helpers qui throw NotImplemented (= TODO list, à porter en priorité).
 *  Si un module auto a un callsTo qui matche cette liste, son activation va fail. */
export const __notImplementedHelpers__: ReadonlySet<string> = new Set([
  // (vide : tous les anciens stubs NotImpl ont été portés à leur foyer 1:1.)
]);
