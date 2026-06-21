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
} from '../../game/field_message_box';
import {
  gCamera as _gCamera,
  gFieldCamera as _gFieldCamera,
  gTotalCamera as _gTotalCamera,
  gSpriteCoordOffset as _gSpriteCoordOffset,
  GetCameraTopLeftCoords as _GetCameraTopLeftCoords,
  GetCameraPanX as _GetCameraPanX,
  GetCameraPanY as _GetCameraPanY,
} from '../../game/field_camera';
import { ScriptContext_SetupInlineBytecode, ArePlayerFieldControlsLocked } from '../script/script-runtime';
import { buildBattleDevtools } from '../battle/battle-devtools';
import { GBA_BUTTON_MASKS, type GbaButton } from '../../util/key-bindings';
import { setHeldKeysOverride, clearHeldKeysOverride } from '../system/input-handler';
import type { DecompRuntime } from '../system/decomp-runtime';
import * as decompBridge from '../system/decomp-bridge';
// Devtools post-refactor 2026-05-23 : flags/vars vivent direct dans
// gSaveBlock1Ptr (= class GameState éliminée). Import direct pour _flags()/_vars().
import { gSaveBlock1Ptr as _sb1 } from '../save/save-block-state';
import { MAP_OFFSET } from '../decomp-data/include/fieldmap-data';

// 1:1 décomp `MAP_OFFSET = 7` (include/fieldmap.h:9).
// Migré vers import decomp-data fieldmap-data.ts (cleanup B7).

/** Reverse map metatileBehavior value → name (= 'MB_LONG_GRASS' pour 3).
 *  Construit au boot par scan de decomp-bridge exports. */
const _MB_REVERSE_MAP: Record<number, string> = (() => {
  const out: Record<number, string> = {};
  for (const [k, v] of Object.entries(decompBridge)) {
    if (k.startsWith('MB_') && typeof v === 'number') out[v] = k;
  }
  return out;
})();

function _behaviorName(behavior: number): string {
  return _MB_REVERSE_MAP[behavior] ?? `MB_UNKNOWN(0x${behavior.toString(16)})`;
}

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

/** Helper 1:1 strict (post R3 refactor) : lit position player depuis le bon
 *  endroit. Décomp `gPlayerAvatar` struct contient flags/runningState/etc.
 *  MAIS pas les coords ; celles-ci vivent sur `gObjectEvents[pa.objectEventId]
 *  .currentCoords{X,Y}`. Facing aussi sur l'objectEvent.
 *  Notre projet : `gSaveBlock1Ptr.pos.{x,y}` est la source unique LOGIQUE
 *  (= map JSON coords, sync via Proxy). __facing aussi web-stocké sur sb1. */
function _readPlayerPos(): { x?: number; y?: number; facing?: number } {
  const sb1 = _sb1 as { pos?: { x?: number; y?: number }; __facing?: number };
  return {
    x: sb1.pos?.x,
    y: sb1.pos?.y,
    facing: sb1.__facing,
  };
}

/** Returns "MAP_X (col, row) facing DIR" string. */
function _where(): string {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  // Session 133 fix : `gMapHeader.id` est synced après traversal de connection
  // (= aller Littleroot → Route101 via exit nord). `gSaveBlock1Ptr.location.mapName`
  // reste figé sur la map primaire du warp.
  // Refactor 2026-05-23 : gameState éliminé → fallback __mapId direct sb1.
  const hdr = _g<{ id?: string }>('gMapHeader');
  const sb1 = _sb1 as { __mapId?: string; location?: { mapName?: string } };
  const mapId = hdr?.id
    ?? sb1.__mapId
    ?? sb1.location?.mapName
    ?? '?';
  if (!pa) return `${mapId} (no avatar)`;
  // Refactor 2026-05-23 : coords/facing depuis sb1.pos + __facing (= source
  // unique LOGIQUE post R3 cleanup), pas gPlayerAvatar.x/y (qui n'existent pas).
  const pos = _readPlayerPos();
  return `${mapId} (${pos.x},${pos.y}) facing ${_DIR_NAMES[pos.facing ?? 0]}`;
}

/** Session 133 add : version objet structurée pour query précis.
 *  Post refactor 2026-05-23 : coords/facing depuis sb1.pos/__facing (source
 *  unique LOGIQUE) ; pa = state machine bits seulement. */
function _whereObj(): Record<string, unknown> {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  const hdr = _g<{
    id?: string;
    mapLayoutId?: string;
    regionMapSectionId?: string;
    music?: string;
  }>('gMapHeader');
  const sb1 = _sb1 as { location?: { mapGroup?: number; mapNum?: number } };
  const pos = _readPlayerPos();
  return {
    map: hdr?.id ?? '?',
    x: pos.x,
    y: pos.y,
    facing: _DIR_NAMES[pos.facing ?? 0],
    layoutId: hdr?.mapLayoutId,
    regionMapSection: hdr?.regionMapSectionId,
    music: hdr?.music,
    primaryMapGroup: sb1?.location?.mapGroup,
    primaryMapNum: sb1?.location?.mapNum,
    elevation: pa?.currentElevation,
    // 1:1 post étape 1b-iii : « walking » = en translation réelle = tileTransitionState != T_NOT_MOVING
    // (l'ancien `stepFramesLeft > 0` n'est plus posé sur le chemin déverrouillé — le held movement
    // EST le timer du pas ; tileTransitionState est dérivé du held par UpdatePlayerAvatarTransitionState).
    walking: (pa?.tileTransitionState ?? 0) !== 0,
  };
}

/** Snapshot complet de l'état overworld pour comparaison frame-by-frame.
 *  Post refactor 2026-05-23 : flags/vars/party lus direct depuis gSaveBlock1Ptr
 *  (= 1:1 décomp gSaveBlock1Ptr deref pattern). class GameState éliminée. */
