/**
 * palette_util.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/palette_util.c`
 * (503 l, 19 fns). Transpilé puis REVU À LA MAIN (bitfields → masques explicites).
 *
 * « "RouletteFlash" is more accurately a general flashing/fading util » :
 * fade/flash des palettes de la Roulette + « pulse blend » de la Tour Mirage.
 *
 * Adaptations revue (sémantique C exacte, cf. include/palette_util.h) :
 *  - `struct PlttData` (bitfield r:5/g:5/b:5 réinterprété sur u16) → décompose/
 *    recompose via GET_R/G/B + RGB2 (palette.ts).
 *  - Compteurs u8 (`--delayCounter == 0xFF`) → `(x - 1) & 0xFF`.
 *  - `blendCoeff` u4 (bitfield :4) → masque & 0xF aux inc/dec (wrap 1:1).
 *  - memset/memcpy de structs → objets zéro / spread.
 *  - Les structs sont allouées par les CONSOMMATEURS (roulette.c EWRAM,
 *    mirage_tower.c) → factories `createRouletteFlashUtil()`/`createPulseBlend()`
 *    exportées pour eux.
 */

import { GET_R, GET_G, GET_B, RGB2, gPaletteFade, gPlttBufferFaded, gPlttBufferUnfaded } from './palette';
import { BlendPalette } from '../harness/runtime/decomp-globals';

// ─── Structs 1:1 include/palette_util.h ──────────────────────────────────────

/** 1:1 `struct PulseBlendSettings` (palette_util.h:4-15). */
export interface PulseBlendSettings {
  blendColor: number;
  paletteOffset: number;
  numColors: number;
  delay: number;
  numFadeCycles: number;
  maxBlendCoeff: number;        // :4 (s8)
  fadeType: number;             // :2
  restorePaletteOnUnload: number; // :1
  unk7_7: number;               // :1
}

/** 1:1 `struct PulseBlendPalette` (palette_util.h:17-28). */
export interface PulseBlendPalette {
  paletteSelector: number;
  blendCoeff: number;           // :4 (u8) — wrap & 0xF
  fadeDirection: number;        // :1
  unk1_5: number;               // :1
  available: number;            // :1
  inUse: number;                // :1 (u32)
  delayCounter: number;         // u8
  fadeCycleCounter: number;     // u8
  pulseBlendSettings: PulseBlendSettings;
}

/** 1:1 `struct PulseBlend` (palette_util.h:30-34). */
export interface PulseBlend {
  usedPulseBlendPalettes: number;
  pulseBlendPalettes: PulseBlendPalette[]; // [16]
}

/** 1:1 `FLASHUTIL_USE_EXISTING_COLOR` (palette_util.h:37). */
export const FLASHUTIL_USE_EXISTING_COLOR = 1 << 15;

/** 1:1 `struct RouletteFlashSettings` (palette_util.h:39-49). */
export interface RouletteFlashSettings {
  color: number;
  paletteOffset: number;
  numColors: number;
  delay: number;
  unk6: number;                 // Set but never used
  numFadeCycles: number;        // :5 (s8)
  unk7_5: number;               // :2 — Set but never used
  colorDeltaDir: number;        // :1 (s8)
}

/** 1:1 `struct RouletteFlashPalette` (palette_util.h:51-59). */
export interface RouletteFlashPalette {
  state: number;                // :7
  available: number;            // :1 (bool8)
  delayCounter: number;         // u8
  fadeCycleCounter: number;     // s8
  colorDelta: number;           // s8
  settings: RouletteFlashSettings;
}

/** 1:1 `struct RouletteFlashUtil` (palette_util.h:61-67). */
export interface RouletteFlashUtil {
  enabled: number;
  unused: number;
  flags: number;
  palettes: RouletteFlashPalette[]; // [16]
}

// ─── Factories zéro (allocation côté consommateurs : roulette/mirage_tower) ──

