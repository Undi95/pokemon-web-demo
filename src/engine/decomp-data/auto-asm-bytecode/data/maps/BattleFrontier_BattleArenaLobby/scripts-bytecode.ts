// AUTO-GENERATED from data/maps/BattleFrontier_BattleArenaLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=260, bytes=1169, labels=47, unknownOps=11, unresolvedSymbols=55

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleArenaLobby_MapScripts": 0,
  "BattleFrontier_BattleArenaLobby_OnWarp": 10,
  "BattleFrontier_BattleArenaLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleArenaLobby_OnFrame": 27,
  "BattleFrontier_BattleArenaLobby_EventScript_GetChallengeStatus": 67,
  "BattleFrontier_BattleArenaLobby_EventScript_QuitWithoutSaving": 76,
  "BattleFrontier_BattleArenaLobby_EventScript_WonChallenge": 155,
  "BattleFrontier_BattleArenaLobby_EventScript_DefeatedTycoon": 187,
  "BattleFrontier_BattleArenaLobby_EventScript_GiveBattlePoints": 195,
  "BattleFrontier_BattleArenaLobby_EventScript_LostChallenge": 247,
  "BattleFrontier_BattleArenaLobby_EventScript_SaveAfterChallenge": 297,
  "BattleFrontier_BattleArenaLobby_EventScript_RecordMatch": 358,
  "BattleFrontier_BattleArenaLobby_EventScript_EndSaveAfterChallenge": 363,
  "BattleFrontier_BattleArenaLobby_EventScript_ResumeChallenge": 363,
  "BattleFrontier_BattleArenaLobby_EventScript_Attendant": 418,
  "BattleFrontier_BattleArenaLobby_EventScript_AskTakeChallenge": 440,
  "BattleFrontier_BattleArenaLobby_EventScript_TryEnterChallenge": 453,
  "BattleFrontier_BattleArenaLobby_EventScript_SaveBeforeChallenge": 551,
  "BattleFrontier_BattleArenaLobby_EventScript_EnterChallenge": 673,
  "BattleFrontier_BattleArenaLobby_EventScript_ExplainChallenge": 759,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMons": 772,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLv50": 772,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLvOpen": 785,
  "BattleFrontier_BattleArenaLobby_EventScript_CancelChallengeSaveFailed": 798,
  "BattleFrontier_BattleArenaLobby_EventScript_LoadPartyAndCancelChallenge": 824,
  "BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge": 828,
  "BattleFrontier_BattleArenaLobby_EventScript_EndCancelChallenge": 836,
  "BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLv50": 838,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToLeftDoor": 930,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantEnterDoor": 930,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToLeftDoor": 930,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerEnterDoor": 930,
  "BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLvOpen": 930,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToRightDoor": 1022,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToRightDoor": 1022,
  "BattleFrontier_BattleArenaLobby_EventScript_ShowResults": 1022,
  "BattleFrontier_BattleArenaLobby_EventScript_Youngster": 1046,
  "BattleFrontier_BattleArenaLobby_EventScript_Man": 1055,
  "BattleFrontier_BattleArenaLobby_EventScript_Camper": 1064,
  "BattleFrontier_BattleArenaLobby_EventScript_Woman": 1073,
  "BattleFrontier_BattleArenaLobby_EventScript_RulesBoard": 1082,
  "BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard": 1097,
  "BattleFrontier_BattleArenaLobby_EventScript_BattleRules": 1111,
  "BattleFrontier_BattleArenaLobby_EventScript_MindRules": 1125,
  "BattleFrontier_BattleArenaLobby_EventScript_SkillRules": 1139,
  "BattleFrontier_BattleArenaLobby_EventScript_BodyRules": 1153,
  "BattleFrontier_BattleArenaLobby_EventScript_ExitRules": 1167,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,107,1,0,0,0,0,3,0,155,0,0,0,0,0,4,0,247,0,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,89,195,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,88,41,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,88,41,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,113,4,8,0,38,0,0,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,161,2,0,0,107,91,113,207,3,0,113,206,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,104,0,0,0,0,0,0,0,112,17,6,24,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,152,1,88,0,0,0,0,26,4,128,13,128,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,58,0,0,255,255,255,255,255,9,255,255,255,255,255,9,0,13,0,9,13,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,0,89,184,1,0,0,16,0,0,0,0,0,10,0,89,68,3,0,0,16,0,0,0,0,0,10,0,89,68,3,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,60,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,80,0,0,162,3,0,0,81,0,0,162,3,0,0,0,0,80,255,0,162,3,0,0,81,255,0,162,3,0,0,0,0,82,0,0,83,0,0,0,0,173,2,0,2,0,175,80,0,0,162,3,0,0,81,0,0,162,3,0,0,0,0,80,255,0,162,3,0,0,81,255,0,162,3,0,0,0,0,82,0,0,83,0,0,0,0,174,2,0,2,0,175,80,0,0,254,3,0,0,81,0,0,254,3,0,0,0,0,80,255,0,254,3,0,0,81,255,0,254,3,0,0,0,0,82,0,0,83,0,0,0,0,173,11,0,2,0,175,80,0,0,162,3,0,0,81,0,0,162,3,0,0,0,0,80,255,0,162,3,0,0,81,255,0,162,3,0,0,0,0,82,0,0,83,0,0,0,0,174,11,0,2,0,175,106,113,4,7,0,113,5,3,0,113,6,255,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,73,4,0,0,90,104,0,0,0,0,0,0,0,112,17,2,96,0,90,16,0,0,0,0,0,10,0,89,73,4,0,0,90,16,0,0,0,0,0,10,0,89,73,4,0,0,90,16,0,0,0,0,0,10,0,89,73,4,0,0,90,16,0,0,0,0,0,10,0,89,73,4,0,0,90,108,90] as const;

export const STATS = { ops: 260, bytes: 1169, labels: 47, unknownOps: 11, unresolvedSymbols: 55 } as const;
