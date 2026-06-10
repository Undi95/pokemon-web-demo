// AUTO-GENERATED from data/maps/VictoryRoad_B2F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/VictoryRoad_B2F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'VictoryRoad_B2F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'VictoryRoad_B2F_EventScript_Vito', isGlobal: true, instrIndex: 0 },
  { name: 'VictoryRoad_B2F_EventScript_Owen', isGlobal: true, instrIndex: 3 },
  { name: 'VictoryRoad_B2F_EventScript_Caroline', isGlobal: true, instrIndex: 6 },
  { name: 'VictoryRoad_B2F_EventScript_Julie', isGlobal: true, instrIndex: 9 },
  { name: 'VictoryRoad_B2F_EventScript_Felix', isGlobal: true, instrIndex: 12 },
  { name: 'VictoryRoad_B2F_EventScript_Dianne', isGlobal: true, instrIndex: 15 },
  { name: 'VictoryRoad_B2F_Text_VitoIntro', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_VitoDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_VitoPostBattle', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_OwenIntro', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_OwenDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_OwenPostBattle', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_CarolineIntro', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_CarolineDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_CarolinePostBattle', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_JulieIntro', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_JulieDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_JuliePostBattle', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_FelixIntro', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_FelixDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_FelixPostBattle', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_DianneIntro', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_DianneDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'VictoryRoad_B2F_Text_DiannePostBattle', isGlobal: false, instrIndex: 18 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=38
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"On s'entraîne tous ensemble, avec\\n\""] },
  { kind: '.string', vals: ["\"les membres de ma famille!\\p\""] },
  { kind: '.string', vals: ["\"Je ne perds contre personne!$\""] },
  { kind: '.string', vals: ["\"Tu as un meilleur niveau que ma famille?!\\n\""] },
  { kind: '.string', vals: ["\"Est-ce possible?!$\""] },
  { kind: '.string', vals: ["\"J'ai toujours été le meilleur de la\\n\""] },
  { kind: '.string', vals: ["\"famille. Je n'avais encore jamais perdu…\\p\""] },
  { kind: '.string', vals: ["\"J'ai perdu confiance en moi…\\n\""] },
  { kind: '.string', vals: ["\"Je vais peut-être rentrer chez moi…$\""] },
  { kind: '.string', vals: ["\"On m'avait dit qu'il y avait un môme\\n\""] },
  { kind: '.string', vals: ["\"très fort. C'est de toi qu'ils parlaient?$\""] },
  { kind: '.string', vals: ["\"La demi-portion est forte!$\""] },
  { kind: '.string', vals: ["\"D'après les rumeurs, le p'tit môme\\n\""] },
  { kind: '.string', vals: ["\"très fort viendrait de CLEMENTI-VILLE.$\""] },
  { kind: '.string', vals: ["\"Tu dois commencer à fatiguer.$\""] },
  { kind: '.string', vals: ["\"Aucun signe de fatigue du tout!$\""] },
  { kind: '.string', vals: ["\"La ROUTE VICTOIRE et la LIGUE POKéMON\\n\""] },
  { kind: '.string', vals: ["\"sont des défis épuisants et de longue\\l\""] },
  { kind: '.string', vals: ["\"haleine. Gare à la fatigue!$\""] },
  { kind: '.string', vals: ["\"Avoir beaucoup de BADGES ne suffit pas.\\p\""] },
  { kind: '.string', vals: ["\"Il y aura toujours quelqu'un de plus\\n\""] },
  { kind: '.string', vals: ["\"fort que toi!$\""] },
  { kind: '.string', vals: ["\"Tu as un meilleur niveau que moi!$\""] },
  { kind: '.string', vals: ["\"Regarde bien tes BADGES et rappelle-\\n\""] },
  { kind: '.string', vals: ["\"toi quels DRESSEURS tu as affrontés.$\""] },
  { kind: '.string', vals: ["\"Je suis arrivé jusqu'ici, mais le stress\\n\""] },
  { kind: '.string', vals: ["\"me donne des maux d'estomac…$\""] },
  { kind: '.string', vals: ["\"Oooh…\\n\""] },
  { kind: '.string', vals: ["\"Ça fait mal…$\""] },
  { kind: '.string', vals: ["\"Je ne peux pas m'empêcher de stresser\\n\""] },
  { kind: '.string', vals: ["\"en sachant que la LIGUE POKéMON\\l\""] },
  { kind: '.string', vals: ["\"est si proche.\\p\""] },
  { kind: '.string', vals: ["\"J'arrive à peine à me détendre.$\""] },
  { kind: '.string', vals: ["\"L'élite de l'élite se réunit dans\\n\""] },
  { kind: '.string', vals: ["\"cette grotte.\\p\""] },
  { kind: '.string', vals: ["\"T'en penses quoi?$\""] },
  { kind: '.string', vals: ["\"Pas une seule fausse note!$\""] },
  { kind: '.string', vals: ["\"T'as du cran, continue comme ça!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 18 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_VITO","VictoryRoad_B2F_Text_VitoIntro","VictoryRoad_B2F_Text_VitoDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B2F_Text_VitoPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_OWEN","VictoryRoad_B2F_Text_OwenIntro","VictoryRoad_B2F_Text_OwenDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B2F_Text_OwenPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CAROLINE","VictoryRoad_B2F_Text_CarolineIntro","VictoryRoad_B2F_Text_CarolineDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B2F_Text_CarolinePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_JULIE","VictoryRoad_B2F_Text_JulieIntro","VictoryRoad_B2F_Text_JulieDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B2F_Text_JuliePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_FELIX","VictoryRoad_B2F_Text_FelixIntro","VictoryRoad_B2F_Text_FelixDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B2F_Text_FelixPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DIANNE","VictoryRoad_B2F_Text_DianneIntro","VictoryRoad_B2F_Text_DianneDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B2F_Text_DiannePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
