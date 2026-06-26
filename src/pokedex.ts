/**
 * pokedex.ts — POKéDEX 1:1 décomp `src/pokedex.c` (5605 l) — RÉÉCRITURE PROPRE.
 * ============================================================================
 * Remplace le stub overlay `engine/ui/pokedex-screen.ts` par le VRAI écran plein
 * CB2 de la décomp. Chantier découpé en JALONS A/B (l'œil du user valide chacun) :
 *
 *  JALON 1a (ICI) : substrat CB2 (CB2_OpenPokedex → CB2_Pokedex) + rendu du FOND
 *                   (cadre menu BG3 + tilemaps liste/underlay/start-menu + palette)
 *                   + InitWindows + B pour fermer + câblage start-menu (CB2 swap).
 *  JALON 1b       : liste des mons (n° dex + ball capturé + nom) — CreatePokedexList,
 *                   CreateMonListEntry.
 *  JALON 1c       : sprite du mon + sprites d'interface (curseur, scrollbar, compteurs)
 *                   — CreateInterfaceSprites, CreateMonSpritesAtPos.
 *  JALON 1d       : scroll (TryDoPokedexScroll / UpdateDexListScroll).
 *  JALON 2+       : fiche info, zone, cri, taille, recherche.
 *
 * Pattern CB2-swap IDENTIQUE au bag-menu prouvé : `SetMainCallback2(fn)` reset
 * gMain.state=0 ; le runtime ticke fn chaque frame ; un setup state-machine avance
 * d'UN état/frame ; à la fin → SetMainCallback2(MainCB2_PokedexRun) (corps vide =
 * le runtime fait RunTasks/AnimateSprites/BuildOamBuffer/UpdatePaletteFade).
 *
 * Stubs des jalons suivants = no-op HONNÊTES documentés (jamais de fake silencieux,
 * WORKING-MODE §2) — le fond doit s'afficher seul (livrable A/B du jalon 1a).
 */
