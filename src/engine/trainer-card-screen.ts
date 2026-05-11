/**
 * trainer-card-screen.ts — Carte Dresseur 1:1 décomp `src/trainer_card.c`.
 *
 * Architecture : CB2 swap (= même pattern que bag-screen.ts). L'OW arrête de
 * tick pendant la carte (= pas de hacks save/restore VRAM/palettes). Le
 * retour à l'OW passe par `gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual`
 * set par `playerCardAction` (start-menu.ts).
 *
 * BG layout 1:1 décomp `sTrainerCardBgTemplates` (= pragmatic 3-layer simplifié) :
 *   - BG2 char=3 mapBase=29 priority=2 : bg.bin tilemap (= teal stripes background)
 *   - BG1 char=0 mapBase=30 priority=1 : front.bin tilemap (= card frame/lines overlay)
 *   - BG0 char=0 mapBase=31 priority=0 : windows text (= NOM/NºID/etc.)
 *   - OAM : trainer pic (Brendan/May 64×64) + 8 badges sprites
 *
 * Gender-aware (= 1:1 décomp DrawCardScreenBackground) :
 *   - MALE   : default `green.pal` background (= teal)
 *   - FEMALE : `female_bg.pal` (= pink)
 *   - Trainer pic : `brendan.4bpp.bin` / `may.4bpp.bin`
 *
 * Strings 1:1 décomp FR (= strings.json) :
 *   - gText_TrainerCardName     "NOM "
 *   - gText_TrainerCardIDNo     "NºID /"
 *   - gText_TrainerCardMoney    "ARGENT"
 *   - gText_PokeDollar          "¥"
 *   - gText_TrainerCardPokedex  "POKéDEX"
 *   - gText_TrainerCardTime     "DUREE JEU"
 *
 * Source de vérité décomp :
 *   - `src/trainer_card.c` (= structure générale + Print* + Draw* fns)
 *   - `graphics/trainer_card/` (= bg.bin, front.bin, tiles.png, badges.png, *.pal)
 *   - `strings.json` (FR locale)
 */

import {
  AddWindow, InitWindows, RemoveWindow, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, ShowBg, HideBg,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3, GetStringRightAlignXOffset, GetStringCenterAlignXOffset } from './gba-text-system';
import { gameState } from './game-state';
import { FlagGet } from './script-vars';
import { gSaveBlock2Ptr } from './gba-menu-system';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  BlendPalettes, ResetPaletteFade, ResetTasks, gMain,
} from './decomp-globals';
import { ResetSpriteData } from './decomp-bridge';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './option-menu-return';
import { FadeScreen, FADE_FROM_BLACK } from './fade-screen';
import { loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadTileBin } from './gba/png-loader';
import { getString } from './gba-strings';
import type { DecompTask } from './decomp-runtime';

const FONT_NORMAL = 1;
const TEXT_SKIP_DRAW = 255;
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;

/** BG layer config 1:1 décomp `sTrainerCardBgTemplates` (= trainer_card.c:193) :
 *    BG0 charBase=0 mapBase=27 priority=2 screenSize=2 → front.bin (cardTilemap)
 *    BG1 charBase=2 mapBase=29 priority=0 → text windows (paletteNum=15)
 *    BG2 charBase=0 mapBase=30 priority=3 → bg.bin (bgTilemap)
 *    BG3 charBase=0 mapBase=31 priority=1 baseTile=192 → trainer pic window
 *      Notre simplification : pas de BG3, on utilise OAM pour trainer pic + badges. */
const CARD_TILES_CHAR_BASE = 0;     // tiles.png raw 4bpp à charBase 0 (= shared BG0+BG2)
const CARD_WIN_CHAR_BASE = 2;       // text/frame tiles à charBase 2 (= BG1)
const CARD_FRONT_MAP_BASE = 27;     // BG0 = front.bin overlay (= card front)
const CARD_WIN_MAP_BASE = 29;       // BG1 = text windows
const CARD_BG_MAP_BASE = 30;        // BG2 = bg.bin background

/** OAM palette slots. */
const TRAINER_PIC_OBJ_PAL = 0;      // OBJ palette 0 = trainer pic colors
const BADGES_OBJ_PAL = 1;           // OBJ palette 1 = badges colors
/** OBJ VRAM offsets (= 4bpp byte offsets). */
const TRAINER_PIC_OBJ_OFFSET = 0;           // start of OBJ VRAM
const BADGES_OBJ_OFFSET = 64 * 32;          // after trainer pic (64 tiles × 32 bytes 4bpp)

/** 1:1 décomp `sTrainerCardTextColors` (trainer_card.c:283) :
 *    {TEXT_COLOR_TRANSPARENT, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY}
 *    = [0, 2, 3] (= bg transparent, fg dark gray, shadow light gray).
 *
 *  Le ROM NE FAIT PAS de différence MALE/FEMALE sur le texte de la carte.
 *  Mon erreur initiale (= COLOR_MALE blue / COLOR_FEMALE red) venait de la
 *  confusion avec ShowSaveInfoWindow qui DOES gender-color. Pour trainer
 *  card : 1:1 décomp = TOUS les textes en gray transparent. */
