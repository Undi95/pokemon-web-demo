/**
 * battle-intro.ts — Port 1:1 décomp `src/battle_intro.c` `BattleIntroSlide1`
 * (= l'ouverture du battle screen : la fente noire centrale s'ouvre
 * verticalement du centre vers haut+bas, "ouvre la map en deux").
 *
 * C'est l'effet visuel EXACT que le vrai jeu fait après le Slice transition :
 * l'écran est noir, une fente horizontale 1px au centre montre le battle
 * screen, puis cette fente s'ouvre symétriquement (haut monte, bas descend)
 * jusqu'à révéler tout le battle screen. PAS un fade palette.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:619-660`
 *     `CB2_InitBattleInternal` : setup WIN0H=240, WIN0V=WIN_RANGE(80,81),
 *     WININ=0, WINOUT=0, DISPCNT|=WIN0_ON.
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_intro.c:140-237`
 *     `BattleIntroSlide1` + `BattleIntroSlideEnd`.
 *
 * Mécanisme `gBattle_WIN0V` = `WIN_RANGE(top, bottom)` = `(top << 8) | bottom`.
 *   - Init  : WIN_RANGE(80, 81) = 0x5051 (fente 1px à la ligne 80, centre).
 *   - state 1 : SetGpuReg(WININ, 0x3F) = contenu visible DANS la fente.
 *   - state 2 : `gBattle_WIN0V -= 0xFF` /frame (= top-1, bottom+1 : ouverture
 *     symétrique lente) jusqu'à `(WIN0V & 0xFF00) == 0x3000` (top == 48).
 *   - state 3 : `gBattle_WIN0V -= 0x3FC` /frame (= top-4, bottom+4 : ouverture
 *     rapide) jusqu'à `(WIN0V & 0xFF00) == 0` (top == 0 → plein écran).
 *   - state 4 : `BattleIntroSlideEnd` : WININ/WINOUT = tout visible partout
 *     (= window plus de clipping, battle screen complet).
 *
 * NOTE port : le décomp applique `gBattle_WIN0V` → `REG_WIN0V` via le VBlank
 * callback du battle (`VBlankCB_Battle`). Notre port applique directement
 * `SetGpuReg(REG_OFFSET_WIN0V, win0v)` chaque tick (= équivalent : 1 maj/frame).
 * Le scroll latéral des bandes (state 3 scanline `data[2]`) + le scroll
 * `gBattle_BG1_Y` du terrain sont des détails secondaires de l'effet ; le
 * coeur (= l'ouverture verticale de la fente) est porté 1:1 ici.
 *
 * Gate frame via `performance.now()/16` (= 1 step/frame visuelle, décomp = 1
 * step/frame Task) car ce tick est polled ~5-6×/frame par le battle-flow.
 */

import { getRuntime } from './decomp-globals';
import {
  REG_OFFSET_WIN0H, REG_OFFSET_WIN0V, REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON,
} from './decomp-runtime';

const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

// 1:1 décomp `WIN_RANGE(a, b)` (io_reg.h:584) = `(a << 8) | b`.
function WIN_RANGE(a: number, b: number): number { return ((a & 0xFF) << 8) | (b & 0xFF); }

// 1:1 décomp io_reg.h:554-556 : WININ_WIN0_BG_ALL(0x0F) | WININ_WIN0_OBJ(0x10)
// | WININ_WIN0_CLR(0x20) = 0x3F (= tout visible DANS win0).
const WININ_WIN0_ALL = 0x0F | 0x10 | 0x20;  // 0x3F

interface IntroSlideState {
  /** 1:1 décomp `gTasks[taskId].tState` (0..4). */
  state: number;
  /** 1:1 décomp `gBattle_WIN0V` = (top << 8) | bottom. */
  win0v: number;
  /** 1:1 décomp `data[2]` (= compteur délai state 0→1, wild = 1). */
  data2: number;
  /** Gate frame. */
  lastFrame: number;
}
let _introSlide: IntroSlideState | null = null;

/** 1:1 décomp `CB2_InitBattleInternal` ll. 629-634 + DISPCNT WIN0_ON :
 *  setup la fenêtre WIN0 = fente 1px au centre, tout masqué (WININ=0/WINOUT=0).
 *
 *  À appeler AVANT que le battle screen soit visible (= équivalent au moment
 *  où le décomp le fait dans CB2_InitBattleInternal, juste après le VRAM clear,
 *  avant load assets). L'écran reste noir géométriquement (fente 1px) jusqu'à
 *  ce que `startBattleIntroSlide` + `tickBattleIntroSlide` ouvrent la fente. */
