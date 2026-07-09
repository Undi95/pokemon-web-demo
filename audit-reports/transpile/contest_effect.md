# transpile contest_effect.c → src\contest_effect.ts

stats: {"fns":51,"data":0,"defines":0,"flags":3,"unresolved":14,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `gComboStarterLookupTable` ()
- `eContestantStatus` ()
- `eContestAppealResults` ()
- `SetContestantEffectStringID` ()
- `SetContestantEffectStringID2` ()
- `MakeContestantNervous` ()
- `Contest_IsMonsTurnDisabled` ()
- `IsContestantAllowedToCombo` ()
- `gContestantTurnOrder` ()
- `gContestEffects` ()
- `eContest` ()
- `eContestExcitement` ()
- `SetStartledString` ()
- `abs` ()

## Flags TRANSPILER-TODO
- :0 **import-ambigu** — `CONTESTANT_COUNT ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `Random ← src/engine/battle/script-interpreter.ts | src/random.ts | include/random.ts (choisi src/random.ts)`
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
