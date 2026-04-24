import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { PLAYER_TEAM, type NpcDef } from '../data/trainers';
import { runBattle, type BattleEvent } from '../battle/runner';
import { registerTransparentImage } from '../util/sprite-transparency';

const SPRITE_BASE = '/decomp/em/pokemon';

function spriteKeyFor(species: string) {
  return `mon_${species.toLowerCase()}`;
}

function spriteUrlFor(species: string, kind: 'front' | 'back' = 'front') {
  return `${SPRITE_BASE}/${species.toLowerCase()}/${kind}.png`;
}

export class BattleScene extends Phaser.Scene {
  private trainer!: NpcDef;
  private logLines: string[] = [];
  private logText!: Phaser.GameObjects.Text;
  private ended = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { trainer: NpcDef }) {
    this.trainer = data.trainer;
    this.logLines = [];
    this.ended = false;
  }

  preload() {
    // Load front sprites for player's team (back would be more accurate, front is fine for demo)
    for (const mon of PLAYER_TEAM) {
      this.load.image(spriteKeyFor(mon.species), spriteUrlFor(mon.species, 'back'));
    }
    for (const mon of this.trainer.team) {
      this.load.image(spriteKeyFor(mon.species), spriteUrlFor(mon.species, 'front'));
    }
  }

  create() {
    // Background
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x1b1b2e);

    // Battle arena (upper half)
    const arenaH = 96;
    this.add.rectangle(GAME_W / 2, arenaH / 2, GAME_W, arenaH, 0x2a3a5a);

    // Apply transparency to sprites (palette color 0 → alpha 0)
    const playerMon = PLAYER_TEAM[0];
    const enemyMon = this.trainer.team[0];
    registerTransparentImage(this, spriteKeyFor(playerMon.species), spriteKeyFor(playerMon.species) + '-a');
    registerTransparentImage(this, spriteKeyFor(enemyMon.species), spriteKeyFor(enemyMon.species) + '-a');

    // Enemy sprite (front) — top right
    const enemySprite = this.add.image(GAME_W - 52, 36, spriteKeyFor(enemyMon.species) + '-a');
    enemySprite.setScale(1);

    // Player sprite (back) — bottom left of arena
    const playerSprite = this.add.image(52, arenaH - 12, spriteKeyFor(playerMon.species) + '-a');
    playerSprite.setScale(1);
    playerSprite.setOrigin(0.5, 1);

    // Labels
    this.add.text(8, 4, `${this.trainer.name} - ${enemyMon.species} N.${enemyMon.level}`, {
      fontFamily: 'monospace', fontSize: '7px', color: '#ffffff'
    });
    this.add.text(8, arenaH - 10, `Vous - ${playerMon.species} N.${playerMon.level}`, {
      fontFamily: 'monospace', fontSize: '7px', color: '#ffffaa'
    });

    // Log panel (lower half)
    this.add.rectangle(GAME_W / 2, arenaH + (GAME_H - arenaH) / 2, GAME_W, GAME_H - arenaH, 0x000000);
    this.logText = this.add.text(6, arenaH + 4, '', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#c8f0c8',
      wordWrap: { width: GAME_W - 12 }
    });

    this.add.text(GAME_W - 86, GAME_H - 8, 'ÉCHAP pour quitter', {
      fontFamily: 'monospace', fontSize: '6px', color: '#888888'
    });

    this.input.keyboard?.on('keydown-ESC', () => this.exit());
    this.input.keyboard?.on('keydown-SPACE', () => { if (this.ended) this.exit(); });

    this.appendLog(`Un combat démarre !`);
    this.appendLog(`${this.trainer.name} envoie ${enemyMon.species} !`);
    this.appendLog(`Vous envoyez ${playerMon.species} !`);

    // Kick off the simulation
    void this.runSim();
  }

  private async runSim() {
    try {
      const winner = await runBattle(
        PLAYER_TEAM,
        this.trainer.team,
        (e: BattleEvent) => this.onBattleEvent(e)
      );
      this.ended = true;
      this.appendLog(`--- Fin du combat. Vainqueur : ${winner} ---`);
      this.appendLog(`(ÉCHAP ou ESPACE pour revenir)`);
    } catch (err) {
      this.ended = true;
      this.appendLog(`[Erreur moteur] ${String(err)}`);
    }
  }

  private onBattleEvent(e: BattleEvent) {
    // Showdown protocol lines start with | — keep only "interesting" ones for the log
    const line = e.text;
    if (line.startsWith('|move|')) {
      const parts = line.split('|');
      const user = parts[2] ?? '';
      const move = parts[3] ?? '';
      this.appendLog(`${user.split(':')[1]?.trim() ?? user} utilise ${move} !`);
    } else if (line.startsWith('|-damage|')) {
      const parts = line.split('|');
      this.appendLog(`  → ${parts[2]?.split(':')[1]?.trim() ?? parts[2]}  PV: ${parts[3]}`);
    } else if (line.startsWith('|faint|')) {
      const parts = line.split('|');
      this.appendLog(`${parts[2]?.split(':')[1]?.trim() ?? parts[2]} est K.O. !`);
    } else if (line.startsWith('|-supereffective|')) {
      this.appendLog(`  (c'est très efficace !)`);
    } else if (line.startsWith('|-resisted|')) {
      this.appendLog(`  (ça résiste...)`);
    } else if (line.startsWith('|-miss|')) {
      this.appendLog(`  (raté !)`);
    } else if (line.startsWith('|-crit|')) {
      this.appendLog(`  (coup critique !)`);
    } else if (line.startsWith('|win|')) {
      // handled by append above in runSim
    }
  }

  private appendLog(text: string) {
    this.logLines.push(text);
    // Keep last N lines visible
    const visible = this.logLines.slice(-12);
    this.logText.setText(visible.join('\n'));
  }

  private exit() {
    this.scene.start('OverworldScene');
  }
}
