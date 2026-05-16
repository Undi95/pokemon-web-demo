// AUTO-GENERATED from extract-battle-string-id-tables.mjs
// Source 1:1 décomp : src/battle_message.c gXxxStringIds[] arrays.
// Generated: 2026-05-16
//
// Ces tables sont indexées par MULTISTRING_CHOOSER (= cMULTISTRING_CHOOSER
// dans le bytecode) pour résoudre stringId via printfromtable opcode.

/** Mapping symbol name → Uint16Array de stringIds. */
export const BATTLE_STRING_ID_TABLES: Record<string, Uint16Array> = {
  gAbsorbDrainStringIds: new Uint16Array([45, 313]),
  gAttractUsedStringIds: new Uint16Array([69, 310]),
  gBerryEffectStringIds: new Uint16Array([297, 342]),
  gBRNPreventionStringIds: new Uint16Array([305, 355, 362]),
  gCaughtMonStringIds: new Uint16Array([375, 376, 377, 378]),
  gFellAsleepStringIds: new Uint16Array([35, 36]),
  gFirstTurnOfTwoStringIds: new Uint16Array([84, 85, 86, 87, 88, 89, 317, 318]),
  gFlashFireStringIds: new Uint16Array([203, 311]),
  gFocusEnergyUsedStringIds: new Uint16Array([99, 229]),
  gFutureMoveUsedStringIds: new Uint16Array([161, 335]),
  gGotBurnedStringIds: new Uint16Array([46, 47]),
  gGotDefrostedStringIds: new Uint16Array([53, 54]),
  gGotFrozenStringIds: new Uint16Array([49, 50]),
  gGotParalyzedStringIds: new Uint16Array([55, 56]),
  gGotPoisonedStringIds: new Uint16Array([40, 41]),
  gInobedientStringIds: new Uint16Array([278, 279, 280, 281, 365]),
  gItemSwapStringIds: new Uint16Array([358, 359, 360]),
  gKOFailedStringIds: new Uint16Array([23, 124]),
  gLeechSeedStringIds: new Uint16Array([104, 105, 27, 106, 313]),
  gMissStringIds: new Uint16Array([23, 24, 345, 26, 332]),
  gMistUsedStringIds: new Uint16Array([97, 229]),
  gMoveWeatherChangeStringIds: new Uint16Array([232, 233, 229, 237, 240, 243]),
  gNoEscapeStringIds: new Uint16Array([226, 227, 33, 274, 357]),
  gPartyStatusHealStringIds: new Uint16Array([253, 253, 253, 253, 322]),
  gPRLZPreventionStringIds: new Uint16Array([199, 355, 362]),
  gProtectLikeUsedStringIds: new Uint16Array([101, 152, 229]),
  gPSNPreventionStringIds: new Uint16Array([201, 355, 362]),
  gRainContinuesStringIds: new Uint16Array([234, 235, 236]),
  gReflectLightScreenSafeguardStringIds: new Uint16Array([229, 78, 352, 77, 353, 79]),
  gRestUsedStringIds: new Uint16Array([82, 83]),
  gSafariGetNearStringIds: new Uint16Array([283, 284]),
  gSafariPokeblockResultStringIds: new Uint16Array([286, 287, 288]),
  gSandStormHailContinuesStringIds: new Uint16Array([238, 244]),
  gSandStormHailDmgStringIds: new Uint16Array([102, 103]),
  gSandStormHailEndStringIds: new Uint16Array([239, 245]),
  gSportsUsedStringIds: new Uint16Array([315, 316]),
  gStatDownStringIds: new Uint16Array([215, 216, 62, 304]),
  gStatUpStringIds: new Uint16Array([213, 214, 61, 304, 325, 326]),
  gStockpileUsedStringIds: new Uint16Array([115, 116]),
  gSubstituteUsedStringIds: new Uint16Array([126, 251]),
  gSwallowFailStringIds: new Uint16Array([247, 76]),
  gTransformUsedStringIds: new Uint16Array([125, 229]),
  gUproarAwakeStringIds: new Uint16Array([117, 118, 119]),
  gUproarOverTurnStringIds: new Uint16Array([112, 113]),
  gWokeUpStringIds: new Uint16Array([108, 110]),
  gWrappedStringIds: new Uint16Array([90]),
};

/** Lookup : symbol name → resolved stringId at index, ou null si invalid. */
export function getBattleStringId(tableName: string, index: number): number | null {
  const t = BATTLE_STRING_ID_TABLES[tableName];
  if (!t || index < 0 || index >= t.length) return null;
  return t[index];
}
