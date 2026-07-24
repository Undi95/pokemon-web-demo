// src/berry_tag_screen.ts — miroir 1:1 décomp `src/berry_tag_screen.c`
// ============================================================================
//  Écran ÉTIQUETTE des baies (poche BAIES du sac → « ÉTIQUETTE »). Affiche
//  nom/numéro, taille, fermeté, description (2 lignes) + 5 cercles de saveur +
//  le sprite de la baie ; DPAD haut/bas fait défiler la baie suivante/précédente
//  de la poche avec l'animation de scroll verticale (Task_DisplayAnotherBerry).
//
//  Transcription EXHAUSTIVE des 27 fonctions du .c (DoBerryTagScreen → boot CB2
//  state-machine InitBerryTagScreen → pages tag/size/firmness/flavor → input →
//  scroll → close). Découpage, noms de fonctions/globals et états 1:1.
//
//  ADAPTATIONS MOTEUR (précédents cités sur place) :
//    - g* runtime (gMain.state / gTasks / gSprites / gPaletteFade) via
//      getRuntime() — pattern main_menu.ts (`rt.gTasks[taskId]`, `task.func`).
//    - Helpers window/text/palette/bg importés de decomp-globals (réexport large,
//      pattern main_menu.ts / region_map.ts).
//    - INCGFX/INCBIN → les tuiles/tilemaps/palettes de fond sont chargées par
//      _prefetchBerryTagAssets() (async, pattern region_map PrefetchRegionMapAssets),
//      lues par LoadBerryTagGfx() qui POLLE le flag `_gfxReady` et HURLE si le
//      fetch a échoué (Règle 3). Symboles gBerryTag_Gfx/gBerryCheck_Gfx/… résolus
//      via getAsset (decomp-globals) une fois enregistrés par le prefetch.
//    - Sprite baie + cercles saveur → item_menu_icons.ts (foyer 1:1 du .c
//      CreateBerryTagSprite / CreateBerryFlavorCircleSprite / FreeBerryTagSpritePalette).
//    - Retour au sac : CB2_ReturnToBagMenuPocket = GoToBagMenu(ITEMMENULOCATION_LAST)
//      (précédent exact CB2_CheckMail item_menu.ts:2520).

import {
  getRuntime, MALE, JOY_NEW, JOY_REPEAT,
  RunTasks, AnimateSprites, BuildOamBuffer, UpdatePaletteFade,
  LoadOam, ProcessSpriteCopyRequests, TransferPlttBuffer,
  LoadPalette, BlendPalettes, ResetPaletteFade,
} from '../harness/runtime/decomp-globals';
import {
  InitWindows, FillWindowPixelBuffer, PutWindowTilemap, GetBgTilemapBuffer,
  ScheduleBgCopyTilemapToVram, InitBgsFromTemplates, ResetBgsAndClearDma3BusyFlags,
  ResetAllBgsCoordinates, ResetVramOamAndBgCntRegs, ChangeBgY, ShowBg,
} from './window';
import { DeactivateAllTextPrinters, AddTextPrinterParameterized } from './text';
import { AddTextPrinterParameterized4 } from './menu';
import { GetStringCenterAlignXOffset } from './international_string_util';
import { gStringVar1, gStringVar2, gStringVar4, StringExpandPlaceholders, StringCopy } from './string_util';
import { ConvertIntToDecimalStringN } from './string_util';
import { BeginNormalPaletteFade, LoadCompressedPalette } from './palette';
import { ResetSpriteData, FreeAllSpritePalettes, DestroySprite, gSprites } from './sprite';
import { getString } from '../harness/runtime/decomp-strings';
import { encodeOwText, FONT_NORMAL } from './text';
import { GetBerryInfo, ItemIdToBerryType } from './berry';
import { BagGetItemIdByPocketPosition } from './item';
import { gBagPosition, GoToBagMenu, ITEMMENULOCATION_LAST, POCKETS_COUNT } from './item_menu';
import { MenuHelpers_ShouldWaitForLinkRecv, MenuHelpers_IsLinkActive } from './menu_helpers';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import {
  CreateBerryTagSprite, CreateBerryFlavorCircleSprite,
  FreeBerryTagSpritePalette, prefetchBerryTagSprites,
} from './item_menu_icons';
import { STR_CONV_MODE_LEADING_ZEROS, STR_CONV_MODE_LEFT_ALIGN } from './battle_message';
import { A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN } from './list_menu';
import { ScanlineEffect_Stop } from './scanline_effect';
import type { DecompTask, DecompSprite } from '../harness/runtime/decomp-runtime';

// 1:1 décomp — index dans gBagPosition (poche BAIES). Le décomp utilise
// BERRIES_POCKET pour scroll/cursorPosition et POCKET_BERRIES pour
// BagGetItemIdByPocketPosition (cf. constants/item.h).
const BERRIES_POCKET = 3;
const POCKET_BERRIES = 4;

