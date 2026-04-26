/**
 * NPC autonomous behaviors (MOVEMENT_TYPE_* du décomp).
 *
 * Reproduit `gMovementTypeFuncs_*` (`src/data/object_events/movement_type_func_tables.h`)
 * et `event_object_movement.c` callbacks.
 *
 * MVP : couvre les patterns les plus courants (LOOK_AROUND, WANDER_AROUND,
 * WANDER_*, FACE_*, ROTATE_*). Les patterns avancés (COPY_PLAYER, TREE_DISGUISE,
 * BERRY_TREE_GROWTH, etc.) sont marqués no-op pour l'instant.
 *
 * Cf. DECOMP_ORIGIN_FILES.md A. Movement.
 */
import Phaser from 'phaser';
import { runMovement, type MovementSprite } from './movement';
import { setIdleFrame, type Facing } from './character-anims';

/** État runtime par NPC (lazy-init). */
export interface NpcBehaviorState {
  nextActionAt: number;     // timestamp ms quand jouer la prochaine action
  isRunning: boolean;       // true pendant qu'une action async tourne
  homeX: number;            // position spawn (centre du wander range)
  homeY: number;
}

/**
 * Détermine le facing initial d'un NPC depuis son MOVEMENT_TYPE.
 * Pour `MOVEMENT_TYPE_FACE_UP/DOWN/LEFT/RIGHT` → la direction explicite.
 * Pour les wander/look around → 'down' par défaut (sera modifié au 1er tick).
 */
export function getInitialFacing(movementType: string): Facing {
  const m = movementType.toUpperCase();
  if (m.endsWith('_FACE_UP') || m === 'MOVEMENT_TYPE_FACE_UP') return 'up';
  if (m.endsWith('_FACE_DOWN') || m === 'MOVEMENT_TYPE_FACE_DOWN') return 'down';
  if (m.endsWith('_FACE_LEFT') || m === 'MOVEMENT_TYPE_FACE_LEFT') return 'left';
  if (m.endsWith('_FACE_RIGHT') || m === 'MOVEMENT_TYPE_FACE_RIGHT') return 'right';
  if (m.includes('WALK_IN_PLACE_DOWN')) return 'down';
  if (m.includes('WALK_IN_PLACE_UP')) return 'up';
  if (m.includes('WALK_IN_PLACE_LEFT')) return 'left';
  if (m.includes('WALK_IN_PLACE_RIGHT')) return 'right';
  return 'down';
}

const FACINGS: Facing[] = ['down', 'up', 'left', 'right'];

/** Pick random element. */
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Délais réels du décomp (event_object_movement.c:709-711) — frames @ 60fps.
// `sMovementDelaysMedium[] = {32, 64, 96, 128}` pour wander/look around.
// `sMovementDelaysShort[] = {32, 48, 64, 80}` pour patterns rapides.
const FRAME_MS = 1000 / 60;
const DELAYS_MEDIUM_MS = [32, 64, 96, 128].map(f => Math.round(f * FRAME_MS));
const DELAYS_SHORT_MS = [32, 48, 64, 80].map(f => Math.round(f * FRAME_MS));

/** Random delay selon le pattern (medium par défaut, short pour patterns rapides). */
function randomDelay(short = false): number {
  return pick(short ? DELAYS_SHORT_MS : DELAYS_MEDIUM_MS);
}

/**
 * Tick un NPC : décide si c'est le moment d'une nouvelle action selon son
 * MOVEMENT_TYPE, et la déclenche si oui.
 *
 * @param scene Phaser scene (pour tweens/timers via runMovement)
 * @param npc Sprite + facing + tile + textureKey + raw object event
 * @param state État behavior (mutable, persiste entre ticks)
 * @param now Timestamp courant (performance.now())
 * @param isWalkable Callback (tx, ty) → true si tile traversable (collision check)
 */
export function tickNpcBehavior(
  scene: Phaser.Scene,
  npc: {
    sprite: Phaser.GameObjects.Sprite;
    textureKey: string;
    tile: { x: number; y: number };
    facing: Facing;
    raw: { movement_type: string; movement_range_x: number; movement_range_y: number };
    inanimate?: boolean;
  },
  state: NpcBehaviorState,
  now: number,
  isWalkable: (tx: number, ty: number) => boolean,
): void {
  if (state.isRunning) return;
  if (now < state.nextActionAt) return;
  if (!npc.sprite.visible) return;
  // Décomp : pour les graphics `inanimate=TRUE` (sac, item ball, doll, pierres…),
  // tous les MovementType_* skip leur action (cf. event_object_movement.c). Notre
  // équivalent : on ne pick aucune action et on reschedule loin pour ne pas
  // re-évaluer chaque frame inutilement.
  if (npc.inanimate) {
    state.nextActionAt = now + 60_000;
    return;
  }

  const mt = npc.raw.movement_type.toUpperCase();
  const actions = pickActionsForMovementType(mt, npc, state, isWalkable);
  if (actions.length === 0) {
    // No action for this type → reschedule
    state.nextActionAt = now + randomDelay();
    return;
  }

  state.isRunning = true;
  const target: MovementSprite = {
    sprite: npc.sprite,
    textureKey: npc.textureKey,
    tile: npc.tile,
    facing: npc.facing,
  };
  runMovement(scene, target, actions).then(() => {
    npc.facing = target.facing;
    setIdleFrame(npc.sprite, npc.textureKey, npc.facing);
    state.isRunning = false;
    state.nextActionAt = performance.now() + randomDelay();
  });
}

