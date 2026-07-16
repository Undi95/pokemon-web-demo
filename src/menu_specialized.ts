/**
 * game/menu_specialized.ts — MIROIR 1:1 (partiel) de `src/menu_specialized.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/menu_specialized.c`.
 *
 * Blocs portés ici :
 * (A) la "level-up stats window" (boîte de stats au level-up),
 * fonctions PARTAGÉES (non-static dans la décomp, exportées via menu_specialized.h) :
 *   - `sLvlUpStatStrings[NUM_STATS]`     (menu_specialized.c:1513-1521)
 *   - `DrawLevelUpWindowPg1`             (menu_specialized.c:1523-1576)
 *   - `DrawLevelUpWindowPg2`             (menu_specialized.c:1578-1626)
 *   - `GetMonLevelUpWindowStats`         (menu_specialized.c:1628-1636)
 * (B) le CONDITION GRAPH partagé (radar des stats de concours) + sparkles + icônes,
 * consommé par pokenav_conditions(_gfx).ts (et use_pokeblock.c côté décomp, non porté) :
 *   - `ConditionGraph_*`                 (menu_specialized.c:330-707)
 *   - `GetBoxOrPartyMonData`             (menu_specialized.c:893-913)
 *   - `MoveConditionMon*` / `ConditionMenu_UpdateMon*` (menu_specialized.c:1093-1125)
 *   - templates/sheets sprites condition (mon pic, icônes sélection, sparkles)
 *     (menu_specialized.c:1127-1511)
 * Reste NON porté de la section condition : GetConditionMenuMonString /
 * BufferConditionMenuSpacedStringN / GetConditionMenuMonNameAndLocString /
 * GetConditionMenuMonConditions / GetConditionMenuMonGfx (menu_specialized.c:916-1091)
 * — appelés UNIQUEMENT par use_pokeblock.c (hors périmètre solo Pokénav ; le Pokénav a
 * ses propres équivalents dans pokenav_conditions.c).
 *
 * Ces fonctions sont appelées par DEUX sous-systèmes dans la décomp :
 *   - combat : `battle_script_commands.c` (Cmd_drawlvlupbox → DrawLevelUpWindow1/2)
 *   - menu d'équipe : `party_menu.c` (DisplayLevelUpStatsPg1/Pg2 via Rare Candy)
 * → elles vivent dans `menu_specialized.c` (= UNE source), pas dupliquées. Ce
 * fichier rétablit cette unicité côté port (avant : inlinées dans
 * `engine/battle/battle-levelup-box.ts`).
 *
 * Le reste de menu_specialized.c (list menus, scroll arrows, etc.) sera porté
 * au fil des besoins ; ce fichier n'est pour l'instant que l'amorce du miroir.
 *
 * Primitives de rendu : couche HW/text (`gba-window-system` / `gba-text-system`,
 * exposées sous noms décomp), comme tout consommateur de fenêtres GBA.
 */

import { FillWindowPixelBuffer } from './window';
import { AddTextPrinterParameterized3 } from './menu';

// ─── Imports section (B) — condition graph / sparkles / icônes ──────────────
import { SetGpuReg } from './gpu_regs';
import {
  ScanlineEffect_Clear, ScanlineEffect_SetParams, gScanlineEffectRegBuffers,
  SCANLINE_EFFECT_DMACNT_32BIT,
} from './scanline_effect';
import type { ScanlineEffectParams } from './scanline_effect';
import { REG_OFFSET_WIN0H, REG_OFFSET_WIN1H, REG_OFFSET_WIN0V, REG_OFFSET_WIN1V, REG_OFFSET_WININ, REG_OFFSET_WINOUT } from '../include/gba/io_reg';
import { DISPLAY_WIDTH, NUM_BACKGROUNDS } from '../include/gba/defines';
import { WIN_RANGE } from '../harness/runtime/decomp-helpers';
import { SpriteCallbackDummy, getRuntime } from '../harness/runtime/decomp-globals';
import { gSineTable } from './trig';
import {
  CreateSprite, DestroySprite, FreeSpritePaletteByTag, FreeSpriteTilesByTag,
  SeekSpriteAnim, gSprites, ANIMCMD_FRAME, ANIMCMD_END, gDummySpriteAnimTable,
  gDummySpriteAffineAnimTable,
} from './sprite';
import type { AnimCmd } from './sprite';
import { MAX_SPRITES } from '../include/sprite';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import { MON_PIC_SIZE } from './battle_gfx_sfx_util';
import { GetMonData } from './engine/battle/party-storage';
import { gPlayerParty } from './pokemon';
import { GetAndCopyBoxMonDataAt, GetBoxMonDataAt } from './pokemon_storage_system';
import { TOTAL_BOXES_COUNT } from './engine/save/save-blocks';
import { MON_DATA_NICKNAME, MON_DATA_OT_NAME } from '../include/pokemon';
import { StringCopy } from './string_util';
import { encodeOwText } from './text';
import { loadTileBin, extractPngPlte, loadGbaPal } from '../harness/gba/png-loader';

// ─── Constantes 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `NUM_STATS` (constants/pokemon.h) = 6. */
const NUM_STATS = 6;
/** 1:1 décomp `FONT_NORMAL` (text.h) = 1. */
const FONT_NORMAL = 1;
/** 1:1 décomp `TEXT_SKIP_DRAW` (text.h) = 0xFF → rendu synchrone immédiat. */
const TEXT_SKIP_DRAW = 0xff;

/** 1:1 décomp `enum Stat` (constants/pokemon.h:48-54) — index des stats dans un
 *  tableau STAT_-ordonné. ⚠️ SPEED=3 vient AVANT SPATK=4/SPDEF=5. */
const STAT_HP = 0;
const STAT_ATK = 1;
const STAT_DEF = 2;
const STAT_SPEED = 3;
const STAT_SPATK = 4;
const STAT_SPDEF = 5;

/** 1:1 décomp `PIXEL_FILL(n)` (window.h:6) = (n << 4) | n. */
function PIXEL_FILL(n: number): number {
  return ((n << 4) | n) & 0xff;
}

/** 1:1 décomp `sLvlUpStatStrings[NUM_STATS]` (menu_specialized.c:1513-1521) :
 *  {gText_MaxHP, gText_Attack, gText_Defense, gText_SpAtk, gText_SpDef, gText_Speed}.
 *  C'est l'ordre d'AFFICHAGE (les 6 lignes de la box, de haut en bas). Valeurs
 *  FR = strings.c (gText_MaxHP="PV MAX." … gText_Speed="VITESSE"). */
export const sLvlUpStatStrings: readonly string[] = [
  'PV MAX.',    // gText_MaxHP
  'ATTAQUE',    // gText_Attack
  'DEFENSE',    // gText_Defense
  'ATQ. SPE.',  // gText_SpAtk
  'DEF. SPE.',  // gText_SpDef
  'VITESSE',    // gText_Speed
];

/** Mapping ligne d'affichage `i` → index STAT_ dans le tableau de stats.
 *  La décomp DrawLevelUpWindowPg1 (1532-1537) écrit statsDiff[0..5] =
 *  after[STAT_HP/ATK/DEF/SPATK/SPDEF/SPEED]. Avec STAT_SPEED=3 < SPATK=4/SPDEF=5,
 *  l'ordre d'affichage (HP,ATK,DEF,SPATK,SPDEF,SPEED) indexe le tableau
 *  STAT_-ordonné à [0,1,2,4,5,3]. */
const DISPLAY_TO_STAT: readonly number[] = [
  STAT_HP, STAT_ATK, STAT_DEF, STAT_SPATK, STAT_SPDEF, STAT_SPEED,
];

// ─── GetMonLevelUpWindowStats (menu_specialized.c:1628) — 1:1 ───────────────

/** Mon-like exposant les 6 stats finales. 1:1-sémantique de `struct Pokemon *`
 *  lu via GetMonData(mon, MON_DATA_MAX_HP/ATK/DEF/SPEED/SPATK/SPDEF). */
