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
  TransitionToConnection,
  ComputeConnectionDestPos,
  MoveMapViewToBackup,
  CONNECTION_NORTH,
  CONNECTION_SOUTH,
  CONNECTION_WEST,
  CONNECTION_EAST,
} from '../engine/map-loader';
import type { MapHeader, WarpEvent } from '../engine/map-loader';
import {
  DrawWholeMapView,
  ResetFieldCamera,
  ResetCameraUpdateInfo,
  FieldUpdateBgTilemapScroll,
  CameraUpdate,
  SetCameraTopLeftCoords,
  GetCameraTopLeftCoords,
  gFieldCamera,
  gTotalCamera,
  IsBgRedrawPending,
  ClearBgRedrawPending,
  getPendingConnection,
  clearPendingConnection,
} from '../engine/field-camera';
import type { PendingConnection } from '../engine/field-camera';
import {
  InitPlayerAvatar,
  PlayerStep,
  DestroyPlayerAvatar,
  SetPlayerVisibility,
  DIR_NONE,
  DIR_NORTH,
  DIR_SOUTH,
  NOT_MOVING,
  T_NOT_MOVING,
  gPlayerAvatar,
} from '../engine/player-avatar';
import {
  SpawnObjectEventsOnMap,
  UpdateObjectEvents,
  TickObjectEventMovements,
  resetObjectEventAllocations,
  destroyAllNpcSprites,
  UpdateObjectEventsForCameraUpdate,
  preloadNpcGraphicsForMap,
} from '../engine/object-events';
import { installInputHandlers, setHeldKeysOverride } from '../engine/input-handler';
import { installEngineDevtools } from '../engine/engine-devtools';
import {
  loadMapScripts,
  ScriptContext_RunScript,
  ScriptContext_Init,
  LockPlayerFieldControls,
  UnlockPlayerFieldControls,
} from '../engine/script-runtime';
import {
  getPendingWarp,
  setPendingWarp,
  getExitTaskKindFor,
  getMetatileBehaviorAtPlayerPos,
  getPlayerCoordsFromWarp,
} from '../engine/warp-system';
import type { WarpKind } from '../engine/warp-system';
import {
  GetDoorSoundEffect,
  FieldAnimateDoorOpen,
  FieldAnimateDoorClose,
  FieldSetDoorOpened,
  preloadDoorTiles,
} from '../engine/field-door';
import {
  CreateWarpArrowSprite,
  DestroyWarpArrowSprite,
  HideShowWarpArrow,
  UpdateWarpArrowSprite,
} from '../engine/field-effect-arrow';
import { PlaySE } from '../engine/decomp-globals';
import {
  SE_EXIT,
  SE_WARP_IN,
} from '../engine/decomp-data/auto/include/constants/songs-data';
import {
  InitFieldMessageBox,
  TickFieldMessageBox,
  preloadStandardMenuPalette,
} from '../engine/field-message-box';
import { preloadFontData } from '../engine/gba-text-system';
import { preloadTextWindowFrames } from '../engine/gba-text-window';
import { PlayBGM, FillPalBufferBlack } from '../engine/decomp-globals';
import * as Songs from '../engine/decomp-data/auto/include/constants/songs-data';
// Side-effect import : registers Phase 4.5 opcode handlers.
import '../engine/script-opcodes';
import {
  InitTilesetAnimations,
  UpdateTilesetAnimations,
  TransferTilesetAnimsBuffer,
} from '../engine/tileset-anims';

// 1:1 décomp `Overworld_PlaySpecialMapMusic` (overworld.c) — track current
// playing BGM id pour skip restart si new map a la même music. Sans ça, warp
// Bourg-en-Vol → MaysHouse (= same MUS_LITTLEROOT) restart le BGM = glitch.
let _currentMapBgmId = 0;

// 1:1 décomp `DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP` flags.
const DISPCNT_OBJ_ON = 0x1000;
const DISPCNT_OBJ_1D_MAP = 0x40;
const DISPCNT_BG0_ON = 0x100;
const DISPCNT_BG1_ON = 0x200;
const DISPCNT_BG2_ON = 0x400;
const DISPCNT_BG3_ON = 0x800;

export class TestOverworldScene extends Phaser.Scene {
  private gba!: Gba;
  rt!: DecompRuntime;
  private bridge!: GbaPhaserBridge;
  private booted = false;
  private statusText?: Phaser.GameObjects.Text;
  /** Phase 4.6 : flag pour skip MainCB2_Overworld pendant fade+load async d'un
   *  warp. Set par executeWarp au start, cleared à la fin. Sans ce flag, le
   *  PlayerStep + ScriptContext_RunScript continueraient à tourner pendant
   *  le load → corruption state (= old map data + new player coords). */
  private warpInProgress = false;

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