const zeroRouletteFlashSettings = (): RouletteFlashSettings =>
  ({ color: 0, paletteOffset: 0, numColors: 0, delay: 0, unk6: 0, numFadeCycles: 0, unk7_5: 0, colorDeltaDir: 0 });
const zeroRouletteFlashPalette = (): RouletteFlashPalette =>
  ({ state: 0, available: 0, delayCounter: 0, fadeCycleCounter: 0, colorDelta: 0, settings: zeroRouletteFlashSettings() });
export const createRouletteFlashUtil = (): RouletteFlashUtil =>
  ({ enabled: 0, unused: 0, flags: 0, palettes: Array.from({ length: 16 }, zeroRouletteFlashPalette) });

const zeroPulseBlendSettings = (): PulseBlendSettings =>
  ({ blendColor: 0, paletteOffset: 0, numColors: 0, delay: 0, numFadeCycles: 0, maxBlendCoeff: 0, fadeType: 0, restorePaletteOnUnload: 0, unk7_7: 0 });
const zeroPulseBlendPalette = (): PulseBlendPalette =>
  ({ paletteSelector: 0, blendCoeff: 0, fadeDirection: 0, unk1_5: 0, available: 0, inUse: 0, delayCounter: 0, fadeCycleCounter: 0, pulseBlendSettings: zeroPulseBlendSettings() });
export const createPulseBlend = (): PulseBlend =>
  ({ usedPulseBlendPalettes: 0, pulseBlendPalettes: Array.from({ length: 16 }, zeroPulseBlendPalette) });

// ─── RouletteFlash (palette_util.c:10-215) ───────────────────────────────────

/** 1:1 `void RouletteFlash_Reset(struct RouletteFlashUtil *flash)` (:10-15). */
export function RouletteFlash_Reset(flash: RouletteFlashUtil): void {
  flash.enabled = 0;
  flash.flags = 0;
  // memset(&flash->palettes, 0, sizeof)
  for (let i = 0; i < 16; i++) flash.palettes[i] = zeroRouletteFlashPalette();
}

/** 1:1 `u8 RouletteFlash_Add(struct RouletteFlashUtil *flash, u8 id, const struct RouletteFlashSettings *settings)` (:17-40). */
export function RouletteFlash_Add(flash: RouletteFlashUtil, id: number, settings: RouletteFlashSettings): number {
  if (id >= flash.palettes.length || flash.palettes[id].available)
    return 0xFF;

  flash.palettes[id].settings.color = settings.color;
  flash.palettes[id].settings.paletteOffset = settings.paletteOffset;
  flash.palettes[id].settings.numColors = settings.numColors;
  flash.palettes[id].settings.delay = settings.delay;
  flash.palettes[id].settings.unk6 = settings.unk6;
  flash.palettes[id].settings.numFadeCycles = settings.numFadeCycles;
  flash.palettes[id].settings.unk7_5 = settings.unk7_5;
  flash.palettes[id].settings.colorDeltaDir = settings.colorDeltaDir;
  flash.palettes[id].state = 0;
  flash.palettes[id].available = 1; // TRUE
  flash.palettes[id].fadeCycleCounter = 0;
  flash.palettes[id].delayCounter = 0;
  if (flash.palettes[id].settings.colorDeltaDir < 0)
    flash.palettes[id].colorDelta = -1;
  else
    flash.palettes[id].colorDelta = 1;

  return id;
}

/** 1:1 `static u8 RouletteFlash_Remove(struct RouletteFlashUtil *flash, u8 id)` (:42-51) — UNUSED décomp. */
function RouletteFlash_Remove(flash: RouletteFlashUtil, id: number): number {
  if (id >= flash.palettes.length)
    return 0xFF;
  if (!flash.palettes[id].available)
    return 0xFF;

  flash.palettes[id] = zeroRouletteFlashPalette(); // memset(&flash->palettes[id], 0, sizeof)
  return id;
}
void RouletteFlash_Remove; // UNUSED (décomp)

