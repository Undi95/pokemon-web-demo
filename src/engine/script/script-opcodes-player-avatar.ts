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
import { gPlayerParty, GetMonData, MonKnowsMove, MON_DATA_SPECIES, MON_DATA_IS_EGG } from '../battle/party-storage';
import { resolveDecompConstant } from '../system/decomp-constants';
import { gObjectEvents } from '../../game/event_object_movement';
import { gPlayerAvatar } from '../../game/field_player_avatar';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { GetCurrentMap } from '../save/load_save';
import { getRuntime } from '../system/decomp-globals';
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

// 1:1 STRICT décomp `SetPlayerInvisibility(TRUE)` (field_player_avatar.c:1396) via
// le mnémonique `hideplayer` (= SCR_OP_HIDEOBJECTAT avec LOCALID_PLAYER) :
//   gObjectEvents[gPlayerAvatar.objectEventId].invisible = TRUE;
// ⚠️ FIX : on set le SLOT object-event, PAS le sprite. Depuis l'unification M3, le sprite
// joueur appartient au slot et UpdateObjectEvents resync `slot.invisible → sprite.invisible`
// CHAQUE frame → cacher le sprite directement était écrasé au frame suivant. Symptôme :
// le joueur ne disparaissait PAS dans la porte lors de l'entrée auto scriptée (GoInsideWithMom
// → applymovement PlayerEnterHouse puis `hideplayer`). Identique au fix SetPlayerVisibility.
// Cohérent avec hideobject/showobject ci-dessus (qui set déjà npc.invisible sur le slot).
registerOpcode('hideplayer', (_ctx) => {
  const slot = gObjectEvents[gPlayerAvatar.objectEventId];
  if (slot) slot.invisible = true;
  return false;
});

/** 1:1 décomp `ScrCmd_showobjectat` via le mnémonique `showplayer`
 *  (= SCR_OP_SHOWOBJECTAT avec LOCALID_PLAYER) : SetPlayerInvisibility(FALSE).
 *  Miroir exact de `hideplayer` — set le SLOT (cf. note ci-dessus). */
registerOpcode('showplayer', (_ctx) => {
  const slot = gObjectEvents[gPlayerAvatar.objectEventId];
  if (slot) slot.invisible = false;
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

// 1:1 STRICT décomp `ScrCmd_checkpartymove` (scrcmd.c:1712-1731) :
//   gSpecialVar_Result = PARTY_SIZE;
//   for (i = 0; i < PARTY_SIZE; i++) {
//       species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES);
//       if (!species) break;
//       if (!GetMonData(&gPlayerParty[i], MON_DATA_IS_EGG) && MonKnowsMove(&gPlayerParty[i], move)) {
//           gSpecialVar_Result = i; gSpecialVar_0x8004 = species; break;
//       }
//   }
// Le move arg est une halfword (enum décomp 'MOVE_*' → id numérique). VAR_RESULT = slot du 1er mon
// (non-œuf) qui connaît le move, ou PARTY_SIZE si aucun. Utilisé par les scripts de field move
// (EventScript_UseSurf/Cut/Fly/Strength/RockSmash…) pour choisir le mon + gater l'usage.
registerOpcode('checkpartymove', (_ctx, args) => {
  const move = resolveDecompConstant(args[0] ?? 'MOVE_NONE') ?? 0;
  const PARTY_SIZE = 6;
  let result = PARTY_SIZE;
  let species0x8004 = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES);
    if (!species) break;  // slot vide → fin de party
    if (!GetMonData(gPlayerParty[i], MON_DATA_IS_EGG) && MonKnowsMove(gPlayerParty[i], move)) {
      result = i;
      species0x8004 = typeof species === 'number' ? species : 0;
      break;
    }
  }
  VarSet('VAR_RESULT', result);
  VarSet('VAR_0x8004', species0x8004);
  return false;
});
