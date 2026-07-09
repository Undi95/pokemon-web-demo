# transpile pokenav_main_menu.c → src\pokenav_main_menu.ts

stats: {"fns":45,"data":20,"defines":0,"flags":51,"unresolved":19,"gtext":12,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `gPokenavLeftHeaderHoennMap_Gfx` ()
- `AllocSubstruct` ()
- `CreateLoopedTask` ()
- `GetSubstructPtr` ()
- `IsLoopedTaskActive` ()
- `ResetBldCnt_` ()
- `FreeMenuHandlerSubstruct2` ()
- `ResetBgPositions` ()
- `gPokenavHeader_Gfx` ()
- `DecompressAndCopyTileDataToVram` ()
- `SetBgTilemapBuffer` ()
- `gPokenavHeader_Tilemap` ()
- `gPokenavHeader_Pal` ()
- `FreeTempTileDataBuffersIfPossible` ()
- `GetBgY` ()
- `gPokenavLeftHeader_Pal` ()
- `gDecompressionBuffer` ()
- `LZ77UnCompWram` ()
- `RequestDma3Copy` ()

## Flags TRANSPILER-TODO
- :56 **incbin** — `sSpinningPokenav_Pal ← graphics/pokenav/nav_icon.png`
- :57 **incbin** — `sSpinningPokenav_Gfx ← graphics/pokenav/nav_icon.png`
- :58 **incbin** — `sBlueLightCopy ← graphics/pokenav/blue_light.png`
- :135 **designator** — `[POKENAV_GFX_MAIN_MENU] = {
        .data = gPoken`
- :140 **designator** — `[POKENAV_GFX_CONDITION_MENU] = {
        .data = g`
- :145 **designator** — `[POKENAV_GFX_RIBBONS_MENU] = {
        .data = gPo`
- :150 **designator** — `[POKENAV_GFX_MATCH_CALL_MENU] = {
        .data = `
- :155 **designator** — `[POKENAV_GFX_MAP_MENU_ZOOMED_OUT] = {
        .dat`
- :160 **designator** — `[POKENAV_GFX_MAP_MENU_ZOOMED_IN] = {
        .data`
- :169 **designator** — `[POKENAV_GFX_PARTY_MENU - POKENAV_GFX_SUBMENUS_STA`
- :173 **designator** — `[POKENAV_GFX_SEARCH_MENU - POKENAV_GFX_SUBMENUS_ST`
- :177 **designator** — `[POKENAV_GFX_COOL_MENU - POKENAV_GFX_SUBMENUS_STAR`
- :181 **designator** — `[POKENAV_GFX_BEAUTY_MENU - POKENAV_GFX_SUBMENUS_ST`
- :185 **designator** — `[POKENAV_GFX_CUTE_MENU - POKENAV_GFX_SUBMENUS_STAR`
- :189 **designator** — `[POKENAV_GFX_SMART_MENU - POKENAV_GFX_SUBMENUS_STA`
- :193 **designator** — `[POKENAV_GFX_TOUGH_MENU - POKENAV_GFX_SUBMENUS_STA`
- :219 **init-positionnel** — `ANIMCMD_FRAME(64, 8)`
- :220 **init-positionnel** — `ANIMCMD_FRAME(80, 8)`
- :221 **init-positionnel** — `ANIMCMD_FRAME(96, 8)`
- :222 **init-positionnel** — `ANIMCMD_FRAME(112, 8)`
- :223 **init-positionnel** — `ANIMCMD_JUMP(0)`
- :297 **sizeof** — `sizeof(struct Pokenav_MainMenu)`
- :446 **adresse-element** — `&gPlttBufferUnfaded[bufferOffset]`
- :454 **ptr-arith** — `current++`
- :471 **adresse-element** — `&gPlttBufferFaded[OBJ_PLTT_ID(palIndex)]`
- :547 **ptr-arith** — `templates++`
- :689 **adresse-element** — `&gPokenavLeftHeader_Pal[tag * 16]`
- :706 **adresse-element** — `&gPokenavLeftHeader_Pal[tag * 16]`
- :707 **adresse-element** — `&gDecompressionBuffer[0x1000]`
- :708 **adresse-element** — `&gDecompressionBuffer[0x1000]`
- :0 **import-ambigu** — `TEXT_COLOR_RED ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `TEXT_COLOR_WHITE ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `TEXT_COLOR_DARK_GRAY ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `ST_OAM_AFFINE_OFF ← include/sprite.ts | harness/runtime/decomp-helpers.ts (choisi include/sprite.ts)`
- :0 **import-ambigu** — `FreeAllSpritePalettes ← src/sprite.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-helpers.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `PlaySE ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `PALETTES_ALL ← src/palette.ts | harness/runtime/decomp-globals.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `REG_OFFSET_DISPCNT ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `DISPCNT_OBJ_ON ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `DISPCNT_OBJ_1D_MAP ← include/gba/io_reg.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `BG_PLTT_ID ← src/palette.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `PLTT_SIZE_4BPP ← src/sprite.ts | harness/runtime/decomp-bridge.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-helpers.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `gPlttBufferUnfaded ← src/palette.ts | harness/runtime/decomp-globals.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `OBJ_PLTT_ID ← src/palette.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `RGB2 ← src/palette.ts | harness/runtime/decomp-bridge.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `FONT_NORMAL ← src/engine/battle/battle-windows.ts | src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `AddTextPrinterParameterized3 ← src/menu.ts | harness/runtime/decomp-globals.ts (choisi src/menu.ts)`
- :0 **import-ambigu** — `PIXEL_FILL ← src/engine/battle/battle-windows.ts | harness/runtime/decomp-globals.ts (choisi src/engine/battle/battle-windows.ts)`
- :0 **import-ambigu** — `IndexOfSpritePaletteTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `FreeSpriteTilesByTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `GetSpriteTileStartByTag ← src/sprite.ts | harness/runtime/decomp-globals.ts (choisi src/sprite.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :89 gText_Pokenav_ClearButtonList
- :90 gText_PokenavMap_ZoomedOutButtons
- :91 gText_PokenavMap_ZoomedInButtons
- :92 gText_PokenavCondition_MonListButtons
- :93 gText_PokenavCondition_MonStatusButtons
- :94 gText_PokenavCondition_MarkingButtons
- :95 gText_PokenavMatchCall_TrainerListButtons
- :96 gText_PokenavMatchCall_CallMenuButtons
- :97 gText_PokenavMatchCall_CheckTrainerButtons
- :98 gText_PokenavRibbons_MonListButtons
- :99 gText_PokenavRibbons_RibbonListButtons
- :100 gText_PokenavRibbons_RibbonCheckButtons
