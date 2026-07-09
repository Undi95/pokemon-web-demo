# transpile rotating_tile_puzzle.c → src\rotating_tile_puzzle.ts

stats: {"fns":6,"data":10,"defines":3,"flags":10,"unresolved":0,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
(aucun)

## Flags TRANSPILER-TODO
- :92 **sizeof** — `sizeof(*sRotatingTilePuzzle)`
- :92 **alloc** — `AllocZeroed(sizeof(*sRotatingTilePuzzle))`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `OBJECT_EVENT_TEMPLATES_COUNT ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `MAP_OFFSET ← src/fieldmap.ts | include/fieldmap.ts (choisi include/fieldmap.ts)`
- :0 **import-ambigu** — `OBJECT_EVENTS_COUNT ← src/engine/save/save-blocks.ts | src/event_object_movement.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `DIR_EAST ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `DIR_SOUTH ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `DIR_WEST ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `DIR_NORTH ← src/engine/field/direction-coords.ts | src/field_player_avatar.ts | include/constants/global.ts (choisi include/constants/global.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
