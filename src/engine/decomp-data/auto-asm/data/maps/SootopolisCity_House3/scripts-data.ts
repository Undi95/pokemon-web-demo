// AUTO-GENERATED from data/maps/SootopolisCity_House3/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_House3/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_House3_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House3_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House3_EventScript_HaveFans', isGlobal: true, instrIndex: 7 },
  { name: 'SootopolisCity_House3_EventScript_Girl', isGlobal: true, instrIndex: 10 },
  { name: 'SootopolisCity_House3_Text_JuanHasManyFansDoYou', isGlobal: false, instrIndex: 12 },
  { name: 'SootopolisCity_House3_Text_YouMustBePrettyStrong', isGlobal: false, instrIndex: 12 },
  { name: 'SootopolisCity_House3_Text_LonesomeTryWorkingHarder', isGlobal: false, instrIndex: 12 },
  { name: 'SootopolisCity_House3_Text_TrainerFanClubWasWild', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=13
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Tu es DRESSEUR, non?\\p\""] },
  { kind: '.string', vals: ["\"JUAN d'ATALANOPOLIS a de nombreux\\n\""] },
  { kind: '.string', vals: ["\"fans. Encore plus que son élève MARC!\\p\""] },
  { kind: '.string', vals: ["\"Et toi, tu en as?$\""] },
  { kind: '.string', vals: ["\"Oh, quelle puissance tu dois avoir!$\""] },
  { kind: '.string', vals: ["\"Oh, mon p'tit…\\n\""] },
  { kind: '.string', vals: ["\"Tu es un peu solitaire.\\p\""] },
  { kind: '.string', vals: ["\"Essaie de travailler plus dur pour\\n\""] },
  { kind: '.string', vals: ["\"avoir des fans à tes côtés.$\""] },
  { kind: '.string', vals: ["\"Les fans dévoués viennent même\\n\""] },
  { kind: '.string', vals: ["\"d'en dehors de HOENN.\\p\""] },
  { kind: '.string', vals: ["\"C'était la folie quand je suis allée au\\n\""] },
  { kind: '.string', vals: ["\"FAN CLUB DES DRESSEURS à NENUCRIQUE.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["SootopolisCity_House3_Text_JuanHasManyFansDoYou","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","YES","SootopolisCity_House3_EventScript_HaveFans"]},
  {op:"msgbox",args:["SootopolisCity_House3_Text_LonesomeTryWorkingHarder","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House3_Text_YouMustBePrettyStrong","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House3_Text_TrainerFanClubWasWild","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