/** 1:1 `static u8 RouletteFlash_FadePalette(struct RouletteFlashPalette *pal)` (:53-112).
 *  Revue : `struct PlttData*` sur gPlttBuffer* → décompose GET_R/G/B, recompose RGB2. */
function RouletteFlash_FadePalette(pal: RouletteFlashPalette): number {
  let returnval = 0;

  for (let i = 0; i < pal.settings.numColors; i++) {
    const idx = pal.settings.paletteOffset + i;
    const faded = gPlttBufferFaded[idx] as number;
    const unfaded = gPlttBufferUnfaded[idx] as number;
    let r = GET_R(faded), g = GET_G(faded), b = GET_B(faded);
    const ur = GET_R(unfaded), ug = GET_G(unfaded), ub = GET_B(unfaded);

    switch (pal.state) {
      case 1:
        // Fade color
        if (r + pal.colorDelta >= 0 && r + pal.colorDelta < 32) r += pal.colorDelta;
        if (g + pal.colorDelta >= 0 && g + pal.colorDelta < 32) g += pal.colorDelta;
        if (b + pal.colorDelta >= 0 && b + pal.colorDelta < 32) b += pal.colorDelta;
        break;
      case 2:
        // Fade back to original color
        if (pal.colorDelta < 0) {
          if (r + pal.colorDelta >= ur) r += pal.colorDelta;
          if (g + pal.colorDelta >= ug) g += pal.colorDelta;
          if (b + pal.colorDelta >= ub) b += pal.colorDelta;
        } else {
          if (r + pal.colorDelta <= ur) r += pal.colorDelta;
          if (g + pal.colorDelta <= ug) g += pal.colorDelta;
          if (b + pal.colorDelta <= ub) b += pal.colorDelta;
        }
        break;
    }
    gPlttBufferFaded[idx] = RGB2(r, g, b);
  }

  // 1:1 `if ((u32)pal->fadeCycleCounter++ != pal->settings.numFadeCycles)`
  const oldCounter = pal.fadeCycleCounter;
  pal.fadeCycleCounter = (pal.fadeCycleCounter + 1) & 0xFF;
  if ((oldCounter >>> 0) !== pal.settings.numFadeCycles) {
    returnval = 0;
  } else {
    pal.fadeCycleCounter = 0;
    pal.colorDelta *= -1;
    if (pal.state === 1) pal.state++;
    else pal.state--;
    returnval = 1;
  }
  return returnval;
}

/** 1:1 `static u8 RouletteFlash_FlashPalette(struct RouletteFlashPalette *pal)` (:114-133). */
function RouletteFlash_FlashPalette(pal: RouletteFlashPalette): number {
  let i = 0;
  switch (pal.state) {
    case 1:
      // Flash to color
      for (; i < pal.settings.numColors; i++)
        gPlttBufferFaded[pal.settings.paletteOffset + i] = pal.settings.color;
      pal.state++;
      break;
    case 2:
      // Restore to original color
      for (; i < pal.settings.numColors; i++)
        gPlttBufferFaded[pal.settings.paletteOffset + i] = gPlttBufferUnfaded[pal.settings.paletteOffset + i] as number;
      pal.state--;
      break;
  }
  return 1;
}

/** 1:1 `void RouletteFlash_Run(struct RouletteFlashUtil *flash)` (:135-157).
 *  Revue : `--delayCounter == (u8)-1` → wrap u8 explicite. */
export function RouletteFlash_Run(flash: RouletteFlashUtil): void {
  if (flash.enabled) {
    for (let i = 0; i < 16; i++) {
      if ((flash.flags >> i) & 1) {
        flash.palettes[i].delayCounter = (flash.palettes[i].delayCounter - 1) & 0xFF;
        if (flash.palettes[i].delayCounter === 0xFF) {
          if (flash.palettes[i].settings.color & FLASHUTIL_USE_EXISTING_COLOR)
            RouletteFlash_FadePalette(flash.palettes[i]);
          else
            RouletteFlash_FlashPalette(flash.palettes[i]);

          flash.palettes[i].delayCounter = flash.palettes[i].settings.delay;
        }
      }
    }
  }
}

