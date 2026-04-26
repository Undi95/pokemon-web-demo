// AUTO-GENERATED from src/mystery_event_script.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mystery_event_script.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(1 << 9)` */
export const VERSION_MASK_EXPR = "(1 << 9)";
/** Raw expr: `data[0]` */
export const mScriptBase_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const mOffset_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const mStatus_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const mValid_EXPR = "data[3]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct ScriptContext", name: 'sMysteryEventScriptContext', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CheckCompatibility', ret: "bool32", arity: 4, params: "u16 unk0, u32 unk1, u16 unk2, u32 version" },
  { name: 'SetIncompatible', ret: "void", arity: 0, params: "void" },
  { name: 'InitMysteryEventScript', ret: "void", arity: 2, params: "struct ScriptContext *ctx, u8 *script" },
  { name: 'RunMysteryEventScriptCommand', ret: "bool32", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'InitMysteryEventScriptContext', ret: "void", arity: 1, params: "u8 *script" },
  { name: 'RunMysteryEventScriptContextCommand', ret: "bool32", arity: 1, params: "u32 *status" },
  { name: 'RunMysteryEventScript', ret: "u32", arity: 1, params: "u8 *script" },
  { name: 'SetMysteryEventScriptStatus', ret: "void", arity: 1, params: "u32 status" },
  { name: 'CalcRecordMixingGiftChecksum', ret: "int", arity: 0, params: "void" },
  { name: 'IsRecordMixingGiftValid', ret: "bool32", arity: 0, params: "void" },
  { name: 'ClearRecordMixingGift', ret: "void", arity: 0, params: "void" },
  { name: 'SetRecordMixingGift', ret: "void", arity: 3, params: "u8 unk, u8 quantity, u16 itemId" },
  { name: 'GetRecordMixingGift', ret: "u16", arity: 0, params: "void" },
  { name: 'MEScrCmd_end', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_checkcompat', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_nop', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_setstatus', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_setmsg', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_runscript', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_setenigmaberry', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_giveribbon', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_initramscript', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_givenationaldex', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_addrareword', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_setrecordmixinggift', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_givepokemon', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'StringCopyN', ret: "else", arity: 3, params: "gStringVar1, gText_Pokemon, POKEMON_NAME_LENGTH + 1" },
  { name: 'MEScrCmd_addtrainer', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_enableresetrtc', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_checksum', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'MEScrCmd_crc', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'berry.h',
  'battle_tower.h',
  'easy_chat.h',
  'event_data.h',
  'mail.h',
  'mystery_event_script.h',
  'pokedex.h',
  'pokemon.h',
  'give_gift_ribbon_to_party.h',
  'script.h',
  'strings.h',
  'string_util.h',
  'text.h',
  'util.h',
  'mystery_event_msg.h',
  'pokemon_storage_system.h',
] as const;
