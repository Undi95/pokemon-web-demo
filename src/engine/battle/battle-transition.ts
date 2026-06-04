/**
 * battle-transition.ts — Port 1:1 décomp `battle_transition.c`.
 *
 * Premier transition portée : `B_TRANSITION_SLICE` (= transition wild standard
 * `sBattleTransitionTable_Wild[TRANSITION_TYPE_NORMAL][0]`). L'écran se découpe
 * en bandes horizontales alternées qui glissent l'une à gauche, l'autre à droite
 * avec une accélération exponentielle, jusqu'à totalement disparaître.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_transition.c:2716-2830` Task_Slice
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_transition.c:4050-4061` InitTransitionData
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_setup.c:114-120` sBattleTransitionTable_Wild
 *
 * Architecture port :
 *   - `startBattleTransitionSlice()` = `Slice_Init` (= setup state + hblank cb)
 *   - `tickBattleTransitionSlice()` = `Slice_Main` per frame, retourne true quand done
 *   - `stopBattleTransition()` = cleanup hblank + reset BG offsets
 *
 * Le port utilise `rt.gba.setHBlankCallback` qui est invoqué pour chaque
 * scanline 0..159 avant le rendu. Notre callback met à jour les BG offsets
 * de BG1/BG2/BG3 (= overworld layers) en lisant `gScanlineEffectRegBuffers[1]`.
 *
 * Les buffers `[0]` et `[1]` sont double-bufferés 1:1 décomp : `Slice_Main`
 * écrit dans `[0]`, `VBlankCB_Slice` copy `[0]` → `[1]` avant que la frame
 * soit rendue (= équivalent au DmaCopy16). Notre port copie sync à la fin
 * de `tickBattleTransitionSlice` puisque pas de DMA timing.
 */

import { gScanlineEffectRegBuffers, ScanlineEffect_Clear, ScanlineEffect_Stop } from '../system/decomp-globals';
import { getRuntime, BlendPalettes, PALETTES_ALL } from '../system/decomp-globals';
// Registres fenêtre WIN0 : le Slice clippe BG **et OBJ** via WIN0 (WININ/WINOUT +
// WIN0H par-scanline). Sans ça, le sprite joueur restait visible dans la déchirure.
import {
  REG_OFFSET_WININ, REG_OFFSET_WINOUT, REG_OFFSET_WIN0V, REG_OFFSET_WIN0H,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDY,
  REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON,
} from '../system/decomp-runtime';

// 1:1 strict A8 audit : import depuis decomp-data.
import { DISPLAY_WIDTH, DISPLAY_HEIGHT } from '../decomp-data/include/gba/defines-data';

// 1:1 décomp `RGB(11, 11, 11)` (= gris du flash d'intro transition).
// RGB15 little : r | g<<5 | b<<10.
const RGB_INTRO_GRAY = 11 | (11 << 5) | (11 << 10);  // = 0x2D6B

/** 1:1 décomp `CreateIntroTask(0, 0, 3, 2, 2)` (battle_transition.c:3968) +
 *  `Task_BattleTransition_Intro` (l.3987) = LE FLASH gris d'entrée combat.
 *
 *  PHASE 1 INTRO de TOUTE transition (= avant le Slice phase 2). 3 cycles :
 *  blend palette ALL vers RGB(11,11,11) 0→16 par pas 2 (8 frames montée)
 *  puis 16→0 par pas 2 (8 frames descente). 16 frames/cycle × 3 = ~48 frames.
 *  Avant ce port, l'écran "popait direct" sans le clignotement gris 3×. */
interface IntroFlashState {
  /** 0 = FadeToGray (montée), 1 = FadeFromGray (descente). */
  subState: 0 | 1;
  /** tBlend décomp : coefficient blend 0..16. */
  blend: number;
  /** tNumFades décomp : nombre de cycles restants (3 → 0). */
  numFades: number;
  /** Gate frame (= décomp delay 0 → 1 step/frame visuelle). */
  lastFrame: number;
}
let _introFlash: IntroFlashState | null = null;

/** 1:1 décomp `struct TransitionData` (battle_transition.h subset utilisé par Slice). */
interface TransitionData {
  cameraX: number;
  cameraY: number;
  WININ: number;
  WINOUT: number;
  WIN0V: number;
  VBlank_DMA: boolean;
}

