// AUTO-GENERATED from data/maps/BattleFrontier_Lounge3/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=138, bytes=883, labels=28, unknownOps=0, unresolvedSymbols=41

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_Lounge3_MapScripts": 0,
  "BattleFrontier_Lounge3_EventScript_Gambler": 0,
  "BattleFrontier_Lounge3_EventScript_AskToEnterChallenge": 55,
  "BattleFrontier_Lounge3_EventScript_ChooseBetAmount": 137,
  "BattleFrontier_Lounge3_EventScript_Bet5": 313,
  "BattleFrontier_Lounge3_EventScript_Bet10": 324,
  "BattleFrontier_Lounge3_EventScript_Bet15": 335,
  "BattleFrontier_Lounge3_EventScript_TryPlaceBet": 346,
  "BattleFrontier_Lounge3_EventScript_PlaceBet": 394,
  "BattleFrontier_Lounge3_EventScript_FinishBet": 429,
  "BattleFrontier_Lounge3_EventScript_CountSilverSymbols": 441,
  "BattleFrontier_Lounge3_EventScript_AddSilverSymbolCount": 510,
  "BattleFrontier_Lounge3_EventScript_NotEnoughSilverSymbols": 516,
  "BattleFrontier_Lounge3_EventScript_AlreadyMetGambler": 530,
  "BattleFrontier_Lounge3_EventScript_CheckBetResults": 566,
  "BattleFrontier_Lounge3_EventScript_WonChallenge": 616,
  "BattleFrontier_Lounge3_EventScript_LostChallenge": 717,
  "BattleFrontier_Lounge3_EventScript_RewardBet5": 732,
  "BattleFrontier_Lounge3_EventScript_RewardBet10": 745,
  "BattleFrontier_Lounge3_EventScript_RewardBet15": 758,
  "BattleFrontier_Lounge3_EventScript_ChallengeNotAttempted": 771,
  "BattleFrontier_Lounge3_EventScript_DeclineChallenge": 779,
  "BattleFrontier_Lounge3_EventScript_CancelBet": 789,
  "BattleFrontier_Lounge3_EventScript_Man": 799,
  "BattleFrontier_Lounge3_EventScript_Woman": 808,
  "BattleFrontier_Lounge3_EventScript_PokefanF": 824,
  "BattleFrontier_Lounge3_EventScript_FatMan": 840,
  "BattleFrontier_Lounge3_EventScript_FaceOriginalDirection": 856,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,87,1,7,1,18,2,0,0,5,185,1,0,0,35,4,128,2,0,34,4,128,2,0,7,3,4,2,0,0,7,3,4,128,0,0,42,87,1,16,0,0,0,0,0,10,4,6,55,0,0,0,3,38,0,0,58,103,110,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,11,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,11,3,0,0,7,1,13,128,0,0,104,0,0,0,0,103,38,0,0,58,6,137,0,0,0,3,112,20,4,87,0,26,50,64,13,128,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,57,1,0,0,34,57,1,0,0,7,1,0,0,0,0,7,1,57,1,0,0,35,0,128,1,0,34,0,128,1,0,35,68,1,0,0,34,68,1,0,0,7,1,0,0,0,0,7,1,68,1,0,0,35,0,128,2,0,34,0,128,2,0,35,79,1,0,0,34,79,1,0,0,7,1,0,0,0,0,7,1,79,1,0,0,35,0,128,3,0,34,0,128,3,0,35,21,3,0,0,34,21,3,0,0,7,1,0,0,0,0,7,1,21,3,0,0,35,0,128,127,0,34,0,128,127,0,35,21,3,0,0,34,21,3,0,0,7,1,0,0,0,0,7,1,21,3,0,0,3,23,8,128,5,0,6,90,1,0,0,3,23,8,128,10,0,6,90,1,0,0,3,23,8,128,15,0,6,90,1,0,0,3,39,0,0,0,0,58,35,0,0,8,128,34,0,0,8,128,7,4,138,1,0,0,7,4,0,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,103,6,137,0,0,0,3,26,4,128,8,128,38,0,0,58,23,51,64,1,0,38,0,0,58,48,95,0,16,0,0,0,0,0,10,4,6,173,1,0,0,3,38,0,0,58,103,110,38,0,0,58,109,3,23,4,128,0,0,44,0,0,8,1,254,1,0,0,44,0,0,8,1,254,1,0,0,44,0,0,8,1,254,1,0,0,44,0,0,8,1,254,1,0,0,44,0,0,8,1,254,1,0,0,44,0,0,8,1,254,1,0,0,44,0,0,8,1,254,1,0,0,4,24,4,128,1,0,4,16,0,0,0,0,0,10,4,6,88,3,0,0,3,16,0,0,0,0,0,10,4,35,51,64,1,0,34,51,64,1,0,7,4,54,2,0,0,7,4,51,64,0,0,6,55,0,0,0,3,35,51,64,1,0,34,51,64,1,0,7,1,3,3,0,0,7,1,51,64,0,0,35,51,64,2,0,34,51,64,2,0,7,1,104,2,0,0,7,1,51,64,0,0,6,205,2,0,0,3,16,0,0,0,0,0,10,4,35,50,64,0,0,34,50,64,0,0,8,1,220,2,0,0,8,1,50,64,0,0,35,50,64,1,0,34,50,64,1,0,8,1,233,2,0,0,8,1,50,64,0,0,35,50,64,2,0,34,50,64,2,0,8,1,246,2,0,0,8,1,50,64,0,0,16,0,0,0,0,0,10,9,38,0,0,58,16,0,0,0,0,0,10,4,23,51,64,0,0,109,3,16,0,0,0,0,0,10,4,23,51,64,0,0,109,3,132,0,1,2,0,0,0,23,4,128,0,0,4,132,0,1,2,0,0,0,23,4,128,0,0,4,132,0,1,2,0,0,0,23,4,128,0,0,4,38,0,0,58,103,110,109,3,16,0,0,0,0,0,10,4,109,3,38,0,0,58,6,11,3,0,0,3,16,0,0,0,0,0,10,2,3,107,91,16,0,0,0,0,0,10,4,6,88,3,0,0,3,107,91,16,0,0,0,0,0,10,4,6,88,3,0,0,3,107,91,16,0,0,0,0,0,10,4,6,88,3,0,0,3,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3] as const;

export const STATS = { ops: 138, bytes: 883, labels: 28, unknownOps: 0, unresolvedSymbols: 41 } as const;
