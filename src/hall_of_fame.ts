/**
 * hall_of_fame.ts — port 1:1 STRICT décomp `src/hall_of_fame.c` (chemin Palier 4).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/hall_of_fame.c`.
 *
 * Écran Hall of Fame COMPLET : défilé de l'équipe (mons qui glissent + anim front),
 * sauvegarde ("SAUVEGARDE EN COURS"), texte de bienvenue + confettis + applaudissements,
 * puis affichage du dresseur (pic + nom/ID/temps + "MAITRE DE LA LIGUE") → générique (credits.c).
 *
 * Fonctions portées (main flow) :
 *   VBlankCB_HallOfFame · CB2_HallOfFame · InitHallOfFameScreen · CB2_DoHallOfFameScreen ·
 *   CB2_DoHallOfFameScreenDontSaveData · Task_Hof_InitMonData · Task_Hof_InitTeamSaveData ·
 *   Task_Hof_TrySaveData · Task_Hof_WaitToDisplayMon · Task_Hof_SetMonDisplayTask ·
 *   Task_Hof_DisplayMon · Task_Hof_PrintMonInfoAfterAnimating · Task_Hof_TryDisplayAnotherMon ·
 *   Task_Hof_PaletteFadeAndPrintWelcomeText · Task_Hof_DoConfetti · Task_Hof_WaitToDisplayPlayer ·
 *   Task_Hof_DisplayPlayer · Task_Hof_WaitAndPrintPlayerInfo · Task_Hof_ExitOnKeyPressed ·
 *   Task_Hof_HandlePaletteOnExit · Task_Hof_HandleExit · StartCredits · HallOfFame_PrintWelcomeText ·
 *   HallOfFame_PrintMonInfo · HallOfFame_PrintPlayerInfo · ClearVramOamPltt_LoadHofPal · LoadHofGfx ·
 *   InitHofBgs · LoadHofBgs · SpriteCB_GetOnScreenAndAnimate · SpriteCB_HofConfetti ·
 *   CreateHofConfettiSprite · DoDomeConfetti · StopDomeConfetti · UpdateDomeConfetti · Task_DoDomeConfetti.
 *
 * ── Adaptations moteur (toutes citées, cf. [[hardware-non-1to1-exemptions]]) ──
 *  - ASSETS : le décomp lit la ROM sync (LZ77UnCompVram / DecompressPic). Nous fetchons les PNG
 *    async → `preloadHallOfFameAssets()` (appelé à GameClear) pré-remplit l'assetCache + les
 *    substrats mon-pic/trainer-pic AVANT le CB2. Le CB2 GATE au 1er état tant que le préchargement
 *    n'est pas réglé (jamais de gel : un asset absent HURLE en console + continue dégradé).
 *  - SAUVEGARDE HOF-records : le décomp écrit les 50 équipes dans les secteurs SAVE_HALL_OF_FAME
 *    (gDecompressionBuffer → SRAM). Notre système de save n'expose PAS ces secteurs → l'anneau des
 *    records vit EN MÉMOIRE (`sHofRecords`, logique 1:1) ; l'effet DURABLE (flags Champion, warp
 *    continue, FLAG_SYS_GAME_CLEAR posés par GameClear) est persisté par `TrySavingData()` (save
 *    normale). Les records ne survivent pas à un reload (dette infra : secteurs HOF non modélisés).
 *  - CRÉDITS : `StartCredits()` enchaîne sur `CB2_StartCreditsSequence` (credits.ts) LIÉ via import
 *    DYNAMIQUE (preloadHallOfFameAssets) → garde hall_of_fame HORS du graphe statique de credits.ts
 *    (intro_credits_graphics = bombe TDZ potentielle). cf mémoire find-import-cycle.
 */

import {
  getRuntime, gMain, RunTasks, PlayBGM, PlaySE, DmaFill16, DmaFill32,
  setReservedSpritePaletteCount, SpriteCallbackDummy, LoadOam, ProcessSpriteCopyRequests,
  LoadCompressedSpriteSheet, assetCache, LoadPalette, FindTaskIdByFunc,
  ResetPaletteFade, TransferPlttBuffer, PLTT_SIZE,
} from '../harness/runtime/decomp-globals';
import { RGB, RGB_BLACK } from '../harness/runtime/decomp-helpers';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { getString } from '../harness/runtime/decomp-strings';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import { SetMainCallback2, SetVBlankCallback } from './main';
import { SetGpuReg } from './gpu_regs';
import {
  AnimateSprites, BuildOamBuffer, LoadSpritePalette,
  CreateSprite, DestroySprite, StartSpriteAnim, FreeOamMatrix, ResetSpriteData,
  FreeAllSpritePalettes, FreeSpriteTilesByTag, FreeSpritePaletteByTag,
  ANIMCMD_FRAME, ANIMCMD_END, gDummySpriteAffineAnimTable, PLTT_SIZE_4BPP,
} from './sprite';
import { TAG_NONE } from './sprite';
import { SPRITE_NONE } from '../include/sprite';
import { CreateTask, DestroyTask, gTasks } from './task';
import {
  InitBgsFromTemplates, SetBgTilemapBuffer, ChangeBgX, ChangeBgY,
  ResetBgsAndClearDma3BusyFlags, ShowBg, HideBg, CopyBgTilemapBufferToVram,
  FillBgTilemapBufferRect_Palette0, UnsetBgTilemapBuffer, CopyWindowToVram,
  FillWindowPixelBuffer, PutWindowTilemap, FreeAllWindowBuffers, AddWindow,
  ResetTempTileDataBuffers, COPYWIN_FULL, PIXEL_FILL, type BgTemplate, type WindowTemplate,
} from './window';
import {
  BeginNormalPaletteFade, UpdatePaletteFade, gPaletteFade,
  BG_PLTT_ID, PALETTES_ALL, PALETTES_OBJECTS,
  gPlttBufferFaded, gPlttBufferUnfaded,
} from './palette';
import {
  AddTextPrinterParameterized2, AddTextPrinterParameterized3, DrawDialogueFrame,
  ClearDialogWindowAndFrame, DrawStdFrameWithCustomTileAndPalette,
  InitStandardTextBoxWindows, InitTextBoxGfxAndPrinters,
} from './menu';
import { RunTextPrinters, encodeOwText, FONT_NORMAL } from './text';
import { LoadWindowGfx, GetTextWindowPalette } from './text_window';
import { GetStringCenterAlignXOffset, GetStringRightAlignXOffset } from './international_string_util';
import { ConvertIntToDecimalStringN } from './string_util';
import { STR_CONV_MODE_LEFT_ALIGN, STR_CONV_MODE_LEADING_ZEROS } from './battle_message';
import { VarSet, VarGet } from './event_data';
import { VAR_0x8004, VAR_0x8005 } from '../include/constants/vars';
import { gSineTable } from './trig';
import { Random } from './random';
import { FadeOutBGM } from './sound';
import { JOY_NEW, A_BUTTON } from './battle_controllers';
import { ScanlineEffect_Stop } from './scanline_effect';
import {
  CreateMonPicSprite_Affine, FreeAndDestroyMonPicSprite, FreeAndDestroyTrainerPicSprite,
  ResetAllPicSprites, MON_PIC_AFFINE_FRONT, CreateTrainerPicSprite,
} from './trainer_pokemon_sprites';
import { DoMonFrontSpriteAnimation } from './pokemon_animation';
import { PlayCry_Normal } from './sound';
import { GetGenderFromSpeciesAndPersonality, SpeciesToNationalPokedexNum, SpeciesToHoennPokedexNum } from './pokemon';
import { IsNationalPokedexEnabled } from './event_data';
import { HOENN_DEX_COUNT } from '../include/pokedex';
import {
  MON_DATA_SPECIES, MON_DATA_SPECIES_OR_EGG, MON_DATA_OT_ID, MON_DATA_PERSONALITY,
  MON_DATA_LEVEL, MON_DATA_NICKNAME,
} from '../include/pokemon';
import { DecompressAndCopyTileDataToVram, FreeTempTileDataBuffersIfPossible } from './pokenav_main_menu';
import { gPlayerParty, GetMonData } from './engine/battle/party-storage';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { TrySavingData } from './save';
import { gSpeciesNames } from './engine/data/game-data';
import {
  CHAR_0, CHAR_QUESTION_MARK, CHAR_SLASH, CHAR_MALE, CHAR_FEMALE, CHAR_COLON, CHAR_SPACE, EOS,
  TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY,
} from '../include/constants/characters';
import { PARTY_SIZE, MALE, POKEMON_NAME_LENGTH } from '../include/constants/global';
import { MON_MALE, MON_FEMALE } from '../include/constants/pokemon';
import { SPECIES_NONE, SPECIES_EGG, SPECIES_NIDORAN_M, SPECIES_NIDORAN_F } from '../include/constants/species';
import { MUS_HALL_OF_FAME, SE_SAVE, SE_APPLAUSE } from '../include/constants/songs';
import { DISPLAY_WIDTH, VRAM, VRAM_SIZE, OAM, OAM_SIZE, PLTT } from '../include/gba/defines';
import {
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY, REG_OFFSET_DISPCNT,
  DISPCNT_OBJ_ON, DISPCNT_OBJ_1D_MAP,
} from '../include/gba/io_reg';

