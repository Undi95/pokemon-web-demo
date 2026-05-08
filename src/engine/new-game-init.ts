import { runScript, type ParsedScripts, type ScriptContext } from './script-runner';
import { gameState } from './game-state';

/**
 * Initialise une nouvelle partie en exécutant directement les vrais scripts
 * d'init du décomp, plutôt que de hardcoder la liste de flags/vars en TS.
 *
 * Pipeline (fidèle au flow décomp) :
 *   1. EventScript_ResetAllMapFlags  (data/scripts/new_game.inc)
 *      → set tous les FLAG_HIDE_* d'init (Birch caché, Dad caché, ...)
 *   2. Spawn dans MAP_INSIDE_OF_TRUCK avec VAR_LITTLEROOT_INTRO_STATE = 0.
 *      Le coord trigger à (3, 1/2/3) du camion exécutera ensuite
 *      `InsideOfTruck_EventScript_SetIntroFlags{Male|Female}` qui appelle
 *      `setdynamicwarp MAP_LITTLEROOT_TOWN, 3|12, 10` au moment où le joueur
 *      marche vers la sortie. C'est exactement ce que fait le vrai jeu.
 *
 * AVANT cette session on appelait directement SetIntroFlags*, ce qui skip
 * l'intro camion — fix de la dette session 12.
 */
export async function runNewGameInit(allScripts: ParsedScripts, gender: 'MALE' | 'FEMALE') {
  // Set VAR_RESULT au genre choisi pour les éventuels branch `goto_if_eq VAR_RESULT`
  gameState.setVar('VAR_RESULT', gender === 'MALE' ? 0 : 1);

  const ctx: ScriptContext = {
    showText: () => Promise.resolve(),
    faceNpcToPlayer: () => { },
    lockPlayer: () => { },
    releasePlayer: () => { },
  };

  // Reset des flags par défaut (cache tous les NPCs de début de jeu)
  if (!allScripts?.scripts?.['EventScript_ResetAllMapFlags']) {
    console.error('[new-game-init] EventScript_ResetAllMapFlags introuvable dans le pool');
    return;
  }
  await runScript('EventScript_ResetAllMapFlags', allScripts, ctx);

  // Spawn manuel dans le camion. Coords (1, 2) = côté ouest du camion 5×5,
  // le joueur marche vers l'est et déclenche le coord trigger à (3, 2).
  gameState.setDynamicWarp('MAP_INSIDE_OF_TRUCK', 1, 2);

  // [DEBUG] Donne un Treecko level 5 pour pouvoir tester les combats avant que
  // l'event Birch (donne le starter) soit fonctionnel. À virer quand A.3 est OK.
  try {
    const { createPokemonInstance } = await import('./pokemon');
    const starter = createPokemonInstance('SPECIES_TREECKO', 5);
    gameState.addToParty(starter);
  } catch (e) {
    console.warn('[new-game-init] starter debug failed', e);
  }

  console.log(`[new-game-init] init OK pour ${gender}`,
    'flags=', gameState.getAllFlagNames().length,
    'dynamicWarp=', gameState.dynamicWarp,
    'party=', gameState.partySize);
}
