// AUTO-GENERATED from src/braille.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/braille.c
// Generated: 2026-04-26

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sFont_Braille': { path: 'graphics/fonts/braille.png', ext: '.fwjpnfont', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DecompressGlyph_Braille', ret: "void", arity: 1, params: "u16" },
  { name: 'FontFunc_Braille', ret: "u16", arity: 1, params: "struct TextPrinter *textPrinter" },
  { name: 'GetGlyphWidth_Braille', ret: "u32", arity: 2, params: "u16 glyphId, bool32 isJapanese" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'window.h',
  'text.h',
  'sound.h',
] as const;
