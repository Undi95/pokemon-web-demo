# wire src/pokenav_match_call_gfx.ts — 2026-07-04T21:21:12.096Z

imports auto : ../include/gba/types
wireTodo (67) : AllocSubstruct, AreLeftHeaderSpritesMoving, BgDmaFill, BufferMatchCallNameAndDesc, CheckForSpaceForDma3Request, CopyPaletteIntoBufferUnfaded, CpuCopy32, CreateLoopedTask, CreatePokenavList, DecompressAndCopyTileDataToVram, DecompressPicFromTable, DestroyPokenavList, DrawMatchCallTextBoxBorder, FadeToBlackExceptPrimary, FreePokenavSubstruct, FreeTempTileDataBuffersIfPossible, GetIndexDeltaOfNextCheckPageDown, GetIndexDeltaOfNextCheckPageUp, GetMatchCallList, GetMatchCallMapSec, GetMatchCallMessageText, GetMatchCallOptionCursorPos, GetMatchCallOptionId, GetMatchCallTrainerPic, GetNumberRegistered, GetSpinningPokenavSprite, GetSubstructPtr, HideSpinningPokenavSprite, InitBgTemplates, IsCreatePokenavListTaskActive, IsLoopedTaskActive, IsMatchCallListInitFinished, IsPaletteFadeActive, LT_SET_STATE, LZ77UnCompWram, LoadLeftHeaderGfxForIndex, LoadMatchCallWindowGfx, MainMenuLoopedTaskIsBusy, PokenavCopyPalette, PokenavFadeScreen, PokenavList_DrawCurrentItemIcon, PokenavList_EraseListForCheckPage, PokenavList_GetSelectedIndex, PokenavList_GetTopIndex, PokenavList_IsMoveWindowTaskActive, PokenavList_IsTaskActive, PokenavList_MoveCursorDown, PokenavList_MoveCursorUp, PokenavList_PageDown, PokenavList_PageUp, PokenavList_ReshowListFromCheckPage, PokenavList_ToggleVerticalArrows, Pokenav_AllocAndLoadPalettes, PrintCheckPageInfo, PrintHelpBarText, RequestDma3Copy, SetBgTilemapBuffer, SetLeftHeaderSpritesInvisibility, ShouldDrawRematchPokeballIcon, ShowLeftHeaderGfx, SlideMenuHeaderDown, WaitForHelpBar, gMatchCallUI_Gfx, gMatchCallUI_Pal, gMatchCallUI_Tilemap, gTrainerFrontPicPaletteTable, gTrainerFrontPicTable
membres retirés (1) : OamData

## erreurs restantes (17)
- :916 TS2322 Type 'boolean' is not assignable to type 'number'.
- :942 TS2365 Operator '+=' cannot be applied to types 'Uint16Array<ArrayBufferLike>' and 'number'.
- :959 TS2365 Operator '+=' cannot be applied to types 'Uint16Array<ArrayBufferLike>' and 'number'.
- :987 TS2345 Argument of type 'string' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'.
- :999 TS2345 Argument of type 'string' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'.
- :1034 TS2345 Argument of type 'string' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'.
- :1049 TS2345 Argument of type 'number' is not assignable to parameter of type 'string | Uint8Array<ArrayBufferLike>'.
- :1209 TS2322 Type 'DecompSprite | undefined' is not assignable to type 'DecompSprite | null'.
- :1216 TS2345 Argument of type 'DecompSprite | null' is not assignable to parameter of type 'number'.
- :1222 TS18047 'gfx.optionsCursorSprite' is possibly 'null'.
- :1237 TS2322 Type 'DecompSprite | undefined' is not assignable to type 'DecompSprite | null'.
- :1249 TS2345 Argument of type 'Uint8Array<ArrayBufferLike>' is not assignable to parameter of type 'string | number | Uint16Array<ArrayBufferLike>'.
- :1250 TS18047 'gfx.trainerPicSprite' is possibly 'null'.
- :1251 TS18047 'gfx.trainerPicSprite' is possibly 'null'.
- :1252 TS18047 'gfx.trainerPicSprite' is possibly 'null'.
- :1258 TS18047 'gfx.trainerPicSprite' is possibly 'null'.
- :1263 TS18047 'gfx.trainerPicSprite' is possibly 'null'.