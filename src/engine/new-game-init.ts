import { gSaveBlock1Ptr } from './save-block-state';
import { SetDynamicWarp, GetDynamicWarp } from './warp-system';
import { VarSet } from './script-vars';
import { RunScriptImmediately, ensureCommonScriptsLoaded } from './script-runtime';
import { NewGameInitPCItems } from './pc-items';

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
 * Audit session 126 LOT C10 : migré depuis `script-runner` (legacy) vers
 * `script-runtime` (= moderne, support compositional opcodes + waits +
 * goto_if_set qui respecte les flags réels au lieu de toujours skip).
 *
 * `RunScriptImmediately` accepte un label common scripts (= preload via
 * `ensureCommonScriptsLoaded`).
 */
export async function runNewGameInit(gender: 'MALE' | 'FEMALE'): Promise<void> {
  // Set VAR_RESULT au genre choisi pour les éventuels branch `goto_if_eq VAR_RESULT`
  VarSet('VAR_RESULT', gender === 'MALE' ? 0 : 1);

  // Audit session 126 C10 : preload common scripts pour que RunScriptImmediately
  // trouve `EventScript_ResetAllMapFlags` (= scripts/new_game.inc, dans common).
  await ensureCommonScriptsLoaded();

  // Reset des flags par défaut (cache tous les NPCs de début de jeu).
  // 1:1 décomp `EventScript_ResetAllMapFlags` (= setflag séries pour FLAG_HIDE_*).
  RunScriptImmediately('EventScript_ResetAllMapFlags');

  // 1:1 décomp `NewGameInitData` (new_game.c:149-207) ligne 187 :
  //   ClearBag(); NewGameInitPCItems();
  // ⇒ ajoute 1× POTION dans le PC du joueur (= sNewGamePCItems table).
  NewGameInitPCItems();

  // Spawn manuel dans le camion. Coords (1, 2) = côté ouest du camion 5×5,
  // le joueur marche vers l'est et déclenche le coord trigger à (3, 2).
  SetDynamicWarp('MAP_INSIDE_OF_TRUCK', 1, 2);

  // C2 fix : starter Treecko hardcodé RETIRÉ (= leak debug en démo normale).
  // 1:1 décomp : le starter est ajouté à la party UNIQUEMENT via
  // `LittlerootTown_ProfessorBirchsLab_EventScript_GiveStarterEvent`
  // (= givepokemon SPECIES_X, 5) après la séquence Birch run sur Route 101 et
  // l'event ChooseStarter. Si tu veux tester avec un Treecko en début de
  // session, utilise `?debug` (= preset complet via boot-mode.ts).

  console.log(`[new-game-init] init OK pour ${gender}`,
    'flags=', Object.keys(gSaveBlock1Ptr.flags).length,
    'dynamicWarp=', GetDynamicWarp(),
    'party=', gSaveBlock1Ptr.playerPartyCount);
}
