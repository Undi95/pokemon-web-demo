# transpile pokenav_region_map.c → src\pokenav_region_map.ts

stats: {"fns":37,"data":9,"defines":3,"flags":25,"unresolved":48,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `gRegionMapCityZoomText_Gfx` ()
- `gRegionMapCityZoomTiles_Pal` ()
- `AllocSubstruct` ()
- `IsEventIslandMapSecId` ()
- `IsRegionMapZoomed` ()
- `FreePokenavSubstruct` ()
- `GetSubstructPtr` ()
- `DoRegionMapInputCallback` ()
- `CreateLoopedTask` ()
- `FreeRegionMapIconResources` ()
- `SetPokenavVBlankCallback` ()
- `SetBgMode` ()
- `UpdateRegionMapVideoRegs` ()
- `IsLoopedTaskActive` ()
- `SetVBlankCallback_` ()
- `InitBgTemplates` ()
- `InitRegionMapData` ()
- `LoadRegionMapGfx` ()
- `CreateRegionMapPlayerIcon` ()
- `CreateRegionMapCursor` ()
- `TrySetPlayerIconBlink` ()
- `BlendRegionMap` ()
- `FadeToBlackExceptPrimary` ()
- `LoadLeftHeaderGfxForIndex` ()
- `ShowLeftHeaderGfx` ()
- `PokenavFadeScreen` ()
- `IsPaletteFadeActive` ()
- `AreLeftHeaderSpritesMoving` ()
- `SetRegionMapDataForZoom` ()
- `UpdateRegionMapZoom` ()
- `PrintHelpBarText` ()
- `WaitForHelpBar` ()
- `UpdateRegionMapRightHeaderTiles` ()
- `SetLeftHeaderSpritesInvisibility` ()
- `SlideMenuHeaderDown` ()
- `MainMenuLoopedTaskIsBusy` ()
- `Pokenav_AllocAndLoadPalettes` ()
- `BgDmaFill` ()
- `SetBgTilemapBuffer` ()
- `DecompressAndCopyTileDataToVram` ()
- `CopyPaletteIntoBufferUnfaded` ()
- `FreeTempTileDataBuffersIfPossible` ()
- `PutWindowRectTilemap` ()
- `FuncIsActiveLoopedTask` ()
- `sPokenavCityMaps` ()
- `LZ77UnCompWram` ()
- `CopyToBgTilemapBufferRect` ()
- `GetBgY` ()

## Flags TRANSPILER-TODO
- :80 **incbin** — `sMapSecInfoWindow_Pal ← graphics/pokenav/region_map/info_window.pal`
- :81 **incbin** — `sRegionMapCityZoomTiles_Gfx ← graphics/pokenav/region_map/zoom_tiles.png`
- :176 **sizeof** — `sizeof(struct Pokenav_RegionMapMenu)`
- :180 **sizeof** — `sizeof(struct RegionMap)`
- :247 **sizeof** — `sizeof(struct Pokenav_RegionMapGfx)`
- :518 **sizeof** — `sizeof(sMapSecInfoWindow_Pal)`
- :0 **import-ambigu** — `ST_OAM_AFFINE_OFF ← include/sprite.ts | harness/runtime/decomp-helpers.ts (choisi include/sprite.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `B_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `JOY_NEW ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `LoadOam ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `ProcessSpriteCopyRequests ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `SE_SELECT ← src/battle_controllers.ts | include/constants/songs.ts (choisi include/constants/songs.ts)`
- :0 **import-ambigu** — `PlaySE ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `FreeSpriteTilesByTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `PIXEL_FILL ← src/engine/battle/battle-windows.ts | harness/runtime/decomp-globals.ts (choisi src/engine/battle/battle-windows.ts)`
- :0 **import-ambigu** — `BG_PLTT_ID ← src/palette.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `LoadUserWindowBorderGfx_ ← src/text_window.ts | include/text_window.ts (choisi src/text_window.ts)`
- :0 **import-ambigu** — `DrawTextBorderOuter ← src/text_window.ts | include/text_window.ts (choisi src/text_window.ts)`
- :0 **import-ambigu** — `PLTT_SIZE_4BPP ← src/sprite.ts | harness/runtime/decomp-bridge.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-helpers.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `FONT_NARROW ← src/engine/battle/battle-windows.ts | src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `TEXT_SKIP_DRAW ← src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `CHAR_SPACE ← src/mail_data.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `StringCopyPadded ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
