// AUTO-GENERATED from data/scripts/roulette.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/roulette.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Roulette_EventScript_Table1', isGlobal: true, instrIndex: 0 },
  { name: 'Roulette_EventScript_Table2', isGlobal: true, instrIndex: 8 },
  { name: 'Roulette_EventScript_Play', isGlobal: true, instrIndex: 16 },
  { name: 'Roulette_Text_PlayMinimumWagerIsX', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_NotEnoughCoins', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_SpecialRateTable', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_ControlsInstruction', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_ItsAHit', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_Jackpot', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_NothingDoing', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_YouveWonXCoins', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_NoCoinsLeft', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_KeepPlaying', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_BoardWillBeCleared', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_YouDontHaveACoinCase', isGlobal: true, instrIndex: 18 },
  { name: 'Roulette_Text_CoinCaseIsFull', isGlobal: true, instrIndex: 18 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=16
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"A cette table, la mise minimum est\\n\""] },
  { kind: '.string', vals: ["\"de {STR_VAR_1}. Voulez-vous jouer?$\""] },
  { kind: '.string', vals: ["\"Vous n'avez pas assez de JETONS.$\""] },
  { kind: '.string', vals: ["\"En ce moment, table à tarif spécial!$\""] },
  { kind: '.string', vals: ["\"Placez votre mise avec la manette +\\n\""] },
  { kind: '.string', vals: ["\"et appuyez sur le bouton A.$\""] },
  { kind: '.string', vals: ["\"Vous avez gagné!$\""] },
  { kind: '.string', vals: ["\"Jackpot!$\""] },
  { kind: '.string', vals: ["\"Vous avez perdu!$\""] },
  { kind: '.string', vals: ["\"Vous avez gagné {STR_VAR_1} JETONS!$\""] },
  { kind: '.string', vals: ["\"Plus assez de JETONS…$\""] },
  { kind: '.string', vals: ["\"Continuer à jouer?$\""] },
  { kind: '.string', vals: ["\"La ROULETTE va être relancée.$\""] },
  { kind: '.string', vals: ["\"You don't have a COIN CASE.$\""] },
  { kind: '.string', vals: ["\"Votre BOITE JETONS est pleine! On peut\\n\""] },
  { kind: '.string', vals: ["\"échanger vos JETONS contre des lots.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 18 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"checkitem",args:["ITEM_COIN_CASE"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"MauvilleCity_GameCorner_EventScript_NoCoinCase"]},
  {op:"setvar",args:["VAR_0x8004",0]},
  {op:"getpokenewsactive",args:["POKENEWS_GAME_CORNER"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Roulette_EventScript_Play"]},
  {op:"addvar",args:["VAR_0x8004","ROULETTE_SPECIAL_RATE"]},
  {op:"goto",args:["Roulette_EventScript_Play"]},
  {op:"end",args:[]},
  {op:"checkitem",args:["ITEM_COIN_CASE"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"MauvilleCity_GameCorner_EventScript_NoCoinCase"]},
  {op:"setvar",args:["VAR_0x8004",1]},
  {op:"getpokenewsactive",args:["POKENEWS_GAME_CORNER"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Roulette_EventScript_Play"]},
  {op:"addvar",args:["VAR_0x8004","ROULETTE_SPECIAL_RATE"]},
  {op:"goto",args:["Roulette_EventScript_Play"]},
  {op:"end",args:[]},
  {op:"special",args:["PlayRoulette"]},
  {op:"end",args:[]},
] as const;