interface SliceState {
  /** 0=init pas fait, 1=main loop, 2=done */
  state: number;
  /** tEffectX dans le décomp (= largeur du shift en pixels). */
  effectX: number;
  /** tSpeed (= incrément par frame en u8.8 fixed). */
  speed: number;
  /** tAccel (= multiplicateur exponentiel du speed). */
  accel: number;
  data: TransitionData;
}

let _slice: SliceState | null = null;
let _hblankInstalled = false;
// Gate frame pour le Slice (= 1 step/frame visuelle, décomp `Slice_Main` =
// 1 step/frame Task). Sans ça, le flow polle tickBattleTransitionSlice
// ~5-6×/frame → l'animation slice se termine 5-6× trop vite → la déchirure
// "coupe la map en deux" était quasi-instantanée donc INVISIBLE (bug user).
let _sliceLastFrame = -1;

/** 1:1 décomp `Slice_Init` (battle_transition.c:2728-2756). Initialise les
 *  buffers scanline + le HBLANK callback. */
export function startBattleTransitionSlice(): void {
  ScanlineEffect_Clear();
  _sliceLastFrame = -1;  // reset gate (= nouveau slice, ex. 2e combat consécutif)
  // GetCameraOffsetWithPan : pour notre port, on assume camera (0, 0) puisque
  // l'overworld scroll est géré différement. Décomp utilise les offsets actuels
  // de la map active.
  const cameraX = 0;
  const cameraY = 0;
  _slice = {
    state: 1,
    effectX: 0,
    speed: 1 << 8,
    accel: 1,
    data: {
      cameraX, cameraY,
      WININ: 0x3F,         // WININ_WIN0_ALL (= all BG + OBJ enabled inside WIN0)
      WINOUT: 0,
      WIN0V: DISPLAY_HEIGHT,
      VBlank_DMA: false,
    },
  };

  // 1:1 décomp ll. 2742-2746 : init buffer [1] avec cameraX + DISPLAY_WIDTH.
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    gScanlineEffectRegBuffers[1][i] = cameraX;
    gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + i] = DISPLAY_WIDTH;
  }

  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp `Slice_Init` ll. 2735-2737 + `VBlankCB_Slice` ll. 2810-2812 :
  // WININ = WININ_WIN0_ALL (BG0-3+OBJ+CLR visibles DANS WIN0), WINOUT = 0 (RIEN
  // hors WIN0 → backdrop seul = noir/déchirure), WIN0V = pleine hauteur. Le WIN0H
  // est modulé par-scanline (HBlankCB ci-dessous). Notre compositor n'applique la
  // fenêtre que si WIN0 est actif → on pose DISPCNT_WIN0_ON (= ce que la transition
  // a sur HW). C'EST le maillon manquant : avant, ces valeurs vivaient dans
  // `_slice.data` mais n'étaient JAMAIS envoyées aux registres → 0 clip → le sprite
  // joueur restait visible dans la déchirure (bug A/B user).
  rt.SetGpuReg(REG_OFFSET_WININ, 0x3F);            // WININ_WIN0_ALL
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0);              // rien hors WIN0
  rt.SetGpuReg(REG_OFFSET_WIN0V, DISPLAY_HEIGHT);  // WIN0V = WIN_RANGE(0, 160) pleine hauteur
  rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) | DISPCNT_WIN0_ON);

  // 1:1 décomp `SetHBlankCallback(HBlankCB_Slice)` (ll. 2752).
  rt.gba.setHBlankCallback((y: number) => {
    // 1:1 décomp `HBlankCB_Slice` (ll. 2817-2826) : shift BG1/BG2/BG3 hofs
    // selon le buffer [1] courant (= mis à jour par VBlankCB après chaque frame).
    if (y < DISPLAY_HEIGHT) {
      const offset = gScanlineEffectRegBuffers[1][y];
      // Décomp shift BG1/BG2/BG3 (= overworld layers). Skip BG0 (= text windows).
      rt.gba.bg(1).config.hofs = offset;
      rt.gba.bg(2).config.hofs = offset;
      rt.gba.bg(3).config.hofs = offset;
      // 1:1 décomp DMA Slice (`VBlankCB_Slice` l.2814 : DmaSet REG_WIN0H ←
      // gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + i], stream/scanline). Le
      // buffer storeLoc2 encode WIN0H = (left<<8)|right (lignes paires/impaires
      // se ferment en sens opposé → déchirure). Équivaut à SetGpuReg(WIN0H) : on
      // mute directement windows.win0 (même pattern que bg().config.hofs ci-dessus).
      const win0h = gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + y];
      rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
      rt.gba.windows.win0.x2 = win0h & 0xFF;
    }
  });
  _hblankInstalled = true;
}

