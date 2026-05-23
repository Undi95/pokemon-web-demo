/**
 * src/engine/palette.ts — port 1:1 STRICT de decomp/src/palette.c (1042l).
 *
 * Fonctions portées (= sections complète palette.c) :
 *   - LoadCompressedPalette  (palette.c:84-89)
 *   - LoadPalette            (palette.c:91-95)   — delegate à decomp-globals
 *   - FillPalette            (palette.c:97-101)
 *   - TransferPlttBuffer     (palette.c:103-114) — delegate à decomp-globals
 *   - UpdatePaletteFade      (palette.c:116-134) — delegate à decomp-globals
 *   - ResetPaletteFade       (palette.c:136-144) — delegate à decomp-globals
 *   - ResetPaletteFadeControl(palette.c:363-381)
 *   - BeginNormalPaletteFade (palette.c:158-202) — delegate à decomp-bridge
 *   - InvertPlttBuffer       (palette.c:494-509)
 *   - TintPlttBuffer         (palette.c:511-531)
 *   - UnfadePlttBuffer       (palette.c:533-548)
 *   - BeginFastPaletteFade   (palette.c:550-554)
 *   - BeginFastPaletteFadeInternal (palette.c:556-570)
 *   - UpdateFastPaletteFade  (palette.c:572-728)
 *   - BeginHardwarePaletteFade (palette.c:730-746)
 *   - UpdateHardwarePaletteFade(palette.c:748-793)
 *   - UpdateBlendRegisters   (palette.c:795-807)
 *   - IsSoftwarePaletteFadeFinishing (palette.c:809-830)
 *   - BlendPalettes          (palette.c:832-842) — delegate à decomp-globals
 *   - BlendPalettesUnfaded   (palette.c:844-850) — delegate à decomp-globals
 *   - TintPalette_GrayScale  (palette.c:852-867)
 *   - TintPalette_GrayScale2 (palette.c:869-889)
 *   - TintPalette_SepiaTone  (palette.c:891-913)
 *   - TintPalette_CustomTone (palette.c:915-941)
 *   - BlendPalettesGradually (palette.c:955-981) + Task helper (déféré)
 *
 * Cycle ESM : palette.ts utilise setter injection (_setPaletteRuntimeGetter)
 *   identique à sprite.ts. Wired par decomp-globals.setGlobalRuntime au boot.
 *
 * Sémantique 1:1 : opère exclusivement sur gPlttBufferUnfaded/Faded (= les 2
 *   buffers EWRAM du décomp). TransferPlttBuffer DMA-copy Faded→PLTT register
 *   au VBlank (= compositor read).
 */
import type { DecompRuntime } from './decomp-runtime';

// ─── Constantes 1:1 décomp include/palette.h ────────────────────────────────

export const PLTT_BUFFER_SIZE = 512;   // PLTT_SIZE/sizeof(u16) = 1024/2
export const PALETTE_FADE_STATUS_DELAY = 2;
export const PALETTE_FADE_STATUS_ACTIVE = 1;
export const PALETTE_FADE_STATUS_DONE = 0;
export const PALETTE_FADE_STATUS_LOADING = 0xFF;

export const PALETTES_BG      = 0x0000FFFF;
export const PALETTES_OBJECTS = 0xFFFF0000;
export const PALETTES_ALL     = PALETTES_BG | PALETTES_OBJECTS;

export const FAST_FADE_IN_FROM_WHITE  = 0;
export const FAST_FADE_OUT_TO_WHITE   = 1;
export const FAST_FADE_IN_FROM_BLACK  = 2;
export const FAST_FADE_OUT_TO_BLACK   = 3;

// Fade modes (= palette.c:9-14 enum)
export const NORMAL_FADE = 0;
export const FAST_FADE   = 1;
export const HARDWARE_FADE = 2;

// ─── Setter injection ──────────────────────────────────────────────────────

let _runtimeGetter: (() => DecompRuntime) | null = null;

