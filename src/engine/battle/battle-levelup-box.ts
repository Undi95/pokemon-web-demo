/**
 * battle/battle-levelup-box.ts — Port 1:1 de la boîte de stats au level-up combat.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:5927-6042`
 *     (Cmd_drawlvlupbox state machine + DrawLevelUpWindow1/2)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/menu_specialized.c:1513-1636`
 *     (DrawLevelUpWindowPg1/Pg2 + GetMonLevelUpWindowStats + sLvlUpStatStrings)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_bg.c` (template B_WIN_LEVEL_UP_BOX :
 *     bg=1, left=19, top=8, width=10, height=11, paletteNum=5, baseBlock=0x100)
 *
 * Rendu RÉEL via notre système de fenêtres GBA (AddWindow + FillWindowPixelBuffer
 * + AddTextPrinterParameterized3 + CopyWindowToVram) — exactement comme la fenêtre
 * de message combat. Le combat étant INLINE (battle-flow.ts), c'est battle-flow qui
 * pilote le flux 2-pages (A → page 2 → A → close) ; on expose l'API inline
 * `lvlUpBoxOpenPage1 / lvlUpBoxDrawPage2 / lvlUpBoxClose`.
 *
 * DETTE : le CADRE décoratif (HandleBattleWindow, battle_bg.c) n'est pas dessiné
 * (stub). La box a son FOND rempli (FillWindowPixelBuffer bgClr) + le texte ; il
 * manque la bordure tuilée — raffinement à venir.
 */

import {
  AddWindow,
  FillWindowPixelBuffer,
  CopyWindowToVram,
  PutWindowTilemap,
  ClearWindowTilemap,
  RemoveWindow,
  FillBgTilemapBufferRect,
} from '../ui/gba-window-system';
import { AddTextPrinterParameterized3 } from '../ui/gba-text-system';
import { B_WIN_LEVEL_UP_BOX } from './battle-windows';
import { sStandardBattleWindowTemplates } from '../decomp-data/src/battle_bg-data';
import { getRuntime } from '../system/decomp-globals';
import { REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS } from '../system/decomp-runtime';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `NUM_STATS` = 6. */
const NUM_STATS = 6;
/** 1:1 décomp `FONT_NORMAL` = 1 (text.h:10). */
const FONT_NORMAL = 1;
/** 1:1 décomp `TEXT_SKIP_DRAW` = 0xFF → rendu synchrone immédiat (pas de typewriter). */
const TEXT_SKIP_DRAW = 0xff;

/** 1:1 décomp couleurs (characters.h:247-249) passées à DrawLevelUpWindowPg1/2 :
 *  bgClr = TEXT_DYNAMIC_COLOR_5 (0xE), fgClr = TEXT_DYNAMIC_COLOR_4 (0xD),
 *  shadowClr = TEXT_DYNAMIC_COLOR_6 (0xF). color[] = {bg, fg, shadow}. */
const LVLUP_BG_CLR = 0xe;
const LVLUP_FG_CLR = 0xd;
const LVLUP_SHADOW_CLR = 0xf;
const LVLUP_COLOR: readonly number[] = [LVLUP_BG_CLR, LVLUP_FG_CLR, LVLUP_SHADOW_CLR];

/** 1:1 décomp `PIXEL_FILL(n)` (window.h:6) = (n << 4) | n. */
function PIXEL_FILL(n: number): number {
  return ((n << 4) | n) & 0xff;
}

/** 1:1 décomp `sLvlUpStatStrings[NUM_STATS]` (menu_specialized.c:1513-1521) :
 *  {gText_MaxHP, gText_Attack, gText_Defense, gText_SpAtk, gText_SpDef, gText_Speed}.
 *  Ordre d'AFFICHAGE (= les 6 lignes de la box, de haut en bas). Valeurs FR strings.c. */
const sLvlUpStatStrings: readonly string[] = [
  'PV MAX.',    // gText_MaxHP
  'ATTAQUE',    // gText_Attack
  'DEFENSE',    // gText_Defense
  'ATQ. SPE.',  // gText_SpAtk
  'DEF. SPE.',  // gText_SpDef
  'VITESSE',    // gText_Speed
];