import {
  getRuntime, ResetPaletteFade, ResetTasks, FreeAllSpritePalettes,
  ScanlineEffect_Stop, LoadPalette, PlaySE,
  LoadCompressedSpriteSheet, LoadSpritePalettes, assetCache,
} from '../harness/runtime/decomp-globals';
import {
  ResetSpriteData, setReservedSpritePaletteCount,
  CreateSprite, DestroySprite, SetOamMatrix,
  ANIMCMD_FRAME, ANIMCMD_END, type SpriteTemplate,
} from './sprite';
import { gSineTable } from './trig';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import { BeginNormalPaletteFade } from './palette';
import { DeactivateAllTextPrinters } from './text';
import {
  ShowBg, InitWindows, InitBgsFromTemplates, ResetBgsAndClearDma3BusyFlags,
  CopyToBgTilemapBuffer, CopyBgTilemapBufferToVram, PutWindowTilemap,
  CopyWindowToVram, FreeAllWindowBuffers, FillWindowPixelRect, BlitBitmapToWindow,
  ResetVramOamAndBgCntRegs,
  type WindowTemplate, type BgTemplate,
} from './engine/ui/gba-window-system';
import { AddTextPrinterParameterized4, FONT_NARROW, TEXT_SKIP_DRAW } from './engine/ui/gba-text-system';
import { TEXT_COLOR_TRANSPARENT, TEXT_COLOR_LIGHT_GRAY, TEXT_DYNAMIC_COLOR_6 } from '../include/constants/characters';
import { BG_PLTT_ID, type DecompTask } from '../harness/runtime/decomp-runtime';
import { loadTileBin, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './engine/ui/option-menu-return';
import {
  GetSetPokedexFlag, GetHoennPokedexCount as DexGetHoennCount,
  NationalToHoennOrder, HoennToNationalOrder, NationalPokedexNumToSpecies,
  HOENN_DEX_COUNT, NATIONAL_DEX_COUNT,
} from './engine/ui/pokedex-flags';
import { gSpeciesNames } from './engine/data/game-data';
import { SE_PC_OFF } from '../include/constants/songs';

// ─── Constantes 1:1 (pokedex.h / pokedex.c) ──────────────────────────────────
const PAGE_MAIN = 0;
// const PAGE_SEARCH_RESULTS = 1;            // jalon 4
const DEX_MODE_HOENN = 0;
// const DEX_MODE_NATIONAL = 1;              // national : jalon 4
const ORDER_NUMERICAL = 0;
const AREA_SCREEN = 1;                        // selectedScreen défaut (pokedex.c:1637)
const FLAG_GET_SEEN = 0;
const FLAG_GET_CAUGHT = 1;

// REG offsets GBA (io_reg.h) — hex pour SetGpuReg (modèle bag).
const REG_OFFSET_DISPCNT = 0x00;
const REG_OFFSET_BG2VOFS = 0x1a;
const REG_OFFSET_WININ = 0x48;
const REG_OFFSET_WINOUT = 0x4a;
const REG_OFFSET_WIN0H = 0x40;
const REG_OFFSET_WIN0V = 0x44;
const REG_OFFSET_WIN1H = 0x42;
const REG_OFFSET_WIN1V = 0x46;
const REG_OFFSET_BLDCNT = 0x50;
const REG_OFFSET_BLDALPHA = 0x52;
const REG_OFFSET_BLDY = 0x54;
// DISPCNT bits : MODE_0(0) | OBJ_1D_MAP(0x40) | OBJ_ON(0x1000) | OBJWIN_ON(0x8000).
const DISPCNT_POKEDEX = 0x40 | 0x1000 | 0x8000;
// WININ_WIN0_ALL(0x3F) | WININ_WIN1_ALL(0x3F00) ; WINOUT_WIN01_ALL(0x3F) |
// WINOBJ BG0(0x100)|BG2(0x400)|BG3(0x800)|OBJ(0x1000) (pokedex.c:2133-2134).
const WININ_POKEDEX = 0x3f | 0x3f00;
const WINOUT_POKEDEX = 0x3f | 0x100 | 0x400 | 0x800 | 0x1000;
const RGB_BLACK = 0x0000;
const PALETTES_ALL = 0xffffffff;

const ASSET = '/decomp/em/pokedex';

// ─── 1:1 décomp `sPokedex_BgTemplate` (pokedex.c:806) ────────────────────────
const sPokedex_BgTemplate: BgTemplate[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];

// ─── 1:1 décomp `sPokemonList_WindowTemplate` (pokedex.c) ─────────────────────
const sPokemonList_WindowTemplate: WindowTemplate[] = [
  { bg: 2, tilemapLeft: 0, tilemapTop: 0, width: 32, height: 32, paletteNum: 0, baseBlock: 1 },
];

// ─── struct PokedexView (champs nécessaires aux jalons 1a-1d ; mirror pokedex.h) ──
interface PokedexListItem { dexNum: number; seen: boolean; owned: boolean }
interface PokedexView {
  dexMode: number;
  dexOrder: number;
  currentPage: number;
  isSearchResults: boolean;
  selectedPokemon: number;
  selectedScreen: number;
  pokeBallRotation: number;
  seenCount: number;
  ownCount: number;
  initialVOffset: number;
  menuY: number;
  menuIsOpen: boolean;
  menuCursorPos: number;
  pokedexList: PokedexListItem[];
  pokemonListCount: number;
  listVOffset: number;
  listMovingVOffset: number;
}
let sPokedexView: PokedexView | null = null;
let sLastSelectedPokemon = 0;
let sPokeBallRotation = 0;

// 1:1 décomp `ResetPokedexView` (champs 1a ; le reste = jalons suivants).
function ResetPokedexView(v: PokedexView): void {
  v.dexMode = DEX_MODE_HOENN;
  v.dexOrder = ORDER_NUMERICAL;
  v.currentPage = PAGE_MAIN;
  v.isSearchResults = false;
  v.selectedPokemon = 0;
  v.selectedScreen = AREA_SCREEN;
  v.pokeBallRotation = 0;
  v.seenCount = 0;
  v.ownCount = 0;
  v.initialVOffset = 0;
  v.menuY = 0;
  v.menuIsOpen = false;
  v.menuCursorPos = 0;
  // 1:1 décomp ResetPokedexView : pokedexList[NATIONAL_DEX_COUNT] dexNum=0xFFFF, +1 sentinelle.
  v.pokedexList = [];
  for (let i = 0; i < NATIONAL_DEX_COUNT; i++) v.pokedexList[i] = { dexNum: 0xffff, seen: false, owned: false };
  v.pokedexList[NATIONAL_DEX_COUNT] = { dexNum: 0, seen: false, owned: false };
  v.pokemonListCount = 0;
  v.listVOffset = 0;
  v.listMovingVOffset = 0;
}

// Compteurs Vus/Possédés = GetHoennPokedexCount (pokedex-flags.ts, déjà porté 1:1).
// (Affichés en JALON 1c via SpriteCB_SeenOwnInfo ; calculés ici dès 1a.)

// ─── Assets BG (chargés une fois, idempotent) ────────────────────────────────
interface PokedexAssets {
  menuTiles: Uint8Array;          // gPokedexMenu_Gfx (menu.4bpp.bin → BG3 charBase 0)
  listTilemap: Uint16Array;       // gPokedexList_Tilemap (list.bin → BG1)
  underlayTilemap: Uint16Array;   // gPokedexListUnderlay_Tilemap (list_underlay.bin → BG3)
  startMenuTilemap: Uint16Array;  // gPokedexStartMenuMain_Tilemap (start_menu_main.bin → BG0 @0x280)
  bgHoennPal: Uint16Array;        // gPokedexBgHoenn_Pal (bg_hoenn.pal)
  caughtBall: Uint8Array;         // sCaughtBall_Gfx (caught_ball.4bpp.bin, 8×16 icône ball capturée)
  interfaceTiles: Uint8Array;     // gPokedexInterface_Gfx (interface.4bpp.bin, sprites d'interface)
}
let _assets: PokedexAssets | null = null;
let _assetsLoading: Promise<PokedexAssets> | null = null;
function _loadAssets(): Promise<PokedexAssets> {
  if (_assets) return Promise.resolve(_assets);
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [menuTiles, listTilemap, underlayTilemap, startMenuTilemap, bgHoennPal, caughtBall, interfaceTiles] = await Promise.all([
      loadTileBin(`${ASSET}/menu.png`, 4),          // sibling menu.4bpp.bin (indices bruts)
      loadTilemapBin(`${ASSET}/list.bin`),
      loadTilemapBin(`${ASSET}/list_underlay.bin`),
      loadTilemapBin(`${ASSET}/start_menu_main.bin`),
      loadGbaPal(`${ASSET}/bg_hoenn.pal`),
      loadTileBin(`${ASSET}/caught_ball.png`, 4),    // sibling caught_ball.4bpp.bin
      loadTileBin(`${ASSET}/interface.png`, 4),      // sibling interface.4bpp.bin (sprites)
    ]);
    _assets = { menuTiles, listTilemap, underlayTilemap, startMenuTilemap, bgHoennPal, caughtBall, interfaceTiles };
    // assetCache keyed pour LoadCompressedSpriteSheet/LoadSpritePalettes (sprites d'interface, TAG 4096).
    assetCache.set('gPokedexInterface_Gfx', interfaceTiles);
    assetCache.set('gPokedexBgHoenn_Pal', bgHoennPal);
    return _assets;
  })();
  return _assetsLoading;
}

