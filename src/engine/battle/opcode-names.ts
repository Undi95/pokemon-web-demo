/**
 * battle/opcode-names.ts — 1:1 décomp `gBattleScriptingCommandsTable[]` name
 * lookup table. Source : `src/battle_script_commands.c:329-580`.
 *
 * Utilisé par :
 *   - `script-interpreter.ts` pour logs stats/tracing avec le nom décomp.
 *   - `battle-devtools.ts` pour exposer un mapping nom → opcode au devtools.
 *
 * Index = opcode (0x00..0xF8). Entrée pour `[i] === null` = pas d'opcode défini
 * (= rest 0xF9..0xFF unused dans le décomp).
 */

/** 1:1 décomp gBattleScriptingCommandsTable names. */
export const OPCODE_NAMES: readonly (string | null)[] = (() => {
  const arr: (string | null)[] = new Array(256).fill(null);
  // 0x00-0x0F
  arr[0x00] = 'attackcanceler';
  arr[0x01] = 'accuracycheck';
  arr[0x02] = 'attackstring';
  arr[0x03] = 'ppreduce';
  arr[0x04] = 'critcalc';
  arr[0x05] = 'damagecalc';
  arr[0x06] = 'typecalc';
  arr[0x07] = 'adjustnormaldamage';
  arr[0x08] = 'adjustnormaldamage2';
  arr[0x09] = 'attackanimation';
  arr[0x0A] = 'waitanimation';
  arr[0x0B] = 'healthbarupdate';
  arr[0x0C] = 'datahpupdate';
  arr[0x0D] = 'critmessage';
  arr[0x0E] = 'effectivenesssound';
  arr[0x0F] = 'resultmessage';
  // 0x10-0x1F
  arr[0x10] = 'printstring';
  arr[0x11] = 'printselectionstring';
  arr[0x12] = 'waitmessage';
  arr[0x13] = 'printfromtable';
  arr[0x14] = 'printselectionstringfromtable';
  arr[0x15] = 'seteffectwithchance';
  arr[0x16] = 'seteffectprimary';
  arr[0x17] = 'seteffectsecondary';
  arr[0x18] = 'clearstatusfromeffect';
  arr[0x19] = 'tryfaintmon';
  arr[0x1A] = 'dofaintanimation';
  arr[0x1B] = 'cleareffectsonfaint';
  arr[0x1C] = 'jumpifstatus';
  arr[0x1D] = 'jumpifstatus2';
  arr[0x1E] = 'jumpifability';
  arr[0x1F] = 'jumpifsideaffecting';
  // 0x20-0x2F
  arr[0x20] = 'jumpifstat';
  arr[0x21] = 'jumpifstatus3condition';
  arr[0x22] = 'jumpiftype';
  arr[0x23] = 'getexp';
  arr[0x24] = 'checkteamslost';
  arr[0x25] = 'movevaluescleanup';
  arr[0x26] = 'setmultihit';
  arr[0x27] = 'decrementmultihit';
  arr[0x28] = 'goto';
  arr[0x29] = 'jumpifbyte';
  arr[0x2A] = 'jumpifhalfword';
  arr[0x2B] = 'jumpifword';
  arr[0x2C] = 'jumpifarrayequal';
  arr[0x2D] = 'jumpifarraynotequal';
  arr[0x2E] = 'setbyte';
  arr[0x2F] = 'addbyte';
  // 0x30-0x3F
  arr[0x30] = 'subbyte';
  arr[0x31] = 'copyarray';
  arr[0x32] = 'copyarraywithindex';
  arr[0x33] = 'orbyte';
  arr[0x34] = 'orhalfword';
  arr[0x35] = 'orword';
  arr[0x36] = 'bicbyte';
  arr[0x37] = 'bichalfword';
  arr[0x38] = 'bicword';
  arr[0x39] = 'pause';
  arr[0x3A] = 'waitstate';
  arr[0x3B] = 'healthbar_update';
  arr[0x3C] = 'return';
  arr[0x3D] = 'end';
  arr[0x3E] = 'end2';
  arr[0x3F] = 'end3';
  // 0x40-0x4F
  arr[0x40] = 'jumpifaffectedbyprotect';
  arr[0x41] = 'call';
  arr[0x42] = 'jumpiftype2';
  arr[0x43] = 'jumpifabilitypresent';
  arr[0x44] = 'endselectionscript';
  arr[0x45] = 'playanimation';
  arr[0x46] = 'playanimation_var';
  arr[0x47] = 'setgraphicalstatchangevalues';
  arr[0x48] = 'playstatchangeanimation';
  arr[0x49] = 'moveend';
  arr[0x4A] = 'typecalc2';
  arr[0x4B] = 'returnatktoball';
  arr[0x4C] = 'getswitchedmondata';
  arr[0x4D] = 'switchindataupdate';
  arr[0x4E] = 'switchinanim';
  arr[0x4F] = 'jumpifcantswitch';
  // 0x50-0x5F
  arr[0x50] = 'openpartyscreen';
  arr[0x51] = 'switchhandleorder';
  arr[0x52] = 'switchineffects';
  arr[0x53] = 'trainerslidein';
  arr[0x54] = 'playse';
  arr[0x55] = 'fanfare';
  arr[0x56] = 'playfaintcry';
  arr[0x57] = 'endlinkbattle';
  arr[0x58] = 'returntoball';
  arr[0x59] = 'handlelearnnewmove';
  arr[0x5A] = 'yesnoboxlearnmove';
  arr[0x5B] = 'yesnoboxstoplearningmove';
  arr[0x5C] = 'hitanimation';
  arr[0x5D] = 'getmoneyreward';
  arr[0x5E] = 'updatebattlermoves';
  arr[0x5F] = 'swapattackerwithtarget';
  // 0x60-0x6F
  arr[0x60] = 'incrementgamestat';
  arr[0x61] = 'drawpartystatussummary';
  arr[0x62] = 'hidepartystatussummary';
  arr[0x63] = 'jumptocalledmove';
  arr[0x64] = 'statusanimation';
  arr[0x65] = 'status2animation';
  arr[0x66] = 'chosenstatusanimation';
  arr[0x67] = 'yesnobox';
  arr[0x68] = 'cancelallactions';
  arr[0x69] = 'adjustsetdamage';
  arr[0x6A] = 'removeitem';
  arr[0x6B] = 'atknameinbuff1';
  arr[0x6C] = 'drawlvlupbox';
  arr[0x6D] = 'resetsentmonsvalue';
  arr[0x6E] = 'setatktoplayer0';
  arr[0x6F] = 'makevisible';
  // 0x70-0x7F
  arr[0x70] = 'recordlastability';
  arr[0x71] = 'buffermovetolearn';
  arr[0x72] = 'jumpifplayerran';
  arr[0x73] = 'hpthresholds';
  arr[0x74] = 'hpthresholds2';
  arr[0x75] = 'useitemonopponent';
  arr[0x76] = 'various';
  arr[0x77] = 'setprotectlike';
  arr[0x78] = 'tryexplosion';
  arr[0x79] = 'setatkhptozero';
  arr[0x7A] = 'jumpifnexttargetvalid';
  arr[0x7B] = 'tryhealhalfhealth';
  arr[0x7C] = 'trymirrormove';
  arr[0x7D] = 'setrain';
  arr[0x7E] = 'setreflect';
  arr[0x7F] = 'setseeded';
  // 0x80-0x8F
  arr[0x80] = 'manipulatedamage';
  arr[0x81] = 'trysetrest';
  arr[0x82] = 'jumpifnotfirstturn';
  arr[0x83] = 'nop';
  arr[0x84] = 'jumpifcantmakeasleep';
  arr[0x85] = 'stockpile';
  arr[0x86] = 'stockpiletobasedamage';
  arr[0x87] = 'stockpiletohpheal';
  arr[0x88] = 'negativedamage';
  arr[0x89] = 'statbuffchange';
  arr[0x8A] = 'normalisebuffs';
  arr[0x8B] = 'setbide';
  arr[0x8C] = 'confuseifrepeatingattackends';
  arr[0x8D] = 'setmultihitcounter';
  arr[0x8E] = 'initmultihitstring';
  arr[0x8F] = 'forcerandomswitch';
  // 0x90-0x9F
  arr[0x90] = 'tryconversiontypechange';
  arr[0x91] = 'givepaydaymoney';
  arr[0x92] = 'setlightscreen';
  arr[0x93] = 'tryKO';
  arr[0x94] = 'damagetohalftargethp';
  arr[0x95] = 'setsandstorm';
  arr[0x96] = 'weatherdamage';
  arr[0x97] = 'tryinfatuating';
  arr[0x98] = 'updatestatusicon';
  arr[0x99] = 'setmist';
  arr[0x9A] = 'setfocusenergy';
  arr[0x9B] = 'transformdataexecution';
  arr[0x9C] = 'setsubstitute';
  arr[0x9D] = 'mimicattackcopy';
  arr[0x9E] = 'metronome';
  arr[0x9F] = 'dmgtolevel';
  // 0xA0-0xAF
  arr[0xA0] = 'psywavedamageeffect';
  arr[0xA1] = 'counterdamagecalculator';
  arr[0xA2] = 'mirrorcoatdamagecalculator';
  arr[0xA3] = 'disablelastusedattack';
  arr[0xA4] = 'trysetencore';
  arr[0xA5] = 'painsplitdmgcalc';
  arr[0xA6] = 'settypetorandomresistance';
  arr[0xA7] = 'setalwayshitflag';
  arr[0xA8] = 'copymovepermanently';
  arr[0xA9] = 'trychoosesleeptalkmove';
  arr[0xAA] = 'setdestinybond';
  arr[0xAB] = 'trysetdestinybondtohappen';
  arr[0xAC] = 'remaininghptopower';
  arr[0xAD] = 'tryspiteppreduce';
  arr[0xAE] = 'healpartystatus';
  arr[0xAF] = 'cursetarget';
  // 0xB0-0xBF
  arr[0xB0] = 'trysetspikes';
  arr[0xB1] = 'setforesight';
  arr[0xB2] = 'trysetperishsong';
  arr[0xB3] = 'rolloutdamagecalculation';
  arr[0xB4] = 'jumpifconfusedandstatmaxed';
  arr[0xB5] = 'furycuttercalc';
  arr[0xB6] = 'friendshiptodamagecalculation';
  arr[0xB7] = 'presentdamagecalculation';
  arr[0xB8] = 'setsafeguard';
  arr[0xB9] = 'magnitudedamagecalculation';
  arr[0xBA] = 'jumpifnopursuitswitchdmg';
  arr[0xBB] = 'setsunny';
  arr[0xBC] = 'maxattackhalvehp';
  arr[0xBD] = 'copyfoestats';
  arr[0xBE] = 'rapidspinfree';
  arr[0xBF] = 'setdefensecurlbit';
  // 0xC0-0xCF
  arr[0xC0] = 'recoverbasedonsunlight';
  arr[0xC1] = 'hiddenpowercalc';
  arr[0xC2] = 'selectfirstvalidtarget';
  arr[0xC3] = 'trysetfutureattack';
  arr[0xC4] = 'trydobeatup';
  arr[0xC5] = 'setsemiinvulnerablebit';
  arr[0xC6] = 'clearsemiinvulnerablebit';
  arr[0xC7] = 'setminimize';
  arr[0xC8] = 'sethail';
  arr[0xC9] = 'trymemento';
  arr[0xCA] = 'setforcedtarget';
  arr[0xCB] = 'setcharge';
  arr[0xCC] = 'callenvironmentattack';
  arr[0xCD] = 'cureifburnedparalyzedorpoisoned';
  arr[0xCE] = 'settorment';
  arr[0xCF] = 'jumpifnodamage';
  // 0xD0-0xDF
  arr[0xD0] = 'settaunt';
  arr[0xD1] = 'trysethelpinghand';
  arr[0xD2] = 'tryswapitems';
  arr[0xD3] = 'trycopyability';
  arr[0xD4] = 'trywish';
  arr[0xD5] = 'trysetroots';
  arr[0xD6] = 'doubledamagedealtifdamaged';
  arr[0xD7] = 'setyawn';
  arr[0xD8] = 'setdamagetohealthdifference';
  arr[0xD9] = 'scaledamagebyhealthratio';
  arr[0xDA] = 'tryswapabilities';
  arr[0xDB] = 'tryimprison';
  arr[0xDC] = 'trysetgrudge';
  arr[0xDD] = 'weightdamagecalculation';
  arr[0xDE] = 'assistattackselect';
  arr[0xDF] = 'trysetmagiccoat';
  // 0xE0-0xEF
  arr[0xE0] = 'trysetsnatch';
  arr[0xE1] = 'trygetintimidatetarget';
  arr[0xE2] = 'switchoutabilities';
  arr[0xE3] = 'jumpifhasnohp';
  arr[0xE4] = 'getsecretpowereffect';
  arr[0xE5] = 'pickup';
  arr[0xE6] = 'docastformchangeanimation';
  arr[0xE7] = 'trycastformdatachange';
  arr[0xE8] = 'settypebasedhalvers';
  arr[0xE9] = 'setweatherballtype';
  arr[0xEA] = 'tryrecycleitem';
  arr[0xEB] = 'settypetoenvironment';
  arr[0xEC] = 'pursuitdoubles';
  arr[0xED] = 'snatchsetbattlers';
  arr[0xEE] = 'removelightscreenreflect';
  arr[0xEF] = 'handleballthrow';
  // 0xF0-0xF8
  arr[0xF0] = 'givecaughtmon';
  arr[0xF1] = 'trysetcaughtmondexflags';
  arr[0xF2] = 'displaydexinfo';
  arr[0xF3] = 'trygivecaughtmonnick';
  arr[0xF4] = 'subattackerhpbydmg';
  arr[0xF5] = 'removeattackerstatus1';
  arr[0xF6] = 'finishaction';
  arr[0xF7] = 'finishturn';
  arr[0xF8] = 'trainerslideout';
  return arr;
})();

/** Inverse mapping : opcode name → opcode hex. Useful for devtools commands. */
export const NAME_TO_OPCODE: Readonly<Record<string, number>> = (() => {
  const map: Record<string, number> = {};
  for (let i = 0; i < OPCODE_NAMES.length; i++) {
    const name = OPCODE_NAMES[i];
    if (name) map[name] = i;
  }
  return map;
})();

/** Resolve opcode name from hex value. Returns `?(0xHH)` if unknown. */
export function getOpcodeName(hex: number): string {
  if (hex < 0 || hex >= OPCODE_NAMES.length) return `?(0x${hex.toString(16)})`;
  return OPCODE_NAMES[hex] ?? `?(0x${hex.toString(16)})`;
}
