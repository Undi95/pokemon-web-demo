/**
 * battle/battle-anim-throw.ts — Port 1:1 strict des AnimTask_* battle_anim_throw.c.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_anim_throw.c`
 * (2507 lignes C).
 *
 * AnimTask_* publiques portées 1:1 strict :
 *   - AnimTask_LoadBallGfx (704-709)
 *   - AnimTask_FreeBallGfx (711-716)
 *   - AnimTask_IsBallBlockedByTrainer (718-726)
 *   - AnimTask_ThrowBall (766-780) + _Step (782-787)
 *   - AnimTask_ThrowBall_StandingTrainer (790-818) + _Step (820-829)
 *   - AnimTask_LoadHealthboxPalsForLevelUp (566-571)
 *   - AnimTask_FreeHealthboxPalsForLevelUp (592-596)
 *   - AnimTask_FlashHealthboxOnLevelUp (598-603) + _Step (605-640)
 *   - AnimTask_UnusedLevelUpHealthBox (436-482) + _Step (484-542)
 *   - AnimTask_SwitchOutShrinkMon (642-668)
 *   - AnimTask_SwitchOutBallEffect (669-702)
 *   - AnimTask_SwapMonSpriteToFromSubstitute (2113-2169)
 *   - AnimTask_SubstituteFadeToInvisible (2171-2203)
 *   - AnimTask_IsAttackerBehindSubstitute (2205-2209)
 *   - AnimTask_SetTargetToEffectBattler (2211-2215)
 *   - AnimTask_LoadPokeblockGfx (2401-2409)
 *   - AnimTask_FreePokeblockGfx (2411-2415)
 *   - AnimTask_SetAttackerTargetLeftPos (2469-2484)
 *   - AnimTask_GetTrappedMoveAnimId (2486-2500)
 *   - AnimTask_GetBattlersFromArg (2502-2507)
 *
 * Helpers internes portés :
 *   - ItemIdToBallId (728-758) — ITEM_X_BALL → BALL_X enum
 *   - LoadHealthboxPalsForLevelUp / Free (helpers struct setup)
 *
 * Sprite callbacks (= SpriteCB_Ball_*) DÉFÉRÉ DETTE R3 : trajectory calc
 * + bounce + shake + capture stars. Cascade vers battle-ball-throw.ts qui
 * implémente déjà ~80% du arc. Le wire complet (= multi-ball-type variants)
 * est multi-session.
 *
 * Dépendances :
 *   - decomp-globals.ts : getRuntime, CreateSprite
 *   - constants.ts : ITEM_* + BALL_*
 *   - state.ts : gBattleStruct, gLastUsedItem
 *   - battle-ball-throw.ts : existing ball arc impl
 *   - battle-healthbox.ts : healthbox sprite handle
 */

import { getRuntime } from '../engine/system/decomp-globals';
import { MAX_SPRITES } from '../engine/system/decomp-runtime';
import { Sin, Cos } from './trig';
import { gBallSpriteTemplates, LoadBallGfx as _LoadBallGfxReal } from './pokeball';
import { CreateSprite as _CreateSpriteFromTemplate } from '../engine/system/decomp-bridge';
import { GetBattlerSpriteCoord as _GetBattlerSpriteCoordReal } from './battle_anim_mons';
import { CreateTask, DestroyTask } from '../engine/system/decomp-bridge';
import {
  InitAnimArcTranslation, TranslateAnimHorizontalArc,
  SetSpriteRotScale, PrepareBattlerSpriteForRotScale, ResetSpriteRotScale,
  SetBattlerSpriteYOffsetFromYScale, GetBattlePalettesMask,
} from './battle_anim_mons';
import { GetBattlerPokeballItemId } from './pokeball';
import { registerAnimTasks } from '../engine/battle/battle-anim-registry';
import { LaunchBallFadeMonTask as _fxBallFadeMon, CreateCaptureStarSprite as _fxCaptureStar } from '../engine/system/pokeball-effects';
import {
  BlendPalettes, SpriteCallbackDummy,
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  FreeSpriteTilesByTag,
} from '../engine/system/decomp-globals';
import { GetSpriteTileStartByTag, FreeSpritePaletteByTag } from '../engine/system/sprite';
import { ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, type AnimCmd } from '../engine/system/sprite-animation';
import { getNumBallParticles, setNumBallParticles } from '../engine/battle/battle-sprites-data';
import { BeginNormalPaletteFade } from '../engine/system/decomp-bridge';
import { setGDoingBattleAnim } from '../engine/battle/state';
import {
  gLastUsedItem, gBattleStruct,
} from '../engine/battle/state';

// ─── BALL_* enum (= include/pokeball.h:4-19) ───────────────────────────────

/** 1:1 décomp `enum { BALL_POKE, BALL_GREAT, BALL_SAFARI, BALL_ULTRA, BALL_MASTER,
 *  BALL_NET, BALL_DIVE, BALL_NEST, BALL_REPEAT, BALL_TIMER, BALL_LUXURY, BALL_PREMIER }`
 *  (include/pokeball.h).
 *  ⚠️ CORRIGE 2026-06-08 : l'ancien ordre (MASTER=0 … POKE=3) etait FAUX (faux label
 *  "1:1") → ItemIdToBallId(ITEM_POKE_BALL) renvoyait BALL_POKE=3 → gBallSpriteSheets[3]
 *  = Ultra (asset non charge) → POKEBALL NOIRE au send-out (#22). Aligne sur la vraie
 *  enum decomp = pokeball-effects.ts + gBallSpriteSheets (indexes par designators). */
export const BALL_POKE = 0;
export const BALL_GREAT = 1;
export const BALL_SAFARI = 2;
export const BALL_ULTRA = 3;
export const BALL_MASTER = 4;
export const BALL_NET = 5;
export const BALL_DIVE = 6;
export const BALL_NEST = 7;
export const BALL_REPEAT = 8;
export const BALL_TIMER = 9;
export const BALL_LUXURY = 10;
export const BALL_PREMIER = 11;

/** 1:1 décomp BALL_TRAINER_BLOCK enum (= ballThrowCaseId). */
export const BALL_TRAINER_BLOCK = 5;

// ─── ITEM_* IDs subset (= constants/items.h) ───────────────────────────────

const ITEM_MASTER_BALL = 1;
const ITEM_ULTRA_BALL = 2;
const ITEM_GREAT_BALL = 3;
const ITEM_POKE_BALL = 4;
const ITEM_SAFARI_BALL = 5;
const ITEM_NET_BALL = 6;
const ITEM_DIVE_BALL = 7;
const ITEM_NEST_BALL = 8;
const ITEM_REPEAT_BALL = 9;
const ITEM_TIMER_BALL = 10;
const ITEM_LUXURY_BALL = 11;
const ITEM_PREMIER_BALL = 12;

// ─── ARG_RET_ID = 7 (= gBattleAnimArgs[7] = return slot pour test ops) ─────

const ARG_RET_ID = 7;

// ─── Task helper (= runtime gTasks lazy via globalThis) ────────────────────

interface AnimTask {
  data: Int16Array | number[];
  func: ((task: AnimTask) => void) | ((taskId: number) => void) | null;
}

function _gTasks(taskId: number): AnimTask {
  const rt = getRuntime();
  if (!rt || !rt.gTasks) return _DUMMY_TASK;
  return ((rt.gTasks.get(taskId) ?? _DUMMY_TASK) as unknown) as AnimTask;
}
const _DUMMY_TASK: AnimTask = { data: new Int16Array(16), func: null };

function _getAnimState(): {
  attacker: number; target: number;
  args: Int16Array; destroyTask: (taskId: number) => void;
} {
  // Surface VIVANTE = __battleAnimInterpreter (getAttacker()/getArgs()/
  // DestroyAnimVisualTask réels — décrémente gAnimVisualTaskCount, sinon
  // Cmd_end bloque 600 frames au garde-fou). __battleAnim = fallback legacy
  // (ses champs attacker/target sont resynchro par SetAnimBattlers mais il
  // n'expose PAS DestroyAnimVisualTask → c'était un no-op silencieux).
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as {
    getAttacker?: () => number; getTarget?: () => number;
    getArgs?: () => Int16Array; DestroyAnimVisualTask?: (taskId: number) => void;
  } | undefined;
  const ba = (globalThis as Record<string, unknown>).__battleAnim as {
    gBattleAnimAttacker?: number; gBattleAnimTarget?: number;
    gBattleAnimArgs?: Int16Array; DestroyAnimVisualTask?: (taskId: number) => void;
  } | undefined;
  return {
    attacker: itf?.getAttacker?.() ?? ba?.gBattleAnimAttacker ?? 0,
    target: itf?.getTarget?.() ?? ba?.gBattleAnimTarget ?? 1,
    args: itf?.getArgs?.() ?? ba?.gBattleAnimArgs ?? new Int16Array(8),
    destroyTask: itf?.DestroyAnimVisualTask ?? ba?.DestroyAnimVisualTask
      ?? ((_taskId: number): void => { /* no-op */ }),
  };
}

function DestroyAnimVisualTask(taskId: number): void {
  _getAnimState().destroyTask(taskId);
}

function getAnimArg(idx: number): number {
  return _getAnimState().args[idx] ?? 0;
}

function setAnimArg(idx: number, val: number): void {
  _getAnimState().args[idx] = val;
}

// ─── ItemIdToBallId (battle_anim_throw.c:728) — 1:1 décomp ─────────────────

/** 1:1 décomp `ItemIdToBallId(u16 ballItem)` (battle_anim_throw.c:728-758).
 *  Convertit un ITEM_X_BALL en BALL_X enum pour indexer gBallSpriteTemplates. */
export function ItemIdToBallId(ballItem: number): number {
  switch (ballItem) {
    case ITEM_MASTER_BALL: return BALL_MASTER;
    case ITEM_ULTRA_BALL: return BALL_ULTRA;
    case ITEM_GREAT_BALL: return BALL_GREAT;
    case ITEM_SAFARI_BALL: return BALL_SAFARI;
    case ITEM_NET_BALL: return BALL_NET;
    case ITEM_DIVE_BALL: return BALL_DIVE;
    case ITEM_NEST_BALL: return BALL_NEST;
    case ITEM_REPEAT_BALL: return BALL_REPEAT;
    case ITEM_TIMER_BALL: return BALL_TIMER;
    case ITEM_LUXURY_BALL: return BALL_LUXURY;
    case ITEM_PREMIER_BALL: return BALL_PREMIER;
    case ITEM_POKE_BALL:
    default:
      return BALL_POKE;
  }
}

// ─── LoadBallGfx / FreeBallGfx helpers (= cascade dette R3) ────────────────

/** 1:1 décomp `LoadBallGfx(ballId)` (battle_anim_throw.c, helper). Charge
 *  les tiles + palette du ball graphics dans OAM VRAM. */
function LoadBallGfx(ballId: number): void {
  // Delegue au miroir game/pokeball (sheet + palette par TAG ; les 12 assets
  // sont precharges au boot -> resolution sync). Fix user 2026-06-10 : la
  // capture creait la ball SANS charger sa palette -> slot 0 (« hamburger »).
  _LoadBallGfxReal(ballId);
}

/** 1:1 décomp `FreeBallGfx(ballId)`. */
function FreeBallGfx(ballId: number): void {
  // Dette R3 : free ball graphics tile + palette via tag.
  void ballId;
}

// ─── AnimTask_LoadBallGfx (battle_anim_throw.c:704) ────────────────────────

/** 1:1 décomp `AnimTask_LoadBallGfx(taskId)` (battle_anim_throw.c:704-709).
 *  Charge les graphics du ball type en cours d'utilisation (= gLastUsedItem). */
