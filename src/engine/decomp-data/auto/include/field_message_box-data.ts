// AUTO-GENERATED from include/field_message_box.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_message_box.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_FIELD_0 = {
  FIELD_MESSAGE_BOX_HIDDEN: 0,
  FIELD_MESSAGE_BOX_UNUSED: 1,
  FIELD_MESSAGE_BOX_NORMAL: 2,
  FIELD_MESSAGE_BOX_AUTO_SCROLL: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ShowFieldMessage', ret: "bool8", arity: 1, params: "const u8 *str" },
  { name: 'ShowPokenavFieldMessage', ret: "bool8", arity: 1, params: "const u8 *str" },
  { name: 'ShowFieldMessageFromBuffer', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowFieldAutoScrollMessage', ret: "bool8", arity: 1, params: "const u8 *str" },
  { name: 'HideFieldMessageBox', ret: "void", arity: 0, params: "void" },
  { name: 'IsFieldMessageBoxHidden', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetFieldMessageBoxMode', ret: "u8", arity: 0, params: "void" },
  { name: 'StopFieldMessage', ret: "void", arity: 0, params: "void" },
  { name: 'InitFieldMessageBox', ret: "void", arity: 0, params: "void" },
] as const;
