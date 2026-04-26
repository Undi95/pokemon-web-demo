// AUTO-GENERATED from src/battle_anim.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const ANIM_SPRITE_INDEX_COUNT = 8;
/** Raw expr: `data[0]` */
export const tBattlerId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tInBg2_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tActive_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tIsPartner_EXPR = "data[3]";
/** Raw expr: `data[0]` */
export const t2_SpriteId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const t2_SpriteX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const t2_SpriteY_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const t2_BgX_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const t2_BgY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const t2_InBg2_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const t2_BattlerId_EXPR = "data[6]";
/** Raw expr: `data[0]` */
export const tBackgroundId_EXPR = "data[0]";
/** Raw expr: `data[10]` */
export const tState_EXPR = "data[10]";
/** Raw expr: `data[0]` */
export const tInitialPan_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTargetPan_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tIncrementPan_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tFramesToWait_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tCurrentPan_EXPR = "data[4]";
/** Raw expr: `data[8]` */
export const tFrameCounter_EXPR = "data[8]";
/** Raw expr: `data[0]` */
export const tSongId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tPanning_EXPR = "data[1]";
/** Raw expr: `data[3]` */
export const tNumberOfPlays_EXPR = "data[3]";

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sScriptCmdTable = ['Cmd_loadspritegfx', 'Cmd_unloadspritegfx', 'Cmd_createsprite', 'Cmd_createvisualtask', 'Cmd_delay', 'Cmd_waitforvisualfinish', 'Cmd_nop', 'Cmd_nop2', 'Cmd_end', 'Cmd_playse', 'Cmd_monbg', 'Cmd_clearmonbg', 'Cmd_setalpha', 'Cmd_blendoff', 'Cmd_call', 'Cmd_return', 'Cmd_setarg', 'Cmd_choosetwoturnanim', 'Cmd_jumpifmoveturn', 'Cmd_goto', 'Cmd_fadetobg', 'Cmd_restorebg', 'Cmd_waitbgfadeout', 'Cmd_waitbgfadein', 'Cmd_changebg', 'Cmd_playsewithpan', 'Cmd_setpan', 'Cmd_panse', 'Cmd_loopsewithpan', 'Cmd_waitplaysewithpan', 'Cmd_setbldcnt', 'Cmd_createsoundtask', 'Cmd_waitsound', 'Cmd_jumpargeq', 'Cmd_monbg_static', 'Cmd_clearmonbg_static', 'Cmd_jumpifcontest', 'Cmd_fadetobgfromset', 'Cmd_panse_adjustnone', 'Cmd_panse_adjustall', 'Cmd_splitbgprio', 'Cmd_splitbgprio_all', 'Cmd_splitbgprio_foes', 'Cmd_invisible', 'Cmd_visible', 'Cmd_teamattack_moveback', 'Cmd_teamattack_movefwd', 'Cmd_stopsound'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "s8", name: 'sAnimFramesToWait', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gAnimScriptActive', isArray: false, init: "FALSE" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gAnimVisualTaskCount', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gAnimSoundTaskCount', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s32", name: 'gAnimMoveDmg', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gAnimMovePower', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sAnimSpriteIndexArray', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gAnimFriendship', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gWeatherMoveAnim', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gBattleAnimArgs', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sSoundAnimFramesToWait', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sMonAnimTaskIdArray', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gAnimMoveTurn', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sAnimBackgroundFadeState', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sAnimMoveIndex', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleAnimAttacker', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleAnimTarget', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gAnimBattlerSpecies', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gAnimCustomPanning', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Cmd_loadspritegfx', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_unloadspritegfx', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_createsprite', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_createvisualtask', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_delay', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_waitforvisualfinish', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_nop2', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_end', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_playse', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_monbg', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_clearmonbg', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_setalpha', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_blendoff', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_call', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_return', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_setarg', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_choosetwoturnanim', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_jumpifmoveturn', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_goto', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_fadetobg', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_restorebg', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_waitbgfadeout', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_waitbgfadein', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_changebg', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_playsewithpan', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_setpan', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_panse', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_loopsewithpan', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_waitplaysewithpan', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_setbldcnt', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_createsoundtask', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_waitsound', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_jumpargeq', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_monbg_static', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_clearmonbg_static', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_jumpifcontest', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_fadetobgfromset', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_panse_adjustnone', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_panse_adjustall', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_splitbgprio', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_splitbgprio_all', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_splitbgprio_foes', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_invisible', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_visible', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_teamattack_moveback', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_teamattack_movefwd', ret: "void", arity: 0, params: "void" },
  { name: 'Cmd_stopsound', ret: "void", arity: 0, params: "void" },
  { name: 'RunAnimScriptCommand', ret: "void", arity: 0, params: "void" },
  { name: 'Task_UpdateMonBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FlipBattlerBgTiles', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ClearMonBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ClearMonBgStatic', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FadeToBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_PanFromInitialToTarget', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LoopAndPlaySE', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitAndPlaySE', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'LoadDefaultBg', ret: "void", arity: 0, params: "void" },
  { name: 'LoadMoveBg', ret: "void", arity: 1, params: "u16 bgId" },
  { name: 'ClearBattleAnimationVars', ret: "void", arity: 0, params: "void" },
  { name: 'DoMoveAnim', ret: "void", arity: 1, params: "u16 move" },
  { name: 'LaunchBattleAnimation', ret: "void", arity: 3, params: "const u8 *const animsTable[], u16 tableId, bool8 isMoveAnim" },
  { name: 'DestroyAnimSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroyAnimVisualTask', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DestroyAnimSoundTask', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AddSpriteIndex', ret: "void", arity: 1, params: "u16 index" },
  { name: 'ClearSpriteIndex', ret: "void", arity: 1, params: "u16 index" },
  { name: 'WaitAnimFrameCount', ret: "void", arity: 0, params: "void" },
  { name: 'Task_InitUpdateMonBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'IsBattlerSpriteVisible', ret: "bool8", arity: 1, params: "u8 battler" },
  { name: 'MoveBattlerSpriteToBG', ret: "void", arity: 3, params: "u8 battler, bool8 toBG_2, bool8 setSpriteInvisible" },
  { name: 'RelocateBattleBgPal', ret: "void", arity: 4, params: "u16 paletteNum, u16 *dest, u32 offset, bool8 largeScreen" },
  { name: 'ResetBattleAnimBg', ret: "void", arity: 1, params: "bool8 toBG2" },
  { name: 'IsContest', ret: "bool8", arity: 0, params: "void" },
  { name: 'DrawMainBattleBackground', ret: "else", arity: 0, params: "" },
  { name: 'BattleAnimAdjustPanning', ret: "s8", arity: 1, params: "s8 pan" },
  { name: 'BattleAnimAdjustPanning2', ret: "s8", arity: 1, params: "s8 pan" },
  { name: 'KeepPanInRange', ret: "s16", arity: 2, params: "s16 panArg, int oldPan" },
  { name: 'CalculatePanIncrement', ret: "s16", arity: 3, params: "s16 sourcePan, s16 targetPan, s16 incrementPan" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ClearMonBg',
  'Task_ClearMonBgStatic',
  'Task_FadeToBg',
  'Task_InitUpdateMonBg',
  'Task_LoopAndPlaySE',
  'Task_PanFromInitialToTarget',
  'Task_UpdateMonBg',
  'Task_WaitAndPlaySE',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_controllers.h',
  'battle_interface.h',
  'bg.h',
  'contest.h',
  'decompress.h',
  'dma3.h',
  'gpu_regs.h',
  'graphics.h',
  'main.h',
  'm4a.h',
  'palette.h',
  'pokemon.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'constants/battle_anim.h',
  'data/battle_anim.h',
] as const;
