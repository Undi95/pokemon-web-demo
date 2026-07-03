/**
 * script_movement.ts — miroir 1:1 de `script_movement.c` (= ScriptMovement_X task).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/script_movement.c`.
 *
 * Le système :
 *   - `ScriptMovement_StartObjectMovementScript(localId, mapNum, mapGroup, script)`
 *     enqueue une séquence d'actions sur un ObjectEvent. Crée une Task globale
 *     `ScriptMovement_MoveObjects` (priority 50) si pas déjà active. Task data
 *     stocke les `objEventId` des NPCs ayant un script actif (max OBJECT_EVENTS_COUNT
 *     = 16).
 *   - Per-frame, `ScriptMovement_MoveObjects` tick loop sur les entries actives.
 *     Pour chaque entry : `ScriptMovement_TakeStep` lit l'action suivante,
 *     dispatch via `ObjectEventSetHeldMovement(npc, actionId)`, attend que
 *     `ObjectEventClearHeldMovementIfFinished` retourne true, puis avance le ptr.
 *   - Quand `MOVEMENT_ACTION_STEP_END (254)` est atteint, `FreezeObjectEvent`
 *     + flag movementScriptFinished.
 *
 * Actions sont stockées comme numeric MOVEMENT_ACTION_X IDs (= 1:1 décomp).
 * Notre extractor emet des strings ("walk_down", "delay_16", "step_end") qui
 * sont converties via `_MOVEMENT_ACTION_NAME_TO_ID` table mapping 1:1 décomp
 * `asm/macros/movement.inc:create_movement_action` (= 159 entries).
 *
 * Note : ce module est intentionnellement self-contained. Il ne dépend que de :
 *   - `gObjectEvents`, `gPlayerAvatar` (= NPC lookup)
 *   - `ObjectEventSetHeldMovement` / `ObjectEventClearHeldMovementIfFinished` /
 *     `FreezeObjectEvent` / `UnfreezeObjectEvent` (= event_object_movement.c API)
 *
 * Migration : `applyMovement(target, label)` (= movement-system.ts) wrap autour
 * de `ScriptMovement_StartObjectMovementScript` quand le script entier est
 * mappable via _MOVEMENT_ACTION_NAME_TO_ID. Pour les actions non-mappées,
 * fallback à l'ancien _queues system. Cf. movement-system.ts.
 */