// ─── Liste des mons (JALON 1b) ───────────────────────────────────────────────
// const LIST_SCROLL_STEP = 16;   // JALON 1d (scroll Up/Down)

// 1:1 décomp `CreatePokedexList` (pokedex.c:2190) — ORDER_NUMERICAL (Hoenn).
// (Tris alphabétique/poids/taille + mode National = JALON 4.)
function CreatePokedexList(_dexMode: number, _order: number): void {
  if (!sPokedexView) return;
  const v = sPokedexView;
  v.pokemonListCount = 0;
  const dexCount = HOENN_DEX_COUNT; // DEX_MODE_HOENN (National = jalon 4)
  for (let i = 0; i < dexCount; i++) {
    const dexNum = HoennToNationalOrder(i + 1);
    v.pokedexList[i].dexNum = dexNum;
    v.pokedexList[i].seen = GetSetPokedexFlag(dexNum, FLAG_GET_SEEN) !== 0;
    v.pokedexList[i].owned = GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT) !== 0;
    if (v.pokedexList[i].seen) v.pokemonListCount = i + 1;
  }
}

// 1:1 décomp `PrintMonDexNumAndName` (pokedex.c) : couleurs [TRANSPARENT, DYNAMIC_6, LIGHT_GRAY].
function PrintMonDexNumAndName(windowId: number, fontId: number, str: string, left: number, top: number): void {
  const color: [number, number, number] = [TEXT_COLOR_TRANSPARENT, TEXT_DYNAMIC_COLOR_6, TEXT_COLOR_LIGHT_GRAY];
  AddTextPrinterParameterized4(windowId, fontId, left * 8, top * 8 + 1, 0, 0, color, TEXT_SKIP_DRAW, str);
}

