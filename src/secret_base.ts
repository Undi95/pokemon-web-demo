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

import type { DecompTask } from '../harness/runtime/decomp-runtime';
import { VarGet, VarSet } from './event_data';
import { PlayerGetDestCoords } from './field_player_avatar';
import { MapGridGetMetatileBehaviorAt, MapGridGetMetatileIdAt } from './fieldmap';
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
} from '../include/constants/metatile_behaviors';
import { PopSecretBaseBalloon, ShatterSecretBaseBreakableDoor } from './fldeff_misc';
import { FieldEffectActiveListContains } from './field_effect';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { emptySecretBase } from './engine/save/save-blocks';
import type { SecretBase } from './engine/save/save-blocks';
import { SECRET_BASES_COUNT } from '../include/constants/global';
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
} from '../include/constants/metatile_labels';
import {
  VAR_CURRENT_SECRET_BASE,
  VAR_SECRET_BASE_STEP_COUNTER,
  VAR_SECRET_BASE_HIGH_TV_FLAGS,
  VAR_SECRET_BASE_LOW_TV_FLAGS,
} from '../include/constants/vars';

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

// ─── Seeding new-game (NewGameInitData, new_game.c:170) ─────────────────────

/** 1:1 décomp `static void ClearSecretBase(struct SecretBase *secretBase)`
 *  (secret_base.c:222-228) : CpuFastFill16(0, …, sizeof) + trainerName[i]=EOS.
 *  Chez nous = remplace le slot par la struct zéro (trainerName '' = EOS ×7). */
function ClearSecretBase(secretBases: SecretBase[], index: number): void {
  secretBases[index] = emptySecretBase();
}

/** 1:1 décomp `void ClearSecretBases(void)` (secret_base.c:230-235). */
export function ClearSecretBases(): void {
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    ClearSecretBase(gSaveBlock1Ptr.secretBases, i);
  }
}


// ─── sCurSecretBaseId + specials 1:1 (secret_base.c subset) — ex-engine/pokemon/secret-base.ts (lot 12) ──
// Subset : sCurSecretBaseId (:78) + SetCurSecretBaseId/TrySetCurSecretBaseIndex +
// IsCurSecretBaseOwnedByAnotherPlayer (specials byte-VM). Le flow EnterSecretBase
// complet (tasks, décorations) = à transcrire dans CE fichier quand le chantier
// secret bases s'ouvrira.
import { registerSpecial as _registerSpecial_SB } from './scrcmd';
import { GetPlayerNameString as _GetPlayerNameString_SB } from '../include/text';
import { VarGet as _VarGet_SB, VarSet as _VarSet_SB, gSpecialVar as _gSpecialVar_SB } from './engine/script/script-vars';
import { gSaveBlock1Ptr as _gSaveBlock1Ptr_SB, gSaveBlock2Ptr as _gSaveBlock2Ptr_SB } from './engine/save/save-block-state';
import { SECRET_BASES_COUNT as _SECRET_BASES_COUNT_SB, TRAINER_ID_LENGTH as _TRAINER_ID_LENGTH_SB, LANGUAGE_FRENCH as _LANGUAGE_FRENCH_SB } from '../include/constants/global';
import { gMapHeader as _gMapHeader_SB } from './fieldmap';
import { resolveDecompConstant as _resolveDecompConstant_SB } from '../harness/runtime/decomp-constants';

/** 1:1 décomp `static EWRAM_DATA u8 sCurSecretBaseId = 0` (secret_base.c:78). */
let sCurSecretBaseId = 0;

/** Helper export pour secret_base.c callers (= future ports). */
export function getCurSecretBaseId(): number {
  return sCurSecretBaseId;
}

/** Helper export pour secret_base.c callers (= future ports). */
export function setCurSecretBaseId(v: number): void {
  sCurSecretBaseId = v & 0xFF;
}

// ─── Specials registry — secret_base.c ports ───────────────────────────────

