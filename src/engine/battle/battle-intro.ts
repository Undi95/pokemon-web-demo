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

import { getRuntime, gScanlineEffectRegBuffers, LoadPalette } from '../system/decomp-globals';
import {
  REG_OFFSET_WIN0H, REG_OFFSET_WIN0V, REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON,
} from '../system/decomp-runtime';
import { battleVBlankState } from './battle-vblank-helpers';
import {
  drawBattleEntryBackground, hideBattleEntryBackground, BATTLE_ENVIRONMENT_LONG_GRASS,
  getMenuBackdropRgb15,
} from './battle-bg';

// 1:1 strict A8 audit : import depuis decomp-data.
import { DISPLAY_WIDTH, DISPLAY_HEIGHT } from '../decomp-data/include/gba/defines-data';

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

// ─────────────────────────────────────────────────────────────────────────────
// VOIE L — BattleIntroSlide1 1:1 COMPLET (l'animation d'ENTRÉE de scène).
//
// Diffère de la voie V ci-dessus (qui ne fait que WIN0V via SetGpuReg direct) :
// en voie L, `VBlankCB_Battle` applique `battleVBlankState.{bg1_x,bg1_y,win0v}` aux
// registres CHAQUE frame → la slide DOIT muter battleVBlankState (un SetGpuReg
// direct serait écrasé). Tickée par `BattleMainCB2` → `tickBattleIntroSlideL`.
//
// Régression-safe : TOUT (entry bg visible + DISPCNT_WIN0_ON + slit clip) est gaté
// sur `startBattleIntroSlideL`. Si la slide ne démarre jamais (controller pas
// atteint), WIN0 reste OFF + pas d'entry bg → le combat s'affiche normalement.
//
// 1:1 décomp `BattleIntroSlide1` (battle_intro.c:154-237) :
//   - l.158 : gBattle_BG1_X += 6/frame (scroll horizontal du fond strié)
//   - case 1 : WININ = contenu visible DANS win0
//   - case 2 : WIN0V -= 0xFF (bandes s'ouvrent lentement, top 80→48)
//   - case 3 : WIN0V -= 0x3FC (bandes vite) + BG1_Y scroll terrain (après 32f) +
//     stries scanline BG3HOFS (data2 240→0, top +data2 / bottom -data2)
//   - case 3 fin (data2==0) : cache le fond d'entrée + stop scanline
//   - case 4 : BattleIntroSlideEnd (reset offsets + WININ/WINOUT tout visible)
// ─────────────────────────────────────────────────────────────────────────────

interface IntroSlideLState {
  /** 1:1 `gTasks[taskId].tState` (0..4). */
  state: number;
  /** 1:1 `data[2]` : délai (state 0-1) puis largeur des stries (state 3, 240→0). */
  data2: number;
  /** 1:1 `data[3]` : délai 32f avant le scroll terrain (state 3). */
  data3: number;
  /** 1:1 `tEnvironment` (= choix LONG_GRASS vs autre pour la vitesse BG1_Y). */
  environment: number;
  /** Gate frame (= 1 step/frame visuelle, décomp = 1 step/frame Task). */
  lastFrame: number;
}
let _introSlideL: IntroSlideLState | null = null;
let _introScanlineHblank = false;

/** Installe l'HBlank des stries d'intro : shift BG3HOFS par-scanline depuis
 *  `gScanlineEffectRegBuffers[0]` (top = +data2, bottom = -data2). 1:1 décomp
 *  `ScanlineEffect_SetParams(sIntroScanlineParams16Bit)` (battle_main.c:250) →
 *  `&REG_BG3HOFS`. Même technique HBlank que le Slice de transition. */
function _startIntroScanline(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.setHBlankCallback((y: number) => {
    if (y < DISPLAY_HEIGHT) {
      const v = gScanlineEffectRegBuffers[0][y] & 0xFFFF;
      rt.gba.bg(3).config.hofs = (v << 16) >> 16;  // sign-extend s16 (-240 = 0xFF10)
    }
  });
  _introScanlineHblank = true;
}

