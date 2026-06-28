/**
 * game/menu_specialized.ts — MIROIR 1:1 (partiel) de `src/menu_specialized.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/menu_specialized.c`.
 *
 * Bloc porté ici : la "level-up stats window" (boîte de stats au level-up),
 * fonctions PARTAGÉES (non-static dans la décomp, exportées via menu_specialized.h) :
 *   - `sLvlUpStatStrings[NUM_STATS]`     (menu_specialized.c:1513-1521)
 *   - `DrawLevelUpWindowPg1`             (menu_specialized.c:1523-1576)
 *   - `DrawLevelUpWindowPg2`             (menu_specialized.c:1578-1626)
 *   - `GetMonLevelUpWindowStats`         (menu_specialized.c:1628-1636)
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
import { AddTextPrinterParameterized3 } from './engine/ui/gba-text-system';

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