// 1:1 décomp `CreateMonDexNum` (pokedex.c:2436) : "{NO}" + n° dex 3 chiffres (Hoenn).
function CreateMonDexNum(entryNum: number, left: number, top: number): void {
  if (!sPokedexView) return;
  let dexNum = sPokedexView.pokedexList[entryNum].dexNum;
  if (sPokedexView.dexMode === DEX_MODE_HOENN) dexNum = NationalToHoennOrder(dexNum);
  PrintMonDexNumAndName(0, FONT_NARROW, '{NO}' + String(dexNum % 1000).padStart(3, '0'), left, top);
}

// 1:1 décomp `CreateCaughtBall` (pokedex.c:2451) : icône ball si possédé, sinon vide.
function CreateCaughtBall(owned: boolean, x: number, y: number): void {
  if (owned && _assets) BlitBitmapToWindow(0, _assets.caughtBall, x * 8, y * 8, 8, 16);
  else FillWindowPixelRect(0, 0, x * 8, y * 8, 8, 16);
}

// 1:1 décomp `CreateMonName` (pokedex.c:2459) : nom espèce ou "----------" (non vu).
function CreateMonName(num: number, left: number, top: number): void {
  const species = NationalPokedexNumToSpecies(num);
  const str = species ? (gSpeciesNames[species] ?? '----------') : '----------';
  PrintMonDexNumAndName(0, FONT_NARROW, str, left, top);
}

// 1:1 décomp `ClearMonListEntry` (pokedex.c:2472).
function ClearMonListEntry(x: number, y: number): void {
  FillWindowPixelRect(0, 0, x * 8, y * 8, 0x60, 16);
}

// 1:1 décomp `CreateMonListEntry` (pokedex.c:2347) — case 0 (Initial : 11 lignes centrées sur b).
// (cases 1/2 Up/Down = JALON 1d scroll.)
function CreateMonListEntry(position: number, b: number, _ignored: number): void {
  if (!sPokedexView) return;
  if (position === 0) {
    let entryNum = b - 5;
    for (let i = 0; i <= 10; i++) {
      const item = sPokedexView.pokedexList[entryNum];
      ClearMonListEntry(17, i * 2);
      if (entryNum >= 0 && entryNum < NATIONAL_DEX_COUNT && item && item.dexNum !== 0xffff) {
        if (item.seen) {
          CreateMonDexNum(entryNum, 0x12, i * 2);
          CreateCaughtBall(item.owned, 0x11, i * 2);
          CreateMonName(item.dexNum, 0x16, i * 2);
        } else {
          CreateMonDexNum(entryNum, 0x12, i * 2);
          CreateCaughtBall(false, 0x11, i * 2);
          CreateMonName(0, 0x16, i * 2);
        }
      }
      entryNum++;
    }
  }
  CopyWindowToVram(0, 2 /* COPYWIN_GFX */);
}

// 1:1 décomp `CreateMonSpritesAtPos` (pokedex.c:2478) — JALON 1b = la liste texte
// (CreateMonListEntry). Les SPRITES du mon (CreatePokedexMonSprite) = JALON 1c.
function CreateMonSpritesAtPos(selectedMon: number, _ignored: number): void {
  if (!sPokedexView) return;
  const rt = getRuntime();
  // JALON 1c : top/mid/bottom mon sprites (GetPokemonSpriteToDisplay + CreatePokedexMonSprite).
  CreateMonListEntry(0, selectedMon, 0);
  if (rt) rt.SetGpuReg(REG_OFFSET_BG2VOFS, sPokedexView.initialVOffset);
  sPokedexView.listVOffset = 0;
  sPokedexView.listMovingVOffset = 0;
}

