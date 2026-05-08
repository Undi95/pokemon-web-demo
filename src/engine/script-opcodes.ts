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
  gObjectEvents, type ObjectEvent,
} from './object-events';
import {
  gPlayerAvatar, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
} from './player-avatar';
import { getRuntime } from './decomp-globals';

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

/** `goto_if_eq A, B, label` — A et B peuvent être var noms ou immediates. */
registerOpcode('goto_if_eq', (ctx, args) => {
  const a = VarGet(args[0]);
  const b = VarGet(args[1]);
  if (a === b) {
    const label = args[2];
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_ne', (ctx, args) => {
  const a = VarGet(args[0]);
  const b = VarGet(args[1]);
  if (a !== b) {
    const label = args[2];
    const target = getScript(label);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_lt', (ctx, args) => {
  if (VarGet(args[0]) < VarGet(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptJump(ctx, target);
  }
  return false;
});

registerOpcode('goto_if_gt', (ctx, args) => {
  if (VarGet(args[0]) > VarGet(args[1])) {
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
  if (VarGet(args[0]) === VarGet(args[1])) {
    const target = getScript(args[2]);
    if (target) ScriptCall(ctx, target);
  }
  return false;
});

registerOpcode('call_if_ne', (ctx, args) => {
  if (VarGet(args[0]) !== VarGet(args[1])) {
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
  const a = VarGet(args[0]);
  const b = VarGet(args[1]);
  ctx.comparisonResult = Compare(a, b);
  return false;
});

registerOpcode('checkplayergender', (_ctx, _args) => {
  gSpecialVar.Result = gPlayerAvatar.gender === 'MALE' ? MALE_GENDER : FEMALE_GENDER;
  return false;
});

// ─── Lock / Release / FacePlayer ─────────────────────────────────────────────

registerOpcode('lock', (_ctx) => {
  // 1:1 décomp ScrCmd_lock : freeze le NPC sélectionné + waitForPlayer.
  const npc = getSelectedNpc();
  if (npc) npc.frozen = true;
  // Player input lock via LockPlayerFieldControls (= déjà fait par
  // ScriptContext_SetupScript). lock opcode s'assure juste que c'est set.
  return false;
});

registerOpcode('lockall', (_ctx) => {
  // 1:1 décomp : freeze tous les NPCs.
  for (const npc of gObjectEvents) {
    if (npc.active) npc.frozen = true;
  }
  return false;
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
 *  des std scripts MSGBOX_NPC, MSGBOX_DEFAULT, MSGBOX_SIGN).
 *
 *  MSGBOX_NPC      = 2 → lock + faceplayer + message + waitmessage + waitbuttonpress + release
 *  MSGBOX_SIGN     = 3 → lockall + message + waitmessage + waitbuttonpress + releaseall
 *  MSGBOX_DEFAULT  = 4 → idem MSGBOX_NPC (= avec ou sans faceplayer selon variantes)
 *  MSGBOX_YESNO    = 5 → not implemented yet (= besoin yes/no menu)
 *  MSGBOX_AUTOCLOSE= 6 → message + waitmessage + waitbuttonpress + closemessage
 *
 *  Implémenté via SetupNativeScript : state machine polling chaque frame. */
registerOpcode('msgbox', (ctx, args) => {
  const textLabel = args[0];
  const type = args[1] ?? 'MSGBOX_DEFAULT';
  const rawText = getText(textLabel);
  if (!rawText) {
    console.warn(`[opcode msgbox] text '${textLabel}' not found`);
    return false;
  }

  const isSign = type === 'MSGBOX_SIGN';
  let state = 0;

  const tick = (): boolean => {
    switch (state) {
      case 0: {
        // Lock + face player.
        if (isSign) {
          for (const n of gObjectEvents) if (n.active) n.frozen = true;
        } else {
          const npc = getSelectedNpc();
          if (npc) {
            npc.frozen = true;
            npc.facingDirection = OPPOSITE_DIR[gPlayerAvatar.facing] ?? DIR_SOUTH;
          }
        }
        // Show message.
        ShowFieldMessage(rawText);
        state = 1;
        return false;
      }
      case 1: {
        // Wait for message done.
        if (IsFieldMessageBoxHidden()) {
          state = 2;
        }
        return false;
      }
      case 2: {
        // Wait for A/B button press. 1:1 décomp `TextPrinterWait` (text.c:884)
        // qui PlaySE(SE_SELECT) sur A/B press → match comportement ROM.
        if (isAOrBNewlyPressed()) {
          // SE_SELECT = 5 (= 1:1 décomp constants/songs.h).
          void import('./decomp-globals').then(({ PlaySE }) => PlaySE(5));
          // Release : close dialog + unfreeze NPC(s).
          HideFieldMessageBox();
          if (isSign) {
            for (const n of gObjectEvents) if (n.active) n.frozen = false;
          } else {
            const npc = getSelectedNpc();
            if (npc) npc.frozen = false;
          }
          return true;  // resume bytecode
        }
        return false;
      }
    }
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

registerOpcode('waitstate', (_ctx) => {
  // 1:1 décomp ScrCmd_waitstate : ScriptContext_Stop. Used par warp completion.
  // Pour MVP : juste continuer (= warp Phase 4.6 wirera ça).
  console.log('[opcode waitstate] no-op (Phase 4.6)');
  return false;
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
registerOpcode('special', (_ctx, args) => {
  _invokeSpecial(args[0] as string);
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

// Standard NPC scripts utilitaires fréquemment appelés via `call` :
// Common_EventScript_SetupRivalGfxId, Common_EventScript_SaveGame, etc.
// On warn la 1ère fois seulement (= via dispatchOpcode default behavior).

// ─── Object events utility opcodes ───────────────────────────────────────────

registerOpcode('setobjectxy', (_ctx, args) => {
  const localId = parseInt(args[0], 10) || 0;
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localId === localId) {
      npc.currentCoordsX = x;
      npc.currentCoordsY = y;
      npc.previousCoordsX = x;
      npc.previousCoordsY = y;
      break;
    }
  }
  return false;
});

registerOpcode('setobjectxyperm', (_ctx, args) => {
  // 1:1 décomp : modifie initialCoords (= position permanent au respawn).
  const localId = parseInt(args[0], 10) || 0;
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localId === localId) {
      npc.initialCoordsX = x;
      npc.initialCoordsY = y;
      break;
    }
  }
  return false;
});

registerOpcode('setobjectmovementtype', (_ctx, args) => {
  const localId = parseInt(args[0], 10) || 0;
  const movementType = args[1];
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localId === localId) {
      npc.movementType = movementType;
      // Reset movement step car le type a changé.
      npc.movementStep = 0;
      break;
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

// ─── Helpers privés ──────────────────────────────────────────────────────────

/** Parse un arg comme nombre. Si ressemble à un VAR / constante, return 0
 *  (= les constantes symboliques type FLAG_X, MAP_X devraient être traitées
 *  par les opcodes qui les utilisent, pas ici). */
function parseValue(arg: string | undefined): number {
  if (!arg) return 0;
  if (/^-?\d+$/.test(arg)) return parseInt(arg, 10);
  if (/^0x[0-9a-fA-F]+$/.test(arg)) return parseInt(arg, 16);
  // Si VAR_*, lit la value courante. Si autre constante symbolique, return 0.
  if (arg.startsWith('VAR_')) return VarGet(arg);
  return 0;
}

// ─── Mark module loaded (= for sanity check) ────────────────────────────────

console.log('[script-opcodes] registered Phase 4.5 MVP opcodes');

// Lint-friendly export to avoid "unused imports".
export { COMPARE_LT, COMPARE_EQ, COMPARE_GT };
export type { ScriptContext };
