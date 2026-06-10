// AUTO-GENERATED from data/maps/LilycoveCity_DepartmentStore_3F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LilycoveCity_DepartmentStore_3F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LilycoveCity_DepartmentStore_3F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_3F_EventScript_ClerkLeft', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_3F_Pokemart_Vitamins', isGlobal: false, instrIndex: 8 },
  { name: 'LilycoveCity_DepartmentStore_3F_EventScript_ClerkRight', isGlobal: true, instrIndex: 9 },
  { name: 'LilycoveCity_DepartmentStore_3F_Pokemart_StatBoosters', isGlobal: false, instrIndex: 17 },
  { name: 'LilycoveCity_DepartmentStore_3F_EventScript_TriathleteM', isGlobal: true, instrIndex: 18 },
  { name: 'LilycoveCity_DepartmentStore_3F_EventScript_PokefanM', isGlobal: true, instrIndex: 20 },
  { name: 'LilycoveCity_DepartmentStore_3F_EventScript_Woman', isGlobal: true, instrIndex: 22 },
  { name: 'LilycoveCity_DepartmentStore_3F_Text_ItemsBestForTougheningPokemon', isGlobal: false, instrIndex: 24 },
  { name: 'LilycoveCity_DepartmentStore_3F_Text_WantMoreEndurance', isGlobal: false, instrIndex: 24 },
  { name: 'LilycoveCity_DepartmentStore_3F_Text_GaveCarbosToSpeedUpMon', isGlobal: false, instrIndex: 24 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=13, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_PROTEIN"] },
  { kind: '.2byte', vals: ["ITEM_CALCIUM"] },
  { kind: '.2byte', vals: ["ITEM_IRON"] },
  { kind: '.2byte', vals: ["ITEM_ZINC"] },
  { kind: '.2byte', vals: ["ITEM_CARBOS"] },
  { kind: '.2byte', vals: ["ITEM_HP_UP"] },
  { kind: '.2byte', vals: ["ITEM_X_SPEED"] },
  { kind: '.2byte', vals: ["ITEM_X_SPECIAL"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.2byte', vals: ["ITEM_DIRE_HIT"] },
  { kind: '.2byte', vals: ["ITEM_GUARD_SPEC"] },
  { kind: '.2byte', vals: ["ITEM_X_ACCURACY"] },
  { kind: '.string', vals: ["\"Pour endurcir les POKéMON en un rien\\n\""] },
  { kind: '.string', vals: ["\"de temps, rien de mieux que les objets.\\p\""] },
  { kind: '.string', vals: ["\"Les PROTEINES accroissent l'ATTAQUE et\\n\""] },
  { kind: '.string', vals: ["\"le CALCIUM augmente l'ATQ. SPE.$\""] },
  { kind: '.string', vals: ["\"Je veux que mon POKéMON ait plus\\n\""] },
  { kind: '.string', vals: ["\"d'endurance.\\p\""] },
  { kind: '.string', vals: ["\"Je ne sais pas si je dois élever sa\\n\""] },
  { kind: '.string', vals: ["\"DEFENSE avec le FER ou sa DEF. SPE.\\l\""] },
  { kind: '.string', vals: ["\"avec le ZINC.$\""] },
  { kind: '.string', vals: ["\"J'ai donné du CARBONE à mon POKéMON\\n\""] },
  { kind: '.string', vals: ["\"et sa VITESSE a augmenté.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 24 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["LilycoveCity_DepartmentStore_3F_Pokemart_Vitamins"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["LilycoveCity_DepartmentStore_3F_Pokemart_StatBoosters"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_3F_Text_ItemsBestForTougheningPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_3F_Text_WantMoreEndurance","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_3F_Text_GaveCarbosToSpeedUpMon","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