export interface LevelUpStatMon {
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

/** 1:1 décomp `GetMonLevelUpWindowStats(mon, currStats)` (menu_specialized.c:1628).
 *  Remplit `currStats` (tableau STAT_-indexé : [HP,ATK,DEF,SPEED,SPATK,SPDEF]). */
export function GetMonLevelUpWindowStats(mon: LevelUpStatMon, currStats: number[]): void {
  currStats[STAT_HP]    = mon.maxHP;
  currStats[STAT_ATK]   = mon.attack;
  currStats[STAT_DEF]   = mon.defense;
  currStats[STAT_SPEED] = mon.speed;
  currStats[STAT_SPATK] = mon.spAttack;
  currStats[STAT_SPDEF] = mon.spDefense;
}

// ─── DrawLevelUpWindowPg1 / Pg2 (menu_specialized.c:1523-1626) — 1:1 ────────

/** 1:1 décomp `DrawLevelUpWindowPg1` (menu_specialized.c:1523). Page 1 = pour
 *  chaque stat : label + signe (+/-) + |delta|. `statsBefore`/`statsAfter` =
 *  tableaux STAT_-indexés. `bgClr`/`fgClr`/`shadowClr` = color[] = {bg,fg,shadow}. */
export function DrawLevelUpWindowPg1(
  windowId: number,
  statsBefore: number[],
  statsAfter: number[],
  bgClr: number,
  fgClr: number,
  shadowClr: number,
): void {
  // 1:1 décomp 1530 : FillWindowPixelBuffer(windowId, PIXEL_FILL(bgClr)).
  FillWindowPixelBuffer(windowId, PIXEL_FILL(bgClr));

  // 1:1 décomp 1539-1541 : color[] = {bg, fg, shadow}.
  const color: readonly number[] = [bgClr, fgClr, shadowClr];

  for (let i = 0; i < NUM_STATS; i++) {
    // 1:1 décomp 1532-1537 : statsDiff[i] = after[stat] - before[stat] avec le
    // réindex STAT_ (DISPLAY_TO_STAT) — l'ordre d'affichage ≠ ordre STAT_.
    const stat = DISPLAY_TO_STAT[i];
    const diff = statsAfter[stat] - statsBefore[stat];

    // 1:1 décomp 1546-1552 : label à x=0, y=15*i.
    AddTextPrinterParameterized3(windowId, FONT_NORMAL, 0, 15 * i, color, TEXT_SKIP_DRAW, sLvlUpStatStrings[i]);

    // 1:1 décomp 1554-1561 : signe "+" (gText_Plus) si diff>=0, sinon "-" (gText_Dash), à x=56.
    const sign = diff >= 0 ? '+' : '-';
    AddTextPrinterParameterized3(windowId, FONT_NORMAL, 56, 15 * i, color, TEXT_SKIP_DRAW, sign);

    // 1:1 décomp 1562-1574 : x = 18 si |delta|<=9, sinon 12 ; |delta| à x=56+x.
    const x = Math.abs(diff) <= 9 ? 18 : 12;
    AddTextPrinterParameterized3(windowId, FONT_NORMAL, 56 + x, 15 * i, color, TEXT_SKIP_DRAW, String(Math.abs(diff)));
  }
}

/** 1:1 décomp `DrawLevelUpWindowPg2` (menu_specialized.c:1578). Page 2 = pour
 *  chaque stat : label + nouveau total (right-aligné). `currStats` = STAT_-indexé. */
export function DrawLevelUpWindowPg2(
  windowId: number,
  currStats: number[],
  bgClr: number,
  fgClr: number,
  shadowClr: number,
): void {
  FillWindowPixelBuffer(windowId, PIXEL_FILL(bgClr));
  const color: readonly number[] = [bgClr, fgClr, shadowClr];

  for (let i = 0; i < NUM_STATS; i++) {
    const stat = DISPLAY_TO_STAT[i];
    const v = currStats[stat];

    // 1:1 décomp 1600-1608 : numDigits ∈ {1,2,3} ; x = 6*(4-numDigits) (right-align).
    const numDigits = v > 99 ? 3 : v > 9 ? 2 : 1;
    const x = 6 * (4 - numDigits);

    AddTextPrinterParameterized3(windowId, FONT_NORMAL, 0, 15 * i, color, TEXT_SKIP_DRAW, sLvlUpStatStrings[i]);
    AddTextPrinterParameterized3(windowId, FONT_NORMAL, 56 + x, 15 * i, color, TEXT_SKIP_DRAW, String(v));
  }
}

/* ════════════════════════════════════════════════════════════════════════════
 * (B) CONDITION GRAPH — miroir 1:1 menu_specialized.c:81-106, 330-707, 893-913,
 *     1093-1125, 1127-1511. Radar des stats de concours (Pokénav CONDITION +
 *     use_pokeblock côté décomp). Dessin = HBlank DMA 32-bit sur WIN0H/WIN1H
 *     (les scanlines découpent le polygone dans les fenêtres HW).
 * ══════════════════════════════════════════════════════════════════════════ */

// ─── Constantes 1:1 include/menu_specialized.h ───────────────────────────────
/** 1:1 include/constants/pokemon.h:197-198. */
const MAX_SHEEN = 255;
/** 1:1 menu_specialized.h:43. */
export const MAX_CONDITION_SPARKLES = 10;
/** 1:1 menu_specialized.h:49-55. */
export const CONDITION_GRAPH_TOP_Y = 56;
export const CONDITION_GRAPH_BOTTOM_Y = 121;
export const CONDITION_GRAPH_HEIGHT = CONDITION_GRAPH_BOTTOM_Y - CONDITION_GRAPH_TOP_Y + 1; // 66
export const CONDITION_GRAPH_CENTER_X = 155;
/** ⚠️ division C entière : (121+56)/2 = 88 (pas 88.5) → 88+3 = 91. */
export const CONDITION_GRAPH_CENTER_Y = Math.trunc((CONDITION_GRAPH_BOTTOM_Y + CONDITION_GRAPH_TOP_Y) / 2) + 3; // 91
export const CONDITION_GRAPH_UPDATE_STEPS = 10;
export const CONDITION_GRAPH_LOAD_MAX = 4;
/** 1:1 menu_specialized.h:58-65 (ordre flavor/contest ré-ordonné). */
export const CONDITION_COOL = 0;
export const CONDITION_TOUGH = 1;
export const CONDITION_SMART = 2;
export const CONDITION_CUTE = 3;
export const CONDITION_BEAUTY = 4;
export const CONDITION_COUNT = 5;
/** 1:1 menu_specialized.h:68-74 (ordre du POLYGONE, ≠ ordre CONDITION_). */
const GRAPH_COOL = 0;
const GRAPH_BEAUTY = 1;
const GRAPH_CUTE = 2;
const GRAPH_SMART = 3;
const GRAPH_TOUGH = 4;
/** 1:1 menu_specialized.h:27-36 (tags sprites condition). */
export const TAG_CONDITION_MON = 100;
export const TAG_CONDITION_BALL = 101;
export const TAG_CONDITION_CANCEL = 102;
export const TAG_CONDITION_BALL_PLACEHOLDER = 103;
export const TAG_CONDITION_SPARKLE = 104;
export const TAG_CONDITION_MON_MARKINGS = 105;
export const TAG_CONDITION_MARKINGS_MENU = 106;

/** 1:1 macro `GET_NUM_CONDITION_SPARKLES(sheen)` (menu_specialized.h:47) —
 *  divisions u32 → floor. (255/9)+1 = 29 → sheen/29 ; sheen==MAX_SHEEN → 9. */
export function GET_NUM_CONDITION_SPARKLES(sheen: number): number {
  return (sheen !== MAX_SHEEN)
    ? Math.trunc(sheen / (Math.trunc(MAX_SHEEN / (MAX_CONDITION_SPARKLES - 1)) + 1))
    : MAX_CONDITION_SPARKLES - 1;
}

/** 1:1 macro locale `SHIFT_RIGHT_ADJUSTED(n, s)` (menu_specialized.c:330) —
 *  shift arithmétique + arrondi au demi (bit s-1). */
function SHIFT_RIGHT_ADJUSTED(n: number, s: number): number {
  return (n >> s) + ((n >> (s - 1)) & 1);
}

/** 1:1 `struct UCoords16` (global.h). */
export interface UCoords16 { x: number; y: number; }

/** 1:1 `struct ConditionGraph` (menu_specialized.h:76-88).
 *  scanlineRight/Left : `u16 [CONDITION_GRAPH_HEIGHT][2]` — représentés à PLAT
 *  (Uint16Array(HEIGHT*2), index [ligne*2 + col]) : l'arith pointeur u16* de
 *  ConditionGraph_CalcLine (scanline += 2, scanline[dir]) devient un index. */
export interface ConditionGraph {
  conditions: number[][];            // u8  [LOAD_MAX][CONDITION_COUNT]
  savedPositions: UCoords16[][];     //     [LOAD_MAX][CONDITION_COUNT]
  newPositions: UCoords16[][];       //     [UPDATE_STEPS][CONDITION_COUNT]
  curPositions: UCoords16[];         //     [CONDITION_COUNT]
  scanlineRight: Uint16Array;        // u16 [HEIGHT][2] (à plat)
  scanlineLeft: Uint16Array;         // u16 [HEIGHT][2] (à plat)
  bottom: number;                    // u16
  updateCounter: number;             // u16
  needsDraw: boolean;                // bool8
  scanlineResetState: number;        // u8
}

/** ADAPTATION MOTEUR (précédent match-call `gfx.trainerPicGfx = new Uint8Array(0x800)`,
 *  pokenav_match_call_gfx.ts:1246) : la ROM alloue le struct DANS le substruct
 *  (Alloc zéroé) ; côté JS AllocSubstruct rend un objet vide → cette factory
 *  matérialise la mémoire du `struct ConditionGraph`. Les VALEURS sont ensuite
 *  posées 1:1 par ConditionGraph_Init. */
export function NewConditionGraph(): ConditionGraph {
  const mkCoords = (n: number): UCoords16[] => Array.from({ length: n }, () => ({ x: 0, y: 0 }));
  return {
    conditions: Array.from({ length: CONDITION_GRAPH_LOAD_MAX }, () => new Array<number>(CONDITION_COUNT).fill(0)),
    savedPositions: Array.from({ length: CONDITION_GRAPH_LOAD_MAX }, () => mkCoords(CONDITION_COUNT)),
    newPositions: Array.from({ length: CONDITION_GRAPH_UPDATE_STEPS }, () => mkCoords(CONDITION_COUNT)),
    curPositions: mkCoords(CONDITION_COUNT),
    scanlineRight: new Uint16Array(CONDITION_GRAPH_HEIGHT * 2),
    scanlineLeft: new Uint16Array(CONDITION_GRAPH_HEIGHT * 2),
    bottom: 0,
    updateCounter: 0,
    needsDraw: false,
    scanlineResetState: 0,
  };
}

/** 1:1 `static const struct ScanlineEffectParams sConditionGraphScanline`
 *  (menu_specialized.c:81-86) : dmaDest = &REG_WIN0H (offset 0x40), 32-bit
 *  (= écrit WIN0H **et** WIN1H chaque scanline depuis le buffer entrelacé). */
const sConditionGraphScanline: ScanlineEffectParams = {
  dmaDest: REG_OFFSET_WIN0H,
  dmaControl: SCANLINE_EFFECT_DMACNT_32BIT,
  initState: 1,
};

/** 1:1 `static const u8 sConditionToLineLength[MAX_CONDITION + 1]` (menu_specialized.c:88-106). */
const sConditionToLineLength: readonly number[] = [
   4,  5,  6,  7,  8,  9,  9, 10, 10, 11, 11, 12, 12, 13, 13, 13,
  13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 17,
  17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19,
  19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21,
  21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23,
  23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26,
  26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27,
  27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
  29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31,
  31, 31, 31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32,
  32, 32, 32, 32, 32, 32, 32, 32, 33, 33, 33, 33, 33, 33, 33, 33,
  33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 34, 34, 34, 34, 34,
  34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 35,
];

/** 1:1 `void ConditionGraph_Init(struct ConditionGraph *graph)` (menu_specialized.c:332-357). */
export function ConditionGraph_Init(graph: ConditionGraph): void {
  let i = 0, j = 0;
  for (j = 0; j < CONDITION_COUNT; j++)
  {
    for (i = 0; i < CONDITION_GRAPH_UPDATE_STEPS; i++)
    {
      graph.newPositions[i][j].x = 0;
      graph.newPositions[i][j].y = 0;
    }
    for (i = 0; i < CONDITION_GRAPH_LOAD_MAX; i++)
    {
      graph.conditions[i][j] = 0;
      graph.savedPositions[i][j].x = CONDITION_GRAPH_CENTER_X;
      graph.savedPositions[i][j].y = CONDITION_GRAPH_CENTER_Y;
    }
    graph.curPositions[j].x = 0;
    graph.curPositions[j].y = 0;
  }
  graph.needsDraw = false;
  graph.updateCounter = 0;
}

// Fills the newPositions array with incremental positions between
// old and new for the graph transition when switching between Pokémon.
/** 1:1 `void ConditionGraph_SetNewPositions(struct ConditionGraph *graph, struct UCoords16 *old, struct UCoords16 *new)`
 *  (menu_specialized.c:361-388). `new` = mot réservé → `new_`. */
export function ConditionGraph_SetNewPositions(graph: ConditionGraph, old: UCoords16[], new_: UCoords16[]): void {
  let i = 0, j = 0;
  let coord = 0, increment = 0;
  for (i = 0; i < CONDITION_COUNT; i++)
  {
    coord = old[i].x << 8;
    increment = Math.trunc(((new_[i].x - old[i].x) << 8) / CONDITION_GRAPH_UPDATE_STEPS);
    for (j = 0; j < CONDITION_GRAPH_UPDATE_STEPS - 1; j++)
    {
      graph.newPositions[j][i].x = SHIFT_RIGHT_ADJUSTED(coord, 8);
      coord += increment;
    }
    graph.newPositions[j][i].x = new_[i].x;

    coord = old[i].y << 8;
    increment = Math.trunc(((new_[i].y - old[i].y) << 8) / CONDITION_GRAPH_UPDATE_STEPS);
    for (j = 0; j < CONDITION_GRAPH_UPDATE_STEPS - 1; j++)
    {
      graph.newPositions[j][i].y = SHIFT_RIGHT_ADJUSTED(coord, 8);
      coord += increment;
    }
    graph.newPositions[j][i].y = new_[i].y;
  }
  graph.updateCounter = 0;
}

/** 1:1 `bool8 ConditionGraph_TryUpdate(struct ConditionGraph *graph)` (menu_specialized.c:390-401). */
export function ConditionGraph_TryUpdate(graph: ConditionGraph): boolean {
  if (graph.updateCounter < CONDITION_GRAPH_UPDATE_STEPS)
  {
    ConditionGraph_Update(graph);
    return (++graph.updateCounter !== CONDITION_GRAPH_UPDATE_STEPS);
  }
  else
  {
    return false;
  }
}

/** 1:1 `void ConditionGraph_InitResetScanline(struct ConditionGraph *graph)` (menu_specialized.c:403-406). */
export function ConditionGraph_InitResetScanline(graph: ConditionGraph): void {
  graph.scanlineResetState = 0;
}

/** 1:1 `bool8 ConditionGraph_ResetScanline(struct ConditionGraph *graph)` (menu_specialized.c:408-426). */
export function ConditionGraph_ResetScanline(graph: ConditionGraph): boolean {
  switch (graph.scanlineResetState)
  {
  case 0:
    ScanlineEffect_Clear();
    graph.scanlineResetState++;
    return true;
  case 1:
    // 1:1 `params = sConditionGraphScanline; ScanlineEffect_SetParams(params);`
    ScanlineEffect_SetParams(sConditionGraphScanline);
    graph.scanlineResetState++;
    return false;
  default:
    return false;
  }
}

/** 1:1 `void ConditionGraph_Draw(struct ConditionGraph *graph)` (menu_specialized.c:428-449).
 *  Pousse les scanlines du polygone dans les buffers HBlank (WIN0H/WIN1H entrelacés). */
export function ConditionGraph_Draw(graph: ConditionGraph): void {
  let i = 0;
  if (!graph.needsDraw)
    return;
  ConditionGraph_CalcRightHalf(graph);
  ConditionGraph_CalcLeftHalf(graph);
  for (i = 0; i < CONDITION_GRAPH_HEIGHT; i++)
  {
    // Draw right half — double assignment 1:1 (buffers [1] et [0]).
    gScanlineEffectRegBuffers[1][(i + CONDITION_GRAPH_TOP_Y - 1) * 2 + 0] =
    gScanlineEffectRegBuffers[0][(i + CONDITION_GRAPH_TOP_Y - 1) * 2 + 0] = (graph.scanlineRight[i * 2 + 0] << 8) | (graph.scanlineRight[i * 2 + 1]);
    // Draw left half
    gScanlineEffectRegBuffers[1][(i + CONDITION_GRAPH_TOP_Y - 1) * 2 + 1] =
    gScanlineEffectRegBuffers[0][(i + CONDITION_GRAPH_TOP_Y - 1) * 2 + 1] = (graph.scanlineLeft[i * 2 + 0] << 8) | (graph.scanlineLeft[i * 2 + 1]);
  }
  graph.needsDraw = false;
}

/** 1:1 `void ConditionGraph_InitWindow(u8 bg)` (menu_specialized.c:451-468). */
export function ConditionGraph_InitWindow(bg: number): void {
  // 1:1 include/gba/io_reg.h — inline local (précédent battle_intro.ts:47).
  const WINOUT_WIN01_BG_ALL = 0x0F;
  const WINOUT_WIN01_OBJ = 0x10;
  const WININ_WIN0_BG_ALL = 0x0F, WININ_WIN0_OBJ = 0x10, WININ_WIN0_CLR = 0x20;
  const WININ_WIN1_BG_ALL = 0x0F00, WININ_WIN1_OBJ = 0x1000, WININ_WIN1_CLR = 0x2000;
  let flags = 0;
  if (bg >= NUM_BACKGROUNDS)
    bg = 0;
  // Unset the WINOUT flag for the bg.
  flags = (WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ) & ~(1 << bg);
  // Set limits for graph data
  SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(0, DISPLAY_WIDTH));                 // Right side horizontal
  SetGpuReg(REG_OFFSET_WIN1H, WIN_RANGE(0, CONDITION_GRAPH_CENTER_X));     // Left side horizontal
  SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(CONDITION_GRAPH_TOP_Y, CONDITION_GRAPH_BOTTOM_Y)); // Right side vertical
  SetGpuReg(REG_OFFSET_WIN1V, WIN_RANGE(CONDITION_GRAPH_TOP_Y, CONDITION_GRAPH_BOTTOM_Y)); // Left side vertical
  SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ | WININ_WIN1_CLR);
  SetGpuReg(REG_OFFSET_WINOUT, flags);
}

