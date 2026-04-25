import Phaser from 'phaser';

/**
 * Animation de porte au warp. Les PNGs door_anims/<location>.png font 16×96
 * = 6 frames de 16×16 (frame 0 = fermée, frames 1-5 = ouverture).
 *
 * Pour l'instant : une porte par défaut utilisée pour tous les warps de la
 * map. À terme, lookup metatile → door_anim via src/field_door.c du décomp
 * (chantier : `extract-door-mapping.mjs`).
 */

const DOOR_BASE = '/decomp/em/ui/doors';
const DOOR_TEX_KEY = 'door-spritesheet';
const DOOR_TEX_A_KEY = 'door-spritesheet-a';
const DEFAULT_DOOR = 'littleroot.png';

export function preloadDoorAnim(scene: Phaser.Scene, doorName = DEFAULT_DOOR) {
  scene.load.spritesheet(DOOR_TEX_KEY, `${DOOR_BASE}/${doorName}`, {
    frameWidth: 16, frameHeight: 16
  });
}

export function setupDoorAnim(scene: Phaser.Scene) {
  if (scene.textures.exists(DOOR_TEX_A_KEY)) return;
  // Transparence : pixel (0,0) → alpha 0
  const img = scene.textures.get(DOOR_TEX_KEY).getSourceImage() as HTMLImageElement;
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  const tr = p[0], tg = p[1], tb = p[2];
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === tr && p[i + 1] === tg && p[i + 2] === tb) p[i + 3] = 0;
  }
  ctx.putImageData(d, 0, 0);
  const ct = scene.textures.addCanvas(DOOR_TEX_A_KEY, c);
  if (ct) {
    const frames = Math.floor(c.height / 16);
    for (let f = 0; f < frames; f++) ct.add(f, 0, 0, f * 16, 16, 16);
  }
}

/**
 * Joue l'animation d'ouverture à (tileX, tileY) puis appelle `onDone`.
 */
export function playDoorOpen(
  scene: Phaser.Scene,
  tileX: number,
  tileY: number,
  onDone: () => void
): void {
  const sprite = scene.add.sprite(tileX * 16 + 8, tileY * 16 + 16, DOOR_TEX_A_KEY, 0);
  sprite.setOrigin(0.5, 1).setDepth(tileY * 16 + 16);
  const maxFrame = 5;
  const durationMs = 300;
  scene.tweens.addCounter({
    from: 0, to: maxFrame,
    duration: durationMs,
    onUpdate: (t) => {
      const f = Math.min(maxFrame, Math.floor(t.getValue() ?? 0));
      sprite.setFrame(f);
    },
    onComplete: () => {
      sprite.destroy();
      onDone();
    }
  });
}