const COLOR_CARD_TEXT: [number, number, number] = [0, 2, 3];

/** Windows : 1:1 décomp `sTrainerCardWindowTemplates` (trainer_card.c:233) :
 *    WIN_CARD_TEXT : bg=1, (1, 1, 28, 18), paletteNum=15, baseBlock=0x1.
 *  bg=1 = BG1 charBase=2 — séparé des trainer card tiles (charBase=0). */
const WIN_CARD_TEXT_TEMPLATE: WindowTemplate = {
  bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 28, height: 18,
  paletteNum: 15, baseBlock: 0x1,
};

/** Assets type. */
interface TrainerCardAssets {
  bgTiles: Uint8Array;          // tiles.png raw 4bpp data
  bgTilemap: Uint16Array;       // bg.bin
  frontTilemap: Uint16Array;    // front.bin (= card front layout)
  backTilemap: Uint16Array;     // back.bin (= card back layout for flip)
  bgPalette: Uint16Array;       // green.pal (48 entries = pal 0+1+2)
  femaleBgPalette: Uint16Array; // female_bg.pal (16 entries = overwrites pal 1)
  starPalette: Uint16Array;     // star.pal (16 entries = pal 4)
  trainerPicRaw4bpp: Uint8Array;// brendan.4bpp.bin or may.4bpp.bin
  trainerPicPal: Uint16Array;   // brendan or may PNG palette
  badgesGfx: Uint8Array;        // badges.png raw 4bpp
  badgesPal: Uint16Array;       // badges.png palette
}

let _isOpen = false;
let _phase: 'idle' | 'fading_in' | 'open' | 'fading_out' = 'idle';
/** Current card side : 'front' (= default) ou 'back'. Toggle via A press. */
let _cardSide: 'front' | 'back' = 'front';
/** Flip animation in progress (= input disabled jusqu'à fade-in-back/front complete). */
let _flipping = false;
let _assets: TrainerCardAssets | null = null;
let _assetsLoading: Promise<TrainerCardAssets> | null = null;
let _wid = -1;
let _trainerPicOamId = -1;
let _badgeOamIds: number[] = [];
let _cardInputTaskId = -1;
let _graphicsReady = false;
let _graphicsLoading = false;
let _textWindowsReady = false;
let _textWindowsLoading = false;

/** Async fetch tous les assets nécessaires. Cache via `_assets` singleton. */
async function _loadAssets(): Promise<TrainerCardAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const gender = gameState.gender === 'FEMALE' ? 'female' : 'male';
    const trainerName = gender === 'female' ? 'may' : 'brendan';
    // 1:1 décomp LoadCardGfx + LoadPalette pour 0-stars Hoenn :
    //   - green.pal (48 entries) → BG_PLTT_ID(0) fill palettes 0+1+2
    //   - female_bg.pal (16 entries) → BG_PLTT_ID(1) overwrite si FEMALE
    //   - star.pal (16 entries) → BG_PLTT_ID(4) pour stars achievement
    const [bgTilesRaw, bgTilemapBin, frontTilemapBin, backTilemapBin,
           bgPalette, femaleBgPalette, starPalette,
           trainerPicRaw, trainerPic, badgesRaw, badgesImg] = await Promise.all([
      loadTileBin('/decomp/em/trainer_card/tiles.png', 4),
      loadTilemapBin('/decomp/em/trainer_card/bg.bin'),
      loadTilemapBin('/decomp/em/trainer_card/front.bin'),
      loadTilemapBin('/decomp/em/trainer_card/back.bin'),
      loadGbaPal('/decomp/em/trainer_card/green.pal'),
      loadGbaPal('/decomp/em/trainer_card/female_bg.pal'),
      loadGbaPal('/decomp/em/trainer_card/star.pal'),
      loadTileBin(`/decomp/em/trainer_pics/${trainerName}.png`, 4),
      loadIndexedPngStrict(`/decomp/em/trainer_pics/${trainerName}.png`, 4),
      loadTileBin('/decomp/em/trainer_card/badges.png', 4),
      loadIndexedPngStrict('/decomp/em/trainer_card/badges.png', 4),
    ]);
    void gender;
    _assets = {
      bgTiles: bgTilesRaw,
      bgTilemap: bgTilemapBin,
      frontTilemap: frontTilemapBin,
      backTilemap: backTilemapBin,
      bgPalette,
      femaleBgPalette,
      starPalette,
      trainerPicRaw4bpp: trainerPicRaw,
      trainerPicPal: trainerPic.palette,
      badgesGfx: badgesRaw,
      badgesPal: badgesImg.palette,
    };
    return _assets;
  })();
  return _assetsLoading;
}

/** 1:1 décomp `InitBgsAndWindows` + `ResetVramOamAndBgCntRegs` :
 *  Setup BG2/BG1/BG0 templates + clear VRAM/OAM/PLTT. */
