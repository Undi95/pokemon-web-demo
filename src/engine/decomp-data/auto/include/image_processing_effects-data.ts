// AUTO-GENERATED from include/image_processing_effects.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/image_processing_effects.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_IMAGE_0 = {
  IMAGE_EFFECT_POINTILLISM: 2,
  IMAGE_EFFECT_GRAYSCALE_LIGHT: 6,
  IMAGE_EFFECT_BLUR: 8,
  IMAGE_EFFECT_OUTLINE_COLORED: 9,
  IMAGE_EFFECT_INVERT_BLACK_WHITE: 10,
  IMAGE_EFFECT_THICK_BLACK_WHITE: 11,
  IMAGE_EFFECT_SHIMMER: 13,
  IMAGE_EFFECT_OUTLINE: 30,
  IMAGE_EFFECT_INVERT: 31,
  IMAGE_EFFECT_BLUR_RIGHT: 32,
  IMAGE_EFFECT_BLUR_DOWN: 33,
  IMAGE_EFFECT_CHARCOAL: 36,
} as const;
export const ENUM_QUANTIZE_1 = {
  QUANTIZE_EFFECT_STANDARD: 0,
  QUANTIZE_EFFECT_STANDARD_LIMITED_COLORS: 1,
  QUANTIZE_EFFECT_PRIMARY_COLORS: 2,
  QUANTIZE_EFFECT_GRAYSCALE: 3,
  QUANTIZE_EFFECT_GRAYSCALE_SMALL: 4,
  QUANTIZE_EFFECT_BLACK_WHITE: 5,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ApplyImageProcessingEffects', ret: "void", arity: 1, params: "struct ImageProcessingContext *context" },
  { name: 'ApplyImageProcessingQuantization', ret: "void", arity: 1, params: "struct ImageProcessingContext *context" },
  { name: 'ConvertImageProcessingToGBA', ret: "void", arity: 1, params: "struct ImageProcessingContext *context" },
] as const;
