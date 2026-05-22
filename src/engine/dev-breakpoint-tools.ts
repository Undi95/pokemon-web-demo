/**
 * dev-breakpoint-tools.ts — devtools "breakpoint" pour debugging frame-precise.
 *
 * Side-effect import depuis `main.ts` → expose `window.dev.breakpoint.*`.
 *
 * Workflow typique :
 *
 *   1. `dev.breakpoint.onFadeOut()` — armed
 *   2. (jouer le scénario qui trigger le fade)
 *   3. (auto-pause au moment exact du fade-out start)
 *   4. `dev.step(1)` ... étape par étape
 *   5. `dev.breakpoint.captureNext()` — auto-screenshot à chaque step
 *
 * Pourquoi : `dev.pauseAt(predicate)` est puissant mais nécessite d'écrire
 * un predicate à chaque fois. Ces helpers sont des wrappers nommés des cas
 * communs (= fade-out, fade-in, warp, palette leak, map change). Plus direct.
 *
 * Architecture : chaque breakpoint installe une hook (= wrap d'une méthode
 * runtime existante) qui call `rt.paused = true` au déclenchement, log la
 * raison, puis se DÉSARME (= one-shot par défaut). Si tu veux un breakpoint
 * persistant, passe `{ once: false }`.
 */

import { gMapHeader } from './map-loader';
import { gObjectEvents } from './object-events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rt = any;

interface BreakpointInfo {
  name: string;
  armed: boolean;
  triggered: number;
  installed: number;  // frame counter at install
}

const _activeBreakpoints = new Map<string, BreakpointInfo>();
const _hookOriginals = new Map<string, unknown>();

function _rt(): Rt | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dev = (globalThis as any).dev;
  return dev?._rt ?? null;
}

function _pause(reason: string): void {
  const rt = _rt();
  if (!rt) return;
  rt.paused = true;
  rt.stepBudget = 0;
  // Ensure log visible even si page paused.
  console.warn(`[breakpoint] ${reason} @ frame ${rt.gIntroFrameCounter}`);
}

function _disarm(name: string): void {
  const info = _activeBreakpoints.get(name);
  if (info) {
    info.armed = false;
    _activeBreakpoints.set(name, info);
  }
  // Restore original method if hooked.
  const orig = _hookOriginals.get(name);
  if (orig) {
    // (Each breakpoint type knows how to restore — see specific impls below.)
    _hookOriginals.delete(name);
  }
}

function _arm(name: string, frameCounter: number): void {
  _activeBreakpoints.set(name, { name, armed: true, triggered: 0, installed: frameCounter });
}

// ─── Breakpoint implementations ──────────────────────────────────────────────

/** Pause au prochain fade-out (= BeginNormalPaletteFade avec startY=0, endY=16).
 *  Le warp pipeline déclenche fade-out via WarpFadeOutScreen (= Phase 2). */
function onFadeOut(opts: { once?: boolean } = {}): string {
  const rt = _rt();
  if (!rt) return '[breakpoint] no runtime';
  const name = 'onFadeOut';
  if (_activeBreakpoints.get(name)?.armed) return `[breakpoint] ${name} already armed`;

  const orig = rt.BeginNormalPaletteFade.bind(rt);
  _hookOriginals.set(name, orig);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rt.BeginNormalPaletteFade = function(...args: any[]): unknown {
    const result = orig(...args);
    const startY = args[2], endY = args[3];
    if (startY === 0 && endY === 16) {
      _pause(`fade-OUT start (color=${args[4]})`);
      const info = _activeBreakpoints.get(name);
      if (info) info.triggered++;
      if (opts.once !== false) {
        rt.BeginNormalPaletteFade = orig;
        _disarm(name);
      }
    }
    return result;
  };
  _arm(name, rt.gIntroFrameCounter);
  return `[breakpoint] ${name} armed`;
}

