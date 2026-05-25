/**
 * script-opcodes-player-avatar.ts — opcodes player / object visibility 1:1 décomp
 * `field_player_avatar.c` + `event_object_movement.c`.
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:887-895`   (getplayerxy)
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:897-901`   (getpartysize)
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:2013-2017` (checkplayergender)
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1111-1130` (showobjectat / hideobjectat)
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1712-1731` (checkpartymove)
 *   `D:/Projet 1/decomps/pokeemeraude/src/field_player_avatar.c:1396` (SetPlayerInvisibility).
 *
 * `countpokemon` est un alias de `getpartysize` (= naming variant des scripts JSON).
 */

import { registerOpcode } from './script-runtime';
import { VarSet, gSpecialVar } from './script-vars';
import { gObjectEvents } from '../field/object-events';
import { gPlayerAvatar } from '../field/player-avatar';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { GetCurrentMap } from '../save/load_save';
import { getRuntime } from '../decomp-globals';
import { MALE_GENDER, FEMALE_GENDER } from './script-opcodes-helpers';

// 1:1 décomp `ScrCmd_checkplayergender` (scrcmd.c:2013-2017) :
//   gSpecialVar_Result = gSaveBlock2Ptr->playerGender.
// MALE=0, FEMALE=1 (= include/constants/global.h).
registerOpcode('checkplayergender', (_ctx, _args) => {
  gSpecialVar.Result = gPlayerAvatar.gender === 'MALE' ? MALE_GENDER : FEMALE_GENDER;
  return false;
});

// 1:1 décomp `ScrCmd_setobjectinvisibility` (scrcmd.c) avec localId not LOCALID_PLAYER :
//   SetObjectInvisibility(localId, ..., TRUE).
registerOpcode('hideobject', (_ctx, args) => {
  const localIdRaw = args[0] ?? '';
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) npc.invisible = true;
  return false;
});

// 1:1 décomp `ScrCmd_setobjectinvisibility` avec FALSE :
//   SetObjectInvisibility(localId, ..., FALSE).
registerOpcode('showobject', (_ctx, args) => {
  const localIdRaw = args[0] ?? '';
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) npc.invisible = false;
  return false;
});

// 1:1 décomp `SetPlayerInvisibility(TRUE)` (field_player_avatar.c:1396) via
// le mnémonique `hideplayer` (= SCR_OP_HIDEOBJECTAT avec LOCALID_PLAYER).
registerOpcode('hideplayer', (_ctx) => {
  const rt = getRuntime();
  if (rt && gPlayerAvatar.spriteId >= 0) {
    const s = rt.gSprites.get(gPlayerAvatar.spriteId);
    if (s) s.invisible = true;
  }
  return false;
});

/** 1:1 décomp `ScrCmd_showobjectat` via le mnémonique `showplayer`
 *  (= SCR_OP_SHOWOBJECTAT avec LOCALID_PLAYER) :
 *  `SetObjectInvisibility(localId, ..., FALSE)`. Miroir exact de `hideplayer`. */
registerOpcode('showplayer', (_ctx) => {
  const rt = getRuntime();
  if (rt && gPlayerAvatar.spriteId >= 0) {
    const s = rt.gSprites.get(gPlayerAvatar.spriteId);
    if (s) s.invisible = false;
  }
  return false;
});

// 1:1 décomp `ScrCmd_getplayerxy` (scrcmd.c:887-895) — read player current XY into
// provided var pointers. Used in scripts qui ont besoin de la position player
// (= e.g. Rusturf Tunnel cave-in cinematic).
registerOpcode('getplayerxy', (_ctx, args) => {
  const xVar = args[0] ?? '';
  const yVar = args[1] ?? '';
  if (xVar) VarSet(xVar, GetCurrentMap()?.x ?? 0);
  if (yVar) VarSet(yVar, GetCurrentMap()?.y ?? 0);
  return false;
});

// 1:1 décomp `ScrCmd_getpartysize` (scrcmd.c:897-901) — read partySize into VAR_RESULT.
registerOpcode('getpartysize', (_ctx) => {
  VarSet('VAR_RESULT', gSaveBlock1Ptr.playerPartyCount);
  return false;
});

// `countpokemon` alias de getpartysize (= naming variant des scripts JSON).
registerOpcode('countpokemon', (_ctx) => {
  VarSet('VAR_RESULT', gSaveBlock1Ptr.playerPartyCount);
  return false;
});

// 1:1 décomp `ScrCmd_checkpartymove` (scrcmd.c:1712-1731) :
//   for each mon in party, check if mon knows move → set VAR_RESULT = slot.
//   Si aucun mon ne connaît le move → VAR_RESULT = PARTY_SIZE (6).
// Notre port : VAR_RESULT = 0 (= MVP, move lookup à porter en session dédiée).
registerOpcode('checkpartymove', (_ctx, _args) => {
  VarSet('VAR_RESULT', 0);
  return false;
});
