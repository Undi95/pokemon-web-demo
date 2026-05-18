/**
 * summary-screen.ts — Écran RÉSUMÉ Pokémon 1:1 décomp `pokemon_summary_screen.c`.
 *
 * Architecture : CB2 swap (= même pattern que bag/trainer-card/party-screen).
 * Pages 1:1 décomp :
 *   PSS_PAGE_INFO = 0       (= "INFOS")
 *   PSS_PAGE_SKILLS = 1     (= "APTITU")
 *   PSS_PAGE_BATTLE_MOVES = 2 (= "CAPACITES")
 *   PSS_PAGE_CONTEST_MOVES = 3
 *
 * BG layout 1:1 décomp `sBgTemplates` (pokemon_summary_screen.c:319) :
 *   BG0 charBase=0 mapBase=31 priority=0 → text windows
 *   BG1 charBase=2 mapBase=27 priority=1 → page background (= page_info.bin etc.)
 *   BG2 charBase=2 mapBase=25 priority=2 → secondary background
 *   BG3 charBase=2 mapBase=29 priority=3 → tertiary
 *
 * MVP scope (= cette session) :
 *   - CB2 swap pattern fonctionnel
 *   - Render bg page_info.bin sur BG1
 *   - A/B exit return to party screen
 *
 * TODO future polish :
 *   - Mon front sprite (= grande image Pokémon 64×64) à gauche
 *   - Text rendering : nickname, level, type, ability, item, OT, ID, EXP, etc.
 *   - Pages flip 1-5 via R/L buttons
 *   - Status icon, gender symbol, shiny indicator
 */

import {
  InitWindows, AddWindow, FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
  RemoveWindow, ShowBg, HideBg, BlitBitmapToWindow,
} from './gba-window-system';
import {
  AddTextPrinterParameterized3, GetStringWidth, GetStringRightAlignXOffset,
  FONT_NORMAL, TEXT_SKIP_DRAW,
} from './gba-text-system';
import { gameState } from './game-state';
import { getAbility, getSpeciesInfo, getNatureNameByIndex } from './data/game-data';
import {
  DynamicPlaceholderTextUtil_Reset,
  DynamicPlaceholderTextUtil_SetPlaceholderPtr,
  DynamicPlaceholderTextUtil_ExpandPlaceholders,
} from './dynamic-placeholder-text-util';
import { GetMapNameHandleAquaHideout } from './decomp-bridge';
import {
  PlaySE, LoadPalette, getRuntime,
  BlendPalettes, ResetPaletteFade, ResetTasks,
} from './decomp-globals';
import { ResetSpriteData } from './decomp-bridge';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './option-menu-return';
import { FadeScreen, FADE_FROM_BLACK } from './fade-screen';
import { loadGbaPal, loadTilemapBin, loadTileBin } from './gba/png-loader';
import { OBJ_PLTT_ID } from './decomp-runtime';
import type { DecompTask } from './decomp-runtime';
import type { PokemonInstance } from './pokemon';

/** 1:1 décomp `sBgTemplates` (pokemon_summary_screen.c:319). */
const SUMMARY_TILES_CHAR_BASE_BG0 = 0;
const SUMMARY_TILES_CHAR_BASE_BG123 = 2;
const SUMMARY_WIN_MAP_BASE = 31;     // BG0
const SUMMARY_BG_MAP_BASE = 27;      // BG1 = page bg
const SUMMARY_BG2_MAP_BASE = 25;     // BG2
const SUMMARY_BG3_MAP_BASE = 29;     // BG3

interface SummaryAssets {
  tiles: Uint8Array;
  pageInfoTilemap: Uint16Array;
  pageSkillsTilemap: Uint16Array;
  pageBattleMovesTilemap: Uint16Array;
  tilesPalette: Uint16Array;
  /** 1:1 décomp `sSpriteSheet_MoveTypes` (move_types.4bpp = 23 icônes 32×16,
   *  ordre enum TYPE_*) + `gMoveTypes_Pal` (48 couleurs = 3 palettes OBJ). */
  moveTypesTiles: Uint8Array;
  moveTypesPal: Uint16Array;
  /** 1:1 décomp `sButtons_Gfx[0]` — icône bouton (A) 16×16 4bpp (= a_button
   *  .png), blittée dans PROMPT_CANCEL par PrintAOrBButtonIcon. */
  aButtonTiles: Uint8Array;
}

let _isOpen = false;
let _phase: 'idle' | 'open' | 'fading_out' = 'idle';
let _currentMon: PokemonInstance | null = null;
let _currentPage = 0;  // 0 = INFOS, 1 = APTITU, 2 = CAPACITES
let _assets: SummaryAssets | null = null;
let _assetsLoading: Promise<SummaryAssets> | null = null;
let _inputTaskId = -1;
let _graphicsReady = false;
let _graphicsLoading = false;

async function _loadAssets(): Promise<SummaryAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [tiles, pageInfo, pageSkills, pageBattleMoves, tilesPal, mtTiles, mtPal, aBtn] = await Promise.all([
      loadTileBin('/decomp/em/summary_screen/tiles.png', 4),
      loadTilemapBin('/decomp/em/summary_screen/page_info.bin'),
      loadTilemapBin('/decomp/em/summary_screen/page_skills.bin'),
      loadTilemapBin('/decomp/em/summary_screen/page_battle_moves.bin'),
      loadGbaPal('/decomp/em/summary_screen/tiles.pal'),
      loadTileBin('/decomp/em/types/move_types.png', 4),
      loadGbaPal('/decomp/em/types/move_types.gbapal'),
      loadTileBin('/decomp/em/summary_screen/a_button.png', 4),
    ]);
    _assets = {
      tiles,
      pageInfoTilemap: pageInfo,
      pageSkillsTilemap: pageSkills,
      pageBattleMovesTilemap: pageBattleMoves,
      tilesPalette: tilesPal,
      moveTypesTiles: mtTiles,
      moveTypesPal: mtPal,
      aButtonTiles: aBtn,
    };
    return _assets;
  })();
  return _assetsLoading;
}

