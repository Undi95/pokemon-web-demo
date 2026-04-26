// AUTO-GENERATED from src/fldeff_misc.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/fldeff_misc.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tHorzIncrement_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tVertIncrement_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tWinLeft_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tWinRight_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tWinTop_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tWinBottom_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tBlendCnt_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tBlendY_EXPR = "data[8]";
/** Raw expr: `data[0]` */
export const tX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tY_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tMetatileID_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMosaic_EXPR = "data[1]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_SecretPower = { y: 0, x: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 2 } as const;
export const sOam_SandPillar = { x: 0, y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x32)", size: "SPRITE_SIZE(16x32)", priority: 2 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_SecretPowerCave = { tileTag: "TAG_NONE", paletteTag: "FLDEFF_PAL_TAG_SECRET_POWER_TREE", oam: "&sOam_SecretPower", anims: "sAnimTable_SecretPowerCave", images: "sPicTable_SecretPowerCave", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CaveEntranceInit" } as const;
export const sSpriteTemplate_SecretPowerTree = { tileTag: "TAG_NONE", paletteTag: "FLDEFF_PAL_TAG_SECRET_POWER_PLANT", oam: "&sOam_SecretPower", anims: "sAnimTable_SecretPowerTree", images: "sPicTable_SecretPowerTree", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_TreeEntranceInit" } as const;
export const sSpriteTemplate_SecretPowerShrub = { tileTag: "TAG_NONE", paletteTag: "FLDEFF_PAL_TAG_SECRET_POWER_PLANT", oam: "&sOam_SecretPower", anims: "sAnimTable_SecretPowerShrub", images: "sPicTable_SecretPowerShrub", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ShrubEntranceInit" } as const;
export const sSpriteTemplate_SandPillar = { tileTag: "TAG_NONE", paletteTag: "FLDEFF_PAL_TAG_SAND_PILLAR", oam: "&sOam_SandPillar", anims: "sAnimTable_SandPillar", images: "sPicTable_SandPillar", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SandPillar_BreakTop" } as const;
export const sSpriteTemplate_RecordMixLights = { tileTag: "TAG_NONE", paletteTag: 4096, oam: "&gObjectEventBaseOam_32x8", anims: "sAnimTable_RecordMixLights", images: "sPicTable_RecordMixLights", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sSecretPowerCave_Pal': { path: 'graphics/field_effects/palettes/secret_power_cave.pal', ext: '.gbapal', type: 'u16' },
  'sSecretPowerPlant_Pal': { path: 'graphics/field_effects/palettes/secret_power_plant.pal', ext: '.gbapal', type: 'u16' },
  'sSandPillar0_Gfx': { path: 'graphics/field_effects/pics/sand_pillar/0.png', ext: '.4bpp', type: 'u8' },
  'sSandPillar1_Gfx': { path: 'graphics/field_effects/pics/sand_pillar/1.png', ext: '.4bpp', type: 'u8' },
  'sSandPillar2_Gfx': { path: 'graphics/field_effects/pics/sand_pillar/2.png', ext: '.4bpp', type: 'u8' },
  'sRecordMixLights_Pal': { path: 'graphics/field_effects/palettes/record_mix_lights.pal', ext: '.gbapal', type: 'u16' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct MapPosition", name: 'gPlayerFacingPosition', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_ComputerScreenOpenEffect', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ComputerScreenCloseEffect', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateComputerScreenEffectTask', ret: "void", arity: 4, params: "TaskFunc, u16, u16, u8" },
  { name: 'Task_SecretBasePCTurnOn', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PopSecretBaseBalloon', ret: "void", arity: 1, params: "u8" },
  { name: 'DoBalloonSoundEffect', ret: "void", arity: 1, params: "s16" },
  { name: 'Task_WateringBerryTreeAnim_Start', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WateringBerryTreeAnim_Continue', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WateringBerryTreeAnim_End', ret: "void", arity: 1, params: "u8" },
  { name: 'FieldCallback_SecretBaseCave', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_CaveEntranceInit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_CaveEntranceOpen', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_CaveEntranceEnd', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'StartSecretBaseCaveFieldEffect', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCallback_SecretBaseTree', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_TreeEntranceInit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_TreeEntranceOpen', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_TreeEntranceEnd', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'StartSecretBaseTreeFieldEffect', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCallback_SecretBaseShrub', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_ShrubEntranceInit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ShrubEntranceOpen', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ShrubEntranceEnd', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'StartSecretBaseShrubFieldEffect', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_SandPillar_BreakTop', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_SandPillar_BreakBase', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_SandPillar_End', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'ComputerScreenOpenEffect', ret: "void", arity: 3, params: "u16 increment, u16 unused, u8 priority" },
  { name: 'ComputerScreenCloseEffect', ret: "void", arity: 3, params: "u16 increment, u16 unused, u8 priority" },
  { name: 'IsComputerScreenOpenEffectActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsComputerScreenCloseEffectActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetCurrentSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'AdjustSecretPowerSpritePixelOffsets', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpFieldMove_SecretPower', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseSecretPowerCave', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SecretPowerCave', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseSecretPowerTree', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SecretPowerTree', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseSecretPowerShrub', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SecretPowerShrub', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SecretBasePCTurnOn', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoSecretBasePCTurnOffEffect', ret: "void", arity: 0, params: "void" },
  { name: 'MapGridSetMetatileIdAt', ret: "else", arity: 3, params: "x, y, METATILE_SecretBase_RegisterPC | MAPGRID_IMPASSABLE" },
  { name: 'PopSecretBaseBalloon', ret: "void", arity: 3, params: "s16 metatileId, s16 x, s16 y" },
  { name: 'FldEff_Nop47', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_Nop48', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoSecretBaseBreakableDoorEffect', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'Task_ShatterSecretBaseBreakableDoor', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShatterSecretBaseBreakableDoor', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'Task_SecretBaseMusicNoteMatSound', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlaySecretBaseMusicNoteMatSound', ret: "void", arity: 1, params: "s16 metatileId" },
  { name: 'SpriteCB_GlitterMatSparkle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DoSecretBaseGlitterMatSparkle', ret: "void", arity: 0, params: "void" },
  { name: 'FldEff_SandPillar', ret: "bool8", arity: 0, params: "void" },
  { name: 'InteractWithShieldOrTVDecoration', ret: "void", arity: 0, params: "void" },
  { name: 'IsLargeBreakableDecoration', ret: "bool8", arity: 2, params: "u16 metatileId, bool8 checkBase" },
  { name: 'Task_FieldPoisonEffect', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FldEffPoison_Start', ret: "void", arity: 0, params: "void" },
  { name: 'FldEffPoison_IsActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'Task_WateringBerryTreeAnim', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoWateringBerryTreeAnim', ret: "void", arity: 0, params: "void" },
  { name: 'CreateRecordMixingLights', ret: "u8", arity: 0, params: "void" },
  { name: 'DestroyRecordMixingLights', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ComputerScreenCloseEffect',
  'Task_ComputerScreenOpenEffect',
  'Task_FieldPoisonEffect',
  'Task_PopSecretBaseBalloon',
  'Task_SecretBaseMusicNoteMatSound',
  'Task_SecretBasePCTurnOn',
  'Task_ShatterSecretBaseBreakableDoor',
  'Task_WateringBerryTreeAnim',
  'Task_WateringBerryTreeAnim_Continue',
  'Task_WateringBerryTreeAnim_End',
  'Task_WateringBerryTreeAnim_Start',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'gpu_regs.h',
  'palette.h',
  'script.h',
  'sound.h',
  'task.h',
  'strings.h',
  'party_menu.h',
  'fieldmap.h',
  'field_effect.h',
  'field_camera.h',
  'field_player_avatar.h',
  'fldeff.h',
  'fldeff_misc.h',
  'secret_base.h',
  'event_data.h',
  'event_scripts.h',
  'event_object_movement.h',
  'metatile_behavior.h',
  'string_util.h',
  'constants/field_effects.h',
  'constants/metatile_behaviors.h',
  'constants/metatile_labels.h',
  'constants/songs.h',
] as const;