/**
 * Décide quelle séquence d'actions jouer selon le MOVEMENT_TYPE.
 * Retourne [] si aucune action (no-op patterns).
 */
function pickActionsForMovementType(
  mt: string,
  npc: { tile: { x: number; y: number }; facing: Facing },
  state: NpcBehaviorState,
  isWalkable: (tx: number, ty: number) => boolean,
): string[] {
  // ─── FACE_* (statique, no-op après init) ─────────────────────────────────
  if (mt.includes('MOVEMENT_TYPE_FACE_') && !mt.includes('AND_')) return [];
  if (mt === 'MOVEMENT_TYPE_NONE' || mt === 'MOVEMENT_TYPE_PLAYER') return [];
  if (mt === 'MOVEMENT_TYPE_INVISIBLE' || mt === 'MOVEMENT_TYPE_BURIED') return [];

  // ─── LOOK_AROUND : random face change ────────────────────────────────────
  if (mt === 'MOVEMENT_TYPE_LOOK_AROUND') {
    const dir = pick(FACINGS);
    return [`face_${dir}`];
  }

  // ─── ROTATE_CLOCKWISE / COUNTERCLOCKWISE ─────────────────────────────────
  if (mt === 'MOVEMENT_TYPE_ROTATE_CLOCKWISE') {
    const order: Facing[] = ['up', 'right', 'down', 'left'];
    const next = order[(order.indexOf(npc.facing) + 1) % 4];
    return [`face_${next}`];
  }
  if (mt === 'MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE') {
    const order: Facing[] = ['up', 'left', 'down', 'right'];
    const next = order[(order.indexOf(npc.facing) + 1) % 4];
    return [`face_${next}`];
  }

  // ─── FACE_X_AND_Y : alternate entre 2-3 directions ───────────────────────
  // ex MOVEMENT_TYPE_FACE_DOWN_AND_UP → alternate down/up
  const faceMatch = mt.match(/^MOVEMENT_TYPE_FACE_([A-Z_]+)$/);
  if (faceMatch) {
    const dirs = faceMatch[1]
      .split('_AND_')
      .flatMap(s => s.split('_'))
      .map(s => s.toLowerCase())
      .filter((s): s is Facing => FACINGS.includes(s as Facing));
    if (dirs.length > 0) return [`face_${pick(dirs)}`];
  }

  // ─── WANDER_AROUND / WANDER_X_AND_Y : random walk dans range ─────────────
  if (mt.startsWith('MOVEMENT_TYPE_WANDER_')) {
    const dirs = parseWanderDirs(mt);
    return tryWanderStep(npc, state, dirs, isWalkable);
  }

  // ─── WALK_X_AND_Y : back-and-forth ───────────────────────────────────────
  if (mt.startsWith('MOVEMENT_TYPE_WALK_') &&
      !mt.includes('_IN_PLACE_') &&
      !mt.includes('SEQUENCE')) {
    const dirs = parseWanderDirs(mt.replace('MOVEMENT_TYPE_WALK_', 'MOVEMENT_TYPE_WANDER_'));
    return tryWanderStep(npc, state, dirs, isWalkable);
  }

  // ─── WALK_IN_PLACE / JOG_IN_PLACE / RUN_IN_PLACE : marche sur place ──────
  const inPlaceMatch = mt.match(/^MOVEMENT_TYPE_(WALK|JOG|RUN)_IN_PLACE_(DOWN|UP|LEFT|RIGHT)$/);
  if (inPlaceMatch) {
    const speed = inPlaceMatch[1] === 'WALK' ? '' : inPlaceMatch[1] === 'JOG' ? 'fast_' : 'faster_';
    const dir = inPlaceMatch[2].toLowerCase();
    return [`walk_in_place_${speed}${dir}`];
  }

  // ─── COPY_PLAYER, TREE_DISGUISE, etc. : no-op (advanced) ─────────────────
  return [];
}

/** Parse "MOVEMENT_TYPE_WANDER_AROUND" → ['up','down','left','right'].
 *  "MOVEMENT_TYPE_WANDER_UP_AND_DOWN" → ['up','down']. */
function parseWanderDirs(mt: string): Facing[] {
  if (mt === 'MOVEMENT_TYPE_WANDER_AROUND') return [...FACINGS];
  const m = mt.match(/^MOVEMENT_TYPE_WANDER_([A-Z_]+)$/);
  if (!m) return [];
  return m[1]
    .split('_AND_')
    .flatMap(s => s.split('_'))
    .map(s => s.toLowerCase())
    .filter((s): s is Facing => FACINGS.includes(s as Facing));
}

/** Tente une step dans une direction random parmi `dirs`, en respectant range + collisions. */
function tryWanderStep(
  npc: { tile: { x: number; y: number }; facing: Facing },
  state: NpcBehaviorState,
  dirs: Facing[],
  isWalkable: (tx: number, ty: number) => boolean,
): string[] {
  if (dirs.length === 0) return [];
  const dir = pick(dirs);
  const dxdy = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] }[dir]!;
  const newX = npc.tile.x + dxdy[0];
  const newY = npc.tile.y + dxdy[1];

  // Range check : ne pas dépasser homeX±range_x ou homeY±range_y.
  const rangeX = (npc as any).raw?.movement_range_x ?? 1;
  const rangeY = (npc as any).raw?.movement_range_y ?? 1;
  if (Math.abs(newX - state.homeX) > rangeX) return [`face_${dir}`];
  if (Math.abs(newY - state.homeY) > rangeY) return [`face_${dir}`];
  if (!isWalkable(newX, newY)) return [`face_${dir}`];

  return [`walk_${dir}`];
}
