// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * credits.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/credits.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/credits.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { BGCNT_CHARBASE, BGCNT_PRIORITY, BGCNT_SCREENBASE, BG_SCREEN_ADDR, BLDALPHA_BLEND, BLDCNT_EFFECT_BLEND, BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3, CycleSceneryPalette, DmaFill16, DmaFill32, EnableInterrupts, INTR_FLAG_VBLANK, LZ77UnCompVram, LoadCompressedSpriteSheet, LoadPalette, PLTT_SIZE, PLTT_SIZEOF, ResetPaletteFade, ResetTasks, RunTasks, TransferPlttBuffer, gIntroCredits_MovingSceneryState, gIntroCredits_MovingSceneryVBase, gIntroCredits_MovingSceneryVOffset, gMain, gReservedSpritePaletteCount, m4aSongNumStart } from '../harness/runtime/decomp-globals';
import { RGB, RGB_BLACK, RGB_WHITEALPHA, ST_OAM_4BPP, ST_OAM_OBJ_BLEND, ST_OAM_OBJ_NORMAL } from '../harness/runtime/decomp-helpers';
import { TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_RED, TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE } from '../include/constants/characters';
import { MALE } from '../include/constants/global';
import { MUS_CREDITS, MUS_END } from '../include/constants/songs';
import { VAR_STARTER_MON } from '../include/constants/vars';
import { BG_SCREEN_SIZE, DISPLAY_HEIGHT, DISPLAY_WIDTH, OAM, OAM_SIZE, PLTT, VRAM, VRAM_SIZE } from '../include/gba/defines';
import { BGCNT_16COLOR, BGCNT_TXT256x256, B_BUTTON, DISPCNT_BG0_ON, DISPCNT_BG1_ON, DISPCNT_BG2_ON, DISPCNT_BG3_ON, DISPCNT_MODE_0, DISPCNT_OBJ_1D_MAP, DISPCNT_OBJ_ON, REG_OFFSET_BG0CNT, REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS, REG_OFFSET_BG1CNT, REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS, REG_OFFSET_BG2CNT, REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS, REG_OFFSET_BG3CNT, REG_OFFSET_BG3HOFS, REG_OFFSET_BG3VOFS, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDCNT, REG_OFFSET_BLDY, REG_OFFSET_DISPCNT } from '../include/gba/io_reg';
import { ST_OAM_AFFINE_NORMAL, ST_OAM_AFFINE_OFF } from '../include/sprite';
import { FONT_NORMAL, TEXT_SKIP_DRAW } from '../include/text';
import { JOY_HELD } from './battle_controllers';
import { MON_PIC_SIZE } from './battle_gfx_sfx_util';
import { DUMMY_WIN_TEMPLATE, PIXEL_FILL } from './window';
import { SpeciesToNationalPokedexNum } from './engine/data/game-data';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { GetSetPokedexFlag } from './pokedex';
import { FLAG_GET_CAUGHT, NATIONAL_DEX_COUNT } from '../include/pokedex';
import { VarGet } from './event_data';
import { SetGpuReg } from './gpu_regs';
import { GetStringCenterAlignXOffsetWithLetterSpacing } from './international_string_util';
// 1:1 décomp intro_credits_graphics.c — versions game-form (signature décomp, sans `rt`)
// vivant dans decomp-globals (= celles que l'intro utilise LIVE). Le transpileur avait choisi
// les doublons rt-first de src/intro_credits_graphics.ts (mauvaise résolution) → re-pointé.
import { CreateBicycleBgAnimationTask, CreateIntroBrendanSprite, CreateIntroMaySprite, assetCache, getRuntime } from '../harness/runtime/decomp-globals';
import { BG_CHAR_ADDR } from '../harness/runtime/decomp-runtime';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { sCreditsEntryPointerTable } from './data/credits';
import { CreateMonSpriteFromNationalDexNumber } from './pokedex';
import { GetStarterPokemon } from './starter_choose';
import { SetMainCallback2, SetVBlankCallback } from './main';
import { AddTextPrinterParameterized4 } from './menu';
import { BG_PLTT_ID, BeginNormalPaletteFade, OBJ_PLTT_ID, PALETTES_ALL, UpdatePaletteFade, gPaletteFade } from './palette';
import { Random } from './random';
import { FadeOutBGM } from './sound';
import { ANIMCMD_END, ANIMCMD_FRAME, ANIMCMD_JUMP, AnimateSprites, BuildOamBuffer, CalcCenterToCornerVec, CreateSprite, DestroySprite, FreeAllSpritePalettes, LoadOam, LoadSpritePalette, LoadSpritePalettes, LoadSpriteSheet, PLTT_SIZE_4BPP, ProcessSpriteCopyRequests, ResetSpriteData, SetOamMatrix, StartSpriteAnim, StartSpriteAnimIfDifferent, gDummySpriteAffineAnimTable, gSprites } from './sprite';
import { CreateTask, DestroyTask, gTasks } from './task';
import { DeactivateAllTextPrinters } from './text';
import { FreeAndDestroyMonPicSprite, ResetAllPicSprites } from './trainer_pokemon_sprites';
import { Sin } from './trig';
import { COPYWIN_FULL, COPYWIN_GFX, CopyWindowToVram, FillWindowPixelBuffer, FreeAllWindowBuffers, GetBgTilemapBuffer, InitBgsFromTemplates, InitWindows, PutWindowTilemap, ResetBgsAndClearDma3BusyFlags, SetBgTilemapBuffer, ShowBg } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type {  SpriteTemplate } from './sprite';

import type { OamData } from '../include/gba/types';

// ═══ CÂBLAGE des 22 ex-__wireTodo (cf. audit-reports/engine/fix-credits.md) ═══
// - CreateMonSpriteFromNationalDexNumber, GetStarterPokemon, sCreditsEntryPointerTable,
//   CreateBicycleBgAnimationTask/CreateIntroBrendanSprite/CreateIntroMaySprite → importés en tête.
// - LoadCreditsSceneGraphics, SetCreditsSceneBgCnt, gSpriteSheet_Credits*, gSpritePalettes_Credits,
//   système « moving scenery » → transcrits 1:1 depuis intro_credits_graphics.c EN BAS de ce fichier.
// - `data` (artefact transpileur du #define tTaskId_X data[N]) → SUPPRIMÉ + accès `.tTaskId_X`
//   expansés en `.data[N]` (finalisation de l'expansion d'alias).

const OBJ_VRAM0 = VRAM + 0x10000; // 1:1 include/gba/defines.h (VRAM sprite base)
const INTROCRED_SCENERY_FROZEN = 2; // 1:1 include/intro_credits_graphics.h

// gDecompressionBuffer 1:1 décomp src/decompress.c (EWRAM u8[0x4000]) — scratch WRAM partagé.
// Vrai buffer (les écritures indexées + LoadSpriteSheet ne crashent pas). ⚠ l'arithmétique de
// pointeur (gDecompressionBuffer + MON_PIC_SIZE ; &gDecompressionBuffer[MONBG_OFFSET]) reste
// TRANSPILER-TODO → le fond coloré des mons (mon-bg) est dégradé (cf. rapport), non-figeant.
const gDecompressionBuffer: Uint8Array = new Uint8Array(0x4000);

// InitHeap/gHeap 1:1 malloc.h — EXEMPTION matérielle (heap GBA vs GC JS) : no-op.
// SoftReset 1:1 syscall.h — reset BIOS non reproductible sur web : HURLE en console (exemption).
const gHeap: unknown = null;
const InitHeap = (_heap: unknown, _size: number): void => { /* heap = GC JS : no-op 1:1 (exemption) */ };
const SoftReset = (_resetFlags: number): void => {
  console.warn('[credits] SoftReset : reset matériel GBA non 1:1 sur web (exemption) — fin du générique.');
};

// Assets préchargés par preloadCreditsAssets() AVANT CB2 (lookup assetCache). Liés tardivement
// (_bindCreditsAssets, au 1er appel de CB2) pour être robustes à l'ordre d'import.
let gBirchBagGrass_Gfx: any = null;
let gBirchBagGrass_Pal: any = null;
let gBirchGrassTilemap: any = null;
let gCreditsCopyrightEnd_Gfx: any = null;
let gCreditsCopyrightEnd_Tilemap: any = null;
let gIntroCopyright_Pal: any = null;

// 1:1 décomp intro_credits_graphics.c:639-718 — feuilles sprite + palettes credits (scène vélo).
// data = clé assetCache (résolue par LoadCompressedSpriteSheet), tag STRING = clé catalogue OBJ.
const gSpriteSheet_CreditsBrendan = { data: 'sBrendanCredits_Gfx', size: 0x3800, tag: 'TAG_BRENDAN' };
const gSpriteSheet_CreditsMay = { data: 'sMayCredits_Gfx', size: 0x3800, tag: 'TAG_MAY' };
const gSpriteSheet_CreditsBicycle = { data: 'sBicycle_Gfx', size: 0x1000, tag: 'TAG_BICYCLE' };
const gSpriteSheet_CreditsRivalBrendan = { data: 'sBrendanCredits_Gfx', size: 0x2000, tag: 'TAG_BRENDAN' };
const gSpriteSheet_CreditsRivalMay = { data: 'sMayCredits_Gfx', size: 0x2000, tag: 'TAG_MAY' };
const gSpritePalettes_Credits = [
  { data: 'sBrendanCredits_Pal', tag: 'TAG_BRENDAN' },
  { data: 'sMayCredits_Pal', tag: 'TAG_MAY' },
  { data: 'sLatios_Pal', tag: 'TAG_FLYGON_LATIOS' },
  { data: 'sLatias_Pal', tag: 'TAG_FLYGON_LATIAS' },
];

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const DISPLAY_TILE_WIDTH = 30; // 1:1 include/gba/defines.h:75 (à consolider dans include/)
const HEAP_SIZE = 114688; // 1:1 include/malloc.h:13 (à consolider dans include/)
const SCENE_OCEAN_MORNING = 0; // 1:1 include/intro_credits_graphics.h:0 (à consolider dans include/)
const INTROCRED_SCENERY_NORMAL = 0; // 1:1 include/intro_credits_graphics.h:0 (à consolider dans include/)
const RESET_ALL = 255; // 1:1 include/gba/syscall.h:12 (à consolider dans include/)
const PAGE_COUNT = 55; // 1:1 src/data/credits.h:0 (à consolider dans include/)
const ENTRIES_PER_PAGE = 5; // 1:1 src/data/credits.h:64 (à consolider dans include/)
const SCENE_OCEAN_SUNSET = 1; // 1:1 include/intro_credits_graphics.h:0 (à consolider dans include/)
const SCENE_FOREST_RIVAL_ARRIVE = 2; // 1:1 include/intro_credits_graphics.h:0 (à consolider dans include/)
const SCENE_FOREST_CATCH_RIVAL = 3; // 1:1 include/intro_credits_graphics.h:0 (à consolider dans include/)
const SCENE_CITY_NIGHT = 4; // 1:1 include/intro_credits_graphics.h:0 (à consolider dans include/)
const INTROCRED_SCENERY_DESTROY = 1; // 1:1 include/intro_credits_graphics.h:0 (à consolider dans include/)
const NATIONAL_DEX_NONE = 0; // 1:1 include/constants/pokedex.h:0 (à consolider dans include/)

const COLOR_DARK_GREEN = RGB(7, 11, 6); // 1:1 credits.c:26

const COLOR_LIGHT_GREEN = RGB(13, 20, 12); // 1:1 credits.c:27

const TAG_MON_BG = 1001; // 1:1 credits.c:29

// Positions for the Pokémon images

// enum credits.c:32
const POS_LEFT = 0;
const POS_CENTER = 1;
const POS_RIGHT = 2;

// enum credits.c:38
const MODE_NONE = 0;
const MODE_BIKE_SCENE = 1;
const MODE_SHOW_MONS = 2;

// #define tState data[0]  (alias — expansé aux usages)

// Task data for the main Credits tasks (1:1 credits.c:47-60 #define tX data[N]).
// Les alias tTaskId_BgScenery/BikeScene/SceneryPal/ShowMons/UpdatePage sont expansés
// DIRECTEMENT aux usages en `.data[0/1/2/3/15]` (le transpileur les avait laissés en
// property-access `.tTaskId_X` non résolus → finalisation manuelle de l'expansion) :
//   tTaskId_BgScenery=data[0] · tTaskId_BikeScene=data[1] · tTaskId_SceneryPal=data[2]
//   tTaskId_ShowMons=data[3] · tTaskId_UpdatePage=data[15]

// #define tEndCredits data[4]  (alias — expansé aux usages)

// #define tPlayerSpriteId data[5]  (alias — expansé aux usages)

// #define tRivalSpriteId data[6]  (alias — expansé aux usages)

// #define tSceneNum data[7]  (alias — expansé aux usages)

// data[8]-[10] are unused

// #define tNextMode data[11]  (alias — expansé aux usages)

// #define tTheEndDelay data[12]  (alias — expansé aux usages)

// #define tCurrentMode data[13]  (alias — expansé aux usages)

// #define tPrintedPage data[14]  (alias — expansé aux usages)

// #define tTaskId_UpdatePage data[15]  (alias — expansé aux usages)

const NUM_MON_SLIDES = 71; // 1:1 credits.c:62

/** 1:1 `struct CreditsData` (credits.c:64). */
interface CreditsData {
  monToShow: Uint16Array;
  imgCounter: number;
  nextImgPos: number;
  currShownMon: number;
  numMonToShow: number;
  caughtMonIds: Uint16Array;
  numCaughtMon: number;
  unused: Uint16Array;
}

