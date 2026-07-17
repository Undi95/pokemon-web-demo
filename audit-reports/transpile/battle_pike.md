# transpile battle_pike.c → src\battle_pike.ts

stats: {"fns":54,"data":24,"defines":0,"flags":54,"unresolved":21,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `HELPING_HAND` ()
- `EC_MOVE2` ()
- `SHEER_COLD` ()
- `EC_MOVE` ()
- `TACKLE` ()
- `FOCUS_ENERGY` ()
- `TOXIC` ()
- `SetFrontierBrainObjEventGfx` ()
- `FrontierSpeechToString` ()
- `SWAP` ()
- `GetAilmentFromStatus` ()
- `GetHighestLevelInPlayerParty` ()
- `LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_THREE_PATH_ROOM` ()
- `LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_NORMAL` ()
- `LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_WILD_MONS` ()
- `LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_UNUSED` ()
- `GetRandomScaledFrontierTrainerId` ()
- `gBattleFrontierTrainers` ()
- `gFacilityTrainers` ()
- `SetBattleFacilityTrainerGfxId` ()
- `GetPlayerSymbolCountForFacility` ()

## Flags TRANSPILER-TODO
- :1016 **struct-array-local** — `roomTypesDisabled`
- :1078 **alloc** — `AllocZeroed(numRoomCandidates)`
- :1140 **adresse-element** — `&gExperienceTables[gSpeciesInfo[wildMons[headerId][pikeMonId`
- :1354 **alloc** — `AllocZeroed(count)`
- :1489 **ptr-arith** — `mon++`
- :1596 **adresse-element** — `&gSaveBlock1Ptr->playerParty[gSaveBlock2Ptr->frontier.select`
- :1610 **adresse-element** — `&gSaveBlock2Ptr->frontier.pikeHeldItemsBackup[i]`
- :0 **import-ambigu** — `MOVE_COUNTER ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_MIRROR_COAT ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_DESTINY_BOND ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_ENCORE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `EC_EMPTY_WORD ← src/easy_chat.ts | src/mail_data.ts (choisi src/easy_chat.ts)`
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `Random ← src/engine/battle/script-interpreter.ts | src/random.ts | include/random.ts (choisi src/random.ts)`
- :0 **import-ambigu** — `MON_DATA_MAX_HP ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `GetMonData ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/engine/battle/party-storage.ts)`
- :0 **import-ambigu** — `MON_DATA_HP ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `SetMonData ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_PP_BONUSES ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MAX_MON_MOVES ← src/engine/battle/constants.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `MON_DATA_MOVE1 ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `CalculatePPWithBonus ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_PP1 ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_STATUS ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `GetMonAbility ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `ABILITY_MAGMA_ARMOR ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `ABILITY_WATER_VEIL ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `ABILITY_LIMBER ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `ABILITY_INSOMNIA ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `ABILITY_VITAL_SPIRIT ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `ABILITY_IMMUNITY ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `TYPE_STEEL ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `TYPE_POISON ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `TYPE_ICE ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `TYPE_GROUND ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `TYPE_ELECTRIC ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `TYPE_FIRE ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `FRONTIER_PARTY_SIZE ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `gPlayerParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_SPECIES ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `gEnemyParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_EXP ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_ABILITY_NUM ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `SetMonMoveSlot ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `CalculateMonStats ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `PALETTES_ALL ← src/palette.ts | harness/runtime/decomp-globals.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `MON_DATA_HELD_ITEM ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_SANITY_IS_EGG ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `ABILITY_KEEN_EYE ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `ABILITY_INTIMIDATE ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `MON_DATA_LEVEL ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