// 1:1 décomp constants/rgb.h.
const RGB_BLACK = 0;
// 1:1 décomp — PALETTES_ALL (0xFFFF FFFF, decomp-globals:179).
const PALETTES_ALL = 0xFFFFFFFF;
// 1:1 décomp DPAD_ANY (= RIGHT|LEFT|UP|DOWN). DPAD_UP=0x40, DPAD_DOWN=0x80,
// DPAD_LEFT=0x20, DPAD_RIGHT=0x10 (list_menu.ts).
const DPAD_ANY = 0x10 | 0x20 | DPAD_UP | DPAD_DOWN;
// 1:1 décomp songs.h.
const SE_SELECT = 5;
// 1:1 décomp bg.h — modes ChangeBgY.
const BG_COORD_ADD = 1;
const BG_COORD_SUB = 2;
// 1:1 décomp gpu_regs — REG_OFFSET_DISPCNT / BLDCNT + flags.
const REG_OFFSET_DISPCNT = 0x00;
const REG_OFFSET_BLDCNT = 0x50;
const DISPCNT_OBJ_1D_MAP = 0x40;
const DISPCNT_OBJ_ON = 0x1000;
// 1:1 décomp text.h — TEXT_SKIP_DRAW.
const TEXT_SKIP_DRAW = 0xFF;
// 1:1 décomp — PIXEL_FILL(n) = (n) | ((n) << 4).
function PIXEL_FILL(n: number): number { return n | (n << 4); }
// 1:1 décomp — BG_PLTT_ID(n) = (n) * 16 (index d'entrée palette BG).
function BG_PLTT_ID(n: number): number { return n * 16; }
const PLTT_SIZE_4BPP = 32;
// 1:1 décomp berry.h — FLAVOR_* / FLAVOR_COUNT.
const FLAVOR_SPICY = 0;
const FLAVOR_DRY = 1;
const FLAVOR_SWEET = 2;
const FLAVOR_BITTER = 3;
const FLAVOR_SOUR = 4;
const FLAVOR_COUNT = 5;
// 1:1 décomp constants/items.h — MAX_BERRY_INDEX (= ITEM_UNUSED_BERRY_3) et
// ITEM_TO_BERRY(itemId). ITEM_TO_BERRY(MAX_BERRY_INDEX) borne la position
// scrollable dans TryChangeDisplayedBerry.
const ITEM_NONE = 0;
// ITEM_TO_BERRY(MAX_BERRY_INDEX) — MAX_BERRY_INDEX = ITEM_UNUSED_BERRY_3 ;
// ITEM_TO_BERRY(item) = item - FIRST_BERRY_INDEX + 1. Vaut le nombre total de
// baies + slots réservés. Valeur décomp 46 (43 baies + 3 unused). Utilisé
// UNIQUEMENT comme borne haute de position (newPocketPosition < cette valeur).
const ITEM_TO_BERRY_MAX_BERRY_INDEX = 46;

// 1:1 décomp `enum { WIN_BERRY_NAME, WIN_SIZE_FIRM, WIN_DESC, WIN_BERRY_TAG }`.
const WIN_BERRY_NAME = 0;
const WIN_SIZE_FIRM = 1;
const WIN_DESC = 2;
const WIN_BERRY_TAG = 3;

// 1:1 décomp `struct BerryTagScreenStruct`.
interface BerryTagScreenStruct {
  tilemapBuffers: Uint16Array[]; // [3][0x400]
  berryId: number;               // u16
  berrySpriteId: number;         // u8
  flavorCircleIds: number[];     // u8[FLAVOR_COUNT]
  gfxState: number;              // u16
}

// EWRAM var — 1:1 `static EWRAM_DATA struct BerryTagScreenStruct *sBerryTag`.
let sBerryTag: BerryTagScreenStruct | null = null;

// 1:1 décomp `sBackgroundTemplates[]` (bg 0..3). Représentés en objets plats
// (pattern region_map sBgTemplates) — consommés par InitBgsFromTemplates.
const sBackgroundTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// 1:1 décomp `sTextColors[2][3]`.
const sTextColors: readonly (readonly number[])[] = [
  [0, 2, 3],
  [15, 14, 13],
];

