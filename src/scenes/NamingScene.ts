import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { preloadBitmapFont, setupBitmapFont, renderTextToCanvas } from '../engine/bitmap-font';
import { gameState } from '../engine/game-state';
import { runNewGameInit } from '../engine/new-game-init';
import type { ParsedScripts } from '../engine/script-runner';

/**
 * Écran de saisie de nom — layout authentique du décomp.
 *
 * Le layout vient de `public/decomp/em/keyboard.json` (extrait par
 * `scripts/extract-keyboard.mjs` depuis `src/naming_screen.c`), pages
 * LETTERS_UPPER / LETTERS_LOWER (+ SYMBOLS à venir).
 *
 * Grille 4 lignes × 9 colonnes de chars, plus 3 boutons en dessous :
 *   [Bascule MIN/MAJ]  [Suppr]  [Valider]
 *
 * Input :
 *   ←↑↓→ naviguer (wrap dans le rectangle grille+boutons)
 *   W / Espace : actionner
 *   X / Backspace : raccourci supprimer
 *   Enter : raccourci valider
 */

const MAX_NAME_LEN = 7;
const KB_URL = '/decomp/em/keyboard.json';

type Page = 'LETTERS_UPPER' | 'LETTERS_LOWER';

interface KeyboardData {
  pages: Record<Page, string[]>; // 4 strings de 9 chars (espaces = vide)
}

export class NamingScene extends Phaser.Scene {
  private typed = '';
  private cx = 0;
  private cy = 0;
  private page: Page = 'LETTERS_UPPER';
  private kb!: KeyboardData;
  private cellW = 12;
  private cellH = 14;
  private cols = 9;
  private gridX = 0;
  private gridY = 80;
  private nameText?: Phaser.GameObjects.Image;
  private cursorSprite?: Phaser.GameObjects.Rectangle;
  private gridImages: Phaser.GameObjects.Image[] = [];

  constructor() { super({ key: 'NamingScene' }); }

  preload() {
    this.load.json('keyboard', KB_URL);
    // Pool global de scripts/textes — utilisé pour exécuter les scripts d'init
    // (EventScript_ResetAllMapFlags, InsideOfTruck_EventScript_SetIntroFlags*).
    if (!this.cache.json.has('scripts-all')) {
      this.load.json('scripts-all', '/decomp/em/scripts/_all.json');
    }
    if (!this.cache.json.has('map-ids')) {
      this.load.json('map-ids', '/decomp/em/map-ids.json');
    }
    preloadBitmapFont(this);
  }

