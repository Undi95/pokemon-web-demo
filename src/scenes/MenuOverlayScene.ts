import Phaser from 'phaser';
import { GAME_W } from '../main';
import { preloadBitmapFont, setupBitmapFont } from '../engine/bitmap-font';
import { createMenu } from '../engine/menu';
import { applyAlphaFromTopLeft } from '../util/image-alpha';
import { DialogueBox, preloadDialogueAssets, substitutePlaceholders } from '../engine/dialogue-box';
import { gameState } from '../engine/game-state';

const TEXTBOX_URL = '/decomp/em/ui/text_window/1.png';
const STRINGS_URL = '/decomp/em/strings.json';
const START_MENU_URL = '/decomp/em/start-menu.json';

interface StartMenuData {
  items: Record<string, { textKey: string; callbackName: string }>;
  builders: {
    normal: Array<{ action: string; flag: string | null }>;
    safari?: Array<{ action: string; flag: string | null }>;
    [k: string]: Array<{ action: string; flag: string | null }> | undefined;
  };
}

export class MenuOverlayScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuOverlayScene' }); }

  preload() {
    if (!this.textures.exists('ui-textbox-src')) this.load.image('ui-textbox-src', TEXTBOX_URL);
    if (!this.cache.json.has('strings')) this.load.json('strings', STRINGS_URL);
    if (!this.cache.json.has('start-menu')) this.load.json('start-menu', START_MENU_URL);
    preloadBitmapFont(this);
    preloadDialogueAssets(this);
  }

  create() {
    setupBitmapFont(this);
    applyAlphaFromTopLeft(this, 'ui-textbox-src', 'ui-textbox-a');

    const strings = this.cache.json.get('strings') as Record<string, string>;
    const menuData = this.cache.json.get('start-menu') as StartMenuData;

    // Choix du builder selon le contexte (safari, link, etc.). Pour l'instant
    // toujours 'normal' — TODO : check getSafariZoneFlag(), InUnionRoom() une
    // fois ces états implémentés (cf. start_menu.c:280-307).
    const builder = menuData.builders.normal;

    // Filtre les actions selon les flags actifs (cf. BuildNormalStartMenu décomp).
    const visibleActions = builder.filter(a => !a.flag || gameState.hasFlag(a.flag));

    // Map chaque action vers son label (substitué : {PLAYER}, etc.).
    const labels = visibleActions.map(a => {
      const item = menuData.items[a.action];
      const raw = item ? (strings[item.textKey] ?? a.action) : a.action;
      return substitutePlaceholders(raw);
    });

    const panelW = 104;
    const panelX = GAME_W - panelW - 4;
    const panelY = 4;

    const menu = createMenu({
      scene: this, x: panelX, y: panelY, width: panelW, labels,
      onSelect: (idx) => {
        const action = visibleActions[idx]?.action;
        this.handleAction(action, menu);
      },
      onCancel: () => this.close(menu)
    });
  }

  /** Dispatcher : MENU_ACTION_* → comportement. Reproduit Start Menu*Callback du décomp. */
  private async handleAction(action: string | undefined, menu: { destroy: () => void }) {
    switch (action) {
      case 'MENU_ACTION_EXIT':
        this.close(menu);
        break;
      case 'MENU_ACTION_SAVE':
        await this.saveGame(menu);
        break;
      case 'MENU_ACTION_POKEDEX':
      case 'MENU_ACTION_POKEMON':
      case 'MENU_ACTION_BAG':
      case 'MENU_ACTION_POKENAV':
      case 'MENU_ACTION_PLAYER':
      case 'MENU_ACTION_OPTION':
        // TODO : implémenter chaque sous-écran (PokédexScene, PartyScene, BagScene, etc.)
        await this.showStub(menu, action);
        break;
      default:
        this.close(menu);
    }
  }

  private async showStub(menu: { destroy: () => void }, action: string) {
    menu.destroy();
    const dialogue = new DialogueBox(this);
    await dialogue.show(`${action} : pas encore implémenté.`);
    this.close({ destroy: () => { } });
  }

  private async saveGame(menu: { destroy: () => void }) {
    menu.destroy();
    gameState.save();
    const dialogue = new DialogueBox(this);
    await dialogue.show('Partie sauvegardée!');
    this.close({ destroy: () => { } });
  }

  private close(menu: { destroy: () => void }) {
    menu.destroy();
    this.scene.stop();
    this.scene.resume('OverworldScene');
  }
}
