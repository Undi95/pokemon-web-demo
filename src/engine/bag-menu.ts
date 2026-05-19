/**
 * bag-menu.ts — SAC 1:1 décomp `src/item_menu.c` (2609 l) — RÉÉCRITURE PROPRE
 * ============================================================================
 * Chantier maillon SAC (mémoire BAG-PHASE-2-PLAN). `list_menu.c` (BLOQUANT #1)
 * = 100% 1:1 fait. Ce module REMPLACE le foam reverted `bag-screen.ts`
 * (cddfcfee, base "en mousse") — réécrit PROPRE comme summary-screen.ts.
 * Le câblage start-menu/party bascule vers ici à l'ÉTAPE 9 (le plan le
 * prescrit) ; jusque-là `bag-screen.ts` continue de servir le sac → tsc
 * reste vert, zéro régression runtime.
 *
 * Pattern CB2-swap = IDENTIQUE au summary-screen.ts prouvé/A-B-validé :
 * `SetupBagMenu` (décomp `CB2_Bag` while-loop) → state machine avancée
 * d'UN état par frame par le runtime (1:1 net-effect : tout est derrière
 * un fade noir jusqu'à BlendPalettes/FadeScreen ; adaptation acceptée &
 * validée pour Summary/party — synchrone, PAS d'async ad-hoc = exigence
 * anti-foam respectée).
 *
 * ── ÉTAT D'AVANCEMENT (SPINE, A/B user aux checkpoints) ──────────────────
 *  ÉTAPE 2 (ICI)  : state model gBagMenu/gBagPosition + GoToBagMenu +
 *                   entrées maillon (CB2_BagMenuFrom*) + CB2_Bag +
 *                   SetupBagMenu 1:1 STRUCTURE + CB2/VBlank run.
 *  ÉTAPE 3..9     : helpers `_nyi(...)` (throw LOUD honnête, WORKING-MODE
 *                   §2 — jamais de fake silencieux) portés au fur.
 * Non wiré → ouvrir le sac passe encore par le foam ; ici tsc=0 +
 * import sain (feuille, pas de cycle TDZ) = vérif déterministe étape 2.
 */
