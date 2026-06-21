/**
 * script-opcodes-control-flow.ts — opcodes control flow 1:1 décomp `script.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_nop`/`nop1`           (l. 94-102)   : no-op (= retire pas ctx).
 *   `ScrCmd_end`                  (l. 104-108)  : StopScript.
 *   `ScrCmd_gotonative`           (l. 110-116)  : SetupNativeScript(addr).
 *   `ScrCmd_callnative`           (l. 134-140)  : function pointer call.
 *   `ScrCmd_goto`                 (l. 148-154)  : ScriptJump(addr).
 *   `ScrCmd_return`               (l. 156-160)  : ScriptReturn.
 *   `ScrCmd_call`                 (l. 162-168)  : ScriptCall(addr).
 *   `ScrCmd_goto_if`              (l. 170-178)  : conditional Jump (= cond byte).
 *   `ScrCmd_call_if`              (l. 180-188)  : conditional Call (= cond byte).
 *   `ScrCmd_setvaddress`          (l. 190-197)  : sAddressOffset = addr.
 *   `ScrCmd_vgoto`                (l. 199-205)  : ScriptJump(addr - sAddressOffset).
 *   `ScrCmd_vcall`                (l. 207-213)  : ScriptCall(addr - sAddressOffset).
 *   `ScrCmd_vgoto_if`             (l. 215-223)  : conditional vgoto.
 *   `ScrCmd_vcall_if`             (l. 225-233)  : conditional vcall.
 *   `ScrCmd_gotostd`              (l. 235-243)  : dispatch via gStdScripts[].
 *   `ScrCmd_callstd`              (l. 245-253)  : alias gotostd avec call.
 *   `ScrCmd_gotostd_if`           (l. 255-267)  : conditional gotostd.
 *   `ScrCmd_callstd_if`           (l. 269-281)  : conditional callstd.
 *   `ScrCmd_returnram`            (l. 283-287)  : ScriptJump(gRamScriptRetAddr).
 *   `ScrCmd_endram`               (l. 289-294)  : RamScript_StopAndClear + Stop.
 *   `ScrCmd_loadword`             (l. 304-310)  : ctx->data[i] = halfword.
 *   `ScrCmd_loadbytefromptr`/etc. (l. 312-358)  : RAM ops (= largely no-op pour notre VM label-based).
 *   `ScrCmd_compare_local_*`/etc. (l. 390-463)  : variants compare.
 *
 * Plus opcodes battle-anim-script tokens (= différent VM) listés dans
 * `_safeStubOpcodes` pour éviter warnings.
 */

import type { ScriptContext } from './script-runtime';
import {
  registerOpcode, ScriptJump, ScriptCall, ScriptReturn, StopScript,
  SetupNativeScript, getScript, getOpcodeHandler,
} from './script-runtime';
import { FlagGet } from './script-vars';
import { parseValue } from './script-opcodes-helpers';
import { invokeSpecial } from './script-opcodes-special';

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
 *  1:1 décomp event_data.c:VarGet : retourne le var value si id < SPECIAL_VARS,
 *  sinon retourne id (= immediate constants are passed-through). */
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
// _le / _ge complètent _lt / _gt + _eq / _ne déjà implémentés.

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

// ─── End variants (= end2/endall, alias of end) ─────────────────────────────

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

// ─── No-ops (1:1 décomp ScrCmd_nop/nop1) ────────────────────────────────────
registerOpcode('nop', (_ctx, _args) => false);
registerOpcode('nop1', (_ctx, _args) => false);

// ─── RAM scripts (returnram, endram) ────────────────────────────────────────

/** 1:1 décomp ScrCmd_returnram (scrcmd.c) :
 *    ScriptJump(ctx, gRamScriptRetAddr).
 *  gRamScriptRetAddr set par trywondercardscript. Notre port : pas de RAM
 *  script bytecode → équivalent à end (= stop script). */
registerOpcode('returnram', (ctx, _args) => {
  StopScript(ctx);
  return false;
});

