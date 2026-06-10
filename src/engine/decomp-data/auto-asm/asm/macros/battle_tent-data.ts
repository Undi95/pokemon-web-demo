// AUTO-GENERATED from asm/macros/battle_tent.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_tent.inc
// Generated: 2026-06-10

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "verdanturftent_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","VERDANTURF_TENT_FUNC_INIT"]}, {op:"special",args:["CallVerdanturfTentFunction"]}] },
  { name: "verdanturftent_getprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","VERDANTURF_TENT_FUNC_GET_PRIZE"]}, {op:"special",args:["CallVerdanturfTentFunction"]}] },
  { name: "verdanturftent_setprize", args: ["unusedArg:req", "itemId:req"], body: [{op:"setvar",args:["VAR_0x8004","VERDANTURF_TENT_FUNC_SET_PRIZE"]}, {op:"setvar",args:["VAR_0x8005","\\unusedArg"]}, {op:"setvar",args:["VAR_0x8006","\\itemId"]}, {op:"special",args:["CallVerdanturfTentFunction"]}] },
  { name: "verdanturftent_setopponentgfx", args: [], body: [{op:"setvar",args:["VAR_0x8004","VERDANTURF_TENT_FUNC_SET_OPPONENT_GFX"]}, {op:"special",args:["CallVerdanturfTentFunction"]}] },
  { name: "battletent_getopponentintro", args: [], body: [{op:"setvar",args:["VAR_0x8004","VERDANTURF_TENT_FUNC_GET_OPPONENT_INTRO"]}, {op:"special",args:["CallVerdanturfTentFunction"]}] },
  { name: "verdanturftent_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","VERDANTURF_TENT_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallVerdanturfTentFunction"]}] },
  { name: "verdanturftent_setrandomprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","VERDANTURF_TENT_FUNC_SET_RANDOM_PRIZE"]}, {op:"special",args:["CallVerdanturfTentFunction"]}] },
  { name: "verdanturftent_giveprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","VERDANTURF_TENT_FUNC_GIVE_PRIZE"]}, {op:"special",args:["CallVerdanturfTentFunction"]}] },
  { name: "fallarbortent_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","FALLARBOR_TENT_FUNC_INIT"]}, {op:"special",args:["CallFallarborTentFunction"]}] },
  { name: "fallarbortent_getprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","FALLARBOR_TENT_FUNC_GET_PRIZE"]}, {op:"special",args:["CallFallarborTentFunction"]}] },
  { name: "fallarbortent_setprize", args: ["unusedArg:req", "itemId:req"], body: [{op:"setvar",args:["VAR_0x8004","FALLARBOR_TENT_FUNC_SET_PRIZE"]}, {op:"setvar",args:["VAR_0x8005","\\unusedArg"]}, {op:"setvar",args:["VAR_0x8006","\\itemId"]}, {op:"special",args:["CallFallarborTentFunction"]}] },
  { name: "fallarbortent_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","FALLARBOR_TENT_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallFallarborTentFunction"]}] },
  { name: "fallarbortent_setrandomprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","FALLARBOR_TENT_FUNC_SET_RANDOM_PRIZE"]}, {op:"special",args:["CallFallarborTentFunction"]}] },
  { name: "fallarbortent_giveprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","FALLARBOR_TENT_FUNC_GIVE_PRIZE"]}, {op:"special",args:["CallFallarborTentFunction"]}] },
  { name: "fallarbortent_getopponentname", args: [], body: [{op:"setvar",args:["VAR_0x8004","FALLARBOR_TENT_FUNC_GET_OPPONENT_NAME"]}, {op:"special",args:["CallFallarborTentFunction"]}] },
  { name: "slateporttent_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_INIT"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_getprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_GET_PRIZE"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_setprize", args: ["unusedArg:req", "itemId:req"], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_SET_PRIZE"]}, {op:"setvar",args:["VAR_0x8005","\\unusedArg"]}, {op:"setvar",args:["VAR_0x8006","\\itemId"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_setrandomprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_SET_RANDOM_PRIZE"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_giveprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_GIVE_PRIZE"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_rentmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_SELECT_RENT_MONS"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_swapmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_SWAP_RENT_MONS"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_generateopponentmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_GENERATE_OPPONENT_MONS"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
  { name: "slateporttent_generaterentalmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","SLATEPORT_TENT_FUNC_GENERATE_RENTAL_MONS"]}, {op:"special",args:["CallSlateportTentFunction"]}] },
] as const;