/** 1:1 `void ConditionGraph_Update(struct ConditionGraph *graph)` (menu_specialized.c:470-477).
 *  `curPositions[i] = newPositions[counter][i]` = copie STRUCT (par valeur) → copie x/y. */
export function ConditionGraph_Update(graph: ConditionGraph): void {
  let i = 0;
  for (i = 0; i < CONDITION_COUNT; i++)
  {
    graph.curPositions[i].x = graph.newPositions[graph.updateCounter][i].x;
    graph.curPositions[i].y = graph.newPositions[graph.updateCounter][i].y;
  }
  graph.needsDraw = true;
}

/** 1:1 `static void ConditionGraph_CalcLine(struct ConditionGraph *graph, u16 *scanline, struct UCoords16 *pos1, struct UCoords16 *pos2, bool8 dir, u16 *overflowScanline)`
 *  (menu_specialized.c:479-578). Arith pointeur u16* → index à plat (si/oi), cf.
 *  convention repo « pointer-walks C → refs/index ». `dir` est UTILISÉ comme index
 *  ET comme terme additif (bool8 0/1) → number. */
function ConditionGraph_CalcLine(graph: ConditionGraph, scanline: Uint16Array, pos1: UCoords16, pos2: UCoords16, dir: number, overflowScanline: Uint16Array | null): void {
  let i = 0, height = 0, top = 0, bottom = 0, x2 = 0;
  let ptrArr: Uint16Array; let ptrIdx = 0;   // `u16 *ptr` (fin de ligne)
  let x = 0, xIncrement = 0;
  let si = 0;   // index halfword dans `scanline` (≡ scanline += n)
  let oi = 0;   // index halfword dans `overflowScanline`

  if (pos1.y < pos2.y)
  {
    top = pos1.y;
    bottom = pos2.y;
    x = pos1.x << 10;
    x2 = pos2.x;
    height = bottom - top;
    if (height !== 0)
      xIncrement = Math.trunc(((x2 - pos1.x) << 10) / height);
  }
  else
  {
    bottom = pos1.y;
    top = pos2.y;
    x = pos2.x << 10;
    x2 = pos1.x;
    height = bottom - top;
    if (height !== 0)
      xIncrement = Math.trunc(((x2 - pos2.x) << 10) / height);
  }

  height++;
  if (overflowScanline == null)
  {
    si += (top - CONDITION_GRAPH_TOP_Y) * 2;
    for (i = 0; i < height; i++)
    {
      scanline[si + dir] = SHIFT_RIGHT_ADJUSTED(x, 10) + dir;
      x += xIncrement;
      si += 2;
    }
    ptrArr = scanline; ptrIdx = si - 2;
  }
  else if (xIncrement > 0)
  {
    oi += (top - CONDITION_GRAPH_TOP_Y) * 2;
    // Less readable than the other loops, but it has to be written this way to match.
    for (i = 0; i < height; overflowScanline[oi + dir] = SHIFT_RIGHT_ADJUSTED(x, 10) + dir, x += xIncrement, oi += 2, i++)
    {
      if (x >= (CONDITION_GRAPH_CENTER_X << 10))
        break;
    }

    graph.bottom = top + i;
    si += (graph.bottom - CONDITION_GRAPH_TOP_Y) * 2;
    for (; i < height; i++)
    {
      scanline[si + dir] = SHIFT_RIGHT_ADJUSTED(x, 10) + dir;
      x += xIncrement;
      si += 2;
    }
    ptrArr = scanline; ptrIdx = si - 2;
  }
  else if (xIncrement < 0)
  {
    si += (top - CONDITION_GRAPH_TOP_Y) * 2;
    for (i = 0; i < height; i++)
    {
      scanline[si + dir] = SHIFT_RIGHT_ADJUSTED(x, 10) + dir;
      if (x < (CONDITION_GRAPH_CENTER_X << 10))
      {
        scanline[si + dir] = CONDITION_GRAPH_CENTER_X;
        break;
      }
      x += xIncrement;
      si += 2;
    }

    graph.bottom = top + i;
    oi += (graph.bottom - CONDITION_GRAPH_TOP_Y) * 2;
    for (; i < height; i++)
    {
      overflowScanline![oi + dir] = SHIFT_RIGHT_ADJUSTED(x, 10) + dir;
      x += xIncrement;
      oi += 2;
    }
    ptrArr = overflowScanline!; ptrIdx = oi - 2;
  }
  else
  {
    graph.bottom = top;
    si += (top - CONDITION_GRAPH_TOP_Y) * 2;
    oi += (top - CONDITION_GRAPH_TOP_Y) * 2;
    scanline[si + 1] = pos1.x + 1;
    overflowScanline![oi + 0] = pos2.x;
    overflowScanline![oi + 1] = CONDITION_GRAPH_CENTER_X;
    return;
  }

  ptrArr[ptrIdx + dir] = dir + x2;
}

