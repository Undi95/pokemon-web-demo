/**
 * play_time.ts — 1:1 décomp `src/play_time.c`.
 *
 * Le décomp tracke le temps de jeu via 4 fields dans gSaveBlock2 :
 *   - playTimeHours / playTimeMinutes / playTimeSeconds / playTimeVBlanks
 *
 * Le compteur est tick'é à chaque VBlank par `PlayTimeCounter_Update` (=
 * appelé par AgbMain loop dans main.c). Quand vBlanks atteint 60 (= 1 sec
 * @ 60Hz), incremente seconds. Quand seconds atteint 60, incremente minutes.
 * Etc. Cap à playTimeHours = 999 (= max display).
 *
 * Audit session 126 (post-test user) BUG : avant ce module, notre runtime
 * n'appelait JAMAIS PlayTimeCounter_Update → DUREE JEU restait à "0:00"
 * indéfiniment. Le décomp a une auto-file `play_time-all-auto.ts` mais
 * @ts-nocheck + dépend de `STOPPED/RUNNING` constants non-portées → port
 * manuel ici.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/play_time.c`.
 */

import { GetSaveBlock2 } from './save';

const STOPPED = 0;
const RUNNING = 1;
const MAXED_OUT = 2;

let _state = STOPPED;

/** 1:1 décomp `PlayTimeCounter_Reset` (play_time.c:11) :
 *    sPlayTimeCounterState = STOPPED;
 *    block2.playTimeHours = 0; minutes = 0; seconds = 0; vBlanks = 0;
 *  Appelé par NewGameInitData + au new game. */
export function PlayTimeCounter_Reset(): void {
  _state = STOPPED;
  const b2 = GetSaveBlock2() as {
    playTimeHours?: number; playTimeMinutes?: number;
    playTimeSeconds?: number; playTimeVBlanks?: number;
  };
  b2.playTimeHours = 0;
  b2.playTimeMinutes = 0;
  b2.playTimeSeconds = 0;
  b2.playTimeVBlanks = 0;
}

/** 1:1 décomp `PlayTimeCounter_Start` (play_time.c:21) :
 *    sPlayTimeCounterState = RUNNING;
 *    if (block2.playTimeHours > 999) PlayTimeCounter_SetToMax();
 *  Appelé au boot overworld (= CB2_Overworld) + post-warp. */
export function PlayTimeCounter_Start(): void {
  _state = RUNNING;
  const b2 = GetSaveBlock2() as { playTimeHours?: number };
  if ((b2.playTimeHours ?? 0) > 999) {
    PlayTimeCounter_SetToMax();
  }
}

/** 1:1 décomp `PlayTimeCounter_Stop` (play_time.c:30) :
 *    sPlayTimeCounterState = STOPPED;
 *  Appelé pendant les CB2 non-overworld (= title screen, save menu, battle). */
export function PlayTimeCounter_Stop(): void {
  if (_state !== MAXED_OUT) _state = STOPPED;
}

/** 1:1 décomp `PlayTimeCounter_SetToMax` (play_time.c:65) :
 *    sPlayTimeCounterState = MAXED_OUT;
 *    block2.playTimeHours = 999; minutes = 59; seconds = 59; vBlanks = 59;
 *  Appelé quand on dépasse 999h. Frozen. */
export function PlayTimeCounter_SetToMax(): void {
  _state = MAXED_OUT;
  const b2 = GetSaveBlock2() as {
    playTimeHours?: number; playTimeMinutes?: number;
    playTimeSeconds?: number; playTimeVBlanks?: number;
  };
  b2.playTimeHours = 999;
  b2.playTimeMinutes = 59;
  b2.playTimeSeconds = 59;
  b2.playTimeVBlanks = 59;
}

/** 1:1 décomp `PlayTimeCounter_Update` (play_time.c:34) :
 *    if (state != RUNNING) return;
 *    block2.playTimeVBlanks++;
 *    if (vBlanks >= 60) { vBlanks = 0; seconds++; }
 *    if (seconds >= 60) { seconds = 0; minutes++; }
 *    if (minutes >= 60) { minutes = 0; hours++; }
 *    if (hours > 999) PlayTimeCounter_SetToMax();
 *
 *  Appelé chaque VBlank (= 60Hz) par AgbMain loop (= main.c:181). Notre
 *  équivalent : appelé par `decomp-runtime.ts:tickFixed` chaque frame logique. */
export function PlayTimeCounter_Update(): void {
  if (_state !== RUNNING) return;
  const b2 = GetSaveBlock2() as {
    playTimeHours: number; playTimeMinutes: number;
    playTimeSeconds: number; playTimeVBlanks: number;
  };
  b2.playTimeVBlanks++;
  if (b2.playTimeVBlanks >= 60) {
    b2.playTimeVBlanks = 0;
    b2.playTimeSeconds++;
    if (b2.playTimeSeconds >= 60) {
      b2.playTimeSeconds = 0;
      b2.playTimeMinutes++;
      if (b2.playTimeMinutes >= 60) {
        b2.playTimeMinutes = 0;
        b2.playTimeHours++;
        if (b2.playTimeHours > 999) PlayTimeCounter_SetToMax();
      }
    }
  }
}

/** Dev/debug : get current state. */
export function getPlayTimeCounterState(): number {
  return _state;
}
