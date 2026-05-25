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