    // Expose Phase 4.6+ globals pour debug devtools console.
    // Usage : `arrowDebug()` → log player + cam + arrow positions.
    (globalThis as Record<string, unknown>).gPlayerAvatar = gPlayerAvatar;
    (globalThis as Record<string, unknown>).gTotalCamera = gTotalCamera;
    (globalThis as Record<string, unknown>).GetCameraTopLeftCoords = GetCameraTopLeftCoords;
    (globalThis as Record<string, unknown>).arrowDebug = (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const arrowState = (globalThis as any).getArrowState?.();
      console.log('arrowDebug:', {
        playerX: gPlayerAvatar.x,
        playerY: gPlayerAvatar.y,
        camX: GetCameraTopLeftCoords().x,
        camY: GetCameraTopLeftCoords().y,
        offX: gTotalCamera.pixelOffsetX,
        offY: gTotalCamera.pixelOffsetY,
        arrowState,
      });
    };

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
      // BG0 = UI/dialog (= utilisé Phase 4.5 pour message box).
      const bg0 = this.rt.gba.bg(0).config;
      bg0.charBaseIndex = 2; bg0.mapBaseIndex = 31; bg0.screenSize = 0;
      bg0.paletteMode = 0; bg0.priority = 0; bg0.visible = true;
      bg0.hofs = 0; bg0.vofs = 0;

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
        DISPCNT_BG0_ON | DISPCNT_BG1_ON | DISPCNT_BG2_ON | DISPCNT_BG3_ON);

      // 3-12 : load + init map (= 1:1 décomp `CB2_LoadMap` flow). Helper
      //         réutilisé par executeWarp pour les map switches.
      // Spawn position du boot : centre de Bourg-en-Vol (= défaut testing).
      // Phase 4.7+ : remplacer par save game last known location.
      const header = await this.loadAndInitMap('MAP_LITTLEROOT_TOWN', -1, -1, DIR_SOUTH);

      // 1:1 décomp `SetVBlankCallback(VBlankCB_Overworld)`. Le simple fait
      // d'avoir un vblankCallback set fait que tickFixed.runOneFrame call
      // `gPlttBufferFaded.flushTo()` (= TransferPlttBuffer simulé). Sans ça,
      // les nouvelles palettes (= dialog frame, fades) ne sont JAMAIS poussées
      // au compositor → frame border noir + fades figés.
      const _VBlankCB_Overworld: () => void = () => { /* no-op marker pour activer transfer */ };
      this.rt.SetVBlankCallback(_VBlankCB_Overworld);
      // SKIP OnTransition / OnFrame map_scripts pour l'instant (= éviterait la
      // cinématique Maman si VAR_LITTLEROOT_INTRO_STATE pas init à 3). User
      // warning : Phase 4.5+ pour wirer ces triggers proprement avec un état
      // de jeu valide (= post-intro).

      // 13. Register MainCB2_Overworld (= per-frame callback) qui drive
      //     PlayerStep + CameraUpdate à FIXED 60Hz via rt.tickFixed.
      //     Critique pour timing 1:1 GBA : si on l'appelait dans update()
      //     Phaser, le player ralentirait quand le browser drop des frames.
      //     Préfix "MainCB2" → tickFixed runs RunTasks/AnimateSprites/etc.
      const rt = this.rt;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const MainCB2_Overworld = function MainCB2_Overworld(): void {
        // Phase 4.6 : pendant warp transition (= async load map), skip tout
        // le game logic. tickFixed continue d'appeler UpdatePaletteFade
        // automatiquement → le fade out/in render correctement.
        if (self.warpInProgress) return;
        // Phase 4.6 : check pending warp détecté par PlayerStep au step end
        // ou collision push UP devant door. Si yes, démarre la transition
        // async + skip ce frame de game logic.
        const pending = getPendingWarp();
        if (pending) {
          void self.executeWarp(pending.warp, pending.kind);
          return;
        }
        // Phase 4.5 : tick script engine FIRST. ScriptContext_RunScript loop
        // les opcodes jusqu'à wait/end. Si script lock les controls,
        // PlayerStep skip son input.
        ScriptContext_RunScript();
        // Phase 4.5 : tick field message box state machine.
        TickFieldMessageBox();
        PlayerStep(rt.gMain.heldKeys, rt.gMain.newKeys, rt);
        CameraUpdate();
        // Phase 4.8 : check seamless cross-border transition signalé par
        // CameraMove. 1:1 décomp `LoadMapFromCameraTransition` flow : NO fade,
        // sync swap des map data + tilesets. Primary tileset reste partagé
        // entre la map sortante et la map entrante (= connections existent
        // seulement entre maps avec primary tileset compatible).
        const pendingConn = getPendingConnection();
        if (pendingConn) {
          self.handleConnectionTransition(pendingConn);
        }
        // Phase 4.4.c : tick NPC movement state machine (LOOK_AROUND / WANDER).
        TickObjectEventMovements(rt);
        // Phase 4.4.a : update sprite positions des NPCs selon camera scroll.
        UpdateObjectEvents(rt);
        // Phase 4.9 audit fix : `RemoveObjectEventsOutsideView` + `TrySpawn
        // ObjectEvents` sont MAINTENANT appelés depuis `UpdateObjectEventsFor
        // CameraUpdate` orchestrator dans `CameraUpdate` au tile boundary
        // (= 1:1 décomp field_camera.c:416 + event_object_movement.c:2217).
        // Plus de per-frame call ici (= éliminait le mid-step capture drift
        // qui causait "1 case trop haut" sur NPCs spawnés mid-step).
        // Phase 4.7 : 1:1 décomp `HideShowWarpArrow` + sprite update. Per-frame
        // check : si player on ARROW_WARP tile + facing/walking matching dir
        // → show arrow at adjacent tile. Sinon hide. UpdateWarpArrowSprite tick
        // anim + sync sprite OAM position avec camera scroll.
        HideShowWarpArrow(rt, gPlayerAvatar.x, gPlayerAvatar.y, gPlayerAvatar.facing);
        UpdateWarpArrowSprite(rt);
        // 1:1 décomp `ScheduleBgCopyTilemapToVram` pattern : flush VRAM
        // SEULEMENT quand BG buffer modifié (= copyBGToVRAM flag). Évite
        // 18432 entries × 2 bytes copy par frame quand rien ne bouge.
        // Le flag est set par DrawMetatile / RedrawMapSlice / DrawWholeMapView.
        if (IsBgRedrawPending()) {
          flushOverworldTilemaps(rt);
          ClearBgRedrawPending();
        }
        FieldUpdateBgTilemapScroll(rt);
        // 1:1 décomp `UpdateTilesetAnimations` (tileset_anims.c:586-598) :
        // tick compteurs primaire/secondaire + dispatch callbacks qui queued
        // les writes VRAM dans le buffer.
        UpdateTilesetAnimations();
        // 1:1 décomp `TransferTilesetAnimsBuffer` (tileset_anims.c:564-572) :
        // flush le buffer → gba.vram (= simule DMA3 au VBlank).
        TransferTilesetAnimsBuffer(rt);
      };
      this.rt.gMain.callback2 = MainCB2_Overworld;

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
    // PlayerStep + CameraUpdate driven par gMain.callback2 dans tickFixed.
    // Optim : tickFixed retourne le nb de frames LOGIQUES exécutées. Si
    // 0 (= update appelé > 60Hz, accumulator pas plein), pas besoin de
    // re-render. gba.tick (= composeFrame 5.3ms) + putImageData (= ~3ms)
    // sont skip → on n'affiche pas une frame identique.
    let framesProcessed = 0;
    try {
      framesProcessed = this.rt.tickFixed(deltaMs);
    } catch (e) {
      console.error('[TestOverworld.update] tickFixed THREW:', e);
    }
    if (framesProcessed > 0) {
      try {
        this.bridge.tick();
      } catch (e) {
        console.error('[TestOverworld.update] bridge.tick THREW:', e);
      }
    }
  }

  // ─── Phase 4.6 helpers : load + warp ──────────────────────────────────────

  /** Refactored from bootOverworld step 3-12. Reusable pour boot + warp.
   *  1:1 décomp `CB2_LoadMap` flow (overworld.c) :
   *    LoadMapData + CopyMapTilesetsToVram + LoadMapTilesetPalettes +
   *    InitObjectEventsLocal + InitMap + ResetFieldCamera + DrawWholeMapView.
   *
   *  @param mapId      Map ID literal (e.g. 'MAP_LITTLEROOT_TOWN')
   *  @param spawnX     Player position X (-1 = use map center, fallback testing)
   *  @param spawnY     Player position Y (-1 = use map center)
   *  @param spawnDir   Player facing direction (DIR_*)
   *  @returns The loaded MapHeader (= so caller can read warps for player coords).
   */
  private async loadAndInitMap(
    mapId: string, spawnX: number, spawnY: number, spawnDir: number,
  ): Promise<MapHeader> {
    this.statusText?.setText(`Loading ${mapId}...`);
    const header = await loadMapByName(mapId);
    console.log(`[TestOverworld] Loaded ${header.id} : ${header.mapLayout.width}x${header.mapLayout.height}`);

    // 1:1 décomp `ResetScreenForMapLoad` (overworld.c:2077-2086) — DISPCNT=0
    // pour disable BG layers + OBJ pendant le load. Sans ça, pendant les frames
    // entre LoadMapTilesetPalettes (= NEW palettes) et clearOverworldTilemaps
    // + DrawWholeMapView (= NEW BG buffer), le compositor render OLD BG buffer
    // tilemap avec NEW palettes + NEW VRAM tiles → garbage pixels (= flash rose
    // / gris observed pendant warps). Décomp réactive DISPCNT au state 4 via
    // InitOverworldGraphicsRegisters (overworld.c:2096-2129) qui set le DISPCNT
    // standard. On fait pareil en restaurant le DISPCNT à la fin du load.
    const dispcntSaved = this.rt.GetGpuReg(REG_OFFSET_DISPCNT);
    this.rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);

    // 1:1 décomp `InitMap` (fieldmap.c) — copy map.bin + border to gBackupMapLayout.
    InitMap();

    // 1:1 décomp `CopyMapTilesetsToVram` + `LoadMapTilesetPalettes` (fieldmap.c).
    CopyMapTilesetsToVram(header.mapLayout);
    LoadMapTilesetPalettes(header.mapLayout);
    // 1:1 décomp `InitTilesetAnimations` (tileset_anims.c:574-579).
    // Doit être appelé APRÈS CopyMapTilesetsToVram (= callbacks setté par CopyMapTilesetsToVram).
    // Reset buffer + init primary + secondary callbacks.
    InitTilesetAnimations();

    // 1:1 décomp `ResetFieldCamera` + `ResetCameraUpdateInfo` (= reset complet
    // camera state pour la new map). Sans ResetCameraUpdateInfo, gFieldCamera.x/y
    // (= sub-tile pixel offset) + gTotalCamera reste stale du map précédent →
    // scroll wiggle / split visual au prochain step. 1:1 décomp `ResumeMap`
    // (overworld.c:2138) appelle ResetCameraUpdateInfo systématiquement.
    ResetFieldCamera();
    ResetCameraUpdateInfo();

    // Determine spawn coords (= -1 fallback to map center for boot testing).
    const sx = spawnX >= 0 ? spawnX : Math.floor(header.mapLayout.width / 2);
    const sy = spawnY >= 0 ? spawnY : Math.floor(header.mapLayout.height / 2);
    // Phase 4.6 : destroy player sprite avant re-init pour éviter leak OAM.
    DestroyPlayerAvatar(this.rt);
    await InitPlayerAvatar(sx, sy, spawnDir, 'MALE', this.rt);

    // 1:1 décomp `DrawWholeMapView` (field_camera.c).
    clearOverworldTilemaps();
    const cam = GetCameraTopLeftCoords();
    DrawWholeMapView(cam.x, cam.y, header.mapLayout);
    flushOverworldTilemaps(this.rt);
    FieldUpdateBgTilemapScroll(this.rt);
    this.rt.gPlttBufferFaded.flushTo();

    // Phase 4.4.a : spawn NPCs. Phase 4.6 : destroy old NPC sprites first.
    destroyAllNpcSprites(this.rt);
    resetObjectEventAllocations();
    await SpawnObjectEventsOnMap(this.rt);

    // Sync NPC sprite OAM positions IMMÉDIATEMENT après spawn. Sans ça, les
    // NPCs créés via CreateSpriteAtOam(x:0, y:0) restent en (0, 0) à l'écran
    // jusqu'à ce que MainCB2_Overworld tick UpdateObjectEvents (= warpInProgress
    // false en Phase 5). Le user voit donc tous les NPCs flash en haut-gauche
    // pendant 1-2 frames avant fade in. Sync explicite ici fixe le flash.
    UpdateObjectEvents(this.rt);

    // Phase 4.5 : preload font + scripts (fonts cached, scripts re-fetched).
    // Le scriptsBaseName est dérivé de header.mapScripts (= e.g.
    // 'LittlerootTown_BrendansHouse_1F_MapScripts' → strip `_MapScripts`).
    const scriptsBaseName = header.mapScripts.replace(/_MapScripts$/, '');
    await Promise.all([
      preloadFontData(),
      preloadTextWindowFrames(),
      preloadStandardMenuPalette(),
      loadMapScripts(scriptsBaseName),
      preloadDoorTiles(),  // Phase 4.7 : door anims rendering
    ]);

    // Phase 4.7 : warp arrow sprite (= 1:1 décomp `CreateWarpArrowSprite`).
    // Re-create at each map load (= ancien sprite cleanup automatique en interne).
    DestroyWarpArrowSprite(this.rt);
    await CreateWarpArrowSprite(this.rt);
    InitFieldMessageBox();
    ScriptContext_Init();

    // 1:1 décomp `Overworld_PlaySpecialMapMusic` (overworld.c) :
    // si la new map music ID == currently playing → do nothing (= keep playing
    // sans restart). Sinon → PlayBGM(newId) (= fade out + play new).
    // Sans ce check : warp Bourg-en-Vol → Mays House (= les 2 ont MUS_LITTLEROOT)
    // restart le BGM à chaque transition = audio glitch.
    const songId = (Songs as unknown as Record<string, number>)[header.music] ?? 0;
    if (songId > 0 && songId !== _currentMapBgmId) {
      console.log(`[TestOverworld] PlayBGM(${header.music} = ${songId})`);
      PlayBGM(songId);
      _currentMapBgmId = songId;
    } else if (songId > 0) {
      console.log(`[TestOverworld] BGM ${header.music} déjà playing, skip restart`);
    }

    // Restore DISPCNT (= re-enable BG/OBJ layers) maintenant que le BG buffer
    // est ré-écrit (= DrawWholeMapView), les NPCs sont spawnés + sync (=
    // UpdateObjectEvents au-dessus), et la palette est prête (= LoadMapTileset
    // Palettes a écrit les NEW colors, color[0] = black via LoadTilesetPalette
    // black-fill). 1:1 décomp `InitOverworldGraphicsRegisters` (overworld.c:2096).
    this.rt.SetGpuReg(REG_OFFSET_DISPCNT, dispcntSaved);

    return header;
  }

  /** Phase 4.6 1:1 décomp warp dispatch : `DoWarp` / `DoDoorWarp` / etc. selon
   *  WarpKind. Implémente la séquence de tasks `Task_DoDoorWarp` + `Task_WarpAndLoadMap`
   *  + `FieldCB_DefaultWarpExit` + `SetUpWarpExitTask` (`Task_ExitDoor` /
   *  `Task_ExitNonAnimDoor` / `Task_ExitNonDoor`).
   *
   *  Phases :
   *    1. Pre-warp anim (kind-specific) :
   *       - 'door' : `Task_DoDoorWarp` (= door open SE + anim + walk-up + door close)
   *       - 'teleport' : SE_WARP_IN
   *       - autres : rien
   *    2. WarpFadeOutScreen (+ SE_EXIT pour step warps)
   *    3. WarpIntoMap = load dest map + spawn player
   *    4. WarpFadeInScreen
   *    5. SetUpWarpExitTask = exit task selon dest tile metatile_behavior :
   *       - 'door' : `Task_ExitDoor` (= door open instant + walk-down + door close)
   *       - 'non_anim' : `Task_ExitNonAnimDoor` (= juste walk-down)
   *       - 'none' : `Task_ExitNonDoor` (= juste unlock)
   *
   *  Pendant les phases 1 + 5 : `warpInProgress = false` (= MainCB2_Overworld
   *  tourne pour tick PlayerStep qui drive forceMovement walks). Pendant les
   *  phases 2-4 : `warpInProgress = true` (= scene logique skipped, juste fade
   *  + load).
   */
  private async executeWarp(warp: WarpEvent, kind: WarpKind): Promise<void> {
    if (this.warpInProgress) return;
    setPendingWarp(null, null);  // claim le warp pending
    LockPlayerFieldControls();
    console.log(`[executeWarp] START kind=${kind} → ${warp.destMap}#${warp.warpId}`);

    try {
      // ─── Phase 1 : kind-specific pre-warp anim (= Task_DoDoorWarp pour 'door') ───
      // 1:1 décomp `Task_DoDoorWarp` (field_screen_effect.c:677-728).
      // warpInProgress = false : on laisse le player walk-up auto via forceMovement.
      if (kind === 'door') {
        // Door tile = position en face du player (= player.x, player.y - 1
        // car player face NORTH au moment du collision dispatch).
        const doorX = gPlayerAvatar.x;
        const doorY = gPlayerAvatar.y - 1;
        // case 0 : PlaySE(GetDoorSoundEffect) + FieldAnimateDoorOpen.
        PlaySE(GetDoorSoundEffect(doorX, doorY));
        await FieldAnimateDoorOpen(doorX, doorY);
        // case 1 : ObjectEventSetHeldMovement(WALK_NORMAL_UP) — force walk player UP.
        gPlayerAvatar.forceMovement = DIR_NORTH;
        await this.waitForForcedWalkComplete();
        // case 2 : FieldAnimateDoorClose + **SetPlayerVisibility(FALSE)**.
        // Order décomp : ObjectEventClearHeldMovementIfFinished puis
        // SetPlayerVisibility(FALSE), puis door close.
        // → sprite player disparait DANS la porte avant que close anim play.
        // Sans ça : player visible debout sur door tile pendant close = pas 1:1.
        SetPlayerVisibility(this.rt, false);
        await FieldAnimateDoorClose(doorX, doorY);
      }

      // ─── Phase 2 : fade out (= WarpFadeOutScreen + SE_EXIT) ─────────────
      this.warpInProgress = true;
      // 1:1 décomp `TryFadeOutOldMapMusic` : check si dest map music ID ≠ courante.
      // TODO Phase 4.7 : implementer + wait BGMusicStopped. Pour MVP : skip,
      // PlayBGM dans loadAndInitMap override automatiquement.
      this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
      // 1:1 décomp `DoWarp` line 490 : PlaySE(SE_EXIT) pour step warps.
      // Pour 'door' : SE déjà joué dans Task_DoDoorWarp. Pour 'teleport' :
      // SE_WARP_IN (= 1:1 décomp `DoTeleportTileWarp`).
      if (kind === 'step' || kind === 'arrow' || kind === 'ladder') {
        PlaySE(SE_EXIT);
      } else if (kind === 'teleport') {
        PlaySE(SE_WARP_IN);
      }
      await this.waitForFadeComplete();

      // ─── Phase 3 : WarpIntoMap = load dest map + spawn ─────────────────
      // 1:1 décomp `WarpIntoMap` → `ApplyCurrentWarp` + `SetPlayerCoordsFromWarp`.
      // SetPlayerCoordsFromWarp (overworld.c:603) ne touche PAS au facing → facing
      // carries over de la source map. Player walked UP dans la source = facing
      // NORTH au warp, et Task_ExitDoor case 1 dispatch WALK_NORMAL_DOWN qui set
      // facing à DIR_SOUTH au step 0 (= 1 frame après SetPlayerVisibility(TRUE)).
      // → on voit 1 frame de sprite facing UP puis walk-down auto.
      // Notre version : preserve gPlayerAvatar.facing courant (= depuis la
      // source map). Le walk-down auto override facing au step start. Pour les
      // warps non-door (= ladder/arrow/teleport), on preserve aussi.
      const destPreheader = await loadMapByName(warp.destMap);
      const coords = getPlayerCoordsFromWarp(destPreheader, warp.warpId);
      const destX = coords.x;
      const destY = coords.y;
      const destDir = coords.facing;  // 1:1 décomp : facing carries over
      const destHeader = await this.loadAndInitMap(warp.destMap, destX, destY, destDir);
      console.log(`[executeWarp] loaded ${destHeader.id}, player at (${destX},${destY}) facing=${destDir}`);

      // ─── Pre-Phase 4 : determine exit task kind + setup pre-fade-in state ──
      // 1:1 décomp `Task_ExitDoor` case 0 (field_screen_effect.c:325-330) +
      // `Task_ExitNonAnimDoor` case 0 (field_screen_effect.c:373-378) :
      //   SetPlayerVisibility(FALSE)
      //   FreezeObjectEvents()
      //   PlayerGetDestCoords(x, y)
      //   FieldSetDoorOpened(x, y)   ← door OPEN visuel AVANT fade in !
      //   tState = 1
      // → fade in montre le map avec door déjà ouverte + player invisible (=
      // "le player est dans la porte"). Puis case 1 : SetPlayerVisibility(TRUE)
      // + walk-down. Visuellement : sprite apparait sur door tile, walk-down,
      // close anim.
      // Si on call FieldSetDoorOpened APRÈS fade in (= dans Phase 5), le user
      // voit door fermée pendant fade in puis pop ouverte, c'est pas 1:1.
      const exitKind = getExitTaskKindFor(getMetatileBehaviorAtPlayerPos());
      console.log(`[executeWarp] exit task kind=${exitKind}`);
      if (exitKind === 'door' || exitKind === 'non_anim') {
        SetPlayerVisibility(this.rt, false);
      }
      if (exitKind === 'door') {
        // 1:1 case 0 : FieldSetDoorOpened (= instant draw open frame, no SE, no anim).
        // À call MAINTENANT avant fade in, pas en Phase 5.
        await FieldSetDoorOpened(gPlayerAvatar.x, gPlayerAvatar.y);
      }

      // ─── Phase 4 : fade in (= 1:1 décomp `WarpFadeInScreen` field_screen_effect.c:74) ─
      // L'ordre 1:1 décomp :
      //   FillPalBufferBlack();   // = CpuFastFill16(RGB_BLACK, gPlttBufferFaded, PLTT_SIZE)
      //   FadeScreen(FADE_FROM_BLACK, 0);  // = BeginNormalPaletteFade(ALL, 0, 16, 0, RGB_BLACK)
      //
      // Sans FillPalBufferBlack : LoadMapTilesetPalettes (dans loadAndInitMap) a
      // écrit les NEW colors dans gPlttBufferFaded → flushTo() pousse les NEW
      // colors → écran flash full-color avant le fade in (bug visible session 102 :
      // entrée labo = magenta + tiles bizarres parce que palette transition wrong).
      FillPalBufferBlack();
      // Force flush BLACK au PLTT register IMMEDIATELY pour overrider le push
      // de NEW colors fait par loadAndInitMap (= flushTo() à la fin de
      // LoadMapTilesetPalettes). Sans ça, écran montre 1 frame full-color avant
      // que le fade in commence à blender vers BLACK → flash visible.
      this.rt.gPlttBufferFaded.flushTo();
      this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
      await this.waitForFadeComplete();

      // ─── Phase 5 : SetUpWarpExitTask (kind-specific exit task) ──────────
      // warpInProgress = false : on laisse PlayerStep tick le walk-down auto.
      this.warpInProgress = false;

      // Defensive : force BG buffer redraw + flush + scroll register reset.
      // Bug observed : après warp + walking, "map sur le côté de l'écran"
      // (= flicker visuel). Hypothèse : sFieldCameraOffset state stale (=
      // xTileOffset/yTileOffset/pixelOffset) pas reset cleanly avant walking.
      // Re-running clear+draw+flush+scroll garantit un état BG buffer 100%
      // consistent avec _camPos post-warp avant que user puisse walk.
      clearOverworldTilemaps();
      const camPostWarp = GetCameraTopLeftCoords();
      DrawWholeMapView(camPostWarp.x, camPostWarp.y, destHeader.mapLayout);
      flushOverworldTilemaps(this.rt);
      FieldUpdateBgTilemapScroll(this.rt);

      if (exitKind === 'door') {
        // 1:1 décomp `Task_ExitDoor` (field_screen_effect.c:317).
        // Door tile = player spawn position (= player on door après warp).
        // Note : FieldSetDoorOpened déjà appelé en Pre-Phase 4 (= 1:1 case 0).
        const doorX = gPlayerAvatar.x;
        const doorY = gPlayerAvatar.y;
        // case 1 : SetPlayerVisibility(TRUE) + ObjectEventSetHeldMovement(WALK_NORMAL_DOWN).
        SetPlayerVisibility(this.rt, true);
        gPlayerAvatar.forceMovement = DIR_SOUTH;
        await this.waitForForcedWalkComplete();
        // case 2-3 : FieldAnimateDoorClose à la door position originale.
        await FieldAnimateDoorClose(doorX, doorY);
      } else if (exitKind === 'non_anim') {
        // 1:1 décomp `Task_ExitNonAnimDoor` (field_screen_effect.c:366) :
        // case 1 : SetPlayerVisibility(TRUE) + walk-down auto (= 1 step DOWN), no door anim.
        SetPlayerVisibility(this.rt, true);
        gPlayerAvatar.forceMovement = DIR_SOUTH;
        await this.waitForForcedWalkComplete();
      }
      // exitKind === 'none' (= MB_LADDER, MB_*_ARROW_WARP, etc.) :
      // 1:1 décomp `Task_ExitNonDoor` (field_screen_effect.c:404) : juste unlock.
      // PAS de SetPlayerVisibility (= sprite reste visible, spawn déjà à dest pos).

      this.statusText?.setText(`${destHeader.id} ${destHeader.mapLayout.width}x${destHeader.mapLayout.height}`);
    } catch (e) {
      console.error('[executeWarp] failed:', e);
      this.statusText?.setText(`WARP ERROR : ${e}`);
    } finally {
      // Toujours unlock + reset state.
      UnlockPlayerFieldControls();
      this.warpInProgress = false;
      gPlayerAvatar.forceMovement = DIR_NONE;  // cleanup safety.
      // Safety : si une exception a interrompu Phase 5 entre SetPlayerVisibility(false)
      // et SetPlayerVisibility(true), on reset visible TRUE pour pas laisser sprite
      // invisible bloqué.
      SetPlayerVisibility(this.rt, true);
      console.log('[executeWarp] DONE');
    }
  }

  /** Phase 4.8 : seamless cross-border transition. 1:1 décomp
   *  `LoadMapFromCameraTransition` (overworld.c:784) appelé par `CameraMove`
   *  quand le camera traverse un border vers une connexion.
   *
   *  Sync (= no fade, no async load) car prefetch depth 1 dans `loadMapByName`
   *  garantit que tous les assets de la connexion sont en cache.
   *
   *  Steps :
   *    1. Get pending connection (= direction + connection info from CameraMove).
   *    2. ComputeConnectionDestPos : new player.x/y in destination map's
   *       logical coords (= 1:1 décomp `SetPositionFromConnection` + delta).
   *    3. TransitionToConnection : sync swap gMapHeader + InitMap + secondary
   *       tileset/palette. Primary tileset stays in VRAM.
   *    4. Update gPlayerAvatar.x/y to new logical coords.
   *    5. SetCameraTopLeftCoords to the new map's view top-left.
   *    6. clearOverworldTilemaps + DrawWholeMapView for new map.
   *    7. flushOverworldTilemaps + FieldUpdateBgTilemapScroll.
   *    8. destroyAllNpcSprites + async SpawnObjectEventsOnMap (= new map's NPCs
   *       appear over a few frames, ~50ms ; pas critique car player près du
   *       border, NPCs au centre/loin).
   *    9. Switch BGM si nécessaire (= 1:1 `TransitionMapMusic`).
   *   10. Clear pending connection. */
  private handleConnectionTransition(pending: PendingConnection): void {
    const { connection } = pending;
    console.log(`[connection] crossing dir=${pending.direction} → ${connection.destMap}`);

    // Phase 4.9 strict 1:1 décomp : CameraMove a déjà fait TOUT le swap sync
    // (= TransitionToConnection + gPlayerAvatar pre-step + _camPos update +
    // MoveMapViewToBackup + gCamera.active tracking). Le BG buffer est déjà
    // dans le bon état grâce à RedrawMapSlicesForCameraUpdate qui s'exécute
    // post-CameraMove dans CameraUpdate avec NEW gBackupMapLayout.
    //
    // handleConnectionTransition fait juste les scene-level ops :
    //   - NPC orchestrator (= UpdateCoords + TrySpawn + RemoveOutsideView).
    //   - BGM transition.
    //   - Status text update.
    const newHeader = (globalThis as Record<string, unknown>).gMapHeader as MapHeader;
    if (!newHeader || newHeader.id === '') {
      console.warn('[connection] gMapHeader not swapped, abort');
      clearPendingConnection();
      return;
    }

    // 1:1 décomp NPC orchestrator post-cross.
    void preloadNpcGraphicsForMap(newHeader);
    UpdateObjectEventsForCameraUpdate(this.rt, pending.deltaX, pending.deltaY);
    UpdateObjectEvents(this.rt);

    // BGM transition. 1:1 décomp `TransitionMapMusic`.
    const songId = (Songs as unknown as Record<string, number>)[newHeader.music] ?? 0;
    if (songId > 0 && songId !== _currentMapBgmId) {
      console.log(`[connection] PlayBGM(${newHeader.music} = ${songId})`);
      PlayBGM(songId);
      _currentMapBgmId = songId;
    }

    // Status text.
    this.statusText?.setText(`${newHeader.id} ${newHeader.mapLayout.width}x${newHeader.mapLayout.height}`);

    clearPendingConnection();
    void connection;
  }

  /** Wait que le forced movement (= forceMovement step auto) soit terminé.
   *  forceMovement est cleared par PlayerStep block lock controls quand le
   *  step auto se finit (= stepFramesLeft → 0). */
  private waitForForcedWalkComplete(): Promise<void> {
    return new Promise((resolve) => {
      const check = (): void => {
        // Step done = forceMovement reset à DIR_NONE par PlayerStep block lock
        // controls + runningState = NOT_MOVING.
        if (gPlayerAvatar.forceMovement === DIR_NONE && gPlayerAvatar.runningState === NOT_MOVING) {
          resolve();
        } else {
          setTimeout(check, 17);
        }
      };
      check();
    });
  }

  /** Wait async pour que le palette fade soit terminé. Poll via setTimeout
   *  ~17ms (= 1 frame GBA). Plus simple que créer un task décomp pour MVP. */
  private waitForFadeComplete(): Promise<void> {
    return new Promise((resolve) => {
      const check = (): void => {
        if (!this.rt.gPaletteFade.active) {
          resolve();
        } else {
          setTimeout(check, 17);
        }
      };
      check();
    });
  }
}
