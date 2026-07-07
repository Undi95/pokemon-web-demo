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
  MON_DATA_SANITY_HAS_SPECIES, MON_DATA_KNOWN_MOVES, MON_DATA_PERSONALITY, MON_DATA_SPECIES_OR_EGG,
  MON_DATA_SANITY_IS_EGG, MON_DATA_SANITY_IS_BAD_EGG,
} from './engine/battle/party-storage';
// CopyMon/ZeroMonData : foyer pokemon.c (pokemon.ts n'importe PAS ce module —
// il passe par le hook __getPokemonStorage — donc pas de cycle).
import { CopyMon, ZeroMonData, GetGenderFromSpeciesAndPersonality, SetMonData, GetLevelFromBoxMonExp, CreateBoxMon, BoxMonToMon, type Pokemon } from './pokemon';
import { VarGet } from './event_data';
import { PARTY_SIZE } from '../include/constants/global';
// ─── PC MAIN MENU (phase 1) : helpers UI portés ────────────────────────────
import {
  getRuntime, gMain, LoadBgTiles, LoadPalette, BlendPalettes, ResetPaletteFade, PlaySE,
  FuncIsActiveTask, SpriteCallbackDummy, GetTextWindowPalette,
} from '../harness/runtime/decomp-globals';
import { SetGpuRegBits, ClearGpuRegBits, RGB_WHITE, RGB } from '../harness/runtime/decomp-helpers';
import {
  AddWindow, AddWindow8Bit, RemoveWindow, FillWindowPixelBuffer, CopyWindowToVram, InitBgsFromTemplates, ShowBg, HideBg,
  FillBgTilemapBufferRect, FillBgTilemapBufferRect_Palette0, CopyBgTilemapBufferToVram,
  GetBgTilemapBuffer, ScheduleBgCopyTilemapToVram, PutWindowTilemap, ClearWindowTilemap, InitWindows,
  ExtractWindowTiles4bpp, tileMapIndex, ChangeBgX, ChangeBgY, SetBgAttribute, BG_ATTR_PALETTEMODE,
  FillWindowPixelBuffer8Bit, CopyWindowToVram8Bit, BlitBitmapRectToWindow4BitTo8Bit, FillWindowPixelRect8Bit,
  COPYWIN_GFX,
  type WindowTemplate,
} from './window';
import { GetStringWidth, AddTextPrinterParameterized, GetStringCenterAlignXOffset } from './text';
import { PIXEL_FILL } from './engine/battle/battle-windows';
import { gSpeciesNames } from './engine/data/game-data';
import { LoadUserWindowBorderGfx, DrawTextBorderOuter } from './text_window';
import { SE_PC_LOGIN } from '../include/constants/songs';
import {
  DrawStdWindowFrame, PrintMenuTable, InitMenuInUpperLeftCornerNormal, Menu_ProcessInput,
  Menu_MoveCursor, Menu_GetCursorPos, LoadMessageBoxAndBorderGfx, DrawDialogueFrame,
  ClearStdWindowAndFrame, ClearStdWindowAndFrameToTransparent, DrawStdFrameWithCustomTileAndPalette,
  AddTextPrinterParameterized2, AddTextPrinterParameterized3, AddTextPrinterParameterized4,
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, Menu_MoveCursorNoWrapAround,
} from './menu';
import { FadeInFromBlack } from './field_screen_effect';
import { CopyMapTilesetsToVram } from './fieldmap';
import type { MenuAction } from './menu';
import { GetMaxWidthInMenuTable } from './international_string_util';
import { CleanupOverworldWindowsAndTilemaps } from './overworld';
import { CalculatePlayerPartyCount } from './pokemon';
import { GetSummaryLastMonIndex, OpenSummaryScreen } from './pokemon_summary_screen';
import { registerAffineAnim, registerAffineAnimTable } from './engine/decomp-impls/sprite-affine-extras';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { MOVE_SURF, MOVE_DIVE, MOVE_STRENGTH, MOVE_ROCK_SMASH } from '../include/constants/moves';
import { MAP_GROUP, MAP_NUM, MAP_CONSTANTS } from '../include/constants/map_groups';
// MAP_GROUPS_COUNT (décomp = nb de groupes de maps) sert de sentinelle « n'importe quelle map »
// dans sRestrictedReleaseMoves (Surf/Dive restreints partout). Émeraude = 34 (> tout vrai mapGroup).
const MAP_GROUPS_COUNT = 34;
const MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F = MAP_CONSTANTS.MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F;
const MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_2F = MAP_CONSTANTS.MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_2F;
import { LockPlayerFieldControls, UnlockPlayerFieldControls } from './script';
// ─── ÉCRAN DES BOÎTES (phase 2, rendu de base) : icônes + infra CB2 ─────────
import {
  PreloadMonIcon, IsMonIconLoaded, GetIconSpeciesNoPersonality,
  LoadMonIconPalettes, PreloadMonIconPalettes, AreMonIconPalettesLoaded, CreateMonIconSprite,
  GetMonIconPtr, GetValidMonIconPalIndex, TryLoadAllMonIconPalettesAtOffset,
} from './pokemon_icon';
import {
  InitMonMarkingsMenu, BufferMonMarkingsMenuTiles, CreateMonMarkingComboSprite, UpdateMonMarkingTiles,
  EnsureMonMarkingsGfxLoaded, EnsureMonMarkingsMenuGfxLoaded, OpenMonMarkingsMenu,
  HandleMonMarkingsMenuInput, FreeMonMarkingsMenu, type MonMarkingsMenu,
} from './mon_markings';
import {
  ComputerScreenOpenEffect, ComputerScreenCloseEffect,
  IsComputerScreenOpenEffectActive, IsComputerScreenCloseEffectActive,
} from './fldeff_misc';
import {
  ResetSpriteData, FreeAllSpritePalettes, LoadSpriteSheet, LoadSpritePalette, DestroySprite,
  CreateSprite, StartSpriteAnim, StartSpriteAnimIfDifferent, IndexOfSpritePaletteTag,
  FreeSpritePaletteByTag, _freeSpriteTileRangeByTag, GetSpriteTileStartByTag, AllocSpritePalette,
  ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, type AnimCmd,
} from './sprite';
import { REG_OFFSET_DISPCNT } from '../include/gba/io_reg';
import { BeginNormalPaletteFade, UpdatePaletteFade, BG_PLTT_ID } from './palette';
import { loadIndexedPngStrict, loadIndexedPng, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { GetItemName, GetItemDescription } from './item';
import { GetItemIconPicById, GetItemIconPaletteById, preloadItemIconAssets } from './item_icon';
import { getString } from './engine/ui/gba-strings';  // résolution 1:1 des gText_*/gPCText_* depuis strings.json
import { ItemIsMail, EOS } from './mail_data';
import { AddBagItem, RemoveBagItem } from './engine/bag/bag';
import { getItemKeyById } from '../harness/runtime/data-tables';
import { OBJ_PLTT_ID } from '../harness/runtime/decomp-runtime';
import { gSineTable } from './trig';
import { DoNamingScreen } from './naming_screen';
import { gSpecialVar } from './engine/script/script-vars';
// GoToBagMenu / ITEMMENULOCATION_PCBOX : import DYNAMIQUE dans Task_ChangeScreen (case ITEM_FROM_BAG)
// pour casser le cycle ESM item_menu ↔ pokemon_storage_system (gros module → TDZ boot au top-level).
import { ITEM_NONE } from '../include/constants/items';
const TILE_SIZE_4BPP = 32;

// ─── Adaptations bg tilemap (item info window) — helpers bg.c non encore dans window.ts. ───
const BG_ATTR_BASETILE = 8;  // include/gba/types.h — attribut « baseTile » d'un BgTemplate.
/** 1:1-sém `GetBgAttribute(bg, BG_ATTR_BASETILE)` : baseTile du BG (0 dans notre moteur — les
 *  tuiles item_info_frame sont chargées à l'offset absolu 0x13A). */
function GetBgAttribute(_bg: number, _attr: number): number { return 0; }
/** 1:1-sém `WriteSequenceToBgTilemapBuffer(bg, firstTileNum, x, y, width, height, palNum, tileStep)`
 *  (bg.c) : remplit un rect du tilemap avec une séquence de tuiles incrémentées de `tileStep`. */
function WriteSequenceToBgTilemapBuffer(bg: number, firstTileNum: number, x: number, y: number, width: number, height: number, palNum: number, tileStep: number): void {
  let tile = firstTileNum;
  for (let ty = 0; ty < height; ty++)
    for (let tx = 0; tx < width; tx++) { FillBgTilemapBufferRect(bg, tile, x + tx, y + ty, 1, 1, palNum); tile += tileStep; }
}
/** 1:1-sém `AddTextPrinterParameterized5` (text.c) — adaptation via AddTextPrinterParameterized. */
function AddTextPrinterParameterized5(windowId: number, fontId: number, str: string, x: number, y: number, _speed: number, _cb: unknown, _letterSpacing: number, _lineSpacing: number): void {
  AddTextPrinterParameterized(windowId, fontId, str, x, y, 0);
}

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
const CHAR_SPACE = 0x00; // charmap.txt : ' ' = 0x00

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
  markMenu: MonMarkingsMenu;                  // struct MonMarkingsMenu (embedded)
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
    markMenu: { baseTileTag: 0, basePaletteTag: 0 },
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
    // Précharge palette/gfx des marques (sMonMarkings_Pal = donnée statique dans le décomp)
    // AVANT que sStorageAssets soit prêt → le marking combo du panneau DONNEES n'est plus
    // rendu avec une palette vide (noire = marques invisibles).
    await EnsureMonMarkingsGfxLoaded();
    await EnsureMonMarkingsMenuGfxLoaded();  // gfx du menu MARQUER (idem : évite sprites vides à la 1re ouverture)
    await preloadItemIconAssets();  // buffers icônes objets (le décomp lit la ROM SYNC ; ici on précharge → LoadItemIconGfx SYNC 1:1)
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
/** 1:1 `void SetBoxWallpaper(u8 boxId, u8 wallpaper)` (:9545). */
function SetBoxWallpaper(boxId: number, wallpaperId: number): void {
  const st = GetPokemonStorage() as unknown as { wallpapers?: number[] };
  if (!st.wallpapers) st.wallpapers = [];
  st.wallpapers[boxId] = wallpaperId;
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
  if (sTilemapUtil[id].savedTilemap != null) TilemapUtil_DrawPrev(id); // jamais (savedTilemap toujours NULL)
  TilemapUtil_Draw(id);
  sTilemapUtil[id].prev = { ...sTilemapUtil[id].cur };
}
/** 1:1 `void UNUSED TilemapUtil_UpdateAll(void)` (:9790). */
function TilemapUtil_UpdateAll(): void {
  for (let i = 0; i < sNumTilemapUtilIds; i++) {
    if (sTilemapUtil[i].active === true) TilemapUtil_Update(i);
  }
}
/** 1:1 `void UNUSED TilemapUtil_SetSavedMap(u8 id, const void *tilemap)` (:9854). */
function TilemapUtil_SetSavedMap(id: number, tilemap: Uint16Array): void {
  if (id >= sNumTilemapUtilIds) return;
  sTilemapUtil[id].savedTilemap = tilemap;
  sTilemapUtil[id].active = true;
}
/** 1:1 `void TilemapUtil_DrawPrev(u8 id)` (:9931) — jamais appelé (savedTilemap NULL) ; copie le
 *  rect `prev` du savedTilemap (adressage altWidth, srcOffset en tiles). */
function TilemapUtil_DrawPrev(id: number): void {
  const e = sTilemapUtil[id];
  if (!e.savedTilemap) return;
  for (let i = 0; i < e.prev.height; i++) {
    const srcOffset = (e.prev.destY + i) * e.altWidth + e.prev.destX;
    CopyToBgTilemapBufferRect(e.bg, e.savedTilemap, srcOffset, e.prev.destX, e.prev.destY + i, e.prev.width, 1);
  }
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
// ─── UnkUtil Add/Run (:10004-10058) — « functionally unused » (décomp : les Add ne sont JAMAIS
// appelées → Run tourne à vide). Portées 1:1 pour la fermeture de l'oracle ; inertes. ──
/** 1:1 `bool8 UNUSED UnkUtil_CpuAdd(u8 *dest, u16 dLeft, dTop, const u8 *src, u16 sLeft, sTop, width, height, unkArg)` (:10004). */
function UnkUtil_CpuAdd(dest: Uint8Array, dLeft: number, dTop: number, src: Uint8Array, sLeft: number, sTop: number, width: number, height: number, unkArg: number): boolean {
  if (!sUnkUtil || sUnkUtil.numActive >= sUnkUtil.max) return false;
  const data = sUnkUtil.data![sUnkUtil.numActive++];
  data.size = width * 2;
  data.dest = dest.subarray(2 * (dTop * 32 + dLeft));
  data.src = src.subarray(2 * (sTop * unkArg + sLeft));
  data.height = height;
  data.unk = unkArg;
  data.func = UnkUtil_CpuRun;
  return true;
}
/** 1:1 `void UnkUtil_CpuRun(struct UnkUtilData *data)` (:10022) — functionally unused. */
function UnkUtil_CpuRun(data: UnkUtilData): void {
  let destOff = 0, srcOff = 0;
  for (let i = 0; i < data.height; i++) {
    if (data.src && data.dest) data.dest.set(data.src.subarray(srcOff, srcOff + data.size), destOff); // CpuCopy16
    destOff += 64; srcOff += data.unk * 2;
  }
}
/** 1:1 `bool8 UNUSED UnkUtil_DmaAdd(void *dest, u16 dLeft, dTop, width, height)` (:10034). */
function UnkUtil_DmaAdd(dest: Uint8Array, dLeft: number, dTop: number, width: number, height: number): boolean {
  if (!sUnkUtil || sUnkUtil.numActive >= sUnkUtil.max) return false;
  const data = sUnkUtil.data![sUnkUtil.numActive++];
  data.size = width * 2;
  data.dest = dest.subarray((dTop * 32 + dLeft) * 2);
  data.height = height;
  data.func = UnkUtil_DmaRun;
  return true;
}
/** 1:1 `void UnkUtil_DmaRun(struct UnkUtilData *data)` (:10050) — functionally unused. */
function UnkUtil_DmaRun(data: UnkUtilData): void {
  let destOff = 0;
  for (let i = 0; i < data.height; i++) {
    if (data.dest) data.dest.fill(0, destOff, destOff + data.size); // CpuFill16/Dma3FillLarge16_ (inerte)
    destOff += 64;
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

/** 1:1 décomp `void SetCurrentBox(u8 boxId)` (pokemon_storage_system.c:9412). */
function SetCurrentBox(boxId: number): void {
  if (boxId < TOTAL_BOXES_COUNT) GetPokemonStorage().currentBox = boxId;
}

/** 1:1 décomp `struct BoxPokemon *GetBoxedMonPtr(u8 boxId, u8 boxPosition)`
 *  (pokemon_storage_system.c:9450) : `&gPokemonStoragePtr->boxes[boxId][boxPosition]`.
 *  Nos slots = Pokemon | null (modèle unifié Pokemon == BoxPokemon). */
export function GetBoxedMonPtr(boxId: number, boxPosition: number) {
  return GetPokemonStorage().boxes[boxId]?.[boxPosition] ?? null;
}

// pokemon_storage.c :9392-9640 — accesseurs box data (modèle unifié : boxes[id][pos] =
// Pokemon|null ; GetBoxMonData(mon,req) = GetMonData ; slot vide = null).
/** 1:1 `void UNUSED BackupPokemonStorage(void)` (:9392) — corps vide (leftover FRLG). */
function BackupPokemonStorage(): void { /* //*dest = *gPokemonStoragePtr; */ }
/** 1:1 `void UNUSED RestorePokemonStorage(void)` (:9398) — corps vide (leftover FRLG). */
function RestorePokemonStorage(): void { /* //*gPokemonStoragePtr = *src; */ }
/** 1:1 `u32 GetBoxMonDataAt(u8 boxId, u8 boxPosition, s32 request)` (:9415). */
function GetBoxMonDataAt(boxId: number, boxPosition: number, request: number): number {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const mon = _boxMonAt(boxId, boxPosition);
    return mon ? (GetMonData(mon as never, request) as number) : 0;
  }
  return 0;
}
/** 1:1 `void SetBoxMonDataAt(u8 boxId, u8 boxPosition, s32 request, const void *value)` (:9423). */
function SetBoxMonDataAt(boxId: number, boxPosition: number, request: number, value: unknown): void {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const mon = _boxMonAt(boxId, boxPosition);
    if (mon) SetMonData(mon as never, request, value as never);
  }
}
/** 1:1 `u32 GetCurrentBoxMonData(u8 boxPosition, s32 request)` (:9429). */
function GetCurrentBoxMonData(boxPosition: number, request: number): number {
  return GetBoxMonDataAt(StorageGetCurrentBox(), boxPosition, request);
}
/** 1:1 `void SetCurrentBoxMonData(u8 boxPosition, s32 request, const void *value)` (:9434). */
function SetCurrentBoxMonData(boxPosition: number, request: number, value: unknown): void {
  SetBoxMonDataAt(StorageGetCurrentBox(), boxPosition, request, value);
}
/** 1:1 pokemon.c `GetBoxMonData(&boxMon, req)` sur notre modèle unifié (mon objet | null). */
function GetBoxMonData(mon: Pokemon | null, field: number): number {
  return mon ? (GetMonData(mon as never, field) as number) : 0;
}
/** 1:1 `void GetBoxMonNickAt(u8 boxId, u8 boxPosition, u8 *dst)` (:9439) — nick = string (JS). */
function GetBoxMonNickAt(boxId: number, boxPosition: number): string {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const mon = _boxMonAt(boxId, boxPosition);
    return mon ? (mon.nickname ?? '') : '';
  }
  return '';
}
/** 1:1 `u32 GetBoxMonLevelAt(u8 boxId, u8 boxPosition)` (:9447). */
function GetBoxMonLevelAt(boxId: number, boxPosition: number): number {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const mon = _boxMonAt(boxId, boxPosition);
    if (mon && GetMonData(mon as never, MON_DATA_SANITY_HAS_SPECIES)) return GetLevelFromBoxMonExp(mon as never);
  }
  return 0;
}
/** 1:1 `u32 GetAndCopyBoxMonDataAt(u8 boxId, u8 boxPosition, s32 request, void *dst)` (:9467). */
function GetAndCopyBoxMonDataAt(boxId: number, boxPosition: number, request: number, dst: unknown): number {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const mon = _boxMonAt(boxId, boxPosition);
    return mon ? (GetMonData(mon as never, request, dst as never) as number) : 0;
  }
  return 0;
}
/** 1:1 `void SetBoxMonAt(u8 boxId, u8 boxPosition, struct BoxPokemon *src)` (:9475). */
function SetBoxMonAt(boxId: number, boxPosition: number, src: Pokemon): void {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const box = GetPokemonStorage().boxes[boxId];
    if (box) box[boxPosition] = src; // *src
  }
}
/** 1:1 `void CopyBoxMonAt(u8 boxId, u8 boxPosition, struct BoxPokemon *dst)` (:9481). */
function CopyBoxMonAt(boxId: number, boxPosition: number, dst: Pokemon): void {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const mon = _boxMonAt(boxId, boxPosition);
    if (mon) CopyMon(dst, mon); // *dst = boxMon
  }
}
/** 1:1 `void CreateBoxMonAt(u8 boxId, u8 boxPosition, u16 species, u8 level, u8 fixedIV,
 *  u8 hasFixedPersonality, u32 personality, u8 otIDType, u32 otID)` (:9487). */
function CreateBoxMonAt(boxId: number, boxPosition: number, species: number, level: number,
  fixedIV: number, hasFixedPersonality: number, personality: number, otIDType: number, otID: number): void {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const box = GetPokemonStorage().boxes[boxId];
    if (box) {
      const mon = {} as Pokemon;
      CreateBoxMon(mon as never, species, level, fixedIV, (hasFixedPersonality !== 0) as never, personality, otIDType as never, otID);
      box[boxPosition] = mon;
    }
  }
}
/** 1:1 `void ZeroBoxMonAt(u8 boxId, u8 boxPosition)` (:9500) — slot vide = null (notre modèle). */
function ZeroBoxMonAt(boxId: number, boxPosition: number): void {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const box = GetPokemonStorage().boxes[boxId];
    if (box) box[boxPosition] = null;
  }
}
/** 1:1 `void BoxMonAtToMon(u8 boxId, u8 boxPosition, struct Pokemon *dst)` (:9506). */
function BoxMonAtToMon(boxId: number, boxPosition: number, dst: Pokemon): void {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const mon = _boxMonAt(boxId, boxPosition);
    if (mon) BoxMonToMon(mon as never, dst as never);
  }
}
/** 1:1 `s16 AdvanceStorageMonIndex(struct BoxPokemon *boxMons, u8 currIndex, u8 maxIndex, u8 mode)`
 *  (:9543) — prochain mon (résumé) : mode 0/1 avant, 2/3 arrière ; 1/3 inclut œufs. */
function AdvanceStorageMonIndex(boxMons: (Pokemon | null)[], currIndex: number, maxIndex: number, mode: number): number {
  const direction = (mode === 0 || mode === 1) ? 1 : -1;
  if (mode === 1 || mode === 3) {
    for (let i = ((currIndex << 24) >> 24) + direction; i >= 0 && i <= maxIndex; i += direction) {
      if (GetBoxMonData(boxMons[i], MON_DATA_SPECIES) !== SPECIES_NONE) return i;
    }
  } else {
    for (let i = ((currIndex << 24) >> 24) + direction; i >= 0 && i <= maxIndex; i += direction) {
      if (GetBoxMonData(boxMons[i], MON_DATA_SPECIES) !== SPECIES_NONE
        && !GetBoxMonData(boxMons[i], MON_DATA_IS_EGG)) return i;
    }
  }
  return -1;
}
/** 1:1 `bool32 CheckBoxMonSanityAt(u32 boxId, u32 boxPosition)` (:9588). */
function CheckBoxMonSanityAt(boxId: number, boxPosition: number): boolean {
  if (boxId < TOTAL_BOXES_COUNT && boxPosition < IN_BOX_COUNT) {
    const mon = _boxMonAt(boxId, boxPosition);
    return !!(mon && GetMonData(mon as never, MON_DATA_SANITY_HAS_SPECIES)
      && !GetMonData(mon as never, MON_DATA_SANITY_IS_EGG)
      && !GetMonData(mon as never, MON_DATA_SANITY_IS_BAD_EGG));
  }
  return false;
}
/** 1:1 `u32 CountAllStorageMons(void)` (:9618) — compte mons + œufs de toutes les boîtes. */
function CountAllStorageMons(): number {
  const boxes = GetPokemonStorage().boxes;
  let count = 0;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const mon = boxes[i]?.[j];
      if (mon && (GetMonData(mon as never, MON_DATA_SANITY_HAS_SPECIES) || GetMonData(mon as never, MON_DATA_SANITY_IS_EGG))) count++;
    }
  }
  return count;
}
/** 1:1 `u8 CountPartyNonEggMons(void)` (:1424). */
function CountPartyNonEggMons(): number {
  let count = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (GetMonData(gPlayerParty[i], MON_DATA_SPECIES) !== SPECIES_NONE && !GetMonData(gPlayerParty[i], MON_DATA_IS_EGG)) count++;
  }
  return count;
}
/** 1:1 `u8 CountPartyMons(void)` (:1463). */
function CountPartyMons(): number {
  let count = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (GetMonData(gPlayerParty[i], MON_DATA_SPECIES) !== SPECIES_NONE) count++;
  }
  return count;
}
/** 1:1 `u8 *StringCopyAndFillWithSpaces(u8 *dst, const u8 *src, u16 n)` (:1478) — copie src puis
 *  remplit d'espaces (CHAR_SPACE) jusqu'à n, termine EOS. Chaînes = number[] (charCodes). */
