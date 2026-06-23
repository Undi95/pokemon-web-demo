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

import { FreeAllSpritePalettes } from '../harness/runtime/decomp-globals';
import {
  AddWindow, InitWindows, RemoveWindow, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, ShowBg, HideBg,
  type WindowTemplate,
} from './engine/ui/gba-window-system';
import { LoadUserWindowBorderGfx } from './text_window';
import { AddTextPrinterParameterized3, GetStringRightAlignXOffset, GetStringCenterAlignXOffset } from './engine/ui/gba-text-system';
import { FlagGet } from './engine/script/script-vars';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { gSaveBlock2Ptr } from './engine/ui/gba-menu-system';
import { FEMALE } from '../harness/runtime/decomp-globals';
import { LoadSpriteSheet, LoadSpritePalette, ResetSpriteData } from './sprite';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  BlendPalettes, ResetPaletteFade, ResetTasks, gMain,
} from '../harness/runtime/decomp-globals';

import { CB2_ReturnToFieldWithOpenMenu_Manual } from './engine/ui/option-menu-return';
import { FadeScreen, FADE_FROM_BLACK } from './engine/system/fade-screen';
import { loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadTileBin } from '../harness/gba/png-loader';
import { getString } from './engine/ui/gba-strings';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

// FONT_NORMAL = text.h enum local (= pas extrait decomp-data).
const FONT_NORMAL = 1;
// 1:1 strict A8 audit : import depuis decomp-data.
import { TEXT_SKIP_DRAW } from './engine/decomp-data/include/text-data';
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

/** 1:1 STRICT décomp `LoadCompressedSpriteSheet` + `LoadSpritePalette`. Tag
 *  system honore gReservedSpriteTileCount → alloué STRICTEMENT après player. */
const TAG_TRAINER_PIC_GFX = 'TRAINER_PIC_GFX';
const TAG_TRAINER_PIC_PAL = 'TRAINER_PIC_PAL';
const TAG_BADGES_GFX = 'TRAINER_CARD_BADGES_GFX';
const TAG_BADGES_PAL = 'TRAINER_CARD_BADGES_PAL';
/** Module-level vars : tileStart + palSlot dynamiquement alloués par
 *  LoadSpriteSheet/LoadSpritePalette. Avant : offsets hardcoded 0 + 64*32
 *  → écrasait player tiles (= within [0, 4608) reserved zone). */
let _trainerPicTileStart = -1;
let _trainerPicPalSlot = -1;
let _badgesTileStart = -1;
let _badgesPalSlot = -1;

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
/** Flip animation in progress (= input disabled jusqu'à animation complete). */
let _flipping = false;
/** Flip state machine pour Task_DoCardFlipTask (= 1:1 décomp 6-step pipeline) :
 *  0=begin, 1=animate_down, 2=draw_flipped, 3=set_flipped, 4=animate_up, 5=end. */
let _flipState = 0;
/** Current squash progress (= cardTop pixel offset, 0=no squash, 77=fully squashed). */
let _flipCardTop = 0;
/** Direction du flip pendant l'animation : 'to_back' ou 'to_front'. */
let _flipTargetSide: 'front' | 'back' = 'back';
/** Buffer scanline offsets (= 1:1 décomp gScanlineEffectRegBuffers[0][160]).
 *  Int16Array car les offsets peuvent être négatifs (= scanlines au-dessus
 *  de la carte affichent un offset négatif pour hide). */
const _flipScanlineBuf = new Int16Array(256);
/** CARD_FLIP_Y = DISPLAY_HEIGHT/2 - 3 = 77. Half-screen squash threshold
 *  (= décomp comment "Cannot be DISPLAY_HEIGHT/2, or cardHeight will be 0"). */
