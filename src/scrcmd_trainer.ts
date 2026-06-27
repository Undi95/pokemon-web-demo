/**
 * scrcmd_trainer.ts — logique partagée (voie A) des opcodes trainer-approach
 * `selectapproachingtrainer` / `lockfortrainer` (scrcmd.c:2186-2208).
 *
 * Source UNIQUE appelée par le moteur parsé (`scrcmd.ts`) ET le byte-VM
 * (`scrcmd_bytevm.ts`) → zéro divergence au swap (Phase 5).
 *
 * Adaptation ASSUMÉE (pré-existante, partagée par les 2 moteurs) : la détection
 * trainer line-of-sight (qui peuple `gApproachingTrainers[].objectEventId` dans
 * trainer_see.c) n'est pas câblée dans le port web → l'id reste 0. `FreezeFor
 * ApproachingTrainers` (event_object_lock.c) est porté en version SIMPLIFIÉE
 * (freeze de tous les NPCs actifs + poll fin de mouvement) au lieu de la
 * machinerie `Task_FreezeObjectAndPlayer` — comportement identique pour un id
 * stub. Voir [[next-chantier-pokecenter-heal]] famille trainer-see.
 */

import { gObjectEvents, FreezeObjectEvent } from './event_object_movement';
import { gPlayerAvatar } from './field_player_avatar';

/** 1:1 décomp `gApproachingTrainers[gApproachingTrainerId].objectEventId`
 *  (trainer_see.c:776, GetCurrentApproachingTrainerObjectEventId). Stub = 0 tant
 *  que la détection LOS n'est pas câblée. */
let _sCurrentApproachingTrainerObjectEventId = 0;
export function GetCurrentApproachingTrainerObjectEventId(): number {
  return _sCurrentApproachingTrainerObjectEventId;
}
/** Pour quand le trainer LOS sera câblé (TrainerSee). */
export function SetCurrentApproachingTrainerObjectEventId(id: number): void {
  _sCurrentApproachingTrainerObjectEventId = id;
}

/** 1:1 décomp `IsOverworldLinkActive` (overworld.c) : TRUE si Union Room (link
 *  battle). Port web : pas de mode link → toujours FALSE. */
export function IsOverworldLinkActive(): boolean {
  return false;
}

/** Logique partagée de `ScrCmd_lockfortrainer` (scrcmd.c:2192-2208), version
 *  simplifiée = moteur parsé : freeze tous les NPCs actifs (FreezeForApproaching
 *  Trainers) puis renvoie le poll `IsFreezeObjectAndPlayerFinished`.
 *  Retour : `null` → pas de native script (link actif OU NPC inactif → handler
 *  renvoie false) ; sinon le poll (handler fait SetupNativeScript + renvoie true). */
export function doLockForTrainer(selectedIndex: number): (() => boolean) | null {
  if (IsOverworldLinkActive()) return null;
  const npc = gObjectEvents[selectedIndex];
  if (!npc || !npc.active) return null;
  // 1:1 STRICT FreezeForApproachingTrainers (simplifié) : freeze tous les NPCs
  // (= pause sprite.animPaused, sinon les autres trainers wander visuellement).
  for (const n of gObjectEvents) if (n.active) FreezeObjectEvent(n);
  // 1:1 IsFreezeObjectAndPlayerFinished : player pas en step + tous NPCs steps finis.
  return (): boolean => {
    if (gPlayerAvatar.stepFramesLeft > 0) return false;
    for (const n of gObjectEvents) {
      if (!n.active) continue;
      const walking = (n as unknown as { walkFramesLeft?: number }).walkFramesLeft ?? 0;
      if (walking > 0) return false;
    }
    return true;
  };
}
