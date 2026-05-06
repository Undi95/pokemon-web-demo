/**
 * TestOverworldScene — sanity check Phase 4.1 map loader.
 *
 * Charge Bourg-en-Vol (= MAP_LITTLEROOT_TOWN) via map-loader.ts native, le
 * compose dans BG1/BG2/BG3 1:1 décomp `sOverworldBgTemplates` (overworld.c:266),
 * et affiche le résultat via le compositor GBA pixel-perfect.
 *
 * Validation : si la map ressemble visuellement à Bourg-en-Vol GBA (= les
 * maisons, l'herbe, les chemins), Phase 4.1 est bonne.
 *
 * Pas de player avatar / npcs / scripts pour l'instant (= Phase 4.2-4.5).
 *
 * Activation : ajouter dans main.ts scene array, ou `scene.start('TestOverworldScene')`.
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { DecompRuntime, InitKeys, REG_OFFSET_DISPCNT } from '../engine/decomp-runtime';
import { setGlobalRuntime, resetObjAllocations } from '../engine/decomp-globals';
import { exposeGbaGlobals } from '../engine/gba-global-scope';
import {
  loadMapByName,
  InitMap,
  CopyMapTilesetsToVram,
  LoadMapTilesetPalettes,
  flushOverworldTilemaps,
  clearOverworldTilemaps,
  MAP_OFFSET,
} from '../engine/map-loader';
import {
  DrawWholeMapView,
  ResetFieldCamera,
  FieldUpdateBgTilemapScroll,
  CameraUpdate,
  SetCameraTopLeftCoords,
  GetCameraTopLeftCoords,
  gFieldCamera,
} from '../engine/field-camera';
import {
  InitPlayerAvatar,
  PlayerStep,
  DIR_SOUTH,
} from '../engine/player-avatar';
import { installInputHandlers, setHeldKeysOverride } from '../engine/input-handler';
import { installEngineDevtools } from '../engine/engine-devtools';

// 1:1 décomp `DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP` flags.
const DISPCNT_OBJ_ON = 0x1000;
const DISPCNT_OBJ_1D_MAP = 0x40;
const DISPCNT_BG1_ON = 0x200;
const DISPCNT_BG2_ON = 0x400;
const DISPCNT_BG3_ON = 0x800;

export class TestOverworldScene extends Phaser.Scene {
  private gba!: Gba;
  rt!: DecompRuntime;
  private bridge!: GbaPhaserBridge;
  private booted = false;
  private statusText?: Phaser.GameObjects.Text;

  constructor() { super({ key: 'TestOverworldScene' }); }

  create(): void {
    console.log('[TestOverworld] create()');
    this.cameras.main.setBackgroundColor('#000000');

    // y=14 pour passer SOUS le texte vert de DebugOverlayScene
    // (= overlay fps/tasks/sprites qui occupe la première ligne 0-12).
    this.statusText = this.add.text(4, 14, 'Loading Littleroot Town...', {
      fontFamily: 'monospace', fontSize: '8px', color: '#FFFFFF',
    }).setDepth(100);

    // Init engine GBA + runtime décomp.
    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'test-overworld-frame');
    this.rt = new DecompRuntime(this.gba);
    setGlobalRuntime(this.rt);
    resetObjAllocations();
    exposeGbaGlobals();
    InitKeys(this.rt);

    const frameImg = this.add.image(0, 0, 'test-overworld-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    installEngineDevtools(this.rt, {
      setHeldKeys: (mask) => setHeldKeysOverride(this.rt, mask),
      sceneName: 'TestOverworldScene',
    });

    // Real keyboard → rt.gMain.heldKeys via handler global partagé.
    // Cf. src/engine/input-handler.ts (= 1:1 décomp gMain.heldKeys canonical).
    installInputHandlers(this, this.rt);

    // Skip → TestGba si ESC.
    this.input.keyboard?.on('keydown-ESC', () => {
      console.log('[TestOverworld] ESC → TestGbaScene');
      this.scene.start('TestGbaScene');
    });

    void this.bootOverworld();
  }

  /** Async boot : load map + init BG + draw + go. */
  private async bootOverworld(): Promise<void> {
    try {
      // 1. Configure les 4 BG layers 1:1 décomp `sOverworldBgTemplates`
      //    (overworld.c:266-304). BG1/2/3 partagent charBase 0 (= tileset
      //    primary 0-511 + secondary 512-1023). Mapbases 29/28/30.
      //    BG0 (charBase 2 mapBase 31) = UI/dialogue (= pas utilisé Phase 4.1).
      const bg0 = this.rt.gba.bg(0).config;
      bg0.charBaseIndex = 2; bg0.mapBaseIndex = 31; bg0.screenSize = 0;
      bg0.paletteMode = 0; bg0.priority = 0; bg0.visible = false;

      const bg1 = this.rt.gba.bg(1).config;
      bg1.charBaseIndex = 0; bg1.mapBaseIndex = 29; bg1.screenSize = 0;
      bg1.paletteMode = 0; bg1.priority = 1; bg1.visible = true;
      bg1.hofs = 0; bg1.vofs = 0;

      const bg2 = this.rt.gba.bg(2).config;
      bg2.charBaseIndex = 0; bg2.mapBaseIndex = 28; bg2.screenSize = 0;
      bg2.paletteMode = 0; bg2.priority = 2; bg2.visible = true;
      bg2.hofs = 0; bg2.vofs = 0;

      const bg3 = this.rt.gba.bg(3).config;
      bg3.charBaseIndex = 0; bg3.mapBaseIndex = 30; bg3.screenSize = 0;
      bg3.paletteMode = 0; bg3.priority = 3; bg3.visible = true;
      bg3.hofs = 0; bg3.vofs = 0;

      // 2. Active OBJ + 1D_MAP. (Pas obligatoire pour Phase 4.1 mais évite
      //    surprises plus tard quand on ajoutera les sprites.)
      this.rt.SetGpuReg(REG_OFFSET_DISPCNT,
        DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP |
        DISPCNT_BG1_ON | DISPCNT_BG2_ON | DISPCNT_BG3_ON);

      // 3. Load map + tilesets + layout (= async, parallèle).
      this.statusText?.setText('Loading map data...');
      const header = await loadMapByName('MAP_LITTLEROOT_TOWN');
      console.log(`[TestOverworld] Loaded ${header.id} : ${header.mapLayout.width}x${header.mapLayout.height}`);
      console.log(`  primary tileset : ${header.mapLayout.primaryTileset.tiles.length} bytes char + ${header.mapLayout.primaryTileset.metatiles.length / 8} metatiles`);
      console.log(`  secondary tileset : ${header.mapLayout.secondaryTileset.tiles.length} bytes char + ${header.mapLayout.secondaryTileset.metatiles.length / 8} metatiles`);

      // 4. InitMap : copie map.bin → gBackupMapLayout avec border padding.
      InitMap();
      console.log(`[TestOverworld] InitMap done : gBackupMapLayout ${header.mapLayout.width + 15}x${header.mapLayout.height + 14}`);

      // 5. Copy tilesets → BG VRAM (charBase 0, tile 0..1023).
      this.statusText?.setText('Copying tilesets to VRAM...');
      CopyMapTilesetsToVram(header.mapLayout);

      // 6. Load tileset palettes → BG palette banks 0-12.
      LoadMapTilesetPalettes(header.mapLayout);

      // 7. Reset field camera + position initiale (= top-left de la view en
      //    coords gBackupMapLayout). Pour Bourg-en-Vol 20x20, on commence à
      //    la position du joueur classique (= centre map - 7 metatiles pour
      //    le viewport 15x10). Camera top-left ≈ centre - 7,5.
      ResetFieldCamera();
      const camX = Math.floor(header.mapLayout.width / 2);  // = 10 (player x)
      const camY = Math.floor(header.mapLayout.height / 2); // = 10 (player y)
      // Camera top-left = player pos en coords gBackupMapLayout (= player + MAP_OFFSET pour saveBlock1.pos compat).
      // Décomp DrawWholeMapView utilise gSaveBlock1Ptr->pos.x (= player coord -7).
      // On simule : camera top-left = (player_x, player_y).
      SetCameraTopLeftCoords(camX, camY);

      // 8. Draw whole map view dans les 3 BG tilemap buffers.
      clearOverworldTilemaps();
      const cam = GetCameraTopLeftCoords();
      console.log(`[TestOverworld] camera top-left coords : (${cam.x}, ${cam.y})`);
      DrawWholeMapView(cam.x, cam.y, header.mapLayout);

      // 9. Push tilemap buffers → VRAM mapBases + scroll registers.
      flushOverworldTilemaps(this.rt);
      FieldUpdateBgTilemapScroll(this.rt);

      // 10. Force palette flush (= TransferPlttBuffer simulé) pour que les
      //     couleurs apparaissent dès la 1ère frame, sans attendre un VBlankCB.
      this.rt.gPlttBufferFaded.flushTo();

      // 11. Phase 4.3 : init player avatar (= sprite + state machine).
      //     Player spawn à la position canonique de Bourg-en-Vol (= map (10, 10),
      //     centre approximatif de la ville). PlayerStep() est appelé chaque frame
      //     dans update() pour driver le walk state machine (= no manual camera
      //     scroll input — c'est le player avatar qui driver gFieldCamera).
      const spawnX = Math.floor(header.mapLayout.width / 2);
      const spawnY = Math.floor(header.mapLayout.height / 2);
      await InitPlayerAvatar(spawnX, spawnY, DIR_SOUTH, 'MALE', this.rt);

      this.statusText?.setText(`Bourg-en-Vol ${header.mapLayout.width}x${header.mapLayout.height} (arrows = walk)`);
      this.booted = true;
      console.log('[TestOverworld] boot done');
    } catch (e) {
      console.error('[TestOverworld] bootOverworld failed:', e);
      this.statusText?.setText(`ERROR : ${e}`);
    }
  }

  update(_: number, deltaMs: number): void {
    if (!this.rt || !this.booted) return;
    // rt.gMain.heldKeys déjà à jour via input-handler.ts global.
    try {
      this.rt.tickFixed(deltaMs);
    } catch (e) {
      console.error('[TestOverworld.update] tickFixed THREW:', e);
    }
    // Phase 4.3 : PlayerStep drive gFieldCamera.movementSpeedX/Y selon input.
    // (= 1:1 décomp PlayerStep → MovePlayerNotOnBike → PlayerWalkNormal qui
    // démarre une 16-frame step. Camera follow automatique.)
    try {
      PlayerStep(this.rt.gMain.heldKeys, this.rt.gMain.newKeys, this.rt);
      CameraUpdate();
      flushOverworldTilemaps(this.rt);
      FieldUpdateBgTilemapScroll(this.rt);
    } catch (e) {
      console.error('[TestOverworld.update] player/camera update THREW:', e);
    }
    try {
      this.bridge.tick();
    } catch (e) {
      console.error('[TestOverworld.update] bridge.tick THREW:', e);
    }
  }
}
