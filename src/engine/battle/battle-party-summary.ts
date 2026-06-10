/**
 * battle-party-summary.ts — DÉPLACÉ dans le MIROIR `src/game/battle_interface.ts`
 * (consolidation battle_interface.c, phase C1, 2026-06-09).
 *
 * RE-EXPORT de compatibilité (controllers player/opponent). Le code
 * (CreatePartyStatusSummarySprites, Task_HidePartyStatusSummary, SpriteCB_*,
 * tables subsprites, gBattlerStatusSummaryTaskId) vit dans le miroir — ZÉRO dup.
 * Nouveaux imports : préférer `src/game/battle_interface`.
 */
export {
  HP_EMPTY_SLOT, type HpAndStatus, gBattlerStatusSummaryTaskId,
  CreatePartyStatusSummarySprites, Task_HidePartyStatusSummary,
  SetTaskFuncToHidePartyStatusSummary, ensurePartySummaryAssets,
} from '../../game/battle_interface';
