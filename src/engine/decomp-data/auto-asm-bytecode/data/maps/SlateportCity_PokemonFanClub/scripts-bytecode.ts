// AUTO-GENERATED from data/maps/SlateportCity_PokemonFanClub/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=181, bytes=815, labels=36, unknownOps=5, unresolvedSymbols=39

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_PokemonFanClub_MapScripts": 0,
  "SlateportCity_PokemonFanClub_EventScript_Chairman": 0,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanFirstAssessment": 22,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanTryAssessPokemon": 40,
  "SlateportCity_PokemonFanClub_EventScript_NoMoreScarves": 123,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanAssessLeadMon": 133,
  "SlateportCity_PokemonFanClub_EventScript_ReceivedAllScarves": 197,
  "SlateportCity_PokemonFanClub_EventScript_CountReceivedScarf": 201,
  "SlateportCity_PokemonFanClub_EventScript_NoHighConditions": 204,
  "SlateportCity_PokemonFanClub_EventScript_GiveRedScarf": 214,
  "SlateportCity_PokemonFanClub_EventScript_GiveBlueScarf": 262,
  "SlateportCity_PokemonFanClub_EventScript_GivePinkScarf": 310,
  "SlateportCity_PokemonFanClub_EventScript_GiveGreenScarf": 358,
  "SlateportCity_PokemonFanClub_EventScript_GiveYellowScarf": 406,
  "SlateportCity_PokemonFanClub_EventScript_NoRoomForScarf": 454,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonCool": 464,
  "SlateportCity_PokemonFanClub_EventScript_SetMonCool": 480,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonBeauty": 484,
  "SlateportCity_PokemonFanClub_EventScript_SetMonBeauty": 500,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonCute": 504,
  "SlateportCity_PokemonFanClub_EventScript_SetMonCute": 520,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonSmart": 524,
  "SlateportCity_PokemonFanClub_EventScript_SetMonSmart": 540,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonTough": 544,
  "SlateportCity_PokemonFanClub_EventScript_SetMonTough": 560,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanNotEnteredContest": 564,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanEnterContest": 586,
  "SlateportCity_PokemonFanClub_EventScript_MeetChairman": 596,
  "SlateportCity_PokemonFanClub_EventScript_SootheBellWoman": 607,
  "SlateportCity_PokemonFanClub_EventScript_GiveSootheBell": 644,
  "SlateportCity_PokemonFanClub_EventScript_ReceivedSootheBell": 730,
  "SlateportCity_PokemonFanClub_EventScript_Man": 740,
  "SlateportCity_PokemonFanClub_EventScript_Twin": 749,
  "SlateportCity_PokemonFanClub_EventScript_Skitty": 758,
  "SlateportCity_PokemonFanClub_EventScript_Zigzagoon": 777,
  "SlateportCity_PokemonFanClub_EventScript_Azumarill": 796,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,85,1,7,0,52,2,0,0,44,86,1,8,0,84,2,0,0,109,90,113,183,1,0,16,0,0,0,0,0,10,0,89,133,0,0,0,90,113,0,0,0,44,204,0,8,1,201,0,0,0,44,203,0,8,1,201,0,0,0,44,202,0,8,1,201,0,0,0,44,201,0,8,1,201,0,0,0,44,200,0,8,1,201,0,0,0,35,0,0,5,0,34,0,0,5,0,35,183,64,2,0,34,183,64,2,0,16,0,0,0,0,0,10,0,89,133,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,0,0,0,44,204,0,8,0,32,2,0,0,44,203,0,8,0,12,2,0,0,44,202,0,8,0,248,1,0,0,44,201,0,8,0,228,1,0,0,44,200,0,8,0,208,1,0,0,127,0,1,2,0,109,90,113,183,2,0,115,0,1,16,0,0,0,0,0,10,0,109,90,71,254,0,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,200,0,27,0,128,254,0,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,71,255,0,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,201,0,27,0,128,255,0,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,71,0,1,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,202,0,27,0,128,0,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,71,1,1,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,203,0,27,0,128,1,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,71,2,1,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,204,0,27,0,128,2,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,113,0,1,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,113,0,2,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,113,0,3,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,113,0,4,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,113,0,5,0,44,86,1,7,1,74,2,0,0,16,0,0,0,0,0,10,0,42,86,1,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,42,86,1,107,91,44,22,1,7,1,218,2,0,0,16,0,0,0,0,0,10,0,39,13,128,0,0,0,35,13,128,4,0,34,13,128,4,0,109,90,9,21,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,27,0,128,184,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,22,1,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,49,162,59,1,0,0,16,0,0,0,0,0,10,0,198,109,90,107,91,49,162,32,1,0,0,16,0,0,0,0,0,10,0,198,109,90,107,91,49,162,184,0,0,0,16,0,0,0,0,0,10,0,198,109,90] as const;

export const STATS = { ops: 181, bytes: 815, labels: 36, unknownOps: 5, unresolvedSymbols: 39 } as const;
