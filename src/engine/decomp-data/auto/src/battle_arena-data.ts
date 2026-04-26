// AUTO-GENERATED from src/battle_arena.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_arena.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const JUDGMENT_STATE_FINISHED = 8;
export const TAG_JUDGMENT_ICON = 1000;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_ANIM_0 = {
  ANIM_ICON_X: 0,
  ANIM_ICON_TRIANGLE: 1,
  ANIM_ICON_CIRCLE: 2,
  ANIM_ICON_LINE: 3,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_JudgmentIcon = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 15, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_JudgmentIcon = { tileTag: "TAG_JUDGMENT_ICON", paletteTag: "TAG_NONE", oam: "&sOam_JudgmentIcon", anims: "sAnims_JudgmentIcon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_JudgmentIcon" } as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sArenaFunctions = ['InitArenaChallenge', 'GetArenaData', 'SetArenaData', 'SaveArenaChallenge', 'SetArenaPrize', 'GiveArenaPrize', 'BufferArenaOpponentName'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitArenaChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetArenaData', ret: "void", arity: 0, params: "void" },
  { name: 'SetArenaData', ret: "void", arity: 0, params: "void" },
  { name: 'SaveArenaChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'SetArenaPrize', ret: "void", arity: 0, params: "void" },
  { name: 'GiveArenaPrize', ret: "void", arity: 0, params: "void" },
  { name: 'BufferArenaOpponentName', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_JudgmentIcon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ShowJudgmentSprite', ret: "void", arity: 4, params: "u8 x, u8 y, u8 category, u8 battler" },
  { name: 'CallBattleArenaFunction', ret: "void", arity: 0, params: "void" },
  { name: 'BattleArena_ShowJudgmentWindow', ret: "u8", arity: 1, params: "u8 *state" },
  { name: 'BattleArena_InitPoints', ret: "void", arity: 0, params: "void" },
  { name: 'BattleArena_AddMindPoints', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'BattleArena_AddSkillPoints', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'BattleArena_DeductSkillPoints', ret: "void", arity: 2, params: "u8 battler, u16 stringId" },
  { name: 'UpdateHPAtStart', ret: "UNUSED", arity: 1, params: "u8 battler" },
  { name: 'DrawArenaRefereeTextBox', ret: "void", arity: 0, params: "void" },
  { name: 'EraseArenaRefereeTextBox', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_arena.h',
  'battle_message.h',
  'battle_setup.h',
  'battle_tower.h',
  'bg.h',
  'decompress.h',
  'event_data.h',
  'frontier_util.h',
  'graphics.h',
  'gpu_regs.h',
  'item.h',
  'm4a.h',
  'overworld.h',
  'palette.h',
  'random.h',
  'sound.h',
  'string_util.h',
  'text.h',
  'util.h',
  'constants/songs.h',
  'constants/battle_arena.h',
  'constants/battle_string_ids.h',
  'constants/battle_frontier.h',
  'constants/frontier_util.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/rgb.h',
] as const;
