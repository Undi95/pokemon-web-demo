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
      case 'MENU_ACTION_POKEMON':
        menu.destroy();
        await this.showPartyScreen();
        this.close({ destroy: () => {} });
        break;
      case 'MENU_ACTION_BAG':
        menu.destroy();
        await this.showBagScreen();
        this.close({ destroy: () => {} });
        break;
      case 'MENU_ACTION_PLAYER':
        menu.destroy();
        await this.showTrainerCard();
        this.close({ destroy: () => {} });
        break;
      case 'MENU_ACTION_OPTION':
        menu.destroy();
        // scene.start = atomic stop+launch (vs stop puis launch séparés = race
        // d'où freeze observé). OverworldScene reste paused (lancée par self).
        this.scene.start('OptionMenuScene', {
          returnScene: '',
          callerToResume: 'OverworldScene',
        });
        break;
      case 'MENU_ACTION_POKEDEX':
      case 'MENU_ACTION_POKENAV':
        await this.showStub(menu, action);
        break;
      default:
        this.close(menu);
    }
  }

  // ─── PartyMenuScene 1:1 décomp `party_menu.c` (readonly MVP) ────────────
  // Affiche les 6 slots party avec : sprite icon, nickname, level, HP bar.
  private async showPartyScreen(): Promise<void> {
    const overlay = this.add.rectangle(GAME_W / 2, 80, GAME_W, 160, 0x404858).setDepth(50000);
    overlay.setStrokeStyle(2, 0xf0f0f0);
    const title = this.add.text(8, 4, 'POKÉMON', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
    }).setDepth(50001);
    const items: Phaser.GameObjects.GameObject[] = [overlay, title];
    if (gameState.partySize === 0) {
      const empty = this.add.text(GAME_W / 2, 80, "Vous n'avez aucun Pokémon.", {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(50001);
      items.push(empty);
    } else {
      for (let i = 0; i < gameState.party.length; i++) {
        const p = gameState.party[i];
        const y = 24 + i * 22;
        const ratio = Math.max(0, Math.min(1, p.currentHp / Math.max(1, p.maxHp)));
        const name = this.add.text(8, y, `${p.nickname} N${p.level}`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
        }).setDepth(50001);
        const hpBg = this.add.rectangle(8, y + 12, 60, 4, 0x202020).setOrigin(0, 0).setDepth(50001);
        const hpColor = ratio > 0.5 ? 0x60c050 : ratio > 0.2 ? 0xc8b830 : 0xc04040;
        const hpBar = this.add.rectangle(8, y + 12, 60 * ratio, 4, hpColor).setOrigin(0, 0).setDepth(50002);
        const hpTxt = this.add.text(72, y + 9, `${p.currentHp}/${p.maxHp}`, {
          fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
        }).setDepth(50001);
        items.push(name, hpBg, hpBar, hpTxt);
      }
    }
    const hint = this.add.text(GAME_W / 2, 152, '[B] Retour', {
      fontFamily: 'monospace', fontSize: '8px', color: '#a0a0a0',
    }).setOrigin(0.5).setDepth(50001);
    items.push(hint);
    await this.waitClose();
    items.forEach(o => o.destroy());
  }

  // ─── BagMenuScene 1:1 décomp `item_menu.c` (readonly MVP) ──────────────
  // 5 poches : Items / Pokéballs / TM-HM / Berries / KeyItems. MVP : list flat.
  private async showBagScreen(): Promise<void> {
    const overlay = this.add.rectangle(GAME_W / 2, 80, GAME_W, 160, 0x4a4030).setDepth(50000);
    overlay.setStrokeStyle(2, 0xf0e0a0);
    const title = this.add.text(8, 4, 'SAC', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
    }).setDepth(50001);
    const items: Phaser.GameObjects.GameObject[] = [overlay, title];
    // gameState n'a pas (encore) de bag formel. On affiche un placeholder
    // basé sur les item-balls ramassées + futures additions.
    const taken: string[] = [];
    // takenItemBalls expose un .has(label) mais pas d'iteration. On skip
    // pour le MVP : on affiche juste "Sac vide" jusqu'à ce qu'on ait un vrai
    // bag.items[] dans gameState (Phase A.8 de la roadmap).
    if (taken.length === 0) {
      const empty = this.add.text(GAME_W / 2, 80, 'Sac vide.', {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(50001);
      items.push(empty);
    } else {
      const list = this.add.text(8, 24, taken.slice(0, 12).join('\n'), {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
        wordWrap: { width: GAME_W - 16 },
      }).setDepth(50001);
      items.push(list);
    }
    const hint = this.add.text(GAME_W / 2, 152, '[B] Retour', {
      fontFamily: 'monospace', fontSize: '8px', color: '#a0a0a0',
    }).setOrigin(0.5).setDepth(50001);
    items.push(hint);
    await this.waitClose();
    items.forEach(o => o.destroy());
  }

  // ─── TrainerCardScene 1:1 décomp `trainer_card.c` (MVP) ────────────────
  private async showTrainerCard(): Promise<void> {
    const overlay = this.add.rectangle(GAME_W / 2, 80, GAME_W, 160, 0x305878).setDepth(50000);
    overlay.setStrokeStyle(2, 0xb0d0f0);
    const title = this.add.text(GAME_W / 2, 8, 'CARTE DE DRESSEUR', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(50001);
    const id = (gameState.playerName.charCodeAt(0) * 100 + gameState.playerName.length * 7) % 65536;
    const lines = [
      `NOM    ${gameState.playerName}`,
      `N°     ${String(id).padStart(5, '0')}`,
      `GENRE  ${gameState.gender === 'MALE' ? 'Garçon' : 'Fille'}`,
      `BADGES 0/8`,
      `POKéMON  ${gameState.partySize}/6`,
      `ARGENT  ${(gameState as { money?: number }).money ?? 3000} ¥`,
    ];
    const txt = this.add.text(20, 32, lines.join('\n'), {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
    }).setDepth(50001);
    const hint = this.add.text(GAME_W / 2, 152, '[B] Retour', {
      fontFamily: 'monospace', fontSize: '8px', color: '#c0c0c0',
    }).setOrigin(0.5).setDepth(50001);
    await this.waitClose();
    [overlay, title, txt, hint].forEach(o => o.destroy());
  }

  /** Attente touche B / Echap / Espace pour fermer un sub-menu. */
  private waitClose(): Promise<void> {
    return new Promise(resolve => {
      const handler = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (k === 'b' || k === 'escape' || k === ' ') {
          this.input.keyboard?.off('keydown', handler);
          resolve();
        }
      };
      this.input.keyboard?.on('keydown', handler);
    });
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