import {
  MOVEMENT_ACTION_FACE_DOWN, MOVEMENT_ACTION_FACE_UP, MOVEMENT_ACTION_FACE_LEFT, MOVEMENT_ACTION_FACE_RIGHT,
  MOVEMENT_ACTION_WALK_SLOW_DOWN, MOVEMENT_ACTION_WALK_SLOW_UP, MOVEMENT_ACTION_WALK_SLOW_LEFT, MOVEMENT_ACTION_WALK_SLOW_RIGHT,
  MOVEMENT_ACTION_WALK_NORMAL_DOWN, MOVEMENT_ACTION_WALK_NORMAL_UP, MOVEMENT_ACTION_WALK_NORMAL_LEFT, MOVEMENT_ACTION_WALK_NORMAL_RIGHT,
  MOVEMENT_ACTION_JUMP_2_DOWN, MOVEMENT_ACTION_JUMP_2_UP, MOVEMENT_ACTION_JUMP_2_LEFT, MOVEMENT_ACTION_JUMP_2_RIGHT,
  MOVEMENT_ACTION_DELAY_1, MOVEMENT_ACTION_DELAY_2, MOVEMENT_ACTION_DELAY_4, MOVEMENT_ACTION_DELAY_8, MOVEMENT_ACTION_DELAY_16,
  MOVEMENT_ACTION_WALK_FAST_DOWN, MOVEMENT_ACTION_WALK_FAST_UP, MOVEMENT_ACTION_WALK_FAST_LEFT, MOVEMENT_ACTION_WALK_FAST_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_UP, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_UP, MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN, MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP, MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT, MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT,
  MOVEMENT_ACTION_WALK_FASTER_DOWN, MOVEMENT_ACTION_WALK_FASTER_UP, MOVEMENT_ACTION_WALK_FASTER_LEFT, MOVEMENT_ACTION_WALK_FASTER_RIGHT,
  MOVEMENT_ACTION_SLIDE_DOWN, MOVEMENT_ACTION_SLIDE_UP, MOVEMENT_ACTION_SLIDE_LEFT, MOVEMENT_ACTION_SLIDE_RIGHT,
  MOVEMENT_ACTION_PLAYER_RUN_DOWN, MOVEMENT_ACTION_PLAYER_RUN_UP, MOVEMENT_ACTION_PLAYER_RUN_LEFT, MOVEMENT_ACTION_PLAYER_RUN_RIGHT,
  MOVEMENT_ACTION_START_ANIM_IN_DIRECTION,
  MOVEMENT_ACTION_JUMP_SPECIAL_DOWN, MOVEMENT_ACTION_JUMP_SPECIAL_UP, MOVEMENT_ACTION_JUMP_SPECIAL_LEFT, MOVEMENT_ACTION_JUMP_SPECIAL_RIGHT,
  MOVEMENT_ACTION_FACE_PLAYER, MOVEMENT_ACTION_FACE_AWAY_PLAYER,
  MOVEMENT_ACTION_LOCK_FACING_DIRECTION, MOVEMENT_ACTION_UNLOCK_FACING_DIRECTION,
  MOVEMENT_ACTION_JUMP_DOWN, MOVEMENT_ACTION_JUMP_UP, MOVEMENT_ACTION_JUMP_LEFT, MOVEMENT_ACTION_JUMP_RIGHT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN, MOVEMENT_ACTION_JUMP_IN_PLACE_UP, MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT, MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP, MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN, MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT, MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT,
  MOVEMENT_ACTION_FACE_ORIGINAL_DIRECTION, MOVEMENT_ACTION_NURSE_JOY_BOW_DOWN,
  MOVEMENT_ACTION_ENABLE_JUMP_LANDING_GROUND_EFFECT, MOVEMENT_ACTION_DISABLE_JUMP_LANDING_GROUND_EFFECT,
  MOVEMENT_ACTION_DISABLE_ANIMATION, MOVEMENT_ACTION_RESTORE_ANIMATION,
  MOVEMENT_ACTION_SET_INVISIBLE, MOVEMENT_ACTION_SET_VISIBLE,
  MOVEMENT_ACTION_EMOTE_EXCLAMATION_MARK, MOVEMENT_ACTION_EMOTE_QUESTION_MARK, MOVEMENT_ACTION_EMOTE_HEART,
  MOVEMENT_ACTION_REVEAL_TRAINER, MOVEMENT_ACTION_ROCK_SMASH_BREAK, MOVEMENT_ACTION_CUT_TREE,
  MOVEMENT_ACTION_SET_FIXED_PRIORITY, MOVEMENT_ACTION_CLEAR_FIXED_PRIORITY,
  MOVEMENT_ACTION_INIT_AFFINE_ANIM, MOVEMENT_ACTION_CLEAR_AFFINE_ANIM,
  MOVEMENT_ACTION_HIDE_REFLECTION, MOVEMENT_ACTION_SHOW_REFLECTION,
  MOVEMENT_ACTION_WALK_DOWN_START_AFFINE, MOVEMENT_ACTION_WALK_DOWN_AFFINE,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_UP, MOVEMENT_ACTION_ACRO_POP_WHEELIE_LEFT, MOVEMENT_ACTION_ACRO_POP_WHEELIE_RIGHT,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_UP, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_LEFT, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_UP, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_UP, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_UP, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_LEFT, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_RIGHT,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_UP, MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_LEFT, MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_RIGHT,
  MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_UP_LEFT, MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_UP_RIGHT, MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_DOWN_LEFT, MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_DOWN_RIGHT,
  MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_UP_LEFT, MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_UP_RIGHT, MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_DOWN_LEFT, MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_DOWN_RIGHT,
  MOVEMENT_ACTION_LOCK_ANIM, MOVEMENT_ACTION_UNLOCK_ANIM,
  MOVEMENT_ACTION_WALK_LEFT_AFFINE, MOVEMENT_ACTION_WALK_RIGHT_AFFINE,
  MOVEMENT_ACTION_LEVITATE, MOVEMENT_ACTION_STOP_LEVITATE, MOVEMENT_ACTION_STOP_LEVITATE_AT_TOP, MOVEMENT_ACTION_FIGURE_8,
  MOVEMENT_ACTION_FLY_UP, MOVEMENT_ACTION_FLY_DOWN,
  MOVEMENT_ACTION_STEP_END,
} from '../include/constants/event_object_movement';

