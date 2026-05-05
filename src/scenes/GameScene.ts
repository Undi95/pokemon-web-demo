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
import { Gba } from '../engine/gba/gba';
import { GbaPhaserBridge } from '../engine/gba/phaser-bridge';
import { DecompRuntime, type CB2Callback } from '../engine/decomp-runtime';
import { setGlobalRuntime, resetObjAllocations, lz77Trace, assetCache } from '../engine/decomp-globals';
import { preloadFontData } from '../engine/gba-text-system';
import { exposeGbaGlobals } from '../engine/gba-global-scope';
import { preloadScene1Assets, preloadScene2Assets, preloadScene3Assets, preloadTitleAssets, preloadBirchSpeechAssets } from '../engine/intro-asset-loader';
import {
  Task_Scene1_Load, MainCB2_EndIntro,
  SpriteCB_Sparkle, SpriteCB_Volbeat, SpriteCB_Torchic, SpriteCB_Manectric,
  SpriteCB_GroudonRocks, SpriteCB_KyogreBubbles, SpriteCB_Lightning,
  SpriteCB_WaterDrop_Ripple, SpriteCB_WaterDropHalf, SpriteCB_WaterDrop,
  SpriteCB_WaterDrop_Slide, SpriteCB_WaterDrop_ReachLeafEnd,
  SpriteCB_WaterDrop_DangleFromLeaf, SpriteCB_WaterDrop_Fall, SpriteCB_WaterDropShort,
  SpriteCB_PlayerOnBicycle, SpriteCB_Flygon, SpriteCB_LogoLetter,
  SpriteCB_GameFreakLogo, SpriteCB_FlygonSilhouette, SpriteCB_RayquazaOrb,
} from '../engine/decomp-data/auto/src/intro-callbacks-auto';
import {
  CB2_InitTitleScreen,
  SpriteCB_VersionBannerLeft, SpriteCB_VersionBannerRight,
  SpriteCB_PressStartCopyrightBanner,
  SpriteCB_PokemonLogoShine, SpriteCB_PokemonLogoShine_Fast,
} from '../engine/decomp-data/auto/src/title_screen-callbacks-auto';
import {
  SpriteCB_Bicycle, SpriteCB_FlygonRightHalf, Task_BicycleBgAnimation,
} from '../engine/decomp-data/auto/src/intro_credits_graphics-callbacks-auto';
import { CB2_InitCopyrightScreenAfterBootup, MainCB2_Intro } from '../engine/copyright-boot';
import { keyToGbaMask } from '../util/key-bindings';

export class GameScene extends Phaser.Scene {
  private gba!: Gba;
  private rt!: DecompRuntime;
  private bridge!: GbaPhaserBridge;
  private statusText?: Phaser.GameObjects.Text;
  private booted = false;
  private mainCb2Intro: CB2Callback | null = null;
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

