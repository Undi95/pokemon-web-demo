// AUTO-GENERATED from data/maps/ShoalCave_LowTideEntranceRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/ShoalCave_LowTideEntranceRoom/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'ShoalCave_LowTideEntranceRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'ShoalCave_LowTideEntranceRoom_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_SetHighTide', isGlobal: true, instrIndex: 4 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_SetLowTide', isGlobal: true, instrIndex: 6 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_ShellBellExpert', isGlobal: true, instrIndex: 8 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_CheckSpaceWillBeFreed', isGlobal: true, instrIndex: 30 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_CheckSpaceWillBeFreedShells', isGlobal: true, instrIndex: 33 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_NoSpaceWillBeFreed', isGlobal: true, instrIndex: 36 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_NoRoomForShellBell', isGlobal: true, instrIndex: 38 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_NotEnoughShoalSaltOrShells', isGlobal: true, instrIndex: 41 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_HasSomeShoalSaltOrShell', isGlobal: true, instrIndex: 48 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_DeclineShellBell', isGlobal: true, instrIndex: 51 },
  { name: 'ShoalCave_LowTideEntranceRoom_EventScript_ResetShoalItems', isGlobal: true, instrIndex: 54 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 64 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","ShoalCave_LowTideEntranceRoom_OnTransition"]},
  {op:"special",args:["UpdateShoalTideFlag"]},
  {op:"goto_if_set",args:["FLAG_SYS_SHOAL_TIDE","ShoalCave_LowTideEntranceRoom_EventScript_SetHighTide"]},
  {op:"goto",args:["ShoalCave_LowTideEntranceRoom_EventScript_SetLowTide"]},
  {op:"setmaplayoutindex",args:["LAYOUT_SHOAL_CAVE_HIGH_TIDE_ENTRANCE_ROOM"]},
  {op:"end",args:[]},
  {op:"setmaplayoutindex",args:["LAYOUT_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"dotimebasedevents",args:[]},
  {op:"call_if_set",args:["FLAG_SYS_SHOAL_ITEM","ShoalCave_LowTideEntranceRoom_EventScript_ResetShoalItems"]},
  {op:"checkitem",args:["ITEM_SHOAL_SALT",4]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"ShoalCave_LowTideEntranceRoom_EventScript_NotEnoughShoalSaltOrShells"]},
  {op:"checkitem",args:["ITEM_SHOAL_SHELL",4]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"ShoalCave_LowTideEntranceRoom_EventScript_NotEnoughShoalSaltOrShells"]},
  {op:"msgbox",args:["ShoalCave_LowTideEntranceRoom_Text_WouldYouLikeShellBell","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","ShoalCave_LowTideEntranceRoom_EventScript_DeclineShellBell"]},
  {op:"checkitemspace",args:["ITEM_SHELL_BELL"]},
  {op:"call_if_eq",args:["VAR_RESULT",0,"ShoalCave_LowTideEntranceRoom_EventScript_CheckSpaceWillBeFreed"]},
  {op:"goto_if_eq",args:["VAR_RESULT",2,"ShoalCave_LowTideEntranceRoom_EventScript_NoRoomForShellBell"]},
  {op:"msgbox",args:["ShoalCave_LowTideEntranceRoom_Text_MakeShellBellRightAway","MSGBOX_DEFAULT"]},
  {op:"removeitem",args:["ITEM_SHOAL_SALT",4]},
  {op:"removeitem",args:["ITEM_SHOAL_SHELL",4]},
  {op:"giveitem",args:["ITEM_SHELL_BELL"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"msgbox",args:["ShoalCave_LowTideEntranceRoom_Text_ExplainShellBell","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_TEMP_2"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"checkitem",args:["ITEM_SHOAL_SALT",5]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"ShoalCave_LowTideEntranceRoom_EventScript_CheckSpaceWillBeFreedShells"]},
  {op:"return",args:[]},
  {op:"checkitem",args:["ITEM_SHOAL_SHELL",5]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"ShoalCave_LowTideEntranceRoom_EventScript_NoSpaceWillBeFreed"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_RESULT",2]},
  {op:"return",args:[]},
  {op:"msgbox",args:["ShoalCave_LowTideEntranceRoom_Text_NoSpaceInYourBag","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"checkitem",args:["ITEM_SHOAL_SALT"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"ShoalCave_LowTideEntranceRoom_EventScript_HasSomeShoalSaltOrShell"]},
  {op:"checkitem",args:["ITEM_SHOAL_SHELL"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"ShoalCave_LowTideEntranceRoom_EventScript_HasSomeShoalSaltOrShell"]},
  {op:"msgbox",args:["ShoalCave_LowTideEntranceRoom_Text_AreYouPlanningOnGoingInThere","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["ShoalCave_LowTideEntranceRoom_Text_BringMe4ShoalSaltAndShells","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["ShoalCave_LowTideEntranceRoom_Text_WantedToMakeShellBell","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"clearflag",args:["FLAG_RECEIVED_SHOAL_SALT_1"]},
  {op:"clearflag",args:["FLAG_RECEIVED_SHOAL_SALT_2"]},
  {op:"clearflag",args:["FLAG_RECEIVED_SHOAL_SALT_3"]},
  {op:"clearflag",args:["FLAG_RECEIVED_SHOAL_SALT_4"]},
  {op:"clearflag",args:["FLAG_RECEIVED_SHOAL_SHELL_1"]},
  {op:"clearflag",args:["FLAG_RECEIVED_SHOAL_SHELL_2"]},
  {op:"clearflag",args:["FLAG_RECEIVED_SHOAL_SHELL_3"]},
  {op:"clearflag",args:["FLAG_RECEIVED_SHOAL_SHELL_4"]},
  {op:"clearflag",args:["FLAG_SYS_SHOAL_ITEM"]},
  {op:"return",args:[]},
] as const;