/** 1:1 décomp `asm/macros/movement.inc:create_movement_action` table.
 *  Maps action name string (snake_case) → numeric MOVEMENT_ACTION_X (u8).
 *  159 entries (= 158 movement actions + step_end terminator). */
export const _MOVEMENT_ACTION_NAME_TO_ID: Readonly<Record<string, number>> = {
  ['face_down']: MOVEMENT_ACTION_FACE_DOWN,
  ['face_up']: MOVEMENT_ACTION_FACE_UP,
  ['face_left']: MOVEMENT_ACTION_FACE_LEFT,
  ['face_right']: MOVEMENT_ACTION_FACE_RIGHT,
  ['walk_slow_down']: MOVEMENT_ACTION_WALK_SLOW_DOWN,
  ['walk_slow_up']: MOVEMENT_ACTION_WALK_SLOW_UP,
  ['walk_slow_left']: MOVEMENT_ACTION_WALK_SLOW_LEFT,
  ['walk_slow_right']: MOVEMENT_ACTION_WALK_SLOW_RIGHT,
  ['walk_down']: MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  ['walk_up']: MOVEMENT_ACTION_WALK_NORMAL_UP,
  ['walk_left']: MOVEMENT_ACTION_WALK_NORMAL_LEFT,
  ['walk_right']: MOVEMENT_ACTION_WALK_NORMAL_RIGHT,
  ['jump_2_down']: MOVEMENT_ACTION_JUMP_2_DOWN,
  ['jump_2_up']: MOVEMENT_ACTION_JUMP_2_UP,
  ['jump_2_left']: MOVEMENT_ACTION_JUMP_2_LEFT,
  ['jump_2_right']: MOVEMENT_ACTION_JUMP_2_RIGHT,
  ['delay_1']: MOVEMENT_ACTION_DELAY_1,
  ['delay_2']: MOVEMENT_ACTION_DELAY_2,
  ['delay_4']: MOVEMENT_ACTION_DELAY_4,
  ['delay_8']: MOVEMENT_ACTION_DELAY_8,
  ['delay_16']: MOVEMENT_ACTION_DELAY_16,
  ['walk_fast_down']: MOVEMENT_ACTION_WALK_FAST_DOWN,
  ['walk_fast_up']: MOVEMENT_ACTION_WALK_FAST_UP,
  ['walk_fast_left']: MOVEMENT_ACTION_WALK_FAST_LEFT,
  ['walk_fast_right']: MOVEMENT_ACTION_WALK_FAST_RIGHT,
  ['walk_in_place_slow_down']: MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN,
  ['walk_in_place_slow_up']: MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_UP,
  ['walk_in_place_slow_left']: MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT,
  ['walk_in_place_slow_right']: MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_RIGHT,
  ['walk_in_place_down']: MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN,
  ['walk_in_place_up']: MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP,
  ['walk_in_place_left']: MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT,
  ['walk_in_place_right']: MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT,
  ['walk_in_place_fast_down']: MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN,
  ['walk_in_place_fast_up']: MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP,
  ['walk_in_place_fast_left']: MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT,
  ['walk_in_place_fast_right']: MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT,
  ['walk_in_place_faster_down']: MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN,
  ['walk_in_place_faster_up']: MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_UP,
  ['walk_in_place_faster_left']: MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_LEFT,
  ['walk_in_place_faster_right']: MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT,
  ['ride_water_current_down']: MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN,
  ['ride_water_current_up']: MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP,
  ['ride_water_current_left']: MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT,
  ['ride_water_current_right']: MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT,
  ['walk_faster_down']: MOVEMENT_ACTION_WALK_FASTER_DOWN,
  ['walk_faster_up']: MOVEMENT_ACTION_WALK_FASTER_UP,
  ['walk_faster_left']: MOVEMENT_ACTION_WALK_FASTER_LEFT,
  ['walk_faster_right']: MOVEMENT_ACTION_WALK_FASTER_RIGHT,
  ['slide_down']: MOVEMENT_ACTION_SLIDE_DOWN,
  ['slide_up']: MOVEMENT_ACTION_SLIDE_UP,
  ['slide_left']: MOVEMENT_ACTION_SLIDE_LEFT,
  ['slide_right']: MOVEMENT_ACTION_SLIDE_RIGHT,
  ['player_run_down']: MOVEMENT_ACTION_PLAYER_RUN_DOWN,
  ['player_run_up']: MOVEMENT_ACTION_PLAYER_RUN_UP,
  ['player_run_left']: MOVEMENT_ACTION_PLAYER_RUN_LEFT,
  ['player_run_right']: MOVEMENT_ACTION_PLAYER_RUN_RIGHT,
  ['start_anim_in_direction']: MOVEMENT_ACTION_START_ANIM_IN_DIRECTION,
  ['jump_special_down']: MOVEMENT_ACTION_JUMP_SPECIAL_DOWN,
  ['jump_special_up']: MOVEMENT_ACTION_JUMP_SPECIAL_UP,
  ['jump_special_left']: MOVEMENT_ACTION_JUMP_SPECIAL_LEFT,
  ['jump_special_right']: MOVEMENT_ACTION_JUMP_SPECIAL_RIGHT,
  ['face_player']: MOVEMENT_ACTION_FACE_PLAYER,
  ['face_away_player']: MOVEMENT_ACTION_FACE_AWAY_PLAYER,
  ['lock_facing_direction']: MOVEMENT_ACTION_LOCK_FACING_DIRECTION,
  ['unlock_facing_direction']: MOVEMENT_ACTION_UNLOCK_FACING_DIRECTION,
  ['jump_down']: MOVEMENT_ACTION_JUMP_DOWN,
  ['jump_up']: MOVEMENT_ACTION_JUMP_UP,
  ['jump_left']: MOVEMENT_ACTION_JUMP_LEFT,
  ['jump_right']: MOVEMENT_ACTION_JUMP_RIGHT,
  ['jump_in_place_down']: MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,
  ['jump_in_place_up']: MOVEMENT_ACTION_JUMP_IN_PLACE_UP,
  ['jump_in_place_left']: MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT,
  ['jump_in_place_right']: MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT,
  ['jump_in_place_down_up']: MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP,
  ['jump_in_place_up_down']: MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN,
  ['jump_in_place_left_right']: MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT,
  ['jump_in_place_right_left']: MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT,
  ['face_original_direction']: MOVEMENT_ACTION_FACE_ORIGINAL_DIRECTION,
  ['nurse_joy_bow']: MOVEMENT_ACTION_NURSE_JOY_BOW_DOWN,
  ['enable_jump_landing_ground_effect']: MOVEMENT_ACTION_ENABLE_JUMP_LANDING_GROUND_EFFECT,
  ['disable_jump_landing_ground_effect']: MOVEMENT_ACTION_DISABLE_JUMP_LANDING_GROUND_EFFECT,
  ['disable_anim']: MOVEMENT_ACTION_DISABLE_ANIMATION,
  ['restore_anim']: MOVEMENT_ACTION_RESTORE_ANIMATION,
  ['set_invisible']: MOVEMENT_ACTION_SET_INVISIBLE,
  ['set_visible']: MOVEMENT_ACTION_SET_VISIBLE,
  ['emote_exclamation_mark']: MOVEMENT_ACTION_EMOTE_EXCLAMATION_MARK,
  ['emote_question_mark']: MOVEMENT_ACTION_EMOTE_QUESTION_MARK,
  ['emote_heart']: MOVEMENT_ACTION_EMOTE_HEART,
  ['reveal_trainer']: MOVEMENT_ACTION_REVEAL_TRAINER,
  ['rock_smash_break']: MOVEMENT_ACTION_ROCK_SMASH_BREAK,
  ['cut_tree']: MOVEMENT_ACTION_CUT_TREE,
  ['set_fixed_priority']: MOVEMENT_ACTION_SET_FIXED_PRIORITY,
  ['clear_fixed_priority']: MOVEMENT_ACTION_CLEAR_FIXED_PRIORITY,
  ['init_affine_anim']: MOVEMENT_ACTION_INIT_AFFINE_ANIM,
  ['clear_affine_anim']: MOVEMENT_ACTION_CLEAR_AFFINE_ANIM,
  ['hide_reflection']: MOVEMENT_ACTION_HIDE_REFLECTION,
  ['show_reflection']: MOVEMENT_ACTION_SHOW_REFLECTION,
  ['walk_down_start_affine']: MOVEMENT_ACTION_WALK_DOWN_START_AFFINE,
  ['walk_down_affine']: MOVEMENT_ACTION_WALK_DOWN_AFFINE,
  ['acro_wheelie_face_down']: MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN,
  ['acro_wheelie_face_up']: MOVEMENT_ACTION_ACRO_WHEELIE_FACE_UP,
  ['acro_wheelie_face_left']: MOVEMENT_ACTION_ACRO_WHEELIE_FACE_LEFT,
  ['acro_wheelie_face_right']: MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT,
  ['acro_pop_wheelie_down']: MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN,
  ['acro_pop_wheelie_up']: MOVEMENT_ACTION_ACRO_POP_WHEELIE_UP,
  ['acro_pop_wheelie_left']: MOVEMENT_ACTION_ACRO_POP_WHEELIE_LEFT,
  ['acro_pop_wheelie_right']: MOVEMENT_ACTION_ACRO_POP_WHEELIE_RIGHT,
  ['acro_end_wheelie_face_down']: MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN,
  ['acro_end_wheelie_face_up']: MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_UP,
  ['acro_end_wheelie_face_left']: MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_LEFT,
  ['acro_end_wheelie_face_right']: MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT,
  ['acro_wheelie_hop_face_down']: MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN,
  ['acro_wheelie_hop_face_up']: MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_UP,
  ['acro_wheelie_hop_face_left']: MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_LEFT,
  ['acro_wheelie_hop_face_right']: MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_RIGHT,
  ['acro_wheelie_hop_down']: MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN,
  ['acro_wheelie_hop_up']: MOVEMENT_ACTION_ACRO_WHEELIE_HOP_UP,
  ['acro_wheelie_hop_left']: MOVEMENT_ACTION_ACRO_WHEELIE_HOP_LEFT,
  ['acro_wheelie_hop_right']: MOVEMENT_ACTION_ACRO_WHEELIE_HOP_RIGHT,
  ['acro_wheelie_jump_down']: MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN,
  ['acro_wheelie_jump_up']: MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_UP,
  ['acro_wheelie_jump_left']: MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_LEFT,
  ['acro_wheelie_jump_right']: MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_RIGHT,
  ['acro_wheelie_in_place_down']: MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN,
  ['acro_wheelie_in_place_up']: MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_UP,
  ['acro_wheelie_in_place_left']: MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_LEFT,
  ['acro_wheelie_in_place_right']: MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT,
  ['acro_pop_wheelie_move_down']: MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN,
  ['acro_pop_wheelie_move_up']: MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_UP,
  ['acro_pop_wheelie_move_left']: MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_LEFT,
  ['acro_pop_wheelie_move_right']: MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_RIGHT,
  ['acro_wheelie_move_down']: MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN,
  ['acro_wheelie_move_up']: MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP,
  ['acro_wheelie_move_left']: MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_LEFT,
  ['acro_wheelie_move_right']: MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_RIGHT,
  ['acro_end_wheelie_move_down']: MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN,
  ['acro_end_wheelie_move_up']: MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_UP,
  ['acro_end_wheelie_move_left']: MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_LEFT,
  ['acro_end_wheelie_move_right']: MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_RIGHT,
  ['walk_diag_northwest']: MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_UP_LEFT,
  ['walk_diag_northeast']: MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_UP_RIGHT,
  ['walk_diag_southwest']: MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_DOWN_LEFT,
  ['walk_diag_southeast']: MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_DOWN_RIGHT,
  ['walk_slow_diag_northwest']: MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_UP_LEFT,
  ['walk_slow_diag_northeast']: MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_UP_RIGHT,
  ['walk_slow_diag_southwest']: MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_DOWN_LEFT,
  ['walk_slow_diag_southeast']: MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_DOWN_RIGHT,
  ['lock_anim']: MOVEMENT_ACTION_LOCK_ANIM,
  ['unlock_anim']: MOVEMENT_ACTION_UNLOCK_ANIM,
  ['walk_left_affine']: MOVEMENT_ACTION_WALK_LEFT_AFFINE,
  ['walk_right_affine']: MOVEMENT_ACTION_WALK_RIGHT_AFFINE,
  ['levitate']: MOVEMENT_ACTION_LEVITATE,
  ['stop_levitate']: MOVEMENT_ACTION_STOP_LEVITATE,
  ['destroy_extra_task']: MOVEMENT_ACTION_STOP_LEVITATE_AT_TOP,
  ['figure_8']: MOVEMENT_ACTION_FIGURE_8,
  ['fly_up']: MOVEMENT_ACTION_FLY_UP,
  ['fly_down']: MOVEMENT_ACTION_FLY_DOWN,
  ['step_end']: MOVEMENT_ACTION_STEP_END,
};

