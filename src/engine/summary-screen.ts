/**
 * summary-screen.ts — Écran RÉSUMÉ Pokémon 1:1 décomp `pokemon_summary_screen.c`
 * (4183 lignes). Port FIDÈLE de l'architecture décomp (PAS un MVP) :
 *
 *   - State `sMon` = miroir de `sMonSummaryScreen` (struct décomp:128) : summary
 *     (données mon extraites), windowIds[8], bgTilemapBuffers[4][2], currPage
 *     Index, min/maxPageIndex, bgDisplayOrder, spriteIds, mode…
 *   - `sBgTemplates`/`_initBGs` 1:1 (:319/:1302) : BG0 windows ; BG1/2 ping-pong
 *     page scroll ; BG3 = page INFO.
 *   - `_decompressGraphics` 1:1 (:1321) : tiles + 5 page tilemaps → bgTilemap
 *     Buffers, palettes, sprite sheets move-types.
 *   - `_resetWindows` (:2721) = InitWindows(sSummaryTemplate) (20 windows label
 *     statiques) ; `_addWindowFromTemplateList` (:2990) windows dynamiques
 *     par page (windowIds[8]).
 *   - `_printPageNamesAndStats` 1:1 (:2832) : tous les labels statiques FR.
 *   - dispatch page `sTextPrinterFunctions` 1:1 (:730) : PrintInfoPageText /
 *     PrintSkillsPageText / PrintBattleMoves / PrintContestMoves.
 *   - `_putPageWindowTilemaps`/`_clearPageWindowTilemaps` 1:1 (:2887/:2943).
 *   - `Task_HandleInput` full 1:1 (:1532) : U/D mon, L/R page, A/B close.
 *   - `_changePage`/`_pssScrollRight|Left` 1:1 (:1761/:1785/:1828) : scroll
 *     inter-pages via hofs (ChangeBgX décomp fidèle).
 *   - `_loadGraphics` state machine 1:1 (:1175, 25 états).
 *   - Fades 1:1 : BeginNormalPaletteFade open (case 24) + BeginCloseSummary
 *     Screen (:1508). Retour party 1:1 (sMonSummaryScreen->callback).
 *
 * Combat bytecode + overworld = scellés (NE PAS toucher). Le sac = Phase 2.
 */

import {
  InitWindows, AddWindow, FillWindowPixelBuffer, FillWindowPixelRect, PutWindowTilemap,
  CopyWindowToVram, RemoveWindow, ShowBg, HideBg, BlitBitmapToWindow, ClearWindowTilemap,
} from './gba-window-system';
import {
  AddTextPrinterParameterized3, GetStringWidth, GetStringRightAlignXOffset,
  GetStringCenterAlignXOffset, FONT_NORMAL, TEXT_SKIP_DRAW,
} from './gba-text-system';
import { gameState } from './game-state';
import {
  getAbility, getSpeciesInfo, getNatureNameByIndex, getMove, getMoveName,
  getMoveDescription, getContestMove, getContestEffect, getContestEffectDescription, getItemNameFr,
  getExperienceForLevel,
} from './data/game-data';
import {
  DynamicPlaceholderTextUtil_Reset,
  DynamicPlaceholderTextUtil_SetPlaceholderPtr,
  DynamicPlaceholderTextUtil_ExpandPlaceholders,
} from './dynamic-placeholder-text-util';
import { GetMapNameHandleAquaHideout } from './decomp-bridge';
import {
  PlaySE, LoadPalette, getRuntime,
  BlendPalettes, ResetPaletteFade, ResetTasks,
} from './decomp-globals';
import { ResetSpriteData } from './decomp-bridge';
import { FadeScreen, FADE_FROM_BLACK } from './fade-screen';
import { getString } from './gba-strings';
import { loadGbaPal, loadTilemapBin, loadTileBin } from './gba/png-loader';
import { OBJ_PLTT_ID, BG_PLTT_ID } from './decomp-runtime';
import { pokemonInstanceToPokemon } from './battle/party-storage';
import { moveDexIdToEnum } from './battle/data/move-name-resolve';
import { PokemonSummaryDoMonAnimation, StopPokemonAnimations, HasTwoFramesAnimation, preloadFrontPicAnims } from './mon-summary-anim';
import type { DecompTask, DecompSprite } from './decomp-runtime';
import type { PokemonInstance } from './pokemon';

/* ============================================================================
 * Constantes 1:1 décomp
 * ========================================================================== */

// 1:1 décomp `enum { PSS_PAGE_INFO, ... }` (pokemon_summary_screen.h).
const PSS_PAGE_INFO = 0;
const PSS_PAGE_SKILLS = 1;
const PSS_PAGE_BATTLE_MOVES = 2;
const PSS_PAGE_CONTEST_MOVES = 3;
const PSS_PAGE_COUNT = 4;

// 1:1 décomp window-id #defines (pokemon_summary_screen.c:58-89).
const PSS_LABEL_WINDOW_POKEMON_INFO_TITLE = 0;
const PSS_LABEL_WINDOW_POKEMON_SKILLS_TITLE = 1;
const PSS_LABEL_WINDOW_BATTLE_MOVES_TITLE = 2;
const PSS_LABEL_WINDOW_CONTEST_MOVES_TITLE = 3;
const PSS_LABEL_WINDOW_PROMPT_CANCEL = 4;
const PSS_LABEL_WINDOW_PROMPT_INFO = 5;
const PSS_LABEL_WINDOW_PROMPT_SWITCH = 6;
const PSS_LABEL_WINDOW_POKEMON_INFO_RENTAL = 8;
const PSS_LABEL_WINDOW_POKEMON_INFO_TYPE = 9;
const PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_LEFT = 10;
const PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_RIGHT = 11;
const PSS_LABEL_WINDOW_POKEMON_SKILLS_EXP = 12;
const PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS = 13;
const PSS_LABEL_WINDOW_MOVES_POWER_ACC = 14;
const PSS_LABEL_WINDOW_MOVES_APPEAL_JAM = 15;
const PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER = 17;
const PSS_LABEL_WINDOW_PORTRAIT_NICKNAME = 18;
const PSS_LABEL_WINDOW_PORTRAIT_SPECIES = 19;
const PSS_LABEL_WINDOW_END = 20;

// Dynamic fields — Info page (:92-95).
const PSS_DATA_WINDOW_INFO_ORIGINAL_TRAINER = 0;
const PSS_DATA_WINDOW_INFO_ID = 1;
const PSS_DATA_WINDOW_INFO_ABILITY = 2;
const PSS_DATA_WINDOW_INFO_MEMO = 3;
// Skills page (:98-102).
const PSS_DATA_WINDOW_SKILLS_HELD_ITEM = 0;
const PSS_DATA_WINDOW_SKILLS_RIBBON_COUNT = 1;
const PSS_DATA_WINDOW_SKILLS_STATS_LEFT = 2;
const PSS_DATA_WINDOW_SKILLS_STATS_RIGHT = 3;
const PSS_DATA_WINDOW_EXP = 4;
// Moves pages (:105-107).
const PSS_DATA_WINDOW_MOVE_NAMES = 0;
const PSS_DATA_WINDOW_MOVE_PP = 1;
const PSS_DATA_WINDOW_MOVE_DESCRIPTION = 2;

const WINDOW_NONE = 0xFF;

interface WT { bg: number; tilemapLeft: number; tilemapTop: number; width: number; height: number; paletteNum: number; baseBlock: number }

// 1:1 décomp `sSummaryTemplate[]` (pokemon_summary_screen.c:407). Index =
// PSS_LABEL_WINDOW_*. Les trous (UNUSED/END) = DUMMY (width 0).
const sSummaryTemplate: ReadonlyArray<WT> = [
  /*  0 INFO_TITLE      */ { bg: 0, tilemapLeft: 0,  tilemapTop: 0,  width: 11, height: 2, paletteNum: 6, baseBlock: 1 },
  /*  1 SKILLS_TITLE    */ { bg: 0, tilemapLeft: 0,  tilemapTop: 0,  width: 11, height: 2, paletteNum: 6, baseBlock: 23 },
  /*  2 BATTLE_TITLE    */ { bg: 0, tilemapLeft: 0,  tilemapTop: 0,  width: 11, height: 2, paletteNum: 6, baseBlock: 45 },
  /*  3 CONTEST_TITLE   */ { bg: 0, tilemapLeft: 0,  tilemapTop: 0,  width: 11, height: 2, paletteNum: 6, baseBlock: 67 },
  /*  4 PROMPT_CANCEL   */ { bg: 0, tilemapLeft: 22, tilemapTop: 0,  width: 8,  height: 2, paletteNum: 7, baseBlock: 89 },
  /*  5 PROMPT_INFO     */ { bg: 0, tilemapLeft: 22, tilemapTop: 0,  width: 8,  height: 2, paletteNum: 7, baseBlock: 105 },
  /*  6 PROMPT_SWITCH   */ { bg: 0, tilemapLeft: 22, tilemapTop: 0,  width: 8,  height: 2, paletteNum: 7, baseBlock: 121 },
  /*  7 UNUSED1         */ { bg: 0, tilemapLeft: 11, tilemapTop: 4,  width: 0,  height: 2, paletteNum: 6, baseBlock: 137 },
  /*  8 INFO_RENTAL     */ { bg: 0, tilemapLeft: 11, tilemapTop: 4,  width: 18, height: 2, paletteNum: 6, baseBlock: 137 },
  /*  9 INFO_TYPE       */ { bg: 0, tilemapLeft: 11, tilemapTop: 6,  width: 18, height: 2, paletteNum: 6, baseBlock: 173 },
  /* 10 SKILLS_L        */ { bg: 0, tilemapLeft: 10, tilemapTop: 7,  width: 6,  height: 6, paletteNum: 6, baseBlock: 209 },
  /* 11 SKILLS_R        */ { bg: 0, tilemapLeft: 22, tilemapTop: 7,  width: 5,  height: 6, paletteNum: 6, baseBlock: 245 },
  /* 12 SKILLS_EXP      */ { bg: 0, tilemapLeft: 10, tilemapTop: 14, width: 11, height: 4, paletteNum: 6, baseBlock: 275 },
  /* 13 SKILLS_STATUS   */ { bg: 0, tilemapLeft: 0,  tilemapTop: 18, width: 6,  height: 2, paletteNum: 6, baseBlock: 319 },
  /* 14 MOVES_POWER_ACC */ { bg: 0, tilemapLeft: 1,  tilemapTop: 15, width: 9,  height: 4, paletteNum: 6, baseBlock: 331 },
  /* 15 MOVES_APPEAL_JAM*/ { bg: 0, tilemapLeft: 1,  tilemapTop: 15, width: 5,  height: 4, paletteNum: 6, baseBlock: 367 },
  /* 16 UNUSED2         */ { bg: 0, tilemapLeft: 22, tilemapTop: 4,  width: 0,  height: 2, paletteNum: 6, baseBlock: 387 },
  /* 17 PORTRAIT_DEX    */ { bg: 0, tilemapLeft: 1,  tilemapTop: 2,  width: 4,  height: 2, paletteNum: 7, baseBlock: 387 },
  /* 18 PORTRAIT_NICK   */ { bg: 0, tilemapLeft: 1,  tilemapTop: 12, width: 9,  height: 2, paletteNum: 6, baseBlock: 395 },
  /* 19 PORTRAIT_SPECIES*/ { bg: 0, tilemapLeft: 1,  tilemapTop: 14, width: 9,  height: 4, paletteNum: 6, baseBlock: 413 },
];

// 1:1 décomp `sPageInfoTemplate[]` (:591).
const sPageInfoTemplate: ReadonlyArray<WT> = [
  /* 0 OT     */ { bg: 0, tilemapLeft: 11, tilemapTop: 4,  width: 11, height: 2, paletteNum: 6, baseBlock: 449 },
  /* 1 ID     */ { bg: 0, tilemapLeft: 22, tilemapTop: 4,  width: 7,  height: 2, paletteNum: 6, baseBlock: 471 },
  /* 2 ABILITY*/ { bg: 0, tilemapLeft: 11, tilemapTop: 9,  width: 19, height: 4, paletteNum: 6, baseBlock: 485 }, // w19 = FR diff
  /* 3 MEMO   */ { bg: 0, tilemapLeft: 11, tilemapTop: 14, width: 18, height: 6, paletteNum: 6, baseBlock: 561 }, // bb561 = FR diff
];
// 1:1 décomp `sPageSkillsTemplate[]` (:630).
const sPageSkillsTemplate: ReadonlyArray<WT> = [
  /* 0 HELD_ITEM */ { bg: 0, tilemapLeft: 10, tilemapTop: 4,  width: 10, height: 2, paletteNum: 6, baseBlock: 449 },
  /* 1 RIBBON    */ { bg: 0, tilemapLeft: 20, tilemapTop: 4,  width: 10, height: 2, paletteNum: 6, baseBlock: 469 },
  /* 2 STATS_L   */ { bg: 0, tilemapLeft: 16, tilemapTop: 7,  width: 6,  height: 6, paletteNum: 6, baseBlock: 489 },
  /* 3 STATS_R   */ { bg: 0, tilemapLeft: 27, tilemapTop: 7,  width: 3,  height: 6, paletteNum: 6, baseBlock: 525 },
  /* 4 EXP       */ { bg: 0, tilemapLeft: 24, tilemapTop: 14, width: 6,  height: 4, paletteNum: 6, baseBlock: 543 },
];
// 1:1 décomp `sPageMovesTemplate[]` (:678) — partagé battle/contest.
const sPageMovesTemplate: ReadonlyArray<WT> = [
  /* 0 NAMES */ { bg: 0, tilemapLeft: 15, tilemapTop: 4,  width: 9,  height: 10, paletteNum: 6, baseBlock: 449 },
  /* 1 PP    */ { bg: 0, tilemapLeft: 24, tilemapTop: 4,  width: 6,  height: 10, paletteNum: 8, baseBlock: 539 },
  /* 2 DESC  */ { bg: 0, tilemapLeft: 10, tilemapTop: 15, width: 20, height: 4,  paletteNum: 6, baseBlock: 599 },
];

/** 1:1 décomp `sTextColors[][3]` (:708) — [bg,fg,shadow] indices palette. */
const sTextColors: ReadonlyArray<readonly number[]> = [
  [0, 1, 2], [0, 3, 4], [0, 5, 6], [0, 7, 8], [0, 9, 10], [0, 11, 12],
  [0, 13, 14], [0, 7, 8], [13, 15, 14], [0, 1, 2], [0, 3, 4], [0, 5, 6], [0, 7, 8],
];

/** 1:1 décomp include/constants/pokemon.h TYPE_* enum (ordre sheet move_types). */
const TYPE_ID: Record<string, number> = {
  TYPE_NORMAL: 0, TYPE_FIGHTING: 1, TYPE_FLYING: 2, TYPE_POISON: 3,
  TYPE_GROUND: 4, TYPE_ROCK: 5, TYPE_BUG: 6, TYPE_GHOST: 7, TYPE_STEEL: 8,
  TYPE_MYSTERY: 9, TYPE_FIRE: 10, TYPE_WATER: 11, TYPE_GRASS: 12,
  TYPE_ELECTRIC: 13, TYPE_PSYCHIC: 14, TYPE_ICE: 15, TYPE_DRAGON: 16,
  TYPE_DARK: 17,
};
const NUMBER_OF_MON_TYPES = 18;
// 1:1 décomp CONTEST_CATEGORY enum (include/constants/contest.h) → sheet idx.
const CONTEST_CATEGORY_ID: Record<string, number> = {
  CONTEST_CATEGORY_COOL: 0, CONTEST_CATEGORY_BEAUTY: 1, CONTEST_CATEGORY_CUTE: 2,
  CONTEST_CATEGORY_SMART: 3, CONTEST_CATEGORY_TOUGH: 4,
};
/** 1:1 décomp `sMoveTypeToOamPaletteNum[NUMBER_OF_MON_TYPES + CONTEST_
 *  CATEGORIES_COUNT]` (:907) — 18 types + 5 contest → OBJ pal slot 13/14/15. */
const sMoveTypeToOamPaletteNum: ReadonlyArray<number> = [
  13, 13, 14, 14, 13, 13, 15, 14, 13, 15, 13, 14, 15, 13, 14, 14, 15, 13, // types
  13, 14, 14, 15, 13, // COOL BEAUTY CUTE SMART TOUGH
];

const TYPE_ICON_TILE_BASE = 0;            // OBJ VRAM : 23 icônes × 8 = 184 tiles
/** 1:1 décomp `gMonFrontPicTable[]` = `gMonFrontPic_X` = anim_front.png
 *  (64×128 = 2 frames × 64 tiles). frame 0 = base..+63, frame 1 = base+64..
 *  +127 (StartSpriteAnim(.,1) → tileId += 64). 128 tiles réservés. */
const MON_PIC_TILE_BASE = 184;
const MON_PIC_FRAME_TILES = 64;           // 64×64 = 64 tiles / frame
const MON_PIC_BYTE_OFFSET = MON_PIC_TILE_BASE * 32;
const MON_PIC_PAL_SLOT = 1;
/** 1:1 décomp `sStatusIconsSpriteSheet` (gStatusGfx_Icons = graphics/
 *  interface/status_icons.png, 32×64 = 32 tiles). Sprite 32×8 (shape1 size1),
 *  frame = (ailment-1)*4 tiles (Poison=0/Para=4/Sleep=8/Frozen=12/Burn=16).
 *  OBJ tile 312+ (après mon-pic 2-frame 184..311). OBJ pal slot 2 (libre). */
const STATUS_TILE_BASE = 312;
const STATUS_BYTE_OFFSET = STATUS_TILE_BASE * 32;
const STATUS_PAL_SLOT = 2;
/** 1:1 décomp `CreateMonMarkingAllCombosSprite` (mon_markings.c:570) :
 *  sMonMarkings_Gfx (ui/interface/mon_markings.png, 32×128 = 64 tiles = 16
 *  combos × 4). Sprite 32×8 (sOamData_MarkingCombo shape1 size1), anim combo
 *  = StartSpriteAnim(MON_DATA_MARKINGS) → FRAME(combo*4). @(60,26) prio 1.
 *  Palette = sMarkings_Pal (summary_screen/markings.pal). OBJ tile 344+. */
const MARKINGS_TILE_BASE = 344;
const MARKINGS_BYTE_OFFSET = MARKINGS_TILE_BASE * 32;
const MARKINGS_PAL_SLOT = 3;
/** 1:1 décomp `CreateCaughtBallSprite` (:4069) : gBallGfx_Poke (balls/
 *  poke.png 16×48 = 12 tiles, frame 0 = ball fermée). ItemIdToBallId
 *  (battle_anim_throw.c:728) ITEM_POKE_BALL→BALL_POKE. Sprite 16×16
 *  (sBallOamData) @(16,136), callback dummy (statique), oam.priority=3.
 *  OBJ tile 408+. (Nos mons = ITEM_POKE_BALL 1:1 CreateBoxMon:2262.) */
const BALL_TILE_BASE = 408;
const BALL_BYTE_OFFSET = BALL_TILE_BASE * 32;
const BALL_PAL_SLOT = 4;
/** 1:1 décomp `sMoveSelectorSpriteSheet` (gSummaryMoveSelect_Gfx = graphics/
 *  summary_screen/move_select.png, 16×128 = 32 tiles 8×8, size 0x400). Sprite
 *  16×16 (sOamData_MoveSelector shape0 size1, 4 tiles). Frames anims
 *  Left/Right/Middle = ANIMCMD_FRAME tile 16/16+hFlip/20 ; SetMainMoveSelector
 *  Color(1) = 24/24+hFlip/28. OBJ tile 420+ (après ball 408..419). Pal slot 5
 *  (libre). Chargé via .4bpp.bin + .gbapal (ordre PLTE, PAS LoadCompressed
 *  SpriteSheet : png-loader reconstruit la pal par ordre d'apparition). */
const MOVE_SELECTOR_TILE_BASE = 420;
const MOVE_SELECTOR_BYTE_OFFSET = MOVE_SELECTOR_TILE_BASE * 32;
const MOVE_SELECTOR_PAL_SLOT = 5;
const MOVE_SELECTOR_SPRITES_COUNT = 10;

