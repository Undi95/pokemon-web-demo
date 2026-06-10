// AUTO-GENERATED from data/scripts/elite_four.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/elite_four.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles', isGlobal: true, instrIndex: 0 },
  { name: 'PokemonLeague_EliteFour_EventScript_WalkInCloseDoor', isGlobal: true, instrIndex: 17 },
  { name: 'PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom', isGlobal: true, instrIndex: 28 },
  { name: 'PokemonLeague_EliteFour_EventScript_CloseDoor', isGlobal: true, instrIndex: 47 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 54 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_Delay32"]},
  {op:"waitmovement",args:[0]},
  {op:"playse",args:["SE_DOOR"]},
  {op:"setmetatile",args:[6,1,"METATILE_EliteFour_OpenDoor_Frame",0]},
  {op:"setmetatile",args:[6,2,"METATILE_EliteFour_OpenDoor_Opening",0]},
  {op:"setmetatile",args:[0,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[1,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"setmetatile",args:[2,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[3,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"setmetatile",args:[4,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[8,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"setmetatile",args:[9,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[10,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"setmetatile",args:[11,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[12,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"special",args:["DrawWholeMapView"]},
  {op:"return",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_WalkUp6"]},
  {op:"waitmovement",args:[0]},
  {op:"playse",args:["SE_TRUCK_DOOR"]},
  {op:"setmetatile",args:[5,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[6,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[7,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[5,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"setmetatile",args:[6,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"setmetatile",args:[7,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"special",args:["DrawWholeMapView"]},
  {op:"return",args:[]},
  {op:"setmetatile",args:[6,1,"METATILE_EliteFour_OpenDoor_Frame",0]},
  {op:"setmetatile",args:[6,2,"METATILE_EliteFour_OpenDoor_Opening",0]},
  {op:"setmetatile",args:[5,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[6,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[7,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[5,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"setmetatile",args:[6,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"setmetatile",args:[7,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"setmetatile",args:[0,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[1,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"setmetatile",args:[2,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[3,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"setmetatile",args:[4,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[8,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"setmetatile",args:[9,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[10,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"setmetatile",args:[11,2,"METATILE_EliteFour_RightSpotlightOff",1]},
  {op:"setmetatile",args:[12,2,"METATILE_EliteFour_LeftSpotlightOff",1]},
  {op:"return",args:[]},
  {op:"setmetatile",args:[5,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[6,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[7,12,"METATILE_EliteFour_EntryDoor_ClosedTop",1]},
  {op:"setmetatile",args:[5,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"setmetatile",args:[6,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"setmetatile",args:[7,13,"METATILE_EliteFour_EntryDoor_ClosedBottom",1]},
  {op:"return",args:[]},
] as const;
