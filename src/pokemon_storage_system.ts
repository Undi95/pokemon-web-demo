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
import { getRuntime, gMain } from '../harness/runtime/decomp-globals';
import { AddWindow, RemoveWindow, FillWindowPixelBuffer, CopyWindowToVram, type WindowTemplate } from './window';
import {
  DrawStdWindowFrame, PrintMenuTable, InitMenuInUpperLeftCornerNormal, Menu_ProcessInput,
  Menu_MoveCursor, Menu_GetCursorPos, LoadMessageBoxAndBorderGfx, DrawDialogueFrame,
  ClearStdWindowAndFrame, AddTextPrinterParameterized2,
} from './menu';
import type { MenuAction } from './menu';
import { GetMaxWidthInMenuTable } from './international_string_util';
import { CleanupOverworldWindowsAndTilemaps } from './overworld';
import { CalculatePlayerPartyCount } from './pokemon';
import { LockPlayerFieldControls, UnlockPlayerFieldControls } from './script';
// ─── ÉCRAN DES BOÎTES (phase 2, rendu de base) : icônes + infra CB2 ─────────
import {
  PreloadMonIcon, IsMonIconLoaded, LoadMonIconPaletteToOwnSlot, GetIconSpeciesNoPersonality,
  CreateMonIconNoPersonality, FreeAndDestroyMonIconSprite,
} from './pokemon_icon';
import { ResetSpriteData, FreeAllSpritePalettes, LoadSpriteSheet, LoadSpritePalette, DestroySprite } from './sprite';
import { REG_OFFSET_DISPCNT } from '../include/gba/io_reg';
import { BeginNormalPaletteFade } from './palette';
import { loadIndexedPngStrict } from '../harness/gba/png-loader';

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
const DPAD_RIGHT = 0x0010, DPAD_LEFT = 0x0020;
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