const CARD_FLIP_Y = 77;
/** Step per frame pendant l'animation squash/unsquash (= décomp `tCardTop += 7`). */
const CARD_FLIP_STEP = 7;
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
    const gender = gSaveBlock2Ptr.playerGender === FEMALE ? 'female' : 'male';
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
    const isFemale = gSaveBlock2Ptr.playerGender === FEMALE;
    if (isFemale) {
      LoadPalette(assets.femaleBgPalette, 1 * 16, 32);
    }
    // 1:1 STRICT décomp `LoadCompressedSpriteSheet` + `LoadSpritePalette` via
    // tag system. Honore gReservedSpriteTileCount + first-free palette.
    _trainerPicTileStart = LoadSpriteSheet({
      data: assets.trainerPicRaw4bpp,
      size: assets.trainerPicRaw4bpp.length,
      tag: TAG_TRAINER_PIC_GFX,
    });
    _trainerPicPalSlot = LoadSpritePalette({ data: assets.trainerPicPal, tag: TAG_TRAINER_PIC_PAL });
    // badges.png = 128×16 = 8 badges de 16×16 (2×2 tiles) en ordre RASTER gbagfx
    // (badge i = tiles top[2i,2i+1] sur la row 0 + bot[16+2i,16+2i+1] sur la row 1
    // → ENTRELACÉS entre badges). Le décomp les dessine en BG tilemap (l'ordre
    // raster lui va) ; le port les rend en sprites OAM 16×16 qui lisent 4 tiles
    // CONTIGUËS (TL,TR,BL,BR) → on désentrelace en 8 blocs de 4 tiles pour que
    // badge i = baseTile + i*4 (sinon tiles mélangées = garbage / "coupé à gauche").
    const badgesDeint = _deinterleaveBadges(assets.badgesGfx);
    _badgesTileStart = LoadSpriteSheet({
      data: badgesDeint, size: badgesDeint.length, tag: TAG_BADGES_GFX,
    });
    _badgesPalSlot = LoadSpritePalette({ data: assets.badgesPal, tag: TAG_BADGES_PAL });
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
    playerTrainerId?: number | number[]; playerName?: string;
    playerGender?: number;
  };
  const name = sb2.playerName || (gSaveBlock2Ptr.playerName ?? 'UNDI') || 'PLAYER';
  // 1:1 décomp `trainer_card.c:722` :
  //   trainerCard->trainerId = (playerTrainerId[1] << 8) | playerTrainerId[0];
  // = les 16 bits BAS de l'ID 32-bit (ID dresseur PUBLIC, u16 0-65535).
  // Le SID (ID secret, u16) = les 16 bits HAUTS, pas affiché sur la carte.
  // Notre modèle stocke playerTrainerId en u32 little-endian (≡ u8[4]
  // décomp) : TID = (u32 & 0xFFFF). (Fallback array = défensif si jamais
  // un vieux format u8[4] traîne.)
  const rawTid = sb2.playerTrainerId;
  const tidU32 = (typeof rawTid === 'number'
    ? (rawTid >>> 0)
    : Array.isArray(rawTid)
      ? ((((rawTid[3] ?? 0) << 24) | ((rawTid[2] ?? 0) << 16)
          | ((rawTid[1] ?? 0) << 8) | (rawTid[0] ?? 0)) >>> 0)
      : 0);
  const trainerId = tidU32 & 0xFFFF;  // ID public affiché "NºID /XXXXX"
  // 1:1 décomp `gSaveBlock1Ptr->money` (= XOR'd avec encryptionKey dans
  // ROM ; notre port stocke en clair).
  const money = (gSaveBlock1Ptr.money as number | undefined) ?? 0;
  const allFlags = Object.keys(gSaveBlock1Ptr.flags);
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
  const isFemale = (sb2.playerGender === 1) || gSaveBlock2Ptr.playerGender === FEMALE;
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
    const spr = rt.gSprites[_trainerPicOamId];
    if (spr) spr.invisible = !visible;
  }
  for (const id of _badgeOamIds) {
    const spr = rt.gSprites[id];
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
    tileId: _trainerPicTileStart,
    paletteBank: _trainerPicPalSlot,
    priority: 0,
  });
  _trainerPicOamId = trainerSpr.spriteId;
}

