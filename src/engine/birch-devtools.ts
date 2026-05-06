/**
 * birch-devtools.ts
 * =================
 * Outils de debug pour BirchRuntimeScene exposés sur `window.dev`.
 * Pas appelés en prod — usage console / preview_eval uniquement.
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
 * ║                                                                      ║
 * ║ AUTO-PAUSE                                                           ║
 * ║   dev.pauseAt(rt => rt.gSprites.size === 21, 'release')              ║
 * ║     → fires once when condition met, sets paused=true                ║
 * ║   dev.clearPauseAt() : disarm                                        ║
 * ║                                                                      ║
 * ║ INPUT AUTOMATION                                                     ║
 * ║   await dev.skipUntil(rt => rt.gSprites.size > 10, 30000)            ║
 * ║     → toggles A button until predicate returns true (or timeout)     ║
 * ║                                                                      ║
 * ║ SAVESTATES                                                           ║
 * ║   dev.savestate('name')  : snapshot full rt state                    ║
 * ║   dev.loadstate('name')  : restore                                   ║
 * ║   dev.savestates()       : list                                      ║
 * ║   Usage : drive once → savestate → tweak code → reload → loadstate   ║
 * ║                                                                      ║
 * ║ PIXEL TRACE                                                          ║
 * ║   dev.pixelTrace(80, 50)                                             ║
 * ║     → { pixel, blendState, paletteFade, bgsVisible,                  ║
 * ║         overlappingSprites: [{ oamIdx, palBank, tileId, ... }] }     ║
 * ║                                                                      ║
 * ║ FUNCTION HOOKS                                                       ║
 * ║   dev.hookFn('BlendPalette', { budget: 100 })                        ║
 * ║     → logs each call with args ([HOOK BlendPalette](416, 16, 16, ...) ║
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
 * Aucune dépendance circulaire avec decomp-globals/runtime — accède à `rt`
 * via getter qu'on configure au boot.
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
  gTasks: Array<[number, { data: number[]; func: ((task: any) => void) | null; taskId: number }]>;
  gPaletteFade: Record<string, unknown>;
  gMain: { callback2: ((rt: DecompRuntime) => void) | null; state: number; heldKeys: number; newKeys: number };
  spriteSheetTagToTileStart: Array<[string, number]>;
  paletteTagToSlot: Array<[string, number]>;
  nextSpriteSheetByteOffset: number;
  nextObjPalSlot: number;
  frameCounter: number;
}

const savestates = new Map<string, SaveState>();

// Auto-pause condition (= polled each frame via dev.tickPolled hook).
let pauseCondition: ((rt: DecompRuntime) => boolean) | null = null;
let pauseLabel = '';

// Hooked functions for tracing (= preserved originals so we can unhook).
const hookedFns = new Map<string, (...args: any[]) => any>();

/** Configure les devtools sur globalThis. À call depuis BirchRuntimeScene.create(). */
export function installBirchDevtools(scene: { rt: DecompRuntime; heldKeys: number }): void {
  const dev = (globalThis as any).dev = (globalThis as any).dev ?? {};

  // ─── Savestate / loadstate ────────────────────────────────────────────────
  dev.savestate = (name = 'default'): string => {
    const rt = scene.rt;
    if (!rt) return 'no rt';
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
      spriteSheetTagToTileStart: Array.from(rt.spriteSheetTagToTileStart.entries()),
      paletteTagToSlot: Array.from(rt.paletteTagToSlot.entries()),
      nextSpriteSheetByteOffset: rt.nextSpriteSheetByteOffset,
      nextObjPalSlot: rt.nextObjPalSlot,
      frameCounter: rt.gIntroFrameCounter,
    };
    for (let i = 0; i < 512; i++) {
      ss.pltUnfaded[i] = rt.gPlttBufferUnfaded.get(i);
      ss.pltFaded[i] = rt.gPlttBufferFaded.get(i);
    }
    savestates.set(name, ss);
    return `saved '${name}' (frame=${ss.frameCounter}, sprites=${ss.gSprites.length}, tasks=${ss.gTasks.length})`;
  };

  dev.loadstate = (name = 'default'): string => {
    const rt = scene.rt;
    if (!rt) return 'no rt';
    const ss = savestates.get(name);
    if (!ss) return `no savestate '${name}'`;

    // VRAM/OBJ VRAM
    rt.gba.vram.set(ss.vram);
    rt.gba.objVram.set(ss.objVram);
    // Palette buffers
    for (let i = 0; i < 512; i++) {
      rt.gPlttBufferUnfaded.set(i, ss.pltUnfaded[i]);
      rt.gPlttBufferFaded.set(i, ss.pltFaded[i]);
    }
    rt.gPlttBufferFaded.flushTo();
    // OAM
    for (let i = 0; i < ss.oam.length && i < rt.gba.oam.length; i++) {
      Object.assign(rt.gba.oam[i], ss.oam[i]);
    }
    // Affine matrices
    for (let i = 0; i < ss.affineParams.length && i < rt.gba.affineParams.length; i++) {
      Object.assign(rt.gba.affineParams[i], ss.affineParams[i]);
    }
    // BG configs
    for (let i = 0; i < 4; i++) {
      Object.assign(rt.gba.bg(i as 0 | 1 | 2 | 3).config, ss.bgConfigs[i]);
    }
    // Blend / windows
    Object.assign(rt.gba.blend, ss.blend);
    Object.assign(rt.gba.windows, ss.windows);
    // gSprites
    rt.gSprites.clear();
    for (const [id, s] of ss.gSprites) {
      rt.gSprites.set(id, s as any);
    }
    // gTasks
    rt.gTasks.clear();
    for (const [id, t] of ss.gTasks) {
      rt.gTasks.set(id, t as any);
    }
    // Palette fade
    Object.assign(rt.gPaletteFade, ss.gPaletteFade);
    // gMain (preserve heldKeys live)
    rt.gMain.callback2 = ss.gMain.callback2;
    rt.gMain.state = ss.gMain.state;
    // Tag maps
    rt.spriteSheetTagToTileStart.clear();
    for (const [k, v] of ss.spriteSheetTagToTileStart) rt.spriteSheetTagToTileStart.set(k, v);
    rt.paletteTagToSlot.clear();
    for (const [k, v] of ss.paletteTagToSlot) rt.paletteTagToSlot.set(k, v);
    rt.nextSpriteSheetByteOffset = ss.nextSpriteSheetByteOffset;
    rt.nextObjPalSlot = ss.nextObjPalSlot;
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

  // ─── Skip dialogues / drive A button ──────────────────────────────────────
  dev.skipUntil = async (predicate: (rt: DecompRuntime) => boolean, maxFrames = 600): Promise<string> => {
    const rt = scene.rt;
    if (!rt) return 'no rt';
    let i = 0;
    while (i < maxFrames) {
      // Toggle A : 1 frame on, 1 frame off (= front edge each cycle)
      scene.heldKeys = 0;
      await new Promise(r => setTimeout(r, 16));
      scene.heldKeys = 1;
      await new Promise(r => setTimeout(r, 32));
      i += 3;
      if (predicate(rt)) {
        scene.heldKeys = 0;
        return `condition met at frame ${rt.gIntroFrameCounter} (skipped ${i} ms)`;
      }
    }
    scene.heldKeys = 0;
    return `timeout after ${maxFrames}ms`;
  };

  // ─── Pixel inspector — tells which sprite/BG covers (x,y) ─────────────────
  dev.pixelTrace = (x: number, y: number): unknown => {
    const rt = scene.rt;
    if (!rt) return 'no rt';
    const fb = rt.gba.getFrameBuffer();
    const idx = (y * 240 + x) * 4;
    const pixel = { r: fb[idx], g: fb[idx + 1], b: fb[idx + 2], a: fb[idx + 3] };

    // Sprite OAM_SHAPE table (= width, height in tiles per shape/size combo).
    const SHAPES: number[][][] = [
      [[1, 1], [2, 2], [4, 4], [8, 8]],   // shape 0 = square
      [[2, 1], [4, 1], [4, 2], [8, 4]],   // shape 1 = wide
      [[1, 2], [1, 4], [2, 4], [4, 8]],   // shape 2 = tall
    ];

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
          // Sample palette idx 1 of this sprite's bank (= what color would render)
          palBankColor1: rt.gba.palette.getObjRgba(o.paletteBank, 1, o.paletteMode),
        });
      }
    }

    // BG layers covering this pixel
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
  dev.hookFn = (name: string, opts?: { logArgs?: boolean; logResult?: boolean; budget?: number }): string => {
    const orig = (globalThis as any)[name];
    if (typeof orig !== 'function') return `no fn '${name}'`;
    if (hookedFns.has(name)) return `'${name}' already hooked`;
    hookedFns.set(name, orig);
    let budget = opts?.budget ?? 50;
    const logArgs = opts?.logArgs ?? true;
    const logResult = opts?.logResult ?? false;
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
    (globalThis as any)[name] = orig;
    hookedFns.delete(name);
    return `unhooked '${name}'`;
  };

  // ─── Frame control (mirror GameScene's dev.*) ─────────────────────────────
  dev._rt = scene.rt;
  dev.pause = (): string => { scene.rt.paused = true; return `paused @ frame ${scene.rt.gIntroFrameCounter}`; };
  dev.resume = (): string => { scene.rt.paused = false; return `resumed @ frame ${scene.rt.gIntroFrameCounter}`; };
  dev.step = (n = 1): string => { scene.rt.paused = true; scene.rt.stepBudget = (scene.rt.stepBudget ?? 0) + n; return `step ${n} frames`; };
  dev.frame = (): number => scene.rt.gIntroFrameCounter;
  dev.speed = (mult: number): string => { scene.rt.speedMultiplier = mult; return `speed = ${mult}x`; };

  // ─── Intercept tickFixed pour évaluer pauseCondition chaque frame ─────────
  // On install via globalThis hook ; le runtime check le globalThis chaque frame.
  (globalThis as any).__birchPauseCondition = () => {
    if (pauseCondition && pauseCondition(scene.rt)) {
      scene.rt.paused = true;
      console.warn(`[pauseAt] '${pauseLabel}' fired @ frame ${scene.rt.gIntroFrameCounter}`);
      pauseCondition = null;
    }
  };

  // ─── Print help ────────────────────────────────────────────────────────────
  dev.help = (): string => {
    return [
      'Birch dev tools (window.dev) :',
      '  savestate(name?)            : snapshot rt state',
      '  loadstate(name?)            : restore rt state',
      '  savestates()                : list saved names',
      '  pauseAt(predicate, label?)  : auto-pause when predicate(rt) true',
      '  clearPauseAt()              : disarm pauseAt',
      '  skipUntil(predicate, ms?)   : drive A button until condition (async)',
      '  pixelTrace(x, y)            : pixel + overlapping sprites/BGs',
      '  hookFn(name, opts?)         : wrap globalThis fn for arg log',
      '  unhookFn(name)              : restore original',
      '  pause()/resume()/step(N)    : runtime control',
      '  frame()                     : current frame',
      '  speed(mult)                 : set speed multiplier',
    ].join('\n');
  };

  console.log('[birch-devtools] dev.* installed — type dev.help() for usage');
}
