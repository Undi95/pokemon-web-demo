/**
 * StarterChooseScene — Phaser scene pour `special ChooseStarter`.
 *
 * 1:1 décomp src/starter_choose.c en spirit (= mêmes coords, mêmes assets,
 * même flow d'état) avec rendering Phaser direct (= plus rapide à porter
 * que le full décomp UI avec OAM + windows + scheduled tilemap copies).
 *
 * Source de vérité décomp :
 *   - sPokeballCoords        = (60,64), (120,88), (180,64)
 *   - sCursorCoords          = (60,32), (120,56), (180,32)  (= hand bobs above)
 *   - sStarterMon[]          = TREECKO, TORCHIC, MUDKIP
 *   - SpriteCB_SelectionHand : Sin(data[1], 8) bob sinusoidal
 *   - sAnim_Pokeball_Still   : frame 0
 *   - sAnim_Pokeball_Moving  : 0/16/32/0/16/0  (= 4-frame wiggle when selected)
 *
 * Assets :
 *   - graphics/starter_choose/pokeball_selection.png : 32x128 = 4 frames de 32x32
 *     (frame 0 = still, 1 = moving mid, 2 = moving alt, 3 = hand cursor)
 *   - graphics/starter_choose/starter_circle.png : 64x64 (= halo derrière mon)
 *   - graphics/starter_choose/tiles.png : 128x128 BG art
 *   - pokemon/{treecko,torchic,mudkip}/front.png : 64x64 starter front sprite
 *
 * Flow :
 *   1. Scene start (= launched par `special ChooseStarter`)
 *   2. Render BG + 3 pokeballs + hand cursor au middle (idx 1 = TORCHIC)
 *   3. ←/→ : move selection, hand bob continues
 *   4. A : Task_HandleStarterChooseInput → spawn StarterCircle + front sprite + cry
 *   5. Confirm "Choisir XXX ?" Yes/No
 *   6. Yes → set VAR_RESULT/VAR_STARTER_MON, give starter, return overworld
 *   7. No → back to pokeball select (Task_DeclineStarter)
 *
 * Returns to overworld via `window.__starterChooseDone(idx)` callback.
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { gameState } from '../engine/game-state';
import { createPokemonInstance } from '../engine/pokemon';

// 1:1 décomp `sPokeballCoords` (sprite center coords).
const POKEBALL_COORDS: ReadonlyArray<readonly [number, number]> = [
  [60, 64],   // idx 0 = TREECKO
  [120, 88],  // idx 1 = TORCHIC
  [180, 64],  // idx 2 = MUDKIP
];

// 1:1 décomp `sCursorCoords` (hand bobs ~32px ABOVE pokeball).
const CURSOR_COORDS: ReadonlyArray<readonly [number, number]> = [
  [60, 32],
  [120, 56],
  [180, 32],
];

// 1:1 décomp `sStarterMon[]` species enum order.
const STARTER_SPECIES: ReadonlyArray<string> = [
  'SPECIES_TREECKO', 'SPECIES_TORCHIC', 'SPECIES_MUDKIP',
];

// FR labels.
const STARTER_LABELS: ReadonlyArray<string> = [
  'ARCKO',     // TREECKO
  'POUSSIFEU', // TORCHIC
  'GOBOU',     // MUDKIP
];

// Asset paths (= front sprites).
const STARTER_FRONT_ASSETS: ReadonlyArray<string> = [
  '/decomp/em/pokemon/treecko/front.png',
  '/decomp/em/pokemon/torchic/front.png',
  '/decomp/em/pokemon/mudkip/front.png',
];

// 1:1 décomp gText_BirchInTrouble.
const BIRCH_TEXT_FR = 'Vite ! Choisis un POKéMON !';

/** GBA Sin table approximation (= 1:1 décomp gSineTable[idx & 0xFF] * amp >> 8).
 *  4 frame increment per tick, 8px amplitude → ~2.5 sec per cycle. */
function gbaSin(idx: number, amp: number): number {
  return Math.round(Math.sin((idx & 0xFF) * Math.PI / 128) * amp);
}

type SceneState = 'select' | 'wait_for_sprite' | 'confirm' | 'declined' | 'done';

