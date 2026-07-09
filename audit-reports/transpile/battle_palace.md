# transpile battle_palace.c → src\battle_palace.ts

stats: {"fns":11,"data":5,"defines":0,"flags":6,"unresolved":5,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `SetBattleFacilityTrainerGfxId` ()
- `gFacilityTrainers` ()
- `FrontierSpeechToString` ()
- `SaveGameFrontier` ()
- `CopyItemName` ()

## Flags TRANSPILER-TODO
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `Random ← src/engine/battle/script-interpreter.ts | src/random.ts | include/random.ts (choisi src/random.ts)`
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