// ─── Sprites d'interface (JALON 1c) ─────────────────────────────────────────
const DISPLAY_HEIGHT = 160;
const TAG_DEX_INTERFACE = 4096; // tile+pal tag de tous les sprites d'interface (pokedex.c:689)
const ST_OAM_AFFINE_NORMAL = 1; // sprite.h ST_OAM_AFFINE_NORMAL

// Templates 1:1 décomp (oam shape/size : 32x32=sh0/sz2, 64x32=sh1/sz3, 8x16=sh2/sz0).
// 1:1 sRotatingPokeBallSpriteTemplate (pokedex.c:724) — OBJ_WINDOW, anim frame 16.
const sRotatingPokeBallSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 0, size: 2, priority: 1, objMode: 2 /* OBJ_WINDOW */, affineMode: 0 },
  anims: [[ANIMCMD_FRAME(16, 30), ANIMCMD_END]],
  affineAnims: null, callback: SpriteCB_RotatingPokeBall,
};
// 1:1 sSeenOwnTextSpriteTemplate (pokedex.c:735) — labels VUS/PRIS, anims SeenText(64)/OwnText(96).
const sSeenOwnTextSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 1, size: 3, priority: 0, objMode: 0, affineMode: 0 },
  anims: [[ANIMCMD_FRAME(64, 30), ANIMCMD_END], [ANIMCMD_FRAME(96, 30), ANIMCMD_END]],
  affineAnims: null, callback: SpriteCB_SeenOwnInfo,
};
// 1:1 sHoennDexSeenOwnNumberSpriteTemplate (pokedex.c:757) — chiffres 0..9 (frames 128..146, +2).
const sHoennDexSeenOwnNumberSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 2, size: 0, priority: 0, objMode: 0, affineMode: 0 },
  anims: Array.from({ length: 10 }, (_, d) => [ANIMCMD_FRAME(128 + d * 2, 30), ANIMCMD_END]),
  affineAnims: null, callback: SpriteCB_SeenOwnInfo,
};

// 1:1 décomp `SpriteCB_RotatingPokeBall` (pokedex.c) : tourne la matrice affine (data[0]=30/31)
// via gSineTable[pokeBallRotation+data[1]] + orbite x2/y2 (rayon 40). data[1]=0/128 (2 balls 180°).
function SpriteCB_RotatingPokeBall(sprite: DecompSprite): void {
  if (!sPokedexView) return;
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== 1 /* PAGE_SEARCH_RESULTS */) {
    DestroySprite(sprite.spriteId);
    return;
  }
  let val = (sPokedexView.pokeBallRotation + sprite.data[1]) & 0xff;
  let r3 = gSineTable[val];
  let r0 = gSineTable[val + 64];
  SetOamMatrix(sprite.data[0], r0, r3, -r3, r0);
  val = (sPokedexView.pokeBallRotation + sprite.data[1] + 64) & 0xff;
  r3 = gSineTable[val];
  r0 = gSineTable[val + 64];
  sprite.x2 = Math.trunc((r0 * 40) / 256);
  sprite.y2 = Math.trunc((r3 * 40) / 256);
}

// 1:1 décomp `SpriteCB_SeenOwnInfo` (pokedex.c) : détruit le sprite si on quitte PAGE_MAIN.
function SpriteCB_SeenOwnInfo(sprite: DecompSprite): void {
  if (sPokedexView && sPokedexView.currentPage !== PAGE_MAIN) DestroySprite(sprite.spriteId);
}