/** 1:1 `struct CreditsEntry` (credits.c:76). */
interface CreditsEntry {
  unk: number;
  isTitle: boolean;
  text: Uint8Array;
}

/** 1:1 (credits.c:83) */
let sUnkVar = 0;

// Never read, only set to 0

/** 1:1 (credits.c:84) */
let sSavedTaskId = 0;

/** 1:1 (credits.c:85). RAPATRIÉ dans hall_of_fame.ts (lot L) : GameClear écrit la valeur
 *  autoritative via SetHasHallOfFameRecords (miroir globalThis.__gHasHallOfFameRecords). Ce
 *  miroir local reste comme fallback ; le skip-B (CB2_Credits) lit le pont. */
export let gHasHallOfFameRecords = false;

/** 1:1 (credits.c:86) */
let sUsedSpeedUp = false;

// Never read

/** 1:1 (credits.c:87) */
let sCreditsData: CreditsData | null = [
  0,
];

// 1:1 credits.c:89 sCredits_Pal ← INCGFX_U16("graphics/credits/credits.pal"). Préchargé par
// preloadCreditsAssets() (clé 'sCredits_Pal') + lié tardivement dans _bindCreditsAssets().
let sCredits_Pal: any = null;

/** 1:1 (credits.c:122) */
const sBackgroundTemplates = [
  {
    bg: 0, /* :2 */
    charBaseIndex: 2, /* :2 */
    mapBaseIndex: 28, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 0, /* :2 */
    baseTile: 0, /* :10 */
  },
];

/** 1:1 (credits.c:134). ⚠ FIX artefact transpileur : `sWindowTemplates[]` est un ARRAY 1:1
 *  (décomp), pas un objet — le transpileur avait aplati les 2 éléments en propriétés (bug
 *  « arrays dim 1 »). InitWindows itère dessus → doit être un array. */
const sWindowTemplates = [
  {
    bg: 0,
    tilemapLeft: 0,
    tilemapTop: 9,
    width: DISPLAY_TILE_WIDTH,
    height: 12,
    paletteNum: 8,
    baseBlock: 1,
  },
  DUMMY_WIN_TEMPLATE,
];

/** 1:1 (credits.c:147) */
const sMonSpritePos: number[][] = [
  [
    104,
    36,
  ],
  [
    120,
    36,
  ],
  [
    136,
    36,
  ],
];

/** 1:1 `sAnim_Player_Slow` (credits.c:154-161) — tableau d'AnimCmd (forme saine, cf. starter_choose.ts:177). */
const sAnim_Player_Slow = [
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(64, 8),
  ANIMCMD_FRAME(128, 8),
  ANIMCMD_FRAME(192, 8),
  ANIMCMD_JUMP(0),
];

/** 1:1 `sAnim_Player_Fast` (credits.c:163-170). */
const sAnim_Player_Fast = [
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_FRAME(64, 4),
  ANIMCMD_FRAME(128, 4),
  ANIMCMD_FRAME(192, 4),
  ANIMCMD_JUMP(0),
];

/** 1:1 `sAnim_Player_LookBack` (credits.c:172-178). */
const sAnim_Player_LookBack = [
  ANIMCMD_FRAME(256, 4),
  ANIMCMD_FRAME(320, 4),
  ANIMCMD_FRAME(384, 4),
  ANIMCMD_END,
];

/** 1:1 `sAnim_Player_LookForward` (credits.c:180-187). */
const sAnim_Player_LookForward = [
  ANIMCMD_FRAME(384, 30),
  ANIMCMD_FRAME(320, 30),
  ANIMCMD_FRAME(256, 30),
  ANIMCMD_FRAME(256, 30),
  ANIMCMD_END,
];

/** 1:1 (credits.c:189) */
const sAnims_Player = [
  sAnim_Player_Slow,
  sAnim_Player_Fast,
  sAnim_Player_LookBack,
  sAnim_Player_LookForward,
];

/** 1:1 `sAnim_Rival_Slow` (credits.c:197-204). */
const sAnim_Rival_Slow = [
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_FRAME(64, 8),
  ANIMCMD_FRAME(128, 8),
  ANIMCMD_FRAME(192, 8),
  ANIMCMD_JUMP(0),
];

/** 1:1 `sAnim_Rival_Fast` (credits.c:206-213). */
const sAnim_Rival_Fast = [
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_FRAME(64, 4),
  ANIMCMD_FRAME(128, 4),
  ANIMCMD_FRAME(192, 4),
  ANIMCMD_JUMP(0),
];

/** 1:1 `sAnim_Rival_Still` (credits.c:215-219). */
const sAnim_Rival_Still = [
  ANIMCMD_FRAME(0, 4),
  ANIMCMD_END,
];

/** 1:1 (credits.c:221) */
const sAnims_Rival = [
  sAnim_Rival_Slow,
  sAnim_Rival_Fast,
  sAnim_Rival_Still,
];

const MONBG_OFFSET = (MON_PIC_SIZE * 3); // 1:1 credits.c:228

/** 1:1 (credits.c:229) */
const sSpriteSheet_MonBg = [
  {
    data: gDecompressionBuffer,
    size: MONBG_OFFSET,
    tag: TAG_MON_BG },
  [

  ],
];

/** 1:1 (credits.c:233) */
const sSpritePalette_MonBg = [
  {
    // 1:1 `(const u16 *)&gDecompressionBuffer[MONBG_OFFSET]` (credits.c:234) — VUE u16 (16 couleurs)
    // sur le buffer partagé à l'offset palette (MONBG_OFFSET pair). Task_LoadShowMons y écrit
    // temp[0..3] (MÊME région mémoire) avant LoadSpritePalette. `[MONBG_OFFSET]` scalaire = octet.
    data: new Uint16Array(gDecompressionBuffer.buffer, MONBG_OFFSET, 16),
    tag: TAG_MON_BG },
  [

  ],
];

/** 1:1 (credits.c:238) */
const sOamData_MonBg = {
  y: DISPLAY_HEIGHT, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  mosaic: 0, /* :1 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 0, /* :2 */
  /* SPRITE_SHAPE(64x64) */
  x: 0, /* :9 */
  matrixNum: 0, /* :5 */
  size: 3, /* :2 */
  /* SPRITE_SIZE(64x64) */
  tileNum: 0, /* :10 */
  priority: 1, /* :2 */
  paletteNum: 0, /* :4 */
  affineParam: 0 };

/** 1:1 `sAnim_MonBg_Yellow` (credits.c:255-259). */
const sAnim_MonBg_Yellow = [
  ANIMCMD_FRAME(0, 8),
  ANIMCMD_END,
];

/** 1:1 `sAnim_MonBg_Red` (credits.c:261-265). */
const sAnim_MonBg_Red = [
  ANIMCMD_FRAME(64, 8),
  ANIMCMD_END,
];

/** 1:1 `sAnim_MonBg_Blue` (credits.c:267-271). */
const sAnim_MonBg_Blue = [
  ANIMCMD_FRAME(128, 8),
  ANIMCMD_END,
];

/** 1:1 (credits.c:273) */
const sAnims_MonBg = [
  sAnim_MonBg_Yellow, // [POS_LEFT]
  sAnim_MonBg_Red, // [POS_CENTER]
  sAnim_MonBg_Blue, // [POS_RIGHT]
];

/** 1:1 (credits.c:280) */
const sSpriteTemplate_CreditsMonBg = {
  tileTag: TAG_MON_BG,
  paletteTag: TAG_MON_BG,
  oam: sOamData_MonBg,
  anims: sAnims_MonBg,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCB_CreditsMonBg };

/** 1:1 `static void VBlankCB_Credits(void)` (credits.c:291-296). */
function VBlankCB_Credits(): void {
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
}

/** 1:1 `static void CB2_Credits(void)` (credits.c:298-315). */
function CB2_Credits(): void {
  RunTasks();
  AnimateSprites();
  if ((JOY_HELD(B_BUTTON)) && (globalThis.__gHasHallOfFameRecords ?? gHasHallOfFameRecords) && gTasks[sSavedTaskId].func == Task_CreditsMain)
  {
    // Speed up credits
    VBlankCB_Credits();
    RunTasks();
    AnimateSprites();
    sUsedSpeedUp = true;
  }
  BuildOamBuffer();
  UpdatePaletteFade();
}

/** 1:1 `static void InitCreditsBgsAndWindows(void)` (credits.c:317-328). */
function InitCreditsBgsAndWindows(): void {
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sBackgroundTemplates, sBackgroundTemplates.length);
  SetBgTilemapBuffer(0, ({} as any) /* TRANSPILER-TODO AllocZeroed */);
  LoadPalette(sCredits_Pal, BG_PLTT_ID(8), 2 * PLTT_SIZE_4BPP);
  InitWindows(sWindowTemplates);
  DeactivateAllTextPrinters();
  PutWindowTilemap(0);
  CopyWindowToVram(0, COPYWIN_FULL);
  ShowBg(0);
}

/** 1:1 `static void FreeCreditsBgsAndWindows(void)` (credits.c:330-337). */
function FreeCreditsBgsAndWindows(): void {
  let ptr: any = null;
  FreeAllWindowBuffers();
  ptr = GetBgTilemapBuffer(0);
  if (ptr)
    void ptr /* Free — GC */;
}

/** 1:1 `static void PrintCreditsText(const u8 *string, u8 y, bool8 isTitle)` (credits.c:339-359). */
function PrintCreditsText(string: Uint8Array, y: number, isTitle: boolean): void {
  let x = 0;
  const color = new Uint8Array(3);
  color[0] = TEXT_COLOR_TRANSPARENT;
  if (isTitle == true)
  {
    color[1] = TEXT_COLOR_LIGHT_GRAY;
    color[2] = TEXT_COLOR_RED;
  }
  else
  {
    color[1] = TEXT_COLOR_WHITE;
    color[2] = TEXT_COLOR_DARK_GRAY;
  }
  x = GetStringCenterAlignXOffsetWithLetterSpacing(FONT_NORMAL, string, DISPLAY_WIDTH, 1);
  AddTextPrinterParameterized4(0, FONT_NORMAL, x, y, 1, 0, color, TEXT_SKIP_DRAW, string);
}

// #define tMainTaskId data[1]  (alias — expansé aux usages)

/** 1:1 `void CB2_StartCreditsSequence(void)` (credits.c:363-414). */
export function CB2_StartCreditsSequence(): void {
  let taskId = 0;
  let bikeTaskId = 0;
  let pageTaskId = 0;
  _bindCreditsAssets(); // lie les assets préchargés (assetCache) aux globals — AVANT tout LoadX sync
  _softResetRebootStarted = false;   // (re)armement du reboot post-FIN pour ce lancement de générique
  ResetGpuAndVram();
  SetVBlankCallback(null);
  InitHeap(gHeap, HEAP_SIZE);
  ResetPaletteFade();
  ResetTasks();
  InitCreditsBgsAndWindows();
  taskId = CreateTask((t: { taskId: number }) => Task_WaitPaletteFade(t.taskId), 0);
  gTasks[taskId].data[4] /* tEndCredits */ = false;
  gTasks[taskId].data[7] /* tSceneNum */ = SCENE_OCEAN_MORNING;
  gTasks[taskId].data[11] /* tNextMode */ = MODE_NONE;
  gTasks[taskId].data[13] /* tCurrentMode */ = MODE_BIKE_SCENE;
  while (true)
  {
    if (LoadBikeScene(SCENE_OCEAN_MORNING, taskId))
      break;
  }
  bikeTaskId = gTasks[taskId].data[1] /* tTaskId_BikeScene */;
  gTasks[bikeTaskId].data[0] /* tState */ = 40;
  SetGpuReg(REG_OFFSET_BG0VOFS, 0xFFFC);
  pageTaskId = CreateTask((t: { taskId: number }) => Task_UpdatePage(t.taskId), 0);
  gTasks[pageTaskId].data[1] /* tMainTaskId */ = taskId;
  gTasks[taskId].data[15] /* tTaskId_UpdatePage */ = pageTaskId;
  BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
  EnableInterrupts(INTR_FLAG_VBLANK);
  SetVBlankCallback(VBlankCB_Credits);
  m4aSongNumStart(MUS_CREDITS);
  SetMainCallback2(CB2_Credits);
  sUsedSpeedUp = false;
  // 1:1 credits.c:405 AllocZeroed(sizeof(struct CreditsData)) — struct réelle (typed arrays)
  // car DeterminePokemonToShow écrit caughtMonIds[]/monToShow[] (AllocZeroed du bridge rend {}).
  sCreditsData = {
    monToShow: new Uint16Array(NUM_MON_SLIDES),
    imgCounter: 0, nextImgPos: 0, currShownMon: 0, numMonToShow: 0,
    caughtMonIds: new Uint16Array(NATIONAL_DEX_COUNT),
    numCaughtMon: 0,
    unused: new Uint16Array(7),
  } as any;
  DeterminePokemonToShow();
  // Dette tracée (rapport AUDIT-GENERIQUE) : le décomp lit les pics du défilé depuis la ROM en
  // SYNCHRONE ; notre port les fetch async. Sans préchargement, CreateCreditsMonSprite SKIPPE les
  // mons pas encore en cache (garde ~:1586). On précharge ici — dès le début du générique, juste
  // après que DeterminePokemonToShow a rempli monToShow[] — TOUS les substrats mon-pic du défilé
  // (pattern preload HOF, hall_of_fame.ts:1153). Le skip hurlant reste le FILET pour tout retardataire.
  _preloadCreditsMonSubstrates();
  sCreditsData!.imgCounter = 0;
  sCreditsData!.nextImgPos = POS_LEFT;
  sCreditsData!.currShownMon = 0;
  sSavedTaskId = taskId;
}

