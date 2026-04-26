// AUTO-GENERATED from data/scripts/shared_secret_base-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=134, bytes=744, labels=31, unknownOps=2, unresolvedSymbols=38

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SecretBase_MapScripts": 0,
  "SecretBase_OnWarp": 20,
  "SecretBase_OnTransition": 28,
  "SecretBase_OnFrame": 42,
  "SecretBase_OnResume": 50,
  "SecretBase_EventScript_PC": 53,
  "SecretBase_EventScript_PCShowMainMenu": 79,
  "SecretBase_EventScript_PCCancel": 102,
  "SecretBase_EventScript_PCMainMenuWithRegister": 109,
  "SecretBase_EventScript_PCMainMenuWithoutRegister": 220,
  "SecretBase_EventScript_PCPackUp": 311,
  "SecretBase_EventScript_PCDecorationMenu": 336,
  "SecretBase_EventScript_PCRegistryMenu": 341,
  "SecretBase_EventScript_RecordMixingPC": 346,
  "SecretBase_EventScript_PCRegisterMenu": 372,
  "SecretBase_EventScript_ShowRegisterMenu": 491,
  "SecretBase_EventScript_PCRegister": 498,
  "SecretBase_EventScript_AlreadyRegistered": 562,
  "SecretBase_EventScript_CantRegisterTooManyBases": 598,
  "SecretBase_EventScript_PCRegistryInfo": 613,
  "SecretBase_EventScript_PCTurnOff": 627,
  "SecretBase_EventScript_Poster": 634,
  "SecretBase_EventScript_FurnitureBottom": 639,
  "SecretBase_EventScript_FurnitureMiddle": 644,
  "SecretBase_EventScript_FurnitureTop": 649,
  "SecretBase_EventScript_SandOrnament": 654,
  "SecretBase_EventScript_ShieldOrToyTV": 663,
  "SecretBase_EventScript_BattleTowerShield": 708,
  "SecretBase_EventScript_ToyTV": 717,
  "SecretBase_EventScript_SeedotTV": 726,
  "SecretBase_EventScript_SkittyTV": 735,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [4,20,0,0,0,3,28,0,0,0,2,42,0,0,0,5,50,0,0,0,137,64,0,0,0,0,0,0,88,0,0,0,0,38,0,0,0,38,0,0,0,90,151,64,0,0,0,0,0,0,167,6,90,106,9,2,0,104,0,0,0,0,157,61,0,0,0,0,0,110,9,5,0,89,79,0,0,0,90,104,0,0,0,0,0,0,0,44,12,1,7,1,109,0,0,0,89,220,0,0,0,90,106,89,79,0,0,0,90,112,0,0,6,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,80,1,0,0,34,80,1,0,0,35,0,128,1,0,34,0,128,1,0,35,55,1,0,0,34,55,1,0,0,35,0,128,2,0,34,0,128,2,0,35,85,1,0,0,34,85,1,0,0,35,0,128,3,0,34,0,128,3,0,35,115,2,0,0,34,115,2,0,0,35,0,128,127,0,34,0,128,127,0,35,115,2,0,0,34,115,2,0,0,90,112,0,0,5,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,80,1,0,0,34,80,1,0,0,35,0,128,1,0,34,0,128,1,0,35,55,1,0,0,34,55,1,0,0,35,0,128,2,0,34,0,128,2,0,35,115,2,0,0,34,115,2,0,0,35,0,128,127,0,34,0,128,127,0,35,115,2,0,0,34,115,2,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,105,38,0,0,0,108,90,38,0,0,0,90,38,0,0,0,90,106,104,0,0,0,0,9,2,0,157,61,0,0,0,0,0,110,9,5,0,89,116,1,0,0,90,104,0,0,0,0,0,0,0,112,0,0,7,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,242,1,0,0,34,242,1,0,0,35,0,128,1,0,34,0,128,1,0,35,85,1,0,0,34,85,1,0,0,35,0,128,2,0,34,0,128,2,0,35,101,2,0,0,34,101,2,0,0,35,0,128,3,0,34,0,128,3,0,35,115,2,0,0,34,115,2,0,0,35,0,128,127,0,34,0,128,127,0,35,115,2,0,0,34,115,2,0,0,90,106,89,116,1,0,0,90,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,108,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,108,90,16,0,0,0,0,0,10,0,38,0,0,0,105,108,90,16,0,0,0,0,0,10,0,89,116,1,0,0,90,38,0,0,0,105,108,90,38,0,0,0,90,38,0,0,0,90,38,0,0,0,90,38,0,0,0,90,38,0,0,0,157,52,0,0,90,38,0,0,0,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 134, bytes: 744, labels: 31, unknownOps: 2, unresolvedSymbols: 38 } as const;