/** Pause au prochain fade-in (= BeginNormalPaletteFade avec startY=16, endY=0). */
function onFadeIn(opts: { once?: boolean } = {}): string {
  const rt = _rt();
  if (!rt) return '[breakpoint] no runtime';
  const name = 'onFadeIn';
  if (_activeBreakpoints.get(name)?.armed) return `[breakpoint] ${name} already armed`;

  const orig = rt.BeginNormalPaletteFade.bind(rt);
  _hookOriginals.set(name, orig);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rt.BeginNormalPaletteFade = function(...args: any[]): unknown {
    const result = orig(...args);
    const startY = args[2], endY = args[3];
    if (startY === 16 && endY === 0) {
      _pause(`fade-IN start (color=${args[4]})`);
      const info = _activeBreakpoints.get(name);
      if (info) info.triggered++;
      if (opts.once !== false) {
        rt.BeginNormalPaletteFade = orig;
        _disarm(name);
      }
    }
    return result;
  };
  _arm(name, rt.gIntroFrameCounter);
  return `[breakpoint] ${name} armed`;
}

/** Pause au prochain map change. Si `target` fourni, pause uniquement si la
 *  nouvelle map ID matche le target. */
function onMapChange(target?: string, opts: { once?: boolean } = {}): string {
  const rt = _rt();
  if (!rt) return '[breakpoint] no runtime';
  const name = `onMapChange${target ? `(${target})` : ''}`;
  if (_activeBreakpoints.get(name)?.armed) return `[breakpoint] ${name} already armed`;

  let lastMapId: string | undefined = gMapHeader?.id;

  const origTick = rt.gba.tick.bind(rt.gba);
  _hookOriginals.set(name, origTick);
  rt.gba.tick = function() {
    const r = origTick();
    const cur = gMapHeader?.id;
    if (cur && cur !== lastMapId) {
      const matched = !target || cur === target;
      lastMapId = cur;
      if (matched) {
        _pause(`map change ${lastMapId} → ${cur}`);
        const info = _activeBreakpoints.get(name);
        if (info) info.triggered++;
        if (opts.once !== false) {
          rt.gba.tick = origTick;
          _disarm(name);
        }
      }
    }
    return r;
  };
  _arm(name, rt.gIntroFrameCounter);
  return `[breakpoint] ${name} armed (current map=${lastMapId})`;
}

/** Trace EVERY palette write to gPlttBufferFaded during `bufferTransferDisabled
 *  === true` window. Logs path that bypasses the gate (= leak detector).
 *
 *  Usage : `dev.breakpoint.onPaletteLeak()` then run warp scenario. Console
 *  log will show stack trace de chaque set/flushTo call qui leak. Doesn't
 *  pause by default — set `pauseOnFirst: true` to break on first leak. */
function onPaletteLeak(opts: { pauseOnFirst?: boolean } = {}): string {
  const rt = _rt();
  if (!rt) return '[breakpoint] no runtime';
  const name = 'onPaletteLeak';
  if (_activeBreakpoints.get(name)?.armed) return `[breakpoint] ${name} already armed`;

  const buf = rt.gPlttBufferFaded;
  const origFlushTo = buf.flushTo.bind(buf);
  const origSet = buf.set.bind(buf);
  _hookOriginals.set(name, { origFlushTo, origSet });

  let leakCount = 0;
  const leakLog: Array<{ kind: string; idx?: number; val?: number; frame: number; stack: string }> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any)._paletteLeakLog = leakLog;

  // Hook flushTo (= explicit). With our recent fix, this should rarely fire
  // during gate window because we removed inline flushTo() calls.
  buf.flushTo = function(): unknown {
    if (rt.gPaletteFade?.bufferTransferDisabled) {
      leakCount++;
      const stack = new Error().stack?.split('\n').slice(2, 5).join(' < ') ?? '';
      leakLog.push({ kind: 'flushTo', frame: rt.gIntroFrameCounter, stack });
      console.warn(`[paletteLeak#${leakCount}] flushTo during gate @ frame ${rt.gIntroFrameCounter}`, stack);
      if (opts.pauseOnFirst) {
        _pause(`palette leak (flushTo) @ frame ${rt.gIntroFrameCounter}`);
        buf.flushTo = origFlushTo;
        buf.set = origSet;
        _disarm(name);
      }
    }
    return origFlushTo();
  };
  _arm(name, rt.gIntroFrameCounter);
  return `[breakpoint] ${name} armed (= log palette writes during gate window). Watch console + window._paletteLeakLog.`;
}

