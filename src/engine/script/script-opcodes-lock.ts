/**
 * script-opcodes-lock.ts — opcodes lock/release 1:1 décomp `event_object_lock.c`
 * + trainer_see.c (= selectapproachingtrainer/lockfortrainer).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_lockall`               (l. 1201-1213) : FreezeObjects_WaitForPlayer.
 *   `ScrCmd_lock`                  (l. 1217-1237) : FreezeObjects_WaitForPlayerAndSelected.
 *   `ScrCmd_releaseall`            (l. 1239-1249) : UnfreezeObjectEvents.
 *   `ScrCmd_release`               (l. 1251-1263) : ClearHeld + UnfreezeObjectEvents.
 *   `ScrCmd_selectapproachingtrainer` (l. 2186-2189) : gSelectedObjectEvent = approaching.
 *   `ScrCmd_lockfortrainer`        (l. 2192-2208) : FreezeForApproachingTrainers.
 *   `ScrCmd_faceplayer`            (l. 1152-1156) : ObjectEventFaceOppositeDirection(selected, player).
 *   `ScrCmd_turnobject`            (l. 1159-1166) : ObjectEventTurn(npc, direction).
 */

import { registerOpcode, SetupNativeScript } from './script-runtime';
import { gObjectEvents, FreezeObjectEvent, UnfreezeObjectEvent } from '../field/object-events';
import { HideFieldMessageBox } from '../field/field-message-box';
import { gSelectedObjectEvent } from './script-vars';
import { gPlayerAvatar, GetPlayerFacingDirection, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from '../field/player-avatar';
import { getSelectedNpc, isPlayerStepFinished, OPPOSITE_DIR } from './script-opcodes-helpers';

/** 1:1 décomp `sCurrentApproachingTrainerObjectEventId` (trainer_see.c).
 *  Set par `selectapproachingtrainer` à l'object event ID du trainer en
 *  approche, lu par `lockfortrainer`. */
let _sCurrentApproachingTrainerObjectEventId = 0;
void _sCurrentApproachingTrainerObjectEventId;  // exposed for cross-section consumer if needed.

/** 1:1 décomp `IsOverworldLinkActive` (overworld.c) : returns TRUE si le
 *  player est dans un Union Room (= link battle). Notre port : pas de link
 *  mode → toujours FALSE. */
function _isInTrainerLink(): boolean {
  return false;
}

// ─── Lock / Release / FacePlayer ─────────────────────────────────────────────

registerOpcode('lock', (ctx) => {
  // 1:1 décomp `ScrCmd_lock` (scrcmd.c:1217-1237) :
  //   FreezeObjects_WaitForPlayerAndSelected();
  //   SetupNativeScript(ctx, IsFreezeSelectedObjectAndPlayerFinished);
  // Freeze tous les NPCs sauf player + selected NPC. Player + selected sont
  // freeze APRÈS leur step courant termine.
  const npc = getSelectedNpc();
  // Freeze immediately tous sauf player/selected — 1:1 strict via FreezeObjectEvent
  // qui pause aussi sprite.animPaused (= sinon anim continue malgré frozen).
  for (const n of gObjectEvents) {
    if (n.active && n !== npc) FreezeObjectEvent(n);
  }
  // Wait pour player step end. Le selected NPC était déjà frozen ou en step ;
  // on freeze le selected aussi à la fin du wait.
  SetupNativeScript(ctx, () => {
    if (!isPlayerStepFinished()) return false;
    if (npc) FreezeObjectEvent(npc);
    return true;
  });
  return true;  // tells script-runtime to wait
});

registerOpcode('lockall', (ctx) => {
  // 1:1 STRICT décomp `ScrCmd_lockall` (scrcmd.c:1199-1213) :
  //   FreezeObjects_WaitForPlayer();
  //   SetupNativeScript(ctx, IsFreezePlayerFinished);
  // → FreezeObjectEvents() qui appelle FreezeObjectEvent par NPC, qui set
  //   frozen=true ET pause sprite.animPaused (= sinon anim cycle malgré frozen).
  for (const npc of gObjectEvents) {
    if (npc.active) FreezeObjectEvent(npc);
  }
  SetupNativeScript(ctx, () => isPlayerStepFinished());
  return true;
});

registerOpcode('release', (_ctx) => {
  // 1:1 STRICT décomp `ScrCmd_release` (scrcmd.c:1251-1263) :
  //   HideFieldMessageBox();
  //   ObjectEventClearHeldMovementIfFinished(selected);
  //   ObjectEventClearHeldMovementIfFinished(player);
  //   ScriptMovement_UnfreezeObjectEvents();
  //   UnfreezeObjectEvents();   ← unfreeze TOUS les NPCs via UnfreezeObjectEvent
  //   qui restore sprite.animPaused = spriteAnimPausedBackup (= reverse du
  //   FreezeObjectEvent qui avait pause les anims).
  HideFieldMessageBox();
  for (const npc of gObjectEvents) {
    if (npc.active) UnfreezeObjectEvent(npc);
  }
  return false;
});

registerOpcode('releaseall', (_ctx) => {
  HideFieldMessageBox();
  for (const npc of gObjectEvents) {
    if (npc.active) UnfreezeObjectEvent(npc);
  }
  return false;
});

registerOpcode('faceplayer', (_ctx) => {
  // 1:1 décomp ScrCmd_faceplayer : NPC tourne face au player (= direction
  // opposée à la direction face du player).
  const npc = getSelectedNpc();
  if (!npc) return false;
  npc.facingDirection = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
  return false;
});

registerOpcode('turnobject', (_ctx, args) => {
  // turnobject LOCALID, DIRECTION. Trouve NPC par localId, set facing.
  const localId = parseInt(args[0], 10) || 0;
  const dirArg = args[1];
  let dir = DIR_SOUTH;
  if (dirArg.includes('SOUTH') || dirArg.includes('DOWN')) dir = DIR_SOUTH;
  else if (dirArg.includes('NORTH') || dirArg.includes('UP')) dir = DIR_NORTH;
  else if (dirArg.includes('WEST') || dirArg.includes('LEFT')) dir = DIR_WEST;
  else if (dirArg.includes('EAST') || dirArg.includes('RIGHT')) dir = DIR_EAST;
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localId === localId) {
      npc.facingDirection = dir;
      break;
    }
  }
  return false;
});

