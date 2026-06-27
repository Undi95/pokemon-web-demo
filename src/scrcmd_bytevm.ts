/**
 * scrcmd_bytevm.ts — handlers du byte-VM, 1:1 de `src/scrcmd.c` (Phase 4, slice).
 *
 * TRANSITOIRE : deviendra `src/scrcmd.ts` (handlers dispatch-par-nom actuels) au
 * swap. Chaque handler lit ses args via ScriptRead{Byte,Halfword,Word} et renvoie
 * TRUE pour wait — exactement comme scrcmd.c.
 *
 * SLICE INITIAL = opcodes d'état + flux (sans UI ni specials) : prouve la chaîne
 * bytecode → VM → dispatch → handler → état du jeu, contrôle de flux inclus
 * (goto/call/return/goto_if via offsets de l'image globale).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c (1:1).
 */

import {
  ScriptContext, ScrCmdFunc, gScriptCmdTable,
  ScriptReadByte, ScriptReadHalfword, ScriptReadWord,
  ScriptJump, ScriptCall, ScriptReturn, StopScript, SetupNativeScript,
  ScriptContext_Stop, ptrFromOffset, resolveSymbol, resolveMapSymbol, getScriptOffset,
} from './script_bytevm';
import { VarGet, VarSet, GetVarPointer, FlagSet, FlagClear, FlagGet } from './event_data';
import { setPendingWarp } from './engine/field/warp-system';
import { AddMoney, RemoveMoney, IsEnoughMoney } from './money';
import { AddBagItem, RemoveBagItem, CheckBagHasItem, CheckBagHasSpace } from './engine/bag/bag';
import { GetCoins, AddCoins, RemoveCoins } from './coins';
import { VAR_RESULT } from '../include/constants/vars';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
// Registre des specials (name→fn) du moteur actuel — réutilisé transitoirement
// (les fns de special sont les mêmes fns de jeu 1:1). gSpecials[id] = invokeSpecial(name).
import { invokeSpecial } from './scrcmd';
import { getText } from './script';
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from './field_message_box';
// Système object-events / joueur (mêmes fns 1:1 que les handlers parsés vérifiés).
import { getSelectedNpc, OPPOSITE_DIR, isPlayerStepFinished } from './engine/script/script-opcodes-helpers';
import { gSelectedObjectEvent } from './engine/script/script-vars';
import {
  FreezeObjectEvent, UnfreezeObjectEvent, ObjectEventClearHeldMovementIfFinished,
  ObjectEventSetHeldMovement, gObjectEvents,
} from './event_object_movement';
import { GetPlayerFacingDirection, gPlayerAvatar, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './field_player_avatar';
import { ScriptMovement_UnfreezeObjectEvents } from './script_movement';
import { applyMovement, isMovementDone, isAllMovementsDone } from './engine/field/movement-system';
import {
  MOVEMENT_ACTION_FACE_DOWN, MOVEMENT_ACTION_FACE_UP, MOVEMENT_ACTION_FACE_LEFT, MOVEMENT_ACTION_FACE_RIGHT,
} from '../include/constants/event_object_movement';

// gStdScripts (1:1 event_scripts.s:95-107) — STD_*/MSGBOX_* index → label de std script.
const gStdScripts: readonly string[] = [
  'Std_ObtainItem', 'Std_FindItem', 'Std_MsgboxNPC', 'Std_MsgboxSign', 'Std_MsgboxDefault',
  'Std_MsgboxYesNo', 'Std_MsgboxAutoclose', 'Std_ObtainDecoration', 'Std_RegisteredInMatchCall',
  'Std_MsgboxGetPoints', 'Std_MsgboxPokenav',
];
/** 1:1 scrcmd.c FetchScriptStdPointer : index → offset image du std script (ou null). */
function fetchStdOffset(index: number): number | null {
  if (index < 0 || index >= gStdScripts.length) return null;
  const off = getScriptOffset(gStdScripts[index]);
  return off === undefined ? null : off;
}

// 1:1 scrcmd.c:76-84 — [condition][comparisonResult] → 1 si la branche est prise.
//   <  =  >
const sScriptConditionTable: number[][] = [
  [1, 0, 0], // <
  [0, 1, 0], // =
  [0, 0, 1], // >
  [1, 1, 0], // <=
  [0, 1, 1], // >=
  [1, 0, 1], // !=
];

// `*GetVarPointer(id)` (lecture/écriture) — notre GetVarPointer renvoie {get,set}|null.
function varDeref(id: number): number { const p = GetVarPointer(id); return p ? p.get() : 0; }
function varStore(id: number, v: number): void { const p = GetVarPointer(id); if (p) p.set(v & 0xFFFF); }

/** 1:1 scrcmd.c:381-388 `Compare(a, b)` : 0=<, 1==, 2=>. */
function Compare(a: number, b: number): number { return a < b ? 0 : a === b ? 1 : 2; }

// gSpecials : id (specials-table.json) → nom → fn de jeu (via invokeSpecial).
let _specialNames: string[] = [];
export function setSpecialNames(names: string[]): void { _specialNames = names; }
/** `gSpecials[index]()` (1:1) : résout l'id en nom puis invoque la fn de jeu. */
function callSpecial(index: number): number {
  const name = _specialNames[index];
  if (name === undefined) { console.warn(`[byte-vm] special id ${index} hors table`); return 0; }
  return invokeSpecial(name);
}

// ─── handlers (1:1 scrcmd.c) ─────────────────────────────────────────────────
const ScrCmd_nop: ScrCmdFunc = () => false;                                  // :94
const ScrCmd_nop1: ScrCmdFunc = () => false;                                 // :99
const ScrCmd_end: ScrCmdFunc = (ctx) => { StopScript(ctx); return false; };  // :104

const ScrCmd_gotonative: ScrCmdFunc = (ctx) => {                             // :110
  // addr = pointeur natif. Chez nous : id de symbole natif → résolu en Phase 4b.
  const id = ScriptReadWord(ctx); void id;
  SetupNativeScript(ctx, () => true); // stub temporaire (slice sans natifs)
  return true;
};

const ScrCmd_waitstate: ScrCmdFunc = () => { ScriptContext_Stop(); return true; }; // :142

// 1:1 scrcmd.c:118-124 : u16 index = ScriptReadHalfword ; gSpecials[index]().
const ScrCmd_special: ScrCmdFunc = (ctx) => { callSpecial(ScriptReadHalfword(ctx)); return false; };
// 1:1 scrcmd.c:126-132 : var = GetVarPointer(ScriptReadHalfword) ; *var = gSpecials[ScriptReadHalfword]().
const ScrCmd_specialvar: ScrCmdFunc = (ctx) => {
  const ref = GetVarPointer(ScriptReadHalfword(ctx));   // lire l'id de var EN PREMIER (ordre 1:1)
  const result = callSpecial(ScriptReadHalfword(ctx));
  if (ref) ref.set(result & 0xFFFF);
  return false;
};

const ScrCmd_goto: ScrCmdFunc = (ctx) => {                                   // :148
  const off = ScriptReadWord(ctx);
  ScriptJump(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_return: ScrCmdFunc = (ctx) => { ScriptReturn(ctx); return false; }; // :156
const ScrCmd_call: ScrCmdFunc = (ctx) => {                                   // :162
  const off = ScriptReadWord(ctx);
  ScriptCall(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_goto_if: ScrCmdFunc = (ctx) => {                                // :170
  const condition = ScriptReadByte(ctx);
  const off = ScriptReadWord(ctx);
  if (sScriptConditionTable[condition][ctx.comparisonResult] === 1) ScriptJump(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_call_if: ScrCmdFunc = (ctx) => {                               // :180
  const condition = ScriptReadByte(ctx);
  const off = ScriptReadWord(ctx);
  if (sScriptConditionTable[condition][ctx.comparisonResult] === 1) ScriptCall(ctx, ptrFromOffset(off));
  return false;
};

const ScrCmd_loadword: ScrCmdFunc = (ctx) => { const i = ScriptReadByte(ctx); ctx.data[i] = ScriptReadWord(ctx); return false; };   // :304
const ScrCmd_loadbyte: ScrCmdFunc = (ctx) => { const i = ScriptReadByte(ctx); ctx.data[i] = ScriptReadByte(ctx); return false; };   // :328
const ScrCmd_copylocal: ScrCmdFunc = (ctx) => { const d = ScriptReadByte(ctx); const s = ScriptReadByte(ctx); ctx.data[d] = ctx.data[s]; return false; }; // :344

const ScrCmd_setvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, ScriptReadHalfword(ctx)); return false; };          // :360
const ScrCmd_copyvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, varDeref(ScriptReadHalfword(ctx))); return false; }; // :367
const ScrCmd_setorcopyvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, VarGet(ScriptReadHalfword(ctx))); return false; }; // :374
const ScrCmd_addvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, (varDeref(id) + ScriptReadHalfword(ctx)) & 0xFFFF); return false; }; // :465
const ScrCmd_subvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, (varDeref(id) - VarGet(ScriptReadHalfword(ctx))) & 0xFFFF); return false; }; // :472

