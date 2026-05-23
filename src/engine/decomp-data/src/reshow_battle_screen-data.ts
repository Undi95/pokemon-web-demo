// AUTO-GENERATED from src/reshow_battle_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/reshow_battle_screen.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_ReshowBattleScreenAfterMenu', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBattlerSpriteGfx', ret: "bool8", arity: 1, params: "u8 battler" },
  { name: 'CreateBattlerSprite', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'CreateHealthboxSprite', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'ClearBattleBgCntBaseBlocks', ret: "void", arity: 0, params: "void" },
  { name: 'ReshowBattleScreenDummy', ret: "void", arity: 0, params: "void" },
  { name: 'ReshowBattleScreenAfterMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BattleLoadSubstituteOrMonSpriteGfx', ret: "else", arity: 2, params: "battler, FALSE" },
  { name: 'UpdateHealthboxAttribute', ret: "else", arity: 3, params: "gHealthboxSpriteIds[battler], &gPlayerParty[gBattlerPartyIndexes[battler]], HEALTHBOX_ALL" },
  { name: 'DummyBattleInterfaceFunc', ret: "else", arity: 2, params: "gHealthboxSpriteIds[battler], FALSE" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ReshowBattleScreenAfterMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'reshow_battle_screen.h',
  'battle.h',
  'palette.h',
  'pokemon.h',
  'main.h',
  'scanline_effect.h',
  'text.h',
  'gpu_regs.h',
  'bg.h',
  'battle_controllers.h',
  'link.h',
  'sprite.h',
  'constants/trainers.h',
  'battle_interface.h',
  'battle_anim.h',
  'data.h',
] as const;
