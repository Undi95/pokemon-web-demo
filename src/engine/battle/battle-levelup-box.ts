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
 * Le CADRE est dessiné via `HandleBattleWindow` (partagé, battle-window-frame.ts,
 * tuiles 0x022-0x02A palette 1 sur BG1) — 1:1 Cmd_drawlvlupbox.
 */

import {
  AddWindow,
  FillWindowPixelBuffer,
  CopyWindowToVram,
  PutWindowTilemap,
  ClearWindowTilemap,
  RemoveWindow,
} from '../ui/gba-window-system';
import {
  DrawLevelUpWindowPg1, DrawLevelUpWindowPg2, GetMonLevelUpWindowStats,
  type LevelUpStatMon,
} from '../../game/menu_specialized';
import { HandleBattleWindow, WINDOW_BG1, WINDOW_CLEAR } from './battle-window-frame';
import { B_WIN_LEVEL_UP_BOX } from './battle-windows';
import { sStandardBattleWindowTemplates } from '../decomp-data/src/battle_bg-data';
import { getRuntime } from '../system/decomp-globals';
import { REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS } from '../system/decomp-runtime';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `NUM_STATS` = 6. */
const NUM_STATS = 6;

/** 1:1 décomp couleurs COMBAT (characters.h:247-249) passées à
 *  DrawLevelUpWindowPg1/2 par Cmd_drawlvlupbox : bgClr = TEXT_DYNAMIC_COLOR_5
 *  (0xE), fgClr = TEXT_DYNAMIC_COLOR_4 (0xD), shadowClr = TEXT_DYNAMIC_COLOR_6
 *  (0xF). (Le menu d'équipe, lui, passe WHITE/DARK_GRAY/LIGHT_GRAY.) Les
 *  fonctions Draw* sont PARTAGÉES (game/menu_specialized) — couleurs en args. */
const LVLUP_BG_CLR = 0xe;
const LVLUP_FG_CLR = 0xd;
const LVLUP_SHADOW_CLR = 0xf;

// ─── Stats extraction ──────────────────────────────────────────────────────

/** 1:1 décomp `GetMonLevelUpWindowStats(mon, currStats)` (menu_specialized.c:1628).
 *  Retourne les stats STAT_-indexées : [HP, ATK, DEF, SPEED, SPATK, SPDEF].
 *  Wrapper ergonomique autour de la fonction PARTAGÉE (game/menu_specialized) —
 *  c'est elle (et DrawLevelUpWindowPg1/Pg2) qui était DUPLIQUÉE ici avant. */
export function lvlUpBoxStatsOf(mon: LevelUpStatMon): number[] {
  const s = new Array<number>(NUM_STATS).fill(0);
  GetMonLevelUpWindowStats(mon, s);
  return s;
}

// ─── DrawLevelUpWindowPg1 / Pg2 : voir game/menu_specialized (fonctions PARTAGÉES,
//     1:1 menu_specialized.c:1523-1626, importées en tête). ───────────────────

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

/** Ouvre la box + dessine la page 1 (deltas). `before`/`after` = stats
 *  STAT_-indexées (cf. lvlUpBoxStatsOf). 1:1 décomp case 3+4 (HandleBattleWindow
 *  cadre + DrawLevelUpWindow1 + CopyWindowToVram) + ShowBg(1). */
export function lvlUpBoxOpenPage1(before: number[], after: number[]): void {
  if (_lvlUpBoxWinId >= 0) lvlUpBoxClose();
  const tpl = sStandardBattleWindowTemplates[B_WIN_LEVEL_UP_BOX];
  _lvlUpBoxWinId = AddWindow(tpl);
  // 1:1 décomp case 3 : dessine le cadre AVANT le texte (PutWindowTilemap écrase
  // ensuite l'intérieur avec les tuiles de texte de la fenêtre).
  // 1:1 décomp Cmd_drawlvlupbox : HandleBattleWindow(18, 7, 29, 19, WINDOW_BG1).
  HandleBattleWindow(LVLUP_FRAME_X1, LVLUP_FRAME_Y1, LVLUP_FRAME_X2, LVLUP_FRAME_Y2, WINDOW_BG1);
  PutWindowTilemap(_lvlUpBoxWinId);
  DrawLevelUpWindowPg1(_lvlUpBoxWinId, before, after, LVLUP_BG_CLR, LVLUP_FG_CLR, LVLUP_SHADOW_CLR);
  CopyWindowToVram(_lvlUpBoxWinId, 3 /* COPYWIN_FULL */);
  _showLevelUpBg();
}

/** Re-dessine la page 2 (totaux). 1:1 décomp case 6 (DrawLevelUpWindow2 + CopyWindowToVram). */
export function lvlUpBoxDrawPage2(after: number[]): void {
  if (_lvlUpBoxWinId < 0) return;
  DrawLevelUpWindowPg2(_lvlUpBoxWinId, after, LVLUP_BG_CLR, LVLUP_FG_CLR, LVLUP_SHADOW_CLR);
  CopyWindowToVram(_lvlUpBoxWinId, 3 /* COPYWIN_FULL */);
}

/** Ferme la box (clear + remove). 1:1 décomp case 8/9 (HandleBattleWindow CLEAR
 *  + ClearWindowTilemap + CopyWindowToVram). */
export function lvlUpBoxClose(): void {
  if (_lvlUpBoxWinId < 0) return;
  FillWindowPixelBuffer(_lvlUpBoxWinId, 0);
  ClearWindowTilemap(_lvlUpBoxWinId);
  CopyWindowToVram(_lvlUpBoxWinId, 3 /* COPYWIN_FULL */);
  // 1:1 décomp case 8 : HandleBattleWindow(18, 7, 29, 19, WINDOW_BG1 | WINDOW_CLEAR).
  HandleBattleWindow(LVLUP_FRAME_X1, LVLUP_FRAME_Y1, LVLUP_FRAME_X2, LVLUP_FRAME_Y2, WINDOW_BG1 | WINDOW_CLEAR);
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