/** Désentrelace badges.png (128×16, 8 badges 16×16 en ordre raster gbagfx) en
 *  8 blocs CONTIGUS de 4 tiles (TL,TR,BL,BR) pour le rendu en sprites OAM 16×16.
 *  badge i : top-left=2i, top-right=2i+1 (row 0) ; bot-left=16+2i, bot-right=16+2i+1
 *  (row 1) → dest tiles [i*4 .. i*4+3]. */
function _deinterleaveBadges(strip: Uint8Array): Uint8Array {
  const TILE = 32;                 // 8×8 4bpp = 32 octets/tile
  const NUM_BADGES = 8;
  const out = new Uint8Array(NUM_BADGES * 4 * TILE);
  for (let i = 0; i < NUM_BADGES; i++) {
    const src = [2 * i, 2 * i + 1, 16 + 2 * i, 16 + 2 * i + 1]; // TL,TR,BL,BR
    for (let t = 0; t < 4; t++) {
      const so = src[t] * TILE;
      out.set(strip.subarray(so, so + TILE), (i * 4 + t) * TILE);
    }
  }
  return out;
}

/** Spawn 8 badge OAM 16×16 à la rangée du bas. Visible only si badge flag set. */
function _spawnBadgesOam(assets: TrainerCardAssets): void {
  const rt = getRuntime();
  if (!rt) return;
  void assets;
  const d = _bufferCardData();
  _badgeOamIds = [];
  // badges.png = 8 badges de 16×16 = 4 tiles 8×8/badge (cf. décomp badgeTiles
  // [0x80 * NUM_BADGES] = 128 octets = 4 tiles). Désentrelacés par
  // _deinterleaveBadges → badge i = baseTile + i*4 contigu.
  const baseTile = _badgesTileStart;
  const TILES_PER_BADGE = 4;   // 16×16 = 4 tiles 8×8 4bpp (2 wide × 2 tall)
  for (let i = 0; i < 8; i++) {
    if (i >= d.badges) continue;  // only show earned badges
    // 1:1 décomp DrawStarsAndBadgesOnCard (:1511) : badge i au tile (4 + i*3, 15),
    // bloc 2×2 → pixel top-left ((4+3i)*8, 120) → centre OAM (40 + 24*i, 128).
    const badgeSpr = rt.CreateSpriteAtOam({
      x: 40 + i * 24, y: 128,
      shape: 0, size: 1,         // 16×16
      tileId: baseTile + i * TILES_PER_BADGE,
      paletteBank: _badgesPalSlot,
      priority: 0,
    });
    _badgeOamIds.push(badgeSpr.spriteId);
  }
}