/** 1:1 décomp `CreateIntroTask(0, 0, 3, 2, 2)` — démarre le flash gris d'entrée
 *  (= phase 1 INTRO de la transition, AVANT le Slice). */
export function startBattleIntroFlash(): void {
  _introFlash = {
    subState: 0,      // FadeToGray
    blend: 0,         // tBlend
    numFades: 3,      // tNumFades
    lastFrame: -1,
  };
}

/** 1:1 décomp `Task_BattleTransition_Intro` (battle_transition.c:3987) :
 *  `TransitionIntro_FadeToGray` (l.3992) + `TransitionIntro_FadeFromGray` (l.4011).
 *  Retourne true quand les 3 cycles de flash sont terminés.
 *
 *  Gate frame via `performance.now()/16` (= ~60fps) car ce tick est polled
 *  ~5-6×/frame visuelle par le flow (= sinon flash 5× trop rapide). Décomp
 *  delay=0 → exactement 1 step/frame. */
export function tickBattleIntroFlash(): boolean {
  if (!_introFlash) return true;
  const f = _introFlash;
  // Gate : 1 step par frame visuelle.
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;  // frame-gate (gIntroFrameCounter, pas wall-clock) = timing 1:1 décomp
  if (fc === f.lastFrame) return false;
  f.lastFrame = fc;

  if (f.subState === 0) {
    // 1:1 décomp TransitionIntro_FadeToGray (delay 0 → chaque frame) :
    f.blend += 2;                       // tFadeToGrayIncrement = 2
    if (f.blend > 16) f.blend = 16;
    BlendPalettes(PALETTES_ALL, f.blend, RGB_INTRO_GRAY);
    if (f.blend >= 16) f.subState = 1;  // → FadeFromGray
  } else {
    // 1:1 décomp TransitionIntro_FadeFromGray :
    f.blend -= 2;                       // tFadeFromGrayIncrement = 2
    if (f.blend < 0) f.blend = 0;
    BlendPalettes(PALETTES_ALL, f.blend, RGB_INTRO_GRAY);
    if (f.blend === 0) {
      f.numFades -= 1;
      if (f.numFades === 0) {
        // 1:1 décomp : tous les fades faits → intro terminé.
        _introFlash = null;
        return true;
      }
      f.subState = 0;                   // → nouveau cycle FadeToGray
    }
  }
  return false;
}

/** Devtools / debug : check si le flash d'intro est actif. */
export function isBattleIntroFlashActive(): boolean {
  return _introFlash !== null;
}

/** 1:1 décomp `Slice_Main` (battle_transition.c:2758-2795). Appelé chaque frame
 *  tant que la transition n'est pas terminée. Retourne true quand done. */
