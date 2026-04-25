import Phaser from 'phaser';
import { TILE_SIZE, GAME_W, GAME_H } from '../main';
import { registerTransparentSpriteSheet } from '../util/sprite-transparency';
import { setIdleFrame, playSingleStep, type Facing } from '../engine/character-anims';
import { buildTilemap, buildBorderTileSprite, isDoorWarp, type LoadedTilemap } from '../engine/tilemap-loader';
import { getMapNameFr } from '../data/map-names-fr';
import { resolveNpcs, type ResolvedNpc, type MapJson, type GraphicsTable } from '../engine/npc-loader';
import { runScript, type ParsedScripts, type ScriptContext } from '../engine/script-runner';
import { runMapScript, runOnFrameTable } from '../engine/map-scripts';
import { runMovement, type MovementSprite } from '../engine/movement';
import { DialogueBox, preloadDialogueAssets } from '../engine/dialogue-box';
import { primeAudio, playMidiLoop } from '../engine/music';
import { preloadDoorAnim, setupDoorAnim, playDoorOpen } from '../engine/door-anim';
import { gameState } from '../engine/game-state';

const BASE = '/decomp/em';
const PLAYER_TEX = 'player-walk-a';
const PLAYER_RUN_TEX = 'player-run-a';
function playerSheetUrl(gender: 'MALE' | 'FEMALE', kind: 'walking' | 'running') {
  const name = gender === 'FEMALE' ? 'may' : 'brendan';
  return `${BASE}/object_events/people/${name}/${kind}.png`;
}

const CACHE_KEYS_GLOBAL = ['layouts-index', 'layout-to-pair', 'map-ids', 'gfx-table'];
const CACHE_KEYS_MAP_JSON = ['map-json', 'scripts', 'pair-info'];
const CACHE_KEYS_MAP_BIN = ['map-bin', 'border-bin', 'attrs-primary', 'attrs-secondary'];
const TEX_KEYS_MAP = ['metatiles-lower', 'metatiles-upper', 'border-tile'];

// gTileset_BrendansMaysHouse → brendans_mays_house (chemin sur disque)
function tilesetDir(gname: string): string {
  return gname.replace(/^gTileset_/, '').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

const WALK_COOLDOWN = 220;
const RUN_COOLDOWN = 120;
const TAP_TURN_THRESHOLD_MS = 80; // < 80ms d'appui = juste tourne, >= = marche

interface LayoutDef {
  id: string; name: string;
  width: number; height: number;
  primary_tileset: string; secondary_tileset?: string;
  blockdata_filepath: string; border_filepath: string;
}

const DELTA: Record<Facing, [number, number]> = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]
};

export class OverworldScene extends Phaser.Scene {
  private mapName!: string;
  private warpIdTarget: string | null = null;
  private arrivedFromIndoor = false;
  private tilemap!: LoadedTilemap;
  private layoutDef!: LayoutDef;
  private mapJson!: MapJson;
  private playerTile = { x: 0, y: 0 };
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerFacing: Facing = 'down';
  private npcs: Array<ResolvedNpc & { sprite: Phaser.GameObjects.Sprite }> = [];
  private signs: Array<{ x: number; y: number; script: string }> = [];
  private dialogue!: DialogueBox;
  private parsedScripts!: ParsedScripts;
  private dialogueOpen = false;
  private inputLockUntil = 0;
  private musicStarted = false;
  private mapReady = false;

  // Input state
  private heldDir: Facing | null = null;
  private heldSince = 0;
  private keyX!: Phaser.Input.Keyboard.Key;

  // Movements lancés par les scripts (pour synchroniser waitmovement)
  private pendingMovements: Map<string, Promise<void>> = new Map();

  constructor() { super({ key: 'OverworldScene' }); }

  private spawnOverride: { x: number; y: number } | null = null;

