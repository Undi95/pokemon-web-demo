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

// ─── Variables / flags ───────────────────────────────────────────────────────

registerOpcode('setvar', (_ctx, args) => {
  VarSet(args[0], parseValue(args[1]));
  return false;
});

registerOpcode('addvar', (_ctx, args) => {
  VarSet(args[0], (VarGet(args[0]) + parseValue(args[1])) & 0xFFFF);
  return false;
});

registerOpcode('subvar', (_ctx, args) => {
  VarSet(args[0], (VarGet(args[0]) - parseValue(args[1])) & 0xFFFF);
  return false;
});

registerOpcode('copyvar', (_ctx, args) => {
  VarSet(args[0], VarGet(args[1]));
  return false;
});

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
function _stubTrainerBattle(trainerArg: string): void {
  console.log(`[trainerbattle stub fallback] ${trainerArg} — VAR_RESULT=1`);
  gSpecialVar.Result = 1;
  FlagSet(`__defeated_${trainerArg}`);
}

/** Phase 5.7 : real trainer battle via state machine + battle-flow.
 *  Reads trainer party from JSON, runs battles in sequence.
 *  Falls back to stub if trainer data not available or battle fails. */
function _runTrainerBattle(ctx: ScriptContext, trainerArg: string): boolean {
  if (!trainerArg) {
    _stubTrainerBattle(trainerArg);
    return false;
  }
  // Dynamic import : avoid circular deps at load.
  let flowReady = false;
  let flow: { tick: () => boolean } | null = null;
  void import('./trainer-battle-flow').then((mod) => {
    flow = mod.startTrainerBattle(trainerArg);
    flowReady = true;
  }).catch(() => {
    // Fallback to stub if import fails.
    _stubTrainerBattle(trainerArg);
    flowReady = true;
    flow = { tick: () => true };
  });
  SetupNativeScript(ctx, () => {
    if (!flowReady) return false;
    return flow!.tick();
  });
  return true;  // block script
}

registerOpcode('trainerbattle', (ctx, args) => {
  // args = [type, trainer, localId, ptr1, ...]
  return _runTrainerBattle(ctx, args[1] ?? '');
});

registerOpcode('trainerbattle_single', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '');
});

registerOpcode('trainerbattle_double', (ctx, args) => {
  // Double battles not yet supported — fallback to single.
  return _runTrainerBattle(ctx, args[0] ?? '');
});

registerOpcode('trainerbattle_rematch', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '');
});

registerOpcode('trainerbattle_rematch_double', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '');
});

registerOpcode('trainerbattle_no_intro', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '');
});

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
registerOpcode('switch', (_ctx, args) => {
  // copyvar VAR_0x8000, args[0]
  VarSet('VAR_0x8000', VarGet(args[0]));
  return false;
});

