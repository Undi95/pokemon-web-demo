# transpile pokenav_list.c → src\pokenav_list.ts

stats: {"fns":47,"data":9,"defines":2,"flags":16,"unresolved":15,"gtext":3,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `AllocSubstruct` ()
- `CreateLoopedTask` ()
- `FuncIsActiveLoopedTask` ()
- `GetSubstructPtr` ()
- `FreePokenavSubstruct` ()
- `BgDmaFill` ()
- `SetBgTilemapBuffer` ()
- `GetBgY` ()
- `IsLoopedTaskActive` ()
- `LT_SET_STATE` ()
- `CpuFastFill8` ()
- `ClearRematchPokeballIcon` ()
- `CopyWindowRectToVram` ()
- `GetMatchCallFlavorText` ()
- `Pokenav_AllocAndLoadPalettes` ()

## Flags TRANSPILER-TODO
- :96 **incbin** — `sListArrow_Pal ← graphics/pokenav/list_arrows.png`
- :97 **incbin** — `sListArrow_Gfx ← graphics/pokenav/list_arrows.png`
- :103 **sizeof** — `sizeof(struct PokenavList)`
- :754 **static-local** — `static const u8 lineOffsets[CHECK_PAGE_ENTRY_COUNT] = {`
- :846 **ptr-arith** — `ptr++`
- :0 **import-ambigu** — `PIXEL_FILL ← src/engine/battle/battle-windows.ts | harness/runtime/decomp-globals.ts (choisi src/engine/battle/battle-windows.ts)`
- :0 **import-ambigu** — `TEXT_SKIP_DRAW ← src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `TEXT_COLOR_TRANSPARENT ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `TEXT_COLOR_DARK_GRAY ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `TEXT_COLOR_LIGHT_RED ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `AddTextPrinterParameterized3 ← src/menu.ts | harness/runtime/decomp-globals.ts (choisi src/menu.ts)`
- :0 **import-ambigu** — `TEXT_COLOR_WHITE ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `TEXT_COLOR_RED ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `FONT_NARROW ← src/engine/battle/battle-windows.ts | src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `ST_OAM_AFFINE_OFF ← include/sprite.ts | harness/runtime/decomp-helpers.ts (choisi include/sprite.ts)`
- :0 **import-ambigu** — `FreeSpriteTilesByTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :738 gText_PokenavMatchCall_Strategy
- :739 gText_PokenavMatchCall_TrainerPokemon
- :740 gText_PokenavMatchCall_SelfIntroduction
