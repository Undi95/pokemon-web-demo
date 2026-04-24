import Phaser from 'phaser';
import { TILE_SIZE, GAME_W, GAME_H } from '../main';
import { registerTransparentSpriteSheet } from '../util/sprite-transparency';
import { setIdleFrame, playSingleStep, type Facing } from '../engine/character-anims';
import { buildTilemap, buildBorderTileSprite, type LoadedTilemap } from '../engine/tilemap-loader';
import { getMapNameFr } from '../data/map-names-fr';
import { resolveNpcs, type ResolvedNpc, type MapJson, type GraphicsTable } from '../engine/npc-loader';
import { runScript, type ParsedScripts } from '../engine/script-runner';
import { DialogueBox, preloadDialogueAssets } from '../engine/dialogue-box';

// Démo : Bourg-en-Vol (Littleroot Town).
const MAP_NAME = 'LittlerootTown';
const MAPSEC_ID = 'MAPSEC_LITTLEROOT_TOWN';
const TILESET_PAIR = 'general__petalburg';
const MAP_META_URL = `/decomp/em/rendered/meta/${MAP_NAME}.json`;
const MAP_JSON_URL = `/decomp/em/maps/${MAP_NAME}.json`;
const MAP_BIN_URL = `/decomp/em/layouts/${MAP_NAME}/map.bin`;
const BORDER_BIN_URL = `/decomp/em/layouts/${MAP_NAME}/border.bin`;
const PAIR_BASE = `/decomp/em/tileset-pairs/${TILESET_PAIR}`;
const GFX_TABLE_URL = '/decomp/em/object-event-graphics.json';
const SCRIPTS_URL = `/decomp/em/scripts/${MAP_NAME}.json`;

const PLAYER_SHEET = '/decomp/em/object_events/people/brendan/walking.png';
const PLAYER_TEX = 'player-walk-a';

interface MapMeta {
  id: string;
  name: string;
  tileWidth: number;
  tileHeight: number;
}

export class OverworldScene extends Phaser.Scene {
  private meta!: MapMeta;
  private tilemap!: LoadedTilemap;
  private playerTile = { x: 0, y: 0 };
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerFacing: Facing = 'down';
  private npcs: Array<ResolvedNpc & { sprite: Phaser.GameObjects.Sprite }> = [];
  private signs: Array<{ x: number; y: number; script: string }> = [];
  private dialogue!: DialogueBox;
  private parsedScripts!: ParsedScripts;
  private dialogueOpen = false;
  private inputLockUntil = 0;
  private moveCooldown = 220;

  constructor() {
    super({ key: 'OverworldScene' });
  }

  preload() {
    this.load.json('map-meta', MAP_META_URL);
    this.load.json('map-json', MAP_JSON_URL);
    this.load.json('gfx-table', GFX_TABLE_URL);
    this.load.binary('map-bin', MAP_BIN_URL);
    this.load.binary('border-bin', BORDER_BIN_URL);
    this.load.image('metatiles-lower', `${PAIR_BASE}/metatiles-lower.png`);
    this.load.image('metatiles-upper', `${PAIR_BASE}/metatiles-upper.png`);
    this.load.json('pair-info', `${PAIR_BASE}/info.json`);
    this.load.spritesheet('player-walk', PLAYER_SHEET, { frameWidth: 16, frameHeight: 32 });
    this.load.json('scripts', SCRIPTS_URL);
    preloadDialogueAssets(this);
  }

  create() {
    this.meta = this.cache.json.get('map-meta') as MapMeta;
    this.parsedScripts = this.cache.json.get('scripts') as ParsedScripts;
    this.dialogue = new DialogueBox(this);
    this.tilemap = buildTilemap(this, this.meta.tileWidth, this.meta.tileHeight);
    buildBorderTileSprite(this, this.tilemap.widthPx, this.tilemap.heightPx);

    registerTransparentSpriteSheet(this, 'player-walk', PLAYER_TEX, 16, 32);

    // Résolution des NPCs depuis map.json
    const mapJson = this.cache.json.get('map-json') as MapJson;
    const gfxTable = this.cache.json.get('gfx-table') as GraphicsTable;
    const resolved = resolveNpcs(mapJson, gfxTable);

    // Signs : bg_events avec type "sign" sont interactifs (pas de sprite,
    // le tile lui-même est dans la map).
    for (const bg of mapJson.bg_events ?? []) {
      if (bg.type === 'sign' && bg.script) {
        this.signs.push({ x: bg.x, y: bg.y, script: bg.script });
      }
    }

    // Spawn joueur à la playerStart de la map (warp_events[0] est typiquement le point d'entrée)
    const startX = mapJson.warp_events?.[0]?.x ?? Math.floor(this.meta.tileWidth / 2);
    const startY = (mapJson.warp_events?.[0]?.y ?? Math.floor(this.meta.tileHeight / 2)) + 1;
    this.spawnPlayer(startX, startY);

    // Caméra + HUD
    this.cameras.main.startFollow(this.playerSprite, true, 1, 1);
    const mapLabel = this.add.text(4, 4, getMapNameFr(MAPSEC_ID), {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
      backgroundColor: '#000000aa', padding: { x: 3, y: 1 }
    });
    mapLabel.setScrollFactor(0).setDepth(500);

    // Deuxième phase de chargement : sprites NPC (uniques)
    const seen = new Set<string>();
    for (const npc of resolved) {
      if (seen.has(npc.raw.graphics_id)) continue;
      seen.add(npc.raw.graphics_id);
      this.load.spritesheet(npc.sourceTextureKey, npc.spriteUrl, {
        frameWidth: npc.gfx.frameWidth,
        frameHeight: npc.gfx.frameHeight
      });
    }
    this.load.once('complete', () => this.onNpcsLoaded(resolved));
    this.load.start();

    this.bindInput();
  }