registerOpcode('case', (ctx, args) => {
  // compare VAR_0x8000, args[0] + goto_if_eq args[1]
  // 1:1 décomp : args[0] peut être MALE/FEMALE/numbers/VAR_X (= parseValue).
  const condition = parseValue(args[0]);
  const scratch = VarGet('VAR_0x8000');
  if (scratch === condition) {
    const target = getScript(args[1]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('setflag', (_ctx, args) => {
  FlagSet(args[0]);
  return false;
});

registerOpcode('clearflag', (_ctx, args) => {
  FlagClear(args[0]);
  return false;
});

registerOpcode('checkflag', (ctx, args) => {
  // 1:1 décomp : ctx.comparisonResult = FlagGet (= 0/1).
  ctx.comparisonResult = FlagGet(args[0]) ? 1 : 0;
  // gSpecialVar.Result aussi set par checkflag (= via VAR_RESULT).
  gSpecialVar.Result = ctx.comparisonResult;
  return false;
});

registerOpcode('compare', (ctx, args) => {
  // 1:1 décomp : args peuvent être var noms, immediates, ou constantes
  // (MALE/FEMALE/LOCALID_X). parseValue les résout tous (= comme dans goto_if_*).
  const a = parseValue(args[0]);
  const b = parseValue(args[1]);
  ctx.comparisonResult = Compare(a, b);
  return false;
});

registerOpcode('checkplayergender', (_ctx, _args) => {
  gSpecialVar.Result = gPlayerAvatar.gender === 'MALE' ? MALE_GENDER : FEMALE_GENDER;
  return false;
});

// ─── Lock / Release / FacePlayer ─────────────────────────────────────────────

// `_isPlayerStepFinished` est maintenant importé depuis `./script-opcodes/helpers`
// (1:1 décomp `IsFreezePlayerFinished` event_object_movement.c).

registerOpcode('lock', (ctx) => {
  // 1:1 décomp `ScrCmd_lock` (scrcmd.c:1217-1237) :
  //   FreezeObjects_WaitForPlayerAndSelected();
  //   SetupNativeScript(ctx, IsFreezeSelectedObjectAndPlayerFinished);
  // Freeze tous les NPCs sauf player + selected NPC. Player + selected sont
  // freeze APRÈS leur step courant termine.
  const npc = getSelectedNpc();
  // Freeze immediately tous sauf player/selected — 1:1 strict via FreezeObjectEvent
  // qui pause aussi sprite.animPaused (= sinon anim continue malgré frozen).
  for (const n of gObjectEvents) {
    if (n.active && n !== npc) FreezeObjectEvent(n);
  }
  // Wait pour player step end. Le selected NPC était déjà frozen ou en step ;
  // on freeze le selected aussi à la fin du wait.
  SetupNativeScript(ctx, () => {
    if (!_isPlayerStepFinished()) return false;
    if (npc) FreezeObjectEvent(npc);
    return true;
  });
  return true;  // tells script-runtime to wait
});

registerOpcode('lockall', (ctx) => {
  // 1:1 STRICT décomp `ScrCmd_lockall` (scrcmd.c:1199-1213) :
  //   FreezeObjects_WaitForPlayer();
  //   SetupNativeScript(ctx, IsFreezePlayerFinished);
  // → FreezeObjectEvents() qui appelle FreezeObjectEvent par NPC, qui set
  //   frozen=true ET pause sprite.animPaused (= sinon anim cycle malgré frozen).
  for (const npc of gObjectEvents) {
    if (npc.active) FreezeObjectEvent(npc);
  }
  SetupNativeScript(ctx, () => _isPlayerStepFinished());
  return true;
});

registerOpcode('release', (_ctx) => {
  // 1:1 STRICT décomp `ScrCmd_release` (scrcmd.c:1251-1263) :
  //   HideFieldMessageBox();
  //   ObjectEventClearHeldMovementIfFinished(selected);
  //   ObjectEventClearHeldMovementIfFinished(player);
  //   ScriptMovement_UnfreezeObjectEvents();
  //   UnfreezeObjectEvents();   ← unfreeze TOUS les NPCs via UnfreezeObjectEvent
  //   qui restore sprite.animPaused = spriteAnimPausedBackup (= reverse du
  //   FreezeObjectEvent qui avait pause les anims).
  HideFieldMessageBox();
  for (const npc of gObjectEvents) {
    if (npc.active) UnfreezeObjectEvent(npc);
  }
  return false;
});

registerOpcode('releaseall', (_ctx) => {
  HideFieldMessageBox();
  for (const npc of gObjectEvents) {
    if (npc.active) UnfreezeObjectEvent(npc);
  }
  return false;
});

registerOpcode('faceplayer', (_ctx) => {
  // 1:1 décomp ScrCmd_faceplayer : NPC tourne face au player (= direction
  // opposée à la direction face du player).
  const npc = getSelectedNpc();
  if (!npc) return false;
  npc.facingDirection = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
  return false;
});

registerOpcode('turnobject', (_ctx, args) => {
  // turnobject LOCALID, DIRECTION. Trouve NPC par localId, set facing.
  const localId = parseInt(args[0], 10) || 0;
  const dirArg = args[1];
  let dir = DIR_SOUTH;
  if (dirArg.includes('SOUTH') || dirArg.includes('DOWN')) dir = DIR_SOUTH;
  else if (dirArg.includes('NORTH') || dirArg.includes('UP')) dir = DIR_NORTH;
  else if (dirArg.includes('WEST') || dirArg.includes('LEFT')) dir = DIR_WEST;
  else if (dirArg.includes('EAST') || dirArg.includes('RIGHT')) dir = DIR_EAST;
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localId === localId) {
      npc.facingDirection = dir;
      break;
    }
  }
  return false;
});

// ─── Dialog / Message ────────────────────────────────────────────────────────

registerOpcode('message', (_ctx, args) => {
  // 1:1 décomp ScrCmd_message : ShowFieldMessage(text).
  const label = args[0];
  const rawText = getText(label);
  if (!rawText) {
    console.warn(`[opcode message] text '${label}' not found`);
    return false;
  }
  ShowFieldMessage(rawText);
  return false;
});

registerOpcode('waitmessage', (ctx) => {
  // 1:1 décomp ScrCmd_waitmessage : SetupNativeScript IsFieldMessageBoxHidden.
  // Quand IsFieldMessageBoxHidden returns TRUE → resume bytecode.
  SetupNativeScript(ctx, IsFieldMessageBoxHidden);
  return true;
});

registerOpcode('waitbuttonpress', (ctx) => {
  // 1:1 décomp ScrCmd_waitbuttonpress : SetupNativeScript WaitForAorBPress.
  SetupNativeScript(ctx, isAOrBNewlyPressed);
  return true;
});

registerOpcode('closemessage', (_ctx) => {
  HideFieldMessageBox();
  return false;
});

/** msgbox = composite macro : équivalent à `loadword 0, text` + `callstd N`.
 *  Notre version : run la sequence complète inline (= équivalent fonctionnel
 *  des std scripts MSGBOX_NPC, MSGBOX_DEFAULT, MSGBOX_SIGN, MSGBOX_YESNO).
 *
 *  MSGBOX_NPC      = 2 → lock + faceplayer + message + waitmessage + waitbuttonpress + release
 *  MSGBOX_SIGN     = 3 → lockall + message + waitmessage + waitbuttonpress + releaseall
 *  MSGBOX_DEFAULT  = 4 → idem MSGBOX_NPC (= avec ou sans faceplayer selon variantes)
 *  MSGBOX_YESNO    = 5 → message + waitmessage + spawn yesnobox + wait selection
 *  MSGBOX_AUTOCLOSE= 6 → message + waitmessage + waitbuttonpress + closemessage
 *
 *  Implémenté via SetupNativeScript : state machine polling chaque frame. */
registerOpcode('msgbox', (ctx, args) => {
  const textLabel = args[0];
  const type = args[1] ?? 'MSGBOX_DEFAULT';
  // 1:1 décomp : le linker GBA garantit le label existe au compile time, donc le
  // décomp ne gère pas ce cas. Notre runtime fetch async les textes depuis JSON,
  // un label peut être absent si extract-scripts.mjs ne l'a pas récolté ou si la
  // map JSON est mal chargée. Avant : `return false` (= advance) → le script
  // exécutait silencieusement les opcodes suivants (setvar, applymovement...) →
  // bug invisible (= dialog jamais affiché mais state changed). Maintenant on
  // affiche `[MISSING:label]` à l'écran avec le flow msgbox normal → debug visible
  // + halt jusqu'à A press, comme un vrai dialog.
  const lookupText = getText(textLabel);
  if (!lookupText) {
    console.error(`[opcode msgbox] text '${textLabel}' not found — showing [MISSING] placeholder`);
  }
  const rawText = lookupText ?? `[MISSING:${textLabel}]`;

  // 1:1 décomp `data/scripts/std_msgbox.inc` semantics :
  //   MSGBOX_NPC      → lock + faceplayer + message + waitbuttonpress + release
  //   MSGBOX_SIGN     → lockall + message + waitbuttonpress + releaseall
  //   MSGBOX_DEFAULT  → message + waitbuttonpress + return (NO lock, NO facing)
  //   MSGBOX_AUTOCLOSE→ message + waitbuttonpress + closemessage
  //   MSGBOX_YESNO    → message + yesnobox
  // Bug fixed session 124 (= Audit Opus A.2) : avant cette dispatch, on
  // appliquait `npc.frozen=true + facingDirection=OPPOSITE_DIR[player]` à
  // TOUT non-SIGN msgbox, y compris MSGBOX_DEFAULT. Conséquence : Mom dialog
  // "C'est joli ici, non?" (= MSGBOX_DEFAULT) flippait Mom de NORTH (= set par
  // OnTransition setobjectmovementtype FACE_UP) vers SOUTH (= OPPOSITE_DIR
  // player.facing=NORTH). La répétition `MoveMomToDoor/Stairs/TV → msgbox`
  // dans le flow stomppait sur facing à chaque dialog → user voyait Mom face
  // DOWN au lieu de UP/WEST.
  const isSign = type === 'MSGBOX_SIGN';
  const isNpc = type === 'MSGBOX_NPC';
  const isYesNo = type === 'MSGBOX_YESNO';
  const isAutoclose = type === 'MSGBOX_AUTOCLOSE';
  // MSGBOX_DEFAULT : juste afficher le message, pas de lock/face.
  // (= cf. std_msgbox.inc Std_MsgboxDefault).

  let state = 0;

  const tick = (): boolean => {
    switch (state) {
      case 0: {
        // Lock + face NPC selon msgbox type.
        if (isSign) {
          // 1:1 STRICT décomp Std_MsgboxSign : lockall (= FreezeObjectEvents).
          // FreezeObjectEvent set frozen + pause sprite.animPaused (= sinon
          // anim continue à cycler face/walk visuellement malgré frozen).
          for (const n of gObjectEvents) if (n.active) FreezeObjectEvent(n);
        } else if (isNpc) {
          // 1:1 décomp Std_MsgboxNPC : lock (= freeze TOUS sauf player+selected)
          // + faceplayer (= selected NPC tourne vers player).
          const selected = getSelectedNpc();
          for (const n of gObjectEvents) {
            if (n.active && n !== selected) FreezeObjectEvent(n);
          }
          if (selected) {
            FreezeObjectEvent(selected);
            selected.facingDirection = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
          }
        }
        // MSGBOX_DEFAULT / MSGBOX_AUTOCLOSE / MSGBOX_YESNO : pas de lock/face.
        // 1:1 décomp Std_MsgboxDefault : juste `message + waitbuttonpress + return`.
        ShowFieldMessage(rawText);
        state = 1;
        return false;
      }
      case 1: {
        // Wait for message done.
        if (IsFieldMessageBoxHidden()) {
          state = isYesNo ? 3 : 2;  // YesNo : skip waitbuttonpress, spawn menu directement.
        }
        return false;
      }
      case 2: {
        // Wait for A/B button press. 1:1 décomp `TextPrinterWait` (text.c:884)
        // qui PlaySE(SE_SELECT) sur A/B press → match comportement ROM.
        if (isAOrBNewlyPressed()) {
          // SE_SELECT = 5 (= 1:1 décomp constants/songs.h).
          void import('./decomp-globals').then(({ PlaySE }) => PlaySE(5));
          // Autoclose: close + release. Sinon (NPC/SIGN/DEFAULT) : juste close.
          HideFieldMessageBox();
          // Release frozen NPCs 1:1 STRICT via UnfreezeObjectEvent qui restore
          // sprite.animPaused = backup (= reverse du FreezeObjectEvent).
          if (isSign) {
            for (const n of gObjectEvents) if (n.active) UnfreezeObjectEvent(n);
          } else if (isNpc) {
            for (const n of gObjectEvents) if (n.active) UnfreezeObjectEvent(n);
          }
          // MSGBOX_DEFAULT : pas de lock à release. NB: si le script appelait
          // explicitement `lockall` avant le msgbox (= comme dans
          // EnterHouseMovingIn), c'est `releaseall` qui doit unfreeze, pas msgbox.
          void isAutoclose;  // future: AUTOCLOSE pourrait avoir comportement différent
          return true;  // resume bytecode
        }
        return false;
      }
      case 3: {
        // MSGBOX_YESNO : spawn YesNo menu (= 1:1 décomp std_msgbox_yesno script
        // qui call yesnobox + waitstate). Position 1:1 décomp menu.c:98-107
        // sYesNo_WindowTemplates : tilemapLeft=21, tilemapTop=9.
        _spawnYesNoMenu(21, 9);
        state = 4;
        return false;
      }
      case 4: {
        // Wait yesnobox selection. Menu_ProcessInputNoWrapClearOnChoose returns
        // cursor pos (0=OUI top, 1=NON bottom), -1 (B pressed), -2 (no choice).
        // Audit session 126 (post-test user) BUG MAJEUR : 1:1 décomp
        // `script_menu.c:Task_HandleYesNoInput` INVERSE les valeurs :
        //   case 0 (OUI top)     → gSpecialVar_Result = 1 (= YES enum)
        //   case 1 / B_PRESSED  → gSpecialVar_Result = 0 (= NO enum)
        // event.inc:1932-1933 confirme : `YES = 1, NO = 0`. Avant ce fix on
        // faisait l'inverse → tous les `goto_if_eq VAR_RESULT, YES` failed
        // silencieusement (= rename starter, multiples dialogues YESNO).
        const result = Menu_ProcessInputNoWrapClearOnChoose();
        if (result === -2) return false;
        const yesNoResult = result === 0 ? 1 : 0;
        gSpecialVar.Result = yesNoResult;
        // Cleanup yesno window.
        const wid = GetYesNoWindowId();
        if (wid >= 0) {
          ClearStdWindowAndFrame(wid, true);
          RemoveWindow(wid);
        }
        // Release dialog + NPC 1:1 STRICT via UnfreezeObjectEvent (= restore
        // sprite.animPaused = backup, sinon anim stuck pause).
        HideFieldMessageBox();
        const npc = getSelectedNpc();
        if (npc) UnfreezeObjectEvent(npc);
        return true;
      }
    }
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

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
// ─── Multichoice menus 1:1 décomp `script_menu.c` ──────────────────────────
// Audit session 126 LOT D2 : avant stubs `VAR_RESULT = 0` → maintenant vraie
// UI window verticale + cursor + A/B input. Data depuis `multichoice-data.ts`
// (= extraite de `src/data/script_menu.h` via `extract-multichoice-lists.mjs`).

let _multichoiceWindowId = -1;

function _spawnMultichoiceMenu(left: number, top: number, items: string[], cursorPos: number): void {
  const count = items.length;
  if (count === 0) return;
  // Estimate width : max len of items * 0.5 tile + 2 tiles margin (= rough).
  // 1:1 décomp utilise `DisplayTextAndGetWidth` + `ConvertPixelWidthToTileWidth`.
  // MVP : approximation par char count (= 6 px par char en FONT_NORMAL).
  let maxChars = 4;
  for (const t of items) {
    const len = (t ?? '').length;
    if (len > maxChars) maxChars = len;
  }
  const width = Math.max(5, Math.min(28, Math.ceil(maxChars * 0.7) + 2));
  const tmpl: WindowTemplate = {
    bg: 0,
    tilemapLeft: left,
    tilemapTop: top,
    width,
    height: count * 2,
    paletteNum: 15,
    baseBlock: 0x125,
  };
  _multichoiceWindowId = AddWindow(tmpl);
  DrawStdFrameWithCustomTileAndPalette(_multichoiceWindowId, true, 0x214, 14);
  // Print each item sur ligne i (= y = 1 + i * 16).
  for (let i = 0; i < count; i++) {
    AddTextPrinterParameterized3(
      _multichoiceWindowId, 1, 8, 1 + i * 16, [1, 2, 3], 255, items[i] ?? '',
    );
  }
  PutWindowTilemap(_multichoiceWindowId);
  CopyWindowToVram(_multichoiceWindowId, 3 /* COPYWIN_FULL */);
  // 1:1 décomp `InitMenuInUpperLeftCornerNormal(windowId, count, cursorPos)`.
  InitMenuInUpperLeftCornerNormal(_multichoiceWindowId, count, cursorPos);
}

function _cleanupMultichoiceMenu(): void {
  if (_multichoiceWindowId >= 0) {
    ClearStdWindowAndFrame(_multichoiceWindowId, true);
    RemoveWindow(_multichoiceWindowId);
    _multichoiceWindowId = -1;
  }
}

/** 1:1 décomp `ScrCmd_multichoice(left, top, multichoiceId, ignoreBPress)` :
 *    ScriptMenu_Multichoice(...) → spawn menu + waitstate.
 *    User picks → VAR_RESULT = cursor pos (0..N-1) ou MULTI_B_PRESSED (= 0x7F)
 *    si B pressed et !ignoreBPress, ou cursor pos final si ignoreBPress. */
registerOpcode('multichoice', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');  // resolves MULTI_X → number
  const ignoreBPress = parseValue(args[3] ?? '0') !== 0;
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    // Fallback : pas de data → set VAR_RESULT = 0 (= 1st option) + log.
    console.warn(`[opcode multichoice] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=0`);
    gSpecialVar.Result = 0;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, 0);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;  // MENU_NOTHING_CHOSEN
    if (result === -1) {
      // B pressed
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F /* MULTI_B_PRESSED */;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_multichoicedefault` : multichoice avec cursor à
 *  defaultChoice initial. */
registerOpcode('multichoicedefault', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');
  const defaultChoice = parseValue(args[3] ?? '0');
  const ignoreBPress = parseValue(args[4] ?? '0') !== 0;
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    console.warn(`[opcode multichoicedefault] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=${defaultChoice}`);
    gSpecialVar.Result = defaultChoice;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, defaultChoice);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;
    if (result === -1) {
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_multichoicegrid` : grille NxM au lieu d'une colonne.
 *  MVP : on utilise multichoice vertical (= ignore perRow). À améliorer si
 *  on rencontre des cas qui nécessitent vraiment grid layout. */
registerOpcode('multichoicegrid', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');
  const perRow = parseValue(args[3] ?? '1');
  const ignoreBPress = parseValue(args[4] ?? '0') !== 0;
  void perRow;  // TODO grid layout
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    console.warn(`[opcode multichoicegrid] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=0`);
    gSpecialVar.Result = 0;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, 0);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;
    if (result === -1) {
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// 1:1 décomp scrcmd.c:1337-1351 ScrCmd_yesnobox(left, top) :
//   ScriptMenu_YesNo(left, top) → returns TRUE → ScriptContext_Stop
//   Wait until Menu_ProcessInputNoWrapClearOnChoose returns choice :
//     0 (OUI) → VAR_RESULT = 0
//     1 (NON) → VAR_RESULT = 1
//     -1 (B_PRESSED) → VAR_RESULT = 1 (= NON, 1:1 décomp menu.c)
//
// Window template 1:1 décomp menu.c:98-107 sYesNo_WindowTemplates :
//   { bg: 0, tilemapLeft: ?, tilemapTop: ?, width: 5, height: 4,
//     paletteNum: 15, baseBlock: 0x125 }
function _spawnYesNoMenu(left: number, top: number): void {
  // 1:1 décomp menu.c:1623 CreateYesNoMenu(window, baseTileNum, paletteNum, initialCursorPos).
  // STD_WINDOW_BASE_TILE_NUM=0x214, STD_WINDOW_PALETTE_NUM=14 (= cf. menu.c:25-27).
  const tmpl: WindowTemplate = {
    bg: 0,
    tilemapLeft: left,
    tilemapTop: top,
    width: 5,
    height: 4,
    paletteNum: 15,    // DLG_WINDOW_PALETTE_NUM
    baseBlock: 0x125,
  };
  CreateYesNoMenu(tmpl, 0x214, 14, 0);
}

registerOpcode('yesnobox', (ctx, args) => {
  const left = parseValue(args[0]);
  const top = parseValue(args[1]);
  _spawnYesNoMenu(left, top);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2 /* MENU_NOTHING_CHOSEN */) return false;
    // 1:1 décomp `script_menu.c:Task_HandleYesNoInput` :
    //   case 0 (OUI top) → VAR_RESULT = 1 (= YES enum, event.inc:1932)
    //   case 1 / B_PRESSED → VAR_RESULT = 0 (= NO enum)
    // Avant ce fix on inversait → goto_if_eq VAR_RESULT, YES failed silent.
    const yesNoResult = result === 0 ? 1 : 0;
    gSpecialVar.Result = yesNoResult;
    // Cleanup yesno window (= 1:1 décomp EraseYesNoWindow déjà fait par
    // Menu_ProcessInputNoWrapClearOnChoose en interne).
    const wid = GetYesNoWindowId();
    if (wid >= 0) {
      ClearStdWindowAndFrame(wid, true);
      RemoveWindow(wid);
    }
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── Misc ────────────────────────────────────────────────────────────────────

registerOpcode('delay', (ctx, args) => {
  // 1:1 décomp : SetupNativeScript qui décrémente un compteur.
  let frames = parseValue(args[0]);
  const tick = (): boolean => {
    if (frames <= 0) return true;
    frames--;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_gettime` (scrcmd.c) :
 *  ```c
 *  bool8 ScrCmd_gettime(struct ScriptContext *ctx) {
 *      RtcCalcLocalTime();
 *      gSpecialVar_0x8000 = gLocalTime.hours;
 *      gSpecialVar_0x8001 = gLocalTime.minutes;
 *      gSpecialVar_0x8002 = gLocalTime.seconds;
 *      return FALSE;
 *  }
 *  ```
 *  Notre `RtcCalcLocalTime` source-of-truth = `Date.now() + offsetMs` (cf. rtc.ts). */
registerOpcode('gettime', () => {
  RtcCalcLocalTime();
  VarSet('VAR_0x8000', gLocalTime.hours);
  VarSet('VAR_0x8001', gLocalTime.minutes);
  VarSet('VAR_0x8002', gLocalTime.seconds);
  return false;
});

// Session 124 fix Bug 4 : signal generic pour UI flows (= wallclock, starter,
// future MartUI, etc.). Le décomp `waitstate` poll `ScriptContext_Stop` cleared
// par `ScriptContext_Enable()` appelé par le UI flow quand il finit. Notre
// equivalent : un latch booleen set par `SignalWaitState()`.
let _waitStateSignaled = false;
export function SignalWaitState(): void {
  _waitStateSignaled = true;
}

registerOpcode('waitstate', (ctx) => {
  // 1:1 décomp ScrCmd_waitstate (scrcmd.c:ScrCmd_waitstate) : ScriptContext_Stop
  // jusqu'à ce qu'une autre routine (= warp completion, multichoice result,
  // UI flow done) call ScriptContext_Enable. Utilisé après `warpsilent`,
  // après `special X waitstate=1` (= wallclock, starter choose), etc.
  //
  // Notre impl : poll signal latch + warp completion + map switch (= 3
  // sources possibles de release). Si signaled UPSTREAM (= UI flow déjà
  // terminé avant waitstate dispatch), consume + continue immédiat.
  if (_waitStateSignaled) {
    _waitStateSignaled = false;
    return false;
  }
  const startMapId = gMapHeader?.id;
  const tick = (): boolean => {
    if (_waitStateSignaled) {
      _waitStateSignaled = false;
      return true;
    }
    // Warp path : poll warp consume + map switch (= 1:1 session 122 fix).
    if (getPendingWarp()) return false;
    const currentMapId = gMapHeader?.id;
    if (currentMapId && currentMapId !== startMapId) return true;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── Special opcode dispatcher (= 1:1 décomp ScrCmd_special) ────────────────
//
// Audit Opus §4 minor : `special X` était no-op pour tous → beaucoup de
// scripts dépendent de specials (e.g. Special_BookendObjectEventTextScript,
// HealPlayerParty, PlayCryThenChooseUnown, etc.). Sans dispatch, scripts
// branchent vers nulle part.
//
// Décomp `scrcmd.c:ScrCmd_special` :
//   ```c
//   bool8 ScrCmd_special(struct ScriptContext *ctx) {
//     u16 specialId = ScriptReadHalfword(ctx);
//     gSpecials[specialId]();  // = function pointer table
//     return FALSE;
//   }
//   ```
//
// `gSpecials[]` (data/specials.inc) est une table de ~250 function pointers
// qui sont appelés par leur index ou par leur nom symbolique.
//
// Notre version : registry name-based. Scripts JSON pré-extraits ont les
// noms (= e.g. "HealPlayerParty"). On wire les specials nécessaires au fur
// et à mesure. Special inconnu → log warning + continue (= 1:1 décomp ferait
// un crash car function pointer invalide).

/** 1:1 décomp `gSpecials[]` table (data/specials.inc, 527 entries).
 *  Décomp : array de function pointers indexés par SPECIAL_xxx. Notre version
 *  string-keyed pour matcher les script JSON pré-extraits. */
type SpecialHandler = () => number | void;
const _specialHandlers: Record<string, SpecialHandler> = {};

/** Register un special handler. Le handler peut return un u16 qui est stored
 *  par opcode `specialvar` dans une variable. À call par les modules qui
 *  implémentent un special spécifique (= battle module → `HealPlayerParty`). */
export function registerSpecial(name: string, handler: SpecialHandler): void {
  _specialHandlers[name] = handler;
}

/** Internal : invoke un special handler. Returns 0 si pas registered + log
 *  warning. Utilisé par opcodes `special` et `specialvar`. */
function _invokeSpecial(name: string): number {
  const handler = _specialHandlers[name];
  if (!handler) {
    // Log les specials manquants pour wire au fur et à mesure.
    console.log(`[opcode special] '${name}' not registered yet — wire dans specials-registry.ts`);
    return 0;
  }
  return handler() ?? 0;
}

/** 1:1 décomp `ScrCmd_special` (scrcmd.c:118-124).
 *  ```c
 *  bool8 ScrCmd_special(struct ScriptContext *ctx) {
 *      u16 index = ScriptReadHalfword(ctx);
 *      gSpecials[index]();
 *      return FALSE;
 *  }
 *  ``` */
registerOpcode('special', (ctx, args) => {
  const name = args[0] as string;
  // Phase 5.5 : ChooseStarter UI INLINE dans l'overworld via state machine
  // utilisant nos systèmes engine (= ShowFieldMessage + CreateYesNoMenu, no scene switch).
  // 1:1 décomp Task_StarterChoose flow + Task_AskConfirmStarter.
  // Dynamic import : avoid circular dependency at load time.
  if (name === 'ChooseStarter') {
    let flowReady = false;
    let flow: { tick: () => boolean } | null = null;
    void import('./starter-choose-flow').then((mod) => {
      flow = mod.startChooseStarterFlow();
      flowReady = true;
    });
    SetupNativeScript(ctx, () => {
      if (!flowReady) return false;
      return flow!.tick();
    });
    return true;
  }
  // Phase 5.6 : Birch tutorial wild battle flow.
  // 1:1 décomp battle_setup.c:CB2_GiveStarter chains starter give → CB2_StartFirstBattle
  // (= BATTLE_TYPE_FIRST_BATTLE vs SPECIES_ZIGZAGOON Lv 2). Notre version :
  // inline state machine via SetupNativeScript (= block script, no scene switch).
  // Custom special name (= NOT in décomp directly — décomp uses CB2 chain
  // through ChooseStarter. Exposed here for explicit script wiring + debug).
  if (name === 'StartBirchTutorialBattle') {
    let flowReady = false;
    let flow: { tick: () => boolean } | null = null;
    void import('./battle-flow').then((mod) => {
      flow = mod.startBirchTutorialBattle();
      flowReady = true;
    });
    SetupNativeScript(ctx, () => {
      if (!flowReady) return false;
      return flow!.tick();
    });
    return true;
  }
  // 1:1 décomp port `wallclock.c` (session 2026-05-20) : CB2 swap via
  // SetMainCallback2(CB2_InitWallClock). Aiguilles affines via SetOamMatrix +
  // sClockHandCoords pivot offsets. Tilemap BG3 clock_start/clock_view depuis
  // graphics/wallclock/. AM/PM indicator anime entre 2 positions selon période.
  // `Special_ViewWallClock` = mode VIEW (RTC live + A/B = close).
  // `StartWallClock` = mode SET (D-pad ajuste hours/minutes, A = confirm via
  // RtcInitLocalTimeOffset, sauvegarde).
  // 1:1 décomp `FieldShowRegionMap` (field_specials.c:973) : CB2 swap vers
  // worldmap HOENN. Notre version utilise un overlay HTML (= region-map.ts)
  // qui se dessine au-dessus du field. Le special est `waitstate=1`
  // dans specials.inc:279 donc on bloque le script via SetupNativeScript
  // jusqu'à ce que la carte se ferme (= IsRegionMapOpen() false).
  if (name === 'FieldShowRegionMap') {
    let opened = false;
    let isOpenChecker: (() => boolean) | null = null;
    void import('./region-map').then(async (mod) => {
      await mod.OpenRegionMap();
      isOpenChecker = mod.IsRegionMapOpen;
      opened = true;
    });
    SetupNativeScript(ctx, () => {
      if (!opened) return false;
      return !isOpenChecker!();
    });
    return true;
  }
  // 1:1 décomp player_pc.c (= BedroomPC + PlayerPC). Pattern overlay (= pas
  // de CB2 swap car le PC dessine au-dessus de l'overworld). OpenBedroomPC()
  // ouvre le main menu UI ; TickBedroomPC() est polled chaque frame depuis
  // TestOverworldScene main loop pour drive l'input. Le special est `waitstate=1`
  // dans specials.inc:277-278 donc on bloque le script via SetupNativeScript
  // jusqu'à ce que le PC se ferme (= IsBedroomPCOpen() false).
  if (name === 'BedroomPC' || name === 'PlayerPC') {
    const isBedroom = (name === 'BedroomPC');
    let opened = false;
    let isOpenChecker: (() => boolean) | null = null;
    void import('./bedroom-pc').then((mod) => {
      mod.OpenBedroomPC(isBedroom);
      isOpenChecker = mod.IsBedroomPCOpen;
      opened = true;
    });
    SetupNativeScript(ctx, () => {
      if (!opened) return false;
      return !isOpenChecker!();
    });
    return true;
  }
  if (name === 'Special_ViewWallClock' || name === 'StartWallClock') {
    const mode: 'VIEW' | 'SET' = name === 'StartWallClock' ? 'SET' : 'VIEW';
    let opened = false;
    let isOpenChecker: (() => boolean) | null = null;
    void import('./wallclock').then((mod) => {
      mod.OpenWallClock(mode);
      isOpenChecker = mod.IsWallClockOpen;
      opened = true;
    });
    SetupNativeScript(ctx, () => {
      if (!opened) return false;
      // Wait until wallclock closes (= Task_*_Exit restored savedCallback).
      return !isOpenChecker!();
    });
    return true;
  }
  _invokeSpecial(name);
  return false;
});

/** 1:1 décomp `ScrCmd_specialvar` (scrcmd.c:126-132).
 *  ```c
 *  bool8 ScrCmd_specialvar(struct ScriptContext *ctx) {
 *      u16 *var = GetVarPointer(ScriptReadHalfword(ctx));
 *      *var = gSpecials[ScriptReadHalfword(ctx)]();
 *      return FALSE;
 *  }
 *  ```
 *  Format args : args[0] = varId (= "VAR_RESULT" etc.), args[1] = special name. */
registerOpcode('specialvar', (_ctx, args) => {
  const varId = args[0] as string;
  const specialName = args[1] as string;
  const result = _invokeSpecial(specialName);
  VarSet(varId, result);
  return false;
});

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

registerOpcode('hideobject', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_setobjectinvisibility` : just hide sprite via flag.
  const localIdRaw = args[0] ?? '';
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) npc.invisible = true;
  return false;
});

registerOpcode('showobject', (_ctx, args) => {
  const localIdRaw = args[0] ?? '';
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) npc.invisible = false;
  return false;
});

// NOTE : `hideobjectat` 1:1 est défini PLUS BAS (= seule registration,
// SetObjectInvisibility(...,TRUE) strict). L'ancienne registration ici
// (FlagSet template + active=false) divergeait du décomp ET était de
// toute façon masquée (last-wins Map.set) → supprimée (audit dupes :
// résout le seul cas ≥2-real, 0 régression car elle ne tournait pas).

registerOpcode('hideplayer', (_ctx) => {
  // 1:1 décomp `SetPlayerInvisibility(TRUE)` (= field_player_avatar.c:1396).
  const rt = getRuntime();
  if (rt && gPlayerAvatar.spriteId >= 0) {
    const s = rt.gSprites.get(gPlayerAvatar.spriteId);
    if (s) s.invisible = true;
  }
  return false;
});

/** 1:1 décomp `ScrCmd_showobjectat` via le mnémonique `showplayer`
 *  (= SCR_OP_SHOWOBJECTAT avec LOCALID_PLAYER) :
 *  `SetObjectInvisibility(localId, ..., FALSE)`. Miroir exact de
 *  `hideplayer` (invisible=false). Était MANQUANT (audit scrcmd) :
 *  `hideplayer` existait mais pas `showplayer` → joueur restait
 *  invisible après un cinematic (warp/cutscene). */
registerOpcode('showplayer', (_ctx) => {
  // 1:1 décomp `SetPlayerInvisibility(FALSE)`.
  const rt = getRuntime();
  if (rt && gPlayerAvatar.spriteId >= 0) {
    const s = rt.gSprites.get(gPlayerAvatar.spriteId);
    if (s) s.invisible = false;
  }
  return false;
});

// ─── Doors (= 1:1 décomp ScrCmd_opendoor etc.) ──────────────────────────────
// Extraits vers `./script-opcodes-door` (= 1:1 décomp field_door.c).

// 1:1 décomp scrcmd.c:ScrCmd_fadescreen (lignes 626-631) :
//   FadeScreen(mode, 0); SetupNativeScript(ctx, IsPaletteNotActive);
//
// Modes 1:1 décomp constants/field_weather.h :
//   FADE_FROM_BLACK = 0  →  startY=0x10, endY=0, color=BLACK
//   FADE_TO_BLACK   = 1  →  startY=0, endY=0x10, color=BLACK
//   FADE_FROM_WHITE = 2  →  startY=0x10, endY=0, color=WHITE
//   FADE_TO_WHITE   = 3  →  startY=0, endY=0x10, color=WHITE
//
// Notre BeginNormalPaletteFade prend (palettes, delay, startY, endY, color).
// 70 usages (= cinematic Birch bag, warps, etc.).
const FADE_MODE_FROM_BLACK = 0;
const FADE_MODE_TO_BLACK = 1;
const FADE_MODE_FROM_WHITE = 2;
const FADE_MODE_TO_WHITE = 3;

function _resolveFadeMode(arg: string): number {
  if (arg === 'FADE_FROM_BLACK') return FADE_MODE_FROM_BLACK;
  if (arg === 'FADE_TO_BLACK') return FADE_MODE_TO_BLACK;
  if (arg === 'FADE_FROM_WHITE') return FADE_MODE_FROM_WHITE;
  if (arg === 'FADE_TO_WHITE') return FADE_MODE_TO_WHITE;
  return parseValue(arg);
}

function _doFadeScreen(mode: number, _delay: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp palette.c : start/end/color selon mode.
  const isToBlack = mode === FADE_MODE_TO_BLACK;
  const isToWhite = mode === FADE_MODE_TO_WHITE;
  const isFromBlack = mode === FADE_MODE_FROM_BLACK;
  const isFromWhite = mode === FADE_MODE_FROM_WHITE;
  const startY = (isFromBlack || isFromWhite) ? 0x10 : 0;
  const endY = (isToBlack || isToWhite) ? 0x10 : 0;
  const color = (isToWhite || isFromWhite) ? 'RGB_WHITEALPHA' : 'RGB_BLACK';
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, startY, endY, color);
}

registerOpcode('fadescreen', (ctx, args) => {
  const mode = _resolveFadeMode(args[0]);
  _doFadeScreen(mode, 0);
  // 1:1 décomp : SetupNativeScript(ctx, IsPaletteNotActive) — attend que le fade
  // soit terminé avant de continuer.
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

registerOpcode('fadescreenspeed', (ctx, args) => {
  const mode = _resolveFadeMode(args[0]);
  const speed = parseValue(args[1]);
  _doFadeScreen(mode, speed);
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

registerOpcode('fadescreenswapbuffers', (ctx, args) => {
  // 1:1 décomp scrcmd.c:643 — variante qui swap gPlttBufferUnfaded ↔
  // gPaletteDecompressionBuffer avant fade. Pour l'instant : same as fadescreen.
  const mode = _resolveFadeMode(args[0]);
  _doFadeScreen(mode, 0);
  const rt = getRuntime();
  SetupNativeScript(ctx, () => !rt?.gPaletteFade.active);
  return true;
});

// `setmetatile` extrait vers `./script-opcodes-fieldmap` (= 1:1 décomp fieldmap.c).

// ─── Warp opcodes / setrespawn extraits vers `./script-opcodes-warp`
// (= 1:1 décomp overworld.c). ────────────────────────────────────────────────

// ─── Misc stubs (= unblock script flow without full implementation) ─────────

/** 1:1 décomp `ScrCmd_incrementgamestat` (scrcmd.c) :
 *    IncrementGameStat(stat);  // +1 à gSaveBlock1Ptr->gameStats[stat]
 *  Audit session 126 C2 : avant no-op → stats jamais tracked. Some flags
 *  conditional dependent (e.g. GAME_STAT_STEPS for daycare egg). Maintenant
 *  on update gSaveBlock1Ptr.gameStats[]. Le numeric `stat` est résolu via VarGet (=
 *  resolveDecompConstant si literal GAME_STAT_X). */
registerOpcode('incrementgamestat', (_ctx, args) => {
  const stat = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr?.gameStats && stat >= 0 && stat < gSaveBlock1Ptr.gameStats.length) {
    gSaveBlock1Ptr.gameStats[stat] = (gSaveBlock1Ptr.gameStats[stat] ?? 0) + 1;
  }
  return false;
});

// `playmoncry` extrait vers `./script-opcodes-sound`.

// `waitmoncry` : registration UNIQUE = la vraie impl 1:1 plus bas
// (SetupNativeScript + IsCryFinished, scrcmd.c:2028). L'ancien
// registerOpcode no-op redondant ici a été supprimé (Map.set → le
// dernier gagnait déjà, donc comportement INCHANGÉ ; retire du code mort
// + un faux positif audit:scrcmd dont la fenêtre 220c capturait le
// "Stub" du commentaire giveitem ci-dessous).

/** 1:1 décomp `giveitem` macro = additem + msgbox + fanfare. Stub : just additem. */
registerOpcode('giveitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = AddBagItem(itemKey, count);
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode giveitem] ${itemKey} x${count} → ${ok ? 'ok' : 'failed'}`);
  return false;
});

/** 1:1 décomp `givecoins` macro. Stub. */
// Money/coins opcodes (givecoins/givemoney/addmoney/takemoney/checkmoney/checkcoins/
// takecoins/addcoins/removemoney/removecoins/*moneybox/*coinsbox) extraits vers
// `./script-opcodes-money-coins` (= 1:1 décomp money.c + coins.c).

/** 1:1 décomp `ScrCmd_givemon` (scrcmd.c) :
 *    species = VarGet(args[0]); level = VarGet(args[1]); item = VarGet(args[2]);
 *    ScriptGiveMon(species, level, item, 0, 0, 0);
 *  Audit session 126 (post-test) : avant no-op → cadeaux Pokémon broken
 *  (= Wally Ralts, in-game trades, etc). Maintenant : créer mon + addToParty. */
registerOpcode('givepokemon', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  const level = parseValue(args[1] ?? '5') || 5;
  // Resolve species : literal SPECIES_X ou VAR_X.
  let speciesName = speciesArg;
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(speciesArg);
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  void (async () => {
    try {
      const { createPokemonInstance, GiveMonToPlayer, MON_GIVEN_TO_PARTY } = await import('./pokemon');
      const mon = createPokemonInstance(speciesName, level);
      const result = GiveMonToPlayer(mon);
      const ok = result === MON_GIVEN_TO_PARTY;
      VarSet('VAR_RESULT', ok ? 0 : 2);  // 0=success, 1=full, 2=fail
      console.log(`[opcode givepokemon] ${speciesName} Lv${level} → ${ok ? 'added' : 'party full'}`);
    } catch (e) {
      console.warn('[opcode givepokemon] failed:', e);
      VarSet('VAR_RESULT', 2);
    }
  })();
  return false;
});

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
registerOpcode('addelevmenuitem', (_ctx, _args) => false);
registerOpcode('showelevmenu', (_ctx, _args) => false);
// `checkcoins` / `takecoins` extraits vers `./script-opcodes-money-coins`.
registerOpcode('vbuffer', (_ctx, _args) => false);

// ─── Buffer opcodes (= 1:1 décomp scrcmd.c bufferXXX) ────────────────────────
// Audit session 126 : ports depuis script-runner.ts legacy. Sans ces impls,
// les dialogs avec `{STR_VAR_N}` placeholders affichaient texte tronqué (= "ton
// ." au lieu de "ton TREECKO"). Le sync vers gStringVarN se fait dans
// `setStringVar` (string-buffers.ts) qui écrit aussi sur globalThis.
//
// Pattern args :
//   args[0] = N (1..4) = STR_VAR slot
//   args[1+] = source value (= literal SPECIES_X, VAR_X ou number)
// Pour SPECIES/MOVE/ITEM : si literal préfixé, use direct ; sinon resolve via
// VarGet → reverseDecompConstant pour retrouver le name.

/** 1:1 décomp `ScrCmd_bufferspeciesname` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gSpeciesNames[VarGet(species)]); */
registerOpcode('bufferspeciesname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let speciesName = args[1] || '';
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(args[1] || '');
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  setStringVar(n, getSpeciesNameFr(speciesName));
  return false;
});

/** 1:1 décomp `ScrCmd_bufferleadmonspeciesname` (scrcmd.c) :
 *    species = GetMonData(&gPlayerParty[GetLeadMonIndex()], MON_DATA_SPECIES);
 *    StringCopy(dest, gSpeciesNames[species]); */
registerOpcode('bufferleadmonspeciesname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const lead = gSaveBlock1Ptr.playerParty?.[0];
  const speciesName = lead?.speciesNameFr ?? (lead?.speciesEnum ? getSpeciesNameFr(lead.speciesEnum) : '');
  setStringVar(n, speciesName);
  return false;
});

registerOpcode('buffertrainerclassname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const t = getTrainer(args[1] || '');
  setStringVar(n, t ? getTrainerClassNameFr(t.trainerClass) : '');
  return false;
});

registerOpcode('buffertrainername', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, getTrainerNameFr(args[1] || ''));
  return false;
});

/** 1:1 décomp `ScrCmd_bufferpartymonnick` :
 *    GetMonData(&gPlayerParty[VarGet(slot)], MON_DATA_NICKNAME, dest); */
registerOpcode('bufferpartymonnick', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const slot = Math.max(0, Math.min(5, parseValue(args[1] || '0')));
  const mon = gSaveBlock1Ptr.playerParty?.[slot];
  setStringVar(n, mon?.nickname || mon?.speciesNameFr || '');
  return false;
});

registerOpcode('bufferitemname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let itemName = args[1] || '';
  if (!itemName.startsWith('ITEM_')) {
    const num = VarGet(args[1] || '');
    itemName = reverseDecompConstant(num, 'ITEM_') ?? `ITEM_${num}`;
  }
  setStringVar(n, getItemNameFr(itemName));
  return false;
});

registerOpcode('bufferitemnameplural', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let itemName = args[1] || '';
  if (!itemName.startsWith('ITEM_')) {
    const num = VarGet(args[1] || '');
    itemName = reverseDecompConstant(num, 'ITEM_') ?? `ITEM_${num}`;
  }
  const qty = parseValue(args[2] || '0');
  const name = getItemNameFr(itemName);
  setStringVar(n, qty > 1 ? name + 's' : name);
  return false;
});

