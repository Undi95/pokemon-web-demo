// AUTO-GENERATED from data/maps/RustboroCity_DevonCorp_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=194, bytes=1361, labels=37, unknownOps=0, unresolvedSymbols=33

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RustboroCity_DevonCorp_2F_MapScripts": 0,
  "RustboroCity_DevonCorp_2F_OnTransition": 5,
  "RustboroCity_DevonCorp_2F_EventScript_SetFossilReady": 28,
  "RustboroCity_DevonCorp_2F_EventScript_TalkToPokemonScientist": 33,
  "RustboroCity_DevonCorp_2F_EventScript_BallScientist": 67,
  "RustboroCity_DevonCorp_2F_EventScript_DevelopedBalls": 110,
  "RustboroCity_DevonCorp_2F_EventScript_PokenavScientist": 120,
  "RustboroCity_DevonCorp_2F_EventScript_HasPokenav": 163,
  "RustboroCity_DevonCorp_2F_EventScript_PokemonDreamsScientist": 173,
  "RustboroCity_DevonCorp_2F_EventScript_FossilScientist": 207,
  "RustboroCity_DevonCorp_2F_EventScript_NoticeRootFossil": 317,
  "RustboroCity_DevonCorp_2F_EventScript_GiveRootFossil": 432,
  "RustboroCity_DevonCorp_2F_EventScript_NoticeClawFossil": 459,
  "RustboroCity_DevonCorp_2F_EventScript_GiveClawFossil": 574,
  "RustboroCity_DevonCorp_2F_EventScript_DeclineGiveFossil": 601,
  "RustboroCity_DevonCorp_2F_EventScript_StillRegenerating": 611,
  "RustboroCity_DevonCorp_2F_EventScript_FossilMonReady": 621,
  "RustboroCity_DevonCorp_2F_EventScript_LileepReady": 666,
  "RustboroCity_DevonCorp_2F_EventScript_AnorithReady": 687,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileep": 708,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepParty": 777,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepPC": 828,
  "RustboroCity_DevonCorp_2F_EventScript_TransferLileepToPC": 874,
  "RustboroCity_DevonCorp_2F_EventScript_ReceivedLileepFanfare": 885,
  "RustboroCity_DevonCorp_2F_EventScript_FinishReceivingLileep": 912,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorith": 921,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithParty": 990,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithPC": 1041,
  "RustboroCity_DevonCorp_2F_EventScript_TransferAnorithToPC": 1087,
  "RustboroCity_DevonCorp_2F_EventScript_ReceivedAnorithFanfare": 1098,
  "RustboroCity_DevonCorp_2F_EventScript_FinishReceivingAnorith": 1125,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseFossil": 1134,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseClawFossil": 1281,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseRootFossil": 1287,
  "RustboroCity_DevonCorp_2F_EventScript_CancelFossilSelect": 1293,
  "RustboroCity_DevonCorp_2F_EventScript_MatchCallScientist": 1295,
  "RustboroCity_DevonCorp_2F_EventScript_WorkOnNext": 1351,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,90,113,196,2,0,15,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,16,0,0,0,0,0,10,4,109,90,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,44,31,1,7,1,110,0,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,44,188,0,7,1,163,0,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,16,0,0,0,0,0,10,4,109,90,107,91,35,196,64,2,0,34,196,64,2,0,7,1,109,2,0,0,7,1,196,64,0,0,35,196,64,1,0,34,196,64,1,0,7,1,99,2,0,0,7,1,196,64,0,0,16,0,0,0,0,0,10,4,72,30,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,61,1,0,0,7,1,13,128,0,0,72,31,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,203,1,0,0,7,1,13,128,0,0,109,90,105,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,89,2,0,0,7,1,13,128,0,0,72,31,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,110,4,0,0,7,1,13,128,0,0,89,176,1,0,0,90,129,0,1,2,0,30,1,16,0,0,0,0,0,10,4,0,30,113,196,1,0,113,197,1,0,109,90,105,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,89,2,0,0,7,1,13,128,0,0,72,30,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,110,4,0,0,7,1,13,128,0,0,89,62,2,0,0,90,129,0,1,2,0,31,1,16,0,0,0,0,0,10,4,0,31,113,196,1,0,113,197,2,0,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,35,197,64,1,0,34,197,64,1,0,7,1,154,2,0,0,7,1,197,64,0,0,35,197,64,2,0,34,197,64,2,0,7,1,175,2,0,0,7,1,197,64,0,0,90,126,0,1,2,0,132,1,16,0,0,0,0,0,10,4,89,196,2,0,0,90,126,0,1,2,0,134,1,16,0,0,0,0,0,10,4,89,153,3,0,0,90,113,0,132,1,122,132,1,20,0,0,0,0,0,0,0,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,9,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,60,3,0,0,7,1,13,128,0,0,89,0,0,0,0,90,88,117,3,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,144,3,0,0,7,1,13,128,0,0,88,0,0,0,0,88,0,0,0,0,89,144,3,0,0,90,88,117,3,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,106,3,0,0,7,1,13,128,0,0,88,0,0,0,0,89,106,3,0,0,90,88,0,0,0,0,89,144,3,0,0,90,126,0,1,2,0,132,1,50,114,1,104,0,0,0,0,0,0,0,51,126,0,1,2,0,132,1,15,113,196,0,0,42,11,1,109,90,113,0,134,1,122,134,1,20,0,0,0,0,0,0,0,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,222,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,17,4,0,0,7,1,13,128,0,0,89,0,0,0,0,90,88,74,4,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,101,4,0,0,7,1,13,128,0,0,88,0,0,0,0,88,0,0,0,0,89,101,4,0,0,90,88,74,4,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,63,4,0,0,7,1,13,128,0,0,88,0,0,0,0,89,63,4,0,0,90,88,0,0,0,0,89,101,4,0,0,90,126,0,1,2,0,134,1,50,114,1,104,0,0,0,0,0,0,0,51,126,0,1,2,0,134,1,15,113,196,0,0,42,11,1,109,90,104,0,0,0,0,0,0,0,112,17,6,93,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,1,5,0,0,34,1,5,0,0,7,1,0,0,0,0,7,1,1,5,0,0,35,0,128,1,0,34,0,128,1,0,35,7,5,0,0,34,7,5,0,0,7,1,0,0,0,0,7,1,7,5,0,0,35,0,128,2,0,34,0,128,2,0,35,13,5,0,0,34,13,5,0,0,7,1,0,0,0,0,7,1,13,5,0,0,35,0,128,127,0,34,0,128,127,0,35,13,5,0,0,34,13,5,0,0,7,1,0,0,0,0,7,1,13,5,0,0,90,89,62,2,0,0,90,89,176,1,0,0,90,109,90,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,35,90,64,6,0,34,90,64,6,0,7,4,71,5,0,0,7,4,90,64,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90] as const;

export const STATS = { ops: 194, bytes: 1361, labels: 37, unknownOps: 0, unresolvedSymbols: 33 } as const;