function _initSummaryBgs(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  rt.SetGpuReg(0x00, 0);
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
  for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
  // 1:1 décomp BG templates (pokemon_summary_screen.c:319).
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = SUMMARY_TILES_CHAR_BASE_BG0; bg0c.mapBaseIndex = SUMMARY_WIN_MAP_BASE;
  bg0c.screenSize = 0; bg0c.paletteMode = 0; bg0c.priority = 0; bg0c.visible = true;
  bg0c.hofs = 0; bg0c.vofs = 0;
  const bg1c = rt.gba.bg(1).config;
  bg1c.charBaseIndex = SUMMARY_TILES_CHAR_BASE_BG123; bg1c.mapBaseIndex = SUMMARY_BG_MAP_BASE;
  // ⚠️ Décomp dit screenSize=1 (= 64×32) mais nos page_*.bin sont 32×32 (= 2048 bytes).
  // screenSize=0 fits le tilemap directement.
  bg1c.screenSize = 0; bg1c.paletteMode = 0; bg1c.priority = 1; bg1c.visible = true;
  bg1c.hofs = 0; bg1c.vofs = 0;
  const bg2c = rt.gba.bg(2).config;
  bg2c.charBaseIndex = SUMMARY_TILES_CHAR_BASE_BG123; bg2c.mapBaseIndex = SUMMARY_BG2_MAP_BASE;
  bg2c.screenSize = 0; bg2c.paletteMode = 0; bg2c.priority = 2; bg2c.visible = false;
  bg2c.hofs = 0; bg2c.vofs = 0;
  const bg3c = rt.gba.bg(3).config;
  bg3c.charBaseIndex = SUMMARY_TILES_CHAR_BASE_BG123; bg3c.mapBaseIndex = SUMMARY_BG3_MAP_BASE;
  bg3c.screenSize = 0; bg3c.paletteMode = 0; bg3c.priority = 3; bg3c.visible = false;
  bg3c.hofs = 0; bg3c.vofs = 0;
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0);
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200);
  rt.SetGpuReg(0x50, 0);
  ShowBg(0); ShowBg(1); HideBg(2); HideBg(3);
}

function _loadSummaryGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
  if (!rt) return false;
  if (_graphicsReady) return true;
  if (_graphicsLoading) return false;
  _graphicsLoading = true;
  void _loadAssets().then(async (assets) => {
    const r = getRuntime();
    if (!r) { _graphicsLoading = false; return; }
    // Load tiles à charBase=2 (= shared BG1/2/3).
    const charOff = SUMMARY_TILES_CHAR_BASE_BG123 * 0x4000;
    r.gba.vram.set(assets.tiles, charOff);
    // Load page tilemap selon _currentPage.
    const tilemap = _currentPage === 0 ? assets.pageInfoTilemap
                  : _currentPage === 1 ? assets.pageSkillsTilemap
                  : assets.pageBattleMovesTilemap;
    // BG1 mapBase=27 reçoit la page bg tilemap.
    const bgMapOff = SUMMARY_BG_MAP_BASE * 0x800;
    const bgBytes = new Uint8Array(
      tilemap.buffer, tilemap.byteOffset, tilemap.byteLength,
    );
    r.gba.vram.set(bgBytes, bgMapOff);
    // Load palette.
    LoadPalette(assets.tilesPalette, 0, assets.tilesPalette.length * 2);
    // 1:1 décomp DecompressGraphics (pokemon_summary_screen.c:1359/1379) :
    //   LoadCompressedSpriteSheet(&sSpriteSheet_MoveTypes) → OBJ VRAM ;
    //   LoadCompressedPalette(gMoveTypes_Pal, OBJ_PLTT_ID(13),
    //     3*PLTT_SIZE_4BPP) → OBJ pal slots 13,14,15 (48 couleurs).
    r.gba.objVram.set(assets.moveTypesTiles, TYPE_ICON_TILE_BASE * 32);
    r.LoadPaletteObj(assets.moveTypesPal, OBJ_PLTT_ID(13));
    // Incr.4b (c) — 1:1 décomp LoadMonGfxAndSprite (:3900) : front pic du mon
    // en OBJ VRAM + sa palette. Notre asset = /decomp/em/pokemon/<dex>/
    // front.png (= même pipeline que battle-flow). gfx @ tile MON_PIC_TILE_
    // BASE, pal OBJ slot MON_PIC_PAL_SLOT. Le sprite est créé après
    // (_createMonPicSprite, 1:1 CreateMonSprite).
    const _mon = _currentMon;
    if (_mon) {
      const dexId = _mon.speciesEnum.replace('SPECIES_', '').toLowerCase();
      try {
        const ld = await r.LoadCompressedSpriteSheet(`/decomp/em/pokemon/${dexId}/front.png`, MON_PIC_BYTE_OFFSET);
        r.LoadPaletteObj(ld.palette, OBJ_PLTT_ID(MON_PIC_PAL_SLOT));
      } catch (e) {
        console.error('[summary-screen] mon front pic load failed:', e);
      }
    }
    // 1:1 SpeciesToPokedexNum : charge le mapping species→{national,hoenn}
    // (extract-species-dex-numbers.mjs). __HOENN_DEX_COUNT=202.
    if (!_dexNumbers) {
      try {
        const dj = await fetch('/decomp/em/species-dex-numbers.json').then((rsp) => rsp.json());
        _hoennDexCount = dj.__HOENN_DEX_COUNT ?? 202;
        delete dj.__HOENN_DEX_COUNT;
        _dexNumbers = dj;
      } catch (e) {
        console.error('[summary-screen] species-dex-numbers load failed:', e);
      }
    }
    _graphicsReady = true;
    _graphicsLoading = false;
  }).catch((e) => {
    console.error('[summary-screen] graphics load failed:', e);
    _graphicsLoading = false;
  });
  return false;
}

