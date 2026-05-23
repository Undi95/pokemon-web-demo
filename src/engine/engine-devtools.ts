/**
 * engine-devtools.ts (= ex-birch-devtools.ts, généralisé runtime-wide)
 * ===================================================================
 * Outils de debug exposés sur `window.dev` pour TOUTES les scènes runtime
 * (= GameScene, BirchRuntimeScene, et toute future scene utilisant
 *  `DecompRuntime`). Pas appelés en prod — usage console / preview_eval.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ MINI DOC — quick reference (= "type `dev.help()` in console" too)    ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║ FRAME CONTROL                                                        ║
 * ║   dev.pause()        : suspend runtime (paused = true)               ║
 * ║   dev.resume()       : resume runtime                                ║
 * ║   dev.step(N)        : execute N frames then pause                   ║
 * ║   dev.frame()        : current frame counter                         ║
 * ║   dev.speed(mult)    : speedMultiplier (= 0.25 = quarter speed)      ║
 * ║   dev.seek(F)        : forward step to frame F                       ║
 * ║   dev.back(N)        : reload + replay to frame (current-N)          ║
 * ║                                                                      ║
 * ║ AUTO-PAUSE                                                           ║
 * ║   dev.pauseAt(rt => rt.gSprites.size === 21, 'release')              ║
 * ║     → fires once when condition met, sets paused=true                ║
 * ║   dev.clearPauseAt() : disarm                                        ║
 * ║                                                                      ║
 * ║ INPUT AUTOMATION (= si scene a passé { setHeldKeys })                ║
 * ║   await dev.skipUntil(rt => rt.gSprites.size > 10, 30000)            ║
 * ║     → toggles A button until predicate returns true (or timeout)     ║
 * ║                                                                      ║
 * ║ SAVESTATES (= bonus pour scenes runtime ; incomplet pour closures)   ║
 * ║   dev.savestate('name')  : snapshot full rt state                    ║
 * ║   dev.loadstate('name')  : restore                                   ║
 * ║   dev.savestates()       : list                                      ║
 * ║   Usage : drive once → savestate → tweak code → reload → loadstate   ║
 * ║   WARN : sprites/tasks créés mid-flow avec callbacks closure-captured║
 * ║          NE SONT PAS sauvegardés correctement.                       ║
 * ║                                                                      ║
 * ║ INSPECTION                                                           ║
 * ║   dev.info()              : { frame, cb2, taskCount, spriteCount }   ║
 * ║   dev.fade()              : palette fade state                       ║
 * ║   dev.sprites()           : OAM sprites dump                         ║
 * ║   dev.tasks()             : gTasks dump                              ║
 * ║   dev.bgs()               : BG configs                               ║
 * ║   dev.windows()/blend()   : window+blend state                       ║
 * ║   dev.affineMat()         : BG affine matrices                       ║
 * ║   dev.printers()          : active text printers (async)             ║
 * ║                                                                      ║
 * ║ MEMORY DUMPS                                                         ║
 * ║   dev.vram(addr, len)     : BG VRAM hex dump                         ║
 * ║   dev.ovram(addr, len)    : OBJ VRAM hex dump                        ║
 * ║   dev.palBank(b, mode, faded?) : 16 colors of palette bank           ║
 * ║   dev.palDiff(count?)     : compare unfaded vs faded palette         ║
 * ║                                                                      ║
 * ║ PIXEL TRACE                                                          ║
 * ║   dev.pixelTrace(80, 50)                                             ║
 * ║     → { pixel, blendState, paletteFade, bgsVisible,                  ║
 * ║         overlappingSprites: [{ oamIdx, palBank, tileId, ... }] }     ║
 * ║                                                                      ║
 * ║ VISIBILITY ISOLATION                                                 ║
 * ║   dev.bgVisible(idx, true|false)  : toggle BG layer                  ║
 * ║   dev.objHide(true|false)         : hide all sprites                 ║
 * ║                                                                      ║
 * ║ FUNCTION HOOKS                                                       ║
 * ║   dev.hookFn('BlendPalette', { budget: 100 })                        ║
 * ║     → logs each call with args [HOOK BlendPalette](416, 16, 16, ...) ║
 * ║   dev.unhookFn('BlendPalette')                                       ║
 * ║                                                                      ║
 * ║ TYPICAL DEBUG SESSION                                                ║
 * ║   1. await dev.skipUntil(rt => rt.gSprites.size > 10) // get to flash║
 * ║   2. dev.savestate('flash-start')                     // checkpoint  ║
 * ║   3. dev.pause()                                      // freeze      ║
 * ║   4. dev.pixelTrace(80, 50)                           // inspect     ║
 * ║   5. dev.step(1) → re-inspect, identify issue                        ║
 * ║   6. Apply fix in code → reload → dev.loadstate('flash-start')       ║
 * ║   7. dev.step(N) → verify fix                                        ║
 * ║                                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * INTÉGRATION ENGINE-LEVEL :
 *   Le poll auto-pause (= __enginePauseCondition) est appelé à la fin de
 *   `DecompRuntime.runOneFrame`, donc fonctionne pour toute scène qui boot
 *   un runtime — pas besoin de wiring scene-side.
 *
 * Aucune dépendance circulaire avec decomp-globals/runtime — accède à `rt`
 * via la référence passée à installEngineDevtools(rt, opts).
 */