// ─── #define (1:1 hall_of_fame.c:38-39) ──────────────────────────────────────
const HALL_OF_FAME_MAX_TEAMS = 50;
const TAG_CONFETTI = 1001;

// 1:1 include/gba/io_reg.h — bits BLDCNT/BLDALPHA (valeurs macro décomp, définies ici pour
// éviter la dépendance d'import ; cf. précédent main_menu.ts qui inline les valeurs registre).
const BLDCNT_TGT1_BG1 = 1 << 1;
const BLDCNT_EFFECT_BLEND = 1 << 6;
const BLDCNT_TGT2_ALL = (1 << 8) | (1 << 9) | (1 << 10) | (1 << 11) | (1 << 12) | (1 << 13); // BG0..3 | OBJ | BD
const BLDALPHA_BLEND = (eva: number, evb: number): number => (eva) | (evb << 8);
const BG_COORD_SET = 0; // 1:1 include/bg.h
const TEXT_SKIP_DRAW = 0xFF; // 1:1 include/text.h

// ─── struct HallofFameMon / HallofFameTeam (1:1 hall_of_fame.c:41-53) ────────
interface HallofFameMon {
  tid: number;          // u32
  personality: number;  // u32
  species: number;      // u16:9
  lvl: number;          // u16:7
  nickname: Uint8Array; // u8[POKEMON_NAME_LENGTH]
}
interface HallofFameTeam { mon: HallofFameMon[]; } // mon[PARTY_SIZE]

function emptyHofMon(): HallofFameMon {
  return { tid: 0, personality: 0, species: SPECIES_NONE, lvl: 0, nickname: new Uint8Array(POKEMON_NAME_LENGTH) };
}
function emptyHofTeam(): HallofFameTeam {
  return { mon: Array.from({ length: PARTY_SIZE }, emptyHofMon) };
}
/** Copie profonde 1:1 `*dst = *src` (struct HallofFameTeam). */
function copyHofTeam(dst: HallofFameTeam, src: HallofFameTeam): void {
  for (let i = 0; i < PARTY_SIZE; i++) {
    dst.mon[i].tid = src.mon[i].tid;
    dst.mon[i].personality = src.mon[i].personality;
    dst.mon[i].species = src.mon[i].species;
    dst.mon[i].lvl = src.mon[i].lvl;
    dst.mon[i].nickname = Uint8Array.from(src.mon[i].nickname);
  }
}

interface HofGfx { state: number; tilemap1: Uint16Array; tilemap2: Uint16Array; }

// ─── EWRAM (1:1 hall_of_fame.c:65-67) ────────────────────────────────────────
let sHofFadePalettes = 0;                          // u32
let sHofMonPtr: HallofFameTeam | null = null;      // struct HallofFameTeam *
let sHofGfxPtr: HofGfx | null = null;              // struct HofGfx *

// gDecompressionBuffer (secteurs SAVE_HALL_OF_FAME) → anneau EN MÉMOIRE des 50 équipes.
// Adaptation save (cf. en-tête) : les records ne sont pas persistés en SRAM.
let sHofRecords: HallofFameTeam[] = Array.from({ length: HALL_OF_FAME_MAX_TEAMS }, emptyHofTeam);

/** 1:1 EWRAM `bool8 gHasHallOfFameRecords` (credits.c:85) — rapatrié ici (rapatriement demandé
 *  par le lot L ; credits.ts:195 en garde un miroir 1:1 pour son propre skip-B). GameClear est le
 *  seul écrivain (via SetHasHallOfFameRecords) ; Task_Hof_InitTeamSaveData + credits le lisent. */
export let gHasHallOfFameRecords = false;
export function SetHasHallOfFameRecords(v: boolean): void {
  gHasHallOfFameRecords = v;
  (globalThis as Record<string, unknown>).__gHasHallOfFameRecords = v; // pont pour lecteurs @ts-nocheck (credits)
}

// ─── static data (1:1 hall_of_fame.c:106-348) ────────────────────────────────
const sHof_BgTemplates: BgTemplate[] = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];

const sHof_WindowTemplate: WindowTemplate = {
  bg: 0, tilemapLeft: 2, tilemapTop: 2, width: 14, height: 6, paletteNum: 14, baseBlock: 1,
};

const sMonInfoTextColors = [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY] as const;
const sPlayerInfoTextColors = [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY] as const;

// 1:1 sSpriteSheet_Confetti / sSpritePalette_Confetti (c:151-161). data = clé assetCache
// (résolue par LoadCompressedSpriteSheet), tag NUMÉRIQUE (= confetti_util.ts, GetSpriteTileStartByTag).
const sSpriteSheet_Confetti = { data: 'gConfetti_Gfx', size: 0x220, tag: TAG_CONFETTI };
const sSpritePalette_Confetti = { data: 'gConfetti_Pal', tag: TAG_CONFETTI };

// 1:1 sHallOfFame_MonFullTeamPositions / HalfTeam (c:163-178) : [startX, startY, destX, destY].
const sHallOfFame_MonFullTeamPositions: readonly (readonly number[])[] = [
  [120, 210, 120, 40],
  [326, 220, 56, 40],
  [-86, 220, 184, 40],
  [120, -62, 120, 88],
  [-70, -92, 200, 88],
  [310, -92, 40, 88],
];
const sHallOfFame_MonHalfTeamPositions: readonly (readonly number[])[] = [
  [120, 234, 120, 64],
  [326, 244, 56, 64],
  [-86, 244, 184, 64],
];

// 1:1 sOamData_Confetti (c:180-195) — SPRITE_SHAPE(8x8)=0, SPRITE_SIZE(8x8)=0, 4bpp.
const sOamData_Confetti = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0, shape: 0, x: 0,
  matrixNum: 0, size: 0, tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0,
};

// 1:1 sAnim_*Confetti + sAnims_Confetti (c:197-318) : 17 anims 1-frame (chacune sélectionne 1 tuile).
const sAnims_Confetti = Array.from({ length: 17 }, (_v, i) => [ANIMCMD_FRAME(i, 30), ANIMCMD_END]);

// 1:1 sSpriteTemplate_HofConfetti (c:320-329).
const sSpriteTemplate_HofConfetti = {
  tileTag: TAG_CONFETTI, paletteTag: TAG_CONFETTI, oam: sOamData_Confetti, anims: sAnims_Confetti,
  images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCB_HofConfetti,
};

// 1:1 sHallOfFame_Pal / sHallOfFame_Gfx (c:331-333) : graphics/misc/japanese_hof.png. Liés depuis
// l'assetCache (préchargement async) — cf. _bindHofGfxAssets.
let sHallOfFame_Pal: Uint16Array | null = null;
let sHallOfFame_Gfx: Uint8Array | null = null;

// ═══ code (1:1 hall_of_fame.c:350+) ═══════════════════════════════════════════

/** 1:1 `static void VBlankCB_HallOfFame(void)` (c:351-356). */
function VBlankCB_HallOfFame(): void {
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
}

/** 1:1 `static void CB2_HallOfFame(void)` (c:358-365). */
function CB2_HallOfFame(): void {
  RunTasks();
  RunTextPrinters();
  AnimateSprites();
  BuildOamBuffer();
  UpdatePaletteFade();
}

/** 1:1 `static bool8 InitHallOfFameScreen(void)` (c:367-408). */
function InitHallOfFameScreen(): boolean {
  switch (gMain.state) {
    case 0:
      SetVBlankCallback(null);
      ClearVramOamPltt_LoadHofPal();
      sHofGfxPtr = { state: 0, tilemap1: new Uint16Array(0x800), tilemap2: new Uint16Array(0x800) };
      gMain.state = 1;
      break;
    case 1:
      LoadHofGfx();
      gMain.state++;
      break;
    case 2:
      SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
      SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 7));
      SetGpuReg(REG_OFFSET_BLDY, 0);
      InitHofBgs();
      sHofGfxPtr!.state = 0;
      gMain.state++;
      break;
    case 3:
      if (!LoadHofBgs()) {
        SetVBlankCallback(VBlankCB_HallOfFame);
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
        gMain.state++;
      }
      break;
    case 4:
      UpdatePaletteFade();
      if (!gPaletteFade.active) {
        SetMainCallback2(CB2_HallOfFame);
        PlayBGM(MUS_HALL_OF_FAME);
        return false;
      }
      break;
  }
  return true;
}