function _stopIntroScanline(): void {
  const rt = getRuntime();
  if (rt && _introScanlineHblank) {
    rt.gba.setHBlankCallback(null);
    rt.gba.bg(3).config.hofs = 0;
  }
  _introScanlineHblank = false;
}

/** 1:1 décomp `HandleIntroSlide(terrainId)` (battle_intro.c:105) →
 *  `CreateTask(BattleIntroSlide1)`. Voie L : démarre la slide d'entrée.
 *  Charge le fond strié (BG1), montre-le, active WIN0 (le slit
 *  `battleVBlankState.win0v` est déjà posé par CB2_InitBattleInternal), installe
 *  l'HBlank des stries. La slide est ensuite tickée par BattleMainCB2. */
export function startBattleIntroSlideL(environment: number): void {
  const rt = getRuntime();
  if (!rt) return;
  _introSlideL = { state: 0, data2: 0, data3: 0, environment, lastFrame: -1 };
  // ⚠️ Fond strié d'entrée (BG1) DÉSACTIVÉ temporairement : ses tiles se rendaient
  // en BARRES NOIRES (palette mal alignée — l'anim_tiles partage les banks palette
  // du terrain (bank 4) mais l'index local 4bpp décodé ne matche pas la sous-palette
  // → couleurs fausses, A/B user « les barres ont pas la bonne palette »). Baseline
  // propre = bandes noires qui s'ouvrent sur le terrain. À reprendre : aligner la
  // palette de l'entry bg (decode anim_tiles selon la sous-palette du tilemap).
  // void drawBattleEntryBackground(environment);
  rt.gba.bg(1).config.visible = false;  // BG1 ne montre rien (pas d'entry bg)
  void drawBattleEntryBackground;       // garde l'import référencé
  // Backdrop NOIR pendant les bandes (A/B ROM user : hors-bandes = NOIR, PAS le
  // #484050 violacé du menu). Restauré pour le menu en fin de slide (case 4).
  // loadBattleTextbox a déjà tourné (CB2_InitBattle) → #484050 stocké via
  // getMenuBackdropRgb15. Régression-safe : si la slide n'aboutit pas, #484050
  // n'est jamais écrasé (loadBattleTextbox l'a posé).
  // sizeBytes = 2 (= 1 couleur RGB15 = palette[0]). count=1 = 0 couleur = no-op (bug).
  LoadPalette(new Uint16Array([0]), 0, 2);
  // Active WIN0 → le slit (battleVBlankState.win0v = WIN_RANGE(80,81)) clippe
  // l'écran (≈ noir sauf 1px) jusqu'à ce que les bandes s'ouvrent. WININ=0 (rien
  // dans le slit) jusqu'au case 1.
  rt.SetGpuReg(REG_OFFSET_WININ, 0);
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) | DISPCNT_WIN0_ON);
  // ⚠️ Stries scanline (shift BG3HOFS par-scanline) DÉSACTIVÉES : le rendu était
  // chaotique (le shift révélait des tiles garbage du tilemap terrain → barres
  // noires + flèches, A/B user). L'effet « fond à lignes » vient déjà du fond strié
  // BG1 lui-même qui scrolle. `_startIntroScanline` reste dispo pour re-travail 1:1.
  // _startIntroScanline();
}

/** Devtools : check si la slide d'intro voie-L est active. */
export function isBattleIntroSlideLActive(): boolean { return _introSlideL !== null; }

/** 1:1 décomp `BattleIntroSlide1` (battle_intro.c:154-237). Tickée chaque frame
 *  par BattleMainCB2 (no-op si pas de slide active). Met à jour battleVBlankState
 *  (appliqué aux registres par VBlankCB_Battle). */