/** Convertit une séquence d'actions strings (= depuis script extracted JSON)
 *  en numeric MOVEMENT_ACTION_X array. Return null si une action n'est pas
 *  mappable (= fallback nécessaire au caller). */
export function ConvertMovementActionsToIds(actions: ReadonlyArray<string>): Uint8Array | null {
  const ids = new Uint8Array(actions.length);
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    // Action peut avoir des espaces (= e.g. "walk_down " from JSON trim issue).
    const trimmed = action.trim();
    const id = _MOVEMENT_ACTION_NAME_TO_ID[trimmed];
    if (id === undefined) {
      // Action non mappée — return null pour fallback.
      return null;
    }
    ids[i] = id;
  }
  return ids;
}

// ─── ScriptMovement task port 1:1 strict décomp script_movement.c ────────────

import {
  gObjectEvents,
  ObjectEventIsHeldMovementActive,
  ObjectEventClearHeldMovementIfFinished,
  ObjectEventSetHeldMovement,
  FreezeObjectEvent,
  UnfreezeObjectEvent,
  TryGetObjectEventIdByLocalIdAndMap,
} from './event_object_movement';

/** 1:1 décomp `OBJECT_EVENTS_COUNT` (= include/constants/global.h) : max 16
 *  NPCs simultanés. La task data stocke 16 entries (objEventId per slot). */
