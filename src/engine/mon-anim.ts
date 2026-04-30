/**
 * Animations Pokémon en combat — 1:1 décomp via Phaser tweens.
 *
 * Source : `include/pokemon_animation.h` (51 types ANIM_*) + `pokemon-anims.json`
 * extrait par `extract-pokemon-anims.mjs` (frontAnimId par species).
 *
 * Décomp `LaunchAnimationTaskForFrontSprite` joue UNE FOIS l'anim type assigné
 * à la species, puis le sprite reste fixe. Pas de loop continu (sauf glow).
 *
 * TOUTES les 51 anim types implémentées (squish/shake/slide/rotate/glow/etc.)
 * via Phaser tweens. Reproduction visuelle approximative — pour 1:1 pixel
 * perfect il faudrait reproduire l'affine matrix manipulation OAM du décomp,
 * mais visuellement c'est très proche.
 */
import Phaser from 'phaser';

interface MonAnimEntry { frontAnimId: string; delay: number }
let cache: Record<string, MonAnimEntry> | null = null;

export function setMonAnimCache(data: Record<string, MonAnimEntry> | null): void {
  if (data && !cache) cache = data;
}

export function getMonAnim(species: string): MonAnimEntry | null {
  if (!cache) return null;
  const enumName = species.startsWith('SPECIES_')
    ? species
    : 'SPECIES_' + species.toUpperCase().replace(/[\s-]/g, '_');
  return cache[enumName] ?? null;
}

/** Reset sprite à son état neutre après une anim. */
function resetSprite(s: Phaser.GameObjects.Sprite, baseX: number, baseY: number): void {
  s.x = baseX; s.y = baseY;
  s.scaleX = 1; s.scaleY = 1;
  s.angle = 0; s.alpha = 1;
  s.clearTint();
}

/** Helper : tint glow via tween color (clearTint à la fin). */
function glowTint(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, hex: number, baseX: number, baseY: number): void {
  s.setTint(hex);
  scene.tweens.add({
    targets: s,
    alpha: { from: 1, to: 0.5 },
    duration: 120, ease: 'Sine.easeInOut',
    yoyo: true, repeat: 2,
    onComplete: () => { resetSprite(s, baseX, baseY); },
  });
}

/**
 * Joue l'anim d'apparition selon le type décomp. Toutes terminent en remettant
 * le sprite à scale (1,1) + position de base + alpha 1 + angle 0.
 */