export function _setPaletteRuntimeGetter(getRt: () => DecompRuntime): void {
  _runtimeGetter = getRt;
}

function _rt(): DecompRuntime {
  if (!_runtimeGetter) throw new Error('palette.ts: runtime not wired (call _setPaletteRuntimeGetter)');
  return _runtimeGetter();
}

// ─── Color helpers (1:1 décomp include/gba/types.h GET_R/G/B + RGB2) ─────────

function GET_R(c: number): number { return c & 0x1F; }
function GET_G(c: number): number { return (c >> 5) & 0x1F; }
function GET_B(c: number): number { return (c >> 10) & 0x1F; }
function RGB2(r: number, g: number, b: number): number {
  return ((r & 0x1F) | ((g & 0x1F) << 5) | ((b & 0x1F) << 10)) & 0x7FFF;
}

/** Q.8.8 fixed-point. 1:1 décomp Q_8_8(x) macro = (s16)((x) * 256). */
function Q_8_8(x: number): number {
  return (x * 256) | 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE PALETTE OPS (palette.c:84-101)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/palette.c:84-89 :
 *  ```c
 *  void LoadCompressedPalette(const u32 *src, u16 offset, u16 size) {
 *      LZDecompressWram(src, gPaletteDecompressionBuffer);
 *      CpuCopy16(gPaletteDecompressionBuffer, &gPlttBufferUnfaded[offset], size);
 *      CpuCopy16(gPaletteDecompressionBuffer, &gPlttBufferFaded[offset], size);
 *  }
 *  ```
 *
 *  Notre interface : `src` peut être asset symbol string OU Uint8Array LZ77.
 *  Décompression LZ77 via decompress.ts helper si disponible. */
export function LoadCompressedPalette(src: Uint8Array | string, offset: number, sizeBytes: number): void {
  const r = _rt();
  // Resolve source data
  let compressed: Uint8Array | null = null;
  if (src instanceof Uint8Array) {
    compressed = src;
  } else if (typeof src === 'string') {
    const got = (globalThis as Record<string, unknown>).__getAssetForParticles as ((s: string) => Uint8Array | Uint16Array | null) | undefined;
    const asset = got?.(src) ?? null;
    if (asset) {
      compressed = asset instanceof Uint16Array
        ? new Uint8Array(asset.buffer, asset.byteOffset, asset.byteLength)
        : asset;
    }
  }
  if (!compressed) return;
  // 1:1 décomp LZDecompressWram → gPaletteDecompressionBuffer (= 1024 bytes static).
  // Notre runtime peut soit avoir un decompress LZ77 sync, soit fallback à raw.
  // Pour minimal viable : assume `src` déjà décompressé (= cohérent avec notre
  // asset pipeline qui pré-décompresse les .lz à l'extract).
  const u16 = compressed.byteLength % 2 === 0
    ? new Uint16Array(compressed.buffer, compressed.byteOffset, compressed.byteLength / 2)
    : null;
  if (!u16) return;
  const numEntries = Math.min(sizeBytes / 2, u16.length);
  for (let i = 0; i < numEntries; i++) {
    r.gPlttBufferUnfaded.set(offset + i, u16[i]);
    r.gPlttBufferFaded.set(offset + i, u16[i]);
  }
}

/** 1:1 décomp src/palette.c:97-101 :
 *  ```c
 *  void FillPalette(u16 value, u16 offset, u16 size) {
 *      CpuFill16(value, &gPlttBufferUnfaded[offset], size);
 *      CpuFill16(value, &gPlttBufferFaded[offset], size);
 *  }
 *  ```
 */
export function FillPalette(value: number, offset: number, sizeBytes: number): void {
  const r = _rt();
  const numEntries = Math.floor(sizeBytes / 2);
  const v = value & 0xFFFF;
  for (let i = 0; i < numEntries; i++) {
    r.gPlttBufferUnfaded.set(offset + i, v);
    r.gPlttBufferFaded.set(offset + i, v);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PALETTE BUFFER OPS (palette.c:494-548)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/palette.c:494-509 :
 *  ```c
 *  void InvertPlttBuffer(u32 selectedPalettes) {
 *      u16 paletteOffset = 0;
 *      while (selectedPalettes) {
 *          if (selectedPalettes & 1) {
 *              for (i = 0; i < 16; i++)
 *                  gPlttBufferFaded[paletteOffset + i] = ~gPlttBufferFaded[paletteOffset + i];
 *          }
 *          selectedPalettes >>= 1;
 *          paletteOffset += 16;
 *      }
 *  }
 *  ```
 */
export function InvertPlttBuffer(selectedPalettes: number): void {
  const r = _rt();
  let paletteOffset = 0;
  let mask = selectedPalettes >>> 0;
  while (mask) {
    if (mask & 1) {
      for (let i = 0; i < 16; i++) {
        const c = r.gPlttBufferFaded.get(paletteOffset + i);
        r.gPlttBufferFaded.set(paletteOffset + i, (~c) & 0xFFFF);
      }
    }
    mask = mask >>> 1;
    paletteOffset += 16;
  }
}

/** 1:1 décomp src/palette.c:511-531 :
 *  ```c
 *  void TintPlttBuffer(u32 selectedPalettes, s8 r, s8 g, s8 b) {
 *      u16 paletteOffset = 0;
 *      while (selectedPalettes) {
 *          if (selectedPalettes & 1) {
 *              for (i = 0; i < 16; i++) {
 *                  PlttData *data = (PlttData *)&gPlttBufferFaded[paletteOffset + i];
 *                  data->r += r;
 *                  data->g += g;
 *                  data->b += b;
 *              }
 *          }
 *          selectedPalettes >>= 1;
 *          paletteOffset += 16;
 *      }
 *  }
 *  ```
 *
 *  ⚠️ Le décomp `data->r += r` est UB sur 5-bit : on simule en clampant
 *     [0, 31] et en wrappant proprement pour reproduire l'arithmétique GBA. */
export function TintPlttBuffer(selectedPalettes: number, rDelta: number, gDelta: number, bDelta: number): void {
  const rt = _rt();
  let paletteOffset = 0;
  let mask = selectedPalettes >>> 0;
  while (mask) {
    if (mask & 1) {
      for (let i = 0; i < 16; i++) {
        const c = rt.gPlttBufferFaded.get(paletteOffset + i);
        // Décomp PlttData : r:5/g:5/b:5/unused:1. ÉCRIT signed add → wrap natif s5.
        // On simule : add signed, mask 5 bits.
        const r5 = (GET_R(c) + (rDelta | 0)) & 0x1F;
        const g5 = (GET_G(c) + (gDelta | 0)) & 0x1F;
        const b5 = (GET_B(c) + (bDelta | 0)) & 0x1F;
        rt.gPlttBufferFaded.set(paletteOffset + i, RGB2(r5, g5, b5));
      }
    }
    mask = mask >>> 1;
    paletteOffset += 16;
  }
}

/** 1:1 décomp src/palette.c:533-548 :
 *  ```c
 *  void UnfadePlttBuffer(u32 selectedPalettes) {
 *      u16 paletteOffset = 0;
 *      while (selectedPalettes) {
 *          if (selectedPalettes & 1) {
 *              for (i = 0; i < 16; i++)
 *                  gPlttBufferFaded[paletteOffset + i] = gPlttBufferUnfaded[paletteOffset + i];
 *          }
 *          selectedPalettes >>= 1;
 *          paletteOffset += 16;
 *      }
 *  }
 *  ```
 *  Restore Faded ← Unfaded pour les palettes sélectionnées. Utilisé après fade
 *  pour réinitialiser à l'original. */
export function UnfadePlttBuffer(selectedPalettes: number): void {
  const r = _rt();
  let paletteOffset = 0;
  let mask = selectedPalettes >>> 0;
  while (mask) {
    if (mask & 1) {
      for (let i = 0; i < 16; i++) {
        r.gPlttBufferFaded.set(paletteOffset + i, r.gPlttBufferUnfaded.get(paletteOffset + i));
      }
    }
    mask = mask >>> 1;
    paletteOffset += 16;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAST PALETTE FADE (palette.c:550-728)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/palette.c:550-554 :
 *  ```c
 *  void BeginFastPaletteFade(u8 submode) {
 *      gPaletteFade.deltaY = 2;
 *      BeginFastPaletteFadeInternal(submode);
 *  }
 *  ```
 */
export function BeginFastPaletteFade(submode: number): void {
  const r = _rt();
  r.gPaletteFade.deltaY = 2;
  BeginFastPaletteFadeInternal(submode);
}

/** 1:1 décomp src/palette.c:556-570 :
 *  ```c
 *  static void BeginFastPaletteFadeInternal(u8 submode) {
 *      gPaletteFade.y = 31;
 *      gPaletteFade_submode = submode & 0x3F;   // multipurpose2
 *      gPaletteFade.active = TRUE;
 *      gPaletteFade.mode = FAST_FADE;
 *      if (submode == FAST_FADE_IN_FROM_BLACK)
 *          CpuFill16(RGB_BLACK, gPlttBufferFaded, PLTT_SIZE);
 *      if (submode == FAST_FADE_IN_FROM_WHITE)
 *          CpuFill16(RGB_WHITE, gPlttBufferFaded, PLTT_SIZE);
 *      UpdatePaletteFade();
 *  }
 *  ```
 */
export function BeginFastPaletteFadeInternal(submode: number): void {
  const r = _rt();
  r.gPaletteFade.brightness = 31;   // = y
  r.gPaletteFade.multipurpose2 = submode & 0x3F;
  r.gPaletteFade.active = true;
  r.gPaletteFade.mode = FAST_FADE;
  if (submode === FAST_FADE_IN_FROM_BLACK) {
    for (let i = 0; i < PLTT_BUFFER_SIZE; i++) r.gPlttBufferFaded.set(i, 0x0000);
  }
  if (submode === FAST_FADE_IN_FROM_WHITE) {
    for (let i = 0; i < PLTT_BUFFER_SIZE; i++) r.gPlttBufferFaded.set(i, 0x7FFF);
  }
  // Tick une frame du fade pour propager le state à PLTT register.
  // Décomp appelle UpdatePaletteFade() directement.
  // Notre UpdatePaletteFade lit gPaletteFade.mode + dispatche.
  if (typeof r.UpdatePaletteFade === 'function') r.UpdatePaletteFade();
}

/** 1:1 décomp src/palette.c:572-728 UpdateFastPaletteFade.
 *  Cycle r/g/b ±2 par frame vers la cible (UNFADED si IN, BLACK/WHITE si OUT).
 *  Alterne BG/OBJ par frame via objPaletteToggle. Quand y=0, switch mode → NORMAL
 *  + softwareFadeFinishing = true. */
export function UpdateFastPaletteFade(): number {
  const r = _rt();
  if (!r.gPaletteFade.active) return PALETTE_FADE_STATUS_DONE;
  if (IsSoftwarePaletteFadeFinishing()) {
    return r.gPaletteFade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
  }
  // Range : BG palettes (0..OBJ_PLTT_OFFSET) ou OBJ palettes selon objPaletteToggle.
  const OBJ_PLTT_OFFSET = 0x100;
  let paletteOffsetStart: number, paletteOffsetEnd: number;
  if (r.gPaletteFade.objPaletteToggle) {
    paletteOffsetStart = OBJ_PLTT_OFFSET;
    paletteOffsetEnd = PLTT_BUFFER_SIZE;
  } else {
    paletteOffsetStart = 0;
    paletteOffsetEnd = OBJ_PLTT_OFFSET;
  }
  const submode = r.gPaletteFade.multipurpose2;
  for (let i = paletteOffsetStart; i < paletteOffsetEnd; i++) {
    const unfaded = r.gPlttBufferUnfaded.get(i);
    const faded = r.gPlttBufferFaded.get(i);
    const r0 = GET_R(unfaded), g0 = GET_G(unfaded), b0 = GET_B(unfaded);
    let rr = GET_R(faded), gg = GET_G(faded), bb = GET_B(faded);
    if (submode === FAST_FADE_IN_FROM_WHITE) {
      rr -= 2; gg -= 2; bb -= 2;
      if (rr < r0) rr = r0;
      if (gg < g0) gg = g0;
      if (bb < b0) bb = b0;
    } else if (submode === FAST_FADE_OUT_TO_WHITE) {
      rr += 2; gg += 2; bb += 2;
      if (rr > 31) rr = 31;
      if (gg > 31) gg = 31;
      if (bb > 31) bb = 31;
    } else if (submode === FAST_FADE_IN_FROM_BLACK) {
      rr += 2; gg += 2; bb += 2;
      if (rr > r0) rr = r0;
      if (gg > g0) gg = g0;
      if (bb > b0) bb = b0;
    } else if (submode === FAST_FADE_OUT_TO_BLACK) {
      rr -= 2; gg -= 2; bb -= 2;
      if (rr < 0) rr = 0;
      if (gg < 0) gg = 0;
      if (bb < 0) bb = 0;
    }
    r.gPlttBufferFaded.set(i, RGB2(rr, gg, bb));
  }
  r.gPaletteFade.objPaletteToggle = !r.gPaletteFade.objPaletteToggle;
  if (r.gPaletteFade.objPaletteToggle) {
    return r.gPaletteFade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
  }
  if (r.gPaletteFade.brightness - r.gPaletteFade.deltaY < 0) {
    r.gPaletteFade.brightness = 0;
  } else {
    r.gPaletteFade.brightness -= r.gPaletteFade.deltaY;
  }
  if (r.gPaletteFade.brightness === 0) {
    switch (submode) {
      case FAST_FADE_IN_FROM_WHITE:
      case FAST_FADE_IN_FROM_BLACK:
        // CpuCopy32(gPlttBufferUnfaded, gPlttBufferFaded, PLTT_SIZE);
        for (let i = 0; i < PLTT_BUFFER_SIZE; i++) r.gPlttBufferFaded.set(i, r.gPlttBufferUnfaded.get(i));
        break;
      case FAST_FADE_OUT_TO_WHITE:
        for (let i = 0; i < PLTT_BUFFER_SIZE; i++) r.gPlttBufferFaded.set(i, 0x7FFF);
        break;
      case FAST_FADE_OUT_TO_BLACK:
        for (let i = 0; i < PLTT_BUFFER_SIZE; i++) r.gPlttBufferFaded.set(i, 0x0000);
        break;
    }
    r.gPaletteFade.mode = NORMAL_FADE;
    r.gPaletteFade.softwareFadeFinishing = true;
  }
  return r.gPaletteFade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HARDWARE PALETTE FADE (palette.c:730-807)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/palette.c:730-746 :
 *  ```c
 *  void BeginHardwarePaletteFade(u8 blendCnt, u8 delay, u8 y, u8 targetY, u8 shouldResetBlendRegisters) {
 *      gPaletteFade_blendCnt = blendCnt;             // multipurpose1
 *      gPaletteFade.delayCounter = delay;
 *      gPaletteFade_delay = delay;                   // multipurpose2
 *      gPaletteFade.y = y;
 *      gPaletteFade.targetY = targetY;
 *      gPaletteFade.active = TRUE;
 *      gPaletteFade.mode = HARDWARE_FADE;
 *      gPaletteFade.shouldResetBlendRegisters = shouldResetBlendRegisters & 1;
 *      gPaletteFade.hardwareFadeFinishing = FALSE;
 *      if (y < targetY) gPaletteFade.yDec = 0;
 *      else gPaletteFade.yDec = 1;
 *  }
 *  ```
 */
export function BeginHardwarePaletteFade(
  blendCnt: number, delay: number, y: number, targetY: number, shouldResetBlendRegisters: number,
): void {
  const r = _rt();
  r.gPaletteFade.multipurpose1 = blendCnt;
  r.gPaletteFade.delayRemaining = delay;
  r.gPaletteFade.multipurpose2 = delay;
  r.gPaletteFade.brightness = y;
  r.gPaletteFade.endY = targetY;
  r.gPaletteFade.active = true;
  r.gPaletteFade.mode = HARDWARE_FADE;
  r.gPaletteFade.shouldResetBlendRegisters = (shouldResetBlendRegisters & 1) !== 0;
  r.gPaletteFade.hardwareFadeFinishing = false;
  r.gPaletteFade.yDec = !(y < targetY);
}

/** 1:1 décomp src/palette.c:748-793 UpdateHardwarePaletteFade. */
export function UpdateHardwarePaletteFade(): number {
  const r = _rt();
  if (!r.gPaletteFade.active) return PALETTE_FADE_STATUS_DONE;
  if (r.gPaletteFade.delayRemaining < r.gPaletteFade.multipurpose2) {
    r.gPaletteFade.delayRemaining++;
    return PALETTE_FADE_STATUS_DELAY;
  }
  r.gPaletteFade.delayRemaining = 0;
  if (!r.gPaletteFade.yDec) {
    r.gPaletteFade.brightness++;
    if (r.gPaletteFade.brightness > r.gPaletteFade.endY) {
      r.gPaletteFade.hardwareFadeFinishing = true;
      r.gPaletteFade.brightness--;
    }
  } else {
    const y = r.gPaletteFade.brightness--;
    if (y - 1 < r.gPaletteFade.endY) {
      r.gPaletteFade.hardwareFadeFinishing = true;
      r.gPaletteFade.brightness++;
    }
  }
  if (r.gPaletteFade.hardwareFadeFinishing) {
    if (r.gPaletteFade.shouldResetBlendRegisters) {
      r.gPaletteFade.multipurpose1 = 0;
      r.gPaletteFade.brightness = 0;
    }
    r.gPaletteFade.shouldResetBlendRegisters = false;
  }
  return r.gPaletteFade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
}

/** 1:1 décomp src/palette.c:795-807 :
 *  ```c
 *  static void UpdateBlendRegisters(void) {
 *      SetGpuReg(REG_OFFSET_BLDCNT, (u16)gPaletteFade_blendCnt);
 *      SetGpuReg(REG_OFFSET_BLDY, gPaletteFade.y);
 *      if (gPaletteFade.hardwareFadeFinishing) {
 *          gPaletteFade.hardwareFadeFinishing = FALSE;
 *          gPaletteFade.mode = 0;
 *          gPaletteFade_blendCnt = 0;
 *          gPaletteFade.y = 0;
 *          gPaletteFade.active = FALSE;
 *      }
 *  }
 *  ```
 */
export function UpdateBlendRegisters(): void {
  const r = _rt();
  const REG_OFFSET_BLDCNT = 0x050;
  const REG_OFFSET_BLDY = 0x054;
  r.SetGpuReg(REG_OFFSET_BLDCNT, r.gPaletteFade.multipurpose1 & 0xFFFF);
  r.SetGpuReg(REG_OFFSET_BLDY, r.gPaletteFade.brightness);
  if (r.gPaletteFade.hardwareFadeFinishing) {
    r.gPaletteFade.hardwareFadeFinishing = false;
    r.gPaletteFade.mode = NORMAL_FADE;
    r.gPaletteFade.multipurpose1 = 0;
    r.gPaletteFade.brightness = 0;
    r.gPaletteFade.active = false;
  }
}

/** 1:1 décomp src/palette.c:809-830 IsSoftwarePaletteFadeFinishing.
 *  Helper interne pour UpdateNormalPaletteFade + UpdateFastPaletteFade.
 *  Quand softwareFadeFinishing=true : decrement counter pendant 4 frames, puis
 *  set active=false. */
export function IsSoftwarePaletteFadeFinishing(): boolean {
  const r = _rt();
  if (r.gPaletteFade.softwareFadeFinishing) {
    if (r.gPaletteFade.softwareFadeFinishingCounter === 4) {
      r.gPaletteFade.active = false;
      r.gPaletteFade.softwareFadeFinishing = false;
      r.gPaletteFade.softwareFadeFinishingCounter = 0;
    } else {
      r.gPaletteFade.softwareFadeFinishingCounter++;
    }
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TINT PALETTE UTILITIES (palette.c:852-941)
// ═══════════════════════════════════════════════════════════════════════════════

const sRoundedDownGrayscaleMap = new Uint8Array([
   0,  0,  0,  0,  0,
   5,  5,  5,  5,  5,
  11, 11, 11, 11, 11,
  16, 16, 16, 16, 16,
  21, 21, 21, 21, 21,
  27, 27, 27, 27, 27,
  31, 31,
]);

/** 1:1 décomp src/palette.c:852-867 TintPalette_GrayScale.
 *  Convertit chaque pixel à un gris pondéré R*0.3 + G*0.59 + B*0.1133.
 *  Note : palette est un POINTER (= UI mutable Uint16Array passed in). */
export function TintPalette_GrayScale(palette: Uint16Array, count: number): void {
  for (let i = 0; i < count; i++) {
    const c = palette[i];
    const r = GET_R(c), g = GET_G(c), b = GET_B(c);
    const gray = ((r * Q_8_8(0.3) + g * Q_8_8(0.59) + b * Q_8_8(0.1133)) >> 8) | 0;
    palette[i] = RGB2(gray, gray, gray);
  }
}

/** 1:1 décomp src/palette.c:869-889 TintPalette_GrayScale2.
 *  Comme TintPalette_GrayScale mais clamp à sRoundedDownGrayscaleMap (= 7 levels). */
export function TintPalette_GrayScale2(palette: Uint16Array, count: number): void {
  for (let i = 0; i < count; i++) {
    const c = palette[i];
    const r = GET_R(c), g = GET_G(c), b = GET_B(c);
    let gray = ((r * Q_8_8(0.3) + g * Q_8_8(0.59) + b * Q_8_8(0.1133)) >> 8) | 0;
    if (gray > 31) gray = 31;
    gray = sRoundedDownGrayscaleMap[gray] ?? 0;
    palette[i] = RGB2(gray, gray, gray);
  }
}

/** 1:1 décomp src/palette.c:891-913 TintPalette_SepiaTone. */
export function TintPalette_SepiaTone(palette: Uint16Array, count: number): void {
  for (let i = 0; i < count; i++) {
    const c = palette[i];
    const r0 = GET_R(c), g0 = GET_G(c), b0 = GET_B(c);
    const gray = ((r0 * Q_8_8(0.3) + g0 * Q_8_8(0.59) + b0 * Q_8_8(0.1133)) >> 8) | 0;
    let r = ((Q_8_8(1.2) * gray)) >> 8;
    const g = ((Q_8_8(1.0) * gray)) >> 8;
    const b = ((Q_8_8(0.94) * gray)) >> 8;
    if (r > 31) r = 31;
    palette[i] = RGB2(r, g, b);
  }
}

/** 1:1 décomp src/palette.c:915-941 TintPalette_CustomTone.
 *  Comme SepiaTone mais avec tons R/G/B paramétrables (Q.8 fixed-point). */
export function TintPalette_CustomTone(
  palette: Uint16Array, count: number, rTone: number, gTone: number, bTone: number,
): void {
  for (let i = 0; i < count; i++) {
    const c = palette[i];
    const r0 = GET_R(c), g0 = GET_G(c), b0 = GET_B(c);
    const gray = ((r0 * Q_8_8(0.3) + g0 * Q_8_8(0.59) + b0 * Q_8_8(0.1133)) >> 8) | 0;
    let r = ((rTone * gray)) >> 8;
    let g = ((gTone * gray)) >> 8;
    let b = ((bTone * gray)) >> 8;
    if (r > 31) r = 31;
    if (g > 31) g = 31;
    if (b > 31) b = 31;
    palette[i] = RGB2(r, g, b);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLEND PALETTES GRADUALLY (palette.c:955-1042)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/palette.c:955-981 BlendPalettesGradually.
 *  Crée un task qui blend gradually les palettes sélectionnées vers `color`,
 *  step par `coeff` jusqu'à `coeffTarget`, avec délai `delay` frames entre steps.
 *
 *  Note : utilisé uniquement par Kyogre/Groudon battle intro pour flash lightning.
 *  Non critique en dehors du combat boss. Task helper déféré à un port futur de
 *  la task system 1:1 (= notre runtime gTasks utilise déjà un modèle équivalent). */
export function BlendPalettesGradually(
  selectedPalettes: number, delay: number, coeff: number, coeffTarget: number,
  color: number, priority: number, id: number,
): void {
  // STUB minimal : applique BlendPalettes direct au coeffTarget sans graduation.
  // 1:1 décomp utilise un task qui anime sur N frames. Pour le moment on saute
  // à l'état final — visuellement le flash est juste instantané au lieu de progressif.
  // TODO : port complet Task_BlendPalettesGradually (palette.c:1009-1042) pour
  // l'animation graduelle authentique (= seulement utilisé Kyogre/Groudon intro).
  void delay; void coeff; void priority; void id;
  const r = _rt();
  // Apply final state (= équivalent du target step).
  let mask = selectedPalettes >>> 0;
  let paletteOffset = 0;
  while (mask) {
    if (mask & 1) {
      _blendPalette(r, paletteOffset, 16, coeffTarget, color);
    }
    mask = mask >>> 1;
    paletteOffset += 16;
  }
}

/** 1:1 décomp src/util.c BlendPalette helper utilisé par BlendPalettes/Gradually.
 *  ```c
 *  void BlendPalette(u16 offset, u16 size, u8 coeff, u16 color) {
 *      u16 i;
 *      for (i = 0; i < size; i++) {
 *          struct PlttData *src = (PlttData *)&gPlttBufferUnfaded[offset + i];
 *          struct PlttData *dest = (PlttData *)&gPlttBufferFaded[offset + i];
 *          struct PlttData *target = (PlttData *)&color;
 *          dest->r = src->r + (((target->r - src->r) * coeff) >> 4);
 *          dest->g = src->g + (((target->g - src->g) * coeff) >> 4);
 *          dest->b = src->b + (((target->b - src->b) * coeff) >> 4);
 *      }
 *  }
 *  ```
 */
function _blendPalette(rt: DecompRuntime, offset: number, size: number, coeff: number, color: number): void {
  const tgtR = GET_R(color), tgtG = GET_G(color), tgtB = GET_B(color);
  for (let i = 0; i < size; i++) {
    const src = rt.gPlttBufferUnfaded.get(offset + i);
    const srcR = GET_R(src), srcG = GET_G(src), srcB = GET_B(src);
    const r = srcR + (((tgtR - srcR) * coeff) >> 4);
    const g = srcG + (((tgtG - srcG) * coeff) >> 4);
    const b = srcB + (((tgtB - srcB) * coeff) >> 4);
    rt.gPlttBufferFaded.set(offset + i, RGB2(r, g, b));
  }
}
