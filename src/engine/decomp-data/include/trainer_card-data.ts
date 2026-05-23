// AUTO-GENERATED from include/trainer_card.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/trainer_card.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TRAINER_CARD_PROFILE_LENGTH = 4;
export const TRAINER_CARD_STICKER_TYPES = 3;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_CARD_0 = {
  CARD_TYPE_FRLG: 0,
  CARD_TYPE_RS: 1,
  CARD_TYPE_EMERALD: 2,
} as const;
export const ENUM_MON_1 = {
  MON_ICON_TINT_NORMAL: 0,
  MON_ICON_TINT_BLACK: 1,
  MON_ICON_TINT_PINK: 2,
  MON_ICON_TINT_SEPIA: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CountPlayerTrainerStars', ret: "u32", arity: 0, params: "void" },
  { name: 'GetTrainerCardStars', ret: "u8", arity: 1, params: "u8 cardId" },
  { name: 'CopyTrainerCardData', ret: "void", arity: 3, params: "struct TrainerCard *dst, struct TrainerCard *src, u8 gameVersion" },
  { name: 'TrainerCard_GenerateCardForLinkPlayer', ret: "void", arity: 1, params: "struct TrainerCard *trainerCard" },
] as const;
