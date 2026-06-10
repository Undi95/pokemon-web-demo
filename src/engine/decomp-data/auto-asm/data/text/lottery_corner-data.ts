// AUTO-GENERATED from data/text/lottery_corner.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/lottery_corner.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LilycoveCity_DepartmentStore_1F_Text_LotteryCornerDrawTicket', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_ComeBackTomorrow', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_PleaseVisitAgain', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_PleasePickTicket', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_TicketNumberIsXPleaseWait', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_TicketMatchesPartyMon', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_TicketMatchesPCMon', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_NoNumbersMatched', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_TwoDigitsMatched', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_ThreeDigitsMatched', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_FourDigitsMatched', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_AllFiveDigitsMatched', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_NoRoomForThis', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_PrizeWeveBeenHolding', isGlobal: false, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_1F_Text_PleaseVisitAgain2', isGlobal: false, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=49
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Vous êtes à la LOTERIE POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Tous les clients du CENTRE COMMERCIAL\\n\""] },
  { kind: '.string', vals: ["\"peuvent retirer un BILLET DE LOTERIE\\l\""] },
  { kind: '.string', vals: ["\"POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Si le numéro sur le BILLET DE LOTERIE\\n\""] },
  { kind: '.string', vals: ["\"correspond au numéro ID d'un de vos\\l\""] },
  { kind: '.string', vals: ["\"POKéMON, vous recevrez un beau cadeau.\\p\""] },
  { kind: '.string', vals: ["\"Voulez-vous retirer un BILLET DE\\n\""] },
  { kind: '.string', vals: ["\"LOTERIE POKéMON?$\""] },
  { kind: '.string', vals: ["\"Revenez demain.$\""] },
  { kind: '.string', vals: ["\"A bientôt.$\""] },
  { kind: '.string', vals: ["\"Veuillez prendre un BILLET DE LOTERIE.\\n\""] },
  { kind: '.string', vals: ["\"…{PAUSE 15}{PAUSE 15}{PAUSE 15}{PAUSE 15}…{PAUSE 15}{PAUSE 15}{PAUSE 15}{PAUSE 15}…{PAUSE 15}{PAUSE 15}{PAUSE 15}{PAUSE 15}$\""] },
  { kind: '.string', vals: ["\"Le numéro du BILLET DE LOTERIE est\\n\""] },
  { kind: '.string', vals: ["\"{STR_VAR_1}.\\p\""] },
  { kind: '.string', vals: ["\"Je vais voir si ce numéro correspond\\n\""] },
  { kind: '.string', vals: ["\"à l'un des numéros ID de vos POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Veuillez patienter.$\""] },
  { kind: '.string', vals: ["\"Félicitations!\\p\""] },
  { kind: '.string', vals: ["\"Le numéro ID de {STR_VAR_1}, qui est\\n\""] },
  { kind: '.string', vals: ["\"dans votre équipe, correspond à celui\\l\""] },
  { kind: '.string', vals: ["\"du BILLET DE LOTERIE!$\""] },
  { kind: '.string', vals: ["\"Félicitations!\\p\""] },
  { kind: '.string', vals: ["\"Le numéro ID de {STR_VAR_1}, qui est\\n\""] },
  { kind: '.string', vals: ["\"stocké sur le PC, correspond à\\l\""] },
  { kind: '.string', vals: ["\"celui du BILLET DE LOTERIE!$\""] },
  { kind: '.string', vals: ["\"Quel dommage!\\n\""] },
  { kind: '.string', vals: ["\"Aucun des numéros ne correspond.$\""] },
  { kind: '.string', vals: ["\"Deux chiffres correspondent, vous\\n\""] },
  { kind: '.string', vals: ["\"remportez le troisième prix!\\p\""] },
  { kind: '.string', vals: ["\"Vous avez gagné {STR_VAR_1}!$\""] },
  { kind: '.string', vals: ["\"Trois chiffres correspondent, vous\\n\""] },
  { kind: '.string', vals: ["\"remportez le deuxième prix!\\p\""] },
  { kind: '.string', vals: ["\"Vous avez gagné {STR_VAR_1}!$\""] },
  { kind: '.string', vals: ["\"Quatre chiffres correspondent, vous\\n\""] },
  { kind: '.string', vals: ["\"remportez le premier prix!\\p\""] },
  { kind: '.string', vals: ["\"Vous avez gagné {STR_VAR_1}!$\""] },
  { kind: '.string', vals: ["\"Magnifique, tous les chiffres\\n\""] },
  { kind: '.string', vals: ["\"correspondent!\\p\""] },
  { kind: '.string', vals: ["\"Vous avez gagné le super prix!\\n\""] },
  { kind: '.string', vals: ["\"Vous avez gagné {STR_VAR_1}!$\""] },
  { kind: '.string', vals: ["\"Oh?\\n\""] },
  { kind: '.string', vals: ["\"On dirait que vous n'avez plus de place.\\p\""] },
  { kind: '.string', vals: ["\"Faites de la place dans votre SAC et\\n\""] },
  { kind: '.string', vals: ["\"revenez me voir.$\""] },
  { kind: '.string', vals: ["\"{PLAYER}?\\n\""] },
  { kind: '.string', vals: ["\"Oui, je vous attendais.\\p\""] },
  { kind: '.string', vals: ["\"Nous vous avons gardé votre prix.$\""] },
  { kind: '.string', vals: ["\"A bientôt.$\""] },
] as const;
