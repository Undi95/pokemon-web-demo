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
import { FreeSpritePaletteByTag, sSpriteTileAllocBitmap } from '../system/sprite';
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

/** Restaure l'etat visuel des sprites BATTLERS (x2/y2/flips) — apres une
 *  anim coupee par le garde-fou, le mon ne doit JAMAIS rester deplace. */
function _restoreBattlerSprites(): void {
  const rt = getRuntime();
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  if (!rt || !co?.getBattlerMonSpriteId) return;
  for (let b = 0; b < 4; b++) {
    const id = co.getBattlerMonSpriteId(b);
    if (id === undefined || id < 0) continue;
    const sp = rt.gSprites?.get(id) as { x2?: number; y2?: number; hFlip?: boolean; vFlip?: boolean } | undefined;
    if (sp) { sp.x2 = 0; sp.y2 = 0; sp.hFlip = false; sp.vFlip = false; }
    // PAS de ResetSpriteRotScale AVEUGLE : sur un mon SAIN ca togglait
    // l affine/double-size -> POSITION DECALEE (retour user : « probleme de
    // position apres anim affine de Wailord »). Seules les AnimTasks qui ont
    // PrepareBattlerSpriteForRotScale doivent Reset (elles le font deja).
  }
}

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
    // 1:1 LaunchBattleAnimation : gAnimBattlerSpecies[i] rempli pour CHAQUE
    // battler (la décomp lit les parties ; gBattleMons[i].species = la même
    // valeur pour les battlers actifs — fill recâblé 2026-06-11, il était
    // commenté → toutes les élévations Y species-based étaient à zéro =
    // positions d'anim fausses, retours user).
    {
      const bs = (globalThis as { __battleState?: { gBattleMons?: Array<{ species?: number }>; gBattlersCount?: number } }).__battleState;
      const n = bs?.gBattlersCount ?? 2;
      for (let i = 0; i < n && i < MAX_BATTLERS_COUNT; i++) {
        gAnimBattlerSpecies[i] = bs?.gBattleMons?.[i]?.species ?? 0;
      }
    }
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
  _snapshotAnimPalettes();
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
const _monbgActive = [false, false, false]; // index 1/2 = BG actifs par monbg
export function MoveBattlerSpriteToBG(battler: number, toBG_2: boolean, setSpriteInvisible: boolean): void {
  // 1:1 battle_anim.c:668 (single, non-contest) — LE systeme monbg REEL
  // (chantier Phase 1b, 2026-06-11) : copie le SPRITE du mon en VRAM BG
  // (64 tiles OBJ -> tiles BG + tilemap 8x8 + palette OBJ->BG slot 8/9),
  // positionne le scroll BG pour superposer la copie, cache le sprite si
  // demande. DrawBattlerOnBg (battle_intro.c:587) inline.
  const rt = getRuntime();
  if (!rt) return;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(battler);
  if (sid === undefined || sid === 0xFF) return;
  const sprite = rt.gSprites.get(sid);
  if (!sprite) return;
  const oam = (rt as unknown as { gba: { oam: Array<{ tileId: number }> } }).gba.oam[sprite.oamIndex];
  const gba = (rt as unknown as { gba: { bg: (i: number) => { vram: Uint8Array; tilemap: Uint16Array; config: { charBaseIndex: number } }; objVram: Uint8Array } }).gba;
  const bgId = toBG_2 ? 2 : 1;
  const bg = gba.bg(bgId);
  // CHARBASE D'ABORD (la racine des « dents de scie » 2026-06-11 : bg1 etait
  // a charBase 0 au moment du write -> la view pointait LE CHARBLOCK DE LA
  // TEXTBOX et les 64 tiles du mon ecrasaient le cadre !). Le C utilise des
  // adresses dediees (BG_SCREEN_ADDR(8)) ; nous : charblock 1 (0x4000+),
  // hors textbox(0)/terrain(2). La view (getter dynamique) suit.
  bg.config.charBaseIndex = 1;
  // fills 1:1 (CpuFill16(0, tiles, 0x1000) + tilemap 0xFF/0) — net : zero.
  const tilesOffsetBytes = toBG_2 ? 0x1000 : 0;
  bg.tilemap.fill(0);
  // les 64 tiles OBJ du mon (BG_SCREEN_SIZE=0x800 bytes 1:1)
  const monTile = oam?.tileId ?? 0;
  const src = gba.objVram.subarray(monTile * 32, monTile * 32 + 0x800);
  bg.vram.set(src, tilesOffsetBytes);
  // tilemap 8x8 a (0,0) : offset croissant | palette<<12 (DrawBattlerOnBg)
  const paletteId = toBG_2 ? 9 : 8;
  const baseTile = tilesOffsetBytes >> 5;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      bg.tilemap[i * 32 + j] = ((baseTile + i * 8 + j) & 0x3FF) | (paletteId << 12);
    }
  }
  // palette OBJ du battler -> palette BG slot (LoadPalette 1:1)
  const pf = (rt as unknown as { gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void } }).gPlttBufferFaded;
  if (pf?.get && pf.set) {
    // PaletteBuffer custom : API get/set (la copie indexee etait un NO-OP —
    // la copie BG du mon s affichait avec une palette BG quelconque).
    for (let k = 0; k < 16; k++) pf.set(paletteId * 16 + k, pf.get(256 + battler * 16 + k));
  }
  // scroll : superposer la copie sur le sprite (gBattle_BGn via accesseurs)
  const g = globalThis as Record<string, unknown>;
  const bgX = (-(sprite.x + sprite.x2) + 0x20) & 0xFFFF;
  const bgY = (-(sprite.y + sprite.y2) + 0x20) & 0xFFFF;
  if (toBG_2) { g.gBattle_BG2_X = bgX; g.gBattle_BG2_Y = bgY; }
  else { g.gBattle_BG1_X = bgX; g.gBattle_BG1_Y = bgY; }
  // BG1/BG2 sont CACHES en combat chez nous (post-intro) : montrer + attributs
  // 1:1 (SetAnimBgAttribute PRIORITY=2, SCREEN_SIZE=1).
  const cfg = (rt as unknown as { gba: { bg: (i: number) => { config: { visible: boolean; priority: number; screenSize: number; hofs: number; vofs: number } } } }).gba.bg(bgId).config;
  cfg.visible = true;
  cfg.priority = 2;
  cfg.screenSize = 1;
  _monbgActive[bgId] = true;
  if (setSpriteInvisible) (sprite as { invisible?: boolean }).invisible = true;
}

