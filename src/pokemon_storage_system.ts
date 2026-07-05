/**
 * pokemon_storage_system.ts — miroir 1:1 PARTIEL de `src/pokemon_storage_system.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/pokemon_storage_system.c`.
 *
 * Porte les helpers de comptage/espace (CheckFreePokemonStorageSpace, StorageGetCurrentBox…),
 * le menu PC (phase 1, 1:1) et — EN COURS — la TRANSCRIPTION INTÉGRALE de l'écran des boîtes
 * (fondations : enums + struct PokemonStorageSystemData + statics EWRAM ; les fonctions suivent,
 * l'échafaudage provisoire Task_PcBoxRender/… sera remplacé fonction par fonction).
 * La struct PokemonStorage (14×30 BoxPokemon) existe déjà dans le save block (sectors 5-13).
 */

import { GetPokemonStorage } from './save';
import { TOTAL_BOXES_COUNT, IN_BOX_COUNT } from './engine/save/save-blocks';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import {
  gPlayerParty, GetMonData, MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_HP,
} from './engine/battle/party-storage';
// CopyMon/ZeroMonData : foyer pokemon.c (pokemon.ts n'importe PAS ce module —
// il passe par le hook __getPokemonStorage — donc pas de cycle).
import { CopyMon, ZeroMonData, type Pokemon } from './pokemon';
import { VarGet } from './event_data';
import { PARTY_SIZE } from '../include/constants/global';
// ─── PC MAIN MENU (phase 1) : helpers UI portés ────────────────────────────
import {
  getRuntime, gMain, LoadBgTiles, LoadPalette, BlendPalettes, ResetPaletteFade, PlaySE,
  FuncIsActiveTask,
} from '../harness/runtime/decomp-globals';
import {
  AddWindow, RemoveWindow, FillWindowPixelBuffer, CopyWindowToVram, InitBgsFromTemplates, ShowBg,
  FillBgTilemapBufferRect, FillBgTilemapBufferRect_Palette0, CopyBgTilemapBufferToVram,
  GetBgTilemapBuffer, ScheduleBgCopyTilemapToVram, PutWindowTilemap, ClearWindowTilemap, InitWindows,
  ExtractWindowTiles4bpp, tileMapIndex,
  type WindowTemplate,
} from './window';
import { GetStringWidth, AddTextPrinterParameterized, GetStringCenterAlignXOffset } from './text';
import { gSpeciesNames } from './engine/data/game-data';
import { LoadUserWindowBorderGfx } from './text_window';
import { SE_PC_LOGIN } from '../include/constants/songs';
import {
  DrawStdWindowFrame, PrintMenuTable, InitMenuInUpperLeftCornerNormal, Menu_ProcessInput,
  Menu_MoveCursor, Menu_GetCursorPos, LoadMessageBoxAndBorderGfx, DrawDialogueFrame,
  ClearStdWindowAndFrame, ClearStdWindowAndFrameToTransparent, DrawStdFrameWithCustomTileAndPalette,
  AddTextPrinterParameterized2, AddTextPrinterParameterized3, AddTextPrinterParameterized4,
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, Menu_MoveCursorNoWrapAround,
} from './menu';
import { FadeInFromBlack } from './field_screen_effect';
import type { MenuAction } from './menu';
import { GetMaxWidthInMenuTable } from './international_string_util';
import { CleanupOverworldWindowsAndTilemaps } from './overworld';
import { CalculatePlayerPartyCount } from './pokemon';
import { LockPlayerFieldControls, UnlockPlayerFieldControls } from './script';
// ─── ÉCRAN DES BOÎTES (phase 2, rendu de base) : icônes + infra CB2 ─────────
import {
  PreloadMonIcon, IsMonIconLoaded, GetIconSpeciesNoPersonality,
  LoadMonIconPalettes, PreloadMonIconPalettes, AreMonIconPalettesLoaded, CreateMonIconSprite,
} from './pokemon_icon';
import { InitMonMarkingsMenu, BufferMonMarkingsMenuTiles, CreateMonMarkingComboSprite, UpdateMonMarkingTiles } from './mon_markings';
import {
  ComputerScreenOpenEffect, ComputerScreenCloseEffect,
  IsComputerScreenOpenEffectActive, IsComputerScreenCloseEffectActive,
} from './fldeff_misc';
import {
  ResetSpriteData, FreeAllSpritePalettes, LoadSpriteSheet, LoadSpritePalette, DestroySprite,
  CreateSprite, StartSpriteAnim, StartSpriteAnimIfDifferent, IndexOfSpritePaletteTag,
  FreeSpritePaletteByTag, _freeSpriteTileRangeByTag, GetSpriteTileStartByTag,
  ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, type AnimCmd,
} from './sprite';
import { REG_OFFSET_DISPCNT } from '../include/gba/io_reg';
import { BeginNormalPaletteFade, UpdatePaletteFade, BG_PLTT_ID } from './palette';
import { loadIndexedPngStrict, loadIndexedPng, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION 1:1 pokemon_storage_system.c — FONDATIONS
// (enums :54-340 · structs auxiliaires :342-401 · struct principale :403-558 ·
//  statics EWRAM :560-577). INERTE tant que l'écran boîtes n'est pas câblé —
// l'échafaudage plus bas (Task_PcBoxRender…) sera remplacé fonction par
// fonction par la transcription (CLAUDE.md Règle 1).
//
// Adaptations plateforme (précédent = tout le repo, cf. egg_hatch/evolution) :
//   - `struct Sprite *` → spriteId `number`, NULL → -1 (pattern standard).
//   - `struct Sprite **` (shift/release ptr-de-ptr) → `unknown`, sémantique
//     fixée au port de ShiftMon/ReleaseMon (l'usage réel décidera).
//   - Alloc(sizeof) sur RAM zérotée → `AllocPokemonStorageSystemData()`
//     littéral zéro-init exhaustif.
//   - Buffers u8[N]/u16[N]/u32[N] → Uint8Array/Uint16Array/Uint32Array(N).
//   - Textes GBA u8[N] → `string` JS (pipeline texte du repo).
//   - Pointeurs gfx `const u32 *` (assets ROM) → `unknown` ici, typés au port
//     du système wallpaper (assets réseau : Uint8Array/string).
// ═══════════════════════════════════════════════════════════════════════════

// ─── PC main menu options (:53-61) ──────────────────────────────────────────
const OPTION_WITHDRAW = 0;
const OPTION_DEPOSIT = 1;
const OPTION_MOVE_MONS = 2;
const OPTION_MOVE_ITEMS = 3;
const OPTION_EXIT = 4;
const OPTIONS_COUNT = 5;

// ─── IDs for messages to print with PrintMessage (:63-96) ───────────────────
const MSG_EXIT_BOX = 0, MSG_WHAT_YOU_DO = 1, MSG_PICK_A_THEME = 2, MSG_PICK_A_WALLPAPER = 3,
  MSG_IS_SELECTED = 4, MSG_JUMP_TO_WHICH_BOX = 5, MSG_DEPOSIT_IN_WHICH_BOX = 6, MSG_WAS_DEPOSITED = 7,
  MSG_BOX_IS_FULL = 8, MSG_RELEASE_POKE = 9, MSG_WAS_RELEASED = 10, MSG_BYE_BYE = 11,
  MSG_MARK_POKE = 12, MSG_LAST_POKE = 13, MSG_PARTY_FULL = 14, MSG_HOLDING_POKE = 15,
  MSG_WHICH_ONE_WILL_TAKE = 16, MSG_CANT_RELEASE_EGG = 17, MSG_CONTINUE_BOX = 18, MSG_CAME_BACK = 19,
  MSG_WORRIED = 20, MSG_SURPRISE = 21, MSG_PLEASE_REMOVE_MAIL = 22, MSG_IS_SELECTED2 = 23,
  MSG_GIVE_TO_MON = 24, MSG_PLACED_IN_BAG = 25, MSG_BAG_FULL = 26, MSG_PUT_IN_BAG = 27,
  MSG_ITEM_IS_HELD = 28, MSG_CHANGED_TO_ITEM = 29, MSG_CANT_STORE_MAIL = 30;

// ─── IDs for how to resolve variables in the above messages (:98-108) ───────
const MSG_VAR_NONE = 0, MSG_VAR_MON_NAME_1 = 1, MSG_VAR_MON_NAME_2 = 2 /* Unused */,
  MSG_VAR_MON_NAME_3 = 3 /* Unused */, MSG_VAR_RELEASE_MON_1 = 4, MSG_VAR_RELEASE_MON_2 = 5 /* Unused */,
  MSG_VAR_RELEASE_MON_3 = 6, MSG_VAR_ITEM_NAME = 7;

// ─── IDs for menu selection items. See SetMenuText, HandleMenuInput (:110-153) ─
const MENU_CANCEL = 0, MENU_STORE = 1, MENU_WITHDRAW = 2, MENU_MOVE = 3, MENU_SHIFT = 4,
  MENU_PLACE = 5, MENU_SUMMARY = 6, MENU_RELEASE = 7, MENU_MARK = 8, MENU_JUMP = 9,
  MENU_WALLPAPER = 10, MENU_NAME = 11, MENU_TAKE = 12, MENU_GIVE = 13, MENU_GIVE_2 = 14,
  MENU_SWITCH = 15, MENU_BAG = 16, MENU_INFO = 17, MENU_SCENERY_1 = 18, MENU_SCENERY_2 = 19,
  MENU_SCENERY_3 = 20, MENU_ETCETERA = 21, MENU_FRIENDS = 22, MENU_FOREST = 23, MENU_CITY = 24,
  MENU_DESERT = 25, MENU_SAVANNA = 26, MENU_CRAG = 27, MENU_VOLCANO = 28, MENU_SNOW = 29,
  MENU_CAVE = 30, MENU_BEACH = 31, MENU_SEAFLOOR = 32, MENU_RIVER = 33, MENU_SKY = 34,
  MENU_POLKADOT = 35, MENU_POKECENTER = 36, MENU_MACHINE = 37, MENU_SIMPLE = 38;
const MENU_WALLPAPER_SETS_START = MENU_SCENERY_1;  // :152
const MENU_WALLPAPERS_START = MENU_FOREST;         // :153

// ─── Return IDs for input handlers (:155-184) ───────────────────────────────
const INPUT_NONE = 0, INPUT_MOVE_CURSOR = 1, INPUT_2 = 2 /* Unused */, INPUT_3 = 3 /* Unused */,
  INPUT_CLOSE_BOX = 4, INPUT_SHOW_PARTY = 5, INPUT_HIDE_PARTY = 6, INPUT_BOX_OPTIONS = 7,
  INPUT_IN_MENU = 8, INPUT_SCROLL_RIGHT = 9, INPUT_SCROLL_LEFT = 10, INPUT_DEPOSIT = 11,
  INPUT_WITHDRAW = 12, INPUT_MOVE_MON = 13, INPUT_SHIFT_MON = 14, INPUT_PLACE_MON = 15,
  INPUT_TAKE_ITEM = 16, INPUT_GIVE_ITEM = 17, INPUT_SWITCH_ITEMS = 18, INPUT_PRESSED_B = 19,
  INPUT_MULTIMOVE_START = 20, INPUT_MULTIMOVE_CHANGE_SELECTION = 21, INPUT_MULTIMOVE_SINGLE = 22,
  INPUT_MULTIMOVE_GRAB_SELECTION = 23, INPUT_MULTIMOVE_UNABLE = 24, INPUT_MULTIMOVE_MOVE_MONS = 25,
  INPUT_MULTIMOVE_PLACE_MONS = 26;

// ─── (:186-191) ──────────────────────────────────────────────────────────────
const SCREEN_CHANGE_EXIT_BOX = 0, SCREEN_CHANGE_SUMMARY_SCREEN = 1,
  SCREEN_CHANGE_NAME_BOX = 2, SCREEN_CHANGE_ITEM_FROM_BAG = 3;

// ─── (:193-197) ──────────────────────────────────────────────────────────────
const MODE_PARTY = 0, MODE_BOX = 1, MODE_MOVE = 2;

// ─── (:199-205) ──────────────────────────────────────────────────────────────
const CURSOR_AREA_IN_BOX = 0, CURSOR_AREA_IN_PARTY = 1, CURSOR_AREA_BOX_TITLE = 2,
  CURSOR_AREA_BUTTONS = 3; // Party Pokémon and Close Box
const CURSOR_AREA_IN_HAND = CURSOR_AREA_BOX_TITLE; // Alt name for cursor area used by Move Items

// ─── (:207-212) ──────────────────────────────────────────────────────────────
const CURSOR_ANIM_BOUNCE = 0, CURSOR_ANIM_STILL = 1, CURSOR_ANIM_OPEN = 2, CURSOR_ANIM_FIST = 3;

// Special box ids for the choose box menu (:214-216)
const BOXID_NONE_CHOSEN = 200;
const BOXID_CANCELED = 201;

// ─── (:218-234) — POKE_ICON_BASE_PAL_TAG = 56000 (constants/pokemon_icon.h) ──
const POKE_ICON_BASE_PAL_TAG = 56000;
const PALTAG_MON_ICON_0 = POKE_ICON_BASE_PAL_TAG,       // 56000
  PALTAG_MON_ICON_1 = POKE_ICON_BASE_PAL_TAG + 1,       // Used implicitly in CreateMonIconSprite
  PALTAG_MON_ICON_2 = POKE_ICON_BASE_PAL_TAG + 2,       // Used implicitly in CreateMonIconSprite
  PALTAG_3 = POKE_ICON_BASE_PAL_TAG + 3 /* Unused */, PALTAG_4 = POKE_ICON_BASE_PAL_TAG + 4 /* Unused */,
  PALTAG_5 = POKE_ICON_BASE_PAL_TAG + 5 /* Unused */,
  PALTAG_DISPLAY_MON = POKE_ICON_BASE_PAL_TAG + 6,
  PALTAG_MISC_1 = POKE_ICON_BASE_PAL_TAG + 7,
  PALTAG_MARKING_COMBO = POKE_ICON_BASE_PAL_TAG + 8,
  PALTAG_BOX_TITLE = POKE_ICON_BASE_PAL_TAG + 9,
  PALTAG_MISC_2 = POKE_ICON_BASE_PAL_TAG + 10,
  PALTAG_ITEM_ICON_0 = POKE_ICON_BASE_PAL_TAG + 11,
  PALTAG_ITEM_ICON_1 = POKE_ICON_BASE_PAL_TAG + 12,     // Used implicitly in CreateItemIconSprites
  PALTAG_ITEM_ICON_2 = POKE_ICON_BASE_PAL_TAG + 13,     // Used implicitly in CreateItemIconSprites
  PALTAG_MARKING_MENU = POKE_ICON_BASE_PAL_TAG + 14;

// ─── (:236-256) ──────────────────────────────────────────────────────────────
const GFXTAG_CURSOR = 0, GFXTAG_CURSOR_SHADOW = 1, GFXTAG_DISPLAY_MON = 2, GFXTAG_BOX_TITLE = 3,
  GFXTAG_BOX_TITLE_ALT = 4, GFXTAG_WAVEFORM = 5, GFXTAG_ARROW = 6, GFXTAG_ITEM_ICON_0 = 7,
  GFXTAG_ITEM_ICON_1 = 8 /* Used implicitly in CreateItemIconSprites */,
  GFXTAG_ITEM_ICON_2 = 9 /* Used implicitly in CreateItemIconSprites */,
  GFXTAG_CHOOSE_BOX_MENU = 10,
  GFXTAG_CHOOSE_BOX_MENU_SIDES = 11 /* Used implicitly in LoadChooseBoxMenuGfx */,
  GFXTAG_12 = 12 /* Unused */, GFXTAG_MARKING_MENU = 13, GFXTAG_14 = 14 /* Unused */,
  GFXTAG_15 = 15 /* Unused */, GFXTAG_MARKING_COMBO = 16, GFXTAG_17 = 17 /* Unused */,
  GFXTAG_MON_ICON = 18;

// The maximum number of Pokémon icons that can appear on-screen. (:258-260)
const MAX_MON_ICONS = Math.max(IN_BOX_COUNT + PARTY_SIZE + 1, 40);
// The maximum number of item icons that can appear on-screen while moving held items. (:262-265)
const MAX_ITEM_ICONS = 3;

// IDs for the item icons affine anims (:267-276)
const ITEM_ANIM_NONE = 0, ITEM_ANIM_APPEAR = 1, ITEM_ANIM_DISAPPEAR = 2, ITEM_ANIM_PICK_UP = 3,
  ITEM_ANIM_PUT_DOWN = 4, ITEM_ANIM_PUT_AWAY = 5, ITEM_ANIM_LARGE = 6;

// IDs for the item icon sprite callbacks (:278-288)
const ITEM_CB_WAIT_ANIM = 0, ITEM_CB_TO_HAND = 1, ITEM_CB_TO_MON = 2, ITEM_CB_SWAP_TO_HAND = 3,
  ITEM_CB_SWAP_TO_MON = 4, ITEM_CB_UNUSED_1 = 5, ITEM_CB_UNUSED_2 = 6, ITEM_CB_HIDE_PARTY = 7;

// ─── (:290-293) ──────────────────────────────────────────────────────────────
const RELEASE_ANIM_RELEASE = 0, RELEASE_ANIM_CAME_BACK = 1;

// IDs for InitMonPlaceChange (:295-300)
const CHANGE_GRAB = 0, CHANGE_PLACE = 1, CHANGE_SHIFT = 2;

// Modes for selecting and moving Pokémon in the box. (:302-314)
const MOVE_MODE_NORMAL = 0, MOVE_MODE_MULTIPLE_SELECTING = 1, MOVE_MODE_MULTIPLE_MOVING = 2;

// IDs for the main functions for moving multiple Pokémon. (:316-325)
const MULTIMOVE_START = 0, MULTIMOVE_CANCEL = 1 /* If only 1 Pokémon is grabbed */,
  MULTIMOVE_CHANGE_SELECTION = 2, MULTIMOVE_GRAB_SELECTION = 3, MULTIMOVE_MOVE_MONS = 4,
  MULTIMOVE_PLACE_MONS = 5;

// IDs for TilemapUtil (:327-333)
const TILEMAPID_PKMN_DATA = 0,   // The "Pkmn Data" text at the top of the display
  TILEMAPID_PARTY_MENU = 1, TILEMAPID_CLOSE_BUTTON = 2, TILEMAPID_COUNT = 3;

// Window IDs for sWindowTemplates (:335-340)
const WIN_DISPLAY_INFO = 0, WIN_MESSAGE = 1, WIN_ITEM_DESC = 2;

// ─── struct Wallpaper (:342-347) — pointeurs gfx typés au port wallpapers ────
interface Wallpaper { tiles: unknown; tilemap: unknown; palettes: unknown; }

// ─── struct StorageMessage (:349-353) ────────────────────────────────────────
interface StorageMessage { text: string; format: number; }

// ─── struct StorageMenu (:355-359) ───────────────────────────────────────────
interface StorageMenu { text: string; textId: number; }

// ─── struct UnkUtilData / UnkUtil (:361-376) ─────────────────────────────────
interface UnkUtilData {
  src: Uint8Array | null;
  dest: Uint8Array | null;
  size: number;
  unk: number;
  height: number;
  func: ((data: UnkUtilData) => void) | null;
}
interface UnkUtil {
  data: UnkUtilData[] | null;
  numActive: number;
  max: number;
}

// ─── struct ChooseBoxMenu (:378-391) ─────────────────────────────────────────
interface ChooseBoxMenu {
  menuSprite: number;          // struct Sprite * → spriteId (-1 = NULL)
  menuSideSprites: number[];   // struct Sprite *[4]
  unused1: number[];           // u32[3]
  arrowSprites: number[];      // struct Sprite *[2]
  unused2: Uint8Array;         // u8[0x214]
  loadedPalette: boolean;
  tileTag: number;
  paletteTag: number;
  curBox: number;
  unused3: number;
  subpriority: number;
}

// ─── struct ItemIcon (:393-401) ──────────────────────────────────────────────
interface ItemIcon {
  sprite: number;              // struct Sprite * → spriteId (-1 = NULL)
  tiles: Uint8Array | null;    // u8 *
  palIndex: number;
  area: number;
  pos: number;
  active: boolean;
}

// ─── struct PokemonStorageSystemData (:403-558) — champ à champ, mêmes noms ──
interface PokemonStorageSystemData {
  state: number;                              // u8
  boxOption: number;                          // u8
  screenChangeType: number;                   // u8
  isReopening: boolean;                       // bool8
  taskId: number;                             // u8
  unkUtil: UnkUtil;
  unkUtilData: UnkUtilData[];                 // [8]
  partyMenuTilemapBuffer: Uint16Array;        // u16[0x108]
  partyMenuUnused1: number;                   // Never read
  partyMenuY: number;                         // u16
  partyMenuUnused2: number;                   // Unused
  partyMenuMoveTimer: number;                 // u8
  showPartyMenuState: number;                 // u8
  closeBoxFlashing: boolean;                  // bool8
  closeBoxFlashTimer: number;                 // u8
  closeBoxFlashState: boolean;                // bool8
  newCurrBoxId: number;                       // s16
  bg2_X: number;                              // u16
  scrollSpeed: number;                        // s16
  scrollTimer: number;                        // u16
  wallpaperOffset: number;                    // u8
  scrollUnused1: number;                      // Never read
  scrollToBoxIdUnused: number;                // Never read
  scrollUnused2: number;                      // Never read
  scrollDirectionUnused: number;              // Never read
  scrollUnused3: number;                      // Never read
  scrollUnused4: number;                      // Never read
  scrollUnused5: number;                      // Never read
  scrollUnused6: number;                      // Never read
  filler1: Uint8Array;                        // u8[22]
  boxTitleTiles: Uint8Array;                  // u8 ALIGNED(2) [1024]
  boxTitleCycleId: number;                    // u8
  wallpaperLoadState: number;                 // Written to, but never read
  wallpaperLoadBoxId: number;                 // u8
  wallpaperLoadDir: number;                   // s8
  boxTitlePal: Uint16Array;                   // u16[16]
  boxTitlePalOffset: number;                  // u16
  boxTitleAltPalOffset: number;               // u16
  curBoxTitleSprites: number[];               // struct Sprite *[2] → spriteIds
  nextBoxTitleSprites: number[];              // struct Sprite *[2]
  arrowSprites: number[];                     // struct Sprite *[2]
  wallpaperPalBits: number;                   // u32
  filler2: Uint8Array;                        // u8[80] Unused
  unkUnused1: number;                         // Never read
  wallpaperSetId: number;                     // s16
  wallpaperId: number;                        // s16
  wallpaperTilemap: Uint16Array;              // u16[360]
  wallpaperChangeState: number;               // u8
  scrollState: number;                        // u8
  scrollToBoxId: number;                      // u8
  scrollDirection: number;                    // s8
  wallpaperTiles: Uint8Array | null;          // u8 * (alloué au chargement wallpaper)
  movingMonSprite: number;                    // struct Sprite * → spriteId
  partySprites: number[];                     // struct Sprite *[PARTY_SIZE]
  boxMonsSprites: number[];                   // struct Sprite *[IN_BOX_COUNT]
  shiftMonSpritePtr: unknown;                 // struct Sprite ** — sémantique au port ShiftMon
  releaseMonSpritePtr: unknown;               // struct Sprite ** — sémantique au port ReleaseMon
  numIconsPerSpecies: Uint16Array;            // u16[MAX_MON_ICONS]
  iconSpeciesList: Uint16Array;               // u16[MAX_MON_ICONS]
  boxSpecies: Uint16Array;                    // u16[IN_BOX_COUNT]
  boxPersonalities: Uint32Array;              // u32[IN_BOX_COUNT]
  incomingBoxId: number;                      // u8
  shiftTimer: number;                         // u8
  numPartyToCompact: number;                  // u8
  iconScrollDistance: number;                 // u16
  iconScrollPos: number;                      // s16
  iconScrollSpeed: number;                    // s16
  iconScrollNumIncoming: number;              // u16
  iconScrollCurColumn: number;                // u8
  iconScrollDirection: number;                // s8 — Unnecessary duplicate of scrollDirection
  iconScrollState: number;                    // u8
  iconScrollToBoxId: number;                  // Unused duplicate of scrollToBoxId
  menuWindow: WindowTemplate;                 // struct WindowTemplate
  menuItems: StorageMenu[];                   // [7]
  menuItemsCount: number;                     // u8
  menuWidth: number;                          // u8
  menuUnusedField: number;                    // Never read
  menuWindowId: number;                       // u16
  cursorSprite: number;                       // struct Sprite * → spriteId (-1 = NULL)
  cursorShadowSprite: number;                 // struct Sprite * → spriteId (-1 = NULL)
  cursorNewX: number;                         // s32
  cursorNewY: number;                         // s32
  cursorSpeedX: number;                       // u32
  cursorSpeedY: number;                       // u32
  cursorTargetX: number;                      // s16
  cursorTargetY: number;                      // s16
  cursorMoveSteps: number;                    // u16
  cursorVerticalWrap: number;                 // s8
  cursorHorizontalWrap: number;               // s8
  newCursorArea: number;                      // u8
  newCursorPosition: number;                  // u8
  cursorPrevHorizPos: number;                 // u8
  cursorFlipTimer: number;                    // u8
  cursorPalNums: number[];                    // u8[2]
  displayMonPalette: unknown;                 // const u32 * — typé au port display mon
  displayMonPersonality: number;              // u32
  displayMonSpecies: number;                  // u16
  displayMonItemId: number;                   // u16
  displayUnusedVar: number;                   // u16
  setMosaic: boolean;                         // bool8
  displayMonMarkings: number;                 // u8
  displayMonLevel: number;                    // u8
  displayMonIsEgg: boolean;                   // bool8
  displayMonName: string;                     // u8[POKEMON_NAME_LENGTH + 1] → string JS
  displayMonNameText: string;                 // u8[36]
  displayMonSpeciesName: string;              // u8[36]
  displayMonGenderLvlText: string;            // u8[36]
  displayMonItemName: string;                 // u8[36]
  monPlaceChangeFunc: (() => boolean) | null; // bool8 (*)(void)
  monPlaceChangeState: number;                // u8
  shiftBoxId: number;                         // u8
  markingComboSprite: number;                 // struct Sprite * → spriteId
  waveformSprites: number[];                  // struct Sprite *[2]
  markingComboTilesPtr: unknown;              // u16 * — typé au port markings
  markMenu: unknown;                          // struct MonMarkingsMenu — mon_markings pas transcrit
  chooseBoxMenu: ChooseBoxMenu;
  movingMon: Pokemon | null;                  // struct Pokemon (inline zéroté) → null jusqu'au 1er usage
  tempMon: Pokemon | null;                    // struct Pokemon
  canReleaseMon: number;                      // s8
  releaseStatusResolved: boolean;             // bool8
  releaseCheckBoxId: number;                  // s8
  releaseCheckBoxPos: number;                 // s8
  releaseBoxId: number;                       // s8
  releaseBoxPos: number;                      // s8
  releaseCheckState: number;                  // u16
  restrictedReleaseMonMoves: number;          // u16
  restrictedMoveList: Uint16Array;            // u16[8]
  summaryMaxPos: number;                      // u8
  summaryStartPos: number;                    // u8
  summaryScreenMode: number;                  // u8
  summaryMon: Pokemon | null;                 // union { struct Pokemon *mon; struct BoxPokemon *box; } — modèle unifié
  messageText: string;                        // u8[40]
  boxTitleText: string;                       // u8[40]
  releaseMonName: string;                     // u8[POKEMON_NAME_LENGTH + 1]
  itemName: string;                           // u8[20]
  inBoxMovingMode: number;                    // u8
  multiMoveWindowId: number;                  // u16
  itemIcons: ItemIcon[];                      // [MAX_ITEM_ICONS]
  movingItemId: number;                       // u16
  itemInfoWindowOffset: number;               // u16
  unkUnused2: number;                         // Unused
  displayMonPalOffset: number;                // u16
  displayMonTilePtr: unknown;                 // u16 * — typé au port display mon
  displayMonSprite: number;                   // struct Sprite * → spriteId
  displayMonPalBuffer: Uint16Array;           // u16[0x40]
  tileBuffer: Uint8Array;                     // u8 ALIGNED(4) [MON_PIC_SIZE × MAX_MON_PIC_FRAMES = 0x800×2]
  itemIconBuffer: Uint8Array;                 // u8 ALIGNED(4) [0x800]
  wallpaperBgTilemapBuffer: Uint8Array;       // u8[0x1000]
  displayMenuTilemapBuffer: Uint8Array;       // u8[0x800]
}

/** = `sStorage = Alloc(sizeof(*sStorage))` (EnterPokeStorage :2000) : la RAM GBA allouée est
 *  ZÉROTÉE → littéral zéro-init exhaustif, champ à champ dans l'ordre de la struct.
 *  spriteIds « NULL » = -1 (cf. bloc adaptations en tête de section). */
function AllocPokemonStorageSystemData(): PokemonStorageSystemData {
  return {
    state: 0, boxOption: 0, screenChangeType: 0, isReopening: false, taskId: 0,
    unkUtil: { data: null, numActive: 0, max: 0 },
    unkUtilData: Array.from({ length: 8 }, () => ({ src: null, dest: null, size: 0, unk: 0, height: 0, func: null })),
    partyMenuTilemapBuffer: new Uint16Array(0x108),
    partyMenuUnused1: 0, partyMenuY: 0, partyMenuUnused2: 0, partyMenuMoveTimer: 0,
    showPartyMenuState: 0, closeBoxFlashing: false, closeBoxFlashTimer: 0, closeBoxFlashState: false,
    newCurrBoxId: 0, bg2_X: 0, scrollSpeed: 0, scrollTimer: 0, wallpaperOffset: 0,
    scrollUnused1: 0, scrollToBoxIdUnused: 0, scrollUnused2: 0, scrollDirectionUnused: 0,
    scrollUnused3: 0, scrollUnused4: 0, scrollUnused5: 0, scrollUnused6: 0,
    filler1: new Uint8Array(22),
    boxTitleTiles: new Uint8Array(1024),
    boxTitleCycleId: 0, wallpaperLoadState: 0, wallpaperLoadBoxId: 0, wallpaperLoadDir: 0,
    boxTitlePal: new Uint16Array(16), boxTitlePalOffset: 0, boxTitleAltPalOffset: 0,
    curBoxTitleSprites: [-1, -1], nextBoxTitleSprites: [-1, -1], arrowSprites: [-1, -1],
    wallpaperPalBits: 0,
    filler2: new Uint8Array(80),
    unkUnused1: 0, wallpaperSetId: 0, wallpaperId: 0,
    wallpaperTilemap: new Uint16Array(360),
    wallpaperChangeState: 0, scrollState: 0, scrollToBoxId: 0, scrollDirection: 0,
    wallpaperTiles: null,
    movingMonSprite: -1,
    partySprites: Array.from({ length: PARTY_SIZE }, () => -1),
    boxMonsSprites: Array.from({ length: IN_BOX_COUNT }, () => -1),
    shiftMonSpritePtr: null, releaseMonSpritePtr: null,
    numIconsPerSpecies: new Uint16Array(MAX_MON_ICONS),
    iconSpeciesList: new Uint16Array(MAX_MON_ICONS),
    boxSpecies: new Uint16Array(IN_BOX_COUNT),
    boxPersonalities: new Uint32Array(IN_BOX_COUNT),
    incomingBoxId: 0, shiftTimer: 0, numPartyToCompact: 0,
    iconScrollDistance: 0, iconScrollPos: 0, iconScrollSpeed: 0, iconScrollNumIncoming: 0,
    iconScrollCurColumn: 0, iconScrollDirection: 0, iconScrollState: 0, iconScrollToBoxId: 0,
    menuWindow: { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 },
    menuItems: Array.from({ length: 7 }, () => ({ text: '', textId: 0 })),
    menuItemsCount: 0, menuWidth: 0, menuUnusedField: 0, menuWindowId: 0,
    cursorSprite: -1, cursorShadowSprite: -1,
    cursorNewX: 0, cursorNewY: 0, cursorSpeedX: 0, cursorSpeedY: 0,
    cursorTargetX: 0, cursorTargetY: 0, cursorMoveSteps: 0,
    cursorVerticalWrap: 0, cursorHorizontalWrap: 0,
    newCursorArea: 0, newCursorPosition: 0, cursorPrevHorizPos: 0, cursorFlipTimer: 0,
    cursorPalNums: [0, 0],
    displayMonPalette: null, displayMonPersonality: 0, displayMonSpecies: 0,
    displayMonItemId: 0, displayUnusedVar: 0, setMosaic: false,
    displayMonMarkings: 0, displayMonLevel: 0, displayMonIsEgg: false,
    displayMonName: '', displayMonNameText: '', displayMonSpeciesName: '',
    displayMonGenderLvlText: '', displayMonItemName: '',
    monPlaceChangeFunc: null, monPlaceChangeState: 0, shiftBoxId: 0,
    markingComboSprite: -1, waveformSprites: [-1, -1],
    markingComboTilesPtr: null,
    markMenu: null,
    chooseBoxMenu: {
      menuSprite: -1, menuSideSprites: [-1, -1, -1, -1], unused1: [0, 0, 0],
      arrowSprites: [-1, -1], unused2: new Uint8Array(0x214), loadedPalette: false,
      tileTag: 0, paletteTag: 0, curBox: 0, unused3: 0, subpriority: 0,
    },
    movingMon: null, tempMon: null,
    canReleaseMon: 0, releaseStatusResolved: false,
    releaseCheckBoxId: 0, releaseCheckBoxPos: 0, releaseBoxId: 0, releaseBoxPos: 0,
    releaseCheckState: 0, restrictedReleaseMonMoves: 0,
    restrictedMoveList: new Uint16Array(8),
    summaryMaxPos: 0, summaryStartPos: 0, summaryScreenMode: 0, summaryMon: null,
    messageText: '', boxTitleText: '', releaseMonName: '', itemName: '',
    inBoxMovingMode: 0, multiMoveWindowId: 0,
    itemIcons: Array.from({ length: MAX_ITEM_ICONS }, () => ({ sprite: -1, tiles: null, palIndex: 0, area: 0, pos: 0, active: false })),
    movingItemId: 0, itemInfoWindowOffset: 0, unkUnused2: 0,
    displayMonPalOffset: 0, displayMonTilePtr: null, displayMonSprite: -1,
    displayMonPalBuffer: new Uint16Array(0x40),
    tileBuffer: new Uint8Array(0x800 * 2),
    itemIconBuffer: new Uint8Array(0x800),
    wallpaperBgTilemapBuffer: new Uint8Array(0x1000),
    displayMenuTilemapBuffer: new Uint8Array(0x800),
  };
}

// ─── statics (:560-577) ──────────────────────────────────────────────────────
const sItemIconGfxBuffer = new Uint32Array(98);            // :560 static u32 [98]
let sPreviousBoxOption = 0;                                // :562 EWRAM u8
let sChooseBoxMenu: ChooseBoxMenu | null = null;           // :563 EWRAM struct ChooseBoxMenu *
let sStorage: PokemonStorageSystemData | null = null;      // :564 EWRAM struct PokemonStorageSystemData *
let sInPartyMenu = false;                                  // :565 EWRAM bool8
let sCurrentBoxOption = 0;                                 // :566 EWRAM u8
let sDepositBoxId = 0;                                     // :567 EWRAM u8
let sWhichToReshow = 0;                                    // :568 EWRAM u8
let sLastUsedBox = 0;                                      // :569 EWRAM u8
let sMovingItemId = 0;                                     // :570 EWRAM u16
let sSavedMovingMon: Pokemon | null = null;                // :571 EWRAM struct Pokemon = {0}
let sCursorArea = 0;                                       // :572 EWRAM s8
let sCursorPosition = 0;                                   // :573 EWRAM s8
let sIsMonBeingMoved = false;                              // :574 EWRAM bool8
let sMovingMonOrigBoxId = 0;                               // :575 EWRAM u8
let sMovingMonOrigBoxPos = 0;                              // :576 EWRAM u8
let sAutoActionOn = false;                                 // :577 EWRAM bool8
let sSavedCursorPosition = 0;                              // :6116 EWRAM u8

// ─── ASSETS (adaptation ROM→réseau, pattern icônes/mail) : les INCBIN/INCGFX (:952-968, :1318-1320,
// gStorageSystemMenu_Gfx, sDisplayMenu_Tilemap, gStorageSystemPartyMenu_*) se chargent en async au
// EnterPokeStorage ; Task_InitPokeStorage GATE dessus à l'état 0 (= le LZ77/DMA du décomp). ────────
interface StorageAssets {
  menuGfx: Uint8Array;                 // gStorageSystemMenu_Gfx (menu.png, BG1 char base)
  displayMenuTilemap: Uint16Array;     // sDisplayMenu_Tilemap (display_menu.bin)
  displayMenuPal: Uint16Array;         // display_menu.pal
  pkmnDataTilemap: Uint16Array;        // sPkmnData_Tilemap (pkmn_data.bin) :956
  interfacePal: Uint16Array;           // sInterface_Pal :958
  pkmnDataGrayPal: Uint16Array;        // sPkmnDataGray_Pal :959
  scrollingBgTiles: Uint8Array;        // sScrollingBg_Gfx :952 (scrolling_bg.png)
  scrollingBgTilemap: Uint16Array;     // sScrollingBg_Tilemap :953 (scrolling_bg.bin)
  scrollingBgPal: Uint16Array;         // sScrollingBg_Pal :960
  scrollingBgMoveItemsPal: Uint16Array;// sScrollingBgMoveItems_Pal :961
  closeBoxButtonTilemap: Uint16Array;  // sCloseBoxButton_Tilemap :962
  partySlotFilledTilemap: Uint16Array; // sPartySlotFilled_Tilemap :963
  partySlotEmptyTilemap: Uint16Array;  // sPartySlotEmpty_Tilemap :964
  waveformGfx: Uint8Array;             // sWaveform_Gfx :966 (waveform.png)
  waveformPal: Uint16Array;            // sWaveform_Pal :965
  textWindowsPal: Uint16Array;         // sTextWindows_Pal :968
  partyMenuTilemap: Uint16Array;       // gStorageSystemPartyMenu_Tilemap (party_menu.bin)
  partyMenuPal: Uint16Array;           // gStorageSystemPartyMenu_Pal (party_menu.pal)
  arrowGfx: Uint8Array;                // sArrow_Gfx :1244 (arrow.png)
  handCursorGfx: Uint8Array;           // sHandCursor_Gfx :1319 (hand_cursor.png)
  handCursorPal: Uint16Array;          // sHandCursor_Pal :1318 (PLTE = main JAUNE, misc_1)
  handCursorShadowGfx: Uint8Array;     // sHandCursorShadow_Gfx :1320
  chooseBoxCenterGfx: Uint8Array;      // sChooseBoxMenuCenter_Gfx :1771 (0x800 = 64 tiles, popup centre)
  chooseBoxSidesGfx: Uint8Array;       // sChooseBoxMenuSides_Gfx :1772 (0x180 = 12 tiles, popup bords)
}
let sStorageAssets: StorageAssets | null = null;
let _storageAssetsLoading: Promise<void> | null = null;

/** Tiles 4bpp d'un PNG du décomp : PLTE (indexé) via loadIndexedPngStrict, sinon GRAYSCALE via canvas.
 *  🩸 gbagfx INVERSE les index des PNG SANS palette (convert_png.c:95 hasPalette=false → gfx.c:167-170
 *  `index = 15 - gray`). Nos PNG public/ diffèrent selon l'extraction : arrow/box_popup sont déjà dans
 *  l'ordre final (R>>4 direct OK) ; scrolling_bg garde les valeurs grises brutes (5/6/7) → `invert=true`
 *  reproduit le 15-gray → index 10/9/8 = les couleurs PASTEL (rose/bleu pâle selon la palette). */
async function _loadTiles4bpp(url: string, invert = false): Promise<Uint8Array> {
  try {
    return (await loadIndexedPngStrict(url, 4)).charData;
  } catch {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`PNG load failed: ${url}`));
      el.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const wT = canvas.width >> 3, hT = canvas.height >> 3;
    const out = new Uint8Array(wT * hT * 32);
    let o = 0;
    for (let ty = 0; ty < hT; ty++) for (let tx = 0; tx < wT; tx++)
      for (let py = 0; py < 8; py++) for (let px = 0; px < 8; px += 2) {
        const i0 = ((ty * 8 + py) * canvas.width + tx * 8 + px) * 4;
        const l0 = data[i0] >> 4, h0 = data[i0 + 4] >> 4;
        const lo = invert ? 15 - l0 : l0, hi = invert ? 15 - h0 : h0;  // invert = inversion gbagfx grayscale
        out[o++] = lo | (hi << 4);
      }
    return out;
  }
}