/** 1:1 `static void Task_WaitPaletteFade(u8 taskId)` (credits.c:416-420).
 *  ADAPTATION runtime : `.func` = RÉFÉRENCE NUE Task_CreditsMain (pas d'arrow wrapper),
 *  pour que les 3 comparaisons d'identité `gTasks[x].func == Task_CreditsMain` (CB2_Credits,
 *  Task_UpdatePage case 2, Task_ShowMons case 2) fonctionnent 1:1 décomp. Le runtime appelle
 *  `func(taskObj)` (cf. decomp-runtime runTasks `t.func?.(t)`) → Task_CreditsMain normalise
 *  l'arg objet→taskId. Les autres tasks (jamais comparées) gardent les arrows du transpileur. */
function Task_WaitPaletteFade(taskId: number): void {
  if (!gPaletteFade.active)
    gTasks[taskId].func = Task_CreditsMain as any;
}

/** 1:1 `static void Task_CreditsMain(u8 taskId)` (credits.c:422-455). */
function Task_CreditsMain(taskId: any): void {
  // Le runtime appelle func(taskObj) ; les comparaisons d'identité exigent une réf nue
  // (cf. Task_WaitPaletteFade) → on normalise l'objet-task en son taskId ici.
  if (typeof taskId === 'object' && taskId !== null) taskId = taskId.taskId;
  let mode = 0;
  if (gTasks[taskId].data[4] /* tEndCredits */)
  {
    let bikeTaskId = gTasks[taskId].data[1] /* tTaskId_BikeScene */;
    gTasks[bikeTaskId].data[0] /* tState */ = 30;
    gTasks[taskId].data[12] /* tTheEndDelay */ = 256;
    gTasks[taskId].func = (t: { taskId: number }) => Task_CreditsTheEnd1(t.taskId);
    return;
  }
  sUnkVar = 0;
  mode = gTasks[taskId].data[11] /* tNextMode */;
  if (gTasks[taskId].data[11] /* tNextMode */ == MODE_BIKE_SCENE)
  {
    // Start a bike cutscene
    gTasks[taskId].data[13] /* tCurrentMode */ = mode;
    gTasks[taskId].data[11] /* tNextMode */ = MODE_NONE;
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
    gTasks[taskId].func = (t: { taskId: number }) => Task_ReadyBikeScene(t.taskId);
  }
  else if (gTasks[taskId].data[11] /* tNextMode */ == MODE_SHOW_MONS)
  {
    // Start a Pokémon interlude
    gTasks[taskId].data[13] /* tCurrentMode */ = mode;
    gTasks[taskId].data[11] /* tNextMode */ = MODE_NONE;
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
    gTasks[taskId].func = (t: { taskId: number }) => Task_ReadyShowMons(t.taskId);
  }
}

/** 1:1 `static void Task_ReadyBikeScene(u8 taskId)` (credits.c:457-465). */
function Task_ReadyBikeScene(taskId: number): void {
  if (!gPaletteFade.active)
  {
    SetGpuReg(REG_OFFSET_DISPCNT, 0);
    ResetCreditsTasks(taskId);
    gTasks[taskId].func = (t: { taskId: number }) => Task_SetBikeScene(t.taskId);
  }
}

/** 1:1 `static void Task_SetBikeScene(u8 taskId)` (credits.c:467-478). */
function Task_SetBikeScene(taskId: number): void {
  SetVBlankCallback(null);
  if (LoadBikeScene(gTasks[taskId].data[7] /* tSceneNum */, taskId))
  {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
    EnableInterrupts(INTR_FLAG_VBLANK);
    SetVBlankCallback(VBlankCB_Credits);
    gTasks[taskId].func = (t: { taskId: number }) => Task_WaitPaletteFade(t.taskId);
  }
}

/** 1:1 `static void Task_ReadyShowMons(u8 taskId)` (credits.c:480-488). */
function Task_ReadyShowMons(taskId: number): void {
  if (!gPaletteFade.active)
  {
    SetGpuReg(REG_OFFSET_DISPCNT, 0);
    ResetCreditsTasks(taskId);
    gTasks[taskId].func = (t: { taskId: number }) => Task_LoadShowMons(t.taskId);
  }
}

/** 1:1 `static void Task_LoadShowMons(u8 taskId)` (credits.c:490-552). */
function Task_LoadShowMons(taskId: number): void {
  switch (gMain.state) {
    default:
    case 0:
      {
        let i = 0;
        let temp: any = null;
        ResetSpriteData();
        ResetAllPicSprites();
        FreeAllSpritePalettes();
        (globalThis as any).gReservedSpritePaletteCount = 8;
        LZ77UnCompVram(gBirchBagGrass_Gfx, VRAM);
        LZ77UnCompVram(gBirchGrassTilemap, (BG_SCREEN_ADDR(7)));
        // 1:1 credits.c:506 — `gBirchBagGrass_Pal + 1` = offset d'1 u16 (skip couleur 0),
        // vers BG_PLTT_ID(0)+1 (skip slot 0). Pointer-arith palette → `.subarray(1)` (précédent
        // pokenav sPokenavBgDotsPal.subarray(7) / gPokenavOptions_Pal.subarray(...) — fix c9d56188f).
        // gBirchBagGrass_Pal est lié eager (Uint16Array) par _bindCreditsAssets() AVANT CB2 ;
        // s'il manque (null), HURLE et skip (Règle 3 — `.subarray` sur null = crash dur).
        if (gBirchBagGrass_Pal)
          LoadPalette(gBirchBagGrass_Pal.subarray(1), BG_PLTT_ID(0) + 1, PLTT_SIZEOF(2 * 16 - 1));
        else
          console.error('[credits] gBirchBagGrass_Pal absent — LoadPalette skip (preloadCreditsAssets() AVANT CB2 ?)');
        for (i = 0; i < MON_PIC_SIZE; i++)
          gDecompressionBuffer[i] = 0x11;
        // 1:1 credits.c:510-513 — `(gDecompressionBuffer + MON_PIC_SIZE)[i]` = écriture indexée
        // dans le MÊME buffer : remplit les 2e/3e copies du pic buffer (fonds mon-bg jaune/rouge/bleu,
        // MON_PIC_SIZE octets chacun). Pointer-arith → index `[MON_PIC_SIZE + i]` / `[MON_PIC_SIZE*2 + i]`.
        for (i = 0; i < MON_PIC_SIZE; i++)
          gDecompressionBuffer[MON_PIC_SIZE + i] = 0x22;
        for (i = 0; i < MON_PIC_SIZE; i++)
          gDecompressionBuffer[MON_PIC_SIZE * 2 + i] = 0x33;
        // 1:1 `temp = (u16 *)&gDecompressionBuffer[MONBG_OFFSET]` (credits.c:515) — VUE u16 sur le
        // MÊME buffer partagé (offset palette) que sSpritePalette_MonBg[0].data ; temp[0..3] écrit les
        // 4 couleurs mon-bg, relues par LoadSpritePalette. `[MONBG_OFFSET]` scalaire = octet (crash strict).
        temp = new Uint16Array(gDecompressionBuffer.buffer, MONBG_OFFSET, 16);
        temp[0] = RGB_BLACK;
        temp[1] = RGB(31, 31, 20);
        // light yellow
        temp[2] = RGB(31, 20, 20);
        // light red
        temp[3] = RGB(20, 20, 31);
        // light blue
        LoadSpriteSheet(sSpriteSheet_MonBg[0]);   // 1:1 credits.c:521 — décroissance array→&[0] (LoadSpriteSheet prend UN sheet, pas le tableau + terminateur {}).
        LoadSpritePalette(sSpritePalette_MonBg[0]); // 1:1 credits.c:522 — idem &[0] (sinon .data/.size undefined → NaN alloc / palette non chargée).
        gMain.state++;
        break;
      }
    case 1:
      gTasks[taskId].data[3] /* tTaskId_ShowMons */ = CreateTask((t: { taskId: number }) => Task_ShowMons(t.taskId), 0);
      gTasks[gTasks[taskId].data[3] /* tTaskId_ShowMons */].data[0] /* tState */ = 1;
      gTasks[gTasks[taskId].data[3] /* tTaskId_ShowMons */].data[1] /* tMainTaskId */ = taskId;
      gTasks[gTasks[taskId].data[3] /* tTaskId_ShowMons */].data[2] = gTasks[taskId].data[7] /* tSceneNum */;
      // data[2] never read
      BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      SetGpuReg(REG_OFFSET_BG3HOFS, 0);
      SetGpuReg(REG_OFFSET_BG3VOFS, 32);
      SetGpuReg(REG_OFFSET_BG3CNT, BGCNT_PRIORITY(3) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(7) | BGCNT_16COLOR | BGCNT_TXT256x256);
      SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG3_ON | DISPCNT_OBJ_ON);
      gMain.state = 0;
      (globalThis as any).gIntroCredits_MovingSceneryState = INTROCRED_SCENERY_NORMAL;
      gTasks[taskId].func = (t: { taskId: number }) => Task_WaitPaletteFade(t.taskId);
      break;
  }
}

/** 1:1 `static void Task_CreditsTheEnd1(u8 taskId)` (credits.c:554-564). */
function Task_CreditsTheEnd1(taskId: number): void {
  if (gTasks[taskId].data[12] /* tTheEndDelay */)
  {
    gTasks[taskId].data[12] /* tTheEndDelay */--;
    return;
  }
  BeginNormalPaletteFade(PALETTES_ALL, 12, 0, 16, RGB_BLACK);
  gTasks[taskId].func = (t: { taskId: number }) => Task_CreditsTheEnd2(t.taskId);
}

/** 1:1 `static void Task_CreditsTheEnd2(u8 taskId)` (credits.c:566-573). */
function Task_CreditsTheEnd2(taskId: number): void {
  if (!gPaletteFade.active)
  {
    ResetCreditsTasks(taskId);
    gTasks[taskId].func = (t: { taskId: number }) => Task_CreditsTheEnd3(t.taskId);
  }
}

// #define tDelay data[0]  (alias — expansé aux usages)

/** 1:1 `static void Task_CreditsTheEnd3(u8 taskId)` (credits.c:577-598). */
function Task_CreditsTheEnd3(taskId: number): void {
  ResetGpuAndVram();
  ResetPaletteFade();
  LoadTheEndScreen(0, 0x3800, BG_PLTT_ID(0));
  ResetSpriteData();
  FreeAllSpritePalettes();
  BeginNormalPaletteFade(PALETTES_ALL, 8, 16, 0, RGB_BLACK);
  SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(7) | BGCNT_16COLOR | BGCNT_TXT256x256);
  EnableInterrupts(INTR_FLAG_VBLANK);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON);
  gTasks[taskId].data[4] /* tDelay */ = 235;
  //set this to 215 to actually show "THE END" in time to the last song beat
  gTasks[taskId].func = (t: { taskId: number }) => Task_CreditsTheEnd4(t.taskId);
}

/** 1:1 `static void Task_CreditsTheEnd4(u8 taskId)` (credits.c:600-610). */
function Task_CreditsTheEnd4(taskId: number): void {
  if (gTasks[taskId].data[4] /* tDelay */)
  {
    gTasks[taskId].data[4] /* tDelay */--;
    return;
  }
  BeginNormalPaletteFade(PALETTES_ALL, 6, 0, 16, RGB_BLACK);
  gTasks[taskId].func = (t: { taskId: number }) => Task_CreditsTheEnd5(t.taskId);
}

/** 1:1 `static void Task_CreditsTheEnd5(u8 taskId)` (credits.c:612-622). */
function Task_CreditsTheEnd5(taskId: number): void {
  if (!gPaletteFade.active)
  {
    DrawTheEnd(0x3800, 0);
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0, RGB_BLACK);
    gTasks[taskId].data[4] /* tDelay */ = 7200;
    gTasks[taskId].func = (t: { taskId: number }) => Task_CreditsTheEnd6(t.taskId);
  }
}

/** 1:1 `static void Task_CreditsTheEnd6(u8 taskId)` (credits.c:624-644). */
function Task_CreditsTheEnd6(taskId: number): void {
  if (!gPaletteFade.active)
  {
    if (gTasks[taskId].data[4] /* tDelay */ == 0 || gMain.newKeys)
    {
      FadeOutBGM(4);
      BeginNormalPaletteFade(PALETTES_ALL, 8, 0, 16, RGB_WHITEALPHA);
      gTasks[taskId].func = (t: { taskId: number }) => Task_CreditsSoftReset(t.taskId);
      return;
    }
    if (gTasks[taskId].data[4] /* tDelay */ == 7144)
      FadeOutBGM(8);
    if (gTasks[taskId].data[4] /* tDelay */ == 6840)
      m4aSongNumStart(MUS_END);
    gTasks[taskId].data[4] /* tDelay */--;
  }
}

// Garde : Task_CreditsSoftReset tourne CHAQUE frame ; on ne doit amorcer le reboot
// (import dynamique async) qu'UNE fois. Remis à false au (re)lancement du générique.
let _softResetRebootStarted = false;

