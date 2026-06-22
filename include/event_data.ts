/**
 * include/event_data.ts — miroir 1:1 de `decomp/include/event_data.h`.
 */
export {
  FlagSet, FlagClear, FlagGet,
  VarGet, VarSet, VarGetObjectEventGraphicsId,
  InitEventData,
  gSpecialVars,
  VARS_START, SPECIAL_VARS_START, SPECIAL_FLAGS_START,
  // Helpers cross-module flags/vars (event_data.c:39-162).
  ClearTempFieldEventData, ClearDailyFlags,
  DisableMysteryEvent, EnableMysteryEvent, IsMysteryEventEnabled,
  DisableMysteryGift, EnableMysteryGift, IsMysteryGiftEnabled,
  ClearMysteryGiftFlags, ClearMysteryGiftVars,
  DisableResetRTC, EnableResetRTC, CanResetRTC,
} from '../src/event_data';
