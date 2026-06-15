/**
 * secret_base.ts — Port 1:1 STRICT (MIROIR partiel) de `src/secret_base.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/secret_base.c`.
 *
 * Ce module ne porte (pour l'instant) que `SecretBasePerStepCallback`
 * (secret_base.c:1199) — le per-step callback STEP_CB_SECRET_BASE référencé par
 * `sPerStepCallbacks` (field_tasks.c). Le reste de secret_base.c = chantier séparé.
 *
 * Rôle : à chaque pas dans une base secrète, si on est dans la base d'un AMI
 * (`sInFriendSecretBase`), enregistre quel mobilier a été utilisé via les vars de
 * flags TV (HIGH/LOW). Déclenche aussi les effets visuels ballon/porte cassable
 * (fldeff_misc.ts).
 */

import type { DecompTask } from '../engine/system/decomp-runtime';
import { VarGet, VarSet } from './event_data';
import { PlayerGetDestCoords } from '../engine/field/player-avatar';
import { MapGridGetMetatileBehaviorAt, MapGridGetMetatileIdAt } from '../engine/field/map-loader';
import {
  MetatileBehavior_IsSecretBaseGlitterMat,
  MetatileBehavior_IsSecretBaseBalloon,
  MetatileBehavior_IsSecretBaseBreakableDoor,
  MetatileBehavior_IsSecretBaseSoundMat,
  MetatileBehavior_IsSecretBaseJumpMat,
  MetatileBehavior_IsSecretBaseSpinMat,
} from './metatile_behavior';
import {
  MB_IMPASSABLE_NORTHEAST,
  MB_IMPASSABLE_NORTHWEST,
  MB_IMPASSABLE_WEST_AND_EAST,
  MB_SLIDE_SOUTH,
} from '../engine/system/metatile-behavior-constants';
import { PopSecretBaseBalloon, ShatterSecretBaseBreakableDoor } from './fldeff_misc';
import { FieldEffectActiveListContains } from '../engine/field/field-effect-active-list';
import {
  METATILE_SecretBase_SolidBoard_Top,
  METATILE_SecretBase_SolidBoard_Bottom,
  METATILE_SecretBase_SmallChair,
  METATILE_SecretBase_PokemonChair,
  METATILE_SecretBase_HeavyChair,
  METATILE_SecretBase_PrettyChair,
  METATILE_SecretBase_ComfortChair,
  METATILE_SecretBase_RaggedChair,
  METATILE_SecretBase_BrickChair,
  METATILE_SecretBase_CampChair,
  METATILE_SecretBase_HardChair,
  METATILE_SecretBase_RedTent_DoorTop,
  METATILE_SecretBase_RedTent_Door,
  METATILE_SecretBase_BlueTent_DoorTop,
  METATILE_SecretBase_BlueTent_Door,
  METATILE_SecretBase_Stand_CornerRight,
  METATILE_SecretBase_Stand_CornerLeft,
  METATILE_SecretBase_Slide_StairLanding,
  METATILE_SecretBase_Slide_SlideTop,
  METATILE_SecretBase_RedBalloon,
  METATILE_SecretBase_BlueBalloon,
  METATILE_SecretBase_YellowBalloon,
  METATILE_SecretBase_MudBall,
} from '../engine/decomp-data/include/constants/metatile_labels-data';
import {
  VAR_CURRENT_SECRET_BASE,
  VAR_SECRET_BASE_STEP_COUNTER,
  VAR_SECRET_BASE_HIGH_TV_FLAGS,
  VAR_SECRET_BASE_LOW_TV_FLAGS,
} from './include/constants/vars';

// ─── 1:1 décomp flags TV (constants/tv.h). Deux namespaces : LOW_TV_FLAGS et
// HIGH_TV_FLAGS (mêmes valeurs de bit, vars distinctes). ────────────────────
const SECRET_BASE_USED_CHAIR = 1 << 0;        // LOW
const SECRET_BASE_USED_BALLOON = 1 << 1;      // LOW
const SECRET_BASE_USED_TENT = 1 << 2;         // LOW
const SECRET_BASE_USED_MUD_BALL = 1 << 8;     // LOW
const SECRET_BASE_USED_NOTE_MAT = 1 << 15;    // LOW
const SECRET_BASE_USED_SPIN_MAT = 1 << 1;     // HIGH
const SECRET_BASE_USED_SOLID_BOARD = 1 << 5;  // HIGH
const SECRET_BASE_USED_GLITTER_MAT = 1 << 7;  // HIGH
const SECRET_BASE_USED_STAND = 1 << 9;        // HIGH
const SECRET_BASE_USED_BREAKABLE_DOOR = 1 << 10; // HIGH
const SECRET_BASE_USED_SLIDE = 1 << 12;       // HIGH
const SECRET_BASE_DECLINED_SLIDE = 1 << 13;   // HIGH
const SECRET_BASE_USED_JUMP_MAT = 1 << 14;    // HIGH

// 1:1 décomp `static EWRAM_DATA bool8 sInFriendSecretBase` (secret_base.c:79).
let sInFriendSecretBase = false;

