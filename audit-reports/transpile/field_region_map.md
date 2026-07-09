# transpile field_region_map.c → src\field_region_map.ts

stats: {"fns":6,"data":3,"defines":0,"flags":29,"unresolved":6,"gtext":2}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `DoScheduledBgTilemapCopiesToVram` ()
- `InitRegionMap` ()
- `CreateRegionMapPlayerIcon` ()
- `CreateRegionMapCursor` ()
- `DoRegionMapInputCallback` ()
- `FreeRegionMapIconResources` ()

## Flags TRANSPILER-TODO
- :71 **designator** — `[WIN_MAPSEC_NAME] = {
        .bg = 0,
        .ti`
- :80 **designator** — `[WIN_TITLE] = {
        .bg = 0,
        .tilemapL`
- :95 **sizeof** — `sizeof(*sFieldRegionMapHandler)`
- :95 **alloc** — `Alloc(sizeof(*sFieldRegionMapHandler))`
- :0 **import-ambigu** — `SetVBlankCallback ← src/main.ts | harness/runtime/decomp-bridge.ts (choisi src/main.ts)`
- :0 **import-ambigu** — `REG_OFFSET_DISPCNT ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `REG_OFFSET_BG0HOFS ← src/scanline_effect.ts | include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `REG_OFFSET_BG0VOFS ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `REG_OFFSET_BG1HOFS ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `REG_OFFSET_BG1VOFS ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `REG_OFFSET_BG2HOFS ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `REG_OFFSET_BG2VOFS ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `REG_OFFSET_BG3HOFS ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `REG_OFFSET_BG3VOFS ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `FreeAllSpritePalettes ← src/sprite.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-helpers.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `BG_PLTT_ID ← src/palette.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `LoadUserWindowBorderGfx ← src/text_window.ts | include/text_window.ts (choisi src/text_window.ts)`
- :0 **import-ambigu** — `LoadOam ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `ProcessSpriteCopyRequests ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `AnimateSprites ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `BuildOamBuffer ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `UpdatePaletteFade ← src/palette.ts | harness/runtime/decomp-globals.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `DrawStdFrameWithCustomTileAndPalette ← src/menu.ts | src/window.ts (choisi src/menu.ts)`
- :0 **import-ambigu** — `FONT_NORMAL ← src/engine/battle/battle-windows.ts | src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `GetStringCenterAlignXOffset ← src/text.ts | include/text.ts (choisi src/text.ts)`
- :0 **import-ambigu** — `PALETTES_ALL ← src/palette.ts | harness/runtime/decomp-globals.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `DISPCNT_OBJ_1D_MAP ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `DISPCNT_OBJ_ON ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `PIXEL_FILL ← src/engine/battle/battle-windows.ts | harness/runtime/decomp-globals.ts (choisi src/engine/battle/battle-windows.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :154 gText_Hoenn
- :155 gText_Hoenn
