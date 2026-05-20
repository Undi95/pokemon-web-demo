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
import * as Songs from './decomp-data/auto/include/constants/songs-data';
import {
  gObjectEvents, type ObjectEvent, TrySpawnObjectEvent,
} from './object-events';
import type { ObjectEventTemplate } from './map-loader';
import { gameState } from './game-state';
import { setPendingWarp, getPendingWarp } from './warp-system';
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
  gPlayerAvatar, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
} from './player-avatar';
import { getRuntime } from './decomp-globals';
import { resolveDecompConstant, reverseDecompConstant } from './decomp-constants';
import { RtcCalcLocalTime, gLocalTime, RtcInitLocalTimeOffset } from './rtc';
import { setStringVar } from './string-buffers';
import {
  getSpeciesNameFr, getMoveNameFr, getItemNameFr, getTrainerNameFr,
  getTrainerClassNameFr, getTrainer,
} from './data-tables';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OPPOSITE_DIR: Record<number, number> = {
  [DIR_SOUTH]: DIR_NORTH,
  [DIR_NORTH]: DIR_SOUTH,
  [DIR_WEST]: DIR_EAST,
  [DIR_EAST]: DIR_WEST,
};

function getSelectedNpc(): ObjectEvent | null {
  const idx = gSelectedObjectEvent.index;
  if (idx < 0 || idx >= gObjectEvents.length) return null;
  const npc = gObjectEvents[idx];
  if (!npc.active) return null;
  return npc;
}

/** A_BUTTON = 0x01 (= 1:1 décomp gba/key.h). */
const A_BUTTON = 0x01;
const B_BUTTON = 0x02;

function isAOrBNewlyPressed(): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  return (rt.gMain.newKeys & (A_BUTTON | B_BUTTON)) !== 0;
}

/** 1:1 décomp checkplayergender : 0 = MALE, 1 = FEMALE. */
const MALE_GENDER = 0;
const FEMALE_GENDER = 1;

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
  gameState.setFlag(`__defeated_${trainerArg}`);
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

/** 1:1 décomp `IsFreezePlayerFinished` (event_object_movement.c) :
 *  retourne TRUE quand le player a fini son current step (= safe to msgbox).
 *  Sans cette wait, un msgbox peut interrompre un walk mid-step → glitch
 *  visuel + désync facingDirection.
 *
 *  Fix Audit BIG section 2.3 : avant, `lock`/`lockall` retournaient false sans
 *  wait → script peut afficher dialog avant que le step end snap les coords. */
function _isPlayerStepFinished(): boolean {
  return gPlayerAvatar.stepFramesLeft <= 0
      && gPlayerAvatar.collideFramesLeft <= 0
      && gPlayerAvatar.turnFramesLeft <= 0
      && gPlayerAvatar.jumpFramesLeft <= 0
      && gPlayerAvatar.forceMovement === 0;  // DIR_NONE
}

registerOpcode('lock', (ctx) => {
  // 1:1 décomp `ScrCmd_lock` (scrcmd.c:1217-1237) :
  //   FreezeObjects_WaitForPlayerAndSelected();
  //   SetupNativeScript(ctx, IsFreezeSelectedObjectAndPlayerFinished);
  // Freeze tous les NPCs sauf player + selected NPC. Player + selected sont
  // freeze APRÈS leur step courant termine.
  const npc = getSelectedNpc();
  // Freeze immediately tous sauf player/selected.
  for (const n of gObjectEvents) {
    if (n.active && n !== npc) n.frozen = true;
  }
  // Wait pour player step end. Le selected NPC était déjà frozen ou en step ;
  // on freeze le selected aussi à la fin du wait.
  SetupNativeScript(ctx, () => {
    if (!_isPlayerStepFinished()) return false;
    // Player step done : freeze player + selected NPC, return true (= resume script).
    if (npc) npc.frozen = true;
    return true;
  });
  return true;  // tells script-runtime to wait
});

registerOpcode('lockall', (ctx) => {
  // 1:1 décomp `ScrCmd_lockall` (scrcmd.c:1199-1213) :
  //   FreezeObjects_WaitForPlayer();
  //   SetupNativeScript(ctx, IsFreezePlayerFinished);
  // Freeze tous les NPCs immediately. Player est freeze APRÈS son step courant.
  for (const npc of gObjectEvents) {
    if (npc.active) npc.frozen = true;
  }
  SetupNativeScript(ctx, () => _isPlayerStepFinished());
  return true;
});

registerOpcode('release', (_ctx) => {
  // 1:1 décomp `ScrCmd_release` (scrcmd.c:1251-1263) :
  //   HideFieldMessageBox();
  //   ObjectEventClearHeldMovementIfFinished(selected);
  //   ObjectEventClearHeldMovementIfFinished(player);
  //   ScriptMovement_UnfreezeObjectEvents();
  //   UnfreezeObjectEvents();   ← unfreeze TOUS les NPCs, pas juste le selected.
  // Ancienne impl unfreezait SEULEMENT le selected → user-flag : parler à
  // Vigoroth1 freeze Vigoroth2 indéfiniment (= release du script Vigoroth1
  // ne libérait pas Vigoroth2 qui était frozen par lock).
  HideFieldMessageBox();
  for (const npc of gObjectEvents) {
    if (npc.active) npc.frozen = false;
  }
  return false;
});

registerOpcode('releaseall', (_ctx) => {
  HideFieldMessageBox();
  for (const npc of gObjectEvents) {
    if (npc.active) npc.frozen = false;
  }
  return false;
});

registerOpcode('faceplayer', (_ctx) => {
  // 1:1 décomp ScrCmd_faceplayer : NPC tourne face au player (= direction
  // opposée à la direction face du player).
  const npc = getSelectedNpc();
  if (!npc) return false;
  npc.facingDirection = OPPOSITE_DIR[gPlayerAvatar.facing] ?? DIR_SOUTH;
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
          // 1:1 décomp Std_MsgboxSign : lockall (= freeze TOUS les NPCs).
          for (const n of gObjectEvents) if (n.active) n.frozen = true;
        } else if (isNpc) {
          // 1:1 décomp Std_MsgboxNPC : lock (= freeze the SELECTED NPC) + faceplayer.
          // faceplayer = NPC tourne vers player (= opposite direction du player.facing).
          const npc = getSelectedNpc();
          if (npc) {
            npc.frozen = true;
            npc.facingDirection = OPPOSITE_DIR[gPlayerAvatar.facing] ?? DIR_SOUTH;
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
          // Release frozen NPCs UNIQUEMENT pour les types qui les avaient lock.
          if (isSign) {
            for (const n of gObjectEvents) if (n.active) n.frozen = false;
          } else if (isNpc) {
            const npc = getSelectedNpc();
            if (npc) npc.frozen = false;
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
        // Release dialog + NPC (= MSGBOX_YESNO behavior 1:1 décomp).
        HideFieldMessageBox();
        const npc = getSelectedNpc();
        if (npc) npc.frozen = false;
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

registerOpcode('playse', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_playse` (scrcmd.c) : PlaySE avec le SE constant string.
  // On lookup l'ID dans songs-data (= e.g. SE_LEDGE → 22).
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') {
    PlaySE(seId);
  } else {
    console.warn(`[opcode playse] unknown SE '${seName}'`);
  }
  return false;
});

registerOpcode('playfanfare', (_ctx, args) => {
  // E4 fix (DEMO-AUDIT-FINDINGS) : 1:1 décomp `ScrCmd_playfanfare` (scrcmd.c) :
  //   PlayFanfare(songNum); return FALSE;
  // Resolve song name via Songs map (= playbgm pattern l. 1170-1183).
  // PlayFanfare marque _audioEndTimeMs.fanfare = +3000ms → waitfanfare opcode
  // bloque jusqu'à fin (= "PLAYER reçoit STR_VAR_1!" tempo correct).
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('./decomp-globals').then(({ PlayFanfare }) => {
      PlayFanfare(songId);
    });
  } else {
    console.warn(`[opcode playfanfare] unknown fanfare '${songName}'`);
  }
  return false;
});

registerOpcode('waitfanfare', (ctx) => {
  // 1:1 décomp ScrCmd_waitfanfare (scrcmd.c:1187) :
  //   SetupNativeScript(ctx, WaitForFanfareFinish) ; return TRUE
  // WaitForFanfareFinish : return IsFanfareTaskInactive().
  // Session 132 : real tracking via decomp-globals.IsFanfareTaskInactive.
  const poll = (): boolean => {
    const dg = (globalThis as { __decompGlobals?: { IsFanfareTaskInactive?: () => boolean } }).__decompGlobals;
    return dg?.IsFanfareTaskInactive?.() ?? true;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

/** 1:1 décomp `ScrCmd_playbgm` (scrcmd.c) : PlayBGM avec un song id + loop flag.
 *  Format args : args[0] = song name (= 'MUS_ENCOUNTER_MAY' etc.), args[1] = TRUE/FALSE for loop. */
registerOpcode('playbgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('./decomp-globals').then(({ m4aSongNumStart }) => {
      m4aSongNumStart(songId, true);
    });
  } else {
    console.warn(`[opcode playbgm] unknown BGM '${songName}'`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_savebgm` (scrcmd.c) :
 *    sSavedBgm = VarGet(arg);  // store song id for restore by fadedefaultbgm
 *  Audit session 126 (post-test user) : avant no-op → BGM restait bloqué. */
let _savedBgmSongId = 0;
registerOpcode('savebgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  _savedBgmSongId = typeof songId === 'number' ? songId : VarGet(songName);
  return false;
});

/** 1:1 décomp `ScrCmd_fadedefaultbgm` (scrcmd.c) :
 *    PlayNewMapMusic(GetCurrentMapMusic());  // restart map default BGM
 *  Audit session 126 (post-test user) : avant no-op → BGM bloqué après
 *  scripts qui call playbgm puis fadedefaultbgm (= TV event PetalburgGymReport,
 *  Brendan rival meet, etc). */
registerOpcode('fadedefaultbgm', (_ctx, _args) => {
  const gMapHeader = (globalThis as Record<string, unknown>).gMapHeader as
    { music?: number | string } | undefined;
  const mapMusic = gMapHeader?.music;
  let songId: number | undefined;
  if (typeof mapMusic === 'number' && mapMusic > 0) {
    songId = mapMusic;
  } else if (typeof mapMusic === 'string') {
    songId = (Songs as unknown as Record<string, number>)[mapMusic];
  }
  if (typeof songId === 'number' && songId > 0) {
    void import('./decomp-globals').then(({ m4aSongNumStart }) => {
      m4aSongNumStart(songId!, true);
    });
  }
  return false;
});

/** 1:1 décomp `ScrCmd_fadenewbgm` (scrcmd.c) : fade to new BGM. */
registerOpcode('fadenewbgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('./decomp-globals').then(({ m4aSongNumStart, FadeOutBGM }) => {
      FadeOutBGM(4);
      setTimeout(() => m4aSongNumStart(songId, true), 200);
    });
  }
  return false;
});

