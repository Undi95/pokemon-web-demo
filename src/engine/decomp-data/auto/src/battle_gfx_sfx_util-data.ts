// AUTO-GENERATED from src/battle_gfx_sfx_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_gfx_sfx_util.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `var1` */
export const maxGroupNum_EXPR = "var1";
/** Raw expr: `var2` */
export const minGroupNum_EXPR = "var2";
/** Raw expr: `percent` */
export const selectedGroup_EXPR = "percent";
/** Raw expr: `var2` */
export const selectedMoves_EXPR = "var2";
/** Raw expr: `var1` */
export const moveTarget_EXPR = "var1";
/** Raw expr: `var1` */
export const numMovesPerGroup_EXPR = "var1";
/** Raw expr: `var2` */
export const numMultipleMoveGroups_EXPR = "var2";
/** Raw expr: `var2` */
export const randSelectGroup_EXPR = "var2";
/** Raw expr: `data[0]` */
export const sSpeedX_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tBattlerId_EXPR = "data[0]";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetBattlePalaceMoveGroup', ret: "u8", arity: 1, params: "u16 move" },
  { name: 'GetBattlePalaceTarget', ret: "u16", arity: 0, params: "void" },
  { name: 'SpriteCB_TrainerSlideVertical', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ShouldAnimBeDoneRegardlessOfSubstitute', ret: "bool8", arity: 1, params: "u8 animId" },
  { name: 'Task_ClearBitWhenBattleTableAnimDone', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ClearBitWhenSpecialAnimDone', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ClearSpritesBattlerHealthboxAnimData', ret: "void", arity: 0, params: "void" },
  { name: 'AllocateBattleSpritesData', ret: "void", arity: 0, params: "void" },
  { name: 'FreeBattleSpritesData', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseMoveAndTargetInBattlePalace', ret: "u16", arity: 0, params: "void" },
  { name: 'SpriteCB_WaitForBattlerBallReleaseAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UnusedDoBattleSpriteAffineAnim', ret: "UNUSED", arity: 2, params: "struct Sprite *sprite, bool8 pointless" },
  { name: 'StartSpriteAffineAnim', ret: "else", arity: 2, params: "sprite, 1" },
  { name: 'SpriteCB_TrainerSlideIn', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitAndLaunchChosenStatusAnimation', ret: "void", arity: 2, params: "bool8 isStatus2, u32 status" },
  { name: 'TryHandleLaunchBattleTableAnimation', ret: "bool8", arity: 5, params: "u8 activeBattler, u8 atkBattler, u8 defBattler, u8 tableId, u16 argument" },
  { name: 'InitAndLaunchSpecialAnimation', ret: "void", arity: 4, params: "u8 activeBattler, u8 atkBattler, u8 defBattler, u8 tableId" },
  { name: 'IsMoveWithoutAnimation', ret: "bool8", arity: 2, params: "u16 move, u8 animationTurn" },
  { name: 'IsBattleSEPlaying', ret: "bool8", arity: 1, params: "u8 battler" },
  { name: 'BattleLoadOpponentMonSpriteGfx', ret: "void", arity: 2, params: "struct Pokemon *mon, u8 battler" },
  { name: 'BattleLoadPlayerMonSpriteGfx', ret: "void", arity: 2, params: "struct Pokemon *mon, u8 battler" },
  { name: 'BattleGfxSfxDummy1', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'BattleGfxSfxDummy2', ret: "void", arity: 1, params: "u16 species" },
  { name: 'DecompressTrainerFrontPic', ret: "void", arity: 2, params: "u16 frontPicId, u8 battler" },
  { name: 'DecompressTrainerBackPic', ret: "void", arity: 2, params: "u16 backPicId, u8 battler" },
  { name: 'BattleGfxSfxDummy3', ret: "void", arity: 1, params: "u8 gender" },
  { name: 'FreeTrainerFrontPicPalette', ret: "void", arity: 1, params: "u16 frontPicId" },
  { name: 'BattleLoadAllHealthBoxesGfxAtOnce', ret: "void", arity: 0, params: "void" },
  { name: 'BattleLoadAllHealthBoxesGfx', ret: "bool8", arity: 1, params: "u8 state" },
  { name: 'LoadCompressedSpriteSheet', ret: "else", arity: 1, params: "&sSpriteSheet_SinglesPlayerHealthbox" },
  { name: 'LoadBattleBarGfx', ret: "void", arity: 1, params: "u8 unused" },
  { name: 'BattleInitAllSprites', ret: "bool8", arity: 2, params: "u8 *state1, u8 *battler" },
  { name: 'DummyBattleInterfaceFunc', ret: "else", arity: 2, params: "gHealthboxSpriteIds[*battler], TRUE" },
  { name: 'ClearSpritesHealthboxAnimData', ret: "void", arity: 0, params: "void" },
  { name: 'CopyAllBattleSpritesInvisibilities', ret: "void", arity: 0, params: "void" },
  { name: 'CopyBattleSpriteInvisibility', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'HandleSpeciesGfxDataChange', ret: "void", arity: 3, params: "u8 battlerAtk, u8 battlerDef, bool8 castform" },
  { name: 'BattleLoadSubstituteOrMonSpriteGfx', ret: "void", arity: 2, params: "u8 battler, bool8 loadMonSprite" },
  { name: 'LZDecompressVram', ret: "else", arity: 2, params: "gSubstituteDollBackGfx, gMonSpritesGfxPtr->sprites.ptr[position]" },
  { name: 'LoadBattleMonGfxAndAnimate', ret: "void", arity: 3, params: "u8 battler, bool8 loadMonSprite, u8 spriteId" },
  { name: 'TrySetBehindSubstituteSpriteBit', ret: "void", arity: 2, params: "u8 battler, u16 move" },
  { name: 'ClearBehindSubstituteBit', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'HandleLowHpMusicChange', ret: "void", arity: 2, params: "struct Pokemon *mon, u8 battler" },
  { name: 'BattleStopLowHpSound', ret: "void", arity: 0, params: "void" },
  { name: 'GetMonHPBarLevel', ret: "u8", arity: 1, params: "struct Pokemon *mon" },
  { name: 'HandleBattleLowHpMusicChange', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattlerSpriteAffineMode', ret: "void", arity: 1, params: "u8 affineMode" },
  { name: 'LoadAndCreateEnemyShadowSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_EnemyShadow', ret: "void", arity: 1, params: "struct Sprite *shadowSprite" },
  { name: 'SpriteCB_SetInvisible', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetBattlerShadowSpriteCallback', ret: "void", arity: 2, params: "u8 battler, u16 species" },
  { name: 'HideBattlerShadowSprite', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'FillAroundBattleWindows', ret: "void", arity: 0, params: "void" },
  { name: 'ClearTemporarySpeciesSpriteData', ret: "void", arity: 2, params: "u8 battler, bool8 dontClearSubstitute" },
  { name: 'AllocateMonSpritesGfx', ret: "void", arity: 0, params: "void" },
  { name: 'FreeMonSpritesGfx', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldPlayNormalMonCry', ret: "bool32", arity: 1, params: "struct Pokemon *mon" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ClearBitWhenBattleTableAnimDone',
  'Task_ClearBitWhenSpecialAnimDone',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_controllers.h',
  'battle_ai_script_commands.h',
  'battle_anim.h',
  'constants/battle_anim.h',
  'battle_interface.h',
  'main.h',
  'dma3.h',
  'malloc.h',
  'graphics.h',
  'random.h',
  'util.h',
  'pokemon.h',
  'constants/moves.h',
  'task.h',
  'sprite.h',
  'sound.h',
  'party_menu.h',
  'm4a.h',
  'decompress.h',
  'data.h',
  'palette.h',
  'contest.h',
  'constants/songs.h',
  'constants/rgb.h',
  'constants/battle_palace.h',
] as const;
