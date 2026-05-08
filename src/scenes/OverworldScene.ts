import Phaser from 'phaser';
import { TILE_SIZE, GAME_W, GAME_H } from '../main';
import { Random } from '../engine/random';
import { registerTransparentSpriteSheet } from '../util/sprite-transparency';
import { setIdleFrame, playSingleStep, type Facing } from '../engine/character-anims';
import { buildTilemap, buildBorderTileSprite, isDoorWarp, isInstantStepWarp, isArrowWarp, getArrowWarpDirection, MB_NORMAL, type LoadedTilemap } from '../engine/tilemap-loader';
import {
  isJumpLedge, getJumpLedgeFacing,
  isWalkLedge, getWalkLedgeDirection,
  isSlideLedge, getSlideLedgeDirection,
  isEncounterTile,
} from '../engine/metatile-behaviors';
import { getMapNameFr, loadMapNamesFr } from '../data/map-names-fr';
import {
  loadTextTables, loadItemsTable, loadTrainersTable,
  loadWildEncountersTable, loadMetatileLabels, loadConstantsTable,
} from '../engine/data-tables';
import { resolveNpcs, type ResolvedNpc, type MapJson, type GraphicsTable } from '../engine/npc-loader';
import { runScript, loadScriptOpcodesCatalog, getScriptCoverageStats, type ParsedScripts, type ScriptContext } from '../engine/script-runner';
import { getItemNameFr } from '../engine/data-tables';
import { preloadTilesetAnims, startTilesetAnimator, stopTilesetAnimator, getAnimatedAtlasKeys, type TilesetAnimsJson } from '../engine/tileset-animator';
import { runMapScript, runOnFrameTable, findOnFrameMatch } from '../engine/map-scripts';
import { WorldRenderer, type MapInstance } from '../engine/world-renderer';
import { runMovement, loadMovementActions, type MovementSprite } from '../engine/movement';
import { tickNpcBehavior, getInitialFacing, type NpcBehaviorState } from '../engine/npc-behavior';
import { DialogueBox, preloadDialogueAssets } from '../engine/dialogue-box';
import { createMenu } from '../engine/menu';
import { primeAudio, playMidiLoop, playSE, playCry, stopMusic, playFanfare, setSavedBgm } from '../engine/music';
import { traceReset, traceMark } from '../engine/warp-trace';
import { preloadDoorAnim, setupDoorAnim, playDoorOpen, loadDoorsCatalog, loadMetatileLabels as loadMetatileLabelsForDoor, preloadAllDoors } from '../engine/door-anim';
import { preloadWindowAssets, setupWindowAssets, getTemplatePixelRect } from '../engine/window-renderer';
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

