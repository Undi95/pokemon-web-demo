// AUTO-GENERATED from data/maps/Route116_TunnelersRestHouse/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route116_TunnelersRestHouse/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route116_TunnelersRestHouse_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route116_TunnelersRestHouse_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'Route116_TunnelersRestHouse_EventScript_Tunneler1', isGlobal: true, instrIndex: 3 },
  { name: 'Route116_TunnelersRestHouse_EventScript_Tunneler2', isGlobal: true, instrIndex: 5 },
  { name: 'Route116_TunnelersRestHouse_EventScript_Tunneler3', isGlobal: true, instrIndex: 7 },
  { name: 'Route116_TunnelersRestHouse_EventScript_TunnelOpened', isGlobal: true, instrIndex: 13 },
  { name: 'Route116_TunnelersRestHouse_Text_WeHadToStopBoring', isGlobal: false, instrIndex: 16 },
  { name: 'Route116_TunnelersRestHouse_Text_ManDiggingHisWayToVerdanturf', isGlobal: false, instrIndex: 16 },
  { name: 'Route116_TunnelersRestHouse_Text_GetToVerdanturfWithoutTunnel', isGlobal: false, instrIndex: 16 },
  { name: 'Route116_TunnelersRestHouse_Text_TunnelHasGoneThrough', isGlobal: false, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=25
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"C'est le TUNNEL MERAZON, là-bas…\\p\""] },
  { kind: '.string', vals: ["\"Au début, de nombreux ouvriers\\n\""] },
  { kind: '.string', vals: ["\"perçaient les rochers avec d'énormes\\l\""] },
  { kind: '.string', vals: ["\"engins. Mais nous avons dû arrêter.\\p\""] },
  { kind: '.string', vals: ["\"On s'est rendu compte que les travaux\\n\""] },
  { kind: '.string', vals: ["\"avaient un effet négatif sur les\\l\""] },
  { kind: '.string', vals: ["\"POKéMON sauvages de la région.\\p\""] },
  { kind: '.string', vals: ["\"Maintenant, nous n'avons plus rien\\n\""] },
  { kind: '.string', vals: ["\"à faire, à part flâner.$\""] },
  { kind: '.string', vals: ["\"Il y a un homme qui creuse un TUNNEL\\n\""] },
  { kind: '.string', vals: ["\"vers VERGAZON, tout seul.\\l\""] },
  { kind: '.string', vals: ["\"Il veut absolument passer.\\p\""] },
  { kind: '.string', vals: ["\"Il affirme que s'il creuse petit à petit\\n\""] },
  { kind: '.string', vals: ["\"sans utiliser de machine, il ne\\l\""] },
  { kind: '.string', vals: ["\"dérangera pas les POKéMON et n'abîmera\\l\""] },
  { kind: '.string', vals: ["\"pas l'écosystème environnant.\\p\""] },
  { kind: '.string', vals: ["\"Je me demande s'il a déjà fini.$\""] },
  { kind: '.string', vals: ["\"Pour atteindre VERGAZON sans utiliser\\n\""] },
  { kind: '.string', vals: ["\"ce TUNNEL, tu devras naviguer jusqu'à\\l\""] },
  { kind: '.string', vals: ["\"MYOKARA, puis jusqu'à POIVRESSEL et\\l\""] },
  { kind: '.string', vals: ["\"enfin passer par LAVANDIA.$\""] },
  { kind: '.string', vals: ["\"Tu as entendu? Le TUNNEL pour\\n\""] },
  { kind: '.string', vals: ["\"VERGAZON est enfin terminé!\\p\""] },
  { kind: '.string', vals: ["\"Parfois, si l'on souhaite très fort\\n\""] },
  { kind: '.string', vals: ["\"quelque chose, ça se réalise.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 16 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route116_TunnelersRestHouse_OnTransition"]},
  {op:"setflag",args:["FLAG_LANDMARK_TUNNELERS_REST_HOUSE"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route116_TunnelersRestHouse_Text_WeHadToStopBoring","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route116_TunnelersRestHouse_Text_ManDiggingHisWayToVerdanturf","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RUSTURF_TUNNEL_OPENED","Route116_TunnelersRestHouse_EventScript_TunnelOpened"]},
  {op:"msgbox",args:["Route116_TunnelersRestHouse_Text_GetToVerdanturfWithoutTunnel","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route116_TunnelersRestHouse_Text_TunnelHasGoneThrough","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
