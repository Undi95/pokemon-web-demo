/**
 * fldeff_flash.ts — Port 1:1 STRICT (MIROIR partiel) de `src/fldeff_flash.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/fldeff_flash.c
 *
 * Branche FLASH HM (party menu) : `FieldCallback_Flash` + `FldEff_UseFlash`. Le
 * gros de fldeff_flash.c (transitions de grotte BLDCNT/BLDALPHA via CB2_DoChangeMap
 * / TryDoMapTransition) est déclenché aux WARPS entrée/sortie de grotte, PAS par
 * le move — chantier séparé (non porté ici, mais ce qui est porté est 1:1 propre).
 *
 * `SetUpFieldMove_Flash` (condition cave + flag) est dans party-screen.ts
 * (anti-cycle ESM). Il pose `gPostMenuFieldCallback = __FieldCallback_Flash`
 * (exposé ci-dessous sur globalThis). La pénombre de grotte (fenêtre WIN0 par-scanline,
 * sFlashLevelToRadius) + les opcodes animateflash (→ AnimateFlash REEL) / setflashlevel
 * vivent dans field_screen_effect.ts + scrcmd.ts.
 */

import { CreateFieldMoveTask } from './field_effect_helpers';
import { gFieldEffectArguments } from './field_effect';
import { FlagSet } from './engine/script/script-vars';
import { ScriptContext_SetupScript } from './script';
import { CreateTask, gTasks } from './task';
import { SetMainCallback2 } from './main';
import { SetGpuReg } from './gpu_regs';
import { LoadPalette, gMain, LZ77UnCompVram, BLDALPHA_BLEND, VRAM } from '../harness/runtime/decomp-globals';
import { PLTT_SIZEOF } from '../harness/runtime/decomp-helpers';
import { BG_PLTT_ID } from './palette';
import { PLTT_SIZE_4BPP } from './sprite';
import {
  REG_OFFSET_DISPCNT, REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY, REG_OFFSET_BG0CNT,
  BGCNT_PRIORITY, BGCNT_CHARBASE, BGCNT_SCREENBASE, BGCNT_16COLOR, BGCNT_TXT256x256,
  DISPCNT_MODE_0, DISPCNT_OBJ_1D_MAP, DISPCNT_BG0_ON, DISPCNT_OBJ_ON,
  BLDCNT_TGT1_BG0, BLDCNT_EFFECT_BLEND,
  BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3, BLDCNT_TGT2_OBJ, BLDCNT_TGT2_BD,
} from '../harness/runtime/decomp-runtime';
import {
  MAP_TYPE_TOWN, MAP_TYPE_CITY, MAP_TYPE_ROUTE, MAP_TYPE_UNDERWATER,
  MAP_TYPE_OCEAN_ROUTE, MAP_TYPE_UNKNOWN, MAP_TYPE_INDOOR, MAP_TYPE_SECRET_BASE,
  MAP_TYPE_UNDERGROUND,
} from '../include/constants/map_types';

/** 1:1 décomp `FLAG_SYS_USE_FLASH` (= SYSTEM_FLAGS + 0x28 = 2184). */
const FLAG_SYS_USE_FLASH = 2184;

/** 1:1 STRICT décomp `FldEff_UseFlash` (fldeff_flash.c:94) :
 *    PlaySE(SE_M_REFLECT);                              // audio skip (règle BGM/SE)
 *    FlagSet(FLAG_SYS_USE_FLASH);
 *    ScriptContext_SetupScript(EventScript_UseFlash);   // ["animateflash 1","setflashlevel 1","end"]
 *  Le script anime l'ouverture du rayon (via animateflash → AnimateFlash, effet
 *  scanline WIN0) → la grotte s'éclaire (cercle de vision agrandi). */
function FldEff_UseFlash(): void {
  // PlaySE(SE_M_REFLECT) : skip (audio non demandé).
  FlagSet(FLAG_SYS_USE_FLASH);
  ScriptContext_SetupScript('EventScript_UseFlash');
}

/** 1:1 STRICT décomp `FieldCallback_Flash` (fldeff_flash.c:87) :
 *    taskId = CreateFieldMoveTask();
 *    gFieldEffectArguments[0] = GetCursorSelectionMonId();   // show-mon no-op (posé par le menu)
 *    gTasks[taskId].data[8/9] = (u32)FldEff_UseFlash;        // fn callback
 *  Port : `CreateFieldMoveTask(FldEff_UseFlash)` (fn passée directement). Appelé
 *  comme `gPostMenuFieldCallback` par le party menu (Task_FieldMoveWaitForFade). */