// ⚠️ ZÉRO HARDCODE (user : projet public/moddable). TOUTES les strings
// viennent de `/decomp/em/strings.json` (extract-strings.mjs depuis
// strings.c + data/text) via `getString(label)` (gba-strings.ts, chargé au
// boot). Un moddeur qui édite strings.c → re-extract → tout se met à jour
// sans toucher au code. `_initSummaryStrings()` (appelé au CB2 init, après
// le chargement boot des strings) remplit ces `let` depuis getString().
let S_MEMO_NATURE_TEXT_COLOR = '';
let S_MEMO_MISC_TEXT_COLOR = '';
let S_STATS_LEFT_COLUMN_LAYOUT = '';
let S_STATS_RIGHT_COLUMN_LAYOUT = '';
let S_MOVES_PP_LAYOUT = '';
let GTEXT_X_NATURE_MET_AT_YZ = '';
let GTEXT_X_NATURE_HATCHED_AT_YZ = '';
let GTEXT_X_NATURE_MET_SOMEWHERE_AT = '';
let GTEXT_X_NATURE_HATCHED_SOMEWHERE_AT = '';
let gText_PkmnInfo = '';
let gText_PkmnSkills = '';
let gText_BattleMoves = '';
let gText_ContestMoves = '';
let gText_Cancel = '';     // "SORTIR" (slot 5 move-select)
let gText_Cancel2 = '';    // "RETOUR" (prompt bouton A/B)
let gText_Info = '';
let gText_Switch = '';
let gText_RentalPkmn = '';
let gText_TypeSlash = '';
let gText_HP4 = '';
let gText_Attack3 = '';
let gText_Defense3 = '';
let gText_SpAtk4 = '';
let gText_SpDef4 = '';
let gText_Speed2 = '';
let gText_ExpPoints = '';
let gText_NextLv = '';
let gText_Status = '';
let gText_Power = '';
let gText_Accuracy2 = '';
let gText_Appeal = '';
let gText_Jam = '';
let gText_None = '';
let gText_OneDash = '';
let gText_TwoDashes = '';
let gText_ThreeDashes = '';
let gText_RibbonsVar1 = '';   // "RUBANS: {STR_VAR_1}" (placeholder substitué)
let gText_EggNickname = '';
let gText_FiveMarks = '';
let gText_EggWillTakeALongTime = '';
let gText_EggWillTakeSomeTime = '';
let gText_EggWillHatchSoon = '';
let gText_EggAboutToHatch = '';
let gText_OddEggFoundByCouple = '';
let gText_OTSlash = '';
let gText_LevelSymbol = '';
let gText_NumberClear01 = '';
let gText_IDNumber2 = '';
let gText_MaleSymbol = '';
let gText_FemaleSymbol = '';
let _summaryStringsReady = false;

/** Remplit les strings depuis le décomp extrait (strings.json via
 *  gba-strings.ts, chargé au boot). 1:1, zéro hardcode. Idempotent. */
function _initSummaryStrings(): void {
  S_MEMO_NATURE_TEXT_COLOR = getString('sMemoNatureTextColor');
  S_MEMO_MISC_TEXT_COLOR = getString('sMemoMiscTextColor');
  S_STATS_LEFT_COLUMN_LAYOUT = getString('sStatsLeftColumnLayout');
  S_STATS_RIGHT_COLUMN_LAYOUT = getString('sStatsRightColumnLayout');
  S_MOVES_PP_LAYOUT = getString('sMovesPPLayout');
  GTEXT_X_NATURE_MET_AT_YZ = getString('gText_XNatureMetAtYZ');
  GTEXT_X_NATURE_HATCHED_AT_YZ = getString('gText_XNatureHatchedAtYZ');
  GTEXT_X_NATURE_MET_SOMEWHERE_AT = getString('gText_XNatureMetSomewhereAt');
  GTEXT_X_NATURE_HATCHED_SOMEWHERE_AT = getString('gText_XNatureHatchedSomewhereAt');
  gText_PkmnInfo = getString('gText_PkmnInfo');
  gText_PkmnSkills = getString('gText_PkmnSkills');
  gText_BattleMoves = getString('gText_BattleMoves');
  gText_ContestMoves = getString('gText_ContestMoves');
  gText_Cancel = getString('gText_Cancel');
  gText_Cancel2 = getString('gText_Cancel2');
  gText_Info = getString('gText_Info');
  gText_Switch = getString('gText_Switch');
  gText_RentalPkmn = getString('gText_RentalPkmn');
  gText_TypeSlash = getString('gText_TypeSlash');
  gText_HP4 = getString('gText_HP4');
  gText_Attack3 = getString('gText_Attack3');
  gText_Defense3 = getString('gText_Defense3');
  gText_SpAtk4 = getString('gText_SpAtk4');
  gText_SpDef4 = getString('gText_SpDef4');
  gText_Speed2 = getString('gText_Speed2');
  gText_ExpPoints = getString('gText_ExpPoints');
  gText_NextLv = getString('gText_NextLv');
  gText_Status = getString('gText_Status');
  gText_Power = getString('gText_Power');
  gText_Accuracy2 = getString('gText_Accuracy2');
  gText_Appeal = getString('gText_Appeal');
  gText_Jam = getString('gText_Jam');
  gText_None = getString('gText_None');
  gText_OneDash = getString('gText_OneDash');
  gText_TwoDashes = getString('gText_TwoDashes');
  gText_ThreeDashes = getString('gText_ThreeDashes');
  gText_RibbonsVar1 = getString('gText_RibbonsVar1');
  gText_EggNickname = getString('gText_EggNickname');
  gText_FiveMarks = getString('gText_FiveMarks');
  gText_EggWillTakeALongTime = getString('gText_EggWillTakeALongTime');
  gText_EggWillTakeSomeTime = getString('gText_EggWillTakeSomeTime');
  gText_EggWillHatchSoon = getString('gText_EggWillHatchSoon');
  gText_EggAboutToHatch = getString('gText_EggAboutToHatch');
  gText_OddEggFoundByCouple = getString('gText_OddEggFoundByCouple');
  gText_OTSlash = getString('gText_OTSlash');
  gText_LevelSymbol = getString('gText_LevelSymbol');
  gText_NumberClear01 = getString('gText_NumberClear01');
  gText_IDNumber2 = getString('gText_IDNumber2');
  gText_MaleSymbol = getString('gText_MaleSymbol');
  gText_FemaleSymbol = getString('gText_FemaleSymbol');
  _summaryStringsReady = true;
}

/** 1:1 décomp `sBgTemplates[]` (:319). */
const SUMMARY_WIN_MAP_BASE = 31;     // BG0
const SUMMARY_BG1_MAP_BASE = 27;     // BG1 (page scroll A)
const SUMMARY_BG2_MAP_BASE = 25;     // BG2 (page scroll B)
const SUMMARY_BG3_MAP_BASE = 29;     // BG3 (page INFO)
const SUMMARY_TILES_CHAR_BASE = 2;   // BG1/2/3 tiles

// 1:1 décomp BG_COORD_* (gba/bg.h).
const BG_COORD_SET = 0;
const BG_COORD_ADD = 1;
const BG_COORD_SUB = 2;

/* ============================================================================
 * State — miroir `sMonSummaryScreen` (struct décomp:128)
 * ========================================================================== */

interface SummaryData {
  species: string;       // speciesEnum
  exp: number;
  level: number;
  abilityNum: number;
  item: string;          // heldItem EN ("" si rien)
  pid: number;           // personality
  isEgg: boolean;
  moves: string[];       // 4 move dexIds ("" si vide)
  pp: number[];          // 4 pp courant
  ppMax: number[];       // 4 pp max
  currentHP: number; maxHP: number;
  atk: number; def: number; spatk: number; spdef: number; speed: number;
  friendship: number;
  OTGender: number;      // 0 male / 1 female
  nature: number;        // index 0..24
  OTName: string;
  OTID: number;
  ribbonCount: number;
  ailment: number;       // AILMENT_NONE=0 / 1..6
  metLocation: string | undefined;
  metLevel: number | undefined;
  pokeball: string;      // 1:1 MON_DATA_POKEBALL (ITEM_*), default ITEM_POKE_BALL
  markings: number;      // 1:1 MON_DATA_MARKINGS (0..15 bitfield)
}

interface SummaryState {
  callback: (() => void) | null;
  currentMon: PokemonInstance | null;
  summary: SummaryData;
  /** 1:1 décomp `bgTilemapBuffers[PSS_PAGE_COUNT][2][0x400]` = par page UN
   *  buffer CONTIGU de 0x800 u16 (screenSize=1, 64×32) : SC0 = [0..0x3FF]
   *  (cols 0-31, décomp `[page][0]`) ; SC1 = [0x400..0x7FF] (cols 32-63,
   *  décomp `[page][1]`). INFO : SC0=info, SC1=infoEgg. SKILLS/BATTLE/CONTEST :
   *  SC1=contenu (révélé en scrollant hofs 0→256), SC0=vide. */
  bgTilemapBuffers: Uint16Array[];     // [PSS_PAGE_COUNT] (chacun 0x800 u16)
  mode: number;
  curMonIndex: number;
  maxMonIndex: number;
  currPageIndex: number;
  minPageIndex: number;
  maxPageIndex: number;
  bgDisplayOrder: number;
  windowIds: number[];                 // [8] (WINDOW_NONE = vide)
  switchCounter: number;
  /** 1:1 décomp `sMonSummaryScreen->firstMoveIndex` (u8 0..MAX_MON_MOVES) —
   *  curseur sélection de move (4 = slot CANCEL/nouveau move). */
  firstMoveIndex: number;
  /** 1:1 décomp `sMonSummaryScreen->secondMoveIndex` — 2e curseur (réordre). */
  secondMoveIndex: number;
  /** 1:1 décomp `sMonSummaryScreen->newMove` — MOVE_NONE en mode NORMAL
   *  (notre flux party→RÉSUME ; le slot 5 affiche "ANNULE"). '' = MOVE_NONE. */
  newMove: string;
  /** 1:1 décomp `sMonSummaryScreen->lockMovesFlag` — FALSE en mode NORMAL
   *  (TRUE = contexte interdisant le réordre, ex. Battle Factory). */
  lockMovesFlag: boolean;
}

const SUMMARY_MODE_NORMAL = 0;
const MAX_MON_MOVES = 4;

function _emptySummary(): SummaryData {
  return {
    species: 'SPECIES_NONE', exp: 0, level: 0, abilityNum: 0, item: '', pid: 0,
    isEgg: false, moves: ['', '', '', ''], pp: [0, 0, 0, 0], ppMax: [0, 0, 0, 0],
    currentHP: 0, maxHP: 0, atk: 0, def: 0, spatk: 0, spdef: 0, speed: 0,
    friendship: 0, OTGender: 0, nature: 0, OTName: '', OTID: 0, ribbonCount: 0,
    ailment: 0, metLocation: undefined, metLevel: undefined,
    pokeball: 'ITEM_POKE_BALL', markings: 0,
  };
}

const sMon: SummaryState = {
  callback: null, currentMon: null, summary: _emptySummary(),
  bgTilemapBuffers: [], mode: SUMMARY_MODE_NORMAL, curMonIndex: 0, maxMonIndex: 0,
  currPageIndex: 0, minPageIndex: 0, maxPageIndex: 3, bgDisplayOrder: 0,
  windowIds: [WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE],
  switchCounter: 0,
  firstMoveIndex: 0, secondMoveIndex: 0, newMove: '', lockMovesFlag: false,
};

let _isOpen = false;
let _phase: 'idle' | 'open' | 'fading_out' = 'idle';
let _inputTaskId = -1;
let _graphicsReady = false;
let _graphicsLoading = false;
let _cryPlayed = false;
let _typeSpriteIds: number[] = [];
let _monPicSpriteId = -1;
let _statusSpriteId = -1;
let _markingsSpriteId = -1;
let _ballSpriteId = -1;
/** Liste party (UP/DOWN) — 1:1 décomp `monList.mons` (= gPlayerParty). */
let _monList: PokemonInstance[] = [];
/** 1:1 décomp `gLastViewedMonIndex` (pokemon_summary_screen.c:190) — set au
 *  close = curMonIndex. Le party menu y replace son curseur au retour. */
let _lastViewedMonIndex = 0;

// 1:1 décomp `sSpeciesToHoennPokedexNum` (extract-species-dex-numbers.mjs).
let _dexNumbers: Record<string, { national: number; hoenn: number }> | null = null;
let _hoennDexCount = 202;

/* ============================================================================
 * Assets
 * ========================================================================== */

interface SummaryAssets {
  tiles: Uint8Array;
  pageInfoTilemap: Uint16Array;
  pageInfoEggTilemap: Uint16Array;
  pageSkillsTilemap: Uint16Array;
  pageBattleMovesTilemap: Uint16Array;
  pageContestMovesTilemap: Uint16Array;
  tilesPalette: Uint16Array;
  moveTypesTiles: Uint8Array;
  moveTypesPal: Uint16Array;
  aButtonTiles: Uint8Array;
  /** 1:1 décomp `gPPTextPalette` (graphics/battle_interface/text_pp.pal) —
   *  chargé à BG_PLTT_ID(8)+1 ; la fenêtre MOVE_PP est paletteNum 8 (sinon
   *  PP rendu en noir = bug repéré user). */
  ppTextPal: Uint16Array;
  /** 1:1 décomp `sMarkings_Pal` (summary_screen/markings.pal) — palette
   *  OBJ du sprite marques PC (passée à CreateMonMarkingAllCombosSprite). */
  markingsPal: Uint16Array;
  /** 1:1 décomp `gBallGfx_Poke` (balls/poke.4bpp.bin, PLTT-indexed) +
   *  `gBallPal_Poke` (balls/poke.gbapal, ordre PLTE EXACT). Chargés
   *  séparément (PAS LoadCompressedSpriteSheet qui reconstruit la palette
   *  par ordre d'apparition → blanc rendu gris). */
  ballTiles: Uint8Array;
  ballPal: Uint16Array;
  /** 1:1 décomp `gSummaryMoveSelect_Gfx`+`_Pal` (move_select.png, PLTT-indexed
   *  → .4bpp.bin + .gbapal ordre PLTE EXACT, comme la pokéball). */
  moveSelectTiles: Uint8Array;
  moveSelectPal: Uint16Array;
  /** 1:1 décomp `gSummaryScreen_MoveEffect_Battle_Tilemap` (effect_battle.bin,
   *  u16) = gfx de `sPowerAccSlidingWindow` (EFFET combat, w10 h7). */
  effectBattleTilemap: Uint16Array;
  /** 1:1 décomp `gSummaryScreen_MoveEffect_Contest_Tilemap` (effect_contest
   *  .bin) = gfx de `sAppealJamSlidingWindow` (EFFET concours, w10 h7). */
  effectContestTilemap: Uint16Array;
  /** 1:1 décomp `gSummaryScreen_MoveEffect_Cancel_Tilemap` (effect_cancel.bin)
   *  = slot "ANNULE"/5e move (TilemapFiveMovesDisplay). */
  effectCancelTilemap: Uint16Array;
}

let _assets: SummaryAssets | null = null;
let _assetsLoading: Promise<SummaryAssets> | null = null;

async function _loadAssets(): Promise<SummaryAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [tiles, pInfo, pInfoEgg, pSkills, pBattle, pContest, tilesPal, mtTiles, mtPal, aBtn, ppPal, mkPal, blTiles, blPal,
      msTiles, msPal, effBat, effCon, effCan] =
      await Promise.all([
        loadTileBin('/decomp/em/summary_screen/tiles.png', 4),
        loadTilemapBin('/decomp/em/summary_screen/page_info.bin'),
        loadTilemapBin('/decomp/em/summary_screen/page_info_egg.bin'),
        loadTilemapBin('/decomp/em/summary_screen/page_skills.bin'),
        loadTilemapBin('/decomp/em/summary_screen/page_battle_moves.bin'),
        loadTilemapBin('/decomp/em/summary_screen/page_contest_moves.bin'),
        loadGbaPal('/decomp/em/summary_screen/tiles.pal'),
        loadTileBin('/decomp/em/types/move_types.png', 4),
        loadGbaPal('/decomp/em/types/move_types.gbapal'),
        loadTileBin('/decomp/em/summary_screen/a_button.png', 4),
        loadGbaPal('/decomp/em/battle_interface/text_pp.pal'),
        loadGbaPal('/decomp/em/summary_screen/markings.pal'),
        loadTileBin('/decomp/em/balls/poke.4bpp.bin', 4),
        loadGbaPal('/decomp/em/balls/poke.gbapal'),
        loadTileBin('/decomp/em/summary_screen/move_select.4bpp.bin', 4),
        loadGbaPal('/decomp/em/summary_screen/move_select.gbapal'),
        loadTilemapBin('/decomp/em/summary_screen/effect_battle.bin'),
        loadTilemapBin('/decomp/em/summary_screen/effect_contest.bin'),
        loadTilemapBin('/decomp/em/summary_screen/effect_cancel.bin'),
      ]);
    _assets = {
      tiles, pageInfoTilemap: pInfo, pageInfoEggTilemap: pInfoEgg,
      pageSkillsTilemap: pSkills, pageBattleMovesTilemap: pBattle,
      pageContestMovesTilemap: pContest, tilesPalette: tilesPal,
      moveTypesTiles: mtTiles, moveTypesPal: mtPal, aButtonTiles: aBtn,
      ppTextPal: ppPal, markingsPal: mkPal, ballTiles: blTiles, ballPal: blPal,
      moveSelectTiles: msTiles, moveSelectPal: msPal,
      effectBattleTilemap: effBat, effectContestTilemap: effCon,
      effectCancelTilemap: effCan,
    };
    return _assets;
  })();
  return _assetsLoading;
}

/* ============================================================================
 * Gestionnaire BG buffers — fidèle au modèle décomp (WRAM buffer + copy VRAM)
 * adapté à notre runtime (VRAM directe + hofs). 1:1 sémantique :
 *   SetBgTilemapBuffer / ScheduleBgCopyTilemapToVram / ChangeBgX / SetBgAttribute
 * ========================================================================== */

/** Quelle page chaque BG (1,2,3) affiche (1:1 décomp `SetBgTilemapBuffer`). */
const _bgBufRef: number[] = [0, 0, 0, 0];
/** 1:1 décomp `ChangeBgX` fixed-point (bg.c) : x 32-bit, hofs = x>>8. */
const _bgX = [0, 0, 0, 0];

function _bgMapBase(bg: number): number {
  return bg === 1 ? SUMMARY_BG1_MAP_BASE : bg === 2 ? SUMMARY_BG2_MAP_BASE : SUMMARY_BG3_MAP_BASE;
}

/** 1:1 décomp `SetBgTilemapBuffer(bg, &bgTilemapBuffers[page][0])`. Notre
 *  buffer page = 0x800 u16 contigus (SC0+SC1) = la tilemap screenSize=1. */
function _setBgTilemapBuffer(bg: number, page: number): void {
  _bgBufRef[bg] = page;
}
/** 1:1 décomp `GetBgTilemapBuffer(bg)` → page liée. */
function _getBgPage(bg: number): number {
  return _bgBufRef[bg];
}

/** 1:1 décomp `ScheduleBgCopyTilemapToVram(bg)` — copie le buffer page lié
 *  (0x800 u16 = SC0+SC1) vers la VRAM mapBase du BG (= bg.tilemap view,
 *  2048 entries screenSize=1). */
function _scheduleBgCopy(bg: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (bg === 0) { /* BG0 = windows, géré par CopyWindowToVram */ return; }
  const buf = sMon.bgTilemapBuffers[_bgBufRef[bg]];
  if (!buf) return;
  const base = _bgMapBase(bg) * 0x800;
  const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  rt.gba.vram.set(bytes, base);              // 0x1000 bytes = SC0 + SC1
}

/** 1:1 décomp `ChangeBgX(bg, value, mode)` (bg.c). */
function _changeBgX(bg: number, value: number, mode: number): void {
  if (mode === BG_COORD_SET) _bgX[bg] = value;
  else if (mode === BG_COORD_ADD) _bgX[bg] += value;
  else if (mode === BG_COORD_SUB) _bgX[bg] -= value;
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.bg(bg as 0 | 1 | 2 | 3).config.hofs = (_bgX[bg] >> 8) & 0x1FF;
}