/** 1:1 `static void ConditionGraph_CalcRightHalf(struct ConditionGraph *graph)` (menu_specialized.c:580-628).
 *  scanlineRight[ligne][col] → à plat [(ligne)*2 + col]. */
function ConditionGraph_CalcRightHalf(graph: ConditionGraph): void {
  let i = 0, y = 0, bottom = 0;

  // Calculate Cool -> Beauty line
  if (graph.curPositions[GRAPH_COOL].y < graph.curPositions[GRAPH_BEAUTY].y)
  {
    y = graph.curPositions[GRAPH_COOL].y;
    ConditionGraph_CalcLine(graph, graph.scanlineRight, graph.curPositions[GRAPH_COOL], graph.curPositions[GRAPH_BEAUTY], 1, null);
  }
  else
  {
    y = graph.curPositions[GRAPH_BEAUTY].y;
    ConditionGraph_CalcLine(graph, graph.scanlineRight, graph.curPositions[GRAPH_BEAUTY], graph.curPositions[GRAPH_COOL], 0, null);
  }

  // Calculate Beauty -> Cute line
  // No need for conditional, positions on the Beauty line are always above the Cute line
  ConditionGraph_CalcLine(graph, graph.scanlineRight, graph.curPositions[GRAPH_BEAUTY], graph.curPositions[GRAPH_CUTE], 1, null);

  // Calculate Cute -> Smart line (includes left scanline because this crosses the halfway point)
  i = (graph.curPositions[GRAPH_CUTE].y <= graph.curPositions[GRAPH_SMART].y) ? 1 : 0;
  ConditionGraph_CalcLine(graph, graph.scanlineRight, graph.curPositions[GRAPH_CUTE], graph.curPositions[GRAPH_SMART], i, graph.scanlineLeft);

  // Clear down to new top
  for (i = CONDITION_GRAPH_TOP_Y; i < y; i++)
  {
    graph.scanlineRight[(i - CONDITION_GRAPH_TOP_Y) * 2 + 0] = 0;
    graph.scanlineRight[(i - CONDITION_GRAPH_TOP_Y) * 2 + 1] = 0;
  }

  for (i = graph.curPositions[GRAPH_COOL].y; i <= graph.bottom; i++)
    graph.scanlineRight[(i - CONDITION_GRAPH_TOP_Y) * 2 + 0] = CONDITION_GRAPH_CENTER_X;

  // Clear after new bottom
  bottom = Math.max(graph.bottom, graph.curPositions[GRAPH_CUTE].y);
  for (i = bottom + 1; i <= CONDITION_GRAPH_BOTTOM_Y; i++)
  {
    graph.scanlineRight[(i - CONDITION_GRAPH_TOP_Y) * 2 + 0] = 0;
    graph.scanlineRight[(i - CONDITION_GRAPH_TOP_Y) * 2 + 1] = 0;
  }

  for (i = CONDITION_GRAPH_TOP_Y; i <= CONDITION_GRAPH_BOTTOM_Y; i++)
  {
    if (graph.scanlineRight[(i - CONDITION_GRAPH_TOP_Y) * 2 + 0] === 0
     && graph.scanlineRight[(i - CONDITION_GRAPH_TOP_Y) * 2 + 1] !== 0)
      graph.scanlineRight[(i - CONDITION_GRAPH_TOP_Y) * 2 + 0] = CONDITION_GRAPH_CENTER_X;
  }
}