const OBJECT_EVENTS_COUNT = 16;

/** 1:1 décomp `LOCALID_NONE` (= 0xFF sentinel). */
const LOCALID_NONE = 0xFF;

/** 1:1 décomp `LOCALID_PLAYER` (= constants/event_objects.h). */
const LOCALID_PLAYER = 0xFF;
void LOCALID_PLAYER;

/** 1:1 décomp `sMovementScripts[OBJECT_EVENTS_COUNT]` (script_movement.c:19).
 *  Array de pointers vers les scripts ASM (= numeric IDs). Notre TS : array
 *  de pointers vers Uint8Array action ID sequences. */
const _sMovementScripts: (Uint8Array | null)[] = new Array(OBJECT_EVENTS_COUNT).fill(null);

/** 1:1 décomp `sMovementScriptPositions[OBJECT_EVENTS_COUNT]` (= notre extension,
 *  car décomp avance le pointer C `movementScript++` directement, mais notre TS
 *  utilise un index dans Uint8Array). */
const _sMovementScriptPositions: number[] = new Array(OBJECT_EVENTS_COUNT).fill(0);

/** 1:1 décomp task data structure (script_movement.c:65) :
 *    data[0] = bitmask `movementScriptFinished` (16 bits, 1 per slot)
 *    data[1..16] = objEventId per slot (0xFF = empty)
 *
 *  Notre TS : tableau de 17 u16 (= NUM_TASK_DATA). */