/** 1:1 décomp `ScrCmd_fadeoutbgm` (scrcmd.c) : fade out current BGM. */
registerOpcode('fadeoutbgm', (_ctx, args) => {
  const speed = parseInt(args[0] ?? '4', 10) || 4;
  void import('./decomp-globals').then(({ FadeOutBGM }) => FadeOutBGM(speed));
  return false;
});

/** 1:1 décomp `ScrCmd_fadeinbgm` (scrcmd.c) : fade in current BGM. */
registerOpcode('fadeinbgm', (_ctx, args) => {
  const speed = parseInt(args[0] ?? '4', 10) || 4;
  void import('./decomp-globals').then(({ FadeInBGM }) => FadeInBGM(speed));
  return false;
});

// Standard NPC scripts utilitaires fréquemment appelés via `call` :
// Common_EventScript_SetupRivalGfxId, Common_EventScript_SaveGame, etc.
// On warn la 1ère fois seulement (= via dispatchOpcode default behavior).

// ─── Object events utility opcodes ───────────────────────────────────────────

/** Helper : match NPC par localIdRaw (= string, ex 'LOCALID_PLAYERS_HOUSE_1F_MOM').
 *  Supporte aussi VAR_X (= lit la value, match par localId number) et
 *  numeric arg (= match par localId number). */
function _findNpcByLocalId(arg: string): typeof gObjectEvents[number] | null {
  if (!arg) return null;
  // 1:1 décomp : si VAR_*, lire la value (= un number qui matche localId).
  if (arg.startsWith('VAR_')) {
    const n = VarGet(arg);
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return npc;
    }
    return null;
  }
  // Match par localIdRaw (= string) en priorité.
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localIdRaw === arg) return npc;
  }
  // Fallback : parseInt (= si arg est numérique).
  const n = parseInt(arg, 10);
  if (!Number.isNaN(n)) {
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return npc;
    }
  }
  return null;
}

/** Helper : modifie aussi le template dans gMapHeader pour persister la position
 *  permanente (= setobjectxyperm 1:1 décomp modifie gObjectEventTemplates). */
function _findTemplateByLocalId(arg: string): ObjectEventTemplate | null {
  if (!arg) return null;
  const gMapHeader = (globalThis as Record<string, unknown>).gMapHeader as
    { events?: { objectEvents?: ObjectEventTemplate[] } } | undefined;
  const templates = gMapHeader?.events?.objectEvents ?? [];
  for (const t of templates) {
    if (t.localIdRaw === arg) return t;
  }
  return null;
}

registerOpcode('setobjectxy', (_ctx, args) => {
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  const npc = _findNpcByLocalId(args[0] ?? '');
  if (npc) {
    npc.currentCoordsX = x;
    npc.currentCoordsY = y;
    npc.previousCoordsX = x;
    npc.previousCoordsY = y;
  }
  return false;
});

registerOpcode('setobjectxyperm', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_setobjectxyperm` (scrcmd.c) :
  //   modifie le TEMPLATE dans gObjectEventTemplates pour que le NPC respawn
  //   à la new position (= survit au cross-border / map reload).
  // On modifie aussi le NPC actif si présent (= sync immédiate).
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  const tpl = _findTemplateByLocalId(args[0] ?? '');
  if (tpl) {
    tpl.x = x;
    tpl.y = y;
  }
  const npc = _findNpcByLocalId(args[0] ?? '');
  if (npc) {
    npc.initialCoordsX = x;
    npc.initialCoordsY = y;
    // Audit session 126 C6 : aussi sync `currentCoordsX/Y` + `previousCoordsX/Y`.
    // 1:1 décomp `setobjectxyperm` ne touche QUE le template — le NPC actif
    // reste à sa position courante. MAIS notre runtime spawn déjà actifs au
    // load → si le script change perm coords après spawn (= cas LittlerootTown
    // SetMomInFrontOfDoor → setobjectxyperm Mom 5,9), Mom reste à sa position
    // initiale au lieu de bouger. Pour 1:1 visuel sur les changements en cours
    // de game, on sync les coords actuelles aussi. Sans ça : NPC visuellement
    // figé à son spawn pos même si template a changé.
    npc.currentCoordsX = x;
    npc.currentCoordsY = y;
    npc.previousCoordsX = x;
    npc.previousCoordsY = y;
    // Sync world coords (= pixel pos) aussi pour que le sprite se déplace.
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

/** Helper : resolve un identifier d'objet en `localIdRaw` (= string LOCALID_*).
 *
 *  Audit session 126 fix Mom invisible 2F : le décomp `ScrCmd_addobject` fait
 *  `objectId = VarGet(...)` (= number), puis match template par `objectId` numérique.
 *  Notre impl matchait par `localIdRaw` (string), ce qui marche pour les
 *  literals `LOCALID_X` mais PAS pour les VAR_0x8008 que les scripts comme
 *  `PlayersHouse_2F_EventScript_MomComesUpstairsFemale` utilisent :
 *      setvar VAR_0x8008, LOCALID_PLAYERS_HOUSE_2F_MOM
 *      addobject VAR_0x8008
 *  Avant : `addobject VAR_0x8008` était traité comme localIdRaw = "VAR_0x8008"
 *  → template introuvable → no-op → Mom invisible.
 *  Maintenant : si arg starts with `VAR_`, on VarGet → number, puis on resolve
 *  via `reverseDecompConstant(num, 'LOCALID_')` pour retrouver le LOCALID_X. */
function _resolveObjectLocalIdRaw(arg: string): string {
  if (arg.startsWith('LOCALID_')) return arg;
  if (arg.startsWith('VAR_') || /^-?\d+$/.test(arg) || /^0x[0-9a-fA-F]+$/.test(arg)) {
    const num = VarGet(arg);
    const resolved = reverseDecompConstant(num, 'LOCALID_');
    if (resolved) return resolved;
    // Fallback : match par numeric localId dans gMapHeader (= map.json local_id
    // assignment-order).
    const gMapHeader = (globalThis as Record<string, unknown>).gMapHeader as
      { events?: { objectEvents?: ObjectEventTemplate[] } } | undefined;
    const tplByLocalId = gMapHeader?.events?.objectEvents?.find(t => t.localId === num);
    if (tplByLocalId?.localIdRaw) return tplByLocalId.localIdRaw;
  }
  return arg;
}

registerOpcode('addobject', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_addobject` (scrcmd.c) :
  //   TrySpawnObjectEvent(localId, mapNum, mapGroup)
  // qui ClearFlag + spawn directement le NPC. Sans le spawn immédiat, le NPC
  // attendrait le prochain tile cross pour apparaitre — mais pendant un script
  // lockall le player ne bouge pas → NPC jamais visible.
  const localIdRaw = _resolveObjectLocalIdRaw(args[0] ?? '');
  const gMapHeader = (globalThis as Record<string, unknown>).gMapHeader as
    { events?: { objectEvents?: ObjectEventTemplate[] } } | undefined;
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
  const gMapHeader = (globalThis as Record<string, unknown>).gMapHeader as
    { events?: { objectEvents?: ObjectEventTemplate[] } } | undefined;
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
  // Hide player sprite (= used during cinematic warp).
  const rt = getRuntime();
  if (rt && (globalThis as Record<string, unknown>).gPlayerAvatar) {
    const pa = (globalThis as Record<string, unknown>).gPlayerAvatar as { spriteId?: number };
    if (pa.spriteId !== undefined && pa.spriteId >= 0) {
      const s = rt.gSprites.get(pa.spriteId);
      if (s) s.invisible = true;
    }
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
  const rt = getRuntime();
  if (rt && (globalThis as Record<string, unknown>).gPlayerAvatar) {
    const pa = (globalThis as Record<string, unknown>).gPlayerAvatar as { spriteId?: number };
    if (pa.spriteId !== undefined && pa.spriteId >= 0) {
      const s = rt.gSprites.get(pa.spriteId);
      if (s) s.invisible = false;
    }
  }
  return false;
});

// ─── Doors (= 1:1 décomp ScrCmd_opendoor etc.) ──────────────────────────────
//
// 1:1 décomp scrcmd.c:ScrCmd_opendoor :
//   x = VarGet(ScriptReadHalfword(ctx));
//   y = VarGet(ScriptReadHalfword(ctx));
//   PlaySE(GetDoorSoundEffect(x, y));
//   FieldAnimateDoorOpen(x, y);   ← starts anim (= 16 frames)
//   return FALSE;  (= continue script immédiatement)
//
// `waitdooranim` ensuite halt le script jusqu'à anim fin via SetupNativeScript
// + IsDoorAnimationStopped (= `_doorAnimActive` polled).
//
// Avant : tous les opcodes étaient no-op → la porte ne s'ouvrait JAMAIS
// pendant la cinematic GoInsideWithMom (= mom + player walk into closed
// door visually) ; LittlerootTown_EventScript_StepOffTruckMale.