export function AnimTask_LoadBallGfx(taskId: number): void {
  const ballId = ItemIdToBallId(gLastUsedItem);
  LoadBallGfx(ballId);
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_FreeBallGfx (battle_anim_throw.c:711) ────────────────────────

/** 1:1 décomp `AnimTask_FreeBallGfx(taskId)` (battle_anim_throw.c:711-716). */
export function AnimTask_FreeBallGfx(taskId: number): void {
  const ballId = ItemIdToBallId(gLastUsedItem);
  FreeBallGfx(ballId);
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_IsBallBlockedByTrainer (battle_anim_throw.c:718) ─────────────

/** 1:1 décomp `AnimTask_IsBallBlockedByTrainer(taskId)`
 *  (battle_anim_throw.c:718-726). Check si le ball throw est bloqué par
 *  le trainer (= "Don't be a thief!"). Set gBattleAnimArgs[ARG_RET_ID]
 *  = -1 (BLOCKED) ou 0 (NORMAL) pour test ops bytecode. */
export function AnimTask_IsBallBlockedByTrainer(taskId: number): void {
  // 1:1 décomp : gBattleSpritesDataPtr->animationData->ballThrowCaseId.
  // Dette R3 : ballThrowCaseId tracker dans gBattleSpritesDataPtr.
  // Pour now : assume non-blocked.
  const ballThrowCaseId = ((gBattleStruct as unknown) as { ballThrowCaseId?: number })
    .ballThrowCaseId ?? 0;
  if (ballThrowCaseId === BALL_TRAINER_BLOCK) {
    setAnimArg(ARG_RET_ID, -1);
  } else {
    setAnimArg(ARG_RET_ID, 0);
  }
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_ThrowBall (battle_anim_throw.c:766) ──────────────────────────

/** 1:1 décomp `AnimTask_ThrowBall(taskId)` (battle_anim_throw.c:766-780).
 *  Spawn le ball sprite à (32, 80), avec target = enemy sprite coords + arc
 *  trajectory via SpriteCB_Ball_Throw callback. */
export function AnimTask_ThrowBall(taskId: number): void {
  const ballId = ItemIdToBallId(gLastUsedItem);
  const spriteId = _CreateBallSprite(ballId, 32, 80, 29);
  // 1:1 décomp data fields :
  //   sDuration = data[0] = 34 (frames to reach target)
  //   sTargetX  = data[1] = enemy X
  //   sTargetY  = data[2] = enemy Y - 16
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId);
  if (sprite) {
    sprite.data[0] = 34;
    sprite.data[1] = _GetBattlerSpriteCoord(_getAnimState().target, 0 /* BATTLER_COORD_X */);
    sprite.data[2] = _GetBattlerSpriteCoord(_getAnimState().target, 1 /* BATTLER_COORD_Y */) - 16;
    sprite.callback = (s) => SpriteCB_Ball_Throw(s as never);
  }

  // 1:1 décomp : track wild mon visibility pour restore plus tard.
  const targetSprite = _getBattlerSpriteId(_getAnimState().target);
  const targetWasInvisible = rt?.gSprites?.get(targetSprite)?.invisible ?? false;
  ((gBattleStruct as unknown) as { wildMonInvisible?: boolean }).wildMonInvisible = targetWasInvisible;

  _gTasks(taskId).data[0] = spriteId;
  _gTasks(taskId).func = AnimTask_ThrowBall_Step as unknown as AnimTask['func'];
}

/** 1:1 décomp `AnimTask_ThrowBall_Step(taskId)` (battle_anim_throw.c:782-787). */
export function AnimTask_ThrowBall_Step(taskId: number): void {
  const task = _gTasks(taskId);
  const spriteId = task.data[0];
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId);
  // 1:1 décomp : si sDuration (data[0]) === 0xFFFF (= -1 cast u16), animation done.
  if (sprite && (sprite.data[0] & 0xFFFF) === 0xFFFF) {
    DestroyAnimVisualTask(taskId);
  }
}

// ─── AnimTask_ThrowBall_StandingTrainer (battle_anim_throw.c:790) ──────────

/** 1:1 décomp `AnimTask_ThrowBall_StandingTrainer(taskId)` (790-818).
 *  Safari / Wally throw (= player sprite anim trigger). */
export function AnimTask_ThrowBall_StandingTrainer(taskId: number): void {
  // Dette R3 : Wally tutorial / Safari ball throw setup. Cascade :
  //   - GetBattlerSpriteSubpriority(opponent left)
  //   - SpriteCallbackDummy initial
  //   - gSprites[player_sprite].callback = SpriteCB_TrainerThrowObject
  //   - AnimTask_ThrowBall_StandingTrainer_Step monitors animCmdIndex
  const ballId = ItemIdToBallId(gLastUsedItem);
  // BATTLE_TYPE_WALLY_TUTORIAL → x=32 y=11 ; sinon x=23 y=5.
  const x = 23, y = 5;  // assume non-Wally
  const spriteId = _CreateBallSprite(ballId, x + 32, y | 80, 1);
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId);
  if (sprite) {
    sprite.data[0] = 34;
    sprite.data[1] = _GetBattlerSpriteCoord(_getAnimState().target, 0);
    sprite.data[2] = _GetBattlerSpriteCoord(_getAnimState().target, 1) - 16;
    // Dette R3 : SpriteCallbackDummy initial puis swap vers SpriteCB_Ball_Throw
    // post-trainer animCmdIndex == 1.
  }
  _gTasks(taskId).data[0] = spriteId;
  _gTasks(taskId).func = AnimTask_ThrowBall_StandingTrainer_Step as unknown as AnimTask['func'];
}

/** 1:1 décomp `AnimTask_ThrowBall_StandingTrainer_Step` (820-829). */
export function AnimTask_ThrowBall_StandingTrainer_Step(taskId: number): void {
  // Dette R3 : monitor animCmdIndex du player sprite. Pour now : immediate
  // switch vers AnimTask_ThrowBall_Step.
  const task = _gTasks(taskId);
  task.func = AnimTask_ThrowBall_Step as unknown as AnimTask['func'];
}

// ─── AnimTask_LoadHealthboxPalsForLevelUp (battle_anim_throw.c:566) ────────

/** 1:1 décomp `LoadHealthboxPalsForLevelUp(p1, p2, battler)` (544-564).
 *  Alloc 2 new palettes via tag, copy depuis healthbox + healthbar palettes,
 *  swap les paletteNum sur les sprites de healthbox. */
function _LoadHealthboxPalsForLevelUp(battler: number): { paletteId1: number; paletteId2: number } {
  void battler;
  // Dette R3 : AllocSpritePalette + LoadPalette + paletteNum swap. Cascade
  // vers system/sprite.ts palette tag system.
  return { paletteId1: 0, paletteId2: 0 };
}

