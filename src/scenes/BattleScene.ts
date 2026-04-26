import Phaser from 'phaser';
import { Dex } from '@pkmn/dex';
import { GAME_W, GAME_H } from '../main';
import { runBattle, type BattleEvent } from '../battle/runner';
import { registerTransparentImage } from '../util/sprite-transparency';
import { gameState } from '../engine/game-state';
import { getTrainer, getSpeciesNameFr, getMoveNameFr } from '../engine/data-tables';
import { pokemonToShowdownSet, createPokemonInstance, speciesEnumToDexId, moveEnumToDexId, itemEnumToDexId } from '../engine/pokemon';
import { loadBattleTerrain, chooseBattleTerrain } from '../engine/battle-terrain';
import { loadMonPicCoords, getMonCoord, setMonPicCoordsCache } from '../engine/mon-pic-coords';
import { setMonAnimCache, getMonAnim, playMonAnim } from '../engine/mon-anim';
import type { MonSpec } from '../data/trainers';

const SPRITE_BASE = '/decomp/em/pokemon';
const UI_BASE = '/decomp/em/battle_interface';

// Coordonnées GBA singles battle (cf. décomp `src/battle_main.c` `BattleMainCB2`).
// Origine top-left (0,0), résolution 240×160.
const POS = {
  // Sprites Pokémon (origin centre-bas)
  opponentSpriteX: 184, opponentSpriteY: 64,    // ennemi haut-droit
  playerSpriteX: 56,    playerSpriteY: 112,    // joueur back bas-gauche
  // Healthboxes (top-left de la box, frame 64×32)
  opponentBoxX: 8,      opponentBoxY: 24,
  playerBoxX:   146,    playerBoxY:   80,
  // Textbox dialogue (bas, 224×40)
  textboxX: 8, textboxY: 112,
};