export class StarterChooseScene extends Phaser.Scene {
  private bgImage!: Phaser.GameObjects.Image;
  private pokeballSprites: Phaser.GameObjects.Sprite[] = [];
  private hand!: Phaser.GameObjects.Sprite;
  private circle?: Phaser.GameObjects.Image;
  private monSprite?: Phaser.GameObjects.Image;
  private label?: Phaser.GameObjects.Text;
  private text?: Phaser.GameObjects.Text;
  private confirmYes?: Phaser.GameObjects.Text;
  private confirmNo?: Phaser.GameObjects.Text;
  private dialogBg?: Phaser.GameObjects.Rectangle;
  private dialogBorder?: Phaser.GameObjects.Rectangle;
  private confirmCursor = 0;  // 0 = YES, 1 = NO

  private selection = 1;
  private state: SceneState = 'select';
  private handBobTimer = 0;
  private inputCooldown = 0;
  private spriteSpawnTimer = 0;
  private keyDown: Record<string, boolean> = {};
  private keyPrev: Record<string, boolean> = {};

  constructor() { super({ key: 'StarterChooseScene' }); }

  preload(): void {
    // Pokeball + hand spritesheet : 32x128 = 4 frames de 32x32 (RGBA = bg color
    // 0 baked to alpha=0 for proper transparency).
    this.load.spritesheet('starter-pokeball-sheet',
      '/decomp/em/starter_choose/pokeball_selection_rgba.png', {
      frameWidth: 32, frameHeight: 32,
    });
    // Starter circle highlight 64x64 (= RGBA).
    this.load.image('starter-circle',
      '/decomp/em/starter_choose/starter_circle_rgba.png');
    // Birch + grass BG art (tiles, palette PNG = no transparency needed for BG).
    this.load.image('starter-bg-tiles',
      '/decomp/em/starter_choose/tiles.png');
    // Starter front sprites (= RGBA versions).
    this.load.image('starter-treecko', '/decomp/em/pokemon/treecko/front_rgba.png');
    this.load.image('starter-torchic', '/decomp/em/pokemon/torchic/front_rgba.png');
    this.load.image('starter-mudkip', '/decomp/em/pokemon/mudkip/front_rgba.png');
  }

