import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { preloadBitmapFont, setupBitmapFont, renderTextToCanvas } from './bitmap-font';
import { gameState } from './game-state';

// Table des placeholders : extraite de `src/strings.c` du décomp via
// scripts/extract-placeholders.mjs. Chargée par DialogueBox au boot.
let placeholderTable: Record<string, string> = {};
export function setPlaceholderTable(t: Record<string, string>) { placeholderTable = t; }

/**
 * Substitue les placeholders du décomp dans un texte de script.
 *
 * Mapping {CODE} → expanseur (cf. src/string_util.c, table funcs[]) :
 *   {PLAYER}     → playerName du save
 *   {RIVAL}      → BRICE si player FEMALE, FLORA si player MALE
 *   {KUN}        → "" (vide en FR, cf. gText_ExpandedPlaceholder_Kun)
 *   {STR_VAR_N}  → buffers temporaires (TODO : opcodes bufferplayername etc.)
 *   {POKEMON}    → POKéMON (logo composé du décomp)
 *   {AQUA/MAGMA/EMERAUDE/...} → constantes du JSON placeholders.json
 *
 * Codes de contrôle non-textuels (PAUSE, PLAY_BGM, CLEAR_TO, ARROW...) strippés.
 */
export function substitutePlaceholders(text: string): string {
  const T = placeholderTable;
  const rivalKey = gameState.gender === 'MALE' ? 'May' : 'Brendan';
  return text
    .replace(/\{PLAYER\}/g, gameState.playerName)
    .replace(/\{RIVAL\}/g, T[rivalKey] ?? rivalKey.toUpperCase())
    .replace(/\{KUN\}/g, T.Kun ?? '')
    .replace(/\{POKEBLOCK\}/g, 'POKéBLOC')
    .replace(/\{VERSION\}/g, T.Emerald ?? 'EMERAUDE')
    .replace(/\{(AQUA|MAGMA|ARCHIE|MAXIE|KYOGRE|GROUDON|RUBY|SAPPHIRE)\}/g, (_, k) => {
      const cap = k[0] + k.slice(1).toLowerCase();
      return T[cap] ?? k;
    })
    .replace(/\{POKéMON\}|\{POKEMON\}/g, 'POKéMON')
    // Codes de contrôle non-textuels : strippés
    .replace(/\{PAUSE\s+\d+\}/g, '')
    .replace(/\{PAUSE_UNTIL_PRESS\}/g, '')
    .replace(/\{PLAY_BGM\s+\w+\}/g, '')
    .replace(/\{STR_VAR_\d\}/g, '')
    .replace(/\{CLEAR_TO\s+\d+\}/g, '')
    .replace(/\{(UP|DOWN|LEFT|RIGHT)_ARROW\}/g, '')
    .replace(/\{SUPER_E[R]?\}/g, '');
}

export function pagesFromScriptText(raw: string): string[] {
  // \n = nouvelle ligne dans la même page (max 2 lignes visibles)
  // \l = scroll : nouvelle page, dernière ligne de la précédente reste en haut
  // \p = clear complet, vraie nouvelle page
  const t = raw.replace(/\$$/, '');
  const pages: string[] = [];
  let lines: string[] = [];
  let buf = '';
  const flushLine = () => { lines.push(buf.trim()); buf = ''; };
  const pushPage = () => { if (lines.some(Boolean)) pages.push(lines.filter(Boolean).join('\n')); };
  let i = 0;
  while (i < t.length) {
    if (t[i] === '\\' && i + 1 < t.length) {
      const c = t[i + 1];
      if (c === 'n') flushLine();
      else if (c === 'l') {
        flushLine();
        pushPage();
        const last = lines[lines.length - 1] ?? '';
        lines = last ? [last] : [];
      }
      else if (c === 'p') { flushLine(); pushPage(); lines = []; }
      else buf += t[i] + t[i + 1];
      i += 2;
    } else { buf += t[i]; i++; }
  }
  if (buf || lines.length) { flushLine(); pushPage(); }
  return pages;
}

const TEXTBOX_KEY = 'ui-textbox-src';
const TEXTBOX_A_KEY = 'ui-textbox-a';
const TEXTBOX_URL = '/decomp/em/ui/text_window/1.png';
const ARROW_KEY = 'ui-down-arrow';
const ARROW_URL = '/decomp/em/ui/fonts/down_arrow.png';
const ARROW_A_KEY = 'ui-down-arrow-a';
const DYNAMIC_TEXT_KEY = 'dlg-text-canvas';

export function preloadDialogueAssets(scene: Phaser.Scene) {
  scene.load.image(TEXTBOX_KEY, TEXTBOX_URL);
  // down_arrow.png = 8×48 = 6 frames de 8×8 pour l'animation de la flèche
  scene.load.spritesheet(ARROW_KEY, ARROW_URL, { frameWidth: 8, frameHeight: 8 });
  if (!scene.cache.json.has('placeholders')) {
    scene.load.json('placeholders', '/decomp/em/placeholders.json');
  }
  preloadBitmapFont(scene);
}