/** 1:1 `void RouletteFlash_Enable(struct RouletteFlashUtil *flash, u16 flags)` (:159-175). */
export function RouletteFlash_Enable(flash: RouletteFlashUtil, flags: number): void {
  flash.enabled = (flash.enabled + 1) & 0xFF;
  for (let i = 0; i < 16; i++) {
    if ((flags >> i) & 1) {
      if (flash.palettes[i].available) {
        flash.flags |= 1 << i;
        flash.palettes[i].state = 1;
      }
    }
  }
}

/** 1:1 `void RouletteFlash_Stop(struct RouletteFlashUtil *flash, u16 flags)` (:177-215).
 *  Revue : memcpy faded←unfaded (numColors*2 octets) → boucle numColors entrées u16. */
export function RouletteFlash_Stop(flash: RouletteFlashUtil, flags: number): void {
  for (let i = 0; i < 16; i++) {
    if ((flash.flags >> i) & 1) {
      if (flash.palettes[i].available) {
        if ((flags >> i) & 1) {
          const offset = flash.palettes[i].settings.paletteOffset;
          for (let j = 0; j < flash.palettes[i].settings.numColors; j++)
            gPlttBufferFaded[offset + j] = gPlttBufferUnfaded[offset + j] as number;
          flash.palettes[i].state = 0;
          flash.palettes[i].fadeCycleCounter = 0;
          flash.palettes[i].delayCounter = 0;
          if (flash.palettes[i].settings.colorDeltaDir < 0)
            flash.palettes[i].colorDelta = -1;
          else
            flash.palettes[i].colorDelta = 1;
        }
      }
    }
  }

  if (flags === 0xFFFF) {
    // Stopped all
    flash.enabled = 0;
    flash.flags = 0;
  } else {
    flash.flags &= ~flags;
  }
}

// ─── PulseBlend (Tour Mirage — palette_util.c:217-438) ──────────────────────

/** 1:1 `void InitPulseBlend(struct PulseBlend *pulseBlend)` (:217-224). */
export function InitPulseBlend(pulseBlend: PulseBlend): void {
  pulseBlend.usedPulseBlendPalettes = 0;
  for (let i = 0; i < 16; i++) {
    pulseBlend.pulseBlendPalettes[i] = zeroPulseBlendPalette(); // memset
    pulseBlend.pulseBlendPalettes[i].paletteSelector = i;
  }
}

/** 1:1 `int InitPulseBlendPaletteSettings(struct PulseBlend *pulseBlend, const struct PulseBlendSettings *settings)` (:226-258). */
export function InitPulseBlendPaletteSettings(pulseBlend: PulseBlend, settings: PulseBlendSettings): number {
  let i = 0;
  let pulseBlendPalette: PulseBlendPalette | null = null;

  if (!pulseBlend.pulseBlendPalettes[0].inUse) {
    pulseBlendPalette = pulseBlend.pulseBlendPalettes[0];
  } else {
    while (++i < 16) {
      if (!pulseBlend.pulseBlendPalettes[i].inUse) {
        pulseBlendPalette = pulseBlend.pulseBlendPalettes[i];
        break;
      }
    }
  }

  if (pulseBlendPalette == null)
    return 0xFF;

  pulseBlendPalette.blendCoeff = 0;
  pulseBlendPalette.fadeDirection = 0;
  pulseBlendPalette.available = 1;
  pulseBlendPalette.inUse = 1;
  pulseBlendPalette.delayCounter = 0;
  pulseBlendPalette.fadeCycleCounter = 0;
  pulseBlendPalette.pulseBlendSettings = { ...settings }; // memcpy
  return i;
}