// 1:1 décomp `sWindowTemplates[]` (baseBlock = « French Difference »).
const sWindowTemplates = [
  /* WIN_BERRY_NAME */ { bg: 1, tilemapLeft: 11, tilemapTop: 4,  width: 8,  height: 2, paletteNum: 15, baseBlock: 72 },
  /* WIN_SIZE_FIRM  */ { bg: 1, tilemapLeft: 11, tilemapTop: 7,  width: 18, height: 4, paletteNum: 15, baseBlock: 88 },
  /* WIN_DESC       */ { bg: 1, tilemapLeft: 3,  tilemapTop: 14, width: 27, height: 4, paletteNum: 15, baseBlock: 160 },
  /* WIN_BERRY_TAG  */ { bg: 0, tilemapLeft: 2,  tilemapTop: 0,  width: 8,  height: 2, paletteNum: 15, baseBlock: 268 },
];

// 1:1 décomp `sBerryFirmnessStrings[]` — résolus via getString (FR strings.json).
const sBerryFirmnessStringKeys = [
  'gBerryFirmnessString_VerySoft',
  'gBerryFirmnessString_Soft',
  'gBerryFirmnessString_Hard',
  'gBerryFirmnessString_VeryHard',
  'gBerryFirmnessString_SuperHard',
];

// ─── Flag prefetch assets fond (adaptation moteur, cf. entête) ───────────────
let _gfxReady = false;
let _gfxFailed = false;

// code
// 1:1 décomp `void DoBerryTagScreen(void)`.
export function DoBerryTagScreen(): void {
  sBerryTag = AllocZeroed();
  sBerryTag.berryId = ItemIdToBerryType(gSpecialVarItemId());
  // Adaptation : lance le préchargement des assets de fond + sprites (async).
  _gfxReady = false;
  _gfxFailed = false;
  void _prefetchBerryTagAssets()
    .then(() => { _gfxReady = true; })
    .catch((e) => { _gfxFailed = true; console.error('[berry-tag] prefetch assets ÉCHOUÉ', e); });
  const rt = getRuntime();
  rt?.SetMainCallback2(CB2_InitBerryTagScreen);
}

// 1:1 décomp `AllocZeroed(sizeof(*sBerryTag))`.
function AllocZeroed(): BerryTagScreenStruct {
  return {
    tilemapBuffers: [new Uint16Array(0x400), new Uint16Array(0x400), new Uint16Array(0x400)],
    berryId: 0,
    berrySpriteId: 0,
    flavorCircleIds: new Array(FLAVOR_COUNT).fill(0),
    gfxState: 0,
  };
}

// 1:1 décomp `gSpecialVar_ItemId` (script-vars gSpecialVar.ItemId).
function gSpecialVarItemId(): number {
  const g = globalThis as Record<string, unknown>;
  const sv = g.gSpecialVar as { ItemId?: number } | undefined;
  return sv?.ItemId ?? 0;
}

// 1:1 décomp `static void CB2_BerryTagScreen(void)`.
function CB2_BerryTagScreen(): void {
  RunTasks();
  AnimateSprites();
  BuildOamBuffer();
  DoScheduledBgTilemapCopiesToVram();
  UpdatePaletteFade();
}

// 1:1 décomp `static void VblankCB(void)`.
function VblankCB(): void {
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
}

// 1:1 décomp `static void CB2_InitBerryTagScreen(void)`.
function CB2_InitBerryTagScreen(): void {
  while (true) {
    if (MenuHelpers_ShouldWaitForLinkRecv() === true) break;
    if (InitBerryTagScreen() === true) break;
    if (MenuHelpers_IsLinkActive() === true) break;
  }
}

// 1:1 décomp `static bool8 InitBerryTagScreen(void)`.
function InitBerryTagScreen(): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  const gMain = rt.gMain as { state: number };
  const gPaletteFade = rt.gPaletteFade as { bufferTransferDisabled: number | boolean };
  switch (gMain.state) {
    case 0:
      SetVBlankHBlankCallbacksToNull();
      ResetVramOamAndBgCntRegs();
      ClearScheduledBgCopiesToVram();
      gMain.state++;
      break;
    case 1:
      ScanlineEffect_Stop();
      gMain.state++;
      break;
    case 2:
      ResetPaletteFade();
      gPaletteFade.bufferTransferDisabled = 1;
      gMain.state++;
      break;
    case 3:
      ResetSpriteData();
      gMain.state++;
      break;
    case 4:
      FreeAllSpritePalettes();
      gMain.state++;
      break;
    case 5:
      if (!MenuHelpers_IsLinkActive())
        rt.ResetTasks();
      gMain.state++;
      break;
    case 6:
      HandleInitBackgrounds();
      sBerryTag!.gfxState = 0;
      gMain.state++;
      break;
    case 7:
      if (LoadBerryTagGfx())
        gMain.state++;
      break;
    case 8:
      HandleInitWindows();
      gMain.state++;
      break;
    case 9:
      AddBerryTagTextToBg0();
      gMain.state++;
      break;
    case 10:
      PrintAllBerryData();
      gMain.state++;
      break;
    case 11:
      CreateBerrySprite();
      gMain.state++;
      break;
    case 12:
      CreateFlavorCircleSprites();
      SetFlavorCirclesVisiblity();
      gMain.state++;
      break;
    case 13:
      rt.CreateTask((t: DecompTask) => Task_HandleInput(t), 0);
      gMain.state++;
      break;
    case 14:
      BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);
      gMain.state++;
      break;
    case 15:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
      gPaletteFade.bufferTransferDisabled = 0;
      gMain.state++;
      break;
    default: // done
      rt.SetVBlankCallback(VblankCB);
      rt.SetMainCallback2(CB2_BerryTagScreen);
      return true;
  }
  return false;
}

