import { runScript, type ParsedScripts, type ScriptContext } from './script-runner';
import { gameState } from './game-state';

/**
 * Initialise une nouvelle partie en exécutant directement les vrais scripts
 * d'init du décomp, plutôt que de hardcoder la liste de flags/vars en TS.
 *
 * Pipeline :
 *   1. EventScript_ResetAllMapFlags  (data/scripts/new_game.inc)
 *      → set tous les FLAG_HIDE_* d'init (Birch caché, Dad caché, ...)
 *      → appelle EventScript_ResetAllBerries en cascade
 *   2. InsideOfTruck_EventScript_SetIntroFlags{Male|Female}
 *      → set VAR_LITTLEROOT_INTRO_STATE, flags spécifiques au genre,
 *        respawn point, dynamic warp, etc.
 *
 * Tous les opcodes non-state-altérants (setrespawn, setdynamicwarp, setberrytree)
 * tombent en no-op via le ScriptContext minimal — c'est OK car on ne joue pas
 * encore les baies / heal location.
 */
export async function runNewGameInit(allScripts: ParsedScripts, gender: 'MALE' | 'FEMALE') {
  // Set VAR_RESULT au genre choisi pour que le branch `goto_if_eq VAR_RESULT, MALE/FEMALE` matche
  gameState.setVar('VAR_RESULT', gender === 'MALE' ? 0 : 1);

  const ctx: ScriptContext = {
    showText: () => Promise.resolve(),
    faceNpcToPlayer: () => { },
    lockPlayer: () => { },
    releasePlayer: () => { },
  };

  // Reset des flags par défaut
  if (!allScripts?.scripts?.['EventScript_ResetAllMapFlags']) {
    console.error('[new-game-init] EventScript_ResetAllMapFlags introuvable dans le pool');
    return;
  }
  await runScript('EventScript_ResetAllMapFlags', allScripts, ctx);
  // Flags + vars du genre
  const setupName = gender === 'MALE'
    ? 'InsideOfTruck_EventScript_SetIntroFlagsMale'
    : 'InsideOfTruck_EventScript_SetIntroFlagsFemale';
  await runScript(setupName, allScripts, ctx);
  console.log(`[new-game-init] init OK pour ${gender}`,
    'flags=', Object.keys(gameState['data']?.flags ?? {}).length,
    'dynamicWarp=', gameState.dynamicWarp);
}
