# transpile landmark.c → src\landmark.ts

stats: {"fns":2,"data":121,"defines":0,"flags":3,"unresolved":0,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
(aucun)

## Flags TRANSPILER-TODO
- :416 **ptr-arith** — `landmarks++`
- :0 **import-ambigu** — `encodeOwText ← src/text.ts | include/text.ts (choisi src/text.ts)`
- :0 **import-ambigu** — `FlagGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
