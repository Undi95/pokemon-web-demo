// AUTO-GENERATED from data/scripts/shared_secret_base-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=134, bytes=1020, labels=31, unknownOps=0, unresolvedSymbols=38

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
  "SecretBase_EventScript_PCMainMenuWithoutRegister": 280,
  "SecretBase_EventScript_PCPackUp": 419,
  "SecretBase_EventScript_PCDecorationMenu": 456,
  "SecretBase_EventScript_PCRegistryMenu": 461,
  "SecretBase_EventScript_RecordMixingPC": 466,
  "SecretBase_EventScript_PCRegisterMenu": 492,
  "SecretBase_EventScript_ShowRegisterMenu": 671,
  "SecretBase_EventScript_PCRegister": 678,
  "SecretBase_EventScript_AlreadyRegistered": 778,
  "SecretBase_EventScript_CantRegisterTooManyBases": 826,
  "SecretBase_EventScript_PCRegistryInfo": 841,
  "SecretBase_EventScript_PCTurnOff": 855,
  "SecretBase_EventScript_Poster": 862,
  "SecretBase_EventScript_FurnitureBottom": 867,
  "SecretBase_EventScript_FurnitureMiddle": 872,
  "SecretBase_EventScript_FurnitureTop": 877,
  "SecretBase_EventScript_SandOrnament": 882,
  "SecretBase_EventScript_ShieldOrToyTV": 891,
  "SecretBase_EventScript_BattleTowerShield": 984,
  "SecretBase_EventScript_ToyTV": 993,
  "SecretBase_EventScript_SeedotTV": 1002,
  "SecretBase_EventScript_SkittyTV": 1011,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [4,20,0,0,0,3,28,0,0,0,2,42,0,0,0,5,50,0,0,0,137,64,0,0,0,0,0,0,88,0,0,0,0,38,0,0,0,38,0,0,0,90,151,64,0,0,0,0,0,0,167,6,90,106,9,2,0,104,0,0,0,0,157,61,0,0,0,0,0,110,9,5,0,89,79,0,0,0,90,104,0,0,0,0,0,0,0,44,12,1,7,1,109,0,0,0,89,24,1,0,0,90,106,89,79,0,0,0,90,112,0,0,6,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,200,1,0,0,34,200,1,0,0,7,1,0,0,0,0,7,1,200,1,0,0,35,0,128,1,0,34,0,128,1,0,35,163,1,0,0,34,163,1,0,0,7,1,0,0,0,0,7,1,163,1,0,0,35,0,128,2,0,34,0,128,2,0,35,205,1,0,0,34,205,1,0,0,7,1,0,0,0,0,7,1,205,1,0,0,35,0,128,3,0,34,0,128,3,0,35,87,3,0,0,34,87,3,0,0,7,1,0,0,0,0,7,1,87,3,0,0,35,0,128,127,0,34,0,128,127,0,35,87,3,0,0,34,87,3,0,0,7,1,0,0,0,0,7,1,87,3,0,0,90,112,0,0,5,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,200,1,0,0,34,200,1,0,0,7,1,0,0,0,0,7,1,200,1,0,0,35,0,128,1,0,34,0,128,1,0,35,163,1,0,0,34,163,1,0,0,7,1,0,0,0,0,7,1,163,1,0,0,35,0,128,2,0,34,0,128,2,0,35,87,3,0,0,34,87,3,0,0,7,1,0,0,0,0,7,1,87,3,0,0,35,0,128,127,0,34,0,128,127,0,35,87,3,0,0,34,87,3,0,0,7,1,0,0,0,0,7,1,87,3,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,79,0,0,0,7,1,13,128,0,0,105,38,0,0,0,108,90,38,0,0,0,90,38,0,0,0,90,106,104,0,0,0,0,9,2,0,157,61,0,0,0,0,0,110,9,5,0,89,236,1,0,0,90,104,0,0,0,0,0,0,0,112,0,0,7,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,166,2,0,0,34,166,2,0,0,7,1,0,0,0,0,7,1,166,2,0,0,35,0,128,1,0,34,0,128,1,0,35,205,1,0,0,34,205,1,0,0,7,1,0,0,0,0,7,1,205,1,0,0,35,0,128,2,0,34,0,128,2,0,35,73,3,0,0,34,73,3,0,0,7,1,0,0,0,0,7,1,73,3,0,0,35,0,128,3,0,34,0,128,3,0,35,87,3,0,0,34,87,3,0,0,7,1,0,0,0,0,7,1,87,3,0,0,35,0,128,127,0,34,0,128,127,0,35,87,3,0,0,34,87,3,0,0,7,1,0,0,0,0,7,1,87,3,0,0,90,106,89,236,1,0,0,90,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,10,3,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,58,3,0,0,7,1,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,236,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,108,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,236,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,108,90,16,0,0,0,0,0,10,0,38,0,0,0,105,108,90,16,0,0,0,0,0,10,0,89,236,1,0,0,90,38,0,0,0,105,108,90,38,0,0,0,90,38,0,0,0,90,38,0,0,0,90,38,0,0,0,90,38,0,0,0,157,52,0,0,90,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,216,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,225,3,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,234,3,0,0,7,1,13,128,0,0,35,13,128,3,0,34,13,128,3,0,7,1,243,3,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 134, bytes: 1020, labels: 31, unknownOps: 0, unresolvedSymbols: 38 } as const;