function _initCardBgs(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  // ResetVramOamAndBgCntRegs (menu_helpers.c:94).
  rt.SetGpuReg(0x00, 0); // DISPCNT
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
  // Direct PLTT RAM clear (= bypass bufferTransferDisabled, sinon OW palettes leak).
  for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
  // 1:1 décomp `sTrainerCardBgTemplates` (trainer_card.c:193) :
  //   BG0 charBase=0 mapBase=27 priority=2 screenSize=2 (= front.bin)
  //   BG1 charBase=2 mapBase=29 priority=0 (= text windows)
  //   BG2 charBase=0 mapBase=30 priority=3 (= bg.bin background)
  //   BG3 hidden (= notre simplification, on use OAM pour trainer pic).
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = CARD_TILES_CHAR_BASE; bg0c.mapBaseIndex = CARD_FRONT_MAP_BASE;
  bg0c.screenSize = 0;  // 1:1 décomp screenSize=2 (64×32) MAIS bg.bin/front.bin
                        // contiennent juste 30×20 entries → screenSize=0 (32×32) suffit
                        // (rest = tile 0 transparent). Notre engine ne supporte pas screen sizes > 0 cleanly.
  bg0c.paletteMode = 0; bg0c.priority = 2; bg0c.visible = true;
  bg0c.hofs = 0; bg0c.vofs = 0;
  const bg1c = rt.gba.bg(1).config;
  bg1c.charBaseIndex = CARD_WIN_CHAR_BASE; bg1c.mapBaseIndex = CARD_WIN_MAP_BASE;
  bg1c.screenSize = 0;
  bg1c.paletteMode = 0; bg1c.priority = 0; bg1c.visible = true;
  bg1c.hofs = 0; bg1c.vofs = 0;
  const bg2c = rt.gba.bg(2).config;
  bg2c.charBaseIndex = CARD_TILES_CHAR_BASE; bg2c.mapBaseIndex = CARD_BG_MAP_BASE;
  bg2c.screenSize = 0; bg2c.paletteMode = 0; bg2c.priority = 3; bg2c.visible = true;
  bg2c.hofs = 0; bg2c.vofs = 0;
  rt.gba.bg(3).config.visible = false;
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0);
  // DISPCNT: OBJ_ON | OBJ_1D_MAP | BG0/1/2.
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400);
  rt.SetGpuReg(0x50, 0); // BLDCNT
  ShowBg(0); ShowBg(1); ShowBg(2); HideBg(3);
}

/** Async load card tiles + tilemaps + palettes. */
function _loadCardGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
  if (!rt) return false;
  if (_graphicsReady) return true;
  if (_graphicsLoading) return false;
  _graphicsLoading = true;
  void _loadAssets().then((assets) => {
    const r = getRuntime();
    if (!r) { _graphicsLoading = false; return; }
    // 1:1 décomp `LoadBgTiles(0, sData->cardTiles, 0x1800, 0)` (trainer_card.c:1429) :
    //   charBase=0 → VRAM offset 0*0x4000 = 0x0000. Load 0x1800 bytes = 192 tiles.
    const charOff = CARD_TILES_CHAR_BASE * 0x4000;
    r.gba.vram.set(assets.bgTiles, charOff);
    // 1:1 décomp `DrawCardScreenBackground` + `DrawCardFrontOrBack`
    // (trainer_card.c:1463-1497) : REMAPPE 30×20 source → 32×32 dest avec
    // padding `ptr[0]` aux colonnes 30-31. CRITIQUE : direct vram.set des
    // 1200 bytes flat traite row pitch comme 32 → tilemap garbled.
    //   for (i = 0..19) for (j = 0..31) :
    //     dst[32*i+j] = (j<30) ? ptr[30*i+j] : ptr[0];
    const bgMapOff = CARD_BG_MAP_BASE * 0x800;
    const frontMapOff = CARD_FRONT_MAP_BASE * 0x800;
    const bgDst = new Uint16Array(r.gba.vram.buffer, bgMapOff, 32 * 32);
    const frontDst = new Uint16Array(r.gba.vram.buffer, frontMapOff, 32 * 32);
    const bgSrc = assets.bgTilemap;
    const frontSrc = assets.frontTilemap;
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 32; j++) {
        bgDst[32 * i + j]    = (j < 30) ? bgSrc[30 * i + j]    : bgSrc[0];
        frontDst[32 * i + j] = (j < 30) ? frontSrc[30 * i + j] : frontSrc[0];
      }
    }
    // 1:1 décomp LoadPalette sequence (trainer_card.c:1434-1442) :
    //   green.pal (48 entries) → BG_PLTT_ID(0) fills palette 0+1+2.
    LoadPalette(assets.bgPalette, 0, assets.bgPalette.length * 2);
    //   badgesImg.palette → BG_PLTT_ID(3) (= 16 entries pour badges tiles).
    LoadPalette(assets.badgesPal, 3 * 16, 32);
    //   star.pal → BG_PLTT_ID(4) (= achievement stars).
    LoadPalette(assets.starPalette, 4 * 16, 32);
    //   FEMALE : overwrite palette 1 avec female_bg.pal (= pink theme).
    const isFemale = gameState.gender === 'FEMALE';
    if (isFemale) {
      LoadPalette(assets.femaleBgPalette, 1 * 16, 32);
    }
    // Load trainer pic raw 4bpp → OBJ VRAM offset 0.
    r.gba.objVram.set(assets.trainerPicRaw4bpp, TRAINER_PIC_OBJ_OFFSET);
    // Load trainer pic palette → OBJ palette 0.
    r.LoadPaletteObj(assets.trainerPicPal, OBJ_PLTT_ID(TRAINER_PIC_OBJ_PAL));
    // Load badges raw 4bpp → OBJ VRAM offset after trainer pic.
    r.gba.objVram.set(assets.badgesGfx, BADGES_OBJ_OFFSET);
    r.LoadPaletteObj(assets.badgesPal, OBJ_PLTT_ID(BADGES_OBJ_PAL));
    _graphicsReady = true;
    _graphicsLoading = false;
  }).catch((e) => {
    console.error('[trainer-card] graphics load failed:', e);
    _graphicsLoading = false;
  });
  return false;
}