/** 1:1 `static void ClearPulseBlendPalettesSettings(struct PulseBlendPalette *pulseBlendPalette)` (:260-278). */
function ClearPulseBlendPalettesSettings(pulseBlendPalette: PulseBlendPalette): void {
  if (!pulseBlendPalette.available && pulseBlendPalette.pulseBlendSettings.restorePaletteOnUnload) {
    for (let i = pulseBlendPalette.pulseBlendSettings.paletteOffset;
      i < pulseBlendPalette.pulseBlendSettings.paletteOffset + pulseBlendPalette.pulseBlendSettings.numColors; i++)
      gPlttBufferFaded[i] = gPlttBufferUnfaded[i] as number;
  }

  pulseBlendPalette.pulseBlendSettings = zeroPulseBlendSettings(); // memset
  pulseBlendPalette.blendCoeff = 0;
  pulseBlendPalette.fadeDirection = 0;
  pulseBlendPalette.unk1_5 = 0;
  pulseBlendPalette.available = 1;
  pulseBlendPalette.inUse = 0;
  pulseBlendPalette.fadeCycleCounter = 0;
  pulseBlendPalette.delayCounter = 0;
}

/** 1:1 `void UnloadUsedPulseBlendPalettes(struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection)` (:280-298). */
export function UnloadUsedPulseBlendPalettes(pulseBlend: PulseBlend, pulseBlendPaletteSelector: number, multiSelection: number): void {
  if (!multiSelection) {
    ClearPulseBlendPalettesSettings(pulseBlend.pulseBlendPalettes[pulseBlendPaletteSelector & 0xF]);
  } else {
    for (let i = 0; i < 16; i++) {
      if ((pulseBlendPaletteSelector & 1) && pulseBlend.pulseBlendPalettes[i].inUse)
        ClearPulseBlendPalettesSettings(pulseBlend.pulseBlendPalettes[i]);

      pulseBlendPaletteSelector >>= 1;
    }
  }
}

/** 1:1 `void MarkUsedPulseBlendPalettes(struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection)` (:300-325). */
export function MarkUsedPulseBlendPalettes(pulseBlend: PulseBlend, pulseBlendPaletteSelector: number, multiSelection: number): void {
  let i = 0;

  if (!multiSelection) {
    i = pulseBlendPaletteSelector & 0xF;
    pulseBlend.pulseBlendPalettes[i].available = 0;
    pulseBlend.usedPulseBlendPalettes |= 1 << i;
  } else {
    for (i = 0; i < 16; i++) {
      if (!(pulseBlendPaletteSelector & 1) || !pulseBlend.pulseBlendPalettes[i].inUse || !pulseBlend.pulseBlendPalettes[i].available) {
        pulseBlendPaletteSelector = (pulseBlendPaletteSelector << 1) & 0xFFFF; // u16
      } else {
        pulseBlend.pulseBlendPalettes[i].available = 0;
        pulseBlend.usedPulseBlendPalettes |= 1 << i;
      }
    }
  }
}

/** 1:1 `void UnmarkUsedPulseBlendPalettes(struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection)` (:327-370).
 *  NB fidèle ROM : la branche single utilise `j` (=0) pour le clear du bitmask —
 *  quirk conservé (efface toujours le bit 0, pas le bit du selector). */
