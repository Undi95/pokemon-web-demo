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
  InitWindows, AddWindow, FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
  RemoveWindow, ShowBg, HideBg, BlitBitmapToWindow, ClearWindowTilemap,
} from './gba-window-system';
import {
  AddTextPrinterParameterized3, GetStringWidth, GetStringRightAlignXOffset,
  GetStringCenterAlignXOffset, FONT_NORMAL, TEXT_SKIP_DRAW,
} from './gba-text-system';
import { gameState } from './game-state';
import {
  getAbility, getSpeciesInfo, getNatureNameByIndex, getMove, getMoveName,
  getMoveDescription, getContestMove, getContestEffect, getExperienceForLevel,
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
import { loadGbaPal, loadTilemapBin, loadTileBin } from './gba/png-loader';
import { OBJ_PLTT_ID } from './decomp-runtime';
import { pokemonInstanceToPokemon } from './battle/party-storage';
import { moveDexIdToEnum } from './battle/data/move-name-resolve';
import type { DecompTask } from './decomp-runtime';
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
const MON_PIC_TILE_BASE = 184;            // mon front-pic 64×64 = 64 tiles
const MON_PIC_BYTE_OFFSET = MON_PIC_TILE_BASE * 32;
const MON_PIC_PAL_SLOT = 1;
/** 1:1 décomp `sStatusIconsSpriteSheet` (gStatusGfx_Icons = graphics/
 *  interface/status_icons.png, 32×64 = 32 tiles). Sprite 32×8 (shape1 size1),
 *  frame = (ailment-1)*4 tiles (Poison=0/Para=4/Sleep=8/Frozen=12/Burn=16).
 *  OBJ tile 248+ (après mon-pic 184..247). OBJ pal slot 2 (libre). */
const STATUS_TILE_BASE = 248;
const STATUS_BYTE_OFFSET = STATUS_TILE_BASE * 32;
const STATUS_PAL_SLOT = 2;

// 1:1 décomp `sMemoNatureTextColor`/`sMemoMiscTextColor` (:746-747).
const S_MEMO_NATURE_TEXT_COLOR = '{COLOR LIGHT_RED}{SHADOW GREEN}';
const S_MEMO_MISC_TEXT_COLOR = '{COLOR WHITE}{SHADOW DARK_GRAY}';
// 1:1 décomp layout strings (:748-750).
const S_STATS_LEFT_COLUMN_LAYOUT = '{DYNAMIC 0}/{DYNAMIC 1}\n{DYNAMIC 2}\n{DYNAMIC 3}';
const S_STATS_RIGHT_COLUMN_LAYOUT = '{DYNAMIC 0}\n{DYNAMIC 1}\n{DYNAMIC 2}';
const S_MOVES_PP_LAYOUT = '{PP}{DYNAMIC 0}/{DYNAMIC 1}';

// 1:1 décomp Mémo Dresseur FR (strings.c:518-525).
const GTEXT_X_NATURE_MET_AT_YZ =
  '{DYNAMIC 0}{DYNAMIC 2}{DYNAMIC 1}{DYNAMIC 5} de nature,\nrencontré au {LV_2}{DYNAMIC 0}{DYNAMIC 3}{DYNAMIC 1}\n({DYNAMIC 0}{DYNAMIC 4}{DYNAMIC 1}).';
const GTEXT_X_NATURE_HATCHED_AT_YZ =
  '{DYNAMIC 0}{DYNAMIC 2}{DYNAMIC 1}{DYNAMIC 5} de nature,\na éclos au {LV_2}{DYNAMIC 0}{DYNAMIC 3}{DYNAMIC 1}\n({DYNAMIC 0}{DYNAMIC 4}{DYNAMIC 1}).';
const GTEXT_X_NATURE_MET_SOMEWHERE_AT =
  '{DYNAMIC 0}{DYNAMIC 2}{DYNAMIC 1}{DYNAMIC 5} de nature,\nrencontré quelque part\nau {LV_2}{DYNAMIC 0}{DYNAMIC 3}{DYNAMIC 1}.';
const GTEXT_X_NATURE_HATCHED_SOMEWHERE_AT =
  '{DYNAMIC 0}{DYNAMIC 2}{DYNAMIC 1}{DYNAMIC 5} de nature,\na éclos quelque part\nau {LV_2}{DYNAMIC 0}{DYNAMIC 3}{DYNAMIC 1}.';

// 1:1 décomp strings.c FR (lignes citées).
const gText_PkmnInfo = 'INFOS POKéMON';      // :508
const gText_PkmnSkills = 'APTITU. POKéMON';  // :509
const gText_BattleMoves = 'CAPACITES COMB.'; // :510
const gText_ContestMoves = 'CAPACITES CONC.';// :511
const gText_Cancel2 = 'RETOUR';              // :190
const gText_Info = 'INFOS';                  // :512
const gText_Switch = 'CHANG.';               // :507
const gText_RentalPkmn = 'POKéMON A LOUER';  // :495
const gText_TypeSlash = 'TYPE/';             // :496
const gText_HP4 = 'PV';                      // :492
const gText_Attack3 = 'ATTAQUE';             // :487
const gText_Defense3 = 'DEFENSE';            // :488
const gText_SpAtk4 = 'ATQ SP';               // :489
const gText_SpDef4 = 'DEF SP';               // :490
const gText_Speed2 = 'VIT.';                 // :491
const gText_ExpPoints = 'POINTS EXP.';       // :502
const gText_NextLv = 'N. SUIVANT';           // :503
const gText_Status = 'STATUT';               // :501
const gText_Power = 'POUVOIR';               // :497
const gText_Accuracy2 = 'PRECIS.';           // :498
const gText_Appeal = 'CHARME';               // :499
const gText_Jam = 'BLOCAG.';                 // :500
const gText_None = 'AUCUN';                  // :199
const gText_OneDash = '-';                   // :204
const gText_TwoDashes = '--';                // :205
const gText_ThreeDashes = '---';             // :206
const gText_RibbonsVar1 = 'RUBANS: ';        // :504 "RUBANS: {STR_VAR_1}"

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
}