/** 1:1 décomp `ResetBattleAnimBg(bool8 toBG2)` (battle_anim.c:794-811).
 *  Clear BG1 ou BG2 + reset scroll offsets. */
export function ResetBattleAnimBg(toBG2: boolean): void {
  // 1:1 (net) : demonte la copie monbg du BG vise — meme nettoyage que
  // Cmd_clearmonbg (tilemap vide + BG cache + scroll 0 + tracker).
  const rt = getRuntime();
  const gba = (rt as unknown as { gba?: { bg: (i: number) => { tilemap: Uint16Array; config: { visible: boolean } } } } | null)?.gba;
  const bgId = toBG2 ? 2 : 1;
  if (!_monbgActive[bgId]) return;
  const bg = gba?.bg(bgId);
  if (bg) { bg.tilemap.fill(0); bg.config.visible = false; }
  _monbgActive[bgId] = false;
  const g = globalThis as Record<string, unknown>;
  if (bgId === 1) { g.gBattle_BG1_X = 0; g.gBattle_BG1_Y = 0; }
  else { g.gBattle_BG2_X = 0; g.gBattle_BG2_Y = 0; }
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
  // 1:1 GET_TRUE_SPRITE_INDEX(i) = i - ANIM_SPRITES_START (10000) — le bytecode
  // encode le TAG ABSOLU (ANIM_TAG_X = 10000+idx). L'ancien `& 0x7FFF` ne
  // retirait RIEN puis on RAJOUTAIT 10000 -> tag 20xxx inexistant -> sheet
  // jamais chargee (les CARRES VERTS de Water Gun, user 2026-06-11) ET
  // jamais liberee (unload symetriquement faux -> fuite VRAM des tours).
  const trueIndex = index >= 10000 ? index - 10000 : (index & 0x7FFF);
  // 1:1 : Load par TAG (= gBattleAnimPicTable[idx], tag = 10000 + idx) via le
  // registry des templates (C0 goal 2026-06-11 : le load vient de l'OPCODE,
  // pas seulement du createsprite).
  _loadAnimSheetByTag(10000 + trueIndex);
  _vtrace({ op: 'load', tag: 10000 + trueIndex, tileStart: ((globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number } | undefined)?.GetSpriteTileStartByTag?.(10000 + trueIndex) });
  AddSpriteIndex(trueIndex);
  _pc += 2;
  sAnimFramesToWait = 1;
  gAnimScriptCallback = WaitAnimFrameCount;
}
/** tileStart du tag (sprite.tileBase — AnimateSprite calcule tileBase+frame). */
function _resolveTileBase(tag: number): number {
  const dg = (globalThis as Record<string, unknown>).__decompGlobals as { GetSpriteTileStartByTag?: (t: number) => number } | undefined;
  const v = dg?.GetSpriteTileStartByTag?.(tag);
  return (v !== undefined && v !== 0xFFFF) ? v : 0;
}

