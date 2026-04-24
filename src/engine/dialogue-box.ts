import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';

/**
 * Convertit le texte brut des scripts (avec \n, \l, \p) en pages de lignes
 * affichables. \p = nouvelle page (l'utilisateur valide entre chaque),
 * \n et \l = saut de ligne dans la même page.
 */
export function pagesFromScriptText(raw: string): string[] {
  // Normalise les échappements ASM → réels
  let t = raw;
  t = t.replace(/\\p/g, '\x01'); // marker page
  t = t.replace(/\\n/g, '\n');
  t = t.replace(/\\l/g, '\n');
  t = t.replace(/\$$/, ''); // terminateur de chaîne pokemerald
  return t.split('\x01').map(p => p.trim()).filter(Boolean);
}

/**
 * Textbox authentique style Emerald : 9-slice du sprite text_window/1.png
 * (24×24, 3×3 tuiles de 8×8).
 */
const TEXTBOX_KEY = 'ui-textbox-9slice';
const TEXTBOX_URL = '/decomp/em/ui/text_window/1.png';

export function preloadDialogueAssets(scene: Phaser.Scene) {
  scene.load.image(TEXTBOX_KEY, TEXTBOX_URL);
}

export class DialogueBox {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private textObj?: Phaser.GameObjects.Text;
  private pageHint?: Phaser.GameObjects.Text;
  private pages: string[] = [];
  private pageIndex = 0;
  private resolver: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (!this.container) return;
      if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'w') {
        this.advance();
      }
    });
  }

  show(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.pages = pagesFromScriptText(text);
      this.pageIndex = 0;
      this.resolver = resolve;
      this.render();
    });
  }

  private render() {
    this.hide();
    const W = GAME_W - 8;
    const H = 48;
    const X = 4;
    const Y = GAME_H - H - 4;

    // 9-slice textbox authentique
    const frame = this.scene.add.nineslice(X + W / 2, Y + H / 2, TEXTBOX_KEY, 0, W, H, 8, 8, 8, 8);
    frame.setScrollFactor(0).setDepth(500);

    // Texte (monospace pour l'instant — font GBA authentique = polish à venir)
    const pageText = this.pages[this.pageIndex] ?? '';
    this.textObj = this.scene.add.text(X + 8, Y + 8, pageText, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#202020',
      lineSpacing: 2,
      wordWrap: { width: W - 16 }
    });
    this.textObj.setScrollFactor(0).setDepth(501);

    const isLast = this.pageIndex >= this.pages.length - 1;
    const hint = isLast ? '▼ [espace]' : '▽ [espace]';
    this.pageHint = this.scene.add.text(X + W - 48, Y + H - 10, hint, {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#505050'
    });
    this.pageHint.setScrollFactor(0).setDepth(501);

    this.container = this.scene.add.container(0, 0, [frame, this.textObj, this.pageHint]);
    this.container.setDepth(500).setScrollFactor(0);
  }

  private advance() {
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
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
    this.textObj?.destroy();
    this.pageHint?.destroy();
    this.container = undefined;
    this.textObj = undefined;
    this.pageHint = undefined;
  }
}