const SUMMARY_MODE_NORMAL = 0;

function _emptySummary(): SummaryData {
  return {
    species: 'SPECIES_NONE', exp: 0, level: 0, abilityNum: 0, item: '', pid: 0,
    isEgg: false, moves: ['', '', '', ''], pp: [0, 0, 0, 0], ppMax: [0, 0, 0, 0],
    currentHP: 0, maxHP: 0, atk: 0, def: 0, spatk: 0, spdef: 0, speed: 0,
    friendship: 0, OTGender: 0, nature: 0, OTName: '', OTID: 0, ribbonCount: 0,
    ailment: 0, metLocation: undefined, metLevel: undefined,
  };
}

const sMon: SummaryState = {
  callback: null, currentMon: null, summary: _emptySummary(),
  bgTilemapBuffers: [], mode: SUMMARY_MODE_NORMAL, curMonIndex: 0, maxMonIndex: 0,
  currPageIndex: 0, minPageIndex: 0, maxPageIndex: 3, bgDisplayOrder: 0,
  windowIds: [WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE, WINDOW_NONE],
  switchCounter: 0,
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
}

let _assets: SummaryAssets | null = null;
let _assetsLoading: Promise<SummaryAssets> | null = null;

async function _loadAssets(): Promise<SummaryAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [tiles, pInfo, pInfoEgg, pSkills, pBattle, pContest, tilesPal, mtTiles, mtPal, aBtn] =
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
      ]);
    _assets = {
      tiles, pageInfoTilemap: pInfo, pageInfoEggTilemap: pInfoEgg,
      pageSkillsTilemap: pSkills, pageBattleMovesTilemap: pBattle,
      pageContestMovesTilemap: pContest, tilesPalette: tilesPal,
      moveTypesTiles: mtTiles, moveTypesPal: mtPal, aButtonTiles: aBtn,
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
    // case 6 : LoadCompressedPalette(gSummaryScreen_Pal, BG_PLTT_ID(0), 8 pals).
    LoadPalette(a.tilesPalette, 0, a.tilesPalette.length * 2);
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
    // 1:1 LoadMonGfxAndSprite (:3900) : front pic mon → OBJ VRAM + palette.
    const mon = sMon.currentMon;
    if (mon) {
      const dexId = mon.speciesEnum.replace('SPECIES_', '').toLowerCase();
      try {
        const ld = await r.LoadCompressedSpriteSheet(`/decomp/em/pokemon/${dexId}/front.png`, MON_PIC_BYTE_OFFSET);
        r.LoadPaletteObj(ld.palette, OBJ_PLTT_ID(MON_PIC_PAL_SLOT));
      } catch (e) { console.error('[summary] mon front pic load failed:', e); }
    }
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
  s.isEgg = false;
  s.nature = (mon.personality ?? 0) % 25;       // GetNature = pid % NUM_NATURES
  s.currentHP = mon.currentHp; s.maxHP = mon.maxHp;
  s.OTName = gameState.playerName ?? '';
  s.OTID = (gameState.trainerId ?? 0) >>> 0;
  s.OTGender = gameState.gender === 'FEMALE' ? 1 : 0;
  s.metLocation = mon.metLocation;
  s.metLevel = mon.metLevel;
  s.friendship = 0;
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
    const dexStr = '{NO}{CLEAR 1}' + String(dexNum).padStart(3, '0');
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
  _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, 'N.' + String(sum.level), 24, 17, 0, 1);
  // GetMonNickname @(0,1) color1, NICKNAME win.
  _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_NICKNAME, mon.nickname, 0, 1, 0, 1);
  // CHAR_SLASH + gSpeciesNames @(0,1) color1, SPECIES win.
  _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, '/' + mon.speciesNameFr, 0, 1, 0, 1);
  // 1:1 PrintGenderSymbol (:2805) : sauf NIDORAN_M/F ; ♂ color3 / ♀ color4
  // @(57,17).
  if (sum.species !== 'SPECIES_NIDORAN_M' && sum.species !== 'SPECIES_NIDORAN_F') {
    if (mon.monGender === 0) _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, '♂', 57, 17, 0, 3);
    else if (mon.monGender === 254) _printTextOnWindow(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, '♀', 57, 17, 0, 4);
  }
  _flushWin(PSS_LABEL_WINDOW_PORTRAIT_NICKNAME);
  _flushWin(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);
}

