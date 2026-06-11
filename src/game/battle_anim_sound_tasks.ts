/**
 * battle_anim_sound_tasks.ts — miroir PARTIEL de `src/battle_anim_sound_tasks.c`
 * (décomp pokeemeraude), goal T4 2026-06-11 : les SoundTasks de GROWL.
 *
 * Porté (net-effect — infra CRIS sensible, pattern __playCry validé) :
 *   - SoundTask_PlayDoubleCry : cri du battler (args[0]=ANIM_ATTACKER/TARGET,
 *     args[1]=DOUBLE_CRY_GROWL) x2 (le 2e a ~+20 frames) puis destroy.
 *   - SoundTask_WaitForCry : ~30 frames (net : IsCryFinished) puis destroy.
 */
import { registerAnimTasks } from '../engine/battle/battle-anim-registry';
import { isStatusAnimActive } from '../engine/battle/battle-sprites-data';

type AnimTask = { taskId: number; data: number[]; func?: (t: AnimTask) => void };

function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _playCryOf(battler: number): void {
  const bs = (globalThis as Record<string, unknown>).__battleState as { gBattleMons?: Array<{ species?: number }> } | undefined;
  const species = bs?.gBattleMons?.[battler]?.species;
  const playCry = (globalThis as Record<string, unknown>).__playCry as ((sp: number, pan?: number) => void) | undefined;
  if (species && playCry) playCry(species);
}

function SoundTask_PlayDoubleCry(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [0, 0];
  const battler = args[0] === 1 ? (_itf().getTarget?.() ?? 1) : (_itf().getAttacker?.() ?? 0);
  task.data[0] = battler;
  task.data[7] = 0;
  _playCryOf(battler);
  task.func = _DoubleCry_Step;
}
function _DoubleCry_Step(task: AnimTask): void {
  task.data[7]++;
  if (task.data[7] === 20) _playCryOf(task.data[0]);
  if (task.data[7] >= 24) _itf().DestroyAnimVisualTask?.(task.taskId);
}

function SoundTask_WaitForCry(task: AnimTask): void {
  task.data[7] = (task.data[7] ?? 0) + 1;
  if (task.data[7] >= 30) _itf().DestroyAnimVisualTask?.(task.taskId);
}

/** 1:1 net `SoundTask_PlayCryHighPitch` : cri du battler (pitch haut = dette
 *  douce infra cris) puis destroy immédiat (one-shot). */
function SoundTask_PlayCryHighPitch(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [0];
  const battler = args[0] === 1 ? (_itf().getTarget?.() ?? 1) : (_itf().getAttacker?.() ?? 0);
  _playCryOf(battler);
  _itf().DestroyAnimVisualTask?.(task.taskId);
}

/** 1:1 `SoundTask_PlaySE1WithPanning` / `_PlaySE2WithPanning` (sound_tasks.c) :
 *  SE one-shot avec panning (panning = dette douce infra SE mono) — 47 usages. */
function SoundTask_PlaySE1WithPanning(task: AnimTask): void {
  const args = _itf().getArgs?.() ?? [0, 0];
  const playSE = (globalThis as Record<string, unknown>).__PlaySE as ((id: number) => void) | undefined;
  if (args[0]) playSE?.(args[0] | 0);
  _itf().DestroyAnimVisualTask?.(task.taskId);
}
function SoundTask_PlaySE2WithPanning(task: AnimTask): void {
  SoundTask_PlaySE1WithPanning(task);
}

registerAnimTasks({
  SoundTask_PlayDoubleCry: SoundTask_PlayDoubleCry as never,
  SoundTask_WaitForCry: SoundTask_WaitForCry as never,
  SoundTask_PlayCryHighPitch: SoundTask_PlayCryHighPitch as never,
  SoundTask_PlaySE1WithPanning: SoundTask_PlaySE1WithPanning as never,
  SoundTask_PlaySE2WithPanning: SoundTask_PlaySE2WithPanning as never,
});

// ═════════════════════════════════════════════════════════════════════════════
// MIROIR STRICT (goal 2026-06-11) — corps EXACTS de battle_anim_sound_tasks.c :
// SoundTask_LoopSEAdjustPanning (:78) + SoundTask_AdjustPanningVar (:370).
// Helpers pan 1:1 transcrits localement (battle_anim.c:1263-1346) en privés _
// (pas dans battle_anim_mons, pas exposés par la surface __battleAnimInterpreter).
// ═════════════════════════════════════════════════════════════════════════════

/** 1:1 SOUND_PAN_ATTACKER / SOUND_PAN_TARGET (constants/battle_anim.h:324-325). */
const _SOUND_PAN_ATTACKER = -64;
const _SOUND_PAN_TARGET = 63;

/** Surface interpréteur étendue — `DestroyAnimSoundTask` optionnel (pas encore
 *  exposé par `__battleAnimInterpreter` ; voir note du bloc register en bas). */
function _sndItf(): {
  getArgs?: () => number[];
  getAttacker?: () => number;
  getTarget?: () => number;
  DestroyAnimVisualTask?: (id: number) => void;
  DestroyAnimSoundTask?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}

