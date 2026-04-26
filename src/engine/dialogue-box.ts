import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { preloadBitmapFont, setupBitmapFont, renderTextToCanvas } from './bitmap-font';
import { gameState } from './game-state';
import { getStringVar } from './string-buffers';
import { createDialogWindow, getTemplatePixelRect } from './window-renderer';

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
    .replace(/\{POKEBLOCK\}/g, T.PokeBlock ?? T.Pokeblock ?? 'POKéBLOC')
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
    .replace(/\{STR_VAR_(\d)\}/g, (_, n) => getStringVar(Number(n)))
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
  // down_arrow.png = 8×48 = **3 frames de 8×16** (PAS 6×8). Chaque frame est
  // l'arrow COMPLÈTE à un offset y différent (0, 1, 2 px). L'animation cycle
  // {0,1,2,1} cf. sDownArrowYCoords text.c:71.
  // Couleurs natives : outline gris foncé (idx 2) + fill ROUGE (idx 4) = la
  // vraie flèche "next page" du jeu. Pas de tint à appliquer.
  scene.load.spritesheet(ARROW_KEY, ARROW_URL, { frameWidth: 8, frameHeight: 16 });
  if (!scene.cache.json.has('placeholders')) {
    scene.load.json('placeholders', '/decomp/em/placeholders.json');
  }
  preloadBitmapFont(scene);
}

export function setupDialogueAssets(scene: Phaser.Scene) {
  const t = scene.cache.json.get('placeholders') as Record<string, string> | undefined;
  if (t) setPlaceholderTable(t);
}

// Process le PNG textbox sans alpha (le centre est le fond opaque, les
// bordures aussi). Pas de transparence à appliquer sur le textbox.
function setupTextbox(scene: Phaser.Scene) {
  if (scene.textures.exists(TEXTBOX_A_KEY)) return;
  const img = scene.textures.get(TEXTBOX_KEY).getSourceImage() as HTMLImageElement;
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  scene.textures.addCanvas(TEXTBOX_A_KEY, c);
}

// Rebuild la flèche avec alpha (palette color 0 → transparent).
// 3 frames de 8x16 (animation bobbing).
function setupArrow(scene: Phaser.Scene) {
  if (scene.textures.exists(ARROW_A_KEY)) return;
  const img = scene.textures.get(ARROW_KEY).getSourceImage() as HTMLImageElement;
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  // Sample center du frame 0 (4, 4) — pixel 0,0 NE marche pas si TRNS chunk.
  // Le BG idx 0 du PNG est (115,205,164) green, transparentisé ici.
  const sampleOffset = (4 * c.width + 4) * 4;
  const tr = p[sampleOffset], tg = p[sampleOffset + 1], tb = p[sampleOffset + 2];
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === tr && p[i + 1] === tg && p[i + 2] === tb) p[i + 3] = 0;
  }
  ctx.putImageData(d, 0, 0);
  const ct = scene.textures.addCanvas(ARROW_A_KEY, c);
  if (ct) {
    // 3 frames de 8x16 stackées verticalement.
    const frames = Math.floor(c.height / 16);
    for (let f = 0; f < frames; f++) ct.add(f, 0, 0, f * 16, 8, 16);
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
    // Cadre AUTHENTIQUE du dialog (pas un menu textbox). Composition tile-par-tile
    // de message_box.png selon WindowFunc_DrawDialogueFrame (src/menu.c:319-412).
    // Position/taille viennent de window-templates.json (sStandardTextBox_WindowTemplates).
    // Cf. WINDOWS_BOXES_REFERENCE.md.
    const w = createDialogWindow(this.scene, 'sStandardTextBox_WindowTemplates', { depth: 200000 });
    let frame: Phaser.GameObjects.GameObject;
    let X: number, Y: number, W: number, H: number;
    if (w) {
      frame = w.frame;
      X = w.pixelX; Y = w.pixelY; W = w.pixelW; H = w.pixelH;
    } else {
      // Fallback boot edge case (templates pas chargés) : nineslice 1.png stylé menu.
      const r = getTemplatePixelRect('sStandardTextBox_WindowTemplates') ?? { x: 16, y: 120, w: 216, h: 32 };
      X = r.x; Y = r.y; W = r.w; H = r.h;
      const ns = this.scene.add.nineslice(X + W / 2, Y + H / 2, TEXTBOX_A_KEY, 0, W, H, 8, 8, 8, 8);
      ns.setScrollFactor(0).setDepth(200000);
      frame = ns;
    }

    // Texte : padding interne (1, 1) + ajustement vertical pour centrer dans la
    // hauteur de 32 px (avec font 16 px et 2 lignes max → padding 0 top/bottom).
    const pageText = this.pages[this.pageIndex] ?? '';
    // authenticColors: remap font tile encoding (cf. GenerateFontHalfRowLookupTable).
    // Body→DARK visible, shadow→cream subtle, bg→white matches interior. = look GBA 1:1.
    const canvas = renderTextToCanvas(this.scene, pageText, W - 12, { authenticColors: true });
    const key = `${DYNAMIC_TEXT_KEY}-${Date.now()}-${Math.random()}`;
    this.scene.textures.addCanvas(key, canvas);
    this.textImage = this.scene.add.image(X + 6, Y + 2, key);
    this.textImage.setOrigin(0, 0).setScrollFactor(0).setDepth(200001);

    const isLast = this.pageIndex >= this.pages.length - 1;
    // Down arrow officielle décomp : 3 frames de 8x16 chacun = arrow complète à
    // un offset bobbing différent (0, 1, 2 px). L'animation cycle l'INDEX DE FRAME
    // {0, 1, 2, 1} cf. sDownArrowYCoords text.c:71 (intervalle 8 frames GBA = 133 ms).
    // Couleurs natives : outline gris foncé + fill rouge — pas de tint.
    if (!isLast) {
      const ARROW_X = X + W - 10;
      const ARROW_Y = Y + H - 8;
      this.arrowSprite = this.scene.add.sprite(ARROW_X, ARROW_Y, ARROW_A_KEY, 0);
      this.arrowSprite.setScrollFactor(0).setDepth(200001);
      const sprite = this.arrowSprite;
      const frameSeq = [0, 1, 2, 1];
      let i = 0;
      const timer = this.scene.time.addEvent({
        delay: 133, loop: true,
        callback: () => {
          if (!sprite.active) { timer.remove(); return; }
          sprite.setFrame(frameSeq[i % 4]);
          i++;
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
