// AUTO-GENERATED from src/trainer_see.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/trainer_see.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tFuncId_EXPR = "data[0]";
/** Raw expr: `data[3]` */
export const tTrainerRange_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tOutOfAshSpriteId_EXPR = "data[4]";
/** Raw expr: `data[7]` */
export const tTrainerObjectEventId_EXPR = "data[7]";
/** Raw expr: `data[1]` */
export const tObjEvent_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sLocalId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sMapNum_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sMapGroup_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sYVelocity_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sYOffset_EXPR = "data[4]";
/** Raw expr: `data[7]` */
export const sFldEffId_EXPR = "data[7]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_TRSEE_0 = {
  TRSEE_NONE: 0,
  TRSEE_EXCLAMATION: 1,
  TRSEE_EXCLAMATION_WAIT: 2,
  TRSEE_MOVE_TO_PLAYER: 3,
  TRSEE_PLAYER_FACE: 4,
  TRSEE_PLAYER_FACE_WAIT: 5,
  TRSEE_REVEAL_DISGUISE: 6,
  TRSEE_REVEAL_DISGUISE_WAIT: 7,
  TRSEE_REVEAL_BURIED: 8,
  TRSEE_BURIED_POP_OUT: 9,
  TRSEE_BURIED_JUMP: 10,
  TRSEE_REVEAL_BURIED_WAIT: 11,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Icons = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_ExclamationQuestionMark = { tileTag: "TAG_NONE", paletteTag: "TAG_NONE", oam: "&sOamData_Icons", anims: "sSpriteAnimTable_Icons", images: "sSpriteImageTable_ExclamationQuestionMark", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_TrainerIcons" } as const;
export const sSpriteTemplate_HeartIcon = { tileTag: "TAG_NONE", paletteTag: "FLDEFF_PAL_TAG_GENERAL_0", oam: "&sOamData_Icons", anims: "sSpriteAnimTable_Icons", images: "sSpriteImageTable_HeartIcon", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_TrainerIcons" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sEmotion_ExclamationMarkGfx': { path: 'graphics/field_effects/pics/emotion_exclamation.png', ext: '.4bpp', type: 'u8' },
  'sEmotion_QuestionMarkGfx': { path: 'graphics/field_effects/pics/emotion_question.png', ext: '.4bpp', type: 'u8' },
  'sEmotion_HeartGfx': { path: 'graphics/field_effects/pics/emotion_heart.png', ext: '.4bpp', type: 'u8' },
};

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sDirectionalApproachDistanceFuncs = ['GetTrainerApproachDistanceSouth', 'GetTrainerApproachDistanceNorth', 'GetTrainerApproachDistanceWest', 'GetTrainerApproachDistanceEast'] as const;
export const sTrainerSeeFuncList = ['TrainerSeeIdle', 'TrainerExclamationMark', 'WaitTrainerExclamationMark', 'TrainerMoveToPlayer', 'PlayerFaceApproachingTrainer', 'WaitPlayerFaceApproachingTrainer', 'RevealDisguisedTrainer', 'WaitRevealDisguisedTrainer', 'RevealBuriedTrainer', 'PopOutOfAshBuriedTrainer', 'JumpInPlaceBuriedTrainer', 'WaitRevealBuriedTrainer'] as const;
export const sTrainerSeeFuncList2 = ['RevealBuriedTrainer', 'PopOutOfAshBuriedTrainer', 'JumpInPlaceBuriedTrainer', 'WaitRevealBuriedTrainer'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u16", name: 'gWhichTrainerToFaceAfterBattle', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gPostBattleMovementScript', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct ApproachingTrainer", name: 'gApproachingTrainers', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gNoOfApproachingTrainers', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "bool8", name: 'gTrainerApproachedPlayer', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gApproachingTrainerId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CheckTrainer', ret: "u8", arity: 1, params: "u8 objectEventId" },
  { name: 'GetTrainerApproachDistance', ret: "u8", arity: 1, params: "struct ObjectEvent *trainerObj" },
  { name: 'CheckPathBetweenTrainerAndPlayer', ret: "u8", arity: 3, params: "struct ObjectEvent *trainerObj, u8 approachDistance, u8 direction" },
  { name: 'InitTrainerApproachTask', ret: "void", arity: 2, params: "struct ObjectEvent *trainerObj, u8 range" },
  { name: 'Task_RunTrainerSeeFuncList', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_EndTrainerApproach', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetIconSpriteData', ret: "void", arity: 3, params: "struct Sprite *sprite, u16 fldEffId, u8 spriteAnimNum" },
  { name: 'GetTrainerApproachDistanceSouth', ret: "u8", arity: 4, params: "struct ObjectEvent *trainerObj, s16 range, s16 x, s16 y" },
  { name: 'GetTrainerApproachDistanceNorth', ret: "u8", arity: 4, params: "struct ObjectEvent *trainerObj, s16 range, s16 x, s16 y" },
  { name: 'GetTrainerApproachDistanceWest', ret: "u8", arity: 4, params: "struct ObjectEvent *trainerObj, s16 range, s16 x, s16 y" },
  { name: 'GetTrainerApproachDistanceEast', ret: "u8", arity: 4, params: "struct ObjectEvent *trainerObj, s16 range, s16 x, s16 y" },
  { name: 'TrainerSeeIdle', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'TrainerExclamationMark', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'WaitTrainerExclamationMark', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'TrainerMoveToPlayer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'PlayerFaceApproachingTrainer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'WaitPlayerFaceApproachingTrainer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'RevealDisguisedTrainer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'WaitRevealDisguisedTrainer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'RevealBuriedTrainer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'PopOutOfAshBuriedTrainer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'JumpInPlaceBuriedTrainer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'WaitRevealBuriedTrainer', ret: "bool8", arity: 3, params: "u8 taskId, struct Task *task, struct ObjectEvent *trainerObj" },
  { name: 'SpriteCB_TrainerIcons', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CheckForTrainersWantingBattle', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartTrainerApproach', ret: "void", arity: 1, params: "TaskFunc followupFunc" },
  { name: 'Task_SetBuriedTrainerMovement', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetBuriedTrainerMovement', ret: "void", arity: 1, params: "struct ObjectEvent *objEvent" },
  { name: 'DoTrainerApproach', ret: "void", arity: 0, params: "void" },
  { name: 'TryPrepareSecondApproachingTrainer', ret: "void", arity: 0, params: "void" },
  { name: 'FldEff_ExclamationMarkIcon', ret: "u8", arity: 0, params: "void" },
  { name: 'FldEff_QuestionMarkIcon', ret: "u8", arity: 0, params: "void" },
  { name: 'FldEff_HeartIcon', ret: "u8", arity: 0, params: "void" },
  { name: 'GetCurrentApproachingTrainerObjectEventId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetChosenApproachingTrainerObjectEventId', ret: "u8", arity: 1, params: "u8 arrayId" },
  { name: 'PlayerFaceTrainerAfterBattle', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_EndTrainerApproach',
  'Task_RunTrainerSeeFuncList',
  'Task_SetBuriedTrainerMovement',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_setup.h',
  'event_data.h',
  'event_object_movement.h',
  'field_effect.h',
  'field_player_avatar.h',
  'pokemon.h',
  'script.h',
  'script_movement.h',
  'sprite.h',
  'task.h',
  'trainer_see.h',
  'trainer_hill.h',
  'util.h',
  'battle_pyramid.h',
  'constants/battle_setup.h',
  'constants/event_objects.h',
  'constants/event_object_movement.h',
  'constants/field_effects.h',
  'constants/trainer_types.h',
] as const;
