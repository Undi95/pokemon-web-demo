# transpile walda_phrase.c → src\walda_phrase.ts

stats: {"fns":14,"data":1,"defines":3,"flags":11,"unresolved":8,"gtext":1,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `IsWaldaPhraseEmpty` ()
- `GetWaldaPhrasePtr` ()
- `SetWaldaPhrase` ()
- `gFieldCallback` ()
- `SetWaldaWallpaperPatternId` ()
- `SetWaldaWallpaperIconId` ()
- `SetWaldaWallpaperColors` ()
- `SetWaldaWallpaperLockedOrUnlocked` ()

## Flags TRANSPILER-TODO
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringCopy ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gStringVar2 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `DoNamingScreen ← src/main_menu.ts | src/naming_screen.ts (choisi src/naming_screen.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **variante-repo** — `CB2_ReturnToField → CB2_ReturnToField_Manual`
- :0 **import-ambigu** — `EOS ← src/mail_data.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `StringCompare ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `StringLength ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :66 gText_Peekaboo
