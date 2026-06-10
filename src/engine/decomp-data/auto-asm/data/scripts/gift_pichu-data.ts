// AUTO-GENERATED from data/scripts/gift_pichu.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/gift_pichu.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MysteryGiftScript_SurfPichu', isGlobal: true, instrIndex: 0 },
  { name: 'SurfPichu_GiveIfPossible', isGlobal: false, instrIndex: 3 },
  { name: 'SurfPichu_FullParty', isGlobal: false, instrIndex: 16 },
  { name: 'SurfPichu_GiveEgg', isGlobal: false, instrIndex: 23 },
  { name: 'SurfPichu_Slot1', isGlobal: false, instrIndex: 32 },
  { name: 'SurfPichu_Slot2', isGlobal: true, instrIndex: 34 },
  { name: 'SurfPichu_Slot3', isGlobal: false, instrIndex: 36 },
  { name: 'SurfPichu_Slot4', isGlobal: false, instrIndex: 38 },
  { name: 'SurfPichu_Slot5', isGlobal: false, instrIndex: 40 },
  { name: 'sText_MysteryGiftEgg', isGlobal: false, instrIndex: 42 },
  { name: 'sText_FullParty', isGlobal: false, instrIndex: 42 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=8
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"Nous avons un OEUF pour vous!\\p\""] },
  { kind: '.string', vals: ["\"Elevez-le avec amour et\\n\""] },
  { kind: '.string', vals: ["\"gentillesse.$\""] },
  { kind: '.string', vals: ["\"Oh, l'équipe est pleine.\\p\""] },
  { kind: '.string', vals: ["\"Revenez quand vous aurez rangé\\n\""] },
  { kind: '.string', vals: ["\"un POKéMON dans votre PC.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 42 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvaddress",args:["MysteryGiftScript_SurfPichu"]},
  {op:"vgoto_if_unset",args:["FLAG_MYSTERY_GIFT_DONE","SurfPichu_GiveIfPossible"]},
  {op:"returnram",args:[]},
  {op:"specialvar",args:["VAR_GIFT_PICHU_SLOT","CalculatePlayerPartyCount"]},
  {op:"vgoto_if_eq",args:["VAR_GIFT_PICHU_SLOT","PARTY_SIZE","SurfPichu_FullParty"]},
  {op:"setflag",args:["FLAG_MYSTERY_GIFT_DONE"]},
  {op:"vcall",args:["SurfPichu_GiveEgg"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftEgg"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"playfanfare",args:["MUS_OBTAIN_ITEM"]},
  {op:"waitfanfare",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vmessage",args:["sText_FullParty"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"giveegg",args:["SPECIES_PICHU"]},
  {op:"setmodernfatefulencounter",args:["VAR_GIFT_PICHU_SLOT"]},
  {op:"setmonmetlocation",args:["VAR_GIFT_PICHU_SLOT","METLOC_FATEFUL_ENCOUNTER"]},
  {op:"vgoto_if_eq",args:["VAR_GIFT_PICHU_SLOT",1,"SurfPichu_Slot1"]},
  {op:"vgoto_if_eq",args:["VAR_GIFT_PICHU_SLOT",2,"SurfPichu_Slot2"]},
  {op:"vgoto_if_eq",args:["VAR_GIFT_PICHU_SLOT",3,"SurfPichu_Slot3"]},
  {op:"vgoto_if_eq",args:["VAR_GIFT_PICHU_SLOT",4,"SurfPichu_Slot4"]},
  {op:"vgoto_if_eq",args:["VAR_GIFT_PICHU_SLOT",5,"SurfPichu_Slot5"]},
  {op:"return",args:[]},
  {op:"setmonmove",args:[1,2,"MOVE_SURF"]},
  {op:"return",args:[]},
  {op:"setmonmove",args:[2,2,"MOVE_SURF"]},
  {op:"return",args:[]},
  {op:"setmonmove",args:[3,2,"MOVE_SURF"]},
  {op:"return",args:[]},
  {op:"setmonmove",args:[4,2,"MOVE_SURF"]},
  {op:"return",args:[]},
  {op:"setmonmove",args:[5,2,"MOVE_SURF"]},
  {op:"return",args:[]},
] as const;
