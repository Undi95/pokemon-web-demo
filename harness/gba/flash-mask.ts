/**
 * harness/gba/flash-mask.ts — ADAPTATION HARNESS (hors 1:1, assumée).
 *
 * Le décomp fait la pénombre de grotte via WIN0 scanline (`SetFlashScanlineEffectWindow
 * Boundaries`, field_screen_effect.c) — le compositeur du port ne fait pas (encore) le
 * window scanline. On applique donc un masque circulaire noir en post-process sur le frame
 * buffer. Quand le compositeur supportera le WIN0 scanline, ceci sera remplacé par le vrai
 * chemin 1:1 dans `src/field_screen_effect.ts`.
 *
 * Donnée 1:1 = `sFlashLevelToRadius` (src/field_screen_effect.ts).
 */
import { sFlashLevelToRadius } from '../../src/field_screen_effect';

const SCREEN_W = 240;
const SCREEN_H = 160;
const CENTER_X = SCREEN_W / 2;  // = 120 (player toujours centré en field mode)
const CENTER_Y = SCREEN_H / 2;  // = 80

/** Lit le flash level current depuis globalThis (set par setflashlevel opcode). */
function _getFlashLevel(): number {
  const lvl = (globalThis as { gFlashLevel?: number }).gFlashLevel;
  return typeof lvl === 'number' ? lvl & 0xF : 0;
}

/** Applique le flash mask sur le frame buffer RGBA en place. Pixels hors du cercle → noir
 *  opaque. @returns true si un mask a été appliqué (= level > 0). */
export function applyFlashMask(frameBuffer: Uint8ClampedArray): boolean {
  const level = _getFlashLevel();
  if (level <= 0) return false;  // pleine vue, no mask
  // Gate OVERWORLD : le décomp tear-down le WIN0 flash en quittant le field, donc la pénombre
  // n'affecte PAS les menus/combat. En post-process on lit le CB2 courant : on n'applique le
  // masque QUE si l'overworld est actif (sinon party menu / combat en grotte assombrirait tout).
  const cb2name = (globalThis as { gMain?: { callback2?: { name?: string } } })
    .gMain?.callback2?.name ?? '';
  if (!cb2name.startsWith('MainCB2_Overworld')) return false;
  const radius = sFlashLevelToRadius[Math.min(level, 8)];
  if (radius >= 200) return false;  // rayon assez large pour couvrir tout l'écran
  const radiusSq = radius * radius;

  for (let y = 0; y < SCREEN_H; y++) {
    const dy = y - CENTER_Y;
    const dySq = dy * dy;
    for (let x = 0; x < SCREEN_W; x++) {
      const dx = x - CENTER_X;
      if (dx * dx + dySq > radiusSq) {
        const off = (y * SCREEN_W + x) * 4;
        frameBuffer[off] = 0;
        frameBuffer[off + 1] = 0;
        frameBuffer[off + 2] = 0;
        frameBuffer[off + 3] = 255;
      }
    }
  }
  return true;
}

// Auto-register sur globalThis pour que phaser-bridge l'utilise sans import cycle.
(globalThis as { __applyFlashMask?: typeof applyFlashMask }).__applyFlashMask = applyFlashMask;