export function UnmarkUsedPulseBlendPalettes(pulseBlend: PulseBlend, pulseBlendPaletteSelector: number, multiSelection: number): void {
  let pulseBlendPalette: PulseBlendPalette;
  const j = 0;

  if (!multiSelection) {
    pulseBlendPalette = pulseBlend.pulseBlendPalettes[pulseBlendPaletteSelector & 0xF];
    if (!pulseBlendPalette.available && pulseBlendPalette.inUse) {
      if (pulseBlendPalette.pulseBlendSettings.restorePaletteOnUnload) {
        for (let i = pulseBlendPalette.pulseBlendSettings.paletteOffset;
          i < pulseBlendPalette.pulseBlendSettings.paletteOffset + pulseBlendPalette.pulseBlendSettings.numColors; i++)
          gPlttBufferFaded[i] = gPlttBufferUnfaded[i] as number;
      }

      pulseBlendPalette.available = 1;
      pulseBlend.usedPulseBlendPalettes &= ~(1 << j);
    }
  } else {
    for (let jj = 0; jj < 16; jj++) {
      pulseBlendPalette = pulseBlend.pulseBlendPalettes[jj];
      if (!(pulseBlendPaletteSelector & 1) || pulseBlendPalette.available || !pulseBlendPalette.inUse) {
        pulseBlendPaletteSelector = (pulseBlendPaletteSelector << 1) & 0xFFFF; // u16
      } else {
        if (pulseBlendPalette.pulseBlendSettings.restorePaletteOnUnload) {
          for (let i = pulseBlendPalette.pulseBlendSettings.paletteOffset;
            i < pulseBlendPalette.pulseBlendSettings.paletteOffset + pulseBlendPalette.pulseBlendSettings.numColors; i++)
            gPlttBufferFaded[i] = gPlttBufferUnfaded[i] as number;
        }

        pulseBlendPalette.available = 1;
        pulseBlend.usedPulseBlendPalettes &= ~(1 << jj);
      }
    }
  }
}

/** 1:1 `void UpdatePulseBlend(struct PulseBlend *pulseBlend)` (:372-438).
 *  Revue : `--delayCounter == 0xFF` → wrap u8 ; blendCoeff u4 → & 0xF ;
 *  case 0 = bug ROM documenté (jamais atteint en vanilla) transcrit tel quel. */
export function UpdatePulseBlend(pulseBlend: PulseBlend): void {
  if (pulseBlend.usedPulseBlendPalettes) {
    for (let i = 0; i < 16; i++) {
      const pulseBlendPalette = pulseBlend.pulseBlendPalettes[i];
      if ((!pulseBlendPalette.available && pulseBlendPalette.inUse)
        && (!(gPaletteFade.active as boolean) || !pulseBlendPalette.pulseBlendSettings.unk7_7)) {
        pulseBlendPalette.delayCounter = (pulseBlendPalette.delayCounter - 1) & 0xFF;
        if (pulseBlendPalette.delayCounter === 0xFF) {
          pulseBlendPalette.delayCounter = pulseBlendPalette.pulseBlendSettings.delay;
          BlendPalette(pulseBlendPalette.pulseBlendSettings.paletteOffset, pulseBlendPalette.pulseBlendSettings.numColors,
            pulseBlendPalette.blendCoeff, pulseBlendPalette.pulseBlendSettings.blendColor);
          switch (pulseBlendPalette.pulseBlendSettings.fadeType) {
            case 0: {
              // Fade all the way to the max blend amount, then wrap around
              // BUG ROM (documenté décomp) : comparaison u4/s4 jamais vraie pour
              // maxBlendCoeff >= 8 — jamais atteint en vanilla, transcrit tel quel.
              const old = pulseBlendPalette.blendCoeff;
              pulseBlendPalette.blendCoeff = (pulseBlendPalette.blendCoeff + 1) & 0xF;
              if (old === pulseBlendPalette.pulseBlendSettings.maxBlendCoeff) {
                pulseBlendPalette.fadeCycleCounter = (pulseBlendPalette.fadeCycleCounter + 1) & 0xFF;
                pulseBlendPalette.blendCoeff = 0;
              }
              break;
            }
            case 1: // Fade in and out
              if (pulseBlendPalette.fadeDirection) {
                pulseBlendPalette.blendCoeff = (pulseBlendPalette.blendCoeff - 1) & 0xF;
                if (pulseBlendPalette.blendCoeff === 0) {
                  pulseBlendPalette.fadeCycleCounter = (pulseBlendPalette.fadeCycleCounter + 1) & 0xFF;
                  pulseBlendPalette.fadeDirection ^= 1;
                }
              } else {
                const max = (pulseBlendPalette.pulseBlendSettings.maxBlendCoeff - 1) & 0xF;
                const old = pulseBlendPalette.blendCoeff;
                pulseBlendPalette.blendCoeff = (pulseBlendPalette.blendCoeff + 1) & 0xF;
                if (old === max) {
                  pulseBlendPalette.fadeCycleCounter = (pulseBlendPalette.fadeCycleCounter + 1) & 0xFF;
                  pulseBlendPalette.fadeDirection ^= 1;
                }
              }
              break;
            case 2: // Flip back and forth — never reached in vanilla
              if (pulseBlendPalette.fadeDirection)
                pulseBlendPalette.blendCoeff = 0;
              else
                pulseBlendPalette.blendCoeff = pulseBlendPalette.pulseBlendSettings.maxBlendCoeff & 0xF;

              pulseBlendPalette.fadeDirection ^= 1;
              pulseBlendPalette.fadeCycleCounter = (pulseBlendPalette.fadeCycleCounter + 1) & 0xFF;
              break;
          }

          if (pulseBlendPalette.pulseBlendSettings.numFadeCycles !== 0xFF
            && pulseBlendPalette.fadeCycleCounter === pulseBlendPalette.pulseBlendSettings.numFadeCycles)
            UnmarkUsedPulseBlendPalettes(pulseBlend, pulseBlendPalette.paletteSelector, 0);
        }
      }
    }
  }
}