/** 1:1 décomp `SetBgAttribute(bg, BG_ATTR_PRIORITY, p)`. */
function _setBgPriority(bg: number, p: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.bg(bg as 0 | 1 | 2 | 3).config.priority = p;
}

/** 1:1 décomp `SetBgTilemapPalette(bg, x, y, w, h, pal)` : force le nibble
 *  palette des tiles du buffer dans le rect (tile entry bits 12-15). */
function _setBgTilemapPalette(bg: number, x: number, y: number, w: number, h: number, pal: number): void {
  const buf = sMon.bgTilemapBuffers[_bgBufRef[bg]];
  if (!buf) return;
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      const i = row * 32 + col;
      if (i >= 0 && i < buf.length) buf[i] = (buf[i] & 0x0FFF) | ((pal & 0xF) << 12);
    }
  }
}

/* ============================================================================
 * 1:1 décomp `InitBGs` (:1302)
 * ========================================================================== */

function _initBGs(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  // ResetVramOamAndBgCntRegs équivalent.
  rt.SetGpuReg(0x00, 0);
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0;
    oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) { rt.gPlttBufferUnfaded.set(i, 0); rt.gPlttBufferFaded.set(i, 0); }
  for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);

  // 1:1 sBgTemplates (:319). BG0 charBase0 mapBase31 prio0 ; BG1 charBase2
  // mapBase27 screenSize1 prio1 ; BG2 charBase2 mapBase25 ss1 prio2 ; BG3
  // charBase2 mapBase29 ss1 prio3.
  const cfg = (n: 0 | 1 | 2 | 3) => rt.gba.bg(n).config;
  const b0 = cfg(0);
  b0.charBaseIndex = 0; b0.mapBaseIndex = SUMMARY_WIN_MAP_BASE; b0.screenSize = 0;
  b0.paletteMode = 0; b0.priority = 0; b0.visible = true; b0.hofs = 0; b0.vofs = 0;
  const setPageBg = (n: 1 | 2 | 3, mapBase: number, prio: number) => {
    const c = cfg(n);
    c.charBaseIndex = SUMMARY_TILES_CHAR_BASE; c.mapBaseIndex = mapBase;
    c.screenSize = 1; c.paletteMode = 0; c.priority = prio; c.visible = true;
    c.hofs = 0; c.vofs = 0;
  };
  setPageBg(1, SUMMARY_BG1_MAP_BASE, 1);
  setPageBg(2, SUMMARY_BG2_MAP_BASE, 2);
  setPageBg(3, SUMMARY_BG3_MAP_BASE, 3);
  for (let i = 0; i < 4; i++) { _bgX[i] = 0; }

  // 1:1 InitBGs : SetBgTilemapBuffer(1, BATTLE_MOVES[0]) ; (2, SKILLS[0]) ;
  // (3, INFO[0]). ResetAllBgsCoordinates. ScheduleBgCopy 1/2/3.
  _setBgTilemapBuffer(1, PSS_PAGE_BATTLE_MOVES);
  _setBgTilemapBuffer(2, PSS_PAGE_SKILLS);
  _setBgTilemapBuffer(3, PSS_PAGE_INFO);
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0);
  // DISPCNT : BG0-3 ON + OBJ ON + OBJ 1D map.
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400 | 0x800);
  rt.SetGpuReg(0x50, 0); // BLDCNT = 0
  ShowBg(0); ShowBg(1); ShowBg(2); ShowBg(3);
}

/* ============================================================================
 * 1:1 décomp `DecompressGraphics` (:1321) + extraction données mon
 * ========================================================================== */

function _allocBgBuffers(): void {
  sMon.bgTilemapBuffers = [];
  for (let p = 0; p < PSS_PAGE_COUNT; p++) {
    sMon.bgTilemapBuffers.push(new Uint16Array(0x800)); // SC0 + SC1 contigus
  }
}

/** Charge gfx/tilemaps/palettes (1:1 DecompressGraphics, étalé async). */
function _loadSummaryGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
  if (!rt) return false;
  if (_graphicsReady) return true;
  if (_graphicsLoading) return false;
  _graphicsLoading = true;
  void _loadAssets().then(async (a) => {
    const r = getRuntime();
    if (!r) { _graphicsLoading = false; return; }
    _allocBgBuffers();
    // case 0 : tiles → BG charBase 2.
    r.gba.vram.set(a.tiles, SUMMARY_TILES_CHAR_BASE * 0x4000);
    // case 1-5 : LZDecompressWram page tilemaps → bgTilemapBuffers. Décomp
    // `[page][0]` = SC0 (offset 0) ; `[page][1]` = SC1 (offset 0x400).
    // INFO : SC0=info, SC1=infoEgg. SKILLS/BATTLE/CONTEST : SC1=contenu.
    sMon.bgTilemapBuffers[PSS_PAGE_INFO].set(a.pageInfoTilemap.subarray(0, 0x400), 0);
    sMon.bgTilemapBuffers[PSS_PAGE_INFO].set(a.pageInfoEggTilemap.subarray(0, 0x400), 0x400);
    sMon.bgTilemapBuffers[PSS_PAGE_SKILLS].set(a.pageSkillsTilemap.subarray(0, 0x400), 0x400);
    sMon.bgTilemapBuffers[PSS_PAGE_BATTLE_MOVES].set(a.pageBattleMovesTilemap.subarray(0, 0x400), 0x400);
    sMon.bgTilemapBuffers[PSS_PAGE_CONTEST_MOVES].set(a.pageContestMovesTilemap.subarray(0, 0x400), 0x400);
    // case 6 : LoadCompressedPalette(gSummaryScreen_Pal, BG_PLTT_ID(0),
    // 8*PLTT_SIZE_4BPP) + LoadPalette(gPPTextPalette, BG_PLTT_ID(8)+1,
    // PLTT_SIZEOF(16-1)) — la 2e = palette PP (fenêtre MOVE_PP paletteNum 8,
    // sinon PP rendu noir). 8 pals = 128 couleurs.
    LoadPalette(a.tilesPalette, 0, 8 * 16 * 2);
    LoadPalette(a.ppTextPal, BG_PLTT_ID(8) + 1, 15 * 2);
    // case 7/12 : sSpriteSheet_MoveTypes → OBJ VRAM ; gMoveTypes_Pal → OBJ
    // pal slots 13/14/15 (3 pals).
    r.gba.objVram.set(a.moveTypesTiles, TYPE_ICON_TILE_BASE * 32);
    r.LoadPaletteObj(a.moveTypesPal, OBJ_PLTT_ID(13));
    // case 9/10 : sStatusIconsSpriteSheet (gStatusGfx_Icons = status_icons
    // .png) → OBJ VRAM + sStatusIconsSpritePalette → OBJ pal slot 2.
    try {
      const st = await r.LoadCompressedSpriteSheet('/decomp/em/ui/interface/status_icons.png', STATUS_BYTE_OFFSET);
      r.LoadPaletteObj(st.palette, OBJ_PLTT_ID(STATUS_PAL_SLOT));
    } catch (e) { console.error('[summary] status icons load failed:', e); }
    // 1:1 CreateMonMarkingAllCombosSprite : sMonMarkings_Gfx → OBJ VRAM,
    // palette = sMarkings_Pal (summary_screen/markings.pal, PAS la pal png).
    try {
      await r.LoadCompressedSpriteSheet('/decomp/em/ui/interface/mon_markings.png', MARKINGS_BYTE_OFFSET);
      r.LoadPaletteObj(a.markingsPal, OBJ_PLTT_ID(MARKINGS_PAL_SLOT));
    } catch (e) { console.error('[summary] markings load failed:', e); }
    // 1:1 CreateCaughtBallSprite : gBallGfx_Poke (poke.4bpp.bin, PLTT-indexed)
    // → OBJ VRAM + gBallPal_Poke (poke.gbapal, ordre PLTE EXACT) → pal OBJ.
    // PAS LoadCompressedSpriteSheet (reconstruit la palette par ordre
    // d'apparition → indices mélangés → blanc rendu gris = bug user).
    try {
      r.gba.objVram.set(a.ballTiles, BALL_TILE_BASE * 32);
      r.LoadPaletteObj(a.ballPal, OBJ_PLTT_ID(BALL_PAL_SLOT));
    } catch (e) { console.error('[summary] ball gfx load failed:', e); }
    // 1:1 décomp `sMoveSelectorSpriteSheet`/`sMoveSelectorSpritePal` (chargés
    // par CreateMoveSelectorSprites au 1er besoin ; ici on précharge en OBJ
    // VRAM/pal — .4bpp.bin + .gbapal ordre PLTE EXACT, PAS LoadCompressed
    // SpriteSheet, comme la pokéball).
    try {
      r.gba.objVram.set(a.moveSelectTiles, MOVE_SELECTOR_BYTE_OFFSET);
      r.LoadPaletteObj(a.moveSelectPal, OBJ_PLTT_ID(MOVE_SELECTOR_PAL_SLOT));
    } catch (e) { console.error('[summary] move-select gfx load failed:', e); }
    // 1:1 LoadMonGfxAndSprite (:3900) : front pic mon → OBJ VRAM + palette.
    const mon = sMon.currentMon;
    if (mon) {
      // 1:1 LoadMonGfxAndSprite (:3900) : gMonFrontPicTable[species2] =
      // anim_front.png 2 frames (front.png si œuf / HasTwoFrames FALSE).
      await _loadMonFrontPic(r, mon);
    }
    await preloadFrontPicAnims();   // séquences AnimCmd 2-frame (front-pic-anims.json)
    if (!_dexNumbers) {
      try {
        const dj = await fetch('/decomp/em/species-dex-numbers.json').then((rsp) => rsp.json());
        _hoennDexCount = dj.__HOENN_DEX_COUNT ?? 202;
        delete dj.__HOENN_DEX_COUNT;
        _dexNumbers = dj;
      } catch (e) { console.error('[summary] species-dex-numbers load failed:', e); }
    }
    _graphicsReady = true;
    _graphicsLoading = false;
  }).catch((e) => { console.error('[summary] graphics load failed:', e); _graphicsLoading = false; });
  return false;
}

/** 1:1 décomp `CopyMonToSummaryStruct` + `ExtractMonDataToSummaryStruct`
 *  (:1386/:1400). Source = PokemonInstance (party). Stats via CalculateMonStats
 *  1:1 (pokemonInstanceToPokemon). */
function _extractMonData(mon: PokemonInstance): void {
  const s = _emptySummary();
  s.species = mon.speciesEnum;
  s.level = mon.level;
  s.pid = mon.personality ?? 0;
  s.abilityNum = s.pid & 1;
  s.item = mon.heldItem || '';
  s.isEgg = mon.isEgg ?? false;                 // 1:1 MON_DATA_IS_EGG
  s.nature = (mon.personality ?? 0) % 25;       // GetNature = pid % NUM_NATURES
  s.currentHP = mon.currentHp; s.maxHP = mon.maxHp;
  s.OTName = gameState.playerName ?? '';
  s.OTID = (gameState.trainerId ?? 0) >>> 0;
  s.OTGender = gameState.gender === 'FEMALE' ? 1 : 0;
  s.metLocation = mon.metLocation;
  s.metLevel = mon.metLevel;
  s.pokeball = mon.pokeball || 'ITEM_POKE_BALL'; // 1:1 MON_DATA_POKEBALL
  s.markings = mon.markings ?? 0;                // 1:1 MON_DATA_MARKINGS
  s.friendship = mon.friendship ?? 0;            // 1:1 MON_DATA_FRIENDSHIP (œuf)
  s.ribbonCount = 0;                              // PokemonInstance n'a pas de rubans
  // ailment 1:1 GetMonAilment : AILMENT_NONE=0, PSN=1, PAR=2, SLP=3, FRZ=4,
  // BRN=5, plus PSN(TOX) traité comme PSN. (sStatusIconsSpriteSheet anim idx.)
  const st = mon.status;
  s.ailment = st === 'PSN' || st === 'TOX' ? 1 : st === 'PAR' ? 2 : st === 'SLP' ? 3
    : st === 'FRZ' ? 4 : st === 'BRN' ? 5 : 0;
  // moves + pp. 1:1 décomp `summary.moves[i]` = move identifier. Notre
  // équivalent = l'ENUM ("MOVE_ABSORB") car moves-data/move-names-fr/
  // move-descriptions-fr/contest sont keyés par enum (mv.id = dexId
  // "absorb" → moveDexIdToEnum). gMoveNames[move]/gBattleMoves[move] 1:1.
  for (let i = 0; i < 4; i++) {
    const mv = mon.moves[i];
    if (mv && mv.id) {
      s.moves[i] = moveDexIdToEnum(mv.id);
      s.pp[i] = mv.pp;
      s.ppMax[i] = mv.ppMax;
    }
  }
  // exp.
  const sp = getSpeciesInfo(mon.speciesEnum);
  s.exp = mon.currentExp ?? (sp ? getExperienceForLevel(sp.growthRate, mon.level) : 0);
  // stats calculées 1:1 décomp (CalculateMonStats via pokemonInstanceToPokemon).
  try {
    const p = pokemonInstanceToPokemon(mon);
    s.atk = p.attack; s.def = p.defense; s.spatk = p.spAttack;
    s.spdef = p.spDefense; s.speed = p.speed;
    if (p.maxHP) { s.maxHP = p.maxHP; }
    if (typeof p.hp === 'number') { s.currentHP = p.hp; }
  } catch { /* fallback : currentHp/maxHp instance déjà set */ }
  sMon.summary = s;
}

/* ============================================================================
 * Windows — 1:1 ResetWindows / PrintTextOnWindow / AddWindowFromTemplateList
 * ========================================================================== */

/** Window id réel runtime par template-id (sSummaryTemplate). */
let _labelWindowIds: number[] = [];

/** 1:1 décomp `ResetWindows` (:2721) — InitWindows(sSummaryTemplate). */
function _resetWindows(): void {
  _labelWindowIds = InitWindows(sSummaryTemplate as unknown as Parameters<typeof InitWindows>[0]);
  for (let i = 0; i < PSS_LABEL_WINDOW_END; i++) FillWindowPixelBuffer(i, 0);
  for (let i = 0; i < sMon.windowIds.length; i++) sMon.windowIds[i] = WINDOW_NONE;
}

/** 1:1 décomp `PrintTextOnWindow(wid,str,x,y,ls,colorId)` (:2733) =
 *  AddTextPrinterParameterized4(wid, FONT_NORMAL, x, y, 0, ls, sTextColors
 *  [colorId], 0, str). Notre primitive validée = Param3 (line-spacing par
 *  défaut, suffisant : validé A/B sur le mémo multi-ligne). */
function _printTextOnWindow(windowId: number, str: string, x: number, y: number, _ls: number, colorId: number): void {
  if (windowId === WINDOW_NONE) return;
  AddTextPrinterParameterized3(windowId, FONT_NORMAL, x, y, sTextColors[colorId] ?? sTextColors[0], TEXT_SKIP_DRAW, str);
}

/** 1:1 décomp `AddWindowFromTemplateList` (:2990). */
function _addWindowFromTemplateList(template: ReadonlyArray<WT>, templateId: number): number {
  let wid = sMon.windowIds[templateId];
  if (wid === WINDOW_NONE) {
    wid = AddWindow(template[templateId] as Parameters<typeof AddWindow>[0]);
    FillWindowPixelBuffer(wid, 0);
    sMon.windowIds[templateId] = wid;
  }
  return wid;
}

/** 1:1 décomp `RemoveWindowByIndex` (:3001). */
function _removeWindowByIndex(windowIndex: number): void {
  const wid = sMon.windowIds[windowIndex];
  if (wid !== WINDOW_NONE) {
    try { ClearWindowTilemap(wid); RemoveWindow(wid); } catch { /* déjà retiré */ }
    sMon.windowIds[windowIndex] = WINDOW_NONE;
  }
}

/** Helper : push tilemap window → VRAM (= PutWindowTilemap + CopyWindowToVram). */
function _flushWin(wid: number): void {
  if (wid === WINDOW_NONE) return;
  PutWindowTilemap(wid);
  CopyWindowToVram(wid, 3 /* COPYWIN_FULL */);
}

/** 1:1 décomp `LoadMonGfxAndSprite` (:3900) : gMonFrontPicTable[species2] =
 *  `gMonFrontPic_X` = anim_front.png (64×128 = 2 frames, frame 1 = base+64
 *  tiles, jouée par StartSpriteAnim(.,1)). Œuf → egg/front.png (oneFrame).
 *  castform/deoxys/spinda/unown (HasTwoFramesAnimation FALSE) → front.png
 *  1-frame. Fallback front.png si anim_front absent. */
async function _loadMonFrontPic(
  r: NonNullable<ReturnType<typeof getRuntime>>, mon: PokemonInstance,
): Promise<void> {
  const isEgg = !!mon.isEgg;
  const dexId = isEgg ? 'egg' : mon.speciesEnum.replace('SPECIES_', '').toLowerCase();
  const twoFrame = !isEgg && HasTwoFramesAnimation(mon.speciesEnum);
  const url = `/decomp/em/pokemon/${dexId}/${twoFrame ? 'anim_front' : 'front'}.png`;
  try {
    const ld = await r.LoadCompressedSpriteSheet(url, MON_PIC_BYTE_OFFSET);
    r.LoadPaletteObj(ld.palette, OBJ_PLTT_ID(MON_PIC_PAL_SLOT));
  } catch {
    try {                                       // anim_front absent → front.png 1-frame
      const ld = await r.LoadCompressedSpriteSheet(`/decomp/em/pokemon/${dexId}/front.png`, MON_PIC_BYTE_OFFSET);
      r.LoadPaletteObj(ld.palette, OBJ_PLTT_ID(MON_PIC_PAL_SLOT));
    } catch (e) { console.error('[summary] mon front pic load failed:', e); }
  }
}

/* ============================================================================
 * 1:1 décomp Pokédex num (SpeciesToPokedexNum :6364) — Hoenn (national off)
 * ========================================================================== */

function _speciesToPokedexNum(speciesEnum: string): number {
  const e = _dexNumbers?.[speciesEnum];
  if (!e) return 0xFFFF;
  return e.hoenn <= _hoennDexCount ? e.hoenn : 0xFFFF;
}

/* ============================================================================
 * 1:1 décomp `PrintMonInfo`/`PrintNotEggInfo` (:2738/:2750)
 * ========================================================================== */

function _setMonPicBackgroundPalette(isShiny: boolean): void {
  // 1:1 SetMonPicBackgroundPalette (:2627) : SetBgTilemapPalette(3,1,4,8,8,
  // 0|5) + ScheduleBgCopy(3).
  _setBgTilemapPalette(3, 1, 4, 8, 8, isShiny ? 5 : 0);
  _scheduleBgCopy(3);
}

function _printNotEggInfo(): void {
  const sum = sMon.summary;
  const mon = sMon.currentMon;
  if (!mon) return;
  const dexNum = _speciesToPokedexNum(sum.species);
  if (dexNum !== 0xFFFF) {
    // gText_NumberClear01 = "{NO}{CLEAR 1}" (strings.c:210) + dexNum 3-digit
    // leading zeros.
    // 1:1 : StringCopy(gStringVar1, gText_NumberClear01) + ConvertInt 3-digit.
    const dexStr = gText_NumberClear01 + String(dexNum).padStart(3, '0');
    if (!mon.isShiny) {
      _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER, dexStr, 0, 1, 0, 1);
      _setMonPicBackgroundPalette(false);
    } else {
      _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER, dexStr, 0, 1, 0, 7);
      _setMonPicBackgroundPalette(true);
    }
    _flushWin(PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER);
  } else {
    ClearWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER);
    _setMonPicBackgroundPalette(!!mon.isShiny);
  }
  // gText_LevelSymbol "N." + level (LEFT_ALIGN) @(24,17) color1, SPECIES win.
  // 1:1 : StringCopy(gStringVar1, gText_LevelSymbol) + ConvertInt level.
  _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, gText_LevelSymbol + String(sum.level), 24, 17, 0, 1);
  // GetMonNickname @(0,1) color1, NICKNAME win.
  _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_NICKNAME, mon.nickname, 0, 1, 0, 1);
  // CHAR_SLASH + gSpeciesNames @(0,1) color1, SPECIES win.
  // 1:1 : strArray[0]=CHAR_SLASH (charmap '/', char structurel, pas une
  // string traduisible) ; &strArray[1]=gSpeciesNames[species2] (= déjà
  // extrait via speciesNameFr, zéro hardcode).
  _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, '/' + mon.speciesNameFr, 0, 1, 0, 1);
  // 1:1 PrintGenderSymbol (:2805) : sauf NIDORAN_M/F ; ♂ color3 / ♀ color4
  // @(57,17).
  if (sum.species !== 'SPECIES_NIDORAN_M' && sum.species !== 'SPECIES_NIDORAN_F') {
    if (mon.monGender === 0) _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, gText_MaleSymbol, 57, 17, 0, 3);
    else if (mon.monGender === 254) _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, gText_FemaleSymbol, 57, 17, 0, 4);
  }
  _flushWin(PSS_LABEL_WINDOW_PORTRAIT_NICKNAME);
  _flushWin(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);
}

