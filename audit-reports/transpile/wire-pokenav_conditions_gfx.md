# wire src/pokenav_conditions_gfx.ts — 2026-07-04T21:19:51.785Z

imports auto : —
wireTodo (66) : AllocSubstruct, AreLeftHeaderSpritesMoving, BgDmaFill, BufferMonMarkingsMenuTiles, ConditionGraph_Draw, ConditionGraph_InitResetScanline, ConditionGraph_InitWindow, ConditionGraph_ResetScanline, ConditionGraph_SetNewPositions, ConditionGraph_TryUpdate, ConditionMenu_UpdateMonEnter, ConditionMenu_UpdateMonExit, CopyPaletteIntoBufferUnfaded, CopyToBgTilemapBufferRect, CreateConditionSparkleSprites, CreateLoopedTask, CreateMonMarkingAllCombosSprite, DecompressAndCopyTileDataToVram, DestroyConditionSparkleSprites, DmaCopy16Defvars, FreeConditionSparkles, FreeMonMarkingsMenu, FreePokenavSubstruct, FreeTempTileDataBuffersIfPossible, GetConditionGraphCurrentListIndex, GetConditionGraphMenuCurrentLoadIndex, GetConditionGraphPtr, GetConditionMonDataBuffer, GetConditionMonLocationText, GetConditionMonNameText, GetConditionMonPal, GetConditionMonPicGfx, GetMonListCount, GetNumConditionMonSparkles, GetSubstructPtr, InitBgTemplates, InitMonMarkingsMenu, IsConditionMenuSearchMode, IsLoopedTaskActive, IsPaletteFadeActive, LoadConditionGraphMenuGfx, LoadConditionMonPicTemplate, LoadConditionSelectionIcons, LoadConditionSparkle, LoadLeftHeaderGfxForIndex, LoadNextConditionMenuMonData, MainMenuLoopedTaskIsBusy, MoveConditionMonOffscreen, OpenMonMarkingsMenu, PokenavFadeScreen, PokenavFillPalette, Pokenav_AllocAndLoadPalettes, PrintHelpBarText, ResetConditionSparkleSprites, SetBgTilemapBuffer, SetLeftHeaderSpritesInvisibility, SetPokenavVBlankCallback, SetVBlankCallback_, ShowLeftHeaderGfx, SlideMenuHeaderDown, TryGetMonMarkId, WaitForHelpBar, gPokenavCondition_Gfx, gPokenavCondition_Pal, gPokenavCondition_Tilemap, gPokenavOptions_Tilemap
membres retirés (0) : —

## erreurs restantes (23)
- :373 TS2367 This comparison appears to be unintentional because the types 'boolean' and 'number' have no overlap.
- :495 TS2367 This comparison appears to be unintentional because the types 'boolean' and 'number' have no overlap.
- :539 TS2367 This comparison appears to be unintentional because the types 'boolean' and 'number' have no overlap.
- :582 TS2367 This comparison appears to be unintentional because the types 'boolean' and 'number' have no overlap.
- :626 TS2345 Argument of type 'string' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'.
- :658 TS2345 Argument of type 'number' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'.
- :660 TS2345 Argument of type 'number' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'.
- :703 TS2345 Argument of type 'DecompSprite' is not assignable to parameter of type 'AnimDispatchSprite'.
- :705 TS2345 Argument of type 'DecompSprite' is not assignable to parameter of type 'AnimDispatchSprite'.
- :711 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :713 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :718 TS2345 Argument of type 'DecompSprite' is not assignable to parameter of type 'AnimDispatchSprite'.
- :759 TS2532 Object is possibly 'undefined'.
- :760 TS2532 Object is possibly 'undefined'.
- :776 TS2532 Object is possibly 'undefined'.
- :776 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :790 TS2532 Object is possibly 'undefined'.
- :790 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :791 TS2532 Object is possibly 'undefined'.
- :791 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :809 TS2345 Argument of type 'DecompSprite | null' is not assignable to parameter of type 'number'.
- :884 TS2532 Object is possibly 'undefined'.
- :900 TS2554 Expected 1 arguments, but got 0.