const ScrCmd_compare_local_to_local: ScrCmdFunc = (ctx) => { const a = ctx.data[ScriptReadByte(ctx)]; const b = ctx.data[ScriptReadByte(ctx)]; ctx.comparisonResult = Compare(a & 0xFF, b & 0xFF); return false; }; // :390
const ScrCmd_compare_local_to_value: ScrCmdFunc = (ctx) => { const a = ctx.data[ScriptReadByte(ctx)]; const b = ScriptReadByte(ctx); ctx.comparisonResult = Compare(a & 0xFF, b); return false; }; // :399
const ScrCmd_compare_var_to_value: ScrCmdFunc = (ctx) => { const a = varDeref(ScriptReadHalfword(ctx)); const b = ScriptReadHalfword(ctx); ctx.comparisonResult = Compare(a, b); return false; }; // :444
const ScrCmd_compare_var_to_var: ScrCmdFunc = (ctx) => { const a = varDeref(ScriptReadHalfword(ctx)); const b = varDeref(ScriptReadHalfword(ctx)); ctx.comparisonResult = Compare(a, b); return false; }; // :453

// ─── lock / release / faceplayer (1:1 scrcmd.c:1152-1263) ───────────────────
/** 1:1 GetFaceDirectionMovementAction(dir) → MOVEMENT_ACTION_FACE_*. */
function faceAction(dir: number): number {
  switch (dir) {
    case DIR_SOUTH: return MOVEMENT_ACTION_FACE_DOWN;
    case DIR_NORTH: return MOVEMENT_ACTION_FACE_UP;
    case DIR_WEST: return MOVEMENT_ACTION_FACE_LEFT;
    case DIR_EAST: return MOVEMENT_ACTION_FACE_RIGHT;
    default: return MOVEMENT_ACTION_FACE_DOWN;
  }
}