function LoadStorageAssets(): void {
  if (sStorageAssets || _storageAssetsLoading) return;
  const base = '/decomp/em/pokemon_storage';
  _storageAssetsLoading = (async () => {
    const [menuGfx, dmTm, dmPal, pkTm, intPal, pkGrayPal, sbTiles, sbTm, sbPal, sbMiPal,
      cbTm, psfTm, pseTm, wavePng, twPal, pmTm, pmPal, arrowGfx, hcPng, hcsGfx,
      chooseBoxCenterGfx, chooseBoxSidesGfx] = await Promise.all([
      _loadTiles4bpp(`${base}/menu.png`),
      loadTilemapBin(`${base}/display_menu.bin`), loadGbaPal(`${base}/display_menu.pal`),
      loadTilemapBin(`${base}/pkmn_data.bin`), loadGbaPal(`${base}/interface.pal`),
      loadGbaPal(`${base}/pkmn_data_gray.pal`),
      _loadTiles4bpp(`${base}/scrolling_bg.png`, true), loadTilemapBin(`${base}/scrolling_bg.bin`),
      loadGbaPal(`${base}/scrolling_bg.pal`), loadGbaPal(`${base}/scrolling_bg_move_items.pal`),
      loadTilemapBin(`${base}/close_box_button.bin`),
      loadTilemapBin(`${base}/party_slot_filled.bin`), loadTilemapBin(`${base}/party_slot_empty.bin`),
      loadIndexedPngStrict(`${base}/waveform.png`, 4),
      loadGbaPal(`${base}/text_windows.pal`),
      loadTilemapBin(`${base}/party_menu.bin`), loadGbaPal(`${base}/party_menu.pal`),
      _loadTiles4bpp(`${base}/arrow.png`, true),
      loadIndexedPngStrict(`${base}/hand_cursor.png`, 4),
      _loadTiles4bpp(`${base}/hand_cursor_shadow.png`),
      _loadTiles4bpp(`${base}/box_selection_popup_center.png`, true),
      _loadTiles4bpp(`${base}/box_selection_popup_sides.png`, true),
    ]);
    sStorageAssets = {
      menuGfx,
      displayMenuTilemap: dmTm, displayMenuPal: dmPal,
      pkmnDataTilemap: pkTm, interfacePal: intPal, pkmnDataGrayPal: pkGrayPal,
      scrollingBgTiles: sbTiles, scrollingBgTilemap: sbTm,
      scrollingBgPal: sbPal, scrollingBgMoveItemsPal: sbMiPal,
      closeBoxButtonTilemap: cbTm, partySlotFilledTilemap: psfTm, partySlotEmptyTilemap: pseTm,
      waveformGfx: wavePng.charData, waveformPal: wavePng.palette,
      textWindowsPal: twPal, partyMenuTilemap: pmTm, partyMenuPal: pmPal,
      arrowGfx,
      handCursorGfx: hcPng.charData, handCursorPal: hcPng.palette,
      handCursorShadowGfx: hcsGfx,
      chooseBoxCenterGfx, chooseBoxSidesGfx,
    };
  })().catch((e) => { console.error('[pc-storage] échec chargement assets :', e); _storageAssetsLoading = null; });
}

// ─── sWindowTemplates (:970-1001) ────────────────────────────────────────────
const sWindowTemplates: WindowTemplate[] = [
  // The panel below the currently displayed Pokémon
  { bg: 1, tilemapLeft: 0, tilemapTop: 11, width: 9, height: 7, paletteNum: 3, baseBlock: 0xC0 },   // WIN_DISPLAY_INFO
  { bg: 0, tilemapLeft: 11, tilemapTop: 17, width: 18, height: 2, paletteNum: 15, baseBlock: 0x14 },// WIN_MESSAGE
  { bg: 0, tilemapLeft: 0, tilemapTop: 13, width: 21, height: 7, paletteNum: 15, baseBlock: 0x14 }, // WIN_ITEM_DESC
] as WindowTemplate[];

// ─── sBgTemplates (:1003-1041) ───────────────────────────────────────────────
const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0x100 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 27, screenSize: 1, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];

// ─── Données sprites 1:1 (:1043-1320) ────────────────────────────────────────
const sOamData_DisplayMon = { shape: 0 as const, size: 3 as const, priority: 0 };   // :1111 64×64
const sOamData_Waveform = { shape: 1 as const, size: 0 as const, priority: 0 };     // :1128 16×8
const sOamData_MonIcon = { shape: 0 as const, size: 2 as const, priority: 0 };      // :1204 32×32
const sOamData_BoxTitle = { shape: 1 as const, size: 2 as const, priority: 2 };     // :1246 32×16
const sOamData_Arrow = { shape: 2 as const, size: 0 as const, priority: 2 };        // :1282 8×16

const sAnims_Waveform: AnimCmd[][] = [                                              // :1145-1179
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],                                    // LeftOff
  [ANIMCMD_FRAME(2, 8), ANIMCMD_FRAME(4, 8), ANIMCMD_FRAME(6, 8), ANIMCMD_JUMP(0)], // LeftOn
  [ANIMCMD_FRAME(8, 5), ANIMCMD_END],                                    // RightOff
  [ANIMCMD_FRAME(10, 8), ANIMCMD_FRAME(4, 8), ANIMCMD_FRAME(12, 8), ANIMCMD_JUMP(0)], // RightOn
];
const sAnims_BoxTitle: AnimCmd[][] = [                                              // :1253-1269
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],
  [ANIMCMD_FRAME(8, 5), ANIMCMD_END],
];
const sAnims_Arrow: AnimCmd[][] = [                                                 // :1289-1305
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],
  [ANIMCMD_FRAME(2, 5), ANIMCMD_END],
];

// ─── Save accessors 1:1 (:1398, :9415-9560) — modèle unifié : champs directs des objets Pokemon. ──
/** 1:1 `u8 CountMonsInBox(u8 boxId)` (:1398). */
function CountMonsInBox(boxId: number): number {
  const boxes = GetPokemonStorage().boxes;
  let count = 0;
  for (let i = 0; i < IN_BOX_COUNT; i++) if (boxes[boxId]?.[i]?.species) count++;
  return count;
}
/** 1:1 `GetBoxMonDataAt(boxId, boxPosition, request)` (:9415) — requêtes servies par champ direct. */
function _boxMonAt(boxId: number, pos: number): Pokemon | null {
  return GetPokemonStorage().boxes[boxId]?.[pos] ?? null;
}
/** 1:1 `u8 *GetBoxNamePtr(u8 boxId)` (:9520) — nos noms = strings JS du save block. */
function GetBoxNamePtr(boxId: number): string {
  return GetPokemonStorage().boxNames?.[boxId] ?? `BOITE ${boxId + 1}`;
}
/** 1:1 `u8 GetBoxWallpaper(u8 boxId)` / `void SetBoxWallpaper(...)` (:9530-9545). */
function GetBoxWallpaper(boxId: number): number {
  return (GetPokemonStorage() as unknown as { wallpapers?: number[] }).wallpapers?.[boxId] ?? (boxId % 4);
}

// ─── TilemapUtil (:9772-9967) — moteur de tilemaps rectangulaires du PC. ─────
interface TilemapUtilRect { x: number; y: number; width: number; height: number; destX: number; destY: number; }
interface TilemapUtilEntry {
  savedTilemap: Uint16Array | null;
  tilemap: Uint16Array | null;
  bg: number;
  width: number; height: number;
  altWidth: number; altHeight: number;
  tileSize: number; rowSize: number;
  cur: TilemapUtilRect; prev: TilemapUtilRect;
  active: boolean;
}
let sTilemapUtil: TilemapUtilEntry[] = [];
let sNumTilemapUtilIds = 0;

/** 1:1 `TilemapUtil_Init(u8 count)` (:9772). */
function TilemapUtil_Init(count: number): void {
  sTilemapUtil = Array.from({ length: count }, () => ({
    savedTilemap: null, tilemap: null, bg: 0, width: 0, height: 0,
    altWidth: 0, altHeight: 0, tileSize: 0, rowSize: 0,
    cur: { x: 0, y: 0, width: 0, height: 0, destX: 0, destY: 0 },
    prev: { x: 0, y: 0, width: 0, height: 0, destX: 0, destY: 0 },
    active: false,
  }));
  sNumTilemapUtilIds = count;
}
/** 1:1 `TilemapUtil_Free` (:9785). */
function TilemapUtil_Free(): void { sTilemapUtil = []; sNumTilemapUtilIds = 0; }
/** 1:1 `TilemapUtil_SetMap(id, bg, tilemap, width, height)` (:9821) — nos BG PC = BG_TYPE_NORMAL,
 *  screenSize 0 (256×256) sauf BG2 512×256 (sBgTemplates :1023 screenSize=1). */
function TilemapUtil_SetMap(id: number, bg: number, tilemap: Uint16Array, width: number, height: number): void {
  if (id >= sNumTilemapUtilIds) return;
  const e = sTilemapUtil[id];
  e.savedTilemap = null;
  e.tilemap = tilemap;
  e.bg = bg;
  e.width = width; e.height = height;
  const screenSize = bg === 2 ? 1 : 0;             // = GetBgAttribute(bg, BG_ATTR_SCREENSIZE) via sBgTemplates
  e.altWidth = screenSize === 1 ? 512 : 256;       // sTilemapDimensions[BG_TYPE_NORMAL][screenSize] :9801
  e.altHeight = 256;
  e.tileSize = 2;                                   // BG_TYPE_NORMAL
  e.rowSize = e.tileSize * width;
  e.cur = { x: 0, y: 0, width, height, destX: 0, destY: 0 };
  e.prev = { ...e.cur };
  e.active = true;
}
/** 1:1 `TilemapUtil_SetPos(id, x, y)` (:9863). */
function TilemapUtil_SetPos(id: number, x: number, y: number): void {
  if (id >= sNumTilemapUtilIds) return;
  sTilemapUtil[id].cur.destX = x;
  sTilemapUtil[id].cur.destY = y;
  sTilemapUtil[id].active = true;
}
/** 1:1 `TilemapUtil_SetRect(id, x, y, width, height)` (:9873). */
function TilemapUtil_SetRect(id: number, x: number, y: number, width: number, height: number): void {
  if (id >= sNumTilemapUtilIds) return;
  const e = sTilemapUtil[id];
  e.cur.x = x; e.cur.y = y; e.cur.width = width; e.cur.height = height;
  e.active = true;
}
/** 1:1 `TilemapUtil_Move(id, mode, val)` (:9885). */
function TilemapUtil_Move(id: number, mode: number, val: number): void {
  if (id >= sNumTilemapUtilIds) return;
  const e = sTilemapUtil[id];
  switch (mode) {
    case 0: e.cur.destX += val; e.cur.width -= val; break;
    case 1: e.cur.x += val; e.cur.width += val; break;
    case 2: e.cur.destY += val; e.cur.height -= val; break;
    case 3: e.cur.y -= val; e.cur.height += val; break;
    case 4: e.cur.destX += val; break;
    case 5: e.cur.destY += val; break;
  }
  e.active = true;
}
/** 1:1 `CopyToBgTilemapBufferRect(bg, src, destX, destY, width, height)` (bg.c:907, branche
 *  BG_TYPE_NORMAL) — copie un rect linéaire src dans la tilemap du BG (précédent : easy_chat.ts). */
