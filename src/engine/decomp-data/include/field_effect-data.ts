// AUTO-GENERATED from include/field_effect.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_effect.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FieldEffectStart', ret: "u32", arity: 1, params: "u8 id" },
  { name: 'FieldEffectActiveListContains', ret: "bool8", arity: 1, params: "u8 id" },
  { name: 'FieldEffectActiveListClear', ret: "void", arity: 0, params: "void" },
  { name: 'ReturnToFieldFromFlyMapSelect', ret: "void", arity: 0, params: "void" },
  { name: 'AddNewGameBirchObject', ret: "u8", arity: 3, params: "s16 x, s16 y, u8 subpriority" },
  { name: 'FieldEffectStop', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 id" },
  { name: 'CreateTrainerSprite', ret: "u8", arity: 5, params: "u8 trainerSpriteID, s16 x, s16 y, u8 subpriority, u8 *buffer" },
  { name: 'FldEff_TeleportWarpOut', ret: "void", arity: 0, params: "void" },
  { name: 'FieldEffectActiveListRemove', ret: "void", arity: 1, params: "u8 id" },
  { name: 'MultiplyInvertedPaletteRGBComponents', ret: "void", arity: 4, params: "u16 i, u8 r, u8 g, u8 b" },
  { name: 'FieldEffectActiveListAdd', ret: "void", arity: 1, params: "u8 id" },
  { name: 'FieldEffectScript_LoadTiles', ret: "void", arity: 1, params: "u8 **script" },
  { name: 'FieldEffectScript_LoadFadedPalette', ret: "void", arity: 1, params: "u8 **script" },
  { name: 'FieldEffectScript_LoadPalette', ret: "void", arity: 1, params: "u8 **script" },
  { name: 'FieldEffectScript_CallNative', ret: "void", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldEffectFreeTilesIfUnused', ret: "void", arity: 1, params: "u16 tileStart" },
  { name: 'FieldEffectFreePaletteIfUnused', ret: "void", arity: 1, params: "u8 paletteNum" },
  { name: 'FieldEffectCmd_loadtiles', ret: "bool8", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldEffectCmd_loadfadedpal', ret: "bool8", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldEffectCmd_loadpal', ret: "bool8", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldEffectCmd_callnative', ret: "bool8", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldEffectCmd_end', ret: "bool8", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldEffectCmd_loadgfx_callnative', ret: "bool8", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldEffectCmd_loadtiles_callnative', ret: "bool8", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldEffectCmd_loadfadedpal_callnative', ret: "bool8", arity: 2, params: "u8 **script, u32 *val" },
  { name: 'FieldCB_FallWarpExit', ret: "void", arity: 0, params: "void" },
  { name: 'StartEscalatorWarp', ret: "void", arity: 2, params: "u8 metatileBehavior, u8 priority" },
  { name: 'StartLavaridgeGymB1FWarp', ret: "void", arity: 1, params: "u8 priority" },
  { name: 'StartLavaridgeGym1FWarp', ret: "void", arity: 1, params: "u8 priority" },
  { name: 'SpriteCB_AshPuff', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_AshLaunch', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'MultiplyPaletteRGBComponents', ret: "void", arity: 4, params: "u16 i, u8 r, u8 g, u8 b" },
  { name: 'FreeResourcesAndDestroySprite', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 spriteId" },
  { name: 'CreateMonSprite_PicBox', ret: "u8", arity: 4, params: "u16 species, s16 x, s16 y, u8 subpriority" },
  { name: 'StartEscapeRopeFieldEffect', ret: "void", arity: 0, params: "void" },
] as const;