  create() {
    this.cameras.main.setBackgroundColor('#3060a0');
    setupBitmapFont(this);
    this.kb = this.cache.json.get('keyboard') as KeyboardData;
    this.gridX = (GAME_W - this.cols * this.cellW) / 2;

    this.drawImage('TON NOM?', GAME_W / 2, 20, 'naming-prompt');
    this.renderName();
    this.renderGrid();

    this.cursorSprite = this.add.rectangle(0, 0, this.cellW - 2, this.cellH - 2, 0xff4444, 0);
    this.cursorSprite.setStrokeStyle(2, 0xee1111);
    this.updateCursorPos();

    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => this.onKey(e.key.toLowerCase()));
  }

  private drawImage(text: string, x: number, y: number, key: string) {
    const canvas = renderTextToCanvas(this, text, GAME_W);
    if (this.textures.exists(key)) this.textures.remove(key);
    this.textures.addCanvas(key, canvas);
    return this.add.image(x, y, key);
  }

  /** Nombre total de rangées navigables : 4 (grille) + 1 (boutons) = 5. */
  private get totalRows() { return this.kb.pages[this.page].length + 1; }
  private get buttonsRow() { return this.kb.pages[this.page].length; } // index de la ligne boutons

  /** Retourne le caractère d'une cellule grille, ou '' si espace/vide. */
  private charAt(row: number, col: number): string {
    const line = this.kb.pages[this.page][row];
    const ch = line?.[col] ?? ' ';
    return ch === ' ' ? '' : ch;
  }

  private renderGrid() {
    this.gridImages.forEach(i => i.destroy());
    this.gridImages = [];
    const rows = this.kb.pages[this.page];
    // Chars
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < this.cols; c++) {
        const ch = this.charAt(r, c);
        if (!ch) continue;
        const img = this.drawImage(ch, this.gridX + c * this.cellW + this.cellW / 2, this.gridY + r * this.cellH + this.cellH / 2, `kb-${r}-${c}`);
        this.gridImages.push(img);
      }
    }
    // Boutons : [MIN/MAJ] [Suppr] [Valider]
    const by = this.gridY + rows.length * this.cellH + 4;
    const buttonLabels = [this.page === 'LETTERS_UPPER' ? 'min' : 'MAJ', 'SUPPR', 'VALID'];
    const span = Math.floor(this.cols / 3);
    const btnW = span * this.cellW;
    for (let i = 0; i < 3; i++) {
      const cx = this.gridX + i * btnW + btnW / 2;
      const img = this.drawImage(buttonLabels[i], cx, by + this.cellH / 2, `btn-${i}`);
      this.gridImages.push(img);
    }
  }

  private renderName() {
    const padded = this.typed.padEnd(MAX_NAME_LEN, '_');
    if (this.nameText) this.nameText.destroy();
    this.nameText = this.drawImage(padded, GAME_W / 2, 50, 'naming-input');
  }

  private updateCursorPos() {
    if (!this.cursorSprite) return;
    if (this.cy === this.buttonsRow) {
      // Positionne sur la rangée boutons
      const span = Math.floor(this.cols / 3);
      const btnIdx = Math.min(2, Math.floor(this.cx / span));
      const btnW = span * this.cellW;
      this.cursorSprite.setSize(btnW - 2, this.cellH - 2);
      this.cursorSprite.x = this.gridX + btnIdx * btnW + btnW / 2;
      this.cursorSprite.y = this.gridY + this.buttonsRow * this.cellH + 4 + this.cellH / 2;
    } else {
      this.cursorSprite.setSize(this.cellW - 2, this.cellH - 2);
      this.cursorSprite.x = this.gridX + this.cx * this.cellW + this.cellW / 2;
      this.cursorSprite.y = this.gridY + this.cy * this.cellH + this.cellH / 2;
    }
  }

  private onKey(k: string) {
    if (k === 'arrowup' || k === 'z') { this.cy = (this.cy - 1 + this.totalRows) % this.totalRows; this.updateCursorPos(); }
    else if (k === 'arrowdown' || k === 's') { this.cy = (this.cy + 1) % this.totalRows; this.updateCursorPos(); }
    else if (k === 'arrowleft' || k === 'q' || k === 'a') { this.cx = (this.cx - 1 + this.cols) % this.cols; this.updateCursorPos(); }
    else if (k === 'arrowright' || k === 'd') { this.cx = (this.cx + 1) % this.cols; this.updateCursorPos(); }
    else if (k === 'w' || k === ' ') this.activate();
    else if (k === 'x' || k === 'backspace') this.backspace();
    else if (k === 'enter') void this.confirm();
    else if (k === 'n') this.swapPage();
  }

  private activate() {
    if (this.cy === this.buttonsRow) {
      const span = Math.floor(this.cols / 3);
      const btnIdx = Math.min(2, Math.floor(this.cx / span));
      if (btnIdx === 0) this.swapPage();
      else if (btnIdx === 1) this.backspace();
      else void this.confirm();
    } else {
      const ch = this.charAt(this.cy, this.cx);
      if (ch && this.typed.length < MAX_NAME_LEN) { this.typed += ch; this.renderName(); }
    }
  }

  private swapPage() {
    this.page = this.page === 'LETTERS_UPPER' ? 'LETTERS_LOWER' : 'LETTERS_UPPER';
    this.renderGrid();
    this.updateCursorPos();
  }

  private backspace() {
    if (!this.typed.length) return;
    this.typed = this.typed.slice(0, -1);
    this.renderName();
  }

  private async confirm() {
    if (!this.typed.length) return;
    const gender = (localStorage.getItem('em_gender') as 'MALE' | 'FEMALE') ?? 'MALE';
    gameState.resetForNewGame(gender, this.typed);
    // Exécute les vrais scripts d'init du décomp pour set tous les flags/vars
    // (EventScript_ResetAllMapFlags + InsideOfTruck_EventScript_SetIntroFlags*).
    const allScripts = this.cache.json.get('scripts-all') as ParsedScripts;
    await runNewGameInit(allScripts, gender);
    // Le spawn est défini par setdynamicwarp dans le script d'intro
    const dw = gameState.dynamicWarp;
    if (!dw) { console.error('[new-game] aucun dynamicWarp défini'); return; }
    // Le mapId du décomp (ex. MAP_LITTLEROOT_TOWN) doit être résolu vers le nom de dossier
    const mapIds = this.cache.json.get('map-ids') as Record<string, string> | undefined;
    const mapName = mapIds?.[dw.mapId] ?? 'LittlerootTown';
    gameState.map = { name: mapName, x: dw.x, y: dw.y };
    gameState.save();
    this.scene.start('OverworldScene', { mapName, spawnX: dw.x, spawnY: dw.y });
  }
}