export function tickBattleTransitionSlice(): boolean {
  if (!_slice) return true;
  if (_slice.state !== 1) {
    // Slice_End déjà traité au precedent tick.
    return true;
  }

  // Gate : 1 step par frame visuelle (= décomp `Slice_Main` = 1 step/frame
  // Task). Le flow polle ~5-6×/frame → sans ce gate l'animation slice se
  // terminait 5-6× trop vite → la déchirure "coupe la map en deux" était
  // quasi-instantanée donc INVISIBLE (bug rapporté user). Même pattern de
  // gate que tickBattleIntroFlash / tickBattleIntroSlide.
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;  // frame-gate (gIntroFrameCounter, pas wall-clock) = timing 1:1 décomp
  if (fc === _sliceLastFrame) return false;
  _sliceLastFrame = fc;

  _slice.data.VBlank_DMA = false;

  // 1:1 décomp ll. 2764-2770 : accélération exponentielle.
  _slice.effectX += _slice.speed >> 8;
  if (_slice.effectX > DISPLAY_WIDTH) _slice.effectX = DISPLAY_WIDTH;
  if (_slice.speed <= 0xFFF) _slice.speed += _slice.accel;
  if (_slice.accel < 128) _slice.accel <<= 1;  // mul by 2 chaque frame

  // 1:1 décomp ll. 2772-2788 : remplit buffer [0] avec BG offsets per scanline.
  // Lignes paires : shift gauche. Lignes impaires : shift droite.
  // storeLoc2 = WIN0H range (= encode HI<<8|LO pour left/right).
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    if (i & 1) {
      // Lignes impaires : storeLoc1 = cameraX + effectX, storeLoc2 = WIDTH - effectX
      gScanlineEffectRegBuffers[0][i] = _slice.data.cameraX + _slice.effectX;
      gScanlineEffectRegBuffers[0][DISPLAY_HEIGHT + i] = DISPLAY_WIDTH - _slice.effectX;
    } else {
      // Lignes paires : storeLoc1 = cameraX - effectX, storeLoc2 = (effectX<<8) | (WIDTH+1)
      gScanlineEffectRegBuffers[0][i] = (_slice.data.cameraX - _slice.effectX) & 0xFFFF;
      gScanlineEffectRegBuffers[0][DISPLAY_HEIGHT + i] = ((_slice.effectX << 8) | (DISPLAY_WIDTH + 1)) & 0xFFFF;
    }
  }

  // 1:1 décomp ll. 2790-2791 : check fin (effectX >= DISPLAY_WIDTH).
  if (_slice.effectX >= DISPLAY_WIDTH) {
    _slice.state = 2;
  }

  // 1:1 décomp ll. 2812-2813 + 2793 : VBlank simu — copy buffer [0] → [1].
  // Décomp utilise DmaCopy16(3, buf[0], buf[1], 160*4 bytes) = 320 u16.
  _slice.data.VBlank_DMA = true;
  if (_slice.data.VBlank_DMA) {
    for (let i = 0; i < DISPLAY_HEIGHT * 2; i++) {
      gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
    }
  }

  // Return true seulement quand l'animation est terminée ET nettoyée.
  if (_slice.state === 2) {
    // 1:1 décomp `Slice_End` (battle_transition.c:2797-2803) :
    //   DmaStop(0); FadeScreenBlack(); DestroyTask(...);
    // `FadeScreenBlack` (l.4082) = `BlendPalettes(PALETTES_ALL, 16, RGB_BLACK)`
    // = écran NOIR **INSTANT** (coeff 16 = 100%, PAS un fade progressif).
    //
    // BUG corrigé : avant on SKIP ce FadeScreenBlack en supposant que
    // battle-flow ferait `BeginNormalPaletteFade` (= fade PROGRESSIF 16 frames).
    // Résultat : entre la fin du slice (BG offsets reset par stopBattleTransition)
    // et le noir complet du fade progressif, l'overworld NORMAL réapparaissait
    // quelques frames (= bug visuel "on revoit l'écran normal" rapporté user).
    // 1:1 décomp = noir INSTANT ici.
    BlendPalettes(PALETTES_ALL, 16, /* RGB_BLACK */ 0);
    stopBattleTransition();
    return true;
  }
  return false;
}

/** Cleanup : remove HBLANK callback + reset BG offsets à 0. */
export function stopBattleTransition(): void {
  if (_hblankInstalled) {
    const rt = getRuntime();
    if (rt) {
      rt.gba.setHBlankCallback(null);
      // Reset BG offsets shift par le callback.
      rt.gba.bg(1).config.hofs = 0;
      rt.gba.bg(2).config.hofs = 0;
      rt.gba.bg(3).config.hofs = 0;
      // Reset la fenêtre WIN0 : plage pleine + désactive WIN0 (bypass window).
      // Sans ça, l'écran qui suit (combat) hériterait du dernier WIN0H du slice
      // (= fenêtre fermée → écran clippé/noir). Le combat re-pose sa propre
      // fenêtre dans CB2_InitBattleInternal s'il en a besoin (intro slide).
      rt.gba.windows.win0.x1 = 0;
      rt.gba.windows.win0.x2 = DISPLAY_WIDTH;
      rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) & ~DISPCNT_WIN0_ON);
    }
    _hblankInstalled = false;
  }
  ScanlineEffect_Stop();
  _slice = null;
}

