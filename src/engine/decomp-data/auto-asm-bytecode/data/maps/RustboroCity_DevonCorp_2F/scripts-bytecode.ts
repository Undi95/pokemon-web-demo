// AUTO-GENERATED from data/maps/RustboroCity_DevonCorp_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=194, bytes=1370, labels=37, unknownOps=0, unresolvedSymbols=31

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RustboroCity_DevonCorp_2F_MapScripts": 0,
  "RustboroCity_DevonCorp_2F_OnTransition": 5,
  "RustboroCity_DevonCorp_2F_EventScript_SetFossilReady": 28,
  "RustboroCity_DevonCorp_2F_EventScript_TalkToPokemonScientist": 34,
  "RustboroCity_DevonCorp_2F_EventScript_BallScientist": 68,
  "RustboroCity_DevonCorp_2F_EventScript_DevelopedBalls": 111,
  "RustboroCity_DevonCorp_2F_EventScript_PokenavScientist": 121,
  "RustboroCity_DevonCorp_2F_EventScript_HasPokenav": 164,
  "RustboroCity_DevonCorp_2F_EventScript_PokemonDreamsScientist": 174,
  "RustboroCity_DevonCorp_2F_EventScript_FossilScientist": 208,
  "RustboroCity_DevonCorp_2F_EventScript_NoticeRootFossil": 318,
  "RustboroCity_DevonCorp_2F_EventScript_GiveRootFossil": 433,
  "RustboroCity_DevonCorp_2F_EventScript_NoticeClawFossil": 465,
  "RustboroCity_DevonCorp_2F_EventScript_GiveClawFossil": 580,
  "RustboroCity_DevonCorp_2F_EventScript_DeclineGiveFossil": 612,
  "RustboroCity_DevonCorp_2F_EventScript_StillRegenerating": 622,
  "RustboroCity_DevonCorp_2F_EventScript_FossilMonReady": 632,
  "RustboroCity_DevonCorp_2F_EventScript_LileepReady": 677,
  "RustboroCity_DevonCorp_2F_EventScript_AnorithReady": 698,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileep": 719,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepParty": 789,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepPC": 840,
  "RustboroCity_DevonCorp_2F_EventScript_TransferLileepToPC": 886,
  "RustboroCity_DevonCorp_2F_EventScript_ReceivedLileepFanfare": 897,
  "RustboroCity_DevonCorp_2F_EventScript_FinishReceivingLileep": 922,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorith": 932,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithParty": 1002,
  "RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithPC": 1053,
  "RustboroCity_DevonCorp_2F_EventScript_TransferAnorithToPC": 1099,
  "RustboroCity_DevonCorp_2F_EventScript_ReceivedAnorithFanfare": 1110,
  "RustboroCity_DevonCorp_2F_EventScript_FinishReceivingAnorith": 1135,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseFossil": 1145,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseClawFossil": 1290,
  "RustboroCity_DevonCorp_2F_EventScript_ChooseRootFossil": 1296,
  "RustboroCity_DevonCorp_2F_EventScript_CancelFossilSelect": 1302,
  "RustboroCity_DevonCorp_2F_EventScript_MatchCallScientist": 1304,
  "RustboroCity_DevonCorp_2F_EventScript_WorkOnNext": 1360,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,3,23,196,64,2,0,4,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,16,0,0,0,0,0,10,4,109,3,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,44,31,1,7,1,111,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,44,188,0,7,1,164,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,16,0,0,0,0,0,10,4,109,3,107,91,35,196,64,2,0,34,196,64,2,0,7,1,120,2,0,0,7,1,196,64,0,0,35,196,64,1,0,34,196,64,1,0,7,1,110,2,0,0,7,1,196,64,0,0,16,0,0,0,0,0,10,4,72,30,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,62,1,0,0,7,1,13,128,0,0,72,31,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,209,1,0,0,7,1,13,128,0,0,109,3,105,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,100,2,0,0,7,1,13,128,0,0,72,31,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,121,4,0,0,7,1,13,128,0,0,6,177,1,0,0,3,129,0,1,2,0,30,1,16,0,0,0,0,0,10,4,70,30,1,1,0,23,196,64,1,0,23,197,64,1,0,109,3,105,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,100,2,0,0,7,1,13,128,0,0,72,30,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,121,4,0,0,7,1,13,128,0,0,6,68,2,0,0,3,129,0,1,2,0,31,1,16,0,0,0,0,0,10,4,70,31,1,1,0,23,196,64,1,0,23,197,64,2,0,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,35,197,64,1,0,34,197,64,1,0,7,1,165,2,0,0,7,1,197,64,0,0,35,197,64,2,0,34,197,64,2,0,7,1,186,2,0,0,7,1,197,64,0,0,3,126,0,1,2,0,132,1,16,0,0,0,0,0,10,4,6,207,2,0,0,3,126,0,1,2,0,134,1,16,0,0,0,0,0,10,4,6,164,3,0,0,3,23,0,0,132,1,122,132,1,20,0,0,0,0,0,0,0,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,21,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,72,3,0,0,7,1,13,128,0,0,6,0,0,0,0,3,5,129,3,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,154,3,0,0,7,1,13,128,0,0,5,0,0,0,0,5,0,0,0,0,6,154,3,0,0,3,5,129,3,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,118,3,0,0,7,1,13,128,0,0,5,0,0,0,0,6,118,3,0,0,3,5,0,0,0,0,6,154,3,0,0,3,126,0,1,2,0,132,1,50,114,1,104,0,0,0,0,103,51,126,0,1,2,0,132,1,4,23,196,64,0,0,42,11,1,109,3,23,0,0,134,1,122,134,1,20,0,0,0,0,0,0,0,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,234,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,29,4,0,0,7,1,13,128,0,0,6,0,0,0,0,3,5,86,4,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,111,4,0,0,7,1,13,128,0,0,5,0,0,0,0,5,0,0,0,0,6,111,4,0,0,3,5,86,4,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,75,4,0,0,7,1,13,128,0,0,5,0,0,0,0,6,75,4,0,0,3,5,0,0,0,0,6,111,4,0,0,3,126,0,1,2,0,134,1,50,114,1,104,0,0,0,0,103,51,126,0,1,2,0,134,1,4,23,196,64,0,0,42,11,1,109,3,104,0,0,0,0,103,112,17,6,93,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,10,5,0,0,34,10,5,0,0,7,1,0,0,0,0,7,1,10,5,0,0,35,0,128,1,0,34,0,128,1,0,35,16,5,0,0,34,16,5,0,0,7,1,0,0,0,0,7,1,16,5,0,0,35,0,128,2,0,34,0,128,2,0,35,22,5,0,0,34,22,5,0,0,7,1,0,0,0,0,7,1,22,5,0,0,35,0,128,127,0,34,0,128,127,0,35,22,5,0,0,34,22,5,0,0,7,1,0,0,0,0,7,1,22,5,0,0,3,6,68,2,0,0,3,6,177,1,0,0,3,109,3,107,91,35,196,64,1,0,34,196,64,1,0,8,1,28,0,0,0,8,1,196,64,0,0,35,90,64,6,0,34,90,64,6,0,7,4,80,5,0,0,7,4,90,64,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 194, bytes: 1370, labels: 37, unknownOps: 0, unresolvedSymbols: 31 } as const;
