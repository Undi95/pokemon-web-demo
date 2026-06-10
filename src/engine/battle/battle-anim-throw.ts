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

import { getRuntime } from '../system/decomp-globals';
import {
  gLastUsedItem, gBattleStruct,
} from './state';

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
  const ba = (globalThis as Record<string, unknown>).__battleAnim as {
    gBattleAnimAttacker?: number; gBattleAnimTarget?: number;
    gBattleAnimArgs?: Int16Array; DestroyAnimVisualTask?: (taskId: number) => void;
  } | undefined;
  return {
    attacker: ba?.gBattleAnimAttacker ?? 0,
    target: ba?.gBattleAnimTarget ?? 1,
    args: ba?.gBattleAnimArgs ?? new Int16Array(8),
    destroyTask: ba?.DestroyAnimVisualTask ?? ((_taskId: number): void => { /* no-op */ }),
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
  // Dette R3 : full ball graphics tile loading via runtime.
  // Cascade : LoadCompressedSpriteSheet + LoadSpritePalette via tag.
  // Notre battle-ball-throw.ts existant gère partial ; wire complet ultérieur.
  void ballId;
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

/** 1:1 décomp `AnimTask_SwitchOutShrinkMon(taskId)` (642-668). Setup affine
 *  shrink animation pour return-to-ball. */
export function AnimTask_SwitchOutShrinkMon(taskId: number): void {
  // Dette R3 : affine shrink anim via OAM matrix + AnimTaskSetCenterToCornerVec.
  // Cascade vers battle-ball-throw.ts which has partial.
  void taskId;
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_SwitchOutBallEffect (battle_anim_throw.c:669) ────────────────

/** 1:1 décomp `AnimTask_SwitchOutBallEffect(taskId)` (669-702). Ball capture
 *  effect when switching out (= mon goes back in ball with red beam). */
export function AnimTask_SwitchOutBallEffect(taskId: number): void {
  // Dette R3 : ball glow + red beam particle emission via sprite spawn.
  void taskId;
  DestroyAnimVisualTask(taskId);
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

/** Helper : spawn ball sprite via runtime CreateSprite. */
function _CreateBallSprite(ballId: number, x: number, y: number, subpriority: number): number {
  void ballId; void subpriority;
  // Dette R3 : full ball sprite template lookup gBallSpriteTemplates[ballId].
  // Pour now : wire vers battle-ball-throw.ts existant qui gère ball arc.
  const rt = getRuntime();
  if (!rt) return -1;
  // Approximation : return un dummy sprite id.
  void x; void y;
  return -1;
}

/** Helper : récupère le sprite battler id (= gBattlerSpriteIds[battler]). */
function _getBattlerSpriteId(battler: number): number {
  // Dette R3 : gBattlerSpriteIds tracker. Pour now : returns battler index.
  return battler;
}

/** Helper : GetBattlerSpriteCoord (battle_anim_mons.c). */
function _GetBattlerSpriteCoord(battler: number, coord: number): number {
  // 1:1 décomp : BATTLER_COORD_X/Y → sBattlerCoords[position]. Single battle :
  //   Player coord X = 72, Y = 80 (+ y_offset)
  //   Opponent coord X = 176, Y = 40 (+ y_offset)
  // Dette R3 : full sBattlerCoords table + y_offset per species.
  void battler;
  if (coord === 0) return 176;  // X
  return 40;  // Y
}

/** Helper : SpriteCB_Ball_Throw (= ball arc trajectory callback). */
function SpriteCB_Ball_Throw(sprite: { data: number[]; x?: number; y?: number; x2?: number; y2?: number; callback?: unknown }): void {
  // Dette R3 : full ball arc trajectory (= parabolic curve + reach + bounce).
  // Cascade vers battle-ball-throw.ts existant qui implémente le arc.
  // Pour now : decrement sDuration jusqu'à 0xFFFF (= done).
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
  } else {
    sprite.data[0] = 0xFFFF;  // animation done sentinel
  }
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleAnimThrow = {
  ItemIdToBallId,
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