function CopyToBgTilemapBufferRect(bg: number, src: Uint16Array, srcOffset: number, destX: number, destY: number, width: number, height: number): void {
  const tilemap = GetBgTilemapBuffer(bg);
  const rowWidth = bg === 2 ? 64 : 32;  // BG2 = 512px = 64 tiles de large
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const di = (destY + y) * rowWidth + (destX + x);
      const si = srcOffset + y * width + x;
      if (di >= 0 && di < tilemap.length && si < src.length) tilemap[di] = src[si];
    }
  }
}
/** 1:1 `TilemapUtil_Draw(id)` (:9950) — copie le rect `cur` ligne par ligne. */
function TilemapUtil_Draw(id: number): void {
  const e = sTilemapUtil[id];
  if (!e.tilemap) return;
  for (let i = 0; i < e.cur.height; i++) {
    const srcOffset = (e.cur.y + i) * e.width + e.cur.x;
    CopyToBgTilemapBufferRect(e.bg, e.tilemap, srcOffset, e.cur.destX, e.cur.destY + i, e.cur.width, 1);
  }
}
/** 1:1 `TilemapUtil_Update(id)` (:9919) — savedTilemap toujours NULL (décomp : DrawPrev jamais appelé). */
function TilemapUtil_Update(id: number): void {
  if (id >= sNumTilemapUtilIds) return;
  TilemapUtil_Draw(id);
  sTilemapUtil[id].prev = { ...sTilemapUtil[id].cur };
}

// ─── UnkUtil (:9980-10002) — « functionally unused » (décomp) : Run tourne à vide chaque VBlank,
// les Add* sont UNUSED (jamais appelées) → non transcrites, documenté. ────────
let sUnkUtil: UnkUtil | null = null;
/** 1:1 `UnkUtil_Init(util, data, max)` (:9982). */
function UnkUtil_Init(util: UnkUtil, data: UnkUtilData[], max: number): void {
  sUnkUtil = util;
  util.data = data;
  util.max = max;
  util.numActive = 0;
}
/** 1:1 `UnkUtil_Run` (:9990) — numActive reste 0 (aucun Add), boucle à vide 1:1. */
function UnkUtil_Run(): void {
  if (sUnkUtil && sUnkUtil.numActive) {
    for (let i = 0; i < sUnkUtil.numActive; i++) {
      const d = sUnkUtil.data![i];
      d.func?.(d);
    }
    sUnkUtil.numActive = 0;
  }
}

/** 1:1 décomp `CheckFreePokemonStorageSpace(void)` (pokemon_storage_system.c:9572) :
 *    for (i = 0; i < TOTAL_BOXES_COUNT; i++)
 *      for (j = 0; j < IN_BOX_COUNT; j++)
 *        if (!GetBoxMonData(&boxes[i][j], MON_DATA_SANITY_HAS_SPECIES))
 *          return TRUE;
 *    return FALSE;
 *  Renvoie TRUE dès qu'un slot de boîte PC est libre. Nos slots sont `PokemonInstance
 *  | null` → libre = `null` (ou speciesId 0, = SPECIES_NONE). */
export function CheckFreePokemonStorageSpace(): boolean {
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const slot = boxes[i]?.[j];
      if (!slot || !slot.species) return true;
    }
  }
  return false;
}

/** 1:1 décomp `u8 StorageGetCurrentBox(void)` (pokemon_storage_system.c:9404) :
 *  `return gPokemonStoragePtr->currentBox;` — la boîte PC actuellement pointée
 *  par le curseur. Utilisé par ShouldShowBoxWasFullMessage (field_specials.c). */
export function StorageGetCurrentBox(): number {
  return GetPokemonStorage().currentBox;
}

/** 1:1 décomp `struct BoxPokemon *GetBoxedMonPtr(u8 boxId, u8 boxPosition)`
 *  (pokemon_storage_system.c:9450) : `&gPokemonStoragePtr->boxes[boxId][boxPosition]`.
 *  Nos slots = Pokemon | null (modèle unifié Pokemon == BoxPokemon). */
export function GetBoxedMonPtr(boxId: number, boxPosition: number) {
  return GetPokemonStorage().boxes[boxId]?.[boxPosition] ?? null;
}

/** 1:1 décomp `void SetBoxMonNickAt(u8 boxId, u8 boxPosition, const u8 *nick)`
 *  (pokemon_storage_system.c:9461) : SetBoxMonDataAt(MON_DATA_NICKNAME). Nos
 *  nicknames save = string JS. */
export function SetBoxMonNickAt(boxId: number, boxPosition: number, nick: string): void {
  const mon = GetPokemonStorage().boxes[boxId]?.[boxPosition];
  if (mon) mon.nickname = nick;
}

/** 1:1 décomp `bool8 AnyStorageMonWithMove(u16 move)` (pokemon_storage_system.c:9636) :
 *  ```c
 *  for (i < TOTAL_BOXES_COUNT) for (j < IN_BOX_COUNT)
 *      if (HAS_SPECIES && !IS_EGG && GetBoxMonData(KNOWN_MOVES, {move, MOVES_COUNT}))
 *          return TRUE;
 *  return FALSE;
 *  ```
 *  TRUE si AU MOINS un Pokémon (non-œuf) du PC connaît `move`. Utilisé par
 *  IsLastMonThatKnowsSurf (anti-softlock : on ne bloque l'oubli que si AUCUN mon
 *  party NI PC ne connaît le move). Box mons = Pokemon NUMÉRIQUES : `move` (id décomp)
 *  comparé direct à `mon.moves[]` (number[]). */
export function AnyStorageMonWithMove(move: number): boolean {
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const mon = boxes[i]?.[j];
      if (mon && mon.species && !mon.isEgg && mon.moves.includes(move)) {
        return true;
      }
    }
  }
  return false;
}

/** 1:1 décomp `u32 CountStorageNonEggMons(void)` (pokemon_storage_system.c:9600) :
 *  ```c
 *  for (i < TOTAL_BOXES_COUNT) for (j < IN_BOX_COUNT)
 *      if (HAS_SPECIES && !IS_EGG) count++;
 *  ```
 *  Compte les Pokémon (non-œuf) rangés dans les boîtes PC. Utilisé par
 *  CountPartyAliveNonEggMons (= PC + party), consommé par les scripts de pension. */
export function CountStorageNonEggMons(): number {
  const boxes = GetPokemonStorage().boxes;
  let count = 0;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const mon = boxes[i]?.[j];
      if (mon && mon.species && !mon.isEgg) count++;
    }
  }
  return count;
}

/** 1:1 décomp `s16 CompactPartySlots(void)` (pokemon_storage_system.c:6734-6757) :
 *  ```c
 *  for (i = 0, last = 0; i < PARTY_SIZE; i++) {
 *      u16 species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES);
 *      if (species != SPECIES_NONE) {
 *          if (i != last) gPlayerParty[last] = gPlayerParty[i];
 *          last++;
 *      } else if (retVal == -1) retVal = i;
 *  }
 *  for (; last < PARTY_SIZE; last++) ZeroMonData(&gPlayerParty[last]);
 *  ```
 *  Compacte les slots party (mons valides remontés en tête, queue zérotée) ;
 *  retourne l'index du 1er slot qui était vide (-1 si aucun). La copie de struct
 *  `gPlayerParty[last] = gPlayerParty[i]` = CopyMon (copie par VALEUR — les slots
 *  gPlayerParty sont des objets fixes, jamais réassignés par référence). */
export function CompactPartySlots(): number {
  let retVal = -1;
  let last = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
    if (species !== 0 /* SPECIES_NONE */) {
      if (i !== last) CopyMon(gPlayerParty[last], gPlayerParty[i]);
      last++;
    } else if (retVal === -1) {
      retVal = i;
    }
  }
  for (; last < PARTY_SIZE; last++) ZeroMonData(gPlayerParty[last]);
  return retVal;
}

/** 1:1 décomp `u8 CountPartyAliveNonEggMonsExcept(u8 slotToIgnore)`
 *  (pokemon_storage_system.c:1440) : compte les mons party vivants (HP>0), non-œufs,
 *  hors slot `slotToIgnore` (PARTY_SIZE = aucun slot ignoré). */
export function CountPartyAliveNonEggMonsExcept(slotToIgnore: number): number {
  let count = 0;
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const mon = gPlayerParty[i];
    if (i !== slotToIgnore
      && (GetMonData(mon, MON_DATA_SPECIES) as number) !== 0 /* SPECIES_NONE */
      && !(GetMonData(mon, MON_DATA_IS_EGG) as number)
      && (GetMonData(mon, MON_DATA_HP) as number) !== 0) {
      count++;
    }
  }
  return count;
}

/** 1:1 décomp `u16 CountPartyAliveNonEggMons_IgnoreVar0x8004Slot(void)`
 *  (pokemon_storage_system.c:1458) — special (pension : « dernier mon valide ? »). */
export function CountPartyAliveNonEggMons_IgnoreVar0x8004Slot(): number {
  return CountPartyAliveNonEggMonsExcept(VarGet(0x8004) /* gSpecialVar_0x8004 */);
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION — SECTION Main tasks + gfx init (:1979-4290, :5183-5860, :6802-6990)
// ═══════════════════════════════════════════════════════════════════════════
const FONT_SMALL = 0, FONT_SHORT = 2;             // fonts.h (FONT_NORMAL=1 déclaré plus bas)
const MON_PIC_SIZE = 0x800;                       // 64×64 4bpp
const SPECIES_NONE = 0;
// io_reg offsets 1:1 (gba/io_reg.h) — locaux (le module include n'exporte que DISPCNT).
const REG_OFFSET_BG0CNT = 0x8, REG_OFFSET_BG1CNT = 0xA, REG_OFFSET_BG2CNT = 0xC, REG_OFFSET_BG3CNT = 0xE;
const REG_OFFSET_BG2HOFS = 0x18, REG_OFFSET_BG2VOFS = 0x1A, REG_OFFSET_BG3HOFS = 0x1C, REG_OFFSET_BG3VOFS = 0x1E;
const REG_OFFSET_BG0HOFS = 0x10, REG_OFFSET_BG0VOFS = 0x12, REG_OFFSET_BG1HOFS = 0x14, REG_OFFSET_BG1VOFS = 0x16;
const REG_OFFSET_BLDCNT = 0x50, REG_OFFSET_BLDALPHA = 0x52, REG_OFFSET_MOSAIC = 0x4C;
const PALETTES_ALL = 0xFFFFFFFF;
const RGB_BLACK = 0x0000;

/** Adaptation renderer PROUVÉE (sonde live, cf. [[chantier-pc-storage]]) : notre buildOamBuffer trie
 *  la subpriority à l'INVERSE du HW GBA (haute = devant). Mapping monotone 31−n sur TOUTES les
 *  subpriorities de cet écran → l'ordre relatif 1:1 est préservé à l'identique. */
function _sub(n: number): number { return 31 - n; }
/** Sprite live par id (nos champs sStorage.*Sprite = spriteIds). */
function _spr(id: number) { const rt = getRuntime(); return rt && id >= 0 ? rt.gSprites[id] : null; }

// ─── Cache front-pic du display mon (adaptation ROM→réseau, pattern pokemon_icon) ───
const _displayMonCache = new Map<number, { tiles: Uint8Array; pal: Uint16Array } | null>();
function PreloadDisplayMonPic(species: number): void {
  if (species === SPECIES_NONE || _displayMonCache.has(species)) return;
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const dexId = speciesEnum.replace(/^SPECIES_/, '').toLowerCase();
  _displayMonCache.set(species, null); // gate posé (null = en cours/échec)
  void (async () => {
    const png = await loadIndexedPngStrict(`/decomp/em/pokemon/${dexId}/anim_front.png`, 4);
    const pal = await loadGbaPal(`/decomp/em/pokemon/${dexId}/normal.pal`);
    _displayMonCache.set(species, { tiles: png.charData.subarray(0, MON_PIC_SIZE), pal });
    if (sStorage && sStorage.displayMonSpecies === species) LoadDisplayMonGfx(species, sStorage.displayMonPersonality);
  })().catch((e) => console.error('[pc-storage] front pic', dexId, e));
}

// ─── :1979 VBlankCB_PokeStorage — LoadOam/SpriteCopy/TransferPltt = harness ; reste 1:1. ───
function VBlankCB_PokeStorage(): void {
  const rt = getRuntime(); if (!rt || !sStorage) return;
  UnkUtil_Run();
  rt.SetGpuReg(REG_OFFSET_BG2HOFS, sStorage.bg2_X);
}

// ─── :1988 CB2_PokeStorage ───
function CB2_PokeStorage(): void {
  const rt = getRuntime(); if (!rt) return;
  rt.runTasks?.();
  // DoScheduledBgTilemapCopiesToVram : nos copies BG sont synchrones (ScheduleBgCopyTilemapToVram no-op).
  ScrollBackground();
  UpdateCloseBoxButtonFlash();
  rt.animateSprites?.();
  rt.buildOamBuffer?.();
  rt.UpdatePaletteFade?.();  // harness : avance gPaletteFade (décomp : VBlank TransferPlttBuffer)
  VBlankCB_PokeStorage();
}

// ─── :2037 ResetAllBgCoords ───
function ResetAllBgCoords(): void {
  const rt = getRuntime(); if (!rt) return;
  rt.SetGpuReg(REG_OFFSET_BG0HOFS, 0); rt.SetGpuReg(REG_OFFSET_BG0VOFS, 0);
  rt.SetGpuReg(REG_OFFSET_BG1HOFS, 0); rt.SetGpuReg(REG_OFFSET_BG1VOFS, 0);
  rt.SetGpuReg(REG_OFFSET_BG2HOFS, 0); rt.SetGpuReg(REG_OFFSET_BG2VOFS, 0);
  rt.SetGpuReg(REG_OFFSET_BG3HOFS, 0); rt.SetGpuReg(REG_OFFSET_BG3VOFS, 0);
}

// ─── :2049 ResetForPokeStorage ───
function ResetForPokeStorage(): void {
  const s = sStorage!;
  ResetPaletteFade();
  ResetSpriteData();          // + FreeSpriteTileRanges/ClearDma3Requests/gReservedSpriteTileCount : harness
  FreeAllSpritePalettes();
  // gKeyRepeatStartDelay = 20 : géré par le harness input.
  UnkUtil_Init(s.unkUtil, s.unkUtilData, s.unkUtilData.length);
  TilemapUtil_Init(TILEMAPID_COUNT);
  TilemapUtil_SetMap(TILEMAPID_PKMN_DATA, 1, sStorageAssets!.pkmnDataTilemap, 8, 4);
  TilemapUtil_SetPos(TILEMAPID_PKMN_DATA, 1, 0);
  s.closeBoxFlashing = false;
}

// ─── :2066 InitStartingPosData ───
function InitStartingPosData(): void {
  ClearSavedCursorPos();
  sInPartyMenu = (sStorage!.boxOption === OPTION_DEPOSIT);
  sDepositBoxId = 0;
}

// ─── :2073 SetMonIconTransparency ───
function SetMonIconTransparency(): void {
  const rt = getRuntime(); if (!rt) return;
  if (sStorage!.boxOption === OPTION_MOVE_ITEMS) {
    rt.SetGpuReg(REG_OFFSET_BLDCNT, 0x3F00 /* BLDCNT_TGT2_ALL */);
    rt.SetGpuReg(REG_OFFSET_BLDALPHA, (11 << 8) | 7 /* BLDALPHA_BLEND(7, 11) */);
  }
  rt.SetGpuReg(REG_OFFSET_DISPCNT, 0x1F40);  // DISPCNT_OBJ_ON | DISPCNT_BG_ALL_ON | DISPCNT_OBJ_1D_MAP
}

// ─── :2083 SetPokeStorageTask ───
function SetPokeStorageTask(newFunc: (taskId: number) => void): void {
  const rt = getRuntime(); if (!rt) return;
  rt.gTasks[sStorage!.taskId].func = (t: { taskId: number }) => newFunc(t.taskId);
  sStorage!.state = 0;
}

// ─── :3773 GiveChosenBagItem / :6687 LoadSavedMovingMon / :6726 SetSelectionAfterSummaryScreen —
// chemins reopening (retour bag/name/summary) : transcription au lot fermeture/reshow (tâche #4).
function LoadSavedMovingMon(): void { throw new Error('[pc-storage] LoadSavedMovingMon : lot reshow (tâche #4)'); }
function SetSelectionAfterSummaryScreen(): void { throw new Error('[pc-storage] SetSelectionAfterSummaryScreen : lot reshow (tâche #4)'); }
function GiveChosenBagItem(): void { throw new Error('[pc-storage] GiveChosenBagItem : lot reshow (tâche #4)'); }
// ─── :items (MOVE_ITEMS) : lot déplacer-objets. IsItemIconAnimActive faux par défaut (aucun item icon).
function CreateItemIconSprites(): void { throw new Error('[pc-storage] CreateItemIconSprites : lot items'); }
function InitCursorItemIcon(): void { throw new Error('[pc-storage] InitCursorItemIcon : lot items'); }
function IsItemIconAnimActive(): boolean { return false; }
function IsMovingItem(): boolean { return false; }  // :items — MOVE_ITEMS non ouvert pour l'instant

// ─── :3807 SetScrollingBackground + :3814 ScrollBackground ───
let _bg3X = 0, _bg3Y = 0;  // BG_COORD 8.8 (ChangeBgX/Y accumulés, VBlank remonte >>8)
function SetScrollingBackground(): void {
  const rt = getRuntime(); const a = sStorageAssets; if (!rt || !a) return;
  rt.SetGpuReg(REG_OFFSET_BG3CNT, (3 << 0) | (3 << 2) | (31 << 8));  // PRIORITY(3)|CHARBASE(3)|SCREENBASE(31)|16COLOR
  LoadBgTiles(3, a.scrollingBgTiles, a.scrollingBgTiles.length, 0);
  GetBgTilemapBuffer(3).set(a.scrollingBgTilemap.subarray(0, GetBgTilemapBuffer(3).length));
  ShowBg(3);
  _bg3X = 0; _bg3Y = 0;
}
function ScrollBackground(): void {
  const rt = getRuntime(); if (!rt) return;
  _bg3X = (_bg3X + 128) >>> 0;          // ChangeBgX(3, 128, BG_COORD_ADD)
  _bg3Y = (_bg3Y - 128) >>> 0;          // ChangeBgY(3, 128, BG_COORD_SUB)
  rt.SetGpuReg(REG_OFFSET_BG3HOFS, (_bg3X >> 8) & 0x1FF);
  rt.SetGpuReg(REG_OFFSET_BG3VOFS, (_bg3Y >> 8) & 0x1FF);
}

// ─── :3820 LoadPokeStorageMenuGfx ───
function LoadPokeStorageMenuGfx(): void {
  const rt = getRuntime(); const a = sStorageAssets; if (!rt || !a) return;
  InitBgsFromTemplates(0, sBgTemplates, sBgTemplates.length);
  // bg.c GBA : LoadBgTiles ajoute le baseTile du template (BG1 baseTile=0x100, sBgTemplates :1021)
  // → display_menu.bin référence les tiles du menu à 0x100+n. Notre LoadBgTiles ne connaît pas le
  // template : offset explicite.
  LoadBgTiles(1, a.menuGfx, a.menuGfx.length, 0x100);
  // LZ77UnCompWram(sDisplayMenu_Tilemap → displayMenuTilemapBuffer) + SetBgTilemapBuffer(1) :
  // adaptation moteur (précédent easy_chat) : écrire direct la tilemap BG1 du moteur.
  GetBgTilemapBuffer(1).set(a.displayMenuTilemap.subarray(0, GetBgTilemapBuffer(1).length));
  ShowBg(1);
  ScheduleBgCopyTilemapToVram(1);
}

// ─── :3830 InitPokeStorageWindows ───
function InitPokeStorageWindows(): boolean {
  InitWindows(sWindowTemplates);
  // DeactivateAllTextPrinters : harness (printers par window, pas de pool global).
  return true;
}

// ─── :3843 LoadWaveformSpritePalette ───
function LoadWaveformSpritePalette(): void {
  LoadSpritePalette({ data: sStorageAssets!.waveformPal, tag: PALTAG_MISC_2 });  // sWaveformSpritePalette :1043
}

// ─── :3848 InitPalettesAndSprites ───
function InitPalettesAndSprites(): void {
  const rt = getRuntime(); const a = sStorageAssets; if (!rt || !a) return;
  LoadPalette(a.interfacePal, BG_PLTT_ID(0), a.interfacePal.length * 2);
  LoadPalette(a.pkmnDataGrayPal, BG_PLTT_ID(2), a.pkmnDataGrayPal.length * 2);
  LoadPalette(a.textWindowsPal, BG_PLTT_ID(15), a.textWindowsPal.length * 2);
  if (sStorage!.boxOption !== OPTION_MOVE_ITEMS)
    LoadPalette(a.scrollingBgPal, BG_PLTT_ID(3), a.scrollingBgPal.length * 2);
  else
    LoadPalette(a.scrollingBgMoveItemsPal, BG_PLTT_ID(3), a.scrollingBgMoveItemsPal.length * 2);
  rt.SetGpuReg(REG_OFFSET_BG1CNT, (1 << 0) | (1 << 2) | (30 << 8));  // PRIORITY(1)|CHARBASE(1)|SCREENBASE(30)
  CreateDisplayMonSprite();
  CreateMarkingComboSprite();
  CreateWaveformSprites();
  RefreshDisplayMonData();
}

// ─── :3865 CreateMarkingComboSprite ───
function CreateMarkingComboSprite(): void {
  const s = sStorage!;
  s.markingComboSprite = CreateMonMarkingComboSprite(GFXTAG_MARKING_COMBO, PALTAG_MARKING_COMBO, null);
  const spr = _spr(s.markingComboSprite);
  if (spr) {
    const rt = getRuntime()!;
    rt.gba.oam[spr.oamIndex].priority = 1;
    spr.subpriority = _sub(1);
    spr.x = 40; spr.y = 150;
  }
}

// ─── :3875 CreateWaveformSprites ───
function CreateWaveformSprites(): void {
  const s = sStorage!; const a = sStorageAssets!;
  LoadSpriteSheet({ data: a.waveformGfx, size: a.waveformGfx.length, tag: GFXTAG_WAVEFORM });  // sSpriteSheet_Waveform :1048
  for (let i = 0; i < 2; i++) {
    const spriteId = CreateSprite({
      tileTag: GFXTAG_WAVEFORM, paletteTag: PALTAG_MISC_2, oam: sOamData_Waveform,
      anims: sAnims_Waveform, callback: null,
    }, i * 63 + 8, 9, _sub(2));
    s.waveformSprites[i] = spriteId;
  }
}

// ─── :3888 RefreshDisplayMonData ───
function RefreshDisplayMonData(): void {
  const s = sStorage!;
  LoadDisplayMonGfx(s.displayMonSpecies, s.displayMonPersonality);
  PrintDisplayMonInfo();
  UpdateWaveformAnimation();
  ScheduleBgCopyTilemapToVram(0);
}

// ─── :3896 StartDisplayMonMosaicEffect + :3909 IsDisplayMosaicActive + :3914 SpriteCB ───
function StartDisplayMonMosaicEffect(): void {
  const rt = getRuntime(); const s = sStorage!;
  RefreshDisplayMonData();
  const spr = _spr(s.displayMonSprite);
  if (rt && spr) {
    rt.gba.oam[spr.oamIndex].mosaic = true;
    spr.data[0] = 10; spr.data[1] = 1;
    spr.callback = SpriteCB_DisplayMonMosaic;
    rt.SetGpuReg(REG_OFFSET_MOSAIC, (spr.data[0] << 12) | (spr.data[0] << 8));
  }
}
function IsDisplayMosaicActive(): boolean {
  const rt = getRuntime(); const spr = _spr(sStorage!.displayMonSprite);
  return !!(rt && spr && rt.gba.oam[spr.oamIndex].mosaic);
}
function SpriteCB_DisplayMonMosaic(sprite: { data: number[]; oamIndex: number; callback: unknown }): void {
  const rt = getRuntime(); if (!rt) return;
  sprite.data[0] -= sprite.data[1];
  if (sprite.data[0] < 0) sprite.data[0] = 0;
  rt.SetGpuReg(REG_OFFSET_MOSAIC, (sprite.data[0] << 12) | (sprite.data[0] << 8));
  if (sprite.data[0] === 0) {
    rt.gba.oam[sprite.oamIndex].mosaic = false;
    sprite.callback = null;
  }
}

// ─── :3927 CreateDisplayMonSprite ───
function CreateDisplayMonSprite(): void {
  const s = sStorage!;
  s.tileBuffer.fill(0, 0, MON_PIC_SIZE);
  s.displayMonPalBuffer.fill(0, 0, 16);
  s.displayMonSprite = -1;
  const tileStart = LoadSpriteSheet({ data: s.tileBuffer.subarray(0, MON_PIC_SIZE), size: MON_PIC_SIZE, tag: GFXTAG_DISPLAY_MON });
  const palSlot = LoadSpritePalette({ data: s.displayMonPalBuffer.subarray(0, 16), tag: PALTAG_DISPLAY_MON });
  const spriteId = CreateSprite({
    tileTag: GFXTAG_DISPLAY_MON, paletteTag: PALTAG_DISPLAY_MON, oam: sOamData_DisplayMon,
    anims: null, callback: null,
  }, 40, 48, _sub(0));
  if (spriteId !== 64 /* MAX_SPRITES */) {
    s.displayMonSprite = spriteId;
    s.displayMonPalOffset = 256 + palSlot * 16;  // OBJ_PLTT_ID(palSlot)
    s.displayMonTilePtr = tileStart;              // adaptation : tile start OBJ VRAM
  } else {
    _freeSpriteTileRangeByTag(GFXTAG_DISPLAY_MON);
    FreeSpritePaletteByTag(PALTAG_DISPLAY_MON);
  }
}

// ─── :3970 LoadDisplayMonGfx ───
function LoadDisplayMonGfx(species: number, _pid: number): void {
  const rt = getRuntime(); const s = sStorage!;
  const spr = _spr(s.displayMonSprite);
  if (!rt || !spr) return;
  if (species !== SPECIES_NONE) {
    const entry = _displayMonCache.get(species);
    if (!entry) { PreloadDisplayMonPic(species); spr.invisible = true; return; }  // gate async (recharge à l'arrivée)
    // LoadSpecialPokePic + LZ77UnCompWram(pal) + CpuCopy32 → OBJ VRAM + LoadPalette :
    s.tileBuffer.set(entry.tiles.subarray(0, MON_PIC_SIZE));
    rt._writeToObjVram?.(entry.tiles.subarray(0, MON_PIC_SIZE), (s.displayMonTilePtr as number) * 32);
    for (let i = 0; i < 16; i++) s.displayMonPalBuffer[i] = entry.pal[i];
    LoadPalette(entry.pal.subarray(0, 16), s.displayMonPalOffset, 32);
    spr.invisible = false;
  } else {
    spr.invisible = true;
  }
}

// ─── :3989 PrintDisplayMonInfo ───
function PrintDisplayMonInfo(): void {
  const s = sStorage!;
  FillWindowPixelBuffer(WIN_DISPLAY_INFO, PIXEL_FILL_1);
  if (s.boxOption !== OPTION_MOVE_ITEMS) {
    AddTextPrinterParameterized(WIN_DISPLAY_INFO, FONT_NORMAL, s.displayMonNameText, 6, 0, TEXT_SKIP_DRAW, null);
    AddTextPrinterParameterized(WIN_DISPLAY_INFO, FONT_SHORT, s.displayMonSpeciesName, 6, 15, TEXT_SKIP_DRAW, null);
    AddTextPrinterParameterized(WIN_DISPLAY_INFO, FONT_SHORT, s.displayMonGenderLvlText, 10, 29, TEXT_SKIP_DRAW, null);
    AddTextPrinterParameterized(WIN_DISPLAY_INFO, FONT_SMALL, s.displayMonItemName, 6, 43, TEXT_SKIP_DRAW, null);
  } else {
    AddTextPrinterParameterized(WIN_DISPLAY_INFO, FONT_SMALL, s.displayMonItemName, 6, 0, TEXT_SKIP_DRAW, null);
    AddTextPrinterParameterized(WIN_DISPLAY_INFO, FONT_NORMAL, s.displayMonNameText, 6, 13, TEXT_SKIP_DRAW, null);
    AddTextPrinterParameterized(WIN_DISPLAY_INFO, FONT_SHORT, s.displayMonSpeciesName, 6, 28, TEXT_SKIP_DRAW, null);
    AddTextPrinterParameterized(WIN_DISPLAY_INFO, FONT_SHORT, s.displayMonGenderLvlText, 10, 42, TEXT_SKIP_DRAW, null);
  }
  CopyWindowToVram(WIN_DISPLAY_INFO, 2 /* COPYWIN_GFX */);
  const combo = _spr(s.markingComboSprite);
  if (s.displayMonSpecies !== SPECIES_NONE) {
    UpdateMonMarkingTiles(s.displayMonMarkings, s.markingComboTilesPtr);
    if (combo) combo.invisible = false;
  } else {
    if (combo) combo.invisible = true;
  }
}

// ─── :4020 UpdateWaveformAnimation ───
function UpdateWaveformAnimation(): void {
  const s = sStorage!;
  if (s.displayMonSpecies !== SPECIES_NONE) {
    TilemapUtil_SetRect(TILEMAPID_PKMN_DATA, 0, 0, 8, 2);
    for (let i = 0; i < 2; i++) { const w = _spr(s.waveformSprites[i]); if (w) StartSpriteAnimIfDifferent(w as never, i * 2 + 1); }
  } else {
    TilemapUtil_SetRect(TILEMAPID_PKMN_DATA, 0, 2, 8, 2);
    for (let i = 0; i < 2; i++) { const w = _spr(s.waveformSprites[i]); if (w) StartSpriteAnim(w as never, i * 2); }
  }
  TilemapUtil_Update(TILEMAPID_PKMN_DATA);
  ScheduleBgCopyTilemapToVram(1);
}

// ─── :4043 InitSupplementalTilemaps ───
function InitSupplementalTilemaps(): void {
  const a = sStorageAssets!; const s = sStorage!;
  s.partyMenuTilemapBuffer.set(a.partyMenuTilemap.subarray(0, s.partyMenuTilemapBuffer.length));  // LZ77UnCompWram
  LoadPalette(a.partyMenuPal, BG_PLTT_ID(1), 32);
  TilemapUtil_SetMap(TILEMAPID_PARTY_MENU, 1, s.partyMenuTilemapBuffer, 12, 22);
  TilemapUtil_SetMap(TILEMAPID_CLOSE_BUTTON, 1, a.closeBoxButtonTilemap, 9, 4);
  TilemapUtil_SetPos(TILEMAPID_PARTY_MENU, 10, 0);
  TilemapUtil_SetPos(TILEMAPID_CLOSE_BUTTON, 21, 0);
  SetPartySlotTilemaps();
  if (sInPartyMenu) {
    UpdateCloseBoxButtonTilemap(true);
    CreatePartyMonsSprites(true);
    TilemapUtil_Update(TILEMAPID_CLOSE_BUTTON);
    TilemapUtil_Update(TILEMAPID_PARTY_MENU);
  } else {
    TilemapUtil_SetRect(TILEMAPID_PARTY_MENU, 0, 20, 12, 2);
    UpdateCloseBoxButtonTilemap(true);
    TilemapUtil_Update(TILEMAPID_PARTY_MENU);
    TilemapUtil_Update(TILEMAPID_CLOSE_BUTTON);
  }
  ScheduleBgCopyTilemapToVram(1);
  s.closeBoxFlashing = false;
}

// ─── :4143-4177 close box button ───
function UpdateCloseBoxButtonTilemap(normal: boolean): void {
  if (normal) TilemapUtil_SetRect(TILEMAPID_CLOSE_BUTTON, 0, 0, 9, 2);
  else TilemapUtil_SetRect(TILEMAPID_CLOSE_BUTTON, 0, 2, 9, 2);
  TilemapUtil_Update(TILEMAPID_CLOSE_BUTTON);
  ScheduleBgCopyTilemapToVram(1);
}
function StartFlashingCloseBoxButton(): void {
  const s = sStorage!;
  s.closeBoxFlashing = true; s.closeBoxFlashTimer = 30; s.closeBoxFlashState = true;
}
function StopFlashingCloseBoxButton(): void {
  const s = sStorage!;
  if (s.closeBoxFlashing) { s.closeBoxFlashing = false; UpdateCloseBoxButtonTilemap(true); }
}
function UpdateCloseBoxButtonFlash(): void {
  const s = sStorage; if (!s) return;
  if (s.closeBoxFlashing && ++s.closeBoxFlashTimer > 30) {
    s.closeBoxFlashTimer = 0;
    s.closeBoxFlashState = !s.closeBoxFlashState;
    UpdateCloseBoxButtonTilemap(s.closeBoxFlashState);
  }
}

// ─── :4180 SetPartySlotTilemaps + :4193 SetPartySlotTilemap ───
function SetPartySlotTilemaps(): void {
  for (let i = 1; i < PARTY_SIZE; i++) {
    const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
    SetPartySlotTilemap(i, species !== SPECIES_NONE);
  }
}
function SetPartySlotTilemap(partyId: number, hasMon: boolean): void {
  const a = sStorageAssets!; const s = sStorage!;
  const data = hasMon ? a.partySlotFilledTilemap : a.partySlotEmptyTilemap;
  let index = 3 * (3 * (partyId - 1) + 1);
  index *= 4;
  index += 7;
  let src = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) s.partyMenuTilemapBuffer[index + j] = data[src + j];
    src += 4;
    index += 12;
  }
}
function UpdatePartySlotColors(): void {
  SetPartySlotTilemaps();
  TilemapUtil_SetRect(TILEMAPID_PARTY_MENU, 0, 0, 12, 22);
  TilemapUtil_Update(TILEMAPID_PARTY_MENU);
  ScheduleBgCopyTilemapToVram(1);
}
// ═══ Party menu latéral (:4739-4915 sprites + :4071-4254 menu) — RETIRER/DÉPOSER ═══
const DISPLAY_HEIGHT = 160;
// :4739 CreatePartyMonsSprites — les 6 icônes de l'équipe (slot 0 en haut-gauche, 1-5 à droite).
function CreatePartyMonsSprites(visible: boolean): void {
  const s = sStorage!;
  let species = (gPlayerParty[0] as Pokemon | undefined)?.species ?? SPECIES_NONE;
  let personality = (gPlayerParty[0] as Pokemon | undefined)?.personality ?? 0;
  s.partySprites[0] = CreateMonIconSprite(species, personality, 104, 64, 1, _sub(12));
  let count = 1;
  for (let i = 1; i < PARTY_SIZE; i++) {
    species = (gPlayerParty[i] as Pokemon | undefined)?.species ?? SPECIES_NONE;
    if (species !== SPECIES_NONE) {
      personality = (gPlayerParty[i] as Pokemon).personality ?? 0;
      s.partySprites[i] = CreateMonIconSprite(species, personality, 152, 8 * (3 * (i - 1)) + 16, 1, _sub(12));
      count++;
    } else {
      s.partySprites[i] = -1;
    }
  }
  if (!visible) {
    for (let i = 0; i < count; i++) {
      const spr = _spr(s.partySprites[i]);
      if (spr) { spr.y -= DISPLAY_HEIGHT; spr.invisible = true; }
    }
  }
  // boxOption MOVE_ITEMS : blend des icônes sans objet (lot items).
}
// :4781 CompactPartySprites / :4801 GetNumPartySpritesCompacting ───
function CompactPartySprites(): void {
  const s = sStorage!;
  s.numPartyToCompact = 0;
  let targetSlot = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (s.partySprites[i] >= 0) {
      if (i !== targetSlot) {
        MovePartySpriteToNextSlot(s.partySprites[i], targetSlot);
        s.partySprites[i] = -1;
        s.numPartyToCompact++;
      }
      targetSlot++;
    }
  }
}
function GetNumPartySpritesCompacting(): number { return sStorage!.numPartyToCompact; }
// :4813 MovePartySpriteToNextSlot (data[1]=partyId, [2]=monX, [3]=monY, [4]=speedX, [5]=speedY, [6]=steps).
function MovePartySpriteToNextSlot(spriteId: number, partyId: number): void {
  const spr = _spr(spriteId); if (!spr) return;
  spr.data[1] = partyId;
  let x: number, y: number;
  if (partyId === 0) { x = 104; y = 64; } else { x = 152; y = 8 * (3 * (partyId - 1)) + 16; }
  spr.data[2] = (spr.x & 0xFFFF) * 8;
  spr.data[3] = (spr.y & 0xFFFF) * 8;
  spr.data[4] = Math.trunc(((x * 8) - spr.data[2]) / 8);
  spr.data[5] = Math.trunc(((y * 8) - spr.data[3]) / 8);
  spr.data[6] = 8;
  spr.callback = SpriteCB_MovePartyMonToNextSlot;
}
function SpriteCB_MovePartyMonToNextSlot(sprite: { x: number; y: number; data: number[]; callback: unknown }): void {
  if (sprite.data[6] !== 0) {
    sprite.data[2] += sprite.data[4]; const x = sprite.data[2];
    sprite.data[3] += sprite.data[5]; const y = sprite.data[3];
    sprite.x = Math.trunc(x / 8);
    sprite.y = Math.trunc(y / 8);
    sprite.data[6]--;
  } else {
    if (sprite.data[1] === 0) { sprite.x = 104; sprite.y = 64; }
    else { sprite.x = 152; sprite.y = 8 * (3 * (sprite.data[1] - 1)) + 16; }
    sprite.callback = null;  // SpriteCallbackDummy
  }
}
// :4875 MovePartySprites / :4894 DestroyPartyMonIcon / :4903 DestroyAllPartyMonIcons ───
function MovePartySprites(yDelta: number): void {
  const s = sStorage!;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const spr = _spr(s.partySprites[i]);
    if (spr) {
      spr.y += yDelta;
      const posY = spr.y + spr.y2 + spr.centerToCornerVecY + 16;
      spr.invisible = posY > 192;
    }
  }
}
function DestroyPartyMonIcon(partyId: number): void {
  const s = sStorage!;
  if (s.partySprites[partyId] >= 0) { DestroySprite(s.partySprites[partyId]); s.partySprites[partyId] = -1; }  // DestroyBoxMonIcon (refcount tiles = lot suivant)
}
function DestroyAllPartyMonIcons(): void {
  const s = sStorage!;
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (s.partySprites[i] >= 0) { DestroySprite(s.partySprites[i]); s.partySprites[i] = -1; }
  }
}