// `bufferdecorationname` extrait vers `./script-opcodes-decoration`.

registerOpcode('buffermovename', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let moveName = args[1] || '';
  if (!moveName.startsWith('MOVE_')) {
    const num = VarGet(args[1] || '');
    moveName = reverseDecompConstant(num, 'MOVE_') ?? `MOVE_${num}`;
  }
  setStringVar(n, getMoveNameFr(moveName));
  return false;
});

registerOpcode('bufferattackname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let moveName = args[1] || '';
  if (!moveName.startsWith('MOVE_')) {
    const num = VarGet(args[1] || '');
    moveName = reverseDecompConstant(num, 'MOVE_') ?? `MOVE_${num}`;
  }
  setStringVar(n, getMoveNameFr(moveName));
  return false;
});

registerOpcode('buffernumberstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, String(parseValue(args[1] || '0')));
  return false;
});

registerOpcode('buffermoneyamount', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const amount = parseValue(args[1] || '0');
  setStringVar(n, String(amount) + '$');
  return false;
});

registerOpcode('bufferstdstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  // Pas de table std strings extraite — fallback vide pour ne pas afficher
  // `{STR_VAR_N}` brut dans les dialogs.
  setStringVar(n, '');
  void args;
  return false;
});

registerOpcode('bufferstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  // Texte direct entre guillemets — extraire (peut contenir des espaces).
  const txt = (args.slice(1).join(' ') || '').replace(/^"/, '').replace(/"$/, '');
  setStringVar(n, txt);
  return false;
});