/** Devtools / debug : check si une transition est active. */
export function isBattleTransitionActive(): boolean {
  return _slice !== null && _slice.state === 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// B_TRANSITION_WHITE_BARS_FADE (battle_transition.c:3585-3754, sWhiteBarsFade_Funcs)
// 8 bandes horizontales (20px) qui blanchissent depuis la DROITE (lighten BLDY +
// WIN0H par-scanline) avec délais décalés → flash blanc plein écran → fondu au noir.
// = la transition WILD par DÉFAUT (zone normale, ennemi pas plus faible que le joueur ;
// sélectionnée p.ex. au combat dev Treecko5 vs Poochyena5 → GetWildBattleTransition=9).
// HBlank : le compositor lit `blend.brightness` (lighten) + `windows.win0.x2` FRAIS
// par-scanline → muter ces champs dans le HBlank applique BLDY/WIN0H par-ligne (1:1 DMA).
// ─────────────────────────────────────────────────────────────────────────────

/** 1:1 décomp `RGB(31,31,31)` = blanc plein (RGB_WHITE). */
const RGB_WHITE_TR = 31 | (31 << 5) | (31 << 10);  // 0x7FFF
const NUM_WHITE_BARS = 8;
/** 1:1 `sWhiteBarsFade_StartDelays` (battle_transition.c:740). */
const WHITE_BARS_START_DELAYS = [0, 20, 15, 40, 10, 25, 35, 5];
/** 1:1 `FADE_TARGET` (l.3585) = 16 << 8. */
const FADE_TARGET = 16 << 8;

interface WhiteBar {
  x: number; fade: number; finished: boolean; destroyed: boolean;
  destroyAttempts: number; delay: number; isMainSprite: boolean;
}
interface WhiteBarsState {
  state: number;     // 1=bars, 2=blendToBlack (one-shot), 3=end
  counter: number;   // sTransitionData.counter (bandes finies)
  vblankDma: boolean;
  bldy: number;      // phase end : BLDY 1→17
  bars: WhiteBar[];
}
let _whiteBars: WhiteBarsState | null = null;
let _whiteBarsLastFrame = -1;

/** 1:1 `WhiteBarsFade_Init` (l.3592) + `WhiteBarsFade_StartBars` (l.3619) fusionnés. */
export function startBattleTransitionWhiteBarsFade(): void {
  ScanlineEffect_Clear();
  _whiteBarsLastFrame = -1;
  const rt = getRuntime();
  if (!rt) return;
  rt.SetGpuReg(REG_OFFSET_BLDCNT, 0xBF);   // BLDCNT_TGT1_ALL(0x3F) | BLDCNT_EFFECT_LIGHTEN(2<<6)
  rt.SetGpuReg(REG_OFFSET_BLDY, 0);
  rt.SetGpuReg(REG_OFFSET_WININ, 0x1E);    // WIN0 inside : BG1|BG2|BG3|OBJ (PAS BG0, PAS bit CLR → no blend)
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0x3F);   // outside : tout + CLR → le lighten BLDY s'applique
  rt.SetGpuReg(REG_OFFSET_WIN0V, DISPLAY_HEIGHT);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) | DISPCNT_WIN0_ON);
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    gScanlineEffectRegBuffers[1][i] = 0;                                // BLDY
    gScanlineEffectRegBuffers[1][i + DISPLAY_HEIGHT] = DISPLAY_WIDTH;   // WIN0H x (= 240)
  }
  const bars: WhiteBar[] = [];
  for (let i = 0; i < NUM_WHITE_BARS; i++) {
    bars.push({
      x: DISPLAY_WIDTH, fade: 0, finished: false, destroyed: false,
      destroyAttempts: 0, delay: WHITE_BARS_START_DELAYS[i], isMainSprite: i === NUM_WHITE_BARS - 1,
    });
  }
  _whiteBars = { state: 1, counter: 0, vblankDma: false, bldy: 0, bars };
  // 1:1 `HBlankCB_WhiteBarsFade` (REG_BLDY = buf[1][VCOUNT]) + DMA WIN0H par-scanline.
  rt.gba.setHBlankCallback((y: number) => {
    if (y < DISPLAY_HEIGHT) {
      rt.gba.blend.brightness = gScanlineEffectRegBuffers[1][y] & 0x1F;
      rt.gba.windows.win0.x1 = 0;
      rt.gba.windows.win0.x2 = gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + y] & 0xFF;
    }
  });
  _hblankInstalled = true;
}