// PHASE 0bis (roadmap) : LE LOADER GÉNÉRIQUE par tag — anim-gfx-manifest.json
// (289 entrées générées : tag → {bin, pal, size}). Charge la sheet+palette de
// N'IMPORTE quel tag sans loader manuel. Fallback : l'ancien chemin template.load.
let _animGfxManifest: Record<string, { bin: string; pal: string; size: number; realBytes?: number; tagValue: number }> | null = null;
let _animGfxByValue: Map<number, { bin: string; pal: string; size: number; realBytes?: number }> | null = null;
let _manifestLoading = false;
function _ensureAnimGfxManifest(): void {
  if (_animGfxManifest || _manifestLoading) return;
  _manifestLoading = true;
  void fetch('/decomp/em/battle_anims/anim-gfx-manifest.json')
    .then((r) => r.json())
    .then((j: Record<string, { bin: string; pal: string; size: number; tagValue: number }>) => {
      _animGfxManifest = j;
      _animGfxByValue = new Map();
      for (const e of Object.values(j)) _animGfxByValue.set(e.tagValue, e);
    })
    .catch((e) => { console.warn('[battle-anim] manifest gfx KO', e); _manifestLoading = false; });
}
_ensureAnimGfxManifest();
const _loadedTags = new Set<number>();
/** Marque les plages de tiles des sprites VIVANTS dans le bitmap d'alloc —
 *  les fixes (mons, healthbox@320-447) ne marquent pas le bitmap eux-memes ->
 *  l'allocateur donnait leurs plages aux sheets anim (les « eclats » = tiles
 *  VRAM de la box reecrites par mud_sand, sonde 2026-06-11). Idempotent. */
function _markLiveSpriteTiles(): void {
  const rt = getRuntime();
  const bmp = sSpriteTileAllocBitmap;
  if (!rt || !bmp) return;
  for (const s of rt.gSprites.values()) {
    if (!s.inUse) continue;
    const oam = rt.gba.oam[s.oamIndex];
    if (!oam) continue;
    const tile = oam.tileId ?? 0;
    const size = (oam as { size?: number }).size ?? 0;
    const shape = (oam as { shape?: number }).shape ?? 0;
    const count = shape === 0 ? [1, 4, 16, 64][size] : [2, 8, 16, 32][size];
    for (let n = tile; n < tile + count && n < 1024; n++) {
      bmp[n >> 3] |= (1 << (n & 7));
    }
  }
  // + LES RANGES par tag NON-anim (healthbox 4916x, balls...) : leurs sheets
  // depassent les tiles affichees (box = 128 tiles, sprites n'en montrent
  // que 32 — impact@512 ecrasait les frames non-affichees, 2026-06-11).
  const spSurf = (globalThis as Record<string, unknown>).__sprite as {
    sSpriteTileRangeTags?: Uint16Array; sSpriteTileRanges?: Uint16Array;
  } | undefined;
  const rTags = spSurf?.sSpriteTileRangeTags, rRanges = spSurf?.sSpriteTileRanges;
  if (rTags && rRanges) {
    for (let i = 0; i < rTags.length; i++) {
      const tg = rTags[i];
      if (tg === 0xFFFF || (tg >= 10000 && tg < 20000)) continue; // anims gerees par free/load
      const rs = rRanges[i * 2], rc = rRanges[i * 2 + 1];
      for (let n = rs; n < rs + rc && n < 1024; n++) {
        bmp[n >> 3] |= (1 << (n & 7));
      }
    }
  }
}
function _loadAnimSheetByTag(tag: number): void {
  _markLiveSpriteTiles();
  const entry = _animGfxByValue?.get(tag);
  if (entry) {
    const dg = (globalThis as Record<string, unknown>).__decompGlobals as {
      GetSpriteTileStartByTag?: (t: number) => number;
      LoadCompressedSpriteSheetUsingHeap?: (s: unknown) => void;
      LoadCompressedSpritePaletteUsingHeap?: (s: unknown) => void;
    } | undefined;
    if (dg?.GetSpriteTileStartByTag?.(tag) !== 0xFFFF) return; // deja en VRAM
    const gfxKey = 'gAnimGfxTag_' + tag;
    const palKey = 'gAnimPalTag_' + tag;
    const cache = (globalThis as Record<string, unknown>).__assetCache as Map<string, unknown> | undefined;
    const doLoad = (): void => {
      // ATOMIQUE : marquer les vivants JUSTE avant l'alloc (le marquage au
      // call + alloc au retour de fetch = course — les eclats CUT sur la box).
      _markLiveSpriteTiles();
      // realBytes (la taille REELLE du .bin) PAS entry.size (la table decomp) :
      // un bin plus grand DEBORDAIT l'alloc et reecrivait les tiles suivantes
      // (les eclats CUT sur la box, 2026-06-11).
      dg?.LoadCompressedSpriteSheetUsingHeap?.({ data: gfxKey, size: (entry.realBytes ?? entry.size), tag });
      dg?.LoadCompressedSpritePaletteUsingHeap?.({ data: palKey, tag });
    };
    if (cache?.has(gfxKey)) { doLoad(); return; }
    // fetch async des bins -> retente le load au retour (l'anim attend 1 frame
    // au loadspritegfx 1:1, et les sheets se re-resolvent par tag au createsprite)
    void Promise.all([
      fetch('/decomp/em/battle_anims/sprites/' + entry.bin).then((r) => r.arrayBuffer()),
      fetch('/decomp/em/battle_anims/sprites/' + entry.pal).then((r) => r.arrayBuffer()),
    ]).then(([gb, pb]) => {
      cache?.set(gfxKey, new Uint8Array(gb));
      const pal16 = new Uint16Array(pb);
      cache?.set(palKey, pal16);
      doLoad();
    }).catch((e) => console.warn('[battle-anim] gfx fetch KO tag ' + tag, e));
    return;
  }
  // fallback : l'ancien chemin (templates manuels avec load())
  const reg = (globalThis as Record<string, unknown>).__battleAnimRegistryStore as {
    templates?: Map<string, { tileTag?: number; load?: () => void }>;
  } | undefined;
  if (!reg?.templates) return;
  for (const tpl of reg.templates.values()) {
    if (tpl.tileTag === tag && tpl.load) { _markLiveSpriteTiles(); try { tpl.load(); } catch { /* asset */ } return; }
  }
}
void _loadedTags;