export function tickBattleIntroSlideL(): void {
  if (!_introSlideL) return;
  const t = _introSlideL;
  // Gate 1 step/frame (BattleMainCB2 = 1×/frame, mais gate par sécurité si polled +).
  const fc = Math.floor(performance.now() / 16);
  if (fc === t.lastFrame) return;
  t.lastFrame = fc;
  const rt = getRuntime();

  // 1:1 l.158 : gBattle_BG1_X += 6 (scroll horizontal du fond strié, CHAQUE frame).
  battleVBlankState.bg1_x = (battleVBlankState.bg1_x + 6) & 0xFFFF;

  switch (t.state) {
    case 0:
      // 1:1 l.167-171 : wild → data[2] = 1, state++.
      t.data2 = 1;
      t.state++;
      break;
    case 1:
      // 1:1 l.173-178 : --data2 == 0 → state++, WININ = contenu visible DANS win0.
      if (--t.data2 === 0) {
        t.state++;
        rt?.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL);  // 0x3F
      }
      break;
    case 2:
      // 1:1 l.181-188 : WIN0V -= 0xFF (bandes lentes) jusqu'à (WIN0V & 0xFF00)==0x3000.
      battleVBlankState.win0v = (battleVBlankState.win0v - 0xFF) & 0xFFFF;
      if ((battleVBlankState.win0v & 0xFF00) === 0x3000) {
        t.state++;
        t.data2 = DISPLAY_WIDTH;  // 240
        t.data3 = 32;
      }
      break;
    case 3:
      // 1:1 l.191-207 : scroll terrain (BG1_Y) après un délai de 32 frames.
      if (t.data3) {
        t.data3--;
      } else if (t.environment === BATTLE_ENVIRONMENT_LONG_GRASS) {
        if (battleVBlankState.bg1_y !== ((-80) & 0xFFFF)) battleVBlankState.bg1_y = (battleVBlankState.bg1_y - 2) & 0xFFFF;
      } else {
        if (battleVBlankState.bg1_y !== ((-56) & 0xFFFF)) battleVBlankState.bg1_y = (battleVBlankState.bg1_y - 1) & 0xFFFF;
      }
      // 1:1 l.209-210 : bandes rapides.
      if (battleVBlankState.win0v & 0xFF00) {
        battleVBlankState.win0v = (battleVBlankState.win0v - 0x3FC) & 0xFFFF;
      }
      // 1:1 l.212-213 : largeur des stries data2 -= 2.
      if (t.data2) t.data2 -= 2;
      // 1:1 l.216-220 : remplit le buffer scanline (top = data2, bottom = -data2)
      // → lu par l'HBlank pour shifter BG3HOFS (stries qui se referment).
      for (let i = 0; i < DISPLAY_HEIGHT / 2; i++) gScanlineEffectRegBuffers[0][i] = t.data2 & 0xFFFF;
      for (let i = DISPLAY_HEIGHT / 2; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[0][i] = (-t.data2) & 0xFFFF;
      // 1:1 l.222-231 : data2 == 0 → fin du scroll, cache le fond d'entrée + stop stries.
      if (t.data2 === 0) {
        t.state++;
        hideBattleEntryBackground();
        _stopIntroScanline();
      }
      break;
    case 4:
    default:
      // 1:1 `BattleIntroSlideEnd` (l.140-152) : reset BG offsets + WININ/WINOUT tout
      // visible partout (= plus de clipping window) + win0v plein écran.
      battleVBlankState.bg1_x = 0;
      battleVBlankState.bg1_y = 0;
      battleVBlankState.bg2_x = 0;
      battleVBlankState.bg2_y = 0;
      if (rt) {
        rt.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL | (WININ_WIN0_ALL << 8));
        rt.SetGpuReg(REG_OFFSET_WINOUT, 0x3F | (0x3F << 8));
      }
      battleVBlankState.win0v = WIN_RANGE(0, DISPLAY_HEIGHT);
      // Restaure le backdrop du MENU (#484050) — les bandes étaient noires pendant
      // la slide. (1:1 BattleIntroSlideEnd ne touche pas la palette ; c'est notre
      // gestion du backdrop intro≠menu.) sizeBytes=2 = 1 couleur.
      LoadPalette(new Uint16Array([getMenuBackdropRgb15()]), 0, 2);
      _introSlideL = null;
      break;
  }
}