const _scriptMovementTaskData = new Uint16Array(17);
_scriptMovementTaskData[0] = 0;  // movementScriptFinished bitmask
for (let i = 1; i < 17; i++) _scriptMovementTaskData[i] = 0xFFFF;  // empty slots

let _scriptMovementTaskActive = false;

/** 1:1 décomp `gBitTable[]` (= include/util.h). gBitTable[i] = 1 << i. */
function _bitTable(i: number): number { return 1 << i; }

/** 1:1 décomp `ScriptMovement_StartMoveObjects(priority)` (script_movement.c:59) :
 *    taskId = CreateTask(ScriptMovement_MoveObjects, priority);
 *    for (i = 1; i < NUM_TASK_DATA; i++) gTasks[taskId].data[i] = 0xFFFF;
 *
 *  Notre TS : reset _scriptMovementTaskData[1..16] = 0xFFFF. */
function _ScriptMovement_StartMoveObjects(): void {
  _scriptMovementTaskActive = true;
  _scriptMovementTaskData[0] = 0;
  for (let i = 1; i < 17; i++) _scriptMovementTaskData[i] = 0xFFFF;
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    _sMovementScripts[i] = null;
    _sMovementScriptPositions[i] = 0;
  }
}

/** 1:1 décomp `GetMovementScriptIdFromObjectEventId(taskId, objEventId)`
 *  (script_movement.c:104) : loop sur task.data[1..16], return slot i ou
 *  OBJECT_EVENTS_COUNT (= 16) si pas trouvé. */
