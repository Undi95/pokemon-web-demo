// AUTO-GENERATED from data/maps/RustboroCity_DevonCorp_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=194, bytes=925, labels=37, unknownOps=5, unresolvedSymbols=36

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RustboroCity_DevonCorp_2F_MapScripts": 0,
  "RustboroCity_DevonCorp_2F_OnTransition": 5,
  "RustboroCity_DevonCorp_2F_EventScript_SetFossilReady": 16,
  "RustboroCity_DevonCorp_2F_EventScript_TalkToPokemonScientist": 20,
  "RustboroCity_DevonCorp_2F_EventScript_BallScientist": 42,
  "RustboroCity_DevonCorp_2F_EventScript_DevelopedBalls": 73,
  "RustboroCity_DevonCorp_2F_EventScript_PokenavScientist": 83,
  "RustboroCity_DevonCorp_2F_EventScript_HasPokenav": 114,
  "RustboroCity_DevonCorp_2F_EventScript_PokemonDreamsScientist": 124,
  "RustboroCity_DevonCorp_2F_EventScript_FossilScientist": 146,
  "RustboroCity_DevonCorp_2F_EventScript_NoticeRootFossil": 208,
  "RustboroCity_DevonCorp_2F_EventScript_GiveRootFossil": 299,
  "RustboroCity_DevonCorp_2F_EventScript_NoticeClawFossil": 326,
  "RustboroCity_DevonCorp_2F_EventScript_GiveClawFossil": 417,
  "RustboroCity_DevonCorp_2F_EventScript_DeclineGiveFossil": 444,
  "RustboroCity_DevonCorp_2F_EventScript_StillRegenerating": 454,
  "RustboroCity_DevonCorp_2F_EventScript_FossilMonReady": 464,
  "RustboroCity_DevonCorp_2F_EventScript_LileepReady": 485,
  "RustboroCity_DevonCorp_2F_EventScript_AnorithReady": 506,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileep": 527,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepParty": 572,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepPC": 611,
  "RustboroCity_DevonCorp_2F_EventScript_TransferLileepToPC": 645,
  "RustboroCity_DevonCorp_2F_EventScript_ReceivedLileepFanfare": 656,
  "RustboroCity_DevonCorp_2F_EventScript_FinishReceivingLileep": 682,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorith": 691,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithParty": 736,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithPC": 775,
  "RustboroCity_DevonCorp_2F_EventScript_TransferAnorithToPC": 809,
  "RustboroCity_DevonCorp_2F_EventScript_ReceivedAnorithFanfare": 820,
  "RustboroCity_DevonCorp_2F_EventScript_FinishReceivingAnorith": 846,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseFossil": 855,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseClawFossil": 869,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseRootFossil": 875,
  "RustboroCity_DevonCorp_2F_EventScript_CancelFossilSelect": 881,
  "RustboroCity_DevonCorp_2F_EventScript_MatchCallScientist": 883,
  "RustboroCity_DevonCorp_2F_EventScript_WorkOnNext": 915,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,35,196,64,1,0,34,196,64,1,0,90,113,196,2,0,107,91,35,196,64,1,0,34,196,64,1,0,16,0,0,0,0,0,10,0,109,90,107,91,35,196,64,1,0,34,196,64,1,0,44,31,1,7,1,73,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,35,196,64,1,0,34,196,64,1,0,44,188,0,7,1,114,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,35,196,64,1,0,34,196,64,1,0,16,0,0,0,0,0,10,0,109,90,107,91,35,196,64,2,0,34,196,64,2,0,35,196,64,1,0,34,196,64,1,0,16,0,0,0,0,0,10,0,72,30,1,1,0,35,13,128,1,0,34,13,128,1,0,72,31,1,1,0,35,13,128,1,0,34,13,128,1,0,109,90,105,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,72,31,1,1,0,35,13,128,1,0,34,13,128,1,0,89,43,1,0,0,90,129,0,1,2,0,30,1,16,0,0,0,0,0,10,0,0,30,113,196,1,0,113,197,1,0,109,90,105,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,72,30,1,1,0,35,13,128,1,0,34,13,128,1,0,89,161,1,0,0,90,129,0,1,2,0,31,1,16,0,0,0,0,0,10,0,0,31,113,196,1,0,113,197,2,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,35,197,64,1,0,34,197,64,1,0,35,197,64,2,0,34,197,64,2,0,90,126,0,1,2,0,132,1,16,0,0,0,0,0,10,0,89,15,2,0,0,90,126,0,1,2,0,134,1,16,0,0,0,0,0,10,0,89,179,2,0,0,90,113,0,132,1,122,132,1,20,0,0,0,0,0,0,0,0,0,0,0,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,89,0,0,0,0,90,88,144,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,88,0,0,0,0,89,170,2,0,0,90,88,144,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,89,133,2,0,0,90,88,0,0,0,0,89,170,2,0,0,90,126,0,1,2,0,132,1,50,114,1,104,0,0,0,0,0,0,0,51,126,0,1,2,0,132,1,113,196,0,0,42,11,1,109,90,113,0,134,1,122,134,1,20,0,0,0,0,0,0,0,0,0,0,0,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,89,0,0,0,0,90,88,52,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,88,0,0,0,0,89,78,3,0,0,90,88,52,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,89,41,3,0,0,90,88,0,0,0,0,89,78,3,0,0,90,126,0,1,2,0,134,1,50,114,1,104,0,0,0,0,0,0,0,51,126,0,1,2,0,134,1,113,196,0,0,42,11,1,109,90,104,0,0,0,0,0,0,0,112,17,6,93,0,90,89,161,1,0,0,90,89,43,1,0,0,90,109,90,107,91,35,196,64,1,0,34,196,64,1,0,35,90,64,6,0,34,90,64,6,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 194, bytes: 925, labels: 37, unknownOps: 5, unresolvedSymbols: 36 } as const;
