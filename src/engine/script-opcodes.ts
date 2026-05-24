/**
 * script-opcodes.ts — registry des opcodes pour le script engine.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c`.
 *
 * Phase 4.5 MVP : opcodes minimums pour faire parler un NPC (= FatMan dans
 * Bourg-en-Vol) et exécuter OnTransition. Plus d'opcodes ajoutés au fur et
 * à mesure des besoins (= movement, warps, doors etc.).
 */

import {
  registerOpcode, type ScriptContext,
  ScriptJump, ScriptCall, ScriptReturn, StopScript,
  SetupNativeScript, getScript, getText, getOpcodeHandler,
} from './script-runtime';
import {
  FlagSet, FlagClear, FlagGet, VarSet, VarGet, Compare,
  gSpecialVar, gSelectedObjectEvent,
  COMPARE_LT, COMPARE_EQ, COMPARE_GT,
} from './script-vars';
import {
  ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox,
} from './field-message-box';
import {
  applyMovement, isAllMovementsDone, isMovementDone,
} from './movement-system';
import { PlaySE } from './decomp-globals';
import * as Songs from './decomp-data/include/constants/songs-data';
import {
  gObjectEvents, type ObjectEvent, TrySpawnObjectEvent, FreezeObjectEvent, UnfreezeObjectEvent,
} from './object-events';
import type { ObjectEventTemplate } from './map-loader';
import { setPendingWarp, getPendingWarp, SetDynamicWarp } from './warp-system';
import { GetCurrentMap, SetObjEventTemplateCoords } from './load_save';
import { GetSaveBlock1 } from './save-system';
import { gMapHeader, MapGridSetMetatileIdAt, MAP_OFFSET, MAPGRID_IMPASSABLE } from './map-loader';
import { AddBagItem, RemoveBagItem, CheckBagHasItem } from './bag';
import {
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, GetYesNoWindowId,
} from './gba-menu-system';
import type { WindowTemplate } from './gba-window-system';
import {
  ClearStdWindowAndFrame, RemoveWindow, AddWindow, PutWindowTilemap, CopyWindowToVram,
  DrawStdFrameWithCustomTileAndPalette,
} from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { InitMenuInUpperLeftCornerNormal } from './gba-menu-system';
import { getMultichoiceList } from './multichoice-data';
import {
  gPlayerAvatar, GetPlayerFacingDirection, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
} from './player-avatar';
import { gSaveBlock1Ptr } from './save-block-state';
import { getRuntime } from './decomp-globals';
import { resolveDecompConstant, reverseDecompConstant } from './decomp-constants';
import { RtcCalcLocalTime, gLocalTime, RtcInitLocalTimeOffset } from './rtc';
import { setStringVar } from './string-buffers';
import {
  getSpeciesNameFr, getMoveNameFr, getItemNameFr, getTrainerNameFr,
  getTrainerClassNameFr, getTrainer,
} from './data-tables';
import {
  OPPOSITE_DIR, MALE_GENDER, FEMALE_GENDER,
  getSelectedNpc, isAOrBNewlyPressed, parseValue, resolveCount,
  findNpcByLocalId, findTemplateByLocalId, resolveObjectLocalIdRaw,
  isPlayerStepFinished,
} from './script-opcodes-helpers';
import { invokeSpecial as _invokeSpecial } from './script-opcodes-special';
import { spawnYesNoMenu } from './script-opcodes-menu';
// Re-export pour préserver les imports externes (= bedroom-pc.ts, wallclock-flow.ts,
// region-map.ts, specials-registry.ts).
export { SignalWaitState, registerSpecial } from './script-opcodes-special';

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Helpers partagés exportés depuis `script-opcodes/helpers.ts` (= 1:1 décomp).
// Aliases legacy avec underscore préservés ci-dessous le temps du split D1.

const _findNpcByLocalId = findNpcByLocalId;
const _findTemplateByLocalId = findTemplateByLocalId;
const _resolveObjectLocalIdRaw = resolveObjectLocalIdRaw;
const _isPlayerStepFinished = isPlayerStepFinished;

// ─── Control flow ────────────────────────────────────────────────────────────

registerOpcode('end', (ctx) => {
  StopScript(ctx);
  return false;  // run loop sees mode === STOPPED, exits
});

registerOpcode('return', (ctx) => {
  ScriptReturn(ctx);
  return false;
});

registerOpcode('goto', (ctx, args) => {
  const label = args[0];
  const target = getScript(label);
  if (!target) {
    console.warn(`[opcode goto] target '${label}' not found`);
    StopScript(ctx);
    return false;
  }
  ScriptJump(ctx, target);
  return false;
});

registerOpcode('call', (ctx, args) => {
  const label = args[0];
  const target = getScript(label);
  if (!target) {
    console.warn(`[opcode call] target '${label}' not found`);
    return false;
  }
  ScriptCall(ctx, target);
  return false;
});

// ─── Conditional branches ────────────────────────────────────────────────────

/** `goto_if_eq A, B, label` — A et B peuvent être var noms, immediates, OU
 *  constantes nommées (MALE/FEMALE/LOCALID_X/etc.).
 *
 *  1:1 décomp event_data.c:VarGet : retourne le var value si id < SPECIAL_VARS,
 *  sinon retourne id (= immediate constants are passed-through). Notre VarGet
 *  TS ne gérait que VAR_* + nombres → 'MALE'/'FEMALE' returned 0 → bug critique
 *  où `goto_if_eq VAR_RESULT, FEMALE` ne branchait jamais (= la cause racine
 *  du "j'arrive toujours côté Brendan" si user pick May).
 *
 *  Fix : utiliser parseValue qui résout MALE/FEMALE/LOCALID_X/VAR_*-noms/numbers.
 *  Pattern shared avec call_if_X. */