// 1:1 décomp `CreateInterfaceSprites` (pokedex.c:2790) — JALON 1c : Pokéball affine + compteurs
// VUS/PRIS (Hoenn). [Flèches scroll / scrollbar / labels START-MENU-SELECT-RECHERCHE / National
// = sous-étapes suivantes ; sprite du mon = CreateMonSpritesAtPos jalon 1c-mon.]
function CreateInterfaceSprites(page: number): void {
  if (!sPokedexView) return;
  const rt = getRuntime();
  if (!rt) return;

  // helpers d'accès sprite (gSprites[id] est | undefined).
  const anim = (id: number, n: number) => rt.StartSpriteAnim(id, n);
  const hide = (id: number) => { const s = rt.gSprites[id]; if (s) s.invisible = true; };

  let id = 0;
  // 🚧 DÉSACTIVÉ TEMPORAIREMENT — Pokéball rotative (2 masques OBJ-window affines, matrixNum 30/31).
  // Le code (sRotatingPokeBallSpriteTemplate + SpriteCB_RotatingPokeBall, transcription 1:1 décomp)
  // est conservé, mais l'effet de masque tournant n'est pas encore rendu pixel-correct dans le
  // compositor du port (orbite/forme des barres). On laisse la Pokéball STATIQUE de BG1 (déjà
  // correcte, validée A/B en cachant les masques) → écran propre. À reprendre avec l'œil de l'auteur.
  // if (page === PAGE_MAIN || isSearchResults) { /* CreateSprite(sRotatingPokeBallSpriteTemplate, 0, DISPLAY_HEIGHT/2, 2) ×2, matrixNum 30/31, data[1]=0/128 */ }
  void sRotatingPokeBallSpriteTemplate;

  if (page === PAGE_MAIN) {
    // Hoenn (!IsNationalPokedexEnabled). National = jalon 4.
    let digitNum: number;
    let drawNextDigit: boolean;
    // Labels VUS / PRIS
    CreateSprite(sSeenOwnTextSpriteTemplate, 32, 40, 1);
    anim(CreateSprite(sSeenOwnTextSpriteTemplate, 32, 72, 1), 1);

    // Valeur VUS : centaines / dizaines / unités (masquage des zéros de tête).
    drawNextDigit = false;
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 24, 48, 1);
    digitNum = Math.floor(sPokedexView.seenCount / 100);
    anim(id, digitNum);
    if (digitNum !== 0) drawNextDigit = true; else hide(id);
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 32, 48, 1);
    digitNum = Math.floor((sPokedexView.seenCount % 100) / 10);
    if (digitNum !== 0 || drawNextDigit) anim(id, digitNum); else hide(id);
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 40, 48, 1);
    anim(id, (sPokedexView.seenCount % 100) % 10);

    // Valeur PRIS : centaines / dizaines / unités.
    drawNextDigit = false;
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 24, 80, 1);
    digitNum = Math.floor(sPokedexView.ownCount / 100);
    anim(id, digitNum);
    if (digitNum !== 0) drawNextDigit = true; else hide(id);
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 32, 80, 1);
    digitNum = Math.floor((sPokedexView.ownCount % 100) / 10);
    if (digitNum !== 0 || drawNextDigit) anim(id, digitNum); else hide(id);
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 40, 80, 1);
    anim(id, (sPokedexView.ownCount % 100) % 10);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CB2_OpenPokedex (pokedex.c:1604) — init multi-état
