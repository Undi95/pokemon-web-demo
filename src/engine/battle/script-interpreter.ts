/**
 * battle/script-interpreter.ts — 1:1 décomp `src/battle_script_commands.c`
 * bytecode interpreter.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c` (~10000
 *     lignes, 249 opcodes Cmd_*)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/battle_script_commands.h`
 *     (= B_SCR_OP_* constants 0x00..0xF8)
 *   - `D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_script.inc` (= macros)
 *   - `D:/Projet 1/decomps/pokeemeraude/data/battle_scripts_1.s` (~5000 lignes
 *     scripts pour chaque move + status flow)
 *   - `D:/Projet 1/decomps/pokeemeraude/data/battle_scripts_2.s` (~500 lignes)
 *
 * Architecture :
 *   - BYTECODE = u8 array extrait par `compile-decomp-bytecode.mjs` (= 12243
 *     bytes, 3275 opcodes total, 619 labels). Source : `auto-asm-bytecode/data/
 *     battle_scripts_1-bytecode.ts` + `battle_scripts_2-bytecode.ts`.
 *   - `gBattleScriptCommandsTable[]` = jump table 256 entries → Cmd_X handler.
 *   - Chaque Cmd_X lit ses args via ScriptContext + modifie state (= gBattleMons,
 *     gBattlerAttacker, gBattlerTarget, gMoveResultFlags, gBattleScripting, etc.).
 *
 * Battle context state (= globals dans le décomp, struct dans notre port) :
 *   - gBattleMons[4] : array de struct BattleMon (4 = max battlers : 2 single +
 *     2 partners en double).
 *   - gBattlerAttacker / gBattlerTarget : u8 index dans gBattleMons[].
 *   - gCurrentMove : u16 move id (= MOVE_TACKLE etc.).
 *   - gMoveResultFlags : u8 bits (HIT_*, MISSED, IMMUNE, etc.).
 *   - gBattleScripting.dmg : u32 damage du current attack.
 *   - gBattleScripting.statChanger : u8 stat id × 16 + direction (stat changes).
 *   - gBattleScripting.statAnimPlayed : bool.
 *   - gBattleControllerExecFlags : u32 bitmask de quels battlers sont en cours
 *     d'animation (= waitstate poll ce flag).
 *
 * Le bytecode pointe à gBattleScriptsForMoveEffects (= début BYTECODE), accédé
 * par offset. Chaque move effect (= EFFECT_HIT, EFFECT_BURN_HIT, EFFECT_DRAGON_RAGE,
 * etc., total ~200) a son propre script qui se branche dans le bytecode.
 *
 * Status actuel session 132 :
 *   - Interpreter loop + dispatch table : implémenté (250 opcodes, la plupart stubs)
 *   - Opcodes implémentés réellement : ~30 (= les triviaux : nop, end, goto,
 *     pause, jumpif, etc.)
 *   - Le reste : stubs avec TODO + ref au C handler (à porter au fur et à
 *     mesure du besoin gameplay)
 *
 *   - Le scenario "starter (Lv5) vs Zigzagoon (Lv2) avec Tackle" du tutorial
 *     peut être joué via battle-flow.ts qui utilise une formule de damage
 *     simplifiée. Le vrai bytecode interpreter sera utilisé une fois que les
 *     200+ effects + battle controllers + stat stages sont portés.
 */

import { Random } from '../random';
import { tickBattleControllers } from './battle-controllers';

// ─── Battle state types (1:1 décomp include/battle.h) ──────────────────────

/** 1:1 décomp `struct BattlePokemon` (battle.h). */
export interface BattleMon {
  species: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  moves: number[];        // 4 moves
  hpIV: number; attackIV: number; defenseIV: number;
  speedIV: number; spAttackIV: number; spDefenseIV: number;
  isEgg: boolean; abilityNum: number;
  statStages: number[];   // STAT_ATK..STAT_EVASION (= 7 entries -6..+6)
  ability: number;
  type1: number; type2: number;
  pp: number[];           // 4 entries
  hp: number; level: number; friendship: number;
  maxHP: number;
  item: number;
  nickname: string;       // 10 bytes
  ppBonuses: number;
  otName: string;         // 7 bytes
  experience: number;
  personality: number;
  status1: number;        // STATUS1_* (poison/burn/etc.)
  status2: number;        // STATUS2_* (confusion/flinch/etc.)
  otId: number;
}