/** 1:1 `sWhiteBarsFade_Funcs` state machine. Retourne true en fin (FadeScreenBlack). */
export function tickBattleTransitionWhiteBarsFade(): boolean {
  if (!_whiteBars) return true;
  const w = _whiteBars;
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;  // frame-gate (gIntroFrameCounter, pas wall-clock) = timing 1:1 décomp
  if (fc === _whiteBarsLastFrame) return false;
  _whiteBarsLastFrame = fc;
  const rt = getRuntime();
  if (!rt) return true;
  const step = Math.floor(DISPLAY_HEIGHT / NUM_WHITE_BARS);  // 20

  if (w.state === 1) {
    // PHASE bars — 1:1 `SpriteCB_WhiteBarFade` (l.3711) par bande.
    w.vblankDma = false;
    for (let bi = 0; bi < w.bars.length; bi++) {
      const s = w.bars[bi];
      if (s.destroyed) continue;            // 1:1 DestroySprite : la bande ne tick plus
      const baseY = bi * step;              // sprite.y posé en StartBars
      if (s.delay) { s.delay--; if (s.isMainSprite) w.vblankDma = true; continue; }
      for (let i = 0; i < step; i++) {      // fill buf[0] (BLDY + WIN0H x) sur les 20 lignes
        gScanlineEffectRegBuffers[0][baseY + i] = s.fade >> 8;
        gScanlineEffectRegBuffers[0][baseY + i + DISPLAY_HEIGHT] = s.x & 0xFF;
      }
      if (s.x === 0 && s.fade === FADE_TARGET) s.finished = true;
      s.x -= 16;
      s.fade += FADE_TARGET / 32;           // +128 (BLDY +0.5/frame sur l'octet haut)
      if (s.x < 0) s.x = 0;
      if (s.fade > FADE_TARGET) s.fade = FADE_TARGET;
      if (s.isMainSprite) w.vblankDma = true;
      if (s.finished) {
        if (!s.isMainSprite || (w.counter >= NUM_WHITE_BARS - 1 && s.destroyAttempts++ > 7)) {
          w.counter++;
          s.destroyed = true;
        }
      }
    }
    // 1:1 `VBlankCB_WhiteBarsFade` : DmaCopy16(buf[0] → buf[1], 320 u16) si VBlank_DMA.
    if (w.vblankDma) {
      for (let i = 0; i < DISPLAY_HEIGHT * 2; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
    }
    // 1:1 `WhiteBarsFade_WaitBars` : counter >= 8 → flash blanc plein écran.
    if (w.counter >= NUM_WHITE_BARS) { BlendPalettes(PALETTES_ALL, 16, RGB_WHITE_TR); w.state = 2; }
    return false;
  }

  if (w.state === 2) {
    // PHASE blendToBlack (one-shot) — 1:1 `WhiteBarsFade_BlendToBlack` (l.3653).
    rt.gba.setHBlankCallback(null);
    _hblankInstalled = false;
    rt.SetGpuReg(REG_OFFSET_WIN0H, DISPLAY_WIDTH);  // fenêtre pleine
    rt.SetGpuReg(REG_OFFSET_BLDY, 0);
    rt.SetGpuReg(REG_OFFSET_BLDCNT, 0xFF);          // BLDCNT_TGT1_ALL | BLDCNT_EFFECT_DARKEN
    rt.SetGpuReg(REG_OFFSET_WININ, 0x3F);           // WININ_WIN0_ALL
    w.bldy = 0;
    w.state = 3;
    return false;
  }

  // PHASE end — 1:1 `WhiteBarsFade_End` (l.3672) : BLDY 1→17 puis FadeScreenBlack.
  w.bldy++;
  rt.SetGpuReg(REG_OFFSET_BLDY, w.bldy);
  if (w.bldy > 16) {
    BlendPalettes(PALETTES_ALL, 16, 0);  // FadeScreenBlack (RGB_BLACK = 0)
    stopBattleTransitionWhiteBarsFade();
    return true;
  }
  return false;
}

/** Cleanup WhiteBarsFade : retire le HBlank + reset BLDCNT/BLDY/WIN0 (sinon le
 *  combat hériterait du darken/fenêtre résiduel = écran noir). */
export function stopBattleTransitionWhiteBarsFade(): void {
  const rt = getRuntime();
  if (rt) {
    rt.gba.setHBlankCallback(null);
    rt.gba.windows.win0.x1 = 0;
    rt.gba.windows.win0.x2 = DISPLAY_WIDTH;
    rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) & ~DISPCNT_WIN0_ON);
    rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
    rt.SetGpuReg(REG_OFFSET_BLDY, 0);
    rt.SetGpuReg(REG_OFFSET_WININ, 0x3F);
  }
  _hblankInstalled = false;
  ScanlineEffect_Stop();
  _whiteBars = null;
}

/** Devtools : check si la transition WhiteBarsFade est active. */
export function isBattleTransitionWhiteBarsFadeActive(): boolean { return _whiteBars !== null; }
