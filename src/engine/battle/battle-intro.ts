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
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  BLDCNT_TGT1_BG1, BLDCNT_EFFECT_BLEND, BLDCNT_TGT2_BG3, BLDCNT_TGT2_OBJ,
} from '../system/decomp-runtime';
import { battleVBlankState } from './battle-vblank-helpers';
import {
  drawBattleEntryBackground, hideBattleEntryBackground,
  BATTLE_ENVIRONMENT_LONG_GRASS, BATTLE_ENVIRONMENT_SAND, BATTLE_ENVIRONMENT_UNDERWATER,
  BATTLE_ENVIRONMENT_WATER, BATTLE_ENVIRONMENT_BUILDING, BATTLE_ENVIRONMENT_PLAIN,
  getMenuBackdropRgb15,
} from './battle-bg';

/** 1:1 `BLDALPHA_BLEND(eva, evb)` (io_reg.h) = eva | (evb << 8). */
function BLDALPHA_BLEND(eva: number, evb: number): number { return (eva & 0x1F) | ((evb & 0x1F) << 8); }

/** 1:1 `Cos2(angle)` approx pour le bob WATER de Slide2 (battle_intro.c:256). L'exact
 *  utilise gSineTable (amplitude ~256) ; Math.cos×256 en est l'équivalent à <1px près
 *  (bob de l'eau, env WATER non bootable via dev key → raffinement A/B). */
function _Cos2(angleDeg: number): number { return Math.round(Math.cos(angleDeg * Math.PI / 180) * 256); }

/** 1:1 `sBattleIntroSlideFuncs[]` (battle_intro.c:25-37) : env → slide func 1/2/3. */
function _slideFuncForEnv(env: number): 1 | 2 | 3 {
  if (env === BATTLE_ENVIRONMENT_SAND || env === BATTLE_ENVIRONMENT_UNDERWATER || env === BATTLE_ENVIRONMENT_WATER) return 2;
  if (env === BATTLE_ENVIRONMENT_BUILDING || env === BATTLE_ENVIRONMENT_PLAIN) return 3;
  return 1; // GRASS, LONG_GRASS, POND, MOUNTAIN, CAVE
}

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
  /** 1:1 `data[3]` : délai 32f avant scroll terrain (Slide1) / avant blend (Slide2/3). */
  data3: number;
  /** 1:1 `data[4]` : Slide2/3 = coefficient BLDALPHA (eva) appliqué chaque frame. */
  data4: number;
  /** 1:1 `data[5]` : Slide2/3 = compteur de délai du ramp blend. */
  data5: number;
  /** 1:1 `data[6]` : Slide2 WATER = angle du bob (Cos2). */
  data6: number;
  /** 1:1 `tEnvironment`. */
  environment: number;
  /** 1=BattleIntroSlide1 (grass/long_grass/pond/mountain/cave), 2=Slide2 (sand/water/
   *  underwater), 3=Slide3 (building/plain). 1:1 `sBattleIntroSlideFuncs` (battle_intro.c:25). */
  slideFunc: 1 | 2 | 3;
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
  _introSlideL = {
    state: 0, data2: 0, data3: 0, data4: 0, data5: 0, data6: 0,
    environment, slideFunc: _slideFuncForEnv(environment), lastFrame: -1,
  };
  // 1:1 décomp `DrawBattleEntryBackground` (battle_bg.c:1124) : charge le fond d'entrée
  // (brins d'herbe pour GRASS / strié pour PLAIN-building) dans BG1. Data VÉRIFIÉE 1:1
  // (chantier transitions 2026-06-04, inspection byte-level) : anim_tiles.png PLTE = la
  // palette terrain COMPLÈTE, le tilemap réfère bank 4 (= sous-pal 2, verts 0x3b2f/0x4b74/
  // 0x1e8a), le compositor applique le bank par-tile + gère screenSize=2. Le décodeur
  // produit les bons nibbles 0-3. (L'ancien « barres noires/mauvaise palette » = mauvais
  // diagnostic.) drawBattleEntryBackground (async) rend BG1 visible ; caché en fin de slide.
  void drawBattleEntryBackground(environment);
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
  // Stries scanline 1:1 (`sIntroScanlineParams16Bit` → `&REG_BG3HOFS`, battle_main.c:252) :
  // shift le TERRAIN (BG3) par-scanline (haut +data2 / bas -data2, data2 240→0 en case 3)
  // = le shear « les deux moitiés du décor se rejoignent ». BG3 = 512px de large (map.bin
  // = 64×32, rempli) → le compositor lit des tiles VALIDES (screenSize=1, 2 blocks H).
  // L'ancien « garbage/barres noires » était un mauvais diagnostic (terrain bien rempli).
  _startIntroScanline();
}

