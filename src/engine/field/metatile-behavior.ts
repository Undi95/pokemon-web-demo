/**
 * metatile-behavior.ts — RE-EXPORT transitoire du miroir 1:1
 * `src/game/metatile_behavior.ts` (= decomp/src/metatile_behavior.c).
 *
 * Migration miroir 2026-06-05 : la logique (140 prédicats) a été relocalisée dans
 * le miroir. Ce fichier reste un alias pour les importeurs existants — source
 * unique = le miroir. À terme : basculer les importeurs sur `@game/...` puis supprimer.
 */
export * from '../../game/metatile_behavior';
