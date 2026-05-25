/**
 * script-opcodes-contest.ts — opcodes contest 1:1 décomp `contest.c` +
 * `contest_painting.c`.
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1944-1970` :
 *     `ScrCmd_choosecontestmon`     : ChooseContestMon().
 *     `ScrCmd_startcontest`         : StartContest().
 *     `ScrCmd_showcontestresults`   : ShowContestResults().
 *     `ScrCmd_contestlinktransfer`  : ContestLinkTransfer().
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1468-1480` :
 *     `ScrCmd_showcontestpainting`  : SetContestWinnerForPainting + ShowContestPainting.
 *
 * Le système contest complet (= contest.c ~5000 lignes + contest_painting.c)
 * n'est pas porté. Les opcodes existent comme markers pour les scripts qui les
 * appellent (= map Verdanturf Contest Hall). À porter en session dédiée.
 */

import { registerOpcode } from './script-runtime';
import { parseValue } from './script-opcodes-helpers';

/** 1:1 décomp `ScrCmd_choosecontestmon` (scrcmd.c:1944-1950) :
 *    ChooseContestMon();  // ouvre le party menu en mode contest selection. */
registerOpcode('choosecontestmon', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_startcontest` (scrcmd.c:1952-1957) :
 *    StartContest();  // CB2 swap vers contest scene. */
registerOpcode('startcontest', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_showcontestresults` (scrcmd.c:1959-1964) :
 *    ShowContestResults();  // affichage des résultats du contest. */
registerOpcode('showcontestresults', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_contestlinktransfer` (scrcmd.c:1966-1971) :
 *    ContestLinkTransfer();  // multi-link contest transfer. */
registerOpcode('contestlinktransfer', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_showcontestpainting` (scrcmd.c:1468-1479) :
 *    SetContestWinnerForPainting(ScriptReadHalfword(ctx));
 *    ShowContestPainting();
 *  Affiche la peinture contest winner depuis gSaveBlock1Ptr.contestWinners[]. */
registerOpcode('showcontestpainting', (_ctx, args) => {
  const _contestWinnerId = parseValue(args[0] ?? '0');
  void _contestWinnerId;
  return false;
});
