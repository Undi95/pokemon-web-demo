// AUTO-GENERATED from data/scripts/gift_mystic_ticket.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/gift_mystic_ticket.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MysteryGiftScript_MysticTicket', isGlobal: true, instrIndex: 0 },
  { name: 'MysticTicket_NoBagSpace', isGlobal: false, instrIndex: 21 },
  { name: 'MysticTicket_Obtained', isGlobal: false, instrIndex: 26 },
  { name: 'sText_MysticTicketForYou', isGlobal: false, instrIndex: 31 },
  { name: 'sText_MysticTicketUseAtPort', isGlobal: false, instrIndex: 31 },
  { name: 'sText_MysticTicketThankYou', isGlobal: false, instrIndex: 31 },
  { name: 'sText_MysticTicketBagFull', isGlobal: false, instrIndex: 31 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=14
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"Vous devez être {PLAYER}.\\n\""] },
  { kind: '.string', vals: ["\"Il y a un ticket pour vous.$\""] },
  { kind: '.string', vals: ["\"Il peut être utilisé au port de\\n\""] },
  { kind: '.string', vals: ["\"NENUCRIQUE.\\p\""] },
  { kind: '.string', vals: ["\"Essayez-le pour voir de quoi \\n\""] },
  { kind: '.string', vals: ["\"il s'agit.$\""] },
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.$\""] },
  { kind: '.string', vals: ["\"Oh, je regrette, {PLAYER}. La POCHE\\n\""] },
  { kind: '.string', vals: ["\"OBJ. RARES du SAC est pleine.\\p\""] },
  { kind: '.string', vals: ["\"Faites de la place dans votre SAC\\n\""] },
  { kind: '.string', vals: ["\"et revenez me voir.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 31 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvaddress",args:["MysteryGiftScript_MysticTicket"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vgoto_if_set",args:["FLAG_RECEIVED_MYSTIC_TICKET","MysticTicket_Obtained"]},
  {op:"vgoto_if_set",args:["FLAG_CAUGHT_LUGIA","MysticTicket_Obtained"]},
  {op:"vgoto_if_set",args:["FLAG_CAUGHT_HO_OH","MysticTicket_Obtained"]},
  {op:"checkitem",args:["ITEM_MYSTIC_TICKET"]},
  {op:"vgoto_if_eq",args:["VAR_RESULT",1,"MysticTicket_Obtained"]},
  {op:"vmessage",args:["sText_MysticTicketForYou"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"checkitemspace",args:["ITEM_MYSTIC_TICKET"]},
  {op:"vgoto_if_eq",args:["VAR_RESULT",0,"MysticTicket_NoBagSpace"]},
  {op:"giveitem",args:["ITEM_MYSTIC_TICKET"]},
  {op:"setflag",args:["FLAG_ENABLE_SHIP_NAVEL_ROCK"]},
  {op:"setflag",args:["FLAG_RECEIVED_MYSTIC_TICKET"]},
  {op:"vmessage",args:["sText_MysticTicketUseAtPort"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"vmessage",args:["sText_MysticTicketBagFull"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"vmessage",args:["sText_MysticTicketThankYou"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
