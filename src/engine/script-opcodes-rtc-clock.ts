/**
 * script-opcodes-rtc-clock.ts — opcodes RTC / horloge 1:1 décomp `rtc.c` + `clock.c`.
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:674-704`   (delay/initclock/gettime/dotimebasedevents)
 *   `D:/Projet 1/decomps/pokeemeraude/src/rtc.c`              (RtcCalcLocalTime, RtcInitLocalTimeOffset, gLocalTime)
 *
 * Opcodes portés :
 *   `delay`              : SetupNativeScript décrémente compteur frames.
 *   `pause`              : alternate name for delay (= same arg).
 *   `initclock`          : RtcInitLocalTimeOffset(hour, minute) — set l'heure in-game.
 *   `gettime`            : VAR_0x8000/8001/8002 = hours/minutes/seconds.
 *   `dotimebasedevents`  : DoTimeBasedEvents — berry growth + tide cycle + etc.
 */

import { registerOpcode, SetupNativeScript } from './script-runtime';
import { VarGet, VarSet } from './script-vars';
import { RtcCalcLocalTime, gLocalTime, RtcInitLocalTimeOffset } from './rtc';
import { parseValue } from './script-opcodes-helpers';

// 1:1 décomp `ScrCmd_delay` (scrcmd.c:674-679) :
//   SetupNativeScript(ctx, IsPauseTimerFinished); return TRUE;
// IsPauseTimerFinished : décrémente sPauseCounter, return !sPauseCounter.
registerOpcode('delay', (ctx, args) => {
  let frames = parseValue(args[0]);
  const tick = (): boolean => {
    if (frames <= 0) return true;
    frames--;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// 1:1 décomp `ScrCmd_pause` — alternate name for delay (= same arg semantic).
registerOpcode('pause', (ctx, args) => {
  let frames = parseValue(args[0]);
  const tick = (): boolean => {
    if (frames <= 0) return true;
    frames--;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_gettime` (scrcmd.c:696-703) :
 *  ```c
 *  bool8 ScrCmd_gettime(struct ScriptContext *ctx) {
 *      RtcCalcLocalTime();
 *      gSpecialVar_0x8000 = gLocalTime.hours;
 *      gSpecialVar_0x8001 = gLocalTime.minutes;
 *      gSpecialVar_0x8002 = gLocalTime.seconds;
 *      return FALSE;
 *  }
 *  ```
 *  Notre `RtcCalcLocalTime` source-of-truth = `Date.now() + offsetMs` (cf. rtc.ts). */
registerOpcode('gettime', () => {
  RtcCalcLocalTime();
  VarSet('VAR_0x8000', gLocalTime.hours);
  VarSet('VAR_0x8001', gLocalTime.minutes);
  VarSet('VAR_0x8002', gLocalTime.seconds);
  return false;
});

/** 1:1 décomp `ScrCmd_initclock` (scrcmd.c:681-688) :
 *    RtcInitLocalTimeOffset(VarGet(hour), VarGet(minute));
 *  Set l'heure in-game initiale (= new-game / wall-clock confirm). */
registerOpcode('initclock', (_ctx, args) => {
  const hour = VarGet(args[0] ?? '0');
  const minute = VarGet(args[1] ?? '0');
  RtcInitLocalTimeOffset(hour, minute);
  return false;
});

/** 1:1 décomp `ScrCmd_dotimebasedevents` (scrcmd.c:690-694) :
 *    DoTimeBasedEvents();
 *  Trigger berry growth + tide cycle + Shoal Cave water level + etc.
 *  Session 132 : real impl via time-based-events.ts (= berry growth math
 *  1:1 décomp berry.c:BerryTreeTimeUpdate using RTC minutes delta). */
registerOpcode('dotimebasedevents', (_ctx, _args) => {
  void (async () => {
    try {
      const { DoTimeBasedEvents } = await import('./time-based-events');
      DoTimeBasedEvents();
    } catch (e) {
      console.warn('[opcode dotimebasedevents] failed:', e);
    }
  })();
  return false;
});
