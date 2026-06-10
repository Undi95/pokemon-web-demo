// AUTO-GENERATED from data/maps/MossdeepCity_StevensHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=104, bytes=578, labels=21, unknownOps=0, unresolvedSymbols=48

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MossdeepCity_StevensHouse_MapScripts": 0,
  "MossdeepCity_StevensHouse_OnLoad": 15,
  "MossdeepCity_StevensHouse_EventScript_HideStevensNote": 25,
  "MossdeepCity_StevensHouse_OnTransition": 35,
  "MossdeepCity_StevensHouse_EventScript_SetStevenPos": 58,
  "MossdeepCity_StevensHouse_OnFrame": 70,
  "MossdeepCity_StevensHouse_EventScript_StevenGivesDive": 78,
  "MossdeepCity_StevensHouse_Movement_StevenApproachPlayer": 253,
  "MossdeepCity_StevensHouse_Movement_StevenReturn": 261,
  "MossdeepCity_StevensHouse_EventScript_BeldumPokeball": 267,
  "MossdeepCity_StevensHouse_EventScript_LeaveBeldum": 304,
  "MossdeepCity_StevensHouse_EventScript_GiveBeldum": 314,
  "MossdeepCity_StevensHouse_EventScript_SendBeldumParty": 384,
  "MossdeepCity_StevensHouse_EventScript_SendBeldumPC": 435,
  "MossdeepCity_StevensHouse_EventScript_BeldumTransferredToPC": 481,
  "MossdeepCity_StevensHouse_EventScript_ReceivedBeldumFanfare": 492,
  "MossdeepCity_StevensHouse_EventScript_ReceivedBeldum": 525,
  "MossdeepCity_StevensHouse_EventScript_RockDisplay": 533,
  "MossdeepCity_StevensHouse_EventScript_Steven": 542,
  "MossdeepCity_StevensHouse_EventScript_Letter": 551,
  "MossdeepCity_StevensHouse_EventScript_DiveItemBall": 562,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,15,0,0,0,0,35,0,0,0,0,70,0,0,0,44,0,0,8,0,25,0,0,0,3,163,6,0,4,0,0,0,1,0,4,35,0,0,2,0,34,0,0,2,0,8,1,58,0,0,0,8,1,0,0,0,0,3,100,0,0,6,0,5,0,102,0,0,0,4,0,0,1,0,78,0,0,0,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,253,0,0,0,81,0,0,253,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,42,0,0,42,0,0,16,0,0,0,0,0,10,4,105,41,20,0,80,0,0,5,1,0,0,81,0,0,5,1,0,0,0,0,82,0,0,83,0,0,0,0,42,0,0,42,0,0,23,0,0,2,0,108,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,106,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,48,1,0,0,7,1,0,0,0,0,6,58,1,0,0,3,16,0,0,0,0,0,10,4,108,3,23,0,0,142,1,122,142,1,5,0,0,0,0,0,0,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,128,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,179,1,0,0,7,1,0,0,0,0,6,0,0,0,0,3,5,236,1,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,13,2,0,0,7,1,0,0,0,0,5,0,0,0,0,5,0,0,0,0,6,13,2,0,0,3,5,236,1,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,225,1,0,0,7,1,0,0,0,0,5,0,0,0,0,6,225,1,0,0,3,5,0,0,0,0,6,13,2,0,0,3,126,0,1,2,0,142,1,84,0,0,85,0,0,0,0,50,114,1,104,0,0,0,0,103,51,126,0,1,2,0,142,1,4,42,0,0,42,0,0,108,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,106,16,0,0,0,0,0,10,4,108,3,27,0,0,0,0,27,0,0,1,0,10,1,42,0,0,3] as const;

export const STATS = { ops: 104, bytes: 578, labels: 21, unknownOps: 0, unresolvedSymbols: 48 } as const;