function _see(): Record<string, unknown> {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  const sb1 = _sb1 as {
    location?: Record<string, unknown>;
    playerParty?: unknown[];
    flags?: Record<string, boolean>;
    vars?: Record<string, number>;
  };
  const flags = sb1.flags ?? {};
  const vars = sb1.vars ?? {};
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
  const playerPos = _readPlayerPos();
  return {
    where: _where(),
    player: pa
      ? { x: playerPos.x, y: playerPos.y, facing: _DIR_NAMES[playerPos.facing ?? 0],
          gender: pa.gender, walking: (pa.tileTransitionState ?? 0) !== 0,
          elevation: pa.currentElevation }
      : null,
    location: sb1.location,
    activeNpcs: activeNpcs.length,
    npcsList: activeNpcs,
    partyCount: sb1.playerParty?.length ?? 0,
    flagsCount: Object.keys(flags).filter(k => flags[k]).length,
    introState: vars['VAR_LITTLEROOT_INTRO_STATE'] ?? 0,
    routeState: vars['VAR_ROUTE101_STATE'] ?? 0,
    rivalState: vars['VAR_LITTLEROOT_RIVAL_STATE'] ?? 0,
    birchLabState: vars['VAR_BIRCH_LAB_STATE'] ?? 0,
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
  // 1:1 strict refactor 2026-05-23 : party vit direct dans gSaveBlock1Ptr.playerParty
  // (= 1:1 décomp gPlayerParty[6]).
  const sb1 = _sb1 as { playerParty?: unknown[] };
  return (sb1.playerParty ?? []).map((m: unknown, i: number) => {
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
  // 1:1 strict refactor 2026-05-23 : bag vit direct dans gSaveBlock1Ptr.bagPocket_*
  // (= 1:1 décomp gBagPockets[5] avec 5 fields nommés). class GameState éliminée.
  const sb1 = _sb1 as {
    bagPocket_Items?: Array<{ itemId?: string; itemKey?: string; quantity?: number }>;
    bagPocket_KeyItems?: Array<{ itemId?: string; itemKey?: string; quantity?: number }>;
    bagPocket_PokeBalls?: Array<{ itemId?: string; itemKey?: string; quantity?: number }>;
    bagPocket_TMHM?: Array<{ itemId?: string; itemKey?: string; quantity?: number }>;
    bagPocket_Berries?: Array<{ itemId?: string; itemKey?: string; quantity?: number }>;
  };
  const pockets: Record<string, Array<{ itemId?: string; itemKey?: string; quantity?: number }>> = {
    Items: sb1.bagPocket_Items ?? [],
    KeyItems: sb1.bagPocket_KeyItems ?? [],
    PokeBalls: sb1.bagPocket_PokeBalls ?? [],
    TMHM: sb1.bagPocket_TMHM ?? [],
    Berries: sb1.bagPocket_Berries ?? [],
  };
  const out: Record<string, Array<{ item: string; qty: number }>> = {};
  for (const [pocket, items] of Object.entries(pockets)) {
    // Filter pour ne montrer QUE les slots non-vides.
    out[pocket] = items
      .filter((it) => (it?.itemId || it?.itemKey) && (it.quantity ?? 0) > 0)
      .map((it) => ({
        item: (it?.itemId ?? it?.itemKey ?? '?').replace(/^ITEM_/, ''),
        qty: it?.quantity ?? 0,
      }));
  }
  return out;
}

function _flags(filterPrefix?: string): string[] {
  // 1:1 strict (session 2026-05-23 refactor) : flags vivent direct dans
  // gSaveBlock1Ptr.flags (= Record<string, boolean>). Ancien `gameState.getAllFlagNames`
  // wrapper éliminé. Iter direct sur les keys.
  const flags = (_sb1 as { flags?: Record<string, boolean> }).flags ?? {};
  const all = Object.keys(flags).filter(k => flags[k]);
  if (filterPrefix) return all.filter(f => f.startsWith(filterPrefix));
  return all;
}

function _vars(): Record<string, number> {
  // 1:1 strict : vars vivent direct dans gSaveBlock1Ptr.vars.
  const all = (_sb1 as { vars?: Record<string, number> }).vars ?? {};
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

/** Tile inspector enrichi : retourne metatile + behavior NAMED + collision +
 *  elevation + warp/coord/bg event si applicable. Coords prises en LOGICAL
 *  (= map JSON convention) pour matcher ce que l'user voit dans Tiled. */
function _tile(x: number, y: number): Record<string, unknown> {
  const collFn = _g<(x: number, y: number) => number>('MapGridGetCollisionAt');
  const behFn = _g<(x: number, y: number) => number>('MapGridGetMetatileBehaviorAt');
  const elevFn = _g<(x: number, y: number) => number>('MapGridGetElevationAt');
  const idFn = _g<(x: number, y: number) => number>('MapGridGetMetatileIdAt');
  const xx = x + MAP_OFFSET;
  const yy = y + MAP_OFFSET;
  const behavior = behFn?.(xx, yy) ?? 0;
  const collision = collFn?.(xx, yy) ?? 0;

  // Lookup events at LOGICAL (x, y).
  const hdr = _g<{ events?: { warps?: Array<{ x: number; y: number; warpId: number; destMap: string }>;
                              coordEvents?: Array<{ x: number; y: number; trigger: string; index: number; script: string }>;
                              bgEvents?: Array<{ x: number; y: number; kind: string; script: string; playerFacingDir?: string }>;
                            } }>('gMapHeader');
  const warp = hdr?.events?.warps?.find(w => w.x === x && w.y === y);
  const coordEvent = hdr?.events?.coordEvents?.find(c => c.x === x && c.y === y);
  const bgEvent = hdr?.events?.bgEvents?.find(b => b.x === x && b.y === y);

  return {
    coords: [x, y],
    coordsInternal: [xx, yy],
    metatileId: idFn?.(xx, yy),
    collision,
    behavior: _behaviorName(behavior),
    behaviorRaw: '0x' + behavior.toString(16),
    elevation: elevFn?.(xx, yy),
    warp: warp ? { destMap: warp.destMap, warpId: warp.warpId } : null,
    coordEvent: coordEvent ? {
      trigger: coordEvent.trigger, index: coordEvent.index, script: coordEvent.script,
    } : null,
    bgEvent: bgEvent ? {
      kind: bgEvent.kind, script: bgEvent.script, facing: bgEvent.playerFacingDir,
    } : null,
  };
}

/** Audit slot 0 ↔ gPlayerAvatar. Post R3 refactor (= storage INTERNAL), le
 *  slot 0 currentCoords doit toujours satisfaire `slot.cur = pa + MAP_OFFSET`.
 *  Si drift détecté, c'est un bug du sync à signaler. */
function _coords(): Record<string, unknown> {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  const objs = _g<ObjectEvent[]>('__gObjectEvents') ?? [];
  const slot0 = objs[0];
  if (!pa) return { error: 'no gPlayerAvatar' };
  if (!slot0) return { error: 'no slot 0 (= runtime not ready)' };
  // Post R3 : coords LOGIQUES depuis gSaveBlock1Ptr.pos (source unique). pa.x/y
  // n'existent plus sur le struct gPlayerAvatar → lisait 0 → drift faux-positif.
  const _pp = _readPlayerPos();
  const paX = _pp.x ?? 0;
  const paY = _pp.y ?? 0;
  const expectedSlotX = paX + MAP_OFFSET;
  const expectedSlotY = paY + MAP_OFFSET;
  const slotCurX = (slot0 as { currentCoordsX?: number }).currentCoordsX ?? -1;
  const slotCurY = (slot0 as { currentCoordsY?: number }).currentCoordsY ?? -1;
  const drift = slotCurX !== expectedSlotX || slotCurY !== expectedSlotY;
  return {
    gPlayerAvatar_LOGICAL: { x: paX, y: paY, facing: _DIR_NAMES[_pp.facing ?? 0] },
    slot0_INTERNAL: {
      cur: [slotCurX, slotCurY],
      prev: [(slot0 as { previousCoordsX?: number }).previousCoordsX,
             (slot0 as { previousCoordsY?: number }).previousCoordsY],
      initial: [(slot0 as { initialCoordsX?: number }).initialCoordsX,
                (slot0 as { initialCoordsY?: number }).initialCoordsY],
    },
    slot0_DERIVED_LOGICAL: {
      cur: [slotCurX - MAP_OFFSET, slotCurY - MAP_OFFSET],
      prev: [((slot0 as { previousCoordsX?: number }).previousCoordsX ?? MAP_OFFSET) - MAP_OFFSET,
             ((slot0 as { previousCoordsY?: number }).previousCoordsY ?? MAP_OFFSET) - MAP_OFFSET],
      initial: [((slot0 as { initialCoordsX?: number }).initialCoordsX ?? MAP_OFFSET) - MAP_OFFSET,
                ((slot0 as { initialCoordsY?: number }).initialCoordsY ?? MAP_OFFSET) - MAP_OFFSET],
    },
    expected_slot0_INTERNAL: [expectedSlotX, expectedSlotY],
    drift,
    driftDetail: drift
      ? `slot0.cur(${slotCurX},${slotCurY}) ≠ pa(${paX},${paY})+OFFSET(7)=(${expectedSlotX},${expectedSlotY})`
      : 'OK 1:1 strict R3',
    note: 'INTERNAL = LOGICAL + MAP_OFFSET (= 7). Post R3 storage refactor.',
  };
}

/** Resolve metatile behavior number → name (= MB_LONG_GRASS). */
function _behaviorNameExposed(behavior: number | string): string {
  const num = typeof behavior === 'string'
    ? parseInt(behavior.replace(/^0x/, ''), 16)
    : behavior;
  return _behaviorName(num);
}

/** List events de la map courante : warps + coord triggers + bg events.
 *  Permet d'auditer ce qui peut se déclencher sur la map. */
function _events(): Record<string, unknown> {
  const hdr = _g<{ id?: string; events?: {
    warps?: Array<{ x: number; y: number; warpId: number; destMap: string; elevation: number }>;
    coordEvents?: Array<{ x: number; y: number; trigger: string; index: number; script: string }>;
    bgEvents?: Array<{ x: number; y: number; kind: string; script: string; playerFacingDir?: string }>;
    objectEvents?: Array<{ localId: number | string; x: number; y: number; graphicsId?: string; script?: string; flagId?: string }>;
  } }>('gMapHeader');
  const ev = hdr?.events;
  if (!ev) return { error: 'no gMapHeader.events', map: hdr?.id };
  return {
    map: hdr?.id,
    warps: (ev.warps ?? []).map((w, i) => ({
      idx: i, at: [w.x, w.y], elev: w.elevation, to: w.destMap, warpId: w.warpId,
    })),
    coordEvents: (ev.coordEvents ?? []).map((c, i) => ({
      idx: i, at: [c.x, c.y], var: c.trigger, value: c.index, script: c.script,
    })),
    bgEvents: (ev.bgEvents ?? []).map((b, i) => ({
      idx: i, at: [b.x, b.y], kind: b.kind, script: b.script, facing: b.playerFacingDir,
    })),
    objectTemplates: (ev.objectEvents ?? []).length,
  };
}

/** Find NPCs par filtre : localIdRaw, gfx, script substring (case-insensitive). */
function _findNpc(filter: string): Array<Record<string, unknown>> {
  const objs = _g<ObjectEvent[]>('__gObjectEvents') ?? [];
  const q = filter.toLowerCase();
  return objs.map((o, i) => ({ slot: i, npc: o })).filter(({ npc }) => {
    if (!npc?.active) return false;
    if ((npc.localIdRaw ?? '').toLowerCase().includes(q)) return true;
    if ((npc.graphicsId ?? '').toLowerCase().includes(q)) return true;
    if ((npc.scriptLabel ?? '').toLowerCase().includes(q)) return true;
    return false;
  }).map(({ slot, npc }) => ({
    slot,
    id: npc.localIdRaw ?? `localId=${npc.localId}`,
    gfx: npc.graphicsId,
    pos: [(npc.currentCoordsX ?? MAP_OFFSET) - MAP_OFFSET, (npc.currentCoordsY ?? MAP_OFFSET) - MAP_OFFSET],
    facing: _DIR_NAMES[npc.facingDirection ?? 0],
    mvt: npc.movementType,
    script: npc.scriptLabel,
    visible: !npc.invisible,
  }));
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

// ─── Input control via heldKeys override (= canonical) ──────────────────────
// Avant : `_press` faisait `window.dispatchEvent(KeyboardEvent)` qui ne marche
// que si le canvas a le focus + dépend du keymap localStorage. La nouvelle
// version écrit DIRECTEMENT dans `rt.gMain.heldKeys` via `setHeldKeysOverride`,
// donc :
//   - 100% fiable (= pas de dépendance focus, layout clavier, AZERTY vs QWERTY)
//   - bypass le binding remap user-side (= 'up' = UP_BUTTON mask, point)
//   - bloque le clavier natif tant que l'override actif (= no race)

const _KEY_TO_BUTTON: Record<string, GbaButton> = {
  up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT',
  a: 'A', b: 'B', start: 'START', select: 'SELECT',
  l: 'L', r: 'R',
};

function _maskForKey(key: string): number {
  const button = _KEY_TO_BUTTON[key.toLowerCase()];
  return button ? GBA_BUTTON_MASKS[button] : 0;
}

function _rtSafe(): DecompRuntime | null {
  const dev = _g<{ _rt?: DecompRuntime }>('dev');
  return dev?._rt ?? null;
}

function _sleep(ms: number): Promise<void> {
  return new Promise<void>(r => setTimeout(r, ms));
}

/** Press = pulse mask pendant holdMs puis release. Suffit pour déclencher
 *  un newKeys edge (= bouton A → confirm dialog, START → menu, etc.). */
async function _press(key: string, holdMs = 80): Promise<{ ok: boolean; reason?: string }> {
  const mask = _maskForKey(key);
  if (mask === 0) return { ok: false, reason: `unknown key '${key}' (valid: up/down/left/right/a/b/start/select/l/r)` };
  const rt = _rtSafe();
  if (!rt) {
    // Fallback dispatchEvent si runtime pas exposé (= probablement test offline).
    const KEY_MAP: Record<string, [string, string]> = {
      up: ['ArrowUp', 'ArrowUp'], down: ['ArrowDown', 'ArrowDown'],
      left: ['ArrowLeft', 'ArrowLeft'], right: ['ArrowRight', 'ArrowRight'],
      a: ['w', 'KeyW'], b: ['x', 'KeyX'],
      start: ['Enter', 'Enter'], select: ['Backspace', 'Backspace'],
      l: ['a', 'KeyA'], r: ['d', 'KeyD'],
    };
    const [keyV, code] = KEY_MAP[key.toLowerCase()] ?? [key, key];
    window.dispatchEvent(new KeyboardEvent('keydown', { key: keyV, code, bubbles: true }));
    await _sleep(holdMs);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: keyV, code, bubbles: true }));
    return { ok: true, reason: 'fallback dispatchEvent (no rt exposed)' };
  }
  setHeldKeysOverride(rt, mask);
  await _sleep(holdMs);
  // setHeldKeysOverride(null) libère mais NE met PAS heldKeys à 0 → le mask
  // reste actif 1 frame de plus côté décomp ⇒ overshoot d'un step. Le set
  // explicite à 0 sous override puis clear évite ce bug.
  setHeldKeysOverride(rt, 0);
  clearHeldKeysOverride(rt);
  // Petit délai post-release pour que la frame suivante détecte release.
  await _sleep(40);
  return { ok: true };
}

/** Walk = hold direction mask jusqu'à observer N steps faits (= pa.x/y change),
 *  ou timeout. Retourne nombre de steps actually walked (peut être < requested
 *  si bloqué par collision ou warp). */
async function _walk(dir: 'up' | 'down' | 'left' | 'right', steps = 1): Promise<{
  ok: boolean; walked: number; blocked: boolean; reason?: string;
}> {
  const mask = _maskForKey(dir);
  if (mask === 0) return { ok: false, walked: 0, blocked: false, reason: `bad direction '${dir}'` };
  const rt = _rtSafe();
  if (!rt) {
    // Fallback dispatchEvent path (= legacy).
    for (let i = 0; i < steps; i++) {
      await _press(dir, 200);
      await _sleep(250);
    }
    return { ok: true, walked: steps, blocked: false, reason: 'fallback dispatchEvent (no rt exposed)' };
  }
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  if (!pa) return { ok: false, walked: 0, blocked: false, reason: 'no gPlayerAvatar' };
  setHeldKeysOverride(rt, mask);
  let walked = 0;
  // Post R3 : coords LOGIQUES depuis gSaveBlock1Ptr.pos (pa.x/y n'existent plus,
  // lisaient 0 → la détection de mouvement échouait → "stuck" faux-positif).
  const _pp0 = _readPlayerPos();
  let lastX = _pp0.x ?? 0;
  let lastY = _pp0.y ?? 0;
  let stuckTicks = 0;
  const tickMs = 25;
  const maxStuckTicks = Math.ceil(800 / tickMs);  // ~800ms de patience avant déclarer bloqué
  const maxTotalMs = steps * 600 + 2000;
  const startMs = performance.now();
  while (walked < steps && performance.now() - startMs < maxTotalMs) {
    await _sleep(tickMs);
    const _ppc = _readPlayerPos();
    const curX = _ppc.x ?? 0;
    const curY = _ppc.y ?? 0;
    const dx = Math.abs(curX - lastX);
    const dy = Math.abs(curY - lastY);
    if (dx + dy > 0) {
      walked += dx + dy;  // distance taxicab = nombre de tiles parcourus depuis dernier check
      lastX = curX; lastY = curY;
      stuckTicks = 0;
    } else {
      stuckTicks++;
      if (stuckTicks >= maxStuckTicks) {
        // Bloqué : collision, dialog, script qui prend la main, etc.
        // setHeldKeysOverride(null) libère mais NE met PAS heldKeys à 0 → le mask
  // reste actif 1 frame de plus côté décomp ⇒ overshoot d'un step. Le set
  // explicite à 0 sous override puis clear évite ce bug.
  setHeldKeysOverride(rt, 0);
  clearHeldKeysOverride(rt);
        await _sleep(50);
        return { ok: walked > 0, walked, blocked: true, reason: 'stuck (collision / dialog / busy script)' };
      }
    }
  }
  // Release ASAP — minimise overshoot (= step suivant initié sur frame en cours).
  // setHeldKeysOverride(null) libère mais NE met PAS heldKeys à 0 → le mask
  // reste actif 1 frame de plus côté décomp ⇒ overshoot d'un step. Le set
  // explicite à 0 sous override puis clear évite ce bug.
  setHeldKeysOverride(rt, 0);
  clearHeldKeysOverride(rt);
  // Laisser la frame courante finir son walk anim.
  await _sleep(280);
  return { ok: walked >= steps, walked, blocked: walked < steps };
}

/** AI = mini-DSL pour scripter une suite d'actions.
 *  Reconnaît : 'up'/'down'/'left'/'right'/'a'/'b'/'start'/'select'/'l'/'r',
 *    'walk <dir> <n>', 'wait <frames>', 'sleep <ms>', 'snap' (= snapshot diff). */
async function _ai(plan: string[]): Promise<Array<Record<string, unknown>>> {
  const log: Array<Record<string, unknown>> = [];
  for (const cmd of plan) {
    const trimmed = cmd.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('wait ')) {
      const ms = parseInt(trimmed.slice(5), 10) * 16;  // frames → ms (60fps)
      await _sleep(ms);
      log.push({ cmd: trimmed, kind: 'wait', ms });
      continue;
    }
    if (trimmed.startsWith('sleep ')) {
      const ms = parseInt(trimmed.slice(6), 10);
      await _sleep(ms);
      log.push({ cmd: trimmed, kind: 'sleep', ms });
      continue;
    }
    if (trimmed.startsWith('walk ')) {
      const [dirRaw, n] = trimmed.slice(5).split(' ');
      const r = await _walk(dirRaw as 'up', parseInt(n ?? '1', 10));
      log.push({ cmd: trimmed, kind: 'walk', ...r });
      continue;
    }
    if (trimmed === 'snap') {
      _lastSnapshot = _see();
      log.push({ cmd: trimmed, kind: 'snap', ok: true });
      continue;
    }
    const r = await _press(trimmed);
    log.push({ cmd: trimmed, kind: 'press', ...r });
    await _sleep(80);
  }
  return log;
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
  scope.where()           Position du player (string)
  scope.whereObj()        Position structurée { map, x, y, facing, layoutId, ... }
  scope.see()             Snapshot complet : player + NPCs + flags + vars + state
  scope.npcs()            Tous les NPCs actifs (coords LOGICAL, gfx, mvt)
  scope.dialog()          Text actuellement dans le field message box
  scope.party()           Ton équipe Pokémon avec stats + moves
  scope.bag()             Ton sac par pocket
  scope.flags(prefix)     Flags actifs (filtre optionnel par prefix)
  scope.vars()            Vars non-zéro
  scope.script()          Script en cours : status + label + opcode actuel
  scope.battle()          État combat si actif
  scope.audio()           BGM + SE en cours
  scope.tile(x,y)         Metatile + behaviorName + warp + coordEvent + bgEvent
  scope.time()            PC time + in-game RTC + play time
  scope.warp()            Last warp info
  scope.sprites(mode)     Liste sprites ('visible'|'invisible'|'all')
  scope.fade()            État du gPaletteFade (active, brightness, mode, etc.)
  scope.starterChoose()   State du starter-choose-flow si en cours

OW INSPECTION (post R3 INTERNAL/LOGICAL coords audit) :
  scope.coords()          Audit slot 0 ↔ gPlayerAvatar : drift detect 1:1 strict
  scope.behaviorName(n)   3 → 'MB_LONG_GRASS' (= reverse lookup)
  scope.events()          Warps + coordEvents + bgEvents de la map courante
  scope.findNpc(q)        Find NPCs par localIdRaw/gfx/script substring
  scope.map(opts?)        Map ASCII (15×11 par défaut) avec player + NPCs + collision
  scope.movement()        State machine MovementAction_* du player + NPCs

NAVIGATION SPATIALE (= « connais la carte + déplace-toi/tp JUSTE ») :
  scope.find(q)           Trouve features/PNJ + case d'APPROCHE walkable + direction.
                          q : 'water'|'waterfall'|'grass'|'sand'|'cave'|'ice'|'door'|
                          'ladder'|'warp'|'arrow_warp'|'walkable'/'land'|'ledge',
                          un substring de nom MB, ou 'npc'/'npc:<substr>'. Trié par dist.
  await scope.approach(q) One-shot : find le + proche → pathfind à l'approche → regarde
                          la cible (pour interagir/surfer). Ex: await scope.approach('water')
  scope.here()            ⚑ APRÈS UN TP : suis-je coincé ? cases walkables autour +
                          nearestWalkable si bloqué. (évite « tp dans un mur/bâtiment »)
  scope.nearestWalkable(x,y) Case walkable la plus proche (ring search)

DIAGNOSTIC INPUT (= debug "je peux plus marcher") :
  scope.canWalk()         Liste des 9 gates PlayerStep + 🔴/✅ par gate
  scope.diag()            Diagnostic complet : blockers + coords drift + pa state
  scope.locks()           Tous les locks/freeze actifs (sLockFieldControls, fade, frozenNpcs)

SCRIPT :
  scope.scriptHistory(n)  N derniers opcodes exécutés (ring buffer 256)
  scope.scriptHistoryClear() Reset ring buffer
  scope.action(op,...args) Exec opcode isolé (= scope.action('msgbox', 'X_EventScript_PC'))

CAMERA :
  scope.cam()             Dump gCamera + gFieldCamera + gSpriteCoordOffset + topLeft

RECORDER (= record/replay scénarios input) :
  scope.recorder.start()  Démarre record du heldKeys (poll 16ms)
  scope.recorder.stop()   Stop record, retourne Recording { events, totalMs }
  scope.recorder.replay(rec|name, {speed?})
                          Rejoue un Recording (ou un name localStorage)
  scope.recorder.save(name, rec) / load(name) / list() / delete(name)
  scope.recorder.state()  État courant du record en cours

DIFF :
  scope.snapshot()        Capture état courant
  scope.compare()         Diff vs snapshot précédent

CONTROLE (via gMain.heldKeys override, plus de KeyboardEvent fallible) :
  scope.press(key)        'up'/'down'/'left'/'right'/'a'/'b'/'start'/'select'/'l'/'r'
  scope.walk(dir, n)      Walk N tiles, detect collision/blocage, return walked count
  scope.go(x, y)          Pathfinder A* simple → drive jusqu'à (x,y) LOGICAL
  scope.ai(plan)          Mini-DSL : ['up', 'walk right 3', 'wait 60', 'snap', 'a']
  scope.skipDialog(ms?)   Auto-spam A jusqu'à dialog fermé
  scope.observe(fn,ms?)   Await jusqu'à predicate truthy
  scope.gotoMap(id,x,y)   Warp helper rapide (= 1:1 transition + scripts)

EXEMPLES :
  await scope.go(5, 12)
  await scope.ai(['walk down 5', 'a', 'wait 30', 'a', 'a'])
  await scope.observe(() => scope.battle().active)
  await scope.skipDialog()
  scope.map({width: 25, height: 17})

BATTLE BYTECODE (session 140) :
  scope.bytecode.help()              Devtools complet pour wire bytecode → gameplay
  scope.bytecode.dumpMons()          gBattleMons[0..N] structured
  scope.bytecode.snapshot()          Full battle state (battlers + scripting + ...)
  scope.bytecode.labels('Hit')       Labels filtrés
  scope.bytecode.runScript(label)    Run script en mode trace ou reset stats
  scope.bytecode.dispatchStats()     Opcodes appelés
  scope.bytecode.lastBug()           Dernière exception handler

AUTRES NAMESPACES — voir scope.helpAll() pour la surface complète :
  dev.*            Frame control / savestates / pixel trace / hooks (engine-devtools)
  dev.audit.*      State / save / assets / party / bag / flags / tile ASCII
  dev.breakpoint.* Pause auto sur fade-out/fade-in/map-change/palette leak
  dev.bridge.*     Coverage du decomp-bridge (helpers manquants, % couverture)
`.trim();
}

/** Help GLOBAL : dump complet de toutes les surfaces dispo. */
function _helpAll(): string {
  const sections: string[] = [];
  sections.push(_help());
  // Délégation à chaque sous-namespace si dispo.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = globalThis as any;
  if (typeof w.dev?.help === 'function') {
    sections.push('\n\n═══ dev.* (engine-devtools) ═══\n' + w.dev.help());
  }
  if (typeof w.dev?.audit?.help === 'function') {
    sections.push('\n\n═══ dev.audit.* ═══\n' + w.dev.audit.help());
  }
  if (typeof w.dev?.breakpoint?.help === 'function') {
    sections.push('\n\n═══ dev.breakpoint.* ═══\n' + w.dev.breakpoint.help());
  }
  if (typeof w.dev?.bridge?.help === 'function') {
    sections.push('\n\n═══ dev.bridge.* ═══\n' + w.dev.bridge.help());
  }
  return sections.join('\n');
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
  const dev = _g<{ _rt?: { gSprites?: Array<SpriteShape | undefined> } }>('dev');
  const sprites = dev?._rt?.gSprites;
  if (!sprites) return [];
  const out: Array<Record<string, unknown>> = [];
  sprites.forEach((s, id) => {
    if (!s || !s.inUse) return;
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

// ─── Map ASCII visualizer ────────────────────────────────────────────────────
// "Voir sans voir l'écran" : dump une fenêtre de la map en ASCII avec overlays
// player + NPCs + collision + behavior + warps. Utile pour audit OW sans canvas.

const _FACING_SYMBOL: Record<number, string> = {
  1: 'v',  // SOUTH
  2: '^',  // NORTH
  3: '<',  // WEST
  4: '>',  // EAST
};

function _behaviorSymbol(behavior: number, collision: number): string {
  // collision != 0 → wall (toujours). 0 = walkable.
  if (collision !== 0) return '#';
  // Group par catégorie pour rester lisible.
  // Grass : MB_TALL_GRASS=2, MB_LONG_GRASS=3, MB_LONG_GRASS_SOUTH_EDGE=9, MB_ASHGRASS=0x24
  if (behavior === 0x02 || behavior === 0x03 || behavior === 0x09 || behavior === 0x24) return '~';
  // Water : MB_POND_WATER=0x10, MB_INTERIOR_DEEP_WATER=0x11, MB_DEEP_WATER=0x12,
  //         MB_SOOTOPOLIS_DEEP_WATER=0x14, MB_OCEAN_WATER=0x15, MB_PUDDLE=0x16,
  //         MB_SHALLOW_WATER=0x17, MB_UNUSED_SOOTOPOLIS_DEEP_WATER=0x18,
  //         MB_NO_SURFACING=0x19, MB_UNUSED_SOOTOPOLIS_DEEP_WATER_2=0x1A
  if (behavior >= 0x10 && behavior <= 0x1A) return 'W';
  // Waterfall : MB_WATERFALL=0x13
  if (behavior === 0x13) return 'F';
  // Sand : MB_DEEP_SAND=0x06, MB_SAND=0x21 — 'd' pour éviter clash avec sign 's'.
  if (behavior === 0x06 || behavior === 0x21) return 'd';
  // Cave : MB_CAVE=0x08
  if (behavior === 0x08) return 'c';
  // Ice : MB_ICE=0x20, MB_THIN_ICE=0x26, MB_CRACKED_ICE=0x27
  if (behavior === 0x20 || behavior === 0x26 || behavior === 0x27) return 'i';
  // Doors : MB_NON_ANIMATED_DOOR=0x60, MB_ANIMATED_DOOR=0x69, MB_WATER_DOOR=0x6C
  if (behavior === 0x60 || behavior === 0x69 || behavior === 0x6C) return 'D';
  // Ladders : MB_LADDER=0x61
  if (behavior === 0x61) return 'L';
  // Arrow warps : MB_EAST_ARROW_WARP=0x62..MB_SOUTH_ARROW_WARP=0x65
  if (behavior >= 0x62 && behavior <= 0x65) return '>';
  // Generic walkable.
  if (behavior === 0x00) return '.';
  return ',';
}

/** Map ASCII viewer.
 *
 *  Usage :
 *    scope.map()                       → 15×11 centré sur player
 *    scope.map({width: 25, height: 17}) → fenêtre plus large
 *    scope.map({centerX: 10, centerY: 5}) → centré ailleurs
 *
 *  Legend retournée dans la 2e ligne du dump. */
function _map(opts?: { width?: number; height?: number; centerX?: number; centerY?: number }): string {
  const width = opts?.width ?? 15;
  const height = opts?.height ?? 11;
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  if (!pa) return 'no gPlayerAvatar';
  // Post R3 : centre par défaut sur la position LOGIQUE du player (sb1.pos),
  // pas pa.x/y (qui n'existent plus → centrait la map sur (0,0)).
  const _pp = _readPlayerPos();
  const cx = opts?.centerX ?? _pp.x ?? 0;
  const cy = opts?.centerY ?? _pp.y ?? 0;
  const collFn = _g<(x: number, y: number) => number>('MapGridGetCollisionAt');
  const behFn = _g<(x: number, y: number) => number>('MapGridGetMetatileBehaviorAt');
  if (!collFn || !behFn) return 'no MapGrid* fns exposed (= map not loaded ?)';

  // Build overlay map of (lx, ly) → symbol.
  const overlays = new Map<string, string>();
  // Player from slot 0 if available, else gPlayerAvatar.
  const objs = _g<ObjectEvent[]>('__gObjectEvents') ?? [];
  const slot0 = objs[0];
  const slot0Active = !!(slot0 && (slot0 as { active?: boolean }).active);
  if (slot0Active) {
    const slot0X = ((slot0 as { currentCoordsX?: number }).currentCoordsX ?? MAP_OFFSET) - MAP_OFFSET;
    const slot0Y = ((slot0 as { currentCoordsY?: number }).currentCoordsY ?? MAP_OFFSET) - MAP_OFFSET;
    overlays.set(`${slot0X},${slot0Y}`, _FACING_SYMBOL[(slot0 as { facingDirection?: number }).facingDirection ?? 0] ?? '@');
  } else {
    overlays.set(`${_pp.x},${_pp.y}`, _FACING_SYMBOL[_pp.facing ?? 0] ?? '@');
  }
  // NPCs at slot 1..N.
  for (let i = 1; i < objs.length; i++) {
    const npc = objs[i];
    if (!npc?.active || npc.invisible) continue;
    const lx = (npc.currentCoordsX ?? MAP_OFFSET) - MAP_OFFSET;
    const ly = (npc.currentCoordsY ?? MAP_OFFSET) - MAP_OFFSET;
    const key = `${lx},${ly}`;
    if (overlays.has(key)) continue;
    overlays.set(key, i < 10 ? String(i) : (i < 36 ? String.fromCharCode(55 + i) : '*'));
  }

  // Warps + bgEvents + coordEvents from header.
  const hdr = _g<{ id?: string; events?: {
    warps?: Array<{ x: number; y: number }>;
    bgEvents?: Array<{ x: number; y: number; kind: string }>;
    coordEvents?: Array<{ x: number; y: number }>;
  } }>('gMapHeader');
  const warps = new Set<string>((hdr?.events?.warps ?? []).map(w => `${w.x},${w.y}`));
  const bgEventByKey = new Map<string, string>();
  for (const b of hdr?.events?.bgEvents ?? []) {
    if (b.kind === 'hidden_item') bgEventByKey.set(`${b.x},${b.y}`, '!');
    else if (b.kind === 'secret_base') bgEventByKey.set(`${b.x},${b.y}`, 'S');
    else bgEventByKey.set(`${b.x},${b.y}`, 's');  // sign / autre
  }
  const coordEventByKey = new Set<string>((hdr?.events?.coordEvents ?? []).map(c => `${c.x},${c.y}`));

  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);
  const lines: string[] = [];
  lines.push(`Map [${hdr?.id ?? '?'}] center=(${cx},${cy}) size=${width}×${height}`);
  lines.push('Legend: ^v<> player(N/S/W/E), 1-9/A-Z NPC, X=warp s=sign !=item t=coordTrigger');
  lines.push('        .=walk #=wall ~=grass W=water F=fall d=sand c=cave i=ice D=door L=ladder ,=other');
  // Column ruler (every 5 cols indicates lx % 10).
  let header = '     ';
  for (let i = 0; i < width; i++) {
    const lx = cx - halfW + i;
    header += (lx % 5 === 0) ? String(((lx % 100) + 100) % 10) : ' ';
  }
  lines.push(header);

  for (let row = 0; row < height; row++) {
    const ly = cy - halfH + row;
    let line = String(ly).padStart(4) + ' ';
    for (let col = 0; col < width; col++) {
      const lx = cx - halfW + col;
      const k = `${lx},${ly}`;
      const overlay = overlays.get(k);
      if (overlay) { line += overlay; continue; }
      // Warp '>' avait clash avec player EAST '>'. Player overlay PRIORITAIRE,
      // donc ici warp = 'X' pour rester sans ambiguïté.
      if (warps.has(k)) { line += 'X'; continue; }
      if (coordEventByKey.has(k)) { line += 't'; continue; }
      const bgSym = bgEventByKey.get(k);
      if (bgSym) { line += bgSym; continue; }
      const ix = lx + MAP_OFFSET;
      const iy = ly + MAP_OFFSET;
      const beh = behFn(ix, iy);
      const coll = collFn(ix, iy);
      line += _behaviorSymbol(beh, coll);
    }
    lines.push(line);
  }
  return lines.join('\n');
}

// ─── Movement introspection (= state machine MovementAction_*) ───────────────
// Pour debug post-R3 : quel mouvement le player + chaque NPC est en train de
// faire ? Quel sub-state ? Combien de frames restantes ?

interface ObjectEventMovementFields {
  active?: boolean;
  invisible?: boolean;
  graphicsId?: string;
  localId?: number;
  localIdRaw?: string;
  movementType?: string;
  movementActionId?: number;
  heldMovementActive?: boolean;
  heldMovementFinished?: boolean;
  walkFramesLeft?: number;
  facingDirection?: number;
  movementDirection?: number;
  currentCoordsX?: number; currentCoordsY?: number;
  previousCoordsX?: number; previousCoordsY?: number;
  spriteAnimNum?: number;
}

function _movement(): Record<string, unknown> {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  const objs = _g<ObjectEventMovementFields[]>('__gObjectEvents') ?? [];
  const slot0 = objs[0];
  // Post R3 : coords/facing LOGIQUES depuis sb1.pos (pa.x/y/facing n'existent plus).
  const _pp = _readPlayerPos();
  const _paFull = pa as (PlayerAvatar & { runningState?: number }) | undefined;
  const player: Record<string, unknown> = pa ? {
    x: _pp.x, y: _pp.y,
    facing: _DIR_NAMES[_pp.facing ?? 0],
    // post étape 1b-iii : le mouvement joueur est piloté par le held movement du slot0
    // (voir slot0_movement ci-dessous), PAS par stepFramesLeft (= seulement le locked door-walk).
    runningState: ['NOT_MOVING', 'TURN_DIRECTION', 'MOVING'][_paFull?.runningState ?? 0] ?? _paFull?.runningState,
    tileTransitionState: ['T_NOT_MOVING', 'T_TILE_TRANSITION', 'T_TILE_CENTER'][pa.tileTransitionState ?? 0] ?? pa.tileTransitionState,
    stepFramesLeft_lockedDoorWalkOnly: pa.stepFramesLeft,
    elevation: pa.currentElevation,
    walking: (pa.tileTransitionState ?? 0) !== 0,
  } : { error: 'no gPlayerAvatar' };
  if (slot0) {
    player.slot0_movement = {
      action: slot0.movementActionId,
      held: slot0.heldMovementActive,
      heldFinished: slot0.heldMovementFinished,
      walkFramesLeft: slot0.walkFramesLeft,
      facing: _DIR_NAMES[slot0.facingDirection ?? 0],
      moveDir: _DIR_NAMES[slot0.movementDirection ?? 0],
      spriteAnimNum: slot0.spriteAnimNum,
    };
  }
  const npcs: Array<Record<string, unknown>> = [];
  for (let i = 1; i < objs.length; i++) {
    const o = objs[i];
    if (!o?.active) continue;
    npcs.push({
      slot: i,
      id: o.localIdRaw ?? `localId=${o.localId}`,
      gfx: o.graphicsId,
      mvtType: o.movementType,
      mvtAction: o.movementActionId,
      held: o.heldMovementActive,
      heldFinished: o.heldMovementFinished,
      walkFramesLeft: o.walkFramesLeft,
      facing: _DIR_NAMES[o.facingDirection ?? 0],
      moveDir: _DIR_NAMES[o.movementDirection ?? 0],
      anim: o.spriteAnimNum,
      pos: [(o.currentCoordsX ?? MAP_OFFSET) - MAP_OFFSET, (o.currentCoordsY ?? MAP_OFFSET) - MAP_OFFSET],
    });
  }
  return { player, npcs };
}

// ─── Diagnostic player input gates (= scope.canWalk() / scope.locks()) ───────
//
// PlayerStep (field_player_avatar.c:332) gate l'input par plusieurs flags :
//   1. spriteId < 0                          (sprite invalide)
//   2. ArePlayerFieldControlsLocked()        (sLockFieldControls = TRUE)
//   3. gPaletteFade.active                   (fade en cours)
//   4. preventStep                           (forceStop, surfing setup, etc.)
//   5. held movement actif & PAS fini        (TryInterruptObjectEventSpecialAnim = LE gate : un
//                                             pas/turn/collide-bump/jump est en cours → PlayerStep
//                                             ne lit PAS l'input ce frame ; le held EST le timer)
//   6. forceMovement != DIR_NONE             (warp exit task drive le step, branche lock)
//   7. ScriptContext SHUTDOWN? RUNNING?
//   8. message box ouvert ?
//
// ⚠️ post étape 1b-iii : les anciens gates « collideFramesLeft > 0 » et « stepFramesLeft > 0 »
// (compteurs MAISON) sont REMPLACÉS par le gate held movement (gate 5). Les compteurs ne sont plus
// posés sur le chemin déverrouillé (TryInterruptObjectEventSpecialAnim renvoie TRUE tant que le held
// du slot0 est actif & pas fini). `scope.canWalk()` retourne les raisons qui bloquent l'input.

interface CanWalkGate { blocked: boolean; reason: string; details?: Record<string, unknown> }

function _canWalk(): CanWalkGate[] {
  const gates: CanWalkGate[] = [];
  const pa = _g<PlayerAvatar & {
    spriteId?: number; preventStep?: boolean; runningState?: number;
    forceMovement?: number; collideFramesLeft?: number; objectEventId?: number;
    flags?: number; turnFramesLeft?: number;
  }>('gPlayerAvatar');
  if (!pa) return [{ blocked: true, reason: 'gPlayerAvatar undefined' }];

  // Gate 1 : spriteId
  gates.push({ blocked: (pa.spriteId ?? -1) < 0, reason: `spriteId=${pa.spriteId}` });

  // Gate 2 : ArePlayerFieldControlsLocked
  try {
    const locked = ArePlayerFieldControlsLocked();
    gates.push({ blocked: locked, reason: `sLockFieldControls=${locked}` });
  } catch (e) {
    gates.push({ blocked: false, reason: `ArePlayerFieldControlsLocked threw: ${(e as Error).message}` });
  }

  // Gate 3 : gPaletteFade.active
  const pf = _g<{ active?: boolean; brightness?: number; mode?: number }>('gPaletteFade')
    ?? (_g<{ _rt?: { gPaletteFade?: { active?: boolean } } }>('dev'))?._rt?.gPaletteFade;
  gates.push({ blocked: pf?.active === true, reason: `gPaletteFade.active=${pf?.active}` });

  // Gate 4 : preventStep
  gates.push({ blocked: pa.preventStep === true, reason: `preventStep=${pa.preventStep}` });

  // Gate 5 : held movement actif & PAS fini (= TryInterruptObjectEventSpecialAnim renvoie TRUE →
  // PlayerStep ne lit pas l'input ce frame). Remplace les compteurs collide/stepFramesLeft maison
  // (post étape 1b-iii : le held movement du slot0 EST le timer du pas/turn/collide/jump).
  const slot0Held = (_g<ObjectEventMovementFields[]>('__gObjectEvents') ?? [])[pa.objectEventId ?? 0];
  const heldGating = slot0Held?.heldMovementActive === true && slot0Held?.heldMovementFinished !== true;
  gates.push({ blocked: heldGating, reason: `heldMovement en cours (action=${slot0Held?.movementActionId} active=${slot0Held?.heldMovementActive} finished=${slot0Held?.heldMovementFinished})` });

  // Gate 6 : forceMovement (= warp exit / door-walk drive le step via la branche lock de PlayerStep)
  gates.push({ blocked: (pa.forceMovement ?? 0) !== 0, reason: `forceMovement=${_DIR_NAMES[pa.forceMovement ?? 0]}` });

  // Gate 8 : script status
  const sc = _script() as { status?: number; statusName?: string };
  gates.push({ blocked: sc.status === 0, reason: `scriptContext=${sc.statusName ?? '?'}(${sc.status})` });

  // Gate 9 : dialog open
  const dlg = _dialog() as { open?: boolean };
  gates.push({ blocked: dlg.open === true, reason: `dialog.open=${dlg.open}` });

  return gates;
}

/** Diagnostic complet : list TOUS les gates qui bloquent l'input + montre
 *  les drift entre slot0 / sb1.pos / gPlayerAvatar. */
function _diag(): Record<string, unknown> {
  const gates = _canWalk();
  const blockers = gates.filter(g => g.blocked);
  const pa = _g<PlayerAvatar & {
    spriteId?: number; preventStep?: boolean; runningState?: number;
    forceMovement?: number; collideFramesLeft?: number; objectEventId?: number;
    flags?: number; tileTransitionState?: number;
  }>('gPlayerAvatar');
  const objs = _g<ObjectEventMovementFields[]>('__gObjectEvents') ?? [];
  const slot0 = objs[0];
  const sb1pos = _readPlayerPos();
  const slot0LogicalX = (slot0?.currentCoordsX ?? MAP_OFFSET) - MAP_OFFSET;
  const slot0LogicalY = (slot0?.currentCoordsY ?? MAP_OFFSET) - MAP_OFFSET;
  const drift = (sb1pos.x !== undefined && slot0LogicalX !== sb1pos.x)
             || (sb1pos.y !== undefined && slot0LogicalY !== sb1pos.y);
  return {
    blockers: blockers.length === 0
      ? 'AUCUN — input DEVRAIT passer'
      : blockers.map(b => b.reason),
    allGates: gates.map(g => `${g.blocked ? '🔴' : '✅'} ${g.reason}`),
    coords: {
      sb1pos,
      slot0_LOGICAL: { x: slot0LogicalX, y: slot0LogicalY, facing: _DIR_NAMES[slot0?.facingDirection ?? 0] },
      slot0_INTERNAL: { x: slot0?.currentCoordsX, y: slot0?.currentCoordsY },
      slot0_initial_LOGICAL: slot0 ? { x: (slot0 as { initialCoordsX?: number }).initialCoordsX! - MAP_OFFSET, y: (slot0 as { initialCoordsY?: number }).initialCoordsY! - MAP_OFFSET } : null,
      drift: drift ? '🔴 slot0 ≠ sb1.pos — DESYNC' : '✅ slot0 == sb1.pos',
    },
    pa: {
      flags: pa?.flags?.toString(2).padStart(8, '0'),
      runningState: ['NOT_MOVING', 'TURN_DIRECTION', 'MOVING'][pa?.runningState ?? 0] ?? pa?.runningState,
      tileTransitionState: ['T_NOT_MOVING', 'T_TILE_TRANSITION', 'T_TILE_CENTER'][pa?.tileTransitionState ?? 0] ?? pa?.tileTransitionState,
      // post étape 1b-iii : le mouvement joueur est piloté par le held movement du slot0 (vrai gate).
      heldMovement: slot0 ? { action: slot0.movementActionId, active: slot0.heldMovementActive, finished: slot0.heldMovementFinished } : null,
      stepFramesLeft_lockedDoorWalkOnly: pa?.stepFramesLeft,
      objectEventId: pa?.objectEventId,
      spriteId: pa?.spriteId,
    },
  };
}

/** Show TOUS les locks/freeze states actifs. */
function _locks(): Record<string, unknown> {
  let sLock: boolean | string;
  try { sLock = ArePlayerFieldControlsLocked(); } catch (e) { sLock = `err: ${(e as Error).message}`; }
  const pa = _g<{ preventStep?: boolean }>('gPlayerAvatar');
  const pf = _g<{ active?: boolean; brightness?: number; mode?: number; bufferTransferDisabled?: boolean }>('gPaletteFade')
    ?? (_g<{ _rt?: { gPaletteFade?: { active?: boolean } } }>('dev'))?._rt?.gPaletteFade;
  const objs = _g<ObjectEventMovementFields[]>('__gObjectEvents') ?? [];
  const frozenNpcs = objs.map((o, i) => ({ slot: i, frozen: (o as { frozen?: boolean })?.frozen, active: o?.active }))
    .filter(o => o.frozen);
  return {
    sLockFieldControls: sLock,
    gPaletteFade_active: pf?.active,
    gPaletteFade_bufferTransferDisabled: (pf as { bufferTransferDisabled?: boolean })?.bufferTransferDisabled,
    player_preventStep: pa?.preventStep,
    frozenNpcs: frozenNpcs.length === 0 ? 'none' : frozenNpcs,
    script: _script(),
    dialog: _dialog(),
  };
}

// ─── Pathfinder simple (= scope.go(x, y) target LOGICAL) ─────────────────────
// A* basique sur la grille de collision visible. Drive via setHeldKeysOverride.
// Pas optimal pour les longues distances ni les obstacles dynamiques (= NPCs
// qui bougent) mais suffit pour scénarios de test.

type PathNode = { x: number; y: number; gScore: number; fScore: number; parent: PathNode | null };

function _findPathAStar(startX: number, startY: number, goalX: number, goalY: number, maxNodes = 2000): Array<[number, number]> | null {
  const collFn = _g<(x: number, y: number) => number>('MapGridGetCollisionAt');
  if (!collFn) return null;
  const h = (x: number, y: number): number => Math.abs(x - goalX) + Math.abs(y - goalY);
  const openByKey = new Map<string, PathNode>();
  const closed = new Set<string>();
  const start: PathNode = { x: startX, y: startY, gScore: 0, fScore: h(startX, startY), parent: null };
  openByKey.set(`${startX},${startY}`, start);
  let visited = 0;
  while (openByKey.size > 0 && visited < maxNodes) {
    let best: PathNode | null = null;
    for (const node of openByKey.values()) {
      if (!best || node.fScore < best.fScore) best = node;
    }
    if (!best) break;
    if (best.x === goalX && best.y === goalY) {
      const path: Array<[number, number]> = [];
      let cur: PathNode | null = best;
      while (cur) { path.unshift([cur.x, cur.y]); cur = cur.parent; }
      return path;
    }
    openByKey.delete(`${best.x},${best.y}`);
    closed.add(`${best.x},${best.y}`);
    visited++;
    const neighbors: Array<[number, number]> = [
      [best.x + 1, best.y], [best.x - 1, best.y],
      [best.x, best.y + 1], [best.x, best.y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      const nk = `${nx},${ny}`;
      if (closed.has(nk)) continue;
      // Goal cell may be NPC (= collision != 0 due to slot0 marker), accept it.
      const isGoal = (nx === goalX && ny === goalY);
      if (!isGoal) {
        const coll = collFn(nx + MAP_OFFSET, ny + MAP_OFFSET);
        if (coll !== 0) continue;
      }
      const tentativeG = best.gScore + 1;
      const existing = openByKey.get(nk);
      if (existing && tentativeG >= existing.gScore) continue;
      const node: PathNode = { x: nx, y: ny, gScore: tentativeG, fScore: tentativeG + h(nx, ny), parent: best };
      openByKey.set(nk, node);
    }
  }
  return null;
}

/** Drive player vers (targetX, targetY) en LOGICAL via pas-à-pas walk.
 *  Retourne { ok, walked, reason } avec ok=true seulement si arrivé exact. */
async function _go(targetX: number, targetY: number, opts?: { maxSteps?: number }): Promise<{
  ok: boolean; walked: number; reason?: string; path?: Array<[number, number]>;
}> {
  const pa = _g<PlayerAvatar>('gPlayerAvatar');
  if (!pa) return { ok: false, walked: 0, reason: 'no gPlayerAvatar' };
  // Post R3 : départ depuis la position LOGIQUE (sb1.pos), pas pa.x/y (= 0).
  const _startPp = _readPlayerPos();
  const sx = _startPp.x ?? 0;
  const sy = _startPp.y ?? 0;
  if (sx === targetX && sy === targetY) return { ok: true, walked: 0, reason: 'already at target' };
  const path = _findPathAStar(sx, sy, targetX, targetY);
  if (!path) return { ok: false, walked: 0, reason: 'no path (= goal unreachable or collision blocks)' };
  const maxSteps = opts?.maxSteps ?? path.length + 5;
  let walked = 0;
  for (let i = 1; i < path.length && walked < maxSteps; i++) {
    const [px, py] = path[i];
    const [qx, qy] = path[i - 1];
    let dir: 'up' | 'down' | 'left' | 'right' | null = null;
    if (px > qx) dir = 'right';
    else if (px < qx) dir = 'left';
    else if (py > qy) dir = 'down';
    else if (py < qy) dir = 'up';
    if (!dir) continue;
    const r = await _walk(dir, 1);
    if (r.blocked || !r.ok) {
      return { ok: false, walked, reason: r.reason ?? 'blocked mid-path', path };
    }
    walked++;
  }
  const _arrPp = _readPlayerPos();
  const arrivedX = _arrPp.x ?? 0;
  const arrivedY = _arrPp.y ?? 0;
  const arrived = arrivedX === targetX && arrivedY === targetY;
  return {
    ok: arrived,
    walked,
    reason: arrived ? undefined : `stopped at (${arrivedX},${arrivedY}) ≠ target (${targetX},${targetY})`,
    path,
  };
}

// ─── Script history (= ring buffer opcode log) ───────────────────────────────
// Le log est rempli par script-runtime.ts via globalThis.__scriptOpcodeLog.push().
// Si script-runtime n'a pas encore wiré le hook, le log restera vide — on
// retourne {note: 'no opcode hook wired'} pour signaler. */

interface OpcodeLogEntry {
  frame: number;
  label: string;
  opcode: string;
  args: unknown[];
  idx: number;
  ts: number;
}

function _scriptHistory(n = 30): Array<OpcodeLogEntry> | { note: string } {
  const log = _g<OpcodeLogEntry[]>('__scriptOpcodeLog');
  if (!log) return { note: 'no __scriptOpcodeLog wired (= script-runtime.ts doit pousser via ring buffer)' };
  return log.slice(-n);
}

function _scriptHistoryClear(): { cleared: number } {
  const log = _g<OpcodeLogEntry[]>('__scriptOpcodeLog');
  if (!log) return { cleared: 0 };
  const n = log.length;
  log.length = 0;
  return { cleared: n };
}

// ─── Camera state inspector ──────────────────────────────────────────────────
// Dump complet de la cam (= 4 globals + helpers résolus). Utile pour debug
// scrolling, sprite offset et cross-border drift.

function _cam(): Record<string, unknown> {
  const tl = _GetCameraTopLeftCoords();
  return {
    gCamera: { active: _gCamera.active, x: _gCamera.x, y: _gCamera.y },
    gFieldCamera: {
      movementSpeedX: _gFieldCamera.movementSpeedX,
      movementSpeedY: _gFieldCamera.movementSpeedY,
      subTilePx: { x: _gFieldCamera.x, y: _gFieldCamera.y },
      spriteId: _gFieldCamera.spriteId,
      hasCallback: !!_gFieldCamera.callback,
    },
    gTotalCamera: { pixelOffsetX: _gTotalCamera.pixelOffsetX, pixelOffsetY: _gTotalCamera.pixelOffsetY },
    gSpriteCoordOffset: { x: _gSpriteCoordOffset.x, y: _gSpriteCoordOffset.y },
    pan: { x: _GetCameraPanX(), y: _GetCameraPanY() },
    topLeftCoords_LOGICAL: tl,
    topLeftCoords_INTERNAL: { x: tl.x + MAP_OFFSET, y: tl.y + MAP_OFFSET },
    note: 'topLeftCoords = 1:1 décomp GetCameraCoords ; gFieldCamera.x/y = sub-tile pixel offset (= modulo 16) ; gSpriteCoordOffset = pixel offset appliqué aux sprites OAM',
  };
}

// ─── Action : exec opcode isolé sans setup script complet ────────────────────
// Ex : scope.action('msgbox', 'PlayersHouse_2F_EventScript_PC')
//   → setup un script bytecode avec 1 seul opcode `msgbox PlayersHouse_2F_EventScript_PC`
//   → dispatch via script runtime existant
//
// Le script ne s'auto-stop pas à la fin (= comportement msgbox = wait input),
// donc utile pour tester opcodes individuels. Lib uniquement les opcodes qui
// fonctionnent en isolation ; les opcodes qui dépendent de stack/data
// préexistantes (= goto/call/loadword) peuvent échouer.

function _action(opname: string, ...args: unknown[]): { ok: boolean; reason?: string } {
  if (typeof opname !== 'string' || !opname) {
    return { ok: false, reason: 'opname required (string)' };
  }
  try {
    // Opcode.args est `string[]` (= format parsed from JSON). Convert tout en string.
    const argsStr = args.map(a => typeof a === 'string' ? a : String(a));
    ScriptContext_SetupInlineBytecode([{ name: opname, args: argsStr }], `dev.action:${opname}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

// ─── Input recorder : record / stop / replay ────────────────────────────────
// Wrap autour de rt.gMain.heldKeys pour capturer chaque transition.
// Polling 60Hz (= 16ms) — suffisant pour matcher le rythme du décomp.
// Recordings persistent localStorage sous "scope_recording:<name>".
//
// Format de record :
//   { name, recordedAt, totalMs, events: [{ tMs, mask }, ...] }
//
// `tMs` = ms depuis le start du record. Replay le set chaque mask au bon
// moment via setTimeout.

interface RecorderEvent { tMs: number; mask: number }
interface Recording { name: string; recordedAt: number; totalMs: number; events: RecorderEvent[]; startMap?: string; startPos?: [number, number] }

let _recordingState: {
  active: boolean;
  startMs: number;
  events: RecorderEvent[];
  intervalId: number | null;
  lastMask: number;
  startMap?: string;
  startPos?: [number, number];
} = { active: false, startMs: 0, events: [], intervalId: null, lastMask: -1 };

const _RECORDING_STORAGE_PREFIX = 'scope_recording:';

const _recorder = {
  start(): { ok: boolean; reason?: string } {
    if (_recordingState.active) return { ok: false, reason: 'already recording (= stop d\'abord)' };
    const rt = _rtSafe();
    if (!rt) return { ok: false, reason: 'no runtime' };
    const pa = _g<PlayerAvatar>('gPlayerAvatar');
    const hdr = _g<{ id?: string }>('gMapHeader');
    _recordingState = {
      active: true,
      startMs: performance.now(),
      events: [],
      intervalId: null,
      lastMask: -1,
      startMap: hdr?.id,
      // Post R3 : position LOGIQUE depuis sb1.pos (pa.x/y n'existent plus).
      startPos: pa ? [_readPlayerPos().x ?? 0, _readPlayerPos().y ?? 0] : undefined,
    };
    const tick = (): void => {
      if (!_recordingState.active) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cur = ((rt as any).gMain?.heldKeys ?? 0) as number;
      if (cur !== _recordingState.lastMask) {
        _recordingState.events.push({
          tMs: Math.round(performance.now() - _recordingState.startMs),
          mask: cur,
        });
        _recordingState.lastMask = cur;
      }
    };
    _recordingState.intervalId = window.setInterval(tick, 16);
    return { ok: true };
  },

  stop(): Recording | { ok: false; reason: string } {
    if (!_recordingState.active) return { ok: false, reason: 'not recording' };
    _recordingState.active = false;
    if (_recordingState.intervalId !== null) {
      window.clearInterval(_recordingState.intervalId);
    }
    const totalMs = Math.round(performance.now() - _recordingState.startMs);
    // Push final release event si dernier mask != 0 pour clean termination.
    if (_recordingState.lastMask !== 0) {
      _recordingState.events.push({ tMs: totalMs, mask: 0 });
    }
    const recording: Recording = {
      name: '(unnamed)',
      recordedAt: Date.now(),
      totalMs,
      events: _recordingState.events.slice(),
      startMap: _recordingState.startMap,
      startPos: _recordingState.startPos,
    };
    console.log(`[scope.recorder] stopped — ${recording.events.length} events over ${totalMs}ms`);
    return recording;
  },

  async replay(rec: Recording | string, opts?: { speed?: number }): Promise<{ ok: boolean; reason?: string }> {
    const rt = _rtSafe();
    if (!rt) return { ok: false, reason: 'no runtime' };
    const speed = opts?.speed ?? 1;
    let recording: Recording;
    if (typeof rec === 'string') {
      const loaded = _recorder.load(rec);
      if (!loaded) return { ok: false, reason: `no recording named '${rec}'` };
      recording = loaded;
    } else {
      recording = rec;
    }
    if (recording.startMap) {
      const hdr = _g<{ id?: string }>('gMapHeader');
      if (hdr?.id !== recording.startMap) {
        console.warn(`[scope.recorder] replay : map mismatch — recording started on ${recording.startMap}, current=${hdr?.id}`);
      }
    }
    const start = performance.now();
    for (const ev of recording.events) {
      const targetMs = start + ev.tMs / speed;
      const waitMs = targetMs - performance.now();
      if (waitMs > 0) await _sleep(waitMs);
      setHeldKeysOverride(rt, ev.mask);
    }
    // Final release.
    setHeldKeysOverride(rt, 0);
    clearHeldKeysOverride(rt);
    return { ok: true };
  },

  save(name: string, rec?: Recording): { ok: boolean; reason?: string } {
    if (typeof localStorage === 'undefined') return { ok: false, reason: 'no localStorage' };
    if (!rec) return { ok: false, reason: 'recording argument required' };
    const key = _RECORDING_STORAGE_PREFIX + name;
    try {
      localStorage.setItem(key, JSON.stringify({ ...rec, name }));
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: String(e) };
    }
  },

  load(name: string): Recording | null {
    if (typeof localStorage === 'undefined') return null;
    const key = _RECORDING_STORAGE_PREFIX + name;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as Recording; }
    catch { return null; }
  },

  list(): Array<{ name: string; recordedAt: string; totalMs: number; events: number; startMap?: string }> {
    if (typeof localStorage === 'undefined') return [];
    const out: Array<{ name: string; recordedAt: string; totalMs: number; events: number; startMap?: string }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(_RECORDING_STORAGE_PREFIX)) continue;
      try {
        const r = JSON.parse(localStorage.getItem(k) ?? '{}') as Recording;
        out.push({
          name: k.slice(_RECORDING_STORAGE_PREFIX.length),
          recordedAt: new Date(r.recordedAt ?? 0).toISOString(),
          totalMs: r.totalMs ?? 0,
          events: r.events?.length ?? 0,
          startMap: r.startMap,
        });
      } catch { /* skip */ }
    }
    return out;
  },

  delete(name: string): { ok: boolean } {
    if (typeof localStorage === 'undefined') return { ok: false };
    localStorage.removeItem(_RECORDING_STORAGE_PREFIX + name);
    return { ok: true };
  },

  state(): { active: boolean; eventsSoFar: number; elapsedMs: number } {
    return {
      active: _recordingState.active,
      eventsSoFar: _recordingState.events.length,
      elapsedMs: _recordingState.active ? Math.round(performance.now() - _recordingState.startMs) : 0,
    };
  },
};

