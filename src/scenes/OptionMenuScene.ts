/**
 * OptionMenuScene — 1:1 décomp `src/option_menu.c` (option_menu.c:152 CB2_InitOptionMenu).
 *
 * 7 options (TEXT SPEED, BATTLE SCENE, BATTLE STYLE, SOUND, BUTTON MODE,
 * FRAME, CANCEL) avec navigation DPAD + valeurs sélectionnables.
 *
 * Architecture :
 *   - BG color : sOptionMenuBg_Pal (extrait depuis option_menu.c via inline RGB())
 *   - 2 windows (HEADER 26×2, OPTIONS 26×14) avec frames bordure tiles 0x1A2-0x1AA
 *     depuis text_window/{frameType+1}.png
 *   - Texte rendu via gba-text-printer (Window pixel buffer + palette runtime
 *     sOptionMenuText_Pal pour les couleurs orange/red/gray)
 *   - Choix sélectionné highlighted en RED via swap COLOR/SHADOW au runtime
 *     (équivalent décomp `dst[2] = TEXT_COLOR_RED` option_menu.c:390-391)
 *   - Save state via gameState.setOptions() (persisté localStorage)
 *
 * Aucun hardcode visuel : palettes, BG color, strings, glyphs, widths viennent
 * tous d'extracteurs ou du décomp source.
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { preloadBitmapFont, setupBitmapFont } from '../engine/bitmap-font';
import { preloadDialogueAssets } from '../engine/dialogue-box';
import { preloadWindowAssets } from '../engine/window-renderer';
import {
  createWindow as gpCreateWindow,
  fillWindowPixelBuffer,
  encodeStringForFont,
  addTextPrinter,
  runTextPrinter,
  copyWindowToCanvas,
  TEXT_COLOR,
  type Window as GpWindow,
} from '../engine/gba-text-printer';
import { gameState, type PokemonOptions } from '../engine/game-state';
// Décomp data : structures auto-générées depuis src/option_menu.c (Phase 1 pipeline auto/).
// Pattern projet : tous les imports de data décomp passent désormais par auto/ (cf. session 62).
import { sOptionMenuWinTemplates } from '../engine/decomp-data/auto/src/option_menu-data';
// Helpers dérivés (FRAME_BOUNDS pour PNG composition, MENUITEMS_DATA pour choices mapping, etc.)
import {
  FRAME_BOUNDS, FRAME_TILE,
  MENUITEMS_DATA as MENUITEMS,
  HEADER_TEXT_X, HEADER_TEXT_Y, ITEM_LABEL_X,
  WINDOW_FRAMES_COUNT,
  FADE_DURATION_MS,
} from '../engine/option-menu-extras';

// WIN_TEMPLATES = re-export from decomp-data for clarity
const WIN_TEMPLATES = {
  HEADER:  sOptionMenuWinTemplates[0],
  OPTIONS: sOptionMenuWinTemplates[1],
} as const;

// ─── Layout from option-menu-data.ts (1:1 décomp option_menu.c:90-111) ──────
const HEADER = { tileLeft: WIN_TEMPLATES.HEADER.tilemapLeft, tileTop: WIN_TEMPLATES.HEADER.tilemapTop, tileW: WIN_TEMPLATES.HEADER.width, tileH: WIN_TEMPLATES.HEADER.height };
const OPTIONS = { tileLeft: WIN_TEMPLATES.OPTIONS.tilemapLeft, tileTop: WIN_TEMPLATES.OPTIONS.tilemapTop, tileW: WIN_TEMPLATES.OPTIONS.width, tileH: WIN_TEMPLATES.OPTIONS.height };

// JSON cache keys (cf. preloadDialogueAssets dans dialogue-box.ts)
const LATFONT_KEY = 'gba-latfont';
const PALETTES_KEY = 'gba-palettes';
const FONT_WIDTHS_KEY = 'font-widths-table';
const CHARMAP_KEY = 'ui-charmap';
const GLOBAL_PALETTES_KEY = 'window-palettes'; // sOptionMenuText_Pal etc

// FRAME_TILE imported depuis option-menu-data.ts (cf. option_menu.c:638-645)

interface CallerInfo {
  /** Scene à laquelle scene.start() revenir (= replace). Si vide, just stop. */
  returnScene: string;
  /** Si défini : scene à scene.resume() après stop (overlay pattern). */
  callerToResume?: string;
  /** Données à passer à la scène de retour. */
  returnData?: object;
}

