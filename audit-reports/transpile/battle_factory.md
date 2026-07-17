# transpile battle_factory.c → src\battle_factory.ts

stats: {"fns":26,"data":15,"defines":0,"flags":54,"unresolved":18,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `gFrontierTempParty` ()
- `SaveGameFrontier` ()
- `DoBattleFactorySelectScreen` ()
- `DoBattleFactorySwapScreen` ()
- `gBattleFrontierTrainers` ()
- `gFacilityTrainers` ()
- `GetRandomScaledFrontierTrainerId` ()
- `gFacilityTrainerMons` ()
- `gBattleFrontierHeldItems` ()
- `SetBattleFacilityTrainerGfxId` ()
- `gBattleFrontierMons` ()
- `gSlateportBattleTentMons` ()
- `GetBoxMonData` ()
- `LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_PRE_BATTLE_ROOM` ()
- `LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_BATTLE_ROOM` ()
- `SetFacilityPtrsGetLevel` ()
- `T1_READ_32` ()
- `CreateMonWithEVSpreadNatureOTID` ()

## Flags TRANSPILER-TODO
- :399 **adresse-element** — `&gBattleFrontierHeldItems[gFacilityTrainerMons[gFrontierTemp`
- :463 **adresse-element** — `&gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTa`
- :502 **adresse-element** — `&gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTa`
- :727 **adresse-element** — `&gBattleFrontierHeldItems[gFacilityTrainerMons[gSaveBlock2Pt`
- :824 **adresse-element** — `&gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTa`
- :0 **import-ambigu** — `MOVE_SNATCH ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_NONE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_MIMIC ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_METRONOME ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_MIRROR_MOVE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_TRANSFORM ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_SUBSTITUTE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_SKETCH ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_CURSE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_FOLLOW_ME ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_TRICK ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_COUNTER ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_BIDE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_DESTINY_BOND ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_MIRROR_COAT ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_FOCUS_PUNCH ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_PROTECT ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_DETECT ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_ENDURE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_HEAL_BELL ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_BATON_PASS ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_ENCORE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `FRONTIER_PARTY_SIZE ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `SPECIES_UNOWN ← src/mail_data.ts | include/constants/species.ts (choisi include/constants/species.ts)`
- :0 **import-ambigu** — `ITEM_NONE ← src/mail_data.ts | include/constants/items.ts (choisi include/constants/items.ts)`
- :0 **import-ambigu** — `gEnemyParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_ATK_IV ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_PERSONALITY ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `GetMonData ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/engine/battle/party-storage.ts)`
- :0 **import-ambigu** — `MON_DATA_ABILITY_NUM ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_HELD_ITEM ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `SetMonData ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `gPlayerParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `CreateMon ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `NUM_STATS ← src/engine/battle/constants.ts | src/engine/save/save-blocks.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_HP_EV ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `CalculateMonStats ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MAX_MON_MOVES ← src/engine/battle/constants.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `MON_DATA_FRIENDSHIP ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `PARTY_SIZE ← src/engine/battle/party-storage.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `SPECIES_NONE ← src/mail_data.ts | include/constants/species.ts (choisi include/constants/species.ts)`
- :0 **import-ambigu** — `NUMBER_OF_MON_TYPES ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `TYPE_NORMAL ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `Random ← src/engine/battle/script-interpreter.ts | src/random.ts | include/random.ts (choisi src/random.ts)`
- :0 **import-ambigu** — `SetMonMoveSlot ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
