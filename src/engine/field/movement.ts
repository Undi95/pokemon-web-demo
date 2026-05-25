import Phaser from 'phaser';
import { TILE_SIZE } from '../../main';
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

// Phase D-cleanup audit session 83 : ACTIONS_FALLBACK hardcoded retiré.
// La source unique = `public/decomp/em/movement-actions.json` extrait par
// `scripts/extract-movement-actions.mjs` depuis `asm/macros/movement.inc` +
// `include/constants/event_object_movement.h`. Si une action est requested
// avant que `loadMovementActions(json)` soit appelé, on log un warning et
// on retourne null (= caller skip cette action). Pas de fallback duplication.

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
 * Lookup une action : JSON décomp uniquement (source de vérité 1:1 décomp).
 * Retourne null si action inconnue ou JSON pas chargé (caller skip cette action).
 */
let _missingJsonWarned = false;
function lookupAction(name: string): { dx: number; dy: number; facing: Facing | null; dur: number } | null {
  const fromJson = actionsFromJson[name];
  if (fromJson) {
    return { dx: fromJson.dx, dy: fromJson.dy, facing: fromJson.facing, dur: fromJson.speedMs };
  }
  // No fallback hardcoded — si JSON pas chargé OU action inconnue, on log
  // 1× le warning et on skip. Le caller (= runMovement) va simplement passer
  // à l'action suivante.
  if (Object.keys(actionsFromJson).length === 0 && !_missingJsonWarned) {
    console.warn('[movement] movement-actions.json not loaded (= call loadMovementActions early in scene init)');
    _missingJsonWarned = true;
  }
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
