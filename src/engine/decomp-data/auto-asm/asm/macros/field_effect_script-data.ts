// AUTO-GENERATED from asm/macros/field_effect_script.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/field_effect_script.inc
// Generated: 2026-04-26

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "field_eff_loadtiles", args: ["address:req"], body: [{op:".byte",args:["0"]}, {op:".4byte",args:["\\address"]}] },
  { name: "field_eff_loadfadedpal", args: ["address:req"], body: [{op:".byte",args:["1"]}, {op:".4byte",args:["\\address"]}] },
  { name: "field_eff_loadpal", args: ["address:req"], body: [{op:".byte",args:["2"]}, {op:".4byte",args:["\\address"]}] },
  { name: "field_eff_callnative", args: ["address:req"], body: [{op:".byte",args:["3"]}, {op:".4byte",args:["\\address"]}] },
  { name: "field_eff_end", args: [], body: [{op:".byte",args:["4"]}] },
  { name: "field_eff_loadgfx_callnative", args: ["tiles_address:req", "palette_address:req", "function_address:req"], body: [{op:".byte",args:["5"]}, {op:".4byte",args:["\\tiles_address"]}, {op:".4byte",args:["\\palette_address"]}, {op:".4byte",args:["\\function_address"]}] },
  { name: "field_eff_loadtiles_callnative", args: ["tiles_address:req", "function_address:req"], body: [{op:".byte",args:["6"]}, {op:".4byte",args:["\\tiles_address"]}, {op:".4byte",args:["\\function_address"]}] },
  { name: "field_eff_loadfadedpal_callnative", args: ["palette_address:req", "function_address:req"], body: [{op:".byte",args:["7"]}, {op:".4byte",args:["\\palette_address"]}, {op:".4byte",args:["\\function_address"]}] },
] as const;