function spriteKeyFor(species: string) {
  return `mon_${species.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

function spriteUrlFor(species: string, kind: 'front' | 'back' | 'anim_front' = 'front') {
  // Le décomp utilise le nom EN canonique en lowercase pour les dossiers
  return `${SPRITE_BASE}/${species.toLowerCase()}/${kind}.png`;
}

interface BattleInitData {
  trainerId?: string;
  wildSpecies?: string;        // SPECIES_X enum
  wildLevel?: number;
  wildItem?: string;           // ITEM_X enum (optional)
  battleScene?: string;        // ex: MAP_BATTLE_SCENE_NORMAL → terrain
  onResult?: (r: 'win' | 'lose' | 'caught' | 'flee') => void;
}

/**
 * BattleScene refactorée pour Vague 3 :
 * - Accepte trainerId (combat dresseur) ou wildSpecies+level (combat sauvage)
 * - Construit le team adverse via @pkmn/dex (species name canonique EN)
 * - Construit le team joueur depuis gameState.party (struct PokemonInstance)
 * - Run @pkmn/sim, capture win/lose
 * - Callback onResult vers OverworldScene (qui resolve la promise du script-runner)
 *
 * Input joueur en combat : pas encore implémenté (RandomPlayerAI des deux côtés).
 */
export class BattleScene extends Phaser.Scene {
  private cfg!: BattleInitData;
  private playerTeam: MonSpec[] = [];
  private enemyTeam: MonSpec[] = [];
  private enemyName = 'Adversaire';
  private logLines: string[] = [];
  private logText!: Phaser.GameObjects.Text;
  private ended = false;
  private result: 'win' | 'lose' | 'caught' | 'flee' = 'win';
  // Refs UI 1:1 GBA (mises à jour pendant le combat — HP bars, status, etc.)
  private opponentHpBar?: Phaser.GameObjects.Rectangle;
  private playerHpBar?: Phaser.GameObjects.Rectangle;
  private opponentHpText?: Phaser.GameObjects.Text;
  private playerHpText?: Phaser.GameObjects.Text;
  // HP courants suivis depuis les events Showdown (parsé depuis `parts[3]`).
  private opponentHpRatio = 1;
  private playerHpRatio = 1;
  private playerCurHp = 0;
  private playerMaxHp = 0;

  constructor() { super({ key: 'BattleScene' }); }

  init(data: BattleInitData) {
    this.cfg = data ?? {};
    this.logLines = [];
    this.ended = false;
    this.buildTeams();
  }

  private buildTeams() {
    // === Team joueur depuis gameState.party ===
    if (gameState.partySize === 0) {
      // Fallback debug : le joueur n'a pas de Pokémon. Donne un Treecko.
      const fallback = createPokemonInstance('SPECIES_TREECKO', 5);
      gameState.addToParty(fallback);
    }
    this.playerTeam = gameState.party.map(p => {
      const set = pokemonToShowdownSet(p);
      return {
        species: set.species, level: set.level,
        moves: set.moves.length ? set.moves : ['tackle'],
        item: set.item, ability: set.ability, nature: set.nature,
        ivs: set.ivs, evs: set.evs,
      } as MonSpec;
    });

    // === Team adverse ===
    if (this.cfg.trainerId) {
      const trainer = getTrainer(this.cfg.trainerId);
      this.enemyName = trainer?.name || this.cfg.trainerId;
      this.enemyTeam = (trainer?.party ?? []).map(mon => {
        const sname = Dex.species.get(speciesEnumToDexId(mon.species)).name || 'Bulbasaur';
        const moves = (mon.moves && mon.moves.length)
          ? mon.moves.map(menu => Dex.moves.get(moveEnumToDexId(menu)).name || 'Tackle')
          : [];
        const item = mon.heldItem ? Dex.items.get(itemEnumToDexId(mon.heldItem)).name : '';
        return {
          species: sname, level: mon.level,
          moves: moves.length ? moves : ['Tackle'],
          item, ability: '', nature: 'Hardy',
          ivs: { hp: mon.iv, atk: mon.iv, def: mon.iv, spa: mon.iv, spd: mon.iv, spe: mon.iv },
        } as MonSpec;
      });
      if (this.enemyTeam.length === 0) {
        this.enemyTeam = [{ species: 'Zigzagoon', level: 5, moves: ['Tackle'], item: '', ability: '', nature: 'Hardy' }];
      }
    } else if (this.cfg.wildSpecies) {
      const sname = Dex.species.get(speciesEnumToDexId(this.cfg.wildSpecies)).name || 'Bulbasaur';
      const item = this.cfg.wildItem ? Dex.items.get(itemEnumToDexId(this.cfg.wildItem)).name : '';
      this.enemyName = `${sname} sauvage`;
      this.enemyTeam = [{
        species: sname, level: this.cfg.wildLevel ?? 5,
        moves: ['Tackle'], item, ability: '', nature: 'Hardy',
      }];
    } else {
      // Fallback démo
      this.enemyName = 'Démo';
      this.enemyTeam = [{ species: 'Pikachu', level: 5, moves: ['Tackle'], item: '', ability: '', nature: 'Hardy' }];
    }
  }

  preload() {
    // Sprites Pokémon : SPRITESHEET 64×64 par frame (pas image simple).
    // Cas Pochyena : front.png = 64×256 (atlas 4 frames anim idle). Autres :
    // 64×64 (1 frame). Phaser gère les 2 cas via spritesheet, on affiche frame 0.
    if (this.playerTeam[0]) {
      const s = this.playerTeam[0].species;
      this.load.spritesheet(spriteKeyFor(s) + '_back', spriteUrlFor(s, 'back'),
        { frameWidth: 64, frameHeight: 64 });
    }
    if (this.enemyTeam[0]) {
      const s = this.enemyTeam[0].species;
      this.load.spritesheet(spriteKeyFor(s) + '_front', spriteUrlFor(s, 'front'),
        { frameWidth: 64, frameHeight: 64 });
      // anim_front.png : 64×128 = 2 frames idle anim. Présent pour tous les
      // Pokémon Hoenn (cf. décomp pokeemerald/graphics/pokemon/<species>/anim_front.png).
      this.load.spritesheet(spriteKeyFor(s) + '_anim_front', spriteUrlFor(s, 'anim_front'),
        { frameWidth: 64, frameHeight: 64 });
    }
    // UI battle décomp (asset 1:1 GBA, copiés via extract-battle-ui.mjs).
    // Spritesheets : healthbox_singles_player est un atlas vertical 4×(64x32).
    if (!this.textures.exists('battle-hb-opponent')) {
      this.load.spritesheet('battle-hb-opponent', `${UI_BASE}/healthbox_singles_opponent.png`,
        { frameWidth: 64, frameHeight: 32 });
    }
    if (!this.textures.exists('battle-hb-player')) {
      this.load.spritesheet('battle-hb-player', `${UI_BASE}/healthbox_singles_player.png`,
        { frameWidth: 64, frameHeight: 32 });
    }
    if (!this.textures.exists('battle-textbox')) {
      this.load.image('battle-textbox', `${UI_BASE}/textbox.png`);
    }
    // Mon coords (yOffset par species pour positionner les sprites volants
    // ou statiques correctement). Loadé via Phaser cache → dispo sync en create.
    if (!this.cache.json.has('mon-coords')) {
      this.load.json('mon-coords', '/decomp/em/mon-pic-coords.json');
    }
    if (!this.cache.json.has('mon-anims')) {
      this.load.json('mon-anims', '/decomp/em/pokemon-anims.json');
    }
    if (!this.cache.json.has('cries-map')) {
      this.load.json('cries-map', '/decomp/em/cries.json');
    }
    void loadMonPicCoords; // tease ts-unused
  }

  create() {
    // Init mon coords + mon anims cache (loaded via Phaser preload, dispo sync).
    setMonPicCoordsCache(this.cache.json.get('mon-coords'));
    setMonAnimCache(this.cache.json.get('mon-anims'));

    // Placeholder visible pendant que le terrain async se compose (~50-100ms).
    // Depth -100 = tout en arrière. Les ellipses "sol" ont été retirées car
    // elles dépassaient du terrain composé et créaient des artéfacts visuels.
    const placeholderBg = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x60a0c8)
      .setDepth(-100);

    // Battle terrain 1:1 GBA composé depuis tiles.png + map.bin + palette.
    // Affiché en background à depth -10 (derrière sprites + healthboxes).
    // Le tilemap fait 512×256 (BG_SIZE 1 GBA). Display à (0,0) → on voit la
    // moitié haut-gauche 240×160 = scene battle composée. Les positions
    // sprites POS.opponentSpriteY/playerSpriteY sont calées sur les
    // plate-formes du tilemap (à ajuster si désync visible).
    const terrainName = chooseBattleTerrain(this.cfg.battleScene);
    void loadBattleTerrain(this, terrainName).then((key) => {
      if (!key) return;
      placeholderBg.setVisible(false);
      this.add.image(0, 0, key).setOrigin(0, 0).setDepth(-10);
    });

    // === Sprites Pokémon ===
    // Position basée sur sol GBA + yOffset par species (Pidgeot vole haut,
    // Caterpie au sol, etc.). Cf. `mon-pic-coords.ts` qui charge le mapping
    // depuis `gMonFrontPicCoords[]` / `gMonBackPicCoords[]` du décomp.
    if (this.enemyTeam[0]) {
      const s = this.enemyTeam[0].species;
      // Préfère anim_front.png (2 frames idle) si chargé, sinon front.png statique.
      // anim_front frameTotal = 3 (2 frames + __BASE) confirme atlas valide.
      const animKey = spriteKeyFor(s) + '_anim_front';
      const staticKey = spriteKeyFor(s) + '_front';
      const useAnim = this.textures.exists(animKey) && this.textures.get(animKey).frameTotal >= 3;
      const k = useAnim ? animKey : staticKey;
      if (this.textures.exists(k)) {
        const c = getMonCoord(s, 'front');
        const baseX = POS.opponentSpriteX;
        const baseY = POS.opponentSpriteY + c.yOffset;
        const img = this.add.sprite(baseX, baseY, k, 0);
        img.setOrigin(0.5, 1).setDepth(5);
        // 1:1 décomp : `Anim_VerticalShake` etc. dure 60 frames @60fps = ~1s.
        // Pas de bobbing continu — sprite reste fixe sur frame 0 après l'entry.
        // Pendant l'anim, on alterne juste 1 fois la frame (pose alt) → return 0.
        if (useAnim) {
          this.time.delayedCall(500, () => { if (img.active) img.setFrame(1); });
          this.time.delayedCall(1000, () => { if (img.active) img.setFrame(0); });
        }
        const animEntry = getMonAnim(s);
        if (animEntry) {
          const delayMs = (animEntry.delay || 0) * (1000 / 60);
          this.time.delayedCall(delayMs, () => {
            if (img.active) playMonAnim(this, img, animEntry.frontAnimId, baseX, baseY);
          });
        }
        // Cri Pokémon (1:1 décomp : joué quand la pokeball s'ouvre = APRÈS
        // l'anim entry mon ~1s. On n'a pas d'anim ball, on délaie ~1.2s pour
        // que ça matche le timing post-entry).
        const criesMap = this.cache.json.get('cries-map') as Record<string, string> | undefined;
        const enumKey = 'SPECIES_' + s.toUpperCase().replace(/[\s-]/g, '_');
        const cryUrl = criesMap?.[enumKey];
        if (cryUrl) {
          this.time.delayedCall(1200, () => {
            try {
              const audio = new Audio('/decomp/em/' + cryUrl);
              audio.volume = 0.7;
              void audio.play().catch(() => {/* autoplay block, ignore */});
            } catch {/* ignore */}
          });
        }
      } else {
        console.warn(`[BattleScene] enemy sprite key "${k}" not in textures cache (load failed?)`);
      }
    }
    if (this.playerTeam[0]) {
      const s = this.playerTeam[0].species;
      const k = spriteKeyFor(s) + '_back';
      if (this.textures.exists(k)) {
        const c = getMonCoord(s, 'back');
        const img = this.add.sprite(POS.playerSpriteX, POS.playerSpriteY + c.yOffset, k, 0);
        img.setOrigin(0.5, 1).setDepth(5);
      } else {
        console.warn(`[BattleScene] player sprite key "${k}" not in textures cache (load failed?)`);
      }
    }

    // === Healthbox opponent (top-left) — frame 0 du spritesheet ===
    this.add.image(POS.opponentBoxX, POS.opponentBoxY, 'battle-hb-opponent', 0)
      .setOrigin(0, 0);
    // Texte nom + level (Pokémon FR depuis SpeciesNameFr si dispo)
    const enemyMon = this.enemyTeam[0];
    if (enemyMon) {
      const nameFr = getSpeciesNameFr('SPECIES_' + enemyMon.species.toUpperCase()) || enemyMon.species;
      this.add.text(POS.opponentBoxX + 6, POS.opponentBoxY + 3, nameFr, {
        fontFamily: 'monospace', fontSize: '8px', color: '#404040'
      });
      this.add.text(POS.opponentBoxX + 44, POS.opponentBoxY + 3, `N${enemyMon.level}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#404040'
      });
      // HP bar (vert au max → jaune <50% → rouge <20%) — width 48px max
      this.opponentHpBar = this.add.rectangle(POS.opponentBoxX + 14, POS.opponentBoxY + 16, 48, 3, 0x60c050)
        .setOrigin(0, 0);
      this.opponentHpText = this.add.text(POS.opponentBoxX + 14, POS.opponentBoxY + 20, '', {
        fontFamily: 'monospace', fontSize: '7px', color: '#404040'
      });
    }

    // === Healthbox player (mid-right) ===
    this.add.image(POS.playerBoxX, POS.playerBoxY, 'battle-hb-player', 0)
      .setOrigin(0, 0);
    const playerMon = this.playerTeam[0];
    if (playerMon) {
      const nameFr = getSpeciesNameFr('SPECIES_' + playerMon.species.toUpperCase()) || playerMon.species;
      this.add.text(POS.playerBoxX + 6, POS.playerBoxY + 3, nameFr, {
        fontFamily: 'monospace', fontSize: '8px', color: '#404040'
      });
      this.add.text(POS.playerBoxX + 44, POS.playerBoxY + 3, `N${playerMon.level}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#404040'
      });
      // HP : on a accès au struct PokemonInstance pour les vrais HP
      const realMon = gameState.party[0];
      this.playerCurHp = realMon?.currentHp ?? 100;
      this.playerMaxHp = realMon?.maxHp ?? 100;
      this.playerHpBar = this.add.rectangle(POS.playerBoxX + 14, POS.playerBoxY + 16, 48, 3, 0x60c050)
        .setOrigin(0, 0);
      this.playerHpText = this.add.text(POS.playerBoxX + 14, POS.playerBoxY + 20,
        `${this.playerCurHp}/${this.playerMaxHp}`, {
        fontFamily: 'monospace', fontSize: '7px', color: '#404040'
      });
    }

    // === Textbox dialogue/log (bas) — image décomp 128×128 mais on n'utilise
    // que la partie utile en haut-gauche (cadre du dialogue de combat). MVP :
    // simple rect blanc + log texte par-dessus. 9-slice à venir.
    this.add.rectangle(GAME_W / 2, GAME_H - 24, GAME_W - 4, 44, 0xf8f8f8)
      .setStrokeStyle(2, 0x404040);
    this.logText = this.add.text(POS.textboxX + 4, POS.textboxY + 4, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#202020',
      wordWrap: { width: GAME_W - 16 }
    });
    this.add.text(GAME_W - 64, GAME_H - 8, 'ESPACE = fin', {
      fontFamily: 'monospace', fontSize: '6px', color: '#606060'
    });

    this.input.keyboard?.on('keydown-ESC', () => this.exit());
    this.input.keyboard?.on('keydown-SPACE', () => { if (this.ended) this.exit(); });

    const enemyNameFr = enemyMon
      ? (getSpeciesNameFr('SPECIES_' + enemyMon.species.toUpperCase()) || enemyMon.species)
      : '?';
    const playerNameFr = playerMon
      ? (getSpeciesNameFr('SPECIES_' + playerMon.species.toUpperCase()) || playerMon.species)
      : '?';
    this.appendLog(`Un ${enemyNameFr} sauvage apparaît !`);
    this.appendLog(`Go ! ${playerNameFr} !`);

    void this.runSim();
  }

  /** Met à jour la barre HP avec couleur dynamique (vert/jaune/rouge). */
  private updateHpBar(bar: Phaser.GameObjects.Rectangle | undefined, ratio: number): void {
    if (!bar) return;
    const r = Math.max(0, Math.min(1, ratio));
    bar.width = Math.round(48 * r);
    const color = r > 0.5 ? 0x60c050 : r > 0.2 ? 0xc8b830 : 0xc04040;
    bar.fillColor = color;
  }

  private async runSim() {
    try {
      const winner = await runBattle(this.playerTeam, this.enemyTeam, e => this.onBattleEvent(e));
      this.ended = true;
      this.result = winner === 'Joueur' ? 'win' : 'lose';
      this.appendLog(`--- Fin. Vainqueur : ${winner} ---`);
      this.appendLog(`(ESPACE pour revenir)`);
    } catch (err) {
      this.ended = true;
      this.result = 'lose';
      this.appendLog(`[Erreur moteur] ${String(err)}`);
    }
  }

  private onBattleEvent(e: BattleEvent) {
    const line = e.text;
    if (line.startsWith('|move|')) {
      const parts = line.split('|');
      const user = (parts[2] ?? '').split(':')[1]?.trim() ?? '';
      const moveEn = parts[3] ?? '';
      const moveFr = getMoveNameFr('MOVE_' + moveEn.toUpperCase().replace(/[ \-]/g, '_')) || moveEn;
      this.appendLog(`${this.toFr(user)} utilise ${moveFr} !`);
    } else if (line.startsWith('|-damage|')) {
      const parts = line.split('|');
      const target = (parts[2] ?? '');                   // ex: "p1a: Treecko"
      const targetSide = target.startsWith('p1') ? 'player' : 'opponent';
      const targetName = target.split(':')[1]?.trim() ?? '';
      const hpField = parts[3] ?? '';                    // ex: "10/14" ou "0 fnt"
      const m = hpField.match(/^(\d+)\/(\d+)/);
      let cur = 0, max = 1;
      if (m) { cur = Number(m[1]); max = Number(m[2]); }
      const ratio = cur / max;
      if (targetSide === 'player') {
        this.playerHpRatio = ratio;
        this.playerCurHp = cur;
        this.playerMaxHp = max;
        this.updateHpBar(this.playerHpBar, ratio);
        if (this.playerHpText) this.playerHpText.setText(`${cur}/${max}`);
      } else {
        this.opponentHpRatio = ratio;
        this.updateHpBar(this.opponentHpBar, ratio);
        // Pas de chiffres HP pour l'opponent (convention GBA)
      }
      this.appendLog(`  → ${this.toFr(targetName)} : PV ${cur}/${max}`);
    } else if (line.startsWith('|faint|')) {
      const parts = line.split('|');
      const name = (parts[2] ?? '').split(':')[1]?.trim() ?? '';
      this.appendLog(`${this.toFr(name)} est K.O. !`);
    } else if (line.startsWith('|-supereffective|')) this.appendLog(`  (c'est très efficace !)`);
    else if (line.startsWith('|-resisted|')) this.appendLog(`  (ça résiste...)`);
    else if (line.startsWith('|-miss|')) this.appendLog(`  (raté !)`);
    else if (line.startsWith('|-crit|')) this.appendLog(`  (coup critique !)`);
    else if (line.startsWith('|-status|')) {
      const parts = line.split('|');
      const name = (parts[2] ?? '').split(':')[1]?.trim() ?? '';
      const st = parts[3] ?? '';
      const stFr: Record<string, string> = { brn: 'brûlé', frz: 'gelé', par: 'paralysé', psn: 'empoisonné', tox: 'gravement empoisonné', slp: 'endormi' };
      this.appendLog(`${this.toFr(name)} est ${stFr[st] || st} !`);
    }
  }

  /** Convertit nom EN canonique Showdown → FR si dispo dans data-tables. */
  private toFr(speciesEn: string): string {
    if (!speciesEn) return speciesEn;
    return getSpeciesNameFr('SPECIES_' + speciesEn.toUpperCase().replace(/[ \-]/g, '_')) || speciesEn;
  }

  private appendLog(text: string) {
    this.logLines.push(text);
    const visible = this.logLines.slice(-12);
    this.logText.setText(visible.join('\n'));
  }

  private exit() {
    // Callback vers OverworldScene
    this.cfg.onResult?.(this.result);
    this.scene.stop();
    this.scene.resume('OverworldScene');
  }
}
