/**
 * dev-scope.ts — devtools exhaustifs "voir sans voir l'écran".
 *
 * Permet de jouer et auditer le jeu via console JS uniquement (= sans regarder
 * le canvas). Toutes les commandes sont accessibles via `window.scope.*`.
 *
 * Audit session 126 : créé pour debug avancé où on n'a pas accès au visuel ou
 * où on veut comparer state frame-by-frame avec un comportement attendu.
 *
 * Session 127 : import direct des fns field-message-box pour `dialog()` au lieu
 * de chercher des magic globals qui n'existaient pas (sCurrentText n'est pas
 * exposé sur globalThis, c'est une `let` interne au module).
 *
 * USAGE :
 *   scope.where()        → "MAP_LITTLEROOT_TOWN (5, 8) facing NORTH"
 *   scope.see()          → snapshot complet du frame courant (= overworld état)
 *   scope.npcs()         → liste tous les NPCs actifs avec coords + gfx + mvt
 *   scope.dialog()       → text actuellement affiché dans le field message box
 *   scope.party()        → ton équipe Pokémon avec stats
 *   scope.bag()          → ton sac par pocket
 *   scope.flags()        → flags actifs (= setFlag)
 *   scope.vars()         → vars non-zéro
 *   scope.script()       → script en cours d'exécution + opcodes restants
 *   scope.battle()       → état du combat si en cours
 *   scope.audio()        → BGM + SE en cours
 *   scope.tile(x, y)     → metatile + behavior à coords (= obstacle/grass/warp)
 *   scope.warp()         → derniers warps + warp en cours
 *   scope.time()         → PC time + in-game time + play time
 *   scope.compare(prev)  → diff vs snapshot précédent (= pour voir ce qui a changé)
 *   scope.snapshot()     → capture l'état actuel pour scope.compare
 *   scope.walk(dir, n)   → simule N pas dans direction
 *   scope.press(key)     → simule press de touche (= 'a', 'b', 'up', 'down', etc.)
 *   scope.ai(plan)       → exécute un plan (= ['up', 'up', 'a', 'wait 60', 'a'])
 */

import {
  GetCurrentFieldMessageText,
  GetFieldMessageBoxMode,
  IsFieldMessageBoxHidden,
} from './field-message-box';
import { buildBattleDevtools } from './battle/battle-devtools';

interface ObjectEvent {
  active?: boolean;
  invisible?: boolean;
  graphicsId?: string;
  movementType?: string;
  localId?: number;
  localIdRaw?: string;
  mapId?: string;
  scriptLabel?: string;
  currentCoordsX?: number;
  currentCoordsY?: number;
  facingDirection?: number;
  spriteId?: number;
  worldX?: number;
  worldY?: number;
  walkFramesLeft?: number;
}

interface PlayerAvatar {
  x?: number;
  y?: number;
  facing?: number;
  gender?: string;
  stepFramesLeft?: number;
  tileTransitionState?: number;
  currentElevation?: number;
}

const _DIR_NAMES: Record<number, string> = {
  0: 'NONE', 1: 'SOUTH', 2: 'NORTH', 3: 'WEST', 4: 'EAST',
};

function _g<T = unknown>(name: string): T | undefined {
  return (globalThis as Record<string, unknown>)[name] as T | undefined;
}

/** Returns "MAP_X (col, row) facing DIR" string. */
function _where(): string {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  // Session 133 fix : `gMapHeader.id` est synced après traversal de connection
  // (= aller Littleroot → Route101 via exit nord). Les `gameState.map.name` /
  // `gSaveBlock1Ptr.location.mapName` restent figés sur la map primaire du
  // warp (= "MAP_LITTLEROOT_TOWN" même quand on est physiquement sur Route 101).
  const hdr = _g<{ id?: string }>('gMapHeader');
  const gs = _g<{
    data?: { location?: { __mapId?: string; mapName?: string } };
    map?: { name?: string };
    location?: { mapName?: string };
  }>('gameState');
  const mapId = hdr?.id
    ?? gs?.map?.name
    ?? gs?.location?.mapName
    ?? gs?.data?.location?.__mapId
    ?? gs?.data?.location?.mapName
    ?? '?';
  if (!pa) return `${mapId} (no avatar)`;
  return `${mapId} (${pa.x},${pa.y}) facing ${_DIR_NAMES[pa.facing ?? 0]}`;
}