/** 0x01 Cmd_unloadspritegfx (battle_anim.c:348-358).
 *  Free sprite tiles + palette by tag. */
function Cmd_unloadspritegfx(): void {
  _pc++;
  const index = read16(_pc);
  // 1:1 GET_TRUE_SPRITE_INDEX (cf. Cmd_loadspritegfx — meme fix tag absolu).
  const trueIndex = index >= 10000 ? index - 10000 : (index & 0x7FFF);
  // 1:1 battle_anim.c:348-358 : Free tiles + palette par TAG (C0 : la VRAM se
  // LIBERE en fin d'anim -> les 415 moves scalent sans s'accumuler).
  FreeSpriteTilesByTag(10000 + trueIndex);
  // re-marquer l'occupe : le free demarque des tiles que des sprites VIVANTS
  // (healthbox hors-bitmap) utilisent encore (racine eclats VRAM 2026-06-11)
  _markLiveSpriteTiles();
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
  if (!tpl) _vtrace({ op: 'sprite', name: tplName ?? ('0x' + (templatePtr >>> 0).toString(16)), resolved: false });
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
        _markLiveSpriteTiles(); // AVANT l'alloc synchrone (eclats VRAM : impact@320 sur la box)
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
      _vtrace({ op: 'sprite', name: tplName, resolved: true, spriteId, tileTag: tpl.tileTag, cb: (tpl.callback as { name?: string } | undefined)?.name ?? 'none' });
      if (spriteId >= 0) {
        const sp = rt.gSprites?.get(spriteId) as { data?: number[]; callback?: unknown; invisible?: boolean; spriteId?: number } | undefined;
        if (sp) {
          sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
          sp.spriteId = spriteId;
          // CANARI (dette racine 2026-06-11) : attraper l'ECRASEUR de callback
          // des sprites d'anim (les sprites geles en plein vol — eclats Mud-Slap
          // sur la healthbox). Actif si __animCallbackCanary = true (devtool).
          if ((globalThis as Record<string, unknown>).__animCallbackCanary) {
            let _cb = (sp as { callback: unknown }).callback;
            try {
              Object.defineProperty(sp, 'callback', {
                configurable: true,
                get() { return _cb; },
                set(v: unknown) {
                  const name = (v as { name?: string } | null)?.name ?? String(v);
                  if (v === null || /Dummy/i.test(name)) {
                    const nl = String.fromCharCode(10);
                    console.warn('[CANARI] sprite anim #' + spriteId + ' callback ECRASE par ' + name + nl + (new Error().stack ?? '').split(nl).slice(2, 6).join(nl));
                  }
                  _cb = v;
                },
              });
            } catch { /* deja defini */ }
          }
          // 1:1 battle_anim.c:406-410 : CreateSpriteAndAnimate positionne TOUT
          // sprite a (TARGET.X_2, TARGET.Y_PIC_OFFSET) — le flag IS_TARGET ne
          // sert QUE la subpriorite. Les callbacks font ensuite des OFFSETS
          // relatifs (+=). (Fix ciblage crocs/projectiles, 2026-06-11.)
          {
            const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
            const rtg = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x?: number; y?: number; x2?: number; y2?: number }> } | undefined;
            const tgtId = co?.getBattlerMonSpriteId?.(gBattleAnimTarget);
            const tgtSp = tgtId !== undefined && tgtId >= 0 ? rtg?.gSprites?.get(tgtId) : undefined;
            if (tgtSp) {
              (sp as { x: number; y: number }).x = (tgtSp.x ?? 120) + (tgtSp.x2 ?? 0);
              (sp as { x: number; y: number }).y = (tgtSp.y ?? 80) + (tgtSp.y2 ?? 0);
            }
          }
          _scriptSpriteIds.push({ id: spriteId, ref: sp as unknown });
          (sp as { callback: unknown }).callback = tpl.callback;
          if (tpl.tileTag === 0) sp.invisible = true;  // sprite controleur 1:1
          // MOTEUR DE TABLES 1:1 (recadrage user 2026-06-11) : le template
          // porte ses VRAIES tables ANIMCMD -> brancher AnimateSprite
          // (sprite.c:901, ticke tout sprite avec .anims) : anims + tileBase.
          if (tpl.anims && tpl.tileTag && tpl.tileTag > 0) {
            const spA = sp as unknown as {
              anims: ReadonlyArray<ReadonlyArray<unknown>> | null; tileBase: number;
              animNum: number; animCmdIndex: number; animDelayCounter: number;
              animBeginning: boolean; animEnded: boolean;
            };
            spA.anims = tpl.anims;
            spA.tileBase = _resolveTileBase(tpl.tileTag);
            spA.animNum = 0;
            spA.animCmdIndex = 0;
            spA.animDelayCounter = 0;
            spA.animBeginning = true;
            spA.animEnded = false;
          }
          // Pendant AFFINE 1:1 : le template porte le NOM de sa table
          // AFFINEANIMCMD (registre extras) -> BeginAffineAnim/Continue la
          // tick exactement comme la cartouche (deltas, durees, rotations).
          if (tpl.affineAnims && tpl.tileTag && tpl.tileTag > 0) {
            const spF = sp as unknown as {
              affineAnimsTableName: string | null; affineMode: number;
              affineAnimBeginning: boolean; affineAnimEnded: boolean; affineAnimNum: number;
              matrixNum: number;
            };
            spF.affineAnimsTableName = tpl.affineAnims;
            // 1:1 gOamData_AffineNormal_* (les templates anim combat) =
            // ST_OAM_AFFINE_ON (1), PAS DOUBLE (3 = rendu 2x la box -> le
            // hitsplat GEANT vu par le user 2026-06-11).
            spF.affineMode = 1;
            // ...ET dans L'OAM (le point de verite) : la sync retrograde du
            // ticker (sprite-engine-impl:363) ECRASAIT sprite.affineMode avec
            // l'OAM(0) au tick suivant -> plus jamais ticke -> affineAnimEnded
            // jamais pose -> TOUS les hitsplats finissaient au garde-fou 600f
            // (la racine de la signature f~607 du sweep, 2026-06-11 soir).
            {
              const rtO = (globalThis as Record<string, unknown>).__rt as { gba?: { oam?: Array<{ affineMode?: number }> } } | undefined;
              const oamE = rtO?.gba?.oam?.[(sp as { oamIndex?: number }).oamIndex ?? -1];
              if (oamE) oamE.affineMode = 1;
            }
            // 1:1 InitSpriteAffineAnim -> AllocOamMatrix : SA PROPRE matrice.
            // Sans alloc, matrixNum=0 = LA MATRICE DU MON ADVERSE -> l'anim
            // ecrasait la matrice du Wailord = mon deplace/deforme (retour
            // user x2 2026-06-11).
            const rtm = (globalThis as Record<string, unknown>).__rt as { AllocOamMatrix?: () => number } | undefined;
            const m = rtm?.AllocOamMatrix?.();
            if (m !== undefined && m >= 0) spF.matrixNum = m;
            spF.affineAnimNum = 0;
            spF.affineAnimBeginning = true;
            spF.affineAnimEnded = false;
          }
          // ++ AVANT l'appel du callback (1:1 net : en C le callback tourne au
          // tick SUIVANT, le ++ precede toujours ; un callback qui detruit
          // immediatement (gardes-fous) faisait --(clampe 0) puis ++ = compteur
          // FANTOME -> waitforvisualfinish 600f (BodySlam & co, 2026-06-11).
          gAnimVisualTaskCount++;
          tpl.callback(sp);
        }
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
      const tid = rt.CreateTask(taskFn as never, taskPriority);
      // 1:1 battle_anim.c : `taskFunc(taskId);` IMMEDIAT — les args sont encore
      // frais. Sans ça, la task lisait gBattleAnimArgs AU 1ER TICK, APRES que
      // les opcodes suivants du script les aient REECRITS (racine des data
      // corrompues : target=4126(couleur), delay=40… — qualification user
      // 2026-06-11, sonde BodySlam/SolarBeam).
      // ++ AVANT l'appel immediat : le C fait (CreateTask, func(), ++) avec un
      // compteur u8 qui WRAP (une task qui se detruit DANS func() fait 0-- =255
      // puis ++ =0 net). Notre compteur clampe a 0 -> l'ordre C laissait un
      // fantome a 1 -> TOUT move suivant partait au garde-fou (BodySlam 1357f).
      gAnimVisualTaskCount++;
      const tobj = rt.gTasks?.get(tid);
      if (tobj) (taskFn as (t: unknown) => void)(tobj);
      _vtrace({ op: 'task', name: taskName, resolved: true });
    }
    return;
  }
  _vtrace({ op: 'task', name: taskName ?? ('0x' + (taskFuncPtr >>> 0).toString(16)), resolved: false });
  // Non enregistree : PAS d'increment (rien ne decrementerait -> soft-lock
  // waitforvisualfinish). Skip propre = l'anim se termine (dette registry).
  void taskPriority;
  _warnOnceDette('createvisualtask:' + (taskName ?? ('0x' + (taskFuncPtr >>> 0).toString(16))));
}