  init(data: { mapName?: string; warpId?: string; fromIndoor?: boolean; spawnX?: number; spawnY?: number } = {}) {
    this.mapName = data.mapName ?? 'LittlerootTown';
    this.warpIdTarget = data.warpId ?? null;
    this.arrivedFromIndoor = data.fromIndoor ?? false;
    this.spawnOverride = (data.spawnX != null && data.spawnY != null) ? { x: data.spawnX, y: data.spawnY } : null;
    this.npcs = []; this.signs = [];
    this.dialogueOpen = false; this.mapReady = false;
    this.heldDir = null; this.inputLockUntil = 0;
  }

  preload() {
    for (const k of CACHE_KEYS_GLOBAL) this.cache.json.remove(k);
    this.load.json('layouts-index', `${BASE}/layouts-index.json`);
    this.load.json('layout-to-pair', `${BASE}/tileset-pairs/layout-to-pair.json`);
    this.load.json('map-ids', `${BASE}/map-ids.json`);
    this.load.json('gfx-table', `${BASE}/object-event-graphics.json`);
    for (const k of CACHE_KEYS_MAP_JSON) this.cache.json.remove(k);
    this.load.json('map-json', `${BASE}/maps/${this.mapName}.json`);
    this.load.json('scripts', `${BASE}/scripts/${this.mapName}.json`);
    // _all.json = pool global de tous les labels (decomp utilise un namespace
    // partagé entre fichiers, ex. MaysHouse goto PlayersHouse défini ailleurs).
    if (!this.cache.json.has('scripts-all')) this.load.json('scripts-all', `${BASE}/scripts/_all.json`);
    preloadDialogueAssets(this);
    preloadDoorAnim(this);
    this.load.spritesheet('player-walk', playerSheetUrl(gameState.gender, 'walking'), { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('player-run', playerSheetUrl(gameState.gender, 'running'), { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    this.mapJson = this.cache.json.get('map-json') as MapJson;
    const layoutsIndex = this.cache.json.get('layouts-index') as { layouts: LayoutDef[] };
    const layoutToPair = this.cache.json.get('layout-to-pair') as Record<string, string>;
    this.layoutDef = layoutsIndex.layouts.find(l => l.id === this.mapJson.layout)!;
    const pair = layoutToPair[this.mapJson.layout];
    if (!this.layoutDef || !pair) { console.error('[overworld] layout/pair manquants', this.mapName); return; }
    const layoutDir = this.layoutDef.blockdata_filepath.replace(/^data\/layouts\//, '').replace(/\/map\.bin$/, '');

    for (const k of CACHE_KEYS_MAP_BIN) this.cache.binary.remove(k);
    for (const k of TEX_KEYS_MAP) this.textures.remove(k);
    this.load.image('metatiles-lower', `${BASE}/tileset-pairs/${pair}/metatiles-lower.png`);
    this.load.image('metatiles-upper', `${BASE}/tileset-pairs/${pair}/metatiles-upper.png`);
    this.load.json('pair-info', `${BASE}/tileset-pairs/${pair}/info.json`);
    this.load.binary('map-bin', `${BASE}/layouts/${layoutDir}/map.bin`);
    this.load.binary('border-bin', `${BASE}/layouts/${layoutDir}/border.bin`);
    // Metatile attributes (behaviors) pour distinguer porte / escalier / herbe
    const primDir = tilesetDir(this.layoutDef.primary_tileset);
    this.load.binary('attrs-primary', `${BASE}/tilesets/primary/${primDir}/metatile_attributes.bin`);
    if (this.layoutDef.secondary_tileset) {
      const secDir = tilesetDir(this.layoutDef.secondary_tileset);
      this.load.binary('attrs-secondary', `${BASE}/tilesets/secondary/${secDir}/metatile_attributes.bin`);
    }
    this.load.once('complete', () => this.afterMapLoad());
    this.load.start();
  }

  private afterMapLoad() {
    const mapScripts = this.cache.json.get('scripts') as ParsedScripts;
    const all = this.cache.json.get('scripts-all') as ParsedScripts;
    // Pool global en fallback, scripts de la map en priorité haute (au cas où
    // un même label serait redéfini localement dans une map précise).
    this.parsedScripts = {
      scripts: { ...all.scripts, ...mapScripts.scripts },
      texts: { ...all.texts, ...mapScripts.texts }
    };
    this.dialogue = new DialogueBox(this);
    this.tilemap = buildTilemap(this, this.layoutDef.width, this.layoutDef.height);
    buildBorderTileSprite(this, this.tilemap.widthPx, this.tilemap.heightPx);

    registerTransparentSpriteSheet(this, 'player-walk', PLAYER_TEX, 16, 32);
    registerTransparentSpriteSheet(this, 'player-run', PLAYER_RUN_TEX, 16, 32);
    setupDoorAnim(this);

    const gfxTable = this.cache.json.get('gfx-table') as GraphicsTable;
    const resolved = resolveNpcs(this.mapJson, gfxTable,
      (f) => gameState.hasFlag(f),
      (id) => gameState.getObjectXY(this.mapName, id));

    for (const bg of this.mapJson.bg_events ?? []) {
      if (bg.type === 'sign' && bg.script) this.signs.push({ x: bg.x, y: bg.y, script: bg.script });
    }

    // Priorité spawn : override scène > warpId > centre map
    let startX: number, startY: number;
    if (this.spawnOverride) {
      startX = this.spawnOverride.x; startY = this.spawnOverride.y;
    } else {
      const warps = this.mapJson.warp_events ?? [];
      const entry = (this.warpIdTarget != null) ? warps[Number(this.warpIdTarget)] ?? warps[0] : warps[0];
      startX = entry?.x ?? Math.floor(this.layoutDef.width / 2);
      startY = entry?.y ?? Math.floor(this.layoutDef.height / 2);
    }
    this.spawnPlayer(startX, startY);

    // Orientation à l'arrivée
    if (this.isIndoor()) {
      this.playerFacing = 'up';
      setIdleFrame(this.playerSprite, PLAYER_TEX, 'up');
    } else if (this.arrivedFromIndoor) {
      this.playerFacing = 'down';
      setIdleFrame(this.playerSprite, PLAYER_TEX, 'down');
    }

    this.cameras.main.startFollow(this.playerSprite, true, 1, 1);

    // Le decomp affiche le nom de zone seulement quand show_map_name=true
    // (vrai pour outdoor villes/routes, faux pour intérieurs).
    if (this.mapJson.show_map_name !== false) {
      const mapLabel = this.add.text(4, 4, getMapNameFr(this.mapJson.region_map_section) || this.mapName, {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
        backgroundColor: '#000000aa', padding: { x: 3, y: 1 }
      });
      mapLabel.setScrollFactor(0).setDepth(200000);
    }

    // NPCs : second loading phase
    const seen = new Set<string>();
    for (const npc of resolved) {
      if (seen.has(npc.raw.graphics_id)) continue;
      seen.add(npc.raw.graphics_id);
      this.load.spritesheet(npc.sourceTextureKey, npc.spriteUrl, {
        frameWidth: npc.gfx.frameWidth, frameHeight: npc.gfx.frameHeight
      });
    }
    this.load.once('complete', () => this.afterNpcsLoad(resolved));
    this.load.start();

    this.setupInput();
    this.mapReady = true;

    // Auto-step down après warp UNIQUEMENT si la tile d'arrivée est une porte
    // (MB_ANIMATED_DOOR / MB_NON_ANIMATED_DOOR / MB_WATER_DOOR). Pour escaliers,
    // arrows et autres warps on reste sur la tile (le décomp ne push pas non plus).
    if (this.warpIdTarget != null || this.arrivedFromIndoor) {
      const beh = this.tilemap.behaviors[startY]?.[startX] ?? 0;
      if (isDoorWarp(beh)) {
        this.time.delayedCall(120, () => {
          this.inputLockUntil = 0;
          this.tryMove(0, 1, 'down', false);
        });
      }
    }

    if (this.mapJson.music) {
      const musName = this.mapJson.music.toLowerCase() + '.mid';
      this.time.delayedCall(300, () => {
        if (this.musicStarted) void playMidiLoop(`${BASE}/music/${musName}`);
      });
    }
  }

  private afterNpcsLoad(resolved: ResolvedNpc[]) {
    for (const npc of resolved) {
      if (!this.textures.exists(npc.textureKey)) {
        registerTransparentSpriteSheet(this, npc.sourceTextureKey, npc.textureKey, npc.gfx.frameWidth, npc.gfx.frameHeight);
      }
      const sprite = this.add.sprite(
        npc.raw.x * TILE_SIZE + TILE_SIZE / 2,
        npc.raw.y * TILE_SIZE + TILE_SIZE,
        npc.textureKey, 0
      );
      sprite.setOrigin(0.5, 1).setDepth(sprite.y);
      setIdleFrame(sprite, npc.textureKey, 'down');
      // NPCs avec flag de masquage set sont spawn invisibles —
      // addobject les revealera plus tard depuis un script.
      if (npc.hiddenAtSpawn) sprite.setVisible(false);
      this.npcs.push({ ...npc, sprite });
    }
    // Exécute MAP_SCRIPT_ON_TRANSITION puis OnFrame (intro auto-trigger)
    const ctx = this.buildScriptContext();
    void (async () => {
      await runMapScript(this.parsedScripts, this.mapName, 'MAP_SCRIPT_ON_TRANSITION', ctx);
      await runOnFrameTable(this.parsedScripts, this.mapName, ctx);
    })();
  }

  // Construit le ScriptContext partagé entre OnTransition/OnFrame/tryInteract.
  // focusedNpc : NPC ciblé par interaction (pour faceplayer).
  private buildScriptContext(focusedNpc?: ResolvedNpc & { sprite: Phaser.GameObjects.Sprite }): ScriptContext {
    const opposite: Record<Facing, Facing> = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const targetFor = (localId: string): MovementSprite | null => {
      if (localId === 'LOCALID_PLAYER' || localId === '255') {
        return {
          sprite: this.playerSprite,
          textureKey: PLAYER_TEX,
          tile: this.playerTile,
          facing: this.playerFacing
        };
      }
      const npc = this.npcs.find(n => n.raw.local_id === localId);
      if (!npc) return null;
      return {
        sprite: npc.sprite,
        textureKey: npc.textureKey,
        tile: { x: npc.raw.x, y: npc.raw.y },
        facing: 'down'
      };
    };
    return {
      showText: (t) => this.dialogue.show(t),
      faceNpcToPlayer: () => {
        if (focusedNpc) setIdleFrame(focusedNpc.sprite, focusedNpc.textureKey, opposite[this.playerFacing]);
      },
      lockPlayer: () => { this.dialogueOpen = true; },
      releasePlayer: () => { this.dialogueOpen = false; },
      warp: (destMapId, x, y) => {
        const mapIds = this.cache.json.get('map-ids') as Record<string, string>;
        const destDir = mapIds[destMapId];
        if (!destDir) return;
        this.input.keyboard?.removeAllListeners();
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(220, () => {
          this.scene.restart({ mapName: destDir, spawnX: x, spawnY: y });
        });
      },
      setObjectXY: (localId, x, y) => {
        gameState.setObjectXY(this.mapName, localId, x, y);
        const npc = this.npcs.find(n => n.raw.local_id === localId);
        if (npc) {
          npc.raw.x = x; npc.raw.y = y;
          npc.sprite.x = x * TILE_SIZE + TILE_SIZE / 2;
          npc.sprite.y = y * TILE_SIZE + TILE_SIZE;
          npc.sprite.setDepth(npc.sprite.y);
        }
      },
      applyMovement: (localId, actions) => {
        const t = targetFor(localId);
        if (!t) return Promise.resolve();
        const p = runMovement(this, t, actions).then(() => {
          // Sync l'état logique après l'animation
          if (localId === 'LOCALID_PLAYER' || localId === '255') {
            this.playerTile = t.tile; this.playerFacing = t.facing;
          } else {
            const npc = this.npcs.find(n => n.raw.local_id === localId);
            if (npc) { npc.raw.x = t.tile.x; npc.raw.y = t.tile.y; }
          }
          this.pendingMovements.delete(localId);
        });
        this.pendingMovements.set(localId, p);
        return p;
      },
      waitMovement: async (localId) => {
        if (localId === '0') {
          await Promise.all([...this.pendingMovements.values()]);
          this.pendingMovements.clear();
        } else {
          const p = this.pendingMovements.get(localId);
          if (p) await p;
        }
      },
      setObjectVisible: (localId, visible) => {
        const npc = this.npcs.find(n => n.raw.local_id === localId);
        if (npc) npc.sprite.setVisible(visible);
      },
      delay: (frames) => new Promise(r => this.time.delayedCall(frames * 16, r)),
      setPlayerVisible: (visible) => this.playerSprite.setVisible(visible),
      setObjectMovementType: (localId, mvmtType) => {
        const npc = this.npcs.find(n => n.raw.local_id === localId);
        if (!npc) return;
        const facing: Facing | null =
          mvmtType.includes('FACE_UP') ? 'up'
          : mvmtType.includes('FACE_DOWN') ? 'down'
          : mvmtType.includes('FACE_LEFT') ? 'left'
          : mvmtType.includes('FACE_RIGHT') ? 'right'
          : null;
        if (facing) setIdleFrame(npc.sprite, npc.textureKey, facing);
      },
      fadeScreen: (mode) => new Promise(r => {
        const isOut = mode.includes('TO_BLACK');
        if (isOut) {
          this.cameras.main.fadeOut(200, 0, 0, 0);
          // Auto-fadeIn 600ms plus tard : on n'a pas implémenté les `special`
          // visuels (StartWallClock, ViewWallClock, etc.) qui devraient le faire,
          // donc sans ça l'écran reste noir indéfiniment.
          this.time.delayedCall(800, () => this.cameras.main.fadeIn(200, 0, 0, 0));
        } else this.cameras.main.fadeIn(200, 0, 0, 0);
        this.time.delayedCall(220, () => r());
      }),
    };
  }

  private spawnPlayer(startX: number, startY: number) {
    let sx = startX, sy = startY;
    if (this.isBlockedForSpawn(sx, sy)) {
      for (let r = 1; r < 10; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (!this.isBlockedForSpawn(startX + dx, startY + dy)) { sx = startX + dx; sy = startY + dy; r = 99; break; }
      }
    }
    this.playerTile = { x: sx, y: sy };
    this.playerSprite = this.add.sprite(
      sx * TILE_SIZE + TILE_SIZE / 2,
      sy * TILE_SIZE + TILE_SIZE,
      PLAYER_TEX, 0
    );
    this.playerSprite.setOrigin(0.5, 1).setDepth(this.playerSprite.y);
    setIdleFrame(this.playerSprite, PLAYER_TEX, 'down');
  }

  private isIndoor(): boolean {
    return this.mapJson.map_type === 'MAP_TYPE_INDOOR' || this.mapJson.map_type === 'MAP_TYPE_SECRET_BASE';
  }

  private setupInput() {
    const kb = this.input.keyboard!;
    // Directions : on track l'état held pour le tap/hold
    const bind = (code: string, dir: Facing) => {
      // emitOnRepeat=false : on ne reçoit qu'UN down event par appui physique
      // (sinon l'auto-repeat OS reset heldSince en boucle et bloque le walk).
      const k = kb.addKey(code, true, false);
      k.on('down', () => this.onDirDown(dir));
      k.on('up', () => this.onDirUp(dir));
    };
    bind('UP', 'up'); bind('Z', 'up');
    bind('DOWN', 'down'); bind('S', 'down');
    bind('LEFT', 'left'); bind('Q', 'left'); bind('A', 'left');
    bind('RIGHT', 'right'); bind('D', 'right');
    this.keyX = kb.addKey('X');

    // Actions non-répétitives
    kb.on('keydown-W', () => { if (!this.dialogueOpen) this.tryInteract(); });
    kb.on('keydown-B', () => { if (!this.dialogueOpen) { this.scene.launch('MenuOverlayScene'); this.scene.pause(); } });
    // Priming audio au premier input
    kb.on('keydown', () => {
      void (async () => {
        await primeAudio();
        if (!this.musicStarted && this.mapJson.music) {
          this.musicStarted = true;
          const musName = this.mapJson.music.toLowerCase() + '.mid';
          void playMidiLoop(`${BASE}/music/${musName}`);
        }
      })();
    });
  }

  private onDirDown(dir: Facing) {
    if (this.dialogueOpen || !this.mapReady) return;
    // Turn immédiat (visuel)
    if (this.playerFacing !== dir) {
      this.playerFacing = dir;
      setIdleFrame(this.playerSprite, this.currentTex(), dir);
    }
    this.heldDir = dir;
    this.heldSince = this.time.now;
  }

  private onDirUp(dir: Facing) {
    if (this.heldDir === dir) this.heldDir = null;
  }

  private currentTex(): string {
    return this.keyX?.isDown ? PLAYER_RUN_TEX : PLAYER_TEX;
  }

  /** Force le sprite joueur à utiliser la texture correspondant à l'état courant
   * (X pressé/relâché) en pose idle. À appeler après la fin d'un tween de
   * déplacement pour éviter que le sprite reste figé sur une frame running. */
  private syncPlayerIdleTexture() {
    if (this.time.now < this.inputLockUntil) return;
    setIdleFrame(this.playerSprite, this.currentTex(), this.playerFacing);
  }

  update() {
    if (!this.mapReady || this.dialogueOpen) return;
    if (this.time.now < this.inputLockUntil) return;
    if (!this.heldDir) return;
    if (this.time.now - this.heldSince < TAP_TURN_THRESHOLD_MS) return;
    const [dx, dy] = DELTA[this.heldDir];
    this.tryMove(dx, dy, this.heldDir, true);
  }

  /**
   * @param canExitIndoor true = on autorise le trigger du warp intérieur
   *   (stand-on + DOWN). False pour l'auto-step de sortie qui ne doit pas
   *   re-trigger le warp.
   */
  private tryMove(dx: number, dy: number, facing: Facing, canExitIndoor = true) {
    if (this.time.now < this.inputLockUntil) return;
    this.playerFacing = facing;

    // Règle PORTE INTÉRIEURE : on est SUR la porte et on push DOWN pour sortir.
    // Seulement si la tile courante a un behavior de porte (pas escalier/ladder).
    if (canExitIndoor && this.isIndoor() && dy > 0) {
      const beh = this.tilemap.behaviors[this.playerTile.y]?.[this.playerTile.x] ?? 0;
      if (isDoorWarp(beh)) {
        const warp = this.mapJson.warp_events?.find(
          w => w.x === this.playerTile.x && w.y === this.playerTile.y
        );
        if (warp) { this.triggerWarp(warp); return; }
      }
    }

    const nx = this.playerTile.x + dx, ny = this.playerTile.y + dy;
    if (this.isBlocked(nx, ny)) {
      setIdleFrame(this.playerSprite, this.currentTex(), facing);
      this.inputLockUntil = this.time.now + 60;
      return;
    }

    const tex = this.currentTex();
    const cooldown = this.keyX?.isDown ? RUN_COOLDOWN : WALK_COOLDOWN;
    playSingleStep(this.playerSprite, tex, facing, cooldown);
    this.playerTile.x = nx; this.playerTile.y = ny;
    // Track position in game state pour la sauvegarde
    gameState.map = { name: this.mapName, x: nx, y: ny };
    this.tweens.add({
      targets: this.playerSprite,
      x: nx * TILE_SIZE + TILE_SIZE / 2,
      y: ny * TILE_SIZE + TILE_SIZE,
      duration: cooldown,
      ease: 'Linear',
      onUpdate: () => this.playerSprite.setDepth(this.playerSprite.y),
      onComplete: () => {
        if (!this.isIndoor()) this.checkOutdoorWarp();
        // Escaliers / ladders / arrows : warp dès qu'on marche dessus, même indoor
        else this.postMoveCheckStairsOrArrow(facing);
        // Si plus de touche directionnelle ni X → repasse en idle avec la
        // bonne texture (walking, pas running frozen).
        this.time.delayedCall(30, () => {
          if (!this.heldDir) this.syncPlayerIdleTexture();
        });
      }
    });
    this.inputLockUntil = this.time.now + cooldown;
  }

  private checkOutdoorWarp() {
    // Warp dès qu'on arrive sur la tile : portes outdoor (entrée maison) ET
    // escaliers / ladders / arrows en intérieur (changement d'étage).
    const warp = (this.mapJson.warp_events ?? []).find(
      w => w.x === this.playerTile.x && w.y === this.playerTile.y
    );
    if (warp) this.triggerWarp(warp);
  }

  /** Warp instantané au step pour escaliers/ladders/arrows.
   *  Gen3 : un MB_NON_ANIMATED_DOOR atteint en montant (UP) = escalier (auto-warp).
   *  Atteint en descendant (DOWN) ou autre = porte intérieure (attend push DOWN). */
  private postMoveCheckStairsOrArrow(arrivedFacing: Facing) {
    const beh = this.tilemap.behaviors[this.playerTile.y]?.[this.playerTile.x] ?? 0;
    // MB_LADDER, MB_*_ARROW_WARP, MB_UP/DOWN_ESCALATOR : toujours auto-warp
    const isAlwaysInstant = beh === 0x61 || (beh >= 0x62 && beh <= 0x65)
                       || beh === 0x6A || beh === 0x6B || beh === 0x67 || beh === 0x68
                       || beh === 0x6E;
    // Porte intérieure atteinte en marchant vers le HAUT = escalier
    const isStairsViaDoor = (beh === 0x60 || beh === 0x69 || beh === 0x6C) && arrivedFacing === 'up';
    if (!isAlwaysInstant && !isStairsViaDoor) return;
    const warp = this.mapJson.warp_events?.find(
      w => w.x === this.playerTile.x && w.y === this.playerTile.y
    );
    if (warp) this.triggerWarp(warp);
  }

  private triggerWarp(warp: NonNullable<MapJson['warp_events']>[number]) {
    const mapIds = this.cache.json.get('map-ids') as Record<string, string>;
    const destDir = mapIds[warp.dest_map];
    if (!destDir) { console.warn('[warp] dest inconnue', warp.dest_map); return; }
    this.input.keyboard?.removeAllListeners();
    this.heldDir = null;
    this.mapReady = false;

    const indoor = this.isIndoor();
    const playDoor = !indoor; // on est dehors, on entre dans un intérieur
    const finish = () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.time.delayedCall(220, () => {
        this.scene.restart({ mapName: destDir, warpId: warp.dest_warp_id, fromIndoor: indoor });
      });
    };
    if (playDoor) playDoorOpen(this, warp.x, warp.y, finish);
    else finish();
  }

  private isBlocked(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.layoutDef.width || y >= this.layoutDef.height) return true;
    if (this.mapJson.warp_events?.some(w => w.x === x && w.y === y)) return false;
    if (this.tilemap.collisions[y]?.[x] === 1) return true;
    if (this.npcs.some(n => n.raw.x === x && n.raw.y === y)) return true;
    return false;
  }

  private isBlockedForSpawn(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.layoutDef.width || y >= this.layoutDef.height) return true;
    if (this.tilemap.collisions[y]?.[x] === 1 && !this.mapJson.warp_events?.some(w => w.x === x && w.y === y)) return true;
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
    await runScript(scriptName, this.parsedScripts, this.buildScriptContext(npc || undefined));
    this.dialogueOpen = false;
  }
}
