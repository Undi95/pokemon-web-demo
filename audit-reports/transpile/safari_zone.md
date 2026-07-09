# transpile safari_zone.c → src\safari_zone.ts

stats: {"fns":17,"data":5,"defines":1,"flags":16,"unresolved":7,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `TryPutSafariFanClubOnAir` ()
- `WarpIntoMap` ()
- `FieldCB_ReturnToFieldNoScriptCheckMusic` ()
- `gFieldCallback` ()
- `CB2_LoadMap` ()
- `CB2_ReturnToFieldContinueScriptPlayMapMusic` ()
- `gPokeblockNames` ()

## Flags TRANSPILER-TODO
- :123 **sizeof** — `sizeof(struct PokeblockFeeder)`
- :123 **memset** — `memset(&sPokeblockFeeders[index], 0, sizeof(struct Pokeblock`
- :128 **memset** — `memset(sPokeblockFeeders, 0, sizeof(sPokeblockFeeders))`
- :0 **import-ambigu** — `FlagGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `FlagSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `FlagClear ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `B_OUTCOME_CAUGHT ← src/engine/battle/constants.ts | include/constants/battle.ts (choisi include/constants/battle.ts)`
- :0 **variante-repo** — `CB2_ReturnToField → CB2_ReturnToField_Manual`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringCopy ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `gStringVar2 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `STR_CONV_MODE_LEADING_ZEROS ← src/battle_message.ts | include/string_util.ts (choisi include/string_util.ts)`
- :0 **import-ambigu** — `ConvertIntToDecimalStringN ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