/** 1:1 `static void Task_CreditsSoftReset(u8 taskId)` (credits.c:648-652). */
function Task_CreditsSoftReset(taskId: number): void {
  void taskId;
  if (!gPaletteFade.active) {
    if (_softResetRebootStarted) return;
    _softResetRebootStarted = true;

    // ── Nettoyage 1:1 du reboot que DoSoftReset(RESET_ALL) fournissait ──────────────
    // Le vrai SoftReset REBOOTE la GBA : RegisterRamReset zéroie TOUTE la VRAM/OAM/palette RAM
    // (backdrop color 0 INCLUS) + gMain AVANT que AgbMain ne relance copyright→intro→titre. Notre
    // web ne reboote pas la ROM → on reproduit ce RAM-reset à la main AVANT de ré-amorcer le boot,
    // sinon l'état résiduel du générique (tilemap « FIN », palettes, tasks/sprites) fuit dans les
    // écrans suivants. ResetGpuAndVram éteint DISPCNT + clear VRAM/OAM/PLTT (il skippe PLTT[0],
    // `PLTT + 2` convention décomp) → on zéroie le backdrop en plus. `gMain.state = 0` = le champ
    // que RegisterRamReset zéroie et dont CB2_InitCopyrightScreenAfterBootup a besoin pour entrer
    // en state 0 (sinon fall-through au default → copyright non initialisé).
    // Cf. mémoire hardware-non-1to1-exemptions (SoftReset = exemption matérielle).
    ResetGpuAndVram();
    DmaFill16(3, 0, PLTT, 2);            // backdrop color 0 (le reboot le zéroait ; sinon fond résiduel)
    ResetPaletteFade();
    ResetSpriteData();
    FreeAllSpritePalettes();
    FreeAllWindowBuffers();
    ResetBgsAndClearDma3BusyFlags(0);
    gMain.state = 0;                     // reboot zéroie gMain → CB2_InitCopyrightScreenAfterBootup entre en state 0

    SoftReset(RESET_ALL);   // 1:1 conservé : LOG l'exemption matérielle (reset BIOS no-op web).
    // REBOOT 1:1 : SoftReset(RESET_ALL) = reboot BIOS → AgbMain → CB2_InitCopyrightScreenAfterBootup.
    // Sur web on rejoue L'AMORCE DU BOOT INITIAL — exactement ce que le host (TestOverworldScene.create,
    // introMode) fait au power-on : registerIntroSpriteCallbacks(rt) + bootIntroSequence(rt) [= preloads
    // async intro/titre/Birch AVANT le CB2, puis SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)].
    // → copyright → intro → titre, chaîne 1:1 identique au démarrage du jeu (plus de saut « bricolé »
    // direct à l'écran-titre qui masquait l'état sale). Import DYNAMIQUE (anti-bombe TDZ du graphe
    // credits, cf. StartCredits/hall_of_fame). bootIntroSequence est idempotent (assets cachés) :
    // no-op rapide dans le flux réel (boot→…→générique), preload complet en lancement direct (?debug).
    void (async () => {
      try {
        const rt = getRuntime();
        const introHost = await import('../harness/boot/intro-host');
        introHost.registerIntroSpriteCallbacks(rt);   // idempotent (rt.spriteCallbacks Map)
        await introHost.bootIntroSequence(rt);        // preloads + SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)
      } catch (e) {
        console.error('[credits] reboot post-FIN (SoftReset = exemption hardware web)', e);
      }
    })();
  }
}

/** 1:1 `static void ResetGpuAndVram(void)` (credits.c:654-674). */
function ResetGpuAndVram(): void {
  SetGpuReg(REG_OFFSET_DISPCNT, 0);
  SetGpuReg(REG_OFFSET_BG3HOFS, 0);
  SetGpuReg(REG_OFFSET_BG3VOFS, 0);
  SetGpuReg(REG_OFFSET_BG2HOFS, 0);
  SetGpuReg(REG_OFFSET_BG2VOFS, 0);
  SetGpuReg(REG_OFFSET_BG1HOFS, 0);
  SetGpuReg(REG_OFFSET_BG1VOFS, 0);
  SetGpuReg(REG_OFFSET_BG0HOFS, 0);
  SetGpuReg(REG_OFFSET_BG0VOFS, 0);
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
  SetGpuReg(REG_OFFSET_BLDALPHA, 0);
  SetGpuReg(REG_OFFSET_BLDY, 0);
  DmaFill16(3, 0, VRAM, VRAM_SIZE);
  DmaFill32(3, 0, OAM, OAM_SIZE);
  DmaFill16(3, 0, (PLTT + 2), PLTT_SIZE - 2);
}

// #define tCurrentPage data[2]  (alias — expansé aux usages)

// #define tDelay data[3]  (alias — expansé aux usages)

/** 1:1 `static void Task_UpdatePage(u8 taskId)` (credits.c:679-779). */
function Task_UpdatePage(taskId: number): void {
  let i = 0;
  switch (gTasks[taskId].data[0] /* tState */) {
    case 0:
    case 6:
    case 7:
    case 8:
    case 9:
    default:
      if (!gPaletteFade.active)
      {
        gTasks[taskId].data[0] /* tState */ = 1;
        gTasks[taskId].data[4] /* tDelay */ = 72;
        gTasks[gTasks[taskId].data[1] /* tMainTaskId */].data[14] /* tPrintedPage */ = false;
        sUnkVar = 0;
      }
      return;
    case 1:
      if (gTasks[taskId].data[4] /* tDelay */ != 0)
      {
        gTasks[taskId].data[4] /* tDelay */--;
        return;
      }
      gTasks[taskId].data[0] /* tState */++;
      return;
    case 2:
      if (gTasks[gTasks[taskId].data[1] /* tMainTaskId */].func == Task_CreditsMain)
      {
        if (gTasks[taskId].data[2] /* tCurrentPage */ < PAGE_COUNT)
        {
          // Print text for this Credits page
          for (i = 0; i < ENTRIES_PER_PAGE; i++)
            PrintCreditsText(sCreditsEntryPointerTable[gTasks[taskId].data[2] /* tCurrentPage */][i].text, 5 + i * 16, sCreditsEntryPointerTable[gTasks[taskId].data[2] /* tCurrentPage */][i].isTitle);
          CopyWindowToVram(0, COPYWIN_GFX);
          gTasks[taskId].data[2] /* tCurrentPage */++;
          gTasks[taskId].data[0] /* tState */++;
          gTasks[gTasks[taskId].data[1] /* tMainTaskId */].data[14] /* tPrintedPage */ = true;
          if (gTasks[gTasks[taskId].data[1] /* tMainTaskId */].data[13] /* tCurrentMode */ == MODE_BIKE_SCENE)
            BeginNormalPaletteFade(0x300, 0, 16, 0, COLOR_LIGHT_GREEN);
          else
            // MODE_SHOW_MONS
            // FIX transpile : le `BeginNormalPaletteFade(…COLOR_DARK_GREEN)` de cette branche else
            // (1:1 credits.c:544) avait été LARGUÉ → le `return` unconditionnel qui suivait était
            // absorbé comme corps du `else`, donc en MODE_BIKE_SCENE (mode de départ) le flux
            // retombait sur `tState = 10` (fin) APRÈS chaque page → générique coupé dès la page 0.
            BeginNormalPaletteFade(0x300, 0, 16, 0, COLOR_DARK_GREEN);
          return;
        }
        // Reached final page of Credits, end task
        gTasks[taskId].data[0] /* tState */ = 10;
        return;
      }
      gTasks[gTasks[taskId].data[1] /* tMainTaskId */].data[14] /* tPrintedPage */ = false;
      return;
    case 3:
      if (!gPaletteFade.active)
      {
        gTasks[taskId].data[4] /* tDelay */ = 121;
        //!< French Difference
        gTasks[taskId].data[0] /* tState */++;
      }
      return;
    case 4:
      if (gTasks[taskId].data[4] /* tDelay */ != 0)
      {
        gTasks[taskId].data[4] /* tDelay */--;
        return;
      }
      if (CheckChangeScene((gTasks[taskId].data[2] /* tCurrentPage */ & 0xFF), (gTasks[taskId].data[1] /* tMainTaskId */ & 0xFF)))
      {
        gTasks[taskId].data[0] /* tState */++;
        return;
      }
      gTasks[taskId].data[0] /* tState */++;
      if (gTasks[gTasks[taskId].data[1] /* tMainTaskId */].data[13] /* tCurrentMode */ == MODE_BIKE_SCENE)
        BeginNormalPaletteFade(0x300, 0, 0, 16, COLOR_LIGHT_GREEN);
      else
        // MODE_SHOW_MONS
        // FIX transpile (même largage 1:1 credits.c:825) : sans cette ligne, le `return` était
        // absorbé par le `else` → fall-through dans case 5 en MODE_BIKE_SCENE (non 1:1).
        BeginNormalPaletteFade(0x300, 0, 0, 16, COLOR_DARK_GREEN);
      return;
    case 5:
      if (!gPaletteFade.active)
      {
        // Still more Credits pages to show, return to state 2 to print
        FillWindowPixelBuffer(0, PIXEL_FILL(0));
        CopyWindowToVram(0, COPYWIN_GFX);
        gTasks[taskId].data[0] /* tState */ = 2;
      }
      return;
    case 10:
      gTasks[gTasks[taskId].data[1] /* tMainTaskId */].data[4] /* tEndCredits */ = true;
      DestroyTask(taskId);
      FreeCreditsBgsAndWindows();
      sCreditsData = null /* FREE_AND_SET_NULL — GC */;
      return;
  }
}

// 1:1 credits.c:783 — `PAGE_COUNT / 9` = division ENTIÈRE C (55/9 = 6, PAS 6.111). En JS `/`
// rend un float → `page == PAGE_INTERVAL * N` (CheckChangeScene) ne serait JAMAIS vrai (page = int)
// et AUCUN changement de scène ne se déclencherait. Math.trunc restaure la sémantique C.
const PAGE_INTERVAL = Math.trunc(PAGE_COUNT / 9); // 9 scenes (5 bike scenes, 4 Pokémon interludes)

/** 1:1 `static u8 CheckChangeScene(u8 page, u8 taskId)` (credits.c:785-848). */
function CheckChangeScene(page: number, taskId: number): number {
  // Starts with bike + ocean + morning (SCENE_OCEAN_MORNING)
  if (page == PAGE_INTERVAL * 1)
  {
    // Pokémon interlude
    gTasks[taskId].data[11] /* tNextMode */ = MODE_SHOW_MONS;
  }
  if (page == PAGE_INTERVAL * 2)
  {
    // Bike + ocean + sunset
    gTasks[taskId].data[7] /* tSceneNum */ = SCENE_OCEAN_SUNSET;
    gTasks[taskId].data[11] /* tNextMode */ = MODE_BIKE_SCENE;
  }
  if (page == PAGE_INTERVAL * 3)
  {
    // Pokémon interlude
    gTasks[taskId].data[11] /* tNextMode */ = MODE_SHOW_MONS;
  }
  if (page == PAGE_INTERVAL * 4)
  {
    // Bike + forest + sunset
    gTasks[taskId].data[7] /* tSceneNum */ = SCENE_FOREST_RIVAL_ARRIVE;
    gTasks[taskId].data[11] /* tNextMode */ = MODE_BIKE_SCENE;
  }
  if (page == PAGE_INTERVAL * 5)
  {
    // Pokémon interlude
    gTasks[taskId].data[11] /* tNextMode */ = MODE_SHOW_MONS;
  }
  if (page == PAGE_INTERVAL * 6)
  {
    // Bike + forest + sunset
    gTasks[taskId].data[7] /* tSceneNum */ = SCENE_FOREST_CATCH_RIVAL;
    gTasks[taskId].data[11] /* tNextMode */ = MODE_BIKE_SCENE;
  }
  if (page == PAGE_INTERVAL * 7)
  {
    // Pokémon interlude
    gTasks[taskId].data[11] /* tNextMode */ = MODE_SHOW_MONS;
  }
  if (page == PAGE_INTERVAL * 8)
  {
    // Bike + town + night
    gTasks[taskId].data[7] /* tSceneNum */ = SCENE_CITY_NIGHT;
    gTasks[taskId].data[11] /* tNextMode */ = MODE_BIKE_SCENE;
  }
  if (gTasks[taskId].data[11] /* tNextMode */ != MODE_NONE)
  {
    // Returns true if changed
    return true;
  }
  return false;
}

// #define tDelay data[3]  (alias — expansé aux usages)

/** 1:1 `static void Task_ShowMons(u8 taskId)` (credits.c:852-899). */
function Task_ShowMons(taskId: number): void {
  let spriteId = 0;
  switch (gTasks[taskId].data[0] /* tState */) {
    case 0:
      break;
    case 1:
      if (sCreditsData!.nextImgPos == POS_LEFT && gTasks[gTasks[taskId].data[1] /* tMainTaskId */].data[14] /* tPrintedPage */ == 0)
        break;
      gTasks[taskId].data[0] /* tState */++;
      break;
    case 2:
      if (sCreditsData!.imgCounter == NUM_MON_SLIDES || gTasks[gTasks[taskId].data[1] /* tMainTaskId */].func != Task_CreditsMain)
        break;
      spriteId = CreateCreditsMonSprite(sCreditsData!.monToShow[sCreditsData!.currShownMon], sMonSpritePos[sCreditsData!.nextImgPos][0], sMonSpritePos[sCreditsData!.nextImgPos][1], sCreditsData!.nextImgPos);
      // Garde `spriteId` valide (CreateCreditsMonSprite rend 0xFFFF si substrat mon-pic absent —
      // cf. skip gracieux ci-dessus) : sinon `gSprites[0xFFFF].data[3]` throw → gel. NO-OP nominal.
      if (sCreditsData!.currShownMon < sCreditsData!.numMonToShow - 1)
      {
        sCreditsData!.currShownMon++;
        if (spriteId !== 0xFFFF && gSprites[spriteId])
          gSprites[spriteId].data[3] = 52;
        //!< French Difference
      }
      else
      {
        sCreditsData!.currShownMon = 0;
        if (spriteId !== 0xFFFF && gSprites[spriteId])
          gSprites[spriteId].data[3] = 512;
      }
      sCreditsData!.imgCounter++;
      if (sCreditsData!.nextImgPos == POS_RIGHT)
        sCreditsData!.nextImgPos = POS_LEFT;
      else
        sCreditsData!.nextImgPos++;
      gTasks[taskId].data[4] /* tDelay */ = 52;
      //!< French Difference
      gTasks[taskId].data[0] /* tState */++;
      break;
    case 3:
      if (gTasks[taskId].data[4] /* tDelay */ != 0)
        gTasks[taskId].data[4] /* tDelay */--;
      else
        gTasks[taskId].data[0] /* tState */ = 1;
      break;
  }
}

