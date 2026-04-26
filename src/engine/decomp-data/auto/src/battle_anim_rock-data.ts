// AUTO-GENERATED from src/battle_anim_rock.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_rock.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[10]` */
export const tBlendTimer_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tBlend_EXPR = "data[11]";
/** Raw expr: `data[11]` */
export const tFullAlphaTimer_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tState_EXPR = "data[12]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sVelocityX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sVelocityY_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sFractionalX_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sFractionalY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sMirroredX_EXPR = "data[5]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gFallingRockSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FlyingRock", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFallingRock" } as const;
export const gRockFragmentSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FlyingRock", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRockFragment" } as const;
export const gSwirlingDirtSpriteTemplate = { tileTag: "ANIM_TAG_MUD_SAND", paletteTag: "ANIM_TAG_MUD_SAND", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimParticleInVortex" } as const;
export const gWhirlpoolSpriteTemplate = { tileTag: "ANIM_TAG_WATER_ORB", paletteTag: "ANIM_TAG_WATER_ORB", oam: "&gOamData_AffineNormal_ObjBlend_16x16", anims: "gAnims_WaterMudOrb", images: 0, affineAnims: "sAffineAnims_Whirlpool", callback: "AnimParticleInVortex" } as const;
export const gFireSpinSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gAnims_BasicFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimParticleInVortex" } as const;
export const gFlyingSandCrescentSpriteTemplate = { tileTag: "ANIM_TAG_FLYING_DIRT", paletteTag: "ANIM_TAG_FLYING_DIRT", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFlyingSandCrescent" } as const;
export const gAncientPowerRockSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_BasicRock", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRaiseSprite" } as const;
export const gRolloutMudSpriteTemplate = { tileTag: "ANIM_TAG_MUD_SAND", paletteTag: "ANIM_TAG_MUD_SAND", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRolloutParticle" } as const;
export const gRolloutRockSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRolloutParticle" } as const;
export const gRockTombRockSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_BasicRock", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRockTomb" } as const;
export const gRockBlastRockSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "sAnims_BasicRock", images: 0, affineAnims: "sAffineAnims_BasicRock", callback: "AnimRockBlastRock" } as const;
export const gRockScatterSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "sAnims_BasicRock", images: 0, affineAnims: "sAffineAnims_BasicRock", callback: "AnimRockScatter" } as const;
export const gTwisterRockSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "&sAnims_BasicRock[4]", images: 0, affineAnims: "sAffineAnims_BasicRock", callback: "AnimMoveTwisterParticle" } as const;
export const gWeatherBallRockDownSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "&sAnims_BasicRock[2]", images: 0, affineAnims: "sAffineAnims_BasicRock", callback: "AnimWeatherBallDown" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimFallingRock', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFallingRock_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRockFragment', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlyingSandCrescent', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRaiseSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_Rollout_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimRolloutParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRockTomb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRockTomb_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimRockBlastRock', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRockScatter', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRockScatter_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimParticleInVortex', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimParticleInVortex_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_LoadSandstormBackground_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateRolloutDirtSprite', ret: "void", arity: 1, params: "struct Task *task" },
  { name: 'GetRolloutCounter', ret: "u8", arity: 0, params: "void" },
  { name: 'InitSpritePosToAnimTarget', ret: "else", arity: 2, params: "sprite, FALSE" },
  { name: 'AnimTask_LoadSandstormBackground', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_Rollout', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetSeismicTossDamageLevel', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MoveSeismicTossBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SeismicTossBgAccelerateDownAtEnd', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'gpu_regs.h',
  'graphics.h',
  'palette.h',
  'sound.h',
  'task.h',
  'trig.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