/** 1:1 décomp `PrintEggInfo` (:2796) : surnom "OEUF" @(0,1) color1 ;
 *  DEX_NUMBER + SPECIES windows ClearWindowTilemap (rien). */
function _printEggInfo(): void {
  _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_NICKNAME, gText_EggNickname, 0, 1, 0, 1);
  _flushWin(PSS_LABEL_WINDOW_PORTRAIT_NICKNAME);
  ClearWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER);
  ClearWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);
}

/** 1:1 décomp `PrintMonInfo` (:2738). */
function _printMonInfo(): void {
  FillWindowPixelBuffer(PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER, 0);
  FillWindowPixelBuffer(PSS_LABEL_WINDOW_PORTRAIT_NICKNAME, 0);
  FillWindowPixelBuffer(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, 0);
  if (!sMon.summary.isEgg) _printNotEggInfo();
  else _printEggInfo();
  _scheduleBgCopy(0);
}

/* ============================================================================
 * 1:1 décomp `PrintPageNamesAndStats` (:2832) — labels statiques FR
 * ========================================================================== */

function _printAOrBButtonIcon(windowId: number, x: number): void {
  // 1:1 PrintAOrBButtonIcon(.,FALSE,x) : sButtons_Gfx[0]=a_button.png 16×16.
  const a = _assets?.aButtonTiles;
  if (a && windowId !== WINDOW_NONE) BlitBitmapToWindow(windowId, a, x, 0, 16, 16);
}

function _printPageNamesAndStats(): void {
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_INFO_TITLE, gText_PkmnInfo, 2, 1, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_TITLE, gText_PkmnSkills, 2, 1, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_BATTLE_MOVES_TITLE, gText_BattleMoves, 2, 1, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_CONTEST_MOVES_TITLE, gText_ContestMoves, 2, 1, 0, 1);

  let sx = GetStringRightAlignXOffset(gText_Cancel2, 62);
  let ix = Math.max(0, sx - 16);
  _printAOrBButtonIcon(PSS_LABEL_WINDOW_PROMPT_CANCEL, ix);
  _printTextOnWindow(PSS_LABEL_WINDOW_PROMPT_CANCEL, gText_Cancel2, sx, 1, 0, 0);

  sx = GetStringRightAlignXOffset(gText_Info, 62);
  ix = Math.max(0, sx - 16);
  _printAOrBButtonIcon(PSS_LABEL_WINDOW_PROMPT_INFO, ix);
  _printTextOnWindow(PSS_LABEL_WINDOW_PROMPT_INFO, gText_Info, sx, 1, 0, 0);

  sx = GetStringRightAlignXOffset(gText_Switch, 62);
  ix = Math.max(0, sx - 16);
  _printAOrBButtonIcon(PSS_LABEL_WINDOW_PROMPT_SWITCH, ix);
  _printTextOnWindow(PSS_LABEL_WINDOW_PROMPT_SWITCH, gText_Switch, sx, 1, 0, 0);

  // RENTAL : seulement Battle Factory/Tent (jamais notre contexte) — 1:1.
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_INFO_RENTAL, gText_RentalPkmn, 0, 1, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_INFO_TYPE, gText_TypeSlash, 0, 1, 0, 0);

  let stx = 6 + GetStringCenterAlignXOffset(gText_HP4, 42);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_LEFT, gText_HP4, stx, 1, 0, 1);
  stx = 6 + GetStringCenterAlignXOffset(gText_Attack3, 42);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_LEFT, gText_Attack3, stx, 17, 0, 1);
  stx = 6 + GetStringCenterAlignXOffset(gText_Defense3, 42);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_LEFT, gText_Defense3, stx, 33, 0, 1);
  stx = 2 + GetStringCenterAlignXOffset(gText_SpAtk4, 36);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_RIGHT, gText_SpAtk4, stx, 1, 0, 1);
  stx = 2 + GetStringCenterAlignXOffset(gText_SpDef4, 36);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_RIGHT, gText_SpDef4, stx, 17, 0, 1);
  stx = 2 + GetStringCenterAlignXOffset(gText_Speed2, 36);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_RIGHT, gText_Speed2, stx, 33, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_EXP, gText_ExpPoints, 6, 1, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_EXP, gText_NextLv, 6, 17, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS, gText_Status, 2, 1, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_MOVES_POWER_ACC, gText_Power, 0, 1, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_MOVES_POWER_ACC, gText_Accuracy2, 0, 17, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_MOVES_APPEAL_JAM, gText_Appeal, 0, 1, 0, 1);
  _printTextOnWindow(PSS_LABEL_WINDOW_MOVES_APPEAL_JAM, gText_Jam, 0, 17, 0, 1);
}

/* ============================================================================
 * 1:1 décomp page INFO (`PrintInfoPageText` :3028 + helpers :3078..3170)
 * ========================================================================== */

function _printMonOTName(): void {
  const wid = _addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_ORIGINAL_TRAINER);
  // 1:1 : gText_OTSlash (= "DO/" FR, extrait).
  _printTextOnWindow(wid, gText_OTSlash, 0, 1, 0, 1);
  const x = GetStringWidth(gText_OTSlash);
  // OTGender 0 → color5 ; sinon color6.
  _printTextOnWindow(wid, sMon.summary.OTName, x, 1, 0, sMon.summary.OTGender === 0 ? 5 : 6);
}

function _printMonOTID(): void {
  // 1:1 : ConvertIntToDecimalStringN(StringCopy(gStringVar1, gText_IDNumber2),
  // (u16)OTID, LEADING_ZEROS, 5). gText_IDNumber2 = "{NO}{ID}" (extrait).
  const idStr = gText_IDNumber2 + String(sMon.summary.OTID & 0xFFFF).padStart(5, '0');
  const x = GetStringRightAlignXOffset(idStr, 56);
  _printTextOnWindow(_addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_ID), idStr, x, 1, 0, 1);
}

function _resolveAbility(): { name: string; description: string } {
  const mon = sMon.currentMon;
  const sp = mon ? getSpeciesInfo(mon.speciesEnum) : undefined;
  const abilities = sp?.abilities ?? [];
  const abilNum = sMon.summary.abilityNum;
  let abilityConst = abilities[abilNum] || abilities[0] || '';
  if (!abilityConst || abilityConst === 'ABILITY_NONE') abilityConst = abilities[0] || '';
  return abilityConst ? getAbility(abilityConst) : { name: mon?.ability ?? '', description: '' };
}

function _printMonAbilityName(): void {
  _printTextOnWindow(_addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_ABILITY), _resolveAbility().name, 0, 1, 0, 1);
}
function _printMonAbilityDescription(): void {
  _printTextOnWindow(_addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_ABILITY), _resolveAbility().description, 0, 17, 0, 0);
}

let _trainerMemoStr = '';
/** 1:1 décomp `BufferMonTrainerMemo` (:3116). Branche DoesMonOTMatchOwner ==
 *  TRUE : tous nos mons capturés/offerts en solo (OT = joueur). */
function _bufferMonTrainerMemo(): void {
  const sum = sMon.summary;
  DynamicPlaceholderTextUtil_Reset();
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, S_MEMO_NATURE_TEXT_COLOR);
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(1, S_MEMO_MISC_TEXT_COLOR);
  // BufferNatureString : ph2 = gNatureNamePointers[nature], ph5 = "".
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(2, getNatureNameByIndex(sum.nature));
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(5, '');
  // GetMetLevelString : level = metLevel ; if 0 → EGG_HATCH_LEVEL(5).
  let dispLevel = sum.metLevel ?? 0;
  if (dispLevel === 0) dispLevel = 5;
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(3, String(dispLevel));
  const loc = sum.metLocation;
  const locReal = !!loc && loc !== 'MAPSEC_NONE';
  if (locReal) DynamicPlaceholderTextUtil_SetPlaceholderPtr(4, GetMapNameHandleAquaHideout(null, loc!));
  let text: string;
  if (sum.metLevel === 0) text = locReal ? GTEXT_X_NATURE_HATCHED_AT_YZ : GTEXT_X_NATURE_HATCHED_SOMEWHERE_AT;
  else text = locReal ? GTEXT_X_NATURE_MET_AT_YZ : GTEXT_X_NATURE_MET_SOMEWHERE_AT;
  _trainerMemoStr = DynamicPlaceholderTextUtil_ExpandPlaceholders(text);
}
function _printMonTrainerMemo(): void {
  _printTextOnWindow(_addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_MEMO), _trainerMemoStr, 0, 1, 0, 0);
}

/** 1:1 décomp `PrintEggOTName` (:3241) : "DO/" color1 + "?????" (5 marks)
 *  @(width,1) color1. */
function _printEggOTName(): void {
  const wid = _addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_ORIGINAL_TRAINER);
  const width = GetStringWidth(gText_OTSlash);
  _printTextOnWindow(wid, gText_OTSlash, 0, 1, 0, 1);
  _printTextOnWindow(wid, gText_FiveMarks, width, 1, 0, 1);
}
/** 1:1 décomp `PrintEggOTID` (:3249) : gText_IDNumber2 + gText_FiveMarks
 *  right-align 56. */
function _printEggOTID(): void {
  const s = gText_IDNumber2 + gText_FiveMarks;
  const x = GetStringRightAlignXOffset(s, 56);
  _printTextOnWindow(_addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_ID), s, x, 1, 0, 1);
}
/** 1:1 décomp `PrintEggState` (:3258) : ability window = état d'éclosion
 *  selon friendship (sanity→LongTime ; ≤5 AboutToHatch ; ≤10 HatchSoon ;
 *  ≤40 SomeTime ; sinon LongTime) @(0,1) color0. */
function _printEggState(): void {
  const f = sMon.summary.friendship;
  let text: string;
  // summary.sanity (bad egg) non modélisé (nos œufs valides) → branche
  // friendship 1:1.
  if (f <= 5) text = gText_EggAboutToHatch;
  else if (f <= 10) text = gText_EggWillHatchSoon;
  else if (f <= 40) text = gText_EggWillTakeSomeTime;
  else text = gText_EggWillTakeALongTime;
  _printTextOnWindow(_addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_ABILITY), text, 0, 1, 0, 0);
}
/** 1:1 décomp `PrintEggMemo` (:3277) : œuf normal (non sanity, non fateful,
 *  non trade, non special) → gText_OddEggFoundByCouple @(0,1) color0. */
function _printEggMemo(): void {
  _printTextOnWindow(_addWindowFromTemplateList(sPageInfoTemplate, PSS_DATA_WINDOW_INFO_MEMO), gText_OddEggFoundByCouple, 0, 1, 0, 0);
}

/** 1:1 décomp `PrintInfoPageText` (:3028). */
function _printInfoPageText(): void {
  if (sMon.summary.isEgg) {
    _printEggOTName();
    _printEggOTID();
    _printEggState();
    _printEggMemo();
    return;
  }
  _printMonOTName();
  _printMonOTID();
  _printMonAbilityName();
  _printMonAbilityDescription();
  _bufferMonTrainerMemo();
  _printMonTrainerMemo();
}

/* ============================================================================
 * 1:1 décomp page SKILLS (`PrintSkillsPageText` :3301 + helpers)
 * ========================================================================== */

function _itemNameFr(itemEnumOrDexId: string): string {
  // 1:1 décomp PrintHeldItemName (:3346) : CopyItemName(item) =
  // gItems[item].name (= nom FR, items.json). "" → gText_None.
  if (!itemEnumOrDexId) return gText_None;
  return getItemNameFr(itemEnumOrDexId) || itemEnumOrDexId;
}

function _printHeldItemName(): void {
  const sum = sMon.summary;
  const text = sum.item === '' ? gText_None : _itemNameFr(sum.item);
  const x = GetStringCenterAlignXOffset(text, 72) + 6;
  _printTextOnWindow(_addWindowFromTemplateList(sPageSkillsTemplate, PSS_DATA_WINDOW_SKILLS_HELD_ITEM), text, x, 1, 0, 0);
}

function _printRibbonCount(): void {
  const sum = sMon.summary;
  let text: string;
  // 1:1 : ConvertInt(gStringVar1, ribbonCount, RIGHT_ALIGN, 2) ;
  // StringExpandPlaceholders(gStringVar4, gText_RibbonsVar1) — {STR_VAR_1}
  // remplacé par gStringVar1 (= count). gText_RibbonsVar1 extrait.
  if (sum.ribbonCount === 0) text = gText_None;
  else text = gText_RibbonsVar1.replace('{STR_VAR_1}', String(sum.ribbonCount).padStart(2, ' '));
  const x = GetStringCenterAlignXOffset(text, 70) + 6;
  _printTextOnWindow(_addWindowFromTemplateList(sPageSkillsTemplate, PSS_DATA_WINDOW_SKILLS_RIBBON_COUNT), text, x, 1, 0, 0);
}

let _leftColStats = '';
/** 1:1 décomp `ConvertIntToDecimalStringN(buf, value, STR_CONV_MODE_RIGHT_ALIGN, n)`
 *  (string_util.c:163-325) : entier justifié à DROITE dans un champ de
 *  EXACTEMENT n caractères. Le padding GAUCHE est **CHAR_SPACER** (0x77,
 *  string_util.c:209/265/325) — PAS CHAR_SPACE (0x00). CHAR_SPACER a la
 *  largeur d'un chiffre (5 px FONT_NORMAL) vs CHAR_SPACE 3 px → les colonnes
 *  de nombres s'alignent vraiment à droite (sinon rendu ~centré ≠ ROM).
 *  CHAR_SPACER ↔ JS 'ラ' (U+30E9 → byte 0x77, charmap.txt:280), MÊME
 *  approche 1:1 que party-screen.ts:504 `_rightAlign3` (validée A/B). */
const CHAR_SPACER_STR = 'ラ';
function _rightAlignSpacer(value: number, n: number): string {
  const s = String(value);
  return s.length >= n ? s : CHAR_SPACER_STR.repeat(n - s.length) + s;
}
function _bufferLeftColumnStats(): void {
  const s = sMon.summary;
  const cur = _rightAlignSpacer(s.currentHP, 3);
  const max = _rightAlignSpacer(s.maxHP, 3);
  const atk = _rightAlignSpacer(s.atk, 7);
  const def = _rightAlignSpacer(s.def, 7);
  DynamicPlaceholderTextUtil_Reset();
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, cur);
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(1, max);
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(2, atk);
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(3, def);
  _leftColStats = DynamicPlaceholderTextUtil_ExpandPlaceholders(S_STATS_LEFT_COLUMN_LAYOUT);
}
function _printLeftColumnStats(): void {
  _printTextOnWindow(_addWindowFromTemplateList(sPageSkillsTemplate, PSS_DATA_WINDOW_SKILLS_STATS_LEFT), _leftColStats, 4, 1, 0, 0);
}
let _rightColStats = '';
function _bufferRightColumnStats(): void {
  const s = sMon.summary;
  DynamicPlaceholderTextUtil_Reset();
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, _rightAlignSpacer(s.spatk, 3));
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(1, _rightAlignSpacer(s.spdef, 3));
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(2, _rightAlignSpacer(s.speed, 3));
  _rightColStats = DynamicPlaceholderTextUtil_ExpandPlaceholders(S_STATS_RIGHT_COLUMN_LAYOUT);
}
function _printRightColumnStats(): void {
  _printTextOnWindow(_addWindowFromTemplateList(sPageSkillsTemplate, PSS_DATA_WINDOW_SKILLS_STATS_RIGHT), _rightColStats, 2, 1, 0, 0);
}

function _printExpPointsNextLevel(): void {
  const sum = sMon.summary;
  const wid = _addWindowFromTemplateList(sPageSkillsTemplate, PSS_DATA_WINDOW_EXP);
  let v1 = String(sum.exp).padStart(7, ' ');
  let x = GetStringRightAlignXOffset(v1, 42) + 2;
  _printTextOnWindow(wid, v1, x, 1, 0, 0);
  const sp = getSpeciesInfo(sum.species);
  let expToNext = 0;
  const MAX_LEVEL = 100;
  if (sum.level < MAX_LEVEL && sp) {
    expToNext = getExperienceForLevel(sp.growthRate, sum.level + 1) - sum.exp;
    if (expToNext < 0) expToNext = 0;
  }
  v1 = String(expToNext).padStart(6, ' ');
  x = GetStringRightAlignXOffset(v1, 42) + 2;
  _printTextOnWindow(wid, v1, x, 17, 0, 0);
}

/** 1:1 décomp `PrintSkillsPageText` (:3301). */
function _printSkillsPageText(): void {
  _printHeldItemName();
  _printRibbonCount();
  _bufferLeftColumnStats();
  _printLeftColumnStats();
  _bufferRightColumnStats();
  _printRightColumnStats();
  _printExpPointsNextLevel();
}

/* ============================================================================
 * 1:1 décomp pages MOVES (`PrintBattleMoves` :3460 / `PrintContestMoves` :3595)
 * ========================================================================== */

/** 1:1 décomp `GetCurrentPpToMaxPpState` (pokemon.c) : 0..3. */
function _getCurrentPpToMaxPpState(curPp: number, maxPp: number): number {
  if (maxPp === curPp) return 3;
  if (maxPp <= 2) {
    if (curPp > 1) return 2;
    return curPp;
  }
  if (maxPp <= 7) {
    if (curPp > 2) return 2;
    return curPp;
  }
  if (curPp === 0) return 0;
  if (curPp <= Math.floor(maxPp / 4)) return 1;
  if (curPp <= Math.floor(maxPp / 2)) return 2;
  return 3;
}

function _printMoveNameAndPP(moveIndex: number): void {
  const sum = sMon.summary;
  const moveNameWid = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_NAMES);
  const ppValueWid = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_PP);
  const move = sum.moves[moveIndex];
  let text: string, ppState: number, x: number;
  if (move) {
    const md = getMove(move);
    const ppMax = sum.ppMax[moveIndex] || md?.pp || 0;
    _printTextOnWindow(moveNameWid, getMoveName(move), 0, moveIndex * 16 + 1, 0, 1);
    const cur = String(sum.pp[moveIndex]).padStart(2, ' ');
    const max = String(ppMax).padStart(2, ' ');
    DynamicPlaceholderTextUtil_Reset();
    DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, cur);
    DynamicPlaceholderTextUtil_SetPlaceholderPtr(1, max);
    text = DynamicPlaceholderTextUtil_ExpandPlaceholders(S_MOVES_PP_LAYOUT);
    ppState = _getCurrentPpToMaxPpState(sum.pp[moveIndex], ppMax) + 9;
    x = GetStringRightAlignXOffset(text, 44);
  } else {
    _printTextOnWindow(moveNameWid, gText_OneDash, 0, moveIndex * 16 + 1, 0, 1);
    text = gText_TwoDashes;
    ppState = 12;
    x = GetStringCenterAlignXOffset(text, 44);
  }
  _printTextOnWindow(ppValueWid, text, x, moveIndex * 16 + 1, 0, ppState);
}