// ─── Navigation spatiale (scope.find / approach / here / nearestWalkable) ────
// But : que je SACHE lire la carte et me déplacer correctement (trouver eau/
// terre/PNJ/porte/warp + une case d'APPROCHE walkable + la direction à regarder).
// Tout en coords LOGICAL ; conversion INTERNAL = +MAP_OFFSET gérée ici.

type TileCat = 'wall' | 'walkable' | 'water' | 'waterfall' | 'grass' | 'sand'
             | 'cave' | 'ice' | 'door' | 'ladder' | 'arrow_warp';

/** Classe une tuile via behavior + collision (mêmes seuils que _behaviorSymbol).
 *  ⚠️ Les behaviors NOTABLES (porte/échelle/arrow-warp/cascade) sont sur des
 *  tuiles collision≠0 → on les classe AVANT le fallback mur (sinon find('door')
 *  rate les entrées de bâtiment). 'wall'/'walkable' = fallback selon collision. */
function _classifyTile(behavior: number, collision: number): TileCat {
  if (behavior === 0x13) return 'waterfall';                                   // MB_WATERFALL
  if (behavior === 0x60 || behavior === 0x69 || behavior === 0x6C) return 'door';
  if (behavior === 0x61) return 'ladder';
  if (behavior >= 0x62 && behavior <= 0x65) return 'arrow_warp';
  if (behavior === 0x02 || behavior === 0x03 || behavior === 0x09 || behavior === 0x24) return 'grass';
  if (behavior >= 0x10 && behavior <= 0x1A) return 'water';
  if (behavior === 0x06 || behavior === 0x21) return 'sand';
  if (behavior === 0x08) return 'cave';
  if (behavior === 0x20 || behavior === 0x26 || behavior === 0x27) return 'ice';
  return collision !== 0 ? 'wall' : 'walkable';
}