export function setupBattleWindowForIntro(): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp ll. 629-632.
  rt.SetGpuReg(REG_OFFSET_WIN0H, DISPLAY_WIDTH);                       // = 240 (pleine largeur)
  rt.SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(DISPLAY_HEIGHT / 2, DISPLAY_HEIGHT / 2 + 1)); // = WIN_RANGE(80,81)
  rt.SetGpuReg(REG_OFFSET_WININ, 0);                                  // rien visible DANS la fente
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0);                                 // rien visible HORS la fente
  // 1:1 décomp `InitBattleBgsVideo` : DISPCNT |= DISPCNT_WIN0_ON (= active WIN0).
  const disp = rt.GetGpuReg(REG_OFFSET_DISPCNT);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, disp | DISPCNT_WIN0_ON);
}

/** 1:1 décomp init `BattleIntroSlide1` state machine (battle_intro.c:154-237).
 *  À appeler une fois le battle screen chargé (sprites + BG + palettes). */
export function startBattleIntroSlide(): void {
  _introSlide = {
    state: 0,
    win0v: WIN_RANGE(DISPLAY_HEIGHT / 2, DISPLAY_HEIGHT / 2 + 1),  // = gBattle_WIN0V init = 0x5051
    data2: 0,
    lastFrame: -1,
  };
}

/** 1:1 décomp `BattleIntroSlide1` (battle_intro.c:154-237) state machine.
 *  Retourne true quand l'ouverture est terminée (= `BattleIntroSlideEnd`). */
export function tickBattleIntroSlide(): boolean {
  if (!_introSlide) return true;
  const rt = getRuntime();
  if (!rt) return true;
  const t = _introSlide;

  // Gate : 1 step par frame visuelle (décomp = 1 step/frame Task).
  const fc = Math.floor(performance.now() / 16);
  if (fc === t.lastFrame) return false;
  t.lastFrame = fc;

  switch (t.state) {
    case 0:
      // 1:1 décomp ll. 161-172 : wild battle → data[2] = 1, state++.
      t.data2 = 1;
      t.state++;
      return false;

    case 1:
      // 1:1 décomp ll. 173-179 : --data[2] == 0 → state++,
      //   SetGpuReg(WININ, WININ_WIN0_BG_ALL|OBJ|CLR) = contenu visible dans la fente.
      if (--t.data2 === 0) {
        t.state++;
        rt.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL);  // 0x3F
      }
      return false;

    case 2:
      // 1:1 décomp ll. 180-189 : gBattle_WIN0V -= 0xFF (top-1, bottom+1 :
      // ouverture symétrique lente) jusqu'à (WIN0V & 0xFF00) == 0x3000.
      t.win0v = (t.win0v - 0xFF) & 0xFFFF;
      rt.SetGpuReg(REG_OFFSET_WIN0V, t.win0v);
      if ((t.win0v & 0xFF00) === 0x3000) {
        t.state++;
      }
      return false;

    case 3:
      // 1:1 décomp ll. 190-232 : gBattle_WIN0V -= 0x3FC (top-4, bottom+4 :
      // ouverture rapide) tant que (WIN0V & 0xFF00) != 0. Quand top == 0 →
      // state 4. (Scanline scroll bandes + BG1_Y scroll = détails secondaires
      // non portés ; le coeur = l'ouverture verticale.)
      if (t.win0v & 0xFF00) {
        t.win0v = (t.win0v - 0x3FC) & 0xFFFF;
        rt.SetGpuReg(REG_OFFSET_WIN0V, t.win0v);
      }
      if ((t.win0v & 0xFF00) === 0) {
        t.state++;
      }
      return false;

    case 4:
    default:
      // 1:1 décomp `BattleIntroSlideEnd` (battle_intro.c:140-152) :
      // WININ/WINOUT = tout visible partout (= plus de clipping window) +
      // DISPCNT garde WIN0_ON mais window pleine = aucun effet de masque.
      rt.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL | (WININ_WIN0_ALL << 8));   // win0 + win1 all
      rt.SetGpuReg(REG_OFFSET_WINOUT, 0x3F | (0x3F << 8));                       // winout + winobj all
      // Fenêtre pleine (top=0 bottom=160) = battle screen complet visible.
      rt.SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(0, DISPLAY_HEIGHT));
      _introSlide = null;
      return true;
  }
}

/** Devtools / debug : check si l'ouverture intro est active. */
export function isBattleIntroSlideActive(): boolean {
  return _introSlide !== null;
}

/** Reset window à plein écran (= safety si on bypass l'intro slide, p.ex.
 *  cleanup). Évite de laisser la fente WIN0 active au retour overworld. */
export function resetBattleIntroWindow(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(0, DISPLAY_HEIGHT));
  rt.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL | (WININ_WIN0_ALL << 8));
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0x3F | (0x3F << 8));
  // Désactive WIN0 (= overworld n'utilise pas WIN0 → DISPCNT sans WIN0_ON).
  const disp = rt.GetGpuReg(REG_OFFSET_DISPCNT);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, disp & ~DISPCNT_WIN0_ON);
  _introSlide = null;
}
