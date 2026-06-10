/**
 * SHIM de compat — la machine gBattleMainFunc COMPLÈTE est CONSOLIDÉE
 * PHYSIQUEMENT dans `src/game/battle_main.ts` (C7, 2026-06-10 — fichier décomp
 * d'origine : battle_main.c). Re-export NOMMÉ. Importeur restant :
 * battle-controllers-init (+ pattern globalThis __battleMainFunctions posé par
 * la section dans battle_main). À déposer avec la voie V.
 */
export {
  setIntroSlideFlags, getIntroSlideFlags, getBattleMainFunc, setBattleMainFunc,
  setMainInBattle, getMainInBattle, setMainCallback1, getMainCallback1,
  setMainSavedCallback, getMainSavedCallback, setPreBattleCallback1,
  getPreBattleCallback1, setCB2AfterEvolution, getCB2AfterEvolution,
  RunBattleScriptCommands_PopCallbacksStack,
  BeginBattleIntroDummy, BeginBattleIntro, BattleStartClearSetData,
  BattleIntroGetMonsData, BattleIntroPrepareBackgroundSlide,
  BattleIntroDrawTrainersOrMonsSprites, BattleIntroDrawPartySummaryScreens,
  BattleIntroPrintTrainerWantsToBattle, BattleIntroPrintWildMonAttacked,
  BattleIntroPrintOpponentSendsOut, BattleIntroOpponent2SendsOutMonAnimation,
  BattleIntroOpponent1SendsOutMonAnimation, BattleIntroRecordMonsToDex,
  BattleIntroPrintPlayerSendsOut, BattleIntroPlayer2SendsOutMonAnimation,
  BattleIntroPlayer1SendsOutMonAnimation, TryDoEventsBeforeFirstTurn,
  HandleEndTurn_ContinueBattle, HandleEndTurn_BattleWon, HandleEndTurn_BattleLost,
  HandleEndTurn_RanFromBattle, HandleEndTurn_MonFled, HandleEndTurn_FinishBattle,
  FreeResetData_ReturnToOvOrDoEvolutions, TryEvolvePokemon,
  WaitForEvoSceneToFinish, ReturnFromBattleToOverworld,
} from '../../game/battle_main';
