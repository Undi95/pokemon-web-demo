/**
 * pokedex_cry_screen.ts — miroir 1:1 de `src/pokedex_cry_screen.c` (580 l).
 *
 * Écran CRI du Pokédex : waveform du cri en temps réel (fenêtre WIN_CRY_WAVE,
 * BG0, 32×7 tiles) + VU-mètre à aiguille affine (fenêtre WIN_VU_METER + sprite
 * needle 64×64).
 *
 * Adaptation source audio : le C lit `gSoundInfo.pcmBuffer` (mixage DirectSound
 * live) — chez nous le cri = WAV WebAudio → `getCryWaveformSamples(16)` lit les
 * samples du buffer décodé à la position de lecture réelle (music.ts). Même
 * cadence (16 samples s8 ×2 par frame, 1 sample sur 2), même pipeline dessin.
 *
 * Adaptation dessin : le C écrit le tiledata 4bpp de la fenêtre via des offsets
 * précalculés (sWaveformOffsets) + masques nybble — notre fenêtre = pixelBuffer
 * 1 byte/pixel → écriture directe pixel (x, y), même géométrie, même dégradé
 * (sWaveformColor : bleu 8 au centre → blanc 15 aux pics), même scroll BG0HOFS.
 */
import { getRuntime, LoadPalette, FreeAllSpritePalettes } from '../harness/runtime/decomp-globals';
import { DestroySprite, SetOamMatrix } from './sprite';
import { gSineTable } from './trig';
import { loadTileBin, loadGbaPal } from '../harness/gba/png-loader';
import { BG_PLTT_ID } from '../harness/runtime/decomp-runtime';
import { CopyToWindowPixelBuffer, CopyWindowToVram, GetWindowAttribute, GetWindowPixelBuffer, WINDOW_BG } from './window';
import { getCryWaveformSamples, isCryPlaying, playCry, stopCry } from '../harness/m4a/music';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';

const MIN_NEEDLE_POS = 32;
const MAX_NEEDLE_POS = -32;
const NEEDLE_MOVE_INCREMENT = 5;
const WAVEFORM_WINDOW_HEIGHT = 56;

export interface CryScreenWindow {
  unk0: number;
  unk2?: number;
  paletteNo: number;
  yPos: number;
  xPos: number;
}

interface PokedexCryScreen {
  cryWaveformBuffer: Int8Array;   // s8[16] (×2 déjà appliqué, cf. Buffer…)
  cryState: number;
  playhead: number;
  waveformPreviousY: number;
  playStartPos: number;
  species: number;
  cryOverrideCountdown: number;
  cryRepeatDelay: number;
}

interface PokedexCryMeterNeedle {
  rotation: number;
  targetRotation: number;
  moveIncrement: number;
  spriteId: number;
}

/** 1:1 `gDexCryScreenState` (extern, remis à 0 par le caller avant chaque Load*). */
export let gDexCryScreenState = 0;
export function setDexCryScreenState(v: number): void { gDexCryScreenState = v; }

let sDexCryScreen: PokedexCryScreen | null = null;
let sCryMeterNeedle: PokedexCryMeterNeedle | null = null;
let _waveWindowId = 2;

// 1:1 sWaveformColor : bleu (8) au centre, blanc (15) aux pics — version pixel
// (index couleur direct, le nybble packing du C est un détail 4bpp).
const sWaveformColorFlat: readonly number[] = [15, 14, 13, 12, 11, 10, 9, 8, 8, 9, 10, 11, 12, 13, 14, 15];

// Assets (async, gates dans les Load*).
let _bgTile: Uint8Array | null = null;        // cry_screen_bg.png tile 0 (fond grille)
let _bgPal: Uint16Array | null = null;
let _meterTiles: Uint8Array | null = null;    // cry_meter.png (cadran, fenêtre VU)
let _meterPal: Uint16Array | null = null;
let _needleReady = false;
const NEEDLE_TILE_BASE = 384;                 // slot OBJ 64×64 (64 tiles)
const NEEDLE_PAL_BANK = 3;
let _assetsLoading = false;
let _assetsReady = false;

