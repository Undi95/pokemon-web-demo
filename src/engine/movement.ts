import Phaser from 'phaser';
import { TILE_SIZE } from '../main';
import { setIdleFrame, playSingleStep, type Facing } from './character-anims';

/**
 * Movement actions du décomp.
 *
 * Source de vérité : `public/decomp/em/movement-actions.json` extrait par
 * `scripts/extract-movement-actions.mjs` depuis :
 *   - `asm/macros/movement.inc` (mapping script_name → MOVEMENT_ACTION_*)
 *   - `include/constants/event_object_movement.h` (160 valeurs MOVEMENT_ACTION_*)
 *
 * Couverture : 159/160 actions (vs 70 hardcoded avant). Cf. DECOMP_ORIGIN_FILES.md A.
 *
 * Format JSON par entrée :
 *   { actionId, actionConst, dx, dy, facing, kind, speedMs }
 *
 * Loaded via `loadMovementActions(json)` au boot. Fallback hardcoded ACTIONS
 * si le JSON n'est pas chargé (boot edge case).
 */
interface MovementActionDef {
  actionId: number;
  actionConst: string;
  dx: number;
  dy: number;
  facing: Facing | null;
  kind: string;       // walk, jump, jump_2, face, delay, emote, walk_in_place, etc.
  speedMs: number;
}

let actionsFromJson: Record<string, MovementActionDef> = {};

/** Wire le JSON `movement-actions.json` dans l'état global. */
export function loadMovementActions(json: Record<string, MovementActionDef>) {
  actionsFromJson = json || {};
}

/** Fallback hardcoded pour boot edge case (avant chargement JSON). */
const ACTIONS_FALLBACK: Record<string, [number, number, Facing | null, number]> = {
  // walk normal (vitesse joueur)
  walk_up: [0, -1, 'up', 220],
  walk_down: [0, 1, 'down', 220],
  walk_left: [-1, 0, 'left', 220],
  walk_right: [1, 0, 'right', 220],
  // walk_slow_X (NPCs lents)
  walk_slow_up: [0, -1, 'up', 320],
  walk_slow_down: [0, 1, 'down', 320],
  walk_slow_left: [-1, 0, 'left', 320],
  walk_slow_right: [1, 0, 'right', 320],
  walk_slowest_up: [0, -1, 'up', 480],
  walk_slowest_down: [0, 1, 'down', 480],
  walk_slowest_left: [-1, 0, 'left', 480],
  walk_slowest_right: [1, 0, 'right', 480],
  // walk_fast_X (course)
  walk_fast_up: [0, -1, 'up', 130],
  walk_fast_down: [0, 1, 'down', 130],
  walk_fast_left: [-1, 0, 'left', 130],
  walk_fast_right: [1, 0, 'right', 130],
  walk_faster_up: [0, -1, 'up', 90],
  walk_faster_down: [0, 1, 'down', 90],
  walk_faster_left: [-1, 0, 'left', 90],
  walk_faster_right: [1, 0, 'right', 90],
  // face_X : tourne sans bouger
  face_up: [0, 0, 'up', 30],
  face_down: [0, 0, 'down', 30],
  face_left: [0, 0, 'left', 30],
  face_right: [0, 0, 'right', 30],
  set_invisible: [0, 0, null, 1],
  set_visible: [0, 0, null, 1],
  // walk_in_place_X : marche sur place (anim de pas sans déplacement)
  walk_in_place_up: [0, 0, 'up', 220],
  walk_in_place_down: [0, 0, 'down', 220],
  walk_in_place_left: [0, 0, 'left', 220],
  walk_in_place_right: [0, 0, 'right', 220],
  walk_in_place_fast_up: [0, 0, 'up', 130],
  walk_in_place_fast_down: [0, 0, 'down', 130],
  walk_in_place_fast_left: [0, 0, 'left', 130],
  walk_in_place_fast_right: [0, 0, 'right', 130],
  walk_in_place_faster_up: [0, 0, 'up', 90],
  walk_in_place_faster_down: [0, 0, 'down', 90],
  walk_in_place_faster_left: [0, 0, 'left', 90],
  walk_in_place_faster_right: [0, 0, 'right', 90],
  // jump_X : saut d'une case (utilisé pour le step off truck, ledges, etc.)
  jump_up: [0, -1, 'up', 240],
  jump_down: [0, 1, 'down', 240],
  jump_left: [-1, 0, 'left', 240],
  jump_right: [1, 0, 'right', 240],
  // jump_2_X : saut de 2 cases (par-dessus un obstacle)
  jump_2_up: [0, -2, 'up', 320],
  jump_2_down: [0, 2, 'down', 320],
  jump_2_left: [-2, 0, 'left', 320],
  jump_2_right: [2, 0, 'right', 320],
  // jump_in_place_X : saute sur place
  jump_in_place_up: [0, 0, 'up', 240],
  jump_in_place_down: [0, 0, 'down', 240],
  jump_in_place_left: [0, 0, 'left', 240],
  jump_in_place_right: [0, 0, 'right', 240],
  // delays
  delay_1: [0, 0, null, 16],
  delay_2: [0, 0, null, 32],
  delay_4: [0, 0, null, 64],
  delay_8: [0, 0, null, 128],
  delay_16: [0, 0, null, 256],
  // Opcodes courants traités comme délais courts (emotes, face_player non implémentés)
  // Permet à la séquence de continuer sans warn dans la console.
  face_player: [0, 0, null, 30],
  face_away_player: [0, 0, null, 30],
  emote_exclamation_mark: [0, 0, null, 200],
  emote_question_mark: [0, 0, null, 200],
  emote_heart: [0, 0, null, 200],
  emote_x: [0, 0, null, 200],
  emote_double_exclamation_mark: [0, 0, null, 200],
  emote_smile: [0, 0, null, 200],
  lock_facing_direction: [0, 0, null, 1],
  unlock_facing_direction: [0, 0, null, 1],
};