// 1:1 scrcmd.c:1152-1156 ScrCmd_faceplayer (= ObjectEventFaceOppositeDirection).
const ScrCmd_faceplayer: ScrCmdFunc = () => {
  const npc = getSelectedNpc();
  if (!npc) return false;
  const opp = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
  ObjectEventSetHeldMovement(npc, faceAction(opp));
  return false;
};

// 1:1 scrcmd.c:1201-1213 ScrCmd_lockall : gèle tous les objets, attend le step joueur.
const ScrCmd_lockall: ScrCmdFunc = (ctx) => {
  for (const npc of gObjectEvents) if (npc.active) FreezeObjectEvent(npc);
  SetupNativeScript(ctx, () => isPlayerStepFinished());
  return true;
};

// 1:1 scrcmd.c:1217-1237 ScrCmd_lock : gèle tous sauf player+selected ; gèle selected à la fin.
const ScrCmd_lock: ScrCmdFunc = (ctx) => {
  const npc = getSelectedNpc();
  for (const n of gObjectEvents) if (n.active && n !== npc) FreezeObjectEvent(n);
  SetupNativeScript(ctx, () => {
    if (!isPlayerStepFinished()) return false;
    if (npc) FreezeObjectEvent(npc);
    return true;
  });
  return true;
};