import type { DecompRuntime } from './decomp-runtime';

interface SaveState {
  vram: Uint8Array;
  objVram: Uint8Array;
  pltUnfaded: Uint16Array;
  pltFaded: Uint16Array;
  oam: Array<Record<string, unknown>>;
  affineParams: Array<{ pa: number; pb: number; pc: number; pd: number }>;
  bgConfigs: Array<Record<string, unknown>>;
  blend: Record<string, unknown>;
  windows: unknown;
  gSprites: Array<[number, Record<string, unknown>]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gTasks: Array<[number, { data: number[]; func: ((task: any) => void) | null; taskId: number }]>;
  gPaletteFade: Record<string, unknown>;
  gMain: { callback2: ((rt: DecompRuntime) => void) | null; state: number; heldKeys: number; newKeys: number };
  // 1:1 STRICT arrays primary snapshot (Phase A3 cleanup : Maps secondaires
  // retirées, sources uniques = sSprite{Palette,TileRange}Tags + ranges + bitmap).
  sSpritePaletteTags: Uint16Array;
  sSpriteTileRangeTags: Uint16Array;
  sSpriteTileRanges: Uint16Array;
  sSpriteTileAllocBitmap: Uint8Array;
  frameCounter: number;
}

const savestates = new Map<string, SaveState>();

// Auto-pause condition (= polled chaque frame depuis runOneFrame via globalThis hook).
let pauseCondition: ((rt: DecompRuntime) => boolean) | null = null;
let pauseLabel = '';

// Hooked functions for tracing (= preserved originals so we can unhook).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hookedFns = new Map<string, (...args: any[]) => any>();

/** Options pour customiser l'install par scène. */
export interface EngineDevtoolsOptions {
  /** Si fournie, active `dev.skipUntil` (= input automation). La scène reçoit
   *  le mask de touches via ce callback (cf. heldKeys dans GameScene/Birch). */
  setHeldKeys?: (mask: number) => void;
  /** Optionnel : nom de la scène pour log au boot. */
  sceneName?: string;
}

/** Configure les devtools sur `globalThis.dev`. À call depuis scene.create() de
 *  toute scène basée sur DecompRuntime. */
