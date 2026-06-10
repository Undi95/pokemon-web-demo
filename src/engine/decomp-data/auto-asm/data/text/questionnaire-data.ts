// AUTO-GENERATED from data/text/questionnaire.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/questionnaire.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Questionnaire_Text_FillOut', isGlobal: true, instrIndex: 0 },
  { name: 'Questionnaire_Text_ThankYou', isGlobal: true, instrIndex: 0 },
  { name: 'Questionnaire_Text_YouKnowThoseWordsGift', isGlobal: true, instrIndex: 0 },
  { name: 'Questionnaire_Text_YouCanAccessMysteryGift', isGlobal: true, instrIndex: 0 },
  { name: 'Questionnaire_Text_YouKnowThoseWordsEvent', isGlobal: true, instrIndex: 0 },
  { name: 'Questionnaire_Text_YouCanAccessMysteryEvent', isGlobal: true, instrIndex: 0 },
  { name: 'MysteryGift_Text_TheresATicketForYou', isGlobal: true, instrIndex: 0 },
  { name: 'MysteryGift_Text_TryUsingItAtLilycovePort', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=28
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Il y a un questionnaire…\\n\""] },
  { kind: '.string', vals: ["\"Voulez-vous y répondre?$\""] },
  { kind: '.string', vals: ["\"Merci d'avoir pris le temps de\\n\""] },
  { kind: '.string', vals: ["\"répondre à notre questionnaire.\\p\""] },
  { kind: '.string', vals: ["\"Vos réponses nous permettront\\n\""] },
  { kind: '.string', vals: ["\"de mieux vous servir.$\""] },
  { kind: '.string', vals: ["\"Oh, bonjour!\\n\""] },
  { kind: '.string', vals: ["\"Vous connaissez ces mots?\\p\""] },
  { kind: '.string', vals: ["\"Donc vous devez aussi\\n\""] },
  { kind: '.string', vals: ["\"connaître le CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"A partir de maintenant, vous allez\\n\""] },
  { kind: '.string', vals: ["\"recevoir des CADEAUX MYST.!$\""] },
  { kind: '.string', vals: ["\"Après avoir sauvegardé, vous\\n\""] },
  { kind: '.string', vals: ["\"aurez accès aux CADEAUX MYST.!$\""] },
  { kind: '.string', vals: ["\"Oh, bonjour!\\n\""] },
  { kind: '.string', vals: ["\"Vous connaissez ces mots?\\p\""] },
  { kind: '.string', vals: ["\"Donc vous devez aussi\\n\""] },
  { kind: '.string', vals: ["\"connaître les EVENEMENTS MYSTERE.$\""] },
  { kind: '.string', vals: ["\"Après avoir sauvegardé, vous\\n\""] },
  { kind: '.string', vals: ["\"aurez accès aux EVENEMENTS MYSTERE.$\""] },
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"EVENEMENTS MYSTERE.\\p\""] },
  { kind: '.string', vals: ["\"Vous devez être {PLAYER}.\\n\""] },
  { kind: '.string', vals: ["\"Il y a un ticket pour vous.$\""] },
  { kind: '.string', vals: ["\"Il peut être utilisé au port de\\n\""] },
  { kind: '.string', vals: ["\"NENUCRIQUE.\\p\""] },
  { kind: '.string', vals: ["\"Essayez-le pour voir de quoi \\n\""] },
  { kind: '.string', vals: ["\"il s'agit.$\""] },
] as const;