/** 1:1 décomp `LoadCardGfx` + InitWindows. */
async function _loadCardTextWindowsCb2(rt: ReturnType<typeof getRuntime>): Promise<void> {
  if (!rt) return;
  const ids = InitWindows([WIN_CARD_TEXT_TEMPLATE]);
  _wid = ids[0];
  // 1:1 décomp std frame palette (= cyan border tiles à palette 14).
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  // Load gStandardMenuPalette à BG_PLTT_ID(15) pour le text rendering.
  const stdMenuPal = await loadGbaPal('/decomp/em/interface/std_menu.pal');
  LoadPalette(stdMenuPal, 15 * 16, 32);
  // Initial fill transparent.
  FillWindowPixelBuffer(_wid, 0x00);
  PutWindowTilemap(_wid);
}

/** 1:1 décomp `BufferTrainerCardData` : compose le contenu depuis gSaveBlock2Ptr. */
function _bufferCardData(): {
  name: string; trainerId: number; money: number;
  caughtMonsCount: number; hours: number; minutes: number;
  badges: number; hasDex: boolean; isFemale: boolean;
} {
  const sb2 = (gSaveBlock2Ptr ?? {}) as {
    playTimeHours?: number; playTimeMinutes?: number;
    playerTrainerId?: number[]; playerName?: string;
    playerGender?: number;
  };
  const name = sb2.playerName || gameState.playerName || 'PLAYER';
  const tidArr = sb2.playerTrainerId ?? [0, 0, 0, 0];
  const trainerId = ((tidArr[1] ?? 0) << 8) | (tidArr[0] ?? 0);
  const money = (gameState as unknown as { money?: number }).money ?? 0;
  const allFlags = (gameState as unknown as { getAllFlagNames?: () => string[] })
    .getAllFlagNames?.() ?? [];
  let caughtMonsCount = 0;
  for (const f of allFlags) {
    if (f.endsWith('_CAUGHT')) caughtMonsCount++;
  }
  let hours = sb2.playTimeHours ?? 0;
  let minutes = sb2.playTimeMinutes ?? 0;
  if (hours > 999) hours = 999;
  if (minutes > 59) minutes = 59;
  let badges = 0;
  for (let i = 1; i <= 8; i++) {
    if (FlagGet(`FLAG_BADGE0${i}_GET`)) badges++;
  }
  const hasDex = FlagGet('FLAG_SYS_POKEDEX_GET');
  const isFemale = (sb2.playerGender === 1) || gameState.gender === 'FEMALE';
  return { name, trainerId, money, caughtMonsCount, hours, minutes, badges, hasDex, isFemale };
}

/** 1:1 décomp `PrintAllOnCardFront` : render text dans WIN_CARD_TEXT. */
function _drawCardFront(): void {
  if (_wid < 0) return;
  FillWindowPixelBuffer(_wid, 0x00);
  const d = _bufferCardData();
  // 1:1 décomp : pas de gender color, tout en gray transparent.
  void d.isFemale;
  // 1:1 décomp `PrintNameOnCardFront` (trainer_card.c:1003-1013) :
  //   StringCopy(buffer, gText_TrainerCardName);    // "NOM "
  //   StringCopy(txtPtr, sData->trainerCard.playerName);
  //   AddTextPrinterParameterized3(WIN_CARD_TEXT, FONT_NORMAL, 16, 33, ...)
  // Tout dans UN SEUL buffer → name suit "NOM " immédiatement.
  const nomLabel = getString('gText_TrainerCardName') || 'NOM ';
  const nomBuffer = `${nomLabel}${d.name}`;
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, 33, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, nomBuffer);
  // 1:1 décomp `PrintIdOnCard` (trainer_card.c:1029) :
  //   xPos = GetStringCenterAlignXOffset(FONT_NORMAL, buffer, 96) + 120;
  //   top = 9;
  // Center le buffer dans une zone 96px starting at x=120.
  const idLabel = getString('gText_TrainerCardIDNo') || 'NºID /';
  const idStr = `${idLabel}${String(d.trainerId).padStart(5, '0')}`;
  const idX = GetStringCenterAlignXOffset(idStr, 96) + 120;
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, idX, 9, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, idStr);
  // ARGENT + ¥money à (16, 57), value right-align x=128.
  const moneyLabel = getString('gText_TrainerCardMoney') || 'ARGENT';
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, 57, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, moneyLabel);
  const moneySymbol = getString('gText_PokeDollar') || '¥';
  const moneyStr = `${moneySymbol}${d.money}`;
  const moneyX = GetStringRightAlignXOffset(moneyStr, 128);
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, moneyX, 57, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, moneyStr);
  // POKéDEX + count à (16, 73), value right-align x=128 (si dex enabled).
  if (d.hasDex) {
    const dexLabel = getString('gText_TrainerCardPokedex') || 'POKéDEX';
    AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, 73, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, dexLabel);
    const dexStr = String(d.caughtMonsCount);
    const dexX = GetStringRightAlignXOffset(dexStr, 128);
    AddTextPrinterParameterized3(_wid, FONT_NORMAL, dexX, 73, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, dexStr);
  }
  // DUREE JEU + HH:MM à (16, 89), value right-align x=128.
  const timeLabel = getString('gText_TrainerCardTime') || 'DUREE JEU';
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, 89, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, timeLabel);
  const timeStr = `${d.hours}:${String(d.minutes).padStart(2, '0')}`;
  const timeX = GetStringRightAlignXOffset(timeStr, 128);
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, timeX, 89, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, timeStr);
  CopyWindowToVram(_wid, 3);
}