// 1:1 scrcmd.c:1239-1249 ScrCmd_releaseall.
const ScrCmd_releaseall: ScrCmdFunc = () => {
  HideFieldMessageBox();
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  if (player) ObjectEventClearHeldMovementIfFinished(player);
  ScriptMovement_UnfreezeObjectEvents();
  for (const npc of gObjectEvents) if (npc.active) UnfreezeObjectEvent(npc);
  return false;
};

// 1:1 scrcmd.c:1251-1263 ScrCmd_release.
const ScrCmd_release: ScrCmdFunc = () => {
  HideFieldMessageBox();
  const selected = gObjectEvents[gSelectedObjectEvent.index];
  if (selected && selected.active) ObjectEventClearHeldMovementIfFinished(selected);
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  if (player) ObjectEventClearHeldMovementIfFinished(player);
  ScriptMovement_UnfreezeObjectEvents();
  for (const npc of gObjectEvents) if (npc.active) UnfreezeObjectEvent(npc);
  return false;
};

// ─── warp (adaptation async setPendingWarp — cf fieldmap-1to1-adaptations) ───
/** Lit le layout formatwarp (map u16 mapSymbol + warpId u8 + x u16 + y u16). */
function readWarp(ctx: ScriptContext): { destMap: string; warpId: number; x: number; y: number } {
  const destMap = resolveMapSymbol(ScriptReadHalfword(ctx)) ?? '';
  const warpId = ScriptReadByte(ctx);
  const x = VarGet(ScriptReadHalfword(ctx));
  const y = VarGet(ScriptReadHalfword(ctx));
  return { destMap, warpId, x, y };
}
// 1:1 scrcmd.c:739-751 (SetWarpDestination+DoWarp) → adapté : setPendingWarp async.
const ScrCmd_warp: ScrCmdFunc = (ctx) => {
  const { destMap, warpId, x, y } = readWarp(ctx);
  setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');
  return false;
};
const ScrCmd_warpsilent: ScrCmdFunc = (ctx) => {
  const { destMap, warpId, x, y } = readWarp(ctx);
  setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');
  return false;
};

// ─── money (1:1 scrcmd.c:1733-1761) ─────────────────────────────────────────
const setResult = (v: number) => VarSet(VAR_RESULT, v);
const ScrCmd_addmoney: ScrCmdFunc = (ctx) => { const a = ScriptReadWord(ctx); const ign = ScriptReadByte(ctx); if (!ign) AddMoney(a); return false; };
const ScrCmd_removemoney: ScrCmdFunc = (ctx) => { const a = ScriptReadWord(ctx); const ign = ScriptReadByte(ctx); if (!ign) RemoveMoney(a); return false; };
const ScrCmd_checkmoney: ScrCmdFunc = (ctx) => { const a = ScriptReadWord(ctx); const ign = ScriptReadByte(ctx); if (!ign) setResult(IsEnoughMoney(a) ? 1 : 0); return false; };

