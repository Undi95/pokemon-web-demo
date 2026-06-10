// AUTO-GENERATED from data/maps/SeafloorCavern_Room3/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SeafloorCavern_Room3/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SeafloorCavern_Room3_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SeafloorCavern_Room3_EventScript_Shelly', isGlobal: true, instrIndex: 0 },
  { name: 'SeafloorCavern_Room3_EventScript_Grunt5', isGlobal: true, instrIndex: 3 },
  { name: 'SeafloorCavern_Room3_Text_ShellyIntro', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room3_Text_ShellyDefeat', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room3_Text_ShellyPostBattle', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room3_Text_Grunt5Intro', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room3_Text_Grunt5Defeat', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room3_Text_Grunt5PostBattle', isGlobal: false, instrIndex: 6 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=32
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ahahahaha!\\p\""] },
  { kind: '.string', vals: ["\"Comment t'as fait pour venir jusqu'ici\\n\""] },
  { kind: '.string', vals: ["\"sans sous-marin?\\l\""] },
  { kind: '.string', vals: ["\"Quel môme impressionnant!\\p\""] },
  { kind: '.string', vals: ["\"Mais… C'est pas pour autant qu'on va\\n\""] },
  { kind: '.string', vals: ["\"te laisser te mêler de nos affaires.\\p\""] },
  { kind: '.string', vals: ["\"Et j'voudrais avoir ma revanche pour\\n\""] },
  { kind: '.string', vals: ["\"ce qui s'est passé au CENTRE METEO…\\p\""] },
  { kind: '.string', vals: ["\"Je vais te faire goûter à la douleur!\\n\""] },
  { kind: '.string', vals: ["\"Tu ferais mieux de renoncer!$\""] },
  { kind: '.string', vals: ["\"Ahahahaha!\\p\""] },
  { kind: '.string', vals: ["\"Ouille!$\""] },
  { kind: '.string', vals: ["\"Ahahahaha!\\n\""] },
  { kind: '.string', vals: ["\"Quelle puissance tu as!\\p\""] },
  { kind: '.string', vals: ["\"C'est vraiment dommage que tu ne\\n\""] },
  { kind: '.string', vals: ["\"sois pas membre de la TEAM AQUA.\\p\""] },
  { kind: '.string', vals: ["\"Tu aurais pu prendre du plaisir dans le\\n\""] },
  { kind: '.string', vals: ["\"fabuleux monde que notre CHEF nous\\l\""] },
  { kind: '.string', vals: ["\"a promis…$\""] },
  { kind: '.string', vals: ["\"Pour réaliser notre rêve, nous avons\\n\""] },
  { kind: '.string', vals: ["\"besoin de la puissance des POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Mais il y a toujours des enquiquineurs\\n\""] },
  { kind: '.string', vals: ["\"comme toi qui utilisent leurs POKéMON\\l\""] },
  { kind: '.string', vals: ["\"pour contrecarrer nos plans!\\p\""] },
  { kind: '.string', vals: ["\"Rien ne se passe jamais comme prévu!$\""] },
  { kind: '.string', vals: ["\"Graaah!$\""] },
  { kind: '.string', vals: ["\"Tu sais, nous ne remettons pas en\\n\""] },
  { kind: '.string', vals: ["\"question les motifs de notre CHEF.\\p\""] },
  { kind: '.string', vals: ["\"Mais tu es là, à vouloir stopper\\n\""] },
  { kind: '.string', vals: ["\"nos plans.\\p\""] },
  { kind: '.string', vals: ["\"Peut-être que…\\n\""] },
  { kind: '.string', vals: ["\"Tu dois avoir tes raisons…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_SHELLY_SEAFLOOR_CAVERN","SeafloorCavern_Room3_Text_ShellyIntro","SeafloorCavern_Room3_Text_ShellyDefeat"]},
  {op:"msgbox",args:["SeafloorCavern_Room3_Text_ShellyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_SEAFLOOR_CAVERN_5","SeafloorCavern_Room3_Text_Grunt5Intro","SeafloorCavern_Room3_Text_Grunt5Defeat"]},
  {op:"msgbox",args:["SeafloorCavern_Room3_Text_Grunt5PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