// :4071 SetUpShowPartyMenu / :4079 ShowPartyMenu ───
function SetUpShowPartyMenu(): void {
  const s = sStorage!;
  s.partyMenuUnused1 = 20; s.partyMenuY = 2; s.partyMenuMoveTimer = 0;
  CreatePartyMonsSprites(false);
}
function ShowPartyMenu(): boolean {
  const s = sStorage!;
  if (s.partyMenuMoveTimer === 20) return false;
  s.partyMenuUnused1--; s.partyMenuY++;
  TilemapUtil_Move(TILEMAPID_PARTY_MENU, 3, 1);
  TilemapUtil_Update(TILEMAPID_PARTY_MENU);
  ScheduleBgCopyTilemapToVram(1);
  MovePartySprites(8);
  if (++s.partyMenuMoveTimer === 20) { sInPartyMenu = true; return false; }
  return true;
}
// :4101 SetUpHidePartyMenu / :4110 HidePartyMenu ───
function SetUpHidePartyMenu(): void {
  const s = sStorage!;
  s.partyMenuUnused1 = 0; s.partyMenuY = 22; s.partyMenuMoveTimer = 0;
  // boxOption MOVE_ITEMS : MoveHeldItemWithPartyMenu (lot items).
}
function HidePartyMenu(): boolean {
  const s = sStorage!;
  if (s.partyMenuMoveTimer !== 20) {
    s.partyMenuUnused1++; s.partyMenuY--;
    TilemapUtil_Move(TILEMAPID_PARTY_MENU, 3, -1);
    TilemapUtil_Update(TILEMAPID_PARTY_MENU);
    FillBgTilemapBufferRect_Palette0(1, 0x100, 10, s.partyMenuY, 12, 1);
    MovePartySprites(-8);
    if (++s.partyMenuMoveTimer !== 20) { ScheduleBgCopyTilemapToVram(1); return true; }
    sInPartyMenu = false;
    DestroyAllPartyMonIcons();
    CompactPartySlots();
    TilemapUtil_SetRect(TILEMAPID_CLOSE_BUTTON, 0, 0, 9, 2);
    TilemapUtil_Update(TILEMAPID_CLOSE_BUTTON);
    ScheduleBgCopyTilemapToVram(1);
    return false;
  }
  return false;
}
// :4224 SetUpDoShowPartyMenu / :4231 DoShowPartyMenu ───
function SetUpDoShowPartyMenu(): void {
  sStorage!.showPartyMenuState = 0;
  PlaySE(0x15 /* SE_WIN_OPEN */);
  SetUpShowPartyMenu();
}
function DoShowPartyMenu(): boolean {
  const s = sStorage!;
  switch (s.showPartyMenuState) {
    case 0:
      if (!ShowPartyMenu()) { SetCursorInParty(); s.showPartyMenuState++; }
      break;
    case 1:
      if (!UpdateCursorPos()) {
        if (s.setMosaic) StartDisplayMonMosaicEffect();
        s.showPartyMenuState++;
      }
      break;
    case 2:
      return false;
  }
  return true;
}

// :2538 Task_ShowPartyPokemon / :2553 Task_HidePartyPokemon / :3332 Task_HandleMovingMonFromParty ───
function Task_ShowPartyPokemon(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0: SetUpDoShowPartyMenu(); s.state++; break;
    case 1: if (!DoShowPartyMenu()) SetPokeStorageTask(Task_PokeStorageMain); break;
  }
}
function Task_HidePartyPokemon(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0: PlaySE(0x5 /* SE_SELECT */); SetUpHidePartyMenu(); s.state++; break;
    case 1:
      if (!HidePartyMenu()) { SetCursorBoxPosition(GetSavedCursorPos()); s.state++; }
      break;
    case 2:
      if (!UpdateCursorPos()) {
        if (s.setMosaic) StartDisplayMonMosaicEffect();
        SetPokeStorageTask(Task_PokeStorageMain);
      }
      break;
  }
}
function Task_HandleMovingMonFromParty(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0: CompactPartySlots(); CompactPartySprites(); s.state++; break;
    case 1:
      if (GetNumPartySpritesCompacting() === 0) { UpdatePartySlotColors(); SetPokeStorageTask(Task_PokeStorageMain); }
      break;
  }
}

// :2795 Task_WithdrawMon — RETIRER : grab boîte → party menu → place équipe → hide. ───
function Task_WithdrawMon(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      if (CalculatePlayerPartyCount() === PARTY_SIZE) { PrintMessage(MSG_PARTY_FULL); s.state = 1; }
      else { SaveCursorPos(); InitMonPlaceChange(CHANGE_GRAB); s.state = 2; }
      break;
    case 1:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0 /* DPAD_ANY */)) { ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain); }
      break;
    case 2:
      if (!DoMonPlaceChange()) { SetMovingMonPriority(1); SetUpDoShowPartyMenu(); s.state++; }
      break;
    case 3:
      if (!DoShowPartyMenu()) { InitMonPlaceChange(CHANGE_PLACE); s.state++; }
      break;
    case 4:
      if (!DoMonPlaceChange()) { UpdatePartySlotColors(); s.state++; }
      break;
    case 5:
      SetPokeStorageTask(Task_HidePartyPokemon);
      break;
  }
}

// ═══ Choose Box menu (:1761-1966) — popup de choix de boîte (dépôt/jump) + DÉPOSER ═══
const sAnims_ChooseBoxMenu: AnimCmd[][] = [
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],   // TopLeft
  [ANIMCMD_FRAME(4, 5), ANIMCMD_END],   // BottomLeft
  [ANIMCMD_FRAME(6, 5), ANIMCMD_END],   // TopRight
  [ANIMCMD_FRAME(10, 5), ANIMCMD_END],  // BottomRight
];
// :1761 LoadChooseBoxMenuGfx (loadPal toujours FALSE → palette = misc_1 déjà chargée par le curseur).
function LoadChooseBoxMenuGfx(menu: ChooseBoxMenu, tileTag: number, palTag: number, subpriority: number, _loadPal: boolean): void {
  const a = sStorageAssets!;
  LoadSpriteSheet({ data: a.chooseBoxCenterGfx, size: 0x800, tag: tileTag });
  LoadSpriteSheet({ data: a.chooseBoxSidesGfx, size: 0x180, tag: tileTag + 1 });
  sChooseBoxMenu = menu;
  menu.tileTag = tileTag;
  menu.paletteTag = palTag;
  menu.subpriority = subpriority;
  menu.loadedPalette = false;
}
function FreeChooseBoxMenu(): void {
  const m = sChooseBoxMenu; if (!m) return;
  if (m.loadedPalette) FreeSpritePaletteByTag(m.paletteTag);
  _freeSpriteTileRangeByTag(m.tileTag);
  _freeSpriteTileRangeByTag(m.tileTag + 1);
}
function CreateChooseBoxMenuSprites(curBox: number): void { ChooseBoxMenu_CreateSprites(curBox); }
function DestroyChooseBoxMenuSprites(): void { ChooseBoxMenu_DestroySprites(); }
// :1806 HandleChooseBoxMenuInput ───
function HandleChooseBoxMenuInput(): number {
  const m = sChooseBoxMenu!;
  if (gMain.newKeys & B_BUTTON) { PlaySE(0x5); return BOXID_CANCELED; }
  if (gMain.newKeys & A_BUTTON) { PlaySE(0x5); return m.curBox; }
  if (gMain.newKeys & DPAD_LEFT) { PlaySE(0x5); ChooseBoxMenu_MoveLeft(); }
  else if (gMain.newKeys & DPAD_RIGHT) { PlaySE(0x5); ChooseBoxMenu_MoveRight(); }
  return BOXID_NONE_CHOSEN;
}
// :1831 ChooseBoxMenu_CreateSprites — centre 64×64 + 4 bords 8×32 + 2 flèches. ───
function ChooseBoxMenu_CreateSprites(curBox: number): void {
  const rt = getRuntime(); const m = sChooseBoxMenu!; if (!rt) return;
  m.curBox = curBox;
  const centerId = CreateSprite({
    tileTag: m.tileTag, paletteTag: m.paletteTag, oam: { shape: 0, size: 3, priority: 0, paletteNum: 1 },
    anims: null, callback: null,
  }, 160, 96, 0);
  m.menuSprite = centerId;
  for (let i = 0; i < 4; i++) {
    const spriteId = CreateSprite({
      tileTag: m.tileTag + 1, paletteTag: m.paletteTag, oam: { shape: 2, size: 1, priority: 0 },
      anims: sAnims_ChooseBoxMenu, callback: null,
    }, 124, 80, _sub(m.subpriority));
    m.menuSideSprites[i] = spriteId;
    let anim = 0;
    const spr = _spr(spriteId);
    if (i & 2) { if (spr) spr.x = 196; anim = 2; }
    if (i & 1) { if (spr) { spr.y = 112; rt.gba.oam[spr.oamIndex].size = 0; } anim++; }
    if (spr) StartSpriteAnim(spr as never, anim);
  }
  for (let i = 0; i < 2; i++) {
    const arrowId = CreateChooseBoxArrows(72 * i + 124, 88, i, 0, m.subpriority);
    m.arrowSprites[i] = arrowId;
    const spr = _spr(arrowId);
    if (spr) { spr.data[0] = (i === 0 ? -1 : 1); spr.callback = SpriteCB_ChooseBoxArrow; }
  }
  ChooseBoxMenu_PrintInfo();
}
function ChooseBoxMenu_DestroySprites(): void {
  const m = sChooseBoxMenu!;
  if (m.menuSprite >= 0) { DestroySprite(m.menuSprite); m.menuSprite = -1; }
  for (let i = 0; i < 4; i++) if (m.menuSideSprites[i] >= 0) { DestroySprite(m.menuSideSprites[i]); m.menuSideSprites[i] = -1; }
  for (let i = 0; i < 2; i++) if (m.arrowSprites[i] >= 0) DestroySprite(m.arrowSprites[i]);
}
// :1908 MoveRight / :1915 MoveLeft ───
function ChooseBoxMenu_MoveRight(): void {
  const m = sChooseBoxMenu!;
  if (++m.curBox >= TOTAL_BOXES_COUNT) m.curBox = 0;
  ChooseBoxMenu_PrintInfo();
}
function ChooseBoxMenu_MoveLeft(): void {
  const m = sChooseBoxMenu!;
  m.curBox = m.curBox === 0 ? TOTAL_BOXES_COUNT - 1 : m.curBox - 1;
  ChooseBoxMenu_PrintInfo();
}
// :1921 ChooseBoxMenu_PrintInfo — nom + #/30 → tiles → OBJ VRAM du sprite centre. ───
function ChooseBoxMenu_PrintInfo(): void {
  const rt = getRuntime(); const m = sChooseBoxMenu!; if (!rt) return;
  const boxName = GetBoxNamePtr(m.curBox);
  const numInBox = CountMonsInBox(m.curBox);
  const winTemplate = { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 8, height: 4, paletteNum: 0, baseBlock: 0 } as WindowTemplate;
  const windowId = AddWindow(winTemplate);
  FillWindowPixelBuffer(windowId, 0x44);  // PIXEL_FILL(4)
  const colors = [1 /* TEXT_COLOR_RED */, 15, 14];  // sChooseBoxMenu_TextColors
  let center = GetStringCenterAlignXOffset(boxName, 64, FONT_NORMAL);
  AddTextPrinterParameterized3(windowId, FONT_NORMAL, center, 1, colors, TEXT_SKIP_DRAW, boxName);
  const numText = String(numInBox).padStart(2, ' ') + '/30';  // ConvertIntToDecimalStringN(RIGHT_ALIGN,2)+OutOf30
  center = GetStringCenterAlignXOffset(numText, 64, FONT_NORMAL);
  AddTextPrinterParameterized3(windowId, FONT_NORMAL, center, 17, colors, TEXT_SKIP_DRAW, numText);
  const tiles = ExtractWindowTiles4bpp(windowId);  // 32 tiles (8×4) = 0x400
  const tileStart = GetSpriteTileStartByTag(m.tileTag);
  rt._writeToObjVram?.(tiles, tileStart * 32 + 0x100);  // CpuCopy32 → OBJ VRAM sprite centre + 0x100
  RemoveWindow(windowId);
}
// :1954 SpriteCB_ChooseBoxArrow ───
function SpriteCB_ChooseBoxArrow(sprite: { data: number[]; x2: number }): void {
  if (++sprite.data[1] > 3) {
    sprite.data[1] = 0;
    sprite.x2 += sprite.data[0];
    if (++sprite.data[2] > 5) { sprite.data[2] = 0; sprite.x2 = 0; }
  }
}
// :5766 CreateChooseBoxArrows (flèches gauche/droite de la popup). ───
function CreateChooseBoxArrows(x: number, y: number, animId: number, priority: number, subpriority: number): number {
  const rt = getRuntime(); const a = sStorageAssets!; if (!rt) return -1;
  LoadSpriteSheet({ data: a.arrowGfx, size: a.arrowGfx.length, tag: GFXTAG_ARROW });
  const spriteId = CreateSprite({
    tileTag: GFXTAG_ARROW, paletteTag: PALTAG_MISC_2, oam: sOamData_Arrow, anims: sAnims_Arrow, callback: null,
  }, x, y, _sub(subpriority));
  if (spriteId === 64) return -1;
  const spr = _spr(spriteId)!;
  StartSpriteAnim(spr as never, animId % 2);
  rt.gba.oam[spr.oamIndex].priority = priority;
  return spriteId;
}

