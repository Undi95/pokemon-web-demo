/**
 * GameScene — host unique de la "ROM" Pokemon Émeraude.
 *
 * 1:1 décomp `AgbMain` (src/main.c) :
 *   while (1) {
 *     gMain.callback2();    // = scène courante state machine (CB2_*)
 *     RunTasks();            // = gTasks itère
 *     AnimateSprites();      // = sprite anim cycle + sprite CB
 *     BuildOamBuffer();      // = sync sprite → OAM
 *   }
 *
 * Notre engine = `rt.tickFixed(dt)` qui fait exactement ça à 60Hz.
 *
 * Cette scene Phaser = juste l'HÔTE du canvas. Aucune logique de jeu ici.
 * Toute la logique est dans les `CB2_*`/`Task_*`/`SpriteCB_*` transcrits
 * mécaniquement depuis le décomp (auto/src/*-callbacks-auto.ts), exécutés
 * par DecompRuntime.tickFixed.
 *
 * PHASE 0b (état actuel) : on saute le copyright (déjà dispo en TestGba) et
 * on lance directement Task_Scene1_Load (1:1 transcrite). Si la state machine
 * tourne correctement, on enchaîne automatiquement Scene 1 → Scene 2 → Scene 3
 * → Title via les transitions inter-tasks transcrites.
 *
 * Phase 0c (next) : implementer la vraie chaîne CB2_InitCopyrightScreenAfterBootup
 * → SetUpCopyrightScreen state machine → SetMainCallback2(MainCB2_Intro) +
 * CreateTask(Task_Scene1_Load).
 */
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../main';
import { Gba } from '../../harness/gba/gba';
import { GbaPhaserBridge } from '../../harness/gba/phaser-bridge';
import { DecompRuntime, InitKeys } from '../engine/system/decomp-runtime';
import { CB2_NewGame, CB2_ContinueSavedGame } from '../engine/decomp-data/src/overworld-callbacks-auto';
import { setGlobalRuntime, resetObjAllocations, lz77Trace, assetCache } from '../engine/system/decomp-globals';
import { exposeGbaGlobals } from '../engine/system/gba-global-scope';
import { installEngineDevtools } from '../../harness/devtools/engine-devtools';
import { installInputHandlers, setHeldKeysOverride } from '../engine/system/input-handler';
// Chantier « c » Step 2.1 : boot intro extrait → intro-host.ts (callbacks + preload +
// SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)), réutilisable par la scène unique.
import { registerIntroSpriteCallbacks, bootIntroSequence } from '../engine/boot/intro-host';

export class GameScene extends Phaser.Scene {
  private gba!: Gba;
  private rt!: DecompRuntime;
  private bridge!: GbaPhaserBridge;
  private statusText?: Phaser.GameObjects.Text;
  private booted = false;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor() { super({ key: 'GameScene' }); }