/** 1:1 décomp `IsCurSecretBaseOwnedByAnotherPlayer` (secret_base.c:720-726) :
 *  ```c
 *  void IsCurSecretBaseOwnedByAnotherPlayer(void) {
 *      if (_gSaveBlock1Ptr_SB->secretBases[0].secretBaseId != sCurSecretBaseId)
 *          _gSpecialVar_SB_Result = TRUE;
 *      else
 *          _gSpecialVar_SB_Result = FALSE;
 *  }
 *  ```
 *  Compare base[0].id (= player's own base) vs sCurSecretBaseId (= base
 *  currently entering). Different = entering someone else's base. */
_registerSpecial_SB('IsCurSecretBaseOwnedByAnotherPlayer', () => {
  const ownId = _gSaveBlock1Ptr_SB.secretBases?.[0]?.secretBaseId ?? 0;
  _gSpecialVar_SB.Result = ownId !== sCurSecretBaseId ? 1 : 0;
});

/** 1:1 décomp `TrySetCurSecretBaseIndex` (secret_base.c:242-256) :
 *  ```c
 *  void TrySetCurSecretBaseIndex(void) {
 *      u16 i;
 *      _gSpecialVar_SB_Result = FALSE;
 *      for (i = 0; i < _SECRET_BASES_COUNT_SB; i++) {
 *          if (sCurSecretBaseId == _gSaveBlock1Ptr_SB->secretBases[i].secretBaseId) {
 *              _gSpecialVar_SB_Result = TRUE;
 *              _VarSet_SB(VAR_CURRENT_SECRET_BASE, i);
 *              break;
 *          }
 *      }
 *  }
 *  ```
 *  Find l'index dans secretBases[] qui matche sCurSecretBaseId. Set
 *  VAR_CURRENT_SECRET_BASE = i si trouvé. */
_registerSpecial_SB('TrySetCurSecretBaseIndex', () => {
  _gSpecialVar_SB.Result = 0;
  for (let i = 0; i < _SECRET_BASES_COUNT_SB; i++) {
    const baseId = _gSaveBlock1Ptr_SB.secretBases?.[i]?.secretBaseId ?? 0;
    if (sCurSecretBaseId === baseId) {
      _gSpecialVar_SB.Result = 1;
      _VarSet_SB('VAR_CURRENT_SECRET_BASE', i);
      break;
    }
  }
});

/** 1:1 décomp `SetCurSecretBaseId` (secret_base.c:237-240) — static helper
 *  appelé par les scripts via gSpecials (= setcursecretbase special).
 *  ```c
 *  static void SetCurSecretBaseId(void) {
 *      sCurSecretBaseId = _gSpecialVar_SB_0x8004;
 *  }
 *  ```
 *  Notre port : enregistré sous le special name `SetCurSecretBaseId`. */
_registerSpecial_SB('SetCurSecretBaseId', () => {
  sCurSecretBaseId = _VarGet_SB('VAR_0x8004') & 0xFF;
});

/** 1:1 décomp `IsSecretBaseRegistered` (secret_base.c:752-758) :
 *  ```c
 *  static bool8 IsSecretBaseRegistered(u8 secretBaseIdx) {
 *      if (_gSaveBlock1Ptr_SB->secretBases[secretBaseIdx].registryStatus) return TRUE;
 *      return FALSE;
 *  }
 *  ```
 *  Helper interne, exporté pour reuse par d'autres specials. */
function _isSecretBaseRegistered(idx: number): boolean {
  return !!_gSaveBlock1Ptr_SB.secretBases?.[idx]?.registryStatus;
}

/** 1:1 décomp `GetNumRegisteredSecretBases` (secret_base.c:868-879) :
 *  ```c
 *  static u8 GetNumRegisteredSecretBases(void) {
 *      s16 i; u8 count = 0;
 *      for (i = 1; i < _SECRET_BASES_COUNT_SB; i++) {
 *          if (IsSecretBaseRegistered(i) == TRUE) count++;
 *      }
 *      return count;
 *  }
 *  ```
 *  Loop i=1.._SECRET_BASES_COUNT_SB (= 1..20 exclu base[0] qui est player's). */
