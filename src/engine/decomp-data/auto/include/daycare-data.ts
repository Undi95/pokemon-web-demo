// AUTO-GENERATED from include/daycare.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/daycare.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CountPokemonInDaycare', ret: "u8", arity: 1, params: "struct DayCare *daycare" },
  { name: 'InitDaycareMailRecordMixing', ret: "void", arity: 2, params: "struct DayCare *daycare, struct RecordMixingDaycareMail *mixMail" },
  { name: 'StoreSelectedPokemonInDaycare', ret: "void", arity: 0, params: "void" },
  { name: 'TakePokemonFromDaycare', ret: "u16", arity: 0, params: "void" },
  { name: 'GetDaycareCost', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumLevelsGainedFromDaycare', ret: "u8", arity: 0, params: "void" },
  { name: 'TriggerPendingDaycareEgg', ret: "void", arity: 0, params: "void" },
  { name: 'RejectEggFromDayCare', ret: "void", arity: 0, params: "void" },
  { name: 'CreateEgg', ret: "void", arity: 3, params: "struct Pokemon *mon, u16 species, bool8 setHotSpringsLocation" },
  { name: 'GiveEggFromDaycare', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldEggHatch', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetSelectedMonNicknameAndSpecies', ret: "u16", arity: 0, params: "void" },
  { name: 'GetDaycareMonNicknames', ret: "void", arity: 0, params: "void" },
  { name: 'GetDaycareState', ret: "u8", arity: 0, params: "void" },
  { name: 'SetDaycareCompatibilityString', ret: "void", arity: 0, params: "void" },
  { name: 'NameHasGenderSymbol', ret: "bool8", arity: 2, params: "const u8 *name, u8 genderRatio" },
  { name: 'ShowDaycareLevelMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseSendDaycareMon', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/daycare.h',
] as const;