/** Walkable = collision 0 (= 1:1 gate PlayerStep + A*). LOGICAL coords. */
function _isWalkable(lx: number, ly: number): boolean {
  const collFn = _g<(x: number, y: number) => number>('MapGridGetCollisionAt');
  return (collFn?.(lx + MAP_OFFSET, ly + MAP_OFFSET) ?? 1) === 0;
}

/** Dimensions de la map courante (gMapHeader.mapLayout). null si inconnues. */
function _mapDims(): { w: number; h: number } | null {
  const hdr = _g<{ mapLayout?: { width?: number; height?: number } }>('gMapHeader');
  const w = hdr?.mapLayout?.width, h = hdr?.mapLayout?.height;
  if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) return { w, h };
  return null;
}

/** Case walkable la plus proche de (lx,ly) — ring search. Retourne la case
 *  elle-même si déjà walkable. Pour « je me suis tp dans un mur, où aller ? ». */
function _nearestWalkable(lx: number, ly: number, maxR = 12): { x: number; y: number; dist: number } | null {
  if (_isWalkable(lx, ly)) return { x: lx, y: ly, dist: 0 };
  for (let r = 1; r <= maxR; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;  // anneau seulement
        if (_isWalkable(lx + dx, ly + dy)) return { x: lx + dx, y: ly + dy, dist: Math.abs(dx) + Math.abs(dy) };
      }
    }
  }
  return null;
}