function _getNumRegisteredSecretBases(): number {
  let count = 0;
  for (let i = 1; i < _SECRET_BASES_COUNT_SB; i++) {
    if (_isSecretBaseRegistered(i)) count++;
  }
  return count;
}

/** 1:1 décomp `GetCurSecretBaseRegistrationValidity` (secret_base.c:881-889) :
 *  ```c
 *  void GetCurSecretBaseRegistrationValidity(void) {
 *      if (IsSecretBaseRegistered(_VarGet_SB(VAR_CURRENT_SECRET_BASE)) == TRUE)
 *          _gSpecialVar_SB_Result = 1;
 *      else if (GetNumRegisteredSecretBases() >= 10)
 *          _gSpecialVar_SB_Result = 2;
 *      else
 *          _gSpecialVar_SB_Result = 0;
 *  }
 *  ```
 *  Result : 1 = already registered, 2 = max 10 atteint, 0 = peut register. */
_registerSpecial_SB('GetCurSecretBaseRegistrationValidity', () => {
  const idx = _VarGet_SB('VAR_CURRENT_SECRET_BASE');
  if (_isSecretBaseRegistered(idx)) {
    _gSpecialVar_SB.Result = 1;
  } else if (_getNumRegisteredSecretBases() >= 10) {
    _gSpecialVar_SB.Result = 2;
  } else {
    _gSpecialVar_SB.Result = 0;
  }
});

/** 1:1 décomp `PrepSecretBaseBattleFlags` (secret_base.c:1164-1168) :
 *  ```c
 *  void PrepSecretBaseBattleFlags(void) {
 *      TryGainNewFanFromCounter(FANCOUNTER_BATTLED_AT_BASE);
 *      gTrainerBattleOpponent_A = TRAINER_SECRET_BASE;
 *      gBattleTypeFlags = BATTLE_TYPE_TRAINER | BATTLE_TYPE_SECRET_BASE;
 *  }
 *  ```
 *  Dette R3 partielle : TryGainNewFanFromCounter cascade fan club. Notre
 *  port set juste gTrainerBattleOpponent_A + gBattleTypeFlags via globalThis
 *  bridge (= battle state mutators).
 *  TRAINER_SECRET_BASE = 0x400 (= include/constants/trainers.h).
 *  BATTLE_TYPE_TRAINER = 0x8, BATTLE_TYPE_SECRET_BASE = 0x80000. */
_registerSpecial_SB('PrepSecretBaseBattleFlags', () => {
  const bridge = (globalThis as { __battleStateMutators?: {
    setTrainerBattleOpponentA?: (v: number) => void;
    setBattleTypeFlags?: (v: number) => void;
  } }).__battleStateMutators;
  if (bridge?.setTrainerBattleOpponentA) bridge.setTrainerBattleOpponentA(0x400);
  if (bridge?.setBattleTypeFlags) bridge.setBattleTypeFlags(0x8 | 0x80000);
  // TryGainNewFanFromCounter : dette R3 (= cascade FANCOUNTER_BATTLED_AT_BASE
  // pas porté).
});

/** 1:1 décomp `SetSecretBaseOwnerGfxId` (secret_base.c:654-657) :
 *  ```c
 *  void SetSecretBaseOwnerGfxId(void) {
 *      _VarSet_SB(VAR_OBJ_GFX_ID_F, sSecretBaseOwnerGfxIds[GetSecretBaseOwnerType(_VarGet_SB(VAR_CURRENT_SECRET_BASE))]);
 *  }
 *  ```
 *  sSecretBaseOwnerGfxIds 1:1 décomp secret_base.c:162-176 — table[10] : male
 *  0..4 = YOUNGSTER/BUG_CATCHER/RICH_BOY/CAMPER/MAN_3, female 5..9 = LASS/
 *  GIRL_3/WOMAN_2/PICNICKER/WOMAN_5. GetSecretBaseOwnerType (= already
 *  inline B22) = (trainerId[0] % 5) + (gender * 5). */
