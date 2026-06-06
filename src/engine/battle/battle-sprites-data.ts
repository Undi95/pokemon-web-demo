/**
 * battle-sprites-data.ts — Port 1:1 strict de `gBattleSpritesDataPtr`
 * (struct BattleSpriteData, battle.h / battle_main.c).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/include/battle.h`
 *   struct BattleSpriteData {
 *     struct BattleSpriteInfo *battlerData;        // [MAX_BATTLERS_COUNT]
 *     struct BattleHealthboxInfo *healthBoxesData; // [MAX_BATTLERS_COUNT]
 *     struct BattleAnimationInfo *animationData;
 *     struct BattleBarInfo *battleBars;
 *   };
 *   struct BattleHealthboxInfo { u8 ... animationState; u8 specialAnimActive:1; u8 statusAnimActive:1; ... };
 *   struct BattleSpriteInfo { ... behindSubstitute:1; ... };
 *
 * Ce module BACKE les champs lus par les controllers (Player/Opponent
 * HandleFaintAnimation, StatusAnimation, etc.) qui jusqu'ici lisaient un
 * `globalThis.__battleSpritesData` JAMAIS défini → les state machines
 * court-circuitaient (`_healthBoxAnimStateWired()===false`). En définissant
 * le backing, les state machines 1:1 TOURNENT (= faint slide/drop animé).
 *
 * 1:1 STRICT : pas de logique inventée — juste le storage des champs struct +
 * les accessseurs que les controllers appellent (mêmes noms/sémantique).
 * Champs non encore utilisés (animationData/battleBars) = absents (les hooks
 * optionnels restent no-op via optional chaining côté caller).
 */

import { MAX_BATTLERS_COUNT } from './state';

// ─── struct BattleHealthboxInfo (champs utilisés) ───────────────────────────
const _animationState: number[] = new Array(MAX_BATTLERS_COUNT).fill(0);
const _specialAnimActive: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);
const _statusAnimActive: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);

// ─── struct BattleSpriteInfo (champs utilisés) ──────────────────────────────
const _behindSubstitute: boolean[] = new Array(MAX_BATTLERS_COUNT).fill(false);

/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].animationState`. */
export function getHealthBoxAnimationState(battler: number): number {
  return _animationState[battler] ?? 0;
}
export function setHealthBoxAnimationState(battler: number, v: number): void {
  _animationState[battler] = v & 0xFF;
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].specialAnimActive`. */
export function isSpecialAnimActive(battler: number): boolean {
  return !!_specialAnimActive[battler];
}
export function setSpecialAnimActive(battler: number, v: boolean): void {
  _specialAnimActive[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->healthBoxesData[b].statusAnimActive`. */
export function isStatusAnimActive(battler: number): boolean {
  return !!_statusAnimActive[battler];
}
export function setStatusAnimActive(battler: number, v: boolean): void {
  _statusAnimActive[battler] = v;
}
/** 1:1 `gBattleSpritesDataPtr->battlerData[b].behindSubstitute`. */
export function isBehindSubstitute(battler: number): boolean {
  return !!_behindSubstitute[battler];
}
export function setBehindSubstitute(battler: number, v: boolean): void {
  _behindSubstitute[battler] = v;
}

/** Reset complet (= alloc fraîche de gBattleSpritesDataPtr à chaque combat,
 *  battle_main.c BattleStartClearSetData → AllocateBattleResources). */
export function resetBattleSpritesData(): void {
  _animationState.fill(0);
  _specialAnimActive.fill(false);
  _statusAnimActive.fill(false);
  _behindSubstitute.fill(false);
}

// ─── Enregistrement globalThis.__battleSpritesData (= surface lue par les
//     controllers via lazy lookup, pour éviter les cycles ESM). MERGE avec
//     tout backing existant (clearTemporarySpeciesSpriteData/gBattleControllerData
//     restent no-op si non définis ailleurs = optional chaining côté caller). ──
const _g = globalThis as Record<string, unknown>;
_g.__battleSpritesData = Object.assign(
  (_g.__battleSpritesData as Record<string, unknown> | undefined) ?? {},
  {
    getHealthBoxAnimationState, setHealthBoxAnimationState,
    isSpecialAnimActive, setSpecialAnimActive,
    isStatusAnimActive, setStatusAnimActive,
    isBehindSubstitute, setBehindSubstitute,
  },
);