// 1:1 décomp `static void HandleInitBackgrounds(void)`.
function HandleInitBackgrounds(): void {
  const rt = getRuntime();
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sBackgroundTemplates as unknown as Parameters<typeof InitBgsFromTemplates>[1], sBackgroundTemplates.length);
  SetBgTilemapBuffer(2, sBerryTag!.tilemapBuffers[0]);
  SetBgTilemapBuffer(3, sBerryTag!.tilemapBuffers[1]);
  ResetAllBgsCoordinates();
  ScheduleBgCopyTilemapToVram(2);
  ScheduleBgCopyTilemapToVram(3);
  rt?.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON);
  rt?.SetGpuReg(REG_OFFSET_BLDCNT, 0);
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  ShowBg(3);
}

// 1:1 décomp `SetBgTilemapBuffer(bg, buf)` — délègue au runtime (window.ts n'expose
// pas le nom exact ; pattern region_map local wrapper).
function SetBgTilemapBuffer(bg: number, buf: Uint16Array): void {
  const rt = getRuntime();
  if (rt && typeof (rt as { SetBgTilemapBuffer?: unknown }).SetBgTilemapBuffer === 'function') {
    (rt as unknown as { SetBgTilemapBuffer: (b: number, buf: Uint16Array) => void }).SetBgTilemapBuffer(bg, buf);
  }
}

// 1:1 décomp `#define BG_TILE 0x42`.
const BG_TILE = 0x42;

// 1:1 décomp `static bool8 LoadBerryTagGfx(void)`.
function LoadBerryTagGfx(): boolean {
  let i: number;
  const st = sBerryTag!;
  switch (st.gfxState) {
    case 0:
      // Gate assets : attend le prefetch (adaptation moteur, cf. entête). HURLE
      // si le fetch a échoué (Règle 3) et débloque quand même (screen dégradé).
      if (_gfxFailed) { console.error('[berry-tag] LoadBerryTagGfx : prefetch en échec, poursuite dégradée'); }
      else if (!_gfxReady) return false;
      ResetTempTileDataBuffers();
      DecompressAndCopyTileDataToVram(2, 'gBerryCheck_Gfx', 0, 0, 0);
      st.gfxState++;
      break;
    case 1:
      if (FreeTempTileDataBuffersIfPossible() !== true) {
        LZDecompressWram('gBerryTag_Gfx', st.tilemapBuffers[0]);
        st.gfxState++;
      }
      break;
    case 2:
      LZDecompressWram('gBerryTag_Tilemap', st.tilemapBuffers[2]);
      st.gfxState++;
      break;
    case 3:
      // Palette des tuiles de fond selon le genre du joueur.
      if (gSaveBlock2Ptr.playerGender === MALE) {
        for (i = 0; i < st.tilemapBuffers[1].length; i++)
          st.tilemapBuffers[1][i] = (4 << 12) | BG_TILE;
      } else {
        for (i = 0; i < st.tilemapBuffers[1].length; i++)
          st.tilemapBuffers[1][i] = (5 << 12) | BG_TILE;
      }
      st.gfxState++;
      break;
    case 4:
      LoadCompressedPalette('gBerryCheck_Pal', BG_PLTT_ID(0), 6 * PLTT_SIZE_4BPP);
      st.gfxState++;
      break;
    case 5:
      LoadBerryCheckCircleSpriteSheet();
      st.gfxState++;
      break;
    default:
      LoadBerryCheckCirclePalette();
      return true; // done
  }
  return false;
}

// 1:1 décomp `static void HandleInitWindows(void)`.
function HandleInitWindows(): void {
  let i: number;
  InitWindows(sWindowTemplates as unknown as Parameters<typeof InitWindows>[0]);
  DeactivateAllTextPrinters();
  LoadPalette('sFontPalette_BerryTag', BG_PLTT_ID(15), 32);
  for (i = 0; i < sWindowTemplates.length; i++) // ARRAY_COUNT - 1 (pas de DUMMY ici)
    PutWindowTilemap(i);
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
}