/** 1:1 décomp `struct BattleScripting` — défini dans `state.ts` (= BattleScripting).
 *  Évite duplication d'interface ; importer depuis ./state si besoin de typage. */

/** 1:1 décomp battle script context. */
export interface BattleScriptContext {
  scriptPtr: number;          // offset dans BYTECODE
  scriptPtrStack: number[];   // call stack pour `call` opcode (max 8 deep)
  comparisonResult: number;   // 0=lt, 1=eq, 2=gt après dernière comparaison
  dataPtr: number[];          // 4-entry pointer scratch (analogue ctx->data du décomp)
}

// ─── Bytecode storage ───────────────────────────────────────────────────────

let _BYTECODE: Uint8Array | null = null;
let _LABELS: Record<string, number> = {};

/** Load le battle script bytecode au boot. */
export async function loadBattleScriptBytecode(): Promise<void> {
  if (_BYTECODE) return;
  const mod1 = await import('./../decomp-data/auto-asm-bytecode/data/battle_scripts_1-bytecode');
  const mod2 = await import('./../decomp-data/auto-asm-bytecode/data/battle_scripts_2-bytecode');
  // Concatenate the two bytecode files. battle_scripts_2 offset shifts by len(scripts_1).
  const bytes1 = new Uint8Array(mod1.BYTECODE);
  const bytes2 = new Uint8Array(mod2.BYTECODE);
  const combined = new Uint8Array(bytes1.length + bytes2.length);
  combined.set(bytes1, 0);
  combined.set(bytes2, bytes1.length);
  _BYTECODE = combined;
  // Merge labels (= scripts_2 offsets are post-1).
  _LABELS = { ...mod1.LABELS };
  for (const [k, v] of Object.entries(mod2.LABELS)) {
    _LABELS[k] = v + bytes1.length;
  }
  console.log(`[battle/script-interpreter] loaded ${combined.length} bytes, ${Object.keys(_LABELS).length} labels`);
}

/** Resolve un label string → byte offset dans BYTECODE. */
export function getBattleScriptOffset(label: string): number {
  return _LABELS[label] ?? -1;
}

// ─── Reader helpers (analogue ScriptReadByte/Halfword/Word) ────────────────

/** Read u8 at ctx.scriptPtr + advance. */
export function readByte(ctx: BattleScriptContext): number {
  if (!_BYTECODE) return 0;
  const v = _BYTECODE[ctx.scriptPtr];
  ctx.scriptPtr++;
  return v;
}

/** Read u16 little-endian at ctx.scriptPtr + advance. */
export function readHalfword(ctx: BattleScriptContext): number {
  const lo = readByte(ctx);
  const hi = readByte(ctx);
  return lo | (hi << 8);
}

/** Read u32 little-endian at ctx.scriptPtr + advance. */
export function readWord(ctx: BattleScriptContext): number {
  const lo = readHalfword(ctx);
  const hi = readHalfword(ctx);
  return lo | (hi << 16);
}

// Keep aliases for internal use.
const _readByte = readByte;
const _readHalfword = readHalfword;
const _readWord = readWord;

// ─── Opcode handlers ────────────────────────────────────────────────────────

/** Handler returns TRUE si script doit pause (= wait pour anim/UI), FALSE pour
 *  continue immédiat à l'opcode suivant. */
export type BattleOpcodeHandler = (ctx: BattleScriptContext) => boolean;

/** 1:1 décomp `gBattleScriptingCommandsTable[]` (battle_script_commands.c).
 *  256 entries, 249 utilisés (0x00..0xF8), rest = nop. */