function _freeTrainerCard(): void {
  const rt = getRuntime();
  // Safety : uninstall HBlank callback si on close pendant flip animation.
  if (rt) {
    rt.gba.setHBlankCallback(null);
    rt.gba.bg(0).config.vofs = 0;
    rt.gba.bg(1).config.vofs = 0;
    rt.gba.bg(2).config.vofs = 0;
  }
  if (_trainerPicOamId >= 0 && rt) {
    const spr = rt.gSprites[_trainerPicOamId];
    if (spr) { spr.inUse = false; const oam = rt.gba.oam[spr.oamIndex]; if (oam) oam.visible = false; }
    rt.gSprites[_trainerPicOamId] = undefined;
  }
  _trainerPicOamId = -1;
  for (const id of _badgeOamIds) {
    if (rt) {
      const spr = rt.gSprites[id];
      if (spr) { spr.inUse = false; const oam = rt.gba.oam[spr.oamIndex]; if (oam) oam.visible = false; }
      rt.gSprites[id] = undefined;
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

/** 1:1 décomp `Task_AnimateCardFlipDown/Up` scanline math (trainer_card.c:1625).
 *  Compute _flipScanlineBuf[i] pour chaque scanline i=0..159 selon cardTop.
 *
 *  Décomp body (squash card vertically) :
 *    cardBottom = DISPLAY_HEIGHT - cardTop
 *    cardHeight = cardBottom - cardTop
 *    r6 = -cardTop << 16
 *    r5 = (DISPLAY_HEIGHT << 16) / cardHeight
 *    r5 -= 1 << 16
 *    var_24 = r6 + r5 * cardHeight
 *    r10 = r5 / cardHeight
 *    r5 *= 2
 *    for (i=0..cardTop) buf[i] = -i
 *    for (i=cardTop..cardBottom) { buf[i] = r6>>16; r6 += r5; r5 -= r10 }
 *    for (i=cardBottom..160) buf[i] = var_24>>16
 *
 *  Notre version : math identique. Buffer Int16Array (signed) car offsets
 *  peuvent être négatifs. */
function _computeCardFlipScanlines(cardTop: number): void {
  const DISPLAY_HEIGHT = 160;
  const cardBottom = DISPLAY_HEIGHT - cardTop;
  const cardHeight = cardBottom - cardTop;
  if (cardHeight <= 0) return;  // safety
  let r6 = -cardTop << 16;
  let r5 = Math.floor((DISPLAY_HEIGHT << 16) / cardHeight);
  r5 -= 1 << 16;
  const var24 = r6 + r5 * cardHeight;
  const r10 = Math.floor(r5 / cardHeight);
  r5 *= 2;
  let i = 0;
  for (; i < cardTop; i++) {
    _flipScanlineBuf[i] = -i;
  }
  for (; i < cardBottom; i++) {
    _flipScanlineBuf[i] = r6 >> 16;
    r6 += r5;
    r5 -= r10;
  }
  const tail = var24 >> 16;
  for (; i < DISPLAY_HEIGHT; i++) {
    _flipScanlineBuf[i] = tail;
  }
}

/** 1:1 décomp `UpdateCardFlipRegs(cardTop)` (trainer_card.c:868) :
 *    blendY = (cardTop + 40) / 10
 *    if (blendY <= 4) blendY = 0
 *    SetGpuReg(BLDY, blendY)
 *    SetGpuReg(WIN0V, WIN_RANGE(cardTop, DISPLAY_HEIGHT - cardTop))
 *
 *  Notre simplification : skip BLDY/WIN0V (= effets visuels additionnels).
 *  L'effet principal de squash via scanline offsets suffit pour le rendu
 *  visuel 3D rotation feel. */
function _updateCardFlipRegs(_cardTop: number): void {
  void _cardTop;
}

/** HBlank callback installé pendant le flip animation. Set BG0 vofs per
 *  scanline depuis _flipScanlineBuf (= 1:1 décomp HblankCb_TrainerCard) :
 *    REG_BG0VOFS = gScanlineEffectRegBuffers[1][REG_VCOUNT];
 *  ONLY BG0 (= card front/back). BG2 (= bg.bin background teal stripes)
 *  reste normal pour montrer le fond derrière la carte qui squash.
 *  BG1 (= text windows) est aussi modulé pour que le texte squashe avec la
 *  carte (= ROM hide BG1+BG3 entirely, on simule via modulation). */
function _hblankCardFlip(y: number): void {
  if (y < 0 || y >= 160) return;
  const offset = _flipScanlineBuf[y];
  const rt = getRuntime();
  if (!rt) return;
  // ROM modulate uniquement BG0VOFS (trainer_card.c:348). BG2 (= bg.bin
  // teal background) doit rester en place. BG1 (= text) on modulate aussi
  // pour que le texte de la carte squash avec la carte.
  rt.gba.bg(0).config.vofs = offset & 0xFFFF;
  rt.gba.bg(1).config.vofs = offset & 0xFFFF;
}

/** 1:1 décomp `Task_DoCardFlipTask` (trainer_card.c:1602) — 6-step pipeline.
 *  Squash card vertically (= scanline Y offset modulation per row), swap
 *  tilemap at full squash, unsquash. Donne l'illusion 3D rotate.
 *
 *  Steps :
 *    0 : BeginCardFlip — clear scanline buf, install HBlank cb
 *    1 : AnimateCardFlipDown — increment cardTop 0→77, compute scanlines
 *    2 : DrawFlippedCardSide — swap tilemap + redraw text + toggle OAM
 *    3 : SetCardFlipped — reset to begin unsquash
 *    4 : AnimateCardFlipUp — decrement cardTop 77→0
 *    5 : EndCardFlip — uninstall HBlank, reset BG vofs, _flipping=false */
function Task_FlipCard(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (_flipState) {
    case 0:
      // BeginCardFlip (1:1 décomp trainer_card.c:1608) : clear scanline buf,
      // install HBlank cb. Hide OAM (trainer pic + badges) car ils don't
      // squash with the card → afficher serait incohérent visuel.
      for (let k = 0; k < 256; k++) _flipScanlineBuf[k] = 0;
      rt.gba.setHBlankCallback(_hblankCardFlip);
      _setOamVisibility(false);
      _flipCardTop = 0;
      _flipState = 1;
      break;
    case 1:
      // AnimateCardFlipDown : increment cardTop par CARD_FLIP_STEP (=7) jusqu'à
      // CARD_FLIP_Y (=77). À chaque step : recompute scanline buffer.
      _flipCardTop += CARD_FLIP_STEP;
      if (_flipCardTop >= CARD_FLIP_Y) _flipCardTop = CARD_FLIP_Y;
      _computeCardFlipScanlines(_flipCardTop);
      _updateCardFlipRegs(_flipCardTop);
      if (_flipCardTop >= CARD_FLIP_Y) _flipState = 2;
      break;
    case 2:
      // DrawFlippedCardSide : swap tilemap + redraw text. OAM reste cache
      // pendant le flip animation (= restored seulement at state 5 si front).
      _swapCardSide(_flipTargetSide);
      if (_flipTargetSide === 'back') _drawCardBack();
      else _drawCardFront();
      _cardSide = _flipTargetSide;
      _flipState = 3;
      break;
    case 3:
      // SetCardFlipped : no-op transition (= 1:1 décomp = ready for unsquash).
      _flipState = 4;
      break;
    case 4:
      // AnimateCardFlipUp : decrement cardTop par CARD_FLIP_STEP jusqu'à 0.
      _flipCardTop -= CARD_FLIP_STEP;
      if (_flipCardTop <= 0) _flipCardTop = 0;
      _computeCardFlipScanlines(_flipCardTop);
      _updateCardFlipRegs(_flipCardTop);
      if (_flipCardTop <= 0) _flipState = 5;
      break;
    case 5:
      // EndCardFlip : uninstall HBlank, reset BG vofs, restore OAM si front.
      rt.gba.setHBlankCallback(null);
      rt.gba.bg(0).config.vofs = 0;
      rt.gba.bg(1).config.vofs = 0;
      rt.gba.bg(2).config.vofs = 0;
      // Re-show trainer pic + badges OAM seulement si on est revenu sur front
      // (= back card a pas d'OAM visible dans le ROM).
      if (_cardSide === 'front') _setOamVisibility(true);
      _flipping = false;
      _flipState = 0;
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
  // 1:1 décomp `include/constants/songs.h` :
  //   SE_RG_CARD_FLIP = 249 (= card flip animation SE)
  //   SE_RG_CARD_OPEN = 251 (= card settled-into-stable-state SE)
  // Ancien code : PlaySE(5) = SE_SELECT — WRONG. User-flag 2026-05-20 :
  // "Ouvrir la carte dresseur joue le mauvais SE".
  const SE_RG_CARD_FLIP = 249;
  if (_cardSide === 'front') {
    if (newKeys & KEY_A) {
      // 1:1 décomp `trainer_card.c:446-451` STATE_HANDLE_INPUT_FRONT JOY_NEW(A) :
      //   FlipTrainerCard();
      //   PlaySE(SE_RG_CARD_FLIP);
      PlaySE(SE_RG_CARD_FLIP);
      _flipping = true;
      _flipState = 0;
      _flipTargetSide = 'back';
      rt.CreateTask(Task_FlipCard, 0);
      return;
    }
    if (newKeys & (KEY_B | KEY_START)) {
      // 1:1 décomp `trainer_card.c:452-462` STATE_HANDLE_INPUT_FRONT JOY_NEW(B) :
      //   BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, sData->blendColor);
      //   sData->mainState = STATE_CLOSE_CARD;
      // = AUCUN PlaySE. Close = fade silencieux. Précédent PlaySE(5) (= SE_SELECT)
      // = divergence ; retiré pour 1:1 strict.
      CloseTrainerCardScreen();
    }
  } else {
    // _cardSide === 'back'
    if (newKeys & KEY_B) {
      // 1:1 décomp `trainer_card.c:484-489` STATE_HANDLE_INPUT_BACK JOY_NEW(B)
      // (else branch, pas link) :
      //   FlipTrainerCard();
      //   PlaySE(SE_RG_CARD_FLIP);
      PlaySE(SE_RG_CARD_FLIP);
      _flipping = true;
      _flipState = 0;
      _flipTargetSide = 'front';
      rt.CreateTask(Task_FlipCard, 0);
      return;
    }
    if (newKeys & (KEY_A | KEY_START)) {
      // 1:1 décomp `trainer_card.c:491-502` STATE_HANDLE_INPUT_BACK JOY_NEW(A)
      // (else branch) : fade-out + STATE_CLOSE_CARD. AUCUN PlaySE.
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
      FreeAllSpritePalettes();   // 1:1 trainer_card.c:608 (manquait → sprite dresseur/badges noirs si slots OBJ réservés par l'écran précédent)
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
      // Fade IN from BLACK. 1:1 décomp `trainer_card.c:422-425` :
      //   BlendPalettes(PALETTES_ALL, 16, sData->blendColor);
      //   BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, sData->blendColor);
      //   SetVBlankCallback(VblankCb_TrainerCard);
      //   sData->mainState++;
      //
      // ⚠️ USER FLAG 2026-05-20 : fade IN était invisible car SetVBlankCallback
      // était dans `default` (= APRÈS case 21 poll). Sans vblankCallback,
      // `flushTo` ne run pas dans runOneFrame (= cf decomp-runtime.ts:2120-2126),
      // donc la fade animate Faded mais le PLTT register reste sur BLACK ancien
      // → fade invisible jusqu'à default → screen pop direct sur colors.
      //
      // Fix 1:1 décomp : SetVBlankCallback ICI au même state que BeginNormalPaletteFade.
      FadeScreen(FADE_FROM_BLACK, 0);
      rt.gPaletteFade.bufferTransferDisabled = false;
      rt.SetVBlankCallback(VBlankCB_TrainerCardRun);
      rt.gMain.state++;
      break;
    case 21:
      // 1:1 décomp `trainer_card.c:427-433` case 8 :
      //   if (!UpdatePaletteFade() && !IsDma3ManagerBusyWithBgCopy()) {
      //       PlaySE(SE_RG_CARD_OPEN);
      //       sData->mainState = STATE_HANDLE_INPUT_FRONT;
      //   }
      // Wait fade complete THEN play SE_RG_CARD_OPEN.
      // User-flag 2026-05-20 : "Ouvrir la carte dresseur joue le mauvais SE".
      // Avant : PlaySE(6) = SE_WIN_OPEN à fade START — wrong timing + wrong id.
      // Maintenant : PlaySE(251) = SE_RG_CARD_OPEN à fade END — 1:1 décomp.
      if (!rt.gPaletteFade.active) {
        PlaySE(251);  // SE_RG_CARD_OPEN
        rt.gMain.state++;
      }
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