/** Session 133 add : version objet structurée pour query précis. */
function _whereObj(): Record<string, unknown> {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  const hdr = _g<{
    id?: string;
    mapLayoutId?: string;
    regionMapSectionId?: string;
    music?: string;
  }>('gMapHeader');
  const sb1 = _g<{ location?: { mapGroup?: number; mapNum?: number } }>('gSaveBlock1Ptr');
  return {
    map: hdr?.id ?? '?',
    x: pa?.x,
    y: pa?.y,
    facing: _DIR_NAMES[pa?.facing ?? 0],
    layoutId: hdr?.mapLayoutId,
    regionMapSection: hdr?.regionMapSectionId,
    music: hdr?.music,
    primaryMapGroup: sb1?.location?.mapGroup,
    primaryMapNum: sb1?.location?.mapNum,
    elevation: pa?.currentElevation,
    walking: (pa?.stepFramesLeft ?? 0) > 0,
  };
}

/** Snapshot complet de l'état overworld pour comparaison frame-by-frame. */
function _see(): Record<string, unknown> {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  const gs = _g<{
    data?: { location?: Record<string, unknown> };
    party?: unknown[];
    getAllFlagNames?: () => string[];
    getAllVars?: () => Record<string, number>;
    playerName?: string;
  }>('gameState');
  const objs = _g<ObjectEvent[]>('__gObjectEvents') ?? [];
  const activeNpcs = objs.filter(o => o?.active).map(o => ({
    localId: o.localIdRaw ?? `id${o.localId}`,
    gfx: o.graphicsId,
    // Post R3 refactor : currentCoords INTERNAL → afficher en LOGICAL (= map JSON).
    pos: [(o.currentCoordsX ?? 7) - 7, (o.currentCoordsY ?? 7) - 7],
    facing: _DIR_NAMES[o.facingDirection ?? 0],
    mvt: o.movementType,
    visible: !o.invisible,
    walking: (o.walkFramesLeft ?? 0) > 0,
  }));
  return {
    where: _where(),
    player: pa
      ? { x: pa.x, y: pa.y, facing: _DIR_NAMES[pa.facing ?? 0],
          gender: pa.gender, walking: (pa.stepFramesLeft ?? 0) > 0,
          elevation: pa.currentElevation }
      : null,
    location: gs?.data?.location,
    activeNpcs: activeNpcs.length,
    npcsList: activeNpcs,
    partyCount: gs?.party?.length ?? 0,
    flagsCount: gs?.getAllFlagNames?.().length ?? 0,
    introState: gs?.getAllVars?.()['VAR_LITTLEROOT_INTRO_STATE'] ?? 0,
    routeState: gs?.getAllVars?.()['VAR_ROUTE101_STATE'] ?? 0,
    rivalState: gs?.getAllVars?.()['VAR_LITTLEROOT_RIVAL_STATE'] ?? 0,
    birchLabState: gs?.getAllVars?.()['VAR_BIRCH_LAB_STATE'] ?? 0,
  };
}

function _npcs(): Array<Record<string, unknown>> {
  const objs = _g<ObjectEvent[]>('__gObjectEvents') ?? [];
  return objs
    .map((o, i) => ({ slot: i, ...o }))
    .filter(o => o.active)
    .map(o => ({
      slot: o.slot,
      id: o.localIdRaw ?? `(localId=${o.localId})`,
      gfx: o.graphicsId,
      // Post R3 refactor : currentCoords INTERNAL → afficher en LOGICAL.
      pos: `(${(o.currentCoordsX ?? 7) - 7},${(o.currentCoordsY ?? 7) - 7})`,
      facing: _DIR_NAMES[o.facingDirection ?? 0],
      mvt: o.movementType,
      world: `${o.worldX},${o.worldY}`,
      script: o.scriptLabel,
      visible: !o.invisible,
      walking: (o.walkFramesLeft ?? 0) > 0,
    }));
}

