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
  RemoveWindow, ShowBg, HideBg,
  GetWindowAttribute, WINDOW_TILEMAP_LEFT, WINDOW_TILEMAP_TOP,
  WINDOW_WIDTH, WINDOW_HEIGHT,
  CopyToBufferFromBgTilemap, CopyRectToBgTilemapBufferRect,
  FillBgTilemapBufferRect_Palette0, ScheduleBgCopyTilemapToVram,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx, preloadTextWindowFrames } from './gba-text-window';
import { AddTextPrinterParameterized3, GetStringCenterAlignXOffset } from './gba-text-system';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { ItemIsMail } from './mail-data';
import { resolveDecompConstant } from '../system/decomp-constants';
import { LoadSpritePalette, MarkObjTilesAllocated, ReserveSpritePaletteSlot, FreeSpritePaletteByTag } from '../system/sprite';
import { getMonGenderSymbol, MON_MALE, MON_FEMALE } from '../pokemon/pokemon';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  BlendPalettes, ResetPaletteFade, ResetTasks, gMain,
} from '../system/decomp-globals';
import { ResetSpriteData, ConvertIntToDecimalStringN, STR_CONV_MODE_RIGHT_ALIGN } from '../system/decomp-bridge';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './option-menu-return';
import { FadeScreen, FADE_FROM_BLACK } from '../system/fade-screen';
import { loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadTileBin } from '../gba/png-loader';
import { OpenSummaryScreen, GetSummaryLastMonIndex } from './summary-screen';
import { getString } from './gba-strings';
import { MON_ICON_PALETTE_INDICES } from '../pokemon/pokemon-icon-palettes';
import type { DecompTask } from '../system/decomp-runtime';
import type { PokemonInstance } from '../pokemon/pokemon';

// FONT_NORMAL/SMALL = text.h enum FontIds local (= pas extrait decomp-data,
// hardcode 1:1 strict justifié).
const FONT_NORMAL = 1;
const FONT_SMALL = 0;  // 1:1 décomp party_menu uses FONT_SMALL for nickname/level/HP
// 1:1 strict A8 audit : import depuis decomp-data.
import { TEXT_SKIP_DRAW } from '../decomp-data/include/text-data';
import {
  PARTY_ACTION_CHOOSE_MON, PARTY_ACTION_USE_ITEM,
  PARTY_ACTION_SWITCH, PARTY_ACTION_SWITCHING, PARTY_ACTION_SEND_OUT,
} from '../decomp-data/include/constants/party_menu-data';
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
let _phase: 'idle' | 'open' | 'action_menu' | 'fading_out' | 'switching' | 'item_used_msg' | 'hp_anim' = 'idle';

/** Message à afficher après use d'item (= 1:1 décomp DisplayPartyMenuMessage
 *  appelé depuis ItemUseCB_* : "Les PV de X sont restaurés...", "X est guéri
 *  du PSN", "Ça n'aura aucun effet.", etc.). Phase passe à `'item_used_msg'`,
 *  on draw msg dans WIN_MSG, et au prochain A_BUTTON → ClosePartyScreen vers
 *  bag (via savedCallback = CB2_ReturnToBagMenu). */
let _itemUsedMsgText: string | null = null;

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
/** 1:1 décomp `sPartyMenuInternal->exitCallback` — callback de sortie
 *  TRANSITOIRE, consommé UNE fois dans Task_ClosePartyMenuAndSetCB2
 *  (party_menu.c:1238). Distinct de `gPartyMenu.exitCallback` (= notre
 *  `gMain.savedCallback`, sortie ULTIME vers le field). Set par
 *  `CursorCb_Summary` (RESUME) = CB2_ShowPokemonSummaryScreen. */
let _partyTransientExitCb: (() => void) | null = null;
/** Mon ciblé par CB2_ShowPokemonSummaryScreen (= `gPlayerParty[
 *  gPartyMenu.slotId]`) + garde one-shot : le décomp `ShowPokemonSummaryScreen`
 *  est synchrone, notre `OpenSummaryScreen` est async (_loadAssets) donc ce CB2
 *  est rappelé chaque frame jusqu'au SetMainCallback2(CB2_InitSummaryScreen). */