/** 1:1 décomp `PrintAllOnCardBack` flow (trainer_card.c:405) :
 *    case 0: PrintNameOnCardBack();         // player name top-right
 *    case 1: PrintHofDebutTimeOnCard();     // si hasHofResult
 *    case 2: PrintLinkBattleResultsOnCard;  // si hasLinkResults
 *    case 3: PrintTradesStringOnCard();     // si hasTrades
 *    case 4-7: BerryCrush/Pokeblock/Union/Contest/PokemonIcons/BattleFacility/Stickers
 *
 *  Pour MVP carte dresseur new-game : hasHofResult/hasLinkResults/hasTrades
 *  = FALSE (= flags pas set). Back card affiche juste player name + stats
 *  placeholders (= "0 ECHANGES", "0 COMBATS LIEN") pour visual completeness.
 *
 *  1:1 décomp `PrintNameOnCardBack` (line 1175) :
 *    AddTextPrinterParameterized3(WIN_CARD_TEXT, FONT_NORMAL,
 *        GetStringRightAlignXOffset(FONT_NORMAL, playerName, 216), 9, ...)
 *  = player name right-aligned a x=216, y=9.
 *
 *  1:1 décomp `PrintStatOnBackOfCard` (line 1196) :
 *    AddTextPrinterParameterized3(WIN_CARD_TEXT, FONT_NORMAL, 16, top*16+33,
 *        sTrainerCardTextColors, TEXT_SKIP_DRAW, statName);
 *    AddTextPrinterParameterized3(WIN_CARD_TEXT, FONT_NORMAL,
 *        GetStringRightAlignXOffset(FONT_NORMAL, stat, 216), top*16+33, ...);
 *  = label a x=16, value right-aligned a x=216, y=top*16+33.
 */
function _drawCardBack(): void {
  if (_wid < 0) return;
  FillWindowPixelBuffer(_wid, 0x00);
  const d = _bufferCardData();
  // 1:1 décomp `BufferNameForCardBack` (trainer_card.c:1164) :
  //   StringCopy(gStringVar1, playerName);
  //   StringExpandPlaceholders(textPlayersCard, gText_Var1sTrainerCard);
  //   gText_Var1sTrainerCard FR = "CARTE DE DRESSEUR de {STR_VAR_1}"
  //
  // Puis `PrintNameOnCardBack` (line 1180) Hoenn variant :
  //   right-aligned a x=216, y=9.
  const headerStr = `CARTE DE DRESSEUR de ${d.name}`;
  const headerX = GetStringRightAlignXOffset(headerStr, 216);
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, headerX, 9, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, headerStr);
  // 1:1 décomp `PrintAllOnCardBack` (trainer_card.c:405) : chaque stat est
  // gated par un `hasXResult` flag. Si flag=false → SKIP le print (= ligne
  // empty du tilemap back.bin reste visible, sans label/value).
  //
  // Pour MVP : flags computed depuis save data minimal. Toutes false pour
  // new game → back affiche juste le header. Match 1:1 ROM screenshot user.
  //
  // Future : wire les vrais flags depuis gSaveBlock2Ptr.gameStats + HOF data :
  //   hasHofResult    : FLAG_SYS_GAME_CLEAR || gSaveBlock2Ptr.linkBattles*
  //   hasLinkResults  : (linkBattleWins + linkBattleLosses) > 0
  //   hasTrades       : gameStats[GAME_STAT_POKEMON_TRADES] > 0
  //   hasContestResult: gameStats[GAME_STAT_ENTERED_CONTEST] > 0
  //   hasBattleTowerResult : gSaveBlock2Ptr.frontier.battleTowerWins > 0
  const stats: Array<{ has: boolean, label: string, value: string }> = [
    { has: false, label: 'PANTHEON Nº 1', value: '----' },
    { has: false, label: 'COMBATS LIEN', value: '0 V / 0 D' },
    { has: false, label: 'ECHANGES', value: '0' },
    { has: false, label: 'CONCOURS', value: '0' },
    { has: false, label: 'TOUR BATTLE', value: '0 V' },
  ];
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    if (!stat.has) continue;  // 1:1 décomp : skip si flag false
    const y = i * 16 + 33;
    AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, y, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, stat.label);
    const valueX = GetStringRightAlignXOffset(stat.value, 216);
    AddTextPrinterParameterized3(_wid, FONT_NORMAL, valueX, y, COLOR_CARD_TEXT, TEXT_SKIP_DRAW, stat.value);
  }
  CopyWindowToVram(_wid, 3);
}

