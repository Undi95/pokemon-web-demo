# wire src/credits.ts — 2026-07-04T21:23:29.928Z

imports auto : ../include/gba/types
wireTodo (23) : CreateMonSpriteFromNationalDexNumber, GetStarterPokemon, InitHeap, LoadCreditsSceneGraphics, SetBgTilemapBuffer, SetCreditsSceneBgCnt, SoftReset, data, gBirchBagGrass_Gfx, gBirchBagGrass_Pal, gBirchGrassTilemap, gCreditsCopyrightEnd_Gfx, gCreditsCopyrightEnd_Tilemap, gDecompressionBuffer, gHeap, gIntroCopyright_Pal, gSpritePalettes_Credits, gSpriteSheet_CreditsBicycle, gSpriteSheet_CreditsBrendan, gSpriteSheet_CreditsMay, gSpriteSheet_CreditsRivalBrendan, gSpriteSheet_CreditsRivalMay, sCreditsEntryPointerTable
membres retirés (1) : OamData

## erreurs restantes (174)
- :174 TS2740 Type 'number[]' is missing the following properties from type 'CreditsData': monToShow, imgCounter, nextImgPos, currShownMon, and 4 more.
- :369 TS2554 Expected 1 arguments, but got 0.
- :377 TS2367 This comparison appears to be unintentional because the types '((task: DecompTask) => void) | null' and '(taskId: number) => void' have no overlap.
- :395 TS2345 Argument of type '{ bg: { bg: number; tilemapLeft: number; tilemapTop: number; width: number; height: number; paletteNum: number; baseBlock: number; }; tilemapLeft: BattleWindowTemplate; }' is not assignable to parameter of type 'readonly WindowTemplate[]'.
- :427 TS2345 Argument of type 'Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'readonly number[]'.
- :444 TS2322 Type 'boolean' is not assignable to type 'number'.
- :453 TS2339 Property 'tTaskId_BikeScene' does not exist on type 'DecompTask'.
- :484 TS2339 Property 'tTaskId_BikeScene' does not exist on type 'DecompTask'.
- :553 TS2632 Cannot assign to 'gReservedSpritePaletteCount' because it is an import.
- :571 TS2345 Argument of type '(never[] | { data: any; size: number; tag: number; })[]' is not assignable to parameter of type '{ data: Uint8Array<ArrayBufferLike>; size: number; tag: string | number; }'.
- :572 TS2345 Argument of type '(never[] | { data: any; tag: number; })[]' is not assignable to parameter of type '{ data: string | Uint8Array<ArrayBufferLike> | Uint16Array<ArrayBufferLike> | null | undefined; tag: string | number; }'.
- :577 TS2339 Property 'tTaskId_ShowMons' does not exist on type 'DecompTask'.
- :578 TS2339 Property 'tTaskId_ShowMons' does not exist on type 'DecompTask'.
- :579 TS2339 Property 'tTaskId_ShowMons' does not exist on type 'DecompTask'.
- :580 TS2339 Property 'tTaskId_ShowMons' does not exist on type 'DecompTask'.
- :588 TS2632 Cannot assign to 'gIntroCredits_MovingSceneryState' because it is an import.
- :716 TS2322 Type 'boolean' is not assignable to type 'number'.
- :729 TS2367 This comparison appears to be unintentional because the types '((task: DecompTask) => void) | null' and '(taskId: number) => void' have no overlap.
- :739 TS2322 Type 'boolean' is not assignable to type 'number'.
- :750 TS2322 Type 'boolean' is not assignable to type 'number'.
- :787 TS2322 Type 'boolean' is not assignable to type 'number'.
- :847 TS2322 Type 'boolean' is not assignable to type 'number'.
- :849 TS2322 Type 'boolean' is not assignable to type 'number'.
- :866 TS2367 This comparison appears to be unintentional because the types '((task: DecompTask) => void) | null' and '(taskId: number) => void' have no overlap.
- :872 TS2532 Object is possibly 'undefined'.
- :878 TS2532 Object is possibly 'undefined'.
- :910 TS2632 Cannot assign to 'gIntroCredits_MovingSceneryVOffset' because it is an import.
- :916 TS2632 Cannot assign to 'gIntroCredits_MovingSceneryVOffset' because it is an import.
- :921 TS2532 Object is possibly 'undefined'.
- :930 TS2632 Cannot assign to 'gIntroCredits_MovingSceneryVOffset' because it is an import.
- :938 TS2532 Object is possibly 'undefined'.
- :939 TS2532 Object is possibly 'undefined'.
- :958 TS2632 Cannot assign to 'gIntroCredits_MovingSceneryVOffset' because it is an import.
- :962 TS2532 Object is possibly 'undefined'.
- :970 TS2532 Object is possibly 'undefined'.
- :974 TS2532 Object is possibly 'undefined'.
- :978 TS2532 Object is possibly 'undefined'.
- :979 TS2532 Object is possibly 'undefined'.
- :1004 TS2339 Property 'tTaskId_BikeScene' does not exist on type 'DecompTask'.
- :1016 TS2339 Property 'tTaskId_BikeScene' does not exist on type 'DecompTask'.
- :1031 TS2339 Property 'tTaskId_BikeScene' does not exist on type 'DecompTask'.
- :1051 TS2532 Object is possibly 'undefined'.
- :1052 TS2532 Object is possibly 'undefined'.
- :1053 TS2532 Object is possibly 'undefined'.
- :1054 TS2532 Object is possibly 'undefined'.
- :1055 TS2532 Object is possibly 'undefined'.
- :1056 TS2532 Object is possibly 'undefined'.
- :1057 TS2532 Object is possibly 'undefined'.
- :1058 TS2532 Object is possibly 'undefined'.
- :1059 TS2339 Property 'tTaskId_BgScenery' does not exist on type 'DecompTask'.
- :1059 TS2554 Expected 5 arguments, but got 4.
- :1062 TS2532 Object is possibly 'undefined'.
- :1063 TS2532 Object is possibly 'undefined'.
- :1064 TS2532 Object is possibly 'undefined'.
- :1065 TS2532 Object is possibly 'undefined'.
- :1066 TS2532 Object is possibly 'undefined'.
- :1067 TS2532 Object is possibly 'undefined'.
- :1068 TS2532 Object is possibly 'undefined'.
- :1069 TS2532 Object is possibly 'undefined'.
- :1070 TS2339 Property 'tTaskId_BgScenery' does not exist on type 'DecompTask'.