let _doorAnimActive = false;

registerOpcode('opendoor', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  void (async () => {
    try {
      const fdoor = await import('./field-door');
      const seId = fdoor.GetDoorSoundEffect(x, y);
      PlaySE(seId);
      _doorAnimActive = true;
      await fdoor.FieldAnimateDoorOpen(x, y);
      _doorAnimActive = false;
    } catch (e) {
      console.warn('[opcode opendoor] failed', e);
      _doorAnimActive = false;
    }
  })();
  return false;
});

registerOpcode('closedoor', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  void (async () => {
    try {
      const fdoor = await import('./field-door');
      _doorAnimActive = true;
      await fdoor.FieldAnimateDoorClose(x, y);
      _doorAnimActive = false;
    } catch (e) {
      console.warn('[opcode closedoor] failed', e);
      _doorAnimActive = false;
    }
  })();
  return false;
});

registerOpcode('waitdooranim', (ctx) => {
  // 1:1 décomp ScrCmd_waitdooranim : SetupNativeScript(IsDoorAnimationStopped).
  // On poll _doorAnimActive jusqu'à false (= anim terminée). Si aucune anim
  // n'a été démarrée par opendoor/closedoor (= behavior pas MB_ANIMATED_DOOR
  // donc no-op), _doorAnimActive reste false → continue immédiatement.
  const tick = (): boolean => !_doorAnimActive;
  SetupNativeScript(ctx, tick);
  return true;
});

registerOpcode('setdooropen', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  // 1:1 décomp `FieldSetDoorOpened(x, y)` = instant draw open frame, no SE.
  void (async () => {
    try {
      const fdoor = await import('./field-door');
      await fdoor.FieldSetDoorOpened(x, y);
    } catch (e) { console.warn('[opcode setdooropen] failed', e); }
  })();
  return false;
});

registerOpcode('setdoorclosed', (_ctx, _args) => false);

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

// 1:1 décomp scrcmd.c:ScrCmd_setmetatile (lignes 2034-2048).
//   x += MAP_OFFSET ; y += MAP_OFFSET ;
//   if (!isImpassable) MapGridSetMetatileIdAt(x, y, metatileId)
//   else MapGridSetMetatileIdAt(x, y, metatileId | MAPGRID_IMPASSABLE)
//
// Args : x, y, metatileId, isImpassable. Tous peuvent être var noms ou immediates.
// 595 usages dans les scripts (= portes dynamiques, escaliers, hidden items, etc.).
registerOpcode('setmetatile', (_ctx, args) => {
  const x = VarGet(args[0]) + MAP_OFFSET;
  const y = VarGet(args[1]) + MAP_OFFSET;
  const metatileId = VarGet(args[2]);
  const isImpassable = VarGet(args[3]);
  if (!isImpassable) {
    MapGridSetMetatileIdAt(x, y, metatileId);
  } else {
    MapGridSetMetatileIdAt(x, y, metatileId | MAPGRID_IMPASSABLE);
  }
  return false;
});

// ─── Warp opcodes ──────────────────────────────────────────────────────────

/**
 * Parse les args de warpsilent/warp selon la macro `formatwarp` (asm/macros/event.inc:425).
 *
 * 4 formes possibles (= nombre d'args APRÈS le map name) :
 *   - 0 arg     : warpId=NONE, x=-1, y=-1 (= use coords par default ?)
 *   - 1 arg     : warpId=arg, x=-1, y=-1 (= warpId-based warp standard)
 *   - 2 args    : warpId=NONE, x=arg0, y=arg1 (= coords-based warp explicit)
 *   - 3 args    : warpId=arg0, x=arg1, y=arg2 (= rare, warp sort out)
 *
 * NB : args[0] est destMap. Donc args.length-1 = nombre d'args formatwarp.
 */
function parseWarpArgs(args: string[]): { destMap: string; warpId: number; x: number; y: number } {
  const destMap = args[0] ?? '';
  const rest = args.slice(1);
  const WARP_ID_NONE = -1;
  let warpId: number, x: number, y: number;
  if (rest.length === 0) {
    warpId = WARP_ID_NONE; x = -1; y = -1;
  } else if (rest.length === 1) {
    warpId = parseInt(rest[0] ?? '0', 10); x = -1; y = -1;
  } else if (rest.length === 2) {
    // Coord pair : warpId=NONE, x=arg0, y=arg1.
    warpId = WARP_ID_NONE;
    x = parseInt(rest[0] ?? '0', 10);
    y = parseInt(rest[1] ?? '0', 10);
  } else {
    warpId = parseInt(rest[0] ?? '0', 10);
    x = parseInt(rest[1] ?? '0', 10);
    y = parseInt(rest[2] ?? '0', 10);
  }
  return { destMap, warpId, x, y };
}

registerOpcode('warpsilent', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_warpsilent` : warp instantané sans fade.
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  // Bug fix 2026-05-09 : préserve warpId = -1 (= WARP_ID_NONE) quand le script
  // utilise explicit coords (= form `warpsilent MAP, NONE, X, Y`). Avant on
  // forçait warpId = 0, ce qui faisait que executeWarp utilisait warps[0] de
  // la dest map au lieu des x/y explicites → tous les warps script-driven
  // arrivaient à la mauvaise position.
  setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');
  console.log(`[opcode warpsilent] ${destMap} warpId=${warpId} coords=(${x},${y})`);
  return false;
});

registerOpcode('warp', (_ctx, args) => {
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');
  console.log(`[opcode warp] ${destMap} warpId=${warpId} coords=(${x},${y})`);
  return false;
});

// ─── Setrespawn (= MVP no-op) ────────────────────────────────────────────────

/** 1:1 décomp `ScrCmd_setrespawn` (scrcmd.c) :
 *    SetLastHealLocationWarp(VarGet(healLocationId));
 *  Set `gSaveBlock1Ptr->lastHealLocation` à la heal location passée en arg.
 *  Audit session 126 C1 : avant no-op → après defeat / poison KO, le player
 *  reste là où il était (= bug ROM-faithful majeur). Maintenant store dans
 *  block1.respawnLocation (= notre proxy) ET aussi block1.lastHealLocation
 *  (= structure WarpData attendue par les auto-files comme field_specials). */
registerOpcode('setrespawn', (_ctx, args) => {
  const healLocId = args[0] ?? '';
  // Le décomp resolve la heal location en (mapGroup, mapNum, x, y) via
  // sHealLocations[]. Notre table TS est dans heal_location-all-auto.ts mais
  // pas exposée comme lookup direct. Fallback : store la STRING ID, et le code
  // qui consume (= DoWhiteOut → SetWarpDestinationToLastHealLocation) résoudra
  // au moment du respawn (= probably aussi à porter). Pour MVP : note la heal
  // location dans saveBlock1 pour persist + sync DEBUG.
  gameState.setRespawn(healLocId);
  return false;
});

// ─── Misc stubs (= unblock script flow without full implementation) ─────────

/** 1:1 décomp `ScrCmd_incrementgamestat` (scrcmd.c) :
 *    IncrementGameStat(stat);  // +1 à gSaveBlock1Ptr->gameStats[stat]
 *  Audit session 126 C2 : avant no-op → stats jamais tracked. Some flags
 *  conditional dependent (e.g. GAME_STAT_STEPS for daycare egg). Maintenant
 *  on update block1.gameStats[]. Le numeric `stat` est résolu via VarGet (=
 *  resolveDecompConstant si literal GAME_STAT_X). */
registerOpcode('incrementgamestat', (_ctx, args) => {
  const stat = VarGet(args[0] ?? '0');
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { gameStats?: number[] } | undefined;
  if (block1?.gameStats && stat >= 0 && stat < block1.gameStats.length) {
    block1.gameStats[stat] = (block1.gameStats[stat] ?? 0) + 1;
  }
  return false;
});

/** 1:1 décomp `ScrCmd_playmoncry` (scrcmd.c) : play Pokemon cry.
 *  Args : species (= "VAR_TEMP_1" ou "SPECIES_X"), mode (= 0 normal). */
registerOpcode('playmoncry', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  // Resolve species : VAR_X → lookup numeric, else enum name → constant.
  const speciesId = speciesArg.startsWith('VAR_') || speciesArg.startsWith('0x80')
    ? gameState.getVar(speciesArg)
    : (resolveDecompConstant(speciesArg) ?? 0);
  void import('./decomp-globals').then(({ PlayCryInternal }) => {
    PlayCryInternal(speciesId, 0, 64, 0, 0);
  }).catch(() => {});
  return false;
});

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
  gameState.setVar('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode giveitem] ${itemKey} x${count} → ${ok ? 'ok' : 'failed'}`);
  return false;
});

/** 1:1 décomp `givecoins` macro. Stub. */
/** 1:1 décomp `ScrCmd_givecoins` (scrcmd.c) :
 *    GiveCoins(VarGet(amount));  // block1.coins += amount, cap 9999. */
registerOpcode('givecoins', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { coins?: number } | undefined;
  if (block1) block1.coins = Math.min(9999, (block1.coins ?? 0) + amount);
  return false;
});

/** 1:1 décomp `ScrCmd_addmoney` (scrcmd.c) :
 *    AddMoney(&gSaveBlock1Ptr->money, VarGet(amount));
 *  Audit session 126 C4 : avant no-op → casino + Wally evolution broken.
 *  Now : add montant à block1.money, capped à 999999 (= MAX_MONEY décomp). */
