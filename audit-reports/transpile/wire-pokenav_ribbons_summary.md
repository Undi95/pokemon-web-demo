# wire src/pokenav_ribbons_summary.ts — 2026-07-04T21:23:09.635Z

imports auto : ../include/gba/types
wireTodo (30) : AFFINEANIMCMD_END, AFFINEANIMCMD_FRAME, AllocSubstruct, BgDmaFill, CopyPaletteIntoBufferUnfaded, CopyToBgTilemapBufferRect, CreateLoopedTask, CreateMonPicSprite_HandleDeoxys, DecompressAndCopyTileDataToVram, FreePokenavSubstruct, FreeSpriteOamMatrix, FreeTempTileDataBuffersIfPossible, GetBoxMonData, GetBoxMonDataAt, GetSubstructPtr, InitBgTemplates, IsLoopedTaskActive, IsPaletteFadeActive, PokenavFadeScreen, PokenavFillPalette, Pokenav_AllocAndLoadPalettes, PrintHelpBarText, SetBgTilemapBuffer, gGiftRibbonDescriptionPointers, gKeyRepeatContinueDelay, gKeyRepeatStartDelay, gPokenavRibbonsSummaryBg_Gfx, gPokenavRibbonsSummaryBg_Pal, gPokenavRibbonsSummaryBg_Tilemap, gRibbonDescriptionPointers
membres retirés (1) : OamData

## erreurs restantes (50)
- :336 TS2588 Cannot assign to 'gKeyRepeatContinueDelay' because it is a constant.
- :337 TS2588 Cannot assign to 'gKeyRepeatStartDelay' because it is a constant.
- :519 TS2554 Expected 2 arguments, but got 3.
- :527 TS2345 Argument of type 'Pokemon | null' is not assignable to parameter of type 'Pokemon'.
- :528 TS2345 Argument of type 'Pokemon | null' is not assignable to parameter of type 'Pokemon'.
- :543 TS2322 Type 'string | number' is not assignable to type 'number'.
- :544 TS2322 Type 'string | number' is not assignable to type 'number'.
- :545 TS2322 Type 'string | number' is not assignable to type 'number'.
- :563 TS2322 Type 'string | number' is not assignable to type 'number'.
- :576 TS2322 Type 'string | number' is not assignable to type 'number'.
- :585 TS2339 Property 'numBits' does not exist on type '(number | boolean)[]'.
- :586 TS2339 Property 'isGiftRibbon' does not exist on type '(number | boolean)[]'.
- :589 TS2339 Property 'ribbonId' does not exist on type '(number | boolean)[]'.
- :594 TS2339 Property 'ribbonId' does not exist on type '(number | boolean)[]'.
- :596 TS2339 Property 'numBits' does not exist on type '(number | boolean)[]'.
- :931 TS2345 Argument of type 'string' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'.
- :933 TS2345 Argument of type 'Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'readonly number[]'.
- :951 TS2345 Argument of type 'Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'readonly number[]'.
- :965 TS2345 Argument of type 'Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'readonly number[]'.
- :1043 TS2345 Argument of type '(never[] | { bg: number; tilemapLeft: number; tilemapTop: number; width: number; height: number; paletteNum: number; baseBlock: number; })[]' is not assignable to parameter of type 'WindowTemplate'.
- :1093 TS2532 Object is possibly 'undefined'.
- :1093 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :1099 TS2345 Argument of type 'DecompSprite | undefined' is not assignable to parameter of type 'DecompSprite'.
- :1108 TS2345 Argument of type 'DecompSprite | undefined' is not assignable to parameter of type 'DecompSprite'.
- :1115 TS2532 Object is possibly 'undefined'.
- :1160 TS2345 Argument of type 'number' is not assignable to parameter of type '{ v: number; }'.
- :1163 TS2345 Argument of type 'number' is not assignable to parameter of type '{ v: number; }'.
- :1337 TS2339 Property 'palNumOffset' does not exist on type 'number[]'.
- :1338 TS2339 Property 'tileNumOffset' does not exist on type 'number[]'.
- :1438 TS2322 Type 'DecompSprite | undefined' is not assignable to type 'DecompSprite | null'.
- :1439 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1450 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1451 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1454 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1454 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :1454 TS2339 Property 'tileNumOffset' does not exist on type 'number[]'.
- :1455 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1455 TS2339 Property 'oam' does not exist on type 'DecompSprite'.
- :1455 TS2339 Property 'palNumOffset' does not exist on type 'number[]'.
- :1457 TS2345 Argument of type 'DecompSprite | null' is not assignable to parameter of type 'DecompSprite'.
- :1458 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1459 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1459 TS2322 Type 'boolean' is not assignable to type 'number'.
- :1460 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1467 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1467 TS2322 Type 'boolean' is not assignable to type 'number'.
- :1468 TS2345 Argument of type 'DecompSprite | null' is not assignable to parameter of type 'DecompSprite'.
- :1469 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1474 TS18047 'menu.bigRibbonSprite' is possibly 'null'.
- :1481 TS2322 Type 'number' is not assignable to type 'boolean'.