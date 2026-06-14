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
import { DecompRuntime, InitKeys, REG_OFFSET_DISPCNT } from '../engine/system/decomp-runtime';
import { setGlobalRuntime, resetObjAllocations } from '../engine/system/decomp-globals';
import { exposeGbaGlobals } from '../engine/system/gba-global-scope';
import {
  loadMapByName,
  InitMap,
  InitMapFromSavedGame,
  CopyMapTilesetsToVram,
  LoadMapTilesetPalettes,
  flushOverworldTilemaps,
  clearOverworldTilemaps,
  MAP_OFFSET,
  TransitionToConnection,
  MoveMapViewToBackup,
  CONNECTION_NORTH,
  CONNECTION_SOUTH,
  CONNECTION_WEST,
  CONNECTION_EAST,
  gMapHeader,
} from '../engine/field/map-loader';
import type { MapHeader, WarpEvent } from '../engine/field/map-loader';
import {
  DrawWholeMapView,
  ResetFieldCamera,
  ResetCameraUpdateInfo,
  InstallCameraPanAheadCallback,
  UpdateCameraPanning,
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
} from '../engine/field/field-camera';
import type { PendingConnection } from '../engine/field/field-camera';
import {
  InitPlayerAvatar,
  PlayerStep,
  DestroyPlayerAvatar,
  SetPlayerVisibility,
  GetPlayerFacingDirection,
  DIR_NONE,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_EAST,
  DIR_WEST,
  NOT_MOVING,
  T_NOT_MOVING,
  gPlayerAvatar,
} from '../engine/field/player-avatar';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../engine/save/save-block-state';
import { SetObjectEventDirection, gObjectEvents } from '../engine/field/object-events';
import { CopyPartyAndObjectsFromSave, SetCurrentMap, LoadObjEventTemplatesFromHeader } from '../engine/save/load_save';
import {
  SpawnObjectEventsOnMap,
  SpawnObjectEventsOnReturnToField,
  UpdateObjectEvents,
  TickObjectEventMovements,
  resetObjectEventAllocations,
  destroyAllNpcSprites,
  UpdateObjectEventsForCameraUpdate,
  preloadNpcGraphicsForMap,
  FreezeObjectEvents,
  UnfreezeAllNpcs as UnfreezeObjectEvents,
  ApplyLevitateMovement_TickAll,
  ResetLevitateMovementTasks,
  InitReflectionDistortion,
  UpdateReflectionDistortionMatrices,
} from '../engine/field/object-events';
import { tickMovementQueues, resetMovementQueues, applyMovement, isMovementDone } from '../engine/field/movement-system';
import { ScriptMovement_MoveObjects, ScriptMovement_Reset } from '../engine/field/script-movement';
import { SetFieldEffectRuntime } from '../engine/field/field-effect';
import { decideBootMode, preloadBootData } from '../engine/boot/boot-mode';
import { installInputHandlers, setHeldKeysOverride } from '../engine/system/input-handler';
import { installEngineDevtools } from '../engine/devtools/engine-devtools';
import {
  loadMapScripts,
  ScriptContext_RunScript,
  ScriptContext_Init,
  ScriptContext_Snapshot,
  ScriptContext_Restore,
  LockPlayerFieldControls,
  UnlockPlayerFieldControls,
  RunOnTransitionMapScript,
  TryRunOnFrameMapScript,
  TryRunOnWarpIntoMapScript,
} from '../engine/script/script-runtime';
import {
  getPendingWarp,
  setPendingWarp,
  getExitTaskKindFor,
  getMetatileBehaviorAtPlayerPos,
  getPlayerCoordsFromWarp,
  GetAdjustedInitialDirection,
  GetDynamicWarp,
} from '../engine/field/warp-system';
import type { WarpKind } from '../engine/field/warp-system';
import {
  GetDoorSoundEffect,
  FieldAnimateDoorOpen,
  FieldAnimateDoorClose,
  FieldSetDoorOpened,
  preloadDoorTiles,
} from '../engine/field/field-door';
import {
  CreateWarpArrowSprite,
  DestroyWarpArrowSprite,
  HideShowWarpArrow,
  UpdateWarpArrowSprite,
} from '../engine/field/field-effect-arrow';
import {
  LoadEmoteAssets,
  tickEmoteSprites,
  DestroyAllEmoteSprites,
} from '../engine/field/field-effect-emotes';
import { UpdateTVScreensOnMap } from '../engine/ui/tv-screen';
import {
  preloadTallGrassEffect,
  UpdateTallGrassEffects,
  DestroyAllTallGrassEffects,
  TrySpawnTallGrassOnReturnToField,
} from '../engine/field/field-effect-grass';
import {
  preloadSparkleEffect,
  UpdateSparkleEffects,
  UpdateSparkleGenericEffects,
  DestroyAllSparkleEffects,
} from '../engine/field/field-effect-sparkle';
import { DoTimeBasedEvents } from '../engine/system/time-based-events';
import {
  preloadJumpDustEffect,
  UpdateJumpDustEffects,
  DestroyAllJumpDustEffects,
} from '../engine/field/field-effect-jump-dust';
// Ripple : migré dans le miroir 1:1 game/field_effect_helpers.ts (one-shot via
// WaitFieldEffectSpriteAnim — tické + auto-despawn par le callback global).
import { preloadRippleEffect } from '../game/field_effect_helpers';
import {
  preloadLongGrassEffect,
  UpdateLongGrassEffects,
  DestroyAllLongGrassEffects,
} from '../engine/field/field-effect-long-grass';
// Short grass : migré dans le miroir 1:1 game/field_effect_helpers.ts (sprite.callback).
import { preloadShortGrassEffect } from '../game/field_effect_helpers';
// Jump impact (jump tall/long grass + small/big splash) : migrés dans le miroir 1:1.
import { preloadJumpImpactEffects } from '../game/field_effect_helpers';
// Splash + feet-in-flowing-water : migrés dans le miroir 1:1 game/field_effect_helpers.ts.
import { preloadSplashEffect } from '../game/field_effect_helpers';
import {
  preloadFootprintsEffects,
  UpdateFootprintsEffects,
  DestroyAllFootprintsEffects,
} from '../engine/field/field-effect-footprints';
// Sand pile : migré dans le miroir 1:1 game/field_effect_helpers.ts (modèle sprite.callback,
// plus de pool ni d'Update manuel — le callback global runSpriteCallbacks le tique).
// Sand pile + hot springs : migrés dans le miroir 1:1 game/field_effect_helpers.ts
// (modèle sprite.callback — le callback global runSpriteCallbacks les tique).
import { preloadSandPileEffect, preloadHotSpringsEffect } from '../game/field_effect_helpers';
// Bubbles : migré dans le miroir 1:1 game/field_effect_helpers.ts (one-shot sprite.callback).
import { preloadBubblesEffect } from '../game/field_effect_helpers';
import {
  preloadAshEffect,
  UpdateAshEffects,
  DestroyAllAshEffects,
} from '../engine/field/field-effect-ash';
import {
  preloadSurfBlobEffect,
  UpdateSurfBlobEffects,
  UpdateUnderwaterSurfBlobEffects,
  DestroyAllSurfBlobEffects,
} from '../engine/field/field-effect-surf-blob';
import {
  preloadDisguiseEffects,
  UpdateDisguiseEffects,
  DestroyAllDisguiseEffects,
} from '../engine/field/field-effect-disguise';
import {
  preloadShadowEffect,
  CreateShadowSprite,
  UpdateShadowSprite,
  DestroyShadowSprite,
} from '../engine/field/field-effect-shadow';
import { PlaySE } from '../engine/system/decomp-globals';
import {
  SE_EXIT,
  SE_WARP_IN,
} from '../engine/decomp-data/include/constants/songs-data';
import {
  InitFieldMessageBox,
  TickFieldMessageBox,
  preloadStandardMenuPalette,
} from '../engine/field/field-message-box';
import { TickStartMenu } from '../engine/ui/start-menu';
import { TickBedroomPC } from '../engine/ui/bedroom-pc';
import { TickPCAnim } from '../engine/pokemon/pc-anim';
import { TickRegionMap } from '../engine/field/region-map';
import { syncSubspriteOam } from '../engine/field/object-events';
import { preloadFontData } from '../engine/ui/gba-text-system';
import { preloadTextWindowFrames } from '../game/text_window';
import { PlayBGM, FillPalBufferBlack } from '../engine/system/decomp-globals';
import { FadeScreen, FADE_FROM_BLACK } from '../engine/system/fade-screen';
import * as Songs from '../engine/decomp-data/include/constants/songs-data';
// Side-effect import : registers Phase 4.5 opcode handlers.
import '../engine/script/script-opcodes';
// Side-effect import : registers gSpecials[] stubs (1:1 décomp scrcmd ScrCmd_special).
import '../engine/script/specials-registry';
// Side-effect import : registers pokemon_size_record specials (Seedot/Lotad).
import '../engine/pokemon/pokemon-size-record';
// Side-effect import : registers secret_base specials (cur base helpers).
import '../engine/pokemon/secret-base';
import { ShowMapNamePopup, preloadMapNames } from '../engine/field/map-name-popup';
import { loadGameData, installDexDevtools } from '../engine/data/game-data';
import {
  InitTilesetAnimations,
  UpdateTilesetAnimations,
  TransferTilesetAnimsBuffer,
} from '../engine/field/tileset-anims';

/** 1:1 décomp `GetWalkNormalMovementAction` (event_object_movement.c:4959,
 *  via `dirn_to_anim` macro). Map direction → walk_normal movement action
 *  label. Utilisé par `Task_ExitNonAnimDoor` case 1 pour push 1 case dans
 *  le facing courant. Notre équivalent : convertir le facing en action
 *  string compatible avec applyMovement. */
