// AUTO-GENERATED from include/easy_chat.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/easy_chat.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitEasyChatPhrases', ret: "void", arity: 0, params: "void" },
  { name: 'ShowEasyChatScreen', ret: "void", arity: 0, params: "void" },
  { name: 'IsEasyChatAnswerUnlocked', ret: "bool32", arity: 1, params: "int easyChatWord" },
  { name: 'InitializeEasyChatWordArray', ret: "void", arity: 2, params: "u16 *words, u16 length" },
  { name: 'IsBardWordInvalid', ret: "bool8", arity: 1, params: "u16 easyChatWord" },
  { name: 'GetRandomEasyChatWordFromGroup', ret: "u16", arity: 1, params: "u16 groupId" },
  { name: 'UnlockRandomTrendySaying', ret: "u16", arity: 0, params: "void" },
  { name: 'EasyChat_GetNumWordsInGroup', ret: "u16", arity: 1, params: "u8 groupId" },
  { name: 'GetRandomEasyChatWordFromUnlockedGroup', ret: "u16", arity: 1, params: "u16 groupId" },
  { name: 'DoEasyChatScreen', ret: "void", arity: 4, params: "u8 type, u16 *words, MainCallback exitCallback, u8 displayedPersonType" },
  { name: 'InitQuestionnaireWords', ret: "void", arity: 0, params: "void" },
  { name: 'UnlockTrendySaying', ret: "void", arity: 1, params: "u8 wordIndex" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'main.h',
] as const;
