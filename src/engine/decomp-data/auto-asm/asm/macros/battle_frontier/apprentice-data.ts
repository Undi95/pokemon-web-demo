// AUTO-GENERATED from asm/macros/battle_frontier/apprentice.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/apprentice.inc
// Generated: 2026-06-10

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "apprentice_gavelvlmode", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_GAVE_LVLMODE"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_setlvlmode", args: ["lvlmode:req"], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SET_LVLMODE"]}, {op:"setorcopyvar",args:["VAR_0x8005","\\lvlmode"]}, {op:"addvar",args:["VAR_0x8005","1"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_answeredquestion", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_ANSWERED_QUESTION"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_menu", args: ["which:req"], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_MENU"]}, {op:"setvar",args:["VAR_0x8005","\\which"]}, {op:"special",args:["CallApprenticeFunction"]}, {op:"waitstate",args:[]}] },
  { name: "apprentice_shufflespecies", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SHUFFLE_SPECIES"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_randomizequestions", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_RANDOMIZE_QUESTIONS"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_msg", args: ["waitbuttonpress:req", "which:req"], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_PRINT_MSG"]}, {op:"setvar",args:["VAR_0x8005","\\waitbuttonpress"]}, {op:"setvar",args:["VAR_0x8006","\\which"]}, {op:"special",args:["CallApprenticeFunction"]}, {op:"waitstate",args:[]}] },
  { name: "apprentice_reset", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_RESET"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_shouldcheckgone", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_CHECK_GONE"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_getquestion", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_GET_QUESTION"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_getnumpartymons", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_GET_NUM_PARTY_MONS"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_setpartymon", args: ["slot:req"], body: [{op:"copyvar",args:["VAR_0x8006","\\slot"]}, {op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SET_PARTY_MON"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_initquestion", args: ["which:req"], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_INIT_QUESTION_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\which"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_freequestion", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_FREE_QUESTION_DATA"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_buff", args: ["stringvar:req", "tobuff:req"], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_BUFFER_STRING"]}, {op:".if",args:["\\stringvar == STR_VAR_1"]}, {op:"setvar",args:["VAR_0x8005","0"]}, {op:".elseif",args:["\\stringvar == STR_VAR_2"]}, {op:"setvar",args:["VAR_0x8005","1"]}, {op:".elseif",args:["\\stringvar == STR_VAR_3"]}, {op:"setvar",args:["VAR_0x8005","2"]}, {op:".else",args:[]}, {op:"setvar",args:["VAR_0x8005","\\stringvar"]}, {op:".endif",args:[]}, {op:".if",args:["\\tobuff >= VARS_START"]}, {op:"copyvar",args:["VAR_0x8006","\\tobuff"]}, {op:".else",args:[]}, {op:"setvar",args:["VAR_0x8006","\\tobuff"]}, {op:".endif",args:[]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_setmove", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SET_MOVE"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_setleadmon", args: ["monId:req"], body: [{op:"copyvar",args:["VAR_0x8005","\\monId"]}, {op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SET_LEAD_MON"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_openbag", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_OPEN_BAG"]}, {op:"special",args:["CallApprenticeFunction"]}, {op:"waitstate",args:[]}] },
  { name: "apprentice_trysetitem", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_TRY_SET_HELD_ITEM"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_save", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SAVE"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_setgfx", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SET_GFX"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_shouldleave", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SHOULD_LEAVE"]}, {op:"special",args:["CallApprenticeFunction"]}] },
  { name: "apprentice_shiftsaved", args: [], body: [{op:"setvar",args:["VAR_0x8004","APPRENTICE_FUNC_SHIFT_SAVED"]}, {op:"special",args:["CallApprenticeFunction"]}] },
] as const;