// #define tDontSaveData   data[0]   · tDisplayedMonId data[1] · tMonNumber data[2]
// #define tFrameCount     data[3]   · tPlayerSpriteID data[4] · tMonSpriteId(i) data[i + 5]

/** 1:1 `void CB2_DoHallOfFameScreen(void)` (c:417-425). */
export function CB2_DoHallOfFameScreen(): void {
  if (!_ensureHofAssets()) return; // GATE assets (cf. en-tête) — hors 1:1 (adaptation fetch async).
  if (!InitHallOfFameScreen()) {
    const taskId = CreateTask((t: { taskId: number }) => Task_Hof_InitMonData(t.taskId), 0);
    gTasks[taskId].data[0] /* tDontSaveData */ = 0; // FALSE
    sHofMonPtr = emptyHofTeam();
  }
}

/** 1:1 `void CB2_DoHallOfFameScreenDontSaveData(void)` (c:427-435). Réentrée continue-after-HOF
 *  (gGameContinueCallback) — atteignable si le flux continue est câblé dessus (dette : notre
 *  continue-warp mène à la chambre, cf. GameClear). Portée 1:1 pour complétude. */
export function CB2_DoHallOfFameScreenDontSaveData(): void {
  if (!_ensureHofAssets()) return;
  if (!InitHallOfFameScreen()) {
    const taskId = CreateTask((t: { taskId: number }) => Task_Hof_InitMonData(t.taskId), 0);
    gTasks[taskId].data[0] /* tDontSaveData */ = 1; // TRUE
    sHofMonPtr = emptyHofTeam();
  }
}

/** 1:1 `static void Task_Hof_InitMonData(u8 taskId)` (c:437-480). */
function Task_Hof_InitMonData(taskId: number): void {
  gTasks[taskId].data[2] /* tMonNumber */ = 0; // valid pokes

  for (let i = 0; i < PARTY_SIZE; i++) {
    if (GetMonData(gPlayerParty[i], MON_DATA_SPECIES)) {
      const nickname = GetMonData(gPlayerParty[i], MON_DATA_NICKNAME) as unknown;
      const nickBytes = typeof nickname === 'string' ? encodeOwText(nickname) : (nickname as Uint8Array);
      sHofMonPtr!.mon[i].species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES_OR_EGG) as number;
      sHofMonPtr!.mon[i].tid = GetMonData(gPlayerParty[i], MON_DATA_OT_ID) as number;
      sHofMonPtr!.mon[i].personality = GetMonData(gPlayerParty[i], MON_DATA_PERSONALITY) as number;
      sHofMonPtr!.mon[i].lvl = GetMonData(gPlayerParty[i], MON_DATA_LEVEL) as number;
      for (let j = 0; j < POKEMON_NAME_LENGTH; j++)
        sHofMonPtr!.mon[i].nickname[j] = nickBytes[j] ?? EOS;
      gTasks[taskId].data[2] /* tMonNumber */++;
    } else {
      sHofMonPtr!.mon[i].species = SPECIES_NONE;
      sHofMonPtr!.mon[i].tid = 0;
      sHofMonPtr!.mon[i].personality = 0;
      sHofMonPtr!.mon[i].lvl = 0;
      sHofMonPtr!.mon[i].nickname[0] = EOS;
    }
  }

  sHofFadePalettes = 0;
  gTasks[taskId].data[1] /* tDisplayedMonId */ = 0;
  gTasks[taskId].data[4] /* tPlayerSpriteID */ = SPRITE_NONE;

  for (let i = 0; i < PARTY_SIZE; i++)
    gTasks[taskId].data[i + 5] /* tMonSpriteId(i) */ = SPRITE_NONE;

  if (gTasks[taskId].data[0] /* tDontSaveData */)
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_SetMonDisplayTask(t.taskId);
  else
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_InitTeamSaveData(t.taskId);
}

/** 1:1 `static void Task_Hof_InitTeamSaveData(u8 taskId)` (c:482-519). Anneau des records EN
 *  MÉMOIRE (sHofRecords ≡ gDecompressionBuffer, cf. en-tête). */