/** Swap BG0 tilemap entre front.bin et back.bin avec remap 30×20 → 32×32.
 *  1:1 décomp DrawCardFrontOrBack (trainer_card.c:1481). */
function _swapCardSide(toSide: 'front' | 'back'): void {
  const rt = getRuntime();
  if (!rt || !_assets) return;
  const frontMapOff = CARD_FRONT_MAP_BASE * 0x800;
  const dst = new Uint16Array(rt.gba.vram.buffer, frontMapOff, 32 * 32);
  const src = toSide === 'front' ? _assets.frontTilemap : _assets.backTilemap;
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 32; j++) {
      dst[32 * i + j] = (j < 30) ? src[30 * i + j] : src[0];
    }
  }
}

/** Show/hide trainer pic + badges OAM (= visible front uniquement). */
function _setOamVisibility(visible: boolean): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_trainerPicOamId >= 0) {
    const spr = rt.gSprites.get(_trainerPicOamId);
    if (spr) spr.invisible = !visible;
  }
  for (const id of _badgeOamIds) {
    const spr = rt.gSprites.get(id);
    if (spr) spr.invisible = !visible;
  }
}

/** Spawn trainer pic OAM 64×64 à droite-haut (= 1:1 décomp CreateTrainerCardTrainerPic). */
function _spawnTrainerPicOam(assets: TrainerCardAssets): void {
  const rt = getRuntime();
  if (!rt) return;
  void assets;
  // 1:1 décomp `CreateTrainerCardTrainerPic` (trainer_card.c:1882) appelle
  // `CreateTrainerCardTrainerPicSprite(picIdx, isFrontPic=TRUE, destX, destY, palSlot=8, WIN_TRAINER_PIC)`
  // qui internement appelle `BlitBitmapRectToWindow(WIN_TRAINER_PIC, framePics,
  // 0, 0, 64, 64, destX, destY, 64, 64)` (trainer_pokemon_sprites.c:331).
  //
  //   sTrainerPicOffset[Hoenn][MALE/FEMALE] = (1, 0) — c'est PIXEL offset,
  //     pas tile offset (= u8 dest x/y dans BlitBitmapRectToWindow).
  //   WIN_TRAINER_PIC origin (= 19*8, 5*8) = (152, 40).
  //   Sprite pixel top-left = window origin + offset = (152+1, 40+0) = (153, 40).
  //   OAM center (= CalcCenterToCornerVec square 64×64 = -32/-32) = (185, 72).
  //
  // Mon erreur précédente : avais interprété (1, 0) comme TILE offset → 8px
  // pixel trop à droite. Fix : (1, 0) = pixel offset direct.
  const trainerSpr = rt.CreateSpriteAtOam({
    x: 185, y: 72,
    shape: 0, size: 3,       // 64×64
    tileId: TRAINER_PIC_OBJ_OFFSET / 32,
    paletteBank: TRAINER_PIC_OBJ_PAL,
    priority: 0,
  });
  _trainerPicOamId = trainerSpr.spriteId;
}

/** Spawn 8 badge OAM 32×32 à la rangée du bas. Visible only si badge flag set. */
function _spawnBadgesOam(assets: TrainerCardAssets): void {
  const rt = getRuntime();
  if (!rt) return;
  void assets;
  const d = _bufferCardData();
  _badgeOamIds = [];
  // Badge tiles : 8 badges × 4 tiles each (32×32 = 4 tiles 8×8 in 4bpp).
  // Layout from badges.png : 8 badges in a row, 32×32 each.
  // OBJ VRAM offset BADGES_OBJ_OFFSET, tile = offset / 32 bytes per tile.
  const baseTile = BADGES_OBJ_OFFSET / 32;
  const TILES_PER_BADGE = 16;  // 32×32 = 16 tiles 8×8 in 4bpp (= 4 wide × 4 tall)
  // Position : 8 slots horizontaux y=132, x espacé 32px from x=8.
  for (let i = 0; i < 8; i++) {
    if (i >= d.badges) continue;  // only show earned badges
    const badgeSpr = rt.CreateSpriteAtOam({
      x: 24 + i * 28, y: 132,
      shape: 0, size: 2,         // 32×32
      tileId: baseTile + i * TILES_PER_BADGE,
      paletteBank: BADGES_OBJ_PAL,
      priority: 0,
    });
    _badgeOamIds.push(badgeSpr.spriteId);
  }
}