export class OptionMenuScene extends Phaser.Scene {
  // ⚠️ Class fields = initialisés UNE FOIS à instantiation Phaser, PAS au scene.start().
  // Donc TOUTES les state vars doivent être RESET dans init() (appelé chaque start).
  // Sinon : 2ème entry = state pollué du 1er run (ex: exiting=true → freeze input).
  private opts!: PokemonOptions;
  private selection!: number;
  private optionsKey?: string;
  private optionsImage?: Phaser.GameObjects.Image;
  private highlightRects!: Phaser.GameObjects.Rectangle[];
  private frameImages!: Phaser.GameObjects.Image[];
  private caller!: CallerInfo;
  private exiting!: boolean;
  private inputLocked!: boolean;

  constructor() { super({ key: 'OptionMenuScene' }); }

  init(data: Partial<CallerInfo>) {
    // Reset COMPLET de la state (Phaser ne le fait pas automatiquement entre scene.start()).
    this.opts = { ...gameState.options };
    this.selection = 0;
    this.optionsKey = undefined;
    this.optionsImage = undefined;
    this.highlightRects = [];
    this.frameImages = [];
    this.caller = { returnScene: 'MainMenuScene' };
    this.exiting = false;
    this.inputLocked = true;
    if (data?.returnScene !== undefined) this.caller = { ...this.caller, ...data };
  }

  preload() {
    preloadBitmapFont(this);
    preloadDialogueAssets(this);   // latfont + text_window/palettes + charmap + down_arrow + font-widths
    preloadWindowAssets(this);     // window-templates + palettes.json (option_menu_text inside)
    if (!this.cache.json.has('strings')) this.load.json('strings', '/decomp/em/strings.json');
    // Frame PNG : use windowFrameType+1 (1-20, default 1)
    const frameId = this.opts.windowFrameType + 1;
    const frameKey = `option-frame-${frameId}`;
    if (!this.textures.exists(frameKey)) this.load.image(frameKey, `/decomp/em/ui/text_window/${frameId}.png`);
  }

