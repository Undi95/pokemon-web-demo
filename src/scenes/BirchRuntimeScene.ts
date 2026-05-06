/**
 * BirchRuntimeScene — host Phaser pour le flow Birch sur le runtime décomp natif.
 *
 * Pourquoi cette scène existe :
 *   La précédente `BirchSpeechScene.ts` était une réimplémentation Phaser parallèle
 *   (legacy) qui rendait Lotad via `Phaser.GameObjects.Image` et bypass donc
 *   complètement notre compositor + chaîne BlendPalette. Conséquence : flash
 *   release Lotad pas rose (= la palette pink du `BlendPalette` n'arrivait jamais
 *   au rendu Phaser direct).
 *
 *   Ici on fait tourner *intégralement* le flow Birch sur le runtime décomp natif
 *   transcrit (= main_menu-callbacks-auto.ts : `Task_NewGameBirchSpeech_Init`,
 *   `Task_NewGameBirchSpeechSub_InitPokeBall`, etc.) — exactement comme la ROM.
 *
 * Architecture (= 1:1 décomp src/main.c AgbMain) :
 *   - Phaser scene = juste l'HÔTE du canvas (renderer).
 *   - DecompRuntime + Gba + bridge = le moteur (CB2 + tasks + sprite anims + OAM).
 *   - tickFixed(deltaMs) à 60Hz = boucle décomp naturelle.
 *
 * Flow d'exécution :
 *   1. MainMenuScene NEW_GAME → scene.start('BirchRuntimeScene')
 *   2. BirchRuntimeScene.create() : init runtime + bridge + register sprite CBs
 *   3. bootBirch() : preload assets + InitKeys + reset state + enqueue
 *      Task_NewGameBirchSpeech_Init via CreateTask + SetMainCallback2(CB2_MainMenu)
 *   4. Le state machine décomp progresse seul :
 *        Init → WaitToShowBirch → Welcome → ThisIsAPokemon → MainSpeech
 *        → InitPokeBall (Lotad release !) → AndYouAre → SlidePlatformAway
 *        → StartPlayerFadeIn → BoyOrGirl → ChooseGender
 *        → WhatsYourName → StartNamingScreen → DoNamingScreen (= autre CB2)
 *        → CB2_NewGameBirchSpeech_ReturnFromNamingScreen → SoItsPlayerName
 *        → AreYouReady → ShrinkPlayer → FadePlayerToWhite → Cleanup
 *        → CB2_NewGame (= overworld welcome placeholder)
 *   5. Tout est piloté par `gTasks[].func` swap + `SetMainCallback2`.
 *
 * Cleanup : aucun, tout reste local à la scène. Le `scene.stop` Phaser libère
 * la texture canvas. Si l'utilisateur revient au menu, la scène est recréée.
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { DecompRuntime, InitKeys } from '../engine/decomp-runtime';
import { setGlobalRuntime, resetObjAllocations, loadSpeciesNamesAsync } from '../engine/decomp-globals';
import { exposeGbaGlobals } from '../engine/gba-global-scope';
import { preloadFontData } from '../engine/gba-text-system';
import { preloadBirchSpeechAssets } from '../engine/intro-asset-loader';
import { preloadTextWindowFrames } from '../engine/gba-text-window';
import {
  ResetBgsAndClearDma3BusyFlags,
  InitBgsFromTemplates,
  ResetPaletteFade,
  ResetTasks,
  FreeAllSpritePalettes,
  ScanlineEffect_Stop,
} from '../engine/decomp-globals';
import { sMainMenuBgTemplates } from '../engine/decomp-data/auto/src/main_menu-data';
import {
  Task_NewGameBirchSpeech_Init,
  SpriteCB_MovePlayerDownWhileShrinking,
  SpriteCB_Null,
  CB2_MainMenu,
} from '../engine/decomp-data/auto/src/main_menu-callbacks-auto';
import {
  REG_OFFSET_DISPCNT,
  DISPCNT_OBJ_ON, DISPCNT_OBJ_1D_MAP,
} from '../engine/decomp-runtime';
import { installEngineDevtools } from '../engine/engine-devtools';
import { installInputHandlers, setHeldKeysOverride } from '../engine/input-handler';

export class BirchRuntimeScene extends Phaser.Scene {
  private gba!: Gba;
  // Public pour devtools (= window.dev access).
  rt!: DecompRuntime;
  private bridge!: GbaPhaserBridge;
  private booted = false;

  constructor() { super({ key: 'BirchRuntimeScene' }); }

  create(): void {
    console.log('[BirchRuntime] create()');
    this.cameras.main.setBackgroundColor('#000000');

    // Engine GBA pixel-perfect + bridge Phaser.
    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'birch-runtime-frame');
    this.rt = new DecompRuntime(this.gba);

    // Wire le runtime singleton (utilisé par tous les helpers décomp côté
    // décomp-globals + auto callbacks via globalThis).
    setGlobalRuntime(this.rt);
    resetObjAllocations();
    exposeGbaGlobals();

    // 1:1 décomp src/main.c:99 AgbMain : InitKeys avant InitMainCallbacks.
    InitKeys(this.rt);

    // Sprite callbacks utilisés par le flow Birch (= seulement 2, le reste
    // est SpriteCB_Null). Sans ces enregistrements, CreateSprite retomberait
    // sur null → sprite statique au moment du shrink player.
    this.rt.spriteCallbacks.set('SpriteCB_MovePlayerDownWhileShrinking', SpriteCB_MovePlayerDownWhileShrinking);
    this.rt.spriteCallbacks.set('SpriteCB_Null', SpriteCB_Null);

    // Phaser image qui affiche le frame buffer GBA.
    const frameImg = this.add.image(0, 0, 'birch-runtime-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    // Skip vers TestGba (= debug) si ESC.
    this.input.keyboard?.on('keydown-ESC', () => {
      console.log('[BirchRuntime] ESC → TestGbaScene');
      this.scene.start('TestGbaScene');
    });

    // Real keyboard → rt.gMain.heldKeys via handler global partagé.
    // Cf. src/engine/input-handler.ts (= 1:1 décomp gMain.heldKeys canonical).
    installInputHandlers(this, this.rt);

    // Devtools (= window.dev) pour debug interactif via console / preview_eval.
    // Cf. src/engine/engine-devtools.ts mini doc en header. Le poll auto-pause
    // est appelé par DecompRuntime.runOneFrame (= pas besoin de hook scene-side).
    installEngineDevtools(this.rt, {
      setHeldKeys: (mask) => setHeldKeysOverride(this.rt, mask),
      sceneName: 'BirchRuntimeScene',
    });

    // Boot async : preload assets + enqueue Task_NewGameBirchSpeech_Init.
    void this.bootBirch();
  }

  private async bootBirch(): Promise<void> {
    try {
      // 1. Strings FR (= gText_Birch_Welcome, gText_ThisIsAPokemon, etc.)
      const { initStringsFromDecomp } = await import('../engine/gba-strings');
      await initStringsFromDecomp();

      // 2. Side-effect import : naming-screen-impl pose DoNamingScreen +
      //    CB2_LoadNamingScreen + naming screen helpers sur globalThis. Sans ce
      //    import, Task_NewGameBirchSpeech_StartNamingScreen → DoNamingScreen
      //    serait undefined (cf. globalThis dispatch).
      await import('../engine/naming-screen-impl');

      // 3. Side-effect import : main-menu-impl pose AddBirchSpeechObjects,
      //    NewGameBirchSpeech_StartFadeInTarget1OutTarget2, etc. sur globalThis.
      await import('../engine/main-menu-impl');

      // 4. Side-effect import : pokeball-effects pose LaunchBallFadeMonTask +
      //    SetUpForReleaseAffineAnim (= release Lotad sequence).
      await import('../engine/pokeball-effects');

      // 5. Assets : Birch sprite, Lotad anim_front 2-frame, pokeball, particles,
      //    BG tilemap shadow, palettes bg0/bg1/bg2 gradient, trainer pics.
      //    + text window frames (= sTextWindowFrame_Gfx/Pal) + gMessageBox_Gfx
      //    pour les borders dialogue (sans ça, NewGameBirchSpeech_ShowDialogueWindow
      //    rendrait des bordures invisibles).
      await preloadFontData();
      await preloadTextWindowFrames();
      await preloadBirchSpeechAssets();

      // 6. Cris : map species → cri filename (sans ça, PlayCryInternal(SPECIES_LOTAD)
      //    pour le release ball ne pourrait pas résoudre le fichier audio).
      //    NOTE : import STATIC en haut du fichier (pas dynamic !) pour éviter le
      //    "two module instances" de Vite qui cause assetCache split en cache vide
      //    + cache plein selon le path d'import (cf. dyn vs static warning au build).
      await loadSpeciesNamesAsync();

      // 7. Init BG layers via sMainMenuBgTemplates AVANT que le task lance.
      //    1:1 décomp : Task_NewGameBirchSpeech_Init suppose que la main menu
      //    avait déjà set up BG0 (charBase=2,mapBase=30) + BG1 (charBase=0,
      //    mapBase=7). Le task lui-même ne fait que `InitBgFromTemplate(
      //    &sBirchBgTemplate)` qui override BG0 (charBase=3,mapBase=30).
      //    Critique : sans ça, BG1 reste défaut → tilemap chargé à
      //    BG_SCREEN_ADDR(7)=offset 0x3800 ne s'affiche pas (BG1 lit ailleurs).
      //    Cf. main_menu.c:413-432 sMainMenuBgTemplates + main_menu.c:434-442
      //    sBirchBgTemplate.
      ResetBgsAndClearDma3BusyFlags(0);
      this.rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);
      this.rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
      InitBgsFromTemplates(0, sMainMenuBgTemplates as any, sMainMenuBgTemplates.length);
      ScanlineEffect_Stop();
      ResetTasks();
      ResetPaletteFade();
      FreeAllSpritePalettes();

      // 8. SetVBlankCallback : critique pour activer le pipeline TransferPlttBuffer
      //    (= flush gPlttBufferFaded → gba.palette à chaque frame). Sans cela,
      //    LoadPalette modifie le buffer mais l'ARM7 hardware (= compositor cache
      //    objRgba/bgRgba) reste sur les anciennes couleurs (= BLACK initial du
      //    DmaClear16). 1:1 décomp main_menu.c:609 InitMainMenu pose
      //    SetVBlankCallback(VBlankCB_MainMenu) avant CreateTask.
      const _VBlankCB_Birch: () => void = () => { /* no-op marker pour activer transfer */ };
      this.rt.SetVBlankCallback(_VBlankCB_Birch);

      // 9. Run Birch flow : créer le task initial + set CB2 standard MainMenu
      //    (= RunTasks + AnimateSprites + BuildOamBuffer + UpdatePaletteFade).
      //    Task_NewGameBirchSpeech_Init s'occupe du reste : InitBgFromTemplate(
      //    &sBirchBgTemplate), LZ77 shadow gfx + BG map, LoadPalette,
      //    AddBirchSpeechObjects, BeginNormalPaletteFade, PlayBGM, ShowBg.
      this.rt.SetMainCallback2(CB2_MainMenu);
      this.rt.CreateTask((t) => Task_NewGameBirchSpeech_Init(t, this.rt), 0);

      this.booted = true;
      console.log('[BirchRuntime] boot done — Task_NewGameBirchSpeech_Init enqueued');
    } catch (e) {
      console.error('[BirchRuntime] bootBirch failed:', e);
    }
  }

  update(_: number, deltaMs: number): void {
    if (!this.rt || !this.booted) return;
    // Input → rt.gMain.heldKeys est déjà sync via input-handler.ts global.
    try {
      this.rt.tickFixed(deltaMs);
    } catch (e) {
      console.error('[BirchRuntime.update] tickFixed THREW:', e);
    }
    // Note : le poll auto-pause (= dev.pauseAt) est désormais appelé par
    // DecompRuntime.runOneFrame (= one place pour toute scene). Ex-hook
    // __birchPauseCondition retiré.
    try {
      this.bridge.tick();
    } catch (e) {
      console.error('[BirchRuntime.update] bridge.tick THREW:', e);
    }
  }

  // Note : input handling moved to src/engine/input-handler.ts (= shared
  // entre toutes les scenes runtime, écrit directement dans rt.gMain.heldKeys).
}