// :6426 ResetSelectionAfterDeposit ───
function ResetSelectionAfterDeposit(): void {
  const cursor = _spr(sStorage!.cursorSprite);
  if (cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_BOUNCE);
  TryRefreshDisplayMon();
}
// :6400 TryStorePartyMonInBox — stocke le mon (en main OU sous le curseur party) dans la boîte. ───
function TryStorePartyMonInBox(boxId: number): boolean {
  const boxPosition = GetFirstFreeBoxSpot(boxId);
  if (boxPosition === -1) return false;
  if (sIsMonBeingMoved) {
    SetPlacedMonData(boxId, boxPosition);
    DestroyMovingMonIcon();
    sIsMonBeingMoved = false;
  } else {
    SetMovingMonData(TOTAL_BOXES_COUNT, sCursorPosition);
    SetPlacedMonData(boxId, boxPosition);
    DestroyPartyMonIcon(sCursorPosition);
  }
  if (boxId === StorageGetCurrentBox()) CreateBoxMonIconAtPos(boxPosition);
  const cursor = _spr(sStorage!.cursorSprite);
  if (cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_STILL);
  return true;
}
// :1411 GetFirstFreeBoxSpot ───
function GetFirstFreeBoxSpot(boxId: number): number {
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < IN_BOX_COUNT; i++) {
    if (!boxes[boxId]?.[i]?.species) return i;
  }
  return -1;
}

// :2847 Task_DepositMenu — DÉPOSER : choisir la boîte (popup) → TryStorePartyMonInBox. ───
function Task_DepositMenu(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      PrintMessage(MSG_DEPOSIT_IN_WHICH_BOX);
      LoadChooseBoxMenuGfx(s.chooseBoxMenu, GFXTAG_CHOOSE_BOX_MENU, PALTAG_MISC_1, 3, false);
      CreateChooseBoxMenuSprites(sDepositBoxId);
      s.state++;
      break;
    case 1: {
      const boxId = HandleChooseBoxMenuInput();
      if (boxId === BOXID_NONE_CHOSEN) break;
      if (boxId === BOXID_CANCELED) {
        ClearBottomWindow(); DestroyChooseBoxMenuSprites(); FreeChooseBoxMenu();
        SetPokeStorageTask(Task_PokeStorageMain);
      } else if (TryStorePartyMonInBox(boxId)) {
        sDepositBoxId = boxId;
        ClearBottomWindow(); DestroyChooseBoxMenuSprites(); FreeChooseBoxMenu();
        s.state = 2;
      } else {
        PrintMessage(MSG_BOX_IS_FULL);
        s.state = 4;
      }
      break;
    }
    case 2:
      CompactPartySlots(); CompactPartySprites(); s.state++;
      break;
    case 3:
      if (GetNumPartySpritesCompacting() === 0) {
        ResetSelectionAfterDeposit(); StartDisplayMonMosaicEffect(); UpdatePartySlotColors();
        SetPokeStorageTask(Task_PokeStorageMain);
      }
      break;
    case 4:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0)) { PrintMessage(MSG_DEPOSIT_IN_WHICH_BOX); s.state = 1; }
      break;
  }
}

// ─── :4265 InitPokeStorageBg0 ───
function InitPokeStorageBg0(): void {
  const rt = getRuntime(); if (!rt) return;
  rt.SetGpuReg(REG_OFFSET_BG0CNT, (0 << 0) | (0 << 2) | (29 << 8));  // PRIORITY(0)|CHARBASE(0)|SCREENBASE(29)
  LoadUserWindowBorderGfx(WIN_MESSAGE, 2, BG_PLTT_ID(13));
  FillBgTilemapBufferRect(0, 0, 0, 0, 32, 20, 17);
  CopyBgTilemapBufferToVram(0);
}

// ─── :4404 InitMonIconFields ───
function InitMonIconFields(): void {
  const s = sStorage!;
  LoadMonIconPalettes();
  for (let i = 0; i < MAX_MON_ICONS; i++) s.numIconsPerSpecies[i] = 0;
  for (let i = 0; i < MAX_MON_ICONS; i++) s.iconSpeciesList[i] = SPECIES_NONE;
  for (let i = 0; i < PARTY_SIZE; i++) s.partySprites[i] = -1;
  for (let i = 0; i < IN_BOX_COUNT; i++) s.boxMonsSprites[i] = -1;
  s.movingMonSprite = -1;
  s.unkUnused1 = 0;
}

// ─── :4437 InitBoxMonSprites + :4478 CreateBoxMonIconAtPos ───
const IN_BOX_ROWS = 5;
function InitBoxMonSprites(boxId: number): void {
  const s = sStorage!;
  let boxPosition = 0;
  let count = 0;
  for (let i = 0; i < IN_BOX_ROWS; i++) {
    for (let j = 0; j < IN_BOX_COLUMNS; j++) {
      const mon = _boxMonAt(boxId, boxPosition);
      const species = mon && mon.species ? mon.species : SPECIES_NONE;
      if (species !== SPECIES_NONE) {
        const personality = mon!.personality ?? 0;
        s.boxMonsSprites[count] = CreateMonIconSprite(species, personality, 8 * (3 * j) + 100, 8 * (3 * i) + 44, 2, _sub(19 - j));
      } else {
        s.boxMonsSprites[count] = -1;
      }
      boxPosition++;
      count++;
    }
  }
  // boxOption MOVE_ITEMS : blend des icônes sans objet (lot items).
}
function CreateBoxMonIconAtPos(boxPosition: number): void {
  const s = sStorage!;
  const mon = _boxMonAt(StorageGetCurrentBox(), boxPosition);
  const species = mon && mon.species ? mon.species : SPECIES_NONE;
  if (species !== SPECIES_NONE) {
    const x = 8 * (3 * (boxPosition % IN_BOX_COLUMNS)) + 100;
    const y = 8 * (3 * Math.floor(boxPosition / IN_BOX_COLUMNS)) + 44;
    s.boxMonsSprites[boxPosition] = CreateMonIconSprite(species, mon!.personality ?? 0, x, y, 2, _sub(19 - (boxPosition % IN_BOX_COLUMNS)));
  }
}

// ─── :5079 SetMovingMonPriority ───
function SetMovingMonPriority(priority: number): void {
  const rt = getRuntime(); const spr = _spr(sStorage!.movingMonSprite);
  if (rt && spr) rt.gba.oam[spr.oamIndex].priority = priority;
}

// ─── :5183 CreateInitBoxTask + :5190 IsInitBoxActive + :5195 Task_InitBox ───
function CreateInitBoxTask(boxId: number): void {
  const rt = getRuntime(); if (!rt) return;
  const taskId = rt.CreateTask((t: { taskId: number }) => Task_InitBox(t.taskId), 2);
  rt.gTasks[taskId].data[2] = boxId;  // tBoxId = data[2] (:5181 #define)
}
function IsInitBoxActive(): boolean {
  return FuncIsActiveTask(Task_InitBox as never);
}
function Task_InitBox(taskId: number): void {
  const rt = getRuntime(); if (!rt) return;
  const task = rt.gTasks[taskId];
  const s = sStorage!;
  switch (task.data[0] /* tState */) {
    case 0:
      s.wallpaperOffset = 0;
      s.bg2_X = 0;
      s.wallpaperBgTilemapBuffer.fill(0);  // RequestDma3Fill(0, buffer) — copie synchrone
      GetBgTilemapBuffer(2).fill(0);
      break;
    case 1:
      // CheckForSpaceForDma3Request : synchrone → toujours prêt. SetBgTilemapBuffer(2) : tilemap moteur directe.
      ShowBg(2);
      break;
    case 2:
      LoadWallpaperGfx(task.data[2] /* tBoxId */, 0);
      break;
    case 3:
      if (!WaitForWallpaperGfxLoad()) return;
      InitBoxTitle(task.data[2]);
      CreateBoxScrollArrows();
      InitBoxMonSprites(task.data[2]);
      rt.SetGpuReg(REG_OFFSET_BG2CNT, (2 << 0) | (2 << 2) | (27 << 8) | (1 << 14));  // PRIORITY(2)|CHARBASE(2)|SCREENBASE(27)|TXT512x256
      break;
    case 4:
      rt.DestroyTask(taskId);
      return;
    default:
      task.data[0] = 0;
      return;
  }
  task.data[0]++;
}

// ─── :5315-5460 Wallpaper gfx — assets = wallpapers/<dir>/{frame.png(tiles), tilemap.bin} ; palettes
// (2×16) = PLTE du frame.png. Chargement async par wallpaper (cache), gate = WaitForWallpaperGfxLoad. ───
const sWallpaperDirs = [  // 1:1 enum WALLPAPER_* (data/wallpapers.h) → dossiers assets
  'forest', 'city', 'desert', 'savanna', 'crag', 'volcano', 'snow', 'cave',
  'beach', 'seafloor', 'river', 'sky', 'polkadot', 'pokecenter', 'machine', 'simple',
];
// 1:1 graphics_file_rules.mk:178-275 — `frame.png → frame.4bpp -num_tiles N` PUIS
// `cat frame.4bpp bg.4bpp > tiles.4bpp`. Le -num_tiles TRONQUE frame à N tiles (padding du .png
// ignoré) → bg est concaténé au tile N, PAS à la fin des 64 tiles décodés. La tilemap réfère bg
// à partir du tile N. 0 = pas de -num_tiles (règle générique %.4bpp: %.png = tout le .png).
const sWallpaperFrameNumTiles = [55, 52, 0, 45, 49, 56, 57, 55, 46, 54, 51, 45, 54, 35, 33, 18];
const sWallpaperBgNumTiles    = [0, 0, 0, 23, 0, 0, 0, 0, 23, 0, 11, 0, 0, 0, 0, 0];
const _wallpaperCache = new Map<number, { tiles: Uint8Array; tilemap: Uint16Array; palettes: Uint16Array } | null>();
let _wallpaperLoadPending = false;
function _loadWallpaperAssets(wallpaperId: number): void {
  if (_wallpaperCache.has(wallpaperId)) return;
  _wallpaperLoadPending = true;
  const dir = sWallpaperDirs[wallpaperId] ?? 'forest';
  void (async () => {
    // Assets : frame.png (128×32 = 64 tiles, sous-palette 0) + bg.png (32×16 = 8 tiles, sous-palette 1),
    // concaténés comme le blob décomp (Walda copie son icône à +0x800 = après les 64 tiles du frame).
    const frame = await loadIndexedPngStrict(`/decomp/em/pokemon_storage/wallpapers/${dir}/frame.png`, 4);
    const bg = await loadIndexedPngStrict(`/decomp/em/pokemon_storage/wallpapers/${dir}/bg.png`, 4);
    const tilemap = await loadTilemapBin(`/decomp/em/pokemon_storage/wallpapers/${dir}/tilemap.bin`);
    // 1:1 Makefile : frame tronqué à -num_tiles (0 = tout), bg tronqué idem, puis concaténés.
    const frameLen = (sWallpaperFrameNumTiles[wallpaperId] || frame.charData.length / 32) * 32;
    const bgLen = (sWallpaperBgNumTiles[wallpaperId] || bg.charData.length / 32) * 32;
    const tiles = new Uint8Array(frameLen + bgLen);
    tiles.set(frame.charData.subarray(0, frameLen), 0);
    tiles.set(bg.charData.subarray(0, bgLen), frameLen);
    const palettes = new Uint16Array(32);                    // 2 palettes 4bpp (frame + bg)
    palettes.set(frame.palette.subarray(0, 16), 0);
    palettes.set(bg.palette.subarray(0, 16), 16);
    _wallpaperCache.set(wallpaperId, { tiles, tilemap, palettes });
  })().catch((e) => {
    console.error('[pc-storage] wallpaper', dir, e);
    _wallpaperCache.set(wallpaperId, null);  // release le gate (écran sans wallpaper plutôt que freeze)
  }).finally(() => { _wallpaperLoadPending = false; });
}
function LoadWallpaperGfx(boxId: number, direction: number): void {
  const s = sStorage!;
  s.wallpaperLoadState = 0;
  s.wallpaperLoadBoxId = boxId;
  s.wallpaperLoadDir = direction;
  if (s.wallpaperLoadDir !== 0) {
    s.wallpaperOffset = s.wallpaperOffset === 0 ? 1 : 0;
    TrimOldWallpaper();
  }
  const wallpaperId = GetBoxWallpaper(s.wallpaperLoadBoxId);
  _loadWallpaperAssets(wallpaperId);  // async : la suite au WaitForWallpaperGfxLoad
}
function _applyLoadedWallpaper(): void {
  const s = sStorage!;
  const wallpaperId = GetBoxWallpaper(s.wallpaperLoadBoxId);
  const wp = _wallpaperCache.get(wallpaperId);
  if (!wp) return;  // échec de chargement : pas de wallpaper (loggué)
  s.wallpaperTilemap.set(wp.tilemap.subarray(0, s.wallpaperTilemap.length));  // LZ77UnCompWram
  DrawWallpaper(s.wallpaperTilemap, s.wallpaperLoadDir, s.wallpaperOffset);
  const palOffset = BG_PLTT_ID(4) + BG_PLTT_ID(s.wallpaperOffset * 2);
  LoadPalette(wp.palettes, palOffset, 64);  // 2 palettes 4bpp (dir≠0 : fade géré ; dir=0 : CpuCopy16 ≈ LoadPalette)
  LoadBgTiles(2, wp.tiles, wp.tiles.length, s.wallpaperOffset << 8);
  CopyBgTilemapBufferToVram(2);
}
function WaitForWallpaperGfxLoad(): boolean {
  if (_wallpaperLoadPending) return false;   // IsDma3ManagerBusyWithBgCopy
  _applyLoadedWallpaper();
  const s = sStorage!;
  s.wallpaperTiles = null;                    // TRY_FREE_AND_SET_NULL
  return true;
}
// ─── :5423 DrawWallpaper ───
function DrawWallpaper(tilemap: Uint16Array, direction: number, offset: number): void {
  const s = sStorage!;
  const tileOffset = offset * 256;
  const paletteNum = (offset * 2) + 3;
  let x = ((Math.floor(s.bg2_X / 8) + 10) + (direction * 24)) & 0x3F;
  // CopyRectToBgTilemapBufferRect(2, tilemap, 0,0, 20,18, x,2, 20,18, 17, tileOffset, paletteNum) :
  // bg.c — palette1=17 (>15) = conserver la palette source ; tileOffset et paletteNum s'AJOUTENT
  // à chaque entrée (srcPal 1..2 + 3 → banques 4..5 = les 2 palettes wallpaper chargées).
  const dest = GetBgTilemapBuffer(2);
  // BG2 = screenSize 1 (512×256) → tilemap screenblock-major (2 blocs 32×32), PAS linéaire stride 64.
  // `tileMapIndex` mappe (x,y)→index 1:1 comme bg.c ; l'ancien `(2+ty)*64+destX` sautait 1 row sur 2.
  const screenSize = getRuntime()?.gba.bg(2).config.screenSize ?? 1;
  for (let ty = 0; ty < 18; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      const entry = tilemap[ty * 20 + tx];
      const srcPal = (entry >> 12) & 0xF;
      const destX = (x + tx) & 0x3F;
      const di = tileMapIndex(destX, 2 + ty, screenSize);
      if (di >= 0 && di < dest.length) dest[di] = ((entry & 0x3FF) + tileOffset) | (((srcPal + paletteNum) & 0xF) << 12) | (entry & 0x0C00);
    }
  }
  if (direction === 0) return;
  if (direction > 0) x += 20; else x -= 4;
  FillBgTilemapBufferRect(2, 0, x, 2, 4, 0x12, 17);
}
// ─── :5441 TrimOldWallpaper — efface la colonne de l'ancien wallpaper (scroll). ───
function TrimOldWallpaper(): void {
  const s = sStorage!;
  const dest = GetBgTilemapBuffer(2);
  const screenSize = getRuntime()?.gba.bg(2).config.screenSize ?? 1;  // screenblock-major (cf. DrawWallpaper)
  let r3 = (Math.floor(s.bg2_X / 8) + 30) & 0x3F;
  for (let i = 0; i < 0x2C; i++) {
    const col = r3 & 0x3F;
    const row = 2 + (i % 22);  // approximation structurée du parcours 0x260/0x640 (colonnes×22 lignes)
    const di = tileMapIndex(col, row, screenSize);
    if (di >= 0 && di < dest.length) dest[di] = 0;
    r3 = (r3 + 1) & 0x3F;
  }
}

// :1328 DrawTextWindowAndBufferTiles — rend un texte dans un window temp puis repack ses tiles vers
// dst (buffer de tiles sprite), 2 rangées entrelacées (sprites 32×16 : 4 tiles row0 + 4 tiles row1).
function DrawTextWindowAndBufferTiles(str: string, dst: Uint8Array, zero1: number, zero2: number, bytesToBuffer: number): void {
  const winTemplate = { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 24, height: 2, paletteNum: 0, baseBlock: 0 } as WindowTemplate;
  const windowId = AddWindow(winTemplate);
  FillWindowPixelBuffer(windowId, (zero2 << 4) | zero2);   // PIXEL_FILL(zero2)
  const txtColor = [zero1 ? zero2 : 0 /* TEXT_COLOR_TRANSPARENT */, 15 /* TEXT_DYNAMIC_COLOR_6 */, 14 /* TEXT_DYNAMIC_COLOR_5 */];
  AddTextPrinterParameterized4(windowId, FONT_NORMAL, 0, 1, 0, 0, txtColor, TEXT_SKIP_DRAW, str);
  const tiles = ExtractWindowTiles4bpp(windowId);          // tileData1 = row 0 (24 tiles), tileData2 = row 1
  const rowBytes = 24 * 32;
  let t1 = 0, t2 = rowBytes, d = 0;
  const n = Math.min(bytesToBuffer, 6);
  for (let i = n; i > 0; i--) {
    dst.set(tiles.subarray(t1, t1 + 0x80), d);             // 4 tiles row 0
    dst.set(tiles.subarray(t2, t2 + 0x80), d + 0x80);      // 4 tiles row 1
    t1 += 0x80; t2 += 0x80; d += 0x100;
  }
  RemoveWindow(windowId);
}

// ─── :5469 InitBoxTitle + :5621 GetBoxTitleBaseX ───
// 1:1 sBoxTitleColors[WALLPAPER_COUNT][2] (data/wallpapers.h:154) : {shadow, text} — IDENTIQUE
// pour les 17 wallpapers → RGB(7,7,7)=0x1CE7 (ombre gris foncé), RGB_WHITE=0x7FFF (texte blanc).
const sBoxTitleShadowColor = 0x1CE7;  // RGB(7,7,7) = 7|(7<<5)|(7<<10)
const sBoxTitleTextColor = 0x7FFF;    // RGB_WHITE
function InitBoxTitle(boxId: number): void {
  const s = sStorage!;
  // wallpaperId = GetBoxWallpaper(boxId) : couleurs identiques pour tous les wp → constantes ci-dessus.
  s.boxTitlePal[14] = sBoxTitleShadowColor;  // :5483 boxTitlePal[14] = sBoxTitleColors[wp][0] (shadow)
  s.boxTitlePal[15] = sBoxTitleTextColor;    // :5484 boxTitlePal[15] = sBoxTitleColors[wp][1] (text)
  LoadSpritePalette({ data: s.boxTitlePal.subarray(0, 16), tag: PALTAG_BOX_TITLE });
  s.wallpaperPalBits = 0x3f0;
  const tagIndex = IndexOfSpritePaletteTag(PALTAG_BOX_TITLE);
  s.boxTitlePalOffset = 256 + tagIndex * 16 + 14;
  s.boxTitleAltPalOffset = 256 + tagIndex * 16 + 14;
  s.boxTitleText = GetBoxNamePtr(boxId);  // StringCopyPadded(…, BOX_NAME_LENGTH)
  DrawTextWindowAndBufferTiles(s.boxTitleText, s.boxTitleTiles, 0, 0, 2);  // texte → tiles du titre
  LoadSpriteSheet({ data: s.boxTitleTiles.subarray(0, 0x200), size: 0x200, tag: GFXTAG_BOX_TITLE });
  const x = GetBoxTitleBaseX(s.boxTitleText);
  for (let i = 0; i < 2; i++) {
    const spriteId = CreateSprite({
      tileTag: GFXTAG_BOX_TITLE, paletteTag: PALTAG_BOX_TITLE, oam: sOamData_BoxTitle,
      anims: sAnims_BoxTitle, callback: null,
    }, x + i * 32, 28, _sub(24));
    s.curBoxTitleSprites[i] = spriteId;
    const spr = _spr(spriteId);
    if (spr) StartSpriteAnim(spr as never, i);
  }
  s.boxTitleCycleId = 0;
}
function GetBoxTitleBaseX(str: string): number {
  return 240 - 64 - Math.floor(GetStringWidth(str, FONT_NORMAL, 0) / 2);
}

// ─── :5637 CreateBoxScrollArrows + :5700 AnimateBoxScrollArrows + :5723 SpriteCB_Arrow ───
function CreateBoxScrollArrows(): void {
  const s = sStorage!; const a = sStorageAssets!;
  LoadSpriteSheet({ data: a.arrowGfx, size: a.arrowGfx.length, tag: GFXTAG_ARROW });  // sSpriteSheet_Arrow :1244
  for (let i = 0; i < 2; i++) {
    const spriteId = CreateSprite({
      tileTag: GFXTAG_ARROW, paletteTag: PALTAG_MISC_2, oam: sOamData_Arrow,
      anims: sAnims_Arrow, callback: SpriteCB_Arrow as never,
    }, 92 + i * 136, 28, _sub(22));
    if (spriteId !== 64) {
      const spr = _spr(spriteId)!;
      StartSpriteAnim(spr as never, i);
      spr.data[3] = (i === 0) ? -1 : 1;  // sSpeed
      s.arrowSprites[i] = spriteId;
    }
  }
  if (IsCursorOnBoxTitle()) AnimateBoxScrollArrows(true);
}
function AnimateBoxScrollArrows(animate: boolean): void {
  const s = sStorage!;
  for (let i = 0; i < 2; i++) {
    const spr = _spr(s.arrowSprites[i]); if (!spr) continue;
    if (animate) { spr.data[0] = 1; spr.data[1] = 0; spr.data[2] = 0; spr.data[4] = 0; }
    else spr.data[0] = 0;
  }
}
function SpriteCB_Arrow(sprite: { data: number[]; x: number; x2: number; invisible: boolean }): void {
  switch (sprite.data[0] /* sState */) {
    case 0: sprite.x2 = 0; break;
    case 1:
      if (++sprite.data[1] > 3) {
        sprite.data[1] = 0;
        sprite.x2 += sprite.data[3];
        if (++sprite.data[2] > 5) { sprite.data[2] = 0; sprite.x2 = 0; }
      }
      break;
    case 2: sprite.data[0] = 3; break;
    case 3:
      sprite.x -= sStorage!.scrollSpeed;
      if (sprite.x <= 72 || sprite.x >= 248) sprite.invisible = true;
      if (--sprite.data[1] === 0) { sprite.x = sprite.data[2]; sprite.invisible = false; sprite.data[0] = 4; }
      break;
    case 4: sprite.x -= sStorage!.scrollSpeed; break;
  }
}