function Task_Hof_InitTeamSaveData(taskId: number): void {
  // 1:1 : gHasHallOfFameRecords faux (1er clear) → clear l'anneau ; sinon LoadGameSave(SAVE_HALL_OF_FAME)
  // (secteurs HOF non persistés → l'anneau en mémoire tient lieu de lecture, cf. en-tête).
  if (!gHasHallOfFameRecords) {
    sHofRecords = Array.from({ length: HALL_OF_FAME_MAX_TEAMS }, emptyHofTeam);
  }
  // (else : LoadGameSave(SAVE_HALL_OF_FAME) — pas de secteur SRAM ; sHofRecords conserve la session.)

  // 1:1 c:497-512 : trouve la 1re équipe vide (mon[0].species == SPECIES_NONE) ; si l'anneau est
  // plein, décale tout d'un cran vers le bas puis écrit dans la dernière.
  let i = 0;
  for (; i < HALL_OF_FAME_MAX_TEAMS; i++)
    if (sHofRecords[i].mon[0].species === SPECIES_NONE) break;

  let lastSavedIdx = i;
  if (i >= HALL_OF_FAME_MAX_TEAMS) {
    for (let k = 0; k < HALL_OF_FAME_MAX_TEAMS - 1; k++)
      copyHofTeam(sHofRecords[k], sHofRecords[k + 1]);
    lastSavedIdx = HALL_OF_FAME_MAX_TEAMS - 1;
  }
  copyHofTeam(sHofRecords[lastSavedIdx], sHofMonPtr!);

  DrawDialogueFrame(0, false);
  AddTextPrinterParameterized2(0, FONT_NORMAL, getString('gText_SavingDontTurnOffPower'), 0, null, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
  CopyWindowToVram(0, COPYWIN_FULL);
  gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_TrySaveData(t.taskId);
}

/** 1:1 `static void Task_Hof_TrySaveData(u8 taskId)` (c:521-541). */
function Task_Hof_TrySaveData(taskId: number): void {
  // 1:1 : gGameContinueCallback = CB2_DoHallOfFameScreenDontSaveData (réentrée HOF au CONTINUE).
  // Adaptation : notre continue-warp mène à la chambre (GameClear/SetContinueGameWarp) → l'assignation
  // du callback continue est un no-op documenté (flux continue différent, déjà géré).
  // gGameContinueCallback = CB2_DoHallOfFameScreenDontSaveData;

  // 1:1 : TrySavingData(SAVE_HALL_OF_FAME) — notre save écrit la sauvegarde NORMALE (effet durable :
  // flags Champion + warp continue posés par GameClear). Les secteurs HOF ne sont pas modélisés (cf.
  // en-tête). La sauvegarde est TENTÉE ici (side-effect durable), qu'elle réussisse ou soit verrouillée
  // (modes test ?debug → SetSaveLocked).
  const status = TrySavingData();

  // 1:1 c:524 : la branche d'ABANDON exige `SAVE_STATUS_ERROR && gDamagedSaveSectors != 0` (= SRAM
  // GÉNUINEMENT corrompue). `gDamagedSaveSectors` n'est PAS modélisé dans notre save (toujours 0) →
  // cette condition est TOUJOURS fausse → la branche d'abandon est INERTE (transcrite pour la fidélité,
  // jamais atteinte). ⚠️ NE PAS abandonner sur un simple `!status` (save verrouillée/bénigne = ?debug)
  // sinon l'écran HOF meurt juste après le message "SAUVEGARDE". Le jeu réel continue TOUJOURS ici.
  const gDamagedSaveSectors = 0; // non modélisé (adaptation save, cf. en-tête)
  if (status === false /* SAVE_STATUS_ERROR */ && gDamagedSaveSectors !== 0) {
    // 1:1 c:526-534 (branche erreur SRAM endommagée) — INERTE (jamais atteinte, cf. ci-dessus).
    UnsetBgTilemapBuffer(1);
    UnsetBgTilemapBuffer(3);
    FreeAllWindowBuffers();
    sHofGfxPtr = null;
    sHofMonPtr = null;
    DestroyTask(taskId);
  } else {
    PlaySE(SE_SAVE);
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_WaitToDisplayMon(t.taskId);
    gTasks[taskId].data[3] /* tFrameCount */ = 32;
  }
}

/** 1:1 `static void Task_Hof_WaitToDisplayMon(u8 taskId)` (c:543-549). */
function Task_Hof_WaitToDisplayMon(taskId: number): void {
  if (gTasks[taskId].data[3] /* tFrameCount */)
    gTasks[taskId].data[3]--;
  else
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_SetMonDisplayTask(t.taskId);
}

/** 1:1 `static void Task_Hof_SetMonDisplayTask(u8 taskId)` (c:551-554). */
function Task_Hof_SetMonDisplayTask(taskId: number): void {
  gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_DisplayMon(t.taskId);
}

// #define tDestinationX data[1] · tDestinationY data[2] · tSpecies data[7]  (SPRITE data)

/** 1:1 `static void Task_Hof_DisplayMon(u8 taskId)` (c:560-595). */
function Task_Hof_DisplayMon(taskId: number): void {
  const rt = getRuntime();
  const currMonId = gTasks[taskId].data[1] /* tDisplayedMonId */;
  const currMon = sHofMonPtr!.mon[currMonId];

  let startX: number, startY: number, destX: number, destY: number;
  if (gTasks[taskId].data[2] /* tMonNumber */ > PARTY_SIZE / 2) {
    startX = sHallOfFame_MonFullTeamPositions[currMonId][0];
    startY = sHallOfFame_MonFullTeamPositions[currMonId][1];
    destX = sHallOfFame_MonFullTeamPositions[currMonId][2];
    destY = sHallOfFame_MonFullTeamPositions[currMonId][3];
  } else {
    startX = sHallOfFame_MonHalfTeamPositions[currMonId][0];
    startY = sHallOfFame_MonHalfTeamPositions[currMonId][1];
    destX = sHallOfFame_MonHalfTeamPositions[currMonId][2];
    destY = sHallOfFame_MonHalfTeamPositions[currMonId][3];
  }

  if (currMon.species === SPECIES_EGG)
    destY += 10;

  const speciesKey = reverseDecompConstant(currMon.species, 'SPECIES_') ?? 'SPECIES_NONE';
  const spriteId = CreateMonPicSprite_Affine(speciesKey, currMon.tid, currMon.personality, MON_PIC_AFFINE_FRONT, startX, startY, currMonId, TAG_NONE);
  const sprite = rt.gSprites[spriteId];
  if (sprite) {
    sprite.data[1] /* tDestinationX */ = destX;
    sprite.data[2] /* tDestinationY */ = destY;
    sprite.data[0] = 0;
    sprite.data[7] /* tSpecies */ = currMon.species;
    sprite.callback = SpriteCB_GetOnScreenAndAnimate as unknown as DecompSprite['callback'];
  }
  gTasks[taskId].data[currMonId + 5] /* tMonSpriteId(currMonId) */ = spriteId;
  ClearDialogWindowAndFrame(0, true);
  gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_PrintMonInfoAfterAnimating(t.taskId);
}

/** 1:1 `static void Task_Hof_PrintMonInfoAfterAnimating(u8 taskId)` (c:597-610). */
function Task_Hof_PrintMonInfoAfterAnimating(taskId: number): void {
  const rt = getRuntime();
  const currMonId = gTasks[taskId].data[1] /* tDisplayedMonId */;
  const currMon = sHofMonPtr!.mon[currMonId];
  const monSprite = rt.gSprites[gTasks[taskId].data[currMonId + 5] /* tMonSpriteId */];

  if (monSprite && monSprite.callback === (SpriteCallbackDummy as unknown as DecompSprite['callback'])) {
    _oam(monSprite).affineMode = 0; // ST_OAM_AFFINE_OFF
    HallOfFame_PrintMonInfo(currMon, 0, 14);
    gTasks[taskId].data[3] /* tFrameCount */ = 120;
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_TryDisplayAnotherMon(t.taskId);
  }
}

/** 1:1 `static void Task_Hof_TryDisplayAnotherMon(u8 taskId)` (c:612-636). */
function Task_Hof_TryDisplayAnotherMon(taskId: number): void {
  const rt = getRuntime();
  const currPokeID = gTasks[taskId].data[1] /* tDisplayedMonId */;
  const currMon = sHofMonPtr!.mon[currPokeID];

  if (gTasks[taskId].data[3] /* tFrameCount */ !== 0) {
    gTasks[taskId].data[3]--;
  } else {
    const spr = rt.gSprites[gTasks[taskId].data[currPokeID + 5]];
    sHofFadePalettes |= (0x10000 << _oam(spr).paletteBank);
    if (gTasks[taskId].data[1] < PARTY_SIZE - 1 && sHofMonPtr!.mon[currPokeID + 1].species !== SPECIES_NONE) {
      gTasks[taskId].data[1]++; // tDisplayedMonId
      BeginNormalPaletteFade(sHofFadePalettes, 0, 12, 12, RGB(16, 29, 24));
      _oam(spr).priority = 1;
      gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_DisplayMon(t.taskId);
    } else {
      gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_PaletteFadeAndPrintWelcomeText(t.taskId);
    }
    void currMon;
  }
}

/** 1:1 `static void Task_Hof_PaletteFadeAndPrintWelcomeText(u8 taskId)` (c:638-653). */
function Task_Hof_PaletteFadeAndPrintWelcomeText(taskId: number): void {
  const rt = getRuntime();
  BeginNormalPaletteFade(PALETTES_OBJECTS, 0, 0, 0, RGB_BLACK);
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (gTasks[taskId].data[i + 5] !== SPRITE_NONE) {
      const spr = rt.gSprites[gTasks[taskId].data[i + 5]];
      if (spr) _oam(spr).priority = 0;
    }
  }
  HallOfFame_PrintWelcomeText(0, 15);
  PlaySE(SE_APPLAUSE);
  gTasks[taskId].data[3] /* tFrameCount */ = 400;
  gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_DoConfetti(t.taskId);
}

/** 1:1 `static void Task_Hof_DoConfetti(u8 taskId)` (c:655-680). */
function Task_Hof_DoConfetti(taskId: number): void {
  const rt = getRuntime();
  if (gTasks[taskId].data[3] /* tFrameCount */ !== 0) {
    gTasks[taskId].data[3]--;
    // Nouveau confetti tous les 4 frames pour les 290 premières ; les 110 dernières = chute.
    if ((gTasks[taskId].data[3] & 3) === 0 && gTasks[taskId].data[3] > 110)
      CreateHofConfettiSprite();
  } else {
    for (let i = 0; i < PARTY_SIZE; i++) {
      if (gTasks[taskId].data[i + 5] !== SPRITE_NONE) {
        const spr = rt.gSprites[gTasks[taskId].data[i + 5]];
        if (spr) _oam(spr).priority = 1;
      }
    }
    BeginNormalPaletteFade(sHofFadePalettes, 0, 12, 12, RGB(16, 29, 24));
    FillWindowPixelBuffer(0, PIXEL_FILL(0));
    CopyWindowToVram(0, COPYWIN_FULL);
    gTasks[taskId].data[3] /* tFrameCount */ = 7;
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_WaitToDisplayPlayer(t.taskId);
  }
}

/** 1:1 `static void Task_Hof_WaitToDisplayPlayer(u8 taskId)` (c:682-693). */
function Task_Hof_WaitToDisplayPlayer(taskId: number): void {
  if (gTasks[taskId].data[3] /* tFrameCount */ >= 16) {
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_DisplayPlayer(t.taskId);
  } else {
    gTasks[taskId].data[3]++;
    SetGpuReg(REG_OFFSET_BLDALPHA, gTasks[taskId].data[3] * 256);
  }
}

/** 1:1 `static void Task_Hof_DisplayPlayer(u8 taskId)` (c:695-707). */
function Task_Hof_DisplayPlayer(taskId: number): void {
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
  ShowBg(0);
  ShowBg(1);
  ShowBg(3);
  const picId = PlayerGenderToFrontTrainerPicId_Debug(gSaveBlock2Ptr.playerGender ?? MALE);
  gTasks[taskId].data[4] /* tPlayerSpriteID */ = CreateTrainerPicSprite(picId, true, 120, 72, 6, TAG_NONE);
  AddWindow(sHof_WindowTemplate);
  LoadWindowGfx(1, gSaveBlock2Ptr.optionsWindowFrameType ?? 0, 0x21D, BG_PLTT_ID(13));
  const twPal = GetTextWindowPalette(1);
  if (twPal) LoadPalette(twPal, BG_PLTT_ID(14), PLTT_SIZE_4BPP);
  gTasks[taskId].data[3] /* tFrameCount */ = 120;
  gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_WaitAndPrintPlayerInfo(t.taskId);
}