function _dialog(): { open: boolean; text?: string; mode?: string } {
  // Session 127 fix : import direct des fns field-message-box.ts (sCurrentText
  // est un `let` private du module, pas un global). Source de vérité unique :
  // c'est ce que ShowFieldMessage() écrit + ce que la state machine rend.
  const hidden = IsFieldMessageBoxHidden();
  const text = GetCurrentFieldMessageText();
  const modeNum = GetFieldMessageBoxMode();
  const modeNames = ['HIDDEN', 'NORMAL', 'AUTO_SCROLL'];
  if (!hidden || text) {
    return { open: true, text, mode: modeNames[modeNum] ?? `?(${modeNum})` };
  }
  return { open: false };
}

function _party(): Array<Record<string, unknown>> {
  const gs = _g<{ party?: unknown[] }>('gameState');
  return (gs?.party ?? []).map((m: unknown, i: number) => {
    // Session 127 fix : essayer plusieurs aliases pour HP / moves.name (la
    // structure interne stocke `currentHp`/`hpCurrent` au lieu de `hp`,
    // et les moves ont parfois `move`/`id`/`moveId` au lieu de `name`).
    const mon = m as {
      species?: string; nickname?: string; speciesNameFr?: string; speciesName?: string; level?: number;
      hp?: number; currentHp?: number; hpCurrent?: number; current_hp?: number;
      maxHp?: number; hpMax?: number; max_hp?: number;
      moves?: Array<{ name?: string; move?: string; moveName?: string; id?: number; moveId?: number; pp?: number }>;
      experience?: number; exp?: number; status?: string;
    };
    const hp = mon.hp ?? mon.currentHp ?? mon.hpCurrent ?? mon.current_hp ?? '?';
    const maxHp = mon.maxHp ?? mon.hpMax ?? mon.max_hp ?? '?';
    return {
      slot: i,
      species: mon.species,
      name: mon.nickname || mon.speciesNameFr || mon.speciesName || mon.species,
      lv: mon.level,
      hp: `${hp}/${maxHp}`,
      moves: mon.moves?.map((mv) => {
        const moveName = mv.name ?? mv.move ?? mv.moveName ?? `move#${mv.id ?? mv.moveId ?? '?'}`;
        return `${moveName}(${mv.pp ?? '?'})`;
      }).join(', ') ?? '?',
      exp: mon.experience ?? mon.exp,
      status: mon.status ?? 'OK',
    };
  });
}

function _bag(): Record<string, Array<{ item: string; qty: number }>> {
  const gs = _g<{ bag?: Record<string, Array<{ itemKey?: string; quantity?: number }>> }>('gameState');
  const bag = gs?.bag ?? {};
  const out: Record<string, Array<{ item: string; qty: number }>> = {};
  for (const [pocket, items] of Object.entries(bag)) {
    if (!Array.isArray(items)) continue;
    // Session 127 fix : filter pour ne montrer QUE les slots non-vides (avant on
    // retournait 16-30 slots vides par pocket = bruit énorme dans la console).
    out[pocket] = items
      .filter((it) => it?.itemKey && (it.quantity ?? 0) > 0)
      .map((it) => ({
        item: it?.itemKey?.replace(/^ITEM_/, '') ?? '?',
        qty: it?.quantity ?? 0,
      }));
  }
  return out;
}

function _flags(filterPrefix?: string): string[] {
  const gs = _g<{ getAllFlagNames?: () => string[] }>('gameState');
  const all = gs?.getAllFlagNames?.() ?? [];
  if (filterPrefix) return all.filter(f => f.startsWith(filterPrefix));
  return all;
}