/** 1:1 décomp `sTextColors[][3]` (pokemon_summary_screen.c) — [bg,fg,shadow]
 *  indices palette. Tableau COMPLET (13 entrées) 1:1 décomp. */
const SUMMARY_TEXT_COLOR: ReadonlyArray<readonly number[]> = [
  [0, 1, 2],   // 0
  [0, 3, 4],   // 1
  [0, 5, 6],   // 2
  [0, 7, 8],   // 3
  [0, 9, 10],  // 4
  [0, 11, 12], // 5
  [0, 13, 14], // 6
  [0, 7, 8],   // 7
  [13, 15, 14],// 8
  [0, 1, 2],   // 9
  [0, 3, 4],   // 10
  [0, 5, 6],   // 11
  [0, 7, 8],   // 12
];
let _infoWindowIds: number[] = [];
let _typeSpriteIds: number[] = [];

/** 1:1 décomp include/constants/pokemon.h TYPE_* enum (= ordre du sheet
 *  move_types ; l'anim décomp `ANIMCMD_FRAME(typeId*8)` indexe dessus). */
const TYPE_ID: Record<string, number> = {
  TYPE_NORMAL: 0, TYPE_FIGHTING: 1, TYPE_FLYING: 2, TYPE_POISON: 3,
  TYPE_GROUND: 4, TYPE_ROCK: 5, TYPE_BUG: 6, TYPE_GHOST: 7, TYPE_STEEL: 8,
  TYPE_MYSTERY: 9, TYPE_FIRE: 10, TYPE_WATER: 11, TYPE_GRASS: 12,
  TYPE_ELECTRIC: 13, TYPE_PSYCHIC: 14, TYPE_ICE: 15, TYPE_DRAGON: 16,
  TYPE_DARK: 17,
};
/** 1:1 décomp `sMoveTypeToOamPaletteNum` (pokemon_summary_screen.c:907) —
 *  typeId 0..17 → OBJ palette slot 13/14/15 (gMoveTypes_Pal). */
const S_MOVE_TYPE_TO_OAM_PAL: ReadonlyArray<number> = [
  13, 13, 14, 14, 13, 13, 15, 14, 13, 15, 13, 14, 15, 13, 14, 14, 15, 13,
];
/** OBJ VRAM tile base du sheet move_types (23 icônes × 8 = 184 tiles).
 *  Summary n'a pas d'autre sprite OBJ pour l'instant ; le mon-pic (incr.4c)
 *  s'allouera après (tile ≥ 184) ou ailleurs. */
const TYPE_ICON_TILE_BASE = 0;
/** Mon front-pic (1:1 décomp `CreateMonSprite` → gMultiuseSpriteTemplate
 *  64×64). OBJ VRAM tile 184 = juste après les 184 tiles du sheet type-icons
 *  (pas de collision). 64×64 4bpp = 64 tiles = 2048 o. OBJ pal slot 1 (libre
 *  ; type-icons = 13/14/15). Position centre décomp (40,64), oam.priority=0. */
const MON_PIC_TILE_BASE = 184;
const MON_PIC_BYTE_OFFSET = MON_PIC_TILE_BASE * 32;
const MON_PIC_PAL_SLOT = 1;
let _monPicSpriteId = -1;

/** 1:1 décomp tables `sSpeciesToHoennPokedexNum`/`sSpeciesToNationalPokedex
 *  Num` (pokemon.c:104-105) extraites via extract-species-dex-numbers.mjs
 *  (= enums pokedex.h). { SPECIES_X: {national, hoenn} } + __HOENN_DEX_COUNT
 *  (=202). Chargé async (gates _graphicsReady). */
let _dexNumbers: Record<string, { national: number; hoenn: number }> | null = null;
let _hoennDexCount = 202;

/** 1:1 décomp `SpeciesToPokedexNum` (pokemon.c:6364) :
 *    if (IsNationalPokedexEnabled()) return SpeciesToNationalPokedexNum(sp);
 *    else { sp = SpeciesToHoennPokedexNum(sp);
 *           return (sp <= HOENN_DEX_COUNT) ? sp : 0xFFFF; }
 *  IsNationalPokedexEnabled() = FALSE dans tout notre gameplay actuel
 *  (dex national = post-game non atteint) → branche Hoenn 1:1. */
function _speciesToPokedexNum(speciesEnum: string): number {
  const e = _dexNumbers?.[speciesEnum];
  if (!e) return 0xFFFF;
  // national dex désactivé (notre contexte) → Hoenn.
  return e.hoenn <= _hoennDexCount ? e.hoenn : 0xFFFF;
}

// 1:1 décomp `sMemoNatureTextColor` / `sMemoMiscTextColor`
// (pokemon_summary_screen.c:746-747). Control codes inline (placeholders 0/1).
const S_MEMO_NATURE_TEXT_COLOR = '{COLOR LIGHT_RED}{SHADOW GREEN}';
const S_MEMO_MISC_TEXT_COLOR = '{COLOR WHITE}{SHADOW DARK_GRAY}';

// 1:1 décomp templates Mémo Dresseur FR (strings.c:518-525). Les
// {DYNAMIC 0..5} sont remplis par BufferMonTrainerMemo puis expandés ;
// {LV_2} = glyphe EXTRA_SYMBOL "Niv." (charmap.txt:1020).
const GTEXT_X_NATURE_MET_AT_YZ =
  '{DYNAMIC 0}{DYNAMIC 2}{DYNAMIC 1}{DYNAMIC 5} de nature,\nrencontré au {LV_2}{DYNAMIC 0}{DYNAMIC 3}{DYNAMIC 1}\n({DYNAMIC 0}{DYNAMIC 4}{DYNAMIC 1}).';
const GTEXT_X_NATURE_HATCHED_AT_YZ =
  '{DYNAMIC 0}{DYNAMIC 2}{DYNAMIC 1}{DYNAMIC 5} de nature,\na éclos au {LV_2}{DYNAMIC 0}{DYNAMIC 3}{DYNAMIC 1}\n({DYNAMIC 0}{DYNAMIC 4}{DYNAMIC 1}).';