/** 1:1 `static void ConditionGraph_CalcLeftHalf(struct ConditionGraph *graph)` (menu_specialized.c:630-676). */
function ConditionGraph_CalcLeftHalf(graph: ConditionGraph): void {
  let i = 0, y = 0, bottom = 0;

  // Calculate Cool -> Tough line
  if (graph.curPositions[GRAPH_COOL].y < graph.curPositions[GRAPH_TOUGH].y)
  {
    y = graph.curPositions[GRAPH_COOL].y;
    ConditionGraph_CalcLine(graph, graph.scanlineLeft, graph.curPositions[GRAPH_COOL], graph.curPositions[GRAPH_TOUGH], 0, null);
  }
  else
  {
    y = graph.curPositions[GRAPH_TOUGH].y;
    ConditionGraph_CalcLine(graph, graph.scanlineLeft, graph.curPositions[GRAPH_TOUGH], graph.curPositions[GRAPH_COOL], 1, null);
  }

  // Calculate Tough -> Smart line
  // No need for conditional, positions on the Tough line are always above the Smart line
  ConditionGraph_CalcLine(graph, graph.scanlineLeft, graph.curPositions[GRAPH_TOUGH], graph.curPositions[GRAPH_SMART], 0, null);

  // Clear down to new top
  for (i = CONDITION_GRAPH_TOP_Y; i < y; i++)
  {
    graph.scanlineLeft[(i - CONDITION_GRAPH_TOP_Y) * 2 + 0] = 0;
    graph.scanlineLeft[(i - CONDITION_GRAPH_TOP_Y) * 2 + 1] = 0;
  }

  for (i = graph.curPositions[GRAPH_COOL].y; i <= graph.bottom; i++)
    graph.scanlineLeft[(i - CONDITION_GRAPH_TOP_Y) * 2 + 1] = CONDITION_GRAPH_CENTER_X;

  // Clear after new bottom
  bottom = Math.max(graph.bottom, graph.curPositions[GRAPH_SMART].y + 1);
  for (i = bottom; i <= CONDITION_GRAPH_BOTTOM_Y; i++)
  {
    graph.scanlineLeft[(i - CONDITION_GRAPH_TOP_Y) * 2 + 0] = 0;
    graph.scanlineLeft[(i - CONDITION_GRAPH_TOP_Y) * 2 + 1] = 0;
  }

  for (i = 0; i < CONDITION_GRAPH_HEIGHT; i++)
  {
    if (graph.scanlineLeft[i * 2 + 0] >= graph.scanlineLeft[i * 2 + 1])
    {
      graph.scanlineLeft[i * 2 + 1] = 0;
      graph.scanlineLeft[i * 2 + 0] = 0;
    }
  }
}

/** 1:1 `void ConditionGraph_CalcPositions(u8 *conditions, struct UCoords16 *positions)`
 *  (menu_specialized.c:678-707). ⚠️ `sinIdx` est u8 → wraparound &0xFF LOAD-BEARING
 *  (64+51×4=268→12 ; cf. pitfall-c-narrow-int-wraparound). gSineTable = 320 entrées
 *  (index max 64+255=319 OK). `*(conditions++)` → index ci. */