// ─── Tilemap utils (Roulette grid — palette_util.c:440-503) ─────────────────

/** 1:1 `void FillTilemapRect(u16 *dest, u16 value, u8 left, u8 top, u8 width, u8 height)`
 *  (:441-454). Revue : `dest = &dest[top*32+left]` + `*_dest++ = value` → base + index. */
export function FillTilemapRect(dest: Uint16Array, value: number, left: number, top: number, width: number, height: number): void {
  const base = top * 32 + left;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++)
      dest[base + i * 32 + j] = value;
  }
}

/** 1:1 `void SetTilemapRect(u16 *dest, u16 *src, u8 left, u8 top, u8 width, u8 height)`
 *  (:456-470). Revue : `*_dest++ = *_src++` (src LINÉAIRE, dest rectangulaire). */
export function SetTilemapRect(dest: Uint16Array, src: Uint16Array, left: number, top: number, width: number, height: number): void {
  const base = top * 32 + left;
  let s = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++)
      dest[base + i * 32 + j] = src[s++];
  }
}

/** 1:1 `static void FillTilemapRect_Unused(void *dest, u16 value, u8 left, u8 top, u8 width, u8 height)`
 *  (:472-486). Revue : offset OCTETS `y*64 + x*2` → index u16 `y*32 + x` ; wrap % 32 conservé. */
function FillTilemapRect_Unused(dest: Uint16Array, value: number, left: number, top: number, width: number, height: number): void {
  let y = top;
  for (let i = 0; i < height; i++) {
    let x = left;
    for (let j = 0; j < width; j++) {
      dest[y * 32 + x] = value;
      x = (x + 1) % 32;
    }
    y = (y + 1) % 32;
  }
}
void FillTilemapRect_Unused; // UNUSED (décomp)

/** 1:1 `static void SetTilemapRect_Unused(void *dest, const u16 *src, u8 left, u8 top, u8 width, u8 height)`
 *  (:488-503). Même adaptation ; src linéaire. */
function SetTilemapRect_Unused(dest: Uint16Array, src: Uint16Array, left: number, top: number, width: number, height: number): void {
  let s = 0;
  let y = top;
  for (let i = 0; i < height; i++) {
    let x = left;
    for (let j = 0; j < width; j++) {
      dest[y * 32 + x] = src[s++];
      x = (x + 1) % 32;
    }
    y = (y + 1) % 32;
  }
}
void SetTilemapRect_Unused; // UNUSED (décomp)
