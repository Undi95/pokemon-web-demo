// AUTO-GENERATED from data/maps/FallarborTown_MoveRelearnersHouse/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FallarborTown_MoveRelearnersHouse/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FallarborTown_MoveRelearnersHouse_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FallarborTown_MoveRelearnersHouse_EventScript_MoveRelearner', isGlobal: true, instrIndex: 0 },
  { name: 'FallarborTown_MoveRelearnersHouse_EventScript_AskTeachMove', isGlobal: true, instrIndex: 8 },
  { name: 'FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon', isGlobal: true, instrIndex: 15 },
  { name: 'FallarborTown_MoveRelearnersHouse_EventScript_ChooseMove', isGlobal: true, instrIndex: 23 },
  { name: 'FallarborTown_MoveRelearnersHouse_EventScript_NoMoveToTeachMon', isGlobal: true, instrIndex: 30 },
  { name: 'FallarborTown_MoveRelearnersHouse_EventScript_CantTeachEgg', isGlobal: true, instrIndex: 33 },
  { name: 'FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale', isGlobal: true, instrIndex: 36 },
  { name: 'FallarborTown_MoveRelearnersHouse_Text_ImTheMoveTutor', isGlobal: false, instrIndex: 39 },
  { name: 'FallarborTown_MoveRelearnersHouse_Text_ThatsAHeartScaleWantMeToTeachMove', isGlobal: false, instrIndex: 39 },
  { name: 'FallarborTown_MoveRelearnersHouse_Text_TutorWhichMon', isGlobal: false, instrIndex: 39 },
  { name: 'FallarborTown_MoveRelearnersHouse_Text_TeachWhichMove', isGlobal: false, instrIndex: 39 },
  { name: 'FallarborTown_MoveRelearnersHouse_Text_DontHaveMoveToTeachPokemon', isGlobal: false, instrIndex: 39 },
  { name: 'FallarborTown_MoveRelearnersHouse_Text_HandedOverHeartScale', isGlobal: false, instrIndex: 39 },
  { name: 'FallarborTown_MoveRelearnersHouse_Text_ComeBackWithHeartScale', isGlobal: false, instrIndex: 39 },
  { name: 'FallarborTown_MoveRelearnersHouse_Text_CantTeachEgg', isGlobal: false, instrIndex: 39 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=25
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je suis le MAITRE DES CAPACITES.\\p\""] },
  { kind: '.string', vals: ["\"Je connais absolument toutes les\\n\""] },
  { kind: '.string', vals: ["\"attaques que les POKéMON peuvent\\l\""] },
  { kind: '.string', vals: ["\"apprendre. Et je peux enseigner ces\\l\""] },
  { kind: '.string', vals: ["\"attaques à d'autres POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Je peux enseigner une attaque à l'un de\\n\""] },
  { kind: '.string', vals: ["\"tes POKéMON, si tu veux.\\p\""] },
  { kind: '.string', vals: ["\"Je peux le faire en échange d'une\\n\""] },
  { kind: '.string', vals: ["\"ECAILLECOEUR. Je les collectionne.$\""] },
  { kind: '.string', vals: ["\"Oh! Génial! C'est une ECAILLECOEUR\\n\""] },
  { kind: '.string', vals: ["\"d'une belle taille!\\p\""] },
  { kind: '.string', vals: ["\"Tu veux que j'enseigne une attaque\\n\""] },
  { kind: '.string', vals: ["\"à un de tes POKéMON?$\""] },
  { kind: '.string', vals: ["\"A quel POKéMON dois-je l'enseigner?$\""] },
  { kind: '.string', vals: ["\"Quelle attaque dois-je enseigner?$\""] },
  { kind: '.string', vals: ["\"Désolé…\\p\""] },
  { kind: '.string', vals: ["\"Apparemment, il n'y a aucune attaque\\n\""] },
  { kind: '.string', vals: ["\"que je puisse apprendre à ce POKéMON.$\""] },
  { kind: '.string', vals: ["\"{PLAYER} donne une ECAILLECOEUR\\n\""] },
  { kind: '.string', vals: ["\"en échange.$\""] },
  { kind: '.string', vals: ["\"Si tu veux que j'enseigne une attaque\\n\""] },
  { kind: '.string', vals: ["\"à ton POKéMON, reviens avec\\l\""] },
  { kind: '.string', vals: ["\"une ECAILLECOEUR.$\""] },
  { kind: '.string', vals: ["\"Quoi? Mais je ne peux pas apprendre\\n\""] },
  { kind: '.string', vals: ["\"une attaque à un OEUF.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 39 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_MOVE_RELEARNER","Common_Movement_FacePlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"goto_if_set",args:["FLAG_TEMP_1","FallarborTown_MoveRelearnersHouse_EventScript_AskTeachMove"]},
  {op:"msgbox",args:["FallarborTown_MoveRelearnersHouse_Text_ImTheMoveTutor","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_TEMP_1"]},
  {op:"goto",args:["FallarborTown_MoveRelearnersHouse_EventScript_AskTeachMove"]},
  {op:"end",args:[]},
  {op:"checkitem",args:["ITEM_HEART_SCALE"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale"]},
  {op:"msgbox",args:["FallarborTown_MoveRelearnersHouse_Text_ThatsAHeartScaleWantMeToTeachMove","MSGBOX_YESNO"]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:["NO","FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale"]},
  {op:"goto",args:["FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_MoveRelearnersHouse_Text_TutorWhichMon","MSGBOX_DEFAULT"]},
  {op:"special",args:["ChooseMonForMoveRelearner"]},
  {op:"goto_if_eq",args:["VAR_0x8004","PARTY_NOTHING_CHOSEN","FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale"]},
  {op:"special",args:["IsSelectedMonEgg"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"FallarborTown_MoveRelearnersHouse_EventScript_CantTeachEgg"]},
  {op:"goto_if_eq",args:["VAR_0x8005",0,"FallarborTown_MoveRelearnersHouse_EventScript_NoMoveToTeachMon"]},
  {op:"goto",args:["FallarborTown_MoveRelearnersHouse_EventScript_ChooseMove"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_MoveRelearnersHouse_Text_TeachWhichMove","MSGBOX_DEFAULT"]},
  {op:"special",args:["TeachMoveRelearnerMove"]},
  {op:"goto_if_eq",args:["VAR_0x8004",0,"FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon"]},
  {op:"msgbox",args:["FallarborTown_MoveRelearnersHouse_Text_HandedOverHeartScale","MSGBOX_DEFAULT"]},
  {op:"removeitem",args:["ITEM_HEART_SCALE"]},
  {op:"goto",args:["FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_MoveRelearnersHouse_Text_DontHaveMoveToTeachPokemon","MSGBOX_DEFAULT"]},
  {op:"goto",args:["FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_MoveRelearnersHouse_Text_CantTeachEgg","MSGBOX_DEFAULT"]},
  {op:"goto",args:["FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_MoveRelearnersHouse_Text_ComeBackWithHeartScale","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