const GTEXT_X_NATURE_MET_SOMEWHERE_AT =
  '{DYNAMIC 0}{DYNAMIC 2}{DYNAMIC 1}{DYNAMIC 5} de nature,\nrencontré quelque part\nau {LV_2}{DYNAMIC 0}{DYNAMIC 3}{DYNAMIC 1}.';
const GTEXT_X_NATURE_HATCHED_SOMEWHERE_AT =
  '{DYNAMIC 0}{DYNAMIC 2}{DYNAMIC 1}{DYNAMIC 5} de nature,\na éclos quelque part\nau {LV_2}{DYNAMIC 0}{DYNAMIC 3}{DYNAMIC 1}.';

/** 1:1 décomp `BufferMonTrainerMemo` (pokemon_summary_screen.c:3116) +
 *  `BufferNatureString` (:3173) + `GetMetLevelString` (:3180). Construit
 *  gStringVar4 (= retour). Branche `DoesMonOTMatchOwner == TRUE` : nos mons
 *  sont tous capturés/offerts au joueur en solo, OT = le joueur, jamais
 *  échangés → cette branche EST le 1:1 pour 100% de nos mons. Les branches
 *  Fateful/Trade/GBA du décomp restent fidèles mais inatteignables ici (on
 *  ne produit pas de mon événement/échangé) — report honnête, zéro fake. */
function _bufferMonTrainerMemo(mon: PokemonInstance): string {
  DynamicPlaceholderTextUtil_Reset();
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, S_MEMO_NATURE_TEXT_COLOR);
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(1, S_MEMO_MISC_TEXT_COLOR);
  // BufferNatureString : ph2 = gNatureNamePointers[nature], ph5 = "".
  // nature = GetNatureFromPersonality(personality) = personality % NUM_NATURES.
  const natureIdx = (mon.personality ?? 0) % 25; // NUM_NATURES = 25
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(2, getNatureNameByIndex(natureIdx));
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(5, ''); // gText_EmptyString5

  // GetMetLevelString : level = metLevel ; if (level==0) level=EGG_HATCH_LEVEL.
  // metLevel undefined = save legacy (champ ajouté après) → traité comme
  // "rencontré, niveau inconnu" : niveau affiché = EGG_HATCH_LEVEL(5) (=
  // fallback propre du décomp lui-même), jamais "éclos" (qui serait faux).
  const rawMetLevel = mon.metLevel;
  let dispLevel = rawMetLevel ?? 0;
  if (dispLevel === 0) dispLevel = 5; // EGG_HATCH_LEVEL (daycare.h:17)
  DynamicPlaceholderTextUtil_SetPlaceholderPtr(3, String(dispLevel));

  // metLocation < MAPSEC_NONE → vrai nom de zone (ph4) ; sinon "Somewhere".
  const metLocation = mon.metLocation;
  const locIsRealSection = !!metLocation && metLocation !== 'MAPSEC_NONE';
  if (locIsRealSection) {
    DynamicPlaceholderTextUtil_SetPlaceholderPtr(4, GetMapNameHandleAquaHideout(null, metLocation!));
  }

  // DoesMonOTMatchOwner == TRUE : metLevel==0 → œuf (Hatched), sinon Met.
  let text: string;
  if (rawMetLevel === 0) {
    text = locIsRealSection ? GTEXT_X_NATURE_HATCHED_AT_YZ : GTEXT_X_NATURE_HATCHED_SOMEWHERE_AT;
  } else {
    text = locIsRealSection ? GTEXT_X_NATURE_MET_AT_YZ : GTEXT_X_NATURE_MET_SOMEWHERE_AT;
  }
  return DynamicPlaceholderTextUtil_ExpandPlaceholders(text);
}

/** 1:1 décomp `PrintMonInfo` → `PrintNotEggInfo` (pokemon_summary_screen.c
 *  :2738/2750). Plaque portrait bottom-left : nº Pokédex (#17), surnom (#18),
 *  nom d'espèce + niveau + genre (#19). Windows `sSummaryTemplate` bg0. C'est
 *  CE contenu qui remplit la "box" bottom-left (vide tant que non dessinée =
 *  le cadre nu de page_info.bin). Sprite mon + SetMonPicBackgroundPalette +
 *  type icons = sous-étape incr.4b (pas de fake ici). */