  create() {
    console.log('[GameScene] create()');
    this.cameras.main.setBackgroundColor('#000000');

    // Engine GBA pixel-perfect + bridge Phaser
    this.gba = new Gba();
    this.bridge = new GbaPhaserBridge(this, this.gba, 'game-frame');
    this.rt = new DecompRuntime(this.gba);

    // Wire le runtime singleton (utilisé par decomp-globals helpers depuis les Tasks)
    setGlobalRuntime(this.rt);
    resetObjAllocations();
    exposeGbaGlobals();

    // 1:1 décomp src/main.c:99 AgbMain : `InitKeys()` appelée AVANT
    // `InitMainCallbacks` qui pose le 1er CB2. Init gKeyRepeatStartDelay=40 +
    // gKeyRepeatContinueDelay=5 + clear heldKeys/newKeys/keyRepeatCounter.
    // Sans ce call : gKeyRepeat valeurs étaient les const-defaults, ce qui
    // marchait par accident, mais naming_screen.c:484 set gKeyRepeatStartDelay=16
    // puis restore via keyRepeatStartDelayCopy au cleanup → si jamais re-init,
    // restore à valeur arbitraire.
    InitKeys(this.rt);

    // Enregistre les sprite callbacks intro/title/credits (extrait → intro-host.ts,
    // chantier « c » Step 2.1 : réutilisable par la scène hôte unique).
    registerIntroSpriteCallbacks(this.rt);

    // Expose debug pour inspecter dans la console : window.debug.rt, debug.gba etc.
    (window as unknown as { debug: unknown }).debug = {
      rt: this.rt, gba: this.gba,
      lz77Trace,                                       // tableau de tous les LZ77 calls
      assetCache,                                      // Map des assets préchargés
      cacheKeys: () => Array.from(assetCache.keys()),
      assetLen: (sym: string) => assetCache.get(sym)?.length ?? -1,
      bg0vram: () => Array.from(this.gba.bg(0).vram.subarray(0, 32)),
      bg0tilemap: () => Array.from(this.gba.bg(0).tilemap.subarray(0, 16)),
      bg0visible: () => this.gba.bg(0).config.visible,
      bg0cnt: () => this.gba.bg(0).config,
      bgPal0: () => Array.from({ length: 16 }, (_, i) => this.gba.palette.getBgRgba(0, i, 0)),
      brightness: () => this.gba.blend.brightness,
      blendMode: () => this.gba.blend.mode,

      // ─── F tool : dump runtime state for diff vs VBA-M GDB dump ───────
      // Returns base64-encoded snapshots of VRAM/PLTT/OAM + register values
      // matching VBA-M GDB layout. Used by scripts/diff-vbam/diff-vbam-vs-ours.py.
      dumpState: () => {
        const gba = this.gba;
        const rt = this.rt;
        // Helper: Uint8Array → base64
        const b64 = (arr: Uint8Array): string => {
          let bin = '';
          for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
          return btoa(bin);
        };
        // VRAM 96KB (= unified BG+OBJ).
        const vram = b64(gba.vram);
        // PLTT 1KB (= 256 BG + 256 OBJ entries, u16 each).
        const pltt = new Uint8Array(0x400);
        for (let i = 0; i < 256; i++) {
          const bgEntry = rt.gPlttBufferFaded.get(i);
          pltt[i * 2] = bgEntry & 0xFF;
          pltt[i * 2 + 1] = (bgEntry >> 8) & 0xFF;
          const objEntry = rt.gPlttBufferFaded.get(256 + i);
          pltt[0x200 + i * 2] = objEntry & 0xFF;
          pltt[0x200 + i * 2 + 1] = (objEntry >> 8) & 0xFF;
        }
        const plttB64 = b64(pltt);
        // OAM 1KB (= 128 sprites × 8 bytes).
        const oam = new Uint8Array(0x400);
        for (let i = 0; i < 128; i++) {
          const o = gba.oam[i];
          if (!o.visible) continue;
          // Reconstruct OAM attr0/1/2 from our struct
          const y = o.y & 0xFF;
          const affineMode = o.affineMode & 3;
          const objMode = o.objMode & 3;
          const bpp = o.paletteMode & 1;
          const shape = o.shape & 3;
          const attr0 = y | (affineMode << 8) | (objMode << 10) | (bpp << 13) | (shape << 14);
          const x = o.x & 0x1FF;
          const flipH = (o.flipH ? 1 : 0) << 12;
          const flipV = (o.flipV ? 1 : 0) << 13;
          const size = (o.size & 3) << 14;
          const attr1 = x | flipH | flipV | size;
          const tileId = o.tileId & 0x3FF;
          const prio = (o.priority & 3) << 10;
          const palBank = (o.paletteBank & 0xF) << 12;
          const attr2 = tileId | prio | palBank;
          oam[i * 8 + 0] = attr0 & 0xFF;
          oam[i * 8 + 1] = (attr0 >> 8) & 0xFF;
          oam[i * 8 + 2] = attr1 & 0xFF;
          oam[i * 8 + 3] = (attr1 >> 8) & 0xFF;
          oam[i * 8 + 4] = attr2 & 0xFF;
          oam[i * 8 + 5] = (attr2 >> 8) & 0xFF;
        }
        const oamB64 = b64(oam);

        // IO Registers (= reconstruct DISPCNT/BGxCNT/etc. from our config).
        const ioregs = new Uint8Array(0x60);
        // DISPCNT @ 0x000
        let dispcnt = 0;
        for (let bg = 0; bg < 4; bg++) {
          if (gba.bg(bg as 0 | 1 | 2 | 3).config.visible) dispcnt |= (1 << (8 + bg));
        }
        // OBJ_ON if any sprite visible
        if (Array.from(gba.oam).some(o => o.visible)) dispcnt |= (1 << 12);
        ioregs[0] = dispcnt & 0xFF;
        ioregs[1] = (dispcnt >> 8) & 0xFF;
        // BGxCNT @ 0x008-0x00F
        for (let bg = 0; bg < 4; bg++) {
          const cfg = gba.bg(bg as 0 | 1 | 2 | 3).config;
          const cnt = (cfg.priority & 3)
            | ((cfg.charBaseIndex & 3) << 2)
            | ((cfg.paletteMode & 1) << 7)
            | ((cfg.mapBaseIndex & 0x1F) << 8)
            | ((cfg.screenSize & 3) << 14);
          ioregs[8 + bg * 2] = cnt & 0xFF;
          ioregs[8 + bg * 2 + 1] = (cnt >> 8) & 0xFF;
        }
        // BGxHOFS/VOFS @ 0x010-0x01F
        for (let bg = 0; bg < 4; bg++) {
          const cfg = gba.bg(bg as 0 | 1 | 2 | 3).config;
          ioregs[0x10 + bg * 4] = cfg.hofs & 0xFF;
          ioregs[0x10 + bg * 4 + 1] = (cfg.hofs >> 8) & 0xFF;
          ioregs[0x10 + bg * 4 + 2] = cfg.vofs & 0xFF;
          ioregs[0x10 + bg * 4 + 3] = (cfg.vofs >> 8) & 0xFF;
        }
        // BLDCNT/BLDALPHA/BLDY @ 0x050-0x055
        const blend = gba.blend;
        const bldcnt = (blend.target1 & 0x3F) | ((blend.mode & 3) << 6) | ((blend.target2 & 0x3F) << 8);
        ioregs[0x50] = bldcnt & 0xFF;
        ioregs[0x51] = (bldcnt >> 8) & 0xFF;
        const bldalpha = (blend.alpha1 & 0x1F) | ((blend.alpha2 & 0x1F) << 8);
        ioregs[0x52] = bldalpha & 0xFF;
        ioregs[0x53] = (bldalpha >> 8) & 0xFF;
        ioregs[0x54] = blend.brightness & 0x1F;
        const ioregsB64 = b64(ioregs);

        return {
          version: 1,
          callback2: rt.gMain.callback2?.name ?? 'anon',
          frameCounter: rt.gIntroFrameCounter ?? 0,
          taskCount: rt.gTasks.size,
          vram: vram,
          pltt: plttB64,
          oam: oamB64,
          ioregs: ioregsB64,
        };
      },
    };

    // Devtools : window.dev unifié (= cf. src/engine/engine-devtools.ts).
    // Toute scène basée sur DecompRuntime peut call installEngineDevtools(rt) ;
    // les helpers (frame control, savestate, pixelTrace, hookFn, dumps, etc.)
    // sont identiques. ?pause/?seekTo/?slow query params gérés inside (idempotent).
    installEngineDevtools(this.rt, {
      setHeldKeys: (mask) => setHeldKeysOverride(this.rt, mask),
      sceneName: 'GameScene',
    });

    const frameImg = this.add.image(0, 0, 'game-frame').setOrigin(0, 0);
    if (GAME_W !== 240 || GAME_H !== 160) {
      frameImg.setPosition((GAME_W - 240) / 2, (GAME_H - 160) / 2);
    }

    // Audio : pas de prime ici. Notre M4A engine maison (`src/engine/m4a/`)
    // est lazy-init via m4aSongNumStart() au moment où une song est demandée
    // par les Tasks décomp (= 1:1 ROM behavior). Plus de SpessaSynth.

    // Pré-charge async les assets (intro + fonts), puis pose Task_Scene1_Load
    void this.bootIntro();

    // Skip intro : A/B/START/SELECT à tout moment avant le title screen
    // NOTE: désactivé car il interfère avec le Title Screen (réinitialise CB2_InitTitleScreen)
    // L'intro tourne correctement jusqu'au Title Screen naturellement.
    // this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
    //   const k = e.key.toLowerCase();
    //   if (k === 'w' || k === 'x' || k === 'b' || k === 'n' || k === 'enter' || k === ' ') {
    //     if (this.rt.gMain.callback2 === this.mainCb2Intro) {
    //       console.log('[GameScene] Skip intro → CB2_InitTitleScreen');
    //       this.rt.SetMainCallback2(CB2_InitTitleScreen);
    //     }
    //   }
    // });

    // Skip via input
    this.input.keyboard?.on('keydown-ESC', () => {
      console.log('[GameScene] ESC → TestGbaScene');
      this.scene.start('TestGbaScene');
    });
    this.input.on('pointerdown', () => {
      console.log('[GameScene] click | tasks:', this.rt.gTasks.size,
                  '| sprites:', this.rt.gSprites.filter(Boolean).length,
                  '| frame:', this.rt.gIntroFrameCounter);
    });

    this.createKeys();
    console.log('[GameScene] create() done — preloading assets...');
  }