// ════════════════════════════════════════════════════════════════════════════
export function CB2_OpenPokedex(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0:
    default:
      rt.SetVBlankCallback(null);
      // ResetOtherVideoRegisters(0) + clear VRAM/OAM/PLTT (= ResetVramOamAndBgCntRegs).
      ResetVramOamAndBgCntRegs();
      rt.gMain.state = 1;
      break;
    case 1:
      ScanlineEffect_Stop();
      ResetTasks();
      ResetSpriteData();
      ResetPaletteFade();
      FreeAllSpritePalettes();
      setReservedSpritePaletteCount(8);
      rt.gMain.state++;
      break;
    case 2: {
      const v: PokedexView = {} as PokedexView;
      ResetPokedexView(v);
      sPokedexView = v;
      rt.CreateTask(Task_OpenPokedexMainPage, 0);
      // dexMode/order depuis le saveblock — jalon 4 (national). 1a = Hoenn défaut.
      v.dexMode = DEX_MODE_HOENN;
      v.dexOrder = ORDER_NUMERICAL;
      v.selectedPokemon = sLastSelectedPokemon;
      v.pokeBallRotation = sPokeBallRotation;
      v.selectedScreen = AREA_SCREEN;
      v.seenCount = DexGetHoennCount(FLAG_GET_SEEN);
      v.ownCount = DexGetHoennCount(FLAG_GET_CAUGHT);
      v.initialVOffset = 8;
      rt.gMain.state++;
      break;
    }
    case 3:
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      rt.SetMainCallback2(MainCB2_PokedexRun);
      if (sPokedexView) CreatePokedexList(sPokedexView.dexMode, sPokedexView.dexOrder);
      break;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CB2_Pokedex (pokedex.c:1661) = RunTasks/AnimateSprites/BuildOamBuffer/
// UpdatePaletteFade → corps vide « runtime auto-tick » (modèle bag/summary).
// ════════════════════════════════════════════════════════════════════════════
export function MainCB2_PokedexRun(): void { /* runtime auto-tick */ }
export function VBlankCB_Pokedex(): void { /* transferts auto */ }

// ─── Task_OpenPokedexMainPage (pokedex.c:1669) ───────────────────────────────
function Task_OpenPokedexMainPage(task: DecompTask): void {
  if (!sPokedexView) return;
  sPokedexView.isSearchResults = false;
  if (LoadPokedexListPage(PAGE_MAIN))
    task.func = Task_HandlePokedexInput;
}

// ─── Task_HandlePokedexInput (pokedex.c:1678) — JALON 1a : B ferme ───────────
// (A/START/SELECT/scroll = jalons 1b-1d.)
function Task_HandlePokedexInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  rt.SetGpuReg(0x14 /* BG0VOFS */, sPokedexView.menuY);
  if (sPokedexView.menuY) {
    sPokedexView.menuY -= 8;
    return;
  }
  const B_BUTTON = 0x0002;
  if (rt.gMain.newKeys & B_BUTTON) {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
    task.func = Task_ClosePokedex;
    PlaySE(SE_PC_OFF);
  }
  // JALON 1b-1d : A (info), START (menu), SELECT (recherche), D-pad (scroll).
}

// ─── Task_ClosePokedex (pokedex.c) ───────────────────────────────────────────
function Task_ClosePokedex(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  sLastSelectedPokemon = sPokedexView ? sPokedexView.selectedPokemon : 0;
  sPokeBallRotation = sPokedexView ? sPokedexView.pokeBallRotation : 0;
  FreeWindowAndBgBuffers();
  rt.SetMainCallback2(rt.gMain.savedCallback ?? CB2_ReturnToFieldWithOpenMenu_Manual);
  rt.DestroyTask(task.taskId);
  sPokedexView = null;
  _isOpen = false;
}