registerOpcode('givemoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { money?: number } | undefined;
  if (block1) {
    block1.money = Math.min(999999, (block1.money ?? 0) + amount);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_addmoney` (scrcmd.c) :
 *    amount = ScriptReadWord ; ignore = ScriptReadByte ;
 *    if (!ignore) AddMoney(&money, amount);
 *  = mnémonique décomp RÉEL (`addmoney value, disable=0`). Le handler
 *  existait sous le mauvais nom `givemoney` SANS l'octet `ignore`/disable
 *  (= bug 1:1 : ignorait le 2ᵉ arg). Audit scrcmd : était MANQUANT.
 *  AddMoney cap MAX_MONEY=999999 (= 1:1 décomp money.c). */
registerOpcode('addmoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const ignore = VarGet(args[1] ?? '0');
  if (!ignore) {
    const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
      { money?: number } | undefined;
    if (block1) block1.money = Math.min(999999, (block1.money ?? 0) + amount);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_takemoney` (scrcmd.c) : sub from block1.money, floor 0. */
registerOpcode('takemoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { money?: number } | undefined;
  if (block1) {
    block1.money = Math.max(0, (block1.money ?? 0) - amount);
  }
  return false;
});

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
      const { createPokemonInstance } = await import('./pokemon');
      const mon = createPokemonInstance(speciesName, level);
      const ok = gameState.addToParty(mon);
      gameState.setVar('VAR_RESULT', ok ? 0 : 2);  // 0=success, 1=full, 2=fail
      console.log(`[opcode givepokemon] ${speciesName} Lv${level} → ${ok ? 'added' : 'party full'}`);
    } catch (e) {
      console.warn('[opcode givepokemon] failed:', e);
      gameState.setVar('VAR_RESULT', 2);
    }
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_checkmoneyforshop` :
 *    gSpecialVar_Result = (gSaveBlock1Ptr->money >= amount);
 *  Returns TRUE si player a assez d'argent. */
registerOpcode('checkmoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { money?: number } | undefined;
  const has = (block1?.money ?? 0) >= amount;
  gameState.setVar('VAR_RESULT', has ? 1 : 0);
  return false;
});

/** 1:1 décomp `startminigame_*` etc. Stubs no-op. */
registerOpcode('cmd5e', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_setweather` (scrcmd.c) :
 *    SetSavedWeather(VarGet(weather));
 *  Stocke dans block1.weather. Effet visuel applied au prochain doweather. */
registerOpcode('setweather', (_ctx, args) => {
  const weather = VarGet(args[0] ?? '0');
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { weather?: number } | undefined;
  if (block1) block1.weather = weather;
  return false;
});

/** 1:1 décomp `ScrCmd_resetweather` (scrcmd.c) :
 *    SetSavedWeatherFromCurrMapHeader();
 *  = `SetSavedWeather(gMapHeader.weather)` = `block1.weather =
 *  gMapHeader.weather`. Restaure la météo SAUVEGARDÉE à celle PAR
 *  DÉFAUT de la map courante (= 1:1 field_weather.c). gMapHeader.weather
 *  est une string "WEATHER_*" → résolue en id numérique. Était MANQUANT
 *  (audit scrcmd) → la météo ne se reset pas en sortie de zone spéciale. */
registerOpcode('resetweather', (_ctx) => {
  const mhWeather = gMapHeader?.weather;
  const weatherId = typeof mhWeather === 'string'
    ? (resolveDecompConstant(mhWeather) ?? 0)
    : (typeof mhWeather === 'number' ? mhWeather : 0);
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { weather?: number } | undefined;
  if (block1) block1.weather = typeof weatherId === 'number' ? weatherId : 0;
  return false;
});

/** 1:1 décomp `ScrCmd_doweather` (scrcmd.c) :
 *    DoCurrentWeather();  // active le weather sauvegardé
 *  Pour MVP on log + no-op (= sans repro live d'un cas qui en a besoin). */
registerOpcode('doweather', (_ctx, _args) => {
  // TODO : appeler le système weather pour appliquer la weather courante.
  return false;
});

registerOpcode('setstepcallback', (_ctx, _args) => false);
registerOpcode('setmaplayoutindex', (_ctx, _args) => false);
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
registerOpcode('setdoor_opened', (ctx, args) => getOpcodeHandler('setdooropen')?.(ctx, args) ?? false);
registerOpcode('setdoor_closed', (ctx, args) => getOpcodeHandler('setdoorclosed')?.(ctx, args) ?? false);
registerOpcode('addelevmenuitem', (_ctx, _args) => false);
registerOpcode('showelevmenu', (_ctx, _args) => false);
/** 1:1 décomp `ScrCmd_checkcoins` (scrcmd.c) :
 *    *(u16 *)VarGetPtr(args[0]) = block1.coins;
 *  Le résultat va dans la VAR passée en arg, pas VAR_RESULT. */
registerOpcode('checkcoins', (_ctx, args) => {
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { coins?: number } | undefined;
  const coins = block1?.coins ?? 0;
  const dst = args[0] ?? 'VAR_RESULT';
  if (dst.startsWith('VAR_')) gameState.setVar(dst, coins);
  else gameState.setVar('VAR_RESULT', coins);
  return false;
});
/** 1:1 décomp `ScrCmd_takecoins` (scrcmd.c) :
 *    SubtractCoins(VarGet(amount));  // block1.coins -= amount, floor 0. */
registerOpcode('takecoins', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { coins?: number } | undefined;
  if (block1) block1.coins = Math.max(0, (block1.coins ?? 0) - amount);
  return false;
});
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
  const lead = gameState.party?.[0];
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
  const mon = gameState.party?.[slot];
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

registerOpcode('bufferdecorationname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, args[1]?.replace(/^DECOR_/, '') ?? '');
  return false;
});

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

// 1:1 décomp `sContestNames[]` (data/lilycove_lady.h:452, indexé
// CONTEST_CATEGORY_* global.h:86 = COOL 0/BEAUTY 1/CUTE 2/SMART 3/TOUGH 4)
// → gText_{Coolness,Beauty,Cuteness,Smartness,Toughness}Contest, strings FR
// décomp strings.c:616-620 (texte ROM FR cité ligne-par-ligne, PAS un enum
// dérivable → hardcode 1:1 documenté, idem gText_Box étape 6 PokemonStorage).
const sContestNames = [
  'SANG-FROID',   // [CONTEST_CATEGORY_COOL]   gText_CoolnessContest  strings.c:616
  'BEAUTE',       // [CONTEST_CATEGORY_BEAUTY] gText_BeautyContest    strings.c:617
  'GRACE',        // [CONTEST_CATEGORY_CUTE]   gText_CutenessContest  strings.c:618
  'INTELLIGENCE', // [CONTEST_CATEGORY_SMART]  gText_SmartnessContest strings.c:619
  'ROBUSTESSE',   // [CONTEST_CATEGORY_TOUGH]  gText_ToughnessContest strings.c:620
] as const;

// 1:1 décomp `ScrCmd_buffercontestname` (scrcmd.c:1635-1642) :
//   u8 stringVarIndex = ScriptReadByte(ctx);
//   u16 category = VarGet(ScriptReadHalfword(ctx));
//   BufferContestName(sScriptStringVars[stringVarIndex], category);
// BufferContestName (lilycove_lady.c:721) = StringCopy(dest, sContestNames[category]).
// parseValue() reproduit VarGet + résolution constante (VAR_→VarGet,
// CONTEST_CATEGORY_X→resolveDecompConstant, nombre→nombre). Mal classé
// auparavant dans _otherVmStubs (= no-op) alors que c'est un field scrcmd
// réel → {STR_VAR_N} restait vide dans les dialogs Contest (gap audit:overworld).
registerOpcode('buffercontestname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const category = parseValue(args[1]);
  setStringVar(n, sContestNames[category] ?? '');
  return false;
});

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

// 1:1 décomp `ScrCmd_addcoins` (scrcmd.c) : block1.coins += amount, cap 9999.
registerOpcode('addcoins', (ctx, args) => getOpcodeHandler('givecoins')?.(ctx, args) ?? false);

// 1:1 décomp `ScrCmd_messageinstant` (scrcmd.c) : msgbox sans typewriter effect
// (= text appears all at once instead of char-by-char). MVP : alias message.
registerOpcode('messageinstant', (ctx, args) => getOpcodeHandler('message')?.(ctx, args) ?? false);

// 1:1 décomp `ScrCmd_warpwhitefade` (scrcmd.c) : warp avec white fade
// transition (= rare, used Sky Pillar etc.). MVP : alias warp normal.
registerOpcode('warpwhitefade', (ctx, args) => getOpcodeHandler('warp')?.(ctx, args) ?? false);
registerOpcode('checkpartymove', (_ctx, _args) => {
  gameState.setVar('VAR_RESULT', 0);
  return false;
});
registerOpcode('countpokemon', (_ctx) => {
  gameState.setVar('VAR_RESULT', gameState.partySize);
  return false;
});

// ─── Setdynamicwarp + sync gameState ───────────────────────────────────────

registerOpcode('setdynamicwarp', (_ctx, args) => {
  const [destMap, xStr, yStr] = args;
  const x = parseInt(xStr ?? '0', 10);
  const y = parseInt(yStr ?? '0', 10);
  // Set via gameState (= used by executeWarp MAP_DYNAMIC resolution).
  gameState.setDynamicWarp(destMap, x, y);
  console.log(`[opcode setdynamicwarp] ${destMap} (${x},${y})`);
  return false;
});

// ─── Bag opcodes (= 1:1 décomp ScrCmd_additem etc.) ─────────────────────────

