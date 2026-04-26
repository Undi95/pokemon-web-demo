// AUTO-GENERATED from include/trade.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/trade.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetGameProgressForLinkTrade', ret: "s32", arity: 0, params: "void" },
  { name: 'CB2_StartCreateTradeMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_LinkTrade', ret: "void", arity: 0, params: "void" },
  { name: 'CanRegisterMonForTradingBoard', ret: "int", arity: 4, params: "struct RfuGameCompatibilityData player, u16 species2, u16 species, bool8 isModernFatefulEncounter" },
  { name: 'GetUnionRoomTradeMessageId', ret: "int", arity: 7, params: "struct RfuGameCompatibilityData player, struct RfuGameCompatibilityData partner, u16 playerSpecies2, u16 partnerSpecies, u8 requestedType, u16 playerSpecies, bool8 isModernFatefulEncounter" },
  { name: 'CanSpinTradeMon', ret: "int", arity: 2, params: "struct Pokemon *mon, u16 monIdx" },
  { name: 'InitTradeSequenceBgGpuRegs', ret: "void", arity: 0, params: "void" },
  { name: 'LinkTradeDrawWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadTradeAnimGfx', ret: "void", arity: 0, params: "void" },
  { name: 'DrawTextOnTradeWindow', ret: "void", arity: 3, params: "u8 windowId, const u8 *str, u8 speed" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_LinkTrade',
  'CB2_StartCreateTradeMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'link_rfu.h',
  'constants/trade.h',
] as const;
