/**
 * SHIM de compat — la section turn-dispatch est CONSOLIDÉE PHYSIQUEMENT dans
 * `src/game/battle_main.ts` (C4, 2026-06-10 — fichier décomp d'origine :
 * battle_main.c:536-567 + :2645-2662 + :4906-4958). Re-export NOMMÉ.
 * Importeurs préservés : battle-decomp-loop, battle-flow,
 * battle-script-commands, handle-action. À déposer avec la voie V.
 */
export {
  CheckFocusPunch_ClearVarsBeforeTurnStarts, RunTurnActionsFunctions,
  TryCorrectShedinjaLanguage, GetBattleWindowTemplatePixelWidth,
} from '../../battle_main';