import {
  getRuntime, ResetPaletteFade, ResetTasks,
  FreeAllSpritePalettes, ScanlineEffect_Stop, LoadPalette, PIXEL_FILL,
  assetCache,
} from './decomp-globals';
import { ResetSpriteData, PLTT_SIZE_4BPP } from './decomp-bridge';
import { ListMenuLoadStdPalAt } from './gba-menu-system';
import {
  ShowBg, InitWindows, FillWindowPixelBuffer, PutWindowTilemap,
  LoadMessageBoxGfx, ScheduleBgCopyTilemapToVram, type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { DeactivateAllTextPrinters } from './gba-text-system';
import { BG_PLTT_ID } from './decomp-runtime';
import { loadTileBin, loadTilemapBin, loadGbaPal } from './gba/png-loader';
import { gameState } from './game-state';
import {
  ENUM_ITEMMENULOCATION_0, ENUM_ITEMWIN_1, ENUM_ITEMMENUSPRITE_2,
  ITEMMENU_SWAP_LINE_LENGTH,
} from './decomp-data/auto/include/item_menu-data';
import {
  ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET,
  KEYITEMS_POCKET, POCKETS_COUNT,
} from './decomp-data/auto/include/constants/item-data';
import { BG_SCREEN_SIZE } from './decomp-data/auto/include/gba/defines-data';

// ─── Constantes 1:1 (importées decomp-data/auto sauf dérivées documentées) ───
export const ITEMMENULOCATION_FIELD = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_FIELD;
export const ITEMMENULOCATION_BATTLE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BATTLE;
export const ITEMMENULOCATION_PARTY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_PARTY;
export const ITEMMENULOCATION_SHOP = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_SHOP;
export const ITEMMENULOCATION_BERRY_TREE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BERRY_TREE;
export const ITEMMENULOCATION_BERRY_BLENDER_CRUSH = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BERRY_BLENDER_CRUSH;
export const ITEMMENULOCATION_ITEMPC = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_ITEMPC;
export const ITEMMENULOCATION_FAVOR_LADY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_FAVOR_LADY;
export const ITEMMENULOCATION_QUIZ_LADY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_QUIZ_LADY;
export const ITEMMENULOCATION_APPRENTICE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_APPRENTICE;
export const ITEMMENULOCATION_WALLY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_WALLY;
export const ITEMMENULOCATION_PCBOX = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_PCBOX;
export const ITEMMENULOCATION_LAST = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_LAST;

// ITEMMENUSPRITE_COUNT : ⚠️ l'auto-extract donne 5 (FAUX — il n'évalue
// pas l'expression `ITEMMENUSPRITE_SWAP_LINE + ITEMMENU_SWAP_LINE_LENGTH`).
// Décomp item_menu.h:46 : `ITEMMENUSPRITE_COUNT = ITEMMENUSPRITE_SWAP_LINE
// + ITEMMENU_SWAP_LINE_LENGTH` = 4 + 8 = 12. On le DÉRIVE 1:1 (pas hardcode).
const ITEMMENUSPRITE_SWAP_LINE = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_SWAP_LINE;
export const ITEMMENUSPRITE_BAG = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_BAG;
export const ITEMMENUSPRITE_COUNT = ITEMMENUSPRITE_SWAP_LINE + ITEMMENU_SWAP_LINE_LENGTH; // 12
export const ITEMWIN_COUNT = ENUM_ITEMWIN_1.ITEMWIN_COUNT; // 10
export { ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET, POCKETS_COUNT };

// 1:1 décomp enum WIN_* (item_menu.c:95) — fenêtres SANS cadre (le fond
// rayé menu.bin BG2 fait le layout ; feedback-bag-no-frames).
const WIN_ITEM_LIST = 0;
const WIN_DESCRIPTION = 1;
const WIN_POCKET_NAME = 2;
const WIN_TMHM_INFO_ICONS = 3;
const WIN_TMHM_INFO = 4;
const WIN_MESSAGE = 5;

// 1:1 décomp `sDefaultBagWindows` (item_menu.c:396). bg/tilemapLeft/Top/
// width/height/paletteNum/baseBlock identiques. (DUMMY_WIN_TEMPLATE = fin.)
const sDefaultBagWindows: readonly WindowTemplate[] = [
  { bg: 0, tilemapLeft: 14, tilemapTop: 2,  width: 15, height: 16, paletteNum: 1,  baseBlock: 0x27  }, // WIN_ITEM_LIST
  { bg: 0, tilemapLeft: 0,  tilemapTop: 13, width: 14, height: 6,  paletteNum: 1,  baseBlock: 0x117 }, // WIN_DESCRIPTION
  { bg: 0, tilemapLeft: 4,  tilemapTop: 1,  width: 8,  height: 2,  paletteNum: 1,  baseBlock: 0x1A1 }, // WIN_POCKET_NAME
  { bg: 0, tilemapLeft: 1,  tilemapTop: 13, width: 5,  height: 6,  paletteNum: 12, baseBlock: 0x16B }, // WIN_TMHM_INFO_ICONS
  { bg: 0, tilemapLeft: 7,  tilemapTop: 13, width: 4,  height: 6,  paletteNum: 12, baseBlock: 0x189 }, // WIN_TMHM_INFO
  { bg: 1, tilemapLeft: 2,  tilemapTop: 15, width: 27, height: 4,  paletteNum: 15, baseBlock: 0x1B1 }, // WIN_MESSAGE
];
/** ids window du sac (= retour InitWindows, indexé par WIN_*). 1:1 décomp :
 *  les WIN_* sont les ids globaux gWindows ; chez nous = ce tableau. */
let _bagWinIds: number[] = [];

// Sentinelles 1:1 : SPRITE_NONE sprite.h:6 / WINDOW_NONE window.h:43 /
// TASK_NONE task.h:6 (TAIL_SENTINEL=0xFF) / NOT_SWAPPING item_menu.c:104.
const SPRITE_NONE = 0xFF;
const WINDOW_NONE = 0xFF;
const TASK_NONE = 0xFF;
const NOT_SWAPPING = 0xFF;

type MainCallback = (() => void) | null;

// ─── struct BagPosition (item_menu.h:49) — PERSISTANT (décomp EWRAM_DATA,
//     jamais libéré : conserve poche/curseur/scroll entre 2 ouvertures) ──────
interface BagPosition {
  exitCallback: MainCallback;
  location: number;
  pocket: number;
  pocketSwitchArrowPos: number;
  cursorPosition: number[]; // [POCKETS_COUNT]
  scrollPosition: number[]; // [POCKETS_COUNT]
}
export const gBagPosition: BagPosition = {
  exitCallback: null,
  location: 0,
  pocket: 0,
  pocketSwitchArrowPos: 0,
  cursorPosition: new Array(POCKETS_COUNT).fill(0),
  scrollPosition: new Array(POCKETS_COUNT).fill(0),
};

// ─── struct BagMenu (item_menu.h:61) — PAR-OUVERTURE (AllocZeroed ;
//     null quand le sac est fermé). Champs 1:1. ──────────────────────────────
interface BagMenu {
  newScreenCallback: MainCallback;
  tilemapBuffer: Uint16Array;        // u8[BG_SCREEN_SIZE] utilisé en tilemap u16
  spriteIds: number[];               // [ITEMMENUSPRITE_COUNT]
  windowIds: number[];               // [ITEMWIN_COUNT]
  toSwapPos: number;
  pocketSwitchDisabled: number;      // :4
  itemIconSlot: number;              // :2
  inhibitItemDescriptionPrint: number; // :1
  hideCloseBagText: number;          // :1
  pocketScrollArrowsTask: number;
  pocketSwitchArrowsTask: number;
  contextMenuItemsPtr: readonly number[] | null;
  contextMenuItemsBuffer: number[];  // [4]
  contextMenuNumItems: number;
  numItemStacks: number[];           // [POCKETS_COUNT]
  numShownItems: number[];           // [POCKETS_COUNT]
  graphicsLoadState: number;         // s16
  pocketNameBuffer: Uint8Array;      // [32][32]
}
export let gBagMenu: BagMenu | null = null;

function _allocZeroedBagMenu(): BagMenu {
  return {
    newScreenCallback: null,
    tilemapBuffer: new Uint16Array(BG_SCREEN_SIZE >> 1), // 2048 octets = 1024 u16
    spriteIds: new Array(ITEMMENUSPRITE_COUNT).fill(0),
    windowIds: new Array(ITEMWIN_COUNT).fill(0),
    toSwapPos: 0,
    pocketSwitchDisabled: 0,
    itemIconSlot: 0,
    inhibitItemDescriptionPrint: 0,
    hideCloseBagText: 0,
    pocketScrollArrowsTask: 0,
    pocketSwitchArrowsTask: 0,
    contextMenuItemsPtr: null,
    contextMenuItemsBuffer: new Array(4).fill(0),
    contextMenuNumItems: 0,
    numItemStacks: new Array(POCKETS_COUNT).fill(0),
    numShownItems: new Array(POCKETS_COUNT).fill(0),
    graphicsLoadState: 0,
    pocketNameBuffer: new Uint8Array(32 * 32),
  };
}

/* ============================================================================
 * ÉTAPE 3 — BagMenu_InitBGs (item_menu.c:789) + LoadBagMenu_Graphics (:805)
 * Pattern BG-buffer + loader gated-bool = IDENTIQUE summary-screen.ts prouvé
 * (net-effect 1:1 du state machine synchrone décomp ; structure gated =
 * exigence anti-foam respectée, pas d'async ad-hoc éparpillé).
 * ========================================================================== */

// 1:1 décomp `sBgTemplates_ItemMenu` (item_menu.c:213) :
//  BG0 char0 map31 ss0 prio1 ; BG1 char0 map30 ss0 prio0 ; BG2 char3 map29 ss0 prio2.
const BAG_BG0_MAP_BASE = 31;
const BAG_BG1_MAP_BASE = 30;
const BAG_BG2_MAP_BASE = 29;
const BAG_BG2_CHAR_BASE = 3;

interface BagAssets {
  bgTiles: Uint8Array;       // gBagScreen_Gfx     (menu.4bpp.bin → BG2 charBase 3)
  bgTilemap: Uint16Array;    // gBagScreen_GfxTileMap (menu.bin → tilemapBuffer)
  palMale: Uint16Array;      // gBagScreenMale_Pal   (menu_male.pal)
  palFemale: Uint16Array;    // gBagScreenFemale_Pal (menu_female.pal)
  stdMenuPal: Uint16Array;   // gStandardMenuPalette (interface/std_menu.pal)
}
let _bagAssets: BagAssets | null = null;
let _bagAssetsLoading: Promise<BagAssets> | null = null;
let _bagGraphicsReady = false;
let _bagGraphicsLoading = false;

async function _bagLoadAssets(): Promise<BagAssets> {
  if (_bagAssets) return _bagAssets;
  if (_bagAssetsLoading) return _bagAssetsLoading;
  _bagAssetsLoading = (async () => {
    const [bgTiles, bgTilemap, palMale, palFemale, stdMenuPal, mi1, mi2, mi3] = await Promise.all([
      loadTileBin('/decomp/em/bag/menu.4bpp.bin', 4),
      loadTilemapBin('/decomp/em/bag/menu.bin'),
      loadGbaPal('/decomp/em/bag/menu_male.pal'),
      loadGbaPal('/decomp/em/bag/menu_female.pal'),
      loadGbaPal('/decomp/em/interface/std_menu.pal'),       // gStandardMenuPalette
      loadGbaPal('/decomp/em/interface/menu_info1.pal'),      // gMenuInfoElements1_Pal
      loadGbaPal('/decomp/em/interface/menu_info2.pal'),      // gMenuInfoElements2_Pal
      loadGbaPal('/decomp/em/interface/menu_info3.pal'),      // gMenuInfoElements3_Pal
    ]);
    // Préchauffe assetCache pour le ListMenuLoadStdPalAt PARTAGÉ (gba-menu-
    // system.ts) — pattern préchargement-symbole prouvé (intro/std_menu).
    assetCache.set('gMenuInfoElements1_Pal', mi1);
    assetCache.set('gMenuInfoElements2_Pal', mi2);
    assetCache.set('gMenuInfoElements3_Pal', mi3);
    _bagAssets = { bgTiles, bgTilemap, palMale, palFemale, stdMenuPal };
    return _bagAssets;
  })();
  return _bagAssetsLoading;
}

/** 1:1 décomp `IsWallysBag` (item_menu.c:2289) :
 *  `return gBagPosition.location == ITEMMENULOCATION_WALLY`. */
function IsWallysBag(): boolean {
  return gBagPosition.location === ITEMMENULOCATION_WALLY;
}

/** 1:1 décomp `SetBgTilemapBuffer(2, gBagMenu->tilemapBuffer)` +
 *  `ScheduleBgCopyTilemapToVram(2)` : le buffer (gBagMenu.tilemapBuffer,
 *  0x800 octets = 1024 u16) → VRAM mapBase BG2. Modèle BG-buffer prouvé
 *  Summary (`_scheduleBgCopy`), 1 seul buffer ici (≠ pages Summary). */
function _bagScheduleBgCopy(bg: number): void {
  const rt = getRuntime();
  if (!rt || !gBagMenu) return;
  if (bg === 0 || bg === 1) return; // BG0/BG1 = windows/ctx, gérés ailleurs
  const buf = gBagMenu.tilemapBuffer;
  const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  rt.gba.vram.set(bytes, BAG_BG2_MAP_BASE * 0x800);
}

/** 1:1 décomp `BagMenu_InitBGs` (item_menu.c:789). ResetVramOamAndBgCntRegs
 *  + InitBgsFromTemplates(sBgTemplates_ItemMenu) + SetBgTilemapBuffer(2)
 *  + ResetAllBgsCoordinates + ScheduleBgCopy(2) + DISPCNT OBJ + ShowBg
 *  0/1/2 + BLDCNT=0. Style runtime-API = pattern Summary `_initBGs`. */
function BagMenu_InitBGs(): void {
  const rt = getRuntime();
  if (!rt || !gBagMenu) return;
  // ResetVramOamAndBgCntRegs() : DISPCNT/BGxCNT=0, VRAM/OAM/PLTT clear.
  rt.SetGpuReg(0x00, 0);
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0;
    oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) { rt.gPlttBufferUnfaded.set(i, 0); rt.gPlttBufferFaded.set(i, 0); }
  // memset(gBagMenu->tilemapBuffer, 0, sizeof) — déjà zéro à l'alloc, 1:1.
  gBagMenu.tilemapBuffer.fill(0);
  // ResetBgsAndClearDma3BusyFlags(0) + InitBgsFromTemplates(sBgTemplates_ItemMenu).
  const cfg = (n: 0 | 1 | 2 | 3) => rt.gba.bg(n).config;
  const b0 = cfg(0);
  b0.charBaseIndex = 0; b0.mapBaseIndex = BAG_BG0_MAP_BASE; b0.screenSize = 0;
  b0.paletteMode = 0; b0.priority = 1; b0.hofs = 0; b0.vofs = 0;
  const b1 = cfg(1);
  b1.charBaseIndex = 0; b1.mapBaseIndex = BAG_BG1_MAP_BASE; b1.screenSize = 0;
  b1.paletteMode = 0; b1.priority = 0; b1.hofs = 0; b1.vofs = 0;
  const b2 = cfg(2);
  b2.charBaseIndex = BAG_BG2_CHAR_BASE; b2.mapBaseIndex = BAG_BG2_MAP_BASE; b2.screenSize = 0;
  b2.paletteMode = 0; b2.priority = 2; b2.hofs = 0; b2.vofs = 0;
  // SetBgTilemapBuffer(2, gBagMenu->tilemapBuffer) : le buffer EST
  // gBagMenu.tilemapBuffer (rien à enregistrer) ; ResetAllBgsCoordinates.
  for (let i = 0; i < 4; i++) { const c = cfg(i as 0 | 1 | 2 | 3); c.hofs = 0; c.vofs = 0; }
  _bagScheduleBgCopy(2);
  // SetGpuReg(DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP) (1:1 :798).
  rt.SetGpuReg(0x00, 0x1000 | 0x40);
  ShowBg(0); ShowBg(1); ShowBg(2);
  rt.SetGpuReg(0x50, 0); // BLDCNT = 0
}

