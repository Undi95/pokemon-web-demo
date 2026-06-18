/**
 * movement-system.ts — glu opcode `applymovement` / `waitmovement`.
 *
 * RÔLE : pont MINCE entre le niveau opcode script (ScrCmd_applymovement /
 * ScrCmd_waitmovement) et le sous-système ScriptMovement 1:1 décomp
 * (`game/script_movement.ts`). Pipeline :
 *   label de movement → séquence d'actions strings (`_resolveMovementLabel`)
 *   → IDs numériques MOVEMENT_ACTION_X (`ConvertMovementActionsToIds`)
 *   → enqueue (`ScriptMovement_StartObjectMovementScript`)
 *   → tické par `ScriptMovement_MoveObjects` → `ObjectEventSetHeldMovement`
 *   → `gMovementActionFuncs[]` (le VRAI chemin décomp, dans `event_object_movement.ts`).
 *
 * Source de vérité décomp :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/script_movement.c`
 *     (ScriptMovement_StartObjectMovementScript / *_IsObjectMovementFinished)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c`
 *     (ScrCmd_applymovement / ScrCmd_waitmovement — qui appellent les ci-dessus)
 *
 * HISTORIQUE (élimination 2026-06-18) : ce fichier hébergeait un dispatcher maison
 * `_queues` (string → `_tickWalk`/`_tickJump`/`_setFacing`/… ~700 l) en FALLBACK
 * quand une action n'était pas mappable OU que ScriptMovement refusait un slot.
 * C'était un DOUBLON maison des MovementAction Step funcs qui vivent déjà dans
 * `event_object_movement.ts` (`gMovementActionFuncs[]`). Vérifié MORT en runtime :
 *   - intro step-off camion (3× applymovement réels : PlayerStepOffTruck + MomExitHouse
 *     + MomApproachPlayerAtTruck, chacun suivi de waitmovement 0) → 0 recours au fallback.
 *   - batterie synthétique exotique (slide/acro/emote/ride_water/walk_slow/walk_in_place
 *     + face_player/lock côté NPC) → 0 recours au fallback.
 * Le map `_MOVEMENT_ACTION_NAME_TO_ID` (script_movement.ts) couvre toutes les actions
 * décomp réelles ; un refus de slot ScriptMovement est lui-même 1:1 (ScrCmd_applymovement
 * ignore le retour → no-op, comme la ROM). Le fallback maison a donc été SUPPRIMÉ :
 * 100% du routage passe désormais par le chemin décomp ScriptMovement.
 */

import { gObjectEvents } from '../../game/event_object_movement';
import type { ObjectEvent } from '../../game/event_object_movement';
import { gPlayerAvatar } from '../../game/field_player_avatar';
import {
  ConvertMovementActionsToIds,
  ScriptMovement_StartObjectMovementScript,
  ScriptMovement_IsObjectMovementFinished,
} from '../../game/script_movement';
import { VarGet } from '../script/script-vars';

// ─── Movement label resolver ─────────────────────────────────────────────────

/** Hook pour lookup movement action sequence par label (e.g.
 *  'LittlerootTown_Movement_PlayerStepOffTruck' → ['jump_right', 'delay_16', ...]).
 *  Set par script-runtime au load des map scripts. */
let _resolveMovementLabel: ((label: string) => string[] | null) | null = null;

export function setMovementLabelResolver(fn: (label: string) => string[] | null): void {
  _resolveMovementLabel = fn;
}

// ─── Public API (applymovement / waitmovement) ───────────────────────────────

/** Enqueue movements pour un target localId via ScriptMovement (1:1 décomp).
 *
 *  @param targetLocalId LOCALID_PLAYER, LOCALID_X, VAR_*, ou un nombre.
 *  @param movementLabelOrActions Label (résolu via `_resolveMovementLabel`) OU
 *                                tableau d'actions strings résolu directement.
 *
 *  1:1 décomp `ScrCmd_applymovement` → `ScriptMovement_StartObjectMovementScript` :
 *  convertit les actions strings → IDs numériques, résout le target → objEventId,
 *  enqueue sur le ScriptMovement task. Le retour `refused` est ignoré (la ROM ne
 *  l'utilise pas — slot occupé = no-op).
 */
export function applyMovement(targetLocalId: string, movementLabelOrActions: string | string[]): void {
  let actions: string[] | null = null;
  if (Array.isArray(movementLabelOrActions)) {
    actions = movementLabelOrActions;
  } else if (_resolveMovementLabel) {
    actions = _resolveMovementLabel(movementLabelOrActions);
  }
  if (!actions || actions.length === 0) {
    console.warn(`[movement-system] applyMovement : label ${movementLabelOrActions} unresolved or empty`);
    return;
  }

  const target = _resolveTarget(targetLocalId);
  if (!target) return;
  const objEventId = target.isPlayer
    ? gPlayerAvatar.objectEventId
    : (target.npc ? gObjectEvents.indexOf(target.npc) : -1);
  if (objEventId < 0) return;

  const script = ConvertMovementActionsToIds(actions);
  if (script === null) {
    // Action non mappée dans `_MOVEMENT_ACTION_NAME_TO_ID` : surface le trou 1:1
    // au lieu de le masquer (le fallback maison historique est supprimé).
    console.warn(`[movement-system] applyMovement : actions non mappables ${JSON.stringify(actions)}`);
    return;
  }
  ScriptMovement_StartObjectMovementScript(objEventId, script);
}

/** True si la queue ScriptMovement pour targetLocalId est done (= no-op si absent). */
export function isMovementDone(targetLocalId: string): boolean {
  const target = _resolveTarget(targetLocalId);
  if (!target) return true;
  const objEventId = target.isPlayer
    ? gPlayerAvatar.objectEventId
    : (target.npc ? gObjectEvents.indexOf(target.npc) : -1);
  if (objEventId < 0) return true;
  return ScriptMovement_IsObjectMovementFinished(objEventId);
}

/** True si TOUTES les queues ScriptMovement sont done. Used par `waitmovement 0`. */
export function isAllMovementsDone(): boolean {
  for (let i = 0; i < gObjectEvents.length; i++) {
    const npc = gObjectEvents[i];
    if (!npc || !npc.active) continue;
    if (!ScriptMovement_IsObjectMovementFinished(i)) return false;
  }
  return true;
}

// ─── Target resolver ─────────────────────────────────────────────────────────

interface MovementTarget {
  isPlayer: boolean;
  npc?: ObjectEvent;
}

function _resolveTarget(key: string): MovementTarget | null {
  if (key === 'PLAYER' || key === 'LOCALID_PLAYER' || key === '255') return { isPlayer: true };
  // 1:1 décomp : si VAR_*, lire la value (= un number qui matche localId).
  if (key.startsWith('VAR_')) {
    const n = VarGet(key);
    // 255 = LOCALID_PLAYER (= 1:1 décomp).
    if (n === 255) return { isPlayer: true };
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return { isPlayer: false, npc };
    }
    return null;
  }
  // Find NPC by localIdRaw match (= LOCALID_X string).
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    if (npc.localIdRaw === key) return { isPlayer: false, npc };
  }
  // Fallback : match by numeric localId si key est un nombre.
  const n = parseInt(key, 10);
  if (!Number.isNaN(n)) {
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return { isPlayer: false, npc };
    }
  }
  return null;
}