// #define tPlayer data[2]  (alias — expansé aux usages)

// #define tRival data[3]  (alias — expansé aux usages)

// #define tDelay data[4]  (alias — expansé aux usages)

// #define tSinIdx data[5]  (alias — expansé aux usages)

/** 1:1 `static void Task_BikeScene(u8 taskId)` (credits.c:909-990). */
function Task_BikeScene(taskId: number): void {
  switch (gTasks[taskId].data[0] /* tState */) {
    case 0:
      (globalThis as any).gIntroCredits_MovingSceneryVOffset = Sin((gTasks[taskId].data[5] /* tSinIdx */ >> 1) & 0x7F, 12);
      gTasks[taskId].data[5] /* tSinIdx */++;
      break;
    case 1:
      if (gIntroCredits_MovingSceneryVOffset != 0)
      {
        (globalThis as any).gIntroCredits_MovingSceneryVOffset = Sin((gTasks[taskId].data[5] /* tSinIdx */ >> 1) & 0x7F, 12);
        gTasks[taskId].data[5] /* tSinIdx */++;
      }
      else
      {
        gSprites[gTasks[taskId].data[2] /* tPlayer */].data[0] = 2;
        gTasks[taskId].data[5] /* tSinIdx */ = 0;
        gTasks[taskId].data[0] /* tState */++;
      }
      break;
    case 2:
      if (gTasks[taskId].data[5] /* tSinIdx */ < 64)
      {
        gTasks[taskId].data[5] /* tSinIdx */++;
        (globalThis as any).gIntroCredits_MovingSceneryVOffset = Sin(gTasks[taskId].data[5] /* tSinIdx */ & 0x7F, 20);
      }
      else
      {
        gTasks[taskId].data[0] /* tState */++;
      }
      break;
    case 3:
      gSprites[gTasks[taskId].data[2] /* tPlayer */].data[0] = 3;
      gSprites[gTasks[taskId].data[3] /* tRival */].data[0] = 1;
      gTasks[taskId].data[4] /* tDelay */ = 120;
      gTasks[taskId].data[0] /* tState */++;
      break;
    case 4:
      if (gTasks[taskId].data[4] /* tDelay */ != 0)
      {
        gTasks[taskId].data[4] /* tDelay */--;
      }
      else
      {
        gTasks[taskId].data[5] /* tSinIdx */ = 64;
        gTasks[taskId].data[0] /* tState */++;
      }
      break;
    case 5:
      if (gTasks[taskId].data[5] /* tSinIdx */ > 0)
      {
        gTasks[taskId].data[5] /* tSinIdx */--;
        (globalThis as any).gIntroCredits_MovingSceneryVOffset = Sin(gTasks[taskId].data[5] /* tSinIdx */ & 0x7F, 20);
      }
      else
      {
        gSprites[gTasks[taskId].data[2] /* tPlayer */].data[0] = 1;
        gTasks[taskId].data[0] /* tState */++;
      }
      break;
    case 6:
      gTasks[taskId].data[0] /* tState */ = 50;
      break;
    case 10:
      gSprites[gTasks[taskId].data[3] /* tRival */].data[0] = 2;
      gTasks[taskId].data[0] /* tState */ = 50;
      break;
    case 20:
      gSprites[gTasks[taskId].data[2] /* tPlayer */].data[0] = 4;
      gTasks[taskId].data[0] /* tState */ = 50;
      break;
    case 30:
      gSprites[gTasks[taskId].data[2] /* tPlayer */].data[0] = 5;
      gSprites[gTasks[taskId].data[3] /* tRival */].data[0] = 3;
      gTasks[taskId].data[0] /* tState */ = 50;
      break;
    case 50:
      gTasks[taskId].data[0] /* tState */ = 0;
      break;
  }
}

const TIMER_STOP = 0x7FFF; // 1:1 credits.c:992

// #define tTimer data[1]  (alias — expansé aux usages)

// #define tMainTaskId data[2]  (alias — expansé aux usages)

/** 1:1 `static void Task_CycleSceneryPalette(u8 taskId)` (credits.c:996-1051). */
function Task_CycleSceneryPalette(taskId: number): void {
  let bikeTaskId = 0;
  switch (gTasks[taskId].data[0] /* tState */) {
    default:
    case SCENE_OCEAN_MORNING:
      if (gTasks[taskId].data[1] /* tTimer */ != TIMER_STOP)
      {
        if (gTasks[gTasks[gTasks[taskId].data[2] /* tMainTaskId */].data[15] /* tTaskId_UpdatePage */].data[2] /* tCurrentPage */ == 2)
        {
          gTasks[gTasks[gTasks[taskId].data[2] /* tMainTaskId */].data[1] /* tTaskId_BikeScene */].data[0] /* tState */ = 20;
          gTasks[taskId].data[1] /* tTimer */ = TIMER_STOP;
        }
      }
      CycleSceneryPalette(0);
      break;
    case SCENE_OCEAN_SUNSET:
      CycleSceneryPalette(0);
      break;
    case SCENE_FOREST_RIVAL_ARRIVE:
      if (gTasks[taskId].data[1] /* tTimer */ != TIMER_STOP)
      {
        bikeTaskId = gTasks[gTasks[taskId].data[2] /* tMainTaskId */].data[1] /* tTaskId_BikeScene */;
        // Floor to multiple of 128
        if ((gTasks[bikeTaskId].data[5] /* tSinIdx */ & -128) == 640)
        {
          gTasks[bikeTaskId].data[0] /* tState */ = 1;
          gTasks[taskId].data[1] /* tTimer */ = TIMER_STOP;
        }
      }
      CycleSceneryPalette(1);
      break;
    case SCENE_FOREST_CATCH_RIVAL:
      if (gTasks[taskId].data[1] /* tTimer */ != TIMER_STOP)
      {
        if (gTasks[taskId].data[1] /* tTimer */ == 620)
        {
          gTasks[gTasks[gTasks[taskId].data[2] /* tMainTaskId */].data[1] /* tTaskId_BikeScene */].data[0] /* tState */ = 10;
          gTasks[taskId].data[1] /* tTimer */ = TIMER_STOP;
        }
        else
        {
          gTasks[taskId].data[1] /* tTimer */++;
        }
      }
      CycleSceneryPalette(1);
      break;
    case SCENE_CITY_NIGHT:
      CycleSceneryPalette(2);
      break;
  }
}

/** 1:1 `static void SetBikeScene(u8 scene, u8 taskId)` (credits.c:1053-1128). */
function SetBikeScene(scene: number, taskId: number): void {
  switch (scene) {
    case SCENE_OCEAN_MORNING:
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].x = DISPLAY_WIDTH + 32;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].x = DISPLAY_WIDTH + 32;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].data[0] = 0;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].data[0] = 0;
      gTasks[taskId].data[0] /* tTaskId_BgScenery */ = CreateBicycleBgAnimationTask(0, 0x2000, 0x20, 8);
      break;
    case SCENE_OCEAN_SUNSET:
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].x = 120;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].x = DISPLAY_WIDTH + 32;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].data[0] = 0;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].data[0] = 0;
      gTasks[taskId].data[0] /* tTaskId_BgScenery */ = CreateBicycleBgAnimationTask(0, 0x2000, 0x20, 8);
      break;
    case SCENE_FOREST_RIVAL_ARRIVE:
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].x = 120;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].x = DISPLAY_WIDTH + 32;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].data[0] = 0;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].data[0] = 0;
      gTasks[taskId].data[0] /* tTaskId_BgScenery */ = CreateBicycleBgAnimationTask(1, 0x2000, 0x200, 8);
      break;
    case SCENE_FOREST_CATCH_RIVAL:
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].x = 120;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].x = -32;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].data[0] = 0;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].data[0] = 0;
      gTasks[taskId].data[0] /* tTaskId_BgScenery */ = CreateBicycleBgAnimationTask(1, 0x2000, 0x200, 8);
      break;
    case SCENE_CITY_NIGHT:
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].invisible = false;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].x = 88;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].x = 152;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].y = 46;
      gSprites[gTasks[taskId].data[5] /* tPlayerSpriteId */].data[0] = 0;
      gSprites[gTasks[taskId].data[6] /* tRivalSpriteId */].data[0] = 0;
      gTasks[taskId].data[0] /* tTaskId_BgScenery */ = CreateBicycleBgAnimationTask(2, 0x2000, 0x200, 8);
      break;
  }
  gTasks[taskId].data[2] /* tTaskId_SceneryPal */ = CreateTask((t: { taskId: number }) => Task_CycleSceneryPalette(t.taskId), 0);
  gTasks[gTasks[taskId].data[2] /* tTaskId_SceneryPal */].data[0] /* tState */ = scene;
  gTasks[gTasks[taskId].data[2] /* tTaskId_SceneryPal */].data[1] /* tTimer */ = 0;
  gTasks[gTasks[taskId].data[2] /* tTaskId_SceneryPal */].data[2] /* tMainTaskId */ = taskId;
  gTasks[taskId].data[1] /* tTaskId_BikeScene */ = CreateTask((t: { taskId: number }) => Task_BikeScene(t.taskId), 0);
  gTasks[gTasks[taskId].data[1] /* tTaskId_BikeScene */].data[0] /* tState */ = 0;
  gTasks[gTasks[taskId].data[1] /* tTaskId_BikeScene */].data[1] = taskId;
  // data[1] is never read
  gTasks[gTasks[taskId].data[1] /* tTaskId_BikeScene */].data[2] /* tPlayer */ = gTasks[taskId].data[5] /* tPlayerSpriteId */;
  gTasks[gTasks[taskId].data[1] /* tTaskId_BikeScene */].data[3] /* tRival */ = gTasks[taskId].data[6] /* tRivalSpriteId */;
  gTasks[gTasks[taskId].data[1] /* tTaskId_BikeScene */].data[4] /* tDelay */ = 0;
  if (scene == SCENE_FOREST_RIVAL_ARRIVE)
    gTasks[gTasks[taskId].data[1] /* tTaskId_BikeScene */].data[5] /* tSinIdx */ = 69;
}

/** 1:1 `static bool8 LoadBikeScene(u8 scene, u8 taskId)` (credits.c:1136-1207). */
function LoadBikeScene(scene: number, taskId: number): boolean {
  let spriteId = 0;
  switch (gMain.state) {
    default:
    case 0:
      SetGpuReg(REG_OFFSET_DISPCNT, 0);
      SetGpuReg(REG_OFFSET_BG3HOFS, 8);
      SetGpuReg(REG_OFFSET_BG3VOFS, 0);
      SetGpuReg(REG_OFFSET_BG2HOFS, 0);
      SetGpuReg(REG_OFFSET_BG2VOFS, 0);
      SetGpuReg(REG_OFFSET_BG1HOFS, 0);
      SetGpuReg(REG_OFFSET_BG1VOFS, 0);
      SetGpuReg(REG_OFFSET_BLDCNT, 0);
      SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      ResetSpriteData();
      FreeAllSpritePalettes();
      gMain.state = 1;
      break;
    case 1:
      (globalThis as any).gIntroCredits_MovingSceneryVBase = 34;
      (globalThis as any).gIntroCredits_MovingSceneryVOffset = 0;
      LoadCreditsSceneGraphics(scene);
      gMain.state++;
      break;
    case 2:
      if (gSaveBlock2Ptr.playerGender == MALE)
      {
        LoadCompressedSpriteSheet(gSpriteSheet_CreditsBrendan);
        LoadCompressedSpriteSheet(gSpriteSheet_CreditsRivalMay);
        LoadCompressedSpriteSheet(gSpriteSheet_CreditsBicycle);
        LoadSpritePalettes(gSpritePalettes_Credits);
        spriteId = CreateIntroBrendanSprite(120, 46);
        gTasks[taskId].data[5] /* tPlayerSpriteId */ = spriteId;
        gSprites[spriteId].callback = SpriteCB_Player;
        gSprites[spriteId].anims = sAnims_Player;
        spriteId = CreateIntroMaySprite(DISPLAY_WIDTH + 32, 46);
        gTasks[taskId].data[6] /* tRivalSpriteId */ = spriteId;
        gSprites[spriteId].callback = SpriteCB_Rival;
        gSprites[spriteId].anims = sAnims_Rival;
      }
      else
      {
        LoadCompressedSpriteSheet(gSpriteSheet_CreditsMay);
        LoadCompressedSpriteSheet(gSpriteSheet_CreditsRivalBrendan);
        LoadCompressedSpriteSheet(gSpriteSheet_CreditsBicycle);
        LoadSpritePalettes(gSpritePalettes_Credits);
        spriteId = CreateIntroMaySprite(120, 46);
        gTasks[taskId].data[5] /* tPlayerSpriteId */ = spriteId;
        gSprites[spriteId].callback = SpriteCB_Player;
        gSprites[spriteId].anims = sAnims_Player;
        spriteId = CreateIntroBrendanSprite(DISPLAY_WIDTH + 32, 46);
        gTasks[taskId].data[6] /* tRivalSpriteId */ = spriteId;
        gSprites[spriteId].callback = SpriteCB_Rival;
        gSprites[spriteId].anims = sAnims_Rival;
      }
      ;
      gMain.state++;
      break;
    case 3:
      SetBikeScene(scene, taskId);
      SetCreditsSceneBgCnt(scene);
      gMain.state = 0;
      return true;
  }
  return false;
}