// Helpers VarSet |= / ^= (= `*GetVarPointer(var) |= flag` décomp via VarGet/VarSet).
function _varSetBit(varId: number, flag: number): void {
  VarSet(varId, VarGet(varId) | flag);
}
function _varToggleBit(varId: number, flag: number): void {
  VarSet(varId, VarGet(varId) ^ flag);
}

// ─── 1:1 décomp `SecretBasePerStepCallback(u8 taskId)` (secret_base.c:1199-1329) ──
// #define tStepCb  data[0]  (= tCallbackId, géré par Task_RunPerStepCallback)
// #define tState   data[1]
// #define tPlayerX data[2]
// #define tPlayerY data[3]
// #define tFldEff  data[4]
export function SecretBasePerStepCallback(task: DecompTask): void {
  const data = task.data;
  switch (data[1]) { // tState
    case 0: {
      sInFriendSecretBase = VarGet(VAR_CURRENT_SECRET_BASE) !== 0;
      const { x, y } = PlayerGetDestCoords();
      data[2] = x; // tPlayerX
      data[3] = y; // tPlayerY
      data[1] = 1; // tState
      break;
    }
    case 1: {
      // End if player hasn't moved.
      const { x, y } = PlayerGetDestCoords();
      if (x === data[2] && y === data[3]) return; // tPlayerX / tPlayerY

      data[2] = x;
      data[3] = y;
      VarSet(VAR_SECRET_BASE_STEP_COUNTER, VarGet(VAR_SECRET_BASE_STEP_COUNTER) + 1);
      const behavior = MapGridGetMetatileBehaviorAt(x, y);
      const tileId = MapGridGetMetatileIdAt(x, y);

      if (tileId === METATILE_SecretBase_SolidBoard_Top || tileId === METATILE_SecretBase_SolidBoard_Bottom) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SOLID_BOARD);
      } else if (
        tileId === METATILE_SecretBase_SmallChair
        || tileId === METATILE_SecretBase_PokemonChair
        || tileId === METATILE_SecretBase_HeavyChair
        || tileId === METATILE_SecretBase_PrettyChair
        || tileId === METATILE_SecretBase_ComfortChair
        || tileId === METATILE_SecretBase_RaggedChair
        || tileId === METATILE_SecretBase_BrickChair
        || tileId === METATILE_SecretBase_CampChair
        || tileId === METATILE_SecretBase_HardChair
      ) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_CHAIR);
      } else if (
        tileId === METATILE_SecretBase_RedTent_DoorTop
        || tileId === METATILE_SecretBase_RedTent_Door
        || tileId === METATILE_SecretBase_BlueTent_DoorTop
        || tileId === METATILE_SecretBase_BlueTent_Door
      ) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_TENT);
      } else if (
        (behavior === MB_IMPASSABLE_NORTHEAST && tileId === METATILE_SecretBase_Stand_CornerRight)
        || (behavior === MB_IMPASSABLE_NORTHWEST && tileId === METATILE_SecretBase_Stand_CornerLeft)
      ) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_STAND);
      } else if (behavior === MB_IMPASSABLE_WEST_AND_EAST && tileId === METATILE_SecretBase_Slide_StairLanding) {
        if (sInFriendSecretBase) {
          _varToggleBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SLIDE);
          _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_DECLINED_SLIDE);
        }
      } else if (behavior === MB_SLIDE_SOUTH && tileId === METATILE_SecretBase_Slide_SlideTop) {
        if (sInFriendSecretBase) {
          _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SLIDE);
          _varToggleBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_DECLINED_SLIDE);
        }
      } else if (MetatileBehavior_IsSecretBaseGlitterMat(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_GLITTER_MAT);
      } else if (MetatileBehavior_IsSecretBaseBalloon(behavior)) {
        PopSecretBaseBalloon(tileId, x, y);
        if (sInFriendSecretBase) {
          switch (tileId) {
            case METATILE_SecretBase_RedBalloon:
            case METATILE_SecretBase_BlueBalloon:
            case METATILE_SecretBase_YellowBalloon:
              _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_BALLOON);
              break;
            case METATILE_SecretBase_MudBall:
              _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_MUD_BALL);
              break;
          }
        }
      } else if (MetatileBehavior_IsSecretBaseBreakableDoor(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_BREAKABLE_DOOR);
        ShatterSecretBaseBreakableDoor(x, y);
      } else if (MetatileBehavior_IsSecretBaseSoundMat(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_LOW_TV_FLAGS, SECRET_BASE_USED_NOTE_MAT);
      } else if (MetatileBehavior_IsSecretBaseJumpMat(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_JUMP_MAT);
      } else if (MetatileBehavior_IsSecretBaseSpinMat(behavior)) {
        if (sInFriendSecretBase) _varSetBit(VAR_SECRET_BASE_HIGH_TV_FLAGS, SECRET_BASE_USED_SPIN_MAT);
      }
      break;
    }
    case 2:
      // 1:1 décomp : "This state is never reached, and tFldEff is never set".
      if (!FieldEffectActiveListContains(data[4])) data[1] = 1; // tFldEff / tState
      break;
  }
}