/** Pause N frames from now. Equivalent to dev.step(N) but doesn't immediately
 *  pause (= scheduled). Useful pour "let it run X frames then auto-pause". */
function afterFrames(n: number): string {
  const rt = _rt();
  if (!rt) return '[breakpoint] no runtime';
  const targetFrame = rt.gIntroFrameCounter + n;
  // Use existing pauseAt mechanism with a frame-count predicate.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dev = (globalThis as any).dev;
  if (dev.pauseAt) {
    dev.pauseAt((rt: Rt) => rt.gIntroFrameCounter >= targetFrame, `afterFrames(${n})`);
  }
  return `[breakpoint] will pause at frame ${targetFrame}`;
}

/** Pause when an NPC's facingDirection changes. Useful for tracking down
 *  unexpected facing rewrites (= e.g. tickLookAround override face_player). */
function onNpcFacingChange(localId: string, opts: { once?: boolean } = {}): string {
  const rt = _rt();
  if (!rt) return '[breakpoint] no runtime';
  const name = `onNpcFacingChange(${localId})`;
  if (_activeBreakpoints.get(name)?.armed) return `[breakpoint] ${name} already armed`;

  const npcs = gObjectEvents;
  if (!npcs) return '[breakpoint] no gObjectEvents';

  let lastFacing = -1;
  const origTick = rt.gba.tick.bind(rt.gba);
  _hookOriginals.set(name, origTick);
  rt.gba.tick = function() {
    const r = origTick();
    const npc = npcs.find((n: { localIdRaw?: string; active?: boolean }) => n.active && n.localIdRaw === localId);
    if (npc) {
      const cur = (npc as { facingDirection: number }).facingDirection;
      if (lastFacing !== -1 && cur !== lastFacing) {
        const stack = new Error().stack?.split('\n').slice(2, 5).join(' < ') ?? '';
        console.warn(`[breakpoint] ${localId} facing ${lastFacing} → ${cur} @ frame ${rt.gIntroFrameCounter}`, stack);
        if (opts.once !== false) {
          _pause(`${localId} facing changed`);
          rt.gba.tick = origTick;
          _disarm(name);
        }
      }
      lastFacing = cur;
    }
    return r;
  };
  _arm(name, rt.gIntroFrameCounter);
  return `[breakpoint] ${name} armed`;
}

/** Trace fade transition : log palette state every frame during a fade.
 *  Stops auto when gPaletteFade.active goes from true to false. */
function traceFade(): string {
  const rt = _rt();
  if (!rt) return '[breakpoint] no runtime';
  const name = 'traceFade';
  if (_activeBreakpoints.get(name)?.armed) return `[breakpoint] ${name} already armed`;

  const log: Array<{ frame: number; fadeY: number; active: boolean; palBgB1: number; btd: boolean; mapId?: string }> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any)._fadeTraceLog = log;

  let prevActive = rt.gPaletteFade.active;
  let stopAfterInactive = false;

  const origTick = rt.gba.tick.bind(rt.gba);
  _hookOriginals.set(name, origTick);
  rt.gba.tick = function() {
    const r = origTick();
    const fade = rt.gPaletteFade;
    log.push({
      frame: rt.gIntroFrameCounter,
      fadeY: fade.brightness,
      active: fade.active,
      palBgB1: rt.gba.palette.bgRgb15 ? rt.gba.palette.bgRgb15[1] : 0,
      btd: fade.bufferTransferDisabled,
      mapId: gMapHeader?.id?.replace('MAP_', '').slice(0, 12),
    });
    if (log.length > 200) log.shift();

    // Auto-stop : si fade activate puis deactivate, on stoppe (= une fade complete capturée).
    if (!prevActive && fade.active) stopAfterInactive = true;
    if (stopAfterInactive && prevActive && !fade.active) {
      console.log(`[traceFade] complete (${log.length} entries). Inspect window._fadeTraceLog.`);
      rt.gba.tick = origTick;
      _disarm(name);
    }
    prevActive = fade.active;
    return r;
  };
  _arm(name, rt.gIntroFrameCounter);
  return `[breakpoint] ${name} armed (= log palette + fade state every frame, auto-stop at fade end). Watch window._fadeTraceLog.`;
}