/** 1:1 `static void ResetCreditsTasks(u8 taskId)` (credits.c:1209-1240). */
function ResetCreditsTasks(taskId: number): void {
  // Destroy Task_BicycleBgAnimation, if running
  if (gTasks[taskId].data[0] /* tTaskId_BgScenery */ != 0)
  {
    DestroyTask(gTasks[taskId].data[0] /* tTaskId_BgScenery */);
    gTasks[taskId].data[0] /* tTaskId_BgScenery */ = 0;
  }
  // Destroy Task_BikeScene, if running
  if (gTasks[taskId].data[1] /* tTaskId_BikeScene */ != 0)
  {
    DestroyTask(gTasks[taskId].data[1] /* tTaskId_BikeScene */);
    gTasks[taskId].data[1] /* tTaskId_BikeScene */ = 0;
  }
  // Destroy Task_CycleSceneryPalette, if running
  if (gTasks[taskId].data[2] /* tTaskId_SceneryPal */ != 0)
  {
    DestroyTask(gTasks[taskId].data[2] /* tTaskId_SceneryPal */);
    gTasks[taskId].data[2] /* tTaskId_SceneryPal */ = 0;
  }
  // Destroy Task_ShowMons, if running
  if (gTasks[taskId].data[3] /* tTaskId_ShowMons */ != 0)
  {
    DestroyTask(gTasks[taskId].data[3] /* tTaskId_ShowMons */);
    gTasks[taskId].data[3] /* tTaskId_ShowMons */ = 0;
  }
  (globalThis as any).gIntroCredits_MovingSceneryState = INTROCRED_SCENERY_DESTROY;
}

/** 1:1 `static void LoadTheEndScreen(u16 tileOffsetLoad, u16 tileOffsetWrite, u16 palOffset)` (credits.c:1242-1254). */
function LoadTheEndScreen(tileOffsetLoad: number, tileOffsetWrite: number, palOffset: number): void {
  let baseTile = 0;
  LZ77UnCompVram(gCreditsCopyrightEnd_Gfx, (VRAM + tileOffsetLoad));
  LoadPalette(gIntroCopyright_Pal, palOffset, gIntroCopyright_Pal.byteLength); // 1:1 sizeof(gIntroCopyright_Pal) = OCTETS (Uint16Array → byteLength=32, précédent hall_of_fame.ts:787). `.length`=16 chargeait la MOITIÉ (LoadPalette fait floor(size/2) entrées).
  baseTile = (Math.trunc(palOffset / 16)) << 12;
  // 1:1 credits.c:1252-1253 (French Difference) : la boucle `((u16*)(VRAM+tileOffsetWrite))[i] = baseTile`
  // remplit 32×32 entrées u16 du tilemap avec la CONSTANTE baseTile. VRAM = adresse NUMÉRIQUE en JS
  // (indexer un number n'écrit rien) → DmaFill16, primitive u16 canonique du moteur, déjà utilisée par
  // ResetGpuAndVram ci-dessus. 32×32 u16 = 0x800 octets. Écriture d'une constante = fill exact 1:1.
  DmaFill16(3, baseTile, VRAM + tileOffsetWrite, 32 * 32 * 2);
}

/**
 * French Difference
 * 
 * The following functions do not exist
 * in FR
*/

/*
static u16 GetLetterMapTile(u8 baseTiles)
{
    u16 out = (baseTiles & 0x3F) + 80;

    if (baseTiles == 0xFF)
        return 1;

    if (baseTiles & (1 << 7))
        out |= 1 << 11;
    if (baseTiles & (1 << 6))
        out |= 1 << 10;

    return out;
}

static void DrawLetterMapTiles(const u8 baseTiles[], u8 baseX, u8 baseY, u16 offset, u16 palette)
{
    u8 y, x;
    const u16 tileOffset = (palette / 16) << 12;

    for (y = 0; y < 5; y++)
    {
        for (x = 0; x < 3; x++)
            ((u16 *) (VRAM + offset + (baseY + y) * 64))[baseX + x] = tileOffset + GetLetterMapTile(baseTiles[y * 3 + x]);
    }
}
*/

/**
 * French Difference
*/

/** 1:1 `static void DrawTheEnd(u16 offset, u16 palette)` (credits.c:1294-1297). */
function DrawTheEnd(offset: number, palette: number): void {
  LZ77UnCompVram(gCreditsCopyrightEnd_Tilemap, ((VRAM + offset)));
}

// #define sState data[0]  (alias — expansé aux usages)

/** 1:1 `static void SpriteCB_Player(struct Sprite *sprite)` (credits.c:1301-1336). */
function SpriteCB_Player(sprite: DecompSprite): void {
  if (gIntroCredits_MovingSceneryState != INTROCRED_SCENERY_NORMAL)
  {
    DestroySprite(sprite);
    return;
  }
  switch (sprite.data[0] /* sState */) {
    case 0:
      StartSpriteAnimIfDifferent(sprite, 0);
      break;
    case 1:
      StartSpriteAnimIfDifferent(sprite, 1);
      if (sprite.x > -32)
        sprite.x--;
      break;
    case 2:
      StartSpriteAnimIfDifferent(sprite, 2);
      break;
    case 3:
      StartSpriteAnimIfDifferent(sprite, 3);
      break;
    case 4:
      StartSpriteAnimIfDifferent(sprite, 0);
      if (sprite.x > Math.trunc(DISPLAY_WIDTH / 2))
        sprite.x--;
      break;
    case 5:
      StartSpriteAnimIfDifferent(sprite, 0);
      if (sprite.x > -32)
        sprite.x--;
      break;
  }
}

/** 1:1 `static void SpriteCB_Rival(struct Sprite *sprite)` (credits.c:1338-1373). */
function SpriteCB_Rival(sprite: DecompSprite): void {
  if (gIntroCredits_MovingSceneryState != INTROCRED_SCENERY_NORMAL)
  {
    DestroySprite(sprite);
    return;
  }
  switch (sprite.data[0] /* sState */) {
    case 0:
      sprite.y2 = 0;
      StartSpriteAnimIfDifferent(sprite, 0);
      break;
    case 1:
      if (sprite.x > 200)
        StartSpriteAnimIfDifferent(sprite, 1);
      else
        StartSpriteAnimIfDifferent(sprite, 2);
      if (sprite.x > -32)
        sprite.x -= 2;
      sprite.y2 = -gIntroCredits_MovingSceneryVOffset;
      break;
    case 2:
      sprite.data[7]++;
      StartSpriteAnimIfDifferent(sprite, 0);
      if ((sprite.data[7] & 3) == 0)
        sprite.x++;
      break;
    case 3:
      StartSpriteAnimIfDifferent(sprite, 0);
      if (sprite.x > -32)
        sprite.x--;
      break;
  }
}

// #define sPosition data[1]  (alias — expansé aux usages)

// #define sSpriteId data[6]  (alias — expansé aux usages)

/** 1:1 `static void SpriteCB_CreditsMon(struct Sprite *sprite)` (credits.c:1378-1463). */
function SpriteCB_CreditsMon(sprite: DecompSprite): void {
  if (gIntroCredits_MovingSceneryState != INTROCRED_SCENERY_NORMAL)
  {
    FreeAndDestroyMonPicSprite(sprite.data[6] /* sSpriteId */);
    return;
  }
  sprite.data[7]++;
  switch (sprite.data[0] /* sState */) {
    case 0:
    default:
      sprite.affineMode = ST_OAM_AFFINE_NORMAL;
      sprite.matrixNum = sprite.data[1] /* sPosition */;
      sprite.data[2] = 16;
      SetOamMatrix(sprite.data[1] /* sPosition */, Math.trunc(0x10000 / sprite.data[2]), 0, 0, Math.trunc(0x10000 / sprite.data[2]));
      sprite.invisible = false;
      sprite.data[0] /* sState */ = 1;
      break;
    case 1:
      if (sprite.data[2] < 256)
      {
        sprite.data[2] += 8;
        SetOamMatrix(sprite.data[1] /* sPosition */, Math.trunc(0x10000 / sprite.data[2]), 0, 0, Math.trunc(0x10000 / sprite.data[2]));
      }
      else
      {
        sprite.data[0] /* sState */++;
      }
      switch (sprite.data[1] /* sPosition */) {
        case POS_LEFT + 1:
          if ((sprite.data[7] & 3) == 0)
            sprite.y++;
          sprite.x -= 2;
          break;
        case POS_CENTER + 1:
          break;
        case POS_RIGHT + 1:
          if ((sprite.data[7] & 3) == 0)
            sprite.y++;
          sprite.x += 2;
          break;
      }
      break;
    case 2:
      if (sprite.data[3] != 0)
      {
        sprite.data[3]--;
      }
      else
      {
        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3);
        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));
        sprite.objMode = ST_OAM_OBJ_BLEND;
        sprite.data[3] = 16;
        sprite.data[0] /* sState */++;
      }
      break;
    case 3:
      if (sprite.data[3] != 0)
      {
        let data3 = 0;
        sprite.data[3]--;
        data3 = 16 - sprite.data[3];
        SetGpuReg(REG_OFFSET_BLDALPHA, (data3 << 8) + sprite.data[3]);
      }
      else
      {
        sprite.invisible = true;
        sprite.data[0] /* sState */ = 9;
      }
      break;
    case 9:
      sprite.data[0] /* sState */++;
      break;
    case 10:
      SetGpuReg(REG_OFFSET_BLDCNT, 0);
      SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      FreeAndDestroyMonPicSprite(sprite.data[6]);
      break;
  }
}

// #define sMonSpriteId data[0]  (alias — expansé aux usages)

/** 1:1 `static u8 CreateCreditsMonSprite(u16 nationalDexNum, s16 x, s16 y, u16 position)` (credits.c:1467-1485). */
function CreateCreditsMonSprite(nationalDexNum: number, x: number, y: number, position: number): number {
  let monSpriteId = 0;
  let bgSpriteId = 0;
  monSpriteId = CreateMonSpriteFromNationalDexNumber(nationalDexNum, x, y, position);
  // ROBUSTESSE (adaptation async, cf. [[hardware-non-1to1-exemptions]]) : le décomp lit la pic
  // depuis la ROM (jamais absente) ; notre port charge les substrats mon-pic de façon ASYNC. Si
  // l'espèce tirée par DeterminePokemonToShow n'a pas (encore) son substrat en cache,
  // CreateMonSpriteFromNationalDexNumber rend SPRITE_NONE (0xFFFF) → `gSprites[0xFFFF]` undefined
  // → throw à chaque frame → Task_ShowMons GÈLE (le générique n'atteint jamais « FIN »). On skippe
  // gracieusement le mon manquant (le défilé continue) au lieu de figer. NO-OP quand les substrats
  // sont en cache (cas nominal). Dette à solder : précharger les substrats du défilé (cf. rapport).
  if (monSpriteId === 0xFFFF || !gSprites[monSpriteId]) {
    // Règle 3 : un asset attendu qui manque HURLE (skip diagnostiquable, pas silencieux).
    console.error(`[credits] défilé : substrat mon-pic absent pour dex #${nationalDexNum} — mon SKIPPÉ`);
    return 0xFFFF;
  }
  // 1:1 credits.c:1473 : gSprites[monSpriteId].oam.priority = 1 — écrit l'OAM RÉEL (lu par le
  // compositeur), PAS seulement le champ plat. syncSpritesToOam NE propage PAS .priority (figé au
  // CREATE, cf. CreateMovingScenerySprites credits.ts:1868) : la mon-pic est créée par
  // CreateMonPicSprite avec OAM priority 0 → sans cette écriture elle compose AU-DESSUS de son carré
  // (mon-bg, OAM priority 1) et l'alpha-blend OBJ saute au fondu (BLDCNT_TGT2 = BG only) → mon opaque
  // pendant ~16 frames après disparition du carré. Sur GBA les deux sont priorité 1 (même couche OBJ)
  // → fusionnés, le mon blende avec le BG grass (TGT2). Route vers l'OAM comme naming_screen.ts:1786.
  gSprites[monSpriteId].priority = 1;   // champ plat (cohérence DecompSprite, inerte au rendu)
  {
    const _monOam = getRuntime()?.gba.oam[gSprites[monSpriteId].oamIndex];
    if (_monOam) _monOam.priority = 1;
  }
  gSprites[monSpriteId].data[1] /* sPosition */ = position + 1;
  gSprites[monSpriteId].invisible = true;
  gSprites[monSpriteId].callback = SpriteCB_CreditsMon;
  gSprites[monSpriteId].data[6] /* sSpriteId */ = monSpriteId;
  // ── FIX « spawn taille normale 1 frame avant le zoom » (bug user, tracé matrice) ────────────
  // Le mon (et son carré mon-bg) sont pilotés à 100 % par SpriteCB_CreditsMon via SetOamMatrix
  // (data[2]: 16→256 = petit→grand). MAIS deux affine-anims parasites réécrivent la matrice
  // partagée `sPosition` À L'IDENTITÉ (= 0x100 = taille NORMALE) sur la frame de spawn, APRÈS le
  // callback (tickAllAffineAnims tourne après runSpriteCallbacks) :
  //   1. le MON : CreateMonPicSprite (MON_PIC_AFFINE_FRONT) attache gAffineAnims_BattleSpriteOpponentSide[0]
  //      = sAffineAnim_Battler_Normal = FRAME(0x100,0x100,0,0) = identité (1:1 décomp sprite.c:1077).
  //   2. le MON-BG : sSpriteTemplate_CreditsMonBg.affineAnims = gDummySpriteAffineAnimTable. Le carré
  //      copie affineMode=1 + matrixNum=sPosition du mon (SpriteCB_CreditsMonBg) puis, la 1re frame où
  //      son affineMode passe ON, tickAllAffineAnims applique la frame dummy = identité sur CETTE MÊME
  //      matrice partagée. ⚠️ Divergence moteur : le décomp SKIPPE les anims dont la 1re cmd = END
  //      (BeginAffineAnim `affineAnims[0][0].type != 32767`) → le dummy ne touche PAS la matrice là-bas ;
  //      notre moteur applique la frame identité → stomp SUPPLÉMENTAIRE absent du décomp.
  // Résultat : matrice sPosition = 0x100 (plein écran) 1 frame → le mon ET son carré 64×64 flashent
  // taille normale avant de rétrécir. Sur GBA le ghosting LCD masque la frame ; notre rendu net la montre.
  // Fix (adaptation affichage, cf. [[hardware-non-1to1-exemptions]] : ghosting LCD non reproduit) :
  // on marque les DEUX affine-anims TERMINÉES → tickAllAffineAnims ne réécrit jamais la matrice ; elle
  // reste celle posée par SpriteCB_CreditsMon (petit dès la 1re frame). Le zoom-in reste 100 % 1:1.
  gSprites[monSpriteId].affineAnimBeginning = false;
  gSprites[monSpriteId].affineAnimEnded = true;
  bgSpriteId = CreateSprite(sSpriteTemplate_CreditsMonBg, gSprites[monSpriteId].x, gSprites[monSpriteId].y, 1);
  gSprites[bgSpriteId].data[0] /* sMonSpriteId */ = monSpriteId;
  gSprites[bgSpriteId].affineAnimBeginning = false;
  gSprites[bgSpriteId].affineAnimEnded = true;
  StartSpriteAnimIfDifferent(gSprites[bgSpriteId], position);
  return monSpriteId;
}

