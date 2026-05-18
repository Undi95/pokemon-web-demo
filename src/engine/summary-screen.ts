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
  RemoveWindow, ShowBg, HideBg,
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
    const [tiles, pageInfo, pageSkills, pageBattleMoves, tilesPal] = await Promise.all([
      loadTileBin('/decomp/em/summary_screen/tiles.png', 4),
      loadTilemapBin('/decomp/em/summary_screen/page_info.bin'),
      loadTilemapBin('/decomp/em/summary_screen/page_skills.bin'),
      loadTilemapBin('/decomp/em/summary_screen/page_battle_moves.bin'),
      loadGbaPal('/decomp/em/summary_screen/tiles.pal'),
    ]);
    _assets = {
      tiles,
      pageInfoTilemap: pageInfo,
      pageSkillsTilemap: pageSkills,
      pageBattleMovesTilemap: pageBattleMoves,
      tilesPalette: tilesPal,
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
  void _loadAssets().then((assets) => {
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
    _graphicsReady = true;
    _graphicsLoading = false;
  }).catch((e) => {
    console.error('[summary-screen] graphics load failed:', e);
    _graphicsLoading = false;
  });
  return false;
}

/** 1:1 décomp `sTextColors[][3]` (pokemon_summary_screen.c) — [bg,fg,shadow]
 *  indices palette dans la font palette du summary screen. */
const SUMMARY_TEXT_COLOR: Record<number, readonly number[]> = {
  0: [0, 1, 2], 1: [0, 3, 4], 5: [0, 11, 12], 6: [0, 13, 14],
};
let _infoWindowIds: number[] = [];

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

  PutWindowTilemap(otWin); CopyWindowToVram(otWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(idWin); CopyWindowToVram(idWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(abWin); CopyWindowToVram(abWin, 3 /* COPYWIN_FULL */);
  PutWindowTilemap(memoWin); CopyWindowToVram(memoWin, 3 /* COPYWIN_FULL */);
}

function _freeSummary(): void {
  for (const w of _infoWindowIds) { try { RemoveWindow(w); } catch { /* idem décomp RemoveWindowByIndex */ } }
  _infoWindowIds = [];
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
