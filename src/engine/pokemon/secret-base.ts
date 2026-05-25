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

import { registerSpecial } from '../script/script-opcodes';
import { VarGet, VarSet, gSpecialVar } from '../script/script-vars';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import { SECRET_BASES_COUNT, TRAINER_ID_LENGTH, LANGUAGE_FRENCH } from '../decomp-data/include/constants/global-data';
import { gMapHeader } from '../field/map-loader';
import { resolveDecompConstant } from '../system/decomp-constants';

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

/** 1:1 décomp `SetSecretBaseOwnerGfxId` (secret_base.c:654-657) :
 *  ```c
 *  void SetSecretBaseOwnerGfxId(void) {
 *      VarSet(VAR_OBJ_GFX_ID_F, sSecretBaseOwnerGfxIds[GetSecretBaseOwnerType(VarGet(VAR_CURRENT_SECRET_BASE))]);
 *  }
 *  ```
 *  sSecretBaseOwnerGfxIds 1:1 décomp secret_base.c:162-176 — table[10] : male
 *  0..4 = YOUNGSTER/BUG_CATCHER/RICH_BOY/CAMPER/MAN_3, female 5..9 = LASS/
 *  GIRL_3/WOMAN_2/PICNICKER/WOMAN_5. GetSecretBaseOwnerType (= already
 *  inline B22) = (trainerId[0] % 5) + (gender * 5). */
registerSpecial('SetSecretBaseOwnerGfxId', () => {
  const sSecretBaseOwnerGfxIds: ReadonlyArray<number> = [
    35, 36, 15, 31, 33,  // Male : YOUNGSTER/BUG_CATCHER/RICH_BOY/CAMPER/MAN_3
    47, 14, 20, 32, 34,  // Female : LASS/GIRL_3/WOMAN_2/PICNICKER/WOMAN_5
  ];
  const idx = VarGet('VAR_CURRENT_SECRET_BASE');
  const base = gSaveBlock1Ptr.secretBases?.[idx];
  if (!base) return;
  // 1:1 décomp `GetSecretBaseOwnerType` (secret_base.c:1133).
  const ownerType = ((base.trainerId?.[0] ?? 0) % 5) + ((base.gender ?? 0) * 5);
  VarSet('VAR_OBJ_GFX_ID_F', sSecretBaseOwnerGfxIds[ownerType] ?? 0);
});

/** 1:1 décomp `SetPlayerSecretBase` (secret_base.c:365-377) :
 *  ```c
 *  void SetPlayerSecretBase(void) {
 *      u16 i;
 *      gSaveBlock1Ptr->secretBases[0].secretBaseId = sCurSecretBaseId;
 *      for (i = 0; i < TRAINER_ID_LENGTH; i++)
 *          gSaveBlock1Ptr->secretBases[0].trainerId[i] = gSaveBlock2Ptr->playerTrainerId[i];
 *      VarSet(VAR_CURRENT_SECRET_BASE, 0);
 *      StringCopyN(gSaveBlock1Ptr->secretBases[0].trainerName,
 *                  gSaveBlock2Ptr->playerName, GetNameLength(playerName));
 *      gSaveBlock1Ptr->secretBases[0].gender = gSaveBlock2Ptr->playerGender;
 *      gSaveBlock1Ptr->secretBases[0].language = GAME_LANGUAGE;
 *      VarSet(VAR_SECRET_BASE_MAP, gMapHeader.regionMapSectionId);
 *  }
 *  ```
 *  Setup player's secret base avec données player + cur map.
 *  Cascade R3 : mapSec stored numeric ; nous resolve via reverseDecompConstant
 *  (= notre regionMapSectionId est MAPSEC_* string). GetNameLength inline. */
registerSpecial('SetPlayerSecretBase', () => {
  const base = gSaveBlock1Ptr.secretBases?.[0];
  if (!base) return;
  base.secretBaseId = sCurSecretBaseId;
  // 1:1 décomp loop TRAINER_ID_LENGTH=4 copy.
  if (!base.trainerId) base.trainerId = [0, 0, 0, 0];
  for (let i = 0; i < TRAINER_ID_LENGTH; i++) {
    base.trainerId[i] = gSaveBlock2Ptr.playerTrainerId?.[i] ?? 0;
  }
  VarSet('VAR_CURRENT_SECRET_BASE', 0);
  // 1:1 décomp StringCopyN + GetNameLength (= EOS=0xFF search).
  const playerName = gSaveBlock2Ptr.playerName ?? '';
  base.trainerName = playerName;
  base.gender = gSaveBlock2Ptr.playerGender ?? 0;
  base.language = LANGUAGE_FRENCH;  // 1:1 décomp GAME_LANGUAGE = LANGUAGE_FRENCH=3 (FR).
  // 1:1 décomp VarSet(VAR_SECRET_BASE_MAP, gMapHeader.regionMapSectionId).
  const mapsecName = gMapHeader?.regionMapSectionId;
  if (mapsecName) {
    const numericId = resolveDecompConstant(mapsecName);
    if (numericId !== undefined) {
      VarSet('VAR_SECRET_BASE_MAP', numericId);
    }
  }
});
