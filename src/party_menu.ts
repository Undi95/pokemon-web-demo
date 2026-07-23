/**
 * party-screen.ts — Écran POKéMON (= menu d'équipe) 1:1 décomp `src/party_menu.c`.
 *
 * Architecture : CB2 swap (= même pattern que bag-screen / trainer-card-screen).
 * L'OW arrête de tick pendant l'écran. Retour via `gMain.savedCallback =
 * CB2_ReturnToFieldWithOpenMenu_Manual`.
 *
 * BG layout 1:1 décomp `sPartyMenuBgTemplates` (party_menu.h:1) :
 *   - BG0 charBase=0 mapBase=31 priority=1 → text windows (= slots + msg)
 *   - BG1 charBase=0 mapBase=30 priority=2 → reserved (= cursor/decoration)
 *   - BG2 charBase=0 mapBase=28 priority=0 screenSize=1 → bg.bin background
 *
 * Window templates 1:1 décomp `sSinglePartyMenuWindowTemplate` (party_menu.h:123) :
 *   - Slot 0 (= big left)  : (1, 3), 10×7, palette 3, baseBlock 0x63
 *   - Slot 1..5 (= right)  : (12, 1+3*N), 18×3, palette 4..8, baseBlock 0xA9+
 *   - WIN_MSG (= bottom)   : bg=2, (1, 15), 28×4, palette 14, baseBlock 0x1DF
 *
 * État (l'écran est désormais complet 1:1 pour le jeu de base — l'ancienne
 * liste « MVP / polish à venir » est PÉRIMÉE) :
 *   - 6 slots : nickname/Lv/HP + barre PV (vert/jaune/rouge) + genre ♂/♀ +
 *     icône statut (PSN/PAR/BRU…) + icône objet tenu + icône OAM animée
 *   - Dialog bas + bouton SORTIR ; curseur highlight (palette swap par slot)
 *   - Menu d'action (RESUME / OBJET / DÉPLACER / DONNER / RETOUR + capacités CS)
 *   - Flux OBJET (Medicine/PP/RareCandy/EV/SacredAsh/TMHM/EvolutionStone),
 *     level-up + replace-move, boîte de stats, évolution (level-up ET pierre)
 *   - Reste non porté = sous-systèmes hors jeu de base : Battle Frontier
 *     (Pyramid bag), PSS/contest, union room, move-tutor (gTutorMoves).
 */

import {
  InitWindows, AddWindow, FillWindowPixelBuffer, FillWindowPixelRect,
  PutWindowTilemap, CopyWindowToVram, ClearWindowTilemap,
  BlitBitmapToWindow,
  DrawStdFrameWithCustomTileAndPalette, ClearStdWindowAndFrame,
  RemoveWindow, ShowBg, HideBg, ResetVramOamAndBgCntRegs, ResetAllBgsCoordinates,
  GetWindowAttribute, WINDOW_TILEMAP_LEFT, WINDOW_TILEMAP_TOP,
  WINDOW_WIDTH, WINDOW_HEIGHT,
  CopyToBufferFromBgTilemap, CopyRectToBgTilemapBufferRect,
  FillBgTilemapBufferRect_Palette0, ScheduleBgCopyTilemapToVram,
  type WindowTemplate,
} from './window';
import { LoadUserWindowBorderGfx, preloadTextWindowFrames } from './text_window';
import {
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose,
  AddTextPrinterParameterized2, GetPlayerTextSpeedDelay,
} from './menu';
import { gTextFlags, IsTextPrinterActive } from './text';
import { DrawLevelUpWindowPg1, DrawLevelUpWindowPg2 } from './menu_specialized';
import { GetStringCenterAlignXOffset } from './text';
import { AddTextPrinterParameterized3 } from './menu';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { SwitchPartyMonSlots, gPlayerParty, CalculatePlayerPartyCount, type Pokemon } from './engine/battle/party-storage';
import { ItemIsMail, GiveMailToMonByItemId, TakeMailFromMon, MAIL_NONE } from './mail_data';
import { DoEasyChatScreen, easyChatGfxReady } from './easy_chat';
// 1:1 décomp include/constants/easy_chat.h.
const EASY_CHAT_TYPE_MAIL = 4;
const EASY_CHAT_PERSON_DISPLAY_NONE = 3;
import { AddBagItem, RemoveBagItem } from './engine/bag/bag';
import { PokemonUseItemEffects } from './engine/bag/bag-item-effects';
import { GetItemName, GetItemPocket, GetBagItemKey } from './item';
import { GoToBagMenu, ITEMMENULOCATION_PARTY, ITEMMENULOCATION_LAST, POCKETS_COUNT } from './item_menu';
import { resolveDecompConstant, reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { gMoveNames } from './engine/data/game-data';
// Rare Candy learn/évolution (1:1 party_menu.c:5047-5133, Palier 2.1 étape 4) :
// foyer pokemon.ts (MonTryLearningNewMove/GetEvolutionTargetSpecies) + scène.
import {
  MonTryLearningNewMove, GetEvolutionTargetSpecies, RemoveMonPPBonus, SetMonMoveSlot,
  CanMonLearnTMHM, GiveMoveToMon, MonKnowsMove, AdjustFriendship,
} from './pokemon';
// 1:1 décomp party_menu.c:4688 ItemIdToBattleMoveId + sa table sTMHMMoves
// (relocalisées en feuille pure engine/pokemon/tmhm-moves.ts, cf. en-tête là-bas).
import { sTMHMMoves as _sTMHMMoves_TM } from './data/party_menu';
import { ITEM_TM01 as _ITEM_TM01_TM } from '../include/constants/items';
import { ITEM_TM01, ITEM_HM01 } from '../include/constants/items';
import { FRIENDSHIP_EVENT_LEARN_TMHM, MON_HAS_MAX_MOVES } from '../include/constants/pokemon';
import { BeginEvolutionScene, SetCB2AfterEvolution } from './evolution_scene';
import { gMoveToLearn } from './engine/battle/state';
import { PlayFanfare } from '../harness/runtime/decomp-globals';
import { LoadSpritePalette, MarkObjTilesAllocated, ReserveSpritePaletteSlot, FreeSpritePaletteByTag, FreeAllSpritePalettes, ResetSpriteData } from './sprite';
import { GetGenderFromSpeciesAndPersonality } from '../include/pokemon';
import { MON_MALE, MON_FEMALE } from '../include/constants/pokemon';
import { PARTY_SIZE } from '../include/constants/global';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  BlendPalettes, ResetPaletteFade, ResetTasks, gMain,
  PlayFanfareByFanfareNum, WaitFanfare, FillPalBufferBlack,
} from '../harness/runtime/decomp-globals';
import { FlagGet, gSpecialVar } from './engine/script/script-vars';
import { MUS_LEVEL_UP, SE_FAILURE } from '../include/constants/songs';
import { FANFARE_LEVEL_UP } from '../include/constants/sound';
import { GetMapNameGeneric } from './region_map';
import { STR_CONV_MODE_RIGHT_ALIGN, ConvertIntToDecimalStringN, gStringVar1 } from '../include/string_util';
import { CHAR_SLASH, EOS } from '../include/constants/characters';
import { CB2_ReturnToFieldWithOpenMenu_Manual, CB2_ReturnToField_Manual } from './overworld';
import { FadeScreen, FADE_FROM_BLACK } from './field_weather';
import { loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadTileBin } from '../harness/gba/png-loader';
import {
  OpenSummaryScreen, GetSummaryLastMonIndex,
  ShowSelectMovePokemonSummaryScreen, GetMoveSlotToReplace,
} from './pokemon_summary_screen';
import { getString } from '../harness/runtime/decomp-strings';
import { MON_ICON_PALETTE_INDICES } from './pokemon_icon';
import type { DecompTask, CB2Callback } from '../harness/runtime/decomp-runtime';

// FONT_NORMAL/SMALL = text.h enum FontIds local (= pas extrait decomp-data,
// hardcode 1:1 strict justifié).
const FONT_NORMAL = 1;
const FONT_SMALL = 0;  // 1:1 décomp party_menu uses FONT_SMALL for nickname/level/HP
// 1:1 strict A8 audit : import depuis decomp-data.
import { TEXT_SKIP_DRAW } from '../include/text';
import {
  PARTY_ACTION_CHOOSE_MON, PARTY_ACTION_USE_ITEM, PARTY_ACTION_GIVE_ITEM,
  PARTY_ACTION_SWITCH, PARTY_ACTION_SWITCHING, PARTY_ACTION_SEND_OUT,
  PARTY_ACTION_SOFTBOILED, PARTY_ACTION_CANT_SWITCH, PARTY_ACTION_ABILITY_PREVENTS,
  PARTY_MENU_TYPE_FIELD, PARTY_MENU_TYPE_IN_BATTLE, PARTY_MENU_TYPE_DAYCARE,
  PARTY_NOTHING_CHOSEN,
} from '../include/constants/party_menu';
// Mode DAYCARE (ChooseMonForDaycare/BufferMonSelection, party_menu.c:6197-6231) :
// retour au field script-driven (gFieldCallback2 = CB2_FadeFromPartyMenu).
import { IsWeatherNotFadingIn } from './field_weather';
import { UnlockPlayerFieldControls, ScriptContext_Enable } from './script';
import { VarSet } from './event_data';
/** 1:1 décomp `LoadUserWindowBorderGfx(0, 0x4F, BG_PLTT_ID(13))` (party_menu.c:2096).
 *  baseTile=0x4F, paletteNum=13. */
const STD_FRAME_TILE = 0x4F;
const STD_FRAME_PAL = 13;
/** 1:1 décomp `sFontColorTable[0]` (party_menu.h:115) :
 *  [BG=TRANSPARENT, FG=LIGHT_GRAY, SHADOW=DARK_GRAY] = [0, 3, 2]. */
const COLOR_TEXT: [number, number, number] = [0, 3, 2];
const COLOR_HP: [number, number, number] = [0, 3, 2];
/** 1:1 décomp `sFontColorTable[2]` (party_menu.h:117) gender symbol :
 *  [TRANSPARENT, TEXT_DYNAMIC_COLOR_2 (=0xB), TEXT_DYNAMIC_COLOR_3 (=0xC)].
 *  Les dynamic colors aux positions 11/12 dans la sub-pal sont patched
 *  runtime selon le gender via sGenderMalePalIds [59,60] (rouge ♂) ou
 *  sGenderFemalePalIds [75,76] (bleu ♀) — cf. _loadGenderColors. */
const COLOR_GENDER: [number, number, number] = [0, 0xB, 0xC];
/** 1:1 décomp `sFontColorTable[3]` (party_menu.h:118) actions de sélection :
 *  [WHITE, DARK_GRAY, LIGHT_GRAY] = [1, 2, 3]. */
const COLOR_ACTION_SELECTION: [number, number, number] = [1, 2, 3];
/** 1:1 décomp `sFontColorTable[4]` (party_menu.h:119) capacités CS (field moves) :
 *  [WHITE, BLUE, LIGHT_BLUE] = [1, 8, 9] → texte BLEU (VOL/SURF/COUPE… en bleu). */
const COLOR_ACTION_FIELD_MOVE: [number, number, number] = [1, 8, 9];
const sGenderMalePalIds   = [59, 60];
const sGenderFemalePalIds = [75, 76];

/** 1:1 décomp `#define PARTY_PAL_*` (party_menu.c:150). */
const PARTY_PAL_SELECTED    = 1 << 0;
const PARTY_PAL_FAINTED     = 1 << 1;
const PARTY_PAL_TO_SWITCH   = 1 << 2;
const PARTY_PAL_MULTI_ALT   = 1 << 3;
const PARTY_PAL_SWITCHING   = 1 << 4;
const PARTY_PAL_TO_SOFTBOIL = 1 << 5;
const PARTY_PAL_NO_MON      = 1 << 6;

/** 1:1 décomp palette offset arrays (party_menu.h:574..596).
 *  *PalIds = indices dans le bg.pal global (176 entries) à copier dans la sub-pal du window slot.
 *  *PalOffsets = positions cibles dans la sub-pal (0-15). */
const sPartyBoxPalOffsets1     = [4, 5, 6];
const sPartyBoxPalOffsets2     = [1, 7, 8];
const sPartyBoxNoMonPalOffsets = [1, 11, 12];

const sPartyBoxEmptySlotPalIds1       = [52, 53, 54];
const sPartyBoxEmptySlotPalIds2       = [49, 55, 56];
const sPartyBoxCurrSelectionPalIds1   = [116, 117, 118];
const sPartyBoxCurrSelectionPalIds2   = [97, 103, 104];
const sPartyBoxFaintedPalIds1         = [84, 85, 86];
const sPartyBoxFaintedPalIds2         = [81, 87, 88];
const sPartyBoxCurrSelectionFaintedPalIds = [148, 149, 150];
const sPartyBoxSelectedForActionPalIds1   = [100, 101, 102];
const sPartyBoxSelectedForActionPalIds2   = [161, 167, 168];
const sPartyBoxMultiPalIds1               = [68, 69, 70];
const sPartyBoxMultiPalIds2               = [65, 71, 72];
const sPartyBoxCurrSelectionMultiPalIds   = [132, 133, 134];
const sPartyBoxNoMonPalIds                = [17, 27, 28];

/** 1:1 décomp `gMonIconPaletteIndices[]` (pokemon_icon.c:468) :
 *  Table complète 440 entries Gen 1-3 dans pokemon-icon-palettes.ts. */
// MON_ICON_PALETTE_INDICES imported below from pokemon-icon-palettes.ts.

/** 1:1 décomp HP bar palette ids (party_menu.h:573, 581-583). */
const sHPBarPalOffsets    = [9, 10];
const sHPBarGreenPalIds   = [57, 58];
const sHPBarYellowPalIds  = [73, 74];
const sHPBarRedPalIds     = [89, 90];

/** 1:1 décomp `sPartyBoxInfoRects` dimensions[20-22] = HP bar position
 *  (x, y, width). PARTY_BOX_LEFT_COLUMN (slot 0) : (24, 35, 48).
 *  PARTY_BOX_RIGHT_COLUMN (slots 1-5) : (88, 10, 48). */
const HP_BAR_RECT_LEFT:  [number, number, number] = [24, 35, 48];
const HP_BAR_RECT_RIGHT: [number, number, number] = [88, 10, 48];

/** 1:1 décomp `sPartyMenuBgTemplates` (party_menu.h:1) :
 *  BG0 mapBase=31 priority=1 → windows (= slot frames + text + msg)
 *  BG1 mapBase=30 priority=2 → bg.bin background (= yellow stripes décor)
 *  BG2 mapBase=28 priority=0 screenSize=1 → empty overlay (= laisse BG0+BG1 transparaitre)
 *
 *  ⚠️ `AllocPartyMenuBg` (party_menu.c:719) fait `SetBgTilemapBuffer(1, ...)`
 *  et `AllocPartyMenuBgGfx` (party_menu.c:744) fait `LZDecompressWram(gPartyMenuBg_Tilemap, buf)` →
 *  bg.bin va à BG1, pas BG2. */
const PARTY_TILES_CHAR_BASE = 0;
const PARTY_WIN_MAP_BASE = 31;     // BG0 windows
const PARTY_BG_MAP_BASE = 30;      // BG1 bg.bin
const PARTY_OVERLAY_MAP_BASE = 28; // BG2 empty

/** OAM offsets. */
const ICON_OBJ_PAL_BASE = 5;       // palette 5..10 (= 1 bank par slot, 6 slots)
/** Tags pour RÉSERVER les 6 banks d'icônes (ICON_OBJ_PAL_BASE..+5) dans l'allocateur
 *  de palettes OBJ. Les icônes chargent en DIRECT vers ces banks fixes (LoadPaletteObj)
 *  sans passer par LoadSpritePalette → l'allocateur les croit libres et pioche dedans
 *  pour pokeball/status/helditem → collision palette (icônes corrompues). On réserve
 *  ces banks au case 13 + libère au teardown. */
const TAG_ICON_PAL_RESERVE = 0x7E10;
const ICON_OBJ_TILE_OFFSET = 0;    // OBJ VRAM offset 0 = base for icons
/** 1:1 STRICT décomp `LoadSpritePalette(sPokeballPalette)` : slot dynamique. */
let _pokeballPalSlot = -1;
const TAG_POKEBALL_PAL = 'PARTY_POKEBALL_PAL';
/** 1:1 décomp pokemon_icon.png 32×64 = 2 frames empilées verticalement.
 *  Chaque frame 32×32 = 16 tiles 4bpp. On réserve 32 tiles par slot (= 6 slots
 *  × 32 = 192 tiles VRAM, fit avant POKEBALL_TILE_BASE=256). */
const ICON_TILES_PER_FRAME = 16;
const ICON_TILES_PER_SLOT  = 32;  // 2 frames × 16 tiles

/** 1:1 décomp `sSinglePartyMenuWindowTemplate` (party_menu.h:123) :
 *  Each slot has unique paletteNum + baseBlock pour color variation par row. */
const SLOT_WINDOW_TEMPLATES: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 1,  tilemapTop: 3,  width: 10, height: 7, paletteNum: 3, baseBlock: 0x63  },  // mon 1 big
  { bg: 0, tilemapLeft: 12, tilemapTop: 1,  width: 18, height: 3, paletteNum: 4, baseBlock: 0xA9  },  // mon 2
  { bg: 0, tilemapLeft: 12, tilemapTop: 4,  width: 18, height: 3, paletteNum: 5, baseBlock: 0xDF  },  // mon 3
  { bg: 0, tilemapLeft: 12, tilemapTop: 7,  width: 18, height: 3, paletteNum: 6, baseBlock: 0x115 },  // mon 4
  { bg: 0, tilemapLeft: 12, tilemapTop: 10, width: 18, height: 3, paletteNum: 7, baseBlock: 0x14B },  // mon 5
  { bg: 0, tilemapLeft: 12, tilemapTop: 13, width: 18, height: 3, paletteNum: 8, baseBlock: 0x181 },  // mon 6
];

/** 1:1 décomp `sDefaultPartyMsgWindowTemplate` (party_menu.h:419) :
 *  bg=2, (1, 17), 21×2, paletteNum=15, baseBlock=0x24F. — PARTY_MSG_CHOOSE_MON. */
const MSG_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 2, tilemapLeft: 1, tilemapTop: 17, width: 21, height: 2, paletteNum: 15, baseBlock: 0x24F,
};
/** 1:1 décomp `sDoWhatWithMonMsgWindowTemplate` (party_menu.h:430) :
 *  bg=2, (1, 17), 16×2, paletteNum=15, baseBlock=0x279. — PARTY_MSG_DO_WHAT_WITH_MON.
 *  Width=16 (= shorter) pour ne pas overlap avec action menu à tile 19+. */
const DO_WHAT_WITH_MON_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 2, tilemapLeft: 1, tilemapTop: 17, width: 16, height: 2, paletteNum: 15, baseBlock: 0x279,
};

/** 1:1 décomp `sSinglePartyMenuWindowTemplate[WIN_MSG]` (party_menu.h:180-187) :
 *  bg=2, (1, 15), 28×4, paletteNum=14, baseBlock=0x1DF. — WIN_MSG = celui que
 *  PrintMessage utilise pour gText_PkmnHPRestoredByVar2/Cured/etc. Hauteur 4
 *  tiles = 32 px = 2 lignes FONT_NORMAL (= permet `\n` du décomp FR). */
const ITEM_USED_MSG_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 2, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 14, baseBlock: 0x1DF,
};

/** 1:1 décomp `sLevelUpStatsWindowTemplate` (data/party_menu.h:529-538) :
 *  bg=2, (19, 1), 10×11, paletteNum=14, baseBlock=0x2E9. — la boîte de stats
 *  à DROITE de l'écran, affichée au level-up via Super Bonbon (Rare Candy). */
const LEVEL_UP_STATS_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 2, tilemapLeft: 19, tilemapTop: 1, width: 10, height: 11, paletteNum: 14, baseBlock: 0x2E9,
};

/** 1:1 décomp `sCancelButtonWindowTemplate` (pokeemeraude FR party_menu.h:386) :
 *  Window "SORTIR" à droite du SORTIR pokeball OAM. */
const CANCEL_BUTTON_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 24, tilemapTop: 17, width: 6, height: 2, paletteNum: 3, baseBlock: 0x1C7,
};

/** Pokémon icon sprite coords 1:1 décomp `sPartyMenuSpriteCoords[PARTY_LAYOUT_SINGLE]`
 *  (party_menu.h:68) — chaque slot a 4 pairs (x, y) :
 *    [0,1] = Pokémon icon
 *    [2,3] = held item
 *    [4,5] = status condition
 *    [6,7] = menu Poké Ball (= mini-pokeball au-dessus à gauche du slot) */
const ICON_COORDS: Array<[number, number]> = [
  [16,  40],  // slot 0 icon (big left)
  [104, 18],  // slot 1
  [104, 42],  // slot 2
  [104, 66],  // slot 3
  [104, 90],  // slot 4
  [104, 114], // slot 5
];
const POKEBALL_COORDS: Array<[number, number]> = [
  [ 16, 34],  // slot 0
  [102, 25],  // slot 1
  [102, 49],  // slot 2
  [102, 73],  // slot 3
  [102, 97],  // slot 4
  [102, 121], // slot 5
];
/** 1:1 décomp `sPartyMenuSpriteCoords[PARTY_LAYOUT_SINGLE][slot][4,5]`
 *  (data/party_menu.h:72-77) = coords du sprite condition de statut. */
const STATUS_COORDS: Array<[number, number]> = [
  [ 50,  52], // slot 0 (gros box gauche)
  [136,  27], // slot 1
  [136,  51], // slot 2
  [136,  75], // slot 3
  [136,  99], // slot 4
  [136, 123], // slot 5
];
/** OBJ VRAM/pal du sprite statut. Libre entre icônes (tiles 0-191) et
 *  pokeball (256). status_icons.png = 32 tiles, sprite 32×8 (shape1 size1),
 *  frame = (ailment-1)*4 (1:1 sSpriteAnim_Status* data/party_menu.h:1015+). */
const PARTY_STATUS_TILE_BASE = 192;
/** 1:1 STRICT décomp `LoadSpritePalette` : slot dynamiquement alloué. */
let _partyStatusPalSlot = -1;
const TAG_PARTY_STATUS_PAL = 'PARTY_STATUS_PAL';
let _statusOamBySlot: number[] = [-1, -1, -1, -1, -1, -1];

/** 1:1 décomp `sPartyMenuSpriteCoords[PARTY_LAYOUT_SINGLE][slot][2,3]`
 *  (data/party_menu.h:72-77) = coords du sprite objet tenu (8×8). */
const ITEM_COORDS: Array<[number, number]> = [
  [ 20,  50], // slot 0
  [108,  28], // slot 1
  [108,  52], // slot 2
  [108,  76], // slot 3
  [108, 100], // slot 4
  [108, 124], // slot 5
];
/** OBJ VRAM/pal objet tenu : hold_icons.png = 2 tiles (8×8), anim0=item /
 *  anim1=mail (1:1 sSpriteAnim_HeldItem/HeldMail data/party_menu.h:821-836).
 *  Libre entre statut (192-223) et pokeball (256). */
const PARTY_HELDITEM_TILE_BASE = 224;
/** 1:1 STRICT décomp `LoadSpritePalette` : slot dynamiquement alloué. */
let _partyHeldItemPalSlot = -1;
const TAG_PARTY_HELDITEM_PAL = 'PARTY_HELDITEM_PAL';
let _itemOamBySlot: number[] = [-1, -1, -1, -1, -1, -1];

interface PartyAssets {
  bgTiles: Uint8Array;
  bgTilemap: Uint16Array;
  bgPalette: Uint16Array;
  /** 1:1 décomp `sSlotTilemap_Main` (party_menu.h:565) :
   *  70 bytes u8, stride=10, layout 10×7 (= window slot 0 size). */
  slotMainTilemap: Uint8Array;
  /** 1:1 décomp `sSlotTilemap_Wide` (party_menu.h:567) :
   *  54 bytes u8, stride=18, layout 18×3 (= window slots 1-5 size). */
  slotWideTilemap: Uint8Array;
  /** 1:1 décomp `sSlotTilemap_WideEmpty` (party_menu.h:569) :
   *  Used by `DrawEmptySlot` for slots with no Pokémon. */
  slotWideEmptyTilemap: Uint8Array;
  /** 1:1 décomp `sSlotTilemap_MainNoHP`/`_WideNoHP` (party_menu.h:566/568) :
   *  variante SANS label "PV"/barre PV — utilisée pour les ŒUFS (blitFunc
   *  (.,hideHP=TRUE) dans DisplayPartyPokemonData :876). */
  slotMainNoHpTilemap: Uint8Array;
  slotWideNoHpTilemap: Uint8Array;
  // Pokémon icons : loaded lazy per slot below.
}

let _isOpen = false;
let _phase: 'idle' | 'open' | 'action_menu' | 'fading_out' | 'switching' | 'item_used_msg' | 'hp_anim'
  | 'levelup_pg1' | 'levelup_pg2' | 'levelup_learn' | 'field_move_err' | 'field_move_cancel' | 'softboiled_msg'
  | 'fieldmove_yesno' | 'helditem_msg' | 'switch_items_yesno'
  | 'levelup_learn_next' | 'levelup_learned_fanfare' | 'levelup_learned_msg'
  | 'levelup_replace_msg' | 'replace_yesno' | 'which_move_msg' | 'learnmove_return'
  | 'forgot_move_msg' | 'stop_learning_msg' | 'stop_learning_yesno' | 'move_not_learned_msg' = 'idle';

/** Message à afficher après use d'item (= 1:1 décomp DisplayPartyMenuMessage
 *  appelé depuis ItemUseCB_* : "Les PV de X sont restaurés...", "X est guéri
 *  du PSN", "Ça n'aura aucun effet.", etc.). Phase passe à `'item_used_msg'`,
 *  on draw msg dans WIN_MSG, et au prochain A_BUTTON → ClosePartyScreen vers
 *  bag (via savedCallback = CB2_ReturnToBagMenu). */
let _itemUsedMsgText: string | null = null;

/** État boîte de stats level-up (Rare Candy / Super Bonbon). 1:1 décomp :
 *  `sPartyMenuInternal->data` stocke les stats AVANT (slots 0-5) / APRÈS (6-11)
 *  + `data[12]` = windowId. Ici en module vars. `_lvlUpStatsBefore/After` sont
 *  STAT_-indexés ([HP,ATK,DEF,SPEED,SPATK,SPDEF]) = ordre BufferMonStatsToTaskData /
 *  GetMonLevelUpWindowStats. */
let _lvlUpStatsWinId = -1;
let _lvlUpStatsBefore: number[] = [];
let _lvlUpStatsAfter: number[] = [];

/** 1:1 décomp `PartyMenuModifyHP` state (party_menu.c:5455). Le décomp utilise
 *  les data slots de la task ; ici on stocke en module vars. */
let _hpAnimSlot = -1;
let _hpAnimDirection = 0;  // +1 (heal) ou -1 (damage)
let _hpAnimRemaining = 0;  // delta countdown
let _hpAnimOnDone: (() => void) | null = null;
let _hpAnimFrameCounter = 0;  // pour throttler (= 1 HP par 2 frames typique).
/** Action menu state : sub-cursor pos + spawned window id. 1:1 décomp
 *  sPartyMenuInternal->actions / numActions / windowId[0]. */
let _actionCursor = 0;
let _actionWindowId = -1;
let _actionList: number[] = [];  // MENU_SUMMARY=0, MENU_ITEM=3, MENU_CANCEL1=2 (= notre order)
// 1:1 décomp : distingue le menu d'action mon (PARTY_MSG_DO_WHAT_WITH_MON) du
// sous-menu objet ouvert par CursorCb_Item (ACTIONS_ITEM, PARTY_MSG_DO_WHAT_WITH_ITEM).
let _actionSubMenu: 'mon' | 'item' = 'mon';
// État du round-trip DONNER (CursorCb_Give → sac → CB2_GiveHoldItem) : préservés à
// travers la fermeture/réouverture du party menu (le teardown reset _slotId=0 ;
// GoToBagMenu écrase savedCallback). 1:1 décomp = gPartyMenu.slotId/exitCallback.
let _giveHoldItemSlot = -1;
let _giveReturnCb: CB2Callback | null = null;
let _pendingGiveMessage: string | null = null;
// Échange objet tenu (2b) : mon tient déjà un objet → prompt Oui/Non.
let _giveOldItem = 0;          // sPartyMenuItemId (objet déjà tenu)
let _giveNewItem = 0;          // gSpecialVar_ItemId persisté pour le swap après reopen
let _pendingSwitchPrompt = false;
// GIVE-FROM-BAG (#12) : donner un objet du SAC à un mon (bag→party). Entrée =
// CB2_ChooseMonToGiveItem (mode PARTY_ACTION_GIVE_ITEM). Différence avec DONNER
// (party→bag) : la CONTINUATION après le message (X reçu / échangé / erreur mail)
// FERME le party menu → retour SAC (phase 'item_used_msg'), au lieu de revenir au
// choix-mon (phase 'helditem_msg'). `_giveFromBag` aiguille les handlers partagés.
let _giveFromBag = false;
let _partyBagItem = 0;         // 1:1 décomp gPartyMenu.bagItem (objet choisi dans le sac)
/** 1:1 décomp `sPartyMenuInternal->exitCallback` — callback de sortie
 *  TRANSITOIRE, consommé UNE fois dans Task_ClosePartyMenuAndSetCB2
 *  (party_menu.c:1238). Distinct de `gPartyMenu.exitCallback` (= notre
 *  `gMain.savedCallback`, sortie ULTIME vers le field). Set par
 *  `CursorCb_Summary` (RESUME) = CB2_ShowPokemonSummaryScreen. */
let _partyTransientExitCb: (() => void) | null = null;
// ─── Replace-move (level-up/CT) — 1:1 party_menu.c:4815-4953 (dette #8 SOLDÉE
// 2026-07-02). Round-trip party → summary select-move → party.
/** 1:1 `gPartyMenu.data1` (:5120) : le move en cours d'apprentissage — survit au
 *  round-trip summary (gMoveToLearn peut être écrasé entre-temps). */
let _learnMoveData1 = 0;
/** 1:1 `gPartyMenu.learnMoveState` (:5056) : 1 = chaîne level-up (Rare Candy —
 *  continue avec Task_TryLearningNextMove), 0 = CT/CS (ferme le party après). */
let _learnMoveState = 0;
// Slot + callback de sortie ULTIME sauvés AVANT le teardown (même piège que
// _giveHoldItemSlot : _freePartyMenu reset _slotId, le summary écrase savedCallback).
let _learnMoveSlot = -1;
let _learnMoveReturnCb: CB2Callback | null = null;
// Reopen post-summary : consommé par CB2_InitPartyMenu (branche des pendings).
let _pendingLearnMoveReturn = false;
// Garde one-shot : ShowSelectMovePokemonSummaryScreen est ASYNC (le décomp est
// synchrone) → le CB2 transitoire est rappelé chaque frame jusqu'au handoff.
let _showForgetSummaryPending = false;
/** Mon ciblé par CB2_ShowPokemonSummaryScreen (= `gPlayerParty[
 *  gPartyMenu.slotId]`) + garde one-shot : le décomp `ShowPokemonSummaryScreen`
 *  est synchrone, notre `OpenSummaryScreen` est async (_loadAssets) donc ce CB2
 *  est rappelé chaque frame jusqu'au SetMainCallback2(CB2_InitSummaryScreen). */
let _summaryTargetMon: Pokemon | null = null;
let _showSummaryPending = false;
/** 1:1 décomp `CB2_ReturnToPartyMenuFromSummaryScreen` (party_menu.c:2790) :
 *  re-init avec `Task_TryCreateSelectionWindow` + `PARTY_MSG_DO_WHAT_WITH_MON`
 *  = la fenêtre de sélection (RESUME/OBJET/RETOUR) se ré-ouvre sur le mon vu. */
let _reopenActionMenuAfterInit = false;
let _assets: PartyAssets | null = null;
let _assetsLoading: Promise<PartyAssets> | null = null;
let _slotWindowIds: number[] = [];
let _msgWid = -1;
let _cancelButtonWid = -1;
let _inputTaskId = -1;
let _bounceTaskId = -1;
/** Indexed par slot index (0..5). -1 = pas de mon dans ce slot. */
let _iconOamBySlot: number[] = [-1, -1, -1, -1, -1, -1];
let _iconBaseY: number[] = [0, 0, 0, 0, 0, 0];
/** 1:1 décomp `menuBox->pokeballSpriteId` per slot (= CreatePartyMonPokeballSprite). */
let _pokeballOamBySlot: number[] = [-1, -1, -1, -1, -1, -1];
let _cancelButtonOamId = -1;
/** Per-slot état d'anim icône 1:1 décomp (champs sprite `animDelayCounter`,
 *  `animCmdIndex`, `animNum`) + le « mode callback » posé par AnimateSelected
 *  PartyIcon : 0 = SpriteCB_UpdatePartyMonIcon (non-sélectionné, frame only,
 *  garde le décalage x2/y2), 1 = SpriteCB_BouncePartyMonIcon (sélectionné,
 *  rebond y2). animNum reste 0 en party menu (sAnim_0 dur 6) : party_menu.c
 *  n'appelle JAMAIS StartSpriteAnim sur monSpriteId (CreateMonIcon défaut). */
let _iconAnimDelay: number[] = [0, 0, 0, 0, 0, 0];
let _iconAnimCmdIdx: number[] = [0, 0, 0, 0, 0, 0];
let _iconAnimNum: number[] = [0, 0, 0, 0, 0, 0];
let _iconMode: number[] = [0, 0, 0, 0, 0, 0];
/** 1:1 décomp `gPartyMenu.slotId` (= currently highlighted slot).
 *  Valeurs : 0..5 (mons), 6 = Confirm (unused single layout), 7 = Cancel button. */
let _slotId = 0;
let _lastSelectedSlot = 0;

/** 1:1 décomp `gPartyMenu.action` (party_menu.h) — sous-ensemble utilisé ici.
 *  PARTY_ACTION_CHOOSE_MON = défaut ; PARTY_ACTION_SWITCH = on choisit le
 *  2e mon pour la permutation (option ORDRE) ; SWITCHING = anim slide en
 *  cours (incrément 2). */
// 1:1 décomp constants/party_menu.h:67-77 — importé depuis decomp-data au top
// (= PARTY_ACTION_CHOOSE_MON/USE_ITEM/SWITCH/SWITCHING + reste de l'enum).
let _partyAction: number = PARTY_ACTION_CHOOSE_MON;
/** 1:1 décomp `gPartyMenu.menuType` (party_menu.h) — sous-ensemble utilisé :
 *  FIELD (défaut) et DAYCARE (dépôt pension, InitPartyMenu type 6). PERSISTE à
 *  travers close/reopen (1:1 : le décomp ne le reset jamais au teardown — le
 *  round-trip résumé daycare le relit) ; posé par chaque point d'entrée. */
let _menuType: number = PARTY_MENU_TYPE_FIELD;
/** 1:1 décomp `gPartyMenu.slotId` PERSISTÉ après close : le décomp ne reset pas
 *  gPartyMenu au teardown, et les specials pension (GetSelectedMonNicknameAndSpecies,
 *  StoreSelectedPokemonInDaycare) lisent GetCursorSelectionMonId APRÈS la fermeture
 *  du menu. Notre _freePartyMenu reset _slotId=0 (adaptation) → capture ici. */
let _cursorSelectionMonId = 0;
// (LOT 7 : _battleSwitchActiveSlot/_battleSwitchAllowCancel SUPPRIMÉS — le blocage
// « mon déjà actif » et le refus d'annuler = TrySwitchInPokemon/HandleChooseMonCancel
// 1:1, plus des gardes à la sélection.)
/** Id FIELD du mon actif (gBattlerPartyIndexes[battler], trace debug) + flag
 *  « ordre battle posé » (closeBattleOrder au ClosePartyScreen). */
let _battleSwitchActivePartyId = -1;
let _battleOrderApplied = false;
/** 1:1 décomp `gPartyMenu.slotId2` (= 1er mon mémorisé pour la permutation). */
let _slotId2 = 0;
let _graphicsReady = false;
let _graphicsLoading = false;
let _windowsReady = false;
let _windowsLoading = false;

async function _loadAssets(): Promise<PartyAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    // 1:1 décomp `LoadCompressedPalette(gPartyMenuBg_Pal, BG_PLTT_ID(0),
    // 11 * PLTT_SIZE_4BPP)` (party_menu.c:749) : load 11 sub-palettes (= 176
    // entries). Le bg.gbapal extrait par extract-all-tile-bins.mjs contient
    // les 11 sub-palettes (= 352 bytes). loadIndexedPngStrict ne retourne
    // que la PLTE chunk PNG (= 16 entries first sub-pal seul) → palette 1+
    // restent vides → bg.bin entries paletteNum=1..10 rendent BLACK.
    const fetchU8 = async (url: string): Promise<Uint8Array> => {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`fetch failed ${url} → ${r.status}`);
      return new Uint8Array(await r.arrayBuffer());
    };
    const [bgTilesRaw, bgTilemapBin, bgPalFull, slotMain, slotWide, slotWideEmpty, slotMainNoHp, slotWideNoHp] = await Promise.all([
      loadTileBin('/decomp/em/party_menu/bg.png', 4),
      loadTilemapBin('/decomp/em/party_menu/bg.bin'),
      // 1:1 décomp FR `gPartyMenuBg_Pal` = bg.pal JASC text 176 entries
      // (= 11 sub-palettes). Le PLTE chunk PNG ne contient que 16 entries
      // (= sub-pal 0 only) — cf. doc loadIndexedPngStrict pour le pattern.
      loadGbaPal('/decomp/em/party_menu/bg.pal'),
      // 1:1 décomp `sSlotTilemap_Main/_Wide/_WideEmpty` (party_menu.h:565-569).
      // Stride encoded dans `BlitBitmapToPartyWindow_LeftColumn` (= width arg).
      fetchU8('/decomp/em/party_menu/slot_main.bin'),
      fetchU8('/decomp/em/party_menu/slot_wide.bin'),
      fetchU8('/decomp/em/party_menu/slot_wide_empty.bin'),
      fetchU8('/decomp/em/party_menu/slot_main_no_hp.bin'),
      fetchU8('/decomp/em/party_menu/slot_wide_no_hp.bin'),
    ]);
    _assets = {
      bgTiles: bgTilesRaw,
      bgTilemap: bgTilemapBin,
      bgPalette: bgPalFull,  // 176 entries = palettes 0..10
      slotMainTilemap: slotMain,
      slotWideTilemap: slotWide,
      slotWideEmptyTilemap: slotWideEmpty,
      slotMainNoHpTilemap: slotMainNoHp,
      slotWideNoHpTilemap: slotWideNoHp,
    };
    return _assets;
  })();
  return _assetsLoading;
}

/** 1:1 décomp `InitBgs` party_menu.c:715. */
function _initPartyBgs(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  // 1:1 décomp `ResetVramOamAndBgCntRegs()` (menu_helpers.c:94) — fn PARTAGÉE.
  ResetVramOamAndBgCntRegs();
  // 1:1 décomp BG templates (= party_menu.h:1).
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg0c.mapBaseIndex = PARTY_WIN_MAP_BASE;
  bg0c.screenSize = 0; bg0c.paletteMode = 0; bg0c.priority = 1; bg0c.visible = true;
  bg0c.hofs = 0; bg0c.vofs = 0;
  const bg1c = rt.gba.bg(1).config;
  bg1c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg1c.mapBaseIndex = PARTY_BG_MAP_BASE;
  bg1c.screenSize = 0; bg1c.paletteMode = 0; bg1c.priority = 2; bg1c.visible = true;
  bg1c.hofs = 0; bg1c.vofs = 0;
  const bg2c = rt.gba.bg(2).config;
  bg2c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg2c.mapBaseIndex = PARTY_OVERLAY_MAP_BASE;
  bg2c.screenSize = 0; bg2c.paletteMode = 0; bg2c.priority = 0; bg2c.visible = true;
  bg2c.hofs = 0; bg2c.vofs = 0;
  rt.gba.bg(3).config.visible = false;
  // 1:1 décomp `ResetAllBgsCoordinates()` (menu_helpers.c:106) — fn PARTAGÉE.
  ResetAllBgsCoordinates();
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400);
  rt.SetGpuReg(0x50, 0);
  ShowBg(0); ShowBg(1); ShowBg(2); HideBg(3);
}

function _loadPartyGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
  if (!rt) return false;
  if (_graphicsReady) return true;
  if (_graphicsLoading) return false;
  _graphicsLoading = true;
  void _loadAssets().then((assets) => {
    const r = getRuntime();
    if (!r) { _graphicsLoading = false; return; }
    // Load tiles à charBase=0.
    const charOff = PARTY_TILES_CHAR_BASE * 0x4000;
    r.gba.vram.set(assets.bgTiles, charOff);
    // 1:1 décomp `LZDecompressWram(gPartyMenuBg_Tilemap, sPartyBgTilemapBuffer)` +
    // `SetBgTilemapBuffer(1, ...)` (party_menu.c:719,744) : bg.bin va à BG1
    // mapBase=30, PAS BG2 mapBase=28. BG2 reste vide (= laisse BG0+BG1 transparaitre).
    const bgMapOff = PARTY_BG_MAP_BASE * 0x800;
    const bgBytes = new Uint8Array(
      assets.bgTilemap.buffer, assets.bgTilemap.byteOffset, assets.bgTilemap.byteLength,
    );
    r.gba.vram.set(bgBytes, bgMapOff);
    // 1:1 décomp `LoadCompressedPalette(gPartyMenuBg_Pal, BG_PLTT_ID(0),
    // 11 * PLTT_SIZE_4BPP)` (party_menu.c:749) — load 11 sub-palettes (= 176 entries).
    LoadPalette(assets.bgPalette, 0, assets.bgPalette.length * 2);
    // 1:1 décomp `PartyPaletteBufferCopy(palNum)` (party_menu.c:779) : COPIE
    // palette 3 (= la sub-pal "base" du slot 0 big) vers palettes 4..8 (=
    // les slots wide 1-5). SANS ce step, palettes 4-8 utilisent les sub-pals
    // 4-8 du bg.pal (= des couleurs différentes/roses) au lieu de la même
    // sub-pal base que slot 0. Appelé pour palNum=4..8 sequentially.
    for (let palNum = 4; palNum <= 8; palNum++) {
      const src = new Uint16Array(16);
      for (let k = 0; k < 16; k++) src[k] = assets.bgPalette[3 * 16 + k];
      LoadPalette(src, palNum * 16, 32);
    }
    _graphicsReady = true;
    _graphicsLoading = false;
  }).catch((e) => {
    // BLOQ-1 fail-open : _loadAssets met en cache une promesse REJETÉE (_assetsLoading
    // jamais vidé) → sans ça, case 8 re-tente la même promesse rejetée à chaque frame,
    // _graphicsReady jamais true = party menu figé pour toujours. On marque ready (menu
    // dégradé sans gfx BG mais navigable) au lieu de geler. Règle 3 : ça HURLE.
    console.error('[party-screen] graphics load KO — party menu dégradé SANS gel', e);
    _graphicsReady = true;
    _graphicsLoading = false;
  });
  return false;
}

async function _loadPartyWindowsCb2(rt: ReturnType<typeof getRuntime>): Promise<void> {
  if (!rt) return;
  // InitWindows pour 6 slots + cancel button (= persistents). Le _msgWid est
  // créé dynamiquement par `_drawMsg` (= 1:1 décomp DisplayPartyMenuStdMessage
  // qui remove+add le window à chaque change de stringId).
  const ids = InitWindows([...SLOT_WINDOW_TEMPLATES, CANCEL_BUTTON_WINDOW_TEMPLATE]);
  _slotWindowIds = ids.slice(0, 6);
  _msgWid = -1;  // = WINDOW_NONE, créé par _drawMsg
  _cancelButtonWid = ids[6];
  // 1:1 décomp `InitPartyMenuWindows` (party_menu.c:2094-2098) :
  //   LoadUserWindowBorderGfx(0, 0x4F, BG_PLTT_ID(13));
  //   LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(14), PLTT_SIZE_4BPP);
  //   LoadPalette(gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
  // 1:1 décomp `LoadUserWindowBorderGfx(0, 0x4F, BG_PLTT_ID(13))` (:2096) :
  // charge le cadre de fenêtre CHOISI PAR LE JOUEUR dans le menu OPTIONS
  // (gameState.options.windowFrameType = gSaveBlock2->optionsWindowFrameType),
  // PAS un cadre hardcodé. L'ancien code force-chargeait `1.png` (style fixe)
  // → à l'entrée du party menu le cadre du message reprenait le style par
  // défaut au lieu du style user (bug A/B : corrigé en ouvrant/fermant un
  // profil car _openActionMenu appelle le vrai LoadUserWindowBorderGfx).
  // preloadTextWindowFrames d'abord (idempotent) : en ?debug le preload
  // BirchRuntimeScene est skippé → assetCache vide sinon (= pal 13 noire).
  // Exactement le même appel que _openActionMenu (qui, lui, marche).
  await preloadTextWindowFrames();
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);  // 1:1 BG_PLTT_ID(13)
  const stdMenuPal = await loadGbaPal('/decomp/em/interface/std_menu.pal');
  LoadPalette(stdMenuPal, 15 * 16, 32);
  // 1:1 décomp BG_PLTT_ID(14) = overworld textbox palette (= action menu BG).
  // Sans ça, palette 14 = noir → action window BG noir au lieu de gris/blanc.
  // Pour MVP : use std_menu palette (= même que pal 15 = blanc/gris). Le décomp
  // utilise GetOverworldTextboxPalettePtr() qui dépend du frame style user.
  LoadPalette(stdMenuPal, 14 * 16, 32);
  // Initial fill transparent + put tilemap.
  for (const wid of _slotWindowIds) {
    FillWindowPixelBuffer(wid, 0x00);
    PutWindowTilemap(wid);
  }
  // _msgWid créé dynamiquement par _drawMsg (= différent template selon msg).
}

/** 1:1 décomp `BlitBitmapToPartyWindow` (party_menu.c:2150).
 *  Stamp un tilemap u8 (chaque entry = tile index dans bg.png char data) dans
 *  le window pixel buffer via lookup tiles raw 4bpp depuis `assets.bgTiles`.
 *  Le décomp pattern :
 *    pixels = AllocZeroed(height * width * 32);
 *    for (i, j) : CpuCopy16(GetPartyMenuBgTile(b[x+j + (y+i)*stride]), &pixels[(i*width + j)*32], 32)
 *    BlitBitmapToWindow(wid, pixels, x*8, y*8, width*8, height*8)
 */
function BlitBitmapToPartyWindow(
  windowId: number,
  tilemap: Uint8Array, stride: number,
  rx: number, ry: number, rw: number, rh: number,
): void {
  if (!_assets) return;
  const pixels = new Uint8Array(rw * rh * 32);
  for (let i = 0; i < rh; i++) {
    for (let j = 0; j < rw; j++) {
      const tileIdx = tilemap[(rx + j) + (ry + i) * stride];
      const srcOff = tileIdx * 32;
      pixels.set(_assets.bgTiles.subarray(srcOff, srcOff + 32), (i * rw + j) * 32);
    }
  }
  BlitBitmapToWindow(windowId, pixels, rx * 8, ry * 8, rw * 8, rh * 8, rw * 8);
}

/** 1:1 décomp `BlitBitmapToPartyWindow_LeftColumn` (party_menu.c:2167) :
 *  blitFunc de la box slot 0 (colonne gauche). width/height=0 → défaut 10×7.
 *  hideHP → variante sSlotTilemap_MainNoHP (= box œuf sans zone PV). */
function BlitBitmapToPartyWindow_LeftColumn(windowId: number, x: number, y: number, width: number, height: number, hideHP: boolean): void {
  if (!_assets) return;
  if (width === 0 && height === 0) { width = 10; height = 7; }
  if (hideHP === false)
    BlitBitmapToPartyWindow(windowId, _assets.slotMainTilemap, 10, x, y, width, height);
  else
    BlitBitmapToPartyWindow(windowId, _assets.slotMainNoHpTilemap, 10, x, y, width, height);
}

/** 1:1 décomp `BlitBitmapToPartyWindow_RightColumn` (party_menu.c:2180) :
 *  blitFunc des box slots 1-5 (colonne droite). width/height=0 → défaut 18×3. */
function BlitBitmapToPartyWindow_RightColumn(windowId: number, x: number, y: number, width: number, height: number, hideHP: boolean): void {
  if (!_assets) return;
  if (width === 0 && height === 0) { width = 18; height = 3; }
  if (hideHP === false)
    BlitBitmapToPartyWindow(windowId, _assets.slotWideTilemap, 18, x, y, width, height);
  else
    BlitBitmapToPartyWindow(windowId, _assets.slotWideNoHpTilemap, 18, x, y, width, height);
}

/** 1:1 décomp `DrawEmptySlot` (party_menu.c:2193) :
 *  BlitBitmapToPartyWindow(windowId, sSlotTilemap_WideEmpty, 18, 0, 0, 18, 3). */
function DrawEmptySlot(windowId: number): void {
  if (!_assets) return;
  BlitBitmapToPartyWindow(windowId, _assets.slotWideEmptyTilemap, 18, 0, 0, 18, 3);
}

/** ÉCART port : au décomp la blitFunc (LeftColumn slot 0 / RightColumn slots
 *  1-5) est appelée DANS DisplayPartyPokemonData (:876/881) et DrawEmptySlot
 *  dans RenderPartyMenuBox (:841). Le port factorise ces appels ici (la paire
 *  `_drawSlotFrame + _drawSlot` = DisplayPartyPokemonData). Ce dispatcher
 *  sélectionne la blitFunc / DrawEmptySlot selon slot + état (occupé/œuf/vide),
 *  exactement comme `infoRects->blitFunc(.,hideHP)` + le check species==NONE. */
function _drawSlotFrame(slotIdx: number): void {
  if (!_assets) return;
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  const mon = _slotMon(slotIdx);
  // 1:1 décomp DisplayPartyPokemonData (:876) : un ŒUF blit la variante
  // NoHP (hideHP=TRUE) = box SANS label "PV"/barre.
  const isEgg = !!mon?.isEgg;
  if (slotIdx === 0) {
    // Slot 0 = blitFunc LeftColumn (1:1 sPartyMenuBoxes[0].infoRects = LEFT_COLUMN).
    BlitBitmapToPartyWindow_LeftColumn(wid, 0, 0, 0, 0, isEgg);
  } else if (!mon) {
    // Slot vide 1-5 : 1:1 RenderPartyMenuBox species==NONE → DrawEmptySlot (:841).
    DrawEmptySlot(wid);
  } else {
    // Slots 1-5 occupés : blitFunc RightColumn (hideHP=isEgg).
    BlitBitmapToPartyWindow_RightColumn(wid, 0, 0, 0, 0, isEgg);
  }
}

/** 1:1 décomp `DisplayPartyPokemonHP(hp, …)` (party_menu.c:2367) :
 *    strOut = ConvertIntToDecimalStringN(gStringVar1, hp, STR_CONV_MODE_RIGHT_ALIGN, 3);
 *    strOut[0] = CHAR_SLASH; strOut[1] = EOS;  →  rend "{hp}/".
 *  Le padding GAUCHE de RIGHT_ALIGN est CHAR_SPACER (0x77, largeur FONT_SMALL 5px
 *  = largeur d'un chiffre, gFontSmallLatinGlyphWidths fonts.c:48) → le nombre est
 *  rendu mono-chasse 5px, donc le "/" final tombe TOUJOURS à x = HPx + 15 (= x du
 *  "/" de MaxHP) quel que soit le nb de chiffres → les 2 "/" coïncident → 1 SEUL
 *  slash visible, 1:1 ROM. ConvertIntToDecimalStringN écrit DIRECTEMENT les bytes
 *  charmap dans gStringVar1 (foyer 1:1 string_util.ts, plus le bridge JS-string).
 *  TEXT_SKIP_DRAW = rendu synchrone instantané (text.ts:955) → réutilisation de
 *  gStringVar1 entre HP et MaxHP sûre (pas d'aliasing différé). */
function DisplayPartyPokemonHP(wid: number, x: number, y: number, hp: number): void {
  const strOut = ConvertIntToDecimalStringN(gStringVar1, hp, STR_CONV_MODE_RIGHT_ALIGN, 3);
  strOut[0] = CHAR_SLASH;
  strOut[1] = EOS;
  AddTextPrinterParameterized3(wid, FONT_SMALL, x, y, COLOR_HP, TEXT_SKIP_DRAW, gStringVar1);
}

/** 1:1 décomp `DisplayPartyPokemonMaxHP(maxhp, …)` (party_menu.c:2388) :
 *    ConvertIntToDecimalStringN(gStringVar2, maxhp, RIGHT_ALIGN, 3);
 *    StringCopy(gStringVar1, gText_Slash); StringAppend(gStringVar1, gStringVar2);  →  "/{maxhp}".
 *  `gText_Slash` ("/") pas encore porté → on écrit CHAR_SLASH puis ConvertInt dans
 *  gStringVar1.subarray(1) : byte-pour-byte identique à "/{maxhp}". */
function DisplayPartyPokemonMaxHP(wid: number, x: number, y: number, maxhp: number): void {
  gStringVar1[0] = CHAR_SLASH;
  ConvertIntToDecimalStringN(gStringVar1.subarray(1), maxhp, STR_CONV_MODE_RIGHT_ALIGN, 3);
  AddTextPrinterParameterized3(wid, FONT_SMALL, x, y, COLOR_HP, TEXT_SKIP_DRAW, gStringVar1);
}

/** 1:1 décomp `DisplayPartyPokemonNickname` (party_menu.c:2287) : rend le surnom
 *  (GetMonNickname → un œuf donne gText_EggNickname "OEUF") aux coords
 *  sPartyBoxInfoRects[col].dimensions[0,1]. ÉCART port : coords hardcodées par
 *  colonne (slot 0 = LEFT_COLUMN (24,11) / slots 1-5 = RIGHT_COLUMN (22,3)) au
 *  lieu de la table infoRects ; le paramètre `c` (blitFunc-erase quand c==1)
 *  n'est pas porté (les appelants du port passent tous c=0). */
function DisplayPartyPokemonNickname(mon: Pokemon, slotIdx: number): void {
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  // 1:1 GetMonNickname : un œuf → gText_EggNickname ("OEUF", strings.c:21).
  const nickname = mon.isEgg ? getString('gText_EggNickname') : mon.nickname;
  const [x, y] = slotIdx === 0 ? [24, 11] : [22, 3];
  AddTextPrinterParameterized3(wid, FONT_SMALL, x, y, COLOR_TEXT, TEXT_SKIP_DRAW, nickname);
}

/** 1:1 décomp `DisplayPartyPokemonLevel` (party_menu.c:2315) : "N.{level}"
 *  (gText_LevelSymbol + niveau) aux coords dimensions[4,5]. ÉCART port : coords
 *  hardcodées (slot 0 (32,20) / slots 1-5 (30,12)), symbole "N." littéral. */
function DisplayPartyPokemonLevel(mon: Pokemon, slotIdx: number): void {
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  const [x, y] = slotIdx === 0 ? [32, 20] : [30, 12];
  AddTextPrinterParameterized3(wid, FONT_SMALL, x, y, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
}

/** 1:1 décomp `DisplayPartyPokemonLevelCheck` (party_menu.c:2300) : le NIVEAU
 *  n'est dessiné QUE si ailment ∈ {AILMENT_NONE(0), AILMENT_PKRS(6)}. Tout autre
 *  statut (PSN/PAR/SLP/FRZ/BRN) ou K.O. (HP=0=FNT) → pas de niveau, laissant la
 *  place à l'icône statut 32×8. (c=0 au port → pas de blitFunc-erase.) */
function DisplayPartyPokemonLevelCheck(mon: Pokemon, slotIdx: number): void {
  const ailment = _ailmentFromStatus(mon);
  if (ailment === 0 || ailment === 6) DisplayPartyPokemonLevel(mon, slotIdx);
}

/** 1:1 décomp `DisplayPartyPokemonGender` (party_menu.c:2333) : charge les 2
 *  couleurs genderMale/Female aux positions TEXT_DYNAMIC_COLOR_2/3 (0xB/0xC) de
 *  la sub-pal du slot puis rend le symbole "♂"/"♀" (COLOR_GENDER=[0,0xB,0xC])
 *  aux coords dimensions[8,9]. ÉCART port : coords hardcodées (slot 0 (64,20) /
 *  slots 1-5 (62,12)) ; le check Nidoran-M/F dont le surnom == nom d'espèce
 *  (party_menu.c:2339, qui supprime le symbole) N'EST PAS porté → genre toujours
 *  affiché. Le chargement palette 0xB/0xC est disjoint de COLOR_TEXT/HP=[0,3,2]
 *  (nickname/niveau/PV) → l'ordre load↔render des autres champs est indifférent. */
function DisplayPartyPokemonGender(mon: Pokemon, slotIdx: number): void {
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  const g = GetGenderFromSpeciesAndPersonality(mon.species, mon.personality);
  const gSym: 'M' | 'F' | null = g === MON_MALE ? 'M' : g === MON_FEMALE ? 'F' : null;
  if (!gSym) return;  // MON_GENDERLESS → aucune case dans le switch décomp
  const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum ?? 3;
  _loadGenderColors(slotPalNum, gSym === 'M');
  const [x, y] = slotIdx === 0 ? [64, 20] : [62, 12];
  AddTextPrinterParameterized3(wid, FONT_SMALL, x, y, COLOR_GENDER, TEXT_SKIP_DRAW, gSym === 'M' ? '♂' : '♀');
}

/** ÉCART port : le décomp n'a PAS ce sous-helper — les DisplayPartyPokemon* sont
 *  appelés inline dans DisplayPartyPokemonData (:872). Le port les factorise ici
 *  (la moitié « données » de DisplayPartyPokemonData, partagée avec _drawSlotFrame
 *  via la paire `_drawSlotFrame + _drawSlot` = DisplayPartyPokemonData). Ajoute
 *  aussi le refresh sprites statut/objet-tenu du slot (SetPartyMonAilmentGfx +
 *  UpdatePartyMonHeldItemSprite) et le check species==NONE de RenderPartyMenuBox
 *  (:839) via `!mon`. L'ordre des DisplayPartyPokemon* = 1:1 DisplayPartyPokemonData
 *  else-branch (:881-887) : Nickname, LevelCheck, Gender, HP, MaxHP, HPBar. */
function _drawSlot(slotIdx: number): void {
  if (_slotWindowIds[slotIdx] === undefined) return;
  const wid = _slotWindowIds[slotIdx];
  const mon = _slotMon(slotIdx);
  // Refresh icône statut + objet tenu du slot (sprites slot-pinned).
  _updatePartyMonAilmentGfx(slotIdx);
  _updatePartyMonHeldItem(slotIdx);
  if (!mon) {
    // 1:1 RenderPartyMenuBox species==NONE (:839) : slot vide, aucun texte.
    CopyWindowToVram(wid, 3);
    return;
  }
  // 1:1 décomp DisplayPartyPokemonData (:872) : un ŒUF n'affiche QUE le nickname
  // (blitFunc(.,TRUE) a blanchi les zones niveau/genre/PV).
  if (mon.isEgg) {
    DisplayPartyPokemonNickname(mon, slotIdx);
    CopyWindowToVram(wid, 3);
    return;
  }
  DisplayPartyPokemonNickname(mon, slotIdx);
  DisplayPartyPokemonLevelCheck(mon, slotIdx);
  DisplayPartyPokemonGender(mon, slotIdx);
  if (slotIdx === 0) {
    // sPartyBoxInfoRects[PARTY_BOX_LEFT_COLUMN] : HP (38,37), MaxHP (53,37).
    DisplayPartyPokemonHP(wid, 38, 37, mon.hp);
    DisplayPartyPokemonMaxHP(wid, 53, 37, mon.maxHP);
  } else {
    // sPartyBoxInfoRects[PARTY_BOX_RIGHT_COLUMN] : HP (102,12), MaxHP (117,12).
    DisplayPartyPokemonHP(wid, 102, 12, mon.hp);
    DisplayPartyPokemonMaxHP(wid, 117, 12, mon.maxHP);
  }
  DisplayPartyPokemonHPBar(slotIdx, mon);
  CopyWindowToVram(wid, 3);
}

function _drawAllSlots(): void {
  // 1:1 décomp order : blit frame d'abord, puis text overlay (= AddTextPrinter
  // écrit dans le même window pixel buffer, par-dessus le frame).
  for (let i = 0; i < 6; i++) {
    _drawSlotFrame(i);
    _drawSlot(i);
  }
}

/** 1:1 décomp `GetHPBarLevel(hp, maxhp)` (battle_interface.c:2527).
 *  Returns 'GREEN' / 'YELLOW' / 'RED' / 'EMPTY' / 'FULL' selon fraction. */
function _getHpBarLevel(hp: number, maxhp: number): 'FULL' | 'GREEN' | 'YELLOW' | 'RED' | 'EMPTY' {
  if (hp === maxhp) return 'FULL';
  const fraction = hp / maxhp;
  if (fraction > 0.5) return 'GREEN';
  if (fraction > 0.2) return 'YELLOW';
  if (fraction > 0) return 'RED';
  return 'EMPTY';
}

/** 1:1 décomp `DisplayPartyPokemonHPBar` (party_menu.c:2402) :
 *  - Load palette colors aux positions [9, 10] avec sHPBar(Green/Yellow/Red)PalIds
 *  - FillWindowPixelRect avec palette idx 9 (top row 1px) + 10 (bottom 2 rows)
 *  - Pour la partie vide (empty), fill avec idx 0x0D et 0x02 (= alternating
 *    fill pattern du décomp). */
function DisplayPartyPokemonHPBar(slotIdx: number, mon: Pokemon): void {
  if (!_assets) return;
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum;
  if (slotPalNum === undefined) return;

  // Load HP bar palette colors selon le level.
  const level = _getHpBarLevel(mon.hp, mon.maxHP);
  const palIds =
    (level === 'FULL' || level === 'GREEN') ? sHPBarGreenPalIds
    : level === 'YELLOW' ? sHPBarYellowPalIds
    : sHPBarRedPalIds;
  for (let i = 0; i < 2; i++) {
    const src = new Uint16Array(1);
    src[0] = _assets.bgPalette[palIds[i]];
    LoadPalette(src, slotPalNum * 16 + sHPBarPalOffsets[i], 2);
  }

  // Position de la bar HP : (x, y, w) selon slot layout.
  const [x, y, w] = slotIdx === 0 ? HP_BAR_RECT_LEFT : HP_BAR_RECT_RIGHT;
  // 1:1 décomp GetScaledHPFraction : ratio * width arrondi.
  const hpFraction = Math.floor((mon.hp / mon.maxHP) * w);

  // 1:1 décomp FillWindowPixelRect (party_menu.c:2402) :
  //   row 1 (haut, 1 px) = sHPBarPalOffsets[1] (= idx 10 = couleur FONCÉE)
  //   row 2-3 (bas, 2 px) = sHPBarPalOffsets[0] (= idx 9 = couleur CLAIRE)
  // L'inversion visuelle (foncé top / clair bot) donne l'effet d'ombrage de la
  // ROM. NE PAS swap ces deux args — c'est ce qui rend la bar 1:1 décomp.
  FillWindowPixelRect(wid, sHPBarPalOffsets[1], x, y,     hpFraction, 1);
  FillWindowPixelRect(wid, sHPBarPalOffsets[0], x, y + 1, hpFraction, 2);
  // Partie vide alternating fill 0x0D (top, foncé) + 0x02 (bot, clair).
  if (hpFraction !== w) {
    FillWindowPixelRect(wid, 0x0D, x + hpFraction, y,     w - hpFraction, 1);
    FillWindowPixelRect(wid, 0x02, x + hpFraction, y + 1, w - hpFraction, 2);
  }
}

/** 1:1 décomp swap gender colors aux positions TEXT_DYNAMIC_COLOR_2 (=0xB)
 *  et TEXT_DYNAMIC_COLOR_3 (=0xC) dans la sub-pal du slot. Avant de render
 *  le ♂/♀ symbol, le décomp write `bgPalette[sGenderMale/FemalePalIds[i]]`
 *  vers ces positions, puis render avec color triple [0, 0xB, 0xC]. */
function _loadGenderColors(slotPalNum: number, isMale: boolean): void {
  if (!_assets) return;
  const ids = isMale ? sGenderMalePalIds : sGenderFemalePalIds;
  for (let i = 0; i < 2; i++) {
    const src = new Uint16Array(1);
    src[0] = _assets.bgPalette[ids[i]];
    // Position dans la sub-pal = 0xB + i (= TEXT_DYNAMIC_COLOR_2 + offset).
    LoadPalette(src, slotPalNum * 16 + 0xB + i, 2);
  }
}

/** 1:1 décomp `LOAD_PARTY_BOX_PAL` macro (party_menu.c:2198) :
 *  Pour chaque (palId, palOffset) dans les arrays 3-element, copie 1 RGB15 color
 *  depuis `bgPalette[palId]` (= snapshot des 11 sub-pals via PartyMenuInternal->palBuffer)
 *  vers la sub-pal du window slot à position `palOffset + BG_PLTT_ID(slot_pal_num)`. */
function _loadPartyBoxPalSet(slotPalNum: number, palIds: readonly number[], palOffsets: readonly number[]): void {
  if (!_assets) return;
  for (let i = 0; i < 3; i++) {
    const src = new Uint16Array(1);
    src[0] = _assets.bgPalette[palIds[i]];
    LoadPalette(src, slotPalNum * 16 + palOffsets[i], 2);
  }
}

/** 1:1 décomp `LoadPartyBoxPalette` (party_menu.c:2205) :
 *  Sélectionne le palette set selon palFlags + applique 6 color swap (2 sets de 3). */
function _loadPartyBoxPalette(slotIdx: number, palFlags: number): void {
  // Slot palette num = paletteNum du window template (= 3 pour slot 0, 4-8 pour slots 1-5).
  const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum;
  if (slotPalNum === undefined) return;
  if (palFlags & PARTY_PAL_NO_MON) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxNoMonPalIds, sPartyBoxNoMonPalOffsets);
    return;
  }
  if (palFlags & PARTY_PAL_TO_SOFTBOIL) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
    if (palFlags & PARTY_PAL_SELECTED)
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    else
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
    return;
  }
  if (palFlags & PARTY_PAL_SWITCHING) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
    return;
  }
  if (palFlags & PARTY_PAL_TO_SWITCH) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
    if (palFlags & PARTY_PAL_SELECTED)
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    else
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
    return;
  }
  if (palFlags & PARTY_PAL_FAINTED) {
    if (palFlags & PARTY_PAL_SELECTED) {
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionFaintedPalIds, sPartyBoxPalOffsets1);
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    } else {
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxFaintedPalIds1, sPartyBoxPalOffsets1);
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxFaintedPalIds2, sPartyBoxPalOffsets2);
    }
    return;
  }
  if (palFlags & PARTY_PAL_MULTI_ALT) {
    if (palFlags & PARTY_PAL_SELECTED) {
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionMultiPalIds, sPartyBoxPalOffsets1);
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    } else {
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxMultiPalIds1, sPartyBoxPalOffsets1);
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxMultiPalIds2, sPartyBoxPalOffsets2);
    }
    return;
  }
  if (palFlags & PARTY_PAL_SELECTED) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds1, sPartyBoxPalOffsets1);
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    return;
  }
  // Default (= non-selected mon slot).
  _loadPartyBoxPalSet(slotPalNum, sPartyBoxEmptySlotPalIds1, sPartyBoxPalOffsets1);
  _loadPartyBoxPalSet(slotPalNum, sPartyBoxEmptySlotPalIds2, sPartyBoxPalOffsets2);
}

/** 1:1 décomp `GetPartyBoxPaletteFlags` (party_menu.c:1165).
 *  Pour notre MVP single-layout sans switching/softboil, juste SELECTED + FAINTED. */
function _getPartyBoxPaletteFlags(slotIdx: number, animNum: number): number {
  let palFlags = 0;
  if (animNum === 1) palFlags |= PARTY_PAL_SELECTED;
  const mon = _slotMon(slotIdx);
  if (mon && mon.hp === 0) palFlags |= PARTY_PAL_FAINTED;
  return palFlags;
}

/** 1:1 décomp `AnimatePartySlot` (party_menu.c:1120).
 *  animNum=0 = not selected (default), animNum=1 = selected (cursor here).
 *  Pour les mon slots, le décomp call aussi :
 *    AnimateSelectedPartyIcon(monSpriteId, animNum)
 *    PartyMenuStartSpriteAnim(pokeballSpriteId, animNum) ← pokeball Closed/Open */
function AnimatePartySlot(slotIdx: number, animNum: number): void {
  const PARTY_SIZE = 6, CANCEL = PARTY_SIZE + 1;
  if (slotIdx < PARTY_SIZE) {
    const mon = _slotMon(slotIdx);
    if (mon) {
      // 1:1 décomp AnimatePartySlot (party_menu.c:1129-1131) ordre EXACT :
      //   LoadPartyBoxPalette(...) ; AnimateSelectedPartyIcon(monSpriteId,
      //   animNum) ; PartyMenuStartSpriteAnim(pokeballSpriteId, animNum).
      _loadPartyBoxPalette(slotIdx, _getPartyBoxPaletteFlags(slotIdx, animNum));
      // L'ANIM MANQUANTE (bug #1) : décalage icône sélectionné/non-sélectionné.
      _animateSelectedPartyIcon(slotIdx, animNum);
      // 1:1 décomp `PartyMenuStartSpriteAnim(pokeballSpriteId, animNum)` :
      // animNum=0 → Closed (tile 256), animNum=1 → Open (tile 272).
      const rt = getRuntime();
      const pkId = _pokeballOamBySlot[slotIdx];
      if (rt && pkId >= 0) {
        const spr = rt.gSprites[pkId];
        if (spr) {
          const oam = rt.gba.oam[spr.oamIndex];
          if (oam) {
            const POKEBALL_TILE_BASE = 256;
            oam.tileId = POKEBALL_TILE_BASE + (animNum === 1 ? 16 : 0);
          }
        }
      }
    } else {
      // 1:1 décomp `LoadPartyBoxPalette(box, PARTY_PAL_NO_MON)` (party_menu.c:842)
      // pour slot vide → palette swap sPartyBoxNoMonPalIds aux positions
      // sPartyBoxNoMonPalOffsets [1, 11, 12] (= teinte vert-olive match BG).
      _loadPartyBoxPalette(slotIdx, PARTY_PAL_NO_MON);
    }
    return;
  }
  if (slotIdx === CANCEL) {
    // Cancel button OAM frame swap : animNum=0 → frame Closed, animNum=1 → frame Open.
    // 1:1 décomp PartyMenuStartSpriteAnim. Frame 0 = tile 0..15, frame 1 = tile 16..31.
    const rt = getRuntime();
    if (!rt || _cancelButtonOamId < 0) return;
    const spr = rt.gSprites[_cancelButtonOamId];
    if (!spr) return;
    const oam = rt.gba.oam[spr.oamIndex];
    if (!oam) return;
    const POKEBALL_TILE_BASE = 256;
    oam.tileId = POKEBALL_TILE_BASE + (animNum === 1 ? 16 : 0);
  }
}

/** 1:1 décomp `CreateCancelConfirmWindows(chooseHalf=false)` (party_menu.c:2101).
 *  En single layout : spawn sCancelButtonWindowTemplate + render gText_Cancel
 *  (= "SORTIR" FR) centré FONT_SMALL + offset 3 pixels. */
function _drawCancelButtonWindow(): void {
  if (_cancelButtonWid < 0) return;
  FillWindowPixelBuffer(_cancelButtonWid, 0x00);
  const txt = getString('gText_Cancel');  // "SORTIR" FR
  // 1:1 décomp : mainOffset = GetStringCenterAlignXOffset(FONT_SMALL, gText_Cancel, 48) + 3
  // ⚠️ Notre GetStringWidth utilise FONT_NORMAL (= chars plus larges que FONT_SMALL).
  // Pour 1:1 ROM "SORTIR" FONT_SMALL ≈ 30px → mainOffset = (48-30)/2 = 9 + 3 = 12.
  // Hardcode 12 pour matcher pixel position du ROM.
  const mainOffset = 12;
  // sFontColorTable[0] = [TRANSPARENT, LIGHT_GRAY, DARK_GRAY] = [0, 3, 2]
  AddTextPrinterParameterized3(
    _cancelButtonWid, FONT_SMALL, mainOffset, 1,
    [0, 3, 2] as [number, number, number],
    TEXT_SKIP_DRAW, txt,
  );
  PutWindowTilemap(_cancelButtonWid);
  CopyWindowToVram(_cancelButtonWid, 3);
}

/** 1:1 décomp `DisplayPartyMenuStdMessage` (party_menu.c:2459) :
 *  Remove existing msg window, add NEW window with appropriate template
 *  selon stringId. Différents templates pour CHOOSE_MON vs DO_WHAT_WITH_MON
 *  (= widths différents pour ne pas overlap avec action menu). */
// ─── Rare Candy : learn move + évolution (1:1 party_menu.c:5047-5133) ────────

/** 1:1 dispatch commun Task_TryLearnNewMoves (:5057) / Task_TryLearningNextMove
 *  (:5079) : case 0 → PartyMenuTryEvolution ; MON_HAS_MAX_MOVES → DisplayMonNeeds
 *  ToReplaceMove ; default → DisplayMonLearnedMove. (MON_ALREADY_KNOWS_MOVE est
 *  géré par les phases appelantes — comportements distincts :5066/:5088.) */
function _dispatchLearnMoveResult(learnMove: number): void {
  if (learnMove === 0 /* MOVE_NONE */) { PartyMenuTryEvolution(); return; }
  if (learnMove === 0xFFFF /* MON_HAS_MAX_MOVES */) { DisplayMonNeedsToReplaceMove(); return; }
  DisplayMonLearnedMove(learnMove);
}

/** 1:1 `DisplayMonLearnedMove(taskId, move)` (party_menu.c:5124-5133) :
 *  gStringVar1=nickname, gStringVar2=gMoveNames[move], gText_PkmnLearnedMove3
 *  (« {mon} apprend {move}! ») → Task_DoLearnedMoveFanfareAfterText. */
function DisplayMonLearnedMove(move: number): void {
  const mon = _party()[_slotId];
  _itemUsedMsgText = _preparePartyMsg(getString('gText_PkmnLearnedMove3') || '',
    mon?.nickname ?? '', gMoveNames[move] ?? '');
  _phase = 'levelup_learned_fanfare';
  _drawMsg();
}

/** 1:1 `DisplayMonNeedsToReplaceMove(taskId)` (party_menu.c:5113-5122) — le
 *  message décomp COMPLET (3 pages `\p` gérées nativement par le printer : A
 *  avance chaque page avec le ▼), puis Task_ReplaceMoveYesNo (phase
 *  'levelup_replace_msg' : le YesNo s'affiche dès que le printer est inactif).
 *  `moveOverride` = gPartyMenu.data1 pour le ré-affichage après refus d'arrêt
 *  (.c:4941-4944) ; défaut = gMoveToLearn (:5116). */
function DisplayMonNeedsToReplaceMove(moveOverride?: number): void {
  const mon = _party()[_slotId];
  const move = moveOverride ?? gMoveToLearn;
  _itemUsedMsgText = _preparePartyMsg(getString('gText_PkmnNeedsToReplaceMove') || '',
    mon?.nickname ?? '', gMoveNames[move] ?? '');
  _learnMoveData1 = move;  // 1:1 :5120 gPartyMenu.data1 = gMoveToLearn
  _phase = 'levelup_replace_msg';  // = Task_ReplaceMoveYesNo (:4815)
  _drawMsg();
}

// ─── Flux replace-move complet (1:1 party_menu.c:4815-4953) — dette #8 soldée ──

/** 1:1 `Task_ShowSummaryScreenToForgetMove` (:4841-4848) + `CB2_ShowSummaryScreen
 *  ToForgetMove` (:4850-4853) : ferme le party (fade) puis ouvre le summary en
 *  mode SELECT_MOVE. Le CB2 transitoire est rappelé chaque frame tant que le
 *  summary (async) n'a pas pris la main → garde one-shot. */
function CB2_ShowSummaryScreenToForgetMove(): void {
  if (_showForgetSummaryPending) return;
  _showForgetSummaryPending = true;
  ShowSelectMovePokemonSummaryScreen(gPlayerParty, _learnMoveSlot,
    CalculatePlayerPartyCount() - 1, CB2_ReturnToPartyMenuWhileLearningMove,
    reverseDecompConstant(_learnMoveData1, 'MOVE_') ?? '');
}

/** 1:1 `CB2_ReturnToPartyMenuWhileLearningMove` (:4855-4858) :
 *  InitPartyMenu(FIELD, SINGLE, CHOOSE_MON, TRUE, PARTY_MSG_NONE,
 *  Task_ReturnToPartyMenuWhileLearningMove, gPartyMenu.exitCallback).
 *  Reopen pattern _reopenPartyMenuCore ; la continuation (dispatch selon
 *  GetMoveSlotToReplace) = phase 'learnmove_return', consommée après le fade. */
function CB2_ReturnToPartyMenuWhileLearningMove(): void {
  _showForgetSummaryPending = false;
  _pendingLearnMoveReturn = true;
  _slotId = _learnMoveSlot >= 0 ? _learnMoveSlot : 0;
  _menuType = PARTY_MENU_TYPE_FIELD;  // apprentissage CT/level-up = flux field
  _partyAction = PARTY_ACTION_CHOOSE_MON;
  const returnCb = _learnMoveReturnCb;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = returnCb ?? null;   // gPartyMenu.exitCallback restauré
    rt.SetMainCallback2(CB2_InitPartyMenu);
  }).catch((e) => { console.error('[party-screen] reopen learn-move failed', e); });
}

/** 1:1 `DisplayPartyMenuForgotMoveMessage` (:4871-4880) : gText_12PoofForgotMove
 *  (« 1, 2, et… Tadaa! \p X ne sait plus utiliser Y. \p Et…{PAUSE_UNTIL_PRESS} »)
 *  — texte COMPLET au printer (pauses/pages natives) ; à la fin →
 *  Task_PartyMenuReplaceMove (phase 'forgot_move_msg'). */
function DisplayPartyMenuForgotMoveMessage(): void {
  const mon = _party()[_slotId];
  const forgotten = mon?.moves?.[GetMoveSlotToReplace()] ?? 0;
  _itemUsedMsgText = _preparePartyMsg(getString('gText_12PoofForgotMove') || '',
    mon?.nickname ?? '', gMoveNames[forgotten] ?? '');
  _phase = 'forgot_move_msg';
  _drawMsg();
}

// NB : l'ex-helper `_taskPartyMenuReplaceMove` (corps de Task_PartyMenuReplaceMove
// sans le gate printer) a été fusionné dans `Task_PartyMenuReplaceMove` (LOT 5).

/** 1:1 `Task_LearnedMove` (:4769-4787) : `move[1]` = gPartyMenu.learnMoveState
 *  (champ adjacent à data1 dans la struct, cf. commentaire .c:4731) — si 0 =
 *  chemin CT/CS → AdjustFriendship(LEARN_TMHM) + RemoveBagItem(CT). Puis
 *  gText_PkmnLearnedMove3 + fanfare (mêmes phases que DisplayMonLearnedMove). */
function Task_LearnedMove(): void {
  if (_learnMoveState === 0) {
    // 1:1 :4775-4780 (chemin CT/CS = ItemUseCB_TMHM) :
    //   AdjustFriendship(mon, FRIENDSHIP_EVENT_LEARN_TMHM);
    //   if (item < ITEM_HM01) RemoveBagItem(item, 1);   // CT consommée, CS jamais
    const mon = _party()[_slotId];
    const item = (gSpecialVar.ItemId as number) | 0;   // gSpecialVar_ItemId
    if (mon) AdjustFriendship(mon, FRIENDSHIP_EVENT_LEARN_TMHM);
    // ⚠️ clé SAC move-named ("ITEM_TM_TOXIC") via GetBagItemKey — getItemKeyById
    // renverrait "ITEM_TM06" (enum) → RemoveBagItem no-op silencieux.
    if (item < ITEM_HM01) RemoveBagItem(GetBagItemKey(item), 1);
  }
  DisplayMonLearnedMove(_learnMoveData1);
}

// ─── ItemUseCB_TMHM (party_menu.c:4733-4767) + prérequis — 1:1 ───────────────

/** 1:1 décomp party_menu.c:163 — enum résultat de `CanMonLearnTMTutor`. */
const CANNOT_LEARN_MOVE = 1, ALREADY_KNOWS_MOVE = 2, CANNOT_LEARN_MOVE_IS_EGG = 3;

/** 1:1 STRICT décomp `static u8 CanMonLearnTMTutor(struct Pokemon *mon, u16 item,
 *  u8 tutor)` (party_menu.c:2033). Branche CT/CS (item >= ITEM_TM01) complète ;
 *  branche move-tutor (gTutorMoves/sTutorLearnsets) = mécanique distincte non
 *  portée, sans appelant câblé → garde-frontière fail-fast (jamais atteinte via
 *  ItemUseCB_TMHM : item toujours >= ITEM_TM01). */
function CanMonLearnTMTutor(mon: Pokemon, item: number, tutor: number): number {
  if (mon.isEgg) return CANNOT_LEARN_MOVE_IS_EGG;   // GetMonData(MON_DATA_IS_EGG)
  let move: number;
  if (item >= ITEM_TM01) {
    if (!CanMonLearnTMHM(mon, item - ITEM_TM01)) return CANNOT_LEARN_MOVE;
    move = resolveDecompConstant(ItemIdToBattleMoveId(item)) ?? 0;
  } else {
    void tutor;
    throw new Error('CanMonLearnTMTutor: branche move-tutor non portée (gTutorMoves)');
  }
  return MonKnowsMove(mon, move) ? ALREADY_KNOWS_MOVE : 0 /* CAN_LEARN_MOVE */;
}

/** 1:1 `DisplayLearnMoveMessageAndClose(taskId, str)` (:4725-4729) :
 *  DisplayLearnMoveMessage(str) (gStringVar1=nick, gStringVar2=move) puis
 *  `func = Task_ClosePartyMenuAfterText` (= phase 'item_used_msg' : ferme dès
 *  que le printer est inactif — le A qui lève {PAUSE_UNTIL_PRESS} est consommé
 *  par la pause elle-même). */
function _displayLearnMoveMessageAndClose(strKey: string, var1?: string, var2?: string): void {
  _itemUsedMsgText = _preparePartyMsg(getString(strKey) || '', var1, var2);
  _phase = 'item_used_msg';
  _drawMsg();
}

/** 1:1 `void ItemUseCB_TMHM(u8 taskId, TaskFunc task)` (party_menu.c:4733-4767) :
 *  ```c
 *  PlaySE(SE_SELECT);
 *  mon = &gPlayerParty[gPartyMenu.slotId];
 *  move = &gPartyMenu.data1;                       // move[1] = learnMoveState
 *  item = gSpecialVar_ItemId;
 *  GetMonNickname(mon, gStringVar1);
 *  move[0] = ItemIdToBattleMoveId(item);
 *  StringCopy(gStringVar2, gMoveNames[move[0]]);
 *  move[1] = 0;
 *  switch (CanMonLearnTMTutor(mon, item, 0)) {
 *  case CANNOT_LEARN_MOVE:  DisplayLearnMoveMessageAndClose(gText_PkmnCantLearnMove); return;
 *  case ALREADY_KNOWS_MOVE: DisplayLearnMoveMessageAndClose(gText_PkmnAlreadyKnows);  return;
 *  }
 *  if (GiveMoveToMon(mon, move[0]) != MON_HAS_MAX_MOVES) gTasks[taskId].func = Task_LearnedMove;
 *  else { DisplayLearnMoveMessage(gText_PkmnNeedsToReplaceMove); gTasks[taskId].func = Task_ReplaceMoveYesNo; }
 *  ```
 *  Réutilise la machinerie replace-move du level-up (dette #8) : phases
 *  'levelup_replace_msg' → YesNo → summary select-move → Task_PartyMenuReplaceMove
 *  → Task_LearnedMove (qui consomme la CT via learnMoveState==0). Le cas œuf
 *  (CANNOT_LEARN_MOVE_IS_EGG) est filtré en amont 1:1 (IsSelectedMonNotEgg,
 *  HandleChooseMonSelection :1310). Appelé via gItemUseCB (globalThis). */
export function ItemUseCB_TMHM(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void taskId; void _returnTask;
  PlaySE(5);                                          // 1:1 :4739 PlaySE(SE_SELECT)
  const mon = _party()[_slotId];                      // &gPlayerParty[gPartyMenu.slotId]
  if (!mon) return;                                   // (slot vide — jamais via USE_ITEM 1:1)
  const item = (gSpecialVar.ItemId as number) | 0;    // gSpecialVar_ItemId
  const move0 = resolveDecompConstant(ItemIdToBattleMoveId(item)) ?? 0;  // move[0]
  _learnMoveData1 = move0;                            // gPartyMenu.data1
  _learnMoveState = 0;                                // move[1] = 0 (chemin CT/CS)
  const nick = mon.nickname;                          // gStringVar1
  const moveName = gMoveNames[move0] ?? '';           // gStringVar2 = gMoveNames[move[0]]

  switch (CanMonLearnTMTutor(mon, item, 0)) {         // 1:1 :4748
    case CANNOT_LEARN_MOVE:
      _displayLearnMoveMessageAndClose('gText_PkmnCantLearnMove', nick, moveName);  // :4751
      return;
    case ALREADY_KNOWS_MOVE:
      _displayLearnMoveMessageAndClose('gText_PkmnAlreadyKnows', nick, moveName);   // :4754
      return;
  }

  if (GiveMoveToMon(mon, move0) !== MON_HAS_MAX_MOVES) {
    Task_LearnedMove();                               // 1:1 :4760 func = Task_LearnedMove
  } else {
    // 1:1 :4764-4765 DisplayLearnMoveMessage(gText_PkmnNeedsToReplaceMove) +
    // func = Task_ReplaceMoveYesNo (= DisplayMonNeedsToReplaceMove pose data1 +
    // la phase 'levelup_replace_msg').
    DisplayMonNeedsToReplaceMove(move0);
  }
}

/** 1:1 `ItemUseCB_EvolutionStone` (party_menu.c:5232) :
 *  ```c
 *  PlaySE(SE_SELECT);
 *  gCB2_AfterEvolution = gPartyMenu.exitCallback;
 *  if (ExecuteTableBasedItemEffect_(gPartyMenu.slotId, gSpecialVar_ItemId, 0)) {  // TRUE = aucun effet
 *      gPartyMenuUseExitCallback = FALSE;
 *      DisplayPartyMenuMessage(gText_WontHaveEffect, TRUE);
 *      ScheduleBgCopyTilemapToVram(2);
 *      gTasks[taskId].func = task;
 *  } else {  // effet appliqué → PokemonUseItemEffects a démarré BeginEvolutionScene
 *      RemoveBagItem(gSpecialVar_ItemId, 1);
 *      FreePartyPointers();
 *  }
 *  ```
 *  ExecuteTableBasedItemEffect_ = PokemonUseItemEffects(mon, item, slotId, 0, FALSE).
 *  Le case ITEM4_EVO_STONE (bag-item-effects.ts:616) appelle GetEvolutionTargetSpecies
 *  (EVO_MODE_ITEM_USE) + BeginEvolutionScene → gCB2_AfterEvolution DOIT être posé AVANT
 *  l'effet (lu en fin de scène). Porté ICI (party_menu.c home) + re-export item_use.ts
 *  (comme ItemUseCB_TMHM). Teardown success = mirror PartyMenuTryEvolution (level-up). */
export function ItemUseCB_EvolutionStone(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void taskId; void _returnTask;
  const rt = getRuntime();
  PlaySE(5);                                          // 1:1 :5234 PlaySE(SE_SELECT)
  const mon = _party()[_slotId];                      // &gPlayerParty[gPartyMenu.slotId]
  if (!mon) return;
  const item = (gSpecialVar.ItemId as number) | 0;    // gSpecialVar_ItemId
  // 1:1 :5235 gCB2_AfterEvolution = gPartyMenu.exitCallback (posé AVANT l'effet :
  // PokemonUseItemEffects case EVO_STONE appelle BeginEvolutionScene qui le lit).
  const exitCb = rt.gMain.savedCallback as (() => void) | null;
  SetCB2AfterEvolution(exitCb ?? null);
  // 1:1 :5236 ExecuteTableBasedItemEffect_ = PokemonUseItemEffects(mon, item, slotId, 0, FALSE).
  const result = PokemonUseItemEffects(mon, item, _slotId, 0, false);
  if (result.cannotUse) {                             // 1:1 TRUE = aucun effet
    // 1:1 :5238-5241 DisplayPartyMenuMessage(gText_WontHaveEffect, TRUE) → reste dans le menu.
    ShowPartyMenuItemMessage(_preparePartyMsg(getString('gText_WontHaveEffect') || ''));
  } else {
    // 1:1 :5245-5246 : la scène a démarré (BeginEvolutionScene dans PokemonUseItemEffects).
    RemoveBagItem(GetBagItemKey(item), 1);            // 1:1 RemoveBagItem(item, 1)
    // 1:1 FreePartyPointers : teardown module party (= PartyMenuTryEvolution level-up).
    if (_inputTaskId >= 0) { rt.DestroyTask(_inputTaskId); _inputTaskId = -1; }
    _freePartyMenu();
    _isOpen = false;
    _phase = 'idle';
  }
}

/** 1:1 `StopLearningMovePrompt` (:4897-4904) : « Arrêter d'enseigner {move}? »
 *  puis `Task_StopLearningMoveYesNo` (:4906-4913) attend la fin du printer
 *  avant de poser le YesNo (phase 'stop_learning_msg' → 'stop_learning_yesno'). */
function StopLearningMovePrompt(): void {
  _itemUsedMsgText = _preparePartyMsg(getString('gText_StopLearningMove2') || '',
    undefined, gMoveNames[_learnMoveData1] ?? '');
  _phase = 'stop_learning_msg';
  _drawMsg();
}

/** 1:1 `PartyMenuTryEvolution(taskId)` (party_menu.c:5095-5111) :
 *  ```c
 *  u16 targetSpecies = GetEvolutionTargetSpecies(mon, EVO_MODE_NORMAL, ITEM_NONE);
 *  if (targetSpecies != SPECIES_NONE) {
 *      FreePartyPointers();
 *      gCB2_AfterEvolution = gPartyMenu.exitCallback;  // = notre gMain.savedCallback
 *      BeginEvolutionScene(mon, targetSpecies, TRUE, gPartyMenu.slotId);
 *      DestroyTask(taskId);
 *  } else {
 *      gTasks[taskId].func = Task_ClosePartyMenuAfterText;
 *  }
 *  ```
 *  ≙ FreePartyPointers+DestroyTask : libère l'état module party (fenêtres/OAM
 *  disparaissent pendant le fade de Task_BeginEvolutionScene — la scène ré-init
 *  ensuite TOUT le vidéo : ResetSpriteData/ResetTasks/battleInitVideo). */
function PartyMenuTryEvolution(): void {
  const rt = getRuntime();
  const mon = _party()[_slotId];
  const targetSpecies = mon ? GetEvolutionTargetSpecies(mon, 0 /* EVO_MODE_NORMAL */, 0 /* ITEM_NONE */) : 0;
  if (targetSpecies !== 0 /* SPECIES_NONE */ && mon) {
    if (_inputTaskId >= 0) { rt.DestroyTask(_inputTaskId); _inputTaskId = -1; }
    const exitCb = rt.gMain.savedCallback as (() => void) | null;  // 1:1 gPartyMenu.exitCallback
    _freePartyMenu();
    _isOpen = false;
    _phase = 'idle';
    SetCB2AfterEvolution(exitCb ?? null);
    BeginEvolutionScene(mon, targetSpecies, true, _slotId);
  } else {
    ClosePartyScreen();  // 1:1 Task_ClosePartyMenuAfterText
  }
}

function _drawMsg(): void {
  // 1:1 décomp `if (*windowPtr != WINDOW_NONE) PartyMenuRemoveWindow(windowPtr);`
  // PartyMenuRemoveWindow → ClearStdWindowAndFrameToTransparent + RemoveWindow.
  // Sans clear, le frame border + texte précédent restent visibles en VRAM.
  if (_msgWid >= 0) {
    ClearStdWindowAndFrame(_msgWid, false);
    CopyWindowToVram(_msgWid, 3);
    RemoveWindow(_msgWid);
    _msgWid = -1;
  }
  // 1:1 décomp ShouldUseChooseMonText : count alive mons.
  const party = _party();
  let numAlive = 0;
  for (const m of party) {
    if (m && m.hp > 0) numAlive++;
    if (numAlive > 1) break;
  }
  const useChooseMon = numAlive > 1;
  // 1:1 décomp switch sur stringId : DO_WHAT_WITH_MON ou CHOOSE_MON.
  let msg: string;
  let template: WindowTemplate;
  if (_phase === 'action_menu') {
    // 1:1 décomp : le sous-menu objet (CursorCb_Item → ACTIONS_ITEM) affiche
    // PARTY_MSG_DO_WHAT_WITH_ITEM ("Que faire avec un objet?") ; sinon le menu
    // d'action mon affiche PARTY_MSG_DO_WHAT_WITH_MON ("Que faire avec ce PKMN?").
    msg = getString(_actionSubMenu === 'item' ? 'gText_DoWhatWithItem' : 'gText_DoWhatWithPokemon');
    template = DO_WHAT_WITH_MON_WINDOW_TEMPLATE;
  } else if (_partyAction === PARTY_ACTION_SWITCH) {
    // 1:1 décomp DisplayPartyMenuStdMessage(PARTY_MSG_MOVE_TO_WHERE)
    // (party_menu.c:2803 ; party_menu.h:603 → gText_MoveToWhere ;
    //  strings.c:431 = "Le mettre où?"). Même famille fenêtre que CHOOSE_MON.
    msg = getString('gText_MoveToWhere');
    template = MSG_WINDOW_TEMPLATE;
  } else if ((_phase === 'item_used_msg' || _phase === 'levelup_pg1'
      || _phase === 'levelup_pg2' || _phase === 'levelup_learn'
      || _phase === 'levelup_learn_next' || _phase === 'levelup_learned_fanfare'
      || _phase === 'levelup_learned_msg' || _phase === 'levelup_replace_msg'
      || _phase === 'replace_yesno' || _phase === 'which_move_msg'
      || _phase === 'forgot_move_msg' || _phase === 'stop_learning_msg'
      || _phase === 'stop_learning_yesno' || _phase === 'move_not_learned_msg'
      || _phase === 'field_move_err' || _phase === 'field_move_cancel' || _phase === 'softboiled_msg'
      || _phase === 'fieldmove_yesno' || _phase === 'helditem_msg'
      || _phase === 'switch_items_yesno') && _itemUsedMsgText) {
    // 1:1 décomp DisplayPartyMenuMessage → PrintMessage(text) (party_menu.c:
    // 1706/2566) — utilise WIN_MSG = sSinglePartyMenuWindowTemplate[6]
    // (party_menu.h:180-187) = 28×4 tiles (= 2 lignes FONT_NORMAL). C'est
    // PAS la window CHOOSE_MON (= 21×2). Le `\n` du décomp FR pour
    // gText_PkmnHPRestoredByVar2 prend la 2e ligne. Les phases levelup_*
    // gardent ce même message ("X est promu au N.Y") affiché sous la box.
    msg = _itemUsedMsgText;
    template = ITEM_USED_MSG_WINDOW_TEMPLATE;
  } else if (_partyAction === PARTY_ACTION_GIVE_ITEM) {
    // 1:1 décomp DisplayPartyMenuStdMessage(PARTY_MSG_GIVE_TO_WHICH_MON)
    // (party_menu.c:5362 ; gText_GiveToWhichPokemon = "Donner à quel POKéMON?").
    // Famille fenêtre CHOOSE_MON (= give-from-bag, #12).
    msg = getString('gText_GiveToWhichPokemon');
    template = MSG_WINDOW_TEMPLATE;
  } else if (_partyAction === PARTY_ACTION_USE_ITEM || _partyAction === PARTY_ACTION_SOFTBOILED) {
    // 1:1 décomp CB2_ShowPartyMenuForItemUse (party_menu.c:4264-4269) :
    //   GetPocketByItemId(item) == POCKET_TM_HM → PARTY_MSG_TEACH_WHICH_MON
    //   ("Enseigner à quel POKéMON?") ; sinon PARTY_MSG_USE_ON_WHICH_MON
    //   ("Utiliser sur quel POKéMON?"). Famille fenêtre CHOOSE_MON.
    // SOFTBOILED (Soin/E-Coque) : choix du receveur du transfert PV.
    msg = (_partyAction === PARTY_ACTION_USE_ITEM
        && GetItemPocket((gSpecialVar.ItemId as number) | 0) === 'POCKET_TM_HM')
      ? getString('gText_TeachWhichPokemon')
      : getString('gText_UseOnWhichPokemon');
    template = MSG_WINDOW_TEMPLATE;
  } else if (_menuType === PARTY_MENU_TYPE_DAYCARE) {
    // 1:1 décomp ChooseMonForDaycare (party_menu.c:6199) : PARTY_MSG_CHOOSE_MON_2
    // = gText_ChoosePokemon2 (« Choisir un POKéMON. » — variante statique, sans le
    // switch ShouldUseChooseMonText de PARTY_MSG_CHOOSE_MON). Aussi ré-affichée par
    // CursorCb_Cancel1 en mode daycare (party_menu.c:3067-3070).
    msg = getString('gText_ChoosePokemon2');
    template = MSG_WINDOW_TEMPLATE;
  } else {
    msg = useChooseMon ? getString('gText_ChoosePokemon') : getString('gText_ChoosePokemonCancel');
    template = MSG_WINDOW_TEMPLATE;
  }
  _msgWid = AddWindow(template);
  // 1:1 décomp `DrawStdFrameWithCustomTileAndPalette(*windowPtr, FALSE, 0x4F, 13)`.
  DrawStdFrameWithCustomTileAndPalette(_msgWid, false, 0x4F, 13);
  // 1:1 décomp : les messages « Impossible ici. » / « Déjà en train de surfer. » etc.
  // (phase 'field_move_cancel') passent par DisplayPartyMenuStdMessage (party_menu.c:
  // 2459-2501, AddTextPrinterParameterized speed=0) → INSTANTANÉS, PAS par le printer
  // animé DisplayPartyMenuMessage. (Le badge-missing 'field_move_err' reste animé =
  // DisplayPartyMenuMessage(..., TRUE) avec {PAUSE_UNTIL_PRESS}.)
  if (_phase === 'field_move_cancel') {
    AddTextPrinterParameterized3(_msgWid, FONT_NORMAL, 0, 1, [1, 2, 3], TEXT_SKIP_DRAW, msg);
  } else if (template === ITEM_USED_MSG_WINDOW_TEMPLATE && _itemUsedMsgText) {
    // 1:1 décomp `PrintMessage` (party_menu.c:2566-2571) — les MESSAGES D'ACTION
    // (level-up/learn/replace/item-used) défilent à la vitesse joueur avec A/B
    // speed-up + ▼ sur les pauses (le printer gère \p/{PAUSE_UNTIL_PRESS}
    // nativement). Tick = RunTextPrinters global (runOneFrame ; le décomp tick
    // via Task_PrintAndWaitForText → RunTextPrintersRetIsActive, même cadence).
    // 🐛 fix 2026-07-02 (verdict A/B « textes instantanés + ▼ manquants ») :
    // avant, TOUT passait en TEXT_SKIP_DRAW.
    gTextFlags.canABSpeedUpPrint = true;   // 1:1 :2569
    gTextFlags.useAlternateDownArrow = false;
    AddTextPrinterParameterized2(_msgWid, FONT_NORMAL, msg, GetPlayerTextSpeedDelay(), null,
      2 /* TEXT_COLOR_DARK_GRAY */, 1 /* TEXT_COLOR_WHITE */, 3 /* TEXT_COLOR_LIGHT_GRAY */);
  } else {
    // 1:1 décomp `DisplayPartyMenuStdMessage` (party_menu.c:2459-2501) — les
    // PROMPTS statiques (« Choisir un POKéMON », « Utiliser sur quel POKéMON? »)
    // s'affichent d'un bloc sur ROM aussi (AddTextPrinterParameterized speed=0).
    AddTextPrinterParameterized3(_msgWid, FONT_NORMAL, 0, 1, [1, 2, 3], TEXT_SKIP_DRAW, msg);
  }
  CopyWindowToVram(_msgWid, 3);
}

/** 1:1 décomp `IsPartyMenuTextPrinterActive` (party_menu.c:1731) =
 *  FuncIsActiveTask(Task_PrintAndWaitForText). Adaptation : notre tick est
 *  global (runOneFrame) — la task .c ne sert qu'à ticker + fermer la fenêtre
 *  (le clear est géré par le _drawMsg suivant) → équivalent = printer WIN_MSG
 *  actif. */
function _isPartyMenuTextPrinterActive(): boolean {
  return _msgWid >= 0 && IsTextPrinterActive(_msgWid);
}

/** Prépare un texte message party pour le PRINTER (≠ l'ancien strip intégral) :
 *  garde \p/\l/\n (prompts natifs) + {PAUSE_UNTIL_PRESS}/{PAUSE n}/{WAIT_SE}
 *  + {PLAY_SE X}/{PLAY_BGM X} (l'encodeur `encodeStringForFont` émet le control
 *  code + u16 LE, le renderer joue le SE/BGM — dette encodeur soldée), expanse
 *  uniquement STR_VAR_1/2 (= StringExpandPlaceholders). */
function _preparePartyMsg(raw: string, var1?: string, var2?: string): string {
  return raw
    .replace(/\{STR_VAR_1\}/g, var1 ?? '')
    .replace(/\{STR_VAR_2\}/g, var2 ?? '');
}

/** 1:1 décomp `CreatePartyMonPokeballSprite(mon, menuBox)` (party_menu.c:4122) :
 *  si species != SPECIES_NONE → menuBox->pokeballSpriteId = CreateSprite(
 *  &sSpriteTemplate_MenuPokeball, spriteCoords[6], spriteCoords[7], 8).
 *  Mini-pokeball OAM 32×32 ; réutilise tiles + palette du SORTIR pokeball
 *  (= sSpriteTemplate_MenuPokeball, TAG_POKEBALL shared). */
function CreatePartyMonPokeballSprite(slot: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const mon = _slotMon(slot);
  if (!mon) return;
  const POKEBALL_TILE_BASE = 256;
  const [x, y] = POKEBALL_COORDS[slot];
  const spr = rt.CreateSpriteAtOam({
    x, y,
    shape: 0, size: 2,  // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32)
    tileId: POKEBALL_TILE_BASE,  // frame 0 (Closed)
    paletteBank: _pokeballPalSlot,
    // 1:1 décomp CreatePartyMonPokeballSprite uses default OAM priority=1
    // (= sSpriteTemplate_MenuPokeball template) + subpriority=8 from
    // CreateSprite(..., x, y, 8) arg. Icon subpriority=1 → icon RENDU
    // EN FRONT du pokeball (= ROM behavior, mini-pokeball partly behind icon).
    priority: 1,
    subpriority: 8,
  });
  _pokeballOamBySlot[slot] = spr.spriteId;
}

/** ÉCART port : le décomp crée les 4 sprites d'un slot ensemble (CreatePartyMon
 *  Sprites :1058, driver CreatePartyMonSpritesLoop) ; le port groupe par TYPE
 *  pour charger le gfx async par type. Ce driver appelle CreatePartyMonPokeball
 *  Sprite pour chaque slot. */
function _spawnSlotPokeballOams(): void {
  _pokeballOamBySlot = [-1, -1, -1, -1, -1, -1];
  for (let i = 0; i < 6; i++) CreatePartyMonPokeballSprite(i);
}

/** Load pokeball tiles + palette à OBJ VRAM (= shared par SORTIR + slot pokeballs). */
async function _loadPokeballGfx(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  const tiles = await loadTileBin('/decomp/em/party_menu/pokeball.png', 4);
  const pal = await loadGbaPal('/decomp/em/party_menu/pokeball.gbapal');
  const POKEBALL_TILE_BASE = 256;
  rt.gba.objVram.set(tiles.slice(0, 32 * 32), POKEBALL_TILE_BASE * 32);
  // 1:1 STRICT bitmap allocator sync : mark tiles allocated (= sinon AllocSpriteTiles
  // peut les re-attribuer à un autre sheet → écrasement visuel).
  MarkObjTilesAllocated(POKEBALL_TILE_BASE * 32, 32 * 32);
  // 1:1 STRICT décomp `LoadSpritePalette` : slot dynamiquement alloué.
  _pokeballPalSlot = LoadSpritePalette({ data: pal, tag: TAG_POKEBALL_PAL });
}

/** 1:1 décomp `LoadPartyMenuAilmentGfx` (party_menu.c:4223) : charge
 *  `gStatusGfx_Icons`/`gStatusPal_Icons` (= status_icons.png, 32 tiles).
 *  Même asset que l'écran résumé (`_createSetStatusSprite`). */
async function _loadStatusIconsGfx(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  const st = await rt.LoadCompressedSpriteSheet('/decomp/em/ui/interface/status_icons.png', PARTY_STATUS_TILE_BASE * 32);
  _partyStatusPalSlot = LoadSpritePalette({ data: st.palette, tag: TAG_PARTY_STATUS_PAL });
}

/** 1:1 décomp `CreatePartyMonStatusSprite(mon, menuBox)` (party_menu.c:4184) :
 *  si species != SPECIES_NONE → menuBox->statusSpriteId = CreateSprite(
 *  &sSpriteTemplate_StatusIcons, spriteCoords[4], spriteCoords[5], 0) +
 *  SetPartyMonAilmentGfx. sOamData_StatusCondition = 32×8 (shape1 size1).
 *  ÉCART port : créé invisible ; visibilité/frame via le refresh séparé
 *  `_updatePartyMonAilmentGfx` (= SetPartyMonAilmentGfx→UpdatePartyMonAilmentGfx). */
function CreatePartyMonStatusSprite(slot: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const mon = _slotMon(slot);
  if (!mon) return;
  const [x, y] = STATUS_COORDS[slot];
  const spr = rt.CreateSpriteAtOam({
    x, y,
    shape: 1, size: 1,                       // sOamData_StatusCondition 32×8
    tileId: PARTY_STATUS_TILE_BASE,
    paletteBank: _partyStatusPalSlot,
    priority: 1, subpriority: 0,
  });
  _statusOamBySlot[slot] = spr.spriteId;
  rt.setSpriteInvisible(spr.spriteId, true); // 1:1 défaut : caché tant que pas d'ailment
}

/** ÉCART port : driver par TYPE (cf. CreatePartyMonPokeballSprite) — appelle
 *  CreatePartyMonStatusSprite pour chaque slot. */
function _spawnStatusOams(): void {
  _statusOamBySlot = [-1, -1, -1, -1, -1, -1];
  for (let i = 0; i < 6; i++) CreatePartyMonStatusSprite(i);
}

/** 1:1 décomp `GetMonAilment` (party_menu.c:1924-1936) → AILMENT_* :
 *    HP==0 → AILMENT_FNT(7)  (:1928, PRIORITAIRE)
 *    status → PSN/TOX=1, PAR=2, SLP=3, FRZ=4, BRN=5
 *    pokérus → AILMENT_PKRS(6)  (non modélisé chez nous → NONE, honnête)
 *    sinon AILMENT_NONE(0). */
/** Mon natif du slot s'il est OCCUPÉ (species != SPECIES_NONE), sinon undefined
 *  — 1:1 décomp (iterate PARTY_SIZE + check MON_DATA_SPECIES). Mimique le null
 *  des anciennes vues pour préserver les gardes `if (!mon)`. */
function _slotMon(i: number): Pokemon | undefined {
  const m = gPlayerParty[i];
  return (m && m.species !== 0) ? m : undefined;
}
/** Array party 6 slots : Pokemon natif si occupé, sinon undefined (= vues). */
function _party(): (Pokemon | undefined)[] {
  return gPlayerParty.map((m) => (m && m.species !== 0 ? m : undefined));
}

function _ailmentFromStatus(mon: Pokemon | undefined): number {
  if (!mon) return 0;
  if (mon.hp === 0) return 7;                    // 1:1 :1928 AILMENT_FNT
  // 1:1 décomp GetAilmentFromStatus (party_menu.c) : status1 bitfield → AILMENT_*.
  const st = mon.status >>> 0;
  const S = (n: string): number => resolveDecompConstant(n) ?? 0;
  if (st & (S('STATUS1_POISON') | S('STATUS1_TOXIC_POISON'))) return 1;
  if (st & S('STATUS1_PARALYSIS')) return 2;
  if (st & S('STATUS1_SLEEP')) return 3;
  if (st & S('STATUS1_FREEZE')) return 4;
  if (st & S('STATUS1_BURN')) return 5;
  return 0;                                     // 1:1 :1930-1935 (pokérus n/a → NONE)
}

// Debug-only (P3) : dump des slots party (vérif déterministe de la migration
// ids purs : comptage via CalculatePlayerPartyCount + lecture gPlayerParty natif).
(globalThis as Record<string, unknown>).__partyDebugDump = () => ({
  count: CalculatePlayerPartyCount(),
  slots: _party().map((m, i) => (m
    ? { slot: i, species: m.species, hp: `${m.hp}/${m.maxHP}`, lvl: m.level, ail: _ailmentFromStatus(m), egg: !!m.isEgg, item: m.heldItem }
    : null)),
});

/** 1:1 décomp `SetPartyMonAilmentGfx`→`UpdatePartyMonAilmentGfx`
 *  (party_menu.c:4203-4221) : AILMENT_NONE/PKRS → sprite invisible ;
 *  sinon `StartSpriteAnim(sprite, ailment-1)` (frame (ailment-1)*4) +
 *  visible. Statut slot-pinned (dérivé de gSaveBlock1Ptr.playerParty[slot].status). */
function _updatePartyMonAilmentGfx(slot: number): void {
  const rt = getRuntime();
  const id = _statusOamBySlot[slot];
  if (!rt || id === undefined || id < 0) return;
  const spr = rt.gSprites[id];
  if (!spr) return;
  const mon = _slotMon(slot);
  const ailment = _ailmentFromStatus(mon);
  if (ailment === 0 || ailment === 6) {         // 1:1 :4212-4213 AILMENT_NONE/PKRS → invisible
    rt.setSpriteInvisible(id, true);
    return;
  }
  // 1:1 :4217 StartSpriteAnim(sprite, ailment-1) → frame (ailment-1)*4
  // (PSN0/PAR4/SLP8/FRZ12/BRN16/FNT24 ; ailment FNT=7 → (7-1)*4=24).
  const oam = rt.gba.oam[spr.oamIndex];
  if (oam) oam.tileId = PARTY_STATUS_TILE_BASE + (ailment - 1) * 4;
  rt.setSpriteInvisible(id, false);
}

/** 1:1 décomp `LoadHeldItemIcons` (party_menu.c:4061) : hold_icons.png
 *  (2 tiles 8×8 : frame0=item, frame1=mail). */
async function _loadHeldItemGfx(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  const tiles = await loadTileBin('/decomp/em/party_menu/hold_icons.png', 4);
  const pal = await loadGbaPal('/decomp/em/party_menu/hold_icons.gbapal');
  rt.gba.objVram.set(tiles.slice(0, 2 * 32), PARTY_HELDITEM_TILE_BASE * 32);
  // 1:1 STRICT bitmap allocator sync.
  MarkObjTilesAllocated(PARTY_HELDITEM_TILE_BASE * 32, 2 * 32);
  _partyHeldItemPalSlot = LoadSpritePalette({ data: pal, tag: TAG_PARTY_HELDITEM_PAL });
}

/** 1:1 décomp `CreatePartyMonHeldItemSprite(mon, menuBox)` (party_menu.c:4021) :
 *  si species != SPECIES_NONE → menuBox->itemSpriteId = CreateSprite(
 *  &sSpriteTemplate_HeldItem, spriteCoords[2], spriteCoords[3], 0) +
 *  UpdatePartyMonHeldItemSprite. 8×8 sOamData_HeldItem priority=1. ÉCART port :
 *  créé invisible ; frame/visibilité via le refresh séparé `_updatePartyMonHeldItem`. */
function CreatePartyMonHeldItemSprite(slot: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const mon = _slotMon(slot);
  if (!mon) return;
  const [x, y] = ITEM_COORDS[slot];
  const spr = rt.CreateSpriteAtOam({
    x, y,
    shape: 0, size: 0,                       // sOamData_HeldItem 8×8
    tileId: PARTY_HELDITEM_TILE_BASE,
    paletteBank: _partyHeldItemPalSlot,
    priority: 1, subpriority: 0,
  });
  _itemOamBySlot[slot] = spr.spriteId;
  rt.setSpriteInvisible(spr.spriteId, true);
}

/** ÉCART port : driver par TYPE (cf. CreatePartyMonPokeballSprite) — appelle
 *  CreatePartyMonHeldItemSprite pour chaque slot. */
function _spawnHeldItemOams(): void {
  _itemOamBySlot = [-1, -1, -1, -1, -1, -1];
  for (let i = 0; i < 6; i++) CreatePartyMonHeldItemSprite(i);
}

/** 1:1 décomp `UpdatePartyMonHeldItemSprite`→`ShowOrHideHeldItemSprite`
 *  (party_menu.c:4040-4059) : ITEM_NONE → invisible ; sinon ItemIsMail →
 *  StartSpriteAnim(1) (tile+1), sinon StartSpriteAnim(0) (tile+0) + visible.
 *  (Mail non modélisé chez nous → toujours frame0 item, honnête 1:1.) */
function _updatePartyMonHeldItem(slot: number): void {
  const rt = getRuntime();
  const id = _itemOamBySlot[slot];
  if (!rt || id === undefined || id < 0) return;
  const spr = rt.gSprites[id];
  if (!spr) return;
  const mon = _slotMon(slot);
  const item = mon?.heldItem;
  if (!item) {                                   // ITEM_NONE → invisible
    rt.setSpriteInvisible(id, true);
    return;
  }
  const oam = rt.gba.oam[spr.oamIndex];
  if (oam) oam.tileId = PARTY_HELDITEM_TILE_BASE; // frame0 = item (mail n/a → 0)
  rt.setSpriteInvisible(id, false);
}

/** Spawn the "SORTIR" cancel button OAM (= big pokeball with text gravé)
 *  1:1 décomp `CreatePokeballButtonSprite(198, 148)` (party_menu.c:4138)
 *  → sprite 32×32 sSpriteTemplate_MenuPokeball, priority=2. */
async function _spawnCancelButtonOam(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  try {
    await _loadPokeballGfx();
    const POKEBALL_TILE_BASE = 256;
    // 1:1 décomp `CreateSprite(template, 198, 148, 8)` puis
    // `gSprites[spriteId].oam.priority = 2` (party_menu.c:4142).
    const spr = rt.CreateSpriteAtOam({
      x: 198, y: 148,
      shape: 0, size: 2,  // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32)
      tileId: POKEBALL_TILE_BASE,
      paletteBank: _pokeballPalSlot,
      priority: 2,
    });
    _cancelButtonOamId = spr.spriteId;
  } catch (e) {
    console.warn('[party-screen] cancel button load failed:', e);
  }
}

/** 1:1 décomp `CreatePartyMonIconSprite(mon, menuBox, slot)` (party_menu.c:3937) :
 *  species2 = MON_DATA_SPECIES_OR_EGG → SPECIES_EGG si œuf → gMonIconTable[
 *  SPECIES_EGG] = icône d'ŒUF (pas l'icône de l'espèce dedans). ÉCART port :
 *  ASYNC (charge icon.png + la palette d'icône du slot à la volée) et applique
 *  l'état d'anim initial ICI (reset + UpdateMonIconFrame + décalage sélection),
 *  car le spawn peut finir APRÈS le case 14 AnimatePartySlot. */
async function CreatePartyMonIconSprite(slot: number): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  const mon = _slotMon(slot);
  if (!mon) return;
  const speciesEnum = reverseDecompConstant(mon.species, 'SPECIES_') ?? 'SPECIES_NONE';
  const dexId = mon.isEgg ? 'egg' : speciesEnum.replace(/^SPECIES_/, '').toLowerCase();
  const iconPalSpecies = mon.isEgg ? 'SPECIES_EGG' : speciesEnum;
  try {
    const iconPng = await loadIndexedPngStrict(`/decomp/em/pokemon/${dexId}/icon.png`, 4);
    // 1:1 décomp pokemon_icon.png = 32×64 sheet vertical stack de 2 anim frames
    // 32×32. Une frame = 4×4 tiles = 16 tiles = 512 bytes 4bpp.
    // Charge LES DEUX frames (= 32 tiles = 1024 bytes) pour idle anim toggle.
    const BYTES_PER_FRAME = ICON_TILES_PER_FRAME * 32;  // 512
    const BYTES_PER_SLOT  = ICON_TILES_PER_SLOT  * 32;  // 1024
    const slotTileBase = ICON_OBJ_TILE_OFFSET / 32 + slot * ICON_TILES_PER_SLOT;
    const slotByteOffset = slotTileBase * 32;
    // Frames stockées contiguës : tiles [slotTileBase..+15] = frame 0,
    //   [slotTileBase+16..+31] = frame 1.
    rt.gba.objVram.set(iconPng.charData.slice(0, BYTES_PER_SLOT), slotByteOffset);
    // 1:1 STRICT bitmap allocator sync : mark icon tiles allocated.
    MarkObjTilesAllocated(slotByteOffset, BYTES_PER_SLOT);
    void BYTES_PER_FRAME;
    // 1:1 décomp `LoadMonIconPalette(species)` : lookup gMonIconPaletteIndices
    // pour obtenir l'index 0/1/2, puis load `gMonIconPalettes[index]` (= un
    // de 3 palettes shared between species). Pas normal.pal (= front sprite
    // palette, DIFFERENT from icon palette).
    const palIdx = MON_ICON_PALETTE_INDICES[iconPalSpecies] ?? 0;
    const iconPal = await loadGbaPal(`/decomp/em/pokemon/icon_palettes/icon_palette_${palIdx}.pal`);
    const palBank = ICON_OBJ_PAL_BASE + slot;
    rt.LoadPaletteObj(iconPal, OBJ_PLTT_ID(palBank));
    // 1:1 décomp `CreateMonIconSprite(template, x, y, ...)` (= sprite center
    // coords in pixels). Notre `CreateSpriteAtOam` engine applique
    // CalcCenterToCornerVec INTERNE via le sprite.centerToCornerVec stocké
    // au create. Passer les coords DÉCOMP direct (= sprite center).
    const [x, y] = ICON_COORDS[slot];
    const oamY = y;
    const spr = rt.CreateSpriteAtOam({
      x, y,
      shape: 0, size: 2,  // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32)
      tileId: slotTileBase,
      paletteBank: palBank,
      // 1:1 décomp `CreatePartyMonIconSpriteParameterized(..., priority=1)`
      // + CreateMonIcon subpriority=1 → icon EN FRONT du pokeball
      // (subpriority=8). Lower subpriority = front in OAM rendering.
      priority: 1,
      subpriority: 1,
    });
    _iconOamBySlot[slot] = spr.spriteId;
    _iconBaseY[slot] = oamY;
    // 1:1 décomp : CreateMonIconSprite appelle UpdateMonIconFrame une fois
    // (pokemon_icon.c:1046 → pose frame 0, delay 6, animCmdIndex 1) PUIS la
    // CB2 init fait AnimatePartySlot(slot, 0/1). Comme notre spawn est async
    // (il peut finir APRÈS le case 14), on applique l'état initial ICI : reset
    // anim + frame 0 + décalage sélection/désélection sur le bon slot.
    _iconAnimDelay[slot] = 0; _iconAnimCmdIdx[slot] = 0; _iconAnimNum[slot] = 0;
    _updateMonIconFrame(slot);
    _animateSelectedPartyIcon(slot, slot === _slotId ? 1 : 0);
  } catch (e) {
    console.warn(`[party-screen] icon load failed for ${dexId}:`, e);
  }
}

/** ÉCART port : driver par TYPE (cf. CreatePartyMonPokeballSprite) — appelle
 *  CreatePartyMonIconSprite (async, séquentiel) pour chaque slot. */
async function _spawnIconOams(): Promise<void> {
  _iconOamBySlot = [-1, -1, -1, -1, -1, -1];
  _iconBaseY = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 6; i++) await CreatePartyMonIconSprite(i);
}

function _freePartyMenu(): void {
  const rt = getRuntime();
  // 1:1 fix : libérer les banks de palette OBJ réservés pour les icônes (cf. case 13)
  // → l'allocateur pourra les réutiliser pour le prochain écran.
  for (let b = 0; b < 6; b++) FreeSpritePaletteByTag(TAG_ICON_PAL_RESERVE + b);
  const freeOam = (id: number) => {
    if (!rt || id < 0) return;
    const spr = rt.gSprites[id];
    if (spr) { spr.inUse = false; const oam = rt.gba.oam[spr.oamIndex]; if (oam) oam.visible = false; }
    rt.gSprites[id] = undefined;
  };
  for (const id of _iconOamBySlot) freeOam(id);
  _iconOamBySlot = [-1, -1, -1, -1, -1, -1];
  _iconBaseY = [0, 0, 0, 0, 0, 0];
  for (const id of _pokeballOamBySlot) freeOam(id);
  _pokeballOamBySlot = [-1, -1, -1, -1, -1, -1];
  for (const id of _statusOamBySlot) freeOam(id);
  _statusOamBySlot = [-1, -1, -1, -1, -1, -1];
  for (const id of _itemOamBySlot) freeOam(id);
  _itemOamBySlot = [-1, -1, -1, -1, -1, -1];
  freeOam(_cancelButtonOamId);
  _cancelButtonOamId = -1;
  if (rt && _bounceTaskId >= 0) {
    rt.DestroyTask(_bounceTaskId);
    _bounceTaskId = -1;
  }
  for (const wid of _slotWindowIds) if (wid >= 0) RemoveWindow(wid);
  _slotWindowIds = [];
  if (_msgWid >= 0) { RemoveWindow(_msgWid); _msgWid = -1; }
  if (_cancelButtonWid >= 0) { RemoveWindow(_cancelButtonWid); _cancelButtonWid = -1; }
  if (_actionWindowId >= 0) { RemoveWindow(_actionWindowId); _actionWindowId = -1; }
  _actionList = [];
  _actionCursor = 0;
  _isOpen = false;
  _phase = 'idle';
  // 1:1 : le décomp NE reset PAS gPartyMenu.slotId au teardown — les specials
  // pension le lisent APRÈS la fermeture (GetCursorSelectionMonId). On capture
  // avant le reset (adaptation _slotId=0, cf. _cursorSelectionMonId).
  _cursorSelectionMonId = _slotId;
  _slotId = 0;
  _lastSelectedSlot = 0;
  _graphicsReady = false;
  _graphicsLoading = false;
  _windowsReady = false;
  _windowsLoading = false;
}

function Task_FadeAndClosePartyMenu(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  FadeScreen(1 /* FADE_TO_BLACK */, 0);
  task.func = Task_ClosePartyMenu;
}

function Task_ClosePartyMenu(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _freePartyMenu();
  // 1:1 décomp `Task_ClosePartyMenuAndSetCB2` (party_menu.c:1231-1245) :
  //   if (sPartyMenuInternal->exitCallback != NULL)
  //       SetMainCallback2(sPartyMenuInternal->exitCallback);   ← transitoire
  //   else
  //       SetMainCallback2(gPartyMenu.exitCallback);            ← ultime (field)
  // Le callback transitoire (= RESUME → CB2_ShowPokemonSummaryScreen) est
  // consommé UNE fois. Sortir le résumé de la party de façon SÉQUENTIELLE
  // (party fully freed → handoff CB2) élimine la race async qui faisait
  // survivre une tâche de close → CB2_ReturnToFieldWithOpenMenu = OW+START
  // (bug #4) / CB2 stomp mid-summary (bug #3).
  const transient = _partyTransientExitCb;
  _partyTransientExitCb = null;
  _inBattleItemUse = false;  // flag item-combat consommé (usage OU annulation)
  const exitCb = transient ?? rt.gMain.savedCallback;
  if (exitCb) rt.SetMainCallback2(exitCb);
  else rt.SetMainCallback2(null);
  // 1:1 STRICT décomp party_menu.c:1243 — APRÈS SetMainCallback2, AVANT
  // FreePartyPointers. Sans ça, les tags party (icon/status/pokeball/helditem)
  // restent allous dans sSpriteTileRangeTags + sSpritePaletteTags → leak
  // progressif après chaque cycle party/OW. NOTE : décomp NE FAIT PAS
  // FreeAllSpritePalettes ici (party garde ses palettes), seul Bag les free.
  ResetSpriteData();
  rt.DestroyTask(task.taskId);
  _inputTaskId = -1;
}

// 1:1 décomp MENU_DIR_* (menu.h) + boutons GBA renvoyés par PartyMenuButtonHandler.
const MENU_DIR_UP = -1, MENU_DIR_DOWN = 1, MENU_DIR_LEFT = -2, MENU_DIR_RIGHT = 2;
const A_BUTTON = 0x0001, B_BUTTON = 0x0002, START_BUTTON = 0x0008;

/** 1:1 décomp `s8 *slotPtr` : accès (get/set) au slot courant. Voir
 *  GetCurrentPartySlotPtr pour la sémantique port (curseur = toujours `_slotId`). */
interface PartySlotPtr {
  get(): number;
  set(v: number): void;
}

/** 1:1 décomp `UpdatePartySelectionSingleLayout` (party_menu.c:1523).
 *  Layout single (= notre cas) : slotId values 0..5 (mons), 7 (Cancel).
 *  Confirm (slot 6) + sous-branches `chooseHalf` = hors-solo (double layout /
 *  frontier) → omis (comportement solo inchangé). */
function UpdatePartySelectionSingleLayout(slotPtr: PartySlotPtr, dir: number): void {
  const partyCount = CalculatePlayerPartyCount();
  const CANCEL = PARTY_SIZE + 1;  // = 7
  let s = slotPtr.get();
  switch (dir) {
    case MENU_DIR_UP:
      if (s === 0) s = CANCEL;
      else if (s === CANCEL) s = partyCount - 1;
      else s--;
      break;
    case MENU_DIR_DOWN:
      if (s === CANCEL) s = 0;
      else if (s === partyCount - 1) s = CANCEL;
      else s++;
      break;
    case MENU_DIR_RIGHT:
      if (partyCount !== 1 && s === 0) {
        s = _lastSelectedSlot === 0 ? 1 : _lastSelectedSlot;
      }
      break;
    case MENU_DIR_LEFT:
      if (s !== 0 && s !== PARTY_SIZE && s !== CANCEL) {
        _lastSelectedSlot = s;
        s = 0;
      }
      break;
  }
  slotPtr.set(s);
}

/** 1:1 décomp `UpdateCurrentPartySelection` (party_menu.c:1505) : route
 *  single/double layout puis, si le slot a bougé, PlaySE(SE_SELECT) +
 *  AnimatePartySlot(ancien, 0) + AnimatePartySlot(nouveau, 1). Port = single
 *  seul ; UpdatePartySelectionDoubleLayout (:1588) = hors-scope (double layout). */
function UpdateCurrentPartySelection(slotPtr: PartySlotPtr, dir: number): void {
  const newSlotId = slotPtr.get();          // 1:1 :1507 s8 newSlotId = *slotPtr;
  // 1:1 :1510-1513 layout SINGLE → UpdatePartySelectionSingleLayout ; sinon
  //   UpdatePartySelectionDoubleLayout (hors-solo, non porté).
  UpdatePartySelectionSingleLayout(slotPtr, dir);
  if (slotPtr.get() !== newSlotId) {        // 1:1 :1515
    PlaySE(5);                              // 1:1 :1517 SE_SELECT
    AnimatePartySlot(newSlotId, 0);         // 1:1 :1518
    AnimatePartySlot(slotPtr.get(), 1);     // 1:1 :1519
  }
}

/** 1:1 décomp `PartyMenuButtonHandler` (party_menu.c:1455). Lit
 *  gMain.newAndRepeatedKeys (DPAD/L/R) + JOY_NEW (A/B/START). Retourne
 *  START_BUTTON / A_BUTTON / B_BUTTON / 0. */
function PartyMenuButtonHandler(slotPtr: PartySlotPtr): number {
  const rt = getRuntime();
  if (!rt) return 0;
  const CANCEL = PARTY_SIZE + 1;
  const newRepKeys = rt.gMain.newAndRepeatedKeys ?? rt.gMain.newKeys;
  const newKeys = rt.gMain.newKeys;
  const KEY_L = 0x0200, KEY_R = 0x0100;
  const DPAD_UP = 0x40, DPAD_DOWN = 0x80, DPAD_LEFT = 0x20, DPAD_RIGHT = 0x10;
  let dir = 0;
  switch (newRepKeys & (DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT)) {
    case DPAD_UP:    dir = MENU_DIR_UP;    break;
    case DPAD_DOWN:  dir = MENU_DIR_DOWN;  break;
    case DPAD_LEFT:  dir = MENU_DIR_LEFT;  break;
    case DPAD_RIGHT: dir = MENU_DIR_RIGHT; break;
  }
  // 1:1 :1473-1486 `default` (aucun DPAD) → GetLRKeysPressedAndHeld :
  //   L_PRESSED → MENU_DIR_UP, R_PRESSED → MENU_DIR_DOWN.
  if (dir === 0) {
    if (newRepKeys & KEY_L) dir = MENU_DIR_UP;
    else if (newRepKeys & KEY_R) dir = MENU_DIR_DOWN;
  }
  if (newKeys & START_BUTTON) return START_BUTTON;   // 1:1 :1489
  if (dir !== 0) {
    UpdateCurrentPartySelection(slotPtr, dir);       // 1:1 :1494
    return 0;                                         // 1:1 :1495
  }
  // 1:1 :1499-1500 A sur Cancel (slot 7) = traité comme B (fermeture).
  if ((newKeys & A_BUTTON) && slotPtr.get() === CANCEL) return B_BUTTON;
  return newKeys & (A_BUTTON | B_BUTTON);             // 1:1 :1502
}

/** 1:1 décomp `GetCurrentPartySlotPtr` (party_menu.c:1284). Décomp : renvoie
 *  &slotId2 si action == SWITCH || SOFTBOILED, sinon &slotId.
 *
 *  ⚠️ DIVERGENCE port (déjà documentée party_menu.ts:3405-3407 / :3442 / :3497) :
 *  le port INVERSE les rôles slotId/slotId2. Décomp : slotId = mon FIXE (1er choisi
 *  / donneur softboiled), slotId2 = curseur MOBILE en SWITCH/SOFTBOILED. Port :
 *  `_slotId` = curseur MOBILE dans TOUS les modes, `_slotId2` = mon fixe. Donc
 *  l'équivalent port du « pointeur sur le slot courant » (= le curseur) est
 *  TOUJOURS `_slotId`. Renvoyer `_slotId2` pour SWITCH (calque littéral) inverserait
 *  la navigation et casserait CursorCb_Switch / _switchSelectedMons /
 *  _finishTwoMonAction (intouchables ce lot). Reconciliation = lot re-transcrivant
 *  SWITCH/SOFTBOILED aux rôles décomp ; comportement actuel préservé (contrat lot 4). */
function GetCurrentPartySlotPtr(): PartySlotPtr {
  return {
    get: () => _slotId,
    set: (v: number) => { _slotId = v; },
  };
}

/** 1:1 décomp `Task_HandleChooseMonInput` (party_menu.c:1259). Dispatch input
 *  choix-mon : A → HandleChooseMonSelection, B → HandleChooseMonCancel, START →
 *  (chooseHalf) MoveCursorToConfirm (hors-solo).
 *
 *  DIVERGENCE port : le décomp gate sur `!gPaletteFade.active &&
 *  MenuHelpers_ShouldWaitForLinkRecv() != TRUE` (:1261) ; le port ne gate pas
 *  (l'input 'open' tournait déjà chaque frame — comportement actuel préservé). */
function Task_HandleChooseMonInput(taskId: number): void {
  const slotPtr = GetCurrentPartySlotPtr();        // 1:1 :1263
  switch (PartyMenuButtonHandler(slotPtr)) {       // 1:1 :1265
    case A_BUTTON:                                  // 1:1 :1267 (mon sélectionné)
      HandleChooseMonSelection(taskId, slotPtr);   // 1:1 :1268
      break;
    case B_BUTTON:                                  // 1:1 :1270 (Cancel / press B)
      HandleChooseMonCancel(taskId, slotPtr);      // 1:1 :1271
      break;
    case START_BUTTON:                             // 1:1 :1273
      // 1:1 :1274-1278 if (chooseHalf) { PlaySE(SE_SELECT); MoveCursorToConfirm(); }
      //   chooseHalf = hors-solo (frontier/contest, jamais single layout) → no-op.
      break;
  }
}

/** 1:1 décomp `IsSelectedMonNotEgg` (party_menu.c:1368) : œuf → PlaySE(SE_FAILURE)
 *  + FALSE ; sinon TRUE. Port : prend l'index de slot déréférencé (= *slotPtr).
 *  Adaptation port : slot vide (mon absent du tableau) → FALSE SANS SE (le tableau
 *  party JS peut avoir des trous ; le décomp suppose gPlayerParty[6] fixe). */
function IsSelectedMonNotEgg(slot: number): boolean {
  const mon = _party()[slot];
  if (!mon) return false;                                // slot vide → skip silencieux (adaptation port)
  if (mon.isEgg) { PlaySE(SE_FAILURE); return false; }   // 1:1 :1370-1374
  return true;                                           // 1:1 :1375
}

/** 1:1 décomp `HandleChooseMonSelection` (party_menu.c:1292). *slotPtr == PARTY_SIZE
 *  (Confirm) → gPartyMenu.task (hors-solo single) ; sinon switch(action). Chaque case
 *  = le dispatch A DÉPLACÉ VERBATIM depuis Task_PartyMenu_HandleInput (les ponts
 *  combat globalThis sont CONSERVÉS tels quels — le lot 7 les remplacera). */
function HandleChooseMonSelection(taskId: number, slotPtr: PartySlotPtr): void {
  const CANCEL = PARTY_SIZE + 1;  // = 7
  if (slotPtr.get() === PARTY_SIZE) {
    // 1:1 :1294 Confirm (slot 6) → gPartyMenu.task(taskId). Single layout solo
    //   n'atteint jamais Confirm (chooseHalf/double only) → no-op port.
    return;
  }
  switch (_partyAction) {
    case PARTY_ACTION_SOFTBOILED: {
      // 1:1 :1302-1307 (décomp : IsSelectedMonNotEgg + PartyMenuRemoveWindow avant
      //   Task_TryUseSoftboiledOnPartyMon). Port VERBATIM : appelle directement la
      //   sous-tâche softboiled (l'egg-check inline manque côté port — DIVERGENCE).
      Task_TryUseSoftboiledOnPartyMon();
      break;
    }
    case PARTY_ACTION_USE_ITEM: {
      // 1:1 :1309-1317
      const slot = slotPtr.get();
      if (slot === CANCEL) {
        // A sur CANCEL est déjà mappé à B par PartyMenuButtonHandler → chemin
        //   défensif (le décomp gère Confirm via *slotPtr==PARTY_SIZE → gPartyMenu.task).
        PlaySE(5);
        ClosePartyScreen();
        return;
      }
      if (!IsSelectedMonNotEgg(slot)) return;   // 1:1 :1310
      // 1:1 :1312-1313 (chaînon qui CONSOMME LE TOUR en combat) : en IN_BATTLE,
      //   exitCallback = CB2_SetUpExitToBattleScreen → le sac ne se rouvre que sur
      //   annulation B (sinon soin gratuit).
      if (_inBattleItemUse) _partyTransientExitCb = _CB2_SetUpExitToBattleScreen;
      const cb = (globalThis as Record<string, unknown>).gItemUseCB as
        | ((taskId: number, returnTask: ((task: DecompTask) => void) | null) => void)
        | null
        | undefined;
      if (typeof cb === 'function') {
        cb(taskId, null);  // 1:1 :1316 gItemUseCB(taskId, Task_ClosePartyMenuAfterText)
      }
      break;
    }
    case PARTY_ACTION_GIVE_ITEM: {
      // 1:1 :1335-1342 (décomp partage GIVE_ITEM / GIVE_PC_ITEM ; port = GIVE_ITEM).
      const slot = slotPtr.get();
      if (slot === CANCEL) {
        PlaySE(5);
        ClosePartyScreen();          // → CB2_ReturnToBagMenu (savedCallback)
        return;
      }
      if (!IsSelectedMonNotEgg(slot)) return;   // 1:1 :1337
      PlaySE(5);                                 // 1:1 :1340 SE_SELECT
      TryGiveItemOrMailToSelectedMon();          // 1:1 :1341
      break;
    }
    // (LOT 7) PARTY_ACTION_SEND_OUT / CHOOSE_MON combat : PAS des cases du switch
    // décomp (:1300) → default = Task_TryCreateSelectionWindow → menu d'action
    // in-battle (ENVOI/VERS via GetPartyMenuActionsTypeInBattle) → CursorCb_SendMon.
    case PARTY_ACTION_SWITCH: {
      // 1:1 :1344-1347 PlaySE(SE_SELECT) + SwitchSelectedMons.
      PlaySE(5);
      _switchSelectedMons();
      break;
    }
    default: {
      // 1:1 :1358-1363 default / ABILITY_PREVENTS / SWITCHING → PlaySE(SE_SELECT) +
      //   Task_TryCreateSelectionWindow (ouvre le menu d'action RESUME/OBJET/RETOUR).
      PlaySE(5);
      Task_TryCreateSelectionWindow(taskId);
      break;
    }
  }
}

/** 1:1 décomp `HandleChooseMonCancel` (party_menu.c:1378). Dispatch B par action,
 *  SE PAR CASE 1:1 (LOT 7) : SEND_OUT → SE_FAILURE (le remplacement forcé après
 *  K.O. ne s'annule PAS) ; autres → SE_SELECT. Le switch VOLONTAIRE combat =
 *  PARTY_ACTION_CHOOSE_MON → default → close (gPartyMenuUseExitCallback reste
 *  FALSE → WaitForMonSelection émet PARTY_SIZE = pas de switch). Le paramètre
 *  `taskId` est là pour la fidélité de signature (décomp → Task_ClosePartyMenu) :
 *  le port ferme via ClosePartyScreen (module). */
function HandleChooseMonCancel(taskId: number, slotPtr: PartySlotPtr): void {
  void taskId;
  switch (_partyAction) {
    case PARTY_ACTION_SEND_OUT:
      PlaySE(SE_FAILURE);    // 1:1 :1383 — B refusé (choix forcé après K.O.)
      break;
    case PARTY_ACTION_SWITCH:
    case PARTY_ACTION_SOFTBOILED:
      // 1:1 :1385-1389 PlaySE(SE_SELECT) + FinishTwoMonAction. Port : SWITCH →
      //   _finishTwoMonAction ; SOFTBOILED → Task_FinishSoftboiled (variante port).
      PlaySE(5);                            // 1:1 :1386 SE_SELECT
      if (_partyAction === PARTY_ACTION_SOFTBOILED) Task_FinishSoftboiled();
      else _finishTwoMonAction();
      break;
    default:
      // 1:1 :1394-1404 default : PlaySE(SE_SELECT) + DisplayCancelChooseMonYesNo
      //   (CONTEST/CHOOSE_HALF = hors-solo, jamais TRUE) → gSpecialVar_0x8004 =
      //   *slotPtr = PARTY_SIZE+1 + Task_ClosePartyMenu. Port : seul DAYCARE écrit
      //   le var (BufferMonSelection lit gSpecialVar_0x8004 → PARTY_NOTHING_CHOSEN) ;
      //   USE_ITEM/CHOOSE_MON (field OU combat volontaire) = B → ClosePartyScreen
      //   (savedCallback = bag / overworld / reshow combat).
      PlaySE(5);                            // 1:1 :1395 SE_SELECT
      if (_menuType === PARTY_MENU_TYPE_DAYCARE) {
        VarSet(0x8004, PARTY_SIZE + 1);   // 1:1 :1399 gSpecialVar_0x8004 = PARTY_SIZE+1
        slotPtr.set(PARTY_SIZE + 1);      // 1:1 :1401 *slotPtr = PARTY_SIZE + 1
      }
      ClosePartyScreen();                 // 1:1 :1402 Task_ClosePartyMenu
      break;
  }
}

/** 1:1 décomp `sMonIconAnims` (pokemon_icon.c:941-983). Chaque AnimCmd =
 *  FRAME(img,dur) ; `jump:0` = ANIMCMD_JUMP(0) (= frame.imageValue -2 → boucle
 *  animCmdIndex=0). Aucune n'utilise ANIMCMD_END (-1). Party menu = TOUJOURS
 *  sAnim_0 (idx 0) car party_menu.c n'appelle jamais StartSpriteAnim sur le
 *  monSpriteId (CreateMonIcon laisse animNum=0). */
type _IconAnimCmd = { img: number; dur: number } | { jump: 0 } | { end: true };
const sMonIconAnims: _IconAnimCmd[][] = [
  [{ img: 0, dur: 6 },  { img: 1, dur: 6 },  { jump: 0 }], // sAnim_0
  [{ img: 0, dur: 8 },  { img: 1, dur: 8 },  { jump: 0 }], // sAnim_1
  [{ img: 0, dur: 14 }, { img: 1, dur: 14 }, { jump: 0 }], // sAnim_2
  [{ img: 0, dur: 22 }, { img: 1, dur: 22 }, { jump: 0 }], // sAnim_3
  [{ img: 0, dur: 29 }, { img: 0, dur: 29 }, { jump: 0 }], // sAnim_4 (frame 0 répété)
];

/** Pose la frame visible de l'icône slot (= RequestSpriteCopy du décomp :
 *  on swap juste oam.tileId entre frame 0 (base) et frame 1 (base+16)). */
function _setIconFrame(slot: number, img: number): void {
  const rt = getRuntime(); if (!rt) return;
  const id = _iconOamBySlot[slot]; if (id < 0) return;
  const spr = rt.gSprites[id]; if (!spr) return;
  const oam = rt.gba.oam[spr.oamIndex]; if (!oam) return;
  const slotTileBase = ICON_OBJ_TILE_OFFSET / 32 + slot * ICON_TILES_PER_SLOT;
  oam.tileId = slotTileBase + img * ICON_TILES_PER_FRAME;
}

/** 1:1 décomp `UpdateMonIconFrame(struct Sprite *sprite)` (pokemon_icon.c:1235).
 *  Retourne `result` = animCmdIndex post-incrément quand une frame est posée,
 *  sinon 0 (attente / JUMP). */
function _updateMonIconFrame(slot: number): number {
  let result = 0;
  if (_iconAnimDelay[slot] === 0) {
    const anim = sMonIconAnims[_iconAnimNum[slot]];
    const cmd = anim[_iconAnimCmdIdx[slot]];
    if ('end' in cmd) {
      // frame == -1 (ANIMCMD_END) : break (jamais en party = sécurité 1:1).
    } else if ('jump' in cmd) {
      // frame == -2 (ANIMCMD_JUMP(0)) : sprite->animCmdIndex = 0.
      _iconAnimCmdIdx[slot] = 0;
    } else {
      // default : RequestSpriteCopy (= pose la frame) ; reset delay ;
      // animCmdIndex++ ; result = animCmdIndex.
      _setIconFrame(slot, cmd.img);
      _iconAnimDelay[slot] = cmd.dur & 0xFF;
      _iconAnimCmdIdx[slot]++;
      result = _iconAnimCmdIdx[slot];
    }
  } else {
    _iconAnimDelay[slot]--;
  }
  return result;
}

/** 1:1 décomp `AnimateSelectedPartyIcon(u8 spriteId, u8 animNum)`
 *  (party_menu.c:3978) :
 *
 *      gSprites[spriteId].data[0] = 0;
 *      if (animNum == 0) {                         // non sélectionné
 *          if (gSprites[spriteId].x == 16) { x2 = 0;  y2 = -4; }  // slot 0 (box haute)
 *          else                            { x2 = -4; y2 = 0;  }  // slots 1-5 (colonne droite)
 *          callback = SpriteCB_UpdatePartyMonIcon; // frame only, garde le décalage
 *      } else {                                    // sélectionné
 *          x2 = 0; y2 = 0;
 *          callback = SpriteCB_BouncePartyMonIcon; // rebond y2
 *      }
 *
 *  C'ÉTAIT L'ANIM MANQUANTE (bug #1) : nos icônes restaient en permanence à
 *  la position SÉLECTIONNÉE (x2=0). Le décalage non-sélectionné (x2=-4 colonne
 *  droite / y2=-4 box gauche) n'était jamais appliqué → "décalé tout le temps"
 *  vs ROM où seul le slot sélectionné revient à la position de base + rebondit. */
function _animateSelectedPartyIcon(slot: number, animNum: number): void {
  const rt = getRuntime(); if (!rt) return;
  const id = _iconOamBySlot[slot]; if (id < 0) return;
  const spr = rt.gSprites[id]; if (!spr) return;
  if (spr.data) spr.data[0] = 0; // 1:1 gSprites[spriteId].data[0] = 0;
  if (animNum === 0) {
    if (spr.x === 16) { spr.x2 = 0;  spr.y2 = -4; } // slot 0 = grande box gauche
    else              { spr.x2 = -4; spr.y2 = 0;  } // slots 1-5 = colonne droite
    _iconMode[slot] = 0; // SpriteCB_UpdatePartyMonIcon
  } else {
    spr.x2 = 0; spr.y2 = 0;
    _iconMode[slot] = 1; // SpriteCB_BouncePartyMonIcon
  }
}

/** Driver per-frame des callbacks d'icônes party. 1:1 décomp : chaque icône a
 *  son `sprite->callback` (SpriteCB_BouncePartyMonIcon OU SpriteCB_UpdateParty
 *  MonIcon) exécuté chaque frame ; on dispatch via `_iconMode[slot]` (même
 *  effet : 1 tick/frame). SpriteCB_BouncePartyMonIcon (party_menu.c:4003) :
 *    animCmd = UpdateMonIconFrame(sprite);
 *    if (animCmd != 0) sprite->y2 = (animCmd & 1) ? -3 : 1;
 *  SpriteCB_UpdatePartyMonIcon (:4016) : UpdateMonIconFrame(sprite) seul
 *  (le décalage x2/y2 posé par AnimateSelectedPartyIcon est conservé). */
function Task_PartyMenu_BounceIcon(_task: DecompTask): void {
  if (!_isOpen) return;
  if (_phase !== 'open' && _phase !== 'action_menu') return;
  const rt = getRuntime();
  if (!rt) return;
  for (let i = 0; i < 6; i++) {
    if (_iconOamBySlot[i] < 0) continue;
    const animCmd = _updateMonIconFrame(i);
    if (_iconMode[i] === 1 && animCmd !== 0) {
      const spr = rt.gSprites[_iconOamBySlot[i]];
      if (spr) spr.y2 = (animCmd & 1) ? -3 : 1;
    }
  }
}

/** 1:1 décomp `DisplaySelectionWindow` SELECTWINDOW_ACTIONS (party_menu.c:2533) :
 *    bg=2, tilemapLeft=19, tilemapTop=(19 - numActions*2), width=10,
 *    height=(numActions*2), paletteNum=14, baseBlock=0x2E9.
 *  Spawn action window à droite + cursor à (cursorDimension, 1 + i*16).
 *  Strings 1:1 décomp FR :
 *    MENU_SUMMARY (= "RESUME") - gText_Summary5
 *    MENU_ITEM    (= "OBJET")  - gText_Item
 *    MENU_CANCEL1 (= "RETOUR") - gText_Cancel2 */
/** 1:1 décomp action keys (party_menu.c:76-97) — MENU_* enum values (ordre EXACT). */
const MENU_SUMMARY      = 0;
const MENU_SWITCH       = 1;  // = "ORDRE" FR (gText_Switch2)
const MENU_CANCEL1      = 2;
const MENU_ITEM         = 3;
const MENU_GIVE         = 4;
const MENU_TAKE_ITEM    = 5;
const MENU_MAIL         = 6;
const MENU_TAKE_MAIL    = 7;
const MENU_READ         = 8;
const MENU_CANCEL2      = 9;
const MENU_SHIFT        = 10;  // combat (ECHANGER) — CursorCb_SendMon, lot 7
const MENU_SEND_OUT     = 11;  // combat (ENVOYER)  — CursorCb_SendMon, lot 7
const MENU_ENTER        = 12;  // chooseHalf (INSCRIRE) — hors-solo
const MENU_NO_ENTRY     = 13;  // chooseHalf (RETIRER)  — hors-solo
const MENU_STORE        = 14;  // = "DEPOSER" FR (gText_Store) — pension (ACTIONS_STORE)
const MENU_REGISTER     = 15;  // union room (ENREG.)  — hors-solo
const MENU_TRADE1       = 16;  // union room (ECHANGE) — hors-solo
const MENU_TRADE2       = 17;  // union room (ECHANGE) — hors-solo
const MENU_TOSS         = 18;  // = "JETER" (gMenuText_Toss) — jeter objet tenu, lot 10
const MENU_FIELD_MOVES  = 19;

/** 1:1 décomp `sFieldMoves[]` (data/party_menu.h:745-764). Notre format :
 *  ids "kebab" canonique = MOVE_X → "x" lowercase no-underscore (= pokemon.ts:241). */
const sFieldMoves: readonly string[] = [
  'cut',          // FIELD_MOVE_CUT (= MOVE_CUT)
  'flash',        // FIELD_MOVE_FLASH
  'rocksmash',    // FIELD_MOVE_ROCK_SMASH
  'strength',     // FIELD_MOVE_STRENGTH
  'surf',         // FIELD_MOVE_SURF
  'fly',          // FIELD_MOVE_FLY
  'dive',         // FIELD_MOVE_DIVE
  'waterfall',    // FIELD_MOVE_WATERFALL
  'teleport',     // FIELD_MOVE_TELEPORT
  'dig',          // FIELD_MOVE_DIG
  'secretpower',  // FIELD_MOVE_SECRET_POWER
  'milkdrink',    // FIELD_MOVE_MILK_DRINK
  'softboiled',   // FIELD_MOVE_SOFT_BOILED
  'sweetscent',   // FIELD_MOVE_SWEET_SCENT
];

/** 1:1 décomp `struct { const u8 *text; TaskFunc func; } sCursorOptions[]`
 *  (data/party_menu.h:654-693). `text` = thunk lazy (getString / gMoveNames —
 *  les strings sont chargées au boot, résolues au render, comme le `const u8 *`
 *  décomp pointe la data ROM). `func` = la CursorCb_* transcrite, ou `null` si la
 *  callback n'est pas portée (hors-solo / lot ultérieur) → le dispatch WARN
 *  (précédent : src/battle_transition.ts entrées null + warn). */
interface CursorOption {
  text: () => string;
  func: ((taskId: number) => void) | null;
}
const sCursorOptions: Record<number, CursorOption> = {
  [MENU_SUMMARY]:   { text: () => getString('gText_Summary5'), func: CursorCb_Summary },   // gText_Summary5 = "RESUME"
  [MENU_SWITCH]:    { text: () => getString('gText_Switch2'),  func: CursorCb_Switch },    // gText_Switch2 = "ORDRE"
  [MENU_CANCEL1]:   { text: () => getString('gText_Cancel2'),  func: CursorCb_Cancel1 },   // gText_Cancel2 = "RETOUR"
  [MENU_ITEM]:      { text: () => getString('gText_Item'),     func: CursorCb_Item },       // gText_Item = "OBJET"
  [MENU_GIVE]:      { text: () => getString('gMenuText_Give'), func: CursorCb_Give },       // gMenuText_Give = "DONNER"
  [MENU_TAKE_ITEM]: { text: () => getString('gText_Take'),     func: CursorCb_TakeItem },   // gText_Take = "PRENDR." (≠ ex-FR "PRENDRE")
  [MENU_MAIL]:      { text: () => getString('gText_Mail'),     func: CursorCb_Mail },        // gText_Mail = "LETTRE" (≠ ex-FR "MAIL") — DETTE R3 (stub)
  [MENU_TAKE_MAIL]: { text: () => getString('gText_Take2'),    func: null },                 // CursorCb_TakeMail — dette R3 (mail depuis party non porté)
  [MENU_READ]:      { text: () => getString('gText_Read2'),    func: null },                 // CursorCb_Read — dette R3 (mail depuis party non porté)
  [MENU_CANCEL2]:   { text: () => getString('gText_Cancel2'),  func: CursorCb_Cancel2 },    // gText_Cancel2 = "RETOUR"
  [MENU_SHIFT]:     { text: () => getString('gText_Shift'),    func: CursorCb_SendMon },     // 1:1 table :690
  [MENU_SEND_OUT]:  { text: () => getString('gText_SendOut'),  func: CursorCb_SendMon },     // 1:1 table :691
  [MENU_ENTER]:     { text: () => getString('gText_Enter'),    func: null },                 // CursorCb_Enter — chooseHalf (hors-solo)
  [MENU_NO_ENTRY]:  { text: () => getString('gText_NoEntry'),  func: null },                 // CursorCb_NoEntry — chooseHalf (hors-solo)
  [MENU_STORE]:     { text: () => getString('gText_Store'),    func: CursorCb_Store },       // gText_Store = "DEPOSER"
  [MENU_REGISTER]:  { text: () => getString('gText_Register'), func: null },                 // CursorCb_Register — union room (hors-solo)
  [MENU_TRADE1]:    { text: () => getString('gText_Trade4'),   func: null },                 // CursorCb_Trade1 — union room (hors-solo)
  [MENU_TRADE2]:    { text: () => getString('gText_Trade4'),   func: null },                 // CursorCb_Trade2 — union room (hors-solo)
  [MENU_TOSS]:      { text: () => getString('gMenuText_Toss'), func: null },                 // CursorCb_Toss — jeter objet tenu (lot 10)
};
// 1:1 décomp sCursorOptions[MENU_FIELD_MOVES + FIELD_MOVE_X] = {gMoveNames[MOVE_X],
// CursorCb_FieldMove} (data/party_menu.h:679-692). Généré depuis sFieldMoves[] (même
// source data) : le NOM vient de gMoveNames (via _fieldMoveName), la func = CursorCb_FieldMove
// (déjà portée). L'action >= MENU_FIELD_MOVES encode le field move (fieldMove = action - MENU_FIELD_MOVES).
for (let _fm = 0; _fm < sFieldMoves.length; _fm++) {
  const _action = MENU_FIELD_MOVES + _fm;
  sCursorOptions[_action] = {
    text: () => _fieldMoveName(_action - MENU_FIELD_MOVES),
    func: (taskId: number) => CursorCb_FieldMove(getRuntime(), _action),
  };
}

/** 1:1 décomp action-list IDs (party_menu.c:100-115) — indexent sPartyMenuActions[]. */
const ACTIONS_NONE          = 0;
const ACTIONS_SWITCH        = 1;
const ACTIONS_SHIFT         = 2;
const ACTIONS_SEND_OUT      = 3;
const ACTIONS_ENTER         = 4;
const ACTIONS_NO_ENTRY      = 5;
const ACTIONS_STORE         = 6;
const ACTIONS_SUMMARY_ONLY  = 7;
const ACTIONS_ITEM          = 8;
const ACTIONS_MAIL          = 9;
const ACTIONS_REGISTER      = 10;
const ACTIONS_TRADE         = 11;
const ACTIONS_SPIN_TRADE    = 12;
const ACTIONS_TAKEITEM_TOSS = 13;

// 1:1 décomp sPartyMenuAction_* (data/party_menu.h:695-707).
const sPartyMenuAction_SummarySwitchCancel  = [MENU_SUMMARY, MENU_SWITCH, MENU_CANCEL1];
const sPartyMenuAction_ShiftSummaryCancel   = [MENU_SHIFT, MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_SendOutSummaryCancel = [MENU_SEND_OUT, MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_SummaryCancel        = [MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_EnterSummaryCancel   = [MENU_ENTER, MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_NoEntrySummaryCancel = [MENU_NO_ENTRY, MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_StoreSummaryCancel   = [MENU_STORE, MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_GiveTakeItemCancel   = [MENU_GIVE, MENU_TAKE_ITEM, MENU_CANCEL2];
const sPartyMenuAction_ReadTakeMailCancel   = [MENU_READ, MENU_TAKE_MAIL, MENU_CANCEL2];
const sPartyMenuAction_RegisterSummaryCancel = [MENU_REGISTER, MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_TradeSummaryCancel1  = [MENU_TRADE1, MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_TradeSummaryCancel2  = [MENU_TRADE2, MENU_SUMMARY, MENU_CANCEL1];
const sPartyMenuAction_TakeItemTossCancel   = [MENU_TAKE_ITEM, MENU_TOSS, MENU_CANCEL1];

/** 1:1 décomp `sPartyMenuActions[]` (data/party_menu.h:709). CONSOMMÉE (lot 3) par
 *  `SetPartyMonSelectionActions` (action != ACTIONS_NONE → copie de la table). */
const sPartyMenuActions: Record<number, readonly number[] | null> = {
  [ACTIONS_NONE]:          null,
  [ACTIONS_SWITCH]:        sPartyMenuAction_SummarySwitchCancel,
  [ACTIONS_SHIFT]:         sPartyMenuAction_ShiftSummaryCancel,
  [ACTIONS_SEND_OUT]:      sPartyMenuAction_SendOutSummaryCancel,
  [ACTIONS_ENTER]:         sPartyMenuAction_EnterSummaryCancel,
  [ACTIONS_NO_ENTRY]:      sPartyMenuAction_NoEntrySummaryCancel,
  [ACTIONS_STORE]:         sPartyMenuAction_StoreSummaryCancel,
  [ACTIONS_SUMMARY_ONLY]:  sPartyMenuAction_SummaryCancel,
  [ACTIONS_ITEM]:          sPartyMenuAction_GiveTakeItemCancel,
  [ACTIONS_MAIL]:          sPartyMenuAction_ReadTakeMailCancel,
  [ACTIONS_REGISTER]:      sPartyMenuAction_RegisterSummaryCancel,
  [ACTIONS_TRADE]:         sPartyMenuAction_TradeSummaryCancel1,
  [ACTIONS_SPIN_TRADE]:    sPartyMenuAction_TradeSummaryCancel2,
  [ACTIONS_TAKEITEM_TOSS]: sPartyMenuAction_TakeItemTossCancel,
};

/** 1:1 décomp `sPartyMenuActionCounts[]` (data/party_menu.h:727). CONSOMMÉE (lot 3) par
 *  `SetPartyMonSelectionActions` (numActions = counts[action]). */
const sPartyMenuActionCounts: Record<number, number> = {
  [ACTIONS_NONE]:          0,
  [ACTIONS_SWITCH]:        sPartyMenuAction_SummarySwitchCancel.length,
  [ACTIONS_SHIFT]:         sPartyMenuAction_ShiftSummaryCancel.length,
  [ACTIONS_SEND_OUT]:      sPartyMenuAction_SendOutSummaryCancel.length,
  [ACTIONS_ENTER]:         sPartyMenuAction_EnterSummaryCancel.length,
  [ACTIONS_NO_ENTRY]:      sPartyMenuAction_NoEntrySummaryCancel.length,
  [ACTIONS_STORE]:         sPartyMenuAction_StoreSummaryCancel.length,
  [ACTIONS_SUMMARY_ONLY]:  sPartyMenuAction_SummaryCancel.length,
  [ACTIONS_ITEM]:          sPartyMenuAction_GiveTakeItemCancel.length,
  [ACTIONS_MAIL]:          sPartyMenuAction_ReadTakeMailCancel.length,
  [ACTIONS_REGISTER]:      sPartyMenuAction_RegisterSummaryCancel.length,
  [ACTIONS_TRADE]:         sPartyMenuAction_TradeSummaryCancel1.length,
  [ACTIONS_SPIN_TRADE]:    sPartyMenuAction_TradeSummaryCancel2.length,
  [ACTIONS_TAKEITEM_TOSS]: sPartyMenuAction_TakeItemTossCancel.length,
};

/** 1:1 décomp `sFieldMoves[]` (data/party_menu.h:745) = les MOVE_* de chaque field move,
 *  MÊME ORDRE que `sFieldMoves` kebab ci-dessus. Le NOM affiché vient de `gMoveNames[move]`
 *  (1:1 décomp : `DisplaySelectionWindow` → `StringCopy(.., gMoveNames[move])`), PAS d'une table
 *  FR codée en dur — celle-ci dérivait (EBOULEMENT au lieu d'ECLATE-ROC, POUVOIRSECRET au lieu de
 *  FORCE CACHEE, BUVECLAIR/DOUXFOYER/DOUXPARFUM faux). gMoveNames = source canonique (move-names-fr.json). */
const sFieldMoveMoveConstants: readonly string[] = [
  'MOVE_CUT', 'MOVE_FLASH', 'MOVE_ROCK_SMASH', 'MOVE_STRENGTH',
  'MOVE_SURF', 'MOVE_FLY', 'MOVE_DIVE', 'MOVE_WATERFALL',
  'MOVE_TELEPORT', 'MOVE_DIG', 'MOVE_SECRET_POWER', 'MOVE_MILK_DRINK',
  'MOVE_SOFT_BOILED', 'MOVE_SWEET_SCENT',
];

/** Nom FR d'un field move (index j) via `gMoveNames[move]` — 1:1 décomp. */
function _fieldMoveName(j: number): string {
  const moveId = resolveDecompConstant(sFieldMoveMoveConstants[j] ?? '') ?? 0;
  return gMoveNames[moveId] ?? '';
}

/** Re-render action menu contents (= called au open + après cursor move).
 *  Le cursor "▶" est blit devant l'item selected. 1:1 décomp pattern
 *  Menu_MoveCursor + InitMenuInUpperLeftCorner. */
function _renderActionMenuContents(): void {
  if (_actionWindowId < 0) return;
  // 1:1 décomp DisplaySelectionWindow (party_menu.c:2533) :
  //   DrawStdFrameWithCustomTileAndPalette(wid, FALSE, 0x4F, 13) APRÈS AddWindow.
  // ⚠️ DrawStdFrame doit être appelé AVANT FillWindowPixelBuffer + PutWindowTilemap
  // sinon le frame border n'apparaît pas (= bug visuel : menu sans cadre).
  DrawStdFrameWithCustomTileAndPalette(_actionWindowId, false, 0x4F, 13);

  const numActions = _actionList.length;
  FillWindowPixelBuffer(_actionWindowId, 0x11);  // = palette idx 1 (= white bg)
  PutWindowTilemap(_actionWindowId);
  for (let i = 0; i < numActions; i++) {
    // 1:1 décomp party_menu.c:2556 : `if (action >= MENU_FIELD_MOVES) → font color 4`.
    // Notre rendu garde la même police, mais résout le nom du move FR depuis
    // FIELD_MOVE_NAMES_FR[j] où j = action - MENU_FIELD_MOVES.
    const actionKey = _actionList[i];
    // 1:1 décomp DisplaySelectionWindow (party_menu.c:2557) :
    //   AddTextPrinterParameterized4(.., sCursorOptions[actions[i]].text)
    // Le libellé vient de la table sCursorOptions (getString / gMoveNames), plus de
    // Record FR maison : les valeurs ROM justes remplacent l'ancien hardcode
    // (gText_Take="PRENDR." ≠ "PRENDRE" ; gText_Mail="LETTRE" ≠ "MAIL").
    const str = sCursorOptions[actionKey]?.text() ?? '';
    const isSelected = i === _actionCursor;
    // Cursor arrow ▶ devant le selected item à x=0, text à x=8 (= cursorDim).
    if (isSelected) {
      AddTextPrinterParameterized3(
        _actionWindowId, FONT_NORMAL, 0, i * 16 + 1,
        [1, 2, 3] as [number, number, number],
        TEXT_SKIP_DRAW, '▶',
      );
    }
    // 1:1 décomp party_menu.c:2556 : fontColorsId = (action >= MENU_FIELD_MOVES) ? 4 : 3.
    // → capacités CS (VOL/SURF/COUPE…) en BLEU (sFontColorTable[4]), actions normales
    // (RESUME/OBJET/DÉPLACER/DONNER/RETOUR) en gris (sFontColorTable[3]).
    const actionColor = actionKey >= MENU_FIELD_MOVES ? COLOR_ACTION_FIELD_MOVE : COLOR_ACTION_SELECTION;
    AddTextPrinterParameterized3(
      _actionWindowId, FONT_NORMAL, 8, i * 16 + 1,
      actionColor,
      TEXT_SKIP_DRAW, str,
    );
  }
  CopyWindowToVram(_actionWindowId, 3);
}

// ─── LOT 3 : liste d'actions + fenêtre de sélection 1:1 (party_menu.c:2524-2738) ───
// Remplace l'ancien inline _openActionMenu/_spawnActionWindow par les fonctions décomp.
// Consomme les tables sPartyMenuActions[]/sPartyMenuActionCounts[] (lot 2) + sCursorOptions[].

/** 1:1 décomp SELECTWINDOW_* (include/constants/party_menu.h:129-132). */
const SELECTWINDOW_ACTIONS = 0;
const SELECTWINDOW_ITEM     = 1;
const SELECTWINDOW_MAIL     = 2;
const SELECTWINDOW_MOVES    = 3;

/** 1:1 décomp MAX_MON_MOVES (include/constants/pokemon.h). */
const MAX_MON_MOVES = 4;

/** 1:1 décomp `sItemGiveTakeWindowTemplate` (data/party_menu.h:485). */
const sItemGiveTakeWindowTemplate: WindowTemplate = {
  bg: 2, tilemapLeft: 23, tilemapTop: 13, width: 6, height: 6, paletteNum: 14, baseBlock: 0x39D,
};
/** 1:1 décomp `sMailReadTakeWindowTemplate` (data/party_menu.h:496). */
const sMailReadTakeWindowTemplate: WindowTemplate = {
  bg: 2, tilemapLeft: 21, tilemapTop: 13, width: 8, height: 6, paletteNum: 14, baseBlock: 0x39D,
};
/** 1:1 décomp `sMoveSelectWindowTemplate` (data/party_menu.h:507). */
const sMoveSelectWindowTemplate: WindowTemplate = {
  bg: 2, tilemapLeft: 19, tilemapTop: 11, width: 10, height: 8, paletteNum: 14, baseBlock: 0x2E9,
};

/** 1:1 décomp `AppendToList` (util.c) : `list[(*pos)++] = value`. Port : le compteur
 *  `numActions` = `list.length` (l'array grandit ; pas de compteur séparé). */
function AppendToList(list: number[], value: number): void {
  list.push(value);
}

/** 1:1 décomp `InMultiPartnerRoom` (field_specials.c:1663) : TRUE seulement dans la Multi
 *  Partner Room (frontier Battle Tower multi). Hors-solo → toujours FALSE dans les flux party
 *  portés (frontier non atteignable). Shim local = évite un import top-level frontier (risque
 *  méga-cycle ESM/TDZ, CLAUDE.md R3). */
function InMultiPartnerRoom(): boolean {
  return false;
}

/** 1:1 décomp `InBattlePike` (battle_pike.c:1326) : TRUE dans une salle du Battle Pike
 *  (frontier). Le vrai `InBattlePike` vit dans battle_pike.ts ; shim local ici (FALSE en solo)
 *  pour éviter l'import top-level (risque méga-cycle ESM/TDZ, CLAUDE.md R3). */
function InBattlePike(): boolean {
  return false;
}

/** 1:1 décomp `DisplaySelectionWindow` (party_menu.c:2524) : crée la fenêtre de sélection
 *  (template selon windowType), charge/dessine le cadre, imprime les actions. Le RENDU du
 *  contenu (texte + curseur ▶) reste `_renderActionMenuContents` (curseur manuel re-render par
 *  Task_HandleSelectionMenuInput, inchangé lot 2). Retourne l'id de fenêtre. */
function DisplaySelectionWindow(windowType: number): number {
  let windowTemplate: WindowTemplate;
  const numActions = _actionList.length;   // = sPartyMenuInternal->numActions
  switch (windowType) {
    case SELECTWINDOW_ACTIONS:
      // 1:1 :2534 SetWindowTemplateFields(bg2, left19, top=19-numActions*2, w10, h=numActions*2, pal14, base0x2E9).
      windowTemplate = { bg: 2, tilemapLeft: 19, tilemapTop: 19 - numActions * 2, width: 10, height: numActions * 2, paletteNum: 14, baseBlock: 0x2E9 };
      break;
    case SELECTWINDOW_ITEM:
      windowTemplate = { ...sItemGiveTakeWindowTemplate };
      break;
    case SELECTWINDOW_MAIL:
      windowTemplate = { ...sMailReadTakeWindowTemplate };
      break;
    default: // SELECTWINDOW_MOVES
      windowTemplate = { ...sMoveSelectWindowTemplate };
      break;
  }
  // 1:1 :2547-2548 : windowId[0] = AddWindow(&window) ; DrawStdFrameWithCustomTileAndPalette.
  //   AddWindow (PAS InitWindows qui wipe tout = écran noir). LoadUserWindowBorderGfx charge les
  //   tiles cadre 0x4F/pal13 avant le 1er DrawStdFrame (fait dans _renderActionMenuContents) —
  //   sinon menu sans cadre.
  _actionWindowId = AddWindow(windowTemplate);
  LoadUserWindowBorderGfx(0, 0x4F, 13 * 16);
  if (windowType === SELECTWINDOW_MOVES) {
    // 1:1 :2549-2550 : SELECTWINDOW_MOVES → juste le cadre, pas de texte (retour anticipé).
    DrawStdFrameWithCustomTileAndPalette(_actionWindowId, false, 0x4F, 13);
    return _actionWindowId;
  }
  // 1:1 :2554-2560 : imprime chaque action (font color 4 si field move, sinon 3) +
  //   InitMenuInUpperLeftCorner(.., 0, ..) = curseur en haut. Port : _renderActionMenuContents
  //   dessine cadre + texte (sCursorOptions[actions[i]].text) + curseur ▶ ; curseur reset à 0.
  _actionCursor = 0;
  _renderActionMenuContents();
  ScheduleBgCopyTilemapToVram(2);   // 1:1 :2561
  return _actionWindowId;
}

/** 1:1 décomp `SetPartyMonFieldSelectionActions` (party_menu.c:2607) : liste d'actions du menu
 *  de terrain — SUMMARY, puis 1 entrée par field move du mon, puis (hors Battle Pike) SWITCH
 *  si ≥2 mons + MAIL/ITEM, puis CANCEL1. Écrit `_actionList` (= sPartyMenuInternal->actions,
 *  length = numActions). */
function SetPartyMonFieldSelectionActions(mons: Pokemon[], slotId: number): void {
  // 1:1 :2611-2612 : numActions=0 ; AppendToList(MENU_SUMMARY).
  _actionList = [];
  AppendToList(_actionList, MENU_SUMMARY);
  const mon = mons[slotId];
  // 1:1 :2615-2625 : pour chaque move du mon, si présent dans sFieldMoves[] → MENU_FIELD_MOVES+j.
  //   Adaptation représentation : move id (u16) → id kebab pour matcher sFieldMoves kebab (= comment
  //   le reste du port compare les moves, cf. pokemon.ts:241 ; sFieldMoves kebab a 14 entrées =
  //   décomp j=0..FIELD_MOVES_COUNT-1, sans la sentinelle terminale).
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const move = mon.moves[i];   // GetMonData(&mons[slotId], i + MON_DATA_MOVE1)
    if (!move) continue;
    const moveEnum = reverseDecompConstant(move, 'MOVE_');
    if (!moveEnum) continue;
    const moveDexId = moveEnum.replace(/^MOVE_/, '').toLowerCase().replace(/_/g, '');
    for (let j = 0; j < sFieldMoves.length; j++) {
      if (moveDexId === sFieldMoves[j]) {
        AppendToList(_actionList, MENU_FIELD_MOVES + j);
        break;
      }
    }
  }
  // 1:1 :2627-2635 : hors Battle Pike, SWITCH (si mons[1] != SPECIES_NONE) + MAIL/ITEM.
  if (!InBattlePike()) {
    if (mons[1].species !== 0) AppendToList(_actionList, MENU_SWITCH);   // party[1] != SPECIES_NONE (ORDRE)
    if (ItemIsMail(mon.heldItem)) AppendToList(_actionList, MENU_MAIL);   // MON_DATA_HELD_ITEM
    else AppendToList(_actionList, MENU_ITEM);
  }
  AppendToList(_actionList, MENU_CANCEL1);
}

/** 1:1 décomp `SetPartyMonSelectionActions` (party_menu.c:2591) : ACTIONS_NONE → liste de
 *  terrain (SetPartyMonFieldSelectionActions) ; sinon copie sPartyMenuActions[action] (lot 2).
 *  Écrit `_actionList` (= sPartyMenuInternal->actions, length = numActions). */
function SetPartyMonSelectionActions(mons: Pokemon[], slotId: number, action: number): void {
  if (action === ACTIONS_NONE) {
    SetPartyMonFieldSelectionActions(mons, slotId);
  } else {
    // 1:1 :2601-2603 : numActions = counts[action] ; actions[i] = sPartyMenuActions[action][i].
    const src = sPartyMenuActions[action] ?? [];
    const count = sPartyMenuActionCounts[action] ?? 0;
    _actionList = [];
    for (let i = 0; i < count; i++) AppendToList(_actionList, src[i]);
  }
}

/** 1:1 décomp `GetPartyMenuActionsType` (party_menu.c:2639) : type de liste d'actions selon
 *  gPartyMenu.menuType (= _menuType). Cas SOLO atteignables portés ; combat/frontier/union-room/
 *  chooseHalf laissés en commentaire (hors flux solo — le port garde _menuType =
 *  PARTY_MENU_TYPE_FIELD hors pension, cf. OpenPartyScreenForItemUse/ForBattleSwitch, lot 7). */
function GetPartyMenuActionsType(mon: Pokemon): number {
  let actionType: number;
  switch (_menuType) {
    case PARTY_MENU_TYPE_FIELD:
      // 1:1 :2646 : multi-partner (hors-solo → false) OU œuf → ACTIONS_SWITCH ; sinon
      // ACTIONS_NONE (liste peuplée par SetPartyMonFieldSelectionActions).
      if (InMultiPartnerRoom() === true || mon.isEgg) actionType = ACTIONS_SWITCH;
      else actionType = ACTIONS_NONE;
      break;
    case PARTY_MENU_TYPE_IN_BATTLE:
      // 1:1 :2651 : combat → ACTIONS_SEND_OUT / ACTIONS_SHIFT / ACTIONS_SUMMARY_ONLY.
      actionType = GetPartyMenuActionsTypeInBattle(mon);
      break;
    // case PARTY_MENU_TYPE_CHOOSE_HALF: … (frontier chooseHalf — hors-solo)
    case PARTY_MENU_TYPE_DAYCARE:
      // 1:1 :2669 : œuf → ACTIONS_SUMMARY_ONLY ; sinon ACTIONS_STORE.
      actionType = mon.isEgg ? ACTIONS_SUMMARY_ONLY : ACTIONS_STORE;
      break;
    // case PARTY_MENU_TYPE_UNION_ROOM_REGISTER: ACTIONS_REGISTER;         (hors-solo)
    // case PARTY_MENU_TYPE_UNION_ROOM_TRADE:    ACTIONS_TRADE;            (hors-solo)
    // case PARTY_MENU_TYPE_SPIN_TRADE:          ACTIONS_SPIN_TRADE;       (hors-solo)
    // case PARTY_MENU_TYPE_STORE_PYRAMID_HELD_ITEMS: ACTIONS_TAKEITEM_TOSS; (frontier — hors-solo)
    // Les autres (CONTEST/CHOOSE_MON/MULTI_SHOWCASE/MOVE_RELEARNER/MINIGAME) sortent
    // immédiatement à la sélection → pas de liste d'actions (défaut ACTIONS_NONE).
    default:
      actionType = ACTIONS_NONE;
      break;
  }
  return actionType;
}

/** 1:1 décomp `CreateSelectionWindow` (party_menu.c:2696) : (re)construit le menu d'action du
 *  mon courant. Solo : toujours la branche menuType != STORE_PYRAMID_HELD_ITEMS → renvoie TRUE
 *  (fenêtre créée). La branche pyramide (FALSE → Task_UpdateHeldItemSprite) est hors-solo. */
function CreateSelectionWindow(taskId: number): boolean {
  void taskId;   // 1:1 : taskId sert seulement la branche pyramide (hors-solo, non portée).
  const mon = gPlayerParty[_slotId];   // &gPlayerParty[gPartyMenu.slotId]
  // 1:1 :2701 GetMonNickname(mon, gStringVar1) : buffer nick — inutile ici, le message
  //   PARTY_MSG_DO_WHAT_WITH_MON du port (gText_DoWhatWithPokemon) est statique (pas de {STR_VAR_1}).
  // 1:1 :2702 PartyMenuRemoveWindow(&windowId[1]) : retrait de l'ancienne fenêtre message
  //   AVANT de dessiner le menu — l'ordre est CRITIQUE : la msgbox CHOOSE_MON (21 tiles
  //   + cadre → clear jusqu'à x=23) chevauche le menu d'action (x≥19) ; la retirer APRÈS
  //   DisplaySelectionWindow trouait le coin bas-gauche du menu (bug user 2026-07-17).
  if (_msgWid >= 0) {
    ClearStdWindowAndFrame(_msgWid, false);
    CopyWindowToVram(_msgWid, 3);
    RemoveWindow(_msgWid);
    _msgWid = -1;
  }
  // 1:1 :2703-2708 branche solo (menuType != PARTY_MENU_TYPE_STORE_PYRAMID_HELD_ITEMS) :
  SetPartyMonSelectionActions(gPlayerParty, _slotId, GetPartyMenuActionsType(mon));
  _actionSubMenu = 'mon';
  _phase = 'action_menu';
  DisplaySelectionWindow(SELECTWINDOW_ACTIONS);
  _drawMsg();   // = DisplayPartyMenuStdMessage(PARTY_MSG_DO_WHAT_WITH_MON)
  return true;
}

/** 1:1 décomp `Task_TryCreateSelectionWindow` (party_menu.c:2731) : crée la fenêtre puis passe
 *  la main à Task_HandleSelectionMenuInput. Port : `data[0]=0xFF` (sentinelle curseur) +
 *  `func = Task_HandleSelectionMenuInput` sont repris par `_phase='action_menu'` (posé par
 *  CreateSelectionWindow ; Task_PartyMenu_HandleInput y branche Task_HandleSelectionMenuInput). */
function Task_TryCreateSelectionWindow(taskId: number): void {
  CreateSelectionWindow(taskId);
}

/** Point d'entrée du menu d'action (A sur un mon) — thin wrapper 1:1 :
 *  `HandleChooseMonSelection` default (party_menu.c:1361) = `PlaySE(SE_SELECT)` +
 *  `Task_TryCreateSelectionWindow`. Aussi appelé au retour résumé (Task_TryCreateSelectionWindow,
 *  party_menu.c:2794) et par CursorCb_Cancel2 (party_menu.c:3489) avec playSe=false : le SE est
 *  déjà joué par le dispatch / non rejoué au reopen. */
function _openActionMenu(rt: ReturnType<typeof getRuntime>, playSe = true): void {
  if (!rt) return;
  if (playSe) PlaySE(5);   // SE_SELECT
  Task_TryCreateSelectionWindow(_inputTaskId >= 0 ? _inputTaskId : 0);
}

// ─── Sous-menu OBJET (cascade CursorCb_Item) — 1:1 décomp party_menu.c ───────
// ACTIONS_ITEM = {MENU_GIVE, MENU_TAKE_ITEM, MENU_CANCEL2} (DONNER/PRENDRE/RETOUR).
// PRENDRE + RETOUR portés ici ; DONNER (cascade bag-give CB2) = lot suivant.

/** Retire le window du sous-menu objet (1:1 PartyMenuRemoveWindow ×2). */
function _removeActionWindow(): void {
  if (_actionWindowId >= 0) {
    ClearStdWindowAndFrame(_actionWindowId, false);
    CopyWindowToVram(_actionWindowId, 3);
    RemoveWindow(_actionWindowId);
    _actionWindowId = -1;
  }
}

/** 1:1 décomp `CursorCb_Item` (party_menu.c:3074) : remplace le menu d'action
 *  mon par le sous-menu objet ACTIONS_ITEM + message DO_WHAT_WITH_ITEM.
 *  SE_SELECT déjà joué par le dispatch. */
// NB signature : les CursorCb_* prennent `taskId: number` (1:1 TaskFunc décomp) même
// quand le port ne l'utilise pas — l'état vit dans les globals module (_slotId/_actionList…),
// pas dans gTasks[taskId].data. `noUnusedParameters` est off → param inutilisé = tsc OK.
function CursorCb_Item(taskId: number): void {
  // 1:1 :3077-3078 PartyMenuRemoveWindow(windowId[0]) + windowId[1] : retire la fenêtre de
  //   sélection (la fenêtre message est retirée+redessinée par _drawMsg).
  _removeActionWindow();
  // 1:1 :3079 SetPartyMonSelectionActions(gPlayerParty, slotId, ACTIONS_ITEM) → table lot 2
  //   sPartyMenuActions[ACTIONS_ITEM] = {MENU_GIVE, MENU_TAKE_ITEM, MENU_CANCEL2} (DONNER/PRENDR./RETOUR).
  SetPartyMonSelectionActions(gPlayerParty, _slotId, ACTIONS_ITEM);
  _actionSubMenu = 'item';
  _phase = 'action_menu';
  // 1:1 :3080 DisplaySelectionWindow(SELECTWINDOW_ITEM) : ⚠️ fenêtre à left23/w6/base0x39D
  //   (≠ ancien rendu qui réutilisait le template ACTIONS left19/w10) — suit le DÉCOMP.
  DisplaySelectionWindow(SELECTWINDOW_ITEM);
  // 1:1 :3081 DisplayPartyMenuStdMessage(PARTY_MSG_DO_WHAT_WITH_ITEM) (subMenu 'item').
  _drawMsg();
}

/** 1:1 décomp `TryTakeMonItem` (party_menu.c:1813) : retire l'objet tenu vers le
 *  sac. Retourne 0 (ne tient rien) / 1 (sac plein) / 2 (pris). */
function TryTakeMonItem(mon: Pokemon): number {
  const item = mon.heldItem;
  if (!item) return 0;                                          // ITEM_NONE
  if (AddBagItem(GetBagItemKey(item), 1) === false) return 1;  // sac plein (clé SAC, cf. GetBagItemKey)
  mon.heldItem = 0;                                             // SetMonData(HELD_ITEM, ITEM_NONE)
  return 2;
}

/** 1:1 décomp `CursorCb_TakeItem` (party_menu.c:3273) : PRENDRE l'objet tenu →
 *  sac + message selon résultat, puis refresh l'icône + retour choix-mon.
 *  SE_SELECT déjà joué par le dispatch. */
function CursorCb_TakeItem(taskId: number): void {
  const mon = _slotMon(_slotId);
  if (!mon) return;
  const item = mon.heldItem;  // capturé AVANT TryTakeMonItem (1:1 : item lu en tête)
  _removeActionWindow();
  let msg: string;
  switch (TryTakeMonItem(mon)) {
    case 0:  // 1:1 :3284 ne tient rien → gText_PkmnNotHolding ("{nick} ne tient rien.")
      // 1:1 texte décomp COMPLET ({PAUSE_UNTIL_PRESS} final rendu par le printer).
      msg = _preparePartyMsg(getString('gText_PkmnNotHolding') || '', mon.nickname);
      break;
    case 1:  // 1:1 :3289 sac plein → BufferBagFullCantTakeItemMessage
      msg = _preparePartyMsg(getString('gText_BagFullCouldNotRemoveItem') || '');
      break;
    default: // 2 = pris → DisplayTookHeldItemMessage ("Reçu {item} de {nick}.")
      msg = _preparePartyMsg(getString('gText_ReceivedItemFromPkmn') || '',
        mon.nickname, GetItemName(item));
      break;
  }
  // 1:1 décomp Task_UpdateHeldItemSprite : refresh l'icône d'objet tenu du slot
  // (= disparaît si l'objet a été pris).
  _updatePartyMonHeldItem(_slotId);
  _itemUsedMsgText = msg;
  _actionList = [];
  _actionCursor = 0;
  _actionSubMenu = 'mon';
  _phase = 'helditem_msg';
  _drawMsg();
}

/** 1:1 décomp `CursorCb_Cancel2` (party_menu.c:3482) : RETOUR du sous-menu objet
 *  → reconstruit le menu d'action mon (GetPartyMenuActionsType = ACTIONS_NONE →
 *  field actions). SE_SELECT déjà joué par le dispatch (→ playSe=false). */
function CursorCb_Cancel2(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  _removeActionWindow();
  _openActionMenu(rt, false);
}

/** 1:1 décomp `CursorCb_Give` (party_menu.c:3086) : exitCallback =
 *  CB2_SelectBagItemToGive (ouvre le sac en mode "donner à un mon") + close.
 *  DETTE (lot suivant) : la cascade bag-give (CB2_SelectBagItemToGive →
 *  GoToBagMenu(ITEMMENULOCATION_PARTY) → CB2_GiveHoldItem → GiveItemToMon)
 *  demande le handoff CB2 party↔bag en mode give. Reste sur le sous-menu en
 *  attendant ce wire. */
function CursorCb_Give(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp `CursorCb_Give` (party_menu.c:3086) : exitCallback = CB2_SelectBagItemToGive,
  // Task_ClosePartyMenu. On PERSISTE le slot receveur + le savedCallback field-return
  // (le teardown reset _slotId=0 ; GoToBagMenu va écraser savedCallback).
  _giveHoldItemSlot = _slotId;
  _giveReturnCb = rt.gMain.savedCallback ?? null;
  _removeActionWindow();
  _partyTransientExitCb = CB2_SelectBagItemToGive;
  ClosePartyScreen();  // = Task_ClosePartyMenu (close handoff → CB2_SelectBagItemToGive)
}

/** 1:1 décomp `CB2_SelectBagItemToGive` (party_menu.c:3093) : ouvre le sac en mode
 *  "donner à un mon" (ITEMMENULOCATION_PARTY) avec exitCallback = CB2_GiveHoldItem. */
function CB2_SelectBagItemToGive(): void {
  GoToBagMenu(ITEMMENULOCATION_PARTY, POCKETS_COUNT, CB2_GiveHoldItem);
}

/** 1:1 décomp `CB2_GiveHoldItem` (party_menu.c:3100) : retour du sac. Lit
 *  gSpecialVar.ItemId (objet choisi). 0 = annulé → reopen choix-mon. Sinon donne
 *  l'objet (GiveItemToMon + RemoveBagItem) puis reopen + message "X doit tenir Y!".
 *  DETTE 2b : already-holding (Task_SwitchHoldItemsPrompt) / mail = différés. */
function CB2_GiveHoldItem(): void {
  const rt = getRuntime();
  if (!rt) return;
  const item = (gSpecialVar.ItemId as number) | 0;
  const slot = _giveHoldItemSlot;
  const mon = slot >= 0 ? gPlayerParty[slot] : undefined;
  if (item === 0 || !mon || mon.species === 0) {
    _reopenPartyForGive(null);              // annulé / invalide → reopen sans donner
    return;
  }
  if (mon.heldItem !== 0) {
    // 1:1 :3111 already-holding → reopen + Task_SwitchHoldItemsPrompt (échange Oui/Non).
    _giveOldItem = mon.heldItem;   // sPartyMenuItemId
    _giveNewItem = item;            // gSpecialVar_ItemId
    _reopenPartyForSwitch();
    return;
  }
  // 1:1 Task_GiveHoldItem (party_menu.c:3133) : GiveItemToMon + DisplayGaveHeldItem
  // Message + RemoveBagItem.
  GiveItemToMon(mon, item);
  RemoveBagItem(GetBagItemKey(item), 1);  // clé SAC (TM/HM enum-numbered → move-named)
  const msg = _preparePartyMsg(getString('gText_PkmnWasGivenItem') || '',
    mon.nickname, GetItemName(item));
  _reopenPartyForGive(msg);
}

/** 1:1 décomp `GiveItemToMon` (party_menu.c:1799) : mail → GiveMailToMonByItemId
 *  (alloue le slot mail, échoue si plein → return) ; puis SetMonData(HELD_ITEM). */
function GiveItemToMon(mon: Pokemon, item: number): void {
  if (ItemIsMail(item)) {
    if (GiveMailToMonByItemId(mon, item) === MAIL_NONE) return;  // sac mail plein → abandon
  }
  mon.heldItem = item;
}

/** Réouvre le party menu après le round-trip sac (1:1 décomp `InitPartyMenu(
 *  KEEP_PARTY_LAYOUT, …, Task_GiveHoldItem, gPartyMenu.exitCallback)`). Restaure le
 *  slot receveur + le savedCallback field-return. `msg` (≠ null) = message
 *  "X doit tenir Y!" affiché au reopen via la phase 'helditem_msg'. Même pattern
 *  de réouverture que `OpenPartyScreenForItemUse`. */
function _reopenPartyMenuCore(): void {
  _slotId = _giveHoldItemSlot >= 0 ? _giveHoldItemSlot : 0;
  _menuType = PARTY_MENU_TYPE_FIELD;  // round-trip DONNER = flux field uniquement
  _partyAction = PARTY_ACTION_CHOOSE_MON;
  _giveHoldItemSlot = -1;
  const returnCb = _giveReturnCb;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = returnCb ?? null;
    rt.SetMainCallback2(CB2_InitPartyMenu);
  }).catch((e) => { console.error('[party-screen] reopen-give preload failed', e); });
}

/** Reopen + message "X doit tenir Y!" (1:1 Task_GiveHoldItem). */
function _reopenPartyForGive(msg: string | null): void {
  _pendingGiveMessage = msg;
  _reopenPartyMenuCore();
}

/** Reopen + prompt d'échange (1:1 Task_SwitchHoldItemsPrompt — mon tient déjà un objet). */
function _reopenPartyForSwitch(): void {
  _pendingSwitchPrompt = true;
  _reopenPartyMenuCore();
}

/** 1:1 décomp `Task_SwitchHoldItemsPrompt`→`Task_SwitchItemsYesNo` (party_menu.c:3146) :
 *  DisplayAlreadyHoldingItemSwitchMessage("X tient déjà Y! Echanger les deux objets?")
 *  + PartyMenuDisplayYesNoMenu. */
function _showSwitchHoldItemsPrompt(): void {
  const mon = gPlayerParty[_slotId];
  _itemUsedMsgText = (getString('gText_PkmnAlreadyHoldingItemSwitch') || '')
    .replace('{STR_VAR_1}', mon?.nickname ?? '')
    .replace('{STR_VAR_2}', GetItemName(_giveOldItem))
    .replace(/\\p/g, ' ').replace(/\{[^}]*\}/g, '').replace(/\\n/g, '\n');
  _phase = 'switch_items_yesno';
  _drawMsg();
  PartyMenuDisplayYesNoMenu();
}

// ═══════════════════════════════════════════════════════════════════════════
// GIVE-FROM-BAG (#12) — donner un objet du SAC à un mon (bag→party).
// 1:1 décomp party_menu.c:5359-5528. Entrée depuis item_menu.c:ItemMenu_Give
// (gBagMenu->newScreenCallback = CB2_ChooseMonToGiveItem ; Task_FadeAndCloseBagMenu).
// RÉUTILISE l'infra DONNER (GiveItemToMon, _showSwitchHoldItemsPrompt, phase
// 'switch_items_yesno') ; seule la CONTINUATION change : close→sac via la phase
// partagée 'item_used_msg' (au lieu de retour choix-mon), aiguillée par _giveFromBag.
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `CB2_ChooseMonToGiveItem` (party_menu.c:5359) :
 *    InitPartyMenu(FIELD, SINGLE, PARTY_ACTION_GIVE_ITEM, FALSE,
 *                  PARTY_MSG_GIVE_TO_WHICH_MON, Task_HandleChooseMonInput, CB2_ReturnToBagMenu);
 *    gPartyMenu.bagItem = gSpecialVar_ItemId;
 *  (Battle Pyramid bag non porté → toujours CB2_ReturnToBagMenu.) */
export function CB2_ChooseMonToGiveItem(): void {
  _partyBagItem = (gSpecialVar.ItemId as number) | 0;   // 1:1 gPartyMenu.bagItem
  OpenPartyScreenForGiveItem(CB2_ReturnToBagMenu);
}

/** Ouvre le party menu en mode GIVE_ITEM (« Donner à quel POKéMON ? »). Même
 *  pattern que OpenPartyScreenForItemUse mais PARTY_ACTION_GIVE_ITEM + flag
 *  _giveFromBag (aiguille la continuation vers close→sac). */
function OpenPartyScreenForGiveItem(returnBagCb: CB2Callback): void {
  if (_isOpen) return;
  _partyAction = PARTY_ACTION_GIVE_ITEM;
  _giveFromBag = true;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = returnBagCb;
    rt.SetMainCallback2(CB2_InitPartyMenu);
  }).catch((e) => { console.error('[party-screen] give-item preload failed', e); });
}

/** 1:1 décomp `CB2_ReturnToBagMenu` (party_menu.c:4276) :
 *    GoToBagMenu(ITEMMENULOCATION_LAST, POCKETS_COUNT, NULL);
 *  (LAST = restaure la poche/curseur du sac tels quels.) */
function CB2_ReturnToBagMenu(): void {
  GoToBagMenu(ITEMMENULOCATION_LAST, POCKETS_COUNT, null);
}

/** 1:1 décomp `TryGiveItemOrMailToSelectedMon` (party_menu.c:5366), appelé au A
 *  sur un mon en mode GIVE_ITEM. Selon l'objet DÉJÀ tenu par le mon :
 *    - aucun          → GiveItemOrMailToSelectedMon (donne directement).
 *    - une LETTRE      → DisplayItemMustBeRemovedFirstMessage (refus).
 *    - un autre objet → prompt d'échange (phase 'switch_items_yesno'). */
function TryGiveItemOrMailToSelectedMon(): void {
  const mon = gPlayerParty[_slotId];
  const held = mon ? mon.heldItem : 0;    // 1:1 sPartyMenuItemId = MON_DATA_HELD_ITEM
  _giveOldItem = held;
  if (held === 0) {
    GiveItemOrMailToSelectedMon();
  } else if (ItemIsMail(held)) {
    DisplayItemMustBeRemovedFirstMessage();
  } else {
    // 1:1 :5379 DisplayAlreadyHoldingItemSwitchMessage + Task_SwitchItemsFromBagYesNo.
    _giveNewItem = _partyBagItem;
    _showSwitchHoldItemsPrompt();   // phase 'switch_items_yesno' (continuation via _giveFromBag).
  }
}

/** 1:1 décomp `GiveItemOrMailToSelectedMon` (party_menu.c:5384) : LETTRE → retirer
 *  du sac + fermer le party menu vers CB2_WriteMailToGiveMonFromBag (ouvre l'easy-chat
 *  d'écriture) ; sinon → GiveItemToSelectedMon. */
function GiveItemOrMailToSelectedMon(): void {
  if (ItemIsMail(_partyBagItem)) {
    RemoveItemToGiveFromBag(_partyBagItem);
    _partyTransientExitCb = CB2_WriteMailToGiveMonFromBag;
    ClosePartyScreen();  // = Task_ClosePartyMenu (handoff → CB2_WriteMailToGiveMonFromBag)
  } else {
    GiveItemToSelectedMon();
  }
}

/** 1:1 décomp `RemoveItemToGiveFromBag` (party_menu.c:5522) : GIVE_PC_ITEM jamais
 *  atteint (unused) → RemoveBagItem. */
function RemoveItemToGiveFromBag(item: number): void {
  RemoveBagItem(GetBagItemKey(item), 1);  // clé SAC (TM/HM enum-numbered → move-named)
}

/** 1:1 décomp `ReturnGiveItemToBagOrPC` (party_menu.c:5532) : GIVE_ITEM → AddBagItem. */
function ReturnGiveItemToBagOrPC(item: number): boolean {
  return AddBagItem(GetBagItemKey(item), 1);  // clé SAC (TM/HM enum-numbered → move-named)
}

// État de gate pour l'ouverture de l'easy-chat depuis CB2_WriteMailToGiveMonFromBag
// (adaptation web : chargement gfx async avant l'init synchrone de DoEasyChatScreen).
let _mailWriteGateState = 0;

/** 1:1 décomp `CB2_WriteMailToGiveMonFromBag` (party_menu.c:5423) : donne la lettre
 *  au mon (alloue le slot mail) puis DoEasyChatScreen(MAIL, mail.words, retour).
 *  Gate : on attend le préchargement gfx easy-chat avant l'init sync (sinon freeze). */
function CB2_WriteMailToGiveMonFromBag(): void {
  const mon = gPlayerParty[_slotId];
  if (!mon) return;
  if (_mailWriteGateState === 0) {
    GiveItemToMon(mon, _partyBagItem);            // alloue mon.mail (slot)
    _mailWriteGateState = 1;
    const mailId = mon.mail;                       // GetMonData(MON_DATA_MAIL)
    void easyChatGfxReady().then(() => {
      _mailWriteGateState = 0;
      DoEasyChatScreen(
        EASY_CHAT_TYPE_MAIL,
        gSaveBlock1Ptr.mail[mailId].words,
        CB2_ReturnToPartyOrBagMenuFromWritingMail,
        EASY_CHAT_PERSON_DISPLAY_NONE,
      );
    });
  }
  // état 1 : gfx en chargement → on attend (ce CB2 re-fire jusqu'au swap DoEasyChatScreen).
}

/** 1:1 décomp `CB2_ReturnToPartyOrBagMenuFromWritingMail` (party_menu.c:5436) :
 *  annulé (Result==0) → reprendre la lettre du mon + la rendre au sac + retour sac ;
 *  écrit → rouvrir le party menu + message "X doit tenir la LETTRE". */
function CB2_ReturnToPartyOrBagMenuFromWritingMail(): void {
  const mon = gPlayerParty[_slotId];
  if (!mon) return;
  const item = mon.heldItem;  // GetMonData(MON_DATA_HELD_ITEM) = la lettre donnée
  if (gSpecialVar.Result === 0) {
    // Écriture annulée : reprendre la lettre, la remettre dans le sac.
    TakeMailFromMon(mon);
    mon.heldItem = _giveOldItem;  // SetMonData(HELD_ITEM, sPartyMenuItemId = ancien objet)
    if (_giveOldItem !== 0) RemoveBagItem(GetBagItemKey(_giveOldItem), 1);  // clé SAC
    ReturnGiveItemToBagOrPC(item);  // rend la lettre au sac
    const rt = getRuntime();
    rt?.SetMainCallback2((_giveReturnCb ?? null) as never);
  } else {
    // Lettre écrite : rouvrir le party + message "X doit tenir la LETTRE" (1:1
    // Task_DisplayGaveMailFromBagMessage → DisplayGaveHeldItemMessage, sPartyMenuItemId=0).
    const mon2 = gPlayerParty[_slotId];
    const msg = _preparePartyMsg(getString('gText_PkmnWasGivenItem') || '',
      mon2?.nickname ?? '', GetItemName(_partyBagItem));
    _reopenPartyForGive(msg);
  }
}

/** 1:1 décomp `GiveItemToSelectedMon` (party_menu.c:5398) : DisplayGaveHeldItem
 *  Message("X doit tenir Y!") + GiveItemToMon + RemoveBagItem → close→sac. */
function GiveItemToSelectedMon(): void {
  const mon = gPlayerParty[_slotId];
  const item = _partyBagItem;
  if (!mon) return;
  // 1:1 DisplayGaveHeldItemMessage (gText_PkmnWasGivenItem = "X doit tenir Y!").
  _itemUsedMsgText = _preparePartyMsg(getString('gText_PkmnWasGivenItem') || '',
    mon.nickname, GetItemName(item));
  GiveItemToMon(mon, item);
  RemoveBagItem(GetBagItemKey(item), 1);  // clé SAC (TM/HM enum-numbered → move-named)
  _updatePartyMonHeldItem(_slotId);   // 1:1 UpdatePartyMonHeldItemSprite
  _phase = 'item_used_msg';           // A/B → Task_UpdateHeldItemSpriteAndClosePartyMenu (close→sac).
  _drawMsg();
}

/** 1:1 décomp `DisplayItemMustBeRemovedFirstMessage` (party_menu.c:5515) :
 *    "Il faut enlever la LETTRE pour pouvoir garder un objet." → close→sac. */
function DisplayItemMustBeRemovedFirstMessage(): void {
  _itemUsedMsgText = _preparePartyMsg(getString('gText_RemoveMailBeforeItem') || '');
  _phase = 'item_used_msg';
  _drawMsg();
}

/** 1:1 décomp `CursorCb_Cancel1` (party_menu.c:3062-3072) : ferme le menu d'action
 *  et retourne au choix du mon.
 *    PlaySE(SE_SELECT);                                     ← joué par le dispatch
 *    PartyMenuRemoveWindow(&windowId[0]);   → _actionWindowId (fenêtre de sélection)
 *    PartyMenuRemoveWindow(&windowId[1]);   → fenêtre message (gérée par _drawMsg)
 *    if (DAYCARE) DisplayPartyMenuStdMessage(CHOOSE_MON_2) else (CHOOSE_MON);  → _drawMsg
 *    gTasks[taskId].func = Task_HandleChooseMonInput;       → _phase = 'open'
 *  (_drawMsg gère la variante DAYCARE = gText_ChoosePokemon2, cf. party_menu.ts:1417.) */
function CursorCb_Cancel1(taskId: number): void {
  if (_actionWindowId >= 0) {
    // 1:1 décomp PartyMenuRemoveWindow : clear frame border avant remove.
    ClearStdWindowAndFrame(_actionWindowId, false);
    CopyWindowToVram(_actionWindowId, 3);
    RemoveWindow(_actionWindowId);
    _actionWindowId = -1;
  }
  _actionList = [];
  _actionCursor = 0;
  _phase = 'open';
  // Re-render dialog avec "Choisir un POKéMON." après fermeture action menu.
  _drawMsg();
}

// ─── Option ORDRE : permutation de 2 mons (1:1 décomp party_menu.c) ──────────
// INCRÉMENT 1 : couche data/SE/flux 1:1 (CursorCb_Switch + SwitchSelectedMons
// + SwitchPartyMon + FinishTwoMonAction). L'anim slide (Task_SlideSelectedSlots
// *) = INCRÉMENT 2 : ici le swap est appliqué immédiatement (état final
// IDENTIQUE au décomp, sans la transition glissée). PAS un demi-port : la
// décomp sépare elle-même SwitchPartyMon (data) des Task_Slide* (visuel).

/** 1:1 décomp `CursorCb_Switch` (party_menu.c:2797-2807). SE_SELECT déjà
 *  joué au press A dans Task_HandleSelectionMenuInput (= PlaySE 1:1). */
function CursorCb_Switch(taskId: number): void {
  _partyAction = PARTY_ACTION_SWITCH;
  // 1:1 PartyMenuRemoveWindow(selection) + PartyMenuRemoveWindow(doWhat) :
  // notre action window (+ msg window via _drawMsg qui retire l'ancien).
  if (_actionWindowId >= 0) {
    ClearStdWindowAndFrame(_actionWindowId, false);
    CopyWindowToVram(_actionWindowId, 3);
    RemoveWindow(_actionWindowId);
    _actionWindowId = -1;
  }
  _actionList = [];
  _actionCursor = 0;
  _phase = 'open';
  AnimatePartySlot(_slotId, 1);          // 1:1 :2804
  _slotId2 = _slotId;                    // 1:1 :2805 (1er mon mémorisé)
  _drawMsg();                            // 1:1 DisplayPartyMenuStdMessage(MOVE_TO_WHERE)
}

/** 1:1 décomp `SwitchMenuBoxSprites` (party_menu.c:2995-3014) : échange les
 *  2 ids sprite ET leurs x/y/x2/y2 (les sprites suivent visuellement le swap
 *  de données). Adapté à notre modèle 2-sprites/box (pokeball + icône) ;
 *  item/statut sont rendus dans la window slot (re-dessinés par _drawSlot). */
function _switchMenuBoxSprites(arr: number[], i: number, j: number): void {
  const rt = getRuntime();
  const a = arr[i], b = arr[j];
  arr[i] = b; arr[j] = a;
  if (!rt) return;
  const sa = rt.gSprites[arr[i]];   // = ex-b
  const sb = rt.gSprites[arr[j]];   // = ex-a
  if (!sa || !sb) return;
  const x1 = sa.x, y1 = sa.y, x2 = sa.x2, y2 = sa.y2;
  sa.x = sb.x; sa.y = sb.y; sa.x2 = sb.x2; sa.y2 = sb.y2;
  sb.x = x1; sb.y = y1; sb.x2 = x2; sb.y2 = y2;
}

/** 1:1-NET décomp `SwitchMenuBoxSprites(&menuBoxes[0]->monSpriteId,
 *  &menuBoxes[1]->monSpriteId)` (party_menu.c:3033). Décomp : le sprite
 *  d'icône POSSÈDE son graphique (CreateMonIcon alloue ses propres tiles) →
 *  swapper les ids déplace l'icône AVEC le mon. NOTRE modèle : l'icône est
 *  SLOT-PINNED — `_updateMonIconFrame(slot)` force `oam.tileId =
 *  slot*ICON_TILES_PER_SLOT` CHAQUE frame (party-screen.ts:1182-1183) et le
 *  graphique objVram + la palette obj sont chargés à un offset indexé par
 *  SLOT (:980/:992). Le swap d'ids sprite ne déplace donc RIEN (re-pinné au
 *  slot l'instant d'après). L'équivalent NET du swap décomp = échanger
 *  l'état SLOT-OWNED de l'icône : tiles objVram du slot + palette obj +
 *  compteurs d'anim. (Bug A/B 2026-05-19 : sans ça "le sprite change pas,
 *  la palette si" — l'icône restait figée au slot.) */
function _switchSlotIconGraphics(s1: number, s2: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1) Tiles objVram : ICON_TILES_PER_SLOT*32 = 1024 octets / slot.
  const BYTES_PER_SLOT = ICON_TILES_PER_SLOT * 32;
  const off1 = (ICON_OBJ_TILE_OFFSET / 32 + s1 * ICON_TILES_PER_SLOT) * 32;
  const off2 = (ICON_OBJ_TILE_OFFSET / 32 + s2 * ICON_TILES_PER_SLOT) * 32;
  const vram = rt.gba.objVram;
  const tmp1 = new Uint8Array(BYTES_PER_SLOT);
  const tmp2 = new Uint8Array(BYTES_PER_SLOT);
  for (let k = 0; k < BYTES_PER_SLOT; k++) { tmp1[k] = vram[off1 + k]; tmp2[k] = vram[off2 + k]; }
  for (let k = 0; k < BYTES_PER_SLOT; k++) { vram[off1 + k] = tmp2[k]; vram[off2 + k] = tmp1[k]; }
  // 2) Palette obj du slot (bank ICON_OBJ_PAL_BASE+slot, 16 entries u16 @
  //    gPlttBuffer[256 + bank*16]). Swap Unfaded ET Faded (1:1 LoadPalette).
  const p1 = 256 + (ICON_OBJ_PAL_BASE + s1) * 16;
  const p2 = 256 + (ICON_OBJ_PAL_BASE + s2) * 16;
  for (const buf of [rt.gPlttBufferUnfaded, rt.gPlttBufferFaded]) {
    for (let i = 0; i < 16; i++) {
      const a = buf.get(p1 + i);
      buf.set(p1 + i, buf.get(p2 + i));
      buf.set(p2 + i, a);
    }
  }
  // 3) Compteurs d'anim idle du slot (suivent le mon → frame cohérente).
  const swap = (arr: number[]) => { const t = arr[s1]; arr[s1] = arr[s2]; arr[s2] = t; };
  swap(_iconAnimDelay); swap(_iconAnimCmdIdx);
}

/** 1:1 décomp `SwitchPartyMon` (party_menu.c:3016-3035) : swap mon1 ↔ mon2
 *  dans gPlayerParty (= gSaveBlock1Ptr.playerParty) + SwitchMenuBoxSprites (pokeball +
 *  icône ; item/statut = window, re-dessinés). */
function SwitchPartyMon(): void {
  // 1:1 décomp SwitchPartyMon (party_menu.c:3025-3030) : swap le CONTENU des 2
  // slots gPlayerParty (la SOURCE). La façade block1.playerParty (vues sur les
  // objets-slots) reflète le swap automatiquement.
  SwitchPartyMonSlots(_slotId, _slotId2);
  _switchMenuBoxSprites(_pokeballOamBySlot, _slotId, _slotId2);  // 1:1 :3031
  // ROOT CAUSE (bug A/B 2026-05-19) : la décomp fait
  // `SwitchMenuBoxSprites(&menuBoxes[0]->monSpriteId, &menuBoxes[1]->
  // monSpriteId)` (party_menu.c:3033) car là le sprite POSSÈDE son
  // graphique. Chez NOUS l'icône est SLOT-PINNED : `_setIconFrame(slot)`
  // (party-screen.ts:1177-1184) force `oam.tileId = slot*ICON_TILES_PER_
  // SLOT` à CHAQUE frame pour `_iconOamBySlot[slot]` → l'icône affichée
  // à un slot = TOUJOURS objVram[région slot], quel que soit le sprite
  // qui y est. Donc swapper les ids sprite (`_switchMenuBoxSprites(
  // _iconOamBySlot,…)`) ne déplace PAS le graphique (re-pinné au slot
  // l'instant d'après) ET corrompt les positions par slot. L'équivalent
  // 1:1-NET = swapper UNIQUEMENT l'état slot-owned (tiles objVram +
  // palette obj + compteurs anim), SANS toucher aux ids/positions sprite.
  _switchSlotIconGraphics(_slotId, _slotId2);
  // _iconMode (slot sélectionné) est ré-appliqué par AnimatePartySlot
  // dans FinishTwoMonAction ; _iconAnimNum reste 0 en party (sAnim_0,
  // party_menu.c ne StartSpriteAnim jamais le monSpriteId).
}

/** 1:1 décomp `FinishTwoMonAction` (party_menu.c:3038-3047). */
function _finishTwoMonAction(): void {
  _partyAction = PARTY_ACTION_CHOOSE_MON;     // 1:1 :3041
  AnimatePartySlot(_slotId, 0);               // 1:1 :3042
  _slotId = _slotId2;                         // 1:1 :3043
  AnimatePartySlot(_slotId2, 1);              // 1:1 :3044
  _phase = 'open';
  _drawMsg();                                 // 1:1 DisplayPartyMenuStdMessage(CHOOSE_MON)
}

// ─── INCRÉMENT 2 : anim slide 1:1 (party_menu.c:2809-2993) ──────────────────
// Le décomp ne swappe PAS instantanément : il (1) capture la région BG tilemap
// des 2 box dans des buffers, (2) ClearWindowTilemap, (3) glisse les box hors
// écran (tilemap décalé + sprites x2+=dir*8) frame par frame, (4) à mi-course
// SwitchPartyMon + DisplayPartyPokemonData×2 (= contenu échangé) + re-capture,
// (5) glisse les box de retour, (6) FinishTwoMonAction. Notre box = window
// composé dans bg.tilemap (PutWindowTilemap à l'init) → modèle 1:1 net.

// État slide 1:1 décomp `tSlot*` (party_menu.c:2809-2820, données de la task).
let _sSlot1Buf: Uint16Array | null = null;
let _sSlot2Buf: Uint16Array | null = null;
let _t1Left = 0, _t1Top = 0, _t1W = 0, _t1H = 0;
let _t2Left = 0, _t2Top = 0, _t2W = 0, _t2H = 0;
let _t1Off = 0, _t2Off = 0, _t1Dir = 0, _t2Dir = 0;
/** task func courante pendant `_phase==='switching'` (= gTasks[].func du
 *  décomp qui alterne SwitchSelectedMons→SlideOffscreen→SlideOnscreen). */
let _slideTaskFn: (() => void) | null = null;

/** 1:1 décomp `DisplayPartyPokemonData` (party_menu.c:872-889) : blitFunc box
 *  (variante NoHP si œuf, = EFFACE la zone) PUIS les text printers. Notre
 *  équivalent exact = _drawSlotFrame + _drawSlot (paire documentée _drawAllSlots
 *  :604). Sans le frame : ancien texte non-effacé + variante œuf périmée. */
function DisplayPartyPokemonData(slot: number): void {
  _drawSlotFrame(slot);
  _drawSlot(slot);
}

/** 1:1 décomp `TryMovePartySlot(x, width, *leftMove, *newX, *newWidth)`
 *  (party_menu.c:2869-2893) : clippe le rect du slot aux bornes écran [0,31].
 *  Renvoie null = FALSE (slot entièrement hors écran). */
function _tryMovePartySlot(x: number, width: number): { leftMove: number; newX: number; newWidth: number } | null {
  if (x + width < 0) return null;
  if (x > 31) return null;
  if (x < 0) return { leftMove: -x, newX: 0, newWidth: width + x };
  return { leftMove: 0, newX: x, newWidth: (x + width > 31) ? 32 - x : width };
}

/** 1:1 décomp `MoveAndBufferPartySlot` (party_menu.c:2895-2905) : efface le
 *  footprint courant (FillBgTilemapBufferRect_Palette0) puis re-stampe le
 *  buffer capturé à la position suivante (x+dir) via CopyRectToBgTilemapBufferRect
 *  (palette1=17 = copie verbatim des entries). */
function _moveAndBufferPartySlot(rectSrc: Uint16Array, x: number, y: number, width: number, height: number, dir: number): void {
  const r = _tryMovePartySlot(x, width);
  if (!r) return;
  FillBgTilemapBufferRect_Palette0(0, 0, r.newX, y, r.newWidth, height);
  const r2 = _tryMovePartySlot(x + dir, width);
  if (r2) {
    CopyRectToBgTilemapBufferRect(0, rectSrc, r2.leftMove, 0, width, height, r2.newX, y, r2.newWidth, height, 17, 0, 0);
  }
}

/** 1:1 décomp `MovePartyMenuBoxSprites` (party_menu.c:2907-2913) : décale les
 *  sprites du box de `offset*8` px (x2). Décomp = 4 sprites ; notre modèle =
 *  4 sprites (pokeball + icône + statut + objet tenu) = 1:1 net. */
function _movePartyMenuBoxSprites(slot: number, offset: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const pk = rt.gSprites[_pokeballOamBySlot[slot]];
  const ic = rt.gSprites[_iconOamBySlot[slot]];
  const st = rt.gSprites[_statusOamBySlot[slot]];
  const it = rt.gSprites[_itemOamBySlot[slot]];
  if (pk) pk.x2 += offset * 8;
  if (ic) ic.x2 += offset * 8;
  if (st) st.x2 += offset * 8;   // 1:1 :2912 statusSpriteId.x2 += offset*8
  if (it) it.x2 += offset * 8;   // 1:1 :2910 itemSpriteId.x2 += offset*8
}

/** 1:1 décomp `SlidePartyMenuBoxSpritesOneStep` (party_menu.c:2915-2923). */
function _slidePartyMenuBoxSpritesOneStep(): void {
  if (_t1Dir !== 0) _movePartyMenuBoxSprites(_slotId, _t1Dir);
  if (_t2Dir !== 0) _movePartyMenuBoxSprites(_slotId2, _t2Dir);
}

/** 1:1 décomp `SlidePartyMenuBoxOneStep` (party_menu.c:2925-2934). */
function _slidePartyMenuBoxOneStep(): void {
  if (_t1Dir !== 0 && _sSlot1Buf) _moveAndBufferPartySlot(_sSlot1Buf, _t1Left + _t1Off, _t1Top, _t1W, _t1H, _t1Dir);
  if (_t2Dir !== 0 && _sSlot2Buf) _moveAndBufferPartySlot(_sSlot2Buf, _t2Left + _t2Off, _t2Top, _t2W, _t2H, _t2Dir);
  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 décomp `Task_SlideSelectedSlotsOffscreen` (party_menu.c:2936-2964). ÉCART
 *  port : la task func courante est portée par `_slideTaskFn` (= gTasks[taskId].func
 *  du décomp) au lieu de gTasks[taskId].func ; signature no-arg (état slide en
 *  module-scope `_t*`). */
function Task_SlideSelectedSlotsOffscreen(): void {
  _slidePartyMenuBoxOneStep();
  _slidePartyMenuBoxSpritesOneStep();
  _t1Off += _t1Dir;
  _t2Off += _t2Dir;
  // 1:1 décomp :2939 `u16 slidingSlotPositions[2]` — sémantique UNSIGNED : la
  // box gauche (largeur 10, dir -1) fait UNDERFLOW (1+(-N) → ~0xFFFF) donc
  // > 33 = TRUE : c'est AINSI que la décomp détecte sa sortie par la gauche.
  // Le masque & 0xFFFF est OBLIGATOIRE (sinon -N reste négatif, jamais >33).
  const p0 = (_t1Left + _t1Off) & 0xFFFF;
  const p1 = (_t2Left + _t2Off) & 0xFFFF;
  if (p0 > 33 && p1 > 33) {
    _t1Dir *= -1;
    _t2Dir *= -1;
    SwitchPartyMon();
    DisplayPartyPokemonData(_slotId);
    DisplayPartyPokemonData(_slotId2);
    PutWindowTilemap(_slotWindowIds[_slotId]);
    PutWindowTilemap(_slotWindowIds[_slotId2]);
    if (_sSlot1Buf) CopyToBufferFromBgTilemap(0, _sSlot1Buf, _t1Left, _t1Top, _t1W, _t1H);
    if (_sSlot2Buf) CopyToBufferFromBgTilemap(0, _sSlot2Buf, _t2Left, _t2Top, _t2W, _t2H);
    ClearWindowTilemap(_slotWindowIds[_slotId]);
    ClearWindowTilemap(_slotWindowIds[_slotId2]);
    _slideTaskFn = Task_SlideSelectedSlotsOnscreen;
  }
}

/** 1:1 décomp `Task_SlideSelectedSlotsOnscreen` (party_menu.c:2966-2993). ÉCART
 *  port : task func portée par `_slideTaskFn` ; signature no-arg (état slide en
 *  module-scope `_t*`). */
function Task_SlideSelectedSlotsOnscreen(): void {
  _slidePartyMenuBoxOneStep();
  _slidePartyMenuBoxSpritesOneStep();
  if (_t1Dir === 0 && _t2Dir === 0) {
    PutWindowTilemap(_slotWindowIds[_slotId]);
    PutWindowTilemap(_slotWindowIds[_slotId2]);
    ScheduleBgCopyTilemapToVram(0);
    _sSlot1Buf = null;            // 1:1 Free(sSlot1TilemapBuffer)
    _sSlot2Buf = null;            // 1:1 Free(sSlot2TilemapBuffer)
    _slideTaskFn = null;
    _finishTwoMonAction();        // remet _phase='open', _partyAction=CHOOSE_MON
  } else {
    _t1Off += _t1Dir;
    _t2Off += _t2Dir;
    if (_t1Off === 0) _t1Dir = 0;
    if (_t2Off === 0) _t2Dir = 0;
  }
}

/** 1:1 décomp `SwitchSelectedMons` (party_menu.c:2822-2866). Même slot →
 *  FinishTwoMonAction (annule, :2827-2830). Sinon : setup buffers + capture
 *  tilemap + ClearWindowTilemap + PARTY_ACTION_SWITCHING + AnimatePartySlot×2
 *  + 1er SlidePartyMenuBoxOneStep, puis task → SlideSelectedSlotsOffscreen. */
function _switchSelectedMons(): void {
  if (_slotId2 === _slotId) {
    _finishTwoMonAction();
    return;
  }
  const w0 = _slotWindowIds[_slotId];
  _t1Left = GetWindowAttribute(w0, WINDOW_TILEMAP_LEFT);
  _t1Top  = GetWindowAttribute(w0, WINDOW_TILEMAP_TOP);
  _t1W    = GetWindowAttribute(w0, WINDOW_WIDTH);
  _t1H    = GetWindowAttribute(w0, WINDOW_HEIGHT);
  _t1Off = 0;
  _t1Dir = (_t1W === 10) ? -1 : 1;   // 1:1 :2840 (box gauche large 10 → -1)
  const w1 = _slotWindowIds[_slotId2];
  _t2Left = GetWindowAttribute(w1, WINDOW_TILEMAP_LEFT);
  _t2Top  = GetWindowAttribute(w1, WINDOW_TILEMAP_TOP);
  _t2W    = GetWindowAttribute(w1, WINDOW_WIDTH);
  _t2H    = GetWindowAttribute(w1, WINDOW_HEIGHT);
  _t2Off = 0;
  _t2Dir = (_t2W === 10) ? -1 : 1;
  // 1:1 :2854 Alloc(width * (height<<1)) = width*height u16 entries.
  _sSlot1Buf = new Uint16Array(_t1W * _t1H);
  _sSlot2Buf = new Uint16Array(_t2W * _t2H);
  CopyToBufferFromBgTilemap(0, _sSlot1Buf, _t1Left, _t1Top, _t1W, _t1H);
  CopyToBufferFromBgTilemap(0, _sSlot2Buf, _t2Left, _t2Top, _t2W, _t2H);
  ClearWindowTilemap(w0);
  ClearWindowTilemap(w1);
  _partyAction = PARTY_ACTION_SWITCHING;
  AnimatePartySlot(_slotId, 1);
  AnimatePartySlot(_slotId2, 1);
  _slidePartyMenuBoxOneStep();
  _phase = 'switching';
  _slideTaskFn = Task_SlideSelectedSlotsOffscreen;
}

// ─── Field moves party-menu (1:1 décomp party_menu.c:3702+) ──────────────────
// Entrée party-menu des field moves (CursorCb_FieldMove). Complète les entrées
// par INTERACTION (A sur l'objet) déjà faites (Surf/Cascade/Plongée/Force/Coupe/
// Éclate-Roc) : ici on couvre Vol/Flash (pas d'entrée interaction) + les moves
// hors-combat (Téléport/Tunnel/Doux Parfum/Soin/Pouvoir Secret), et le doublon
// menu des HM.
//
// ⚠️ PIÈGE ESM : ce module UI n'importe PAS les gros modules field
// (player-avatar/field-effect) → import statique = TDZ au boot. Les helpers
// field sont appelés via globalThis (déjà exposés) : __PartyHasMonWithSurf,
// __IsPlayerFacingSurfableFishableWater, FieldEffectStart, gFieldEffectArguments.

/** 1:1 décomp enum FieldMove (include/constants/party_menu.h) — MÊME ordre que
 *  sFieldMoves/sFieldMoveMoveConstants. */
const FIELD_MOVE_CUT          = 0;
const FIELD_MOVE_FLASH        = 1;
const FIELD_MOVE_ROCK_SMASH   = 2;
const FIELD_MOVE_STRENGTH     = 3;
const FIELD_MOVE_SURF         = 4;
const FIELD_MOVE_FLY          = 5;
const FIELD_MOVE_DIVE         = 6;
const FIELD_MOVE_WATERFALL    = 7;
const FIELD_MOVE_TELEPORT     = 8;
const FIELD_MOVE_DIG          = 9;
// (SECRET_POWER=10 — branché au fur et à mesure de son port.)
const FIELD_MOVE_MILK_DRINK   = 11;
const FIELD_MOVE_SOFT_BOILED  = 12;
const FIELD_MOVE_SWEET_SCENT  = 13;

/** 1:1 décomp `FLDEFF_*` (field_effect.h) — const locales (pattern
 *  "FLDEFF_* locales par module" anti-cycle ESM field-effect). */
const FLDEFF_USE_SURF = 9;
const FLDEFF_SWEET_SCENT = 51;

/** 1:1 décomp `GetCursorSelectionMonId(void)` (party_menu.c:6221) = gPartyMenu.slotId.
 *  Menu fermé → valeur PERSISTÉE (le décomp ne reset pas gPartyMenu ; les specials
 *  pension GetSelectedMonNicknameAndSpecies/StoreSelectedPokemonInDaycare lisent
 *  le slot APRÈS la fermeture). Exportée + pont globalThis (daycare.ts — cycle ESM
 *  party_menu → overworld → script_pokemon_util → daycare). */
export function GetCursorSelectionMonId(): number {
  return _isOpen ? _slotId : _cursorSelectionMonId;
}
// Pont anti-cycle : le Vol (field_effect_helpers, StartFlyOutThenWarp) lit le mon qui connaît VOL.
(globalThis as Record<string, unknown>).__getCursorSelectionMonId = GetCursorSelectionMonId;

/** 1:1 décomp `GetFieldMoveMonSpecies(void)` (party_menu.c:3833) :
 *      return GetMonData(&gPlayerParty[gPartyMenu.slotId], MON_DATA_SPECIES); */
function GetFieldMoveMonSpecies(): number {
  return _slotMon(_slotId)?.species ?? 0;
}

/** Pose `gFieldEffectArguments[i]` (= le tableau lu par le dispatcher
 *  FieldEffectStart, exposé sur globalThis par script-opcodes-fieldeffect.ts). */
function _setFieldEffectArgument(i: number, value: number): void {
  const args = (globalThis as Record<string, unknown>).gFieldEffectArguments as number[] | undefined;
  if (args) args[i] = value;
}

/** 1:1 décomp `FieldCallback_Surf(void)` (party_menu.c:3852) :
 *      gFieldEffectArguments[0] = GetCursorSelectionMonId();
 *      FieldEffectStart(FLDEFF_USE_SURF); */
function FieldCallback_Surf(): void {
  _setFieldEffectArgument(0, GetCursorSelectionMonId());
  const start = (globalThis as Record<string, unknown>).FieldEffectStart as ((id: number) => void) | undefined;
  start?.(FLDEFF_USE_SURF);
}

/** 1:1 décomp `SetUpFieldMove_Surf(void)` (party_menu.c:3858) :
 *      if (PartyHasMonWithSurf() && IsPlayerFacingSurfableFishableWater()) {
 *          gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
 *          gPostMenuFieldCallback = FieldCallback_Surf;
 *          return TRUE;
 *      }
 *      return FALSE;
 *  Helpers field appelés via globalThis (anti-cycle ESM). */
function SetUpFieldMove_Surf(): boolean {
  const g = globalThis as Record<string, unknown>;
  const hasSurf = (g.__PartyHasMonWithSurf as (() => boolean) | undefined)?.() ?? false;
  const facing = (g.__IsPlayerFacingSurfableFishableWater as (() => boolean) | undefined)?.() ?? false;
  if (hasSurf && facing) {
    g.gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
    g.gPostMenuFieldCallback = FieldCallback_Surf;
    return true;
  }
  return false;
}

/** 1:1 décomp `SetUpFieldMove_Strength(void)` (fldeff_strength.c:18-28) :
 *      if (CheckObjectGraphicsInFrontOfPlayer(OBJ_EVENT_GFX_PUSHABLE_BOULDER) == TRUE) {
 *          gSpecialVar_Result = GetCursorSelectionMonId();
 *          gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
 *          gPostMenuFieldCallback = FieldCallback_Strength;
 *          return TRUE;
 *      }
 *      return FALSE;
 *  Helpers via globalThis (anti-cycle ESM, pattern Surf/Flash). */
function SetUpFieldMove_Strength(): boolean {
  const g = globalThis as Record<string, unknown>;
  const check = g.__CheckObjectGraphicsInFrontOfPlayer as ((gfx: string) => boolean) | undefined;
  if (check?.('OBJ_EVENT_GFX_PUSHABLE_BOULDER') === true) {
    VarSet(0x800D /* gSpecialVar_Result */, GetCursorSelectionMonId());
    g.gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
    g.gPostMenuFieldCallback = g.__FieldCallback_Strength as (() => void) | undefined;
    return true;
  }
  return false;
}

/** 1:1 décomp `SetUpFieldMove_Flash(void)` (fldeff_flash.c:73) :
 *      if (ShouldDoBrailleRegisteelEffect()) { ... }              // dette (tombe Registeel)
 *      else if (gMapHeader.cave == TRUE && !FlagGet(FLAG_SYS_USE_FLASH)) {
 *          gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
 *          gPostMenuFieldCallback = FieldCallback_Flash;
 *          return TRUE;
 *      }
 *      return FALSE;
 *  FieldCallback_Flash vit dans game/fldeff_flash.ts (exposé __FieldCallback_Flash,
 *  anti-cycle ESM). gMapHeader.cave = json.requires_flash. */
function SetUpFieldMove_Flash(): boolean {
  const g = globalThis as Record<string, unknown>;
  const hdr = g.gMapHeader as { cave?: boolean } | null | undefined;
  if (hdr?.cave === true && !FlagGet('FLAG_SYS_USE_FLASH')) {
    g.gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
    g.gPostMenuFieldCallback = g.__FieldCallback_Flash as (() => void) | undefined;
    return true;
  }
  return false;
}

/** 1:1 décomp `SetUpFieldMove_Teleport(void)` (fldeff_teleport.c:13) :
 *      if (Overworld_MapTypeAllowsTeleportAndFly(gMapHeader.mapType)) {
 *          gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
 *          gPostMenuFieldCallback = FieldCallback_Teleport;
 *          return TRUE;
 *      }
 *      return FALSE;
 *  mapType allows = ROUTE/TOWN/OCEAN_ROUTE/CITY (= extérieur). FieldCallback_Teleport
 *  vit dans game/fldeff_teleport.ts (exposé __FieldCallback_Teleport, anti-cycle). */
function SetUpFieldMove_Teleport(): boolean {
  const g = globalThis as Record<string, unknown>;
  const hdr = g.gMapHeader as { mapType?: string } | null | undefined;
  const mt = hdr?.mapType;
  const allows = mt === 'MAP_TYPE_ROUTE' || mt === 'MAP_TYPE_TOWN'
    || mt === 'MAP_TYPE_OCEAN_ROUTE' || mt === 'MAP_TYPE_CITY';
  if (allows) {
    g.gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
    g.gPostMenuFieldCallback = g.__FieldCallback_Teleport as (() => void) | undefined;
    return true;
  }
  return false;
}

/** 1:1 décomp `SetUpFieldMove_Fly(void)` (region_map.c) :
 *      if (Overworld_MapTypeAllowsTeleportAndFly(gMapHeader.mapType) == TRUE) return TRUE;
 *      return FALSE;
 *  Même gate map-type que Téléport (extérieur). Sur OUI, le case default de CursorCb_FieldMove
 *  ferme le menu → retour-field → `gPostMenuFieldCallback = FieldCallback_Fly` ouvre la carte
 *  région en mode FLY (game/fldeff_fly.ts, exposé __FieldCallback_Fly, anti-cycle ESM).
 *  ⚠️ déviation port : le décomp pose `gPartyMenu.exitCallback = CB2_OpenFlyMap` (swap CB2) ;
 *  notre carte région est un OVERLAY au-dessus de l'OW → on passe par gPostMenuFieldCallback
 *  (comme Téléport) qui ouvre l'overlay au retour-field. Résultat identique (carte Fly affichée). */
/** 1:1 décomp `SetUpFieldMove_Fly` (party_menu.c:3877-3883) : CHECK SEUL
 *  (Overworld_MapTypeAllowsTeleportAndFly). Le décomp ne pose AUCUN callback ici —
 *  le case FIELD_MOVE_FLY du dispatch (:3752-3755) ferme le party DIRECTEMENT vers
 *  CB2_OpenFlyMap (consolidation item 5 : l'ancienne voie gPostMenuFieldCallback →
 *  __FieldCallback_Fly / OpenRegionMap('FLY') est dissoute). */
function SetUpFieldMove_Fly(): boolean {
  const g = globalThis as Record<string, unknown>;
  const hdr = g.gMapHeader as { mapType?: string } | null | undefined;
  const mt = hdr?.mapType;
  return mt === 'MAP_TYPE_ROUTE' || mt === 'MAP_TYPE_TOWN'
    || mt === 'MAP_TYPE_OCEAN_ROUTE' || mt === 'MAP_TYPE_CITY';
}

/** 1:1 décomp `sPartyMenuYesNoWindowTemplate` (party_menu.h:518) : boîte Oui/Non
 *  à (21,9), 5×4, bg2, pal14. */
const PARTY_YESNO_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 2, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: 14, baseBlock: 0x2E9,
};

/** 1:1 décomp `PartyMenuDisplayYesNoMenu` (party_menu.c:2573) :
 *    CreateYesNoMenu(&sPartyMenuYesNoWindowTemplate, 0x4F, 13, 0). */
function PartyMenuDisplayYesNoMenu(): void {
  CreateYesNoMenu(PARTY_YESNO_WINDOW_TEMPLATE, 0x4F, 13, 0);
}

/** 1:1 décomp `DisplayFieldMoveExitAreaMessage` (party_menu.c:3782) : affiche le
 *  message (« Retourner au dernier lieu de soins? ») puis la boîte Oui/Non. Le
 *  printer du port est instantané → on crée la boîte directement. Phase
 *  'fieldmove_yesno' → tick Menu_ProcessInputNoWrapClearOnChoose. */
function _displayFieldMoveExitAreaMessage(stringKey: string, var1?: string): void {
  let raw = getString(stringKey) || '';
  if (var1 != null) raw = raw.replace('{STR_VAR_1}', var1);
  _itemUsedMsgText = raw.replace(/\{[^}]*\}/g, '').replace(/\\n/g, '\n');
  _phase = 'fieldmove_yesno';
  _drawMsg();
  PartyMenuDisplayYesNoMenu();
}

/** 1:1 décomp `SetUpFieldMove_Dig(void)` (fldeff_dig.c:17) :
 *      if (CanUseDigOrEscapeRopeOnCurMap()) {   // = gMapHeader.allowEscaping (item_use.c)
 *          gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
 *          gPostMenuFieldCallback = FieldCallback_Dig;
 *          return TRUE;
 *      }
 *      return FALSE;
 *  FieldCallback_Dig vit dans game/fldeff_dig.ts (exposé __FieldCallback_Dig). */
function SetUpFieldMove_Dig(): boolean {
  const g = globalThis as Record<string, unknown>;
  const hdr = g.gMapHeader as { allowEscaping?: boolean } | null | undefined;
  if (hdr?.allowEscaping === true) {
    g.gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
    g.gPostMenuFieldCallback = g.__FieldCallback_Dig as (() => void) | undefined;
    return true;
  }
  return false;
}

/** Nom FR du lieu d'évasion (escapeWarp) pour le message Dig. Le port stocke
 *  `__escapeWarp = {mapName, x, y}` (mapName sans préfixe MAP_) → on convertit en
 *  `MAPSEC_*` et on résout via GetMapNameGeneric (= map-names-fr.json). 1:1 décomp :
 *  GetMapNameGeneric(gStringVar1, mapHeader->regionMapSectionId) de l'escapeWarp.
 *  (Pour une ville d'entrée de donjon, MAP_X ↔ MAPSEC_X — exact ; cas exotiques
 *  → fallback nom vide.) */
function _escapeDestFriendlyName(): string {
  const esc = (globalThis as Record<string, unknown>).__escapeWarp as { mapName?: string } | undefined;
  const mapName = esc?.mapName ?? '';
  if (!mapName) return '';
  const mapsec = `MAPSEC_${mapName.replace(/^MAP_/, '')}`;
  return GetMapNameGeneric(null, mapsec) || '';
}

/** 1:1 décomp `FieldCallback_SweetScent(void)` (fldeff_sweetscent.c:33) :
 *      FieldEffectStart(FLDEFF_SWEET_SCENT);
 *      gFieldEffectArguments[0] = GetCursorSelectionMonId();
 *  (l'ordre décomp pose l'argument APRÈS le start — quirk inoffensif, répliqué.) */
function FieldCallback_SweetScent(): void {
  const start = (globalThis as Record<string, unknown>).FieldEffectStart as ((id: number) => void) | undefined;
  start?.(FLDEFF_SWEET_SCENT);
  _setFieldEffectArgument(0, GetCursorSelectionMonId());
}

/** 1:1 décomp `SetUpFieldMove_SweetScent(void)` (fldeff_sweetscent.c:26) :
 *      gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
 *      gPostMenuFieldCallback = FieldCallback_SweetScent;
 *      return TRUE;
 *  Doux Parfum est toujours utilisable (pas de condition de map/badge). */
function SetUpFieldMove_SweetScent(): boolean {
  const g = globalThis as Record<string, unknown>;
  g.gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
  g.gPostMenuFieldCallback = FieldCallback_SweetScent;
  return true;
}

// ─── Soin / E-Coque (Soft-Boiled / Milk Drink) — transfert PV intra-party ────
// 1:1 décomp fldeff_softboiled.c + party_menu.c (HandleChooseMonSelection cas
// PARTY_ACTION_SOFTBOILED). Entièrement interne au party menu : le mon
// sélectionné (= _slotId2, le DONNEUR) cède maxHP/5 PV à un autre mon choisi au
// curseur (= _slotId, le RECEVEUR). Convention curseur du port : le curseur bouge
// _slotId (receveur), _slotId2 reste fixe (donneur) — comme le mode SWITCH.

/** Montant de PV transféré (= maxHP_donneur/5), partagé entre l'étape -PV (donneur)
 *  et +PV (receveur). 1:1 décomp : les 2 PartyMenuModifyHP utilisent maxHP[slotId]/5. */
let _softboiledAmount = 0;
/** Continuation après ack (A/B) d'un message softboiled (phase 'softboiled_msg'). */
let _softboiledMsgOnAck: (() => void) | null = null;

/** Affiche un message softboiled FR (placeholders déjà résolus) puis attend A/B
 *  → exécute `onAck`. */
function _displaySoftboiledMessage(text: string, onAck: () => void): void {
  _itemUsedMsgText = text;
  _softboiledMsgOnAck = onAck;
  _phase = 'softboiled_msg';
  _drawMsg();
}

/** 1:1 décomp `SetUpFieldMove_SoftBoiled(void)` (fldeff_softboiled.c:18) :
 *      maxHp = MAX_HP(user); hp = HP(user);
 *      return (hp > maxHp / 5);   // assez de PV à donner */
function SetUpFieldMove_SoftBoiled(): boolean {
  const mon = _slotMon(_slotId);
  if (!mon) return false;
  return mon.hp > Math.floor(mon.maxHP / 5);
}

/** 1:1 décomp `ChooseMonForSoftboiled(u8 taskId)` (fldeff_softboiled.c:33) :
 *      gPartyMenu.action = PARTY_ACTION_SOFTBOILED;
 *      gPartyMenu.slotId2 = gPartyMenu.slotId;          // mémorise le DONNEUR
 *      AnimatePartySlot(GetCursorSelectionMonId(), 1);
 *      DisplayPartyMenuStdMessage(PARTY_MSG_USE_ON_WHICH_MON);
 *      gTasks[taskId].func = Task_HandleChooseMonInput;  // re-choix de mon
 *  L'action window a déjà été retirée par CursorCb_FieldMove. */
function ChooseMonForSoftboiled(): void {
  _partyAction = PARTY_ACTION_SOFTBOILED;
  _slotId2 = _slotId;               // 1:1 : slotId2 = DONNEUR (port : curseur = _slotId)
  AnimatePartySlot(_slotId, 1);
  _actionList = [];
  _actionCursor = 0;
  _phase = 'open';
  _drawMsg();                       // "Utiliser sur quel POKéMON?" (cf. _drawMsg)
}

/** 1:1 décomp `Task_FinishSoftboiled` (fldeff_softboiled.c:80) : reset action,
 *  curseur revient sur le donneur, message CHOOSE_MON, re-choix. */
function Task_FinishSoftboiled(): void {
  _partyAction = PARTY_ACTION_CHOOSE_MON;
  AnimatePartySlot(_slotId, 0);
  _slotId = _slotId2;               // 1:1 :88 slotId = slotId2 (retour sur le donneur)
  AnimatePartySlot(_slotId, 1);
  _phase = 'open';
  _drawMsg();
}

/** 1:1 décomp `Task_DisplayHPRestoredMessage` (fldeff_softboiled.c:71) :
 *      GetMonNickname(recipient, gStringVar1);
 *      StringExpandPlaceholders(gStringVar4, gText_PkmnHPRestoredByVar2);
 *      DisplayPartyMenuMessage(...); -> Task_FinishSoftboiled */
function Task_DisplayHPRestoredMessage(): void {
  const recipient = _slotMon(_slotId);
  const nick = recipient?.nickname ?? '';
  const raw = getString('gText_PkmnHPRestoredByVar2') || '';
  const msg = raw
    .replace('{STR_VAR_1}', nick)
    .replace('{STR_VAR_2}', String(_softboiledAmount))
    .replace(/\{[^}]*\}/g, '')
    .replace(/\\n/g, '\n');
  _displaySoftboiledMessage(msg, Task_FinishSoftboiled);
}

/** 1:1 décomp `Task_SoftboiledRestoreHealth` (fldeff_softboiled.c:64) :
 *      PlaySE(SE_USE_ITEM);   // audio skip
 *      PartyMenuModifyHP(taskId, slotId2 [receveur], +1, maxHP[slotId]/5, Task_DisplayHPRestoredMessage); */
function Task_SoftboiledRestoreHealth(): void {
  const recipient = _slotMon(_slotId);   // port : curseur = receveur
  if (!recipient) { Task_DisplayHPRestoredMessage(); return; }
  const newHp = Math.min(recipient.hp + _softboiledAmount, recipient.maxHP);
  PartyMenuAnimateHP(_slotId, recipient.hp, newHp, Task_DisplayHPRestoredMessage);
}

/** 1:1 décomp `CantUseSoftboiledOnMon` (fldeff_softboiled.c:111) :
 *      DisplayPartyMenuMessage(gText_CantBeUsedOnPkmn); -> Task_ChooseNewMonForSoftboiled
 *  (= re-affiche "Utiliser sur quel POKéMON?" et reste en mode SOFTBOILED). */
function CantUseSoftboiledOnMon(): void {
  const raw = getString('gText_CantBeUsedOnPkmn') || '';
  const msg = raw.replace(/\{[^}]*\}/g, '').replace(/\\n/g, '\n');
  _displaySoftboiledMessage(msg, () => { _phase = 'open'; _drawMsg(); });
}

/** 1:1 décomp `Task_TryUseSoftboiledOnPartyMon(u8 taskId)` (fldeff_softboiled.c:42).
 *  user = slotId (décomp) = _slotId2 (port, DONNEUR) ; recipient = slotId2 (décomp)
 *  = _slotId (port, curseur/RECEVEUR). Validation : receveur K.O. / == donneur /
 *  déjà au max → CantUse ; sinon -PV donneur puis +PV receveur. */
function Task_TryUseSoftboiledOnPartyMon(): void {
  const userId = _slotId2;        // DONNEUR
  const recipientId = _slotId;    // RECEVEUR (curseur)
  const user = _slotMon(userId);
  const recipient = _slotMon(recipientId);
  if (!user || !recipient) { CantUseSoftboiledOnMon(); return; }
  if (recipient.hp === 0 || userId === recipientId || recipient.maxHP === recipient.hp) {
    CantUseSoftboiledOnMon();
    return;
  }
  // PlaySE(SE_USE_ITEM) : skip (règle audio). amount = maxHP_donneur/5.
  _softboiledAmount = Math.floor(user.maxHP / 5);
  const userNewHp = Math.max(user.hp - _softboiledAmount, 0);
  // -PV donneur d'abord, puis +PV receveur (chaîne 1:1 via callbacks).
  PartyMenuAnimateHP(userId, user.hp, userNewHp, Task_SoftboiledRestoreHealth);
}

/** 1:1 décomp `Task_FieldMoveWaitForFade(u8 taskId)` (party_menu.c:3823) :
 *      if (IsWeatherNotFadingIn() == TRUE) {
 *          gFieldEffectArguments[0] = GetFieldMoveMonSpecies();
 *          gPostMenuFieldCallback();
 *          DestroyTask(taskId);
 *      }
 *  Port : attend la fin du palette fade (lancé par FieldCallback_PrepareFadeInFromMenu)
 *  puis lance le post-callback (= l'effet field). */
function Task_FieldMoveWaitForFade(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _setFieldEffectArgument(0, GetFieldMoveMonSpecies());
  const g = globalThis as Record<string, unknown>;
  const post = g.gPostMenuFieldCallback as (() => void) | undefined;
  g.gPostMenuFieldCallback = null;
  post?.();
  rt.DestroyTask(task.taskId);
}

/** 1:1 décomp `bool8 FieldCallback_PrepareFadeInFromMenu(void)` (party_menu.c:3816) :
 *      FadeInFromBlack();
 *      CreateTask(Task_FieldMoveWaitForFade, 8);
 *      return TRUE;
 *  Appelé via gFieldCallback2 par RunFieldCallback_Manual (case 2 du retour-field).
 *  Le party-close a fait FADE_TO_BLACK → on ré-allume (FROM_BLACK, pattern
 *  anti-flash de FieldCB_ReturnToFieldStartMenu) puis on attend la fin du fade. */
function FieldCallback_PrepareFadeInFromMenu(): boolean {
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
  getRuntime().CreateTask(Task_FieldMoveWaitForFade, 8);
  return true;
}

/** 1:1 décomp `SetUpFieldMove_Cut(void)` (fldeff_cut.c:138) — wrapper anti-cycle ESM : le corps
 *  (scan herbe 3×3/5×5 + check arbre devant + remplissage sHyperCutTiles) vit dans game/fldeff_cut.ts
 *  (`__SetUpFieldMove_Cut`, qui pose `gPostMenuFieldCallback = FieldCallback_CutTree|CutGrass`). Sur TRUE
 *  on pose `gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu` (même pattern que Strength/Flash). */
function SetUpFieldMove_Cut(): boolean {
  const g = globalThis as Record<string, unknown>;
  const fn = g.__SetUpFieldMove_Cut as (() => boolean) | undefined;
  if (fn?.() === true) {
    g.gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
    return true;
  }
  return false;
}

/** 1:1 décomp `sFieldMoveCursorCallbacks[FIELD_MOVES_COUNT]` (data/party_menu.h:770).
 *  {fieldMoveFunc, msgId}. msgId = clé string gText_* (≈ PARTY_MSG_*). Une entrée
 *  absente (fieldMoveFunc NULL) = field move pas encore porté en menu → early
 *  return dans CursorCb_FieldMove (1:1 avec `fieldMoveFunc == NULL`). */
interface FieldMoveCursorCallback {
  fieldMoveFunc: (() => boolean) | null;
  msgId: string;
}
const sFieldMoveCursorCallbacks: Record<number, FieldMoveCursorCallback> = {
  [FIELD_MOVE_CUT]:         { fieldMoveFunc: SetUpFieldMove_Cut,        msgId: 'gText_CantUseHere' },
  [FIELD_MOVE_STRENGTH]:    { fieldMoveFunc: SetUpFieldMove_Strength,   msgId: 'gText_CantUseHere' },
  [FIELD_MOVE_FLASH]:       { fieldMoveFunc: SetUpFieldMove_Flash,      msgId: 'gText_CantUseHere' },
  [FIELD_MOVE_SURF]:        { fieldMoveFunc: SetUpFieldMove_Surf,       msgId: 'gText_CantSurfHere' },
  [FIELD_MOVE_TELEPORT]:    { fieldMoveFunc: SetUpFieldMove_Teleport,   msgId: 'gText_CantUseHere' },
  [FIELD_MOVE_FLY]:         { fieldMoveFunc: SetUpFieldMove_Fly,        msgId: 'gText_CantUseHere' },
  [FIELD_MOVE_DIG]:         { fieldMoveFunc: SetUpFieldMove_Dig,        msgId: 'gText_CantUseHere' },
  [FIELD_MOVE_MILK_DRINK]:  { fieldMoveFunc: SetUpFieldMove_SoftBoiled, msgId: 'gText_NotEnoughHp' },
  [FIELD_MOVE_SOFT_BOILED]: { fieldMoveFunc: SetUpFieldMove_SoftBoiled, msgId: 'gText_NotEnoughHp' },
  [FIELD_MOVE_SWEET_SCENT]: { fieldMoveFunc: SetUpFieldMove_SweetScent, msgId: 'gText_CantUseHere' },
};

/** Affiche un message d'erreur field-move FR dans WIN_MSG puis attend A/B pour
 *  REVENIR au choix du mon (≈ décomp Task_ReturnToChooseMonAfterText /
 *  Task_CancelAfterAorBPress — ne FERME pas le menu, contrairement à
 *  item_used_msg). Strip des placeholders {…} (PAUSE_UNTIL_PRESS, etc.). */
function _displayFieldMoveErrorMessage(stringKey: string, cancelOnPress = false): void {
  // 1:1 texte décomp COMPLET. Deux continuations décomp distinctes :
  //   - badge manquant (gText_CantUseUntilNewBadge, AVEC {PAUSE_UNTIL_PRESS}) →
  //     Task_ReturnToChooseMonAfterText (:1745) = phase 'field_move_err' (ferme
  //     dès que le printer est inactif — le A est consommé par la pause) ;
  //   - « Impossible ici. » etc. (messages STD SANS pause, party_menu.c:3774-3777)
  //     → Task_CancelAfterAorBPress (:3838) = phase 'field_move_cancel' (attend
  //     un press A/B → CursorCb_Cancel1 = retour choix-mon).
  _itemUsedMsgText = _preparePartyMsg(getString(stringKey) || '');
  _phase = cancelOnPress ? 'field_move_cancel' : 'field_move_err';
  _drawMsg();
}

/** 1:1 décomp `void CursorCb_FieldMove(u8 taskId)` (party_menu.c:3702). Remplace
 *  le stub "dette R3". `action` = _actionList[_actionCursor] (>= MENU_FIELD_MOVES).
 *  Branche link/union-room sautée (port = solo). Switch cases spéciaux
 *  (TELEPORT/DIG/FLY/SOFT_BOILED) ajoutés avec leur SetUpFieldMove respectif. */
function CursorCb_FieldMove(rt: ReturnType<typeof getRuntime>, action: number): void {
  if (!rt) return;
  const fieldMove = action - MENU_FIELD_MOVES;
  // PlaySE(SE_SELECT) déjà joué par Task_HandleSelectionMenuInput au press A.
  const cb = sFieldMoveCursorCallbacks[fieldMove];
  if (!cb || !cb.fieldMoveFunc) {
    // 1:1 décomp : fieldMoveFunc == NULL → return (move pas encore porté en menu).
    console.log(`[party-screen] FIELD_MOVE[${fieldMove}=${_fieldMoveName(fieldMove) || '?'}] pas d'entrée menu (interaction-only pour l'instant)`);
    return;
  }
  // 1:1 décomp : PartyMenuRemoveWindow(windowId[0]) + windowId[1] — ferme
  // l'action window "Que faire" avant la suite.
  if (_actionWindowId >= 0) {
    ClearStdWindowAndFrame(_actionWindowId, false);
    CopyWindowToVram(_actionWindowId, 3);
    RemoveWindow(_actionWindowId);
    _actionWindowId = -1;
  }
  // 1:1 décomp : badge gate. All field moves before WATERFALL are HMs.
  // FlagGet(FLAG_BADGE01_GET + fieldMove) — badges consécutifs → on résout
  // FLAG_BADGE0{n}_GET par nom (n = fieldMove+1, ∈ [1,8]).
  if (fieldMove <= FIELD_MOVE_WATERFALL && FlagGet(`FLAG_BADGE0${fieldMove + 1}_GET`) !== true) {
    _displayFieldMoveErrorMessage('gText_CantUseUntilNewBadge');
    return;
  }
  if (cb.fieldMoveFunc() === true) {
    switch (fieldMove) {
      case FIELD_MOVE_MILK_DRINK:
      case FIELD_MOVE_SOFT_BOILED:
        // 1:1 décomp : ChooseMonForSoftboiled(taskId) — reste DANS le menu
        // (choix du receveur + transfert PV), pas de close/retour-field.
        ChooseMonForSoftboiled();
        break;
      case FIELD_MOVE_TELEPORT:
        // 1:1 décomp : message « Retourner au dernier lieu de soins? » + Oui/Non.
        // (Le décomp buffer aussi le nom de la map via GetMapNameGeneric mais
        // gText_ReturnToHealingSpot ne l'utilise PAS → skip.) Sur OUI → retour-field
        // → FieldCallback_Teleport → warp vers lastHealLocation.
        _displayFieldMoveExitAreaMessage('gText_ReturnToHealingSpot');
        break;
      case FIELD_MOVE_DIG:
        // 1:1 décomp : « Fuir d'ici et retourner à {STR_VAR_1}? » ({STR_VAR_1} =
        // nom FR du lieu d'évasion) + Oui/Non. Sur OUI → FieldCallback_Dig → warp escapeWarp.
        _displayFieldMoveExitAreaMessage('gText_EscapeFromHere', _escapeDestFriendlyName());
        break;
      case FIELD_MOVE_FLY:
        // 1:1 :3752-3755 : gPartyMenu.exitCallback = CB2_OpenFlyMap;
        // Task_ClosePartyMenu — le party se ferme DIRECTEMENT vers la fly map 1:1
        // (region_map.ts). Import dynamique (pattern _OpenBagAndChooseItem :
        // l'arête statique party_menu→region_map serait un cycle TDZ) ; le close
        // part au then (1 frame, imperceptible — précédent bag lot 5).
        void import('./region_map').then((rm) => {
          _partyTransientExitCb = rm.CB2_OpenFlyMap;
          ClosePartyScreen();
        }).catch((e) => console.error('[party_menu] FLY → CB2_OpenFlyMap', e));
        break;
      default:
        // 1:1 décomp : gPartyMenu.exitCallback = CB2_ReturnToField; Task_ClosePartyMenu.
        // Le retour-field (Local, PAS WithOpenMenu) run gFieldCallback2 =
        // FieldCallback_PrepareFadeInFromMenu → l'effet. Routé via _partyTransientExitCb.
        _partyTransientExitCb = CB2_ReturnToField_Manual;
        ClosePartyScreen();
        break;
    }
  } else {
    // 1:1 décomp : can't use field move → message dédié + retour choose-mon.
    switch (fieldMove) {
      case FIELD_MOVE_SURF: {
        // 1:1 décomp DisplayCantUseSurfMessage (party_menu.c:3869) :
        //   if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_SURFING)) ALREADY_SURFING
        //   else CANT_SURF_HERE.  (PLAYER_AVATAR_FLAG_SURFING = 1<<3 = 8.)
        const testFlags = (globalThis as Record<string, unknown>).__TestPlayerAvatarFlags as ((f: number) => number) | undefined;
        _displayFieldMoveErrorMessage(
          (testFlags?.(8) ?? 0) !== 0 ? 'gText_AlreadySurfing' : 'gText_CantSurfHere', true);
        break;
      }
      case FIELD_MOVE_FLASH:
        // 1:1 décomp DisplayCantUseFlashMessage (party_menu.c:3844) :
        //   if (FlagGet(FLAG_SYS_USE_FLASH)) ALREADY_IN_USE  else CANT_USE_HERE.
        _displayFieldMoveErrorMessage(
          FlagGet('FLAG_SYS_USE_FLASH') ? 'gText_InUseAlready_PM' : 'gText_CantUseHere', true);
        break;
      default:
        // 1:1 :3774-3777 DisplayPartyMenuStdMessage(msgId) + Task_CancelAfterAorBPress.
        _displayFieldMoveErrorMessage(cb.msgId, true);
        break;
    }
  }
}

/** 1:1 décomp `CursorCb_Summary` (party_menu.c:2770-2775) :
 *    PlaySE(SE_SELECT);                                      ← joué par le dispatch
 *    sPartyMenuInternal->exitCallback = CB2_ShowPokemonSummaryScreen;
 *    Task_ClosePartyMenu(taskId);   // fade-out party PUIS handoff CB2
 *  Le party menu se ferme ENTIÈREMENT (fade gated → _freePartyMenu → SetMainCallback2)
 *  AVANT que le résumé s'init = handoff séquentiel identique au décomp (supprime la race
 *  où OpenSummaryScreen était appelé pendant que le party menu vivait encore →
 *  CB2_ReturnToFieldWithOpenMenu OW+START bug #4, ou CB2 stomp crash fade bug #3). */
function CursorCb_Summary(taskId: number): void {
  const mon = _slotMon(_slotId);
  if (mon) {
    _summaryTargetMon = mon;
    _showSummaryPending = false;
    _partyTransientExitCb = CB2_ShowPokemonSummaryScreen_Manual;
    ClosePartyScreen();  // = Task_ClosePartyMenu (fade + handoff séquentiel)
  } else {
    // Garde port : slot vide (jamais atteint — le menu d'action ouvre sur un mon valide).
    CursorCb_Cancel1(taskId);
  }
}

/** 1:1 décomp `CursorCb_Store` (party_menu.c:3587-3591) : pension (DEPOSER).
 *    PlaySE(SE_SELECT);            ← joué par le dispatch
 *    Task_ClosePartyMenu(taskId);  → exitCallback = BufferMonSelection
 *  (le slot choisi est capturé par _freePartyMenu → _cursorSelectionMonId). */
function CursorCb_Store(taskId: number): void {
  ClosePartyScreen();
}

/** DETTE R3 — mail depuis party non porté. 1:1 décomp `CursorCb_Mail`
 *  (party_menu.c:3369) : cascade SetPartyMonSelectionActions(ACTIONS_MAIL) +
 *  DisplaySelectionWindow(SELECTWINDOW_MAIL) → sous-menu LIRE/PRENDRE (CursorCb_Read /
 *  CursorCb_TakeMail). Demande l'écran ReadMail + le flux bag-add équivalent (lot 10).
 *  Stub : ferme le menu d'action → retour choix-mon (comportement actuel conservé). */
function CursorCb_Mail(taskId: number): void {
  console.log('[party-screen] MAIL → dette R3 (cascade CursorCb_Mail non portée)');
  CursorCb_Cancel1(taskId);
}

/** 1:1 décomp dispatch `sCursorOptions[actions[input]].func(taskId)`
 *  (party_menu.c:2760/2764). `func == null` = CursorCb hors-solo non portée
 *  (combat / union-room / chooseHalf / toss / sous-menu mail) → WARN sans crash
 *  (précédent : src/battle_transition.ts, entrées null + warn). */
function _dispatchCursorOption(action: number, taskId: number): void {
  const opt = sCursorOptions[action];
  if (opt && opt.func) {
    opt.func(taskId);
  } else {
    console.error(`[party_menu] CursorCb non portée: action=${action}`);
  }
}

/** 1:1 décomp `Task_HandleSelectionMenuInput` (party_menu.c:2740-2768). La lecture
 *  d'input du port est conservée (DPAD/A/B lus depuis gMain), mais le dispatch passe
 *  désormais par la table `sCursorOptions[_actionList[input]].func(taskId)` :
 *    - A (default décomp:2762-2765) → func de l'action sélectionnée ;
 *    - B (MENU_B_PRESSED décomp:2757-2761) → func de la DERNIÈRE action (= CANCEL).
 *  SE_SELECT joué ici au press (convention port : les CursorCb_* ne le rejouent pas —
 *  cf. commentaires "SE_SELECT déjà joué par le dispatch"). */
function Task_HandleSelectionMenuInput(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;
  const newRepKeys = rt.gMain.newAndRepeatedKeys ?? newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  const DPAD_UP = 0x40, DPAD_DOWN = 0x80;
  if (newRepKeys & DPAD_UP) {
    if (_actionCursor > 0) { _actionCursor--; PlaySE(5); _renderActionMenuContents(); }
  } else if (newRepKeys & DPAD_DOWN) {
    if (_actionCursor < _actionList.length - 1) { _actionCursor++; PlaySE(5); _renderActionMenuContents(); }
  } else if (newKeys & KEY_A) {
    // 1:1 décomp default (party_menu.c:2762-2765) : dispatch de l'action sélectionnée.
    PlaySE(5);
    _dispatchCursorOption(_actionList[_actionCursor], taskId);
  } else if (newKeys & KEY_B) {
    // 1:1 décomp MENU_B_PRESSED (party_menu.c:2757-2761) : dispatch de la DERNIÈRE
    // action (actions[numActions - 1]) = CANCEL1 (menu mon) ou CANCEL2 (sous-menu objet).
    // ÉCART CORRIGÉ : l'ancien port fermait TOUJOURS le menu d'action vers le choix-mon ;
    // le décomp fait revenir B du sous-menu objet au menu d'action mon (via CursorCb_Cancel2).
    PlaySE(5);
    _dispatchCursorOption(_actionList[_actionList.length - 1], taskId);
  }
}

// ─── LOT 5 : feuilles Task_* level-up / learn-move (party_menu.c:4789-5093) ────
// Extraction 1:1 des branches `_phase` level-up/learn du méga-handler vers les
// vraies task funcs décomp. Le squelette `_phase` (transitions internes) RESTE
// jusqu'au lot final ; chaque `_phase = 'X'` porte l'annotation décomp
// `= gTasks[taskId].func = Task_Y (:LIGNE)`. `taskId` conservé (signature 1:1)
// même quand inutilisé (le port pilote l'état par `_phase`, pas gTasks[taskId]).

/** 1:1 `Task_DisplayLevelUpStatsPg1` (party_menu.c:5009-5017). ÉCART port : la
 *  condition unique décomp `WaitFanfare(FALSE) && IsPartyMenuTextPrinterActive()
 *  != TRUE && (A||B)` est scindée (early-return printer actif, puis WaitFanfare &&
 *  A/B) — résultat identique. */
function Task_DisplayLevelUpStatsPg1(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_isPartyMenuTextPrinterActive()) return;         // 1:1 :5011 (moitié gate)
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (WaitFanfare(false) && (newKeys & (KEY_A | KEY_B))) {
    PlaySE(5);                                          // 1:1 :5013 PlaySE(SE_SELECT)
    DisplayLevelUpStatsPg1();                           // 1:1 :5014 box + page 1 (deltas)
    _phase = 'levelup_pg2';  // = gTasks[taskId].func = Task_DisplayLevelUpStatsPg2 (:5015)
  }
  void taskId;
}

/** 1:1 `Task_DisplayLevelUpStatsPg2` (party_menu.c:5019-5027). */
function Task_DisplayLevelUpStatsPg2(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (newKeys & (KEY_A | KEY_B)) {                     // 1:1 :5021 (A||B)
    PlaySE(5);                                          // 1:1 :5023 PlaySE(SE_SELECT)
    DisplayLevelUpStatsPg2();                           // 1:1 :5024 page 2 (totaux)
    _phase = 'levelup_learn';  // = gTasks[taskId].func = Task_TryLearnNewMoves (:5025)
  }
  void taskId;
}

/** 1:1 `Task_TryLearnNewMoves` (party_menu.c:5048-5073) : WaitFanfare(FALSE) &&
 *  (A||B) → RemoveLevelUpStatsWindow + MonTryLearningNewMove(mon, TRUE) + dispatch.
 *  ÉCART port : le switch commun (case 0 / MON_HAS_MAX_MOVES / default) est
 *  factorisé dans `_dispatchLearnMoveResult` (le décomp l'inline dans CHAQUE
 *  Task_Try*) ; MON_ALREADY_KNOWS_MOVE traité ici (comportements distincts entre
 *  :5066 et :5088). */
function Task_TryLearnNewMoves(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (WaitFanfare(false) && (newKeys & (KEY_A | KEY_B))) {
    PlaySE(5);  // ÉCART port : PlaySE(SE_SELECT) AJOUTÉ (absent du décomp :5048-5073)
    RemoveLevelUpStatsWindow();                         // 1:1 :5054
    _itemUsedMsgText = null;
    const monLearn = _party()[_slotId];
    const learnMove = monLearn ? MonTryLearningNewMove(monLearn, true) : 0;  // 1:1 :5055
    _learnMoveState = 1;                                // 1:1 :5056 gPartyMenu.learnMoveState = 1
    if (learnMove === 0xFFFE /* MON_ALREADY_KNOWS_MOVE */) {
      _phase = 'levelup_learn_next';  // = gTasks[taskId].func = Task_TryLearningNextMove (:5066)
    } else {
      _dispatchLearnMoveResult(learnMove);             // 1:1 :5060/:5063/:5069
    }
  }
  void taskId;
}

/** 1:1 `Task_TryLearningNextMove` (party_menu.c:5075-5093) — tourne chaque frame ;
 *  MON_ALREADY_KNOWS_MOVE → return (reboucle, :5088). */
function Task_TryLearningNextMove(taskId: number): void {
  const monNext = _party()[_slotId];
  const result = monNext ? MonTryLearningNewMove(monNext, false) : 0;  // 1:1 :5077
  if (result === 0xFFFE /* MON_ALREADY_KNOWS_MOVE */) return;          // 1:1 :5087-5088
  _dispatchLearnMoveResult(result);                                    // 1:1 :5082/:5085/:5090
  void taskId;
}

/** 1:1 `Task_DoLearnedMoveFanfareAfterText` (party_menu.c:4789-4796) : attend la
 *  FIN du défilement (« X apprend Y! ») puis PlayFanfare(MUS_LEVEL_UP). */
function Task_DoLearnedMoveFanfareAfterText(taskId: number): void {
  if (_isPartyMenuTextPrinterActive()) return;         // 1:1 :4791
  PlayFanfare(MUS_LEVEL_UP);                            // 1:1 :4793
  _phase = 'levelup_learned_msg';  // = gTasks[taskId].func = Task_LearnNextMoveOrClosePartyMenu (:4794)
  void taskId;
}

/** 1:1 `Task_LearnNextMoveOrClosePartyMenu` (party_menu.c:4798-4812) : fanfare
 *  finie + A/B → learnMoveState==1 → Task_TryLearningNextMove ; sinon (CT/CS) →
 *  close. ÉCARTS port : (a) WaitFanfare(FALSE) ≈ IsFanfareTaskInactive() ; (b)
 *  PlaySE(SE_SELECT) ajouté (absent du décomp ici) ; (c) learnMoveState==2 « never
 *  occurs » → gSpecialVar_Result=TRUE omis ; (d) transition différée d'1 frame
 *  (`_phase` au lieu de l'appel direct Task_TryLearningNextMove(taskId)). */
function Task_LearnNextMoveOrClosePartyMenu(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (WaitFanfare(false) && (newKeys & (KEY_A | KEY_B))) {  // 1:1 :4800 IsFanfareTaskInactive && (A||B)
    PlaySE(5);
    _itemUsedMsgText = null;
    if (_learnMoveState === 1) _phase = 'levelup_learn_next';  // = Task_TryLearningNextMove (:4804)
    else ClosePartyScreen();                                   // = Task_ClosePartyMenu (:4810)
  }
  void taskId;
}

/** 1:1 `Task_ReplaceMoveYesNo` (party_menu.c:4815-4822) : le printer gère les 3
 *  pages \p nativement ; à la fin du texte, pose le YesNo par-dessus. */
function Task_ReplaceMoveYesNo(taskId: number): void {
  if (_isPartyMenuTextPrinterActive()) return;         // 1:1 :4817
  PartyMenuDisplayYesNoMenu();                          // 1:1 :4819
  _phase = 'replace_yesno';  // = gTasks[taskId].func = Task_HandleReplaceMoveYesNoInput (:4820)
  void taskId;
}

/** 1:1 `Task_HandleReplaceMoveYesNoInput` (party_menu.c:4824-4839). */
function Task_HandleReplaceMoveYesNoInput(taskId: number): void {
  const res = Menu_ProcessInputNoWrapClearOnChoose();  // 0=OUI 1=NON -1=B -2=rien
  if (res === 0) {                                     // 1:1 :4828 (OUI)
    // OUI → « Oublier quelle capacité?{PAUSE_UNTIL_PRESS} » puis summary.
    _itemUsedMsgText = _preparePartyMsg(getString('gText_WhichMoveToForget') || '');  // 1:1 :4829
    _phase = 'which_move_msg';  // = gTasks[taskId].func = Task_ShowSummaryScreenToForgetMove (:4830)
    _drawMsg();
  } else if (res === 1 || res === -1) {                // 1:1 :4832-4835 (NON/B)
    if (res === -1) PlaySE(5);  // 1:1 MENU_B_PRESSED → PlaySE(SE_SELECT), fallthrough
    StopLearningMovePrompt();                           // 1:1 :4836
  }
  void taskId;
}

/** 1:1 `Task_ShowSummaryScreenToForgetMove` (party_menu.c:4841-4848) : attend la
 *  fin du printer (le A qui acquitte {PAUSE_UNTIL_PRESS} est consommé par la
 *  pause) → sPartyMenuInternal->exitCallback = CB2_ShowSummaryScreenToForgetMove
 *  + Task_ClosePartyMenu (fade + teardown). */
function Task_ShowSummaryScreenToForgetMove(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_isPartyMenuTextPrinterActive()) return;         // 1:1 :4843
  _learnMoveSlot = _slotId;                             // gPartyMenu.slotId conservé (summary async)
  _learnMoveReturnCb = rt.gMain.savedCallback ?? null; // gPartyMenu.exitCallback conservé
  _partyTransientExitCb = CB2_ShowSummaryScreenToForgetMove;  // 1:1 :4845 exitCallback = CB2_...
  _itemUsedMsgText = null;
  ClosePartyScreen();                                  // 1:1 :4846 Task_ClosePartyMenu
  void taskId;
}

/** 1:1 `Task_ReturnToPartyMenuWhileLearningMove` (party_menu.c:4860-4869) : après
 *  le fade d'entrée, dispatch selon le choix fait dans le summary select-move. */
function Task_ReturnToPartyMenuWhileLearningMove(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (!rt.gPaletteFade.active) {                       // 1:1 :4862
    if (GetMoveSlotToReplace() !== 4 /* MAX_MON_MOVES */)  // 1:1 :4864
      DisplayPartyMenuForgotMoveMessage();             // 1:1 :4865
    else
      StopLearningMovePrompt();                         // 1:1 :4867
  }
  void taskId;
}

/** 1:1 `Task_PartyMenuReplaceMove` (party_menu.c:4882-4895) : à la fin du texte
 *  gText_12PoofForgotMove → RemoveMonPPBonus + SetMonMoveSlot(data1, slot) puis
 *  Task_LearnedMove. (Fusionne l'ex-helper `_taskPartyMenuReplaceMove` + le gate
 *  printer qui vivait dans la branche `forgot_move_msg`.) */
function Task_PartyMenuReplaceMove(taskId: number): void {
  if (_isPartyMenuTextPrinterActive()) return;         // 1:1 :4887
  const mon = _party()[_slotId];                       // 1:1 :4889
  if (mon) {
    RemoveMonPPBonus(mon, GetMoveSlotToReplace());              // 1:1 :4890
    SetMonMoveSlot(mon, _learnMoveData1, GetMoveSlotToReplace());  // 1:1 :4892 (move = gPartyMenu.data1)
  }
  Task_LearnedMove();                                  // 1:1 :4893
  void taskId;
}

/** 1:1 `Task_StopLearningMoveYesNo` (party_menu.c:4906-4913) : attend la fin du
 *  texte « Arrêter d'enseigner {move}? » puis pose le YesNo. */
function Task_StopLearningMoveYesNo(taskId: number): void {
  if (_isPartyMenuTextPrinterActive()) return;         // 1:1 :4908
  PartyMenuDisplayYesNoMenu();                          // 1:1 :4910
  _phase = 'stop_learning_yesno';  // = gTasks[taskId].func = Task_HandleStopLearningMoveYesNoInput (:4911)
  void taskId;
}

/** 1:1 `Task_HandleStopLearningMoveYesNoInput` (party_menu.c:4915-4947). ÉCART
 *  port : le décomp aiguille ICI vers Task_TryLearningNextMoveAfterText
 *  (learnMoveState==1, :4928) vs Task_ClosePartyMenuAfterText (:4934) au moment
 *  d'afficher gText_MoveNotLearned ; le port pose toujours 'move_not_learned_msg'
 *  et décide en fin de texte (résultat identique — learnMoveState est figé). Le
 *  ré-affichage NON/B utilise DisplayMonNeedsToReplaceMove (≙ DisplayLearnMove
 *  Message(gText_PkmnNeedsToReplaceMove) + func=Task_ReplaceMoveYesNo, :4941-4944). */
function Task_HandleStopLearningMoveYesNoInput(taskId: number): void {
  const res = Menu_ProcessInputNoWrapClearOnChoose();
  if (res === 0) {                                     // 1:1 :4921 (OUI = arrêter)
    const monStop = _party()[_slotId];
    _itemUsedMsgText = _preparePartyMsg(getString('gText_MoveNotLearned') || '',   // 1:1 :4922-4925
      monStop?.nickname ?? '', gMoveNames[_learnMoveData1] ?? '');
    _phase = 'move_not_learned_msg';  // = gTasks[taskId].func = Task_TryLearningNextMoveAfterText (:4928) / Task_ClosePartyMenuAfterText (:4934)
    _drawMsg();
  } else if (res === 1 || res === -1) {                // 1:1 :4937-4940 (NON/B)
    if (res === -1) PlaySE(5);  // 1:1 MENU_B_PRESSED → PlaySE(SE_SELECT), fallthrough
    DisplayMonNeedsToReplaceMove(_learnMoveData1);     // 1:1 :4941-4944
  }
  void taskId;
}

/** 1:1 `Task_TryLearningNextMoveAfterText` (party_menu.c:4949-4953) : attend la
 *  fin du printer puis Task_TryLearningNextMove. ÉCART port : embarque AUSSI la
 *  branche Task_ClosePartyMenuAfterText (learnMoveState!=1 → close) que le décomp
 *  aiguille en amont (cf. Task_HandleStopLearningMoveYesNoInput). */
function Task_TryLearningNextMoveAfterText(taskId: number): void {
  if (_isPartyMenuTextPrinterActive()) return;         // 1:1 :4951
  _itemUsedMsgText = null;
  if (_learnMoveState === 1) _phase = 'levelup_learn_next';  // = Task_TryLearningNextMove (:4952)
  else ClosePartyScreen();                                   // = Task_ClosePartyMenuAfterText
  void taskId;
}

// ─── LOT 6 : feuilles Task_* sous-états message / yes-no / field-move ─────────
// Extraction 1:1 des branches `_phase` RESTANTES du méga-handler. Chaque corps
// inline est déplacé VERBATIM (comportement STRICTEMENT inchangé) vers sa task
// func décomp ; `taskId` conservé (signature 1:1) même quand le port pilote par
// `_phase` / module-scope. Divergences port-vs-décomp CONSERVÉES + annotées ÉCART.
// (`switching`/`hp_anim`/`action_menu` sont déjà des délégations via renames +
// LOT 2 ; `softboiled_msg` reste dans le méga-handler — cf. commentaire là-bas.)

/** 1:1 `Task_ClosePartyMenuAfterText` (party_menu.c:4472-4480) : attend la fin du
 *  printer puis ferme le menu. AUCUN press supplémentaire : le A qui lève le
 *  {PAUSE_UNTIL_PRESS} final du message est consommé par la pause du printer.
 *  ÉCART port : la logique `if (gPartyMenuUseExitCallback == FALSE)
 *  sPartyMenuInternal->exitCallback = NULL` + Task_ClosePartyMenu (:4476-4478) est
 *  encapsulée dans ClosePartyScreen ; `_itemUsedMsgText = null` = cleanup port du
 *  buffer message. */
function Task_ClosePartyMenuAfterText(taskId: number): void {
  if (_isPartyMenuTextPrinterActive()) return;   // 1:1 :4474
  _itemUsedMsgText = null;
  ClosePartyScreen();                            // 1:1 :4476-4478 (exitCallback + Task_ClosePartyMenu)
  void taskId;
}

/** 1:1 `Task_ReturnToChooseMonAfterText` (party_menu.c:1745-1761) : à la fin du
 *  printer, efface WIN_MSG puis REVIENT au choix-mon (ne ferme PAS le menu).
 *  Partagée par `field_move_err` (badge manquant / can't-use : CursorCb_FieldMove a
 *  déjà retiré l'action window) ET `helditem_msg`. Le {PAUSE_UNTIL_PRESS} final est
 *  levé DANS le printer par le A du joueur → pas de press supplémentaire ici.
 *  ÉCARTS port : (a) la branche link `Task_WaitForLinkAndReturnToChooseMon`
 *  (:1751-1754) est hors-solo (jamais active) ; (b) ClearStdWindowAndFrameToTransparent
 *  + ClearWindowTilemap(WIN_MSG) + DisplayPartyMenuStdMessage(CHOOSE_MON) +
 *  func=Task_HandleChooseMonInput (:1749/:1757-1758) = reset action list +
 *  `_phase='open'` + _drawMsg ; (c) pour `helditem_msg` le décomp est
 *  Task_UpdateHeldItemSprite (:3255) dont la TÊTE (UpdatePartyMonHeldItemSprite,
 *  :3261) est faite au site de transition (`_updatePartyMonHeldItem`, ~:2770 /
 *  switch_items_yesno) ; la QUEUE (:3269 Task_ReturnToChooseMonAfterText) = cette
 *  feuille. */
function Task_ReturnToChooseMonAfterText(taskId: number): void {
  if (_isPartyMenuTextPrinterActive()) return;   // 1:1 :1747
  _itemUsedMsgText = null;
  _actionList = [];
  _actionCursor = 0;
  _actionSubMenu = 'mon';
  _phase = 'open';                               // = gTasks[taskId].func = Task_HandleChooseMonInput (:1758)
  _drawMsg();                                    // 1:1 :1757 DisplayPartyMenuStdMessage(CHOOSE_MON)
  void taskId;
}

/** 1:1 `Task_CancelAfterAorBPress` (party_menu.c:3838-3842) : `if (JOY_NEW(A) ||
 *  JOY_NEW(B)) CursorCb_Cancel1(taskId)`. Messages field-move « Impossible ici. »
 *  etc. SANS {PAUSE_UNTIL_PRESS} → attend un press A/B puis CursorCb_Cancel1
 *  (party_menu.c:3062 : PlaySE(SE_SELECT) + PartyMenuRemoveWindow×2 +
 *  DisplayPartyMenuStdMessage(CHOOSE_MON) + func=Task_HandleChooseMonInput).
 *  ÉCARTS port : (a) gate printer AJOUTÉ (le décomp Task_CancelAfterAorBPress n'a PAS
 *  d'IsPartyMenuTextPrinterActive — inoffensif : au moment du press le printer est
 *  fini) ; (b) CursorCb_Cancel1 inliné (reset action list + `_phase='open'` +
 *  _drawMsg) ; la variante DAYCARE (CHOOSE_MON_2, :3067-3068) est hors-solo. */
function Task_CancelAfterAorBPress(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_isPartyMenuTextPrinterActive()) return;   // ÉCART port : gate AJOUTÉ (absent :3838-3842)
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (newKeys & (KEY_A | KEY_B)) {               // 1:1 :3840 JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON)
    PlaySE(5);  // 1:1 :3064 CursorCb_Cancel1 PlaySE(SE_SELECT)
    _itemUsedMsgText = null;
    _actionList = [];
    _actionCursor = 0;
    _actionSubMenu = 'mon';
    _phase = 'open';                             // = gTasks[taskId].func = Task_HandleChooseMonInput (:3071)
    _drawMsg();                                  // 1:1 :3070 DisplayPartyMenuStdMessage(CHOOSE_MON)
  }
  void taskId;
}

/** 1:1 `Task_HandleFieldMoveExitAreaYesNoInput` (party_menu.c:3797-3814) : Oui/Non
 *  du field-move exit-area (Téléport « Retourner au dernier lieu de soins? » / Tunnel).
 *    case 0 (OUI)  : exitCallback = CB2_ReturnToField ; Task_ClosePartyMenu.
 *    case 1/B (NON): gFieldCallback2=NULL; gPostMenuFieldCallback=NULL; retour choix-mon.
 *  ÉCARTS port : (a) OUI → `_partyTransientExitCb = CB2_ReturnToField_Manual` (≙
 *  gPartyMenu.exitCallback = CB2_ReturnToField) + ClosePartyScreen (≙ Task_ClosePartyMenu) ;
 *  (b) NON/B → le décomp appelle Task_ReturnToChooseMonAfterText(taskId) (:3811) mais
 *  le port INLINE le retour choix-mon SANS le gate printer et SANS `_actionSubMenu='mon'`
 *  (comportement conservé verbatim — divergence NON corrigée). */
function Task_HandleFieldMoveExitAreaYesNoInput(taskId: number): void {
  const res = Menu_ProcessInputNoWrapClearOnChoose();  // -2 rien, -1 B, 0 OUI, 1 NON
  if (res === 0) {
    _itemUsedMsgText = null;
    _partyTransientExitCb = CB2_ReturnToField_Manual;  // 1:1 :3802 exitCallback = CB2_ReturnToField
    ClosePartyScreen();                                // 1:1 :3803 Task_ClosePartyMenu
  } else if (res === 1 || res === -1) {
    PlaySE(5);  // 1:1 :3806 MENU_B_PRESSED → PlaySE(SE_SELECT), fallthrough
    _itemUsedMsgText = null;
    const g = globalThis as Record<string, unknown>;
    g.gFieldCallback2 = null;                          // 1:1 :3809 gFieldCallback2 = NULL
    g.gPostMenuFieldCallback = null;                   // 1:1 :3810 gPostMenuFieldCallback = NULL
    _actionList = [];
    _actionCursor = 0;
    _phase = 'open';  // ÉCART : Task_ReturnToChooseMonAfterText (:3811) inliné SANS gate/_actionSubMenu
    _drawMsg();
  }
  void taskId;
}

/** 1:1 `Task_HandleSwitchItemsYesNoInput` (party_menu.c:3163-3199) : Oui/Non
 *  « Échanger les deux objets? ». OUI → RemoveBagItem(new) ; si pas de place pour
 *  rendre l'ancien → rollback + "sac plein" (:3171) ; sinon GiveItemToMon(new) +
 *  "X a remplacé Y" (:3186). NON/B → garde l'objet (:3195). ÉCART port : embarque
 *  AUSSI la variante Task_HandleSwitchItemsFromBagYesNoInput (party_menu.c:5478-5513)
 *  via `_giveFromBag` — les deux ne diffèrent que sur le Task_* de continuation
 *  (DONNER party→bag = Task_UpdateHeldItemSprite/'helditem_msg' vs GIVE-FROM-BAG =
 *  Task_UpdateHeldItemSpriteAndClosePartyMenu/'item_used_msg'). Les clés SAC passent
 *  par GetBagItemKey (TM/HM enum-numbered → move-named). Mail (ItemIsMail, :3179/:5494)
 *  = hors-scope de ce port (Task_WriteMailToGiveMon*). */
function Task_HandleSwitchItemsYesNoInput(taskId: number): void {
  const res = Menu_ProcessInputNoWrapClearOnChoose();  // 0=OUI 1=NON -1=B
  if (res === 0) {
    const mon = gPlayerParty[_slotId];
    RemoveBagItem(GetBagItemKey(_giveNewItem), 1);  // clé SAC (TM/HM enum-numbered → move-named)
    if (AddBagItem(GetBagItemKey(_giveOldItem), 1) === false) {
      // 1:1 :3171 pas de place pour rendre l'ancien → rollback (re-add new au sac).
      AddBagItem(GetBagItemKey(_giveNewItem), 1);
      _itemUsedMsgText = _preparePartyMsg(getString('gText_BagFullCouldNotRemoveItem') || '');
    } else if (mon) {
      // 1:1 :3186 échange : donne le nouveau, message "X a remplacé Y".
      GiveItemToMon(mon, _giveNewItem);
      _updatePartyMonHeldItem(_slotId);
      _itemUsedMsgText = _preparePartyMsg(getString('gText_SwitchedPkmnItem') || '',
        GetItemName(_giveNewItem), GetItemName(_giveOldItem));
    }
    // Continuation : DONNER (party→bag) revient au choix-mon (phase 'helditem_msg') ;
    // GIVE-FROM-BAG (#12) ferme → SAC (phase 'item_used_msg' = close→savedCallback).
    // 1:1 : Task_HandleSwitchItemsYesNoInput (3186) vs Task_HandleSwitchItemsFromBag
    // YesNoInput (5501) diffèrent uniquement sur le Task_* de continuation.
    _phase = _giveFromBag ? 'item_used_msg' : 'helditem_msg';
    _drawMsg();
  } else if (res === 1 || res === -1) {
    // 1:1 :3199 NON/B → garde l'objet. DONNER : Task_ReturnToChooseMonAfterText → le
    // message "Echanger les deux objets?" n'a PAS de {PAUSE_UNTIL_PRESS} → revient
    // IMMÉDIATEMENT au choix-mon (SANS attendre A/B). GIVE-FROM-BAG (#12) : 1:1
    // Task_HandleSwitchItemsFromBagYesNoInput case 1 → Task_UpdateHeldItemSpriteAnd
    // ClosePartyMenu = ferme direct → SAC.
    PlaySE(5);  // 1:1 MENU_B_PRESSED rejoue SE_SELECT
    _itemUsedMsgText = null;
    if (_giveFromBag) {
      ClosePartyScreen();          // → CB2_ReturnToBagMenu (savedCallback)
    } else {
      _actionList = [];
      _actionCursor = 0;
      _phase = 'open';
      _drawMsg();  // → "Choisir un POKéMON"
    }
  }
  void taskId;
}

/** Input handler 1:1 décomp `Task_HandleChooseMonInput` (party_menu.c:1260) :
 *    A → if cancel slot: close, else: action menu (RESUME/OBJET/RETOUR)
 *    B → close
 *    START → MoveCursorToConfirm (= no-op si pas chooseHalf)
 *    DPAD → cursor nav */
function Task_PartyMenu_HandleInput(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp : pendant PARTY_ACTION_SWITCHING la task func du décomp EST
  // Task_SlideSelectedSlotsOffscreen/Onscreen (pas le handler input) → input
  // ignoré, on tick uniquement l'anim slide. (party_menu.c:2864/2962)
  if (_phase === 'switching') { _slideTaskFn?.(); return; }
  // Sub-state action menu : 1:1 décomp la task func serait Task_HandleSelectionMenuInput
  // (party_menu.c:2740) ; ici le _phase reste (lots 4-6 tueront la state-machine).
  if (_phase === 'action_menu') { Task_HandleSelectionMenuInput(_task.taskId); return; }
  // Sub-state hp_anim : 1:1 décomp Task_PartyMenuModifyHP (party_menu.c:1839).
  if (_phase === 'hp_anim') { Task_PartyMenuModifyHP(_task.taskId); return; }
  // Sub-state item used message : 1:1 décomp Task_ClosePartyMenuAfterText (party_menu.c:4472).
  if (_phase === 'item_used_msg') { Task_ClosePartyMenuAfterText(_task.taskId); return; }
  // Sub-states message field-move (badge/can't-use = Task_ReturnToChooseMonAfterText
  // :1745) et held-item (Task_UpdateHeldItemSprite :3255, queue = Task_ReturnTo
  // ChooseMonAfterText) : A/B → retour choix-mon (ne FERME pas le menu).
  if (_phase === 'field_move_err' || _phase === 'helditem_msg') { Task_ReturnToChooseMonAfterText(_task.taskId); return; }
  // Sub-state message field-move sans pause : 1:1 décomp Task_CancelAfterAorBPress (party_menu.c:3838).
  if (_phase === 'field_move_cancel') { Task_CancelAfterAorBPress(_task.taskId); return; }
  // Sub-state message softboiled (PV restaurés / inutilisable) : A/B → continuation
  // (Task_FinishSoftboiled ou re-choix receveur). 1:1 décomp Task_FinishSoftboiled /
  // Task_ChooseNewMonForSoftboiled (qui attendent !IsPartyMenuTextPrinterActive ;
  // notre msg = {PAUSE_UNTIL_PRESS} → ack par A/B).
  if (_phase === 'softboiled_msg') {
    if (_isPartyMenuTextPrinterActive()) return;  // 1:1 gate printer (cf item_used_msg)
    const newKeys = rt.gMain.newKeys;
    const KEY_A = 0x0001, KEY_B = 0x0002;
    if (newKeys & (KEY_A | KEY_B)) {
      PlaySE(5);  // SE_SELECT
      _itemUsedMsgText = null;
      const cb = _softboiledMsgOnAck; _softboiledMsgOnAck = null;
      cb?.();
    }
    return;
  }
  // Sub-state Oui/Non field-move exit-area : 1:1 Task_HandleFieldMoveExitAreaYesNoInput (party_menu.c:3797).
  if (_phase === 'fieldmove_yesno') { Task_HandleFieldMoveExitAreaYesNoInput(_task.taskId); return; }
  // Sub-state Oui/Non échange d'objet : 1:1 Task_HandleSwitchItemsYesNoInput (party_menu.c:3163).
  if (_phase === 'switch_items_yesno') { Task_HandleSwitchItemsYesNoInput(_task.taskId); return; }
  // Sub-states level-up / learn-move — 1:1 décomp : chaque `_phase` délègue à sa
  // task func feuille (LOT 5). Le squelette `_phase` (transitions) reste jusqu'au
  // lot final ; les corps 1:1 vivent dans les Task_* ci-dessus (party_menu.c:4789-5093).
  if (_phase === 'levelup_pg1') { Task_DisplayLevelUpStatsPg1(_task.taskId); return; }
  if (_phase === 'levelup_pg2') { Task_DisplayLevelUpStatsPg2(_task.taskId); return; }
  if (_phase === 'levelup_learn') { Task_TryLearnNewMoves(_task.taskId); return; }
  if (_phase === 'levelup_learn_next') { Task_TryLearningNextMove(_task.taskId); return; }
  if (_phase === 'levelup_learned_fanfare') { Task_DoLearnedMoveFanfareAfterText(_task.taskId); return; }
  if (_phase === 'levelup_learned_msg') { Task_LearnNextMoveOrClosePartyMenu(_task.taskId); return; }
  if (_phase === 'levelup_replace_msg') { Task_ReplaceMoveYesNo(_task.taskId); return; }
  if (_phase === 'replace_yesno') { Task_HandleReplaceMoveYesNoInput(_task.taskId); return; }
  if (_phase === 'which_move_msg') { Task_ShowSummaryScreenToForgetMove(_task.taskId); return; }
  if (_phase === 'learnmove_return') { Task_ReturnToPartyMenuWhileLearningMove(_task.taskId); return; }
  if (_phase === 'forgot_move_msg') { Task_PartyMenuReplaceMove(_task.taskId); return; }
  if (_phase === 'stop_learning_msg') { Task_StopLearningMoveYesNo(_task.taskId); return; }
  if (_phase === 'stop_learning_yesno') { Task_HandleStopLearningMoveYesNoInput(_task.taskId); return; }
  if (_phase === 'move_not_learned_msg') { Task_TryLearningNextMoveAfterText(_task.taskId); return; }
  if (_phase !== 'open') return;
  // 1:1 décomp : en phase 'open', la task func du décomp EST
  // Task_HandleChooseMonInput (party_menu.c:1259). Lot 4 = extraction : le dispatch
  // choix-mon (A/B/START) vit désormais dans Task_HandleChooseMonInput /
  // HandleChooseMonSelection / HandleChooseMonCancel / PartyMenuButtonHandler /
  // GetCurrentPartySlotPtr / IsSelectedMonNotEgg (ci-dessus).
  Task_HandleChooseMonInput(_task.taskId);
}

export function VBlankCB_PartyMenuRun(): void { /* transferts auto */ }
export function MainCB2_PartyMenuRun(): void { /* tasks/fade tick auto via runtime */ }

export function CB2_InitPartyMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0: rt.SetVBlankCallback(null); rt.gMain.state++; break;
    case 1: rt.gMain.state++; break;
    case 2: rt.gMain.state++; break;
    case 3:
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++; break;
    case 4:
      ResetSpriteData();
      // 1:1 décomp `ShowPartyMenu` case 4 (party_menu.c:584) : FreeAllSpritePalettes().
      // Sans ça, les tags de palette OBJ de l'overworld (météo×2 + GENERAL_0/1 dans [12,16))
      // restaient marqués → LoadSpritePalette(pokeball/status/helditem) renvoyait 0xFF →
      // paletteBank=255 → icône pokéball/SORTIR/gros-icône NOIRES. (Le bag le faisait déjà ;
      // l'OW ré-établit ses palettes au retour via CB2_ReturnToField.) [[diag-glitches-2026-06-18]]
      FreeAllSpritePalettes();
      rt.gMain.state++; break;
    case 5: rt.gMain.state++; break;
    case 6: ResetTasks(); rt.gMain.state++; break;
    case 7:
      _initPartyBgs(rt);
      _graphicsReady = false; _graphicsLoading = false;
      _windowsReady = false; _windowsLoading = false;
      rt.gMain.state++; break;
    case 8:
      if (!_loadPartyGraphicsCb2(rt)) break;
      rt.gMain.state++; break;
    case 9:
      if (!_windowsReady) {
        if (!_windowsLoading) {
          _windowsLoading = true;
          void _loadPartyWindowsCb2(rt).then(() => {
            _windowsReady = true;
            _windowsLoading = false;
          }).catch((e) => {
            // BLOQ-1 fail-open + Règle 3 : sans .catch, un échec (preloadTextWindowFrames /
            // loadGbaPal) laissait _windowsLoading=true à jamais → case 9 figé pour toujours.
            // InitWindows a déjà posé la structure des fenêtres ; on avance en dégradé.
            console.error('[party-screen] windows load KO — party menu dégradé SANS gel', e);
            _windowsReady = true;
            _windowsLoading = false;
          });
        }
        break;
      }
      rt.gMain.state++; break;
    case 10: _phase = 'open'; rt.gMain.state++; break;
    case 11: _drawAllSlots(); _drawMsg(); _drawCancelButtonWindow(); rt.gMain.state++; break;
    case 12:
      _inputTaskId = rt.CreateTask(Task_PartyMenu_HandleInput, 0);
      // 1:1 décomp : reset état d'anim icône par slot (animDelayCounter /
      // animCmdIndex / animNum=0 sAnim_0 / mode). AnimatePartySlot (case 14)
      // posera ensuite le mode + décalage sélection/désélection.
      _iconAnimDelay = [0, 0, 0, 0, 0, 0];
      _iconAnimCmdIdx = [0, 0, 0, 0, 0, 0];
      _iconAnimNum = [0, 0, 0, 0, 0, 0];
      _iconMode = [0, 0, 0, 0, 0, 0];
      _bounceTaskId = rt.CreateTask(Task_PartyMenu_BounceIcon, 1);
      rt.gMain.state++; break;
    case 13:
      // 1:1 fix (bug palette icônes party screen) : réserver SYNCHRONEMENT les banks
      // de palette OBJ des icônes (ICON_OBJ_PAL_BASE..+5) AVANT les LoadSpritePalette
      // async (pokeball/status/helditem). Les icônes chargent en DIRECT (LoadPaletteObj)
      // vers ces banks fixes ; sans cette réservation l'allocateur les croit libres et
      // les pioche pour le pokeball/status (selon l'état OW/sac antérieur) → collision
      // palette (icônes corrompues, réparées en passant par un summary qui réalloue).
      for (let b = 0; b < 6; b++) ReserveSpritePaletteSlot(ICON_OBJ_PAL_BASE + b, TAG_ICON_PAL_RESERVE + b);
      // Spawn icon OAMs + cancel button + slot pokeballs async, advance immédiatement.
      void _spawnIconOams();
      // Sequence : _spawnCancelButtonOam load tiles → then _spawnSlotPokeballOams réutilise.
      void _spawnCancelButtonOam().then(() => { _spawnSlotPokeballOams(); });
      // 1:1 décomp LoadPartyMenuAilmentGfx + statusSpriteId par box +
      // SetPartyMonAilmentGfx (party_menu.c:4188-4205).
      void _loadStatusIconsGfx().then(() => {
        _spawnStatusOams();
        for (let i = 0; i < 6; i++) _updatePartyMonAilmentGfx(i);
      });
      // 1:1 décomp LoadHeldItemIcons + itemSpriteId par box + Update
      // PartyMonHeldItemSprite (party_menu.c:4021-4063).
      void _loadHeldItemGfx().then(() => {
        _spawnHeldItemOams();
        for (let i = 0; i < 6; i++) _updatePartyMonHeldItem(i);
      });
      rt.gMain.state++; break;
    case 14:
      // 1:1 décomp `AnimatePartySlot(gPartyMenu.slotId, 1)` (party_menu.c:1116) :
      // initial highlight du slot 0 + default unselected pour les autres mons.
      for (let i = 0; i < 6; i++) AnimatePartySlot(i, 0);
      AnimatePartySlot(_slotId, 1);
      rt.gMain.state++; break;
    case 15: rt.gMain.state++; break;
    case 16: rt.gMain.state++; break;
    case 17: rt.gMain.state++; break;
    case 18: rt.gMain.state++; break;
    case 19:
      BlendPalettes(0xFFFFFFFF, 16, 0);
      rt.gMain.state++; break;
    case 20:
      FadeScreen(FADE_FROM_BLACK, 0);
      rt.gPaletteFade.bufferTransferDisabled = false;
      PlaySE(6);
      rt.gMain.state++; break;
    default:
      rt.SetVBlankCallback(VBlankCB_PartyMenuRun);
      rt.SetMainCallback2(MainCB2_PartyMenuRun);
      _isOpen = true;
      // 1:1 décomp CB2_ReturnToPartyMenuFromSummaryScreen → Task_TryCreate
      // SelectionWindow (party_menu.c:2731) → CreateSelectionWindow : au
      // retour du résumé, la fenêtre de sélection se ré-ouvre sur le mon vu.
      // playSe=false : le SE_SELECT a été joué à CursorCb_Summary (entrée),
      // CreateSelectionWindow n'en rejoue pas.
      if (_reopenActionMenuAfterInit) {
        _reopenActionMenuAfterInit = false;
        _openActionMenu(rt, false);
      } else if (_pendingGiveMessage) {
        // 1:1 décomp : après reopen (CB2_GiveHoldItem → Task_GiveHoldItem), le message
        // "X doit tenir Y!" (DisplayGaveHeldItemMessage) s'affiche DANS le party menu
        // → A/B retour choix-mon (phase 'helditem_msg', partagée avec PRENDRE).
        _itemUsedMsgText = _pendingGiveMessage;
        _pendingGiveMessage = null;
        _phase = 'helditem_msg';
        _drawMsg();
      } else if (_pendingSwitchPrompt) {
        // 1:1 : mon tient déjà un objet → prompt d'échange Oui/Non au reopen.
        _pendingSwitchPrompt = false;
        _showSwitchHoldItemsPrompt();
      } else if (_pendingLearnMoveReturn) {
        // 1:1 Task_ReturnToPartyMenuWhileLearningMove (:4860) : retour du summary
        // select-move — le dispatch (slot choisi vs annulé) attend la fin du fade.
        _pendingLearnMoveReturn = false;
        _phase = 'learnmove_return';
      }
      return;
  }
}

export function IsPartyScreenOpen(): boolean {
  return _isOpen;
}

export function OpenPartyScreen(_onCloseLegacy?: () => void): void {
  if (_isOpen) return;
  void _onCloseLegacy;
  // 1:1 décomp `CB2_PartyMenuFromStartMenu` (party_menu.c:5354) :
  //   InitPartyMenu(PARTY_MENU_TYPE_FIELD, PARTY_LAYOUT_SINGLE,
  //                 PARTY_ACTION_CHOOSE_MON, FALSE, PARTY_MSG_CHOOSE_MON,
  //                 Task_HandleChooseMonInput, CB2_ReturnToFieldWithOpenMenu);
  _menuType = PARTY_MENU_TYPE_FIELD;
  _partyAction = PARTY_ACTION_CHOOSE_MON;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
    rt.SetMainCallback2(CB2_InitPartyMenu);
  }).catch((e) => {
    console.error('[party-screen] preload failed', e);
  });
}

// ─── Mode DAYCARE (dépôt pension) — 1:1 party_menu.c:6197-6231 ───────────────

/** 1:1 décomp `void ChooseMonForDaycare(void)` (party_menu.c:6197-6200) :
 *  ```c
 *  InitPartyMenu(PARTY_MENU_TYPE_DAYCARE, PARTY_LAYOUT_SINGLE, PARTY_ACTION_CHOOSE_MON,
 *      FALSE, PARTY_MSG_CHOOSE_MON_2, Task_HandleChooseMonInput, BufferMonSelection);
 *  ```
 *  keepCursorPos=FALSE → slotId=0. exitCallback (= gMain.savedCallback chez nous)
 *  = BufferMonSelection. Appelée par ChooseSendDaycareMon (daycare.ts) via le pont
 *  globalThis (cycle ESM party_menu → overworld → script_pokemon_util → daycare). */
export function ChooseMonForDaycare(): void {
  if (_isOpen) return;
  _menuType = PARTY_MENU_TYPE_DAYCARE;
  _partyAction = PARTY_ACTION_CHOOSE_MON;
  _slotId = 0;  // keepCursorPos = FALSE
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = BufferMonSelection;  // gPartyMenu.exitCallback
    rt.SetMainCallback2(CB2_InitPartyMenu);
  }).catch((e) => {
    console.error('[party-screen] daycare preload failed', e);
  });
}

/** 1:1 décomp `static void BufferMonSelection(void)` (party_menu.c:6208-6215) :
 *  ```c
 *  gSpecialVar_0x8004 = GetCursorSelectionMonId();
 *  if (gSpecialVar_0x8004 >= PARTY_SIZE) gSpecialVar_0x8004 = PARTY_NOTHING_CHOSEN;
 *  gFieldCallback2 = CB2_FadeFromPartyMenu;
 *  SetMainCallback2(CB2_ReturnToField);
 *  ```
 *  Tourne comme CB2 (exitCallback) après le teardown du party menu. */
function BufferMonSelection(): void {
  let monId = GetCursorSelectionMonId();
  if (monId >= PARTY_SIZE) monId = PARTY_NOTHING_CHOSEN;
  VarSet(0x8004, monId);  // gSpecialVar_0x8004
  (globalThis as Record<string, unknown>).gFieldCallback2 = CB2_FadeFromPartyMenu;
  getRuntime().SetMainCallback2(CB2_ReturnToField_Manual);
}

/** 1:1 décomp `bool8 CB2_FadeFromPartyMenu(void)` (party_menu.c:6217-6222) :
 *  FadeInFromBlack() + CreateTask(Task_PartyMenuWaitForFade, 10) ; return TRUE.
 *  Tourne via gFieldCallback2 (RunFieldCallback_Manual, retour-field case 2).
 *  FillPalBufferBlack AVANT le fade = pattern anti-flash établi
 *  (FieldCallback_PrepareFadeInFromMenu ci-dessus). */
function CB2_FadeFromPartyMenu(): boolean {
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);  // = FadeInFromBlack()
  getRuntime().CreateTask(Task_PartyMenuWaitForFade, 10);
  return true;
}

/** 1:1 décomp `static void Task_PartyMenuWaitForFade(u8 taskId)` (party_menu.c:6224-6231) :
 *  ```c
 *  if (IsWeatherNotFadingIn()) {
 *      DestroyTask(taskId);
 *      UnlockPlayerFieldControls();
 *      ScriptContext_Enable();
 *  }
 *  ```
 *  + SignalWaitState (port : l'opcode `waitstate` du byte-VM — appendu après
 *  `special ChooseSendDaycareMon`, def_special waitstate=1 — attend le latch). */
function Task_PartyMenuWaitForFade(task: DecompTask): void {
  if (IsWeatherNotFadingIn()) {
    getRuntime().DestroyTask(task.taskId);
    UnlockPlayerFieldControls();
    ScriptContext_Enable();
    ((globalThis as Record<string, unknown>).__SignalWaitState as (() => void) | undefined)?.();
  }
}

/** 1:1 décomp `CB2_ShowPartyMenuForItemUse` (party_menu.c:4225-4274) — entrée
 *  party menu en mode item-use (= user choisit un mon target pour Medicine,
 *  TMHM, EvolutionStone, etc.). Le décomp :
 *
 *      InitPartyMenu(PARTY_MENU_TYPE_FIELD, PARTY_LAYOUT_SINGLE,
 *                    PARTY_ACTION_USE_ITEM, TRUE, PARTY_MSG_USE_ON_WHICH_MON,
 *                    Task_HandleChooseMonInput, CB2_ReturnToBagMenu);
 *
 *  Notre TS : OpenPartyScreen async (preload assets) → set state AVANT le
 *  switch CB2. `gItemUseCB` doit avoir été assigné par `SetUpItemUseCallback`
 *  AVANT cet appel (= flow décomp item_use.c:755 + 98). Le `returnBagCb`
 *  fourni est attribué à `gMain.savedCallback` (= CB2_ReturnToBagMenu).
 *
 *  Le décomp dispatche aussi un cas spécial ITEM_EFFECT_SACRED_ASH (= auto-
 *  select premier mon KO + task=Task_SetSacredAshCB). Pas porté (Sacred Ash
 *  = fallback DadsAdvice actuellement). */
export function OpenPartyScreenForItemUse(returnBagCb: () => void): void {
  if (_isOpen) return;
  _menuType = PARTY_MENU_TYPE_FIELD;
  _partyAction = PARTY_ACTION_USE_ITEM;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = returnBagCb;
    rt.SetMainCallback2(CB2_InitPartyMenu);
  }).catch((e) => {
    console.error('[party-screen] preload failed', e);
  });
}

/** 1:1 décomp `ChooseMonForInBattleItem(void)` (party_menu.c:5781) :
 *    InitPartyMenu(PARTY_MENU_TYPE_IN_BATTLE, GetPartyLayoutFromBattleType(),
 *                  PARTY_ACTION_USE_ITEM, FALSE, PARTY_MSG_USE_ON_WHICH_MON,
 *                  Task_HandleChooseMonInput, CB2_ReturnToBagMenu);
 *    ReshowBattleScreenDummy(); UpdatePartyToBattleOrder();
 *
 *  Ouvre l'écran party pour choisir le mon-cible d'un objet utilisé EN COMBAT
 *  (Medicine / PPRecovery). Posé sur `gBagMenu->newScreenCallback` par
 *  `ItemUseInBattle_ShowPartyMenu` (item_use.c:1012) → le sac se ferme VERS le
 *  party-menu ; le retour se fait via `CB2_ReturnToBagMenu` (savedCallback) qui
 *  rouvre le sac, lequel se referme vers le reshow combat.
 *
 *  Réutilise `OpenPartyScreenForItemUse(CB2_ReturnToBagMenu)` = MÊME InitPartyMenu
 *  (PARTY_ACTION_USE_ITEM, PARTY_MSG_USE_ON_WHICH_MON, Task_HandleChooseMonInput,
 *  CB2_ReturnToBagMenu) que le chemin FIELD. Divergences déjà actées (idem
 *  `OpenPartyScreenForBattleSwitch`) : PARTY_MENU_TYPE_FIELD/LAYOUT_SINGLE au lieu de
 *  IN_BATTLE/GetPartyLayoutFromBattleType (le port ne branche pas sur le type combat) ;
 *  `ReshowBattleScreenDummy` = corps vide décomp (no-op) ; `UpdatePartyToBattleOrder`
 *  (réindex ordre-combat) n'est requis que pour le send-out multi/double — en solo la
 *  cible = slot choisi 1:1 (gPlayerParty non réordonnée hors switch). Résolu via pont
 *  globalThis `__ChooseMonForInBattleItem` (posé plus bas) pour éviter le cycle
 *  item_use↔party_menu. */
export function ChooseMonForInBattleItem(): void {
  _inBattleItemUse = true;  // = gPartyMenu.menuType = PARTY_MENU_TYPE_IN_BATTLE (structs éclatées)
  OpenPartyScreenForItemUse(CB2_ReturnToBagMenu);
}

/** = `gPartyMenu.menuType == PARTY_MENU_TYPE_IN_BATTLE` pour LE flux item-combat
 *  (le port n'a pas encore la struct gPartyMenu — flag transient équivalent,
 *  posé par ChooseMonForInBattleItem, reset au close du party). */
let _inBattleItemUse = false;

/** 1:1 décomp `CB2_SetUpExitToBattleScreen` (party_menu.c:6119) :
 *  `SetMainCallback2(CB2_SetUpReshowBattleScreenAfterMenu)`. Résolu via le pont
 *  reshow `__CB2_SetUpReshowBattleScreenAfterMenu2` — posé par
 *  `_OpenBagAndChooseItem` (battle_controller_player.ts) AVANT l'ouverture du
 *  sac de combat, donc garanti présent quand ce flux tourne. */
function _CB2_SetUpExitToBattleScreen(): void {
  const cb = (globalThis as Record<string, unknown>).__CB2_SetUpReshowBattleScreenAfterMenu2 as (() => void) | undefined;
  if (cb) { cb(); return; }
  console.error('[party_menu] __CB2_SetUpReshowBattleScreenAfterMenu2 absent (exit item-combat → reshow)');
}

// ─── LOT 7 : switch combat 1:1 (party_menu.c:3505/5788/5800) ─────────────────

/** 1:1 décomp `gPartyMenuUseExitCallback` (extern bool8) : TRUE = le party se ferme
 *  suite à un CHOIX effectif (switch validé / item utilisé) ; FALSE = annulation.
 *  Lu par `WaitForMonSelection` (battle_controller_player) au retour du reshow. */
export let gPartyMenuUseExitCallback = false;
/** 1:1 décomp `gSelectedMonPartyId` (extern u8) : id FIELD du mon choisi au switch. */
export let gSelectedMonPartyId = 0;
/** = gStringVar4 bufferisé par TrySwitchInPokemon (message d'erreur) pour CursorCb_SendMon. */
let _switchInMsg: string | null = null;

/** Forme du pont __battlePartyOrder (battle_main.ts) utilisée par le flux switch —
 *  les briques 1:1 y vivent (= les `extern` du .c ; import statique = arête TDZ). */
interface BattlePartyOrderBridge {
  openBattleOrder(activePartyId: number): number;
  closeBattleOrder(): void;
  GetPartyIdFromBattleSlot(slot: number): number;
  GetPartyIdFromBattlePartyId(battlePartyId: number): number;
  SwitchPartyMonSlots(slot: number, slot2: number): void;
  SwapPartyPokemon(a: number, b: number): void;
  switchInDeps(): {
    battlersCount: number; partyIndexes: number[]; sides: number[];
    battlerInMenuId: number; prevSelectedPartySlot: number;
  };
}
function _battlePartyOrderBridge(): BattlePartyOrderBridge | null {
  return ((globalThis as Record<string, unknown>).__battlePartyOrder as BattlePartyOrderBridge | undefined) ?? null;
}

/** 1:1 `GetPartyMenuActionsTypeInBattle` (party_menu.c:5788-5798) :
 *  party[1] non vide && mon pas un œuf → SEND_OUT si action==PARTY_ACTION_SEND_OUT,
 *  sinon SHIFT (hors BATTLE_TYPE_ARENA — Frontier, hors-solo) ; sinon SUMMARY_ONLY. */
function GetPartyMenuActionsTypeInBattle(mon: Pokemon): number {
  const second = _party()[1];
  if ((second?.species ?? 0) !== 0 && !mon.isEgg) {   // 1:1 :5790
    if (_partyAction === PARTY_ACTION_SEND_OUT) return ACTIONS_SEND_OUT;  // 1:1 :5792
    return ACTIONS_SHIFT;   // 1:1 :5794 (!(gBattleTypeFlags & BATTLE_TYPE_ARENA) — solo)
  }
  return ACTIONS_SUMMARY_ONLY;                        // 1:1 :5797
}

/** 1:1 `TrySwitchInPokemon` (party_menu.c:5800-5857), branche SOLO (le bloc
 *  partenaire multi :5806-5811 est hors-solo : IsMultiBattle() = FALSE).
 *  Échec → bufferise le message (= gStringVar4) dans `_switchInMsg` et renvoie
 *  false ; succès → gSelectedMonPartyId + gPartyMenuUseExitCallback + swap
 *  ordre-combat + swap physique (briques battle_main via le pont). */
function TrySwitchInPokemon(): boolean {
  const slot = _slotId;                        // 1:1 :5802 GetCursorSelectionMonId()
  const mon = _party()[slot];
  const po = _battlePartyOrderBridge();
  // 1:1 :5813-5818 : mon K.O. → « {mon} n'a plus d'énergie pour combattre! »
  if (!mon || (mon.hp ?? 0) === 0) {
    _switchInMsg = _preparePartyMsg(getString('gText_PkmnHasNoEnergy') || '', mon?.nickname ?? '');
    return false;
  }
  if (!po) { console.error('[party_menu] TrySwitchInPokemon : pont __battlePartyOrder absent'); return false; }
  const deps = po.switchInDeps();
  // 1:1 :5819-5827 : mon déjà sur le terrain → « {mon} est déjà au combat! »
  for (let i = 0; i < deps.battlersCount; i++) {
    if (deps.sides[i] === 0 /* B_SIDE_PLAYER */ && po.GetPartyIdFromBattleSlot(slot) === deps.partyIndexes[i]) {
      _switchInMsg = _preparePartyMsg(getString('gText_PkmnAlreadyInBattle') || '', mon.nickname ?? '');
      return false;
    }
  }
  // 1:1 :5828-5832 : œuf → « Un ŒUF ne se bat pas, voyons! »
  if (mon.isEgg) {
    _switchInMsg = _preparePartyMsg(getString('gText_EggCantBattle') || '');
    return false;
  }
  // 1:1 :5833-5837 : déjà sélectionné ce tour (doubles) → « {mon} est déjà sélectionné. »
  if (po.GetPartyIdFromBattleSlot(slot) === deps.prevSelectedPartySlot) {
    _switchInMsg = _preparePartyMsg(getString('gText_PkmnAlreadySelected') || '', mon.nickname ?? '');
    return false;
  }
  // 1:1 :5838-5842 : PARTY_ACTION_ABILITY_PREVENTS → SetMonPreventsSwitchingString()
  // (pokemon.c:6618). DETTE battle_message (placeholders {B_*} non résolus — comme
  // le flavor X-items) : texte ROM brut en attendant le port de battle_message.
  if (_partyAction === PARTY_ACTION_ABILITY_PREVENTS) {
    _switchInMsg = _preparePartyMsg(getString('gText_PkmnsXPreventsSwitching') || '');
    return false;
  }
  // 1:1 :5843-5849 : PARTY_ACTION_CANT_SWITCH → « {battler courant} ne peut pas être échangé! »
  if (_partyAction === PARTY_ACTION_CANT_SWITCH) {
    const curNick = _party()[po.GetPartyIdFromBattlePartyId(deps.partyIndexes[deps.battlerInMenuId] ?? 0)]?.nickname ?? '';
    _switchInMsg = _preparePartyMsg(getString('gText_PkmnCantSwitchOut') || '', curNick);
    return false;
  }
  // 1:1 :5851-5856 : succès.
  gSelectedMonPartyId = po.GetPartyIdFromBattleSlot(slot);                       // 1:1 :5851
  gPartyMenuUseExitCallback = true;                                              // 1:1 :5852
  const newSlot = po.GetPartyIdFromBattlePartyId(deps.partyIndexes[deps.battlerInMenuId] ?? 0);  // 1:1 :5853
  po.SwitchPartyMonSlots(newSlot, slot);                                         // 1:1 :5854
  po.SwapPartyPokemon(newSlot, slot);                                            // 1:1 :5855
  return true;
}

/** 1:1 `CursorCb_SendMon` (party_menu.c:3505-3520) : PlaySE + retire le menu
 *  d'action (windowId[0]) ; TrySwitchInPokemon TRUE → Task_ClosePartyMenu (l'exit
 *  in-battle = reshow via savedCallback) ; FALSE → retire la msgbox (windowId[1]),
 *  affiche gStringVar4 (= _switchInMsg) et Task_ReturnToChooseMonAfterText. */
function CursorCb_SendMon(taskId: number): void {
  PlaySE(5);                                   // 1:1 :3507 SE_SELECT
  if (_actionWindowId >= 0) {                  // 1:1 :3508 PartyMenuRemoveWindow(&windowId[0])
    ClearStdWindowAndFrame(_actionWindowId, false);
    CopyWindowToVram(_actionWindowId, 3);
    RemoveWindow(_actionWindowId);
    _actionWindowId = -1;
  }
  _actionList = [];
  _actionCursor = 0;
  if (TrySwitchInPokemon()) {
    ClosePartyScreen();                        // 1:1 :3511 Task_ClosePartyMenu
  } else {
    // 1:1 :3515-3517 : gStringVar4 = message d'erreur bufferisé par TrySwitchInPokemon.
    if (_msgWid >= 0) {                        // 1:1 PartyMenuRemoveWindow(&windowId[1])
      ClearStdWindowAndFrame(_msgWid, false);
      CopyWindowToVram(_msgWid, 3);
      RemoveWindow(_msgWid);
      _msgWid = -1;
    }
    _itemUsedMsgText = _switchInMsg;
    _switchInMsg = null;
    _actionSubMenu = 'mon';
    _phase = 'field_move_err';  // = gTasks[taskId].func = Task_ReturnToChooseMonAfterText (:3517)
    _drawMsg();
  }
  void taskId;
}

/** Étape 4 (combat) : ouvre l'écran party pour le switch. 1:1 décomp
 *  `OpenPartyMenuInBattle(partyAction)` (party_menu.c:5774) →
 *  `InitPartyMenu(PARTY_MENU_TYPE_IN_BATTLE, GetPartyLayoutFromBattleType(),
 *  partyAction, FALSE, PARTY_MSG_CHOOSE_MON, Task_HandleChooseMonInput,
 *  CB2_SetUpReshowBattleScreenAfterMenu)` + ReshowBattleScreenDummy (no-op)
 *  + UpdatePartyToBattleOrder.
 *
 *  - `returnCb` = exitCallback (= CB2_SetUpReshowBattleScreenAfterMenu).
 *  - `opts.activeSlot` = gBattlerPartyIndexes[battler] (id FIELD de l'actif).
 *  - `opts.caseId` = partyAction 1:1 (bufferA[1]&0xF) : 0 = CHOOSE_MON (switch
 *    volontaire, B annule), 1 = SEND_OUT (forcé K.O., B → SE_FAILURE),
 *    2 = CANT_SWITCH / 4 = ABILITY_PREVENTS (TrySwitchInPokemon affiche l'erreur).
 *
 *  Le résultat est lu par WaitForMonSelection via les globals 1:1
 *  `gPartyMenuUseExitCallback` / `gSelectedMonPartyId` (exports live-binding). */
export function OpenPartyScreenForBattleSwitch(
  returnCb: () => void,
  opts: { activeSlot: number; caseId: number },
): void {
  if (_isOpen) return;
  _menuType = PARTY_MENU_TYPE_IN_BATTLE;   // 1:1 :5776 PARTY_MENU_TYPE_IN_BATTLE
  _partyAction = opts.caseId;              // 1:1 :5776 partyAction = caseId (bufferA[1]&0xF)
  gPartyMenuUseExitCallback = false;       // 1:1 InitPartyMenu (reset transient)
  gSelectedMonPartyId = 0;
  _switchInMsg = null;
  // 1:1 :5778 UpdatePartyToBattleOrder : le menu vit en ORDRE BATTLE — gPlayerParty
  // réordonnée physiquement (l'ACTIF au slot affiché 0) et RESTAURÉE à la fermeture
  // (closeBattleOrder dans ClosePartyScreen). opts.activeSlot = id FIELD.
  const po = _battlePartyOrderBridge();
  _battleSwitchActivePartyId = opts.activeSlot;
  if (po) {
    po.openBattleOrder(opts.activeSlot);
    _battleOrderApplied = true;
  }
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = returnCb;
    rt.SetMainCallback2(CB2_InitPartyMenu);
  }).catch((e) => {
    console.error('[party-screen] battle-switch preload failed', e);
  });
}

/** Slot courant (= gPartyMenu.slotId) — exposé pour ItemUseCB_Medicine etc. */
export function GetPartyScreenSlotId(): number {
  return _slotId;
}

/** Affiche un message FR dans WIN_MSG party-screen (= 1:1 décomp
 *  `DisplayPartyMenuMessage(text, TRUE)` party_menu.c:4423/4447/etc.) puis
 *  attend l'ack press A_BUTTON. Au A_BUTTON → ClosePartyScreen → retour
 *  via savedCallback (= CB2_ReturnToBagMenu). */
export function ShowPartyMenuItemMessage(text: string): void {
  _itemUsedMsgText = text;
  _phase = 'item_used_msg';
  _drawMsg();
}

// ─── Boîte de stats level-up (Super Bonbon / Rare Candy) — 1:1 party_menu.c ──

/** 1:1 décomp `CreateLevelUpStatsWindow` (party_menu.c:2578) :
 *  AddWindow(sLevelUpStatsWindowTemplate) + DrawStdFrameWithCustomTileAndPalette. */
function CreateLevelUpStatsWindow(): number {
  _lvlUpStatsWinId = AddWindow(LEVEL_UP_STATS_WINDOW_TEMPLATE);
  DrawStdFrameWithCustomTileAndPalette(_lvlUpStatsWinId, false, 0x4F, 13);
  return _lvlUpStatsWinId;
}

/** 1:1 décomp `RemoveLevelUpStatsWindow` (party_menu.c:2585) : ClearWindowTilemap
 *  + PartyMenuRemoveWindow(&windowId). 🐛 fix 2026-07-02 : PartyMenuRemoveWindow
 *  (party_menu.c:2570) fait AUSSI ClearStdWindowAndFrameToTransparent — sans lui,
 *  le CADRE std (qui déborde d'1 tile autour de la fenêtre) restait affiché en
 *  boîte vide après le Super Bonbon (signalé user ; même pattern que _drawMsg). */
function RemoveLevelUpStatsWindow(): void {
  if (_lvlUpStatsWinId < 0) return;
  ClearStdWindowAndFrame(_lvlUpStatsWinId, false);
  CopyWindowToVram(_lvlUpStatsWinId, 3);
  ClearWindowTilemap(_lvlUpStatsWinId);
  RemoveWindow(_lvlUpStatsWinId);   // 1:1 PartyMenuRemoveWindow
  _lvlUpStatsWinId = -1;
  ScheduleBgCopyTilemapToVram(2);   // pousse le clear → la box disparaît.
}

/** 1:1 décomp `DisplayLevelUpStatsPg1` (party_menu.c:5029) : crée la box +
 *  DrawLevelUpWindowPg1(win, before, after, WHITE, DARK_GRAY, LIGHT_GRAY) +
 *  CopyWindowToVram + ScheduleBgCopyTilemapToVram(2). Page 1 = deltas (+/-N). */
function DisplayLevelUpStatsPg1(): void {
  const win = CreateLevelUpStatsWindow();
  // 1:1 :5034 couleurs party = TEXT_COLOR_WHITE(1)/DARK_GRAY(2)/LIGHT_GRAY(3).
  DrawLevelUpWindowPg1(win, _lvlUpStatsBefore, _lvlUpStatsAfter, 1, 2, 3);
  // Port : COPYWIN_FULL(3) (= comme _drawMsg) pousse gfx+tilemap ensemble (la
  // décomp fait GFX(2) + ScheduleBgCopy ; résultat affiché identique).
  CopyWindowToVram(win, 3);
  ScheduleBgCopyTilemapToVram(2);
}

/** 1:1 décomp `DisplayLevelUpStatsPg2` (party_menu.c:5039) : DrawLevelUpWindowPg2
 *  (win, after, WHITE, DARK_GRAY, LIGHT_GRAY). Page 2 = nouveaux totaux. */
function DisplayLevelUpStatsPg2(): void {
  if (_lvlUpStatsWinId < 0) return;
  DrawLevelUpWindowPg2(_lvlUpStatsWinId, _lvlUpStatsAfter, 1, 2, 3);
  CopyWindowToVram(_lvlUpStatsWinId, 3);
  ScheduleBgCopyTilemapToVram(2);
}

/** Lance la séquence boîte de stats level-up (= queue de `ItemUseCB_RareCandy`,
 *  party_menu.c:4982-4992 : PlayFanfareByFanfareNum(FANFARE_LEVEL_UP) +
 *  DisplayPartyMenuMessage("X est promu au N.Y") + func=Task_DisplayLevelUpStatsPg1).
 *  `statsBefore`/`statsAfter` = stats STAT_-indexées AVANT/APRÈS le level-up
 *  (cf. GetMonLevelUpWindowStats). L'appelant a DÉJÀ appliqué l'effet + retiré
 *  l'objet du sac + rafraîchi le slot party. */
export function ShowLevelUpStatsBox(
  statsBefore: number[],
  statsAfter: number[],
  msg: string,
): void {
  _lvlUpStatsBefore = statsBefore;
  _lvlUpStatsAfter = statsAfter;
  // 1:1 :4984 PlayFanfareByFanfareNum(FANFARE_LEVEL_UP) — index sFanfares (=0),
  // PAS le songNum MUS_LEVEL_UP (sFanfares[MUS_LEVEL_UP] = undefined → crash).
  PlayFanfareByFanfareNum(FANFARE_LEVEL_UP);
  // 1:1 :4990 DisplayPartyMenuMessage("X est promu au N.Y", TRUE) → WIN_MSG.
  _itemUsedMsgText = msg;
  // 1:1 :4992 func = Task_DisplayLevelUpStatsPg1 (attend fanfare finie + A/B).
  _phase = 'levelup_pg1';
  _drawMsg();
}

/** 1:1-sem `DisplayPartyPokemonHPCheck/MaxHPCheck/HPBarCheck + SetPartyMon
 *  AilmentGfx` (party_menu.c:4440-4442) — redraw le slot N pour refléter
 *  l'état actuel du mon (HP modifié + status cleared par item use).
 *  Appelé après use d'item Medicine pour que le user voit le delta HP +
 *  le status icon updated DANS la party box (= avant le message). */
export function RefreshPartySlot(slotIdx: number): void {
  if (slotIdx < 0 || slotIdx >= 6) return;
  // 1:1 décomp : redraw frame d'abord (= clear pixel buffer slot), PUIS text
  // par-dessus. Sans le frame reset, AddTextPrinter empile par-dessus l'ancien
  // text (= bug "PV d'avant sous PV d'après" observé).
  _drawSlotFrame(slotIdx);
  _drawSlot(slotIdx);
}

/** 1:1 décomp `PartyMenuModifyHP(taskId, slot, direction, delta, callback)`
 *  (party_menu.c:5455). Anime le HP bar frame-par-frame du oldHp au targetHp
 *  via `direction` (+1 heal / -1 damage). À chaque tick : incrémente
 *  `mon.hp` + redraw le slot. À la fin (delta atteint) : appelle
 *  `onDone()`.
 *
 *  Le caller (ItemUseCB_Medicine) doit avoir DÉJÀ appliqué l'effet (=
 *  mon.hp = newHp post-heal). Cette fonction reverse momentanément
 *  pour démarrer l'anim depuis oldHp, puis incrémente jusqu'à newHp.
 *
 *  `onDone` est typiquement `() => ShowPartyMenuItemMessage(msg)` (= 1:1
 *  décomp Task_DisplayHPRestoredMessage chained). */
export function PartyMenuAnimateHP(
  slotIdx: number,
  oldHp: number,
  newHp: number,
  onDone: () => void,
): void {
  const party = _party();
  const mon = party[slotIdx];
  if (!mon) { onDone(); return; }
  const delta = newHp - oldHp;
  if (delta === 0) { onDone(); return; }
  // Reverse à oldHp pour démarrer l'anim.
  mon.hp = oldHp;
  _hpAnimSlot = slotIdx;
  _hpAnimDirection = delta > 0 ? 1 : -1;
  _hpAnimRemaining = Math.abs(delta);
  _hpAnimOnDone = onDone;
  _hpAnimFrameCounter = 0;
  _phase = 'hp_anim';
  // Initial frame at oldHp : redraw frame d'abord (= clear pixel buffer
  // slot) PUIS text par-dessus. Sans le frame reset, AddTextPrinter empile
  // par-dessus l'ancien text (bug "20/20" reste visible alors que HP=5).
  _drawSlotFrame(slotIdx);
  _drawSlot(slotIdx);
}

/** 1:1 décomp `Task_PartyMenuModifyHP` (party_menu.c:1839-1856) : task func qui
 *  tick le HP bar frame-par-frame (appelée par Task_PartyMenu_HandleInput pendant
 *  `_phase==='hp_anim'`). ÉCARTS port : (a) l'état vit en module-scope
 *  (`_hpAnimSlot/_hpAnimDirection/_hpAnimRemaining`) au lieu de gTasks[taskId].data
 *  (tHP/tHPIncrement/tHPToAdd/tPartyId) → `taskId` inutilisé ; (b) la condition
 *  de fin est `_hpAnimRemaining <= 0` (le décomp = `tHPToAdd==0 || tHP==0 ||
 *  tHP==tMaxHP` — clamps équivalents, la cible est déjà clampée à [0,maxHP] par
 *  l'appelant) ; (c) le buffer « PV récupérés » (ConvertIntToDecimalStringN
 *  gStringVar2, :1852) est calculé séparément (`_softboiledAmount`) ; (d)
 *  SwitchTaskToFollowupFunc → callback `_hpAnimOnDone`. */
function Task_PartyMenuModifyHP(taskId: number): void {
  // 1:1 décomp PartyMenuModifyHP (party_menu.c:1839) : tick chaque frame
  // (= 60Hz / GBA) avec 1 HP/frame fixed. La "smoothness" perçue ROM vient
  // du REDRAW HP bar à 60Hz qui interpole visuellement entre les sauts.
  // ticksPerHp=1 = ROM-exact. Pour Pokemons à petit maxHp (= peu de pixels
  // par PV), l'anim est rapide mais visuellement smooth grâce à 16ms/tick.
  _hpAnimFrameCounter++;
  const ticksPerHp = 1;  // 1:1 décomp = 1 HP/frame (60Hz, ~16ms/HP).
  if (_hpAnimFrameCounter < ticksPerHp) return;
  _hpAnimFrameCounter = 0;
  const party = _party();
  const mon = party[_hpAnimSlot];
  if (!mon) {
    // Mon disparu en cours d'anim → cancel + onDone.
    const cb = _hpAnimOnDone; _hpAnimOnDone = null;
    cb?.();
    return;
  }
  mon.hp += _hpAnimDirection;
  _hpAnimRemaining--;
  // 1:1 décomp :1846-1847 DisplayPartyPokemonHPCheck + HPBarCheck —
  // redraw HP bar + text. Notre RefreshPartySlot (= _drawSlotFrame +
  // _drawSlot) clear le pixel buffer avant text → pas d'empilement.
  RefreshPartySlot(_hpAnimSlot);
  if (_hpAnimRemaining <= 0) {
    const cb = _hpAnimOnDone; _hpAnimOnDone = null;
    _hpAnimSlot = -1;
    cb?.();  // 1:1 :1854 SwitchTaskToFollowupFunc(taskId)
  }
  void taskId;
}

/** 1:1 décomp `CB2_ShowPokemonSummaryScreen` (party_menu.c:2777) :
 *
 *      ShowPokemonSummaryScreen(SUMMARY_MODE_NORMAL, gPlayerParty,
 *          gPartyMenu.slotId, gPlayerPartyCount - 1,
 *          CB2_ReturnToPartyMenuFromSummaryScreen);
 *
 *  Le décomp est SYNCHRONE (ShowPokemonSummaryScreen → SetMainCallback2 dans
 *  la même frame). Notre `OpenSummaryScreen` est async (_loadAssets), donc ce
 *  CB2 est rappelé chaque frame jusqu'au SetMainCallback2(CB2_InitSummaryScreen)
 *  interne → garde one-shot `_showSummaryPending`. */
export function CB2_ShowPokemonSummaryScreen_Manual(): void {
  if (_showSummaryPending) return;
  _showSummaryPending = true;
  const mon = _summaryTargetMon;
  _summaryTargetMon = null;
  if (mon) OpenSummaryScreen(mon, CB2_ReturnToPartyMenuFromSummary);
}

/** 1:1 décomp `CB2_ReturnToPartyMenuFromSummaryScreen` (party_menu.c:2790) :
 *
 *      gPaletteFade.bufferTransferDisabled = TRUE;
 *      gPartyMenu.slotId = gLastViewedMonIndex;
 *      InitPartyMenu(gPartyMenu.menuType, KEEP_PARTY_LAYOUT, gPartyMenu.action,
 *          TRUE, PARTY_MSG_DO_WHAT_WITH_MON, Task_TryCreateSelectionWindow,
 *          gPartyMenu.exitCallback);
 *
 *  → ré-init du party menu, curseur (= slotId) sur le mon vu en dernier
 *  (`gLastViewedMonIndex`), ET la fenêtre de sélection (RESUME/OBJET/RETOUR)
 *  se RÉ-OUVRE sur ce mon (Task_TryCreateSelectionWindow + PARTY_MSG_DO_WHAT
 *  _WITH_MON). On NE touche PAS gMain.savedCallback (= gPartyMenu.exitCallback
 *  préservé : B depuis party revient à l'ouvreur d'origine = start menu). */
export function CB2_ReturnToPartyMenuFromSummary(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gPaletteFade.bufferTransferDisabled = true;  // 1:1 décomp :2792
  // Le résumé a écrasé l'état visuel (VRAM/sprites/windows) → on force une
  // ré-init complète du party menu (flags readiness reset). _freePartyMenu
  // n'a PAS été appelé → _slotId est settable directement (1:1 slot = mon vu).
  _isOpen = false;
  _phase = 'idle';
  _graphicsReady = false; _graphicsLoading = false;
  _windowsReady = false; _windowsLoading = false;
  _showSummaryPending = false;
  _slotId = GetSummaryLastMonIndex();  // 1:1 gPartyMenu.slotId = gLastViewedMonIndex
  // 1:1 décomp : Task_TryCreateSelectionWindow → la fenêtre d'actions
  // (RESUME/OBJET/RETOUR) se ré-ouvre sur le mon vu (PARTY_MSG_DO_WHAT_WITH_MON).
  _reopenActionMenuAfterInit = true;
  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_InitPartyMenu);
}

export function ClosePartyScreen(): void {
  if (!_isOpen || _phase === 'fading_out') return;
  _giveFromBag = false;   // #12 : la session give-from-bag se termine à la fermeture.
  // 1:1 UpdatePartyToFieldOrder (party_menu.c) : TOUTE sortie du menu combat
  // (choix OU annulation B) restaure l'ordre FIELD de gPlayerParty + persiste
  // les nibbles (battlerPartyOrders) pour la prochaine ouverture.
  if (_battleOrderApplied) {
    const po = (globalThis as Record<string, unknown>).__battlePartyOrder as {
      closeBattleOrder?: () => void;
    } | undefined;
    po?.closeBattleOrder?.();
    _battleOrderApplied = false;
  }
  _phase = 'fading_out';
  const rt = getRuntime();
  if (!rt) return;
  if (_inputTaskId >= 0) {
    rt.DestroyTask(_inputTaskId);
    _inputTaskId = -1;
  }
  rt.CreateTask(Task_FadeAndClosePartyMenu, 0);
}

// (LOT 9 : TickPartyScreen SUPPRIMÉ — stub vide, l'état start-menu 'party_screen'
// qui l'appelait n'était plus jamais posé.)

// Expose to globalThis.
{
  const _g: Record<string, unknown> = {
    CB2_InitPartyMenu, MainCB2_PartyMenuRun, VBlankCB_PartyMenuRun,
    Task_FadeAndClosePartyMenu, Task_ClosePartyMenu,
    OpenPartyScreen, OpenPartyScreenForItemUse, ClosePartyScreen,
    IsPartyScreenOpen, GetPartyScreenSlotId, ShowPartyMenuItemMessage,
    RefreshPartySlot, PartyMenuAnimateHP,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
// Ponts pension (daycare.ts — cycle ESM party_menu → overworld →
// script_pokemon_util → daycare, vérifié scripts/find-import-cycle.cjs) :
// posés par le module PROPRIÉTAIRE (party_menu.c est le foyer des deux fns).
(globalThis as Record<string, unknown>).__ChooseMonForDaycare = ChooseMonForDaycare;
(globalThis as Record<string, unknown>).__GetCursorSelectionMonId = GetCursorSelectionMonId;
// Pont anti-cycle item_use→party_menu : `ItemUseInBattle_ShowPartyMenu` (item_use.ts)
// pose `gBagMenu.newScreenCallback = _ChooseMonForInBattleItem` qui résout ceci
// (party_menu.c = foyer de ChooseMonForInBattleItem).
(globalThis as Record<string, unknown>).__ChooseMonForInBattleItem = ChooseMonForInBattleItem;

// ─── ItemIdToBattleMoveId 1:1 (party_menu.c:4688) — ex-tmhm-moves.ts (lot 10) ──
/** 1:1 décomp `party_menu.c:4688` :
 *    u16 ItemIdToBattleMoveId(u16 item) {
 *      u16 tmNumber = item - ITEM_TM01;
 *      return sTMHMMoves[tmNumber];
 *    }
 *  Retour = identifiant enum move ("MOVE_X") 1:1-sém (cf. en-tête) ;
 *  `gMoveNames[...]` côté appelant = `getMoveName(thisResult)`. */
export function ItemIdToBattleMoveId(item: number): string {
  const tmNumber = item - _ITEM_TM01_TM;
  return _sTMHMMoves_TM[tmNumber];
}
