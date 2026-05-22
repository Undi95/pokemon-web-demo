import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { preloadBitmapFont, setupBitmapFont, renderTextToCanvas, measureLastLine } from './bitmap-font';
import { gameState } from './game-state';
import { gSaveBlock2Ptr } from './save-block-state';
import { runTextPrinter as gpRunTextPrinter } from './gba-text-printer';
import { getStringVar } from './string-buffers';
import { createDialogWindow, getTemplatePixelRect } from './window-renderer';
import {
  createWindow as gpCreateWindow,
  fillWindowPixelBuffer,
  copyWindowToCanvas,
  encodeStringForFont,
  addTextPrinter,
  runTextPrinter,
  textPrinterDrawDownArrow,
  RENDER_STATE_WAIT_WITH_DOWN_ARROW,
  EXT_CTRL_CODE_PAUSE,
  type TextPrinter,
  type Window as GpWindow,
} from './gba-text-printer';

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
  // 1:1 décomp `gSaveBlock2Ptr->playerGender` (= 0=MALE / 1=FEMALE).
  const rivalKey = gSaveBlock2Ptr.playerGender === 1 ? 'Brendan' : 'May';
  return text
    .replace(/\{PLAYER\}/g, gSaveBlock2Ptr.playerName ?? 'UNDI')
    .replace(/\{RIVAL\}/g, T[rivalKey] ?? rivalKey.toUpperCase())
    .replace(/\{KUN\}/g, T.Kun ?? '')
    .replace(/\{POKEBLOCK\}/g, T.PokeBlock ?? T.Pokeblock ?? 'POKéBLOC')
    .replace(/\{VERSION\}/g, T.Emerald ?? 'EMERAUDE')
    .replace(/\{(AQUA|MAGMA|ARCHIE|MAXIE|KYOGRE|GROUDON|RUBY|SAPPHIRE)\}/g, (_, k) => {
      const cap = k[0] + k.slice(1).toLowerCase();
      return T[cap] ?? k;
    })
    .replace(/\{POKéMON\}|\{POKEMON\}/g, 'POKéMON')
    // Codes de contrôle non-textuels :
    //   - PAUSE/COLOR/SHADOW/HIGHLIGHT : NE PAS STRIP, encodeStringForFont les
    //     convertit en EXT_CTRL_CODE_BEGIN+sub+param que TextPrinter handle (state
    //     PAUSE + onCharRendered fire pour sync events comme Lotad release).
    //   - Autres : strippés (non handled encore)
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
const TEXTBOX_URL = '/decomp/em/ui/text_window/6.png'; // Fallback nineslice si templates pas chargés
const ARROW_KEY = 'ui-down-arrow';
const ARROW_URL = '/decomp/em/ui/fonts/down_arrow.png';
const ARROW_A_KEY = 'ui-down-arrow-a';
const DYNAMIC_TEXT_KEY = 'dlg-text-canvas';

// JSON keys du nouveau moteur GBA (cf. gba-text-printer.ts)
const LATFONT_KEY = 'gba-latfont';
const LATFONT_URL = '/decomp/em/ui/fonts/latin.latfont.json';
const PALETTES_KEY = 'gba-palettes';
const PALETTES_URL = '/decomp/em/ui/text_window/palettes.json';
const ARROW_JSON_KEY = 'gba-down-arrow';
const ARROW_JSON_URL = '/decomp/em/ui/fonts/down_arrow.json';
const FONT_WIDTHS_KEY = 'font-widths-table';
const FONT_WIDTHS_URL = '/decomp/em/ui/font-widths.json';
const CHARMAP_KEY_DLG = 'ui-charmap';

export function preloadDialogueAssets(scene: Phaser.Scene) {
  scene.load.image(TEXTBOX_KEY, TEXTBOX_URL);
  scene.load.spritesheet(ARROW_KEY, ARROW_URL, { frameWidth: 8, frameHeight: 16 });
  if (!scene.cache.json.has('placeholders')) {
    scene.load.json('placeholders', '/decomp/em/placeholders.json');
  }
  // Nouveau moteur 1:1 GBA — JSON datasets
  if (!scene.cache.json.has(LATFONT_KEY)) scene.load.json(LATFONT_KEY, LATFONT_URL);
  if (!scene.cache.json.has(PALETTES_KEY)) scene.load.json(PALETTES_KEY, PALETTES_URL);
  if (!scene.cache.json.has(ARROW_JSON_KEY)) scene.load.json(ARROW_JSON_KEY, ARROW_JSON_URL);
  if (!scene.cache.json.has(FONT_WIDTHS_KEY)) scene.load.json(FONT_WIDTHS_KEY, FONT_WIDTHS_URL);
  preloadBitmapFont(scene);
}

