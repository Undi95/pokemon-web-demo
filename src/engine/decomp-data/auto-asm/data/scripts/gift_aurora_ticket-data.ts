// AUTO-GENERATED from data/scripts/gift_aurora_ticket.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/gift_aurora_ticket.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MysteryGiftScript_AuroraTicket', isGlobal: true, instrIndex: 0 },
  { name: 'AuroraTicket_NoBagSpace', isGlobal: false, instrIndex: 20 },
  { name: 'AuroraTicket_Obtained', isGlobal: false, instrIndex: 25 },
  { name: 'sText_AuroraTicketForYou', isGlobal: false, instrIndex: 30 },
  { name: 'sText_AuroraTicketUseAtPort', isGlobal: false, instrIndex: 30 },
  { name: 'sText_AuroraTicketThankYou', isGlobal: false, instrIndex: 30 },
  { name: 'sText_AuroraTicketBagFull', isGlobal: false, instrIndex: 30 },
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
// 30 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvaddress",args:["MysteryGiftScript_AuroraTicket"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vgoto_if_set",args:["FLAG_RECEIVED_AURORA_TICKET","AuroraTicket_Obtained"]},
  {op:"vgoto_if_set",args:["FLAG_BATTLED_DEOXYS","AuroraTicket_Obtained"]},
  {op:"checkitem",args:["ITEM_AURORA_TICKET"]},
  {op:"vgoto_if_eq",args:["VAR_RESULT",1,"AuroraTicket_Obtained"]},
  {op:"vmessage",args:["sText_AuroraTicketForYou"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"checkitemspace",args:["ITEM_AURORA_TICKET"]},
  {op:"vgoto_if_eq",args:["VAR_RESULT",0,"AuroraTicket_NoBagSpace"]},
  {op:"giveitem",args:["ITEM_AURORA_TICKET"]},
  {op:"setflag",args:["FLAG_ENABLE_SHIP_BIRTH_ISLAND"]},
  {op:"setflag",args:["FLAG_RECEIVED_AURORA_TICKET"]},
  {op:"vmessage",args:["sText_AuroraTicketUseAtPort"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"vmessage",args:["sText_AuroraTicketBagFull"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"vmessage",args:["sText_AuroraTicketThankYou"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
