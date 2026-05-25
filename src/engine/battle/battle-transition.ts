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

import { gScanlineEffectRegBuffers, ScanlineEffect_Clear, ScanlineEffect_Stop } from '../decomp-globals';
import { getRuntime, BlendPalettes, PALETTES_ALL } from '../decomp-globals';

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

  // 1:1 décomp `SetHBlankCallback(HBlankCB_Slice)` (ll. 2752).
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.setHBlankCallback((y: number) => {
    // 1:1 décomp `HBlankCB_Slice` (ll. 2817-2826) : shift BG1/BG2/BG3 hofs
    // selon le buffer [1] courant (= mis à jour par VBlankCB après chaque frame).
    if (y < DISPLAY_HEIGHT) {
      const offset = gScanlineEffectRegBuffers[1][y];
      // Décomp shift BG1/BG2/BG3 (= overworld layers). Skip BG0 (= text windows).
      rt.gba.bg(1).config.hofs = offset;
      rt.gba.bg(2).config.hofs = offset;
      rt.gba.bg(3).config.hofs = offset;
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
  const fc = Math.floor(performance.now() / 16);
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
  const fc = Math.floor(performance.now() / 16);
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