function StringCopyAndFillWithSpaces(dst: number[], src: number[], n: number): number[] {
  let i = 0;
  for (; i < src.length && src[i] !== EOS; i++) dst[i] = src[i]; // StringCopy
  for (; i < n; i++) dst[i] = CHAR_SPACE;
  dst[i] = EOS;
  return dst;
}
// ─── 3 fns UNUSED (:1374/1489/1504, jamais appelées) — signatures 1:1, corps inertes. ──
/** 1:1 `void UNUSED UnusedDrawTextWindow(...)` (:1374) — rendait un texte dans un window
 *  temporaire et copiait ses tiles dans dst. UNUSED (aucun site) → inerte. */
function UnusedDrawTextWindow(_string: number[], _dst: Uint8Array, _offset: number, _bgColor: number, _fgColor: number, _shadowColor: number): void { /* UNUSED */ }
/** 1:1 `void UNUSED UnusedWriteRectCpu(u16 *dest, dest_left, dest_top, const u16 *src, src_left,
 *  src_top, dest_width, dest_height, src_width)` (:1489) — copie rect (comme UnkUtil_CpuRun). */
function UnusedWriteRectCpu(dest: Uint16Array, destLeft: number, destTop: number, src: Uint16Array, srcLeft: number, srcTop: number, destWidth: number, destHeight: number, srcWidth: number): void {
  destWidth *= 1; // (décomp *2 en bytes ; nous en tiles u16 → largeur en tiles)
  let d = destTop * 0x20 + destLeft, s = srcTop * srcWidth + srcLeft;
  for (let i = 0; i < destHeight; i++) {
    dest.set(src.subarray(s, s + destWidth), d);
    d += 0x20; s += srcWidth;
  }
}
/** 1:1 `void UNUSED UnusedWriteRectDma(u16 *dest, dest_left, dest_top, width, height)` (:1504). */
function UnusedWriteRectDma(dest: Uint16Array, destLeft: number, destTop: number, width: number, height: number): void {
  let d = destTop * 0x20 + destLeft;
  for (let i = 0; i < height; d += 0x20, i++) dest.fill(0, d, d + width);
}
// ─── Refcount des tiles d'icônes de boîte (:5090-5169). iconSpeciesList/numIconsPerSpecies
// dans sStorage. Adaptation : le CHARGEMENT VRAM (CpuCopy32 GetMonIconTiles → OBJ_VRAM) se fait
// via LoadSpriteSheet dans CreateMonIconSprite (pokemon_icon.ts) ; ici on gère la liste + l'offset.
/** 1:1 `u16 TryLoadMonIconTiles(u16 species)` (:5090) — ajoute species à la liste (refcount),
 *  renvoie l'offset tile (16*i) ou 0xFFFF si liste pleine. */
function TryLoadMonIconTiles(species: number): number {
  const s = sStorage!;
  let i: number;
  for (i = 0; i < MAX_MON_ICONS; i++) if (s.iconSpeciesList[i] === species) break;
  if (i === MAX_MON_ICONS) {
    for (i = 0; i < MAX_MON_ICONS; i++) if (s.iconSpeciesList[i] === 0) break;
    if (i === MAX_MON_ICONS) return 0xFFFF;
  }
  s.iconSpeciesList[i] = species;
  s.numIconsPerSpecies[i]++;
  const offset = 16 * i;
  // décomp : CpuCopy32(GetMonIconTiles(species, TRUE), OBJ_VRAM0 + offset*TILE_SIZE_4BPP, 0x200)
  // — chez nous le sheet est chargé par LoadSpriteSheet (CreateMonIconSprite).
  return offset;
}
/** 1:1 `void RemoveSpeciesFromIconList(u16 species)` (:5125) — décrémente le refcount, retire
 *  species de la liste si plus aucune icône. */
function RemoveSpeciesFromIconList(species: number): void {
  const s = sStorage!;
  for (let i = 0; i < MAX_MON_ICONS; i++) {
    if (s.iconSpeciesList[i] === species) {
      if (--s.numIconsPerSpecies[i] === 0) s.iconSpeciesList[i] = SPECIES_NONE;
      break;
    }
  }
}
/** 1:1 `void DestroyBoxMonIcon(struct Sprite *sprite)` (:5165) — retire species de la liste + détruit
 *  le sprite (data[0] = species, posé par CreateMonIconSprite). */
function DestroyBoxMonIcon(spriteId: number): void {
  const spr = _spr(spriteId);
  if (spr) RemoveSpeciesFromIconList(spr.data[0]);
  DestroySprite(spriteId);
}
/** 1:1 `void RefreshDisplayMon(void)` (:6348) — wrapper de TryRefreshDisplayMon. */
function RefreshDisplayMon(): void { TryRefreshDisplayMon(); }
/** 1:1 `u8 UNUSED GetMovingMonOriginalBoxId(void)` (:7893). */
function GetMovingMonOriginalBoxId(): number { return sMovingMonOrigBoxId; }
/** 1:1 `s16 UNUSED StorageSystemGetNextMonIndex(struct BoxPokemon *box, s8 startIdx, u8 stopIdx,
 *  u8 mode)` (:1698) — comme AdvanceStorageMonIndex sur un array box. UNUSED. */