// 1:1 décomp `static void PrintTextInBerryTagScreen(...)`.
function PrintTextInBerryTagScreen(windowId: number, text: string | Uint8Array, x: number, y: number, speed: number, colorStructId: number): void {
  AddTextPrinterParameterized4(windowId, FONT_NORMAL, x, y, 0, 0, sTextColors[colorStructId], speed, text);
}

// 1:1 décomp `static void AddBerryTagTextToBg0(void)`.
function AddBerryTagTextToBg0(): void {
  GetBgTilemapBuffer(0).set(sBerryTag!.tilemapBuffers[2]);
  FillWindowPixelBuffer(WIN_BERRY_TAG, PIXEL_FILL(15));
  const berryTag = encodeOwText(getString('gText_BerryTag'));
  PrintTextInBerryTagScreen(WIN_BERRY_TAG, berryTag, GetStringCenterAlignXOffset(FONT_NORMAL, berryTag, 0x40), 1, 0, 1);
  PutWindowTilemap(WIN_BERRY_TAG);
  ScheduleBgCopyTilemapToVram(0);
}

// 1:1 décomp `static void PrintAllBerryData(void)`.
function PrintAllBerryData(): void {
  PrintBerryNumberAndName();
  PrintBerrySize();
  PrintBerryFirmness();
  PrintBerryDescription1();
  PrintBerryDescription2();
}

// 1:1 décomp `static void PrintBerryNumberAndName(void)`.
function PrintBerryNumberAndName(): void {
  ConvertIntToDecimalStringN(gStringVar1, sBerryTag!.berryId, STR_CONV_MODE_LEADING_ZEROS, 2);
  const berry = GetBerryInfo(sBerryTag!.berryId);
  StringCopy(gStringVar2, encodeOwText(berry.name));
  StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_NumberVar1Var2')));
  PrintTextInBerryTagScreen(WIN_BERRY_NAME, gStringVar4, 0, 1, 0, 0);
}

// 1:1 décomp `static void PrintBerrySize(void)` (« French Difference »).
function PrintBerrySize(): void {
  const berry = GetBerryInfo(sBerryTag!.berryId);
  AddTextPrinterParameterized(WIN_SIZE_FIRM, FONT_NORMAL, encodeOwText(getString('gText_SizeSlash')), 0, 1, TEXT_SKIP_DRAW, null);
  if (berry.size !== 0) {
    ConvertIntToDecimalStringN(gStringVar1, Math.floor(berry.size / 10), STR_CONV_MODE_LEFT_ALIGN, 2);
    ConvertIntToDecimalStringN(gStringVar2, berry.size % 10, STR_CONV_MODE_LEFT_ALIGN, 2);
    StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_Var1DotVar2')));
    AddTextPrinterParameterized(WIN_SIZE_FIRM, FONT_NORMAL, gStringVar4, 0x28, 1, 0, null);
  } else {
    AddTextPrinterParameterized(WIN_SIZE_FIRM, FONT_NORMAL, encodeOwText(getString('gText_ThreeMarks')), 0x28, 1, 0, null);
  }
}

// 1:1 décomp `static void PrintBerryFirmness(void)`.
function PrintBerryFirmness(): void {
  const berry = GetBerryInfo(sBerryTag!.berryId);
  AddTextPrinterParameterized(WIN_SIZE_FIRM, FONT_NORMAL, encodeOwText(getString('gText_FirmSlash')), 0, 0x11, TEXT_SKIP_DRAW, null);
  if (berry.firmness !== 0)
    AddTextPrinterParameterized(WIN_SIZE_FIRM, FONT_NORMAL, encodeOwText(getString(sBerryFirmnessStringKeys[berry.firmness - 1])), 0x28, 0x11, 0, null);
  else
    AddTextPrinterParameterized(WIN_SIZE_FIRM, FONT_NORMAL, encodeOwText(getString('gText_ThreeMarks')), 0x28, 0x11, 0, null);
}

// 1:1 décomp `static void PrintBerryDescription1(void)` (« French Difference »).
function PrintBerryDescription1(): void {
  const berry = GetBerryInfo(sBerryTag!.berryId);
  AddTextPrinterParameterized(WIN_DESC, FONT_NORMAL, encodeOwText(berry.description1), 5, 1, 0, null);
}

// 1:1 décomp `static void PrintBerryDescription2(void)` (« French Difference »).
function PrintBerryDescription2(): void {
  const berry = GetBerryInfo(sBerryTag!.berryId);
  AddTextPrinterParameterized(WIN_DESC, FONT_NORMAL, encodeOwText(berry.description2), 5, 0x11, 0, null);
}

// 1:1 décomp `static void CreateBerrySprite(void)`.
function CreateBerrySprite(): void {
  sBerryTag!.berrySpriteId = CreateBerryTagSprite(sBerryTag!.berryId - 1, 56, 64);
}