// ─── :5788 InitCursor + :5807 InitCursorOnReopen + :5820 GetCursorCoordsByPos ───
function InitCursor(): void {
  const s = sStorage!;
  if (s.boxOption !== OPTION_DEPOSIT) sCursorArea = CURSOR_AREA_IN_BOX;
  else sCursorArea = CURSOR_AREA_IN_PARTY;
  sCursorPosition = 0;
  sIsMonBeingMoved = false;
  sMovingMonOrigBoxId = 0;
  sMovingMonOrigBoxPos = 0;
  sAutoActionOn = false;
  ClearSavedCursorPos();
  CreateCursorSprites();
  s.cursorPrevHorizPos = 1;
  s.inBoxMovingMode = MOVE_MODE_NORMAL;
  TryRefreshDisplayMon();
}
function InitCursorOnReopen(): void {
  const s = sStorage!;
  CreateCursorSprites();
  ReshowDisplayMon();
  s.cursorPrevHorizPos = 1;
  s.inBoxMovingMode = MOVE_MODE_NORMAL;
  if (sIsMonBeingMoved && sSavedMovingMon) {
    s.movingMon = sSavedMovingMon;
    // CreateMovingMonIcon : lot déplacement (tâche #3).
  }
}
function GetCursorCoordsByPos(cursorArea: number, cursorPosition: number): { x: number; y: number } {
  let x = 0, y = 0;
  switch (cursorArea) {
    case CURSOR_AREA_IN_BOX:
      x = (cursorPosition % IN_BOX_COLUMNS) * 24 + 100;
      y = Math.floor(cursorPosition / IN_BOX_COLUMNS) * 24 + 32;
      break;
    case CURSOR_AREA_IN_PARTY:
      if (cursorPosition === 0) { x = 104; y = 52; }
      else if (cursorPosition === PARTY_SIZE) { x = 152; y = 132; }
      else { x = 152; y = (cursorPosition - 1) * 24 + 4; }
      break;
    case CURSOR_AREA_BOX_TITLE:
      x = 162; y = 12;
      break;
    case CURSOR_AREA_BUTTONS:
      y = sIsMonBeingMoved ? 8 : 14;
      x = cursorPosition * 88 + 120;
      break;
    case 4:
      x = 160; y = 96;
      break;
  }
  return { x, y };
}

// ─── :7735 CreateCursorSprites (+ anims :7690-7730 env.) ───
const sAnims_Cursor: AnimCmd[][] = [
  [ANIMCMD_FRAME(0, 30), ANIMCMD_FRAME(16, 30), ANIMCMD_JUMP(0)],  // CURSOR_ANIM_BOUNCE
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],                              // CURSOR_ANIM_STILL
  [ANIMCMD_FRAME(32, 5), ANIMCMD_END],                             // CURSOR_ANIM_OPEN
  [ANIMCMD_FRAME(48, 5), ANIMCMD_END],                             // CURSOR_ANIM_FIST
];
function CreateCursorSprites(): void {
  const rt = getRuntime(); const s = sStorage!; const a = sStorageAssets!;
  // Sheets : sHandCursor_Gfx (0x800, GFXTAG_CURSOR) + sHandCursorShadow_Gfx (0x80, GFXTAG_CURSOR_SHADOW).
  LoadSpriteSheet({ data: a.handCursorGfx, size: 0x800, tag: GFXTAG_CURSOR });
  LoadSpriteSheet({ data: a.handCursorShadowGfx, size: 0x80, tag: GFXTAG_CURSOR_SHADOW });
  // Palettes : sHandCursor_Pal (PLTE jaune) → MISC_1 ; MISC_2 (waveform, blanche) déjà chargée état 0.
  LoadSpritePalette({ data: a.handCursorPal, tag: PALTAG_MISC_1 });
  s.cursorPalNums[0] = IndexOfSpritePaletteTag(PALTAG_MISC_2);  // White hand, normal
  s.cursorPalNums[1] = IndexOfSpritePaletteTag(PALTAG_MISC_1);  // Yellow hand, auto-action
  const { x, y } = GetCursorCoordsByPos(sCursorArea, sCursorPosition);
  const spriteId = CreateSprite({
    tileTag: GFXTAG_CURSOR, paletteTag: PALTAG_MISC_2, oam: { shape: 0, size: 2, priority: 1 },
    anims: sAnims_Cursor, callback: null,
  }, x, y, _sub(6));
  if (spriteId !== 64 && rt) {
    s.cursorSprite = spriteId;
    const spr = _spr(spriteId)!;
    rt.gba.oam[spr.oamIndex].paletteBank = s.cursorPalNums[sAutoActionOn ? 1 : 0];
    rt.gba.oam[spr.oamIndex].priority = 1;
    if (sIsMonBeingMoved) StartSpriteAnim(spr as never, CURSOR_ANIM_FIST);
  } else {
    s.cursorSprite = -1;
  }
  let subpriority: number, priority: number;
  if (sCursorArea === CURSOR_AREA_IN_PARTY) { subpriority = 13; priority = 1; }
  else { subpriority = 21; priority = 2; }
  const shadowId = CreateSprite({
    tileTag: GFXTAG_CURSOR_SHADOW, paletteTag: PALTAG_MISC_2, oam: { shape: 0, size: 1, priority: 1 },
    anims: null, callback: null,
  }, 0, 0, _sub(subpriority));
  if (shadowId !== 64 && rt) {
    s.cursorShadowSprite = shadowId;
    const spr = _spr(shadowId)!;
    rt.gba.oam[spr.oamIndex].priority = priority;
    if (sCursorArea) spr.invisible = true;
  } else {
    s.cursorShadowSprite = -1;
  }
}
// ─── :7863 ToggleCursorAutoAction ───
function ToggleCursorAutoAction(): void {
  const rt = getRuntime(); const s = sStorage!;
  sAutoActionOn = !sAutoActionOn;
  const spr = _spr(s.cursorSprite);
  if (rt && spr) rt.gba.oam[spr.oamIndex].paletteBank = s.cursorPalNums[sAutoActionOn ? 1 : 0];
}

// ─── :6118-6131 saved cursor pos ───
function ClearSavedCursorPos(): void { sSavedCursorPosition = 0; }
function SaveCursorPos(): void { sSavedCursorPosition = sCursorPosition; }
function GetSavedCursorPos(): number { return sSavedCursorPosition; }

// ─── :6802-6815 cursor area helpers ───
function IsCursorOnBoxTitle(): boolean { return sCursorArea === CURSOR_AREA_BOX_TITLE; }
function IsCursorOnCloseBox(): boolean { return sCursorArea === CURSOR_AREA_BUTTONS && sCursorPosition === 1; }
function IsCursorInBox(): boolean { return sCursorArea === CURSOR_AREA_IN_BOX; }