function StorageSystemGetNextMonIndex(box: (Pokemon | null)[], startIdx: number, stopIdx: number, mode: number): number {
  const direction = (mode === 0 || mode === 1) ? 1 : -1;
  if (mode === 1 || mode === 3) {
    for (let i = startIdx + direction; i >= 0 && i <= stopIdx; i += direction) {
      if (GetBoxMonData(box[i], MON_DATA_SPECIES) !== 0) return i;
    }
  } else {
    for (let i = startIdx + direction; i >= 0 && i <= stopIdx; i += direction) {
      if (GetBoxMonData(box[i], MON_DATA_SPECIES) !== 0 && !GetBoxMonData(box[i], MON_DATA_IS_EGG)) return i;
    }
  }
  return -1;
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
const MON_DATA_HELD_ITEM = 22;  // 1:1 include/constants/pokemon.h (= battle-setup-helpers.ts)
const PALETTES_ALL = 0xFFFFFFFF;
const RGB_BLACK = 0x0000;

/** IDENTITÉ (2026-07-07) : le compositor actuel (harness/gba/compositor.ts:164-176) trie déjà les OBJ
 *  par `subpriority | (oam.priority << 8)` ASC = BASSE subpriority DEVANT, comme le HW GBA. Le vieux
 *  `31 − n` (vestige d'un `buildOamBuffer` tri-par-Y « haute = devant » aujourd'hui disparu) INVERSAIT
 *  donc le Z-order (bug sonde live : main-curseur `_sub(6)`=25 PASSAIT DERRIÈRE les box mons `_sub(19)`=12).
 *  L'ombre était déjà passée en brut (:3957/:3965) ; on aligne tout l'écran sur la subpriority décomp
 *  DIRECTE (les valeurs passées à `_sub` SONT déjà les valeurs brutes du décomp). Cf. [[pitfall-pc-sub-wrapper-inverts-subpriority]]. */
function _sub(n: number): number { return n; }
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
  // Transition de sortie : Task_ChangeScreen a appelé FreePokeStorageData (sStorage=null) puis SetMainCallback2.
  // Le décomp fait aussi RunTasks→AnimateSprites : sur GBA, les SpriteCB lisant sStorage->… déréférencent NULL
  // = garbage lu sans faute (pas de MMU), sprite détruit au frame suivant → invisible. Notre moteur JS strict
  // crasherait (TypeError dans SpriteCB_CursorShadow). On skip le rendu de ce frame mourant : 1:1 visuel.
  if (!sStorage) return;
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
/** 1:1 décomp `SaveMovingMon` (:6681) — sauve le mon en main avant un écran externe. */
function SaveMovingMon(): void {
  if (sIsMonBeingMoved) sSavedMovingMon = sStorage!.movingMon;
}
/** 1:1 décomp `LoadSavedMovingMon` (:6687) — restaure le mon en main au retour.
 *  Modèle unifié (movingMon = Pokemon) → box vs party = même struct copiée. */
function LoadSavedMovingMon(): void {
  if (sIsMonBeingMoved && sSavedMovingMon) sStorage!.movingMon = sSavedMovingMon;
}
/** 1:1 décomp `SetSelectionAfterSummaryScreen` (:6726) — replace le curseur sur le
 *  dernier mon vu dans le RÉSUMÉ (`gLastViewedMonIndex`), ou restaure le mon en main. */
function SetSelectionAfterSummaryScreen(): void {
  if (sIsMonBeingMoved) LoadSavedMovingMon();
  else sCursorPosition = GetSummaryLastMonIndex();  // = gLastViewedMonIndex
}
// :3773 GiveChosenBagItem — au retour du sac (mode PCBOX), donne l'objet choisi au mon du curseur.
function GiveChosenBagItem(): void {
  const itemId = gSpecialVar.ItemId;
  if (itemId !== 0 /* ITEM_NONE */) {
    const pos = GetCursorPosition();
    if (sInPartyMenu) SetMonData(gPlayerParty[pos] as Pokemon, MON_DATA_HELD_ITEM, itemId);
    else {
      // SetCurrentBoxMonData(pos, MON_DATA_HELD_ITEM, itemId) — accès direct au box mon (pattern :1448).
      const bm = GetBoxedMonPtr(StorageGetCurrentBox(), pos) as unknown as { heldItem?: number } | null;
      if (bm) bm.heldItem = itemId;
    }
    RemoveBagItem(getItemKeyById(itemId), 1);  // RemoveBagItem attend une CLÉ (pas un ID)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DÉPLACER OBJETS (OPTION_MOVE_ITEMS) — item icons (:8636-9378). Sprites d'objets
// tenus animés en affine (prise/dépose), swap, retour au sac + fenêtre d'infos.
// ═══════════════════════════════════════════════════════════════════════════

// sItemInfoFrame_Gfx (graphics/pokemon_storage/item_info_frame.png) — chargé async (asset).
let _itemInfoFrameGfx: Uint8Array | null = null;
let _itemInfoLoadTried = false;
function _loadItemInfoFrameGfx(): void {
  if (_itemInfoLoadTried) return;
  _itemInfoLoadTried = true;
  (async () => { _itemInfoFrameGfx = (await loadIndexedPngStrict('/decomp/em/pokemon_storage/item_info_frame.png', 4)).charData; })()
    .catch((e) => console.warn('[pc-storage] item_info_frame.png absent :', e));
}

// Affine anims item icon (mon_storage.c:8655-8713). AFFINEANIMCMD_FRAME(xScale,yScale,rot,dur).
registerAffineAnim('sAffineAnim_ItemIcon_Small', { frames: [{ xScale: 128, yScale: 128, rotation: 0, duration: 0 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_ItemIcon_Appear', { frames: [{ xScale: 88, yScale: 88, rotation: 0, duration: 0 }, { xScale: 5, yScale: 5, rotation: 0, duration: 8 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_ItemIcon_Disappear', { frames: [{ xScale: 128, yScale: 128, rotation: 0, duration: 0 }, { xScale: -5, yScale: -5, rotation: 0, duration: 8 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_ItemIcon_PickUp', { frames: [{ xScale: 128, yScale: 128, rotation: 0, duration: 0 }, { xScale: 10, yScale: 10, rotation: 0, duration: 12 }, { xScale: 256, yScale: 256, rotation: 0, duration: 0 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_ItemIcon_PutDown', { frames: [{ xScale: 256, yScale: 256, rotation: 0, duration: 0 }, { xScale: -10, yScale: -10, rotation: 0, duration: 12 }, { xScale: 128, yScale: 128, rotation: 0, duration: 0 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_ItemIcon_PutAway', { frames: [{ xScale: 256, yScale: 256, rotation: 0, duration: 0 }, { xScale: -5, yScale: -5, rotation: 0, duration: 16 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_ItemIcon_Large', { frames: [{ xScale: 256, yScale: 256, rotation: 0, duration: 0 }], terminator: 'END' });
registerAffineAnimTable('sAffineAnims_ItemIcon', { affineAnims: [
  'sAffineAnim_ItemIcon_Small', 'sAffineAnim_ItemIcon_Appear', 'sAffineAnim_ItemIcon_Disappear',
  'sAffineAnim_ItemIcon_PickUp', 'sAffineAnim_ItemIcon_PutDown', 'sAffineAnim_ItemIcon_PutAway',
  'sAffineAnim_ItemIcon_Large',
] });

// sOamData_ItemIcon (:8638) : 32×32 affine.
const sOamData_ItemIcon = { shape: 0 as const, size: 2 as const, priority: 1 };

/** Accès au sprite runtime d'un item icon par son id (0..MAX_ITEM_ICONS). */
function _itemIconSpr(id: number) {
  const rt = getRuntime(); const s = sStorage;
  if (!rt || !s || id >= MAX_ITEM_ICONS) return null;
  return s.itemIcons[id].sprite >= 0 ? rt.gSprites[s.itemIcons[id].sprite] : null;
}

/** 1:1 `static void CreateItemIconSprites(void)` (:8726). 3 sprites 32×32 invisibles. */
function CreateItemIconSprites(): void {
  const rt = getRuntime(); const s = sStorage; if (!rt || !s) return;
  if (s.boxOption === OPTION_MOVE_ITEMS) {
    for (let i = 0; i < MAX_ITEM_ICONS; i++) {
      // LoadCompressedSpriteSheet(sItemIconGfxBuffer, 0x200, tag) : tiles réels posés par LoadItemIconGfx.
      LoadSpriteSheet({ data: new Uint8Array(0x200), size: 0x200, tag: GFXTAG_ITEM_ICON_0 + i });
      const palIndex = AllocSpritePalette(PALTAG_ITEM_ICON_0 + i);
      s.itemIcons[i].palIndex = OBJ_PLTT_ID(palIndex);
      const spriteId = CreateSprite({
        tileTag: GFXTAG_ITEM_ICON_0 + i, paletteTag: PALTAG_ITEM_ICON_0 + i,
        oam: sOamData_ItemIcon, anims: null, callback: SpriteCallbackDummy as never,
      }, 0, 0, 11);
      s.itemIcons[i].sprite = spriteId;
      const spr = _itemIconSpr(i);
      if (spr) {
        (spr as { affineAnimsTableName?: string }).affineAnimsTableName = 'sAffineAnims_ItemIcon';
        rt.gba.oam[spr.oamIndex].affineMode = 1;   // ST_OAM_AFFINE_NORMAL
        spr.invisible = true;
      }
      s.itemIcons[i].active = false;
    }
  }
  s.movingItemId = ITEM_NONE;
}

/** 1:1 `static u8 GetNewItemIconIdx(void)` (:8997). */
function GetNewItemIconIdx(): number {
  const s = sStorage!;
  for (let i = 0; i < MAX_ITEM_ICONS; i++) {
    if (!s.itemIcons[i].active) { s.itemIcons[i].active = true; return i; }
  }
  return MAX_ITEM_ICONS;
}

/** 1:1 `static bool32 IsItemIconAtPosition(u8, u8)` (:9012). */
function IsItemIconAtPosition(cursorArea: number, cursorPos: number): boolean {
  const s = sStorage!;
  for (let i = 0; i < MAX_ITEM_ICONS; i++)
    if (s.itemIcons[i].active && s.itemIcons[i].area === cursorArea && s.itemIcons[i].pos === cursorPos) return true;
  return false;
}

/** 1:1 `static u8 GetItemIconIdxByPosition(u8, u8)` (:9026). */
function GetItemIconIdxByPosition(cursorArea: number, cursorPos: number): number {
  const s = sStorage!;
  for (let i = 0; i < MAX_ITEM_ICONS; i++)
    if (s.itemIcons[i].active && s.itemIcons[i].area === cursorArea && s.itemIcons[i].pos === cursorPos) return i;
  return MAX_ITEM_ICONS;
}

/** 1:1 `static u8 GetItemIconIdxBySprite(struct Sprite *)` (:9040) — via oamIndex. */
function GetItemIconIdxBySprite(oamIndex: number): number {
  const rt = getRuntime(); const s = sStorage!;
  for (let i = 0; i < MAX_ITEM_ICONS; i++) {
    const spr = _itemIconSpr(i);
    if (s.itemIcons[i].active && spr && rt && spr === rt.gSprites[s.itemIcons[i].sprite] && spr.oamIndex === oamIndex) return i;
  }
  return MAX_ITEM_ICONS;
}

/** 1:1 `static void SetItemIconPosition(u8, u8, u8)` (:9053). */
function SetItemIconPosition(id: number, cursorArea: number, cursorPos: number): void {
  const rt = getRuntime(); const s = sStorage!;
  if (id >= MAX_ITEM_ICONS) return;
  const spr = _itemIconSpr(id);
  if (spr) {
    if (cursorArea === CURSOR_AREA_IN_BOX) {
      const x = cursorPos % IN_BOX_COLUMNS, y = Math.floor(cursorPos / IN_BOX_COLUMNS);
      spr.x = (24 * x) + 112; spr.y = (24 * y) + 56;
      if (rt) rt.gba.oam[spr.oamIndex].priority = 2;
    } else if (cursorArea === CURSOR_AREA_IN_PARTY) {
      if (cursorPos === 0) { spr.x = 116; spr.y = 76; }
      else { spr.x = 164; spr.y = 24 * (cursorPos - 1) + 28; }
      if (rt) rt.gba.oam[spr.oamIndex].priority = 1;
    }
  }
  s.itemIcons[id].area = cursorArea;
  s.itemIcons[id].pos = cursorPos;
}

/** 1:1 `static void LoadItemIconGfx(u8, const u32 *, const u32 *)` (:9088). Écrit tiles+pal en OBJ VRAM. */
function LoadItemIconGfx(id: number, itemTiles: Uint8Array | null, itemPal: Uint16Array | null): void {
  const rt = getRuntime(); const s = sStorage!;
  if (id >= MAX_ITEM_ICONS || !rt) return;
  // 1:1 décomp:9095-9100 — les tiles item icon sont 24×24 (3 rangées de 3 tuiles = 3×0x60).
  // Le décomp les RÉORGANISE dans un buffer 32×32 (3 rangées à l'offset i*0x80, la 4e vide =
  // padding) via `CpuFastCopy(&tileBuffer[i*0x60], &itemIconBuffer[i*0x80], 0x60)`. C'est
  // exactement `CopyItemIconPicTo4x4Buffer` (item_icon.ts:110 = ce que fait le SAC). La copie
  // directe (buf.set) désalignait les tuiles → icône corrompue « violette » (queue glitchée).
  const buf = new Uint8Array(0x200);
  if (itemTiles) for (let i = 0; i < 3; i++) buf.set(itemTiles.subarray(i * 0x60, i * 0x60 + 0x60), i * 0x80);
  const tileStart = GetSpriteTileStartByTag(GFXTAG_ITEM_ICON_0 + id);
  if (tileStart >= 0) (rt as { _writeToObjVram?: (d: Uint8Array, o: number) => void })._writeToObjVram?.(buf, tileStart * TILE_SIZE_4BPP);
  if (itemPal) LoadPalette(itemPal, s.itemIcons[id].palIndex, 0x20);
}

/** 1:1 `static void SetItemIconAffineAnim(u8, u8)` (:9105). */
function SetItemIconAffineAnim(id: number, animNum: number): void {
  const rt = getRuntime(); const s = sStorage!;
  if (id >= MAX_ITEM_ICONS || !rt) return;
  rt.StartSpriteAffineAnim?.(s.itemIcons[id].sprite, animNum);
}

/** 1:1 `static void SetItemIconActive(u8, bool8)` (:9160). */
function SetItemIconActive(id: number, active: boolean): void {
  const s = sStorage!;
  if (id >= MAX_ITEM_ICONS) return;
  s.itemIcons[id].active = active;
  const spr = _itemIconSpr(id);
  if (spr) spr.invisible = !active;
}

/** 1:1 `static const u32 *GetItemIconPic(u16)` / `GetItemIconPalette(u16)` (:9169/:9174). */
function GetItemIconPic(itemId: number): Uint8Array | null { return GetItemIconPicById(itemId); }
function GetItemIconPalette(itemId: number): Uint16Array | null { return GetItemIconPaletteById(itemId); }

/** 1:1 `static bool8 IsItemIconAnimActive(void)` (:8952). */
function IsItemIconAnimActive(): boolean {
  const s = sStorage!;
  for (let i = 0; i < MAX_ITEM_ICONS; i++) {
    if (s.itemIcons[i].active) {
      const spr = _itemIconSpr(i);
      if (!spr) continue;
      const sp = spr as { affineAnimEnded?: boolean; affineAnimBeginning?: boolean; callback?: unknown };
      if (!sp.affineAnimEnded && sp.affineAnimBeginning) return true;
      if (spr.callback !== SpriteCallbackDummy && spr.callback !== (SpriteCB_ItemIcon_SetPosToCursor as never)) return true;
    }
  }
  return false;
}

/** 1:1 `static bool8 IsMovingItem(void)` (:8971). */
function IsMovingItem(): boolean {
  const s = sStorage!;
  if (s.boxOption === OPTION_MOVE_ITEMS) {
    for (let i = 0; i < MAX_ITEM_ICONS; i++)
      if (s.itemIcons[i].active && s.itemIcons[i].area === CURSOR_AREA_IN_HAND) return true;
  }
  return false;
}

/** 1:1 `static u16 GetMovingItemId(void)` (:8992). */
function GetMovingItemId(): number { return sStorage!.movingItemId; }
/** 1:1 `static const u8 *GetMovingItemName(void)` (:8987). */
function GetMovingItemName(): string { return GetItemName(sStorage!.movingItemId); }

// sItemIconId/sState = data[0], sCursorArea = data[6], sCursorPos = data[7] (#define décomp :9113).
type ItemIconSprite = { data: number[]; x: number; y: number; x2: number; y2: number; oamIndex: number; affineAnimEnded?: boolean; callback: unknown };

/** 1:1 `static void SetItemIconCallback(u8, u8, u8, u8)` (:9118). */
function SetItemIconCallback(id: number, callbackId: number, cursorArea: number, cursorPos: number): void {
  if (id >= MAX_ITEM_ICONS) return;
  const spr = _itemIconSpr(id) as ItemIconSprite | null; if (!spr) return;
  switch (callbackId) {
    case ITEM_CB_WAIT_ANIM: spr.data[0] = id; spr.callback = SpriteCB_ItemIcon_WaitAnim; break;
    case ITEM_CB_TO_HAND: spr.data[0] = 0; spr.callback = SpriteCB_ItemIcon_ToHand; break;
    case ITEM_CB_TO_MON: spr.data[0] = 0; spr.data[6] = cursorArea; spr.data[7] = cursorPos; spr.callback = SpriteCB_ItemIcon_ToMon; break;
    case ITEM_CB_SWAP_TO_HAND: spr.data[0] = 0; spr.callback = SpriteCB_ItemIcon_SwapToHand; spr.data[6] = cursorArea; spr.data[7] = cursorPos; break;
    case ITEM_CB_SWAP_TO_MON: spr.data[0] = 0; spr.data[6] = cursorArea; spr.data[7] = cursorPos; spr.callback = SpriteCB_ItemIcon_SwapToMon; break;
    case ITEM_CB_HIDE_PARTY: spr.callback = SpriteCB_ItemIcon_HideParty; break;
  }
}

/** 1:1 `static void SpriteCB_ItemIcon_WaitAnim(struct Sprite *)` (:9253). */
function SpriteCB_ItemIcon_WaitAnim(sprite: ItemIconSprite): void {
  if (sprite.affineAnimEnded) { SetItemIconActive(sprite.data[0], false); sprite.callback = SpriteCallbackDummy; }
}

/** 1:1 `static void SpriteCB_ItemIcon_SetPosToCursor(struct Sprite *)` (:9284). */
function SpriteCB_ItemIcon_SetPosToCursor(sprite: ItemIconSprite): void {
  const rt = getRuntime(); const s = sStorage!;
  const cur = rt && s.cursorSprite >= 0 ? rt.gSprites[s.cursorSprite] : null;
  if (cur) {
    sprite.x = cur.x + 4;
    sprite.y = cur.y + (cur as { y2?: number }).y2! + 8;
    if (rt) rt.gba.oam[sprite.oamIndex].priority = rt.gba.oam[cur.oamIndex].priority;
  }
}

/** 1:1 `static void SpriteCB_ItemIcon_ToHand(struct Sprite *)` (:9262). */
function SpriteCB_ItemIcon_ToHand(sprite: ItemIconSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[1] = sprite.x << 4; sprite.data[2] = sprite.y << 4;
      sprite.data[3] = 10; sprite.data[4] = 21; sprite.data[5] = 0;
      sprite.data[0]++;
      // fallthrough
    case 1:
      sprite.data[1] -= sprite.data[3]; sprite.data[2] -= sprite.data[4];
      sprite.x = sprite.data[1] >> 4; sprite.y = sprite.data[2] >> 4;
      if (++sprite.data[5] > 11) sprite.callback = SpriteCB_ItemIcon_SetPosToCursor;
      break;
  }
}

/** 1:1 `static void SpriteCB_ItemIcon_ToMon(struct Sprite *)` (:9291). */
function SpriteCB_ItemIcon_ToMon(sprite: ItemIconSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[1] = sprite.x << 4; sprite.data[2] = sprite.y << 4;
      sprite.data[3] = 10; sprite.data[4] = 21; sprite.data[5] = 0;
      sprite.data[0]++;
      // fallthrough
    case 1:
      sprite.data[1] += sprite.data[3]; sprite.data[2] += sprite.data[4];
      sprite.x = sprite.data[1] >> 4; sprite.y = sprite.data[2] >> 4;
      if (++sprite.data[5] > 11) {
        SetItemIconPosition(GetItemIconIdxBySprite(sprite.oamIndex), sprite.data[6], sprite.data[7]);
        sprite.callback = SpriteCallbackDummy;
      }
      break;
  }
}

/** 1:1 `static void SpriteCB_ItemIcon_SwapToHand(struct Sprite *)` (:9316). */
function SpriteCB_ItemIcon_SwapToHand(sprite: ItemIconSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[1] = sprite.x << 4; sprite.data[2] = sprite.y << 4;
      sprite.data[3] = 10; sprite.data[4] = 21; sprite.data[5] = 0;
      sprite.data[0]++;
      // fallthrough
    case 1:
      sprite.data[1] -= sprite.data[3]; sprite.data[2] -= sprite.data[4];
      sprite.x = sprite.data[1] >> 4; sprite.y = sprite.data[2] >> 4;
      sprite.x2 = gSineTable[sprite.data[5] * 8] >> 4;
      if (++sprite.data[5] > 11) {
        SetItemIconPosition(GetItemIconIdxBySprite(sprite.oamIndex), sprite.data[6], sprite.data[7]);
        sprite.x2 = 0;
        sprite.callback = SpriteCB_ItemIcon_SetPosToCursor;
      }
      break;
  }
}

/** 1:1 `static void SpriteCB_ItemIcon_SwapToMon(struct Sprite *)` (:9343). */
function SpriteCB_ItemIcon_SwapToMon(sprite: ItemIconSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[1] = sprite.x << 4; sprite.data[2] = sprite.y << 4;
      sprite.data[3] = 10; sprite.data[4] = 21; sprite.data[5] = 0;
      sprite.data[0]++;
      // fallthrough
    case 1:
      sprite.data[1] += sprite.data[3]; sprite.data[2] += sprite.data[4];
      sprite.x = sprite.data[1] >> 4; sprite.y = sprite.data[2] >> 4;
      sprite.x2 = -(gSineTable[sprite.data[5] * 8] >> 4);
      if (++sprite.data[5] > 11) {
        SetItemIconPosition(GetItemIconIdxBySprite(sprite.oamIndex), sprite.data[6], sprite.data[7]);
        sprite.callback = SpriteCallbackDummy;
        sprite.x2 = 0;
      }
      break;
  }
}

/** 1:1 `static void SpriteCB_ItemIcon_HideParty(struct Sprite *)` (:9370). */
function SpriteCB_ItemIcon_HideParty(sprite: ItemIconSprite): void {
  sprite.y -= 8;
  if (sprite.y + sprite.y2 < -16) {
    sprite.callback = SpriteCallbackDummy;
    SetItemIconActive(GetItemIconIdxBySprite(sprite.oamIndex), false);
  }
}

// Accès held item du mon pointé (modèle unifié : champ direct .heldItem).
function _getHeldItem(cursorArea: number, cursorPos: number): number {
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    const bm = GetBoxedMonPtr(StorageGetCurrentBox(), cursorPos) as unknown as { heldItem?: number } | null;
    return bm?.heldItem ?? ITEM_NONE;
  }
  return (gPlayerParty[cursorPos] as unknown as { heldItem?: number })?.heldItem ?? ITEM_NONE;
}
function _setHeldItem(cursorArea: number, cursorPos: number, itemId: number): void {
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    const bm = GetBoxedMonPtr(StorageGetCurrentBox(), cursorPos) as unknown as { heldItem?: number } | null;
    if (bm) bm.heldItem = itemId;
  } else {
    const m = gPlayerParty[cursorPos] as unknown as { heldItem?: number };
    if (m) m.heldItem = itemId;
  }
}

/** 1:1 `static void TryLoadItemIconAtPos(u8, u8)` (:8757). */
function TryLoadItemIconAtPos(cursorArea: number, cursorPos: number): void {
  const s = sStorage!;
  if (s.boxOption !== OPTION_MOVE_ITEMS) return;
  if (IsItemIconAtPosition(cursorArea, cursorPos)) return;
  let heldItem: number;
  if (cursorArea === CURSOR_AREA_IN_BOX) {
    const bm = GetBoxedMonPtr(StorageGetCurrentBox(), cursorPos) as unknown as { species?: number; heldItem?: number } | null;
    if (!bm || !bm.species) return;
    heldItem = bm.heldItem ?? ITEM_NONE;
  } else if (cursorArea === CURSOR_AREA_IN_PARTY) {
    if (cursorPos >= PARTY_SIZE || !GetMonData(gPlayerParty[cursorPos], MON_DATA_SANITY_HAS_SPECIES)) return;
    heldItem = (gPlayerParty[cursorPos] as unknown as { heldItem?: number }).heldItem ?? ITEM_NONE;
  } else return;
  if (heldItem !== ITEM_NONE) {
    const id = GetNewItemIconIdx();
    SetItemIconPosition(id, cursorArea, cursorPos);
    LoadItemIconGfx(id, GetItemIconPic(heldItem), GetItemIconPalette(heldItem));
    SetItemIconAffineAnim(id, ITEM_ANIM_APPEAR);
    SetItemIconActive(id, true);
  }
}

/** 1:1 `static void TryHideItemIconAtPos(u8, u8)` (:8797). */
function TryHideItemIconAtPos(cursorArea: number, cursorPos: number): void {
  const s = sStorage!;
  if (s.boxOption !== OPTION_MOVE_ITEMS) return;
  const id = GetItemIconIdxByPosition(cursorArea, cursorPos);
  SetItemIconAffineAnim(id, ITEM_ANIM_DISAPPEAR);
  SetItemIconCallback(id, ITEM_CB_WAIT_ANIM, cursorArea, cursorPos);
}

/** 1:1 `static void TryHideItemAtCursor(void)` (:7903). */
function TryHideItemAtCursor(): void {
  if (sCursorArea === CURSOR_AREA_IN_BOX) TryHideItemIconAtPos(CURSOR_AREA_IN_BOX, sCursorPosition);
}
/** 1:1 `static void TryShowItemAtCursor(void)` (:7909). */
function TryShowItemAtCursor(): void {
  if (sCursorArea === CURSOR_AREA_IN_BOX) TryLoadItemIconAtPos(CURSOR_AREA_IN_BOX, sCursorPosition);
}

/** 1:1 `static void TakeItemFromMon(u8, u8)` (:8809). */
function TakeItemFromMon(cursorArea: number, cursorPos: number): void {
  const s = sStorage!;
  if (s.boxOption !== OPTION_MOVE_ITEMS) return;
  const id = GetItemIconIdxByPosition(cursorArea, cursorPos);
  SetItemIconAffineAnim(id, ITEM_ANIM_PICK_UP);
  SetItemIconCallback(id, ITEM_CB_TO_HAND, cursorArea, cursorPos);
  SetItemIconPosition(id, CURSOR_AREA_IN_HAND, 0);
  _setHeldItem(cursorArea, cursorPos, ITEM_NONE);
  if (cursorArea === CURSOR_AREA_IN_BOX) SetBoxMonIconObjMode(cursorPos, 1 /* ST_OAM_OBJ_BLEND */);
  else SetPartyMonIconObjMode(cursorPos, 1);
  s.movingItemId = s.displayMonItemId;
}

/** 1:1 `static void InitItemIconInCursor(u16)` (:8836). */
function InitItemIconInCursor(itemId: number): void {
  const s = sStorage!;
  const id = GetNewItemIconIdx();
  LoadItemIconGfx(id, GetItemIconPic(itemId), GetItemIconPalette(itemId));
  SetItemIconAffineAnim(id, ITEM_ANIM_LARGE);
  SetItemIconCallback(id, ITEM_CB_TO_HAND, CURSOR_AREA_IN_BOX, 0);
  SetItemIconPosition(id, CURSOR_AREA_IN_HAND, 0);
  SetItemIconActive(id, true);
  s.movingItemId = itemId;
}

/** 1:1 `static void SwapItemsWithMon(u8, u8)` (:8849). */
function SwapItemsWithMon(cursorArea: number, cursorPos: number): void {
  const s = sStorage!;
  if (s.boxOption !== OPTION_MOVE_ITEMS) return;
  let id = GetItemIconIdxByPosition(cursorArea, cursorPos);
  SetItemIconAffineAnim(id, ITEM_ANIM_PICK_UP);
  SetItemIconCallback(id, ITEM_CB_SWAP_TO_HAND, CURSOR_AREA_IN_HAND, 0);
  const itemId = _getHeldItem(cursorArea, cursorPos);
  _setHeldItem(cursorArea, cursorPos, s.movingItemId);
  s.movingItemId = itemId;
  id = GetItemIconIdxByPosition(CURSOR_AREA_IN_HAND, 0);
  SetItemIconAffineAnim(id, ITEM_ANIM_PUT_DOWN);
  SetItemIconCallback(id, ITEM_CB_SWAP_TO_MON, cursorArea, cursorPos);
}

/** 1:1 `static void GiveItemToMon(u8, u8)` (:8878). */
function GiveItemToMon(cursorArea: number, cursorPos: number): void {
  const s = sStorage!;
  if (s.boxOption !== OPTION_MOVE_ITEMS) return;
  const id = GetItemIconIdxByPosition(CURSOR_AREA_IN_HAND, 0);
  SetItemIconAffineAnim(id, ITEM_ANIM_PUT_DOWN);
  SetItemIconCallback(id, ITEM_CB_TO_MON, cursorArea, cursorPos);
  _setHeldItem(cursorArea, cursorPos, s.movingItemId);
  if (cursorArea === CURSOR_AREA_IN_BOX) SetBoxMonIconObjMode(cursorPos, 0 /* ST_OAM_OBJ_NORMAL */);
  else SetPartyMonIconObjMode(cursorPos, 0);
}

/** 1:1 `static void MoveItemFromMonToBag(u8, u8)` (:8900). */
function MoveItemFromMonToBag(cursorArea: number, cursorPos: number): void {
  const s = sStorage!;
  if (s.boxOption !== OPTION_MOVE_ITEMS) return;
  const id = GetItemIconIdxByPosition(cursorArea, cursorPos);
  SetItemIconAffineAnim(id, ITEM_ANIM_DISAPPEAR);
  SetItemIconCallback(id, ITEM_CB_WAIT_ANIM, cursorArea, cursorPos);
  _setHeldItem(cursorArea, cursorPos, ITEM_NONE);
  if (cursorArea === CURSOR_AREA_IN_BOX) SetBoxMonIconObjMode(cursorPos, 1);
  else SetPartyMonIconObjMode(cursorPos, 1);
}

/** 1:1 `static void MoveItemFromCursorToBag(void)` (:8924). */
function MoveItemFromCursorToBag(): void {
  const s = sStorage!;
  if (s.boxOption === OPTION_MOVE_ITEMS) {
    const id = GetItemIconIdxByPosition(CURSOR_AREA_IN_HAND, 0);
    SetItemIconAffineAnim(id, ITEM_ANIM_PUT_AWAY);
    SetItemIconCallback(id, ITEM_CB_WAIT_ANIM, CURSOR_AREA_IN_HAND, 0);
  }
}

/** 1:1 `static void MoveHeldItemWithPartyMenu(void)` (:8937). */
function MoveHeldItemWithPartyMenu(): void {
  const s = sStorage!;
  if (s.boxOption !== OPTION_MOVE_ITEMS) return;
  for (let i = 0; i < MAX_ITEM_ICONS; i++)
    if (s.itemIcons[i].active && s.itemIcons[i].area === CURSOR_AREA_IN_PARTY)
      SetItemIconCallback(i, ITEM_CB_HIDE_PARTY, CURSOR_AREA_IN_HAND, 0);
}

/** 1:1 `static void PrintItemDescription(void)` (:9179). */
function PrintItemDescription(): void {
  const description = IsMovingItem() ? GetItemDescription(sStorage!.movingItemId) : GetItemDescription(sStorage!.displayMonItemId);
  FillWindowPixelBuffer(WIN_ITEM_DESC, PIXEL_FILL(1));
  AddTextPrinterParameterized5(WIN_ITEM_DESC, FONT_NORMAL, description, 4, 0, 0, null, 0, 1);
}

/** 1:1 `static void InitItemInfoWindow(void)` (:9192). */
function InitItemInfoWindow(): void {
  const s = sStorage!;
  s.itemInfoWindowOffset = 21;
  _loadItemInfoFrameGfx();
  if (_itemInfoFrameGfx) LoadBgTiles(0, _itemInfoFrameGfx, 0x80, 0x13A);
  DrawItemInfoWindow(0);
}

/** 1:1 `static bool8 UpdateItemInfoWindowSlideIn(void)` (:9199). */
function UpdateItemInfoWindowSlideIn(): boolean {
  const s = sStorage!;
  if (s.itemInfoWindowOffset === 0) return false;
  s.itemInfoWindowOffset--;
  const pos = 21 - s.itemInfoWindowOffset;
  for (let i = 0; i < pos; i++)
    WriteSequenceToBgTilemapBuffer(0, GetBgAttribute(0, BG_ATTR_BASETILE) + 0x14 + s.itemInfoWindowOffset + i, i, 13, 1, 7, 15, 21);
  DrawItemInfoWindow(pos);
  return s.itemInfoWindowOffset !== 0;
}

/** 1:1 `static bool8 UpdateItemInfoWindowSlideOut(void)` (:9215). */
function UpdateItemInfoWindowSlideOut(): boolean {
  const s = sStorage!;
  if (s.itemInfoWindowOffset === 22) return false;
  if (s.itemInfoWindowOffset === 0) FillBgTilemapBufferRect(0, 0, 21, 12, 1, 9, 17);
  s.itemInfoWindowOffset++;
  const pos = 21 - s.itemInfoWindowOffset;
  for (let i = 0; i < pos; i++)
    WriteSequenceToBgTilemapBuffer(0, GetBgAttribute(0, BG_ATTR_BASETILE) + 0x14 + s.itemInfoWindowOffset + i, i, 13, 1, 7, 15, 21);
  if (pos >= 0) DrawItemInfoWindow(pos);
  FillBgTilemapBufferRect(0, 0, pos + 1, 12, 1, 9, 17);
  ScheduleBgCopyTilemapToVram(0);
  return true;
}

/** 1:1 `static void DrawItemInfoWindow(u32)` (:9240). */
function DrawItemInfoWindow(x: number): void {
  if (x !== 0) {
    FillBgTilemapBufferRect(0, 0x13A, 0, 0xC, x, 1, 15);
    FillBgTilemapBufferRect(0, 0x93A, 0, 0x14, x, 1, 15);
  }
  FillBgTilemapBufferRect(0, 0x13B, x, 0xD, 1, 7, 15);
  FillBgTilemapBufferRect(0, 0x13C, x, 0xC, 1, 1, 15);
  FillBgTilemapBufferRect(0, 0x13D, x, 0x14, 1, 1, 15);
  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 `static void InitCursorItemIcon(void)` (:4377). */
function InitCursorItemIcon(): void {
  const s = sStorage!;
  if (!IsCursorOnBoxTitle()) {
    if (sInPartyMenu) TryLoadItemIconAtPos(CURSOR_AREA_IN_PARTY, GetCursorPosition());
    else TryLoadItemIconAtPos(CURSOR_AREA_IN_BOX, GetCursorPosition());
  }
  if (s.movingItemId !== ITEM_NONE) {
    InitItemIconInCursor(s.movingItemId);
    StartCursorAnim(CURSOR_ANIM_FIST);
  }
}

// ═══ :3066-3374 Tâches DÉPLACER OBJETS (prendre/donner/sac/échanger/infos/fermer/mail) ═══
const DPAD_ANY = 0xF0;

/** 1:1 `static void Task_TakeItemForMoving(u8)` (:3066). */
function Task_TakeItemForMoving(taskId: number): void {
  void taskId; const s = sStorage!;
  switch (s.state) {
    case 0:
      if (!ItemIsMail(s.displayMonItemId)) { ClearBottomWindow(); s.state++; }
      else SetPokeStorageTask(Task_PrintCantStoreMail);
      break;
    case 1:
      StartCursorAnim(CURSOR_ANIM_OPEN);
      TakeItemFromMon(sInPartyMenu ? CURSOR_AREA_IN_PARTY : CURSOR_AREA_IN_BOX, GetCursorPosition());
      s.state++;
      break;
    case 2:
      if (!IsItemIconAnimActive()) {
        StartCursorAnim(CURSOR_ANIM_FIST); ClearBottomWindow();
        TryRefreshDisplayMon(); PrintDisplayMonInfo(); s.state++;
      }
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy()) SetPokeStorageTask(Task_PokeStorageMain);
      break;
  }
}

/** 1:1 `static void Task_GiveMovingItemToMon(u8)` (:3103). */
function Task_GiveMovingItemToMon(taskId: number): void {
  void taskId; const s = sStorage!;
  switch (s.state) {
    case 0: ClearBottomWindow(); s.state++; break;
    case 1:
      StartCursorAnim(CURSOR_ANIM_OPEN);
      GiveItemToMon(sInPartyMenu ? CURSOR_AREA_IN_PARTY : CURSOR_AREA_IN_BOX, GetCursorPosition());
      s.state++;
      break;
    case 2:
      if (!IsItemIconAnimActive()) {
        StartCursorAnim(CURSOR_ANIM_BOUNCE); TryRefreshDisplayMon(); PrintDisplayMonInfo();
        PrintMessage(MSG_ITEM_IS_HELD); s.state++;
      }
      break;
    case 3:
      if (JOY_NEW(A_BUTTON | B_BUTTON | DPAD_ANY)) { ClearBottomWindow(); s.state++; }
      break;
    case 4:
      if (!IsDma3ManagerBusyWithBgCopy()) SetPokeStorageTask(Task_PokeStorageMain);
      break;
  }
}

/** 1:1 `static void Task_ItemToBag(u8)` (:3140). */
function Task_ItemToBag(taskId: number): void {
  void taskId; const s = sStorage!;
  switch (s.state) {
    case 0:
      if (!AddBagItem(getItemKeyById(s.displayMonItemId), 1)) {
        PlaySE(0x16 /* SE_FAILURE */); PrintMessage(MSG_BAG_FULL); s.state = 3;
      } else {
        PlaySE(0x5 /* SE_SELECT */);
        MoveItemFromMonToBag(sInPartyMenu ? CURSOR_AREA_IN_PARTY : CURSOR_AREA_IN_BOX, GetCursorPosition());
        s.state = 1;
      }
      break;
    case 1:
      if (!IsItemIconAnimActive()) { PrintMessage(MSG_PLACED_IN_BAG); s.state = 2; }
      break;
    case 2:
      if (JOY_NEW(A_BUTTON | B_BUTTON | DPAD_ANY)) {
        ClearBottomWindow(); TryRefreshDisplayMon(); PrintDisplayMonInfo(); s.state = 4;
      }
      break;
    case 4:
      if (!IsDma3ManagerBusyWithBgCopy()) SetPokeStorageTask(Task_PokeStorageMain);
      break;
    case 3:
      if (JOY_NEW(A_BUTTON | B_BUTTON | DPAD_ANY)) { ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain); }
      break;
  }
}

/** 1:1 `static void Task_SwitchSelectedItem(u8)` (:3188). */
function Task_SwitchSelectedItem(taskId: number): void {
  void taskId; const s = sStorage!;
  switch (s.state) {
    case 0:
      if (!ItemIsMail(s.displayMonItemId)) { ClearBottomWindow(); s.state++; }
      else SetPokeStorageTask(Task_PrintCantStoreMail);
      break;
    case 1:
      StartCursorAnim(CURSOR_ANIM_OPEN);
      SwapItemsWithMon(sInPartyMenu ? CURSOR_AREA_IN_PARTY : CURSOR_AREA_IN_BOX, GetCursorPosition());
      s.state++;
      break;
    case 2:
      if (!IsItemIconAnimActive()) {
        StartCursorAnim(CURSOR_ANIM_FIST); TryRefreshDisplayMon(); PrintDisplayMonInfo();
        PrintMessage(MSG_CHANGED_TO_ITEM); s.state++;
      }
      break;
    case 3:
      if (JOY_NEW(A_BUTTON | B_BUTTON | DPAD_ANY)) { ClearBottomWindow(); s.state++; }
      break;
    case 4:
      if (!IsDma3ManagerBusyWithBgCopy()) SetPokeStorageTask(Task_PokeStorageMain);
      break;
  }
}

/** 1:1 `static void Task_ShowItemInfo(u8)` (:3232). */
function Task_ShowItemInfo(taskId: number): void {
  void taskId; const s = sStorage!;
  switch (s.state) {
    case 0: ClearBottomWindow(); s.state++; break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy()) { PlaySE(0x15 /* SE_WIN_OPEN */); PrintItemDescription(); InitItemInfoWindow(); s.state++; }
      break;
    case 2: if (!UpdateItemInfoWindowSlideIn()) s.state++; break;
    case 3: if (!IsDma3ManagerBusyWithBgCopy()) s.state++; break;
    case 4: if (JOY_NEW(A_BUTTON | B_BUTTON | DPAD_ANY)) { PlaySE(0x15); s.state++; } break;
    case 5: if (!UpdateItemInfoWindowSlideOut()) s.state++; break;
    case 6: if (!IsDma3ManagerBusyWithBgCopy()) SetPokeStorageTask(Task_PokeStorageMain); break;
  }
}

/** 1:1 `static void Task_CloseBoxWhileHoldingItem(u8)` (:3275). */
function Task_CloseBoxWhileHoldingItem(taskId: number): void {
  void taskId; const s = sStorage!;
  switch (s.state) {
    case 0: PlaySE(0x5 /* SE_SELECT */); PrintMessage(MSG_PUT_IN_BAG); ShowYesNoWindow(0); s.state = 1; break;
    case 1:
      switch (Menu_ProcessInputNoWrapClearOnChoose()) {
        case MENU_B_PRESSED:
        case 1: ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain); break;
        case 0:
          if (AddBagItem(getItemKeyById(s.movingItemId), 1) === true) { ClearBottomWindow(); s.state = 3; }
          else { PrintMessage(MSG_BAG_FULL); s.state = 2; }
          break;
      }
      break;
    case 2: if (JOY_NEW(A_BUTTON | B_BUTTON | DPAD_ANY)) { ClearBottomWindow(); s.state = 5; } break;
    case 3: MoveItemFromCursorToBag(); s.state = 4; break;
    case 4: if (!IsItemIconAnimActive()) { StartCursorAnim(CURSOR_ANIM_BOUNCE); SetPokeStorageTask(Task_PokeStorageMain); } break;
    case 5: if (!IsDma3ManagerBusyWithBgCopy()) SetPokeStorageTask(Task_PokeStorageMain); break;
  }
}

/** 1:1 `static void Task_PrintCantStoreMail(u8)` (:3351). */
function Task_PrintCantStoreMail(taskId: number): void {
  void taskId; const s = sStorage!;
  switch (s.state) {
    case 0: PrintMessage(MSG_CANT_STORE_MAIL); s.state++; break;
    case 1: if (!IsDma3ManagerBusyWithBgCopy()) s.state++; break;
    case 2: if (JOY_NEW(A_BUTTON | B_BUTTON | DPAD_ANY)) { ClearBottomWindow(); s.state++; } break;
    case 3: if (!IsDma3ManagerBusyWithBgCopy()) SetPokeStorageTask(Task_PokeStorageMain); break;
  }
}

/** :3590 Task_GiveItemFromBag — fade puis bascule vers le sac (SCREEN_CHANGE_ITEM_FROM_BAG). */
function Task_GiveItemFromBag(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      s.state++;
      break;
    case 1:
      if (!UpdatePaletteFade()) {
        sWhichToReshow = SCREEN_CHANGE_ITEM_FROM_BAG - 1;
        s.screenChangeType = SCREEN_CHANGE_ITEM_FROM_BAG;
        SetPokeStorageTask(Task_ChangeScreen);
      }
      break;
  }
}

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

// ─── :4494-4737 Système d'icônes de scroll de boîte (colonne-par-colonne) ───
// data des icônes : sDistance=data[1], sSpeed=data[2], sScrollInDestX=data[3], sDelay=data[4], sScrollOutX=data[5].
type ScrollIconSprite = { data: number[]; x: number; x2: number; callback: unknown };
// :4500 StartBoxMonIconsScrollOut
function StartBoxMonIconsScrollOut(speed: number): void {
  const s = sStorage!;
  for (let i = 0; i < IN_BOX_COUNT; i++) {
    const spr = _spr(s.boxMonsSprites[i]);
    if (spr) { spr.data[2] = speed; spr.data[4] = 1; spr.callback = SpriteCB_BoxMonIconScrollOut as never; }
  }
}
// :4515 SpriteCB_BoxMonIconScrollIn
function SpriteCB_BoxMonIconScrollIn(sprite: ScrollIconSprite): void {
  if (sprite.data[1] !== 0) {  // sDistance
    sprite.data[1]--;
    sprite.x += sprite.data[2];  // sSpeed
  } else {
    sStorage!.iconScrollNumIncoming--;
    sprite.x = sprite.data[3];  // sScrollInDestX
    sprite.callback = null;  // SpriteCallbackDummy
  }
}
// :4532 SpriteCB_BoxMonIconScrollOut
function SpriteCB_BoxMonIconScrollOut(sprite: ScrollIconSprite): void {
  if (sprite.data[4] !== 0) {  // sDelay
    sprite.data[4]--;
  } else {
    sprite.x += sprite.data[2];  // sSpeed
    sprite.data[5] = sprite.x + sprite.x2;  // sScrollOutX
    if (sprite.data[5] <= 68 || sprite.data[5] >= 252) sprite.callback = null;  // SpriteCallbackDummy
  }
}
// :4552 DestroyBoxMonIconsInColumn
function DestroyBoxMonIconsInColumn(column: number): void {
  const s = sStorage!;
  let boxPosition = column;
  for (let row = 0; row < IN_BOX_ROWS; row++) {
    if (s.boxMonsSprites[boxPosition] >= 0) {
      DestroySprite(s.boxMonsSprites[boxPosition]);  // DestroyBoxMonIcon (refcount tiles = lot suivant)
      s.boxMonsSprites[boxPosition] = -1;
    }
    boxPosition += IN_BOX_COLUMNS;
  }
}
// :4569 CreateBoxMonIconsInColumn — icônes entrantes de la colonne
function CreateBoxMonIconsInColumn(column: number, distance: number, speed: number): number {
  const s = sStorage!;
  const xDest = 8 * (3 * column) + 100;
  const x = xDest - ((distance + 1) * speed);
  const subpriority = 19 - column;
  let iconsCreated = 0;
  let boxPosition = column;
  let y = 44;
  // OPTION_MOVE_ITEMS (blend objMode des icônes sans objet) = lot items (#10) ; ici cas principal.
  for (let i = 0; i < IN_BOX_ROWS; i++) {
    if (s.boxSpecies[boxPosition] !== SPECIES_NONE) {
      const id = CreateMonIconSprite(s.boxSpecies[boxPosition], s.boxPersonalities[boxPosition], x, y, 2, subpriority);
      s.boxMonsSprites[boxPosition] = id;
      const spr = _spr(id);
      if (spr) {
        spr.data[1] = distance;  // sDistance
        spr.data[2] = speed;     // sSpeed
        spr.data[3] = xDest;     // sScrollInDestX
        spr.callback = SpriteCB_BoxMonIconScrollIn as never;
        iconsCreated++;
      }
    }
    boxPosition += IN_BOX_COLUMNS;
    y += 24;
  }
  return iconsCreated;
}
// :4637 InitBoxMonIconScroll
function InitBoxMonIconScroll(boxId: number, direction: number): void {
  const s = sStorage!;
  s.iconScrollState = 0;
  s.iconScrollToBoxId = boxId;
  s.iconScrollDirection = direction;
  s.iconScrollDistance = 32;
  s.iconScrollSpeed = -(6 * direction);
  s.iconScrollNumIncoming = 0;
  GetIncomingBoxMonData(boxId);
  if (direction > 0) s.iconScrollCurColumn = 0;
  else s.iconScrollCurColumn = IN_BOX_COLUMNS - 1;
  s.iconScrollPos = (24 * s.iconScrollCurColumn) + 100;
  StartBoxMonIconsScrollOut(s.iconScrollSpeed);
}
// :4655 UpdateBoxMonIconScroll
function UpdateBoxMonIconScroll(): boolean {
  const s = sStorage!;
  if (s.iconScrollDistance !== 0) s.iconScrollDistance--;
  switch (s.iconScrollState) {
    case 0:
      s.iconScrollPos += s.iconScrollSpeed;
      if (s.iconScrollPos <= 64 || s.iconScrollPos >= 252) {
        DestroyBoxMonIconsInColumn(s.iconScrollCurColumn);
        s.iconScrollPos += s.iconScrollDirection * 24;
        s.iconScrollState++;
      }
      break;
    case 1:
      s.iconScrollPos += s.iconScrollSpeed;
      s.iconScrollNumIncoming += CreateBoxMonIconsInColumn(s.iconScrollCurColumn, s.iconScrollDistance, s.iconScrollSpeed);
      if ((s.iconScrollDirection > 0 && s.iconScrollCurColumn === IN_BOX_COLUMNS - 1)
       || (s.iconScrollDirection < 0 && s.iconScrollCurColumn === 0)) {
        s.iconScrollState++;
      } else {
        s.iconScrollCurColumn += s.iconScrollDirection;
        s.iconScrollState = 0;
      }
      break;
    case 2:
      if (s.iconScrollNumIncoming === 0) {
        s.iconScrollDistance++;
        return false;
      }
      break;
    default:
      return false;
  }
  return true;
}
// :4705 GetIncomingBoxMonData
function GetIncomingBoxMonData(boxId: number): void {
  const s = sStorage!;
  let boxPosition = 0;
  for (let i = 0; i < IN_BOX_ROWS; i++) {
    for (let j = 0; j < IN_BOX_COLUMNS; j++) {
      // GetBoxMonDataAt(boxId, pos, MON_DATA_*) → _boxMonAt chez nous (champs directs du save block).
      const mon = _boxMonAt(boxId, boxPosition);
      s.boxSpecies[boxPosition] = mon && mon.species ? mon.species : SPECIES_NONE;
      if (s.boxSpecies[boxPosition] !== SPECIES_NONE)
        s.boxPersonalities[boxPosition] = mon!.personality ?? 0;
      boxPosition++;
    }
  }
  s.incomingBoxId = boxId;
}
// :4724 DestroyBoxMonIconAtPosition + :4733 SetBoxMonIconObjMode
function DestroyBoxMonIconAtPosition(boxPosition: number): void {
  const s = sStorage!;
  if (s.boxMonsSprites[boxPosition] >= 0) {
    DestroySprite(s.boxMonsSprites[boxPosition]);
    s.boxMonsSprites[boxPosition] = -1;
  }
}
/** 1:1 `static void SetBoxMonIconObjMode(u8, u8)` (:4733). */
function SetBoxMonIconObjMode(boxPosition: number, objMode: number): void {
  const rt = getRuntime(); const s = sStorage!;
  const spr = rt && s.boxMonsSprites[boxPosition] >= 0 ? rt.gSprites[s.boxMonsSprites[boxPosition]] : null;
  if (spr && rt) rt.gba.oam[spr.oamIndex].objMode = objMode as 0 | 1 | 2;
}
/** 1:1 `static void SetPartyMonIconObjMode(u8, u8)` (:4917). */
function SetPartyMonIconObjMode(partyId: number, objMode: number): void {
  const rt = getRuntime(); const s = sStorage!;
  const spr = rt && s.partySprites[partyId] >= 0 ? rt.gSprites[s.partySprites[partyId]] : null;
  if (spr && rt) rt.gba.oam[spr.oamIndex].objMode = objMode as 0 | 1 | 2;
}
/** 1:1 `static u8 GetCursorPosition(void)` (:7869). */
function GetCursorPosition(): number { return sCursorPosition; }
/** 1:1 `static void StartCursorAnim(u8)` (:7888). */
function StartCursorAnim(animNum: number): void {
  const rt = getRuntime(); const s = sStorage!;
  const spr = rt && s.cursorSprite >= 0 ? rt.gSprites[s.cursorSprite] : null;
  if (spr) StartSpriteAnim(spr as never, animNum);
}

// :7874 GetCursorBoxColumnAndRow — pointeurs C (column,row) → objet retourné.
function GetCursorBoxColumnAndRow(): { column: number; row: number } {
  if (sCursorArea === CURSOR_AREA_IN_BOX)
    return { column: sCursorPosition % IN_BOX_COLUMNS, row: (sCursorPosition / IN_BOX_COLUMNS) | 0 };
  return { column: 0, row: 0 };
}
// :7898 SetCursorPriorityTo1 — oam.priority via rt.gba.oam[oamIndex] (cf. SetMovingMonPriority).
function SetCursorPriorityTo1(): void {
  const rt = getRuntime(); const spr = _spr(sStorage!.cursorSprite);
  if (rt && spr) rt.gba.oam[spr.oamIndex].priority = 1;
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
  // Gap de 4×18 tiles (:5439) — X DOIT wrapper & 0x3F (BG2 512-wide), comme la partie principale.
  // Sans le wrap, x dépassait 63 (x+20) / passait sous 0 (x-4) → FillBgTilemapBufferRect écrivait le
  // gap dans le MAUVAIS screenblock → trous accumulés (bande fragmentée pendant le slide). tile 0 = fond.
  for (let gy = 0; gy < 18; gy++) {
    for (let gx = 0; gx < 4; gx++) {
      const gi = tileMapIndex((x + gx) & 0x3F, 2 + gy, screenSize);
      if (gi >= 0 && gi < dest.length) dest[gi] = 0;
    }
  }
}
// ─── :5441 TrimOldWallpaper — efface la colonne de l'ancien wallpaper (scroll). ───
function TrimOldWallpaper(): void {
  const s = sStorage!;
  const dest = GetBgTilemapBuffer(2);
  // 1:1 (:5441) — parcours pointeur LINÉAIRE du buffer BG2 (screenblock-major, cf. DrawWallpaper)
  // avec sauts de bloc, PAS (col,row). L'ancienne « approximation » effaçait en diagonale → gap beige.
  let r3 = (Math.floor(s.bg2_X / 8) + 30) & 0x3F;
  let di = r3 <= 31 ? r3 + 0x260 : r3 + 0x640;
  for (let i = 0; i < 0x2C; i++) {
    if (di >= 0 && di < dest.length) dest[di] = 0;
    di++;
    r3 = (r3 + 1) & 0x3F;
    if (r3 === 0) di -= 0x420;
    if (r3 === 0x20) di += 0x3e0;
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

// ─── :5523 CreateIncomingBoxTitle + :5571 CycleBoxTitleSprites + CB titre ───
// data titre : sSpeed=data[0], sIncomingX/sOutgoingDelay=data[1], sIncomingDelay/sOutgoingX=data[2].
type TitleSprite = ScrollIconSprite & { spriteId: number };
function CreateIncomingBoxTitle(boxId: number, direction: number): void {
  const s = sStorage!;
  s.boxTitleCycleId = s.boxTitleCycleId === 0 ? 1 : 0;
  const tileTag = s.boxTitleCycleId === 0 ? GFXTAG_BOX_TITLE : GFXTAG_BOX_TITLE_ALT;
  s.boxTitleText = GetBoxNamePtr(boxId);  // StringCopyPadded(…, BOX_NAME_LENGTH)
  DrawTextWindowAndBufferTiles(s.boxTitleText, s.boxTitleTiles, 0, 0, 2);
  LoadSpriteSheet({ data: s.boxTitleTiles.subarray(0, 0x200), size: 0x200, tag: tileTag });
  // LoadPalette(sBoxTitleColors[GetBoxWallpaper(boxId)], boxTitlePalOffset, 4) : sBoxTitleColors IDENTIQUES
  // pour tous les wallpapers → couleurs déjà à boxTitlePalOffset (InitBoxTitle). Recharge redondante omise.
  const x = GetBoxTitleBaseX(s.boxTitleText);
  const adjustedX = x + direction * 192;
  for (let i = 0; i < 2; i++) {
    const spriteId = CreateSprite({
      tileTag, paletteTag: PALTAG_BOX_TITLE, oam: sOamData_BoxTitle,
      anims: sAnims_BoxTitle, callback: SpriteCB_IncomingBoxTitle as never,
    }, i * 32 + adjustedX, 28, _sub(24));
    s.nextBoxTitleSprites[i] = spriteId;
    const nspr = _spr(spriteId);
    if (nspr) {
      nspr.data[0] = (-direction) * 6;  // sSpeed
      nspr.data[1] = i * 32 + x;        // sIncomingX
      nspr.data[2] = 0;                 // sIncomingDelay
      StartSpriteAnim(nspr as never, i);
    }
    const cspr = _spr(s.curBoxTitleSprites[i]);
    if (cspr) {
      cspr.data[0] = (-direction) * 6;  // sSpeed
      cspr.data[1] = 1;                 // sOutgoingDelay
      cspr.callback = SpriteCB_OutgoingBoxTitle as never;
    }
  }
}
function CycleBoxTitleSprites(): void {
  const s = sStorage!;
  if (s.boxTitleCycleId === 0) _freeSpriteTileRangeByTag(GFXTAG_BOX_TITLE_ALT);
  else _freeSpriteTileRangeByTag(GFXTAG_BOX_TITLE);
  s.curBoxTitleSprites[0] = s.nextBoxTitleSprites[0];
  s.curBoxTitleSprites[1] = s.nextBoxTitleSprites[1];
}
function SpriteCB_IncomingBoxTitle(sprite: TitleSprite): void {
  if (sprite.data[2] !== 0) sprite.data[2]--;  // sIncomingDelay
  else if ((sprite.x += sprite.data[0]) === sprite.data[1]) sprite.callback = null;  // sSpeed → sIncomingX
}
function SpriteCB_OutgoingBoxTitle(sprite: TitleSprite): void {
  if (sprite.data[1] !== 0) {  // sOutgoingDelay
    sprite.data[1]--;
  } else {
    sprite.x += sprite.data[0];             // sSpeed
    sprite.data[2] = sprite.x + sprite.x2;  // sOutgoingX
    if (sprite.data[2] < 64 || sprite.data[2] > 240 + 16) DestroySprite(sprite.spriteId);
  }
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

// ─── Scroll de boîte — FONDATIONS (inertes ; système d'icônes colonne-par-colonne = lot suivant :
// GetIncomingBoxMonData, StartBoxMonIconsScrollOut, Create/DestroyBoxMonIconsInColumn,
// Init/UpdateBoxMonIconScroll, SetUpScrollToBox, ScrollToBox, CreateIncomingBoxTitle, CycleBoxTitleSprites).
// Ces 3 fns sont autonomes (arrowSprites + AnimateBoxScrollArrows existent). ───
// :5294 DetermineBoxScrollDirection
function DetermineBoxScrollDirection(boxId: number): number {
  let i: number;
  let currentBox = StorageGetCurrentBox();
  for (i = 0; currentBox !== boxId; i++) {
    currentBox++;
    if (currentBox >= TOTAL_BOXES_COUNT) currentBox = 0;
  }
  return (i < TOTAL_BOXES_COUNT / 2) ? 1 : -1;
}
// :5658 StartBoxScrollArrowsSlide (sState=data[0], sTimer=data[1])
function StartBoxScrollArrowsSlide(direction: number): void {
  const s = sStorage!;
  for (let i = 0; i < 2; i++) {
    const a = _spr(s.arrowSprites[i]); if (!a) continue;
    a.x2 = 0; a.data[0] = 2;
  }
  const a0 = _spr(s.arrowSprites[0]), a1 = _spr(s.arrowSprites[1]);
  if (!a0 || !a1) return;
  if (direction < 0) {
    a0.data[1] = 29; a1.data[1] = 5;
    a0.data[2] = 72; a1.data[2] = 72;
  } else {
    a0.data[1] = 5; a1.data[1] = 29;
    a0.data[2] = 240 + 8; a1.data[2] = 240 + 8;  // DISPLAY_WIDTH + 8
  }
  a0.data[7] = 0; a1.data[7] = 1;
}
// :5686 StopBoxScrollArrowsSlide — new box's arrows entered, stop sliding + set position
function StopBoxScrollArrowsSlide(): void {
  const s = sStorage!;
  for (let i = 0; i < 2; i++) {
    const a = _spr(s.arrowSprites[i]); if (!a) continue;
    a.x = 136 * i + 92; a.x2 = 0; a.invisible = false;
  }
  AnimateBoxScrollArrows(true);
}
// :5240 SetUpScrollToBox
function SetUpScrollToBox(boxId: number): void {
  const s = sStorage!;
  const direction = DetermineBoxScrollDirection(boxId);
  s.scrollSpeed = (direction > 0) ? 6 : -6;
  s.scrollUnused1 = (direction > 0) ? 1 : 2;
  s.scrollTimer = 32;
  s.scrollToBoxIdUnused = boxId;
  // scrollUnused2-6 / scrollDirectionUnused : champs inutilisés du décomp, omis.
  s.scrollToBoxId = boxId;
  s.scrollDirection = direction;
  s.scrollState = 0;
}
// :5260 ScrollToBox — anime le slide (retourne false quand fini)
function ScrollToBox(): boolean {
  const s = sStorage!;
  let iconsScrolling: boolean;
  switch (s.scrollState) {
    case 0:
      LoadWallpaperGfx(s.scrollToBoxId, s.scrollDirection);
      s.scrollState++;
      // fallthrough
    case 1:
      if (!WaitForWallpaperGfxLoad()) return true;
      InitBoxMonIconScroll(s.scrollToBoxId, s.scrollDirection);
      CreateIncomingBoxTitle(s.scrollToBoxId, s.scrollDirection);
      StartBoxScrollArrowsSlide(s.scrollDirection);
      break;
    case 2:
      iconsScrolling = UpdateBoxMonIconScroll();
      if (s.scrollTimer !== 0) {
        s.bg2_X += s.scrollSpeed;
        if (--s.scrollTimer !== 0) return true;
        CycleBoxTitleSprites();
        StopBoxScrollArrowsSlide();
      }
      return iconsScrolling;
  }
  s.scrollState++;
  return true;
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
  // subpriority BRUTE (pas _sub) : le décomp (:7845) passe 21/13 direct, et les box mons utilisent aussi
  // du brut (CreateBoxMonIconsInColumn :2608 `19 - column`). Le compositor honore la subpriority (plus
  // grande = derrière) → ombre 21 > box mon 19 = ombre DERRIÈRE le mon (1:1). `_sub(21)`=10 la mettait
  // DEVANT (bug « ombre sur le Pokémon »). L'ombre n'est visible qu'en IN_BOX (invisible ailleurs).
  const shadowId = CreateSprite({
    tileTag: GFXTAG_CURSOR_SHADOW, paletteTag: PALTAG_MISC_2, oam: { shape: 0, size: 1, priority: 1 },
    anims: null, callback: null,
  }, 0, 0, subpriority);
  if (shadowId !== 64 && rt) {
    s.cursorShadowSprite = shadowId;
    const spr = _spr(shadowId)!;
    spr.callback = SpriteCB_CursorShadow as never;  // :7815 template callback → l'ombre colle sous la main (sinon reste à 0,0 = pixel gris)
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
      // 1:1 : le sexe se CALCULE depuis species+personality (GetMonGender), ce n'est pas un champ stocké.
      const g = GetGenderFromSpeciesAndPersonality(s.displayMonSpecies, s.displayMonPersonality);
      gender = g === 0 /* MON_MALE */ ? 'M' : g === 254 /* MON_FEMALE */ ? 'F' : 'N';
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
    // :6947-6979 1:1 — codes couleur du symbole de genre (décomp EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW) :
    // ♂ = RED/LIGHT_RED (→ bleu via la palette WIN_DISPLAY_INFO), ♀ = GREEN/LIGHT_GREEN (→ rose), puis
    // reset DARK_GRAY pour « N.niveau ». Le moteur texte convertit {COLOR/HIGHLIGHT/SHADOW} en codes ext.
    const genderPart = gender === 'M'
      ? '{COLOR RED}{HIGHLIGHT WHITE}{SHADOW LIGHT_RED}♂'
      : gender === 'F'
      ? '{COLOR GREEN}{HIGHLIGHT WHITE}{SHADOW LIGHT_GREEN}♀'
      : '{COLOR DARK_GRAY}{HIGHLIGHT WHITE}{SHADOW LIGHT_GRAY}';
    s.displayMonGenderLvlText = `${genderPart}{COLOR DARK_GRAY}{HIGHLIGHT WHITE}{SHADOW LIGHT_GRAY}N.${s.displayMonLevel}`;
    // :6985 StringCopyPadded(displayMonItemName, GetItemName(id), CHAR_SPACE, 8) sinon StringFill espaces.
    s.displayMonItemName = s.displayMonItemId !== ITEM_NONE ? GetItemName(s.displayMonItemId) : '';
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
    case STATE_LOAD: {
      task.data[15] = CreateMainMenu(task.data[1]);  // tWindowId ← tSelectedOption
      LoadMessageBoxAndBorderGfx();
      DrawDialogueFrame(0, false);
      _printDesc(task.data[1], TEXT_SKIP_DRAW);
      CopyWindowToVram(0, COPYWIN_FULL);
      CopyWindowToVram(task.data[15], COPYWIN_FULL);
      task.data[0]++;
      break;
    }
    case STATE_FADE_IN:
      // 🩸 Fix damier magenta hors-map (adaptation moteur, symptôme) : l'écran boîtes corrompt la tile
      // VRAM 513 (border, metatile 513) — pleine/opaque en field pur, elle devient un coin diagonal
      // transparent qui laisse voir le garbage BG3 (tile 20, pal 3 = magenta) dans le HORS-MAP (map PC
      // Center < écran). Sondé : tile 513 = 64 px à CB2_ReturnToField_Manual PUIS 23 px au 1er frame
      // MainCB2_Overworld2 (écriture VRAM unique via ref capturée, source exacte non identifiée — à
      // re-diagnostiquer). On RECHARGE ici (1er état qui tourne EN OW, donc APRÈS la corruption) les
      // tiles du tileset via CopyMapTilesetsToVram (1:1 décomp). Cf. [[diag-pc-center-magenta-camera-decadree]].
      CopyMapTilesetsToVram(((globalThis as { gMapHeader?: { mapLayout?: unknown } }).gMapHeader?.mapLayout ?? null) as never);
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
  // :6007-6018 MODE DÉPLACER OBJETS : cache l'icône à l'ancienne pos (sCursorArea/Position, pas encore
  // mis à jour → DoCursorNewPosUpdate), charge celle de la nouvelle.
  if (s.boxOption === OPTION_MOVE_ITEMS) {
    if (sCursorArea === CURSOR_AREA_IN_BOX) TryHideItemIconAtPos(CURSOR_AREA_IN_BOX, sCursorPosition);
    else if (sCursorArea === CURSOR_AREA_IN_PARTY) TryHideItemIconAtPos(CURSOR_AREA_IN_PARTY, sCursorPosition);
    if (newCursorArea === CURSOR_AREA_IN_BOX) TryLoadItemIconAtPos(newCursorArea, newCursorPosition);
    else if (newCursorArea === CURSOR_AREA_IN_PARTY) TryLoadItemIconAtPos(newCursorArea, newCursorPosition);
  }
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
      if (shadow) shadow.subpriority = 13;  // :6076 brut (pas _sub : cf. subpriority ombre vs box mon)
      SetMovingMonPriority(1);
      break;
    case CURSOR_AREA_IN_BOX:
      if (s.inBoxMovingMode === MOVE_MODE_NORMAL && rt) {
        if (cursor) rt.gba.oam[cursor.oamIndex].priority = 1;
        if (shadow) {
          rt.gba.oam[shadow.oamIndex].priority = 2;
          shadow.subpriority = 21;  // :6084 brut (pas _sub) → ombre DERRIÈRE le box mon (sub 12/19)
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
// 1:1 struct EWRAM anonyme *sMultiMove (:8089-8107). boxMons = BoxPokemon[IN_BOX_COUNT] (copies).
let sMultiMove: {
  funcId: number; state: number;
  fromColumn: number; fromRow: number; toColumn: number; toRow: number;
  cursorColumn: number; cursorRow: number;
  minColumn: number; minRow: number; columnsTotal: number; rowsTotal: number;
  bgX: number; bgY: number; bgMoveSteps: number;
  boxMons: (Pokemon | null)[];
} | null = null;
function MultiMove_Init(): boolean {
  sMultiMove = {
    funcId: 0, state: 0, fromColumn: 0, fromRow: 0, toColumn: 0, toRow: 0,
    cursorColumn: 0, cursorRow: 0, minColumn: 0, minRow: 0, columnsTotal: 0, rowsTotal: 0,
    bgX: 0, bgY: 0, bgMoveSteps: 0, boxMons: new Array(IN_BOX_COUNT).fill(null),
  };
  // AddWindow8Bit : fenêtre 8bpp (rendu de la sélection multiple). Le décomp alloue le tile-data
  // sans toucher la VRAM à l'init ; notre AddWindow (4bpp) flusherait le buffer vide sur tile 0xA-…
  // et écraserait le cadre YesNo chargé à 0xB (:3888). AddWindow8Bit n'active pas le flush initial.
  // (Décomp :8117 fait FillWindowPixelBuffer(PIXEL_FILL(0)) ici — OMIS pour ne pas flush le cadre.)
  sStorage!.multiMoveWindowId = AddWindow8Bit(sWindowTemplate_MultiMove as never);
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

// :7729 SpriteCB_CursorShadow — l'ombre de la main colle sous le curseur (+20 en y). ───
function SpriteCB_CursorShadow(sprite: { x: number; y: number }): void {
  const cursor = _spr(sStorage!.cursorSprite);
  if (cursor) { sprite.x = cursor.x; sprite.y = cursor.y + 20; }
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
// :6148 InitMultiMonPlaceChange — pas de Shift en multi-déplacement, seulement grab/place ;
// le curseur descend (Down) puis remonte (Up).
function InitMultiMonPlaceChange(up: boolean): void {
  const s = sStorage!;
  s.monPlaceChangeFunc = up ? MultiMonPlaceChange_Up : MultiMonPlaceChange_Down;
  s.monPlaceChangeState = 0;
}
function MultiMonPlaceChange_Down(): boolean { return MonPlaceChange_CursorDown(); } // :6253
function MultiMonPlaceChange_Up(): boolean { return MonPlaceChange_CursorUp(); }     // :6258

// :4965 SaveMonSpriteAtPos — mémorise le sprite du slot cible pour l'anim d'échange.
// `shiftMonSpritePtr` = struct Sprite ** décomp → descripteur { arr, idx } (arr[idx] = ID sprite).
function SaveMonSpriteAtPos(boxId: number, position: number): void {
  const s = sStorage!;
  if (boxId === TOTAL_BOXES_COUNT)  // party mon
    s.shiftMonSpritePtr = { arr: s.partySprites, idx: position };
  else
    s.shiftMonSpritePtr = { arr: s.boxMonsSprites, idx: position };
  const moving = _spr(s.movingMonSprite);
  if (moving) moving.callback = null;  // SpriteCallbackDummy
  s.shiftTimer = 0;
}

// :4976 MoveShiftingMons — anim d'échange (16 frames) : les 2 icônes glissent l'une vers l'autre
// (y± + oscillation x2 via gSineTable), échange priority/subpriority à mi-course (8), swap des
// pointeurs sprite à la fin (16). Retourne FALSE quand l'anim est terminée.
function MoveShiftingMons(): boolean {
  const rt = getRuntime(); const s = sStorage!;
  const ptr = s.shiftMonSpritePtr as { arr: number[]; idx: number };
  const moving = _spr(s.movingMonSprite);
  if (s.shiftTimer === 16) return false;

  s.shiftTimer++;
  if (s.shiftTimer & 1) {
    const sh = _spr(ptr.arr[ptr.idx]);
    if (sh) sh.y--;
    if (moving) moving.y++;
  }
  {
    const sh = _spr(ptr.arr[ptr.idx]);
    const off = Math.trunc(gSineTable[s.shiftTimer * 8] / 16);
    if (sh) sh.x2 = off;
    if (moving) moving.x2 = -off;
  }
  if (s.shiftTimer === 8) {
    const sh = _spr(ptr.arr[ptr.idx]);
    if (moving && sh && rt) {
      rt.gba.oam[moving.oamIndex].priority = rt.gba.oam[sh.oamIndex].priority;
      moving.subpriority = sh.subpriority;
      rt.gba.oam[sh.oamIndex].priority = GetMonIconPriorityByCursorPos();
      sh.subpriority = _sub(7);
    }
  }
  if (s.shiftTimer === 16) {
    // swap movingMonSprite <-> *shiftMonSpritePtr (échange des IDs de sprite)
    const spriteId = s.movingMonSprite;
    s.movingMonSprite = ptr.arr[ptr.idx];
    ptr.arr[ptr.idx] = spriteId;
    const newMoving = _spr(s.movingMonSprite);
    if (newMoving) newMoving.callback = SpriteCB_HeldMon;
    const newShift = _spr(ptr.arr[ptr.idx]);
    if (newShift) newShift.callback = null;  // SpriteCallbackDummy
  }
  return true;
}

// :6386 SetShiftedMonData — échange les DONNÉES : place le mon en main dans le slot occupé,
// reprend l'ancien occupant en main (tempMon). Ordre 1:1 : sauve l'occupant → place le tenu →
// l'occupant devient le tenu.
function SetShiftedMonData(boxId: number, position: number): void {
  const s = sStorage!;
  if (boxId === TOTAL_BOXES_COUNT)
    s.tempMon = gPlayerParty[position] as Pokemon;    // struct copy décomp (case réassignée après → réf sûre)
  else
    s.tempMon = _boxMonAt(boxId, position);           // BoxMonAtToMon
  SetPlacedMonData(boxId, position);
  s.movingMon = s.tempMon;
  SetDisplayMonData(s.movingMon, MODE_PARTY);
  sMovingMonOrigBoxId = boxId;
  sMovingMonOrigBoxPos = position;
}

// :6218 MonPlaceChange_Shift — SHIFT (échange mon en main ↔ mon du slot occupé).
function MonPlaceChange_Shift(): boolean {
  const s = sStorage!;
  const cursor = _spr(s.cursorSprite);
  switch (s.monPlaceChangeState) {
    case 0:
      switch (sCursorArea) {
        case CURSOR_AREA_IN_PARTY: s.shiftBoxId = TOTAL_BOXES_COUNT; break;
        case CURSOR_AREA_IN_BOX: s.shiftBoxId = StorageGetCurrentBox(); break;
        default: return false;
      }
      if (cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_OPEN);
      SaveMonSpriteAtPos(s.shiftBoxId, sCursorPosition);
      s.monPlaceChangeState++;
      break;
    case 1:
      if (!MoveShiftingMons()) {
        if (cursor) StartSpriteAnim(cursor as never, CURSOR_ANIM_FIST);
        SetShiftedMonData(s.shiftBoxId, sCursorPosition);
        s.monPlaceChangeState++;
      }
      break;
    case 2:
      return false;
  }
  return true;
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
// :6783 CanShiftMon — SHIFT possible ? (mon en main ; refuse seulement si on viderait la party
// de son dernier combattant en la remplaçant par un œuf / un mon KO).
function CanShiftMon(): boolean {
  const s = sStorage!;
  if (sIsMonBeingMoved) {
    if (sCursorArea === CURSOR_AREA_IN_PARTY && CountPartyAliveNonEggMonsExcept(sCursorPosition) === 0) {
      if (s.displayMonIsEgg || (s.movingMon?.hp ?? 0) === 0)
        return false;
    }
    return true;
  }
  return false;
}

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

// sMenuTexts (:7933) — table du décomp : MENU_* → NOM gPCText_* (PAS de texte hardcodé). Le libellé
// FR est résolu au runtime via getString() depuis strings.json = donnée extraite du décomp = source de
// vérité 1:1. (Le hardcodage divergeait : ex. MENU_JUMP réel = « BOITES » pas « SAUTER ».)
const sMenuTexts: string[] = [];
sMenuTexts[MENU_CANCEL] = 'gPCText_Cancel';   sMenuTexts[MENU_STORE] = 'gPCText_Store';       sMenuTexts[MENU_WITHDRAW] = 'gPCText_Withdraw';
sMenuTexts[MENU_MOVE] = 'gPCText_Move';       sMenuTexts[MENU_SHIFT] = 'gPCText_Shift';       sMenuTexts[MENU_PLACE] = 'gPCText_Place';
sMenuTexts[MENU_SUMMARY] = 'gPCText_Summary'; sMenuTexts[MENU_RELEASE] = 'gPCText_Release';   sMenuTexts[MENU_MARK] = 'gPCText_Mark';
sMenuTexts[MENU_JUMP] = 'gPCText_Jump';       sMenuTexts[MENU_WALLPAPER] = 'gPCText_Wallpaper'; sMenuTexts[MENU_NAME] = 'gPCText_Name';
sMenuTexts[MENU_SCENERY_1] = 'gPCText_Scenery1'; sMenuTexts[MENU_SCENERY_2] = 'gPCText_Scenery2'; sMenuTexts[MENU_SCENERY_3] = 'gPCText_Scenery3';
sMenuTexts[MENU_ETCETERA] = 'gPCText_Etcetera';  sMenuTexts[MENU_FRIENDS] = 'gPCText_Friends';
sMenuTexts[MENU_FOREST] = 'gPCText_Forest';   sMenuTexts[MENU_CITY] = 'gPCText_City';         sMenuTexts[MENU_DESERT] = 'gPCText_Desert';   sMenuTexts[MENU_SAVANNA] = 'gPCText_Savanna';
sMenuTexts[MENU_CRAG] = 'gPCText_Crag';       sMenuTexts[MENU_VOLCANO] = 'gPCText_Volcano';   sMenuTexts[MENU_SNOW] = 'gPCText_Snow';       sMenuTexts[MENU_CAVE] = 'gPCText_Cave';
sMenuTexts[MENU_BEACH] = 'gPCText_Beach';     sMenuTexts[MENU_SEAFLOOR] = 'gPCText_Seafloor'; sMenuTexts[MENU_RIVER] = 'gPCText_River';     sMenuTexts[MENU_SKY] = 'gPCText_Sky';
sMenuTexts[MENU_POLKADOT] = 'gPCText_PolkaDot'; sMenuTexts[MENU_POKECENTER] = 'gPCText_Pokecenter'; sMenuTexts[MENU_MACHINE] = 'gPCText_Machine'; sMenuTexts[MENU_SIMPLE] = 'gPCText_Simple';
sMenuTexts[MENU_TAKE] = 'gPCText_Take';       sMenuTexts[MENU_GIVE] = 'gPCText_Give';         sMenuTexts[MENU_GIVE_2] = 'gPCText_Give';
sMenuTexts[MENU_SWITCH] = 'gPCText_Switch';   sMenuTexts[MENU_BAG] = 'gPCText_Bag';           sMenuTexts[MENU_INFO] = 'gPCText_Info';

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
    const gTextName = sMenuTexts[textId];  // NOM gPCText_* → texte FR résolu depuis strings.json.
    menu.text = gTextName ? getString(gTextName) : '';
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

// ─── :8062 SetMenuTexts_Item (menu contextuel MODE DÉPLACER OBJETS) ───
function SetMenuTexts_Item(): boolean {
  const s = sStorage!;
  // :8064 `if (displayMonSpecies == SPECIES_EGG)` — notre modèle garde l'espèce réelle + flag displayMonIsEgg.
  if (s.displayMonIsEgg) return false;

  if (!IsMovingItem()) {
    if (s.displayMonItemId === ITEM_NONE) {
      if (s.displayMonSpecies === SPECIES_NONE) return false;
      SetMenuText(MENU_GIVE_2);
    } else {
      if (!ItemIsMail(s.displayMonItemId)) {
        SetMenuText(MENU_TAKE);
        SetMenuText(MENU_BAG);
      }
      SetMenuText(MENU_INFO);
    }
  } else {
    if (s.displayMonItemId === ITEM_NONE) {
      if (s.displayMonSpecies === SPECIES_NONE) return false;
      SetMenuText(MENU_GIVE);
    } else {
      if (ItemIsMail(s.displayMonItemId) === true) return false;
      SetMenuText(MENU_SWITCH);
    }
  }

  SetMenuText(MENU_CANCEL);
  return true;
}

// ─── :8082 SetSelectionMenuTexts (MOVE_ITEMS → SetMenuTexts_Item). ───
function SetSelectionMenuTexts(): boolean {
  InitMenu();
  if (sStorage!.boxOption !== OPTION_MOVE_ITEMS) return SetMenuTexts_Mon();
  return SetMenuTexts_Item();
}

// ─── ClearBottomWindow (:env 4250) ───
function ClearBottomWindow(): void {
  ClearStdWindowAndFrameToTransparent(WIN_MESSAGE, false);
  ScheduleBgCopyTilemapToVram(0);
}

// ─── :3043 Task_ShowMarkMenu — menu MARQUER interactif (OpenMonMarkingsMenu + HandleInput) ───
function Task_ShowMarkMenu(taskId: number): void {
  void taskId;
  const s = sStorage!;
  switch (s.state) {
    case 0:
      PrintMessage(MSG_MARK_POKE);
      s.markMenu.markings = s.displayMonMarkings;
      OpenMonMarkingsMenu(s.displayMonMarkings, 0xb0, 0x10);
      s.state++;
      break;
    case 1:
      if (!HandleMonMarkingsMenuInput()) {
        FreeMonMarkingsMenu();
        ClearBottomWindow();
        SetMonMarkings(s.markMenu.markings ?? 0);
        RefreshDisplayMonData();
        SetPokeStorageTask(Task_PokeStorageMain);
      }
      break;
  }
}

// ─── :6759 SetMonMarkings — écrit les marques sur le mon (moving / party / box) ───
function SetMonMarkings(markings: number): void {
  const s = sStorage!;
  s.displayMonMarkings = markings;
  if (sIsMonBeingMoved) {
    (s.movingMon as unknown as { markings?: number }).markings = markings;
  } else {
    if (sCursorArea === CURSOR_AREA_IN_PARTY)
      (gPlayerParty[sCursorPosition] as unknown as { markings?: number }).markings = markings;
    if (sCursorArea === CURSOR_AREA_IN_BOX) {
      const boxMon = GetBoxedMonPtr(StorageGetCurrentBox(), sCursorPosition);
      if (boxMon) (boxMon as unknown as { markings?: number }).markings = markings;
    }
  }
}

// ─── PrintMessage (:4273) — message du bas. sMessages FR (strings.c gText_* :867-879) des ids du
// flux menu ; placeholder {DYNAMIC 0} → nom du mon affiché/relâché (DynamicPlaceholderTextUtil). ───
// sMessages (:1065) — table du décomp : MSG_* → NOM gText_* + varKind. AUCUN texte hardcodé : le FR
// est résolu au runtime via getString() depuis strings.json (donnée extraite du décomp = source 1:1).
const sMessages: Record<number, { gText: string; varKind: number }> = {
  [MSG_EXIT_BOX]: { gText: 'gText_ExitFromBox', varKind: MSG_VAR_NONE },
  [MSG_WHAT_YOU_DO]: { gText: 'gText_WhatDoYouWantToDo', varKind: MSG_VAR_NONE },
  [MSG_PICK_A_THEME]: { gText: 'gText_PleasePickATheme', varKind: MSG_VAR_NONE },
  [MSG_PICK_A_WALLPAPER]: { gText: 'gText_PickTheWallpaper', varKind: MSG_VAR_NONE },
  [MSG_IS_SELECTED]: { gText: 'gText_PkmnIsSelected', varKind: MSG_VAR_MON_NAME_1 },
  [MSG_JUMP_TO_WHICH_BOX]: { gText: 'gText_JumpToWhichBox', varKind: MSG_VAR_NONE },
  [MSG_DEPOSIT_IN_WHICH_BOX]: { gText: 'gText_DepositInWhichBox', varKind: MSG_VAR_NONE },
  [MSG_WAS_DEPOSITED]: { gText: 'gText_PkmnWasDeposited', varKind: MSG_VAR_MON_NAME_1 },
  [MSG_BOX_IS_FULL]: { gText: 'gText_BoxIsFull2', varKind: MSG_VAR_NONE },
  [MSG_RELEASE_POKE]: { gText: 'gText_ReleaseThisPokemon', varKind: MSG_VAR_NONE },
  [MSG_WAS_RELEASED]: { gText: 'gText_PkmnWasReleased', varKind: MSG_VAR_RELEASE_MON_1 },
  [MSG_BYE_BYE]: { gText: 'gText_ByeByePkmn', varKind: MSG_VAR_RELEASE_MON_3 },
  [MSG_MARK_POKE]: { gText: 'gText_MarkYourPkmn', varKind: MSG_VAR_NONE },
  [MSG_LAST_POKE]: { gText: 'gText_ThatsYourLastPkmn', varKind: MSG_VAR_NONE },
  [MSG_PARTY_FULL]: { gText: 'gText_YourPartysFull', varKind: MSG_VAR_NONE },
  [MSG_HOLDING_POKE]: { gText: 'gText_YoureHoldingAPkmn', varKind: MSG_VAR_NONE },
  [MSG_WHICH_ONE_WILL_TAKE]: { gText: 'gText_WhichOneWillYouTake', varKind: MSG_VAR_NONE },
  [MSG_CANT_RELEASE_EGG]: { gText: 'gText_YouCantReleaseAnEgg', varKind: MSG_VAR_NONE },
  [MSG_CONTINUE_BOX]: { gText: 'gText_ContinueBoxOperations', varKind: MSG_VAR_NONE },
  [MSG_CAME_BACK]: { gText: 'gText_PkmnCameBack', varKind: MSG_VAR_MON_NAME_1 },
  [MSG_WORRIED]: { gText: 'gText_WasItWorriedAboutYou', varKind: MSG_VAR_NONE },
  [MSG_SURPRISE]: { gText: 'gText_FourEllipsesExclamation', varKind: MSG_VAR_NONE },
  [MSG_PLEASE_REMOVE_MAIL]: { gText: 'gText_PleaseRemoveTheMail', varKind: MSG_VAR_NONE },
  [MSG_IS_SELECTED2]: { gText: 'gText_PkmnIsSelected', varKind: MSG_VAR_ITEM_NAME },
  [MSG_GIVE_TO_MON]: { gText: 'gText_GiveToAPkmn', varKind: MSG_VAR_NONE },
  [MSG_PLACED_IN_BAG]: { gText: 'gText_PlacedItemInBag', varKind: MSG_VAR_ITEM_NAME },
  [MSG_BAG_FULL]: { gText: 'gText_BagIsFull2', varKind: MSG_VAR_NONE },
  [MSG_PUT_IN_BAG]: { gText: 'gText_PutItemInBag', varKind: MSG_VAR_NONE },
  [MSG_ITEM_IS_HELD]: { gText: 'gText_ItemIsNowHeld', varKind: MSG_VAR_ITEM_NAME },
  [MSG_CHANGED_TO_ITEM]: { gText: 'gText_ChangedToNewItem', varKind: MSG_VAR_ITEM_NAME },
  [MSG_CANT_STORE_MAIL]: { gText: 'gText_MailCantBeStored', varKind: MSG_VAR_NONE },
};
function PrintMessage(id: number): void {
  const s = sStorage!;
  const entry = sMessages[id];
  let text = entry ? getString(entry.gText) : '';  // texte FR 1:1 depuis strings.json (donnée du décomp)
  if (entry) {
    // Placeholder décomp {DYNAMIC 0} (= DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, …)) : substitution
    // directe dans la string (notre modèle texte = string JS, pas buffer d'octets GBA — résultat identique).
    if (entry.varKind === MSG_VAR_MON_NAME_1) text = text.replace('{DYNAMIC 0}', s.displayMonName);
    else if (entry.varKind === MSG_VAR_RELEASE_MON_1 || entry.varKind === MSG_VAR_RELEASE_MON_3) text = text.replace('{DYNAMIC 0}', s.releaseMonName);
    // :4292 MSG_VAR_ITEM_NAME : nom de l'objet en main (IsMovingItem) ou celui du mon affiché, trim espaces.
    else if (entry.varKind === MSG_VAR_ITEM_NAME) text = text.replace('{DYNAMIC 0}', (IsMovingItem() ? GetMovingItemName() : s.displayMonItemName).replace(/ +$/, ''));
  }
  FillWindowPixelBuffer(WIN_MESSAGE, PIXEL_FILL_1);
  AddTextPrinterParameterized(WIN_MESSAGE, FONT_NORMAL, text, 0, 1, TEXT_SKIP_DRAW, null);
  DrawTextBorderOuter(WIN_MESSAGE, 2, 14);  // :4309 cadre « outer » du PC (tiles chargées à 2 via :1768) —
  // PAS DrawDialogueFrame (cadre overworld, tiles non chargées dans le PC → bords noirs glitchés).
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
/** 1:1 `static bool8 IsRemovingLastPartyMon(void)` (:6775) — vrai si on s'apprête à retirer de
 *  l'équipe son dernier POKéMON en état de combattre (garde-fou anti-équipe-vide). */
function IsRemovingLastPartyMon(): boolean {
  return sCursorArea === CURSOR_AREA_IN_PARTY && !sIsMonBeingMoved
    && CountPartyAliveNonEggMonsExcept(sCursorPosition) === 0;
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
        case MENU_MOVE:  // :2611 — refus (state 3) si dernier mon utilisable de l'équipe
          if (IsRemovingLastPartyMon()) s.state = 3;
          else { PlaySE(0x5 /* SE_SELECT */); ClearBottomWindow(); SetPokeStorageTask(Task_MoveMon); }
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
        case MENU_STORE:  // :2645 — refus si dernier mon utilisable (3) ou si le mon tient une lettre (4)
          if (IsRemovingLastPartyMon()) s.state = 3;
          else if (ItemIsMail(s.displayMonItemId)) s.state = 4;
          else { PlaySE(0x5 /* SE_SELECT */); ClearBottomWindow(); SetPokeStorageTask(Task_DepositMenu); }
          break;
        case MENU_SUMMARY:  // :2650
          PlaySE(0x5 /* SE_SELECT */); SetPokeStorageTask(Task_ShowMonSummary);
          break;
        case MENU_MARK:  // :2684
          PlaySE(0x5 /* SE_SELECT */); SetPokeStorageTask(Task_ShowMarkMenu);
          break;
        case MENU_RELEASE:  // :2661 — refus si dernier mon utilisable (3) / œuf (5) / lettre (4)
          if (IsRemovingLastPartyMon()) s.state = 3;
          else if (s.displayMonIsEgg) s.state = 5;
          else if (ItemIsMail(s.displayMonItemId)) s.state = 4;
          else { PlaySE(0x5 /* SE_SELECT */); SetPokeStorageTask(Task_ReleaseMon); }
          break;
        case MENU_TAKE:  // :2688 (MOVE_ITEMS)
          PlaySE(0x5 /* SE_SELECT */); SetPokeStorageTask(Task_TakeItemForMoving);
          break;
        case MENU_GIVE:  // :2692
          PlaySE(0x5 /* SE_SELECT */); SetPokeStorageTask(Task_GiveMovingItemToMon);
          break;
        case MENU_BAG:  // :2696
          SetPokeStorageTask(Task_ItemToBag);
          break;
        case MENU_SWITCH:  // :2699
          PlaySE(0x5 /* SE_SELECT */); SetPokeStorageTask(Task_SwitchSelectedItem);
          break;
        case MENU_GIVE_2:  // :2703 (donner un objet du sac = reopening ITEM_FROM_BAG)
          PlaySE(0x5 /* SE_SELECT */); SetPokeStorageTask(Task_GiveItemFromBag);
          break;
        case MENU_INFO:  // :2707
          SetPokeStorageTask(Task_ShowItemInfo);
          break;
      }
      break;
    case 3:  // :2712 — refus : dernier POKéMON utilisable de l'équipe
      PlaySE(0x20 /* SE_FAILURE */); PrintMessage(MSG_LAST_POKE); s.state = 6;
      break;
    case 5:  // :2717 — refus : impossible de relâcher un ŒUF
      PlaySE(0x20 /* SE_FAILURE */); PrintMessage(MSG_CANT_RELEASE_EGG); s.state = 6;
      break;
    case 4:  // :2722 — refus : le POKéMON tient une LETTRE, la retirer d'abord
      PlaySE(0x20 /* SE_FAILURE */); PrintMessage(MSG_PLEASE_REMOVE_MAIL); s.state = 6;
      break;
    case 6:  // :2727 — attend un input puis retour au main
      if (JOY_NEW(A_BUTTON | B_BUTTON | DPAD_ANY)) { ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain); }
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
    // :7092 A → SetSelectionMenuTexts → menu, OU (auto-action + MOVE_MONS + pas de mon tenu)
    // démarre une SÉLECTION MULTIPLE (MultiMove).
    if (JOY_NEW(A_BUTTON) && SetSelectionMenuTexts()) {
      if (!sAutoActionOn) return INPUT_IN_MENU;
      if (s.boxOption !== OPTION_MOVE_MONS || sIsMonBeingMoved) {
        // Auto-action dispatch direct des autres actions (dépôt/retrait/…) = ouvre le
        // menu contextuel (le dispatch immédiat par item = confort auto-action, à compléter).
        return INPUT_IN_MENU;
      } else {
        s.inBoxMovingMode = MOVE_MODE_MULTIPLE_SELECTING;
        return INPUT_MULTIMOVE_START;
      }
    }
    if (JOY_NEW(B_BUTTON)) return INPUT_PRESSED_B;
    if (JOY_NEW(SELECT_BUTTON)) { ToggleCursorAutoAction(); return INPUT_NONE; }
    retVal = INPUT_NONE;
  } while (false);
  if (retVal !== INPUT_NONE) SetCursorPosition(cursorArea, cursorPosition);
  return retVal;
}

// :7000 HandleInput_InBox — dispatch selon le mode de déplacement dans la boîte.
function HandleInput_InBox(): number {
  switch (sStorage!.inBoxMovingMode) {
    case MOVE_MODE_MULTIPLE_SELECTING: return InBoxInput_SelectingMultiple();
    case MOVE_MODE_MULTIPLE_MOVING: return InBoxInput_MovingMultiple();
    default: return InBoxInput_Normal(); // MOVE_MODE_NORMAL
  }
}

// :7153 InBoxInput_SelectingMultiple — A tenu + DPAD étend la sélection ; relâcher A → ramasse
// le groupe (GRAB) ou, si un seul mon, retombe en déplacement simple (SINGLE→CANCEL).
function InBoxInput_SelectingMultiple(): number {
  const s = sStorage!;
  if (JOY_HELD(A_BUTTON)) {
    if (JOY_REPEAT(DPAD_UP)) {
      if (Math.floor(sCursorPosition / IN_BOX_COLUMNS) !== 0) {
        SetCursorPosition(CURSOR_AREA_IN_BOX, sCursorPosition - IN_BOX_COLUMNS);
        return INPUT_MULTIMOVE_CHANGE_SELECTION;
      }
      return INPUT_MULTIMOVE_UNABLE;
    } else if (JOY_REPEAT(DPAD_DOWN)) {
      if (sCursorPosition + IN_BOX_COLUMNS < IN_BOX_COUNT) {
        SetCursorPosition(CURSOR_AREA_IN_BOX, sCursorPosition + IN_BOX_COLUMNS);
        return INPUT_MULTIMOVE_CHANGE_SELECTION;
      }
      return INPUT_MULTIMOVE_UNABLE;
    } else if (JOY_REPEAT(DPAD_LEFT)) {
      if (sCursorPosition % IN_BOX_COLUMNS !== 0) {
        SetCursorPosition(CURSOR_AREA_IN_BOX, sCursorPosition - 1);
        return INPUT_MULTIMOVE_CHANGE_SELECTION;
      }
      return INPUT_MULTIMOVE_UNABLE;
    } else if (JOY_REPEAT(DPAD_RIGHT)) {
      if ((sCursorPosition + 1) % IN_BOX_COLUMNS !== 0) {
        SetCursorPosition(CURSOR_AREA_IN_BOX, sCursorPosition + 1);
        return INPUT_MULTIMOVE_CHANGE_SELECTION;
      }
      return INPUT_MULTIMOVE_UNABLE;
    }
    return INPUT_NONE;
  } else {
    if (MultiMove_GetOrigin() === sCursorPosition) {
      // Sélection multiple mais un seul mon choisi → déplacement simple.
      s.inBoxMovingMode = MOVE_MODE_NORMAL;
      { const shadow = _spr(s.cursorShadowSprite); if (shadow) shadow.invisible = false; }
      return INPUT_MULTIMOVE_SINGLE;
    } else {
      sIsMonBeingMoved = (s.displayMonSpecies !== SPECIES_NONE);
      s.inBoxMovingMode = MOVE_MODE_MULTIPLE_MOVING;
      sMovingMonOrigBoxId = StorageGetCurrentBox();
      return INPUT_MULTIMOVE_GRAB_SELECTION;
    }
  }
}

// :7229 InBoxInput_MovingMultiple — DPAD déplace le groupe (TryMoveGroup), A le pose, B = unable.
function InBoxInput_MovingMultiple(): number {
  const s = sStorage!;
  if (JOY_REPEAT(DPAD_UP)) {
    if (MultiMove_TryMoveGroup(0)) {
      SetCursorPosition(CURSOR_AREA_IN_BOX, sCursorPosition - IN_BOX_COLUMNS);
      return INPUT_MULTIMOVE_MOVE_MONS;
    }
    return INPUT_MULTIMOVE_UNABLE;
  } else if (JOY_REPEAT(DPAD_DOWN)) {
    if (MultiMove_TryMoveGroup(1)) {
      SetCursorPosition(CURSOR_AREA_IN_BOX, sCursorPosition + IN_BOX_COLUMNS);
      return INPUT_MULTIMOVE_MOVE_MONS;
    }
    return INPUT_MULTIMOVE_UNABLE;
  } else if (JOY_REPEAT(DPAD_LEFT)) {
    if (MultiMove_TryMoveGroup(2)) {
      SetCursorPosition(CURSOR_AREA_IN_BOX, sCursorPosition - 1);
      return INPUT_MULTIMOVE_MOVE_MONS;
    }
    return INPUT_SCROLL_LEFT;
  } else if (JOY_REPEAT(DPAD_RIGHT)) {
    if (MultiMove_TryMoveGroup(3)) {
      SetCursorPosition(CURSOR_AREA_IN_BOX, sCursorPosition + 1);
      return INPUT_MULTIMOVE_MOVE_MONS;
    }
    return INPUT_SCROLL_RIGHT;
  } else if (JOY_NEW(A_BUTTON)) {
    if (MultiMove_CanPlaceSelection()) {
      sIsMonBeingMoved = false;
      s.inBoxMovingMode = MOVE_MODE_NORMAL;
      return INPUT_MULTIMOVE_PLACE_MONS;
    }
    return INPUT_MULTIMOVE_UNABLE;
  } else if (JOY_NEW(B_BUTTON)) {
    return INPUT_MULTIMOVE_UNABLE;
  }
  return INPUT_NONE; // (option L/R scroll = confort, non transcrit)
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
    // :7447 A → menu box-options (SAUTER/DÉCO/NOM/ANNULER).
    if (JOY_NEW(A_BUTTON)) { AnimateBoxScrollArrows(false); AddBoxOptionsMenu(); return INPUT_BOX_OPTIONS; }
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
    case CURSOR_AREA_IN_BOX: return HandleInput_InBox();
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

// ─── :3378 Task_HandleBoxOptions — menu SAUTER/DÉCO/NOM/ANNULER ───
function Task_HandleBoxOptions(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      PrintMessage(MSG_WHAT_YOU_DO);
      AddMenu();
      s.state++;
      break;
    case 1:
      if (IsMenuLoading()) return;
      s.state++;
    // fallthrough
    case 2:
      switch (HandleMenuInput()) {
        case MENU_B_PRESSED:
        case MENU_CANCEL:
          AnimateBoxScrollArrows(true);
          ClearBottomWindow();
          SetPokeStorageTask(Task_PokeStorageMain);
          break;
        case MENU_NAME:
          PlaySE(0x5 /* SE_SELECT */);
          SetPokeStorageTask(Task_NameBox);
          break;
        case MENU_WALLPAPER:
          PlaySE(0x5);
          ClearBottomWindow();
          SetPokeStorageTask(Task_HandleWallpapers);
          break;
        case MENU_JUMP:
          PlaySE(0x5);
          ClearBottomWindow();
          SetPokeStorageTask(Task_JumpBox);
          break;
      }
      break;
  }
}
// ─── :3419 Task_HandleWallpapers — DÉCO : 2 menus (thèmes → wallpapers) + changement gfx ───
function Task_HandleWallpapers(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      AddWallpaperSetsMenu();
      PrintMessage(MSG_PICK_A_THEME);
      s.state++;
      break;
    case 1:
      if (!IsMenuLoading()) s.state++;
      break;
    case 2:
      s.wallpaperSetId = HandleMenuInput();
      switch (s.wallpaperSetId) {
        case MENU_B_PRESSED:
          AnimateBoxScrollArrows(true);
          ClearBottomWindow();
          SetPokeStorageTask(Task_PokeStorageMain);
          break;
        case MENU_SCENERY_1:
        case MENU_SCENERY_2:
        case MENU_SCENERY_3:
        case MENU_ETCETERA:
          PlaySE(0x5);
          RemoveMenu();
          s.wallpaperSetId -= MENU_WALLPAPER_SETS_START;
          s.state++;
          break;
        case MENU_FRIENDS:  // Walda (jamais atteint : IsWaldaWallpaperUnlocked=false)
          PlaySE(0x5);
          s.wallpaperId = WALLPAPER_FRIENDS;
          RemoveMenu();
          ClearBottomWindow();
          s.state = 6;
          break;
      }
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        AddWallpapersMenu(s.wallpaperSetId);
        PrintMessage(MSG_PICK_A_WALLPAPER);
        s.state++;
      }
      break;
    case 4:
      s.wallpaperId = HandleMenuInput();
      switch (s.wallpaperId) {
        case MENU_NOTHING_CHOSEN:
          break;
        case MENU_B_PRESSED:
          ClearBottomWindow();
          s.state = 0;
          break;
        default:
          PlaySE(0x5);
          ClearBottomWindow();
          s.wallpaperId -= MENU_WALLPAPERS_START;
          SetWallpaperForCurrentBox(s.wallpaperId);
          s.state++;
          break;
      }
      break;
    case 5:
      if (!DoWallpaperGfxChange()) {
        AnimateBoxScrollArrows(true);
        SetPokeStorageTask(Task_PokeStorageMain);
      }
      break;
    case 6:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        SetWallpaperForCurrentBox(s.wallpaperId);
        s.state = 5;
      }
      break;
  }
}
// ─── :3504 Task_JumpBox — SAUTER : ChooseBoxMenu → scroll direct ───
function Task_JumpBox(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      PrintMessage(MSG_JUMP_TO_WHICH_BOX);
      LoadChooseBoxMenuGfx(s.chooseBoxMenu, GFXTAG_CHOOSE_BOX_MENU, PALTAG_MISC_1, 3, false);
      CreateChooseBoxMenuSprites(StorageGetCurrentBox());
      s.state++;
      break;
    case 1:
      s.newCurrBoxId = HandleChooseBoxMenuInput();
      switch (s.newCurrBoxId) {
        case BOXID_NONE_CHOSEN:
          break;
        default:
          ClearBottomWindow();
          DestroyChooseBoxMenuSprites();
          FreeChooseBoxMenu();
          if (s.newCurrBoxId === BOXID_CANCELED || s.newCurrBoxId === StorageGetCurrentBox()) {
            AnimateBoxScrollArrows(true);
            SetPokeStorageTask(Task_PokeStorageMain);
          } else {
            s.state++;
          }
          break;
      }
      break;
    case 2:
      SetUpScrollToBox(s.newCurrBoxId);
      s.state++;
      break;
    case 3:
      if (!ScrollToBox()) {
        SetCurrentBox(s.newCurrBoxId);
        SetPokeStorageTask(Task_PokeStorageMain);
      }
      break;
  }
}
// ─── :3550 Task_NameBox — NOM : fade + changement d'écran (naming screen = lot séparé) ───
function Task_NameBox(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      // SaveMovingMon() : sauve le mon en déplacement (lot MultiMove) — pas de mon en déplacement ici.
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      s.state++;
      break;
    case 1:
      if (!UpdatePaletteFade()) {
        s.screenChangeType = SCREEN_CHANGE_NAME_BOX;
        SetPokeStorageTask(Task_ChangeScreen);
      }
      break;
  }
}
// ─── :4327 AddWallpaperSetsMenu + :4339 AddWallpapersMenu ───
function AddWallpaperSetsMenu(): void {
  InitMenu();
  SetMenuText(MENU_SCENERY_1);
  SetMenuText(MENU_SCENERY_2);
  SetMenuText(MENU_SCENERY_3);
  SetMenuText(MENU_ETCETERA);
  if (IsWaldaWallpaperUnlocked()) SetMenuText(MENU_FRIENDS);
  AddMenu();
}
function AddWallpapersMenu(wallpaperSet: number): void {
  InitMenu();
  switch (wallpaperSet) {
    case MENU_SCENERY_1 - MENU_WALLPAPER_SETS_START:
      SetMenuText(MENU_FOREST); SetMenuText(MENU_CITY); SetMenuText(MENU_DESERT); SetMenuText(MENU_SAVANNA);
      break;
    case MENU_SCENERY_2 - MENU_WALLPAPER_SETS_START:
      SetMenuText(MENU_CRAG); SetMenuText(MENU_VOLCANO); SetMenuText(MENU_SNOW); SetMenuText(MENU_CAVE);
      break;
    case MENU_SCENERY_3 - MENU_WALLPAPER_SETS_START:
      SetMenuText(MENU_BEACH); SetMenuText(MENU_SEAFLOOR); SetMenuText(MENU_RIVER); SetMenuText(MENU_SKY);
      break;
    case MENU_ETCETERA - MENU_WALLPAPER_SETS_START:
      SetMenuText(MENU_POLKADOT); SetMenuText(MENU_POKECENTER); SetMenuText(MENU_MACHINE); SetMenuText(MENU_SIMPLE);
      break;
  }
  AddMenu();
}
// ─── :5315 SetWallpaperForCurrentBox + :5322 DoWallpaperGfxChange + :5611 CycleBoxTitleColor ───
function SetWallpaperForCurrentBox(wallpaperId: number): void {
  const s = sStorage!;
  const boxId = StorageGetCurrentBox();
  SetBoxWallpaper(boxId, wallpaperId);
  s.wallpaperChangeState = 0;
}
function DoWallpaperGfxChange(): boolean {
  const s = sStorage!;
  switch (s.wallpaperChangeState) {
    case 0:
      BeginNormalPaletteFade(s.wallpaperPalBits, 1, 0, 16, RGB_WHITEALPHA);
      s.wallpaperChangeState++;
      break;
    case 1:
      if (!UpdatePaletteFade()) {
        LoadWallpaperGfx(StorageGetCurrentBox(), 0);
        s.wallpaperChangeState++;
      }
      break;
    case 2:
      if (WaitForWallpaperGfxLoad() === true) {
        CycleBoxTitleColor();
        BeginNormalPaletteFade(s.wallpaperPalBits, 1, 16, 0, RGB_WHITEALPHA);
        s.wallpaperChangeState++;
      }
      break;
    case 3:
      if (!UpdatePaletteFade()) s.wallpaperChangeState++;
      break;
    case 4:
      return false;
  }
  return true;
}
function CycleBoxTitleColor(): void {
  // sBoxTitleColors[wp] IDENTIQUES pour tous les wallpapers (constantes) → couleurs du titre inchangées.
  // Le décomp recopie sBoxTitleColors[wp] vers gPlttBufferUnfaded ; ici no-op 1:1 effectif.
}
// ─── SECTION Walda (:9661-9727) — wallpaper secret (event optionnel Émeraude, Route 121).
// Jamais débloqué chez nous (patternUnlocked reste false) → accesseurs 1:1 sur un état local
// `_waldaPhrase` (struct WaldaPhrase global.h:855 ; pas dans le save block, feature inerte).
const _waldaPhrase = { colors: new Uint16Array(2), text: [EOS] as number[], iconId: 0, patternId: 0, patternUnlocked: false };
const WALDA_WALLPAPERS_COUNT = 5;      // ARRAY_COUNT(sWaldaWallpapers) — tables gfx non portées (inerte)
const WALDA_WALLPAPER_ICONS_COUNT = 20; // ARRAY_COUNT(sWaldaWallpaperIcons)
/** 1:1 `void ResetWaldaWallpaper(void)` (:9661). */
function ResetWaldaWallpaper(): void {
  _waldaPhrase.iconId = 0;
  _waldaPhrase.patternId = 0;
  _waldaPhrase.patternUnlocked = false;
  _waldaPhrase.colors[0] = RGB(21, 25, 30);
  _waldaPhrase.colors[1] = RGB(6, 12, 24);
  _waldaPhrase.text[0] = EOS;
}
/** 1:1 `void SetWaldaWallpaperLockedOrUnlocked(bool32 unlocked)` (:9671). */
function SetWaldaWallpaperLockedOrUnlocked(unlocked: boolean): void { _waldaPhrase.patternUnlocked = unlocked; }
/** 1:1 `bool32 IsWaldaWallpaperUnlocked(void)` (:9676). */
function IsWaldaWallpaperUnlocked(): boolean { return _waldaPhrase.patternUnlocked; }
/** 1:1 `u32 GetWaldaWallpaperPatternId(void)` (:9681). */
function GetWaldaWallpaperPatternId(): number { return _waldaPhrase.patternId; }
/** 1:1 `void SetWaldaWallpaperPatternId(u8 id)` (:9686). */
function SetWaldaWallpaperPatternId(id: number): void { if (id < WALDA_WALLPAPERS_COUNT) _waldaPhrase.patternId = id; }
/** 1:1 `u32 GetWaldaWallpaperIconId(void)` (:9692). */
function GetWaldaWallpaperIconId(): number { return _waldaPhrase.iconId; }
/** 1:1 `void SetWaldaWallpaperIconId(u8 id)` (:9697). */
function SetWaldaWallpaperIconId(id: number): void { if (id < WALDA_WALLPAPER_ICONS_COUNT) _waldaPhrase.iconId = id; }
/** 1:1 `u16 *GetWaldaWallpaperColorsPtr(void)` (:9703). */
function GetWaldaWallpaperColorsPtr(): Uint16Array { return _waldaPhrase.colors; }
/** 1:1 `void SetWaldaWallpaperColors(u16 color1, u16 color2)` (:9708). */
function SetWaldaWallpaperColors(color1: number, color2: number): void { _waldaPhrase.colors[0] = color1; _waldaPhrase.colors[1] = color2; }
/** 1:1 `u8 *GetWaldaPhrasePtr(void)` (:9714). */
function GetWaldaPhrasePtr(): number[] { return _waldaPhrase.text; }
/** 1:1 `void SetWaldaPhrase(const u8 *src)` (:9719) — StringCopy. */
function SetWaldaPhrase(src: number[]): void { _waldaPhrase.text = src.slice(); }
/** 1:1 `bool32 IsWaldaPhraseEmpty(void)` (:9724). */
function IsWaldaPhraseEmpty(): boolean { return _waldaPhrase.text[0] === EOS; }
const WALLPAPER_FRIENDS = 16;     // wallpaper Walda (index après les 16 standards)
const RGB_WHITEALPHA = 0xFFFF;    // RGB_WHITE (0x7FFF) | 0x8000 (bit alpha)
// DMA3 async : nos copies de tilemap BG sont synchrones → jamais busy.
function IsDma3ManagerBusyWithBgCopy(): boolean { return false; }

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

// Buffer charCodes JS pour DoNamingScreen (pattern egg_hatch `_nicknameBuffer`). Le naming
// screen (SaveInputText) le remplit du texte saisi ; NameBox_SetAndReturn le relit au retour.
const _boxNameBuffer: number[] = [];
// Callback naming screen pour RENOMMER une boîte. Le décomp (:3762) passe CB2_ReturnToPokeStorage
// DIRECTEMENT (le naming écrit dans le save block via GetBoxNamePtr = pointeur). Chez nous les noms
// de boîte sont des strings immuables → on wrappe : applique le buffer au save block PUIS rouvre le PC.
function NameBox_SetAndReturn(): void {
  const name = _boxNameBuffer.length ? String.fromCharCode(..._boxNameBuffer) : '';
  const st = GetPokemonStorage() as unknown as { boxNames?: string[] };
  if (!st.boxNames) st.boxNames = [];
  if (name.length) st.boxNames[StorageGetCurrentBox()] = name;
  CB2_ReturnToPokeStorage();
}

// :1691 CB2_ExitPokeStorage — retour OW puis FieldTask_ReturnToPcMenu recrée le menu PC. ───
function GetCurrentBoxOption(): number { return sCurrentBoxOption; }
function IsMonBeingMoved(): boolean { return sIsMonBeingMoved; }
function MultiMove_Free(): void { sMultiMove = null; }

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION 1:1 — MultiMove (:8131-8626) : sélection/déplacement d'un GROUPE
// de Pokémon dans une boîte. Le BG0 passe en 256 couleurs (8bpp) ; les icônes des
// mons sélectionnés sont blittées dans multiMoveWindowId, puis le BG glisse pour
// l'animation. sMultiMove->boxMons[] = copies (par valeur) des mons ramassés.
// ═══════════════════════════════════════════════════════════════════════════
const BG_COORD_SET = 0, BG_COORD_ADD = 1;              // bg.h:26
const Q_8_8 = (n: number): number => n << 8;           // fixed-point 8.8 (n * 256)
const REG_OFFSET_BG0CNT_MM = 0x08;                     // io_reg.h REG_OFFSET_BG0CNT
const BGCNT_256COLOR_MM = 0x0080;                      // bg.h bit 7 du BGxCNT

// :8131 MultiMove_SetFunction
function MultiMove_SetFunction(id: number): void {
  sMultiMove!.funcId = id;
  sMultiMove!.state = 0;
}
// :8138 MultiMove_RunFunction — TRUE si la fonction appelée a encore du travail.
function MultiMove_RunFunction(): boolean {
  switch (sMultiMove!.funcId) {
    case MULTIMOVE_START: return MultiMove_Start();
    case MULTIMOVE_CANCEL: return MultiMove_Cancel();
    case MULTIMOVE_CHANGE_SELECTION: return MultiMove_ChangeSelection();
    case MULTIMOVE_GRAB_SELECTION: return MultiMove_GrabSelection();
    case MULTIMOVE_MOVE_MONS: return MultiMove_MoveMons();
    case MULTIMOVE_PLACE_MONS: return MultiMove_PlaceMons();
  }
  return false;
}
// :8158 MultiMove_Start
function MultiMove_Start(): boolean {
  const m = sMultiMove!;
  switch (m.state) {
    case 0:
      HideBg(0);
      TryLoadAllMonIconPalettesAtOffset(BG_PLTT_ID(8));
      m.state++;
      break;
    case 1: {
      const cr = GetCursorBoxColumnAndRow();
      m.fromColumn = cr.column; m.fromRow = cr.row;
      m.toColumn = m.fromColumn;
      m.toRow = m.fromRow;
      ChangeBgX(0, -1024, BG_COORD_SET);
      ChangeBgY(0, -1024, BG_COORD_SET);
      FillBgTilemapBufferRect_Palette0(0, 0, 0, 0, 0x20, 0x20);
      FillWindowPixelBuffer8Bit(sStorage!.multiMoveWindowId, PIXEL_FILL(0));
      MultiMove_SetIconToBg(m.fromColumn, m.fromRow);
      SetBgAttribute(0, BG_ATTR_PALETTEMODE, 1);
      PutWindowTilemap(sStorage!.multiMoveWindowId);
      CopyWindowToVram8Bit(sStorage!.multiMoveWindowId, COPYWIN_FULL);
      BlendPalettes(0x3F00, 8, RGB_WHITE);
      StartCursorAnim(CURSOR_ANIM_OPEN);
      SetGpuRegBits(REG_OFFSET_BG0CNT_MM, BGCNT_256COLOR_MM);
      m.state++;
      break;
    }
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy()) { ShowBg(0); return false; }
      break;
  }
  return true;
}
// :8196 MultiMove_Cancel
function MultiMove_Cancel(): boolean {
  const m = sMultiMove!;
  switch (m.state) {
    case 0:
      HideBg(0);
      m.state++;
      break;
    case 1:
      MultiMove_ResetBg();
      StartCursorAnim(CURSOR_ANIM_BOUNCE);
      m.state++;
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        SetCursorPriorityTo1();
        LoadPalette(GetTextWindowPalette(3)!, BG_PLTT_ID(13), 32 /* PLTT_SIZE_4BPP */);
        ShowBg(0);
        return false;
      }
      break;
  }
  return true;
}
// :8223 MultiMove_ChangeSelection
function MultiMove_ChangeSelection(): boolean {
  const m = sMultiMove!;
  switch (m.state) {
    case 0:
      if (!UpdateCursorPos()) {
        const cr = GetCursorBoxColumnAndRow();
        m.cursorColumn = cr.column; m.cursorRow = cr.row;
        MultiMove_UpdateSelectedIcons();
        m.toColumn = m.cursorColumn;
        m.toRow = m.cursorRow;
        CopyWindowToVram8Bit(sStorage!.multiMoveWindowId, COPYWIN_GFX);
        m.state++;
      }
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy();
  }
  return true;
}
// :8245 MultiMove_GrabSelection
function MultiMove_GrabSelection(): boolean {
  const m = sMultiMove!;
  let movingBg: boolean, movingMon: boolean;
  switch (m.state) {
    case 0:
      MultiMove_GetMonsFromSelection();
      MultiMove_RemoveMonsFromBox();
      InitMultiMonPlaceChange(false);
      m.state++;
      break;
    case 1:
      if (!DoMonPlaceChange()) {
        StartCursorAnim(CURSOR_ANIM_FIST);
        MultiMove_InitMove(0, Q_8_8(1), 8);
        InitMultiMonPlaceChange(true);
        m.state++;
      }
      break;
    case 2:
      movingBg = MultiMove_UpdateMove() !== 0;
      movingMon = DoMonPlaceChange();
      if (!movingBg && !movingMon) return false; // terminé
      break;
  }
  return true;
}
// :8277 MultiMove_MoveMons
function MultiMove_MoveMons(): boolean {
  const movingCursor = UpdateCursorPos();
  const movingBg = MultiMove_UpdateMove() !== 0;
  return movingCursor || movingBg;
}
// :8288 MultiMove_PlaceMons
function MultiMove_PlaceMons(): boolean {
  const m = sMultiMove!;
  switch (m.state) {
    case 0:
      MultiMove_SetPlacedMonData();
      MultiMove_InitMove(0, Q_8_8(-1), 8);
      InitMultiMonPlaceChange(false);
      m.state++;
      break;
    case 1:
      if (!DoMonPlaceChange() && MultiMove_UpdateMove() === 0) {
        MultiMove_CreatePlacedMonIcons();
        StartCursorAnim(CURSOR_ANIM_OPEN);
        InitMultiMonPlaceChange(true);
        HideBg(0);
        m.state++;
      }
      break;
    case 2:
      if (!DoMonPlaceChange()) {
        StartCursorAnim(CURSOR_ANIM_BOUNCE);
        MultiMove_ResetBg();
        m.state++;
      }
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy()) {
        LoadPalette(GetTextWindowPalette(3)!, BG_PLTT_ID(13), 32 /* PLTT_SIZE_4BPP */);
        SetCursorPriorityTo1();
        ShowBg(0);
        return false;
      }
      break;
  }
  return true;
}
// :8330 MultiMove_TryMoveGroup — TRUE si le déplacement du groupe a réussi.
function MultiMove_TryMoveGroup(dir: number): boolean {
  const m = sMultiMove!;
  switch (dir) {
    case 0: // Up
      if (m.minRow === 0) return false;
      m.minRow--;
      MultiMove_InitMove(0, Q_8_8(4), 6);
      break;
    case 1: // Down
      if (m.minRow + m.rowsTotal >= IN_BOX_ROWS) return false;
      m.minRow++;
      MultiMove_InitMove(0, Q_8_8(-4), 6);
      break;
    case 2: // Left
      if (m.minColumn === 0) return false;
      m.minColumn--;
      MultiMove_InitMove(Q_8_8(4), 0, 6);
      break;
    case 3: // Right
      if (m.minColumn + m.columnsTotal >= IN_BOX_COLUMNS) return false;
      m.minColumn++;
      MultiMove_InitMove(Q_8_8(-4), 0, 6);
      break;
  }
  return true;
}
// :8362 MultiMove_UpdateSelectedIcons
function MultiMove_UpdateSelectedIcons(): void {
  const m = sMultiMove!;
  const columnChange = (Math.abs(m.fromColumn - m.cursorColumn)) - (Math.abs(m.fromColumn - m.toColumn));
  const rowChange = (Math.abs(m.fromRow - m.cursorRow)) - (Math.abs(m.fromRow - m.toRow));
  if (columnChange > 0)
    MultiMove_SelectColumn(m.cursorColumn, m.fromRow, m.toRow);
  if (columnChange < 0) {
    MultiMove_DeselectColumn(m.toColumn, m.fromRow, m.toRow);
    MultiMove_SelectColumn(m.cursorColumn, m.fromRow, m.toRow);
  }
  if (rowChange > 0)
    MultiMove_SelectRow(m.cursorRow, m.fromColumn, m.toColumn);
  if (rowChange < 0) {
    MultiMove_DeselectRow(m.toRow, m.fromColumn, m.toColumn);
    MultiMove_SelectRow(m.cursorRow, m.fromColumn, m.toColumn);
  }
}
// :8386 MultiMove_SelectColumn / :8398 SelectRow / :8410 DeselectColumn / :8422 DeselectRow
function MultiMove_SelectColumn(column: number, minRow: number, maxRow: number): void {
  if (minRow > maxRow) { const t = minRow; minRow = maxRow; maxRow = t; }
  while (minRow <= maxRow) MultiMove_SetIconToBg(column, minRow++);
}
function MultiMove_SelectRow(row: number, minColumn: number, maxColumn: number): void {
  if (minColumn > maxColumn) { const t = minColumn; minColumn = maxColumn; maxColumn = t; }
  while (minColumn <= maxColumn) MultiMove_SetIconToBg(minColumn++, row);
}
function MultiMove_DeselectColumn(column: number, minRow: number, maxRow: number): void {
  if (minRow > maxRow) { const t = minRow; minRow = maxRow; maxRow = t; }
  while (minRow <= maxRow) MultiMove_ClearIconFromBg(column, minRow++);
}
function MultiMove_DeselectRow(row: number, minColumn: number, maxColumn: number): void {
  if (minColumn > maxColumn) { const t = minColumn; minColumn = maxColumn; maxColumn = t; }
  while (minColumn <= maxColumn) MultiMove_ClearIconFromBg(minColumn++, row);
}
// :8434 MultiMove_SetIconToBg — blit l'icône du mon (x,y) dans le window 8bpp.
function MultiMove_SetIconToBg(x: number, y: number): void {
  const position = x + (IN_BOX_COLUMNS * y);
  const species = GetCurrentBoxMonData(position, MON_DATA_SPECIES_OR_EGG);
  const personality = GetCurrentBoxMonData(position, MON_DATA_PERSONALITY);
  if (species !== SPECIES_NONE) {
    const iconGfx = GetMonIconPtr(species, personality, true);
    const index = GetValidMonIconPalIndex(species) + 8;
    if (iconGfx)
      BlitBitmapRectToWindow4BitTo8Bit(sStorage!.multiMoveWindowId, iconGfx, 0, 0, 32, 32, 24 * x, 24 * y, 32, 32, index);
  }
}
// :8459 MultiMove_ClearIconFromBg
function MultiMove_ClearIconFromBg(x: number, y: number): void {
  const position = x + (IN_BOX_COLUMNS * y);
  const species = GetCurrentBoxMonData(position, MON_DATA_SPECIES_OR_EGG);
  if (species !== SPECIES_NONE)
    FillWindowPixelRect8Bit(sStorage!.multiMoveWindowId, PIXEL_FILL(0), 24 * x, 24 * y, 32, 32);
}
// :8475 MultiMove_InitMove / :8482 MultiMove_UpdateMove
function MultiMove_InitMove(x: number, y: number, moveSteps: number): void {
  const m = sMultiMove!;
  m.bgX = x; m.bgY = y; m.bgMoveSteps = moveSteps;
}
function MultiMove_UpdateMove(): number {
  const m = sMultiMove!;
  if (m.bgMoveSteps !== 0) {
    ChangeBgX(0, m.bgX, BG_COORD_ADD);
    ChangeBgY(0, m.bgY, BG_COORD_ADD);
    m.bgMoveSteps--;
  }
  return m.bgMoveSteps;
}
// :8495 MultiMove_GetMonsFromSelection — stocke (copie par valeur) les mons ramassés.
function MultiMove_GetMonsFromSelection(): void {
  const m = sMultiMove!;
  m.minColumn = Math.min(m.fromColumn, m.toColumn);
  m.minRow = Math.min(m.fromRow, m.toRow);
  m.columnsTotal = Math.abs(m.fromColumn - m.toColumn) + 1;
  m.rowsTotal = Math.abs(m.fromRow - m.toRow) + 1;
  const boxId = StorageGetCurrentBox();
  let monArrayId = 0;
  const columnCount = m.minColumn + m.columnsTotal;
  const rowCount = m.minRow + m.rowsTotal;
  for (let i = m.minRow; i < rowCount; i++) {
    let boxPosition = (IN_BOX_COLUMNS * i) + m.minColumn;
    for (let j = m.minColumn; j < columnCount; j++) {
      const boxMon = GetBoxedMonPtr(boxId, boxPosition);
      if (boxMon != null)
        m.boxMons[monArrayId] = structuredClone(boxMon) as Pokemon; // *boxMon = copie par valeur
      monArrayId++;
      boxPosition++;
    }
  }
}
// :8530 MultiMove_RemoveMonsFromBox — efface les mons ramassés de leurs positions d'origine.
function MultiMove_RemoveMonsFromBox(): void {
  const m = sMultiMove!;
  const columnCount = m.minColumn + m.columnsTotal;
  const rowCount = m.minRow + m.rowsTotal;
  const boxId = StorageGetCurrentBox();
  for (let i = m.minRow; i < rowCount; i++) {
    let boxPosition = (IN_BOX_COLUMNS * i) + m.minColumn;
    for (let j = m.minColumn; j < columnCount; j++) {
      DestroyBoxMonIconAtPosition(boxPosition);
      ZeroBoxMonAt(boxId, boxPosition);
      boxPosition++;
    }
  }
}
// :8549 MultiMove_CreatePlacedMonIcons
function MultiMove_CreatePlacedMonIcons(): void {
  const m = sMultiMove!;
  const columnCount = m.minColumn + m.columnsTotal;
  const rowCount = m.minRow + m.rowsTotal;
  let monArrayId = 0;
  for (let i = m.minRow; i < rowCount; i++) {
    let boxPosition = (IN_BOX_COLUMNS * i) + m.minColumn;
    for (let j = m.minColumn; j < columnCount; j++) {
      if (m.boxMons[monArrayId] && GetBoxMonData(m.boxMons[monArrayId], MON_DATA_SANITY_HAS_SPECIES))
        CreateBoxMonIconAtPos(boxPosition);
      monArrayId++;
      boxPosition++;
    }
  }
}
// :8569 MultiMove_SetPlacedMonData
function MultiMove_SetPlacedMonData(): void {
  const m = sMultiMove!;
  const columnCount = m.minColumn + m.columnsTotal;
  const rowCount = m.minRow + m.rowsTotal;
  const boxId = StorageGetCurrentBox();
  let monArrayId = 0;
  for (let i = m.minRow; i < rowCount; i++) {
    let boxPosition = (IN_BOX_COLUMNS * i) + m.minColumn;
    for (let j = m.minColumn; j < columnCount; j++) {
      if (m.boxMons[monArrayId] && GetBoxMonData(m.boxMons[monArrayId], MON_DATA_SANITY_HAS_SPECIES))
        SetBoxMonAt(boxId, boxPosition, m.boxMons[monArrayId]!);
      boxPosition++;
      monArrayId++;
    }
  }
}
// :8590 MultiMove_ResetBg
function MultiMove_ResetBg(): void {
  ChangeBgX(0, 0, BG_COORD_SET);
  ChangeBgY(0, 0, BG_COORD_SET);
  SetBgAttribute(0, BG_ATTR_PALETTEMODE, 0);
  ClearGpuRegBits(REG_OFFSET_BG0CNT_MM, BGCNT_256COLOR_MM);
  FillBgTilemapBufferRect_Palette0(0, 0, 0, 0, 32, 32);
  CopyBgTilemapBufferToVram(0);
}
// :8600 MultiMove_GetOrigin
function MultiMove_GetOrigin(): number {
  const m = sMultiMove!;
  return (IN_BOX_COLUMNS * m.fromRow) + m.fromColumn;
}
// :8605 MultiMove_CanPlaceSelection — FALSE si un slot cible est déjà occupé.
function MultiMove_CanPlaceSelection(): boolean {
  const m = sMultiMove!;
  const columnCount = m.minColumn + m.columnsTotal;
  const rowCount = m.minRow + m.rowsTotal;
  let monArrayId = 0;
  for (let i = m.minRow; i < rowCount; i++) {
    let boxPosition = (IN_BOX_COLUMNS * i) + m.minColumn;
    for (let j = m.minColumn; j < columnCount; j++) {
      if (m.boxMons[monArrayId] && GetBoxMonData(m.boxMons[monArrayId], MON_DATA_SANITY_HAS_SPECIES)
        && GetCurrentBoxMonData(boxPosition, MON_DATA_SANITY_HAS_SPECIES))
        return false;
      monArrayId++;
      boxPosition++;
    }
  }
  return true;
}

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
  // NB damier magenta hors-map : le rechargement des tiles du tileset (que l'écran boîtes corrompt) est
  // fait par Task_PCMainMenu STATE_FADE_IN — 1er état qui tourne EN OW, donc APRÈS la corruption VRAM du
  // 1er frame overworld. Le faire ici (avant OW) serait un no-op. Cf. [[diag-pc-center-magenta-camera-decadree]].
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
// :2254 enum MSTATE_* — HANDLE_INPUT..WAIT_ITEM_ANIM. SCROLL_BOX_ITEM/WAIT_ITEM_ANIM = MODE DÉPLACER OBJETS.
const MSTATE_HANDLE_INPUT = 0, MSTATE_MOVE_CURSOR = 1, MSTATE_SCROLL_BOX = 2,
  MSTATE_MULTIMOVE_RUN = 7, MSTATE_MULTIMOVE_RUN_CANCEL = 8, MSTATE_MULTIMOVE_RUN_MOVED = 9,
  MSTATE_SCROLL_BOX_ITEM = 10, MSTATE_WAIT_ITEM_ANIM = 11;
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
        case INPUT_SCROLL_RIGHT:  // :2319 ◀▶ tenu sur le titre → boîte suivante (slide)
          PlaySE(0x5 /* SE_SELECT */);
          s.newCurrBoxId = StorageGetCurrentBox() + 1;
          if (s.newCurrBoxId >= TOTAL_BOXES_COUNT) s.newCurrBoxId = 0;
          if (s.boxOption !== OPTION_MOVE_ITEMS) {
            SetUpScrollToBox(s.newCurrBoxId);
            s.state = MSTATE_SCROLL_BOX;
          } else {  // :2329 — cache l'icône avant le slide, puis scrolle une fois l'anim finie
            TryHideItemAtCursor();
            s.state = MSTATE_SCROLL_BOX_ITEM;
          }
          break;
        case INPUT_SCROLL_LEFT:  // :2335 → boîte précédente
          PlaySE(0x5 /* SE_SELECT */);
          s.newCurrBoxId = StorageGetCurrentBox() - 1;
          if (s.newCurrBoxId < 0) s.newCurrBoxId = TOTAL_BOXES_COUNT - 1;
          if (s.boxOption !== OPTION_MOVE_ITEMS) {
            SetUpScrollToBox(s.newCurrBoxId);
            s.state = MSTATE_SCROLL_BOX;
          } else {  // :2345
            TryHideItemAtCursor();
            s.state = MSTATE_SCROLL_BOX_ITEM;
          }
          break;
        case INPUT_BOX_OPTIONS:  // :2312 A sur titre → menu SAUTER/DÉCO/NOM
          PlaySE(0x5 /* SE_SELECT */);
          SetPokeStorageTask(Task_HandleBoxOptions);
          break;
        // :2411 MultiMove (sélection multiple) — SetFunction + état qui pompe RunFunction.
        case INPUT_MULTIMOVE_START:
          PlaySE(0x5 /* SE_SELECT */);
          MultiMove_SetFunction(MULTIMOVE_START);
          s.state = MSTATE_MULTIMOVE_RUN;
          break;
        case INPUT_MULTIMOVE_SINGLE:
          MultiMove_SetFunction(MULTIMOVE_CANCEL);
          s.state = MSTATE_MULTIMOVE_RUN_CANCEL;
          break;
        case INPUT_MULTIMOVE_CHANGE_SELECTION:
          PlaySE(0x5 /* SE_SELECT */);
          MultiMove_SetFunction(MULTIMOVE_CHANGE_SELECTION);
          s.state = MSTATE_MULTIMOVE_RUN_MOVED;
          break;
        case INPUT_MULTIMOVE_GRAB_SELECTION:
          MultiMove_SetFunction(MULTIMOVE_GRAB_SELECTION);
          s.state = MSTATE_MULTIMOVE_RUN;
          break;
        case INPUT_MULTIMOVE_MOVE_MONS:
          PlaySE(0x5 /* SE_SELECT */);
          MultiMove_SetFunction(MULTIMOVE_MOVE_MONS);
          s.state = MSTATE_MULTIMOVE_RUN_MOVED;
          break;
        case INPUT_MULTIMOVE_PLACE_MONS:
          PlaySE(0x5 /* SE_SELECT */);
          MultiMove_SetFunction(MULTIMOVE_PLACE_MONS);
          s.state = MSTATE_MULTIMOVE_RUN;
          break;
        case INPUT_MULTIMOVE_UNABLE:
          PlaySE(0x16 /* SE_FAILURE */);
          break;
        // :2281 INPUT_SHOW_PARTY (party garde) = inerte (lot party menu).
      }
      break;
    case MSTATE_MOVE_CURSOR:
      if (!UpdateCursorPos()) {
        if (IsCursorOnCloseBox()) StartFlashingCloseBoxButton();
        else StopFlashingCloseBoxButton();
        if (s.setMosaic) StartDisplayMonMosaicEffect();  // :2454 — rafraîchit (RefreshDisplayMonData) + pixelise le displayMon
        s.state = MSTATE_HANDLE_INPUT;
      }
      break;
    case MSTATE_SCROLL_BOX:  // :2459 anime le slide, puis finalise la nouvelle boîte
      if (!ScrollToBox()) {
        SetCurrentBox(s.newCurrBoxId);
        if (!sInPartyMenu && !sIsMonBeingMoved) {  // !IsMonBeingMoved()
          RefreshDisplayMonData();
          StartDisplayMonMosaicEffect();
        }
        if (s.boxOption === OPTION_MOVE_ITEMS) {  // :2469 — réaffiche l'icône à la nouvelle position
          TryShowItemAtCursor();
          s.state = MSTATE_WAIT_ITEM_ANIM;
        } else {
          s.state = MSTATE_HANDLE_INPUT;
        }
      }
      break;
    case MSTATE_SCROLL_BOX_ITEM:  // :2524 attend la fin de l'anim « disparaît » puis lance le slide
      if (!IsItemIconAnimActive()) {
        SetUpScrollToBox(s.newCurrBoxId);
        s.state = MSTATE_SCROLL_BOX;
      }
      break;
    case MSTATE_WAIT_ITEM_ANIM:  // :2531 attend la fin de l'anim « apparaît »
      if (!IsItemIconAnimActive()) s.state = MSTATE_HANDLE_INPUT;
      break;
    case MSTATE_MULTIMOVE_RUN:  // :2504 pompe la fonction MultiMove jusqu'à fin
      if (!MultiMove_RunFunction()) s.state = MSTATE_HANDLE_INPUT;
      break;
    case MSTATE_MULTIMOVE_RUN_CANCEL:  // :2508 sélection réduite à 1 mon → déplacement simple
      if (!MultiMove_RunFunction()) SetPokeStorageTask(Task_MoveMon);
      break;
    case MSTATE_MULTIMOVE_RUN_MOVED:  // :2516 fin de sélection/déplacement → refresh mosaic
      if (!MultiMove_RunFunction()) {
        if (s.setMosaic) StartDisplayMonMosaicEffect();
        s.state = MSTATE_HANDLE_INPUT;
      }
      break;
  }
}
// ═══════════ RELÂCHER (#8) : Task_ReleaseMon (:2912) + helpers (:5011, :6432-6700) ═══════════
// (RELEASE_ANIM_RELEASE / RELEASE_ANIM_CAME_BACK déjà déclarés plus haut.)