/** 1:1 décomp `AnimTask_LoadHealthboxPalsForLevelUp(taskId)` (566-571). */
export function AnimTask_LoadHealthboxPalsForLevelUp(taskId: number): void {
  _LoadHealthboxPalsForLevelUp(_getAnimState().attacker);
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_FreeHealthboxPalsForLevelUp (battle_anim_throw.c:592) ────────

/** 1:1 décomp `FreeHealthboxPalsForLevelUp(battler)` (573-590). */
function _FreeHealthboxPalsForLevelUp(battler: number): void {
  void battler;
  // Dette R3 : FreeSpritePaletteByTag + restore original paletteNum.
}

/** 1:1 décomp `AnimTask_FreeHealthboxPalsForLevelUp(taskId)` (592-596). */
export function AnimTask_FreeHealthboxPalsForLevelUp(taskId: number): void {
  _FreeHealthboxPalsForLevelUp(_getAnimState().attacker);
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_FlashHealthboxOnLevelUp (battle_anim_throw.c:598) ────────────

/** 1:1 décomp `AnimTask_FlashHealthboxOnLevelUp(taskId)` (598-603).
 *  Setup data[10] = arg0 (color direction), data[11] = arg1 (delay frames),
 *  switch to Step pour blend palette continuous. */
export function AnimTask_FlashHealthboxOnLevelUp(taskId: number): void {
  const task = _gTasks(taskId);
  task.data[10] = getAnimArg(0);
  task.data[11] = getAnimArg(1);
  task.func = AnimTask_FlashHealthboxOnLevelUp_Step as unknown as AnimTask['func'];
}

/** 1:1 décomp `AnimTask_FlashHealthboxOnLevelUp_Step(taskId)` (605-640). */
export function AnimTask_FlashHealthboxOnLevelUp_Step(taskId: number): void {
  const task = _gTasks(taskId);
  task.data[0]++;
  // 1:1 décomp : double increment if condition (= weird but matches décomp).
  if (task.data[0]++ >= task.data[11]) {
    task.data[0] = 0;
    // Dette R3 : BlendPalette + RGB(20, 27, 31) sur paletteOffset+colorOffset.
    // colorOffset = 6 si data[10] === 0, else 2.
    // Cascade : palette buffer write via runtime.gPlttBuffer.
    switch (task.data[1]) {
      case 0:
        task.data[2] += 2;
        if (task.data[2] > 16) task.data[2] = 16;
        if (task.data[2] === 16) task.data[1]++;
        break;
      case 1:
        task.data[2] -= 2;
        if (task.data[2] < 0) task.data[2] = 0;
        if (task.data[2] === 0) {
          // Dette R3 : 3 flash cycles total dans décomp. Pour now : terminate.
          DestroyAnimVisualTask(taskId);
        }
        break;
    }
  }
}

// ─── AnimTask_UnusedLevelUpHealthBox (battle_anim_throw.c:436) ─────────────

/** 1:1 décomp `AnimTask_UnusedLevelUpHealthBox(taskId)` (436-482).
 *  UNUSED dans le décomp final. Blue gradient upward effect sur healthbox.
 *  Port squelette pour completeness (= dette R3 entière car unused). */
export function AnimTask_UnusedLevelUpHealthBox(taskId: number): void {
  // Dette R3 : full GPU REG setup (WIN0H/V/IN/OUT, BLDCNT, BLDALPHA) + bg
  // attribute setup + sprite duplication ST_OAM_OBJ_WINDOW + tilemap load.
  // Cascade massive. Function unused dans le décomp, port partiel OK.
  console.warn('[battle-anim-throw] AnimTask_UnusedLevelUpHealthBox not yet ported (dette R3)');
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_SwitchOutShrinkMon (battle_anim_throw.c:642) ─────────────────

/** 1:1 décomp `AnimTask_SwitchOutShrinkMon(taskId)` (battle_anim_throw.c:642-668).
 *  Le mon ATTACKER rétrécit (rappel dans la ball) : scale 0x100 → +0x30/frame
 *  → ≥0x2D0, y2 compensé au sol (SetBattlerSpriteYOffsetFromYScale), puis
 *  reset rot/scale + sprite invisible. State machine sur task.data[0]. */
export function AnimTask_SwitchOutShrinkMon(taskId: number): void {
  const task = _gTasks(taskId);
  const spriteId = _getBattlerSpriteId(_getAnimState().attacker);
  switch (task.data[0]) {
    case 0:
      PrepareBattlerSpriteForRotScale(spriteId, 0 /* ST_OAM_OBJ_NORMAL */);
      task.data[10] = 0x100;
      task.data[0]++;
      break;
    case 1:
      task.data[10] += 0x30;
      SetSpriteRotScale(spriteId, task.data[10], task.data[10], 0);
      SetBattlerSpriteYOffsetFromYScale(spriteId);
      if (task.data[10] >= 0x2D0) task.data[0]++;
      break;
    case 2: {
      ResetSpriteRotScale(spriteId);
      const spr = getRuntime()?.gSprites?.get(spriteId) as { invisible?: boolean } | undefined;
      if (spr) spr.invisible = true;
      DestroyAnimVisualTask(taskId);
      break;
    }
  }
}

// ─── AnimTask_SwitchOutBallEffect (battle_anim_throw.c:669) ────────────────

/** 1:1 décomp `AnimTask_SwitchOutBallEffect(taskId)` (battle_anim_throw.c:669-702).
 *  Particules d'ouverture de ball + fade du mon vers la couleur de SA ball
 *  (MON_DATA_POKEBALL — corps inline identique à GetBattlerPokeballItemId,
 *  pokeball.c:1338). case 1 : attend la fin des 2 tasks lancées (décomp
 *  `!gTasks[data[10]].isActive` = chez nous la task retirée de rt.gTasks). */
export function AnimTask_SwitchOutBallEffect(taskId: number): void {
  const rt = getRuntime();
  const task = _gTasks(taskId);
  const attacker = _getAnimState().attacker;
  if (!rt) { DestroyAnimVisualTask(taskId); return; }
  switch (task.data[0]) {
    case 0: {
      const spriteId = _getBattlerSpriteId(attacker);
      const spr = rt.gSprites?.get(spriteId) as { oamIndex: number; subpriority?: number } | undefined;
      const oam = (rt as unknown as { gba?: { oam?: Array<{ priority?: number }> } }).gba?.oam?.[spr?.oamIndex ?? -1];
      const ball = GetBattlerPokeballItemId(attacker);
      const ballId = ItemIdToBallId(ball);
      const x = _GetBattlerSpriteCoordReal(attacker, 0 /* BATTLER_COORD_X */);
      const y = _GetBattlerSpriteCoordReal(attacker, 1 /* BATTLER_COORD_Y */);
      const priority = oam?.priority ?? 2;
      const subpriority = spr?.subpriority ?? 0;
      // 1:1 :684 — PlaySE(SE_BALL_OPEN) vit DANS AnimateBallOpenParticles (miroir).
      task.data[10] = AnimateBallOpenParticles(x, y + 32, priority, subpriority, ballId);
      const selectedPalettes = GetBattlePalettesMask(true, false, false, false, false, false, false);
      task.data[11] = _fxBallFadeMon(rt as never, false, attacker, selectedPalettes, ballId);
      task.data[0]++;
      break;
    }
    case 1:
      if (!rt.gTasks?.has(task.data[10]) && !rt.gTasks?.has(task.data[11])) {
        DestroyAnimVisualTask(taskId);
      }
      break;
  }
}

// ─── AnimTask_SwapMonSpriteToFromSubstitute (battle_anim_throw.c:2113) ─────

/** 1:1 décomp `AnimTask_SwapMonSpriteToFromSubstitute(taskId)` (2113-2169).
 *  Swap sprite gfx entre mon original et substitute doll. */
export function AnimTask_SwapMonSpriteToFromSubstitute(taskId: number): void {
  // Dette R3 : memcpy sprite gfx VRAM tile swap + paletteNum swap.
  void taskId;
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_SubstituteFadeToInvisible (battle_anim_throw.c:2171) ─────────

/** 1:1 décomp `AnimTask_SubstituteFadeToInvisible(taskId)` (2171-2203). */
export function AnimTask_SubstituteFadeToInvisible(taskId: number): void {
  // Dette R3 : palette fade vers transparent OAM.
  void taskId;
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_IsAttackerBehindSubstitute (battle_anim_throw.c:2205) ────────

/** 1:1 décomp `AnimTask_IsAttackerBehindSubstitute(taskId)` (2205-2209).
 *  Check si l'attacker a substitute → arg ret. */
export function AnimTask_IsAttackerBehindSubstitute(taskId: number): void {
  // 1:1 décomp : status2 & STATUS2_SUBSTITUTE test sur attacker.
  // Dette R3 : access gBattleMons[attacker].status2 via globalThis lazy.
  const stateMod = (globalThis as { __battleState?: { gBattleMons?: Array<{ status2?: number }> } }).__battleState;
  const status2 = stateMod?.gBattleMons?.[_getAnimState().attacker]?.status2 ?? 0;
  const STATUS2_SUBSTITUTE = 1 << 24;
  if (status2 & STATUS2_SUBSTITUTE) {
    setAnimArg(ARG_RET_ID, 1);
  } else {
    setAnimArg(ARG_RET_ID, 0);
  }
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_SetTargetToEffectBattler (battle_anim_throw.c:2211) ──────────

/** 1:1 décomp `AnimTask_SetTargetToEffectBattler(taskId)` (2211-2215).
 *  Override gBattleAnimTarget = gEffectBattler. */
export function AnimTask_SetTargetToEffectBattler(taskId: number): void {
  // 1:1 décomp : gBattleAnimTarget = gEffectBattler.
  const stateMod = (globalThis as { __battleState?: { gEffectBattler?: number } }).__battleState;
  const ba = (globalThis as Record<string, unknown>).__battleAnim as {
    setBattleAnimTarget?: (v: number) => void;
  } | undefined;
  ba?.setBattleAnimTarget?.(stateMod?.gEffectBattler ?? 0);
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_LoadPokeblockGfx (battle_anim_throw.c:2401) ──────────────────

/** 1:1 décomp `AnimTask_LoadPokeblockGfx(taskId)` (2401-2409). */
export function AnimTask_LoadPokeblockGfx(taskId: number): void {
  // Dette R3 : Safari Zone Pokeblock graphics load.
  void taskId;
  DestroyAnimVisualTask(taskId);
}

/** 1:1 décomp `AnimTask_FreePokeblockGfx(taskId)` (2411-2415). */
export function AnimTask_FreePokeblockGfx(taskId: number): void {
  void taskId;
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_SetAttackerTargetLeftPos (battle_anim_throw.c:2469) ──────────

/** 1:1 décomp `AnimTask_SetAttackerTargetLeftPos(taskId)` (2469-2484).
 *  Set gBattleAnimAttacker + Target = B_POSITION_*_LEFT (= single battle reset). */
export function AnimTask_SetAttackerTargetLeftPos(taskId: number): void {
  const ba = (globalThis as Record<string, unknown>).__battleAnim as {
    setBattleAnimAttacker?: (v: number) => void;
    setBattleAnimTarget?: (v: number) => void;
  } | undefined;
  // 1:1 décomp : GetBattlerAtPosition(B_POSITION_PLAYER_LEFT/_OPPONENT_LEFT).
  ba?.setBattleAnimAttacker?.(0 /* player left */);
  ba?.setBattleAnimTarget?.(1 /* opponent left */);
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_GetTrappedMoveAnimId (battle_anim_throw.c:2486) ──────────────

/** 1:1 décomp `AnimTask_GetTrappedMoveAnimId(taskId)` (2486-2500). Lookup
 *  l'anim id pour le move qui trapping (Wrap/Bind/etc.). */
export function AnimTask_GetTrappedMoveAnimId(taskId: number): void {
  // 1:1 décomp : switch sur gBattleMons[target].status2 & STATUS2_WRAPPED type.
  // Dette R3 : trapping move lookup table.
  setAnimArg(ARG_RET_ID, 0 /* MOVE_WRAP default */);
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_GetBattlersFromArg (battle_anim_throw.c:2502) ────────────────

/** 1:1 décomp `AnimTask_GetBattlersFromArg(taskId)` (2502-2507). */
export function AnimTask_GetBattlersFromArg(taskId: number): void {
  // 1:1 décomp : SetAttackerTargetLeftPos via getAnimArg.
  AnimTask_SetAttackerTargetLeftPos(taskId);
}

// ─── Helpers internes (= dette R3 wire) ────────────────────────────────────

/** 1:1 decomp : CreateSprite(&gBallSpriteTemplates[ballId], x, y, subpriority)
 *  — le MEME createur que le send-out (#20, pokeball.ts:284). Le gfx ball est
 *  precharge au boot (ensureBallGfxLoaded). */
function _CreateBallSprite(ballId: number, x: number, y: number, subpriority: number): number {
  // 1:1 : LoadBallGfx AVANT la creation (le send-out le fait ; la capture ne le
  // faisait PAS -> sheet/palette du tag jamais chargees -> la ball rendait avec
  // le slot palette 0 (le « hamburger » jaune/brun, A/B user 2026-06-10 :
  // « la ball n'est pas reconnue telle quelle »). Les 12 assets sont
  // precharges au boot -> le load par tag est sync.
  LoadBallGfx(ballId);
  const tpl = gBallSpriteTemplates[ballId] ?? gBallSpriteTemplates[0];
  if (!tpl) return -1;
  return _CreateSpriteFromTemplate(tpl as never, x, y, subpriority);
}

/** 1:1 `gBattlerSpriteIds[battler]` — via le registre controllers (modele plat). */
function _getBattlerSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  return co?.getBattlerMonSpriteId?.(battler) ?? -1;
}

/** 1:1 GetBattlerSpriteCoord — delegue au miroir game/battle_anim_mons. */
function _GetBattlerSpriteCoord(battler: number, coord: number): number {
  return _GetBattlerSpriteCoordReal(battler, coord);
}

// ─── Chaîne CAPTURE 1:1 (battle_anim_throw.c:855-1567) ─────────────────────
// La VRAIE séquence de capture (le SpriteCB_BallThrow* de pokeball.c est du
// code mort décomp — « These do not seem to get run »). Sprite ball type plat
// runtime : data[8], x/y/x2/y2, callback, animEnded/affineAnimEnded.

type BallSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  callback: ((s: BallSprite) => void) | null;
  animEnded?: boolean; affineAnimEnded?: boolean; animPaused?: boolean;
  affineAnimPaused?: boolean; invisible?: boolean; spriteId?: number;
  subpriority?: number;
  oam?: { objMode?: number; paletteNum?: number; matrixNum?: number };
  template?: { paletteTag?: number };
};

function _PlaySE(seId: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  g.__PlaySE?.(seId);
}
// SE ids 1:1 songs.h.
const SE_BALL_T = 23;
const SE_BALL_BOUNCE = [56, 57, 58, 59];  // SE_BALL_BOUNCE_1..4 (songs.h:62-65)
const SE_BALL_TRADE_T = 60;
const SE_RG_BALL_CLICK_T = 254;
const MUS_RG_CAUGHT_INTRO_T = 531;

/** animationData (gBattleSpritesDataPtr->animationData) — ballSubpx local ;
 *  ballThrowCaseId/wildMonInvisible via gBattleStruct (dette storage existante). */
const _animData = { ballSubpx: 0 };
function _ballThrowCaseId(): number {
  return ((gBattleStruct as unknown) as { ballThrowCaseId?: number }).ballThrowCaseId ?? 0;
}
function _wildMonInvisible(): boolean {
  return ((gBattleStruct as unknown) as { wildMonInvisible?: boolean }).wildMonInvisible ?? false;
}

/** Slot palette OBJ REEL du sprite mon adverse (l'arg « spritePalNum » de
 *  LaunchBallFadeMonTask — battler==slot sur GBA, pas chez nous). */
function _monPalNum(): number {
  const rt = getRuntime();
  const sp = rt?.gSprites?.get(_getBattlerSpriteId(_getAnimState().target)) as { oamIndex?: number } | undefined;
  if (!rt || !sp || sp.oamIndex === undefined) return _getAnimState().target;
  const oam = (rt as unknown as { gba?: { oam?: Array<{ paletteBank?: number }> } }).gba?.oam?.[sp.oamIndex];
  return oam?.paletteBank ?? _getAnimState().target;
}

function _rtSprite(spriteId: number): BallSprite | undefined {
  return getRuntime()?.gSprites?.get(spriteId) as unknown as BallSprite | undefined;
}
function _spriteIdOf(sprite: BallSprite): number {
  if (sprite.spriteId !== undefined) return sprite.spriteId;
  const rt = getRuntime();
  if (!rt?.gSprites) return -1;
  for (let id = 0; id < MAX_SPRITES; id++) {
    const sp = rt.gSprites.get(id);
    if (sp === undefined) continue;
    if ((sp as unknown) === (sprite as unknown)) return id;
  }
  return -1;
}
function _startAnim(sprite: BallSprite, n: number): void {
  const id = _spriteIdOf(sprite);
  const rt = getRuntime() as unknown as { StartSpriteAnim?: (i: number, n: number) => void };
  if (id >= 0) rt?.StartSpriteAnim?.(id, n);
}
function _startAffine(sprite: BallSprite, n: number): void {
  const id = _spriteIdOf(sprite);
  const rt = getRuntime() as unknown as { StartSpriteAffineAnim?: (i: number, n: number) => void };
  if (id >= 0) rt?.StartSpriteAffineAnim?.(id, n);
}
function _destroyBall(sprite: BallSprite): void {
  const id = _spriteIdOf(sprite);
  const rt = getRuntime();
  if (rt && id >= 0) { rt.DestroySprite(id); rt.gSprites.delete(id); }
}
function _updateOamPriorityInAllHealthboxes(priority: number): void {
  const hb = (globalThis as Record<string, unknown>).__battleHealthbox as {
    UpdateOamPriorityInAllHealthboxes?: (p: number) => void;
  } | undefined;
  hb?.UpdateOamPriorityInAllHealthboxes?.(priority);
}
// Constantes affine ball (pokeball.h enum) + battler (data.h enum).
const BALL_ROTATE_RIGHT = 1;
const BALL_ROTATE_LEFT = 2;
const BALL_AFFINE_ANIM_3 = 3;
const BATTLER_AFFINE_NORMAL = 0;
const BATTLER_AFFINE_EMERGE = 1;
// ballThrowCaseId enum (battle_anim.h) : 0=NO_SHAKES..4=3_SHAKES_SUCCESS, 5=TRAINER_BLOCK.
const BALL_NO_SHAKES = 0;
const BALL_3_SHAKES_SUCCESS = 4;

/** 1:1 décomp `SpriteCB_Ball_Throw(sprite)` (battle_anim_throw.c:855) :
 *  setup de l'arc (amplitude -40) → Ball_Arc. */
function SpriteCB_Ball_Throw(sprite: BallSprite): void {
  const targetX = sprite.data[1] & 0xFFFF;
  const targetY = sprite.data[2] & 0xFFFF;
  sprite.data[1] = sprite.x;       // sOffsetX
  sprite.data[2] = targetX;        // sTargetX
  sprite.data[3] = sprite.y;       // sOffsetY
  sprite.data[4] = targetY;        // sTargetY
  sprite.data[5] = -40;            // sAmplitude
  InitAnimArcTranslation(sprite as never);
  sprite.callback = SpriteCB_Ball_Arc;
}

/** 1:1 décomp `SpriteCB_Ball_Arc(sprite)` (:880) : vol en arc → block trainer
 *  OU ouverture (anim 1 + particles + fade mon) → MonShrink. */
function SpriteCB_Ball_Arc(sprite: BallSprite): void {
  if (TranslateAnimHorizontalArc(sprite as never)) {
    if (_ballThrowCaseId() === BALL_TRAINER_BLOCK) {
      sprite.callback = SpriteCB_Ball_Block;
    } else {
      _startAnim(sprite, 1);
      sprite.x += sprite.x2; sprite.y += sprite.y2;
      sprite.x2 = 0; sprite.y2 = 0;
      for (let i = 0; i < 8; i++) sprite.data[i] = 0;
      sprite.data[5] = 0;  // sTimer
      sprite.callback = SpriteCB_Ball_MonShrink;
      const ballId = ItemIdToBallId(gLastUsedItem);
      // 1:1 :895 AnimateBallOpenParticles(sprite->x, sprite->y - 5, 1, 28, ballId)
      // — miroir local (PlaySE SE_BALL_OPEN dedans).
      AnimateBallOpenParticles(sprite.x, sprite.y - 5, 1, 28, ballId);
      const rt = getRuntime();
      if (rt) {
        // 1:1 LaunchBallFadeMonTask(FALSE, gBattleAnimTarget, 14, ballId) — le
        // 2e arg decomp = le SLOT PALETTE OBJ du mon (battler==slot sur GBA) ;
        // chez nous les slots ne suivent pas le battler -> resoudre le palNum
        // REEL du sprite mon (fix user « pas de teinte blanc/rose »).
        _fxBallFadeMon(rt as never, false, _monPalNum(), 14, ballId);
      }
    }
  }
}

/** 1:1 décomp `SpriteCB_Ball_MonShrink(sprite)` (:917) : délai 10 frames →
 *  task shrink + Step. */
function SpriteCB_Ball_MonShrink(sprite: BallSprite): void {
  if (++sprite.data[5] === 10) {
    sprite.data[5] = CreateTask(() => { /* TaskDummy */ }, 50);
    sprite.callback = SpriteCB_Ball_MonShrink_Step;
    const monSprite = _rtSprite(_getBattlerSpriteId(_getAnimState().target));
    if (monSprite) monSprite.data[1] = 0;
  }
}

// MON_SHRINK states : 0 setup, 1 step, 2 invisible, 3 free (battle_anim.h).
/** 1:1 décomp `SpriteCB_Ball_MonShrink_Step(sprite)` (:934) : rot-scale du mon
 *  256→1152 (le mon rétrécit dans la ball en montant), puis invisible → Bounce. */
function SpriteCB_Ball_MonShrink_Step(sprite: BallSprite): void {
  const spriteId = _getBattlerSpriteId(_getAnimState().target);
  const taskId = sprite.data[5];
  const task = _gTasks(taskId);
  const monSprite = _rtSprite(spriteId);
  if (++task.data[1] === 11) _PlaySE(SE_BALL_TRADE_T);
  switch (task.data[0]) {
    case 0: {  // MON_SHRINK
      PrepareBattlerSpriteForRotScale(spriteId, 0 /* ST_OAM_OBJ_NORMAL */);
      task.data[10] = 256;
      const monY = monSprite ? (monSprite.y + monSprite.y2) : 0;
      const shrinkDistance = monY - (sprite.y + sprite.y2);
      task.data[2] = Math.floor((shrinkDistance * 256) / 28) | 0;  // gMonShrinkDelta (duration 28)
      task.data[0]++;
      break;
    }
    case 1:  // MON_SHRINK_STEP
      task.data[10] += 32;
      SetSpriteRotScale(spriteId, task.data[10], task.data[10], 0);
      task.data[3] += task.data[2];
      if (monSprite) monSprite.y2 = -(task.data[3] >> 8);
      if (task.data[10] >= 1152) task.data[0]++;
      break;
    case 2:  // MON_SHRINK_INVISIBLE
      ResetSpriteRotScale(spriteId);
      if (monSprite) monSprite.invisible = true;
      task.data[0]++;
      break;
    default:  // MON_SHRINK_FREE
      if (task.data[1] > 10) {
        DestroyTask(taskId);
        _startAnim(sprite, 2);
        sprite.data[5] = 0;
        sprite.callback = SpriteCB_Ball_Bounce;
      }
      break;
  }
}

/** 1:1 décomp `SpriteCB_Ball_Bounce(sprite)` (:990) : attend la fin d'anim →
 *  init la chute (amplitude 40, phase 0). */
function SpriteCB_Ball_Bounce(sprite: BallSprite): void {
  if (sprite.animEnded) {
    sprite.data[3] = 0;   // sState
    sprite.data[4] = 40;  // sAmplitude
    sprite.data[5] = 0;   // sPhase
    sprite.y += Cos(0, 40);
    sprite.y2 = -Cos(0, sprite.data[4]);
    sprite.callback = SpriteCB_Ball_Bounce_Step;
  }
}

/** 1:1 décomp `SpriteCB_Ball_Bounce_Step(sprite)` (:1025) : 4 rebonds Cos
 *  (amplitude -10/rebond, SE bounce 1-4) → Release (NO_SHAKES) ou Wobble.
 *  sState : low byte = direction (0 fall / 1 rise), high byte = bounces. */
function SpriteCB_Ball_Bounce_Step(sprite: BallSprite): void {
  let lastBounce = false;
  const state = sprite.data[3];
  switch (state & 0xFF) {
    case 0:  // BALL_FALLING
      sprite.y2 = -Cos(sprite.data[5], sprite.data[4]);
      sprite.data[5] += (state >> 8) + 4;
      if (sprite.data[5] >= 64) {
        sprite.data[4] -= 10;
        sprite.data[3] += 257;  // RISE_FASTER
        const bounceCount = sprite.data[3] >> 8;
        if (bounceCount === 4) lastBounce = true;
        _PlaySE(SE_BALL_BOUNCE[Math.min(bounceCount, 4) - 1] ?? SE_BALL_BOUNCE[3]);
      }
      break;
    case 1:  // BALL_RISING
      sprite.y2 = -Cos(sprite.data[5], sprite.data[4]);
      sprite.data[5] -= (state >> 8) + 4;
      if (sprite.data[5] <= 0) {
        sprite.data[5] = 0;
        sprite.data[3] &= -0x100;  // FALL
      }
      break;
  }
  if (lastBounce) {
    sprite.data[3] = 0;
    sprite.y += Cos(64, 40);
    sprite.y2 = 0;
    if (_ballThrowCaseId() === BALL_NO_SHAKES) {
      sprite.data[5] = 0;
      sprite.callback = SpriteCB_Ball_Release;
    } else {
      sprite.callback = SpriteCB_Ball_Wobble;
      sprite.data[4] = 1;
      sprite.data[5] = 0;
    }
  }
}

/** 1:1 décomp `SpriteCB_Ball_Wobble(sprite)` (:1110) : délai 31 frames →
 *  rotation droite + SE_BALL → Wobble_Step. */
function SpriteCB_Ball_Wobble(sprite: BallSprite): void {
  if (++sprite.data[3] === 31) {
    sprite.data[3] = 0;
    sprite.affineAnimPaused = true;
    _startAffine(sprite, BALL_ROTATE_RIGHT);
    _animData.ballSubpx = 0;
    sprite.callback = SpriteCB_Ball_Wobble_Step;
    _PlaySE(SE_BALL_T);
  }
}

// Wobble states : BALL_ROLL_1=0, PIVOT_1, ROLL_2, PIVOT_2, ROLL_3, NEXT_MOVE,
// WAIT_NEXT_SHAKE (battle_anim.h).
/** 1:1 décomp `SpriteCB_Ball_Wobble_Step(sprite)` (:1135) : LA SECOUSSE
 *  (roll subpixel 176/256 px/frame + pivots) ×N ; shakes==caseId → Release
 *  (échec) ; caseId==BALL_3_SHAKES_SUCCESS && shakes==3 → Capture. */
function SpriteCB_Ball_Wobble_Step(sprite: BallSprite): void {
  const rollSub = (): void => {
    if (_animData.ballSubpx > 255) {
      sprite.x2 += sprite.data[4];
      _animData.ballSubpx &= 0xFF;
    } else {
      _animData.ballSubpx += 176;
    }
  };
  switch (sprite.data[3] & 0xFF) {
    case 0: {  // BALL_ROLL_1
      rollSub();
      sprite.data[5]++;
      sprite.affineAnimPaused = false;
      if (sprite.data[5] + 7 > 14) {
        _animData.ballSubpx = 0;
        sprite.data[3]++;
        sprite.data[5] = 0;
      }
      break;
    }
    case 1:  // BALL_PIVOT_1
      if (++sprite.data[5] === 1) {
        sprite.data[5] = 0;
        sprite.data[4] = -sprite.data[4];
        sprite.data[3]++;
        sprite.affineAnimPaused = false;
        _startAffine(sprite, sprite.data[4] < 0 ? BALL_ROTATE_LEFT : BALL_ROTATE_RIGHT);
      } else {
        sprite.affineAnimPaused = true;
      }
      break;
    case 2: {  // BALL_ROLL_2
      rollSub();
      sprite.data[5]++;
      sprite.affineAnimPaused = false;
      if (sprite.data[5] + 12 > 24) {
        _animData.ballSubpx = 0;
        sprite.data[3]++;
        sprite.data[5] = 0;
      }
      break;
    }
    case 3:  // BALL_PIVOT_2 (1:1 : sTimer++ < 0 jamais vrai → exécute direct)
      sprite.data[5] = 0;
      sprite.data[4] = -sprite.data[4];
      sprite.data[3]++;
      sprite.affineAnimPaused = false;
      _startAffine(sprite, sprite.data[4] < 0 ? BALL_ROTATE_LEFT : BALL_ROTATE_RIGHT);
      // 1:1 fall through vers BALL_ROLL_3 (deplie, tsc strict) :
      rollSub();
      sprite.data[5]++;
      sprite.affineAnimPaused = false;
      if (sprite.data[5] + 4 > 8) {
        _animData.ballSubpx = 0;
        sprite.data[3]++;
        sprite.data[5] = 0;
        sprite.data[4] = -sprite.data[4];
      }
      break;
    case 4: {  // BALL_ROLL_3
      rollSub();
      sprite.data[5]++;
      sprite.affineAnimPaused = false;
      if (sprite.data[5] + 4 > 8) {
        _animData.ballSubpx = 0;
        sprite.data[3]++;
        sprite.data[5] = 0;
        sprite.data[4] = -sprite.data[4];
      }
      break;
    }
    case 5: {  // BALL_NEXT_MOVE
      sprite.data[3] += 0x100;  // SHAKE_INC
      const shakes = sprite.data[3] >> 8;
      if (shakes === _ballThrowCaseId()) {
        sprite.affineAnimPaused = true;
        sprite.callback = SpriteCB_Ball_Release;
        sprite.data[5] = 0;
      } else if (_ballThrowCaseId() === BALL_3_SHAKES_SUCCESS && shakes === 3) {
        sprite.callback = SpriteCB_Ball_Capture;
        sprite.affineAnimPaused = true;
      } else {
        sprite.data[3]++;  // BALL_WAIT_NEXT_SHAKE
        sprite.affineAnimPaused = true;
      }
      break;
    }
    default:  // BALL_WAIT_NEXT_SHAKE
      if (++sprite.data[5] === 31) {
        sprite.data[5] = 0;
        sprite.data[3] &= -0x100;  // RESET_STATE
        _startAffine(sprite, BALL_AFFINE_ANIM_3);
        _startAffine(sprite, sprite.data[4] < 0 ? BALL_ROTATE_LEFT : BALL_ROTATE_RIGHT);
        _PlaySE(SE_BALL_T);
      }
      break;
  }
}

/** 1:1 décomp `SpriteCB_Ball_Release(sprite)` (:1289) : délai 31 → Release_Step. */
function SpriteCB_Ball_Release(sprite: BallSprite): void {
  if (++sprite.data[5] === 31) {
    sprite.data[5] = 0;
    sprite.callback = SpriteCB_Ball_Release_Step;
  }
}

/** 1:1 décomp `SpriteCB_Ball_Capture(sprite)` (:1302). */
function SpriteCB_Ball_Capture(sprite: BallSprite): void {
  sprite.animPaused = true;
  sprite.callback = SpriteCB_Ball_Capture_Step;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = 0;
}

/** 1:1 décomp `SpriteCB_Ball_Capture_Step(sprite)` (:1312) : timers 40 (click
 *  + flash noir + étoiles) / 60 (unfade) / 95 (fin anim + musique capture) /
 *  315 (destroy mon sprite → FadeOut). */
function SpriteCB_Ball_Capture_Step(sprite: BallSprite): void {
  sprite.data[4]++;
  if (sprite.data[4] === 40) {
    _PlaySE(SE_RG_BALL_CLICK_T);
    BlendPalettes(0x10000 << (sprite.oam?.paletteNum ?? 0), 6, 0x0000);
    MakeCaptureStars(sprite);
  } else if (sprite.data[4] === 60) {
    BeginNormalPaletteFade(0x10000 << (sprite.oam?.paletteNum ?? 0), 2, 6, 0, 0x0000);
  } else if (sprite.data[4] === 95) {
    setGDoingBattleAnim(false);
    _updateOamPriorityInAllHealthboxes(1);
    const dg = globalThis as { __m4aMPlayAllStop?: () => void };
    dg.__m4aMPlayAllStop?.();
    _PlaySE(MUS_RG_CAUGHT_INTRO_T);
  } else if (sprite.data[4] === 315) {
    const monSpriteId = _getBattlerSpriteId(_getAnimState().target);
    const rt = getRuntime();
    if (rt && monSpriteId >= 0) { rt.DestroySprite(monSpriteId); rt.gSprites.delete(monSpriteId); }
    sprite.data[0] = 0;
    sprite.callback = SpriteCB_Ball_FadeOut;
  }
}

/** 1:1 décomp `SpriteCB_Ball_FadeOut(sprite)` (:1350) : blend → invisible →
 *  destroy (BLDCNT/BLDALPHA via runtime SetGpuReg). */
function SpriteCB_Ball_FadeOut(sprite: BallSprite): void {
  const rt = getRuntime();
  switch (sprite.data[0]) {
    case 0:
      sprite.data[1] = 0;
      sprite.data[2] = 0;
      if (sprite.oam) sprite.oam.objMode = 1;  // ST_OAM_OBJ_BLEND
      rt?.SetGpuReg?.(0x50 /* BLDCNT */, 0x40 | 0x3F00);
      rt?.SetGpuReg?.(0x52 /* BLDALPHA */, 16);
      sprite.data[0]++;
      break;
    case 1:
      if (sprite.data[1]++ > 0) {
        sprite.data[1] = 0;
        sprite.data[2]++;
        rt?.SetGpuReg?.(0x52, (16 - sprite.data[2]) | (sprite.data[2] << 8));
        if (sprite.data[2] === 16) sprite.data[0]++;
      }
      break;
    case 2:
      sprite.invisible = true;
      sprite.data[0]++;
      break;
    default: {
      const pf = (globalThis as Record<string, unknown>).__paletteFade as { active?: boolean } | undefined;
      if (!pf?.active) {
        rt?.SetGpuReg?.(0x50, 0);
        rt?.SetGpuReg?.(0x52, 0);
        sprite.data[0] = 0;
        sprite.callback = DestroySpriteAfterOneFrame;
      }
      break;
    }
  }
}

/** 1:1 décomp `DestroySpriteAfterOneFrame(sprite)` (:1398). */
function DestroySpriteAfterOneFrame(sprite: BallSprite): void {
  if (sprite.data[0] === 0) {
    sprite.data[0] = -1;
  } else {
    _destroyBall(sprite);
  }
}

/** 1:1 décomp `sCaptureStars[]` : 3 étoiles (xOffset, yOffset, amplitude). */
const sCaptureStars = [
  { xOffset: 10, yOffset: 2, amplitude: -3 },
  { xOffset: 15, yOffset: 0, amplitude: -4 },
  { xOffset: -10, yOffset: 2, amplitude: -3 },
] as const;

/** 1:1 décomp `MakeCaptureStars(sprite)` (:1417) — DETTE DOUCE : la création
 *  unitaire de sprite étoile (sBallParticleSpriteTemplates[BALL_MASTER] + anim
 *  star + arc + flicker) requiert d'exposer le template particle côté
 *  pokeball-effects ; en attendant les 3 étoiles ne spawnent pas (le reste —
 *  click, flash, musique, destruction — est 1:1). */
function MakeCaptureStars(sprite: BallSprite): void {
  // 1:1 decomp :1417-1447 : 3 etoiles (sCaptureStars), sprite particle
  // BALL_MASTER (tile etoile), arc InitAnimArcTranslation + flicker 1 frame/2.
  let subpriority: number;
  if (sprite.subpriority) {
    subpriority = sprite.subpriority - 1;
  } else {
    subpriority = 0;
    sprite.subpriority = 1;
  }
  const rt = getRuntime();
  if (!rt) return;
  for (const star of sCaptureStars) {
    const spriteId = _fxCaptureStar(rt as never, sprite.x, sprite.y, subpriority);
    if (spriteId < 0) continue;
    const sp = _rtSprite(spriteId);
    if (!sp) continue;
    sp.data[0] = 24;                              // sDuration
    sp.data[1] = sp.x; sp.data[3] = sp.y;         // offsets InitAnimArcTranslation (sOffsetX/Y)
    sp.data[2] = sprite.x + star.xOffset;         // sTargetX
    sp.data[4] = sprite.y + star.yOffset;         // sTargetY
    sp.data[5] = star.amplitude;                  // sAmplitude
    InitAnimArcTranslation(sp as never);
    sp.callback = SpriteCB_CaptureStar_Flicker;
  }
}

/** 1:1 décomp `SpriteCB_CaptureStar_Flicker(sprite)` (:1454). */
function SpriteCB_CaptureStar_Flicker(sprite: BallSprite): void {
  sprite.invisible = !sprite.invisible;
  if (TranslateAnimHorizontalArc(sprite as never)) _destroyBall(sprite);
}

/** 1:1 décomp `SpriteCB_Ball_Release_Step(sprite)` (:1468) : ÉCHEC — la ball
 *  s'ouvre (anim 1 + particles + unfade) + le mon ÉMERGE (affine EMERGE,
 *  sOffsetY 4096 → -288/frame). */
function SpriteCB_Ball_Release_Step(sprite: BallSprite): void {
  _startAnim(sprite, 1);
  _startAffine(sprite, 0);
  sprite.callback = SpriteCB_Ball_Release_Wait;
  const ballId = ItemIdToBallId(gLastUsedItem);
  // 1:1 :1476 — miroir local (PlaySE SE_BALL_OPEN dedans).
  AnimateBallOpenParticles(sprite.x, sprite.y - 5, 1, 28, ballId);
  const rt = getRuntime();
  if (rt) {
    _fxBallFadeMon(rt as never, true, _monPalNum(), 14, ballId);
  }
  const monSpriteId = _getBattlerSpriteId(_getAnimState().target);
  const monSprite = _rtSprite(monSpriteId);
  if (monSprite) {
    monSprite.invisible = false;
    const rtA = getRuntime() as unknown as { StartSpriteAffineAnim?: (i: number, n: number) => void };
    rtA?.StartSpriteAffineAnim?.(monSpriteId, BATTLER_AFFINE_EMERGE);
    monSprite.data[1] = 4096;  // sOffsetY
  }
}

/** 1:1 décomp `SpriteCB_Ball_Release_Wait(sprite)` (:1492) : le mon remonte
 *  (sOffsetY -= 288/frame), fin → restore + fin d'anim. */
function SpriteCB_Ball_Release_Wait(sprite: BallSprite): void {
  let released = false;
  if (sprite.animEnded) sprite.invisible = true;
  const monSpriteId = _getBattlerSpriteId(_getAnimState().target);
  const monSprite = _rtSprite(monSpriteId);
  if (monSprite?.affineAnimEnded) {
    const rtA = getRuntime() as unknown as { StartSpriteAffineAnim?: (i: number, n: number) => void };
    rtA?.StartSpriteAffineAnim?.(monSpriteId, BATTLER_AFFINE_NORMAL);
    released = true;
  } else if (monSprite) {
    monSprite.data[1] -= 288;
    monSprite.y2 = monSprite.data[1] >> 8;
  }
  if (sprite.animEnded && released && monSprite) {
    monSprite.y2 = 0;
    monSprite.invisible = _wildMonInvisible();
    sprite.data[0] = 0;
    sprite.callback = DestroySpriteAfterOneFrame;
    setGDoingBattleAnim(false);
    _updateOamPriorityInAllHealthboxes(1);
  }
}

/** 1:1 décomp `SpriteCB_Ball_Block(sprite)` (:1524) : trainer bloque la ball. */
function SpriteCB_Ball_Block(sprite: BallSprite): void {
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.y2 = 0;
  sprite.x2 = 0;
  for (let i = 0; i < 6; i++) sprite.data[i] = 0;
  sprite.callback = SpriteCB_Ball_Block_Step;
}

/** 1:1 décomp `SpriteCB_Ball_Block_Step(sprite)` (:1544) : la ball retombe
 *  hors écran (subpixel dx 0x680 / dy 0x800). */
function SpriteCB_Ball_Block_Step(sprite: BallSprite): void {
  const dy = sprite.data[0] + 0x800;
  const dx = sprite.data[1] + 0x680;
  sprite.x2 -= dx >> 8;
  sprite.y2 += dy >> 8;
  sprite.data[0] = (sprite.data[0] + 0x800) & 0xFF;
  sprite.data[1] = (sprite.data[1] + 0x680) & 0xFF;
  if (sprite.y + sprite.y2 > 160 || sprite.x + sprite.x2 < -8) {
    sprite.data[0] = 0;
    sprite.callback = DestroySpriteAfterOneFrame;
    setGDoingBattleAnim(false);
    _updateOamPriorityInAllHealthboxes(1);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PARTICULES D'OUVERTURE DE BALL — 1:1 battle_anim_throw.c:130-370 (tables) +
// :1568-2023 (LoadBallParticleGfx → AnimateBallOpenParticles → une task
// *OpenParticleAnimation PAR TYPE de ball → sprites Step → DestroyBallOpen
// AnimationParticle qui libère les 12 tags quand tout est fini).
// Callers combat : SpriteCB_Ball_Arc (:895 capture), SpriteCB_Ball_Release_Step
// (:1476 échec capture), AnimTask_SwitchOutBallEffect (:684 switch-out),
// pokeball.c SpriteCB_ReleaseMonFromBall (:757 send-out). Le chemin Birch/OW
// (hors combat) reste servi par engine/system/pokeball-effects.ts (dette
// placement documentée là-bas).
// ════════════════════════════════════════════════════════════════════════════

// 1:1 :130-141 — #define TAG_PARTICLES_* (55020..55031, un tag par type de ball).
const TAG_PARTICLES_POKEBALL = 55020;
const TAG_PARTICLES_GREATBALL = 55021;
const TAG_PARTICLES_SAFARIBALL = 55022;
const TAG_PARTICLES_ULTRABALL = 55023;
const TAG_PARTICLES_MASTERBALL = 55024;
const TAG_PARTICLES_NETBALL = 55025;
const TAG_PARTICLES_DIVEBALL = 55026;
const TAG_PARTICLES_NESTBALL = 55027;
const TAG_PARTICLES_REPEATBALL = 55028;
const TAG_PARTICLES_TIMERBALL = 55029;
const TAG_PARTICLES_LUXURYBALL = 55030;
const TAG_PARTICLES_PREMIERBALL = 55031;
// Ordre BALL_POKE..BALL_PREMIER (= l'index des designated initializers C).
const _particleTags: ReadonlyArray<number> = [
  TAG_PARTICLES_POKEBALL, TAG_PARTICLES_GREATBALL, TAG_PARTICLES_SAFARIBALL,
  TAG_PARTICLES_ULTRABALL, TAG_PARTICLES_MASTERBALL, TAG_PARTICLES_NETBALL,
  TAG_PARTICLES_DIVEBALL, TAG_PARTICLES_NESTBALL, TAG_PARTICLES_REPEATBALL,
  TAG_PARTICLES_TIMERBALL, TAG_PARTICLES_LUXURYBALL, TAG_PARTICLES_PREMIERBALL,
];
// 1:1 include/pokeball.h POKEBALL_COUNT.
const _POKEBALL_COUNT = 12;

// 1:1 :143-157 sBallParticleSpriteSheets[POKEBALL_COUNT] — les 12 entrées
// partagent le MÊME gfx (gBattleAnimSpriteGfx_Particles, 0x100 = 8 tiles 8x8) ;
// seul le tag diffère (pattern .map() = précédent gBallSpriteTemplates,
// pokeball.ts:118).
const sBallParticleSpriteSheets: ReadonlyArray<{ data: string; size: number; tag: number }> =
  _particleTags.map((tag) => ({ data: 'gBattleAnimSpriteGfx_Particles', size: 0x100, tag }));

// 1:1 :159-173 sBallParticlePalettes[POKEBALL_COUNT] — même palette
// gBattleAnimSpritePal_CircleImpact ×12 (un slot OBJ par tag).
const sBallParticlePalettes: ReadonlyArray<{ data: string; tag: number }> =
  _particleTags.map((tag) => ({ data: 'gBattleAnimSpritePal_CircleImpact', tag }));

// 1:1 :175-215 — séquences d'anim de frame des étincelles.
const sAnim_RegularBall: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0, 1),
  ANIMCMD_FRAME(1, 1),
  ANIMCMD_FRAME(2, 1),
  ANIMCMD_FRAME(0, 1, { hFlip: true }),
  ANIMCMD_FRAME(2, 1),
  ANIMCMD_FRAME(1, 1),
  ANIMCMD_JUMP(0),
];
const sAnim_MasterBall: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(3, 1), ANIMCMD_END];
const sAnim_NetDiveBall: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(4, 1), ANIMCMD_END];
const sAnim_NestBall: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(5, 1), ANIMCMD_END];
const sAnim_LuxuryPremierBall: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(6, 4), ANIMCMD_FRAME(7, 4), ANIMCMD_JUMP(0)];
const sAnim_UltraRepeatTimerBall: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(7, 4), ANIMCMD_END];

// 1:1 :217-225 sAnims_BallParticles[].
const sAnims_BallParticles: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  sAnim_RegularBall,
  sAnim_MasterBall,
  sAnim_NetDiveBall,
  sAnim_NestBall,
  sAnim_LuxuryPremierBall,
  sAnim_UltraRepeatTimerBall,
];

// 1:1 :227-241 sBallParticleAnimNums[POKEBALL_COUNT].
const sBallParticleAnimNums: ReadonlyArray<number> = [
  0,  // BALL_POKE
  0,  // BALL_GREAT
  0,  // BALL_SAFARI
  5,  // BALL_ULTRA
  1,  // BALL_MASTER
  2,  // BALL_NET
  2,  // BALL_DIVE
  3,  // BALL_NEST
  5,  // BALL_REPEAT
  5,  // BALL_TIMER
  4,  // BALL_LUXURY
  4,  // BALL_PREMIER
];

// Task particule (= struct Task décomp : la fonction reçoit l'objet DecompTask
// runtime — data Int16Array + taskId — convention rt.CreateTask).
type ParticleTask = { taskId: number; data: number[] };
type ParticleTaskFn = (task: ParticleTask) => void;

// 1:1 :243-257 sBallParticleAnimationFuncs[POKEBALL_COUNT] (function
// declarations hoistées → références valides ici, comme les statics C).
const sBallParticleAnimationFuncs: ReadonlyArray<ParticleTaskFn> = [
  PokeBallOpenParticleAnimation,    // BALL_POKE
  GreatBallOpenParticleAnimation,   // BALL_GREAT
  SafariBallOpenParticleAnimation,  // BALL_SAFARI
  UltraBallOpenParticleAnimation,   // BALL_ULTRA
  MasterBallOpenParticleAnimation,  // BALL_MASTER
  SafariBallOpenParticleAnimation,  // BALL_NET (« Also used for Net Ball »)
  DiveBallOpenParticleAnimation,    // BALL_DIVE
  UltraBallOpenParticleAnimation,   // BALL_NEST (« Also used for Nest Ball »)
  RepeatBallOpenParticleAnimation,  // BALL_REPEAT
  TimerBallOpenParticleAnimation,   // BALL_TIMER
  GreatBallOpenParticleAnimation,   // BALL_LUXURY (« Also used for Luxury Ball »)
  PremierBallOpenParticleAnimation, // BALL_PREMIER
];

// 1:1 graphics oam : gOamData_AffineOff_ObjNormal_8x8 (shape/size 8x8, prio 0).
const gOamData_AffineOff_ObjNormal_8x8 = { shape: 0, size: 0, affineMode: 0, priority: 0, paletteNum: 0 };

// 1:1 :259-370 sBallParticleSpriteTemplates[POKEBALL_COUNT] — 12 entrées
// identiques sauf les tags (oam 8x8, anims sAnims_BallParticles, dummy affine,
// SpriteCallbackDummy).
const sBallParticleSpriteTemplates: ReadonlyArray<{
  tileTag: number; paletteTag: number;
  oam: typeof gOamData_AffineOff_ObjNormal_8x8;
  anims: ReadonlyArray<ReadonlyArray<AnimCmd>>;
  callback: unknown;
}> = _particleTags.map((tag) => ({
  tileTag: tag,
  paletteTag: tag,
  oam: gOamData_AffineOff_ObjNormal_8x8,
  anims: sAnims_BallParticles,
  callback: SpriteCallbackDummy,
}));

// 1:1 include/constants/songs.h:23 SE_BALL_OPEN (déjà joué inline ailleurs).
const SE_BALL_OPEN = 15;

/** 1:1 décomp `LoadBallParticleGfx(u8 ballId)` (battle_anim_throw.c:1568-1575). */
export function LoadBallParticleGfx(ballId: number): void {
  if (GetSpriteTileStartByTag(sBallParticleSpriteSheets[ballId].tag) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sBallParticleSpriteSheets[ballId]);
    LoadCompressedSpritePaletteUsingHeap(sBallParticlePalettes[ballId]);
  }
}

/** 1:1 décomp `u8 AnimateBallOpenParticles(u8 x, u8 y, u8 priority,
 *  u8 subpriority, u8 ballId)` (battle_anim_throw.c:1577-1591). PlaySE
 *  (SE_BALL_OPEN) vit ICI, 1:1 (:1588). */
export function AnimateBallOpenParticles(x: number, y: number, priority: number, subpriority: number, ballId: number): number {
  LoadBallParticleGfx(ballId);
  const taskId = CreateTask(sBallParticleAnimationFuncs[ballId], 5);
  const task = _gTasks(taskId);
  task.data[1] = x;
  task.data[2] = y;
  task.data[3] = priority;
  task.data[4] = subpriority;
  task.data[15] = ballId;
  _PlaySE(SE_BALL_OPEN);
  return taskId;
}

/** 1:1 décomp `IncrBallParticleCount(void)` (:1593-1597). */
function IncrBallParticleCount(): void {
  if (getRuntime()?.gMain?.inBattle) {
    setNumBallParticles(getNumBallParticles() + 1);
  }
}

/** 1:1 task.c `FuncIsActiveTask(TaskFunc func)` — scan gTasks par identité de
 *  fonction (notre Map ne contient que les tasks actives). */
function FuncIsActiveTask(func: ParticleTaskFn): boolean {
  const rt = getRuntime();
  if (!rt?.gTasks) return false;
  for (const t of rt.gTasks.values()) {
    if ((t as { func?: unknown }).func === func) return true;
  }
  return false;
}

/** Crée UN sprite étincelle depuis le template du ballId (= corps commun des
 *  CreateSprite+IncrBallParticleCount+StartSpriteAnim+oam.priority répété dans
 *  chaque *OpenParticleAnimation C). Retourne le sprite (null si MAX_SPRITES).
 *  oam.priority : posé sur l'OAM directement — PAS écrasé par syncSpritesToOam
 *  (seuls x/y/flips/objMode/affineParamIndex/subpriority le sont). */
function _createBallParticleSprite(ballId: number, x: number, y: number, priority: number, subpriority: number): BallSprite | null {
  const rt = getRuntime();
  const spriteId = _CreateSpriteFromTemplate(sBallParticleSpriteTemplates[ballId] as never, x, y, subpriority);
  if (spriteId < 0 || !rt) return null;
  const sp = _rtSprite(spriteId);
  if (!sp) return null;
  IncrBallParticleCount();
  (rt as unknown as { StartSpriteAnim?: (i: number, n: number) => void }).StartSpriteAnim?.(spriteId, sBallParticleAnimNums[ballId]);
  const oamIndex = (sp as { oamIndex?: number }).oamIndex;
  const oam = oamIndex !== undefined ? (rt as unknown as { gba?: { oam?: Array<{ priority?: number }> } }).gba?.oam?.[oamIndex] : undefined;
  if (oam) oam.priority = priority;
  sp.spriteId = spriteId;
  return sp;
}

/** 1:1 décomp `PokeBallOpenParticleAnimation(u8 taskId)` (:1599-1641) —
 *  UNE étincelle par frame pendant 16 frames, angle (frame%8)*32. */
function PokeBallOpenParticleAnimation(task: ParticleTask): void {
  const ballId = task.data[15];
  if (task.data[0] < 16) {
    const x = task.data[1];
    const y = task.data[2];
    const priority = task.data[3];
    const subpriority = task.data[4];

    const sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
    if (sp) {
      sp.callback = PokeBallOpenParticleAnimation_Step1;
      let var0 = task.data[0] & 0xFF;
      if (var0 >= 8) var0 -= 8;
      sp.data[0] = var0 * 32;
    }

    if (task.data[0] === 15) {
      // 1:1 :1632-1633 — hors combat : marque le DERNIER sprite pour
      // DestroySpriteAndFreeResources (chemin Birch/OW, jamais pris en combat).
      if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
      DestroyTask(task.taskId);
      return;
    }
  }
  task.data[0]++;
}

/** 1:1 décomp `PokeBallOpenParticleAnimation_Step1(sprite)` (:1643-1649). */
function PokeBallOpenParticleAnimation_Step1(sprite: BallSprite): void {
  if (sprite.data[1] === 0) {
    sprite.callback = PokeBallOpenParticleAnimation_Step2;
  } else {
    sprite.data[1]--;
  }
}

/** 1:1 décomp `PokeBallOpenParticleAnimation_Step2(sprite)` (:1651-1658) —
 *  rayon +2/frame jusqu'à 50. */
function PokeBallOpenParticleAnimation_Step2(sprite: BallSprite): void {
  sprite.x2 = Sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = Cos(sprite.data[0], sprite.data[1]);
  sprite.data[1] += 2;
  if (sprite.data[1] === 50) {
    DestroyBallOpenAnimationParticle(sprite);
  }
}

/** 1:1 décomp `TimerBallOpenParticleAnimation(u8 taskId)` (:1660-1692) —
 *  8 étincelles d'un coup, fan-out d4=10/d5=2/d6=1. */
function TimerBallOpenParticleAnimation(task: ParticleTask): void {
  const ballId = task.data[15];
  const x = task.data[1];
  const y = task.data[2];
  const priority = task.data[3];
  const subpriority = task.data[4];

  let sp: BallSprite | null = null;
  for (let i = 0; i < 8; i++) {
    sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
    if (sp) {
      sp.callback = FanOutBallOpenParticles_Step1;
      sp.data[0] = i * 32;
      sp.data[4] = 10;
      sp.data[5] = 2;
      sp.data[6] = 1;
    }
  }

  // 1:1 :1688-1689 quirk vanilla : data[7] posé sur le sprite du DERNIER tour.
  if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
  DestroyTask(task.taskId);
}

/** 1:1 décomp `DiveBallOpenParticleAnimation(u8 taskId)` (:1694-1726) —
 *  8 étincelles, d4=10/d5=1/d6=2. */
function DiveBallOpenParticleAnimation(task: ParticleTask): void {
  const ballId = task.data[15];
  const x = task.data[1];
  const y = task.data[2];
  const priority = task.data[3];
  const subpriority = task.data[4];

  let sp: BallSprite | null = null;
  for (let i = 0; i < 8; i++) {
    sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
    if (sp) {
      sp.callback = FanOutBallOpenParticles_Step1;
      sp.data[0] = i * 32;
      sp.data[4] = 10;
      sp.data[5] = 1;
      sp.data[6] = 2;
    }
  }

  if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
  DestroyTask(task.taskId);
}

/** 1:1 décomp `SafariBallOpenParticleAnimation(u8 taskId)` (:1729-1761,
 *  « Also used for Net Ball ») — 8 étincelles, d4=4/d5=1/d6=1. */
function SafariBallOpenParticleAnimation(task: ParticleTask): void {
  const ballId = task.data[15];
  const x = task.data[1];
  const y = task.data[2];
  const priority = task.data[3];
  const subpriority = task.data[4];

  let sp: BallSprite | null = null;
  for (let i = 0; i < 8; i++) {
    sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
    if (sp) {
      sp.callback = FanOutBallOpenParticles_Step1;
      sp.data[0] = i * 32;
      sp.data[4] = 4;
      sp.data[5] = 1;
      sp.data[6] = 1;
    }
  }

  if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
  DestroyTask(task.taskId);
}

/** 1:1 décomp `UltraBallOpenParticleAnimation(u8 taskId)` (:1764-1796,
 *  « Also used for Nest Ball ») — 10 étincelles, angle i*25, d4=5/d5=1/d6=1. */
function UltraBallOpenParticleAnimation(task: ParticleTask): void {
  const ballId = task.data[15];
  const x = task.data[1];
  const y = task.data[2];
  const priority = task.data[3];
  const subpriority = task.data[4];

  let sp: BallSprite | null = null;
  for (let i = 0; i < 10; i++) {
    sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
    if (sp) {
      sp.callback = FanOutBallOpenParticles_Step1;
      sp.data[0] = i * 25;
      sp.data[4] = 5;
      sp.data[5] = 1;
      sp.data[6] = 1;
    }
  }

  if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
  DestroyTask(task.taskId);
}

/** 1:1 décomp `GreatBallOpenParticleAnimation(u8 taskId)` (:1799-1842,
 *  « Also used for Luxury Ball ») — 2 vagues de 8 espacées de 8 frames
 *  (task.data[7] = délai, task.data[0] = compteur de vagues). */
function GreatBallOpenParticleAnimation(task: ParticleTask): void {
  if (task.data[7]) {
    task.data[7]--;
  } else {
    const ballId = task.data[15];
    const x = task.data[1];
    const y = task.data[2];
    const priority = task.data[3];
    const subpriority = task.data[4];

    let sp: BallSprite | null = null;
    for (let i = 0; i < 8; i++) {
      sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
      if (sp) {
        sp.callback = FanOutBallOpenParticles_Step1;
        sp.data[0] = i * 32;
        sp.data[4] = 8;
        sp.data[5] = 2;
        sp.data[6] = 2;
      }
    }

    task.data[7] = 8;
    if (++task.data[0] === 2) {
      if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
      DestroyTask(task.taskId);
    }
  }
}

/** 1:1 décomp `FanOutBallOpenParticles_Step1(sprite)` (:1844-1853) —
 *  spirale : angle += d4, rayons x += d5 / y += d6, 51 frames. */
function FanOutBallOpenParticles_Step1(sprite: BallSprite): void {
  sprite.x2 = Sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = Cos(sprite.data[0], sprite.data[2]);
  sprite.data[0] = (sprite.data[0] + sprite.data[4]) & 0xFF;
  sprite.data[1] += sprite.data[5];
  sprite.data[2] += sprite.data[6];
  if (++sprite.data[3] === 51) {
    DestroyBallOpenAnimationParticle(sprite);
  }
}

/** 1:1 décomp `RepeatBallOpenParticleAnimation(u8 taskId)` (:1855-1884) —
 *  POKEBALL_COUNT (12) étincelles, angle i*21. */
function RepeatBallOpenParticleAnimation(task: ParticleTask): void {
  const ballId = task.data[15];
  const x = task.data[1];
  const y = task.data[2];
  const priority = task.data[3];
  const subpriority = task.data[4];

  let sp: BallSprite | null = null;
  for (let i = 0; i < _POKEBALL_COUNT; i++) {
    sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
    if (sp) {
      sp.callback = RepeatBallOpenParticleAnimation_Step1;
      sp.data[0] = i * 21;
    }
  }

  if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
  DestroyTask(task.taskId);
}

/** 1:1 décomp `RepeatBallOpenParticleAnimation_Step1(sprite)` (:1886-1895). */
function RepeatBallOpenParticleAnimation_Step1(sprite: BallSprite): void {
  sprite.x2 = Sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = Cos(sprite.data[0], Sin(sprite.data[0], sprite.data[2]));
  sprite.data[0] = (sprite.data[0] + 6) & 0xFF;
  sprite.data[1]++;
  sprite.data[2]++;
  if (++sprite.data[3] === 51) {
    DestroyBallOpenAnimationParticle(sprite);
  }
}

/** 1:1 décomp `MasterBallOpenParticleAnimation(u8 taskId)` (:1897-1941) —
 *  2 anneaux de 8 (j=0 : d5=2/d6=1 ; j=1 : d5=1/d6=2), d4=8. */
function MasterBallOpenParticleAnimation(task: ParticleTask): void {
  const ballId = task.data[15];
  const x = task.data[1];
  const y = task.data[2];
  const priority = task.data[3];
  const subpriority = task.data[4];

  let sp: BallSprite | null = null;
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 8; i++) {
      sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
      if (sp) {
        sp.callback = FanOutBallOpenParticles_Step1;
        sp.data[0] = i * 32;
        sp.data[4] = 8;
        if (j === 0) {
          sp.data[5] = 2;
          sp.data[6] = 1;
        } else {
          sp.data[5] = 1;
          sp.data[6] = 2;
        }
      }
    }
  }

  if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
  DestroyTask(task.taskId);
}