export function ConditionGraph_CalcPositions(conditions: number[] | Uint8Array, positions: UCoords16[]): void {
  let lineLength = 0, sinIdx = 0;
  let posIdx = 0;
  let i = 0;
  let ci = 0; // walk de `conditions`

  // Cool is straight up-and-down (not angled), so no need for Sin
  lineLength = sConditionToLineLength[conditions[ci++]];
  positions[GRAPH_COOL].x = CONDITION_GRAPH_CENTER_X;
  positions[GRAPH_COOL].y = CONDITION_GRAPH_CENTER_Y - lineLength;

  sinIdx = 64;
  posIdx = GRAPH_COOL;
  for (i = 1; i < CONDITION_COUNT; i++)
  {
    sinIdx = (sinIdx + 51) & 0xFF;  // u8 += 51
    if (--posIdx < 0)
      posIdx = CONDITION_COUNT - 1;

    if (posIdx === GRAPH_CUTE)
      sinIdx = (sinIdx + 1) & 0xFF; // u8 ++

    lineLength = sConditionToLineLength[conditions[ci++]];
    positions[posIdx].x = CONDITION_GRAPH_CENTER_X + ((lineLength * gSineTable[64 + sinIdx]) >> 8);
    positions[posIdx].y = CONDITION_GRAPH_CENTER_Y - ((lineLength * gSineTable[sinIdx]) >> 8);

    if (posIdx <= GRAPH_CUTE && (lineLength !== 32 || posIdx !== GRAPH_CUTE))
      positions[posIdx].x++;
  }
}

/** 1:1 `s32 GetBoxOrPartyMonData(u16 boxId, u16 monId, s32 request, u8 *dst)` (menu_specialized.c:893-913).
 *  ADAPTATION frontière strings (garde « strings JS vs buffers GBA », bd6ee7f31 ;
 *  précédent field_poison.ts:96) : notre GetMonData(NICKNAME/OT_NAME) renvoie une
 *  string JS et n'écrit PAS dst → encodeOwText + StringCopy ici, à la frontière. */
export function GetBoxOrPartyMonData(boxId: number, monId: number, request: number, dst: Uint8Array | null): number {
  let ret = 0;
  if (boxId === TOTAL_BOXES_COUNT) // Party mon.
  {
    if (request === MON_DATA_NICKNAME || request === MON_DATA_OT_NAME)
    {
      const s = GetMonData(gPlayerParty[monId], request) as unknown;
      if (dst) StringCopy(dst, encodeOwText(typeof s === 'string' ? s : ''));
      ret = 1;
    }
    else
      ret = GetMonData(gPlayerParty[monId], request) as number;
  }
  else
  {
    if (request === MON_DATA_NICKNAME || request === MON_DATA_OT_NAME)
    {
      const s = GetAndCopyBoxMonDataAt(boxId, monId, request, dst) as unknown;
      if (dst) StringCopy(dst, encodeOwText(typeof s === 'string' ? s : ''));
      ret = 1;
    }
    else
      ret = GetBoxMonDataAt(boxId, monId, request);
  }
  return ret;
}

/** 1:1 `bool8 MoveConditionMonOnscreen(s16 *x)` (menu_specialized.c:1093-1100).
 *  `s16 *x` → box `{ v }` (convention repo pointer-walks C → refs). */
export function MoveConditionMonOnscreen(x: { v: number }): boolean {
  x.v += 24;
  if (x.v > 0)
    x.v = 0;
  return (x.v !== 0);
}

/** 1:1 `bool8 MoveConditionMonOffscreen(s16 *x)` (menu_specialized.c:1102-1109). */
export function MoveConditionMonOffscreen(x: { v: number }): boolean {
  x.v -= 24;
  if (x.v < -80)
    x.v = -80;
  return (x.v !== -80);
}

/** 1:1 `bool8 ConditionMenu_UpdateMonEnter(struct ConditionGraph *graph, s16 *x)` (menu_specialized.c:1111-1117). */
export function ConditionMenu_UpdateMonEnter(graph: ConditionGraph, x: { v: number }): boolean {
  const graphUpdating = ConditionGraph_TryUpdate(graph);
  const monUpdating = MoveConditionMonOnscreen(x);
  return (graphUpdating || monUpdating);
}

/** 1:1 `bool8 ConditionMenu_UpdateMonExit(struct ConditionGraph *graph, s16 *x)` (menu_specialized.c:1119-1125). */
export function ConditionMenu_UpdateMonExit(graph: ConditionGraph, x: { v: number }): boolean {
  const graphUpdating = ConditionGraph_TryUpdate(graph);
  const monUpdating = MoveConditionMonOffscreen(x);
  return (graphUpdating || monUpdating);
}

/* ─── Sprites condition (menu_specialized.c:1127-1511) ──────────────────────── */

// 1:1 INCGFX (menu_specialized.c:1127-1130) — ADAPTATION ASSETS (pattern
// PrefetchMatchCallAssets, pokenav_match_call_gfx.ts:83) : la ROM a les gfx
// inline ; le port fetch depuis public/decomp/em/pokenav/condition/ dans des
// module-lets, gatés par le looped-task d'ouverture (poll, pas d'await).
// ⚠️ 1:1 quirk décomp : les noms _Gfx/_Pal du SPARKLE sont INVERSÉS dans le .c
// (sConditionSparkle_Gfx = .gbapal, sConditionSparkle_Pal = .4bpp) — conservés.
let sConditionPokeball_Gfx: Uint8Array | null = null;             // pokeball.png .4bpp (0x100)
let sConditionPokeballPlaceholder_Gfx: Uint8Array | null = null;  // pokeball_placeholder.png .4bpp (0x20)
let sConditionSparkle_Gfx: Uint16Array | null = null;             // sparkle.png .gbapal (= PALETTE, quirk 1:1)
let sConditionSparkle_Pal: Uint8Array | null = null;              // sparkle.png .4bpp (= TILES, quirk 1:1)
// 1:1 graphics.c:1320-1321 (INCGFX cancel.pal 32 couleurs / cancel.png .4bpp).
let gPokenavConditionCancel_Pal: Uint16Array | null = null;
let gPokenavConditionCancel_Gfx: Uint8Array | null = null;
let _conditionSpriteGfxLoadStarted = false;

/** ADAPTATION ASSETS (précédent PrefetchMatchCallAssets) : préchauffe les sheets/pals
 *  des sprites condition. Idempotent ; HURLE en console si un asset manque. */
export function PrefetchConditionSpriteAssets(): void {
  if (_conditionSpriteGfxLoadStarted) return;
  _conditionSpriteGfxLoadStarted = true;
  void (async () => {
    try {
      const [ballGfx, phGfx, sparkleGfx, sparklePal, cancelGfx, cancelPal] = await Promise.all([
        loadTileBin('/decomp/em/pokenav/condition/pokeball.png', 4),
        loadTileBin('/decomp/em/pokenav/condition/pokeball_placeholder.png', 4),
        loadTileBin('/decomp/em/pokenav/condition/sparkle.png', 4),
        extractPngPlte('/decomp/em/pokenav/condition/sparkle.png'),
        loadTileBin('/decomp/em/pokenav/condition/cancel.png', 4),
        loadGbaPal('/decomp/em/pokenav/condition/cancel.pal'),        // 32 couleurs (BALL + CANCEL)
      ]);
      sConditionPokeball_Gfx = ballGfx;
      sConditionPokeballPlaceholder_Gfx = phGfx;
      sConditionSparkle_Pal = sparkleGfx;                    // quirk 1:1 : _Pal = tiles
      sConditionSparkle_Gfx = sparklePal ?? new Uint16Array(16); // quirk 1:1 : _Gfx = palette
      gPokenavConditionCancel_Gfx = cancelGfx;
      gPokenavConditionCancel_Pal = cancelPal;
    } catch (e) {
      console.error('[condition sprites] chargement assets ÉCHOUÉ (le gate du looped-task va attendre) :', e);
    }
  })();
}

/** Gate du looped-task (adaptation, précédent LoopedTask_OpenMatchCall case 0). */
export function ConditionSpriteAssetsReady(): boolean {
  return !!(sConditionPokeball_Gfx && sConditionPokeballPlaceholder_Gfx
    && sConditionSparkle_Pal && gPokenavConditionCancel_Gfx && gPokenavConditionCancel_Pal);
}

/** 1:1 `static const struct OamData sOam_ConditionMonPic` (menu_specialized.c:1132-1147) — 64x64, prio 1. */
const sOam_ConditionMonPic = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0, x: 0, matrixNum: 0, size: 3, tileNum: 0,
  priority: 1, paletteNum: 0, affineParam: 0,
};