// Affine anims du mon relâché (1:1 :1221-1238) via le moteur affine générique (précédent
// hors-combat sAffineAnims_FlyBird, field_effect_helpers.ts:4288). Release = rétrécit
// (delta −2/frame ×120) ; CameBack = re-grossit (+16/frame ×15) pour « il est revenu ».
registerAffineAnim('sAffineAnim_ReleaseMon_Release', {
  frames: [{ xScale: -2, yScale: -2, rotation: 0, duration: 120 }], terminator: 'END',
});
registerAffineAnim('sAffineAnim_ReleaseMon_CameBack', {
  frames: [
    { xScale: 16, yScale: 16, rotation: 0, duration: 0 },
    { xScale: 16, yScale: 16, rotation: 0, duration: 15 },
  ], terminator: 'END',
});
registerAffineAnimTable('sAffineAnims_ReleaseMon', {
  affineAnims: ['sAffineAnim_ReleaseMon_Release', 'sAffineAnim_ReleaseMon_CameBack'],
});

// 1:1 sRestrictedReleaseMoves (:6496) : CS dont on ne peut relâcher le dernier porteur
// (anti-softlock). Surf/Dive partout (mapGroup = MAP_GROUPS_COUNT) ; Force/Éclate-Roc en Ligue.
const sRestrictedReleaseMoves: { mapGroup: number; mapNum: number; move: number }[] = [
  { mapGroup: MAP_GROUPS_COUNT, mapNum: 0, move: MOVE_SURF },
  { mapGroup: MAP_GROUPS_COUNT, mapNum: 0, move: MOVE_DIVE },
  { mapGroup: MAP_GROUP(MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F), mapNum: MAP_NUM(MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F), move: MOVE_STRENGTH },
  { mapGroup: MAP_GROUP(MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F), mapNum: MAP_NUM(MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F), move: MOVE_ROCK_SMASH },
  { mapGroup: MAP_GROUP(MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_2F), mapNum: MAP_NUM(MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_2F), move: MOVE_STRENGTH },
  { mapGroup: MAP_GROUP(MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_2F), mapNum: MAP_NUM(MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_2F), move: MOVE_ROCK_SMASH },
];

