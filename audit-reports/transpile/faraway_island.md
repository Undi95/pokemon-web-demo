# transpile faraway_island.c → src\faraway_island.ts

stats: {"fns":15,"data":5,"defines":0,"flags":13,"unresolved":3,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `gSpritePalette_GeneralFieldEffect1` ()
- `gFieldEffectObjectTemplatePointers` ()
- `CreateSpriteAtEnd` ()

## Flags TRANSPILER-TODO
- :0 **import-ambigu** — `MAP_OFFSET ← src/fieldmap.ts | include/fieldmap.ts (choisi include/fieldmap.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `DIR_NONE ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `DIR_EAST ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `DIR_WEST ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `DIR_NORTH ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `DIR_SOUTH ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `FlagGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `LoadSpritePalette ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `IndexOfSpritePaletteTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `MAX_SPRITES ← src/item_icon.ts | src/sprite.ts | include/sprite.ts | harness/runtime/decomp-runtime.ts (choisi include/sprite.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