_registerSpecial_SB('SetSecretBaseOwnerGfxId', () => {
  const sSecretBaseOwnerGfxIds: ReadonlyArray<number> = [
    35, 36, 15, 31, 33,  // Male : YOUNGSTER/BUG_CATCHER/RICH_BOY/CAMPER/MAN_3
    47, 14, 20, 32, 34,  // Female : LASS/GIRL_3/WOMAN_2/PICNICKER/WOMAN_5
  ];
  const idx = _VarGet_SB('VAR_CURRENT_SECRET_BASE');
  const base = _gSaveBlock1Ptr_SB.secretBases?.[idx];
  if (!base) return;
  // 1:1 décomp `GetSecretBaseOwnerType` (secret_base.c:1133).
  const ownerType = ((base.trainerId?.[0] ?? 0) % 5) + ((base.gender ?? 0) * 5);
  _VarSet_SB('VAR_OBJ_GFX_ID_F', sSecretBaseOwnerGfxIds[ownerType] ?? 0);
});

/** 1:1 décomp `SetPlayerSecretBase` (secret_base.c:365-377) :
 *  ```c
 *  void SetPlayerSecretBase(void) {
 *      u16 i;
 *      _gSaveBlock1Ptr_SB->secretBases[0].secretBaseId = sCurSecretBaseId;
 *      for (i = 0; i < _TRAINER_ID_LENGTH_SB; i++)
 *          _gSaveBlock1Ptr_SB->secretBases[0].trainerId[i] = _gSaveBlock2Ptr_SB->playerTrainerId[i];
 *      _VarSet_SB(VAR_CURRENT_SECRET_BASE, 0);
 *      StringCopyN(_gSaveBlock1Ptr_SB->secretBases[0].trainerName,
 *                  _gSaveBlock2Ptr_SB->playerName, GetNameLength(playerName));
 *      _gSaveBlock1Ptr_SB->secretBases[0].gender = _gSaveBlock2Ptr_SB->playerGender;
 *      _gSaveBlock1Ptr_SB->secretBases[0].language = GAME_LANGUAGE;
 *      _VarSet_SB(VAR_SECRET_BASE_MAP, _gMapHeader_SB.regionMapSectionId);
 *  }
 *  ```
 *  Setup player's secret base avec données player + cur map.
 *  Cascade R3 : mapSec stored numeric ; nous resolve via reverseDecompConstant
 *  (= notre regionMapSectionId est MAPSEC_* string). GetNameLength inline. */
_registerSpecial_SB('SetPlayerSecretBase', () => {
  const base = _gSaveBlock1Ptr_SB.secretBases?.[0];
  if (!base) return;
  base.secretBaseId = sCurSecretBaseId;
  // 1:1 décomp loop _TRAINER_ID_LENGTH_SB=4 copy.
  if (!base.trainerId) base.trainerId = [0, 0, 0, 0];
  for (let i = 0; i < _TRAINER_ID_LENGTH_SB; i++) {
    base.trainerId[i] = _gSaveBlock2Ptr_SB.playerTrainerId?.[i] ?? 0;
  }
  _VarSet_SB('VAR_CURRENT_SECRET_BASE', 0);
  // 1:1 décomp StringCopyN + GetNameLength (= EOS=0xFF search).
  const playerName = _GetPlayerNameString_SB();
  base.trainerName = playerName;
  base.gender = _gSaveBlock2Ptr_SB.playerGender ?? 0;
  base.language = _LANGUAGE_FRENCH_SB;  // 1:1 décomp GAME_LANGUAGE = _LANGUAGE_FRENCH_SB=3 (FR).
  // 1:1 décomp _VarSet_SB(VAR_SECRET_BASE_MAP, _gMapHeader_SB.regionMapSectionId).
  const mapsecName = _gMapHeader_SB?.regionMapSectionId;
  if (mapsecName) {
    const numericId = _resolveDecompConstant_SB(mapsecName);
    if (numericId !== undefined) {
      _VarSet_SB('VAR_SECRET_BASE_MAP', numericId);
    }
  }
});
