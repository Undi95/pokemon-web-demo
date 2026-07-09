# transpile digit_obj_util.c → src\digit_obj_util.ts

stats: {"fns":14,"data":2,"defines":0,"flags":19,"unresolved":1,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `GetDecompressedDataSize` ()

## Flags TRANSPILER-TODO
- :78 **sizeof** — `sizeof(*sOamWork)`
- :82 **sizeof** — `sizeof(struct DigitPrinter)`
- :82 **alloc** — `Alloc(sizeof(struct DigitPrinter) * count)`
- :141 **deref** — `*(struct CompressedSpriteSheet *)(template->spriteSheet)`
- :172 **adresse-element** — `&sOamWork->array[id]`
- :185 **adresse-element** — `&gMain.oamBuffer[oamId]`
- :185 **sizeof** — `sizeof(struct OamData)`
- :229 **adresse-element** — `&sOamWork->array[id]`
- :232 **adresse-element** — `&sOamWork->array[id]`
- :235 **adresse-element** — `&sOamWork->array[id]`
- :264 **static-local** — `static int oamId;`
- :265 **static-local** — `static int curDigit;`
- :266 **static-local** — `static int firstDigit;`
- :0 **import-ambigu** — `GetSpriteTileStartByTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `IndexOfSpritePaletteTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `LoadSpritePalette ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `ST_OAM_AFFINE_ERASE ← include/sprite.ts | harness/runtime/decomp-helpers.ts (choisi include/sprite.ts)`
- :0 **import-ambigu** — `ST_OAM_AFFINE_OFF ← include/sprite.ts | harness/runtime/decomp-helpers.ts (choisi include/sprite.ts)`
- :0 **import-ambigu** — `FreeSpriteTilesByTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