/** 1:1 `GetRestrictedReleaseMoves` (:6506) — remplit `moves` des CS restreintes sur la map actuelle. */
function GetRestrictedReleaseMoves(moves: Uint16Array): void {
  let n = 0;
  for (const r of sRestrictedReleaseMoves) {
    if (r.mapGroup === MAP_GROUPS_COUNT
      || (r.mapGroup === gSaveBlock1Ptr.location.mapGroup && r.mapNum === gSaveBlock1Ptr.location.mapNum)) {
      moves[n++] = r.move;
    }
  }
  moves[n] = 0;  // terminateur (adaptation : 0 = MOVE_NONE au lieu de MOVES_COUNT ; cf. GetMonData KNOWN_MOVES)
}

/** 1:1 `AtLeastThreeUsableMons` (:6573) — ≥3 mons présents (party + PC), le mon en main compte. */
function AtLeastThreeUsableMons(): boolean {
  let count = sIsMonBeingMoved ? 1 : 0;
  for (let j = 0; j < PARTY_SIZE; j++) if (GetMonData(gPlayerParty[j], MON_DATA_SANITY_HAS_SPECIES)) count++;
  if (count >= 3) return true;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++)
    for (let j = 0; j < IN_BOX_COUNT; j++)
      if ((_boxMonAt(i, j)?.species ?? SPECIES_NONE) !== SPECIES_NONE) { if (++count >= 3) return true; }
  return false;
}

