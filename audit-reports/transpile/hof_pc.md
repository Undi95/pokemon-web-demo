# transpile hof_pc.c → src\hof_pc.ts

stats: {"fns":4,"data":0,"defines":0,"flags":2,"unresolved":4,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `CB2_DoHallOfFamePC` ()
- `gFieldCallback` ()
- `ScriptMenu_CreatePCMultichoice` ()
- `ScriptMenu_DisplayPCStartupPrompt` ()

## Flags TRANSPILER-TODO
- :0 **variante-repo** — `CB2_ReturnToField → CB2_ReturnToField_Manual`
- :0 **import-ambigu** — `PALETTES_ALL ← src/palette.ts | harness/runtime/decomp-globals.ts (choisi src/palette.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