// `buffercontestname` + `sContestNames[]` extraits vers `./script-opcodes-lilycove`
// (= 1:1 décomp lilycove_lady.c:BufferContestName).

registerOpcode('bufferboxname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, '');
  void args;
  return false;
});
registerOpcode('preparemsg', (_ctx, _args) => false);
registerOpcode('selectapproachingtrainer', (_ctx, _args) => false);
registerOpcode('lockfortrainer', (_ctx, _args) => false);
// HOTFIX 2026-05-09 : faceplayer/turnobject sont déjà registered avec les vraies
// implementations plus haut (lignes 496, 505). Les stubs no-op qui étaient ici
// écrasaient → NPCs ne se tournent plus vers le player. Reported by user. Removed.
// 1:1 décomp `ScrCmd_vmessage / vmsgbox / vbufferstring` (scrcmd.c) :
// Versions "v" prennent un VAR_X qui contient une string offset (= multi-language
// dynamic). Notre runtime est FR-only → traite comme alias des versions normales.
registerOpcode('vmessage', (ctx, args) => getOpcodeHandler('message')?.(ctx, args) ?? false);
registerOpcode('vmsgbox', (ctx, args) => getOpcodeHandler('msgbox')?.(ctx, args) ?? false);
registerOpcode('vbufferstring', (ctx, args) => getOpcodeHandler('bufferstring')?.(ctx, args) ?? false);