const _commands: BattleOpcodeHandler[] = new Array(256).fill(null);

// ─── Opcode implementations 1:1 décomp ──────────────────────────────────────

/** 0x83 nop / unused slots → no-op + advance. */
function _Cmd_nop(_ctx: BattleScriptContext): boolean { return false; }

/** 0x28 goto : ScriptJump(ctx, ReadWord(ctx)). */
function _Cmd_goto(ctx: BattleScriptContext): boolean {
  const offset = _readWord(ctx);
  ctx.scriptPtr = offset;
  return false;
}

/** 0x41 call : ScriptCall(ctx, ReadWord(ctx)). */
function _Cmd_call(ctx: BattleScriptContext): boolean {
  const offset = _readWord(ctx);
  ctx.scriptPtrStack.push(ctx.scriptPtr);
  ctx.scriptPtr = offset;
  return false;
}

/** 0x3C return : ctx->scriptPtr = pop stack. */
function _Cmd_return(ctx: BattleScriptContext): boolean {
  const popped = ctx.scriptPtrStack.pop();
  if (popped === undefined) {
    // Underflow = script done.
    ctx.scriptPtr = -1;
    return true;
  }
  ctx.scriptPtr = popped;
  return false;
}

/** 0x3D end : terminate script entirely. */
function _Cmd_end(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr = -1;
  return true;
}

/** 0x3E end2 : alias of end. */
function _Cmd_end2(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr = -1;
  return true;
}

/** 0x3F end3 : alias of end (= certain selection scripts). */
function _Cmd_end3(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr = -1;
  return true;
}

/** 0x39 pause : wait N frames (N = ReadHalfword). */
function _Cmd_pause(ctx: BattleScriptContext): boolean {
  const _frames = _readHalfword(ctx);
  // TODO : real frame wait via SetupNativeScript pattern.
  return true;
}

/** 0x3A waitstate : wait until gBattleControllerExecFlags === 0 (= toutes anims done). */
function _Cmd_waitstate(_ctx: BattleScriptContext): boolean {
  // TODO : real wait via shared state polling.
  return true;
}

/** 0x29 jumpifbyte : 1:1 décomp Cmd_jumpifbyte (battle_script_commands.c).
 *  Compare byte at ptr vs value, jump if condition met. */
function _Cmd_jumpifbyte(ctx: BattleScriptContext): boolean {
  const _condition = _readByte(ctx);
  const _ptr = _readWord(ctx);
  const _value = _readByte(ctx);
  const _jumpPtr = _readWord(ctx);
  // TODO : real byte compare. For now : no jump.
  return false;
}

/** 0x2E setbyte : write byte at ptr. */
function _Cmd_setbyte(ctx: BattleScriptContext): boolean {
  const _ptr = _readWord(ctx);
  const _value = _readByte(ctx);
  // TODO : write to shared memory.
  return false;
}

// ─── Stubs pour les ~239 autres opcodes ─────────────────────────────────────

/** Generic stub : log warn + advance (= aucun arg consumé, donc next opcode
 *  va être interprété correctement seulement si l'opcode courant n'avait pas
 *  d'args. Pour les opcodes avec args, ils doivent être implémentés properly
 *  avant que cet interpreter soit utilisé en gameplay).
 *
 *  TODO : porter chacun de ces 239 opcodes 1:1 décomp `battle_script_commands.c`.
 *  Priorité (= scripts utilisés dans early game) :
 *    1. accuracycheck, critcalc, damagecalc, typecalc (= moves de base)
 *    2. attackanimation, healthbarupdate, datahpupdate, resultmessage
 *    3. seteffectprimary, seteffectsecondary (= side effects)
 *    4. tryfaintmon, dofaintanimation, cleareffectsonfaint
 *    5. statbuffchange (= stat changes)
 *    6. jumpifstatus, jumpifability, jumpiftype, jumpifstat
 *    7. moveend (= cleanup post-move)
 *    8. switchindataupdate, switchinanim, switchineffects (= switching)
 */
