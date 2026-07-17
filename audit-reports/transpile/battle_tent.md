# transpile battle_tent.c → src\battle_tent.ts

stats: {"fns":29,"data":7,"defines":0,"flags":10,"unresolved":15,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `SetBattleFacilityTrainerGfxId` ()
- `gFacilityTrainers` ()
- `FrontierSpeechToString` ()
- `SaveGameFrontier` ()
- `CopyItemName` ()
- `GetFrontierTrainerName` ()
- `DoBattleFactorySelectScreen` ()
- `DoBattleFactorySwapScreen` ()
- `LAYOUT_BATTLE_TENT_CORRIDOR` ()
- `LAYOUT_BATTLE_TENT_BATTLE_ROOM` ()
- `gSlateportBattleTentTrainers` ()
- `gSlateportBattleTentMons` ()
- `gFacilityTrainerMons` ()
- `gBattleFrontierHeldItems` ()
- `gFrontierTempParty` ()

## Flags TRANSPILER-TODO
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `Random ← src/engine/battle/script-interpreter.ts | src/random.ts | include/random.ts (choisi src/random.ts)`
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `ITEM_NONE ← src/mail_data.ts | include/constants/items.ts (choisi include/constants/items.ts)`
- :0 **import-ambigu** — `PARTY_SIZE ← src/engine/battle/party-storage.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `SPECIES_NONE ← src/mail_data.ts | include/constants/species.ts (choisi include/constants/species.ts)`
- :0 **import-ambigu** — `FRONTIER_PARTY_SIZE ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
