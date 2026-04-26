// AUTO-GENERATED from data/maps/AbandonedShip_Rooms_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/AbandonedShip_Rooms_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'AbandonedShip_Rooms_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Rooms_1F_EventScript_Gentleman', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Rooms_1F_EventScript_Demetrius', isGlobal: true, instrIndex: 2 },
  { name: 'AbandonedShip_Rooms_1F_EventScript_Thalia', isGlobal: true, instrIndex: 5 },
  { name: 'AbandonedShip_Rooms_1F_EventScript_RegisterThalia', isGlobal: true, instrIndex: 11 },
  { name: 'AbandonedShip_Rooms_1F_EventScript_ThaliaRematch', isGlobal: true, instrIndex: 17 },
  { name: 'AbandonedShip_Rooms_1F_Text_TakingALookAround', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_ThaliaIntro', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_ThaliaDefeat', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_ThaliaPostBattle', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_ThaliaRegister', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_ThaliaRematchIntro', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_ThaliaRematchDefeat', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_ThaliaPostRematch', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_DemetriusIntro', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_DemetriusDefeat', isGlobal: false, instrIndex: 20 },
  { name: 'AbandonedShip_Rooms_1F_Text_DemetriusPostBattle', isGlobal: false, instrIndex: 20 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=27
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Les bateaux de ce genre sont rares,\\n\""] },
  { kind: '.string', vals: ["\"alors je vais y jeter un coup d'œil.\\p\""] },
  { kind: '.string', vals: ["\"Hum…\\n\""] },
  { kind: '.string', vals: ["\"On dirait qu'il y a d'autres cabines…$\""] },
  { kind: '.string', vals: ["\"Qu'est-ce qui a bien pu te pousser\\n\""] },
  { kind: '.string', vals: ["\"à venir ici?\\p\""] },
  { kind: '.string', vals: ["\"Tu ne sais pas que la curiosité est\\n\""] },
  { kind: '.string', vals: ["\"un vilain défaut?$\""] },
  { kind: '.string', vals: ["\"Et plutôt tenace en plus de ça!$\""] },
  { kind: '.string', vals: ["\"L'homme d'à côté…\\p\""] },
  { kind: '.string', vals: ["\"Il dit qu'il est juste là pour voir le\\n\""] },
  { kind: '.string', vals: ["\"paysage, mais j'ai du mal à le croire.$\""] },
  { kind: '.string', vals: ["\"Tu es si jeune pour un DRESSEUR!\\n\""] },
  { kind: '.string', vals: ["\"Laisse-moi t'enregistrer!$\""] },
  { kind: '.string', vals: ["\"Qu'est-ce qui a bien pu te pousser\\n\""] },
  { kind: '.string', vals: ["\"à revenir ici?\\p\""] },
  { kind: '.string', vals: ["\"Quelle curiosité, ma parole!$\""] },
  { kind: '.string', vals: ["\"C'est normal d'avoir tant de force\\n\""] },
  { kind: '.string', vals: ["\"dans un si petit corps?$\""] },
  { kind: '.string', vals: ["\"Je suis sûre que cet homme cherche\\n\""] },
  { kind: '.string', vals: ["\"quelque chose. Il est vraiment étrange!$\""] },
  { kind: '.string', vals: ["\"Waaah!\\n\""] },
  { kind: '.string', vals: ["\"Tu m'as trouvé!$\""] },
  { kind: '.string', vals: ["\"Oh, t'es pas ma maman toi!$\""] },
  { kind: '.string', vals: ["\"J'ai peur de me faire gronder, alors\\n\""] },
  { kind: '.string', vals: ["\"je me cache…\\p\""] },
  { kind: '.string', vals: ["\"Tu diras rien, d'accord?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 20 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["AbandonedShip_Rooms_1F_Text_TakingALookAround","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DEMETRIUS","AbandonedShip_Rooms_1F_Text_DemetriusIntro","AbandonedShip_Rooms_1F_Text_DemetriusDefeat"]},
  {op:"msgbox",args:["AbandonedShip_Rooms_1F_Text_DemetriusPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_THALIA_1","AbandonedShip_Rooms_1F_Text_ThaliaIntro","AbandonedShip_Rooms_1F_Text_ThaliaDefeat","AbandonedShip_Rooms_1F_EventScript_RegisterThalia"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"AbandonedShip_Rooms_1F_EventScript_ThaliaRematch"]},
  {op:"msgbox",args:["AbandonedShip_Rooms_1F_Text_ThaliaPostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["AbandonedShip_Rooms_1F_Text_ThaliaRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_THALIA_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_THALIA_1","AbandonedShip_Rooms_1F_Text_ThaliaRematchIntro","AbandonedShip_Rooms_1F_Text_ThaliaRematchDefeat"]},
  {op:"msgbox",args:["AbandonedShip_Rooms_1F_Text_ThaliaPostRematch","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
