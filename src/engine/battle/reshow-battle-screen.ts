/**
 * reshow-battle-screen.ts — DÉPLACÉ dans le MIROIR `src/game/reshow_battle_screen.ts`
 * (migration 1:1, 2026-06-09).
 *
 * RE-EXPORT de compatibilité (battle-controller-player fait un import() dynamique de
 * ce chemin pour l'exit party/sac). Le code vit dans le miroir — ZÉRO dup.
 * Nouveaux imports : préférer `src/game/reshow_battle_screen`.
 */
export {
  ReshowBattleScreenAfterMenu,
  ReshowBattleScreenDummy,
  CB2_SetUpReshowBattleScreenAfterMenu,
  CB2_SetUpReshowBattleScreenAfterMenu2,
} from '../../game/reshow_battle_screen';