/** 1:1 décomp `LoadBagMenu_Graphics` (item_menu.c:805) — STRUCTURE 5
 *  sous-états ; gated-bool = net-effect 1:1 (Summary prouvé). cases 0-2
 *  (fond BG2 = livrable visuel étape 3) ; case3/4 sprite sac =
 *  AddBagVisualSprite étape 5 (notre modèle sprite alloue à la création —
 *  report HONNÊTE, pas un fake) ; default LoadListMenuSwapLineGfx =
 *  swap-line étape 7. */
function LoadBagMenu_Graphics(): boolean {
  const rt = getRuntime();
  if (!rt || !gBagMenu) return false;
  if (_bagGraphicsReady) return true;
  if (_bagGraphicsLoading) return false;
  _bagGraphicsLoading = true;
  void _bagLoadAssets().then((a) => {
    const r = getRuntime();
    if (!r || !gBagMenu) { _bagGraphicsLoading = false; return; }
    // case 0 : DecompressAndCopyTileDataToVram(2, gBagScreen_Gfx) → BG2
    //          charBase 3 (1 charblock = 0x4000 octets).
    r.gba.vram.set(a.bgTiles, BAG_BG2_CHAR_BASE * 0x4000);
    // case 1 : LZDecompressWram(gBagScreen_GfxTileMap, tilemapBuffer)
    //          (0x800 octets = 1024 u16) + ScheduleBgCopy(2).
    gBagMenu.tilemapBuffer.set(a.bgTilemap.subarray(0, gBagMenu.tilemapBuffer.length));
    _bagScheduleBgCopy(2);
    // case 2 : LoadCompressedPalette(gBagScreen{Female,Male}_Pal,
    //          BG_PLTT_ID(0), 2*PLTT_SIZE_4BPP) — gender 1:1 (:822).
    const pal = (!IsWallysBag() && gameState.gender !== 'MALE') ? a.palFemale : a.palMale;
    LoadPalette(pal, BG_PLTT_ID(0), 2 * 16 * 2); // 2 palettes = 32 u16
    _bagGraphicsReady = true;
    _bagGraphicsLoading = false;
  }).catch((e) => { console.error('[bag] graphics load failed:', e); _bagGraphicsLoading = false; });
  return false;
}

