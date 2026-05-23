// AUTO-GENERATED from src/mail_data.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mail_data.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const UNOWN_OFFSET = 30000;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearAllMail', ret: "void", arity: 0, params: "void" },
  { name: 'ClearMail', ret: "void", arity: 1, params: "struct Mail *mail" },
  { name: 'MonHasMail', ret: "bool8", arity: 1, params: "struct Pokemon *mon" },
  { name: 'GiveMailToMonByItemId', ret: "u8", arity: 2, params: "struct Pokemon *mon, u16 itemId" },
  { name: 'SpeciesToMailSpecies', ret: "u16", arity: 2, params: "u16 species, u32 personality" },
  { name: 'MailSpeciesToSpecies', ret: "u16", arity: 2, params: "u16 mailSpecies, u16 *buffer" },
  { name: 'GiveMailToMon', ret: "u8", arity: 2, params: "struct Pokemon *mon, struct Mail *mail" },
  { name: 'DummyMailFunc', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'TakeMailFromMon', ret: "void", arity: 1, params: "struct Pokemon *mon" },
  { name: 'ClearMailItemId', ret: "void", arity: 1, params: "u8 mailId" },
  { name: 'TakeMailFromMonAndSave', ret: "u8", arity: 1, params: "struct Pokemon *mon" },
  { name: 'ItemIsMail', ret: "bool8", arity: 1, params: "u16 itemId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'mail.h',
  'constants/items.h',
  'pokemon.h',
  'pokemon_icon.h',
  'text.h',
  'international_string_util.h',
] as const;