let _summaryTargetMon: PokemonInstance | null = null;
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
// Étape 4 (switch en combat, mode PARTY_ACTION_SEND_OUT) : slot du mon ACTIF
// (interdit de le re-choisir) + si l'annulation B est permise (switch volontaire
// = oui ; choix forcé après K.O. = non). Lus par les handlers A/B SEND_OUT.
let _battleSwitchActiveSlot = -1;
let _battleSwitchAllowCancel = true;
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
  rt.SetGpuReg(0x00, 0);  // DISPCNT
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0;
    oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) {
    rt.gPlttBufferUnfaded.set(i, 0);
    rt.gPlttBufferFaded.set(i, 0);
  }
  // Direct PLTT clear (bypass bufferTransferDisabled).
  for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
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
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0);
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
  const mon = (gSaveBlock1Ptr.playerParty as PokemonInstance[])[slotIdx];
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

/** 1:1 décomp `ConvertIntToDecimalStringN(buf, n, STR_CONV_MODE_RIGHT_ALIGN, 3)`
 *  (string_util.c:163-217) : entier justifié à DROITE dans un champ de
 *  EXACTEMENT 3 caractères. Le padding GAUCHE est **CHAR_SPACER** (0x77,
 *  string_util.c:209) — PAS CHAR_SPACE (0x00). CHAR_SPACER a une largeur
 *  FONT_SMALL de 5 px (= largeur d'un chiffre ; gFontSmallLatinGlyphWidths
 *  [0x77]=5, fonts.c:48), alors que CHAR_SPACE = 3 px. Donc le nombre est
 *  rendu en mono-chasse 5px → le "/" final de DisplayPartyPokemonHP tombe
 *  TOUJOURS à x = HPx + 15 (= x du "/" de MaxHP) quel que soit le nombre de
 *  chiffres → les 2 "/" coïncident → 1 SEUL slash visible, 1:1 ROM (le hack
 *  précédent paddait avec CHAR_SPACE 3px → "/" 2px trop à gauche pour ≤2
 *  chiffres → double-slash visible "20// 20" ≠ ROM "20/ 20").
 *  CHAR_SPACER ↔ JS 'ラ' (U+30E9) dans notre charmap (1:1 charmap.txt:280). */
// Helper local _rightAlign3 retiré : `ConvertIntToDecimalStringN(value,
// RIGHT_ALIGN, 3)` (decomp-bridge) fait l exact même travail 1:1 — substrat
// partagé avec summary-screen + 14 autres callers (factoring dedup 2026-05-20).
const _rightAlign3 = (n: number) =>
  ConvertIntToDecimalStringN('', n, STR_CONV_MODE_RIGHT_ALIGN, 3);

/** Render text for slot N. Positions 1:1 décomp `sPartyBoxInfoRects`
 *  (party_menu.h:32) — Nickname/Level/HP/MaxHP fixed coords per box layout. */
