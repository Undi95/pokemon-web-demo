/**
 * script-opcodes-mystery-event.ts — opcodes mystery event / wonder card 1:1 décomp
 * `mystery_event_script.c`.
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:296-302`   (setmysteryeventstatus)
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:2210-2225` (setmodernfatefulencounter)
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:2219-2227` (checkmodernfatefulencounter)
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:2227-2239` (trywondercardscript)
 *   `setworldmapflag` est RS-era nop1 (= retiré du décomp Em).
 */

import { registerOpcode } from './script-runtime';
import { VarGet, VarSet } from './script-vars';
import { gSaveBlock1Ptr } from '../save-block-state';
import { parseValue } from './script-opcodes-helpers';

/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */
function _vget(arg: string | undefined): number {
  return VarGet(arg ?? '0');
}

/** 1:1 décomp `ScrCmd_setmysteryeventstatus` (scrcmd.c:296-302) :
 *    SetMysteryEventScriptStatus(ScriptReadByte(ctx)). */
registerOpcode('setmysteryeventstatus', (_ctx, args) => {
  const status = parseValue(args[0] ?? '0');
  (globalThis as Record<string, unknown>).gMysteryEventScriptStatus = status;
  return false;
});

/** 1:1 décomp `ScrCmd_setmodernfatefulencounter` (scrcmd.c:2210-2217) :
 *    SetMonData(&gPlayerParty[idx], MON_DATA_MODERN_FATEFUL_ENCOUNTER, &TRUE). */
registerOpcode('setmodernfatefulencounter', (_ctx, args) => {
  const partyIndex = _vget(args[0]);
  const party = gSaveBlock1Ptr.playerParty as Array<{ modernFatefulEncounter?: boolean }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    party[partyIndex].modernFatefulEncounter = true;
  }
  return false;
});

/** 1:1 décomp `ScrCmd_checkmodernfatefulencounter` (scrcmd.c:2219-2225) :
 *    gSpecialVar_Result = GetMonData(&gPlayerParty[idx], MON_DATA_MODERN_FATEFUL_ENCOUNTER). */
registerOpcode('checkmodernfatefulencounter', (_ctx, args) => {
  const partyIndex = _vget(args[0]);
  const party = gSaveBlock1Ptr.playerParty as Array<{ modernFatefulEncounter?: boolean }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    VarSet('VAR_RESULT', party[partyIndex].modernFatefulEncounter ? 1 : 0);
  } else {
    VarSet('VAR_RESULT', 0);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_trywondercardscript` (scrcmd.c:2227-2239) : execute saved
 *  RAM script si valid. Notre port : Mystery Event / Wonder Card non implémenté
 *  → no-op safe (= condition jamais vraie, jamais branche). */
registerOpcode('trywondercardscript', (_ctx, _args) => {
  return false;
});

/** RS-era `setworldmapflag` — nop1 dans Em (= retiré du décomp). */
registerOpcode('setworldmapflag', (_ctx, _args) => false);
