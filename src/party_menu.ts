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
 * MVP scope (= 1ère itération, polish à venir) :
 *   - 6 slots avec text rendering (nickname, Lv, HP)
 *   - Pokémon icon OAM per slot (16×16, animated front)
 *   - Bottom dialog "Choisir un PKMN ou annuler"
 *   - SORTIR button (= text, polish icon plus tard)
 *   - A/B/START close
 *
 * Future polish :
 *   - HP bar tilemap (= rendre la barre verte/jaune/rouge)
 *   - Gender symbol ♂/♀
 *   - Status icon (= PSN/PAR/etc.)
 *   - Held item icon (hold_icons.png)
 *   - Cursor highlight (= ROM utilise palette swap par slot)
 *   - Action menu (RESUME / OBJET / RETOUR au press A)
 *   - Stats pages flip (= INFOS / APTITU / CAPACITES)
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
import { ItemIdToBattleMoveId } from './engine/pokemon/tmhm-moves';
import { ITEM_TM01, ITEM_HM01 } from '../include/constants/items';
import { FRIENDSHIP_EVENT_LEARN_TMHM, MON_HAS_MAX_MOVES } from '../include/constants/pokemon';
import { BeginEvolutionScene, SetCB2AfterEvolution } from './evolution_scene';
import { gMoveToLearn } from './engine/battle/state';
import { PlayFanfare } from '../harness/runtime/decomp-globals';
import { LoadSpritePalette, MarkObjTilesAllocated, ReserveSpritePaletteSlot, FreeSpritePaletteByTag, FreeAllSpritePalettes, ResetSpriteData } from './sprite';
import { GetGenderFromSpeciesAndPersonality } from './engine/battle/data/species-runtime';
import { MON_MALE, MON_FEMALE } from '../include/constants/pokemon';
import { PARTY_SIZE } from '../include/constants/global';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  BlendPalettes, ResetPaletteFade, ResetTasks, gMain,
  PlayFanfareByFanfareNum, WaitFanfare, FillPalBufferBlack,
} from '../harness/runtime/decomp-globals';
import { FlagGet, gSpecialVar } from './engine/script/script-vars';
import { MUS_LEVEL_UP, SE_FAILURE } from '../include/constants/songs';
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
import { getString } from './engine/ui/gba-strings';
import { MON_ICON_PALETTE_INDICES } from './engine/pokemon/pokemon-icon-palettes';
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
  PARTY_ACTION_SOFTBOILED,
  PARTY_MENU_TYPE_FIELD, PARTY_MENU_TYPE_DAYCARE, PARTY_NOTHING_CHOSEN,
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
// Étape 4 (switch en combat, mode PARTY_ACTION_SEND_OUT) : slot du mon ACTIF
// (interdit de le re-choisir) + si l'annulation B est permise (switch volontaire
// = oui ; choix forcé après K.O. = non). Lus par les handlers A/B SEND_OUT.
let _battleSwitchActiveSlot = -1;
let _battleSwitchAllowCancel = true;
/** Id FIELD du mon actif (pour chooseSwitchSlot 1:1) + flag « ordre battle posé ». */
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
    console.error('[party-screen] graphics load failed:', e);
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
function _blitSlotFrame(
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

/** Blit slot frame 1:1 décomp `BlitBitmapToPartyWindow_LeftColumn/RightColumn`. */
function _drawSlotFrame(slotIdx: number): void {
  if (!_assets) return;
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  const mon = _slotMon(slotIdx);
  // 1:1 décomp DisplayPartyPokemonData (:876) : un ŒUF blit la variante
  // NoHP (sSlotTilemap_MainNoHP/_WideNoHP) = box SANS label "PV"/barre.
  const isEgg = !!mon?.isEgg;
  if (slotIdx === 0) {
    // Slot 0 = LeftColumn : slot_main 10×7 (NoHP si œuf).
    _blitSlotFrame(wid, isEgg ? _assets.slotMainNoHpTilemap : _assets.slotMainTilemap, 10, 0, 0, 10, 7);
  } else {
    // Slots 1-5 = RightColumn : slot_wide (occupé) / NoHP (œuf) / empty (vide).
    const tm = !mon ? _assets.slotWideEmptyTilemap
      : isEgg ? _assets.slotWideNoHpTilemap : _assets.slotWideTilemap;
    _blitSlotFrame(wid, tm, 18, 0, 0, 18, 3);
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
function _displayPartyPokemonHP(wid: number, x: number, y: number, hp: number): void {
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
function _displayPartyPokemonMaxHP(wid: number, x: number, y: number, maxhp: number): void {
  gStringVar1[0] = CHAR_SLASH;
  ConvertIntToDecimalStringN(gStringVar1.subarray(1), maxhp, STR_CONV_MODE_RIGHT_ALIGN, 3);
  AddTextPrinterParameterized3(wid, FONT_SMALL, x, y, COLOR_HP, TEXT_SKIP_DRAW, gStringVar1);
}

/** Render text for slot N. Positions 1:1 décomp `sPartyBoxInfoRects`
 *  (party_menu.h:32) — Nickname/Level/HP/MaxHP fixed coords per box layout. */
function _drawSlot(slotIdx: number): void {
  if (_slotWindowIds[slotIdx] === undefined) return;
  const wid = _slotWindowIds[slotIdx];
  const mon = _slotMon(slotIdx);
  // 1:1 décomp RenderPartyMenuBox → SetPartyMonAilmentGfx + UpdatePartyMon
  // HeldItemSprite : rafraîchit icône statut + objet tenu du slot (sprites
  // slot-pinned, dérivés du mon courant).
  _updatePartyMonAilmentGfx(slotIdx);
  _updatePartyMonHeldItem(slotIdx);
  if (!mon) {
    // Slot vide : no text (= just empty frame déjà blit).
    CopyWindowToVram(wid, 3);
    return;
  }
  // 1:1 décomp `DisplayPartyPokemonData` (party_menu.c:872) : un ŒUF
  // n'affiche QUE le nickname (= "OEUF", GetMonNickname égg → gText_Egg
  // Nickname) — PAS de niveau / genre / PV / barre PV (blitFunc(.,TRUE)
  // blanchit ces zones). Le sprite icône = l'icône d'œuf (cf. _loadSlotIcon).
  if (mon.isEgg) {
    const eggName = getString('gText_EggNickname');  // "OEUF" (strings.c:21)
    if (slotIdx === 0) {
      AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
    } else {
      AddTextPrinterParameterized3(wid, FONT_SMALL, 22, 3, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
    }
    CopyWindowToVram(wid, 3);
    return;
  }
  // 1:1 décomp DisplayPartyPokemonGender (party_menu.c:2333) : symbol "♂"/"♀"
  // affiché à (64, 20) slot 0 left column ou (62, 12) slot 1-5 right column,
  // AVEC palette swap genderMale/Female aux positions TEXT_DYNAMIC_COLOR_2/3
  // de la sub-pal du slot. Color triple stays [0, 0xB, 0xC] for both genders.
  const _g = GetGenderFromSpeciesAndPersonality(mon.species, mon.personality);
  const gSym: 'M' | 'F' | null = _g === MON_MALE ? 'M' : _g === MON_FEMALE ? 'F' : null;
  const genderStr = gSym === 'M' ? '♂' : gSym === 'F' ? '♀' : '';
  if (genderStr) {
    const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum ?? 3;
    _loadGenderColors(slotPalNum, gSym === 'M');
  }
  // 1:1 décomp DisplayPartyPokemonLevelCheck (party_menu.c:2300-2312) : le
  // NIVEAU n'est dessiné QUE si ailment ∈ {AILMENT_NONE(0), AILMENT_PKRS(6)}.
  // Tout autre statut (PSN/PAR/SLP/FRZ/BRN) ou K.O. (HP=0=FNT) → niveau
  // BLANC, laissant la place à l'icône statut 32×8 (sinon : pixels du
  // niveau derrière l'icône burn = le bug rapporté). Genre/PV/barre NON
  // suppressés (1:1 :2323/:2356 — aucun check ailment).
  const _lvA = _ailmentFromStatus(mon);
  const showLevel = _lvA === 0 || _lvA === 6;
  if (slotIdx === 0) {
    // 1:1 décomp PARTY_BOX_LEFT_COLUMN (party_menu.h:32) :
    //   Nickname (24, 11) — width=40
    //   Level    (32, 20) — "N.X"
    //   Gender   (64, 20) — width 8x8
    //   HP       (38, 37)
    //   MaxHP    (53, 37)
    // 1:1 décomp DisplayPartyPokemonBarDetail (party_menu.c:2282) :
    //   AddTextPrinterParameterized3(windowId, FONT_SMALL, ...) — TOUT en FONT_SMALL.
    AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
    if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  32, 20, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
    if (genderStr) {
      AddTextPrinterParameterized3(wid, FONT_SMALL, 64, 20, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
    }
    // 1:1 décomp DisplayPartyPokemonHP (party_menu.c:2367) + DisplayParty
    // PokemonMaxHP (:2388) : DEUX AddTextPrinterParameterized3 FONT_SMALL
    // SÉPARÉS aux coords sPartyBoxInfoRects[PARTY_BOX_LEFT_COLUMN] (party_
    // menu.h:42-43) : dimensions[12]=(38,37) HP, dimensions[16]=(53,37) MaxHP.
    //   HP    = ConvertIntToDecimalStringN(hp,    RIGHT_ALIGN, 3) + "/"
    //   MaxHP = "/" + ConvertIntToDecimalStringN(maxhp, RIGHT_ALIGN, 3)
    // L'overlap des 2 "/" (FONT_SMALL widths = ROM exacts : sp 3, digit 5,
    // '/' 5 — vérifiés vs gFontSmallLatinGlyphWidths fonts.c:40) produit le
    // visuel ROM 1:1. PLUS de hack 1-string / espaces hardcodés.
    _displayPartyPokemonHP(wid, 38, 37, mon.hp);
    _displayPartyPokemonMaxHP(wid, 53, 37, mon.maxHP);
  } else {
    // 1:1 décomp PARTY_BOX_RIGHT_COLUMN :
    //   Nickname (22, 3) — width=40
    //   Level    (30, 12)
    //   Gender   (62, 12)
    //   HP       dimensions[12]=(102, 12)  MaxHP dimensions[16]=(117, 12)
    AddTextPrinterParameterized3(wid, FONT_SMALL, 22,  3, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
    if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  30, 12, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
    if (genderStr) {
      AddTextPrinterParameterized3(wid, FONT_SMALL, 62, 12, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
    }
    // 1:1 décomp DisplayPartyPokemonHP/MaxHP — 2 strings FONT_SMALL séparés
    // aux coords sPartyBoxInfoRects[PARTY_BOX_RIGHT_COLUMN] (party_menu.h:56-57).
    _displayPartyPokemonHP(wid, 102, 12, mon.hp);
    _displayPartyPokemonMaxHP(wid, 117, 12, mon.maxHP);
  }
  // 1:1 décomp DisplayPartyPokemonHPBar : draw colored bar fill (green/yellow/
  // red selon HP fraction) avec palette swap aux positions 9-10 de la sub-pal.
  _drawHpBar(slotIdx, mon);
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
function _drawHpBar(slotIdx: number, mon: Pokemon): void {
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
  if (learnMove === 0 /* MOVE_NONE */) { _partyMenuTryEvolution(); return; }
  if (learnMove === 0xFFFF /* MON_HAS_MAX_MOVES */) { _displayMonNeedsToReplaceMove(); return; }
  _displayMonLearnedMove(learnMove);
}

/** 1:1 `DisplayMonLearnedMove(taskId, move)` (party_menu.c:5124-5133) :
 *  gStringVar1=nickname, gStringVar2=gMoveNames[move], gText_PkmnLearnedMove3
 *  (« {mon} apprend {move}! ») → Task_DoLearnedMoveFanfareAfterText. */
function _displayMonLearnedMove(move: number): void {
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
function _displayMonNeedsToReplaceMove(moveOverride?: number): void {
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
function _CB2_ShowSummaryScreenToForgetMove(): void {
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
function _displayPartyMenuForgotMoveMessage(): void {
  const mon = _party()[_slotId];
  const forgotten = mon?.moves?.[GetMoveSlotToReplace()] ?? 0;
  _itemUsedMsgText = _preparePartyMsg(getString('gText_12PoofForgotMove') || '',
    mon?.nickname ?? '', gMoveNames[forgotten] ?? '');
  _phase = 'forgot_move_msg';
  _drawMsg();
}

/** 1:1 `Task_PartyMenuReplaceMove` (:4882-4895) : RemoveMonPPBonus +
 *  SetMonMoveSlot(data1, slot) puis Task_LearnedMove. */
function _taskPartyMenuReplaceMove(): void {
  const mon = _party()[_slotId];
  if (mon) {
    RemoveMonPPBonus(mon, GetMoveSlotToReplace());
    SetMonMoveSlot(mon, _learnMoveData1, GetMoveSlotToReplace());
  }
  _taskLearnedMove();
}

/** 1:1 `Task_LearnedMove` (:4769-4787) : `move[1]` = gPartyMenu.learnMoveState
 *  (champ adjacent à data1 dans la struct, cf. commentaire .c:4731) — si 0 =
 *  chemin CT/CS → AdjustFriendship(LEARN_TMHM) + RemoveBagItem(CT). Puis
 *  gText_PkmnLearnedMove3 + fanfare (mêmes phases que DisplayMonLearnedMove). */
function _taskLearnedMove(): void {
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
  _displayMonLearnedMove(_learnMoveData1);
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
    _taskLearnedMove();                               // 1:1 :4760 func = Task_LearnedMove
  } else {
    // 1:1 :4764-4765 DisplayLearnMoveMessage(gText_PkmnNeedsToReplaceMove) +
    // func = Task_ReplaceMoveYesNo (= _displayMonNeedsToReplaceMove pose data1 +
    // la phase 'levelup_replace_msg').
    _displayMonNeedsToReplaceMove(move0);
  }
}

/** 1:1 `StopLearningMovePrompt` (:4897-4904) : « Arrêter d'enseigner {move}? »
 *  puis `Task_StopLearningMoveYesNo` (:4906-4913) attend la fin du printer
 *  avant de poser le YesNo (phase 'stop_learning_msg' → 'stop_learning_yesno'). */
function _stopLearningMovePrompt(): void {
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
function _partyMenuTryEvolution(): void {
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

/** 1:1 décomp `CreatePartyMonPokeballSprite` (party_menu.c:4122) :
 *  Spawn une mini-pokeball OAM 32×32 à `menuBox->spriteCoords[6, 7]` pour
 *  chaque slot occupé. Réutilise les tiles + palette du SORTIR pokeball
 *  (= sSpriteTemplate_MenuPokeball, TAG_POKEBALL shared). */
function _spawnSlotPokeballOams(): void {
  const rt = getRuntime();
  if (!rt) return;
  _pokeballOamBySlot = [-1, -1, -1, -1, -1, -1];
  const party = _party();
  const POKEBALL_TILE_BASE = 256;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon) continue;
    const [x, y] = POKEBALL_COORDS[i];
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
    _pokeballOamBySlot[i] = spr.spriteId;
  }
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

/** 1:1 décomp : `menuBox->statusSpriteId = CreateSprite(&sSpriteTemplate_
 *  StatusIcons, spriteCoords[4], spriteCoords[5], 0)` (party_menu.c:4188).
 *  sOamData_StatusCondition = 32×8 (shape1 size1). Créés invisibles ;
 *  `_updatePartyMonAilmentGfx` les rend visibles selon l'ailment. */
function _spawnStatusOams(): void {
  const rt = getRuntime();
  if (!rt) return;
  _statusOamBySlot = [-1, -1, -1, -1, -1, -1];
  const party = _party();
  for (let i = 0; i < 6; i++) {
    if (!party[i]) continue;
    const [x, y] = STATUS_COORDS[i];
    const spr = rt.CreateSpriteAtOam({
      x, y,
      shape: 1, size: 1,                       // sOamData_StatusCondition 32×8
      tileId: PARTY_STATUS_TILE_BASE,
      paletteBank: _partyStatusPalSlot,
      priority: 1, subpriority: 0,
    });
    _statusOamBySlot[i] = spr.spriteId;
    rt.setSpriteInvisible(spr.spriteId, true); // 1:1 défaut : caché tant que pas d'ailment
  }
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

/** 1:1 décomp `CreatePartyMonHeldItemSprite` (party_menu.c:4021) :
 *  `CreateSprite(&sSpriteTemplate_HeldItem, spriteCoords[2], spriteCoords[3],
 *  0)` (8×8, sOamData_HeldItem priority=1). Créés invisibles. */
function _spawnHeldItemOams(): void {
  const rt = getRuntime();
  if (!rt) return;
  _itemOamBySlot = [-1, -1, -1, -1, -1, -1];
  const party = _party();
  for (let i = 0; i < 6; i++) {
    if (!party[i]) continue;
    const [x, y] = ITEM_COORDS[i];
    const spr = rt.CreateSpriteAtOam({
      x, y,
      shape: 0, size: 0,                       // sOamData_HeldItem 8×8
      tileId: PARTY_HELDITEM_TILE_BASE,
      paletteBank: _partyHeldItemPalSlot,
      priority: 1, subpriority: 0,
    });
    _itemOamBySlot[i] = spr.spriteId;
    rt.setSpriteInvisible(spr.spriteId, true);
  }
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

/** Spawn Pokémon icon OAM per slot. MVP : just placeholders (= no actual
 *  icon load). Future : load /decomp/em/pokemon/<dexid>/icon.png + .pal. */
async function _spawnIconOams(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  _iconOamBySlot = [-1, -1, -1, -1, -1, -1];
  _iconBaseY = [0, 0, 0, 0, 0, 0];
  const party = _party();
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon) continue;
    // 1:1 décomp `CreatePartyMonIconSprite` (party_menu.c:3937) : species2 =
    // MON_DATA_SPECIES_OR_EGG → SPECIES_EGG si œuf → gMonIconTable[SPECIES_EGG]
    // = icône d'ŒUF (pas l'icône de l'espèce dedans).
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
      const slotTileBase = ICON_OBJ_TILE_OFFSET / 32 + i * ICON_TILES_PER_SLOT;
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
      const palBank = ICON_OBJ_PAL_BASE + i;
      rt.LoadPaletteObj(iconPal, OBJ_PLTT_ID(palBank));
      // 1:1 décomp `CreateMonIconSprite(template, x, y, ...)` (= sprite center
      // coords in pixels). Notre `CreateSpriteAtOam` engine applique
      // CalcCenterToCornerVec INTERNE via le sprite.centerToCornerVec stocké
      // au create. Passer les coords DÉCOMP direct (= sprite center).
      const [x, y] = ICON_COORDS[i];
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
      _iconOamBySlot[i] = spr.spriteId;
      _iconBaseY[i] = oamY;
      // 1:1 décomp : CreateMonIconSprite appelle UpdateMonIconFrame une fois
      // (pokemon_icon.c:1046 → pose frame 0, delay 6, animCmdIndex 1) PUIS la
      // CB2 init fait AnimatePartySlot(i, 0/1). Comme notre spawn est async (il
      // peut finir APRÈS le case 14), on applique l'état initial ICI : reset
      // anim + frame 0 + décalage sélection/désélection sur le bon slot.
      _iconAnimDelay[i] = 0; _iconAnimCmdIdx[i] = 0; _iconAnimNum[i] = 0;
      _updateMonIconFrame(i);
      _animateSelectedPartyIcon(i, i === _slotId ? 1 : 0);
    } catch (e) {
      console.warn(`[party-screen] icon load failed for ${dexId}:`, e);
    }
  }
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

/** 1:1 décomp `UpdatePartySelectionSingleLayout` (party_menu.c:1523).
 *  Layout single (= notre cas) : slotId values 0..5 (mons), 7 (Cancel).
 *  Confirm (slot 6) pas utilisé en single layout (= chooseHalf=false). */
function _updateSlotIdSingle(dir: number): void {
  const partyCount = CalculatePlayerPartyCount();
  const PARTY_SIZE = 6;
  const CANCEL = PARTY_SIZE + 1;  // = 7
  switch (dir) {
    case MENU_DIR_UP:
      if (_slotId === 0) _slotId = CANCEL;
      else if (_slotId === CANCEL) _slotId = partyCount - 1;
      else _slotId--;
      break;
    case MENU_DIR_DOWN:
      if (_slotId === CANCEL) _slotId = 0;
      else if (_slotId === partyCount - 1) _slotId = CANCEL;
      else _slotId++;
      break;
    case MENU_DIR_RIGHT:
      if (partyCount !== 1 && _slotId === 0) {
        _slotId = _lastSelectedSlot === 0 ? 1 : _lastSelectedSlot;
      }
      break;
    case MENU_DIR_LEFT:
      if (_slotId !== 0 && _slotId !== PARTY_SIZE && _slotId !== CANCEL) {
        _lastSelectedSlot = _slotId;
        _slotId = 0;
      }
      break;
  }
}

/** 1:1 décomp `PartyMenuButtonHandler` (party_menu.c:1455).
 *  Reads gMain.newAndRepeatedKeys for DPAD, JOY_NEW for A/B/START.
 *  Returns A_BUTTON / B_BUTTON / START_BUTTON / 0. */
const MENU_DIR_UP = -1, MENU_DIR_DOWN = 1, MENU_DIR_LEFT = -2, MENU_DIR_RIGHT = 2;
function _partyMenuButtonHandler(rt: ReturnType<typeof getRuntime>): number {
  if (!rt) return 0;
  const PARTY_SIZE = 6, CANCEL = PARTY_SIZE + 1;
  const newRepKeys = rt.gMain.newAndRepeatedKeys ?? rt.gMain.newKeys;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002, KEY_START = 0x0008;
  const DPAD_UP = 0x40, DPAD_DOWN = 0x80, DPAD_LEFT = 0x20, DPAD_RIGHT = 0x10;
  let dir = 0;
  switch (newRepKeys & (DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT)) {
    case DPAD_UP:    dir = MENU_DIR_UP;    break;
    case DPAD_DOWN:  dir = MENU_DIR_DOWN;  break;
    case DPAD_LEFT:  dir = MENU_DIR_LEFT;  break;
    case DPAD_RIGHT: dir = MENU_DIR_RIGHT; break;
  }
  // 1:1 décomp PartyMenuButtonHandler :1473-1486 : `default` (aucun DPAD) →
  // GetLRKeysPressedAndHeld : L_PRESSED → MENU_DIR_UP, R_PRESSED → DOWN.
  if (dir === 0) {
    const KEY_L = 0x0200, KEY_R = 0x0100;
    if (newRepKeys & KEY_L) dir = MENU_DIR_UP;
    else if (newRepKeys & KEY_R) dir = MENU_DIR_DOWN;
  }
  if (newKeys & KEY_START) return KEY_START;
  if (dir !== 0) {
    const prev = _slotId;
    _updateSlotIdSingle(dir);
    if (_slotId !== prev) {
      PlaySE(5);  // SE_SELECT
      // 1:1 décomp UpdateCurrentPartySelection (party_menu.c:1505) :
      // AnimatePartySlot(oldSlot, 0); AnimatePartySlot(newSlot, 1);
      AnimatePartySlot(prev, 0);
      AnimatePartySlot(_slotId, 1);
    }
    return 0;
  }
  // Pressed A on Cancel = treat as B (= close)
  if ((newKeys & KEY_A) && _slotId === CANCEL) return KEY_B;
  return newKeys & (KEY_A | KEY_B);
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
/** 1:1 décomp action keys (party_menu.c:76-97) — MENU_* enum values. */
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
const MENU_STORE        = 14;  // = "DEPOSER" FR (gText_Store) — pension (ACTIONS_STORE)
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

const ACTION_MENU_STRINGS_FR: Record<number, string> = {
  [MENU_SUMMARY]:    'RESUME',
  [MENU_SWITCH]:     'ORDRE',
  [MENU_ITEM]:       'OBJET',
  [MENU_GIVE]:       'DONNER',
  [MENU_TAKE_ITEM]:  'PRENDRE',
  [MENU_MAIL]:       'MAIL',
  [MENU_TAKE_MAIL]:  'PRENDRE',
  [MENU_READ]:       'LIRE',
  [MENU_STORE]:      'DEPOSER',  // 1:1 gText_Store (strings.c:197 FR)
  [MENU_CANCEL1]:    'RETOUR',
  [MENU_CANCEL2]:    'RETOUR',
  // MENU_FIELD_MOVES + j (= field move name FR from gMoveNames).
  // Résolution dynamique dans _renderActionMenuContents (= pas table statique).
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
    const str = actionKey >= MENU_FIELD_MOVES
      ? _fieldMoveName(actionKey - MENU_FIELD_MOVES)
      : (ACTION_MENU_STRINGS_FR[actionKey] ?? '');
    const isSelected = i === _actionCursor;
    // Cursor arrow ▶ devant le selected item à x=0, text à x=8 (= cursorDim).
    if (isSelected) {
      AddTextPrinterParameterized3(
        _actionWindowId, FONT_NORMAL, 0, i * 16 + 1,
        [1, 2, 3] as [number, number, number],
        TEXT_SKIP_DRAW, '▶',
      );
    }
    // sFontColorTable[3] = [WHITE, DARK_GRAY, LIGHT_GRAY] pour actions selection.
    AddTextPrinterParameterized3(
      _actionWindowId, FONT_NORMAL, 8, i * 16 + 1,
      [1, 2, 3] as [number, number, number],
      TEXT_SKIP_DRAW, str,
    );
  }
  CopyWindowToVram(_actionWindowId, 3);
}

function _openActionMenu(rt: ReturnType<typeof getRuntime>, playSe = true): void {
  if (!rt) return;
  // 1:1 décomp : SE_SELECT joué par CursorCb_* à l'ENTRÉE (press A sur le mon).
  // Au retour du résumé (Task_TryCreateSelectionWindow → CreateSelectionWindow)
  // aucun SE n'est rejoué → playSe=false.
  if (playSe) PlaySE(5);  // SE_SELECT
  // 1:1 décomp `GetPartyMenuActionsType` (party_menu.c:2640-2669) case
  // PARTY_MENU_TYPE_DAYCARE (:2668) : œuf → ACTIONS_SUMMARY_ONLY
  // (= sPartyMenuAction_SummaryCancel), sinon ACTIONS_STORE
  // (= sPartyMenuAction_StoreSummaryCancel, data/party_menu.h:701).
  if (_menuType === PARTY_MENU_TYPE_DAYCARE) {
    const dcMon = _slotMon(_slotId);
    _actionList = dcMon?.isEgg
      ? [MENU_SUMMARY, MENU_CANCEL1]                // ACTIONS_SUMMARY_ONLY
      : [MENU_STORE, MENU_SUMMARY, MENU_CANCEL1];   // ACTIONS_STORE
    _actionSubMenu = 'mon';
    _spawnActionWindow();
    return;
  }
  // 1:1 décomp `SetPartyMonFieldSelectionActions` (party_menu.c:2607) :
  //   AppendToList(MENU_SUMMARY);
  //   for each field move: AppendToList(MENU_FIELD_MOVES + j);
  //   if (party[1].species != NONE) AppendToList(MENU_SWITCH);  ← ORDRE
  //   if (item is mail) AppendToList(MENU_MAIL); else AppendToList(MENU_ITEM);
  //   AppendToList(MENU_CANCEL1);
  _actionList = [MENU_SUMMARY];
  // 1:1 décomp party_menu.c:2615-2625 : iterate party[slotId].moves (= 4 slots) ;
  // pour chaque move, chercher dans sFieldMoves[] ; si trouvé : push MENU_FIELD_MOVES + j.
  const mon = _slotMon(_slotId);  // 1:1 décomp `mons[slotId]` (party_menu.c:2619).
  if (mon) {
    for (let i = 0; i < mon.moves.length && i < 4; i++) {
      const move = mon.moves[i];  // 1:1 id u16 (MON_DATA_MOVE1+i)
      if (!move) continue;
      // id → dexId kebab pour matcher sFieldMoves (cf. pokemon.ts:241).
      const moveEnum = reverseDecompConstant(move, 'MOVE_');
      if (!moveEnum) continue;
      const moveDexId = moveEnum.replace(/^MOVE_/, '').toLowerCase().replace(/_/g, '');
      for (let j = 0; j < sFieldMoves.length; j++) {
        if (moveDexId === sFieldMoves[j]) {
          _actionList.push(MENU_FIELD_MOVES + j);
          break;
        }
      }
    }
  }
  // 1:1 décomp :2629-2630 : if (mons[1].species != SPECIES_NONE) push MENU_SWITCH.
  if (_slotMon(1)) {
    _actionList.push(MENU_SWITCH);  // ORDRE - si plus de 1 mon
  }
  // 1:1 décomp :2631-2634 : if (ItemIsMail(heldItem)) push MENU_MAIL else MENU_ITEM.
  const heldItemId = mon?.heldItem ?? 0;  // 1:1 MON_DATA_HELD_ITEM (id u16)
  if (heldItemId !== 0 && ItemIsMail(heldItemId)) {
    _actionList.push(MENU_MAIL);
  } else {
    _actionList.push(MENU_ITEM);
  }
  _actionList.push(MENU_CANCEL1);
  _actionSubMenu = 'mon';   // menu d'action mon (≠ sous-menu objet)
  _spawnActionWindow();
}

/** Spawn l'action window (fenêtre de sélection à droite) depuis `_actionList`
 *  courant. Partagé par _openActionMenu (menu d'action mon) et _cursorCbItem
 *  (sous-menu objet ACTIONS_ITEM). 1:1 décomp `DisplaySelectionWindow`
 *  (party_menu.c:2533) : window sizé par le nombre d'actions. */
function _spawnActionWindow(): void {
  _actionCursor = 0;
  const numActions = _actionList.length;
  // 1:1 décomp window template : bg=2 width=10 height=(numActions*2).
  // ⚠️ AddWindow (= 1:1 decomp AddWindow), PAS InitWindows qui wipe tous les
  // windows existants (= bug screen-noir si on l'utilisait ici).
  const tilemapTop = 19 - numActions * 2;
  _actionWindowId = AddWindow({
    bg: 2, tilemapLeft: 19, tilemapTop, width: 10, height: numActions * 2,
    paletteNum: 14, baseBlock: 0x2E9,
  });
  // 1:1 décomp : load user window frame tiles à baseTile 0x4F + palette 13.
  // ⚠️ DrawStdFrameWithCustomTileAndPalette est appelé dans _renderActionMenuContents
  // (PAS ici) — sinon le PutWindowTilemap suivant écrase le frame border et
  // le menu apparaît sans cadre.
  LoadUserWindowBorderGfx(0, 0x4F, 13 * 16);
  _phase = 'action_menu';
  _drawMsg();
  _renderActionMenuContents();
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
function _cursorCbItem(): void {
  _removeActionWindow();
  _actionList = [MENU_GIVE, MENU_TAKE_ITEM, MENU_CANCEL2];  // ACTIONS_ITEM
  _actionSubMenu = 'item';
  _spawnActionWindow();
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
function _cursorCbTakeItem(): void {
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
function _cursorCbCancel2(rt: ReturnType<typeof getRuntime>): void {
  _removeActionWindow();
  _openActionMenu(rt, false);
}

/** 1:1 décomp `CursorCb_Give` (party_menu.c:3086) : exitCallback =
 *  CB2_SelectBagItemToGive (ouvre le sac en mode "donner à un mon") + close.
 *  DETTE (lot suivant) : la cascade bag-give (CB2_SelectBagItemToGive →
 *  GoToBagMenu(ITEMMENULOCATION_PARTY) → CB2_GiveHoldItem → GiveItemToMon)
 *  demande le handoff CB2 party↔bag en mode give. Reste sur le sous-menu en
 *  attendant ce wire. */
function _cursorCbGive(): void {
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

function _closeActionMenu(): void {
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
 *  joué au press A dans _handleActionMenuInput (= PlaySE 1:1). */
function _cursorCbSwitch(): void {
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
function _switchPartyMon(): void {
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
function _displayPartyPokemonData(slot: number): void {
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

/** 1:1 décomp `Task_SlideSelectedSlotsOffscreen` (party_menu.c:2936-2964). */
function _taskSlideSelectedSlotsOffscreen(): void {
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
    _switchPartyMon();
    _displayPartyPokemonData(_slotId);
    _displayPartyPokemonData(_slotId2);
    PutWindowTilemap(_slotWindowIds[_slotId]);
    PutWindowTilemap(_slotWindowIds[_slotId2]);
    if (_sSlot1Buf) CopyToBufferFromBgTilemap(0, _sSlot1Buf, _t1Left, _t1Top, _t1W, _t1H);
    if (_sSlot2Buf) CopyToBufferFromBgTilemap(0, _sSlot2Buf, _t2Left, _t2Top, _t2W, _t2H);
    ClearWindowTilemap(_slotWindowIds[_slotId]);
    ClearWindowTilemap(_slotWindowIds[_slotId2]);
    _slideTaskFn = _taskSlideSelectedSlotsOnscreen;
  }
}

/** 1:1 décomp `Task_SlideSelectedSlotsOnscreen` (party_menu.c:2966-2993). */
function _taskSlideSelectedSlotsOnscreen(): void {
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
  _slideTaskFn = _taskSlideSelectedSlotsOffscreen;
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
function SetUpFieldMove_Fly(): boolean {
  const g = globalThis as Record<string, unknown>;
  const hdr = g.gMapHeader as { mapType?: string } | null | undefined;
  const mt = hdr?.mapType;
  const allows = mt === 'MAP_TYPE_ROUTE' || mt === 'MAP_TYPE_TOWN'
    || mt === 'MAP_TYPE_OCEAN_ROUTE' || mt === 'MAP_TYPE_CITY';
  if (allows) {
    g.gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu;
    g.gPostMenuFieldCallback = g.__FieldCallback_Fly as (() => void) | undefined;
    return true;
  }
  return false;
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

/** 1:1 décomp `sFieldMoveCursorCallbacks[FIELD_MOVES_COUNT]` (data/party_menu.h:770).
 *  {fieldMoveFunc, msgId}. msgId = clé string gText_* (≈ PARTY_MSG_*). Une entrée
 *  absente (fieldMoveFunc NULL) = field move pas encore porté en menu → early
 *  return dans CursorCb_FieldMove (1:1 avec `fieldMoveFunc == NULL`). */
interface FieldMoveCursorCallback {
  fieldMoveFunc: (() => boolean) | null;
  msgId: string;
}
const sFieldMoveCursorCallbacks: Record<number, FieldMoveCursorCallback> = {
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
  // PlaySE(SE_SELECT) déjà joué par _handleActionMenuInput au press A.
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

/** Action menu input handler 1:1 décomp `Task_HandleSelectionMenuInput`
 *  (party_menu.c:2740) : UP/DOWN navigate, A select, B = cancel (= action
 *  at index numActions-1 = RETOUR). */
function _handleActionMenuInput(rt: ReturnType<typeof getRuntime>): void {
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
    PlaySE(5);
    const action = _actionList[_actionCursor];
    if (action === MENU_CANCEL1 /* RETOUR */) {
      _closeActionMenu();
    } else if (action === MENU_SUMMARY /* RESUME */) {
      // 1:1 décomp `CursorCb_Summary` (party_menu.c:2770-2775) :
      //   PlaySE(SE_SELECT);                                      ← déjà fait
      //   sPartyMenuInternal->exitCallback = CB2_ShowPokemonSummaryScreen;
      //   Task_ClosePartyMenu(taskId);   // fade-out party PUIS handoff CB2
      // Le party menu se ferme ENTIÈREMENT (fade gated → _freePartyMenu →
      // SetMainCallback2) AVANT que le résumé s'init = handoff séquentiel
      // identique au décomp. Ça supprime la race où OpenSummaryScreen était
      // appelé pendant que le party menu vivait encore (tâche de close
      // survivante → CB2_ReturnToFieldWithOpenMenu = OW+START bug #4, ou
      // CB2 stomp = crash fade bug #3).
      const mon = _slotMon(_slotId);
      if (mon) {
        _summaryTargetMon = mon;
        _showSummaryPending = false;
        _partyTransientExitCb = CB2_ShowPokemonSummaryScreen_Manual;
        ClosePartyScreen();  // = Task_ClosePartyMenu (fade + handoff séquentiel)
      } else {
        _closeActionMenu();
      }
    } else if (action === MENU_SWITCH /* ORDRE */) {
      _cursorCbSwitch();
    } else if (action === MENU_ITEM /* OBJET */) {
      // 1:1 décomp `CursorCb_Item` (party_menu.c:3074) : ouvre le sous-menu objet
      // ACTIONS_ITEM = DONNER/PRENDRE/RETOUR.
      _cursorCbItem();
    } else if (action === MENU_STORE /* DEPOSER (pension) */) {
      // 1:1 décomp `CursorCb_Store` (party_menu.c:3587-3591) :
      //   PlaySE(SE_SELECT);            ← déjà joué par le dispatch
      //   Task_ClosePartyMenu(taskId);  → exitCallback = BufferMonSelection
      // (le slot choisi est capturé par _freePartyMenu → _cursorSelectionMonId).
      ClosePartyScreen();
    } else if (action === MENU_GIVE /* DONNER */) {
      _cursorCbGive();
    } else if (action === MENU_TAKE_ITEM /* PRENDRE */) {
      _cursorCbTakeItem();
    } else if (action === MENU_CANCEL2 /* RETOUR (sous-menu objet) */) {
      _cursorCbCancel2(rt);
    } else if (action === MENU_MAIL /* MAIL */) {
      // Dette R3 documentée : 1:1 décomp `CursorCb_Mail` (party_menu.c:2807)
      // cascade vers DisplaySelectionWindow(ACTIONS_MAIL) → READ/TAKE_MAIL.
      // Demande CB2 swap vers ReadMail screen + bag-add flow équivalent.
      console.log('[party-screen] MAIL → dette R3 (cascade CursorCb_Mail U-tier)');
      _closeActionMenu();
    } else if (action >= MENU_FIELD_MOVES) {
      // 1:1 décomp `CursorCb_FieldMove` (party_menu.c:3702).
      CursorCb_FieldMove(rt, action);
    }
  } else if (newKeys & KEY_B) {
    PlaySE(5);
    _closeActionMenu();
  }
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
  // Sub-state action menu : dispatcher différent.
  if (_phase === 'action_menu') { _handleActionMenuInput(rt); return; }
  // Sub-state hp_anim : tick l'anim HP bar (= 1:1 PartyMenuModifyHP).
  if (_phase === 'hp_anim') { _tickHpAnim(); return; }
  // Sub-state item used message. 1:1 décomp Task_ClosePartyMenuAfterText
  // (party_menu.c:4472-4480) : `if (IsPartyMenuTextPrinterActive() != TRUE)
  // Task_ClosePartyMenu(taskId);` — AUCUN press supplémentaire : le A qui lève
  // le {PAUSE_UNTIL_PRESS} final du message est consommé par la pause du
  // printer (pendant l'impression, A/B accélère via canABSpeedUpPrint).
  if (_phase === 'item_used_msg') {
    if (_isPartyMenuTextPrinterActive()) return;
    _itemUsedMsgText = null;
    ClosePartyScreen();
    return;
  }
  // Sub-state message d'erreur field-move (badge manquant / can't use) : attend
  // A/B → REVIENT au choix du mon (≈ Task_ReturnToChooseMonAfterText /
  // Task_CancelAfterAorBPress — ne ferme PAS le menu). L'action window a déjà
  // été retiré par CursorCb_FieldMove → on réaffiche juste "Choisir un POKéMON".
  // 'helditem_msg' = même pattern : 1:1 décomp Task_UpdateHeldItemSprite →
  // Task_ReturnToChooseMonAfterText (party_menu.c:3267) — A/B → retour choix-mon.
  if (_phase === 'field_move_err' || _phase === 'helditem_msg') {
    // 1:1 décomp Task_ReturnToChooseMonAfterText (party_menu.c:1745) :
    // `if (IsPartyMenuTextPrinterActive() != TRUE) { … retour choix-mon }` —
    // pas de press supplémentaire (le {PAUSE_UNTIL_PRESS} final est levé DANS
    // le printer par le A du joueur).
    if (_isPartyMenuTextPrinterActive()) return;
    _itemUsedMsgText = null;
    _actionList = [];
    _actionCursor = 0;
    _actionSubMenu = 'mon';
    _phase = 'open';
    _drawMsg();
    return;
  }
  // 1:1 décomp Task_CancelAfterAorBPress (party_menu.c:3838) : messages
  // « Impossible ici. » etc. SANS {PAUSE_UNTIL_PRESS} → attend un press A/B
  // puis CursorCb_Cancel1 (= PlaySE(SE_SELECT) + retour choix-mon).
  if (_phase === 'field_move_cancel') {
    if (_isPartyMenuTextPrinterActive()) return;
    const newKeys = rt.gMain.newKeys;
    const KEY_A = 0x0001, KEY_B = 0x0002;
    if (newKeys & (KEY_A | KEY_B)) {
      PlaySE(5);  // SE_SELECT (CursorCb_Cancel1)
      _itemUsedMsgText = null;
      _actionList = [];
      _actionCursor = 0;
      _actionSubMenu = 'mon';
      _phase = 'open';
      _drawMsg();
    }
    return;
  }
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
  // Sub-state Oui/Non field-move (Téléport « Retourner au dernier lieu de soins? »).
  // 1:1 décomp Task_HandleFieldMoveExitAreaYesNoInput (party_menu.c:3793) :
  //   case 0 (OUI)  : gPartyMenu.exitCallback = CB2_ReturnToField; Task_ClosePartyMenu.
  //   case 1/B (NON): gFieldCallback2 = NULL; gPostMenuFieldCallback = NULL; retour choix-mon.
  if (_phase === 'fieldmove_yesno') {
    const res = Menu_ProcessInputNoWrapClearOnChoose();  // -2 rien, -1 B, 0 OUI, 1 NON
    if (res === 0) {
      _itemUsedMsgText = null;
      _partyTransientExitCb = CB2_ReturnToField_Manual;
      ClosePartyScreen();
    } else if (res === 1 || res === -1) {
      PlaySE(5);  // SE_SELECT (1:1 : MENU_B_PRESSED rejoue SE_SELECT)
      _itemUsedMsgText = null;
      const g = globalThis as Record<string, unknown>;
      g.gFieldCallback2 = null;
      g.gPostMenuFieldCallback = null;
      _actionList = [];
      _actionCursor = 0;
      _phase = 'open';
      _drawMsg();
    }
    return;
  }
  // 'switch_items_yesno' = 1:1 Task_HandleSwitchItemsYesNoInput (party_menu.c:3164) :
  //   OUI → RemoveBagItem(new) ; si pas de place pour rendre l'ancien → rollback +
  //   "sac plein" ; sinon GiveItemToMon(new) + "X a remplacé Y". NON/B → garde l'objet.
  if (_phase === 'switch_items_yesno') {
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
    return;
  }
  // Sub-states boîte de stats level-up (Rare Candy / Super Bonbon) — 1:1 décomp
  // Task_DisplayLevelUpStatsPg1 → Pg2 → Task_TryLearnNewMoves (party_menu.c:5009-5073).
  if (_phase === 'levelup_pg1') {
    // 1:1 :5011 WaitFanfare(FALSE) && !IsPartyMenuTextPrinterActive && (A||B).
    if (_isPartyMenuTextPrinterActive()) return;
    const newKeys = rt.gMain.newKeys;
    const KEY_A = 0x0001, KEY_B = 0x0002;
    if (WaitFanfare(false) && (newKeys & (KEY_A | KEY_B))) {
      PlaySE(5);  // 1:1 :5013 PlaySE(SE_SELECT)
      DisplayLevelUpStatsPg1();  // 1:1 :5014 crée la box + page 1 (deltas)
      _phase = 'levelup_pg2';    // = func Task_DisplayLevelUpStatsPg2
    }
    return;
  }
  if (_phase === 'levelup_pg2') {
    // 1:1 :5021 (A||B) → PlaySE + DisplayLevelUpStatsPg2 (page 2 = totaux).
    const newKeys = rt.gMain.newKeys;
    const KEY_A = 0x0001, KEY_B = 0x0002;
    if (newKeys & (KEY_A | KEY_B)) {
      PlaySE(5);
      DisplayLevelUpStatsPg2();  // 1:1 :5024
      _phase = 'levelup_learn';  // = func Task_TryLearnNewMoves
    }
    return;
  }
  if (_phase === 'levelup_learn') {
    // 1:1 Task_TryLearnNewMoves (party_menu.c:5047-5073) : WaitFanfare(FALSE) &&
    // (A||B) → RemoveLevelUpStatsWindow + MonTryLearningNewMove(mon, TRUE) + dispatch.
    const newKeys = rt.gMain.newKeys;
    const KEY_A = 0x0001, KEY_B = 0x0002;
    if (WaitFanfare(false) && (newKeys & (KEY_A | KEY_B))) {
      PlaySE(5);  // 1:1 :5053 PlaySE(SE_SELECT)
      RemoveLevelUpStatsWindow();  // 1:1 :5054
      _itemUsedMsgText = null;
      const monLearn = _party()[_slotId];
      const learnMove = monLearn ? MonTryLearningNewMove(monLearn, true) : 0;  // 1:1 :5055
      _learnMoveState = 1;  // 1:1 :5056 gPartyMenu.learnMoveState = 1 (chaîne level-up)
      if (learnMove === 0xFFFE /* MON_ALREADY_KNOWS_MOVE */) {
        // 1:1 :5065-5067 → Task_TryLearningNextMove (le dispatch commun ne gère
        // pas ce case, comportements distincts entre :5066 et :5088).
        _phase = 'levelup_learn_next';
      } else {
        _dispatchLearnMoveResult(learnMove);
      }
    }
    return;
  }
  if (_phase === 'levelup_learn_next') {
    // 1:1 Task_TryLearningNextMove (party_menu.c:5075-5093) — tourne chaque frame ;
    // MON_ALREADY_KNOWS_MOVE → return (reboucle, :5088).
    const monNext = _party()[_slotId];
    const result = monNext ? MonTryLearningNewMove(monNext, false) : 0;
    if (result === 0xFFFE /* MON_ALREADY_KNOWS_MOVE */) return;
    _dispatchLearnMoveResult(result);
    return;
  }
  if (_phase === 'levelup_learned_fanfare') {
    // 1:1 Task_DoLearnedMoveFanfareAfterText (:4789-4796) : attend la FIN du
    // défilement (« X apprend Y! ») puis PlayFanfare(MUS_LEVEL_UP).
    if (_isPartyMenuTextPrinterActive()) return;
    PlayFanfare(MUS_LEVEL_UP);
    _phase = 'levelup_learned_msg';
    return;
  }
  if (_phase === 'levelup_learned_msg') {
    // 1:1 Task_LearnNextMoveOrClosePartyMenu (:4798-4812) : fanfare finie + A/B →
    // learnMoveState==1 → Task_TryLearningNextMove ; sinon (CT/CS) → close.
    const newKeys = rt.gMain.newKeys;
    const KEY_A = 0x0001, KEY_B = 0x0002;
    if (WaitFanfare(false) && (newKeys & (KEY_A | KEY_B))) {
      PlaySE(5);
      _itemUsedMsgText = null;
      if (_learnMoveState === 1) _phase = 'levelup_learn_next';  // → Task_TryLearningNextMove
      else ClosePartyScreen();
    }
    return;
  }
  if (_phase === 'levelup_replace_msg') {
    // 1:1 Task_ReplaceMoveYesNo (:4815-4822) : le printer gère les 3 pages \p
    // nativement (A avance chaque page avec ▼) ; quand le texte ENTIER est fini,
    // le YesNo se pose par-dessus la dernière page.
    if (_isPartyMenuTextPrinterActive()) return;
    PartyMenuDisplayYesNoMenu();
    _phase = 'replace_yesno';
    return;
  }
  if (_phase === 'replace_yesno') {
    // 1:1 Task_HandleReplaceMoveYesNoInput (:4824-4839).
    const res = Menu_ProcessInputNoWrapClearOnChoose();  // 0=OUI 1=NON -1=B -2=rien
    if (res === 0) {
      // OUI → « Oublier quelle capacité?{PAUSE_UNTIL_PRESS} » puis summary.
      _itemUsedMsgText = _preparePartyMsg(getString('gText_WhichMoveToForget') || '');
      _phase = 'which_move_msg';
      _drawMsg();
    } else if (res === 1 || res === -1) {
      if (res === -1) PlaySE(5);  // 1:1 MENU_B_PRESSED → PlaySE(SE_SELECT), fallthrough
      _stopLearningMovePrompt();
    }
    return;
  }
  if (_phase === 'which_move_msg') {
    // 1:1 Task_ShowSummaryScreenToForgetMove (:4841-4848) : attend la fin du
    // printer (le A qui acquitte {PAUSE_UNTIL_PRESS} est consommé par la pause)
    // → sPartyMenuInternal->exitCallback = CB2_ShowSummaryScreenToForgetMove +
    // Task_ClosePartyMenu (fade + teardown).
    if (_isPartyMenuTextPrinterActive()) return;
    _learnMoveSlot = _slotId;
    _learnMoveReturnCb = rt.gMain.savedCallback ?? null;  // gPartyMenu.exitCallback conservé
    _partyTransientExitCb = _CB2_ShowSummaryScreenToForgetMove;
    _itemUsedMsgText = null;
    ClosePartyScreen();
    return;
  }
  if (_phase === 'learnmove_return') {
    // 1:1 Task_ReturnToPartyMenuWhileLearningMove (:4860-4869) : après le fade
    // d'entrée, dispatch selon le choix fait dans le summary.
    if (!rt.gPaletteFade.active) {
      if (GetMoveSlotToReplace() !== 4 /* MAX_MON_MOVES */)
        _displayPartyMenuForgotMoveMessage();
      else
        _stopLearningMovePrompt();
    }
    return;
  }
  if (_phase === 'forgot_move_msg') {
    // 1:1 Task_PartyMenuReplaceMove (:4882-4895) : gText_12PoofForgotMove
    // (pauses/pages natives du printer) — à la fin du texte, remplace le move.
    if (_isPartyMenuTextPrinterActive()) return;
    _taskPartyMenuReplaceMove();
    return;
  }
  if (_phase === 'stop_learning_msg') {
    // 1:1 Task_StopLearningMoveYesNo (:4906-4913) : attend la fin du texte
    // « Arrêter d'enseigner {move}? » puis pose le YesNo.
    if (_isPartyMenuTextPrinterActive()) return;
    PartyMenuDisplayYesNoMenu();
    _phase = 'stop_learning_yesno';
    return;
  }
  if (_phase === 'stop_learning_yesno') {
    // 1:1 Task_HandleStopLearningMoveYesNoInput (:4915-4947).
    const res = Menu_ProcessInputNoWrapClearOnChoose();
    if (res === 0) {
      // OUI (arrêter) → « X n'a pas appris la capacité Y.{PAUSE_UNTIL_PRESS} »
      const monStop = _party()[_slotId];
      _itemUsedMsgText = _preparePartyMsg(getString('gText_MoveNotLearned') || '',
        monStop?.nickname ?? '', gMoveNames[_learnMoveData1] ?? '');
      _phase = 'move_not_learned_msg';
      _drawMsg();
    } else if (res === 1 || res === -1) {
      // NON/B → ré-affiche « veut apprendre… » avec data1 (:4941-4944) et reboucle.
      if (res === -1) PlaySE(5);
      _displayMonNeedsToReplaceMove(_learnMoveData1);
    }
    return;
  }
  if (_phase === 'move_not_learned_msg') {
    // 1:1 Task_TryLearningNextMoveAfterText (:4949-4953) : attend la fin du
    // printer (le A de {PAUSE_UNTIL_PRESS} est consommé par la pause) puis
    // learnMoveState==1 → Task_TryLearningNextMove ; sinon (CT/CS) → close (:4934).
    if (_isPartyMenuTextPrinterActive()) return;
    _itemUsedMsgText = null;
    if (_learnMoveState === 1) _phase = 'levelup_learn_next';
    else ClosePartyScreen();
    return;
  }
  if (_phase !== 'open') return;
  const result = _partyMenuButtonHandler(rt);
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (result === KEY_A) {
    // 1:1 décomp Task_HandleChooseMonInput A_BUTTON : dispatch selon
    // gPartyMenu.action. PARTY_ACTION_SWITCH (party_menu.c:1344-1347) →
    // PlaySE(SE_SELECT) + SwitchSelectedMons. Sinon → action menu.
    if (_partyAction === PARTY_ACTION_SWITCH) {
      PlaySE(5);  // SE_SELECT (1:1 party_menu.c:1345)
      _switchSelectedMons();
    } else if (_partyAction === PARTY_ACTION_USE_ITEM) {
      // 1:1 décomp HandleChooseMonSelection case PARTY_ACTION_USE_ITEM
      // (party_menu.c:1309-1317) :
      //   if (IsSelectedMonNotEgg(slotPtr)) {
      //       PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
      //       gItemUseCB(taskId, Task_ClosePartyMenuAfterText);
      //   }
      // Note : slotId = CANCEL (7) → tombe dans `gPartyMenu.task(taskId)`
      // (party_menu.c:1294-1297) qui pour USE_ITEM = Task_HandleChooseMonInput
      // (= retour bag implicite via savedCallback). On gère via case KEY_B
      // ci-dessous pour clarté.
      const PARTY_SIZE = 6;
      const CANCEL = PARTY_SIZE + 1; // = 7
      if (_slotId === CANCEL) {
        // 1:1 décomp slotPtr==PARTY_SIZE → gPartyMenu.task → cancel/return.
        PlaySE(5);
        ClosePartyScreen();
        return;
      }
      // 1:1 décomp IsSelectedMonNotEgg (party_menu.c:1928) : œuf →
      // PlaySE(SE_FAILURE) + FALSE (= skip). Slot vide = skip silencieux.
      const party = _party();
      const mon = party[_slotId];
      if (!mon) return;  // 1:1 :1310 IsSelectedMonNotEgg FALSE = silent skip.
      if (mon.isEgg) { PlaySE(SE_FAILURE); return; }  // 1:1 IsSelectedMonNotEgg
      // Invoque gItemUseCB (= ItemUseCB_Medicine pour POTION etc.).
      const cb = (globalThis as Record<string, unknown>).gItemUseCB as
        | ((taskId: number, returnTask: ((task: DecompTask) => void) | null) => void)
        | null
        | undefined;
      if (typeof cb === 'function') {
        const taskId = _inputTaskId;
        cb(taskId, null);  // 1:1 :1316 gItemUseCB(taskId, Task_ClosePartyMenuAfterText)
      }
    } else if (_partyAction === PARTY_ACTION_GIVE_ITEM) {
      // 1:1 décomp Task_HandleChooseMonInput case PARTY_ACTION_GIVE_ITEM
      // (party_menu.c:1339-1341) : A sur un mon → TryGiveItemOrMailToSelectedMon.
      // CANCEL (slot 7) → gPartyMenu.task → retour SAC (savedCallback=CB2_ReturnToBagMenu).
      const PARTY_SIZE = 6;
      const CANCEL = PARTY_SIZE + 1; // = 7
      if (_slotId === CANCEL) {
        PlaySE(5);
        ClosePartyScreen();          // → CB2_ReturnToBagMenu (savedCallback)
        return;
      }
      const party = _party();
      const mon = party[_slotId];
      if (!mon) return;              // 1:1 IsSelectedMonNotEgg FALSE = silent skip.
      if (mon.isEgg) { PlaySE(SE_FAILURE); return; }  // 1:1 IsSelectedMonNotEgg (œuf)
      PlaySE(5);                     // 1:1 :1340 PlaySE(SE_SELECT)
      TryGiveItemOrMailToSelectedMon();
    } else if (_partyAction === PARTY_ACTION_SEND_OUT) {
      // Étape 4 (combat) : choix du mon à envoyer (switch volontaire / après K.O.).
      // 1:1 décomp Task_HandleChooseMonInput case PARTY_ACTION_SEND_OUT →
      // CursorCb_Switch-like : valide le mon puis ferme via gMain.savedCallback.
      const PARTY_SIZE = 6;
      const CANCEL = PARTY_SIZE + 1; // = 7
      if (_slotId === CANCEL) {
        // CANCEL : autorisé seulement en switch volontaire (pas après K.O.).
        if (_battleSwitchAllowCancel) {
          PlaySE(5);
          (globalThis as Record<string, unknown>).__battleSwitchResultSlot = -1;
          ClosePartyScreen();
        }
        return;
      }
      const party = _party();
      const mon = party[_slotId];
      // 1:1 : interdit le mon DÉJÀ au combat (= actif) ou un mon K.O. (les messages
      // FR "déjà en plein combat" / "plus d'énergie" = polish ultérieur ; ici no-op).
      if (_slotId === _battleSwitchActiveSlot || !mon || mon.hp <= 0) {
        PlaySE(5);
        return;  // reste sur la sélection
      }
      PlaySE(5);
      // 1:1 TrySwitchInPokemon (party_menu.c:5851-5856) : capture l'id FIELD du mon
      // choisi (la réponse moteur) PUIS swap nibbles + swap physique (le choisi prend
      // le slot affiché de l'actif → il sera EN HAUT à la prochaine ouverture).
      {
        const po2 = (globalThis as Record<string, unknown>).__battlePartyOrder as {
          chooseSwitchSlot?: (displaySlot: number, activePartyId: number) => number;
        } | undefined;
        const fieldId = (_battleOrderApplied && po2?.chooseSwitchSlot)
          ? po2.chooseSwitchSlot(_slotId, _battleSwitchActivePartyId)
          : _slotId;
        (globalThis as Record<string, unknown>).__battleSwitchResultSlot = fieldId;
      }
      ClosePartyScreen();
    } else if (_partyAction === PARTY_ACTION_SOFTBOILED) {
      // 1:1 décomp HandleChooseMonSelection case PARTY_ACTION_SOFTBOILED
      // (party_menu.c:1302) : A sur un mon (≠ CANCEL, mappé à B) → tente le
      // transfert PV sur le receveur (= _slotId). PlaySE déjà géré par le SE
      // interne des sous-tâches ; ici on ne re-joue pas SE_SELECT (le décomp
      // joue SE_USE_ITEM dans Task_TryUse).
      Task_TryUseSoftboiledOnPartyMon();
    } else {
      // A sur slot mon → ouvre action menu. (A sur CANCEL est mappé à B.)
      _openActionMenu(rt);
    }
  } else if (result === KEY_B) {
    PlaySE(5);
    if (_partyAction === PARTY_ACTION_SOFTBOILED) {
      // 1:1 décomp HandleChooseMonCancel case SOFTBOILED (party_menu.c:1386) :
      // annule le transfert → retour au choix de mon normal (curseur sur le donneur).
      Task_FinishSoftboiled();
    } else if (_partyAction === PARTY_ACTION_SWITCH) {
      // 1:1 net : B / Cancel pendant SWITCH = annule (= SwitchSelectedMons
      // slot2==slot1 → FinishTwoMonAction, party_menu.c:2827-2830).
      _finishTwoMonAction();
    } else if (_partyAction === PARTY_ACTION_SEND_OUT) {
      // Étape 4 (combat) : B = annule le switch (volontaire seulement). Après
      // K.O. (allowCancel=false) le choix est obligatoire → B ignoré (juste SE).
      if (_battleSwitchAllowCancel) {
        (globalThis as Record<string, unknown>).__battleSwitchResultSlot = -1;
        ClosePartyScreen();
      }
    } else {
      // 1:1 décomp HandleChooseMonCancel default (party_menu.c:1395-1403) :
      //   gSpecialVar_0x8004 = PARTY_SIZE + 1; *slotPtr = PARTY_SIZE + 1;
      //   Task_ClosePartyMenu.
      // Mode DAYCARE : le slot forcé à PARTY_SIZE+1 fait produire
      // PARTY_NOTHING_CHOSEN par BufferMonSelection (exitCallback).
      if (_menuType === PARTY_MENU_TYPE_DAYCARE) {
        VarSet(0x8004, PARTY_SIZE + 1);  // gSpecialVar_0x8004 = PARTY_SIZE + 1
        _slotId = PARTY_SIZE + 1;        // *slotPtr = PARTY_SIZE + 1
      }
      // PARTY_ACTION_USE_ITEM : B → retour bag via savedCallback
      // (= CB2_ReturnToBagMenu défini par OpenPartyScreenForItemUse).
      // PARTY_ACTION_CHOOSE_MON : B → retour overworld via savedCallback
      // (= CB2_ReturnToFieldWithOpenMenu_Manual). Même flow.
      ClosePartyScreen();
    }
  }
  // START: en single layout pas de Confirm → no-op
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

/** Étape 4 (combat) : ouvre l'écran party en mode PARTY_ACTION_SEND_OUT pour
 *  choisir le Pokémon à envoyer au combat. 1:1 décomp `OpenPartyMenuInBattle` →
 *  `InitPartyMenu(PARTY_MENU_TYPE_IN_BATTLE, …, PARTY_ACTION_SEND_OUT, …,
 *  Task_HandleChooseMonInput, CB2_SetUpReshowBattleScreenAfterMenu)` (party_menu.c:5776).
 *
 *  - `returnCb` = exitCallback (= le combat reconstruit la scène puis reprend).
 *  - `opts.activeSlot` = slot du mon actif (interdit de le re-choisir, 1:1).
 *  - `opts.allowCancel` = B annule (switch volontaire) ou non (choix forcé K.O.).
 *
 *  Le slot choisi (ou -1 = annulé) est posé sur `globalThis.__battleSwitchResultSlot`,
 *  lu par le combat au retour (le bridge globalThis évite un cycle d'import). */
export function OpenPartyScreenForBattleSwitch(
  returnCb: () => void,
  opts: { activeSlot: number; allowCancel: boolean },
): void {
  if (_isOpen) return;
  // (1:1 décomp = PARTY_MENU_TYPE_IN_BATTLE ; notre port ne branche pas sur ce
  // type en combat → FIELD, comportement inchangé.)
  _menuType = PARTY_MENU_TYPE_FIELD;
  _partyAction = PARTY_ACTION_SEND_OUT;
  // 1:1 party_menu.c (combat) : le menu vit en ORDRE BATTLE — gPlayerParty est
  // physiquement réordonnée (UpdatePartyToBattleOrder : l'ACTIF au slot affiché 0,
  // fix « le mon échangé n'est pas premier » user 2026-06-10) et RESTAURÉE à la
  // fermeture (closeBattleOrder dans ClosePartyScreen). opts.activeSlot = id FIELD ;
  // le slot AFFICHÉ interdit = retour d'openBattleOrder.
  const po = (globalThis as Record<string, unknown>).__battlePartyOrder as {
    openBattleOrder?: (activePartyId: number) => number;
  } | undefined;
  _battleSwitchActivePartyId = opts.activeSlot;
  if (po?.openBattleOrder) {
    _battleSwitchActiveSlot = po.openBattleOrder(opts.activeSlot);
    _battleOrderApplied = true;
  } else {
    _battleSwitchActiveSlot = opts.activeSlot;
  }
  _battleSwitchAllowCancel = opts.allowCancel;
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
  // 1:1 :4984 PlayFanfareByFanfareNum(FANFARE_LEVEL_UP) (= MUS_LEVEL_UP).
  PlayFanfareByFanfareNum(MUS_LEVEL_UP);
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

/** Tick frame de l'anim HP bar — appelé par Task_PartyMenu_HandleInput
 *  pendant phase `'hp_anim'`. */
function _tickHpAnim(): void {
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
    cb?.();
  }
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

/** Stub kept pour start-menu sub-state compat. CB2 swap take over. */
export function TickPartyScreen(_newKeys: number): void {
  void _newKeys;
}

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