function _vars(): Record<string, number> {
  const gs = _g<{ getAllVars?: () => Record<string, number> }>('gameState');
  const all = gs?.getAllVars?.() ?? {};
  // Filter out zero-value vars to reduce noise.
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(all)) {
    if (v !== 0) out[k] = v;
  }
  return out;
}

function _script(): Record<string, unknown> {
  const sr = _g<{
    status?: () => unknown;
    getCurrentLabel?: () => string;
    getCurrentOpcodeIdx?: () => number;
    getRemainingOpcodes?: () => number;
    getCurrentOpcode?: () => { name?: string; args?: unknown[] };
  }>('__scriptRuntime');
  const status = sr?.status?.() ?? 'no-runtime';
  const STATUS_NAMES: Record<number, string> = { 0: 'RUNNING', 1: 'WAITING', 2: 'SHUTDOWN' };
  return {
    status,
    statusName: typeof status === 'number' ? STATUS_NAMES[status] : status,
    currentLabel: sr?.getCurrentLabel?.(),
    opcodeIdx: sr?.getCurrentOpcodeIdx?.(),
    opcodeName: sr?.getCurrentOpcode?.()?.name,
    opcodeArgs: sr?.getCurrentOpcode?.()?.args,
    remaining: sr?.getRemainingOpcodes?.(),
  };
}

function _battle(): Record<string, unknown> {
  // Cherche les variables battle exposées sur globalThis.
  const inBattle = !!_g('gBattleTypeFlags');
  if (!inBattle) return { active: false };
  return {
    active: true,
    typeFlags: _g('gBattleTypeFlags'),
    outcome: _g('gBattleOutcome'),
    playerMon: _g('gBattleMons'),
    turn: _g('gBattleTurnCounter'),
  };
}

function _audio(): Record<string, unknown> {
  // Notre audio engine expose les playing state quelque part. Best-effort.
  const ce = _g<{ getCurrentBGM?: () => string }>('audioContext');
  return {
    bgm: ce?.getCurrentBGM?.() ?? 'unknown',
    note: 'audio engine details : check window.audioContext or m4a',
  };
}

function _tile(x: number, y: number): Record<string, unknown> {
  const collFn = _g<(x: number, y: number) => number>('MapGridGetCollisionAt');
  const behFn = _g<(x: number, y: number) => number>('MapGridGetMetatileBehaviorAt');
  const elevFn = _g<(x: number, y: number) => number>('MapGridGetElevationAt');
  const idFn = _g<(x: number, y: number) => number>('MapGridGetMetatileIdAt');
  const MAP_OFFSET = 7;  // 1:1 décomp constants/global.h
  const xx = x + MAP_OFFSET;
  const yy = y + MAP_OFFSET;
  return {
    coords: [x, y],
    metatileId: idFn?.(xx, yy),
    collision: collFn?.(xx, yy),
    behavior: '0x' + (behFn?.(xx, yy) ?? 0).toString(16),
    elevation: elevFn?.(xx, yy),
  };
}

function _time(): Record<string, unknown> {
  const rtcGet = _g<() => Date>('rtcGetGameDate');
  const block2 = _g<{ playTimeHours?: number; playTimeMinutes?: number; playTimeSeconds?: number }>('gSaveBlock2Ptr');
  const pcNow = new Date();
  return {
    pcLocal: pcNow.toLocaleString(),
    pcEpoch: pcNow.getTime(),
    inGameTime: rtcGet ? rtcGet().toISOString() : 'rtc not exposed',
    playTime: `${block2?.playTimeHours ?? 0}h ${block2?.playTimeMinutes ?? 0}m ${block2?.playTimeSeconds ?? 0}s`,
  };
}

