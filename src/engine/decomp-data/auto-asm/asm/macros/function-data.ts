// AUTO-GENERATED from asm/macros/function.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/function.inc
// Generated: 2026-04-26

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "arm_func_start", args: ["name:req"], body: [{op:".align",args:["2","0"]}, {op:".global",args:["\\name"]}, {op:".arm",args:[]}, {op:".type",args:["\\name","%function"]}] },
  { name: "arm_func_end", args: ["name:req"], body: [{op:".size",args:["\\name",".-\\name"]}] },
  { name: "thumb_func_start", args: ["name:req"], body: [{op:".align",args:["2","0"]}, {op:".global",args:["\\name"]}, {op:".thumb",args:[]}, {op:".thumb_func",args:[]}, {op:".type",args:["\\name","%function"]}] },
  { name: "non_word_aligned_thumb_func_start", args: ["name:req"], body: [{op:".global",args:["\\name"]}, {op:".thumb",args:[]}, {op:".thumb_func",args:[]}, {op:".type",args:["\\name","%function"]}] },
  { name: "thumb_func_end", args: ["name:req"], body: [{op:".size",args:["\\name",".-\\name"]}] },
] as const;
