// AUTO-GENERATED from src/evolution_scene.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/evolution_scene.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `gBattleCommunication[1]` */
export const sEvoCursorPos_EXPR = "gBattleCommunication[1]";
/** Raw expr: `gBattleCommunication[2]` */
export const sEvoGraphicsTaskId_EXPR = "gBattleCommunication[2]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tPreEvoSpecies_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tPostEvoSpecies_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tCanStop_EXPR = "data[3]";
/** Raw expr: `data[3]` */
export const tBits_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tLearnsFirstMove_EXPR = "data[4]";
/** Raw expr: `data[6]` */
export const tLearnMoveState_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tLearnMoveYesState_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tLearnMoveNoState_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tEvoWasStopped_EXPR = "data[9]";
/** Raw expr: `data[10]` */
export const tPartyId_EXPR = "data[10]";
/** Raw expr: `(1 << 0)` */
export const TASK_BIT_CAN_STOP_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 7)` */
export const TASK_BIT_LEARN_MOVE_EXPR = "(1 << 7)";
/** Raw expr: `data[8]` */
export const tEvoStopped_EXPR = "data[8]";
/** Raw expr: `data[0]` */
export const tCycleTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tPalStage_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tControlStage_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tNumCycles_EXPR = "data[3]";
/** Raw expr: `data[5]` */
export const tStartTimer_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tPaused_EXPR = "data[6]";
/** Raw expr: `sBgAnim_PaletteControl[tControlStage][0]` */
export const START_PAL_EXPR = "sBgAnim_PaletteControl[tControlStage][0]";
/** Raw expr: `sBgAnim_PaletteControl[tControlStage][1]` */
export const END_PAL_EXPR = "sBgAnim_PaletteControl[tControlStage][1]";
/** Raw expr: `sBgAnim_PaletteControl[tControlStage][2]` */
export const CYCLES_EXPR = "sBgAnim_PaletteControl[tControlStage][2]";
/** Raw expr: `sBgAnim_PaletteControl[tControlStage][3]` */
export const DELAY_EXPR = "sBgAnim_PaletteControl[tControlStage][3]";
/** Raw expr: `data[2]` */
export const tIsLink_EXPR = "data[2]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_EVOSTATE_0 = {
  EVOSTATE_FADE_IN: 0,
  EVOSTATE_INTRO_MSG: 1,
  EVOSTATE_INTRO_MON_ANIM: 2,
  EVOSTATE_INTRO_SOUND: 3,
  EVOSTATE_START_MUSIC: 4,
  EVOSTATE_START_BG_AND_SPARKLE_SPIRAL: 5,
  EVOSTATE_SPARKLE_ARC: 6,
  EVOSTATE_CYCLE_MON_SPRITE: 7,
  EVOSTATE_WAIT_CYCLE_MON_SPRITE: 8,
  EVOSTATE_SPARKLE_CIRCLE: 9,
  EVOSTATE_SPARKLE_SPRAY: 10,
  EVOSTATE_EVO_SOUND: 11,
  EVOSTATE_RESTORE_SCREEN: 12,
  EVOSTATE_EVO_MON_ANIM: 13,
  EVOSTATE_SET_MON_EVOLVED: 14,
  EVOSTATE_TRY_LEARN_MOVE: 15,
  EVOSTATE_END: 16,
  EVOSTATE_CANCEL: 17,
  EVOSTATE_CANCEL_MON_ANIM: 18,
  EVOSTATE_CANCEL_MSG: 19,
  EVOSTATE_LEARNED_MOVE: 20,
  EVOSTATE_TRY_LEARN_ANOTHER_MOVE: 21,
  EVOSTATE_REPLACE_MOVE: 22,
} as const;
export const ENUM_MVSTATE_1 = {
  MVSTATE_INTRO_MSG_1: 0,
  MVSTATE_INTRO_MSG_2: 1,
  MVSTATE_INTRO_MSG_3: 2,
  MVSTATE_PRINT_YES_NO: 3,
  MVSTATE_HANDLE_YES_NO: 4,
  MVSTATE_SHOW_MOVE_SELECT: 5,
  MVSTATE_HANDLE_MOVE_SELECT: 6,
  MVSTATE_FORGET_MSG_1: 7,
  MVSTATE_FORGET_MSG_2: 8,
  MVSTATE_LEARNED_MOVE: 9,
  MVSTATE_ASK_CANCEL: 10,
  MVSTATE_CANCEL: 11,
  MVSTATE_RETRY_AFTER_HM: 12,
} as const;
export const ENUM_T_2 = {
  T_EVOSTATE_INTRO_MSG: 0,
  T_EVOSTATE_INTRO_CRY: 1,
  T_EVOSTATE_INTRO_SOUND: 2,
  T_EVOSTATE_START_MUSIC: 3,
  T_EVOSTATE_START_BG_AND_SPARKLE_SPIRAL: 4,
  T_EVOSTATE_SPARKLE_ARC: 5,
  T_EVOSTATE_CYCLE_MON_SPRITE: 6,
  T_EVOSTATE_WAIT_CYCLE_MON_SPRITE: 7,
  T_EVOSTATE_SPARKLE_CIRCLE: 8,
  T_EVOSTATE_SPARKLE_SPRAY: 9,
  T_EVOSTATE_EVO_SOUND: 10,
  T_EVOSTATE_EVO_MON_ANIM: 11,
  T_EVOSTATE_SET_MON_EVOLVED: 12,
  T_EVOSTATE_TRY_LEARN_MOVE: 13,
  T_EVOSTATE_END: 14,
  T_EVOSTATE_CANCEL: 15,
  T_EVOSTATE_CANCEL_MON_ANIM: 16,
  T_EVOSTATE_CANCEL_MSG: 17,
  T_EVOSTATE_LEARNED_MOVE: 18,
  T_EVOSTATE_TRY_LEARN_ANOTHER_MOVE: 19,
  T_EVOSTATE_REPLACE_MOVE: 20,
} as const;
export const ENUM_T_3 = {
  T_MVSTATE_INTRO_MSG_1: 0,
  T_MVSTATE_INTRO_MSG_2: 1,
  T_MVSTATE_INTRO_MSG_3: 2,
  T_MVSTATE_PRINT_YES_NO: 3,
  T_MVSTATE_HANDLE_YES_NO: 4,
  T_MVSTATE_SHOW_MOVE_SELECT: 5,
  T_MVSTATE_HANDLE_MOVE_SELECT: 6,
  T_MVSTATE_FORGET_MSG: 7,
  T_MVSTATE_LEARNED_MOVE: 8,
  T_MVSTATE_ASK_CANCEL: 9,
  T_MVSTATE_CANCEL: 10,
  T_MVSTATE_RETRY_AFTER_HM: 11,
} as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sUnusedPal1': { path: 'graphics/evolution_scene/unused_1.pal', ext: '.gbapal', type: 'u16' },
  'sBgAnim_Gfx': { path: 'graphics/evolution_scene/bg.png', ext: '.4bpp.lz', type: 'u32' },
  'sBgAnim_Inner_Tilemap': { path: 'graphics/evolution_scene/bg_inner.bin', ext: '.lz', type: 'u32' },
  'sBgAnim_Outer_Tilemap': { path: 'graphics/evolution_scene/bg_outer.bin', ext: '.lz', type: 'u32' },
  'sBgAnim_Intro_Pal': { path: 'graphics/evolution_scene/bg_anim_intro.pal', ext: '.gbapal', type: 'u16' },
  'sUnusedPal2': { path: 'graphics/evolution_scene/unused_2.pal', ext: '.gbapal', type: 'u16' },
  'sUnusedPal3': { path: 'graphics/evolution_scene/unused_3.pal', ext: '.gbapal', type: 'u16' },
  'sUnusedPal4': { path: 'graphics/evolution_scene/unused_4.pal', ext: '.gbapal', type: 'u16' },
  'sBgAnim_Pal': { path: 'graphics/evolution_scene/bg_anim.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_EvolutionScene', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_TradeEvolutionScene', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CB2_EvolutionSceneUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_TradeEvolutionSceneUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'EvoDummyFunc', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_EvolutionScene', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_TradeEvolutionScene', ret: "void", arity: 0, params: "void" },
  { name: 'EvoScene_DoMonAnimAndCry', ret: "void", arity: 2, params: "u8 monSpriteId, u16 speciesId" },
  { name: 'EvoScene_IsMonAnimFinished', ret: "bool32", arity: 1, params: "u8 monSpriteId" },
  { name: 'StartBgAnimation', ret: "void", arity: 1, params: "bool8 isLink" },
  { name: 'StopBgAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'Task_AnimateBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'RestoreBgAfterAnim', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_BeginEvolutionScene', ret: "void", arity: 0, params: "void" },
  { name: 'Task_BeginEvolutionScene', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BeginEvolutionScene', ret: "void", arity: 4, params: "struct Pokemon *mon, u16 postEvoSpecies, bool8 canStopEvo, u8 partyId" },
  { name: 'EvolutionScene', ret: "void", arity: 4, params: "struct Pokemon *mon, u16 postEvoSpecies, bool8 canStopEvo, u8 partyId" },
  { name: 'CB2_EvolutionSceneLoadGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_TradeEvolutionSceneLoadGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'TradeEvolutionScene', ret: "void", arity: 4, params: "struct Pokemon *mon, u16 postEvoSpecies, u8 preEvoSpriteId, u8 partyId" },
  { name: 'CreateShedinja', ret: "void", arity: 2, params: "u16 preEvoSpecies, struct Pokemon *mon" },
  { name: 'StringExpandPlaceholders', ret: "else", arity: 2, params: "gStringVar4, gText_PkmnStoppedEvolving" },
  { name: 'Task_UpdateBgPalette', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateBgAnimTask', ret: "void", arity: 1, params: "bool8 isLink" },
  { name: 'InitMovingBgPalette', ret: "void", arity: 1, params: "u16 *palette" },
  { name: 'PauseBgPaletteAnim', ret: "UNUSED", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AnimateBg',
  'Task_BeginEvolutionScene',
  'Task_EvolutionScene',
  'Task_TradeEvolutionScene',
  'Task_UpdateBgPalette',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_BeginEvolutionScene',
  'CB2_EvolutionSceneLoadGraphics',
  'CB2_EvolutionSceneUpdate',
  'CB2_TradeEvolutionSceneLoadGraphics',
  'CB2_TradeEvolutionSceneUpdate',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_message.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'evolution_scene.h',
  'evolution_graphics.h',
  'gpu_regs.h',
  'link.h',
  'link_rfu.h',
  'm4a.h',
  'main.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'pokedex.h',
  'pokemon.h',
  'pokemon_summary_screen.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'text_window.h',
  'trig.h',
  'trade.h',
  'util.h',
  'constants/battle_string_ids.h',
  'constants/songs.h',
  'constants/rgb.h',
  'constants/items.h',
] as const;
