// AUTO-GENERATED from data/scripts/hall_of_fame.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/hall_of_fame.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EverGrandeCity_HallOfFame_EventScript_SetGameClearFlags', isGlobal: true, instrIndex: 0 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_ResetDefeatedEventLegendaries', isGlobal: true, instrIndex: 24 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_SetDesertUnderpassCommentReady', isGlobal: true, instrIndex: 30 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_ShowStevensHouseBeldum', isGlobal: true, instrIndex: 32 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_ReadyReceiveSSTicketEvent', isGlobal: true, instrIndex: 34 },
  { name: 'EverGrandeCity_HallOfFame_EventScript_ReadyDexUpgradeEvent', isGlobal: true, instrIndex: 38 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 40 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"special",args:["SetChampionSaveWarp"]},
  {op:"setflag",args:["FLAG_IS_CHAMPION"]},
  {op:"call",args:["EverGrandeCity_HallOfFame_EventScript_ResetDefeatedEventLegendaries"]},
  {op:"call_if_eq",args:["VAR_FOSSIL_MANIAC_STATE",0,"EverGrandeCity_HallOfFame_EventScript_SetDesertUnderpassCommentReady"]},
  {op:"clearflag",args:["FLAG_HIDE_LILYCOVE_MOTEL_GAME_DESIGNERS"]},
  {op:"call",args:["EverGrandeCity_HallOfFame_EventScript_ResetEliteFour"]},
  {op:"setflag",args:["FLAG_HIDE_SLATEPORT_CITY_STERNS_SHIPYARD_MR_BRINEY"]},
  {op:"clearflag",args:["FLAG_HIDE_SS_TIDAL_CORRIDOR_MR_BRINEY"]},
  {op:"clearflag",args:["FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_INVISIBLE_NINJA_BOY"]},
  {op:"setvar",args:["VAR_STEVENS_HOUSE_STATE",2]},
  {op:"setflag",args:["FLAG_HIDE_VICTORY_ROAD_ENTRANCE_WALLY"]},
  {op:"clearflag",args:["FLAG_HIDE_VICTORY_ROAD_EXIT_WALLY"]},
  {op:"clearflag",args:["FLAG_HIDE_SLATEPORT_CITY_HARBOR_SS_TIDAL"]},
  {op:"clearflag",args:["FLAG_HIDE_LILYCOVE_HARBOR_SSTIDAL"]},
  {op:"setflag",args:["FLAG_HIDE_SAFARI_ZONE_SOUTH_CONSTRUCTION_WORKERS"]},
  {op:"clearflag",args:["FLAG_HIDE_SAFARI_ZONE_SOUTH_EAST_EXPANSION"]},
  {op:"setflag",args:["FLAG_HIDE_LILYCOVE_CITY_RIVAL"]},
  {op:"special",args:["UpdateTrainerFanClubGameClear"]},
  {op:"call_if_unset",args:["FLAG_RECEIVED_SS_TICKET","EverGrandeCity_HallOfFame_EventScript_ReadyReceiveSSTicketEvent"]},
  {op:"call_if_unset",args:["FLAG_RECEIVED_BELDUM","EverGrandeCity_HallOfFame_EventScript_ShowStevensHouseBeldum"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_BEDROOM"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_BEDROOM"]},
  {op:"call_if_eq",args:["VAR_DEX_UPGRADE_JOHTO_STARTER_STATE",0,"EverGrandeCity_HallOfFame_EventScript_ReadyDexUpgradeEvent"]},
  {op:"return",args:[]},
  {op:"clearflag",args:["FLAG_DEFEATED_MEW"]},
  {op:"clearflag",args:["FLAG_DEFEATED_LATIAS_OR_LATIOS"]},
  {op:"clearflag",args:["FLAG_DEFEATED_DEOXYS"]},
  {op:"clearflag",args:["FLAG_DEFEATED_LUGIA"]},
  {op:"clearflag",args:["FLAG_DEFEATED_HO_OH"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_FOSSIL_MANIAC_STATE",1]},
  {op:"return",args:[]},
  {op:"clearflag",args:["FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_BELDUM_POKEBALL"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_LITTLEROOT_HOUSES_STATE_MAY",3]},
  {op:"setvar",args:["VAR_LITTLEROOT_HOUSES_STATE_BRENDAN",3]},
  {op:"clearflag",args:["FLAG_HIDE_PLAYERS_HOUSE_DAD"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_DEX_UPGRADE_JOHTO_STARTER_STATE",1]},
  {op:"return",args:[]},
] as const;