function _GetMovementScriptIdFromObjectEventId(objEventId: number): number {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    if ((_scriptMovementTaskData[1 + i] & 0xFF) === objEventId) return i;
  }
  return OBJECT_EVENTS_COUNT;
}

/** 1:1 décomp `ClearMovementScriptFinished(taskId, moveScrId)` (script_movement.c:143). */
function _ClearMovementScriptFinished(moveScrId: number): void {
  _scriptMovementTaskData[0] &= ~_bitTable(moveScrId) & 0xFFFF;
}

/** 1:1 décomp `SetMovementScriptFinished(taskId, moveScrId)` (script_movement.c:150). */
function _SetMovementScriptFinished(moveScrId: number): void {
  _scriptMovementTaskData[0] |= _bitTable(moveScrId);
}

/** 1:1 décomp `IsMovementScriptFinished(taskId, moveScrId)` (script_movement.c:155). */
function _IsMovementScriptFinishedBitmask(moveScrId: number): boolean {
  return (_scriptMovementTaskData[0] & _bitTable(moveScrId)) !== 0;
}

/** 1:1 décomp `ScriptMovement_AddNewMovement(taskId, moveScrId, objEventId, script)`
 *  (script_movement.c:175) : clear finished + store script + set objEventId. */
function _ScriptMovement_AddNewMovement(moveScrId: number, objEventId: number, script: Uint8Array): void {
  _ClearMovementScriptFinished(moveScrId);
  _sMovementScripts[moveScrId] = script;
  _sMovementScriptPositions[moveScrId] = 0;
  _scriptMovementTaskData[1 + moveScrId] = objEventId;
}

/** 1:1 décomp `ScriptMovement_TryAddNewMovement(taskId, objEventId, script)`
 *  (script_movement.c:75) : si déjà active queue → return TRUE (= refused) ou
 *  add new. Sinon trouve slot libre (= player slot fallback). */
function _ScriptMovement_TryAddNewMovement(objEventId: number, script: Uint8Array): boolean {
  let moveScrId = _GetMovementScriptIdFromObjectEventId(objEventId);
  if (moveScrId !== OBJECT_EVENTS_COUNT) {
    // Déjà une queue active pour ce NPC.
    if (!_IsMovementScriptFinishedBitmask(moveScrId)) {
      // Pas finished — refuser (= return TRUE).
      return true;
    }
    // Finished — overwrite avec nouveau script.
    _ScriptMovement_AddNewMovement(moveScrId, objEventId, script);
    return false;
  }
  // Pas de queue active pour ce NPC — trouver slot libre via player slot
  // (= 1:1 décomp utilise LOCALID_PLAYER comme sentinel "slot vide").
  moveScrId = _GetMovementScriptIdFromObjectEventId(0xFF);  // = LOCALID_NONE (slot vide marker)
  if (moveScrId === OBJECT_EVENTS_COUNT) return true;  // no free slot
  _ScriptMovement_AddNewMovement(moveScrId, objEventId, script);
  return false;
}

/** 1:1 décomp `ScriptMovement_TakeStep(taskId, moveScrId, objEventId, script)`
 *  (script_movement.c:208) :
 *    if (ObjectEventIsHeldMovementActive && !ObjectEventClearHeldMovementIfFinished)
 *      return;  // wait
 *    nextActionId = *script;
 *    if (nextActionId == MOVEMENT_ACTION_STEP_END) {
 *      SetMovementScriptFinished(moveScrId);
 *      FreezeObjectEvent(npc);
 *    } else {
 *      if (!ObjectEventSetHeldMovement(npc, nextActionId)) {
 *        movementScript++;
 *        SetMovementScript(moveScrId, movementScript);
 *      }
 *    } */