function _printMovePowerAndAccuracy(move: string): void {
  // 1:1 décomp PrintMovePowerAndAccuracy (:3562). FillWindowPixelRect efface
  // la colonne VALEURS (x53 w19 h32, = lignes POUVOIR y1 + PRECIS. y17) AVANT
  // de réimprimer — sinon l'ancienne valeur (move précédent) bave sous la
  // nouvelle (bug "‑20‑" repéré au runtime : "40" de Pound sous "20" d'Absorb).
  const md = getMove(move);
  if (!md) return;
  FillWindowPixelRect(PSS_LABEL_WINDOW_MOVES_POWER_ACC, 0, 53, 0, 19, 32);
  let text = (md.power < 2) ? gText_ThreeDashes : String(md.power).padStart(3, ' ');
  _printTextOnWindow(PSS_LABEL_WINDOW_MOVES_POWER_ACC, text, 53, 1, 0, 0);
  text = (md.accuracy === 0) ? gText_ThreeDashes : String(md.accuracy).padStart(3, ' ');
  _printTextOnWindow(PSS_LABEL_WINDOW_MOVES_POWER_ACC, text, 53, 17, 0, 0);
}

function _printMoveDetails(move: string): void {
  const wid = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_DESCRIPTION);
  FillWindowPixelBuffer(wid, 0);
  if (move) {
    if (sMon.currPageIndex === PSS_PAGE_BATTLE_MOVES) {
      _printMovePowerAndAccuracy(move);
      _printTextOnWindow(wid, getMoveDescription(move), 6, 1, 0, 0);
    } else {
      // 1:1 décomp PrintMoveDetails (pokemon_summary_screen.c:3674) : page
      // CONTEST → gContestEffectDescriptionPointers[gContestMoves[move]
      // .effect] (description d'EFFET concours), PAS la description combat.
      const cm = getContestMove(move);
      _printTextOnWindow(wid, cm ? getContestEffectDescription(cm.effect) : '', 6, 1, 0, 0);
    }
    _flushWin(wid);
  } else {
    ClearWindowTilemap(wid);
  }
  _scheduleBgCopy(0);
}

/** 1:1 décomp `DrawContestMoveHearts` (:2678) — coeurs CHARME/BLOCAGE dans le
 *  tilemap CONTEST_MOVES[1]. */
const TILE_EMPTY_APPEAL_HEART = 0x1039;
const TILE_FILLED_APPEAL_HEART = 0x103A;
const TILE_FILLED_JAM_HEART = 0x103C;
const TILE_EMPTY_JAM_HEART = 0x103D;
const MAX_CONTEST_MOVE_HEARTS = 8;
function _drawContestMoveHearts(move: string): void {
  // décomp `bgTilemapBuffers[PSS_PAGE_CONTEST_MOVES][1]` = SC1 (offset 0x400).
  const buf = sMon.bgTilemapBuffers[PSS_PAGE_CONTEST_MOVES];
  if (!buf || !move) return;
  const cm = getContestMove(move);
  if (!cm) return;
  // 1:1 décomp : appeal = gContestEffects[gContestMoves[move].effect].appeal ;
  // if (appeal != 0xFF) appeal /= 10 (= nb cœurs). (extract-contest-effects.)
  const eff = getContestEffect(cm.effect);
  let appeal = eff ? eff.appeal : 0xFF;
  let jam = eff ? eff.jam : 0xFF;
  if (appeal !== 0xFF) appeal = Math.floor(appeal / 10);
  for (let i = 0; i < MAX_CONTEST_MOVE_HEARTS; i++) {
    const idx = 0x400 + (Math.floor(i / 4) * 32) + (i & 3) + 0x1E6;
    buf[idx] = (appeal !== 0xFF && i < appeal) ? TILE_FILLED_APPEAL_HEART : TILE_EMPTY_APPEAL_HEART;
  }
  if (jam !== 0xFF) jam = Math.floor(jam / 10);
  for (let i = 0; i < MAX_CONTEST_MOVE_HEARTS; i++) {
    const idx = 0x400 + (Math.floor(i / 4) * 32) + (i & 3) + 0x226;
    buf[idx] = (jam !== 0xFF && i < jam) ? TILE_FILLED_JAM_HEART : TILE_EMPTY_JAM_HEART;
  }
}

/** 1:1 décomp `PrintBattleMoves` (:3460). Mode NORMAL = juste les 4 moves. */
function _printBattleMoves(): void {
  _printMoveNameAndPP(0); _printMoveNameAndPP(1);
  _printMoveNameAndPP(2); _printMoveNameAndPP(3);
}
/** 1:1 décomp `PrintContestMoves` (:3595) — mode NORMAL = juste les 4 moves.
 *  Les cœurs CHARME/BLOCAGE (`DrawContestMoveHearts`) font partie de la
 *  sliding window APPEAL_JAM (EFFET concours, rows SC1 13-19) : décomp ne
 *  les dessine QU'en mode sélection de move (Task_SlideAppealJamWindow /
 *  SetDefaultTilemaps branche moves-page). Mode NORMAL (aucun move
 *  sélectionné, A non programmé) → EFFET caché → PAS de cœurs (1:1). */
function _printContestMoves(): void {
  _printMoveNameAndPP(0); _printMoveNameAndPP(1);
  _printMoveNameAndPP(2); _printMoveNameAndPP(3);
}

/* ============================================================================
 * Dispatch page-text 1:1 `sTextPrinterFunctions` (:730)
 * ========================================================================== */

const _textPrinterFunctions: Array<() => void> = [];
_textPrinterFunctions[PSS_PAGE_INFO] = _printInfoPageText;
_textPrinterFunctions[PSS_PAGE_SKILLS] = _printSkillsPageText;
_textPrinterFunctions[PSS_PAGE_BATTLE_MOVES] = _printBattleMoves;
_textPrinterFunctions[PSS_PAGE_CONTEST_MOVES] = _printContestMoves;

/** 1:1 décomp `PrintPageSpecificText` (:3012). */
function _printPageSpecificText(pageIndex: number): void {
  for (let i = 0; i < sMon.windowIds.length; i++) {
    if (sMon.windowIds[i] !== WINDOW_NONE) FillWindowPixelBuffer(sMon.windowIds[i], 0);
  }
  _textPrinterFunctions[pageIndex]?.();
}

/* ============================================================================
 * 1:1 décomp `PutPageWindowTilemaps`/`ClearPageWindowTilemaps` (:2887/:2943)
 * ========================================================================== */

function _putPageWindowTilemaps(page: number): void {
  ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_INFO_TITLE);
  ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_TITLE);
  ClearWindowTilemap(PSS_LABEL_WINDOW_BATTLE_MOVES_TITLE);
  ClearWindowTilemap(PSS_LABEL_WINDOW_CONTEST_MOVES_TITLE);
  switch (page) {
    case PSS_PAGE_INFO:
      PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_INFO_TITLE);
      PutWindowTilemap(PSS_LABEL_WINDOW_PROMPT_CANCEL);
      PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_INFO_TYPE);
      break;
    case PSS_PAGE_SKILLS:
      PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_TITLE);
      PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_LEFT);
      PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_RIGHT);
      PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_EXP);
      break;
    case PSS_PAGE_BATTLE_MOVES:
      PutWindowTilemap(PSS_LABEL_WINDOW_BATTLE_MOVES_TITLE);
      PutWindowTilemap(PSS_LABEL_WINDOW_PROMPT_INFO);
      break;
    case PSS_PAGE_CONTEST_MOVES:
      PutWindowTilemap(PSS_LABEL_WINDOW_CONTEST_MOVES_TITLE);
      PutWindowTilemap(PSS_LABEL_WINDOW_PROMPT_INFO);
      break;
  }
  for (let i = 0; i < sMon.windowIds.length; i++) {
    if (sMon.windowIds[i] !== WINDOW_NONE) PutWindowTilemap(sMon.windowIds[i]);
  }
  _scheduleBgCopy(0);
}

function _clearPageWindowTilemaps(page: number): void {
  switch (page) {
    case PSS_PAGE_INFO:
      ClearWindowTilemap(PSS_LABEL_WINDOW_PROMPT_CANCEL);
      ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_INFO_TYPE);
      break;
    case PSS_PAGE_SKILLS:
      ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_LEFT);
      ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_RIGHT);
      ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_EXP);
      break;
    case PSS_PAGE_BATTLE_MOVES:
    case PSS_PAGE_CONTEST_MOVES:
      ClearWindowTilemap(PSS_LABEL_WINDOW_PROMPT_INFO);
      break;
  }
  for (let i = 0; i < sMon.windowIds.length; i++) _removeWindowByIndex(i);
  _scheduleBgCopy(0);
}

/* ============================================================================
 * 1:1 décomp `DrawPagination` (:2338) — points • • • • du header (BG3)
 * ========================================================================== */

function _drawPagination(): void {
  const tilemap = new Uint16Array(8 * PSS_PAGE_COUNT);
  for (let i = 0; i < PSS_PAGE_COUNT; i++) {
    const j = i * 2;
    if (i < sMon.minPageIndex) {
      tilemap[j + 0] = 0x40; tilemap[j + 1] = 0x40;
      tilemap[j + 2 * PSS_PAGE_COUNT] = 0x50; tilemap[j + 2 * PSS_PAGE_COUNT + 1] = 0x50;
    } else if (i > sMon.maxPageIndex) {
      tilemap[j + 0] = 0x4A; tilemap[j + 1] = 0x4A;
      tilemap[j + 2 * PSS_PAGE_COUNT] = 0x5A; tilemap[j + 2 * PSS_PAGE_COUNT + 1] = 0x5A;
    } else if (i < sMon.currPageIndex) {
      tilemap[j + 0] = 0x46; tilemap[j + 1] = 0x47;
      tilemap[j + 2 * PSS_PAGE_COUNT] = 0x56; tilemap[j + 2 * PSS_PAGE_COUNT + 1] = 0x57;
    } else if (i === sMon.currPageIndex) {
      if (i !== sMon.maxPageIndex) {
        tilemap[j + 0] = 0x41; tilemap[j + 1] = 0x42;
        tilemap[j + 2 * PSS_PAGE_COUNT] = 0x51; tilemap[j + 2 * PSS_PAGE_COUNT + 1] = 0x52;
      } else {
        tilemap[j + 0] = 0x4B; tilemap[j + 1] = 0x4C;
        tilemap[j + 2 * PSS_PAGE_COUNT] = 0x5B; tilemap[j + 2 * PSS_PAGE_COUNT + 1] = 0x5C;
      }
    } else if (i !== sMon.maxPageIndex) {
      tilemap[j + 0] = 0x43; tilemap[j + 1] = 0x44;
      tilemap[j + 2 * PSS_PAGE_COUNT] = 0x53; tilemap[j + 2 * PSS_PAGE_COUNT + 1] = 0x54;
    } else {
      tilemap[j + 0] = 0x48; tilemap[j + 1] = 0x49;
      tilemap[j + 2 * PSS_PAGE_COUNT] = 0x58; tilemap[j + 2 * PSS_PAGE_COUNT + 1] = 0x59;
    }
  }
  // 1:1 CopyToBgTilemapBufferRect_ChangePalette(3, tilemap, 11, 0,
  // PSS_PAGE_COUNT*2, 2, 16) → CopyRectToBgTilemapBufferRect → CopyTileMap
  // Entry palette1=16,palette2=0,tileOffset=0 (bg.c:1178) :
  //   var = (*dest & 0xFC00) + (palette2<<12) | ((*src + tileOffset) & 0x3FF)
  // = GARDE les bits palette/flip du tile existant (= barre de titre
  // page_info, palette 4) + remplace SEULEMENT l'index tile (low 10 bits).
  // (Mon ancien code écrasait l'entrée entière → palette 0 → points dex
  // rendus en sombre/cyan = bug "palette pas bonne en haut" repéré user.)
  const dst = sMon.bgTilemapBuffers[PSS_PAGE_INFO]; // BG3 = INFO, SC0 (di < 0x400)
  if (dst) {
    const w = PSS_PAGE_COUNT * 2;
    for (let ty = 0; ty < 2; ty++) {
      for (let tx = 0; tx < w; tx++) {
        const di = (0 + ty) * 32 + (11 + tx);
        if (di >= 0 && di < dst.length) {
          const src = tilemap[ty * 2 * PSS_PAGE_COUNT + tx];
          dst[di] = (dst[di] & 0xFC00) | (src & 0x3FF);
        }
      }
    }
  }
  _scheduleBgCopy(3);
}

/* ============================================================================
 * 1:1 décomp Sliding windows (EFFET / STATUT) + Pokérus + SetDefaultTilemaps
 * ========================================================================== */

/** 1:1 décomp `CopyNColumnsToTilemap` (:2405), cas instant-HIDE
 *  (visibleColumns == width → `if (width != visibleColumns)` FALSE → tout
 *  defaultTile, gfx ignoré). Remplit [top..top+h-1][left..left+w-1] du buffer
 *  page (contigu : top>31 → SC1) avec defaultTile. = ce que fait
 *  `Position*SlidingWindow(0, 0xFF)` (speed clampé à width). */
function _hideSlidingWindow(page: number, top: number, left: number, width: number, height: number, defaultTile: number): void {
  const buf = sMon.bgTilemapBuffers[page];
  if (!buf) return;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const idx = (top + i) * 32 + left + j;
      if (idx >= 0 && idx < buf.length) buf[idx] = defaultTile;
    }
  }
}

// 1:1 décomp structs (pokemon_summary_screen.c:388-405).
const _SW_POWER_ACC = { page: PSS_PAGE_BATTLE_MOVES, top: 45, left: 0, w: 10, h: 7, def: 0 };
const _SW_APPEAL_JAM = { page: PSS_PAGE_CONTEST_MOVES, top: 45, left: 0, w: 10, h: 7, def: 0 };
const _SW_STATUS1 = { page: PSS_PAGE_INFO, top: 18, left: 0, w: 10, h: 2, def: 1 };
const _SW_STATUS2 = { page: PSS_PAGE_INFO, top: 50, left: 0, w: 10, h: 2, def: 1 };

/** 1:1 `PositionPowerAccSlidingWindow(0, 0xFF)` (:2434) — EFFET combat caché
 *  (mode NORMAL, aucun move sélectionné = notre cas, A non programmé). */
function _hidePowerAccSlidingWindow(): void {
  _hideSlidingWindow(_SW_POWER_ACC.page, _SW_POWER_ACC.top, _SW_POWER_ACC.left, _SW_POWER_ACC.w, _SW_POWER_ACC.h, _SW_POWER_ACC.def);
}
/** 1:1 `PositionAppealJamSlidingWindow(0, 0xFF, 0)` (:2485) — EFFET concours caché. */
function _hideAppealJamSlidingWindow(): void {
  _hideSlidingWindow(_SW_APPEAL_JAM.page, _SW_APPEAL_JAM.top, _SW_APPEAL_JAM.left, _SW_APPEAL_JAM.w, _SW_APPEAL_JAM.h, _SW_APPEAL_JAM.def);
}
/** 1:1 `PositionStatusSlidingWindow(0, 0xFF)` (:2541) — fenêtre STATUT cachée
 *  (mon sain AILMENT_NONE). sStatusSlidingWindow1 (top18) + 2 (top50). */
function _hideStatusSlidingWindow(): void {
  _hideSlidingWindow(_SW_STATUS1.page, _SW_STATUS1.top, _SW_STATUS1.left, _SW_STATUS1.w, _SW_STATUS1.h, _SW_STATUS1.def);
  _hideSlidingWindow(_SW_STATUS2.page, _SW_STATUS2.top, _SW_STATUS2.left, _SW_STATUS2.w, _SW_STATUS2.h, _SW_STATUS2.def);
}

/** 1:1 décomp `DrawPokerusCuredSymbol` (:2612) : `!CheckPartyPokerus &&
 *  CheckPartyHasHadPokerus` → 0x2C (guéri) sinon 0x81A. Nos mons n'ont JAMAIS
 *  le pokérus (pas de système pokérus) → branche else → 0x81A à
 *  bgTilemapBuffers[INFO][0][0x223] ET [INFO][1][0x223] (= my buf 0x223 SC0 +
 *  0x400+0x223 SC1). 1:1 honnête (else = résultat correct sans pokérus). */
function _drawPokerusCuredSymbol(): void {
  const buf = sMon.bgTilemapBuffers[PSS_PAGE_INFO];
  if (!buf) return;
  buf[0x223] = 0x81A;          // [INFO][0][0x223] (SC0)
  buf[0x400 + 0x223] = 0x81A;  // [INFO][1][0x223] (SC1)
  _scheduleBgCopy(3);
}

/** 1:1 décomp `SetDefaultTilemaps` (:1474) — branche non-moves (page INFO au
 *  boot = notre cas party→résumé). Cache EFFET combat+concours + STATUT
 *  (mon sain) + symbole pokérus. La branche moves-page (TilemapFiveMoves
 *  Display etc.) = pages moves initiales (berry/etc.), pas notre flux. */
function _setDefaultTilemaps(): void {
  if (sMon.currPageIndex !== PSS_PAGE_BATTLE_MOVES && sMon.currPageIndex !== PSS_PAGE_CONTEST_MOVES) {
    _hidePowerAccSlidingWindow();
    _hideAppealJamSlidingWindow();
  }
  // summary.ailment == AILMENT_NONE → hide status sliding window ; sinon
  // (page non-moves) PutWindowTilemap(SKILLS_STATUS) (= géré au render skills).
  if (sMon.summary.ailment === 0) {
    _hideStatusSlidingWindow();
  } else if (sMon.currPageIndex !== PSS_PAGE_BATTLE_MOVES && sMon.currPageIndex !== PSS_PAGE_CONTEST_MOVES) {
    PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);
  }
  // 1:1 LimitEggSummaryPageDisplay (:2713) : isEgg → ChangeBgX(3,0x10000,
  // SET) (BG3 hofs 256 → INFO SC1 = page_info_egg) ; sinon hofs 0 (INFO SC0).
  _changeBgX(3, sMon.summary.isEgg ? 0x10000 : 0, BG_COORD_SET);
  _drawPokerusCuredSymbol();
  // Les buffers BATTLE/CONTEST blanchis seront copiés en VRAM au scroll-in
  // (PssScroll*). INFO (BG3) copié par _drawPokerusCuredSymbol → _scheduleBgCopy(3).
}

/* ============================================================================
 * 1:1 décomp icônes de types (`SetTypeSpritePosAndPal` :3807 + Set*Icons)
 * ========================================================================== */

/** 1:1 décomp `CreateMoveTypeIcons` (:3794) — appelé UNE FOIS à l'init
 *  (machine d'état case 16, :1250). Crée TYPE_ICON_SPRITE_COUNT (= MAX_MON_
 *  MOVES+1 = 5) sprites d'icône type PERSISTANTS, tous invisibles. Ils
 *  vivent toute la durée du summary : `SetTypeIcons` ne fait que les
 *  RE-POINTER (jamais détruire/recréer).
 *
 *  ROOT CAUSE du bug "le type ????? de l'œuf saute en naviguant" (A/B
 *  2026-05-19) : l'ancien modèle détruisait les sprites type en SYNC dans
 *  `_changeSummaryPokemon` puis les recréait en ASYNC dans le `.then`
 *  (après `await _loadAssets/_loadMonFrontPic`). En navigant, les `.then`
 *  se chevauchaient → course d'allocation OAM : le sprite type (oam0) se
 *  faisait clobber par le mon-pic (tileId 184) → "?????" invisible/instable.
 *  Le décomp = sprites PERSISTANTS + `Task_ChangeSummaryMon` synchrone =
 *  zéro course, zéro gap. */
const TYPE_ICON_SPRITE_COUNT = 5;            // 1:1 MAX_MON_MOVES + 1 (:110)
function _createMoveTypeIcons(): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_typeSpriteIds.length === TYPE_ICON_SPRITE_COUNT) return; // idempotent (1:1 :3800)
  _destroyTypeSprites();
  for (let i = 0; i < TYPE_ICON_SPRITE_COUNT; i++) {
    const spr = rt.CreateSpriteAtOam({
      x: 0, y: 0, shape: 1, size: 2,           // sOamData_MoveTypes : 32×16
      tileId: TYPE_ICON_TILE_BASE,             // placeholder (re-pointé par SetTypeIcons)
      paletteBank: 13,
      priority: 1,                             // sOamData_MoveTypes.priority=1 (:769)
      subpriority: 2,                          // 1:1 CreateSprite(.,.,.,2) (:3801)
    });
    _typeSpriteIds.push(spr.spriteId);
    if (spr.spriteId >= 0) rt.setSpriteInvisible(spr.spriteId, true); // 1:1 :3803
  }
}