export function setupDialogueAssets(scene: Phaser.Scene) {
  const t = scene.cache.json.get('placeholders') as Record<string, string> | undefined;
  if (t) setPlaceholderTable(t);
}

// Process le PNG textbox : transparentise la couleur BG (idx 0 PNG = vert
// décomp ~112/200/160). Sans ça : bordure verte/cyan autour du textbox car
// les pixels "extérieurs" du PNG sont en idx 0 (palette GBA convention).
function setupTextbox(scene: Phaser.Scene) {
  if (scene.textures.exists(TEXTBOX_A_KEY)) return;
  const img = scene.textures.get(TEXTBOX_KEY).getSourceImage() as HTMLImageElement;
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  // Sample pixel (0,0) = BG idx 0 et transparentise tous ses occurrences.
  const probe = ctx.getImageData(0, 0, 1, 1).data;
  const bgR = probe[0], bgG = probe[1], bgB = probe[2];
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === bgR && p[i + 1] === bgG && p[i + 2] === bgB) p[i + 3] = 0;
  }
  ctx.putImageData(d, 0, 0);
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

  // ─── Nouveau moteur 1:1 GBA ─────────────────────────────────────────────────
  // Window pixel buffer + TextPrinter state machine remplacent renderTextToCanvas
  // + sprite arrow séparé. Cf. AUDIT_1_1_GBA.md.
  private gpWindow?: GpWindow;
  private gpPrinter?: TextPrinter;
  private gpPalette?: ReadonlyArray<readonly [number, number, number]>;
  private gpTextKey?: string;
  private gpArrowTimer?: Phaser.Time.TimerEvent;
  /** True tant qu'une touche speedup est held (W/Space/Enter). 1:1 décomp `JOY_HELD(A|B)`. */
  private speedUpHeld = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    setupBitmapFont(scene);
    setupTextbox(scene);
    setupArrow(scene);
    setupDialogueAssets(scene);
    // 1:1 décomp text.c : A button (W/Space/Enter) ET B button (X chez nous)
    // peuvent advance le dialog. Holding ne doit PAS auto-advance (= bug courant
    // browser keydown qui repeat). Speed-up: held flag tracked via keyup.
    const isSpeedKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      return e.key === ' ' || e.key === 'Enter' || k === 'w' || k === 'x';
    };
    scene.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (!this.container) return;
      if (performance.now() - this.openedAt < 180) return;
      if (!isSpeedKey(e)) return;
      this.speedUpHeld = true;
      // e.repeat = true si keydown fire pendant que touche held → SKIP
      // (sinon holding A = auto-advance = comportement non-1:1 GBA).
      if (e.repeat) return;
      this.advance();
    });
    scene.input.keyboard?.on('keyup', (e: KeyboardEvent) => {
      if (isSpeedKey(e)) this.speedUpHeld = false;
    });
  }

  /** Callback fired when EXT_CTRL_CODE_PAUSE is hit during streaming. Fires once.
   *  Reproduit `AddTextPrinterWithCallbackForMessage` du décomp menu.c:542. */
  private onPauseCallback?: () => void;

  show(text: string, opts?: { onPause?: () => void }): Promise<void> {
    return new Promise((resolve) => {
      this.pages = pagesFromScriptText(substitutePlaceholders(text));
      this.pageIndex = 0;
      this.resolver = resolve;
      this.openedAt = performance.now();
      this.onPauseCallback = opts?.onPause;
      this.render();
    });
  }

  private render() {
    this.hide();
    // ─── Frame (border + interior fill) — composeDialogTexture inchangé ─────
    const w = createDialogWindow(this.scene, 'sStandardTextBox_WindowTemplates', { depth: 200000 });
    let frame: Phaser.GameObjects.GameObject;
    let X: number, Y: number, W: number, H: number;
    if (w) {
      frame = w.frame;
      X = w.pixelX; Y = w.pixelY; W = w.pixelW; H = w.pixelH;
    } else {
      const r = getTemplatePixelRect('sStandardTextBox_WindowTemplates') ?? { x: 16, y: 120, w: 216, h: 32 };
      X = r.x; Y = r.y; W = r.w; H = r.h;
      const ns = this.scene.add.nineslice(X + W / 2, Y + H / 2, TEXTBOX_A_KEY, 0, W, H, 8, 8, 8, 8);
      ns.setScrollFactor(0).setDepth(200000);
      frame = ns;
    }

    const pageText = this.pages[this.pageIndex] ?? '';
    // Décomp affiche TOUJOURS la flèche après chaque \p, même sur la dernière
    // page (le printer entre en WAIT_WITH_DOWN_ARROW jusqu'au keypress qui
    // dismiss le dialog). Pas de cas "isLast → no arrow".
    const showArrow = true;

    // ─── Tente le nouveau moteur 1:1 GBA ────────────────────────────────────
    const usedNewEngine = this.renderWithGbaEngine(pageText, X, Y, W, H, showArrow);

    // ─── Fallback : ancien rendu si data nouveau moteur pas dispo ──────────
    if (!usedNewEngine) {
      const canvas = renderTextToCanvas(this.scene, pageText, W - 4, { authenticColors: true });
      const key = `${DYNAMIC_TEXT_KEY}-${Date.now()}-${Math.random()}`;
      this.scene.textures.addCanvas(key, canvas);
      this.textImage = this.scene.add.image(X, Y + 1, key);
      this.textImage.setOrigin(0, 0).setScrollFactor(0).setDepth(200001);

      if (showArrow) {
        const last = measureLastLine(this.scene, pageText, W - 4);
        const LINE_H_PX = 16;
        const ARROW_X = X + last.width;
        const ARROW_Y = Y + 1 + (last.lineIndex + 1) * LINE_H_PX - 8;
        this.arrowSprite = this.scene.add.sprite(ARROW_X, ARROW_Y, ARROW_A_KEY, 0);
        this.arrowSprite.setScrollFactor(0).setDepth(200001);
        const sprite = this.arrowSprite;
        const frameSeq = [0, 1, 2, 1];
        let i = 1;
        const timer = this.scene.time.addEvent({
          delay: 133, loop: true,
          callback: () => {
            if (!sprite.active) { timer.remove(); return; }
            sprite.setFrame(frameSeq[i % 4]);
            i++;
          }
        });
      }
    }

    const items: Phaser.GameObjects.GameObject[] = [frame];
    if (this.textImage) items.push(this.textImage);
    if (this.arrowSprite) items.push(this.arrowSprite);
    this.container = this.scene.add.container(0, 0, items);
    this.container.setDepth(200000).setScrollFactor(0);
  }

  /**
   * Rendu via le nouveau moteur GBA : Window pixel buffer + TextPrinter +
   * downArrow blittée DANS le buffer. Le tout copié sur canvas → texture
   * Phaser positionnée au-dessus du frame.
   *
   * Returns true si rendu OK, false si data manquante (fallback ancien rendu).
   */
  private renderWithGbaEngine(pageText: string, X: number, Y: number, W: number, H: number, showArrow: boolean): boolean {
    const cache = this.scene.cache.json;
    const latfont = cache.get(LATFONT_KEY) as { normal?: number[][] } | undefined;
    const palettes = cache.get(PALETTES_KEY) as Record<string, { colors: [number, number, number][] }> | undefined;
    const arrowJson = cache.get(ARROW_JSON_KEY) as { pixels?: number[][] } | undefined;
    const widthsJson = cache.get(FONT_WIDTHS_KEY) as { normal?: number[] } | undefined;
    const charmap = cache.get(CHARMAP_KEY_DLG) as Record<string, number> | undefined;
    if (!latfont?.normal || !palettes?.gMessageBox_Pal || !arrowJson?.pixels || !widthsJson?.normal || !charmap) {
      return false;
    }
    const widths = new Uint8Array(widthsJson.normal);
    const palette = palettes.gMessageBox_Pal.colors;
    this.gpPalette = palette;

    // Window dimensions = template `sStandardTextBox_WindowTemplates` = 27×4 tiles
    const widthTiles = Math.floor(W / 8);
    const heightTiles = Math.floor(H / 8);
    const win = gpCreateWindow(widthTiles, heightTiles, 15);
    this.gpWindow = win;
    // Fill BG = idx 0 → alpha 0 au copy → laisse voir l'intérieur blanc du frame.
    fillWindowPixelBuffer(win, 0);

    const encoded = encodeStringForFont(pageText, charmap);
    // textSpeed depuis options user (1=FAST, 4=MID, 8=SLOW frames/char). 1:1 menu.c:77
    // `sTextSpeedFrameDelays = {8, 4, 1}` indexed par `gSaveBlock2Ptr->optionsTextSpeed`.
    const TEXT_SPEED_FRAME_DELAYS = [8, 4, 1];
    const idx = Math.max(0, Math.min(2, gSaveBlock2Ptr.optionsTextSpeed ?? 0));
    const textSpeed = TEXT_SPEED_FRAME_DELAYS[idx];
    // onPause : 1:1 décomp NewGameBirchSpeech_WaitForThisIsPokemonText (main_menu.c:2254)
    // qui détecte EXT_CTRL_CODE_PAUSE pour spawn Lotad release. Fire once par show().
    let pauseCallbackFired = false;
    const onPauseCallback = this.onPauseCallback;
    const printer = addTextPrinter({
      window: win,
      encodedString: encoded,
      glyphData: latfont.normal,
      glyphWidths: widths,
      x: 0, y: 1,                  // 1:1 menu.c:177 printer.y=1
      fgColor: 2,                  // gMessageBox_Pal[2] dark gray = body texte
      bgColor: 0,                  // transparent → laisse voir interior frame
      shadowColor: 3,              // gMessageBox_Pal[3] cream = drop shadow
      textSpeed,
      downArrowPixels: arrowJson.pixels,
      onCharRendered: (_p, lastByte) => {
        if (lastByte === EXT_CTRL_CODE_PAUSE && !pauseCallbackFired && onPauseCallback) {
          pauseCallbackFired = true;
          onPauseCallback();
        }
      },
    });
    this.gpPrinter = printer;

    // Premier tick + canvas init (montre window vide)
    gpRunTextPrinter(printer);
    this.refreshGbaCanvas(X, Y);

    // Stream tick : 1 frame = 16ms, state machine gère textSpeed/PAUSE/EOS
    this.gpArrowTimer = this.scene.time.addEvent({
      delay: 16, loop: true,
      callback: () => {
        const p = this.gpPrinter;
        const w = this.gpWindow;
        if (!p || !w) { this.gpArrowTimer?.remove(); return; }
        // Phase streaming : process chars jusqu'à WAIT_WITH_DOWN_ARROW
        if (p.state !== RENDER_STATE_WAIT_WITH_DOWN_ARROW) {
          // 1:1 décomp text.c:944 — si touche speed-up HELD, force delayCounter=0
          // CHAQUE FRAME → 1 char/frame = FAST speed (= textSpeed FAST behavior).
          if (this.speedUpHeld) p.delayCounter = 0;
          gpRunTextPrinter(p);
          if (w.needsFlush) this.refreshGbaCanvas(X, Y);
          if (p.state === RENDER_STATE_WAIT_WITH_DOWN_ARROW && showArrow) {
            p.downArrowDelay = 0;
            textPrinterDrawDownArrow(p);
            if (w.needsFlush) this.refreshGbaCanvas(X, Y);
          }
        } else if (showArrow) {
          textPrinterDrawDownArrow(p);
          if (w.needsFlush) this.refreshGbaCanvas(X, Y);
        }
      }
    });

    return true;
  }

  /** Re-copy le pixelBuffer vers une nouvelle canvas + texture Phaser. */
  private refreshGbaCanvas(X: number, Y: number): void {
    if (!this.gpWindow || !this.gpPalette) return;
    const canvas = copyWindowToCanvas(this.gpWindow, this.gpPalette);
    if (this.gpTextKey && this.scene.textures.exists(this.gpTextKey)) {
      this.scene.textures.remove(this.gpTextKey);
    }
    this.gpTextKey = `${DYNAMIC_TEXT_KEY}-gba-${Date.now()}-${Math.random()}`;
    this.scene.textures.addCanvas(this.gpTextKey, canvas);
    if (this.textImage) {
      this.textImage.setTexture(this.gpTextKey);
    } else {
      this.textImage = this.scene.add.image(X, Y, this.gpTextKey);
      this.textImage.setOrigin(0, 0).setScrollFactor(0).setDepth(200001);
      this.container?.add(this.textImage);
    }
  }

  private advance() {
    // Si streaming pas fini : NE PAS avance la page. Le HOLD géré dans stream tick
    // (cf. speedUpHeld). Cette fonction = "click confirmé" = page advance ou skip pause.
    const p = this.gpPrinter;
    if (p && p.state !== RENDER_STATE_WAIT_WITH_DOWN_ARROW && p.state !== 2 /* FINISH */) {
      p.pauseCounter = 0; // skip PAUSE en cours (équivalent press to skip pause)
      return;
    }
    // Streaming fini : avance la page (ou close si dernière)
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
      this.openedAt = performance.now();
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
    // Cleanup nouveau moteur
    this.gpArrowTimer?.remove();
    this.gpArrowTimer = undefined;
    if (this.gpTextKey && this.scene.textures.exists(this.gpTextKey)) {
      this.scene.textures.remove(this.gpTextKey);
    }
    this.gpTextKey = undefined;
    this.gpWindow = undefined;
    this.gpPrinter = undefined;
    this.gpPalette = undefined;
  }
}