  private async bootIntro(): Promise<void> {
    try {
      // Boot intro 1:1 décomp extrait → intro-host.ts (chantier « c » Step 2.1) :
      // preload assets intro/title/birch + strings + cris/MIDIs, puis
      // SetMainCallback2(CB2_InitCopyrightScreenAfterBootup) = lance la chaîne CB2.
      await bootIntroSequence(this.rt);
      console.log('[GameScene] intro booted (CB2_InitCopyrightScreenAfterBootup set)');
      this.booted = true;
    } catch (e) {
      console.error('[GameScene] bootIntro failed:', e);
    }
  }

  /** Phase 4.10 : transition flag. Set true au 1er tick où callback2 === CB2_NewGame
   *  (= post-Birch cleanup). Empêche la transition de double-fire. */
  private overworldTransitionStarted = false;

  update(_: number, deltaMs: number) {
    if (!this.rt) return;
    // Phase 4.10 : detect post-MainMenu CB2 transitions AVANT tickFixed (=
    // sinon le auto CB2_ContinueSavedGame fire et crash sur les undef refs
    // `LoadSaveblockMapHeader`, `Overworld_GetMapHeaderByGroupAndId`, etc.
    // qui vivent dans auto/src-all et nécessitent le barrel flatten — pas
    // disponible avant que option-menu-impl soit loaded). Notre transition
    // vers TestOverworldScene gère le resume nativement, donc on bypass
    // l'auto CB2 entièrement.
    // 2 cases handled :
    //   - CB2_NewGame : post-Birch (= NEW_GAME action) → truck cinematic.
    //   - CB2_ContinueSavedGame : Continue action → load + spawn saved map.
    if (!this.overworldTransitionStarted) {
      if (this.rt.gMain.callback2 === CB2_NewGame) {
        // Audit session 126 fix : null-out callback2 IMMÉDIATEMENT pour empêcher
        // tickFixed de l'exécuter pendant que transitionToOverworld await la fade
        // (= ~1s de frames). Avant : tickFixed continuait à fire CB2_NewGame /
        // CB2_ContinueSavedGame qui crashent sur gSaveBlock1Ptr.location undefined
        // → spam logs `Cannot read properties of undefined (reading 'mapGroup')`.
        this.rt.gMain.callback2 = null;
        void this.transitionToOverworld('newgame');
        return;
      } else if (this.rt.gMain.callback2 === CB2_ContinueSavedGame) {
        this.rt.gMain.callback2 = null;
        void this.transitionToOverworld('continue');
        return;
      }
    }
    // Skip tickFixed pendant que la transition est en cours (= avoid running
    // any leftover callback2 between detection and scene.start).
    if (this.overworldTransitionStarted) return;
    // Optim : skip bridge.tick si pas de frame logique avancée. Cf
    // TestOverworldScene.update().
    let framesProcessed = 0;
    try {
      framesProcessed = this.rt.tickFixed(deltaMs);
    } catch (e) {
      console.error('[GameScene.update] tickFixed THREW:', e);
      console.error('[GameScene.update] stack:', (e as Error).stack);
    }
    if (framesProcessed > 0) {
      try {
        if (this.bridge) this.bridge.tick();
      } catch (e) {
        console.error('[GameScene.update] bridge.tick THREW:', e);
      }
    }
  }

