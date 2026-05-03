/**
 * copyright-boot.ts
 * -----------------
 * Implémentation manuelle 1:1 décomp de la séquence de boot copyright screen.
 * Source: src/intro.c:1034-1165 (CB2_InitCopyrightScreenAfterBootup,
 * MainCB2_Intro, SetUpCopyrightScreen, LoadCopyrightGraphics).
 *
 * Cette state machine est le premier CB2 appelé après l'init hardware (AgbMain).
 * Elle affiche "©2003 Nintendo / ©2003 Creatures Inc. / ©2003 GAME FREAK inc.",
 * attend ~140 frames, fade out, puis passe à MainCB2_Intro + Task_Scene1_Load.
 */
import {
  getRuntime, LZ77UnCompVram, LoadPalette, CpuFill16, CpuFill32,
  ResetPaletteFade, ResetTasks, FreeAllSpritePalettes,
  ScanlineEffect_Stop, EnableInterrupts,
  UpdatePaletteFade, gMain,
  VRAM, OAM, PLTT, VRAM_SIZE, OAM_SIZE, PLTT_SIZE,
  REG_OFFSET_DISPCNT, REG_OFFSET_BG0CNT, REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  DISPCNT_MODE_0, DISPCNT_OBJ_1D_MAP, DISPCNT_BG0_ON,
  BGCNT_PRIORITY, BGCNT_CHARBASE, BGCNT_SCREENBASE, BGCNT_16COLOR, BGCNT_TXT256x256,
  INTR_FLAG_VBLANK,
} from './decomp-globals';
import { MainCB2_EndIntro, Task_Scene1_Load } from './decomp-data/auto/src/intro-callbacks-auto';
import type { CB2Callback } from './decomp-runtime';

const RGB_WHITE = 0x7FFF;
const COPYRIGHT_INITIALIZE = 0;
const COPYRIGHT_START_FADE = 140;
const COPYRIGHT_START_INTRO = 141;

// ─── Stubs GameCube multiboot ───────────────────────────────────────────────
const gMultibootProgramStruct = { gcmb_field_2: 0 };
function GameCubeMultiBoot_Init(_p: unknown): void { /* stub */ }
function GameCubeMultiBoot_Main(_p: unknown): void { /* stub */ }

// ─── 1:1 décomp intro.c:1060 ────────────────────────────────────────────────
function LoadCopyrightGraphics(tilesetAddress: number, tilemapAddress: number, paletteOffset: number): void {
  LZ77UnCompVram('gIntroCopyright_Gfx', VRAM + tilesetAddress);
  LZ77UnCompVram('gIntroCopyright_Tilemap', VRAM + tilemapAddress);
  LoadPalette('gIntroCopyright_Pal', paletteOffset, 0x20);
}

// ─── 1:1 décomp intro.c:1042 ────────────────────────────────────────────────
export const MainCB2_Intro: CB2Callback = (_rt) => {
  const runtime = getRuntime();
  if (runtime.gMain.newKeys !== 0 && !runtime.gPaletteFade.active) {
    runtime.SetMainCallback2(MainCB2_EndIntro);
  }
  // NOTE: gIntroFrameCounter is incremented once per frame by tickFixed
  // (decomp-runtime.ts). Do NOT increment here — MainCB2_Intro in the real
  // GBA also only runs RunTasks/AnimateSprites/BuildOamBuffer/UpdatePaletteFade
  // which are all handled by tickFixed. The original C increment lives in
  // MainCB2_Intro, but our architecture centralises it in tickFixed.
};

// ─── 1:1 décomp intro.c:1072 ────────────────────────────────────────────────
export function SetUpCopyrightScreen(): number {
  const runtime = getRuntime();
  switch (gMain.state) {
    case COPYRIGHT_INITIALIZE:
      runtime.SetVBlankCallback(null);
      runtime.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      runtime.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      runtime.SetGpuReg(REG_OFFSET_BLDY, 0);
      // Première couleur palette = blanc (white-out initial avant fade-in)
      runtime.gPlttBufferFaded.set(0, RGB_WHITE);
      runtime.SetGpuReg(REG_OFFSET_DISPCNT, 0);
      runtime.SetGpuReg(REG_OFFSET_BG0HOFS, 0);
      runtime.SetGpuReg(REG_OFFSET_BG0VOFS, 0);
      CpuFill32(0, VRAM, VRAM_SIZE);
      CpuFill32(0, OAM, OAM_SIZE);
      CpuFill16(0, PLTT + 2, PLTT_SIZE - 2);
      ResetPaletteFade();
      LoadCopyrightGraphics(0, 0x3800, 0);
      ScanlineEffect_Stop();
      ResetTasks();
      runtime.ResetSpriteData();
      FreeAllSpritePalettes();
      runtime.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_WHITEALPHA');
      runtime.SetGpuReg(REG_OFFSET_BG0CNT,
        BGCNT_PRIORITY(0)
        | BGCNT_CHARBASE(0)
        | BGCNT_SCREENBASE(7)
        | BGCNT_16COLOR
        | BGCNT_TXT256x256
      );
      EnableInterrupts(INTR_FLAG_VBLANK);
      runtime.SetVBlankCallback(() => { /* VBlankCB_Intro stub */ });
      runtime.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON);
      GameCubeMultiBoot_Init(gMultibootProgramStruct);
      // Après l'init, comportement identique au default case (1:1 décomp fall-through)
      UpdatePaletteFade();
      gMain.state++;
      GameCubeMultiBoot_Main(gMultibootProgramStruct);
      break;
    default:
      UpdatePaletteFade();
      gMain.state++;
      GameCubeMultiBoot_Main(gMultibootProgramStruct);
      break;
    case COPYRIGHT_START_FADE:
      GameCubeMultiBoot_Main(gMultibootProgramStruct);
      if (gMultibootProgramStruct.gcmb_field_2 !== 1) {
        runtime.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
        gMain.state++;
      }
      break;
    case COPYRIGHT_START_INTRO:
      if (UpdatePaletteFade()) break;
      runtime.CreateTask((task) => Task_Scene1_Load(task, runtime), 0);
      runtime.SetMainCallback2(MainCB2_Intro);
      return 0;
  }
  return 1;
}

// ─── 1:1 décomp intro.c:1034 ────────────────────────────────────────────────
export const CB2_InitCopyrightScreenAfterBootup: CB2Callback = (rt) => {
  if (!SetUpCopyrightScreen()) {
    // Sur le vrai hardware cette branche init le système de sauvegarde.
    // Sur web on skip (stubs pas implémentés) et on passe directement à l'intro.
    rt.SetMainCallback2(MainCB2_Intro);
  }
};

// ─── 1:1 décomp intro.c:1162 ────────────────────────────────────────────────
// Démon loop : appelé depuis Task_TitleScreenPhase3 quand la BGM termine.
// Re-init la state machine SetUpCopyrightScreen depuis state 0 → reload Copyright
// graphics → fade-in → Task_Scene1_Load → MainCB2_Intro.
// Le décomp ne fait que `SetUpCopyrightScreen();` car en GBA gMain.state était
// laissé à 5 (= sortie title screen) et la state machine fall-through les
// default cases jusqu'à state 141 (COPYRIGHT_START_INTRO). Sur notre engine on
// reset à 0 pour relancer un cycle copyright→intro→title propre.
export const CB2_InitCopyrightScreenAfterTitleScreen: CB2Callback = (_rt) => {
  if (gMain.state >= 2 && gMain.state < 141) gMain.state = 0;
  SetUpCopyrightScreen();
};
