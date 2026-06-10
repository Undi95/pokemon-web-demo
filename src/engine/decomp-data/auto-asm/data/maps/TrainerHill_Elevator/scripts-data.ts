// AUTO-GENERATED from data/maps/TrainerHill_Elevator/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/TrainerHill_Elevator/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'TrainerHill_Elevator_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'TrainerHill_Elevator_OnFrame', isGlobal: false, instrIndex: 1 },
  { name: 'TrainerHill_Elevator_EventScript_Attendant', isGlobal: true, instrIndex: 2 },
  { name: 'TrainerHill_Elevator_EventScript_ExitToRoof', isGlobal: true, instrIndex: 3 },
  { name: 'TrainerHill_Elevator_EventScript_EnterElevator', isGlobal: true, instrIndex: 9 },
  { name: 'TrainerHill_Elevator_EventScript_ExitFloorSelect', isGlobal: true, instrIndex: 28 },
  { name: 'TrainerHill_Elevator_EventScript_CloseFloorSelect', isGlobal: true, instrIndex: 30 },
  { name: 'TrainerHill_Elevator_EventScript_MoveElevator', isGlobal: true, instrIndex: 33 },
  { name: 'TrainerHill_Elevator_Movement_PlayerMoveToCenterOfElevator', isGlobal: false, instrIndex: 36 },
  { name: 'TrainerHill_Elevator_Movement_PlayerApproachAttendant', isGlobal: false, instrIndex: 41 },
  { name: 'TrainerHill_Elevator_Movement_PlayerExitElevator', isGlobal: false, instrIndex: 44 },
  { name: 'TrainerHill_Elevator_Movement_PlayerExitElevatorToRoof', isGlobal: false, instrIndex: 48 },
  { name: 'TrainerHill_Elevator_Movement_AttendantFacePlayer', isGlobal: false, instrIndex: 51 },
  { name: 'TrainerHill_Elevator_Movement_AttendantFaceDown', isGlobal: false, instrIndex: 53 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 55 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","TrainerHill_Elevator_OnFrame"]},
  {op:"map_script_2",args:["VAR_TEMP_4",0,"TrainerHill_Elevator_EventScript_EnterElevator"]},
  {op:"end",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","TrainerHill_Elevator_Movement_PlayerExitElevatorToRoof"]},
  {op:"waitmovement",args:[0]},
  {op:"releaseall",args:[]},
  {op:"warp",args:["MAP_TRAINER_HILL_ROOF",15,5]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","TrainerHill_Elevator_Movement_PlayerApproachAttendant"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_TRAINER_HILL_ELEVATOR_ATTENDANT","TrainerHill_Elevator_Movement_AttendantFacePlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"lockall",args:[]},
  {op:"msgbox",args:["TrainerHill_Elevator_Text_ReturnToReception","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","TrainerHill_Elevator_EventScript_ExitToRoof"]},
  {op:"releaseall",args:[]},
  {op:"applymovement",args:["LOCALID_TRAINER_HILL_ELEVATOR_ATTENDANT","TrainerHill_Elevator_Movement_AttendantFaceDown"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_PLAYER","TrainerHill_Elevator_Movement_PlayerMoveToCenterOfElevator"]},
  {op:"waitmovement",args:[0]},
  {op:"call",args:["TrainerHill_Elevator_EventScript_MoveElevator"]},
  {op:"delay",args:[25]},
  {op:"applymovement",args:["LOCALID_PLAYER","TrainerHill_Elevator_Movement_PlayerExitElevator"]},
  {op:"waitmovement",args:[0]},
  {op:"warp",args:["MAP_TRAINER_HILL_ENTRANCE",17,8]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"goto",args:["TrainerHill_Elevator_EventScript_CloseFloorSelect"]},
  {op:"end",args:[]},
  {op:"special",args:["CloseDeptStoreElevatorWindow"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"waitse",args:[]},
  {op:"special",args:["MoveElevator"]},
  {op:"return",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_right",args:[]},
  {op:"face_down",args:[]},
  {op:"step_end",args:[]},
  {op:"delay_16",args:[]},
  {op:"walk_left",args:[]},
  {op:"step_end",args:[]},
  {op:"delay_16",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"step_end",args:[]},
  {op:"face_down",args:[]},
  {op:"delay_16",args:[]},
  {op:"step_end",args:[]},
  {op:"face_right",args:[]},
  {op:"step_end",args:[]},
  {op:"face_down",args:[]},
  {op:"step_end",args:[]},
] as const;