/** 1:1 `static const struct OamData sOam_ConditionSelectionIcon` (menu_specialized.c:1149-1164) — 16x16, prio 2. */
const sOam_ConditionSelectionIcon = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0, x: 0, matrixNum: 0, size: 1, tileNum: 0,
  priority: 2, paletteNum: 0, affineParam: 0,
};

/** 1:1 `sAnim_ConditionSelectionIcon_Selected/Unselected` + table (menu_specialized.c:1166-1182). */
const sAnim_ConditionSelectionIcon_Selected: AnimCmd[] = [ANIMCMD_FRAME(0, 5), ANIMCMD_END];
const sAnim_ConditionSelectionIcon_Unselected: AnimCmd[] = [ANIMCMD_FRAME(4, 5), ANIMCMD_END];
const sAnims_ConditionSelectionIcon: AnimCmd[][] = [
  sAnim_ConditionSelectionIcon_Selected,   // [CONDITION_ICON_SELECTED]
  sAnim_ConditionSelectionIcon_Unselected, // [CONDITION_ICON_UNSELECTED]
];

// Just loads the generic data, up to the caller to load the actual sheet/pal for the specific mon
/** 1:1 `void LoadConditionMonPicTemplate(struct SpriteSheet *sheet, struct SpriteTemplate *template, struct SpritePalette *pal)`
 *  (menu_specialized.c:1185-1205). `*out = data` → Object.assign (structs par valeur). */
export function LoadConditionMonPicTemplate(sheet: Record<string, unknown>, template: Record<string, unknown>, pal: Record<string, unknown>): void {
  Object.assign(sheet, { data: null, size: MON_PIC_SIZE, tag: TAG_CONDITION_MON });
  Object.assign(template, {
    tileTag: TAG_CONDITION_MON,
    paletteTag: TAG_CONDITION_MON,
    oam: sOam_ConditionMonPic,
    anims: gDummySpriteAnimTable,
    images: null,
    affineAnims: gDummySpriteAffineAnimTable,
    callback: SpriteCallbackDummy,
  });
  Object.assign(pal, { data: null, tag: TAG_CONDITION_MON });
}

/** 1:1 `void LoadConditionSelectionIcons(struct SpriteSheet *sheets, struct SpriteTemplate *template, struct SpritePalette *pals)`
 *  (menu_specialized.c:1207-1245). `*(sheets++) = dataSheets[i]` → écrit sheets[0..3] /
 *  pals[0..2] ({} = terminateur, arrêt de LoadSpriteSheets / Pokenav_AllocAndLoadPalettes). */
export function LoadConditionSelectionIcons(sheets: Record<string, unknown>[], template: Record<string, unknown>, pals: Record<string, unknown>[]): void {
  let i = 0;
  const dataSheets: Record<string, unknown>[] = [
    { data: sConditionPokeball_Gfx, size: 0x100, tag: TAG_CONDITION_BALL },
    { data: sConditionPokeballPlaceholder_Gfx, size: 0x20, tag: TAG_CONDITION_BALL_PLACEHOLDER },
    { data: gPokenavConditionCancel_Gfx, size: 0x100, tag: TAG_CONDITION_CANCEL },
    {},
  ];
  const dataPals: Record<string, unknown>[] = [
    { data: gPokenavConditionCancel_Pal, tag: TAG_CONDITION_BALL },
    // 1:1 `gPokenavConditionCancel_Pal + 16` : 2e palette du .pal 32 couleurs.
    { data: gPokenavConditionCancel_Pal ? gPokenavConditionCancel_Pal.subarray(16) : null, tag: TAG_CONDITION_CANCEL },
    {},
  ];
  // Tag is overwritten for the other selection icons
  const dataTemplate = {
    tileTag: TAG_CONDITION_BALL,
    paletteTag: TAG_CONDITION_BALL,
    oam: sOam_ConditionSelectionIcon,
    anims: sAnims_ConditionSelectionIcon,
    images: null,
    affineAnims: gDummySpriteAffineAnimTable,
    callback: SpriteCallbackDummy,
  };
  for (i = 0; i < dataSheets.length; i++)
    sheets[i] = Object.assign(sheets[i] ?? {}, dataSheets[i]);
  Object.assign(template, dataTemplate);
  for (i = 0; i < dataPals.length; i++)
    pals[i] = Object.assign(pals[i] ?? {}, dataPals[i]);
}

// 1:1 #define sprite->data[] (menu_specialized.c:1247-1252).
const sSparkleId = 0;            // data[0]
const sDelayTimer = 1;           // data[1]
const sNumExtraSparkles = 2;     // data[2]
const sCurSparkleId = 3;         // data[3]
const sMonSpriteId = 4;          // data[4]
const sNextSparkleSpriteId = 5;  // data[5]

/** 1:1 `void LoadConditionSparkle(struct SpriteSheet *sheet, struct SpritePalette *pal)`
 *  (menu_specialized.c:1254-1261). Quirk 1:1 : sheet.data = sConditionSparkle_Pal
 *  (= les TILES .4bpp) et pal.data = sConditionSparkle_Gfx (= la PALETTE .gbapal). */
export function LoadConditionSparkle(sheet: Record<string, unknown>, pal: Record<string, unknown>): void {
  Object.assign(sheet, { data: sConditionSparkle_Pal, size: 0x380, tag: TAG_CONDITION_SPARKLE });
  Object.assign(pal, { data: sConditionSparkle_Gfx, tag: TAG_CONDITION_SPARKLE });
}

/** 1:1 `static void SpriteCB_ConditionSparkle_DoNextAfterDelay(struct Sprite *sprite)` (menu_specialized.c:1263-1270). */
function SpriteCB_ConditionSparkle_DoNextAfterDelay(sprite: DecompSprite): void {
  if (++sprite.data[sDelayTimer] > 60)
  {
    sprite.data[sDelayTimer] = 0;
    SetNextConditionSparkle(sprite);
  }
}

/** 1:1 `static void SpriteCB_ConditionSparkle_WaitForAllAnim(struct Sprite *sprite)` (menu_specialized.c:1272-1279). */
function SpriteCB_ConditionSparkle_WaitForAllAnim(sprite: DecompSprite): void {
  if (sprite.animEnded)
  {
    sprite.data[sDelayTimer] = 0;
    sprite.callback = SpriteCB_ConditionSparkle_DoNextAfterDelay as never;
  }
}

/** 1:1 `static const struct OamData sOam_ConditionSparkle` (menu_specialized.c:1281-1291) — 16x16, prio 0. */
const sOam_ConditionSparkle = {
  y: 0, affineMode: 0, objMode: 0, bpp: 0,
  shape: 0, x: 0, size: 1, priority: 0,
};

/** 1:1 `static const union AnimCmd sAnim_ConditionSparkle[]` (menu_specialized.c:1293-1303) —
 *  7 frames de 4 tiles. La table sAnims (1305-1314) pointe des OFFSETS dans ce tableau ;
 *  seule l'entrée [0] est utilisée (les suivantes seraient OOB, comme documenté décomp). */
const sAnim_ConditionSparkle: AnimCmd[] = [
  ANIMCMD_FRAME(0, 5),
  ANIMCMD_FRAME(4, 5),
  ANIMCMD_FRAME(8, 5),
  ANIMCMD_FRAME(12, 5),
  ANIMCMD_FRAME(16, 5),
  ANIMCMD_FRAME(20, 5),
  ANIMCMD_FRAME(24, 5),
  ANIMCMD_END,
];
const sAnims_ConditionSparkle: AnimCmd[][] = [
  sAnim_ConditionSparkle, // Only this entry is used (&sAnim[0])
];

