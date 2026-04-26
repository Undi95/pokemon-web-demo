// AUTO-GENERATED from data/maps/AncientTomb/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/AncientTomb/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'AncientTomb_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'AncientTomb_OnResume', isGlobal: false, instrIndex: 3 },
  { name: 'AncientTomb_EventScript_TryRemoveRegisteel', isGlobal: true, instrIndex: 5 },
  { name: 'AncientTomb_OnTransition', isGlobal: false, instrIndex: 9 },
  { name: 'AncientTomb_EventScript_ShowRegisteel', isGlobal: true, instrIndex: 12 },
  { name: 'AncientTomb_OnLoad', isGlobal: false, instrIndex: 14 },
  { name: 'AncientTomb_EventScript_HideRegiEntrance', isGlobal: true, instrIndex: 16 },
  { name: 'AncientTomb_EventScript_CaveEntranceMiddle', isGlobal: true, instrIndex: 23 },
  { name: 'AncientTomb_EventScript_BigHoleInWall', isGlobal: true, instrIndex: 28 },
  { name: 'AncientTomb_EventScript_CaveEntranceSide', isGlobal: true, instrIndex: 31 },
  { name: 'AncientTomb_EventScript_Registeel', isGlobal: true, instrIndex: 35 },
  { name: 'AncientTomb_EventScript_DefeatedRegisteel', isGlobal: true, instrIndex: 52 },
  { name: 'AncientTomb_EventScript_RanFromRegisteel', isGlobal: true, instrIndex: 55 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 58 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","AncientTomb_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","AncientTomb_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","AncientTomb_OnTransition"]},
  {op:"call_if_set",args:["FLAG_SYS_CTRL_OBJ_DELETE","AncientTomb_EventScript_TryRemoveRegisteel"]},
  {op:"end",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_ne",args:["VAR_RESULT","B_OUTCOME_CAUGHT","Common_EventScript_NopReturn"]},
  {op:"removeobject",args:["VAR_LAST_TALKED"]},
  {op:"return",args:[]},
  {op:"setflag",args:["FLAG_LANDMARK_ANCIENT_TOMB"]},
  {op:"call_if_unset",args:["FLAG_DEFEATED_REGISTEEL","AncientTomb_EventScript_ShowRegisteel"]},
  {op:"end",args:[]},
  {op:"clearflag",args:["FLAG_HIDE_REGISTEEL"]},
  {op:"return",args:[]},
  {op:"call_if_unset",args:["FLAG_SYS_REGISTEEL_PUZZLE_COMPLETED","AncientTomb_EventScript_HideRegiEntrance"]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[7,19,"METATILE_Cave_EntranceCover",1]},
  {op:"setmetatile",args:[8,19,"METATILE_Cave_EntranceCover",1]},
  {op:"setmetatile",args:[9,19,"METATILE_Cave_EntranceCover",1]},
  {op:"setmetatile",args:[7,20,"METATILE_Cave_SealedChamberBraille_Mid",1]},
  {op:"setmetatile",args:[8,20,"METATILE_Cave_SealedChamberBraille_Mid",1]},
  {op:"setmetatile",args:[9,20,"METATILE_Cave_SealedChamberBraille_Mid",1]},
  {op:"return",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_set",args:["FLAG_SYS_REGISTEEL_PUZZLE_COMPLETED","AncientTomb_EventScript_BigHoleInWall"]},
  {op:"braillemsgbox",args:["AncientTomb_Braille_ShineInTheMiddle"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["gText_BigHoleInTheWall","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["AncientTomb_Braille_ShineInTheMiddle"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_REGISTEEL","CRY_MODE_ENCOUNTER"]},
  {op:"delay",args:[40]},
  {op:"waitmoncry",args:[]},
  {op:"setwildbattle",args:["SPECIES_REGISTEEL",40]},
  {op:"setflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"special",args:["StartRegiBattle"]},
  {op:"clearflag",args:["FLAG_SYS_CTRL_OBJ_DELETE"]},
  {op:"specialvar",args:["VAR_RESULT","GetBattleOutcome"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_WON","AncientTomb_EventScript_DefeatedRegisteel"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_RAN","AncientTomb_EventScript_RanFromRegisteel"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_PLAYER_TELEPORTED","AncientTomb_EventScript_RanFromRegisteel"]},
  {op:"setflag",args:["FLAG_DEFEATED_REGISTEEL"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_DEFEATED_REGISTEEL"]},
  {op:"goto",args:["Common_EventScript_RemoveStaticPokemon"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x8004","SPECIES_REGISTEEL"]},
  {op:"goto",args:["Common_EventScript_LegendaryFlewAway"]},
  {op:"end",args:[]},
] as const;