function _Cmd_stub(name: string): BattleOpcodeHandler {
  return (_ctx: BattleScriptContext) => {
    // Note : on n'avance PAS ctx.scriptPtr car on ne sait pas combien d'args
    // l'opcode consomme. Loop sera infini si on est en gameplay actif.
    // SAFE car cet interpreter n'est appelé que via runBattleScript ci-dessous,
    // qui detecte les stubs et retourne TRUE (= pause). En pratique, le tutorial
    // battle utilise battle-flow.ts (= path TS séparé, pas bytecode).
    console.warn(`[battle/script-interpreter] stub opcode '${name}' — TODO port from battle_script_commands.c`);
    return true;
  };
}

// ─── Dispatch table init ────────────────────────────────────────────────────

/** Initialize the 256-entry dispatch table. Opcodes implémentés sont set;
 *  les stubs portent leur nom 1:1 décomp pour debug. */
function _initCommandsTable(): void {
  for (let i = 0; i < 256; i++) _commands[i] = _Cmd_nop;
  // Implémentés réellement :
  _commands[0x28] = _Cmd_goto;
  _commands[0x29] = _Cmd_jumpifbyte;
  _commands[0x2E] = _Cmd_setbyte;
  _commands[0x39] = _Cmd_pause;
  _commands[0x3A] = _Cmd_waitstate;
  _commands[0x3C] = _Cmd_return;
  _commands[0x3D] = _Cmd_end;
  _commands[0x3E] = _Cmd_end2;
  _commands[0x3F] = _Cmd_end3;
  _commands[0x41] = _Cmd_call;
  _commands[0x83] = _Cmd_nop;
  // Stubs (= nom 1:1 décomp pour log debug; à porter au fur et à mesure) :
  const STUB_NAMES: Record<number, string> = {
    0x00: 'attackcanceler', 0x01: 'accuracycheck', 0x02: 'attackstring',
    0x03: 'ppreduce', 0x04: 'critcalc', 0x05: 'damagecalc', 0x06: 'typecalc',
    0x07: 'adjustnormaldamage', 0x08: 'adjustnormaldamage2',
    0x09: 'attackanimation', 0x0A: 'waitanimation', 0x0B: 'healthbarupdate',
    0x0C: 'datahpupdate', 0x0D: 'critmessage', 0x0E: 'effectivenesssound',
    0x0F: 'resultmessage', 0x10: 'printstring', 0x11: 'printselectionstring',
    0x12: 'waitmessage', 0x13: 'printfromtable',
    0x14: 'printselectionstringfromtable', 0x15: 'seteffectwithchance',
    0x16: 'seteffectprimary', 0x17: 'seteffectsecondary',
    0x18: 'clearstatusfromeffect', 0x19: 'tryfaintmon',
    0x1A: 'dofaintanimation', 0x1B: 'cleareffectsonfaint',
    0x1C: 'jumpifstatus', 0x1D: 'jumpifstatus2', 0x1E: 'jumpifability',
    0x1F: 'jumpifsideaffecting', 0x20: 'jumpifstat',
    0x21: 'jumpifstatus3condition', 0x22: 'jumpiftype', 0x23: 'getexp',
    0x24: 'checkteamslost', 0x25: 'movevaluescleanup', 0x26: 'setmultihit',
    0x27: 'decrementmultihit', 0x2A: 'jumpifhalfword',
    0x2B: 'jumpifword', 0x2C: 'jumpifarrayequal',
    0x2D: 'jumpifarraynotequal', 0x2F: 'addbyte', 0x30: 'subbyte',
    0x31: 'copyarray', 0x32: 'copyarraywithindex', 0x33: 'orbyte',
    0x34: 'orhalfword', 0x35: 'orword', 0x36: 'bicbyte',
    0x37: 'bichalfword', 0x38: 'bicword', 0x3B: 'healthbar_update',
    0x40: 'jumpifaffectedbyprotect', 0x42: 'jumpiftype2',
    0x43: 'jumpifabilitypresent', 0x44: 'endselectionscript',
    0x45: 'playanimation', 0x46: 'playanimation_var',
    0x47: 'setgraphicalstatchangevalues', 0x48: 'playstatchangeanimation',
    0x49: 'moveend', 0x4A: 'typecalc2', 0x4B: 'returnatktoball',
    0x4C: 'getswitchedmondata', 0x4D: 'switchindataupdate',
    0x4E: 'switchinanim', 0x4F: 'jumpifcantswitch',
    0x50: 'openpartyscreen', 0x51: 'switchhandleorder',
    0x52: 'switchineffects', 0x53: 'trainerslidein', 0x54: 'playse',
    0x55: 'fanfare', 0x56: 'playfaintcry', 0x57: 'endlinkbattle',
    0x58: 'returntoball', 0x59: 'handlelearnnewmove',
    0x5A: 'yesnoboxlearnmove', 0x5B: 'yesnoboxstoplearningmove',
    0x5C: 'hitanimation', 0x5D: 'getmoneyreward',
    0x5E: 'updatebattlermoves', 0x5F: 'swapattackerwithtarget',
    0x60: 'incrementgamestat', 0x61: 'drawpartystatussummary',
    0x62: 'hidepartystatussummary', 0x63: 'jumptocalledmove',
    0x64: 'statusanimation', 0x65: 'status2animation',
    0x66: 'chosenstatusanimation', 0x67: 'yesnobox',
    0x68: 'cancelallactions', 0x69: 'adjustsetdamage', 0x6A: 'removeitem',
    0x6B: 'atknameinbuff1', 0x6C: 'drawlvlupbox',
    0x6D: 'resetsentmonsvalue', 0x6E: 'setatktoplayer0',
    0x6F: 'makevisible', 0x70: 'recordlastability',
    0x71: 'buffermovetolearn', 0x72: 'jumpifplayerran',
    0x73: 'hpthresholds', 0x74: 'hpthresholds2',
    0x75: 'useitemonopponent', 0x76: 'various', 0x77: 'setprotectlike',
    0x78: 'tryexplosion', 0x79: 'setatkhptozero',
    0x7A: 'jumpifnexttargetvalid', 0x7B: 'tryhealhalfhealth',
    0x7C: 'trymirrormove', 0x7D: 'setrain', 0x7E: 'setreflect',
    0x7F: 'setseeded', 0x80: 'manipulatedamage', 0x81: 'trysetrest',
    0x82: 'jumpifnotfirstturn', 0x84: 'jumpifcantmakeasleep',
    0x85: 'stockpile', 0x86: 'stockpiletobasedamage',
    0x87: 'stockpiletohpheal', 0x88: 'negativedamage',
    0x89: 'statbuffchange', 0x8A: 'normalisebuffs', 0x8B: 'setbide',
    0x8C: 'confuseifrepeatingattackends', 0x8D: 'setmultihitcounter',
    0x8E: 'initmultihitstring', 0x8F: 'forcerandomswitch',
    0x90: 'tryconversiontypechange', 0x91: 'givepaydaymoney',
    0x92: 'setlightscreen', 0x93: 'tryko',
    0x94: 'damagetohalftargethp', 0x95: 'setsandstorm',
    0x96: 'weatherdamage', 0x97: 'tryinfatuating',
    0x98: 'updatestatusicon', 0x99: 'setmist', 0x9A: 'setfocusenergy',
    0x9B: 'transformdataexecution', 0x9C: 'setsubstitute',
    0x9D: 'mimicattackcopy', 0x9E: 'metronome', 0x9F: 'dmgtolevel',
    0xA0: 'psywavedamageeffect', 0xA1: 'counterdamagecalculator',
    0xA2: 'mirrorcoatdamagecalculator', 0xA3: 'disablelastusedattack',
    0xA4: 'trysetencore', 0xA5: 'painsplitdmgcalc',
    0xA6: 'settypetorandomresistance', 0xA7: 'setalwayshitflag',
    0xA8: 'copymovepermanently', 0xA9: 'trychoosesleeptalkmove',
    0xAA: 'setdestinybond', 0xAB: 'trysetdestinybondtohappen',
    0xAC: 'remaininghptopower', 0xAD: 'tryspiteppreduce',
    0xAE: 'healpartystatus', 0xAF: 'cursetarget',
    0xB0: 'trysetspikes', 0xB1: 'setforesight',
    0xB2: 'trysetperishsong', 0xB3: 'rolloutdamagecalculation',
    0xB4: 'jumpifconfusedandstatmaxed', 0xB5: 'furycuttercalc',
    0xB6: 'friendshiptodamagecalculation', 0xB7: 'presentdamagecalculation',
    0xB8: 'setsafeguard', 0xB9: 'magnitudedamagecalculation',
    0xBA: 'jumpifnopursuitswitchdmg', 0xBB: 'setsunny',
    0xBC: 'maxattackhalvehp', 0xBD: 'copyfoestats',
    0xBE: 'rapidspinfree', 0xBF: 'setdefensecurlbit',
    0xC0: 'recoverbasedonsunlight', 0xC1: 'hiddenpowercalc',
    0xC2: 'selectfirstvalidtarget', 0xC3: 'trysetfutureattack',
    0xC4: 'trydobeatup', 0xC5: 'setsemiinvulnerablebit',
    0xC6: 'clearsemiinvulnerablebit', 0xC7: 'setminimize',
    0xC8: 'sethail', 0xC9: 'trymemento', 0xCA: 'setforcedtarget',
    0xCB: 'setcharge', 0xCC: 'callenvironmentattack',
    0xCD: 'cureifburnedparalyzedorpoisoned', 0xCE: 'settorment',
    0xCF: 'jumpifnodamage', 0xD0: 'settaunt',
    0xD1: 'trysethelpinghand', 0xD2: 'tryswapitems',
    0xD3: 'trycopyability', 0xD4: 'trywish',
    0xD5: 'trysetroots', 0xD6: 'doubledamagedealtifdamaged',
    0xD7: 'setyawn', 0xD8: 'setdamagetohealthdifference',
    0xD9: 'scaledamagebyhealthratio', 0xDA: 'tryswapabilities',
    0xDB: 'tryimprison', 0xDC: 'trysetgrudge',
    0xDD: 'weightdamagecalculation', 0xDE: 'assistattackselect',
    0xDF: 'trysetmagiccoat', 0xE0: 'trysetsnatch',
    0xE1: 'trygetintimidatetarget', 0xE2: 'switchoutabilities',
    0xE3: 'jumpifhasnohp', 0xE4: 'getsecretpowereffect',
    0xE5: 'pickup', 0xE6: 'docastformchangeanimation',
    0xE7: 'trycastformdatachange', 0xE8: 'settypebasedhalvers',
    0xE9: 'setweatherballtype', 0xEA: 'tryrecycleitem',
    0xEB: 'settypetoenvironment', 0xEC: 'pursuitdoubles',
    0xED: 'snatchsetbattlers', 0xEE: 'removelightscreenreflect',
    0xEF: 'handleballthrow', 0xF0: 'givecaughtmon',
    0xF1: 'trysetcaughtmondexflags', 0xF2: 'displaydexinfo',
    0xF3: 'trygivecaughtmonnick', 0xF4: 'subattackerhpbydmg',
    0xF5: 'removeattackerstatus1', 0xF6: 'finishaction',
    0xF7: 'finishturn', 0xF8: 'trainerslideout',
  };
  for (const [idxStr, name] of Object.entries(STUB_NAMES)) {
    const idx = parseInt(idxStr, 10);
    _commands[idx] = _Cmd_stub(name);
  }

  // Session 133 — Phase 1 Niveau 1 + Niveau 2 : install real handlers.
  // Lazy import pour break cyclic dep (cmd-niveau-X.ts importent BattleOpcodeHandler
  // de ce module).
  void import('./cmd-niveau-1').then(({ installNiveau1Handlers }) => {
    installNiveau1Handlers(_commands);
  });
  void import('./cmd-niveau-2').then(({ installNiveau2Handlers }) => {
    installNiveau2Handlers(_commands);
  });
  void import('./cmd-niveau-3').then(({ installNiveau3Handlers }) => {
    installNiveau3Handlers(_commands);
  });
  // Session 134 — Niveau 4 (animations + UI).
  void import('./cmd-niveau-4').then(({ installNiveau4Handlers }) => {
    installNiveau4Handlers(_commands);
  });
  // Session 134 — Niveau 5 (result + messages + faint).
  void import('./cmd-niveau-5').then(({ installNiveau5Handlers }) => {
    installNiveau5Handlers(_commands);
  });
  // Session 134 — Niveau 6 (UI/audio misc).
  void import('./cmd-niveau-6').then(({ installNiveau6Handlers }) => {
    installNiveau6Handlers(_commands);
  });
  // Session 134 — Niveau 7 (mutation + flow control).
  void import('./cmd-niveau-7').then(({ installNiveau7Handlers }) => {
    installNiveau7Handlers(_commands);
  });
  // Session 134 — Niveau 8 (utility + dynamic).
  void import('./cmd-niveau-8').then(({ installNiveau8Handlers }) => {
    installNiveau8Handlers(_commands);
  });
  // Session 134 — Niveau 9 (status-set opcodes).
  void import('./cmd-niveau-9').then(({ installNiveau9Handlers }) => {
    installNiveau9Handlers(_commands);
  });
}