/** 1:1 `static void Task_Hof_WaitAndPrintPlayerInfo(u8 taskId)` (c:709-728). */
function Task_Hof_WaitAndPrintPlayerInfo(taskId: number): void {
  const rt = getRuntime();
  const playerSprite = rt.gSprites[gTasks[taskId].data[4] /* tPlayerSpriteID */];
  if (gTasks[taskId].data[3] /* tFrameCount */ !== 0) {
    gTasks[taskId].data[3]--;
  } else if (playerSprite && playerSprite.x !== 192) {
    playerSprite.x++;
  } else {
    FillBgTilemapBufferRect_Palette0(0, 0, 0, 0, 0x20, 0x20);
    HallOfFame_PrintPlayerInfo(1, 2);
    DrawDialogueFrame(0, false);
    AddTextPrinterParameterized2(0, FONT_NORMAL, getString('gText_LeagueChamp'), 0, null, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
    CopyWindowToVram(0, COPYWIN_FULL);
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_ExitOnKeyPressed(t.taskId);
  }
}

/** 1:1 `static void Task_Hof_ExitOnKeyPressed(u8 taskId)` (c:730-737). */
function Task_Hof_ExitOnKeyPressed(taskId: number): void {
  if (JOY_NEW(A_BUTTON)) {
    FadeOutBGM(4);
    gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_HandlePaletteOnExit(t.taskId);
  }
}

/** 1:1 `static void Task_Hof_HandlePaletteOnExit(u8 taskId)` (c:739-744). */
function Task_Hof_HandlePaletteOnExit(taskId: number): void {
  _cpuCopyPltt(gPlttBufferFaded, gPlttBufferUnfaded, PLTT_SIZE);
  BeginNormalPaletteFade(PALETTES_ALL, 8, 0, 0x10, RGB_BLACK);
  gTasks[taskId].func = (t: { taskId: number }) => Task_Hof_HandleExit(t.taskId);
}

/** 1:1 `static void Task_Hof_HandleExit(u8 taskId)` (c:746-777). */
function Task_Hof_HandleExit(taskId: number): void {
  const rt = getRuntime();
  if (!gPaletteFade.active) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      const spriteId = gTasks[taskId].data[i + 5] /* tMonSpriteId(i) */;
      if (spriteId !== SPRITE_NONE) {
        const spr = rt.gSprites[spriteId];
        if (spr) FreeOamMatrix(spr.matrixNum);
        FreeAndDestroyMonPicSprite(spriteId);
      }
    }

    FreeAndDestroyTrainerPicSprite(gTasks[taskId].data[4] /* tPlayerSpriteID */);
    HideBg(0);
    HideBg(1);
    HideBg(3);
    FreeAllWindowBuffers();
    UnsetBgTilemapBuffer(1);
    UnsetBgTilemapBuffer(3);
    ResetBgsAndClearDma3BusyFlags(0);
    DestroyTask(taskId);

    sHofGfxPtr = null;
    sHofMonPtr = null;

    StartCredits();
  }
}

/** 1:1 `static void StartCredits(void)` (c:779-782). Câblage credits.ts via référence liée
 *  dynamiquement (cf. en-tête : évite la bombe TDZ du graphe statique credits). */
function StartCredits(): void {
  if (_CB2_StartCreditsSequence) {
    SetMainCallback2(_CB2_StartCreditsSequence);
  } else {
    console.error('[hall_of_fame] StartCredits : CB2_StartCreditsSequence non lié (preloadHallOfFameAssets a échoué ?) — retour titre dégradé.');
    void import('./title_screen').then((ts) => SetMainCallback2(ts.CB2_InitTitleScreen as unknown as () => void))
      .catch((e) => console.error('[hall_of_fame] fallback titre', e));
  }
}

// ═══ HallOfFame_Print* (1:1 c:1106-1241) ═════════════════════════════════════

/** 1:1 `static void HallOfFame_PrintWelcomeText(u8, u8)` (c:1106-1112). */
function HallOfFame_PrintWelcomeText(_unusedWindowId: number, _unused2: number): void {
  const welcome = encodeOwText(getString('gText_WelcomeToHOF'));
  FillWindowPixelBuffer(0, PIXEL_FILL(0));
  PutWindowTilemap(0);
  AddTextPrinterParameterized3(0, FONT_NORMAL, GetStringCenterAlignXOffset(FONT_NORMAL, welcome, 0xD0), 1, sMonInfoTextColors, 0, welcome);
  CopyWindowToVram(0, COPYWIN_FULL);
}

/** 1:1 `static void HallOfFame_PrintMonInfo(struct HallofFameMon *currMon, u8, u8)` (c:1114-1195).
 *  Construit un buffer d'octets GBA (StringCopy/encodeOwText + écritures CHAR_*). */
function HallOfFame_PrintMonInfo(currMon: HallofFameMon, _unused1: number, _unused2: number): void {
  const text = new Uint8Array(30);

  FillWindowPixelBuffer(0, PIXEL_FILL(0));
  PutWindowTilemap(0);

  // dex number
  if (currMon.species !== SPECIES_EGG) {
    let p = _strCopy(text, 0, encodeOwText(getString('gText_Number')));
    let dexNumber = SpeciesToPokedexNum(currMon.species);
    if (dexNumber !== 0xFFFF) {
      text[p++] = ((dexNumber / 100) | 0) + CHAR_0;
      dexNumber %= 100;
      text[p++] = ((dexNumber / 10) | 0) + CHAR_0;
      text[p++] = (dexNumber % 10) + CHAR_0;
    } else {
      text[p++] = CHAR_QUESTION_MARK;
      text[p++] = CHAR_QUESTION_MARK;
      text[p++] = CHAR_QUESTION_MARK;
    }
    text[p] = EOS;
    AddTextPrinterParameterized3(0, FONT_NORMAL, 0x10, 1, sMonInfoTextColors, TEXT_SKIP_DRAW, text);
  }

  // nickname, species names, gender and level
  for (let k = 0; k < POKEMON_NAME_LENGTH; k++) text[k] = currMon.nickname[k];
  text[POKEMON_NAME_LENGTH] = EOS;
  if (currMon.species === SPECIES_EGG) {
    const width = GetStringCenterAlignXOffset(FONT_NORMAL, text, 0xD0);
    AddTextPrinterParameterized3(0, FONT_NORMAL, width, 1, sMonInfoTextColors, TEXT_SKIP_DRAW, text);
    CopyWindowToVram(0, COPYWIN_FULL);
  } else {
    let width = GetStringRightAlignXOffset(FONT_NORMAL, text, 0x80);
    AddTextPrinterParameterized3(0, FONT_NORMAL, width, 1, sMonInfoTextColors, TEXT_SKIP_DRAW, text);

    text[0] = CHAR_SLASH;
    let p = _strCopy(text, 1, encodeOwText(gSpeciesNames[currMon.species] ?? ''));

    if (currMon.species !== SPECIES_NIDORAN_M && currMon.species !== SPECIES_NIDORAN_F) {
      switch (GetGenderFromSpeciesAndPersonality(currMon.species, currMon.personality)) {
        case MON_MALE: text[p++] = CHAR_MALE; break;
        case MON_FEMALE: text[p++] = CHAR_FEMALE; break;
      }
    }
    text[p] = EOS;
    AddTextPrinterParameterized3(0, FONT_NORMAL, 0x80, 1, sMonInfoTextColors, TEXT_SKIP_DRAW, text);

    let p2 = _strCopy(text, 0, encodeOwText(getString('gText_Level')));
    _convertInt(text, p2, currMon.lvl, STR_CONV_MODE_LEFT_ALIGN, 3);
    AddTextPrinterParameterized3(0, FONT_NORMAL, 0x24, 0x11, sMonInfoTextColors, TEXT_SKIP_DRAW, text);

    let p3 = _strCopy(text, 0, encodeOwText(getString('gText_IDNumber')));
    _convertInt(text, p3, currMon.tid & 0xFFFF, STR_CONV_MODE_LEADING_ZEROS, 5);
    AddTextPrinterParameterized3(0, FONT_NORMAL, 0x68, 0x11, sMonInfoTextColors, TEXT_SKIP_DRAW, text);

    CopyWindowToVram(0, COPYWIN_FULL);
    void width;
  }
}

