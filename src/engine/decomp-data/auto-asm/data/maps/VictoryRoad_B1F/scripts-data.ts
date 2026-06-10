// AUTO-GENERATED from data/maps/VictoryRoad_B1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/VictoryRoad_B1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'VictoryRoad_B1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'VictoryRoad_B1F_EventScript_Samuel', isGlobal: true, instrIndex: 0 },
  { name: 'VictoryRoad_B1F_EventScript_Shannon', isGlobal: true, instrIndex: 3 },
  { name: 'VictoryRoad_B1F_EventScript_Michelle', isGlobal: true, instrIndex: 6 },
  { name: 'VictoryRoad_B1F_EventScript_Mitchell', isGlobal: true, instrIndex: 9 },
  { name: 'VictoryRoad_B1F_EventScript_Halle', isGlobal: true, instrIndex: 12 },
  { name: 'VictoryRoad_B1F_Text_SamuelIntro', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_SamuelDefeat', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_SamuelPostBattle', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_ShannonIntro', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_ShannonDefeat', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_ShannonPostBattle', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_MichelleIntro', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_MichelleDefeat', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_MichellePostBattle', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_MitchellIntro', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_MitchellDefeat', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_MitchellPostBattle', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_HalleIntro', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_HalleDefeat', isGlobal: false, instrIndex: 15 },
  { name: 'VictoryRoad_B1F_Text_HallePostBattle', isGlobal: false, instrIndex: 15 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=36
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Penser que je me rapproche de\\n\""] },
  { kind: '.string', vals: ["\"la LIGUE POKéMON…\\p\""] },
  { kind: '.string', vals: ["\"J'ai le trac…$\""] },
  { kind: '.string', vals: ["\"Je n'ai rien pu faire…$\""] },
  { kind: '.string', vals: ["\"La LIGUE POKéMON s'éloigne à nouveau…\\n\""] },
  { kind: '.string', vals: ["\"Quelle déception…$\""] },
  { kind: '.string', vals: ["\"Pour réussir à parcourir le chemin qui\\n\""] },
  { kind: '.string', vals: ["\"te mènera à la LIGUE POKéMON, il te\\l\""] },
  { kind: '.string', vals: ["\"faudra avoir la confiance de tes\\l\""] },
  { kind: '.string', vals: ["\"POKéMON.$\""] },
  { kind: '.string', vals: ["\"Votre relation est basée sur une\\n\""] },
  { kind: '.string', vals: ["\"solide confiance.$\""] },
  { kind: '.string', vals: ["\"Comme les POKéMON et les DRESSEURS\\n\""] },
  { kind: '.string', vals: ["\"sont toujours ensemble, leur confiance\\l\""] },
  { kind: '.string', vals: ["\"mutuelle grandit.$\""] },
  { kind: '.string', vals: ["\"Ce n'est pas encore là. Ce n'est qu'une\\n\""] },
  { kind: '.string', vals: ["\"étape sur la route de la LIGUE POKéMON.$\""] },
  { kind: '.string', vals: ["\"C'est en ce sens qu'il faut aller!$\""] },
  { kind: '.string', vals: ["\"Tu vas te débrouiller, c'est sûr!\\n\""] },
  { kind: '.string', vals: ["\"Tes POKéMON ont tous envie d'y aller!$\""] },
  { kind: '.string', vals: ["\"Mes POKéMON me font penser\\n\""] },
  { kind: '.string', vals: ["\"aux étoiles!$\""] },
  { kind: '.string', vals: ["\"Je n'avais encore jamais rencontré\\n\""] },
  { kind: '.string', vals: ["\"quelqu'un comme toi!$\""] },
  { kind: '.string', vals: ["\"Même quand tu ne te bats pas, j'arrive\\n\""] },
  { kind: '.string', vals: ["\"à sentir une grande force émanant\\l\""] },
  { kind: '.string', vals: ["\"de tes POKéMON et toi…$\""] },
  { kind: '.string', vals: ["\"OK, pas besoin de t'énerver!\\n\""] },
  { kind: '.string', vals: ["\"Relax, ça va bien se passer!$\""] },
  { kind: '.string', vals: ["\"Ouah!\\n\""] },
  { kind: '.string', vals: ["\"Formidable!$\""] },
  { kind: '.string', vals: ["\"C'est bien la ROUTE VICTOIRE.\\p\""] },
  { kind: '.string', vals: ["\"Mais ce n'est pas si différent de la\\n\""] },
  { kind: '.string', vals: ["\"route que tu as déjà empruntée.\\p\""] },
  { kind: '.string', vals: ["\"Essaie de profiter du reste du\\n\""] },
  { kind: '.string', vals: ["\"chemin à parcourir!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 15 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_SAMUEL","VictoryRoad_B1F_Text_SamuelIntro","VictoryRoad_B1F_Text_SamuelDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B1F_Text_SamuelPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_SHANNON","VictoryRoad_B1F_Text_ShannonIntro","VictoryRoad_B1F_Text_ShannonDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B1F_Text_ShannonPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_MICHELLE","VictoryRoad_B1F_Text_MichelleIntro","VictoryRoad_B1F_Text_MichelleDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B1F_Text_MichellePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_MITCHELL","VictoryRoad_B1F_Text_MitchellIntro","VictoryRoad_B1F_Text_MitchellDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B1F_Text_MitchellPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_HALLE","VictoryRoad_B1F_Text_HalleIntro","VictoryRoad_B1F_Text_HalleDefeat"]},
  {op:"msgbox",args:["VictoryRoad_B1F_Text_HallePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