/** 1:1 `ShowPokemonStorageSystemPC` (pokemon_storage_system.c:1650) — point d'entrée du PC. */
export function ShowPokemonStorageSystemPC(): void {
  const rt = getRuntime(); if (!rt) return;
  const taskId = rt.CreateTask((t) => Task_PCMainMenu(t.taskId), 80);
  rt.gTasks[taskId].data[0] = 0;  // tState
  rt.gTasks[taskId].data[1] = 0;  // tSelectedOption
  LockPlayerFieldControls();
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉCRAN DES BOÎTES — RENDU DE BASE (phase 2a) : ouvre un CB2 plein, affiche la boîte
// courante avec les icônes des pokémon. 1:1 sur les positions (CreateBoxMonIconAtPos :4478).
// ⚠️ BASE PRAGMATIQUE — à raffiner vers le 1:1 STRICT : Task_InitPokeStorage (11 états),
// wallpapers, scrolling_bg, titre de boîte, curseur main, menus, dépôt/retrait (cf. [[chantier-pc-storage]]).
// ═══════════════════════════════════════════════════════════════════════════
const IN_BOX_COLUMNS = 6;
let _pcBoxIconSprites: number[] = [];
let _pcPendingBoxId = -1;

/** Précharge (fire-and-forget) les icônes des pokémon de la boîte. */
function _preloadBoxIcons(boxId: number): void {
  const storage = GetPokemonStorage();
  for (let pos = 0; pos < IN_BOX_COUNT; pos++) {
    const mon = storage.boxes[boxId]?.[pos];
    if (mon && mon.species) PreloadMonIcon(GetIconSpeciesNoPersonality(mon.species));
  }
}

/** 1:1 `CreateBoxMonIconAtPos` (pokemon_storage_system.c:4478) — positions des 30 slots. */
function _createBoxMonIcons(boxId: number): void {
  const rt = getRuntime(); if (!rt) return;
  _pcBoxIconSprites = [];
  const storage = GetPokemonStorage();
  for (let pos = 0; pos < IN_BOX_COUNT; pos++) {
    const mon = storage.boxes[boxId]?.[pos];
    if (mon && mon.species) {
      const x = 8 * (3 * (pos % IN_BOX_COLUMNS)) + 100;          // 1:1 :4484
      const y = 8 * (3 * Math.floor(pos / IN_BOX_COLUMNS)) + 44; // 1:1 :4485
      const iconSpecies = GetIconSpeciesNoPersonality(mon.species);
      const palSlot = LoadMonIconPaletteToOwnSlot(iconSpecies);  // palette dédiée (couleurs correctes)
      const spriteId = CreateMonIconNoPersonality(iconSpecies, null, x, y, 19 - (pos % IN_BOX_COLUMNS), false);
      if (spriteId !== 0xFF) {
        const sprite = rt.gSprites[spriteId];
        if (sprite && palSlot >= 0) rt.gba.oam[sprite.oamIndex].paletteBank = palSlot;  // 1:1 palId par icône
        _pcBoxIconSprites.push(spriteId);
      }
    }
  }
}

// ─── CURSEUR MAIN (hand_cursor) — ≈ CreateCursorSprites (:7735) : sprite 32×32 pointant un slot.
let _pcCursorSpriteId = -1;
let _pcCursorPos = 0;           // slot pointé (0..IN_BOX_COUNT-1, grille IN_BOX_COLUMNS)
let _pcCursorTileStart = -1;
let _pcCursorPalBank = 0;
let _pcCursorReady = false;

async function _loadCursorGfx(): Promise<void> {
  if (_pcCursorReady) return;
  const png = await loadIndexedPngStrict('/decomp/em/pokemon_storage/hand_cursor.png', 4);
  _pcCursorTileStart = LoadSpriteSheet({ data: png.charData, size: png.charData.length, tag: 'pc_cursor' });
  // Curseur = 2 palettes 1:1 (:7820-7821) sur les mêmes tiles : misc_2 (= sWaveform_Pal, :1045) donne la
  // main BLANCHE (état normal, défaut sAutoActionOn=0) ; misc_1 (hand_cursor PLTE) donne la main JAUNE
  // (auto-action, raffinement futur avec ToggleCursorAutoAction). Défaut = blanc.
  const waveform = await loadIndexedPngStrict('/decomp/em/pokemon_storage/waveform.png', 4);
  _pcCursorPalBank = LoadSpritePalette({ data: waveform.palette, tag: 'pc_cursor_pal_white' });  // misc_2 (blanc)
  LoadSpritePalette({ data: png.palette, tag: 'pc_cursor_pal_yellow' });                          // misc_1 (jaune)
  _pcCursorReady = true;
}

/** Coords écran du slot `pos` (mêmes que l'icône, 1:1 :4484-4485) — le curseur main pointe le slot. */
function _cursorSlotCoords(pos: number): { x: number; y: number } {
  return { x: 8 * (3 * (pos % IN_BOX_COLUMNS)) + 100, y: 8 * (3 * Math.floor(pos / IN_BOX_COLUMNS)) + 44 };
}

/** ≈ `CreateCursorSprites` (:7735) — crée le sprite 32×32 du curseur au slot courant. */
function _createCursor(): void {
  const rt = getRuntime(); if (!rt || !_pcCursorReady) return;
  const { x, y } = _cursorSlotCoords(_pcCursorPos);
  // Décomp subpriority=6 (HW GBA : subpriority basse = devant). Notre buildOamBuffer trie à l'INVERSE
  // (subpriority haute = devant), donc pour garder le curseur DEVANT les icônes (subpriority 14-19) on
  // prend une valeur haute — adaptation renderer, prouvée en jeu (sonde : sub 6 = derrière, 25 = devant).
  const spr = rt.CreateSpriteAtOam({ tileId: _pcCursorTileStart, paletteBank: _pcCursorPalBank, x, y, shape: 0, size: 2, priority: 1, subpriority: 30 });
  _pcCursorSpriteId = spr.spriteId;
}

/** Déplace le curseur dans la grille (wrap intra-boîte). Raffinement 1:1 = sortie vers flèches/party/titre. */
function _moveCursor(dCol: number, dRow: number): void {
  const rt = getRuntime(); if (!rt || _pcCursorSpriteId < 0) return;
  const rows = IN_BOX_COUNT / IN_BOX_COLUMNS;  // 5
  let col = _pcCursorPos % IN_BOX_COLUMNS;
  let row = Math.floor(_pcCursorPos / IN_BOX_COLUMNS);
  col = (col + dCol + IN_BOX_COLUMNS) % IN_BOX_COLUMNS;
  row = (row + dRow + rows) % rows;
  _pcCursorPos = row * IN_BOX_COLUMNS + col;
  const { x, y } = _cursorSlotCoords(_pcCursorPos);
  const spr = rt.gSprites[_pcCursorSpriteId];
  if (spr) { spr.x = x; spr.y = y; }
}

/** Task d'init : attend le préchargement async des icônes + du curseur, puis crée tout + allume l'écran. */
function Task_PcBoxRender(taskId: number): void {
  const rt = getRuntime(); if (!rt) return;
  if (!_pcCursorReady) return;  // gate async curseur
  const storage = GetPokemonStorage();
  for (let pos = 0; pos < IN_BOX_COUNT; pos++) {
    const mon = storage.boxes[_pcPendingBoxId]?.[pos];
    if (mon && mon.species && !IsMonIconLoaded(GetIconSpeciesNoPersonality(mon.species))) return; // gate async icônes
  }
  // Curseur AVANT les icônes : 1:1 décomp (InitCursor état 4 < CreateInitBoxTask état 8) ; dans notre
  // renderer oamIndex bas = devant, donc le curseur (créé en 1er) passe devant les icônes qu'il survole.
  _createCursor();
  _createBoxMonIcons(_pcPendingBoxId);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, 0x1040);  // OBJ ON (bit12) + 1D mapping (bit6) — icônes visibles
  // fade-in : copie gPlttBufferUnfaded → gPlttBufferFaded (sinon le renderer lit du noir).
  BeginNormalPaletteFade(0xFFFFFFFF, 0, 16, 0, 0x0000);
  rt.DestroyTask(taskId);
}