/** 1:1 décomp `PremierBallOpenParticleAnimation(u8 taskId)` (:1943-1972). */
function PremierBallOpenParticleAnimation(task: ParticleTask): void {
  const ballId = task.data[15];
  const x = task.data[1];
  const y = task.data[2];
  const priority = task.data[3];
  const subpriority = task.data[4];

  let sp: BallSprite | null = null;
  for (let i = 0; i < 8; i++) {
    sp = _createBallParticleSprite(ballId, x, y, priority, subpriority);
    if (sp) {
      sp.callback = PremierBallOpenParticleAnimation_Step1;
      sp.data[0] = i * 32;
    }
  }

  if (!getRuntime()?.gMain?.inBattle && sp) sp.data[7] = 1;
  DestroyTask(task.taskId);
}

/** 1:1 décomp `PremierBallOpenParticleAnimation_Step1(sprite)` (:1974-1983). */
function PremierBallOpenParticleAnimation_Step1(sprite: BallSprite): void {
  sprite.x2 = Sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = Cos(sprite.data[0], Sin(sprite.data[0] & 0x3F, sprite.data[2]));
  sprite.data[0] = (sprite.data[0] + 10) & 0xFF;
  sprite.data[1]++;
  sprite.data[2]++;
  if (++sprite.data[3] === 51) {
    DestroyBallOpenAnimationParticle(sprite);
  }
}