// ─── Helpers étapes 4..9 non encore portés — STUB HONNÊTE LOUD ───────────────
// WORKING-MODE §2 : jamais de fake silencieux. Atteint = crash explicite
// (le sac n'est PAS encore wiré au start-menu → jamais atteint en jeu ;
// la structure de la state machine ci-dessous est, elle, 1:1 complète).
function _nyi(step: number, name: string): never {
  throw new Error(`bag-menu SPINE étape ${step} : ${name} pas encore porté (item_menu.c)`);
}

// ─── ResetBagScrollPositions (item_menu.c:556) ───────────────────────────────
export function ResetBagScrollPositions(): void {
  gBagPosition.pocket = ITEMS_POCKET;
  gBagPosition.cursorPosition.fill(0);
  gBagPosition.scrollPosition.fill(0);
}

// ─── Entrées maillon (item_menu.c:563-615) — thin 1:1 ────────────────────────
/** 1:1 décomp `CB2_BagMenuFromStartMenu` (item_menu.c:563). */
export function CB2_BagMenuFromStartMenu(): void {
  // exitCallback CB2_ReturnToFieldWithOpenMenu : câblé à l'étape 9 (flow OW).
  GoToBagMenu(ITEMMENULOCATION_FIELD, POCKETS_COUNT, _cb2ReturnToFieldWithOpenMenu);
}
/** 1:1 décomp `CB2_BagMenuFromBattle` (item_menu.c:568). Branche pyramide =
 *  MAILLON ultérieur (battle_pyramid_bag.c, fichier séparé). */