/** Case walkable adjacente à une cible (eau/PNJ/porte…) + la direction pour
 *  REGARDER la cible depuis cette case (= pour interagir/surfer). 1:1 layout :
 *  approche au sud → on regarde 'up', etc. Si (fromX,fromY) fourni, choisit la
 *  case adjacente la PLUS PROCHE de ce point (= chemin sensé, pas de détour). */
function _approachTile(tx: number, ty: number, fromX?: number, fromY?: number): { x: number; y: number; face: 'up' | 'down' | 'left' | 'right' } | null {
  const opts: Array<[number, number, 'up' | 'down' | 'left' | 'right']> = [
    [0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right'],
  ];
  const walkable = opts
    .map(([dx, dy, face]) => ({ x: tx + dx, y: ty + dy, face }))
    .filter(o => _isWalkable(o.x, o.y));
  if (!walkable.length) return null;
  if (fromX !== undefined && fromY !== undefined) {
    walkable.sort((a, b) =>
      (Math.abs(a.x - fromX) + Math.abs(a.y - fromY)) - (Math.abs(b.x - fromX) + Math.abs(b.y - fromY)));
  }
  return walkable[0];
}

/** « Où suis-je et où puis-je aller ? » — à appeler APRÈS un tp pour savoir si
 *  je suis coincé (mur/bâtiment) et la case walkable la plus proche. */
function _here(): Record<string, unknown> {
  const behFn = _g<(x: number, y: number) => number>('MapGridGetMetatileBehaviorAt');
  const collFn = _g<(x: number, y: number) => number>('MapGridGetCollisionAt');
  if (!behFn || !collFn) return { error: 'MapGrid* non exposé (map pas chargée ?)' };
  const pp = _readPlayerPos();
  const x = pp.x ?? 0, y = pp.y ?? 0;
  const at = (lx: number, ly: number) => {
    const beh = behFn(lx + MAP_OFFSET, ly + MAP_OFFSET);
    const coll = collFn(lx + MAP_OFFSET, ly + MAP_OFFSET);
    return { at: [lx, ly], walkable: coll === 0, cat: _classifyTile(beh, coll), behavior: _behaviorName(beh) };
  };
  const here = at(x, y);
  const around = { up: at(x, y - 1), down: at(x, y + 1), left: at(x - 1, y), right: at(x + 1, y) };
  const canMove = Object.values(around).filter(a => a.walkable).map((_, i) => ['up', 'down', 'left', 'right'][i]);
  const dirsOpen = (['up', 'down', 'left', 'right'] as const).filter(d => around[d].walkable);
  return {
    at: [x, y], facing: _FACING_SYMBOL[pp.facing ?? 0] ?? '?',
    onTile: here, around,
    canMove: dirsOpen,
    stuck: !here.walkable || dirsOpen.length === 0,
    nearestWalkable: here.walkable ? null : _nearestWalkable(x, y),
    hint: here.walkable
      ? (dirsOpen.length ? `OK sur ${here.cat}. Directions libres : ${dirsOpen.join('/')}` : '⚠️ entouré de murs')
      : `⚠️ COINCÉ sur ${here.cat} (${here.behavior}). nearestWalkable → ${JSON.stringify(_nearestWalkable(x, y))}`,
  };
}

/** Trouve des features/PNJ sur la map + une case d'APPROCHE walkable pour chacun.
 *  query : 'water'|'waterfall'|'grass'|'sand'|'cave'|'ice'|'door'|'ladder'|
 *          'arrow_warp'|'warp'|'walkable'/'land'|'ledge', un substring de nom MB,
 *          ou 'npc'/'npc:<substr>'. Retourne les N plus proches (par dist Manhattan). */
function _find(query: string, opts?: { limit?: number; maxScan?: number }): Record<string, unknown> {
  const limit = opts?.limit ?? 12;
  const pp = _readPlayerPos();
  const px = pp.x ?? 0, py = pp.y ?? 0;
  const q = String(query).toLowerCase().trim();

  // ── PNJ ──
  if (q === 'npc' || q.startsWith('npc:')) {
    const sub = q.startsWith('npc:') ? q.slice(4) : '';
    const objs = _g<ObjectEvent[]>('__gObjectEvents') ?? [];
    const matches: Array<Record<string, unknown>> = [];
    for (let i = 1; i < objs.length; i++) {
      const npc = objs[i];
      if (!npc?.active) continue;
      const name = `${npc.localIdRaw ?? ''} ${npc.graphicsId ?? ''}`.toLowerCase();
      if (sub && !name.includes(sub)) continue;
      const lx = (npc.currentCoordsX ?? MAP_OFFSET) - MAP_OFFSET;
      const ly = (npc.currentCoordsY ?? MAP_OFFSET) - MAP_OFFSET;
      matches.push({
        slot: i, localId: npc.localIdRaw ?? npc.localId, gfx: npc.graphicsId,
        at: [lx, ly], invisible: !!npc.invisible,
        dist: Math.abs(lx - px) + Math.abs(ly - py), approach: _approachTile(lx, ly, px, py),
      });
    }
    matches.sort((a, b) => (a.dist as number) - (b.dist as number));
    const top = matches.slice(0, limit);
    return {
      query, kind: 'npc', count: matches.length, player: [px, py], matches: top,
      hint: top[0]?.approach
        ? `→ scope.go(${(top[0].approach as { x: number }).x}, ${(top[0].approach as { y: number }).y}) puis scope.press('${(top[0].approach as { face: string }).face}')`
        : (top.length ? 'PNJ trouvé mais aucune case d\'approche walkable adjacente' : 'aucun PNJ'),
    };
  }

  // ── Tuiles / features ──
  const collFn = _g<(x: number, y: number) => number>('MapGridGetCollisionAt');
  const behFn = _g<(x: number, y: number) => number>('MapGridGetMetatileBehaviorAt');
  if (!collFn || !behFn) return { error: 'MapGrid* non exposé (map pas chargée ?)' };

  const dims = _mapDims();
  const maxScan = opts?.maxScan ?? 60;
  const x0 = dims ? 0 : px - maxScan, y0 = dims ? 0 : py - maxScan;
  const x1 = dims ? dims.w - 1 : px + maxScan, y1 = dims ? dims.h - 1 : py + maxScan;

  const KNOWN = new Set<string>(['wall', 'walkable', 'water', 'waterfall', 'grass', 'sand', 'cave', 'ice', 'door', 'ladder', 'arrow_warp']);
  const warpKeys = (q === 'warp')
    ? new Set<string>((_g<{ events?: { warps?: Array<{ x: number; y: number }> } }>('gMapHeader')?.events?.warps ?? []).map(w => `${w.x},${w.y}`))
    : null;
  const nameQuery = q === 'ledge' ? 'jump' : q;  // alias pratique (ledges = MB_JUMP_*)

  const matches: Array<{ at: [number, number]; behavior: string; cat: string; dist: number; approach: ReturnType<typeof _approachTile> }> = [];
  let scanned = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      scanned++;
      const beh = behFn(x + MAP_OFFSET, y + MAP_OFFSET);
      const coll = collFn(x + MAP_OFFSET, y + MAP_OFFSET);
      const cat = _classifyTile(beh, coll);
      let ok: boolean;
      if (q === 'warp') ok = (warpKeys?.has(`${x},${y}`) ?? false) || cat === 'arrow_warp';
      else if (q === 'land' || q === 'walkable') ok = cat === 'walkable';
      else if (KNOWN.has(q)) ok = cat === q;
      else ok = _behaviorName(beh).toLowerCase().includes(nameQuery);  // substring nom MB
      if (!ok) continue;
      matches.push({
        at: [x, y], behavior: _behaviorName(beh), cat,
        dist: Math.abs(x - px) + Math.abs(y - py),
        approach: cat === 'walkable' ? { x, y, face: 'down' } : _approachTile(x, y, px, py),
      });
    }
  }
  matches.sort((a, b) => a.dist - b.dist);
  const top = matches.slice(0, limit);
  const n0 = top[0];
  return {
    query, kind: 'tile', scannedTiles: scanned, totalMatches: matches.length,
    player: [px, py], scanBounds: dims ? `full ${dims.w}×${dims.h}` : `±${maxScan} autour du joueur`,
    nearest: top,
    hint: n0
      ? `→ scope.go(${n0.approach?.x ?? n0.at[0]}, ${n0.approach?.y ?? n0.at[1]})` + (n0.approach && n0.cat !== 'walkable' ? ` puis scope.press('${n0.approach.face}')` : '') + `  [ou scope.approach('${query}')]`
      : `aucun match pour '${query}'`,
  };
}