function _walkActionForDirection(dir: number): string {
  if (dir === DIR_NORTH) return 'walk_up';
  if (dir === DIR_SOUTH) return 'walk_down';
  if (dir === DIR_WEST)  return 'walk_left';
  if (dir === DIR_EAST)  return 'walk_right';
  // Defensive default : décomp ligne 4955 set direction=0 (= DIR_NONE) si
  // hors range, ce qui retourne `gWalkNormalMovementActions[0]` =
  // MOVEMENT_ACTION_WALK_NORMAL_DOWN (= sud). Match notre default 'walk_down'.
  return 'walk_down';
}

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
    // Session 129 : hidden par défaut (= pollue rendu GBA pendant menus/scenes
    // non-OW comme bag/option/etc.). DebugOverlay green text reste pour fps/tasks.
    // Ré-activer via `?statusText=1` URL param pour debug.
    const showStatusText = new URLSearchParams(window.location.search).get('statusText') === '1';
    this.statusText = this.add.text(4, 14, 'Loading Littleroot Town...', {
      fontFamily: 'monospace', fontSize: '8px', color: '#FFFFFF',
    }).setDepth(100).setVisible(showStatusText);

    // Init engine GBA + runtime décomp.
    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'test-overworld-frame');
    this.rt = new DecompRuntime(this.gba);
    setGlobalRuntime(this.rt);
    resetObjAllocations();
    exposeGbaGlobals();
    InitKeys(this.rt);
    // H3.4 : capture runtime pour FieldEffectStart dispatcher.
    SetFieldEffectRuntime(this.rt);

    // 1:1 décomp `wild_encounter.c` : init gWildMonHeaders depuis le json
    // extrait (= 519 maps avec land/water/rock_smash/fishing slots + encounter
    // rates 1:1 décomp wild_encounters.json). Wire StandardWildEncounter au
    // PlayerStep step-end via CheckStandardWildEncounter (= 4-step immunity
    // counter + prevBehavior track 1:1 field_control_avatar.c:668-686).
    void (async () => {
      const { InitWildEncountersFromJson, ResetWildEncounterImmunity } = await import('../engine/field/wild-encounter');
      try {
        const res = await fetch('/decomp/em/wild-encounters.json');
        const data = await res.json();
        InitWildEncountersFromJson(data);
        ResetWildEncounterImmunity();
      } catch (e) {
        console.warn('[TestOverworld] wild-encounters.json load failed:', e);
      }
    })();

    // Audit session 126 (post-test) : 1:1 décomp `CB2_NewGame:1144 + CB2_
    // ContinueSavedGame:1340` → `PlayTimeCounter_Start()`. Sans ça, le state
    // reste à STOPPED → playTimeVBlanks/Seconds/Minutes/Hours jamais incrémentés
    // → DUREE JEU "0:00" toujours. À call AU BOOT overworld pour que le tick
    // dans decomp-runtime.tickFixed soit actif.
    void import('../engine/pokemon/play-time-counter').then(({ PlayTimeCounter_Start }) => {
      PlayTimeCounter_Start();
      console.log('[TestOverworld] PlayTimeCounter_Start invoked');
    });

    const frameImg = this.add.image(0, 0, 'test-overworld-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    // Expose Phase 4.6+ globals pour debug devtools console.
    // Usage : `arrowDebug()` → log player + cam + arrow positions.
    // Expose Phaser scene pour les modules overlay (= region-map, wallclock, etc.)
    // qui ont besoin d'add GameObjects au scene principal sans circular import.
    (globalThis as Record<string, unknown>).__phaserOverworldScene = this;
    (globalThis as Record<string, unknown>).gPlayerAvatar = gPlayerAvatar;
    (globalThis as Record<string, unknown>).gTotalCamera = gTotalCamera;
    (globalThis as Record<string, unknown>).GetCameraTopLeftCoords = GetCameraTopLeftCoords;
    (globalThis as Record<string, unknown>).arrowDebug = (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const arrowState = (globalThis as any).getArrowState?.();
      console.log('arrowDebug:', {
        playerX: gSaveBlock1Ptr.pos.x,
        playerY: gSaveBlock1Ptr.pos.y,
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
      //
      // Phase 4.10 démo finale Chunk 1 : spawn dans le camion 1:1 décomp
      // `WarpToTruck` (new_game.c:127) qui place le joueur dans MAP_INSIDE_OF_TRUCK.
      // Spawn coords (1, 2) = côté ouest du camion 5×5, le joueur marche east et
      // déclenche le coord trigger à (3, 2) qui setdynamicwarp + warps vers (4, 2).
      //
      // 1:1 décomp `InsideOfTruck_EventScript_SetIntroFlagsMale` (= triggered au
      // coord trigger (3, 2)) :
      //   setdynamicwarp MAP_LITTLEROOT_TOWN, 3, 10
      //   setvar VAR_LITTLEROOT_INTRO_STATE, 1
      //   setflag FLAG_HIDE_*  (= cache rivale, mom may, etc.)
      //
      // Player puis warp à (4, 2) → MAP_DYNAMIC → MAP_LITTLEROOT_TOWN (3, 10)
      // (= position du camion à Bourg-en-Vol). Là, OnFrame trigger
      // `LittlerootTown_EventScript_StepOffTruckMale` (= INTRO_STATE = 1) :
      //   - applymovement player jump_right (= saut hors du camion)
      //   - applymovement Mom MomApproachPlayerAtTruck (= maman descend)
      //   - warpsilent MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F, 8, 8
      //
      // Phase 4.10 démo : dispatcher boot mode (= save / ?nointro / new game).
      // Cf. boot-mode.ts pour le détail :
      //   - `?nointro` URL param → preset Test/Male/sac+flags + spawn Bourg.
      //   - localStorage save existante → resume from saved map+coords.
      //   - Default → new game cinematic (= NewGameInit + truck à 1:1 WarpToTruck).
      // Pre-load items.json AVANT decideBootMode (= AddBagItem dans le preset
      // ?nointro lookup .pocket via getItem(itemKey) qui dépend de cette table).
      await preloadBootData();
      const boot = decideBootMode();
      console.log(`[TestOverworld] boot mode = ${boot.mode} → ${boot.mapId} (${boot.x}, ${boot.y})`);
      // Étape 5 : resume save → InitMapFromSavedGame (LoadSavedMapView). Les
      // autres modes (newgame/nointro) → InitMap normal (= 1:1 décomp).
      const header = await this.loadAndInitMap(
        boot.mapId, boot.x, boot.y, boot.facing, boot.mode === 'resume',
      );

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

      // Phase 4.10 : si on spawn dans le camion via le NewGame flow (= 1:1
      // décomp `gFieldCallback = ExecuteTruckSequence` dans CB2_NewGame), on
      // démarre la cinematic du camion (= sons SE_TRUCK_MOVE/STOP/UNLOAD/DOOR
      // + camera wobble + door tile open). Lock player controls le temps que
      // le task soit terminé. Cf. truck-cinematic.ts pour les détails 1:1.
      if (boot.mode === 'newgame' && boot.mapId === 'MAP_INSIDE_OF_TRUCK') {
        const { ExecuteTruckSequence } = await import('../engine/field/truck-cinematic');
        ExecuteTruckSequence(this.rt);
      } else if (boot.mode === 'resume') {
        // 1:1 décomp `CB2_ContinueSavedGame` (overworld.c:1750) :
        //   gFieldCallback = FieldCB_FadeTryShowMapPopup;
        // → RunFieldCallback → FieldCB_WarpExitFadeFromBlack (field_screen_effect.c:289) :
        //     Overworld_PlaySpecialMapMusic();
        //     FadeInFromBlack();   // = FillPalBufferBlack + FadeScreen(FADE_FROM_BLACK, 0)
        //     SetUpWarpExitTask();
        //     LockPlayerFieldControls();
        //
        // User-flag 2026-05-20 : "Au chargement d'une sauvegarde dans le jeu,
        // il y a un fade noir, on a pas le jeu comme ça en pleine face".
        // Avant : loadAndInitMap chargeait les palettes (= LoadPalette écrit
        // Faded direct) → SetVBlankCallback flush → field visible INSTANT sans
        // fade. Fix : FillPalBufferBlack + FadeScreen FADE_FROM_BLACK juste
        // après loadAndInitMap, BEFORE le MainCB2_Overworld register → fade-in
        // 8 frames black → field colors.
        FillPalBufferBlack();
        // Force flush BLACK au PLTT register IMMEDIATELY pour overrider le push
        // de NEW colors fait par loadAndInitMap (= LoadMapTilesetPalettes
        // flushTo). Pattern identique au warp fade-in (= executeWarp:971).
        this.rt.gPlttBufferFaded.flushTo();
        this.rt.gPaletteFade.bufferTransferDisabled = false;
        FadeScreen(FADE_FROM_BLACK, 0);
      }

      // 13. Register MainCB2_Overworld (= per-frame callback) qui drive
      //     PlayerStep + CameraUpdate à FIXED 60Hz via rt.tickFixed.
      //     Critique pour timing 1:1 GBA : si on l'appelait dans update()
      //     Phaser, le player ralentirait quand le browser drop des frames.
      //     Préfix "MainCB2" → tickFixed runs RunTasks/AnimateSprites/etc.
      const rt = this.rt;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const MainCB2_Overworld = function MainCB2_Overworld(): void {
        // Audit session 126 LOT E3 : 1:1 décomp `CB2_Overworld` (overworld.c:
        // 1453-1480) ne skip QUE player input pendant un fade, pas tout le
        // game logic. Avant : `if (warpInProgress) return` skip TOUT (script
        // tick, msgbox, start menu) → un script qui call fadescreen puis
        // enchaîne ne reprend pas immédiatement après fade. Maintenant : on
        // skip uniquement les player-driven ticks (PlayerStep + camera +
        // npc movement) mais on laisse script + msgbox + start menu tick.
        // Risque : state corruption si scripts modifient des structures de
        // map en cours de teardown. À tester live ; revert si bugs visibles.
        if (self.warpInProgress) {
          // 1:1 décomp partial : tick script engine + message box pendant fade
          // pour que les scripts qui call fadescreen + enchaînent reprennent.
          ScriptContext_RunScript();
          TickFieldMessageBox();
          return;
        }
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
        // Phase 4.10 : poll OnFrame map_script_2 entries per-frame. Trigger
        // scripts conditionnels basés sur var values (= e.g. StepOffTruckMale
        // quand VAR_LITTLEROOT_INTRO_STATE = 1). 1:1 décomp
        // `MapHeaderCheckScriptTable(MAP_SCRIPT_ON_FRAME_TABLE)`.
        TryRunOnFrameMapScript();
        // Phase 4.5 : tick field message box state machine.
        TickFieldMessageBox();
        // Phase 4.10 : tick start menu state machine. Si START button pressé
        // hors script + dialog, ouvre le menu. Si menu ouvert, drive l'input
        // (navigation/selection/close). LockPlayerFieldControls assure que
        // PlayerStep skip son input quand menu ouvert.
        TickStartMenu();
        // 1:1 décomp player_pc.c : tick BedroomPC overlay menu state machine.
        // Si PC ouvert : drive l'input + navigate sub-menus. Quand PC se ferme :
        // soit ScriptContext_SetupScript(TurnOffPlayerPC), soit SignalWaitState.
        TickBedroomPC();
        // 1:1 décomp field_specials.c:Task_PCTurnOnEffect : flicker PC metatile
        // 5 fois quand DoPCTurnOnEffect a été déclenché par script. Notre task
        // runtime tick chaque frame, toggle every 6 frames.
        TickPCAnim();
        // 1:1 décomp field_region_map.c: tick worldmap overlay (= MoveRegionMapCursor_Full
        // input + cursor pos update). A/B = close + SignalWaitState.
        TickRegionMap();
        PlayerStep(rt.gMain.heldKeys, rt.gMain.newKeys, rt);
        // Phase 4.10 : tick script-driven movements AVANT CameraUpdate. Le tick
        // set gFieldCamera.movementSpeedX/Y que CameraUpdate lit ce même frame
        // pour décrémenter pixelOffsetX/Y. Si l'ordre est inversé, on perd 1 px
        // de décrément par action (= drift visuel).
        tickMovementQueues(rt);
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

        // 1:1 décomp `UpdateCameraPanning()` (field_camera.c:456-463) appelé
        // chaque frame du `CB2_Overworld` chain (= overworld.c:2310+). Dérive
        // `gSpriteCoordOffset.x/y` depuis gTotalCamera - pan utilisés par les
        // sprites overworld (= OBJ avec `coordOffsetEnabled = TRUE` côté HW).
        UpdateCameraPanning();

        // ─── Fix défensif désync `_camPos` vs `gPlayerAvatar` ────────────────
        // Bug user-flag 2026-05-22 : après warp / menu / event scripted, le
        // sprite player + BG apparaissent décalés d'1 case (= cam.x ≠ player.x).
        // Cause root TS : `_camPos` (field-camera) et `gSaveBlock1Ptr.pos.x/y`
        // (player-avatar) sont 2 vars SÉPARÉES qui peuvent diverger sur certains
        // paths (= probablement Task_ExitDoor walk-down qui call PlayerStep step
        // end avant CameraMove fire). Décomp n'a qu'1 seule var `gSaveBlock1Ptr
        // ->pos`, impossible de diverger.
        //
        // Fix défensif (= éviter refactor invasif PHASE A qui a cassé scroll) :
        // si player NOT_MOVING + pas de cross-border en cours + cam ≠ player,
        // re-sync cam = player + force full redraw. Trigger seulement quand
        // le state est stable (= player not mid-step), donc 0 effet visible
        // sur les steps normaux.
        if (gPlayerAvatar.runningState === 0  // NOT_MOVING
            && gPlayerAvatar.stepFramesLeft === 0
            && !pendingConn) {
          const c = GetCameraTopLeftCoords();
          if (c.x !== gSaveBlock1Ptr.pos.x || c.y !== gSaveBlock1Ptr.pos.y) {
            console.warn(`[ow-sync] divergence cam=(${c.x},${c.y}) vs player=(${gSaveBlock1Ptr.pos.x},${gSaveBlock1Ptr.pos.y}) → re-sync + redraw`);
            SetCameraTopLeftCoords(gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y);
            clearOverworldTilemaps();
            DrawWholeMapView();
            flushOverworldTilemaps(self.rt);
          }
        }
        // H2 — 1:1 strict script_movement.c task tick : tick chaque NPC actif
        // dans le ScriptMovement task, advance le script ptr via ObjectEventSet
        // HeldMovement(actionId) + check heldMovementFinished. Doit être appelé
        // AVANT TickObjectEventMovements pour que le held movement set ici soit
        // exécuté par _execHeldMovementAction dans le même tick.
        ScriptMovement_MoveObjects();
        // H3.2 — 1:1 strict ApplyLevitateMovement task tick : sprite.y2 oscille
        // ±1 every 4 frames, toggle direction every 16 frames. Used par NPCs en
        // LEVITATE state (Mt. Pyre Castform, etc.).
        ApplyLevitateMovement_TickAll(rt);
        // Phase 4.4.c : tick NPC movement state machine (LOOK_AROUND / WANDER).
        // NB : tickMovementQueues a déjà run avant CameraUpdate. Pour les NPCs
        // en script-driven movement, leur walkFramesLeft non-zéro empêche le
        // wander state machine de tick (= cf. tickWanderAround case 6 ne fait
        // rien si walkFramesLeft est déjà géré par movement-system).
        TickObjectEventMovements(rt);
        // 1:1 décomp `CreateReflectionEffectSprites` affine-anims : tick les 2 matrices OAM
        // 0/1 de distorsion (= petites vagues des reflets eau). Doit tourner avant le rendu
        // pour que les reflets affine (affineParamIndex 0/1) lisent les matrices à jour.
        UpdateReflectionDistortionMatrices(rt);
        // Phase 4.4.a : update sprite positions des NPCs selon camera scroll.
        UpdateObjectEvents(rt);
        // Phase 4.10 : sync child OAMs des NPCs subsprite-driven (= truck 48×48)
        // sur la position du sprite parent. 1:1 décomp BuildOamBuffer subsprite path.
        // À call APRÈS UpdateObjectEvents qui set sprite.x/y des parents.
        syncSubspriteOam();
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
        HideShowWarpArrow(rt, gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y, GetPlayerFacingDirection());
        UpdateWarpArrowSprite(rt);
        // 1:1 décomp tall grass field effect (= field_effect_helpers.c
        // UpdateTallGrassFieldEffect) : tick anim + position tracking + auto
        // destroy après cycle.
        UpdateTallGrassEffects(rt);
        // 1:1 décomp FLDEFF_BERRY_TREE_GROWTH_SPARKLE : tick anim étoile + tracking +
        // despawn (= WaitFieldEffectSpriteAnim) pour les berry trees qui poussent.
        UpdateSparkleEffects(rt);
        // 1:1 décomp `UpdateSparkleFieldEffect` (FLDEFF_SPARKLE générique, item/script).
        UpdateSparkleGenericEffects(rt);
        UpdateJumpDustEffects(rt);
        // 1:1 décomp `WaitFieldEffectSpriteAnim` : ondulations d'eau (FLDEFF_RIPPLE) —
        // migré (game/field_effect_helpers.ts), tické par le callback global.
        // 1:1 décomp `UpdateLongGrassFieldEffect` : overlay herbe haute (Route 119/120) —
        // anim + tracking owner + despawn. Hors démo, mais câblé via le spine.
        UpdateLongGrassEffects(rt);
        // 1:1 décomp `UpdateShortGrassFieldEffect` (game/field_effect_helpers.ts) :
        // migré, tické par le callback global.
        // 1:1 décomp `UpdateJumpImpactEffect` (game/field_effect_helpers.ts) : jump tall/long
        // grass + jump small/big splash — migrés, tickés par le callback global.
        // 1:1 décomp `UpdateSplashFieldEffect` + `UpdateFeetInFlowingWaterFieldEffect`
        // (game/field_effect_helpers.ts) : migrés, tickés par le callback global.
        // 1:1 décomp `UpdateFootprintsTireTracksFieldEffect` : empreintes sable/profond + traces
        // de vélo (déposées sur sable, fade après 40f). Hors démo, câblé via le spine (DoTracks).
        UpdateFootprintsEffects(rt);
        // 1:1 décomp `UpdateSandPileFieldEffect` (game/field_effect_helpers.ts) : désormais
        // tické par le callback global (sprite.callback) — plus d'appel manuel ici.
        // 1:1 décomp `UpdateHotSpringsWaterFieldEffect` (game/field_effect_helpers.ts) :
        // désormais tické par le callback global (sprite.callback) — plus d'appel manuel.
        // 1:1 décomp `UpdateBubblesFieldEffect` (game/field_effect_helpers.ts) : migré,
        // tické par le callback global (one-shot, GroundEffect_Seaweed → FLDEFF_BUBBLES).
        // 1:1 décomp `UpdateAshFieldEffect` : nuage de cendre + révèle la tuile ashgrass
        // (Route 113/Fallarbor). Trigger = field_tasks.c (StartAshFieldEffect), port séparé.
        UpdateAshEffects(rt);
        // 1:1 décomp `UpdateSurfBlobFieldEffect` (+ Synchronize/Bobbing) : monture de surf
        // qui suit le joueur + bobbing synchronisé. + SpriteCB_UnderwaterSurfBlob (Dive).
        UpdateSurfBlobEffects(rt);
        UpdateUnderwaterSurfBlobEffects(rt);
        // 1:1 décomp `UpdateDisguiseFieldEffect` : sprite arbre/rocher/sable recouvrant le
        // joueur déguisé (bases secrètes) + machine de révélation. Trigger = MovementActions.
        UpdateDisguiseEffects(rt);
        // 1:1 décomp `SpriteCB_TrainerIcons` (trainer_see.c:745-767) : tick
        // chaque emote sprite (! ? ♥) actif → bounce + position tracking +
        // auto-destroy après 60 frames.
        tickEmoteSprites(rt);
        // 1:1 décomp UpdateShadowFieldEffect : shadow copie player sprite x
        // mais reste à y baseline (= no jump arc) → ground-locked effet 3D.
        UpdateShadowSprite(rt, gPlayerAvatar.spriteId);
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
      // Expose pour le retour depuis option menu / sub-CB2 1:1 décomp :
      // CB2_ReturnToFieldLocal_Manual (option-menu-return.ts) doit pouvoir
      // restaurer ce closure quand le state machine décomp completes (= 1:1
      // `SetMainCallback2(CB2_Overworld)` après ReturnToFieldLocal returns TRUE).
      (globalThis as Record<string, unknown>)._overworldMainCB2 = MainCB2_Overworld;
      // Expose un helper de restauration utilisé par CB2_ReturnToFieldLocal_Manual
      // après option menu Sortir. 1:1 décomp `ReturnToFieldLocal` flow (=
      // ResetScreenForMapLoad → ResumeMap → InitObjectEventsReturnToField →
      // SetCameraToTrackPlayer → InitViewGraphics) compactés en une seule
      // opération qui re-init les BG configs + re-render le map + re-spawn
      // les NPCs. Async car loadAndInitMap fetch tilesets/palettes.
      (globalThis as Record<string, unknown>)._restoreOverworldFromMenu = async (): Promise<void> => {
        if (!gMapHeader) {
          console.warn('[restoreOverworldFromMenu] no gMapHeader, abort');
          return;
        }
        console.log(`[restoreOverworldFromMenu] mapId=${gMapHeader.id} pos=(${gSaveBlock1Ptr.pos.x},${gSaveBlock1Ptr.pos.y}) facing=${GetPlayerFacingDirection()}`);
        // 1:1 décomp `InitOverworldBgs` (overworld.c) : re-config BG0/1/2/3 via
        // `sOverworldBgTemplates`. CB2_InitOptionMenu state 1 fait
        // `InitBgsFromTemplates(0, sOptionMenuBgTemplates)` → BG0 charBase=1
        // mapBase=31 (= different from overworld charBase=2). Sans re-config
        // les BG slots, post-menu BG0 charBase reste à 1 → start menu/dialog
        // tiles rendered depuis mauvaise charBase area = garbage visuel.
        // Values 1:1 sOverworldBgTemplates (overworld.c:266-304).
        const bg0c = self.rt.gba.bg(0).config;
        bg0c.charBaseIndex = 2; bg0c.mapBaseIndex = 31; bg0c.screenSize = 0;
        bg0c.paletteMode = 0; bg0c.priority = 0; bg0c.visible = true;
        bg0c.hofs = 0; bg0c.vofs = 0;
        const bg1c = self.rt.gba.bg(1).config;
        bg1c.charBaseIndex = 0; bg1c.mapBaseIndex = 29; bg1c.screenSize = 0;
        bg1c.paletteMode = 0; bg1c.priority = 1; bg1c.visible = true;
        bg1c.hofs = 0; bg1c.vofs = 0;
        const bg2c = self.rt.gba.bg(2).config;
        bg2c.charBaseIndex = 0; bg2c.mapBaseIndex = 28; bg2c.screenSize = 0;
        bg2c.paletteMode = 0; bg2c.priority = 2; bg2c.visible = true;
        bg2c.hofs = 0; bg2c.vofs = 0;
        const bg3c = self.rt.gba.bg(3).config;
        bg3c.charBaseIndex = 0; bg3c.mapBaseIndex = 30; bg3c.screenSize = 0;
        bg3c.paletteMode = 0; bg3c.priority = 3; bg3c.visible = true;
        bg3c.hofs = 0; bg3c.vofs = 0;
        self.rt.SetGpuReg(REG_OFFSET_DISPCNT,
          DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP |
          DISPCNT_BG0_ON | DISPCNT_BG1_ON | DISPCNT_BG2_ON | DISPCNT_BG3_ON);
        // 1:1 décomp `ReturnToFieldLocal` (overworld.c:1961) state machine combiné :
        //   - state 0 : ResetScreenForMapLoad + ResumeMap + InitObjectEventsReturnToField
        //   - state 1 : InitViewGraphics (= setup BG regs + DrawWholeMapView)
        // Notre `loadAndInitMap` fait l'équivalent en 1 fonction async.
        // 1:1 décomp `CB2_ReturnToFieldContinueScript*` : ce restore est le
        // chemin "retour-au-field-CONTINUE" (post-combat / post-menu). Or
        // loadAndInitMap fait `ScriptContext_Init()` (reset total) — correct
        // pour boot/warp mais ça WIPE le ScriptContext suspendu qui pilote
        // le tuto Birch (`special ChooseStarter` → native flow). Bug : après
        // combat WIN, overworld restauré MAIS script Birch détruit → ne
        // reprend jamais à `applymovement BIRCH` = HANG rapporté. Fix 1:1 :
        // snapshot AVANT, restore APRÈS = le script suspendu survit au
        // re-init field et reprend exactement où il était. No-op si aucun
        // script en vol (option menu/sac : status SHUTDOWN).
        const _scriptSnap = ScriptContext_Snapshot();
        // 1:1 STRICT décomp `ReturnToFieldLocal` (overworld.c:1961) — utilise
        // SpawnObjectEventsOnReturnToField au lieu de TrySpawnObjectEvents.
        // returnToField=true preserve gObjectEvents (= currentCoords post-
        // script comme MOM-à-chair après PetalburgGymReport).
        await self.loadAndInitMap(gMapHeader.id, gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y, GetPlayerFacingDirection(), false, true);
        ScriptContext_Restore(_scriptSnap);
        // Clear BG0 tilemap (= mapBase 31, 2KB) après loadAndInitMap : option menu
        // CB2_InitOptionMenu state 8 fait `PutWindowTilemap(WIN_OPTIONS)` qui écrit
        // dans BG0 mapBase 31 (= bg=0, baseBlock=0x36, 26×14 tiles). Au close,
        // `FreeAllWindowBuffers` free les structs windows mais PAS le VRAM tilemap
        // qui contient encore les entries WIN_OPTIONS pointing aux option menu
        // tile IDs. Sans ce clear, post-menu BG0 affiche du garbled (= "STYLE
        // COMBAT" / "CHOIX" / "SON" etc visible en arrière-plan via mapBase entries).
        // Sur ROM ce résidu n'est pas observé probablement à cause du timing
        // VBlank / fade-in qui masque, mais pour notre engine on doit explicitly
        // wipe pour garantir clean rendering.
        const bg0Cfg = self.rt.gba.bg(0).config;
        const bg0MapStart = bg0Cfg.mapBaseIndex * 2048;
        const vram = self.rt.gba.vram;
        for (let i = 0; i < 2048; i++) vram[bg0MapStart + i] = 0;
        // Re-set VBlankCallback (= option menu CB2_InitOptionMenu set NULL).
        // 1:1 décomp `SetFieldVBlankCallback` appelé par `CB2_ReturnToFieldLocal`
        // après que ReturnToFieldLocal returns TRUE.
        const _VBlankCB_Overworld_Restored: () => void = () => { /* marker */ };
        self.rt.SetVBlankCallback(_VBlankCB_Overworld_Restored);
        // 1:1 décomp `CB2_ReturnToField` finit par `SetMainCallback2(CB2_Overworld)` :
        // rendre la main à la boucle OW. SANS ça, callback2 reste = le savedCallback
        // one-shot du retour combat (ReturnFromBattleToOverworld) → l'OW est rendu UNE
        // fois mais FIGÉ (PlayerStep + CameraUpdate sont pilotés par callback2, cf.
        // update() l.728). = le maillon manquant du retour combat voie L (la voie
        // option-menu le fait déjà via _overworldMainCB2). La caméra se recentre alors
        // sur le joueur (le « 2 cases en haut » = caméra figée non recentrée).
        self.rt.gMain.callback2 = MainCB2_Overworld;
        // 1:1 décomp `GroundEffect_SpawnOnTallGrass` : si le joueur revient au field
        // (sortie combat/menu) sur une tuile d'herbe haute, ré-affiche l'overlay
        // statique (sinon « dessus » l'herbe sans overlay jusqu'à bouger).
        TrySpawnTallGrassOnReturnToField(self.rt, gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y);
        console.log('[restoreOverworldFromMenu] done');
      };

      this.statusText?.setText(`Bourg-en-Vol ${header.mapLayout.width}x${header.mapLayout.height} (arrows = walk)`);
      this.booted = true;

      // Devtool : expose __devGotoMap pour `scope.gotoMap(mapId, x, y)` (dev-scope.ts:959).
      // Trigger un step-warp explicit via le warp-system (= 1:1 effects map switch).
      // CRITIQUE : le MainCB2_Overworld consomme getPendingWarp() chaque frame
      // (ligne 450) → setPendingWarp() suffit pour démarrer le warp. Pas 1:1
      // décomp (= juste un devtool, le décomp n'a pas d'équivalent).
      (globalThis as Record<string, unknown>).__devGotoMap = (
        mapId: string, x: number, y: number,
      ): void => {
        setPendingWarp({ destMap: mapId, x, y, elevation: 0, warpId: -1 }, 'step');
        console.log(`[__devGotoMap] pending warp → ${mapId} (${x}, ${y})`);
      };

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
    initFromSavedGame = false,
    /** 1:1 STRICT décomp `ReturnToFieldLocal` (overworld.c:1961) vs
     *  `LoadMapInStepsLocal` (overworld.c) : ReturnToFieldLocal preserve
     *  gObjectEvents (= positions courantes des NPCs post-script) ; Load
     *  MapInStepsLocal reset + spawn from templates.
     *
     *  returnToField=true : utilise SpawnObjectEventsOnReturnToField (= 1:1
     *  décomp event_object_movement.c:1715) qui itère gObjectEvents[i].active
     *  et re-crée les sprites OAM à currentCoords (= preserve positions post-
     *  script comme applymovement MomReturnToSeat). Utilisé au bag/menu/options
     *  close (= same map refresh).
     *
     *  returnToField=false : flow LoadMapInStepsLocal = destroy + reset + spawn
     *  from templates. Utilisé au warp inter-map (= 1:1 décomp). */
    returnToField = false,
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
    // Étape 5 SAVE-SYSTEM-1TO1 : au RESUME d'une save (boot.mode === 'resume'),
    // le décomp appelle `InitMapFromSavedGame` (= InitMap + LoadSavedMapView,
    // fieldmap.c:78-86) à la place d'`InitMap`, pour ré-injecter les tiles
    // sauvegardés autour du player (« reprendre dans le même état »). Sur un
    // warp normal → InitMap seul (= 1:1, jamais de mapView stale ré-appliquée).
    if (initFromSavedGame) InitMapFromSavedGame();
    else InitMap();

    // 1:1 décomp `CopyMapTilesetsToVram` + `LoadMapTilesetPalettes` (fieldmap.c).
    CopyMapTilesetsToVram(header.mapLayout);
    LoadMapTilesetPalettes(header.mapLayout);
    // 1:1 décomp `InitTilesetAnimations` (tileset_anims.c:574-579).
    // Doit être appelé APRÈS CopyMapTilesetsToVram (= callbacks setté par CopyMapTilesetsToVram).
    InitTilesetAnimations();
    // 1:1 décomp `CreateReflectionEffectSprites` (event_object_movement.c:1207, appelé par
    // ResetObjectEvents) : démarre les 2 affine-anims pilotant les matrices OAM 0/1 (vagues reflets).
    InitReflectionDistortion(this.rt);

    // 1:1 décomp `ResumeMap` (overworld.c:2138) : `ResetCameraUpdateInfo` SEUL
    // avant `InitObjectEvents` (= InitPlayerAvatar). `ResetFieldCamera` est
    // appelé APRÈS dans la séquence (= case 5 vs case 3 du LoadMapInStepsLocal).
    // L'ordre TS antérieur (= ResetFieldCamera AVANT InitPlayerAvatar) divergeait
    // du décomp et créait un état où `sFieldCameraOffset` était reset à 0 avant
    // que `pos` soit setté → BG drawn avec offset stale (= bug user "1 case off
    // post-warp" flag 2026-05-22). Fix audit chantier OW.
    ResetCameraUpdateInfo();

    // Determine spawn coords (= -1 fallback to map center for boot testing).
    const sx = spawnX >= 0 ? spawnX : Math.floor(header.mapLayout.width / 2);
    const sy = spawnY >= 0 ? spawnY : Math.floor(header.mapLayout.height / 2);
    // Phase 4.6 : destroy player sprite avant re-init pour éviter leak OAM.
    DestroyPlayerAvatar(this.rt);
    // Bug fix session 122 : 'MALE' était hardcodé → joueur toujours Brendan
    // même si user avait choisi May/Female dans Birch speech. Lit gameState.gender
    // (= source unique : sync depuis gSaveBlock2Ptr.playerGender via Birch flow
    // OR depuis save reload). 1:1 décomp field_player_avatar.c qui lit
    // `gSaveBlock2Ptr->playerGender` pour piquer le sprite asset (= Brendan ou May).
    // 1:1 décomp field_player_avatar.c : lit `gSaveBlock2Ptr->playerGender`.
    const playerGender: 'MALE' | 'FEMALE' = gSaveBlock2Ptr.playerGender === 1 ? 'FEMALE' : 'MALE';
    await InitPlayerAvatar(sx, sy, spawnDir, playerGender, this.rt);

    // 1:1 décomp `ResetFieldCamera()` (field_camera.c:69-72) — case 5 du
    // LoadMapInStepsLocal (overworld.c:1893+) — APRÈS InitObjectEventsLocal +
    // InitPlayerAvatar (= case 3 + 4). Reset `sFieldCameraOffset` à 0 quand
    // `pos` est déjà setté → la séquence DrawWholeMapView qui suit voit un
    // sFieldCameraOffset cohérent (= 0 tile/pixel offset) avec pos = new.
    ResetFieldCamera();
    // 1:1 décomp `InstallCameraPanAheadCallback()` (field_camera.c:448-454) —
    // appelé par ResumeMap (overworld.c:2139). Reset sVerticalCameraPan = 32 +
    // sHorizontalCameraPan = 0 (= default). Sans ça, valeurs stale d'une
    // session précédente persistent → BG_VOFS mal aligné post-warp.
    InstallCameraPanAheadCallback();

    // 1:1 décomp `DrawWholeMapView` (field_camera.c:94-98) — no args,
    // lit `gSaveBlock1Ptr->pos.x/y` (= `_camPos` côté TS) + gMapHeader.mapLayout
    // internally. À ce point, _camPos a été setté par SetCameraTopLeftCoords()
    // depuis InitPlayerAvatar → cohérent avec gPlayerAvatar.
    clearOverworldTilemaps();
    DrawWholeMapView();
    flushOverworldTilemaps(this.rt);
    FieldUpdateBgTilemapScroll(this.rt);
    // ⚠️ NE PAS faire `gPlttBufferFaded.flushTo()` ici (= ancien code).
    // LoadMapTilesetPalettes a écrit les NEW colors dans gPlttBufferFaded ; un
    // flushTo ici les pousse à PaletteBanks → screen flash visible AVANT le
    // FillPalBufferBlack de Phase 4. 1:1 décomp = palette transfer gated par
    // gPaletteFade.bufferTransferDisabled (= set TRUE par executeWarp Phase 3
    // start, FALSE après FillPalBufferBlack en Phase 4).

    // 1:1 STRICT décomp branch : LoadMapInStepsLocal (= warp inter-map, reset
    // tout) vs ReturnToFieldLocal (= bag/menu close, preserve gObjectEvents).
    if (!returnToField) {
      // Phase 4.4.a : destroy old NPC sprites first (= 1:1 décomp ResetObjectEvents).
      destroyAllNpcSprites(this.rt);
      resetObjectEventAllocations();
      // Phase 4.10 : reset movement queues au map switch (= old map's queues
      // pourraient référencer des NPCs de l'ancienne map).
      resetMovementQueues();
      // H2 : reset ScriptMovement task data (= 1:1 décomp Script_ResetTask au
      // map switch, sinon objEventIds stale référencent ancienne map NPCs).
      ScriptMovement_Reset();
      // H3.2 : reset LevitateMovementTask registry.
      ResetLevitateMovementTasks();
    }
    // returnToField=true : on ne touche PAS gObjectEvents. Au cycle bag close,
    // gObjectEvents.currentCoords est préservé (= MOM reste à sa position post-
    // applymovement chair, plutôt qu'au template.x/y = 4,5 devant TV).
    // 1:1 décomp `RotatingGate_InitPuzzle` (rotating_gate.c:933-940) call par
    // `RotatingGate_InitPuzzleAndGraphics` (= overworld.c LoadMap step). Init
    // puzzle config + reset gate orientations à VAR_TEMP_0. No-op si current
    // map n'a pas de rotating gate puzzle (= démo maps).
    void import('../engine/field/rotating-gate').then(m => m.RotatingGate_InitPuzzle());

    // Phase 4.5 : preload font + scripts (fonts cached, scripts re-fetched).
    // Le scriptsBaseName est dérivé de header.mapScripts (= e.g.
    // 'LittlerootTown_BrendansHouse_1F_MapScripts' → strip `_MapScripts`).
    // CRITICAL : doit run AVANT spawn NPCs car OnTransition update VAR_OBJ_GFX_ID_*
    // qui sont read par spawn pour résoudre OBJ_EVENT_GFX_VAR_N (= rival NPC
    // sprite genre opposé).
    const scriptsBaseName = header.mapScripts.replace(/_MapScripts$/, '');
    await Promise.all([
      preloadFontData(),
      preloadTextWindowFrames(),
      preloadStandardMenuPalette(),
      loadMapScripts(scriptsBaseName),
      preloadDoorTiles(),  // Phase 4.7 : door anims rendering
      preloadMapNames(),   // Phase 4.9 : map-names-fr.json pour ShowMapNamePopup
      loadGameData(),      // Phase 4.10 : 21 tables Pokémon (= base Pokédex / battles)
    ]);
    installDexDevtools();  // dev.dex.* accessible en console

    // 1:1 STRICT décomp `LoadObjEventTemplatesFromHeader` (overworld.c:469-478)
    // appelé par LoadMapFromWarp:840 AVANT RunOnTransitionMapScript. Clear le
    // saveblock objectEventTemplates pour cette map + copy depuis mapHeader
    // (= reset les setobjectxyperm de la map précédente). OnTransition fire
    // ensuite et re-applique setobjectxyperm selon état courant des vars.
    //
    // Si returnToField=true (= bag/menu close, same map), on SKIP ce reset
    // pour preserve gObjectEvents memory (= déjà fait par A3 ReturnToFieldLocal).
    if (!returnToField) {
      const headerTemplates = (header.events?.objectEvents ?? []).map(t => ({
        localId: t.localId,
        localIdRaw: t.localIdRaw,
        graphicsId: t.graphicsId,
        graphicsIdRaw: (t as { graphicsIdRaw?: string }).graphicsIdRaw ?? '',
        kind: (t as { kind?: number }).kind ?? 0,
        x: t.x,
        y: t.y,
        elevation: (t as { elevation?: number }).elevation ?? 0,
        movementType: (t as { movementType?: number | string }).movementType ?? 0,
        movementTypeRaw: (t as { movementTypeRaw?: string }).movementTypeRaw ?? '',
        movementRangeX: (t as { movementRangeX?: number }).movementRangeX ?? 0,
        movementRangeY: (t as { movementRangeY?: number }).movementRangeY ?? 0,
        trainerType: (t as { trainerType?: number }).trainerType ?? 0,
        trainerRange_berryTreeId: (t as { trainerRange_berryTreeId?: number }).trainerRange_berryTreeId ?? 0,
        script: (t as { script?: string }).script ?? '',
        flagId: (t as { flagId?: number | string }).flagId ?? 0,
      }));
      LoadObjEventTemplatesFromHeader(header.id, headerTemplates);

      // 1:1 STRICT décomp `DoTimeBasedEvents()` (clock.c:26, déclaré clock.h).
      // Appelé dans le flow de chargement de map AVANT le spawn des object events :
      //   - `LoadMapFromWarp` (overworld.c:853, `if (a1 != TRUE)`) : le warp local
      //     standard passe par CB2_LoadMap → CB2_LoadMap2 → DoMapLoadLoop →
      //     `LoadMapInStepsLocal(state, FALSE)` → `LoadMapFromWarp(FALSE)` → RUNS.
      //     (Le seul site `a1=TRUE` = CB2_ReturnToFieldContestHall:1599, hors démo ;
      //      le link multiplayer LoadMapInStepsLink:1823 passe TRUE = skip.)
      //   - `CB2_ContinueSavedGame` (overworld.c:1726, resume) : RUNS aussi, après
      //     LoadSaveblockObjEventScripts, avant InitMapFromSavedGame.
      // Position 1:1 : APRÈS LoadObjEventTemplatesFromHeader (overworld.c:840),
      // AVANT RunOnTransitionMapScript (:860) + le spawn (TrySpawnObjectEvents). Calc
      // le delta minutes RTC depuis gSaveBlock1Ptr.lastBerryTreeUpdateMin + advance
      // les berry trees (BerryTreeTimeUpdate) → les arbres SpawnObjectEventsOnMap
      // plus bas spawnent au stade À JOUR (= croissance par le temps, pas que manuel).
      // Gate !returnToField : le retour bag/menu/options (ReturnToFieldLocal) ne
      // recharge PAS la map et n'appelle PAS DoTimeBasedEvents (1:1 ; la croissance
      // continue sinon via le per-step task RunTimeBasedEvents = field_tasks.c:157,
      // dette per-step callbacks non encore portée).
      DoTimeBasedEvents();
    }

    // 1:1 décomp `RunOnTransitionMapScript` (overworld.c:807,860). Appelé
    // dans LoadMapFromWarp AVANT InitMap → AVANT TrySpawnObjectEvents. Set
    // les vars (= VAR_OBJ_GFX_ID_*, FLAG_VISITED_*, VAR_LITTLEROOT_TOWN_STATE)
    // qui sont READ par les spawn templates (= OBJ_EVENT_GFX_VAR_0 résout
    // via VAR_OBJ_GFX_ID_0). REORDER session 123 : avant on faisait spawn
    // PUIS OnTransition → rival NPC spawnait avec gfxId=0 (= invalid) →
    // skipped silencieusement → rival jamais visible.
    RunOnTransitionMapScript();

    // 1:1 décomp `LoadMapHeaderInternal` (overworld.c:870-874) — après
    // `RunOnTransitionMapScript` + `InitMap`, si on est INDOOR :
    //     UpdateTVScreensOnMap(gBackupMapLayout.width, gBackupMapLayout.height);
    // Set tous les MB_TELEVISION metatiles à TV_On/Off selon
    // CheckForPlayersHouseNews (= 1:1 tv.c:3359). En early-game maison du
    // joueur (FLAG_SYS_TV_HOME pas set) → TV_LATI default → TV_On → cycling
    // actif via TilesetAnim_Building (= TV cycle pour event PetalburgGymReport).
    // Sur maps non-indoor : early return NONE dans CheckForPlayersHouseNews,
    // boucle sur metatiles trouvent rien, no-op. Safe à call inconditionnel.
    // Re-DrawWholeMapView après (= 1:1 décomp DrawWholeMapView call dans flow)
    // pour rendre les changes BG tilemap visuels immédiatement.
    UpdateTVScreensOnMap(header.mapLayout.width, header.mapLayout.height);
    DrawWholeMapView();
    flushOverworldTilemaps(this.rt);

    // 1:1 STRICT décomp branch : LoadMapInStepsLocal (= warp) appelle
    // TrySpawnObjectEvents (= spawn from templates), ReturnToFieldLocal (= bag
    // close) appelle SpawnObjectEventsOnReturnToField (= preserve gObjectEvents).
    if (!returnToField) {
      // Phase 4.4.a : spawn NPCs après que vars soient set par OnTransition.
      await SpawnObjectEventsOnMap(this.rt);

      // 1:1 STRICT décomp : `CopyPartyAndObjectsFromSave` (= LoadObjectEvents)
      // est appelé UNIQUEMENT au RESUME d'une save (= CB2_ContinueSavedGame
      // → load_save.c:LoadGameSave → CopyPartyAndObjectsFromSave). Pas à chaque
      // warp. Si on l'applique à chaque warp, le snap player slot0 (= persisté
      // avec mapId vide ou stale) ÉCRASE le slot0 fraîchement init par
      // InitPlayerAvatar(destX, destY), gardant le player au position du DERNIER
      // save (= TRUCK initial pour new game). Symptôme : slot0.initialCoords =
      // (9, 9) INTERNAL = (2, 2) LOGICAL = position truck spawn, alors que
      // sb1.pos = (8, 7) = position warp dest → PlayerStep voit collision (=
      // mur autour de (2, 1)) → bloqué. Fix : gate par `initFromSavedGame` qui
      // est true uniquement au resume.
      if (initFromSavedGame) {
        CopyPartyAndObjectsFromSave();
      }
    } else {
      // 1:1 STRICT décomp event_object_movement.c:1715-1726
      // `SpawnObjectEventsOnReturnToField` : itère gObjectEvents[i].active et
      // re-crée juste les sprites OAM (= ResetSpriteData a clear gSprites +
      // OAMs). gObjectEvents memory (currentCoords/facing/etc.) preservés
      // depuis avant le bag open → MOM reste à sa position post-script.
      //
      // CRITIQUE : SpawnObjectEventsOnReturnToField CRÉE de nouveaux sprites OAM
      // (CreateSprite + reassign npc.spriteId) en SUPPOSANT que les anciens ont
      // été clearés (= ResetSpriteData dans le décomp). Notre port skippait ce
      // clear pour returnToField → les ANCIENS sprites NPC (ré-affichés par le
      // stash restore post-combat) restaient inUse → DOUBLONS qui s'accumulent à
      // chaque combat (user-flag 2026-05-29 "duplication des PNJ à chaque combat").
      // Fix 1:1 : destroyAllNpcSprites détruit les sprites + libère les tiles +
      // reset npc.spriteId=-1, MAIS préserve gObjectEvents data (npc.active/
      // currentCoords). Équivalent du ResetSpriteData décomp, scoped aux NPCs
      // (player géré par DestroyPlayerAvatar, sprites combat par battle cleanup).
      destroyAllNpcSprites(this.rt);
      await SpawnObjectEventsOnReturnToField(this.rt);
    }

    // Sync NPC sprite OAM positions IMMÉDIATEMENT après spawn. Sans ça, les
    // NPCs créés via CreateSpriteAtOam(x:0, y:0) restent en (0, 0) à l'écran
    // jusqu'à ce que MainCB2_Overworld tick UpdateObjectEvents (= warpInProgress
    // false en Phase 5). Le user voit donc tous les NPCs flash en haut-gauche
    // pendant 1-2 frames avant fade in. Sync explicite ici fixe le flash.
    UpdateObjectEvents(this.rt);
    // Phase 4.10 : sync child OAMs des NPCs subsprite-driven (= truck 48×48)
    // IMMÉDIATEMENT après UpdateObjectEvents. Sans ça : SetSubspriteTables au
    // spawn écrit OAM coords = (sprite.x=0 + sub.x) = (-24..8, -24..16),
    // UpdateObjectEvents update sprite.x au bon endroit (= 104 pour le truck
    // FEMALE 11,10), mais syncSubspriteOam ne tick qu'à la frame SUIVANTE dans
    // MainCB2_Overworld → 1-2 frames de fade-in où les subsprites truck restent
    // affichés en haut-gauche de l'écran (= user-flag : "camion en haut à gauche
    // devrait être où je suis, c'est pile au fade après être sorti").
    syncSubspriteOam();

    // 1:1 décomp `TryRunOnWarpIntoMapScript()` (= overworld.c:2160 dans
    // `InitObjectEventsLocal` → APRÈS TrySpawnObjectEvents). Run le table
    // `MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE` qui contient des entries `map_script_2
    // VAR, value, scriptLabel`. Used par e.g. LittlerootTown_OnWarp pour
    // positionner Rival/Birch lors du DexUpgrade event, ou
    // BrendansHouse_2F_OnWarp pour décorations chambre 2F (audit Littleroot A2).
    TryRunOnWarpIntoMapScript();

    // Phase 4.7 : warp arrow sprite (= 1:1 décomp `CreateWarpArrowSprite`).
    // Re-create at each map load (= ancien sprite cleanup automatique en interne).
    DestroyWarpArrowSprite(this.rt);
    await CreateWarpArrowSprite(this.rt);
    // 1:1 décomp `LoadFieldEffectGraphics` (field_effect.c) : preload tile +
    // palette des emote sprites (!?♥) utilisés par les movement actions
    // `emote_exclamation_mark` / `emote_question_mark` / `emote_heart`.
    // Cleanup actifs au map switch puis re-load idempotent.
    DestroyAllEmoteSprites(this.rt);
    await LoadEmoteAssets(this.rt);
    // Phase 4.10 : preload tall grass effect assets + cleanup pool.
    DestroyAllTallGrassEffects(this.rt);
    await preloadTallGrassEffect(this.rt);
    // Berry tree growth sparkle (FLDEFF_BERRY_TREE_GROWTH_SPARKLE) assets + pool.
    DestroyAllSparkleEffects(this.rt);
    await preloadSparkleEffect();
    DestroyAllJumpDustEffects(this.rt);
    await preloadJumpDustEffect(this.rt);
    // Ondulations d'eau (FLDEFF_RIPPLE) : assets seulement (one-shot auto-despawn).
    await preloadRippleEffect(this.rt);
    // Herbe haute (FLDEFF_LONG_GRASS) assets + pool.
    DestroyAllLongGrassEffects(this.rt);
    await preloadLongGrassEffect(this.rt);
    // Herbe basse (FLDEFF_SHORT_GRASS) assets + pool.
    await preloadShortGrassEffect(this.rt);
    // Effets d'impact de saut (jump tall/long grass + jump small/big splash) assets + pool.
    await preloadJumpImpactEffects(this.rt);
    // Splash + feet-in-flowing-water (FLDEFF_SPLASH/FEET) : assets seulement (sprite.callback).
    await preloadSplashEffect(this.rt);
    // Empreintes/traces (sand/deep footprints + bike tire tracks) assets + pool.
    DestroyAllFootprintsEffects(this.rt);
    await preloadFootprintsEffects(this.rt);
    // Sand pile : assets seulement (le sprite.callback s'auto-détruit, pas de pool à reset).
    await preloadSandPileEffect(this.rt);
    // Hot springs water (Lavaridge) : assets seulement (le sprite.callback s'auto-détruit).
    await preloadHotSpringsEffect(this.rt);
    // Bubbles (colonne de bulles sur algues en plongée) : assets seulement (one-shot auto-despawn).
    await preloadBubblesEffect(this.rt);
    // Ash (nuage de cendre + révèle la tuile ashgrass, Route 113) assets + pool.
    DestroyAllAshEffects(this.rt);
    await preloadAshEffect(this.rt);
    // Surf blob (monture de surf qui suit le joueur + bobbing) assets + pool.
    DestroyAllSurfBlobEffects(this.rt);
    await preloadSurfBlobEffect(this.rt);
    // Disguises (tree/mountain/sand recouvrant le joueur déguisé) assets + pool.
    DestroyAllDisguiseEffects(this.rt);
    await preloadDisguiseEffects(this.rt);
    // 1:1 décomp `FldEff_Shadow` : shadow spawn DYNAMIQUEMENT pendant ledge
    // jump (= InitJumpRegular → DoShadowFieldEffect, destroyed au jump end via
    // hasShadow=FALSE). Pas de spawn permanent au boot — preload assets only.
    DestroyShadowSprite(this.rt);
    await preloadShadowEffect(this.rt);
    InitFieldMessageBox();
    ScriptContext_Init();

    // 1:1 décomp `Overworld_PlaySpecialMapMusic` (overworld.c) :
    // si la new map music ID == currently playing → do nothing (= keep playing
    // sans restart). Sinon → PlayBGM(newId) (= fade out + play new).
    // Sans ce check : warp Bourg-en-Vol → Mays House (= les 2 ont MUS_LITTLEROOT)
    // restart le BGM à chaque transition = audio glitch.
    const songId = (Songs as unknown as Record<string, number>)[header.music] ?? 0;
    // MUS_NONE = 0xFFFF (= map sans music, e.g. MAP_INSIDE_OF_TRUCK). Skip pour
    // éviter spam warnings. 0 = invalid lookup, skip aussi.
    const isValidSong = songId !== 0 && songId !== 0xFFFF;
    if (isValidSong && songId !== _currentMapBgmId) {
      console.log(`[TestOverworld] PlayBGM(${header.music} = ${songId})`);
      PlayBGM(songId);
      _currentMapBgmId = songId;
    } else if (isValidSong) {
      console.log(`[TestOverworld] BGM ${header.music} déjà playing, skip restart`);
    }

    // Restore DISPCNT (= re-enable BG/OBJ layers) maintenant que le BG buffer
    // est ré-écrit (= DrawWholeMapView), les NPCs sont spawnés + sync (=
    // UpdateObjectEvents au-dessus), et la palette est prête (= LoadMapTileset
    // Palettes a écrit les NEW colors, color[0] = black via LoadTilesetPalette
    // black-fill). 1:1 décomp `InitOverworldGraphicsRegisters` (overworld.c:2096).
    this.rt.SetGpuReg(REG_OFFSET_DISPCNT, dispcntSaved);

    // 1:1 décomp `ShowMapNamePopup()` (overworld.c:1947 LoadMapInStepsLocal case 11).
    // Boot + warp : afficher le nom de la map.
    if (header.showMapName) {
      ShowMapNamePopup();
    }

    // Phase 4.10 : update gameState.map IN-MEMORY (pas de save auto). Le user
    // doit explicitement save via le Start Menu → SAUVEG. (= 1:1 décomp où
    // l'overworld n'auto-save pas, c'est le menu Save qui appelle TrySavingData).
    SetCurrentMap({ name: mapId, x: sx, y: sy, facing: spawnDir });

    // J — 1:1 STRICT cross-border : précharger les PNGs des NPCs des maps
    // CONNECTÉES en background. Équivalent ROM toujours disponible :
    //   - Décomp : graphics sprites en ROM (= sync access toujours)
    //   - Notre TS : PNGs via fetch (= async)
    //   - Solution : pre-cache les maps voisines pendant que la map courante
    //     joue ; quand player cross-border, preloadNpcGraphicsForMap est instant
    //     car _npcPngCache.has() = true pour tous les NPCs → spawn sync.
    // Fire-and-forget : on n'attend pas (= le rest du loadAndInitMap continue).
    this._preloadConnectedMapsNpcGraphicsBackground(header);

    return header;
  }

  /** 1:1 strict cross-border safety : pre-cache les PNGs des NPCs des maps
   *  connectées à `currentHeader`. Permet à `handleConnectionTransition` de
   *  spawn sync (= comme ROM décomp) sans attendre un fetch async.
   *
   *  Fire-and-forget. Failures sont logguées (= ne bloquent pas le scene). */
  private _preloadConnectedMapsNpcGraphicsBackground(currentHeader: MapHeader): void {
    const connections = currentHeader.connections ?? [];
    for (const conn of connections) {
      // Skip dive/emerge (= cross-dimension, séparé du cross-border standard).
      if ((conn.direction as unknown) === 'dive' || (conn.direction as unknown) === 'emerge') continue;
      const connMapId = (conn as { map?: string; mapId?: string }).map
                     ?? (conn as { mapId?: string }).mapId;
      if (!connMapId) continue;
      // Async fire-and-forget : load + preload, ne bloque pas.
      loadMapByName(connMapId)
        .then(connHeader => preloadNpcGraphicsForMap(connHeader))
        .catch(e => {
          console.warn(`[scene] background preload connected map ${connMapId} failed:`, e);
        });
    }
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
      // warpInProgress = false : tickMovementQueues run = applyMovement tick.
      if (kind === 'door') {
        // Door tile = position en face du player (= player.x, player.y - 1
        // car player face NORTH au moment du collision dispatch).
        const doorX = gSaveBlock1Ptr.pos.x;
        const doorY = gSaveBlock1Ptr.pos.y - 1;
        // case 0 : FreezeObjectEvents + PlayerGetDestCoords + PlaySE +
        // FieldAnimateDoorOpen. Le freeze gèle les NPCs (= skip player) pour
        // que la door anim + le walk up ne soient pas perturbés.
        FreezeObjectEvents();
        PlaySE(GetDoorSoundEffect(doorX, doorY));
        await FieldAnimateDoorOpen(doorX, doorY);
        // case 1 : ObjectEventSetHeldMovement(WALK_NORMAL_UP) — force walk player UP.
        // 1:1 décomp : queue WALK_NORMAL_UP sur le player ObjectEvent via le
        // movement queue system (= equiv MOVEMENT_ACTION_WALK_NORMAL_UP).
        applyMovement('LOCALID_PLAYER', ['walk_up']);
        await this.waitForPlayerMovementDone();
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
      // 1:1 décomp `DoWarp` (field_screen_effect.c:484) : PlaySE(SE_EXIT) pour
      // step warps. Pour 'door' : SE déjà joué dans Task_DoDoorWarp.
      // Pour 'aqua_teleport' / 'mossdeep_gym' : SE_WARP_IN (= 1:1 décomp
      // `DoTeleportTileWarp` line 554 + `DoMossdeepGymWarp` line 566).
      // Pour 'fall' : SE_FALL (= 1:1 décomp `DoFallWarp` chain → DoDiveWarp).
      // Pour 'lavaridge_*' / 'escalator_*' / 'mt_pyre_hole' / 'union_room' /
      // 'secret_base' : SE handled dans leur task spécifique (= TODO port).
      if (kind === 'step' || kind === 'arrow' || kind === 'ladder') {
        PlaySE(SE_EXIT);
      } else if (kind === 'aqua_teleport' || kind === 'mossdeep_gym') {
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
      // Notre version : preserve GetPlayerFacingDirection() courant (= depuis la
      // source map). Le walk-down auto override facing au step start. Pour les
      // warps non-door (= ladder/arrow/teleport), on preserve aussi.
      //
      // Phase 4.10 Chunk 1 : MAP_DYNAMIC + WARP_ID_DYNAMIC = destination
      // résolue via GetDynamicWarp() (= 1:1 décomp gSaveBlock1Ptr->dynamicWarp).
      // Set par `setdynamicwarp` opcode dans les scripts (e.g. truck →
      // setdynamicwarp MAP_LITTLEROOT_TOWN, 3, 10) ou directement par notre
      // boot init pour le démo.
      let destMapId = warp.destMap;
      let destX: number;
      let destY: number;
      let destDir: number;
      if (destMapId === 'MAP_DYNAMIC') {
        const dw = GetDynamicWarp();
        if (!dw) {
          console.error('[executeWarp] MAP_DYNAMIC sans dynamicWarp set, abort');
          this.warpInProgress = false;
          return;
        }
        destMapId = dw.mapId;
        destX = dw.x;
        destY = dw.y;
        destDir = GetPlayerFacingDirection();  // preserve facing
        console.log(`[executeWarp] MAP_DYNAMIC → ${destMapId} (${destX}, ${destY})`);
      } else {
        // 1:1 décomp `SetPlayerCoordsFromWarp` (overworld.c:603) :
        //   if (warpId >= 0 && warpId < destWarpCount) → use destWarps[warpId]
        //   else if (x >= 0 && y >= 0) → use those coords
        //   else → fallback (= map center / preserve facing)
        //
        // Bug fix 2026-05-09 : avant on checkait `warp.x >= 0` AVANT `warpId`.
        // Le warp.x/y est la position SOURCE (= où le tile warp existe sur la
        // current map) — pour le map.json warp_events, x/y est ~toujours >= 0.
        // → on prenait toujours warp.x/y comme dest coords → tous les warps de
        // Bourg-en-Vol arrivaient à la mauvaise position dans la dest map.
        // Reported by user "tous les warps de bourg n vol sont décalés".
        // Décomp check warpId FIRST. Notre WarpEvent.warpId vient de
        // map.json:dest_warp_id (= valid 0..destWarpCount-1 pour les warps
        // tile-driven). Pour `warpsilent MAP, NONE, X, Y` (= script explicit
        // coords), on set warpId = -1 ailleurs.
        const destPreheader = await loadMapByName(destMapId);
        if (warp.warpId >= 0 && warp.warpId < destPreheader.events.warps.length) {
          const coords = getPlayerCoordsFromWarp(destPreheader, warp.warpId);
          destX = coords.x;
          destY = coords.y;
          destDir = coords.facing;
          console.log(`[executeWarp] warpId-driven → ${destMapId}#${warp.warpId} = (${destX}, ${destY})`);
        } else if (warp.x >= 0 && warp.y >= 0) {
          // warpsilent script form `warpsilent MAP, NONE, X, Y` — uses explicit
          // dest coords, warpId is sentinel -1 / 0xFF.
          destX = warp.x;
          destY = warp.y;
          destDir = GetPlayerFacingDirection();
          console.log(`[executeWarp] explicit coords → ${destMapId} (${destX}, ${destY})`);
        } else {
          // Both invalid → fallback to map center (= 1:1 décomp behavior).
          destX = Math.floor(destPreheader.mapLayout.width / 2);
          destY = Math.floor(destPreheader.mapLayout.height / 2);
          destDir = GetPlayerFacingDirection();
          console.warn(`[executeWarp] no valid warpId or coords → map center (${destX}, ${destY})`);
        }
      }
      // ⚠️ 1:1 décomp gate : `gPaletteFade.bufferTransferDisabled = TRUE` pendant
      // le load. Sans ça, l'auto-flushTo VBlank pousse les NEW colors écrites par
      // LoadMapTilesetPalettes (dans gPlttBufferFaded) à PaletteBanks → screen
      // flash visible BEFORE FillPalBufferBlack (= 1 frame ancien BG / new BG
      // partial visible pendant warp truck → Littleroot, bug session 124).
      // 1:1 décomp pattern utilisé par battle_pyramid_bag, berry_crush, contest, etc.
      // pendant les loads où on veut prevent palette flash.
      this.rt.gPaletteFade.bufferTransferDisabled = true;
      const destHeader = await this.loadAndInitMap(destMapId, destX, destY, destDir);
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
      const postWarpBehavior = getMetatileBehaviorAtPlayerPos();
      const exitKind = getExitTaskKindFor(postWarpBehavior);
      console.log(`[executeWarp] exit task kind=${exitKind}`);
      // 1:1 décomp `Task_ExitDoor` case 0 / `Task_ExitNonAnimDoor` case 0 :
      //   SetPlayerVisibility(FALSE);
      //   FreezeObjectEvents();   ← geler tous les NPCs (skip player)
      //   PlayerGetDestCoords + FieldSetDoorOpened (door only)
      // Important : FreezeObjectEvents AVANT fade in pour que les NPCs ne
      // bougent pas pendant la transition.
      if (exitKind === 'door' || exitKind === 'non_anim') {
        SetPlayerVisibility(this.rt, false);
        FreezeObjectEvents();
      }
      if (exitKind === 'door') {
        // 1:1 case 0 : FieldSetDoorOpened (= instant draw open frame, no SE, no anim).
        // À call MAINTENANT avant fade in, pas en Phase 5.
        await FieldSetDoorOpened(gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y);
      }

      // 1:1 décomp `InitObjectEventsLocal` → `GetInitialPlayerAvatarState` →
      // `GetAdjustedInitialDirection` (overworld.c:929) : ajuste le facing du
      // player selon le metatile_behavior à la dest position. Pour les
      // MB_NON_ANIMATED_DOOR / MB_ANIMATED_DOOR → DIR_SOUTH, pour MB_DEEP_SOUTH_WARP
      // → DIR_NORTH, pour MB_*_ARROW_WARP → direction opposée à l'arrow, pour
      // MB_LADDER → preserve l'ancien facing. Appliqué avant Phase 5 pour que
      // le push 1 case se fasse dans la bonne direction.
      const previousFacing = GetPlayerFacingDirection();
      const adjustedDir = GetAdjustedInitialDirection(postWarpBehavior, previousFacing);
      // 1:1 décomp : pa.facing n'existe PAS — source unique slot.facingDirection
      // via SetObjectEventDirection (= maintient invariant previousMovementDirection).
      SetObjectEventDirection(gObjectEvents[gPlayerAvatar.objectEventId], adjustedDir);

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
      // 1:1 décomp gate release : maintenant que PaletteBanks contient BLACK
      // (= FillPalBufferBlack + flushTo), on rouvre l'auto-flushTo VBlank pour
      // que le fade-in tick (= UpdatePaletteFade) push les couleurs interpolées.
      this.rt.gPaletteFade.bufferTransferDisabled = false;
      this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
      await this.waitForFadeComplete();

      // ─── Phase 5 : SetUpWarpExitTask (kind-specific exit task) ──────────
      // warpInProgress = false : on laisse PlayerStep tick le walk-down auto.
      this.warpInProgress = false;

      // 1:1 STRICT décomp : NE PAS re-faire `clear+DrawWholeMapView+flush+
      // FieldUpdateBgTilemapScroll` ici. `loadAndInitMap` l'a DÉJÀ fait (= case
      // 9 du LoadMapInStepsLocal). Le double-call était un workaround défensif
      // (= "Defensive : force BG buffer redraw") qui MASQUAIT le vrai bug de
      // l'ordre `ResetFieldCamera` avant `InitPlayerAvatar` (= maintenant fixé).
      // Audit chantier OW : retiré pour 1:1 strict + ne plus masquer divergences.

      if (exitKind === 'door') {
        // 1:1 décomp `Task_ExitDoor` (field_screen_effect.c:317-363) :
        // case 1 : ObjectEventSetHeldMovement(WALK_NORMAL_DOWN). Doors always
        // exit DOWN (= player came IN from below, exits OUT toward south).
        // Note : FieldSetDoorOpened déjà appelé en Pre-Phase 4 (= 1:1 case 0).
        const doorX = gSaveBlock1Ptr.pos.x;
        const doorY = gSaveBlock1Ptr.pos.y;
        // 1:1 décomp `FieldCB_DefaultWarpExit` (field_screen_effect.c:278) :
        // `LockPlayerFieldControls()` tient le lock pendant toute la durée
        // du `Task_ExitDoor`. DoCB1_Overworld (overworld.c:1445) skip
        // PlayerStep si lock → pas d'input D-pad pendant l'auto-walk.
        LockPlayerFieldControls();
        // case 1 : SetPlayerVisibility(TRUE) + ObjectEventSetHeldMovement(WALK_NORMAL_DOWN).
        // 1:1 décomp : queue movement action via `applyMovement` (=
        // ObjectEventSetHeldMovement). Le `Task_ExitDoor` hardcode
        // WALK_NORMAL_DOWN (= door always south, behavior MB_ANIMATED_DOOR
        // retourne DIR_SOUTH via GetAdjustedInitialDirection).
        SetPlayerVisibility(this.rt, true);
        applyMovement('LOCALID_PLAYER', [_walkActionForDirection(adjustedDir)]);
        await this.waitForPlayerMovementDone();
        // case 2 : FieldAnimateDoorClose à la door position originale +
        // ObjectEventClearHeldMovementIfFinished (= la queue est déjà clear
        // par tickMovementQueues quand q.done est set à TRUE).
        await FieldAnimateDoorClose(doorX, doorY);
        // case 3 : UnfreezeObjectEvents (= reset frozen sur tous les NPCs).
        // case 4 : UnlockPlayerFieldControls + DestroyTask (= fait en finally).
        UnfreezeObjectEvents();
      } else if (exitKind === 'non_anim') {
        // 1:1 décomp `Task_ExitNonAnimDoor` (field_screen_effect.c:366-402)
        // pour MB_NON_ANIMATED_DOOR / MB_WATER_DOOR / MB_DEEP_SOUTH_WARP :
        // case 1 : ObjectEventSetHeldMovement(GetWalkNormalMovementAction(
        //          GetPlayerFacingDirection())).
        // Le facing a été ajusté par GetAdjustedInitialDirection avant
        // Phase 5 :
        //   - MB_NON_ANIMATED_DOOR / MB_WATER_DOOR → DIR_SOUTH (push down)
        //   - MB_DEEP_SOUTH_WARP                  → DIR_NORTH (push up)
        // Donc le walk action est dérivé du facing courant, 1:1 décomp.
        LockPlayerFieldControls();
        SetPlayerVisibility(this.rt, true);
        applyMovement('LOCALID_PLAYER', [_walkActionForDirection(adjustedDir)]);
        await this.waitForPlayerMovementDone();
        // case 2 : IsPlayerStandingStill → case 3 UnfreezeObjectEvents.
        UnfreezeObjectEvents();
      }
      // exitKind === 'none' (= MB_LADDER, MB_*_ARROW_WARP, etc.) :
      // 1:1 décomp `Task_ExitNonDoor` (field_screen_effect.c:404-421) :
      //   case 0 : FreezeObjectEvents + LockPlayerFieldControls
      //   case 1 : WaitForWeatherFadeIn → UnfreezeObjectEvents + UnlockPlayerFieldControls
      // PAS de push 1 case (= ladder / arrow ne pousse pas le player), mais
      // freeze/unfreeze NPCs quand-même + lock pendant la transition. Le fade
      // in s'est déjà fait, on freeze/unfreeze ici pour 1:1 strict.
      else if (exitKind === 'none') {
        LockPlayerFieldControls();
        FreezeObjectEvents();
        UnfreezeObjectEvents();
      }

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
      // Safety : si exception entre Phase 3 et Phase 4, bufferTransferDisabled
      // pourrait rester true → palette gel permanent. Reset systématique.
      this.rt.gPaletteFade.bufferTransferDisabled = false;
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
   *    4. Update gSaveBlock1Ptr.pos.x/y to new logical coords.
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
    // handleConnectionTransition fait :
    //   - Script loading + OnTransition (D1 fix audit DEMO-D, demo prio).
    //   - NPC orchestrator (= UpdateCoords + TrySpawn + RemoveOutsideView).
    //   - BGM transition.
    //   - Status text update.
    const newHeader = (globalThis as Record<string, unknown>).gMapHeader as MapHeader;
    if (!newHeader || newHeader.id === '') {
      console.warn('[connection] gMapHeader not swapped, abort');
      clearPendingConnection();
      return;
    }

    // D1 fix (DEMO-AUDIT-FINDINGS) : 1:1 décomp `LoadMapFromCameraTransition`
    // (overworld.c:807,860). Au cross-border, charger les scripts de la new
    // map + run RunOnTransitionMapScript. Sans ça :
    //   - _scriptsByLabel garde les scripts de l'ancienne map.
    //   - OnFrame poll silent no-op sur la new map.
    //   - VAR_ROUTE101_STATE reste à 0 → coord_event Birch (10,19)/(11,19)
    //     check STATE===1 false → Birch run script jamais fire (= bug user-flag).
    //
    // Symétrique avec afterMapLoad:679-698 mais sans TryRunOnWarpIntoMapScript
    // (= warps explicites only). Async fire-and-forget : OnFrame poll continue
    // chaque frame, donc dès que scripts loaded + OnTransition fire, le state
    // converge naturellement.
    //
    // NB sur OnLoad : TransitionToConnection.InitMap a déjà run _runOnLoadMapScriptHook
    // (= map-loader.ts:748). Si Route101 avait un OnLoad, il aurait silently
    // no-op'd faute de scripts chargés. Route101 n'a pas d'OnLoad (= cf.
    // data/maps/Route101/scripts.inc:1-4). Pour les maps WITH OnLoad qu'on
    // traverse via connection, on accepte qu'OnLoad ne s'exécute pas (= dette
    // documentée — la plupart des routes n'ont pas d'OnLoad critique).
    const newScriptsBaseName = newHeader.mapScripts.replace(/_MapScripts$/, '');
    void loadMapScripts(newScriptsBaseName).then(() => {
      // Re-check gMapHeader (= user n'a pas cross une autre border entretemps).
      const curHeader = (globalThis as Record<string, unknown>).gMapHeader as MapHeader;
      if (curHeader !== newHeader) {
        console.log(`[connection] scripts load done but map changed (${newHeader.id} → ${curHeader?.id}), skip OnTransition`);
        return;
      }
      console.log(`[connection] scripts loaded for ${newHeader.id}, run OnTransition`);
      RunOnTransitionMapScript();
    });

    // 1:1 STRICT décomp `LoadMapFromCameraTransition` (overworld.c:796) :
    //   LoadObjEventTemplatesFromHeader();
    // → charge les ObjectEventTemplates de la NEW map dans gSaveBlock1Ptr->
    //   objectEventTemplates. Sans ça, TrySpawnObjectEvents filter
    //   `t.mapId === currentMapId` retourne 0 templates → NPCs de la NEW map
    //   (= Birch, Zigzagoon, Bag, etc. sur Route101) ne sont JAMAIS spawned.
    //
    // BUG observé : cross-border LittlerootTown → Route101, l'OnFrame coord
    // event Birch run mais setobjectxy LOCALID_ROUTE101_BIRCH fail silently
    // car aucun NPC Route101 dans gObjectEvents (= jamais spawn from missing
    // templates). Fix : charger les templates AVANT UpdateObjectEvents.
    if (newHeader.events?.objectEvents) {
      const headerTemplates = newHeader.events.objectEvents.map(t => ({
        localId: (t as { localId?: number }).localId ?? 0,
        localIdRaw: (t as { localIdRaw?: string }).localIdRaw ?? '',
        graphicsId: (t as { graphicsId?: number | string }).graphicsId ?? 0,
        graphicsIdRaw: (t as { graphicsIdRaw?: string }).graphicsIdRaw ?? '',
        kind: (t as { kind?: number }).kind ?? 0,
        x: t.x,
        y: t.y,
        elevation: (t as { elevation?: number }).elevation ?? 0,
        movementType: (t as { movementType?: number | string }).movementType ?? 0,
        movementTypeRaw: (t as { movementTypeRaw?: string }).movementTypeRaw ?? '',
        movementRangeX: (t as { movementRangeX?: number }).movementRangeX ?? 0,
        movementRangeY: (t as { movementRangeY?: number }).movementRangeY ?? 0,
        trainerType: (t as { trainerType?: number }).trainerType ?? 0,
        trainerRange_berryTreeId: (t as { trainerRange_berryTreeId?: number }).trainerRange_berryTreeId ?? 0,
        script: (t as { script?: string }).script ?? '',
        flagId: (t as { flagId?: number | string }).flagId ?? 0,
      }));
      LoadObjEventTemplatesFromHeader(newHeader.id, headerTemplates);
    }

    // 1:1 décomp NPC orchestrator post-cross.
    // J — BUG FIX (2026-05-26) : sync preload BEFORE spawn. Avant : `void preloadNpcGraphicsForMap`
    // (= fire-and-forget async) + `UpdateObjectEventsForCameraUpdate` immediate → TrySpawn
    // appelait `_npcPngCache.get(pngPath)` qui returnait undefined (= preload pas fini) →
    // spawn skip silently → NPCs cross-map invisibles (= ex. ZIGZAGOON_1 absent sur
    // Route101 alors que PROF_BIRCH apparaît car son PNG est déjà cached depuis LittlerootTown).
    // Fix : await preload puis spawn dans le .then() callback. Le rest du handleConnection
    // (BGM, popup, etc.) continue immédiat — independent du spawn timing.
    void preloadNpcGraphicsForMap(newHeader).then(() => {
      // Re-check gMapHeader (= user n'a pas cross une autre border entretemps).
      const curHeader = (globalThis as Record<string, unknown>).gMapHeader as MapHeader | undefined;
      if (curHeader !== newHeader) return;
      UpdateObjectEventsForCameraUpdate(this.rt, pending.deltaX, pending.deltaY);
      UpdateObjectEvents(this.rt);
    });

    // BGM transition. 1:1 décomp `TransitionMapMusic`.
    const songId = (Songs as unknown as Record<string, number>)[newHeader.music] ?? 0;
    if (songId > 0 && songId !== _currentMapBgmId) {
      console.log(`[connection] PlayBGM(${newHeader.music} = ${songId})`);
      PlayBGM(songId);
      _currentMapBgmId = songId;
    }

    // 1:1 décomp `ShowMapNamePopup()` (overworld.c:822-824 fin LoadMapFromCameraTransition).
    // Skip si même mapsec (= e.g. cross-border vers même région). Internally
    // condition checked via _sLastMapSectionId tracking.
    if (newHeader.showMapName) {
      ShowMapNamePopup();
    }

    // Status text.
    this.statusText?.setText(`${newHeader.id} ${newHeader.mapLayout.width}x${newHeader.mapLayout.height}`);

    clearPendingConnection();
    void connection;
  }

  /** Wait que la queue de movement du player (= LOCALID_PLAYER) soit terminée.
   *  1:1 décomp pattern : `ObjectEventClearHeldMovementIfFinished` poll en case
   *  2 de `Task_ExitDoor` / `Task_ExitNonAnimDoor` (field_screen_effect.c:343 +
   *  391) : `IsPlayerStandingStill()` = check ObjectEventCheckHeldMovementStatus
   *  == 0x10 (= heldMovementFinished).
   *
   *  Notre équivalent : `isMovementDone('LOCALID_PLAYER')` retourne true quand
   *  la queue applyMovement est terminée (= toutes les actions consommées). */
  private waitForPlayerMovementDone(): Promise<void> {
    return new Promise((resolve) => {
      const check = (): void => {
        if (isMovementDone('LOCALID_PLAYER')) {
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