/** ≈ `CB2_PokeStorage` (pokemon_storage_system.c:2036) — main loop de l'écran boîtes. */
function CB2_PokeStorage(): void {
  const rt = getRuntime(); if (!rt) return;
  rt.runTasks?.();
  rt.animateSprites?.();
  rt.buildOamBuffer?.();
  rt.UpdatePaletteFade?.();
  // Navigation du curseur dans la grille (brique curseur ; l'action A viendra avec le menu contextuel).
  if (gMain.newKeys & DPAD_UP) _moveCursor(0, -1);
  else if (gMain.newKeys & DPAD_DOWN) _moveCursor(0, 1);
  else if (gMain.newKeys & DPAD_LEFT) _moveCursor(-1, 0);
  else if (gMain.newKeys & DPAD_RIGHT) _moveCursor(1, 0);
  if (gMain.newKeys & B_BUTTON) {  // ≈ CB2_ExitPokeStorage (retour field ; raffinement = FieldTask_ReturnToPcMenu)
    if (_pcCursorSpriteId >= 0) { DestroySprite(_pcCursorSpriteId); _pcCursorSpriteId = -1; }
    _pcBoxIconSprites.forEach((id) => FreeAndDestroyMonIconSprite(id));
    _pcBoxIconSprites = [];
    FreeAllSpritePalettes();
    void import('./overworld').then((m) => {
      const cb = (m as Record<string, unknown>).CB2_ReturnToFieldWithOpenMenu_Manual as (() => void) | undefined;
      if (cb) cb();
    });
  }
}

/** ≈ `EnterPokeStorage` (pokemon_storage_system.c:1998) — RENDU DE BASE : CB2 plein + boîte + icônes. */
function EnterPokeStorage(_boxOption: number): void {
  const rt = getRuntime(); if (!rt) return;
  rt.ResetTasks?.();
  ResetSpriteData();
  FreeAllSpritePalettes();
  rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);
  _pcPendingBoxId = StorageGetCurrentBox();
  _pcCursorPos = 0;
  _preloadBoxIcons(_pcPendingBoxId);
  void _loadCursorGfx();
  rt.CreateTask((t) => Task_PcBoxRender(t.taskId), 3);
  rt.SetMainCallback2(CB2_PokeStorage as never);
}

// Pont dev/déclencheur : ouvrir le menu PC (le script « PC POKéMON » l'appellera au câblage).
(globalThis as Record<string, unknown>).__ShowPokemonStorageSystemPC = ShowPokemonStorageSystemPC;

// Sonde dev (diag curseur) — sans effet sur le jeu.
(globalThis as Record<string, unknown>).__pcProbe = () => {
  const rt = getRuntime();
  const spr = rt && _pcCursorSpriteId >= 0 ? rt.gSprites[_pcCursorSpriteId] : null;
  const oam = spr && rt ? rt.gba?.oam?.[spr.oamIndex] : null;
  return {
    cursorId: _pcCursorSpriteId, ready: _pcCursorReady, pos: _pcCursorPos,
    tileStart: _pcCursorTileStart, palBank: _pcCursorPalBank,
    spr: spr ? { x: spr.x, y: spr.y, inUse: spr.inUse, invisible: spr.invisible, oamIndex: spr.oamIndex } : null,
    oam: oam ? { x: oam.x, y: oam.y, tileId: oam.tileId, paletteBank: oam.paletteBank, shape: oam.shape, size: oam.size, priority: oam.priority, affineMode: oam.affineMode } : null,
  };
};

// Exposition dev (sonde déterministe), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__CheckFreePokemonStorageSpace = CheckFreePokemonStorageSpace;
(globalThis as Record<string, unknown>).__AnyStorageMonWithMove = AnyStorageMonWithMove;
(globalThis as Record<string, unknown>).__CountStorageNonEggMons = CountStorageNonEggMons;
// __getPokemonStorage : accès au storage PC sans importer save.ts (cycle-break).
// Utilisé par la sonde déterministe ET par CopyMonToPC (party-storage.ts).
(globalThis as Record<string, unknown>).__getPokemonStorage = GetPokemonStorage;
