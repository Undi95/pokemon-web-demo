/**
 * OverworldScene — sanity check Phase 4.1 map loader.
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
 * Activation : ajouter dans main.ts scene array, ou `scene.start('OverworldScene')`.
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { Gba } from '../gba/gba';
import { GbaPhaserBridge } from '../gba/phaser-bridge';
import { DecompRuntime, InitKeys, REG_OFFSET_DISPCNT } from '../runtime/decomp-runtime';
import { setGlobalRuntime, resetObjAllocations, ResetTasks, ResetPaletteFade, FreeAllSpritePalettes } from '../runtime/decomp-globals';
import { startM4aNativeAudio } from '../m4a/native';
import { ResetSpriteData } from '../../src/sprite';
import { CB2_NewGame, CB2_ContinueSavedGame, primeFieldInitDeps } from '../../src/overworld';
import { SetOverworldHost, SetMainCB2Fn } from '../../src/engine/overworld-host';
// Boot intro réutilisable (host unifié intro+OW — LE boot par défaut depuis 2026-07-10).
import { registerIntroSpriteCallbacks, bootIntroSequence } from '../boot/intro-host';
import { exposeGbaGlobals } from '../runtime/gba-global-scope';
import {
  loadMapByName,
  loadMapHeader,
  InitMap,
  InitMapFromSavedGame,
  CopyMapTilesetsToVram,
  LoadMapTilesetPalettes,
  MAP_OFFSET,
  TransitionToConnection,
  MoveMapViewToBackup,
  CONNECTION_NORTH,
  CONNECTION_SOUTH,
  CONNECTION_WEST,
  CONNECTION_EAST,
  gMapHeader,
} from '../../src/fieldmap';
import type { MapHeader, WarpEvent } from '../../src/fieldmap';
import {
  DrawWholeMapView,
  flushOverworldTilemaps,
  clearOverworldTilemaps,
  ResetFieldCamera,
  ResetCameraUpdateInfo,
  InitCameraUpdateCallback,
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
  gCamera,
} from '../../src/field_camera';
import type { PendingConnection } from '../../src/field_camera';
import {
  InitPlayerAvatar,
  PlayerStep,
  UpdatePlayerAvatarTransitionState,
  DestroyPlayerAvatar,
  SetPlayerVisibility,
  GetPlayerFacingDirection,
  SetPlayerAvatarTransitionFlags,
  PreloadObjectEventGraphics,
  GetPlayerAvatarGraphicsIdByStateId,
  DIR_NONE,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_EAST,
  DIR_WEST,
  NOT_MOVING,
  T_NOT_MOVING,
  gPlayerAvatar,
} from '../../src/field_player_avatar';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../../src/engine/save/save-block-state';
import { SetObjectEventDirection, gObjectEvents } from '../../src/event_object_movement';
import { CopyPartyAndObjectsFromSave, SetCurrentMap, GetCurrentMap, LoadObjEventTemplatesFromHeader } from '../../src/load_save';
import {
  SpawnObjectEventsOnMap,
  SpawnObjectEventsOnReturnToField,
  UpdateObjectEvents,
  TickObjectEventMovements,
  resetObjectEventAllocations,
  destroyAllNpcSprites,
  UpdateObjectEventsForCameraUpdate,
  UpdateObjectEventCoordsForCameraUpdate,
  preloadNpcGraphicsForMap,
  FreezeObjectEvents,
  UnfreezeAllNpcs as UnfreezeObjectEvents,
  ApplyLevitateMovement_TickAll,
  ResetLevitateMovementTasks,
  InitReflectionDistortion,
  UpdateReflectionDistortionMatrices,
} from '../../src/event_object_movement';
import { applyMovement, isMovementDone } from '../../src/engine/field/movement-system';
import { ScriptMovement_MoveObjects, ScriptMovement_Reset } from '../../src/script_movement';
import { SetFieldEffectRuntime } from '../../src/field_effect';
import { decideBootMode, preloadBootData } from '../boot/boot-mode';
import { installInputHandlers, setHeldKeysOverride } from '../runtime/input-handler';
import { installEngineDevtools } from '../devtools/engine-devtools';
// DEVTOOLS : 3 cartes de test (MAP_DEBUG_1/2/3) pour exercer toutes les CS sans
// traverser Hoenn. Arme un provider dans le map-loader (no-op en prod). dev.debugMap(1|2|3).
import { installDebugMaps } from '../devtools/debug-maps';
import {
  loadMapScripts,
  ScriptContext_RunScript,
  ScriptContext_Init,
  ScriptContext_Snapshot,
  ScriptContext_Restore,
  LockPlayerFieldControls,
  UnlockPlayerFieldControls,
  ArePlayerFieldControlsLocked,
  RunOnTransitionMapScript,
  RunOnResumeMapScript,
  TryRunOnFrameMapScript,
  TryRunOnWarpIntoMapScript,
} from '../../src/script';
// 1:1 décomp `DoCB1_Overworld` (overworld.c:1438) : la couche INPUT joueur passe par
// FieldClearPlayerInput → FieldGetPlayerInput → ProcessPlayerFieldInput → PlayerStep.
import {
  FieldClearPlayerInput,
  FieldGetPlayerInput,
  ProcessPlayerFieldInput,
  type FieldInput,
} from '../../src/field_control_avatar';
// Mécanisme pending-warp + helpers warp : dissous dans leurs miroirs 1:1
// (unification lot 16) — overworld.ts / field_screen_effect.ts / field_control_avatar.ts.
import {
  getPendingWarp,
  setPendingWarp,
  getPlayerCoordsFromWarp,
  GetAdjustedInitialDirection,
  GetDynamicWarp,
} from '../../src/overworld';
import { getExitTaskKindFor, getMetatileBehaviorAtPlayerPos, FillPalBufferWhite, FieldCB_SpinEnterWarp } from '../../src/field_screen_effect';
// Fondu grotte↔extérieur 1:1 (WarpFadeIn/OutScreen, field_screen_effect.c:74/100) :
// GetMapPairFadeTo/FromType (fldeff_flash.ts) choisit WHITE vs BLACK. Import scène (sink) —
// PAS depuis overworld (cycle statique overworld↔fldeff_flash via field_effect_helpers).
import { GetMapPairFadeToType, GetMapPairFadeFromType } from '../../src/fldeff_flash';
import type { WarpKind } from '../../src/field_control_avatar';
import {
  GetDoorSoundEffect,
  FieldAnimateDoorOpen,
  FieldAnimateDoorClose,
  FieldSetDoorOpened,
  preloadDoorTiles,
} from '../../src/field_door';
import {
  CreateWarpArrowSprite,
  DestroyWarpArrowSprite,
  HideShowWarpArrow,
} from '../../src/field_player_avatar';
import { preloadEmoteIcons } from '../../src/trainer_see';
import { UpdateTVScreensOnMap } from '../../src/tv';
import {
  preloadTallGrassEffect,
  TrySpawnTallGrassOnReturnToField,
} from '../../src/field_effect_helpers';
import { preloadSparkleEffect } from '../../src/field_effect_helpers';
import { preloadCutGrassEffect } from '../../src/fldeff_cut';
// Réserve GENERAL_0/GENERAL_1 dans [12,16) AVANT les autres field effects (sinon famine
// de slots → poussière/splash/feet-in-water rendus noirs, palBank=255). Cf. field_effect_helpers.ts.
import { preloadGeneralFieldEffectPalettes } from '../../src/field_effect_helpers';
import { DoTimeBasedEvents } from '../../src/clock';
import { SetUpFieldTasks } from '../../src/field_tasks';
import { StartWeather, preloadWeatherFogPalette, gWeatherPtr, FadeScreen, FADE_FROM_BLACK } from '../../src/field_weather';
import { DoCurrentWeather, SetSavedWeatherFromCurrMapHeader, preloadWeatherAshSprites, preloadWeatherFogHorizontalSprites, preloadWeatherCloudSprites, preloadWeatherSandstormSprites, preloadWeatherFogDiagonalSprites, preloadWeatherSnowSprites, preloadWeatherBubbleSprites, preloadWeatherRainSprites } from '../../src/field_weather_effect';
import { setReservedSpritePaletteCount } from '../../src/sprite';
import {
  SetDefaultFlashLevel, ResetScreenForMapLoad, InitOverworldGraphicsRegisters,
  InitCurrentFlashLevelScanlineEffect,
  Overworld_PlaySpecialMapMusic, TransitionMapMusic,
  TryFadeOutOldMapMusic, BGMusicStopped, SetWarpDestinationFromMapName,
  ApplyCurrentWarp, Overworld_GetMapHeaderByGroupAndId,
  GetInitialPlayerAvatarState, ResetInitialPlayerAvatarState,
  UpdateEscapeWarp, GetCurrentMapType, GetLastUsedWarpMapType, GetDestinationWarpMapType,
} from '../../src/overworld';
import { MAP_CONSTANTS } from '../../include/constants/map_groups';
import { OBJ_PALSLOT_COUNT } from '../../include/event_object_movement';
// Side-effect : enregistre DoCoordEventWeather (coord events météo, ex. cendre Route 113).
import '../../src/coord_event_weather';
// Jump dust (FldEff_Dust) : migré dans le miroir 1:1 game/field_effect_helpers.ts
// (jump-impact config-driven, préchargé via preloadJumpImpactEffects, tické par le callback global).
// Ripple : migré dans le miroir 1:1 game/field_effect_helpers.ts (one-shot via
// WaitFieldEffectSpriteAnim — tické + auto-despawn par le callback global).
import { preloadRippleEffect } from '../../src/field_effect_helpers';
// Long grass : migré dans le miroir 1:1 game/field_effect_helpers.ts (sprite.callback,
// tické + auto-despawn par le callback global runSpriteCallbacks).
import { preloadLongGrassEffect } from '../../src/field_effect_helpers';
// Short grass : migré dans le miroir 1:1 game/field_effect_helpers.ts (sprite.callback).
import { preloadShortGrassEffect } from '../../src/field_effect_helpers';
// Jump impact (jump tall/long grass + small/big splash) : migrés dans le miroir 1:1.
import { preloadJumpImpactEffects } from '../../src/field_effect_helpers';
// Splash + feet-in-flowing-water : migrés dans le miroir 1:1 game/field_effect_helpers.ts.
import { preloadSplashEffect } from '../../src/field_effect_helpers';
// Footprints / tire tracks : migrés dans le miroir 1:1 game/field_effect_helpers.ts
// (sprite.callback UpdateFootprintsTireTracksFieldEffect, tické par le callback global).
import { preloadFootprintsEffects } from '../../src/field_effect_helpers';
// Sand pile : migré dans le miroir 1:1 game/field_effect_helpers.ts (modèle sprite.callback,
// plus de pool ni d'Update manuel — le callback global runSpriteCallbacks le tique).
// Sand pile + hot springs : migrés dans le miroir 1:1 game/field_effect_helpers.ts
// (modèle sprite.callback — le callback global runSpriteCallbacks les tique).
import { preloadSandPileEffect, preloadHotSpringsEffect } from '../../src/field_effect_helpers';
// Bubbles : migré dans le miroir 1:1 game/field_effect_helpers.ts (one-shot sprite.callback).
import { preloadBubblesEffect } from '../../src/field_effect_helpers';
// Ash : migré dans le miroir 1:1 game/field_effect_helpers.ts (machine 3 états, sprite.callback).
import { preloadAshEffect, preloadAshLaunchPuffEffect } from '../../src/field_effect_helpers';
// Surf blob (monture de surf) : migré dans le miroir 1:1 game/field_effect_helpers.ts
// (sprite.callback UpdateSurfBlobFieldEffect + SpriteCB_UnderwaterSurfBlob, tickés par le callback global).
import { preloadSurfBlobEffect } from '../../src/field_effect_helpers';
import { preloadDisguiseEffects } from '../../src/field_effect_helpers';
import { preloadShadowEffect } from '../../src/field_effect_helpers';
import { preloadPokecenterHealEffect, preloadHallOfFameRecordEffect, preloadFieldMoveShowMonEffect } from '../../src/field_effect_helpers';
import { FieldCallback_FlyIntoMap, FieldCB_FallWarpExit } from '../../src/field_effect_helpers';
import { PlaySE } from '../runtime/decomp-globals';
import {
  SE_EXIT,
  SE_WARP_IN,
} from '../../include/constants/songs';
import {
  InitFieldMessageBox,
  TickFieldMessageBox,
  preloadStandardMenuPalette,
} from '../../src/field_message_box';
import { TickStartMenu } from '../../src/start_menu';
import { TickBedroomPC } from '../../src/player_pc';
import { TickShop } from '../../src/shop';
import { TickPCAnim } from '../../src/field_specials';
import { TickRegionMap } from '../../src/engine/field/region-map';
import { syncSubspriteOam } from '../../src/event_object_movement';
import { preloadFontData } from '../../src/text';
import { preloadTextWindowFrames } from '../../src/text_window';
import { FillPalBufferBlack } from '../runtime/decomp-globals';
// Side-effect import : registers gSpecials[] stubs (1:1 décomp scrcmd ScrCmd_special).
import '../../src/engine/script/specials-registry';
// Side-effect import : registers pokemon_size_record specials (Seedot/Lotad).
import '../../src/pokemon_size_record';
// Side-effect import : registers secret_base specials (cur base helpers).
import '../../src/secret_base';
import { ShowMapNamePopup, preloadMapNames } from '../../src/map_name_popup';
import { loadGameData, installDexDevtools } from '../../src/engine/data/game-data';
import {
  InitTilesetAnimations,
  UpdateTilesetAnimations,
  TransferTilesetAnimsBuffer,
} from '../../src/tileset_anims';

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

// (Shadow tracker `_currentMapBgmId` SUPPRIMÉ 2026-07-02 : source de vérité
// unique = sCurrentMapMusic dans src/sound.ts, dedup = guard 1:1
// `music != GetCurrentMapMusic()` d'Overworld_PlaySpecialMapMusic.)

// 1:1 décomp `DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP` flags.
const DISPCNT_OBJ_ON = 0x1000;
const DISPCNT_OBJ_1D_MAP = 0x40;
const DISPCNT_BG0_ON = 0x100;
const DISPCNT_BG1_ON = 0x200;
const DISPCNT_BG2_ON = 0x400;
const DISPCNT_BG3_ON = 0x800;

export class OverworldScene extends Phaser.Scene {
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
  /** 1:1 décomp `VBlankCB_Field` (overworld.c:1784-1792) — posé par
   *  `SetFieldVBlankCallback` dans TOUS les chemins d'entrée field : boot ET
   *  retour de menu/combat (CB2_ReturnToFieldLocal). Écrit les registres de
   *  scroll BG (`FieldUpdateBgTilemapScroll`) + flush tileset anims à CHAQUE
   *  VBlank — le runtime l'appelle chaque frame (decomp-runtime.ts:2154), fade
   *  compris → le scroll BG reste correct pendant les transitions (warp + sortie
   *  de menu). UNE seule fonction partagée = 1:1 (la décomp n'a qu'un
   *  VBlankCB_Field) + évite d'éditer un chemin sans l'autre. */
  readonly _fieldVBlankCB = (): void => {
    FieldUpdateBgTilemapScroll(this.rt);
    TransferTilesetAnimsBuffer(this.rt);
  };
  /** Mode hôte unifié (LE boot par défaut, ex-chantier « c » ?unified). true = boote
   *  l'intro dans CE runtime (Copyright→Title→MainMenu→Birch) puis entre l'OW via
   *  CB2_NewGame/Continue dans le MÊME runtime (1:1 SetMainCallback2, sans scene.start).
   *  false = presets dev (?nointro/?debug/?clock/?truck) et chemin legacy ?no-un. */
  private introMode = false;
  /** Set true au 1er tick où CB2_NewGame/Continue fire (post-Birch) — anti double-fire. */
  private overworldTransitionStarted = false;

  constructor() { super({ key: 'OverworldScene' }); }

  create(): void {
    console.log('[overworld] create()');
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
      const { InitWildEncountersFromJson, ResetWildEncounterImmunity } = await import('../../src/wild_encounter');
      try {
        const res = await fetch('/decomp/em/wild-encounters.json');
        const data = await res.json();
        InitWildEncountersFromJson(data);
        ResetWildEncounterImmunity();
      } catch (e) {
        console.warn('[overworld] wild-encounters.json load failed:', e);
      }
    })();

    // Audit session 126 (post-test) : 1:1 décomp `CB2_NewGame:1144 + CB2_
    // ContinueSavedGame:1340` → `PlayTimeCounter_Start()`. Sans ça, le state
    // reste à STOPPED → playTimeVBlanks/Seconds/Minutes/Hours jamais incrémentés
    // → DUREE JEU "0:00" toujours. À call AU BOOT overworld pour que le tick
    // dans decomp-runtime.tickFixed soit actif.
    // ⚠️ FALLBACK ASYNC : ce Start est fire-and-forget → il PERDAIT la course contre
    // le PlayTimeCounter_Reset() synchrone de applyNoIntroPreset (NewGameInit) pour
    // ?debug/?clock (compteur STOPPED → 00:00 au Panthéon). Le preset fait désormais
    // son PROPRE PlayTimeCounter_Start() synchrone (1:1 CB2_NewGame, boot-mode.ts) →
    // ce chemin ne couvre plus que ?nointro-resume et ?truck (qui ne passent pas par
    // le Start du preset). Start idempotent → double-appel sans effet pour ?debug/?clock.
    void import('../../src/play_time').then(({ PlayTimeCounter_Start }) => {
      PlayTimeCounter_Start();
      console.log('[overworld] PlayTimeCounter_Start invoked');
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
      sceneName: 'OverworldScene',
    });

    // DEVTOOLS debug-maps : arme le provider MAP_DEBUG_* (harness/devtools/debug-maps.ts)
    // + expose dev.debugMap(1|2|3). Aucune donnée de jeu touchée.
    installDebugMaps();

    // Real keyboard → rt.gMain.heldKeys via handler global partagé.
    // Cf. src/engine/input-handler.ts (= 1:1 décomp gMain.heldKeys canonical).
    installInputHandlers(this, this.rt);

    // Skip → TestGba si ESC.
    this.input.keyboard?.on('keydown-ESC', () => {
      console.log('[overworld] ESC → GameScene');
      this.scene.start('GameScene');
    });

    // HOST UNIFIÉ PAR DÉFAUT (user 2026-07-10, ex-chantier « c » gated ?unified) :
    // boote l'INTRO dans CE runtime (Copyright→logo→Title→MainMenu→Birch), puis
    // update() détecte CB2_NewGame/Continue → enterOverworld dans CE MÊME runtime
    // (1:1 AgbMain : transitions par SetMainCallback2, zéro scene.start —
    // RNG/seed/état de boot CONTINUS du power-on à l'OW).
    // introMode=false UNIQUEMENT pour :
    //  - les presets dev ?nointro/?debug/?clock/?truck (boot direct OW, save posée) ;
    //  - le chemin legacy ?no-un (GameScene fait l'intro puis scene.start ici → OW direct).
    const bootParams = new URLSearchParams(window.location.search);
    this.introMode = !(bootParams.has('nointro') || bootParams.has('debug')
      || bootParams.has('clock') || bootParams.has('truck') || bootParams.has('no-un'));
    if (this.introMode) {
      // AUDIO UNLOCK (autoplay policy) : plus d'écran « press A » (TestGbaScene) en
      // amont pour primer l'audio au geste — one-shot sur le premier input, même
      // primer (primeAudio → getAudioContext().resume()).
      const unlockAudio = (): void => {
        startM4aNativeAudio().catch((e) => console.error('[m4a-native]', e));
      };
      this.input.keyboard?.once('keydown', unlockAudio);
      this.input.once('pointerdown', unlockAudio);
      registerIntroSpriteCallbacks(this.rt);
      bootIntroSequence(this.rt).catch((e) => console.error('[unified-boot] intro', e));
    } else {
      this.bootOverworld().catch((e) => console.error('[unified-boot] overworld', e));
    }
  }

  /** Chantier « c » Step 2.2 : transition intro→OW dans le MÊME runtime (1:1 décomp
   *  CB2_NewGame/CB2_ContinueSavedGame → SetMainCallback2(CB2_Overworld), sans scene.start).
   *  Porté de GameScene.transitionToOverworld + resets (sprites/tasks/palettes intro/Birch)
   *  qui étaient implicites quand on jetait le runtime au scene.start. */
  private async transitionToOverworld(mode: 'newgame' | 'continue'): Promise<void> {
    this.overworldTransitionStarted = true;
    console.log(`[overworld unified] CB2_${mode === 'continue' ? 'ContinueSavedGame' : 'NewGame'} → enterOverworld (${mode})`);
    if (mode === 'continue') {
      // 1:1 GameScene : LOAD la save AVANT de toucher l'état (sinon un save() plus
      // loin écraserait la save avec du vide). decideBootMode lira ensuite la map sauvée.
      const { LoadGameSave } = await import('../../src/save');
      LoadGameSave();
    } else {
      // newgame : Birch a posé name/gender dans gSaveBlock2Ptr. Clear la map pour
      // forcer le truck cinematic (1:1 WarpToTruck post-Birch).
      SetCurrentMap(undefined);
    }
    // 1:1 GameScene : attendre la fin de la fade Birch en cours puis forcer Faded noir
    // (évite le flash) avant l'entrée OW.
    if (this.rt.gPaletteFade.active) {
      let wf = 0;
      while (this.rt.gPaletteFade.active && wf < 60) {
        await new Promise<void>((resolve) => setTimeout(resolve, 16));
        wf++;
      }
    }
    FillPalBufferBlack();
    // RESETS (1:1 décomp CB2_NewGame/field-init) : nettoie les sprites/tasks/palettes
    // résiduels de l'intro/Birch. En scene.start c'était implicite (runtime neuf) ;
    // en runtime partagé il faut le faire explicitement avant que bootOverworld re-init.
    ResetSpriteData();
    // resetObjAllocations() = LE reset clé qu'un runtime NEUF fait dans create() mais que
    // le runtime partagé n'avait pas : réinitialise l'allocation OAM matrices + sprite
    // tiles + sprite palettes. Sans ça l'état d'allocation accumulé par l'intro fragmente
    // les loads palette en OW (NPC invisible / fenêtre dialogue noire / FPS drop au step-off).
    resetObjAllocations();
    resetObjectEventAllocations();
    ResetTasks();
    ResetPaletteFade();
    FreeAllSpritePalettes();
    // NB : les registres screen-effect (MOSAIC/WININ/WINOUT/WIN0-1/BLDCNT/BLDALPHA/BLDY)
    // que l'intro/Birch laissent actifs (logo shine = OBJ_WINDOW ; fades = BLDY) sont
    // désormais remis aux valeurs OW par `InitOverworldGraphicsRegisters` (overworld.c:2096),
    // appelé à la fin de loadAndInitMap (via bootOverworld ci-dessous). Plus besoin des
    // clears ad-hoc ici : le chemin de map load pose lui-même l'état GPU correct (1:1 décomp),
    // ce qui écrase l'ombre résiduelle (mode-3/BLDY) au passage intro→OW.
    // Entre l'OW dans CE runtime (= 1:1 SetMainCallback2(CB2_Overworld)). bootOverworld
    // exécute le VRAI corps CB2_NewGame / CB2_ContinueSavedGame pour ce `mode`.
    await this.bootOverworld(mode);
  }

  /** Async boot : load map + init BG + draw + go.
   *  @param bootMode 'newgame'|'continue' (host unifié → exécute le corps 1:1 du CB2
   *    correspondant) ; undefined (boot direct : presets ?debug/?nointro/?clock/?truck +
   *    legacy ?no-un) → decideBootMode. */
  private async bootOverworld(bootMode?: 'newgame' | 'continue'): Promise<void> {
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
      // Charger le moteur byte-VM AVANT decideBootMode : NewGameInitData
      // (new_game.ts) exécute RunScriptImmediately('EventScript_ResetAllMapFlags')
      // = le VRAI script décomp (159 setflag + ResetAllBerries) — il faut l'image
      // bytecode + les handlers installés. Idempotent (no-op si déjà chargé).
      await (await import('../../src/bytevm-boot')).loadByteVmEngine();

      // ─── Dispatch boot (host unifié : VRAIS corps 1:1 CB2_* ; presets : decideBootMode) ──
      // Host unifié (intro → New Game / Continue) : exécute le corps 1:1 CB2_NewGame /
      // CB2_ContinueSavedGame (overworld.ts) ; le harness ne réalise QUE le chargement
      // async d'assets (ADAPTATION ROM→fetch, précédent = executeWarp → loadAndInitMap).
      // Presets dev (?debug/?nointro/?clock/?truck) + legacy ?no-un : decideBootMode.
      let boot: { mode: string; mapId: string; x: number; y: number; facing: number };
      let initFromSavedGame = false;
      // Précharge (chunks séparés, call-time) les deps des corps CB2 field-init AVANT
      // de les exécuter — cf. overworld.primeFieldInitDeps (anti-TDZ). Uniquement pour
      // le host unifié (les presets/decideBootMode n'exécutent pas les corps CB2).
      if (bootMode) await primeFieldInitDeps();
      if (bootMode === 'newgame') {
        // 1:1 décomp CB2_NewGame → NewGameInitData → WarpToTruck pose
        // gSaveBlock1Ptr.location = MAP_INSIDE_OF_TRUCK (2, 2). On charge ENSUITE cette map.
        CB2_NewGame();
        const cur = GetCurrentMap();
        boot = { mode: 'newgame', mapId: cur?.name ?? 'MAP_INSIDE_OF_TRUCK',
                 x: cur?.x ?? 2, y: cur?.y ?? 2, facing: DIR_SOUTH };
      } else if (bootMode === 'continue') {
        // La save est déjà chargée (transitionToOverworld). PRÉCHARGER la map data de la
        // save (loadMapByName = cache + gMapHeader, SANS init visuelle) AVANT le corps :
        // CB2_ContinueSavedGame → LoadSaveblockMapHeader + InitMapFromSavedGame exigent
        // gMapHeader résolu (⚠️ InitMapFromSavedGame est re-réalisé par loadAndInitMap
        // ci-dessous — cf. rapport, doublon idempotent assumé).
        const saved = GetCurrentMap();
        if (saved) {
          await loadMapByName(saved.name);
          // Aligne location.mapGroup/mapNum AVANT le corps : SetCurrentMapLocation les pose
          // à (0,0) stale (l'identité de map vit dans __mapId), or CB2_ContinueSavedGame →
          // LoadSaveblockMapHeader résout le header par (group,num) via
          // Overworld_GetMapHeaderByGroupAndId. Même alignement que loadAndInitMap (ci-dessous).
          const packed = MAP_CONSTANTS[saved.name];
          if (packed !== undefined) {
            gSaveBlock1Ptr.location.mapGroup = packed >> 8;
            gSaveBlock1Ptr.location.mapNum = packed & 0xFF;
          }
        }
        const disc = CB2_ContinueSavedGame();
        if (disc === 'warp') {
          // UseContinueGameWarp : WarpIntoMap a posé location = continueGameWarp + pos.
          // Le mapId string vit dans l'overlay __continueGameWarpMapId (cf.
          // boot-mode.tryContinueGameWarpSpawn). Load FRAIS de la dest (= CB2_LoadMap).
          const b1 = gSaveBlock1Ptr as { __continueGameWarpMapId?: string; pos: { x: number; y: number } };
          boot = { mode: 'warp', mapId: b1.__continueGameWarpMapId ?? GetCurrentMap()?.name ?? 'MAP_LITTLEROOT_TOWN',
                   x: b1.pos.x, y: b1.pos.y, facing: DIR_SOUTH };
          initFromSavedGame = false;
        } else {
          const cur = GetCurrentMap();
          boot = { mode: 'resume', mapId: cur?.name ?? 'MAP_LITTLEROOT_TOWN',
                   x: cur?.x ?? 0, y: cur?.y ?? 0, facing: cur?.facing ?? DIR_SOUTH };
          initFromSavedGame = true;  // → InitMapFromSavedGame (LoadSavedMapView)
        }
      } else {
        boot = decideBootMode();
        initFromSavedGame = boot.mode === 'resume';
      }
      console.log(`[overworld] boot mode = ${boot.mode} → ${boot.mapId} (${boot.x}, ${boot.y})`);
      // Étape 5 : resume save → InitMapFromSavedGame (LoadSavedMapView). Les
      // autres modes (newgame/nointro/warp) → InitMap normal (= 1:1 décomp).
      const header = await this.loadAndInitMap(
        boot.mapId, boot.x, boot.y, boot.facing, initFromSavedGame,
      );

      // 1:1 décomp `VBlankCB_Field` (overworld.c:1784-1792) :
      //   LoadOam(); ProcessSpriteCopyRequests(); ScanlineEffect_InitHBlankDmaTransfer();
      //   FieldUpdateBgTilemapScroll(); TransferPlttBuffer(); TransferTilesetAnimsBuffer();
      // Le VBlank callback écrit les registres de scroll BG (FieldUpdateBgTilemapScroll)
      // + flush tileset anims, EN PLUS de déclencher le transfer palette
      // (TransferPlttBuffer = `gPlttBufferFaded.flushTo()` côté runtime, déclenché par
      // le simple fait d'avoir un vblankCallback set — sinon palettes/fades figés).
      // ⚠️ CRITIQUE : le runtime appelle `vblankCallback` CHAQUE frame
      // (decomp-runtime.ts:2154), y compris pendant le fade de warp où le corps de
      // MainCB2_Overworld early-return (warpInProgress). La décomp n'appelle
      // FieldUpdateBgTilemapScroll QUE depuis VBlankCB_Field (overworld.c:1789, jamais
      // dans le main body) — donc il DOIT vivre ici, pas dans le corps. Sinon les
      // registres BG1/2/3 VOFS restent à 0 (posés par ChangeBgY dans
      // InitOverworldGraphicsRegisters) pendant tout le fade → map rendue 40px
      // (~2.5 métatuiles) trop haut, puis « snap » au 1er frame post-fade quand le
      // corps re-tourne. (Bug user « warp : spawn trop haut puis recalé ».)
      this.rt.SetVBlankCallback(this._fieldVBlankCB);
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
        const { ExecuteTruckSequence } = await import('../../src/field_special_scene');
        ExecuteTruckSequence(this.rt);
      } else if (boot.mode === 'resume' || boot.mode === 'warp') {
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
      // 1:1 décomp `struct FieldInput inputStruct` (DoCB1_Overworld, stack-local). Persistant
      // ici (réinitialisé chaque frame par FieldClearPlayerInput avant FieldGetPlayerInput).
      const sFieldInput = {} as FieldInput;
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
          // [M3-C3.2c] 1:1 décomp `OverworldBasic` : UpdateCameraPanning tourne CHAQUE
          // frame, même pendant un fade/warp. Sans ça, pendant le fade-in de la map
          // destination, gSpriteCoordOffset reste périmé depuis la map précédente → le
          // sprite joueur (coords-monde) rend décalé d'1 tuile sur la/les 1ères frames
          // intérieures (desync visible à l'entrée). On le garde frais ici.
          UpdateCameraPanning();
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
        // 1:1 décomp shop.c : tick le menu d'achat Pokémart (overlay). Si ouvert :
        // drive l'input (Acheter/Vendre/Quitter → liste → quantité → confirm).
        // Quand fermé : _runUIOverlay (opcode pokemart) reprend le script bloqué.
        TickShop();
        // ════════════════════════════════════════════════════════════════════
        //  [M3-C3] 1:1 décomp `OverworldBasic` (overworld.c:1465-1476) +
        //  `VBlankCB_Field` (overworld.c:1784-1792). MainCB2_Overworld POSSÈDE
        //  désormais sa propre séquence de rendu, dans l'ordre EXACT du décomp :
        //    ScriptContext_RunScript → RunTasks → AnimateSprites → CameraUpdate
        //    → UpdateCameraPanning → BuildOamBuffer → UpdatePaletteFade
        //    → UpdateTilesetAnimations → DoScheduledBgTilemapCopiesToVram
        //  puis (VBlankCB_Field) : FieldUpdateBgTilemapScroll → TransferTilesetAnims.
        //  Le runtime tickFixed re-appelle runTasks/animateSprites/buildOamBuffer/
        //  UpdatePaletteFade en FALLBACK idempotent (no-op si déjà appelés ici ;
        //  ne tournent que sur les frames de warp où on early-return avant le rendu).
        //  CRITIQUE C3 : CameraUpdate s'exécute APRÈS AnimateSprites → le CameraObject
        //  (SpriteCB_CameraObject, tické dans animateSprites) a posé son delta AVANT
        //  que CameraUpdateCallback ne le lise. (ScriptContext_RunScript a déjà tourné
        //  en tête du body, l.508.)
        // ════════════════════════════════════════════════════════════════════
        // ── CB1_Overworld : input joueur (pose le held movement du pas) ──
        // 1:1 STRICT décomp `DoCB1_Overworld` (overworld.c:1438) :
        //   UpdatePlayerAvatarTransitionState();           // dérive tileTransitionState du held
        //   FieldClearPlayerInput(&inputStruct);
        //   FieldGetPlayerInput(&inputStruct, newKeys, heldKeys);   // gate l'input à T_TILE_CENTER
        //   if (!ArePlayerFieldControlsLocked()) {
        //     if (ProcessPlayerFieldInput(&inputStruct) == 1) { LockPlayerFieldControls(); HideMapNamePopUpWindow(); }
        //     else { PlayerStep(inputStruct.dpadDirection, newKeys, heldKeys); }
        //   }
        // ProcessPlayerFieldInput consomme les events de step-end (coord/warp/encounter) + interactions ;
        // PlayerStep est la machine de MOUVEMENT pure (held movements). Quand locked, on appelle quand
        // même PlayerStep (sa branche lock interne = stand-in des door warp tasks, forced door-walk).
        UpdatePlayerAvatarTransitionState();
        FieldClearPlayerInput(sFieldInput);
        FieldGetPlayerInput(sFieldInput, rt.gMain.newKeys, rt.gMain.heldKeys);
        let _inputConsumed = false;
        if (!ArePlayerFieldControlsLocked()) {
          _inputConsumed = ProcessPlayerFieldInput(sFieldInput);
          if (_inputConsumed) {
            LockPlayerFieldControls();
            // HideMapNamePopUpWindow() — non porté (no-op).
          }
        }
        if (!_inputConsumed) {
          PlayerStep(sFieldInput.dpadDirection, rt.gMain.newKeys, rt.gMain.heldKeys);
        }
        // ── RunTasks (overworld.c:1468) ──
        // 1:1 décomp `RunTasks()` : tick le registre gTasks (door anim, fade…).
        // Idempotent (guard _runTasksCalledThisFrame) → tickFixed ne le rejoue pas.
        rt.runTasks();
        // H2 — script_movement.c : pose ObjectEventSetHeldMovement par NPC scripté.
        // AVANT TickObjectEventMovements (même tick l'exécute). RunTasks (tâche)
        // précède AnimateSprites (mouvement) — 1:1 décomp.
        ScriptMovement_MoveObjects();
        // H3.2 — ApplyLevitateMovement : sprite.y2 oscille (NPCs LEVITATE).
        ApplyLevitateMovement_TickAll(rt);
        // ── AnimateSprites (overworld.c:1469) : mouvement des object events PUIS
        //    sprite callbacks (dont SpriteCB_CameraObject) + anims + affine. ──
        // Mouvement des object events : worldX/Y += dx/dy via les held movements
        // (walk/dash/ledge input ET door warp forced via forceMovement). Le pont
        // AdvancePlayerSpriteWorldPos (C2) est SUPPRIMÉ : le forced movement passe
        // désormais par un held WALK_NORMAL (PlayerStep forced path) → worldX avancé
        // par _NpcTakeStep ici → le CameraObject suit. Plus aucun mouvement joueur
        // inline ni driver caméra manuel.
        TickObjectEventMovements(rt);
        // CreateReflectionEffectSprites affine-anims : tick les matrices de distorsion
        // des reflets eau AVANT le rendu.
        UpdateReflectionDistortionMatrices(rt);
        // Pose sprite.x/y = worldX/Y des NPCs (coordOffsetEnabled). Le joueur est
        // positionné par updateSpriteFrame (dans PlayerStep).
        UpdateObjectEvents(rt);
        // AnimateSprites partie 2 : runSpriteCallbacks (CameraObject + field effects :
        // tall grass / ripple / grass / splash / dust / ash / surf / disguise / emote /
        // shadow / warp arrow = vrais sprite.callback migrés game/field_effect_helpers.ts)
        // + tickSpriteAnims + tickAllAffineAnims. Idempotent (tickFixed no-op après).
        rt.animateSprites();
        // ── CameraUpdate (overworld.c:1470) : lit le delta du CameraObject (ou le
        //    driver manuel tant que le CameraObject est inerte) → scroll + offset. ──
        CameraUpdate();
        // Phase 4.8 : transition cross-border seamless signalée par CameraMove.
        const pendingConn = getPendingConnection();
        if (pendingConn) {
          self.handleConnectionTransition(pendingConn);
        }
        // ── UpdateCameraPanning (overworld.c:1471) : gSpriteCoordOffset = total - pan. ──
        UpdateCameraPanning();
        // ─── Fix défensif désync cam vs player (user-flag 2026-05-22) : si player
        // NOT_MOVING + pas de cross-border + cam ≠ player → re-sync + full redraw. ─
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
        // HideShowWarpArrow (field_player_avatar.c) : per-frame, après CameraUpdate
        // (utilise gSaveBlock1Ptr.pos mis à jour par CameraMove au passage de tuile).
        HideShowWarpArrow(rt, gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y, GetPlayerFacingDirection());
        // ── BuildOamBuffer (overworld.c:1472) : sync child OAMs subsprite (truck 48×48)
        //    PUIS sprite state → OAM (avec gSpriteCoordOffset frais). Idempotent. ──
        syncSubspriteOam();
        rt.buildOamBuffer();
        // ── UpdatePaletteFade (overworld.c:1473). Idempotent (tickFixed no-op après). ──
        rt.UpdatePaletteFade();
        // ── UpdateTilesetAnimations (overworld.c:1474). ──
        UpdateTilesetAnimations();
        // ── DoScheduledBgTilemapCopiesToVram (overworld.c:1475) : flush BG buffer
        //    modifié seulement (flag copyBGToVRAM via DrawMetatile/RedrawMapSlice). ──
        if (IsBgRedrawPending()) {
          flushOverworldTilemaps(rt);
          ClearBgRedrawPending();
        }
        // ── VBlankCB_Field (overworld.c:1789-1791) : FieldUpdateBgTilemapScroll +
        //    TransferTilesetAnimsBuffer vivent dans le VBlank callback
        //    (_VBlankCB_Overworld ci-dessus), PAS ici. La décomp ne les appelle QUE
        //    depuis VBlankCB_Field → ils tournent chaque frame même quand ce corps
        //    early-return (warpInProgress) → fix du scroll BG figé pendant le fade
        //    (BG1/2/3 VOFS=0 → map 40px trop haut, "snap" post-fade). ──
      };
      this.rt.gMain.callback2 = MainCB2_Overworld;
      // Expose pour le retour depuis option menu / sub-CB2 1:1 décomp :
      // CB2_ReturnToFieldLocal_Manual (option-menu-return.ts) doit pouvoir
      // restaurer ce closure quand le state machine décomp completes (= 1:1
      // `SetMainCallback2(CB2_Overworld)` après ReturnToFieldLocal returns TRUE).
      // Registre typé overworld-host (remplace l'ex-pont globalThis._overworldMainCB2).
      SetMainCB2Fn(MainCB2_Overworld);
      // Enregistre cette scène comme HOST overworld. La rustine de restauration
      // (ex-`_restoreOverworldFromMenu` posée ici, = 1:1 CB2_ReturnToField) a été
      // rapatriée dans src/overworld.ts (`ReturnToFieldFromBattleOrMenu`) ; elle
      // consomme rt / loadAndInitMap / _fieldVBlankCB de cette scène via
      // GetOverworldHost(). CB2_ReturnToFieldLocal_Manual (case 1) et battle-decomp-loop
      // l'appellent désormais directement / via le registre-feuille overworld-host.
      SetOverworldHost(this);

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

      console.log('[overworld] boot done');
    } catch (e) {
      console.error('[overworld] bootOverworld failed:', e);
      this.statusText?.setText(`ERROR : ${e}`);
    }
  }

  update(_: number, deltaMs: number): void {
    if (!this.rt) return;
    // Chantier « c » Step 2.2 (mode unifié) : détecte la transition post-Birch vers l'OW
    // et l'enchaîne dans CE runtime (1:1 SetMainCallback2, sans scene.start). 1:1 GameScene :
    // null-out callback2 IMMÉDIATEMENT pour empêcher tickFixed de l'exécuter pendant l'await.
    if (this.introMode && !this.overworldTransitionStarted) {
      const cb2 = this.rt.gMain.callback2;
      if (cb2 === CB2_NewGame) {
        this.rt.gMain.callback2 = null;
        void this.transitionToOverworld('newgame');
        return;
      } else if (cb2 === CB2_ContinueSavedGame) {
        this.rt.gMain.callback2 = null;
        void this.transitionToOverworld('continue');
        return;
      }
    }
    // Skip le tick pendant que la transition async tourne (évite tout leftover callback2).
    if (this.overworldTransitionStarted && !this.booted) return;
    // En mode OW-direct, attendre que bootOverworld ait fini (booted). En mode intro,
    // ticker dès le départ (l'intro a déjà posé son CB2 via bootIntroSequence).
    if (!this.introMode && !this.booted) return;
    // PlayerStep + CameraUpdate driven par gMain.callback2 dans tickFixed.
    // Optim : tickFixed retourne le nb de frames LOGIQUES exécutées. Si
    // 0 (= update appelé > 60Hz, accumulator pas plein), pas besoin de
    // re-render. gba.tick (= composeFrame 5.3ms) + putImageData (= ~3ms)
    // sont skip → on n'affiche pas une frame identique.
    let framesProcessed = 0;
    try {
      framesProcessed = this.rt.tickFixed(deltaMs);
    } catch (e) {
      console.error('[overworld.update] tickFixed THREW:', e);
    }
    if (framesProcessed > 0) {
      try {
        this.bridge.tick();
      } catch (e) {
        console.error('[overworld.update] bridge.tick THREW:', e);
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
  async loadAndInitMap(
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
    console.log(`[overworld] Loaded ${header.id} : ${header.mapLayout.width}x${header.mapLayout.height}`);

    // Port `ApplyCurrentWarp` partiel pour les flux SANS Do*Warp (boot, resume,
    // whiteout direct…) : load_save.ts pose location {mapGroup:0, mapNum:0}
    // (stale) — on aligne group/num RÉELS depuis MAP_CONSTANTS[header.id]
    // (source des checks 1:1 : GetCurrLocationDefaultMusic Route111,
    // NoMusicInSootopolis, GetWarpDestinationMusic Mauville…). Les warps ont
    // déjà location juste (ApplyCurrentWarp en Phase 3 d'executeWarp) → no-op.
    {
      const packed = MAP_CONSTANTS[header.id];
      if (packed !== undefined) {
        const loc = gSaveBlock1Ptr.location;
        if (loc.mapGroup !== (packed >> 8) || loc.mapNum !== (packed & 0xFF)) {
          loc.mapGroup = packed >> 8;
          loc.mapNum = packed & 0xFF;
        }
      }
    }

    // 1:1 décomp `ResetScreenForMapLoad` (overworld.c:2077, state 1 de
    // LoadMapInStepsLocal) — éteint l'affichage (DISPCNT=0) + reset OAM le temps
    // du map load. Sans DISPCNT=0, pendant les frames entre LoadMapTilesetPalettes
    // (= NEW palettes) et DrawWholeMapView (= NEW BG buffer), le compositor render
    // OLD BG buffer avec NEW palettes/tiles → garbage (flash rose/gris). L'affichage
    // est rallumé à la fin du load par InitOverworldGraphicsRegisters (overworld.c:
    // 2096), qui pose AUSSI les registres MOSAIC/WIN/BLD corrects (cf. fin de fonction).
    ResetScreenForMapLoad();

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
    // FIX (Bug 2a) — état surf/underwater préservé au retour combat/menu. Sur le chemin
    // returnToField, gObjectEvents[slot joueur].graphicsId PORTE l'état persisté (surf/underwater)
    // survivant au combat (gObjectEvents non-reset ici). Notre InitPlayerAvatar (spécifique port :
    // recharge la feuille NORMAL réservée + snapshot du sprite joueur — le décomp générique n'a pas
    // ce chemin) va CLOBBERER ce graphicsId en 'Brendan'/'May'. On le snapshot ICI pour le repasser
    // à SpawnObjectEventsOnReturnToField (infra) qui re-dérive l'état via SetPlayerAvatarExtraState
    // Transition (1:1 SetPlayerAvatarObjectEventIdAndObjectId → PlayerAvatarTransition_Surfing recrée
    // le blob). Le décomp ne réinitialise pas l'object event sur ce chemin (SpawnObjectEventOnReturn
    // ToField réutilise le persisté) ; préserver le graphicsId (source de la re-dérivation) = même net.
    const persistedPlayerGfxId = returnToField
      ? gObjectEvents[gPlayerAvatar.objectEventId]?.graphicsId
      : undefined;
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

    // FIX 2 (Bug 2b/3b) — 1:1 décomp `InitObjectEventsLocal` (overworld.c:2172-2174) :
    //   player = GetInitialPlayerAvatarState();
    //   SetPlayerAvatarTransitionFlags(player->transitionFlags);
    //   ResetInitialPlayerAvatarState();
    // Dérive l'état MONTÉ à l'arrivée (UNDERWATER si map sous-marine ; SURFING si la tuile sous le
    // joueur est de l'eau surfable ; vélo préservé via StoreInitialPlayerAvatarState avant un dive)
    // et l'applique via la machine à transitions (PlayerAvatarTransition_Surfing recrée le blob).
    // Chemin returnToField=FALSE uniquement (warp/boot/resume) → refresh en surf reste en surf,
    // plongée → underwater, émersion → surf. Le retour combat/menu (returnToField=true) préserve
    // l'état PERSISTÉ à part (FIX 1). La direction est déjà ajustée harness-side (GetAdjustedInitial
    // Direction dans executeWarp) → on ne câble QUE transitionFlags ici.
    if (!returnToField) {
      const initialState = GetInitialPlayerAvatarState();
      // state = position du bit du flag = index 1:1 de DoPlayerAvatarTransition (NORMAL=0, MACH_BIKE=1,
      // ACRO_BIKE=2, SURFING=3, UNDERWATER=4). >0 = état monté → précharger son gfx. Le gfx NORMAL est
      // déjà en VRAM (feuille réservée d'InitPlayerAvatar) → pas de préchargement pour l'état à pied.
      const state = Math.log2(initialState.transitionFlags) | 0;
      if (state > 0) {
        // ADAPTATION port : PNGs fetch async → au refresh (cache _npcPngCache vide) il faut précharger
        // AVANT la transition, sinon ObjectEventSetGraphicsId rate le PNG surf/underwater (sprite marchant
        // sur l'eau). Le décomp a la ROM sync → pas ce besoin. .catch = Règle 3 (hurle si le fetch échoue).
        await PreloadObjectEventGraphics(GetPlayerAvatarGraphicsIdByStateId(state))
          .catch((e) => console.error('[loadAndInitMap] preload gfx état monté (surf/underwater)', e));
      }
      SetPlayerAvatarTransitionFlags(initialState.transitionFlags);
      ResetInitialPlayerAvatarState();
    }

    // [M3-C3.2] 1:1 décomp `SetCameraToTrackPlayer()` (overworld.c:2187-2191) —
    // appelé APRÈS InitObjectEventsLocal (= InitPlayerAvatar), AVANT ResetFieldCamera
    // (case 3 puis case 5 du LoadMapInStepsLocal, overworld.c:1908-1919). Active le
    // mécanisme caméra 1:1 : le CameraObject (sprite invisible) suit gPlayerAvatar.
    // spriteId et mesure son delta worldX/Y → CameraUpdateCallback ÉCRASE gFieldCamera.
    // movementSpeed depuis ce delta chaque frame → la caméra DÉRIVE du sprite joueur
    // (les drivers manuels deviennent morts, retirés en C3.3). CameraObject_Init
    // s'aligne sur la position courante (delta=0) → pas de saut au spawn.
    {
      const playerSlot = gObjectEvents[gPlayerAvatar.objectEventId];
      if (playerSlot) playerSlot.trackedByCamera = true;
      InitCameraUpdateCallback(gPlayerAvatar.spriteId);
    }

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

    // Préchargement assets météo (plateforme, async, idempotent) : démarré TÔT pour laisser
    // le temps au fetch (fog.pal / *.png) de finir avant StartWeather (déplacé APRÈS le spawn).
    const _pw = (p: Promise<void>, tag: string): void => { p.catch((e) => console.error(`[weather-preload] ${tag}:`, e)); };
    _pw(preloadWeatherFogPalette(), 'fogPal');
    _pw(preloadWeatherAshSprites(), 'ash');
    _pw(preloadWeatherFogHorizontalSprites(), 'fogH');
    _pw(preloadWeatherCloudSprites(), 'clouds');  // WEATHER_SUNNY_CLOUDS (Route 119/120) — sinon CreateCloudSprites tile 0 garbage.
    // Familles vague 3 (8380f57c0) — préload OBLIGATOIRE avant StartWeather (Snow_InitAll boucle sinon).
    _pw(preloadWeatherSandstormSprites(), 'sandstorm');
    _pw(preloadWeatherFogDiagonalSprites(), 'fogDiag');
    _pw(preloadWeatherSnowSprites(), 'snow');
    _pw(preloadWeatherBubbleSprites(), 'bubbles');
    _pw(preloadWeatherRainSprites(), 'rain');
    // ADAPTATION port (async assets) : précharge OBJ_EVENT_GFX_BOY_1 dans le cache PNG pour
    // que `SpawnCameraObject` (special SYNC, field_specials.ts) puisse spawner l'object event
    // CAMERA (BOY_1 invisible) sans await — la décomp charge le gfx depuis la ROM en SYNC. Le
    // pack des maps légendaires (Sootopolis/SkyPillar climax) n'inclut pas BOY_1 → sans ça le
    // travelling caméra scripté serait skippé. Cache-only (aucune alloc VRAM/palette). Règle 3.
    void PreloadObjectEventGraphics('OBJ_EVENT_GFX_BOY_1')
      .catch((e) => console.error('[camera-object] préchargement OBJ_EVENT_GFX_BOY_1', e));
    // ⚠️ StartWeather() + readyForInit + DoCurrentWeather() sont posés APRÈS SpawnObjectEventsOnMap
    // (ordre décomp ResumeMap : objets d'abord). Avant, StartWeather tournait ICI (avant le spawn)
    // → la palette météo (AllocSpritePalette) prenait un slot OBJ bas que les object events
    // CLOBBAIENT ensuite (météo rendait rose ; l'ash survivait car monochrome-blanc). En le
    // plaçant après le spawn, la météo prend un slot OBJ LIBRE (au-dessus des objets) → plus de
    // clobber. Cf. [[chantier-palslot-object-event-palettes]].

    // 1:1 décomp `SetUpFieldTasks()` (overworld.c:2149, appelé par ResumeMap juste
    // après InstallCameraPanAheadCallback:2139). Crée la task persistante
    // `Task_RunPerStepCallback` (idempotent via FuncIsActiveTask) qui dispatch les
    // per-step callbacks (cendres Route 113, ponts, glace…) CHAQUE FRAME via RunTasks.
    SetUpFieldTasks();
    // NB : RunOnResumeMapScript (overworld.c:2150) est appelé PLUS BAS, après que
    // `loadMapScripts` (async) ait peuplé _scriptsByLabel — sinon le script ON_RESUME
    // (ex. Route113_OnResume = setstepcallback STEP_CB_ASH) est introuvable. Cf. infra
    // juste après RunOnTransitionMapScript.

    // 1:1 décomp `DrawWholeMapView` (field_camera.c:94-98) — no args,
    // lit `gSaveBlock1Ptr->pos.x/y` (= `_camPos` côté TS) + gMapHeader.mapLayout
    // internally. À ce point, _camPos a été setté par SetCameraTopLeftCoords()
    // depuis InitPlayerAvatar → cohérent avec gPlayerAvatar.
    clearOverworldTilemaps();
    DrawWholeMapView();
    flushOverworldTilemaps(this.rt);
    // [M3-C3.2c] Rafraîchit gSpriteCoordOffset.x/y pour la NOUVELLE map (1:1 décomp
    // UpdateCameraPanning, field_camera.c:456). Symétrique de FieldUpdateBgTilemapScroll
    // (qui rafraîchit le BG). Sans ça, pendant le fade-in météo du 1er warp (où
    // warpInProgress=true → le body early-return → UpdateCameraPanning ne tourne pas),
    // gSpriteCoordOffsetY restait PÉRIMÉ depuis la map précédente (ex. -24 après un
    // walk-up dans la porte qui a accumulé totY=16) → le sprite joueur (coords-monde
    // depuis C2) rendait 1 tuile trop bas alors que le BG était correct = desync de
    // quelques frames à l'entrée, qui se corrigeait au 1er UpdateCameraPanning post-fade.
    UpdateCameraPanning();
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
    void import('../../src/rotating_gate').then(m => m.RotatingGate_InitPuzzle());

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
    // 1:1 décomp `SetSavedWeatherFromCurrMapHeader()` (overworld.c:803/854, JUSTE AVANT
    // RunOnTransitionMapScript). Pose la météo SAUVEGARDÉE = celle par défaut du header de la
    // NOUVELLE map → RESET la météo entre maps (sinon la cendre de Route 113 PERSISTE sur
    // Littleroot). OnTransition (ci-dessous) peut ensuite l'override (ex. Route113 → ash).
    SetSavedWeatherFromCurrMapHeader();
    // 1:1 décomp `SetDefaultFlashLevel()` (overworld.c:805, juste avant
    // RunOnTransitionMapScript) : une grotte (cave) sans CS Flash s'affiche en
    // pénombre (gSaveBlock1->flashLevel = 7 → cercle WIN0 armé plus bas par
    // InitCurrentFlashLevelScanlineEffect). OnTransition peut override via setflashlevel.
    SetDefaultFlashLevel();
    RunOnTransitionMapScript();

    // 1:1 décomp `RunOnResumeMapScript()` (overworld.c:2150, ResumeMap). Ici (et pas
    // près de SetUpFieldTasks) car `loadMapScripts` (await Promise.all plus haut) a
    // peuplé _scriptsByLabel → le script MAP_SCRIPT_ON_RESUME est trouvable. Ex. Route 113
    // `Route113_OnResume = setstepcallback STEP_CB_ASH` → ACTIVE le per-step callback de
    // l'ash grass (footprints en marchant). Sans ça la table sPerStepCallbacks reste sur
    // DUMMY → « les herbes ne réagissent pas ». La task per-step existe déjà (SetUpFieldTasks
    // plus haut). Était implémenté mais non câblé (dette R3).
    RunOnResumeMapScript();

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
      // FIX piste-3 (AUDIT-CS-PC bug 3 — sprite Plongée corrompu à la transition) : le préchargement
      // du gfx MONTÉ (surf/underwater) est sauté par le gate !returnToField (:1180). Au RETOUR d'un
      // combat/menu SUR la map sous-marine, SpawnObjectEventsOnReturnToField re-dérive l'état monté via
      // ObjectEventSetGraphicsId(persistedPlayerGfxId) ; si le PNG underwater n'est PAS caché, celui-ci
      // BAIL (« PNG non préchargé ») → l'avatar garde l'ANCIEN gfx (surf/normal) AVEC l'OAM underwater =
      // sprite corrompu. On précharge le gfx persisté monté AVANT le spawn (idempotent ; le NORMAL passe
      // par la feuille réservée, pas de PNG → on ne précharge que les états montés). Le décomp a la ROM
      // toujours chargée → pas ce besoin. .catch = Règle 3 (hurle si le fetch échoue).
      if (persistedPlayerGfxId && persistedPlayerGfxId !== GetPlayerAvatarGraphicsIdByStateId(0)) {
        await PreloadObjectEventGraphics(persistedPlayerGfxId)
          .catch((e) => console.error('[loadAndInitMap] preload gfx persisté monté (returnToField surf/underwater)', e));
      }
      // FIX (Bug 2a) : passe le graphicsId PERSISTÉ (surf/underwater) snapshotté avant
      // InitPlayerAvatar (qui l'a clobberé) → re-dérivation 1:1 de l'état monté du joueur.
      await SpawnObjectEventsOnReturnToField(this.rt, persistedPlayerGfxId);
    }

    // 1:1 décomp PALSLOT : réserve [0, OBJ_PALSLOT_COUNT=12) pour les object events (qui ont
    // chargé leurs palettes dans des slots FIXES [0,11] marqués via PatchObjectEventPalette).
    // → StartWeather/AllocSpritePalette n'alloue plus que dans [12,16) (field effects + météo),
    // DISJOINT des objets → la palette météo n'est JAMAIS clobbée par un object event (même si
    // le spawn charge en async). C'est le fix timing-proof de la météo à sprites (cf.
    // [[chantier-palslot-object-event-palettes]]). Le joueur (slot 0) reste dans la zone réservée.
    setReservedSpritePaletteCount(OBJ_PALSLOT_COUNT);

    // 1:1 décomp ordre ResumeMap (overworld.c:2146) : StartWeather APRÈS le spawn des object
    // events. La palette météo (AllocSpritePalette/PALTAG_WEATHER) prend un slot dans [12,16).
    // preloadWeatherFogPalette (démarré plus haut) a eu le temps de finir → palette fog chargée.
    // readyForInit : notre fade n'appelle pas FadeScreen → posé ici (sinon Task_WeatherInit ne
    // passe jamais à Task_WeatherMain). Dette : fade-in via game FadeScreen. DoCurrentWeather
    // (overworld.c:818) APPLIQUE la météo sauvegardée → SetNextWeather → transition (cendre).
    StartWeather();
    gWeatherPtr.readyForInit = true;
    DoCurrentWeather();

    // Réserve les 2 palettes générales de field effect (GENERAL_0/GENERAL_1) dans [12,16)
    // JUSTE APRÈS la météo (qui a pris son slot) et AVANT tous les autres préchargements de
    // field effects. Sans ça, GENERAL_0 (poussière de saut, splash, feet-in-flowing-water)
    // était demandé après saturation de [12,16) → paletteBank=255 → rendu NOIR. Cf.
    // field_effect_helpers.ts:preloadGeneralFieldEffectPalettes + [[diag-glitches-2026-06-18]].
    await preloadGeneralFieldEffectPalettes(this.rt);

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
    // palette des emote icons (!?♥, game/trainer_see.ts) utilisés par les movement
    // actions `emote_exclamation_mark` / `emote_question_mark` / `emote_heart`.
    // Idempotent ; les sprites actifs s'auto-détruisent (FieldEffectStop sur animEnded).
    await preloadEmoteIcons(this.rt);
    // Tall grass (FLDEFF_TALL_GRASS) : assets seuls (migré game/field_effect_helpers.ts,
    // callback-driven via le dispatcher).
    await preloadTallGrassEffect(this.rt);
    // Sparkle (FLDEFF_BERRY_TREE_GROWTH_SPARKLE + FLDEFF_SPARKLE) : assets seuls (one-shot
    // auto-despawn via callback, migrés game/field_effect_helpers.ts).
    await preloadSparkleEffect(this.rt);
    // Jump dust (FLDEFF_DUST) : préchargé via preloadJumpImpactEffects (entrée JUMP_CFG, migré au miroir).
    // Ondulations d'eau (FLDEFF_RIPPLE) : assets seulement (one-shot auto-despawn).
    await preloadRippleEffect(this.rt);
    // Herbe haute (FLDEFF_LONG_GRASS) : assets seulement (sprite.callback, migré au miroir).
    await preloadLongGrassEffect(this.rt);
    // Herbe basse (FLDEFF_SHORT_GRASS) assets + pool.
    await preloadShortGrassEffect(this.rt);
    // Coupe-herbe (FLDEFF_CUT_GRASS) : sprites rotatifs + palette (fldeff_cut.ts). Assets seulement —
    // spawn dynamique à la Coupe party-menu sur herbe haute (FldEff_CutGrass).
    await preloadCutGrassEffect(this.rt);
    // Effets d'impact de saut (jump tall/long grass + jump small/big splash) assets + pool.
    await preloadJumpImpactEffects(this.rt);
    // Splash + feet-in-flowing-water (FLDEFF_SPLASH/FEET) : assets seulement (sprite.callback).
    await preloadSplashEffect(this.rt);
    // Empreintes/traces (sand/deep footprints + bike tire tracks) : assets seulement (migré au miroir).
    await preloadFootprintsEffects(this.rt);
    // Sand pile : assets seulement (le sprite.callback s'auto-détruit, pas de pool à reset).
    await preloadSandPileEffect(this.rt);
    // Hot springs water (Lavaridge) : assets seulement (le sprite.callback s'auto-détruit).
    await preloadHotSpringsEffect(this.rt);
    // Bubbles (colonne de bulles sur algues en plongée) : assets seulement (one-shot auto-despawn).
    await preloadBubblesEffect(this.rt);
    // Ash (nuage de cendre + révèle la tuile ashgrass, Route 113) : assets seulement (sprite.callback).
    await preloadAshEffect(this.rt);
    // Ash puff/launch (geyser + bouffée de cendre du Gymnase de Lavaridge) : assets seuls (sprite.callback
    // s'auto-détruit). Débloque FLDEFF_ASH_PUFF/LAUNCH (warps Lavaridge B1F/1F).
    await preloadAshLaunchPuffEffect(this.rt);
    // Surf blob (monture de surf qui suit le joueur + bobbing) : assets seuls (migré au miroir).
    await preloadSurfBlobEffect(this.rt);
    // Disguises (tree/mountain/sand recouvrant le joueur déguisé) : assets seuls (migrés
    // game/field_effect_helpers.ts, callback-driven via le dispatcher).
    await preloadDisguiseEffects(this.rt);
    // 1:1 décomp `FldEff_Shadow` (migré game/field_effect_helpers.ts) : l'ombre de saut
    // spawn DYNAMIQUEMENT au ledge/acro jump (DoShadowFieldEffect) et despawn au jump end
    // (hasShadow=FALSE → UpdateShadowFieldEffect). Pas de spawn permanent — preload assets only.
    await preloadShadowEffect(this.rt);
    // PokéCenter heal (pokéballs montent + glow palette + moniteur) : assets seuls (migrés
    // game/field_effect_helpers.ts). Déclenché par `dofieldeffect FLDEFF_POKECENTER_HEAL` du
    // script nurse → débloque le soin (waitfieldeffect ne gèle plus).
    await preloadPokecenterHealEffect(this.rt);
    // Hall of Fame record (pokéballs montent + 5 moniteurs muraux clignotent) : assets moniteurs +
    // réutilise pokeball_glow. Déclenché par `dofieldeffect 62` du script EverGrandeCity_HallOfFame
    // → débloque le Panthéon (waitfieldeffect 62 ne gèle plus AVANT GameClear).
    await preloadHallOfFameRecordEffect(this.rt);
    // Field Move Show Mon (anim partagée des CS : bannière de stries + le mon glisse + cri) :
    // assets streaks OUTDOORS seuls. Déclenché par `FieldEffectStart(FLDEFF_FIELD_MOVE_SHOW_MON_INIT)`
    // depuis Surf/Cut/Fly/Strength/Waterfall/Dive (ces effets l'attendaient dans la liste active).
    await preloadFieldMoveShowMonEffect(this.rt);
    InitFieldMessageBox();
    ScriptContext_Init();

    // 1:1 décomp `Overworld_PlaySpecialMapMusic()` à l'entrée de map
    // (field_screen_effect.c:128). La résolution (header.music, savedMusic,
    // underwater, surf) + le dedup « même musique → pas de restart » (guard
    // `music != GetCurrentMapMusic()`, overworld.c:1156) vivent au foyer
    // src/overworld.ts ; le play réel part au tick MapMusicMain (sound.c:64).
    // 🐛 fix 2026-07-02 (évolution bug 4) : remplace le tracker maison
    // `_currentMapBgmId` + PlayBGM direct — il court-circuitait sCurrentMapMusic,
    // donc Overworld_PlaySpecialMapMusic ne savait jamais quoi relancer.
    Overworld_PlaySpecialMapMusic();

    // 1:1 décomp `InitOverworldGraphicsRegisters` (overworld.c:2096, state 4 de
    // LoadMapInStepsLocal) — rallume l'affichage (DISPCNT OW : OBJ + WIN0/1 +
    // OBJ_1D_MAP + HBLANK_INTERVAL) maintenant que le BG buffer est ré-écrit
    // (DrawWholeMapView), les NPCs spawnés + sync (UpdateObjectEvents) et la palette
    // prête (LoadMapTilesetPalettes). POSE AUSSI tous les registres GPU OW (MOSAIC=0,
    // fenêtres plein-écran, blend OW 2e-cible no-op) + (ré)active les 4 BG (ShowBg)
    // + config BG (InitOverworldBgs). C'est ce qui ÉCRASE l'état WIN/BLD/MOSAIC laissé
    // par l'écran précédent (intro/titre) → plus besoin des clears ad-hoc en
    // transitionToOverworld (l'ombre de la fenêtre de dialogue disparaît proprement).
    //
    // 1:1 décomp `InitViewGraphics` (overworld.c:2088) : InitCurrentFlashLevelScanline
    // Effect() PUIS InitOverworldGraphicsRegisters(). Le 1er arme la fenêtre WIN0
    // par-scanline de la pénombre de grotte (si gSaveBlock1->flashLevel != 0, posé par
    // SetDefaultFlashLevel ci-dessus) — remplace l'ex-rustine flash-mask.ts.
    InitCurrentFlashLevelScanlineEffect();
    InitOverworldGraphicsRegisters();

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
      // warpInProgress = false : ScriptMovement_MoveObjects tick = applymovement avance.
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
        // [M3-C3.2c] 1:1 STRICT décomp `Task_DoDoorWarp` case 1 (field_screen_effect.c:699)
        // via le mécanisme forceMovement : la scène pose forceMovement=DIR_NORTH, PlayerStep
        // (controls locked depuis executeWarp:1281) exécute le held WALK_NORMAL_UP
        // (ObjectEventSetHeldMovement) → worldY avance via _NpcTakeStep → le CameraObject
        // suit. La scène attend forceMovement===DIR_NONE (posé au step end). Remplace
        // l'ancien applyMovement (path _queues legacy = driver caméra mort, ne faisait
        // plus avancer worldY → desync joueur/porte signalé par le user).
        gPlayerAvatar.forceMovement = DIR_NORTH;
        await this.waitForForceMovementDone();
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
      // 1:1 décomp `Do*Warp` (field_screen_effect.c:484/495/505/549/559…) :
      // SetupWarp a posé sWarpDestination AVANT ; puis TryFadeOutOldMapMusic
      // compare la musique de la dest à la courante et lance
      // FadeOutMapMusic(GetMapMusicFadeoutSpeed()) si elles diffèrent.
      // Port : résout la dest (MAP_DYNAMIC sync via GetDynamicWarp) + pré-charge
      // le header dest (la décomp lit gMapGroups en ROM = sync ; chez nous le
      // JSON doit être en cache pour GetLocationMusic/GetMapMusicFadeoutSpeed),
      // puis pose sWarpDestination (overworld.ts).
      {
        let musicDestMapId = warp.destMap;
        if (musicDestMapId === 'MAP_DYNAMIC')
          musicDestMapId = GetDynamicWarp()?.mapId ?? musicDestMapId;
        if (musicDestMapId !== 'MAP_DYNAMIC') {
          try {
            await loadMapHeader(musicDestMapId);
          } catch (e) {
            console.warn(`[executeWarp] préchargement header dest '${musicDestMapId}' KO :`, e);
          }
          if (warp.destMap === 'MAP_DYNAMIC') {
            // 1:1 SetWarpDestinationToDynamicWarp (overworld.c:653) : copie le
            // dynamicWarp ENTIER dans sWarpDestination (warpId/x/y du
            // dynamicWarp, PAS ceux du warp event).
            const dw = GetDynamicWarp();
            SetWarpDestinationFromMapName(musicDestMapId, -1, dw?.x ?? -1, dw?.y ?? -1);
          } else {
            // 1:1 ScrCmd_warp (scrcmd.c:739) : warpId encodé u8 dans le
            // byte-stream (WARP_ID_NONE = 0xFF) → cast s8 comme la décomp.
            // Puis SetupWarp (field_control_avatar.c:817) : warpId valide →
            // SetWarpDestinationToMapWarp(group, num, warpId) = x/y -1 ;
            // warpsilent/coords explicites (warpId < 0) → coords transmises.
            const warpIdS8 = (warp.warpId << 24) >> 24;
            if (warpIdS8 >= 0)
              SetWarpDestinationFromMapName(musicDestMapId, warpIdS8, -1, -1);
            else
              SetWarpDestinationFromMapName(musicDestMapId, warpIdS8, warp.x, warp.y);
            // 1:1 décomp `SetupWarp` (field_control_avatar.c:826) : juste après
            // SetWarpDestinationToMapWarp (branche map-warp, PAS dynamic), mémorise
            // l'entrée pour la Corde Sortie / Tunnel. Ne fait quelque chose que sur une
            // transition OUTDOOR→INDOOR. `pos` = LOGIQUE côté port → +MAP_OFFSET pour
            // reconstituer les coords INTERNES attendues par UpdateEscapeWarp.
            // Exclu 'fly' (Task_UseFly ne passe pas par SetupWarp dans le décomp).
            if (kind !== 'fly')
              UpdateEscapeWarp(gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
          }
        }
        TryFadeOutOldMapMusic();
      }
      if (kind === 'fly') {
        // 1:1 `Task_UseFly` (field_effect.c:1370-1377) : l'écran est DÉJÀ noir —
        // WarpFadeOutScreen a été joué PAR le FLDEFF_USE_FLY (FlyOutFieldEffect_
        // WaitFlyOff) et FlyOutFieldEffect_End gate !gPaletteFade.active. Le décomp
        // warpe CUT sous le noir (WarpIntoMap + CB2_LoadMap immédiats) — re-lancer
        // BeginNormalPaletteFade repartirait des couleurs PLEINES → flash + double
        // fade-out (bug film user 2026-07-17, frames 4.06→4.69s). On garantit juste
        // le noir (idempotent).
        FillPalBufferBlack();
        this.rt.gPlttBufferFaded.flushTo();
      } else {
        // 1:1 `WarpFadeOutScreen` (field_screen_effect.c:100) : fondu vers BLANC si on
        // ENTRE dans une grotte (GetMapPairFadeToType(currentType, destType) = isEnter),
        // sinon vers NOIR. sWarpDestination a été posée juste au-dessus (Phase 2).
        const fadeToWhite = GetMapPairFadeToType(GetCurrentMapType(), GetDestinationWarpMapType());
        this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, fadeToWhite ? 'RGB_WHITE' : 'RGB_BLACK');
      }
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
      // 1:1 décomp `Task_WarpAndLoadMap` case 1 (field_screen_effect.c:657-667) :
      // attend `!PaletteFadeActive() && BGMusicStopped()` avant WarpIntoMap →
      // le fade-out musique (TryFadeOutOldMapMusic) se termine AVANT le load.
      // Garde-fou harness (pas décomp) : cap 10 s — le fade m4a court sur un
      // setInterval wall-clock ; si l'audio est bloqué par le navigateur
      // (autoplay policy), on ne gèle pas les warps pour autant.
      {
        const bgmWaitStart = performance.now();
        while (!BGMusicStopped()) {
          if (performance.now() - bgmWaitStart > 10000) {
            console.warn('[executeWarp] BGMusicStopped timeout (10 s) — on continue');
            break;
          }
          await new Promise<void>((r) => setTimeout(r, 17));
        }
      }

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
      // 1:1 décomp `Task_WarpAndLoadMap` case 2 → `WarpIntoMap()` →
      // `ApplyCurrentWarp()` (overworld.c:540) : gLastUsedWarp = location ;
      // location = sWarpDestination (group/num RÉELS — consommés par
      // GetCurrLocationDefaultMusic/GetWarpDestinationMusic/NoMusicInSootopolis…).
      // sWarpDestination a été posée en Phase 2 (y compris MAP_DYNAMIC résolue).
      ApplyCurrentWarp();
      const destHeader = await this.loadAndInitMap(destMapId, destX, destY, destDir);
      console.log(`[executeWarp] loaded ${destHeader.id}, player at (${destX},${destY}) facing=${destDir}`);

      // 1:1 `WarpFadeInScreen` (field_screen_effect.c:74) : fondu depuis BLANC si on
      // SORT d'une grotte (GetMapPairFadeFromType(prevType, currentType) = isExit),
      // sinon depuis NOIR. Calculé APRÈS ApplyCurrentWarp (gLastUsedWarp = source,
      // location = dest) + loadAndInitMap (header dest en cache → GetMapTypeByGroupAndId
      // résout). Sert les 3 sites de masquage/fade-in ci-dessous.
      const warpFadeFromWhite = GetMapPairFadeFromType(GetLastUsedWarpMapType(), GetCurrentMapType());
      const _warpFadeInColor: 'RGB_WHITE' | 'RGB_BLACK' = warpFadeFromWhite ? 'RGB_WHITE' : 'RGB_BLACK';
      const _warpFillFadeIn = (): void => { if (warpFadeFromWhite) FillPalBufferWhite(); else FillPalBufferBlack(); };

      // ─── Anti-flash : re-masquer NOIR AVANT les await de Pre-Phase 4 ────────
      // `loadAndInitMap` → LoadMapTilesetPalettes a flushTo() les NEW colors en
      // VRAM (push direct qui bypass `bufferTransferDisabled`, cf. Phase 3). Les
      // await de Pre-Phase 4 (surtout `FieldSetDoorOpened`, plusieurs frames au
      // cache-froid) rendent alors des frames NON-masquées : tileset NEW +
      // palette transitoire = "magenta + tiles bizarres" (glitch user warp
      // intérieur, [[warp-stale-camera-glitch]]). La décomp garde l'écran NOIR
      // pendant TOUT le load (WarpFadeOut → WarpFadeIn) ; notre load étant async,
      // on re-pose BLACK/WHITE ici — avant tout await — pour tenir le même invariant
      // (WHITE si sortie de grotte, cf. warpFadeFromWhite ci-dessus).
      // `FillPalBufferBlack/White` + flushTo déjà utilisés en Phase 4 (même précédent).
      _warpFillFadeIn();
      this.rt.gPlttBufferFaded.flushTo();

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
      // kind 'fly' (Task_UseFly, field_effect.c:1374) : l'arrivée n'est PAS un exit
      // metatile — c'est gFieldCallback = FieldCallback_FlyIntoMap (l'oiseau dépose
      // le joueur), joué en Phase 5 ci-dessous à la place de l'exit-task.
      // kind 'fall' (DoFallWarp, field_screen_effect.c:522) : l'arrivée n'est PAS un
      // exit metatile — c'est gFieldCallback = FieldCB_FallWarpExit (le joueur tombe du
      // haut de l'écran + secousse caméra), joué en Phase 5 ci-dessous à la place de
      // l'exit-task. Même traitement que 'fly'.
      // kind 'aqua_teleport' (DoTeleportTileWarp, field_screen_effect.c:549) : arrivée =
      // gFieldCallback = FieldCB_SpinEnterWarp (le joueur descend en tournoyant), jouée en
      // Phase 5. Même traitement que 'fly'/'fall'.
      const exitKind: ReturnType<typeof getExitTaskKindFor> | 'fly' | 'fall' | 'spin_enter' =
        kind === 'fly' ? 'fly'
        : kind === 'fall' ? 'fall'
        : kind === 'aqua_teleport' ? 'spin_enter'
        : getExitTaskKindFor(postWarpBehavior);
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
      // 1:1 `FieldCallback_FlyIntoMap` (field_effect.c:1382-1387) : le joueur est
      // INVISIBLE avant le fade-in (l'oiseau le fera réapparaître) + NPCs gelés.
      // Posé ici (avant Phase 4) pour que le fade-in ne montre jamais le joueur —
      // même geste que door/non_anim ci-dessus. + hide du SPRITE direct : le freeze
      // gèle le resync slot→sprite (UpdateObjectEvents skip frozen) → poser le slot
      // seul laisse le sprite visible pendant le fade-in (bug film user, frame 5.31s).
      // Idem 'fall' : FallWarpEffect_Init (field_effect.c:1442) rend le joueur
      // invisible sur son 1er tick, mais on le masque dès AVANT le fade-in pour qu'il
      // n'apparaisse jamais debout sur la tuile d'atterrissage (il doit tomber du haut).
      if (exitKind === 'fly' || exitKind === 'fall') {
        SetPlayerVisibility(this.rt, false);
        const _ps = this.rt.gSprites[gPlayerAvatar.spriteId];
        if (_ps) _ps.invisible = true;
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
      // WHITE si sortie de grotte (1:1 WarpFadeInScreen case 1, cf. warpFadeFromWhite).
      _warpFillFadeIn();
      // Force flush BLACK/WHITE au PLTT register IMMEDIATELY pour overrider le push
      // de NEW colors fait par loadAndInitMap (= flushTo() à la fin de
      // LoadMapTilesetPalettes). Sans ça, écran montre 1 frame full-color avant
      // que le fade in commence à blender vers BLACK → flash visible.
      this.rt.gPlttBufferFaded.flushTo();
      // 1:1 décomp gate release : maintenant que PaletteBanks contient BLACK
      // (= FillPalBufferBlack + flushTo), on rouvre l'auto-flushTo VBlank pour
      // que le fade-in tick (= UpdatePaletteFade) push les couleurs interpolées.
      this.rt.gPaletteFade.bufferTransferDisabled = false;
      this.rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, _warpFadeInColor);
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
        // [M3-C3.2c] 1:1 STRICT décomp `Task_ExitDoor` case 1 (field_screen_effect.c:338) :
        // ObjectEventSetHeldMovement(player, WALK_NORMAL_DOWN) via forceMovement → held
        // movement avance worldY (_NpcTakeStep) → le CameraObject suit. La scène attend
        // forceMovement===DIR_NONE. (adjustedDir = DIR_SOUTH pour une door, cf. GetAdjusted
        // InitialDirection.) Remplace l'applyMovement legacy (driver mort → desync).
        gPlayerAvatar.forceMovement = adjustedDir;
        await this.waitForForceMovementDone();
        // case 2 : FieldAnimateDoorClose à la door position originale +
        // ObjectEventClearHeldMovementIfFinished (= le held movement est déjà
        // clear par ScriptMovement quand l'action courante est finie).
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
        // [M3-C3.2c] 1:1 STRICT décomp `Task_ExitNonAnimDoor` case 1 (field_screen_effect.c:386) :
        // ObjectEventSetHeldMovement(player, GetWalkNormalMovementAction(facing)) via forceMovement.
        gPlayerAvatar.forceMovement = adjustedDir;
        await this.waitForForceMovementDone();
        // case 2 : IsPlayerStandingStill → case 3 UnfreezeObjectEvents.
        UnfreezeObjectEvents();
      }
      // 1:1 arrivée VOL (kind 'fly') : gFieldCallback = FieldCallback_FlyIntoMap —
      // posée par Task_UseFly dans le décomp, jouée ICI par la scène (= le
      // RunFieldCallback post-CB2_LoadMap, à l'abri du clobber warp-exit).
      // Task_FlyIntoMap (gTasks, gate fade+asset) lance FLDEFF_FLY_IN : l'oiseau
      // descend, dépose le joueur (le rend visible) ; unlock/unfreeze à la FIN.
      else if (exitKind === 'fly') {
        FieldCallback_FlyIntoMap();
      }
      // 1:1 arrivée FALL (kind 'fall') : gFieldCallback = FieldCB_FallWarpExit
      // (field_effect.c:1425) — posée par DoFallWarp, jouée ICI par la scène. Le
      // Task_FallWarpFieldEffect (gTasks) gate la météo puis fait tomber le joueur du
      // haut de l'écran + secousse caméra + landing ; unlock/unfreeze à la FIN
      // (FallWarpEffect_End). Comme 'fly', la scène ne touche pas au lock/visibilité
      // dans le finally (le task les possède).
      else if (exitKind === 'fall') {
        FieldCB_FallWarpExit();
      }
      // 1:1 arrivée TÉLÉPORT (kind 'aqua_teleport') : gFieldCallback = FieldCB_SpinEnterWarp
      // (field_screen_effect.c:298) — Task_SpinEnterWarp fait descendre le joueur en
      // tournoyant (DoPlayerSpinEntrance) puis unlock/unfreeze à la fin. Comme 'fly'/'fall',
      // la scène ne touche pas au lock/visibilité dans le finally (le task les possède).
      else if (exitKind === 'spin_enter') {
        FieldCB_SpinEnterWarp();
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
      // Toujours unlock + reset state — SAUF kind 'fly'/'fall' : le task d'arrivée
      // (Task_FlyIntoMap / Task_FallWarpFieldEffect, gTasks, async) possède le lock ET
      // la visibilité (1:1 : le joueur reste invisible jusqu'à la dépose par l'oiseau /
      // l'atterrissage ; unlock/unfreeze à la fin du FLDEFF).
      if (kind !== 'fly' && kind !== 'fall' && kind !== 'aqua_teleport') {
        UnlockPlayerFieldControls();
        SetPlayerVisibility(this.rt, true);
      }
      this.warpInProgress = false;
      gPlayerAvatar.forceMovement = DIR_NONE;  // cleanup safety.
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
      // 1:1 décomp : la décomp passe par ResumeMap aussi sur connexion → ON_RESUME tourne
      // (ex. Route113_OnResume = setstepcallback STEP_CB_ASH → réaction de l'ash grass en
      // marchant). Sans ça « les herbes ne réagissent pas » en entrant par une bordure.
      RunOnResumeMapScript();
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

    // ── FIX BUG « sprite joueur invisible quelques frames au cross-border » (1:1) ──
    // 1:1 STRICT décomp : `UpdateObjectEventsForCameraUpdate` (donc le shift des coords
    // `UpdateObjectEventCoordsForCameraUpdate`) s'exécute SYNCHRONE dans `CameraUpdate`,
    // MÊME FRAME que `CameraMove` (qui décale `gSaveBlock1Ptr.pos` du delta de connexion).
    // Notre port différait TOUT le bloc en async (gaté par `preloadNpcGraphicsForMap`) → sur
    // une map NON-CACHÉE, le shift des `currentCoords` du joueur arrivait ~2 frames après le
    // shift de `pos` → désync (cx ≠ px+MAP_OFFSET) → le joueur "hors-vue" était masqué (sprite
    // .invisible) jusqu'à ce que l'async tourne (« disparaît quelques frames avant de se
    // replacer »). Ce désync était auparavant masqué par `SyncPlayerObjectEvent` (retiré à
    // l'étape 1b-iii car redondant en marche normale, mais pas au cross-border). Fix : faire le
    // shift des coords SYNCHRONE ici (le joueur n'a pas besoin de graphics), et laisser SEUL le
    // spawn NPC (qui a besoin des PNGs) en async. On pose `gCamera.active = false` après le shift
    // pour que l'`UpdateObjectEventsForCameraUpdate` async skippe son re-shift (guard
    // `if (!gCamera.active) return` — seul lecteur de ce flag) → pas de double-décalage.
    UpdateObjectEventCoordsForCameraUpdate();  // shift currentCoords joueur + NPCs SYNCHRONE (1:1)
    gCamera.active = false;                    // empêche le re-shift dans le bloc async ci-dessous
    UpdateObjectEvents(this.rt);               // resync slot.invisible→sprite + positions, même frame

    // 1:1 décomp NPC orchestrator post-cross.
    // J — BUG FIX (2026-05-26) : sync preload BEFORE spawn. Avant : `void preloadNpcGraphicsForMap`
    // (= fire-and-forget async) + `UpdateObjectEventsForCameraUpdate` immediate → TrySpawn
    // appelait `_npcPngCache.get(pngPath)` qui returnait undefined (= preload pas fini) →
    // spawn skip silently → NPCs cross-map invisibles (= ex. ZIGZAGOON_1 absent sur
    // Route101 alors que PROF_BIRCH apparaît car son PNG est déjà cached depuis LittlerootTown).
    // Fix : await preload puis spawn dans le .then() callback. Le rest du handleConnection
    // (BGM, popup, etc.) continue immédiat — independent du spawn timing. Le shift des coords
    // ci-dessus a déjà tourné SYNCHRONE (gCamera.active=false → UpdateObjectEventsForCameraUpdate
    // ne re-shifte pas, ne fait que TrySpawnObjectEvents + RemoveObjectEventsOutsideView).
    void preloadNpcGraphicsForMap(newHeader).then(() => {
      // Re-check gMapHeader (= user n'a pas cross une autre border entretemps).
      const curHeader = (globalThis as Record<string, unknown>).gMapHeader as MapHeader | undefined;
      if (curHeader !== newHeader) return;
      UpdateObjectEventsForCameraUpdate(this.rt, pending.deltaX, pending.deltaY);
      UpdateObjectEvents(this.rt);
    });

    // 1:1 décomp `LoadMapFromCameraTransition` (overworld.c:788-794) :
    //   SetWarpDestination(mapGroup, mapNum, WARP_ID_NONE, -1, -1);
    //   if (gMapHeader.regionMapSectionId != MAPSEC_BATTLE_FRONTIER)
    //       TransitionMapMusic();
    //   ApplyCurrentWarp();
    // Au moment du check décomp, gMapHeader = l'ANCIENNE map (LoadCurrentMapData
    // arrive après) ; chez nous gMapHeader est déjà la nouvelle → on lit l'ancien
    // header via location (pas encore ApplyCurrentWarp). Les 2 maps BF Outside
    // West/East sont de toute façon toutes deux MAPSEC_BATTLE_FRONTIER.
    // TransitionMapMusic : fade-out + play différé si la musique de la nouvelle
    // map (= GetWarpDestinationMusic sur sWarpDestination) diffère (guards
    // ABNORMAL_WEATHER/underwater/surf/vélo).
    SetWarpDestinationFromMapName(newHeader.id, -1, -1, -1);
    const oldHeaderForMusic = Overworld_GetMapHeaderByGroupAndId(
      gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum,
    ) as { regionMapSectionId?: string | number };
    if (oldHeaderForMusic?.regionMapSectionId !== 'MAPSEC_BATTLE_FRONTIER')
      TransitionMapMusic();
    ApplyCurrentWarp();

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

  /** [M3-C3.2c] Attend la fin d'un forced movement (door warp). 1:1 décomp : la scène
   *  pose gPlayerAvatar.forceMovement = DIR_X, PlayerStep (locked) exécute le held
   *  WALK_NORMAL et reset forceMovement = DIR_NONE au step end. Poll ~17ms (1 frame). */
  private waitForForceMovementDone(): Promise<void> {
    return new Promise((resolve) => {
      const check = (): void => {
        if (gPlayerAvatar.forceMovement === DIR_NONE) {
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