/** 1:1 `static void SpriteCB_CreditsMonBg(struct Sprite *sprite)` (credits.c:1487-1503). */
function SpriteCB_CreditsMonBg(sprite: DecompSprite): void {
  if (gSprites[sprite.data[0] /* sMonSpriteId */].data[0] == 10 || gIntroCredits_MovingSceneryState != INTROCRED_SCENERY_NORMAL)
  {
    DestroySprite(sprite);
    return;
  }
  // Copy sprite data from the associated Pokémon
  sprite.invisible = gSprites[sprite.data[0] /* sMonSpriteId */].invisible;
  sprite.objMode = gSprites[sprite.data[0] /* sMonSpriteId */].objMode;
  sprite.affineMode = gSprites[sprite.data[0] /* sMonSpriteId */].affineMode;
  sprite.matrixNum = gSprites[sprite.data[0] /* sMonSpriteId */].matrixNum;
  sprite.x = gSprites[sprite.data[0] /* sMonSpriteId */].x;
  sprite.y = gSprites[sprite.data[0] /* sMonSpriteId */].y;
}

/** 1:1 `static void DeterminePokemonToShow(void)` (credits.c:1505-1587). */
function DeterminePokemonToShow(): void {
  // 1:1 credits.c:1507 : u16 starter = SpeciesToNationalPokedexNum(GetStarterPokemon(VarGet(VAR_STARTER_MON))).
  // Le port de GetStarterPokemon rend le NOM d'espèce (string) → resolveDecompConstant → id numérique
  // (SpeciesToNationalPokedexNum attend un u16), pour restaurer la valeur décomp.
  let starter = SpeciesToNationalPokedexNum(resolveDecompConstant(GetStarterPokemon(VarGet(VAR_STARTER_MON))) ?? 0);
  let page = 0;
  let dexNum = 0;
  let j = 0;
  // Go through the Pokédex, and anything that has gotten caught we put into our massive array.
  // This basically packs all of the caught Pokémon into the front of the array
  for ((dexNum = 1, j = 0); dexNum < NATIONAL_DEX_COUNT; dexNum++)
  {
    if (GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT))
    {
      sCreditsData!.caughtMonIds[j] = dexNum;
      j++;
    }
  }
  // Fill the rest of the array with zeroes
  for (dexNum = j; dexNum < NATIONAL_DEX_COUNT; dexNum++)
    sCreditsData!.caughtMonIds[dexNum] = NATIONAL_DEX_NONE;
  // Cap the number of Pokémon we care about to NUM_MON_SLIDES, the max we show in the credits scene (-1 for the starter)
  sCreditsData!.numCaughtMon = j;
  if (sCreditsData!.numCaughtMon < NUM_MON_SLIDES)
    sCreditsData!.numMonToShow = j;
  else
    sCreditsData!.numMonToShow = NUM_MON_SLIDES;
  // Loop through our list of caught Pokémon and select randomly from it to fill the images to show
  j = 0;
  do
  {
    // Select a random mon, insert into array
    page = Random() % sCreditsData!.numCaughtMon;
    sCreditsData!.monToShow[j] = sCreditsData!.caughtMonIds[page];
    // Remove the select mon from the array, and condense array entries
    j++;
    sCreditsData!.caughtMonIds[page] = 0;
    sCreditsData!.numCaughtMon--;
    if (page != sCreditsData!.numCaughtMon)
    {
      // Instead of looping through and moving everything down, just take from the end. Order doesn't matter after all.
      sCreditsData!.caughtMonIds[page] = sCreditsData!.caughtMonIds[sCreditsData!.numCaughtMon];
      sCreditsData!.caughtMonIds[sCreditsData!.numCaughtMon] = 0;
    }
  }
  while (sCreditsData!.numCaughtMon != 0 && j < NUM_MON_SLIDES);
  // If we don't have enough Pokémon in the dex to fill everything, copy the selected mon into the end of the array, so it loops
  if (sCreditsData!.numMonToShow < NUM_MON_SLIDES)
  {
    for ((j = sCreditsData!.numMonToShow, page = 0); j < NUM_MON_SLIDES; j++)
    {
      sCreditsData!.monToShow[j] = sCreditsData!.monToShow[page];
      page++;
      if (page == sCreditsData!.numMonToShow)
        page = 0;
    }
    // Ensure the last Pokémon is our starter
    sCreditsData!.monToShow[NUM_MON_SLIDES - 1] = starter;
  }
  else
  {
    // Check to see if our starter has already appeared in this list, break if it has
    for (dexNum = 0; sCreditsData!.monToShow[dexNum] != starter && dexNum < NUM_MON_SLIDES; dexNum++)
      ;
    // If it has, swap it with the last Pokémon, to ensure our starter is the last image
    if (dexNum < sCreditsData!.numMonToShow - 1)
    {
      sCreditsData!.monToShow[dexNum] = sCreditsData!.monToShow[NUM_MON_SLIDES - 1];
      sCreditsData!.monToShow[NUM_MON_SLIDES - 1] = starter;
    }
    else
    {
      // Ensure the last Pokémon is our starter
      sCreditsData!.monToShow[NUM_MON_SLIDES - 1] = starter;
    }
  }
  sCreditsData!.numMonToShow = NUM_MON_SLIDES;
}

/** Préchargement async des substrats mon-pic du défilé (dette tracée, cf. rapport AUDIT-GENERIQUE).
 *  Le décomp lit chaque pic depuis la ROM en synchrone (CreateMonSpriteFromNationalDexNumber →
 *  DecompressPic) ; notre port fetch les substrats de façon ASYNC. On précharge donc TOUS les mons de
 *  sCreditsData.monToShow[] (rempli par DeterminePokemonToShow) dès le début du générique, dans l'ORDRE
 *  d'affichage (les premiers montrés chargent en premier). Même loader que le préchargement HOF
 *  (hall_of_fame.ts:1171 : anim_front multi-frame, fallback front). Dédup par enumName (monToShow
 *  reboucle les mons quand < NUM_MON_SLIDES espèces capturées). Imports DYNAMIQUES (pas de nouvelle arête
 *  statique dans le graphe credits → anti-bombe TDZ). Tout asset absent HURLE (console.error) sans figer :
 *  CreateCreditsMonSprite skippera gracieusement le mon si son substrat n'a pas fini de charger. */
function _preloadCreditsMonSubstrates(): void {
  const toShow = sCreditsData?.monToShow;
  if (!toShow) return;
  void (async () => {
    try {
      const [tps, pokemonMod, constMod, pngLoader] = await Promise.all([
        import('./trainer_pokemon_sprites'),
        import('./pokemon'),
        import('../harness/runtime/decomp-constants'),
        import('../harness/gba/png-loader'),
      ]);
      const { _registerMonPicSubstrate } = tps;
      const { NationalPokedexNumToSpecies } = pokemonMod;
      const { reverseDecompConstant } = constMod;
      const { loadTileBin, loadIndexedPngStrict, loadGbaPal } = pngLoader;
      const done = new Set<string>();
      for (let i = 0; i < toShow.length; i++) {
        const dexNum = toShow[i];
        if (!dexNum) continue;   // NATIONAL_DEX_NONE / slot vide
        const species = NationalPokedexNumToSpecies(dexNum);
        const key = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
        if (key === 'SPECIES_NONE' || done.has(key)) continue;
        done.add(key);
        const folder = key.replace('SPECIES_', '').toLowerCase();
        try {
          // 1:1 pattern HOF : anim_front (64×128, 2 frames) fallback front.png (1 frame) + normal.pal.
          const [frontTiles, pal] = await Promise.all([
            loadTileBin(`/decomp/em/pokemon/${folder}/anim_front.png`, 4)
              .catch(() => loadIndexedPngStrict(`/decomp/em/pokemon/${folder}/front.png`, 4).then((r) => r.charData)),
            loadGbaPal(`/decomp/em/pokemon/${folder}/normal.pal`),
          ]);
          _registerMonPicSubstrate(key, frontTiles, pal.subarray(0, 16));
        } catch (e) {
          console.error('[credits] défilé : substrat mon-pic KO (préchargement)', key, e);
        }
      }
    } catch (e) {
      console.error('[credits] _preloadCreditsMonSubstrates', e);
    }
  })();
}

// ═══════════════════════════════════════════════════════════════════════════════
// HÔTE 1:1 intro_credits_graphics.c — chargement des scènes vélo (grass + clouds/trees/
// houses) + « moving scenery » sprites + SetCreditsSceneBgCnt. Placé ici (credits.ts,
// @ts-nocheck, convention globale directe) car : (a) consommé UNIQUEMENT par credits.ts ;
// (b) la version rt-first de src/intro_credits_graphics.ts est du code MORT à réconcilier
// (scenery = `declare const` stubs jamais portés). NB : les Create* joueur/vélo/Flygon +
// CreateBicycleBgAnimationTask + CycleSceneryPalette vivent, eux, dans decomp-globals.
// ═══════════════════════════════════════════════════════════════════════════════

const TAG_MOVING_SCENERY = 2000; // 1:1 intro_credits_graphics.c:27
const TAG_NONE = 0xFFFF;         // 1:1 include/sprite.h

/** Lie les assets préchargés (assetCache, cf. preloadCreditsAssets) aux globals credits.
 *  Les symboles consommés par LZ77UnCompVram attendent une CLÉ string (résolue au call) ;
 *  ceux consommés par LoadPalette (+ .length) attendent le tableau u16 brut. */
function _bindCreditsAssets(): void {
  gBirchBagGrass_Gfx = 'gBirchBagGrass_Gfx';               // → LZ77UnCompVram (clé)
  gBirchGrassTilemap = 'gBirchGrassTilemap';               // → LZ77UnCompVram (clé)
  gCreditsCopyrightEnd_Gfx = 'gCreditsCopyrightEnd_Gfx';   // → LZ77UnCompVram (clé)
  gCreditsCopyrightEnd_Tilemap = 'gCreditsCopyrightEnd_Tilemap'; // → LZ77UnCompVram (clé)
  gBirchBagGrass_Pal = assetCache.get('gBirchBagGrass_Pal') ?? null; // → LoadPalette (u16)
  gIntroCopyright_Pal = assetCache.get('gIntroCopyright_Pal') ?? null; // → LoadPalette + .length
  sCredits_Pal = assetCache.get('sCredits_Pal') ?? null;   // → LoadPalette (u16)
  const checks: Array<[string, unknown]> = [
    ['gBirchBagGrass_Gfx', assetCache.get('gBirchBagGrass_Gfx')],
    ['gBirchGrassTilemap', assetCache.get('gBirchGrassTilemap')],
    ['gCreditsCopyrightEnd_Gfx', assetCache.get('gCreditsCopyrightEnd_Gfx')],
    ['gCreditsCopyrightEnd_Tilemap', assetCache.get('gCreditsCopyrightEnd_Tilemap')],
    ['gBirchBagGrass_Pal', gBirchBagGrass_Pal], ['gIntroCopyright_Pal', gIntroCopyright_Pal],
    ['sCredits_Pal', sCredits_Pal],
  ];
  for (const [k, v] of checks) {
    if (!v) console.error(`[credits] asset manquant — appeler preloadCreditsAssets() AVANT CB2_StartCreditsSequence : ${k}`);
  }
}

