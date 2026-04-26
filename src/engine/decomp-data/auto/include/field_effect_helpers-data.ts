// AUTO-GENERATED from include/field_effect_helpers.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_effect_helpers.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BOB_0 = {
  BOB_NONE: 0,
  BOB_PLAYER_AND_MON: 1,
  BOB_JUST_MON: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateWarpArrowSprite', ret: "u8", arity: 0, params: "void" },
  { name: 'StartUnderwaterSurfBlobBobbing', ret: "u8", arity: 1, params: "u8 blobSpriteId" },
  { name: 'SetSurfBlob_BobState', ret: "void", arity: 2, params: "u8 spriteId, u8 state" },
  { name: 'SetSurfBlob_DontSyncAnim', ret: "void", arity: 2, params: "u8 spriteId, bool8 dontSync" },
  { name: 'SetSurfBlob_PlayerOffset', ret: "void", arity: 3, params: "u8 spriteId, bool8 hasOffset, s16 offset" },
  { name: 'UpdateRevealDisguise', ret: "bool8", arity: 1, params: "struct ObjectEvent *objectEvent" },
  { name: 'StartRevealDisguise', ret: "void", arity: 1, params: "struct ObjectEvent *objectEvent" },
  { name: 'StartAshFieldEffect', ret: "void", arity: 4, params: "s16 x, s16 y, u16 metatileId, s16 delay" },
  { name: 'SetUpReflection', ret: "void", arity: 3, params: "struct ObjectEvent *objectEvent, struct Sprite *sprite, bool8 stillReflection" },
  { name: 'StartFieldEffectForObjectEvent', ret: "u32", arity: 2, params: "u8 fieldEffectId, struct ObjectEvent *objectEvent" },
  { name: 'FindTallGrassFieldEffectSpriteId', ret: "u8", arity: 5, params: "u8 localId, u8 mapNum, u8 mapGroup, s16 x, s16 y" },
  { name: 'UpdateRayquazaSpotlightEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateShadowFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateTallGrassFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'WaitFieldEffectSpriteAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateAshFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateSurfBlobFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateJumpImpactEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateFootprintsTireTracksFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateSplashFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateLongGrassFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateSandPileFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateDisguiseFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateShortGrassFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateHotSpringsWaterFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateBubblesFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateSparkleFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetSpriteInvisible', ret: "void", arity: 1, params: "u8 spriteId" },
  { name: 'ShowWarpArrowSprite', ret: "void", arity: 4, params: "u8 spriteId, u8 direction, s16 x, s16 y" },
] as const;
