# transpile lilycove_lady.c → src\lilycove_lady.ts

stats: {"fns":63,"data":3,"defines":0,"flags":20,"unresolved":10,"gtext":1,"mergeSkipped":9}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `sLilycoveLadyGfxId` ()
- `sContestLadyMonGfxId` ()
- `sFavorLadyRequests` ()
- `FavorLadyOpenBagMenu` ()
- `IsEasyChatAnswerUnlocked` ()
- `QuizLadyOpenBagMenu` ()
- `sContestLadyCategoryNames` ()
- `sContestLadyMonNames` ()
- `OpenPokeblockCase` ()
- `sContestLadyMonSpecies` ()

## Flags TRANSPILER-TODO
- :206 **memset** — `memset(dest, EOS, PLAYER_NAME_LENGTH + 1)`
- :448 **ptr-arith** — `ptr++`
- :633 **sizeof** — `sizeof(sContestLadyPtr->playerName)`
- :633 **memset** — `memset(sContestLadyPtr->playerName, EOS, sizeof(sContestLady`
- :634 **sizeof** — `sizeof(sContestLadyPtr->playerName)`
- :634 **memcpy** — `memcpy(sContestLadyPtr->playerName, gSaveBlock2Ptr->playerNa`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringCopy ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `EOS ← src/mail_data.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `gStringVar3 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringCopy_PlayerName ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `ConvertInternationalString ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gStringVar2 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `PLAYER_NAME_LENGTH ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `EC_EMPTY_WORD ← src/easy_chat.ts | src/mail_data.ts (choisi src/easy_chat.ts)`
- :0 **import-ambigu** — `StringCompare ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringCopy_Nickname ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **variante-repo** — `CB2_ReturnToField → CB2_ReturnToField_Manual`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :399 gText_QuizLady_Lady