export function CB2_BagMenuFromBattle(): void {
  // CurrentBattlePyramidLocation()==NONE : pyramide non portée → branche
  // normale uniquement (report honnête ; pyramide = étape MAILLON).
  GoToBagMenu(ITEMMENULOCATION_BATTLE, POCKETS_COUNT, _cb2SetUpReshowBattleScreenAfterMenu2);
}
/** 1:1 décomp `CB2_ChooseBerry` (item_menu.c:577). */
export function CB2_ChooseBerry(): void {
  GoToBagMenu(ITEMMENULOCATION_BERRY_TREE, BERRIES_POCKET, _cb2ReturnToFieldContinueScript);
}
/** 1:1 décomp `ChooseBerryForMachine` (item_menu.c:583). */
export function ChooseBerryForMachine(exitCallback: MainCallback): void {
  GoToBagMenu(ITEMMENULOCATION_BERRY_BLENDER_CRUSH, BERRIES_POCKET, exitCallback);
}

// exitCallbacks externes — résolus au câblage étape 9 (placeholders honnêtes
// NON appelés tant que le sac n'est pas wiré ; pas des fakes silencieux).
const _cb2ReturnToFieldWithOpenMenu: MainCallback = null;
const _cb2SetUpReshowBattleScreenAfterMenu2: MainCallback = null;
const _cb2ReturnToFieldContinueScript: MainCallback = null;