function _loadCryAssets(rt: NonNullable<ReturnType<typeof getRuntime>>): void {
  if (_assetsReady || _assetsLoading) return;
  _assetsLoading = true;
  void (async () => {
    try {
      const [bgTiles, bgPal, meterTiles, meterPal, needle] = await Promise.all([
        loadTileBin('/decomp/em/pokedex/cry_screen_bg.png', 4),
        // sCryScreenBg_Pal = cry_screen_bg (gbapal BINAIRE 16×u16 — contient le
        // dégradé bleu→blanc de la waveform, la PLTE du PNG ne l'a PAS).
        fetch('/decomp/em/pokedex/cry_screen_bg').then((r) => r.arrayBuffer()).then((b) => new Uint16Array(b))
          .catch(() => import('../harness/gba/png-loader').then((m) => m.loadIndexedPngStrict('/decomp/em/pokedex/cry_screen_bg.png', 4)).then((p) => p.palette)),
        loadTileBin('/decomp/em/pokedex/cry_meter.png', 4),
        import('../harness/gba/png-loader').then((m) => m.loadIndexedPngStrict('/decomp/em/pokedex/cry_meter.png', 4)).then((p) => p.palette),
        rt.LoadCompressedSpriteSheet('/decomp/em/pokedex/cry_meter_needle.png', NEEDLE_TILE_BASE * 32),
      ]);
      _bgTile = bgTiles.subarray(0, 32);
      _bgPal = bgPal;
      _meterTiles = meterTiles;
      _meterPal = meterPal;
      if (needle.palette) LoadPalette(needle.palette.subarray(0, 16), 0x100 + NEEDLE_PAL_BANK * 16, 32);
      _needleReady = true;
    } catch (e) {
      console.error('[pokedex_cry] assets load failed:', e);
    }
    _assetsReady = true;
  })();
}

// ─── Waveform (dessin pixelBuffer, géométrie 1:1) ────────────────────────────

function _winPixels(): { buf: Uint8Array; widthPx: number } | null {
  // Équivalent du pointeur WINDOW_TILE_DATA du C : le pixelBuffer de la fenêtre
  // (GetWindowPixelBuffer existant + largeur en px via l'attribut WIDTH).
  const buf = GetWindowPixelBuffer(_waveWindowId);
  if (!buf) return null;
  return { buf, widthPx: GetWindowAttribute(_waveWindowId, 3 /* WINDOW_WIDTH */) * 8 };
}

/** Pose le tile de fond (8×8) à la colonne de tiles tx, rangée ty du pixelBuffer. */
function _stampBgTile(tx: number, ty: number): void {
  const w = _winPixels();
  if (!w || !_bgTile) return;
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 4; px++) {
      const byte = _bgTile[py * 4 + px];
      const off = (ty * 8 + py) * w.widthPx + tx * 8 + px * 2;
      w.buf[off] = byte & 0xf;
      w.buf[off + 1] = (byte >> 4) & 0xf;
    }
  }
}

/** 1:1 `DrawWaveformSegment(position, amplitude)` (pokedex_cry_screen.c:~460) :
 *  y = (amplitude+127)*256/1152 clampé, trace la ligne verticale depuis le point
 *  précédent, dégradé sWaveformColor selon y. Position = colonne de pixel. */
function DrawWaveformSegment(position: number, amplitude: number): void {
  const w = _winPixels();
  if (!w || !sDexCryScreen) return;
  const x = ((position % 256) + 256) % 256;
  let y = Math.trunc(((amplitude + 127) * 256) / 1152);
  if (y > WAVEFORM_WINDOW_HEIGHT - 1) y = WAVEFORM_WINDOW_HEIGHT - 1;
  const currentPointY = y;
  const putPixel = (yy: number): void => {
    w.buf[yy * w.widthPx + x] = sWaveformColorFlat[((Math.trunc(yy / 3)) - 1) & 0x0f];
  };
  if (y > sDexCryScreen.waveformPreviousY) {
    do { putPixel(y); y--; } while (y > sDexCryScreen.waveformPreviousY);
  } else {
    do { putPixel(y); y++; } while (y < sDexCryScreen.waveformPreviousY);
  }
  sDexCryScreen.waveformPreviousY = currentPointY;
}

/** 1:1 `DrawWaveformWindow` : pousse la fenêtre en VRAM. */
function DrawWaveformWindow(windowId: number): void {
  CopyWindowToVram(windowId, 2 /* COPYWIN_GFX */);
}