const _detteWarned = new Set<string>();
// ─── MODE VERIF FIDELITE (qualification 1:1 move-par-move, user 2026-06-11) ──
// __animVerifyMode = true → chaque opcode-cle pushe son issue dans __animTrace.
function _vtrace(e: Record<string, unknown>): void {
  const g = globalThis as Record<string, unknown>;
  if (!g.__animVerifyMode) return;
  (g.__animTrace as unknown[] ?? (g.__animTrace = [])) && (g.__animTrace as unknown[]).push(e);
}
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
    // RESTAURATION des battlers (retour user 2026-06-11 : « des moves
    // deplacent MON pokemon ») : la task de mouvement tuee en plein vol
    // laissait le mon deplace/flippe A JAMAIS. On remet x2/y2/flips/scale.
    _restoreBattlerSprites();
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
let _endGuardFrames = 0;
function Cmd_end(): void {
  // 1:1 décomp C:482-488 : block tant que tasks restantes.
  if (gAnimVisualTaskCount !== 0 || gAnimSoundTaskCount !== 0
   || sMonAnimTaskIdArray[0] !== TASK_NONE || sMonAnimTaskIdArray[1] !== TASK_NONE) {
    // GARDE-FOU (2026-06-11) : Endeavor & co finissent par `end` SANS
    // waitforvisualfinish — un compteur orphelin (splat wait-affine) bloquait
    // a JAMAIS ici (le garde-fou n'existait que sur waitforvisualfinish).
    if (++_endGuardFrames > 600) {
      console.warn(`[battle-anim] Cmd_end > 600 frames (visual=${gAnimVisualTaskCount} sound=${gAnimSoundTaskCount}) — force (garde-fou).`);
      _endGuardFrames = 0;
      gAnimVisualTaskCount = 0;
      gAnimSoundTaskCount = 0;
      sMonAnimTaskIdArray[0] = TASK_NONE;
      sMonAnimTaskIdArray[1] = TASK_NONE;
      _purgeScriptSprites();
      // tombe dans la suite du end (frees + inactive)
    } else {
      sSoundAnimFramesToWait = 0;
      sAnimFramesToWait = 1;
      return;
    }
  }
  _endGuardFrames = 0;

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

  // 1:1 décomp C:508-516 : free remaining sprite tiles/palettes (C0 : les
  // Free par tag REELS maintenant — la VRAM se libere a CHAQUE fin d'anim).
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    if (sAnimSpriteIndexArray[i] !== 0xFFFF) {
      FreeSpriteTilesByTag(10000 + sAnimSpriteIndexArray[i]);
      FreeSpritePaletteByTag(10000 + sAnimSpriteIndexArray[i]);
      sAnimSpriteIndexArray[i] = 0xFFFF;
      _markLiveSpriteTiles(); // re-marquer l'occupe apres le free (eclats VRAM)
    }
  }

  // 1:1 décomp C:520-526 : restore BGM + InitPrioritiesForVisibleBattlers +
  // UpdateOamPriorityInAllHealthboxes. Mark inactive.
  m4aMPlayVolumeControl_BGM(256);
  gAnimScriptActive = false;
  _restoreAnimPalettes();
  // LA PURGE au chemin de fin NORMAL (le trou des residuels : elle n'etait
  // branchee que sur les garde-fous — l'etoile/crocs coinces en wait-affine
  // survivaient a Cmd_end, retours user 2026-06-11).
  _purgeScriptSprites();
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
const _sMonAnimTaskIdArray: number[] = [TASK_NONE, TASK_NONE]; // 1:1 sMonAnimTaskIdArray
function _monSpriteOf(battler: number): { x: number; y: number; x2: number; y2: number; invisible?: boolean } | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(battler);
  return sid !== undefined && sid !== 0xFF ? getRuntime()?.gSprites.get(sid) as never : undefined;
}
/** 1:1 battle_anim.c Task_InitUpdateMonBg : cache le SPRITE (seule la copie BG
 *  s'affiche) + lance Task_UpdateMonBg qui RECALE le scroll BG sur la position
 *  du sprite CHAQUE FRAME — sans ça, la copie reste FIXE pendant les shakes
 *  (ShakeMon2 de Water Gun & co) et un DOUBLE du mon apparaît à ±1px
 *  (bug user 2026-06-11 : « un wailord caché sous wailord pendant le hit »). */
