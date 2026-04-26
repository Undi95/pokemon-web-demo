// AUTO-GENERATED from data/maps/DesertRuins/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/DesertRuins/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'DesertRuins_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'DesertRuins_OnResume', isGlobal: false, instrIndex: 3 },
  { name: 'DesertRuins_EventScript_TryRemoveRegirock', isGlobal: true, instrIndex: 5 },
  { name: 'DesertRuins_OnLoad', isGlobal: false, instrIndex: 9 },
  { name: 'DesertRuins_EventScript_HideRegiEntrance', isGlobal: true, instrIndex: 11 },
  { name: 'DesertRuins_OnTransition', isGlobal: false, instrIndex: 18 },
  { name: 'DesertRuins_EventScript_ShowRegirock', isGlobal: true, instrIndex: 21 },
  { name: 'DesertRuins_EventScript_CaveEntranceMiddle', isGlobal: true, instrIndex: 23 },
  { name: 'DesertRuins_EventScript_BigHoleInWall', isGlobal: true, instrIndex: 28 },
  { name: 'DesertRuins_EventScript_CaveEntranceSide', isGlobal: true, instrIndex: 31 },
  { name: 'DesertRuins_EventScript_Regirock', isGlobal: true, instrIndex: 35 },
  { name: 'DesertRuins_EventScript_DefeatedRegirock', isGlobal: true, instrIndex: 52 },
  { name: 'DesertRuins_EventScript_RanFromRegirock', isGlobal: true, instrIndex: 55 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 58 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","DesertRuins_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","DesertRuins_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","DesertRuins_OnTransition"]},
  {op:"call_if_set",args:["FLAG_SYS_CTRL_OBJ_DELETE","DesertRuins_EventScript_TryRemoveRegirock"]},
  {op:"end",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_ne",args:["VAR_RESULT","B_OUTCOME_CAUGHT","Common_EventScript_NopReturn"]},
  {op:"removeobject",args:["VAR_LAST_TALKED"]},
  {op:"return",args:[]},
  {op:"call_if_unset",args:["FLAG_SYS_REGIROCK_PUZZLE_COMPLETED","DesertRuins_EventScript_HideRegiEntrance"]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[7,19,"METATILE_Cave_EntranceCover",1]},
  {op:"setmetatile",args:[8,19,"METATILE_Cave_EntranceCover",1]},
  {op:"setmetatile",args:[9,19,"METATILE_Cave_EntranceCover",1]},
  {op:"setmetatile",args:[7,20,"METATILE_Cave_SealedChamberBraille_Mid",1]},
  {op:"setmetatile",args:[8,20,"METATILE_Cave_SealedChamberBraille_Mid",1]},
  {op:"setmetatile",args:[9,20,"METATILE_Cave_SealedChamberBraille_Mid",1]},
  {op:"return",args:[]},
  {op:"setflag",args:["FLAG_LANDMARK_DESERT_RUINS"]},
  {op:"call_if_unset",args:["FLAG_DEFEATED_REGIROCK","DesertRuins_EventScript_ShowRegirock"]},
  {op:"end",args:[]},
  {op:"clearflag",args:["FLAG_HIDE_REGIROCK"]},
  {op:"return",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_set",args:["FLAG_SYS_REGIROCK_PUZZLE_COMPLETED","DesertRuins_EventScript_BigHoleInWall"]},
  {op:"braillemsgbox",args:["DesertRuins_Braille_UseRockSmash"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["gText_BigHoleInTheWall","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["DesertRuins_Braille_UseRockSmash"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_REGIROCK","CRY_MODE_ENCOUNTER"]},
  {op:"delay",args:[40]},
  {op:"waitmoncry",args:[]},
  {op:"setwildbattle",args:["SPECIES_REGIROCK",40]},
  {op:"setflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"special",args:["StartRegiBattle"]},
  {op:"clearflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_WON","DesertRuins_EventScript_DefeatedRegirock"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_RAN","DesertRuins_EventScript_RanFromRegirock"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_PLAYER_TELEPORTED","DesertRuins_EventScript_RanFromRegirock"]},
  {op:"setflag",args:["FLAG_DEFEATED_REGIROCK"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_DEFEATED_REGIROCK"]},
  {op:"goto",args:["Common_EventScript_RemoveStaticPokemon"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x8004","SPECIES_REGIROCK"]},
  {op:"goto",args:["Common_EventScript_LegendaryFlewAway"]},
  {op:"end",args:[]},
] as const;
