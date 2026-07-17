# transpile confetti_util.c → src\confetti_util.ts

stats: {"fns":8,"data":1,"defines":0,"flags":36,"unresolved":0,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
(aucun)

## Flags TRANSPILER-TODO
- :22 **sizeof** — `sizeof(*sWork)`
- :22 **alloc** — `AllocZeroed(sizeof(*sWork))`
- :25 **sizeof** — `sizeof(struct ConfettiUtil)`
- :25 **alloc** — `AllocZeroed(count * sizeof(struct ConfettiUtil))`
- :35 **sizeof** — `sizeof(struct OamData)`
- :35 **memcpy** — `memcpy(&sWork->array[i].oam, &gDummyOamData, sizeof(struct O`
- :50 **adresse-element** — `&gMain.oamBuffer[i + 64]`
- :50 **sizeof** — `sizeof(struct OamData)`
- :50 **memcpy** — `memcpy(&gMain.oamBuffer[i + 64], &gDummyOamData, sizeof(stru`
- :52 **sizeof** — `sizeof(struct ConfettiUtil)`
- :52 **memset** — `memset(sWork->array, 0, sWork->count * sizeof(struct Confett`
- :54 **sizeof** — `sizeof(*sWork)`
- :54 **memset** — `memset(sWork, 0, sizeof(*sWork))`
- :72 **adresse-element** — `&sWork->array[i]`
- :76 **adresse-element** — `&gMain.oamBuffer[i + 64]`
- :76 **sizeof** — `sizeof(struct OamData)`
- :76 **memcpy** — `memcpy(&gMain.oamBuffer[i + 64], &gDummyOamData, sizeof(stru`
- :84 **adresse-element** — `&gMain.oamBuffer[i + 64]`
- :84 **adresse-element** — `&sWork->array[i]`
- :84 **sizeof** — `sizeof(struct OamData)`
- :84 **memcpy** — `memcpy(&gMain.oamBuffer[i + 64], &sWork->array[i], sizeof(st`
- :142 **adresse-element** — `&sWork->array[i]`
- :143 **sizeof** — `sizeof(*structPtr)`
- :143 **memset** — `memset(structPtr, 0, sizeof(*structPtr))`
- :154 **sizeof** — `sizeof(*oam)`
- :154 **memcpy** — `memcpy(&structPtr->oam, oam, sizeof(*oam))`
- :175 **adresse-element** — `&sWork->array[id]`
- :175 **sizeof** — `sizeof(struct ConfettiUtil)`
- :175 **memset** — `memset(&sWork->array[id], 0, sizeof(struct ConfettiUtil))`
- :179 **adresse-element** — `&gMain.oamBuffer[id + 64]`
- :179 **sizeof** — `sizeof(struct OamData)`
- :179 **memcpy** — `memcpy(&gMain.oamBuffer[id + 64], &gDummyOamData, sizeof(str`
- :0 **import-ambigu** — `GetSpriteTileStartByTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `IndexOfSpritePaletteTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `DISPLAY_HEIGHT ← include/gba/defines.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/defines.ts)`
- :0 **import-ambigu** — `DISPLAY_WIDTH ← include/gba/defines.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/defines.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