function Task_InitUpdateMonBg(taskId: number): void {
  const t = _gTasks(taskId);
  const battler = t.data[0];      // tBattlerId
  const inBg2 = t.data[1] !== 0;  // tInBg2
  const active = t.data[2] !== 0; // tActive
  const isPartner = t.data[3];    // tIsPartner
  const sprite = _monSpriteOf(battler);
  if (sprite) sprite.invisible = true;
  if (!active || !sprite) { DestroyAnimVisualTask(taskId); return; }
  const updateTaskId = CreateTask(Task_UpdateMonBg, 10);
  if (updateTaskId !== TASK_NONE) {
    const u = _gTasks(updateTaskId);
    const g = globalThis as Record<string, unknown>;
    u.data[0] = battler;                          // t2_BattlerId
    u.data[1] = inBg2 ? 1 : 0;                    // t2_InBg2
    u.data[2] = sprite.x + sprite.x2;             // t2_SpriteX
    u.data[3] = sprite.y + sprite.y2;             // t2_SpriteY
    u.data[4] = (inBg2 ? (g.gBattle_BG2_X as number) : (g.gBattle_BG1_X as number)) ?? 0; // t2_BgX
    u.data[5] = (inBg2 ? (g.gBattle_BG2_Y as number) : (g.gBattle_BG1_Y as number)) ?? 0; // t2_BgY
    _sMonAnimTaskIdArray[isPartner] = updateTaskId;
  }
  DestroyAnimVisualTask(taskId);
}
/** 1:1 battle_anim.c:813 Task_UpdateMonBg : la copie BG SUIT le sprite. */
function Task_UpdateMonBg(taskId: number): void {
  const t = _gTasks(taskId);
  const battler = t.data[0];
  const inBg2 = t.data[1] !== 0;
  const sprite = _monSpriteOf(battler);
  if (!sprite) return;
  const dx = t.data[2] - (sprite.x + sprite.x2);
  const dy = t.data[3] - (sprite.y + sprite.y2);
  const g = globalThis as Record<string, unknown>;
  if (!inBg2) {
    g.gBattle_BG1_X = (dx + t.data[4]) & 0xFFFF;
    g.gBattle_BG1_Y = (dy + t.data[5]) & 0xFFFF;
  } else {
    g.gBattle_BG2_X = (dx + t.data[4]) & 0xFFFF;
    g.gBattle_BG2_Y = (dy + t.data[5]) & 0xFFFF;
  }
  // 1:1 : palette OBJ -> BG recopiée chaque frame (suit les blends)
  const pf = (getRuntime() as unknown as { gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void } } | null)?.gPlttBufferFaded;
  if (pf?.get && pf.set) {
    const palId = inBg2 ? 9 : 8;
    for (let k = 0; k < 16; k++) pf.set(palId * 16 + k, pf.get(256 + battler * 16 + k));
  }
}