/** One-shot : trouve le '${query}' le plus proche → pathfind jusqu'à sa case
 *  d'approche walkable → regarde la cible. Pour « va à l'eau/au PNJ/à la porte et
 *  interagis ». Retourne le détail (ok, target, approachedAt, facing, walked). */
async function _approach(query: string): Promise<Record<string, unknown>> {
  const found = _find(query, { limit: 1 });
  const list = (found.nearest ?? found.matches) as Array<Record<string, unknown>> | undefined;
  const n0 = list?.[0];
  if (!n0) return { ok: false, reason: `aucun '${query}' trouvé`, found };
  const ap = n0.approach as { x: number; y: number; face: 'up' | 'down' | 'left' | 'right' } | null;
  if (!ap) return { ok: false, reason: `'${query}' à ${JSON.stringify(n0.at)} mais aucune case d'approche walkable adjacente`, target: n0.at };
  const goRes = await _go(ap.x, ap.y);
  if (!goRes.ok) return { ok: false, reason: `pathfind échoué vers l'approche (${ap.x},${ap.y}) : ${goRes.reason}`, target: n0.at, approach: ap, goRes };
  if (n0.cat !== 'walkable') await _press(ap.face);
  return { ok: true, target: n0.at, what: n0.behavior ?? n0.gfx, approachedAt: [ap.x, ap.y], facing: n0.cat !== 'walkable' ? ap.face : null, walked: goRes.walked };
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
    // Inspection OW (post R3 — INTERNAL/LOGICAL coords audit + ASCII map).
    coords: _coords,
    behaviorName: _behaviorNameExposed,
    events: _events,
    findNpc: _findNpc,
    map: _map,
    movement: _movement,
    // Navigation spatiale (= « connais la carte + déplace-toi juste »)
    find: _find,
    approach: _approach,
    here: _here,
    nearestWalkable: _nearestWalkable,
    // Diagnostic input gates (= scope.canWalk / diag / locks)
    canWalk: _canWalk,
    diag: _diag,
    locks: _locks,
    // Script
    scriptHistory: _scriptHistory,
    scriptHistoryClear: _scriptHistoryClear,
    action: _action,
    // Camera
    cam: _cam,
    // Recorder
    recorder: _recorder,
    // Diff
    snapshot: _snapshot,
    compare: _compare,
    // Control
    press: _press,
    walk: _walk,
    ai: _ai,
    go: _go,
    skipDialog: _skipDialog,
    observe: _observe,
    gotoMap: _gotoMap,
    // Battle bytecode devtools (Session 140 add).
    // Exposé sous scope.bytecode.* : runScript/dumpMons/dispatchStats/etc.
    bytecode: buildBattleDevtools(),
    // Help
    help: _help,
    helpAll: _helpAll,
  };
}

export function installScopeDevtools(): void {
  if (typeof window === 'undefined') return;
  // Initialise le ring buffer opcodes (= scope.scriptHistory) si pas déjà fait.
  const g = globalThis as Record<string, unknown>;
  if (!g.__scriptOpcodeLog) g.__scriptOpcodeLog = [];
  (window as unknown as { scope: Record<string, unknown> }).scope = _buildScopeApi();
  console.log('[scope] devtools installed — type `scope.help()` for usage, `scope.helpAll()` for the full surface');
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