  private onNpcsLoaded(resolved: ResolvedNpc[]) {
    for (const npc of resolved) {
      // Certaines frames de sprites ne sont pas 16x32 (ex: petits enfants 16x16,
      // Pr. Seko 16x32 lui aussi). On retire la transparence pour chaque.
      if (!this.textures.exists(npc.textureKey)) {
        registerTransparentSpriteSheet(
          this, npc.sourceTextureKey, npc.textureKey,
          npc.gfx.frameWidth, npc.gfx.frameHeight
        );
      }
      const sprite = this.add.sprite(
        npc.raw.x * TILE_SIZE + TILE_SIZE / 2,
        npc.raw.y * TILE_SIZE + TILE_SIZE,
        npc.textureKey,
        0
      );
      sprite.setOrigin(0.5, 1).setDepth(10);
      setIdleFrame(sprite, npc.textureKey, 'down');
      this.npcs.push({ ...npc, sprite });
    }
  }

  private spawnPlayer(startX: number, startY: number) {
    // Ajuste si blocage
    let sx = startX, sy = startY;
    if (this.isBlocked(sx, sy)) {
      for (let r = 1; r < 10; r++) {
        for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
          if (!this.isBlocked(startX + dx, startY + dy)) { sx = startX + dx; sy = startY + dy; r = 99; break; }
        }
      }
    }
    this.playerTile = { x: sx, y: sy };
    this.playerSprite = this.add.sprite(
      sx * TILE_SIZE + TILE_SIZE / 2,
      sy * TILE_SIZE + TILE_SIZE,
      PLAYER_TEX, 0
    );
    this.playerSprite.setOrigin(0.5, 1).setDepth(10);
    setIdleFrame(this.playerSprite, PLAYER_TEX, 'down');
  }

  private bindInput() {
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      // Dialogue ouvert : DialogueBox intercepte déjà espace/enter/w en interne
      if (this.dialogueOpen) return;
      const k = e.key.toLowerCase();
      if (k === 'w') this.tryInteract();
      else if (k === 'b') { this.scene.launch('MenuOverlayScene'); this.scene.pause(); }
      else if (k === 'arrowup' || k === 'z') this.tryMove(0, -1, 'up');
      else if (k === 'arrowdown' || k === 's') this.tryMove(0, 1, 'down');
      else if (k === 'arrowleft' || k === 'q' || k === 'a') this.tryMove(-1, 0, 'left');
      else if (k === 'arrowright' || k === 'd') this.tryMove(1, 0, 'right');
    });
  }

  private tryMove(dx: number, dy: number, facing: Facing) {
    if (this.time.now < this.inputLockUntil) return;
    this.playerFacing = facing;
    const nx = this.playerTile.x + dx, ny = this.playerTile.y + dy;
    if (this.isBlocked(nx, ny)) {
      setIdleFrame(this.playerSprite, PLAYER_TEX, facing);
      this.inputLockUntil = this.time.now + 100;
      return;
    }
    playSingleStep(this.playerSprite, PLAYER_TEX, facing, this.moveCooldown);
    this.playerTile.x = nx; this.playerTile.y = ny;
    this.tweens.add({
      targets: this.playerSprite,
      x: nx * TILE_SIZE + TILE_SIZE / 2,
      y: ny * TILE_SIZE + TILE_SIZE,
      duration: this.moveCooldown,
      ease: 'Linear'
    });
    this.inputLockUntil = this.time.now + this.moveCooldown;
  }

  private isBlocked(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.tilemap.widthTiles || y >= this.tilemap.heightTiles) return true;
    if (this.tilemap.collisions[y]?.[x] === 1) return true;
    if (this.npcs.some(n => n.raw.x === x && n.raw.y === y)) return true;
    return false;
  }

  private async tryInteract() {
    if (this.dialogueOpen) return;
    let tx = this.playerTile.x, ty = this.playerTile.y;
    if (this.playerFacing === 'up') ty -= 1;
    if (this.playerFacing === 'down') ty += 1;
    if (this.playerFacing === 'left') tx -= 1;
    if (this.playerFacing === 'right') tx += 1;
    const npc = this.npcs.find(n => n.raw.x === tx && n.raw.y === ty);
    const sign = !npc && this.signs.find(s => s.x === tx && s.y === ty);
    const scriptName = npc?.raw.script || (sign && sign.script) || null;
    if (!scriptName || scriptName === '0x0') return;
    if (!this.parsedScripts.scripts[scriptName]) {
      await this.dialogue.show(`[script introuvable: ${scriptName}]`);
      return;
    }
    this.dialogueOpen = true;
    await runScript(scriptName, this.parsedScripts, {
      showText: (t) => this.dialogue.show(t),
      faceNpcToPlayer: () => { /* TODO : tourner le NPC */ },
      lockPlayer: () => { /* verrou géré par dialogueOpen */ },
      releasePlayer: () => { /* idem */ }
    });
    this.dialogueOpen = false;
  }
}