// ─── item / coins (1:1 scrcmd.c) ────────────────────────────────────────────
// Notre Bag est à CLÉS string → pont id numérique→ITEM_X (reverseDecompConstant).
const itemKeyOf = (id: number): string => reverseDecompConstant(id, 'ITEM_') ?? '';
const ScrCmd_additem: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(AddBagItem(itemKeyOf(id), q) ? 1 : 0); return false; };       // :487
const ScrCmd_removeitem: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(RemoveBagItem(itemKeyOf(id), q) ? 1 : 0); return false; };  // :496
const ScrCmd_checkitem: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(CheckBagHasItem(itemKeyOf(id), q) ? 1 : 0); return false; };  // :514
const ScrCmd_checkitemspace: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(CheckBagHasSpace(itemKeyOf(id), q) ? 1 : 0); return false; }; // :505
// coins (1:1 scrcmd.c:2129-2152) — addcoins/removecoins inversent le résultat.
const ScrCmd_checkcoins: ScrCmdFunc = (ctx) => { const ref = GetVarPointer(ScriptReadHalfword(ctx)); if (ref) ref.set(GetCoins()); return false; };
const ScrCmd_addcoins: ScrCmdFunc = (ctx) => { const c = VarGet(ScriptReadHalfword(ctx)); setResult(AddCoins(c) ? 0 : 1); return false; };
const ScrCmd_removecoins: ScrCmdFunc = (ctx) => { const c = VarGet(ScriptReadHalfword(ctx)); setResult(RemoveCoins(c) ? 0 : 1); return false; };

// ─── applymovement / waitmovement (1:1 scrcmd.c:992-1045) ───────────────────
let sMovingNpcId = 0;
/** Résout le pointeur de mouvement (symbole) → label de séquence de mouvement. */
function movementLabel(symId: number): string | null {
  const sym = resolveSymbol(symId);
  return sym ? sym.label : null;
}
// 1:1 scrcmd.c:992-1000 : localId=VarGet(half) ; movementScript=ReadWord ; StartObjectMovementScript ; sMovingNpcId=localId.
const ScrCmd_applymovement: ScrCmdFunc = (ctx) => {
  const localId = VarGet(ScriptReadHalfword(ctx));
  const label = movementLabel(ScriptReadWord(ctx));
  if (label) applyMovement(String(localId), label);
  sMovingNpcId = localId;
  return false;
};
// 1:1 scrcmd.c:1002-1012 : + map (2o) ignorée (adaptation même-map, comme le moteur parsé).
const ScrCmd_applymovementat: ScrCmdFunc = (ctx) => {
  const localId = VarGet(ScriptReadHalfword(ctx));
  const label = movementLabel(ScriptReadWord(ctx));
  ScriptReadHalfword(ctx);   // map (mapSymbol u16) — non utilisé (même map)
  if (label) applyMovement(String(localId), label);
  sMovingNpcId = localId;
  return false;
};
// 1:1 scrcmd.c:1019-1029 : localId=VarGet(half) ; si !=LOCALID_NONE → sMovingNpcId ; wait.
const ScrCmd_waitmovement: ScrCmdFunc = (ctx) => {
  const localId = VarGet(ScriptReadHalfword(ctx));
  if (localId !== 0) sMovingNpcId = localId;
  SetupNativeScript(ctx, sMovingNpcId === 0 ? () => isAllMovementsDone() : () => isMovementDone(String(sMovingNpcId)));
  return true;
};
// 1:1 scrcmd.c:1031-1045 : + map (2o) ignorée.
const ScrCmd_waitmovementat: ScrCmdFunc = (ctx) => {
  const localId = VarGet(ScriptReadHalfword(ctx));
  ScriptReadHalfword(ctx);   // map (mapSymbol u16) — non utilisé
  if (localId !== 0) sMovingNpcId = localId;
  SetupNativeScript(ctx, sMovingNpcId === 0 ? () => isAllMovementsDone() : () => isMovementDone(String(sMovingNpcId)));
  return true;
};

// ─── std scripts (1:1 scrcmd.c:235-253) ─────────────────────────────────────
const ScrCmd_gotostd: ScrCmdFunc = (ctx) => { const off = fetchStdOffset(ScriptReadByte(ctx)); if (off !== null) ScriptJump(ctx, ptrFromOffset(off)); return false; };
const ScrCmd_callstd: ScrCmdFunc = (ctx) => { const off = fetchStdOffset(ScriptReadByte(ctx)); if (off !== null) ScriptCall(ctx, ptrFromOffset(off)); return false; };