/** Devtools : check si la slide d'intro voie-L est active. */
export function isBattleIntroSlideLActive(): boolean { return _introSlideL !== null; }

/** 1:1 décomp `BattleIntroSlide1/2/3` (battle_intro.c:154-437) selon l'env
 *  (`sBattleIntroSlideFuncs`). Tickée chaque frame par BattleMainCB2. Met à jour
 *  battleVBlankState (appliqué aux registres par VBlankCB_Battle).
 *   - Slide1 (grass/long_grass/pond/mountain/cave) : BG1_X+=6, scroll terrain BG1_Y, scanline.
 *   - Slide2 (sand/water/underwater) : BG1_X+=8/6, bob WATER (Cos2), blend BG1↔BG3 (15→0), scanline.
 *   - Slide3 (building/PLAIN) : BG1_X+=8, blend BG1↔BG3 (cross-fade 8/8→0/16), scanline.
 *  Les 3 partagent les bandes WIN0V (case 1-3) + la fin (case 4 = BattleIntroSlideEnd). */
export function tickBattleIntroSlideL(): void {
  if (!_introSlideL) return;
  const t = _introSlideL;
  // Gate 1 step/frame (BattleMainCB2 = 1×/frame, mais gate par sécurité si polled +).
  const fc = Math.floor(performance.now() / 16);
  if (fc === t.lastFrame) return;
  t.lastFrame = fc;
  const rt = getRuntime();

  // ─── Header (avant le switch) : scroll BG1_X par slide + bob WATER (Slide2). ───
  if (t.slideFunc === 1) {
    battleVBlankState.bg1_x = (battleVBlankState.bg1_x + 6) & 0xFFFF;        // 1:1 Slide1 l.158
  } else if (t.slideFunc === 2) {
    // 1:1 Slide2 l.243-264 : BG1_X += 8 (SAND/WATER) / += 6 (UNDERWATER).
    battleVBlankState.bg1_x = (battleVBlankState.bg1_x + (t.environment === BATTLE_ENVIRONMENT_UNDERWATER ? 6 : 8)) & 0xFFFF;
    if (t.environment === BATTLE_ENVIRONMENT_WATER) {
      // 1:1 l.256-263 : bob vertical Cos2(data6)/512 - 8.
      battleVBlankState.bg1_y = (((_Cos2(t.data6) / 512 - 8) | 0)) & 0xFFFF;
      t.data6 += (t.data6 < 180) ? 4 : 6;
      if (t.data6 === 360) t.data6 = 0;
    }
  } else {
    battleVBlankState.bg1_x = (battleVBlankState.bg1_x + 8) & 0xFFFF;        // 1:1 Slide3 l.355
  }

  switch (t.state) {
    case 0:
      if (t.slideFunc === 3) {
        // 1:1 Slide3 l.359-362 : setup blend BG1↔BG3 50% (BLDALPHA(8,8)).
        rt?.SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);
        rt?.SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(8, 8));
        rt?.SetGpuReg(REG_OFFSET_BLDY, 0);
        t.data4 = BLDALPHA_BLEND(8, 8);  // 0x0808
      } else if (t.slideFunc === 2) {
        t.data4 = 16;                    // 1:1 Slide2 l.269
      }
      t.data2 = 1;                       // wild (non-link) → délai 1
      t.state++;
      break;
    case 1:
      if (--t.data2 === 0) {
        t.state++;
        rt?.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL);  // contenu visible DANS win0
      }
      break;
    case 2:
      battleVBlankState.win0v = (battleVBlankState.win0v - 0xFF) & 0xFFFF;  // bandes lentes
      if ((battleVBlankState.win0v & 0xFF00) === 0x3000) {
        t.state++;
        t.data2 = DISPLAY_WIDTH;  // 240 (largeur des stries)
        t.data3 = 32;
        t.data5 = 1;
      }
      break;
    case 3:
      if (t.slideFunc === 1) {
        // 1:1 Slide1 l.191-207 : scroll terrain (BG1_Y) après délai 32f.
        if (t.data3) t.data3--;
        else if (t.environment === BATTLE_ENVIRONMENT_LONG_GRASS) {
          if (battleVBlankState.bg1_y !== ((-80) & 0xFFFF)) battleVBlankState.bg1_y = (battleVBlankState.bg1_y - 2) & 0xFFFF;
        } else {
          if (battleVBlankState.bg1_y !== ((-56) & 0xFFFF)) battleVBlankState.bg1_y = (battleVBlankState.bg1_y - 1) & 0xFFFF;
        }
      } else if (t.slideFunc === 2) {
        // 1:1 Slide2 l.300-316 : après délai 32f, ramp blend (data4 & 0x1F décrémente / 4f).
        if (t.data3) {
          if (--t.data3 === 0) {
            rt?.SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);
            rt?.SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(15, 0));
            rt?.SetGpuReg(REG_OFFSET_BLDY, 0);
          }
        } else if ((t.data4 & 0x1F) && --t.data5 === 0) {
          t.data4 = (t.data4 + 0xFF) & 0xFFFF;  // eva--, evb++ (cross-fade BG1→BG3)
          t.data5 = 4;
        }
      } else {
        // 1:1 Slide3 l.393-404 : après délai 32f, ramp blend (data4 & 0xF décrémente / 6f).
        if (t.data3) t.data3--;
        else if ((t.data4 & 0xF) && --t.data5 === 0) {
          t.data4 = (t.data4 + 0xFF) & 0xFFFF;  // eva 8→0, evb 8→16 (cross-fade BG1→BG3)
          t.data5 = 6;
        }
      }
      // 1:1 (tous) : bandes rapides + largeur stries data2 -= 2 + buffer scanline (BG3HOFS).
      if (battleVBlankState.win0v & 0xFF00) battleVBlankState.win0v = (battleVBlankState.win0v - 0x3FC) & 0xFFFF;
      if (t.data2) t.data2 -= 2;
      for (let i = 0; i < DISPLAY_HEIGHT / 2; i++) gScanlineEffectRegBuffers[0][i] = t.data2 & 0xFFFF;
      for (let i = DISPLAY_HEIGHT / 2; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[0][i] = (-t.data2) & 0xFFFF;
      if (t.data2 === 0) {
        t.state++;
        hideBattleEntryBackground();
        _stopIntroScanline();
      }
      break;
    case 4:
    default:
      // 1:1 `BattleIntroSlideEnd` (l.140-152) : reset offsets + BLD* + WININ/WINOUT all + win0v plein.
      battleVBlankState.bg1_x = 0; battleVBlankState.bg1_y = 0;
      battleVBlankState.bg2_x = 0; battleVBlankState.bg2_y = 0;
      if (rt) {
        rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);   // 1:1 l.147 (sinon le combat hérite du blend)
        rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0); // 1:1 l.148
        rt.SetGpuReg(REG_OFFSET_BLDY, 0);     // 1:1 l.149
        rt.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL | (WININ_WIN0_ALL << 8));
        rt.SetGpuReg(REG_OFFSET_WINOUT, 0x3F | (0x3F << 8));
      }
      battleVBlankState.win0v = WIN_RANGE(0, DISPLAY_HEIGHT);
      // Restaure le backdrop du MENU (#484050) — bandes noires pendant la slide.
      LoadPalette(new Uint16Array([getMenuBackdropRgb15()]), 0, 2);
      _introSlideL = null;
      return;  // case 4 ne ré-applique pas le BLDALPHA ci-dessous
  }

  // 1:1 Slide2/3 l.347-348 / 435-436 : `if (tState != 4) SetGpuReg(BLDALPHA, BLDALPHA_BLEND(data4, 0))`.
  // = REG_BLDALPHA = data4 brut (eva=low byte, evb=high byte → le cross-fade du ramp). Slide1 = pas de blend.
  if (t.slideFunc !== 1) rt?.SetGpuReg(REG_OFFSET_BLDALPHA, t.data4 & 0xFFFF);
}