/** 1:1 `InitCanReleaseMonVars` (:6523) — prépare la vérif « peut-on relâcher ce mon ? ». */
function InitCanReleaseMonVars(): void {
  const s = sStorage!;
  if (!AtLeastThreeUsableMons()) { s.releaseStatusResolved = true; s.canReleaseMon = 0; return; }
  if (sIsMonBeingMoved) { s.tempMon = s.movingMon; s.releaseBoxId = -1; s.releaseBoxPos = -1; }
  else {
    if (sCursorArea === CURSOR_AREA_IN_PARTY) { s.tempMon = gPlayerParty[sCursorPosition]; s.releaseBoxId = TOTAL_BOXES_COUNT; }
    else { s.tempMon = GetBoxedMonPtr(StorageGetCurrentBox(), sCursorPosition); s.releaseBoxId = StorageGetCurrentBox(); }
    s.releaseBoxPos = sCursorPosition;
  }
  GetRestrictedReleaseMoves(s.restrictedMoveList);
  s.restrictedReleaseMonMoves = s.tempMon ? (GetMonData(s.tempMon, MON_DATA_KNOWN_MOVES, s.restrictedMoveList) as number) : 0;
  if (s.restrictedReleaseMonMoves !== 0) s.releaseStatusResolved = false;
  else { s.releaseStatusResolved = true; s.canReleaseMon = 1; }
  s.releaseCheckState = 0;
}

