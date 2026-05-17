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

import { gScanlineEffectRegBuffers, ScanlineEffect_Clear, ScanlineEffect_Stop } from './decomp-globals';
import { getRuntime } from './decomp-globals';

const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

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

/** 1:1 décomp `Slice_Init` (battle_transition.c:2728-2756). Initialise les
 *  buffers scanline + le HBLANK callback. */
export function startBattleTransitionSlice(): void {
  ScanlineEffect_Clear();
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

/** 1:1 décomp `Slice_Main` (battle_transition.c:2758-2795). Appelé chaque frame
 *  tant que la transition n'est pas terminée. Retourne true quand done. */
export function tickBattleTransitionSlice(): boolean {
  if (!_slice) return true;
  if (_slice.state !== 1) {
    // Slice_End déjà traité au precedent tick.
    return true;
  }

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
    // 1:1 décomp `Slice_End` ll. 2797-2802 : DmaStop, FadeScreenBlack, DestroyTask.
    // FadeScreenBlack utilise BlendPalettes(PALETTES_ALL, 16, RGB_BLACK) — pour
    // notre port, le caller (= battle-flow INIT) appelle déjà BeginNormalPaletteFade
    // après tickBattleTransitionSlice → true. Donc on skip le fade ici.
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
