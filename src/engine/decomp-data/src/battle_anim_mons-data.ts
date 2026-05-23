// AUTO-GENERATED from src/battle_anim_mons.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_mons.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_MOVE_EFFECT_MON_1 = 55125;
export const TAG_MOVE_EFFECT_MON_2 = 55126;
/** Raw expr: `data[0]` */
export const sCirclePos_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sAmplitude_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sCircleSpeed_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sDuration_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sAmplitudeSpeed_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sAmplitudeChange_EXPR = "data[5]";
/** Raw expr: `sAmplitude` */
export const sAmplitudeX_EXPR = "sAmplitude";
/** Raw expr: `data[4]` */
export const sAmplitudeY_EXPR = "data[4]";
/** Raw expr: `sCirclePos` */
export const sCirclePosX_EXPR = "sCirclePos";
/** Raw expr: `sCircleSpeed` */
export const sCircleSpeedX_EXPR = "sCircleSpeed";
/** Raw expr: `data[4]` */
export const sCirclePosY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sCircleSpeedY_EXPR = "data[5]";
/** Raw expr: `data[0]` */
export const sStepsX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sStartX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sTargetX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sStartY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sTargetY_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const sMoveSteps_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sSpeedX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSpeedY_EXPR = "data[2]";
export const BG_ANIM_PAL_1 = 8;
export const BG_ANIM_PAL_2 = 9;
export const BG_ANIM_PAL_CONTEST = 14;
/** Raw expr: `data[0]` */
export const tBattlerSpriteId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMoveSpeed_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tState_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tCounter_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tPaletteNum_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tNumTracesActive_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tPriority_EXPR = "data[6]";
/** Raw expr: `data[0]` */
export const sActiveTime_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTaskId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSpriteId_EXPR = "data[2]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplates_MoveEffectMons = [
  { tileTag: "TAG_MOVE_EFFECT_MON_1", paletteTag: "TAG_MOVE_EFFECT_MON_1", oam: "&gOamData_AffineNormal_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_MOVE_EFFECT_MON_2", paletteTag: "TAG_MOVE_EFFECT_MON_2", oam: "&gOamData_AffineNormal_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimTranslateLinear_WithFollowup_SetCornerVecX', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimFastTranslateLinearWaitEnd', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimThrowProjectile_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimBattlerTrace', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimWeatherBallUp_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetBattlerYDeltaFromSpriteId', ret: "u16", arity: 1, params: "u8 spriteId" },
  { name: 'AnimTask_BlendPalInAndOutSetup', ret: "void", arity: 1, params: "struct Task *task" },
  { name: 'AnimTask_AlphaFadeIn_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_AttackerPunchWithTrace_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BlendMonInAndOut_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShouldRotScaleSpeciesBeFlipped', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateBattlerTrace', ret: "void", arity: 2, params: "struct Task *task, u8 taskId" },
  { name: 'GetBattlerSpriteCoord', ret: "u8", arity: 2, params: "u8 battler, u8 coordType" },
  { name: 'GetBattlerYDelta', ret: "u8", arity: 2, params: "u8 battler, u16 species" },
  { name: 'GetBattlerElevation', ret: "u8", arity: 2, params: "u8 battler, u16 species" },
  { name: 'GetBattlerSpriteFinal_Y', ret: "u8", arity: 3, params: "u8 battler, u16 species, bool8 a3" },
  { name: 'GetBattlerSpriteCoord2', ret: "u8", arity: 2, params: "u8 battler, u8 coordType" },
  { name: 'GetBattlerSpriteDefault_Y', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetSubstituteSpriteDefault_Y', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetBattlerYCoordWithElevation', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetAnimBattlerSpriteId', ret: "u8", arity: 1, params: "u8 animBattler" },
  { name: 'SetCallbackToStoredInData6', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteInCircle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteInGrowingCircle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteInLissajousCurve', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteInEllipse', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'WaitAnimForDuration', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimPosToTranslateLinear', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ConvertPosDataToTranslateLinearData', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteLinear', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteLinearFixedPoint', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteLinearFixedPointIconFrame', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteToBattleTargetPos', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteLinearById', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteLinearByIdFixedPoint', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteLinearAndFlicker', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroySpriteAndMatrix', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateSpriteToBattleAttackerPos', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'EndUnkPaletteAnim', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'RunStoredCallbackWhenAffineAnimEnds', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'RunStoredCallbackWhenAnimEnds', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroyAnimSpriteAndDisableBlend', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroyAnimVisualTaskAndDisableBlend', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetSpriteCoordsToAnimAttackerCoords', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetAnimSpriteInitialXOffset', ret: "void", arity: 2, params: "struct Sprite *sprite, s16 xOffset" },
  { name: 'InitAnimArcTranslation', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateAnimHorizontalArc', ret: "bool8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateAnimVerticalArc', ret: "bool8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetSpritePrimaryCoordsFromSecondaryCoords', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitSpritePosToAnimTarget', ret: "void", arity: 2, params: "struct Sprite *sprite, bool8 respectMonPicOffsets" },
  { name: 'InitSpritePosToAnimAttacker', ret: "void", arity: 2, params: "struct Sprite *sprite, bool8 respectMonPicOffsets" },
  { name: 'GetBattlerSide', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetBattlerPosition', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetBattlerAtPosition', ret: "u8", arity: 1, params: "u8 position" },
  { name: 'IsBattlerSpritePresent', ret: "bool8", arity: 1, params: "u8 battler" },
  { name: 'IsDoubleBattle', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetBattleAnimBg1Data', ret: "void", arity: 1, params: "struct BattleAnimBgData *out" },
  { name: 'GetBattleAnimBgData', ret: "void", arity: 2, params: "struct BattleAnimBgData *out, u32 bgId" },
  { name: 'GetBgDataForTransform', ret: "void", arity: 2, params: "struct BattleAnimBgData *out, u8 battler" },
  { name: 'ClearBattleAnimBg', ret: "void", arity: 1, params: "u32 bgId" },
  { name: 'AnimLoadCompressedBgGfx', ret: "void", arity: 3, params: "u32 bgId, const u32 *src, u32 tilesOffset" },
  { name: 'InitAnimBgTilemapBuffer', ret: "void", arity: 2, params: "u32 bgId, const void *src" },
  { name: 'AnimLoadCompressedBgTilemap', ret: "void", arity: 2, params: "u32 bgId, const void *src" },
  { name: 'AnimLoadCompressedBgTilemapHandleContest', ret: "void", arity: 3, params: "struct BattleAnimBgData *data, const void *src, bool32 largeScreen" },
  { name: 'GetBattleBgPaletteNum', ret: "u8", arity: 0, params: "void" },
  { name: 'UpdateAnimBg3ScreenSize', ret: "void", arity: 1, params: "bool8 largeScreenSize" },
  { name: 'Trade_MoveSelectedMonToTarget', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitSpriteDataForLinearTranslation', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitAnimLinearTranslation', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'StartAnimLinearTranslation', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'StartAnimLinearTranslation_SetCornerVecX', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTranslateLinear', ret: "bool8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTranslateLinear_WithFollowup', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitAnimLinearTranslationWithSpeed', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitAnimLinearTranslationWithSpeedAndPos', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitAnimFastLinearTranslation', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitAndRunAnimFastLinearTranslation', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimFastTranslateLinear', ret: "bool8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitAnimFastLinearTranslationWithSpeed', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitAnimFastLinearTranslationWithSpeedAndPos', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetSpriteRotScale', ret: "void", arity: 4, params: "u8 spriteId, s16 xScale, s16 yScale, u16 rotation" },
  { name: 'PrepareBattlerSpriteForRotScale', ret: "void", arity: 2, params: "u8 spriteId, u8 objMode" },
  { name: 'ResetSpriteRotScale', ret: "void", arity: 1, params: "u8 spriteId" },
  { name: 'SetBattlerSpriteYOffsetFromRotation', ret: "void", arity: 1, params: "u8 spriteId" },
  { name: 'TrySetSpriteRotScale', ret: "void", arity: 5, params: "struct Sprite *sprite, bool8 recalcCenterVector, s16 xScale, s16 yScale, u16 rotation" },
  { name: 'ResetSpriteRotScale_PreserveAffine', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ArcTan2_', ret: "u16", arity: 2, params: "s16 x, s16 y" },
  { name: 'ArcTan2Neg', ret: "u16", arity: 2, params: "s16 x, s16 y" },
  { name: 'SetGrayscaleOrOriginalPalette', ret: "void", arity: 2, params: "u16 paletteNum, bool8 restoreOriginalColor" },
  { name: 'GetBattlePalettesMask', ret: "u32", arity: 7, params: "bool8 battleBackground, bool8 attacker, bool8 target, bool8 attackerPartner, bool8 targetPartner, bool8 anim1, bool8 anim2" },
  { name: 'GetBattleMonSpritePalettesMask', ret: "u32", arity: 4, params: "u8 playerLeft, u8 playerRight, u8 opponentLeft, u8 opponentRight" },
  { name: 'GetSpritePalIdxByBattler', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetSpritePalIdxByPosition', ret: "UNUSED", arity: 1, params: "u8 position" },
  { name: 'AnimSpriteOnMonPos', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TranslateAnimSpriteToTargetMonLocation', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimThrowProjectile', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTravelDiagonally', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CloneBattlerSpriteWithBlend', ret: "s16", arity: 1, params: "u8 animBattler" },
  { name: 'DestroySpriteWithActiveSheet', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_AlphaFadeIn', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BlendMonInAndOut', ret: "void", arity: 1, params: "u8 task" },
  { name: 'AnimTask_BlendPalInAndOutByTag', ret: "void", arity: 1, params: "u8 task" },
  { name: 'PrepareAffineAnimInTaskData', ret: "void", arity: 3, params: "struct Task *task, u8 spriteId, const union AffineAnimCmd *affineAnimCmds" },
  { name: 'RunAffineAnimFromTaskData', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'SetBattlerSpriteYOffsetFromYScale', ret: "void", arity: 1, params: "u8 spriteId" },
  { name: 'SetBattlerSpriteYOffsetFromOtherYScale', ret: "void", arity: 2, params: "u8 spriteId, u8 otherSpriteId" },
  { name: 'StorePointerInVars', ret: "void", arity: 3, params: "s16 *lo, s16 *hi, const void *ptr" },
  { name: 'PrepareEruptAnimTaskData', ret: "void", arity: 7, params: "struct Task *task, u8 spriteId, s16 xScaleStart, s16 yScaleStart, s16 xScaleEnd, s16 yScaleEnd, u16 duration" },
  { name: 'UpdateEruptAnimTask', ret: "u8", arity: 1, params: "struct Task *task" },
  { name: 'AnimTask_GetFrustrationPowerLevel', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetPriorityForVisibleBattlers', ret: "UNUSED", arity: 1, params: "u8 priority" },
  { name: 'InitPrioritiesForVisibleBattlers', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattlerSpriteSubpriority', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetBattlerSpriteBGPriority', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetBattlerSpriteBGPriorityRank', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'CreateAdditionalMonSpriteForMoveAnim', ret: "u8", arity: 10, params: "u16 species, bool8 isBackpic, u8 id, s16 x, s16 y, u8 subpriority, u32 personality, u32 trainerId, u32 battler, bool32 ignoreDeoxysForm" },
  { name: 'LoadSpecialPokePic_2', ret: "else", arity: 5, params: "&gMonFrontPicTable[species],\n                                 gMonSpritesGfxPtr->buffer,\n                                 species,\n                                 personality,\n                                 TRUE" },
  { name: 'DestroySpriteAndFreeResources_', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetBattlerSpriteCoordAttr', ret: "s16", arity: 2, params: "u8 battler, u8 attr" },
  { name: 'SetAverageBattlerPositions', ret: "void", arity: 4, params: "u8 battler, bool8 respectMonPicOffsets, s16 *x, s16 *y" },
  { name: 'CreateInvisibleSpriteCopy', ret: "u8", arity: 3, params: "int battler, u8 spriteId, int species" },
  { name: 'AnimTranslateLinearAndFlicker_Flipped', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTranslateLinearAndFlicker', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimSpinningSparkle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_AttackerPunchWithTrace', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimWeatherBallUp', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimWeatherBallDown', ret: "void", arity: 1, params: "struct Sprite *sprite" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'bg.h',
  'contest.h',
  'data.h',
  'decompress.h',
  'dma3.h',
  'gpu_regs.h',
  'malloc.h',
  'palette.h',
  'pokemon_icon.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'util.h',
  'constants/battle_anim.h',
] as const;