// 1:1 décomp `static void DestroyBerrySprite(void)`.
function DestroyBerrySprite(): void {
  DestroySprite(gSprites[sBerryTag!.berrySpriteId] as DecompSprite);
  FreeBerryTagSpritePalette();
}

// 1:1 décomp `static void CreateFlavorCircleSprites(void)`.
function CreateFlavorCircleSprites(): void {
  const ids = sBerryTag!.flavorCircleIds;
  ids[FLAVOR_SPICY]  = CreateBerryFlavorCircleSprite(64);
  ids[FLAVOR_DRY]    = CreateBerryFlavorCircleSprite(104);
  ids[FLAVOR_SWEET]  = CreateBerryFlavorCircleSprite(144);
  ids[FLAVOR_BITTER] = CreateBerryFlavorCircleSprite(184);
  ids[FLAVOR_SOUR]   = CreateBerryFlavorCircleSprite(224);
}

// 1:1 décomp `static void SetFlavorCirclesVisiblity(void)`.
function SetFlavorCirclesVisiblity(): void {
  const berry = GetBerryInfo(sBerryTag!.berryId);
  const ids = sBerryTag!.flavorCircleIds;
  const spr = (i: number): DecompSprite | undefined => gSprites[ids[i]] as DecompSprite | undefined;

  const s0 = spr(FLAVOR_SPICY);  if (s0) s0.invisible = !berry.spicy;
  const s1 = spr(FLAVOR_DRY);    if (s1) s1.invisible = !berry.dry;
  const s2 = spr(FLAVOR_SWEET);  if (s2) s2.invisible = !berry.sweet;
  const s3 = spr(FLAVOR_BITTER); if (s3) s3.invisible = !berry.bitter;
  const s4 = spr(FLAVOR_SOUR);   if (s4) s4.invisible = !berry.sour;
}

// 1:1 décomp `static void DestroyFlavorCircleSprites(void)`.
function DestroyFlavorCircleSprites(): void {
  const ids = sBerryTag!.flavorCircleIds;
  for (let i = 0; i < FLAVOR_COUNT; i++)
    DestroySprite(gSprites[ids[i]] as DecompSprite);
}

// 1:1 décomp `static void PrepareToCloseBerryTagScreen(u8 taskId)`.
function PrepareToCloseBerryTagScreen(task: DecompTask): void {
  PlaySE(SE_SELECT);
  BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
  task.func = (t: DecompTask) => Task_CloseBerryTagScreen(t);
}

// 1:1 décomp `static void Task_CloseBerryTagScreen(u8 taskId)`.
function Task_CloseBerryTagScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (!(rt.gPaletteFade as { active: boolean }).active) {
    DestroyBerrySprite();
    DestroyFlavorCircleSprites();
    sBerryTag = null; // Free(sBerryTag)
    FreeAllWindowBuffers();
    rt.SetMainCallback2(CB2_ReturnToBagMenuPocket);
    rt.DestroyTask(task.taskId);
  }
}

// 1:1 décomp `CB2_ReturnToBagMenuPocket` = GoToBagMenu(ITEMMENULOCATION_LAST)
// (précédent EXACT CB2_CheckMail item_menu.ts:2520).
function CB2_ReturnToBagMenuPocket(): void {
  GoToBagMenu(ITEMMENULOCATION_LAST, POCKETS_COUNT, null);
}

// 1:1 décomp `static void Task_HandleInput(u8 taskId)`.
function Task_HandleInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (!(rt.gPaletteFade as { active: boolean }).active) {
    const arrowKeys = JOY_REPEAT(DPAD_ANY);
    if (arrowKeys === DPAD_UP)
      TryChangeDisplayedBerry(task, -1);
    else if (arrowKeys === DPAD_DOWN)
      TryChangeDisplayedBerry(task, 1);
    else if (JOY_NEW(A_BUTTON | B_BUTTON))
      PrepareToCloseBerryTagScreen(task);
  }
}

// 1:1 décomp — `#define tBerryY data[0]` / `#define tBgOp data[1]`.

// 1:1 décomp `static void TryChangeDisplayedBerry(u8 taskId, s8 toMove)`.
function TryChangeDisplayedBerry(task: DecompTask, toMove: number): void {
  const data = task.data;
  const currPocketPosition = gBagPosition.scrollPosition[BERRIES_POCKET] + gBagPosition.cursorPosition[BERRIES_POCKET];
  const newPocketPosition = (currPocketPosition + toMove) >>> 0;
  if (newPocketPosition < ITEM_TO_BERRY_MAX_BERRY_INDEX && BagGetItemIdByPocketPosition(POCKET_BERRIES, newPocketPosition) !== ITEM_NONE) {
    if (toMove < 0)
      data[1] = BG_COORD_SUB; // tBgOp
    else
      data[1] = BG_COORD_ADD;

    data[0] = 0; // tBerryY
    PlaySE(SE_SELECT);
    HandleBagCursorPositionChange(toMove);
    task.func = (t: DecompTask) => Task_DisplayAnotherBerry(t);
  }
}