/** 1:1 `static void HallOfFame_PrintPlayerInfo(u8, u8)` (c:1197-1241). */
function HallOfFame_PrintPlayerInfo(_unused1: number, _unused2: number): void {
  const text = new Uint8Array(20);

  FillWindowPixelBuffer(1, PIXEL_FILL(1));
  PutWindowTilemap(1);
  DrawStdFrameWithCustomTileAndPalette(1, false, 0x21D, 0xD);
  AddTextPrinterParameterized3(1, FONT_NORMAL, 0, 1, sPlayerInfoTextColors, TEXT_SKIP_DRAW, encodeOwText(getString('gText_Name')));

  const playerName = typeof gSaveBlock2Ptr.playerName === 'string'
    ? encodeOwText(gSaveBlock2Ptr.playerName) : (gSaveBlock2Ptr.playerName as unknown as Uint8Array);
  let width = GetStringRightAlignXOffset(FONT_NORMAL, playerName, 0x70);
  AddTextPrinterParameterized3(1, FONT_NORMAL, width, 1, sPlayerInfoTextColors, TEXT_SKIP_DRAW, playerName);

  const trainerId = (gSaveBlock2Ptr.playerTrainerId[0]) | (gSaveBlock2Ptr.playerTrainerId[1] << 8);
  AddTextPrinterParameterized3(1, FONT_NORMAL, 0, 0x11, sPlayerInfoTextColors, 0, encodeOwText(getString('gText_IDNumber')));
  text[0] = ((trainerId % 100000) / 10000 | 0) + CHAR_0;
  text[1] = ((trainerId % 10000) / 1000 | 0) + CHAR_0;
  text[2] = ((trainerId % 1000) / 100 | 0) + CHAR_0;
  text[3] = ((trainerId % 100) / 10 | 0) + CHAR_0;
  text[4] = ((trainerId % 10) / 1 | 0) + CHAR_0;
  text[5] = EOS;
  width = GetStringRightAlignXOffset(FONT_NORMAL, text, 0x70);
  AddTextPrinterParameterized3(1, FONT_NORMAL, width, 0x11, sPlayerInfoTextColors, TEXT_SKIP_DRAW, text);

  AddTextPrinterParameterized3(1, FONT_NORMAL, 0, 0x21, sPlayerInfoTextColors, TEXT_SKIP_DRAW, encodeOwText(getString('gText_Time')));
  const hours = gSaveBlock2Ptr.playTimeHours ?? 0;
  const minutes = gSaveBlock2Ptr.playTimeMinutes ?? 0;
  text[0] = ((hours / 100) | 0) + CHAR_0;
  text[1] = (((hours % 100) / 10) | 0) + CHAR_0;
  text[2] = ((hours % 10) | 0) + CHAR_0;

  if (text[0] === CHAR_0)
    text[0] = CHAR_SPACE;
  if (text[0] === CHAR_SPACE && text[1] === CHAR_0)
    text[8] = CHAR_SPACE;

  text[3] = CHAR_COLON;
  text[4] = (((minutes % 100) / 10) | 0) + CHAR_0;
  text[5] = ((minutes % 10) | 0) + CHAR_0;
  text[6] = EOS;

  width = GetStringRightAlignXOffset(FONT_NORMAL, text, 0x70);
  AddTextPrinterParameterized3(1, FONT_NORMAL, width, 0x21, sPlayerInfoTextColors, TEXT_SKIP_DRAW, text);

  CopyWindowToVram(1, COPYWIN_FULL);
}

// ═══ gfx / bg init (1:1 c:1243-1336) ═════════════════════════════════════════

/** 1:1 `static void ClearVramOamPltt_LoadHofPal(void)` (c:1243-1272). */
function ClearVramOamPltt_LoadHofPal(): void {
  let vramOffset = VRAM;
  let vramSize = VRAM_SIZE;
  while (true) {
    DmaFill16(3, 0, vramOffset, 0x1000);
    vramOffset += 0x1000;
    vramSize -= 0x1000;
    if (vramSize <= 0x1000) {
      DmaFill16(3, 0, vramOffset, vramSize);
      break;
    }
  }
  DmaFill32(3, 0, OAM, OAM_SIZE);
  DmaFill16(3, 0, PLTT, PLTT_SIZE);

  ResetPaletteFade();
  if (sHallOfFame_Pal) LoadPalette(sHallOfFame_Pal, BG_PLTT_ID(0), sHallOfFame_Pal.byteLength);
}

/** 1:1 `static void LoadHofGfx(void)` (c:1274-1285). */
function LoadHofGfx(): void {
  ScanlineEffect_Stop();
  ResetTasksNoop(); // ResetTasks() — cf. note ci-dessous
  ResetSpriteData();
  ResetTempTileDataBuffers();
  ResetAllPicSprites();
  FreeAllSpritePalettes();
  setReservedSpritePaletteCount(8);
  LoadCompressedSpriteSheet(sSpriteSheet_Confetti);
  LoadSpritePalette(sSpritePalette_Confetti); // 1:1 LoadCompressedSpritePalette (palette taguée par tag)
}

/** 1:1 `static void InitHofBgs(void)` (c:1287-1299). */
function InitHofBgs(): void {
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sHof_BgTemplates, sHof_BgTemplates.length);
  SetBgTilemapBuffer(1, sHofGfxPtr!.tilemap1);
  SetBgTilemapBuffer(3, sHofGfxPtr!.tilemap2);
  ChangeBgX(0, 0, BG_COORD_SET);
  ChangeBgY(0, 0, BG_COORD_SET);
  ChangeBgX(1, 0, BG_COORD_SET);
  ChangeBgY(1, 0, BG_COORD_SET);
  ChangeBgX(3, 0, BG_COORD_SET);
  ChangeBgY(3, 0, BG_COORD_SET);
}

/** 1:1 `static bool8 LoadHofBgs(void)` (c:1301-1336). */
function LoadHofBgs(): boolean {
  switch (sHofGfxPtr!.state) {
    case 0:
      DecompressAndCopyTileDataToVram(1, sHallOfFame_Gfx, 0, 0, 0);
      break;
    case 1:
      if (FreeTempTileDataBuffersIfPossible())
        return true;
      break;
    case 2:
      FillBgTilemapBufferRect_Palette0(1, 1, 0, 0, 0x20, 2);
      FillBgTilemapBufferRect_Palette0(1, 0, 0, 3, 0x20, 0xB);
      FillBgTilemapBufferRect_Palette0(1, 1, 0, 0xE, 0x20, 6);
      FillBgTilemapBufferRect_Palette0(3, 2, 0, 0, 0x20, 0x20);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(3);
      break;
    case 3:
      InitStandardTextBoxWindows();
      InitTextBoxGfxAndPrinters();
      break;
    case 4:
      SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON);
      ShowBg(0);
      ShowBg(1);
      ShowBg(3);
      sHofGfxPtr!.state = 0;
      return false;
  }
  sHofGfxPtr!.state++;
  return true;
}

// ═══ sprites (1:1 c:1338-1413) ═══════════════════════════════════════════════

/** 1:1 `static void SpriteCB_GetOnScreenAndAnimate(struct Sprite *sprite)` (c:1338-1362). */
function SpriteCB_GetOnScreenAndAnimate(sprite: DecompSprite): void {
  const rt = getRuntime();
  const destX = sprite.data[1] /* tDestinationX */;
  const destY = sprite.data[2] /* tDestinationY */;
  if (sprite.x !== destX || sprite.y !== destY) {
    if (sprite.x < destX) sprite.x += 15;
    if (sprite.x > destX) sprite.x -= 15;
    if (sprite.y < destY) sprite.y += 10;
    if (sprite.y > destY) sprite.y -= 10;
  } else {
    const species = sprite.data[7] /* tSpecies */;
    // 1:1 : DoMonFrontSpriteAnimation(sprite, species, TRUE/FALSE, 3). Port : (rt, sprite, species,
    // noCry, panModeAnimFlag, playCryFn) — panModeAnimFlag = 3.
    if (species === SPECIES_EGG)
      DoMonFrontSpriteAnimation(rt, sprite, species, true, 3, PlayCry_Normal);
    else
      DoMonFrontSpriteAnimation(rt, sprite, species, false, 3, PlayCry_Normal);
  }
}

// #define sSineIdx data[0] · sExtraY data[1]  (SPRITE data, confetti)

/** 1:1 `static void SpriteCB_HofConfetti(struct Sprite *sprite)` (c:1371-1391). */
function SpriteCB_HofConfetti(sprite: DecompSprite): void {
  if (sprite.y2 > 120) {
    DestroySprite(sprite.spriteId);
  } else {
    sprite.y2++;
    sprite.y2 += sprite.data[1] /* sExtraY */;

    const sineIdx = sprite.data[0] /* sSineIdx */ & 0xFF;
    const rand = (Random() % 4) + 8;
    sprite.x2 = (rand * gSineTable[sineIdx] / 256) | 0;

    sprite.data[0] += 4;
  }
}