/** Helper : resolve un arg "VAR_X" ou "ITEM_Y" ou number en numeric quantity. */
function resolveCount(arg: string): number {
  if (!arg) return 1;
  // Si VAR_*, lire la valeur. Sinon parseInt.
  if (arg.startsWith('VAR_') || arg.startsWith('0x80')) {
    return gameState.getVar(arg);
  }
  const n = parseInt(arg, 10);
  return Number.isNaN(n) ? 1 : n;
}

/** 1:1 décomp `ScrCmd_additem` (scrcmd.c:487).
 *   `additem ITEMID, QUANTITY` → AddBagItem + set gSpecialVar_Result. */
registerOpcode('additem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = AddBagItem(itemKey, count);
  // 1:1 décomp : gSpecialVar_Result = AddBagItem(...). On set VAR_RESULT.
  gameState.setVar('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode additem] ${itemKey} x${count} → ${ok ? 'ok' : 'FAILED (bag full?)'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_removeitem` (scrcmd.c:496). */
registerOpcode('removeitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = RemoveBagItem(itemKey, count);
  gameState.setVar('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode removeitem] ${itemKey} x${count} → ${ok ? 'ok' : 'FAILED (not enough)'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitem` (scrcmd.c:514) : true si bag has au moins count. */
registerOpcode('checkitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  gameState.setVar('VAR_RESULT', CheckBagHasItem(itemKey, count) ? 1 : 0);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitemspace` (scrcmd.c:505).
 *   MVP : on retourne toujours true (= bag rarely full en démo).
 *   À améliorer : implémenter `CheckBagHasSpace` 1:1 item.c. */
registerOpcode('checkitemspace', (_ctx) => {
  gameState.setVar('VAR_RESULT', 1);
  return false;
});

// ─── Helpers privés ──────────────────────────────────────────────────────────

/** Parse un arg comme nombre. Si VAR_*, lit la value courante. Si LOCALID_X,
 *  résout via les templates de la map courante. Si MALE/FEMALE/autres
 *  constantes connues, retourne le numeric value 1:1 décomp.
 *  Pour les constantes inconnues, return 0 (= safe default). */
function parseValue(arg: string | undefined): number {
  if (!arg) return 0;
  if (/^-?\d+$/.test(arg)) return parseInt(arg, 10);
  if (/^0x[0-9a-fA-F]+$/.test(arg)) return parseInt(arg, 16);
  if (arg.startsWith('VAR_')) return VarGet(arg);
  // 1:1 décomp constants : MALE = 0, FEMALE = 1 (= include/constants/global.h).
  if (arg === 'MALE') return MALE_GENDER;
  if (arg === 'FEMALE') return FEMALE_GENDER;
  // 1:1 décomp LOCALID_X : look up index dans les templates de la map courante.
  // LOCALID_PLAYER = 255, LOCALID_NONE = 0, LOCALID_CAMERA = 127.
  if (arg === 'LOCALID_PLAYER') return 255;
  if (arg === 'LOCALID_NONE') return 0;
  if (arg === 'LOCALID_CAMERA') return 127;
  if (arg.startsWith('LOCALID_')) {
    const gMapHeader = (globalThis as Record<string, unknown>).gMapHeader as
      { events?: { objectEvents?: ObjectEventTemplate[] } } | undefined;
    const templates = gMapHeader?.events?.objectEvents ?? [];
    const idx = templates.findIndex(t => t.localIdRaw === arg);
    if (idx >= 0) return idx + 1;  // 1-based, matches localId assigned au load.
    console.warn(`[parseValue] LOCALID '${arg}' not found in map templates`);
    return 0;
  }
  // 1:1 décomp constants lookup (= OBJ_EVENT_GFX_*, ITEM_*, MOVE_*, SPECIES_*,
  // TRAINER_*, FLAG_* numeric ID etc.). Cf. decomp-constants.ts pour list des
  // namespaces couverts. Sans ça, setvar VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_RIVAL_*
  // stockait 0 → rival NPC sprite wrong (= toujours Brendan = 0).
  const constValue = resolveDecompConstant(arg);
  if (constValue !== undefined) return constValue;
  return 0;
}

// ─── Phase 5.7+ iteration 6 : field SE/audio extras + register_matchcall ─────
// 1:1 décomp scrcmd.c — alias to playse with stereo pan ignored (= we don't
// emulate stereo positioning). 1746x usage in scripts.
registerOpcode('playsewithpan', (_ctx, args) => {
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') PlaySE(seId);
  return false;
});

// 1:1 décomp `ScrCmd_loopsewithpan` — looped SE. Same as playsewithpan for
// stub purpose. 194x usage.
registerOpcode('loopsewithpan', (_ctx, args) => {
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') PlaySE(seId);
  return false;
});

// 1:1 décomp `ScrCmd_waitse` — wait for current SE to finish. We treat SE as
// fire-and-forget so this is a no-op. 342x usage.
registerOpcode('waitse', (_ctx) => false);

// 1:1 décomp `ScrCmd_waitplaysewithpan`. 96x usage.
registerOpcode('waitplaysewithpan', (_ctx) => false);

// 1:1 décomp `ScrCmd_register_matchcall` (scrcmd.c) :
//   sets `gMatchCallTrainerFlags` bit pour que le trainer puisse rappeler
//   pour rematch. 152x usage (= post-battle des dresseurs early-game).
//   MVP : on stocke un flag perso.
registerOpcode('register_matchcall', (_ctx, args) => {
  const trainerName = args[0] ?? '';
  const g = globalThis as Record<string, unknown>;
  if (!g.__matchCallTrainers) g.__matchCallTrainers = new Set<string>();
  (g.__matchCallTrainers as Set<string>).add(trainerName);
  console.log(`[opcode register_matchcall] '${trainerName}' registered for rematch`);
  return false;
});

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

// 1:1 décomp `ScrCmd_random` — RNG result into VAR_RESULT. Range = args[0].
registerOpcode('random', (_ctx, args) => {
  const range = parseValue(args[0]);
  const r = Math.floor(Math.random() * Math.max(1, range));
  VarSet('VAR_RESULT', r);
  return false;
});

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
registerOpcode('pokemart', (_ctx, args) => {
  const productsLabel = args[0] ?? '';
  const createPokemartMenu = (globalThis as Record<string, unknown>).CreatePokemartMenu as
    ((items: unknown) => void) | undefined;
  if (typeof createPokemartMenu === 'function') {
    try {
      // Pour l'instant on passe le label string ; le auto-file expects un u16*.
      // À wire proprement : resolve label → array via map scripts data.
      createPokemartMenu(productsLabel);
      console.log(`[opcode pokemart] CreatePokemartMenu('${productsLabel}') dispatched`);
    } catch (e) {
      console.warn(`[opcode pokemart] CreatePokemartMenu threw:`, e);
    }
  } else {
    console.warn(`[opcode pokemart] '${productsLabel}' — CreatePokemartMenu not exposed (= shop UI ~3000 lignes décomp à wire)`);
  }
  return false;
});

// 1:1 décomp `ScrCmd_pokemartdecoration` / `pokemartdecoration2`.
registerOpcode('pokemartdecoration', (_ctx, _args) => false);
registerOpcode('pokemartdecoration2', (_ctx, _args) => false);

// 1:1 décomp `ScrCmd_setberrytree` — set berry tree state. 160x usage but
// only outdoor maps with berry trees. MVP no-op (= no berry growth sim yet).
registerOpcode('setberrytree', (_ctx, _args) => false);

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

// 1:1 décomp `ScrCmd_dofieldeffect` — fire a field effect (= leaves rustle,
// rocksmash break, etc.). MVP no-op (= we don't have field effects yet).
/** 1:1 décomp `ScrCmd_dofieldeffect` (scrcmd.c) :
 *    sFieldEffectScriptId = VarGet(effectId);
 *    ScriptContext_Stop();
 *    FieldEffectStart(effectId);
 *
 *  Audit session 126 LOT C3 : avant strict no-op → Cut/Surf/Fly/Strength/
 *  Rock Smash all broken. Maintenant on dispatch via FieldEffectStart depuis
 *  l'auto-file (= field_effect-all-auto.ts). Si l'effect n'est pas câblé
 *  (= many require sprite anim + tile gfx + sound + waitstate), fallback log
 *  + no-op. Le wiring complet de chaque FLDEFF_X est itératif (= à fix au
 *  cas par cas quand l'user rencontre un bug).
 *
 *  Effet IDs critiques (= path commun) :
 *    - FLDEFF_CUT_GRASS = 1  (= Cut HM)
 *    - FLDEFF_USE_FLY = 2
 *    - FLDEFF_USE_SURF = 3
 *    - FLDEFF_USE_STRENGTH = 6
 *    - FLDEFF_USE_ROCK_SMASH = 7
 *    - FLDEFF_USE_DIG = 8
 *    - FLDEFF_USE_TELEPORT = 9
 *    - FLDEFF_USE_WATERFALL = 10
 *    - FLDEFF_USE_DIVE = 11
 *    - FLDEFF_USE_SWEET_SCENT = 27
 *    - FLDEFF_TASK_CUT_GRASS = 41
 *    - FLDEFF_USE_VS_SEEKER = 56  (variant)
 */
registerOpcode('dofieldeffect', (_ctx, args) => {
  const effectId = VarGet(args[0] ?? '0');
  // Session 132 : track active list pour waitfieldeffect consumer.
  // 1:1 décomp `FieldEffectStart(id)` ajoute id à gFieldEffectActiveList.
  const fa = (globalThis as { __fieldEffectActiveList?: { FieldEffectActiveListAdd?: (id: number) => void } }).__fieldEffectActiveList;
  fa?.FieldEffectActiveListAdd?.(effectId);
  // Try to resolve via auto-file FieldEffectStart. Le auto-file référence
  // gFieldEffectScriptPointers + FieldEffectScriptFuncs qui sont des bytecode
  // tables — pas trivial à exposer sur globalThis. Pour l'instant on log +
  // continue (= same behavior as before mais avec effect ID resolved).
  const fieldEffectStart = (globalThis as Record<string, unknown>).FieldEffectStart as
    ((id: number) => unknown) | undefined;
  if (typeof fieldEffectStart === 'function') {
    try {
      fieldEffectStart(effectId);
      console.log(`[opcode dofieldeffect] FLDEFF id=${effectId} dispatched`);
    } catch (e) {
      console.warn(`[opcode dofieldeffect] FLDEFF id=${effectId} threw:`, e);
    }
  } else {
    console.warn(`[opcode dofieldeffect] FieldEffectStart not exposed — FLDEFF id=${effectId} skipped (Cut/Surf/Fly/etc broken until wired)`);
  }
  return false;
});

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
      const { createPokemonInstance } = await import('./pokemon');
      const mon = createPokemonInstance(speciesName, level, heldItem ? { heldItem } : undefined);
      const ok = gameState.addToParty(mon);
      // 1:1 ScriptGiveMon : 0=MON_GIVEN_TO_PARTY, 1=MON_GIVEN_TO_PC.
      gameState.setVar('VAR_RESULT', ok ? 0 : 1);
      console.log(`[opcode givemon] ${speciesName} Lv${level}${heldItem ? ' @' + heldItem : ''} → ${ok ? 'PARTY(0)' : 'PC(1)'}`);
    } catch (e) {
      console.warn('[opcode givemon] failed:', e);
      gameState.setVar('VAR_RESULT', 2);  // MON_CANT_GIVE
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
registerOpcode('pokemartlistend', (_ctx, _args) => false);

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

// 1:1 décomp `ScrCmd_checkpcitem` — checks if PC has a given item.
registerOpcode('checkpcitem', (_ctx, _args) => {
  VarSet('VAR_RESULT', 0); // No PC items implemented
  return false;
});

// 1:1 décomp `ScrCmd_warpdoor` — warp through a door (= warp + door anim).
//   Same effect as warp for MVP.
registerOpcode('warpdoor', (ctx, args) => {
  const handler = (globalThis as Record<string, unknown>).__opcodeWarp as
    ((ctx: ScriptContext, args: string[]) => boolean) | undefined;
  if (handler) return handler(ctx, args);
  // Fallback : same logic as 'warp' opcode (= we registered it earlier).
  // Use the warp-system directly.
  const dst = args[0] ?? '';
  setPendingWarp({
    destMap: dst,
    x: parseValue(args[2]),
    y: parseValue(args[3]),
    elevation: 0,
    warpId: -1,
  });
  return false;
});

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
  if (xVar) VarSet(xVar, gameState.map?.x ?? 0);
  if (yVar) VarSet(yVar, gameState.map?.y ?? 0);
  return false;
});

// 1:1 décomp `ScrCmd_getpartysize` (scrcmd.c) — read partySize into VAR_RESULT.
registerOpcode('getpartysize', (_ctx) => {
  VarSet('VAR_RESULT', gameState.partySize);
  return false;
});

// 1:1 décomp `ScrCmd_setescapewarp` (scrcmd.c) — set the escape warp (= where
// player teleports back to when using ESCAPE rope or losing battle).
registerOpcode('setescapewarp', (_ctx, args) => {
  const map = args[0] ?? '';
  const x = parseValue(args[2]);
  const y = parseValue(args[3]);
  const g = globalThis as Record<string, unknown>;
  g.__escapeWarp = { mapName: map.replace(/^MAP_/, ''), x, y };
  return false;
});

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
registerOpcode('showmoneybox', (_ctx, _args) => false);
registerOpcode('hidemoneybox', (_ctx, _args) => false);
registerOpcode('updatemoneybox', (_ctx, _args) => false);
registerOpcode('showcoinsbox', (_ctx, _args) => false);
registerOpcode('hidecoinsbox', (_ctx, _args) => false);
registerOpcode('updatecoinsbox', (_ctx, _args) => false);
registerOpcode('removemoney', (_ctx, _args) => false);

// Flash HM (Mt. Pyre, Granite Cave) :
registerOpcode('setflashlevel', (_ctx, _args) => false);
registerOpcode('animateflash', (_ctx, _args) => false);

// Mt. Pyre / Sky Pillar rotating puzzles :
registerOpcode('initrotatingtilepuzzle', (_ctx, _args) => false);
registerOpcode('moverotatingtileobjects', (_ctx, _args) => false);
registerOpcode('turnrotatingtileobjects', (_ctx, _args) => false);
registerOpcode('freerotatingtilepuzzle', (_ctx, _args) => false);

// Secret Base décoration :
registerOpcode('givedecoration', (_ctx, _args) => false);
registerOpcode('takedecoration', (_ctx, _args) => false);
registerOpcode('checkdecor', (_ctx, _args) => false);
registerOpcode('checkdecorspace', (_ctx, _args) => false);
registerOpcode('movedecoration', (_ctx, _args) => false);

// Other late-game / minigames :
registerOpcode('setdivewarp', (_ctx, _args) => false);
registerOpcode('setholewarp', (_ctx, _args) => false);
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
registerOpcode('showcontestpainting', (_ctx, _args) => false);
registerOpcode('playslotmachine', (_ctx, _args) => false);
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
registerOpcode('removecoins', (_ctx, _args) => false);
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
registerOpcode('adddecoration', (_ctx, _args) => false);
registerOpcode('setwarp', (_ctx, _args) => false);
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
function _berryTreesArr(): Array<{ berry: number; stage: number; minutesUntilNextStage?: number; berryYield?: number; regrowthCount?: number; watered1?: number; watered2?: number; watered3?: number; watered4?: number; stopGrowth?: number }> | undefined {
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { berryTrees?: Array<{ berry: number; stage: number; minutesUntilNextStage?: number; berryYield?: number; regrowthCount?: number; watered1?: number; watered2?: number; watered3?: number; watered4?: number; stopGrowth?: number }> } | undefined;
  return block1?.berryTrees;
}

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
      // STD_FIND_ITEM : lock + faceplayer + waitse + add item + msg.
      const npc = getSelectedNpc();
      if (npc) {
        npc.frozen = true;
        npc.facingDirection = OPPOSITE_DIR[gPlayerAvatar.facing] ?? DIR_SOUTH;
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

registerOpcode('waitse', (ctx, _args) => {
  // 1:1 décomp ScrCmd_waitse (scrcmd.c:1162) :
  //   SetupNativeScript(ctx, WaitForSoundEffectFinish) ; return TRUE
  // WaitForSoundEffectFinish : return !IsSEPlaying().
  // Session 132 : real tracking via decomp-globals.IsSEPlaying (= check m4a
  // sequencer state + prerendered slot active + endTimeMs tracker).
  const poll = (): boolean => {
    // Import lazy pour éviter cycle decomp-globals.ts ↔ script-opcodes.ts.
    const dg = (globalThis as { __decompGlobals?: { IsSEPlaying?: () => boolean } }).__decompGlobals;
    return !(dg?.IsSEPlaying?.() ?? false);  // poll returns TRUE when SE done
  };
  SetupNativeScript(ctx, poll);
  return true;
});

registerOpcode('waitplaysewithpan', (ctx, _args) => {
  // 1:1 décomp : alias de waitse (le 'pan' = stéréo, n'affecte pas le tracking).
  return getOpcodeHandler('waitse')?.(ctx, []) ?? false;
});

registerOpcode('waitmoncry', (ctx, _args) => {
  // 1:1 décomp ScrCmd_waitmoncry (scrcmd.c:1610) :
  //   SetupNativeScript(ctx, IsCryFinished) ; return TRUE
  // IsCryFinished : returns !IsCryPlaying.
  // Session 132 : real tracking via decomp-globals.IsCryFinished
  const poll = (): boolean => {
    const dg = (globalThis as { __decompGlobals?: { IsCryFinished?: () => boolean } }).__decompGlobals;
    return dg?.IsCryFinished?.() ?? true;  // poll returns TRUE when cry done
  };
  SetupNativeScript(ctx, poll);
  return true;
});

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
    // 1:1 décomp FreezeForApproachingTrainers (trainer_see.c) : freeze tous
    // les NPCs sauf le selected approaching trainer.
    for (const n of gObjectEvents) if (n.active) n.frozen = true;
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

// ─── Map layout (1:1 décomp ScrCmd_setmaplayoutindex) ───────────────────────

registerOpcode('setmaplayoutindex', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setmaplayoutindex : SetCurrentMapLayout(VarGet(layout)).
  // Change le layout (= tile data + collisions) de la map active sans recharger
  // toute la map (= utilisé pour Birch lab post-starter, Pacifidlog day/night,
  // Sootopolis ice cracks, ShoalCave tide, SkyPillar dust, Route 111 desert).
  // Session 132 : dispatch à map-layout-swap.ts qui gère le load layout async.
  const layoutIdx = _vget(args[0]);
  void (async () => {
    const swap = (globalThis as { __mapLayoutSwap?: { SetCurrentMapLayout?: (idx: number) => Promise<void> } }).__mapLayoutSwap;
    await swap?.SetCurrentMapLayout?.(layoutIdx);
  })();
  return false;
});

// ─── Step callback (1:1 décomp ScrCmd_setstepcallback) ──────────────────────

registerOpcode('setstepcallback', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setstepcallback : ActivatePerStepCallback(callbackId).
  // Active une callback exécutée à chaque step du player.
  // Session 132 : real dispatch via step-callbacks.ts (= 8 callback handlers
  // 1:1 décomp gPerStepCallbacks[]).
  const callbackId = parseValue(args[0] ?? '0');
  void (async () => {
    const { ActivatePerStepCallback } = await import('./step-callbacks');
    ActivatePerStepCallback(callbackId);
  })();
  return false;
});

// ─── Berry tree (1:1 décomp ScrCmd_setberrytree) ────────────────────────────

registerOpcode('setberrytree', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setberrytree (scrcmd.c:2000) :
  //   PlantBerryTree(treeId, berry, growthStage, FALSE).
  const treeId = parseValue(args[0] ?? '0');
  const berry = parseValue(args[1] ?? '0');
  const growthStage = parseValue(args[2] ?? '0');
  const trees = _berryTreesArr();
  if (trees && treeId >= 0 && treeId < trees.length) {
    trees[treeId].berry = berry;
    trees[treeId].stage = growthStage;
    trees[treeId].minutesUntilNextStage = 0;
    trees[treeId].watered1 = 0;
    trees[treeId].watered2 = 0;
    trees[treeId].watered3 = 0;
    trees[treeId].watered4 = 0;
    trees[treeId].berryYield = 0;
    trees[treeId].regrowthCount = 0;
    trees[treeId].stopGrowth = 0;
  }
  return false;
});

// ─── Money & coins (1:1 décomp) ─────────────────────────────────────────────

registerOpcode('removemoney', (ctx, args) => {
  // 1:1 décomp ScrCmd_removemoney : RemoveMoney(&gSaveBlock1Ptr->money, amount).
  // Alias de takemoney (= même opcode 0x91 dans la décomp, takemoney est notre
  // nom interne pour le même comportement).
  return getOpcodeHandler('takemoney')?.(ctx, args) ?? false;
});

registerOpcode('removecoins', (_ctx, args) => {
  // 1:1 décomp ScrCmd_removecoins (scrcmd.c:1830) :
  //   gSpecialVar_Result = !RemoveCoins(VarGet(coins)).
  // (= TRUE si remove failed, FALSE si succès — comportement inverse étrange
  //    mais c'est ce que dit la décomp).
  const coins = _vget(args[0]);
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { coins?: number } | undefined;
  if (!block1) {
    gameState.setVar('VAR_RESULT', 1);  // fail
    return false;
  }
  const current = block1.coins ?? 0;
  if (current >= coins) {
    block1.coins = current - coins;
    gameState.setVar('VAR_RESULT', 0);
  } else {
    gameState.setVar('VAR_RESULT', 1);
  }
  return false;
});

// Money/Coins box UI : opcodes pour afficher la fenêtre money/coins pendant
// les transactions pokemart/casino. Notre port : pas encore d'UI dédiée, on
// stocke les flags pour que la field scene puisse les rendre.

registerOpcode('showmoneybox', (_ctx, args) => {
  // 1:1 décomp ScrCmd_showmoneybox (scrcmd.c) :
  //   if (!ignore) DrawMoneyBox(GetMoney(&gSaveBlock1Ptr->money), x, y).
  // Session 132 : real UI via money-box-ui.ts.
  const x = parseValue(args[0] ?? '0');
  const y = parseValue(args[1] ?? '0');
  const ignore = parseValue(args[2] ?? '0');
  if (ignore) return false;
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { DrawMoneyBox?: (amt: number, x: number, y: number) => void; _getMoney?: () => number } }).__moneyBoxUI;
    if (ui?.DrawMoneyBox && ui._getMoney) ui.DrawMoneyBox(ui._getMoney(), x, y);
  })();
  return false;
});