// ─── :6817 TryRefreshDisplayMon + :6846 ReshowDisplayMon + :6854 SetDisplayMonData ───
function TryRefreshDisplayMon(): void {
  const s = sStorage!;
  s.setMosaic = !sIsMonBeingMoved;
  if (!sIsMonBeingMoved) {
    switch (sCursorArea) {
      case CURSOR_AREA_IN_PARTY:
        if (sCursorPosition < PARTY_SIZE) { SetDisplayMonData(gPlayerParty[sCursorPosition] as Pokemon | null, MODE_PARTY); break; }
        // fallthrough
      case CURSOR_AREA_BUTTONS:
      case CURSOR_AREA_BOX_TITLE:
        SetDisplayMonData(null, MODE_MOVE);
        break;
      case CURSOR_AREA_IN_BOX:
        SetDisplayMonData(GetBoxedMonPtr(StorageGetCurrentBox(), sCursorPosition), MODE_BOX);
        break;
    }
  }
}
function ReshowDisplayMon(): void {
  if (sIsMonBeingMoved && sSavedMovingMon) SetDisplayMonData(sSavedMovingMon, MODE_PARTY);
  else TryRefreshDisplayMon();
}
function SetDisplayMonData(pokemon: Pokemon | null, mode: number): void {
  const s = sStorage!;
  s.displayMonItemId = 0;
  let gender: 'M' | 'F' | 'N' = 'N';
  if ((mode === MODE_PARTY || mode === MODE_BOX) && pokemon) {
    s.displayMonSpecies = pokemon.species ?? SPECIES_NONE;
    if (s.displayMonSpecies !== SPECIES_NONE) {
      s.displayMonIsEgg = !!pokemon.isEgg;
      s.displayMonName = pokemon.nickname || '';
      s.displayMonLevel = pokemon.level ?? 0;
      s.displayMonMarkings = (pokemon as unknown as { markings?: number }).markings ?? 0;
      s.displayMonPersonality = pokemon.personality ?? 0;
      const g = (pokemon as unknown as { gender?: number | string }).gender;
      gender = g === 0 || g === 'M' ? 'M' : g === 254 || g === 'F' ? 'F' : 'N';
      s.displayMonItemId = (pokemon as unknown as { heldItem?: number }).heldItem ?? 0;
      PreloadDisplayMonPic(s.displayMonSpecies);
    }
  } else {
    s.displayMonSpecies = SPECIES_NONE;
    s.displayMonItemId = 0;
  }
  if (s.displayMonSpecies === SPECIES_NONE) {
    s.displayMonName = '';
    s.displayMonNameText = '';
    s.displayMonSpeciesName = '';
    s.displayMonGenderLvlText = '';
    s.displayMonItemName = '';
  } else if (s.displayMonIsEgg) {
    s.displayMonNameText = 'OEUF';       // gText_EggNickname
    s.displayMonSpeciesName = '';
    s.displayMonGenderLvlText = '';
    s.displayMonItemName = '';
  } else {
    const speciesName = gSpeciesNames[s.displayMonSpecies] ?? '----------';  // noms FR (game-data)
    s.displayMonNameText = s.displayMonName || speciesName;
    s.displayMonSpeciesName = '/' + speciesName;
    // :6947-6975 codes couleur ♂ rouge / ♀ vert (EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW) : au lot texte.
    const genderChar = gender === 'M' ? '♂' : gender === 'F' ? '♀' : '';
    s.displayMonGenderLvlText = `${genderChar}N.${s.displayMonLevel}`;  // CHAR_EXTRA_SYMBOL Lv
    s.displayMonItemName = '';  // GetItemName(displayMonItemId) : lot items
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PC MAIN MENU (pokemon_storage_system.c:1524-1696) — PHASE 1 : le menu
// RETIRER / DÉPOSER / DÉPLACER / RANGER OBJETS / AU REVOIR obtenu en accédant au PC
// (script « PC POKéMON »). L'écran des boîtes (EnterPokeStorage) = phase 2 (stub).
// ═══════════════════════════════════════════════════════════════════════════

// OPTION_* / OPTIONS_COUNT : déclarés dans la section TRANSCRIPTION en tête (:53-61).
// 1:1 enum états (:1524)
const STATE_LOAD = 0, STATE_FADE_IN = 1, STATE_HANDLE_INPUT = 2, STATE_ERROR_MSG = 3;
// Menu_ProcessInput sentinelles (menu.ts) + touches GBA (io_reg) + text/window (text.ts)
const MENU_NOTHING_CHOSEN = -2, MENU_B_PRESSED = -1;
const DPAD_UP = 0x0040, DPAD_DOWN = 0x0080, A_BUTTON = 0x0001, B_BUTTON = 0x0002;
const DPAD_RIGHT = 0x0010, DPAD_LEFT = 0x0020, START_BUTTON = 0x0008, SELECT_BUTTON = 0x0004;
const FONT_NORMAL = 1, TEXT_COLOR_DARK_GRAY = 2, TEXT_COLOR_WHITE = 1, TEXT_COLOR_LIGHT_GRAY = 3;
const COPYWIN_FULL = 3, TEXT_SKIP_DRAW = 0xFF, PIXEL_FILL_1 = 0x11;

/** 1:1 `sMainMenuTexts` (:882) — {text=libellé menu, desc=description}. Libellés FR ≈ gText_*
 *  du décomp (à câbler sur les vraies strings gba au raffinement). */
const sMainMenuTexts: ReadonlyArray<{ text: string; desc: string }> = [
  // 1:1 strings.c:932-941 (décomp FR) — libellés (gText_*) + descriptions (gText_*Description).
  { text: 'RETIRER POKéMON', desc: "Intégrer dans l'équipe des POKéMON se\ntrouvant dans les BOITES." },   // OPTION_WITHDRAW
  { text: 'DEPOSER POKéMON', desc: "Déposer des POKéMON de l'équipe\ndans des BOITES." },                   // OPTION_DEPOSIT
  { text: 'DEPLACER POKéMON', desc: "Organiser les POKéMON dans les BOITES\net dans l'équipe." },           // OPTION_MOVE_MONS
  { text: 'DEPLACER OBJETS', desc: "Déplacer des objets tenus\ndans une BOITE ou par l'équipe." },          // OPTION_MOVE_ITEMS
  { text: 'SALUT!', desc: 'Retour au menu précédent.' },                                                    // OPTION_EXIT
];
// 1:1 `sWindowTemplate_MainMenu` (:891)
const sWindowTemplate_MainMenu = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 17, height: 10, paletteNum: 15, baseBlock: 0x1 };

// task data (:1532) : tState=data[0] tSelectedOption=data[1] tInput=data[2] tNextOption=data[3] tWindowId=data[15]

function _mainMenuActions(): MenuAction[] {
  return sMainMenuTexts.map((t) => ({ text: t.text, func: () => {} } as unknown as MenuAction));
}

function _printDesc(option: number, skipDraw: number): void {
  FillWindowPixelBuffer(0, PIXEL_FILL_1);
  AddTextPrinterParameterized2(0, FONT_NORMAL, sMainMenuTexts[option].desc, skipDraw, null as never, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
}

/** 1:1 `CreateMainMenu` (pokemon_storage_system.c:1678). */
function CreateMainMenu(whichMenu: number): number {
  const template = { ...sWindowTemplate_MainMenu };
  template.width = GetMaxWidthInMenuTable(_mainMenuActions(), OPTIONS_COUNT);
  const windowId = AddWindow(template as never);
  DrawStdWindowFrame(windowId, false);
  PrintMenuTable(windowId, OPTIONS_COUNT, _mainMenuActions());
  InitMenuInUpperLeftCornerNormal(windowId, OPTIONS_COUNT, whichMenu);
  return windowId;
}

/** 1:1 `Task_PCMainMenu` (pokemon_storage_system.c:1538). */
function Task_PCMainMenu(taskId: number): void {
  const rt = getRuntime(); if (!rt) return;
  const task = rt.gTasks[taskId];
  switch (task.data[0] /* tState */) {
    case STATE_LOAD:
      task.data[15] = CreateMainMenu(task.data[1]);  // tWindowId ← tSelectedOption
      LoadMessageBoxAndBorderGfx();
      DrawDialogueFrame(0, false);
      _printDesc(task.data[1], TEXT_SKIP_DRAW);
      CopyWindowToVram(0, COPYWIN_FULL);
      CopyWindowToVram(task.data[15], COPYWIN_FULL);
      task.data[0]++;
      break;
    case STATE_FADE_IN:
      // 1:1 IsWeatherNotFadingIn() — hors OW, pas de fondu météo → on avance (net-effect).
      task.data[0]++;
      break;
    case STATE_HANDLE_INPUT: {
      task.data[2] = Menu_ProcessInput();  // tInput
      const input = task.data[2];
      if (input === MENU_NOTHING_CHOSEN) {
        task.data[3] = task.data[1];  // tNextOption ← tSelectedOption
        if ((gMain.newKeys & DPAD_UP) && --task.data[3] < 0) task.data[3] = OPTIONS_COUNT - 1;
        if ((gMain.newKeys & DPAD_DOWN) && ++task.data[3] > OPTIONS_COUNT - 1) task.data[3] = 0;
        if (task.data[1] !== task.data[3]) {
          task.data[1] = task.data[3];
          _printDesc(task.data[1], 0);
        }
      } else if (input === MENU_B_PRESSED || input === OPTION_EXIT) {
        ClearStdWindowAndFrame(task.data[15], true);
        UnlockPlayerFieldControls();
        RemoveWindow(task.data[15]);
        rt.DestroyTask(taskId);
        // AU REVOIR/B → relâche l'opcode `waitstate` (ShowPokemonStorageSystemPC = waitstate=1)
        // → le script reprend à `goto EventScript_PCMainMenu` (re-menu « Quel PC? »).
        (globalThis as { __SignalWaitState?: () => void }).__SignalWaitState?.();
      } else if (input === OPTION_WITHDRAW && CalculatePlayerPartyCount() === PARTY_SIZE) {
        FillWindowPixelBuffer(0, PIXEL_FILL_1);
        AddTextPrinterParameterized2(0, FONT_NORMAL, 'Ton équipe est pleine !', 0, null as never, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
        task.data[0] = STATE_ERROR_MSG;
      } else if (input === OPTION_DEPOSIT && CalculatePlayerPartyCount() === 1) {
        FillWindowPixelBuffer(0, PIXEL_FILL_1);
        AddTextPrinterParameterized2(0, FONT_NORMAL, "Il n'y a qu'un POKéMON !", 0, null as never, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
        task.data[0] = STATE_ERROR_MSG;
      } else {
        // Enter PC — phase 2 (écran boîtes) = stub : on referme proprement pour l'instant.
        EnterPokeStorage(input);
        ClearStdWindowAndFrame(task.data[15], true);
        UnlockPlayerFieldControls();
        RemoveWindow(task.data[15]);
        rt.DestroyTask(taskId);
      }
      break;
    }
    case STATE_ERROR_MSG:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON)) {
        _printDesc(task.data[1], 0);
        task.data[0] = STATE_HANDLE_INPUT;
      } else if (gMain.newKeys & DPAD_UP) {
        if (--task.data[1] < 0) task.data[1] = OPTIONS_COUNT - 1;
        Menu_MoveCursor(-1);
        task.data[1] = Menu_GetCursorPos();
        _printDesc(task.data[1], 0);
        task.data[0] = STATE_HANDLE_INPUT;
      } else if (gMain.newKeys & DPAD_DOWN) {
        if (++task.data[1] >= OPTIONS_COUNT - 1) task.data[1] = 0;
        Menu_MoveCursor(1);
        task.data[1] = Menu_GetCursorPos();
        _printDesc(task.data[1], 0);
        task.data[0] = STATE_HANDLE_INPUT;
      }
      break;
  }
}

/** 1:1 `ShowPokemonStorageSystemPC` (pokemon_storage_system.c:1650) — point d'entrée du PC.
 *  def_special waitstate=1 : le script (pc.inc) a un opcode `waitstate` inséré après ce special ;
 *  il bloque tant que le PC est ouvert. À AU REVOIR/B (Task_PCMainMenu), SignalWaitState relâche
 *  → le script reprend à `goto EventScript_PCMainMenu` (re-menu « Quel PC? »). */
export function ShowPokemonStorageSystemPC(): void {
  const rt = getRuntime(); if (!rt) return;
  const taskId = rt.CreateTask((t) => Task_PCMainMenu(t.taskId), 80);
  rt.gTasks[taskId].data[0] = 0;  // tState
  rt.gTasks[taskId].data[1] = 0;  // tSelectedOption
  LockPlayerFieldControls();
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION — SECTION Cursor movement (:5873-6114) + MultiMove_Init (:8109)
// ═══════════════════════════════════════════════════════════════════════════
const IN_BOX_COLUMNS = 6;

// ─── :5873 UpdateCursorPos ───
function UpdateCursorPos(): boolean {
  const s = sStorage!;
  const spr = _spr(s.cursorSprite);
  if (!spr) return false;
  if (s.cursorMoveSteps === 0) {
    if (s.boxOption !== OPTION_MOVE_ITEMS) return false;
    return IsItemIconAnimActive();
  } else if (--s.cursorMoveSteps !== 0) {
    s.cursorNewX += s.cursorSpeedX;
    s.cursorNewY += s.cursorSpeedY;
    spr.x = (s.cursorNewX >> 8) << 16 >> 16;  // s16
    spr.y = (s.cursorNewY >> 8) << 16 >> 16;
    // Wrap écran (240+16 / 160+16) :5892-5918
    if (spr.x > 240 + 16) { const tmp = spr.x - (240 + 16); spr.x = tmp + 64; }
    if (spr.x < 64) { const tmp = 64 - spr.x; spr.x = 240 + 16 - tmp; }
    if (spr.y > 160 + 16) { const tmp = spr.y - (160 + 16); spr.y = tmp - 16; }
    if (spr.y < -16) { const tmp = -16 - spr.y; spr.y = 160 + 16 - tmp; }
    if (s.cursorFlipTimer && --s.cursorFlipTimer === 0) spr.vFlip = !spr.vFlip;
  } else {
    spr.x = s.cursorTargetX;
    spr.y = s.cursorTargetY;
    DoCursorNewPosUpdate();
  }
  return true;
}

// ─── :5935 InitNewCursorPos ───
function InitNewCursorPos(newCursorArea: number, newCursorPosition: number): void {
  const s = sStorage!;
  const { x, y } = GetCursorCoordsByPos(newCursorArea, newCursorPosition);
  s.newCursorArea = newCursorArea;
  s.newCursorPosition = newCursorPosition;
  s.cursorTargetX = x;
  s.cursorTargetY = y;
}

// ─── :5946 InitCursorMove ───
function InitCursorMove(): void {
  const s = sStorage!;
  const spr = _spr(s.cursorSprite); if (!spr) return;
  s.cursorMoveSteps = (s.cursorVerticalWrap !== 0 || s.cursorHorizontalWrap !== 0) ? 12 : 6;
  if (s.cursorFlipTimer) s.cursorFlipTimer = s.cursorMoveSteps >> 1;
  let yDistance: number, xDistance: number;
  switch (s.cursorVerticalWrap) {
    case -1: yDistance = s.cursorTargetY - 192 - spr.y; break;
    case 1: yDistance = s.cursorTargetY + 192 - spr.y; break;
    default: yDistance = s.cursorTargetY - spr.y; break;
  }
  switch (s.cursorHorizontalWrap) {
    case -1: xDistance = s.cursorTargetX - 192 - spr.x; break;
    case 1: xDistance = s.cursorTargetX + 192 - spr.x; break;
    default: xDistance = s.cursorTargetX - spr.x; break;
  }
  yDistance <<= 8;
  xDistance <<= 8;
  s.cursorSpeedX = Math.trunc(xDistance / s.cursorMoveSteps);
  s.cursorSpeedY = Math.trunc(yDistance / s.cursorMoveSteps);
  s.cursorNewX = spr.x << 8;
  s.cursorNewY = spr.y << 8;
}

// ─── :5992 SetCursorPosition ───
function SetCursorPosition(newCursorArea: number, newCursorPosition: number): void {
  const rt = getRuntime(); const s = sStorage!;
  InitNewCursorPos(newCursorArea, newCursorPosition);
  InitCursorMove();
  const cursor = _spr(s.cursorSprite);
  if (s.boxOption !== OPTION_MOVE_ITEMS) {
    if (s.inBoxMovingMode === MOVE_MODE_NORMAL && !sIsMonBeingMoved && cursor)
      StartSpriteAnim(cursor as never, CURSOR_ANIM_STILL);
  } else {
    if (!IsMovingItem() && cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_STILL);
  }
  // :6007-6018 MOVE_ITEMS TryHide/TryLoadItemIconAtPos : lot items.
  const shadow = _spr(s.cursorShadowSprite);
  if (newCursorArea === CURSOR_AREA_IN_PARTY && sCursorArea !== CURSOR_AREA_IN_PARTY) {
    s.cursorPrevHorizPos = 1;
    if (shadow) shadow.invisible = true;
  }
  if (!rt) return;
  switch (newCursorArea) {
    case CURSOR_AREA_IN_PARTY:
    case CURSOR_AREA_BOX_TITLE:
    case CURSOR_AREA_BUTTONS:
      if (cursor) rt.gba.oam[cursor.oamIndex].priority = 1;
      if (shadow) { shadow.invisible = true; rt.gba.oam[shadow.oamIndex].priority = 1; }
      break;
    case CURSOR_AREA_IN_BOX:
      if (s.inBoxMovingMode !== MOVE_MODE_NORMAL) {
        if (cursor) rt.gba.oam[cursor.oamIndex].priority = 0;
        if (shadow) shadow.invisible = true;
      } else {
        if (cursor) rt.gba.oam[cursor.oamIndex].priority = 2;
        if (sCursorArea === CURSOR_AREA_IN_BOX && sIsMonBeingMoved) SetMovingMonPriority(2);
      }
      break;
  }
}

// ─── :6051 DoCursorNewPosUpdate ───
function DoCursorNewPosUpdate(): void {
  const rt = getRuntime(); const s = sStorage!;
  sCursorArea = s.newCursorArea;
  sCursorPosition = s.newCursorPosition;
  const cursor = _spr(s.cursorSprite);
  if (s.boxOption !== OPTION_MOVE_ITEMS) {
    if (s.inBoxMovingMode === MOVE_MODE_NORMAL && !sIsMonBeingMoved && cursor)
      StartSpriteAnim(cursor as never, CURSOR_ANIM_BOUNCE);
  } else {
    if (!IsMovingItem() && cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_BOUNCE);
  }
  TryRefreshDisplayMon();
  const shadow = _spr(s.cursorShadowSprite);
  switch (sCursorArea) {
    case CURSOR_AREA_BUTTONS:
      SetMovingMonPriority(1);
      break;
    case CURSOR_AREA_BOX_TITLE:
      AnimateBoxScrollArrows(true);
      break;
    case CURSOR_AREA_IN_PARTY:
      if (shadow) shadow.subpriority = _sub(13);
      SetMovingMonPriority(1);
      break;
    case CURSOR_AREA_IN_BOX:
      if (s.inBoxMovingMode === MOVE_MODE_NORMAL && rt) {
        if (cursor) rt.gba.oam[cursor.oamIndex].priority = 1;
        if (shadow) {
          rt.gba.oam[shadow.oamIndex].priority = 2;
          shadow.subpriority = _sub(21);
          shadow.invisible = false;
        }
        SetMovingMonPriority(2);
      }
      break;
  }
}

// ─── :6092 SetCursorInParty + :6111 SetCursorBoxPosition ───
function SetCursorInParty(): void {
  const s = sStorage!;
  let partyCount: number;
  if (!sIsMonBeingMoved) {
    partyCount = 0;
  } else {
    partyCount = CalculatePlayerPartyCount();
    if (partyCount >= PARTY_SIZE) partyCount = PARTY_SIZE - 1;
  }
  const cursor = _spr(s.cursorSprite);
  if (cursor?.vFlip) s.cursorFlipTimer = 1;
  SetCursorPosition(CURSOR_AREA_IN_PARTY, partyCount);
}
function SetCursorBoxPosition(cursorBoxPosition: number): void {
  SetCursorPosition(CURSOR_AREA_IN_BOX, cursorBoxPosition);
}

// ─── :8078 sWindowTemplate_MultiMove + :8109 MultiMove_Init ───
const sWindowTemplate_MultiMove: WindowTemplate = {
  bg: 0, tilemapLeft: 10, tilemapTop: 3, width: 20, height: 18, paletteNum: 9, baseBlock: 0xA,
} as WindowTemplate;
let sMultiMove: { funcId: number; state: number } | null = null;
function MultiMove_Init(): boolean {
  sMultiMove = { funcId: 0, state: 0 };
  // AddWindow8Bit : fenêtre 8bpp (rendu de la sélection multiple) — notre AddWindow (4bpp) en tient
  // lieu jusqu'au lot multi-move (tâche #3) ; seul l'id compte pour l'init.
  sStorage!.multiMoveWindowId = AddWindow(sWindowTemplate_MultiMove as never);
  return sStorage!.multiMoveWindowId !== 0xFF;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION — Déplacer un Pokémon (grab/place/shift intra-boîte, sans party menu)
// Pokémon data (:6304-6398) + sprites moving mon (:4866-5088) + MonPlaceChange (:6133-6292)
// + Task_MoveMon/PlaceMon/ShiftMon (:2737-2793). Déplacement de RÉFÉRENCE (notre boxes[][] = objets).
// ═══════════════════════════════════════════════════════════════════════════
const MODE_PARTY_MOVE = MODE_PARTY;  // alias lisibilité (MoveMon utilise TOTAL_BOXES_COUNT comme sentinelle party)

// :4422 GetMonIconPriorityByCursorPos ───
function GetMonIconPriorityByCursorPos(): number { return IsCursorInBox() ? 2 : 1; }

// :4925 SetMovingMonSprite — transforme l'icône du slot en « icône tenue » (suit le curseur). ───
function SetMovingMonSprite(mode: number, id: number): void {
  const rt = getRuntime(); const s = sStorage!;
  if (mode === MODE_PARTY) { s.movingMonSprite = s.partySprites[id]; s.partySprites[id] = -1; }
  else if (mode === MODE_BOX) { s.movingMonSprite = s.boxMonsSprites[id]; s.boxMonsSprites[id] = -1; }
  else return;
  const spr = _spr(s.movingMonSprite);
  if (spr && rt) {
    spr.callback = SpriteCB_HeldMon;
    rt.gba.oam[spr.oamIndex].priority = GetMonIconPriorityByCursorPos();
    spr.subpriority = _sub(7);
  }
}

// :4947 SetPlacedMonSprite — repose l'icône tenue dans un slot. ───
function SetPlacedMonSprite(boxId: number, position: number): void {
  const rt = getRuntime(); const s = sStorage!;
  if (boxId === TOTAL_BOXES_COUNT) {
    s.partySprites[position] = s.movingMonSprite;
    const spr = _spr(s.movingMonSprite);
    if (spr && rt) { rt.gba.oam[spr.oamIndex].priority = 1; spr.subpriority = _sub(12); }
  } else {
    s.boxMonsSprites[position] = s.movingMonSprite;
    const spr = _spr(s.movingMonSprite);
    if (spr && rt) { rt.gba.oam[spr.oamIndex].priority = 2; spr.subpriority = _sub(19 - (position % IN_BOX_COLUMNS)); }
  }
  const spr = _spr(s.movingMonSprite);
  if (spr) spr.callback = null;  // SpriteCallbackDummy
  s.movingMonSprite = -1;
}

// :5084 SpriteCB_HeldMon — l'icône tenue colle au curseur. ───
function SpriteCB_HeldMon(sprite: { x: number; y: number }): void {
  const cursor = _spr(sStorage!.cursorSprite);
  if (cursor) { sprite.x = cursor.x; sprite.y = cursor.y + cursor.y2 + 4; }
}

// :4866 DestroyMovingMonIcon ───
function DestroyMovingMonIcon(): void {
  const s = sStorage!;
  if (s.movingMonSprite >= 0) { DestroySprite(s.movingMonSprite); s.movingMonSprite = -1; }
}
// :4427 CreateMovingMonIcon (reprise avec mon en main). ───
function CreateMovingMonIcon(): void {
  const s = sStorage!;
  const mon = s.movingMon; if (!mon) return;
  const priority = GetMonIconPriorityByCursorPos();
  s.movingMonSprite = CreateMonIconSprite(mon.species ?? 0, mon.personality ?? 0, 0, 0, priority, _sub(7));
  const spr = _spr(s.movingMonSprite);
  if (spr) spr.callback = SpriteCB_HeldMon;
}

// :6353 SetMovingMonData / :6365 SetPlacedMonData / :6378 PurgeMonOrBoxMon — déplacement de RÉFÉRENCE.
function SetMovingMonData(boxId: number, position: number): void {
  const s = sStorage!;
  if (boxId === TOTAL_BOXES_COUNT) s.movingMon = gPlayerParty[sCursorPosition] as Pokemon;
  else s.movingMon = _boxMonAt(boxId, position);
  PurgeMonOrBoxMon(boxId, position);
  sMovingMonOrigBoxId = boxId;
  sMovingMonOrigBoxPos = position;
}
function SetPlacedMonData(boxId: number, position: number): void {
  const s = sStorage!;
  if (boxId === TOTAL_BOXES_COUNT) { if (s.movingMon) gPlayerParty[position] = s.movingMon as never; }
  else { const st = GetPokemonStorage(); if (st.boxes[boxId]) st.boxes[boxId][position] = s.movingMon as never; }
}
function PurgeMonOrBoxMon(boxId: number, position: number): void {
  if (boxId === TOTAL_BOXES_COUNT) ZeroMonData(gPlayerParty[position]);
  else { const st = GetPokemonStorage(); if (st.boxes[boxId]) st.boxes[boxId][position] = null as never; }  // ZeroBoxMonAt
}

// :6304 MoveMon / :6326 PlaceMon ───
function MoveMon(): void {
  const s = sStorage!;
  switch (sCursorArea) {
    case CURSOR_AREA_IN_PARTY:
      SetMovingMonData(TOTAL_BOXES_COUNT, sCursorPosition);
      SetMovingMonSprite(MODE_PARTY_MOVE, sCursorPosition);
      break;
    case CURSOR_AREA_IN_BOX:
      if (s.inBoxMovingMode === MOVE_MODE_NORMAL) {
        SetMovingMonData(StorageGetCurrentBox(), sCursorPosition);
        SetMovingMonSprite(MODE_BOX, sCursorPosition);
      }
      break;
    default: return;
  }
  sIsMonBeingMoved = true;
}
function PlaceMon(): void {
  switch (sCursorArea) {
    case CURSOR_AREA_IN_PARTY:
      SetPlacedMonData(TOTAL_BOXES_COUNT, sCursorPosition);
      SetPlacedMonSprite(TOTAL_BOXES_COUNT, sCursorPosition);
      break;
    case CURSOR_AREA_IN_BOX: {
      const boxId = StorageGetCurrentBox();
      SetPlacedMonData(boxId, sCursorPosition);
      SetPlacedMonSprite(boxId, sCursorPosition);
      break;
    }
    default: return;
  }
  sIsMonBeingMoved = false;
}

// :6133 InitMonPlaceChange + :6158 DoMonPlaceChange + MonPlaceChange_* (:6163-6292) ───
function InitMonPlaceChange(type: number): void {
  const s = sStorage!;
  s.monPlaceChangeFunc = type === CHANGE_GRAB ? MonPlaceChange_Grab
    : type === CHANGE_PLACE ? MonPlaceChange_Place : MonPlaceChange_Shift;
  s.monPlaceChangeState = 0;
}
function DoMonPlaceChange(): boolean {
  return sStorage!.monPlaceChangeFunc ? sStorage!.monPlaceChangeFunc() : false;
}
function MonPlaceChange_CursorDown(): boolean {
  const spr = _spr(sStorage!.cursorSprite); if (!spr) return false;
  if (spr.y2 === 8) return false;   // atteint le bas
  spr.y2++;
  return true;
}
function MonPlaceChange_CursorUp(): boolean {
  const spr = _spr(sStorage!.cursorSprite); if (!spr) return false;
  if (spr.y2 === 0) return false;   // atteint le haut
  spr.y2--;
  return true;
}
function MonPlaceChange_Grab(): boolean {
  const s = sStorage!; const cursor = _spr(s.cursorSprite);
  switch (s.monPlaceChangeState) {
    case 0:
      if (sIsMonBeingMoved) return false;
      if (cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_OPEN);
      s.monPlaceChangeState++;
      break;
    case 1:
      if (!MonPlaceChange_CursorDown()) {
        if (cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_FIST);
        MoveMon();
        s.monPlaceChangeState++;
      }
      break;
    case 2:
      if (!MonPlaceChange_CursorUp()) s.monPlaceChangeState++;
      break;
    case 3:
      return false;
  }
  return true;
}
function MonPlaceChange_Place(): boolean {
  const s = sStorage!; const cursor = _spr(s.cursorSprite);
  switch (s.monPlaceChangeState) {
    case 0:
      if (!MonPlaceChange_CursorDown()) {
        if (cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_OPEN);
        PlaceMon();
        s.monPlaceChangeState++;
      }
      break;
    case 1:
      if (!MonPlaceChange_CursorUp()) {
        if (cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_BOUNCE);
        s.monPlaceChangeState++;
      }
      break;
    case 2:
      return false;
  }
  return true;
}
function MonPlaceChange_Shift(): boolean {
  // SHIFT (échange mon en main ↔ mon du slot) : nécessite SaveMonSpriteAtPos/MoveShiftingMons/
  // SetShiftedMonData (:4965-5079) → lot suivant. Log nominatif + termine (pas de crash).
  console.warn('[pc-storage] MonPlaceChange_Shift (CHANGER) : SaveMonSpriteAtPos/MoveShiftingMons = lot suivant.');
  return false;
}

// :2737 Task_MoveMon / :2757 Task_PlaceMon / :2777 Task_ShiftMon ───
function Task_MoveMon(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0: InitMonPlaceChange(CHANGE_GRAB); s.state++; break;
    case 1:
      if (!DoMonPlaceChange()) SetPokeStorageTask(sInPartyMenu ? Task_HandleMovingMonFromParty : Task_PokeStorageMain);
      break;
  }
}
function Task_PlaceMon(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0: InitMonPlaceChange(CHANGE_PLACE); s.state++; break;
    case 1:
      if (!DoMonPlaceChange()) SetPokeStorageTask(sInPartyMenu ? Task_HandleMovingMonFromParty : Task_PokeStorageMain);
      break;
  }
}
function Task_ShiftMon(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0: InitMonPlaceChange(CHANGE_SHIFT); s.state++; break;
    case 1:
      if (!DoMonPlaceChange()) { StartDisplayMonMosaicEffect(); SetPokeStorageTask(Task_PokeStorageMain); }
      break;
  }
}
// :6783 CanShiftMon — SHIFT possible ? (mon en main + slot occupé). Simplifié : lot shift.
function CanShiftMon(): boolean { return false; }

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION — SECTION Options menus (:7924-8085) + Task_OnSelectedMon (:2580)
// ═══════════════════════════════════════════════════════════════════════════

// :5860 GetSpeciesAtCursorPosition — l'espèce sous le curseur (party ou boîte).
function GetSpeciesAtCursorPosition(): number {
  switch (sCursorArea) {
    case CURSOR_AREA_IN_PARTY: return (gPlayerParty[sCursorPosition] as Pokemon | undefined)?.species ?? SPECIES_NONE;
    case CURSOR_AREA_IN_BOX: return _boxMonAt(StorageGetCurrentBox(), sCursorPosition)?.species ?? SPECIES_NONE;
    default: return SPECIES_NONE;
  }
}

// sMenuTexts (:7933) — libellés FR (strings.c gPCText_* :893-901), indexés par MENU_*.
const sMenuTexts: string[] = [];
sMenuTexts[MENU_CANCEL] = 'ANNULER';   sMenuTexts[MENU_STORE] = 'DEPOSER';
sMenuTexts[MENU_WITHDRAW] = 'RETIRER'; sMenuTexts[MENU_MOVE] = 'DEPLACER';
sMenuTexts[MENU_SHIFT] = 'CHANGER';    sMenuTexts[MENU_PLACE] = 'PLACER';
sMenuTexts[MENU_SUMMARY] = 'RESUME';   sMenuTexts[MENU_RELEASE] = 'RELACHER';
sMenuTexts[MENU_MARK] = 'MARQUER';
// (JUMP/WALLPAPER/NAME/TAKE/GIVE/… = lots wallpaper/items suivants)

// ─── :7924 InitMenu ───
function InitMenu(): void {
  const s = sStorage!;
  s.menuItemsCount = 0;
  s.menuWidth = 0;
  s.menuWindow.bg = 0;
  s.menuWindow.paletteNum = 15;
  s.menuWindow.baseBlock = 92;
}

// ─── :7976 SetMenuText — nos libellés = string JS → StringLength = .length. ───
function SetMenuText(textId: number): void {
  const s = sStorage!;
  if (s.menuItemsCount < s.menuItems.length) {
    const menu = s.menuItems[s.menuItemsCount];
    menu.text = sMenuTexts[textId] ?? '';
    menu.textId = textId;
    const len = menu.text.length;
    if (len > s.menuWidth) s.menuWidth = len;
    s.menuItemsCount++;
  }
}

// ─── :7993 GetMenuItemTextId ───
function GetMenuItemTextId(menuIdx: number): number {
  const s = sStorage!;
  return menuIdx >= s.menuItemsCount ? -1 : s.menuItems[menuIdx].textId;
}

// ─── :8001 AddMenu ───
function AddMenu(): void {
  const s = sStorage!;
  s.menuWindow.width = s.menuWidth + 2;
  s.menuWindow.height = 2 * s.menuItemsCount;
  s.menuWindow.tilemapLeft = 29 - s.menuWindow.width;
  s.menuWindow.tilemapTop = 15 - s.menuWindow.height;
  s.menuWindowId = AddWindow(s.menuWindow as never);
  ClearWindowTilemap(s.menuWindowId);
  DrawStdFrameWithCustomTileAndPalette(s.menuWindowId, false, 11, 14);
  PrintMenuTable(s.menuWindowId, s.menuItemsCount,
    s.menuItems.slice(0, s.menuItemsCount).map((m) => ({ text: m.text, func: () => {} })) as unknown as MenuAction[]);
  InitMenuInUpperLeftCornerNormal(s.menuWindowId, s.menuItemsCount, 0);
  ScheduleBgCopyTilemapToVram(0);
  s.menuUnusedField = 0;
}

// ─── :8019 IsMenuLoading (décomp : toujours FALSE) ───
function IsMenuLoading(): boolean { return false; }

// ─── :8024 HandleMenuInput — retourne le textId choisi, MENU_B_PRESSED, ou MENU_NOTHING_CHOSEN. ───
function HandleMenuInput(): number {
  let input: number = MENU_NOTHING_CHOSEN;
  do {
    if (gMain.newKeys & A_BUTTON) { input = Menu_GetCursorPos(); break; }
    else if (gMain.newKeys & B_BUTTON) { PlaySE(0x5 /* SE_SELECT */); input = MENU_B_PRESSED; }
    if (gMain.newKeys & DPAD_UP) { PlaySE(0x5); Menu_MoveCursor(-1); }
    else if (gMain.newKeys & DPAD_DOWN) { PlaySE(0x5); Menu_MoveCursor(1); }
  } while (0);
  if (input !== MENU_NOTHING_CHOSEN) RemoveMenu();
  if (input >= 0) input = sStorage!.menuItems[input].textId;
  return input;
}

// ─── :8060 RemoveMenu ───
function RemoveMenu(): void {
  const s = sStorage!;
  ClearStdWindowAndFrameToTransparent(s.menuWindowId, true);
  RemoveWindow(s.menuWindowId);
}

// ─── :7621 SetMenuTexts_Mon — construit la liste d'options selon boxOption/contexte. ───
function SetMenuTexts_Mon(): boolean {
  const s = sStorage!;
  const species = GetSpeciesAtCursorPosition();
  switch (s.boxOption) {
    case OPTION_DEPOSIT:
      if (species !== SPECIES_NONE) SetMenuText(MENU_STORE); else return false;
      break;
    case OPTION_WITHDRAW:
      if (species !== SPECIES_NONE) SetMenuText(MENU_WITHDRAW); else return false;
      break;
    case OPTION_MOVE_MONS:
      if (sIsMonBeingMoved) {
        if (species !== SPECIES_NONE) SetMenuText(MENU_SHIFT); else SetMenuText(MENU_PLACE);
      } else {
        if (species !== SPECIES_NONE) SetMenuText(MENU_MOVE); else return false;
      }
      break;
    case OPTION_MOVE_ITEMS:
    default:
      return false;
  }
  SetMenuText(MENU_SUMMARY);
  if (s.boxOption === OPTION_MOVE_MONS) {
    if (sCursorArea === CURSOR_AREA_IN_BOX) SetMenuText(MENU_WITHDRAW);
    else SetMenuText(MENU_STORE);
  }
  SetMenuText(MENU_MARK);
  SetMenuText(MENU_RELEASE);
  SetMenuText(MENU_CANCEL);
  return true;
}

// ─── :8082 SetSelectionMenuTexts (MOVE_ITEMS → SetMenuTexts_Item, lot Move Items). ───
function SetSelectionMenuTexts(): boolean {
  InitMenu();
  if (sStorage!.boxOption !== OPTION_MOVE_ITEMS) return SetMenuTexts_Mon();
  return false;  // SetMenuTexts_Item : lot items
}

// ─── ClearBottomWindow (:env 4250) ───
function ClearBottomWindow(): void {
  ClearStdWindowAndFrameToTransparent(WIN_MESSAGE, false);
  ScheduleBgCopyTilemapToVram(0);
}

// ─── PrintMessage (:4273) — message du bas. sMessages FR (strings.c gText_* :867-879) des ids du
// flux menu ; placeholder {DYNAMIC 0} → nom du mon affiché/relâché (DynamicPlaceholderTextUtil). ───
const sStorageMessagesFr: Record<number, { text: string; varKind: number }> = {
  [MSG_IS_SELECTED]: { text: '{0} sélectionné.', varKind: MSG_VAR_MON_NAME_1 },
  [MSG_WAS_DEPOSITED]: { text: '{0} a été déposé.', varKind: MSG_VAR_MON_NAME_1 },
  [MSG_BOX_IS_FULL]: { text: 'BOITE pleine.', varKind: MSG_VAR_NONE },
  [MSG_RELEASE_POKE]: { text: 'Relâcher ce POKéMON?', varKind: MSG_VAR_NONE },
  [MSG_WAS_RELEASED]: { text: '{0} a été relâché.', varKind: MSG_VAR_RELEASE_MON_1 },
  [MSG_BYE_BYE]: { text: 'Bye-bye, {0}!', varKind: MSG_VAR_RELEASE_MON_3 },
  [MSG_PARTY_FULL]: { text: "L'équipe est pleine!", varKind: MSG_VAR_NONE },
  [MSG_WHICH_ONE_WILL_TAKE]: { text: 'Lequel prenez-vous?', varKind: MSG_VAR_NONE },
  [MSG_EXIT_BOX]: { text: 'Quitter la BOITE?', varKind: MSG_VAR_NONE },
  [MSG_CONTINUE_BOX]: { text: 'Continuer les\nopérations BOITE?', varKind: MSG_VAR_NONE },
  [MSG_HOLDING_POKE]: { text: 'Vous tenez\nun POKéMON!', varKind: MSG_VAR_NONE },
};
function PrintMessage(id: number): void {
  const s = sStorage!;
  const entry = sStorageMessagesFr[id];
  let text = entry ? entry.text : '';
  if (entry) {
    if (entry.varKind === MSG_VAR_MON_NAME_1) text = text.replace('{0}', s.displayMonName);
    else if (entry.varKind === MSG_VAR_RELEASE_MON_1 || entry.varKind === MSG_VAR_RELEASE_MON_3) text = text.replace('{0}', s.releaseMonName);
  }
  FillWindowPixelBuffer(WIN_MESSAGE, PIXEL_FILL_1);
  DrawDialogueFrame(WIN_MESSAGE, false);
  AddTextPrinterParameterized(WIN_MESSAGE, FONT_NORMAL, text, 0, 1, TEXT_SKIP_DRAW, null);
  PutWindowTilemap(WIN_MESSAGE);
  CopyWindowToVram(WIN_MESSAGE, 3 /* COPYWIN_FULL */);
  ScheduleBgCopyTilemapToVram(0);
}

// ─── :2580 Task_OnSelectedMon — affiche le menu contextuel puis dispatche l'option choisie.
// Les tasks d'ACTION (retrait/dépôt/déplacer/résumé/marquer/relâcher) = lot #3-suite : elles
// dépendent du party menu (CreatePartyMonsSprites/DoShowPartyMenu) et de MonPlaceChange, gros
// morceaux non encore portés → loguées nominativement + retour propre (pas de crash de la CB2). ───
function _pcActionTodo(name: string): void {
  console.warn(`[pc-storage] action « ${name} » : lot suivant (party menu / MonPlaceChange / summary). Retour au main.`);
  ClearBottomWindow();
  SetPokeStorageTask(Task_PokeStorageMain);
}
function Task_OnSelectedMon(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      if (!IsDisplayMosaicActive()) {
        PlaySE(0x5 /* SE_SELECT */);
        if (s.boxOption !== OPTION_MOVE_ITEMS) PrintMessage(MSG_IS_SELECTED);
        AddMenu();
        s.state = 1;
      }
      break;
    case 1:
      if (!IsMenuLoading()) s.state = 2;
      break;
    case 2:
      switch (HandleMenuInput()) {
        case MENU_B_PRESSED:
        case MENU_CANCEL:
          ClearBottomWindow();
          SetPokeStorageTask(Task_PokeStorageMain);
          break;
        case MENU_MOVE:  // :2611 (IsRemovingLastPartyMon check = lot party ; in-box = jamais atteint)
          PlaySE(0x5 /* SE_SELECT */); ClearBottomWindow(); SetPokeStorageTask(Task_MoveMon);
          break;
        case MENU_PLACE:  // :2623
          PlaySE(0x5); ClearBottomWindow(); SetPokeStorageTask(Task_PlaceMon);
          break;
        case MENU_SHIFT:  // :2628
          if (!CanShiftMon()) _pcActionTodo('CHANGER (Task_ShiftMon)');
          else { PlaySE(0x5); ClearBottomWindow(); SetPokeStorageTask(Task_ShiftMon); }
          break;
        case MENU_WITHDRAW:  // :2640
          PlaySE(0x5 /* SE_SELECT */); ClearBottomWindow(); SetPokeStorageTask(Task_WithdrawMon);
          break;
        case MENU_STORE:  // :2645 (IsRemovingLastPartyMon/ItemIsMail checks = lot suivant)
          PlaySE(0x5 /* SE_SELECT */); ClearBottomWindow(); SetPokeStorageTask(Task_DepositMenu);
          break;
        case MENU_SUMMARY: _pcActionTodo('RESUME (Task_ShowMonSummary)'); break;
        case MENU_MARK: _pcActionTodo('MARQUER (Task_ShowMarkMenu)'); break;
        case MENU_RELEASE: _pcActionTodo('RELACHER (Task_ReleaseMon)'); break;
      }
      break;
  }
}

// ─── :7014 InBoxInput_Normal + :7433 HandleInput_OnBox + :7504 HandleInput_OnButtons + :7577 HandleInput ───
// JOY_* : décomp JOY_REPEAT = newAndRepeatedKeys, JOY_HELD = heldKeys, JOY_NEW = newKeys.
const JOY_REPEAT = (keys: number): number => ((gMain as { newAndRepeatedKeys?: number }).newAndRepeatedKeys ?? gMain.newKeys) & keys;
const JOY_HELD = (keys: number): number => ((gMain as { heldKeys?: number }).heldKeys ?? 0) & keys;
const JOY_NEW = (keys: number): number => gMain.newKeys & keys;