export function FieldCallback_Flash(): void {
  CreateFieldMoveTask(FldEff_UseFlash);
  // 1:1 fldeff_flash.c:90 : gFieldEffectArguments[0] = GetCursorSelectionMonId() — consommé
  // par FldEff_FieldMoveShowMonInit (gPlayerParty[arg0 & 0xFF]). L'ancienne omission (« posé
  // par le menu » = FAUX) laissait un résidu hors-party → GetMonData(undefined) → task-throw
  // à CHAQUE frame = gel du Flash (découvert sur MAP_DEBUG_1). Pont party_menu anti-cycle,
  // même pattern que Task_UseFly.
  const cur = (globalThis as Record<string, unknown>).__getCursorSelectionMonId as (() => number) | undefined;
  gFieldEffectArguments[0] = (cur?.() ?? 0) & 0xFF;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSITIONS DE GROTTE (fondu circulaire entrée/sortie) — 1:1 STRICT fldeff_flash.c.
//
// Déclenchées au WARP (pas par le move Flash) : le dispatch réel est TryDoMapTransition()
// appelé par CB2_DoChangeMap() (fldeff_flash.c:124), lui-même posé par
// SetMainCallback2(CB2_DoChangeMap) dans overworld.c:1578. `src/overworld.ts` est
// VERROUILLÉ (chantier en cours) → CB2_DoChangeMap / TryDoMapTransition NON portés ici.
// Ce bloc est donc une transcription COMPLÈTE mais INERTE (non câblée) : le seul appelant
// du dispatch vit dans overworld.ts. À câbler quand overworld sera rouvert.
// ─────────────────────────────────────────────────────────────────────────────

/** 1:1 décomp `struct FlashStruct` (fldeff_flash.c:19). */
interface FlashStruct {
  fromType: number;
  toType: number;
  isEnter: boolean;
  isExit: boolean;
  func: () => void;
}

// 1:1 décomp fldeff_flash.c:64-71 — assets graphics/cave_transition/*.
// ASSETS : le décomp lie la ROM à la compilation (INCGFX_U16/U32). Ici les palettes sont
// des placeholders (Uint16Array) À LIER depuis public/decomp/em/cave_transition/*.pal au
// câblage du sous-système (précédent : hall_of_fame.ts _bindHofGfxAssets, assetCache).
// Tailles décomp : white/black = 16 couleurs, enter = 16, exit = 8 (cf. PLTT_SIZEOF).
let sCaveTransitionPalette_White = new Uint16Array(16);
let sCaveTransitionPalette_Black = new Uint16Array(16);
let sCaveTransitionPalette_Enter = new Uint16Array(16);
//!< French Difference
let sCaveTransitionPalette_Exit = new Uint16Array(8);
// Symboles LZ77UnCompVram (résolus via getAsset au câblage) : tilemap.bin.lz / tiles.png.4bpp.lz.
const sCaveTransitionTilemap = 'sCaveTransitionTilemap';
const sCaveTransitionTiles = 'sCaveTransitionTiles';

/** 1:1 décomp `sTransitionTypes` (fldeff_flash.c:43-62). Sentinelle {fromType:0} incluse
 *  pour reproduire fidèlement la condition de boucle C `sTransitionTypes[i].fromType`. */
const sTransitionTypes: FlashStruct[] = [
  { fromType: MAP_TYPE_TOWN,        toType: MAP_TYPE_UNDERGROUND,  isEnter: true,  isExit: false, func: DoEnterCaveTransition },
  { fromType: MAP_TYPE_CITY,        toType: MAP_TYPE_UNDERGROUND,  isEnter: true,  isExit: false, func: DoEnterCaveTransition },
  { fromType: MAP_TYPE_ROUTE,       toType: MAP_TYPE_UNDERGROUND,  isEnter: true,  isExit: false, func: DoEnterCaveTransition },
  { fromType: MAP_TYPE_UNDERWATER,  toType: MAP_TYPE_UNDERGROUND,  isEnter: true,  isExit: false, func: DoEnterCaveTransition },
  { fromType: MAP_TYPE_OCEAN_ROUTE, toType: MAP_TYPE_UNDERGROUND,  isEnter: true,  isExit: false, func: DoEnterCaveTransition },
  { fromType: MAP_TYPE_UNKNOWN,     toType: MAP_TYPE_UNDERGROUND,  isEnter: true,  isExit: false, func: DoEnterCaveTransition },
  { fromType: MAP_TYPE_INDOOR,      toType: MAP_TYPE_UNDERGROUND,  isEnter: true,  isExit: false, func: DoEnterCaveTransition },
  { fromType: MAP_TYPE_SECRET_BASE, toType: MAP_TYPE_UNDERGROUND,  isEnter: true,  isExit: false, func: DoEnterCaveTransition },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_TOWN,         isEnter: false, isExit: true,  func: DoExitCaveTransition },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_CITY,         isEnter: false, isExit: true,  func: DoExitCaveTransition },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_ROUTE,        isEnter: false, isExit: true,  func: DoExitCaveTransition },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_UNDERWATER,   isEnter: false, isExit: true,  func: DoExitCaveTransition },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_OCEAN_ROUTE,  isEnter: false, isExit: true,  func: DoExitCaveTransition },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_UNKNOWN,      isEnter: false, isExit: true,  func: DoExitCaveTransition },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_INDOOR,       isEnter: false, isExit: true,  func: DoExitCaveTransition },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_SECRET_BASE,  isEnter: false, isExit: true,  func: DoExitCaveTransition },
  { fromType: 0, toType: 0, isEnter: false, isExit: false, func: () => { /* sentinelle */ } },
];

