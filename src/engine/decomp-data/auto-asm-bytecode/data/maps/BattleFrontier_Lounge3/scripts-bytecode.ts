// AUTO-GENERATED from data/maps/BattleFrontier_Lounge3/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=138, bytes=881, labels=28, unknownOps=0, unresolvedSymbols=43

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_Lounge3_MapScripts": 0,
  "BattleFrontier_Lounge3_EventScript_Gambler": 0,
  "BattleFrontier_Lounge3_EventScript_AskToEnterChallenge": 55,
  "BattleFrontier_Lounge3_EventScript_ChooseBetAmount": 141,
  "BattleFrontier_Lounge3_EventScript_Bet5": 317,
  "BattleFrontier_Lounge3_EventScript_Bet10": 327,
  "BattleFrontier_Lounge3_EventScript_Bet15": 337,
  "BattleFrontier_Lounge3_EventScript_TryPlaceBet": 347,
  "BattleFrontier_Lounge3_EventScript_PlaceBet": 397,
  "BattleFrontier_Lounge3_EventScript_FinishBet": 431,
  "BattleFrontier_Lounge3_EventScript_CountSilverSymbols": 445,
  "BattleFrontier_Lounge3_EventScript_AddSilverSymbolCount": 513,
  "BattleFrontier_Lounge3_EventScript_NotEnoughSilverSymbols": 517,
  "BattleFrontier_Lounge3_EventScript_AlreadyMetGambler": 531,
  "BattleFrontier_Lounge3_EventScript_CheckBetResults": 567,
  "BattleFrontier_Lounge3_EventScript_WonChallenge": 617,
  "BattleFrontier_Lounge3_EventScript_LostChallenge": 717,
  "BattleFrontier_Lounge3_EventScript_RewardBet5": 731,
  "BattleFrontier_Lounge3_EventScript_RewardBet10": 743,
  "BattleFrontier_Lounge3_EventScript_RewardBet15": 755,
  "BattleFrontier_Lounge3_EventScript_ChallengeNotAttempted": 767,
  "BattleFrontier_Lounge3_EventScript_DeclineChallenge": 777,
  "BattleFrontier_Lounge3_EventScript_CancelBet": 787,
  "BattleFrontier_Lounge3_EventScript_Man": 797,
  "BattleFrontier_Lounge3_EventScript_Woman": 806,
  "BattleFrontier_Lounge3_EventScript_PokefanF": 822,
  "BattleFrontier_Lounge3_EventScript_FatMan": 838,
  "BattleFrontier_Lounge3_EventScript_FaceOriginalDirection": 854,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,87,1,7,1,19,2,0,0,88,189,1,0,0,35,4,128,2,0,34,4,128,2,0,7,3,5,2,0,0,7,3,4,128,0,0,42,87,1,16,0,0,0,0,0,10,4,89,55,0,0,0,90,38,0,0,0,0,0,0,110,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,9,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,9,3,0,0,7,1,13,128,0,0,104,0,0,0,0,0,0,0,38,0,0,0,89,141,0,0,0,90,112,20,4,87,0,26,50,64,13,128,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,61,1,0,0,34,61,1,0,0,7,1,0,0,0,0,7,1,61,1,0,0,35,0,128,1,0,34,0,128,1,0,35,71,1,0,0,34,71,1,0,0,7,1,0,0,0,0,7,1,71,1,0,0,35,0,128,2,0,34,0,128,2,0,35,81,1,0,0,34,81,1,0,0,7,1,0,0,0,0,7,1,81,1,0,0,35,0,128,3,0,34,0,128,3,0,35,19,3,0,0,34,19,3,0,0,7,1,0,0,0,0,7,1,19,3,0,0,35,0,128,127,0,34,0,128,127,0,35,19,3,0,0,34,19,3,0,0,7,1,0,0,0,0,7,1,19,3,0,0,90,113,8,5,0,89,91,1,0,0,90,113,8,10,0,89,91,1,0,0,90,113,8,15,0,89,91,1,0,0,90,39,0,0,0,0,0,35,0,0,8,128,34,0,0,8,128,7,4,141,1,0,0,7,4,0,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,89,141,0,0,0,90,26,4,128,8,128,38,0,0,0,113,51,1,0,38,0,0,0,9,95,0,16,0,0,0,0,0,10,4,89,175,1,0,0,90,38,0,0,0,0,0,0,110,38,0,0,0,109,90,113,4,0,0,44,0,0,8,1,1,2,0,0,44,0,0,8,1,1,2,0,0,44,0,0,8,1,1,2,0,0,44,0,0,8,1,1,2,0,0,44,0,0,8,1,1,2,0,0,44,0,0,8,1,1,2,0,0,44,0,0,8,1,1,2,0,0,15,115,4,1,15,16,0,0,0,0,0,10,4,89,86,3,0,0,90,16,0,0,0,0,0,10,4,35,51,64,1,0,34,51,64,1,0,7,4,55,2,0,0,7,4,51,64,0,0,89,55,0,0,0,90,35,51,64,1,0,34,51,64,1,0,7,1,255,2,0,0,7,1,51,64,0,0,35,51,64,2,0,34,51,64,2,0,7,1,105,2,0,0,7,1,51,64,0,0,89,205,2,0,0,90,16,0,0,0,0,0,10,4,35,50,64,0,0,34,50,64,0,0,8,1,219,2,0,0,8,1,50,64,0,0,35,50,64,1,0,34,50,64,1,0,8,1,231,2,0,0,8,1,50,64,0,0,35,50,64,2,0,34,50,64,2,0,8,1,243,2,0,0,8,1,50,64,0,0,16,0,0,0,0,0,10,9,38,0,0,0,16,0,0,0,0,0,10,4,113,51,0,0,109,90,16,0,0,0,0,0,10,4,113,51,0,0,109,90,132,0,1,2,0,0,0,113,4,0,0,15,132,0,1,2,0,0,0,113,4,0,0,15,132,0,1,2,0,0,0,113,4,0,0,15,38,0,0,0,0,0,0,110,109,90,16,0,0,0,0,0,10,4,109,90,38,0,0,0,89,9,3,0,0,90,16,0,0,0,0,0,10,2,90,107,91,16,0,0,0,0,0,10,4,89,86,3,0,0,90,107,91,16,0,0,0,0,0,10,4,89,86,3,0,0,90,107,91,16,0,0,0,0,0,10,4,89,86,3,0,0,90,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90] as const;

export const STATS = { ops: 138, bytes: 881, labels: 28, unknownOps: 0, unresolvedSymbols: 43 } as const;