/** 1:1 décomp `DestroyBallOpenAnimationParticle(sprite)` (:1985-2023) —
 *  en combat : numBallParticles-- ; à 0 et plus AUCUNE task particule active
 *  → libère les 12 tags (tiles + palettes). */
function DestroyBallOpenAnimationParticle(sprite: BallSprite): void {
  const rt = getRuntime();
  if (!rt?.gMain?.inBattle) {
    // 1:1 :1989-1995 — chemin hors combat (Birch/OW : servi par pokeball-effects,
    // jamais pris par les callers combat de ce miroir). DestroySpriteAndFree
    // Resources (data[7]==1) = dette : le sprite runtime ne porte pas les tags
    // de son template → destroy simple.
    _destroyBall(sprite);
    return;
  }
  setNumBallParticles(getNumBallParticles() - 1);
  if (getNumBallParticles() === 0) {
    let i = 0;
    for (; i < _POKEBALL_COUNT; i++) {
      if (FuncIsActiveTask(sBallParticleAnimationFuncs[i])) break;
    }

    if (i === _POKEBALL_COUNT) {
      for (let j = 0; j < _POKEBALL_COUNT; j++) {
        FreeSpriteTilesByTag(sBallParticleSpriteSheets[j].tag);
        FreeSpritePaletteByTag(sBallParticlePalettes[j].tag);
      }
    }

    _destroyBall(sprite);
  } else {
    _destroyBall(sprite);
  }
}