/** Mapping ligne d'affichage i → index STAT_ dans le tableau de stats.
 *  Décomp DrawLevelUpWindowPg1 (1532-1537) : statsDiff[0..5] =
 *  after[STAT_HP/ATK/DEF/SPATK/SPDEF/SPEED]. STAT_HP=0, ATK=1, DEF=2, SPEED=3,
 *  SPATK=4, SPDEF=5 → l'ordre d'affichage HP,ATK,DEF,SPATK,SPDEF,SPEED indexe
 *  le tableau STAT_-ordonné à [0,1,2,4,5,3]. */
const DISPLAY_TO_STAT: readonly number[] = [0, 1, 2, 4, 5, 3];

// ─── Stats extraction ──────────────────────────────────────────────────────

/** Mon-like avec les 6 stats finales (= PokemonInstance party-storage). */
interface LvlUpStatMon {
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

/** 1:1 décomp `GetMonLevelUpWindowStats(mon, currStats)` (menu_specialized.c:1628).
 *  Retourne les stats STAT_-indexées : [HP, ATK, DEF, SPEED, SPATK, SPDEF]. */
export function lvlUpBoxStatsOf(mon: LvlUpStatMon): number[] {
  const s = new Array<number>(NUM_STATS).fill(0);
  s[0] = mon.maxHP;       // STAT_HP
  s[1] = mon.attack;      // STAT_ATK
  s[2] = mon.defense;     // STAT_DEF
  s[3] = mon.speed;       // STAT_SPEED
  s[4] = mon.spAttack;    // STAT_SPATK
  s[5] = mon.spDefense;   // STAT_SPDEF
  return s;
}

// ─── DrawLevelUpWindowPg1 / Pg2 (menu_specialized.c:1523-1626) — 1:1 ────────

/** 1:1 décomp `DrawLevelUpWindowPg1` (menu_specialized.c:1523). Page 1 = deltas
 *  (label + signe +/- + |delta|) pour les 6 stats. */
function DrawLevelUpWindowPg1(winId: number, statsBefore: number[], statsAfter: number[]): void {
  // 1:1 décomp 1530 : FillWindowPixelBuffer(windowId, PIXEL_FILL(bgClr)).
  FillWindowPixelBuffer(winId, PIXEL_FILL(LVLUP_BG_CLR));

  for (let i = 0; i < NUM_STATS; i++) {
    const stat = DISPLAY_TO_STAT[i];
    const diff = statsAfter[stat] - statsBefore[stat];

    // 1:1 décomp 1546-1552 : label à x=0, y=15*i.
    AddTextPrinterParameterized3(winId, FONT_NORMAL, 0, 15 * i, LVLUP_COLOR, TEXT_SKIP_DRAW, sLvlUpStatStrings[i]);

    // 1:1 décomp 1554-1561 : signe "+" (gText_Plus) ou "-" (gText_Dash) à x=56.
    const sign = diff >= 0 ? '+' : '-';
    AddTextPrinterParameterized3(winId, FONT_NORMAL, 56, 15 * i, LVLUP_COLOR, TEXT_SKIP_DRAW, sign);

    // 1:1 décomp 1562-1574 : |delta| à x=56+18 (si <=9) ou 56+12 (si >9).
    const x = Math.abs(diff) <= 9 ? 18 : 12;
    AddTextPrinterParameterized3(winId, FONT_NORMAL, 56 + x, 15 * i, LVLUP_COLOR, TEXT_SKIP_DRAW, String(Math.abs(diff)));
  }
}

/** 1:1 décomp `DrawLevelUpWindowPg2` (menu_specialized.c:1578). Page 2 = nouveaux
 *  totaux pour les 6 stats. */
function DrawLevelUpWindowPg2(winId: number, statsAfter: number[]): void {
  FillWindowPixelBuffer(winId, PIXEL_FILL(LVLUP_BG_CLR));

  for (let i = 0; i < NUM_STATS; i++) {
    const stat = DISPLAY_TO_STAT[i];
    const v = statsAfter[stat];

    // 1:1 décomp 1600-1608 : numDigits + x = 6*(4-numDigits) (right-align ~à droite).
    const numDigits = v > 99 ? 3 : v > 9 ? 2 : 1;
    const x = 6 * (4 - numDigits);

    AddTextPrinterParameterized3(winId, FONT_NORMAL, 0, 15 * i, LVLUP_COLOR, TEXT_SKIP_DRAW, sLvlUpStatStrings[i]);
    AddTextPrinterParameterized3(winId, FONT_NORMAL, 56 + x, 15 * i, LVLUP_COLOR, TEXT_SKIP_DRAW, String(v));
  }
}

// ─── API inline (pilotée par battle-flow.ts) ───────────────────────────────

let _lvlUpBoxWinId = -1;
// État BG0/BG1 avant l'ouverture (BG1 est désactivé hors level-up dans notre scène
// combat) — restauré à la fermeture.
let _prevBg0Priority = 0;
let _prevBg1Visible = false;
let _prevBg1Priority = 1;

/** 1:1 décomp Cmd_drawlvlupbox case 3+5 : BG0 priorité 1 + BG1 priorité 0 (la box
 *  passe AU-DESSUS du message) + active BG1 (ShowBg) + scroll 0 pour révéler la box.
 *  Sans la priorité BG0=1, le message (BG0) couvre les 3 lignes du bas de la box.
 *  BG1 est `visible=false` hors level-up → sans ShowBg, la box (rendue dans le
 *  VRAM/tilemap de BG1) ne s'affiche pas du tout. */
function _showLevelUpBg(): void {
  const rt = getRuntime();
  if (!rt) return;
  const bg0 = rt.gba.bg(0);
  const bg1 = rt.gba.bg(1);
  _prevBg0Priority = bg0.config.priority;
  _prevBg1Visible = bg1.config.visible;
  _prevBg1Priority = bg1.config.priority;
  bg0.config.priority = 1; // 1:1 décomp : message sous la box.
  bg1.config.visible = true;
  bg1.config.priority = 0; // 1:1 décomp : BG1 (box) priorité 0 = au-dessus.
  rt.SetGpuReg(REG_OFFSET_BG1HOFS, 0); // gBattle_BG1_X = 0
  rt.SetGpuReg(REG_OFFSET_BG1VOFS, 0); // gBattle_BG1_Y = 0 (box révélée)
}

/** Restaure l'état BG0/BG1 d'avant la box (1:1 décomp case 10). */
function _hideLevelUpBg(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.bg(0).config.priority = _prevBg0Priority;
  const bg1 = rt.gba.bg(1);
  bg1.config.visible = _prevBg1Visible;
  bg1.config.priority = _prevBg1Priority;
}

/** Coords du CADRE de la box (1:1 décomp Cmd_drawlvlupbox : HandleBattleWindow(18,7,29,19)).
 *  Le cadre entoure la fenêtre B_WIN_LEVEL_UP_BOX (tuiles 19,8 → 28,18). */
const LVLUP_FRAME_X1 = 18, LVLUP_FRAME_Y1 = 7, LVLUP_FRAME_X2 = 29, LVLUP_FRAME_Y2 = 19;

/** 1:1 décomp `HandleBattleWindow(xStart, yStart, xEnd, yEnd, flags)`
 *  (battle_script_commands.c:10155). Écrit les tuiles de cadre (coins/bords/centre,
 *  IDs 0x022-0x02A palette 1) dans le tilemap BG1 autour de la zone. `clear` = efface
 *  (tile 0). Les tuiles cadre sont chargées dans le tileset BG1 (vérifié runtime). */
function HandleBattleWindow(xStart: number, yStart: number, xEnd: number, yEnd: number, clear: boolean): void {
  for (let destY = yStart; destY <= yEnd; destY++) {
    for (let destX = xStart; destX <= xEnd; destX++) {
      let tile: number;
      if (destY === yStart) {
        tile = destX === xStart ? 0x022 : destX === xEnd ? 0x024 : 0x023; // haut : ╔ ═ ╗
      } else if (destY === yEnd) {
        tile = destX === xStart ? 0x028 : destX === xEnd ? 0x02a : 0x029; // bas : ╚ ═ ╝
      } else {
        tile = destX === xStart ? 0x025 : destX === xEnd ? 0x027 : 0x026; // milieu : ║ · ║
      }
      if (clear) tile = 0;
      // 1:1 décomp : CopyToBgTilemapBufferRect_ChangePalette(BG1, &var, x, y, 1, 1, 0x11)
      // — palette embarquée = 1 (var = 0x1022…). 0x11 (>15) = garder la palette embarquée.
      FillBgTilemapBufferRect(1, tile, destX, destY, 1, 1, 1);
    }
  }
}

/** Ouvre la box + dessine la page 1 (deltas). `before`/`after` = stats
 *  STAT_-indexées (cf. lvlUpBoxStatsOf). 1:1 décomp case 3+4 (HandleBattleWindow
 *  cadre + DrawLevelUpWindow1 + CopyWindowToVram) + ShowBg(1). */
export function lvlUpBoxOpenPage1(before: number[], after: number[]): void {
  if (_lvlUpBoxWinId >= 0) lvlUpBoxClose();
  const tpl = sStandardBattleWindowTemplates[B_WIN_LEVEL_UP_BOX];
  _lvlUpBoxWinId = AddWindow(tpl);
  // 1:1 décomp case 3 : dessine le cadre AVANT le texte (PutWindowTilemap écrase
  // ensuite l'intérieur avec les tuiles de texte de la fenêtre).
  HandleBattleWindow(LVLUP_FRAME_X1, LVLUP_FRAME_Y1, LVLUP_FRAME_X2, LVLUP_FRAME_Y2, false);
  PutWindowTilemap(_lvlUpBoxWinId);
  DrawLevelUpWindowPg1(_lvlUpBoxWinId, before, after);
  CopyWindowToVram(_lvlUpBoxWinId, 3 /* COPYWIN_FULL */);
  _showLevelUpBg();
}

/** Re-dessine la page 2 (totaux). 1:1 décomp case 6 (DrawLevelUpWindow2 + CopyWindowToVram). */
export function lvlUpBoxDrawPage2(after: number[]): void {
  if (_lvlUpBoxWinId < 0) return;
  DrawLevelUpWindowPg2(_lvlUpBoxWinId, after);
  CopyWindowToVram(_lvlUpBoxWinId, 3 /* COPYWIN_FULL */);
}

/** Ferme la box (clear + remove). 1:1 décomp case 8/9 (HandleBattleWindow CLEAR
 *  + ClearWindowTilemap + CopyWindowToVram). */
export function lvlUpBoxClose(): void {
  if (_lvlUpBoxWinId < 0) return;
  FillWindowPixelBuffer(_lvlUpBoxWinId, 0);
  ClearWindowTilemap(_lvlUpBoxWinId);
  CopyWindowToVram(_lvlUpBoxWinId, 3 /* COPYWIN_FULL */);
  // 1:1 décomp case 8 : HandleBattleWindow(..., WINDOW_CLEAR) efface le cadre.
  HandleBattleWindow(LVLUP_FRAME_X1, LVLUP_FRAME_Y1, LVLUP_FRAME_X2, LVLUP_FRAME_Y2, true);
  RemoveWindow(_lvlUpBoxWinId);
  _lvlUpBoxWinId = -1;
  _hideLevelUpBg();
}

/** True si la box est actuellement ouverte. */
export function lvlUpBoxIsOpen(): boolean {
  return _lvlUpBoxWinId >= 0;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleLevelupBox = {
  lvlUpBoxOpenPage1, lvlUpBoxDrawPage2, lvlUpBoxClose, lvlUpBoxStatsOf, lvlUpBoxIsOpen,
};
