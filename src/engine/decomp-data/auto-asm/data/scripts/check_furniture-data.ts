// AUTO-GENERATED from data/scripts/check_furniture.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/check_furniture.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EventScript_PictureBookShelf', isGlobal: true, instrIndex: 0 },
  { name: 'EventScript_BookShelf', isGlobal: true, instrIndex: 2 },
  { name: 'EventScript_PokemonCenterBookShelf', isGlobal: true, instrIndex: 4 },
  { name: 'EventScript_Vase', isGlobal: true, instrIndex: 6 },
  { name: 'EventScript_EmptyTrashCan', isGlobal: true, instrIndex: 8 },
  { name: 'EventScript_ShopShelf', isGlobal: true, instrIndex: 10 },
  { name: 'EventScript_Blueprint', isGlobal: true, instrIndex: 12 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["Text_PictureBookShelf","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Text_BookShelf","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Text_PokemonCenterBookShelf","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Text_Vase","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Text_EmptyTrashCan","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Text_ShopShelf","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Text_Blueprint","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
