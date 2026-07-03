// AUTO-GENERATED from data/battle_scripts_2-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-07-03
// Stats: ops=115, bytes=397, labels=26, unknownOps=0, unresolvedSymbols=0

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "gBattlescriptsForBallThrow": 0,
  "gBattlescriptsForUsingItem": 0,
  "gBattlescriptsForRunningByItem": 0,
  "gBattlescriptsForSafariActions": 0,
  "BattleScript_BallThrow": 0,
  "BattleScript_BallThrowByWally": 18,
  "BattleScript_SafariBallThrow": 22,
  "BattleScript_SuccessBallThrow": 28,
  "BattleScript_PrintCaughtMonInfo": 42,
  "BattleScript_TryNicknameCaughtMon": 61,
  "BattleScript_GiveCaughtMonEnd": 90,
  "BattleScript_SuccessBallThrowEnd": 91,
  "BattleScript_WallyBallThrow": 98,
  "BattleScript_ShakeBallThrow": 108,
  "BattleScript_ShakeBallThrowEnd": 153,
  "BattleScript_TrainerBallBlock": 154,
  "BattleScript_PlayerUsesItem": 170,
  "BattleScript_OpponentUsesHealItem": 180,
  "BattleScript_OpponentUsesStatusCureItem": 227,
  "BattleScript_OpponentUsesXItem": 263,
  "BattleScript_OpponentUsesGuardSpec": 297,
  "BattleScript_RunByUsingItem": 331,
  "BattleScript_ActionWatchesCarefully": 341,
  "BattleScript_ActionGetNear": 348,
  "BattleScript_ActionThrowPokeblock": 357,
  "BattleScript_ActionWallyThrow": 379,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [43,4,13,0,0,240,0,2,0,0,18,0,0,0,16,1,1,239,16,2,1,239,16,1,1,152,1,239,42,0,78,0,0,240,5,0,42,0,0,0,96,11,16,11,1,241,61,0,0,0,16,15,1,58,46,41,0,0,240,0,242,16,13,1,58,46,41,0,0,240,0,243,90,0,0,0,240,19,79,0,0,240,18,64,0,40,91,0,0,0,240,46,51,0,0,240,7,247,16,12,1,46,51,0,0,240,7,247,19,80,0,0,240,18,64,0,43,5,13,0,0,240,128,0,0,0,153,0,0,0,41,1,81,0,0,240,0,153,0,0,0,16,34,1,18,64,0,46,51,0,0,240,8,246,18,64,0,16,3,1,18,64,0,16,4,1,18,64,0,246,46,3,0,0,240,15,73,1,0,61,16,48,1,57,48,0,84,1,0,16,87,1,18,64,0,117,53,1,0,0,240,0,1,0,0,11,1,12,1,16,42,1,18,64,0,152,1,46,3,0,0,240,15,73,1,0,246,16,48,1,57,48,0,84,1,0,16,87,1,18,64,0,117,19,82,0,0,240,18,64,0,152,1,46,3,0,0,240,15,73,1,0,246,16,48,1,57,48,0,84,1,0,16,87,1,18,64,0,117,19,11,0,0,240,18,64,0,46,3,0,0,240,15,73,1,0,246,16,48,1,57,48,0,84,1,0,16,87,1,18,64,0,117,19,25,0,0,240,18,64,0,46,3,0,0,240,15,73,1,0,246,84,17,0,46,51,0,0,240,4,247,16,29,1,18,64,0,62,19,83,0,0,240,18,64,0,62,16,33,1,18,64,0,69,1,4,0,0,0,0,19,84,0,0,240,18,64,0,62,16,2,0,18,64,0,75,58,83,0,58,16,77,1,18,64,0,62] as const;

export const STATS = { ops: 115, bytes: 397, labels: 26, unknownOps: 0, unresolvedSymbols: 0 } as const;
