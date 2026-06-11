/**
 * battle-anim-interpreter.ts — Port 1:1 strict décomp `src/battle_anim.c` (1842l).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_anim.c`.
 *
 * Module manager pour battle animation scripts (= per-move visual + audio anims).
 * Wire bytecode `battle_anim_scripts-bytecode.ts` (333 labels, 5000 ops) au runtime.
 *
 * Structure :
 *   - EWRAM state vars (= C:92-114)
 *   - sScriptCmdTable[48] dispatch table (= C:118-168)
 *   - Init helpers : ClearBattleAnimationVars, LaunchBattleAnimation, DoMoveAnim
 *   - Runtime helpers : AddSpriteIndex, ClearSpriteIndex, BattleAnimAdjustPanning,
 *     CalculatePanIncrement, KeepPanInRange
 *   - Tick : RunAnimScriptCommand, WaitAnimFrameCount (= called per frame
 *     via gAnimScriptCallback)
 *   - 48 opcodes Cmd_* (= 1:1 strict décomp C:334-1841)
 *   - Sprite/BG helpers : MoveBattlerSpriteToBG, FlipBattlerBgTiles,
 *     ResetBattleAnimBg, RelocateBattleBgPal, LoadMoveBg, LoadDefaultBg
 *   - Tasks : Task_InitUpdateMonBg, Task_UpdateMonBg, Task_ClearMonBg,
 *     Task_ClearMonBgStatic, Task_FadeToBg, Task_PanFromInitialToTarget,
 *     Task_LoopAndPlaySE, Task_WaitAndPlaySE
 *
 * Dépendances cascade :
 *   - bytecode tables : `auto-asm-bytecode/data/battle_anim_scripts-bytecode.ts`
 *     (gBattleAnims_Moves table addresses).
 *   - Sprite system : CreateSpriteAndAnimate, GetBattlerSpriteCoord,
 *     GetBattlerSpriteSubpriority, gBattlerSpriteIds (= battle_anim_mons.c).
 *   - Task system : CreateTask, DestroyTask, gTasks (= runtime).
 *   - Audio : PlaySE12WithPanning, SE12PanpotControl (= sound.c).
 *   - Palette : BeginHardwarePaletteFade, gPaletteFade (= palette.c).
 *
 * Divergences architecturales :
 *   - Le décomp utilise C pointer arithmetic (sBattleAnimScriptPtr++, T1_READ_16,
 *     T2_READ_32). Notre TS : `_pc` (= byte offset dans BYTECODE Uint8Array).
 *   - sScriptCmdTable = function array of 48 entries indexed par opcode byte.
 *     Notre TS : array of arrow functions, dispatch via `sScriptCmdTable[opcode]()`.
 *   - Battle anim BG tables (gBattleAnimBackgroundTable) : extraction asset
 *     déférée — LoadMoveBg/LoadDefaultBg implementations stubbed jusqu'à
 *     extraction des tilemaps + palettes des 27 BGs.
 *   - Le bytecode bytes sont stored Uint8Array `BYTECODE` ; les ADDRESSES de
 *     scripts sont OFFSETS dans cet array (= remplace pointer C par offset).
 *     LABELS Record<string, number> contient les noms `gBattleAnims_Moves`,
 *     `Move_TACKLE`, etc. Lookup via `LABELS.gBattleAnims_Moves` puis sub-table
 *     iteration via `T2_READ_32` qui devient `read32(offset)`.
 */