/** Détruit les sprites type (UNIQUEMENT à la fermeture du summary —
 *  `_freeSummary`). PAS pendant la navigation (sprites persistants 1:1). */
function _destroyTypeSprites(): void {
  const rt = getRuntime();
  for (const sid of _typeSpriteIds) { try { rt?.DestroySprite(sid); } catch { /* déjà */ } }
  _typeSpriteIds = [];
}

/** 1:1 décomp `SetSpriteInvisibility(u8 spriteArrayId, bool8 invisible)`
 *  (:3759) : agit sur le sprite PERSISTANT d'index arrIdx. */
function _setTypeSpriteInvisible(arrIdx: number, invisible: boolean): void {
  const rt = getRuntime();
  const id = _typeSpriteIds[arrIdx];
  if (!rt || id === undefined || id < 0) return;
  rt.setSpriteInvisible(id, invisible);
}

/** 1:1 décomp `SetTypeSpritePosAndPal(typeId, x, y, spriteArrayId)` (:3807) :
 *  RE-POINTE le sprite persistant arrIdx — StartSpriteAnim(typeId) = tileId
 *  ANIMCMD_FRAME(typeId*8), oam.paletteNum, x+16/y+8, invisible FALSE.
 *  AUCUNE création (sprites créés 1× par `_createMoveTypeIcons`). */
function _setTypeSpritePosAndPal(typeId: number, x: number, y: number, arrIdx: number): void {
  const rt = getRuntime();
  const id = _typeSpriteIds[arrIdx];
  if (!rt || id === undefined || id < 0) return;
  const spr = rt.gSprites.get(id);
  if (!spr) return;
  const oam = rt.gba.oam[spr.oamIndex];
  if (oam) {
    oam.tileId = TYPE_ICON_TILE_BASE + typeId * 8;            // 1:1 StartSpriteAnim(sprite,typeId)
    oam.paletteBank = sMoveTypeToOamPaletteNum[typeId] ?? 13; // 1:1 sprite->oam.paletteNum
  }
  spr.x = x + 16;                                             // 1:1 sprite->x = x + 16
  spr.y = y + 8;                                              // 1:1 sprite->y = y + 8
  rt.setSpriteInvisible(id, false);                           // 1:1 SetSpriteInvisibility(.,FALSE)
}

/** 1:1 décomp `SetMonTypeIcons` (:3817). */
function _setMonTypeIcons(): void {
  if (sMon.summary.isEgg) {
    // œuf → unique icône TYPE_MYSTERY ("?????") @(120,48), slot 1 caché.
    _setTypeSpritePosAndPal(TYPE_ID.TYPE_MYSTERY, 120, 48, 0);
    _setTypeSpriteInvisible(1, true);
    return;
  }
  const sp = getSpeciesInfo(sMon.summary.species);
  const types = sp?.types ?? [];
  const t0 = TYPE_ID[types[0] ?? ''] ?? 0;
  const t1 = TYPE_ID[types[1] ?? ''] ?? t0;
  _setTypeSpritePosAndPal(t0, 120, 48, 0);
  if (t0 !== t1) { _setTypeSpritePosAndPal(t1, 160, 48, 1); }
  else { _setTypeSpriteInvisible(1, true); }
}

/** 1:1 décomp `SetMoveTypeIcons` (:3840). */
function _setMoveTypeIcons(): void {
  const sum = sMon.summary;
  for (let i = 0; i < 4; i++) {
    const mv = sum.moves[i];
    if (mv) {
      const md = getMove(mv);
      const tid = TYPE_ID[md?.type ?? ''] ?? 0;
      _setTypeSpritePosAndPal(tid, 85, 32 + i * 16, i);
    } else {
      _setTypeSpriteInvisible(i, true);          // 1:1 SetSpriteInvisibility(i,TRUE) :3849
    }
  }
}

/** 1:1 décomp `SetContestMoveTypeIcons` (:3853). */
function _setContestMoveTypeIcons(): void {
  const sum = sMon.summary;
  for (let i = 0; i < 4; i++) {
    const mv = sum.moves[i];
    if (mv) {
      const cm = getContestMove(mv);
      const cat = CONTEST_CATEGORY_ID[cm?.contestCategory ?? ''] ?? 0;
      _setTypeSpritePosAndPal(NUMBER_OF_MON_TYPES + cat, 85, 32 + i * 16, i);
    } else {
      _setTypeSpriteInvisible(i, true);          // 1:1 :3862
    }
  }
}

/** 1:1 décomp `HidePageSpecificSprites` (:3764) : cache tous les sprites
 *  type. Appelé sur changement de PAGE (décomp `ChangePage` :1782). */
function _hidePageSpecificSprites(): void {
  for (let i = 0; i < _typeSpriteIds.length; i++) _setTypeSpriteInvisible(i, true);
}

/** 1:1 décomp `SetTypeIcons` (:3776) — dispatch selon page. RE-POINTE les
 *  sprites persistants (PAS de destroy/recréation = plus de course OAM). */
function _setTypeIcons(): void {
  if (_typeSpriteIds.length === 0) _createMoveTypeIcons(); // sécurité si init sautée
  switch (sMon.currPageIndex) {
    case PSS_PAGE_INFO: _setMonTypeIcons(); break;
    case PSS_PAGE_BATTLE_MOVES: _setMoveTypeIcons(); break;
    case PSS_PAGE_CONTEST_MOVES: _setContestMoveTypeIcons(); break;
    // SKILLS = pas d'icônes type (cachées par _hidePageSpecificSprites).
  }
}

/* ============================================================================
 * 1:1 décomp sprite mon (`CreateMonSprite` :3975 + cry + anim)
 * ========================================================================== */

function _createMonSprite(): void {
  const rt = getRuntime();
  const mon = sMon.currentMon;
  if (!rt || !mon) return;
  const spr = rt.CreateSpriteAtOam({
    x: 40, y: 64, shape: 0, size: 3,           // 1:1 CreateSprite(.,40,64,5) 64×64
    tileId: MON_PIC_TILE_BASE, paletteBank: MON_PIC_PAL_SLOT,
    priority: 0, subpriority: 5,
  });
  _monPicSpriteId = spr.spriteId;
  // 1:1 CreateMonSprite (:3986) : hFlip = !IsMonSpriteNotFlipped (= !noFlip).
  const noFlip = getSpeciesInfo(mon.speciesEnum)?.noFlip ?? false;
  const o = rt.gSprites.get(spr.spriteId);
  if (o) {
    o.hFlip = !noFlip;
    // 1:1 SpriteCB_Pokemon (:4000) : sprite->data[1] = IsMonSpriteNotFlipped
    // (= sDontFlip, lu par HandleSetAffineData/TryFlipX de l'anim d'intro).
    o.data[1] = noFlip ? 1 : 0;
  }
}

/** 1:1 décomp `CreateSetStatusSprite` (:4079) : sprite état (PSN/PAR/SLP/
 *  FRZ/BRN…) @(64,152), 32×8 (sOamData_StatusCondition shape1 size1 prio3).
 *  statusAnim = GetMonAilment ; si !=0 → frame (ailment-1)*4 visible, sinon
 *  invisible (= mons sains, cas commun, 1:1 correct = aucun icône). */
function _createSetStatusSprite(): void {
  const rt = getRuntime();
  if (!rt) return;
  const ailment = sMon.summary.ailment;
  if (ailment === 0) {                       // SetSpriteInvisibility(TRUE)
    if (_statusSpriteId >= 0) { try { rt.DestroySprite(_statusSpriteId); } catch { /* */ } _statusSpriteId = -1; }
    return;
  }
  const spr = rt.CreateSpriteAtOam({
    x: 64, y: 152, shape: 1, size: 1,         // 1:1 CreateSprite(.,64,152,0) 32×8
    tileId: STATUS_TILE_BASE + (ailment - 1) * 4, // StartSpriteAnim(ailment-1) = FRAME((ailment-1)*4)
    paletteBank: STATUS_PAL_SLOT,
    priority: 3,                              // sOamData_StatusCondition.priority
    subpriority: 0,
  });
  _statusSpriteId = spr.spriteId;
}

/** 1:1 décomp `CreateMonMarkingsSprite` (:4048) → `CreateMonMarkingAll
 *  CombosSprite` (mon_markings.c:570) : sprite 32×8 (sOamData_MarkingCombo
 *  shape1 size1), StartSpriteAnim(MON_DATA_MARKINGS) = FRAME(combo*4),
 *  @(60,26) oam.priority=1. markings=0 (nos mons, pas de toggles boîte PC) =
 *  combo AllOff = 4 formes vides (= ROM, cf. POUSSIFEU). */
function _createMonMarkingsSprite(): void {
  const rt = getRuntime();
  if (!rt) return;
  const combo = sMon.summary.markings & 0xF; // NUM_MON_MARKINGS=4 → 0..15
  const spr = rt.CreateSpriteAtOam({
    x: 60, y: 26, shape: 1, size: 1,           // 1:1 sprite->x=60 y=26, 32×8
    tileId: MARKINGS_TILE_BASE + combo * 4,    // StartSpriteAnim(combo)=FRAME(combo*4)
    paletteBank: MARKINGS_PAL_SLOT,
    priority: 1,                               // sMonSummaryScreen->markingsSprite->oam.priority = 1
    subpriority: 0,
  });
  _markingsSpriteId = spr.spriteId;
}

/** 1:1 décomp `CreateCaughtBallSprite` (:4069) : ball = ItemIdToBallId(MON_
 *  DATA_POKEBALL) ; CreateSprite(&gBallSpriteTemplates[ball], 16, 136, 0) ;
 *  callback=Dummy (statique, pas l'anim throw) ; oam.priority=3. Sprite 16×16
 *  (sBallOamData), frame 0 (ball fermée). Nos mons = ITEM_POKE_BALL →
 *  BALL_POKE (1:1 ItemIdToBallId default + CreateBoxMon:2262). */
function _createCaughtBallSprite(): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 ItemIdToBallId : seul BALL_POKE supporté (nos mons = ITEM_POKE_BALL ;
  // autres balls = gfx non chargés → report honnête, mais inatteignable car
  // createPokemonInstance force ITEM_POKE_BALL 1:1 CreateBoxMon).
  const spr = rt.CreateSpriteAtOam({
    x: 16, y: 136, shape: 0, size: 1,          // 1:1 CreateSprite(.,16,136,0) 16×16
    tileId: BALL_TILE_BASE,                    // frame 0 (sBallAnimSeq0 = FRAME(0), callback dummy)
    paletteBank: BALL_PAL_SLOT,
    priority: 3,                               // oam.priority = 3 (CreateCaughtBallSprite)
    subpriority: 0,
  });
  _ballSpriteId = spr.spriteId;
}

/** 1:1 décomp `SpriteCB_Pokemon` (:3994) : `if (!gPaletteFade.active &&
 *  data[2]!=1) { data[1]=IsMonSpriteNotFlipped; PlayMonCry();
 *  PokemonSummaryDoMonAnimation(sprite, species, isEgg); }`. Appelé une
 *  fois au state 'open' (post fade-in = !gPaletteFade.active). L'anim
 *  d'intro affine COMPLÈTE est portée 1:1 (mon-summary-anim.ts, 151
 *  Anim_* + framework ObjAffineSet/HandleSetAffineData/sAnims). */
function _playMonCryOnce(): void {
  if (_cryPlayed || !sMon.currentMon) return;
  _cryPlayed = true;
  const isEgg = sMon.summary.isEgg;
  // 1:1 décomp `PlayMonCry` (pokemon_summary_screen.c:3963) : `if (!summary
  // ->isEgg) PlayCry...`. Un œuf NE FAIT PAS le cri du mon à l'intérieur.
  if (!isEgg) {
    const sp = sMon.currentMon.speciesName;
    void import('./music').then(({ playCry }) => playCry(sp)).catch(() => { /* cry asset absent */ });
  }
  // PokemonSummaryDoMonAnimation : species2 = SPECIES_EGG si œuf (sprite =
  // egg/front.png) ; oneFrame = isEgg (skip StartSpriteAnim 2e frame).
  const rt = getRuntime();
  const monSpr = rt && _monPicSpriteId >= 0 ? rt.gSprites.get(_monPicSpriteId) : null;
  if (monSpr) {
    const speciesEnum = isEgg ? 'SPECIES_EGG' : sMon.summary.species;
    try { PokemonSummaryDoMonAnimation(monSpr, speciesEnum, isEgg, MON_PIC_TILE_BASE, MON_PIC_FRAME_TILES); }
    catch (e) { console.error('[summary] mon anim failed:', e); }
  }
}

/* ============================================================================
 * Navigation 1:1 (`ChangePage`/`PssScroll*`/`ChangeSummaryPokemon`)
 * ========================================================================== */

let _scrollData = { d0: 0, d1: 0 };

/** 1:1 décomp `PssScrollRight` (:1785). */
function _taskPssScrollRight(task: DecompTask): void {
  if (_scrollData.d0 === 0) {
    if (sMon.bgDisplayOrder === 0) {
      _scrollData.d1 = 1;
      _setBgPriority(1, 1); _setBgPriority(2, 2);
      _scheduleBgCopy(1);
    } else {
      _scrollData.d1 = 2;
      _setBgPriority(2, 1); _setBgPriority(1, 2);
      _scheduleBgCopy(2);
    }
    _changeBgX(_scrollData.d1, 0, BG_COORD_SET);
    _setBgTilemapBuffer(_scrollData.d1, sMon.currPageIndex);
    _scheduleBgCopy(_scrollData.d1);
    ShowBg(1); ShowBg(2);
  }
  _changeBgX(_scrollData.d1, 0x2000, BG_COORD_ADD);
  _scrollData.d0 += 32;
  if (_scrollData.d0 > 0xFF) {
    // PssScrollRightEnd.
    sMon.bgDisplayOrder ^= 1;
    _scrollData.d1 = 0; _scrollData.d0 = 0;
    _drawPagination();
    _putPageWindowTilemaps(sMon.currPageIndex);
    _setTypeIcons();
    const rt = getRuntime();
    rt?.DestroyTask(task.taskId);
    _scrollTaskId = -1;
    _resumeInput();
  }
}

/** 1:1 décomp `PssScrollLeft` (:1828). */
function _taskPssScrollLeft(task: DecompTask): void {
  if (_scrollData.d0 === 0) {
    if (sMon.bgDisplayOrder === 0) _scrollData.d1 = 2;
    else _scrollData.d1 = 1;
    _changeBgX(_scrollData.d1, 0x10000, BG_COORD_SET);
  }
  _changeBgX(_scrollData.d1, 0x2000, BG_COORD_SUB);
  _scrollData.d0 += 32;
  if (_scrollData.d0 > 0xFF) {
    // PssScrollLeftEnd. ⚠️ Décomp : `ScheduleBgCopyTilemapToVram(2|1)`
    // (= d1, car d1=2 si order0 sinon 1) est DIFFÉRÉ → la copie s'exécute
    // au vblank APRÈS le `SetBgTilemapBuffer(d1, …)` ci-dessous → copie le
    // NOUVEAU buffer. Notre `_scheduleBgCopy` est IMMÉDIAT → il FAUT
    // l'appeler APRÈS `_setBgTilemapBuffer` (sinon BG d1 garde l'ancien
    // buffer en VRAM = bug page contest affichée sur slot skills).
    if (sMon.bgDisplayOrder === 0) {
      _setBgPriority(1, 1); _setBgPriority(2, 2);
    } else {
      _setBgPriority(2, 1); _setBgPriority(1, 2);
    }
    if (sMon.currPageIndex > 1) {
      _setBgTilemapBuffer(_scrollData.d1, sMon.currPageIndex - 1);
      _changeBgX(_scrollData.d1, 0x10000, BG_COORD_SET);
    }
    _scheduleBgCopy(_scrollData.d1); // 1:1 net décomp (copie différée post-SetBgTilemapBuffer)
    ShowBg(1); ShowBg(2);
    sMon.bgDisplayOrder ^= 1;
    _scrollData.d1 = 0; _scrollData.d0 = 0;
    _drawPagination();
    _putPageWindowTilemaps(sMon.currPageIndex);
    _setTypeIcons();
    const rt = getRuntime();
    rt?.DestroyTask(task.taskId);
    _scrollTaskId = -1;
    _resumeInput();
  }
}

let _scrollTaskId = -1;

/** 1:1 décomp `ChangePage` (:1761). */
function _changePage(delta: number): void {
  if (sMon.summary.isEgg) return;
  if (delta === -1 && sMon.currPageIndex === sMon.minPageIndex) return;
  if (delta === 1 && sMon.currPageIndex === sMon.maxPageIndex) return;
  PlaySE(5 /* SE_SELECT */);
  _clearPageWindowTilemaps(sMon.currPageIndex);
  sMon.currPageIndex += delta;
  _scrollData = { d0: 0, d1: 0 };
  // Pause input pendant le scroll, comme décomp (SetTaskFuncWithFollowupFunc).
  if (_inputTaskId >= 0) { const rt = getRuntime(); rt?.DestroyTask(_inputTaskId); _inputTaskId = -1; }
  const rt = getRuntime();
  if (!rt) return;
  // CreateTextPrinterTask(currPageIndex) → on print direct (notre dispatch).
  _printPageSpecificText(sMon.currPageIndex);
  _hidePageSpecificSprites();   // 1:1 décomp ChangePage :1782 (cache icônes type)
  if (delta === 1) _scrollTaskId = rt.CreateTask(_taskPssScrollRight, 0);
  else _scrollTaskId = rt.CreateTask(_taskPssScrollLeft, 0);
}

function _resumeInput(): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_inputTaskId < 0) _inputTaskId = rt.CreateTask(Task_Summary_HandleInput, 0);
}

/** 1:1 décomp `ChangeSummaryPokemon` (:1578) + `Task_ChangeSummaryMon` (:1628)
 *  (mode party, single battle). */
function _changeSummaryPokemon(delta: number): void {
  // 1:1 AdvanceMonIndex (:1696). Page INFO : bornes strictes (œufs
  // sélectionnables). Pages non-INFO : boucle qui SAUTE les œufs (un œuf
  // n'a pas de pages skills/moves).
  let idx: number;
  if (sMon.currPageIndex === PSS_PAGE_INFO) {
    if (delta === -1 && sMon.curMonIndex === 0) return;
    if (delta === 1 && sMon.curMonIndex >= sMon.maxMonIndex) return;
    idx = sMon.curMonIndex + delta;
  } else {
    idx = sMon.curMonIndex;
    do {
      idx += delta;
      if (idx < 0 || idx > sMon.maxMonIndex) return;
    } while (_monList[idx]?.isEgg);
  }
  const next = _monList[idx];
  if (!next) return;
  PlaySE(5 /* SE_SELECT */);
  sMon.curMonIndex = idx;
  sMon.currentMon = next;
  // 1:1 Task_ChangeSummaryMon (:1628) : StopCry + détruit SEULEMENT les
  // sprites MON (case 1) et BALL (case 2) — PAS les sprites type (:1639/
  // :1642). Les icônes type sont PERSISTANTES (créées 1× par
  // _createMoveTypeIcons à l'init) et juste re-pointées par _setTypeIcons
  // (case 9). Détruire ici = la course OAM cause du bug "type œuf saute".
  _cryPlayed = false;
  const rt = getRuntime();
  if (_monPicSpriteId >= 0) { try { rt?.DestroySprite(_monPicSpriteId); } catch { /* */ } _monPicSpriteId = -1; }
  if (_statusSpriteId >= 0) { try { rt?.DestroySprite(_statusSpriteId); } catch { /* */ } _statusSpriteId = -1; }
  if (_markingsSpriteId >= 0) { try { rt?.DestroySprite(_markingsSpriteId); } catch { /* */ } _markingsSpriteId = -1; }
  if (_ballSpriteId >= 0) { try { rt?.DestroySprite(_ballSpriteId); } catch { /* */ } _ballSpriteId = -1; }
  _extractMonData(next);
  _graphicsReady = false; _graphicsLoading = false;
  // Recharge front-pic du nouveau mon puis re-render.
  void _loadAssets().then(async () => {
    const r = getRuntime();
    if (!r) return;
    await _loadMonFrontPic(r, next);   // 1:1 anim_front.png 2 frames
    _graphicsReady = true;
    _clearPageWindowTilemaps(sMon.currPageIndex);
    _printMonInfo();
    _printPageSpecificText(sMon.currPageIndex);
    // 1:1 Task_ChangeSummaryMon case 11 : LimitEggSummaryPageDisplay (BG3
    // hofs 256 = page_info_egg si œuf, sinon 0).
    _changeBgX(3, sMon.summary.isEgg ? 0x10000 : 0, BG_COORD_SET);
    _scheduleBgCopy(3);
    _putPageWindowTilemaps(sMon.currPageIndex);
    _setTypeIcons();
    _createMonSprite();
    _createMonMarkingsSprite();
    _createCaughtBallSprite();
    _createSetStatusSprite();
    _playMonCryOnce();
  }).catch(() => { /* */ });
}