// Vitesses 1:1 décomp Émeraude (cf. `event_object_movement.c` sStepTimes).
// Une tile = 16 px. À 60 FPS GBA, chaque step prend N frames :
//   MOVE_SPEED_NORMAL  (walk)        : 16 frames = 16/60 = 266.67ms
//   MOVE_SPEED_FAST_1  (run / surf)  :  8 frames = 133.33ms
//   MOVE_SPEED_FAST_2  (water curr.) :  6 frames = 100ms
//   MOVE_SPEED_FASTER  (mach bike)   :  4 frames = 66.67ms
//   MOVE_SPEED_FASTEST                :  2 frames = 33.33ms
const WALK_COOLDOWN = 267; // MOVE_SPEED_NORMAL
const RUN_COOLDOWN = 133;  // MOVE_SPEED_FAST_1
const TAP_TURN_THRESHOLD_MS = 80; // < 80ms d'appui = juste tourne, >= = marche
function dirToDx(d: Facing): number { return d === 'left' ? -1 : d === 'right' ? 1 : 0; }
function dirToDy(d: Facing): number { return d === 'up' ? -1 : d === 'down' ? 1 : 0; }

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
  // Flag set when a seamless cross-map tween is running. Empêche tryMove de
  // re-fire avant la fin du softSwitch (sinon la 2e tryMove lit playerTile
  // hors-bounds et déclenche un 2e crossing inutile → désync visuelle).
  // Cf. DEV_LOG session 41/42.
  private crossingInProgress = false;
  // Idem pour les warps porte/restart : `playDoorOpen` est async, et tryMove
  // peut re-fire pendant l'anim si la touche est maintenue → 2 triggerWarp
  // consécutifs (2 fadeOut, 2 anims). Reset par init() après scene.restart().
  private warpInProgress = false;
  private musicStarted = false;
  private mapReady = false;

  // Input state
  private heldDir: Facing | null = null;
  private heldSince = 0;
  private keyX!: Phaser.Input.Keyboard.Key;

  // Movements lancés par les scripts (pour synchroniser waitmovement)
  private pendingMovements: Map<string, Promise<void>> = new Map();

  // STEP_CB_TRUCK : oscillation caméra "le camion roule" (cf. setstepcallback)
  private truckBobbingTween?: Phaser.Tweens.Tween;
  // Coord events déjà déclenchés (par tile signature) — re-trigger possible si
  // var_value change, donc on garde par "x,y,scriptName".
  private firedCoordEvents = new Set<string>();
  // Re-entry guard pour ON_FRAME_TABLE (équivalent de gIsScriptActive du décomp).
  // Le décomp check ON_FRAME à chaque tick — sans ce guard, on relancerait le
  // script en boucle pendant son exécution.
  private isOnFrameRunning = false;

  // HUD label de la zone (BOURG-EN-VOL, ROSYERES, etc.). Stocké pour pouvoir
  // l'updater au softSwitch (sinon reste figé sur la 1ère map).
  private mapLabel?: Phaser.GameObjects.Text;

  // Si on arrive via une map connection (traverser une bordure), on a besoin
  // de calculer le spawn dans afterMapLoad en fonction de la direction et de
  // l'offset stockés ici.
  private fromConnection: { direction: string; sourceX: number; sourceY: number; offset: number } | null = null;

  /** WorldRenderer : gère le rendu seamless multi-maps (current + adjacents).
   *  Cf. SEAMLESS_RENDERING_REFERENCE.md. Initialisé dans afterMapLoad. */
  private world?: WorldRenderer;
  /** Adjacents en cours de load (évite re-trigger). */
  private adjacentsLoading = new Set<string>();

  constructor() { super({ key: 'OverworldScene' }); }

  private spawnOverride: { x: number; y: number } | null = null;

  init(data: { mapName?: string; warpId?: string; fromIndoor?: boolean; spawnX?: number; spawnY?: number;
              fromConnection?: { direction: string; sourceX: number; sourceY: number; offset: number } } = {}) {
    this.mapName = data.mapName ?? 'LittlerootTown';
    this.warpIdTarget = data.warpId ?? null;
    this.arrivedFromIndoor = data.fromIndoor ?? false;
    this.spawnOverride = (data.spawnX != null && data.spawnY != null) ? { x: data.spawnX, y: data.spawnY } : null;
    this.fromConnection = data.fromConnection ?? null;
    this.npcs = []; this.signs = [];
    this.dialogueOpen = false; this.mapReady = false;
    this.heldDir = null; this.inputLockUntil = 0;
    this.crossingInProgress = false;
    this.warpInProgress = false;
    this.firedCoordEvents = new Set();
    this.truckBobbingTween = undefined;
    this.isOnFrameRunning = false;
  }

  preload() {
    for (const k of CACHE_KEYS_GLOBAL) this.cache.json.remove(k);
    this.load.json('layouts-index', `${BASE}/layouts-index.json`);
    this.load.json('layout-to-pair', `${BASE}/tileset-pairs/layout-to-pair.json`);
    this.load.json('map-ids', `${BASE}/map-ids.json`);
    this.load.json('gfx-table', `${BASE}/object-event-graphics.json`);
    this.load.json('inanimate-gfx', `${BASE}/inanimate-graphics.json`);
    if (!this.cache.json.has('map-names-fr')) this.load.json('map-names-fr', `${BASE}/map-names-fr.json`);
    // Bulk data tables (Vagues 1+2). Chargées une fois, persistent en cache global.
    if (!this.cache.json.has('text-tables')) this.load.json('text-tables', `${BASE}/text-tables.json`);
    if (!this.cache.json.has('items-table')) this.load.json('items-table', `${BASE}/items.json`);
    if (!this.cache.json.has('trainers-table')) this.load.json('trainers-table', `${BASE}/trainer-parties.json`);
    if (!this.cache.json.has('wild-encounters')) this.load.json('wild-encounters', `${BASE}/wild-encounters.json`);
    if (!this.cache.json.has('metatile-labels')) this.load.json('metatile-labels', `${BASE}/metatile-labels.json`);
    if (!this.cache.json.has('constants')) this.load.json('constants', `${BASE}/constants.json`);
    if (!this.cache.json.has('movement-actions')) this.load.json('movement-actions', `${BASE}/movement-actions.json`);
    if (!this.cache.json.has('script-opcodes')) this.load.json('script-opcodes', `${BASE}/script-opcodes.json`);
    if (!this.cache.json.has('tileset-anims')) this.load.json('tileset-anims', `${BASE}/tileset-anims.json`);
    // Preload anim frames (PNGs water 0-7, flower 0-2, etc.). On ne peut
    // précharger qu'après que le JSON soit dans cache → 2 phases. Solution
    // simple : preload les frames directement par convention path.
    for (const [animName, framesCount] of [['water', 8], ['flower', 3], ['sand_water_edge', 4], ['waterfall', 4]] as [string, number][]) {
      for (let f = 0; f < framesCount; f++) {
        const key = `tilesetanim-${animName}-${f}`;
        if (!this.textures.exists(key)) this.load.image(key, `${BASE}/tilesets/primary/general/anim/${animName}/${f}.png`);
      }
    }
    for (const k of CACHE_KEYS_MAP_JSON) this.cache.json.remove(k);
    this.load.json('map-json', `${BASE}/maps/${this.mapName}.json`);
    this.load.json('scripts', `${BASE}/scripts/${this.mapName}.json`);
    // _all.json = pool global de tous les labels (decomp utilise un namespace
    // partagé entre fichiers, ex. MaysHouse goto PlayersHouse défini ailleurs).
    if (!this.cache.json.has('scripts-all')) this.load.json('scripts-all', `${BASE}/scripts/_all.json`);
    preloadDialogueAssets(this);
    preloadDoorAnim(this);
    preloadWindowAssets(this);
    // Doors : 2-phase preload. Phase 1 = charger le catalog JSON. Phase 2 (déclenchée
    // par event 'filecomplete-json-doors') = queue les 53 PNG door anims dans le
    // MÊME batch de load. Permet à 'complete' d'attendre tout avant create().
    if (!this.cache.json.has('doors')) {
      this.load.json('doors', `${BASE}/doors.json`);
      this.load.once('filecomplete-json-doors', () => {
        const doorsJson = this.cache.json.get('doors');
        if (doorsJson) {
          loadDoorsCatalog(doorsJson);
          preloadAllDoors(this);
        }
      });
    } else {
      // JSON déjà en cache (warp interne) → preload PNGs direct.
      preloadAllDoors(this);
    }
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
    traceMark(`afterMapLoad ${this.mapName}`);
    const mapNamesTable = this.cache.json.get('map-names-fr') as Record<string, string> | undefined;
    if (mapNamesTable) loadMapNamesFr(mapNamesTable);
    // Wire bulk data tables dans les singletons data-tables.ts
    const tt = this.cache.json.get('text-tables');
    if (tt) loadTextTables(tt);
    const it = this.cache.json.get('items-table');
    if (it) loadItemsTable(it);
    const trs = this.cache.json.get('trainers-table');
    if (trs) loadTrainersTable(trs);
    const we = this.cache.json.get('wild-encounters');
    if (we) loadWildEncountersTable(we);
    const ml = this.cache.json.get('metatile-labels');
    if (ml) loadMetatileLabels(ml);
    const cst = this.cache.json.get('constants');
    if (cst) loadConstantsTable(cst);
    const mapScripts = this.cache.json.get('scripts') as ParsedScripts;
    const all = this.cache.json.get('scripts-all') as ParsedScripts;
    // Pool global en fallback, scripts de la map en priorité haute (au cas où
    // un même label serait redéfini localement dans une map précise).
    this.parsedScripts = {
      scripts: { ...all.scripts, ...mapScripts.scripts },
      texts: { ...all.texts, ...mapScripts.texts }
    };
    this.dialogue = new DialogueBox(this);
    // Démarre tileset animator AVANT buildTilemap pour que les TilemapLayers
    // utilisent direct le canvas-texture animé (sinon ils restent sur l'image
    // statique). On override les texture keys via TilemapKeys.
    const animsJson = this.cache.json.get('tileset-anims') as TilesetAnimsJson | undefined;
    const pairInfo = this.cache.json.get('pair-info') as { atlasCols: number; primaryTileset: string; numPrimaryMetatiles: number } | undefined;
    // CRITIQUE : n'animer QUE si la map utilise le tileset General comme primary.
    // Les maps intérieures (gTileset_Building, gTileset_PokemonCenter, etc.) ont
    // d'autres metatile IDs aux positions 4, 44, etc. qui ne sont PAS de l'eau.
    // Sans ce check : corruption d'atlas (tiles d'eau apparaissent sur parquet, etc.).
    const isGeneralPrimary = pairInfo?.primaryTileset === 'gTileset_General';
    if (animsJson && pairInfo && isGeneralPrimary) {
      startTilesetAnimator(this, animsJson, pairInfo.atlasCols);
    } else {
      stopTilesetAnimator();
    }
    const animKeys = getAnimatedAtlasKeys();
    this.tilemap = buildTilemap(this, this.layoutDef.width, this.layoutDef.height, {
      metatilesLower: isGeneralPrimary && this.textures.exists(animKeys.lower) ? animKeys.lower : undefined,
      metatilesUpper: isGeneralPrimary && this.textures.exists(animKeys.upper) ? animKeys.upper : undefined,
    });
    // Border ALWAYS rendered à depth -1. Les adjacent map TilemapLayers (depth
    // 0) le couvrent automatiquement là où ils existent. Reste visible
    // uniquement dans les directions VRAIMENT vides (pas de connection ou pas
    // encore loaded).
    buildBorderTileSprite(this, this.tilemap.widthPx, this.tilemap.heightPx);

    // === WorldRenderer setup : enregistre la current map ===
    // Pour permettre le seamless rendering, on cache aussi les binaires/atlas
    // sous des keys préfixées par mapName (pour ne pas collisionner avec les
    // futurs adjacents). On les copie depuis les keys génériques de Phaser.
    // (Trick : on duplique les entrées en cache pour les avoir sous 2 keys.)
    this.world = new WorldRenderer(this);
    this.world.initIndices();
    this.duplicateCacheKeysForCurrentMap();
    // Crée le MapInstance current dans le world. Tilemap déjà built ci-dessus
    // → on l'injecte directement dans loaded.
    this.world.loaded.set(this.mapName, {
      mapName: this.mapName,
      mapId: this.mapJson.id,
      mapJson: this.mapJson,
      layout: this.layoutDef,
      parsedScripts: this.parsedScripts!, // sera défini juste après
      tilemap: this.tilemap,
      worldOffsetX: 0, worldOffsetY: 0,
      resolvedNpcs: [],
    });
    this.world.currentMapName = this.mapName;
    // Expose au debug console (cheat.world())
    (window as unknown as { __overworldWorld: WorldRenderer }).__overworldWorld = this.world;

    // MAP_SCRIPT_ON_LOAD : exécuté avant le rendering / spawn (cf. décomp).
    // Typiquement utilisé pour `setmetatile` (lumières, portes statiques, etc.).
    // Sync via void IIFE — les opcodes setmetatile sont sync, et si jamais le
    // script lance un msgbox c'est ok il s'affichera après le render.
    void runMapScript(this.parsedScripts, this.mapName, 'MAP_SCRIPT_ON_LOAD', this.buildScriptContext());

    registerTransparentSpriteSheet(this, 'player-walk', PLAYER_TEX, 16, 32);
    registerTransparentSpriteSheet(this, 'player-run', PLAYER_RUN_TEX, 16, 32);
    // Catalog doors déjà loaded en preload (via filecomplete event).
    // Labels metatile pour lookup runtime (déjà chargé via cache).
    const labelsJson = this.cache.json.get('metatile-labels');
    if (labelsJson) loadMetatileLabelsForDoor(labelsJson);
    // Setup alpha pour TOUTES les door textures (déjà toutes preloaded en preload).
    setupDoorAnim(this);
    setupWindowAssets(this);
    const movJson = this.cache.json.get('movement-actions');
    if (movJson) loadMovementActions(movJson);
    const opsJson = this.cache.json.get('script-opcodes');
    if (opsJson) loadScriptOpcodesCatalog(opsJson);
    // Expose stats coverage à window pour debug rapide : `getScriptCoverageStats()`
    (window as any).getScriptCoverageStats = getScriptCoverageStats;

    const gfxTable = this.cache.json.get('gfx-table') as GraphicsTable;
    const inanimateMap = (this.cache.json.get('inanimate-gfx') as Record<string, boolean>) ?? {};
    const resolved = resolveNpcs(this.mapJson, gfxTable,
      (f) => gameState.hasFlag(f),
      (id) => gameState.getObjectXY(this.mapName, id),
      undefined, inanimateMap)
      // Filtre les item balls déjà ramassées (script label dans takenItemBalls).
      .filter(n => !(n.raw.graphics_id === 'OBJ_EVENT_GFX_ITEM_BALL' && gameState.takenItemBalls.has(n.raw.script)));

    for (const bg of this.mapJson.bg_events ?? []) {
      if (bg.type === 'sign' && bg.script) this.signs.push({ x: bg.x, y: bg.y, script: bg.script });
    }

    // Priorité spawn : connection > override scène > warpId > centre map
    let startX: number, startY: number;
    if (this.fromConnection) {
      // On arrive via une map connection : la position dépend de la direction
      // par laquelle on a traversé. offset = décalage en case entre les origines
      // des 2 maps (cf. data/maps/<X>/connections.inc du décomp).
      const w = this.layoutDef.width, h = this.layoutDef.height;
      const { direction, sourceX, sourceY, offset } = this.fromConnection;
      if (direction === 'up') { startX = sourceX - offset; startY = h - 1; }
      else if (direction === 'down') { startX = sourceX - offset; startY = 0; }
      else if (direction === 'left') { startX = w - 1; startY = sourceY - offset; }
      else if (direction === 'right') { startX = 0; startY = sourceY - offset; }
      else { startX = Math.floor(w / 2); startY = Math.floor(h / 2); }
      // Clamp défensif
      startX = Math.max(0, Math.min(w - 1, startX));
      startY = Math.max(0, Math.min(h - 1, startY));
    } else if (this.spawnOverride) {
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
    // (vrai pour outdoor villes/routes, faux pour intérieurs). Stocké pour
    // update au softSwitch.
    this.mapLabel = this.add.text(4, 4, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
      backgroundColor: '#000000aa', padding: { x: 3, y: 1 }
    });
    this.mapLabel.setScrollFactor(0).setDepth(200000);
    this.refreshMapLabel();

    // NPCs : second loading phase
    const seen = new Set<string>();
    let toLoad = 0;
    for (const npc of resolved) {
      if (seen.has(npc.raw.graphics_id)) continue;
      seen.add(npc.raw.graphics_id);
      // Skip si déjà en cache (cas : retour dans une map dont les sprites sont
      // restés cache du load précédent). Sinon Phaser ne fire pas `complete`.
      if (this.textures.exists(npc.sourceTextureKey)) continue;
      this.load.spritesheet(npc.sourceTextureKey, npc.spriteUrl, {
        frameWidth: npc.gfx.frameWidth, frameHeight: npc.gfx.frameHeight
      });
      toLoad++;
    }
    // FIX session 39 : si tous les sprites NPC sont déjà en cache (cas fréquent
    // pour les warps intérieur/extérieur), `this.load.start()` ne fire jamais
    // `complete` → `afterNpcsLoad` n'est JAMAIS appelé → NPCs invisibles tant
    // qu'on ne refresh pas la map. Fix : appel direct si rien à charger.
    traceMark(`NPCs to load: ${toLoad}`);
    if (toLoad === 0) {
      this.afterNpcsLoad(resolved);
    } else {
      this.load.once('complete', () => { traceMark('NPC textures loaded'); this.afterNpcsLoad(resolved); });
      this.load.start();
    }

    this.setupInput();
    // Pré-lock AVANT mapReady=true : sinon entre ce point et `afterNpcsLoad`
    // (qui lance les map scripts), l'user peut s'incruster en pushant une
    // direction. Released par le `finally` de afterNpcsLoad.
    this.dialogueOpen = true;
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

    // FIX session 39 : musique map jouée systématiquement après chargement.
    // BootScene a déjà primé l'audio donc plus besoin du gating sur `musicStarted`.
    // Le décomp appelle TransitionMapMusic dans LoadMapFromWarp.
    if (this.mapJson.music) {
      const musName = this.mapJson.music.toLowerCase() + '.mid';
      this.time.delayedCall(300, () => {
        this.musicStarted = true;
        void playMidiLoop(`${BASE}/music/${musName}`);
      });
    }
  }

  private afterNpcsLoad(resolved: ResolvedNpc[]) {
    traceMark(`afterNpcsLoad spawn ${resolved.length} NPCs`);
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
      setIdleFrame(sprite, npc.textureKey, getInitialFacing(npc.raw.movement_type));
      // NPCs avec flag de masquage set sont spawn invisibles —
      // addobject les revealera plus tard depuis un script.
      if (npc.hiddenAtSpawn) sprite.setVisible(false);
      this.npcs.push({ ...npc, sprite });
    }
    // Sync les NPCs spawnés dans le world MapInstance (pour soft-promote futur)
    if (this.world) {
      const inst = this.world.get(this.mapName);
      if (inst) {
        inst.parsedScripts = this.parsedScripts;
        inst.resolvedNpcs = resolved;
        inst.spawnedNpcs = this.npcs as Array<ResolvedNpc & { sprite: Phaser.GameObjects.Sprite }>;
      }
    }

    // Exécute MAP_SCRIPT_ON_TRANSITION puis ON_RESUME puis OnFrame (intro auto-trigger).
    // ON_RESUME est appelé en plus pour activer le step callback truck après
    // un new game (le décomp distingue resume/load mais pour notre web on les
    // fusionne — le pire qui arrive c'est qu'un script tourne 2x sans effet).
    //
    // dialogueOpen est déjà à true (pré-lock dans afterMapLoad), libéré dans
    // le finally pour défensif au cas où le script ne fait pas releaseall.
    const ctx = this.buildScriptContext();
    void (async () => {
      try {
        await runMapScript(this.parsedScripts, this.mapName, 'MAP_SCRIPT_ON_TRANSITION', ctx);
        await runMapScript(this.parsedScripts, this.mapName, 'MAP_SCRIPT_ON_RESUME', ctx);
        await runOnFrameTable(this.parsedScripts, this.mapName, ctx);
      } finally {
        this.dialogueOpen = false;
        // Check coord_event sur la tile d'arrivée (warp escalier/arrow/connection
        // ou spawn new game). Pour les warps porte l'auto-step DOWN va re-call
        // checkCoordEvent via tryMove → firedCoordEvents évite le double trigger.
        void this.checkCoordEvent();
      }
    })();

    // Lance le pre-load + render des adjacents en background pour seamless.
    void this.loadAdjacentsAsync();
  }

  /** Duplique en cache les keys génériques (map-bin, pair-info, etc.) sous
   *  des keys préfixées par mapName. Permet à WorldRenderer de retrouver les
   *  assets de la current map (pour soft-promote ultérieur). */
  private duplicateCacheKeysForCurrentMap() {
    const m = this.mapName;
    const dupJson = (genKey: string, newKey: string) => {
      if (this.cache.json.has(genKey) && !this.cache.json.has(newKey)) {
        this.cache.json.add(newKey, this.cache.json.get(genKey));
      }
    };
    const dupBin = (genKey: string, newKey: string) => {
      if (this.cache.binary.has(genKey) && !this.cache.binary.has(newKey)) {
        this.cache.binary.add(newKey, this.cache.binary.get(genKey));
      }
    };
    dupJson('map-json', `map-json-${m}`);
    dupJson('scripts', `scripts-${m}`);
    dupJson('pair-info', `pair-info-${m}`);
    dupBin('map-bin', `map-bin-${m}`);
    dupBin('border-bin', `border-bin-${m}`);
    dupBin('attrs-primary', `attrs-primary-${m}`);
    dupBin('attrs-secondary', `attrs-secondary-${m}`);
    // Les textures (atlas) ne sont pas duppliquées : on charge avec les genKeys
    // pour current. WorldRenderer.preloadMapAssets utilise les keys préfixées.
  }

  /** Charge async les 4 maps connectées et build leurs TilemapLayer aux offsets
   *  adaptés. Permet au joueur de voir les maps adjacentes aux bords avant
   *  même de les traverser. */
  private async loadAdjacentsAsync() {
    if (!this.world || !this.mapJson.connections) return;
    for (const conn of this.mapJson.connections) {
      const adjMapName = this.world.mapIdToName(conn.map);
      if (!adjMapName) continue;
      if (this.world.loaded.has(adjMapName) || this.adjacentsLoading.has(adjMapName)) continue;
      this.adjacentsLoading.add(adjMapName);
      try {
        await this.world.preloadMapAssets(adjMapName);
        // Calculer offset world depuis direction + conn.offset
        const adjMapJson = this.cache.json.get(`map-json-${adjMapName}`) as MapJson;
        const layoutsIndex = this.cache.json.get('layouts-index') as { layouts: { id: string; width: number; height: number }[] };
        const adjLayout = layoutsIndex.layouts.find(l => l.id === adjMapJson.layout);
        if (!adjLayout) continue;
        const off = this.world.computeAdjacentOffset(this.layoutDef, adjLayout as never, conn.direction, conn.offset);
        // Resolve NPCs (pour spawn lors du soft-promote)
        const gfxTable = this.cache.json.get('gfx-table') as GraphicsTable;
        const inanimateMap = (this.cache.json.get('inanimate-gfx') as Record<string, boolean>) ?? {};
        const resolvedAdj = resolveNpcs(adjMapJson, gfxTable,
          (f) => gameState.hasFlag(f),
          (id) => gameState.getObjectXY(adjMapName, id),
          undefined, inanimateMap);
        this.world.buildMapInstance(adjMapName, off.x, off.y, resolvedAdj);
      } catch (e) {
        console.warn('[loadAdjacent]', adjMapName, e);
      }
      this.adjacentsLoading.delete(adjMapName);
    }
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
      lockPlayer: () => {
        this.dialogueOpen = true;
        // Set VAR_FACING au snapshot du facing courant — utilisé par les
        // call_if_eq VAR_FACING, DIR_X dans plein de scripts (ex: MeetMay).
        // Cf. include/constants/global.h : SOUTH=1, NORTH=2, WEST=3, EAST=4.
        const dir = { up: 2, down: 1, left: 3, right: 4 }[this.playerFacing];
        gameState.setVar('VAR_FACING', dir);
      },
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
      // setmetatile X, Y, METATILE_LABEL, IMPASSABLE : visuel non implémenté
      // (labels METATILE_* pas résolus en numérique → cf. extract-metatile-labels).
      // MAIS on applique au moins le flag IMPASSABLE sur la collision pour que
      // les scripts qui bloquent une porte/escalier (BlockStairs, etc.) aient
      // leur effet de gameplay même sans le visuel.
      setMetatile: (x, y, _label, impassable) => {
        if (this.tilemap.collisions[y]) {
          this.tilemap.collisions[y][x] = impassable ? 1 : 0;
        }
      },
      // setstepcallback STEP_CB_X : active un effet visuel global. Pour l'instant
      // seul STEP_CB_TRUCK est wiré (oscillation caméra simulant le moteur).
      setStepCallback: (name) => {
        if (name === 'STEP_CB_TRUCK') this.startTruckBobbing();
        // Autres : STEP_CB_FROZEN (glace), STEP_CB_SURF, etc. → à implémenter plus tard
      },
      // opendoor X, Y → animation d'ouverture (frames 0→5) ; close = inverse.
      // waitdooranim await la promise via le script-runner.
      playDoorAnim: (mode, x, y) => new Promise<void>(resolve => {
        if (mode === 'open') {
          playDoorOpen(this, x, y, resolve, this.getGameMetatileIdAt(x, y));
        } else {
          // Close : pas de helper dédié (door-anim.ts n'a que open). Pour MVP on
          // skippe l'anim de fermeture, on resolve immédiatement.
          resolve();
        }
      }),
      // trainerbattle / dotrainerbattle : lance BattleScene async, await result.
      runTrainerBattle: (trainerId) => new Promise<'win' | 'lose'>(resolve => {
        this.scene.launch('BattleScene', { trainerId, onResult: resolve });
        this.scene.pause();
      }),
      runWildBattle: (species, level, heldItem) => new Promise<'win' | 'lose' | 'caught' | 'flee'>(resolve => {
        this.scene.launch('BattleScene', { wildSpecies: species, wildLevel: level, wildItem: heldItem, onResult: resolve });
        this.scene.pause();
      }),
      // yesnobox : position lue depuis window-templates.json (sYesNo_WindowTemplates).
      // Cf. WINDOWS_BOXES_REFERENCE.md. Aucun hardcode : tout vient du décomp.
      askYesNo: () => new Promise<boolean>(resolve => {
        const r = getTemplatePixelRect('sYesNo_WindowTemplates') ?? { x: 168, y: 72, w: 40, h: 32 };
        const handle = createMenu({
          scene: this, x: r.x, y: r.y, width: r.w,
          labels: ['OUI', 'NON'], lineHeight: 16,
          onSelect: (i) => { handle.destroy(); resolve(i === 0); },
          onCancel: () => { handle.destroy(); resolve(false); },
        });
      }),
      askMultichoice: (options, defaultIdx) => new Promise<number>(resolve => {
        // Layout dynamique : largeur basée sur l'item le plus long, hauteur = count × 16.
        // Position en bottom-right par défaut pour pas couvrir le dialogue.
        const w = Math.max(40, options.reduce((m, s) => Math.max(m, s.length * 6 + 24), 0));
        const h = options.length * 16 + 16;
        const handle = createMenu({
          scene: this, x: GAME_W - w - 4, y: GAME_H - h - 36, width: w,
          labels: options, lineHeight: 16,
          onSelect: (i) => { handle.destroy(); resolve(i); },
          onCancel: () => { handle.destroy(); resolve(-1); },
        });
        if (defaultIdx != null) handle.setCursor(defaultIdx);
      }),
      // Audio : routés vers music.ts (SF2 + cries WAV). Tous fire-and-forget.
      playSE: (name) => { void playSE(name); },
      playBGM: (name, save) => {
        const url = `${BASE}/music/${name}.mid`;
        if (save) setSavedBgm(name);
        void playMidiLoop(url);
      },
      playCry: (species) => { playCry(species); },
      playFanfare: (name) => { void playFanfare(`${BASE}/music/${name}.mid`); },
      saveBgm: (name) => { setSavedBgm(name); },
      // fadedefaultbgm : si la map default == ce qui joue, no-op. Sinon switch.
      // (Notre playMidiLoop dedupe déjà sur currentSong, donc safe d'appeler à blanc.)
      fadeDefaultBgm: () => {
        // Décomp `Cmd_fadedefaultbgm` : crossfade vers BGM par défaut de la map
        // si savedBgm != currentBgm. Notre playMidiLoop dedupe déjà sur currentSong
        // donc safe d'appeler à blanc — et le slot saved est clear par cohérence
        // (cf. flow `playbgm SAVE,TRUE → ... → savebgm MUS_DUMMY → fadedefaultbgm`).
        const musName = (this.mapJson.music || '').toLowerCase();
        if (!musName) return;
        setSavedBgm(null);
        void playMidiLoop(`${BASE}/music/${musName}.mid`);
      },
      fadeNewBgm: (name) => { void playMidiLoop(`${BASE}/music/${name}.mid`); },
      // Item balls : pickup → SE + msgbox + persist comme ramassé (game-state)
      findItem: async (itemName, quantity) => {
        try { void playSE('se_ball'); } catch {/* ignore */}
        const fr = getItemNameFr('ITEM_' + itemName) || itemName;
        const label = quantity > 1 ? `${fr} ×${quantity}` : fr;
        await this.dialogue.show(`{PLAYER} a trouvé\nun(e) ${label} !`);
      },
      markItemBallTaken: (scriptLabel) => {
        // Le décomp use FLAG_ITEM_<MAP>_<X> mais on n'a pas extrait ce mapping.
        // Workaround : on stocke le scriptLabel dans gameState.takenItemBalls
        // et au respawn de map on filtre les NPCs item ball déjà pris.
        gameState.takenItemBalls.add(scriptLabel);
      },
    };
  }

  /** Oscillation caméra ±1px période ~2s : effet "camion roule" du décomp
   *  (cf. GetTruckCameraBobbingY dans src/field_special_scene.c). Implémenté
   *  via setFollowOffset pour ne pas entrer en conflit avec startFollow. */
  private startTruckBobbing() {
    if (this.truckBobbingTween) return;
    const target = { y: 0 };
    this.truckBobbingTween = this.tweens.add({
      targets: target,
      y: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.cameras.main.setFollowOffset(0, target.y),
    });
  }

  /** Vérifie si la tile sur laquelle vient d'arriver le joueur déclenche un
   *  coord_event (typiquement les triggers d'intro avec condition var/var_value).
   *  Le décomp les exécute juste après le pas (même mécanique que les warps). */
  private async checkCoordEvent() {
    if (this.dialogueOpen) return;
    const events = this.mapJson.coord_events ?? [];
    const match = events.find(c =>
      c.type === 'trigger' &&
      c.x === this.playerTile.x &&
      c.y === this.playerTile.y &&
      c.script &&
      (c.var ? gameState.getVar(c.var) === Number(c.var_value ?? '0') : true)
    );
    if (!match || !match.script) return;
    // Évite re-trigger en boucle si le script ne modifie pas la var de garde
    const sig = `${match.x},${match.y},${match.script}`;
    if (this.firedCoordEvents.has(sig)) return;
    this.firedCoordEvents.add(sig);
    if (!this.parsedScripts.scripts[match.script]) {
      console.warn('[coord_event] script introuvable', match.script);
      return;
    }
    this.dialogueOpen = true;
    await runScript(match.script, this.parsedScripts, this.buildScriptContext());
    this.dialogueOpen = false;
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

  /** Met à jour le label HUD selon la current map (visible si show_map_name). */
  private refreshMapLabel() {
    if (!this.mapLabel) return;
    // Désactivé : pas d'affichage des noms de lieux sur la map
    this.mapLabel.setVisible(false);
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
    // Resync immédiate de la texture quand on lâche X : sinon le sprite reste
    // figé sur une frame "running" si on arrête de courir sans bouger.
    this.keyX.on('up', () => this.syncPlayerIdleTexture());

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
    if (!this.mapReady) return;
    // ON_FRAME_TABLE check à chaque frame, fidèle à TryRunOnFrameMapScript()
    // de field_control_avatar.c:150. Le re-entry guard évite re-trigger pendant
    // exécution. Sans ça, si l'user bypass un script ON_FRAME, il ne se relance
    // jamais (alors que le décomp re-check 60×/s tant que la var match).
    if (!this.isOnFrameRunning && !this.dialogueOpen) {
      void this.tickOnFrameTable();
    }
    // Tick NPC autonomous behaviors (MOVEMENT_TYPE_*). Skipped si dialogue open
    // (les NPCs gèlent pendant les dialogues, fidèle au décomp).
    if (!this.dialogueOpen) this.tickNpcBehaviors();
    if (this.dialogueOpen) return;
    if (this.time.now < this.inputLockUntil) return;
    if (!this.heldDir) return;
    if (this.time.now - this.heldSince < TAP_TURN_THRESHOLD_MS) return;
    const [dx, dy] = DELTA[this.heldDir];
    this.tryMove(dx, dy, this.heldDir, true);
  }

  /** Convertit (tx, ty) → game metatile ID en consultant pair-info.
   *  Phaser tilemap tile.index = atlas position. Pour primary : gameId = atlasPos.
   *  Pour secondary : gameId = 512 + (atlasPos - numPrimaryMetatiles). */
  private getGameMetatileIdAt(tx: number, ty: number): number | undefined {
    const tile = this.tilemap.upperLayer.getTileAt(tx, ty) ?? this.tilemap.lowerLayer.getTileAt(tx, ty);
    if (!tile) return undefined;
    const atlasPos = tile.index;
    const pairInfo = this.cache.json.get('pair-info') as { numPrimaryMetatiles: number } | undefined;
    if (!pairInfo) return atlasPos;
    if (atlasPos < pairInfo.numPrimaryMetatiles) return atlasPos;
    return 512 + (atlasPos - pairInfo.numPrimaryMetatiles);
  }

  /** Tick chaque NPC visible pour activer son MOVEMENT_TYPE (look around, wander, etc.). */
  private npcBehaviorStates = new Map<string, NpcBehaviorState>();
  private tickNpcBehaviors() {
    const now = performance.now();
    for (const npc of this.npcs) {
      const id = npc.raw.local_id ?? `${npc.raw.x},${npc.raw.y}`;
      let state = this.npcBehaviorStates.get(id);
      if (!state) {
        // Initial delay aléatoire (jitter pour pas que tous les NPCs tickent en même temps).
        // Borné par sMovementDelaysMedium du décomp (533-2133ms).
        state = {
          // 1:1 décomp `event_object_movement.c:GetRandomMovementDelay` qui
          // utilise Random() depuis le RNG seedé. Auparavant Math.random() = bug.
          // Borné par sMovementDelaysMedium du décomp (533-2133ms).
          nextActionAt: now + 533 + (Random() % 1600),
          isRunning: false,
          homeX: (npc as any).tile?.x ?? npc.raw.x,
          homeY: (npc as any).tile?.y ?? npc.raw.y,
        };
        this.npcBehaviorStates.set(id, state);
      }
      // Lazy-init tile + facing (notre npc structure a sprite mais pas tile/facing).
      if (!(npc as any).tile) {
        (npc as any).tile = { x: npc.raw.x, y: npc.raw.y };
        (npc as any).facing = getInitialFacing(npc.raw.movement_type);
      }
      tickNpcBehavior(this, npc as any, state, now, (tx, ty) => {
        // Walkable check : collision binary + behavior impassable + NPC/player.
        if (this.tilemap?.collisions?.[ty]?.[tx]) return false;
        // Behaviors directionnels (MB_IMPASSABLE_*, MB_SECRET_BASE_IMPASSABLE,
        // ledges) ne sont pas dans le collision binary mais bloquent quand
        // même. 0x30-0x37 = IMPASSABLE_{8 directions}, 0xB9, 0xC0, 0xC1.
        const beh = this.tilemap?.behaviors?.[ty]?.[tx] ?? 0;
        if ((beh >= 0x30 && beh <= 0x37) || beh === 0xB9 || beh === 0xC0 || beh === 0xC1) return false;
        if (this.npcs.some(n => n !== npc && n.sprite.visible &&
                                 (n as any).tile?.x === tx && (n as any).tile?.y === ty)) return false;
        if (this.playerTile.x === tx && this.playerTile.y === ty) return false;
        return true;
      });
    }
  }

  /** Exécute le map_script ON_FRAME_TABLE si une entrée match l'état courant.
   *  Appelé à chaque frame d'`update()` (le décomp fait pareil cf. spec
   *  field_control_avatar.c:150). Le guard `isOnFrameRunning` évite la
   *  re-entrée pendant que le script précédent est encore en cours.
   *
   *  IMPORTANT : on check sync s'il y a un match AVANT de lock le player.
   *  Sinon (ancien bug) on lockait à chaque frame même sans match → user
   *  bloqué en permanence (re-lock 60×/s plus vite que les inputs). */
  private async tickOnFrameTable() {
    if (this.isOnFrameRunning) return;
    // Check sync (pas de side-effect) s'il y a un match dans la table.
    const scriptName = findOnFrameMatch(this.parsedScripts, this.mapName);
    if (!scriptName) return;
    if (!this.parsedScripts.scripts[scriptName]) return;
    // Match → lock + lance. Le sync set de dialogueOpen ferme la fenêtre
    // micro-gap avant que le script fasse lui-même lockall.
    this.isOnFrameRunning = true;
    this.dialogueOpen = true;
    try {
      await runScript(scriptName, this.parsedScripts, this.buildScriptContext());
    } finally {
      this.isOnFrameRunning = false;
      this.dialogueOpen = false;
    }
  }

  /**
   * @param canExitIndoor true = on autorise le trigger du warp intérieur
   *   (stand-on + DOWN). False pour l'auto-step de sortie qui ne doit pas
   *   re-trigger le warp.
   */
  private tryMove(dx: number, dy: number, facing: Facing, canExitIndoor = true) {
    if (this.time.now < this.inputLockUntil) return;
    // Bloque toute nouvelle tentative tant que le crossing seamless en cours
    // n'est pas finalisé (sinon double crossing — cf. DEV_LOG session 41).
    if (this.crossingInProgress) return;
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

    // Règle ARROW WARP : on est SUR une tile arrow warp (ex: tapis de sortie
    // MB_SOUTH_ARROW_WARP) et on push la direction de l'arrow. Cf. `TryArrowWarp`
    // dans field_control_avatar.c du décomp.
    const currentBeh = this.tilemap.behaviors[this.playerTile.y]?.[this.playerTile.x] ?? 0;
    if (isArrowWarp(currentBeh) && getArrowWarpDirection(currentBeh) === facing) {
      const warp = this.mapJson.warp_events?.find(
        w => w.x === this.playerTile.x && w.y === this.playerTile.y
      );
      if (warp) { this.triggerWarp(warp); return; }
    }

    const nx = this.playerTile.x + dx, ny = this.playerTile.y + dy;

    // === JUMP LEDGE (MB_JUMP_*) — saut auto par-dessus la tile ledge ===
    // Décomp `field_player_avatar.c` IsRunningOnPokeRiderInDirection : si la
    // tile DEVANT a behavior MB_JUMP_<facing>, le joueur saute 2 tiles dans
    // la direction (par-dessus la ledge). Pas de check collision intermédiaire.
    if (ny >= 0 && nx >= 0 && ny < this.layoutDef.height && nx < this.layoutDef.width) {
      const ledgeBeh = this.tilemap.behaviors[ny]?.[nx] ?? 0;
      if (isJumpLedge(ledgeBeh) && getJumpLedgeFacing(ledgeBeh) === facing) {
        this.performLedgeJump(facing, dx, dy);
        return;
      }
    }

    // SEAMLESS : si la cible est out-of-bounds de current map, check si une
    // adjacent loaded la contient. Si oui : tween normal vers la new pixel,
    // softSwitch au onComplete (le sprite traverse en glissant continûment
    // entre les 2 tilemap layers déjà rendues côte à côte). Si pas loaded :
    // fallback restart via tryConnectionWarp.
    let crossing: {
      mapInstance: MapInstance; newTileX: number; newTileY: number;
      targetPxX: number; targetPxY: number;
    } | null = null;
    const wMap = this.layoutDef.width, hMap = this.layoutDef.height;
    if (nx < 0 || ny < 0 || nx >= wMap || ny >= hMap) {
      if (this.world) {
        const cur = this.world.current();
        const worldTileX = nx + cur.worldOffsetX;
        const worldTileY = ny + cur.worldOffsetY;
        for (const inst of this.world.loaded.values()) {
          if (inst === cur) continue;
          const lx = worldTileX - inst.worldOffsetX;
          const ly = worldTileY - inst.worldOffsetY;
          if (lx >= 0 && ly >= 0 && lx < inst.layout.width && ly < inst.layout.height) {
            // Test collision sur l'adjacent
            if (inst.tilemap.collisions[ly]?.[lx] === 1) {
              setIdleFrame(this.playerSprite, this.currentTex(), facing);
              this.inputLockUntil = this.time.now + 60;
              return;
            }
            crossing = {
              mapInstance: inst, newTileX: lx, newTileY: ly,
              targetPxX: (lx + inst.worldOffsetX) * TILE_SIZE + TILE_SIZE / 2,
              targetPxY: (ly + inst.worldOffsetY) * TILE_SIZE + TILE_SIZE,
            };
            traceMark(`tryMove CROSSING detected from ${this.mapName} (tile ${this.playerTile.x},${this.playerTile.y} + d=${dx},${dy}) → ${inst.mapName} (tile ${lx},${ly})`);
            break;
          }
        }
      }
      if (!crossing) {
        // Adjacent pas loaded → fallback restart classique
        if (this.tryConnectionWarp(nx, ny)) return;
      }
    }

    if (!crossing && this.isBlocked(nx, ny)) {
      setIdleFrame(this.playerSprite, this.currentTex(), facing);
      this.inputLockUntil = this.time.now + 60;
      return;
    }

    const tex = this.currentTex();
    const cooldown = this.keyX?.isDown ? RUN_COOLDOWN : WALK_COOLDOWN;
    playSingleStep(this.playerSprite, tex, facing, cooldown);
    this.playerTile.x = nx; this.playerTile.y = ny;
    if (!crossing) gameState.map = { name: this.mapName, x: nx, y: ny };
    const tx = crossing ? crossing.targetPxX : nx * TILE_SIZE + TILE_SIZE / 2;
    const ty = crossing ? crossing.targetPxY : ny * TILE_SIZE + TILE_SIZE;
    if (crossing) this.crossingInProgress = true;
    this.tweens.add({
      targets: this.playerSprite,
      x: tx, y: ty,
      duration: cooldown,
      ease: 'Linear',
      onUpdate: () => this.playerSprite.setDepth(this.playerSprite.y),
      onComplete: () => {
        if (crossing) {
          // Sprite déjà au bon pixel → softSwitch silencieux maintenant.
          // Le flag crossingInProgress reste true jusqu'à la fin du softSwitch
          // pour bloquer toute autre tryMove pendant la transition.
          // (checkCoordEvent est déclenché par softSwitchToMap lui-même APRÈS
          //  map_scripts ON_FRAME — sinon les vars d'état ne sont pas init.)
          void this.softSwitchToMap(crossing.mapInstance.mapName, '', 0, crossing.newTileX, crossing.newTileY)
            .finally(() => { this.crossingInProgress = false; });
        } else {
          if (!this.isIndoor()) this.checkOutdoorWarp();
          else this.postMoveCheckStairsOrArrow(facing);
          void this.checkCoordEvent();
          // Behaviors post-step : grass encounter (placeholder log), walk
          // ledge (auto-step direction), slide ledge (continue glisser).
          this.checkPostMoveBehaviors(facing);
        }
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

  /** Warp checks après step. Logique fidèle au décomp (cf. `TryStartWarpEventScript`
   *  + `TryArrowWarp` + `TryDoorWarp` dans field_control_avatar.c) :
   *  - Instant step warp (ladders, escalators, non-animated doors, etc.) → warp immédiat
   *  - Arrow warp → warp SEULEMENT si heldDir == arrow direction (sinon on s'arrête sur la tile)
   *  - Porte animated atteinte en marchant UP = comme escalier vers étage sup → warp
   *  - Plain warp tile sans behavior spécial (rare, ex: truck) → warp instant (fallback) */
  private postMoveCheckStairsOrArrow(arrivedFacing: Facing) {
    const beh = this.tilemap.behaviors[this.playerTile.y]?.[this.playerTile.x] ?? 0;
    const findWarp = () => this.mapJson.warp_events?.find(
      w => w.x === this.playerTile.x && w.y === this.playerTile.y
    );
    // 1. Instant step warps (ladder, non-animated door, escalator, special, ...)
    if (isInstantStepWarp(beh)) {
      const w = findWarp(); if (w) this.triggerWarp(w);
      return;
    }
    // 2. Porte animée atteinte en marchant UP = escalier vers le haut (auto-warp)
    if (isDoorWarp(beh) && arrivedFacing === 'up') {
      const w = findWarp(); if (w) this.triggerWarp(w);
      return;
    }
    // 3. Arrow warp : warp SEULEMENT si on tient toujours la direction de l'arrow.
    //    Sinon on s'arrête sur la tile (= comportement "tapis de sortie").
    if (isArrowWarp(beh)) {
      if (getArrowWarpDirection(beh) === this.heldDir) {
        const w = findWarp(); if (w) this.triggerWarp(w);
      }
      return;
    }
    // 4. Fallback : tile sans behavior particulier (MB_NORMAL) mais avec warp_event
    //    (ex: tiles de sortie est du camion InsideOfTruck à (4, 1/2/3)).
    if (beh === MB_NORMAL) {
      const w = findWarp(); if (w) this.triggerWarp(w);
      return;
    }
    // Aucun match : on reste sur la tile (et la suite de tryMove laisse en idle).
    // Note : on ne warp jamais "par défaut" pour éviter les triggers parasites
    // sur des tiles spéciales du tileset qu'on ne connaît pas encore.
  }

  /** Si la position cible (nx, ny) est hors limites de la map ET qu'il y a une
   *  connection définie dans cette direction, lance le warp vers la map adjacente.
   *  Retourne true si traitement effectué. Cf. data/maps/<X>/connections.inc. */
  private tryConnectionWarp(nx: number, ny: number): boolean {
    const w = this.layoutDef.width, h = this.layoutDef.height;
    let direction: string | null = null;
    if (ny < 0) direction = 'up';
    else if (ny >= h) direction = 'down';
    else if (nx < 0) direction = 'left';
    else if (nx >= w) direction = 'right';
    if (!direction) return false;
    const conn = (this.mapJson.connections ?? []).find(c => c.direction === direction);
    if (!conn) return false;
    const mapIds = this.cache.json.get('map-ids') as Record<string, string>;
    const destDir = mapIds[conn.map];
    if (!destDir) { console.warn('[connection] dest inconnue', conn.map); return false; }
    // Si la map adjacente est déjà loaded dans world → SOFT promote (zéro restart).
    if (this.world?.loaded.has(destDir)) {
      void this.softSwitchToMap(destDir, direction, conn.offset);
      return true;
    }
    // Fallback : adjacent pas encore loaded → restart classique sans fade.
    this.input.keyboard?.removeAllListeners();
    this.heldDir = null;
    this.mapReady = false;
    this.scene.restart({
      mapName: destDir,
      fromConnection: {
        direction,
        sourceX: this.playerTile.x,
        sourceY: this.playerTile.y,
        offset: conn.offset,
      }
    });
    return true;
  }

  /** Soft-switch silencieux vers une map déjà loaded (vraiment seamless).
   *  Appelé au onComplete du tween qui a déjà bougé le sprite vers le pixel
   *  de la new current. Update les références internes, re-spawn NPCs, run
   *  map_scripts. NO restart, NO saut visuel.
   *  Si newTileX/Y omis : remap automatique via world.remapTile. */
  private async softSwitchToMap(newMapName: string, _direction: string, _offset: number, newTileXIn?: number, newTileYIn?: number) {
    traceReset(`softSwitch ${this.mapName} → ${newMapName}`);
    // FIX session 41 : guard vers soi-même. Sans ça, on destroy + re-spawn tous
    // les NPCs en 0.5ms (flicker invisible mais coûteux) + re-play musique.
    // Cause d'appel : tween onComplete qui re-fire après que le softSwitch initial
    // a déjà mis this.mapName=cible. Cf. logs probe session 41.
    if (newMapName === this.mapName) { traceMark('SKIP same map (no-op)'); return; }
    if (!this.world) { traceMark('ABORT no world'); return; }
    const target = this.world.get(newMapName);
    if (!target) { traceMark('ABORT target not loaded in world'); return; }
    traceMark('lock inputs (dialogueOpen=true)');
    // Lock inputs pendant le switch (évite race conditions avec load async des
    // NPC sprites). Sans ce lock, si user maintient la touche, tryMove fire
    // avec un state transitoire et le sprite peut "voyager dans les coins".
    const wasOpen = this.dialogueOpen;
    this.dialogueOpen = true;
    let newTileX: number, newTileY: number;
    if (newTileXIn != null && newTileYIn != null) {
      newTileX = newTileXIn; newTileY = newTileYIn;
    } else {
      const oldCurrent = this.world.current();
      const remapped = this.world.remapTile(oldCurrent, target, this.playerTile.x, this.playerTile.y);
      newTileX = Math.max(0, Math.min(target.layout.width - 1, remapped.x));
      newTileY = Math.max(0, Math.min(target.layout.height - 1, remapped.y));
    }

    // Promote (shift layers/NPCs/player sprite par (-target.offset)) pour que
    // current ait worldOffset (0, 0). Camera scrollX/Y shifté en même temps
    // pour éviter flash 1 frame. Cette invariante permet aux calculs pixel de
    // tryMove (`nx*TILE_SIZE+8`) de fonctionner sans avoir à ajouter l'offset.
    traceMark('promoteToCurrent (shift world layers + camera)');
    this.world.promoteToCurrent(target, this.playerSprite, this.cameras.main);

    // Destroy NPCs de l'ancienne current
    traceMark(`destroy ${this.npcs.length} old NPCs`);
    for (const npc of this.npcs) npc.sprite.destroy();
    this.npcs = [];

    // Switch les références locales
    this.mapName = target.mapName;
    this.mapJson = target.mapJson;
    this.layoutDef = target.layout;
    this.parsedScripts = target.parsedScripts;
    this.tilemap = target.tilemap;
    this.firedCoordEvents = new Set();

    // playerTile en coords NEW current. Sprite reste à sa position pixel absolue
    // (visuellement aucun saut — c'est ça le vrai seamless).
    this.playerTile = { x: newTileX, y: newTileY };
    gameState.map = { name: this.mapName, x: newTileX, y: newTileY };
    this.refreshMapLabel();

    // Spawn les NPCs de la new current map (depuis resolvedNpcs)
    const seen = new Set<string>();
    const toLoad = target.resolvedNpcs.filter(n => {
      if (seen.has(n.raw.graphics_id)) return false;
      seen.add(n.raw.graphics_id);
      return !this.textures.exists(n.sourceTextureKey);
    });
    traceMark(`NPCs to load: ${toLoad.length} (over ${target.resolvedNpcs.length} total)`);
    if (toLoad.length > 0) {
      for (const npc of toLoad) {
        this.load.spritesheet(npc.sourceTextureKey, npc.spriteUrl, {
          frameWidth: npc.gfx.frameWidth, frameHeight: npc.gfx.frameHeight
        });
      }
      await new Promise<void>(r => { this.load.once('complete', () => r()); this.load.start(); });
      traceMark('NPCs textures loaded (await complete)');
    }
    traceMark(`spawn ${target.resolvedNpcs.length} NPCs sprites`);
    for (const npc of target.resolvedNpcs) {
      if (!this.textures.exists(npc.textureKey)) {
        registerTransparentSpriteSheet(this, npc.sourceTextureKey, npc.textureKey, npc.gfx.frameWidth, npc.gfx.frameHeight);
      }
      const sprite = this.add.sprite(
        npc.raw.x * TILE_SIZE + TILE_SIZE / 2,
        npc.raw.y * TILE_SIZE + TILE_SIZE,
        npc.textureKey, 0
      );
      sprite.setOrigin(0.5, 1).setDepth(sprite.y);
      setIdleFrame(sprite, npc.textureKey, getInitialFacing(npc.raw.movement_type));
      if (npc.hiddenAtSpawn) sprite.setVisible(false);
      this.npcs.push({ ...npc, sprite });
    }
    target.spawnedNpcs = this.npcs as Array<ResolvedNpc & { sprite: Phaser.GameObjects.Sprite }>;

    // FIX session 39 : musique de la new map (le décomp fait TransitionMapMusic
    // dans LoadMapFromWarp, qui s'applique aussi aux maps adjacentes seamless).
    // Sans ça, la musique de la map d'origine reste indéfiniment.
    if (target.mapJson.music) {
      const musName = target.mapJson.music.toLowerCase() + '.mid';
      traceMark(`playMidiLoop ${musName}`);
      void playMidiLoop(`${BASE}/music/${musName}`);
    } else {
      traceMark('no music for target map');
    }

    // Release input lock (sauf si déjà locké par appelant)
    if (!wasOpen) this.dialogueOpen = false;
    traceMark(`✓ DONE input released (dialogueOpen=${this.dialogueOpen})`);

    // Run map_scripts ON_TRANSITION + ON_RESUME + ON_FRAME pour la new current.
    // ON_FRAME est CRITIQUE : c'est lui qui set des vars d'état comme
    // VAR_ROUTE101_STATE = 1, sans quoi les coord_events ne fire jamais (leur
    // var_value ne match pas). checkCoordEvent doit donc passer APRÈS.
    const ctx = this.buildScriptContext();
    void (async () => {
      try {
        await runMapScript(this.parsedScripts, this.mapName, 'MAP_SCRIPT_ON_TRANSITION', ctx);
        await runMapScript(this.parsedScripts, this.mapName, 'MAP_SCRIPT_ON_RESUME', ctx);
        await runOnFrameTable(this.parsedScripts, this.mapName, ctx);
      } catch (e) { console.warn('[softSwitch] map_scripts', e); }
      // Check coord_event APRÈS map_scripts (les vars d'état sont init).
      // Le `.then` du tween onComplete ne suffisait pas car ce IIFE est
      // async et fire après le return de softSwitchToMap.
      void this.checkCoordEvent();
    })();

    // Trigger pre-load des nouveaux adjacents de la new current
    void this.loadAdjacentsAsync();
  }

  private triggerWarp(warp: NonNullable<MapJson['warp_events']>[number]) {
    // Bloque ré-entrance pendant l'anim porte async (sinon double fadeOut +
    // double playDoorOpen quand touche maintenue). Le flag est reset par init()
    // après scene.restart().
    if (this.warpInProgress) return;
    this.warpInProgress = true;
    traceReset(`triggerWarp from ${this.mapName} → ${warp.dest_map}`);
    const mapIds = this.cache.json.get('map-ids') as Record<string, string>;
    // MAP_DYNAMIC + WARP_ID_DYNAMIC : destination définie par `setdynamicwarp`
    // (cf. truck → Littleroot via le coord trigger qui l'a set juste avant).
    let destDir: string | undefined;
    let spawnX: number | undefined;
    let spawnY: number | undefined;
    let warpIdForRestart: string | undefined = warp.dest_warp_id;
    if (warp.dest_map === 'MAP_DYNAMIC') {
      const dw = gameState.dynamicWarp;
      if (!dw) { console.warn('[warp] MAP_DYNAMIC sans dynamicWarp set'); this.warpInProgress = false; return; }
      destDir = mapIds[dw.mapId];
      spawnX = dw.x; spawnY = dw.y;
      warpIdForRestart = undefined; // on utilise spawnX/Y, pas un warp_id index
    } else {
      destDir = mapIds[warp.dest_map];
    }
    if (!destDir) { console.warn('[warp] dest inconnue', warp.dest_map); this.warpInProgress = false; return; }
    this.input.keyboard?.removeAllListeners();
    this.heldDir = null;
    this.mapReady = false;

    // FIX session 40 : NE PAS stopMusic() ici. Le décomp ne stoppe la musique
    // que si la map cible a une musique DIFFÉRENTE (ShouldChangeMusic). On laisse
    // playMidiLoop décider via son check `currentSong === url`. Sinon, à chaque
    // warp on coupe puis re-joue la même musique (effet "musique qui hoquette").

    const indoor = this.isIndoor();
    const playDoor = !indoor; // on est dehors, on entre dans un intérieur
    const finish = () => {
      traceMark('cameras.fadeOut(200ms)');
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.time.delayedCall(220, () => {
        traceMark('scene.restart()');
        this.scene.restart({ mapName: destDir, warpId: warpIdForRestart, fromIndoor: indoor, spawnX, spawnY });
      });
    };
    if (playDoor) {
      traceMark('playDoorOpen (async anim)');
      playDoorOpen(this, warp.x, warp.y, finish, this.getGameMetatileIdAt(warp.x, warp.y));
    }
    else { traceMark('indoor → skip door anim'); finish(); }
  }

  /** Saut ledge MB_JUMP_<DIR> : 2 tiles parabolique dans la direction.
   *  Décomp `JumpInPlace` / `JumpInDirection` : 16 frames @60fps = ~266ms. */
  private performLedgeJump(facing: Facing, dx: number, dy: number): void {
    const tex = this.currentTex();
    playSingleStep(this.playerSprite, tex, facing, WALK_COOLDOWN);
    const fx = this.playerTile.x + dx * 2;
    const fy = this.playerTile.y + dy * 2;
    this.playerTile.x = fx; this.playerTile.y = fy;
    gameState.map = { name: this.mapName, x: fx, y: fy };
    const tx = fx * TILE_SIZE + TILE_SIZE / 2;
    const ty = fy * TILE_SIZE + TILE_SIZE;
    const startY = this.playerSprite.y;
    const peakOffset = -10; // arc parabolique : remonte de 10 px au sommet
    const duration = 266; // 1:1 décomp (16 frames @60fps)
    this.tweens.add({
      targets: this.playerSprite,
      x: tx, y: ty,
      duration,
      ease: 'Linear',
      onUpdate: (tween) => {
        // Arc parabolique : y = base + 4*peak*t*(1-t)
        const t = tween.progress;
        const linearY = startY + (ty - startY) * t;
        this.playerSprite.y = linearY + 4 * peakOffset * t * (1 - t);
        this.playerSprite.setDepth(this.playerSprite.y);
      },
      onComplete: () => {
        this.playerSprite.y = ty;
        this.playerSprite.setDepth(ty);
        if (!this.isIndoor()) this.checkOutdoorWarp();
        void this.checkCoordEvent();
        this.checkPostMoveBehaviors(facing);
        this.time.delayedCall(30, () => {
          if (!this.heldDir) this.syncPlayerIdleTexture();
        });
      },
    });
    this.inputLockUntil = this.time.now + duration;
  }

  /** Behaviors qui s'appliquent APRÈS un mouvement réussi (post-step) :
   *  - MB_*_GRASS : trigger encounter sauvage (placeholder pour wild battles)
   *  - MB_WALK_<DIR> : auto-marche 1 tile dans la direction
   *  - MB_SLIDE_<DIR> : marche en continu tant que sur tile slide */
  private checkPostMoveBehaviors(_facing: Facing): void {
    const beh = this.tilemap.behaviors[this.playerTile.y]?.[this.playerTile.x] ?? 0;

    // Walk ledge : auto-marche dans la direction (escalator-like)
    if (isWalkLedge(beh)) {
      const dir = getWalkLedgeDirection(beh);
      if (dir) {
        this.time.delayedCall(50, () => {
          this.inputLockUntil = 0;
          this.tryMove(dirToDx(dir), dirToDy(dir), dir, false);
        });
        return;
      }
    }
    // Slide ledge : continue dans la direction tant qu'on est sur slide
    if (isSlideLedge(beh)) {
      const dir = getSlideLedgeDirection(beh);
      if (dir) {
        this.time.delayedCall(30, () => {
          this.inputLockUntil = 0;
          this.tryMove(dirToDx(dir), dirToDy(dir), dir, false);
        });
        return;
      }
    }
    // Grass encounter : herbe haute → log (placeholder pour wild battle).
    // TODO : quand `extract-wild-encounters.mjs` extrait les tables, lancer
    // un setwildbattle + dowildbattle ici avec RNG.
    if (isEncounterTile(beh)) {
      // Pour l'instant juste log silencieux (debug si jamais on veut tracer).
      // console.log('[encounter] tile', this.playerTile.x, this.playerTile.y, 'beh=0x'+beh.toString(16));
    }
  }

  private isBlocked(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.layoutDef.width || y >= this.layoutDef.height) return true;
    if (this.mapJson.warp_events?.some(w => w.x === x && w.y === y)) return false;
    if (this.tilemap.collisions[y]?.[x] === 1) return true;
    // Behaviors directionnels impassable (MB_IMPASSABLE_*, secret base, hybrides)
    // — pas dans le collision binary mais bloquent quand même (cf. session 51).
    const beh = this.tilemap.behaviors[y]?.[x] ?? 0;
    if ((beh >= 0x30 && beh <= 0x37) || beh === 0xB9 || beh === 0xC0 || beh === 0xC1) return true;
    // Les NPCs cachés (FLAG_HIDE_* set) ne bloquent pas — sinon impossible de
    // marcher où "Mom" devrait être avant qu'elle apparaisse, etc.
    // Position courante du NPC = tile mutable (mise à jour par runMovement)
    // sinon fallback à raw.x/y (position spawn). Sans ça : NPC marche, mais sa
    // collision reste à l'ancienne tile → ghost block + traversable sur nouveau spot.
    if (this.npcs.some(n => {
      const nx = (n as any).tile?.x ?? n.raw.x;
      const ny = (n as any).tile?.y ?? n.raw.y;
      return nx === x && ny === y && n.sprite.visible;
    })) return true;
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
    // Lookup par tile courante (mutée par runMovement) avec fallback raw.x/y.
    const npc = this.npcs.find(n => {
      const nx = (n as any).tile?.x ?? n.raw.x;
      const ny = (n as any).tile?.y ?? n.raw.y;
      return nx === tx && ny === ty;
    });
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
