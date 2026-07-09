# wire src/pokenav_region_map.ts — 2026-07-04T21:22:29.567Z

imports auto : ../include/gba/types
wireTodo (48) : AllocSubstruct, AreLeftHeaderSpritesMoving, BgDmaFill, BlendRegionMap, CopyPaletteIntoBufferUnfaded, CopyToBgTilemapBufferRect, CreateLoopedTask, CreateRegionMapCursor, CreateRegionMapPlayerIcon, DecompressAndCopyTileDataToVram, DoRegionMapInputCallback, FadeToBlackExceptPrimary, FreePokenavSubstruct, FreeRegionMapIconResources, FreeTempTileDataBuffersIfPossible, FuncIsActiveLoopedTask, GetBgY, GetSubstructPtr, InitBgTemplates, InitRegionMapData, IsEventIslandMapSecId, IsLoopedTaskActive, IsPaletteFadeActive, IsRegionMapZoomed, LZ77UnCompWram, LoadLeftHeaderGfxForIndex, LoadRegionMapGfx, MainMenuLoopedTaskIsBusy, PokenavFadeScreen, Pokenav_AllocAndLoadPalettes, PrintHelpBarText, PutWindowRectTilemap, SetBgMode, SetBgTilemapBuffer, SetLeftHeaderSpritesInvisibility, SetPokenavVBlankCallback, SetRegionMapDataForZoom, SetVBlankCallback_, ShowLeftHeaderGfx, SlideMenuHeaderDown, TrySetPlayerIconBlink, UpdateRegionMapRightHeaderTiles, UpdateRegionMapVideoRegs, UpdateRegionMapZoom, WaitForHelpBar, gRegionMapCityZoomText_Gfx, gRegionMapCityZoomTiles_Pal, sPokenavCityMaps
membres retirés (1) : OamData

## erreurs restantes (10)
- :249 TS2322 Type 'boolean' is not assignable to type 'number'.
- :251 TS2322 Type 'boolean' is not assignable to type 'number'.
- :252 TS18047 'gMapHeader' is possibly 'null'.
- :257 TS2322 Type 'boolean' is not assignable to type 'number'.
- :349 TS2554 Expected 1 arguments, but got 0.
- :550 TS2345 Argument of type 'Uint8Array<ArrayBufferLike>' is not assignable to parameter of type 'number'.
- :624 TS2322 Type 'boolean' is not assignable to type 'number'.
- :636 TS2365 Operator '>=' cannot be applied to types 'void' and 'number'.
- :645 TS2365 Operator '<=' cannot be applied to types 'void' and 'number'.
- :740 TS2339 Property 'oam' does not exist on type 'DecompSprite'.