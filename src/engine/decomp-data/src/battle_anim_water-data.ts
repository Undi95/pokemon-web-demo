// AUTO-GENERATED from src/battle_anim_water.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_water.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tRaindropSpawnTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tRaindropUnused_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tRaindropSpawnInterval_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tRaindropSpawnDuration_EXPR = "data[3]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gRainDropSpriteTemplate = { tileTag: "ANIM_TAG_RAIN_DROPS", paletteTag: "ANIM_TAG_RAIN_DROPS", oam: "&gOamData_AffineOff_ObjNormal_16x32", anims: "sAnims_RainDrop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRainDrop" } as const;
export const gWaterBubbleProjectileSpriteTemplate = { tileTag: "ANIM_TAG_BUBBLE", paletteTag: "ANIM_TAG_BUBBLE", oam: "&gOamData_AffineNormal_ObjBlend_16x16", anims: "sAnims_WaterBubbleProjectile", images: 0, affineAnims: "sAffineAnims_WaterBubbleProjectile", callback: "AnimWaterBubbleProjectile" } as const;
export const gAuroraBeamRingSpriteTemplate = { tileTag: "ANIM_TAG_RAINBOW_RINGS", paletteTag: "ANIM_TAG_RAINBOW_RINGS", oam: "&gOamData_AffineDouble_ObjNormal_8x16", anims: "sAnims_AuroraBeamRing", images: 0, affineAnims: "sAffineAnims_AuroraBeamRing", callback: "AnimAuroraBeamRings" } as const;
export const gHydroPumpOrbSpriteTemplate = { tileTag: "ANIM_TAG_WATER_ORB", paletteTag: "ANIM_TAG_WATER_ORB", oam: "&gOamData_AffineOff_ObjBlend_16x16", anims: "gAnims_WaterMudOrb", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimToTargetInSinWave" } as const;
export const gMudShotOrbSpriteTemplate = { tileTag: "ANIM_TAG_BROWN_ORB", paletteTag: "ANIM_TAG_BROWN_ORB", oam: "&gOamData_AffineOff_ObjBlend_16x16", anims: "gAnims_WaterMudOrb", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimToTargetInSinWave" } as const;
export const gSignalBeamRedOrbSpriteTemplate = { tileTag: "ANIM_TAG_GLOWY_RED_ORB", paletteTag: "ANIM_TAG_GLOWY_RED_ORB", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimToTargetInSinWave" } as const;
export const gSignalBeamGreenOrbSpriteTemplate = { tileTag: "ANIM_TAG_GLOWY_GREEN_ORB", paletteTag: "ANIM_TAG_GLOWY_GREEN_ORB", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimToTargetInSinWave" } as const;
export const gFlamethrowerFlameSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FlamethrowerFlame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimToTargetInSinWave" } as const;
export const gPsywaveRingSpriteTemplate = { tileTag: "ANIM_TAG_BLUE_RING", paletteTag: "ANIM_TAG_BLUE_RING", oam: "&gOamData_AffineDouble_ObjNormal_16x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gGrowingRingAffineAnimTable", callback: "AnimToTargetInSinWave" } as const;
export const gHydroCannonChargeSpriteTemplate = { tileTag: "ANIM_TAG_WATER_ORB", paletteTag: "ANIM_TAG_WATER_ORB", oam: "&gOamData_AffineDouble_ObjBlend_16x16", anims: "gAnims_WaterMudOrb", images: 0, affineAnims: "sAffineAnims_HydroCannonCharge", callback: "AnimHydroCannonCharge" } as const;
export const gHydroCannonBeamSpriteTemplate = { tileTag: "ANIM_TAG_WATER_ORB", paletteTag: "ANIM_TAG_WATER_ORB", oam: "&gOamData_AffineDouble_ObjBlend_16x16", anims: "gAnims_WaterMudOrb", images: 0, affineAnims: "sAffineAnims_HydroCannonBeam", callback: "AnimHydroCannonBeam" } as const;
export const gWaterGunProjectileSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineOff_ObjBlend_16x16", anims: "gAnims_WaterBubble", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimThrowProjectile" } as const;
export const gWaterGunDropletSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineDouble_ObjBlend_16x16", anims: "sAnims_WaterGunDroplet", images: 0, affineAnims: "gAffineAnims_Droplet", callback: "AnimWaterGunDroplet" } as const;
export const gSmallBubblePairSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gAnims_SmallBubblePair", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSmallBubblePair" } as const;
export const gSmallDriftingBubblesSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSmallDriftingBubbles" } as const;
export const gSmallWaterOrbSpriteTemplate = { tileTag: "ANIM_TAG_GLOWY_BLUE_ORB", paletteTag: "ANIM_TAG_GLOWY_BLUE_ORB", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSmallWaterOrb" } as const;
export const gWaterPulseBubbleSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_WaterPulseBubble", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWaterPulseBubble" } as const;
export const gWaterPulseRingBubbleSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineNormal_ObjNormal_8x8", anims: "sAnims_WaterPulseBubble", images: 0, affineAnims: "sAffineAnims_WaterPulseRingBubble", callback: "AnimWaterPulseRingBubble" } as const;
export const gWeatherBallWaterDownSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "sAnims_WeatherBallWaterDown", images: 0, affineAnims: "sAffineAnims_WeatherBallWaterDown", callback: "AnimWeatherBallDown" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sUnusedWater_Gfx': { path: 'graphics/battle_anims/unused/water_gfx.png', ext: '.4bpp', type: 'u8' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sUnusedWater': { path: 'graphics/battle_anims/unused/water.bin', type: 'u8' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimRainDrop', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRainDrop_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterBubbleProjectile', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterBubbleProjectile_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterBubbleProjectile_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterBubbleProjectile_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAuroraBeamRings', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAuroraBeamRings_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimToTargetInSinWave', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimToTargetInSinWave_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHydroCannonCharge', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHydroCannonCharge_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHydroCannonBeam', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterGunDroplet', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmallBubblePair', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmallBubblePair_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmallDriftingBubbles', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmallDriftingBubbles_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmallWaterOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterSpoutRain', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterSpoutRainHit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterSportDroplet', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterSportDroplet_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterPulseBubble', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterPulseBubble_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterPulseRingBubble', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaterPulseRing_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_RotateAuroraRingColors_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_RunSinAnimTimer', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_CreateSurfWave_Step1', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_CreateSurfWave_Step2', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SurfWaveScanlineEffect', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_WaterSpoutLaunch_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_WaterSpoutRain_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'GetWaterSpoutPowerForAnim', ret: "u8", arity: 0, params: "void" },
  { name: 'CreateWaterSpoutLaunchDroplets', ret: "void", arity: 2, params: "struct Task *, u8" },
  { name: 'CreateWaterSpoutRainDroplet', ret: "void", arity: 2, params: "struct Task *, u8" },
  { name: 'AnimTask_WaterSport_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateWaterSportDroplet', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'CreateWaterPulseRingBubbles', ret: "void", arity: 3, params: "struct Sprite *, int, int" },
  { name: 'AnimTask_CreateRaindrops', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_RotateAuroraRingColors', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_StartSinAnimTimer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitSpritePosToAnimAttacker', ret: "else", arity: 2, params: "sprite, TRUE" },
  { name: 'AnimTask_CreateSurfWave', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimLoadCompressedBgTilemap', ret: "else", arity: 2, params: "animBg.bgId, gBattleAnimBgTilemap_SurfPlayer" },
  { name: 'AnimTask_WaterSpoutLaunch', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_WaterSpoutRain', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_WaterSport', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimWaterPulseRing', ret: "void", arity: 1, params: "struct Sprite *sprite" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_anim_internal.h',
  'gpu_regs.h',
  'graphics.h',
  'palette.h',
  'random.h',
  'scanline_effect.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'util.h',
  'constants/battle.h',
  'constants/rgb.h',
] as const;
