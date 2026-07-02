/**
 * new-game-flags.ts — wrapper harness du seeding nouvelle partie.
 *
 * HISTORIQUE : ce module dupliquait à la main un sous-ensemble de
 * `NewGameInitData` (new_game.c) — array statique des 159 setflag de
 * `EventScript_ResetAllMapFlags`, ResetAllBerries généré, trainerId, argent,
 * PC items, tendances Poivressel. Le foyer miroir COMPLET existe désormais :
 * `src/new_game.ts` (`NewGameInitData`, ordre exact new_game.c:149-207), et
 * `EventScript_ResetAllMapFlags` tourne RÉELLEMENT dans la byte-VM
 * (RunScriptImmediately — l'image bytecode est chargée par le boot avant
 * decideBootMode). Les doublons harness ont été supprimés.
 *
 * `NewGameInit` reste le point d'entrée appelé par boot-mode.ts (3 sites).
 */

import { NewGameInitData } from '../../new_game';

/** Seeding complet d'une nouvelle partie = 1:1 `NewGameInitData` (new_game.c:149). */
export function NewGameInit(): void {
  NewGameInitData();
  console.log('[new-game-flags] NewGameInitData 1:1 exécutée (new_game.c:149-207)');
}