/** 1:1 `static bool8 CreateHofConfettiSprite(void)` (c:1393-1413). */
function CreateHofConfettiSprite(): boolean {
  const rt = getRuntime();
  const posX = Random() % DISPLAY_WIDTH;
  const posY = -(Random() % 8);

  const spriteId = CreateSprite(sSpriteTemplate_HofConfetti, posX, posY, 0);
  const sprite = rt.gSprites[spriteId];
  if (!sprite) return false;

  StartSpriteAnim(sprite as never, Random() % sAnims_Confetti.length);

  // 1/4 des confettis descendent d'une coord Y de plus par frame.
  if (Random() & 3)
    sprite.data[1] /* sExtraY */ = 0;
  else
    sprite.data[1] = 1;

  return false;
}

// ═══ Battle Dome confetti (1:1 c:1415-1534) — confetti_util ══════════════════
// #define tState data[0] · tTimer data[1] · tConfettiCount data[15]
// CONFETTI_SINE_IDX 0 · CONFETTI_EXTRA_Y 1 · CONFETTI_TASK_ID 7

/** 1:1 `void DoDomeConfetti(void)` (c:1427-1438). Consommateur : battle_dome (Frontier). */
export function DoDomeConfetti(): void {
  // 1:1 : gSpecialVar_0x8004/0x8005 = VAR_0x8004/0x8005 (accès via VarSet/VarGet dans notre port).
  VarSet(VAR_0x8004, 180);
  const taskId = CreateTask((t: { taskId: number }) => Task_DoDomeConfetti(t.taskId), 0);
  if (taskId !== 0xFF) {
    gTasks[taskId].data[1] /* tTimer */ = VarGet(VAR_0x8004);
    VarSet(VAR_0x8005, taskId);
  }
}

/** 1:1 `static void StopDomeConfetti(void)` (c:1440-1450). */
function StopDomeConfetti(): void {
  const taskId = FindTaskIdByFunc(Task_DoDomeConfetti);
  if (taskId !== 0xFF) DestroyTask(taskId);
  ConfettiUtil_Free();
  FreeSpriteTilesByTag(TAG_CONFETTI);
  FreeSpritePaletteByTag(TAG_CONFETTI);
}

/** 1:1 `static void UpdateDomeConfetti(struct ConfettiUtil *util)` (c:1452-1477). */
function UpdateDomeConfetti(util: DomeConfettiUtil): void {
  if (util.yDelta > 110) {
    gTasks[util.data[7] /* CONFETTI_TASK_ID */].data[15] /* tConfettiCount */--;
    ConfettiUtil_Remove(util.id);
  } else {
    util.yDelta++;
    util.yDelta += util.data[1] /* CONFETTI_EXTRA_Y */;
    const sineIdx = util.data[0] /* CONFETTI_SINE_IDX */ & 0xFF;
    let rand = Random();
    rand &= 3;
    rand += 8;
    util.xDelta = (rand * gSineTable[sineIdx] / 256) | 0;
    util.data[0] += 4;
  }
}

/** 1:1 `static void Task_DoDomeConfetti(u8 taskId)` (c:1479-1534). */
function Task_DoDomeConfetti(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[0] /* tState */) {
    case 0:
      if (!ConfettiUtil_Init(64)) {
        DestroyTask(taskId);
        VarSet(VAR_0x8004, 0);
        VarSet(VAR_0x8005, 0xFFFF);
      }
      LoadCompressedSpriteSheet(sSpriteSheet_Confetti);
      LoadSpritePalette(sSpritePalette_Confetti);
      data[0]++;
      break;
    case 1: {
      let id = 0;
      if (data[1] /* tTimer */ !== 0 && data[1] % 3 === 0) {
        id = ConfettiUtil_AddNew(sOamData_Confetti, TAG_CONFETTI, TAG_CONFETTI,
          Random() % DISPLAY_WIDTH, -(Random() % 8), Random() % sAnims_Confetti.length, id);
        if (id !== 0xFF) {
          ConfettiUtil_SetCallback(id, UpdateDomeConfetti);
          if ((Random() % 4) === 0)
            ConfettiUtil_SetData(id, 1 /* CONFETTI_EXTRA_Y */, 1);
          ConfettiUtil_SetData(id, 7 /* CONFETTI_TASK_ID */, taskId);
          data[15] /* tConfettiCount */++;
        }
      }
      ConfettiUtil_Update();
      if (data[1] /* tTimer */ !== 0)
        data[1]--;
      else if (data[15] /* tConfettiCount */ === 0)
        data[0] = 0xFF;
      break;
    }
    case 0xFF:
      StopDomeConfetti();
      VarSet(VAR_0x8004, 0);
      VarSet(VAR_0x8005, 0xFFFF);
      break;
  }
}

// ═══ helpers moteur (adaptations citées) ═════════════════════════════════════

/** 1:1 `u16 SpeciesToPokedexNum(u16 species)` (pokemon.c:6364-6377) — porté ici (foyer pokemon.ts
 *  évité : import event_data = risque de cycle sur un module coeur). */
function SpeciesToPokedexNum(species: number): number {
  if (IsNationalPokedexEnabled()) {
    return SpeciesToNationalPokedexNum(species);
  } else {
    const hoenn = SpeciesToHoennPokedexNum(species);
    if (hoenn <= HOENN_DEX_COUNT) return hoenn;
    return 0xFFFF;
  }
}

/** 1:1 `u16 PlayerGenderToFrontTrainerPicId_Debug(u8 gender, bool8 getClass=TRUE)`
 *  (trainer_pokemon_sprites.c:385-393) : gFacilityClassToPicIndex[FACILITY_CLASS_BRENDAN/MAY].
 *  La chaîne facilityClass→picIndex se résout au front pic du joueur → 'TRAINER_PIC_BRENDAN/MAY'. */
function PlayerGenderToFrontTrainerPicId_Debug(gender: number): string {
  return gender !== MALE ? 'TRAINER_PIC_MAY' : 'TRAINER_PIC_BRENDAN';
}

/** Accès OAM runtime d'un sprite (`.oam.X` décomp → gba.oam[oamIndex], cf. mémoire
 *  screen-cb2 / paletteBank via oamIndex). */
function _oam(sprite: DecompSprite | undefined): { paletteBank: number; priority: number; affineMode: number } {
  return getRuntime().gba.oam[sprite!.oamIndex] as unknown as { paletteBank: number; priority: number; affineMode: number };
}

/** StringCopy vers un buffer d'octets à un offset → retourne l'offset du EOS (= pointeur post-copie
 *  1:1 `StringCopy` qui renvoie le ptr sur l'EOS). `src` termine par EOS (encodeOwText). */
function _strCopy(dest: Uint8Array, offset: number, src: Uint8Array): number {
  let i = 0;
  for (; i < src.length && src[i] !== EOS; i++) dest[offset + i] = src[i];
  dest[offset + i] = EOS;
  return offset + i;
}

/** ConvertIntToDecimalStringN écrivant à un offset du buffer. */
function _convertInt(dest: Uint8Array, offset: number, value: number, mode: number, n: number): void {
  const tmp = new Uint8Array(16);
  ConvertIntToDecimalStringN(tmp, value, mode, n);
  _strCopy(dest, offset, tmp);
}

/** CpuCopy16(gPlttBufferFaded, gPlttBufferUnfaded, PLTT_SIZE) — les buffers sont des Proxies
 *  (lire via .get(i), écrire via [i]). Copie octet-palette 1:1. */
function _cpuCopyPltt(src: unknown, dst: unknown, sizeBytes: number): void {
  const s = src as { get(i: number): number };
  const d = dst as Record<number, number>;
  const entries = sizeBytes / 2; // u16 par entrée palette
  for (let i = 0; i < entries; i++) d[i] = s.get(i);
}

/** ResetTasks() — 1:1 LoadHofGfx c:1277. Le runtime réinitialise déjà les tasks à l'entrée CB2 ;
 *  cet appel remet la table à zéro (via le foyer task.ts si dispo). No-op de sécurité documenté. */
function ResetTasksNoop(): void {
  const r = getRuntime() as unknown as { ResetTasks?: () => void };
  if (typeof r.ResetTasks === 'function') r.ResetTasks();
}