function _press(key: string, holdMs = 100): void {
  const KEY_MAP: Record<string, [string, string]> = {
    'up': ['ArrowUp', 'ArrowUp'],
    'down': ['ArrowDown', 'ArrowDown'],
    'left': ['ArrowLeft', 'ArrowLeft'],
    'right': ['ArrowRight', 'ArrowRight'],
    'a': ['w', 'KeyW'],
    'b': ['x', 'KeyX'],
    'start': ['Enter', 'Enter'],
    'select': ['Backspace', 'Backspace'],
    'l': ['a', 'KeyA'],
    'r': ['d', 'KeyD'],
  };
  const [keyV, code] = KEY_MAP[key.toLowerCase()] ?? [key, key];
  window.dispatchEvent(new KeyboardEvent('keydown', { key: keyV, code, bubbles: true }));
  setTimeout(() => {
    window.dispatchEvent(new KeyboardEvent('keyup', { key: keyV, code, bubbles: true }));
  }, holdMs);
}

async function _walk(dir: 'up' | 'down' | 'left' | 'right', steps = 1): Promise<void> {
  for (let i = 0; i < steps; i++) {
    _press(dir, 200);
    await new Promise<void>((resolve) => setTimeout(resolve, 250));
  }
}

async function _ai(plan: string[]): Promise<void> {
  for (const cmd of plan) {
    const trimmed = cmd.trim();
    if (trimmed.startsWith('wait ')) {
      const ms = parseInt(trimmed.slice(5), 10) * 16;  // frames → ms (60fps)
      await new Promise<void>((resolve) => setTimeout(resolve, ms));
      continue;
    }
    if (trimmed.startsWith('walk ')) {
      const [dir, n] = trimmed.slice(5).split(' ');
      await _walk(dir as 'up', parseInt(n ?? '1', 10));
      continue;
    }
    _press(trimmed);
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
  }
}

let _lastSnapshot: ReturnType<typeof _see> | null = null;

function _snapshot(): Record<string, unknown> {
  _lastSnapshot = _see();
  return { saved: 'use scope.compare() pour voir ce qui a changé' };
}

function _compare(): Record<string, unknown> {
  if (!_lastSnapshot) return { error: 'pas de snapshot — call scope.snapshot() avant' };
  const current = _see() as Record<string, unknown>;
  const prev = _lastSnapshot as Record<string, unknown>;
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(current)]);
  for (const k of allKeys) {
    const a = JSON.stringify(prev[k]);
    const b = JSON.stringify(current[k]);
    if (a !== b) diff[k] = { from: prev[k], to: current[k] };
  }
  return diff;
}

function _help(): string {
  return `
Pokémon Émeraude port — devtools "voir sans voir l'écran"
══════════════════════════════════════════════════════════

INSPECTION (read-only) :
  scope.where()        Position courante du player (string format)
  scope.whereObj()     Position structurée { map, x, y, facing, layoutId, ... }
  scope.see()          Snapshot complet : player + NPCs + flags + vars + state
  scope.npcs()         Tous les NPCs actifs avec coords + gfx + mvt
  scope.dialog()       Text actuellement dans le field message box
  scope.party()        Ton équipe Pokémon avec stats + moves
  scope.bag()          Ton sac par pocket
  scope.flags(prefix)  Flags actifs (filtre optionnel par prefix)
  scope.vars()         Vars non-zéro
  scope.script()       Script en cours : status + label + opcode actuel
  scope.battle()       État combat si actif
  scope.audio()        BGM + SE en cours
  scope.tile(x,y)      Metatile + behavior + collision + elevation à coords
  scope.time()         PC time + in-game RTC + play time
  scope.warp()         Last warp info
  scope.sprites(mode)  Liste sprites ('visible'|'invisible'|'all') + coords + anim
  scope.fade()         État du gPaletteFade (active, brightness, mode, etc.)
  scope.starterChoose() State du starter-choose-flow si en cours

DIFF :
  scope.snapshot()     Capture état courant
  scope.compare()      Diff vs snapshot précédent

CONTROLE :
  scope.press(key)     'up' 'down' 'left' 'right' 'a' 'b' 'start' 'select'
  scope.walk(dir, n)   Simule N pas dans direction
  scope.ai(plan)       Exécute plan ['up', 'walk right 3', 'wait 60', 'a']
  scope.skipDialog(ms) Auto-spam A jusqu'à dialog fermé (async, returns ok)
  scope.observe(fn,ms) Await jusqu'à predicate truthy (async, returns result)
  scope.gotoMap(id,x,y) Warp helper rapide (= 1:1 transition + scripts)

EX : await scope.ai(['walk down 5', 'a', 'wait 30', 'a', 'a'])
EX : await scope.observe(() => scope.battle().active)
EX : await scope.skipDialog()

BATTLE BYTECODE (session 140) :
  scope.bytecode.help()              Devtools complet pour wire bytecode → gameplay
  scope.bytecode.dumpMons()          gBattleMons[0..N] structured
  scope.bytecode.snapshot()          Full battle state (battlers + scripting + protect/disable/...)
  scope.bytecode.labels('Hit')       Labels filtrés
  scope.bytecode.runScript('BattleScript_EffectHit', { trace: true, resetStats: true })
  scope.bytecode.dispatchStats()     Opcodes appelés
  scope.bytecode.lastBug()           Dernière exception handler
`.trim();
}

