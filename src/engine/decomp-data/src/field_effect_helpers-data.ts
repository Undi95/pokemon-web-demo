// AUTO-GENERATED from src/field_effect_helpers.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_effect_helpers.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const OBJ_EVENT_PAL_TAG_NONE = 4607;
/** Raw expr: `data[0]` */
export const sJumpElevation_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sJumpFldEff_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sWaitFldEff_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sReflectionObjEventId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sReflectionObjEventLocalId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sReflectionVerticalOffset_EXPR = "data[2]";
/** Raw expr: `data[7]` */
export const sIsStillReflection_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sPrevX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sPrevY_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sLocalId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sMapNum_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sMapGroup_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sYOffset_EXPR = "data[3]";
/** Raw expr: `data[0]` */
export const sElevation_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sY_EXPR = "data[2]";
/** Raw expr: `data[5]` */
export const sCurrentMap_EXPR = "data[5]";
/** Raw expr: `data[7]` */
export const sObjectMoved_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTimer_EXPR = "data[1]";
/** Raw expr: `data[7]` */
export const sFldEff_EXPR = "data[7]";
/** Raw expr: `data[3]` */
export const sMetatileId_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sDelay_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const sBitfield_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sPlayerOffset_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sPlayerObjId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sVelocity_EXPR = "data[3]";
/** Raw expr: `data[5]` */
export const sIntervalIdx_EXPR = "data[5]";
/** Raw expr: `data[0]` */
export const sSpriteId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sBobY_EXPR = "data[1]";
/** Raw expr: `data[7]` */
export const sReadyToEnd_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sFinished_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sEndTimer_EXPR = "data[1]";
/** Raw expr: `data[1]` */
export const sMoveTimer_EXPR = "data[1]";
/** Raw expr: `data[4]` */
export const sStartY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sCounter_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sAnimCounter_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sAnimState_EXPR = "data[7]";

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const gShadowVerticalOffsets: readonly number[] = [4,4,4,16] as const;
export const intervals: readonly number[] = [3,7] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const gFadeFootprintsTireTracksFuncs = ['FadeFootprintsTireTracks_Step0', 'FadeFootprintsTireTracks_Step1'] as const;
export const gAshFieldEffectFuncs = ['UpdateAshFieldEffect_Wait', 'UpdateAshFieldEffect_Show', 'UpdateAshFieldEffect_End'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'UpdateObjectReflectionSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'LoadObjectReflectionPalette', ret: "void", arity: 2, params: "struct ObjectEvent *objectEvent, struct Sprite *sprite" },
  { name: 'LoadObjectHighBridgeReflectionPalette', ret: "void", arity: 2, params: "struct ObjectEvent *, u8" },
  { name: 'LoadObjectRegularReflectionPalette', ret: "void", arity: 2, params: "struct ObjectEvent *, u8" },
  { name: 'UpdateGrassFieldEffectSubpriority', ret: "void", arity: 3, params: "struct Sprite *, u8, u8" },
  { name: 'FadeFootprintsTireTracks_Step0', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'FadeFootprintsTireTracks_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateFeetInFlowingWaterFieldEffect', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateAshFieldEffect_Wait', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateAshFieldEffect_Show', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateAshFieldEffect_End', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SynchronizeSurfAnim', ret: "void", arity: 2, params: "struct ObjectEvent *, struct Sprite *" },
  { name: 'SynchronizeSurfPosition', ret: "void", arity: 2, params: "struct ObjectEvent *, struct Sprite *" },
  { name: 'UpdateBobbingEffect', ret: "void", arity: 3, params: "struct ObjectEvent *, struct Sprite *, struct Sprite *" },
  { name: 'SpriteCB_UnderwaterSurfBlob', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'ShowDisguiseFieldEffect', ret: "u32", arity: 3, params: "u8, u8, u8" },
  { name: 'SetUpReflection', ret: "void", arity: 3, params: "struct ObjectEvent *objectEvent, struct Sprite *sprite, bool8 stillReflection" },
  { name: 'GetReflectionVerticalOffset', ret: "s16", arity: 1, params: "struct ObjectEvent *objectEvent" },
  { name: 'CreateWarpArrowSprite', ret: "u8", arity: 0, params: "void" },
  { name: 'SetSpriteInvisible', ret: "void", arity: 1, params: "u8 spriteId" },
  { name: 'ShowWarpArrowSprite', ret: "void", arity: 4, params: "u8 spriteId, u8 direction, s16 x, s16 y" },
  { name: 'FldEff_Shadow', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateShadowFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_TallGrass', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateTallGrassFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_JumpTallGrass', ret: "u32", arity: 0, params: "void" },
  { name: 'FindTallGrassFieldEffectSpriteId', ret: "u8", arity: 5, params: "u8 localId, u8 mapNum, u8 mapGroup, s16 x, s16 y" },
  { name: 'FldEff_LongGrass', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateLongGrassFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_JumpLongGrass', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_ShortGrass', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateShortGrassFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_SandFootprints', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_DeepSandFootprints', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_BikeTireTracks', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateFootprintsTireTracksFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_Splash', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateSplashFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_JumpSmallSplash', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_JumpBigSplash', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_FeetInFlowingWater', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_Ripple', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_HotSpringsWater', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateHotSpringsWaterFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_UnusedGrass', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_UnusedGrass2', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_UnusedSand', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_WaterSurfacing', ret: "u32", arity: 0, params: "void" },
  { name: 'StartAshFieldEffect', ret: "void", arity: 4, params: "s16 x, s16 y, u16 metatileId, s16 delay" },
  { name: 'FldEff_Ash', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateAshFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_SurfBlob', ret: "u32", arity: 0, params: "void" },
  { name: 'SetSurfBlob_BobState', ret: "void", arity: 2, params: "u8 spriteId, u8 state" },
  { name: 'SetSurfBlob_DontSyncAnim', ret: "void", arity: 2, params: "u8 spriteId, bool8 dontSync" },
  { name: 'SetSurfBlob_PlayerOffset', ret: "void", arity: 3, params: "u8 spriteId, bool8 hasOffset, s16 offset" },
  { name: 'GetSurfBlob_BobState', ret: "u8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetSurfBlob_DontSyncAnim', ret: "u8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetSurfBlob_HasPlayerOffset', ret: "u8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateSurfBlobFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'StartUnderwaterSurfBlobBobbing', ret: "u8", arity: 1, params: "u8 blobSpriteId" },
  { name: 'FldEff_Dust', ret: "u32", arity: 0, params: "void" },
  { name: 'FldEff_SandPile', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateSandPileFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_Bubbles', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateBubblesFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FldEff_BerryTreeGrowthSparkle', ret: "u32", arity: 0, params: "void" },
  { name: 'ShowTreeDisguiseFieldEffect', ret: "u32", arity: 0, params: "void" },
  { name: 'ShowMountainDisguiseFieldEffect', ret: "u32", arity: 0, params: "void" },
  { name: 'ShowSandDisguiseFieldEffect', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateDisguiseFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'StartRevealDisguise', ret: "void", arity: 1, params: "struct ObjectEvent *objectEvent" },
  { name: 'UpdateRevealDisguise', ret: "bool8", arity: 1, params: "struct ObjectEvent *objectEvent" },
  { name: 'FldEff_Sparkle', ret: "u32", arity: 0, params: "void" },
  { name: 'UpdateSparkleFieldEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitRayquazaForFigure8Anim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimateRayquazaInFigure8', ret: "bool8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateRayquazaSpotlightEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateJumpImpactEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'WaitFieldEffectSpriteAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateObjectEventSpriteInvisibility', ret: "else", arity: 2, params: "sprite, FALSE" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_object_movement.h',
  'field_camera.h',
  'field_effect.h',
  'field_effect_helpers.h',
  'field_weather.h',
  'fieldmap.h',
  'gpu_regs.h',
  'metatile_behavior.h',
  'sound.h',
  'sprite.h',
  'trig.h',
  'constants/field_effects.h',
  'constants/songs.h',
] as const;