// ─── GoToBagMenu (item_menu.c:617) — 1:1 strict ──────────────────────────────
export function GoToBagMenu(location: number, pocket: number, exitCallback: MainCallback): void {
  gBagMenu = _allocZeroedBagMenu(); // AllocZeroed ne peut pas échouer ici (≠ C OOM)
  if (location !== ITEMMENULOCATION_LAST)
    gBagPosition.location = location;
  if (exitCallback)
    gBagPosition.exitCallback = exitCallback;
  if (pocket < POCKETS_COUNT)
    gBagPosition.pocket = pocket;
  if (gBagPosition.location === ITEMMENULOCATION_BERRY_TREE ||
      gBagPosition.location === ITEMMENULOCATION_BERRY_BLENDER_CRUSH)
    gBagMenu.pocketSwitchDisabled = 1; // :4 bitfield, TRUE
  gBagMenu.newScreenCallback = null;
  gBagMenu.toSwapPos = NOT_SWAPPING;
  gBagMenu.pocketScrollArrowsTask = TASK_NONE;
  gBagMenu.pocketSwitchArrowsTask = TASK_NONE;
  gBagMenu.spriteIds.fill(SPRITE_NONE);
  gBagMenu.windowIds.fill(WINDOW_NONE);
  const rt = getRuntime();
  if (rt) rt.SetMainCallback2(CB2_Bag);
}

// ─── CB2_BagMenuRun / VBlankCB_BagMenuRun (item_menu.c:646/655) ──────────────
// 1:1 net-effect : RunTasks/AnimateSprites/BuildOamBuffer/DoScheduledBg…/
// UpdatePaletteFade (et LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer)
// = auto-tickés par notre runtime (modèle prouvé Summary `MainCB2_SummaryRun`).
export function CB2_BagMenuRun(): void { /* runtime auto-tick */ }
export function VBlankCB_BagMenuRun(): void { /* transferts auto */ }

