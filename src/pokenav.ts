/**
 * pokenav.ts — SQUELETTE UI du miroir `src/pokenav.c` (décomp pokeemeraude).
 *
 * ÉTAT (2026-07-04, mandat final) : le menu S'OUVRE depuis le start menu
 * (écran dédié, titre + entrées du menu principal AFFICHÉES, B = retour field
 * avec start menu rouvert 1:1 CB2_ReturnToFieldWithOpenMenu). TOUT LE RESTE
 * = À REMPLIR (Opus) : pokenav.c est un ORCHESTRATEUR (LoopedTask + subscreens
 * pokenav_main_menu.c / pokenav_region_map.c / pokenav_conditions*.c /
 * pokenav_match_call*.c / pokenav_ribbons*.c). Structure de reprise :
 *   1. InitPokenavResources + gPokenavResources (struct :62-77 du .c).
 *   2. Task_Pokenav state machine (:428-476) + GetCurrentMenuCB/LoopedTask (:527+).
 *   3. pokenav_main_menu.c : InitPokenavMainMenu (bandeau haut + icônes spinning).
 *   4. Subscreens par menuId (POKENAV_MENU_IDS, pokenav.h).
 * Recette test : start menu → POKéNAV (2e entrée). Callgraph :
 *   node scripts/audit-callgraph-closure.cjs --file pokenav.c
 */
import {
  gMain, ResetBgsAndClearDma3BusyFlags, InitBgsFromTemplates, InitWindows,
  DeactivateAllTextPrinters, ShowBg, ResetPaletteFade, ResetTasks,
  FreeAllWindowBuffers, LoadPalette, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, AddTextPrinterParameterized3, JOY_NEW,
  DmaClearLarge16, DmaClear16, VRAM, VRAM_SIZE,
} from '../harness/runtime/decomp-globals';
import { getRuntime } from '../harness/runtime/decomp-globals';
import { ResetSpriteData, FreeAllSpritePalettes } from './sprite';
import { B_BUTTON, REG_OFFSET_DISPCNT } from '../include/gba/io_reg';
import { BeginNormalPaletteFade } from './palette';

// 1:1 décomp pokenav.h POKENAV_MENU_* (entrées du menu principal, base).
// Libellés FR statiques (les gText_Pokenav* ne sont pas dans decomp-strings (harness) —
// à remplacer par les vraies strings au port des subscreens).
const sMainMenuLabels = ['CARTE DE HOENN', 'CONDITION', 'MATCH CALL', 'RUBANS', 'ETEINDRE'];

const WIN_TITLE = 0;
const WIN_MENU = 1;

let _active = false;

/** 1:1 décomp `CB2_InitPokeNav` (pokenav.c:315) — SQUELETTE : init vidéo +
 *  fenêtres + titre + entrées (statiques). InitPokenavResources/Task_Pokenav
 *  réels = à porter (Opus). */
export function CB2_InitPokeNav(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.SetMainCallback2(null);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);
  // Clear VRAM + palettes BG (résidus start menu — pattern option_menu case 1).
  DmaClearLarge16(3, VRAM, VRAM_SIZE, 0x1000);
  DmaClear16(3, 0x05000000, 0x400);
  ResetBgsAndClearDma3BusyFlags(0);
  const bgTemplates = [
    { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  ];
  InitBgsFromTemplates(0, bgTemplates, bgTemplates.length);
  ResetPaletteFade();
  ResetSpriteData();
  FreeAllSpritePalettes();
  ResetTasks();
  DeactivateAllTextPrinters();
  InitWindows([
    { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 2, paletteNum: 15, baseBlock: 1 },
    { bg: 0, tilemapLeft: 4, tilemapTop: 5, width: 22, height: 12, paletteNum: 15, baseBlock: 1 + 26 * 2 },
  ]);
  // Palette texte standard (blanc/gris) slot 15 + fond sombre backdrop.
  LoadPalette(new Uint16Array([0x1483, 0x7FFF, 0x2529, 0x39CE, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x0842]), 15 * 16, 32);
  FillWindowPixelBuffer(WIN_TITLE, 0x00);
  FillWindowPixelBuffer(WIN_MENU, 0x00);
  AddTextPrinterParameterized3(WIN_TITLE, 1, 4, 2, [0, 1, 2], 255, 'POKéNAV');
  for (let i = 0; i < sMainMenuLabels.length; i++) {
    AddTextPrinterParameterized3(WIN_MENU, 1, 8, 4 + i * 18, [0, 1, 2], 255, sMainMenuLabels[i]);
  }
  AddTextPrinterParameterized3(WIN_MENU, 0, 8, 4 + sMainMenuLabels.length * 18 + 8, [0, 3, 2], 255, '(squelette — B : RETOUR)');
  PutWindowTilemap(WIN_TITLE);
  PutWindowTilemap(WIN_MENU);
  CopyWindowToVram(WIN_TITLE, 3);
  CopyWindowToVram(WIN_MENU, 3);
  ShowBg(0);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, 0x0100 /* BG0_ON */);
  BeginNormalPaletteFade(0xFFFFFFFF, 0, 16, 0, 0x0000);
  _active = true;
  rt.SetMainCallback2(CB2_Pokenav as never);
}

/** 1:1 décomp `CB2_Pokenav` (pokenav.c:395 : RunTasks+AnimateSprites+…) —
 *  SQUELETTE : poll B → retour field avec start menu. */
export function CB2_Pokenav(): void {
  const rt = getRuntime();
  if (!rt || !_active) return;
  rt.runTasks?.();
  rt.animateSprites?.();
  rt.buildOamBuffer?.();
  rt.UpdatePaletteFade?.();
  if (gMain.newKeys & B_BUTTON) {
    _active = false;
    FreeAllWindowBuffers();
    void import('./overworld').then((m) => {
      const cb = (m as Record<string, unknown>).CB2_ReturnToFieldWithOpenMenu_Manual as (() => void) | undefined;
      if (cb) cb();
    });
  }
}

/** Câblage start menu (remplace le fallback message). */
export function StartMenu_OpenPokenav(): void {
  const rt = getRuntime();
  if (rt) rt.SetMainCallback2(CB2_InitPokeNav as never);
}

// ─── À PORTER (Opus) — noms 1:1 pokenav.c, oracle callgraph pour la liste ────
// InitPokenavResources (:352) · FreePokenavResources (:369) · Task_Pokenav (:428)
// GetCurrentMenuCB (:527) · CreateLoopedTask/IsLoopedTaskActive (:250-290)
// SetActivePokenavMenu (:487) · pokenav_main_menu.c ENTIER (bandeau/icônes)
// pokenav_menu_handler_1/2.c (navigation) · subscreens region_map/conditions/
// match_call/ribbons. JOY_NEW/dpad : cf. option_menu.ts pattern.
void JOY_NEW;
