// AUTO-GENERATED from data/maps/BattleFrontier_Lounge7/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=207, bytes=611, labels=36, unknownOps=4, unresolvedSymbols=33

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_Lounge7_MapScripts": 0,
  "BattleFrontier_Lounge7_EventScript_LeftMoveTutor": 0,
  "BattleFrontier_Lounge7_EventScript_AlreadyMetLeftTutor": 32,
  "BattleFrontier_Lounge7_EventScript_ChooseLeftTutorMove": 46,
  "BattleFrontier_Lounge7_EventScript_ChooseNewLeftTutorMove": 80,
  "BattleFrontier_Lounge7_EventScript_Softboiled": 110,
  "BattleFrontier_Lounge7_EventScript_SeismicToss": 120,
  "BattleFrontier_Lounge7_EventScript_DreamEater": 130,
  "BattleFrontier_Lounge7_EventScript_MegaPunch": 140,
  "BattleFrontier_Lounge7_EventScript_MegaKick": 150,
  "BattleFrontier_Lounge7_EventScript_BodySlam": 160,
  "BattleFrontier_Lounge7_EventScript_RockSlide": 170,
  "BattleFrontier_Lounge7_EventScript_Counter": 180,
  "BattleFrontier_Lounge7_EventScript_ThunderWave": 190,
  "BattleFrontier_Lounge7_EventScript_SwordsDance": 200,
  "BattleFrontier_Lounge7_EventScript_RightMoveTutor": 210,
  "BattleFrontier_Lounge7_EventScript_AlreadyMetRightTutor": 242,
  "BattleFrontier_Lounge7_EventScript_ChooseRightTutorMove": 256,
  "BattleFrontier_Lounge7_EventScript_ChooseNewRightTutorMove": 290,
  "BattleFrontier_Lounge7_EventScript_DefenseCurl": 320,
  "BattleFrontier_Lounge7_EventScript_Snore": 330,
  "BattleFrontier_Lounge7_EventScript_MudSlap": 340,
  "BattleFrontier_Lounge7_EventScript_Swift": 350,
  "BattleFrontier_Lounge7_EventScript_IcyWind": 360,
  "BattleFrontier_Lounge7_EventScript_Endure": 370,
  "BattleFrontier_Lounge7_EventScript_PsychUp": 380,
  "BattleFrontier_Lounge7_EventScript_IcePunch": 390,
  "BattleFrontier_Lounge7_EventScript_ThunderPunch": 400,
  "BattleFrontier_Lounge7_EventScript_FirePunch": 410,
  "BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect": 420,
  "BattleFrontier_Lounge7_EventScript_CancelChooseMon": 438,
  "BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection": 448,
  "BattleFrontier_Lounge7_EventScript_TeachTutorMove": 522,
  "BattleFrontier_Lounge7_EventScript_ChooseNewMove": 577,
  "BattleFrontier_Lounge7_EventScript_Sailor": 593,
  "BattleFrontier_Lounge7_EventScript_Gentleman": 602,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,113,0,9,0,44,90,1,7,1,32,0,0,0,16,0,0,0,0,0,10,0,42,90,1,89,46,0,0,0,90,16,0,0,0,0,0,10,0,89,46,0,0,0,90,104,0,0,0,0,0,0,0,38,0,0,0,113,0,0,0,113,4,9,0,113,6,0,0,38,0,0,0,26,0,0,13,128,90,104,0,0,0,0,0,0,0,113,0,0,0,113,4,9,0,113,6,1,0,38,0,0,0,26,0,0,13,128,90,113,8,16,0,89,192,1,0,0,90,113,8,24,0,89,192,1,0,0,90,113,8,24,0,89,192,1,0,0,90,113,8,24,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,107,91,113,0,10,0,44,91,1,7,1,242,0,0,0,16,0,0,0,0,0,10,0,42,91,1,89,0,1,0,0,90,16,0,0,0,0,0,10,0,89,0,1,0,0,90,104,0,0,0,0,0,0,0,38,0,0,0,113,0,1,0,113,4,10,0,113,6,0,0,38,0,0,0,26,0,0,13,128,90,104,0,0,0,0,0,0,0,113,0,1,0,113,4,10,0,113,6,1,0,38,0,0,0,26,0,0,13,128,90,113,8,16,0,89,192,1,0,0,90,113,8,24,0,89,192,1,0,0,90,113,8,24,0,89,192,1,0,0,90,113,8,24,0,89,192,1,0,0,90,113,8,24,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,113,8,48,0,89,192,1,0,0,90,38,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,26,4,128,0,0,26,5,128,0,0,38,0,0,0,132,0,1,2,0,8,128,26,4,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,39,0,0,0,0,0,35,0,0,8,128,34,0,0,8,128,16,0,0,0,0,0,10,0,89,65,2,0,0,90,16,0,0,0,0,0,10,0,38,0,0,0,152,1,38,0,0,0,38,0,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,26,4,128,8,128,38,0,0,0,109,90,35,0,0,0,0,34,0,0,0,0,89,34,1,0,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 207, bytes: 611, labels: 36, unknownOps: 4, unresolvedSymbols: 33 } as const;