/** 1:1 `PlaySE12WithPanning(songId, pan)` (sound.c) — pattern repo
 *  (battle_anim_effects_1.ts:739) : __PlaySE mono, pan stéréo non câblé (dette douce). */
function _PlaySE12WithPanning(songId: number, _pan: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(songId);
}

/** 1:1 `BattleAnimAdjustPanning(s8 pan)` (battle_anim.c:1263-1303).
 *  IsContest() = false (pas de concours dans le port → branche contest omise) ;
 *  statusAnimActive = backing 1:1 battle-sprites-data ; GetBattlerSide = (b & 1). */
function _BattleAnimAdjustPanning(pan: number): number {
  const atk = _sndItf().getAttacker?.() ?? 0;
  const tgt = _sndItf().getTarget?.() ?? 1;
  if (isStatusAnimActive(atk)) {
    // C:1265-1271 : !IsContest() && healthBoxesData[gBattleAnimAttacker].statusAnimActive
    if ((atk & 1) !== 0 /* GetBattlerSide(atk) != B_SIDE_PLAYER */) pan = _SOUND_PAN_TARGET;
    else pan = _SOUND_PAN_ATTACKER;
  } else if ((atk & 1) === 0 /* GetBattlerSide(atk) == B_SIDE_PLAYER */) {
    if ((tgt & 1) === 0 /* GetBattlerSide(tgt) == B_SIDE_PLAYER */) {
      if (pan === _SOUND_PAN_TARGET) pan = _SOUND_PAN_ATTACKER;
      else if (pan !== _SOUND_PAN_ATTACKER) pan *= -1;
    }
  } else if ((tgt & 1) === 1 /* GetBattlerSide(tgt) == B_SIDE_OPPONENT */) {
    if (pan === _SOUND_PAN_ATTACKER) pan = _SOUND_PAN_TARGET;
  } else {
    pan *= -1;
  }
  if (pan > _SOUND_PAN_TARGET) pan = _SOUND_PAN_TARGET;
  else if (pan < _SOUND_PAN_ATTACKER) pan = _SOUND_PAN_ATTACKER;
  return pan;
}

/** 1:1 `KeepPanInRange(s16 panArg, int oldPan)` (battle_anim.c:1322-1332) :
 *  clamp [-64, 63] (oldPan inutilisé dans le corps C, signature conservée). */
function _KeepPanInRange(panArg: number, _oldPan: number): number {
  let pan = (panArg << 16) >> 16; // s16
  if (pan > _SOUND_PAN_TARGET) pan = _SOUND_PAN_TARGET;
  else if (pan < _SOUND_PAN_ATTACKER) pan = _SOUND_PAN_ATTACKER;
  return pan;
}

/** 1:1 `CalculatePanIncrement(s16 source, s16 target, s16 increment)`
 *  (battle_anim.c:1334-1346) : |increment| signé vers la cible, 0 si égaux. */
function _CalculatePanIncrement(sourcePan: number, targetPan: number, incrementPan: number): number {
  if (sourcePan < targetPan) return incrementPan < 0 ? -incrementPan : incrementPan;
  if (sourcePan > targetPan) return -(incrementPan < 0 ? -incrementPan : incrementPan);
  return 0;
}

/** 1:1 `SoundTask_LoopSEAdjustPanning` (battle_anim_sound_tasks.c:78) : boucle
 *  le SE args[0] toutes les args[6] frames ×args[4] fois, pan glissant de
 *  args[1] vers args[2] par pas args[3] toutes les args[5] frames. Créée par
 *  `createsoundtask` (fin = DestroyAnimSoundTask). data[12]=r9 → 1er play dès
 *  l'appel immédiat (1:1 C:103 `gTasks[taskId].func(taskId)`). */
function SoundTask_LoopSEAdjustPanning(task: AnimTask): void {
  const args = _sndItf().getArgs?.() ?? [0, -64, 63, 4, 4, 0, 10];
  const songId = args[0] & 0xFFFF;              // u16 songId
  let targetPan = (args[2] << 24) >> 24;        // s8 targetPan
  let panIncrement = (args[3] << 24) >> 24;     // s8 panIncrement
  const r10 = args[4] & 0xFF;                   // u8 r10 — nb de plays
  const r7 = args[5] & 0xFF;                    // u8 r7 — frames entre pas de pan
  const r9 = args[6] & 0xFF;                    // u8 r9 — frames entre plays
  const sourcePan = _BattleAnimAdjustPanning((args[1] << 24) >> 24);

  targetPan = _BattleAnimAdjustPanning(targetPan);
  panIncrement = _CalculatePanIncrement(sourcePan, targetPan, panIncrement);

  task.data[0] = songId;
  task.data[1] = sourcePan;
  task.data[2] = targetPan;
  task.data[3] = panIncrement;
  task.data[4] = r10;
  task.data[5] = r7;
  task.data[6] = r9;
  task.data[10] = 0;
  task.data[11] = sourcePan;
  task.data[12] = r9;

  task.func = _SoundTask_LoopSEAdjustPanning_Step;
  task.func(task); // 1:1 C:103 — appel immédiat
}

