// AUTO-GENERATED from data/maps/BattleFrontier_Lounge3/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=138, bytes=701, labels=28, unknownOps=2, unresolvedSymbols=48

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_Lounge3_MapScripts": 0,
  "BattleFrontier_Lounge3_EventScript_Gambler": 0,
  "BattleFrontier_Lounge3_EventScript_AskToEnterChallenge": 43,
  "BattleFrontier_Lounge3_EventScript_ChooseBetAmount": 105,
  "BattleFrontier_Lounge3_EventScript_Bet5": 221,
  "BattleFrontier_Lounge3_EventScript_Bet10": 231,
  "BattleFrontier_Lounge3_EventScript_Bet15": 241,
  "BattleFrontier_Lounge3_EventScript_TryPlaceBet": 251,
  "BattleFrontier_Lounge3_EventScript_PlaceBet": 289,
  "BattleFrontier_Lounge3_EventScript_FinishBet": 323,
  "BattleFrontier_Lounge3_EventScript_CountSilverSymbols": 337,
  "BattleFrontier_Lounge3_EventScript_AddSilverSymbolCount": 405,
  "BattleFrontier_Lounge3_EventScript_NotEnoughSilverSymbols": 409,
  "BattleFrontier_Lounge3_EventScript_AlreadyMetGambler": 423,
  "BattleFrontier_Lounge3_EventScript_CheckBetResults": 447,
  "BattleFrontier_Lounge3_EventScript_WonChallenge": 473,
  "BattleFrontier_Lounge3_EventScript_LostChallenge": 537,
  "BattleFrontier_Lounge3_EventScript_RewardBet5": 551,
  "BattleFrontier_Lounge3_EventScript_RewardBet10": 563,
  "BattleFrontier_Lounge3_EventScript_RewardBet15": 575,
  "BattleFrontier_Lounge3_EventScript_ChallengeNotAttempted": 587,
  "BattleFrontier_Lounge3_EventScript_DeclineChallenge": 597,
  "BattleFrontier_Lounge3_EventScript_CancelBet": 607,
  "BattleFrontier_Lounge3_EventScript_Man": 617,
  "BattleFrontier_Lounge3_EventScript_Woman": 626,
  "BattleFrontier_Lounge3_EventScript_PokefanF": 642,
  "BattleFrontier_Lounge3_EventScript_FatMan": 658,
  "BattleFrontier_Lounge3_EventScript_FaceOriginalDirection": 674,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,87,1,7,1,167,1,0,0,88,81,1,0,0,35,4,128,2,0,34,4,128,2,0,42,87,1,16,0,0,0,0,0,10,0,89,43,0,0,0,90,38,0,0,0,0,0,0,110,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,104,0,0,0,0,0,0,0,38,0,0,0,89,105,0,0,0,90,112,20,4,87,0,26,50,64,13,128,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,221,0,0,0,34,221,0,0,0,35,0,128,1,0,34,0,128,1,0,35,231,0,0,0,34,231,0,0,0,35,0,128,2,0,34,0,128,2,0,35,241,0,0,0,34,241,0,0,0,35,0,128,3,0,34,0,128,3,0,35,95,2,0,0,34,95,2,0,0,35,0,128,127,0,34,0,128,127,0,35,95,2,0,0,34,95,2,0,0,90,113,8,5,0,89,251,0,0,0,90,113,8,10,0,89,251,0,0,0,90,113,8,15,0,89,251,0,0,0,90,39,0,0,0,0,0,35,0,0,8,128,34,0,0,8,128,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,89,105,0,0,0,90,26,4,128,8,128,38,0,0,0,113,51,1,0,38,0,0,0,9,95,0,16,0,0,0,0,0,10,0,89,67,1,0,0,90,38,0,0,0,0,0,0,110,38,0,0,0,109,90,113,4,0,0,44,0,0,8,1,149,1,0,0,44,0,0,8,1,149,1,0,0,44,0,0,8,1,149,1,0,0,44,0,0,8,1,149,1,0,0,44,0,0,8,1,149,1,0,0,44,0,0,8,1,149,1,0,0,44,0,0,8,1,149,1,0,0,15,115,4,1,15,16,0,0,0,0,0,10,0,89,162,2,0,0,90,16,0,0,0,0,0,10,0,35,51,64,1,0,34,51,64,1,0,89,43,0,0,0,90,35,51,64,1,0,34,51,64,1,0,35,51,64,2,0,34,51,64,2,0,89,25,2,0,0,90,16,0,0,0,0,0,10,0,35,50,64,0,0,34,50,64,0,0,35,50,64,1,0,34,50,64,1,0,35,50,64,2,0,34,50,64,2,0,16,0,0,0,0,0,10,0,38,0,0,0,16,0,0,0,0,0,10,0,113,51,0,0,109,90,16,0,0,0,0,0,10,0,113,51,0,0,109,90,132,0,1,2,0,0,0,113,4,0,0,15,132,0,1,2,0,0,0,113,4,0,0,15,132,0,1,2,0,0,0,113,4,0,0,15,38,0,0,0,0,0,0,110,109,90,16,0,0,0,0,0,10,0,109,90,38,0,0,0,89,85,2,0,0,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,89,162,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,162,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,162,2,0,0,90,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90] as const;

export const STATS = { ops: 138, bytes: 701, labels: 28, unknownOps: 2, unresolvedSymbols: 48 } as const;