export function setupDialogueAssets(scene: Phaser.Scene) {
  const t = scene.cache.json.get('placeholders') as Record<string, string> | undefined;
  if (t) setPlaceholderTable(t);
}

// Process le PNG du textbox avec alpha (palette color 0 → transparent) pour
// que les coins extérieurs du cadre ne bloquent pas la vue sur l'overworld.
function setupTextbox(scene: Phaser.Scene) {
  if (scene.textures.exists(TEXTBOX_A_KEY)) return;
  const img = scene.textures.get(TEXTBOX_KEY).getSourceImage() as HTMLImageElement;
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
  scene.textures.addCanvas(TEXTBOX_A_KEY, c);
}

// Rebuild la flèche avec alpha (palette color 0 → transparent).
function setupArrow(scene: Phaser.Scene) {
  if (scene.textures.exists(ARROW_A_KEY)) return;
  const img = scene.textures.get(ARROW_KEY).getSourceImage() as HTMLImageElement;
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
  const ct = scene.textures.addCanvas(ARROW_A_KEY, c);
  if (ct) {
    const frames = Math.floor(c.height / 8);
    for (let f = 0; f < frames; f++) ct.add(f, 0, 0, f * 8, 8, 8);
  }
}

export class DialogueBox {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private textImage?: Phaser.GameObjects.Image;
  private pageHint?: Phaser.GameObjects.Text;
  private pages: string[] = [];
  private pageIndex = 0;
  private resolver: (() => void) | null = null;
  private openedAt = 0;

  private arrowSprite?: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    setupBitmapFont(scene);
    setupTextbox(scene);
    setupArrow(scene);
    setupDialogueAssets(scene);
    scene.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (!this.container) return;
      // Évite que la même touche W qui a ouvert le dialogue avance
      // immédiatement à la page suivante (même keydown fire les deux listeners).
      if (performance.now() - this.openedAt < 180) return;
      if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'w') {
        this.advance();
      }
    });
  }

  show(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.pages = pagesFromScriptText(substitutePlaceholders(text));
      this.pageIndex = 0;
      this.resolver = resolve;
      this.openedAt = performance.now();
      this.render();
    });
  }

  private render() {
    this.hide();
    const W = GAME_W - 8;
    const H = 48;
    const X = 4;
    const Y = GAME_H - H - 4;

    const frame = this.scene.add.nineslice(X + W / 2, Y + H / 2, TEXTBOX_A_KEY, 0, W, H, 8, 8, 8, 8);
    frame.setScrollFactor(0).setDepth(200000);

    // Texte rendu via la vraie font du décomp (canvas composé depuis latin_normal.png)
    const pageText = this.pages[this.pageIndex] ?? '';
    const canvas = renderTextToCanvas(this.scene, pageText, W - 16);
    const key = `${DYNAMIC_TEXT_KEY}-${Date.now()}-${Math.random()}`;
    this.scene.textures.addCanvas(key, canvas);
    // Texte centré dans la textbox, 12px padding horizontal, 10px du haut
    this.textImage = this.scene.add.image(X + 12, Y + 10, key);
    this.textImage.setOrigin(0, 0).setScrollFactor(0).setDepth(200001);

    const isLast = this.pageIndex >= this.pages.length - 1;
    // Flèche officielle du décomp (down_arrow.png, 6 frames de 8×8 animés)
    if (!isLast) {
      this.arrowSprite = this.scene.add.sprite(X + W - 10, Y + H - 10, ARROW_A_KEY, 0);
      this.arrowSprite.setScrollFactor(0).setDepth(200001);
      // Flèche rouge façon Emerald — setTintFill remplace la couleur des
      // pixels non-transparents (setTint multiplie, donc noir × rouge = noir).
      this.arrowSprite.setTintFill(0xd02020);
      // Cycle manuel des frames pour simuler le bounce du jeu original
      const sprite = this.arrowSprite;
      let f = 0;
      const timer = this.scene.time.addEvent({
        delay: 120, loop: true,
        callback: () => {
          if (!sprite.active) { timer.remove(); return; }
          sprite.setFrame(f % 4);
          f++;
        }
      });
    }

    const items: Phaser.GameObjects.GameObject[] = [frame, this.textImage];
    if (this.arrowSprite) items.push(this.arrowSprite);
    this.container = this.scene.add.container(0, 0, items);
    this.container.setDepth(200000).setScrollFactor(0);
  }

  private advance() {
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
      this.openedAt = performance.now(); // reset gate pour la prochaine avance
      this.render();
    } else {
      this.hide();
      const r = this.resolver;
      this.resolver = null;
      r?.();
    }
  }

  private hide() {
    this.container?.destroy();
    this.textImage?.destroy();
    this.pageHint?.destroy();
    this.arrowSprite?.destroy();
    this.container = undefined;
    this.textImage = undefined;
    this.pageHint = undefined;
    this.arrowSprite = undefined;
  }
}