/** 1:1 STRICT décomp `GetMapPairFadeToType` (fldeff_flash.c:173). */
export function GetMapPairFadeToType(_fromType: number, _toType: number): boolean {
  let i: number;
  const fromType = _fromType;
  const toType = _toType;

  for (i = 0; sTransitionTypes[i].fromType; i++) {
    if (sTransitionTypes[i].fromType === fromType && sTransitionTypes[i].toType === toType) {
      return sTransitionTypes[i].isEnter;
    }
  }

  return false;
}

/** 1:1 STRICT décomp `GetMapPairFadeFromType` (fldeff_flash.c:190). */
export function GetMapPairFadeFromType(_fromType: number, _toType: number): boolean {
  let i: number;
  const fromType = _fromType;
  const toType = _toType;

  for (i = 0; sTransitionTypes[i].fromType; i++) {
    if (sTransitionTypes[i].fromType === fromType && sTransitionTypes[i].toType === toType) {
      return sTransitionTypes[i].isExit;
    }
  }

  return false;
}

/** 1:1 STRICT décomp `DoExitCaveTransition` (fldeff_flash.c:207). */
function DoExitCaveTransition(): void {
  CreateTask((t: { taskId: number }) => Task_ExitCaveTransition1(t.taskId), 0);
}

/** 1:1 STRICT décomp `Task_ExitCaveTransition1` (fldeff_flash.c:212). */
function Task_ExitCaveTransition1(taskId: number): void {
  gTasks[taskId].func = (t: { taskId: number }) => Task_ExitCaveTransition2(t.taskId);
}

/** 1:1 STRICT décomp `Task_ExitCaveTransition2` (fldeff_flash.c:217). */
function Task_ExitCaveTransition2(taskId: number): void {
  SetGpuReg(REG_OFFSET_DISPCNT, 0);
  LZ77UnCompVram(sCaveTransitionTiles, VRAM + 0xC000);
  LZ77UnCompVram(sCaveTransitionTilemap, VRAM + 0xF800);
  LoadPalette(sCaveTransitionPalette_White, BG_PLTT_ID(14), PLTT_SIZE_4BPP);
  // !< French Difference
  LoadPalette(sCaveTransitionPalette_Exit, BG_PLTT_ID(14), PLTT_SIZEOF(8));
  SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0
                             | BLDCNT_EFFECT_BLEND
                             | BLDCNT_TGT2_BG1
                             | BLDCNT_TGT2_BG2
                             | BLDCNT_TGT2_BG3
                             | BLDCNT_TGT2_OBJ
                             | BLDCNT_TGT2_BD);
  SetGpuReg(REG_OFFSET_BLDALPHA, 0);
  SetGpuReg(REG_OFFSET_BLDY, 0);
  SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(0)
                             | BGCNT_CHARBASE(3)
                             | BGCNT_SCREENBASE(31)
                             | BGCNT_16COLOR
                             | BGCNT_TXT256x256);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0
                              | DISPCNT_OBJ_1D_MAP
                              | DISPCNT_BG0_ON
                              | DISPCNT_OBJ_ON);
  gTasks[taskId].func = (t: { taskId: number }) => Task_ExitCaveTransition3(t.taskId);
  gTasks[taskId].data[0] = 16;
  gTasks[taskId].data[1] = 0;
}

/** 1:1 STRICT décomp `Task_ExitCaveTransition3` (fldeff_flash.c:248). */
function Task_ExitCaveTransition3(taskId: number): void {
  const count = gTasks[taskId].data[1];
  const blend = count + 0x1000;

  SetGpuReg(REG_OFFSET_BLDALPHA, blend);
  if (count <= 16) {
    gTasks[taskId].data[1]++;
  } else {
    gTasks[taskId].data[2] = 0;
    gTasks[taskId].func = (t: { taskId: number }) => Task_ExitCaveTransition4(t.taskId);
  }
}