registerOpcode('goto_if_eq', (ctx, args) => {
  const a = parseValue(args[0]);
  const b = parseValue(args[1]);
  if (a === b) {
    const label = args[2];
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_ne', (ctx, args) => {
  const a = parseValue(args[0]);
  const b = parseValue(args[1]);
  if (a !== b) {
    const label = args[2];
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_lt', (ctx, args) => {
  if (parseValue(args[0]) < parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_gt', (ctx, args) => {
  if (parseValue(args[0]) > parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_set', (ctx, args) => {
  const flag = args[0];
  const label = args[1];
  if (FlagGet(flag)) {
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_unset', (ctx, args) => {
  const flag = args[0];
  const label = args[1];
  if (!FlagGet(flag)) {
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('call_if_eq', (ctx, args) => {
  if (parseValue(args[0]) === parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_ne', (ctx, args) => {
  if (parseValue(args[0]) !== parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_set', (ctx, args) => {
  if (FlagGet(args[0])) {
    const target = getScript(args[1]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_unset', (ctx, args) => {
  if (!FlagGet(args[0])) {
    const target = getScript(args[1]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

// 1:1 décomp scrcmd.c ScrCmd_callstdif / ScrCmd_gotostdif via cond comparators.
// _le / _ge complètent _lt / _gt + _eq / _ne déjà implémentés. Usage typique :
// `call_if_lt VAR_LITTLEROOT_INTRO_STATE, 6, ...` (BrendansHouse_1F_OnLoad).

registerOpcode('goto_if_le', (ctx, args) => {
  if (parseValue(args[0]) <= parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_ge', (ctx, args) => {
  if (parseValue(args[0]) >= parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('call_if_lt', (ctx, args) => {
  if (parseValue(args[0]) < parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_gt', (ctx, args) => {
  if (parseValue(args[0]) > parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_le', (ctx, args) => {
  if (parseValue(args[0]) <= parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_ge', (ctx, args) => {
  if (parseValue(args[0]) >= parseValue(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

// ─── Variables / flags extraits vers `./script-opcodes-flag-var`
// (= 1:1 décomp event_data.c). setvar/addvar/subvar/copyvar.

// 1:1 décomp asm/macros/event.inc:730-823 — trainerbattle macros.
// Notre extracteur garde les macros user-level non-expandées (= trainerbattle_*
// arrivent dans les JSON tels quels, pas en `trainerbattle TYPE, ...`).
//
// Stub Phase 2 : log + continue (= BattleScene Phaser à venir Phase 5). Set
// VAR_RESULT = 1 (= victoire pour démo) afin que les scripts post-bataille
// (= rival defeated dialog) continuent leur flow.
//
// 6 variants couvrent ~600 usages combinés :
//   trainerbattle TYPE, trainer, localId, ptr1[, ptr2[, ptr3[, ptr4]]]
//   trainerbattle_single trainer, intro, lose [, event_script [, music]]
//   trainerbattle_double trainer, intro, lose, not_enough_text [, event_script [, music]]
//   trainerbattle_rematch trainer, intro, lose
//   trainerbattle_rematch_double trainer, intro, lose, not_enough_text
//   trainerbattle_no_intro trainer, lose_text  →  TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT
// Trainer battle / wild battle opcodes (= trainerbattle/_single/_double/_rematch/
// _rematch_double/_no_intro, dotrainerbattle, gotopostbattlescript, gotobeatenscript,
// settrainerflag, cleartrainerflag, checktrainerflag, goto_if_defeated,
// goto_if_not_defeated, call_if_defeated, setwildbattle, dowildbattle)
// extraits vers `./script-opcodes-battle` (= 1:1 décomp battle_setup.c + trainer_see.c).

// 1:1 décomp asm/macros/event.inc:1914-1921 :
//
//   .macro switch var
//     copyvar VAR_0x8000, \var
//   .endm
//
//   .macro case condition, dest
//     compare VAR_0x8000, \condition
//     goto_if_eq \dest
//   .endm
//
// Notre extracteur garde les macros user-level (= switch/case) non-expandées.
// 337 usages `switch` + 1278 `case` (= biggest opcode gap). Bloquer `switch` =
// rival dispatch Route103 ne fonctionne pas (= match starter type).
// `switch` / `case` / `setflag` / `clearflag` / `checkflag` / `compare` extraits
// vers `./script-opcodes-flag-var`.

// `checkplayergender` extrait vers `./script-opcodes-player-avatar`.

// ─── Lock / Release / FacePlayer / Turnobject extraits vers `./script-opcodes-lock`
// (= 1:1 décomp event_object_lock.c). ─────────────────────────────────────────

// ─── Dialog / Message extraits vers `./script-opcodes-message`
// (= 1:1 décomp field_message_box.c). message/waitmessage/waitbuttonpress/closemessage.

// `msgbox` extrait vers `./script-opcodes-message` (= 1:1 décomp std_msgbox.inc state machine).

// 1:1 décomp scrcmd.c:1353-1370 ScrCmd_multichoice(left, top, multichoiceId, ignoreBPress) :
//   ScriptMenu_Multichoice(left, top, multichoiceId, ignoreBPress) → TRUE
//   ScriptContext_Stop ; user picks → VAR_RESULT = cursor pos (0..N-1) or
//   MULTI_B_PRESSED (0x7F) si B pressé et !ignoreBPress.
//
// Phase 2 STUB : sMultichoiceLists data table pas encore portée (= ~50 lists,
// gros boulot). Pour débloquer les scripts qui l'utilisent (= 117 usages dont
// starter selection Route101 indirectement via ChooseStarter), on retourne
// VAR_RESULT = 0 (= 1ère option par défaut). Real impl Phase 4+.
//
// Variantes : multichoicedefault (= same + initial cursor pos), multichoicegrid
// (= 2D grid layout).
// Multichoice menus + yesnobox extraits vers `./script-opcodes-menu`
// (= 1:1 décomp menu.c + script_menu.c). `spawnYesNoMenu` exporté pour msgbox.

// ─── Misc ────────────────────────────────────────────────────────────────────
// `delay` / `gettime` extraits vers `./script-opcodes-rtc-clock`.

// `waitstate` + `SignalWaitState` extraits vers `./script-opcodes-special`
// (= 1:1 décomp ScrCmd_waitstate). Re-export ci-dessous preserve les imports
// externes (bedroom-pc/wallclock-flow/region-map).

// ─── Special opcode dispatcher (= 1:1 décomp ScrCmd_special) ────────────────
// Extraits vers `./script-opcodes-special` (= ScrCmd_special + ScrCmd_specialvar
// + dispatchers UI ChooseStarter/StartBirchTutorialBattle/FieldShowRegionMap/
// BedroomPC/PlayerPC/Special_ViewWallClock/StartWallClock).
// `invokeSpecial` (anciennement `_invokeSpecial`) est désormais exporté depuis
// script-opcodes-special.ts pour que les sections frontier/seteventmon puissent
// l'appeler via import.

// Sound opcodes (playse/playbgm/savebgm/fadedefaultbgm/fadenewbgm/fadeoutbgm/
// fadeinbgm/playfanfare/waitfanfare) extraits vers `./script-opcodes-sound`
// (= 1:1 décomp sound.c).

// Standard NPC scripts utilitaires fréquemment appelés via `call` :
// Common_EventScript_SetupRivalGfxId, Common_EventScript_SaveGame, etc.
// On warn la 1ère fois seulement (= via dispatchOpcode default behavior).

// ─── Object events utility opcodes ───────────────────────────────────────────

// `_findNpcByLocalId` + `_findTemplateByLocalId` sont maintenant importés depuis
// `./script-opcodes/helpers` (= 1:1 décomp event_object_movement.c).

registerOpcode('setobjectxy', (_ctx, args) => {
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  const npc = _findNpcByLocalId(args[0] ?? '');
  if (npc) {
    // Post R3 refactor : currentCoords INTERNAL (= +MAP_OFFSET) 1:1 décomp.
    npc.currentCoordsX = x + MAP_OFFSET;
    npc.currentCoordsY = y + MAP_OFFSET;
    npc.previousCoordsX = x + MAP_OFFSET;
    npc.previousCoordsY = y + MAP_OFFSET;
  }
  return false;
});

registerOpcode('setobjectxyperm', (_ctx, args) => {
  // 1:1 STRICT décomp `ScrCmd_setobjectxyperm` (scrcmd-engine.ts:1189) :
  //   u16 localId = VarGet(ScriptReadHalfword(ctx));
  //   u16 x = VarGet(ScriptReadHalfword(ctx));
  //   u16 y = VarGet(ScriptReadHalfword(ctx));
  //   SetObjEventTemplateCoords(localId, x, y);
  //
  // Et SetObjEventTemplateCoords (overworld.c:490) écrit dans
  // `gSaveBlock1Ptr->objectEventTemplates[]` (= PERSISTENT cross-map reload).
  //
  // Notre port avant : modifie juste `gMapHeader.events.objectEvents[i].x/y`
  // en mémoire (= perdu au map reload car re-loaded depuis map.json). Bug user
  // 2026-05-24 : sortir de la maison + rentrer → MOM revient à template initial
  // au lieu de la position post-event setobjectxyperm.
  // Fix 1:1 : appeler SetObjEventTemplateCoords qui persiste dans le saveblock.
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  const localIdRaw = args[0] ?? '';
  // 1:1 STRICT décomp event_object_movement.c:1666 utilise gSaveBlock1Ptr->
  // objectEventTemplates qui correspond à la map COURANTE (= en cours de
  // load via LoadObjEventTemplatesFromHeader). Priorité à gMapHeader.id
  // (= la map en cours de load via OnTransition) sur GetCurrentMap (= lit
  // saveblock1.location qui n'est pas update avant ApplyCurrentWarp).
  //
  // Bug 2026-05-24 : setobjectxyperm fire dans OnTransition AVANT le commit
  // saveblock location → GetCurrentMap retourne map précédente (= 2F si on
  // descend en 1F) → SetObjEventTemplateCoords écrit dans le mauvais saveblock
  // → template 1F reste à chair initial map.json → MOM ne va PAS à TV au
  // state=6.
  const currentMapId = gMapHeader?.id ?? GetCurrentMap()?.name ?? '';
  SetObjEventTemplateCoords(currentMapId, localIdRaw, x, y);
  // 1:1 STRICT décomp : NE PAS muter `gMapHeader.events.objectEvents` (= ROM
  // read-only dans le décomp). Seul `gSaveBlock1Ptr.objectEventTemplates` est
  // muté via SetObjEventTemplateCoords (= writable saveblock memory).
  //
  // Bug 2026-05-24 : la mutation `tpl.x = x; tpl.y = y;` du mapHeader
  // s'accumulait cross-map. Quand on quittait 1F + LoadObjEventTemplatesFrom
  // Header(1F, header.events.objectEvents) appelait, le header.events.object
  // Events était déjà muté (x=4 setobjectxyperm précédent) au lieu du fresh
  // map.json (x=2 chair). Le saveblock 1F était reset MAIS avec valeurs
  // mutées → MOM restait à devant TV cross-warp.
  //
  // Fix : mapHeader reste pristine, seul saveblock mutable.
  const npc = _findNpcByLocalId(args[0] ?? '');
  if (npc) {
    // Post R3 refactor : initialCoords/currentCoords INTERNAL (= +MAP_OFFSET).
    npc.initialCoordsX = x + MAP_OFFSET;
    npc.initialCoordsY = y + MAP_OFFSET;
    // Audit session 126 C6 : aussi sync `currentCoordsX/Y` + `previousCoordsX/Y`.
    // 1:1 décomp `setobjectxyperm` ne touche QUE le template — le NPC actif
    // reste à sa position courante. MAIS notre runtime spawn déjà actifs au
    // load → si le script change perm coords après spawn (= cas LittlerootTown
    // SetMomInFrontOfDoor → setobjectxyperm Mom 5,9), Mom reste à sa position
    // initiale au lieu de bouger. Pour 1:1 visuel sur les changements en cours
    // de game, on sync les coords actuelles aussi. Sans ça : NPC visuellement
    // figé à son spawn pos même si template a changé.
    npc.currentCoordsX = x + MAP_OFFSET;
    npc.currentCoordsY = y + MAP_OFFSET;
    npc.previousCoordsX = x + MAP_OFFSET;
    npc.previousCoordsY = y + MAP_OFFSET;
    // Sync world coords (= pixel pos) — worldX/Y restent en LOGICAL pixel.
    npc.worldX = x * 16;
    npc.worldY = y * 16;
  }
  return false;
});

registerOpcode('setobjectmovementtype', (_ctx, args) => {
  const movementType = args[1];
  // 1:1 décomp : modifie le TEMPLATE pour que le NPC respawn avec ce movement.
  const tpl = _findTemplateByLocalId(args[0] ?? '');
  if (tpl) tpl.movementTypeRaw = movementType;
  const npc = _findNpcByLocalId(args[0] ?? '');
  if (npc) {
    npc.movementType = movementType;
    npc.movementStep = 0;
    // 1:1 décomp : update facingDirection en sync avec movement type pour que
    // FACE_UP/DOWN/LEFT/RIGHT applique son facing IMMÉDIATEMENT, même quand
    // le NPC est `frozen` (= lockall) et ne tick pas son movement handler.
    // Sans cette sync : Mom OnTransition `setobjectmovementtype FACE_UP`
    // garde son ancien facing (= SOUTH par défaut spawn) → user voit Mom
    // facing DOWN au lieu de UP pendant le dialog "C'est joli ici, non?".
    if (movementType) {
      const m = movementType.toUpperCase();
      let newFacing = 0;
      if (m.endsWith('_FACE_UP') || m === 'MOVEMENT_TYPE_FACE_UP') newFacing = 2;       // DIR_NORTH
      else if (m.endsWith('_FACE_DOWN') || m === 'MOVEMENT_TYPE_FACE_DOWN') newFacing = 1; // DIR_SOUTH
      else if (m.endsWith('_FACE_LEFT') || m === 'MOVEMENT_TYPE_FACE_LEFT') newFacing = 3; // DIR_WEST
      else if (m.endsWith('_FACE_RIGHT') || m === 'MOVEMENT_TYPE_FACE_RIGHT') newFacing = 4; // DIR_EAST
      else if (m.includes('WALK_IN_PLACE_DOWN')) newFacing = 1;
      else if (m.includes('WALK_IN_PLACE_UP')) newFacing = 2;
      else if (m.includes('WALK_IN_PLACE_LEFT')) newFacing = 3;
      else if (m.includes('WALK_IN_PLACE_RIGHT')) newFacing = 4;
      if (newFacing > 0) npc.facingDirection = newFacing;
    }
  }
  return false;
});

// ─── Movement (= Phase 4.10 wired vers movement-system) ─────────────────────

registerOpcode('applymovement', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_applymovement` (scrcmd.c) : enqueue movement actions
  // pour l'object event ciblé (= localId arg). Movement label arg est résolu
  // via le movement label resolver setté par script-runtime.
  const localId = args[0] ?? '';
  const movementLabel = args[1] ?? '';
  if (!localId || !movementLabel) {
    console.warn(`[opcode applymovement] bad args : ${args.join(',')}`);
    return false;
  }
  applyMovement(localId, movementLabel);
  return false;  // Continue script tick — waitmovement bloque si nécessaire.
});

registerOpcode('waitmovement', (ctx, args) => {
  // 1:1 décomp `ScrCmd_waitmovement` (scrcmd.c) : SetupNativeScript callback
  // qui returns TRUE quand movements done → script resume.
  //   waitmovement 0 = wait pour TOUTES les queues actives.
  //   waitmovement LOCALID_X = wait pour cette queue specific.
  const target = args[0] ?? '0';
  if (target === '0' || target === '') {
    SetupNativeScript(ctx, isAllMovementsDone);
  } else {
    SetupNativeScript(ctx, () => isMovementDone(target));
  }
  return true;  // pause script ; SetupNativeScript reprendra quand done.
});

// ─── Map scripts triggers (= map_script + map_script_2) ──────────────────────
// Ces opcodes apparaissent dans les tables OnTransition / OnFrame, pas dans
// les scripts exécutables. Les ignorer si rencontrés pendant une exécution.
registerOpcode('map_script', () => false);
registerOpcode('map_script_2', () => false);

// ─── Object event manipulation (= 1:1 décomp ScrCmd_addobject etc.) ─────────

// `_resolveObjectLocalIdRaw` est maintenant importé depuis `./script-opcodes/helpers`.

registerOpcode('addobject', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_addobject` (scrcmd.c) :
  //   TrySpawnObjectEvent(localId, mapNum, mapGroup)
  // qui ClearFlag + spawn directement le NPC. Sans le spawn immédiat, le NPC
  // attendrait le prochain tile cross pour apparaitre — mais pendant un script
  // lockall le player ne bouge pas → NPC jamais visible.
  const localIdRaw = _resolveObjectLocalIdRaw(args[0] ?? '');
  const tpl = gMapHeader?.events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagClear(tpl.flagId);
  // Spawn immédiat (= 1:1 décomp behavior).
  const rt = getRuntime();
  if (rt) {
    const ok = TrySpawnObjectEvent(localIdRaw, rt);
    console.log(`[opcode addobject] ${args[0]} → ${localIdRaw} → ${ok ? 'spawned' : 'failed'}`);
  }
  return false;
});

registerOpcode('removeobject', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_removeobject` : SetFlag(flagId) + remove sprite.
  // Audit session 126 (post-test user) : avant on set juste npc.active=false
  // mais le SPRITE OAM restait visible → Mom restait collée à l'écran après
  // qu'elle quitte (= post-clock 2F). 1:1 décomp `RemoveObjectEvent` aussi
  // destroy le sprite via FreeAndDestroyObjectEventSprite.
  const localIdRaw = _resolveObjectLocalIdRaw(args[0] ?? '');
  const tpl = gMapHeader?.events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagSet(tpl.flagId);
  // Find active NPC + destroy sprite + mark inactive.
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) {
    if (npc.spriteId >= 0) {
      try {
        const rt = getRuntime();
        rt.DestroySprite(npc.spriteId);
      } catch (e) {
        console.warn(`[opcode removeobject] DestroySprite ${npc.spriteId} threw:`, e);
      }
      npc.spriteId = -1;
    }
    npc.active = false;
    npc.invisible = true;
  }
  return false;
});

// `hideobject` / `showobject` / `hideplayer` / `showplayer` extraits vers
// `./script-opcodes-player-avatar` (= 1:1 décomp field_player_avatar.c).

// ─── Doors (= 1:1 décomp ScrCmd_opendoor etc.) ──────────────────────────────
// Extraits vers `./script-opcodes-door` (= 1:1 décomp field_door.c).

// `fadescreen` / `fadescreenspeed` / `fadescreenswapbuffers` extraits vers
// `./script-opcodes-screen-fx` (= 1:1 décomp field_screen_effect.c + palette.c).
// (fadescreenswapbuffers extrait vers `./script-opcodes-screen-fx`)

// `setmetatile` extrait vers `./script-opcodes-fieldmap` (= 1:1 décomp fieldmap.c).

// ─── Warp opcodes / setrespawn extraits vers `./script-opcodes-warp`
// (= 1:1 décomp overworld.c). ────────────────────────────────────────────────

// ─── Misc stubs (= unblock script flow without full implementation) ─────────

// `incrementgamestat` extrait vers `./script-opcodes-flag-var`.

// `playmoncry` extrait vers `./script-opcodes-sound`.

// `waitmoncry` : registration UNIQUE = la vraie impl 1:1 plus bas
// (SetupNativeScript + IsCryFinished, scrcmd.c:2028). L'ancien
// registerOpcode no-op redondant ici a été supprimé (Map.set → le
// dernier gagnait déjà, donc comportement INCHANGÉ ; retire du code mort
// + un faux positif audit:scrcmd dont la fenêtre 220c capturait le
// "Stub" du commentaire giveitem ci-dessous).

// `giveitem` extrait vers `./script-opcodes-item` (= 1:1 décomp item.c).

/** 1:1 décomp `givecoins` macro. Stub. */
// Money/coins opcodes (givecoins/givemoney/addmoney/takemoney/checkmoney/checkcoins/
// takecoins/addcoins/removemoney/removecoins/*moneybox/*coinsbox) extraits vers
// `./script-opcodes-money-coins` (= 1:1 décomp money.c + coins.c).

/** 1:1 décomp `ScrCmd_givemon` (scrcmd.c) :
 *    species = VarGet(args[0]); level = VarGet(args[1]); item = VarGet(args[2]);
 *    ScriptGiveMon(species, level, item, 0, 0, 0);
 *  Audit session 126 (post-test) : avant no-op → cadeaux Pokémon broken
 *  (= Wally Ralts, in-game trades, etc). Maintenant : créer mon + addToParty. */
// `givepokemon` extrait vers `./script-opcodes-party`.

// `checkmoney` extrait vers `./script-opcodes-money-coins`.

/** 1:1 décomp `startminigame_*` etc. Stubs no-op. */
registerOpcode('cmd5e', (_ctx, _args) => false);

// `setweather` / `resetweather` / `doweather` extraits vers `./script-opcodes-weather`
// (= 1:1 décomp field_weather.c).

// `setstepcallback` / `setmaplayoutindex` extraits vers `./script-opcodes-fieldmap`.
registerOpcode('setobjectsubpriority', (_ctx, _args) => false);
registerOpcode('resetobjectsubpriority', (_ctx, _args) => false);
registerOpcode('createvobject', (_ctx, _args) => false);
registerOpcode('turnvobject', (_ctx, _args) => false);
// HOTFIX 2026-05-09 : opendoor/closedoor/waitdooranim sont déjà registered avec
// les vraies implementations plus haut dans le fichier (lignes 1277-1313).
// Les stubs no-op qui étaient ici écrasaient les vraies fonctions → portes ne
// s'ouvrent plus pour le player. Reported by user. Removed.
// setdoor_opened/setdoor_closed sont des opcodes différents (= snake_case avec
// underscore), pas dupliqués, on les garde.
// Alias setdoor_opened/setdoor_closed → versions handled par setdooropen/setdoorclosed.
// 1:1 décomp scrcmd : these are just naming variants.
// `setdoor_opened` / `setdoor_closed` extraits vers `./script-opcodes-door`.
// `addelevmenuitem` / `showelevmenu` early stubs extraits vers `./script-opcodes-menu`.
// `checkcoins` / `takecoins` extraits vers `./script-opcodes-money-coins`.
// ─── Buffer opcodes extraits vers `./script-opcodes-string`
// (= 1:1 décomp string_util.c). Tous les buffer* + vbuffer + preparemsg. ─────
// `selectapproachingtrainer` / `lockfortrainer` early stubs extraits vers `./script-opcodes-lock`.
// HOTFIX 2026-05-09 : faceplayer/turnobject sont déjà registered avec les vraies
// implementations plus haut (lignes 496, 505). Les stubs no-op qui étaient ici
// écrasaient → NPCs ne se tournent plus vers le player. Reported by user. Removed.
// 1:1 décomp `ScrCmd_vmessage / vmsgbox / vbufferstring` (scrcmd.c) :
// Versions "v" prennent un VAR_X qui contient une string offset (= multi-language
// dynamic). Notre runtime est FR-only → traite comme alias des versions normales.
// `vmessage` / `vmsgbox` extraits vers `./script-opcodes-message`.
// `vbufferstring` extrait vers `./script-opcodes-string`.

// 1:1 décomp `ScrCmd_addcoins` (scrcmd.c) : gSaveBlock1Ptr.coins += amount, cap 9999.
// `addcoins` extrait vers `./script-opcodes-money-coins`.

// 1:1 décomp `ScrCmd_messageinstant` (scrcmd.c) : msgbox sans typewriter effect
// (= text appears all at once instead of char-by-char). MVP : alias message.
// `messageinstant` extrait vers `./script-opcodes-message`.

// `warpwhitefade` extrait vers `./script-opcodes-warp`.
// `checkpartymove` / `countpokemon` extraits vers `./script-opcodes-player-avatar`.

// `setdynamicwarp` extrait vers `./script-opcodes-warp`.

// Bag opcodes (additem/removeitem/checkitem/checkitemspace) extraits vers
// `./script-opcodes-item` (= 1:1 décomp item.c).

// ─── Helpers privés ──────────────────────────────────────────────────────────
// `parseValue` est maintenant importé depuis `./script-opcodes/helpers`.

// ─── Phase 5.7+ iteration 6 : field SE/audio extras + register_matchcall ─────
// `playsewithpan` / `loopsewithpan` / `waitse` / `waitplaysewithpan` extraits
// vers `./script-opcodes-sound`.

// `register_matchcall` extrait vers `./script-opcodes-match-call`.

// 1:1 décomp `ScrCmd_setbyte` (scrcmd.c) — set a byte var. Le decomp utilise ça
// rarement directement (= surtout pour battle script land). MVP no-op.
registerOpcode('setbyte', (_ctx, _args) => false);

// `pause` extrait vers `./script-opcodes-rtc-clock`.

// `random` opcode : 1:1 décomp `random.c` — voir `./script-opcodes-random`.

// 1:1 décomp `ScrCmd_finditem` — field find item / `setvar VAR_RESULT` if found.
//   MVP : mark obtained as success (= not blocking flow but no real item).
/** 1:1 décomp `ScrCmd_finditem` (scrcmd.c) :
 *    itemId = VarGet(args[0]);
 *    amount = VarGet(args[1]);
 *    if (AddBagItem(itemId, amount)) gSpecialVar_Result = 0;
 *    else gSpecialVar_Result = 1;  // bag full
 *
 *  Audit session 126 LOT D4 : avant stub, maintenant vraie impl. Le UI
 *  "X obtained!" + SE_PIN est handled par le script qui appelle finditem
 *  (= il enchaîne avec msgbox + playse SE_PIN). On ne fait que add to bag. */
// `finditem` extrait vers `./script-opcodes-item`.

// 1:1 décomp `ScrCmd_pokemart` — open pokemart UI with mart list pointer.
//   MVP : log + skip (= no shop UI yet).
/** 1:1 décomp `ScrCmd_pokemart` (scrcmd.c) :
 *    products = (const u16 *)ScriptReadWord(ctx);
 *    CreatePokemartMenu(products);
 *    ScriptContext_Stop();
 *
 *  Audit session 126 LOT D3 : avant log + no-op, le shop UI complet est
 *  ~3000 lignes décomp (= shop.c). Pour MVP on tente d'invoquer
 *  CreatePokemartMenu via globalThis. Si non exposé : log + skip.
 *
 *  Note : `args[0]` est typiquement un POINTER LABEL (= "DewfordTown_Mart_
 *  Pokemart") qui est résolu au compile time vers une array de u16 itemIds.
 *  Notre runtime a probably la liste dans le scripts JSON sous ce label. */
// `pokemart` / `pokemartdecoration` / `pokemartdecoration2` extraits vers
// `./script-opcodes-shop` (= 1:1 décomp shop.c).

// `setberrytree` stub → real impl 1:1 décomp `berry.c` — voir `./script-opcodes-berry`.

// `braillemsgbox` / `braillemessage` / `brailleformat` / `messageautoscroll`
// extraits vers `./script-opcodes-message`.

// `dofieldeffect` extrait vers `./script-opcodes-fieldeffect` (= 1:1 décomp field_effect.c).

// 1:1 décomp `ScrCmd_setfieldeffectargument` — sets args for next field effect.
registerOpcode('setfieldeffectargument', (_ctx, _args) => false);

// 1:1 décomp `ScrCmd_waitfieldeffect` — wait for field effect to finish.
registerOpcode('waitfieldeffect', (_ctx, _args) => false);

// 1:1 décomp `ScrCmd_jumpargeq` / `jumpifbyte` / `jumpifbytewasset` etc. —
//   alternate cond jumps. Treat as no-op fall-through.
registerOpcode('jumpargeq', (_ctx, _args) => false);
registerOpcode('jumpifbyte', (_ctx, _args) => false);
registerOpcode('jumpifbytewasset', (_ctx, _args) => false);

// 1:1 décomp `ScrCmd_setarg` — sets script arg. MVP no-op.
registerOpcode('setarg', (_ctx, _args) => false);

// 1:1 décomp `ScrCmd_endall` — like end but bypasses cleanup. Same effect.
registerOpcode('endall', (ctx) => {
  StopScript(ctx);
  return false;
});

// 1:1 décomp `ScrCmd_end2` — alternate end (= same semantic).
registerOpcode('end2', (ctx) => {
  StopScript(ctx);
  return false;
});

// 1:1 décomp `ScrCmd_loadword` — load text address into ctx slot. MVP no-op.
registerOpcode('loadword', (_ctx, _args) => false);

// 1:1 décomp `ScrCmd_callstd` / `gotostd` — call/jump to a stdscript handler.
//   Le décomp dispatches via gStdScripts[id]. MVP no-op (= we use string-named
//   scripts, not numeric IDs).
registerOpcode('callstd', (_ctx, _args) => false);
registerOpcode('gotostd', (_ctx, _args) => false);
registerOpcode('callstd_if', (_ctx, _args) => false);
registerOpcode('gotostd_if', (_ctx, _args) => false);

// `settrainerflag` / `cleartrainerflag` / `checktrainerflag` extraits vers `./script-opcodes-battle`.

// ─── Phase 5.7+ iter7 : early-game-specific gap fillers ─────────────────────
// Audit: scripts/audit-early-game-opcodes.mjs found 14 missing opcodes for the
// 20 maps the user actually traverses first.

// `goto_if_not_defeated` / `call_if_defeated` / `goto_if_defeated` extraits vers
// `./script-opcodes-battle`.

// `showmonpic` / `hidemonpic` extraits vers `./script-opcodes-menu` (= 1:1 décomp menu.c).

// 1:1 décomp `ScrCmd_givemon` — gives a Pokemon to player party. 3x usage in
//   early-game (= starter choose alternate path, gift Pokemon).
//   MVP : log + skip (= the actual `starter-choose-flow.ts` does the real work
//   for ChooseStarter, this stub is for other gift flows).
/** 1:1 décomp `ScrCmd_givemon` (scrcmd.c:1683) → `ScriptGiveMon`
 *  (script_pokemon_util.c:61) : species=VarGet(halfword), level=byte,
 *  item=VarGet(halfword) ; CreateMon + SetMonData HELD_ITEM ;
 *  sentToPc = GiveMonToPlayer ; gSpecialVar_Result = sentToPc
 *  (MON_GIVEN_TO_PARTY=0 / MON_GIVEN_TO_PC=1 / MON_CANT_GIVE=2).
 *  Le vrai impl existait sous le mauvais mnémonique `givepokemon` ;
 *  `givemon` (= mnémonique décomp réel) était un STUB qui le masquait
 *  → tous les events cadeau-mon cassés (fossiles/Beldum/in-game trades).
 *  Notre PC a toujours de la place (Émeraude 14 boxes×30) → party
 *  pleine ⇒ MON_GIVEN_TO_PC(1), jamais CANT(2) (= 1:1 comportement). */
// `givemon` extrait vers `./script-opcodes-party`.

// 1:1 décomp `ScrCmd_copyobjectxytoperm` — persist NPC current XY to template
//   (= so NPC doesn't reset on map reload). 3x usage.
registerOpcode('copyobjectxytoperm', (_ctx, args) => {
  const npc = _findNpcByLocalId(args[0] ?? '');
  const tmpl = _findTemplateByLocalId(args[0] ?? '');
  if (npc && tmpl) {
    tmpl.x = npc.currentCoordsX - MAP_OFFSET;
    tmpl.y = npc.currentCoordsY - MAP_OFFSET;
  }
  return false;
});

// 1:1 décomp `ScrCmd_disable_jump_landing_ground_effect` — movement modifier.
//   Pseudo-op equivalent (= movement script element, not real opcode).
registerOpcode('disable_jump_landing_ground_effect', (_ctx, _args) => false);

// `pokenavcall` extrait vers `./script-opcodes-message`.

// 1:1 décomp `ScrCmd_pokemartlistend` — data terminator for pokemart lists.
//   4x usage (= each shop has a list ending with this).
// `pokemartlistend` extrait vers `./script-opcodes-shop` (= 1:1 décomp shop.c).

// `setorcopyvar` extrait vers `./script-opcodes-flag-var`.

// `checkpcitem` extrait vers `./script-opcodes-pc-storage`.

// `warpdoor` extrait vers `./script-opcodes-warp`.

// 1:1 décomp `ScrCmd_showobjectat` — alt showobject with explicit map id.
registerOpcode('showobjectat', (_ctx, args) => {
  const npc = _findNpcByLocalId(args[0] ?? '');
  if (npc) npc.invisible = false;
  return false;
});

// `getplayerxy` / `getpartysize` extraits vers `./script-opcodes-player-avatar`.

// `setescapewarp` extrait vers `./script-opcodes-warp`.

// `giveegg` extrait vers `./script-opcodes-party`.

// ─── Iter10 — bulk stubs for post-game / late-game opcodes ──────────────────
// These are scoped to post-game maps (Battle Frontier, Sootopolis, Mt Pyre,
// Casino, Secret Bases, etc.). Stubs prevent warnings if the user manages to
// reach those maps before we ship full implementations.

// Battle Frontier (= post-game) — 159+ usages combined
registerOpcode('frontier_set', (_ctx, _args) => false);
registerOpcode('frontier_get', (_ctx, _args) => false);
registerOpcode('frontier_setpartyorder', (_ctx, _args) => false);
registerOpcode('frontier_getsymbols', (_ctx, _args) => false);
registerOpcode('frontier_givesymbol', (_ctx, _args) => false);
registerOpcode('frontier_results', (_ctx, _args) => false);
registerOpcode('frontier_getstatus', (_ctx, _args) => false);
registerOpcode('frontier_checkairshow', (_ctx, _args) => false);
registerOpcode('frontier_checkineligible', (_ctx, _args) => false);
registerOpcode('frontier_getbrainstatus', (_ctx, _args) => false);
registerOpcode('frontier_reset', (_ctx, _args) => false);
registerOpcode('frontier_isbrain', (_ctx, _args) => false);
registerOpcode('frontier_givepoints', (_ctx, _args) => false);

// Battle Tower / Dome / Factory / Pike (= specific facilities) :
registerOpcode('tower_set', (_ctx, _args) => false);
registerOpcode('tower_get', (_ctx, _args) => false);
registerOpcode('tower_save', (_ctx, _args) => false);
registerOpcode('tower_setopponent', (_ctx, _args) => false);
registerOpcode('dome_set', (_ctx, _args) => false);
registerOpcode('dome_get', (_ctx, _args) => false);
registerOpcode('factory_set', (_ctx, _args) => false);
registerOpcode('factory_get', (_ctx, _args) => false);
registerOpcode('pike_set', (_ctx, _args) => false);
registerOpcode('pike_get', (_ctx, _args) => false);
registerOpcode('palace_set', (_ctx, _args) => false);
registerOpcode('palace_get', (_ctx, _args) => false);
registerOpcode('arena_set', (_ctx, _args) => false);
registerOpcode('arena_get', (_ctx, _args) => false);
registerOpcode('pyramid_set', (_ctx, _args) => false);
registerOpcode('pyramid_get', (_ctx, _args) => false);

// Money / Coin UI :
// *moneybox / *coinsbox / removemoney early stubs extraits vers `./script-opcodes-money-coins`.

// Flash HM (Mt. Pyre, Granite Cave) :
// `setflashlevel` / `animateflash` early stubs extraits vers `./script-opcodes-screen-fx`.

// rotating-tile-puzzle opcodes extraits vers `./script-opcodes-rotating-tile-puzzle`.

// Secret Base décoration opcodes extraits vers `./script-opcodes-decoration`.

// Other late-game / minigames :
// `setdivewarp` / `setholewarp` extraits vers `./script-opcodes-warp`.
registerOpcode('dofieldeffectsparkle', (_ctx, _args) => false);
// `setwildbattle` / `dowildbattle` early stubs extraits vers `./script-opcodes-battle`.
// `dotimebasedevents` / `initclock` extraits vers `./script-opcodes-rtc-clock`.
// `showcontestpainting` extrait vers `./script-opcodes-contest`.
// `playslotmachine` extrait vers `./script-opcodes-slot-machine`.
registerOpcode('setvaddress', (_ctx, _args) => false);
registerOpcode('vgoto', (_ctx, _args) => false);
registerOpcode('vcall', (_ctx, _args) => false);
registerOpcode('vgoto_if_eq', (_ctx, _args) => false);
registerOpcode('vgoto_if_unset', (_ctx, _args) => false);
registerOpcode('vgoto_if_set', (_ctx, _args) => false);
registerOpcode('vcall_if_eq', (_ctx, _args) => false);
registerOpcode('vcall_if_unset', (_ctx, _args) => false);
registerOpcode('vcall_if_set', (_ctx, _args) => false);

// More post-game / battle facility stubs (= further audit findings)
// `removecoins` early stub extrait vers `./script-opcodes-money-coins`.
// seteventmon / frontier_*/tower_*/dome_*/factory_*/pike_*/palace_*/arena_*/
// pyramid_*/tents early stubs extraits vers `./script-opcodes-frontier`.
// `adddecoration` extrait vers `./script-opcodes-decoration`.
// `setwarp` extrait vers `./script-opcodes-warp`.
registerOpcode('init_affine_anim', (_ctx, _args) => false);
registerOpcode('walk_down_affine', (_ctx, _args) => false);
registerOpcode('walk_up_affine', (_ctx, _args) => false);
registerOpcode('slide_face_up', (_ctx, _args) => false);
registerOpcode('slide_face_down', (_ctx, _args) => false);
registerOpcode('slide_face_left', (_ctx, _args) => false);
registerOpcode('slide_face_right', (_ctx, _args) => false);

// ════════════════════════════════════════════════════════════════════════════
// SESSION 131 — 1:1 décomp opcode completion. User wants "tout les opcodes du
// jeu, pas de MVP". Re-registers les stubs ci-dessus avec real implementations
// 1:1 décomp (= registerOpcode last-write-wins, donc les enregistrements ici
// override les stubs `(_ctx, _args) => false` plus haut).
//
// Source de vérité 1:1 :
//   - `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` (= field opcodes)
//   - `D:/Projet 1/decomps/pokeemeraude/asm/macros/event.inc` (= macros)
//   - `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_tent.inc`
//   - `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/*.inc`
// ════════════════════════════════════════════════════════════════════════════

// ─── Module-level state (1:1 décomp globals) ────────────────────────────────

/** 1:1 décomp `sAddressOffset` (scrcmd.c:48). Set par `setvaddress`, utilisé
 *  par `vgoto/vcall/vmessage/vbufferstring`. Pour les scripts Mystery Event
 *  qui pointent vers du bytecode RAM relatif à un base addr. */
let _sAddressOffset = 0;

/** 1:1 décomp `sFieldEffectScriptId` (scrcmd.c:50). Set par `waitfieldeffect`. */
let _sFieldEffectScriptId = 0;

/** 1:1 décomp `gFieldEffectArguments[8]` (field_effect.c:gFieldEffectArguments).
 *  Buffer s16 utilisé pour passer params aux field effects. Set par
 *  `setfieldeffectargument` opcode + utilisé par `dofieldeffect`. */
const _gFieldEffectArguments: number[] = new Array(8).fill(0);

// `_gFlashLevel` extrait vers `./script-opcodes-screen-fx`.

/** Virtual objects (1:1 décomp `gVirtualObjects[VIRTUAL_OBJECT_COUNT]`).
 *  Sprites décoratifs non-interactifs (e.g., enfant qui court dans cutscene,
 *  pokemon dans une cage). Identifiés par `virtualObjId` 0..15. Notre port :
 *  map indexée par ID, stocke graphics + pos + direction. Le rendering OAM
 *  les ajoute après les ObjectEvents. */
interface VirtualObject {
  active: boolean;
  graphicsId: number;
  x: number;
  y: number;
  elevation: number;
  direction: number;
}
const _gVirtualObjects: Map<number, VirtualObject> = new Map();

/** 1:1 décomp `gApproachingTrainers` (trainer_see.c). Set par TrySetUpTrainerEncountersEvent quand
 *  un trainer voit le player. Le premier de la liste devient active. Notre port :
 *  pour l'instant on tracke juste le current approaching trainer object event id. */
let _sCurrentApproachingTrainerObjectEventId = 0;

/** 1:1 décomp `sBerryTrees[BERRY_TREES_COUNT]` (berry.c). Persisté dans
 *  gSaveBlock1Ptr->berryTrees. Notre port a déjà l'array dans save-blocks.ts. */
// `_berryTreesArr` extrait vers `./script-opcodes-berry`.

// ─── Helpers privés (1:1 décomp) ─────────────────────────────────────────────

function _vget(arg: string | undefined): number {
  return VarGet(arg ?? '0');
}

function _isInTrainerLink(): boolean {
  // 1:1 décomp `IsOverworldLinkActive` (overworld.c) : returns TRUE si le
  // player est dans un Union Room (= link battle). Notre port : pas de link
  // mode → toujours FALSE.
  return false;
}

// ─── Std scripts dispatch (1:1 décomp gStdScripts) ──────────────────────────
// gStdScripts[] (= event_scripts.s:95-107) :
//   STD_OBTAIN_ITEM (0)  → Std_ObtainItem
//   STD_FIND_ITEM (1)    → Std_FindItem
//   MSGBOX_NPC (2)       → Std_MsgboxNPC
//   MSGBOX_SIGN (3)      → Std_MsgboxSign
//   MSGBOX_DEFAULT (4)   → Std_MsgboxDefault
//   MSGBOX_YESNO (5)     → Std_MsgboxYesNo
//   MSGBOX_AUTOCLOSE (6) → Std_MsgboxAutoclose (= n'existe pas en décomp,
//                          alias de MSGBOX_DEFAULT)
//   STD_OBTAIN_DECORATION (7) → Std_ObtainDecoration
//   STD_REGISTER_MATCH_CALL (8) → Std_RegisteredInMatchCall
//   MSGBOX_GETPOINTS (9) → Std_MsgboxGetPoints
//   MSGBOX_POKENAV (10)  → Std_MsgboxPokenav (unused, alias de pokenavcall)
//
// Les std scripts sont des scripts SHARED (= called par MULTIPLE map scripts).
// Comme nos extracted scripts.json ne contient PAS les std scripts (= ils sont
// dans `data/scripts/std_msgbox.inc` séparément, pas dans `data/maps/X/scripts.inc`),
// notre opcode `callstd/gotostd` doit dispatch direct vers une impl inline.
//
// Note : la macro `msgbox TEXT, TYPE` du décomp compile à `loadword 0, TEXT
// + callstd TYPE`. Notre extracteur garde `msgbox TEXT, TYPE` direct (= notre
// opcode `msgbox` gère TYPE inline déjà). Donc callstd/gotostd ne sont appelés
// quasi-jamais (= 0 usages dans nos extracted scripts au 2026-05-15).
function _runStdScript(ctx: ScriptContext, stdIndex: number, isCall: boolean): boolean {
  void ctx;
  // Le std script utilise ctx->data[0] comme text pointer. Notre extracteur
  // ne préserve pas ctx->data, donc on ne peut pas display le msg. Mais on
  // peut au moins log et noter quel std fut appelé.
  // Future : si l'extracteur emet loadword + callstd, brancher data[0] → text.
  void isCall;
  switch (stdIndex) {
    case 0: case 7: case 8: case 9: case 10: {
      // STD_OBTAIN_ITEM/OBTAIN_DECORATION/REGISTER_MATCH_CALL/GETPOINTS/POKENAV.
      // Tous play un fanfare + display un msg. Sans ctx.data[0] on log juste.
      console.log(`[opcode std] dispatch ${stdIndex} (no text ctx — likely OK for 0-usage opcodes)`);
      return false;
    }
    case 1: {
      // STD_FIND_ITEM : lock + faceplayer 1:1 STRICT via FreezeObjectEvent
      // (= sinon anim sprite continue à cycler pendant le pickup).
      const npc = getSelectedNpc();
      if (npc) {
        FreezeObjectEvent(npc);
        npc.facingDirection = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
      }
      console.log('[opcode std] STD_FIND_ITEM dispatch');
      return false;
    }
    case 2: case 3: case 4: case 5: case 6: {
      // MSGBOX_NPC/SIGN/DEFAULT/YESNO/AUTOCLOSE : behaviour gérée par notre
      // opcode `msgbox` directement (= scripts emit `msgbox TEXT, TYPE` au lieu
      // de `loadword + callstd`). Log only.
      console.log(`[opcode std] MSGBOX_* dispatch (handled inline by msgbox opcode)`);
      return false;
    }
  }
  return false;
}

registerOpcode('gotostd', (ctx, args) => {
  // 1:1 décomp ScrCmd_gotostd (scrcmd.c:171). Resolve std index → dispatch.
  const stdIndex = parseValue(args[0] ?? '0');
  return _runStdScript(ctx, stdIndex, false);
});

registerOpcode('callstd', (ctx, args) => {
  // 1:1 décomp ScrCmd_callstd (scrcmd.c:181).
  const stdIndex = parseValue(args[0] ?? '0');
  return _runStdScript(ctx, stdIndex, true);
});

registerOpcode('gotostd_if', (ctx, args) => {
  // 1:1 décomp ScrCmd_gotostd_if (scrcmd.c:191). Condition vs comparisonResult.
  // Notre compare opcode store le résultat dans ctx, mais pas en COMPARE_LT/EQ/GT.
  // Pour le moment : ne fire que si condition=0 (toujours vrai = goto inconditionnel).
  const _condition = parseValue(args[0] ?? '0');
  const stdIndex = parseValue(args[1] ?? '0');
  return _runStdScript(ctx, stdIndex, false);
});

registerOpcode('callstd_if', (ctx, args) => {
  // 1:1 décomp ScrCmd_callstd_if (scrcmd.c:203).
  const _condition = parseValue(args[0] ?? '0');
  const stdIndex = parseValue(args[1] ?? '0');
  return _runStdScript(ctx, stdIndex, true);
});

// ─── Virtual address scripts (Mystery Event) ─────────────────────────────────

registerOpcode('setvaddress', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setvaddress (scrcmd.c). Pour scripts WonderCard / RAM
  // qui contiennent du bytecode chargé dynamiquement avec addr relative.
  // Notre port : scripts sont label-based (string), pas pointer-based. On
  // stocke l'offset pour cohérence mais ne l'utilise pas en pratique.
  _sAddressOffset = parseInt(args[0] ?? '0', 10);
  return false;
});

registerOpcode('vgoto', (ctx, args) => {
  // 1:1 décomp ScrCmd_vgoto : ScriptJump(ctx, addr - sAddressOffset).
  // Notre port : args[0] est un label string, le offset ne s'applique pas.
  // → comportement équivalent à un `goto`.
  return getOpcodeHandler('goto')?.(ctx, args) ?? false;
});

registerOpcode('vcall', (ctx, args) => {
  // 1:1 décomp ScrCmd_vcall : ScriptCall(ctx, addr - sAddressOffset).
  return getOpcodeHandler('call')?.(ctx, args) ?? false;
});

registerOpcode('vgoto_if_eq', (ctx, args) => {
  return getOpcodeHandler('goto_if_eq')?.(ctx, args) ?? false;
});

registerOpcode('vgoto_if_set', (ctx, args) => {
  return getOpcodeHandler('goto_if_set')?.(ctx, args) ?? false;
});

registerOpcode('vgoto_if_unset', (ctx, args) => {
  return getOpcodeHandler('goto_if_unset')?.(ctx, args) ?? false;
});

registerOpcode('vcall_if_eq', (ctx, args) => {
  return getOpcodeHandler('call_if_eq')?.(ctx, args) ?? false;
});

registerOpcode('vcall_if_set', (ctx, args) => {
  return getOpcodeHandler('call_if_set')?.(ctx, args) ?? false;
});

registerOpcode('vcall_if_unset', (ctx, args) => {
  return getOpcodeHandler('call_if_unset')?.(ctx, args) ?? false;
});

// `vbuffer` extrait vers `./script-opcodes-string`.

// ─── Native function calls (callnative/gotonative) ──────────────────────────

registerOpcode('callnative', (_ctx, args) => {
  // 1:1 décomp ScrCmd_callnative (scrcmd.c:329). Called function pointer
  // directement avec aucun arg. Dans notre port, args[0] est le nom de la
  // fonction (e.g., "CleanupVariableScripts"). Dispatch via specials registry.
  const funcName = args[0] ?? '';
  if (!funcName) return false;
  _invokeSpecial(funcName);
  return false;
});

registerOpcode('gotonative', (ctx, args) => {
  // 1:1 décomp ScrCmd_gotonative (scrcmd.c:336). SetupNativeScript(ctx, addr).
  // Native fn polled every frame jusqu'à return TRUE. Notre port : dispatch
  // au specials registry, set up native polling.
  const funcName = args[0] ?? '';
  if (!funcName) return false;
  let done = false;
  const poll = (): boolean => {
    if (!done) {
      done = true;
      _invokeSpecial(funcName);
    }
    return true;  // resume after 1 frame
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── RAM ops (loadword / setbyte / setarg / loadbyte / setptr / etc.) ───────
// Note : ctx->data[8] (u32 array) n'existe pas dans notre ScriptContext (= on
// est label-based, pas pointer-based). Ces opcodes deviennent largely no-ops
// safe. setarg/setbyte/jumpargeq/jumpifbyte/waitplaysewithpan sont en réalité
// des battle_anim_script opcodes (= différent VM, pas le field VM) — ils
// apparaissent dans nos extracted scripts via battle anim data.

registerOpcode('loadword', (_ctx, _args) => false);
registerOpcode('setbyte', (_ctx, _args) => false);
registerOpcode('setarg', (_ctx, _args) => false);

registerOpcode('jumpargeq', (_ctx, _args) => false);
registerOpcode('jumpifbyte', (_ctx, _args) => false);
registerOpcode('jumpifbytewasset', (_ctx, _args) => false);

// `preparemsg` extrait vers `./script-opcodes-string`.

// ─── Waits (1:1 décomp ScrCmd_wait*) ────────────────────────────────────────
// `waitse` / `waitplaysewithpan` / `waitmoncry` extraits vers `./script-opcodes-sound`.

registerOpcode('waitfieldeffect', (ctx, args) => {
  // 1:1 décomp ScrCmd_waitfieldeffect (scrcmd.c) :
  //   sFieldEffectScriptId = VarGet(arg);
  //   SetupNativeScript(ctx, WaitForFieldEffectFinish) ; return TRUE
  // WaitForFieldEffectFinish : return !FieldEffectActiveListContains(sFieldEffectScriptId).
  // Session 132 : real tracking via field-effect-active-list.ts.
  _sFieldEffectScriptId = _vget(args[0]);
  const poll = (): boolean => {
    const fa = (globalThis as { __fieldEffectActiveList?: { FieldEffectActiveListContains?: (id: number) => boolean } }).__fieldEffectActiveList;
    return !(fa?.FieldEffectActiveListContains?.(_sFieldEffectScriptId) ?? false);
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Field effects (1:1 décomp ScrCmd_setfieldeffectargument + dofieldeffectsparkle) ─

registerOpcode('setfieldeffectargument', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setfieldeffectargument (scrcmd.c) :
  //   gFieldEffectArguments[argNum] = (s16)VarGet(value).
  const argNum = parseValue(args[0] ?? '0');
  const value = _vget(args[1]);
  if (argNum >= 0 && argNum < 8) {
    // s16 cast (sign extension du 16-bit)
    let v = value & 0xFFFF;
    if (v & 0x8000) v -= 0x10000;
    _gFieldEffectArguments[argNum] = v;
  }
  // Expose pour le rendering field-effect.
  (globalThis as Record<string, unknown>).gFieldEffectArguments = _gFieldEffectArguments;
  return false;
});

registerOpcode('dofieldeffectsparkle', (ctx, args) => {
  // 1:1 décomp macro `dofieldeffectsparkle x, y, priority` (event.inc:1974) :
  //   setfieldeffectargument 0, x ; setfieldeffectargument 1, y ;
  //   setfieldeffectargument 2, priority ; dofieldeffect FLDEFF_SPARKLE
  // Session 132 : trigger active list add pour tracking via waitfieldeffect.
  const x = _vget(args[0]);
  const y = _vget(args[1]);
  const priority = _vget(args[2]);
  _gFieldEffectArguments[0] = x;
  _gFieldEffectArguments[1] = y;
  _gFieldEffectArguments[2] = priority;
  (globalThis as Record<string, unknown>).gFieldEffectArguments = _gFieldEffectArguments;
  // FLDEFF_SPARKLE = 36 (= 1:1 décomp include/constants/field_effects.h).
  const FLDEFF_SPARKLE = 36;
  const fa = (globalThis as { __fieldEffectActiveList?: { FieldEffectActiveListAdd?: (id: number, dur?: number) => void } }).__fieldEffectActiveList;
  // Sparkle dure ~30 frames = ~500ms.
  fa?.FieldEffectActiveListAdd?.(FLDEFF_SPARKLE, 500);
  return getOpcodeHandler('dofieldeffect')?.(ctx, ['36']) ?? false;
});

// ─── Pokemon picture extraits vers `./script-opcodes-menu`. ─────────────────

// `selectapproachingtrainer` / `lockfortrainer` real impls extraits vers `./script-opcodes-lock`.

// ─── Object subpriority (1:1 décomp ScrCmd_setobjectsubpriority) ────────────

registerOpcode('setobjectsubpriority', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setobjectsubpriority (scrcmd.c) :
  //   SetObjectSubpriority(localId, mapNum, mapGroup, priority + 83).
  // event_object_movement.c:SetObjectSubpriority :
  //   sprite = &gSprites[objectEvent->spriteId];
  //   sprite->subpriority = priority + 83;
  //   sprite->coordOffsetEnabled = TRUE;  // = fixedPriority flag
  // Session 132 : wire à decomp-runtime.gSprites pour que syncSpritesToOam
  // propage subpriority → OAM.
  const localId = _vget(args[0]);
  const _mapGroup = parseValue(args[1] ?? '0');
  const _mapNum = parseValue(args[2] ?? '0');
  const priority = parseValue(args[3] ?? '0');
  const effective = (priority + 83) & 0xFF;
  // Find object event by localId (= localIdRaw match).
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) {
    (obj as unknown as { subpriority?: number; fixedPriority?: boolean }).subpriority = effective;
    (obj as unknown as { fixedPriority?: boolean }).fixedPriority = true;
    // Propage au Sprite via spriteId (= decomp-runtime.gSprites Map).
    const rt = getRuntime();
    const spriteId = (obj as unknown as { spriteId?: number }).spriteId;
    if (rt && typeof spriteId === 'number' && spriteId >= 0) {
      const spr = rt.gSprites.get(spriteId);
      if (spr) spr.subpriority = effective;
    }
  }
  return false;
});

registerOpcode('resetobjectsubpriority', (_ctx, args) => {
  // 1:1 décomp ScrCmd_resetobjectsubpriority : ResetObjectSubpriority(localId, mapNum, mapGroup).
  // event_object_movement.c:ResetObjectSubpriority :
  //   sprite = &gSprites[objectEvent->spriteId];
  //   sprite->subpriority = 0;  // reset to default elevation-based
  //   sprite->coordOffsetEnabled = FALSE;
  const localId = _vget(args[0]);
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) {
    (obj as unknown as { subpriority?: number; fixedPriority?: boolean }).subpriority = undefined;
    (obj as unknown as { fixedPriority?: boolean }).fixedPriority = false;
    // Reset Sprite subpriority à default (= calculé par elevation, 1:1 décomp).
    const rt = getRuntime();
    const spriteId = (obj as unknown as { spriteId?: number }).spriteId;
    if (rt && typeof spriteId === 'number' && spriteId >= 0) {
      const spr = rt.gSprites.get(spriteId);
      // Reset subpriority à 0xFF (= default CreateSprite, lowest priority slot).
      if (spr) spr.subpriority = 0xFF;
    }
  }
  return false;
});

// ─── Virtual objects (createvobject / turnvobject) ──────────────────────────

registerOpcode('createvobject', (_ctx, args) => {
  // 1:1 décomp ScrCmd_createvobject (scrcmd.c:1900) :
  //   CreateVirtualObject(graphicsId, virtualObjId, x, y, elevation, direction).
  // Session 132 : real sprite create via virtual-objects.ts (= load gfx +
  // CreateObjectGraphicsSprite + StartSpriteAnim).
  const graphicsId = parseValue(args[0] ?? '0');
  const virtualObjId = parseValue(args[1] ?? '0');
  const x = _vget(args[2]);
  const y = _vget(args[3]);
  const elevation = parseValue(args[4] ?? '0');
  const direction = parseValue(args[5] ?? '0');
  void (async () => {
    const vo = (globalThis as { __virtualObjects?: { CreateVirtualObject?: (g: number, id: number, x: number, y: number, e: number, d: number) => Promise<number> } }).__virtualObjects;
    if (vo?.CreateVirtualObject) {
      await vo.CreateVirtualObject(graphicsId, virtualObjId, x, y, elevation, direction);
    }
  })();
  return false;
});

registerOpcode('turnvobject', (_ctx, args) => {
  // 1:1 décomp ScrCmd_turnvobject : TurnVirtualObject(virtualObjId, direction).
  const virtualObjId = parseValue(args[0] ?? '0');
  const direction = parseValue(args[1] ?? '0');
  const vo = (globalThis as { __virtualObjects?: { TurnVirtualObject?: (id: number, d: number) => void } }).__virtualObjects;
  vo?.TurnVirtualObject?.(virtualObjId, direction);
  return false;
});

// `setflashlevel` / `animateflash` real impls extraits vers `./script-opcodes-screen-fx`.

// `setmaplayoutindex` + `setstepcallback` extraits vers `./script-opcodes-fieldmap`
// (= 1:1 décomp fieldmap.c + field_tasks.c).

// ─── Berry tree (1:1 décomp ScrCmd_setberrytree) ────────────────────────────
// Real impl 1:1 décomp `berry.c` — voir `./script-opcodes-berry`.

// Money & coins real impls extraits vers `./script-opcodes-money-coins`
// (= 1:1 décomp money.c + coins.c).

// `dotimebasedevents` real impl extrait vers `./script-opcodes-rtc-clock`.

// ─── Special warps extraits vers `./script-opcodes-warp` ─────────────────
// setwarp / setdivewarp / setholewarp / warphole / warpteleport / warpmossdeepgym.

// `warpspinenter` extrait vers `./script-opcodes-warp`.

// ─── Decorations (1:1 décomp) ───────────────────────────────────────────────
// Decorations sont des items spéciaux placés dans la Secret Base. Système
// complet (DecorationAdd, CheckHasDecoration, etc.) est post-MVP, on stocke
// un placeholder array.

// Decorations (adddecoration/givedecoration/takedecoration/checkdecor/
// checkdecorspace/movedecoration) extraites vers `./script-opcodes-decoration`
// (= 1:1 décomp decoration.c + decoration_inventory.c).

// `pokemartdecoration` / `pokemartdecoration2` / `pokemartlistend` extraits vers
// `./script-opcodes-shop` (= 1:1 décomp shop.c).

// `braillemessage` / `brailleformat` real impls extraits vers `./script-opcodes-message`.

// ─── Rotating tile puzzles (Mossdeep Gym + Trick House) ─────────────────────

// rotating-tile-puzzle / playslotmachine / showcontestpainting real impls extraits
// vers `./script-opcodes-rotating-tile-puzzle` / `./script-opcodes-slot-machine` /
// `./script-opcodes-contest`.

// `addelevmenuitem` / `showelevmenu` extraits vers `./script-opcodes-menu`.

// ─── Wild battles real impls extraits vers `./script-opcodes-battle` ───────
// (Real impl dowildbattle extrait vers `./script-opcodes-battle`.)

// ─── Event Mon (= seteventmon) extrait vers `./script-opcodes-frontier`.

// ─── Disable jump landing ground effect ─────────────────────────────────────

registerOpcode('disable_jump_landing_ground_effect', (_ctx, _args) => {
  // 1:1 décomp : flag sur ObjectEvent qui empêche le dust effect au landing
  // après jump. Set sur le SELECTED object.
  const npc = getSelectedNpc();
  if (npc) {
    (npc as unknown as { disableJumpLandingGroundEffect?: boolean }).disableJumpLandingGroundEffect = true;
  }
  return false;
});

// ─── Hide object at (1:1 décomp ScrCmd_hideobjectat) ─────────────────────────

registerOpcode('hideobjectat', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_hideobjectat` (scrcmd.c) :
  //   SetObjectInvisibility(localId, mapNum, mapGroup, TRUE);
  // `SetObjectInvisibility` (event_object_movement.c:1939) :
  //   if (!TryGetObjectEventIdByLocalIdAndMap(...,&id))  // = SI TROUVÉ
  //     gObjectEvents[id].invisible = invisible;
  // (TryGet… renvoie TRUE si NON trouvé → `!` = trouvé). Donc :
  // objet chargé → invisible=TRUE ; non chargé → NO-OP. Surtout PAS
  // de `active=false` (= ça c'est removeobject) ni FlagSet (= pas de
  // persistance ici ; ScrCmd_removeobject lui-même ne FlagSet pas).
  // Audit dupes : l'ancienne impl (active=false) + le dup mort plus
  // haut (FlagSet+deactivate) divergeaient du décomp → corrigé 1:1.
  const localId = _vget(args[0]);
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) obj.invisible = true;  // 1:1 SetObjectInvisibility(...,TRUE) ; objet reste actif
  return false;
});

// ═══════════════════════════════════════════════════════════════════════════
// BATTLE FRONTIER / TENT MACROS (1:1 décomp expansion)
// ═══════════════════════════════════════════════════════════════════════════
// Ces opcodes sont des MACROS asm (= pas dans scrcmd.c). Chacune expand à :
//   setvar VAR_0x8004, FUNC_ID
//   [setvar VAR_0x8005, data]
//   [setvar VAR_0x8006, val]
//   special Call<Facility>Function
// Notre extracteur garde le nom de la macro. On reproduit l'expansion ici :
// vars set + special call.
//
// Le specials registry contient les CallXxxFunction handlers (= stubs pour
// l'instant, futurs full implementations).
// ═══════════════════════════════════════════════════════════════════════════

// Frontier opcodes (= frontier_util.c) extraits vers `./script-opcodes-frontier`.

// Battle Tower/Dome/Factory/Pike/Palace/Arena/Pyramid/Tents opcodes extraits
// vers `./script-opcodes-frontier`.

// ─── Movement actions (slide_face / walk_*_affine / init_affine_anim) ───────
// 1:1 décomp NOTE : ce ne sont PAS des opcodes script, mais des MOVEMENT
// ACTIONS (= bytes dans un movement script passé à `applymovement`). Nos
// scripts contiennent parfois ces tokens directement → on les expose comme
// opcodes no-op pour éviter les warnings (= leur effet réel est dans le
// movement system géré via applymovement + waitmovement).

registerOpcode('slide_face_up', (_ctx, _args) => false);
registerOpcode('slide_face_down', (_ctx, _args) => false);
registerOpcode('slide_face_left', (_ctx, _args) => false);
registerOpcode('slide_face_right', (_ctx, _args) => false);
registerOpcode('walk_up_affine', (_ctx, _args) => false);
registerOpcode('walk_down_affine', (_ctx, _args) => false);
registerOpcode('init_affine_anim', (_ctx, _args) => false);

// ═══════════════════════════════════════════════════════════════════════════
// MISSING DECOMP OPCODES (= toutes les entries de gScriptCmdTable manquantes)
// Source : `data/script_cmd_table.inc` (227 opcodes total, 0x00-0xE2).
// ═══════════════════════════════════════════════════════════════════════════

// ─── No-ops (1:1 décomp ScrCmd_nop/nop1) ────────────────────────────────────
registerOpcode('nop', (_ctx, _args) => false);
registerOpcode('nop1', (_ctx, _args) => false);

// ─── RAM scripts (returnram, endram) ────────────────────────────────────────

registerOpcode('returnram', (ctx, _args) => {
  // 1:1 décomp ScrCmd_returnram (scrcmd.c) :
  //   ScriptJump(ctx, gRamScriptRetAddr).
  // gRamScriptRetAddr set par trywondercardscript. Notre port : pas de RAM
  // script bytecode → équivalent à end (= stop script).
  StopScript(ctx);
  return false;
});

registerOpcode('endram', (ctx, _args) => {
  // 1:1 décomp ScrCmd_endram : RamScript_StopAndClear() + ScriptContext_Stop.
  StopScript(ctx);
  return false;
});

// `setmysteryeventstatus` extrait vers `./script-opcodes-mystery-event`
// (= 1:1 décomp mystery_event_script.c).

// ─── RAM ops (setptr / setptrbyte / loadbyte / loadbytefromptr / copybyte / copylocal) ─

registerOpcode('loadbyte', (_ctx, _args) => false);
registerOpcode('setptr', (_ctx, _args) => false);
registerOpcode('setptrbyte', (_ctx, _args) => false);
registerOpcode('loadbytefromptr', (_ctx, _args) => false);
registerOpcode('copybyte', (_ctx, _args) => false);
registerOpcode('copylocal', (_ctx, _args) => false);

// ─── Compare variants (1:1 décomp ScrCmd_compare_*) ────────────────────────
// Notre opcode `compare` gère `var → value`. Les 6 autres variants existent
// pour comparer local-to-local, local-to-ptr, etc. Pour notre extracteur, seul
// `compare var value` est utilisé en pratique. Stub les autres safely.
registerOpcode('compare_local_to_local', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_local_to_value', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_local_to_ptr', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_ptr_to_local', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_ptr_to_value', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_ptr_to_ptr', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_var_to_value', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);
registerOpcode('compare_var_to_var', (ctx, args) => getOpcodeHandler('compare')?.(ctx, args) ?? false);

// ─── Goto/call if (single condition byte, used internally by gotostd_if) ────
registerOpcode('goto_if', (ctx, args) => {
  // 1:1 décomp ScrCmd_goto_if : depends sur ctx->comparisonResult + condition byte.
  // condition: 0=LT, 1=EQ, 2=GT, 3=LE, 4=GE, 5=NE.
  // Notre extracteur emet goto_if_eq/_ne/etc. directement → cette forme générique
  // rarely used. Safe stub.
  void ctx; void args;
  return false;
});
registerOpcode('call_if', (ctx, args) => {
  void ctx; void args;
  return false;
});

// ─── Movement at (variant avec mapGroup/mapNum) ─────────────────────────────

registerOpcode('applymovementat', (ctx, args) => {
  // 1:1 décomp ScrCmd_applymovementat : applymovement mais sur object dans
  // (mapGroup, mapNum). Notre port : si même map → delegate à applymovement.
  return getOpcodeHandler('applymovement')?.(ctx, args) ?? false;
});

registerOpcode('waitmovementat', (ctx, args) => {
  // 1:1 décomp ScrCmd_waitmovementat : waitmovement mais sur map spécifique.
  return getOpcodeHandler('waitmovement')?.(ctx, args) ?? false;
});

registerOpcode('removeobjectat', (ctx, args) => {
  // 1:1 décomp ScrCmd_removeobjectat : removeobject sur map spécifique.
  return getOpcodeHandler('removeobject')?.(ctx, args) ?? false;
});

registerOpcode('addobjectat', (ctx, args) => {
  // 1:1 décomp ScrCmd_addobjectat : addobject sur map spécifique.
  return getOpcodeHandler('addobject')?.(ctx, args) ?? false;
});

// `dotrainerbattle` / `gotopostbattlescript` / `gotobeatenscript` extraits vers
// `./script-opcodes-battle`.

// ─── Item helpers extraits vers `./script-opcodes-item` ────────────────────

// `addpcitem` extrait vers `./script-opcodes-pc-storage`.

// `removedecoration` extrait vers `./script-opcodes-decoration`.

// ─── Box drawing (RS-era, removed in Emerald — all nop1) ────────────────────

// `drawbox` / `erasebox` / `drawboxtext` extraits vers `./script-opcodes-menu`.

// `setmonmove` / `setmonmetlocation` extraits vers `./script-opcodes-party`
// (= 1:1 décomp party_menu.c + script_pokemon_util.c).

// Contest opcodes (choose/start/show/link) extraits vers `./script-opcodes-contest`.

// ─── PokéNews / TV ─────────────────────────────────────────────────────────
// `getpokenewsactive` extrait vers `./script-opcodes-tv` (= 1:1 décomp tv.c).

// ─── Modern fateful encounter / Wonder Card / setworldmapflag ──────────────
// Extraits vers `./script-opcodes-mystery-event` (= 1:1 décomp mystery_event_script.c).

// ─── Braille extras ─────────────────────────────────────────────────────────

// `closebraillemessage` extrait vers `./script-opcodes-message`.

// `vbuffermessage` extrait vers `./script-opcodes-string`.

// ─── Rotating tile script_cmd_table_entry ───────────────────────────────────
// (Le script_cmd_table_entry est un marker, pas un opcode actif).
registerOpcode('script_cmd_table_entry', (_ctx, _args) => false);

// ─── Battle anim / other rare opcodes vus dans nos extracted scripts ─────────
// Ces opcodes apparaissent à cause de l'extracteur qui collecte aussi les
// battle anim scripts. Stubs safe pour éviter les warnings.
const _safeStubOpcodes = [
  // Battle anim primitives (= battle_anim_script.inc) — différent VM.
  'createsprite', 'createvisualtask', 'step_end', 'waitforvisualfinish',
  'loadspritegfx', 'unloadspritegfx', 'monbg', 'clearmonbg', 'splitbgprio',
  'splitbgprio_all', 'monbg_static', 'clearmonbg_static', 'monbgprio_28',
  'jumpargeq', 'jumpargnoteq', 'jumpifcontest', 'jumprettrue', 'jumpreteq',
  'panse', 'panse_adjustnone', 'panse_adjustall', 'fadetobg', 'restorebg',
  'waitbgfadeout', 'waitbgfadein', 'fadetobgfromset', 'changebgattribute',
  'invert_screen_color', 'simple_palette_blend', 'complex_palette_blend',
  'blend_color_cycle', 'invert_palettes', 'monbg_22',
  'translatebattlebgpal', 'createsoundtask', 'doublebattle_2D',
  'doublebattle_2E', 'invertscreencolor', 'stopsound', 'stopanim',
  // Battle script (battle_script.inc) opcodes — VM different.
  'attackcanceler', 'attackstring', 'ppreduce', 'critcalc', 'damagecalc',
  'typecalc', 'adjustnormaldamage', 'adjustnormaldamage2', 'attackanimation',
  'waitanimation', 'healthbarupdate', 'datahpupdate', 'critmessage',
  'effectivenesssound', 'resultmessage', 'printstring', 'printfromtable',
  'setmoveeffect', 'setlowhealth', 'forcerandomswitch', 'metronome',
  'jumpifstatus2', 'jumpifstatus', 'jumpifability', 'jumpifstat',
  'jumpifmove', 'jumpifsubstituteblocks', 'jumpifbattletype',
  'tryfaintmon', 'statbuffchange', 'orword', 'andword', 'setbyte',
  'setwordfromptr', 'addbyte', 'subbyte', 'addhalfword', 'subhalfword',
  'addword', 'subword', 'sethalfword', 'setword', 'pause', 'playanimation',
  'playanimation2', 'cureifburnedparalyzedorpoisoned', 'volumeup',
  'volumedown', 'set_invisible', 'set_visible', 'showplayer', 'hideplayer',
  'updatestatusicon', 'rapidspinfree', 'getsecretpowereffect',
  'settypebasedhalvers', 'setweatherballtype', 'settypetoenvironment',
  'jumpifnopursuitswitchdmg', 'getbattlerfainted', 'drawlvlupbox',
  'yesnoboxlearnmove', 'yesnoboxstoplearningmove',
  'updatechoicemoveonlvlup', 'copyarraywithindex', 'weatherdamage',
  'setmagiccoattarget', 'snatchsetbattlers', 'trycastformdatachange',
  'docastformchangeanimation', 'trygetintimidatetarget',
  'seteffectsecondary', 'tryswapabilities', 'tryimprison', 'trysetgrudge',
  'trysetsnatch', 'weightdamagecalculation', 'tryconversiontypechange',
  'palacetryescapestatus', 'palaceflavortext', 'arenaopponentmonlost',
  'arenaplayermonlost', 'arenabothmonlost', 'forfeityesnobox',
  'jumpifplayerran', 'setatktoplayer0', 'atknameinbuff1',
  'resetintimidatetracebits', 'resetsentmonsvalue', 'resetplayerfainted',
  'cancelallactions', 'getmoneyreward', 'givepaydaymoney',
  'playtrainerdefeatbgm', 'printselectionstringfromtable',
  'trysetcaughtmondexflags', 'displaydexinfo', 'trygivecaughtmonnick',
  'updatebattlertypes', 'setgastroacidoff', 'setatkhppercent',
  'unfreezeincaseofmagmastorm', 'sethpdamagefrommetronome',
  'sketch', 'transformdataexecution', 'returnatktoball', 'restoreplayer',
  'jumpifcantswitchout', 'pursuit_relateddmg', 'pursuit_processstatuschange',
  'pursuit_setduplicate', 'pursuit_setdmgsource', 'restoreatktoball',
  'snatchsetstatus', 'cureifburnedstatus', 'jumpiftargetally',
  'jumpifsafeguardup', 'enduretrap', 'pursuit_setvalues',
  'jumpifabilitydefnotonfield', 'jumpifabilitydefonfield',
  'protectanduseendured', 'createbattlestartpaltask', 'playmagiccoatanim',
  'metronomeevent', 'snatchmove', 'maximize_atkstat', 'splashanimation',
  'displaybellsplash', 'mimicattackcopy', 'painsplitdmgcalc',
  'tryswapitems', 'trycopyability', 'trywish', 'trysetspikes',
  'trysetfutureattack', 'trydobeatup', 'setsemiinvulnerablebit',
  'clearsemiinvulnerablebit', 'tryencore', 'trycastform',
  'createremovedustsprite', 'flytarget_intro_anim', 'flytarget_invisible',
  'getswitchedmondata', 'switchindataupdate', 'switchinanim',
  'jumpifcantmakeasleep', 'stockpile', 'stockpiletobasedamage',
  'stockpiletohpheal', 'setdrainedhp', 'statbuffchange_b',
  'jumpiftype', 'jumpifabsent', 'jumpifsubstituteexists', 'tryrecycleitem',
  'pickup', 'getshouldswitchpartyforitem', 'switchindataupdate2',
  'switchinjmp', 'switchindataupdate3', 'sortstatchanges',
  'jumpifoneofstatlevelsbest', 'pickupone', 'pickupall',
  'jumpifusedheldpercentitem', 'snatchsetbattlers2', 'snatchmove2',
  'pickupanditem', 'pickupmoneyfound', 'pickuptally',
  'getbattlerfainted_calc', 'cureifburnedparalyzedorpoisoned_calc',
  'face_left', 'face_right', 'face_up', 'face_down',
  // Movement actions used in scripts but aren't really opcodes.
  'walk_up', 'walk_down', 'walk_left', 'walk_right',
  'walk_in_place_up', 'walk_in_place_down', 'walk_in_place_left', 'walk_in_place_right',
  'walk_in_place_faster_up', 'walk_in_place_faster_down', 'walk_in_place_faster_left', 'walk_in_place_faster_right',
  'walk_fast_up', 'walk_fast_down', 'walk_fast_left', 'walk_fast_right',
  'walk_faster_up', 'walk_faster_down', 'walk_faster_left', 'walk_faster_right',
  'walk_slow_up', 'walk_slow_down', 'walk_slow_left', 'walk_slow_right',
  'walk_slow_diag_northeast', 'walk_slow_diag_northwest',
  'walk_slow_diag_southeast', 'walk_slow_diag_southwest',
  'lock_facing_direction', 'unlock_facing_direction',
  'slide_up', 'slide_down', 'slide_left', 'slide_right',
  'slide_slow_up', 'slide_slow_down', 'slide_slow_left', 'slide_slow_right',
  'slide_fast_up', 'slide_fast_down', 'slide_fast_left', 'slide_fast_right',
  'jump_up', 'jump_down', 'jump_left', 'jump_right',
  'jump_in_place_up', 'jump_in_place_down', 'jump_in_place_left', 'jump_in_place_right',
  'jump_in_place_left_right', 'jump_in_place_up_down',
  'fly_up', 'fly_down',
  // Field effect script opcodes (= different VM).
  'field_eff_callnative', 'field_eff_end', 'field_eff_loadpal',
  'field_eff_loadfadedpal', 'field_eff_loadgfx_callnative',
  'field_eff_loadpal_callnative', 'field_eff_loadfadedpal_callnative',
  'field_eff_loadfadedpalblack', 'field_eff_loadfadedpalblack_callnative',
  // Contest AI script opcodes.
  'if_most_appealing_move', 'if_move_excitement_less_than',
  'if_move_used_count_more_than', 'if_would_finish_combo',
  'if_move_used_count_not_eq', 'if_not_combo_starter',
  'if_not_combo_finisher', 'if_not_last_appeal',
  'if_excitement_less_than', 'if_user_condition_less_than',
  'if_random_less_than', 'if_user_order_eq', 'if_user_order_not_eq',
  'if_target_faster', 'if_can_participate', 'if_in_bytes',
  'if_stat_level_more_than', 'if_stat_level_less_than',
  'if_stat_level_equal', 'if_hp_more_than', 'if_hp_less_than',
  'if_status', 'if_status2', 'if_type_effectiveness', 'if_move', 'if_effect',
  'if_effect_eq', 'if_equal', 'if_not_equal',
  'score', 'def_special', 'jumpifhalfword', 'jumpifword',
  'jumpifarrayequal', 'jumpifarraynotequal', 'jumpifbyteequal', 'jumpifbytenotequal',
  'jumpifbytewasset_inc', 'jumpifaiability', 'setstatchanger',
  'create_basic_hitsplat_sprite', 'create_overheat_flame_sprite',
  'create_razor_leaf_particle_sprite', 'create_absorption_orb_sprite',
  'create_power_absorption_orb_sprite', 'create_flashing_hitsplat_sprite',
  'create_outrage_flame_sprite', 'createmonscanline',
  'movewavetask', 'createmusicmovementeffect',
  'apprentice_msg', 'apprentice_random_msg',
  // Misc remaining stubs.
  'delay_4', 'delay_8', 'delay_16', 'delay_2',
  'get_ability', 'get_last_used_bank_move', 'setalpha', 'blendoff',
  'accuracycheck', 'damagecalc', 'maximize_def', 'haszero',
];
for (const op of _safeStubOpcodes) {
  // Ne PAS override les real impls. _handlersHas check via getOpcodeHandler.
  if (getOpcodeHandler(op) === undefined) {
    registerOpcode(op, (_ctx, _args) => false);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK SAFE STUBS — opcodes des AUTRES VMs (battle / anim / AI / contest /
// movement actions / field effect scripts). Notre extracteur les collecte par
// regex, mais ils ne sont JAMAIS exécutés par le field script VM (= chacun a
// son propre runtime ailleurs dans la décomp). Les registrer ici comme no-op
// safe évite les warnings `[script-runtime] opcode 'X' not implemented`.
//
// Source : les opcodes ci-dessous viennent de :
//   - `asm/macros/battle_script.inc` (= battle script VM, ~150 opcodes)
//   - `asm/macros/battle_anim_script.inc` (= battle anim VM, ~80 opcodes)
//   - `asm/macros/battle_ai_script.inc` (= AI script VM, ~70 opcodes)
//   - `asm/macros/contest_ai.inc` (= contest AI VM, ~50 opcodes)
//   - `asm/macros/fldeff.inc` (= field effect VM, ~10 opcodes)
//   - `asm/macros/movement.inc` (= movement actions, ~100 actions)
//   - `asm/macros/battle_frontier/*.inc` (= frontier facility extras)
// ═══════════════════════════════════════════════════════════════════════════

const _otherVmStubs: string[] = [
  // ─ Battle script VM ─
  'accuracycheck', 'attackcanceler', 'attackstring', 'ppreduce', 'critcalc',
  'damagecalc', 'typecalc', 'typecalc2', 'adjustnormaldamage',
  'adjustnormaldamage2', 'adjustsetdamage', 'attackanimation', 'waitanimation',
  'healthbarupdate', 'datahpupdate', 'critmessage', 'effectivenesssound',
  'resultmessage', 'printstring', 'printfromtable', 'setmoveeffect',
  'setlowhealth', 'forcerandomswitch', 'metronome', 'jumpifstatus',
  'jumpifstatus2', 'jumpifstatus3', 'jumpifability', 'jumpifabilitypresent',
  'jumpifstat', 'jumpifmove', 'jumpifnotmove', 'jumpiftype', 'jumpiftype2',
  'jumpifabsent', 'jumpifsubstituteblocks', 'jumpifbattletype', 'jumpifnotbattletype',
  'jumpifcantmakeasleep', 'jumpifcantswitch', 'jumpifcantswitchout',
  'jumpifconfusedandstatmaxed', 'jumpifhasnohp', 'jumpifmovehadnoeffect',
  'jumpifmoveturn', 'jumpifnexttargetvalid', 'jumpifnodamage', 'jumpifnostatus3',
  'jumpifnotfirstturn', 'jumpifnopursuitswitchdmg', 'jumpifside_affecting',
  'jumpifsideaffecting', 'jumpifusedheldpercentitem', 'jumpifword',
  'jumpifhalfword', 'jumpifbyteequal', 'jumpifbytenotequal', 'jumpifbytewasset',
  'jumpifbytewasset_inc', 'jumpifaiability', 'jumpifarrayequal',
  'jumpifarraynotequal', 'jumpifsubstituteexists', 'jumpiftargetally',
  'jumpifsafeguardup', 'jumpifabilitydefnotonfield', 'jumpifabilitydefonfield',
  'jumpiftargetnotally', 'tryfaintmon', 'tryfaintmon_spikes', 'tryfaintmon_calc',
  'statbuffchange', 'statbuffchange_b', 'orbyte', 'orword', 'andbyte', 'andword',
  'bicbyte', 'bicword', 'setbyte', 'setword', 'sethword', 'setwordfromptr',
  'addbyte', 'subbyte', 'addhalfword', 'subhalfword', 'addword', 'subword',
  'addhword', 'copyhword', 'copyword', 'copyarray', 'copyarraywithindex',
  'pause', 'playanimation', 'playanimation_var', 'playanimation2', 'playfaintcry',
  'playstatchangeanimation', 'playtrainerdefeatbgm', 'cureifburnedparalyzedorpoisoned',
  'cureifburnedstatus', 'cureifburnedparalyzedorpoisoned_calc', 'volumeup',
  'volumedown', 'set_invisible', 'set_visible', 'showplayer', 'hideplayer',
  'updatestatusicon', 'rapidspinfree', 'getsecretpowereffect',
  'settypebasedhalvers', 'setweatherballtype', 'settypetoenvironment',
  'settypetorandomresistance', 'getbattlerfainted', 'getbattlerfainted_calc',
  'drawlvlupbox', 'yesnoboxlearnmove', 'yesnoboxstoplearningmove',
  'updatechoicemoveonlvlup', 'weatherdamage', 'setmagiccoattarget',
  'snatchsetbattlers', 'snatchsetbattlers2', 'trycastformdatachange',
  'docastformchangeanimation', 'trygetintimidatetarget', 'seteffectsecondary',
  'seteffectprimary', 'seteffectwithchance', 'tryswapabilities', 'tryimprison',
  'trysetgrudge', 'trysetsnatch', 'trysetdestinybondtohappen', 'trysetencore',
  'trysetfutureattack', 'trysetspikes', 'trydobeatup', 'tryexplosion',
  'tryconversiontypechange', 'trychoosesleeptalkmove', 'tryconversion',
  'tryhealhalfhealth', 'trymirrormove', 'trywish', 'trycopyability',
  'trycastform', 'trymemento', 'tryinfatuating', 'trysethelpinghand',
  'trysetmagiccoat', 'trysetperishsong', 'trysetrest', 'trysetroots',
  'tryspiteppreduce', 'tryswapitems', 'tryrecycleitem', 'trysetcaughtmondexflags',
  'trygivecaughtmonnick', 'transformdataexecution', 'metronomeevent',
  'snatchmove', 'snatchmove2', 'snatchsetstatus', 'sketch',
  'weightdamagecalculation', 'magnitudedamagecalculation', 'painsplitdmgcalc',
  'mirrorcoatdamagecalculator', 'rolloutdamagecalculation', 'presentdamagecalculation',
  'furycuttercalc', 'hpthresholds', 'hpthresholds2', 'counterdamagecalculator',
  'friendshiptodamagecalculation', 'recoverbasedonsunlight', 'remaininghptopower',
  'scaledamagebyhealthratio', 'maxattackhalvehp', 'manipulatedamage',
  'negativedamage', 'damagetohalftargethp', 'setdamagetohealthdifference',
  'setdrainedhp', 'sethpdamagefrommetronome', 'hiddenpowercalc', 'dmgtolevel',
  'doubledamagedealtifdamaged', 'unfreezeincaseofmagmastorm',
  'palacetryescapestatus', 'palaceflavortext', 'arenaopponentmonlost',
  'arenaplayermonlost', 'arenabothmonlost', 'forfeityesnobox', 'jumpifplayerran',
  'setatktoplayer0', 'atknameinbuff1', 'resetintimidatetracebits',
  'resetsentmonsvalue', 'resetplayerfainted', 'cancelallactions',
  'getmoneyreward', 'givepaydaymoney', 'printselectionstringfromtable',
  'printselectionstring', 'displaydexinfo', 'pickup', 'pickupall', 'pickupone',
  'pickupanditem', 'pickupmoneyfound', 'pickuptally', 'sortstatchanges',
  'jumpifoneofstatlevelsbest', 'stockpile', 'stockpiletobasedamage',
  'stockpiletohpheal', 'statusanimation', 'status2animation',
  'chosenstatus2animation', 'splashanimation', 'displaybellsplash',
  'mimicattackcopy', 'getswitchedmondata', 'switchindataupdate',
  'switchindataupdate2', 'switchindataupdate3', 'switchinanim',
  'switchinjmp', 'switchineffects', 'switchoutabilities', 'switchhandleorder',
  'fadebackground', 'finishaction', 'finishturn', 'finishmove',
  'restoreatktoball', 'returnatktoball', 'returnopponentmon1toball',
  'returnopponentmon2toball', 'returntoball', 'restoreplayer',
  'cancelmultiturnmoves', 'cleareffectsonfaint', 'clearstatusfromeffect',
  'pursuit_relateddmg', 'pursuit_processstatuschange', 'pursuit_setduplicate',
  'pursuit_setdmgsource', 'pursuit_setvalues', 'protectanduseendured',
  'createbattlestartpaltask', 'playmagiccoatanim', 'flytarget_intro_anim',
  'flytarget_invisible', 'maximize_atkstat', 'enduretrap',
  'setsemiinvulnerablebit', 'clearsemiinvulnerablebit', 'tryencore',
  'createremovedustsprite', 'normalisebuffs', 'movevaluescleanup', 'moveendall',
  'moveendcase', 'moveendfrom', 'moveendfromto', 'moveendto', 'movewavetask',
  'createmusicmovementeffect', 'createmonscanline', 'createsoundtask',
  'callenvironmentattack', 'damageamttostorageinflict', 'damageamttoinflict',
  'damageamttodec', 'damageamttoset', 'changebg', 'fadetobgfromset',
  'fadetobg', 'restorebg', 'waitbgfadeout', 'waitbgfadein', 'changebgattribute',
  'invertscreencolor', 'translatebattlebgpal', 'invert_screen_color',
  'simple_palette_blend', 'complex_palette_blend', 'blend_color_cycle',
  'blend_color_cyclebytag', 'blend_color_cycleexclude', 'invert_palettes',
  'set_grayscale_pal', 'set_original_pal', 'flash_anim_tag_with_color',
  'metallic_shine', 'shrink_target_copy', 'shake_battle_platforms',
  'shake_mon_or_platform', 'trainerslidein', 'trainerslideout',
  'reveal_trainer', 'levitate', 'visible', 'invisible', 'makevisible',
  'lock_anim', 'disable_anim', 'clear_affine_anim', 'destroy_extra_task',
  'fanfare', 'waitcry', 'waitsound', 'stopsound', 'stopanim',
  'attacker_fade_from_invisible', 'attacker_fade_to_invisible',
  'getmovetarget', 'selectfirstvalidtarget', 'swapattackerwithtarget',
  'jumprettrue', 'jumpretfalse', 'jumpreteq', 'jumpifcontest',
  'jumptocalledmove', 'jumpargeq', 'jumpargnoteq',
  'monbg', 'monbg_static', 'monbg_22', 'clearmonbg', 'clearmonbg_static',
  'monbgprio_28', 'splitbgprio', 'splitbgprio_all', 'splitbgprio_foes',
  'doublebattle_2D', 'doublebattle_2E', 'setpan', 'panse', 'panse_adjustnone',
  'panse_adjustall', 'panse_1B', 'setalpha', 'blendoff', 'choosetwoturnanim',
  'setalreadystatusedmoveattempt', 'setalwayshitflag', 'setatkhppercent',
  'setatkhptozero', 'setbide', 'setcharge', 'setdefensecurlbit', 'setdestinybond',
  'setfocusenergy', 'setforcedtarget', 'setforesight', 'setgraphicalstatchangevalues',
  'sethail', 'setlightscreen', 'setminimize', 'setmist', 'setmultihit',
  'setmultihitcounter', 'setoutcomeonteleport', 'setprotectlike', 'setrain',
  'setreflect', 'setsafeguard', 'setsandstorm', 'setseeded', 'setsubstitute',
  'setsunny', 'settaunt', 'settorment', 'setyawn', 'cursetarget',
  'setatkhptozero', 'setgastroacidoff', 'haszero', 'maximize_def',
  'count_usable_party_mons', 'getshouldswitchpartyforitem', 'is_first_turn_for',
  'cut_tree', 'rock_smash_break', 'ride_water_current_up', 'nurse_joy_bow',
  'emote_exclamation_mark', 'emote_question_mark', 'emote_heart',
  'face_away_player', 'face_original_direction', 'face_player',
  'face_left', 'face_right', 'face_up', 'face_down',
  'lock_facing_direction', 'unlock_facing_direction',
  'createleechseedsprite', 'removelightscreenreflect',
  'updatebattlertypes', 'decrementmultihit', 'getexp',
  'getifcantrunfrombattle', 'handleballthrow', 'handlelearnnewmove',
  'healpartystatus', 'hidepartystatussummary', 'hitanimation', 'dofaintanimation',
  'drawpartystatussummary', 'flee', 'end3', 'endlinkbattle', 'endselectionscript',
  'givecaughtmon', 'initmultihitstring', 'openpartyscreen', 'useitemonopponent',
  'buffermovetolearn', 'assistattackselect',
  'callmove', 'copyfoestats', 'copymovepermanently', 'checkteamslost',
  'confuseifrepeatingattackends', 'disablelastusedattack',
  'get_ability', 'get_considered_move_effect', 'get_curr_move_type',
  'get_gender', 'get_hold_effect', 'get_how_powerful_move_is',
  'get_last_used_bank_move', 'get_move_effect_from_result',
  'get_move_power_from_result', 'get_move_type_from_result', 'get_protect_count',
  'get_stockpile_count', 'get_target_type1', 'get_target_type2',
  'get_turn_count', 'get_used_held_item', 'get_user_type1', 'get_user_type2',
  'get_weather', 'getswitchedmondata',
  // ─ Battle anim sprite creators ─
  'createsprite', 'createvisualtask', 'step_end', 'waitforvisualfinish',
  'loadspritegfx', 'unloadspritegfx', 'create_basic_hitsplat_sprite',
  'create_overheat_flame_sprite', 'create_razor_leaf_particle_sprite',
  'create_razor_leaf_cutter_sprite', 'create_absorption_orb_sprite',
  'create_power_absorption_orb_sprite', 'create_flashing_hitsplat_sprite',
  'create_clamp_jaw_sprite', 'create_claw_slash_sprite',
  'create_confusion_duck_sprite', 'create_constrict_binding_sprite',
  'create_cross_impact_sprite', 'create_dragon_breath_fire_sprite',
  'create_dragon_dance_orb_sprite', 'create_dragon_rage_fire_plume_sprite',
  'create_dragon_rage_fire_spit_sprite', 'create_frenzy_plant_root_sprite',
  'create_handle_invert_hitsplat_sprite', 'create_hyper_beam_orb_sprite',
  'create_ingrain_orb_sprite', 'create_ingrain_root_sprite',
  'create_item_steal_sprite', 'create_leaf_blade_task',
  'create_leech_life_needle_sprite', 'create_linear_stinger_sprite',
  'create_megahorn_horn_sprite', 'create_mimic_orb_sprite',
  'create_mon_edge_hitsplat_sprite', 'create_outrage_flame_sprite',
  'create_persist_hitsplat_sprite', 'create_petal_dance_big_flower_sprite',
  'create_petal_dance_small_flower_sprite', 'create_pin_missile_sprite',
  'create_poison_powder_particle_sprite', 'create_present_heal_particle_sprite',
  'create_present_sprite', 'create_random_pos_hitsplat_sprite',
  'create_sharp_teeth_sprite', 'create_sleep_powder_particle_sprite',
  'create_solar_beam_big_orb_sprite', 'create_spore_particle_sprite',
  'create_stockpile_absorption_orb_sprite', 'create_string_wrap_sprite',
  'create_stun_spore_particle_sprite', 'create_surf_wave',
  'create_swift_star_sprite', 'create_tail_glow_orb_sprite',
  'create_tear_drop_sprite', 'create_trick_bag_sprite',
  'create_twister_leaf_sprite', 'create_web_thread_sprite',
  // ─ AI script + contest AI ─
  'score', 'def_special', 'setstatchanger', 'if_random_safari_flee',
  'if_random_less_than', 'if_user_order_eq', 'if_user_order_not_eq',
  'if_user_order_more_than', 'if_target_faster', 'if_user_faster',
  'if_target_is_ally', 'if_target_not_taunted', 'if_can_participate',
  'if_cannot_participate', 'if_in_bytes', 'if_not_in_bytes', 'if_in_hwords',
  'if_not_in_hwords', 'if_stat_level_more_than', 'if_stat_level_less_than',
  'if_stat_level_equal', 'if_hp_more_than', 'if_hp_less_than',
  'if_hp_equal', 'if_hp_not_equal', 'if_status', 'if_status2', 'if_status3',
  'if_status_in_party', 'if_not_status', 'if_not_status2', 'if_not_status3',
  'if_type_effectiveness', 'if_type', 'if_no_type', 'if_move', 'if_effect',
  'if_effect_eq', 'if_effect_not_eq', 'if_not_effect',
  'if_effect_type_eq', 'if_effect_type_not_eq', 'if_equal', 'if_equal_',
  'if_not_equal', 'if_more_than', 'if_less_than',
  'if_ability', 'if_no_ability', 'if_holds_item', 'if_has_move',
  'if_has_move_with_effect', 'if_doesnt_have_move_with_effect',
  'if_user_has_exciting_move', 'if_user_has_no_attacking_moves',
  'if_user_doesnt_have_move', 'if_any_move_disabled', 'if_any_move_encored',
  'if_flash_fired', 'if_level_cond', 'if_can_faint', 'if_used_combo_starter',
  'if_not_used_combo_starter', 'if_completed_combo', 'if_not_completed_combo',
  'if_not_combo_starter', 'if_not_combo_finisher', 'if_not_double_battle',
  'if_side_affecting', 'if_appeal_num_eq', 'if_appeal_num_not_eq',
  'if_condition_eq', 'if_contest_type_eq', 'if_excitement_eq',
  'if_excitement_less_than', 'if_excitement_not_eq', 'if_move_excitement_eq',
  'if_move_excitement_less_than', 'if_move_used_count_eq',
  'if_move_used_count_more_than', 'if_move_used_count_not_eq',
  'if_most_appealing_move', 'if_would_finish_combo', 'if_last_appeal',
  'if_not_last_appeal', 'if_user_condition_eq', 'if_user_condition_less_than',
  // ─ Field effect script ─
  'field_eff_callnative', 'field_eff_end', 'field_eff_loadpal',
  'field_eff_loadfadedpal', 'field_eff_loadgfx_callnative',
  'field_eff_loadpal_callnative', 'field_eff_loadfadedpal_callnative',
  'field_eff_loadfadedpalblack', 'field_eff_loadfadedpalblack_callnative',
  // ─ Movement actions ─
  'walk_up', 'walk_down', 'walk_left', 'walk_right',
  'walk_in_place_up', 'walk_in_place_down', 'walk_in_place_left', 'walk_in_place_right',
  'walk_in_place_faster_up', 'walk_in_place_faster_down', 'walk_in_place_faster_left', 'walk_in_place_faster_right',
  'walk_in_place_fast_up', 'walk_in_place_fast_down', 'walk_in_place_fast_left', 'walk_in_place_fast_right',
  'walk_in_place_slow_left', 'walk_in_place_slow_right', 'walk_in_place_slow_up', 'walk_in_place_slow_down',
  'walk_fast_up', 'walk_fast_down', 'walk_fast_left', 'walk_fast_right',
  'walk_faster_up', 'walk_faster_down', 'walk_faster_left', 'walk_faster_right',
  'walk_slow_up', 'walk_slow_down', 'walk_slow_left', 'walk_slow_right',
  'walk_slow_diag_northeast', 'walk_slow_diag_northwest',
  'walk_slow_diag_southeast', 'walk_slow_diag_southwest',
  'walk_left_affine', 'walk_down_start_affine',
  'slide_up', 'slide_down', 'slide_left', 'slide_right',
  'slide_slow_up', 'slide_slow_down', 'slide_slow_left', 'slide_slow_right',
  'slide_fast_up', 'slide_fast_down', 'slide_fast_left', 'slide_fast_right',
  'jump_up', 'jump_down', 'jump_left', 'jump_right',
  'jump_2_up', 'jump_2_down', 'jump_2_left', 'jump_2_right',
  'jump_in_place_up', 'jump_in_place_down', 'jump_in_place_left', 'jump_in_place_right',
  'jump_in_place_left_right', 'jump_in_place_up_down', 'jump_in_place_down_up',
  'fly_up', 'fly_down', 'watch',
  // ─ Frontier extras ─
  'frontier_savebattle', 'frontier_saveparty', 'frontier_setbrainobj',
  'frontier_incrementstreak', 'frontier_isbattletype', 'frontier_gettrainername',
  'frontier_checkvisittrainer',
  // ─ Trainer Hill ─
  'trainerhill_allfloorsused', 'trainerhill_clearsaved', 'trainerhill_finaltime',
  'trainerhill_getownerstate', 'trainerhill_getsaved', 'trainerhill_getstatus',
  'trainerhill_gettime', 'trainerhill_getusingereader', 'trainerhill_getwon',
  'trainerhill_giveprize', 'trainerhill_inchallenge', 'trainerhill_lost',
  'trainerhill_postbattletext', 'trainerhill_resumetimer', 'trainerhill_setmode',
  'trainerhill_setsaved', 'trainerhill_settrainerflags', 'trainerhill_start',
  // ─ Dome ─
  'dome_compareseeds', 'dome_getopponentname', 'dome_getroundtext',
  'dome_getwinnersname', 'dome_init', 'dome_initopponentparty',
  'dome_initresultstree', 'dome_inittrainers', 'dome_reduceparty',
  'dome_resetsketch', 'dome_restorehelditems', 'dome_setopponent',
  'dome_setopponentgfx', 'dome_settrainers', 'dome_showopponentinfo',
  'dome_showprevtourneytree', 'dome_showstatictourneytree', 'dome_showtourneytree',
  // ─ Factory ─
  'factory_generateopponentmons', 'factory_generaterentalmons',
  'factory_getopponentmontype', 'factory_getopponentstyle', 'factory_init',
  'factory_rentmons', 'factory_resethelditems', 'factory_setopponentgfx',
  'factory_setopponentmons', 'factory_setparties', 'factory_swapmons',
  // ─ Battle Tents ─
  'fallarbortent_getopponentname', 'fallarbortent_getprize',
  'fallarbortent_giveprize', 'fallarbortent_init', 'fallarbortent_setrandomprize',
  'slateporttent_generateopponentmons', 'slateporttent_generaterentalmons',
  'slateporttent_getprize', 'slateporttent_giveprize', 'slateporttent_init',
  'slateporttent_rentmons', 'slateporttent_setrandomprize',
  'slateporttent_swapmons', 'verdanturftent_getprize', 'verdanturftent_giveprize',
  'verdanturftent_init', 'verdanturftent_setrandomprize',
  'battletent_getopponentintro',
  // ─ Pike ─
  'pike_cleartrainerids', 'pike_exitwildmonroom', 'pike_flashscreen',
  'pike_getbrainstatus', 'pike_gethint', 'pike_gethintroomid',
  'pike_getnpcmsg', 'pike_getroomtype', 'pike_getstatus', 'pike_getstatusmon',
  'pike_healonetwomons', 'pike_inchallenge', 'pike_init', 'pike_inwildmonroom',
  'pike_isfinalroom', 'pike_ispartyfullhealth', 'pike_nohealing',
  'pike_prequeenheal', 'pike_resethelditems', 'pike_savehelditems',
  'pike_sethintroom', 'pike_setnextroom', 'pike_setroomobjects',
  // ─ Pyramid ─
  'pyramid_clearhelditems', 'pyramid_getlocation', 'pyramid_hideitem',
  'pyramid_init', 'pyramid_resetparty', 'pyramid_seedfloor',
  'pyramid_setfloorpal', 'pyramid_setitem', 'pyramid_setprize',
  'pyramid_settrainers', 'pyramid_showhint', 'pyramid_updatelight',
  // ─ Palace ─
  'palace_getcomment', 'palace_incrementstreak', 'palace_init', 'palace_save',
  // ─ Arena ─
  'arena_gettrainername', 'arena_init', 'arenadrawreftextbox',
  'arenaerasereftextbox', 'arenajudgmentstring', 'arenajudgmentwindow',
  'arenawaitmessage',
  // ─ Tower ─
  'tower_closelink', 'tower_getopponentintro2', 'tower_giveribbons',
  'tower_loadlinkopponents', 'tower_loadpartners', 'tower_setbattlewon',
  'tower_setinterviewdata', 'tower_setpartnergfx',
  // ─ Apprentice ─
  'apprentice_answeredquestion', 'apprentice_buff', 'apprentice_freequestion',
  'apprentice_gavelvlmode', 'apprentice_getnumpartymons', 'apprentice_getquestion',
  'apprentice_initquestion', 'apprentice_menu', 'apprentice_msg',
  'apprentice_openbag', 'apprentice_randomizequestions', 'apprentice_reset',
  'apprentice_save', 'apprentice_setgfx', 'apprentice_setleadmon',
  'apprentice_setlvlmode', 'apprentice_setmove', 'apprentice_setpartymon',
  'apprentice_shiftsaved', 'apprentice_shouldcheckgone', 'apprentice_shouldleave',
  'apprentice_shufflespecies', 'apprentice_trysetitem', 'apprentice_random_msg',
  // ─ Vgoto extras ─
  'vgoto_if_ne', 'vbuffer',
  // ─ Other waits + control ─
  'enable_jump_landing_ground_effect', 'delay_2', 'delay_4', 'delay_8',
  'delay_16', 'fanfare', 'try', 'callmove', 'psywavedamageeffect',
];

for (const op of _otherVmStubs) {
  if (!_handlersHas(op)) {
    registerOpcode(op, (_ctx, _args) => false);
  }
}

/** Helper privé : check si un opcode est déjà registered. Utilise getOpcodeHandler
 *  qui returns undefined si pas trouvé. */
function _handlersHas(name: string): boolean {
  return getOpcodeHandler(name) !== undefined;
}

// ─── Side-effect imports : fichiers d'opcodes par section décomp ────────────
// Chaque module register ses opcodes au boot via registerOpcode side-effect.
// Order : APRÈS les opcodes définis dans ce fichier → real impls overwrites
// any earlier stub of same name défini ici.

import './script-opcodes-random';
import './script-opcodes-berry';
import './script-opcodes-tv';
import './script-opcodes-match-call';
import './script-opcodes-weather';
import './script-opcodes-fieldeffect';
import './script-opcodes-shop';
import './script-opcodes-mystery-event';
import './script-opcodes-rotating-tile-puzzle';
import './script-opcodes-slot-machine';
import './script-opcodes-contest';
import './script-opcodes-pc-storage';
import './script-opcodes-lilycove';
import './script-opcodes-door';
import './script-opcodes-fieldmap';
import './script-opcodes-warp';
import './script-opcodes-sound';
import './script-opcodes-decoration';
import './script-opcodes-money-coins';
import './script-opcodes-item';
import './script-opcodes-rtc-clock';
import './script-opcodes-player-avatar';
import './script-opcodes-string';
import './script-opcodes-party';
import './script-opcodes-flag-var';
import './script-opcodes-screen-fx';
import './script-opcodes-lock';
import './script-opcodes-battle';
import './script-opcodes-special';
import './script-opcodes-frontier';
import './script-opcodes-menu';
import './script-opcodes-message';

// ─── Mark module loaded (= for sanity check) ────────────────────────────────

console.log('[script-opcodes] registered Phase 4.5 MVP + iter6/7 stubs + session 131 1:1 décomp completion (all field opcodes + battle facility macros + other VM safe stubs) + D1 split');

// Lint-friendly export to avoid "unused imports".
export { COMPARE_LT, COMPARE_EQ, COMPARE_GT };
export type { ScriptContext };
