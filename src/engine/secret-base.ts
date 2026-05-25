/**
 * secret-base.ts — 1:1 port subset de `src/secret_base.c`.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/secret_base.c`
 *
 * Subset porté : static `sCurSecretBaseId` + helpers SetCurSecretBaseId +
 * IsCurSecretBaseOwnedByAnotherPlayer + TrySetCurSecretBaseIndex. Le reste
 * (= EnterSecretBase task flow, decoration sprites, UI menus) demande
 * cascade lourde et reste U-tier.
 */

import { registerSpecial } from './script-opcodes';
import { VarGet, VarSet, gSpecialVar } from './script-vars';
import { gSaveBlock1Ptr } from './save-block-state';
import { SECRET_BASES_COUNT } from './decomp-data/include/constants/global-data';

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
 *      if (gSaveBlock1Ptr->secretBases[0].secretBaseId != sCurSecretBaseId)
 *          gSpecialVar_Result = TRUE;
 *      else
 *          gSpecialVar_Result = FALSE;
 *  }
 *  ```
 *  Compare base[0].id (= player's own base) vs sCurSecretBaseId (= base
 *  currently entering). Different = entering someone else's base. */
registerSpecial('IsCurSecretBaseOwnedByAnotherPlayer', () => {
  const ownId = gSaveBlock1Ptr.secretBases?.[0]?.secretBaseId ?? 0;
  gSpecialVar.Result = ownId !== sCurSecretBaseId ? 1 : 0;
});

/** 1:1 décomp `TrySetCurSecretBaseIndex` (secret_base.c:242-256) :
 *  ```c
 *  void TrySetCurSecretBaseIndex(void) {
 *      u16 i;
 *      gSpecialVar_Result = FALSE;
 *      for (i = 0; i < SECRET_BASES_COUNT; i++) {
 *          if (sCurSecretBaseId == gSaveBlock1Ptr->secretBases[i].secretBaseId) {
 *              gSpecialVar_Result = TRUE;
 *              VarSet(VAR_CURRENT_SECRET_BASE, i);
 *              break;
 *          }
 *      }
 *  }
 *  ```
 *  Find l'index dans secretBases[] qui matche sCurSecretBaseId. Set
 *  VAR_CURRENT_SECRET_BASE = i si trouvé. */
registerSpecial('TrySetCurSecretBaseIndex', () => {
  gSpecialVar.Result = 0;
  for (let i = 0; i < SECRET_BASES_COUNT; i++) {
    const baseId = gSaveBlock1Ptr.secretBases?.[i]?.secretBaseId ?? 0;
    if (sCurSecretBaseId === baseId) {
      gSpecialVar.Result = 1;
      VarSet('VAR_CURRENT_SECRET_BASE', i);
      break;
    }
  }
});

/** 1:1 décomp `SetCurSecretBaseId` (secret_base.c:237-240) — static helper
 *  appelé par les scripts via gSpecials (= setcursecretbase special).
 *  ```c
 *  static void SetCurSecretBaseId(void) {
 *      sCurSecretBaseId = gSpecialVar_0x8004;
 *  }
 *  ```
 *  Notre port : enregistré sous le special name `SetCurSecretBaseId`. */
registerSpecial('SetCurSecretBaseId', () => {
  sCurSecretBaseId = VarGet('VAR_0x8004') & 0xFF;
});

/** 1:1 décomp `IsSecretBaseRegistered` (secret_base.c:752-758) :
 *  ```c
 *  static bool8 IsSecretBaseRegistered(u8 secretBaseIdx) {
 *      if (gSaveBlock1Ptr->secretBases[secretBaseIdx].registryStatus) return TRUE;
 *      return FALSE;
 *  }
 *  ```
 *  Helper interne, exporté pour reuse par d'autres specials. */
function _isSecretBaseRegistered(idx: number): boolean {
  return !!gSaveBlock1Ptr.secretBases?.[idx]?.registryStatus;
}

/** 1:1 décomp `GetNumRegisteredSecretBases` (secret_base.c:868-879) :
 *  ```c
 *  static u8 GetNumRegisteredSecretBases(void) {
 *      s16 i; u8 count = 0;
 *      for (i = 1; i < SECRET_BASES_COUNT; i++) {
 *          if (IsSecretBaseRegistered(i) == TRUE) count++;
 *      }
 *      return count;
 *  }
 *  ```
 *  Loop i=1..SECRET_BASES_COUNT (= 1..20 exclu base[0] qui est player's). */
function _getNumRegisteredSecretBases(): number {
  let count = 0;
  for (let i = 1; i < SECRET_BASES_COUNT; i++) {
    if (_isSecretBaseRegistered(i)) count++;
  }
  return count;
}

/** 1:1 décomp `GetCurSecretBaseRegistrationValidity` (secret_base.c:881-889) :
 *  ```c
 *  void GetCurSecretBaseRegistrationValidity(void) {
 *      if (IsSecretBaseRegistered(VarGet(VAR_CURRENT_SECRET_BASE)) == TRUE)
 *          gSpecialVar_Result = 1;
 *      else if (GetNumRegisteredSecretBases() >= 10)
 *          gSpecialVar_Result = 2;
 *      else
 *          gSpecialVar_Result = 0;
 *  }
 *  ```
 *  Result : 1 = already registered, 2 = max 10 atteint, 0 = peut register. */
registerSpecial('GetCurSecretBaseRegistrationValidity', () => {
  const idx = VarGet('VAR_CURRENT_SECRET_BASE');
  if (_isSecretBaseRegistered(idx)) {
    gSpecialVar.Result = 1;
  } else if (_getNumRegisteredSecretBases() >= 10) {
    gSpecialVar.Result = 2;
  } else {
    gSpecialVar.Result = 0;
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
registerSpecial('PrepSecretBaseBattleFlags', () => {
  const bridge = (globalThis as { __battleStateMutators?: {
    setTrainerBattleOpponentA?: (v: number) => void;
    setBattleTypeFlags?: (v: number) => void;
  } }).__battleStateMutators;
  if (bridge?.setTrainerBattleOpponentA) bridge.setTrainerBattleOpponentA(0x400);
  if (bridge?.setBattleTypeFlags) bridge.setBattleTypeFlags(0x8 | 0x80000);
  // TryGainNewFanFromCounter : dette R3 (= cascade FANCOUNTER_BATTLED_AT_BASE
  // pas porté).
});