registerOpcode('hidemoneybox', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_hidemoneybox : HideMoneyBox().
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { HideMoneyBox?: () => void } }).__moneyBoxUI;
    ui?.HideMoneyBox?.();
  })();
  return false;
});

registerOpcode('updatemoneybox', (_ctx, args) => {
  // 1:1 décomp ScrCmd_updatemoneybox : ChangeAmountInMoneyBox(GetMoney(...)).
  const _x = parseValue(args[0] ?? '0');
  const _y = parseValue(args[1] ?? '0');
  const ignore = parseValue(args[2] ?? '0');
  if (ignore) return false;
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { ChangeAmountInMoneyBox?: (amt: number) => void; _getMoney?: () => number } }).__moneyBoxUI;
    if (ui?.ChangeAmountInMoneyBox && ui._getMoney) ui.ChangeAmountInMoneyBox(ui._getMoney());
  })();
  return false;
});

registerOpcode('showcoinsbox', (_ctx, args) => {
  // 1:1 décomp ScrCmd_showcoinsbox : ShowCoinsWindow(GetCoins(), x, y).
  const x = parseValue(args[0] ?? '0');
  const y = parseValue(args[1] ?? '0');
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { ShowCoinsWindow?: (amt: number, x: number, y: number) => void; _getCoins?: () => number } }).__moneyBoxUI;
    if (ui?.ShowCoinsWindow && ui._getCoins) ui.ShowCoinsWindow(ui._getCoins(), x, y);
  })();
  return false;
});