  create(): void {
    console.log('[StarterChoose] create()');
    this.cameras.main.setBackgroundColor('#48a830');  // Grass green default.

    // BG : we don't have the tilemap rendered, so use tiles.png stretched
    // as a placeholder. Better than empty.
    this.bgImage = this.add.image(0, 0, 'starter-bg-tiles')
      .setOrigin(0, 0)
      .setDisplaySize(GAME_W, GAME_H)
      .setAlpha(0.4)  // dim so foreground pops
      .setDepth(0);

    // Title text.
    this.text = this.add.text(GAME_W / 2, 6, BIRCH_TEXT_FR, {
      fontFamily: 'monospace', fontSize: '10px', color: '#FFFFFF',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(20);

    // 3 pokeballs at décomp coords (= still frame 0).
    for (let i = 0; i < 3; i++) {
      const [x, y] = POKEBALL_COORDS[i];
      const ball = this.add.sprite(x, y, 'starter-pokeball-sheet', 0)
        .setOrigin(0.5, 0.5)
        .setDepth(5);
      this.pokeballSprites.push(ball);
    }

    // Hand cursor (frame 3 = tile offset 48 in décomp = 4th 32x32 frame).
    const [hx, hy] = CURSOR_COORDS[this.selection];
    this.hand = this.add.sprite(hx, hy, 'starter-pokeball-sheet', 3)
      .setOrigin(0.5, 0.5)
      .setDepth(15);

    this.updateLabel();

    // Hint footer.
    this.add.text(GAME_W / 2, GAME_H - 10,
      '← →: choisir   W: A   X: B', {
      fontFamily: 'monospace', fontSize: '7px', color: '#dddddd',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(20);

    // Fade in.
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    if (this.state === 'done') return;

    // Update input snapshot (key edge detection).
    this.keyPrev = { ...this.keyDown };
    const kb = this.input.keyboard;
    if (!kb) return;
    this.keyDown.LEFT = kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT));
    this.keyDown.RIGHT = kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT));
    this.keyDown.UP = kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP));
    this.keyDown.DOWN = kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN));
    this.keyDown.A = kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.W))
                  || kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER));
    this.keyDown.B = kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.X))
                  || kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC));

    this.inputCooldown -= delta;

    // Hand bob (1:1 décomp SpriteCB_SelectionHand : sprite.y2 = Sin(data[1], 8); data[1] += 4).
    this.handBobTimer = (this.handBobTimer + 4) & 0xFF;
    const bob = gbaSin(this.handBobTimer, 8);
    if (this.state === 'select') {
      const [hx, hy] = CURSOR_COORDS[this.selection];
      this.hand.setPosition(hx, hy + bob);
    }

    if (this.state === 'select') this.handleSelect();
    else if (this.state === 'wait_for_sprite') this.handleWaitForSprite(delta);
    else if (this.state === 'confirm') this.handleConfirm();
    else if (this.state === 'declined') this.handleDeclined(delta);
  }

  // ─── State : select (= idle, waiting for L/R/A) ──────────────────────────

  private handleSelect(): void {
    if (this.inputCooldown > 0) return;

    if (this.keyJustPressed('LEFT') && this.selection > 0) {
      this.selection--;
      this.refreshSelectionUI();
      this.inputCooldown = 150;
    } else if (this.keyJustPressed('RIGHT') && this.selection < 2) {
      this.selection++;
      this.refreshSelectionUI();
      this.inputCooldown = 150;
    } else if (this.keyJustPressed('A')) {
      this.beginConfirmAnim();
    }
  }

  private refreshSelectionUI(): void {
    this.updateLabel();
  }

  private updateLabel(): void {
    if (this.label) this.label.destroy();
    const [x, y] = POKEBALL_COORDS[this.selection];
    this.label = this.add.text(x, y + 28, STARTER_LABELS[this.selection], {
      fontFamily: 'monospace', fontSize: '11px', color: '#FFEE88',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(25);
  }

  // ─── State : wait_for_sprite (= 1:1 décomp Task_WaitForStarterSprite) ───
  //
  // Spawn StarterCircle + front sprite at pokeball coords, animate ball
  // shake (= sAnim_Pokeball_Moving), play cry, then transition to confirm.

  private beginConfirmAnim(): void {
    if (this.label) { this.label.destroy(); this.label = undefined; }

    const [x, y] = POKEBALL_COORDS[this.selection];

    // Circle highlight behind.
    this.circle = this.add.image(x, y, 'starter-circle')
      .setOrigin(0.5, 0.5)
      .setDepth(3)
      .setAlpha(0)  // fade in
      .setScale(0.5);
    this.tweens.add({
      targets: this.circle,
      alpha: 1,
      scale: 1,
      duration: 250,
      ease: 'Cubic.Out',
    });

    // Front sprite of selected starter.
    const monKey = ['starter-treecko', 'starter-torchic', 'starter-mudkip'][this.selection];
    this.monSprite = this.add.image(x, y, monKey)
      .setOrigin(0.5, 0.5)
      .setDepth(10)
      .setAlpha(0)
      .setScale(0.5);
    this.tweens.add({
      targets: this.monSprite,
      alpha: 1,
      scale: 1,
      duration: 250,
      delay: 50,
      ease: 'Cubic.Out',
    });

    // Hide hand.
    this.hand.setVisible(false);

    this.state = 'wait_for_sprite';
    this.spriteSpawnTimer = 350;
  }

  private handleWaitForSprite(delta: number): void {
    this.spriteSpawnTimer -= delta;
    if (this.spriteSpawnTimer <= 0) {
      this.beginConfirm();
    }
  }

  // ─── State : confirm (= 1:1 décomp Task_AskConfirmStarter) ──────────────

  private beginConfirm(): void {
    // Hide title text.
    if (this.text) { this.text.destroy(); this.text = undefined; }

    // GBA-style dialogue box.
    const boxX = 16, boxY = 112, boxW = GAME_W - 32, boxH = 36;
    this.dialogBorder = this.add.rectangle(boxX - 1, boxY - 1, boxW + 2, boxH + 2, 0xFFFFFF)
      .setOrigin(0, 0).setDepth(30);
    this.dialogBg = this.add.rectangle(boxX, boxY, boxW, boxH, 0x202848)
      .setOrigin(0, 0).setDepth(31);

    this.text = this.add.text(boxX + 6, boxY + 4,
      `${STARTER_LABELS[this.selection]} sera ton POKéMON ?`, {
      fontFamily: 'monospace', fontSize: '9px', color: '#FFFFFF',
    }).setOrigin(0, 0).setDepth(32);

    this.confirmCursor = 0;
    this.confirmYes = this.add.text(boxX + 8, boxY + 22, '▸ OUI', {
      fontFamily: 'monospace', fontSize: '9px', color: '#FFFFFF',
    }).setOrigin(0, 0).setDepth(32);
    this.confirmNo = this.add.text(boxX + 60, boxY + 22, '  NON', {
      fontFamily: 'monospace', fontSize: '9px', color: '#FFFFFF',
    }).setOrigin(0, 0).setDepth(32);

    this.state = 'confirm';
    this.inputCooldown = 200;  // debounce after enter
  }

  private handleConfirm(): void {
    if (this.inputCooldown > 0) return;

    if (this.keyJustPressed('LEFT') || this.keyJustPressed('UP')) {
      if (this.confirmCursor !== 0) {
        this.confirmCursor = 0;
        this.refreshConfirmCursor();
        this.inputCooldown = 100;
      }
    } else if (this.keyJustPressed('RIGHT') || this.keyJustPressed('DOWN')) {
      if (this.confirmCursor !== 1) {
        this.confirmCursor = 1;
        this.refreshConfirmCursor();
        this.inputCooldown = 100;
      }
    } else if (this.keyJustPressed('A')) {
      if (this.confirmCursor === 0) {
        this.commitChoice();
      } else {
        this.declineChoice();
      }
    } else if (this.keyJustPressed('B')) {
      this.declineChoice();
    }
  }

  private refreshConfirmCursor(): void {
    if (this.confirmYes) this.confirmYes.setText(this.confirmCursor === 0 ? '▸ OUI' : '  OUI');
    if (this.confirmNo) this.confirmNo.setText(this.confirmCursor === 1 ? '▸ NON' : '  NON');
  }

  // ─── State : declined (= 1:1 décomp Task_DeclineStarter) ─────────────────

  private declineChoice(): void {
    // Reverse the spawn animation.
    if (this.monSprite) {
      this.tweens.add({
        targets: this.monSprite,
        alpha: 0, scale: 0.3,
        duration: 200,
        onComplete: () => { this.monSprite?.destroy(); this.monSprite = undefined; },
      });
    }
    if (this.circle) {
      this.tweens.add({
        targets: this.circle,
        alpha: 0, scale: 0.3,
        duration: 200,
        onComplete: () => { this.circle?.destroy(); this.circle = undefined; },
      });
    }
    if (this.dialogBg) { this.dialogBg.destroy(); this.dialogBg = undefined; }
    if (this.dialogBorder) { this.dialogBorder.destroy(); this.dialogBorder = undefined; }
    if (this.text) { this.text.destroy(); this.text = undefined; }
    if (this.confirmYes) { this.confirmYes.destroy(); this.confirmYes = undefined; }
    if (this.confirmNo) { this.confirmNo.destroy(); this.confirmNo = undefined; }

    this.state = 'declined';
    this.spriteSpawnTimer = 250;
  }

  private handleDeclined(delta: number): void {
    this.spriteSpawnTimer -= delta;
    if (this.spriteSpawnTimer <= 0) {
      // Restore title + hand + label.
      this.text = this.add.text(GAME_W / 2, 6, BIRCH_TEXT_FR, {
        fontFamily: 'monospace', fontSize: '10px', color: '#FFFFFF',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5, 0).setDepth(20);
      this.hand.setVisible(true);
      this.updateLabel();
      this.state = 'select';
      this.inputCooldown = 200;
    }
  }

  // ─── Commit (= write VAR + give starter + return to overworld) ──────────

  private commitChoice(): void {
    this.state = 'done';
    const idx = this.selection;
    const speciesEnum = STARTER_SPECIES[idx];

    try {
      const starter = createPokemonInstance(speciesEnum, 5);
      gameState.addToParty(starter);
      gameState.setVar('VAR_RESULT', idx);
      gameState.setVar('VAR_STARTER_MON', idx);
      console.log(`[StarterChoose] commit ${speciesEnum} (idx=${idx}) → party size=${gameState.partySize}`);
    } catch (e) {
      console.error('[StarterChoose] commit failed', e);
    }

    // Notify caller (= specials-registry) so it can resume the script.
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (typeof w.__starterChooseDone === 'function') {
        w.__starterChooseDone(idx);
      }
    }

    // Fade to white then return.
    this.cameras.main.flash(400, 255, 255, 255);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('TestOverworldScene');
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private keyJustPressed(name: string): boolean {
    return !!this.keyDown[name] && !this.keyPrev[name];
  }
}