import { CreateTask, DestroyTask as _DestroyTaskRaw , CreateSprite as _CreateSpriteByTemplate} from '../system/decomp-bridge';
import { getRuntime, TASK_NONE, FreeSpriteTilesByTag } from '../system/decomp-globals';
import { FreeSpritePaletteByTag } from '../system/sprite';
import { gBattlerAttacker, gBattlerTarget, gBattleTypeFlags, MAX_BATTLERS_COUNT } from './state';
import { GetBattlerPosition, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT } from './util';
import {
  B_SIDE_PLAYER, B_SIDE_OPPONENT, BIT_SIDE, BIT_FLANK,
  BATTLE_TYPE_DOUBLE,
} from './constants';
import { BYTECODE as ANIM_BYTECODE, LABELS as ANIM_LABELS } from '../decomp-data/auto-asm-bytecode/data/battle_anim_scripts-bytecode';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS (= include/constants/battle_anim.h + battle_anim.c #defines)
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `#define ANIM_SPRITE_INDEX_COUNT 8` (battle_anim.c:26). */
const ANIM_SPRITE_INDEX_COUNT = 8;

/** 1:1 décomp `#define ANIM_ARGS_COUNT 8` (constants/battle_anim.h). */
export const ANIM_ARGS_COUNT = 8;

/** 1:1 décomp constants/battle_anim.h ANIM_ATTACKER / ANIM_TARGET. */
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_ATK_PARTNER = 2;
export const ANIM_DEF_PARTNER = 3;

/** 1:1 décomp constants/battle_anim.h ANIMSPRITE_IS_TARGET. */
const ANIMSPRITE_IS_TARGET = 0x80;

/** Pan values (1:1 décomp constants/sound.h). */
export const SOUND_PAN_ATTACKER = -64;
export const SOUND_PAN_TARGET = 63;

/** BATTLE_PARTNER macro (= flank XOR). */
function BATTLE_PARTNER(id: number): number {
  return id ^ BIT_FLANK;
}

/** Helper IsDoubleBattle (1:1 décomp battle_util.c). */
function IsDoubleBattle(): boolean {
  return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;
}

/** GetBattlerSide (1:1 décomp battle_anim_mons.c). */
function GetBattlerSide(battler: number): number {
  return GetBattlerPosition(battler) & BIT_SIDE;
}

/** 1:1 décomp `IsContest()` (battle_anim.c:1102-1108) :
 *  return !gMain.inBattle. Notre TS : on n'a pas de contest mode, retourne false. */
function IsContest(): boolean {
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// EWRAM STATE (= battle_anim.c:92-114)
// ═══════════════════════════════════════════════════════════════════════════

/** Helper : safe lookup d'un task entry via runtime gTasks Map. */
/** Accepte taskId NUMBER ou l'OBJET DecompTask (le runtime tick fn(taskObjet) —
 *  T4 : les anim-tasks recevaient l'objet, _gTasks(objet) -> DUMMY -> state
 *  machine figee -> waitbgfadein bloquait a jamais). */
function _taskIdOf(x: number | { taskId?: number }): number {
  return typeof x === 'number' ? x : (x?.taskId ?? -1);
}
function _gTasks(taskId: number | { taskId?: number; data?: unknown }): { data: Int16Array | number[]; func: ((id: number) => void) | null } {
  if (typeof taskId === 'object' && taskId && (taskId as { data?: unknown }).data) {
    return taskId as unknown as { data: Int16Array | number[]; func: ((id: number) => void) | null };
  }
  const rt = getRuntime();
  if (!rt) return _DUMMY_TASK;
  const t = rt.gTasks?.get(_taskIdOf(taskId));
  return (t ?? _DUMMY_TASK) as unknown as { data: Int16Array | number[]; func: ((id: number) => void) | null };
}
function DestroyTask(taskId: number | { taskId?: number }): void {
  _DestroyTaskRaw(_taskIdOf(taskId));
}
const _DUMMY_TASK = { data: new Int16Array(16) as Int16Array | number[], func: null };

/** Bytecode PC (= sBattleAnimScriptPtr ; en C: pointer, en TS: byte offset). */
let _pc = 0;

/** Return address pour Cmd_call/Cmd_return (= sBattleAnimScriptRetAddr). */
let _retAddr = 0;

/** Active script callback : RunAnimScriptCommand ou WaitAnimFrameCount.
 *  1:1 décomp `void (*gAnimScriptCallback)(void)`. */
export let gAnimScriptCallback: (() => void) | null = null;

/** Frame counter pour delays (= sAnimFramesToWait). s8 dans le décomp. */
let sAnimFramesToWait = 0;

/** Active flag (= gAnimScriptActive). */
export let gAnimScriptActive = false;
// Sprites crees par le SCRIPT en cours (purge a la terminaison — garde-fou :
// le decomp exige les sprites d'anim morts avant `end` via waitforvisualfinish ;
// un survivant = anomalie slot/callback ecrase -> orphelin OAM, bug particules).
const _scriptSpriteIds: Array<{ id: number; ref: unknown }> = [];

/** Compteur tasks visuelles actives (= gAnimVisualTaskCount). */
export let gAnimVisualTaskCount = 0;

/** Compteur tasks sound actives (= gAnimSoundTaskCount). */
export let gAnimSoundTaskCount = 0;

/** Disable struct pointer pour bind-target tracking. Pas wirée pour now. */
export let gAnimDisableStructPtr: unknown | null = null;

/** Anim damage value (= gAnimMoveDmg, passed via script). */
export let gAnimMoveDmg = 0;

/** Anim move power (= gAnimMovePower). */
export let gAnimMovePower = 0;

/** Tracking des 8 sprite indices alloués durant cette anim (= sAnimSpriteIndexArray).
 *  Init à 0xFFFF (sentinel = libre), populée par AddSpriteIndex. */
const sAnimSpriteIndexArray = new Uint16Array(ANIM_SPRITE_INDEX_COUNT);

/** Anim friendship (passed to evolution Cmd_choosetwoturnanim). */
export let gAnimFriendship = 0;

/** Weather move anim (= gWeatherMoveAnim). */
export let gWeatherMoveAnim = 0;

import {
  gBattleAnims_Moves as _TBL_MOVES, gBattleAnims_StatusConditions as _TBL_STATUS,
  gBattleAnims_General as _TBL_GENERAL, gBattleAnims_Special as _TBL_SPECIAL,
} from '../decomp-data/battle-anim-tables';
import { animSymbolName, lookupAnimTask, lookupAnimTemplate } from './battle-anim-registry';

const _ANIM_NAME_TABLES: Record<string, ReadonlyArray<string>> = {
  gBattleAnims_Moves: _TBL_MOVES,
  gBattleAnims_StatusConditions: _TBL_STATUS,
  gBattleAnims_General: _TBL_GENERAL,
  gBattleAnims_Special: _TBL_SPECIAL,
};

/** Anim args array [8] passée via Cmd_setarg + Cmd_createsprite (= gBattleAnimArgs). */
export const gBattleAnimArgs = new Int16Array(ANIM_ARGS_COUNT);

/** Sound anim frame counter (= sSoundAnimFramesToWait, used by Cmd_end + Cmd_waitsound). */
let sSoundAnimFramesToWait = 0;

/** Mon BG anim task IDs (= sMonAnimTaskIdArray[2]). 0xFF = TASK_NONE. */
const sMonAnimTaskIdArray: number[] = [TASK_NONE, TASK_NONE];

/** Move turn counter (= gAnimMoveTurn, used by Cmd_choosetwoturnanim/jumpifmoveturn). */
export let gAnimMoveTurn = 0;

/** BG fade state machine (= sAnimBackgroundFadeState).
 *  0 = idle, 1 = fade-out started, 2 = fade-out done loading BG, 3 = fade-in done. */
let sAnimBackgroundFadeState = 0;

/** Move index (= sAnimMoveIndex, set in LaunchBattleAnimation but unused). */
let sAnimMoveIndex = 0;

/** Attacker battler index (= gBattleAnimAttacker). */
export let gBattleAnimAttacker = 0;

/** Target battler index (= gBattleAnimTarget). */
export let gBattleAnimTarget = 0;

/** Battler species cache pour anims (= gAnimBattlerSpecies[MAX_BATTLERS_COUNT]). */
export const gAnimBattlerSpecies = new Uint16Array(MAX_BATTLERS_COUNT);

/** Custom panning override (= gAnimCustomPanning). */
export let gAnimCustomPanning = 0;

// ═══════════════════════════════════════════════════════════════════════════
// BYTECODE READ HELPERS (= T1_READ_16, T2_READ_32, T2_READ_PTR macros)
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `T1_READ_16` : little-endian u16 read à PC offset.
 *  T1 = aligned access (= valid sur all platforms). */
function read16(off: number): number {
  return ANIM_BYTECODE[off] | (ANIM_BYTECODE[off + 1] << 8);
}

/** 1:1 décomp `T2_READ_32` : little-endian u32 read à PC offset.
 *  T2 = unaligned-safe access. Nous c'est tjs little-endian. */
function read32(off: number): number {
  return (ANIM_BYTECODE[off]
    | (ANIM_BYTECODE[off + 1] << 8)
    | (ANIM_BYTECODE[off + 2] << 16)
    | (ANIM_BYTECODE[off + 3] << 24)) >>> 0;
}

/** 1:1 décomp `T2_READ_PTR` : u32 read en tant que pointer. En TS = offset
 *  dans BYTECODE. Le compilateur asm→bytecode résout les labels en offsets. */
function readPtr(off: number): number {
  return read32(off);
}

/** Read u8 byte. */
function read8(off: number): number {
  return ANIM_BYTECODE[off];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS : Sprite Index tracking + Wait callback
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `AddSpriteIndex(u16 index)` (battle_anim.c:285-297).
 *  Track sprite gfx index dans le slot first-free de sAnimSpriteIndexArray.
 *  0xFFFF = libre. */
function AddSpriteIndex(index: number): void {
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    if (sAnimSpriteIndexArray[i] === 0xFFFF) {
      sAnimSpriteIndexArray[i] = index;
      return;
    }
  }
}

/** 1:1 décomp `ClearSpriteIndex(u16 index)` (battle_anim.c:299-311).
 *  Remove sprite gfx index du tracking array. */
function ClearSpriteIndex(index: number): void {
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    if (sAnimSpriteIndexArray[i] === index) {
      sAnimSpriteIndexArray[i] = 0xFFFF;
      return;
    }
  }
}

/** 1:1 décomp `WaitAnimFrameCount` (battle_anim.c:313-324).
 *  Decrement frame counter, re-enable RunAnimScriptCommand quand expired. */
function WaitAnimFrameCount(): void {
  if (sAnimFramesToWait <= 0) {
    gAnimScriptCallback = RunAnimScriptCommand;
    sAnimFramesToWait = 0;
  } else {
    sAnimFramesToWait--;
  }
}

/** 1:1 décomp `RunAnimScriptCommand` (battle_anim.c:326-332).
 *  Loop : dispatch sur sScriptCmdTable[opcode] tant que pas en wait state. */
function RunAnimScriptCommand(): void {
  // 1:1 strict décomp : do-while. + garde-fou bornes (T4) : un PC hors du
  // buffer (offset non resolu/jump marqueur) terminait en crash-loop chaque
  // frame -> terminer le script PROPREMENT (l'anim s'arrete, le tour continue).
  do {
    if (_pc < 0 || _pc >= ANIM_BYTECODE.length) {
      console.warn(`[battle-anim] PC hors bornes (${_pc}/${ANIM_BYTECODE.length}) — script termine (dette).`);
      gAnimScriptActive = false;
      _purgeScriptSprites();
      sAnimFramesToWait = 0;
      return;
    }
    const opcode = ANIM_BYTECODE[_pc];
    const fn = sScriptCmdTable[opcode];
    if (!fn) {
      console.warn(`[battle-anim] unknown opcode 0x${(opcode ?? -1).toString(16)} @ PC ${_pc} — script termine (dette).`);
      gAnimScriptActive = false;
      _purgeScriptSprites();
      sAnimFramesToWait = 0;
      return;
    }
    fn();
  } while (sAnimFramesToWait === 0 && gAnimScriptActive);
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API : ClearBattleAnimationVars + LaunchBattleAnimation + DoMoveAnim
// ═══════════════════════════════════════════════════════════════════════════

/** Purge les sprites du script termine encore vivants (anomalie -> destroy).
 *  Les sprites legitimes sont morts avant `end` (waitforvisualfinish 1:1). */
function _purgeScriptSprites(): void {
  const rt = getRuntime();
  if (rt) {
    for (const e of _scriptSpriteIds) {
      const sp = rt.gSprites?.get(e.id);
      // IDENTITE obligatoire : l'id peut etre recycle par un sprite SYSTEME
      // (healthbox re-render pendant l'anim) — detruire par id nu detruisait
      // la healthbox (paye 2026-06-11). On ne purge que NOTRE objet.
      if (sp && (sp as unknown) === e.ref && (sp as { inUse?: boolean }).inUse !== false) {
        try { rt.DestroySprite(e.id); } catch { /* deja mort */ }
      }
    }
  }
  _scriptSpriteIds.length = 0;
}

/** 1:1 décomp `ClearBattleAnimationVars` (battle_anim.c:170-199).
 *  Reset complet de l'état battle anim. Appelé entre les anims pour s'assurer
 *  qu'aucune leak n'arrive. */
export function ClearBattleAnimationVars(): void {
  sAnimFramesToWait = 0;
  gAnimScriptActive = false;
  _purgeScriptSprites();
  gAnimVisualTaskCount = 0;
  gAnimSoundTaskCount = 0;
  gAnimDisableStructPtr = null;
  gAnimMoveDmg = 0;
  gAnimMovePower = 0;
  gAnimFriendship = 0;

  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    sAnimSpriteIndexArray[i] = 0xFFFF;
  }
  for (let i = 0; i < ANIM_ARGS_COUNT; i++) {
    gBattleAnimArgs[i] = 0;
  }

  sMonAnimTaskIdArray[0] = TASK_NONE;
  sMonAnimTaskIdArray[1] = TASK_NONE;
  gAnimMoveTurn = 0;
  sAnimBackgroundFadeState = 0;
  sAnimMoveIndex = 0;
  gBattleAnimAttacker = 0;
  gBattleAnimTarget = 0;
  gAnimCustomPanning = 0;
}

/** 1:1 décomp `DoMoveAnim(u16 move)` (battle_anim.c:201-206).
 *  Wrap LaunchBattleAnimation : init attacker/target from current state,
 *  lookup script via gBattleAnims_Moves[move]. */
export function DoMoveAnim(move: number): void {
  gBattleAnimAttacker = gBattlerAttacker;
  gBattleAnimTarget = gBattlerTarget;
  LaunchBattleAnimation('gBattleAnims_Moves', move, true);
}

/** Resolve table address → script address pour move/anim tableId.
 *  En décomp : `animsTable[tableId]` (= array of pointers de 4 bytes chacun).
 *  En TS : table label → base offset, puis +tableId*4 → 32-bit script offset. */
function _resolveAnimScript(tableLabel: string, tableId: number): number {
  // T4 : les tables de POINTEURS (.4byte) ne sont PAS compilees dans le
  // bytecode (data omise) -> l'ancienne lecture read32(base+id*4) lisait le
  // DEBUT du flux comme une table = garbage (racine du « 0/415 anims »).
  // Resolution par TABLES DE NOMS (battle-anim-tables.ts, 1:1 .s) -> offset.
  const table = _ANIM_NAME_TABLES[tableLabel];
  if (!table) {
    console.warn(`[battle-anim] table label "${tableLabel}" not found`);
    return -1;
  }
  const name = table[tableId];
  if (!name) {
    console.warn(`[battle-anim] ${tableLabel}[${tableId}] hors table (len=${table.length})`);
    return -1;
  }
  const off = ANIM_LABELS[name];
  if (off === undefined) {
    console.warn(`[battle-anim] label "${name}" absent du bytecode`);
    return -1;
  }
  return off;
}

/** 1:1 décomp `LaunchBattleAnimation(animsTable, tableId, isMoveAnim)` (battle_anim.c:208-264).
 *
 *  Lance une battle anim depuis un table label + index. Pour MOVE anims,
 *  utilise 'gBattleAnims_Moves' table. Pour status/general anims, autres tables.
 *
 *  Si isMoveAnim ET le move est dans gMovesWithQuietBGM, baisse le BGM volume
 *  à 128/256 (= half). */
export function LaunchBattleAnimation(
  animsTableLabel: string,
  tableId: number,
  isMoveAnim: boolean,
): void {
  const scriptOffset = _resolveAnimScript(animsTableLabel, tableId);
  if (scriptOffset < 0 || scriptOffset >= ANIM_BYTECODE.length) {
    console.warn(`[battle-anim] script offset out of range for ${animsTableLabel}[${tableId}] = ${scriptOffset}`);
    gAnimScriptActive = false;
    return;
  }

  // 1:1 décomp C:212-228 : init species cache pour visible battlers.
  if (!IsContest()) {
    // InitPrioritiesForVisibleBattlers + UpdateOamPriorityInAllHealthboxes deferred
    // (= déjà gérés par notre battle-flow ; pas critique pour l'anim runner).
    // TODO porter quand healthbox depth handling sera porté complet.
    // for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    //   if (GetBattlerSide(i) !== B_SIDE_PLAYER) {
    //     gAnimBattlerSpecies[i] = GetMonData(gEnemyParty[gBattlerPartyIndexes[i]], MON_DATA_SPECIES);
    //   } else {
    //     gAnimBattlerSpecies[i] = GetMonData(gPlayerParty[gBattlerPartyIndexes[i]], MON_DATA_SPECIES);
    //   }
    // }
  }

  // 1:1 décomp C:230-233 : sAnimMoveIndex tracking.
  if (!isMoveAnim) sAnimMoveIndex = 0;
  else sAnimMoveIndex = tableId;

  // 1:1 décomp C:235-236 : reset args.
  for (let i = 0; i < ANIM_ARGS_COUNT; i++) gBattleAnimArgs[i] = 0;

  // 1:1 décomp C:238-243 : init script pointer + callback.
  sMonAnimTaskIdArray[0] = TASK_NONE;
  sMonAnimTaskIdArray[1] = TASK_NONE;
  _pc = scriptOffset;
  gAnimScriptActive = true;
  sAnimFramesToWait = 0;
  gAnimScriptCallback = RunAnimScriptCommand;

  // 1:1 décomp C:245-246 : reset sprite index array.
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    sAnimSpriteIndexArray[i] = 0xFFFF;
  }

  // 1:1 décomp C:248-258 : quiet BGM check pour moves bruyants (SING/PERISH_SONG/etc.).
  // Notre TS : volume control via m4a wrapper, déféré (= pas critique anim).
  if (isMoveAnim) {
    // gMovesWithQuietBGM[] terminator 0xFFFF.
    // Pour now skip — BGM volume control deferred jusqu'au m4a full wire.
  }

  // 1:1 décomp C:260-263 : reset window mask registers.
  const rt = getRuntime();
  if (rt) {
    rt.SetGpuReg(0x40, 0); // WIN0H
    rt.SetGpuReg(0x44, 0); // WIN0V
    rt.SetGpuReg(0x42, 0); // WIN1H
    rt.SetGpuReg(0x46, 0); // WIN1V
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API : DestroyAnimSprite / DestroyAnimVisualTask / DestroyAnimSoundTask
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `DestroyAnimSprite(struct Sprite *sprite)` (battle_anim.c:266-271).
 *  Free OAM matrix + destroy sprite + decrement visual task count. */
export function DestroyAnimSprite(spriteOrId: number | object): void {
  const rt = getRuntime();
  if (!rt) return;
  // FIX user 2026-06-11 (« les animations restent bloquees sur la scene ») :
  // les callbacks registry passent l OBJET sprite ; la version id-only faisait
  // gSprites.get(objet)=undefined -> DestroySprite(objet)=no-op SILENCIEUX ->
  // les sprites d anim restaient a l ecran. Accepte objet|id (pattern _gTasks).
  let spriteId = typeof spriteOrId === 'number' ? spriteOrId : -1;
  if (spriteId < 0 && rt.gSprites) {
    const direct = (spriteOrId as { spriteId?: number }).spriteId;
    if (direct !== undefined && direct >= 0) spriteId = direct;
    else {
      for (const [sid, sp] of rt.gSprites.entries()) {
        if ((sp as unknown) === spriteOrId) { spriteId = sid; break; }
      }
    }
  }
  if (spriteId < 0) return;
  const sprite = rt.gSprites.get(spriteId);
  if (sprite && sprite.matrixNum !== 0) {
    rt.FreeOamMatrix(sprite.matrixNum);
  }
  try { rt.DestroySprite(spriteId); } catch (e) { void e; }
  // PAS de gSprites.delete : le runtime garde le slot jusqu'a reallocation
  // (1:1 decomp — le delete cassait la healthbox composee, fix user 2026-06-11).
  if (gAnimVisualTaskCount > 0) gAnimVisualTaskCount--;
}

/** 1:1 décomp `DestroyAnimVisualTask(u8 taskId)` (battle_anim.c:273-277). */
export function DestroyAnimVisualTask(taskId: number): void {
  DestroyTask(taskId);
  if (gAnimVisualTaskCount > 0) gAnimVisualTaskCount--;
}

/** 1:1 décomp `DestroyAnimSoundTask(u8 taskId)` (battle_anim.c:279-283). */
export function DestroyAnimSoundTask(taskId: number): void {
  DestroyTask(taskId);
  if (gAnimSoundTaskCount > 0) gAnimSoundTaskCount--;
}

// ═══════════════════════════════════════════════════════════════════════════
// PANNING HELPERS (= battle_anim.c:1263-1346)
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `BattleAnimAdjustPanning(s8 pan)` (battle_anim.c:1263-1303).
 *  Adapt panning selon side du attacker/target + contest. */
export function BattleAnimAdjustPanning(pan: number): number {
  // healthBoxesData[gBattleAnimAttacker].statusAnimActive check deferred (= statusAnimActive
  // flag tracking pas wired). Pour now : prend le default path.
  if (IsContest()) {
    if (gBattleAnimAttacker !== gBattleAnimTarget || gBattleAnimAttacker !== 2 || pan !== SOUND_PAN_TARGET) {
      pan *= -1;
    }
  } else if (GetBattlerSide(gBattleAnimAttacker) === B_SIDE_PLAYER) {
    if (GetBattlerSide(gBattleAnimTarget) === B_SIDE_PLAYER) {
      if (pan === SOUND_PAN_TARGET) pan = SOUND_PAN_ATTACKER;
      else if (pan !== SOUND_PAN_ATTACKER) pan *= -1;
    }
  } else if (GetBattlerSide(gBattleAnimTarget) === B_SIDE_OPPONENT) {
    if (pan === SOUND_PAN_ATTACKER) pan = SOUND_PAN_TARGET;
  } else {
    pan *= -1;
  }
  if (pan > SOUND_PAN_TARGET) pan = SOUND_PAN_TARGET;
  else if (pan < SOUND_PAN_ATTACKER) pan = SOUND_PAN_ATTACKER;
  return pan;
}

/** 1:1 décomp `BattleAnimAdjustPanning2(s8 pan)` (battle_anim.c:1305-1320). */
export function BattleAnimAdjustPanning2(pan: number): number {
  if (GetBattlerSide(gBattleAnimAttacker) !== B_SIDE_PLAYER || IsContest()) {
    pan = -pan;
  }
  return pan;
}

/** 1:1 décomp `KeepPanInRange(s16 panArg, int oldPan)` (battle_anim.c:1322-1332). */
export function KeepPanInRange(panArg: number, _oldPan: number): number {
  let pan = panArg;
  if (pan > SOUND_PAN_TARGET) pan = SOUND_PAN_TARGET;
  else if (pan < SOUND_PAN_ATTACKER) pan = SOUND_PAN_ATTACKER;
  return pan;
}

/** 1:1 décomp `CalculatePanIncrement(s16 source, s16 target, s16 increment)` (battle_anim.c:1334-1346). */
export function CalculatePanIncrement(sourcePan: number, targetPan: number, incrementPan: number): number {
  if (sourcePan < targetPan) return (incrementPan < 0 ? -incrementPan : incrementPan);
  if (sourcePan > targetPan) return -(incrementPan < 0 ? -incrementPan : incrementPan);
  return 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO WRAPPERS
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `PlaySE12WithPanning(songId, pan)`. Wraps notre PlaySE. */
function PlaySE12WithPanning(songId: number, _pan: number): void {
  // Panning effect deferred (= notre PlaySE n'a pas stereo panning wired).
  void import('../system/decomp-globals').then(({ PlaySE }) => PlaySE(songId));
}

/** 1:1 décomp `SE12PanpotControl(pan)`. Adjust panning of active SE channel. */
function SE12PanpotControl(_pan: number): void {
  // Deferred : pas wirée jusqu'à m4a panning wire.
}

/** 1:1 décomp `IsSEPlaying()`. */
function IsSEPlaying(): boolean {
  // Wrapper : on consulte audio state si dispo, sinon false (= permet Cmd_end
  // de progresser sans bloquer sur SE).
  return false;
}

/** 1:1 décomp `m4aMPlayStop(&gMPlayInfo_SEx)`. */
function m4aMPlayStop_SE(): void {
  // Deferred — pas critique pour le runner.
}

/** 1:1 décomp `m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, vol)`. */
function m4aMPlayVolumeControl_BGM(_vol: number): void {
  // Volume control déféré.
}

// ═══════════════════════════════════════════════════════════════════════════
// BG ANIM HELPERS (= battle_anim.c:668-810)
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `IsBattlerSpriteVisible(u8 battler)` (battle_anim.c:649-666). */
export function IsBattlerSpriteVisible(_battler: number): boolean {
  // gBattleSpritesDataPtr access deferred — return true par défaut
  // (= permet aux opcodes monbg/clearmonbg de fonctionner).
  return true;
}

/** 1:1 décomp `MoveBattlerSpriteToBG(battler, toBG_2, setSpriteInvisible)` (battle_anim.c:668-749).
 *  Move battler sprite vers BG1 ou BG2 pour permettre des affine BG anims
 *  pendant l'attack. Complexe : need DMA tile copy + palette relocate + BG offsets.
 *  Implementation déférée (= pas critique pour anim runner basique). */
export function MoveBattlerSpriteToBG(_battler: number, _toBG_2: boolean, _setSpriteInvisible: boolean): void {
  // Deferred port — `DrawBattlerOnBg` cascade depends on battle_interface.c which
  // is partially ported. The interpreter runs without monbg manipulation but
  // certain move anims (= those who morph the battler sprite via affine BG)
  // may render incorrectly. Track via TODO.
}

/** 1:1 décomp `ResetBattleAnimBg(bool8 toBG2)` (battle_anim.c:794-811).
 *  Clear BG1 ou BG2 + reset scroll offsets. */
export function ResetBattleAnimBg(_toBG2: boolean): void {
  // Deferred — voir MoveBattlerSpriteToBG.
}

/** 1:1 décomp `LoadMoveBg(u16 bgId)` (battle_anim.c:1185-1207).
 *  Décompresse + load BG tilemap/tiles/palette depuis gBattleAnimBackgroundTable[bgId]. */
function LoadMoveBg(_bgId: number): void {
  // Asset extraction deferred — `gBattleAnimBackgroundTable` data not extracted yet.
  // 27 BGs total (DARK/GHOST/PSYCHIC/IMPACT_OPPONENT/IMPACT_PLAYER/DRILL/THUNDER/ICE/SOLAR_BEAM_*/etc.).
  // À extract via scripts/extract-*.mjs.
}

/** 1:1 décomp `LoadDefaultBg()` (battle_anim.c:1209-1215).
 *  Restore default battle BG (= DrawMainBattleBackground ou LoadContestBgAfterMoveAnim). */
function LoadDefaultBg(): void {
  // Cascade : depends on battle-bg.ts loadBattleTextboxAndBackground. Restore call
  // doit re-wire vers cette fonction. Deferred jusqu'à BG fade integration.
}

// ═══════════════════════════════════════════════════════════════════════════
// TASK CALLBACKS (= helpers tasks defined in battle_anim.c)
// ═══════════════════════════════════════════════════════════════════════════

/** Stub task helper : pour tasks anim_bg (Task_InitUpdateMonBg, etc.).
 *  Wraps notre runtime tasks system. */

/** 1:1 décomp `Task_FadeToBg(u8 taskId)` (battle_anim.c:1148-1183).
 *  State machine 4-state pour fade-out/load/fade-in BG cycle. */
function Task_FadeToBg(taskId: number): void {
  const task = _gTasks(taskId);
  if (!task) return;
  const data = task.data;
  // 1:1 décomp tBackgroundId = data[0], tState = data[10].
  if (data[10] === 0) {
    // 1:1 décomp `BeginHardwarePaletteFade(0xE8, 0, 0, 16, 0)` (fade-out).
    _beginHardwarePaletteFade(0xE8, 0, 0, 16, 0);
    data[10]++;
    return;
  }
  if (_paletteFadeActive()) return;
  if (data[10] === 1) {
    data[10]++;
    sAnimBackgroundFadeState = 2;
  } else if (data[10] === 2) {
    const bgId = data[0] | ((data[0] & 0x8000) ? 0xFFFF0000 : 0);  // s16 sign-extend
    if (bgId === -1) LoadDefaultBg();
    else LoadMoveBg(bgId);
    _beginHardwarePaletteFade(0xE8, 0, 16, 0, 1);
    data[10]++;
    return;
  }
  if (_paletteFadeActive()) return;
  if (data[10] === 3) {
    DestroyTask(taskId);
    sAnimBackgroundFadeState = 0;
  }
}

/** 1:1 décomp `Task_PanFromInitialToTarget(u8 taskId)` (battle_anim.c:1408-1448).
 *  Pan SE channel de pan initial vers target, with framewait incrément. */
function Task_PanFromInitialToTarget(taskId: number): void {
  const task = _gTasks(taskId);
  if (!task) return;
  const data = task.data;
  // tInitialPan=data[0], tTargetPan=data[1], tIncrementPan=data[2],
  // tFramesToWait=data[3], tCurrentPan=data[4], tFrameCounter=data[8].
  let destroyTask = false;
  if (data[8]++ >= data[3]) {
    data[8] = 0;
    const initial = data[0];
    const target = data[1];
    const increment = data[2];
    const current = data[4];
    let pan = current + increment;
    data[4] = pan;
    if (increment === 0) destroyTask = true;
    else if (initial < target) { if (pan >= target) destroyTask = true; }
    else { if (pan <= target) destroyTask = true; }
    if (destroyTask) {
      pan = target;
      DestroyTask(taskId);
      if (gAnimSoundTaskCount > 0) gAnimSoundTaskCount--;
    }
    SE12PanpotControl(pan);
  }
}

/** 1:1 décomp `Task_LoopAndPlaySE(u8 taskId)` (battle_anim.c:1547-1566).
 *  Loop : play SE every N frames, M times. */
function Task_LoopAndPlaySE(taskId: number): void {
  const task = _gTasks(taskId);
  if (!task) return;
  const data = task.data;
  // tSongId=data[0], tPanning=data[1], tFramesToWait=data[2],
  // tNumberOfPlays=data[3], tFrameCounter=data[8].
  if (data[8]++ >= data[2]) {
    data[8] = 0;
    const songId = data[0];
    const panning = data[1];
    const numPlays = --data[3];
    PlaySE12WithPanning(songId, panning);
    if (numPlays === 0) {
      DestroyTask(taskId);
      if (gAnimSoundTaskCount > 0) gAnimSoundTaskCount--;
    }
  }
}

/** 1:1 décomp `Task_WaitAndPlaySE(u8 taskId)` (battle_anim.c:1600-1608).
 *  Wait N frames then play SE once. */
function Task_WaitAndPlaySE(taskId: number): void {
  const task = _gTasks(taskId);
  if (!task) return;
  const data = task.data;
  if (data[2]-- <= 0) {
    PlaySE12WithPanning(data[0], data[1]);
    DestroyTask(taskId);
    if (gAnimSoundTaskCount > 0) gAnimSoundTaskCount--;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PALETTE FADE STUB WRAPPERS (= cascade vers notre runtime)
// ═══════════════════════════════════════════════════════════════════════════

/** Stub : BeginHardwarePaletteFade pour Task_FadeToBg. */
function _beginHardwarePaletteFade(_selectedPalettes: number, _delay: number, _startY: number, _targetY: number, _direction: number): void {
  // Cascade : palette.c BeginNormalPaletteFade. Pour now stub-noop sync car le
  // tick continue immédiatement à state 2 (= load BG) puis state 3 (= done).
}

/** Stub : gPaletteFade.active. */
function _paletteFadeActive(): boolean {
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 48 OPCODES (= battle_anim.c:334-1841)
// ═══════════════════════════════════════════════════════════════════════════

/** 0x00 Cmd_loadspritegfx (battle_anim.c:334-346).
 *  Load sprite gfx + palette via tag = `gBattleAnimPicTable[GET_TRUE_SPRITE_INDEX(index)]`.
 *  Wait 1 frame puis re-enter run loop. */
function Cmd_loadspritegfx(): void {
  _pc++;
  const index = read16(_pc);
  const trueIndex = index & 0x7FFF;  // GET_TRUE_SPRITE_INDEX strips bit 15.
  // 1:1 : Load par TAG (= gBattleAnimPicTable[idx], tag = 10000 + idx) via le
  // registry des templates (C0 goal 2026-06-11 : le load vient de l'OPCODE,
  // pas seulement du createsprite).
  _loadAnimSheetByTag(10000 + trueIndex);
  AddSpriteIndex(trueIndex);
  _pc += 2;
  sAnimFramesToWait = 1;
  gAnimScriptCallback = WaitAnimFrameCount;
}
/** Charge la sheet+palette d'un tag anim via le registry (template.load). */
function _loadAnimSheetByTag(tag: number): void {
  const reg = (globalThis as Record<string, unknown>).__battleAnimRegistryStore as {
    templates?: Map<string, { tileTag?: number; load?: () => void }>;
  } | undefined;
  if (!reg?.templates) return;
  for (const tpl of reg.templates.values()) {
    if (tpl.tileTag === tag && tpl.load) { try { tpl.load(); } catch { /* asset */ } return; }
  }
}

/** 0x01 Cmd_unloadspritegfx (battle_anim.c:348-358).
 *  Free sprite tiles + palette by tag. */
function Cmd_unloadspritegfx(): void {
  _pc++;
  const index = read16(_pc);
  const trueIndex = index & 0x7FFF;
  // 1:1 battle_anim.c:348-358 : Free tiles + palette par TAG (C0 : la VRAM se
  // LIBERE en fin d'anim -> les 415 moves scalent sans s'accumuler).
  FreeSpriteTilesByTag(10000 + trueIndex);
  FreeSpritePaletteByTag(10000 + trueIndex);
  ClearSpriteIndex(trueIndex);
  _pc += 2;
}

/** 0x02 Cmd_createsprite (battle_anim.c:360-412).
 *  Lit template ptr (u32) + argVar (u8 ANIMSPRITE_IS_TARGET | subprio) + argCount + args[N].
 *  Create sprite via CreateSpriteAndAnimate. */
function Cmd_createsprite(): void {
  _pc++;
  const templatePtr = read32(_pc);
  void templatePtr;  // Template ptr resolution deferred — sprite templates table not extracted.
  _pc += 4;
  let argVar = read8(_pc);
  _pc++;
  const argsCount = read8(_pc);
  _pc++;
  for (let i = 0; i < argsCount; i++) {
    gBattleAnimArgs[i] = read16(_pc) << 16 >> 16;  // s16 sign extend
    _pc += 2;
  }
  let subpriority: number;
  if (argVar & ANIMSPRITE_IS_TARGET) {
    argVar ^= ANIMSPRITE_IS_TARGET;
    if (argVar >= 64) argVar -= 64;
    else argVar = -argVar;
    subpriority = _getBattlerSpriteSubpriority(gBattleAnimTarget) + (argVar << 24 >> 24);  // s8
  } else {
    if (argVar >= 64) argVar -= 64;
    else argVar = -argVar;
    subpriority = _getBattlerSpriteSubpriority(gBattleAnimAttacker) + (argVar << 24 >> 24);
  }
  if (subpriority < 3) subpriority = 3;

  // T4 registry : marqueur nominal -> template TS enregistre.
  const tplName = animSymbolName(templatePtr);
  const tpl = tplName ? lookupAnimTemplate(tplName) : undefined;
  if (tpl) {
    const rt = getRuntime();
    if (rt) {
      // 1:1 CreateSpriteAndAnimate(template, coord(target,X_2), coord(target,Y_PIC_OFFSET), subprio).
      const x = _battlerCoordT4(gBattleAnimTarget, 2);
      const y = _battlerCoordT4(gBattleAnimTarget, 3);
      let spriteId = -1;
      if (tpl.tileTag > 0) {
        // Template a TAGS (gfx reels) : charge la sheet/palette (pattern
        // LoadBallGfx) puis CreateSprite SYSTEME (resolution par tag).
        tpl.load?.();
        const sysTpl = {
          tileTag: tpl.tileTag, paletteTag: tpl.paletteTag,
          oam: tpl.oam ?? { shape: 0, size: 2 },
          callback: tpl.callback as never,
        };
        spriteId = _CreateSpriteByTemplate(sysTpl as never, x, y, subpriority);
      } else {
        // Sprite CONTROLEUR invisible (tileTag 0 — lunge & co).
        spriteId = rt.CreateSpriteInline?.({ oam: { shape: 0, size: 1, priority: 1 }, images: [] } as never, x, y, subpriority) ?? -1;
      }
      if (spriteId >= 0) {
        const sp = rt.gSprites?.get(spriteId) as { data?: number[]; callback?: unknown; invisible?: boolean; spriteId?: number } | undefined;
        if (sp) {
          sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
          sp.spriteId = spriteId;
          _scriptSpriteIds.push({ id: spriteId, ref: sp as unknown });
          (sp as { callback: unknown }).callback = tpl.callback;
          if (tpl.tileTag === 0) sp.invisible = true;  // sprite controleur 1:1
          tpl.callback(sp);
        }
        gAnimVisualTaskCount++;  // 1:1 battle_anim.c:411 (decremente par DestroyAnimSprite)
      }
    }
    return;
  }
  void subpriority;
  _warnOnceDette('createsprite:' + (tplName ?? ('0x' + (templatePtr >>> 0).toString(16))));
}

/** Coord ecran du battler (X_2=2 / Y_PIC_OFFSET=3) via le sprite reel. */
function _battlerCoordT4(battler: number, coordType: number): number {
  const rt = getRuntime();
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler) ?? -1;
  const sp = rt?.gSprites?.get(id) as { x?: number; y?: number } | undefined;
  if (!sp) return coordType === 2 ? 120 : 80;
  return (coordType === 2 ? sp.x : sp.y) ?? 80;
}

/** 0x03 Cmd_createvisualtask (battle_anim.c:414-442).
 *  Read task func ptr + priority + argCount + args, create task, call immediately. */
function Cmd_createvisualtask(): void {
  _pc++;
  const taskFuncPtr = read32(_pc);
  _pc += 4;
  const taskPriority = read8(_pc);
  _pc++;
  const numArgs = read8(_pc);
  _pc++;
  for (let i = 0; i < numArgs; i++) {
    gBattleAnimArgs[i] = read16(_pc) << 16 >> 16;
    _pc += 2;
  }
  // T4 registry : marqueur nominal -> AnimTask TS enregistree.
  const taskName = animSymbolName(taskFuncPtr);
  const taskFn = taskName ? lookupAnimTask(taskName) : undefined;
  if (taskFn) {
    const rt = getRuntime();
    if (rt) {
      rt.CreateTask(taskFn as never, taskPriority);
      gAnimVisualTaskCount++;  // 1:1 battle_anim.c:441 (decremente par DestroyAnimVisualTask)
    }
    return;
  }
  // Non enregistree : PAS d'increment (rien ne decrementerait -> soft-lock
  // waitforvisualfinish). Skip propre = l'anim se termine (dette registry).
  void taskPriority;
  _warnOnceDette('createvisualtask:' + (taskName ?? ('0x' + (taskFuncPtr >>> 0).toString(16))));
}

const _detteWarned = new Set<string>();
function _warnOnceDette(what: string): void {
  if (_detteWarned.has(what)) return;
  _detteWarned.add(what);
  console.warn(`[battle-anim] ${what} : non resolu (dette T4 registry) — spawn skippe, l'anim se termine sans ce visuel.`);
}

/** 0x04 Cmd_delay (battle_anim.c:444-452).
 *  Wait N frames. Si N=0 → wait -1 (= 1 frame). */
function Cmd_delay(): void {
  _pc++;
  sAnimFramesToWait = read8(_pc) << 24 >> 24;  // s8
  if (sAnimFramesToWait === 0) sAnimFramesToWait = -1;
  _pc++;
  gAnimScriptCallback = WaitAnimFrameCount;
}

/** 0x05 Cmd_waitforvisualfinish (battle_anim.c:454-466).
 *  Block until gAnimVisualTaskCount == 0. */
let _waitVisualFrames = 0;
function Cmd_waitforvisualfinish(): void {
  if (gAnimVisualTaskCount === 0) {
    _pc++;
    sAnimFramesToWait = 0;
    _waitVisualFrames = 0;
  } else if (++_waitVisualFrames > 600) {
    // GARDE-FOU GENERAL (2026-06-11) : une task visuelle RESOLUE bloquee
    // (args pollues / step qui ne converge pas) gelait le script a jamais
    // (vu : MEGA_PUNCH/CUT/SLAM timeout\@900, visualTaskCount=1). Le decomp
    // n'en a pas besoin (tasks saines) ; nous si -> on force la fin du wait,
    // le script continue vers end (et la purge par identite nettoie).
    console.warn('[battle-anim] waitforvisualfinish > 600 frames (taskCount=' + gAnimVisualTaskCount + ') — force la suite (garde-fou).');
    gAnimVisualTaskCount = 0;
    _pc++;
    sAnimFramesToWait = 0;
    _waitVisualFrames = 0;
  } else {
    sAnimFramesToWait = 1;
  }
}

/** 0x06 Cmd_nop / 0x07 Cmd_nop2 (battle_anim.c:468-474). */
function Cmd_nop(): void { _pc++; }
function Cmd_nop2(): void { _pc++; }

/** 0x08 Cmd_end (battle_anim.c:476-528).
 *  Finalize anim : wait sprites/sounds, free sprite tiles/palettes, reset BGM,
 *  set gAnimScriptActive = FALSE. */
function Cmd_end(): void {
  // 1:1 décomp C:482-488 : block tant que tasks restantes.
  if (gAnimVisualTaskCount !== 0 || gAnimSoundTaskCount !== 0
   || sMonAnimTaskIdArray[0] !== TASK_NONE || sMonAnimTaskIdArray[1] !== TASK_NONE) {
    sSoundAnimFramesToWait = 0;
    sAnimFramesToWait = 1;
    return;
  }

  // 1:1 décomp C:491-503 : wait pour SE finish, halt après 90 frames.
  if (IsSEPlaying()) {
    if (++sSoundAnimFramesToWait <= 90) {
      sAnimFramesToWait = 1;
      return;
    } else {
      m4aMPlayStop_SE();
    }
  }
  sSoundAnimFramesToWait = 0;

  // 1:1 décomp C:508-516 : free remaining sprite tiles/palettes.
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    if (sAnimSpriteIndexArray[i] !== 0xFFFF) {
      // FreeSpriteTilesByTag + FreeSpritePaletteByTag — cascade deferred.
      sAnimSpriteIndexArray[i] = 0xFFFF;
    }
  }

  // 1:1 décomp C:520-526 : restore BGM + InitPrioritiesForVisibleBattlers +
  // UpdateOamPriorityInAllHealthboxes. Mark inactive.
  m4aMPlayVolumeControl_BGM(256);
  gAnimScriptActive = false;
}

/** 0x09 Cmd_playse (battle_anim.c:530-535). */
function Cmd_playse(): void {
  _pc++;
  const songId = read16(_pc);
  void import('../system/decomp-globals').then(({ PlaySE }) => PlaySE(songId));
  _pc += 2;
}

/** 0x0A Cmd_monbg (battle_anim.c:591-647).
 *  Move designated battler to BG1/BG2 pour anim BG effects. */
function Cmd_monbg(): void {
  _pc++;
  const animBattler = read8(_pc);
  // Bit ANIM_TARGET set → use target, else attacker.
  let battler = (animBattler & 1) ? gBattleAnimTarget : gBattleAnimAttacker;

  if (IsBattlerSpriteVisible(battler)) {
    const position = GetBattlerPosition(battler);
    const toBG_2 = !(position === B_POSITION_OPPONENT_LEFT || position === B_POSITION_PLAYER_RIGHT || IsContest());
    MoveBattlerSpriteToBG(battler, toBG_2, false);
    const taskId = CreateTask(Task_InitUpdateMonBg, 10);
    gAnimVisualTaskCount++;
    if (taskId !== TASK_NONE) {
      _gTasks(taskId).data[0] = battler;  // tBattlerId
      _gTasks(taskId).data[1] = toBG_2 ? 1 : 0;  // tInBg2
      _gTasks(taskId).data[2] = 1;  // tActive
      _gTasks(taskId).data[3] = 0;  // tIsPartner
    }
  }

  // Move partner aussi.
  battler ^= BIT_FLANK;
  if (IsBattlerSpriteVisible(battler)) {
    const position = GetBattlerPosition(battler);
    const toBG_2 = !(position === B_POSITION_OPPONENT_LEFT || position === B_POSITION_PLAYER_RIGHT || IsContest());
    MoveBattlerSpriteToBG(battler, toBG_2, false);
    const taskId = CreateTask(Task_InitUpdateMonBg, 10);
    gAnimVisualTaskCount++;
    if (taskId !== TASK_NONE) {
      _gTasks(taskId).data[0] = battler;
      _gTasks(taskId).data[1] = toBG_2 ? 1 : 0;
      _gTasks(taskId).data[2] = 1;
      _gTasks(taskId).data[3] = 1;  // isPartner
    }
  }

  _pc++;
  sAnimFramesToWait = 1;
  gAnimScriptCallback = WaitAnimFrameCount;
}

/** Task_InitUpdateMonBg + Task_UpdateMonBg : track sprite movement + sync BG offset. */
function Task_InitUpdateMonBg(taskId: number): void {
  // Cascade deferred : depends on MoveBattlerSpriteToBG + gBattlerSpriteIds + DMA copy.
  // Pour now : decrement count + cleanup pour ne pas bloquer.
  DestroyAnimVisualTask(taskId);
}

/** 0x0B Cmd_clearmonbg (battle_anim.c:852-883).
 *  Restore battler sprite from BG, destroy update task. */
function Cmd_clearmonbg(): void {
  _pc++;
  let animBattlerId = read8(_pc);
  if (animBattlerId === ANIM_ATTACKER) animBattlerId = ANIM_ATK_PARTNER;
  else if (animBattlerId === ANIM_TARGET) animBattlerId = ANIM_DEF_PARTNER;
  const battler = (animBattlerId === ANIM_ATTACKER || animBattlerId === ANIM_ATK_PARTNER) ? gBattleAnimAttacker : gBattleAnimTarget;
  void battler;

  // Sprite restore + Task_ClearMonBg dispatch — cascade deferred (= MoveBattlerSpriteToBG).
  _pc++;
}

/** 0x0C Cmd_setalpha (battle_anim.c:1015-1024). */
function Cmd_setalpha(): void {
  _pc++;
  const half1 = read8(_pc); _pc++;
  const half2 = read8(_pc) << 8; _pc++;
  const rt = getRuntime();
  if (rt) {
    rt.SetGpuReg(0x50, 0x40 | 0x3F00);  // BLDCNT = EFFECT_BLEND | TGT2_ALL
    rt.SetGpuReg(0x52, half1 | half2);  // BLDALPHA
  }
}

/** 0x0D Cmd_blendoff (battle_anim.c:1036-1041). */
function Cmd_blendoff(): void {
  _pc++;
  const rt = getRuntime();
  if (rt) {
    rt.SetGpuReg(0x50, 0);  // BLDCNT
    rt.SetGpuReg(0x52, 0);  // BLDALPHA
  }
}

/** 0x0E Cmd_call (battle_anim.c:1043-1048). */
function Cmd_call(): void {
  _pc++;
  _retAddr = _pc + 4;
  _pc = readPtr(_pc);
}

/** 0x0F Cmd_return (battle_anim.c:1050-1053). */
function Cmd_return(): void {
  _pc = _retAddr;
}

/** 0x10 Cmd_setarg (battle_anim.c:1055-1071). */
function Cmd_setarg(): void {
  const addr = _pc;
  _pc++;
  const argId = read8(_pc);
  _pc++;
  const value = read16(_pc) << 16 >> 16;
  _pc = addr + 4;
  gBattleAnimArgs[argId] = value;
}

/** 0x11 Cmd_choosetwoturnanim (battle_anim.c:1073-1079).
 *  Two-turn moves (= SOLAR_BEAM/RAZOR_WIND/etc.) : turn 0 = charge anim, turn 1 = attack anim. */
function Cmd_choosetwoturnanim(): void {
  _pc++;
  if (gAnimMoveTurn & 1) _pc += 4;
  _pc = readPtr(_pc);
}

/** 0x12 Cmd_jumpifmoveturn (battle_anim.c:1081-1092). */
function Cmd_jumpifmoveturn(): void {
  _pc++;
  const toCheck = read8(_pc);
  _pc++;
  if (toCheck === gAnimMoveTurn) _pc = readPtr(_pc);
  else _pc += 4;
}

/** 0x13 Cmd_goto (battle_anim.c:1094-1098). */
function Cmd_goto(): void {
  _pc++;
  _pc = readPtr(_pc);
}

/** 0x14 Cmd_fadetobg (battle_anim.c:1113-1124). */
function Cmd_fadetobg(): void {
  _pc++;
  const backgroundId = read8(_pc) << 24 >> 24;  // s8 for -1 sentinel
  _pc++;
  const taskId = CreateTask(Task_FadeToBg, 5);
  if (taskId !== TASK_NONE) _gTasks(taskId).data[0] = backgroundId;
  sAnimBackgroundFadeState = 1;
}

/** 0x15 Cmd_restorebg (battle_anim.c:1217-1225). */
function Cmd_restorebg(): void {
  _pc++;
  const taskId = CreateTask(Task_FadeToBg, 5);
  if (taskId !== TASK_NONE) _gTasks(taskId).data[0] = -1;  // sentinel for "default BG"
  sAnimBackgroundFadeState = 1;
}

/** 0x16 Cmd_waitbgfadeout (battle_anim.c:1230-1241). */
function Cmd_waitbgfadeout(): void {
  if (sAnimBackgroundFadeState === 2) {
    _pc++;
    sAnimFramesToWait = 0;
  } else {
    sAnimFramesToWait = 1;
  }
}

/** 0x17 Cmd_waitbgfadein (battle_anim.c:1243-1254). */
function Cmd_waitbgfadein(): void {
  if (sAnimBackgroundFadeState === 0) {
    _pc++;
    sAnimFramesToWait = 0;
  } else {
    sAnimFramesToWait = 1;
  }
}

/** 0x18 Cmd_changebg (battle_anim.c:1256-1261). */
function Cmd_changebg(): void {
  _pc++;
  LoadMoveBg(read8(_pc));
  _pc++;
}

/** 0x19 Cmd_playsewithpan (battle_anim.c:1348-1358). */
function Cmd_playsewithpan(): void {
  _pc++;
  const songId = read16(_pc);
  const pan = read8(_pc + 2) << 24 >> 24;  // s8
  PlaySE12WithPanning(songId, BattleAnimAdjustPanning(pan));
  _pc += 3;
}

/** 0x1A Cmd_setpan (battle_anim.c:1360-1368). */
function Cmd_setpan(): void {
  _pc++;
  const pan = read8(_pc) << 24 >> 24;
  SE12PanpotControl(BattleAnimAdjustPanning(pan));
  _pc++;
}

/** 0x1B Cmd_panse (battle_anim.c:1377-1406). */
function Cmd_panse(): void {
  _pc++;
  const songNum = read16(_pc);
  const currentPanArg = read8(_pc + 2) << 24 >> 24;
  const targetPanArg = read8(_pc + 3) << 24 >> 24;
  const incrementPanArg = read8(_pc + 4) << 24 >> 24;
  const framesToWait = read8(_pc + 5);

  const currentPan = BattleAnimAdjustPanning(currentPanArg);
  const targetPan = BattleAnimAdjustPanning(targetPanArg);
  const incrementPan = CalculatePanIncrement(currentPan, targetPan, incrementPanArg);

  const taskId = CreateTask(Task_PanFromInitialToTarget, 1);
  if (taskId !== TASK_NONE) {
    const d = _gTasks(taskId).data;
    d[0] = currentPan; d[1] = targetPan; d[2] = incrementPan;
    d[3] = framesToWait; d[4] = currentPan;
  }
  PlaySE12WithPanning(songNum, currentPan);
  gAnimSoundTaskCount++;
  _pc += 6;
}

/** 0x1C Cmd_loopsewithpan (battle_anim.c:1521-1545). */
function Cmd_loopsewithpan(): void {
  _pc++;
  const songId = read16(_pc);
  const panningArg = read8(_pc + 2) << 24 >> 24;
  const framesToWait = read8(_pc + 3);
  const numberOfPlays = read8(_pc + 4);
  const panning = BattleAnimAdjustPanning(panningArg);
  const taskId = CreateTask(Task_LoopAndPlaySE, 1);
  if (taskId !== TASK_NONE) {
    const d = _gTasks(taskId).data;
    d[0] = songId; d[1] = panning; d[2] = framesToWait;
    d[3] = numberOfPlays; d[8] = framesToWait;
    // Décomp call task func immediately to trigger first play.
    Task_LoopAndPlaySE(taskId);
  }
  gAnimSoundTaskCount++;
  _pc += 5;
}

/** 0x1D Cmd_waitplaysewithpan (battle_anim.c:1578-1598). */
function Cmd_waitplaysewithpan(): void {
  _pc++;
  const songId = read16(_pc);
  const panningArg = read8(_pc + 2) << 24 >> 24;
  const framesToWait = read8(_pc + 3);
  const panning = BattleAnimAdjustPanning(panningArg);
  const taskId = CreateTask(Task_WaitAndPlaySE, 1);
  if (taskId !== TASK_NONE) {
    const d = _gTasks(taskId).data;
    d[0] = songId; d[1] = panning; d[2] = framesToWait;
  }
  gAnimSoundTaskCount++;
  _pc += 4;
}

/** 0x1E Cmd_setbldcnt (battle_anim.c:1026-1034). */
function Cmd_setbldcnt(): void {
  _pc++;
  const half1 = read8(_pc); _pc++;
  const half2 = read8(_pc) << 8; _pc++;
  const rt = getRuntime();
  if (rt) rt.SetGpuReg(0x50, half1 | half2);
}

/** 0x1F Cmd_createsoundtask (battle_anim.c:1614-1633). */
function Cmd_createsoundtask(): void {
  _pc++;
  const funcPtr = read32(_pc);
  _pc += 4;
  const numArgs = read8(_pc);
  _pc++;
  for (let i = 0; i < numArgs; i++) {
    gBattleAnimArgs[i] = read16(_pc) << 16 >> 16;
    _pc += 2;
  }
  // Sound task func resolution deferred — call funcPtr() would require resolving
  // bytecode pointer to actual function. Pour now incrementer count seul.
  void funcPtr;
  gAnimSoundTaskCount++;
}

/** 0x20 Cmd_waitsound (battle_anim.c:1635-1661). */
function Cmd_waitsound(): void {
  if (gAnimSoundTaskCount !== 0) {
    sSoundAnimFramesToWait = 0;
    sAnimFramesToWait = 1;
  } else if (IsSEPlaying()) {
    if (++sSoundAnimFramesToWait > 90) {
      m4aMPlayStop_SE();
      sSoundAnimFramesToWait = 0;
    } else {
      sAnimFramesToWait = 1;
    }
  } else {
    sSoundAnimFramesToWait = 0;
    _pc++;
    sAnimFramesToWait = 0;
  }
}

/** 0x21 Cmd_jumpargeq (battle_anim.c:1663-1676). */
function Cmd_jumpargeq(): void {
  _pc++;
  const argId = read8(_pc);
  const valueToCheck = read16(_pc + 1) << 16 >> 16;
  if (valueToCheck === gBattleAnimArgs[argId]) _pc = readPtr(_pc + 3);
  else _pc += 7;
}

/** 0x22 Cmd_monbg_static (battle_anim.c:914-958).
 *  Same as Cmd_monbg but without Task_UpdateMonBg (= static positioning). */
function Cmd_monbg_static(): void {
  _pc++;
  let animBattlerId = read8(_pc);
  if (animBattlerId === ANIM_ATTACKER) animBattlerId = ANIM_ATK_PARTNER;
  else if (animBattlerId === ANIM_TARGET) animBattlerId = ANIM_DEF_PARTNER;
  let battler = (animBattlerId === ANIM_ATTACKER || animBattlerId === ANIM_ATK_PARTNER) ? gBattleAnimAttacker : gBattleAnimTarget;
  if (IsBattlerSpriteVisible(battler)) {
    const position = GetBattlerPosition(battler);
    const toBG_2 = !(position === B_POSITION_OPPONENT_LEFT || position === B_POSITION_PLAYER_RIGHT || IsContest());
    MoveBattlerSpriteToBG(battler, toBG_2, false);
  }
  battler ^= BIT_FLANK;
  if (animBattlerId > 1 && IsBattlerSpriteVisible(battler)) {
    const position = GetBattlerPosition(battler);
    const toBG_2 = !(position === B_POSITION_OPPONENT_LEFT || position === B_POSITION_PLAYER_RIGHT || IsContest());
    MoveBattlerSpriteToBG(battler, toBG_2, false);
  }
  _pc++;
}

/** 0x23 Cmd_clearmonbg_static (battle_anim.c:960-991). */
function Cmd_clearmonbg_static(): void {
  _pc++;
  // Cascade deferred (= Task_ClearMonBgStatic dispatch).
  _pc++;
}

/** 0x24 Cmd_jumpifcontest (battle_anim.c:1678-1685). */
function Cmd_jumpifcontest(): void {
  _pc++;
  if (IsContest()) _pc = readPtr(_pc);
  else _pc += 4;
}

/** 0x25 Cmd_fadetobgfromset (battle_anim.c:1126-1146). */
function Cmd_fadetobgfromset(): void {
  _pc++;
  const bg1 = read8(_pc);
  const bg2 = read8(_pc + 1);
  const bg3 = read8(_pc + 2);
  _pc += 3;
  const taskId = CreateTask(Task_FadeToBg, 5);
  if (taskId !== TASK_NONE) {
    if (IsContest()) _gTasks(taskId).data[0] = bg3;
    else if (GetBattlerSide(gBattleAnimTarget) === B_SIDE_PLAYER) _gTasks(taskId).data[0] = bg2;
    else _gTasks(taskId).data[0] = bg1;
  }
  sAnimBackgroundFadeState = 1;
}

/** 0x26 Cmd_panse_adjustnone (battle_anim.c:1450-1475).
 *  Pan SE without panning adjustment (= raw values passed). */
function Cmd_panse_adjustnone(): void {
  _pc++;
  const songId = read16(_pc);
  const currentPan = read8(_pc + 2) << 24 >> 24;
  const targetPan = read8(_pc + 3) << 24 >> 24;
  const incrementPan = read8(_pc + 4) << 24 >> 24;
  const framesToWait = read8(_pc + 5);
  const taskId = CreateTask(Task_PanFromInitialToTarget, 1);
  if (taskId !== TASK_NONE) {
    const d = _gTasks(taskId).data;
    d[0] = currentPan; d[1] = targetPan; d[2] = incrementPan;
    d[3] = framesToWait; d[4] = currentPan;
  }
  PlaySE12WithPanning(songId, currentPan);
  gAnimSoundTaskCount++;
  _pc += 6;
}

/** 0x27 Cmd_panse_adjustall (battle_anim.c:1477-1506).
 *  Pan SE avec adjustment2 sur tous les pan params. */
function Cmd_panse_adjustall(): void {
  _pc++;
  const songId = read16(_pc);
  const currentPanArg = read8(_pc + 2) << 24 >> 24;
  const targetPanArg = read8(_pc + 3) << 24 >> 24;
  const incrementPanArg = read8(_pc + 4) << 24 >> 24;
  const framesToWait = read8(_pc + 5);
  const currentPan = BattleAnimAdjustPanning2(currentPanArg);
  const targetPan = BattleAnimAdjustPanning2(targetPanArg);
  const incrementPan = BattleAnimAdjustPanning2(incrementPanArg);
  const taskId = CreateTask(Task_PanFromInitialToTarget, 1);
  if (taskId !== TASK_NONE) {
    const d = _gTasks(taskId).data;
    d[0] = currentPan; d[1] = targetPan; d[2] = incrementPan;
    d[3] = framesToWait; d[4] = currentPan;
  }
  PlaySE12WithPanning(songId, currentPan);
  gAnimSoundTaskCount++;
  _pc += 6;
}

/** 0x28 Cmd_splitbgprio (battle_anim.c:1687-1708). */
function Cmd_splitbgprio(): void {
  const wantedBattler = read8(_pc + 1);
  _pc += 2;
  const battler = (wantedBattler !== ANIM_ATTACKER) ? gBattleAnimTarget : gBattleAnimAttacker;
  const position = GetBattlerPosition(battler);
  if (!IsContest() && (position === 0 /* PLAYER_LEFT */ || position === 3 /* OPPONENT_RIGHT */)) {
    _setAnimBgAttribute(1, 'priority', 1);
    _setAnimBgAttribute(2, 'priority', 2);
  }
}

/** 0x29 Cmd_splitbgprio_all (battle_anim.c:1710-1718). */
function Cmd_splitbgprio_all(): void {
  _pc++;
  if (!IsContest()) {
    _setAnimBgAttribute(1, 'priority', 1);
    _setAnimBgAttribute(2, 'priority', 2);
  }
}

/** 0x2A Cmd_splitbgprio_foes (battle_anim.c:1720-1745). */
function Cmd_splitbgprio_foes(): void {
  const wantedBattler = read8(_pc + 1);
  _pc += 2;
  if (GetBattlerSide(gBattleAnimAttacker) !== GetBattlerSide(gBattleAnimTarget)) {
    const battler = (wantedBattler !== ANIM_ATTACKER) ? gBattleAnimTarget : gBattleAnimAttacker;
    const position = GetBattlerPosition(battler);
    if (!IsContest() && (position === 0 || position === 3)) {
      _setAnimBgAttribute(1, 'priority', 1);
      _setAnimBgAttribute(2, 'priority', 2);
    }
  }
}

/** 0x2B Cmd_invisible (battle_anim.c:1747-1756). */
function Cmd_invisible(): void {
  const spriteId = _getAnimBattlerSpriteId(read8(_pc + 1));
  if (spriteId >= 0) {
    const rt = getRuntime();
    if (rt) {
      const s = rt.gSprites.get(spriteId);
      if (s) s.invisible = true;
    }
  }
  _pc += 2;
}

/** 0x2C Cmd_visible (battle_anim.c:1758-1767). */
function Cmd_visible(): void {
  const spriteId = _getAnimBattlerSpriteId(read8(_pc + 1));
  if (spriteId >= 0) {
    const rt = getRuntime();
    if (rt) {
      const s = rt.gSprites.get(spriteId);
      if (s) s.invisible = false;
    }
  }
  _pc += 2;
}

/** 0x2D Cmd_teamattack_moveback (battle_anim.c:1770-1805). */
function Cmd_teamattack_moveback(): void {
  const wantedBattler = read8(_pc + 1);
  _pc += 2;
  // Double battle only — cascade deferred.
  void wantedBattler;
}

/** 0x2E Cmd_teamattack_movefwd (battle_anim.c:1807-1834). */
function Cmd_teamattack_movefwd(): void {
  const wantedBattler = read8(_pc + 1);
  _pc += 2;
  void wantedBattler;
}

/** 0x2F Cmd_stopsound (battle_anim.c:1836-1841). */
function Cmd_stopsound(): void {
  m4aMPlayStop_SE();
  _pc++;
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE/BG HELPER STUBS (cascade deferred)
// ═══════════════════════════════════════════════════════════════════════════

/** Stub : GetBattlerSpriteSubpriority (battle_anim_mons.c).
 *  Cascade deferred — returns 30 (default subpriority). */
function _getBattlerSpriteSubpriority(_battler: number): number {
  return 30;
}

/** Stub : GetAnimBattlerSpriteId (battle_anim_mons.c).
 *  Returns spriteId du battler depuis gBattlerSpriteIds[]. */
function _getAnimBattlerSpriteId(_animBattlerId: number): number {
  // Cascade deferred — gBattlerSpriteIds[] not fully wired.
  return -1;
}

/** Stub : SetAnimBgAttribute (bg.c). */
function _setAnimBgAttribute(_bg: number, _attr: string, _value: number): void {
  // Deferred — battle anim BG priority manipulation.
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPATCH TABLE (= sScriptCmdTable[48] battle_anim.c:118-168)
// ═══════════════════════════════════════════════════════════════════════════

const sScriptCmdTable: ReadonlyArray<(() => void)> = [
  Cmd_loadspritegfx,        // 0x00
  Cmd_unloadspritegfx,      // 0x01
  Cmd_createsprite,         // 0x02
  Cmd_createvisualtask,     // 0x03
  Cmd_delay,                // 0x04
  Cmd_waitforvisualfinish,  // 0x05
  Cmd_nop,                  // 0x06
  Cmd_nop2,                 // 0x07
  Cmd_end,                  // 0x08
  Cmd_playse,               // 0x09
  Cmd_monbg,                // 0x0A
  Cmd_clearmonbg,           // 0x0B
  Cmd_setalpha,             // 0x0C
  Cmd_blendoff,             // 0x0D
  Cmd_call,                 // 0x0E
  Cmd_return,               // 0x0F
  Cmd_setarg,               // 0x10
  Cmd_choosetwoturnanim,    // 0x11
  Cmd_jumpifmoveturn,       // 0x12
  Cmd_goto,                 // 0x13
  Cmd_fadetobg,             // 0x14
  Cmd_restorebg,            // 0x15
  Cmd_waitbgfadeout,        // 0x16
  Cmd_waitbgfadein,         // 0x17
  Cmd_changebg,             // 0x18
  Cmd_playsewithpan,        // 0x19
  Cmd_setpan,               // 0x1A
  Cmd_panse,                // 0x1B
  Cmd_loopsewithpan,        // 0x1C
  Cmd_waitplaysewithpan,    // 0x1D
  Cmd_setbldcnt,            // 0x1E
  Cmd_createsoundtask,      // 0x1F
  Cmd_waitsound,            // 0x20
  Cmd_jumpargeq,            // 0x21
  Cmd_monbg_static,         // 0x22
  Cmd_clearmonbg_static,    // 0x23
  Cmd_jumpifcontest,        // 0x24
  Cmd_fadetobgfromset,      // 0x25
  Cmd_panse_adjustnone,     // 0x26
  Cmd_panse_adjustall,      // 0x27
  Cmd_splitbgprio,          // 0x28
  Cmd_splitbgprio_all,      // 0x29
  Cmd_splitbgprio_foes,     // 0x2A
  Cmd_invisible,            // 0x2B
  Cmd_visible,              // 0x2C
  Cmd_teamattack_moveback,  // 0x2D
  Cmd_teamattack_movefwd,   // 0x2E
  Cmd_stopsound,            // 0x2F
];

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC TICK API (= called per frame by battle-flow.ts state ANIM_PLAY)
// ═══════════════════════════════════════════════════════════════════════════

/** Tick the active battle anim script. Call per frame quand gAnimScriptActive.
 *  1:1 décomp : main loop call gAnimScriptCallback() each frame. */
export function TickBattleAnim(): void {
  if (!gAnimScriptActive || !gAnimScriptCallback) return;
  gAnimScriptCallback();
}

/** Public state getters pour battle-flow.ts. */
export function IsAnimRunning(): boolean { return gAnimScriptActive; }
export function GetAnimFramesToWait(): number { return sAnimFramesToWait; }
export function GetCurrentPC(): number { return _pc; }
export function GetVisualTaskCount(): number { return gAnimVisualTaskCount; }
export function GetSoundTaskCount(): number { return gAnimSoundTaskCount; }

// Exposed sentinel value (= ANIM_BYTECODE buffer size pour bounds checks externes).
export const ANIM_BYTECODE_SIZE = ANIM_BYTECODE.length;

/** 1:1 decomp InitAndLaunchSpecialAnimation prologue (battle_gfx_sfx_util.c) :
 *  gBattleAnimAttacker = atk ; gBattleAnimTarget = def. Met a jour les lets
 *  ET la surface globalThis (exposee par VALEUR, sinon snapshot fige a 0). */
export function SetAnimBattlers(atk: number, def: number): void {
  gBattleAnimAttacker = atk;
  gBattleAnimTarget = def;
  const surf = (globalThis as Record<string, unknown>).__battleAnim as Record<string, unknown> | undefined;
  if (surf) { surf.gBattleAnimAttacker = atk; surf.gBattleAnimTarget = def; }
}

// Devtools exposure : trace les anims (= devtools K7).
(globalThis as Record<string, unknown>).__battleAnim = {
  IsAnimRunning, GetCurrentPC, GetAnimFramesToWait,
  GetVisualTaskCount, GetSoundTaskCount,
  gBattleAnimArgs, gBattleAnimAttacker, gBattleAnimTarget,
  LaunchBattleAnimation, DoMoveAnim, ClearBattleAnimationVars,
  SetAnimBattlers,
};

// ─── Accesseurs pour les anims de STATUT (battle_anim_status_effects.ts) ────
// (T3 — ajouts PURS en fin de module, zero changement de comportement.)
export function setBattleAnimAttackerTarget(attacker: number, target: number): void {
  gBattleAnimAttacker = attacker;
  gBattleAnimTarget = target;
}
export function isAnimScriptActive(): boolean { return gAnimScriptActive; }
/** Tick une frame du script anim (1:1 : `gAnimScriptCallback()`). */
export function tickAnimScript(): void {
  if (gAnimScriptCallback) gAnimScriptCallback();
}

// Surface lazy pour les miroirs AnimTask (anti-cycle ESM : battle_anim_mon_movement
// n'importe PAS ce module statiquement -> TDZ pokeball evitee).
(globalThis as Record<string, unknown>).__battleAnimInterpreter = {
  // devtool vagues : l'état interne pour diagnostiquer un soft-lock d'anim.
  getDebugState: () => ({ pc: _pc, visualTaskCount: gAnimVisualTaskCount, active: gAnimScriptActive, cbName: (gAnimScriptCallback as { name?: string } | null)?.name ?? null }),
  getArgs: () => gBattleAnimArgs,
  getAttacker: () => gBattleAnimAttacker,
  getTarget: () => gBattleAnimTarget,
  DestroyAnimVisualTask, DestroyAnimSprite,
  DoMoveAnim, tickAnimScript, isAnimScriptActive,
};