/** 1:1 `RunCanReleaseMon` (:6604) — cherche un AUTRE mon (party puis PC) connaissant les CS
 *  restreintes du mon relâché. Retourne 1/0 quand résolu, -1 tant qu'en cours (state-machine). */
function RunCanReleaseMon(): number {
  const s = sStorage!;
  if (s.releaseStatusResolved) return s.canReleaseMon;
  switch (s.releaseCheckState) {
    case 0:
      for (let i = 0; i < PARTY_SIZE; i++) {
        if (s.releaseBoxId !== TOTAL_BOXES_COUNT || s.releaseBoxPos !== i) {
          const knownMoves = GetMonData(gPlayerParty[i], MON_DATA_KNOWN_MOVES, s.restrictedMoveList) as number;
          s.restrictedReleaseMonMoves &= ~knownMoves;
        }
      }
      if (s.restrictedReleaseMonMoves === 0) { s.releaseStatusResolved = true; s.canReleaseMon = 1; }
      else { s.releaseCheckBoxId = 0; s.releaseCheckBoxPos = 0; s.releaseCheckState++; }
      break;
    case 1:
      for (let i = 0; i < IN_BOX_COUNT; i++) {
        const bm = GetBoxedMonPtr(s.releaseCheckBoxId, s.releaseCheckBoxPos);
        const knownMoves = bm ? (GetMonData(bm, MON_DATA_KNOWN_MOVES, s.restrictedMoveList) as number) : 0;
        if (knownMoves !== 0 && !(s.releaseBoxId === s.releaseCheckBoxId && s.releaseBoxPos === s.releaseCheckBoxPos)) {
          s.restrictedReleaseMonMoves &= ~knownMoves;
          if (s.restrictedReleaseMonMoves === 0) { s.releaseStatusResolved = true; s.canReleaseMon = 1; break; }
        }
        if (++s.releaseCheckBoxPos >= IN_BOX_COUNT) {
          s.releaseCheckBoxPos = 0;
          if (++s.releaseCheckBoxId >= TOTAL_BOXES_COUNT) { s.releaseStatusResolved = true; s.canReleaseMon = 0; }
        }
      }
      break;
  }
  return -1;
}