/** 1:1 décomp `PrintMonInfo` (:2738). */
function _printMonInfo(): void {
  FillWindowPixelBuffer(PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER, 0);
  FillWindowPixelBuffer(PSS_LABEL_WINDOW_PORTRAIT_NICKNAME, 0);
  FillWindowPixelBuffer(PSS_LABEL_WINDOW_PORTRAIT_SPECIES, 0);
  if (!sMon.summary.isEgg) _printNotEggInfo();
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
  // gText_OTSlash FR = "DO/" (Dresseur d'Origine).
  const otSlash = 'DO/';
  _printTextOnWindow(wid, otSlash, 0, 1, 0, 1);
  const x = GetStringWidth(otSlash);
  // OTGender 0 → color5 ; sinon color6.
  _printTextOnWindow(wid, sMon.summary.OTName, x, 1, 0, sMon.summary.OTGender === 0 ? 5 : 6);
}

function _printMonOTID(): void {
  // gText_IDNumber2 = "{NO}{ID}" (strings.c:213) + (u16)OTID 5-digit leading0.
  const idStr = '{NO}{ID}' + String(sMon.summary.OTID & 0xFFFF).padStart(5, '0');
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

/** 1:1 décomp `PrintInfoPageText` (:3028) (branche non-egg). */
function _printInfoPageText(): void {
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

function _itemNameFr(itemEnum: string): string {
  // heldItem "" → AUCUN. Sinon nom lisible (résolution FR item = Phase 2 sac ;
  // ici fallback honnête = enum sans préfixe, jamais de faux nom).
  if (!itemEnum) return gText_None;
  return itemEnum.replace(/^ITEM_/, '').replace(/_/g, ' ');
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
  if (sum.ribbonCount === 0) text = gText_None;
  else text = gText_RibbonsVar1 + String(sum.ribbonCount).padStart(2, ' ');
  const x = GetStringCenterAlignXOffset(text, 70) + 6;
  _printTextOnWindow(_addWindowFromTemplateList(sPageSkillsTemplate, PSS_DATA_WINDOW_SKILLS_RIBBON_COUNT), text, x, 1, 0, 0);
}

let _leftColStats = '';
function _bufferLeftColumnStats(): void {
  const s = sMon.summary;
  const cur = String(s.currentHP).padStart(3, ' ');
  const max = String(s.maxHP).padStart(3, ' ');
  const atk = String(s.atk).padStart(7, ' ');
  const def = String(s.def).padStart(7, ' ');
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
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, String(s.spatk).padStart(3, ' '));
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(1, String(s.spdef).padStart(3, ' '));
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(2, String(s.speed).padStart(3, ' '));
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
  // 1:1 PrintMovePowerAndAccuracy (:3562). FillWindowPixelRect non dispo →
  // re-print (la window est FillWindowPixelBuffer'd avant par PrintMoveDetails).
  const md = getMove(move);
  if (!md) return;
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
      const cm = getContestMove(move);
      _printTextOnWindow(wid, cm ? (getMoveDescription(move) || '') : '', 6, 1, 0, 0);
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
/** 1:1 décomp `PrintContestMoves` (:3595) + `DrawContestMoveHearts`
 *  (:1483 SetDefaultTilemaps appelle DrawContestMoveHearts(moves[
 *  firstMoveIndex]) au setup de la page contest). Les cœurs vont dans le
 *  buffer CONTEST SC1 → copié en VRAM au scroll-in (PssScroll*). */
function _printContestMoves(): void {
  _printMoveNameAndPP(0); _printMoveNameAndPP(1);
  _printMoveNameAndPP(2); _printMoveNameAndPP(3);
  _drawContestMoveHearts(sMon.summary.moves[0] || '');
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
  // PSS_PAGE_COUNT*2, 2, 16). pal 16 (= no change, garde la palette du tile).
  const dst = sMon.bgTilemapBuffers[PSS_PAGE_INFO]; // BG3 = INFO, SC0 (di < 0x400)
  if (dst) {
    const w = PSS_PAGE_COUNT * 2;
    for (let ty = 0; ty < 2; ty++) {
      for (let tx = 0; tx < w; tx++) {
        const di = (0 + ty) * 32 + (11 + tx);
        if (di >= 0 && di < dst.length) dst[di] = tilemap[ty * 2 * PSS_PAGE_COUNT + tx];
      }
    }
  }
  _scheduleBgCopy(3);
}

/* ============================================================================
 * 1:1 décomp icônes de types (`SetTypeSpritePosAndPal` :3807 + Set*Icons)
 * ========================================================================== */

function _destroyTypeSprites(): void {
  const rt = getRuntime();
  for (const sid of _typeSpriteIds) { try { rt?.DestroySprite(sid); } catch { /* déjà */ } }
  _typeSpriteIds = [];
}

/** 1:1 décomp `SetTypeSpritePosAndPal` (:3807) (création sprite à la volée). */
function _placeTypeSprite(typeId: number, x: number, y: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const spr = rt.CreateSpriteAtOam({
    x: x + 16, y: y + 8,                       // 1:1 sprite->x = x+16 ; y = y+8
    shape: 1, size: 2,                         // SPRITE 32×16
    tileId: TYPE_ICON_TILE_BASE + typeId * 8,  // ANIMCMD_FRAME(typeId*8)
    paletteBank: sMoveTypeToOamPaletteNum[typeId] ?? 13,
    priority: 1,
  });
  if (spr.spriteId >= 0) _typeSpriteIds.push(spr.spriteId);
}

/** 1:1 décomp `SetMonTypeIcons` (:3817). */
function _setMonTypeIcons(): void {
  const sp = getSpeciesInfo(sMon.summary.species);
  const types = sp?.types ?? [];
  const t0 = TYPE_ID[types[0] ?? ''] ?? 0;
  const t1 = TYPE_ID[types[1] ?? ''] ?? t0;
  _placeTypeSprite(t0, 120, 48);
  if (t0 !== t1) _placeTypeSprite(t1, 160, 48);
}

/** 1:1 décomp `SetMoveTypeIcons` (:3840). */
function _setMoveTypeIcons(): void {
  const sum = sMon.summary;
  for (let i = 0; i < 4; i++) {
    const mv = sum.moves[i];
    if (mv) {
      const md = getMove(mv);
      const tid = TYPE_ID[md?.type ?? ''] ?? 0;
      _placeTypeSprite(tid, 85, 32 + i * 16);
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
      _placeTypeSprite(NUMBER_OF_MON_TYPES + cat, 85, 32 + i * 16);
    }
  }
}

/** 1:1 décomp `SetTypeIcons` (:3776) — dispatch selon page. */
function _setTypeIcons(): void {
  _destroyTypeSprites();
  switch (sMon.currPageIndex) {
    case PSS_PAGE_INFO: _setMonTypeIcons(); break;
    case PSS_PAGE_BATTLE_MOVES: _setMoveTypeIcons(); break;
    case PSS_PAGE_CONTEST_MOVES: _setContestMoveTypeIcons(); break;
    // SKILLS = pas d'icônes type.
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
  if (o) o.hFlip = !noFlip;
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

/** 1:1 décomp `SpriteCB_Pokemon` (:3994) → PlayMonCry. L'anim d'intro
 *  (PokemonSummaryDoMonAnimation :6826 = sous-système StartMonSummaryAnimation
 *  ~30 ANIM_* affines) n'est PAS portée — report HONNÊTE : le sprite + le cry
 *  sont 1:1 (1re frame statique = 1:1), l'animation squish/bounce est un
 *  sous-système séparé non implémenté (même statut que les sprites de combat
 *  qui ne font pas l'anim affine GBA). Zéro fake. */
function _playMonCryOnce(): void {
  if (_cryPlayed || !sMon.currentMon) return;
  _cryPlayed = true;
  const sp = sMon.currentMon.speciesName;
  void import('./music').then(({ playCry }) => playCry(sp)).catch(() => { /* cry asset absent */ });
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
    // PssScrollLeftEnd.
    if (sMon.bgDisplayOrder === 0) {
      _setBgPriority(1, 1); _setBgPriority(2, 2); _scheduleBgCopy(2);
    } else {
      _setBgPriority(2, 1); _setBgPriority(1, 2); _scheduleBgCopy(1);
    }
    if (sMon.currPageIndex > 1) {
      _setBgTilemapBuffer(_scrollData.d1, sMon.currPageIndex - 1);
      _changeBgX(_scrollData.d1, 0x10000, BG_COORD_SET);
    }
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
  // 1:1 AdvanceMonIndex (:1696) page INFO : bornes strictes.
  if (sMon.currPageIndex === PSS_PAGE_INFO) {
    if (delta === -1 && sMon.curMonIndex === 0) return;
    if (delta === 1 && sMon.curMonIndex >= sMon.maxMonIndex) return;
  }
  let idx = sMon.curMonIndex + delta;
  if (idx < 0 || idx > sMon.maxMonIndex) return;
  const next = _monList[idx];
  if (!next) return;
  PlaySE(5 /* SE_SELECT */);
  sMon.curMonIndex = idx;
  sMon.currentMon = next;
  // 1:1 Task_ChangeSummaryMon : StopCry + détruit sprites + re-extract +
  // re-print + recrée sprites.
  _cryPlayed = false;
  const rt = getRuntime();
  _destroyTypeSprites();
  if (_monPicSpriteId >= 0) { try { rt?.DestroySprite(_monPicSpriteId); } catch { /* */ } _monPicSpriteId = -1; }
  if (_statusSpriteId >= 0) { try { rt?.DestroySprite(_statusSpriteId); } catch { /* */ } _statusSpriteId = -1; }
  _extractMonData(next);
  _graphicsReady = false; _graphicsLoading = false;
  // Recharge front-pic du nouveau mon puis re-render.
  void _loadAssets().then(async () => {
    const r = getRuntime();
    if (!r) return;
    const dexId = next.speciesEnum.replace('SPECIES_', '').toLowerCase();
    try {
      const ld = await r.LoadCompressedSpriteSheet(`/decomp/em/pokemon/${dexId}/front.png`, MON_PIC_BYTE_OFFSET);
      r.LoadPaletteObj(ld.palette, OBJ_PLTT_ID(MON_PIC_PAL_SLOT));
    } catch { /* */ }
    _graphicsReady = true;
    _clearPageWindowTilemaps(sMon.currPageIndex);
    _printMonInfo();
    _printPageSpecificText(sMon.currPageIndex);
    _putPageWindowTilemaps(sMon.currPageIndex);
    _setTypeIcons();
    _createMonSprite();
    _createSetStatusSprite();
    _playMonCryOnce();
  }).catch(() => { /* */ });
}

/* ============================================================================
 * 1:1 décomp `Task_HandleInput` (:1532) + close
 * ========================================================================== */

function Task_Summary_HandleInput(_task: DecompTask): void {
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
    // 1:1 : page INFO/SKILLS/CONTEST → A ne ferme que page INFO (mode NORMAL).
    if (sMon.currPageIndex === PSS_PAGE_INFO) {
      PlaySE(5);
      _beginCloseSummaryScreen();
    }
  } else if (newKeys & KEY_B) {
    PlaySE(5);
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
      // 1:1 SetDefaultTilemaps (:1474) → LimitEggSummaryPageDisplay (:2713) :
      // non-egg → ChangeBgX(3, 0, SET) (BG3 INFO montre SC0). (Page INFO au
      // boot ; sliding windows POWER/APPEAL hors écran via SC1 vide.)
      _changeBgX(3, 0, BG_COORD_SET);
      rt.gMain.state++; break;
    case 15:
      _putPageWindowTilemaps(sMon.currPageIndex);
      rt.gMain.state++; break;
    case 16: rt.gMain.state++; break;
    case 17:
      _createMonSprite();
      rt.gMain.state++; break;
    case 18:
      // 1:1 CreateMonMarkingsSprite (:4048) = CreateMonMarkingAllCombosSprite
      // + StartSpriteAnim(MON_DATA_MARKINGS). PokemonInstance n'a PAS de
      // markings (= toggles boîte PC, jamais set sur nos mons) → markings=0
      // → décomp affiche RIEN. Résultat 1:1 (aucun marquage) atteint sans
      // porter le sous-système mon_markings.c. Report HONNÊTE (zéro fake :
      // on ne dessine pas de faux marquage).
      rt.gMain.state++; break;
    case 19: rt.gMain.state++; break;   // CreateCaughtBallSprite (ball capture — différé honnête)
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

// Expose to globalThis pour debug.
{
  const _g: Record<string, unknown> = {
    CB2_InitSummaryScreen, OpenSummaryScreen, CloseSummaryScreen, IsSummaryScreenOpen,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
