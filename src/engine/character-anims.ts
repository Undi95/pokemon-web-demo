import Phaser from 'phaser';

/**
 * pokeemerald NPC sprite strips : 144×32 = 9 frames de 16×32.
 * Disposition :
 *   0 : regarde en bas (idle)
 *   1 : regarde en haut (idle)
 *   2 : regarde à gauche (idle, flip pour droite)
 *   3 : pas en bas #1
 *   4 : pas en bas #2
 *   5 : pas en haut #1
 *   6 : pas en haut #2
 *   7 : pas à gauche #1 (flip pour droite)
 *   8 : pas à gauche #2 (flip pour droite)
 *
 * Cycle de marche façon Gen 3 :
 *   - Un déplacement d'une tile = première moitié du tween en frame "pas",
 *     seconde moitié en frame "idle".
 *   - Les pas alternent #1 / #2 à chaque tile.
 *   - Résultat pendant une marche continue : pas1 → idle → pas2 → idle →
 *     pas1 → idle → ...
 */

export type Facing = 'down' | 'up' | 'left' | 'right';

const IDLE_FRAME: Record<Facing, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 2
};

const STEP_FRAMES: Record<Facing, [number, number]> = {
  down: [3, 4],
  up: [5, 6],
  left: [7, 8],
  right: [7, 8]
};

// État par sprite : compteur de pas (invalide les callbacks pendants quand un
// nouveau pas commence) et toggle pour alterner pas#1/pas#2.
const stepCounterBySprite = new WeakMap<Phaser.GameObjects.Sprite, number>();
const stepToggleBySprite = new WeakMap<Phaser.GameObjects.Sprite, boolean>();

export function setIdleFrame(
  sprite: Phaser.GameObjects.Sprite,
  textureKey: string,
  facing: Facing
): void {
  sprite.setTexture(textureKey, IDLE_FRAME[facing]);
  sprite.setFlipX(facing === 'right');
}

export function playSingleStep(
  sprite: Phaser.GameObjects.Sprite,
  textureKey: string,
  facing: Facing,
  stepDurationMs: number
): void {
  // Incrémente le compteur : le callback en attente d'un pas précédent verra
  // un mismatch et ne réinitialisera pas à idle à tort.
  const myStep = (stepCounterBySprite.get(sprite) ?? 0) + 1;
  stepCounterBySprite.set(sprite, myStep);

  const toggle = stepToggleBySprite.get(sprite) ?? false;
  const stepFrame = STEP_FRAMES[facing][toggle ? 1 : 0];
  stepToggleBySprite.set(sprite, !toggle);

  sprite.setTexture(textureKey, stepFrame);
  sprite.setFlipX(facing === 'right');

  // Retour à idle à mi-chemin : la deuxième moitié du déplacement est en pose
  // neutre, ce qui donne le rythme "pas, idle, pas, idle" même en marche continue.
  const halfDuration = Math.max(60, Math.floor(stepDurationMs / 2));
  sprite.scene.time.delayedCall(halfDuration, () => {
    if (stepCounterBySprite.get(sprite) !== myStep) return; // un nouveau pas a démarré
    setIdleFrame(sprite, textureKey, facing);
  });
}