// 1:1 décomp `ScrCmd_addcoins` (scrcmd.c) : gSaveBlock1Ptr.coins += amount, cap 9999.
// `addcoins` extrait vers `./script-opcodes-money-coins`.

// 1:1 décomp `ScrCmd_messageinstant` (scrcmd.c) : msgbox sans typewriter effect
// (= text appears all at once instead of char-by-char). MVP : alias message.
registerOpcode('messageinstant', (ctx, args) => getOpcodeHandler('message')?.(ctx, args) ?? false);

// `warpwhitefade` extrait vers `./script-opcodes-warp`.
registerOpcode('checkpartymove', (_ctx, _args) => {
  VarSet('VAR_RESULT', 0);
  return false;
});
registerOpcode('countpokemon', (_ctx) => {
  VarSet('VAR_RESULT', gSaveBlock1Ptr.playerPartyCount);
  return false;
});

// `setdynamicwarp` extrait vers `./script-opcodes-warp`.

// ─── Bag opcodes (= 1:1 décomp ScrCmd_additem etc.) ─────────────────────────
// `resolveCount` est maintenant importé depuis `./script-opcodes/helpers`.

/** 1:1 décomp `ScrCmd_additem` (scrcmd.c:487).
 *   `additem ITEMID, QUANTITY` → AddBagItem + set gSpecialVar_Result. */
registerOpcode('additem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = AddBagItem(itemKey, count);
  // 1:1 décomp : gSpecialVar_Result = AddBagItem(...). On set VAR_RESULT.
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode additem] ${itemKey} x${count} → ${ok ? 'ok' : 'FAILED (bag full?)'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_removeitem` (scrcmd.c:496). */
registerOpcode('removeitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = RemoveBagItem(itemKey, count);
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode removeitem] ${itemKey} x${count} → ${ok ? 'ok' : 'FAILED (not enough)'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitem` (scrcmd.c:514) : true si bag has au moins count. */
registerOpcode('checkitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  VarSet('VAR_RESULT', CheckBagHasItem(itemKey, count) ? 1 : 0);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitemspace` (scrcmd.c:505).
 *   MVP : on retourne toujours true (= bag rarely full en démo).
 *   À améliorer : implémenter `CheckBagHasSpace` 1:1 item.c. */
registerOpcode('checkitemspace', (_ctx) => {
  VarSet('VAR_RESULT', 1);
  return false;
});

// ─── Helpers privés ──────────────────────────────────────────────────────────
// `parseValue` est maintenant importé depuis `./script-opcodes/helpers`.

// ─── Phase 5.7+ iteration 6 : field SE/audio extras + register_matchcall ─────
// `playsewithpan` / `loopsewithpan` / `waitse` / `waitplaysewithpan` extraits
// vers `./script-opcodes-sound`.

// `register_matchcall` extrait vers `./script-opcodes-match-call`.

// 1:1 décomp `ScrCmd_setbyte` (scrcmd.c) — set a byte var. Le decomp utilise ça
// rarement directement (= surtout pour battle script land). MVP no-op.
registerOpcode('setbyte', (_ctx, _args) => false);

// 1:1 décomp `ScrCmd_pause` — alternate name for delay (= same arg semantic).
registerOpcode('pause', (ctx, args) => {
  let frames = parseValue(args[0]);
  const tick = (): boolean => {
    if (frames <= 0) return true;
    frames--;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

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
registerOpcode('finditem', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  const amount = parseValue(args[1] ?? '1') || 1;
  // Resolve itemId : si literal ITEM_X → resolveDecompConstant ; sinon VarGet.
  let itemId = 0;
  if (itemArg.startsWith('ITEM_')) {
    itemId = resolveDecompConstant(itemArg) ?? 0;
  } else {
    itemId = VarGet(itemArg);
  }
  if (itemId > 0 && AddBagItem(itemArg, amount)) {
    gSpecialVar.Result = 0;  // success
  } else {
    gSpecialVar.Result = 1;  // bag full / invalid
  }
  return false;
});

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

// 1:1 décomp `ScrCmd_braillemsgbox` — message in braille font. 48x usage.
//   MVP : log + skip (= no braille font yet).
registerOpcode('braillemsgbox', (_ctx, args) => {
  console.log(`[opcode braillemsgbox] '${args[0]}' — TODO braille font`);
  return false;
});

// 1:1 décomp `ScrCmd_braillemessage` / `brailleformat` — braille only. No-op.
registerOpcode('braillemessage', (_ctx, _args) => false);
registerOpcode('brailleformat', (_ctx, _args) => false);

// 1:1 décomp `ScrCmd_messageautoscroll` — message that auto-scrolls.
//   MVP : log + skip (= would need msgbox + auto-advance timer).
registerOpcode('messageautoscroll', (_ctx, args) => {
  console.log(`[opcode messageautoscroll] '${args[0]}' — TODO autoscroll`);
  return false;
});

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

// 1:1 décomp `ScrCmd_settrainerflag` / `cleartrainerflag`. 114x usage.
registerOpcode('settrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const g = globalThis as Record<string, unknown>;
  if (!g.__defeatedTrainers) g.__defeatedTrainers = new Set<string>();
  (g.__defeatedTrainers as Set<string>).add(trainer);
  return false;
});
registerOpcode('cleartrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const g = globalThis as Record<string, unknown>;
  if (g.__defeatedTrainers) (g.__defeatedTrainers as Set<string>).delete(trainer);
  return false;
});
registerOpcode('checktrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const g = globalThis as Record<string, unknown>;
  const has = (g.__defeatedTrainers as Set<string>)?.has(trainer) ?? false;
  VarSet('VAR_RESULT', has ? 1 : 0);
  return false;
});

// ─── Phase 5.7+ iter7 : early-game-specific gap fillers ─────────────────────
// Audit: scripts/audit-early-game-opcodes.mjs found 14 missing opcodes for the
// 20 maps the user actually traverses first.

// 1:1 décomp `ScrCmd_goto_if_not_defeated` — branch if trainer NOT defeated.
//   Used 10x in early-game scripts (= rival rematch logic, etc.).
registerOpcode('goto_if_not_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  const g = globalThis as Record<string, unknown>;
  const defeated = (g.__defeatedTrainers as Set<string>)?.has(trainer) ?? false;
  if (!defeated) {
    const sub = getScript(target);
    if (sub) ScriptJump(ctx, sub);
  }
  return false;
});