// ─── CB2_Bag (item_menu.c:672) + SetupBagMenu (item_menu.c:678) ──────────────
// décomp `CB2_Bag` = `while(!waitLink && !SetupBagMenu() && !linkActive){}`.
// Adaptation 1:1 prouvée (Summary) : le runtime appelle CB2_Bag chaque
// frame, SetupBagMenu avance d'UN état. Net-effect identique (tout sous
// fade noir jusqu'au case 20). Lien : non modélisé → pas de wait link.
export function CB2_Bag(): void {
  SetupBagMenu();
}

/** 1:1 décomp `SetupBagMenu` (item_menu.c:678) — STRUCTURE state machine
 *  0..20 strictement 1:1 ; leaf-helpers étapes 3..9 = `_nyi` (loud). */
function SetupBagMenu(): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  switch (rt.gMain.state) {
    case 0:
      // SetVBlankHBlankCallbacksToNull + ClearScheduledBgCopiesToVram.
      rt.SetVBlankCallback(null);
      rt.gMain.state++; break;
    case 1:
      ScanlineEffect_Stop();
      rt.gMain.state++; break;
    case 2:
      FreeAllSpritePalettes();
      rt.gMain.state++; break;
    case 3:
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++; break;
    case 4:
      ResetSpriteData();
      rt.gMain.state++; break;
    case 5:
      rt.gMain.state++; break;
    case 6:
      // if (!MenuHelpers_IsLinkActive()) ResetTasks() — lien non modélisé.
      ResetTasks();
      rt.gMain.state++; break;
    case 7:
      BagMenu_InitBGs();
      gBagMenu!.graphicsLoadState = 0;
      rt.gMain.state++; break;
    case 8:
      if (!LoadBagMenu_Graphics())
        break;
      rt.gMain.state++; break;
    case 9:
      LoadBagMenuTextWindows();
      rt.gMain.state++; break;
    case 10:
      UpdatePocketItemLists();
      InitPocketListPositions();
      InitPocketScrollPositions();
      rt.gMain.state++; break;
    case 11:
      AllocateBagItemListBuffers();
      rt.gMain.state++; break;
    case 12:
      LoadBagItemListBuffers(gBagPosition.pocket);
      rt.gMain.state++; break;
    case 13:
      PrintPocketNames(gBagPosition.pocket);
      CopyPocketNameToWindow(0);
      DrawPocketIndicatorSquare(gBagPosition.pocket, true);
      rt.gMain.state++; break;
    case 14: {
      const taskId = CreateBagInputHandlerTask(gBagPosition.location);
      BagSetListTaskId(taskId, ListMenuInitForBag(
        gBagPosition.scrollPosition[gBagPosition.pocket],
        gBagPosition.cursorPosition[gBagPosition.pocket]));
      rt.gMain.state++; break;
    }
    case 15:
      AddBagVisualSprite(gBagPosition.pocket);
      rt.gMain.state++; break;
    case 16:
      CreateItemMenuSwapLine();
      rt.gMain.state++; break;
    case 17:
      CreatePocketScrollArrowPair();
      CreatePocketSwitchArrowPair();
      rt.gMain.state++; break;
    case 18:
      PrepareTMHMMoveWindow();
      rt.gMain.state++; break;
    case 19:
      BlendPalettesBag();
      rt.gMain.state++; break;
    case 20:
      BeginNormalPaletteFadeBag();
      rt.gPaletteFade.bufferTransferDisabled = false;
      rt.gMain.state++; break;
    default:
      rt.SetVBlankCallback(VBlankCB_BagMenuRun);
      rt.SetMainCallback2(CB2_BagMenuRun);
      return true;
  }
  return false;
}

// ─── Leaf-helpers SetupBagMenu — portés étapes 4..9 (stubs LOUD honnêtes) ────
// (BagMenu_InitBGs + LoadBagMenu_Graphics = portés étape 3 ; ListMenuLoad
//  StdPalAt = porté 1:1 dans gba-menu-system.ts, importé en tête — chaînon
//  MAILLON résolu : menu_info{1,2,3}.pal copiés 1:1 + préchargés assetCache.)

/** 1:1 décomp `LoadBagMenuTextWindows` (item_menu.c:2457). InitWindows
 *  (sDefaultBagWindows) + DeactivateAllTextPrinters + palettes border(14)/
 *  msgbox(13)/listStd(12)/stdMenu(15) + FillWindowPixelBuffer(PIXEL_FILL
 *  (0))+PutWindowTilemap pour WIN_ITEM_LIST..WIN_POCKET_NAME (AUCUN
 *  DrawStdFrame — feedback-bag-no-frames) + ScheduleBgCopy 0/1. */