/* ============================================================================
 * 1:1 décomp SÉLECTION DE MOVES (bouton A sur pages BATTLE/CONTEST MOVES) —
 * pokemon_summary_screen.c. Bloc cohérent : sliding window EFFET animée +
 * curseur 10-sprites + PrintMoveDetails + réordre + B/ANNULE retour.
 * ========================================================================== */

const SE_SELECT = 5;            // include/constants/songs.h:11
const SE_FAILURE = 32;          // include/constants/songs.h:38

/** 1:1 décomp `struct SlidingWindow` (pokemon_summary_screen.c:359). gfx =
 *  tilemap u16 (effect_battle/contest.bin) ; defaultTile rempli hors gfx. */
interface SlidingWindow {
  gfx: Uint16Array; defaultTile: number;
  width: number; height: number; left: number; top: number;
}
/** 1:1 décomp `sPowerAccSlidingWindow` (:388) : EFFET combat, w10 h7, top45
 *  (→ SC1 du buffer page contigu, comme `bgTilemapBuffers[BATTLE_MOVES][0]`
 *  indexé (top+i)*32 dépasse SC0). */
function _swPowerAcc(): SlidingWindow | null {
  if (!_assets) return null;
  return { gfx: _assets.effectBattleTilemap, defaultTile: 0, width: 10, height: 7, left: 0, top: 45 };
}
/** 1:1 décomp `sAppealJamSlidingWindow` (:397) : EFFET concours. */
function _swAppealJam(): SlidingWindow | null {
  if (!_assets) return null;
  return { gfx: _assets.effectContestTilemap, defaultTile: 0, width: 10, height: 7, left: 0, top: 45 };
}

/** 1:1 décomp `CopyNColumnsToTilemap` (:2405). alloced[width*height] rempli
 *  defaultTile ; si width!=visibleColumns copie (width-visibleColumns) cols
 *  de gfx (gauche/droite selon isOpeningToTheLeft) ; puis blit dans destBuf
 *  (page contigu 0x800 u16 ; (top+i)*32+left atteint SC1 pour top>31). */
function _copyNColumnsToTilemap(sw: SlidingWindow, destBuf: Uint16Array, visibleColumns: number, isOpeningToTheLeft: boolean): void {
  const w = sw.width, h = sw.height;
  const alloced = new Uint16Array(w * h);
  alloced.fill(sw.defaultTile);
  if (w !== visibleColumns) {
    if (!isOpeningToTheLeft) {
      for (let i = 0; i < h; i++)
        for (let c = 0; c < w - visibleColumns; c++)
          alloced[w * i + c] = sw.gfx[visibleColumns + w * i + c] ?? sw.defaultTile;
    } else {
      for (let i = 0; i < h; i++)
        for (let c = 0; c < w - visibleColumns; c++)
          alloced[visibleColumns + w * i + c] = sw.gfx[w * i + c] ?? sw.defaultTile;
    }
  }
  for (let i = 0; i < h; i++)
    for (let c = 0; c < w; c++) {
      const di = (sw.top + i) * 32 + sw.left + c;
      if (di >= 0 && di < destBuf.length) destBuf[di] = alloced[w * i + c];
    }
}

// 1:1 décomp `#define tScrollingSpeed data[0] / tVisibleColumns data[1] /
// tMove data[2]` (:2430). FindTaskIdByFunc → trackers module (TASK_NONE=-1).
let _slidePowerAccTaskId = -1;
let _slideAppealJamTaskId = -1;

/** 1:1 décomp `PositionPowerAccSlidingWindow` (:2434). */
function _positionPowerAccSlidingWindow(visibleColumns: number, speed: number): void {
  const sw = _swPowerAcc();
  if (!sw) return;
  if (speed > sw.width) speed = sw.width;
  if (speed === 0 || speed === sw.width) {
    _copyNColumnsToTilemap(sw, sMon.bgTilemapBuffers[PSS_PAGE_BATTLE_MOVES], speed, true);
  } else {
    const rt = getRuntime();
    if (!rt) return;
    if (_slidePowerAccTaskId < 0 || !rt.gTasks.get(_slidePowerAccTaskId)) {
      _slidePowerAccTaskId = rt.CreateTask(_taskSlidePowerAccWindow, 8);
    }
    const t = rt.gTasks.get(_slidePowerAccTaskId);
    if (t) { t.data[0] = speed; t.data[1] = visibleColumns; }
  }
}

/** 1:1 décomp `Task_SlidePowerAccWindow` (:2452). */
function _taskSlidePowerAccWindow(task: DecompTask): void {
  const sw = _swPowerAcc();
  if (!sw) return;
  const data = task.data;
  data[1] += data[0];
  if (data[1] < 0) data[1] = 0;
  else if (data[1] > sw.width) data[1] = sw.width;
  _copyNColumnsToTilemap(sw, sMon.bgTilemapBuffers[PSS_PAGE_BATTLE_MOVES], data[1], true);
  if (data[1] <= 0 || data[1] >= sw.width) {
    if (data[0] < 0) {
      if (sMon.currPageIndex === PSS_PAGE_BATTLE_MOVES) PutWindowTilemap(PSS_LABEL_WINDOW_MOVES_POWER_ACC);
    } else {
      if (_statusSpriteId >= 0) PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);
      PutWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);
    }
    _scheduleBgCopy(0);
    const rt = getRuntime();
    rt?.DestroyTask(task.taskId);
    _slidePowerAccTaskId = -1;
  }
  _scheduleBgCopy(1);
  _scheduleBgCopy(2);
}

/** 1:1 décomp `PositionAppealJamSlidingWindow` (:2485). */
function _positionAppealJamSlidingWindow(visibleColumns: number, speed: number, move: string): void {
  const sw = _swAppealJam();
  if (!sw) return;
  if (speed > sw.width) speed = sw.width;
  if (speed === 0 || speed === sw.width) {
    _copyNColumnsToTilemap(sw, sMon.bgTilemapBuffers[PSS_PAGE_CONTEST_MOVES], speed, true);
  } else {
    const rt = getRuntime();
    if (!rt) return;
    if (_slideAppealJamTaskId < 0 || !rt.gTasks.get(_slideAppealJamTaskId)) {
      _slideAppealJamTaskId = rt.CreateTask(_taskSlideAppealJamWindow, 8);
    }
    const t = rt.gTasks.get(_slideAppealJamTaskId);
    // décomp tMove = data[2] : move stocké en index numérique. On garde le
    // move courant côté module (string enum) car notre move = string.
    if (t) { t.data[0] = speed; t.data[1] = visibleColumns; }
    _slideAppealJamMove = move;
  }
}
let _slideAppealJamMove = '';

/** 1:1 décomp `Task_SlideAppealJamWindow` (:2505). */
function _taskSlideAppealJamWindow(task: DecompTask): void {
  const sw = _swAppealJam();
  if (!sw) return;
  const data = task.data;
  data[1] += data[0];
  if (data[1] < 0) data[1] = 0;
  else if (data[1] > sw.width) data[1] = sw.width;
  _copyNColumnsToTilemap(sw, sMon.bgTilemapBuffers[PSS_PAGE_CONTEST_MOVES], data[1], true);
  if (data[1] <= 0 || data[1] >= sw.width) {
    if (data[0] < 0) {
      // décomp `FuncIsActiveTask(PssScrollRight) == 0` ≈ aucun scroll en cours.
      if (sMon.currPageIndex === PSS_PAGE_CONTEST_MOVES && _scrollTaskId < 0)
        PutWindowTilemap(PSS_LABEL_WINDOW_MOVES_APPEAL_JAM);
      _drawContestMoveHearts(_slideAppealJamMove);
    } else {
      if (_statusSpriteId >= 0) PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);
      PutWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);
    }
    _scheduleBgCopy(0);
    const rt = getRuntime();
    rt?.DestroyTask(task.taskId);
    _slideAppealJamTaskId = -1;
  }
  _scheduleBgCopy(1);
  _scheduleBgCopy(2);
}

/* ---- 1:1 décomp curseur move (10 sprites) ------------------------------- */

const SEL1 = 0;                 // ≙ SPRITE_ARR_ID_MOVE_SELECTOR1
const SEL2 = 1;                 // ≙ SPRITE_ARR_ID_MOVE_SELECTOR2
let _moveSel1Ids: number[] = [];
let _moveSel2Ids: number[] = [];

/** 1:1 décomp `sSpriteAnimTable_MoveSelector` (:990) : anim→(tileFrame,hFlip).
 *  4 Left FRAME(16) ; 5 Right FRAME(16)+hFlip ; 6 Middle FRAME(20) ;
 *  7 FRAME(24) ; 8 FRAME(24)+hFlip ; 9 FRAME(28). (0-3 inutilisés.) */
function _moveSelectorAnimToTile(anim: number): { tile: number; hFlip: boolean } {
  switch (anim) {
    case 4: return { tile: 16, hFlip: false };
    case 5: return { tile: 16, hFlip: true };
    case 6: return { tile: 20, hFlip: false };
    case 7: return { tile: 24, hFlip: false };
    case 8: return { tile: 24, hFlip: true };
    case 9: return { tile: 28, hFlip: false };
    default: return { tile: 16, hFlip: false };
  }
}
/** Applique anim (= décomp StartSpriteAnim) : tileId + hFlip + data[2]=anim. */
function _applyMoveSelectorAnim(spriteId: number, anim: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const spr = rt.gSprites.get(spriteId);
  if (!spr) return;
  const { tile, hFlip } = _moveSelectorAnimToTile(anim);
  rt.gba.oam[spr.oamIndex].tileId = MOVE_SELECTOR_TILE_BASE + tile;
  spr.hFlip = hFlip;
  spr.data[2] = anim;
}

/** 1:1 décomp `SpriteCB_MoveSelector` (:4127). */
function _spriteCBMoveSelector(spr: DecompSprite): void {
  const anim = spr.data[2];
  if (anim > 3 && anim < 7) {                  // anims 4/5/6 = clignotement
    spr.data[1] = (spr.data[1] + 1) & 0x1F;
    spr.invisible = spr.data[1] > 24;
  } else {
    spr.data[1] = 0;
    spr.invisible = false;
  }
  if (spr.data[0] === SEL1) spr.y2 = sMon.firstMoveIndex * 16;
  else spr.y2 = sMon.secondMoveIndex * 16;
}

/** 1:1 décomp `CreateMoveSelectorSprites` (:4099). */
function _createMoveSelectorSprites(idArrayStart: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (sMon.currPageIndex < PSS_PAGE_BATTLE_MOVES) return;
  const subpriority = (idArrayStart === SEL1) ? 1 : 0;
  const ids: number[] = [];
  for (let i = 0; i < MOVE_SELECTOR_SPRITES_COUNT; i++) {
    const s = rt.CreateSpriteAtOam({
      x: i * 16 + 89, y: 40, shape: 0, size: 1,   // 1:1 CreateSprite(.,i*16+89,40,subp) 16×16
      tileId: MOVE_SELECTOR_TILE_BASE + 16, paletteBank: MOVE_SELECTOR_PAL_SLOT,
      priority: 1, subpriority,                    // sOamData_MoveSelector.priority=1
    });
    if (s.spriteId < 0) continue;
    const anim = (i === 0) ? 4 : (i === 9) ? 5 : 6; // left / right / middle
    _applyMoveSelectorAnim(s.spriteId, anim);
    const spr = rt.gSprites.get(s.spriteId);
    if (spr) {
      spr.callback = (sp) => _spriteCBMoveSelector(sp);
      spr.data[0] = idArrayStart;
      spr.data[1] = 0;
    }
    ids.push(s.spriteId);
  }
  if (idArrayStart === SEL1) _moveSel1Ids = ids; else _moveSel2Ids = ids;
}

/** 1:1 décomp `DestroyMoveSelectorSprites` (:4149). */
function _destroyMoveSelectorSprites(firstArrayId: number): void {
  const rt = getRuntime();
  const ids = (firstArrayId === SEL1) ? _moveSel1Ids : _moveSel2Ids;
  for (const id of ids) { try { rt?.DestroySprite(id); } catch { /* déjà */ } }
  if (firstArrayId === SEL1) _moveSel1Ids = []; else _moveSel2Ids = [];
}

/** 1:1 décomp `SetMainMoveSelectorColor` (:4156) : which*3 → anims (4/5/6) ou
 *  (7/8/9). N'agit que sur SELECTOR1. */
function _setMainMoveSelectorColor(which: number): void {
  const base = which * 3;
  for (let i = 0; i < _moveSel1Ids.length; i++) {
    const anim = (i === 0) ? base + 4 : (i === 9) ? base + 5 : base + 6;
    _applyMoveSelectorAnim(_moveSel1Ids[i], anim);
  }
}

/** 1:1 décomp `KeepMoveSelectorVisible` (:4173) — coupe le clignotement idle. */
function _keepMoveSelectorVisible(firstSpriteId: number): void {
  const rt = getRuntime();
  const ids = (firstSpriteId === SEL1) ? _moveSel1Ids : _moveSel2Ids;
  for (const id of ids) {
    const spr = rt?.gSprites.get(id);
    if (spr) { spr.data[1] = 0; spr.invisible = false; }
  }
}

/* ---- 1:1 décomp textes/tilemaps move-select ----------------------------- */

/** 1:1 décomp `TilemapFiveMovesDisplay` (:2586) — slot "ANNULE"/5e move
 *  (gSummaryScreen_MoveEffect_Cancel_Tilemap, dst = page contigu, id 0x56A). */
function _tilemapFiveMovesDisplay(dst: Uint16Array, palette: number, remove: boolean): void {
  if (!_assets || !dst) return;
  const cancel = _assets.effectCancelTilemap;
  const pal = palette * 0x1000;
  const id = 0x56A;
  if (!remove) {
    for (let i = 0; i < 20; i++) {
      dst[id + i] = (cancel[i] ?? 0) + pal;
      dst[id + i + 0x20] = (cancel[i] ?? 0) + pal;
      dst[id + i + 0x40] = (cancel[i + 20] ?? 0) + pal;
    }
  } else {
    for (let i = 0; i < 20; i++) {
      dst[id + i] = (cancel[i + 20] ?? 0) + pal;
      dst[id + i + 0x20] = (cancel[i + 40] ?? 0) + pal;
      dst[id + i + 0x40] = (cancel[i + 40] ?? 0) + pal;
    }
  }
}

/** 1:1 décomp `PrintNewMoveDetailsOrCancelText` (:3686). newMove==MOVE_NONE
 *  (notre flux NORMAL) → "ANNULE" dans la fenêtre NAMES (y=65, 5e ligne). */
function _printNewMoveDetailsOrCancelText(): void {
  const wid1 = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_NAMES);
  const wid2 = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_PP);
  if (!sMon.newMove) {
    _printTextOnWindow(wid1, gText_Cancel, 0, 65, 0, 1);
  } else {
    const move = sMon.newMove;
    if (sMon.currPageIndex === PSS_PAGE_BATTLE_MOVES)
      _printTextOnWindow(wid1, getMoveName(move), 0, 65, 0, 6);
    else
      _printTextOnWindow(wid1, getMoveName(move), 0, 65, 0, 5);
    const md = getMove(move);
    const cur = String(md?.pp ?? 0).padStart(2, ' ');
    DynamicPlaceholderTextUtil_Reset();
    DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, cur);
    DynamicPlaceholderTextUtil_SetPlaceholderPtr(1, cur);
    const text = DynamicPlaceholderTextUtil_ExpandPlaceholders(S_MOVES_PP_LAYOUT);
    _printTextOnWindow(wid2, text, GetStringRightAlignXOffset(text, 44), 65, 0, 12);
  }
}

/** 1:1 décomp `SetNewMoveTypeIcon` (:3866) — sprite type persistant index 4
 *  (SPRITE_ARR_ID_TYPE + 4). newMove==MOVE_NONE → slot 4 invisible. */
function _setNewMoveTypeIcon(): void {
  if (!sMon.newMove) { _setTypeSpriteInvisible(4, true); return; }  // 1:1 :3870
  const md = getMove(sMon.newMove);
  if (sMon.currPageIndex === PSS_PAGE_BATTLE_MOVES) {
    const tid = TYPE_ID[md?.type ?? ''] ?? 0;
    _setTypeSpritePosAndPal(tid, 85, 96, 4);                         // 1:1 :3875
  } else {
    const cm = getContestMove(sMon.newMove);
    const cat = CONTEST_CATEGORY_ID[cm?.contestCategory ?? ''] ?? 0;
    _setTypeSpritePosAndPal(NUMBER_OF_MON_TYPES + cat, 85, 96, 4);   // 1:1 :3877
  }
}

/** 1:1 décomp `AddAndFillMoveNamesWindow` (:3713) — clear ligne 5 (y65).
 *  Décomp : "This function seems to have no effect." (porté fidèlement). */
function _addAndFillMoveNamesWindow(): void {
  const wid = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_NAMES);
  FillWindowPixelRect(wid, 0, 0, 65, 72, 15);   //!< French Difference (décomp)
  CopyWindowToVram(wid, 2 /* COPYWIN_GFX */);
}

/** 1:1 décomp `SwapMovesNamesPP` (:3720). */
function _swapMovesNamesPP(i1: number, i2: number): void {
  const wid1 = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_NAMES);
  const wid2 = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_PP);
  FillWindowPixelRect(wid1, 0, 0, i1 * 16, 72, 16);
  FillWindowPixelRect(wid1, 0, 0, i2 * 16, 72, 16);
  FillWindowPixelRect(wid2, 0, 0, i1 * 16, 48, 16);
  FillWindowPixelRect(wid2, 0, 0, i2 * 16, 48, 16);
  _printMoveNameAndPP(i1);
  _printMoveNameAndPP(i2);
}

/** 1:1 décomp `SwapMovesTypeSprites` (:3881). Sprites type PERSISTANTS :
 *  après swap des données summary, on RE-POINTE les 4 icônes (= résultat
 *  visuel identique au swap d'animNum/pal du décomp). PAS de destroy. */
function _swapMovesTypeSprites(_i1: number, _i2: number): void {
  if (sMon.currPageIndex === PSS_PAGE_BATTLE_MOVES) _setMoveTypeIcons();
  else _setContestMoveTypeIcons();
}

/* ---- 1:1 décomp machine à états sélection de move ------------------------ */

/** 1:1 décomp `SwitchToMoveSelection` (:1883). */
function _switchToMoveSelection(task: DecompTask): void {
  sMon.firstMoveIndex = 0;
  const move = sMon.summary.moves[sMon.firstMoveIndex];
  ClearWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);
  if (_statusSpriteId >= 0) ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);
  _positionPowerAccSlidingWindow(9, -3);
  _positionAppealJamSlidingWindow(9, -3, move);
  if (!sMon.lockMovesFlag) {
    ClearWindowTilemap(PSS_LABEL_WINDOW_PROMPT_INFO);
    PutWindowTilemap(PSS_LABEL_WINDOW_PROMPT_SWITCH);
  }
  _tilemapFiveMovesDisplay(sMon.bgTilemapBuffers[PSS_PAGE_BATTLE_MOVES], 3, false);
  _tilemapFiveMovesDisplay(sMon.bgTilemapBuffers[PSS_PAGE_CONTEST_MOVES], 1, false);
  _printMoveDetails(move);
  _printNewMoveDetailsOrCancelText();
  _setNewMoveTypeIcon();
  _scheduleBgCopy(0); _scheduleBgCopy(1); _scheduleBgCopy(2);
  _createMoveSelectorSprites(SEL1);
  task.func = Task_HandleInput_MoveSelect;
}