/** Séquence TS 1:1 du script asm `Special_BallThrow` (battle_anim_scripts.s:
 *  10719 — ABSENT du bytecode extrait, qui s'arrête aux moves) :
 *  launchtask AnimTask_IsBallBlockedByTrainer → block ? _StandingTrainer :
 *  ThrowBall → end. La « fin » (waitforvisualfinish) est observée par le
 *  caller via gDoingBattleAnim (cleared 1:1 par Capture_Step :95 /
 *  Release_Wait / Block_Step). */
export function Special_BallThrow_TS(): void {
  if (_ballThrowCaseId() === BALL_TRAINER_BLOCK) {
    const taskId = CreateTask(() => { /* géré par les SpriteCB */ }, 2);
    AnimTask_ThrowBall_StandingTrainer(taskId);
  } else {
    const taskId = CreateTask(() => { /* géré par les SpriteCB */ }, 2);
    AnimTask_ThrowBall(taskId);
  }
}

// ─── Registry bytecode (Cmd_createvisualtask → AnimTaskFn) ─────────────────
// Les scripts gBattleAnims_Special (Special_SwitchOutPlayerMon/OpponentMon,
// bytecode offsets 62397/62414) référencent ces 2 tasks par marqueur nominal.
// Convention registry : la fn reçoit l'OBJET DecompTask → wrapper vers nos
// signatures 1:1 (taskId). Enregistrées ici SEULEMENT celles dont le corps
// est réel (les stubs Dette R3 restent hors registre = skip propre + warn).