function _printMonInfo(mon: PokemonInstance): void {
  // 1:1 décomp sSummaryTemplate (pokemon_summary_screen.c:407) — paletteNum
  // EXACTS : DEX_NUMBER #17 = pal 7 ; NICKNAME #18 = pal 6 ; SPECIES #19 =
  // pal 6. (Mettre pal 0 rendait sTextColors[n] sur des couleurs pâles =
  // texte blanc illisible / genre délavé — bug repéré par le user.)
  // PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER #17 tile(1,2) w4 h2 bg0 pal7 bb387.
  const dexWin = AddWindow({ bg: 0, tilemapLeft: 1, tilemapTop: 2, width: 4, height: 2, paletteNum: 7, baseBlock: 387 });
  // PSS_LABEL_WINDOW_PORTRAIT_NICKNAME #18 tile(1,12) w9 h2 bg0 pal6 bb395.
  const nickWin = AddWindow({ bg: 0, tilemapLeft: 1, tilemapTop: 12, width: 9, height: 2, paletteNum: 6, baseBlock: 395 });
  // PSS_LABEL_WINDOW_PORTRAIT_SPECIES #19 tile(1,14) w9 h4 bg0 pal6 bb413.
  const specWin = AddWindow({ bg: 0, tilemapLeft: 1, tilemapTop: 14, width: 9, height: 4, paletteNum: 6, baseBlock: 413 });
  _infoWindowIds.push(dexWin, nickWin, specWin);
  FillWindowPixelBuffer(dexWin, 0);
  FillWindowPixelBuffer(nickWin, 0);
  FillWindowPixelBuffer(specWin, 0);

  // 1:1 PrintNotEggInfo (pokemon_summary_screen.c:2755) :
  //   dexNum = SpeciesToPokedexNum(species);
  //   if (dexNum != 0xFFFF) { StringCopy(gStringVar1, gText_NumberClear01);
  //     ConvertIntToDecimalStringN(gStringVar2, dexNum, LEADING_ZEROS, 3);
  //     ... PrintTextOnWindow(DEX_NUMBER, ., 0,1,0, shiny?7:1) ... }
  //   else ClearWindowTilemap(DEX_NUMBER) (= pas de Nº affiché).
  // gText_NumberClear01 = "{NO}{CLEAR 1}" (strings.c:210). dexNum = vrai
  // Pokédex (Hoenn en early game) via _speciesToPokedexNum 1:1 — PAS
  // mon.speciesId (qui était faux : Nº001 pour tout, bug repéré user).
  const dexNum = _speciesToPokedexNum(mon.speciesEnum);
  if (dexNum !== 0xFFFF) {
    const dexStr = '{NO}{CLEAR 1}' + String(dexNum).padStart(3, '0');
    // non-shiny → sTextColors[1] ; shiny → sTextColors[7].
    const dexColor = mon.isShiny ? SUMMARY_TEXT_COLOR[7] : SUMMARY_TEXT_COLOR[1];
    AddTextPrinterParameterized3(dexWin, FONT_NORMAL, 0, 1, dexColor, TEXT_SKIP_DRAW, dexStr);
    // SetMonPicBackgroundPalette(shiny) = bg3 portrait region → incr.4b (e).
  }
  // dexNum == 0xFFFF → window laissée vide (1:1 ClearWindowTilemap : espèce
  // hors Pokédex Hoenn sans dex national).
  // 1:1 : gText_LevelSymbol "N." (strings.c:209) + level (LEFT_ALIGN 3 = nb
  // brut). @(24,17) sTextColors[1]. Window SPECIES.
  AddTextPrinterParameterized3(specWin, FONT_NORMAL, 24, 17, SUMMARY_TEXT_COLOR[1], TEXT_SKIP_DRAW, 'N.' + String(mon.level));
  // GetMonNickname @(0,1) sTextColors[1]. Window NICKNAME.
  AddTextPrinterParameterized3(nickWin, FONT_NORMAL, 0, 1, SUMMARY_TEXT_COLOR[1], TEXT_SKIP_DRAW, mon.nickname);
  // CHAR_SLASH(0xBA='/') + gSpeciesNames[species2] @(0,1) sTextColors[1]. SPECIES.
  AddTextPrinterParameterized3(specWin, FONT_NORMAL, 0, 1, SUMMARY_TEXT_COLOR[1], TEXT_SKIP_DRAW, '/' + mon.speciesNameFr);
  // 1:1 PrintGenderSymbol : sauf NIDORAN_M/F ; MON_MALE→♂ sTextColors[3],
  // MON_FEMALE→♀ sTextColors[4] @(57,17) ; genderless → rien.
  if (mon.speciesEnum !== 'SPECIES_NIDORAN_M' && mon.speciesEnum !== 'SPECIES_NIDORAN_F') {
    if (mon.monGender === 0) {
      AddTextPrinterParameterized3(specWin, FONT_NORMAL, 57, 17, SUMMARY_TEXT_COLOR[3], TEXT_SKIP_DRAW, '♂');
    } else if (mon.monGender === 254) {
      AddTextPrinterParameterized3(specWin, FONT_NORMAL, 57, 17, SUMMARY_TEXT_COLOR[4], TEXT_SKIP_DRAW, '♀');
    }
  }
  PutWindowTilemap(dexWin); CopyWindowToVram(dexWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(nickWin); CopyWindowToVram(nickWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(specWin); CopyWindowToVram(specWin, 3 /* COPYWIN_FULL */);
}

/** 1:1 décomp `PrintPageNamesAndStats` (pokemon_summary_screen.c:2832) —
 *  partie page INFO : header titre + prompt RETOUR.
 *  - PSS_LABEL_WINDOW_POKEMON_INFO_TITLE #0 (sSummaryTemplate : bg0
 *    tile 0,0 w11 h2 pal6 bb1) : gText_PkmnInfo="INFOS POKéMON"
 *    @(2,1) colorId 1.
 *  - PSS_LABEL_WINDOW_PROMPT_CANCEL #4 (bg0 tile 22,0 w8 h2 pal7 bb89) :
 *    gText_Cancel2="RETOUR" right-aligné offset 62 @(.,1) colorId 0.
 *    L'icône bouton (A) (PrintAOrBButtonIcon → BlitBitmapToWindow
 *    sButtons_Gfx, a_button.png) = micro-step suivant (pas de fake). */
function _printHeaderAndPrompt(): void {
  const titleWin = AddWindow({ bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 11, height: 2, paletteNum: 6, baseBlock: 1 });
  const cancelWin = AddWindow({ bg: 0, tilemapLeft: 22, tilemapTop: 0, width: 8, height: 2, paletteNum: 7, baseBlock: 89 });
  _infoWindowIds.push(titleWin, cancelWin);
  FillWindowPixelBuffer(titleWin, 0);
  FillWindowPixelBuffer(cancelWin, 0);
  AddTextPrinterParameterized3(titleWin, FONT_NORMAL, 2, 1, SUMMARY_TEXT_COLOR[1], TEXT_SKIP_DRAW, 'INFOS POKéMON');
  const cancelStr = 'RETOUR';
  const cancelX = GetStringRightAlignXOffset(cancelStr, 62);
  // 1:1 PrintAOrBButtonIcon(PROMPT_CANCEL, FALSE, iconXPos) :
  //   iconXPos = stringXPos - 16 ; if (<0) =0 ; BlitBitmapToWindow(.,
  //   sButtons_Gfx[0], iconXPos, 0, 16, 16). sButtons_Gfx[0] = a_button.png
  //   (16×16 4bpp). AVANT le texte (ordre décomp).
  const iconX = Math.max(0, cancelX - 16);
  const aBtn = _assets?.aButtonTiles;
  if (aBtn) BlitBitmapToWindow(cancelWin, aBtn, iconX, 0, 16, 16);
  AddTextPrinterParameterized3(cancelWin, FONT_NORMAL, cancelX, 1, SUMMARY_TEXT_COLOR[0], TEXT_SKIP_DRAW, cancelStr);
  PutWindowTilemap(titleWin); CopyWindowToVram(titleWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(cancelWin); CopyWindowToVram(cancelWin, 3 /* COPYWIN_FULL */);
}

/** 1:1 décomp `SetMonTypeIcons` (pokemon_summary_screen.c:3817) +
 *  `SetTypeSpritePosAndPal` (:3807). Page INFO : icône type[0] @(120,48) ;
 *  si type[0]≠type[1] : type[1] @(160,48). Sprite 32×16 (sOamData_MoveTypes
 *  shape/size, prio 1), tile = typeId*8 (ANIMCMD_FRAME), pal OBJ =
 *  sMoveTypeToOamPaletteNum[typeId]. CreateSpriteAtOam prend le CENTRE
 *  décomp → on passe x+16, y+8 (= SetTypeSpritePosAndPal 1:1). Egg =
 *  TYPE_MYSTERY (non géré ici : nos mons party ne sont pas des œufs). */
function _setMonTypeIcons(mon: PokemonInstance): void {
  const rt = getRuntime();
  if (!rt) return;
  const sp = getSpeciesInfo(mon.speciesEnum);
  const types = sp?.types ?? [];
  const t0 = TYPE_ID[types[0] ?? ''] ?? 0;
  const t1 = TYPE_ID[types[1] ?? ''] ?? t0;
  const place = (typeId: number, x: number, y: number): void => {
    const spr = rt.CreateSpriteAtOam({
      x: x + 16, y: y + 8,                          // 1:1 SetTypeSpritePosAndPal
      shape: 1, size: 2,                            // SPRITE_SHAPE/SIZE(32x16)
      tileId: TYPE_ICON_TILE_BASE + typeId * 8,     // ANIMCMD_FRAME(typeId*8)
      paletteBank: S_MOVE_TYPE_TO_OAM_PAL[typeId] ?? 13,
      priority: 1,                                  // sOamData_MoveTypes.priority
    });
    if (spr.spriteId >= 0) _typeSpriteIds.push(spr.spriteId);
  };
  place(t0, 120, 48);
  if (t0 !== t1) place(t1, 160, 48);
}

/** 1:1 décomp `CreateMonSprite` (pokemon_summary_screen.c:3975) :
 *  `CreateSprite(&gMultiuseSpriteTemplate, 40, 64, 5)` (centre décomp 40,64,
 *  subprio 5) ; `oam.priority = 0`. Front pic 64×64 (gfx déjà en OBJ VRAM @
 *  MON_PIC_TILE_BASE, pal slot MON_PIC_PAL_SLOT, chargés en async). hFlip =
 *  !IsMonSpriteNotFlipped — la plupart des front pics NON flippés (hFlip
 *  FALSE 1:1 cas commun). Cry + anim d'intro (SpriteCB_Pokemon →
 *  PlayMonCry + PokemonSummaryDoMonAnimation) = polish suivant (pas de
 *  fake : sprite statique 1:1 d'abord). */
function _createMonPicSprite(mon: PokemonInstance): void {
  const rt = getRuntime();
  if (!rt) return;
  const spr = rt.CreateSpriteAtOam({
    x: 40, y: 64,            // 1:1 CreateSprite(&gMultiuseSpriteTemplate, 40, 64, 5)
    shape: 0, size: 3,       // 64×64 (gMultiuseSpriteTemplate mon pic)
    tileId: MON_PIC_TILE_BASE,
    paletteBank: MON_PIC_PAL_SLOT,
    priority: 0,             // 1:1 gSprites[].oam.priority = 0
    subpriority: 5,          // 1:1 CreateSprite 4e arg
  });
  _monPicSpriteId = spr.spriteId;
  // 1:1 décomp CreateMonSprite (:3986) : `if (!IsMonSpriteNotFlipped(species))
  //   hFlip = TRUE; else hFlip = FALSE;` = hFlip = !noFlip. IsMonSpriteNot
  //   Flipped = gSpeciesInfo[].noFlip (pokemon.c:6553). syncSpritesToOam
  //   propage sprite.hFlip → oam.flipH chaque frame.
  const noFlip = getSpeciesInfo(mon.speciesEnum)?.noFlip ?? false;
  const sprObj = rt.gSprites.get(spr.spriteId);
  if (sprObj) sprObj.hFlip = !noFlip;
}

/** 1:1 décomp INFO page (non-egg) — increment 1 : OT name + OT ID.
 *  Windows = sPageInfoTemplate (pokemon_summary_screen.c:591).
 *  Texte = PrintMonOTName / PrintMonOTID (coords/colors 1:1).
 *  Ability/Memo/species/type = increments suivants (pas de fake). */
function _printInfoPageText(): void {
  const mon = _currentMon;
  if (!mon) return;
  // PSS_DATA_WINDOW_INFO_ORIGINAL_TRAINER (tile 11,4 w11 h2 pal6 bb449).
  const otWin = AddWindow({ bg: 0, tilemapLeft: 11, tilemapTop: 4, width: 11, height: 2, paletteNum: 6, baseBlock: 449 });
  // PSS_DATA_WINDOW_INFO_ID (tile 22,4 w7 h2 pal6 bb471).
  const idWin = AddWindow({ bg: 0, tilemapLeft: 22, tilemapTop: 4, width: 7, height: 2, paletteNum: 6, baseBlock: 471 });
  _infoWindowIds = [otWin, idWin];
  FillWindowPixelBuffer(otWin, 0);
  FillWindowPixelBuffer(idWin, 0);

  // 1:1 PrintMonOTName : gText_OTSlash @(0,1) color1 ; OTName @(width,1)
  // color5 (OTGender==MALE) sinon color6. OT = le joueur (gameState).
  const otSlash = 'DO/';  // 1:1 décomp gText_OTSlash FR = "DO/" (Dresseur d'Origine)
  AddTextPrinterParameterized3(otWin, FONT_NORMAL, 0, 1, SUMMARY_TEXT_COLOR[1], TEXT_SKIP_DRAW, otSlash);
  const otX = GetStringWidth(otSlash);
  const otColor = gameState.gender === 'MALE' ? SUMMARY_TEXT_COLOR[5] : SUMMARY_TEXT_COLOR[6];
  AddTextPrinterParameterized3(otWin, FONT_NORMAL, otX, 1, otColor, TEXT_SKIP_DRAW, gameState.playerName);

  // 1:1 PrintMonOTID (pokemon_summary_screen.c:3093) :
  //   ConvertIntToDecimalStringN(StringCopy(gStringVar1, gText_IDNumber2),
  //     (u16)OTID, STR_CONV_MODE_LEADING_ZEROS, 5);
  //   xPos = GetStringRightAlignXOffset(FONT_NORMAL, gStringVar1, 56);
  // gText_IDNumber2 = "{NO}{ID}" (strings.c:213) = 2 glyphes EXTRA_SYMBOL
  // (charmap.txt:1022-1023) → rendus 1:1 maintenant que le subsystème
  // extra-symbol existe. (u16)OTID = trainerId & 0xFFFF, 5-chiffres leading-0.
  const idStr = '{NO}{ID}' + String((gameState.trainerId ?? 0) & 0xFFFF).padStart(5, '0');
  const idXPos = GetStringRightAlignXOffset(idStr, 56);
  AddTextPrinterParameterized3(idWin, FONT_NORMAL, idXPos, 1, SUMMARY_TEXT_COLOR[1], TEXT_SKIP_DRAW, idStr);

  // Incr.2 — 1:1 PrintMonAbilityName + PrintMonAbilityDescription.
  // PSS_DATA_WINDOW_INFO_ABILITY (tile 11,9 w19 h4 pal6 bb485 ; w19 = FR diff).
  // décomp : ability = GetAbilityBySpecies(species, abilityNum) ;
  //   gAbilityNames[ability] @(0,1) color1 ; gAbilityDescriptionPointers
  //   @(0,17) color0. mon.ability = constante ABILITY_* (= sInfo.abilities[n],
  //   le commentaire "EN canonique" est obsolète — vérifié via l'assignment).
  const abWin = AddWindow({ bg: 0, tilemapLeft: 11, tilemapTop: 9, width: 19, height: 4, paletteNum: 6, baseBlock: 485 });
  _infoWindowIds.push(abWin);
  FillWindowPixelBuffer(abWin, 0);
  // 1:1 GetAbilityBySpecies(species, abilityNum) : mon.ability est le NOM EN
  // ("Overgrow") PAS la constante → on résout via les constantes ABILITY_* de
  // l'espèce (getSpeciesInfo .abilities = ["ABILITY_OVERGROW","ABILITY_NONE"])
  // + slot = personality & 1 (= MON_DATA_ABILITY_NUM décomp), fallback [0] si
  // NONE. getAbility() est keyé par constante → FR name + description.
  const sp = getSpeciesInfo(mon.speciesEnum);
  const abilities = sp?.abilities ?? [];
  const abilNum = (mon.personality ?? 0) & 1;
  let abilityConst = abilities[abilNum] || abilities[0] || '';
  if (!abilityConst || abilityConst === 'ABILITY_NONE') abilityConst = abilities[0] || '';
  const ab = abilityConst ? getAbility(abilityConst) : { name: mon.ability, description: '' };
  AddTextPrinterParameterized3(abWin, FONT_NORMAL, 0, 1, SUMMARY_TEXT_COLOR[1], TEXT_SKIP_DRAW, ab.name);
  AddTextPrinterParameterized3(abWin, FONT_NORMAL, 0, 17, SUMMARY_TEXT_COLOR[0], TEXT_SKIP_DRAW, ab.description);

  // Incr.3 — 1:1 BufferMonTrainerMemo + PrintMonTrainerMemo
  // (pokemon_summary_screen.c:3116/3168). PSS_DATA_WINDOW_INFO_MEMO
  // (tile 11,14 w18 h6 pal6 bb561 ; bb561 = FR diff). décomp :
  //   PrintTextOnWindow(memoWin, gStringVar4, 0, 1, 0, 0)
  //   = AddTextPrinterParameterized4(., FONT_NORMAL, 0, 1, ls=0,
  //     sTextColors[0], speed=0, gStringVar4). Les {COLOR}/{SHADOW} inline
  //   du template overrident la couleur de base par segment (nature rouge).
  const memoWin = AddWindow({ bg: 0, tilemapLeft: 11, tilemapTop: 14, width: 18, height: 6, paletteNum: 6, baseBlock: 561 });
  _infoWindowIds.push(memoWin);
  FillWindowPixelBuffer(memoWin, 0);
  const memoStr = _bufferMonTrainerMemo(mon);
  AddTextPrinterParameterized3(memoWin, FONT_NORMAL, 0, 1, SUMMARY_TEXT_COLOR[0], TEXT_SKIP_DRAW, memoStr);

  // Incr.4b — 1:1 PrintPageNamesAndStats : header "INFOS POKéMON" + prompt
  // "RETOUR" (top bar). (= les 2 items punch-list user header/RETOUR.)
  _printHeaderAndPrompt();

  // Incr.4a — 1:1 PrintMonInfo : plaque nº dex + surnom + espèce + niveau +
  // genre (remplit la "box" bottom-left, qui était le cadre nu page_info.bin).
  _printMonInfo(mon);

  // Incr.4b (a) — 1:1 PrintPageNamesAndStats (pokemon_summary_screen.c:2865) :
  //   PrintTextOnWindow(PSS_LABEL_WINDOW_POKEMON_INFO_TYPE, gText_TypeSlash,
  //   0, 1, 0, 0). Window #9 sSummaryTemplate : bg0 tile(11,6) w18 h2 pal6
  //   bb173. gText_TypeSlash = "TYPE/" (strings.c:496). colorId 0 =
  //   sTextColors[0]. Les ICÔNES de types (sprites OAM) = sous-bloc 4b(b).
  const typeWin = AddWindow({ bg: 0, tilemapLeft: 11, tilemapTop: 6, width: 18, height: 2, paletteNum: 6, baseBlock: 173 });
  _infoWindowIds.push(typeWin);
  FillWindowPixelBuffer(typeWin, 0);
  AddTextPrinterParameterized3(typeWin, FONT_NORMAL, 0, 1, SUMMARY_TEXT_COLOR[0], TEXT_SKIP_DRAW, 'TYPE/');

  PutWindowTilemap(otWin); CopyWindowToVram(otWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(idWin); CopyWindowToVram(idWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(abWin); CopyWindowToVram(abWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(memoWin); CopyWindowToVram(memoWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(typeWin); CopyWindowToVram(typeWin, 3 /* COPYWIN_FULL */);

  // Incr.4b (b) — 1:1 SetTypeIcons → SetMonTypeIcons (pokemon_summary_screen.c
  // :3776/3817) : sprites OAM des types du mon (le `[FEU]`/`[PLANTE]` coloré
  // à droite du label TYPE/).
  _setMonTypeIcons(mon);
  // Incr.4b (c) — 1:1 CreateMonSprite (:3975) : sprite front pic du mon
  // (grande image 64×64 à gauche). gfx/pal chargés en async (gates
  // _graphicsReady), donc dispo ici.
  _createMonPicSprite(mon);
}

function _freeSummary(): void {
  for (const w of _infoWindowIds) { try { RemoveWindow(w); } catch { /* idem décomp RemoveWindowByIndex */ } }
  _infoWindowIds = [];
  // 1:1 décomp DestroySpriteAndFreeResources(SPRITE_ARR_ID_TYPE…) au close.
  const _rt = getRuntime();
  for (const sid of _typeSpriteIds) { try { _rt?.DestroySprite(sid); } catch { /* déjà détruit */ } }
  _typeSpriteIds = [];
  if (_monPicSpriteId >= 0) { try { _rt?.DestroySprite(_monPicSpriteId); } catch { /* idem */ } _monPicSpriteId = -1; }
  _isOpen = false;
  _phase = 'idle';
  _currentMon = null;
  _currentPage = 0;
  _graphicsReady = false;
  _graphicsLoading = false;
}

function Task_FadeAndCloseSummary(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  FadeScreen(1 /* FADE_TO_BLACK */, 0);
  task.func = Task_CloseSummary;
}

function Task_CloseSummary(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _freeSummary();
  const exitCb = rt.gMain.savedCallback;
  if (exitCb) rt.SetMainCallback2(exitCb);
  else rt.SetMainCallback2(null);
  rt.DestroyTask(task.taskId);
  _inputTaskId = -1;
}

/** Input handler 1:1 décomp `Task_HandleInput` (pokemon_summary_screen.c).
 *  MVP : A/B → close. Future : R/L → page flip. */
function Task_Summary_HandleInput(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_phase !== 'open') return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (newKeys & (KEY_A | KEY_B)) {
    PlaySE(5);
    CloseSummaryScreen();
  }
}

export function VBlankCB_SummaryRun(): void { /* transferts auto */ }
export function MainCB2_SummaryRun(): void { /* tasks/fade tick auto */ }

export function CB2_InitSummaryScreen(): void {
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
      _initSummaryBgs(rt);
      _graphicsReady = false; _graphicsLoading = false;
      rt.gMain.state++; break;
    case 8:
      if (!_loadSummaryGraphicsCb2(rt)) break;
      rt.gMain.state++; break;
    case 9:
      // 1:1 décomp : InitWindows reset puis AddWindow par template + print.
      // Increment 1 : page INFO (OT name + OT ID). Pages 1-3 = suivants.
      InitWindows([]);
      if (_currentPage === 0) _printInfoPageText();
      rt.gMain.state++; break;
    case 10: _phase = 'open'; rt.gMain.state++; break;
    case 11: rt.gMain.state++; break;
    case 12:
      _inputTaskId = rt.CreateTask(Task_Summary_HandleInput, 0);
      rt.gMain.state++; break;
    case 13: rt.gMain.state++; break;
    case 14: rt.gMain.state++; break;
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
      rt.SetVBlankCallback(VBlankCB_SummaryRun);
      rt.SetMainCallback2(MainCB2_SummaryRun);
      _isOpen = true;
      return;
  }
}

export function IsSummaryScreenOpen(): boolean {
  return _isOpen;
}

export function OpenSummaryScreen(mon: PokemonInstance): void {
  if (_isOpen) return;
  _currentMon = mon;
  _currentPage = 0;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
    rt.SetMainCallback2(CB2_InitSummaryScreen);
  }).catch((e) => {
    console.error('[summary-screen] preload failed', e);
  });
}

export function CloseSummaryScreen(): void {
  if (!_isOpen || _phase === 'fading_out') return;
  _phase = 'fading_out';
  const rt = getRuntime();
  if (!rt) return;
  if (_inputTaskId >= 0) {
    rt.DestroyTask(_inputTaskId);
    _inputTaskId = -1;
  }
  rt.CreateTask(Task_FadeAndCloseSummary, 0);
}

// Expose to globalThis pour debug.
{
  const _g: Record<string, unknown> = {
    CB2_InitSummaryScreen, OpenSummaryScreen, CloseSummaryScreen, IsSummaryScreenOpen,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
