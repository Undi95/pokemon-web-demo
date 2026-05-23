// AUTO-GENERATED from src/move_relearner.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/move_relearner.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MENU_STATE_FADE_TO_BLACK = 0;
export const MENU_STATE_WAIT_FOR_FADE = 1;
export const MENU_STATE_UNREACHABLE = 2;
export const MENU_STATE_SETUP_BATTLE_MODE = 3;
export const MENU_STATE_IDLE_BATTLE_MODE = 4;
export const MENU_STATE_SETUP_CONTEST_MODE = 5;
export const MENU_STATE_IDLE_CONTEST_MODE = 6;
export const MENU_STATE_PRINT_TEACH_MOVE_PROMPT = 8;
export const MENU_STATE_TEACH_MOVE_CONFIRM = 9;
export const MENU_STATE_PRINT_GIVE_UP_PROMPT = 12;
export const MENU_STATE_GIVE_UP_CONFIRM = 13;
export const MENU_STATE_FADE_AND_RETURN = 14;
export const MENU_STATE_RETURN_TO_FIELD = 15;
export const MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT = 16;
export const MENU_STATE_WAIT_FOR_TRYING_TO_LEARN = 17;
export const MENU_STATE_CONFIRM_DELETE_OLD_MOVE = 18;
export const MENU_STATE_PRINT_WHICH_MOVE_PROMPT = 19;
export const MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN = 20;
export const MENU_STATE_PRINT_STOP_TEACHING = 24;
export const MENU_STATE_WAIT_FOR_STOP_TEACHING = 25;
export const MENU_STATE_CONFIRM_STOP_TEACHING = 26;
export const MENU_STATE_CHOOSE_SETUP_STATE = 27;
export const MENU_STATE_FADE_FROM_SUMMARY_SCREEN = 28;
export const MENU_STATE_TRY_OVERWRITE_MOVE = 29;
export const MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE = 30;
export const MENU_STATE_PRINT_TEXT_THEN_FANFARE = 31;
export const MENU_STATE_WAIT_FOR_FANFARE = 32;
export const MENU_STATE_WAIT_FOR_A_BUTTON = 33;
export const TAG_MODE_ARROWS = 5325;
export const TAG_LIST_ARROWS = 5425;
export const GFXTAG_UI = 5525;
export const PALTAG_UI = 5526;
/** Raw expr: `max(MAX_LEVEL_UP_MOVES, 25)` */
export const MAX_RELEARNER_MOVES_EXPR = "max(MAX_LEVEL_UP_MOVES, 25)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_APPEAL_0 = {
  APPEAL_HEART_EMPTY: 0,
  APPEAL_HEART_FULL: 1,
  JAM_HEART_EMPTY: 2,
  JAM_HEART_FULL: 3,
} as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sMoveRelearnerMenuBackgroundTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sHeartSpriteOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sUnusedOam1 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sUnusedOam2 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sConstestMoveHeartSprite = { tileTag: "GFXTAG_UI", paletteTag: "PALTAG_UI", oam: "&sHeartSpriteOamData", anims: "sHeartSpriteAnimationCommands", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── SpriteSheet ─────────────────────────────────────────────────────────────
export const sMoveRelearnerSpriteSheet = { data: "sUI_Tiles", size: "sizeof(sUI_Tiles)", tag: "GFXTAG_UI" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sMoveRelearnerPalette = { data: "sUI_Pal", tag: "PALTAG_UI" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sUI_Pal': { path: 'graphics/interface/ui_learn_move.png', ext: '.gbapal', type: 'u16' },
  'sUI_Tiles': { path: 'graphics/interface/ui_learn_move.png', ext: '.4bpp', type: 'u8' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DoMoveRelearnerMain', ret: "void", arity: 0, params: "void" },
  { name: 'CreateLearnableMovesList', ret: "void", arity: 0, params: "void" },
  { name: 'CreateUISprites', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_MoveRelearnerMain', ret: "void", arity: 0, params: "void" },
  { name: 'Task_WaitForFadeOut', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CB2_InitLearnMove', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitLearnMoveReturnFromSelectMove', ret: "void", arity: 0, params: "void" },
  { name: 'InitMoveRelearnerBackgroundLayers', ret: "void", arity: 0, params: "void" },
  { name: 'AddScrollArrows', ret: "void", arity: 0, params: "void" },
  { name: 'HandleInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowTeachMoveText', ret: "void", arity: 1, params: "u8" },
  { name: 'GetCurrentSelectedMove', ret: "s32", arity: 0, params: "void" },
  { name: 'FreeMoveRelearnerResources', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveScrollArrows', ret: "void", arity: 0, params: "void" },
  { name: 'HideHeartSpritesAndShowTeachMoveText', ret: "void", arity: 1, params: "bool8" },
  { name: 'VBlankCB_MoveRelearner', ret: "void", arity: 0, params: "void" },
  { name: 'TeachMoveRelearnerMove', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMessageWithPlaceholders', ret: "void", arity: 1, params: "const u8 *src" },
  { name: 'MoveRelearnerShowHideHearts', ret: "void", arity: 1, params: "s32 move" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "&gSprites[sMoveRelearnerStruct->heartSpriteIds[i]], 0" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_WaitForFadeOut',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitLearnMove',
  'CB2_InitLearnMoveReturnFromSelectMove',
  'CB2_MoveRelearnerMain',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'battle.h',
  'bg.h',
  'contest_effect.h',
  'data.h',
  'event_data.h',
  'field_screen_effect.h',
  'gpu_regs.h',
  'move_relearner.h',
  'list_menu.h',
  'malloc.h',
  'menu.h',
  'menu_helpers.h',
  'menu_specialized.h',
  'overworld.h',
  'palette.h',
  'pokemon_summary_screen.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