export function installEngineDevtools(rt: DecompRuntime, opts: EngineDevtoolsOptions = {}): void {
  // MERGE (pas RESET) — chaque scene re-install ses tools sur son propre rt
  // mais on PRÉSERVE les extensions installées en side-effect (= dev.audit
  // depuis dev-audit-tools.ts, dev.dex, etc.). Avant : `dev = {}` wipeait
  // window.dev.audit à chaque scene boot → audit tools indisponibles.
  // 1:1 décomp parallel : pas applicable, c'est notre infra. Mais 1:1 impl
  // doit être 100% testable → audit tools doivent survivre.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = globalThis as any;
  const dev = (w.dev ??= {}) as Record<string, unknown>;

  dev._rt = rt;
  dev._scene = opts.sceneName ?? '(unknown)';

  // ─── Frame control ────────────────────────────────────────────────────────
  dev.pause = (): string => { rt.paused = true; rt.stepBudget = 0; return `paused @ frame ${rt.gIntroFrameCounter}`; };
  dev.resume = (): string => { rt.paused = false; rt.stepBudget = 0; return `resumed @ frame ${rt.gIntroFrameCounter}`; };
  dev.step = (n = 1): string => { rt.paused = true; rt.stepBudget = (rt.stepBudget ?? 0) + n; return `step ${n} frames`; };
  dev.frame = (): number => rt.gIntroFrameCounter;
  dev.speed = (mult: number): string => { rt.speedMultiplier = mult; return `speed = ${mult}x`; };
  dev.seek = (frame: number): string => {
    if (frame <= rt.gIntroFrameCounter) return `cannot seek backward (would need full reset). current=${rt.gIntroFrameCounter}`;
    rt.paused = true; rt.stepBudget = frame - rt.gIntroFrameCounter;
    return `seeking ${rt.stepBudget} frames forward to ${frame}`;
  };
  dev.back = (n = 1): string => {
    const target = Math.max(0, rt.gIntroFrameCounter - n);
    const url = new URL(window.location.href);
    url.searchParams.set('pause', '1');
    url.searchParams.set('seekTo', String(target));
    window.location.href = url.toString();
    return `reloading + seeking back to frame ${target}`;
  };

  // ─── Savestate / loadstate ────────────────────────────────────────────────
  // WARN : sprites/tasks créés mid-flow (= sparkles spawn task) NE SONT PAS
  // sauvegardés correctement (= callbacks closure-captured pas serialisables).
  // Utile pour states stables (= avant flow scriptée).
  dev.savestate = (name = 'default'): string => {
    const ss: SaveState = {
      vram: new Uint8Array(rt.gba.vram),
      objVram: new Uint8Array(rt.gba.objVram),
      pltUnfaded: new Uint16Array(512),
      pltFaded: new Uint16Array(512),
      oam: rt.gba.oam.map(o => ({ ...o })),
      affineParams: rt.gba.affineParams.map(m => ({ ...m })),
      bgConfigs: [0, 1, 2, 3].map(i => ({ ...rt.gba.bg(i as 0 | 1 | 2 | 3).config })),
      blend: { ...rt.gba.blend },
      windows: JSON.parse(JSON.stringify(rt.gba.windows)),
      gSprites: Array.from(rt.gSprites.entries()).map(([id, s]) => [id, { ...s, data: Array.from(s.data || []) }]),
      gTasks: Array.from(rt.gTasks.entries()).map(([id, t]) => [id, { taskId: t.taskId, data: Array.from(t.data || []), func: t.func }]),
      gPaletteFade: { ...rt.gPaletteFade },
      gMain: { callback2: rt.gMain.callback2, state: rt.gMain.state, heldKeys: rt.gMain.heldKeys, newKeys: rt.gMain.newKeys },
      // 1:1 STRICT arrays primary snapshot via globalThis.__sprite.
      sSpritePaletteTags: new Uint16Array(16),
      sSpriteTileRangeTags: new Uint16Array(64),
      sSpriteTileRanges: new Uint16Array(128),
      sSpriteTileAllocBitmap: new Uint8Array(128),
      frameCounter: rt.gIntroFrameCounter,
    };
    for (let i = 0; i < 512; i++) {
      ss.pltUnfaded[i] = rt.gPlttBufferUnfaded.get(i);
      ss.pltFaded[i] = rt.gPlttBufferFaded.get(i);
    }
    // 1:1 STRICT capture des arrays primary via globalThis.__sprite.
    const sp = (globalThis as Record<string, unknown>).__sprite as {
      sSpritePaletteTags?: Uint16Array;
      sSpriteTileRangeTags?: Uint16Array;
      sSpriteTileRanges?: Uint16Array;
      sSpriteTileAllocBitmap?: Uint8Array;
    } | undefined;
    if (sp?.sSpritePaletteTags) ss.sSpritePaletteTags.set(sp.sSpritePaletteTags);
    if (sp?.sSpriteTileRangeTags) ss.sSpriteTileRangeTags.set(sp.sSpriteTileRangeTags);
    if (sp?.sSpriteTileRanges) ss.sSpriteTileRanges.set(sp.sSpriteTileRanges);
    if (sp?.sSpriteTileAllocBitmap) ss.sSpriteTileAllocBitmap.set(sp.sSpriteTileAllocBitmap);
    savestates.set(name, ss);
    return `saved '${name}' (frame=${ss.frameCounter}, sprites=${ss.gSprites.length}, tasks=${ss.gTasks.length})`;
  };

  dev.loadstate = (name = 'default'): string => {
    const ss = savestates.get(name);
    if (!ss) return `no savestate '${name}'`;
    rt.gba.vram.set(ss.vram);
    rt.gba.objVram.set(ss.objVram);
    for (let i = 0; i < 512; i++) {
      rt.gPlttBufferUnfaded.set(i, ss.pltUnfaded[i]);
      rt.gPlttBufferFaded.set(i, ss.pltFaded[i]);
    }
    rt.gPlttBufferFaded.flushTo();
    for (let i = 0; i < ss.oam.length && i < rt.gba.oam.length; i++) {
      Object.assign(rt.gba.oam[i], ss.oam[i]);
    }
    for (let i = 0; i < ss.affineParams.length && i < rt.gba.affineParams.length; i++) {
      Object.assign(rt.gba.affineParams[i], ss.affineParams[i]);
    }
    for (let i = 0; i < 4; i++) {
      Object.assign(rt.gba.bg(i as 0 | 1 | 2 | 3).config, ss.bgConfigs[i]);
    }
    Object.assign(rt.gba.blend, ss.blend);
    Object.assign(rt.gba.windows, ss.windows);
    rt.gSprites.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const [id, s] of ss.gSprites) rt.gSprites.set(id, s as any);
    rt.gTasks.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const [id, t] of ss.gTasks) rt.gTasks.set(id, t as any);
    Object.assign(rt.gPaletteFade, ss.gPaletteFade);
    rt.gMain.callback2 = ss.gMain.callback2;
    rt.gMain.state = ss.gMain.state;
    // 1:1 STRICT restore des arrays primary via globalThis.__sprite.
    const spR = (globalThis as Record<string, unknown>).__sprite as {
      sSpritePaletteTags?: Uint16Array;
      sSpriteTileRangeTags?: Uint16Array;
      sSpriteTileRanges?: Uint16Array;
      sSpriteTileAllocBitmap?: Uint8Array;
    } | undefined;
    if (spR?.sSpritePaletteTags) spR.sSpritePaletteTags.set(ss.sSpritePaletteTags);
    if (spR?.sSpriteTileRangeTags) spR.sSpriteTileRangeTags.set(ss.sSpriteTileRangeTags);
    if (spR?.sSpriteTileRanges) spR.sSpriteTileRanges.set(ss.sSpriteTileRanges);
    if (spR?.sSpriteTileAllocBitmap) spR.sSpriteTileAllocBitmap.set(ss.sSpriteTileAllocBitmap);
    rt.gIntroFrameCounter = ss.frameCounter;
    return `loaded '${name}' (frame=${ss.frameCounter}, sprites=${ss.gSprites.length}, tasks=${ss.gTasks.length})`;
  };

  dev.savestates = (): string[] => Array.from(savestates.keys());

  // ─── Pause-on-condition ───────────────────────────────────────────────────
  dev.pauseAt = (predicate: (rt: DecompRuntime) => boolean, label = 'condition'): string => {
    pauseCondition = predicate;
    pauseLabel = label;
    return `armed pauseAt '${label}'`;
  };

  dev.clearPauseAt = (): string => {
    pauseCondition = null;
    pauseLabel = '';
    return 'cleared pauseAt';
  };

  // ─── Skip dialogues / drive A button (= scène-supplied) ───────────────────
  if (opts.setHeldKeys) {
    const setHeld = opts.setHeldKeys;
    dev.skipUntil = async (predicate: (rt: DecompRuntime) => boolean, maxFrames = 600): Promise<string> => {
      let i = 0;
      while (i < maxFrames) {
        // Toggle A : 1 frame on, 1 frame off (= front edge each cycle)
        setHeld(0);
        await new Promise(r => setTimeout(r, 16));
        setHeld(1);
        await new Promise(r => setTimeout(r, 32));
        i += 3;
        if (predicate(rt)) {
          setHeld(0);
          return `condition met at frame ${rt.gIntroFrameCounter} (skipped ${i} ms)`;
        }
      }
      setHeld(0);
      return `timeout after ${maxFrames}ms`;
    };
  } else {
    dev.skipUntil = async (): Promise<string> => 'skipUntil unavailable: no setHeldKeys passed to installEngineDevtools';
  }

  // ─── Pixel inspector — tells which sprite/BG covers (x,y) ─────────────────
  dev.pixelTrace = (x: number, y: number): unknown => {
    const fb = rt.gba.getFrameBuffer();
    const idx = (y * 240 + x) * 4;
    const pixel = { r: fb[idx], g: fb[idx + 1], b: fb[idx + 2], a: fb[idx + 3] };

    // Sprite OAM_SHAPE table (= width, height in tiles per shape/size combo).
    const SHAPES: number[][][] = [
      [[1, 1], [2, 2], [4, 4], [8, 8]],   // shape 0 = square
      [[2, 1], [4, 1], [4, 2], [8, 4]],   // shape 1 = wide
      [[1, 2], [1, 4], [2, 4], [4, 8]],   // shape 2 = tall
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overlapping: any[] = [];
    for (let oi = 0; oi < 128; oi++) {
      const o = rt.gba.oam[oi];
      if (!o.visible) continue;
      const shapeArr = SHAPES[o.shape & 3] ?? SHAPES[0];
      const [wTiles, hTiles] = shapeArr[o.size & 3] ?? [1, 1];
      const wPx = wTiles * 8;
      const hPx = hTiles * 8;
      const isDouble = o.affineMode === 3;
      const bboxW = isDouble ? wPx * 2 : wPx;
      const bboxH = isDouble ? hPx * 2 : hPx;
      if (x >= o.x && x < o.x + bboxW && y >= o.y && y < o.y + bboxH) {
        overlapping.push({
          oamIdx: oi,
          x: o.x, y: o.y, wPx, hPx, bboxW, bboxH,
          tileId: o.tileId, palBank: o.paletteBank,
          affineMode: o.affineMode, objMode: o.objMode,
          shape: o.shape, size: o.size, priority: o.priority,
          paletteMode: o.paletteMode,
          palBankColor1: rt.gba.palette.getObjRgba(o.paletteBank, 1, o.paletteMode),
        });
      }
    }

    // BG layers covering this pixel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bgs: any[] = [];
    for (let bg = 0; bg < 4; bg++) {
      const cfg = rt.gba.bg(bg as 0 | 1 | 2 | 3).config;
      if (!cfg.visible) continue;
      bgs.push({ bg, priority: cfg.priority, charBase: cfg.charBaseIndex, mapBase: cfg.mapBaseIndex, hofs: cfg.hofs, vofs: cfg.vofs });
    }

    return {
      pixel,
      blendState: { mode: rt.gba.blend.mode, brightness: rt.gba.blend.brightness, target1: rt.gba.blend.target1, target2: rt.gba.blend.target2, alpha1: rt.gba.blend.alpha1, alpha2: rt.gba.blend.alpha2 },
      paletteFade: { active: rt.gPaletteFade.active, brightness: rt.gPaletteFade.brightness, selectedPalettes: '0x' + rt.gPaletteFade.selectedPalettes.toString(16) },
      bgsVisible: bgs,
      overlappingSprites: overlapping,
    };
  };

  // ─── Hook a globalThis function for arg/result tracing ────────────────────
  dev.hookFn = (name: string, fnOpts?: { logArgs?: boolean; logResult?: boolean; budget?: number }): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orig = (globalThis as any)[name];
    if (typeof orig !== 'function') return `no fn '${name}'`;
    if (hookedFns.has(name)) return `'${name}' already hooked`;
    hookedFns.set(name, orig);
    let budget = fnOpts?.budget ?? 50;
    const logArgs = fnOpts?.logArgs ?? true;
    const logResult = fnOpts?.logResult ?? false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)[name] = function (...args: any[]) {
      const ret = orig.apply(this, args);
      if (budget > 0) {
        budget--;
        const argStr = logArgs ? args.map(a => {
          if (typeof a === 'number') return a.toString();
          if (typeof a === 'string') return `'${a}'`;
          if (Array.isArray(a)) return `[${a.length}]`;
          if (typeof a === 'object' && a !== null) return '{...}';
          return String(a);
        }).join(', ') : '';
        const retStr = logResult ? ` → ${typeof ret === 'object' ? JSON.stringify(ret).slice(0, 60) : ret}` : '';
        console.warn(`[HOOK ${name}](${argStr})${retStr}`);
      }
      return ret;
    };
    return `hooked '${name}' (budget=${budget})`;
  };

  dev.unhookFn = (name: string): string => {
    const orig = hookedFns.get(name);
    if (!orig) return `'${name}' not hooked`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)[name] = orig;
    hookedFns.delete(name);
    return `unhooked '${name}'`;
  };

  // ─── Inspection helpers ───────────────────────────────────────────────────
  dev.fade = (): unknown => ({
    active: rt.gPaletteFade.active,
    brightness: rt.gPaletteFade.brightness,
    currentFrame: rt.gPaletteFade.currentFrame,
    totalFrames: rt.gPaletteFade.totalFrames,
    endY: rt.gPaletteFade.endY,
    startY: rt.gPaletteFade.startY,
  });
  dev.printers = async (): Promise<unknown> => {
    const m = await import('./gba-text-system');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return m._debugGetTextPrinters().map((ap: any, i: number) => ({
      slot: i, windowId: ap.windowId, finished: ap.finished,
      state: ap.printer.state, charIdx: ap.printer.charIdx,
      encodedLen: ap.printer.encodedString?.length,
    }));
  };
  dev.sprites = (): unknown => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };
  dev.tasks = (): unknown => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any[] = [];
    for (const [id, t] of rt.gTasks.entries()) {
      out.push({ id, hasFunc: !!t.func, data: Array.from(t.data || []).slice(0, 8) });
    }
    return out;
  };
  dev.bgs = (): unknown => [0, 1, 2, 3].map(i => ({ idx: i, ...rt.gba.bg(i as 0 | 1 | 2 | 3).config }));
  dev.windows = (): unknown => rt.gba.windows;
  dev.blend = (): unknown => rt.gba.blend;
  dev.affineMat = (): unknown => ({
    bg2: rt.gba.bgAffineMatrices[0],
    bg3: rt.gba.bgAffineMatrices[1],
  });
  dev.info = (): unknown => ({
    frame: rt.gIntroFrameCounter,
    cb2: rt.gMain.callback2?.name || 'anon',
    taskCount: rt.gTasks.size,
    spriteCount: Array.from(rt.gSprites.values()).filter(s => !s.invisible).length,
    bg2: rt.gba.bg(2).config,
    blend: { mode: rt.gba.blend.mode, br: rt.gba.blend.brightness },
    paletteFade: { active: rt.gPaletteFade.active, current: rt.gPaletteFade.currentFrame, total: rt.gPaletteFade.totalFrames },
  });

  // ─── Memory dumps ─────────────────────────────────────────────────────────
  dev.vram = (addr: number, len = 32): string => {
    const buf = rt.gba.vram.subarray(addr, Math.min(addr + len, rt.gba.vram.length));
    return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join(' ');
  };
  dev.ovram = (addr: number, len = 32): string => {
    const buf = rt.gba.objVram.subarray(addr, Math.min(addr + len, rt.gba.objVram.length));
    return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join(' ');
  };
  dev.palBank = (bank: number, mode: 'bg' | 'obj' = 'bg', faded = true): unknown => {
    const out: { idx: number; rgb15: string; rgb8: string }[] = [];
    const buf = faded ? rt.gPlttBufferFaded : rt.gPlttBufferUnfaded;
    const offset = mode === 'bg' ? 0 : 256;
    for (let i = 0; i < 16; i++) {
      const flat = offset + bank * 16 + i;
      const v = buf.get(flat);
      const r5 = v & 0x1F, g5 = (v >> 5) & 0x1F, b5 = (v >> 10) & 0x1F;
      out.push({ idx: i, rgb15: '0x' + v.toString(16).padStart(4, '0'), rgb8: `${r5 * 8},${g5 * 8},${b5 * 8}` });
    }
    return out;
  };
  dev.palDiff = (count = 32): unknown => {
    const out: { idx: number; unfaded: string; faded: string; same: boolean }[] = [];
    for (let i = 0; i < count; i++) {
      const u = rt.gPlttBufferUnfaded.get(i);
      const f = rt.gPlttBufferFaded.get(i);
      out.push({ idx: i, unfaded: '0x' + u.toString(16).padStart(4, '0'), faded: '0x' + f.toString(16).padStart(4, '0'), same: u === f });
    }
    return out;
  };

  // ─── Visibility isolation ─────────────────────────────────────────────────
  dev.bgVisible = (idx: 0 | 1 | 2 | 3, visible?: boolean): unknown => {
    const cfg = rt.gba.bg(idx).config;
    const prev = cfg.visible;
    if (visible !== undefined) cfg.visible = visible;
    return { idx, prev, current: cfg.visible };
  };
  dev.objHide = (hide = true): string => {
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
  };

  // ─── Battle test helpers (Phase 5.6) ──────────────────────────────────────
  // dev.battle.startBirchTutorial() → trigger Birch tutorial wild battle inline.
  // Useful pour tester sans chain ChooseStarter → script flow complète.
  // Le flow est ticked chaque frame via le script engine (= ScriptContext_RunScript
  // appelé par TestOverworldScene.update). On utilise ScriptContext_SetupInlineNative
  // qui crée un native-mode script ctx → tickFn polled jusqu'à TRUE.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const battleNs = (dev.battle as Record<string, unknown> | undefined) ?? {};
  battleNs.startBirchTutorial = async (): Promise<string> => {
    const mod = await import('./battle-flow');
    const scriptMod = await import('./script-runtime');
    // Auto-add Treecko if party is empty (= dev convenience for tutorial test).
    const sbsMod = await import('./save-block-state');
    if (sbsMod.gSaveBlock1Ptr.playerPartyCount === 0) {
      const pokeMod = await import('./pokemon');
      const starter = pokeMod.createPokemonInstance('SPECIES_TREECKO', 5);
      pokeMod.GiveMonToPlayer(starter);
      console.log('[dev.battle.startBirchTutorial] auto-added Treecko Lv5 (party était vide)');
    }
    const flow = mod.startBirchTutorialBattle();
    (globalThis as { __activeBattleFlow?: { tick: () => boolean; getState: () => string } }).__activeBattleFlow = flow;
    scriptMod.ScriptContext_SetupInlineNative(flow.tick);
    return 'Birch tutorial battle started — flow ticked via script engine';
  };
  battleNs.startWild = async (species: string, level: number): Promise<string> => {
    const mod = await import('./battle-flow');
    const scriptMod = await import('./script-runtime');
    // Auto-add Treecko if party is empty.
    const sbsMod2 = await import('./save-block-state');
    if (sbsMod2.gSaveBlock1Ptr.playerPartyCount === 0) {
      const pokeMod = await import('./pokemon');
      const starter = pokeMod.createPokemonInstance('SPECIES_TREECKO', Math.max(5, level - 1));
      pokeMod.GiveMonToPlayer(starter);
      console.log(`[dev.battle.startWild] auto-added Treecko Lv${starter.level} (party était vide)`);
    }
    const flow = mod.startWildBattle({ opponentSpecies: species, opponentLevel: level });
    (globalThis as { __activeBattleFlow?: { tick: () => boolean; getState: () => string } }).__activeBattleFlow = flow;
    scriptMod.ScriptContext_SetupInlineNative(flow.tick);
    return `wild battle vs ${species} Lv${level} started`;
  };
  battleNs.state = (): string => {
    const af = (globalThis as { __activeBattleFlow?: { getState: () => string } }).__activeBattleFlow;
    return af?.getState() ?? '(no active flow)';
  };
  battleNs.outcome = (): number => {
    return (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome ?? 0;
  };
  dev.battle = battleNs;

  // ─── Starter test helpers (Phase 5.1) ─────────────────────────────────────
  // dev.starter.choose() → trigger ChooseStarter UI inline (= 1:1 décomp
  // CB2_ChooseStarter). Useful pour tester le scene switch Birch BG sans
  // navigate vers Mom + Birch flow complet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const starterNs = (dev.starter as Record<string, unknown> | undefined) ?? {};
  starterNs.choose = async (): Promise<string> => {
    const flowMod = await import('./starter-choose-flow');
    const scriptMod = await import('./script-runtime');
    const flow = flowMod.startChooseStarterFlow();
    scriptMod.ScriptContext_SetupInlineNative(flow.tick);
    return 'starter choose UI triggered — Birch BG should appear after async loads';
  };
  dev.starter = starterNs;

  // ─── Engine-level pause condition poll ────────────────────────────────────
  // Hook posé sur globalThis ; appelé à la fin de runOneFrame (= toute scene).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__enginePauseCondition = () => {
    if (pauseCondition && pauseCondition(rt)) {
      rt.paused = true;
      console.warn(`[pauseAt] '${pauseLabel}' fired @ frame ${rt.gIntroFrameCounter}`);
      pauseCondition = null;
    }
  };

  // ─── Help ─────────────────────────────────────────────────────────────────
  dev.help = (): string => {
    return [
      `engine dev tools (window.dev) — scene='${opts.sceneName ?? '?'}' :`,
      '  FRAME : pause()/resume()/step(N)/seek(F)/back(N)/speed(x)/frame()',
      '  AUTO  : pauseAt(pred, label?)/clearPauseAt()',
      '  INPUT : skipUntil(pred, maxFrames?) [si scene supports it]',
      '  STATE : savestate(name?)/loadstate(name?)/savestates()',
      '  PIXEL : pixelTrace(x, y)',
      '  HOOKS : hookFn(name, opts?)/unhookFn(name)',
      '  INSP  : info()/fade()/sprites()/tasks()/bgs()/windows()/blend()/affineMat()/printers()',
      '  DUMPS : vram(addr,len)/ovram(addr,len)/palBank(b,mode,faded?)/palDiff(count?)',
      '  ISOLT : bgVisible(idx, visible?)/objHide(hide?)',
    ].join('\n');
  };

  // ─── Query param helpers (= dev.back() reload + ?seekTo + ?pause + ?slow) ──
  // À call UNE FOIS au boot de la scene (= idempotent : skip si déjà fait).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(globalThis as any).__engineDevtoolsQueryParamsApplied) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__engineDevtoolsQueryParamsApplied = true;
    const params = new URLSearchParams(window.location.search);
    if (params.has('pause')) {
      rt.paused = true;
      console.log('[devtools] startup paused — call dev.resume() or dev.step(N)');
    }
    const slow = params.get('slow');
    if (slow) {
      rt.speedMultiplier = Number(slow);
      console.log(`[devtools] speed = ${slow}x`);
    }
    const seekTo = params.get('seekTo');
    if (seekTo) {
      const target = Number(seekTo);
      console.log(`[devtools] seekTo=${target} requested, will burst when ready`);
      const checkAndSeek = (): void => {
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
  }

  console.log(`[engine-devtools] window.dev installed for '${opts.sceneName ?? '?'}' — type dev.help() for usage`);
}