/** 1:1 STRICT décomp `Task_ExitCaveTransition4` (fldeff_flash.c:265). */
function Task_ExitCaveTransition4(taskId: number): void {
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 16));
  const count = gTasks[taskId].data[2];

  if (count < 8) {
    gTasks[taskId].data[2]++;
    // !< French Difference
    LoadPalette(sCaveTransitionPalette_Exit.subarray(count), BG_PLTT_ID(14), sCaveTransitionPalette_Exit.byteLength - PLTT_SIZEOF(count));
  } else {
    LoadPalette(sCaveTransitionPalette_White, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
    gTasks[taskId].func = (t: { taskId: number }) => Task_ExitCaveTransition5(t.taskId);
    gTasks[taskId].data[2] = 8;
  }
}

/** 1:1 STRICT décomp `Task_ExitCaveTransition5` (fldeff_flash.c:286). */
function Task_ExitCaveTransition5(taskId: number): void {
  if (gTasks[taskId].data[2])
    gTasks[taskId].data[2]--;
  else
    SetMainCallback2(gMain.savedCallback as ((...args: unknown[]) => void) | null);
}

/** 1:1 STRICT décomp `DoEnterCaveTransition` (fldeff_flash.c:294). */
function DoEnterCaveTransition(): void {
  CreateTask((t: { taskId: number }) => Task_EnterCaveTransition1(t.taskId), 0);
}

/** 1:1 STRICT décomp `Task_EnterCaveTransition1` (fldeff_flash.c:299). */
function Task_EnterCaveTransition1(taskId: number): void {
  gTasks[taskId].func = (t: { taskId: number }) => Task_EnterCaveTransition2(t.taskId);
}

/** 1:1 STRICT décomp `Task_EnterCaveTransition2` (fldeff_flash.c:304). */
function Task_EnterCaveTransition2(taskId: number): void {
  SetGpuReg(REG_OFFSET_DISPCNT, 0);
  LZ77UnCompVram(sCaveTransitionTiles, VRAM + 0xC000);
  LZ77UnCompVram(sCaveTransitionTilemap, VRAM + 0xF800);
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
  SetGpuReg(REG_OFFSET_BLDALPHA, 0);
  SetGpuReg(REG_OFFSET_BLDY, 0);
  SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(0)
                             | BGCNT_CHARBASE(3)
                             | BGCNT_SCREENBASE(31)
                             | BGCNT_16COLOR
                             | BGCNT_TXT256x256);
  SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0
                              | DISPCNT_OBJ_1D_MAP
                              | DISPCNT_BG0_ON
                              | DISPCNT_OBJ_ON);
  LoadPalette(sCaveTransitionPalette_White, BG_PLTT_ID(14), PLTT_SIZE_4BPP);
  LoadPalette(sCaveTransitionPalette_Black, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
  gTasks[taskId].func = (t: { taskId: number }) => Task_EnterCaveTransition3(t.taskId);
  gTasks[taskId].data[0] = 16;
  gTasks[taskId].data[1] = 0;
  gTasks[taskId].data[2] = 0;
}

/** 1:1 STRICT décomp `Task_EnterCaveTransition3` (fldeff_flash.c:329). */
function Task_EnterCaveTransition3(taskId: number): void {
  const count = gTasks[taskId].data[2];

  if (count < 16) {
    gTasks[taskId].data[2]++;
    gTasks[taskId].data[2]++;
    LoadPalette(sCaveTransitionPalette_Enter.subarray(15 - count), BG_PLTT_ID(14), PLTT_SIZEOF(count + 1));
  } else {
    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 16));
    SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0
                               | BLDCNT_EFFECT_BLEND
                               | BLDCNT_TGT2_BG1
                               | BLDCNT_TGT2_BG2
                               | BLDCNT_TGT2_BG3
                               | BLDCNT_TGT2_OBJ
                               | BLDCNT_TGT2_BD);
    gTasks[taskId].func = (t: { taskId: number }) => Task_EnterCaveTransition4(t.taskId);
  }
}

/** 1:1 STRICT décomp `Task_EnterCaveTransition4` (fldeff_flash.c:353). */
function Task_EnterCaveTransition4(taskId: number): void {
  const count = 16 - gTasks[taskId].data[1];
  const blend = count + 0x1000;

  SetGpuReg(REG_OFFSET_BLDALPHA, blend);
  if (count) {
    gTasks[taskId].data[1]++;
  } else {
    LoadPalette(sCaveTransitionPalette_Black, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
    SetMainCallback2(gMain.savedCallback as ((...args: unknown[]) => void) | null);
  }
}

// Exposé pour le party menu (SetUpFieldMove_Flash pose gPostMenuFieldCallback =
// __FieldCallback_Flash) sans import statique party-screen→ce module (anti-cycle ESM).
(globalThis as Record<string, unknown>).__FieldCallback_Flash = FieldCallback_Flash;