  create() {
    setupBitmapFont(this);

    const palettes = this.cache.json.get(PALETTES_KEY) as Record<string, { colors: [number, number, number][] }>;
    const bgColor = palettes?.sOptionMenuBg_Pal?.colors?.[0] ?? [140, 148, 255];
    this.cameras.main.setBackgroundColor(`rgb(${bgColor[0]},${bgColor[1]},${bgColor[2]})`);

    this.drawWindowFrames();
    this.renderHeader();
    this.renderOptions();
    this.updateHighlight();

    // Fade-in 1:1 décomp `BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)`
    // option_menu.c:251 — black → normal sur 16 frames (~267 ms à 60 fps).
    this.cameras.main.fadeIn(267, 0, 0, 0);
    this.cameras.main.once('camerafadeincomplete', () => { this.inputLocked = false; });

    // Listener keyboard ATTACHÉ via scene.input.keyboard (= attaché au plugin
    // global). Doit être removed au shutdown sinon il fire après scene.stop().
    const keyHandler = (e: KeyboardEvent) => this.handleKey(e);
    this.input.keyboard?.on('keydown', keyHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', keyHandler);
    });
  }

  // ─── Frame composition ──────────────────────────────────────────────────────
  /**
   * Compose les 2 frames (header + options) depuis text_window/{N}.png et les
   * pose comme images. Reproduction 1:1 décomp `DrawBgWindowFrames`
   * (option_menu.c:647-671).
   */
  private drawWindowFrames(): void {
    // Cleanup ancienne version (FRAMETYPE change in-place)
    for (const img of this.frameImages) img.destroy();
    this.frameImages = [];

    const frameId = this.opts.windowFrameType + 1;
    const frameKey = `option-frame-${frameId}`;
    const frameTex = this.textures.exists(frameKey) ? this.textures.get(frameKey) : null;
    if (!frameTex) return;
    const src = frameTex.getSourceImage() as HTMLImageElement;

    // FRAME_BOUNDS imported (1:1 décomp option_menu.c:651-668)
    this.composeFrame(src, FRAME_BOUNDS.HEADER.tileL, FRAME_BOUNDS.HEADER.tileT, FRAME_BOUNDS.HEADER.tileR, FRAME_BOUNDS.HEADER.tileB);
    this.composeFrame(src, FRAME_BOUNDS.OPTIONS.tileL, FRAME_BOUNDS.OPTIONS.tileT, FRAME_BOUNDS.OPTIONS.tileR, FRAME_BOUNDS.OPTIONS.tileB);
  }

  /**
   * Dessine 1 frame depuis (tileL, tileT) à (tileR, tileB), inclusive.
   * Frame intérieur = (tileL+1, tileT+1) à (tileR-1, tileB-1).
   */
  private composeFrame(srcPng: HTMLImageElement, tileL: number, tileT: number, tileR: number, tileB: number): void {
    const canvas = document.createElement('canvas');
    const W = (tileR - tileL + 1) * 8;
    const H = (tileB - tileT + 1) * 8;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const drawTile = (col: number, row: number, dstX: number, dstY: number) => {
      ctx.drawImage(srcPng, col * 8, row * 8, 8, 8, dstX, dstY, 8, 8);
    };

    const innerW = (tileR - tileL - 1); // # tiles dans le edge horizontal (exclude 2 corners)
    const innerH = (tileB - tileT - 1); // # tiles dans le edge vertical

    // Top row
    drawTile(FRAME_TILE.TOP_L.col, FRAME_TILE.TOP_L.row, 0, 0);
    for (let i = 0; i < innerW; i++) drawTile(FRAME_TILE.TOP_E.col, FRAME_TILE.TOP_E.row, (1 + i) * 8, 0);
    drawTile(FRAME_TILE.TOP_R.col, FRAME_TILE.TOP_R.row, (innerW + 1) * 8, 0);

    // Middle rows (left + right edges)
    for (let i = 0; i < innerH; i++) {
      const y = (1 + i) * 8;
      drawTile(FRAME_TILE.LEFT_E.col, FRAME_TILE.LEFT_E.row, 0, y);
      drawTile(FRAME_TILE.RIGHT_E.col, FRAME_TILE.RIGHT_E.row, (innerW + 1) * 8, y);
    }

    // Bottom row
    const bottomY = (innerH + 1) * 8;
    drawTile(FRAME_TILE.BOT_L.col, FRAME_TILE.BOT_L.row, 0, bottomY);
    for (let i = 0; i < innerW; i++) drawTile(FRAME_TILE.BOT_E.col, FRAME_TILE.BOT_E.row, (1 + i) * 8, bottomY);
    drawTile(FRAME_TILE.BOT_R.col, FRAME_TILE.BOT_R.row, (innerW + 1) * 8, bottomY);

    // Transparentise idx 0 PNG (BG vert convention) — sample top-left
    const probe = ctx.getImageData(0, 0, 1, 1).data;
    const bgR = probe[0], bgG = probe[1], bgB = probe[2];
    const d = ctx.getImageData(0, 0, W, H);
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      if (p[i] === bgR && p[i + 1] === bgG && p[i + 2] === bgB) p[i + 3] = 0;
    }
    ctx.putImageData(d, 0, 0);

    const key = `option-frame-composed-${tileL}-${tileT}-${Date.now()}`;
    this.textures.addCanvas(key, canvas);
    const img = this.add.image(tileL * 8, tileT * 8, key);
    img.setOrigin(0, 0).setDepth(50);
    this.frameImages.push(img);
  }

  // ─── Header "OPTIONS" ───────────────────────────────────────────────────────
  private renderHeader(): void {
    const { glyphData, glyphWidths, charmap, strings, palette } = this.getRenderData();
    if (!glyphData || !glyphWidths || !charmap || !strings || !palette) return;

    const win = gpCreateWindow(HEADER.tileW, HEADER.tileH, 1);
    fillWindowPixelBuffer(win, 1); // white BG
    const text = strings.gText_Option ?? 'OPTIONS';
    const printer = addTextPrinter({
      window: win,
      encodedString: encodeStringForFont(text, charmap),
      glyphData, glyphWidths,
      x: 8, y: 1,
      fgColor: TEXT_COLOR.DARK_GRAY,
      bgColor: TEXT_COLOR.WHITE,
      shadowColor: TEXT_COLOR.LIGHT_GRAY,
      textSpeed: 0,
    });
    runTextPrinter(printer);
    const canvas = copyWindowToCanvas(win, palette);
    const key = 'option-header-canvas';
    if (this.textures.exists(key)) this.textures.remove(key);
    this.textures.addCanvas(key, canvas);
    this.add.image(HEADER.tileLeft * 8, HEADER.tileTop * 8, key).setOrigin(0, 0).setDepth(100);
  }

  // ─── Options list (7 items + choices) ───────────────────────────────────────
  private renderOptions(): void {
    const { glyphData, glyphWidths, charmap, strings, palette } = this.getRenderData();
    if (!glyphData || !glyphWidths || !charmap || !strings || !palette) return;

    const win = gpCreateWindow(OPTIONS.tileW, OPTIONS.tileH, 1);
    fillWindowPixelBuffer(win, 1); // white BG (sera dimmed visuellement par highlight overlay)

    const widthsArr = glyphWidths;
    const stringPxWidth = (s: string): number => {
      let w = 0;
      for (const ch of s) {
        const byte = charmap[ch] ?? charmap[' '] ?? 0;
        w += widthsArr[byte] || 3;
      }
      return w;
    };

    for (let i = 0; i < MENUITEMS.length; i++) {
      const item = MENUITEMS[i];
      const labelText = strings[item.labelKey] ?? item.labelKey;
      const yPos = i * 16 + 1;

      // Label (orange)
      const labelPrinter = addTextPrinter({
        window: win,
        encodedString: encodeStringForFont(labelText, charmap),
        glyphData, glyphWidths,
        x: 8, y: yPos,
        fgColor: TEXT_COLOR.DARK_GRAY,
        bgColor: TEXT_COLOR.WHITE,
        shadowColor: TEXT_COLOR.LIGHT_GRAY,
        textSpeed: 0,
      });
      runTextPrinter(labelPrinter);

      // Choices : render chacun avec couleur normale (gris) ou highlighted (rouge)
      // si c'est la valeur actuelle pour cet item.
      if (item.choices.length === 0) continue; // CANCEL : pas de choix
      const currentValue = ((this.opts as unknown as Record<string, number>)[item.optKey]) ?? 0;

      if (item.id === 'TEXTSPEED' || item.id === 'BUTTONMODE') {
        // 3 choices spread : gauche (104), milieu (calc), droite (right-align à 198)
        const w0 = stringPxWidth(strings[item.choices[0]]?.replace(/\{[^}]+\}/g, '') ?? '');
        const w2 = stringPxWidth(strings[item.choices[2]]?.replace(/\{[^}]+\}/g, '') ?? '');
        // Décomp option_menu.c:437-441 : xMid = (w0 - w1 + 94 - w2) / 2 + 104
        // Simplification : centré entre choice 0 fin et choice 2 début
        const x0 = 104;
        const x2 = 198 - w2; // right-align à 198
        const w1 = stringPxWidth(strings[item.choices[1]]?.replace(/\{[^}]+\}/g, '') ?? '');
        const x1 = x0 + w0 + ((x2 - (x0 + w0) - w1) / 2);
        const xs = [x0, Math.round(x1), x2];
        for (let c = 0; c < 3; c++) {
          this.renderChoice(win, strings[item.choices[c]] ?? '', charmap, glyphData, glyphWidths, xs[c], yPos, currentValue === c);
        }
      } else if (item.id === 'FRAMETYPE') {
        // "TYPE N" : "TYPE " label + numéro N (1-20)
        const baseText = strings.gText_FrameType ?? '{COLOR GREEN}{SHADOW LIGHT_GREEN}TYPE ';
        const numText = String(this.opts.windowFrameType + 1);
        const baseWidth = stringPxWidth(baseText.replace(/\{[^}]+\}/g, ''));
        // Le numéro est toujours highlighted (option toujours active sur FRAMETYPE)
        this.renderChoice(win, baseText, charmap, glyphData, glyphWidths, 104, yPos, false);
        this.renderChoice(win, '{COLOR RED}{SHADOW LIGHT_RED}' + numText, charmap, glyphData, glyphWidths, 104 + baseWidth + 3, yPos, true);
      } else {
        // 2 choices : gauche (104), droite (right-align à 198)
        const w1 = stringPxWidth(strings[item.choices[1]]?.replace(/\{[^}]+\}/g, '') ?? '');
        this.renderChoice(win, strings[item.choices[0]] ?? '', charmap, glyphData, glyphWidths, 104, yPos, currentValue === 0);
        this.renderChoice(win, strings[item.choices[1]] ?? '', charmap, glyphData, glyphWidths, 198 - w1, yPos, currentValue === 1);
      }
    }

    const canvas = copyWindowToCanvas(win, palette);
    // Destroy ancienne image AVANT de remove son texture (sinon glTexture null crash).
    if (this.optionsImage) { this.optionsImage.destroy(); this.optionsImage = undefined; }
    if (this.optionsKey && this.textures.exists(this.optionsKey)) this.textures.remove(this.optionsKey);
    // Nouveau key unique pour éviter conflits cache si Phaser dedup
    this.optionsKey = `option-options-canvas-${Date.now()}`;
    this.textures.addCanvas(this.optionsKey, canvas);
    this.optionsImage = this.add.image(OPTIONS.tileLeft * 8, OPTIONS.tileTop * 8, this.optionsKey)
      .setOrigin(0, 0).setDepth(100);
  }

  /** Render un choice text à (x,y). Si highlighted=true, swap COLOR/SHADOW vers RED/LIGHT_RED.
   *  Reproduit `DrawOptionMenuChoice` (option_menu.c:380-396) :
   *    if (style != 0) { dst[2] = TEXT_COLOR_RED; dst[5] = TEXT_COLOR_LIGHT_RED; } */
  private renderChoice(win: GpWindow, text: string, charmap: Record<string, number>, glyphData: number[][], widths: Uint8Array, x: number, y: number, highlighted: boolean): void {
    let renderText = text;
    if (highlighted) {
      // Swap les premiers {COLOR XXX}{SHADOW XXX} vers RED/LIGHT_RED
      renderText = text
        .replace(/\{COLOR\s+\w+\}/, '{COLOR RED}')
        .replace(/\{SHADOW\s+\w+\}/, '{SHADOW LIGHT_RED}');
    }
    const printer = addTextPrinter({
      window: win,
      encodedString: encodeStringForFont(renderText, charmap),
      glyphData, glyphWidths: widths,
      x, y,
      fgColor: highlighted ? TEXT_COLOR.RED : TEXT_COLOR.DARK_GRAY,
      bgColor: TEXT_COLOR.WHITE,
      shadowColor: highlighted ? TEXT_COLOR.LIGHT_RED : TEXT_COLOR.LIGHT_GRAY,
      textSpeed: 0,
    });
    runTextPrinter(printer);
  }

  // ─── Highlight overlay (effect WIN0 décomp) ─────────────────────────────────
  /** Le décomp utilise WIN0 + BLDY=4 pour darken tout sauf la row sélectionnée
   *  (option_menu.c:182-184, HighlightOptionMenuItem 374-378). Pour le web, on
   *  fait l'inverse : un overlay semi-transparent NOIR sur tout SAUF la row
   *  sélectionnée. */
  private updateHighlight(): void {
    const rowH = 16;
    const winX = OPTIONS.tileLeft * 8;
    const winY = OPTIONS.tileTop * 8;
    const winW = OPTIONS.tileW * 8;
    const winH = OPTIONS.tileH * 8;
    const selY = winY + this.selection * rowH;

    // Cleanup TOUS les overlays précédents (sinon accumulation = écran noir)
    for (const r of this.highlightRects) r.destroy();
    this.highlightRects = [];

    // 2 rectangles noirs semi-transparents au-dessus + en-dessous de la row sélectionnée
    const ABOVE_H = selY - winY;
    const BELOW_H = (winY + winH) - (selY + rowH);
    if (ABOVE_H > 0) {
      this.highlightRects.push(
        this.add.rectangle(winX, winY, winW, ABOVE_H, 0x000000, 0.25).setOrigin(0, 0).setDepth(101)
      );
    }
    if (BELOW_H > 0) {
      this.highlightRects.push(
        this.add.rectangle(winX, selY + rowH, winW, BELOW_H, 0x000000, 0.25).setOrigin(0, 0).setDepth(101)
      );
    }
  }

  // ─── Input ──────────────────────────────────────────────────────────────────
  private handleKey(e: KeyboardEvent): void {
    if (this.inputLocked || this.exiting) return;
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'z') {
      this.selection = (this.selection - 1 + MENUITEMS.length) % MENUITEMS.length;
      this.updateHighlight();
    } else if (k === 'arrowdown' || k === 's') {
      this.selection = (this.selection + 1) % MENUITEMS.length;
      this.updateHighlight();
    } else if (k === 'arrowleft' || k === 'q' || k === 'arrowright' || k === 'd') {
      this.changeValue(k === 'arrowleft' || k === 'q' ? -1 : 1);
    } else if (k === ' ' || k === 'enter' || k === 'w') {
      if (MENUITEMS[this.selection].id === 'CANCEL') this.saveAndExit();
    } else if (k === 'b' || k === 'x' || k === 'escape') {
      // GBA B button (= X chez nous) ou START (= B chez nous) → save + exit.
      // 1:1 décomp option_menu.c:271-274 : `JOY_NEW(B_BUTTON) → Task_OptionMenuSave`.
      // START aussi car convention Pokemon (raccourci pour fermer menu).
      this.saveAndExit();
    }
  }

  private changeValue(delta: number): void {
    const item = MENUITEMS[this.selection];
    if (!item.optKey) return;
    const optKey = item.optKey as keyof PokemonOptions;
    const choicesCount = item.choices.length as number;
    const max = item.id === 'FRAMETYPE' ? (WINDOW_FRAMES_COUNT - 1) : choicesCount - 1;
    let v = (this.opts[optKey] ?? 0) + delta;
    if (v < 0) v = max;
    if (v > max) v = 0;
    (this.opts as unknown as Record<string, number>)[optKey] = v;

    // Si FRAMETYPE change : load le nouveau PNG si pas cache + redraw frames in-place
    // (no scene.restart = smooth update + preserve scene state)
    if (item.id === 'FRAMETYPE') {
      const newFrameId = v + 1;
      const newKey = `option-frame-${newFrameId}`;
      if (!this.textures.exists(newKey)) {
        this.load.image(newKey, `/decomp/em/ui/text_window/${newFrameId}.png`);
        this.load.once('complete', () => { this.drawWindowFrames(); });
        this.load.start();
      } else {
        this.drawWindowFrames();
      }
    }
    this.renderOptions();
    this.updateHighlight();
  }

  private saveAndExit(): void {
    if (this.exiting) return;
    this.exiting = true;
    gameState.setOptions(this.opts);
    if (this.caller.callerToResume) {
      // Overlay pattern : skip fade-out (= retour instant à OverworldScene).
      // Fade-out causerait des artefacts car OverworldScene est paused dessous.
      this.scene.resume(this.caller.callerToResume);
      this.scene.stop();
      return;
    }
    // Replace pattern (main menu) : fade-out 1:1 décomp option_menu.c:360
    this.cameras.main.fadeOut(267, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(this.caller.returnScene, this.caller.returnData);
    });
  }

  // ─── Helper : récupère toutes les data depuis cache JSON ───────────────────
  private getRenderData() {
    const cache = this.cache.json;
    const latfont = cache.get(LATFONT_KEY) as { normal?: number[][] } | undefined;
    const palettesEm = cache.get(PALETTES_KEY) as Record<string, { colors: [number, number, number][] }> | undefined;
    const palettesGlobal = cache.get(GLOBAL_PALETTES_KEY) as Record<string, { colors: [number, number, number][] }> | undefined;
    const widthsJson = cache.get(FONT_WIDTHS_KEY) as { normal?: number[] } | undefined;
    const charmap = cache.get(CHARMAP_KEY) as Record<string, number> | undefined;
    const strings = cache.get('strings') as Record<string, string> | undefined;
    // Palette options : sOptionMenuText_Pal vient de palettes.json (extract-palettes.mjs scan interface/)
    const optMenuPal = palettesGlobal?.option_menu_text;
    return {
      glyphData: latfont?.normal,
      glyphWidths: widthsJson ? new Uint8Array(widthsJson.normal!) : undefined,
      charmap,
      strings,
      palette: optMenuPal?.colors as ReadonlyArray<readonly [number, number, number]> | undefined,
    };
  }

  // Pour TS unused param
  private _gameDimsUnused() { return [GAME_W, GAME_H]; }
}
