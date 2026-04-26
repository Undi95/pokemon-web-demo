// AUTO-GENERATED from data/scripts/gift_trainer.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/gift_trainer.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MysteryGiftScript_VisitingTrainer', isGlobal: true, instrIndex: 0 },
  { name: 'MysteryGiftScript_VisitingTrainerArrived', isGlobal: false, instrIndex: 10 },
  { name: 'sText_MysteryGiftVisitingTrainerInstructions', isGlobal: false, instrIndex: 17 },
  { name: 'sText_MysteryGiftVisitingTrainerArrived', isGlobal: false, instrIndex: 17 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=25
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"En tenant la CARTE MIRACLE,\\n\""] },
  { kind: '.string', vals: ["\"vous pouvez effectuer des\\p\""] },
  { kind: '.string', vals: ["\"sondages dans les BOUTIQUES\\n\""] },
  { kind: '.string', vals: ["\"POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Utilisez ces sondages pour inviter\\n\""] },
  { kind: '.string', vals: ["\"des DRESSEURS à ATALANOPOLIS.\\p\""] },
  { kind: '.string', vals: ["\"Laissez-moi vous donner un mot\\n\""] },
  { kind: '.string', vals: ["\"de passe secret:\\p\""] },
  { kind: '.string', vals: ["\"“DONNE-MOI\\n\""] },
  { kind: '.string', vals: ["\"UN COMBAT”\\p\""] },
  { kind: '.string', vals: ["\"Ecrivez ça sur un sondage et\\n\""] },
  { kind: '.string', vals: ["\"envoyez-le au SYSTEME DE\\p\""] },
  { kind: '.string', vals: ["\"COMMUNICATION SANS FIL.$\""] },
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"Un DRESSEUR arrivé à ATALANOPOLIS\\n\""] },
  { kind: '.string', vals: ["\"vous cherche.\\p\""] },
  { kind: '.string', vals: ["\"On espère que vous apprecierez\\n\""] },
  { kind: '.string', vals: ["\"le combat contre ce DRESSEUR.\\p\""] },
  { kind: '.string', vals: ["\"Vous pouvez inviter des DRESSEURS\\n\""] },
  { kind: '.string', vals: ["\"en entrant le mot de passe.\\p\""] },
  { kind: '.string', vals: ["\"Essayez de trouver des mots de\\n\""] },
  { kind: '.string', vals: ["\"passe qui pourraient fonctionner.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 17 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvaddress",args:["MysteryGiftScript_VisitingTrainer"]},
  {op:"special",args:["ValidateEReaderTrainer"]},
  {op:"vgoto_if_eq",args:["VAR_RESULT",0,"MysteryGiftScript_VisitingTrainerArrived"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftVisitingTrainerInstructions"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftVisitingTrainerArrived"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