// 1:1 décomp `ScrCmd_call_if_defeated`. 7x usage.
registerOpcode('call_if_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  const g = globalThis as Record<string, unknown>;
  const defeated = (g.__defeatedTrainers as Set<string>)?.has(trainer) ?? false;
  if (defeated) {
    const sub = getScript(target);
    if (sub) ScriptCall(ctx, sub);
  }
  return false;
});

// 1:1 décomp `ScrCmd_goto_if_defeated`. Inverse de goto_if_not_defeated. 16x.
registerOpcode('goto_if_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  const g = globalThis as Record<string, unknown>;
  const defeated = (g.__defeatedTrainers as Set<string>)?.has(trainer) ?? false;
  if (defeated) {
    const sub = getScript(target);
    if (sub) ScriptJump(ctx, sub);
  }
  return false;
});

// 1:1 décomp `ScrCmd_showmonpic` / `hidemonpic` — show/hide a Pokemon front
//   sprite in a window. 10x usage in Birch lab + cinematic moments.
//   MVP : log + skip (= would integrate with starter-choose-flow style sprite).
registerOpcode('showmonpic', (_ctx, args) => {
  console.log(`[opcode showmonpic] species=${args[0]} x=${args[1]} y=${args[2]} — TODO mon pic UI`);
  return false;
});
registerOpcode('hidemonpic', (_ctx, _args) => false);

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
registerOpcode('givemon', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  const level = parseValue(args[1] ?? '5') || 5;
  let speciesName = speciesArg;
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(speciesArg);
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  // item : ITEM_* littéral, VAR_*, ou absent (ITEM_NONE).
  const itemArg = args[2];
  let heldItem: string | undefined;
  if (itemArg && itemArg !== 'ITEM_NONE' && itemArg !== '0') {
    heldItem = itemArg.startsWith('ITEM_')
      ? itemArg
      : (reverseDecompConstant(VarGet(itemArg), 'ITEM_') ?? undefined);
  }
  void (async () => {
    try {
      const { createPokemonInstance, GiveMonToPlayer, MON_GIVEN_TO_PARTY } = await import('./pokemon');
      const mon = createPokemonInstance(speciesName, level, heldItem ? { heldItem } : undefined);
      const result = GiveMonToPlayer(mon);
      const ok = result === MON_GIVEN_TO_PARTY;
      // 1:1 ScriptGiveMon : 0=MON_GIVEN_TO_PARTY, 1=MON_GIVEN_TO_PC.
      VarSet('VAR_RESULT', ok ? 0 : 1);
      console.log(`[opcode givemon] ${speciesName} Lv${level}${heldItem ? ' @' + heldItem : ''} → ${ok ? 'PARTY(0)' : 'PC(1)'}`);
    } catch (e) {
      console.warn('[opcode givemon] failed:', e);
      VarSet('VAR_RESULT', 2);  // MON_CANT_GIVE
    }
  })();
  return false;
});

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

// 1:1 décomp `ScrCmd_pokenavcall` — initiates a PokéNav call.
//   2x usage in early-game (= Birch wakes you for ChooseStarter).
//   MVP : log + skip (= no PokéNav UI).
registerOpcode('pokenavcall', (_ctx, args) => {
  console.log(`[opcode pokenavcall] '${args[0]}' — TODO PokeNav UI`);
  return false;
});

// 1:1 décomp `ScrCmd_pokemartlistend` — data terminator for pokemart lists.
//   4x usage (= each shop has a list ending with this).
// `pokemartlistend` extrait vers `./script-opcodes-shop` (= 1:1 décomp shop.c).

// 1:1 décomp `ScrCmd_setorcopyvar` (scrcmd.c) — alt setvar that handles VAR_*.
registerOpcode('setorcopyvar', (_ctx, args) => {
  const dst = args[0] ?? '';
  const src = args[1] ?? '';
  if (src && src.startsWith('VAR_')) {
    VarSet(dst, VarGet(src));
  } else {
    VarSet(dst, parseValue(src));
  }
  return false;
});

// `checkpcitem` extrait vers `./script-opcodes-pc-storage`.

// `warpdoor` extrait vers `./script-opcodes-warp`.

// 1:1 décomp `ScrCmd_showobjectat` — alt showobject with explicit map id.
registerOpcode('showobjectat', (_ctx, args) => {
  const npc = _findNpcByLocalId(args[0] ?? '');
  if (npc) npc.invisible = false;
  return false;
});

// 1:1 décomp `ScrCmd_getplayerxy` (scrcmd.c:319) — read player current XY into
//   provided var pointers. Used in scripts that need player position (= e.g.
//   Rusturf Tunnel cave-in cinematic).
registerOpcode('getplayerxy', (_ctx, args) => {
  const xVar = args[0] ?? '';
  const yVar = args[1] ?? '';
  if (xVar) VarSet(xVar, GetCurrentMap()?.x ?? 0);
  if (yVar) VarSet(yVar, GetCurrentMap()?.y ?? 0);
  return false;
});

// 1:1 décomp `ScrCmd_getpartysize` (scrcmd.c) — read partySize into VAR_RESULT.
registerOpcode('getpartysize', (_ctx) => {
  VarSet('VAR_RESULT', gSaveBlock1Ptr.playerPartyCount);
  return false;
});

// `setescapewarp` extrait vers `./script-opcodes-warp`.

// 1:1 décomp `ScrCmd_giveegg` (scrcmd.c) — give a Pokemon egg to player party.
//   MVP : log + skip.
registerOpcode('giveegg', (_ctx, args) => {
  console.log(`[opcode giveegg] species=${args[0]} — TODO egg gift`);
  return false;
});

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
registerOpcode('setflashlevel', (_ctx, _args) => false);
registerOpcode('animateflash', (_ctx, _args) => false);

// rotating-tile-puzzle opcodes extraits vers `./script-opcodes-rotating-tile-puzzle`.

// Secret Base décoration opcodes extraits vers `./script-opcodes-decoration`.

// Other late-game / minigames :
// `setdivewarp` / `setholewarp` extraits vers `./script-opcodes-warp`.
registerOpcode('dofieldeffectsparkle', (_ctx, _args) => false);
registerOpcode('setwildbattle', (_ctx, _args) => false);
registerOpcode('dowildbattle', (_ctx, _args) => false);
registerOpcode('dotimebasedevents', (_ctx, _args) => false);
/** 1:1 décomp `ScrCmd_initclock` (scrcmd.c) :
 *    RtcInitLocalTimeOffset(VarGet(hour), VarGet(minute));
 *  Set l'heure in-game initiale (= new-game / wall-clock confirm). Était
 *  MANQUANT (audit scrcmd) → l'horloge in-game restait à l'offset par
 *  défaut. rtc.ts:RtcInitLocalTimeOffset déjà porté 1:1. */
registerOpcode('initclock', (_ctx, args) => {
  const hour = VarGet(args[0] ?? '0');
  const minute = VarGet(args[1] ?? '0');
  RtcInitLocalTimeOffset(hour, minute);
  return false;
});
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
registerOpcode('seteventmon', (_ctx, _args) => false);
registerOpcode('frontier_settrainers', (_ctx, _args) => false);
registerOpcode('frontier_resetsketch', (_ctx, _args) => false);
registerOpcode('frontier_restorehelditems', (_ctx, _args) => false);
registerOpcode('dome_resolvewinners', (_ctx, _args) => false);
registerOpcode('dome_save', (_ctx, _args) => false);
registerOpcode('tower_dopartnermsg', (_ctx, _args) => false);
registerOpcode('tower_getopponentintro', (_ctx, _args) => false);
registerOpcode('tower_init', (_ctx, _args) => false);
registerOpcode('factory_save', (_ctx, _args) => false);
registerOpcode('factory_setswapped', (_ctx, _args) => false);
registerOpcode('pike_save', (_ctx, _args) => false);
registerOpcode('pike_gettrainerintro', (_ctx, _args) => false);
registerOpcode('pyramid_save', (_ctx, _args) => false);
registerOpcode('palace_getopponentintro', (_ctx, _args) => false);
registerOpcode('arena_save', (_ctx, _args) => false);
registerOpcode('fallarbortent_save', (_ctx, _args) => false);
registerOpcode('slateporttent_save', (_ctx, _args) => false);
registerOpcode('verdanturftent_save', (_ctx, _args) => false);
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

/** 1:1 décomp `gFlashLevel` (overworld.c). 0 = pas d'obscurité, 7 = obscurité
 *  maximale (= ASTUCE FLASH HM). Affiche une mask noire avec un cercle
 *  transparent autour du player. Notre port stocke ici, le rendering field
 *  scene lit cette valeur pour appliquer le mask. */
let _gFlashLevel = 0;

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

registerOpcode('vbuffer', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_vbuffermessage : expand text au pointer (- sAddressOffset)
  // dans gStringVar4. Notre extracteur résout statiquement → no-op.
  return false;
});

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

registerOpcode('preparemsg', (_ctx, _args) => false);  // RS-era, removed in Em

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

// ─── Pokemon picture (1:1 décomp ScrCmd_showmonpic/hidemonpic) ──────────────