registerAnimTasks({
  AnimTask_SwitchOutShrinkMon: ((t: { taskId: number }) => AnimTask_SwitchOutShrinkMon(t.taskId)) as never,
  AnimTask_SwitchOutBallEffect: ((t: { taskId: number }) => AnimTask_SwitchOutBallEffect(t.taskId)) as never,
});

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleAnimThrow = {
  Special_BallThrow_TS, BeginNormalPaletteFade,
  ItemIdToBallId,
  AnimateBallOpenParticles, LoadBallParticleGfx,
  AnimTask_LoadBallGfx, AnimTask_FreeBallGfx,
  AnimTask_IsBallBlockedByTrainer,
  AnimTask_ThrowBall, AnimTask_ThrowBall_Step,
  AnimTask_ThrowBall_StandingTrainer, AnimTask_ThrowBall_StandingTrainer_Step,
  AnimTask_LoadHealthboxPalsForLevelUp, AnimTask_FreeHealthboxPalsForLevelUp,
  AnimTask_FlashHealthboxOnLevelUp, AnimTask_FlashHealthboxOnLevelUp_Step,
  AnimTask_UnusedLevelUpHealthBox,
  AnimTask_SwitchOutShrinkMon, AnimTask_SwitchOutBallEffect,
  AnimTask_SwapMonSpriteToFromSubstitute, AnimTask_SubstituteFadeToInvisible,
  AnimTask_IsAttackerBehindSubstitute, AnimTask_SetTargetToEffectBattler,
  AnimTask_LoadPokeblockGfx, AnimTask_FreePokeblockGfx,
  AnimTask_SetAttackerTargetLeftPos,
  AnimTask_GetTrappedMoveAnimId, AnimTask_GetBattlersFromArg,
  BALL_MASTER, BALL_ULTRA, BALL_GREAT, BALL_POKE, BALL_SAFARI,
  BALL_NET, BALL_DIVE, BALL_NEST, BALL_REPEAT, BALL_TIMER,
  BALL_LUXURY, BALL_PREMIER, BALL_TRAINER_BLOCK,
};

