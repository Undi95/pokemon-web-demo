# transpile birch_pc.c → src\birch_pc.ts

stats: {"fns":3,"data":0,"defines":0,"flags":3,"unresolved":0,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
(aucun)

## Flags TRANSPILER-TODO
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `SpeciesToNationalPokedexNum ← src/engine/data/game-data.ts | src/engine/ui/pokedex-flags.ts (choisi src/engine/data/game-data.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
