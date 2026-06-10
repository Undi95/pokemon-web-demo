// AUTO-GENERATED from data/scripts/shared_secret_base-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=134, bytes=1012, labels=31, unknownOps=0, unresolvedSymbols=32

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SecretBase_MapScripts": 0,
  "SecretBase_OnWarp": 20,
  "SecretBase_OnTransition": 28,
  "SecretBase_OnFrame": 42,
  "SecretBase_OnResume": 50,
  "SecretBase_EventScript_PC": 53,
  "SecretBase_EventScript_PCShowMainMenu": 77,
  "SecretBase_EventScript_PCCancel": 98,
  "SecretBase_EventScript_PCMainMenuWithRegister": 105,
  "SecretBase_EventScript_PCMainMenuWithoutRegister": 276,
  "SecretBase_EventScript_PCPackUp": 415,
  "SecretBase_EventScript_PCDecorationMenu": 452,
  "SecretBase_EventScript_PCRegistryMenu": 457,
  "SecretBase_EventScript_RecordMixingPC": 462,
  "SecretBase_EventScript_PCRegisterMenu": 486,
  "SecretBase_EventScript_ShowRegisterMenu": 663,
  "SecretBase_EventScript_PCRegister": 670,
  "SecretBase_EventScript_AlreadyRegistered": 770,
  "SecretBase_EventScript_CantRegisterTooManyBases": 818,
  "SecretBase_EventScript_PCRegistryInfo": 833,
  "SecretBase_EventScript_PCTurnOff": 847,
  "SecretBase_EventScript_Poster": 854,
  "SecretBase_EventScript_FurnitureBottom": 859,
  "SecretBase_EventScript_FurnitureMiddle": 864,
  "SecretBase_EventScript_FurnitureTop": 869,
  "SecretBase_EventScript_SandOrnament": 874,
  "SecretBase_EventScript_ShieldOrToyTV": 883,
  "SecretBase_EventScript_BattleTowerShield": 976,
  "SecretBase_EventScript_ToyTV": 985,
  "SecretBase_EventScript_SeedotTV": 994,
  "SecretBase_EventScript_SkittyTV": 1003,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [4,20,0,0,0,3,28,0,0,0,2,42,0,0,0,5,50,0,0,0,137,64,0,0,0,0,0,0,5,0,0,0,0,38,0,0,58,38,0,0,58,3,151,64,0,0,0,0,0,0,167,6,3,106,48,2,0,104,0,0,0,0,157,61,0,58,103,110,48,5,0,6,77,0,0,0,3,104,0,0,0,0,103,44,12,1,7,1,105,0,0,0,6,20,1,0,0,3,106,6,77,0,0,0,3,112,0,0,6,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,196,1,0,0,34,196,1,0,0,7,1,0,0,0,0,7,1,196,1,0,0,35,0,128,1,0,34,0,128,1,0,35,159,1,0,0,34,159,1,0,0,7,1,0,0,0,0,7,1,159,1,0,0,35,0,128,2,0,34,0,128,2,0,35,201,1,0,0,34,201,1,0,0,7,1,0,0,0,0,7,1,201,1,0,0,35,0,128,3,0,34,0,128,3,0,35,79,3,0,0,34,79,3,0,0,7,1,0,0,0,0,7,1,79,3,0,0,35,0,128,127,0,34,0,128,127,0,35,79,3,0,0,34,79,3,0,0,7,1,0,0,0,0,7,1,79,3,0,0,3,112,0,0,5,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,196,1,0,0,34,196,1,0,0,7,1,0,0,0,0,7,1,196,1,0,0,35,0,128,1,0,34,0,128,1,0,35,159,1,0,0,34,159,1,0,0,7,1,0,0,0,0,7,1,159,1,0,0,35,0,128,2,0,34,0,128,2,0,35,79,3,0,0,34,79,3,0,0,7,1,0,0,0,0,7,1,79,3,0,0,35,0,128,127,0,34,0,128,127,0,35,79,3,0,0,34,79,3,0,0,7,1,0,0,0,0,7,1,79,3,0,0,3,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,77,0,0,0,7,1,13,128,0,0,105,38,0,0,58,108,3,38,0,0,58,3,38,0,0,58,3,106,104,0,0,0,0,48,2,0,157,61,0,58,103,110,48,5,0,6,230,1,0,0,3,104,0,0,0,0,103,112,0,0,7,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,158,2,0,0,34,158,2,0,0,7,1,0,0,0,0,7,1,158,2,0,0,35,0,128,1,0,34,0,128,1,0,35,201,1,0,0,34,201,1,0,0,7,1,0,0,0,0,7,1,201,1,0,0,35,0,128,2,0,34,0,128,2,0,35,65,3,0,0,34,65,3,0,0,7,1,0,0,0,0,7,1,65,3,0,0,35,0,128,3,0,34,0,128,3,0,35,79,3,0,0,34,79,3,0,0,7,1,0,0,0,0,7,1,79,3,0,0,35,0,128,127,0,34,0,128,127,0,35,79,3,0,0,34,79,3,0,0,7,1,0,0,0,0,7,1,79,3,0,0,3,106,6,230,1,0,0,3,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,2,3,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,50,3,0,0,7,1,13,128,0,0,38,0,0,58,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,230,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,3,38,0,0,58,38,0,0,58,108,3,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,230,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,3,38,0,0,58,38,0,0,58,108,3,16,0,0,0,0,0,10,3,38,0,0,58,105,108,3,16,0,0,0,0,0,10,4,6,230,1,0,0,3,38,0,0,58,105,108,3,38,0,0,58,3,38,0,0,58,3,38,0,0,58,3,38,0,0,58,3,38,0,0,58,157,52,0,58,3,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,208,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,217,3,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,226,3,0,0,7,1,13,128,0,0,35,13,128,3,0,34,13,128,3,0,7,1,235,3,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3] as const;

export const STATS = { ops: 134, bytes: 1012, labels: 31, unknownOps: 0, unresolvedSymbols: 32 } as const;