function _ScriptMovement_TakeStep(moveScrId: number, objEventId: number): void {
  const npc = gObjectEvents[objEventId];
  if (!npc || !npc.active) return;

  // 1:1 décomp : wait pour held movement complete.
  if (ObjectEventIsHeldMovementActive(npc) && !ObjectEventClearHeldMovementIfFinished(npc)) {
    return;
  }

  const script = _sMovementScripts[moveScrId];
  if (!script) {
    _SetMovementScriptFinished(moveScrId);
    return;
  }

  const pos = _sMovementScriptPositions[moveScrId];
  if (pos >= script.length) {
    _SetMovementScriptFinished(moveScrId);
    FreezeObjectEvent(npc);
    return;
  }

  const nextActionId = script[pos];
  if (nextActionId === MOVEMENT_ACTION_STEP_END) {
    _SetMovementScriptFinished(moveScrId);
    FreezeObjectEvent(npc);
  } else {
    if (!ObjectEventSetHeldMovement(npc, nextActionId)) {
      _sMovementScriptPositions[moveScrId] = pos + 1;
    }
  }
}

/** 1:1 décomp `ScriptMovement_MoveObjects(taskId)` (script_movement.c:195) :
 *    for (i = 0; i < OBJECT_EVENTS_COUNT; i++) {
 *      LoadObjectEventIdFromMovementScript(taskId, i, &objEventId);
 *      if (objEventId != 0xFF)
 *        ScriptMovement_TakeStep(taskId, i, objEventId, GetMovementScript(i));
 *    }
 *
 *  À appeler chaque frame depuis le main loop (= co-located avec
 *  TickObjectEventMovements). */
export function ScriptMovement_MoveObjects(): void {
  if (!_scriptMovementTaskActive) return;
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const objEventId = _scriptMovementTaskData[1 + i] & 0xFF;
    if (objEventId !== 0xFF) {
      _ScriptMovement_TakeStep(i, objEventId);
    }
  }
}

/** 1:1 décomp `ScriptMovement_StartObjectMovementScript(localId, mapNum, mapGroup, script)`
 *  (script_movement.c:21) — signature 1:1 restaurée (fix drift : l'ancienne
 *  version prenait un objEventId déjà résolu ; la décomp résout via
 *  TryGetObjectEventIdByLocalIdAndMap, ce qui couvre les localIds spéciaux
 *  LOCALID_PLAYER/CAMERA). Returns TRUE si refused/failed, FALSE si accepté. */
export function ScriptMovement_StartObjectMovementScript(
  localId: number, mapNum: number, mapGroup: number, movementScript: Uint8Array,
): boolean {
  const r = TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (r.notFound) return true;
  if (!_scriptMovementTaskActive) {
    _ScriptMovement_StartMoveObjects();
  }
  return _ScriptMovement_TryAddNewMovement(r.objectEventId, movementScript);
}

/** 1:1 décomp `ScriptMovement_IsObjectMovementFinished(localId, mapNum, mapGroup)`
 *  (script_movement.c:32) — signature 1:1 restaurée (fix drift objEventId). */
export function ScriptMovement_IsObjectMovementFinished(localId: number, mapNum: number, mapGroup: number): boolean {
  const r = TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (r.notFound) return true;
  if (!_scriptMovementTaskActive) return true;
  const moveScrId = _GetMovementScriptIdFromObjectEventId(r.objectEventId);
  if (moveScrId === OBJECT_EVENTS_COUNT) return true;
  return _IsMovementScriptFinishedBitmask(moveScrId);
}

/** 1:1 décomp `ScriptMovement_UnfreezeObjectEvents` (script_movement.c:47) :
 *    Unfreeze tous les NPCs actifs + DestroyTask. */
export function ScriptMovement_UnfreezeObjectEvents(): void {
  if (!_scriptMovementTaskActive) return;
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const objEventId = _scriptMovementTaskData[1 + i] & 0xFF;
    if (objEventId !== 0xFF) {
      const npc = gObjectEvents[objEventId];
      if (npc && npc.active) UnfreezeObjectEvent(npc);
    }
  }
  _scriptMovementTaskActive = false;
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    _sMovementScripts[i] = null;
    _sMovementScriptPositions[i] = 0;
  }
  _scriptMovementTaskData[0] = 0;
  for (let i = 1; i < 17; i++) _scriptMovementTaskData[i] = 0xFFFF;
}

/** Reset complet du ScriptMovement task — call au map switch / scene reset. */
export function ScriptMovement_Reset(): void {
  ScriptMovement_UnfreezeObjectEvents();
}

/** Debug : expose task data. */
(globalThis as Record<string, unknown>).__scriptMovementTaskData = _scriptMovementTaskData;
(globalThis as Record<string, unknown>).__scriptMovementScripts = _sMovementScripts;