function _freeTrainerCard(): void {
  const rt = getRuntime();
  if (_trainerPicOamId >= 0 && rt) {
    const spr = rt.gSprites.get(_trainerPicOamId);
    if (spr) { spr.inUse = false; const oam = rt.gba.oam[spr.oamIndex]; if (oam) oam.visible = false; }
    rt.gSprites.delete(_trainerPicOamId);
  }
  _trainerPicOamId = -1;
  for (const id of _badgeOamIds) {
    if (rt) {
      const spr = rt.gSprites.get(id);
      if (spr) { spr.inUse = false; const oam = rt.gba.oam[spr.oamIndex]; if (oam) oam.visible = false; }
      rt.gSprites.delete(id);
    }
  }
  _badgeOamIds = [];
  if (_wid >= 0) { RemoveWindow(_wid); _wid = -1; }
  _isOpen = false;
  _phase = 'idle';
  _cardSide = 'front';
  _flipping = false;
  _graphicsReady = false;
  _graphicsLoading = false;
  _textWindowsReady = false;
  _textWindowsLoading = false;
}

/** 1:1 décomp Task_FadeAndCloseTrainerCard (= équivalent Task_FadeAndCloseBagMenu). */
function Task_FadeAndCloseTrainerCard(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  FadeScreen(1 /* FADE_TO_BLACK */, 0);
  task.func = Task_CloseTrainerCard;
}

function Task_CloseTrainerCard(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _freeTrainerCard();
  const exitCb = rt.gMain.savedCallback;
  if (exitCb) rt.SetMainCallback2(exitCb);
  else rt.SetMainCallback2(null);
  rt.DestroyTask(task.taskId);
  _cardInputTaskId = -1;
}

/** 1:1 décomp `Task_DoCardFlipTask` (trainer_card.c:1602) — simplified via
 *  BeginNormalPaletteFade au lieu du scanline HBlank effect 3D rotate.
 *
 *  Pipeline :
 *    state 0 : FadeScreen(FADE_TO_BLACK, -2) (= fast fade, ~8 frames)
 *    state 1 : wait fade-out done → swap tilemap + redraw text + toggle OAM
 *    state 2 : FadeScreen(FADE_FROM_BLACK, -2) (= fast fade-in)
 *    state 3 : wait fade-in done → set _flipping=false, _cardSide flipped */
function Task_FlipCard(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  const tState = task.data?.[0] ?? 0;
  const tTargetSide = (task.data?.[1] ?? 0) ? 'back' : 'front';
  switch (tState) {
    case 0:
      // Start fast fade-to-black (delay=-2 → deltaY=4 → ~8 frames).
      rt.BeginNormalPaletteFade(0xFFFFFFFF, -2, 0, 16, 0 /* RGB_BLACK */);
      if (task.data) task.data[0] = 1;
      break;
    case 1:
      if (rt.gPaletteFade.active) return;  // wait fade done
      // Swap tilemap + redraw text + show/hide OAM.
      _swapCardSide(tTargetSide);
      if (tTargetSide === 'back') {
        _drawCardBack();
        _setOamVisibility(false);
      } else {
        _drawCardFront();
        _setOamVisibility(true);
      }
      _cardSide = tTargetSide;
      if (task.data) task.data[0] = 2;
      break;
    case 2:
      // Start fast fade-from-black.
      rt.BeginNormalPaletteFade(0xFFFFFFFF, -2, 16, 0, 0 /* RGB_BLACK */);
      if (task.data) task.data[0] = 3;
      break;
    case 3:
      if (rt.gPaletteFade.active) return;
      _flipping = false;
      rt.DestroyTask(task.taskId);
      break;
  }
}

/** 1:1 décomp `Task_TrainerCardMain` input flow (trainer_card.c:446-501) :
 *
 *  STATE_HANDLE_INPUT_FRONT :
 *    A → FlipTrainerCard + SE_RG_CARD_FLIP → STATE_WAIT_FLIP_TO_BACK
 *    B → BeginNormalPaletteFade ALL → STATE_CLOSE_CARD (= exit)
 *
 *  STATE_HANDLE_INPUT_BACK :
 *    A → BeginNormalPaletteFade ALL → STATE_CLOSE_CARD (= exit)
 *    B → FlipTrainerCard + SE_RG_CARD_FLIP → STATE_WAIT_FLIP_TO_FRONT */
function Task_TrainerCard_HandleInput(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_phase !== 'open') return;
  if (_flipping) return;  // input disabled pendant flip animation
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002, KEY_START = 0x0008;
  if (_cardSide === 'front') {
    if (newKeys & KEY_A) {
      // A on front → flip to back.
      PlaySE(5);  // SE_RG_CARD_FLIP (= 1:1 décomp PlaySE après FlipTrainerCard)
      _flipping = true;
      const task = rt.CreateTask(Task_FlipCard, 0);
      const t = rt.gTasks.get(task);
      if (t?.data) { t.data[0] = 0; t.data[1] = 1 /* target = back */; }
      return;
    }
    if (newKeys & (KEY_B | KEY_START)) {
      PlaySE(5);
      CloseTrainerCardScreen();
    }
  } else {
    // _cardSide === 'back'
    if (newKeys & KEY_B) {
      // B on back → flip to front.
      PlaySE(5);
      _flipping = true;
      const task = rt.CreateTask(Task_FlipCard, 0);
      const t = rt.gTasks.get(task);
      if (t?.data) { t.data[0] = 0; t.data[1] = 0 /* target = front */; }
      return;
    }
    if (newKeys & (KEY_A | KEY_START)) {
      PlaySE(5);
      CloseTrainerCardScreen();
    }
  }
}

