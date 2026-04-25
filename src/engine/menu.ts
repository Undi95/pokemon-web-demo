import Phaser from 'phaser';
import { renderTextToCanvas } from './bitmap-font';

/**
 * Composant menu réutilisable : cadre 9-slice + options + curseur + input.
 *
 * Pré-requis : `ui-textbox-src` chargé, bitmap font setup. Applique
 * transparence au textbox si besoin.
 */

export interface MenuOpts {
  scene: Phaser.Scene;
  x: number;        // coin haut-gauche
  y: number;
  width: number;    // largeur du cadre en pixels
  labels: string[];
  textboxKey?: string;   // défault 'ui-textbox-a' (après transparence)
  lineHeight?: number;   // défaut 14
  padding?: number;      // défaut 14
  depth?: number;        // défaut 300000
  onSelect: (index: number, label: string) => void;
  onCancel?: () => void;
}

export interface MenuHandle {
  destroy: () => void;
  setCursor: (i: number) => void;
  getCursor: () => number;
}

export function createMenu(opts: MenuOpts): MenuHandle {
  const {
    scene, x, y, width, labels, onSelect, onCancel,
    textboxKey = 'ui-textbox-a',
    lineHeight = 14, padding = 14, depth = 300000
  } = opts;

  const height = labels.length * lineHeight + padding;
  const frame = scene.add.nineslice(x + width / 2, y + height / 2, textboxKey, 0, width, height, 8, 8, 8, 8);
  frame.setScrollFactor(0).setDepth(depth);

  const items: Phaser.GameObjects.Image[] = [];
  const dynKeys: string[] = [];
  for (let i = 0; i < labels.length; i++) {
    const canvas = renderTextToCanvas(scene, labels[i], width - 20);
    const key = `menu-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`;
    scene.textures.addCanvas(key, canvas);
    dynKeys.push(key);
    const img = scene.add.image(x + 20, y + (padding / 2) + i * lineHeight, key)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(depth + 1);
    items.push(img);
  }

  // Curseur : glyphe "▶" rendu via bitmap font
  const cursorKey = `menu-cursor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cursorCanvas = renderTextToCanvas(scene, '▶', 16);
  scene.textures.addCanvas(cursorKey, cursorCanvas);
  const cursorSprite = scene.add.sprite(x + 10, 0, cursorKey)
    .setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(depth + 1).setTintFill(0x202020);
  let cursor = 0;
  const updateCursor = () => cursorSprite.setY(items[cursor].y + 6);
  updateCursor();

  const handler = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'z') { cursor = (cursor - 1 + labels.length) % labels.length; updateCursor(); }
    else if (k === 'arrowdown' || k === 's') { cursor = (cursor + 1) % labels.length; updateCursor(); }
    else if (k === 'w' || k === 'enter' || k === ' ') { onSelect(cursor, labels[cursor]); }
    else if (onCancel && (k === 'x' || k === 'escape' || k === 'b')) { onCancel(); }
  };
  scene.input.keyboard?.on('keydown', handler);

  const destroy = () => {
    scene.input.keyboard?.off('keydown', handler);
    frame.destroy();
    items.forEach(i => i.destroy());
    cursorSprite.destroy();
    dynKeys.forEach(k => { if (scene.textures.exists(k)) scene.textures.remove(k); });
    if (scene.textures.exists(cursorKey)) scene.textures.remove(cursorKey);
  };

  return {
    destroy,
    setCursor: (i) => { cursor = Math.max(0, Math.min(labels.length - 1, i)); updateCursor(); },
    getCursor: () => cursor
  };
}