/** List active breakpoints. */
function list(): Array<{ name: string; armed: boolean; triggered: number; installed: number }> {
  return Array.from(_activeBreakpoints.values());
}

/** Disarm all active breakpoints. */
function clear(): string {
  const rt = _rt();
  // Restore originals where possible.
  for (const [name, info] of _activeBreakpoints) {
    if (info.armed && rt) {
      const orig = _hookOriginals.get(name);
      if (orig) {
        // Best-effort restore. Specific to each breakpoint kind.
        if (name === 'onFadeOut' || name === 'onFadeIn') {
          rt.BeginNormalPaletteFade = orig;
        } else if (name.startsWith('onMapChange') || name.startsWith('onNpcFacing') || name === 'traceFade') {
          rt.gba.tick = orig;
        } else if (name === 'onPaletteLeak') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const o = orig as any;
          if (o.origFlushTo) rt.gPlttBufferFaded.flushTo = o.origFlushTo;
        }
      }
    }
  }
  _activeBreakpoints.clear();
  _hookOriginals.clear();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dev = (globalThis as any).dev;
  if (dev?.clearPauseAt) dev.clearPauseAt();
  return '[breakpoint] all cleared';
}

function help(): string {
  return [
    '═══ dev.breakpoint.* ═══',
    '  onFadeOut()           : pause au prochain fade-OUT (= warp Phase 2)',
    '  onFadeIn()            : pause au prochain fade-IN (= warp Phase 4)',
    '  onMapChange(target?)  : pause au prochain map change (filter par target)',
    '  onNpcFacingChange(id) : pause quand le facing d\'un NPC change',
    '  onPaletteLeak()       : log palette writes during bufferTransferDisabled (≠ pause)',
    '  afterFrames(N)        : pause N frames depuis maintenant',
    '  traceFade()           : log palette/fade state every frame (auto-stop)',
    '  list()                : list active breakpoints',
    '  clear()               : disarm all',
    '',
    '  WORKFLOW :',
    '    1. dev.breakpoint.onFadeOut()',
    '    2. (jouer le scénario)',
    '    3. (auto-pause)',
    '    4. dev.step(1) ... dev.step(1) ...',
    '    5. dev.breakpoint.clear() quand fini',
  ].join('\n');
}

// ─── Install on global dev.* ─────────────────────────────────────────────────

interface DevBreakpoint {
  onFadeOut: typeof onFadeOut;
  onFadeIn: typeof onFadeIn;
  onMapChange: typeof onMapChange;
  onNpcFacingChange: typeof onNpcFacingChange;
  onPaletteLeak: typeof onPaletteLeak;
  afterFrames: typeof afterFrames;
  traceFade: typeof traceFade;
  list: typeof list;
  clear: typeof clear;
  help: typeof help;
}

declare global {
  interface Window {
    dev?: { breakpoint?: DevBreakpoint };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = globalThis as any;
const dev = (w.dev ??= {});
dev.breakpoint = {
  onFadeOut, onFadeIn, onMapChange, onNpcFacingChange,
  onPaletteLeak, afterFrames, traceFade, list, clear, help,
} satisfies DevBreakpoint;

console.log('[dev.breakpoint.*] installed (type `dev.breakpoint.help()` for usage)');

export {};