// ─── messages (1:1 scrcmd.c:1265-1320) ──────────────────────────────────────
/** Résout un pointeur de texte (id de symbole, ou data[0] si NULL) → bytes charmap → affiche. */
function showFieldText(symId: number): void {
  const sym = resolveSymbol(symId);
  if (!sym) return;
  const bytes = getText(sym.label);
  if (bytes) ShowFieldMessage(bytes);
}
const ScrCmd_message: ScrCmdFunc = (ctx) => {                               // :1265
  let p = ScriptReadWord(ctx);
  if (p === 0) p = ctx.data[0];   // NULL → ctx->data[0] (posé par loadword via msgbox)
  showFieldText(p);
  return false;
};
const ScrCmd_waitmessage: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, () => IsFieldMessageBoxHidden()); return true; }; // :1310
const ScrCmd_closemessage: ScrCmdFunc = () => { HideFieldMessageBox(); return false; }; // :1316

const ScrCmd_setflag: ScrCmdFunc = (ctx) => { FlagSet(ScriptReadHalfword(ctx)); return false; };        // :581
const ScrCmd_clearflag: ScrCmdFunc = (ctx) => { FlagClear(ScriptReadHalfword(ctx)); return false; };    // :587
const ScrCmd_checkflag: ScrCmdFunc = (ctx) => { ctx.comparisonResult = FlagGet(ScriptReadHalfword(ctx)) ? 1 : 0; return false; }; // :593

/** Handlers du slice, keyed par nom ScrCmd_* (= colonne `handler` du cmd-table). */
export const BYTEVM_HANDLERS: Record<string, ScrCmdFunc> = {
  ScrCmd_nop, ScrCmd_nop1, ScrCmd_end, ScrCmd_gotonative, ScrCmd_waitstate,
  ScrCmd_special, ScrCmd_specialvar,
  ScrCmd_goto, ScrCmd_return, ScrCmd_call, ScrCmd_goto_if, ScrCmd_call_if,
  ScrCmd_loadword, ScrCmd_loadbyte, ScrCmd_copylocal,
  ScrCmd_setvar, ScrCmd_copyvar, ScrCmd_setorcopyvar, ScrCmd_addvar, ScrCmd_subvar,
  ScrCmd_compare_local_to_local, ScrCmd_compare_local_to_value,
  ScrCmd_compare_var_to_value, ScrCmd_compare_var_to_var,
  ScrCmd_setflag, ScrCmd_clearflag, ScrCmd_checkflag,
  ScrCmd_gotostd, ScrCmd_callstd, ScrCmd_message, ScrCmd_waitmessage, ScrCmd_closemessage,
  ScrCmd_faceplayer, ScrCmd_lock, ScrCmd_lockall, ScrCmd_release, ScrCmd_releaseall,
  ScrCmd_applymovement, ScrCmd_applymovementat, ScrCmd_waitmovement, ScrCmd_waitmovementat,
  ScrCmd_warp, ScrCmd_warpsilent, ScrCmd_addmoney, ScrCmd_removemoney, ScrCmd_checkmoney,
  ScrCmd_additem, ScrCmd_removeitem, ScrCmd_checkitem, ScrCmd_checkitemspace,
  ScrCmd_checkcoins, ScrCmd_addcoins, ScrCmd_removecoins,
};

/** Installe les handlers disponibles dans gScriptCmdTable, indexés par cmdId.
 *  `enumEntries` = champ `enum[]` de script-cmd-table.json ({op, cmdId, handler}). */
export function installByteVmHandlers(enumEntries: { cmdId: number; handler: string }[]): number {
  let n = 0;
  for (const e of enumEntries) {
    const fn = BYTEVM_HANDLERS[e.handler];
    if (fn) { gScriptCmdTable[e.cmdId] = fn; n++; }
  }
  return n;
}