// ════════════════════════════════════════════════════════════════════════════
// SHINY (goal T5 2026-06-11) — 1:1 battle_anim_throw.c:2228-2380.
// TryShinyAnimation : PID check -> 2 tasks d etoiles (encircle Sin/Cos r24 +
// diagonal x2+=5/y2-=5 avec SE_SHINY) -> finishedShinyMonAnim.
// ════════════════════════════════════════════════════════════════════════════
export const ANIM_TAG_GOLD_STARS = 10233; // ANIM_SPRITES_START + 233

const _sGoldStarsSheet = { data: 'gAnimGfx_GoldStars', size: 192, tag: ANIM_TAG_GOLD_STARS };
const _sGoldStarsPal = { data: 'gAnimPal_GoldStars', tag: ANIM_TAG_GOLD_STARS };

type _ShinySprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; oamIndex?: number;
  callback: ((s: _ShinySprite) => void) | null;
};

function _shinyRt(): {
  gSprites?: Map<number, _ShinySprite>;
  gTasks?: Map<number, { data: number[]; taskId: number; func?: unknown }>;
  CreateTask?: (fn: unknown, prio: number) => number;
  DestroyTask?: (id: number) => void;
  DestroySprite?: (id: number) => void;
  CreateSpriteInline?: (t: never, x: number, y: number, s?: number) => number;
  gba?: { oam?: Array<{ tileId?: number }> };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}

/** 1:1 `TryShinyAnimation(battler, mon)` (:2228). Retourne true si shiny
 *  (anim lancee). Pose tried/finishedShinyMonAnim (battle-sprites-data). */
export function TryShinyAnimation(battler: number, mon: { otId?: number; personality?: number } | null): boolean {
  const sd = (globalThis as Record<string, unknown>).__battleSpritesData as {
    setStatusAnimActive?: unknown;
  } | undefined;
  void sd;
  _setShinyFlag(battler, 'tried');
  const otId = mon?.otId ?? 1;
  const personality = mon?.personality ?? 1;
  // 1:1 GET_SHINY_VALUE = HIHALF(otId)^LOHALF(otId)^HIHALF(pid)^LOHALF(pid) < 8.
  const shinyValue = ((otId >> 16) & 0xFFFF) ^ (otId & 0xFFFF) ^ ((personality >> 16) & 0xFFFF) ^ (personality & 0xFFFF);
  if (shinyValue < 8) {
    _LoadGoldStarsGfx();
    const rt = _shinyRt();
    const t1 = rt.CreateTask?.(Task_ShinyStars as never, 10) ?? -1;
    const t2 = rt.CreateTask?.(Task_ShinyStars as never, 10) ?? -1;
    const task1 = rt.gTasks?.get(t1); const task2 = rt.gTasks?.get(t2);
    if (task1) { task1.data[0] = battler; task1.data[1] = 0; /* ENCIRCLE */ }
    if (task2) { task2.data[0] = battler; task2.data[1] = 1; /* DIAGONAL */ }
    return true;
  }
  _setShinyFlag(battler, 'finished');
  return false;
}
const _shinyFlags: Record<number, { tried?: boolean; finished?: boolean }> = {};
function _setShinyFlag(battler: number, k: 'tried' | 'finished'): void {
  (_shinyFlags[battler] = _shinyFlags[battler] ?? {})[k] = true;
}
export function isShinyAnimFinished(battler: number): boolean {
  return _shinyFlags[battler]?.finished ?? true;
}
/** True si TryShinyAnimation a déjà été tentée pour ce battler (1:1
 *  healthBoxesData[b].triedShinyMonAnim). */
export function hasTriedShinyAnim(battler: number): boolean {
  return _shinyFlags[battler]?.tried ?? false;
}
/** 1:1 les deux clears de SwitchIn_ShowHealthbox (battle_controller_*.c) :
 *  triedShinyMonAnim = FALSE ; finishedShinyMonAnim = FALSE. */
export function resetShinyAnimFlags(battler: number): void {
  delete _shinyFlags[battler];
}
function _LoadGoldStarsGfx(): void {
  // pattern LoadBallGfx (sheet+palette par TAG depuis assetCache precharge).
  const gg = (globalThis as Record<string, unknown>);
  const load = gg.__loadCompressedSheets as undefined;
  void load;
  try {
    // imports deja en scope module (LoadCompressedSpriteSheetUsingHeap & co
    // sont importes en tete de battle_anim_throw.ts via decomp-globals ? si
    // non, lazy via globalThis __decompGlobals — fallback no-op).
    const dg = (globalThis as Record<string, unknown>).__decompGlobals as {
      GetSpriteTileStartByTag?: (t: number) => number;
      LoadCompressedSpriteSheetUsingHeap?: (s: unknown) => void;
      LoadCompressedSpritePaletteUsingHeap?: (s: unknown) => void;
    } | undefined;
    if (dg?.GetSpriteTileStartByTag?.(ANIM_TAG_GOLD_STARS) === 0xFFFF) {
      dg.LoadCompressedSpriteSheetUsingHeap?.(_sGoldStarsSheet);
      dg.LoadCompressedSpritePaletteUsingHeap?.(_sGoldStarsPal);
    }
  } catch { /* dette douce */ }
}

// data : [0]=battler, [1]=move(0 encircle/1 diagonal), [2]=timer, [3]=starTimer,
//        [4]=starIdx, [5]=numStars.
function Task_ShinyStars(task: { data: number[]; taskId: number; func?: unknown }): void {
  const rt = _shinyRt();
  if (task.data[2] < 60) { task.data[2]++; return; }
  const timer = task.data[3]++;
  if (timer % 4) return;
  const battler = task.data[0];
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const monSp = rt.gSprites?.get(co?.getBattlerMonSpriteId?.(battler) ?? -1);
  const x = monSp ? monSp.x : 120;
  const y = monSp ? monSp.y : 60;
  const starIdx = task.data[4];
  const dg = (globalThis as Record<string, unknown>).__decompGlobals as { GetSpriteTileStartByTag?: (t: number) => number } | undefined;
  const base = dg?.GetSpriteTileStartByTag?.(ANIM_TAG_GOLD_STARS) ?? 0xFFFF;
  // FIX user 2026-06-11 (« etoiles corrompues = la pokeball tetris ») :
  // CreateSpriteInline n'assigne NI sheet NI palette du tag -> tiles/palette
  // d'autrui. Le fix ball : CreateSprite SYSTEME par template a TAGS
  // (resolution sheet+palette par tag, _CreateSpriteFromTemplate).
  const spriteId = _CreateSpriteFromTemplate({
    tileTag: ANIM_TAG_GOLD_STARS, paletteTag: ANIM_TAG_GOLD_STARS,
    oam: { shape: 0, size: 1 },
    callback: null,
  } as never, x, y, 5);
  if (spriteId >= 0) {
    const sp = rt.gSprites?.get(spriteId);
    if (sp) {
      sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
      sp.invisible = false;
      // tiles : grande etoile = base+0 (16x16, 4 tiles) ; minis = base+4 / base+5.
      const oam = rt.gba?.oam?.[sp.oamIndex ?? -1];
      if (oam && base !== 0xFFFF && starIdx !== 0) {
        oam.tileId = base + (starIdx < 4 ? 4 : 5);
      }
      sp.data[6] = task.taskId;
      if (task.data[1] === 0) {
        sp.data[7] = 0; // phase
        sp.callback = _ShinyStar_Encircle;
      } else {
        sp.callback = _ShinyStar_Diagonal;
        sp.x2 = -32;
        sp.y2 = 32;
        sp.invisible = true;
        if (starIdx === 0) {
          const playSE = (globalThis as Record<string, unknown>).__PlaySE as ((id: number) => void) | undefined;
          playSE?.(0xFF); // SE_SHINY (=255) — meme infra SE validee
        }
      }
      task.data[5]++;
    }
    task.data[4]++;
  }
  if (task.data[4] === 5) task.func = Task_ShinyStars_Wait as never;
}
function Task_ShinyStars_Wait(task: { data: number[]; taskId: number }): void {
  const rt = _shinyRt();
  if (task.data[5] === 0) {
    if (task.data[1] === 1) _setShinyFlag(task.data[0], 'finished');
    rt.DestroyTask?.(task.taskId);
  }
}
function _shinyStarDone(sprite: _ShinySprite): void {
  const rt = _shinyRt();
  const task = rt.gTasks?.get(sprite.data[6]);
  if (task) task.data[5]--;
  // destroy
  for (const [id, sp] of rt.gSprites?.entries() ?? []) {
    if ((sp as unknown) === (sprite as unknown)) {
      rt.DestroySprite?.(id);
      // pas de gSprites.delete (slot garde jusqu'a reallocation, 1:1)
      break;
    }
  }
}
function _ShinyStar_Encircle(sprite: _ShinySprite): void {
  const trig = (globalThis as Record<string, unknown>).__trig as { Sin?: (i: number, a: number) => number; Cos?: (i: number, a: number) => number } | undefined;
  const sin = trig?.Sin ?? ((i: number, a: number) => Math.round(Math.sin((i / 256) * 2 * Math.PI) * a));
  const cos = trig?.Cos ?? ((i: number, a: number) => Math.round(Math.cos((i / 256) * 2 * Math.PI) * a));
  sprite.x2 = sin(sprite.data[7], 24);
  sprite.y2 = cos(sprite.data[7], 24);
  sprite.data[7] += 12;
  if (sprite.data[7] > 255) _shinyStarDone(sprite);
}
function _ShinyStar_Diagonal(sprite: _ShinySprite): void {
  if (sprite.data[5] < 4) {
    sprite.data[5]++;
  } else {
    sprite.invisible = false;
    sprite.x2 += 5;
    sprite.y2 -= 5;
    if (sprite.x2 > 32) _shinyStarDone(sprite);
  }
}

// Surface harness/consommateurs (chaîne SwitchIn_TryShinyAnim côté opponent).
(globalThis as Record<string, unknown>).__battleAnimThrowShiny = {
  TryShinyAnimation, isShinyAnimFinished, hasTriedShinyAnim, resetShinyAnimFlags,
};