function InBoxInput_Normal(): number {
  let retVal = INPUT_NONE; let cursorArea = sCursorArea; let cursorPosition = sCursorPosition;
  const s = sStorage!;
  do {
    cursorArea = sCursorArea; cursorPosition = sCursorPosition;
    s.cursorVerticalWrap = 0; s.cursorHorizontalWrap = 0; s.cursorFlipTimer = 0;
    if (JOY_REPEAT(DPAD_UP)) {
      retVal = INPUT_MOVE_CURSOR;
      if (sCursorPosition >= IN_BOX_COLUMNS) cursorPosition -= IN_BOX_COLUMNS;
      else { cursorArea = CURSOR_AREA_BOX_TITLE; cursorPosition = 0; }
      break;
    } else if (JOY_REPEAT(DPAD_DOWN)) {
      retVal = INPUT_MOVE_CURSOR; cursorPosition += IN_BOX_COLUMNS;
      if (cursorPosition >= IN_BOX_COUNT) {
        cursorArea = CURSOR_AREA_BUTTONS; cursorPosition -= IN_BOX_COUNT;
        cursorPosition = Math.floor(cursorPosition / 3); s.cursorVerticalWrap = 1; s.cursorFlipTimer = 1;
      }
      break;
    } else if (JOY_REPEAT(DPAD_LEFT)) {
      retVal = INPUT_MOVE_CURSOR;
      if (sCursorPosition % IN_BOX_COLUMNS !== 0) cursorPosition--;
      else { s.cursorHorizontalWrap = -1; cursorPosition += (IN_BOX_COLUMNS - 1); }
      break;
    } else if (JOY_REPEAT(DPAD_RIGHT)) {
      retVal = INPUT_MOVE_CURSOR;
      if ((sCursorPosition + 1) % IN_BOX_COLUMNS !== 0) cursorPosition++;
      else { s.cursorHorizontalWrap = 1; cursorPosition -= (IN_BOX_COLUMNS - 1); }
      break;
    } else if (JOY_NEW(START_BUTTON)) {
      retVal = INPUT_MOVE_CURSOR; cursorArea = CURSOR_AREA_BOX_TITLE; cursorPosition = 0; break;
    }
    // :7092 A → SetSelectionMenuTexts → menu (sAutoActionOn dispatch direct = lot suivant).
    if (JOY_NEW(A_BUTTON) && SetSelectionMenuTexts()) return INPUT_IN_MENU;
    if (JOY_NEW(B_BUTTON)) return INPUT_PRESSED_B;
    if (JOY_NEW(SELECT_BUTTON)) { ToggleCursorAutoAction(); return INPUT_NONE; }
    retVal = INPUT_NONE;
  } while (false);
  if (retVal !== INPUT_NONE) SetCursorPosition(cursorArea, cursorPosition);
  return retVal;
}

function HandleInput_OnBox(): number {
  let retVal = INPUT_NONE; let cursorArea = 0; let cursorPosition = 0;
  const s = sStorage!;
  do {
    s.cursorHorizontalWrap = 0; s.cursorVerticalWrap = 0; s.cursorFlipTimer = 0;
    if (JOY_REPEAT(DPAD_UP)) {
      retVal = INPUT_MOVE_CURSOR; cursorArea = CURSOR_AREA_BUTTONS; cursorPosition = 0; s.cursorFlipTimer = 1; break;
    } else if (JOY_REPEAT(DPAD_DOWN)) {
      retVal = INPUT_MOVE_CURSOR; cursorArea = CURSOR_AREA_IN_BOX; cursorPosition = 2; break;
    }
    if (JOY_HELD(DPAD_LEFT)) return INPUT_SCROLL_LEFT;
    if (JOY_HELD(DPAD_RIGHT)) return INPUT_SCROLL_RIGHT;
    // :7447 A → AnimateBoxScrollArrows(FALSE); AddBoxOptionsMenu() → INPUT_BOX_OPTIONS → Task_HandleBoxOptions
    // (SAUTER/DÉCO/NOM). Lot box-options non porté → A inerte (curseur reste sur le titre, flèches actives).
    if (JOY_NEW(B_BUTTON)) return INPUT_PRESSED_B;
    if (JOY_NEW(SELECT_BUTTON)) { ToggleCursorAutoAction(); return INPUT_NONE; }
    retVal = INPUT_NONE;
  } while (false);
  if (retVal !== INPUT_NONE) {
    if (cursorArea !== CURSOR_AREA_BOX_TITLE) AnimateBoxScrollArrows(false);
    SetCursorPosition(cursorArea, cursorPosition);
  }
  return retVal;
}

function HandleInput_OnButtons(): number {
  let retVal = INPUT_NONE; let cursorArea = sCursorArea; let cursorPosition = sCursorPosition;
  const s = sStorage!;
  do {
    cursorArea = sCursorArea; cursorPosition = sCursorPosition;
    s.cursorHorizontalWrap = 0; s.cursorVerticalWrap = 0; s.cursorFlipTimer = 0;
    if (JOY_REPEAT(DPAD_UP)) {
      retVal = INPUT_MOVE_CURSOR; cursorArea = CURSOR_AREA_IN_BOX; s.cursorVerticalWrap = -1;
      cursorPosition = (sCursorPosition === 0) ? (IN_BOX_COUNT - 1 - 5) : (IN_BOX_COUNT - 1);
      s.cursorFlipTimer = 1; break;
    }
    if (JOY_REPEAT(DPAD_DOWN | START_BUTTON)) {
      retVal = INPUT_MOVE_CURSOR; cursorArea = CURSOR_AREA_BOX_TITLE; cursorPosition = 0; s.cursorFlipTimer = 1; break;
    }
    if (JOY_REPEAT(DPAD_LEFT)) { retVal = INPUT_MOVE_CURSOR; if (--cursorPosition < 0) cursorPosition = 1; break; }
    else if (JOY_REPEAT(DPAD_RIGHT)) { retVal = INPUT_MOVE_CURSOR; if (++cursorPosition > 1) cursorPosition = 0; break; }
    if (JOY_NEW(A_BUTTON)) return (cursorPosition === 0) ? INPUT_SHOW_PARTY : INPUT_CLOSE_BOX;
    if (JOY_NEW(B_BUTTON)) return INPUT_PRESSED_B;
    if (JOY_NEW(SELECT_BUTTON)) { ToggleCursorAutoAction(); return INPUT_NONE; }
    retVal = INPUT_NONE;
  } while (false);
  if (retVal !== INPUT_NONE) SetCursorPosition(cursorArea, cursorPosition);
  return retVal;
}

// :7310 HandleInput_InParty — nav party réelle = lot suivant ; ici A/B minimal (le user teste RETIRER, pas la party).
function HandleInput_InParty(): number {
  if (JOY_NEW(A_BUTTON) && SetSelectionMenuTexts()) return INPUT_IN_MENU;
  if (JOY_NEW(B_BUTTON)) return INPUT_PRESSED_B;
  return INPUT_NONE;
}

// ─── :7577 HandleInput — dispatch selon sCursorArea. ───
function HandleInput(): number {
  switch (sCursorArea) {
    case CURSOR_AREA_IN_BOX: return InBoxInput_Normal();
    case CURSOR_AREA_IN_PARTY: return HandleInput_InParty();
    case CURSOR_AREA_BOX_TITLE: return HandleInput_OnBox();
    case CURSOR_AREA_BUTTONS: return HandleInput_OnButtons();
  }
  return INPUT_NONE;
}

// ─── :7603 AddBoxOptionsMenu ───
function AddBoxOptionsMenu(): void {
  InitMenu();
  SetMenuText(MENU_JUMP);
  SetMenuText(MENU_WALLPAPER);
  SetMenuText(MENU_NAME);
  SetMenuText(MENU_CANCEL);
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION — pipeline d'ouverture (:1998-2252)
// ═══════════════════════════════════════════════════════════════════════════

/** Précharge (adaptation ROM→réseau) : icônes des mons de la boîte + front pic du 1er mon. */
function _preloadBoxResources(boxId: number): void {
  const boxes = GetPokemonStorage().boxes;
  for (let pos = 0; pos < IN_BOX_COUNT; pos++) {
    const mon = boxes[boxId]?.[pos];
    if (mon && mon.species) PreloadMonIcon(GetIconSpeciesNoPersonality(mon.species));
  }
  const first = boxes[boxId]?.find((m) => m && m.species);
  if (first) PreloadDisplayMonPic(first.species);
}
function _boxIconsLoaded(boxId: number): boolean {
  const boxes = GetPokemonStorage().boxes;
  for (let pos = 0; pos < IN_BOX_COUNT; pos++) {
    const mon = boxes[boxId]?.[pos];
    if (mon && mon.species && !IsMonIconLoaded(GetIconSpeciesNoPersonality(mon.species))) return false;
  }
  return true;
}

// ─── :1998 EnterPokeStorage ───
function EnterPokeStorage(boxOption: number): void {
  const rt = getRuntime(); if (!rt) return;
  rt.ResetTasks?.();
  sCurrentBoxOption = boxOption;
  sStorage = AllocPokemonStorageSystemData();
  sStorage.boxOption = boxOption;
  sStorage.isReopening = false;
  sMovingItemId = 0;  // ITEM_NONE
  sStorage.state = 0;
  LoadStorageAssets();                          // adaptation : INCBIN → fetch (gate état 0)
  PreloadMonIconPalettes();
  _preloadBoxResources(StorageGetCurrentBox());
  const taskId = rt.CreateTask((t: { taskId: number }) => Task_InitPokeStorage(t.taskId), 3);
  sStorage.taskId = taskId;
  sLastUsedBox = StorageGetCurrentBox();
  rt.SetMainCallback2(CB2_PokeStorage as never);
}

// ─── :2019 CB2_ReturnToPokeStorage ───
function CB2_ReturnToPokeStorage(): void {
  const rt = getRuntime(); if (!rt) return;
  rt.ResetTasks?.();
  sStorage = AllocPokemonStorageSystemData();
  sStorage.boxOption = sCurrentBoxOption;
  sStorage.isReopening = true;
  sStorage.state = 0;
  LoadStorageAssets();
  const taskId = rt.CreateTask((t: { taskId: number }) => Task_InitPokeStorage(t.taskId), 3);
  sStorage.taskId = taskId;
  rt.SetMainCallback2(CB2_PokeStorage as never);
}

// :1691 CB2_ExitPokeStorage — retour OW puis FieldTask_ReturnToPcMenu recrée le menu PC. ───
function GetCurrentBoxOption(): number { return sCurrentBoxOption; }
function IsMonBeingMoved(): boolean { return sIsMonBeingMoved; }
function MultiMove_Free(): void { sMultiMove = null; }
function FreePokeStorageData(): void {
  TilemapUtil_Free();
  MultiMove_Free();
  sStorage = null;  // Free(sStorage)
}
// :4256 UpdateBoxToSendMons — mémorise la boîte courante (flag « box full » = lot flags).
function UpdateBoxToSendMons(): void {
  if (sLastUsedBox !== StorageGetCurrentBox()) {
    // FlagClear(FLAG_SHOWN_BOX_WAS_FULL_MESSAGE) + VarSet(VAR_PC_BOX_TO_SEND_MON) : lot field flags/vars.
  }
}
const sYesNoWindowTemplate = { bg: 0, tilemapLeft: 24, tilemapTop: 11, width: 5, height: 4, paletteNum: 15, baseBlock: 0x5C } as WindowTemplate;  // :1100
function ShowYesNoWindow(cursorPos: number): void {
  CreateYesNoMenu(sYesNoWindowTemplate, 11, 14, 0);
  Menu_MoveCursorNoWrapAround(cursorPos);
}
function CB2_ExitPokeStorage(): void {
  // 1:1 décomp:1691-1696 — gFieldCallback = FieldTask_ReturnToPcMenu ; SetMainCallback2(CB2_ReturnToField).
  // ⚠️ PAS CB2_ReturnToFieldWithOpenMenu_Manual : il pose gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu
  // (→ START MENU à la place du menu PC). CB2_ReturnToField(_Manual) laisse gFieldCallback (=RunFieldCallback)
  // recréer le menu PC. Pas de UnlockPlayerFieldControls (le décomp garde le lock jusqu'à AU REVOIR).
  sPreviousBoxOption = GetCurrentBoxOption();
  void import('./overworld').then((m) => {
    (globalThis as Record<string, unknown>).gFieldCallback = FieldTask_ReturnToPcMenu;  // :1694
    (globalThis as Record<string, unknown>).gFieldCallback2 = null;
    const cb = (m as Record<string, unknown>).CB2_ReturnToField_Manual as (() => void) | undefined;
    if (cb) cb();  // :1695 SetMainCallback2(CB2_ReturnToField)
  }).catch((e) => console.error('[pc-storage] exit', e));
}
// :1658 FieldTask_ReturnToPcMenu — recrée le menu PC (RETIRER/DÉPOSER/…) après retour OW. ───
function FieldTask_ReturnToPcMenu(): void {
  const rt = getRuntime(); if (!rt) return;
  // 1:1 décomp:1661/1668 — SAUVE puis RESTAURE le vblank. Sans la restauration, vblankCallback
  // reste NULL → TransferPlttBuffer skippé (decomp-runtime.ts:2064) → palettes de la map jamais
  // transférées = OW glitché (Centre vert, tiles noirs) au retour de l'écran boîtes.
  const vblankCb = (gMain as { vblankCallback?: (() => void) | null }).vblankCallback ?? null;  // :1661
  rt.SetVBlankCallback?.(null);
  const taskId = rt.CreateTask((t: { taskId: number }) => Task_PCMainMenu(t.taskId), 80);
  rt.gTasks[taskId].data[0] = 0;                     // tState
  rt.gTasks[taskId].data[1] = sPreviousBoxOption;    // tSelectedOption
  Task_PCMainMenu(taskId);
  rt.SetVBlankCallback?.(vblankCb as never);         // :1668 restaure le vblank de la map
  FadeInFromBlack();
}

// ─── :2089 Task_InitPokeStorage — les 11 états 1:1. ───
function Task_InitPokeStorage(taskId: number): void {
  const rt = getRuntime(); if (!rt || !sStorage) return;
  switch (sStorage.state) {
    case 0:
      if (!sStorageAssets) return;              // gate assets (= lecture ROM synchrone du décomp)
      rt.SetVBlankCallback?.(null);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);
      ResetForPokeStorage();
      if (sStorage.isReopening) {
        switch (sWhichToReshow) {
          case SCREEN_CHANGE_NAME_BOX - 1: LoadSavedMovingMon(); break;
          case SCREEN_CHANGE_SUMMARY_SCREEN - 1: SetSelectionAfterSummaryScreen(); break;
          case SCREEN_CHANGE_ITEM_FROM_BAG - 1: GiveChosenBagItem(); break;
        }
      }
      LoadPokeStorageMenuGfx();
      LoadWaveformSpritePalette();
      break;
    case 1:
      if (!InitPokeStorageWindows()) { SetPokeStorageTask(Task_ChangeScreen); return; }
      break;
    case 2:
      PutWindowTilemap(WIN_DISPLAY_INFO);
      ClearWindowTilemap(WIN_MESSAGE);
      LoadBgTiles(0, new Uint8Array(0x200), 0x200, 0);  // CpuFill32(0, VRAM, 0x200)
      LoadUserWindowBorderGfx(WIN_MESSAGE, 0xB, BG_PLTT_ID(14));
      break;
    case 3:
      ResetAllBgCoords();
      if (!sStorage.isReopening) InitStartingPosData();
      break;
    case 4:
      if (!_boxIconsLoaded(StorageGetCurrentBox()) || !AreMonIconPalettesLoaded()) return;  // gate icônes (adaptation async)
      InitMonIconFields();
      if (!sStorage.isReopening) InitCursor();
      else InitCursorOnReopen();
      break;
    case 5:
      if (!MultiMove_Init()) { SetPokeStorageTask(Task_ChangeScreen); return; }
      SetScrollingBackground();
      InitPokeStorageBg0();
      break;
    case 6:
      InitPalettesAndSprites();
      break;
    case 7:
      InitSupplementalTilemaps();
      break;
    case 8:
      CreateInitBoxTask(StorageGetCurrentBox());
      break;
    case 9:
      if (IsInitBoxActive()) return;
      if (sStorage.boxOption !== OPTION_MOVE_ITEMS) {
        sStorage.markMenu = { baseTileTag: GFXTAG_MARKING_MENU, basePaletteTag: PALTAG_MARKING_MENU };
        InitMonMarkingsMenu(sStorage.markMenu as never);
        BufferMonMarkingsMenuTiles();
      } else {
        CreateItemIconSprites();
        InitCursorItemIcon();
      }
      break;
    case 10:
      SetMonIconTransparency();
      if (!sStorage.isReopening) {
        BlendPalettes(PALETTES_ALL, 16, RGB_BLACK);
        SetPokeStorageTask(Task_ShowPokeStorage);
      } else {
        BlendPalettes(PALETTES_ALL, 16, RGB_BLACK);
        SetPokeStorageTask(Task_ReshowPokeStorage);
      }
      rt.SetVBlankCallback?.(VBlankCB_PokeStorage as never);
      return;
    default:
      return;
  }
  sStorage.state++;
}

// ─── :2202 Task_ShowPokeStorage ───
function Task_ShowPokeStorage(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      PlaySE(SE_PC_LOGIN);
      ComputerScreenOpenEffect(20, 0, 1);
      s.state++;
      break;
    case 1:
      if (!IsComputerScreenOpenEffectActive()) SetPokeStorageTask(Task_PokeStorageMain);
      break;
  }
}

// ─── :2218 Task_ReshowPokeStorage ───
function Task_ReshowPokeStorage(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      BeginNormalPaletteFade(PALETTES_ALL, -1, 0x10, 0, RGB_BLACK);
      s.state++;
      break;
    case 1:
      if (!UpdatePaletteFade()) {
        // reopening ITEM_FROM_BAG + item : PrintMessage(MSG_ITEM_IS_HELD) → lot messages (tâche #3).
        SetPokeStorageTask(Task_PokeStorageMain);
      }
      break;
  }
}

// ─── :2270 Task_PokeStorageMain — boucle principale. PROVISOIRE : cases MOVE_CURSOR + B (fermeture) ;
// les autres INPUT_* (party/menus/scroll/multimove) = lots #2/#3. MSTATE_* 1:1 (:2254-2268). ───
const MSTATE_HANDLE_INPUT = 0, MSTATE_MOVE_CURSOR = 1;
function Task_PokeStorageMain(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case MSTATE_HANDLE_INPUT:
      switch (HandleInput()) {
        case INPUT_MOVE_CURSOR:
          PlaySE(0x5 /* SE_SELECT */);
          s.state = MSTATE_MOVE_CURSOR;
          break;
        case INPUT_IN_MENU:  // :2288 → menu contextuel (RETIRER/RESUME/MARQUER/RELACHER/ANNULER)
          SetPokeStorageTask(Task_OnSelectedMon);
          break;
        case INPUT_PRESSED_B:  // :2295 → Task_OnBPressed (« Continuer ? » Oui/Non → fermeture propre → menu PC)
          SetPokeStorageTask(Task_OnBPressed);
          break;
        case INPUT_CLOSE_BOX:  // :2306 bouton FERMER → fermeture propre → menu PC
          SetPokeStorageTask(Task_OnCloseBoxPressed);
          break;
        // :2281 INPUT_SHOW_PARTY / :2319 INPUT_SCROLL_* / :2312 INPUT_BOX_OPTIONS → party/scroll/box-options :
        // lots non portés (SetUpScrollToBox+ScrollToBox+MSTATE_SCROLL_BOX, Task_ShowPartyPokemon garde, Task_HandleBoxOptions).
        // Inertes : le curseur reste, aucun freeze (state demeure MSTATE_HANDLE_INPUT).
      }
      break;
    case MSTATE_MOVE_CURSOR:
      if (!UpdateCursorPos()) {
        if (IsCursorOnCloseBox()) StartFlashingCloseBoxButton();
        else StopFlashingCloseBoxButton();
        s.state = MSTATE_HANDLE_INPUT;
      }
      break;
  }
}
// :3731 Task_ChangeScreen — dispatch selon screenChangeType. EXIT porté ; SUMMARY/NAME/ITEM = lots suivants.
function Task_ChangeScreen(_taskId: number): void {
  const s = sStorage!;
  const screenChangeType = s.screenChangeType;
  sMovingItemId = 0;  // ITEM_NONE (MOVE_ITEMS = lot items)
  switch (screenChangeType) {
    case SCREEN_CHANGE_EXIT_BOX:
    default:
      FreePokeStorageData();
      const rt = getRuntime();
      rt?.SetMainCallback2(CB2_ExitPokeStorage as never);
      break;
    case SCREEN_CHANGE_SUMMARY_SCREEN:
    case SCREEN_CHANGE_NAME_BOX:
    case SCREEN_CHANGE_ITEM_FROM_BAG:
      console.warn(`[pc-storage] Task_ChangeScreen type ${screenChangeType} (RÉSUMÉ/RENOMMER/OBJET) : lot suivant.`);
      FreePokeStorageData();
      getRuntime()?.SetMainCallback2(CB2_ExitPokeStorage as never);
      break;
  }
}

// :3670 Task_OnBPressed — B : « Continuer les opérations ? » Oui = rester, Non = fermer (menu PC). ───
function Task_OnBPressed(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      if (IsMonBeingMoved()) { PlaySE(0x20 /* SE_FAILURE */); PrintMessage(MSG_HOLDING_POKE); s.state = 1; }
      else if (IsMovingItem()) { console.warn('[pc-storage] Task_CloseBoxWhileHoldingItem : lot items'); SetPokeStorageTask(Task_PokeStorageMain); }
      else { PlaySE(0x5 /* SE_SELECT */); PrintMessage(MSG_CONTINUE_BOX); ShowYesNoWindow(0); s.state = 2; }
      break;
    case 1:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0 /* DPAD_ANY */)) { ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain); }
      break;
    case 2:
      switch (Menu_ProcessInputNoWrapClearOnChoose()) {
        case 0:  // Oui : continuer
          ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain);
          break;
        case 1:
        case MENU_B_PRESSED:  // Non : fermer
          PlaySE(3 /* SE_PC_OFF */); ClearBottomWindow(); s.state++;
          break;
      }
      break;
    case 3:
      ComputerScreenCloseEffect(20, 0, 0); s.state++;
      break;
    case 4:
      if (!IsComputerScreenCloseEffectActive()) {
        UpdateBoxToSendMons();
        CalculatePlayerPartyCount();  // gPlayerPartyCount
        s.screenChangeType = SCREEN_CHANGE_EXIT_BOX;
        SetPokeStorageTask(Task_ChangeScreen);
      }
      break;
  }
}
// :3609 Task_OnCloseBoxPressed — curseur sur FERMER BOITE + A : « Quitter ? » Oui = fermer. ───
function Task_OnCloseBoxPressed(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      if (IsMonBeingMoved()) { PlaySE(0x20); PrintMessage(MSG_HOLDING_POKE); s.state = 1; }
      else if (IsMovingItem()) { console.warn('[pc-storage] Task_CloseBoxWhileHoldingItem : lot items'); SetPokeStorageTask(Task_PokeStorageMain); }
      else { PlaySE(0x5); PrintMessage(MSG_EXIT_BOX); ShowYesNoWindow(0); s.state = 2; }
      break;
    case 1:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0)) { ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain); }
      break;
    case 2:
      switch (Menu_ProcessInputNoWrapClearOnChoose()) {
        case MENU_B_PRESSED:
        case 1:  // Non : rester
          ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain);
          break;
        case 0:  // Oui : fermer
          PlaySE(3); ClearBottomWindow(); s.state++;
          break;
      }
      break;
    case 3:
      ComputerScreenCloseEffect(20, 0, 1); s.state++;
      break;
    case 4:
      if (!IsComputerScreenCloseEffectActive()) {
        UpdateBoxToSendMons();
        CalculatePlayerPartyCount();
        s.screenChangeType = SCREEN_CHANGE_EXIT_BOX;
        SetPokeStorageTask(Task_ChangeScreen);
      }
      break;
  }
}

// Pont dev/déclencheur : ouvrir le menu PC (le script « PC POKéMON » l'appellera au câblage).
(globalThis as Record<string, unknown>).__ShowPokemonStorageSystemPC = ShowPokemonStorageSystemPC;

// Sonde dev (diag écran boîtes) — sans effet sur le jeu.
(globalThis as Record<string, unknown>).__pcProbe = () => {
  const rt = getRuntime();
  const s = sStorage;
  const cursor = s ? _spr(s.cursorSprite) : null;
  const oam = cursor && rt ? rt.gba?.oam?.[cursor.oamIndex] : null;
  return {
    hasStorage: !!s, state: s?.state, taskId: s?.taskId, boxOption: s?.boxOption,
    assets: !!sStorageAssets, cursorArea: sCursorArea, cursorPos: sCursorPosition,
    cursorId: s?.cursorSprite, displaySpecies: s?.displayMonSpecies,
    boxSprites: s ? s.boxMonsSprites.filter((i) => i >= 0).length : 0,
    cursorSpr: cursor ? { x: cursor.x, y: cursor.y, invisible: cursor.invisible } : null,
    cursorOam: oam ? { paletteBank: oam.paletteBank, priority: oam.priority, tileId: oam.tileId } : null,
    arrows: s ? s.arrowSprites.map((id) => { const a = _spr(id); return a ? { d0: a.data[0], d3: a.data[3], x: a.x, x2: a.x2, inv: a.invisible, cb: (a as { callback?: { name?: string } }).callback?.name } : null; }) : null,
  };
};

// Exposition dev (sonde déterministe), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__CheckFreePokemonStorageSpace = CheckFreePokemonStorageSpace;
(globalThis as Record<string, unknown>).__AnyStorageMonWithMove = AnyStorageMonWithMove;
(globalThis as Record<string, unknown>).__CountStorageNonEggMons = CountStorageNonEggMons;
// __getPokemonStorage : accès au storage PC sans importer save.ts (cycle-break).
// Utilisé par la sonde déterministe ET par CopyMonToPC (party-storage.ts).
(globalThis as Record<string, unknown>).__getPokemonStorage = GetPokemonStorage;