_initCommandsTable();

// ─── Public API ─────────────────────────────────────────────────────────────

/** Run le battle script jusqu'à end ou pause. Returns TRUE si pause (= re-call
 *  next frame), FALSE si done. */
export function runBattleScript(ctx: BattleScriptContext): boolean {
  if (!_BYTECODE) {
    console.warn('[battle/script-interpreter] BYTECODE not loaded — call loadBattleScriptBytecode first');
    return false;
  }
  if (ctx.scriptPtr < 0 || ctx.scriptPtr >= _BYTECODE.length) return false;
  let iterations = 0;
  const MAX = 10000;
  while (iterations++ < MAX) {
    if (ctx.scriptPtr < 0 || ctx.scriptPtr >= _BYTECODE.length) return false;
    const opcode = _BYTECODE[ctx.scriptPtr];
    ctx.scriptPtr++;
    const handler = _commands[opcode];
    if (!handler) {
      console.warn(`[battle/script-interpreter] no handler for opcode 0x${opcode.toString(16)}`);
      return false;
    }
    const paused = handler(ctx);
    // Session 134 — entre chaque opcode, tick les controllers MVP (= clear
    // exec flags). Simule des controllers async finished instantanément.
    // TODO retirer quand on aura de vrais controllers wired au framework UI.
    tickBattleControllers();
    if (paused) {
      return true;
    }
  }
  console.warn(`[battle/script-interpreter] hit MAX ${MAX} iterations — runaway script?`);
  return false;
}

/** Setup un nouveau context pour exec un script à un label donné. */
export function setupBattleScriptContext(label: string): BattleScriptContext | null {
  const offset = getBattleScriptOffset(label);
  if (offset < 0) {
    console.warn(`[battle/script-interpreter] label '${label}' not found`);
    return null;
  }
  return {
    scriptPtr: offset,
    scriptPtrStack: [],
    comparisonResult: 0,
    dataPtr: [0, 0, 0, 0],
  };
}

// ─── Exports for use ────────────────────────────────────────────────────────

/** Random helper exposed pour les opcodes qui rollent (= critcalc, damagecalc rng). */
export { Random };

/** Le bytecode global (lazy loaded). Pas exporté direct car private au module. */
export function getBattleScriptBytecode(): Uint8Array | null {
  return _BYTECODE;
}