export function VBlankCB_TrainerCardRun(): void { /* transferts auto via runtime */ }

/** MainCB2_TrainerCardRun : just runs tasks, fade, sprite anim per frame. */
export function MainCB2_TrainerCardRun(): void {
  const rt = getRuntime();
  if (!rt) return;
  // Tasks + sprites + palette fade tick via runtime auto loop.
  void rt;
}

/** 1:1 décomp CB2_InitTrainerCard state machine. */
export function CB2_InitTrainerCard(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0:
      rt.SetVBlankCallback(null);
      rt.gMain.state++;
      break;
    case 1: rt.gMain.state++; break;
    case 2: rt.gMain.state++; break;
    case 3:
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++;
      break;
    case 4:
      ResetSpriteData();
      rt.gMain.state++;
      break;
    case 5: rt.gMain.state++; break;
    case 6:
      ResetTasks();
      rt.gMain.state++;
      break;
    case 7:
      _initCardBgs(rt);
      _graphicsReady = false;
      _graphicsLoading = false;
      _textWindowsReady = false;
      _textWindowsLoading = false;
      rt.gMain.state++;
      break;
    case 8:
      if (!_loadCardGraphicsCb2(rt)) break;
      rt.gMain.state++;
      break;
    case 9:
      if (!_textWindowsReady) {
        if (!_textWindowsLoading) {
          _textWindowsLoading = true;
          void _loadCardTextWindowsCb2(rt).then(() => {
            _textWindowsReady = true;
            _textWindowsLoading = false;
          });
        }
        break;
      }
      rt.gMain.state++;
      break;
    case 10:
      _phase = 'fading_in';
      rt.gMain.state++;
      break;
    case 11:
      // Draw text content.
      _drawCardFront();
      rt.gMain.state++;
      break;
    case 12:
      _cardInputTaskId = rt.CreateTask(Task_TrainerCard_HandleInput, 0);
      rt.gMain.state++;
      break;
    case 13:
      if (_assets) _spawnTrainerPicOam(_assets);
      rt.gMain.state++;
      break;
    case 14:
      if (_assets) _spawnBadgesOam(_assets);
      rt.gMain.state++;
      break;
    case 15: rt.gMain.state++; break;
    case 16: rt.gMain.state++; break;
    case 17: rt.gMain.state++; break;
    case 18: rt.gMain.state++; break;
    case 19:
      // Blacken all palettes before fade in.
      BlendPalettes(0xFFFFFFFF, 16, 0);
      rt.gMain.state++;
      break;
    case 20:
      // Fade IN from BLACK.
      FadeScreen(FADE_FROM_BLACK, 0);
      rt.gPaletteFade.bufferTransferDisabled = false;
      PlaySE(6);
      rt.gMain.state++;
      break;
    default:
      rt.SetVBlankCallback(VBlankCB_TrainerCardRun);
      rt.SetMainCallback2(MainCB2_TrainerCardRun);
      _isOpen = true;
      _phase = 'open';
      return;
  }
}

export function IsTrainerCardScreenOpen(): boolean {
  return _isOpen;
}

/** Open trainer card : preload assets puis CB2 swap. Le start-menu set
 *  gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual avant call. */
export function OpenTrainerCardScreen(_onCloseLegacy?: () => void): void {
  if (_isOpen) return;
  void _onCloseLegacy;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
    rt.SetMainCallback2(CB2_InitTrainerCard);
  }).catch((e) => {
    console.error('[trainer-card] preload failed', e);
  });
}

/** Close trainer card : create fade-out task, CB2 swap happens at fade end. */
export function CloseTrainerCardScreen(): void {
  if (!_isOpen || _phase === 'fading_out') return;
  _phase = 'fading_out';
  const rt = getRuntime();
  if (!rt) return;
  if (_cardInputTaskId >= 0) {
    rt.DestroyTask(_cardInputTaskId);
    _cardInputTaskId = -1;
  }
  rt.CreateTask(Task_FadeAndCloseTrainerCard, 0);
}

/** TickTrainerCardScreen : kept for backward-compat avec start-menu sub-state
 *  dispatch (= 'trainer_card_screen'). Avec CB2 swap, ce tick n'est jamais
 *  appelé (= MainCB2_TrainerCardRun take over). Stub safety. */
export function TickTrainerCardScreen(_newKeys: number): void {
  void _newKeys;
}

// Expose pour cross-module reference (= 1:1 décomp scope C visibility).
{
  const _g: Record<string, unknown> = {
    CB2_InitTrainerCard, MainCB2_TrainerCardRun, VBlankCB_TrainerCardRun,
    Task_FadeAndCloseTrainerCard, Task_CloseTrainerCard,
    Task_FlipCard,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