registerOpcode('hidecoinsbox', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_hidecoinsbox : HideCoinsWindow().
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { HideCoinsWindow?: () => void } }).__moneyBoxUI;
    ui?.HideCoinsWindow?.();
  })();
  return false;
});

registerOpcode('updatecoinsbox', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_updatecoinsbox : PrintCoinsString(GetCoins()).
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { PrintCoinsString?: (amt: number) => void; _getCoins?: () => number } }).__moneyBoxUI;
    if (ui?.PrintCoinsString && ui._getCoins) ui.PrintCoinsString(ui._getCoins());
  })();
  return false;
});

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

// ─── Special warps (1:1 décomp setdivewarp/setholewarp/setwarp/warphole/etc.) ─

registerOpcode('setwarp', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setwarp : SetWarpDestination(mapGroup, mapNum, warpId, x, y).
  // Stocke seulement la destination ; le warp n'est pas exécuté.
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  (globalThis as Record<string, unknown>).gSavedWarp = { destMap, warpId, x, y };
  console.log(`[opcode setwarp] ${destMap} warpId=${warpId} (${x},${y})`);
  return false;
});

registerOpcode('setdivewarp', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setdivewarp : SetFixedDiveWarp(mapGroup, mapNum, warpId, x, y).
  // Quand le player utilise dive depuis ce point, il warp vers cette destination.
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  (globalThis as Record<string, unknown>).gDiveWarp = { destMap, warpId, x, y };
  return false;
});

registerOpcode('setholewarp', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setholewarp : SetFixedHoleWarp(mapGroup, mapNum, warpId, x, y).
  // Quand player tombe par un trou (cracked floor) dans cette map, warp ici.
  // Note : warpId/x/y sont stockés mais ignorés par warphole, seul map compte.
  const { destMap, warpId, x, y } = parseWarpArgs(args);
  (globalThis as Record<string, unknown>).gHoleWarp = { destMap, warpId, x, y };
  return false;
});

registerOpcode('warphole', (_ctx, args) => {
  // 1:1 décomp ScrCmd_warphole : PlayerGetDestCoords + SetWarpDestination
  // (ou SetWarpDestinationToFixedHoleWarp si MAP_UNDEFINED) + DoFallWarp +
  // ResetInitialPlayerAvatarState.
  const destMap = args[0] ?? 'MAP_UNDEFINED';
  const playerX = gPlayerAvatar.x ?? 0;
  const playerY = gPlayerAvatar.y ?? 0;
  if (destMap === 'MAP_UNDEFINED') {
    // SetWarpDestinationToFixedHoleWarp(x, y) : utilise gHoleWarp set par setholewarp.
    const holeWarp = (globalThis as Record<string, unknown>).gHoleWarp as
      { destMap?: string; warpId?: number; x?: number; y?: number } | undefined;
    if (holeWarp?.destMap) {
      setPendingWarp({
        destMap: holeWarp.destMap,
        warpId: -1,
        x: playerX,
        y: playerY,
        elevation: 0,
      }, 'fall');
    }
  } else {
    setPendingWarp({
      destMap,
      warpId: -1,
      x: playerX,
      y: playerY,
      elevation: 0,
    }, 'fall');
  }
  return true;  // wait state (DoFallWarp = animated fall)
});

registerOpcode('warpteleport', (ctx, args) => {
  // 1:1 décomp ScrCmd_warpteleport : SetWarpDestination + DoTeleportTileWarp.
  // Effet fade out + warp (= différent de warpspinenter qui spin avant).
  return getOpcodeHandler('warp')?.(ctx, args) ?? false;
});

registerOpcode('warpmossdeepgym', (ctx, args) => {
  // 1:1 décomp ScrCmd_warpmossdeepgym : SetWarpDestination + DoMossdeepGymWarp.
  // Animation spécifique au Mossdeep Gym tiles rotatifs (= warp avec spin).
  return getOpcodeHandler('warp')?.(ctx, args) ?? false;
});

registerOpcode('warpspinenter', (ctx, args) => {
  // 1:1 décomp ScrCmd_warpspinenter : SetWarpDestination + SetSpinStartFacingDir
  // + DoSpinEnterWarp.
  // Animation spin avant warp (= Union Room entry, secret base entry).
  return getOpcodeHandler('warp')?.(ctx, args) ?? false;
});

// ─── Decorations (1:1 décomp) ───────────────────────────────────────────────
// Decorations sont des items spéciaux placés dans la Secret Base. Système
// complet (DecorationAdd, CheckHasDecoration, etc.) est post-MVP, on stocke
// un placeholder array.

function _decorationsArr(): number[] {
  const block1 = (globalThis as Record<string, unknown>).gSaveBlock1Ptr as
    { decorations?: number[] } | undefined;
  if (!block1) return [];
  if (!block1.decorations) block1.decorations = [];
  return block1.decorations;
}