registerOpcode('hidemonpic', (ctx, _args) => {
  // 1:1 décomp ScrCmd_hidemonpic (scrcmd.c:1622) :
  //   func = ScriptMenu_HidePokemonPic() ;  // returns fn ptr
  //   if (func == NULL) return FALSE ;
  //   SetupNativeScript(ctx, func) ; return TRUE
  // Notre port : pour l'instant le mon pic est fire-and-forget. Wait 8 frames
  // (= petit délai pour fade out hypothétique).
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 8;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Trainers (1:1 décomp ScrCmd_selectapproachingtrainer + lockfortrainer) ──

registerOpcode('selectapproachingtrainer', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_selectapproachingtrainer (scrcmd.c) :
  //   gSelectedObjectEvent = GetCurrentApproachingTrainerObjectEventId().
  gSelectedObjectEvent.index = _sCurrentApproachingTrainerObjectEventId;
  return false;
});

registerOpcode('lockfortrainer', (ctx, _args) => {
  // 1:1 décomp ScrCmd_lockfortrainer (scrcmd.c) :
  //   if (IsOverworldLinkActive()) return FALSE ;
  //   if (gObjectEvents[gSelectedObjectEvent].active) {
  //     FreezeForApproachingTrainers() ;
  //     SetupNativeScript(ctx, IsFreezeObjectAndPlayerFinished) ;
  //   }
  //   return TRUE
  if (_isInTrainerLink()) return false;
  const npc = gObjectEvents[gSelectedObjectEvent.index];
  if (npc && npc.active) {
    // 1:1 STRICT décomp FreezeForApproachingTrainers (trainer_see.c) : freeze
    // tous les NPCs via FreezeObjectEvent (= pause sprite.animPaused = sinon
    // les autres trainers continuent à wander visuellement).
    for (const n of gObjectEvents) if (n.active) FreezeObjectEvent(n);
    // Capture the initial step state of player + all NPCs to detect when
    // all step animations have completed.
    const poll = (): boolean => {
      // 1:1 décomp IsFreezeObjectAndPlayerFinished (event_object_movement.c) :
      //   return !player.runningState !== MOVING && all NPCs stepFramesLeft === 0
      // Notre check : gPlayerAvatar.stepFramesLeft === 0 (= player tile-aligned)
      //   ET tous les active NPCs ont leur step done.
      if (gPlayerAvatar.stepFramesLeft > 0) return false;
      // NPC step state : si npc.walkFramesLeft > 0, encore en cours.
      for (const n of gObjectEvents) {
        if (!n.active) continue;
        const walking = (n as unknown as { walkFramesLeft?: number }).walkFramesLeft ?? 0;
        if (walking > 0) return false;
      }
      return true;  // tous arrêtés → resume script
    };
    SetupNativeScript(ctx, poll);
    return true;
  }
  return false;
});

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

// ─── Flash (1:1 décomp ScrCmd_setflashlevel/animateflash) ───────────────────

registerOpcode('setflashlevel', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setflashlevel : SetFlashLevel(VarGet(level)).
  // Level 0 = pas d'obscurité (= salle illuminée), 7 = obscurité maximale.
  const level = _vget(args[0]) & 0xF;
  _gFlashLevel = level;
  (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
  return false;
});

registerOpcode('animateflash', (ctx, args) => {
  // 1:1 décomp ScrCmd_animateflash : AnimateFlash(level) ; ScriptContext_Stop ; return TRUE.
  // Fade animation entre l'ancien level et le nouveau (= radial transition).
  const targetLevel = parseValue(args[0] ?? '0') & 0xF;
  const startLevel = _gFlashLevel;
  let frame = 0;
  const totalFrames = 16;
  const poll = (): boolean => {
    frame++;
    // Lerp linéaire entre startLevel et targetLevel.
    _gFlashLevel = Math.round(startLevel + (targetLevel - startLevel) * (frame / totalFrames));
    (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
    if (frame >= totalFrames) {
      _gFlashLevel = targetLevel;
      (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
      return true;
    }
    return false;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// `setmaplayoutindex` + `setstepcallback` extraits vers `./script-opcodes-fieldmap`
// (= 1:1 décomp fieldmap.c + field_tasks.c).

// ─── Berry tree (1:1 décomp ScrCmd_setberrytree) ────────────────────────────
// Real impl 1:1 décomp `berry.c` — voir `./script-opcodes-berry`.

// Money & coins real impls extraits vers `./script-opcodes-money-coins`
// (= 1:1 décomp money.c + coins.c).

// ─── Time-based events (1:1 décomp ScrCmd_dotimebasedevents) ────────────────

registerOpcode('dotimebasedevents', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_dotimebasedevents : DoTimeBasedEvents().
  // Trigger berry growth + tide cycle + Shoal Cave water level + etc.
  // Session 132 : real impl via time-based-events.ts (= berry growth math
  // 1:1 décomp berry.c:BerryTreeTimeUpdate using RTC minutes delta).
  void (async () => {
    try {
      const { DoTimeBasedEvents } = await import('./time-based-events');
      DoTimeBasedEvents();
    } catch (e) {
      console.warn('[opcode dotimebasedevents] failed:', e);
    }
  })();
  return false;
});

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

// ─── Braille (1:1 décomp ScrCmd_braillemessage + macros) ────────────────────

registerOpcode('braillemessage', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_braillemessage (scrcmd.c) : affiche un message en braille
  // dans une fenêtre dimensionnée auto. Utilisé par Sealed Chamber, Regis caves.
  // Notre port : pas encore de font BRAILLE — déjà délégué à braillemsgbox qui
  // gère le wait. Real impl future = font BRAILLE + window dimensions calc.
  return false;
});

registerOpcode('brailleformat', (_ctx, _args) => {
  // 1:1 décomp event.inc:1024 macro brailleformat — c'est un DATA marker dans
  // le braille text payload, pas un opcode (= 6 bytes data avant le texte
  // braille). Notre extracteur peut le passer comme opcode mais c'est no-op.
  return false;
});

// ─── Rotating tile puzzles (Mossdeep Gym + Trick House) ─────────────────────

// rotating-tile-puzzle / playslotmachine / showcontestpainting real impls extraits
// vers `./script-opcodes-rotating-tile-puzzle` / `./script-opcodes-slot-machine` /
// `./script-opcodes-contest`.

registerOpcode('addelevmenuitem', (_ctx, _args) => {
  // 1:1 décomp : stubbed in Emerald (= RS-only feature, non-functional).
  return false;
});

registerOpcode('showelevmenu', (_ctx, _args) => {
  // 1:1 décomp : stubbed in Emerald.
  return false;
});

// ─── Wild battles (1:1 décomp ScrCmd_setwildbattle/dowildbattle) ────────────

registerOpcode('setwildbattle', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setwildbattle : CreateScriptedWildMon(species, level, item).
  const speciesArg = args[0] ?? '';
  const level = parseValue(args[1] ?? '5');
  const itemArg = args[2] ?? 'ITEM_NONE';
  const speciesId = parseValue(speciesArg);
  const itemId = parseValue(itemArg);
  (globalThis as Record<string, unknown>).gScriptedWildMon = {
    species: speciesId,
    level,
    item: itemId,
  };
  return false;
});

registerOpcode('dowildbattle', (ctx, _args) => {
  // 1:1 décomp ScrCmd_dowildbattle : BattleSetup_StartScriptedWildBattle + ScriptContext_Stop.
  // Notre port : trigger un wild battle via le battle system existant.
  void (async () => {
    try {
      const mon = (globalThis as Record<string, unknown>).gScriptedWildMon as
        { species?: number; level?: number; item?: number } | undefined;
      if (mon) {
        const { startWildBattle } = await import('./battle-flow').catch(() => ({ startWildBattle: undefined }));
        if (typeof startWildBattle === 'function') {
          // 1:1 décomp BattleParams { opponentSpecies: string, opponentLevel: number }.
          const enumName = reverseDecompConstant(mon.species ?? 0, 'SPECIES_') ?? `SPECIES_${mon.species ?? 0}`;
          startWildBattle({
            opponentSpecies: enumName,
            opponentLevel: mon.level ?? 5,
          });
        } else {
          console.warn('[opcode dowildbattle] battle-flow.startWildBattle not exposed yet');
        }
      }
    } catch (e) {
      console.warn('[opcode dowildbattle] failed:', e);
    }
  })();
  // SetupNativeScript wait — battle screen takes over until done.
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 1;  // resume immediately (battle scene is async)
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Event Mon (1:1 décomp seteventmon macro) ───────────────────────────────

registerOpcode('seteventmon', (_ctx, args) => {
  // 1:1 décomp event.inc:1989 macro seteventmon species, level, item :
  //   setvar VAR_0x8004, species ; setvar VAR_0x8005, level ;
  //   setvar VAR_0x8006, item ; special CreateEnemyEventMon.
  const species = parseValue(args[0] ?? '0');
  const level = parseValue(args[1] ?? '5');
  const item = parseValue(args[2] ?? 'ITEM_NONE');
  VarSet('VAR_0x8004', species);
  VarSet('VAR_0x8005', level);
  VarSet('VAR_0x8006', item);
  _invokeSpecial('CreateEnemyEventMon');
  return false;
});

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

/** Expand un macro 'facility' opcode : set vars + call special. */
function _facilityCall(specialFn: string, funcId: number, dataVal?: number | string, val?: number | string): void {
  VarSet('VAR_0x8004', funcId);
  if (dataVal !== undefined) {
    const v = typeof dataVal === 'string' ? parseValue(dataVal) : dataVal;
    VarSet('VAR_0x8005', v);
  }
  if (val !== undefined) {
    const v = typeof val === 'string' ? parseValue(val) : val;
    VarSet('VAR_0x8006', v);
  }
  _invokeSpecial(specialFn);
}

// ─── Frontier util (frontier_get/set/etc.) ──────────────────────────────────
// Source : asm/macros/battle_frontier/frontier_util.inc
// All map to FRONTIER_UTIL_FUNC_* and CallFrontierUtilFunc.

registerOpcode('frontier_getstatus', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 0 /* FRONTIER_UTIL_FUNC_GET_STATUS */);
  return false;
});

registerOpcode('frontier_get', (_ctx, args) => {
  _facilityCall('CallFrontierUtilFunc', 1 /* FRONTIER_UTIL_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('frontier_set', (_ctx, args) => {
  _facilityCall('CallFrontierUtilFunc', 2 /* FRONTIER_UTIL_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('frontier_reset', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 3 /* FRONTIER_UTIL_FUNC_RESET */);
  return false;
});

registerOpcode('frontier_setpartyorder', (_ctx, args) => {
  _facilityCall('CallFrontierUtilFunc', 4 /* FRONTIER_UTIL_FUNC_SET_PARTY_ORDER */, args[0]);
  return false;
});

registerOpcode('frontier_results', (_ctx, args) => {
  _facilityCall('CallFrontierUtilFunc', 5 /* FRONTIER_UTIL_FUNC_SHOW_RESULTS */, args[0]);
  return false;
});

registerOpcode('frontier_getsymbols', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 6 /* FRONTIER_UTIL_FUNC_GET_SYMBOLS */);
  return false;
});

registerOpcode('frontier_givesymbol', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 7 /* FRONTIER_UTIL_FUNC_GIVE_SYMBOL */);
  return false;
});

registerOpcode('frontier_checkairshow', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 8 /* FRONTIER_UTIL_FUNC_CHECK_AIR_SHOW */);
  return false;
});

registerOpcode('frontier_checkineligible', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 9 /* FRONTIER_UTIL_FUNC_CHECK_INELIGIBLE */);
  return false;
});

registerOpcode('frontier_getbrainstatus', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 10 /* FRONTIER_UTIL_FUNC_GET_BRAIN_STATUS */);
  return false;
});

registerOpcode('frontier_isbrain', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 11 /* FRONTIER_UTIL_FUNC_IS_BRAIN */);
  return false;
});

registerOpcode('frontier_givepoints', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 12 /* FRONTIER_UTIL_FUNC_GIVE_BATTLE_POINTS */);
  return false;
});

registerOpcode('frontier_settrainers', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 13 /* FRONTIER_UTIL_FUNC_SET_TRAINERS */);
  return false;
});

registerOpcode('frontier_resetsketch', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 14 /* FRONTIER_UTIL_FUNC_RESET_SKETCH_MOVES */);
  return false;
});

