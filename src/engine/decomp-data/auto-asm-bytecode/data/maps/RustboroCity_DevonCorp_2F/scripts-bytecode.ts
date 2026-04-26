// AUTO-GENERATED from data/maps/RustboroCity_DevonCorp_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=194, bytes=1013, labels=37, unknownOps=2, unresolvedSymbols=36

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RustboroCity_DevonCorp_2F_MapScripts": 0,
  "RustboroCity_DevonCorp_2F_OnTransition": 5,
  "RustboroCity_DevonCorp_2F_EventScript_SetFossilReady": 16,
  "RustboroCity_DevonCorp_2F_EventScript_TalkToPokemonScientist": 21,
  "RustboroCity_DevonCorp_2F_EventScript_BallScientist": 43,
  "RustboroCity_DevonCorp_2F_EventScript_DevelopedBalls": 74,
  "RustboroCity_DevonCorp_2F_EventScript_PokenavScientist": 84,
  "RustboroCity_DevonCorp_2F_EventScript_HasPokenav": 115,
  "RustboroCity_DevonCorp_2F_EventScript_PokemonDreamsScientist": 125,
  "RustboroCity_DevonCorp_2F_EventScript_FossilScientist": 147,
  "RustboroCity_DevonCorp_2F_EventScript_NoticeRootFossil": 209,
  "RustboroCity_DevonCorp_2F_EventScript_GiveRootFossil": 300,
  "RustboroCity_DevonCorp_2F_EventScript_NoticeClawFossil": 327,
  "RustboroCity_DevonCorp_2F_EventScript_GiveClawFossil": 418,
  "RustboroCity_DevonCorp_2F_EventScript_DeclineGiveFossil": 445,
  "RustboroCity_DevonCorp_2F_EventScript_StillRegenerating": 455,
  "RustboroCity_DevonCorp_2F_EventScript_FossilMonReady": 465,
  "RustboroCity_DevonCorp_2F_EventScript_LileepReady": 486,
  "RustboroCity_DevonCorp_2F_EventScript_AnorithReady": 507,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileep": 528,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepParty": 573,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepPC": 612,
  "RustboroCity_DevonCorp_2F_EventScript_TransferLileepToPC": 646,
  "RustboroCity_DevonCorp_2F_EventScript_ReceivedLileepFanfare": 657,
  "RustboroCity_DevonCorp_2F_EventScript_FinishReceivingLileep": 684,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorith": 693,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithParty": 738,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithPC": 777,
  "RustboroCity_DevonCorp_2F_EventScript_TransferAnorithToPC": 811,
  "RustboroCity_DevonCorp_2F_EventScript_ReceivedAnorithFanfare": 822,
  "RustboroCity_DevonCorp_2F_EventScript_FinishReceivingAnorith": 849,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseFossil": 858,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseClawFossil": 957,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseRootFossil": 963,
  "RustboroCity_DevonCorp_2F_EventScript_CancelFossilSelect": 969,
  "RustboroCity_DevonCorp_2F_EventScript_MatchCallScientist": 971,
  "RustboroCity_DevonCorp_2F_EventScript_WorkOnNext": 1003,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,35,196,64,1,0,34,196,64,1,0,90,113,196,2,0,15,107,91,35,196,64,1,0,34,196,64,1,0,16,0,0,0,0,0,10,0,109,90,107,91,35,196,64,1,0,34,196,64,1,0,44,31,1,7,1,74,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,35,196,64,1,0,34,196,64,1,0,44,188,0,7,1,115,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,35,196,64,1,0,34,196,64,1,0,16,0,0,0,0,0,10,0,109,90,107,91,35,196,64,2,0,34,196,64,2,0,35,196,64,1,0,34,196,64,1,0,16,0,0,0,0,0,10,0,72,30,1,1,0,35,13,128,1,0,34,13,128,1,0,72,31,1,1,0,35,13,128,1,0,34,13,128,1,0,109,90,105,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,72,31,1,1,0,35,13,128,1,0,34,13,128,1,0,89,44,1,0,0,90,129,0,1,2,0,30,1,16,0,0,0,0,0,10,0,0,30,113,196,1,0,113,197,1,0,109,90,105,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,72,30,1,1,0,35,13,128,1,0,34,13,128,1,0,89,162,1,0,0,90,129,0,1,2,0,31,1,16,0,0,0,0,0,10,0,0,31,113,196,1,0,113,197,2,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,35,197,64,1,0,34,197,64,1,0,35,197,64,2,0,34,197,64,2,0,90,126,0,1,2,0,132,1,16,0,0,0,0,0,10,0,89,16,2,0,0,90,126,0,1,2,0,134,1,16,0,0,0,0,0,10,0,89,181,2,0,0,90,113,0,132,1,122,132,1,20,0,0,0,0,0,0,0,0,0,0,0,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,89,0,0,0,0,90,88,145,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,88,0,0,0,0,89,172,2,0,0,90,88,145,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,89,134,2,0,0,90,88,0,0,0,0,89,172,2,0,0,90,126,0,1,2,0,132,1,50,114,1,104,0,0,0,0,0,0,0,51,126,0,1,2,0,132,1,15,113,196,0,0,42,11,1,109,90,113,0,134,1,122,134,1,20,0,0,0,0,0,0,0,0,0,0,0,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,89,0,0,0,0,90,88,54,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,88,0,0,0,0,89,81,3,0,0,90,88,54,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,89,43,3,0,0,90,88,0,0,0,0,89,81,3,0,0,90,126,0,1,2,0,134,1,50,114,1,104,0,0,0,0,0,0,0,51,126,0,1,2,0,134,1,15,113,196,0,0,42,11,1,109,90,104,0,0,0,0,0,0,0,112,17,6,93,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,189,3,0,0,34,189,3,0,0,35,0,128,1,0,34,0,128,1,0,35,195,3,0,0,34,195,3,0,0,35,0,128,2,0,34,0,128,2,0,35,201,3,0,0,34,201,3,0,0,35,0,128,127,0,34,0,128,127,0,35,201,3,0,0,34,201,3,0,0,90,89,162,1,0,0,90,89,44,1,0,0,90,109,90,107,91,35,196,64,1,0,34,196,64,1,0,35,90,64,6,0,34,90,64,6,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 194, bytes: 1013, labels: 37, unknownOps: 2, unresolvedSymbols: 36 } as const;