export interface MovementSprite {
  sprite: Phaser.GameObjects.Sprite;
  textureKey: string;
  // tile courante (mutée à chaque step)
  tile: { x: number; y: number };
  facing: Facing;
}

const STEP_END = 'step_end';

/**
 * Exécute une séquence de movement sur un sprite. Retourne une Promise qui
 * resolve quand tout est terminé (équivalent du `waitmovement` du décomp).
 *
 * @param scene Phaser scene pour les tweens et timers
 * @param target descripteur du sprite (NPC ou player)
 * @param actions liste de tokens du label Movement_X (ex. ['walk_up', 'walk_up', 'face_left', 'step_end'])
 */
/**
 * Lookup une action : JSON décomp en priorité, fallback hardcoded.
 * Retourne null si action inconnue (caller doit skip).
 */
function lookupAction(name: string): { dx: number; dy: number; facing: Facing | null; dur: number } | null {
  const fromJson = actionsFromJson[name];
  if (fromJson) {
    return { dx: fromJson.dx, dy: fromJson.dy, facing: fromJson.facing, dur: fromJson.speedMs };
  }
  const fb = ACTIONS_FALLBACK[name];
  if (fb) return { dx: fb[0], dy: fb[1], facing: fb[2], dur: fb[3] };
  return null;
}

export function runMovement(
  scene: Phaser.Scene,
  target: MovementSprite,
  actions: string[]
): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= actions.length) { resolve(); return; }
      const a = actions[i++].trim();
      if (!a || a === STEP_END) { resolve(); return; }
      // set_visible / set_invisible togglent visibility et avancent immédiatement
      if (a === 'set_invisible') { target.sprite.setVisible(false); next(); return; }
      if (a === 'set_visible') { target.sprite.setVisible(true); next(); return; }
      const def = lookupAction(a);
      if (!def) {
        if (typeof console !== 'undefined') console.warn('[movement] action inconnue:', a);
        next();
        return;
      }
      const { dx, dy, facing, dur } = def;
      if (facing) {
        target.facing = facing;
        setIdleFrame(target.sprite, target.textureKey, facing);
      }
      if (dx === 0 && dy === 0) {
        scene.time.delayedCall(dur, next);
        return;
      }
      target.tile.x += dx;
      target.tile.y += dy;
      const tx = target.tile.x * TILE_SIZE + TILE_SIZE / 2;
      const ty = target.tile.y * TILE_SIZE + TILE_SIZE;
      // Anim de marche : play step1/idle séquence synchro avec la durée du tween.
      // Sans ça le sprite "glissait" sur sa frame idle (effet visuel bizarre,
      // ressemble à un loop selon le user).
      if (facing) playSingleStep(target.sprite, target.textureKey, facing, dur);
      scene.tweens.add({
        targets: target.sprite,
        x: tx, y: ty,
        duration: dur,
        ease: 'Linear',
        onUpdate: () => target.sprite.setDepth(target.sprite.y),
        onComplete: () => { target.sprite.setDepth(ty); next(); }
      });
    };
    next();
  });
}