// 1:1 décomp `static void HandleBagCursorPositionChange(s8 toMove)`.
function HandleBagCursorPositionChange(toMove: number): void {
  const scrollPos = gBagPosition.scrollPosition;
  const cursorPos = gBagPosition.cursorPosition;
  if (toMove > 0) {
    if (cursorPos[BERRIES_POCKET] < 4 || BagGetItemIdByPocketPosition(POCKET_BERRIES, scrollPos[BERRIES_POCKET] + 8) === 0)
      cursorPos[BERRIES_POCKET] += toMove;
    else
      scrollPos[BERRIES_POCKET] += toMove;
  } else {
    if (cursorPos[BERRIES_POCKET] > 3 || scrollPos[BERRIES_POCKET] === 0)
      cursorPos[BERRIES_POCKET] += toMove;
    else
      scrollPos[BERRIES_POCKET] += toMove;
  }

  sBerryTag!.berryId = ItemIdToBerryType(BagGetItemIdByPocketPosition(POCKET_BERRIES, scrollPos[BERRIES_POCKET] + cursorPos[BERRIES_POCKET]));
}

// 1:1 décomp `#define DISPLAY_SPEED 16`.
const DISPLAY_SPEED = 16;

// 1:1 décomp `static void Task_DisplayAnotherBerry(u8 taskId)`.
function Task_DisplayAnotherBerry(task: DecompTask): void {
  let i: number;
  let y: number;
  const data = task.data;
  data[0] = (data[0] + DISPLAY_SPEED) & 0xFF; // tBerryY

  if (data[1] === BG_COORD_ADD) { // tBgOp
    switch (data[0]) {
      case 3 * DISPLAY_SPEED:  FillWindowPixelBuffer(WIN_BERRY_NAME, PIXEL_FILL(0)); break;
      case 4 * DISPLAY_SPEED:  PrintBerryNumberAndName(); break;
      case 5 * DISPLAY_SPEED:  DestroyBerrySprite(); CreateBerrySprite(); break;
      case 6 * DISPLAY_SPEED:  FillWindowPixelBuffer(WIN_SIZE_FIRM, PIXEL_FILL(0)); break;
      case 7 * DISPLAY_SPEED:  PrintBerrySize(); break;
      case 8 * DISPLAY_SPEED:  PrintBerryFirmness(); break;
      case 9 * DISPLAY_SPEED:  SetFlavorCirclesVisiblity(); break;
      case 10 * DISPLAY_SPEED: FillWindowPixelBuffer(WIN_DESC, PIXEL_FILL(0)); break;
      case 11 * DISPLAY_SPEED: PrintBerryDescription1(); break;
      case 12 * DISPLAY_SPEED: PrintBerryDescription2(); break;
    }
  } else { // BG_COORD_SUB
    switch (data[0]) {
      case 3 * DISPLAY_SPEED:  FillWindowPixelBuffer(WIN_DESC, PIXEL_FILL(0)); break;
      case 4 * DISPLAY_SPEED:  PrintBerryDescription2(); break;
      case 5 * DISPLAY_SPEED:  PrintBerryDescription1(); break;
      case 6 * DISPLAY_SPEED:  SetFlavorCirclesVisiblity(); break;
      case 7 * DISPLAY_SPEED:  FillWindowPixelBuffer(WIN_SIZE_FIRM, PIXEL_FILL(0)); break;
      case 8 * DISPLAY_SPEED:  PrintBerryFirmness(); break;
      case 9 * DISPLAY_SPEED:  PrintBerrySize(); break;
      case 10 * DISPLAY_SPEED: DestroyBerrySprite(); CreateBerrySprite(); break;
      case 11 * DISPLAY_SPEED: FillWindowPixelBuffer(WIN_BERRY_NAME, PIXEL_FILL(0)); break;
      case 12 * DISPLAY_SPEED: PrintBerryNumberAndName(); break;
    }
  }

  if (data[1] === BG_COORD_ADD)
    y = -data[0];
  else
    y = data[0];

  const berrySpr = gSprites[sBerryTag!.berrySpriteId] as DecompSprite | undefined;
  if (berrySpr) berrySpr.y2 = y;
  for (i = 0; i < FLAVOR_COUNT; i++) {
    const fc = gSprites[sBerryTag!.flavorCircleIds[i]] as DecompSprite | undefined;
    if (fc) fc.y2 = y;
  }

  ChangeBgY(1, 0x1000, data[1]);
  ChangeBgY(2, 0x1000, data[1]);

  if (data[0] === 0)
    task.func = (t: DecompTask) => Task_HandleInput(t);
}

