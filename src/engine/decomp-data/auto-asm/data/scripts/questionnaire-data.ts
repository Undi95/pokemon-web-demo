// AUTO-GENERATED from data/scripts/questionnaire.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/questionnaire.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EventScript_Questionnaire', isGlobal: true, instrIndex: 0 },
  { name: 'Questionnaire_EventScript_PlayerInputMysteryEventPhrase', isGlobal: true, instrIndex: 13 },
  { name: 'Questionnaire_EventScript_PlayerInputMysteryGiftPhrase', isGlobal: true, instrIndex: 27 },
  { name: 'Questionnaire_EventScript_Release', isGlobal: true, instrIndex: 41 },
  { name: 'Questionnaire_EventScript_ThankYou', isGlobal: true, instrIndex: 43 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 48 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lockall",args:[]},
  {op:"msgbox",args:["Questionnaire_Text_FillOut","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","Questionnaire_EventScript_Release"]},
  {op:"setvar",args:["VAR_0x8004","EASY_CHAT_TYPE_QUESTIONNAIRE"]},
  {op:"call",args:["Common_ShowEasyChatScreen"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"specialvar",args:["VAR_0x8008","GetMartEmployeeObjectEventId"]},
  {op:"goto_if_eq",args:["VAR_0x8004",1,"Questionnaire_EventScript_PlayerInputMysteryEventPhrase"]},
  {op:"goto_if_eq",args:["VAR_0x8004",2,"Questionnaire_EventScript_PlayerInputMysteryGiftPhrase"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Questionnaire_EventScript_Release"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Questionnaire_EventScript_ThankYou"]},
  {op:"end",args:[]},
  {op:"goto_if_unset",args:["FLAG_SYS_POKEDEX_GET","Questionnaire_EventScript_ThankYou"]},
  {op:"goto_if_set",args:["FLAG_SYS_MYSTERY_EVENT_ENABLE","Questionnaire_EventScript_ThankYou"]},
  {op:"applymovement",args:["VAR_0x8008","Common_Movement_FaceDown"]},
  {op:"waitmovement",args:[0]},
  {op:"playse",args:["SE_PIN"]},
  {op:"applymovement",args:["VAR_0x8008","Common_Movement_ExclamationMark"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["VAR_0x8008","Common_Movement_Delay48"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Questionnaire_Text_YouKnowThoseWordsEvent","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_SYS_MYSTERY_EVENT_ENABLE"]},
  {op:"msgbox",args:["Questionnaire_Text_YouCanAccessMysteryEvent","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"goto_if_unset",args:["FLAG_SYS_POKEDEX_GET","Questionnaire_EventScript_ThankYou"]},
  {op:"goto_if_set",args:["FLAG_SYS_MYSTERY_GIFT_ENABLE","Questionnaire_EventScript_ThankYou"]},
  {op:"applymovement",args:["VAR_0x8008","Common_Movement_FaceDown"]},
  {op:"waitmovement",args:[0]},
  {op:"playse",args:["SE_PIN"]},
  {op:"applymovement",args:["VAR_0x8008","Common_Movement_ExclamationMark"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["VAR_0x8008","Common_Movement_Delay48"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Questionnaire_Text_YouKnowThoseWordsGift","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_SYS_MYSTERY_GIFT_ENABLE"]},
  {op:"msgbox",args:["Questionnaire_Text_YouCanAccessMysteryGift","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["VAR_0x8008","Common_Movement_FaceDown"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Questionnaire_Text_ThankYou","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