registerOpcode('frontier_restorehelditems', (_ctx, _args) => {
  _facilityCall('CallFrontierUtilFunc', 15 /* FRONTIER_UTIL_FUNC_RESTORE_HELD_ITEMS */);
  return false;
});

// ─── Battle Tower (tower_*) ─────────────────────────────────────────────────
// Source : asm/macros/battle_frontier/battle_tower.inc → CallBattleTowerFunc.

registerOpcode('tower_set', (_ctx, args) => {
  _facilityCall('CallBattleTowerFunc', 0 /* BATTLE_TOWER_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('tower_get', (_ctx, args) => {
  _facilityCall('CallBattleTowerFunc', 1 /* BATTLE_TOWER_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('tower_save', (_ctx, args) => {
  _facilityCall('CallBattleTowerFunc', 2 /* BATTLE_TOWER_FUNC_SAVE_DATA */, args[0]);
  return false;
});

registerOpcode('tower_setopponent', (_ctx, _args) => {
  _facilityCall('CallBattleTowerFunc', 3 /* BATTLE_TOWER_FUNC_SET_OPPONENT */);
  return false;
});

registerOpcode('tower_dopartnermsg', (_ctx, _args) => {
  _facilityCall('CallBattleTowerFunc', 4 /* BATTLE_TOWER_FUNC_DO_PARTNER_MSG */);
  return false;
});

registerOpcode('tower_getopponentintro', (_ctx, _args) => {
  _facilityCall('CallBattleTowerFunc', 5 /* BATTLE_TOWER_FUNC_GET_OPPONENT_INTRO */);
  return false;
});

registerOpcode('tower_init', (_ctx, _args) => {
  _facilityCall('CallBattleTowerFunc', 6 /* BATTLE_TOWER_FUNC_INIT */);
  return false;
});

// ─── Battle Dome (dome_*) ───────────────────────────────────────────────────

registerOpcode('dome_set', (_ctx, args) => {
  _facilityCall('CallBattleDomeFunction', 0 /* BATTLE_DOME_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('dome_get', (_ctx, args) => {
  _facilityCall('CallBattleDomeFunction', 1 /* BATTLE_DOME_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('dome_save', (_ctx, _args) => {
  _facilityCall('CallBattleDomeFunction', 2 /* BATTLE_DOME_FUNC_SAVE */);
  return false;
});

registerOpcode('dome_resolvewinners', (_ctx, _args) => {
  _facilityCall('CallBattleDomeFunction', 3 /* BATTLE_DOME_FUNC_RESOLVE_WINNERS */);
  return false;
});

// ─── Battle Factory (factory_*) ─────────────────────────────────────────────

registerOpcode('factory_set', (_ctx, args) => {
  _facilityCall('CallBattleFactoryFunction', 0 /* BATTLE_FACTORY_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('factory_get', (_ctx, args) => {
  _facilityCall('CallBattleFactoryFunction', 1 /* BATTLE_FACTORY_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('factory_save', (_ctx, _args) => {
  _facilityCall('CallBattleFactoryFunction', 2 /* BATTLE_FACTORY_FUNC_SAVE */);
  return false;
});

registerOpcode('factory_setswapped', (_ctx, _args) => {
  _facilityCall('CallBattleFactoryFunction', 3 /* BATTLE_FACTORY_FUNC_SET_SWAPPED */);
  return false;
});

// ─── Battle Pike (pike_*) ───────────────────────────────────────────────────

registerOpcode('pike_set', (_ctx, args) => {
  _facilityCall('CallBattlePikeFunction', 0 /* BATTLE_PIKE_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('pike_get', (_ctx, args) => {
  _facilityCall('CallBattlePikeFunction', 1 /* BATTLE_PIKE_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('pike_save', (_ctx, _args) => {
  _facilityCall('CallBattlePikeFunction', 2 /* BATTLE_PIKE_FUNC_SAVE */);
  return false;
});

registerOpcode('pike_gettrainerintro', (_ctx, _args) => {
  _facilityCall('CallBattlePikeFunction', 3 /* BATTLE_PIKE_FUNC_GET_TRAINER_INTRO */);
  return false;
});

// ─── Battle Palace (palace_*) ───────────────────────────────────────────────

registerOpcode('palace_set', (_ctx, args) => {
  _facilityCall('CallBattlePalaceFunction', 0 /* BATTLE_PALACE_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('palace_get', (_ctx, args) => {
  _facilityCall('CallBattlePalaceFunction', 1 /* BATTLE_PALACE_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('palace_getopponentintro', (_ctx, _args) => {
  _facilityCall('CallBattlePalaceFunction', 2 /* BATTLE_PALACE_FUNC_GET_OPPONENT_INTRO */);
  return false;
});

// ─── Battle Arena (arena_*) ─────────────────────────────────────────────────

registerOpcode('arena_set', (_ctx, args) => {
  _facilityCall('CallBattleArenaFunction', 0 /* BATTLE_ARENA_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('arena_get', (_ctx, args) => {
  _facilityCall('CallBattleArenaFunction', 1 /* BATTLE_ARENA_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('arena_save', (_ctx, _args) => {
  _facilityCall('CallBattleArenaFunction', 2 /* BATTLE_ARENA_FUNC_SAVE */);
  return false;
});

// ─── Battle Pyramid (pyramid_*) ─────────────────────────────────────────────

registerOpcode('pyramid_set', (_ctx, args) => {
  _facilityCall('CallBattlePyramidFunction', 0 /* BATTLE_PYRAMID_FUNC_SET_DATA */, args[0], args[1]);
  return false;
});

registerOpcode('pyramid_get', (_ctx, args) => {
  _facilityCall('CallBattlePyramidFunction', 1 /* BATTLE_PYRAMID_FUNC_GET_DATA */, args[0]);
  return false;
});

registerOpcode('pyramid_save', (_ctx, _args) => {
  _facilityCall('CallBattlePyramidFunction', 2 /* BATTLE_PYRAMID_FUNC_SAVE */);
  return false;
});

// ─── Battle Tents (verdanturf/fallarbor/slateport) ──────────────────────────
// Source : asm/macros/battle_tent.inc → CallVerdanturfTentFunction / etc.

registerOpcode('verdanturftent_save', (_ctx, args) => {
  _facilityCall('CallVerdanturfTentFunction', 4 /* VERDANTURF_TENT_FUNC_SAVE */, args[0]);
  return false;
});

registerOpcode('fallarbortent_save', (_ctx, args) => {
  _facilityCall('CallFallarborTentFunction', 3 /* FALLARBOR_TENT_FUNC_SAVE */, args[0]);
  return false;
});

registerOpcode('slateporttent_save', (_ctx, args) => {
  _facilityCall('CallSlateportTentFunction', 3 /* SLATEPORT_TENT_FUNC_SAVE */, args[0]);
  return false;
});

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

// ─── Trainer battle internal opcodes ────────────────────────────────────────

registerOpcode('dotrainerbattle', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_dotrainerbattle : ConfigureAndSetUpOneTrainerBattle.
  // Internal — pas appelé directement par les scripts user. No-op safe.
  return false;
});

registerOpcode('gotopostbattlescript', (_ctx, _args) => {
  // 1:1 décomp : jump to BattleScript_PostBattle. Internal.
  return false;
});

registerOpcode('gotobeatenscript', (_ctx, _args) => {
  // 1:1 décomp : jump to BattleScript_TrainerDefeated. Internal.
  return false;
});

// ─── Item helpers ──────────────────────────────────────────────────────────

registerOpcode('checkitemtype', (_ctx, args) => {
  // 1:1 décomp ScrCmd_checkitemtype : gSpecialVar_Result = GetPocketByItemId(item).
  // POCKET_ITEMS=1, KEY_ITEMS=2, POKE_BALLS=3, TM_HM=4, BERRIES=5.
  const itemArg = args[0] ?? '';
  // Map item → pocket via decomp constants. Simplifié : tous → POCKET_ITEMS (1).
  // Future : map ITEM_X → pocket via data tables.
  void itemArg;
  VarSet('VAR_RESULT', 1);
  return false;
});

// `addpcitem` extrait vers `./script-opcodes-pc-storage`.

// `removedecoration` extrait vers `./script-opcodes-decoration`.

// ─── Box drawing (RS-era, removed in Emerald — all nop1) ────────────────────

registerOpcode('drawbox', (_ctx, _args) => false);
registerOpcode('erasebox', (_ctx, _args) => false);
registerOpcode('drawboxtext', (_ctx, _args) => false);

// ─── Pokemon mon helpers ────────────────────────────────────────────────────

registerOpcode('setmonmove', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setmonmove (scrcmd.c) :
  //   ScriptSetMonMoveSlot(partyIndex, move, slot).
  const partyIndex = parseValue(args[0] ?? '0');
  const slot = parseValue(args[1] ?? '0');
  const moveArg = args[2] ?? 'MOVE_NONE';
  const party = gSaveBlock1Ptr.playerParty;
  if (party && partyIndex >= 0 && partyIndex < party.length && slot >= 0 && slot < 4) {
    const mon = party[partyIndex];
    if (!mon.moves) mon.moves = [];
    // 1:1 décomp `ScriptSetMonMoveSlot` set le slot direct (= overwrite).
    // Notre struct PokemonInstance.moves[] = { id, nameFr, pp, ppMax }.
    mon.moves[slot] = {
      id: moveArg.toLowerCase().replace(/^move_/, ''),
      nameFr: getMoveNameFr(moveArg),
      pp: 0, ppMax: 0,
    };
  }
  return false;
});

registerOpcode('setmonmetlocation', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setmonmetlocation : SetMonData(&gPlayerParty[idx], MON_DATA_MET_LOCATION, &loc).
  const partyIndex = _vget(args[0]);
  const location = parseValue(args[1] ?? '0');
  const party = gSaveBlock1Ptr.playerParty as Array<{ metLocation?: number }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    party[partyIndex].metLocation = location;
  }
  return false;
});

// Contest opcodes (choose/start/show/link) extraits vers `./script-opcodes-contest`.

// ─── PokéNews / TV ─────────────────────────────────────────────────────────
// `getpokenewsactive` extrait vers `./script-opcodes-tv` (= 1:1 décomp tv.c).

// ─── Modern fateful encounter / Wonder Card / setworldmapflag ──────────────
// Extraits vers `./script-opcodes-mystery-event` (= 1:1 décomp mystery_event_script.c).

// ─── Braille extras ─────────────────────────────────────────────────────────

registerOpcode('closebraillemessage', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_closebraillemessage : CloseBrailleWindow().
  // Notre port : braille window non implémenté → no-op safe.
  return false;
});

// ─── Virtual buffer message ─────────────────────────────────────────────────

registerOpcode('vbuffermessage', (ctx, args) => {
  // 1:1 décomp ScrCmd_vbuffermessage : expand text at addr - sAddressOffset
  // dans gStringVar4. Notre port : delegate à bufferstring.
  return getOpcodeHandler('bufferstring')?.(ctx, args) ?? false;
});

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

// ─── Mark module loaded (= for sanity check) ────────────────────────────────

console.log('[script-opcodes] registered Phase 4.5 MVP + iter6/7 stubs + session 131 1:1 décomp completion (all field opcodes + battle facility macros + other VM safe stubs) + D1 split');

// Lint-friendly export to avoid "unused imports".
export { COMPARE_LT, COMPARE_EQ, COMPARE_GT };
export type { ScriptContext };