/** 1:1 `static const struct SpriteTemplate sSpriteTemplate_ConditionSparkle` (menu_specialized.c:1316-1325). */
const sSpriteTemplate_ConditionSparkle = {
  tileTag: TAG_CONDITION_SPARKLE,
  paletteTag: TAG_CONDITION_SPARKLE,
  oam: sOam_ConditionSparkle,
  anims: sAnims_ConditionSparkle,
  images: null as unknown,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCB_ConditionSparkle,
};

/** 1:1 `static const s16 sConditionSparkleCoords[MAX_CONDITION_SPARKLES][2]` (menu_specialized.c:1327-1339). */
const sConditionSparkleCoords: readonly (readonly number[])[] = [
  [  0, -35],
  [ 20, -28],
  [ 33, -10],
  [ 33,  10],
  [ 20,  28],
  [  0,  35],
  [-20,  28],
  [-33,  10],
  [-33, -10],
  [-20, -28],
];

/** 1:1 `static void SetConditionSparklePosition(struct Sprite *sprite)` (menu_specialized.c:1341-1355). */
function SetConditionSparklePosition(sprite: DecompSprite): void {
  const rt = getRuntime();
  const mon = rt ? rt.gSprites[sprite.data[sMonSpriteId]] : null;
  if (mon != null)
  {
    sprite.x = mon.x + mon.x2 + sConditionSparkleCoords[sprite.data[sSparkleId]][0];
    sprite.y = mon.y + mon.y2 + sConditionSparkleCoords[sprite.data[sSparkleId]][1];
  }
  else
  {
    sprite.x = sConditionSparkleCoords[sprite.data[sSparkleId]][0] + 40;
    sprite.y = sConditionSparkleCoords[sprite.data[sSparkleId]][1] + 104;
  }
}

/** 1:1 `static void InitConditionSparkles(u8 count, bool8 allowFirstShowAll, struct Sprite **sprites)` (menu_specialized.c:1357-1382). */
function InitConditionSparkles(count: number, allowFirstShowAll: boolean, sprites: (DecompSprite | null)[]): void {
  let i = 0;
  for (i = 0; i < MAX_CONDITION_SPARKLES; i++)
  {
    const spr = sprites[i];
    if (spr != null)
    {
      spr.data[sSparkleId] = i;
      spr.data[sDelayTimer] = (i * 16) + 1;
      spr.data[sNumExtraSparkles] = count;
      spr.data[sCurSparkleId] = i;
      if (!allowFirstShowAll || count !== MAX_CONDITION_SPARKLES - 1)
      {
        spr.callback = SpriteCB_ConditionSparkle as never;
      }
      else
      {
        SetConditionSparklePosition(spr);
        ShowAllConditionSparkles(spr);
        spr.callback = SpriteCB_ConditionSparkle_WaitForAllAnim as never;
        spr.invisible = false;
      }
    }
  }
}

/** 1:1 `static void SetNextConditionSparkle(struct Sprite *sprite)` (menu_specialized.c:1384-1394). */
function SetNextConditionSparkle(sprite: DecompSprite): void {
  const rt = getRuntime();
  if (!rt) return;
  let i = 0;
  let id = sprite.data[sNextSparkleSpriteId];
  for (i = 0; i < sprite.data[sNumExtraSparkles] + 1; i++)
  {
    const spr = rt.gSprites[id]!; // 1:1 &gSprites[id] (jamais NULL en C)
    spr.data[sDelayTimer] = (spr.data[sSparkleId] * 16) + 1;
    spr.callback = SpriteCB_ConditionSparkle as never;
    id = spr.data[sNextSparkleSpriteId];
  }
}

/** 1:1 `void ResetConditionSparkleSprites(struct Sprite **sprites)` (menu_specialized.c:1396-1402). */
export function ResetConditionSparkleSprites(sprites: (DecompSprite | null)[]): void {
  let i = 0;
  for (i = 0; i < MAX_CONDITION_SPARKLES; i++)
    sprites[i] = null;
}

/** 1:1 `void CreateConditionSparkleSprites(struct Sprite **sprites, u8 monSpriteId, u8 _count)` (menu_specialized.c:1404-1430). */
export function CreateConditionSparkleSprites(sprites: (DecompSprite | null)[], monSpriteId: number, _count: number): void {
  const rt = getRuntime();
  if (!rt) return;
  let i = 0, spriteId = 0, firstSpriteId = 0;
  const count = _count;
  for (i = 0; i < count + 1; i++)
  {
    spriteId = CreateSprite(sSpriteTemplate_ConditionSparkle, 0, 0, 0);
    if (spriteId !== MAX_SPRITES)
    {
      sprites[i] = rt.gSprites[spriteId] ?? null; // 1:1 &gSprites[spriteId]
      sprites[i]!.invisible = true;
      sprites[i]!.data[sMonSpriteId] = monSpriteId;
      if (i !== 0)
        sprites[i - 1]!.data[sNextSparkleSpriteId] = spriteId;
      else
        firstSpriteId = spriteId;
    }
    else
    {
      break;
    }
  }
  sprites[count]!.data[sNextSparkleSpriteId] = firstSpriteId;
  InitConditionSparkles(count, true, sprites);
}

/** 1:1 `void DestroyConditionSparkleSprites(struct Sprite **sprites)` (menu_specialized.c:1432-1448). */
export function DestroyConditionSparkleSprites(sprites: (DecompSprite | null)[]): void {
  let i = 0;
  for (i = 0; i < MAX_CONDITION_SPARKLES; i++)
  {
    if (sprites[i] != null)
    {
      DestroySprite(sprites[i]);
      sprites[i] = null;
    }
    else
    {
      break;
    }
  }
}

/** 1:1 `void FreeConditionSparkles(struct Sprite **sprites)` (menu_specialized.c:1450-1455). */
export function FreeConditionSparkles(sprites: (DecompSprite | null)[]): void {
  DestroyConditionSparkleSprites(sprites);
  FreeSpriteTilesByTag(TAG_CONDITION_SPARKLE);
  FreeSpritePaletteByTag(TAG_CONDITION_SPARKLE);
}

/** 1:1 `static void SpriteCB_ConditionSparkle(struct Sprite *sprite)` (menu_specialized.c:1457-1492).
 *  SeekSpriteAnim = signature repo (rt, sprite, idx). */
function SpriteCB_ConditionSparkle(sprite: DecompSprite): void {
  const rt = getRuntime();
  // Delay, then do sparkle anim
  if (sprite.data[sDelayTimer] !== 0)
  {
    if (--sprite.data[sDelayTimer] !== 0)
      return;
    if (rt) SeekSpriteAnim(rt, sprite as never, 0);
    sprite.invisible = false;
  }
  SetConditionSparklePosition(sprite);
  // Set up next sparkle
  if (sprite.animEnded)
  {
    sprite.invisible = true;
    if (sprite.data[sCurSparkleId] === sprite.data[sNumExtraSparkles])
    {
      if (sprite.data[sCurSparkleId] === MAX_CONDITION_SPARKLES - 1)
      {
        ShowAllConditionSparkles(sprite);
        sprite.callback = SpriteCB_ConditionSparkle_WaitForAllAnim as never;
      }
      else
      {
        sprite.callback = SpriteCB_ConditionSparkle_DoNextAfterDelay as never;
      }
    }
    else
    {
      sprite.callback = SpriteCallbackDummy as never;
    }
  }
}

/** 1:1 `static void ShowAllConditionSparkles(struct Sprite *sprite)` (menu_specialized.c:1494-1504). */
function ShowAllConditionSparkles(sprite: DecompSprite): void {
  const rt = getRuntime();
  if (!rt) return;
  let i = 0;
  let id = sprite.data[sNextSparkleSpriteId];
  for (i = 0; i < sprite.data[sNumExtraSparkles] + 1; i++)
  {
    const spr = rt.gSprites[id]!; // 1:1 &gSprites[id]
    SeekSpriteAnim(rt, spr as never, 0);
    spr.invisible = false;
    id = spr.data[sNextSparkleSpriteId];
  }
}