function _warp(): Record<string, unknown> {
  return {
    pending: _g('__pendingWarp'),
    last: _g('__lastWarpDest'),
    inProgress: _g('__warpInProgress'),
  };
}

// ─── Session 133 add ─────────────────────────────────────────────────────────

/** List sprites with template name, coords, visibility. Useful pour debug
 *  les UI flows (= starter choose, battle, party screen) où on suspect
 *  des sprites résiduels post-cleanup. */
function _sprites(filter?: 'visible' | 'invisible' | 'all'): Array<Record<string, unknown>> {
  const mode = filter ?? 'visible';
  type SpriteShape = {
    spriteId?: number;
    x?: number; y?: number; y2?: number;
    invisible?: boolean;
    inUse?: boolean;
    _templateName?: string;
    animNum?: number;
    subpriority?: number;
    oamIndex?: number;
    objMode?: number;
    matrixNum?: number;
    callback?: { name?: string } | null;
  };
  const dev = _g<{ _rt?: { gSprites?: Map<number, SpriteShape> } }>('dev');
  const sprites = dev?._rt?.gSprites;
  if (!sprites) return [];
  const out: Array<Record<string, unknown>> = [];
  sprites.forEach((s, id) => {
    if (!s.inUse) return;
    const isInvisible = !!s.invisible;
    if (mode === 'visible' && isInvisible) return;
    if (mode === 'invisible' && !isInvisible) return;
    out.push({
      id,
      x: s.x,
      y: s.y,
      y2: s.y2 ?? 0,
      invisible: isInvisible,
      template: s._templateName ?? '?',
      anim: s.animNum,
      subpriority: s.subpriority,
      oamIndex: s.oamIndex,
      objMode: s.objMode,
      callback: s.callback?.name ?? null,
    });
  });
  return out;
}

/** Quick state du palette fade. Lit gPaletteFade via globalThis OR dev._rt
 *  (= notre runtime expose les deux selon le contexte de boot). */
function _fade(): Record<string, unknown> {
  type FadeShape = {
    active?: boolean;
    brightness?: number;
    mode?: number;
    currentFrame?: number;
    totalFrames?: number;
    startY?: number;
    endY?: number;
  };
  const dev = _g<{ _rt?: { gPaletteFade?: FadeShape } }>('dev');
  const pf = _g<FadeShape>('gPaletteFade') ?? dev?._rt?.gPaletteFade;
  if (!pf) return { error: 'gPaletteFade not exposed' };
  return {
    active: pf.active,
    brightness: pf.brightness,
    mode: pf.mode,
    currentFrame: pf.currentFrame,
    totalFrames: pf.totalFrames,
    startY: pf.startY,
    endY: pf.endY,
    isBlack: pf.brightness === 16 && !pf.active,
    isClear: pf.brightness === 0 && !pf.active,
  };
}

/** Auto-spam A jusqu'à dialog fermé ou timeout. Returns true si fermé,
 *  false si timeout. Utile pour avancer un msgbox long dans les tests. */
