// AUTO-GENERATED from data/maps/SlateportCity_PokemonFanClub/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=181, bytes=1294, labels=36, unknownOps=0, unresolvedSymbols=38

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_PokemonFanClub_MapScripts": 0,
  "SlateportCity_PokemonFanClub_EventScript_Chairman": 0,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanFirstAssessment": 123,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanTryAssessPokemon": 141,
  "SlateportCity_PokemonFanClub_EventScript_NoMoreScarves": 248,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanAssessLeadMon": 258,
  "SlateportCity_PokemonFanClub_EventScript_ReceivedAllScarves": 519,
  "SlateportCity_PokemonFanClub_EventScript_CountReceivedScarf": 524,
  "SlateportCity_PokemonFanClub_EventScript_NoHighConditions": 528,
  "SlateportCity_PokemonFanClub_EventScript_GiveRedScarf": 538,
  "SlateportCity_PokemonFanClub_EventScript_GiveBlueScarf": 598,
  "SlateportCity_PokemonFanClub_EventScript_GivePinkScarf": 658,
  "SlateportCity_PokemonFanClub_EventScript_GiveGreenScarf": 718,
  "SlateportCity_PokemonFanClub_EventScript_GiveYellowScarf": 778,
  "SlateportCity_PokemonFanClub_EventScript_NoRoomForScarf": 838,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonCool": 848,
  "SlateportCity_PokemonFanClub_EventScript_SetMonCool": 877,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonBeauty": 882,
  "SlateportCity_PokemonFanClub_EventScript_SetMonBeauty": 911,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonCute": 916,
  "SlateportCity_PokemonFanClub_EventScript_SetMonCute": 945,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonSmart": 950,
  "SlateportCity_PokemonFanClub_EventScript_SetMonSmart": 979,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonTough": 984,
  "SlateportCity_PokemonFanClub_EventScript_SetMonTough": 1013,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanNotEnteredContest": 1018,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanEnterContest": 1040,
  "SlateportCity_PokemonFanClub_EventScript_MeetChairman": 1050,
  "SlateportCity_PokemonFanClub_EventScript_SootheBellWoman": 1062,
  "SlateportCity_PokemonFanClub_EventScript_GiveSootheBell": 1111,
  "SlateportCity_PokemonFanClub_EventScript_ReceivedSootheBell": 1209,
  "SlateportCity_PokemonFanClub_EventScript_Man": 1219,
  "SlateportCity_PokemonFanClub_EventScript_Twin": 1228,
  "SlateportCity_PokemonFanClub_EventScript_Skitty": 1237,
  "SlateportCity_PokemonFanClub_EventScript_Zigzagoon": 1256,
  "SlateportCity_PokemonFanClub_EventScript_Azumarill": 1275,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,85,1,7,0,250,3,0,0,44,86,1,8,0,26,4,0,0,26,0,128,183,64,35,0,128,0,0,34,0,128,0,0,35,123,0,0,0,34,123,0,0,0,7,1,0,0,0,0,7,1,123,0,0,0,35,0,128,1,0,34,0,128,1,0,35,141,0,0,0,34,141,0,0,0,7,1,0,0,0,0,7,1,141,0,0,0,35,0,128,2,0,34,0,128,2,0,35,248,0,0,0,34,248,0,0,0,7,1,0,0,0,0,7,1,248,0,0,0,109,90,113,183,1,0,16,0,0,0,0,0,10,4,89,2,1,0,0,90,113,0,0,0,44,204,0,8,1,12,2,0,0,44,203,0,8,1,12,2,0,0,44,202,0,8,1,12,2,0,0,44,201,0,8,1,12,2,0,0,44,200,0,8,1,12,2,0,0,35,0,0,5,0,34,0,0,5,0,8,1,7,2,0,0,8,1,0,0,0,0,35,183,64,2,0,34,183,64,2,0,7,1,248,0,0,0,7,1,183,64,0,0,16,0,0,0,0,0,10,4,89,2,1,0,0,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,113,0,0,0,44,204,0,8,0,216,3,0,0,44,203,0,8,0,182,3,0,0,44,202,0,8,0,148,3,0,0,44,201,0,8,0,114,3,0,0,44,200,0,8,0,80,3,0,0,127,0,1,2,0,26,0,128,0,0,35,0,128,0,0,34,0,128,0,0,35,16,2,0,0,34,16,2,0,0,7,1,0,0,0,0,7,1,16,2,0,0,35,0,128,1,0,34,0,128,1,0,35,26,2,0,0,34,26,2,0,0,7,1,0,0,0,0,7,1,26,2,0,0,35,0,128,2,0,34,0,128,2,0,35,86,2,0,0,34,86,2,0,0,7,1,0,0,0,0,7,1,86,2,0,0,35,0,128,3,0,34,0,128,3,0,35,146,2,0,0,34,146,2,0,0,7,1,0,0,0,0,7,1,146,2,0,0,35,0,128,4,0,34,0,128,4,0,35,206,2,0,0,34,206,2,0,0,7,1,0,0,0,0,7,1,206,2,0,0,35,0,128,5,0,34,0,128,5,0,35,10,3,0,0,34,10,3,0,0,7,1,0,0,0,0,7,1,10,3,0,0,109,90,113,183,2,0,15,115,0,1,15,16,0,0,0,0,0,10,4,109,90,71,254,0,1,0,35,13,128,0,0,34,13,128,0,0,7,1,70,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,200,0,27,0,128,254,0,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,90,71,255,0,1,0,35,13,128,0,0,34,13,128,0,0,7,1,70,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,201,0,27,0,128,255,0,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,90,71,0,1,1,0,35,13,128,0,0,34,13,128,0,0,7,1,70,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,202,0,27,0,128,0,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,90,71,1,1,1,0,35,13,128,0,0,34,13,128,0,0,7,1,70,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,203,0,27,0,128,1,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,90,71,2,1,1,0,35,13,128,0,0,34,13,128,0,0,7,1,70,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,204,0,27,0,128,2,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,109,3,0,0,8,1,13,128,0,0,15,113,0,1,0,15,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,143,3,0,0,8,1,13,128,0,0,15,113,0,2,0,15,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,177,3,0,0,8,1,13,128,0,0,15,113,0,3,0,15,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,211,3,0,0,8,1,13,128,0,0,15,113,0,4,0,15,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,245,3,0,0,8,1,13,128,0,0,15,113,0,5,0,15,44,86,1,7,1,16,4,0,0,16,0,0,0,0,0,10,4,42,86,1,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,42,86,1,15,107,91,44,22,1,7,1,185,4,0,0,16,0,0,0,0,0,10,4,39,13,128,0,0,0,35,13,128,4,0,34,13,128,4,0,7,4,87,4,0,0,7,4,13,128,0,0,109,90,9,21,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,27,0,128,184,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,22,1,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,91,49,162,59,1,0,0,16,0,0,0,0,0,10,4,198,109,90,107,91,49,162,32,1,0,0,16,0,0,0,0,0,10,4,198,109,90,107,91,49,162,184,0,0,0,16,0,0,0,0,0,10,4,198,109,90] as const;

export const STATS = { ops: 181, bytes: 1294, labels: 36, unknownOps: 0, unresolvedSymbols: 38 } as const;