/** 0x0B Cmd_clearmonbg (battle_anim.c:852-883).
 *  Restore battler sprite from BG, destroy update task. */
function Cmd_clearmonbg(): void {
  _pc++;
  let animBattlerId = read8(_pc);
  if (animBattlerId === ANIM_ATTACKER) animBattlerId = ANIM_ATK_PARTNER;
  else if (animBattlerId === ANIM_TARGET) animBattlerId = ANIM_DEF_PARTNER;
  const battler = (animBattlerId === ANIM_ATTACKER || animBattlerId === ANIM_ATK_PARTNER) ? gBattleAnimAttacker : gBattleAnimTarget;
  // 1:1 Task_ClearMonBg (net, single) : re-montrer le sprite du battler
  // (les anims type DefensiveWall le cachent via la copie BG), vider le BG
  // anime + scroll. (chantier monbg 2026-06-11 — la version etait deferred.)
  {
    const rt = getRuntime();
    const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
    const sid = co?.getBattlerMonSpriteId?.(battler);
    const sprite = sid !== undefined && sid !== 0xFF ? rt?.gSprites.get(sid) : undefined;
    if (sprite) (sprite as { invisible?: boolean }).invisible = false;
    // 1:1 Task_ClearMonBg : detruire les Task_UpdateMonBg actives (sinon elles
    // continuent d'ecraser le scroll BG apres le demontage)
    for (let i = 0; i < 2; i++) {
      if (_sMonAnimTaskIdArray[i] !== TASK_NONE) {
        rt?.DestroyTask?.(_sMonAnimTaskIdArray[i]);
        _sMonAnimTaskIdArray[i] = TASK_NONE;
      }
    }
    const gba = (rt as unknown as { gba?: { bg: (i: number) => { tilemap: Uint16Array; config: { visible: boolean } } } } | null)?.gba;
    const g = globalThis as Record<string, unknown>;
    for (const bgId of [1, 2]) {
      // NE toucher QUE les BG reellement actives par monbg (toucher BG2
      // aveuglement corrompait la zone menu — tilemap zero + garbage tile 0,
      // les « dents de scie » du screenshot 2026-06-11).
      if (!_monbgActive[bgId]) continue;
      const bg = gba?.bg(bgId);
      if (bg) { bg.tilemap.fill(0); bg.config.visible = false; }
      _monbgActive[bgId] = false;
      if (bgId === 1) { g.gBattle_BG1_X = 0; g.gBattle_BG1_Y = 0; }
      else { g.gBattle_BG2_X = 0; g.gBattle_BG2_Y = 0; }
    }
  }
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
  // 1:1 battle_anim.c:1616-1633 via le registry (meme pattern que
  // Cmd_createvisualtask — fix 2026-06-11 : l'increment SANS task etait LE
  // bloqueur des 15 moves rouges du sweep, le compteur ne redescendait jamais).
  const fnName = animSymbolName(funcPtr);
  const fn = fnName ? lookupAnimTask(fnName) : undefined;
  if (fn) {
    const rt = getRuntime();
    if (rt) {
      const tid = rt.CreateTask(fn as never, 1);
      // 1:1 : appel IMMEDIAT (args frais — cf. Cmd_createvisualtask).
      gAnimSoundTaskCount++; // ++ AVANT l'appel (cf. visualtask : wrap u8 du C)
      const tobj = rt.gTasks?.get(tid);
      if (tobj) (fn as (t: unknown) => void)(tobj);
    }
    return;
  }
  // Non enregistree : PAS d'increment (skip propre, dette registry).
  _warnOnceDette('createsoundtask:' + (fnName ?? ('0x' + (funcPtr >>> 0).toString(16))));
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
// SNAPSHOT palettes par anim (filet rainbow user 2026-06-11) : Unfaded est un
// alias de Faded dans ce runtime -> on capture les 512 u16 au LAUNCH et on
// restaure BG1-3 + OBJ au end/garde-fou (les blends coupes ne s'accumulent plus).
let _palSnapshot: Uint16Array | null = null;
export function _snapshotAnimPalettes(): void {
  const rt = getRuntime() as unknown as { gPlttBufferFaded?: { subarray?: (a: number, b: number) => Uint16Array } } | null;
  const buf = rt?.gPlttBufferFaded as unknown as Uint16Array | undefined;
  if (buf?.length) _palSnapshot = buf.slice(0, 512);
}
export function _restoreAnimPalettes(): void {
  const rt = getRuntime() as unknown as { gPlttBufferFaded?: Uint16Array } | null;
  const buf = rt?.gPlttBufferFaded;
  if (buf && _palSnapshot) {
    buf.set(_palSnapshot.subarray(16, 64), 16);     // BG 1-3
    buf.set(_palSnapshot.subarray(256, 512), 256);  // OBJ
  }
}

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
  DestroyAnimVisualTask, DestroyAnimSprite, DestroyAnimSoundTask,
  DoMoveAnim, tickAnimScript, isAnimScriptActive, setBattleAnimAttackerTarget,
  // CLEANUP DUR post-timeout (sweep cascades) : zero-er l'etat anim complet.
  forceFinishAnim: () => {
    gAnimVisualTaskCount = 0;
    gAnimSoundTaskCount = 0;
    sMonAnimTaskIdArray[0] = TASK_NONE;
    sMonAnimTaskIdArray[1] = TASK_NONE;
    sAnimFramesToWait = 0;
    sSoundAnimFramesToWait = 0;
    gAnimScriptActive = false;
    _purgeScriptSprites();
    // FILETS post-coupe (retours user 2026-06-11 « rainbow épileptique » +
    // « Wailord mal placé ») : un blend/slide coupé à mi-course laissait
    // (a) des teintes résiduelles accumulées dans gPlttBufferFaded,
    // (b) x2 résiduel sur les battlers. Restaurer = recopier Unfaded->Faded
    // (BG 1-3 + OBJ) + x2=0 battlers (y2 = le bob idle, on n'y touche pas).
    try {
      const rt = getRuntime() as unknown as {
        gPlttBufferUnfaded?: Uint16Array; gPlttBufferFaded?: Uint16Array;
        gSprites?: Map<number, { x2: number; inUse?: boolean; callback?: { name?: string } | null }>;
      } | null;
      _restoreAnimPalettes(); // snapshot du Launch (Unfaded = alias Faded ici)
      if (rt?.gSprites) {
        for (const sp of rt.gSprites.values()) {
          const n = sp.callback?.name ?? '';
          if (sp.inUse && /HealthBox|MonFromBall|CallbackDummy/i.test(n)) sp.x2 = 0;
        }
      }
    } catch { /* best effort */ }
  },
};
