/**
 * battle-hp-bar.ts — DÉPLACÉ dans le MIROIR `src/game/battle_interface.ts`
 * (consolidation battle_interface.c, phase C1, 2026-06-09).
 *
 * Ce fichier n'est plus qu'un RE-EXPORT de compatibilité pour les importeurs
 * existants (controllers, battle-healthbox-l, voie V). Le code (SetBattleBarStruct,
 * MoveBattleBar, CalcNewBarValue, CalcBarFilledPixels, GetScaledExpFraction,
 * GetHPBarLevel, battleBars, constantes) vit dans le miroir — ZÉRO dup.
 * Nouveaux imports : préférer `src/game/battle_interface`.
 */
export {
  B_HEALTHBAR_PIXELS, B_EXPBAR_PIXELS,
  HEALTH_BAR, EXP_BAR,
  HP_BAR_EMPTY, HP_BAR_RED, HP_BAR_YELLOW, HP_BAR_GREEN, HP_BAR_FULL,
  type BattleBarInfo, battleBars,
  SetBattleBarStruct, MoveBattleBar, setMoveBattleBarGraphicallyHook,
  CalcNewBarValue, CalcBarFilledPixels, GetScaledExpFraction, GetHPBarLevel,
} from '../../game/battle_interface';
