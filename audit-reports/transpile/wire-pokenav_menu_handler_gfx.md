# wire src/pokenav_menu_handler_gfx.ts — 2026-07-04T21:22:09.673Z

imports auto : ../include/gba/defines, ../include/gba/types
wireTodo (40) : AFFINEANIMCMD_END, AFFINEANIMCMD_FRAME, AllocSubstruct, AreLeftHeaderSpritesMoving, CopyPaletteIntoBufferUnfaded, CreateLoopedTask, DecompressAndCopyTileDataToVram, FreePokenavSubstruct, FreeSpriteOamMatrix, FreeTempTileDataBuffersIfPossible, GetCurrentMenuItemId, GetHelpBarTextId, GetMatchTableMapSectionId, GetPokenavCursorPos, GetPokenavMenuType, GetSubstructPtr, GetWordTaskArg, HideMainOrSubMenuLeftHeader, InitBgTemplates, IsLoopedTaskActive, IsPaletteFadeActive, IsRematchEntryRegistered, LoadLeftHeaderGfxForIndex, PokenavCopyPalette, PokenavFadeScreen, Pokenav_AllocAndLoadPalettes, PrintHelpBarText, REG_WIN0H, SetBgTilemapBuffer, SetPokenavVBlankCallback, SetVBlankCallback_, SetWordTaskArg, ShowLeftHeaderGfx, SlideMenuHeaderUp, WaitForHelpBar, gPokenavMessageBox_Gfx, gPokenavMessageBox_Pal, gPokenavMessageBox_Tilemap, gPokenavOptions_Gfx, gPokenavOptions_Pal
membres retirés (1) : OamData

## erreurs restantes (16)
- :504 TS18047 'gMapHeader' is possibly 'null'.
- :937 TS2532 Object is possibly 'undefined'.
- :1216 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :1217 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :1217 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :1217 TS2554 Expected 3 arguments, but got 4.
- :1218 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :1219 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :1298 TS2362 The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
- :1316 TS2345 Argument of type 'number' is not assignable to parameter of type 'string | Uint8Array<ArrayBufferLike>'.
- :1318 TS2345 Argument of type 'Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'readonly number[]'.
- :1329 TS2345 Argument of type 'number' is not assignable to parameter of type 'string | Uint8Array<ArrayBufferLike>'.
- :1331 TS2345 Argument of type 'Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'readonly number[]'.
- :1396 TS2554 Expected 1 arguments, but got 0.
- :1453 TS2345 Argument of type 'Uint16Array<ArrayBufferLike>' is not assignable to parameter of type 'number'.
- :1454 TS2345 Argument of type 'Uint16Array<ArrayBufferLike>' is not assignable to parameter of type 'number'.