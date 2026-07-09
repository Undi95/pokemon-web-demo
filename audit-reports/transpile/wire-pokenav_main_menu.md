# wire src/pokenav_main_menu.ts — 2026-07-04T21:20:52.137Z

imports auto : ../include/gba/types
wireTodo (19) : AllocSubstruct, CreateLoopedTask, DecompressAndCopyTileDataToVram, FreeMenuHandlerSubstruct2, FreeTempTileDataBuffersIfPossible, GetBgY, GetSubstructPtr, IsLoopedTaskActive, LZ77UnCompWram, RequestDma3Copy, ResetBgPositions, ResetBldCnt_, SetBgTilemapBuffer, gDecompressionBuffer, gPokenavHeader_Gfx, gPokenavHeader_Pal, gPokenavHeader_Tilemap, gPokenavLeftHeaderHoennMap_Gfx, gPokenavLeftHeader_Pal
membres retirés (1) : OamData

## erreurs restantes (14)
- :428 TS2365 Operator '>=' cannot be applied to types 'void' and 'number'.
- :439 TS2365 Operator '<=' cannot be applied to types 'void' and 'number'.
- :534 TS2322 Type 'number | boolean' is not assignable to type 'boolean'.
- :548 TS2356 An arithmetic operand must be of type 'any', 'number', 'bigint' or an enum type.
- :548 TS2345 Argument of type 'number' is not assignable to parameter of type 'BgTemplate'.
- :554 TS7053 Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ bg: { bg: number; tilemapLeft: number; tilemapTop: number; width: number; height: number; paletteNum: number; baseBlock: number; }; tilemapLeft: BattleWindowTemplate; }'.
- :565 TS2345 Argument of type 'Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'readonly number[]'.
- :679 TS7053 Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
- :680 TS7053 Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
- :682 TS7053 Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
- :684 TS7053 Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
- :694 TS7053 Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
- :695 TS7053 Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
- :697 TS7053 Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.