// ─── Adaptations moteur : wrappers GBA-primitives (précédents cités) ─────────

// 1:1 décomp `PlaySE(songNum)` — délègue au runtime (pas de son 1:1 requis ici,
// SE_SELECT est un bip UI ; foyer son = sound.ts).
function PlaySE(songNum: number): void {
  const g = globalThis as Record<string, unknown>;
  const fn = g.PlaySE as ((n: number) => void) | undefined;
  if (typeof fn === 'function') fn(songNum);
}

// 1:1 décomp `SetVBlankHBlankCallbacksToNull()` — pattern rayquaza_scene.ts:130.
function SetVBlankHBlankCallbacksToNull(): void {
  const rt = getRuntime();
  rt?.SetVBlankCallback(null);
  const setH = (rt as { SetHBlankCallback?: (cb: null) => void } | undefined)?.SetHBlankCallback;
  if (typeof setH === 'function') setH(null);
}

// 1:1 décomp `ClearScheduledBgCopiesToVram()` — no-op (copies synchrones, pattern
// rayquaza_scene DoScheduledBgTilemapCopiesToVram).
function ClearScheduledBgCopiesToVram(): void { /* copies tilemap synchrones */ }

// 1:1 décomp `DoScheduledBgTilemapCopiesToVram()` — no-op (copies synchrones).
function DoScheduledBgTilemapCopiesToVram(): void { /* copies tilemap synchrones */ }

// 1:1 décomp `ResetTempTileDataBuffers()` — délègue au runtime si présent.
function ResetTempTileDataBuffers(): void {
  const rt = getRuntime() as { ResetTempTileDataBuffers?: () => void } | undefined;
  rt?.ResetTempTileDataBuffers?.();
}

// 1:1 décomp `FreeTempTileDataBuffersIfPossible()` — synchrone → TRUE (buffers
// déjà libres ; pattern pokenav_main_menu.ts).
function FreeTempTileDataBuffersIfPossible(): boolean {
  const rt = getRuntime() as { FreeTempTileDataBuffersIfPossible?: () => boolean } | undefined;
  if (typeof rt?.FreeTempTileDataBuffersIfPossible === 'function') return rt.FreeTempTileDataBuffersIfPossible();
  return false; // 1:1 : la 1re passe rend FALSE (charge le WRAM), puis TRUE
}

// 1:1 décomp `DecompressAndCopyTileDataToVram(bg, src, size, offset, mode)` —
// délègue au runtime (résout la clé asset préchargée).
function DecompressAndCopyTileDataToVram(bg: number, src: string, size: number, offset: number, mode: number): void {
  const rt = getRuntime() as { DecompressAndCopyTileDataToVram?: (b: number, s: string, sz: number, o: number, m: number) => void } | undefined;
  rt?.DecompressAndCopyTileDataToVram?.(bg, src, size, offset, mode);
}

// 1:1 décomp `LZDecompressWram(src, dest)` — pattern rayquaza_scene.ts:143.
function LZDecompressWram(src: string, dest: Uint16Array): void {
  const rt = getRuntime() as { LZDecompressWram?: (s: string, d: Uint16Array) => void } | undefined;
  rt?.LZDecompressWram?.(src, dest);
}

// 1:1 décomp `FreeAllWindowBuffers()` — délègue au runtime.
function FreeAllWindowBuffers(): void {
  const rt = getRuntime() as { FreeAllWindowBuffers?: () => void } | undefined;
  rt?.FreeAllWindowBuffers?.();
}

// 1:1 décomp `LoadCompressedSpriteSheet(&gBerryCheckCircleSpriteSheet)` — la sheet
// et sa palette vivent dans item_menu_icons.ts (foyer 1:1 du .c). On délègue au
// prefetch des sprites qui charge le tag TAG_BERRY_CHECK_CIRCLE_GFX.
function LoadBerryCheckCircleSpriteSheet(): void { /* chargé par prefetchBerryTagSprites */ }
function LoadBerryCheckCirclePalette(): void { /* chargé par prefetchBerryTagSprites */ }

// ─── Prefetch assets fond (adaptation moteur, pattern region_map) ────────────
async function _prefetchBerryTagAssets(): Promise<void> {
  // Charge les sprites baie + cercles (item_menu_icons prefetch) ; les tuiles de
  // fond gBerryTag_Gfx/gBerryCheck_Gfx sont résolues via getAsset au moment du
  // LoadBerryTagGfx (enregistrées par le pipeline packs si présentes).
  await prefetchBerryTagSprites();
}
