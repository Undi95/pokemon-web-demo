/**
 * battle-healthbox-l.ts — DÉPLACÉ dans le MIROIR `src/game/battle_interface.ts`
 * (consolidation battle_interface.c, phase C2, 2026-06-09).
 *
 * RE-EXPORT de compatibilité (reshow-battle-screen, controllers, decomp-loop…).
 * Le code (CreateBattlerHealthboxSprites, UpdateHealthboxAttribute,
 * SetHealthboxSpriteVisible/Invisible, InitBattlerHealthboxCoords,
 * StartHealthboxSlideIn, UpdateHpTextInHealthbox, MoveBattleBarGraphically,
 * gHealthboxSpriteIds + l'enregistrement __battleHealthbox) vit dans le miroir —
 * ZÉRO dup. Nouveaux imports : préférer `src/game/battle_interface`.
 */
export {
  gHealthboxSpriteIds,
  CreateBattlerHealthboxSprites,
  InitBattlerHealthboxCoords,
  SetHealthboxSpriteVisible,
  SetHealthboxSpriteInvisible,
  StartHealthboxSlideIn,
  UpdateHealthboxAttribute,
  UpdateHpTextInHealthbox,
  initBattlerHealthbox,
  ShowHealthboxOnSendOut,
  initAllHealthboxes,
  resetHealthboxL,
} from '../../game/battle_interface';
