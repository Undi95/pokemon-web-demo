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
  SetupNativeScript, getScript, getText,
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
import { RtcCalcLocalTime, gLocalTime } from './rtc';
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
  // 1:1 décomp ScrCmd_release : HideFieldMessageBox + unfreeze selected NPC.
  HideFieldMessageBox();
  const npc = getSelectedNpc();
  if (npc) npc.frozen = false;
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
        // 0 (OUI), 1 (NON), -1 (B = NON), or -2 (no choice yet).
        const result = Menu_ProcessInputNoWrapClearOnChoose();
        if (result === -2) return false;
        const yesNoResult = result === 0 ? 0 : 1;
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
    // 1:1 décomp menu.c : -1 (B pressed) treated as NON = 1.
    const yesNoResult = result === 0 ? 0 : 1;
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
  // Phase 6 (session 124) : WallClock UI inline. PC time as source + 366-day
  // overflow fix. Le décomp `Special_ViewWallClock` / `StartWallClock` ouvrent
  // un CB2_WallClock UI complet avec aiguilles affines + tilemap. Notre version
  // utilise un overlay HTML/Canvas (= pas pixel-perfect mais fonctionnel +
  // joli). Le mode SET est techniquement reachable via dev console seulement.
  // Cf. wallclock-flow.ts pour détails + memory/next-session-bugs-2026-05-09.md
  // Bug 4 pour rationale.
  if (name === 'Special_ViewWallClock' || name === 'StartWallClock') {
    const mode: 'VIEW' | 'SET' = name === 'StartWallClock' ? 'SET' : 'VIEW';
    let flowReady = false;
    let flow: { tick: () => boolean } | null = null;
    void import('./wallclock-flow').then((mod) => {
      flow = mod.startWallClockFlow(mode);
      flowReady = true;
    });
    SetupNativeScript(ctx, () => {
      if (!flowReady) return false;
      return flow!.tick();
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
  console.log(`[opcode playfanfare] '${args[0]}' (audio TBD)`);
  return false;
});

registerOpcode('waitfanfare', (_ctx) => {
  // No-op pour MVP.
  return false;
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

/** 1:1 décomp `ScrCmd_savebgm` (scrcmd.c) : save current BGM for later restore. */
registerOpcode('savebgm', (_ctx, _args) => {
  // No-op for MVP — would track current song id for restore.
  return false;
});

/** 1:1 décomp `ScrCmd_fadedefaultbgm` (scrcmd.c) : fade back to default BGM. */
registerOpcode('fadedefaultbgm', (_ctx, _args) => {
  // No-op for MVP — would fade to map default BGM.
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
  const localIdRaw = _resolveObjectLocalIdRaw(args[0] ?? '');
  const gMapHeader = (globalThis as Record<string, unknown>).gMapHeader as
    { events?: { objectEvents?: ObjectEventTemplate[] } } | undefined;
  const tpl = gMapHeader?.events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagSet(tpl.flagId);
  // Find active NPC + mark inactive.
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) npc.active = false;
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

registerOpcode('hideobjectat', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_setobjectinvisibility(localId, mapNum, mapGroup)` qui
  // pose le flag d'invisibilité PERSISTANT sur le NPC du `mapGroup.mapNum`
  // donné. Différence avec `hideobject` (= sans `at`) : `hideobjectat` cible
  // un NPC d'une AUTRE map (= localId résolu sur la map donnée), alors que
  // `hideobject` cible un NPC de la map courante.
  //
  // Usage typique : `hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN`
  // après que Mom a remis les Running Shoes au joueur dans la maison →
  // Mom ne réapparaît plus à l'extérieur quand le joueur sort.
  //
  // Notre impl : SetFlag(flagId) du template (= persiste dans saveBlock1.flags)
  // + désactive le NPC actif si trouvé. La map cible peut être différente de
  // la map courante : on cherche le template via `(localIdRaw + mapName)` mais
  // pour la simplicité on déclenche juste le flag — au prochain spawn de la
  // map cible, le flag sera vu et le NPC restera caché.
  const localIdRaw = args[0] ?? '';
  const mapName = args[1] ?? '';  // e.g. 'MAP_LITTLEROOT_TOWN'
  // Resolve flag via la map cible si possible (= via header cache).
  const headersCache = (globalThis as Record<string, unknown>).__mapHeadersCache as
    Record<string, { events?: { objectEvents?: ObjectEventTemplate[] } }> | undefined;
  let tpl: ObjectEventTemplate | undefined;
  if (headersCache && mapName in headersCache) {
    tpl = headersCache[mapName].events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  } else {
    // Fallback : map courante.
    const gMapHeader = (globalThis as Record<string, unknown>).gMapHeader as
      { events?: { objectEvents?: ObjectEventTemplate[] } } | undefined;
    tpl = gMapHeader?.events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  }
  if (tpl?.flagId) FlagSet(tpl.flagId);
  // Si le NPC est actif sur la map COURANTE (= player y est), désactive aussi.
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) {
    npc.active = false;
    npc.invisible = true;
  }
  return false;
});

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
  // Resolve species : VAR_X → lookup, else assume direct enum.
  const speciesName = speciesArg.startsWith('VAR_') || speciesArg.startsWith('0x80')
    ? `SPECIES_${gameState.getVar(speciesArg)}`  // crude mapping
    : speciesArg;
  void import('./decomp-globals').then(({ PlayCryInternal }) => {
    PlayCryInternal(speciesName, 0, 64, 0, 0);
  }).catch(() => {});
  return false;
});

/** 1:1 décomp `ScrCmd_waitmoncry` (scrcmd.c) : wait for cry to finish. No-op MVP. */
registerOpcode('waitmoncry', (_ctx, _args) => false);

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
registerOpcode('givecoins', (_ctx, _args) => false);

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

/** 1:1 décomp `addtronyc_extras` Pokemon-related. Stub. */
registerOpcode('givepokemon', (_ctx, _args) => false);

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
registerOpcode('setweather', (_ctx, _args) => false);
registerOpcode('doweather', (_ctx, _args) => false);
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
registerOpcode('setdoor_opened', (_ctx, _args) => false);
registerOpcode('setdoor_closed', (_ctx, _args) => false);
registerOpcode('addelevmenuitem', (_ctx, _args) => false);
registerOpcode('showelevmenu', (_ctx, _args) => false);
registerOpcode('checkcoins', (_ctx, _args) => {
  gameState.setVar('VAR_RESULT', 0);
  return false;
});
registerOpcode('takecoins', (_ctx, _args) => false);
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
  const speciesName = lead?.speciesNameFr ?? (lead?.species ? getSpeciesNameFr(lead.species) : '');
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
registerOpcode('vmessage', (_ctx, _args) => false);
registerOpcode('vmsgbox', (_ctx, _args) => false);
registerOpcode('vbufferstring', (_ctx, _args) => false);
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
registerOpcode('finditem', (_ctx, _args) => {
  // Note: real impl would load item from event_objects template + add to bag.
  console.log('[opcode finditem] stub — TODO field item find UI');
  VarSet('VAR_RESULT', 1);
  return false;
});

// 1:1 décomp `ScrCmd_pokemart` — open pokemart UI with mart list pointer.
//   MVP : log + skip (= no shop UI yet).
registerOpcode('pokemart', (_ctx, args) => {
  console.log(`[opcode pokemart] '${args[0]}' — TODO pokemart UI`);
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
registerOpcode('dofieldeffect', (_ctx, args) => {
  console.log(`[opcode dofieldeffect] effect=${args[0]} — TODO field effects`);
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
registerOpcode('givemon', (_ctx, args) => {
  console.log(`[opcode givemon] species=${args[0]} level=${args[1]} item=${args[2]} — TODO gift mon`);
  VarSet('VAR_RESULT', 1); // success
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
  const dst = (args[0] ?? '').replace(/^MAP_/, '');
  setPendingWarp({ mapName: dst, x: parseValue(args[2]), y: parseValue(args[3]) });
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
  if (xVar) VarSet(xVar, gameState.player?.x ?? 0);
  if (yVar) VarSet(yVar, gameState.player?.y ?? 0);
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

// Catch-all : pour les opcodes vraiment rares (5 ou moins usages global) on
// peut log + skip via le default warning. Si tu vois des warns en jouant,
// re-run audits + ajoute les stubs ici.

// ─── Mark module loaded (= for sanity check) ────────────────────────────────

console.log('[script-opcodes] registered Phase 4.5 MVP opcodes + iter6/7 stubs');

// Lint-friendly export to avoid "unused imports".
export { COMPARE_LT, COMPARE_EQ, COMPARE_GT };
export type { ScriptContext };