/** 1:1 `SoundTask_LoopSEAdjustPanning_Step` (battle_anim_sound_tasks.c:106) :
 *  play périodique (data[12] vs data[6] ; `--data[4]==0` → destroy SOUND task)
 *  + glissement du pan (data[10] vs data[5] ; data[11] += data[3], clampé). */
function _SoundTask_LoopSEAdjustPanning_Step(task: AnimTask): void {
  if (task.data[12]++ === task.data[6]) {
    task.data[12] = 0;
    _PlaySE12WithPanning(task.data[0], task.data[11]);
    if (--task.data[4] === 0) {
      // 1:1 DestroyAnimSoundTask (décrémente gAnimSoundTaskCount). Pas encore
      // exposé sur la surface __battleAnimInterpreter → fallback
      // DestroyAnimVisualTask (même DestroyTask ; décrément visual guardé >0)
      // pour ne JAMAIS laisser la task boucler le SE. À re-router quand
      // Cmd_createsoundtask (0x1F) sera câblé au registry côté interpréteur.
      const itf = _sndItf();
      (itf.DestroyAnimSoundTask ?? itf.DestroyAnimVisualTask)?.(task.taskId);
      return;
    }
  }

  if (task.data[10]++ === task.data[5]) {
    task.data[10] = 0;
    const dPan = task.data[3];    // C: u16 dPan = data[3]
    const oldPan = task.data[11]; // C: u16 oldPan = data[11]
    task.data[11] = ((dPan + oldPan) << 16) >> 16; // store s16 (≡ u16+u16 mod 2^16, 1:1)
    task.data[11] = _KeepPanInRange(task.data[11], oldPan);
  }
}

/** 1:1 `SoundTask_AdjustPanningVar` (battle_anim_sound_tasks.c:370) : fait
 *  glisser `gAnimCustomPanning` de args[0] vers args[1] par pas args[2] toutes
 *  les args[3] frames SANS jouer de son — lu par Confuse Ray / Will-O-Wisp.
 *  Créée par `createvisualtask` (battle_anim_scripts.s:2056/8077/8086). */
function SoundTask_AdjustPanningVar(task: AnimTask): void {
  const args = _sndItf().getArgs?.() ?? [-64, 63, 2, 0];
  let targetPan = (args[1] << 24) >> 24;     // s8 targetPan
  let panIncrement = (args[2] << 24) >> 24;  // s8 panIncrement
  const r9 = args[3] & 0xFFFF;               // u16 r9 — frames entre pas
  const sourcePan = _BattleAnimAdjustPanning((args[0] << 24) >> 24);

  targetPan = _BattleAnimAdjustPanning(targetPan);
  panIncrement = _CalculatePanIncrement(sourcePan, targetPan, panIncrement);

  task.data[1] = sourcePan;
  task.data[2] = targetPan;
  task.data[3] = panIncrement;
  task.data[5] = r9;
  task.data[10] = 0;
  task.data[11] = sourcePan;

  task.func = _SoundTask_AdjustPanningVar_Step;
  task.func(task); // 1:1 C:389 — appel immédiat
}

/** 1:1 `SoundTask_AdjustPanningVar_Step` (battle_anim_sound_tasks.c:391) :
 *  pas de pan périodique puis `gAnimCustomPanning = data[11]` ; destroy
 *  (visual) quand data[11] == targetPan. Canal d'écriture =
 *  `globalThis.__gAnimCustomPanning` : l'export `let gAnimCustomPanning` de
 *  battle-anim-interpreter n'est pas assignable d'ici (binding ESM, fichier
 *  intouchable) — lecteurs futurs (AnimConfuseRayBallBounce_Step1/2,
 *  battle_anim_ghost.ts:144) liront ce canal. */
function _SoundTask_AdjustPanningVar_Step(task: AnimTask): void {
  const panIncrement = task.data[3] & 0xFFFF; // C: u16 panIncrement = data[3]

  if (task.data[10]++ === task.data[5]) {
    task.data[10] = 0;
    const oldPan = task.data[11];
    task.data[11] = ((panIncrement + oldPan) << 16) >> 16; // store s16 (wrap u16, 1:1)
    task.data[11] = _KeepPanInRange(task.data[11], oldPan);
  }

  (globalThis as Record<string, unknown>).__gAnimCustomPanning = task.data[11]; // gAnimCustomPanning = data[11]
  if (task.data[11] === task.data[2]) _sndItf().DestroyAnimVisualTask?.(task.taskId);
}

// Goal 2026-06-11 : tasks pan-sliding 1:1 (corps exacts). NB dispatch :
// SoundTask_AdjustPanningVar passe par `createvisualtask` (0x03) → LIVE dès
// cet enregistrement ; SoundTask_LoopSEAdjustPanning n'est créée par les
// scripts que via `createsoundtask` (0x1F), opcode pas encore câblé au
// registry côté interpréteur → enregistrée DORMANTE, prête pour le câblage.
registerAnimTasks({
  SoundTask_LoopSEAdjustPanning: SoundTask_LoopSEAdjustPanning as never,
  SoundTask_AdjustPanningVar: SoundTask_AdjustPanningVar as never,
});
