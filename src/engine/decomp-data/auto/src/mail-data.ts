// AUTO-GENERATED from src/mail.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mail.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_ICON_0 = {
  ICON_TYPE_NONE: 0,
  ICON_TYPE_BEAD: 1,
  ICON_TYPE_DREAM: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = { bg: 0, tilemapLeft: 2, tilemapTop: 3, width: 26, height: 15, paletteNum: 15, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, priority: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, priority: 1 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, priority: 2 },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_InitMailRead', ret: "void", arity: 0, params: "void" },
  { name: 'BufferMailText', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMailText', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_MailRead', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_MailRead', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_WaitForPaletteExitOnKeyPress', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ExitOnKeyPress', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ExitMailReadFreeVars', ret: "void", arity: 0, params: "void" },
  { name: 'ReadMail', ret: "void", arity: 3, params: "struct Mail *mail, MainCallback exitCallback, bool8 hasText" },
  { name: 'MailReadBuildGraphics', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ExitMailReadFreeVars',
  'CB2_ExitOnKeyPress',
  'CB2_InitMailRead',
  'CB2_MailRead',
  'CB2_WaitForPaletteExitOnKeyPress',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'mail.h',
  'constants/items.h',
  'overworld.h',
  'task.h',
  'scanline_effect.h',
  'palette.h',
  'text.h',
  'menu.h',
  'menu_helpers.h',
  'text_window.h',
  'string_util.h',
  'international_string_util.h',
  'strings.h',
  'gpu_regs.h',
  'bg.h',
  'pokemon_icon.h',
  'malloc.h',
  'easy_chat.h',
  'graphics.h',
  'constants/rgb.h',
] as const;
