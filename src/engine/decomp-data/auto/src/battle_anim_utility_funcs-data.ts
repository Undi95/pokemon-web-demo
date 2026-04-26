// AUTO-GENERATED from src/battle_anim_utility_funcs.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_utility_funcs.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const aDecrease_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const aAnimStatId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const aIsTarget_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const aMultipleBattlers_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const aSharply_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const tAnimSpriteId1_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tVelocity_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tMultipleBattlers_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tAnimSpriteId2_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tTargetBlend_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tWaitTime_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tHidBattler2_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tBattler2SpriteId_EXPR = "data[7]";
/** Raw expr: `data[10]` */
export const tWaitTimer_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tFadeTimer_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tBlend_EXPR = "data[12]";
/** Raw expr: `data[15]` */
export const tState_EXPR = "data[15]";

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const sCurseLinesPalette_COLORS = [{r:248,g:248,b:248}] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'StartBlendAnimSpriteColor', ret: "void", arity: 2, params: "u8, u32" },
  { name: 'AnimTask_BlendSpriteColor_Step2', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_HardwarePaletteFade_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_TraceMonBlended_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimMonTrace', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_DrawFallingWhiteLinesOnAttacker_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'StatsChangeAnimation_Step1', ret: "void", arity: 1, params: "u8" },
  { name: 'StatsChangeAnimation_Step2', ret: "void", arity: 1, params: "u8" },
  { name: 'StatsChangeAnimation_Step3', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_Flash_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'SetPalettesToColor', ret: "void", arity: 2, params: "u32, u16" },
  { name: 'AnimTask_UpdateSlidingBg', ret: "void", arity: 1, params: "u8" },
  { name: 'UpdateMonScrollingBgMask', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_WaitAndRestoreVisibility', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_BlendBattleAnimPal', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BlendBattleAnimPalExclude', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetCamouflageBlend', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BlendParticle', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DestroyAnimVisualTask', ret: "else", arity: 1, params: "taskId" },
  { name: 'AnimTask_HardwarePaletteFade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TraceMonBlended', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_DrawFallingWhiteLinesOnAttacker', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitStatsChangeAnimation', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimLoadCompressedBgTilemapHandleContest', ret: "else", arity: 3, params: "&animBgData, gStatAnim_Decrease_Tilemap, FALSE" },
  { name: 'AnimTask_Flash', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BlendNonAttackerPalettes', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_StartSlidingBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetAttackerSide', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetTargetSide', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetTargetIsAttackerPartner', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetAllNonAttackersInvisiblity', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StartMonScrollingBgMask', ret: "void", arity: 11, params: "u8 taskId, int UNUSED unused, u16 scrollSpeed, u8 battler, bool8 includePartner, u8 numFadeSteps, u8 fadeStepDelay, u8 duration, const u32 *gfx, const u32 *tilemap, const u32 *palette" },
  { name: 'AnimTask_GetBattleEnvironment', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_AllocBackupPalBuffer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FreeBackupPalBuffer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CopyPalUnfadedToBackup', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CopyPalUnfadedFromBackup', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CopyPalFadedToUnfaded', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_IsContest', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetAnimAttackerAndTargetForEffectTgt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_IsTargetSameSide', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetAnimTargetToBattlerTarget', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetAnimAttackerAndTargetForEffectAtk', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetAttackerInvisibleWaitForSignal', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'contest.h',
  'gpu_regs.h',
  'graphics.h',
  'malloc.h',
  'palette.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'util.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
