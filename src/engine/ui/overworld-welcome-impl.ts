/**
 * overworld-welcome-impl.ts
 * --------------------------
 * Placeholder pour `CB2_NewGame` post-Birch flow.
 *
 * État actuel : 1:1 décomp src/overworld.c CB2_NewGame appelle DoMapLoadLoop
 * + SetMainCallback2(CB2_Overworld) qui nécessite tout l'engine overworld
 * (= ~500KB de décomp : map loading, object events, scripts, field VBlank
 * callback, etc.). Pas implémenté encore.
 *
 * Cette stub donne un retour visuel à l'utilisateur (= "BIENVENUE EN HOENN!"
 * + BGM Littleroot) pour confirmer que le flow Birch s'est complété
 * correctement. Sera remplacé par CB2_Overworld réel quand on aura porté
 * map loading + tilemap rendering + player avatar.
 */
import {
  getRuntime,
  ResetBgsAndClearDma3BusyFlags,
  InitBgsFromTemplates,
  InitWindows,
  DeactivateAllTextPrinters,
  LoadPalette,
  ShowBg,
  HideBg,
  ResetPaletteFade,
  ScanlineEffect_Stop,
  ResetTasks,
  FreeAllSpritePalettes,
  m4aSongNumStart,
  RunTasks,
  AnimateSprites,
  BuildOamBuffer,
  UpdatePaletteFade,
  DmaFill16, DmaFill32,
  VRAM, VRAM_SIZE, OAM, OAM_SIZE, PLTT, PLTT_SIZE,
} from '../decomp-globals';
import {
  REG_OFFSET_DISPCNT, REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT,
  REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  DISPCNT_BG0_ON, DISPCNT_OBJ_ON, DISPCNT_OBJ_1D_MAP,
} from '../decomp-runtime';
import { CreateWindowTemplate, FillWindowPixelBuffer, FillWindowPixelRect, PutWindowTilemap, CopyWindowToVram, AddWindow, DrawStdFrameWithCustomTileAndPalette } from '../gba-window-system';
import { AddTextPrinterParameterized3 } from '../gba-text-system';
import { gSaveBlock2Ptr } from '../gba-menu-system';
import { MUS_LITTLEROOT as _MUS_LITTLEROOT } from '../decomp-data/include/constants/songs-data';

// 1:1 décomp include/constants/songs.h:336 — MUS_LITTLEROOT (Littleroot Town BGM).
// Migré vers import decomp-data songs-data.ts (cleanup B7).
const MUS_LITTLEROOT = _MUS_LITTLEROOT;

// Init state machine (= CB2_NewGame state-driven init analogue à CB2_Init* décomp).
let _welcomeInited = false;
let _welcomeFrameCounter = 0;

/** 1:1 placeholder décomp `CB2_NewGame` :
 *  - Reset BGs + windows + sprite palettes
 *  - Black BG + window dialogue centré
 *  - Texte "BIENVENUE EN HOENN ! (Overworld TODO)"
 *  - Lance BGM Littleroot
 *
 *  Quand l'engine overworld réel sera porté, cette stub sera remplacée par
 *  l'appel direct à `DoMapLoadLoop` + `SetMainCallback2(CB2_Overworld)`. */
export function CB2_OverworldWelcomePlaceholder(): void {
  const rt = getRuntime();
  if (!rt) return;
  // gMain.state machine pour init progressif (1 frame par étape pour lisser).
  switch (rt.gMain.state) {
    case 0:
      // Reset full graphic state.
      DmaFill16(0, 0, VRAM, VRAM_SIZE);
      DmaFill32(0, 0, OAM, OAM_SIZE);
      DmaFill16(0, 0, PLTT, PLTT_SIZE);
      ScanlineEffect_Stop();
      ResetTasks();
      ResetPaletteFade();
      FreeAllSpritePalettes();
      rt.gMain.state++;
      break;
    case 1:
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, sBgTemplates_Welcome, 1);
      InitWindows(sWindowTemplates_Welcome);
      DeactivateAllTextPrinters();
      rt.gMain.state++;
      break;
    case 2:
      // BG0 visible, palette black BG + white text.
      rt.SetGpuReg(REG_OFFSET_BG0HOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG0VOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG1HOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG1VOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);
      // Palette : 0 = noir, 1 = vert herbe, 2 = blanc, 3 = noir foncé (shadow).
      LoadPalette(_welcomePal, 0, 8);
      // Frame couleur dialogue (palette 15) : load message box gfx via window frame.
      LoadPalette(_dialogPal, 240, 32);
      rt.gMain.state++;
      break;
    case 3: {
      // Setup window + draw frame.
      const winId = AddWindow({ bg: 0, tilemapLeft: 2, tilemapTop: 14, width: 26, height: 4, paletteNum: 15, baseBlock: 1 });
      DrawStdFrameWithCustomTileAndPalette(winId, true, 1, 13);
      // Texte centré dans window.
      const playerName = (gSaveBlock2Ptr.playerName as string) || 'CHAMPION';
      AddTextPrinterParameterized3(
        winId, 1, 4, 1, [1, 2, 3], 255,
        `BIENVENUE EN HOENN, ${playerName} !\nOverworld bientôt 1:1 décomp.`,
      );
      PutWindowTilemap(winId);
      CopyWindowToVram(winId, 3);  // COPYWIN_FULL = 3
      rt.gMain.state++;
      break;
    }
    case 4:
      ShowBg(0);
      HideBg(1);
      HideBg(2);
      HideBg(3);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_BG0_ON | DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
      // Lance BGM Littleroot.
      m4aSongNumStart(MUS_LITTLEROOT, true);
      rt.gMain.state++;
      break;
    default:
      // Main loop : juste run text printer + tasks (= BGM continue, anim text).
      RunTasks();
      AnimateSprites();
      BuildOamBuffer();
      UpdatePaletteFade();
      _welcomeFrameCounter++;
      break;
  }
}

// 1:1 stub BG template — BG0 text, charBase=0, mapBase=31, priority=0.
const sBgTemplates_Welcome = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
];

// 1:1 stub Window templates — 1 window dialogue centré bottom.
const sWindowTemplates_Welcome = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 14, width: 26, height: 4, paletteNum: 15, baseBlock: 1 },
];

// Palette 0 — Black BG (= idx 0 transparent, idx 1 vert clair).
const _welcomePal = new Uint16Array([
  0x0000, // 0: noir
  0x35BF, // 1: vert clair (= ~RGB(31, 23, 22) GBA Hoenn grass)
  0x7FFF, // 2: blanc
  0x0421, // 3: gris foncé shadow
  0x0000, 0x0000, 0x0000, 0x0000,
]);

// Palette 15 — Dialog box (= 16 colors stub : white/blue/black classic frame).
const _dialogPal = new Uint16Array([
  0x7FFF, 0x6F7B, 0x4631, 0x0000, // 0-3 : window pal entries
  0x0000, 0x7FFF, 0x4631, 0x14A5,  // 4-7
  0x0000, 0x0000, 0x0000, 0x0000,  // 8-11
  0x0000, 0x0000, 0x0000, 0x0000,  // 12-15
]);