/** 1:1 `ShiftWaveformOver` : scroll horizontal du BG de la fenêtre (BG0HOFS). */
function ShiftWaveformOver(windowId: number, offset: number, rsVertical: boolean): void {
  if (!rsVertical) {
    const rt = getRuntime();
    if (!rt) return;
    const bg = Number(GetWindowAttribute(windowId, WINDOW_BG));
    const HOFS_BY_BG = [0x10, 0x14, 0x18, 0x1c];
    rt.SetGpuReg(HOFS_BY_BG[bg & 3], offset & 0xffff);
  }
}

/** 1:1 `AdvancePlayhead` : scroll + efface la colonne de tiles devant le playhead. */
function AdvancePlayhead(windowId: number): void {
  if (!sDexCryScreen) return;
  ShiftWaveformOver(windowId, sDexCryScreen.playhead, false);
  sDexCryScreen.playhead = (sDexCryScreen.playhead + 2) & 0xff;
  const offset = (Math.trunc(sDexCryScreen.playhead / 8) + sDexCryScreen.playStartPos + 1) % 32;
  for (let i = 0; i < 7; i++) _stampBgTile(offset, i);
}

/** 1:1 `BufferCryWaveformSegment` : 16 samples s8 ×2 depuis la lecture courante. */
function BufferCryWaveformSegment(): void {
  if (!sDexCryScreen) return;
  const samples = getCryWaveformSamples(16);
  for (let i = 0; i < 16; i++) {
    const s = samples ? samples[i] : 0;
    sDexCryScreen.cryWaveformBuffer[i] = Math.max(-128, Math.min(127, s * 2));
  }
}

function DrawWaveformFlatline(): void {
  if (!sDexCryScreen) return;
  DrawWaveformSegment(sDexCryScreen.playStartPos * 8 + sDexCryScreen.playhead - 2, 0);
  DrawWaveformSegment(sDexCryScreen.playStartPos * 8 + sDexCryScreen.playhead - 1, 0);
}

// ─── API publique (contrat pokedex.c) ────────────────────────────────────────

/** 1:1 `bool8 LoadCryWaveformWindow(struct CryScreenWindow *window, u8 windowId)`. */
export function LoadCryWaveformWindow(window: CryScreenWindow, windowId: number): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  let finished = false;
  switch (gDexCryScreenState) {
    case 0:
      _loadCryAssets(rt);
      if (!_assetsReady) return false;   // gate async (le C décompresse en sync)
      if (!sDexCryScreen) {
        sDexCryScreen = {
          cryWaveformBuffer: new Int8Array(16),
          cryState: 0,
          playhead: 0,
          waveformPreviousY: WAVEFORM_WINDOW_HEIGHT / 2,
          playStartPos: 0,
          species: 0,
          cryOverrideCountdown: 0,
          cryRepeatDelay: 0,
        };
        _waveWindowId = windowId;
      }
      sDexCryScreen.playStartPos = window.yPos;
      sDexCryScreen.cryOverrideCountdown = 0;
      sDexCryScreen.cryRepeatDelay = 0;
      sDexCryScreen.cryState = 0;
      sDexCryScreen.waveformPreviousY = WAVEFORM_WINDOW_HEIGHT / 2;
      sDexCryScreen.playhead = 0;
      ShiftWaveformOver(windowId, -8 * window.xPos, true);   // no-op (1:1)
      for (let i = 0; i < 224; i++) {
        if (_bgTile) CopyToWindowPixelBuffer(windowId, _bgTile, 32, i);
      }
      gDexCryScreenState++;
      break;
    case 1:
      for (let i = 0; i < sDexCryScreen!.playStartPos * 8; i++)
        DrawWaveformSegment(i, 0);
      gDexCryScreenState++;
      break;
    case 2:
      DrawWaveformWindow(windowId);
      if (_bgPal) LoadPalette(_bgPal.subarray(0, 16), BG_PLTT_ID(window.paletteNo), 32);
      finished = true;
      break;
  }
  return finished;
}

