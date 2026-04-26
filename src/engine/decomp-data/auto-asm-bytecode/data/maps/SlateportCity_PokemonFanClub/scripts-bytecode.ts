// AUTO-GENERATED from data/maps/SlateportCity_PokemonFanClub/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=181, bytes=1018, labels=36, unknownOps=2, unresolvedSymbols=40

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_PokemonFanClub_MapScripts": 0,
  "SlateportCity_PokemonFanClub_EventScript_Chairman": 0,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanFirstAssessment": 87,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanTryAssessPokemon": 105,
  "SlateportCity_PokemonFanClub_EventScript_NoMoreScarves": 188,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanAssessLeadMon": 198,
  "SlateportCity_PokemonFanClub_EventScript_ReceivedAllScarves": 387,
  "SlateportCity_PokemonFanClub_EventScript_CountReceivedScarf": 392,
  "SlateportCity_PokemonFanClub_EventScript_NoHighConditions": 396,
  "SlateportCity_PokemonFanClub_EventScript_GiveRedScarf": 406,
  "SlateportCity_PokemonFanClub_EventScript_GiveBlueScarf": 454,
  "SlateportCity_PokemonFanClub_EventScript_GivePinkScarf": 502,
  "SlateportCity_PokemonFanClub_EventScript_GiveGreenScarf": 550,
  "SlateportCity_PokemonFanClub_EventScript_GiveYellowScarf": 598,
  "SlateportCity_PokemonFanClub_EventScript_NoRoomForScarf": 646,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonCool": 656,
  "SlateportCity_PokemonFanClub_EventScript_SetMonCool": 673,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonBeauty": 678,
  "SlateportCity_PokemonFanClub_EventScript_SetMonBeauty": 695,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonCute": 700,
  "SlateportCity_PokemonFanClub_EventScript_SetMonCute": 717,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonSmart": 722,
  "SlateportCity_PokemonFanClub_EventScript_SetMonSmart": 739,
  "SlateportCity_PokemonFanClub_EventScript_CheckMonTough": 744,
  "SlateportCity_PokemonFanClub_EventScript_SetMonTough": 761,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanNotEnteredContest": 766,
  "SlateportCity_PokemonFanClub_EventScript_ChairmanEnterContest": 788,
  "SlateportCity_PokemonFanClub_EventScript_MeetChairman": 798,
  "SlateportCity_PokemonFanClub_EventScript_SootheBellWoman": 810,
  "SlateportCity_PokemonFanClub_EventScript_GiveSootheBell": 847,
  "SlateportCity_PokemonFanClub_EventScript_ReceivedSootheBell": 933,
  "SlateportCity_PokemonFanClub_EventScript_Man": 943,
  "SlateportCity_PokemonFanClub_EventScript_Twin": 952,
  "SlateportCity_PokemonFanClub_EventScript_Skitty": 961,
  "SlateportCity_PokemonFanClub_EventScript_Zigzagoon": 980,
  "SlateportCity_PokemonFanClub_EventScript_Azumarill": 999,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,85,1,7,0,254,2,0,0,44,86,1,8,0,30,3,0,0,26,0,128,183,64,35,0,128,0,0,34,0,128,0,0,35,87,0,0,0,34,87,0,0,0,35,0,128,1,0,34,0,128,1,0,35,105,0,0,0,34,105,0,0,0,35,0,128,2,0,34,0,128,2,0,35,188,0,0,0,34,188,0,0,0,109,90,113,183,1,0,16,0,0,0,0,0,10,0,89,198,0,0,0,90,113,0,0,0,44,204,0,8,1,136,1,0,0,44,203,0,8,1,136,1,0,0,44,202,0,8,1,136,1,0,0,44,201,0,8,1,136,1,0,0,44,200,0,8,1,136,1,0,0,35,0,0,5,0,34,0,0,5,0,35,183,64,2,0,34,183,64,2,0,16,0,0,0,0,0,10,0,89,198,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,0,0,0,44,204,0,8,0,232,2,0,0,44,203,0,8,0,210,2,0,0,44,202,0,8,0,188,2,0,0,44,201,0,8,0,166,2,0,0,44,200,0,8,0,144,2,0,0,127,0,1,2,0,26,0,128,0,0,35,0,128,0,0,34,0,128,0,0,35,140,1,0,0,34,140,1,0,0,35,0,128,1,0,34,0,128,1,0,35,150,1,0,0,34,150,1,0,0,35,0,128,2,0,34,0,128,2,0,35,198,1,0,0,34,198,1,0,0,35,0,128,3,0,34,0,128,3,0,35,246,1,0,0,34,246,1,0,0,35,0,128,4,0,34,0,128,4,0,35,38,2,0,0,34,38,2,0,0,35,0,128,5,0,34,0,128,5,0,35,86,2,0,0,34,86,2,0,0,109,90,113,183,2,0,15,115,0,1,15,16,0,0,0,0,0,10,0,109,90,71,254,0,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,200,0,27,0,128,254,0,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,71,255,0,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,201,0,27,0,128,255,0,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,71,0,1,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,202,0,27,0,128,0,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,71,1,1,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,203,0,27,0,128,1,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,71,2,1,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,204,0,27,0,128,2,1,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,15,113,0,1,0,15,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,15,113,0,2,0,15,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,15,113,0,3,0,15,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,15,113,0,4,0,15,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,15,113,0,5,0,15,44,86,1,7,1,20,3,0,0,16,0,0,0,0,0,10,0,42,86,1,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,42,86,1,15,107,91,44,22,1,7,1,165,3,0,0,16,0,0,0,0,0,10,0,39,13,128,0,0,0,35,13,128,4,0,34,13,128,4,0,109,90,9,21,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,27,0,128,184,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,22,1,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,49,162,59,1,0,0,16,0,0,0,0,0,10,0,198,109,90,107,91,49,162,32,1,0,0,16,0,0,0,0,0,10,0,198,109,90,107,91,49,162,184,0,0,0,16,0,0,0,0,0,10,0,198,109,90] as const;

export const STATS = { ops: 181, bytes: 1018, labels: 36, unknownOps: 2, unresolvedSymbols: 40 } as const;
