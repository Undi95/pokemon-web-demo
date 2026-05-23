// AUTO-GENERATED from src/image_processing_effects.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/image_processing_effects.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_DIMENSION = 64;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u8", name: 'gCanvasColumnStart', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gCanvasRowEnd', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gCanvasHeight', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gCanvasColumnEnd', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gCanvasRowStart', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gCanvasMonPersonality', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gCanvasWidth', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gCanvasPaletteStart', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ApplyImageEffect_Pointillism', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_Blur', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_BlackOutline', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_Invert', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_BlackAndWhite', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_BlurRight', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_BlurDown', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_Shimmer', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_Grayscale', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyImageEffect_PersonalityColor', ret: "void", arity: 1, params: "u8" },
  { name: 'ApplyImageEffect_RedChannelGrayscale', ret: "void", arity: 1, params: "u8" },
  { name: 'ApplyImageEffect_RedChannelGrayscaleHighlight', ret: "void", arity: 1, params: "u8" },
  { name: 'AddPointillismPoints', ret: "void", arity: 1, params: "u16" },
  { name: 'ConvertColorToGrayscale', ret: "u16", arity: 1, params: "u16 *" },
  { name: 'QuantizePixel_Blur', ret: "u16", arity: 3, params: "u16 *, u16 *, u16 *" },
  { name: 'QuantizePixel_PersonalityColor', ret: "u16", arity: 2, params: "u16 *, u8" },
  { name: 'QuantizePixel_BlackAndWhite', ret: "u16", arity: 1, params: "u16 *" },
  { name: 'QuantizePixel_BlackOutline', ret: "u16", arity: 2, params: "u16 *, u16 *" },
  { name: 'QuantizePixel_Invert', ret: "u16", arity: 1, params: "u16 *" },
  { name: 'QuantizePixel_BlurHard', ret: "u16", arity: 3, params: "u16 *, u16 *, u16 *" },
  { name: 'QuantizePixel_MotionBlur', ret: "u16", arity: 2, params: "u16 *, u16 *" },
  { name: 'GetColorFromPersonality', ret: "u16", arity: 1, params: "u8" },
  { name: 'QuantizePalette_Standard', ret: "void", arity: 1, params: "bool8" },
  { name: 'SetPresetPalette_PrimaryColors', ret: "void", arity: 0, params: "void" },
  { name: 'QuantizePalette_PrimaryColors', ret: "void", arity: 0, params: "void" },
  { name: 'SetPresetPalette_Grayscale', ret: "void", arity: 0, params: "void" },
  { name: 'QuantizePalette_Grayscale', ret: "void", arity: 0, params: "void" },
  { name: 'SetPresetPalette_GrayscaleSmall', ret: "void", arity: 0, params: "void" },
  { name: 'QuantizePalette_GrayscaleSmall', ret: "void", arity: 0, params: "void" },
  { name: 'SetPresetPalette_BlackAndWhite', ret: "void", arity: 0, params: "void" },
  { name: 'QuantizePalette_BlackAndWhite', ret: "void", arity: 0, params: "void" },
  { name: 'QuantizePixel_Standard', ret: "u16", arity: 1, params: "u16 *" },
  { name: 'QuantizePixel_GrayscaleSmall', ret: "u16", arity: 1, params: "u16 *" },
  { name: 'QuantizePixel_Grayscale', ret: "u16", arity: 1, params: "u16 *" },
  { name: 'QuantizePixel_PrimaryColors', ret: "u16", arity: 1, params: "u16 *" },
  { name: 'ApplyImageProcessingEffects', ret: "void", arity: 1, params: "struct ImageProcessingContext *context" },
  { name: 'ConvertImageProcessingToGBA', ret: "void", arity: 1, params: "struct ImageProcessingContext *context" },
  { name: 'ApplyImageProcessingQuantization', ret: "void", arity: 1, params: "struct ImageProcessingContext *context" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'image_processing_effects.h',
  'contest_painting.h',
  'constants/rgb.h',
  'data/pointillism_points.h',
] as const;