    // Enregistre les sprite callbacks de l'intro pour que CreateSpriteFromTemplate
    // puisse les résoudre depuis les templates (les fonctions ESM ne sont pas sur globalThis).
    this.rt.spriteCallbacks.set('SpriteCB_Sparkle', SpriteCB_Sparkle);
    this.rt.spriteCallbacks.set('SpriteCB_Volbeat', SpriteCB_Volbeat);
    this.rt.spriteCallbacks.set('SpriteCB_Torchic', SpriteCB_Torchic);
    this.rt.spriteCallbacks.set('SpriteCB_Manectric', SpriteCB_Manectric);
    this.rt.spriteCallbacks.set('SpriteCB_GroudonRocks', SpriteCB_GroudonRocks);
    this.rt.spriteCallbacks.set('SpriteCB_KyogreBubbles', SpriteCB_KyogreBubbles);
    this.rt.spriteCallbacks.set('SpriteCB_Lightning', SpriteCB_Lightning);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_Ripple', SpriteCB_WaterDrop_Ripple);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDropHalf', SpriteCB_WaterDropHalf);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop', SpriteCB_WaterDrop);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_Slide', SpriteCB_WaterDrop_Slide);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_ReachLeafEnd', SpriteCB_WaterDrop_ReachLeafEnd);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_DangleFromLeaf', SpriteCB_WaterDrop_DangleFromLeaf);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDrop_Fall', SpriteCB_WaterDrop_Fall);
    this.rt.spriteCallbacks.set('SpriteCB_WaterDropShort', SpriteCB_WaterDropShort);
    this.rt.spriteCallbacks.set('SpriteCB_PlayerOnBicycle', SpriteCB_PlayerOnBicycle);
    this.rt.spriteCallbacks.set('SpriteCB_Flygon', SpriteCB_Flygon);
    this.rt.spriteCallbacks.set('SpriteCB_LogoLetter', SpriteCB_LogoLetter);
    this.rt.spriteCallbacks.set('SpriteCB_GameFreakLogo', SpriteCB_GameFreakLogo);
    this.rt.spriteCallbacks.set('SpriteCB_FlygonSilhouette', SpriteCB_FlygonSilhouette);
    this.rt.spriteCallbacks.set('SpriteCB_RayquazaOrb', SpriteCB_RayquazaOrb);
    // Title screen sprite callbacks (Version banner slide + alpha fade, Press Start
    // blink, Pokemon logo shine sweep). Sans ces enregistrements, les sprites
    // restent statiques (sprite.callback = null) → version banner stuck à y=4.
    this.rt.spriteCallbacks.set('SpriteCB_VersionBannerLeft', SpriteCB_VersionBannerLeft as any);
    this.rt.spriteCallbacks.set('SpriteCB_VersionBannerRight', SpriteCB_VersionBannerRight as any);
    this.rt.spriteCallbacks.set('SpriteCB_PressStartCopyrightBanner', SpriteCB_PressStartCopyrightBanner as any);
    this.rt.spriteCallbacks.set('SpriteCB_PokemonLogoShine', SpriteCB_PokemonLogoShine as any);
    this.rt.spriteCallbacks.set('SpriteCB_PokemonLogoShine_Fast', SpriteCB_PokemonLogoShine_Fast as any);
    // Scene 2 sub-sprite callbacks (bicycle suit player, Flygon right half suit left half)
    this.rt.spriteCallbacks.set('SpriteCB_Bicycle', SpriteCB_Bicycle);
    this.rt.spriteCallbacks.set('SpriteCB_FlygonRightHalf', SpriteCB_FlygonRightHalf);
    // Scene 2 BG scroll task (parallax bike ride). Stocké dans le même Map
    // (typage permissif via `as any`) pour récupération depuis CreateBicycleBgAnimationTask.
    this.rt.spriteCallbacks.set('Task_BicycleBgAnimation', Task_BicycleBgAnimation as any);

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

    // Devtools: pause/step/seek frame controls. Exposés via window.dev pour
    // qu'on puisse les call depuis la console ou preview_eval.
    const rt = this.rt;
    (window as any).dev = {
      // DEBUG only — accès direct au runtime + helpers diagnostic Birch flow.
      _rt: rt,
      fade: () => ({
        active: rt.gPaletteFade.active,
        brightness: rt.gPaletteFade.brightness,
        currentFrame: rt.gPaletteFade.currentFrame,
        totalFrames: rt.gPaletteFade.totalFrames,
        endY: rt.gPaletteFade.endY,
        startY: rt.gPaletteFade.startY,
      }),
      printers: async () => {
        const m = await import('../engine/gba-text-system');
        return m._debugGetTextPrinters().map((ap, i) => ({
          slot: i, windowId: ap.windowId, finished: ap.finished,
          state: ap.printer.state, charIdx: (ap.printer as any).charIdx,
          encodedLen: (ap.printer as any).encodedString?.length,
        }));
      },
      pause: () => { rt.paused = true; rt.stepBudget = 0; return 'paused @ frame ' + rt.gIntroFrameCounter; },
      resume: () => { rt.paused = false; rt.stepBudget = 0; return 'resumed @ frame ' + rt.gIntroFrameCounter; },
      step: (n = 1) => { rt.paused = true; rt.stepBudget += n; return 'step ' + n + ' frames'; },
      seek: (frame: number) => {
        if (frame <= rt.gIntroFrameCounter) return 'cannot seek backward (would need full reset). current=' + rt.gIntroFrameCounter;
        rt.paused = true; rt.stepBudget = frame - rt.gIntroFrameCounter;
        return 'seeking ' + rt.stepBudget + ' frames forward to ' + frame;
      },
      speed: (mult: number) => { rt.speedMultiplier = mult; return 'speed = ' + mult + 'x'; },
      frame: () => rt.gIntroFrameCounter,
      // Convenience: dump full sprite state with names
      sprites: () => {
        const out: any[] = [];
        for (const [id, s] of rt.gSprites.entries()) {
          const oam = rt.gba.oam[s.oamIndex];
          out.push({
            id, x: s.x, y: s.y, x2: s.x2, y2: s.y2, invisible: s.invisible,
            tileId: oam?.tileId, paletteBank: oam?.paletteBank,
            shape: oam?.shape, size: oam?.size, bpp: oam?.paletteMode,
            objMode: oam?.objMode, callback: s.callback ? 'fn' : null,
            data: Array.from(s.data || []).slice(0, 8),
          });
        }
        return out;
      },
      tasks: () => {
        const out: any[] = [];
        for (const [id, t] of rt.gTasks.entries()) {
          out.push({ id, hasFunc: !!t.func, data: Array.from(t.data || []).slice(0, 8) });
        }
        return out;
      },
      bgs: () => {
        return [0,1,2,3].map(i => ({ idx: i, ...rt.gba.bg(i as 0|1|2|3).config }));
      },
      // Backward step : reload + start paused + step forward to target frame.
      back: (n = 1) => {
        const target = Math.max(0, rt.gIntroFrameCounter - n);
        const url = new URL(window.location.href);
        url.searchParams.set('pause', '1');
        url.searchParams.set('seekTo', String(target));
        window.location.href = url.toString();
        return 'reloading + seeking back to frame ' + target;
      },
      // VRAM hex dump (BG vram unifié 96KB). Address absolu depuis VRAM=0.
      vram: (addr: number, len: number = 32) => {
        const buf = rt.gba.vram.subarray(addr, Math.min(addr + len, rt.gba.vram.length));
        return Array.from(buf).map(b => b.toString(16).padStart(2,'0')).join(' ');
      },
      // OBJ VRAM dump.
      ovram: (addr: number, len: number = 32) => {
        const buf = rt.gba.objVram.subarray(addr, Math.min(addr + len, rt.gba.objVram.length));
        return Array.from(buf).map(b => b.toString(16).padStart(2,'0')).join(' ');
      },
      // Palette dump bank N (16 colors). Mode 'bg' ou 'obj'. faded=true → après UpdatePaletteFade.
      palBank: (bank: number, mode: 'bg' | 'obj' = 'bg', faded: boolean = true) => {
        const out: { idx: number; rgb15: string; rgb8: string }[] = [];
        const buf = mode === 'bg'
          ? (faded ? rt.gPlttBufferFaded : rt.gPlttBufferUnfaded)
          : (faded ? rt.gPlttBufferFaded : rt.gPlttBufferUnfaded);
        const offset = mode === 'bg' ? 0 : 256;
        for (let i = 0; i < 16; i++) {
          const flat = offset + bank * 16 + i;
          const v = buf.get(flat);
          const r5 = v & 0x1F, g5 = (v >> 5) & 0x1F, b5 = (v >> 10) & 0x1F;
          out.push({ idx: i, rgb15: '0x'+v.toString(16).padStart(4,'0'), rgb8: `${r5*8},${g5*8},${b5*8}` });
        }
        return out;
      },
      // Compare gPlttBufferUnfaded vs Faded (= si fade actif, montre la diff).
      palDiff: (count: number = 32) => {
        const out: { idx: number; unfaded: string; faded: string; same: boolean }[] = [];
        for (let i = 0; i < count; i++) {
          const u = rt.gPlttBufferUnfaded.get(i);
          const f = rt.gPlttBufferFaded.get(i);
          out.push({ idx: i, unfaded: '0x'+u.toString(16).padStart(4,'0'), faded: '0x'+f.toString(16).padStart(4,'0'), same: u === f });
        }
        return out;
      },
      // Toggle BG visibility (= isolation pour debug). Returns prev state.
      bgVisible: (idx: 0|1|2|3, visible?: boolean) => {
        const cfg = rt.gba.bg(idx).config;
        const prev = cfg.visible;
        if (visible !== undefined) cfg.visible = visible;
        return { idx, prev, current: cfg.visible };
      },
      // Hide all OBJ sprites (= isolate BG layers).
      // _hiddenByDev tracking : Set externe (= pas de pollution OamEntry).
      objHide: (hide: boolean = true) => {
        const stash: Set<number> = ((window as unknown as { __objHideStash?: Set<number> }).__objHideStash ??= new Set());
        for (let i = 0; i < 128; i++) {
          if (hide) {
            if (rt.gba.oam[i].visible) stash.add(i);
            rt.gba.oam[i].visible = false;
          } else if (stash.has(i)) {
            rt.gba.oam[i].visible = true;
            stash.delete(i);
          }
        }
        return hide ? 'all sprites hidden' : 'sprites restored';
      },
      // Affine matrix dump.
      affineMat: () => ({
        bg2: rt.gba.bgAffineMatrices[0],
        bg3: rt.gba.bgAffineMatrices[1],
      }),
      // Window state dump.
      windows: () => rt.gba.windows,
      // Blend state dump.
      blend: () => rt.gba.blend,
      // Quick info panel for current frame.
      info: () => ({
        frame: rt.gIntroFrameCounter,
        cb2: rt.gMain.callback2?.name || 'anon',
        taskCount: rt.gTasks.size,
        spriteCount: Array.from(rt.gSprites.values()).filter(s => !s.invisible).length,
        bg2: rt.gba.bg(2).config,
        blend: { mode: rt.gba.blend.mode, br: rt.gba.blend.brightness },
        paletteFade: { active: rt.gPaletteFade.active, current: rt.gPaletteFade.currentFrame, total: rt.gPaletteFade.totalFrames },
      }),
    };
    console.log('[devtools] window.dev ready:');
    console.log('  pause/resume/step(n)/seek(frame)/back(n)/speed(x)/frame()');
    console.log('  sprites/tasks/bgs/info');
    console.log('  vram(addr,len)/ovram(addr,len)/palBank(bank,mode,faded)/palDiff(count)');
    console.log('  bgVisible(idx,visible?)/objHide(hide?)/affineMat()/windows()/blend()');

    // ?pause query param → start paused for frame-accurate audit. ?slow=N → speed N.
    // ?seekTo=N → after init, queue a seek to gIntroFrameCounter==N (= used by dev.back()).
    const params = new URLSearchParams(window.location.search);
    if (params.has('pause')) { rt.paused = true; console.log('[devtools] startup paused — call dev.resume() or dev.step(N)'); }
    const slow = params.get('slow');
    if (slow) { rt.speedMultiplier = Number(slow); console.log('[devtools] speed = ' + slow + 'x'); }
    const seekTo = params.get('seekTo');
    if (seekTo) {
      const target = Number(seekTo);
      console.log(`[devtools] seekTo=${target} requested, will burst when ready`);
      // Queue : check periodically until rt has progressed (= bootIntro done).
      const checkAndSeek = () => {
        if (rt.gIntroFrameCounter > 0 || rt.gMain.callback2) {
          rt.paused = true;
          rt.stepBudget = target;
          console.log(`[devtools] seekTo ${target} : burst ${target} frames`);
        } else {
          setTimeout(checkAndSeek, 100);
        }
      };
      setTimeout(checkAndSeek, 500);
    }

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
                  '| sprites:', this.rt.gSprites.size,
                  '| frame:', this.rt.gIntroFrameCounter);
    });

    this.createKeys();
    console.log('[GameScene] create() done — preloading assets...');
  }

  private async bootIntro(): Promise<void> {
    try {
      // Charge les strings FR 1:1 décomp AVANT toute Task qui pourrait référencer
      // gText_* (= main menu, Birch speech, default names, etc.).
      const { initStringsFromDecomp } = await import('../engine/gba-strings');
      await initStringsFromDecomp();

      // Side-effect import : populate globalThis avec les helpers option_menu
      // (DrawHeaderText, HighlightOptionMenuItem, *_DrawChoices, *_ProcessInput,
      //  GetWindowFrameTilesPal, sArrowPressed). Nécessaire AVANT que l'auto file
      // CB2_InitOptionMenu s'exécute (= il les résout via globalThis scope).
      const { preloadOptionMenuAssets } = await import('../engine/option-menu-impl');

      await preloadScene1Assets();
      await preloadScene2Assets();
      await preloadScene3Assets();
      await preloadTitleAssets();
      await preloadFontData();
      await preloadOptionMenuAssets();
      await preloadBirchSpeechAssets();

      // 1:1 décomp species.h + cries.json : map species ID → cri filename.
      // Au boot pour que PlayCryInternal(SPECIES_X) fonctionne pour TOUS les
      // species (Lotad release Birch, evolutions, battles, etc.), pas juste
      // les 3 hardcodés (Kyogre/Groudon/Rayquaza intro).
      const { loadSpeciesNamesAsync } = await import('../engine/decomp-globals');
      await loadSpeciesNamesAsync();

      // Pré-charge les MIDIs intro/title + cris légendaires pour éliminer le
      // gap silence aux transitions m4aSongNumStart (sinon ~50-150ms de
      // fetch+parse par switch intro→intro_battle→title).
      // 1:1 ROM-équivalent : tous les sons sont "déjà là" comme dans la décomp.
      const { loadMidi } = await import('../engine/m4a/player');
      void Promise.all([
        loadMidi('/decomp/em/music/mus_intro.mid').catch(() => {}),
        loadMidi('/decomp/em/music/mus_intro_battle.mid').catch(() => {}),
        loadMidi('/decomp/em/music/mus_title.mid').catch(() => {}),
        loadMidi('/decomp/em/music/se_intro_blast.mid').catch(() => {}),
      ]);
      // Pré-charge cris Groudon/Kyogre via fetch warm (decodeAudioData est rapide).
      void Promise.all([
        fetch('/decomp/em/cries/groudon.wav').catch(() => {}),
        fetch('/decomp/em/cries/kyogre.wav').catch(() => {}),
      ]);

      // Transfère les palettes additionnelles préchargées dans le runtime
      // pour que CpuCopy16 puisse les utiliser (e.g. text.pal pour color cycle).
      const textPal = assetCache.get('gIntroGameFreakTextFade_Pal') as Uint16Array | undefined;
      if (textPal) this.rt.setExtraPalette('gIntroGameFreakTextFade_Pal', textPal);

      // MainCB2_Intro = skip intro on any key press (décomp 1:1)
      this.mainCb2Intro = MainCB2_Intro;

      // Boot 1:1 décomp : CB2_InitCopyrightScreenAfterBootup → SetUpCopyrightScreen
      // state machine → fade in → hold → fade out → MainCB2_Intro + Task_Scene1_Load
      this.rt.SetMainCallback2(CB2_InitCopyrightScreenAfterBootup);
      console.log('[GameScene] CB2_InitCopyrightScreenAfterBootup set');

      this.booted = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[GameScene] bootIntro failed:', e);
    }
  }

  update(_: number, deltaMs: number) {
    if (!this.rt) return;
    this.pollInput();
    // Tick le runtime décomp (1:1 AgbMain main loop). Try/catch pour révéler
    // les erreurs silencieuses que Phaser swallow (= ne s'arrête pas mais
    // skip update suivants). Phase 3 debug Task_Scene3_Groudon GameScene halt.
    try {
      this.rt.tickFixed(deltaMs);
    } catch (e) {
      console.error('[GameScene.update] tickFixed THREW:', e);
      console.error('[GameScene.update] stack:', (e as Error).stack);
    }
    // Main Menu now runs purely on GBA engine (no Phaser scene fallback)
    // CB2_InitMainMenu / CB2_MainMenu are handled by the decomp runtime directly
    try {
      if (this.bridge) this.bridge.tick();
    } catch (e) {
      console.error('[GameScene.update] bridge.tick THREW:', e);
    }
    // Status update : montre l'état du runtime en live

  }

  private heldKeys = 0;

  private createKeys(): void {
    // Canvas focusable : focus par défaut → arrow keys/space ne scrollent pas
    // la page. Click ailleurs (= devtool, autre élément) → canvas perd focus
    // automatiquement (= browser default behavior). Click back sur canvas →
    // refocus automatique.
    const canvas = this.game.canvas;
    canvas.tabIndex = 0;
    canvas.style.outline = 'none'; // pas de border bleue ugly autour
    // Default focus sur le canvas au chargement de la scene.
    setTimeout(() => canvas.focus(), 0);

    // Utilise les événements natifs keydown/keyup au lieu de Phaser Key objects
    // car Puppeteer + Phaser addKey ne détectent pas toujours les touches.
    window.addEventListener('keydown', (e) => {
      const mask = this.keyToMask(e.key);
      if (mask) {
        this.heldKeys |= mask;
        // preventDefault uniquement si canvas a le focus (= user joue).
        if (document.activeElement === canvas) e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      const mask = this.keyToMask(e.key);
      if (mask) {
        this.heldKeys &= ~mask;
        if (document.activeElement === canvas) e.preventDefault();
      }
    });
  }

  private keyToMask(key: string): number {
    // Mapping clavier → GBA bitmask via key-bindings.ts (= configurable + persistant
    // dans localStorage.keyBindings). Defaults : W=A X=B N=SELECT B/Enter/Space=START
    // arrows=DPad Z=R A=L. Cf. src/util/key-bindings.ts.
    return keyToGbaMask(key);
  }

  private pollInput(): void {
    // Copie les touches détenues dans le runtime pour que tickFixed puisse
    // calculer newKeys (= front montant) chaque frame.
    this.rt.gMain.heldKeys = this.heldKeys;
  }
}
