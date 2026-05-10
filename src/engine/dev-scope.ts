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
  // Session 127 fix : `gameState.map.name` au lieu de `gameState.data.location.__mapId`
  // (la 1ère structure était hypothétique, la vraie c'est `gameState.map.name`).
  const gs = _g<{
    data?: { location?: { __mapId?: string; mapName?: string } };
    map?: { name?: string };
    location?: { mapName?: string };
  }>('gameState');
  const mapId = gs?.map?.name
    ?? gs?.location?.mapName
    ?? gs?.data?.location?.__mapId
    ?? gs?.data?.location?.mapName
    ?? '?';
  if (!pa) return `${mapId} (no avatar)`;
  return `${mapId} (${pa.x},${pa.y}) facing ${_DIR_NAMES[pa.facing ?? 0]}`;
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
    pos: [o.currentCoordsX, o.currentCoordsY],
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
      pos: `(${o.currentCoordsX},${o.currentCoordsY})`,
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
  const sr = _g<{ status?: () => unknown; getCurrentLabel?: () => string }>('__scriptRuntime');
  const status = sr?.status?.() ?? 'no-runtime';
  const label = sr?.getCurrentLabel?.();
  return { status, currentLabel: label };
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
  scope.where()       Position courante du player
  scope.see()         Snapshot complet : player + NPCs + flags + vars + state
  scope.npcs()        Tous les NPCs actifs avec coords + gfx + mvt
  scope.dialog()      Text actuellement dans le field message box
  scope.party()       Ton équipe Pokémon avec stats + moves
  scope.bag()         Ton sac par pocket
  scope.flags(prefix) Flags actifs (filtre optionnel par prefix)
  scope.vars()        Vars non-zéro
  scope.script()      Script en cours d'exécution
  scope.battle()      État combat si actif
  scope.audio()       BGM + SE en cours
  scope.tile(x,y)     Metatile + behavior + collision + elevation à coords
  scope.time()        PC time + in-game RTC + play time
  scope.warp()        Last warp info

DIFF :
  scope.snapshot()    Capture état courant
  scope.compare()     Diff vs snapshot précédent

CONTROLE :
  scope.press(key)    'up' 'down' 'left' 'right' 'a' 'b' 'start' 'select'
  scope.walk(dir, n)  Simule N pas dans direction
  scope.ai(plan)      Exécute plan ['up', 'walk right 3', 'wait 60', 'a']

EX : scope.ai(['walk down 5', 'a', 'wait 30', 'a', 'a'])
`.trim();
}

function _warp(): Record<string, unknown> {
  return {
    pending: _g('__pendingWarp'),
    last: _g('__lastWarpDest'),
    inProgress: _g('__warpInProgress'),
  };
}

export function installScopeDevtools(): void {
  if (typeof window === 'undefined') return;
  (window as unknown as { scope: Record<string, unknown> }).scope = {
    where: _where,
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
    snapshot: _snapshot,
    compare: _compare,
    press: _press,
    walk: _walk,
    ai: _ai,
    help: _help,
  };
  console.log('[scope] devtools installed — type `scope.help()` for usage');
}