// ═══ confetti_util (Battle Dome) — liés paresseusement pour éviter un cycle statique ═══
type DomeConfettiUtil = { yDelta: number; xDelta: number; id: number; data: number[] };
import {
  ConfettiUtil_Init, ConfettiUtil_Free, ConfettiUtil_Update, ConfettiUtil_AddNew,
  ConfettiUtil_SetCallback, ConfettiUtil_SetData, ConfettiUtil_Remove,
} from './confetti_util';

// ═══ Préchargement assets + liaison credits (appelé à GameClear) ═════════════

let _hofAssetsRequested = false;
let _hofAssetsSettled = false;
let _hofNeedStateReset = false; // ré-armé à CHAQUE preload (= chaque GameClear) pour la ré-entrée HOF.
let _CB2_StartCreditsSequence: (() => void) | null = null;

/** GATE assets du CB2 : true quand le préchargement est réglé (chargé OU échoué → jamais de gel).
 *  Lie les symboles gfx sync (sHallOfFame_Pal/Gfx) + reset gMain.state UNE fois par cycle de
 *  préchargement (ré-armé par preloadHallOfFameAssets → correct pour une 2e entrée HOF / DontSaveData). */
function _ensureHofAssets(): boolean {
  if (!_hofAssetsRequested) {
    // Filet de sécurité : si GameClear n'a pas lancé le préchargement, le faire ici.
    preloadHallOfFameAssets().catch((e) => console.error('[hall_of_fame] preload (gate)', e));
  }
  if (!_hofAssetsSettled) return false;
  if (_hofNeedStateReset) {
    _bindHofGfxAssets();
    // 1:1 SetMainCallback2 reset gMain.state=0 (le runtime ne le fait pas — cf. main.ts) : la
    // state-machine InitHallOfFameScreen DOIT démarrer à l'état 0, avant son 1er run.
    getRuntime().gMain.state = 0;
    _hofNeedStateReset = false;
  }
  return true;
}

/** Lie sHallOfFame_Pal/Gfx depuis l'assetCache (préchargés). HURLE si absent (rendu dégradé). */
function _bindHofGfxAssets(): void {
  const pal = assetCache.get('sHallOfFame_Pal');
  const gfx = assetCache.get('sHallOfFame_Gfx');
  if (pal) sHallOfFame_Pal = pal as Uint16Array;
  else console.error('[hall_of_fame] asset manquant : sHallOfFame_Pal (japanese_hof.png) — fond HOF dégradé.');
  if (gfx) sHallOfFame_Gfx = gfx as Uint8Array;
  else console.error('[hall_of_fame] asset manquant : sHallOfFame_Gfx (japanese_hof.png) — fond HOF dégradé.');
}

/**
 * Précharge TOUS les assets de l'écran Hall of Fame + lie le générique. À lancer À GameClear
 * (post_battle_event_funcs) avec `.catch` hurlant — JAMAIS dans le CB2 synchrone (piège FREEZE).
 *   - fond HOF (japanese_hof.png) + confetti (confetti.png) → assetCache (clés sync).
 *   - front pics de l'équipe (substrat mon-pic) + front pic du joueur (substrat trainer-pic).
 *   - assets du générique (preloadCreditsAssets) + liaison CB2_StartCreditsSequence (import dynamique).
 * Tout asset absent → HURLE (console.error) SANS figer.
 */
export async function preloadHallOfFameAssets(): Promise<void> {
  _hofAssetsRequested = true;
  _hofAssetsSettled = false;   // re-gate : l'équipe peut différer à une 2e victoire (re-fetch substrats).
  _hofNeedStateReset = true;   // ré-arme le reset gMain.state pour cette entrée HOF.
  try {
    const { loadTileBin, loadIndexedPngStrict, loadGbaPal, extractPngPlte } = await import('../harness/gba/png-loader');

    // ── Fond HOF (graphics/misc/japanese_hof.png : 29 tuiles 4bpp + palette) ──
    const hofGfxP = (async () => {
      if (!assetCache.has('sHallOfFame_Gfx')) assetCache.set('sHallOfFame_Gfx', await loadTileBin('/decomp/em/misc/japanese_hof.png', 4));
      if (!assetCache.has('sHallOfFame_Pal')) {
        const png = await loadIndexedPngStrict('/decomp/em/misc/japanese_hof.png', 4);
        assetCache.set('sHallOfFame_Pal', png.palette);
      }
    })().catch((e) => console.error('[hall_of_fame] preload japanese_hof', e));

    // ── Confetti (misc/confetti.png : 17 tuiles 4bpp + palette) ──
    const confettiP = (async () => {
      if (!assetCache.has('gConfetti_Gfx')) assetCache.set('gConfetti_Gfx', await loadTileBin('/decomp/em/misc/confetti.png', 4));
      if (!assetCache.has('gConfetti_Pal')) {
        const plte = await extractPngPlte('/decomp/em/misc/confetti.png');
        if (plte) assetCache.set('gConfetti_Pal', plte.subarray(0, 16));
      }
    })().catch((e) => console.error('[hall_of_fame] preload confetti', e));

    // ── Front pics de l'équipe (substrat mon-pic, keyé enumName) ──
    const monP = (async () => {
      const { _registerMonPicSubstrate } = await import('./trainer_pokemon_sprites');
      const done = new Set<string>();
      for (let i = 0; i < PARTY_SIZE; i++) {
        const mon = gPlayerParty[i];
        if (!mon || !GetMonData(mon, MON_DATA_SPECIES)) continue;
        const sp = GetMonData(mon, MON_DATA_SPECIES_OR_EGG) as number;
        const key = reverseDecompConstant(sp, 'SPECIES_') ?? 'SPECIES_NONE';
        if (done.has(key)) continue;
        done.add(key);
        const folder = key.replace('SPECIES_', '').toLowerCase();
        try {
          // 1:1 DecompressPic (LoadSpecialPokePic) charge la pic front MULTI-FRAME (anim_front =
          // 64×128 = 2 frames : idle + respiration). Task_Hof_DisplayMon → SpriteCB_GetOnScreenAndAnimate
          // → DoMonFrontSpriteAnimation bascule sur la frame 1 (StartSpriteAnim(.,1)) : le substrat DOIT
          // contenir les 2 frames sinon le toggle pointe des tiles NON chargées = anim CORROMPUE.
          // (front.png = 1 frame seule → fallback si anim_front absent : pas de toggle, frame 0 saine.)
          const [frontTiles, pal] = await Promise.all([
            loadTileBin(`/decomp/em/pokemon/${folder}/anim_front.png`, 4)
              .catch(() => loadIndexedPngStrict(`/decomp/em/pokemon/${folder}/front.png`, 4).then((r) => r.charData)),
            loadGbaPal(`/decomp/em/pokemon/${folder}/normal.pal`),
          ]);
          _registerMonPicSubstrate(key, frontTiles, pal.subarray(0, 16));
        } catch (e) {
          console.error('[hall_of_fame] front pic préload KO', key, e);
        }
      }
    })().catch((e) => console.error('[hall_of_fame] preload mons', e));

    // ── Front pic du joueur (substrat trainer-pic) ──
    const playerP = (async () => {
      const { _registerTrainerPicSubstrate } = await import('./trainer_pokemon_sprites');
      const picId = (gSaveBlock2Ptr.playerGender ?? MALE) !== MALE ? 'TRAINER_PIC_MAY' : 'TRAINER_PIC_BRENDAN';
      const png = picId === 'TRAINER_PIC_MAY' ? 'may' : 'brendan';
      try {
        const [front, pal] = await Promise.all([
          loadIndexedPngStrict(`/decomp/em/trainers/front_pics/${png}.png`, 4),
          loadGbaPal(`/decomp/em/trainers/palettes/${png}.pal`),
        ]);
        _registerTrainerPicSubstrate(picId, front.charData, pal.subarray(0, 16));
      } catch (e) {
        console.error('[hall_of_fame] player pic préload KO', picId, e);
      }
    })().catch((e) => console.error('[hall_of_fame] preload player', e));

    // ── Générique : preload assets + liaison CB2 (import dynamique = hors graphe statique). ──
    const creditsP = (async () => {
      const [loader, creditsMod] = await Promise.all([
        import('../harness/boot/intro-asset-loader'),
        import('./credits'),
      ]);
      _CB2_StartCreditsSequence = creditsMod.CB2_StartCreditsSequence;
      await loader.preloadCreditsAssets();
    })().catch((e) => console.error('[hall_of_fame] preload credits', e));

    await Promise.all([hofGfxP, confettiP, monP, playerP, creditsP]);
  } catch (e) {
    console.error('[hall_of_fame] preloadHallOfFameAssets', e);
  } finally {
    _hofAssetsSettled = true;
  }
}