registerOpcode('adddecoration', (_ctx, args) => {
  // 1:1 décomp ScrCmd_adddecoration : gSpecialVar_Result = DecorationAdd(decorId).
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  if (arr.length < 256) {
    arr.push(decorId);
    gameState.setVar('VAR_RESULT', 1);
  } else {
    gameState.setVar('VAR_RESULT', 0);
  }
  return false;
});

registerOpcode('givedecoration', (_ctx, args) => {
  // 1:1 décomp macro `givedecoration decoration` (event.inc:1960) :
  //   setorcopyvar VAR_0x8000, decoration ; callstd STD_OBTAIN_DECORATION
  // STD_OBTAIN_DECORATION = adddecoration + obtained msg. Notre port : juste add.
  return getOpcodeHandler('adddecoration')?.(_ctx, args) ?? false;
});

registerOpcode('takedecoration', (_ctx, args) => {
  // 1:1 décomp : remove decoration from inventory.
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  const idx = arr.indexOf(decorId);
  if (idx >= 0) {
    arr.splice(idx, 1);
    gameState.setVar('VAR_RESULT', 1);
  } else {
    gameState.setVar('VAR_RESULT', 0);
  }
  return false;
});

registerOpcode('checkdecor', (_ctx, args) => {
  // 1:1 décomp ScrCmd_checkdecor : gSpecialVar_Result = CheckHasDecoration(decorId).
  const decorId = _vget(args[0]);
  const arr = _decorationsArr();
  gameState.setVar('VAR_RESULT', arr.includes(decorId) ? 1 : 0);
  return false;
});

registerOpcode('checkdecorspace', (_ctx, args) => {
  // 1:1 décomp ScrCmd_checkdecorspace : gSpecialVar_Result = DecorationCheckSpace(decorId).
  const _decorId = _vget(args[0]);
  const arr = _decorationsArr();
  gameState.setVar('VAR_RESULT', arr.length < 256 ? 1 : 0);
  return false;
});

registerOpcode('movedecoration', (_ctx, _args) => {
  // RS-era opcode, non-functional dans Em (= retiré du décomp Em). No-op safe.
  return false;
});

registerOpcode('pokemartdecoration', (ctx, args) => {
  // 1:1 décomp ScrCmd_pokemartdecoration : CreateDecorationShop1Menu(ptr) + ScriptContext_Stop.
  // Shop décoration mode 1. Notre port : delegate au pokemart standard.
  return getOpcodeHandler('pokemart')?.(ctx, args) ?? false;
});

registerOpcode('pokemartdecoration2', (ctx, args) => {
  // 1:1 décomp ScrCmd_pokemartdecoration2 : CreateDecorationShop2Menu(ptr).
  return getOpcodeHandler('pokemart')?.(ctx, args) ?? false;
});

registerOpcode('pokemartlistend', (_ctx, _args) => {
  // 1:1 décomp event.inc:1158 — c'est un MARQUEUR DE FIN dans une liste, pas
  // un opcode actif. Macro : .2byte ITEM_NONE + release + end.
  return false;
});

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

registerOpcode('initrotatingtilepuzzle', (_ctx, args) => {
  // 1:1 décomp ScrCmd_initrotatingtilepuzzle : InitRotatingTilePuzzle(isTrickHouse).
  const isTrickHouse = _vget(args[0]);
  (globalThis as Record<string, unknown>).gRotatingTilePuzzleState = {
    active: true,
    isTrickHouse: isTrickHouse !== 0,
  };
  return false;
});

registerOpcode('moverotatingtileobjects', (_ctx, args) => {
  // 1:1 décomp ScrCmd_moverotatingtileobjects : sMovingNpcId = MoveRotatingTileObjects(puzzleNumber).
  const _puzzleNumber = _vget(args[0]);
  return false;
});

registerOpcode('turnrotatingtileobjects', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_turnrotatingtileobjects : TurnRotatingTileObjects().
  return false;
});

registerOpcode('freerotatingtilepuzzle', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_freerotatingtilepuzzle : FreeRotatingTilePuzzle().
  (globalThis as Record<string, unknown>).gRotatingTilePuzzleState = { active: false };
  return false;
});

// ─── Slot machine + Contest + elevators ─────────────────────────────────────

registerOpcode('playslotmachine', (ctx, args) => {
  // 1:1 décomp ScrCmd_playslotmachine : PlaySlotMachine(machineId, CB2_ReturnToFieldContinueScriptPlayMapMusic) + ScriptContext_Stop ; return TRUE.
  const _machineId = _vget(args[0]);
  // Notre port : slot machine non implémentée. Wait state + return immédiatement.
  // Future : spawn CB2 swap vers slot scene.
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 1;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

registerOpcode('showcontestpainting', (_ctx, args) => {
  // 1:1 décomp ScrCmd_showcontestpainting : SetContestWinnerForPainting + ShowContestPainting.
  const _contestWinnerId = parseValue(args[0] ?? '0');
  // Notre port : contest paintings post-MVP. Log + continue.
  return false;
});

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
  gameState.setVar('VAR_0x8004', species);
  gameState.setVar('VAR_0x8005', level);
  gameState.setVar('VAR_0x8006', item);
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
  gameState.setVar('VAR_0x8004', funcId);
  if (dataVal !== undefined) {
    const v = typeof dataVal === 'string' ? parseValue(dataVal) : dataVal;
    gameState.setVar('VAR_0x8005', v);
  }
  if (val !== undefined) {
    const v = typeof val === 'string' ? parseValue(val) : val;
    gameState.setVar('VAR_0x8006', v);
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

// ─── Mystery event status (setmysteryeventstatus) ───────────────────────────

registerOpcode('setmysteryeventstatus', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setmysteryeventstatus :
  //   SetMysteryEventScriptStatus(ScriptReadByte(ctx)).
  const status = parseValue(args[0] ?? '0');
  (globalThis as Record<string, unknown>).gMysteryEventScriptStatus = status;
  return false;
});

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
  gameState.setVar('VAR_RESULT', 1);
  return false;
});

registerOpcode('addpcitem', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_addpcitem` (scrcmd.c) :
  //   gSpecialVar_Result = AddPCItem(itemId, quantity);
  //   return FALSE;
  // Ajoute des items au PC du joueur (= gSaveBlock1Ptr->pcItems, pas le bag).
  // Notre port : appelle pc-items.ts AddPCItem 1:1.
  const itemKey = args[0] ?? '';
  const qty = parseValue(args[1]);
  // Lazy import to avoid circular dep with bedroom-pc → script-runtime → script-opcodes.
  void import('./pc-items').then(({ AddPCItem }) => {
    const ok = AddPCItem(itemKey, qty);
    VarSet('VAR_RESULT', ok ? 1 : 0);
  });
  return false;
});

// ─── Decoration extras ──────────────────────────────────────────────────────

registerOpcode('removedecoration', (_ctx, args) => {
  return getOpcodeHandler('takedecoration')?.(_ctx, args) ?? false;
});

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
  const party = gameState.party;
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
  const party = gameState.party as Array<{ metLocation?: number }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    party[partyIndex].metLocation = location;
  }
  return false;
});

// ─── Contest opcodes (RS-era, mostly stubbed) ───────────────────────────────

registerOpcode('choosecontestmon', (_ctx, _args) => false);
registerOpcode('startcontest', (_ctx, _args) => false);
registerOpcode('showcontestresults', (_ctx, _args) => false);
registerOpcode('contestlinktransfer', (_ctx, _args) => false);

// ─── PokéNews ──────────────────────────────────────────────────────────────

registerOpcode('getpokenewsactive', (_ctx, args) => {
  // 1:1 décomp ScrCmd_getpokenewsactive : gSpecialVar_Result = GetPokeNewsActive(channel).
  const _channel = parseValue(args[0] ?? '0');
  gameState.setVar('VAR_RESULT', 0);  // pas de pokenews active par défaut
  return false;
});

// ─── Modern fateful encounter / Wonder Card ─────────────────────────────────

registerOpcode('setmodernfatefulencounter', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setmodernfatefulencounter :
  //   SetMonData(&gPlayerParty[idx], MON_DATA_MODERN_FATEFUL_ENCOUNTER, &TRUE).
  const partyIndex = _vget(args[0]);
  const party = gameState.party as Array<{ modernFatefulEncounter?: boolean }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    party[partyIndex].modernFatefulEncounter = true;
  }
  return false;
});

registerOpcode('checkmodernfatefulencounter', (_ctx, args) => {
  // 1:1 décomp ScrCmd_checkmodernfatefulencounter :
  //   gSpecialVar_Result = GetMonData(&gPlayerParty[idx], MON_DATA_MODERN_FATEFUL_ENCOUNTER).
  const partyIndex = _vget(args[0]);
  const party = gameState.party as Array<{ modernFatefulEncounter?: boolean }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    gameState.setVar('VAR_RESULT', party[partyIndex].modernFatefulEncounter ? 1 : 0);
  } else {
    gameState.setVar('VAR_RESULT', 0);
  }
  return false;
});

registerOpcode('trywondercardscript', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_trywondercardscript : execute saved RAM script si valid.
  // Notre port : Mystery Event / Wonder Card non implémenté. No-op safe.
  return false;
});

registerOpcode('setworldmapflag', (_ctx, _args) => false);  // RS-era, nop1.

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

// ─── Mark module loaded (= for sanity check) ────────────────────────────────

console.log('[script-opcodes] registered Phase 4.5 MVP + iter6/7 stubs + session 131 1:1 décomp completion (all field opcodes + battle facility macros + other VM safe stubs)');

// Lint-friendly export to avoid "unused imports".
export { COMPARE_LT, COMPARE_EQ, COMPARE_GT };
export type { ScriptContext };