function LoadBagMenuTextWindows(): void {
  // 1:1 :2461 InitWindows(sDefaultBagWindows) — retourne les ids (≠ AddWindow
  // ad-hoc, feedback-bag-refactor landmine #1 : pas de leak gWindows OW).
  _bagWinIds = InitWindows(sDefaultBagWindows);
  DeactivateAllTextPrinters();                              // :2462
  LoadUserWindowBorderGfx(0, 1, BG_PLTT_ID(14));            // :2463
  LoadMessageBoxGfx(0, 10, BG_PLTT_ID(13));                 // :2464
  ListMenuLoadStdPalAt(BG_PLTT_ID(12), 1);                  // :2465 (maillon stub)
  // :2466 LoadPalette(&gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP)
  // — assets prêts en case 8 (gate _bagGraphicsReady), lecture sync 1:1.
  if (_bagAssets) LoadPalette(_bagAssets.stdMenuPal, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
  // :2467 for (i=0; i<=WIN_POCKET_NAME; i++) — transparent, SANS cadre.
  for (let i = WIN_ITEM_LIST; i <= WIN_POCKET_NAME; i++) {
    const wid = _bagWinIds[i];
    FillWindowPixelBuffer(wid, PIXEL_FILL(0));
    PutWindowTilemap(wid);
  }
  ScheduleBgCopyTilemapToVram(0);                            // :2472
  ScheduleBgCopyTilemapToVram(1);                            // :2473
}
function UpdatePocketItemLists(): void { _nyi(5, 'UpdatePocketItemLists'); }
function InitPocketListPositions(): void { _nyi(5, 'InitPocketListPositions'); }
function InitPocketScrollPositions(): void { _nyi(5, 'InitPocketScrollPositions'); }
function AllocateBagItemListBuffers(): void { _nyi(5, 'AllocateBagItemListBuffers'); }
function LoadBagItemListBuffers(_pocketId: number): void { _nyi(5, 'LoadBagItemListBuffers'); }
function PrintPocketNames(_pocket: number): void { _nyi(5, 'PrintPocketNames'); }
function CopyPocketNameToWindow(_a: number): void { _nyi(5, 'CopyPocketNameToWindow'); }
function DrawPocketIndicatorSquare(_p: number, _on: boolean): void { _nyi(5, 'DrawPocketIndicatorSquare'); }
function CreateBagInputHandlerTask(_location: number): number { return _nyi(6, 'CreateBagInputHandlerTask'); }
function ListMenuInitForBag(_scroll: number, _cursor: number): number { return _nyi(6, 'ListMenuInit(bag)'); }
function BagSetListTaskId(_taskId: number, _listTaskId: number): void { _nyi(6, 'tListTaskId set'); }
function AddBagVisualSprite(_pocket: number): void { _nyi(5, 'AddBagVisualSprite'); }
function CreateItemMenuSwapLine(): void { _nyi(7, 'CreateItemMenuSwapLine'); }
function CreatePocketScrollArrowPair(): void { _nyi(5, 'CreatePocketScrollArrowPair'); }
function CreatePocketSwitchArrowPair(): void { _nyi(5, 'CreatePocketSwitchArrowPair'); }
function PrepareTMHMMoveWindow(): void { _nyi(7, 'PrepareTMHMMoveWindow'); }
function BlendPalettesBag(): void { _nyi(9, 'BlendPalettes(PALETTES_ALL,16,0)'); }
function BeginNormalPaletteFadeBag(): void { _nyi(9, 'BeginNormalPaletteFade fade-in'); }

/** Sondes d'introspection déterministe (vérif étape 2, pas du gameplay). */
export function __bagMenuDebugState() {
  return {
    gBagMenu: gBagMenu ? {
      spriteIds: gBagMenu.spriteIds.length,
      windowIds: gBagMenu.windowIds.length,
      tilemap: gBagMenu.tilemapBuffer.length,
      pocketSwitchDisabled: gBagMenu.pocketSwitchDisabled,
    } : null,
    gBagPosition: { ...gBagPosition, cursorPosition: [...gBagPosition.cursorPosition] },
    consts: { ITEMMENUSPRITE_COUNT, ITEMWIN_COUNT, POCKETS_COUNT, NOT_SWAPPING },
  };
}