/** 1:1 décomp ScrCmd_endram : RamScript_StopAndClear() + ScriptContext_Stop. */
registerOpcode('endram', (ctx, _args) => {
  StopScript(ctx);
  return false;
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
registerOpcode('loadbyte', (_ctx, _args) => false);
registerOpcode('setptr', (_ctx, _args) => false);
registerOpcode('setptrbyte', (_ctx, _args) => false);
registerOpcode('loadbytefromptr', (_ctx, _args) => false);
registerOpcode('copybyte', (_ctx, _args) => false);
registerOpcode('copylocal', (_ctx, _args) => false);
registerOpcode('jumpargeq', (_ctx, _args) => false);
registerOpcode('jumpifbyte', (_ctx, _args) => false);
registerOpcode('jumpifbytewasset', (_ctx, _args) => false);

// ─── cmd5e (= startminigame_* etc., RS-era no-op dans Em) ───────────────────
registerOpcode('cmd5e', (_ctx, _args) => false);

// ─── Compare variants (1:1 décomp ScrCmd_compare_*) ─────────────────────────
// Notre opcode `compare` gère `var → value`. Les 6 autres variants existent
// pour comparer local-to-local, local-to-ptr, etc. Pour notre extracteur, seul
// `compare var value` est utilisé en pratique. Tous délèguent à `compare`.

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

// ─── Std scripts dispatch (1:1 décomp gStdScripts) ──────────────────────────
// gStdScripts[] (= event_scripts.s:95-107) :
//   STD_OBTAIN_ITEM (0)         → Std_ObtainItem
//   STD_FIND_ITEM (1)           → Std_FindItem
//   MSGBOX_NPC (2)              → Std_MsgboxNPC
//   MSGBOX_SIGN (3)             → Std_MsgboxSign
//   MSGBOX_DEFAULT (4)          → Std_MsgboxDefault
//   MSGBOX_YESNO (5)            → Std_MsgboxYesNo
//   MSGBOX_AUTOCLOSE (6)        → Std_MsgboxAutoclose (= trainer_battle.inc)
//   STD_OBTAIN_DECORATION (7)   → Std_ObtainDecoration
//   STD_REGISTER_MATCH_CALL (8) → Std_RegisteredInMatchCall
//   MSGBOX_GETPOINTS (9)        → Std_MsgboxGetPoints
//   MSGBOX_POKENAV (10)         → Std_MsgboxPokenav (unused — pokenavcall direct)
//
// 1:1 strict scrcmd.c:236-253 FetchScriptStdPointer + ScrCmd_gotostd/callstd :
//   const u8 *FetchScriptStdPointer(ctx, index) {
//     if (index >= NELEMS(gStdScripts)) return NULL;
//     return gStdScripts[index];
//   }
//   static bool8 ScrCmd_gotostd(ctx) {
//     u8 index = ScriptReadByte(ctx);
//     const u8 *script = FetchScriptStdPointer(ctx, index);
//     if (script != NULL) ScriptJump(ctx, script);
//     return FALSE;
//   }
//   ScrCmd_callstd idem avec ScriptCall.

const gStdScripts: readonly string[] = [
  'Std_ObtainItem',             // 0 STD_OBTAIN_ITEM
  'Std_FindItem',               // 1 STD_FIND_ITEM
  'Std_MsgboxNPC',              // 2 MSGBOX_NPC
  'Std_MsgboxSign',             // 3 MSGBOX_SIGN
  'Std_MsgboxDefault',          // 4 MSGBOX_DEFAULT
  'Std_MsgboxYesNo',            // 5 MSGBOX_YESNO
  'Std_MsgboxAutoclose',        // 6 MSGBOX_AUTOCLOSE
  'Std_ObtainDecoration',       // 7 STD_OBTAIN_DECORATION
  'Std_RegisteredInMatchCall',  // 8 STD_REGISTER_MATCH_CALL
  'Std_MsgboxGetPoints',        // 9 MSGBOX_GETPOINTS
  'Std_MsgboxPokenav',          // 10 MSGBOX_POKENAV
] as const;

/** 1:1 décomp scrcmd.c:236 `FetchScriptStdPointer`. */
function _fetchScriptStdPointer(stdIndex: number): string | null {
  if (stdIndex < 0 || stdIndex >= gStdScripts.length) return null;
  return gStdScripts[stdIndex];
}

function _runStdScript(ctx: ScriptContext, stdIndex: number, isCall: boolean): boolean {
  // 1:1 décomp scrcmd.c:238 ScrCmd_gotostd / 248 ScrCmd_callstd.
  const label = _fetchScriptStdPointer(stdIndex);
  if (!label) return false;
  const target = getScript(label);
  if (!target) {
    // Notre extracteur emet `msgbox TEXT, TYPE` direct (= macro expansion
    // partielle) au lieu de `loadword + callstd MSGBOX_X`. Le `msgbox`
    // opcode inline tout pour MSGBOX_NPC/SIGN/DEFAULT/YESNO/AUTOCLOSE.
    // Si on arrive ici sans label extrait pour un MSGBOX_*, c'est OK — log.
    if (stdIndex >= 2 && stdIndex <= 6) {
      // MSGBOX_* sans loadword préalable = comportement undefined dans décomp
      // (= message NULL). Notre msgbox inline les couvre.
      return false;
    }
    console.warn(`[opcode std] script ${label} (index=${stdIndex}) not extracted`);
    return false;
  }
  if (isCall) ScriptCall(ctx, target);
  else ScriptJump(ctx, target);
  return false;
}

registerOpcode('gotostd', (ctx, args) => {
  // 1:1 décomp ScrCmd_gotostd (scrcmd.c:235). Resolve std index → dispatch.
  const stdIndex = parseValue(args[0] ?? '0');
  return _runStdScript(ctx, stdIndex, false);
});

registerOpcode('callstd', (ctx, args) => {
  // 1:1 décomp ScrCmd_callstd (scrcmd.c:245).
  const stdIndex = parseValue(args[0] ?? '0');
  return _runStdScript(ctx, stdIndex, true);
});

// 1:1 décomp `sScriptConditionTable[6][3]` (scrcmd.c:76-85). Lignes = condition byte
// {0:'<', 1:'=', 2:'>', 3:'<=', 4:'>=', 5:'!='} ; colonnes = ctx.comparisonResult
// {0:LESS, 1:EQUAL, 2:GREATER, cf. Compare/COMPARE_LT/EQ/GT}. Vaut 1 si la branche est prise.
const sScriptConditionTable: ReadonlyArray<readonly number[]> = [
  [1, 0, 0], // <
  [0, 1, 0], // =
  [0, 0, 1], // >
  [1, 1, 0], // <=
  [0, 1, 1], // >=
  [1, 0, 1], // !=
];

registerOpcode('gotostd_if', (ctx, args) => {
  // 1:1 décomp `ScrCmd_gotostd_if` (scrcmd.c:255-267) : ne JUMP vers le std-script QUE si
  // sScriptConditionTable[condition][comparisonResult] == 1 (sinon no-op). Le `compare`
  // précédent a posé ctx.comparisonResult.
  const condition = parseValue(args[0] ?? '0');
  const stdIndex = parseValue(args[1] ?? '0');
  if (sScriptConditionTable[condition]?.[ctx.comparisonResult] === 1) {
    return _runStdScript(ctx, stdIndex, false);
  }
  return false;
});

registerOpcode('callstd_if', (ctx, args) => {
  // 1:1 décomp `ScrCmd_callstd_if` (scrcmd.c:269-281) : ne CALL le std-script QUE si
  // sScriptConditionTable[condition][comparisonResult] == 1 (sinon no-op).
  const condition = parseValue(args[0] ?? '0');
  const stdIndex = parseValue(args[1] ?? '0');
  if (sScriptConditionTable[condition]?.[ctx.comparisonResult] === 1) {
    return _runStdScript(ctx, stdIndex, true);
  }
  return false;
});

// ─── Virtual address scripts (Mystery Event) ─────────────────────────────────

/** 1:1 décomp `sAddressOffset` (scrcmd.c:48). Set par `setvaddress`, utilisé
 *  par `vgoto/vcall/vmessage/vbufferstring`. Pour les scripts Mystery Event
 *  qui pointent vers du bytecode RAM relatif à un base addr. */
let _sAddressOffset = 0;

registerOpcode('setvaddress', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setvaddress (scrcmd.c:190). Pour scripts WonderCard / RAM
  // qui contiennent du bytecode chargé dynamiquement avec addr relative.
  // Notre port : scripts sont label-based (string), pas pointer-based. On
  // stocke l'offset pour cohérence mais ne l'utilise pas en pratique.
  _sAddressOffset = parseInt(args[0] ?? '0', 10);
  return false;
});
void _sAddressOffset;  // exposed for future Mystery Event impl.

registerOpcode('vgoto', (ctx, args) => {
  // 1:1 décomp ScrCmd_vgoto : ScriptJump(ctx, addr - sAddressOffset).
  // Notre port : args[0] est un label string, le offset ne s'applique pas.
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

// ─── Native function calls (callnative/gotonative) ──────────────────────────

registerOpcode('callnative', (_ctx, args) => {
  // 1:1 décomp ScrCmd_callnative (scrcmd.c:134-140). Called function pointer
  // directement avec aucun arg. Dans notre port, args[0] est le nom de la
  // fonction (e.g., "CleanupVariableScripts"). Dispatch via specials registry.
  const funcName = args[0] ?? '';
  if (!funcName) return false;
  invokeSpecial(funcName);
  return false;
});

registerOpcode('gotonative', (ctx, args) => {
  // 1:1 décomp ScrCmd_gotonative (scrcmd.c:110-116). SetupNativeScript(ctx, addr).
  // Native fn polled every frame jusqu'à return TRUE.
  const funcName = args[0] ?? '';
  if (!funcName) return false;
  let done = false;
  const poll = (): boolean => {
    if (!done) {
      done = true;
      invokeSpecial(funcName);
    }
    return true;  // resume after 1 frame
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Script cmd table entry marker (= pas un opcode actif) ──────────────────
registerOpcode('script_cmd_table_entry', (_ctx, _args) => false);

// NOTE : les opcodes battle anim / battle script / AI / contest restent dans
// `script-opcodes.ts` (= `_safeStubOpcodes` + `_otherVmStubs`). Ils ne sont
// PAS dans scrcmd.c — ce sont d'autres VMs (battle_anim_script.inc,
// battle_script.inc, etc.). Notre extracteur les collecte par regex mais
// ils ne sont jamais exécutés par le field script VM.