// releaseMonSpritePtr adapté (décomp = struct Sprite **) : descripteur {mode, pos} → slot
// de sprite (partySprites/boxMonsSprites/movingMonSprite = IDs numériques chez nous).
type ReleasePtr = { mode: number; pos: number } | null;
function _relSpriteId(): number {
  const s = sStorage!; const p = s.releaseMonSpritePtr as ReleasePtr;
  if (!p) return -1;
  if (p.mode === MODE_PARTY) return s.partySprites[p.pos];
  if (p.mode === MODE_BOX) return s.boxMonsSprites[p.pos];
  return s.movingMonSprite;
}
function _relSprSet(id: number): void {
  const s = sStorage!; const p = s.releaseMonSpritePtr as ReleasePtr;
  if (!p) return;
  if (p.mode === MODE_PARTY) s.partySprites[p.pos] = id;
  else if (p.mode === MODE_BOX) s.boxMonsSprites[p.pos] = id;
  else s.movingMonSprite = id;
}

/** 1:1 `SetReleaseMon` (:5011) — pointe l'icône à relâcher + lance l'anim de rétrécissement. */
function SetReleaseMon(mode: number, position: number): void {
  const s = sStorage!; const rt = getRuntime();
  if (mode === MODE_PARTY || mode === MODE_BOX) s.releaseMonSpritePtr = { mode, pos: position };
  else if (mode === MODE_MOVE) s.releaseMonSpritePtr = { mode: MODE_MOVE, pos: 0 };
  else return;
  const id = _relSpriteId();
  if (id >= 0 && rt) {
    const spr = _spr(id);
    if (spr) {
      spr.affineAnimsTableName = 'sAffineAnims_ReleaseMon';
      rt.gba.oam[spr.oamIndex].affineMode = 1;  // ST_OAM_AFFINE_NORMAL
      rt.StartSpriteAffineAnim(id, RELEASE_ANIM_RELEASE);
    }
  }
}

/** 1:1 `TryHideReleaseMonSprite` (:5037) — cache l'icône quand l'anim de rétrécissement finit. */
function TryHideReleaseMonSprite(): boolean {
  const id = _relSpriteId(); const spr = id >= 0 ? _spr(id) : null;
  if (!spr || spr.invisible) return false;
  if (spr.affineAnimEnded) spr.invisible = true;
  return true;
}

/** 1:1 `DestroyReleaseMonIcon` (:5049) — libère la matrice OAM + détruit l'icône. */
function DestroyReleaseMonIcon(): void {
  const id = _relSpriteId();
  if (id >= 0) {
    // Décomp :5053 FreeOamMatrix(oam.matrixNum) : adaptation — notre moteur affine
    // (sprite-engine-impl) libère la matrice OAM à la destruction du sprite.
    DestroySprite(id);  // DestroyBoxMonIcon
    _relSprSet(-1);
  }
}

/** 1:1 `ReshowReleaseMon` (:5059) — ré-affiche l'icône + anim « il revient ». */
function ReshowReleaseMon(): void {
  const rt = getRuntime(); const id = _relSpriteId();
  if (id >= 0 && rt) {
    const spr = _spr(id);
    if (spr) { spr.invisible = false; rt.StartSpriteAffineAnim(id, RELEASE_ANIM_CAME_BACK); }
  }
}

/** 1:1 `ResetReleaseMonSpritePtr` (:5068) — libère le pointeur quand l'anim retour finit. */
function ResetReleaseMonSpritePtr(): boolean {
  const s = sStorage!;
  if (!s.releaseMonSpritePtr) return false;
  const id = _relSpriteId(); const spr = id >= 0 ? _spr(id) : null;
  if (spr && spr.affineAnimEnded) s.releaseMonSpritePtr = null;
  return true;
}

/** 1:1 `InitReleaseMon` (:6432) — choisit le slot (party/box/move) + garde le nom pour les messages. */
function InitReleaseMon(): void {
  const s = sStorage!;
  const mode = sIsMonBeingMoved ? MODE_MOVE : (sCursorArea === CURSOR_AREA_IN_PARTY ? MODE_PARTY : MODE_BOX);
  SetReleaseMon(mode, sCursorPosition);
  s.releaseMonName = s.displayMonName;
}

/** 1:1 `TryHideReleaseMon` (:6447) — attend que l'icône soit cachée (sinon curseur qui rebondit). */
function TryHideReleaseMon(): boolean {
  const s = sStorage!;
  if (!TryHideReleaseMonSprite()) { const c = _spr(s.cursorSprite); if (c) StartSpriteAnim(c as never, CURSOR_ANIM_BOUNCE); return false; }
  return true;
}

/** 1:1 `ReleaseMon` (:6460) — retire réellement le mon (main / party / box) du stockage. */
function ReleaseMon(): void {
  const s = sStorage!;
  DestroyReleaseMonIcon();
  if (sIsMonBeingMoved) { sIsMonBeingMoved = false; }
  else {
    const boxId = sCursorArea === CURSOR_AREA_IN_PARTY ? TOTAL_BOXES_COUNT : StorageGetCurrentBox();
    PurgeMonOrBoxMon(boxId, sCursorPosition);
  }
  TryRefreshDisplayMon();
}

/** 1:1 `TrySetCursorFistAnim` (:6481) — poing du curseur si un mon est en main. */
function TrySetCursorFistAnim(): void {
  const c = _spr(sStorage!.cursorSprite);
  if (sIsMonBeingMoved && c) StartSpriteAnim(c as never, CURSOR_ANIM_FIST);
}

/** 1:1 `Task_ReleaseMon` (:2912) — confirmation → anim rétrécissement + vérif anti-softlock →
 *  retrait réel → « Bye-bye » ; ou séquence « il est revenu » si la CS est irremplaçable. */
function Task_ReleaseMon(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      PrintMessage(MSG_RELEASE_POKE);
      ShowYesNoWindow(1);
      s.state++;
      // fallthrough
    case 1:
      switch (Menu_ProcessInputNoWrapClearOnChoose()) {
        case MENU_B_PRESSED:
        case 1:  // Non
          ClearBottomWindow();
          SetPokeStorageTask(Task_PokeStorageMain);
          break;
        case 0:  // Oui
          ClearBottomWindow();
          InitCanReleaseMonVars();
          InitReleaseMon();
          s.state++;
          break;
      }
      break;
    case 2:
      RunCanReleaseMon();
      if (!TryHideReleaseMon()) {
        for (;;) {
          const canRelease = RunCanReleaseMon();
          if (canRelease === 1) { s.state++; break; }
          else if (canRelease === 0) { s.state = 8; break; }
        }
      }
      break;
    case 3:
      ReleaseMon();
      RefreshDisplayMonData();
      PrintMessage(MSG_WAS_RELEASED);
      s.state++;
      break;
    case 4:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0 /* DPAD_ANY */)) { PrintMessage(MSG_BYE_BYE); s.state++; }
      break;
    case 5:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0)) {
        ClearBottomWindow();
        if (sInPartyMenu) { CompactPartySlots(); CompactPartySprites(); s.state++; }
        else { s.state = 7; }
      }
      break;
    case 6:
      if (GetNumPartySpritesCompacting() === 0) {
        TryRefreshDisplayMon();  // décomp RefreshDisplayMon → notre TryRefreshDisplayMon (recharge l'affichage)
        StartDisplayMonMosaicEffect();
        UpdatePartySlotColors();
        s.state++;
      }
      break;
    case 7:
      SetPokeStorageTask(Task_PokeStorageMain);
      break;
    case 8:  // Séquence « impossible de relâcher » (dernier porteur d'une CS requise).
      PrintMessage(MSG_WAS_RELEASED);
      s.state++;
      break;
    case 9:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0)) { PrintMessage(MSG_SURPRISE); s.state++; }
      break;
    case 10:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0)) { ClearBottomWindow(); ReshowReleaseMon(); s.state++; }
      break;
    case 11:
      if (!ResetReleaseMonSpritePtr()) { TrySetCursorFistAnim(); PrintMessage(MSG_CAME_BACK); s.state++; }
      break;
    case 12:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0)) { PrintMessage(MSG_WORRIED); s.state++; }
      break;
    case 13:
      if (gMain.newKeys & (A_BUTTON | B_BUTTON | 0xF0)) { ClearBottomWindow(); SetPokeStorageTask(Task_PokeStorageMain); }
      break;
  }
}

// ─── RÉSUMÉ (#9) : Task_ShowMonSummary (:3570) + InitSummaryScreenData (:6700) ───
const SUMMARY_MODE_NORMAL_PSS = 0;   // pokemon_summary_screen PSS_MODE_NORMAL
const SUMMARY_MODE_BOX_PSS = 2;      // PSS_MODE_BOX (lecture seule, pas de réordre moves)

/** 1:1 décomp `InitSummaryScreenData` (:6700) — prépare le mon affiché dans le RÉSUMÉ
 *  (+ mode/index de navigation) selon le contexte : mon en main / party / boîte. */
function InitSummaryScreenData(): void {
  const s = sStorage!;
  if (sIsMonBeingMoved) {
    SaveMovingMon();
    s.summaryMon = sSavedMovingMon;
    s.summaryStartPos = 0;
    s.summaryMaxPos = 0;
    s.summaryScreenMode = SUMMARY_MODE_NORMAL_PSS;
  } else if (sCursorArea === CURSOR_AREA_IN_PARTY) {
    s.summaryMon = gPlayerParty[sCursorPosition];
    s.summaryStartPos = sCursorPosition;
    s.summaryMaxPos = CalculatePlayerPartyCount() - 1;
    s.summaryScreenMode = SUMMARY_MODE_NORMAL_PSS;
  } else {
    s.summaryMon = GetBoxedMonPtr(StorageGetCurrentBox(), sCursorPosition);
    s.summaryStartPos = sCursorPosition;
    s.summaryMaxPos = IN_BOX_COUNT - 1;
    s.summaryScreenMode = SUMMARY_MODE_BOX_PSS;
  }
}

/** 1:1 décomp `Task_ShowMonSummary` (:3570) — fond noir puis bascule vers l'écran
 *  RÉSUMÉ via Task_ChangeScreen (SCREEN_CHANGE_SUMMARY_SCREEN). */
function Task_ShowMonSummary(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      InitSummaryScreenData();
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      s.state++;
      break;
    case 1:
      if (!UpdatePaletteFade()) {
        sWhichToReshow = SCREEN_CHANGE_SUMMARY_SCREEN - 1;
        s.screenChangeType = SCREEN_CHANGE_SUMMARY_SCREEN;
        SetPokeStorageTask(Task_ChangeScreen);
      }
      break;
  }
}

// :3731 Task_ChangeScreen — dispatch selon screenChangeType. EXIT + SUMMARY portés ; NAME/ITEM = lots suivants.
function Task_ChangeScreen(_taskId: number): void {
  // Ce task bascule de CB2 (summary/bag/exit) mais n'est PAS détruit ici : runTasks (global) le rejoue
  // tant que l'écran cible n'a pas fait son ResetTasks. Au 1er passage sStorage existe et fait le
  // changement (FreePokeStorageData → sStorage=null) ; aux passages suivants sStorage est null → skip.
  // Le décomp évite le crash car l'écran cible ResetTasks avant que le task ne re-tourne ; chez nous le
  // ResetTasks de CB2_ReturnToPokeStorage (retour) / du field (exit) nettoie ce task orphelin.
  if (!sStorage) return;
  const s = sStorage;
  const screenChangeType = s.screenChangeType;
  sMovingItemId = 0;  // ITEM_NONE (MOVE_ITEMS = lot items)
  switch (screenChangeType) {
    case SCREEN_CHANGE_EXIT_BOX:
    default:
      FreePokeStorageData();
      const rt = getRuntime();
      rt?.SetMainCallback2(CB2_ExitPokeStorage as never);
      break;
    case SCREEN_CHANGE_SUMMARY_SCREEN: {
      // 1:1 :3749 — bascule vers l'écran RÉSUMÉ. On capture mon+mode AVANT
      // FreePokeStorageData (qui invalide sStorage). CB2_ReturnToPokeStorage rouvre
      // le PC au retour (SetSelectionAfterSummaryScreen replace le curseur).
      const summaryMon = s.summaryMon;
      const startPos = s.summaryStartPos;
      const maxPos = s.summaryMaxPos;
      const mode = s.summaryScreenMode;
      FreePokeStorageData();
      if (!summaryMon) { getRuntime()?.SetMainCallback2(CB2_ExitPokeStorage as never); break; }
      // monList = liste de navigation ▲▼. Party = gPlayerParty (nav 1:1). Boîte/en-main
      // = affichage direct du mon (nav multi-boîte = lot ultérieur, évite les slots vides).
      let monList: Pokemon[] = gPlayerParty;
      let sIdx = startPos, mIdx = maxPos;
      if (mode === SUMMARY_MODE_BOX_PSS || summaryMon === sSavedMovingMon) {
        monList = [summaryMon]; sIdx = 0; mIdx = 0;
      }
      OpenSummaryScreen(summaryMon, CB2_ReturnToPokeStorage as unknown as () => void,
        { monList, startIndex: sIdx, maxIndex: mIdx, mode });
      break;
    }
    case SCREEN_CHANGE_NAME_BOX: {
      // 1:1 :3760 — DoNamingScreen(NAMING_SCREEN_BOX, GetBoxNamePtr(box), 0,0,0, CB2_ReturnToPokeStorage).
      // Adaptation : buffer charCodes préfilled avec le nom actuel ; NameBox_SetAndReturn applique
      // le nom saisi au save block puis rouvre le PC (GetBoxNamePtr = string, pas un pointeur mutable).
      const boxId = StorageGetCurrentBox();
      _boxNameBuffer.length = 0;
      for (const c of GetBoxNamePtr(boxId)) _boxNameBuffer.push(c.charCodeAt(0));
      FreePokeStorageData();
      DoNamingScreen(1 /* NAMING_SCREEN_BOX */, _boxNameBuffer, 0, 0, 0, NameBox_SetAndReturn as never);
      break;
    }
    case SCREEN_CHANGE_ITEM_FROM_BAG:
      // 1:1 :3764 — ouvre le sac en mode PCBOX (choisir un objet du SAC à donner au mon),
      // retour = CB2_ReturnToPokeStorage qui rejoue GiveChosenBagItem (reshow ITEM_FROM_BAG-1).
      FreePokeStorageData();
      void import('./item_menu').then((m) => {
        m.GoToBagMenu(m.ITEMMENULOCATION_PCBOX, 0 /* ITEMS_POCKET */, CB2_ReturnToPokeStorage as never);
      }).catch((e) => console.error('[pc-storage] GoToBagMenu(PCBOX)', e));
      break;
  }
}

// :3670 Task_OnBPressed — B : « Continuer les opérations ? » Oui = rester, Non = fermer (menu PC). ───
function Task_OnBPressed(_taskId: number): void {
  const s = sStorage!;
  switch (s.state) {
    case 0:
      if (IsMonBeingMoved()) { PlaySE(0x20 /* SE_FAILURE */); PrintMessage(MSG_HOLDING_POKE); s.state = 1; }
      else if (IsMovingItem()) { SetPokeStorageTask(Task_CloseBoxWhileHoldingItem); }
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
      else if (IsMovingItem()) { SetPokeStorageTask(Task_CloseBoxWhileHoldingItem); }
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
    displayMonSpr: s ? (() => { const d = _spr(s.displayMonSprite); return d ? { inv: d.invisible } : null; })() : null,
    displayCache: s ? (s.displayMonSpecies == null ? 'n/a' : (_displayMonCache.has(s.displayMonSpecies) ? (_displayMonCache.get(s.displayMonSpecies) ? 'filled' : 'null-gate') : 'absent')) : null,
  };
};
// Sonde diag : force un re-render du displayMon + retourne l'état.
(globalThis as Record<string, unknown>).__dbgReloadDisplay = () => {
  const s = sStorage; if (!s) return 'no storage';
  const sp = s.displayMonSpecies;
  LoadDisplayMonGfx(sp, s.displayMonPersonality);
  return JSON.stringify({ sp, cache: _displayMonCache.get(sp) ? 'filled' : String(_displayMonCache.get(sp)), inv: _spr(s.displayMonSprite)?.invisible });
};

// Exposition dev (sonde déterministe), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__CheckFreePokemonStorageSpace = CheckFreePokemonStorageSpace;
(globalThis as Record<string, unknown>).__AnyStorageMonWithMove = AnyStorageMonWithMove;
(globalThis as Record<string, unknown>).__CountStorageNonEggMons = CountStorageNonEggMons;
// __getPokemonStorage : accès au storage PC sans importer save.ts (cycle-break).
// Utilisé par la sonde déterministe ET par CopyMonToPC (party-storage.ts).
(globalThis as Record<string, unknown>).__getPokemonStorage = GetPokemonStorage;
