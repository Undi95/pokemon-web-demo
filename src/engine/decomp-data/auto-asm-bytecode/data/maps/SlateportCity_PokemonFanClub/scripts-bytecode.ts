// AUTO-GENERATED from data/maps/SlateportCity_PokemonFanClub/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=181, bytes=1305, labels=36, unknownOps=0, unresolvedSymbols=35

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_PokemonFanClub_MapScripts": 0,
  "SlateportCity_PokemonFanClub_EventScript_Chairman": 0,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanFirstAssessment": 123,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanTryAssessPokemon": 142,
  "SlateportCity_PokemonFanClub_EventScript_NoMoreScarves": 250,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanAssessLeadMon": 260,
  "SlateportCity_PokemonFanClub_EventScript_ReceivedAllScarves": 522,
  "SlateportCity_PokemonFanClub_EventScript_CountReceivedScarf": 528,
  "SlateportCity_PokemonFanClub_EventScript_NoHighConditions": 534,
  "SlateportCity_PokemonFanClub_EventScript_GiveRedScarf": 544,
  "SlateportCity_PokemonFanClub_EventScript_GiveBlueScarf": 604,
  "SlateportCity_PokemonFanClub_EventScript_GivePinkScarf": 664,
  "SlateportCity_PokemonFanClub_EventScript_GiveGreenScarf": 724,
  "SlateportCity_PokemonFanClub_EventScript_GiveYellowScarf": 784,
  "SlateportCity_PokemonFanClub_EventScript_NoRoomForScarf": 844,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonCool": 854,
  "SlateportCity_PokemonFanClub_EventScript_SetMonCool": 883,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonBeauty": 889,
  "SlateportCity_PokemonFanClub_EventScript_SetMonBeauty": 918,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonCute": 924,
  "SlateportCity_PokemonFanClub_EventScript_SetMonCute": 953,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonSmart": 959,
  "SlateportCity_PokemonFanClub_EventScript_SetMonSmart": 988,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonTough": 994,
  "SlateportCity_PokemonFanClub_EventScript_SetMonTough": 1023,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanNotEnteredContest": 1029,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanEnterContest": 1051,
  "SlateportCity_PokemonFanClub_EventScript_MeetChairman": 1061,
  "SlateportCity_PokemonFanClub_EventScript_SootheBellWoman": 1073,
  "SlateportCity_PokemonFanClub_EventScript_GiveSootheBell": 1122,
  "SlateportCity_PokemonFanClub_EventScript_ReceivedSootheBell": 1220,
  "SlateportCity_PokemonFanClub_EventScript_Man": 1230,
  "SlateportCity_PokemonFanClub_EventScript_Twin": 1239,
  "SlateportCity_PokemonFanClub_EventScript_Skitty": 1248,
  "SlateportCity_PokemonFanClub_EventScript_Zigzagoon": 1267,
  "SlateportCity_PokemonFanClub_EventScript_Azumarill": 1286,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,85,1,7,0,5,4,0,0,44,86,1,8,0,37,4,0,0,26,0,128,183,64,35,0,128,0,0,34,0,128,0,0,35,123,0,0,0,34,123,0,0,0,7,1,0,0,0,0,7,1,123,0,0,0,35,0,128,1,0,34,0,128,1,0,35,142,0,0,0,34,142,0,0,0,7,1,0,0,0,0,7,1,142,0,0,0,35,0,128,2,0,34,0,128,2,0,35,250,0,0,0,34,250,0,0,0,7,1,0,0,0,0,7,1,250,0,0,0,109,3,23,183,64,1,0,16,0,0,0,0,0,10,4,6,4,1,0,0,3,23,0,0,0,0,44,204,0,8,1,16,2,0,0,44,203,0,8,1,16,2,0,0,44,202,0,8,1,16,2,0,0,44,201,0,8,1,16,2,0,0,44,200,0,8,1,16,2,0,0,35,0,0,5,0,34,0,0,5,0,8,1,10,2,0,0,8,1,0,0,0,0,35,183,64,2,0,34,183,64,2,0,7,1,250,0,0,0,7,1,183,64,0,0,16,0,0,0,0,0,10,4,6,4,1,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,23,0,0,0,0,44,204,0,8,0,226,3,0,0,44,203,0,8,0,191,3,0,0,44,202,0,8,0,156,3,0,0,44,201,0,8,0,121,3,0,0,44,200,0,8,0,86,3,0,0,127,0,1,2,0,26,0,128,0,0,35,0,128,0,0,34,0,128,0,0,35,22,2,0,0,34,22,2,0,0,7,1,0,0,0,0,7,1,22,2,0,0,35,0,128,1,0,34,0,128,1,0,35,32,2,0,0,34,32,2,0,0,7,1,0,0,0,0,7,1,32,2,0,0,35,0,128,2,0,34,0,128,2,0,35,92,2,0,0,34,92,2,0,0,7,1,0,0,0,0,7,1,92,2,0,0,35,0,128,3,0,34,0,128,3,0,35,152,2,0,0,34,152,2,0,0,7,1,0,0,0,0,7,1,152,2,0,0,35,0,128,4,0,34,0,128,4,0,35,212,2,0,0,34,212,2,0,0,7,1,0,0,0,0,7,1,212,2,0,0,35,0,128,5,0,34,0,128,5,0,35,16,3,0,0,34,16,3,0,0,7,1,0,0,0,0,7,1,16,3,0,0,109,3,23,183,64,2,0,4,24,0,0,1,0,4,16,0,0,0,0,0,10,4,109,3,71,254,0,1,0,35,13,128,0,0,34,13,128,0,0,7,1,76,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,200,0,27,0,128,254,0,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,3,71,255,0,1,0,35,13,128,0,0,34,13,128,0,0,7,1,76,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,201,0,27,0,128,255,0,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,3,71,0,1,1,0,35,13,128,0,0,34,13,128,0,0,7,1,76,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,202,0,27,0,128,0,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,3,71,1,1,1,0,35,13,128,0,0,34,13,128,0,0,7,1,76,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,203,0,27,0,128,1,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,3,71,2,1,1,0,35,13,128,0,0,34,13,128,0,0,7,1,76,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,204,0,27,0,128,2,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,115,3,0,0,8,1,13,128,0,0,4,23,0,0,1,0,4,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,150,3,0,0,8,1,13,128,0,0,4,23,0,0,2,0,4,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,185,3,0,0,8,1,13,128,0,0,4,23,0,0,3,0,4,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,220,3,0,0,8,1,13,128,0,0,4,23,0,0,4,0,4,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,255,3,0,0,8,1,13,128,0,0,4,23,0,0,5,0,4,44,86,1,7,1,27,4,0,0,16,0,0,0,0,0,10,4,42,86,1,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,42,86,1,4,107,91,44,22,1,7,1,196,4,0,0,16,0,0,0,0,0,10,4,39,13,128,0,0,58,35,13,128,4,0,34,13,128,4,0,7,4,98,4,0,0,7,4,13,128,0,0,109,3,48,21,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,27,0,128,184,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,22,1,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,91,49,162,59,1,0,0,16,0,0,0,0,0,10,4,198,109,3,107,91,49,162,32,1,0,0,16,0,0,0,0,0,10,4,198,109,3,107,91,49,162,184,0,0,0,16,0,0,0,0,0,10,4,198,109,3] as const;

export const STATS = { ops: 181, bytes: 1305, labels: 36, unknownOps: 0, unresolvedSymbols: 35 } as const;