/** 1:1 décomp `HasMoreThanOneMove` (:1953). */
function _hasMoreThanOneMove(): boolean {
  for (let i = 1; i < MAX_MON_MOVES; i++)
    if (sMon.summary.moves[i]) return true;
  return false;
}

/** 1:1 décomp `Task_HandleInput_MoveSelect` (:1911). */
function Task_HandleInput_MoveSelect(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002, KEY_UP = 0x0040, KEY_DOWN = 0x0080;
  if (newKeys & KEY_UP) {
    task.data[0] = 4;
    _changeSelectedMove(task, -1, 'first');
  } else if (newKeys & KEY_DOWN) {
    task.data[0] = 4;
    _changeSelectedMove(task, 1, 'first');
  } else if (newKeys & KEY_A) {
    if (sMon.lockMovesFlag || (!sMon.newMove && sMon.firstMoveIndex === MAX_MON_MOVES)) {
      PlaySE(SE_SELECT);
      _closeMoveSelectMode(task);
    } else if (_hasMoreThanOneMove()) {
      PlaySE(SE_SELECT);
      _switchToMovePositionSwitchMode(task);
    } else {
      PlaySE(SE_FAILURE);
    }
  } else if (newKeys & KEY_B) {
    PlaySE(SE_SELECT);
    _closeMoveSelectMode(task);
  }
}

/** 1:1 décomp `ChangeSelectedMove` (:1964). which = &firstMoveIndex |
 *  &secondMoveIndex. taskData = task.data (data[0]=borne max, data[1]=flag). */
function _changeSelectedMove(task: DecompTask, direction: number, which: 'first' | 'second'): void {
  PlaySE(SE_SELECT);
  const moveIndexOld = (which === 'first') ? sMon.firstMoveIndex : sMon.secondMoveIndex;
  let newMoveIndex = moveIndexOld;
  let move = '';
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    newMoveIndex += direction;
    if (newMoveIndex > task.data[0]) newMoveIndex = 0;
    else if (newMoveIndex < 0) newMoveIndex = task.data[0];
    if (newMoveIndex === MAX_MON_MOVES) { move = sMon.newMove; break; }
    move = sMon.summary.moves[newMoveIndex];
    if (move) break;
  }
  _drawContestMoveHearts(move);
  _scheduleBgCopy(1);
  _scheduleBgCopy(2);
  _printMoveDetails(move);
  if ((moveIndexOld === MAX_MON_MOVES && !sMon.newMove) || task.data[1] === 1) {
    ClearWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);
    if (_statusSpriteId >= 0) ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);
    _scheduleBgCopy(0);
    _positionPowerAccSlidingWindow(9, -3);
    _positionAppealJamSlidingWindow(9, -3, move);
  }
  if (moveIndexOld !== MAX_MON_MOVES && newMoveIndex === MAX_MON_MOVES && !sMon.newMove) {
    ClearWindowTilemap(PSS_LABEL_WINDOW_MOVES_POWER_ACC);
    ClearWindowTilemap(PSS_LABEL_WINDOW_MOVES_APPEAL_JAM);
    _scheduleBgCopy(0);
    _positionPowerAccSlidingWindow(0, 3);
    _positionAppealJamSlidingWindow(0, 3, '');
  }
  if (which === 'first') sMon.firstMoveIndex = newMoveIndex;
  else sMon.secondMoveIndex = newMoveIndex;
  if (which === 'first') _keepMoveSelectorVisible(SEL1);
  else _keepMoveSelectorVisible(SEL2);
}

/** 1:1 décomp `CloseMoveSelectMode` (:2021). */
function _closeMoveSelectMode(task: DecompTask): void {
  _destroyMoveSelectorSprites(SEL1);
  ClearWindowTilemap(PSS_LABEL_WINDOW_PROMPT_SWITCH);
  PutWindowTilemap(PSS_LABEL_WINDOW_PROMPT_INFO);
  _printMoveDetails('');
  _tilemapFiveMovesDisplay(sMon.bgTilemapBuffers[PSS_PAGE_BATTLE_MOVES], 3, true);
  _tilemapFiveMovesDisplay(sMon.bgTilemapBuffers[PSS_PAGE_CONTEST_MOVES], 1, true);
  _addAndFillMoveNamesWindow();
  if (sMon.firstMoveIndex !== MAX_MON_MOVES) {
    ClearWindowTilemap(PSS_LABEL_WINDOW_MOVES_POWER_ACC);
    ClearWindowTilemap(PSS_LABEL_WINDOW_MOVES_APPEAL_JAM);
    _positionPowerAccSlidingWindow(0, 3);
    _positionAppealJamSlidingWindow(0, 3, '');
  }
  _scheduleBgCopy(0); _scheduleBgCopy(1); _scheduleBgCopy(2);
  task.func = Task_Summary_HandleInput;
}

/** 1:1 décomp `SwitchToMovePositionSwitchMode` (:2043). */
function _switchToMovePositionSwitchMode(task: DecompTask): void {
  sMon.secondMoveIndex = sMon.firstMoveIndex;
  _setMainMoveSelectorColor(1);
  _createMoveSelectorSprites(SEL2);
  task.func = Task_HandleInput_MovePositionSwitch;
}

/** 1:1 décomp `Task_HandleInput_MovePositionSwitch` (:2051). */
function Task_HandleInput_MovePositionSwitch(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002, KEY_UP = 0x0040, KEY_DOWN = 0x0080;
  if (newKeys & KEY_UP) {
    task.data[0] = 3;
    _changeSelectedMove(task, -1, 'second');
  } else if (newKeys & KEY_DOWN) {
    task.data[0] = 3;
    _changeSelectedMove(task, 1, 'second');
  } else if (newKeys & KEY_A) {
    if (sMon.firstMoveIndex === sMon.secondMoveIndex) _exitMovePositionSwitchMode(task, false);
    else _exitMovePositionSwitchMode(task, true);
  } else if (newKeys & KEY_B) {
    _exitMovePositionSwitchMode(task, false);
  }
}

/** 1:1 décomp `ExitMovePositionSwitchMode` (:2081). */
function _exitMovePositionSwitchMode(task: DecompTask, swapMoves: boolean): void {
  PlaySE(SE_SELECT);
  _setMainMoveSelectorColor(0);
  _destroyMoveSelectorSprites(SEL2);
  if (swapMoves) {
    if (sMon.currentMon) _swapMonMoves(sMon.currentMon, sMon.firstMoveIndex, sMon.secondMoveIndex);
    _swapMovesNamesPP(sMon.firstMoveIndex, sMon.secondMoveIndex);
    _swapMovesTypeSprites(sMon.firstMoveIndex, sMon.secondMoveIndex);
    sMon.firstMoveIndex = sMon.secondMoveIndex;
  }
  const move = sMon.summary.moves[sMon.firstMoveIndex];
  _printMoveDetails(move);
  _drawContestMoveHearts(move);
  _scheduleBgCopy(1);
  _scheduleBgCopy(2);
  task.func = Task_HandleInput_MoveSelect;
}

/** 1:1 décomp `SwapMonMoves` (:2115). Notre PokemonInstance.moves[] porte
 *  {id,nameFr,pp,ppMax} → swap des slots = 1:1 observable (le ppMax par slot
 *  remplace le calcul ppBonuses/CalculatePPWithBonus du décomp). currentMon
 *  = l'objet party persistant (mutation = SetMonData). */
function _swapMonMoves(mon: PokemonInstance, i1: number, i2: number): void {
  const sum = sMon.summary;
  const m1 = mon.moves[i1], m2 = mon.moves[i2];
  mon.moves[i1] = m2; mon.moves[i2] = m1;
  const sm = sum.moves[i1]; sum.moves[i1] = sum.moves[i2]; sum.moves[i2] = sm;
  const sp = sum.pp[i1]; sum.pp[i1] = sum.pp[i2]; sum.pp[i2] = sp;
  const spm = sum.ppMax[i1]; sum.ppMax[i1] = sum.ppMax[i2]; sum.ppMax[i2] = spm;
}

/* ============================================================================
 * 1:1 décomp `Task_HandleInput` (:1532) + close
 * ========================================================================== */

function Task_Summary_HandleInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_phase !== 'open') return;
  if (rt.gPaletteFade.active) return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002, KEY_R = 0x0100, KEY_L = 0x0200;
  const KEY_UP = 0x0040, KEY_DOWN = 0x0080, KEY_LEFT = 0x0020, KEY_RIGHT = 0x0010;
  if (newKeys & KEY_UP) {
    _changeSummaryPokemon(-1);
  } else if (newKeys & KEY_DOWN) {
    _changeSummaryPokemon(1);
  } else if (newKeys & (KEY_LEFT | KEY_L)) {
    _changePage(-1);
  } else if (newKeys & (KEY_RIGHT | KEY_R)) {
    _changePage(1);
  } else if (newKeys & KEY_A) {
    // 1:1 décomp Task_HandleInput (:1552) : A sur SKILLS = rien ; INFO =
    // fermeture ; BATTLE/CONTEST_MOVES = SwitchToMoveSelection.
    if (sMon.currPageIndex !== PSS_PAGE_SKILLS) {
      if (sMon.currPageIndex === PSS_PAGE_INFO) {
        PlaySE(SE_SELECT);
        _beginCloseSummaryScreen();
      } else {
        PlaySE(SE_SELECT);
        _switchToMoveSelection(task);
      }
    }
  } else if (newKeys & KEY_B) {
    PlaySE(SE_SELECT);
    _beginCloseSummaryScreen();
  }
}

/** 1:1 décomp `BeginCloseSummaryScreen` (:1508) : BeginNormalPaletteFade
 *  (PALETTES_ALL,0,0,16,RGB_BLACK) puis CloseSummaryScreen. */
function _beginCloseSummaryScreen(): void {
  if (!_isOpen || _phase === 'fading_out') return;
  _phase = 'fading_out';
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 Task_HandleInput (:1558/:1571) : StopPokemonAnimations avant la
  // fermeture (fige le sprite + restaure la palette OBJ du glow).
  if (_monPicSpriteId >= 0) {
    const ms = rt.gSprites.get(_monPicSpriteId);
    if (ms) { try { StopPokemonAnimations(ms); } catch { /* */ } }
  }
  if (_inputTaskId >= 0) { rt.DestroyTask(_inputTaskId); _inputTaskId = -1; }
  if (_scrollTaskId >= 0) { try { rt.DestroyTask(_scrollTaskId); } catch { /* */ } _scrollTaskId = -1; }
  FadeScreen(1 /* FADE_TO_BLACK */, 0);
  rt.CreateTask(Task_CloseSummary, 0);
}

function Task_CloseSummary(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  // 1:1 CloseSummaryScreen (:1514-1519) : gLastViewedMonIndex =
  // sMonSummaryScreen->curMonIndex ; SetMainCallback2(sMonSummaryScreen->
  // callback) (= retour party menu, curseur sur le mon vu) + cleanup.
  _lastViewedMonIndex = sMon.curMonIndex;
  const cb = sMon.callback;
  _freeSummary();
  if (cb) cb();
  else rt.SetMainCallback2(rt.gMain.savedCallback ?? null);
  rt.DestroyTask(task.taskId);
}

function _freeSummary(): void {
  for (const wid of _labelWindowIds) { try { RemoveWindow(wid); } catch { /* */ } }
  _labelWindowIds = [];
  for (let i = 0; i < sMon.windowIds.length; i++) sMon.windowIds[i] = WINDOW_NONE;
  const rt = getRuntime();
  _destroyTypeSprites();
  if (_monPicSpriteId >= 0) { try { rt?.DestroySprite(_monPicSpriteId); } catch { /* */ } _monPicSpriteId = -1; }
  if (_statusSpriteId >= 0) { try { rt?.DestroySprite(_statusSpriteId); } catch { /* */ } _statusSpriteId = -1; }
  if (_markingsSpriteId >= 0) { try { rt?.DestroySprite(_markingsSpriteId); } catch { /* */ } _markingsSpriteId = -1; }
  if (_ballSpriteId >= 0) { try { rt?.DestroySprite(_ballSpriteId); } catch { /* */ } _ballSpriteId = -1; }
  // Move-select : sprites curseur + tâches sliding EFFET (si fermeture en
  // cours de sélection — évite tâches orphelines lisant un buffer libéré).
  _destroyMoveSelectorSprites(SEL1);
  _destroyMoveSelectorSprites(SEL2);
  if (_slidePowerAccTaskId >= 0) { try { rt?.DestroyTask(_slidePowerAccTaskId); } catch { /* */ } _slidePowerAccTaskId = -1; }
  if (_slideAppealJamTaskId >= 0) { try { rt?.DestroyTask(_slideAppealJamTaskId); } catch { /* */ } _slideAppealJamTaskId = -1; }
  sMon.firstMoveIndex = 0; sMon.secondMoveIndex = 0;
  _cryPlayed = false;
  _isOpen = false;
  _phase = 'idle';
  _currentReset();
}

function _currentReset(): void {
  sMon.currentMon = null;
  sMon.currPageIndex = 0;
  sMon.bgDisplayOrder = 0;
  _graphicsReady = false;
  _graphicsLoading = false;
  _scrollTaskId = -1;
}

/* ============================================================================
 * CB2 init — 1:1 décomp `LoadGraphics` (:1175, 25 états) / `CB2_Init…` (:1170)
 * ========================================================================== */

export function VBlankCB_SummaryRun(): void { /* transferts auto */ }
export function MainCB2_SummaryRun(): void { /* tasks/fade tick auto */ }

export function CB2_InitSummaryScreen(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0:
      rt.SetVBlankCallback(null);
      _initSummaryStrings(); // strings.json (chargé au boot) → vars, zéro hardcode
      rt.gMain.state++; break;
    case 1: rt.gMain.state++; break;
    case 2:
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++; break;
    case 3: ResetSpriteData(); rt.gMain.state++; break;
    case 4: rt.gMain.state++; break;
    case 5:
      _initBGs(rt);
      sMon.switchCounter = 0;
      _graphicsReady = false; _graphicsLoading = false;
      rt.gMain.state++; break;
    case 6:
      if (!_loadSummaryGraphicsCb2(rt)) break;
      rt.gMain.state++; break;
    case 7:
      _resetWindows();
      rt.gMain.state++; break;
    case 8:
      _drawPagination();
      rt.gMain.state++; break;
    case 9:
      // CopyMonToSummaryStruct + ExtractMonDataToSummaryStruct.
      if (sMon.currentMon) _extractMonData(sMon.currentMon);
      rt.gMain.state++; break;
    case 10: rt.gMain.state++; break;
    case 11:
      _printMonInfo();
      rt.gMain.state++; break;
    case 12:
      _printPageNamesAndStats();
      rt.gMain.state++; break;
    case 13:
      _printPageSpecificText(sMon.currPageIndex);
      rt.gMain.state++; break;
    case 14:
      // 1:1 SetDefaultTilemaps (:1474) : cache EFFET combat/concours +
      // STATUT (mon sain) + symbole pokérus + BG3 hofs 0 (non-egg).
      _setDefaultTilemaps();
      rt.gMain.state++; break;
    case 15:
      _putPageWindowTilemaps(sMon.currPageIndex);
      rt.gMain.state++; break;
    case 16:
      _createMoveTypeIcons();   // 1:1 décomp case 16 :1250 — sprites type PERSISTANTS
      rt.gMain.state++; break;
    case 17:
      _createMonSprite();
      rt.gMain.state++; break;
    case 18:
      _createMonMarkingsSprite();       // 1:1 CreateMonMarkingsSprite (:4048)
      rt.gMain.state++; break;
    case 19:
      _createCaughtBallSprite();        // 1:1 CreateCaughtBallSprite (:4069)
      rt.gMain.state++; break;
    case 20:
      _createSetStatusSprite();         // 1:1 CreateSetStatusSprite (:4079)
      rt.gMain.state++; break;
    case 21:
      _setTypeIcons();
      rt.gMain.state++; break;
    case 22:
      _inputTaskId = rt.CreateTask(Task_Summary_HandleInput, 0);
      rt.gMain.state++; break;
    case 23:
      BlendPalettes(0xFFFFFFFF, 16, 0);
      rt.gMain.state++; break;
    case 24:
      // 1:1 BeginNormalPaletteFade(PALETTES_ALL,0,16,0,RGB_BLACK) (fade-in).
      FadeScreen(FADE_FROM_BLACK, 0);
      rt.gPaletteFade.bufferTransferDisabled = false;
      PlaySE(6);
      rt.gMain.state++; break;
    default:
      rt.SetVBlankCallback(VBlankCB_SummaryRun);
      rt.SetMainCallback2(MainCB2_SummaryRun);
      _isOpen = true;
      _phase = 'open';
      _playMonCryOnce();
      return;
  }
}

/* ============================================================================
 * API publique
 * ========================================================================== */

export function IsSummaryScreenOpen(): boolean {
  return _isOpen;
}

/** 1:1 décomp `gLastViewedMonIndex` — index du dernier mon vu (curseur party
 *  au retour, 1:1 CB2_ReturnToPartyMenuFromSummaryScreen). */
export function GetSummaryLastMonIndex(): number {
  return _lastViewedMonIndex;
}

/** 1:1 décomp `ShowPokemonSummaryScreen` (party_menu.c via CursorCb_Summary).
 *  callback = retour party menu (sMonSummaryScreen->callback). */
export function OpenSummaryScreen(mon: PokemonInstance, callback?: () => void): void {
  if (_isOpen) return;
  // monList = party courante ; curMonIndex = slot du mon.
  _monList = (gameState.party as PokemonInstance[]) ?? [];
  const idx = _monList.indexOf(mon);
  sMon.curMonIndex = idx >= 0 ? idx : 0;
  sMon.maxMonIndex = Math.max(0, _monList.length - 1);
  sMon.currentMon = mon;
  sMon.currPageIndex = PSS_PAGE_INFO;
  sMon.minPageIndex = PSS_PAGE_INFO;
  sMon.maxPageIndex = PSS_PAGE_CONTEST_MOVES;
  sMon.bgDisplayOrder = 0;
  sMon.mode = SUMMARY_MODE_NORMAL;
  // 1:1 décomp : flux party→RÉSUME = mode NORMAL → pas de nouveau move,
  // réordre autorisé (lockMovesFlag FALSE), curseurs réinitialisés.
  sMon.newMove = '';
  sMon.lockMovesFlag = false;
  sMon.firstMoveIndex = 0;
  sMon.secondMoveIndex = 0;
  sMon.callback = callback ?? null;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    if (!sMon.callback && rt.gMain.savedCallback) {
      // fallback : si pas de callback explicite, garde le savedCallback courant.
    }
    rt.SetMainCallback2(CB2_InitSummaryScreen);
  }).catch((e) => { console.error('[summary] preload failed', e); });
}

export function CloseSummaryScreen(): void {
  _beginCloseSummaryScreen();
}

/** Debug-only : snapshot état scroll/BG pour diagnostiquer désync. */
export function __summaryDebugState(): Record<string, unknown> {
  const rt = getRuntime();
  const bgCfg = (n: number) => {
    const c = rt?.gba.bg(n as 0 | 1 | 2 | 3).config;
    return c ? { hofs: c.hofs, prio: c.priority, mapBase: c.mapBaseIndex, vis: c.visible } : null;
  };
  return {
    currPageIndex: sMon.currPageIndex, bgDisplayOrder: sMon.bgDisplayOrder,
    bgBufRef: [..._bgBufRef], bgX: [..._bgX], scrollData: { ..._scrollData },
    scrollTaskId: _scrollTaskId, inputTaskId: _inputTaskId, phase: _phase,
    windowIds: [...sMon.windowIds],
    bg1: bgCfg(1), bg2: bgCfg(2), bg3: bgCfg(3),
  };
}

// Expose to globalThis pour debug.
{
  const _g: Record<string, unknown> = {
    CB2_InitSummaryScreen, OpenSummaryScreen, CloseSummaryScreen, IsSummaryScreenOpen,
    GetSummaryLastMonIndex, __summaryDebugState,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