function _drawSlot(slotIdx: number): void {
  if (_slotWindowIds[slotIdx] === undefined) return;
  const wid = _slotWindowIds[slotIdx];
  const mon = (gSaveBlock1Ptr.playerParty as PokemonInstance[])[slotIdx];
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
  const gSym = getMonGenderSymbol(mon);
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
    AddTextPrinterParameterized3(wid, FONT_SMALL, 38, 37, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
    AddTextPrinterParameterized3(wid, FONT_SMALL, 53, 37, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
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
    AddTextPrinterParameterized3(wid, FONT_SMALL, 102, 12, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
    AddTextPrinterParameterized3(wid, FONT_SMALL, 117, 12, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  }
  void MON_MALE; void MON_FEMALE;  // referenced via getMonGenderSymbol
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
function _drawHpBar(slotIdx: number, mon: PokemonInstance): void {
  if (!_assets) return;
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum;
  if (slotPalNum === undefined) return;

  // Load HP bar palette colors selon le level.
  const level = _getHpBarLevel(mon.currentHp, mon.maxHp);
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
  const hpFraction = Math.floor((mon.currentHp / mon.maxHp) * w);

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
  const mon = (gSaveBlock1Ptr.playerParty as PokemonInstance[])[slotIdx];
  if (mon && mon.currentHp === 0) palFlags |= PARTY_PAL_FAINTED;
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
    const mon = (gSaveBlock1Ptr.playerParty as PokemonInstance[])[slotIdx];
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
        const spr = rt.gSprites.get(pkId);
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
    const spr = rt.gSprites.get(_cancelButtonOamId);
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
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
  let numAlive = 0;
  for (const m of party) {
    if (m && m.currentHp > 0) numAlive++;
    if (numAlive > 1) break;
  }
  const useChooseMon = numAlive > 1;
  // 1:1 décomp switch sur stringId : DO_WHAT_WITH_MON ou CHOOSE_MON.
  let msg: string;
  let template: WindowTemplate;
  if (_phase === 'action_menu') {
    msg = getString('gText_DoWhatWithPokemon');  // "Que faire avec ce PKMN?"
    template = DO_WHAT_WITH_MON_WINDOW_TEMPLATE;
  } else if (_partyAction === PARTY_ACTION_SWITCH) {
    // 1:1 décomp DisplayPartyMenuStdMessage(PARTY_MSG_MOVE_TO_WHERE)
    // (party_menu.c:2803 ; party_menu.h:603 → gText_MoveToWhere ;
    //  strings.c:431 = "Le mettre où?"). Même famille fenêtre que CHOOSE_MON.
    msg = getString('gText_MoveToWhere');
    template = MSG_WINDOW_TEMPLATE;
  } else if (_phase === 'item_used_msg' && _itemUsedMsgText) {
    // 1:1 décomp DisplayPartyMenuMessage → PrintMessage(text) (party_menu.c:
    // 1706/2566) — utilise WIN_MSG = sSinglePartyMenuWindowTemplate[6]
    // (party_menu.h:180-187) = 28×4 tiles (= 2 lignes FONT_NORMAL). C'est
    // PAS la window CHOOSE_MON (= 21×2). Le `\n` du décomp FR pour
    // gText_PkmnHPRestoredByVar2 prend la 2e ligne.
    msg = _itemUsedMsgText;
    template = ITEM_USED_MSG_WINDOW_TEMPLATE;
  } else if (_partyAction === PARTY_ACTION_USE_ITEM) {
    // 1:1 décomp DisplayPartyMenuStdMessage(PARTY_MSG_USE_ON_WHICH_MON)
    // (party_menu.c:4646 ; party_menu.h:605 → gText_UseOnWhichPokemon ;
    //  strings.c:433 = "Utiliser sur quel POKéMON?"). Famille fenêtre CHOOSE_MON.
    msg = getString('gText_UseOnWhichPokemon');
    template = MSG_WINDOW_TEMPLATE;
  } else {
    msg = useChooseMon ? getString('gText_ChoosePokemon') : getString('gText_ChoosePokemonCancel');
    template = MSG_WINDOW_TEMPLATE;
  }
  _msgWid = AddWindow(template);
  // 1:1 décomp `DrawStdFrameWithCustomTileAndPalette(*windowPtr, FALSE, 0x4F, 13)`.
  DrawStdFrameWithCustomTileAndPalette(_msgWid, false, 0x4F, 13);
  AddTextPrinterParameterized3(_msgWid, FONT_NORMAL, 0, 1, [1, 2, 3], TEXT_SKIP_DRAW, msg);
  CopyWindowToVram(_msgWid, 3);
}

/** 1:1 décomp `CreatePartyMonPokeballSprite` (party_menu.c:4122) :
 *  Spawn une mini-pokeball OAM 32×32 à `menuBox->spriteCoords[6, 7]` pour
 *  chaque slot occupé. Réutilise les tiles + palette du SORTIR pokeball
 *  (= sSpriteTemplate_MenuPokeball, TAG_POKEBALL shared). */
function _spawnSlotPokeballOams(): void {
  const rt = getRuntime();
  if (!rt) return;
  _pokeballOamBySlot = [-1, -1, -1, -1, -1, -1];
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
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
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
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
function _ailmentFromStatus(mon: PokemonInstance | undefined): number {
  if (!mon) return 0;
  if (mon.currentHp === 0) return 7;            // 1:1 :1928 AILMENT_FNT
  const st = mon.status;
  const a = st === 'PSN' || st === 'TOX' ? 1 : st === 'PAR' ? 2 : st === 'SLP' ? 3
    : st === 'FRZ' ? 4 : st === 'BRN' ? 5 : 0;
  return a;                                     // 1:1 :1930-1935 (pokérus n/a → NONE)
}

/** 1:1 décomp `SetPartyMonAilmentGfx`→`UpdatePartyMonAilmentGfx`
 *  (party_menu.c:4203-4221) : AILMENT_NONE/PKRS → sprite invisible ;
 *  sinon `StartSpriteAnim(sprite, ailment-1)` (frame (ailment-1)*4) +
 *  visible. Statut slot-pinned (dérivé de gSaveBlock1Ptr.playerParty[slot].status). */
function _updatePartyMonAilmentGfx(slot: number): void {
  const rt = getRuntime();
  const id = _statusOamBySlot[slot];
  if (!rt || id === undefined || id < 0) return;
  const spr = rt.gSprites.get(id);
  if (!spr) return;
  const mon = (gSaveBlock1Ptr.playerParty as PokemonInstance[])[slot];
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
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
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
  const spr = rt.gSprites.get(id);
  if (!spr) return;
  const mon = (gSaveBlock1Ptr.playerParty as PokemonInstance[])[slot];
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
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon) continue;
    // 1:1 décomp `CreatePartyMonIconSprite` (party_menu.c:3937) : species2 =
    // MON_DATA_SPECIES_OR_EGG → SPECIES_EGG si œuf → gMonIconTable[SPECIES_EGG]
    // = icône d'ŒUF (pas l'icône de l'espèce dedans).
    const dexId = mon.isEgg ? 'egg' : mon.speciesEnum.replace(/^SPECIES_/, '').toLowerCase();
    const iconPalSpecies = mon.isEgg ? 'SPECIES_EGG' : mon.speciesEnum;
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
    const spr = rt.gSprites.get(id);
    if (spr) { spr.inUse = false; const oam = rt.gba.oam[spr.oamIndex]; if (oam) oam.visible = false; }
    rt.gSprites.delete(id);
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
  const partyCount = (gSaveBlock1Ptr.playerParty as PokemonInstance[]).length;
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
  const spr = rt.gSprites.get(id); if (!spr) return;
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
  const spr = rt.gSprites.get(id); if (!spr) return;
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
      const spr = rt.gSprites.get(_iconOamBySlot[i]);
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
  [MENU_CANCEL1]:    'RETOUR',
  [MENU_CANCEL2]:    'RETOUR',
  // MENU_FIELD_MOVES + j (= field move name FR from gMoveNames).
  // Résolution dynamique dans _renderActionMenuContents (= pas table statique).
};

/** Field move names FR — sMovesNamesFR mapped via sFieldMoves order. */
const FIELD_MOVE_NAMES_FR: readonly string[] = [
  'COUPE', 'FLASH', 'EBOULEMENT', 'FORCE',
  'SURF', 'VOL', 'PLONGEE', 'CASCADE',
  'TELEPORT', 'TUNNEL', 'POUVOIRSECRET', 'BUVECLAIR',
  'DOUXFOYER', 'DOUXPARFUM',  // 1:1 ordering decomp
];

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
      ? (FIELD_MOVE_NAMES_FR[actionKey - MENU_FIELD_MOVES] ?? '')
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
  // 1:1 décomp `SetPartyMonFieldSelectionActions` (party_menu.c:2607) :
  //   AppendToList(MENU_SUMMARY);
  //   for each field move: AppendToList(MENU_FIELD_MOVES + j);
  //   if (party[1].species != NONE) AppendToList(MENU_SWITCH);  ← ORDRE
  //   if (item is mail) AppendToList(MENU_MAIL); else AppendToList(MENU_ITEM);
  //   AppendToList(MENU_CANCEL1);
  _actionList = [MENU_SUMMARY];
  // 1:1 décomp party_menu.c:2615-2625 : iterate party[slotId].moves (= 4 slots) ;
  // pour chaque move, chercher dans sFieldMoves[] ; si trouvé : push MENU_FIELD_MOVES + j.
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
  const mon = party[_slotId];  // 1:1 décomp `mons[slotId]` (party_menu.c:2619).
  if (mon && mon.moves) {
    for (let i = 0; i < mon.moves.length && i < 4; i++) {
      const moveId = mon.moves[i]?.id;
      if (!moveId) continue;
      for (let j = 0; j < sFieldMoves.length; j++) {
        if (moveId === sFieldMoves[j]) {
          _actionList.push(MENU_FIELD_MOVES + j);
          break;
        }
      }
    }
  }
  // 1:1 décomp :2629-2630 : if (mons[1].species != SPECIES_NONE) push MENU_SWITCH.
  if (party.length > 1 && party[1] && party[1].speciesEnum !== 'SPECIES_NONE') {
    _actionList.push(MENU_SWITCH);  // ORDRE - si plus de 1 mon
  }
  // 1:1 décomp :2631-2634 : if (ItemIsMail(heldItem)) push MENU_MAIL else MENU_ITEM.
  // Notre heldItem est string EN canonique (= 'orangemail' format) ; check via
  // resolveDecompConstant pour bridge string→u16 puis ItemIsMail.
  const heldItemKey = mon?.heldItem
    ? 'ITEM_' + mon.heldItem.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '')
    : '';
  const heldItemId = heldItemKey ? (resolveDecompConstant(heldItemKey) ?? 0) : 0;
  if (heldItemId !== 0 && ItemIsMail(heldItemId)) {
    _actionList.push(MENU_MAIL);
  } else {
    _actionList.push(MENU_ITEM);
  }
  _actionList.push(MENU_CANCEL1);
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
  const sa = rt.gSprites.get(arr[i]);   // = ex-b
  const sb = rt.gSprites.get(arr[j]);   // = ex-a
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
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
  const tmp = party[_slotId];
  party[_slotId] = party[_slotId2];
  party[_slotId2] = tmp;
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
  const pk = rt.gSprites.get(_pokeballOamBySlot[slot]);
  const ic = rt.gSprites.get(_iconOamBySlot[slot]);
  const st = rt.gSprites.get(_statusOamBySlot[slot]);
  const it = rt.gSprites.get(_itemOamBySlot[slot]);
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
      const mon = (gSaveBlock1Ptr.playerParty as PokemonInstance[])[_slotId];
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
      // Dette R3 documentée : 1:1 décomp `CursorCb_Item` (party_menu.c:2786)
      // cascade vers DisplaySelectionWindow(ACTIONS_ITEM) → MENU_GIVE/MENU_TAKE_ITEM
      // sub-menu → CB2 swap vers bag-screen filtré. Demande wire CB2 swap
      // bag-screen + sub-action handlers (= TakeMail/TakeItem/Give item from bag).
      console.log('[party-screen] OBJET → dette R3 (cascade CursorCb_Item U-tier)');
      _closeActionMenu();
    } else if (action === MENU_MAIL /* MAIL */) {
      // Dette R3 documentée : 1:1 décomp `CursorCb_Mail` (party_menu.c:2807)
      // cascade vers DisplaySelectionWindow(ACTIONS_MAIL) → READ/TAKE_MAIL.
      // Demande CB2 swap vers ReadMail screen + bag-add flow équivalent.
      console.log('[party-screen] MAIL → dette R3 (cascade CursorCb_Mail U-tier)');
      _closeActionMenu();
    } else if (action >= MENU_FIELD_MOVES) {
      // Dette R3 documentée : 1:1 décomp `CursorCb_FieldMove` (party_menu.c:3702)
      // cascade vers :
      //  1. Check badge requis (= FLAG_BADGE01..08 pour field moves 0..7).
      //  2. Si badge OK → trigger sFieldMoveCursorCallbacks[j].cursorCb + setup
      //     gPostMenuFieldCallback → fade screen + close party + run field move.
      //  3. Si pas badge → afficher "Pas la marque pour utiliser X".
      // Demande wire field-effect.c subsystem + flag check + script setup.
      const fieldMoveIdx = action - MENU_FIELD_MOVES;
      console.log(`[party-screen] FIELD_MOVE[${fieldMoveIdx}=${FIELD_MOVE_NAMES_FR[fieldMoveIdx] ?? '?'}] → dette R3 (cascade CursorCb_FieldMove U-tier)`);
      _closeActionMenu();
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
  // Sub-state item used message : attend ack A/B press → close.
  // 1:1 décomp Task_ClosePartyMenuAfterText (party_menu.c:4472) : check
  // !IsPartyMenuTextPrinterActive + A/B press → Task_ClosePartyMenu.
  if (_phase === 'item_used_msg') {
    const newKeys = rt.gMain.newKeys;
    const KEY_A = 0x0001, KEY_B = 0x0002;
    if (newKeys & (KEY_A | KEY_B)) {
      PlaySE(5);  // SE_SELECT
      _itemUsedMsgText = null;
      ClosePartyScreen();
    }
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
      // 1:1 décomp IsSelectedMonNotEgg : on évite slot vide/egg. Notre party
      // n'a pas d'œuf encore, on check juste mon présent.
      const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
      const mon = party[_slotId];
      if (!mon) return;  // 1:1 :1310 IsSelectedMonNotEgg FALSE = silent skip.
      // Invoque gItemUseCB (= ItemUseCB_Medicine pour POTION etc.).
      const cb = (globalThis as Record<string, unknown>).gItemUseCB as
        | ((taskId: number, returnTask: ((task: DecompTask) => void) | null) => void)
        | null
        | undefined;
      if (typeof cb === 'function') {
        const taskId = _inputTaskId;
        cb(taskId, null);  // 1:1 :1316 gItemUseCB(taskId, Task_ClosePartyMenuAfterText)
      }
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
      const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
      const mon = party[_slotId];
      // 1:1 : interdit le mon DÉJÀ au combat (= actif) ou un mon K.O. (les messages
      // FR "déjà en plein combat" / "plus d'énergie" = polish ultérieur ; ici no-op).
      if (_slotId === _battleSwitchActiveSlot || !mon || mon.currentHp <= 0) {
        PlaySE(5);
        return;  // reste sur la sélection
      }
      PlaySE(5);
      (globalThis as Record<string, unknown>).__battleSwitchResultSlot = _slotId;
      ClosePartyScreen();
    } else {
      // A sur slot mon → ouvre action menu. (A sur CANCEL est mappé à B.)
      _openActionMenu(rt);
    }
  } else if (result === KEY_B) {
    PlaySE(5);
    if (_partyAction === PARTY_ACTION_SWITCH) {
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
    case 4: ResetSpriteData(); rt.gMain.state++; break;
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
  _partyAction = PARTY_ACTION_SEND_OUT;
  _battleSwitchActiveSlot = opts.activeSlot;
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
 *  `mon.currentHp` + redraw le slot. À la fin (delta atteint) : appelle
 *  `onDone()`.
 *
 *  Le caller (ItemUseCB_Medicine) doit avoir DÉJÀ appliqué l'effet (=
 *  mon.currentHp = newHp post-heal). Cette fonction reverse momentanément
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
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
  const mon = party[slotIdx];
  if (!mon) { onDone(); return; }
  const delta = newHp - oldHp;
  if (delta === 0) { onDone(); return; }
  // Reverse à oldHp pour démarrer l'anim.
  mon.currentHp = oldHp;
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
  const party = gSaveBlock1Ptr.playerParty as PokemonInstance[];
  const mon = party[_hpAnimSlot];
  if (!mon) {
    // Mon disparu en cours d'anim → cancel + onDone.
    const cb = _hpAnimOnDone; _hpAnimOnDone = null;
    cb?.();
    return;
  }
  mon.currentHp += _hpAnimDirection;
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