// ─── Moving scenery (clouds/trees/houses) 1:1 intro_credits_graphics.c ───────────
// data[0]=tHasVerticalMove, data[1]=tXOffset, data[2]=tXPos (c:1033-1035).
/** 1:1 `SpriteCB_MovingScenery` (intro_credits_graphics.c:1037-1062). */
function SpriteCB_MovingScenery(sprite: DecompSprite): void {
  let x = 0;
  const state = gIntroCredits_MovingSceneryState;
  if (state != INTROCRED_SCENERY_FROZEN)
  {
    switch (state) {
      default: // INTROCRED_SCENERY_DESTROY
        DestroySprite(sprite);
        break;
      case INTROCRED_SCENERY_NORMAL:
        x = ((sprite.x << 16) | (sprite.data[2] & 0xFFFF)) + (sprite.data[1] & 0xFFFF);
        sprite.x = x >> 16;
        sprite.data[2] = x;
        if (sprite.x > 255)
          sprite.x = -32;
        if (sprite.data[0])
          sprite.y2 = -(gIntroCredits_MovingSceneryVBase + gIntroCredits_MovingSceneryVOffset);
        else
          sprite.y2 = -gIntroCredits_MovingSceneryVBase;
        break;
    }
  }
}

/** 1:1 `sSpriteTemplate_MovingScenery` (intro_credits_graphics.c:79). oam/anims dummy
 *  (écrasés par metadata[i].shape/size + anims dans la boucle). */
const sSpriteTemplate_MovingScenery = {
  tileTag: 'TAG_MOVING_SCENERY',
  paletteTag: TAG_NONE,
  oam: { shape: 0, size: 0, priority: 3 },
  anims: null,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCB_MovingScenery,
};

// 1:1 sSpriteSheet_Clouds/TreesSmall/HouseSilhouette (intro_credits_graphics.c:90/217/364).
const sSpriteSheet_Clouds = { data: 'sClouds_Gfx', size: 0x400, tag: 'TAG_MOVING_SCENERY' };
const sSpriteSheet_TreesSmall = { data: 'sTreesSmall_Gfx', size: 0x400, tag: 'TAG_MOVING_SCENERY' };
const sSpriteSheet_HouseSilhouette = { data: 'sHouseSilhouette_Gfx', size: 0x400, tag: 'TAG_MOVING_SCENERY' };

// 1:1 sAnims_Clouds/Trees/HouseSilhouette (intro_credits_graphics.c:100-383).
const sAnims_Clouds = [
  [ANIMCMD_FRAME(0, 30), ANIMCMD_END], [ANIMCMD_FRAME(16, 30), ANIMCMD_END],
  [ANIMCMD_FRAME(20, 30), ANIMCMD_END], [ANIMCMD_FRAME(22, 30), ANIMCMD_END],
];
const sAnims_Trees = [
  [ANIMCMD_FRAME(0, 30), ANIMCMD_END], [ANIMCMD_FRAME(16, 30), ANIMCMD_END],
  [ANIMCMD_FRAME(24, 30), ANIMCMD_END],
];
const sAnims_HouseSilhouette = [[ANIMCMD_FRAME(0, 30), ANIMCMD_END]];

// 1:1 sSpriteMetadata_* (intro_credits_graphics.c:132/252/385).
// { animNum, shape, size, x, y, subpriority, xOff } — SPRITE_SHAPE/SIZE : 32x32=(0,2)
// 16x16=(0,1) 16x8=(1,0) 16x32=(2,2).
const sSpriteMetadata_Clouds = [
  { animNum: 0, shape: 0, size: 2, x: 72, y: 32, subpriority: 100, xOff: 0xc00 },
  { animNum: 0, shape: 0, size: 2, x: 158, y: 32, subpriority: 100, xOff: 0xc00 },
  { animNum: 1, shape: 0, size: 1, x: 192, y: 40, subpriority: 101, xOff: 0x800 },
  { animNum: 1, shape: 0, size: 1, x: 56, y: 40, subpriority: 101, xOff: 0x800 },
  { animNum: 2, shape: 1, size: 0, x: 100, y: 44, subpriority: 102, xOff: 0x400 },
  { animNum: 2, shape: 1, size: 0, x: 152, y: 44, subpriority: 102, xOff: 0x400 },
  { animNum: 3, shape: 1, size: 0, x: 8, y: 46, subpriority: 103, xOff: 0x100 },
  { animNum: 3, shape: 1, size: 0, x: 56, y: 46, subpriority: 103, xOff: 0x100 },
  { animNum: 3, shape: 1, size: 0, x: 240, y: 46, subpriority: 103, xOff: 0x100 },
];
const sSpriteMetadata_Trees = [
  { animNum: 0, shape: 0, size: 2, x: 16, y: 88, subpriority: 100, xOff: 0x2000 },
  { animNum: 0, shape: 0, size: 2, x: 80, y: 88, subpriority: 100, xOff: 0x2000 },
  { animNum: 0, shape: 0, size: 2, x: 144, y: 88, subpriority: 100, xOff: 0x2000 },
  { animNum: 0, shape: 0, size: 2, x: 208, y: 88, subpriority: 100, xOff: 0x2000 },
  { animNum: 1, shape: 2, size: 2, x: 40, y: 88, subpriority: 101, xOff: 0x1000 },
  { animNum: 1, shape: 2, size: 2, x: 104, y: 88, subpriority: 101, xOff: 0x1000 },
  { animNum: 1, shape: 2, size: 2, x: 168, y: 88, subpriority: 101, xOff: 0x1000 },
  { animNum: 1, shape: 2, size: 2, x: 232, y: 88, subpriority: 101, xOff: 0x1000 },
  { animNum: 2, shape: 2, size: 2, x: 56, y: 88, subpriority: 102, xOff: 0x800 },
  { animNum: 2, shape: 2, size: 2, x: 120, y: 88, subpriority: 102, xOff: 0x800 },
  { animNum: 2, shape: 2, size: 2, x: 184, y: 88, subpriority: 102, xOff: 0x800 },
  { animNum: 2, shape: 2, size: 2, x: 248, y: 88, subpriority: 102, xOff: 0x800 },
];
const sSpriteMetadata_HouseSilhouette = [
  { animNum: 0, shape: 0, size: 2, x: 24, y: 88, subpriority: 100, xOff: 0x1000 },
  { animNum: 0, shape: 0, size: 2, x: 64, y: 88, subpriority: 100, xOff: 0x1000 },
  { animNum: 0, shape: 0, size: 2, x: 104, y: 88, subpriority: 100, xOff: 0x1000 },
  { animNum: 0, shape: 0, size: 2, x: 144, y: 88, subpriority: 100, xOff: 0x1000 },
  { animNum: 0, shape: 0, size: 2, x: 184, y: 88, subpriority: 100, xOff: 0x1000 },
  { animNum: 0, shape: 0, size: 2, x: 224, y: 88, subpriority: 100, xOff: 0x1000 },
];

/** 1:1 `CreateMovingScenerySprites` (intro_credits_graphics.c:1064-1082). */
function CreateMovingScenerySprites(hasVerticalMove: number, metadata: any[], anims: any, numSprites: number): void {
  let i = 0;
  for (i = 0; i < numSprites; i++)
  {
    // 1:1 décomp : `sSpriteTemplate_MovingScenery` est un DUMMY (shape/size 8×8) ; chaque sprite
    // reçoit sa shape/size réelle. Le décomp écrit `gSprites[id].oam.shape/size/priority` APRÈS
    // création — mais notre syncSpritesToOam NE propage PAS shape/size/priority/paletteNum (fixés à
    // la CRÉATION dans CreateSpriteAtOam, cf. sprite.ts). On les pose donc au CREATE via un template
    // PAR-SPRITE, sinon nuages/arbres/maisons rendent en 8×8 (« scenery minuscule »).
    const template = {
      ...sSpriteTemplate_MovingScenery,
      oam: { ...sSpriteTemplate_MovingScenery.oam, shape: metadata[i].shape, size: metadata[i].size },
    };
    const sprite = CreateSprite(template, metadata[i].x, metadata[i].y, metadata[i].subpriority);
    // CreateSpriteAtOam a DÉJÀ calculé le centerToCornerVec pour la vraie shape/size (1:1
    // CalcCenterToCornerVec à la création) ; on garde l'appel décomp explicite (idempotent).
    const ctc = CalcCenterToCornerVec(metadata[i].shape, metadata[i].size, ST_OAM_AFFINE_OFF);
    gSprites[sprite].centerToCornerVecX = ctc.centerToCornerVecX;
    gSprites[sprite].centerToCornerVecY = ctc.centerToCornerVecY;
    // priority 3 + paletteNum 0 sont posés au CREATE (template.oam.priority=3 ; paletteBank défaut
    // 0). Les écritures plates ci-dessous gardent le DecompSprite cohérent (inertes au rendu).
    gSprites[sprite].priority = 3;
    gSprites[sprite].shape = metadata[i].shape;
    gSprites[sprite].size = metadata[i].size;
    gSprites[sprite].paletteNum = 0;
    gSprites[sprite].anims = anims;
    StartSpriteAnim(gSprites[sprite], metadata[i].animNum);
    gSprites[sprite].data[0] = hasVerticalMove; // tHasVerticalMove
    gSprites[sprite].data[1] = metadata[i].xOff; // tXOffset
    gSprites[sprite].data[2] = 0; // tXPos
  }
}

/** 1:1 `CreateCloudSprites` (intro_credits_graphics.c:1088). */
function CreateCloudSprites(): void {
  CreateMovingScenerySprites(0, sSpriteMetadata_Clouds, sAnims_Clouds, 9);
}
/** 1:1 `CreateTreeSprites` (intro_credits_graphics.c:1093). */
function CreateTreeSprites(): void {
  CreateMovingScenerySprites(1, sSpriteMetadata_Trees, sAnims_Trees, 12);
}
/** 1:1 `CreateHouseSprites` (intro_credits_graphics.c:1098). */
function CreateHouseSprites(): void {
  CreateMovingScenerySprites(1, sSpriteMetadata_HouseSilhouette, sAnims_HouseSilhouette, 6);
}

/** 1:1 `void LoadCreditsSceneGraphics(u8 scene)` (intro_credits_graphics.c:838-887). */
function LoadCreditsSceneGraphics(scene: number): void {
  LZ77UnCompVram('sGrass_Gfx', BG_CHAR_ADDR(1));
  LZ77UnCompVram('sGrass_Tilemap', BG_SCREEN_ADDR(15));
  switch (scene) {
    case SCENE_OCEAN_MORNING:
    default:
      LoadPalette('sGrass_Pal', BG_PLTT_ID(15), 32);
      LZ77UnCompVram('sCloudsBg_Gfx', VRAM);
      LZ77UnCompVram('sCloudsBg_Tilemap', BG_SCREEN_ADDR(6));
      LoadPalette('sCloudsBg_Pal', BG_PLTT_ID(0), 32);
      LoadCompressedSpriteSheet(sSpriteSheet_Clouds);
      LZ77UnCompVram('sClouds_Gfx', OBJ_VRAM0);
      LoadPalette('sClouds_Pal', OBJ_PLTT_ID(0), 32);
      CreateCloudSprites();
      break;
    case SCENE_OCEAN_SUNSET:
      LoadPalette('sGrassSunset_Pal', BG_PLTT_ID(15), 32);
      LZ77UnCompVram('sCloudsBg_Gfx', VRAM);
      LZ77UnCompVram('sCloudsBg_Tilemap', BG_SCREEN_ADDR(6));
      LoadPalette('sCloudsBgSunset_Pal', BG_PLTT_ID(0), 32);
      LoadCompressedSpriteSheet(sSpriteSheet_Clouds);
      LZ77UnCompVram('sClouds_Gfx', OBJ_VRAM0);
      LoadPalette('sCloudsSunset_Pal', OBJ_PLTT_ID(0), 32);
      CreateCloudSprites();
      break;
    case SCENE_FOREST_RIVAL_ARRIVE:
    case SCENE_FOREST_CATCH_RIVAL:
      LoadPalette('sGrassSunset_Pal', BG_PLTT_ID(15), 32);
      LZ77UnCompVram('sTrees_Gfx', VRAM);
      LZ77UnCompVram('sTrees_Tilemap', BG_SCREEN_ADDR(6));
      LoadPalette('sTreesSunset_Pal', BG_PLTT_ID(0), 32);
      LoadCompressedSpriteSheet(sSpriteSheet_TreesSmall);
      LoadPalette('sTreesSunset_Pal', OBJ_PLTT_ID(0), 32);
      CreateTreeSprites();
      break;
    case SCENE_CITY_NIGHT:
      LoadPalette('sGrassNight_Pal', BG_PLTT_ID(15), 32);
      LZ77UnCompVram('sHouses_Gfx', VRAM);
      LZ77UnCompVram('sHouses_Tilemap', BG_SCREEN_ADDR(6));
      LoadPalette('sHouses_Pal', BG_PLTT_ID(0), 32);
      LoadCompressedSpriteSheet(sSpriteSheet_HouseSilhouette);
      LoadPalette('sHouseSilhouette_Pal', OBJ_PLTT_ID(0), 32);
      CreateHouseSprites();
      break;
  }
  (globalThis as any).gReservedSpritePaletteCount = 8;
  (globalThis as any).gIntroCredits_MovingSceneryState = INTROCRED_SCENERY_NORMAL;
}

/** 1:1 `void SetCreditsSceneBgCnt(u8 scene)` (intro_credits_graphics.c:889-910). scene unused. */
function SetCreditsSceneBgCnt(_scene: number): void {
  SetGpuReg(REG_OFFSET_BG3CNT, BGCNT_PRIORITY(3) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(6) | BGCNT_TXT256x256);
  SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(2) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(7) | BGCNT_TXT256x256);
  SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(1) | BGCNT_CHARBASE(1) | BGCNT_16COLOR | BGCNT_SCREENBASE(15) | BGCNT_TXT256x256);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | (DISPCNT_BG0_ON | DISPCNT_BG1_ON | DISPCNT_BG2_ON | DISPCNT_BG3_ON) | DISPCNT_OBJ_ON);
}