  /** Sync Birch state (playerName, gender) vers gameState + start TestOverworldScene.
   *  - mode 'newgame' : Clear gameState.map → truck cinematic spawn.
   *  - mode 'continue' : Keep saved gameState.map → spawn at saved location.
   *
   *  1:1 décomp : main_menu.c:Task_NewGameBirchSpeech_Cleanup attend que la
   *  fade Birch soit terminée (`!gPaletteFade.active`) avant de switch CB2.
   *  Notre TS doit pareil sinon le scene.start coupe la fade Birch en cours.
   *  Bug fix session 122 : avant on faisait scene.start synchronement → la
   *  fade Birch était brutalement remplacée par TestOverworldScene visible. */
  private async transitionToOverworld(mode: 'newgame' | 'continue'): Promise<void> {
    this.overworldTransitionStarted = true;
    console.log(`[GameScene] CB2_${mode === 'continue' ? 'ContinueSavedGame' : 'NewGame'} detected → TestOverworldScene (${mode})`);
    const { gSaveBlock2Ptr } = await import('../engine/save/save-block-state');
    if (mode === 'continue') {
      // ⚠️ CRITICAL : LOAD la save AVANT de toucher gameState. Sinon
      // gameState est en état initial vide (= block1.flags={}, vars={}, etc.)
      // et tout `gameState.save()` plus loin OVERWRITERAIT la save existante
      // avec ce vide. Bug réel observé 2026-05-10 : counter passait de 23 à 1
      // au CONTINUE → resume cinematique replay parce que vars/flags perdus.
      const { LoadGameSave, SAVE_STATUS_OK } = await import('../engine/save/save-system');
      const lsMod = await import('../engine/save/load_save');
      const ok = LoadGameSave() === SAVE_STATUS_OK;
      console.log(`[GameScene continue] LoadGameSave() → ${ok}, map=${JSON.stringify(lsMod.GetCurrentMap())}`);
    } else {
      // 'newgame' : Birch speech a déjà set name/gender dans gSaveBlock2Ptr
      // via auto code. gameState.playerName/gender lisent direct
      // gSaveBlock2Ptr → plus de sync nécessaire (= 1:1 strict).
      // Force truck cinematic via decideBootMode default path.
      const { SetCurrentMap } = await import('../engine/save/load_save');
      SetCurrentMap(undefined);
      // BUG FIX user 2026-05-20 : NE PAS auto-save ici. 1:1 décomp : la save
      // SRAM persiste tant que user n'a pas explicitement choisi SAUVEGARDER
      // (= START menu). Auto-save ici = wipe la save existante du user dès
      // qu'il commence une nouvelle partie (= bug user-flag :
      // "Sauvegarder => Faire une nouvelle partie SANS sauvegarder =>
      // Recharger la save montre qu'elle est wipe"). Si user F5 mid-Birch =
      // 1:1 ROM power off : la save SRAM précédente est préservée.
    }
    const _lsMod = await import('../engine/save/load_save');
    console.log(`[GameScene] start : name='${gSaveBlock2Ptr.playerName ?? ''}' gender=${gSaveBlock2Ptr.playerGender === 1 ? 'FEMALE' : 'MALE'} map=${JSON.stringify(_lsMod.GetCurrentMap())}`);

    // 1:1 décomp Cleanup : attend la fin de la fade en cours puis assure que
    // Faded est full black avant scene.start. Précédent code lançait
    // INCONDITIONNELLEMENT une NEW fade ici quand `!active`, ce qui FLASHait
    // visuellement :
    //   - User-flag 2026-05-20 : "Il manque deux fade out" → en réalité c'est
    //     une fade IN parasite (= flash) qui mange la fade-out précédente.
    //   - Décomp main_menu.c:893 HandleMainMenuInput fait DÉJÀ
    //     BeginNormalPaletteFade ALL TO BLACK (= 8 frames). Task_HandleMainMenuAPressed
    //     wait `!active` puis SetMainCallback2(CB2_ContinueSavedGame) (= sync
    //     post-fade-done). Notre détection callback2 === CB2_ContinueSavedGame
    //     dans GameScene.update fire APRÈS = screen DÉJÀ BLACK.
    //   - 2ème BeginNormalPaletteFade startY=0 → RESET Faded vers Unfaded
    //     (= main menu colors visible) puis re-fade → FLASH. 1 frame visible.
    //
    // 1:1 décomp CB2_ContinueSavedGame (overworld.c:1705-1754) ne fait AUCUNE
    // nouvelle fade — il set juste gFieldCallback = FieldCB_FadeTryShowMapPopup
    // → fade-IN au moment où FieldCB_WarpExitFadeFromBlack fire post-load.
    // Donc skip le redundant fade ici.
    if (this.rt.gPaletteFade.active) {
      let waitFrames = 0;
      while (this.rt.gPaletteFade.active && waitFrames < 60) {
        await new Promise<void>((resolve) => setTimeout(resolve, 16));
        waitFrames++;
      }
    }
    // Force Faded full black (= 1:1 décomp FillPalBufferBlack pattern) pour
    // garantir aucun pixel non-noir avant scene swap. Idempotent si déjà black.
    const { FillPalBufferBlack } = await import('../engine/system/decomp-globals');
    FillPalBufferBlack();
    const waitFrames = 0;
    console.log(`[GameScene] fade complete after ${waitFrames} frames → starting TestOverworldScene`);
    this.scene.start('TestOverworldScene');
  }

  // Input handlers : voir src/engine/input-handler.ts (= shared entre toutes
  // les scenes runtime, écrit directement dans rt.gMain.heldKeys).
  private createKeys(): void {
    installInputHandlers(this, this.rt);
  }
}