/** 1:1 `void UpdateCryWaveformWindow(u8 windowId)` — appelé chaque frame d'input. */
export function UpdateCryWaveformWindow(windowId: number): void {
  if (!sDexCryScreen) return;
  DrawWaveformWindow(windowId);
  AdvancePlayhead(windowId);
  if (sDexCryScreen.cryRepeatDelay) sDexCryScreen.cryRepeatDelay--;
  if (sDexCryScreen.cryOverrideCountdown) {
    sDexCryScreen.cryOverrideCountdown--;
    if (!sDexCryScreen.cryOverrideCountdown) {
      PlayCryScreenCry(sDexCryScreen.species);
      DrawWaveformFlatline();
      return;
    }
  }
  if (sDexCryScreen.cryState === 0) {
    DrawWaveformFlatline();
    return;
  }
  if (sDexCryScreen.cryState === 1) {
    BufferCryWaveformSegment();
  } else if (sDexCryScreen.cryState > 8) {
    // Adaptation : le WAV décode en ASYNC (~2-6 frames) — le C joue instantané.
    // Grace period le temps que la lecture démarre réellement (sinon cryState
    // retombe à 0 avant le premier sample et la courbe ne se dessine jamais).
    if (!isCryPlaying()) {
      if (_cryStartGrace > 0) {
        _cryStartGrace--;
        sDexCryScreen.cryState = 1;
        BufferCryWaveformSegment();
      } else {
        DrawWaveformFlatline();
        sDexCryScreen.cryState = 0;
        return;
      }
    } else {
      _cryStartGrace = 0;
      BufferCryWaveformSegment();
      sDexCryScreen.cryState = 1;
    }
  }
  const waveformIdx = 2 * (sDexCryScreen.cryState - 1);
  DrawWaveformSegment(sDexCryScreen.playStartPos * 8 + sDexCryScreen.playhead - 2, sDexCryScreen.cryWaveformBuffer[waveformIdx]);
  DrawWaveformSegment(sDexCryScreen.playStartPos * 8 + sDexCryScreen.playhead - 1, sDexCryScreen.cryWaveformBuffer[waveformIdx + 1]);
  sDexCryScreen.cryState++;
}

/** 1:1 `void CryScreenPlayButton(u16 species)` — bouton A. (La gate BGM-en-pause
 *  du C (MUSICPLAYER_STATUS_PAUSE) est implicite : l'écran a stoppé la BGM.) */
export function CryScreenPlayButton(species: number): void {
  if (!sDexCryScreen) return;
  if (!sDexCryScreen.cryOverrideCountdown) {
    if (!sDexCryScreen.cryRepeatDelay) {
      sDexCryScreen.cryRepeatDelay = 4;
      if (isCryPlaying()) {
        stopCry();
        sDexCryScreen.species = species;
        sDexCryScreen.cryOverrideCountdown = 2;
      } else {
        PlayCryScreenCry(species);
      }
    }
  }
}

let _cryStartGrace = 0;

/** 1:1 `PlayCryScreenCry` : PlayCry_NormalNoDucking + cryState=1. */
function PlayCryScreenCry(species: number): void {
  const key = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  playCry(key);
  _cryStartGrace = 30;   // le temps du fetch+decode WAV (adaptation async)
  sDexCryScreen!.cryState = 1;
}

/** Re-export pour pokedex.ts (IsCryPlaying du C). */
export { isCryPlaying as IsCryPlaying };

/** 1:1 `bool8 LoadCryMeter(struct CryScreenWindow *window, u8 windowId)`. */
export function LoadCryMeter(window: CryScreenWindow, windowId: number): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  let finished = false;
  switch (gDexCryScreenState) {
    case 0:
      if (!_assetsReady) return false;   // gate async
      if (!sCryMeterNeedle) {
        sCryMeterNeedle = { rotation: 0, targetRotation: 0, moveIncrement: 0, spriteId: 0xffff };
      }
      //!< French Difference (le cadran vient de gCryMeter_Gfx)
      if (_meterTiles) CopyToWindowPixelBuffer(windowId, _meterTiles, 0, 0);
      if (_meterPal) LoadPalette(_meterPal.subarray(0, 16), BG_PLTT_ID(window.paletteNo), 32);
      gDexCryScreenState++;
      break;
    case 1: {
      if (!_needleReady || !sCryMeterNeedle) return false;
      const { spriteId } = rt.CreateSpriteAtOam({
        tileId: NEEDLE_TILE_BASE, paletteBank: NEEDLE_PAL_BANK,
        x: 40 + window.xPos * 8, y: 56 + window.yPos * 8,
        shape: 0, size: 3 /* 64×64 */, priority: 1,
        affineMode: 1, affineParamIndex: 0,
      });
      const s = rt.gSprites[spriteId];
      if (s) {
        s.affineMode = 1;
        s.matrixNum = 0;
        s.callback = SpriteCB_CryMeterNeedle as unknown as typeof s.callback;
      }
      sCryMeterNeedle.spriteId = spriteId;
      sCryMeterNeedle.rotation = MIN_NEEDLE_POS;
      sCryMeterNeedle.targetRotation = MIN_NEEDLE_POS;
      sCryMeterNeedle.moveIncrement = 0;
      finished = true;
      break;
    }
  }
  return finished;
}

