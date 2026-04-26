// AUTO-GENERATED from src/rayquaza_scene.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/rayquaza_scene.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_DUOFIGHT_GROUDON = 30505;
export const TAG_DUOFIGHT_GROUDON_SHOULDER = 30506;
export const TAG_DUOFIGHT_GROUDON_CLAW = 30507;
export const TAG_DUOFIGHT_KYOGRE = 30508;
export const TAG_DUOFIGHT_KYOGRE_PECTORAL_FIN = 30509;
export const TAG_DUOFIGHT_KYOGRE_DORSAL_FIN = 30510;
export const TAG_FLIGHT_SMOKE = 30555;
export const TAG_DESCENDS_RAYQUAZA = 30556;
export const TAG_DESCENDS_RAYQUAZA_TAIL = 30557;
export const TAG_CHASE_GROUDON = 30565;
export const TAG_CHASE_GROUDON_TAIL = 30566;
export const TAG_CHASE_KYOGRE = 30568;
export const TAG_CHASE_RAYQUAZA = 30569;
export const TAG_CHASE_RAYQUAZA_TAIL = 30570;
export const TAG_CHASE_SPLASH = 30571;
export const MAX_SMOKE = 10;
/** Raw expr: `data[0]` */
export const tTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tHelperTaskId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tGroudonSpriteId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tKyogreSpriteId_EXPR = "data[3]";
/** Raw expr: `data[0]` */
export const sGroudonBodySpriteId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sGroudonShoulderSpriteId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sGroudonClawSpriteId_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const tScale_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tScaleSpeed_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tYCoord_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tYSpeed_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tYOffset_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tYOffsetDir_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tSmokeId_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sSmokeId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTimer_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sTailSpriteId_EXPR = "data[0]";
/** Raw expr: `data[3]` */
export const sXMovePeriod_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sYMovePeriod_EXPR = "data[4]";
/** Raw expr: `data[2]` */
export const tRayquazaTaskId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tSoundTimer_EXPR = "data[3]";
/** Raw expr: `data[1]` */
export const tOffset_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tShakeDir_EXPR = "data[2]";
/** Raw expr: `data[2]` */
export const tBgTaskId_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const tBlendHi_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBlendLo_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBlendHiDir_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tBlendLoDir_EXPR = "data[4]";
/** Raw expr: `taskData[5]` */
export const tRayquazaSpriteId_EXPR = "taskData[5]";
/** Raw expr: `data[0]` */
export const sBodyPartSpriteId1_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sBodyPartSpriteId2_EXPR = "data[1]";
/** Raw expr: `data[5]` */
export const sDecel_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sSpeed_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sIsKyogre_EXPR = "data[7]";
/** Raw expr: `data[4]` */
export const sYOffset_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sYOffsetDir_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sFloatTimer_EXPR = "data[6]";
/** Raw expr: `data[4]` */
export const sTailFloatDelay_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sTailFloatPeak_EXPR = "data[5]";
/** Raw expr: `data[2]` */
export const tNumRings_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tScaleTimer_EXPR = "data[3]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_RAY_0 = {
  RAY_ANIM_DUO_FIGHT_PRE: 0,
  RAY_ANIM_DUO_FIGHT: 1,
  RAY_ANIM_TAKES_FLIGHT: 2,
  RAY_ANIM_DESCENDS: 3,
  RAY_ANIM_CHARGES: 4,
  RAY_ANIM_CHASES_AWAY: 5,
  RAY_ANIM_END: 6,
} as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates_DuoFight = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;
export const sBgTemplates_TakesFlight = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 29, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;
export const sBgTemplates_Descends = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 1, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;
export const sBgTemplates_Charges = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;
export const sBgTemplates_ChasesAway = [
  { bg: 0, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_64x64 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_32x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_64x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_32x16 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_16x8 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x8)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_16x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x32)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_16x16 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_32x8 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_DuoFightPre_Groudon = { tileTag: "TAG_DUOFIGHT_GROUDON", paletteTag: "TAG_DUOFIGHT_GROUDON", oam: "&sOam_64x64", anims: "sAnims_DuoFightPre_Groudon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFightPre_GroudonShoulder = { tileTag: "TAG_DUOFIGHT_GROUDON_SHOULDER", paletteTag: "TAG_DUOFIGHT_GROUDON", oam: "&sOam_32x32", anims: "sAnims_DuoFightPre_GroudonShoulderKyogreDorsalFin", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFightPre_GroudonClaw = { tileTag: "TAG_DUOFIGHT_GROUDON_CLAW", paletteTag: "TAG_DUOFIGHT_GROUDON", oam: "&sOam_64x32", anims: "sAnims_DuoFightPre_GroudonClaw", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFightPre_Kyogre = { tileTag: "TAG_DUOFIGHT_KYOGRE", paletteTag: "TAG_DUOFIGHT_KYOGRE", oam: "&sOam_32x16", anims: "sAnims_DuoFightPre_Kyogre", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFightPre_KyogrePectoralFin = { tileTag: "TAG_DUOFIGHT_KYOGRE_PECTORAL_FIN", paletteTag: "TAG_DUOFIGHT_KYOGRE", oam: "&sOam_16x8", anims: "sAnims_DuoFightPre_KyogrePectoralFin", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFightPre_KyogreDorsalFin = { tileTag: "TAG_DUOFIGHT_KYOGRE_DORSAL_FIN", paletteTag: "TAG_DUOFIGHT_KYOGRE", oam: "&sOam_32x32", anims: "sAnims_DuoFightPre_GroudonShoulderKyogreDorsalFin", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFight_Groudon = { tileTag: "TAG_DUOFIGHT_GROUDON", paletteTag: "TAG_DUOFIGHT_GROUDON", oam: "&sOam_64x64", anims: "sAnims_DuoFight_Groudon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFight_GroudonShoulder = { tileTag: "TAG_DUOFIGHT_GROUDON_SHOULDER", paletteTag: "TAG_DUOFIGHT_GROUDON", oam: "&sOam_32x32", anims: "sAnims_DuoFight_GroudonShoulderKyogreDorsalFin", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFight_GroudonClaw = { tileTag: "TAG_DUOFIGHT_GROUDON_CLAW", paletteTag: "TAG_DUOFIGHT_GROUDON", oam: "&sOam_64x32", anims: "sAnims_DuoFight_GroudonClaw", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFight_Kyogre = { tileTag: "TAG_DUOFIGHT_KYOGRE", paletteTag: "TAG_DUOFIGHT_KYOGRE", oam: "&sOam_32x16", anims: "sAnims_DuoFight_Kyogre", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFight_KyogrePectoralFin = { tileTag: "TAG_DUOFIGHT_KYOGRE_PECTORAL_FIN", paletteTag: "TAG_DUOFIGHT_KYOGRE", oam: "&sOam_16x8", anims: "sAnims_DuoFight_KyogrePectoralFin", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DuoFight_KyogreDorsalFin = { tileTag: "TAG_DUOFIGHT_KYOGRE_DORSAL_FIN", paletteTag: "TAG_DUOFIGHT_KYOGRE", oam: "&sOam_32x32", anims: "sAnims_DuoFight_GroudonShoulderKyogreDorsalFin", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_TakesFlight_Smoke = { tileTag: "TAG_FLIGHT_SMOKE", paletteTag: "TAG_FLIGHT_SMOKE", oam: "&sOam_32x16", anims: "sAnims_TakesFlight_Smoke", images: 0, affineAnims: "sAffineAnims_TakesFlight_Smoke", callback: "SpriteCB_TakesFlight_Smoke" } as const;
export const sSpriteTemplate_Descends_Rayquaza = { tileTag: "TAG_DESCENDS_RAYQUAZA", paletteTag: "TAG_DESCENDS_RAYQUAZA", oam: "&sOam_64x64", anims: "sAnims_Descends_Rayquaza", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Descends_RayquazaTail = { tileTag: "TAG_DESCENDS_RAYQUAZA_TAIL", paletteTag: "TAG_DESCENDS_RAYQUAZA", oam: "&sOam_16x32", anims: "sAnims_Descends_RayquazaTail", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ChasesAway_Groudon = { tileTag: "TAG_CHASE_GROUDON", paletteTag: "TAG_CHASE_GROUDON", oam: "&sOam_64x64", anims: "sAnims_ChasesAway_Groudon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ChasesAway_GroudonTail = { tileTag: "TAG_CHASE_GROUDON_TAIL", paletteTag: "TAG_CHASE_GROUDON", oam: "&sOam_16x16", anims: "sAnims_ChasesAway_GroudonTail", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ChasesAway_Kyogre = { tileTag: "TAG_CHASE_KYOGRE", paletteTag: "TAG_CHASE_KYOGRE", oam: "&sOam_32x32", anims: "sAnims_ChasesAway_Kyogre", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ChasesAway_Rayquaza = { tileTag: "TAG_CHASE_RAYQUAZA", paletteTag: "TAG_CHASE_RAYQUAZA", oam: "&sOam_64x64", anims: "sAnims_ChasesAway_Rayquaza", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ChasesAway_Rayquaza" } as const;
export const sSpriteTemplate_ChasesAway_RayquazaTail = { tileTag: "TAG_CHASE_RAYQUAZA_TAIL", paletteTag: "TAG_CHASE_RAYQUAZA", oam: "&sOam_32x32", anims: "sAnims_ChasesAway_RayquazaTail", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ChasesAway_KyogreSplash = { tileTag: "TAG_CHASE_SPLASH", paletteTag: "TAG_CHASE_SPLASH", oam: "&sOam_32x8", anims: "sAnims_ChasesAway_KyogreSplash", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_InitRayquazaScene', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_RayquazaScene', ret: "void", arity: 0, params: "void" },
  { name: 'Task_EndAfterFadeScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DuoFightAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleDuoFight', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DuoFightEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'DuoFightEnd', ret: "void", arity: 2, params: "u8, s8" },
  { name: 'Task_DuoFight_AnimateClouds', ret: "void", arity: 1, params: "u8" },
  { name: 'DuoFight_PanOffScene', ret: "void", arity: 1, params: "u8" },
  { name: 'DuoFight_AnimateRain', ret: "void", arity: 0, params: "void" },
  { name: 'DuoFight_Lightning1', ret: "void", arity: 0, params: "void" },
  { name: 'DuoFight_Lightning2', ret: "void", arity: 0, params: "void" },
  { name: 'DuoFight_LightningLong', ret: "void", arity: 0, params: "void" },
  { name: 'DuoFightPre_CreateGroudonSprites', ret: "u8", arity: 0, params: "void" },
  { name: 'DuoFightPre_CreateKyogreSprites', ret: "u8", arity: 0, params: "void" },
  { name: 'DuoFight_CreateGroudonSprites', ret: "u8", arity: 0, params: "void" },
  { name: 'DuoFight_CreateKyogreSprites', ret: "u8", arity: 0, params: "void" },
  { name: 'SpriteCB_DuoFightPre_Groudon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DuoFightPre_Kyogre', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DuoFight_Groudon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DuoFight_Kyogre', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DuoFight_SlideGroudonDown', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DuoFight_SlideKyogreDown', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_RayTakesFlightAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleRayTakesFlight', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RayTakesFlightEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TakesFlight_CreateSmoke', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_TakesFlight_Smoke', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_RayDescendsAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleRayDescends', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RayDescendsEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateDescendsRayquazaSprite', ret: "u8", arity: 0, params: "void" },
  { name: 'SpriteCB_Descends_Rayquaza', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_RayChargesAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleRayCharges', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RayChargesEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RayCharges_ShakeRayquaza', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RayCharges_FlyOffscreen', ret: "void", arity: 1, params: "u8" },
  { name: 'RayCharges_AnimateBg', ret: "void", arity: 0, params: "void" },
  { name: 'Task_RayChasesAwayAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleRayChasesAway', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RayChasesAwayEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ChasesAway_AnimateBg', ret: "void", arity: 1, params: "u8" },
  { name: 'ChasesAway_KyogreStartLeave', ret: "void", arity: 1, params: "u8" },
  { name: 'ChasesAway_GroudonStartLeave', ret: "void", arity: 1, params: "u8" },
  { name: 'ChasesAway_CreateTrioSprites', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ChasesAway_AnimateRing', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_ChasesAway_GroudonLeave', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ChasesAway_KyogreLeave', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ChasesAway_RayquazaFloat', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ChasesAway_Rayquaza', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ChasesAway_DuoRingPush', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'ChasesAway_SetRayquazaAnim', ret: "void", arity: 4, params: "struct Sprite *, u8, s16, s16" },
  { name: 'DoRayquazaScene', ret: "void", arity: 3, params: "u8 animId, bool8 endEarly, MainCallback exitCallback" },
  { name: 'VBlankCB_RayquazaScene', ret: "void", arity: 0, params: "void" },
  { name: 'Task_SetNextAnim', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetWindowsHideVertBorders', ret: "void", arity: 0, params: "void" },
  { name: 'ResetWindowDimensions', ret: "void", arity: 0, params: "void" },
  { name: 'Task_HandleDuoFightPre', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'VBlankCB_DuoFight', ret: "void", arity: 0, params: "void" },
  { name: 'InitDuoFightSceneBgs', ret: "void", arity: 0, params: "void" },
  { name: 'LoadDuoFightSceneGfx', ret: "void", arity: 0, params: "void" },
  { name: 'InitTakesFlightSceneBgs', ret: "void", arity: 0, params: "void" },
  { name: 'LoadTakesFlightSceneGfx', ret: "void", arity: 0, params: "void" },
  { name: 'InitDescendsSceneBgs', ret: "void", arity: 0, params: "void" },
  { name: 'LoadDescendsSceneGfx', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_RayDescends', ret: "void", arity: 0, params: "void" },
  { name: 'InitChargesSceneBgs', ret: "void", arity: 0, params: "void" },
  { name: 'LoadChargesSceneGfx', ret: "void", arity: 0, params: "void" },
  { name: 'InitChasesAwaySceneBgs', ret: "void", arity: 0, params: "void" },
  { name: 'LoadChasesAwaySceneGfx', ret: "void", arity: 0, params: "void" },
  { name: 'ChasesAway_PushDuoBack', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ChasesAway_AnimateBg',
  'Task_ChasesAway_AnimateRing',
  'Task_DuoFightAnim',
  'Task_DuoFightEnd',
  'Task_DuoFight_AnimateClouds',
  'Task_EndAfterFadeScreen',
  'Task_HandleDuoFight',
  'Task_HandleDuoFightPre',
  'Task_HandleRayCharges',
  'Task_HandleRayChasesAway',
  'Task_HandleRayDescends',
  'Task_HandleRayTakesFlight',
  'Task_RayChargesAnim',
  'Task_RayChargesEnd',
  'Task_RayCharges_FlyOffscreen',
  'Task_RayCharges_ShakeRayquaza',
  'Task_RayChasesAwayAnim',
  'Task_RayChasesAwayEnd',
  'Task_RayDescendsAnim',
  'Task_RayDescendsEnd',
  'Task_RayTakesFlightAnim',
  'Task_RayTakesFlightEnd',
  'Task_SetNextAnim',
  'Task_TakesFlight_CreateSmoke',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitRayquazaScene',
  'CB2_RayquazaScene',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'rayquaza_scene.h',
  'sprite.h',
  'task.h',
  'graphics.h',
  'bg.h',
  'malloc.h',
  'palette.h',
  'scanline_effect.h',
  'menu.h',
  'menu_helpers.h',
  'gpu_regs.h',
  'decompress.h',
  'sound.h',
  'constants/songs.h',
  'constants/rgb.h',
  'random.h',
] as const;
