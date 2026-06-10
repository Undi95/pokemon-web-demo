/**
 * battle-healthbox.ts — DÉPLACÉ dans le MIROIR `src/game/battle_interface.ts`
 * (consolidation battle_interface.c, phase C3, 2026-06-09).
 *
 * RE-EXPORT de compatibilité (voie V battle-flow, reshow, decomp-loop…). Le code
 * (primitives de rendu healthbox + assets + VRAM alloc) vit dans le miroir — ZÉRO
 * dup. Renommages miroir (noms décomp) aliasés ici pour les importeurs historiques :
 *   updateHealthboxLevel  → UpdateLvlInHealthbox
 *   updateHealthboxNick   → UpdateNickInHealthbox
 *   updateHealthboxStatus → UpdateStatusIconInHealthbox
 * Nouveaux imports : préférer `src/game/battle_interface`.
 */
export {
  resetHealthboxAllocation,
  BattleLoadAllHealthBoxesGfx,
  ensureHealthboxAssets,
  resetHealthboxAssetsCache,
  type HealthboxHandle,
  createBattlerHealthboxSprites,
  setHealthboxVisible,
  startHealthboxSlideIn,
  tickHealthboxSlideIn,
  stopHealthboxSlideIn,
  destroyHealthboxSprite,
  setHealthboxPriority,
  updateHealthboxHpBar,
  updateHealthboxExpBar,
  updateHealthboxHpDigits,
  drawBallCaughtIndicator,
  UpdateLvlInHealthbox as updateHealthboxLevel,
  UpdateNickInHealthbox as updateHealthboxNick,
  UpdateStatusIconInHealthbox as updateHealthboxStatus,
} from '../../game/battle_interface';