// ─── LoadPokedexListPage (pokedex.c:2066) — BG render (jalon 1a) ──────────────
function LoadPokedexListPage(page: number): boolean {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return false;
  switch (rt.gMain.state) {
    case 0:
    default: {
      if (rt.gPaletteFade.active) return false;
      // Assets async (BG + sheet interface) : attendre qu'ils soient prêts AVANT le rendu —
      // sinon CreateInterfaceSprites (case 1) tournerait sans la sheet chargée. (En ROM décomp
      // tout est synchrone ; ici on gate proprement.)
      if (!_assets) { void _loadAssets(); return false; }
      rt.SetVBlankCallback(null);
      sPokedexView.currentPage = page;
      rt.SetGpuReg(REG_OFFSET_BG2VOFS, sPokedexView.initialVOffset);
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, sPokedex_BgTemplate, sPokedex_BgTemplate.length);
      // SetBgTilemapBuffer(n, …) : buffer intrinsèque par-BG dans le port → no-op.
      // 1:1 DecompressAndLoadBgGfxUsingHeap(3, gPokedexMenu_Gfx) → BG3 charBase 0 + tilemaps.
      rt.gba.vram.set(_assets.menuTiles, 0 * 0x4000);
      CopyToBgTilemapBuffer(1, _assets.listTilemap, 0, 0);
      CopyToBgTilemapBuffer(3, _assets.underlayTilemap, 0, 0);
      CopyToBgTilemapBuffer(0, _assets.startMenuTilemap, 0, 0x280);
      CopyBgTilemapBufferToVram(0);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(2);
      CopyBgTilemapBufferToVram(3);
      ResetPaletteFade();
      sPokedexView.isSearchResults = page !== PAGE_MAIN;
      LoadPokedexBgPalette(sPokedexView.isSearchResults);
      InitWindows(sPokemonList_WindowTemplate);
      DeactivateAllTextPrinters();
      PutWindowTilemap(0);
      CopyWindowToVram(0, 3 /* COPYWIN_FULL */);
      rt.gMain.state = 1;
      return false;
    }
    case 1:
      ResetSpriteData();
      FreeAllSpritePalettes();
      setReservedSpritePaletteCount(8);
      // 1:1 LoadCompressedSpriteSheet(sInterfaceSpriteSheet) + LoadSpritePalettes(sInterfaceSpritePalette).
      LoadCompressedSpriteSheet({ data: 'gPokedexInterface_Gfx', size: 0x2000, tag: TAG_DEX_INTERFACE });
      LoadSpritePalettes([{ data: 'gPokedexBgHoenn_Pal', tag: TAG_DEX_INTERFACE }]);
      CreateInterfaceSprites(page);
      rt.gMain.state++;
      return false;
    case 2:
      rt.gMain.state++;
      return false;
    case 3:
      if (page === PAGE_MAIN) CreatePokedexList(sPokedexView.dexMode, sPokedexView.dexOrder);
      CreateMonSpritesAtPos(sPokedexView.selectedPokemon, 0xe);
      sPokedexView.menuIsOpen = false;
      sPokedexView.menuY = 0;
      rt.gMain.state++;
      return false;
    case 4:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      rt.gMain.state++;
      return false;
    case 5:
      rt.SetGpuReg(REG_OFFSET_WININ, WININ_POKEDEX);
      rt.SetGpuReg(REG_OFFSET_WINOUT, WINOUT_POKEDEX);
      rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
      rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
      rt.SetGpuReg(REG_OFFSET_WIN1H, 0);
      rt.SetGpuReg(REG_OFFSET_WIN1V, 0);
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_POKEDEX);
      ShowBg(0); ShowBg(1); ShowBg(2); ShowBg(3);
      rt.gMain.state++;
      return false;
    case 6:
      if (!rt.gPaletteFade.active) {
        rt.gMain.state = 0;
        return true;
      }
      return false;
  }
}
let _bgReady = false;

// ─── LoadPokedexBgPalette (pokedex.c:2160) — Hoenn (1a) ──────────────────────
function LoadPokedexBgPalette(isSearchResults: boolean): void {
  if (!_assets) {
    // Palette chargée avec les assets ; si pas encore prête, re-applique au ready.
    void _loadAssets().then(() => { if (!isSearchResults) _applyHoennBgPalette(); });
    return;
  }
  if (!isSearchResults) _applyHoennBgPalette();
}
function _applyHoennBgPalette(): void {
  if (!_assets) return;
  // LoadPalette(gPokedexBgHoenn_Pal + 1, BG_PLTT_ID(0) + 1, PLTT_SIZEOF(6*16 - 1)).
  LoadPalette(_assets.bgHoennPal.subarray(1), BG_PLTT_ID(0) + 1, (6 * 16 - 1) * 2);
}

// ─── FreeWindowAndBgBuffers (pokedex.c:2171) ─────────────────────────────────
function FreeWindowAndBgBuffers(): void {
  FreeAllWindowBuffers();
  // Les buffers tilemap BG sont intrinsèques au runtime (pas d'alloc manuelle) → rien à free.
}

// ════════════════════════════════════════════════════════════════════════════
// Entrée — câblage start menu (1:1 StartMenuPokedexCallback : CB2 swap).
// ════════════════════════════════════════════════════════════════════════════
let _isOpen = false;
export function IsPokedexScreenOpen(): boolean { return _isOpen; }

/** Ouvre le Pokédex en CB2 plein écran (remplace l'overlay).
 *  1:1 décomp `StartMenuPokedexCallback` (start_menu.c:639) : SetMainCallback2(
 *  CB2_OpenPokedex), retour via gMain.savedCallback. */
export function OpenPokedexFromStartMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  _isOpen = true;
  _bgReady = false;
  rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
  rt.SetMainCallback2(CB2_OpenPokedex);
}