/** 1:1 `void FreeCryScreen(void)`. */
export function FreeCryScreen(): void {
  if (sCryMeterNeedle && sCryMeterNeedle.spriteId !== 0xffff) {
    try { DestroySprite(sCryMeterNeedle.spriteId); } catch { /* déjà détruit */ }
  }
  void FreeAllSpritePalettes;   // FreeSpritePaletteByTag : slots fixes chez nous
  sDexCryScreen = null;
  sCryMeterNeedle = null;
  stopCry();
}

/** 1:1 `SpriteCB_CryMeterNeedle` : rotation affine vers la cible (amplitude). */
function SpriteCB_CryMeterNeedle(sprite: { x2: number; y2: number }): void {
  if (!sCryMeterNeedle || !sDexCryScreen) return;
  switch (sDexCryScreen.cryState) {
    case 0:
      sCryMeterNeedle.targetRotation = MIN_NEEDLE_POS;
      if (sCryMeterNeedle.rotation > 0) {
        if (sCryMeterNeedle.moveIncrement !== 1) sCryMeterNeedle.moveIncrement--;
      } else {
        sCryMeterNeedle.moveIncrement = NEEDLE_MOVE_INCREMENT;
      }
      break;
    case 2: {
      let peak = 0;
      for (let i = 0; i < 16; i++) {
        if (peak < sDexCryScreen.cryWaveformBuffer[i]) peak = sDexCryScreen.cryWaveformBuffer[i];
      }
      SetCryMeterNeedleTarget(Math.trunc((peak * 208) / 256));
      break;
    }
    case 6: {
      const amplitude = sDexCryScreen.cryWaveformBuffer[10] & 0xff;
      SetCryMeterNeedleTarget(Math.trunc((amplitude * 208) / 256));
      break;
    }
  }
  if (sCryMeterNeedle.rotation === sCryMeterNeedle.targetRotation) {
    // aiguille arrivée
  } else if (sCryMeterNeedle.rotation < sCryMeterNeedle.targetRotation) {
    sCryMeterNeedle.rotation += sCryMeterNeedle.moveIncrement;
    if (sCryMeterNeedle.rotation > sCryMeterNeedle.targetRotation) {
      sCryMeterNeedle.rotation = sCryMeterNeedle.targetRotation;
      sCryMeterNeedle.targetRotation = 0;
    }
  } else {
    sCryMeterNeedle.rotation -= sCryMeterNeedle.moveIncrement;
    if (sCryMeterNeedle.rotation < sCryMeterNeedle.targetRotation) {
      sCryMeterNeedle.rotation = sCryMeterNeedle.targetRotation;
      sCryMeterNeedle.targetRotation = 0;
    }
  }
  // ObjAffineSet(xScale=256, yScale=256, rotation×256) → matrice rotation pure :
  // a = cos, b = -sin, c = sin, d = cos (gSineTable, période 256).
  const angle = sCryMeterNeedle.rotation & 0xff;
  const sin = gSineTable[angle];
  const cos = gSineTable[(angle + 64) & 0xff];
  SetOamMatrix(0, cos, -sin, sin, cos);
  const x = gSineTable[(sCryMeterNeedle.rotation + 0x7f) & 0xff];
  const y = gSineTable[(((sCryMeterNeedle.rotation + 0x7f) & 0xff) + 64)];
  sprite.x2 = Math.trunc((x * 24) / 256);
  sprite.y2 = Math.trunc((y * 24) / 256);
}

/** 1:1 `SetCryMeterNeedleTarget(s8 offset)`. */
function SetCryMeterNeedleTarget(offset: number): void {
  if (!sCryMeterNeedle) return;
  let rotation = (MIN_NEEDLE_POS - offset) & 0xff;
  // Min positif, max négatif (u8) : borne si hors plage.
  if (rotation > MIN_NEEDLE_POS && rotation < (MAX_NEEDLE_POS & 0xff)) rotation = MAX_NEEDLE_POS & 0xff;
  sCryMeterNeedle.targetRotation = (rotation << 24) >> 24;   // s8
  sCryMeterNeedle.moveIncrement = NEEDLE_MOVE_INCREMENT;
}
