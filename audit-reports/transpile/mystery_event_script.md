# transpile mystery_event_script.c → src\mystery_event_script.ts

stats: {"fns":30,"data":1,"defines":1,"flags":30,"unresolved":3,"gtext":13,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `InitRamScript` ()
- `UnlockTrendySaying` ()
- `ValidateEReaderTrainer` ()

## Flags TRANSPILER-TODO
- :109 **sizeof** — `sizeof(gSaveBlock1Ptr->recordMixingGift.data)`
- :132 **sizeof** — `sizeof(gSaveBlock1Ptr->recordMixingGift)`
- :314 **struct-local** — `struct Pokemon pokemon`
- :321 **deref** — `*(struct Pokemon *)pokemonPtr`
- :336 **memcpy** — `memcpy(&gPlayerParty[PARTY_SIZE - 1], pokemonPtr, sizeof(str`
- :337 **sizeof** — `sizeof(struct Mail)`
- :337 **memcpy** — `memcpy(&mail, mailPtr, sizeof(struct Mail))`
- :361 **sizeof** — `sizeof(gSaveBlock2Ptr->frontier.ereaderTrainer)`
- :361 **memcpy** — `memcpy(&gSaveBlock2Ptr->frontier.ereaderTrainer, (void *)dat`
- :0 **import-ambigu** — `gStringVar4 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringExpandPlaceholders ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `BERRY_NAME_LENGTH ← src/berry.ts | src/engine/save/save-blocks.ts (choisi src/berry.ts)`
- :0 **import-ambigu** — `StringCopyN ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gStringVar2 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringCompare ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `MON_DATA_SPECIES_OR_EGG ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `GetMonData ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/engine/battle/party-storage.ts)`
- :0 **import-ambigu** — `POKEMON_NAME_LENGTH ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `PARTY_SIZE ← src/engine/battle/party-storage.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `gPlayerParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `SpeciesToNationalPokedexNum ← src/engine/data/game-data.ts | src/engine/ui/pokedex-flags.ts (choisi src/engine/data/game-data.ts)`
- :0 **import-ambigu** — `MON_DATA_HELD_ITEM ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `CalculatePlayerPartyCount ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `EnableResetRTC ← src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `CalcByteArraySum ← src/util.ts | include/util.ts (choisi src/util.ts)`
- :0 **import-ambigu** — `CalcCRC16 ← src/util.ts | include/util.ts (choisi src/util.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :54 gText_MysteryEventCantBeUsed
- :240 gText_MysteryEventBerry
- :245 gText_MysteryEventBerryTransform
- :250 gText_MysteryEventBerryObtained
- :270 gText_MysteryEventSpecialRibbon
- :289 gText_MysteryEventNationalDex
- :297 gText_MysteryEventRareWord
- :325 gText_EggNickname
- :327 gText_Pokemon
- :331 gText_MysteryEventFullParty
- :351 gText_MysteryEventSentOver
- :363 gText_MysteryEventNewTrainer
- :371 gText_InGameClockUsable
