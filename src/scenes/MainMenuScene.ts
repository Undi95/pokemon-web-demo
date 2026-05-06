/**
 * MainMenuScene — 1:1 décomp `src/main_menu.c`
 *
 * Source de vérité utilisée :
 *   - auto/src/main_menu-data.ts (sWindowTemplates_MainMenu, MENU_LEFT/TOP/WIDTH/HEIGHT
 *     constants, ENUM_HAS_0 = HAS_NO_SAVED_GAME / HAS_SAVED_GAME / HAS_MYSTERY_GIFT /
 *     HAS_MYSTERY_EVENTS)
 *   - auto-tasks/src/main_menu-tasks.ts (Task_MainMenuCheckSaveFile,
 *     Task_DisplayMainMenu, Task_HighlightSelectedMainMenuItem, Task_HandleMainMenuInput,
 *     Task_HandleMainMenuAPressed, Task_HandleMainMenuBPressed)
 *
 * Flow 1:1 décomp :
 *   1. CB2_InitMainMenu → InitMainMenu(FALSE)
 *   2. Task_MainMenuCheckSaveFile : détecte mode selon gSaveFileStatus +
 *      IsMysteryGiftEnabled + IsWirelessAdapterConnected
 *   3. Task_MainMenuCheckBattery : check RTC battery (skip ici, pas de RTC web)
 *   4. Task_DisplayMainMenu : render windows + labels avec palette 15
 *   5. Task_HighlightSelectedMainMenuItem : update WIN0 darken pour highlight item
 *   6. Task_HandleMainMenuInput : DPAD UP/DOWN navigation, A/B input
 *   7. Task_HandleMainMenuAPressed : transition selon mode + tCurrItem
 *   8. Task_HandleMainMenuBPressed : SetMainCallback2(CB2_InitTitleScreen)
 *
 * Modes (ENUM_HAS_0 du décomp) :
 *   - HAS_NO_SAVED_GAME (0) : NEW_GAME, OPTION (2 items)
 *   - HAS_SAVED_GAME (1)    : CONTINUE (+save info), NEW_GAME, OPTION (3 items)
 *   - HAS_MYSTERY_GIFT (2)  : + MYSTERY_GIFT (4 items)
 *   - HAS_MYSTERY_EVENTS (3): + MYSTERY_EVENTS (5 items, scrollable)
 *
 * Window template positions (sWindowTemplates_MainMenu, en TILES, 1 tile = 8px) :
 *   WIN0 (header CONTINUE)    : (2, 1) - 26×2  → pixel (16, 8) - 208×16
 *   WIN1 (NEW_GAME no save)   : (2, 5) - 26×2  → pixel (16, 40)
 *   WIN2 (CONTINUE save info) : (2, 1) - 26×6  → pixel (16, 8) - 208×48 (englobe WIN0)
 *   WIN3 (NEW_GAME with save) : (2, 9) - 26×2  → pixel (16, 72)
 *   WIN4 (OPTION)             : (2,13) - 26×2  → pixel (16, 104)
 *   WIN5 (MYSTERY_GIFT)       : (2,17) - 26×2  → pixel (16, 136)
 *   WIN6 (MYSTERY_EVENTS)     : (2,21) - 26×2  → pixel (16, 168)
 *
 * SIMPLIFICATIONS MVP (à raffiner pour pixel-perfect 1:1) :
 *   - Window frame border = rect simple blanc bordé noir (TODO : tiles 0x1A2-0x1AA
 *     depuis text_window/N.png comme OptionMenu)
 *   - Save info CONTINUE = juste "PLAYER" + name (TODO : badges + dex caught + time
 *     en plus, depuis gameState data quand disponible)
 *   - Highlight = cursor ▶ à gauche (TODO : 1:1 décomp = WIN0 GBA hardware darken
 *     overlay, qui assombrit tout sauf la zone de l'item sélectionné)
 *   - MYSTERY_GIFT/MYSTERY_EVENTS = playSE failure (jamais accessible vu qu'on
 *     n'expose pas ces modes pour l'instant)
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { preloadBitmapFont, setupBitmapFont } from '../engine/bitmap-font';
import { gameState } from '../engine/game-state';
import { playSE } from '../engine/music';
import { beginPaletteFade } from '../engine/palette-fade';

// ─── 1:1 décomp constants (source : auto/src/main_menu-data.ts) ─────────────
const TILE = 8;
const MENU_LEFT_PX = 2 * TILE;       // 16
const MENU_WIDTH_PX = 26 * TILE;     // 208

// ENUM_HAS_0 du décomp
const enum MenuType {
  HAS_NO_SAVED_GAME = 0,
  HAS_SAVED_GAME = 1,
  HAS_MYSTERY_GIFT = 2,
  HAS_MYSTERY_EVENTS = 3,
}

type MainMenuAction = 'CONTINUE' | 'NEW_GAME' | 'OPTION' | 'MYSTERY_GIFT' | 'MYSTERY_EVENTS';

interface MenuItemBounds {
  yPx: number;        // top y (pixels)
  hPx: number;        // height (pixels)
  action: MainMenuAction;
}

// Item layouts par mode — positions Y en pixels (= tile_top × 8)
// 1:1 sWindowTemplates_MainMenu MENU_TOP_WINn / MENU_HEIGHT_WINn
const ITEMS_BY_TYPE: Record<MenuType, readonly MenuItemBounds[]> = {
  [MenuType.HAS_NO_SAVED_GAME]: [
    { yPx: 5 * TILE,  hPx: 2 * TILE, action: 'NEW_GAME' },  // WIN1
    { yPx: 9 * TILE,  hPx: 2 * TILE, action: 'OPTION' },    // WIN3
  ],
  [MenuType.HAS_SAVED_GAME]: [
    { yPx: 1 * TILE,  hPx: 6 * TILE, action: 'CONTINUE' },  // WIN2 (englobe WIN0 header)
    { yPx: 9 * TILE,  hPx: 2 * TILE, action: 'NEW_GAME' },  // WIN3
    { yPx: 13 * TILE, hPx: 2 * TILE, action: 'OPTION' },    // WIN4
  ],
  [MenuType.HAS_MYSTERY_GIFT]: [
    { yPx: 1 * TILE,  hPx: 6 * TILE, action: 'CONTINUE' },
    { yPx: 9 * TILE,  hPx: 2 * TILE, action: 'NEW_GAME' },
    { yPx: 13 * TILE, hPx: 2 * TILE, action: 'MYSTERY_GIFT' },
    { yPx: 17 * TILE, hPx: 2 * TILE, action: 'OPTION' },
  ],
  [MenuType.HAS_MYSTERY_EVENTS]: [
    { yPx: 1 * TILE,  hPx: 6 * TILE, action: 'CONTINUE' },
    { yPx: 9 * TILE,  hPx: 2 * TILE, action: 'NEW_GAME' },
    { yPx: 13 * TILE, hPx: 2 * TILE, action: 'MYSTERY_GIFT' },
    { yPx: 17 * TILE, hPx: 2 * TILE, action: 'MYSTERY_EVENTS' },
    { yPx: 21 * TILE, hPx: 2 * TILE, action: 'OPTION' },
  ],
};

// String keys pour les labels (depuis strings.json, extraits du décomp)
const LABEL_KEYS: Record<MainMenuAction, string> = {
  CONTINUE:        'gText_MainMenuContinue',
  NEW_GAME:        'gText_MainMenuNewGame',
  OPTION:          'gText_MainMenuOption',
  MYSTERY_GIFT:    'gText_MysteryGift',
  MYSTERY_EVENTS:  'gText_MysteryEvents',
};

const FADE_MS = 16 * 1000 / 60;  // 16 frames @ 60fps = 267ms (1:1 BeginNormalPaletteFade)

export class MainMenuScene extends Phaser.Scene {
  // ⚠️ Class fields = init UNE FOIS à instantiation Phaser. Tout state runtime
  // doit être reset dans init() (appelé chaque scene.start), sinon 2ème entry
  // garde le state du 1er run (cf. OptionMenuScene.ts session 60 freeze fix).
  private menuType!: MenuType;
  private items!: readonly MenuItemBounds[];
  private selection!: number;
  private exiting!: boolean;
  private cursor!: Phaser.GameObjects.Text;
  private windowsLayer!: Phaser.GameObjects.Container;
  private labelsLayer!: Phaser.GameObjects.Container;

  constructor() { super({ key: 'MainMenuScene' }); }

  init() {
    this.selection = 0;
    this.exiting = false;
  }

  preload() {
    if (!this.cache.json.has('strings')) this.load.json('strings', '/decomp/em/strings.json');
    preloadBitmapFont(this);
  }

  create() {
    // BG noir 1:1 décomp (Task_DisplayMainMenu LoadPalette BG_PLTT_ID(15)+14 = RGB_BLACK)
    this.cameras.main.setBackgroundColor('#000000');
    setupBitmapFont(this);

    // 1:1 Task_MainMenuCheckSaveFile : détecte mode via gSaveFileStatus
    // Pour MVP : pas de wireless adapter / mystery gift, donc on a 2 modes :
    //   - hasSave true  → HAS_SAVED_GAME
    //   - hasSave false → HAS_NO_SAVED_GAME
    const hasSave = gameState.load();
    this.menuType = hasSave ? MenuType.HAS_SAVED_GAME : MenuType.HAS_NO_SAVED_GAME;
    this.items = ITEMS_BY_TYPE[this.menuType];

    const s = this.cache.json.get('strings') as Record<string, string>;

    this.windowsLayer = this.add.container(0, 0).setDepth(1);
    this.labelsLayer = this.add.container(0, 0).setDepth(2);

    // Render windows + labels
    for (const item of this.items) {
      this.drawWindow(item);
      this.drawItemLabel(item, s);
    }

    // Save info CONTINUE (PLAYER name + TODO badges/dex/time)
    if (this.menuType !== MenuType.HAS_NO_SAVED_GAME) {
      this.drawSaveInfo(s);
    }

    // Cursor ▶ à gauche de l'item sélectionné
    // (TODO 1:1 strict : WIN0 GBA hardware darken overlay au lieu d'un curseur)
    this.cursor = this.add.text(MENU_LEFT_PX - 8, 0, '▶', {
      fontFamily: 'monospace', fontSize: '10px', color: '#000000',
    }).setOrigin(0.5, 0.5).setDepth(3);
    this.refreshCursor();

    // Input (1:1 Task_HandleMainMenuInput : JOY_NEW DPAD_UP/DOWN/A_BUTTON/B_BUTTON)
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => this.onKey(e));

    // Fade in (1:1 BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK))
    void beginPaletteFade(this, { delay: 0, startY: 16, endY: 0, color: 'RGB_BLACK' });
  }

  /** Dessine le frame de window (rect blanc bordé noir).
   *  TODO 1:1 strict : utiliser tiles 0x1A2-0x1AA depuis text_window/N.png comme
   *  OptionMenu — pour l'instant rect simple suffit pour la structure. */
  private drawWindow(item: MenuItemBounds): void {
    const g = this.add.graphics();
    g.fillStyle(0xF8F8F8, 1);    // white interior (1:1 décomp window fill)
    g.fillRect(MENU_LEFT_PX, item.yPx, MENU_WIDTH_PX, item.hPx);
    g.lineStyle(1, 0x202020, 1);  // dark border
    g.strokeRect(MENU_LEFT_PX, item.yPx, MENU_WIDTH_PX, item.hPx);
    this.windowsLayer.add(g);
  }

  /** Affiche le label de l'item, centré verticalement.
   *  TODO 1:1 strict : utiliser gba-text-printer (TEXT_COLOR_DARK_GRAY normal,
   *  TEXT_COLOR_RED quand sélectionné — comme OptionMenu).
   *  Pour CONTINUE on n'affiche pas le label "CONTINUE" en grand car la window
   *  englobe les save info ; on l'affiche en haut de la window. */
  private drawItemLabel(item: MenuItemBounds, s: Record<string, string>): void {
    const label = s[LABEL_KEYS[item.action]] ?? item.action;
    const isContinue = item.action === 'CONTINUE';
    // CONTINUE = label en haut de la grande window, autres = centré verticalement
    const textY = isContinue ? item.yPx + 4 : item.yPx + (item.hPx - 10) / 2;
    const t = this.add.text(MENU_LEFT_PX + 8, textY, label, {
      fontFamily: 'monospace', fontSize: '10px', color: '#202020',
    });
    this.labelsLayer.add(t);
  }

  /** Affiche les save info CONTINUE : PLAYER name + TODO badges/dex/time.
   *  1:1 décomp PrintPlayerName + PrintPlayBadges + PrintPlayTime + PrintPokedexCount. */
  private drawSaveInfo(s: Record<string, string>): void {
    const playerName = gameState.playerName ?? '???';
    // PLAYER label + name à droite (mid-row de la window CONTINUE)
    const t1 = this.add.text(MENU_LEFT_PX + 8, 1 * TILE + 18, `PLAYER ${playerName}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#202020',
    });
    this.labelsLayer.add(t1);
    // TODO :
    //   - PrintPlayBadges : "BADGES   N"
    //   - PrintPokedexCount : "POKéDEX  N"
    //   - PrintPlayTime : "TIME     H:MM"
    void s; // s non utilisé pour l'instant (les labels sont hardcodés en attendant
            // d'avoir gText_PlayerName, gText_Badges, etc. extraits depuis décomp)
  }

  /** Met à jour la position du cursor ▶ pour pointer vers l'item sélectionné. */
  private refreshCursor(): void {
    const item = this.items[this.selection];
    // Centre vertical de l'item (pour CONTINUE : milieu = label area)
    const cursorY = item.action === 'CONTINUE'
      ? item.yPx + 4
      : item.yPx + item.hPx / 2;
    this.cursor.setY(cursorY);
  }

  /** Input handler 1:1 Task_HandleMainMenuInput. */
  private onKey(e: KeyboardEvent): void {
    if (this.exiting) return;
    const k = e.key.toLowerCase();

    if (k === 'arrowdown' || k === 's') {
      // 1:1 JOY_NEW(DPAD_DOWN)
      if (this.selection < this.items.length - 1) {
        this.selection++;
        void playSE('se_select');
        this.refreshCursor();
      }
    } else if (k === 'arrowup' || k === 'z') {
      // 1:1 JOY_NEW(DPAD_UP)
      if (this.selection > 0) {
        this.selection--;
        void playSE('se_select');
        this.refreshCursor();
      }
    } else if (k === 'enter' || k === ' ' || k === 'w') {
      // 1:1 JOY_NEW(A_BUTTON) → Task_HandleMainMenuAPressed
      this.confirmSelection();
    } else if (k === 'escape' || k === 'b' || k === 'x') {
      // 1:1 JOY_NEW(B_BUTTON) → Task_HandleMainMenuBPressed → CB2_InitTitleScreen
      this.transitionTo('TitleScene');
    }
  }

  /** Transition selon item sélectionné — 1:1 Task_HandleMainMenuAPressed switch. */
  private confirmSelection(): void {
    if (this.exiting) return;
    const action = this.items[this.selection].action;
    void playSE('se_select');

    switch (action) {
      case 'NEW_GAME':
        // 1:1 : SetMainCallback2(NULL); CleanupOverworldWindowsAndTilemaps();
        //       gTasks[taskId].func = Task_NewGameBirchSpeech_Init;
        // Migration : on bascule sur le runtime décomp natif via BirchRuntimeScene
        // (= main_menu-callbacks-auto.ts state machine, sprite OAM compositor,
        // chaîne BlendPalette correcte pour le flash release Lotad pink).
        // BirchSpeechScene legacy Phaser reste sur disque tant que la migration
        // n'a pas été validée à 100%.
        this.transitionTo('BirchRuntimeScene');
        break;
      case 'CONTINUE': {
        // 1:1 : SetMainCallback2(CB2_ContinueSavedGame); FreeAllWindowBuffers(); DestroyTask
        const m = gameState.map ?? { name: 'LittlerootTown', x: 10, y: 10 };
        this.transitionTo('OverworldScene', { mapName: m.name, spawnX: m.x, spawnY: m.y });
        break;
      }
      case 'OPTION':
        // 1:1 : SetMainCallback2(CB2_InitOptionMenu); FreeAllWindowBuffers(); DestroyTask
        // (pas un overlay : pleine scène + return)
        this.transitionTo('OptionMenuScene', { returnScene: 'MainMenuScene' });
        break;
      case 'MYSTERY_GIFT':
      case 'MYSTERY_EVENTS':
        // 1:1 : Task_DisplayMainMenuInvalidActionError si pas wireless adapter etc.
        // MVP : pas implémenté → SE failure + reste sur menu
        void playSE('se_failure');
        break;
    }
  }

  /** Fade out 1:1 BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK)
   *  puis scene.start. */
  private transitionTo(sceneKey: string, data?: object): void {
    if (this.exiting) return;
    this.exiting = true;
    void beginPaletteFade(this, { delay: 0, startY: 0, endY: 16, color: 'RGB_BLACK' })
      .then(() => this.scene.start(sceneKey, data));
  }
}
