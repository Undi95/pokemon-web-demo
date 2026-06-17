/**
 * flash-mask.ts — Cave darkness mask 1:1 décomp `fldeff_flash.c` +
 * `field_screen_effect.c:sFlashLevelToRadius`.
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_screen_effect.c:53`
 *     `static const u16 sFlashLevelToRadius[] = { 200, 72, 64, 56, 48, 40, 32, 24, 0 };`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/fldeff_flash.c` (UpdateFlashLevelEffect)
 *
 * Concept GBA original :
 *   - Niveau de flash 0..8 (= ASTUCE FLASH HM appliquée 0 fois → 8 fois).
 *   - Rayon en pixels selon niveau (200 = pleine vue, 0 = pitch black).
 *   - WIN0 hardware register écrit par-scanline pour former un cercle autour du
 *     centre écran (= player toujours centré). Pixels DANS le cercle : tous les
 *     layers visibles. Pixels HORS : backdrop only = noir.
 *
 * Notre port (postprocess approach) :
 *   - Plutôt que d'écrire scanline-driven WIN0 (= demanderait modif compositor),
 *     on apply un mask noir post-frame sur le frame buffer en lecture/écriture.
 *   - Lecture gFlashLevel, calcul circle bounds, set noir pour pixels hors cercle.
 *   - Player toujours centré écran en field mode → cercle centré (120, 80).
 *   - Coût : ~38400 pixels × 1 sqrt + cmp = négligeable (< 0.5ms).
 */

const SCREEN_W = 240;
const SCREEN_H = 160;
const CENTER_X = SCREEN_W / 2;  // = 120
const CENTER_Y = SCREEN_H / 2;  // = 80

/** 1:1 décomp `sFlashLevelToRadius` (field_screen_effect.c:53).
 *  Index 0 = pleine vue (rayon = écran complet).
 *  Index 8 = pitch black (rayon 0). */
export const sFlashLevelToRadius: readonly number[] = [200, 72, 64, 56, 48, 40, 32, 24, 0];

/** Lit le flash level current depuis globalThis (set par setflashlevel opcode). */
function _getFlashLevel(): number {
  const lvl = (globalThis as { gFlashLevel?: number }).gFlashLevel;
  return typeof lvl === 'number' ? lvl & 0xF : 0;
}

/** Applique le flash mask sur le frame buffer RGBA en place.
 *  Pixels hors du cercle deviennent noir opaque. Pixels dans le cercle inchangés.
 *
 *  @param frameBuffer Uint8ClampedArray 240×160 RGBA (4 bytes/pixel).
 *  @returns true si un mask a été appliqué (= level > 0).
 */
export function applyFlashMask(frameBuffer: Uint8ClampedArray): boolean {
  const level = _getFlashLevel();
  if (level <= 0) return false;  // pleine vue, no mask
  // Gate OVERWORLD : le décomp tear-down le WIN0 flash en quittant le field, donc
  // la pénombre n'affecte PAS les menus/combat. En post-process on lit le CB2
  // courant : on n'applique le masque QUE si l'overworld est actif (sinon ouvrir
  // le party menu / un combat dans une grotte sombre assombrit tout l'écran).
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
        // Hors cercle = noir opaque.
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