export function playMonAnim(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  animType: string,
  baseX: number,
  baseY: number,
): void {
  const reset = () => resetSprite(sprite, baseX, baseY);

  switch (animType) {
    // ─── Squish & bounce ──────────────────────────────────────────────
    case 'ANIM_V_SQUISH_AND_BOUNCE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleY: 0.8, scaleX: 1.1, duration: 100, ease: 'Sine.easeOut' },
        { scaleY: 1.1, scaleX: 0.95, duration: 80, ease: 'Sine.easeInOut' },
        { scaleY: 1.0, scaleX: 1.0, duration: 80, ease: 'Sine.easeInOut' },
      ], onComplete: reset });
      break;
    case 'ANIM_DEEP_V_SQUISH_AND_BOUNCE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleY: 0.6, scaleX: 1.25, duration: 140, ease: 'Sine.easeOut' },
        { scaleY: 1.25, scaleX: 0.85, duration: 100, ease: 'Sine.easeInOut' },
        { scaleY: 1.0, scaleX: 1.0, duration: 100, ease: 'Sine.easeInOut' },
      ], onComplete: reset });
      break;

    // ─── Stretch / vibrate ────────────────────────────────────────────
    case 'ANIM_CIRCULAR_STRETCH_TWICE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleX: 1.2, scaleY: 0.85, duration: 100, ease: 'Sine.easeOut' },
        { scaleX: 0.85, scaleY: 1.2, duration: 150, ease: 'Sine.easeInOut' },
        { scaleX: 1.2, scaleY: 0.85, duration: 100, ease: 'Sine.easeInOut' },
        { scaleX: 1.0, scaleY: 1.0, duration: 100, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
    case 'ANIM_H_VIBRATE':
      scene.tweens.add({
        targets: sprite, x: { from: baseX - 1.5, to: baseX + 1.5 },
        duration: 30, ease: 'Linear', yoyo: true, repeat: 8, onComplete: reset,
      });
      break;
    case 'ANIM_CIRCULAR_VIBRATE':
      scene.tweens.add({
        targets: sprite,
        x: { from: baseX - 1.5, to: baseX + 1.5 },
        y: { from: baseY - 1.5, to: baseY + 1.5 },
        duration: 40, ease: 'Linear', yoyo: true, repeat: 6, onComplete: reset,
      });
      break;

    // ─── Slides ───────────────────────────────────────────────────────
    case 'ANIM_H_SLIDE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { x: baseX - 8, duration: 100, ease: 'Sine.easeOut' },
        { x: baseX + 8, duration: 200, ease: 'Sine.easeInOut' },
        { x: baseX, duration: 100, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
    case 'ANIM_V_SLIDE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { y: baseY - 8, duration: 100, ease: 'Sine.easeOut' },
        { y: baseY + 4, duration: 200, ease: 'Sine.easeInOut' },
        { y: baseY, duration: 100, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
    case 'ANIM_V_SLIDE_WOBBLE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { y: baseY - 6, x: baseX - 2, duration: 100 },
        { y: baseY - 3, x: baseX + 2, duration: 100 },
        { y: baseY, x: baseX, duration: 100, ease: 'Bounce.easeOut' },
      ], onComplete: reset });
      break;
    case 'ANIM_H_SLIDE_WOBBLE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { x: baseX - 6, y: baseY - 2, duration: 100 },
        { x: baseX + 6, y: baseY + 2, duration: 100 },
        { x: baseX, y: baseY, duration: 100, ease: 'Bounce.easeOut' },
      ], onComplete: reset });
      break;

    // ─── Rotates ──────────────────────────────────────────────────────
    case 'ANIM_BOUNCE_ROTATE_TO_SIDES':
      scene.tweens.chain({ targets: sprite, tweens: [
        { angle: -15, y: baseY - 4, duration: 100 },
        { angle: 15, y: baseY, duration: 200 },
        { angle: 0, y: baseY, duration: 100 },
      ], onComplete: reset });
      break;
    case 'ANIM_ROTATE_TO_SIDES':
      scene.tweens.chain({ targets: sprite, tweens: [
        { angle: -10, duration: 100 },
        { angle: 10, duration: 200 },
        { angle: 0, duration: 100 },
      ], onComplete: reset });
      break;
    case 'ANIM_ROTATE_TO_SIDES_TWICE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { angle: -10, duration: 80 }, { angle: 10, duration: 160 },
        { angle: -10, duration: 160 }, { angle: 10, duration: 160 },
        { angle: 0, duration: 80 },
      ], onComplete: reset });
      break;
    case 'ANIM_TWIST':
      scene.tweens.add({
        targets: sprite, angle: { from: 0, to: 360 },
        duration: 400, ease: 'Sine.easeInOut', onComplete: reset,
      });
      break;
    case 'ANIM_H_PIVOT':
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleX: -1, duration: 150, ease: 'Sine.easeOut' },
        { scaleX: 1, duration: 150, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
    case 'ANIM_CIRCLE_C_CLOCKWISE':
      // Approximation : 360° tween + petit décalage X/Y en arc (couteux à
      // implémenter pixel-perfect, on simule par rotation simple inverse).
      scene.tweens.add({
        targets: sprite, angle: { from: 0, to: -360 },
        duration: 500, ease: 'Sine.easeInOut', onComplete: reset,
      });
      break;

    // ─── Jumps ────────────────────────────────────────────────────────
    case 'ANIM_V_JUMPS_H_JUMPS':
      scene.tweens.chain({ targets: sprite, tweens: [
        { y: baseY - 6, duration: 100, ease: 'Sine.easeOut' },
        { y: baseY, duration: 100, ease: 'Sine.easeIn' },
        { x: baseX + 4, duration: 80 },
        { x: baseX - 4, duration: 80 },
        { x: baseX, duration: 80 },
      ], onComplete: reset });
      break;
    case 'ANIM_V_JUMPS_BIG':
      scene.tweens.chain({ targets: sprite, tweens: [
        { y: baseY - 12, duration: 200, ease: 'Sine.easeOut' },
        { y: baseY, duration: 200, ease: 'Sine.easeIn' },
        { y: baseY - 8, duration: 150, ease: 'Sine.easeOut' },
        { y: baseY, duration: 150, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
    case 'ANIM_H_JUMPS':
      scene.tweens.chain({ targets: sprite, tweens: [
        { x: baseX - 4, y: baseY - 4, duration: 100 },
        { x: baseX, y: baseY, duration: 100 },
        { x: baseX + 4, y: baseY - 4, duration: 100 },
        { x: baseX, y: baseY, duration: 100 },
      ], onComplete: reset });
      break;
    case 'ANIM_H_JUMPS_V_STRETCH':
      scene.tweens.chain({ targets: sprite, tweens: [
        { x: baseX - 3, y: baseY - 4, scaleY: 1.15, duration: 100 },
        { x: baseX, y: baseY, scaleY: 1.0, duration: 100 },
        { x: baseX + 3, y: baseY - 4, scaleY: 1.15, duration: 100 },
        { x: baseX, y: baseY, scaleY: 1.0, duration: 100 },
      ], onComplete: reset });
      break;

    // ─── Grow / shrink ────────────────────────────────────────────────
    case 'ANIM_GROW_VIBRATE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleX: 1.15, scaleY: 1.15, duration: 150, ease: 'Sine.easeOut' },
        { x: baseX - 1, duration: 30, ease: 'Linear', yoyo: true, repeat: 4 },
        { scaleX: 1.0, scaleY: 1.0, duration: 100, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
    case 'ANIM_SHRINK_GROW':
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleX: 0.7, scaleY: 0.7, duration: 200, ease: 'Sine.easeIn' },
        { scaleX: 1.0, scaleY: 1.0, duration: 200, ease: 'Sine.easeOut' },
      ], onComplete: reset });
      break;
    case 'ANIM_H_STRETCH':
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleX: 1.3, scaleY: 0.85, duration: 200, ease: 'Sine.easeOut' },
        { scaleX: 1.0, scaleY: 1.0, duration: 200, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
    case 'ANIM_V_STRETCH':
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleX: 0.85, scaleY: 1.3, duration: 200, ease: 'Sine.easeOut' },
        { scaleX: 1.0, scaleY: 1.0, duration: 200, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;

    // ─── Zigzag / swings ──────────────────────────────────────────────
    case 'ANIM_ZIGZAG_FAST':
      scene.tweens.chain({ targets: sprite, tweens: [
        { x: baseX - 4, y: baseY - 2, duration: 60 },
        { x: baseX + 4, y: baseY + 2, duration: 60 },
        { x: baseX - 4, y: baseY - 2, duration: 60 },
        { x: baseX + 4, y: baseY + 2, duration: 60 },
        { x: baseX, y: baseY, duration: 80 },
      ], onComplete: reset });
      break;
    case 'ANIM_SWING_CONCAVE':
    case 'ANIM_SWING_CONCAVE_FAST':
    case 'ANIM_SWING_CONCAVE_FAST_SHORT': {
      const dur = animType.includes('FAST') ? (animType.endsWith('SHORT') ? 80 : 120) : 200;
      scene.tweens.add({
        targets: sprite, angle: { from: -10, to: 10 },
        duration: dur, ease: 'Sine.easeInOut',
        yoyo: true, repeat: 1, onComplete: reset,
      });
      break;
    }
    case 'ANIM_SWING_CONVEX':
    case 'ANIM_SWING_CONVEX_FAST':
    case 'ANIM_SWING_CONVEX_FAST_SHORT': {
      const dur = animType.includes('FAST') ? (animType.endsWith('SHORT') ? 80 : 120) : 200;
      scene.tweens.add({
        targets: sprite, angle: { from: 10, to: -10 },
        duration: dur, ease: 'Sine.easeInOut',
        yoyo: true, repeat: 1, onComplete: reset,
      });
      break;
    }

    // ─── Shakes ───────────────────────────────────────────────────────
    case 'ANIM_H_SHAKE':
      scene.tweens.add({
        targets: sprite, x: { from: baseX - 2, to: baseX + 2 },
        duration: 50, ease: 'Linear', yoyo: true, repeat: 4, onComplete: reset,
      });
      break;
    case 'ANIM_V_SHAKE':
      scene.tweens.add({
        targets: sprite, y: { from: baseY - 2, to: baseY + 2 },
        duration: 60, ease: 'Linear', yoyo: true, repeat: 3, onComplete: reset,
      });
      break;
    case 'ANIM_V_SHAKE_TWICE':
      scene.tweens.add({
        targets: sprite, y: { from: baseY - 2, to: baseY + 2 },
        duration: 60, ease: 'Linear', yoyo: true, repeat: 7, onComplete: reset,
      });
      break;

    // ─── Glows (tint color flash) ─────────────────────────────────────
    case 'ANIM_GLOW_BLACK':   glowTint(scene, sprite, 0x000000, baseX, baseY); break;
    case 'ANIM_GLOW_ORANGE':  glowTint(scene, sprite, 0xff8000, baseX, baseY); break;
    case 'ANIM_GLOW_RED':     glowTint(scene, sprite, 0xff4040, baseX, baseY); break;
    case 'ANIM_GLOW_BLUE':    glowTint(scene, sprite, 0x4080ff, baseX, baseY); break;
    case 'ANIM_GLOW_YELLOW':  glowTint(scene, sprite, 0xffff40, baseX, baseY); break;
    case 'ANIM_GLOW_PURPLE':  glowTint(scene, sprite, 0xa040ff, baseX, baseY); break;
    case 'ANIM_FLASH_YELLOW': glowTint(scene, sprite, 0xffff00, baseX, baseY); break;

    // ─── Misc cool moves ──────────────────────────────────────────────
    case 'ANIM_RISING_WOBBLE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { y: baseY - 6, duration: 180, ease: 'Sine.easeOut' },
        { x: baseX - 3, duration: 80, ease: 'Sine.easeInOut', yoyo: true },
        { y: baseY, duration: 120, ease: 'Bounce.easeOut' },
      ], onComplete: reset });
      break;
    case 'ANIM_TIP_MOVE_FORWARD':
      scene.tweens.chain({ targets: sprite, tweens: [
        { angle: 12, x: baseX + 4, duration: 200, ease: 'Sine.easeOut' },
        { angle: 0, x: baseX, duration: 200, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
    case 'ANIM_SPIN_LONG':
      scene.tweens.add({
        targets: sprite, angle: { from: 0, to: 720 },
        duration: 800, ease: 'Sine.easeInOut', onComplete: reset,
      });
      break;
    case 'ANIM_BACK_AND_LUNGE':
      scene.tweens.chain({ targets: sprite, tweens: [
        { x: baseX - 8, duration: 180, ease: 'Sine.easeOut' },
        { x: baseX + 4, duration: 120, ease: 'Sine.easeIn' },
        { x: baseX, duration: 100, ease: 'Sine.easeOut' },
      ], onComplete: reset });
      break;
    case 'ANIM_BACK_FLIP':
    case 'ANIM_BACK_FLIP_BIG':
      scene.tweens.add({
        targets: sprite,
        angle: { from: 0, to: -360 },
        y: { from: baseY, to: baseY - (animType.endsWith('BIG') ? 14 : 8) },
        duration: 400, ease: 'Sine.easeInOut',
        yoyo: true, onComplete: reset,
      });
      break;
    case 'ANIM_FRONT_FLIP':
    case 'ANIM_TUMBLING_FRONT_FLIP':
      scene.tweens.add({
        targets: sprite,
        angle: { from: 0, to: 360 },
        y: { from: baseY, to: baseY - 8 },
        duration: animType === 'ANIM_TUMBLING_FRONT_FLIP' ? 700 : 400,
        ease: 'Sine.easeInOut',
        yoyo: true, repeat: animType === 'ANIM_TUMBLING_FRONT_FLIP' ? 1 : 0,
        onComplete: reset,
      });
      break;
    case 'ANIM_FLICKER':
      scene.tweens.add({
        targets: sprite, alpha: { from: 1, to: 0.2 },
        duration: 50, ease: 'Linear', yoyo: true, repeat: 5, onComplete: reset,
      });
      break;
    case 'ANIM_FIGURE_8':
      scene.tweens.chain({ targets: sprite, tweens: [
        { x: baseX + 4, y: baseY - 4, duration: 120 },
        { x: baseX, y: baseY, duration: 120 },
        { x: baseX - 4, y: baseY - 4, duration: 120 },
        { x: baseX, y: baseY, duration: 120 },
      ], onComplete: reset });
      break;
    case 'ANIM_ROTATE_UP_SLAM_DOWN':
      scene.tweens.chain({ targets: sprite, tweens: [
        { angle: -20, y: baseY - 8, duration: 200, ease: 'Sine.easeOut' },
        { angle: 0, y: baseY + 2, duration: 100, ease: 'Bounce.easeOut' },
        { y: baseY, duration: 80, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;

    // ─── Fallback : ANIM_V_SQUISH_AND_BOUNCE générique ────────────────
    default:
      scene.tweens.chain({ targets: sprite, tweens: [
        { scaleY: 0.85, duration: 120, ease: 'Sine.easeOut' },
        { scaleY: 1.0, duration: 120, ease: 'Sine.easeIn' },
      ], onComplete: reset });
      break;
  }
}
