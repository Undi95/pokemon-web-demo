// AUTO-GENERATED from include/field_specials.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_specials.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetLeadMonIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'IsDestinationBoxFull', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetPCBoxToSendMon', ret: "u16", arity: 0, params: "void" },
  { name: 'InMultiPartnerRoom', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateTrainerFansAfterLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'IncrementBirthIslandRockStepCount', ret: "void", arity: 0, params: "void" },
  { name: 'AbnormalWeatherHasExpired', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldDoBrailleRegicePuzzle', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldDoWallyCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDoScottFortreeCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDoScottBattleFrontierCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDoRoxanneCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDoRivalRayquazaCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'CountSSTidalStep', ret: "bool32", arity: 1, params: "u16 delta" },
  { name: 'GetSSTidalLocation', ret: "u8", arity: 4, params: "s8 *mapGroup, s8 *mapNum, s16 *x, s16 *y" },
  { name: 'ShowScrollableMultichoice', ret: "void", arity: 0, params: "void" },
  { name: 'FrontierGamblerSetWonOrLost', ret: "void", arity: 1, params: "bool8 won" },
  { name: 'TryGainNewFanFromCounter', ret: "u8", arity: 1, params: "u8 incrementId" },
  { name: 'InPokemonCenter', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetShoalItemFlag', ret: "void", arity: 1, params: "u16 unused" },
  { name: 'UpdateFrontierManiac', ret: "void", arity: 1, params: "u16 daysSince" },
  { name: 'UpdateFrontierGambler', ret: "void", arity: 1, params: "u16 daysSince" },
  { name: 'ResetCyclingRoadChallengeData', ret: "void", arity: 0, params: "void" },
  { name: 'UsedPokemonCenterWarp', ret: "bool8", arity: 0, params: "void" },
  { name: 'ResetFanClub', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldShowBoxWasFullMessage', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetPCBoxToSendMon', ret: "void", arity: 1, params: "u8 boxId" },
] as const;