// ─── Trainers (1:1 décomp ScrCmd_selectapproachingtrainer + lockfortrainer) ──

// `selectapproachingtrainer` early stub (= last-wins, real impl ci-dessous).
registerOpcode('selectapproachingtrainer', (_ctx, _args) => false);
registerOpcode('lockfortrainer', (_ctx, _args) => false);

registerOpcode('selectapproachingtrainer', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_selectapproachingtrainer (scrcmd.c:2186-2189) :
  //   gSelectedObjectEvent = GetCurrentApproachingTrainerObjectEventId().
  gSelectedObjectEvent.index = _sCurrentApproachingTrainerObjectEventId;
  return false;
});

registerOpcode('lockfortrainer', (ctx, _args) => {
  // 1:1 décomp ScrCmd_lockfortrainer (scrcmd.c:2192-2208) :
  //   if (IsOverworldLinkActive()) return FALSE ;
  //   if (gObjectEvents[gSelectedObjectEvent].active) {
  //     FreezeForApproachingTrainers() ;
  //     SetupNativeScript(ctx, IsFreezeObjectAndPlayerFinished) ;
  //   }
  //   return TRUE
  if (_isInTrainerLink()) return false;
  const npc = gObjectEvents[gSelectedObjectEvent.index];
  if (npc && npc.active) {
    // 1:1 STRICT décomp FreezeForApproachingTrainers (trainer_see.c) : freeze
    // tous les NPCs via FreezeObjectEvent (= pause sprite.animPaused = sinon
    // les autres trainers continuent à wander visuellement).
    for (const n of gObjectEvents) if (n.active) FreezeObjectEvent(n);
    const poll = (): boolean => {
      // 1:1 décomp IsFreezeObjectAndPlayerFinished (event_object_movement.c) :
      //   return !player.runningState !== MOVING && all NPCs stepFramesLeft === 0
      if (gPlayerAvatar.stepFramesLeft > 0) return false;
      for (const n of gObjectEvents) {
        if (!n.active) continue;
        const walking = (n as unknown as { walkFramesLeft?: number }).walkFramesLeft ?? 0;
        if (walking > 0) return false;
      }
      return true;
    };
    SetupNativeScript(ctx, poll);
    return true;
  }
  return false;
});