async function _skipDialog(maxMs = 30000): Promise<boolean> {
  const start = performance.now();
  let lastText = '';
  while (performance.now() - start < maxMs) {
    const d = _dialog() as { open?: boolean; text?: string };
    if (!d.open) return true;
    const txt = d.text ?? '';
    // Press A only if text stable (= done printing chars). Detect via 2-tick
    // identical text check.
    if (txt === lastText) {
      _press('a', 100);
    }
    lastText = txt;
    await new Promise<void>(r => setTimeout(r, 200));
  }
  return false;
}

/** Async wait until predicate returns truthy. Predicate is called every
 *  ~16ms (= ~1 frame). Returns the predicate result or null on timeout.
 *  Usage : await scope.observe(() => scope.where().includes('ROUTE101')) */
async function _observe<T>(predicate: () => T, maxMs = 30000): Promise<T | null> {
  const start = performance.now();
  while (performance.now() - start < maxMs) {
    try {
      const result = predicate();
      if (result) return result;
    } catch { /* keep trying */ }
    await new Promise<void>(r => setTimeout(r, 50));
  }
  return null;
}

/** Expose le state du starter-choose-flow si en cours. Le flow expose son
 *  state sur globalThis.__starterChooseState (set en début de tick()). */
function _starterChoose(): Record<string, unknown> {
  const state = _g<string>('__starterChooseState');
  const sel = _g<number>('__starterChooseSelection');
  const idx = _g<number>('__starterChooseChosen');
  if (state === undefined) return { active: false };
  return {
    active: true,
    state,
    selection: sel,
    chosen: idx,
    SELECTION_NAMES: ['TREECKO', 'TORCHIC', 'MUDKIP'],
  };
}

/** Warp helper : jump directement à une map à coords (x, y). Utilise
 *  le système warp interne, donc 1:1 effects (= map transition, BGM
 *  change, OnTransition script, OnFrame match). */
function _gotoMap(mapId: string, x: number, y: number): { ok: boolean; reason?: string } {
  const fn = _g<(mapId: string, x: number, y: number) => void>('__devGotoMap');
  if (!fn) return { ok: false, reason: 'no __devGotoMap fn exposed' };
  try { fn(mapId, x, y); return { ok: true }; }
  catch (e) { return { ok: false, reason: String(e) }; }
}

// Build the scope API as a fresh object on every install. We expose the latest
// fn references to support HMR re-install (= les nouvelles versions des _xxx
// après edit sont propagées au prochain install).
function _buildScopeApi(): Record<string, unknown> {
  return {
    // Inspection
    where: _where,
    whereObj: _whereObj,
    see: _see,
    npcs: _npcs,
    dialog: _dialog,
    party: _party,
    bag: _bag,
    flags: _flags,
    vars: _vars,
    script: _script,
    battle: _battle,
    audio: _audio,
    tile: _tile,
    time: _time,
    warp: _warp,
    sprites: _sprites,
    fade: _fade,
    starterChoose: _starterChoose,
    // Diff
    snapshot: _snapshot,
    compare: _compare,
    // Control
    press: _press,
    walk: _walk,
    ai: _ai,
    skipDialog: _skipDialog,
    observe: _observe,
    gotoMap: _gotoMap,
    // Battle bytecode devtools (Session 140 add).
    // Exposé sous scope.bytecode.* : runScript/dumpMons/dispatchStats/etc.
    bytecode: buildBattleDevtools(),
    // Help
    help: _help,
  };
}

export function installScopeDevtools(): void {
  if (typeof window === 'undefined') return;
  (window as unknown as { scope: Record<string, unknown> }).scope = _buildScopeApi();
  console.log('[scope] devtools installed — type `scope.help()` for usage');
}

// Session 133 add : Vite HMR re-install pour propager les fixes des helpers
// quand on edit dev-scope.ts. Sans ça, scope object capture les anciennes refs
// et il faut un reload page complet pour voir les changements.
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    installScopeDevtools();
    console.log('[scope] re-installed via HMR');
  });
}
