# Paires décomp↔port — `party_menu.c`

Généré : 2026-05-19T12:30:42.472Z

> ⚠️ Pairing statique pour relecture BORNÉE. NE PROUVE PAS le comportement.

56 fonction(s) décomp citée(s) (sur 354 fonctions du fichier).

## Index des paires

- `AllocPartyMenuBg` (party_menu.c:710-729) ‖ src/engine/party-screen.ts:136, src/engine/party-screen.ts:_initPartyBgs, src/engine/party-screen.ts:_loadPartyGraphicsCb2
- `AllocPartyMenuBgGfx` (party_menu.c:730-778) ‖ src/engine/party-screen.ts:137, src/engine/party-screen.ts:_loadAssets, src/engine/party-screen.ts:_loadPartyGraphicsCb2
- `PartyPaletteBufferCopy` (party_menu.c:779-785) ‖ src/engine/party-screen.ts:_loadPartyGraphicsCb2
- `RenderPartyMenuBox` (party_menu.c:824-871) ‖ src/engine/party-screen.ts:AnimatePartySlot
- `DisplayPartyPokemonData` (party_menu.c:872-890) ‖ src/engine/party-screen.ts:_drawSlot, src/engine/party-screen.ts:_displayPartyPokemonData
- `CreateCancelConfirmPokeballSprites` (party_menu.c:1097-1119) ‖ src/engine/party-screen.ts:CB2_InitPartyMenu
- `AnimatePartySlot` (party_menu.c:1120-1164) ‖ src/engine/party-screen.ts:AnimatePartySlot
- `GetPartyBoxPaletteFlags` (party_menu.c:1165-1187) ‖ src/engine/party-screen.ts:_getPartyBoxPaletteFlags
- `Task_ClosePartyMenuAndSetCB2` (party_menu.c:1231-1248) ‖ src/engine/party-screen.ts:268, src/engine/party-screen.ts:Task_ClosePartyMenu
- `Task_HandleChooseMonInput` (party_menu.c:1259-1283) ‖ src/engine/party-screen.ts:Task_PartyMenu_HandleInput
- `HandleChooseMonSelection` (party_menu.c:1292-1367) ‖ src/engine/party-screen.ts:Task_PartyMenu_HandleInput
- `PartyMenuButtonHandler` (party_menu.c:1455-1504) ‖ src/engine/party-screen.ts:1297
- `UpdateCurrentPartySelection` (party_menu.c:1505-1522) ‖ src/engine/party-screen.ts:_partyMenuButtonHandler
- `UpdatePartySelectionSingleLayout` (party_menu.c:1523-1587) ‖ src/engine/party-screen.ts:_updateSlotIdSingle
- `GetMonAilment` (party_menu.c:1924-1937) ‖ src/engine/party-screen.ts:_ailmentFromStatus
- `InitPartyMenuWindows` (party_menu.c:2074-2100) ‖ src/engine/party-screen.ts:68, src/engine/party-screen.ts:_loadPartyWindowsCb2
- `CreateCancelConfirmWindows` (party_menu.c:2101-2144) ‖ src/engine/party-screen.ts:_drawCancelButtonWindow
- `BlitBitmapToPartyWindow` (party_menu.c:2150-2166) ‖ src/engine/party-screen.ts:_blitSlotFrame
- `DrawEmptySlot` (party_menu.c:2193-2204) ‖ src/engine/party-screen.ts:_loadPartyBoxPalSet
- `LoadPartyBoxPalette` (party_menu.c:2205-2281) ‖ src/engine/party-screen.ts:_loadPartyBoxPalette
- `DisplayPartyPokemonBarDetail` (party_menu.c:2282-2286) ‖ src/engine/party-screen.ts:_drawSlot
- `DisplayPartyPokemonLevelCheck` (party_menu.c:2300-2314) ‖ src/engine/party-screen.ts:_drawSlot
- `DisplayPartyPokemonGender` (party_menu.c:2333-2355) ‖ src/engine/party-screen.ts:_drawSlot
- `DisplayPartyPokemonHP` (party_menu.c:2367-2376) ‖ src/engine/party-screen.ts:_drawSlot
- `DisplayPartyPokemonHPBar` (party_menu.c:2402-2435) ‖ src/engine/party-screen.ts:_drawHpBar
- `DisplayPartyMenuStdMessage` (party_menu.c:2459-2504) ‖ src/engine/party-screen.ts:_drawMsg
- `DisplaySelectionWindow` (party_menu.c:2524-2565) ‖ src/engine/party-screen.ts:1447, src/engine/party-screen.ts:_renderActionMenuContents
- `SetPartyMonFieldSelectionActions` (party_menu.c:2607-2638) ‖ src/engine/party-screen.ts:_openActionMenu
- `Task_TryCreateSelectionWindow` (party_menu.c:2731-2739) ‖ src/engine/party-screen.ts:CB2_InitPartyMenu
- `Task_HandleSelectionMenuInput` (party_menu.c:2740-2769) ‖ src/engine/party-screen.ts:_handleActionMenuInput
- `CursorCb_Summary` (party_menu.c:2770-2776) ‖ src/engine/party-screen.ts:_handleActionMenuInput
- `CB2_ShowPokemonSummaryScreen` (party_menu.c:2777-2789) ‖ src/engine/party-screen.ts:CB2_ShowPokemonSummaryScreen_Manual
- `CB2_ReturnToPartyMenuFromSummaryScreen` (party_menu.c:2790-2796) ‖ src/engine/party-screen.ts:278, src/engine/party-screen.ts:CB2_ReturnToPartyMenuFromSummary
- `CursorCb_Switch` (party_menu.c:2797-2821) ‖ src/engine/party-screen.ts:_drawMsg, src/engine/party-screen.ts:_cursorCbSwitch, src/engine/party-screen.ts:1679, src/engine/party-screen.ts:1687
- `SwitchSelectedMons` (party_menu.c:2822-2868) ‖ src/engine/party-screen.ts:_switchSelectedMons, src/engine/party-screen.ts:Task_PartyMenu_HandleInput
- `TryMovePartySlot` (party_menu.c:2869-2894) ‖ src/engine/party-screen.ts:1707
- `MoveAndBufferPartySlot` (party_menu.c:2895-2906) ‖ src/engine/party-screen.ts:_moveAndBufferPartySlot
- `MovePartyMenuBoxSprites` (party_menu.c:2907-2914) ‖ src/engine/party-screen.ts:_movePartyMenuBoxSprites
- `SlidePartyMenuBoxSpritesOneStep` (party_menu.c:2915-2924) ‖ src/engine/party-screen.ts:_slidePartyMenuBoxSpritesOneStep
- `SlidePartyMenuBoxOneStep` (party_menu.c:2925-2935) ‖ src/engine/party-screen.ts:_slidePartyMenuBoxOneStep
- `Task_SlideSelectedSlotsOffscreen` (party_menu.c:2936-2965) ‖ src/engine/party-screen.ts:_taskSlideSelectedSlotsOffscreen
- `Task_SlideSelectedSlotsOnscreen` (party_menu.c:2966-2994) ‖ src/engine/party-screen.ts:_taskSlideSelectedSlotsOnscreen
- `SwitchMenuBoxSprites` (party_menu.c:2995-3015) ‖ src/engine/party-screen.ts:_switchMenuBoxSprites
- `SwitchPartyMon` (party_menu.c:3016-3037) ‖ src/engine/party-screen.ts:_switchSlotIconGraphics, src/engine/party-screen.ts:_switchPartyMon
- `FinishTwoMonAction` (party_menu.c:3038-3061) ‖ src/engine/party-screen.ts:_finishTwoMonAction
- `CreatePartyMonIconSprite` (party_menu.c:3928-3941) ‖ src/engine/party-screen.ts:_spawnIconOams
- `AnimateSelectedPartyIcon` (party_menu.c:3978-4002) ‖ src/engine/party-screen.ts:_animateSelectedPartyIcon
- `SpriteCB_BouncePartyMonIcon` (party_menu.c:4003-4015) ‖ src/engine/party-screen.ts:Task_PartyMenu_BounceIcon
- `CreatePartyMonHeldItemSprite` (party_menu.c:4021-4029) ‖ src/engine/party-screen.ts:_spawnHeldItemOams, src/engine/party-screen.ts:CB2_InitPartyMenu
- `UpdatePartyMonHeldItemSprite` (party_menu.c:4040-4044) ‖ src/engine/party-screen.ts:_updatePartyMonHeldItem
- `LoadHeldItemIcons` (party_menu.c:4061-4066) ‖ src/engine/party-screen.ts:_loadHeldItemGfx
- `CreatePartyMonPokeballSprite` (party_menu.c:4122-4127) ‖ src/engine/party-screen.ts:_spawnSlotPokeballOams
- `CreatePokeballButtonSprite` (party_menu.c:4138-4146) ‖ src/engine/party-screen.ts:_spawnCancelButtonOam
- `CreatePartyMonStatusSprite` (party_menu.c:4184-4192) ‖ src/engine/party-screen.ts:_spawnStatusOams, src/engine/party-screen.ts:CB2_InitPartyMenu
- `SetPartyMonAilmentGfx` (party_menu.c:4203-4207) ‖ src/engine/party-screen.ts:_updatePartyMonAilmentGfx
- `LoadPartyMenuAilmentGfx` (party_menu.c:4223-4228) ‖ src/engine/party-screen.ts:_loadStatusIconsGfx

## Paires détaillées

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ AllocPartyMenuBg  —  party_menu.c:710-729 (20 l)
▌ ‖ port: src/engine/party-screen.ts:136 (hors fonction)  ← cite "party_menu.c:719" @src/engine/party-screen.ts:136
▌ ‖ port: _initPartyBgs (src/engine/party-screen.ts:370-408)  ← cite "party_menu.c:715" @src/engine/party-screen.ts:370
▌ ‖ port: _loadPartyGraphicsCb2 (src/engine/party-screen.ts:410-449)  ← cite "party_menu.c:719" @src/engine/party-screen.ts:422
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:710-729 ────────────────────────────────────────
  710│ static bool8 AllocPartyMenuBg(void)
  711│ {
  712│     sPartyBgTilemapBuffer = Alloc(0x800);
  713│     if (sPartyBgTilemapBuffer == NULL)
  714│         return FALSE;
  715│ 
  716│     memset(sPartyBgTilemapBuffer, 0, 0x800);
  717│     ResetBgsAndClearDma3BusyFlags(0);
  718│     InitBgsFromTemplates(0, sPartyMenuBgTemplates, ARRAY_COUNT(sPartyMenuBgTemplates));
  719│     SetBgTilemapBuffer(1, sPartyBgTilemapBuffer);
  720│     ResetAllBgsCoordinates();
  721│     ScheduleBgCopyTilemapToVram(1);
  722│     SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
  723│     SetGpuReg(REG_OFFSET_BLDCNT, 0);
  724│     ShowBg(0);
  725│     ShowBg(1);
  726│     ShowBg(2);
  727│     return TRUE;
  728│ }
  729│ 
├─ PORT src/engine/party-screen.ts:370-408 ────────────────────────────────────────
  370│ /** 1:1 décomp `InitBgs` party_menu.c:715. */
  371│ function _initPartyBgs(rt: ReturnType<typeof getRuntime>): void {
  372│   if (!rt) return;
  373│   rt.SetGpuReg(0x00, 0);  // DISPCNT
  374│   rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  375│   rt.gba.vram.fill(0);
  376│   for (let i = 0; i < rt.gba.oam.length; i++) {
  377│     const oam = rt.gba.oam[i];
  378│     oam.visible = false; oam.x = 0; oam.y = 0;
  379│     oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  380│   }
  381│   for (let i = 0; i < 512; i++) {
  382│     rt.gPlttBufferUnfaded.set(i, 0);
  383│     rt.gPlttBufferFaded.set(i, 0);
  384│   }
  385│   // Direct PLTT clear (bypass bufferTransferDisabled).
  386│   for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  387│   for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
  388│   // 1:1 décomp BG templates (= party_menu.h:1).
  389│   const bg0c = rt.gba.bg(0).config;
  390│   bg0c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg0c.mapBaseIndex = PARTY_WIN_MAP_BASE;
  391│   bg0c.screenSize = 0; bg0c.paletteMode = 0; bg0c.priority = 1; bg0c.visible = true;
  392│   bg0c.hofs = 0; bg0c.vofs = 0;
  393│   const bg1c = rt.gba.bg(1).config;
  394│   bg1c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg1c.mapBaseIndex = PARTY_BG_MAP_BASE;
  395│   bg1c.screenSize = 0; bg1c.paletteMode = 0; bg1c.priority = 2; bg1c.visible = true;
  396│   bg1c.hofs = 0; bg1c.vofs = 0;
  397│   const bg2c = rt.gba.bg(2).config;
  398│   bg2c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg2c.mapBaseIndex = PARTY_OVERLAY_MAP_BASE;
  399│   bg2c.screenSize = 0; bg2c.paletteMode = 0; bg2c.priority = 0; bg2c.visible = true;
  400│   bg2c.hofs = 0; bg2c.vofs = 0;
  401│   rt.gba.bg(3).config.visible = false;
  402│   rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  403│   rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  404│   rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0);
  405│   rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400);
  406│   rt.SetGpuReg(0x50, 0);
  407│   ShowBg(0); ShowBg(1); ShowBg(2); HideBg(3);
  408│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ AllocPartyMenuBgGfx  —  party_menu.c:730-778 (49 l)
▌ ‖ port: src/engine/party-screen.ts:137 (hors fonction)  ← cite "party_menu.c:744" @src/engine/party-screen.ts:137
▌ ‖ port: _loadAssets (src/engine/party-screen.ts:325-368)  ← cite "party_menu.c:749" @src/engine/party-screen.ts:330
▌ ‖ port: _loadPartyGraphicsCb2 (src/engine/party-screen.ts:410-449)  ← cite "party_menu.c:749" @src/engine/party-screen.ts:430
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:730-778 ────────────────────────────────────────
  730│ static bool8 AllocPartyMenuBgGfx(void)
  731│ {
  732│     u32 sizeout;
  733│ 
  734│     switch (sPartyMenuInternal->data[0])
  735│     {
  736│     case 0:
  737│         sPartyBgGfxTilemap = malloc_and_decompress(gPartyMenuBg_Gfx, &sizeout);
  738│         LoadBgTiles(1, sPartyBgGfxTilemap, sizeout, 0);
  739│         sPartyMenuInternal->data[0]++;
  740│         break;
  741│     case 1:
  742│         if (!IsDma3ManagerBusyWithBgCopy())
  743│         {
  744│             LZDecompressWram(gPartyMenuBg_Tilemap, sPartyBgTilemapBuffer);
  745│             sPartyMenuInternal->data[0]++;
  746│         }
  747│         break;
  748│     case 2:
  749│         LoadCompressedPalette(gPartyMenuBg_Pal, BG_PLTT_ID(0), 11 * PLTT_SIZE_4BPP);
  750│         CpuCopy16(gPlttBufferUnfaded, sPartyMenuInternal->palBuffer, 11 * PLTT_SIZE_4BPP);
  751│         sPartyMenuInternal->data[0]++;
  752│         break;
  753│     case 3:
  754│         PartyPaletteBufferCopy(4);
  755│         sPartyMenuInternal->data[0]++;
  756│         break;
  757│     case 4:
  758│         PartyPaletteBufferCopy(5);
  759│         sPartyMenuInternal->data[0]++;
  760│         break;
  761│     case 5:
  762│         PartyPaletteBufferCopy(6);
  763│         sPartyMenuInternal->data[0]++;
  764│         break;
  765│     case 6:
  766│         PartyPaletteBufferCopy(7);
  767│         sPartyMenuInternal->data[0]++;
  768│         break;
  769│     case 7:
  770│         PartyPaletteBufferCopy(8);
  771│         sPartyMenuInternal->data[0]++;
  772│         break;
  773│     default:
  774│         return TRUE;
  775│     }
  776│     return FALSE;
  777│ }
  778│ 
├─ PORT src/engine/party-screen.ts:325-368 ────────────────────────────────────────
  325│ async function _loadAssets(): Promise<PartyAssets> {
  326│   if (_assets) return _assets;
  327│   if (_assetsLoading) return _assetsLoading;
  328│   _assetsLoading = (async () => {
  329│     // 1:1 décomp `LoadCompressedPalette(gPartyMenuBg_Pal, BG_PLTT_ID(0),
  330│     // 11 * PLTT_SIZE_4BPP)` (party_menu.c:749) : load 11 sub-palettes (= 176
  331│     // entries). Le bg.gbapal extrait par extract-all-tile-bins.mjs contient
  332│     // les 11 sub-palettes (= 352 bytes). loadIndexedPngStrict ne retourne
  333│     // que la PLTE chunk PNG (= 16 entries first sub-pal seul) → palette 1+
  334│     // restent vides → bg.bin entries paletteNum=1..10 rendent BLACK.
  335│     const fetchU8 = async (url: string): Promise<Uint8Array> => {
  336│       const r = await fetch(url);
  337│       if (!r.ok) throw new Error(`fetch failed ${url} → ${r.status}`);
  338│       return new Uint8Array(await r.arrayBuffer());
  339│     };
  340│     const [bgTilesRaw, bgTilemapBin, bgPalFull, slotMain, slotWide, slotWideEmpty, slotMainNoHp, slotWideNoHp] = await Promise.all([
  341│       loadTileBin('/decomp/em/party_menu/bg.png', 4),
  342│       loadTilemapBin('/decomp/em/party_menu/bg.bin'),
  343│       // 1:1 décomp FR `gPartyMenuBg_Pal` = bg.pal JASC text 176 entries
  344│       // (= 11 sub-palettes). Le PLTE chunk PNG ne contient que 16 entries
  345│       // (= sub-pal 0 only) — cf. doc loadIndexedPngStrict pour le pattern.
  346│       loadGbaPal('/decomp/em/party_menu/bg.pal'),
  347│       // 1:1 décomp `sSlotTilemap_Main/_Wide/_WideEmpty` (party_menu.h:565-569).
  348│       // Stride encoded dans `BlitBitmapToPartyWindow_LeftColumn` (= width arg).
  349│       fetchU8('/decomp/em/party_menu/slot_main.bin'),
  350│       fetchU8('/decomp/em/party_menu/slot_wide.bin'),
  351│       fetchU8('/decomp/em/party_menu/slot_wide_empty.bin'),
  352│       fetchU8('/decomp/em/party_menu/slot_main_no_hp.bin'),
  353│       fetchU8('/decomp/em/party_menu/slot_wide_no_hp.bin'),
  354│     ]);
  355│     _assets = {
  356│       bgTiles: bgTilesRaw,
  357│       bgTilemap: bgTilemapBin,
  358│       bgPalette: bgPalFull,  // 176 entries = palettes 0..10
  359│       slotMainTilemap: slotMain,
  360│       slotWideTilemap: slotWide,
  361│       slotWideEmptyTilemap: slotWideEmpty,
  362│       slotMainNoHpTilemap: slotMainNoHp,
  363│       slotWideNoHpTilemap: slotWideNoHp,
  364│     };
  365│     return _assets;
  366│   })();
  367│   return _assetsLoading;
  368│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ PartyPaletteBufferCopy  —  party_menu.c:779-785 (7 l)
▌ ‖ port: _loadPartyGraphicsCb2 (src/engine/party-screen.ts:410-449)  ← cite "party_menu.c:779" @src/engine/party-screen.ts:432
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:779-785 ────────────────────────────────────────
  779│ static void PartyPaletteBufferCopy(u8 palNum)
  780│ {
  781│     u8 offset = PLTT_ID(palNum);
  782│     CpuCopy16(&gPlttBufferUnfaded[BG_PLTT_ID(3)], &gPlttBufferUnfaded[offset], PLTT_SIZE_4BPP);
  783│     CpuCopy16(&gPlttBufferUnfaded[BG_PLTT_ID(3)], &gPlttBufferFaded[offset], PLTT_SIZE_4BPP);
  784│ }
  785│ 
├─ PORT src/engine/party-screen.ts:410-449 ────────────────────────────────────────
  410│ function _loadPartyGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
  411│   if (!rt) return false;
  412│   if (_graphicsReady) return true;
  413│   if (_graphicsLoading) return false;
  414│   _graphicsLoading = true;
  415│   void _loadAssets().then((assets) => {
  416│     const r = getRuntime();
  417│     if (!r) { _graphicsLoading = false; return; }
  418│     // Load tiles à charBase=0.
  419│     const charOff = PARTY_TILES_CHAR_BASE * 0x4000;
  420│     r.gba.vram.set(assets.bgTiles, charOff);
  421│     // 1:1 décomp `LZDecompressWram(gPartyMenuBg_Tilemap, sPartyBgTilemapBuffer)` +
  422│     // `SetBgTilemapBuffer(1, ...)` (party_menu.c:719,744) : bg.bin va à BG1
  423│     // mapBase=30, PAS BG2 mapBase=28. BG2 reste vide (= laisse BG0+BG1 transparaitre).
  424│     const bgMapOff = PARTY_BG_MAP_BASE * 0x800;
  425│     const bgBytes = new Uint8Array(
  426│       assets.bgTilemap.buffer, assets.bgTilemap.byteOffset, assets.bgTilemap.byteLength,
  427│     );
  428│     r.gba.vram.set(bgBytes, bgMapOff);
  429│     // 1:1 décomp `LoadCompressedPalette(gPartyMenuBg_Pal, BG_PLTT_ID(0),
  430│     // 11 * PLTT_SIZE_4BPP)` (party_menu.c:749) — load 11 sub-palettes (= 176 entries).
  431│     LoadPalette(assets.bgPalette, 0, assets.bgPalette.length * 2);
  432│     // 1:1 décomp `PartyPaletteBufferCopy(palNum)` (party_menu.c:779) : COPIE
  433│     // palette 3 (= la sub-pal "base" du slot 0 big) vers palettes 4..8 (=
  434│     // les slots wide 1-5). SANS ce step, palettes 4-8 utilisent les sub-pals
  435│     // 4-8 du bg.pal (= des couleurs différentes/roses) au lieu de la même
  436│     // sub-pal base que slot 0. Appelé pour palNum=4..8 sequentially.
  437│     for (let palNum = 4; palNum <= 8; palNum++) {
  438│       const src = new Uint16Array(16);
  439│       for (let k = 0; k < 16; k++) src[k] = assets.bgPalette[3 * 16 + k];
  440│       LoadPalette(src, palNum * 16, 32);
  441│     }
  442│     _graphicsReady = true;
  443│     _graphicsLoading = false;
  444│   }).catch((e) => {
  445│     console.error('[party-screen] graphics load failed:', e);
  446│     _graphicsLoading = false;
  447│   });
  448│   return false;
  449│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ RenderPartyMenuBox  —  party_menu.c:824-871 (48 l)
▌ ‖ port: AnimatePartySlot (src/engine/party-screen.ts:812-862)  ← cite "party_menu.c:842" @src/engine/party-screen.ts:843
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:824-871 ────────────────────────────────────────
  824│ static void RenderPartyMenuBox(u8 slot)
  825│ {
  826│     if (gPartyMenu.menuType == PARTY_MENU_TYPE_MULTI_SHOWCASE && slot >= MULTI_PARTY_SIZE)
  827│     {
  828│         DisplayPartyPokemonDataForMultiBattle(slot);
  829│         if (gMultiPartnerParty[slot - MULTI_PARTY_SIZE].species == SPECIES_NONE)
  830│             LoadPartyBoxPalette(&sPartyMenuBoxes[slot], PARTY_PAL_NO_MON);
  831│         else
  832│             LoadPartyBoxPalette(&sPartyMenuBoxes[slot], PARTY_PAL_MULTI_ALT);
  833│         CopyWindowToVram(sPartyMenuBoxes[slot].windowId, COPYWIN_GFX);
  834│         PutWindowTilemap(sPartyMenuBoxes[slot].windowId);
  835│         ScheduleBgCopyTilemapToVram(2);
  836│     }
  837│     else
  838│     {
  839│         if (GetMonData(&gPlayerParty[slot], MON_DATA_SPECIES) == SPECIES_NONE)
  840│         {
  841│             DrawEmptySlot(sPartyMenuBoxes[slot].windowId);
  842│             LoadPartyBoxPalette(&sPartyMenuBoxes[slot], PARTY_PAL_NO_MON);
  843│             CopyWindowToVram(sPartyMenuBoxes[slot].windowId, COPYWIN_GFX);
  844│         }
  845│         else
  846│         {
  847│             if (gPartyMenu.menuType == PARTY_MENU_TYPE_MOVE_RELEARNER)
  848│                 DisplayPartyPokemonDataForRelearner(slot);
  849│             else if (gPartyMenu.menuType == PARTY_MENU_TYPE_CONTEST)
  850│                 DisplayPartyPokemonDataForContest(slot);
  851│             else if (gPartyMenu.menuType == PARTY_MENU_TYPE_CHOOSE_HALF)
  852│                 DisplayPartyPokemonDataForChooseHalf(slot);
  853│             else if (gPartyMenu.menuType == PARTY_MENU_TYPE_MINIGAME)
  854│                 DisplayPartyPokemonDataForWirelessMinigame(slot);
  855│             else if (gPartyMenu.menuType == PARTY_MENU_TYPE_STORE_PYRAMID_HELD_ITEMS)
  856│                 DisplayPartyPokemonDataForBattlePyramidHeldItem(slot);
  857│             else if (!DisplayPartyPokemonDataForMoveTutorOrEvolutionItem(slot))
  858│                 DisplayPartyPokemonData(slot);
  859│ 
  860│             if (gPartyMenu.menuType == PARTY_MENU_TYPE_MULTI_SHOWCASE)
  861│                 AnimatePartySlot(slot, 0);
  862│             else if (gPartyMenu.slotId == slot)
  863│                 AnimatePartySlot(slot, 1);
  864│             else
  865│                 AnimatePartySlot(slot, 0);
  866│         }
  867│         PutWindowTilemap(sPartyMenuBoxes[slot].windowId);
  868│         ScheduleBgCopyTilemapToVram(0);
  869│     }
  870│ }
  871│ 
├─ PORT src/engine/party-screen.ts:812-862 ────────────────────────────────────────
  812│ /** 1:1 décomp `AnimatePartySlot` (party_menu.c:1120).
  813│  *  animNum=0 = not selected (default), animNum=1 = selected (cursor here).
  814│  *  Pour les mon slots, le décomp call aussi :
  815│  *    AnimateSelectedPartyIcon(monSpriteId, animNum)
  816│  *    PartyMenuStartSpriteAnim(pokeballSpriteId, animNum) ← pokeball Closed/Open */
  817│ function AnimatePartySlot(slotIdx: number, animNum: number): void {
  818│   const PARTY_SIZE = 6, CANCEL = PARTY_SIZE + 1;
  819│   if (slotIdx < PARTY_SIZE) {
  820│     const mon = (gameState.party as PokemonInstance[])[slotIdx];
  821│     if (mon) {
  822│       // 1:1 décomp AnimatePartySlot (party_menu.c:1129-1131) ordre EXACT :
  823│       //   LoadPartyBoxPalette(...) ; AnimateSelectedPartyIcon(monSpriteId,
  824│       //   animNum) ; PartyMenuStartSpriteAnim(pokeballSpriteId, animNum).
  825│       _loadPartyBoxPalette(slotIdx, _getPartyBoxPaletteFlags(slotIdx, animNum));
  826│       // L'ANIM MANQUANTE (bug #1) : décalage icône sélectionné/non-sélectionné.
  827│       _animateSelectedPartyIcon(slotIdx, animNum);
  828│       // 1:1 décomp `PartyMenuStartSpriteAnim(pokeballSpriteId, animNum)` :
  829│       // animNum=0 → Closed (tile 256), animNum=1 → Open (tile 272).
  830│       const rt = getRuntime();
  831│       const pkId = _pokeballOamBySlot[slotIdx];
  832│       if (rt && pkId >= 0) {
  833│         const spr = rt.gSprites.get(pkId);
  834│         if (spr) {
  835│           const oam = rt.gba.oam[spr.oamIndex];
  836│           if (oam) {
  837│             const POKEBALL_TILE_BASE = 256;
  838│             oam.tileId = POKEBALL_TILE_BASE + (animNum === 1 ? 16 : 0);
  839│           }
  840│         }
  841│       }
  842│     } else {
  843│       // 1:1 décomp `LoadPartyBoxPalette(box, PARTY_PAL_NO_MON)` (party_menu.c:842)
  844│       // pour slot vide → palette swap sPartyBoxNoMonPalIds aux positions
  845│       // sPartyBoxNoMonPalOffsets [1, 11, 12] (= teinte vert-olive match BG).
  846│       _loadPartyBoxPalette(slotIdx, PARTY_PAL_NO_MON);
  847│     }
  848│     return;
  849│   }
  850│   if (slotIdx === CANCEL) {
  851│     // Cancel button OAM frame swap : animNum=0 → frame Closed, animNum=1 → frame Open.
  852│     // 1:1 décomp PartyMenuStartSpriteAnim. Frame 0 = tile 0..15, frame 1 = tile 16..31.
  853│     const rt = getRuntime();
  854│     if (!rt || _cancelButtonOamId < 0) return;
  855│     const spr = rt.gSprites.get(_cancelButtonOamId);
  856│     if (!spr) return;
  857│     const oam = rt.gba.oam[spr.oamIndex];
  858│     if (!oam) return;
  859│     const POKEBALL_TILE_BASE = 256;
  860│     oam.tileId = POKEBALL_TILE_BASE + (animNum === 1 ? 16 : 0);
  861│   }
  862│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DisplayPartyPokemonData  —  party_menu.c:872-890 (19 l)
▌ ‖ port: _drawSlot (src/engine/party-screen.ts:554-648)  ← cite "party_menu.c:872" @src/engine/party-screen.ts:570
▌ ‖ port: _displayPartyPokemonData (src/engine/party-screen.ts:1697-1704)  ← cite "party_menu.c:872-889" @src/engine/party-screen.ts:1697
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:872-890 ────────────────────────────────────────
  872│ static void DisplayPartyPokemonData(u8 slot)
  873│ {
  874│     if (GetMonData(&gPlayerParty[slot], MON_DATA_IS_EGG))
  875│     {
  876│         sPartyMenuBoxes[slot].infoRects->blitFunc(sPartyMenuBoxes[slot].windowId, 0, 0, 0, 0, TRUE);
  877│         DisplayPartyPokemonNickname(&gPlayerParty[slot], &sPartyMenuBoxes[slot], 0);
  878│     }
  879│     else
  880│     {
  881│         sPartyMenuBoxes[slot].infoRects->blitFunc(sPartyMenuBoxes[slot].windowId, 0, 0, 0, 0, FALSE);
  882│         DisplayPartyPokemonNickname(&gPlayerParty[slot], &sPartyMenuBoxes[slot], 0);
  883│         DisplayPartyPokemonLevelCheck(&gPlayerParty[slot], &sPartyMenuBoxes[slot], 0);
  884│         DisplayPartyPokemonGenderNidoranCheck(&gPlayerParty[slot], &sPartyMenuBoxes[slot], 0);
  885│         DisplayPartyPokemonHPCheck(&gPlayerParty[slot], &sPartyMenuBoxes[slot], 0);
  886│         DisplayPartyPokemonMaxHPCheck(&gPlayerParty[slot], &sPartyMenuBoxes[slot], 0);
  887│         DisplayPartyPokemonHPBarCheck(&gPlayerParty[slot], &sPartyMenuBoxes[slot]);
  888│     }
  889│ }
  890│ 
├─ PORT src/engine/party-screen.ts:554-648 ────────────────────────────────────────
  554│ /** Render text for slot N. Positions 1:1 décomp `sPartyBoxInfoRects`
  555│  *  (party_menu.h:32) — Nickname/Level/HP/MaxHP fixed coords per box layout. */
  556│ function _drawSlot(slotIdx: number): void {
  557│   if (_slotWindowIds[slotIdx] === undefined) return;
  558│   const wid = _slotWindowIds[slotIdx];
  559│   const mon = (gameState.party as PokemonInstance[])[slotIdx];
  560│   // 1:1 décomp RenderPartyMenuBox → SetPartyMonAilmentGfx + UpdatePartyMon
  561│   // HeldItemSprite : rafraîchit icône statut + objet tenu du slot (sprites
  562│   // slot-pinned, dérivés du mon courant).
  563│   _updatePartyMonAilmentGfx(slotIdx);
  564│   _updatePartyMonHeldItem(slotIdx);
  565│   if (!mon) {
  566│     // Slot vide : no text (= just empty frame déjà blit).
  567│     CopyWindowToVram(wid, 3);
  568│     return;
  569│   }
  570│   // 1:1 décomp `DisplayPartyPokemonData` (party_menu.c:872) : un ŒUF
  571│   // n'affiche QUE le nickname (= "OEUF", GetMonNickname égg → gText_Egg
  572│   // Nickname) — PAS de niveau / genre / PV / barre PV (blitFunc(.,TRUE)
  573│   // blanchit ces zones). Le sprite icône = l'icône d'œuf (cf. _loadSlotIcon).
  574│   if (mon.isEgg) {
  575│     const eggName = getString('gText_EggNickname');  // "OEUF" (strings.c:21)
  576│     if (slotIdx === 0) {
  577│       AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  578│     } else {
  579│       AddTextPrinterParameterized3(wid, FONT_SMALL, 22, 3, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  580│     }
  581│     CopyWindowToVram(wid, 3);
  582│     return;
  583│   }
  584│   // 1:1 décomp DisplayPartyPokemonGender (party_menu.c:2333) : symbol "♂"/"♀"
  585│   // affiché à (64, 20) slot 0 left column ou (62, 12) slot 1-5 right column,
  586│   // AVEC palette swap genderMale/Female aux positions TEXT_DYNAMIC_COLOR_2/3
  587│   // de la sub-pal du slot. Color triple stays [0, 0xB, 0xC] for both genders.
  588│   const gSym = getMonGenderSymbol(mon);
  589│   const genderStr = gSym === 'M' ? '♂' : gSym === 'F' ? '♀' : '';
  590│   if (genderStr) {
  591│     const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum ?? 3;
  592│     _loadGenderColors(slotPalNum, gSym === 'M');
  593│   }
  594│   // 1:1 décomp DisplayPartyPokemonLevelCheck (party_menu.c:2300-2312) : le
  595│   // NIVEAU n'est dessiné QUE si ailment ∈ {AILMENT_NONE(0), AILMENT_PKRS(6)}.
  596│   // Tout autre statut (PSN/PAR/SLP/FRZ/BRN) ou K.O. (HP=0=FNT) → niveau
  597│   // BLANC, laissant la place à l'icône statut 32×8 (sinon : pixels du
  598│   // niveau derrière l'icône burn = le bug rapporté). Genre/PV/barre NON
  599│   // suppressés (1:1 :2323/:2356 — aucun check ailment).
  600│   const _lvA = _ailmentFromStatus(mon);
  601│   const showLevel = _lvA === 0 || _lvA === 6;
  602│   if (slotIdx === 0) {
  603│     // 1:1 décomp PARTY_BOX_LEFT_COLUMN (party_menu.h:32) :
  604│     //   Nickname (24, 11) — width=40
  605│     //   Level    (32, 20) — "N.X"
  606│     //   Gender   (64, 20) — width 8x8
  607│     //   HP       (38, 37)
  608│     //   MaxHP    (53, 37)
  609│     // 1:1 décomp DisplayPartyPokemonBarDetail (party_menu.c:2282) :
  610│     //   AddTextPrinterParameterized3(windowId, FONT_SMALL, ...) — TOUT en FONT_SMALL.
  611│     AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  612│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  32, 20, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  613│     if (genderStr) {
  614│       AddTextPrinterParameterized3(wid, FONT_SMALL, 64, 20, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  615│     }
  616│     // 1:1 décomp DisplayPartyPokemonHP (party_menu.c:2367) + DisplayParty
  617│     // PokemonMaxHP (:2388) : DEUX AddTextPrinterParameterized3 FONT_SMALL
  618│     // SÉPARÉS aux coords sPartyBoxInfoRects[PARTY_BOX_LEFT_COLUMN] (party_
  619│     // menu.h:42-43) : dimensions[12]=(38,37) HP, dimensions[16]=(53,37) MaxHP.
  620│     //   HP    = ConvertIntToDecimalStringN(hp,    RIGHT_ALIGN, 3) + "/"
  621│     //   MaxHP = "/" + ConvertIntToDecimalStringN(maxhp, RIGHT_ALIGN, 3)
  622│     // L'overlap des 2 "/" (FONT_SMALL widths = ROM exacts : sp 3, digit 5,
  623│     // '/' 5 — vérifiés vs gFontSmallLatinGlyphWidths fonts.c:40) produit le
  624│     // visuel ROM 1:1. PLUS de hack 1-string / espaces hardcodés.
  625│     AddTextPrinterParameterized3(wid, FONT_SMALL, 38, 37, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  626│     AddTextPrinterParameterized3(wid, FONT_SMALL, 53, 37, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  627│   } else {
  628│     // 1:1 décomp PARTY_BOX_RIGHT_COLUMN :
  629│     //   Nickname (22, 3) — width=40
  630│     //   Level    (30, 12)
  631│     //   Gender   (62, 12)
  632│     //   HP       dimensions[12]=(102, 12)  MaxHP dimensions[16]=(117, 12)
  633│     AddTextPrinterParameterized3(wid, FONT_SMALL, 22,  3, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  634│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  30, 12, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  635│     if (genderStr) {
  636│       AddTextPrinterParameterized3(wid, FONT_SMALL, 62, 12, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  637│     }
  638│     // 1:1 décomp DisplayPartyPokemonHP/MaxHP — 2 strings FONT_SMALL séparés
  639│     // aux coords sPartyBoxInfoRects[PARTY_BOX_RIGHT_COLUMN] (party_menu.h:56-57).
  640│     AddTextPrinterParameterized3(wid, FONT_SMALL, 102, 12, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  641│     AddTextPrinterParameterized3(wid, FONT_SMALL, 117, 12, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  642│   }
  643│   void MON_MALE; void MON_FEMALE;  // referenced via getMonGenderSymbol
  644│   // 1:1 décomp DisplayPartyPokemonHPBar : draw colored bar fill (green/yellow/
  645│   // red selon HP fraction) avec palette swap aux positions 9-10 de la sub-pal.
  646│   _drawHpBar(slotIdx, mon);
  647│   CopyWindowToVram(wid, 3);
  648│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CreateCancelConfirmPokeballSprites  —  party_menu.c:1097-1119 (23 l)
▌ ‖ port: CB2_InitPartyMenu (src/engine/party-screen.ts:1940-2038)  ← cite "party_menu.c:1116" @src/engine/party-screen.ts:2006
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1097-1119 ────────────────────────────────────────
 1097│ static void CreateCancelConfirmPokeballSprites(void)
 1098│ {
 1099│     if (gPartyMenu.menuType == PARTY_MENU_TYPE_MULTI_SHOWCASE)
 1100│     {
 1101│         // The showcase has no Cancel/Confirm buttons
 1102│         FillBgTilemapBufferRect(1, 14, 23, 17, 7, 2, 1);
 1103│     }
 1104│     else
 1105│     {
 1106│         if (sPartyMenuInternal->chooseHalf)
 1107│         {
 1108│             sPartyMenuInternal->spriteIdConfirmPokeball = CreateSmallPokeballButtonSprite(0xBF, 0x88);
 1109│             DrawCancelConfirmButtons();
 1110│             sPartyMenuInternal->spriteIdCancelPokeball = CreateSmallPokeballButtonSprite(0xBF, 0x98);
 1111│         }
 1112│         else
 1113│         {
 1114│             sPartyMenuInternal->spriteIdCancelPokeball = CreatePokeballButtonSprite(198, 148);
 1115│         }
 1116│         AnimatePartySlot(gPartyMenu.slotId, 1);
 1117│     }
 1118│ }
 1119│ 
├─ PORT src/engine/party-screen.ts:1940-2038 ────────────────────────────────────────
 1940│ export function CB2_InitPartyMenu(): void {
 1941│   const rt = getRuntime();
 1942│   if (!rt) return;
 1943│   switch (rt.gMain.state) {
 1944│     case 0: rt.SetVBlankCallback(null); rt.gMain.state++; break;
 1945│     case 1: rt.gMain.state++; break;
 1946│     case 2: rt.gMain.state++; break;
 1947│     case 3:
 1948│       ResetPaletteFade();
 1949│       rt.gPaletteFade.bufferTransferDisabled = true;
 1950│       rt.gMain.state++; break;
 1951│     case 4: ResetSpriteData(); rt.gMain.state++; break;
 1952│     case 5: rt.gMain.state++; break;
 1953│     case 6: ResetTasks(); rt.gMain.state++; break;
 1954│     case 7:
 1955│       _initPartyBgs(rt);
 1956│       _graphicsReady = false; _graphicsLoading = false;
 1957│       _windowsReady = false; _windowsLoading = false;
 1958│       rt.gMain.state++; break;
 1959│     case 8:
 1960│       if (!_loadPartyGraphicsCb2(rt)) break;
 1961│       rt.gMain.state++; break;
 1962│     case 9:
 1963│       if (!_windowsReady) {
 1964│         if (!_windowsLoading) {
 1965│           _windowsLoading = true;
 1966│           void _loadPartyWindowsCb2(rt).then(() => {
 1967│             _windowsReady = true;
 1968│             _windowsLoading = false;
 1969│           });
 1970│         }
 1971│         break;
 1972│       }
 1973│       rt.gMain.state++; break;
 1974│     case 10: _phase = 'open'; rt.gMain.state++; break;
 1975│     case 11: _drawAllSlots(); _drawMsg(); _drawCancelButtonWindow(); rt.gMain.state++; break;
 1976│     case 12:
 1977│       _inputTaskId = rt.CreateTask(Task_PartyMenu_HandleInput, 0);
 1978│       // 1:1 décomp : reset état d'anim icône par slot (animDelayCounter /
 1979│       // animCmdIndex / animNum=0 sAnim_0 / mode). AnimatePartySlot (case 14)
 1980│       // posera ensuite le mode + décalage sélection/désélection.
 1981│       _iconAnimDelay = [0, 0, 0, 0, 0, 0];
 1982│       _iconAnimCmdIdx = [0, 0, 0, 0, 0, 0];
 1983│       _iconAnimNum = [0, 0, 0, 0, 0, 0];
 1984│       _iconMode = [0, 0, 0, 0, 0, 0];
 1985│       _bounceTaskId = rt.CreateTask(Task_PartyMenu_BounceIcon, 1);
 1986│       rt.gMain.state++; break;
 1987│     case 13:
 1988│       // Spawn icon OAMs + cancel button + slot pokeballs async, advance immédiatement.
 1989│       void _spawnIconOams();
 1990│       // Sequence : _spawnCancelButtonOam load tiles → then _spawnSlotPokeballOams réutilise.
 1991│       void _spawnCancelButtonOam().then(() => { _spawnSlotPokeballOams(); });
 1992│       // 1:1 décomp LoadPartyMenuAilmentGfx + statusSpriteId par box +
 1993│       // SetPartyMonAilmentGfx (party_menu.c:4188-4205).
 1994│       void _loadStatusIconsGfx().then(() => {
 1995│         _spawnStatusOams();
 1996│         for (let i = 0; i < 6; i++) _updatePartyMonAilmentGfx(i);
 1997│       });
 1998│       // 1:1 décomp LoadHeldItemIcons + itemSpriteId par box + Update
 1999│       // PartyMonHeldItemSprite (party_menu.c:4021-4063).
 2000│       void _loadHeldItemGfx().then(() => {
 2001│         _spawnHeldItemOams();
 2002│         for (let i = 0; i < 6; i++) _updatePartyMonHeldItem(i);
 2003│       });
 2004│       rt.gMain.state++; break;
 2005│     case 14:
 2006│       // 1:1 décomp `AnimatePartySlot(gPartyMenu.slotId, 1)` (party_menu.c:1116) :
 2007│       // initial highlight du slot 0 + default unselected pour les autres mons.
 2008│       for (let i = 0; i < 6; i++) AnimatePartySlot(i, 0);
 2009│       AnimatePartySlot(_slotId, 1);
 2010│       rt.gMain.state++; break;
 2011│     case 15: rt.gMain.state++; break;
 2012│     case 16: rt.gMain.state++; break;
 2013│     case 17: rt.gMain.state++; break;
 2014│     case 18: rt.gMain.state++; break;
 2015│     case 19:
 2016│       BlendPalettes(0xFFFFFFFF, 16, 0);
 2017│       rt.gMain.state++; break;
 2018│     case 20:
 2019│       FadeScreen(FADE_FROM_BLACK, 0);
 2020│       rt.gPaletteFade.bufferTransferDisabled = false;
 2021│       PlaySE(6);
 2022│       rt.gMain.state++; break;
 2023│     default:
 2024│       rt.SetVBlankCallback(VBlankCB_PartyMenuRun);
 2025│       rt.SetMainCallback2(MainCB2_PartyMenuRun);
 2026│       _isOpen = true;
 2027│       // 1:1 décomp CB2_ReturnToPartyMenuFromSummaryScreen → Task_TryCreate
 2028│       // SelectionWindow (party_menu.c:2731) → CreateSelectionWindow : au
 2029│       // retour du résumé, la fenêtre de sélection se ré-ouvre sur le mon vu.
 2030│       // playSe=false : le SE_SELECT a été joué à CursorCb_Summary (entrée),
 2031│       // CreateSelectionWindow n'en rejoue pas.
 2032│       if (_reopenActionMenuAfterInit) {
 2033│         _reopenActionMenuAfterInit = false;
 2034│         _openActionMenu(rt, false);
 2035│       }
 2036│       return;
 2037│   }
 2038│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ AnimatePartySlot  —  party_menu.c:1120-1164 (45 l)
▌ ‖ port: AnimatePartySlot (src/engine/party-screen.ts:812-862)  ← cite "party_menu.c:1120" @src/engine/party-screen.ts:812
▌ ‖ port: AnimatePartySlot (src/engine/party-screen.ts:812-862)  ← cite "party_menu.c:1129-1131" @src/engine/party-screen.ts:822
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1120-1164 ────────────────────────────────────────
 1120│ void AnimatePartySlot(u8 slot, u8 animNum)
 1121│ {
 1122│     u8 spriteId;
 1123│ 
 1124│     switch (slot)
 1125│     {
 1126│     default:
 1127│         if (GetMonData(&gPlayerParty[slot], MON_DATA_SPECIES) != SPECIES_NONE)
 1128│         {
 1129│             LoadPartyBoxPalette(&sPartyMenuBoxes[slot], GetPartyBoxPaletteFlags(slot, animNum));
 1130│             AnimateSelectedPartyIcon(sPartyMenuBoxes[slot].monSpriteId, animNum);
 1131│             PartyMenuStartSpriteAnim(sPartyMenuBoxes[slot].pokeballSpriteId, animNum);
 1132│         }
 1133│         return;
 1134│     case PARTY_SIZE: // Confirm
 1135│         if (animNum == 0)
 1136│             SetBgTilemapPalette(1, 23, 16, 7, 2, 1);
 1137│         else
 1138│             SetBgTilemapPalette(1, 23, 16, 7, 2, 2);
 1139│         spriteId = sPartyMenuInternal->spriteIdConfirmPokeball;
 1140│         break;
 1141│     case PARTY_SIZE + 1: // Cancel
 1142│         // The position of the Cancel button changes if Confirm is present
 1143│         if (!sPartyMenuInternal->chooseHalf)
 1144│         {
 1145│             if (animNum == 0)
 1146│                 SetBgTilemapPalette(1, 23, 17, 7, 2, 1);
 1147│             else
 1148│                 SetBgTilemapPalette(1, 23, 17, 7, 2, 2);
 1149│         }
 1150│         else if (animNum == 0)
 1151│         {
 1152│             SetBgTilemapPalette(1, 23, 18, 7, 2, 1);
 1153│         }
 1154│         else
 1155│         {
 1156│             SetBgTilemapPalette(1, 23, 18, 7, 2, 2);
 1157│         }
 1158│         spriteId = sPartyMenuInternal->spriteIdCancelPokeball;
 1159│         break;
 1160│     }
 1161│     PartyMenuStartSpriteAnim(spriteId, animNum);
 1162│     ScheduleBgCopyTilemapToVram(1);
 1163│ }
 1164│ 
├─ PORT src/engine/party-screen.ts:812-862 ────────────────────────────────────────
  812│ /** 1:1 décomp `AnimatePartySlot` (party_menu.c:1120).
  813│  *  animNum=0 = not selected (default), animNum=1 = selected (cursor here).
  814│  *  Pour les mon slots, le décomp call aussi :
  815│  *    AnimateSelectedPartyIcon(monSpriteId, animNum)
  816│  *    PartyMenuStartSpriteAnim(pokeballSpriteId, animNum) ← pokeball Closed/Open */
  817│ function AnimatePartySlot(slotIdx: number, animNum: number): void {
  818│   const PARTY_SIZE = 6, CANCEL = PARTY_SIZE + 1;
  819│   if (slotIdx < PARTY_SIZE) {
  820│     const mon = (gameState.party as PokemonInstance[])[slotIdx];
  821│     if (mon) {
  822│       // 1:1 décomp AnimatePartySlot (party_menu.c:1129-1131) ordre EXACT :
  823│       //   LoadPartyBoxPalette(...) ; AnimateSelectedPartyIcon(monSpriteId,
  824│       //   animNum) ; PartyMenuStartSpriteAnim(pokeballSpriteId, animNum).
  825│       _loadPartyBoxPalette(slotIdx, _getPartyBoxPaletteFlags(slotIdx, animNum));
  826│       // L'ANIM MANQUANTE (bug #1) : décalage icône sélectionné/non-sélectionné.
  827│       _animateSelectedPartyIcon(slotIdx, animNum);
  828│       // 1:1 décomp `PartyMenuStartSpriteAnim(pokeballSpriteId, animNum)` :
  829│       // animNum=0 → Closed (tile 256), animNum=1 → Open (tile 272).
  830│       const rt = getRuntime();
  831│       const pkId = _pokeballOamBySlot[slotIdx];
  832│       if (rt && pkId >= 0) {
  833│         const spr = rt.gSprites.get(pkId);
  834│         if (spr) {
  835│           const oam = rt.gba.oam[spr.oamIndex];
  836│           if (oam) {
  837│             const POKEBALL_TILE_BASE = 256;
  838│             oam.tileId = POKEBALL_TILE_BASE + (animNum === 1 ? 16 : 0);
  839│           }
  840│         }
  841│       }
  842│     } else {
  843│       // 1:1 décomp `LoadPartyBoxPalette(box, PARTY_PAL_NO_MON)` (party_menu.c:842)
  844│       // pour slot vide → palette swap sPartyBoxNoMonPalIds aux positions
  845│       // sPartyBoxNoMonPalOffsets [1, 11, 12] (= teinte vert-olive match BG).
  846│       _loadPartyBoxPalette(slotIdx, PARTY_PAL_NO_MON);
  847│     }
  848│     return;
  849│   }
  850│   if (slotIdx === CANCEL) {
  851│     // Cancel button OAM frame swap : animNum=0 → frame Closed, animNum=1 → frame Open.
  852│     // 1:1 décomp PartyMenuStartSpriteAnim. Frame 0 = tile 0..15, frame 1 = tile 16..31.
  853│     const rt = getRuntime();
  854│     if (!rt || _cancelButtonOamId < 0) return;
  855│     const spr = rt.gSprites.get(_cancelButtonOamId);
  856│     if (!spr) return;
  857│     const oam = rt.gba.oam[spr.oamIndex];
  858│     if (!oam) return;
  859│     const POKEBALL_TILE_BASE = 256;
  860│     oam.tileId = POKEBALL_TILE_BASE + (animNum === 1 ? 16 : 0);
  861│   }
  862│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ GetPartyBoxPaletteFlags  —  party_menu.c:1165-1187 (23 l)
▌ ‖ port: _getPartyBoxPaletteFlags (src/engine/party-screen.ts:802-810)  ← cite "party_menu.c:1165" @src/engine/party-screen.ts:802
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1165-1187 ────────────────────────────────────────
 1165│ static u8 GetPartyBoxPaletteFlags(u8 slot, u8 animNum)
 1166│ {
 1167│     u8 palFlags = 0;
 1168│ 
 1169│     if (animNum == 1)
 1170│         palFlags |= PARTY_PAL_SELECTED;
 1171│     if (GetMonData(&gPlayerParty[slot], MON_DATA_HP) == 0)
 1172│         palFlags |= PARTY_PAL_FAINTED;
 1173│     if (PartyBoxPal_ParnterOrDisqualifiedInArena(slot) == TRUE)
 1174│         palFlags |= PARTY_PAL_MULTI_ALT;
 1175│     if (gPartyMenu.action == PARTY_ACTION_SWITCHING)
 1176│         palFlags |= PARTY_PAL_SWITCHING;
 1177│     if (gPartyMenu.action == PARTY_ACTION_SWITCH)
 1178│     {
 1179│         if (slot == gPartyMenu.slotId || slot == gPartyMenu.slotId2)
 1180│             palFlags |= PARTY_PAL_TO_SWITCH;
 1181│     }
 1182│     if (gPartyMenu.action == PARTY_ACTION_SOFTBOILED && slot == gPartyMenu.slotId )
 1183│         palFlags |= PARTY_PAL_TO_SOFTBOIL;
 1184│ 
 1185│     return palFlags;
 1186│ }
 1187│ 
├─ PORT src/engine/party-screen.ts:802-810 ────────────────────────────────────────
  802│ /** 1:1 décomp `GetPartyBoxPaletteFlags` (party_menu.c:1165).
  803│  *  Pour notre MVP single-layout sans switching/softboil, juste SELECTED + FAINTED. */
  804│ function _getPartyBoxPaletteFlags(slotIdx: number, animNum: number): number {
  805│   let palFlags = 0;
  806│   if (animNum === 1) palFlags |= PARTY_PAL_SELECTED;
  807│   const mon = (gameState.party as PokemonInstance[])[slotIdx];
  808│   if (mon && mon.currentHp === 0) palFlags |= PARTY_PAL_FAINTED;
  809│   return palFlags;
  810│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_ClosePartyMenuAndSetCB2  —  party_menu.c:1231-1248 (18 l)
▌ ‖ port: src/engine/party-screen.ts:268 (hors fonction)  ← cite "party_menu.c:1238" @src/engine/party-screen.ts:268
▌ ‖ port: Task_ClosePartyMenu (src/engine/party-screen.ts:1242-1263)  ← cite "party_menu.c:1231-1245" @src/engine/party-screen.ts:1246
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1231-1248 ────────────────────────────────────────
 1231│ static void Task_ClosePartyMenuAndSetCB2(u8 taskId)
 1232│ {
 1233│     if (!gPaletteFade.active)
 1234│     {
 1235│         if (gPartyMenu.menuType == PARTY_MENU_TYPE_IN_BATTLE)
 1236│             UpdatePartyToFieldOrder();
 1237│ 
 1238│         if (sPartyMenuInternal->exitCallback != NULL)
 1239│             SetMainCallback2(sPartyMenuInternal->exitCallback);
 1240│         else
 1241│             SetMainCallback2(gPartyMenu.exitCallback);
 1242│ 
 1243│         ResetSpriteData();
 1244│         FreePartyPointers();
 1245│         DestroyTask(taskId);
 1246│     }
 1247│ }
 1248│ 
├─ PORT src/engine/party-screen.ts:1242-1263 ────────────────────────────────────────
 1242│ function Task_ClosePartyMenu(task: DecompTask): void {
 1243│   const rt = getRuntime();
 1244│   if (!rt || rt.gPaletteFade.active) return;
 1245│   _freePartyMenu();
 1246│   // 1:1 décomp `Task_ClosePartyMenuAndSetCB2` (party_menu.c:1231-1245) :
 1247│   //   if (sPartyMenuInternal->exitCallback != NULL)
 1248│   //       SetMainCallback2(sPartyMenuInternal->exitCallback);   ← transitoire
 1249│   //   else
 1250│   //       SetMainCallback2(gPartyMenu.exitCallback);            ← ultime (field)
 1251│   // Le callback transitoire (= RESUME → CB2_ShowPokemonSummaryScreen) est
 1252│   // consommé UNE fois. Sortir le résumé de la party de façon SÉQUENTIELLE
 1253│   // (party fully freed → handoff CB2) élimine la race async qui faisait
 1254│   // survivre une tâche de close → CB2_ReturnToFieldWithOpenMenu = OW+START
 1255│   // (bug #4) / CB2 stomp mid-summary (bug #3).
 1256│   const transient = _partyTransientExitCb;
 1257│   _partyTransientExitCb = null;
 1258│   const exitCb = transient ?? rt.gMain.savedCallback;
 1259│   if (exitCb) rt.SetMainCallback2(exitCb);
 1260│   else rt.SetMainCallback2(null);
 1261│   rt.DestroyTask(task.taskId);
 1262│   _inputTaskId = -1;
 1263│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_HandleChooseMonInput  —  party_menu.c:1259-1283 (25 l)
▌ ‖ port: Task_PartyMenu_HandleInput (src/engine/party-screen.ts:1896-1935)  ← cite "party_menu.c:1260" @src/engine/party-screen.ts:1896
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1259-1283 ────────────────────────────────────────
 1259│ void Task_HandleChooseMonInput(u8 taskId)
 1260│ {
 1261│     if (!gPaletteFade.active && MenuHelpers_ShouldWaitForLinkRecv() != TRUE)
 1262│     {
 1263│         s8 *slotPtr = GetCurrentPartySlotPtr();
 1264│ 
 1265│         switch (PartyMenuButtonHandler(slotPtr))
 1266│         {
 1267│         case A_BUTTON: // Selected mon
 1268│             HandleChooseMonSelection(taskId, slotPtr);
 1269│             break;
 1270│         case B_BUTTON: // Selected Cancel / pressed B
 1271│             HandleChooseMonCancel(taskId, slotPtr);
 1272│             break;
 1273│         case START_BUTTON:
 1274│             if (sPartyMenuInternal->chooseHalf)
 1275│             {
 1276│                 PlaySE(SE_SELECT);
 1277│                 MoveCursorToConfirm();
 1278│             }
 1279│             break;
 1280│         }
 1281│     }
 1282│ }
 1283│ 
├─ PORT src/engine/party-screen.ts:1896-1935 ────────────────────────────────────────
 1896│ /** Input handler 1:1 décomp `Task_HandleChooseMonInput` (party_menu.c:1260) :
 1897│  *    A → if cancel slot: close, else: action menu (RESUME/OBJET/RETOUR)
 1898│  *    B → close
 1899│  *    START → MoveCursorToConfirm (= no-op si pas chooseHalf)
 1900│  *    DPAD → cursor nav */
 1901│ function Task_PartyMenu_HandleInput(_task: DecompTask): void {
 1902│   const rt = getRuntime();
 1903│   if (!rt) return;
 1904│   // 1:1 décomp : pendant PARTY_ACTION_SWITCHING la task func du décomp EST
 1905│   // Task_SlideSelectedSlotsOffscreen/Onscreen (pas le handler input) → input
 1906│   // ignoré, on tick uniquement l'anim slide. (party_menu.c:2864/2962)
 1907│   if (_phase === 'switching') { _slideTaskFn?.(); return; }
 1908│   // Sub-state action menu : dispatcher différent.
 1909│   if (_phase === 'action_menu') { _handleActionMenuInput(rt); return; }
 1910│   if (_phase !== 'open') return;
 1911│   const result = _partyMenuButtonHandler(rt);
 1912│   const KEY_A = 0x0001, KEY_B = 0x0002;
 1913│   if (result === KEY_A) {
 1914│     // 1:1 décomp Task_HandleChooseMonInput A_BUTTON : dispatch selon
 1915│     // gPartyMenu.action. PARTY_ACTION_SWITCH (party_menu.c:1344-1347) →
 1916│     // PlaySE(SE_SELECT) + SwitchSelectedMons. Sinon → action menu.
 1917│     if (_partyAction === PARTY_ACTION_SWITCH) {
 1918│       PlaySE(5);  // SE_SELECT (1:1 party_menu.c:1345)
 1919│       _switchSelectedMons();
 1920│     } else {
 1921│       // A sur slot mon → ouvre action menu. (A sur CANCEL est mappé à B.)
 1922│       _openActionMenu(rt);
 1923│     }
 1924│   } else if (result === KEY_B) {
 1925│     PlaySE(5);
 1926│     if (_partyAction === PARTY_ACTION_SWITCH) {
 1927│       // 1:1 net : B / Cancel pendant SWITCH = annule (= SwitchSelectedMons
 1928│       // slot2==slot1 → FinishTwoMonAction, party_menu.c:2827-2830).
 1929│       _finishTwoMonAction();
 1930│     } else {
 1931│       ClosePartyScreen();
 1932│     }
 1933│   }
 1934│   // START: en single layout pas de Confirm → no-op
 1935│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ HandleChooseMonSelection  —  party_menu.c:1292-1367 (76 l)
▌ ‖ port: Task_PartyMenu_HandleInput (src/engine/party-screen.ts:1896-1935)  ← cite "party_menu.c:1344-1347" @src/engine/party-screen.ts:1915
▌ ‖ port: Task_PartyMenu_HandleInput (src/engine/party-screen.ts:1896-1935)  ← cite "party_menu.c:1345" @src/engine/party-screen.ts:1918
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1292-1367 ────────────────────────────────────────
 1292│ static void HandleChooseMonSelection(u8 taskId, s8 *slotPtr)
 1293│ {
 1294│     if (*slotPtr == PARTY_SIZE)
 1295│     {
 1296│         gPartyMenu.task(taskId);
 1297│     }
 1298│     else
 1299│     {
 1300│         switch (gPartyMenu.action)
 1301│         {
 1302│         case PARTY_ACTION_SOFTBOILED:
 1303│             if (IsSelectedMonNotEgg((u8 *)slotPtr))
 1304│             {
 1305│                 PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
 1306│                 Task_TryUseSoftboiledOnPartyMon(taskId);
 1307│             }
 1308│             break;
 1309│         case PARTY_ACTION_USE_ITEM:
 1310│             if (IsSelectedMonNotEgg((u8 *)slotPtr))
 1311│             {
 1312│                 if (gPartyMenu.menuType == PARTY_MENU_TYPE_IN_BATTLE)
 1313│                     sPartyMenuInternal->exitCallback = CB2_SetUpExitToBattleScreen;
 1314│ 
 1315│                 PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
 1316│                 gItemUseCB(taskId, Task_ClosePartyMenuAfterText);
 1317│             }
 1318│             break;
 1319│         case PARTY_ACTION_MOVE_TUTOR:
 1320│             if (IsSelectedMonNotEgg((u8 *)slotPtr))
 1321│             {
 1322│                 PlaySE(SE_SELECT);
 1323│                 PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
 1324│                 TryTutorSelectedMon(taskId);
 1325│             }
 1326│             break;
 1327│         case PARTY_ACTION_GIVE_MAILBOX_MAIL:
 1328│             if (IsSelectedMonNotEgg((u8 *)slotPtr))
 1329│             {
 1330│                 PlaySE(SE_SELECT);
 1331│                 PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
 1332│                 TryGiveMailToSelectedMon(taskId);
 1333│             }
 1334│             break;
 1335│         case PARTY_ACTION_GIVE_ITEM:
 1336│         case PARTY_ACTION_GIVE_PC_ITEM:
 1337│             if (IsSelectedMonNotEgg((u8 *)slotPtr))
 1338│             {
 1339│                 PlaySE(SE_SELECT);
 1340│                 PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
 1341│                 TryGiveItemOrMailToSelectedMon(taskId);
 1342│             }
 1343│             break;
 1344│         case PARTY_ACTION_SWITCH:
 1345│             PlaySE(SE_SELECT);
 1346│             SwitchSelectedMons(taskId);
 1347│             break;
 1348│         case PARTY_ACTION_CHOOSE_AND_CLOSE:
 1349│             PlaySE(SE_SELECT);
 1350│             Task_ClosePartyMenu(taskId);
 1351│             break;
 1352│         case PARTY_ACTION_MINIGAME:
 1353│             if (IsSelectedMonNotEgg((u8 *)slotPtr))
 1354│             {
 1355│                 TryEnterMonForMinigame(taskId, (u8)*slotPtr);
 1356│             }
 1357│             break;
 1358│         default:
 1359│         case PARTY_ACTION_ABILITY_PREVENTS:
 1360│         case PARTY_ACTION_SWITCHING:
 1361│             PlaySE(SE_SELECT);
 1362│             Task_TryCreateSelectionWindow(taskId);
 1363│             break;
 1364│         }
 1365│     }
 1366│ }
 1367│ 
├─ PORT src/engine/party-screen.ts:1896-1935 ────────────────────────────────────────
 1896│ /** Input handler 1:1 décomp `Task_HandleChooseMonInput` (party_menu.c:1260) :
 1897│  *    A → if cancel slot: close, else: action menu (RESUME/OBJET/RETOUR)
 1898│  *    B → close
 1899│  *    START → MoveCursorToConfirm (= no-op si pas chooseHalf)
 1900│  *    DPAD → cursor nav */
 1901│ function Task_PartyMenu_HandleInput(_task: DecompTask): void {
 1902│   const rt = getRuntime();
 1903│   if (!rt) return;
 1904│   // 1:1 décomp : pendant PARTY_ACTION_SWITCHING la task func du décomp EST
 1905│   // Task_SlideSelectedSlotsOffscreen/Onscreen (pas le handler input) → input
 1906│   // ignoré, on tick uniquement l'anim slide. (party_menu.c:2864/2962)
 1907│   if (_phase === 'switching') { _slideTaskFn?.(); return; }
 1908│   // Sub-state action menu : dispatcher différent.
 1909│   if (_phase === 'action_menu') { _handleActionMenuInput(rt); return; }
 1910│   if (_phase !== 'open') return;
 1911│   const result = _partyMenuButtonHandler(rt);
 1912│   const KEY_A = 0x0001, KEY_B = 0x0002;
 1913│   if (result === KEY_A) {
 1914│     // 1:1 décomp Task_HandleChooseMonInput A_BUTTON : dispatch selon
 1915│     // gPartyMenu.action. PARTY_ACTION_SWITCH (party_menu.c:1344-1347) →
 1916│     // PlaySE(SE_SELECT) + SwitchSelectedMons. Sinon → action menu.
 1917│     if (_partyAction === PARTY_ACTION_SWITCH) {
 1918│       PlaySE(5);  // SE_SELECT (1:1 party_menu.c:1345)
 1919│       _switchSelectedMons();
 1920│     } else {
 1921│       // A sur slot mon → ouvre action menu. (A sur CANCEL est mappé à B.)
 1922│       _openActionMenu(rt);
 1923│     }
 1924│   } else if (result === KEY_B) {
 1925│     PlaySE(5);
 1926│     if (_partyAction === PARTY_ACTION_SWITCH) {
 1927│       // 1:1 net : B / Cancel pendant SWITCH = annule (= SwitchSelectedMons
 1928│       // slot2==slot1 → FinishTwoMonAction, party_menu.c:2827-2830).
 1929│       _finishTwoMonAction();
 1930│     } else {
 1931│       ClosePartyScreen();
 1932│     }
 1933│   }
 1934│   // START: en single layout pas de Confirm → no-op
 1935│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ PartyMenuButtonHandler  —  party_menu.c:1455-1504 (50 l)
▌ ‖ port: src/engine/party-screen.ts:1297 (hors fonction)  ← cite "party_menu.c:1455" @src/engine/party-screen.ts:1297
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1455-1504 ────────────────────────────────────────
 1455│ static u16 PartyMenuButtonHandler(s8 *slotPtr)
 1456│ {
 1457│     s8 movementDir;
 1458│ 
 1459│     switch (gMain.newAndRepeatedKeys)
 1460│     {
 1461│     case DPAD_UP:
 1462│         movementDir = MENU_DIR_UP;
 1463│         break;
 1464│     case DPAD_DOWN:
 1465│         movementDir = MENU_DIR_DOWN;
 1466│         break;
 1467│     case DPAD_LEFT:
 1468│         movementDir = MENU_DIR_LEFT;
 1469│         break;
 1470│     case DPAD_RIGHT:
 1471│         movementDir = MENU_DIR_RIGHT;
 1472│         break;
 1473│     default:
 1474│         switch (GetLRKeysPressedAndHeld())
 1475│         {
 1476│         case MENU_L_PRESSED:
 1477│             movementDir = MENU_DIR_UP;
 1478│             break;
 1479│         case MENU_R_PRESSED:
 1480│             movementDir = MENU_DIR_DOWN;
 1481│             break;
 1482│         default:
 1483│             movementDir = 0;
 1484│             break;
 1485│         }
 1486│         break;
 1487│     }
 1488│ 
 1489│     if (JOY_NEW(START_BUTTON))
 1490│         return START_BUTTON;
 1491│ 
 1492│     if (movementDir)
 1493│     {
 1494│         UpdateCurrentPartySelection(slotPtr, movementDir);
 1495│         return 0;
 1496│     }
 1497│ 
 1498│     // Pressed Cancel
 1499│     if (JOY_NEW(A_BUTTON) && *slotPtr == PARTY_SIZE + 1)
 1500│         return B_BUTTON;
 1501│ 
 1502│     return JOY_NEW(A_BUTTON | B_BUTTON);
 1503│ }
 1504│ 
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ UpdateCurrentPartySelection  —  party_menu.c:1505-1522 (18 l)
▌ ‖ port: _partyMenuButtonHandler (src/engine/party-screen.ts:1301-1338)  ← cite "party_menu.c:1505" @src/engine/party-screen.ts:1328
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1505-1522 ────────────────────────────────────────
 1505│ static void UpdateCurrentPartySelection(s8 *slotPtr, s8 movementDir)
 1506│ {
 1507│     s8 newSlotId = *slotPtr;
 1508│     u8 layout = gPartyMenu.layout;
 1509│ 
 1510│     if (layout == PARTY_LAYOUT_SINGLE)
 1511│         UpdatePartySelectionSingleLayout(slotPtr, movementDir);
 1512│     else
 1513│         UpdatePartySelectionDoubleLayout(slotPtr, movementDir);
 1514│ 
 1515│     if (*slotPtr != newSlotId)
 1516│     {
 1517│         PlaySE(SE_SELECT);
 1518│         AnimatePartySlot(newSlotId, 0);
 1519│         AnimatePartySlot(*slotPtr, 1);
 1520│     }
 1521│ }
 1522│ 
├─ PORT src/engine/party-screen.ts:1301-1338 ────────────────────────────────────────
 1301│ function _partyMenuButtonHandler(rt: ReturnType<typeof getRuntime>): number {
 1302│   if (!rt) return 0;
 1303│   const PARTY_SIZE = 6, CANCEL = PARTY_SIZE + 1;
 1304│   const newRepKeys = rt.gMain.newAndRepeatedKeys ?? rt.gMain.newKeys;
 1305│   const newKeys = rt.gMain.newKeys;
 1306│   const KEY_A = 0x0001, KEY_B = 0x0002, KEY_START = 0x0008;
 1307│   const DPAD_UP = 0x40, DPAD_DOWN = 0x80, DPAD_LEFT = 0x20, DPAD_RIGHT = 0x10;
 1308│   let dir = 0;
 1309│   switch (newRepKeys & (DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT)) {
 1310│     case DPAD_UP:    dir = MENU_DIR_UP;    break;
 1311│     case DPAD_DOWN:  dir = MENU_DIR_DOWN;  break;
 1312│     case DPAD_LEFT:  dir = MENU_DIR_LEFT;  break;
 1313│     case DPAD_RIGHT: dir = MENU_DIR_RIGHT; break;
 1314│   }
 1315│   // 1:1 décomp PartyMenuButtonHandler :1473-1486 : `default` (aucun DPAD) →
 1316│   // GetLRKeysPressedAndHeld : L_PRESSED → MENU_DIR_UP, R_PRESSED → DOWN.
 1317│   if (dir === 0) {
 1318│     const KEY_L = 0x0200, KEY_R = 0x0100;
 1319│     if (newRepKeys & KEY_L) dir = MENU_DIR_UP;
 1320│     else if (newRepKeys & KEY_R) dir = MENU_DIR_DOWN;
 1321│   }
 1322│   if (newKeys & KEY_START) return KEY_START;
 1323│   if (dir !== 0) {
 1324│     const prev = _slotId;
 1325│     _updateSlotIdSingle(dir);
 1326│     if (_slotId !== prev) {
 1327│       PlaySE(5);  // SE_SELECT
 1328│       // 1:1 décomp UpdateCurrentPartySelection (party_menu.c:1505) :
 1329│       // AnimatePartySlot(oldSlot, 0); AnimatePartySlot(newSlot, 1);
 1330│       AnimatePartySlot(prev, 0);
 1331│       AnimatePartySlot(_slotId, 1);
 1332│     }
 1333│     return 0;
 1334│   }
 1335│   // Pressed A on Cancel = treat as B (= close)
 1336│   if ((newKeys & KEY_A) && _slotId === CANCEL) return KEY_B;
 1337│   return newKeys & (KEY_A | KEY_B);
 1338│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ UpdatePartySelectionSingleLayout  —  party_menu.c:1523-1587 (65 l)
▌ ‖ port: _updateSlotIdSingle (src/engine/party-screen.ts:1265-1295)  ← cite "party_menu.c:1523" @src/engine/party-screen.ts:1265
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1523-1587 ────────────────────────────────────────
 1523│ static void UpdatePartySelectionSingleLayout(s8 *slotPtr, s8 movementDir)
 1524│ {
 1525│     // PARTY_SIZE + 1 is Cancel, PARTY_SIZE is Confirm
 1526│     switch (movementDir)
 1527│     {
 1528│     case MENU_DIR_UP:
 1529│         if (*slotPtr == 0)
 1530│         {
 1531│             *slotPtr = PARTY_SIZE + 1;
 1532│         }
 1533│         else if (*slotPtr == PARTY_SIZE)
 1534│         {
 1535│             *slotPtr = gPlayerPartyCount - 1;
 1536│         }
 1537│         else if (*slotPtr == PARTY_SIZE + 1)
 1538│         {
 1539│             if (sPartyMenuInternal->chooseHalf)
 1540│                 *slotPtr = PARTY_SIZE;
 1541│             else
 1542│                 *slotPtr = gPlayerPartyCount - 1;
 1543│         }
 1544│         else
 1545│         {
 1546│             (*slotPtr)--;
 1547│         }
 1548│         break;
 1549│     case MENU_DIR_DOWN:
 1550│         if (*slotPtr == PARTY_SIZE + 1)
 1551│         {
 1552│             *slotPtr = 0;
 1553│         }
 1554│         else
 1555│         {
 1556│             if (*slotPtr == gPlayerPartyCount - 1)
 1557│             {
 1558│                 if (sPartyMenuInternal->chooseHalf)
 1559│                     *slotPtr = PARTY_SIZE;
 1560│                 else
 1561│                     *slotPtr = PARTY_SIZE + 1;
 1562│             }
 1563│             else
 1564│             {
 1565│                 (*slotPtr)++;
 1566│             }
 1567│         }
 1568│         break;
 1569│     case MENU_DIR_RIGHT:
 1570│         if (gPlayerPartyCount != 1 && *slotPtr == 0)
 1571│         {
 1572│             if (sPartyMenuInternal->lastSelectedSlot == 0)
 1573│                 *slotPtr = 1;
 1574│             else
 1575│                 *slotPtr = sPartyMenuInternal->lastSelectedSlot;
 1576│         }
 1577│         break;
 1578│     case MENU_DIR_LEFT:
 1579│         if (*slotPtr != 0 && *slotPtr != PARTY_SIZE && *slotPtr != PARTY_SIZE + 1)
 1580│         {
 1581│             sPartyMenuInternal->lastSelectedSlot = *slotPtr;
 1582│             *slotPtr = 0;
 1583│         }
 1584│         break;
 1585│     }
 1586│ }
 1587│ 
├─ PORT src/engine/party-screen.ts:1265-1295 ────────────────────────────────────────
 1265│ /** 1:1 décomp `UpdatePartySelectionSingleLayout` (party_menu.c:1523).
 1266│  *  Layout single (= notre cas) : slotId values 0..5 (mons), 7 (Cancel).
 1267│  *  Confirm (slot 6) pas utilisé en single layout (= chooseHalf=false). */
 1268│ function _updateSlotIdSingle(dir: number): void {
 1269│   const partyCount = (gameState.party as PokemonInstance[]).length;
 1270│   const PARTY_SIZE = 6;
 1271│   const CANCEL = PARTY_SIZE + 1;  // = 7
 1272│   switch (dir) {
 1273│     case MENU_DIR_UP:
 1274│       if (_slotId === 0) _slotId = CANCEL;
 1275│       else if (_slotId === CANCEL) _slotId = partyCount - 1;
 1276│       else _slotId--;
 1277│       break;
 1278│     case MENU_DIR_DOWN:
 1279│       if (_slotId === CANCEL) _slotId = 0;
 1280│       else if (_slotId === partyCount - 1) _slotId = CANCEL;
 1281│       else _slotId++;
 1282│       break;
 1283│     case MENU_DIR_RIGHT:
 1284│       if (partyCount !== 1 && _slotId === 0) {
 1285│         _slotId = _lastSelectedSlot === 0 ? 1 : _lastSelectedSlot;
 1286│       }
 1287│       break;
 1288│     case MENU_DIR_LEFT:
 1289│       if (_slotId !== 0 && _slotId !== PARTY_SIZE && _slotId !== CANCEL) {
 1290│         _lastSelectedSlot = _slotId;
 1291│         _slotId = 0;
 1292│       }
 1293│       break;
 1294│   }
 1295│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ GetMonAilment  —  party_menu.c:1924-1937 (14 l)
▌ ‖ port: _ailmentFromStatus (src/engine/party-screen.ts:1008-1020)  ← cite "party_menu.c:1924-1936" @src/engine/party-screen.ts:1008
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:1924-1937 ────────────────────────────────────────
 1924│ u8 GetMonAilment(struct Pokemon *mon)
 1925│ {
 1926│     u8 ailment;
 1927│ 
 1928│     if (GetMonData(mon, MON_DATA_HP) == 0)
 1929│         return AILMENT_FNT;
 1930│     ailment = GetAilmentFromStatus(GetMonData(mon, MON_DATA_STATUS));
 1931│     if (ailment != AILMENT_NONE)
 1932│         return ailment;
 1933│     if (CheckPartyPokerus(mon, 0))
 1934│         return AILMENT_PKRS;
 1935│     return AILMENT_NONE;
 1936│ }
 1937│ 
├─ PORT src/engine/party-screen.ts:1008-1020 ────────────────────────────────────────
 1008│ /** 1:1 décomp `GetMonAilment` (party_menu.c:1924-1936) → AILMENT_* :
 1009│  *    HP==0 → AILMENT_FNT(7)  (:1928, PRIORITAIRE)
 1010│  *    status → PSN/TOX=1, PAR=2, SLP=3, FRZ=4, BRN=5
 1011│  *    pokérus → AILMENT_PKRS(6)  (non modélisé chez nous → NONE, honnête)
 1012│  *    sinon AILMENT_NONE(0). */
 1013│ function _ailmentFromStatus(mon: PokemonInstance | undefined): number {
 1014│   if (!mon) return 0;
 1015│   if (mon.currentHp === 0) return 7;            // 1:1 :1928 AILMENT_FNT
 1016│   const st = mon.status;
 1017│   const a = st === 'PSN' || st === 'TOX' ? 1 : st === 'PAR' ? 2 : st === 'SLP' ? 3
 1018│     : st === 'FRZ' ? 4 : st === 'BRN' ? 5 : 0;
 1019│   return a;                                     // 1:1 :1930-1935 (pokérus n/a → NONE)
 1020│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ InitPartyMenuWindows  —  party_menu.c:2074-2100 (27 l)
▌ ‖ port: src/engine/party-screen.ts:68 (hors fonction)  ← cite "party_menu.c:2096" @src/engine/party-screen.ts:68
▌ ‖ port: _loadPartyWindowsCb2 (src/engine/party-screen.ts:451-489)  ← cite "party_menu.c:2094-2098" @src/engine/party-screen.ts:460
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2074-2100 ────────────────────────────────────────
 2074│ static void InitPartyMenuWindows(u8 layout)
 2075│ {
 2076│     u8 i;
 2077│ 
 2078│     switch (layout)
 2079│     {
 2080│     case PARTY_LAYOUT_SINGLE:
 2081│         InitWindows(sSinglePartyMenuWindowTemplate);
 2082│         break;
 2083│     case PARTY_LAYOUT_DOUBLE:
 2084│         InitWindows(sDoublePartyMenuWindowTemplate);
 2085│         break;
 2086│     case PARTY_LAYOUT_MULTI:
 2087│         InitWindows(sMultiPartyMenuWindowTemplate);
 2088│         break;
 2089│     default: // PARTY_LAYOUT_MULTI_SHOWCASE
 2090│         InitWindows(sShowcaseMultiPartyMenuWindowTemplate);
 2091│         break;
 2092│     }
 2093│     DeactivateAllTextPrinters();
 2094│     for (i = 0; i < PARTY_SIZE; i++)
 2095│         FillWindowPixelBuffer(i, PIXEL_FILL(0));
 2096│     LoadUserWindowBorderGfx(0, 0x4F, BG_PLTT_ID(13));
 2097│     LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(14), PLTT_SIZE_4BPP);
 2098│     LoadPalette(gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
 2099│ }
 2100│ 
├─ PORT src/engine/party-screen.ts:451-489 ────────────────────────────────────────
  451│ async function _loadPartyWindowsCb2(rt: ReturnType<typeof getRuntime>): Promise<void> {
  452│   if (!rt) return;
  453│   // InitWindows pour 6 slots + cancel button (= persistents). Le _msgWid est
  454│   // créé dynamiquement par `_drawMsg` (= 1:1 décomp DisplayPartyMenuStdMessage
  455│   // qui remove+add le window à chaque change de stringId).
  456│   const ids = InitWindows([...SLOT_WINDOW_TEMPLATES, CANCEL_BUTTON_WINDOW_TEMPLATE]);
  457│   _slotWindowIds = ids.slice(0, 6);
  458│   _msgWid = -1;  // = WINDOW_NONE, créé par _drawMsg
  459│   _cancelButtonWid = ids[6];
  460│   // 1:1 décomp `InitPartyMenuWindows` (party_menu.c:2094-2098) :
  461│   //   LoadUserWindowBorderGfx(0, 0x4F, BG_PLTT_ID(13));
  462│   //   LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(14), PLTT_SIZE_4BPP);
  463│   //   LoadPalette(gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
  464│   // 1:1 décomp `LoadUserWindowBorderGfx(0, 0x4F, BG_PLTT_ID(13))` (:2096) :
  465│   // charge le cadre de fenêtre CHOISI PAR LE JOUEUR dans le menu OPTIONS
  466│   // (gameState.options.windowFrameType = gSaveBlock2->optionsWindowFrameType),
  467│   // PAS un cadre hardcodé. L'ancien code force-chargeait `1.png` (style fixe)
  468│   // → à l'entrée du party menu le cadre du message reprenait le style par
  469│   // défaut au lieu du style user (bug A/B : corrigé en ouvrant/fermant un
  470│   // profil car _openActionMenu appelle le vrai LoadUserWindowBorderGfx).
  471│   // preloadTextWindowFrames d'abord (idempotent) : en ?debug le preload
  472│   // BirchRuntimeScene est skippé → assetCache vide sinon (= pal 13 noire).
  473│   // Exactement le même appel que _openActionMenu (qui, lui, marche).
  474│   await preloadTextWindowFrames();
  475│   LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);  // 1:1 BG_PLTT_ID(13)
  476│   const stdMenuPal = await loadGbaPal('/decomp/em/interface/std_menu.pal');
  477│   LoadPalette(stdMenuPal, 15 * 16, 32);
  478│   // 1:1 décomp BG_PLTT_ID(14) = overworld textbox palette (= action menu BG).
  479│   // Sans ça, palette 14 = noir → action window BG noir au lieu de gris/blanc.
  480│   // Pour MVP : use std_menu palette (= même que pal 15 = blanc/gris). Le décomp
  481│   // utilise GetOverworldTextboxPalettePtr() qui dépend du frame style user.
  482│   LoadPalette(stdMenuPal, 14 * 16, 32);
  483│   // Initial fill transparent + put tilemap.
  484│   for (const wid of _slotWindowIds) {
  485│     FillWindowPixelBuffer(wid, 0x00);
  486│     PutWindowTilemap(wid);
  487│   }
  488│   // _msgWid créé dynamiquement par _drawMsg (= différent template selon msg).
  489│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CreateCancelConfirmWindows  —  party_menu.c:2101-2144 (44 l)
▌ ‖ port: _drawCancelButtonWindow (src/engine/party-screen.ts:864-884)  ← cite "party_menu.c:2101" @src/engine/party-screen.ts:864
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2101-2144 ────────────────────────────────────────
 2101│ static void CreateCancelConfirmWindows(bool8 chooseHalf)
 2102│ {
 2103│     u8 confirmWindowId;
 2104│     u8 cancelWindowId;
 2105│     u8 offset;
 2106│     u8 mainOffset;
 2107│ 
 2108│     if (gPartyMenu.menuType != PARTY_MENU_TYPE_MULTI_SHOWCASE)
 2109│     {
 2110│         if (chooseHalf == TRUE)
 2111│         {
 2112│             confirmWindowId = AddWindow(&sConfirmButtonWindowTemplate);
 2113│             FillWindowPixelBuffer(confirmWindowId, PIXEL_FILL(0));
 2114│             mainOffset = GetStringCenterAlignXOffset(FONT_SMALL, gMenuText_Confirm, 48);
 2115│             AddTextPrinterParameterized4(confirmWindowId, FONT_SMALL, mainOffset, 1, 0, 0, sFontColorTable[0], TEXT_SKIP_DRAW, gMenuText_Confirm);
 2116│             PutWindowTilemap(confirmWindowId);
 2117│             CopyWindowToVram(confirmWindowId, COPYWIN_GFX);
 2118│             cancelWindowId = AddWindow(&sMultiCancelButtonWindowTemplate);
 2119│             offset = 0;
 2120│         }
 2121│         else
 2122│         {
 2123│             cancelWindowId = AddWindow(&sCancelButtonWindowTemplate);
 2124│             offset = 3;
 2125│         }
 2126│         FillWindowPixelBuffer(cancelWindowId, PIXEL_FILL(0));
 2127│ 
 2128│         // Branches are functionally identical. Second branch is never reached, Spin Trade wasnt fully implemented
 2129│         if (gPartyMenu.menuType != PARTY_MENU_TYPE_SPIN_TRADE)
 2130│         {
 2131│             mainOffset = GetStringCenterAlignXOffset(FONT_SMALL, gText_Cancel, 48);
 2132│             AddTextPrinterParameterized3(cancelWindowId, FONT_SMALL, mainOffset + offset, 1, sFontColorTable[0], TEXT_SKIP_DRAW, gText_Cancel);
 2133│         }
 2134│         else
 2135│         {
 2136│             mainOffset = GetStringCenterAlignXOffset(FONT_SMALL, gText_Cancel2, 48);
 2137│             AddTextPrinterParameterized3(cancelWindowId, FONT_SMALL, mainOffset + offset, 1, sFontColorTable[0], TEXT_SKIP_DRAW, gText_Cancel2);
 2138│         }
 2139│         PutWindowTilemap(cancelWindowId);
 2140│         CopyWindowToVram(cancelWindowId, COPYWIN_GFX);
 2141│         ScheduleBgCopyTilemapToVram(0);
 2142│     }
 2143│ }
 2144│ 
├─ PORT src/engine/party-screen.ts:864-884 ────────────────────────────────────────
  864│ /** 1:1 décomp `CreateCancelConfirmWindows(chooseHalf=false)` (party_menu.c:2101).
  865│  *  En single layout : spawn sCancelButtonWindowTemplate + render gText_Cancel
  866│  *  (= "SORTIR" FR) centré FONT_SMALL + offset 3 pixels. */
  867│ function _drawCancelButtonWindow(): void {
  868│   if (_cancelButtonWid < 0) return;
  869│   FillWindowPixelBuffer(_cancelButtonWid, 0x00);
  870│   const txt = getString('gText_Cancel');  // "SORTIR" FR
  871│   // 1:1 décomp : mainOffset = GetStringCenterAlignXOffset(FONT_SMALL, gText_Cancel, 48) + 3
  872│   // ⚠️ Notre GetStringWidth utilise FONT_NORMAL (= chars plus larges que FONT_SMALL).
  873│   // Pour 1:1 ROM "SORTIR" FONT_SMALL ≈ 30px → mainOffset = (48-30)/2 = 9 + 3 = 12.
  874│   // Hardcode 12 pour matcher pixel position du ROM.
  875│   const mainOffset = 12;
  876│   // sFontColorTable[0] = [TRANSPARENT, LIGHT_GRAY, DARK_GRAY] = [0, 3, 2]
  877│   AddTextPrinterParameterized3(
  878│     _cancelButtonWid, FONT_SMALL, mainOffset, 1,
  879│     [0, 3, 2] as [number, number, number],
  880│     TEXT_SKIP_DRAW, txt,
  881│   );
  882│   PutWindowTilemap(_cancelButtonWid);
  883│   CopyWindowToVram(_cancelButtonWid, 3);
  884│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ BlitBitmapToPartyWindow  —  party_menu.c:2150-2166 (17 l)
▌ ‖ port: _blitSlotFrame (src/engine/party-screen.ts:491-514)  ← cite "party_menu.c:2150" @src/engine/party-screen.ts:491
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2150-2166 ────────────────────────────────────────
 2150│ static void BlitBitmapToPartyWindow(u8 windowId, const u8 *b, u8 c, u8 x, u8 y, u8 width, u8 height)
 2151│ {
 2152│     u8 *pixels = AllocZeroed(height * width * 32);
 2153│     u8 i, j;
 2154│ 
 2155│     if (pixels != NULL)
 2156│     {
 2157│         for (i = 0; i < height; i++)
 2158│         {
 2159│             for (j = 0; j < width; j++)
 2160│                 CpuCopy16(GetPartyMenuBgTile(b[x + j + ((y + i) * c)]), &pixels[(i * width + j) * 32], 32);
 2161│         }
 2162│         BlitBitmapToWindow(windowId, pixels, x * 8, y * 8, width * 8, height * 8);
 2163│         Free(pixels);
 2164│     }
 2165│ }
 2166│ 
├─ PORT src/engine/party-screen.ts:491-514 ────────────────────────────────────────
  491│ /** 1:1 décomp `BlitBitmapToPartyWindow` (party_menu.c:2150).
  492│  *  Stamp un tilemap u8 (chaque entry = tile index dans bg.png char data) dans
  493│  *  le window pixel buffer via lookup tiles raw 4bpp depuis `assets.bgTiles`.
  494│  *  Le décomp pattern :
  495│  *    pixels = AllocZeroed(height * width * 32);
  496│  *    for (i, j) : CpuCopy16(GetPartyMenuBgTile(b[x+j + (y+i)*stride]), &pixels[(i*width + j)*32], 32)
  497│  *    BlitBitmapToWindow(wid, pixels, x*8, y*8, width*8, height*8)
  498│  */
  499│ function _blitSlotFrame(
  500│   windowId: number,
  501│   tilemap: Uint8Array, stride: number,
  502│   rx: number, ry: number, rw: number, rh: number,
  503│ ): void {
  504│   if (!_assets) return;
  505│   const pixels = new Uint8Array(rw * rh * 32);
  506│   for (let i = 0; i < rh; i++) {
  507│     for (let j = 0; j < rw; j++) {
  508│       const tileIdx = tilemap[(rx + j) + (ry + i) * stride];
  509│       const srcOff = tileIdx * 32;
  510│       pixels.set(_assets.bgTiles.subarray(srcOff, srcOff + 32), (i * rw + j) * 32);
  511│     }
  512│   }
  513│   BlitBitmapToWindow(windowId, pixels, rx * 8, ry * 8, rw * 8, rh * 8, rw * 8);
  514│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DrawEmptySlot  —  party_menu.c:2193-2204 (12 l)
▌ ‖ port: _loadPartyBoxPalSet (src/engine/party-screen.ts:728-739)  ← cite "party_menu.c:2198" @src/engine/party-screen.ts:728
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2193-2204 ────────────────────────────────────────
 2193│ static void DrawEmptySlot(u8 windowId)
 2194│ {
 2195│     BlitBitmapToPartyWindow(windowId, sSlotTilemap_WideEmpty, 18, 0, 0, 18, 3);
 2196│ }
 2197│ 
 2198│ #define LOAD_PARTY_BOX_PAL(paletteIds, paletteOffsets)                                                    \
 2199│ {                                                                                                         \
 2200│     LoadPalette(GetPartyMenuPalBufferPtr(paletteIds[0]), paletteOffsets[0] + palOffset, PLTT_SIZEOF(1));  \
 2201│     LoadPalette(GetPartyMenuPalBufferPtr(paletteIds[1]), paletteOffsets[1] + palOffset, PLTT_SIZEOF(1));  \
 2202│     LoadPalette(GetPartyMenuPalBufferPtr(paletteIds[2]), paletteOffsets[2] + palOffset, PLTT_SIZEOF(1));  \
 2203│ }
 2204│ 
├─ PORT src/engine/party-screen.ts:728-739 ────────────────────────────────────────
  728│ /** 1:1 décomp `LOAD_PARTY_BOX_PAL` macro (party_menu.c:2198) :
  729│  *  Pour chaque (palId, palOffset) dans les arrays 3-element, copie 1 RGB15 color
  730│  *  depuis `bgPalette[palId]` (= snapshot des 11 sub-pals via PartyMenuInternal->palBuffer)
  731│  *  vers la sub-pal du window slot à position `palOffset + BG_PLTT_ID(slot_pal_num)`. */
  732│ function _loadPartyBoxPalSet(slotPalNum: number, palIds: readonly number[], palOffsets: readonly number[]): void {
  733│   if (!_assets) return;
  734│   for (let i = 0; i < 3; i++) {
  735│     const src = new Uint16Array(1);
  736│     src[0] = _assets.bgPalette[palIds[i]];
  737│     LoadPalette(src, slotPalNum * 16 + palOffsets[i], 2);
  738│   }
  739│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ LoadPartyBoxPalette  —  party_menu.c:2205-2281 (77 l)
▌ ‖ port: _loadPartyBoxPalette (src/engine/party-screen.ts:741-800)  ← cite "party_menu.c:2205" @src/engine/party-screen.ts:741
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2205-2281 ────────────────────────────────────────
 2205│ static void LoadPartyBoxPalette(struct PartyMenuBox *menuBox, u8 palFlags)
 2206│ {
 2207│     u8 palOffset = BG_PLTT_ID(GetWindowAttribute(menuBox->windowId, WINDOW_PALETTE_NUM));
 2208│ 
 2209│     if (palFlags & PARTY_PAL_NO_MON)
 2210│     {
 2211│         LOAD_PARTY_BOX_PAL(sPartyBoxNoMonPalIds, sPartyBoxNoMonPalOffsets);
 2212│     }
 2213│     else if (palFlags & PARTY_PAL_TO_SOFTBOIL)
 2214│     {
 2215│         if (palFlags & PARTY_PAL_SELECTED)
 2216│         {
 2217│             LOAD_PARTY_BOX_PAL(sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
 2218│             LOAD_PARTY_BOX_PAL(sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
 2219│         }
 2220│         else
 2221│         {
 2222│             LOAD_PARTY_BOX_PAL(sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
 2223│             LOAD_PARTY_BOX_PAL(sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
 2224│         }
 2225│     }
 2226│     else if (palFlags & PARTY_PAL_SWITCHING)
 2227│     {
 2228│         LOAD_PARTY_BOX_PAL(sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
 2229│         LOAD_PARTY_BOX_PAL(sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
 2230│     }
 2231│     else if (palFlags & PARTY_PAL_TO_SWITCH)
 2232│     {
 2233│         if (palFlags & PARTY_PAL_SELECTED)
 2234│         {
 2235│             LOAD_PARTY_BOX_PAL(sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
 2236│             LOAD_PARTY_BOX_PAL(sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
 2237│         }
 2238│         else
 2239│         {
 2240│             LOAD_PARTY_BOX_PAL(sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
 2241│             LOAD_PARTY_BOX_PAL(sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
 2242│         }
 2243│     }
 2244│     else if (palFlags & PARTY_PAL_FAINTED)
 2245│     {
 2246│         if (palFlags & PARTY_PAL_SELECTED)
 2247│         {
 2248│             LOAD_PARTY_BOX_PAL(sPartyBoxCurrSelectionFaintedPalIds, sPartyBoxPalOffsets1);
 2249│             LOAD_PARTY_BOX_PAL(sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
 2250│         }
 2251│         else
 2252│         {
 2253│             LOAD_PARTY_BOX_PAL(sPartyBoxFaintedPalIds1, sPartyBoxPalOffsets1);
 2254│             LOAD_PARTY_BOX_PAL(sPartyBoxFaintedPalIds2, sPartyBoxPalOffsets2);
 2255│         }
 2256│     }
 2257│     else if (palFlags & PARTY_PAL_MULTI_ALT)
 2258│     {
 2259│         if (palFlags & PARTY_PAL_SELECTED)
 2260│         {
 2261│             LOAD_PARTY_BOX_PAL(sPartyBoxCurrSelectionMultiPalIds, sPartyBoxPalOffsets1);
 2262│             LOAD_PARTY_BOX_PAL(sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
 2263│         }
 2264│         else
 2265│         {
 2266│             LOAD_PARTY_BOX_PAL(sPartyBoxMultiPalIds1, sPartyBoxPalOffsets1);
 2267│             LOAD_PARTY_BOX_PAL(sPartyBoxMultiPalIds2, sPartyBoxPalOffsets2);
 2268│         }
 2269│     }
 2270│     else if (palFlags & PARTY_PAL_SELECTED)
 2271│     {
 2272│         LOAD_PARTY_BOX_PAL(sPartyBoxCurrSelectionPalIds1, sPartyBoxPalOffsets1);
 2273│         LOAD_PARTY_BOX_PAL(sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
 2274│     }
 2275│     else
 2276│     {
 2277│         LOAD_PARTY_BOX_PAL(sPartyBoxEmptySlotPalIds1, sPartyBoxPalOffsets1);
 2278│         LOAD_PARTY_BOX_PAL(sPartyBoxEmptySlotPalIds2, sPartyBoxPalOffsets2);
 2279│     }
 2280│ }
 2281│ 
├─ PORT src/engine/party-screen.ts:741-800 ────────────────────────────────────────
  741│ /** 1:1 décomp `LoadPartyBoxPalette` (party_menu.c:2205) :
  742│  *  Sélectionne le palette set selon palFlags + applique 6 color swap (2 sets de 3). */
  743│ function _loadPartyBoxPalette(slotIdx: number, palFlags: number): void {
  744│   // Slot palette num = paletteNum du window template (= 3 pour slot 0, 4-8 pour slots 1-5).
  745│   const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum;
  746│   if (slotPalNum === undefined) return;
  747│   if (palFlags & PARTY_PAL_NO_MON) {
  748│     _loadPartyBoxPalSet(slotPalNum, sPartyBoxNoMonPalIds, sPartyBoxNoMonPalOffsets);
  749│     return;
  750│   }
  751│   if (palFlags & PARTY_PAL_TO_SOFTBOIL) {
  752│     _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
  753│     if (palFlags & PARTY_PAL_SELECTED)
  754│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
  755│     else
  756│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
  757│     return;
  758│   }
  759│   if (palFlags & PARTY_PAL_SWITCHING) {
  760│     _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
  761│     _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
  762│     return;
  763│   }
  764│   if (palFlags & PARTY_PAL_TO_SWITCH) {
  765│     _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
  766│     if (palFlags & PARTY_PAL_SELECTED)
  767│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
  768│     else
  769│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
  770│     return;
  771│   }
  772│   if (palFlags & PARTY_PAL_FAINTED) {
  773│     if (palFlags & PARTY_PAL_SELECTED) {
  774│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionFaintedPalIds, sPartyBoxPalOffsets1);
  775│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
  776│     } else {
  777│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxFaintedPalIds1, sPartyBoxPalOffsets1);
  778│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxFaintedPalIds2, sPartyBoxPalOffsets2);
  779│     }
  780│     return;
  781│   }
  782│   if (palFlags & PARTY_PAL_MULTI_ALT) {
  783│     if (palFlags & PARTY_PAL_SELECTED) {
  784│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionMultiPalIds, sPartyBoxPalOffsets1);
  785│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
  786│     } else {
  787│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxMultiPalIds1, sPartyBoxPalOffsets1);
  788│       _loadPartyBoxPalSet(slotPalNum, sPartyBoxMultiPalIds2, sPartyBoxPalOffsets2);
  789│     }
  790│     return;
  791│   }
  792│   if (palFlags & PARTY_PAL_SELECTED) {
  793│     _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds1, sPartyBoxPalOffsets1);
  794│     _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
  795│     return;
  796│   }
  797│   // Default (= non-selected mon slot).
  798│   _loadPartyBoxPalSet(slotPalNum, sPartyBoxEmptySlotPalIds1, sPartyBoxPalOffsets1);
  799│   _loadPartyBoxPalSet(slotPalNum, sPartyBoxEmptySlotPalIds2, sPartyBoxPalOffsets2);
  800│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DisplayPartyPokemonBarDetail  —  party_menu.c:2282-2286 (5 l)
▌ ‖ port: _drawSlot (src/engine/party-screen.ts:554-648)  ← cite "party_menu.c:2282" @src/engine/party-screen.ts:609
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2282-2286 ────────────────────────────────────────
 2282│ static void DisplayPartyPokemonBarDetail(u8 windowId, const u8 *str, u8 color, const u8 *align)
 2283│ {
 2284│     AddTextPrinterParameterized3(windowId, FONT_SMALL, align[0], align[1], sFontColorTable[color], 0, str);
 2285│ }
 2286│ 
├─ PORT src/engine/party-screen.ts:554-648 ────────────────────────────────────────
  554│ /** Render text for slot N. Positions 1:1 décomp `sPartyBoxInfoRects`
  555│  *  (party_menu.h:32) — Nickname/Level/HP/MaxHP fixed coords per box layout. */
  556│ function _drawSlot(slotIdx: number): void {
  557│   if (_slotWindowIds[slotIdx] === undefined) return;
  558│   const wid = _slotWindowIds[slotIdx];
  559│   const mon = (gameState.party as PokemonInstance[])[slotIdx];
  560│   // 1:1 décomp RenderPartyMenuBox → SetPartyMonAilmentGfx + UpdatePartyMon
  561│   // HeldItemSprite : rafraîchit icône statut + objet tenu du slot (sprites
  562│   // slot-pinned, dérivés du mon courant).
  563│   _updatePartyMonAilmentGfx(slotIdx);
  564│   _updatePartyMonHeldItem(slotIdx);
  565│   if (!mon) {
  566│     // Slot vide : no text (= just empty frame déjà blit).
  567│     CopyWindowToVram(wid, 3);
  568│     return;
  569│   }
  570│   // 1:1 décomp `DisplayPartyPokemonData` (party_menu.c:872) : un ŒUF
  571│   // n'affiche QUE le nickname (= "OEUF", GetMonNickname égg → gText_Egg
  572│   // Nickname) — PAS de niveau / genre / PV / barre PV (blitFunc(.,TRUE)
  573│   // blanchit ces zones). Le sprite icône = l'icône d'œuf (cf. _loadSlotIcon).
  574│   if (mon.isEgg) {
  575│     const eggName = getString('gText_EggNickname');  // "OEUF" (strings.c:21)
  576│     if (slotIdx === 0) {
  577│       AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  578│     } else {
  579│       AddTextPrinterParameterized3(wid, FONT_SMALL, 22, 3, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  580│     }
  581│     CopyWindowToVram(wid, 3);
  582│     return;
  583│   }
  584│   // 1:1 décomp DisplayPartyPokemonGender (party_menu.c:2333) : symbol "♂"/"♀"
  585│   // affiché à (64, 20) slot 0 left column ou (62, 12) slot 1-5 right column,
  586│   // AVEC palette swap genderMale/Female aux positions TEXT_DYNAMIC_COLOR_2/3
  587│   // de la sub-pal du slot. Color triple stays [0, 0xB, 0xC] for both genders.
  588│   const gSym = getMonGenderSymbol(mon);
  589│   const genderStr = gSym === 'M' ? '♂' : gSym === 'F' ? '♀' : '';
  590│   if (genderStr) {
  591│     const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum ?? 3;
  592│     _loadGenderColors(slotPalNum, gSym === 'M');
  593│   }
  594│   // 1:1 décomp DisplayPartyPokemonLevelCheck (party_menu.c:2300-2312) : le
  595│   // NIVEAU n'est dessiné QUE si ailment ∈ {AILMENT_NONE(0), AILMENT_PKRS(6)}.
  596│   // Tout autre statut (PSN/PAR/SLP/FRZ/BRN) ou K.O. (HP=0=FNT) → niveau
  597│   // BLANC, laissant la place à l'icône statut 32×8 (sinon : pixels du
  598│   // niveau derrière l'icône burn = le bug rapporté). Genre/PV/barre NON
  599│   // suppressés (1:1 :2323/:2356 — aucun check ailment).
  600│   const _lvA = _ailmentFromStatus(mon);
  601│   const showLevel = _lvA === 0 || _lvA === 6;
  602│   if (slotIdx === 0) {
  603│     // 1:1 décomp PARTY_BOX_LEFT_COLUMN (party_menu.h:32) :
  604│     //   Nickname (24, 11) — width=40
  605│     //   Level    (32, 20) — "N.X"
  606│     //   Gender   (64, 20) — width 8x8
  607│     //   HP       (38, 37)
  608│     //   MaxHP    (53, 37)
  609│     // 1:1 décomp DisplayPartyPokemonBarDetail (party_menu.c:2282) :
  610│     //   AddTextPrinterParameterized3(windowId, FONT_SMALL, ...) — TOUT en FONT_SMALL.
  611│     AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  612│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  32, 20, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  613│     if (genderStr) {
  614│       AddTextPrinterParameterized3(wid, FONT_SMALL, 64, 20, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  615│     }
  616│     // 1:1 décomp DisplayPartyPokemonHP (party_menu.c:2367) + DisplayParty
  617│     // PokemonMaxHP (:2388) : DEUX AddTextPrinterParameterized3 FONT_SMALL
  618│     // SÉPARÉS aux coords sPartyBoxInfoRects[PARTY_BOX_LEFT_COLUMN] (party_
  619│     // menu.h:42-43) : dimensions[12]=(38,37) HP, dimensions[16]=(53,37) MaxHP.
  620│     //   HP    = ConvertIntToDecimalStringN(hp,    RIGHT_ALIGN, 3) + "/"
  621│     //   MaxHP = "/" + ConvertIntToDecimalStringN(maxhp, RIGHT_ALIGN, 3)
  622│     // L'overlap des 2 "/" (FONT_SMALL widths = ROM exacts : sp 3, digit 5,
  623│     // '/' 5 — vérifiés vs gFontSmallLatinGlyphWidths fonts.c:40) produit le
  624│     // visuel ROM 1:1. PLUS de hack 1-string / espaces hardcodés.
  625│     AddTextPrinterParameterized3(wid, FONT_SMALL, 38, 37, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  626│     AddTextPrinterParameterized3(wid, FONT_SMALL, 53, 37, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  627│   } else {
  628│     // 1:1 décomp PARTY_BOX_RIGHT_COLUMN :
  629│     //   Nickname (22, 3) — width=40
  630│     //   Level    (30, 12)
  631│     //   Gender   (62, 12)
  632│     //   HP       dimensions[12]=(102, 12)  MaxHP dimensions[16]=(117, 12)
  633│     AddTextPrinterParameterized3(wid, FONT_SMALL, 22,  3, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  634│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  30, 12, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  635│     if (genderStr) {
  636│       AddTextPrinterParameterized3(wid, FONT_SMALL, 62, 12, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  637│     }
  638│     // 1:1 décomp DisplayPartyPokemonHP/MaxHP — 2 strings FONT_SMALL séparés
  639│     // aux coords sPartyBoxInfoRects[PARTY_BOX_RIGHT_COLUMN] (party_menu.h:56-57).
  640│     AddTextPrinterParameterized3(wid, FONT_SMALL, 102, 12, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  641│     AddTextPrinterParameterized3(wid, FONT_SMALL, 117, 12, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  642│   }
  643│   void MON_MALE; void MON_FEMALE;  // referenced via getMonGenderSymbol
  644│   // 1:1 décomp DisplayPartyPokemonHPBar : draw colored bar fill (green/yellow/
  645│   // red selon HP fraction) avec palette swap aux positions 9-10 de la sub-pal.
  646│   _drawHpBar(slotIdx, mon);
  647│   CopyWindowToVram(wid, 3);
  648│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DisplayPartyPokemonLevelCheck  —  party_menu.c:2300-2314 (15 l)
▌ ‖ port: _drawSlot (src/engine/party-screen.ts:554-648)  ← cite "party_menu.c:2300-2312" @src/engine/party-screen.ts:594
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2300-2314 ────────────────────────────────────────
 2300│ static void DisplayPartyPokemonLevelCheck(struct Pokemon *mon, struct PartyMenuBox *menuBox, u8 c)
 2301│ {
 2302│     if (GetMonData(mon, MON_DATA_SPECIES) != SPECIES_NONE)
 2303│     {
 2304│         u8 ailment = GetMonAilment(mon);
 2305│         if (ailment == AILMENT_NONE || ailment == AILMENT_PKRS)
 2306│         {
 2307│             if (c != 0)
 2308│                 menuBox->infoRects->blitFunc(menuBox->windowId, menuBox->infoRects->dimensions[4] >> 3, (menuBox->infoRects->dimensions[5] >> 3) + 1, menuBox->infoRects->dimensions[6] >> 3, menuBox->infoRects->dimensions[7] >> 3, FALSE);
 2309│             if (c != 2)
 2310│                 DisplayPartyPokemonLevel(GetMonData(mon, MON_DATA_LEVEL), menuBox);
 2311│         }
 2312│     }
 2313│ }
 2314│ 
├─ PORT src/engine/party-screen.ts:554-648 ────────────────────────────────────────
  554│ /** Render text for slot N. Positions 1:1 décomp `sPartyBoxInfoRects`
  555│  *  (party_menu.h:32) — Nickname/Level/HP/MaxHP fixed coords per box layout. */
  556│ function _drawSlot(slotIdx: number): void {
  557│   if (_slotWindowIds[slotIdx] === undefined) return;
  558│   const wid = _slotWindowIds[slotIdx];
  559│   const mon = (gameState.party as PokemonInstance[])[slotIdx];
  560│   // 1:1 décomp RenderPartyMenuBox → SetPartyMonAilmentGfx + UpdatePartyMon
  561│   // HeldItemSprite : rafraîchit icône statut + objet tenu du slot (sprites
  562│   // slot-pinned, dérivés du mon courant).
  563│   _updatePartyMonAilmentGfx(slotIdx);
  564│   _updatePartyMonHeldItem(slotIdx);
  565│   if (!mon) {
  566│     // Slot vide : no text (= just empty frame déjà blit).
  567│     CopyWindowToVram(wid, 3);
  568│     return;
  569│   }
  570│   // 1:1 décomp `DisplayPartyPokemonData` (party_menu.c:872) : un ŒUF
  571│   // n'affiche QUE le nickname (= "OEUF", GetMonNickname égg → gText_Egg
  572│   // Nickname) — PAS de niveau / genre / PV / barre PV (blitFunc(.,TRUE)
  573│   // blanchit ces zones). Le sprite icône = l'icône d'œuf (cf. _loadSlotIcon).
  574│   if (mon.isEgg) {
  575│     const eggName = getString('gText_EggNickname');  // "OEUF" (strings.c:21)
  576│     if (slotIdx === 0) {
  577│       AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  578│     } else {
  579│       AddTextPrinterParameterized3(wid, FONT_SMALL, 22, 3, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  580│     }
  581│     CopyWindowToVram(wid, 3);
  582│     return;
  583│   }
  584│   // 1:1 décomp DisplayPartyPokemonGender (party_menu.c:2333) : symbol "♂"/"♀"
  585│   // affiché à (64, 20) slot 0 left column ou (62, 12) slot 1-5 right column,
  586│   // AVEC palette swap genderMale/Female aux positions TEXT_DYNAMIC_COLOR_2/3
  587│   // de la sub-pal du slot. Color triple stays [0, 0xB, 0xC] for both genders.
  588│   const gSym = getMonGenderSymbol(mon);
  589│   const genderStr = gSym === 'M' ? '♂' : gSym === 'F' ? '♀' : '';
  590│   if (genderStr) {
  591│     const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum ?? 3;
  592│     _loadGenderColors(slotPalNum, gSym === 'M');
  593│   }
  594│   // 1:1 décomp DisplayPartyPokemonLevelCheck (party_menu.c:2300-2312) : le
  595│   // NIVEAU n'est dessiné QUE si ailment ∈ {AILMENT_NONE(0), AILMENT_PKRS(6)}.
  596│   // Tout autre statut (PSN/PAR/SLP/FRZ/BRN) ou K.O. (HP=0=FNT) → niveau
  597│   // BLANC, laissant la place à l'icône statut 32×8 (sinon : pixels du
  598│   // niveau derrière l'icône burn = le bug rapporté). Genre/PV/barre NON
  599│   // suppressés (1:1 :2323/:2356 — aucun check ailment).
  600│   const _lvA = _ailmentFromStatus(mon);
  601│   const showLevel = _lvA === 0 || _lvA === 6;
  602│   if (slotIdx === 0) {
  603│     // 1:1 décomp PARTY_BOX_LEFT_COLUMN (party_menu.h:32) :
  604│     //   Nickname (24, 11) — width=40
  605│     //   Level    (32, 20) — "N.X"
  606│     //   Gender   (64, 20) — width 8x8
  607│     //   HP       (38, 37)
  608│     //   MaxHP    (53, 37)
  609│     // 1:1 décomp DisplayPartyPokemonBarDetail (party_menu.c:2282) :
  610│     //   AddTextPrinterParameterized3(windowId, FONT_SMALL, ...) — TOUT en FONT_SMALL.
  611│     AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  612│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  32, 20, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  613│     if (genderStr) {
  614│       AddTextPrinterParameterized3(wid, FONT_SMALL, 64, 20, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  615│     }
  616│     // 1:1 décomp DisplayPartyPokemonHP (party_menu.c:2367) + DisplayParty
  617│     // PokemonMaxHP (:2388) : DEUX AddTextPrinterParameterized3 FONT_SMALL
  618│     // SÉPARÉS aux coords sPartyBoxInfoRects[PARTY_BOX_LEFT_COLUMN] (party_
  619│     // menu.h:42-43) : dimensions[12]=(38,37) HP, dimensions[16]=(53,37) MaxHP.
  620│     //   HP    = ConvertIntToDecimalStringN(hp,    RIGHT_ALIGN, 3) + "/"
  621│     //   MaxHP = "/" + ConvertIntToDecimalStringN(maxhp, RIGHT_ALIGN, 3)
  622│     // L'overlap des 2 "/" (FONT_SMALL widths = ROM exacts : sp 3, digit 5,
  623│     // '/' 5 — vérifiés vs gFontSmallLatinGlyphWidths fonts.c:40) produit le
  624│     // visuel ROM 1:1. PLUS de hack 1-string / espaces hardcodés.
  625│     AddTextPrinterParameterized3(wid, FONT_SMALL, 38, 37, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  626│     AddTextPrinterParameterized3(wid, FONT_SMALL, 53, 37, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  627│   } else {
  628│     // 1:1 décomp PARTY_BOX_RIGHT_COLUMN :
  629│     //   Nickname (22, 3) — width=40
  630│     //   Level    (30, 12)
  631│     //   Gender   (62, 12)
  632│     //   HP       dimensions[12]=(102, 12)  MaxHP dimensions[16]=(117, 12)
  633│     AddTextPrinterParameterized3(wid, FONT_SMALL, 22,  3, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  634│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  30, 12, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  635│     if (genderStr) {
  636│       AddTextPrinterParameterized3(wid, FONT_SMALL, 62, 12, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  637│     }
  638│     // 1:1 décomp DisplayPartyPokemonHP/MaxHP — 2 strings FONT_SMALL séparés
  639│     // aux coords sPartyBoxInfoRects[PARTY_BOX_RIGHT_COLUMN] (party_menu.h:56-57).
  640│     AddTextPrinterParameterized3(wid, FONT_SMALL, 102, 12, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  641│     AddTextPrinterParameterized3(wid, FONT_SMALL, 117, 12, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  642│   }
  643│   void MON_MALE; void MON_FEMALE;  // referenced via getMonGenderSymbol
  644│   // 1:1 décomp DisplayPartyPokemonHPBar : draw colored bar fill (green/yellow/
  645│   // red selon HP fraction) avec palette swap aux positions 9-10 de la sub-pal.
  646│   _drawHpBar(slotIdx, mon);
  647│   CopyWindowToVram(wid, 3);
  648│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DisplayPartyPokemonGender  —  party_menu.c:2333-2355 (23 l)
▌ ‖ port: _drawSlot (src/engine/party-screen.ts:554-648)  ← cite "party_menu.c:2333" @src/engine/party-screen.ts:584
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2333-2355 ────────────────────────────────────────
 2333│ static void DisplayPartyPokemonGender(u8 gender, u16 species, u8 *nickname, struct PartyMenuBox *menuBox)
 2334│ {
 2335│     u8 palOffset = BG_PLTT_ID(GetWindowAttribute(menuBox->windowId, WINDOW_PALETTE_NUM));
 2336│ 
 2337│     if (species == SPECIES_NONE)
 2338│         return;
 2339│     if ((species == SPECIES_NIDORAN_M || species == SPECIES_NIDORAN_F) && StringCompare(nickname, gSpeciesNames[species]) == 0)
 2340│         return;
 2341│     switch (gender)
 2342│     {
 2343│     case MON_MALE:
 2344│         LoadPalette(GetPartyMenuPalBufferPtr(sGenderMalePalIds[0]), sGenderPalOffsets[0] + palOffset, PLTT_SIZEOF(1));
 2345│         LoadPalette(GetPartyMenuPalBufferPtr(sGenderMalePalIds[1]), sGenderPalOffsets[1] + palOffset, PLTT_SIZEOF(1));
 2346│         DisplayPartyPokemonBarDetail(menuBox->windowId, gText_MaleSymbol, 2, &menuBox->infoRects->dimensions[8]);
 2347│         break;
 2348│     case MON_FEMALE:
 2349│         LoadPalette(GetPartyMenuPalBufferPtr(sGenderFemalePalIds[0]), sGenderPalOffsets[0] + palOffset, PLTT_SIZEOF(1));
 2350│         LoadPalette(GetPartyMenuPalBufferPtr(sGenderFemalePalIds[1]), sGenderPalOffsets[1] + palOffset, PLTT_SIZEOF(1));
 2351│         DisplayPartyPokemonBarDetail(menuBox->windowId, gText_FemaleSymbol, 2, &menuBox->infoRects->dimensions[8]);
 2352│         break;
 2353│     }
 2354│ }
 2355│ 
├─ PORT src/engine/party-screen.ts:554-648 ────────────────────────────────────────
  554│ /** Render text for slot N. Positions 1:1 décomp `sPartyBoxInfoRects`
  555│  *  (party_menu.h:32) — Nickname/Level/HP/MaxHP fixed coords per box layout. */
  556│ function _drawSlot(slotIdx: number): void {
  557│   if (_slotWindowIds[slotIdx] === undefined) return;
  558│   const wid = _slotWindowIds[slotIdx];
  559│   const mon = (gameState.party as PokemonInstance[])[slotIdx];
  560│   // 1:1 décomp RenderPartyMenuBox → SetPartyMonAilmentGfx + UpdatePartyMon
  561│   // HeldItemSprite : rafraîchit icône statut + objet tenu du slot (sprites
  562│   // slot-pinned, dérivés du mon courant).
  563│   _updatePartyMonAilmentGfx(slotIdx);
  564│   _updatePartyMonHeldItem(slotIdx);
  565│   if (!mon) {
  566│     // Slot vide : no text (= just empty frame déjà blit).
  567│     CopyWindowToVram(wid, 3);
  568│     return;
  569│   }
  570│   // 1:1 décomp `DisplayPartyPokemonData` (party_menu.c:872) : un ŒUF
  571│   // n'affiche QUE le nickname (= "OEUF", GetMonNickname égg → gText_Egg
  572│   // Nickname) — PAS de niveau / genre / PV / barre PV (blitFunc(.,TRUE)
  573│   // blanchit ces zones). Le sprite icône = l'icône d'œuf (cf. _loadSlotIcon).
  574│   if (mon.isEgg) {
  575│     const eggName = getString('gText_EggNickname');  // "OEUF" (strings.c:21)
  576│     if (slotIdx === 0) {
  577│       AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  578│     } else {
  579│       AddTextPrinterParameterized3(wid, FONT_SMALL, 22, 3, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  580│     }
  581│     CopyWindowToVram(wid, 3);
  582│     return;
  583│   }
  584│   // 1:1 décomp DisplayPartyPokemonGender (party_menu.c:2333) : symbol "♂"/"♀"
  585│   // affiché à (64, 20) slot 0 left column ou (62, 12) slot 1-5 right column,
  586│   // AVEC palette swap genderMale/Female aux positions TEXT_DYNAMIC_COLOR_2/3
  587│   // de la sub-pal du slot. Color triple stays [0, 0xB, 0xC] for both genders.
  588│   const gSym = getMonGenderSymbol(mon);
  589│   const genderStr = gSym === 'M' ? '♂' : gSym === 'F' ? '♀' : '';
  590│   if (genderStr) {
  591│     const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum ?? 3;
  592│     _loadGenderColors(slotPalNum, gSym === 'M');
  593│   }
  594│   // 1:1 décomp DisplayPartyPokemonLevelCheck (party_menu.c:2300-2312) : le
  595│   // NIVEAU n'est dessiné QUE si ailment ∈ {AILMENT_NONE(0), AILMENT_PKRS(6)}.
  596│   // Tout autre statut (PSN/PAR/SLP/FRZ/BRN) ou K.O. (HP=0=FNT) → niveau
  597│   // BLANC, laissant la place à l'icône statut 32×8 (sinon : pixels du
  598│   // niveau derrière l'icône burn = le bug rapporté). Genre/PV/barre NON
  599│   // suppressés (1:1 :2323/:2356 — aucun check ailment).
  600│   const _lvA = _ailmentFromStatus(mon);
  601│   const showLevel = _lvA === 0 || _lvA === 6;
  602│   if (slotIdx === 0) {
  603│     // 1:1 décomp PARTY_BOX_LEFT_COLUMN (party_menu.h:32) :
  604│     //   Nickname (24, 11) — width=40
  605│     //   Level    (32, 20) — "N.X"
  606│     //   Gender   (64, 20) — width 8x8
  607│     //   HP       (38, 37)
  608│     //   MaxHP    (53, 37)
  609│     // 1:1 décomp DisplayPartyPokemonBarDetail (party_menu.c:2282) :
  610│     //   AddTextPrinterParameterized3(windowId, FONT_SMALL, ...) — TOUT en FONT_SMALL.
  611│     AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  612│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  32, 20, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  613│     if (genderStr) {
  614│       AddTextPrinterParameterized3(wid, FONT_SMALL, 64, 20, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  615│     }
  616│     // 1:1 décomp DisplayPartyPokemonHP (party_menu.c:2367) + DisplayParty
  617│     // PokemonMaxHP (:2388) : DEUX AddTextPrinterParameterized3 FONT_SMALL
  618│     // SÉPARÉS aux coords sPartyBoxInfoRects[PARTY_BOX_LEFT_COLUMN] (party_
  619│     // menu.h:42-43) : dimensions[12]=(38,37) HP, dimensions[16]=(53,37) MaxHP.
  620│     //   HP    = ConvertIntToDecimalStringN(hp,    RIGHT_ALIGN, 3) + "/"
  621│     //   MaxHP = "/" + ConvertIntToDecimalStringN(maxhp, RIGHT_ALIGN, 3)
  622│     // L'overlap des 2 "/" (FONT_SMALL widths = ROM exacts : sp 3, digit 5,
  623│     // '/' 5 — vérifiés vs gFontSmallLatinGlyphWidths fonts.c:40) produit le
  624│     // visuel ROM 1:1. PLUS de hack 1-string / espaces hardcodés.
  625│     AddTextPrinterParameterized3(wid, FONT_SMALL, 38, 37, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  626│     AddTextPrinterParameterized3(wid, FONT_SMALL, 53, 37, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  627│   } else {
  628│     // 1:1 décomp PARTY_BOX_RIGHT_COLUMN :
  629│     //   Nickname (22, 3) — width=40
  630│     //   Level    (30, 12)
  631│     //   Gender   (62, 12)
  632│     //   HP       dimensions[12]=(102, 12)  MaxHP dimensions[16]=(117, 12)
  633│     AddTextPrinterParameterized3(wid, FONT_SMALL, 22,  3, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  634│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  30, 12, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  635│     if (genderStr) {
  636│       AddTextPrinterParameterized3(wid, FONT_SMALL, 62, 12, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  637│     }
  638│     // 1:1 décomp DisplayPartyPokemonHP/MaxHP — 2 strings FONT_SMALL séparés
  639│     // aux coords sPartyBoxInfoRects[PARTY_BOX_RIGHT_COLUMN] (party_menu.h:56-57).
  640│     AddTextPrinterParameterized3(wid, FONT_SMALL, 102, 12, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  641│     AddTextPrinterParameterized3(wid, FONT_SMALL, 117, 12, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  642│   }
  643│   void MON_MALE; void MON_FEMALE;  // referenced via getMonGenderSymbol
  644│   // 1:1 décomp DisplayPartyPokemonHPBar : draw colored bar fill (green/yellow/
  645│   // red selon HP fraction) avec palette swap aux positions 9-10 de la sub-pal.
  646│   _drawHpBar(slotIdx, mon);
  647│   CopyWindowToVram(wid, 3);
  648│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DisplayPartyPokemonHP  —  party_menu.c:2367-2376 (10 l)
▌ ‖ port: _drawSlot (src/engine/party-screen.ts:554-648)  ← cite "party_menu.c:2367" @src/engine/party-screen.ts:616
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2367-2376 ────────────────────────────────────────
 2367│ static void DisplayPartyPokemonHP(u16 hp, struct PartyMenuBox *menuBox)
 2368│ {
 2369│     u8 *strOut = ConvertIntToDecimalStringN(gStringVar1, hp, STR_CONV_MODE_RIGHT_ALIGN, 3);
 2370│ 
 2371│     strOut[0] = CHAR_SLASH;
 2372│     strOut[1] = EOS;
 2373│ 
 2374│     DisplayPartyPokemonBarDetail(menuBox->windowId, gStringVar1, 0, &menuBox->infoRects->dimensions[12]);
 2375│ }
 2376│ 
├─ PORT src/engine/party-screen.ts:554-648 ────────────────────────────────────────
  554│ /** Render text for slot N. Positions 1:1 décomp `sPartyBoxInfoRects`
  555│  *  (party_menu.h:32) — Nickname/Level/HP/MaxHP fixed coords per box layout. */
  556│ function _drawSlot(slotIdx: number): void {
  557│   if (_slotWindowIds[slotIdx] === undefined) return;
  558│   const wid = _slotWindowIds[slotIdx];
  559│   const mon = (gameState.party as PokemonInstance[])[slotIdx];
  560│   // 1:1 décomp RenderPartyMenuBox → SetPartyMonAilmentGfx + UpdatePartyMon
  561│   // HeldItemSprite : rafraîchit icône statut + objet tenu du slot (sprites
  562│   // slot-pinned, dérivés du mon courant).
  563│   _updatePartyMonAilmentGfx(slotIdx);
  564│   _updatePartyMonHeldItem(slotIdx);
  565│   if (!mon) {
  566│     // Slot vide : no text (= just empty frame déjà blit).
  567│     CopyWindowToVram(wid, 3);
  568│     return;
  569│   }
  570│   // 1:1 décomp `DisplayPartyPokemonData` (party_menu.c:872) : un ŒUF
  571│   // n'affiche QUE le nickname (= "OEUF", GetMonNickname égg → gText_Egg
  572│   // Nickname) — PAS de niveau / genre / PV / barre PV (blitFunc(.,TRUE)
  573│   // blanchit ces zones). Le sprite icône = l'icône d'œuf (cf. _loadSlotIcon).
  574│   if (mon.isEgg) {
  575│     const eggName = getString('gText_EggNickname');  // "OEUF" (strings.c:21)
  576│     if (slotIdx === 0) {
  577│       AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  578│     } else {
  579│       AddTextPrinterParameterized3(wid, FONT_SMALL, 22, 3, COLOR_TEXT, TEXT_SKIP_DRAW, eggName);
  580│     }
  581│     CopyWindowToVram(wid, 3);
  582│     return;
  583│   }
  584│   // 1:1 décomp DisplayPartyPokemonGender (party_menu.c:2333) : symbol "♂"/"♀"
  585│   // affiché à (64, 20) slot 0 left column ou (62, 12) slot 1-5 right column,
  586│   // AVEC palette swap genderMale/Female aux positions TEXT_DYNAMIC_COLOR_2/3
  587│   // de la sub-pal du slot. Color triple stays [0, 0xB, 0xC] for both genders.
  588│   const gSym = getMonGenderSymbol(mon);
  589│   const genderStr = gSym === 'M' ? '♂' : gSym === 'F' ? '♀' : '';
  590│   if (genderStr) {
  591│     const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum ?? 3;
  592│     _loadGenderColors(slotPalNum, gSym === 'M');
  593│   }
  594│   // 1:1 décomp DisplayPartyPokemonLevelCheck (party_menu.c:2300-2312) : le
  595│   // NIVEAU n'est dessiné QUE si ailment ∈ {AILMENT_NONE(0), AILMENT_PKRS(6)}.
  596│   // Tout autre statut (PSN/PAR/SLP/FRZ/BRN) ou K.O. (HP=0=FNT) → niveau
  597│   // BLANC, laissant la place à l'icône statut 32×8 (sinon : pixels du
  598│   // niveau derrière l'icône burn = le bug rapporté). Genre/PV/barre NON
  599│   // suppressés (1:1 :2323/:2356 — aucun check ailment).
  600│   const _lvA = _ailmentFromStatus(mon);
  601│   const showLevel = _lvA === 0 || _lvA === 6;
  602│   if (slotIdx === 0) {
  603│     // 1:1 décomp PARTY_BOX_LEFT_COLUMN (party_menu.h:32) :
  604│     //   Nickname (24, 11) — width=40
  605│     //   Level    (32, 20) — "N.X"
  606│     //   Gender   (64, 20) — width 8x8
  607│     //   HP       (38, 37)
  608│     //   MaxHP    (53, 37)
  609│     // 1:1 décomp DisplayPartyPokemonBarDetail (party_menu.c:2282) :
  610│     //   AddTextPrinterParameterized3(windowId, FONT_SMALL, ...) — TOUT en FONT_SMALL.
  611│     AddTextPrinterParameterized3(wid, FONT_SMALL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  612│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  32, 20, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  613│     if (genderStr) {
  614│       AddTextPrinterParameterized3(wid, FONT_SMALL, 64, 20, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  615│     }
  616│     // 1:1 décomp DisplayPartyPokemonHP (party_menu.c:2367) + DisplayParty
  617│     // PokemonMaxHP (:2388) : DEUX AddTextPrinterParameterized3 FONT_SMALL
  618│     // SÉPARÉS aux coords sPartyBoxInfoRects[PARTY_BOX_LEFT_COLUMN] (party_
  619│     // menu.h:42-43) : dimensions[12]=(38,37) HP, dimensions[16]=(53,37) MaxHP.
  620│     //   HP    = ConvertIntToDecimalStringN(hp,    RIGHT_ALIGN, 3) + "/"
  621│     //   MaxHP = "/" + ConvertIntToDecimalStringN(maxhp, RIGHT_ALIGN, 3)
  622│     // L'overlap des 2 "/" (FONT_SMALL widths = ROM exacts : sp 3, digit 5,
  623│     // '/' 5 — vérifiés vs gFontSmallLatinGlyphWidths fonts.c:40) produit le
  624│     // visuel ROM 1:1. PLUS de hack 1-string / espaces hardcodés.
  625│     AddTextPrinterParameterized3(wid, FONT_SMALL, 38, 37, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  626│     AddTextPrinterParameterized3(wid, FONT_SMALL, 53, 37, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  627│   } else {
  628│     // 1:1 décomp PARTY_BOX_RIGHT_COLUMN :
  629│     //   Nickname (22, 3) — width=40
  630│     //   Level    (30, 12)
  631│     //   Gender   (62, 12)
  632│     //   HP       dimensions[12]=(102, 12)  MaxHP dimensions[16]=(117, 12)
  633│     AddTextPrinterParameterized3(wid, FONT_SMALL, 22,  3, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
  634│     if (showLevel) AddTextPrinterParameterized3(wid, FONT_SMALL,  30, 12, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
  635│     if (genderStr) {
  636│       AddTextPrinterParameterized3(wid, FONT_SMALL, 62, 12, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
  637│     }
  638│     // 1:1 décomp DisplayPartyPokemonHP/MaxHP — 2 strings FONT_SMALL séparés
  639│     // aux coords sPartyBoxInfoRects[PARTY_BOX_RIGHT_COLUMN] (party_menu.h:56-57).
  640│     AddTextPrinterParameterized3(wid, FONT_SMALL, 102, 12, COLOR_HP, TEXT_SKIP_DRAW, `${_rightAlign3(mon.currentHp)}/`);
  641│     AddTextPrinterParameterized3(wid, FONT_SMALL, 117, 12, COLOR_HP, TEXT_SKIP_DRAW, `/${_rightAlign3(mon.maxHp)}`);
  642│   }
  643│   void MON_MALE; void MON_FEMALE;  // referenced via getMonGenderSymbol
  644│   // 1:1 décomp DisplayPartyPokemonHPBar : draw colored bar fill (green/yellow/
  645│   // red selon HP fraction) avec palette swap aux positions 9-10 de la sub-pal.
  646│   _drawHpBar(slotIdx, mon);
  647│   CopyWindowToVram(wid, 3);
  648│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DisplayPartyPokemonHPBar  —  party_menu.c:2402-2435 (34 l)
▌ ‖ port: _drawHpBar (src/engine/party-screen.ts:670-711)  ← cite "party_menu.c:2402" @src/engine/party-screen.ts:670
▌ ‖ port: _drawHpBar (src/engine/party-screen.ts:670-711)  ← cite "party_menu.c:2402" @src/engine/party-screen.ts:699
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2402-2435 ────────────────────────────────────────
 2402│ static void DisplayPartyPokemonHPBar(u16 hp, u16 maxhp, struct PartyMenuBox *menuBox)
 2403│ {
 2404│     u8 palOffset = BG_PLTT_ID(GetWindowAttribute(menuBox->windowId, WINDOW_PALETTE_NUM));
 2405│     u8 hpFraction;
 2406│ 
 2407│     switch (GetHPBarLevel(hp, maxhp))
 2408│     {
 2409│     case HP_BAR_GREEN:
 2410│     case HP_BAR_FULL:
 2411│         LoadPalette(GetPartyMenuPalBufferPtr(sHPBarGreenPalIds[0]), sHPBarPalOffsets[0] + palOffset, PLTT_SIZEOF(1));
 2412│         LoadPalette(GetPartyMenuPalBufferPtr(sHPBarGreenPalIds[1]), sHPBarPalOffsets[1] + palOffset, PLTT_SIZEOF(1));
 2413│         break;
 2414│     case HP_BAR_YELLOW:
 2415│         LoadPalette(GetPartyMenuPalBufferPtr(sHPBarYellowPalIds[0]), sHPBarPalOffsets[0] + palOffset, PLTT_SIZEOF(1));
 2416│         LoadPalette(GetPartyMenuPalBufferPtr(sHPBarYellowPalIds[1]), sHPBarPalOffsets[1] + palOffset, PLTT_SIZEOF(1));
 2417│         break;
 2418│     default:
 2419│         LoadPalette(GetPartyMenuPalBufferPtr(sHPBarRedPalIds[0]), sHPBarPalOffsets[0] + palOffset, PLTT_SIZEOF(1));
 2420│         LoadPalette(GetPartyMenuPalBufferPtr(sHPBarRedPalIds[1]), sHPBarPalOffsets[1] + palOffset, PLTT_SIZEOF(1));
 2421│         break;
 2422│     }
 2423│ 
 2424│     hpFraction = GetScaledHPFraction(hp, maxhp, menuBox->infoRects->dimensions[22]);
 2425│     FillWindowPixelRect(menuBox->windowId, sHPBarPalOffsets[1], menuBox->infoRects->dimensions[20], menuBox->infoRects->dimensions[21], hpFraction, 1);
 2426│     FillWindowPixelRect(menuBox->windowId, sHPBarPalOffsets[0], menuBox->infoRects->dimensions[20], menuBox->infoRects->dimensions[21] + 1, hpFraction, 2);
 2427│     if (hpFraction != menuBox->infoRects->dimensions[22])
 2428│     {
 2429│         // This appears to be an alternating fill
 2430│         FillWindowPixelRect(menuBox->windowId, 0x0D, menuBox->infoRects->dimensions[20] + hpFraction, menuBox->infoRects->dimensions[21], menuBox->infoRects->dimensions[22] - hpFraction, 1);
 2431│         FillWindowPixelRect(menuBox->windowId, 0x02, menuBox->infoRects->dimensions[20] + hpFraction, menuBox->infoRects->dimensions[21] + 1, menuBox->infoRects->dimensions[22] - hpFraction, 2);
 2432│     }
 2433│     CopyWindowToVram(menuBox->windowId, COPYWIN_GFX);
 2434│ }
 2435│ 
├─ PORT src/engine/party-screen.ts:670-711 ────────────────────────────────────────
  670│ /** 1:1 décomp `DisplayPartyPokemonHPBar` (party_menu.c:2402) :
  671│  *  - Load palette colors aux positions [9, 10] avec sHPBar(Green/Yellow/Red)PalIds
  672│  *  - FillWindowPixelRect avec palette idx 9 (top row 1px) + 10 (bottom 2 rows)
  673│  *  - Pour la partie vide (empty), fill avec idx 0x0D et 0x02 (= alternating
  674│  *    fill pattern du décomp). */
  675│ function _drawHpBar(slotIdx: number, mon: PokemonInstance): void {
  676│   if (!_assets) return;
  677│   const wid = _slotWindowIds[slotIdx];
  678│   if (wid === undefined) return;
  679│   const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum;
  680│   if (slotPalNum === undefined) return;
  681│ 
  682│   // Load HP bar palette colors selon le level.
  683│   const level = _getHpBarLevel(mon.currentHp, mon.maxHp);
  684│   const palIds =
  685│     (level === 'FULL' || level === 'GREEN') ? sHPBarGreenPalIds
  686│     : level === 'YELLOW' ? sHPBarYellowPalIds
  687│     : sHPBarRedPalIds;
  688│   for (let i = 0; i < 2; i++) {
  689│     const src = new Uint16Array(1);
  690│     src[0] = _assets.bgPalette[palIds[i]];
  691│     LoadPalette(src, slotPalNum * 16 + sHPBarPalOffsets[i], 2);
  692│   }
  693│ 
  694│   // Position de la bar HP : (x, y, w) selon slot layout.
  695│   const [x, y, w] = slotIdx === 0 ? HP_BAR_RECT_LEFT : HP_BAR_RECT_RIGHT;
  696│   // 1:1 décomp GetScaledHPFraction : ratio * width arrondi.
  697│   const hpFraction = Math.floor((mon.currentHp / mon.maxHp) * w);
  698│ 
  699│   // 1:1 décomp FillWindowPixelRect (party_menu.c:2402) :
  700│   //   row 1 (haut, 1 px) = sHPBarPalOffsets[1] (= idx 10 = couleur FONCÉE)
  701│   //   row 2-3 (bas, 2 px) = sHPBarPalOffsets[0] (= idx 9 = couleur CLAIRE)
  702│   // L'inversion visuelle (foncé top / clair bot) donne l'effet d'ombrage de la
  703│   // ROM. NE PAS swap ces deux args — c'est ce qui rend la bar 1:1 décomp.
  704│   FillWindowPixelRect(wid, sHPBarPalOffsets[1], x, y,     hpFraction, 1);
  705│   FillWindowPixelRect(wid, sHPBarPalOffsets[0], x, y + 1, hpFraction, 2);
  706│   // Partie vide alternating fill 0x0D (top, foncé) + 0x02 (bot, clair).
  707│   if (hpFraction !== w) {
  708│     FillWindowPixelRect(wid, 0x0D, x + hpFraction, y,     w - hpFraction, 1);
  709│     FillWindowPixelRect(wid, 0x02, x + hpFraction, y + 1, w - hpFraction, 2);
  710│   }
  711│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DisplayPartyMenuStdMessage  —  party_menu.c:2459-2504 (46 l)
▌ ‖ port: _drawMsg (src/engine/party-screen.ts:886-929)  ← cite "party_menu.c:2459" @src/engine/party-screen.ts:886
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2459-2504 ────────────────────────────────────────
 2459│ void DisplayPartyMenuStdMessage(u32 stringId)
 2460│ {
 2461│     u8 *windowPtr = &sPartyMenuInternal->windowId[1];
 2462│ 
 2463│     if (*windowPtr != WINDOW_NONE)
 2464│         PartyMenuRemoveWindow(windowPtr);
 2465│ 
 2466│     if (stringId != PARTY_MSG_NONE)
 2467│     {
 2468│         switch (stringId)
 2469│         {
 2470│         case PARTY_MSG_DO_WHAT_WITH_MON:
 2471│             *windowPtr = AddWindow(&sDoWhatWithMonMsgWindowTemplate);
 2472│             break;
 2473│         case PARTY_MSG_DO_WHAT_WITH_ITEM:
 2474│             *windowPtr = AddWindow(&sDoWhatWithItemMsgWindowTemplate);
 2475│             break;
 2476│         case PARTY_MSG_DO_WHAT_WITH_MAIL:
 2477│             *windowPtr = AddWindow(&sDoWhatWithMailMsgWindowTemplate);
 2478│             break;
 2479│         case PARTY_MSG_RESTORE_WHICH_MOVE:
 2480│         case PARTY_MSG_BOOST_PP_WHICH_MOVE:
 2481│             *windowPtr = AddWindow(&sWhichMoveMsgWindowTemplate);
 2482│             break;
 2483│         case PARTY_MSG_ALREADY_HOLDING_ONE:
 2484│             *windowPtr = AddWindow(&sAlreadyHoldingOneMsgWindowTemplate);
 2485│             break;
 2486│         default:
 2487│             *windowPtr = AddWindow(&sDefaultPartyMsgWindowTemplate);
 2488│             break;
 2489│         }
 2490│ 
 2491│         if (stringId == PARTY_MSG_CHOOSE_MON)
 2492│         {
 2493│             if (sPartyMenuInternal->chooseHalf)
 2494│                 stringId = PARTY_MSG_CHOOSE_MON_AND_CONFIRM;
 2495│             else if (!ShouldUseChooseMonText())
 2496│                 stringId = PARTY_MSG_CHOOSE_MON_OR_CANCEL;
 2497│         }
 2498│         DrawStdFrameWithCustomTileAndPalette(*windowPtr, FALSE, 0x4F, 13);
 2499│         StringExpandPlaceholders(gStringVar4, sActionStringTable[stringId]);
 2500│         AddTextPrinterParameterized(*windowPtr, FONT_NORMAL, gStringVar4, 0, 1, 0, 0);
 2501│         ScheduleBgCopyTilemapToVram(2);
 2502│     }
 2503│ }
 2504│ 
├─ PORT src/engine/party-screen.ts:886-929 ────────────────────────────────────────
  886│ /** 1:1 décomp `DisplayPartyMenuStdMessage` (party_menu.c:2459) :
  887│  *  Remove existing msg window, add NEW window with appropriate template
  888│  *  selon stringId. Différents templates pour CHOOSE_MON vs DO_WHAT_WITH_MON
  889│  *  (= widths différents pour ne pas overlap avec action menu). */
  890│ function _drawMsg(): void {
  891│   // 1:1 décomp `if (*windowPtr != WINDOW_NONE) PartyMenuRemoveWindow(windowPtr);`
  892│   // PartyMenuRemoveWindow → ClearStdWindowAndFrameToTransparent + RemoveWindow.
  893│   // Sans clear, le frame border + texte précédent restent visibles en VRAM.
  894│   if (_msgWid >= 0) {
  895│     ClearStdWindowAndFrame(_msgWid, false);
  896│     CopyWindowToVram(_msgWid, 3);
  897│     RemoveWindow(_msgWid);
  898│     _msgWid = -1;
  899│   }
  900│   // 1:1 décomp ShouldUseChooseMonText : count alive mons.
  901│   const party = gameState.party as PokemonInstance[];
  902│   let numAlive = 0;
  903│   for (const m of party) {
  904│     if (m && m.currentHp > 0) numAlive++;
  905│     if (numAlive > 1) break;
  906│   }
  907│   const useChooseMon = numAlive > 1;
  908│   // 1:1 décomp switch sur stringId : DO_WHAT_WITH_MON ou CHOOSE_MON.
  909│   let msg: string;
  910│   let template: WindowTemplate;
  911│   if (_phase === 'action_menu') {
  912│     msg = getString('gText_DoWhatWithPokemon');  // "Que faire avec ce PKMN?"
  913│     template = DO_WHAT_WITH_MON_WINDOW_TEMPLATE;
  914│   } else if (_partyAction === PARTY_ACTION_SWITCH) {
  915│     // 1:1 décomp DisplayPartyMenuStdMessage(PARTY_MSG_MOVE_TO_WHERE)
  916│     // (party_menu.c:2803 ; party_menu.h:603 → gText_MoveToWhere ;
  917│     //  strings.c:431 = "Le mettre où?"). Même famille fenêtre que CHOOSE_MON.
  918│     msg = getString('gText_MoveToWhere');
  919│     template = MSG_WINDOW_TEMPLATE;
  920│   } else {
  921│     msg = useChooseMon ? getString('gText_ChoosePokemon') : getString('gText_ChoosePokemonCancel');
  922│     template = MSG_WINDOW_TEMPLATE;
  923│   }
  924│   _msgWid = AddWindow(template);
  925│   // 1:1 décomp `DrawStdFrameWithCustomTileAndPalette(*windowPtr, FALSE, 0x4F, 13)`.
  926│   DrawStdFrameWithCustomTileAndPalette(_msgWid, false, 0x4F, 13);
  927│   AddTextPrinterParameterized3(_msgWid, FONT_NORMAL, 0, 1, [1, 2, 3], TEXT_SKIP_DRAW, msg);
  928│   CopyWindowToVram(_msgWid, 3);
  929│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DisplaySelectionWindow  —  party_menu.c:2524-2565 (42 l)
▌ ‖ port: src/engine/party-screen.ts:1447 (hors fonction)  ← cite "party_menu.c:2533" @src/engine/party-screen.ts:1447
▌ ‖ port: _renderActionMenuContents (src/engine/party-screen.ts:1467-1500)  ← cite "party_menu.c:2533" @src/engine/party-screen.ts:1472
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2524-2565 ────────────────────────────────────────
 2524│ static u8 DisplaySelectionWindow(u8 windowType)
 2525│ {
 2526│     struct WindowTemplate window;
 2527│     u8 cursorDimension;
 2528│     u8 letterSpacing;
 2529│     u8 i;
 2530│ 
 2531│     switch (windowType)
 2532│     {
 2533│     case SELECTWINDOW_ACTIONS:
 2534│         SetWindowTemplateFields(&window, 2, 19, 19 - (sPartyMenuInternal->numActions * 2), 10, sPartyMenuInternal->numActions * 2, 14, 0x2E9);
 2535│         break;
 2536│     case SELECTWINDOW_ITEM:
 2537│         window = sItemGiveTakeWindowTemplate;
 2538│         break;
 2539│     case SELECTWINDOW_MAIL:
 2540│         window = sMailReadTakeWindowTemplate;
 2541│         break;
 2542│     default: // SELECTWINDOW_MOVES
 2543│         window = sMoveSelectWindowTemplate;
 2544│         break;
 2545│     }
 2546│ 
 2547│     sPartyMenuInternal->windowId[0] = AddWindow(&window);
 2548│     DrawStdFrameWithCustomTileAndPalette(sPartyMenuInternal->windowId[0], FALSE, 0x4F, 13);
 2549│     if (windowType == SELECTWINDOW_MOVES)
 2550│         return sPartyMenuInternal->windowId[0];
 2551│     cursorDimension = GetMenuCursorDimensionByFont(FONT_NORMAL, 0);
 2552│     letterSpacing = GetFontAttribute(FONT_NORMAL, FONTATTR_LETTER_SPACING);
 2553│ 
 2554│     for (i = 0; i < sPartyMenuInternal->numActions; i++)
 2555│     {
 2556│         u8 fontColorsId = (sPartyMenuInternal->actions[i] >= MENU_FIELD_MOVES) ? 4 : 3;
 2557│         AddTextPrinterParameterized4(sPartyMenuInternal->windowId[0], FONT_NORMAL, cursorDimension, (i * 16) + 1, letterSpacing, 0, sFontColorTable[fontColorsId], 0, sCursorOptions[sPartyMenuInternal->actions[i]].text);
 2558│     }
 2559│ 
 2560│     InitMenuInUpperLeftCorner(sPartyMenuInternal->windowId[0], sPartyMenuInternal->numActions, 0, TRUE);
 2561│     ScheduleBgCopyTilemapToVram(2);
 2562│ 
 2563│     return sPartyMenuInternal->windowId[0];
 2564│ }
 2565│ 
├─ PORT src/engine/party-screen.ts:1467-1500 ────────────────────────────────────────
 1467│ /** Re-render action menu contents (= called au open + après cursor move).
 1468│  *  Le cursor "▶" est blit devant l'item selected. 1:1 décomp pattern
 1469│  *  Menu_MoveCursor + InitMenuInUpperLeftCorner. */
 1470│ function _renderActionMenuContents(): void {
 1471│   if (_actionWindowId < 0) return;
 1472│   // 1:1 décomp DisplaySelectionWindow (party_menu.c:2533) :
 1473│   //   DrawStdFrameWithCustomTileAndPalette(wid, FALSE, 0x4F, 13) APRÈS AddWindow.
 1474│   // ⚠️ DrawStdFrame doit être appelé AVANT FillWindowPixelBuffer + PutWindowTilemap
 1475│   // sinon le frame border n'apparaît pas (= bug visuel : menu sans cadre).
 1476│   DrawStdFrameWithCustomTileAndPalette(_actionWindowId, false, 0x4F, 13);
 1477│ 
 1478│   const numActions = _actionList.length;
 1479│   FillWindowPixelBuffer(_actionWindowId, 0x11);  // = palette idx 1 (= white bg)
 1480│   PutWindowTilemap(_actionWindowId);
 1481│   for (let i = 0; i < numActions; i++) {
 1482│     const str = ACTION_MENU_STRINGS_FR[_actionList[i]] ?? '';
 1483│     const isSelected = i === _actionCursor;
 1484│     // Cursor arrow ▶ devant le selected item à x=0, text à x=8 (= cursorDim).
 1485│     if (isSelected) {
 1486│       AddTextPrinterParameterized3(
 1487│         _actionWindowId, FONT_NORMAL, 0, i * 16 + 1,
 1488│         [1, 2, 3] as [number, number, number],
 1489│         TEXT_SKIP_DRAW, '▶',
 1490│       );
 1491│     }
 1492│     // sFontColorTable[3] = [WHITE, DARK_GRAY, LIGHT_GRAY] pour actions selection.
 1493│     AddTextPrinterParameterized3(
 1494│       _actionWindowId, FONT_NORMAL, 8, i * 16 + 1,
 1495│       [1, 2, 3] as [number, number, number],
 1496│       TEXT_SKIP_DRAW, str,
 1497│     );
 1498│   }
 1499│   CopyWindowToVram(_actionWindowId, 3);
 1500│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SetPartyMonFieldSelectionActions  —  party_menu.c:2607-2638 (32 l)
▌ ‖ port: _openActionMenu (src/engine/party-screen.ts:1502-1541)  ← cite "party_menu.c:2607" @src/engine/party-screen.ts:1508
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2607-2638 ────────────────────────────────────────
 2607│ static void SetPartyMonFieldSelectionActions(struct Pokemon *mons, u8 slotId)
 2608│ {
 2609│     u8 i, j;
 2610│ 
 2611│     sPartyMenuInternal->numActions = 0;
 2612│     AppendToList(sPartyMenuInternal->actions, &sPartyMenuInternal->numActions, MENU_SUMMARY);
 2613│ 
 2614│     // Add field moves to action list
 2615│     for (i = 0; i < MAX_MON_MOVES; i++)
 2616│     {
 2617│         for (j = 0; sFieldMoves[j] != FIELD_MOVES_COUNT; j++)
 2618│         {
 2619│             if (GetMonData(&mons[slotId], i + MON_DATA_MOVE1) == sFieldMoves[j])
 2620│             {
 2621│                 AppendToList(sPartyMenuInternal->actions, &sPartyMenuInternal->numActions, j + MENU_FIELD_MOVES);
 2622│                 break;
 2623│             }
 2624│         }
 2625│     }
 2626│ 
 2627│     if (!InBattlePike())
 2628│     {
 2629│         if (GetMonData(&mons[1], MON_DATA_SPECIES) != SPECIES_NONE)
 2630│             AppendToList(sPartyMenuInternal->actions, &sPartyMenuInternal->numActions, MENU_SWITCH);
 2631│         if (ItemIsMail(GetMonData(&mons[slotId], MON_DATA_HELD_ITEM)))
 2632│             AppendToList(sPartyMenuInternal->actions, &sPartyMenuInternal->numActions, MENU_MAIL);
 2633│         else
 2634│             AppendToList(sPartyMenuInternal->actions, &sPartyMenuInternal->numActions, MENU_ITEM);
 2635│     }
 2636│     AppendToList(sPartyMenuInternal->actions, &sPartyMenuInternal->numActions, MENU_CANCEL1);
 2637│ }
 2638│ 
├─ PORT src/engine/party-screen.ts:1502-1541 ────────────────────────────────────────
 1502│ function _openActionMenu(rt: ReturnType<typeof getRuntime>, playSe = true): void {
 1503│   if (!rt) return;
 1504│   // 1:1 décomp : SE_SELECT joué par CursorCb_* à l'ENTRÉE (press A sur le mon).
 1505│   // Au retour du résumé (Task_TryCreateSelectionWindow → CreateSelectionWindow)
 1506│   // aucun SE n'est rejoué → playSe=false.
 1507│   if (playSe) PlaySE(5);  // SE_SELECT
 1508│   // 1:1 décomp `SetPartyMonFieldSelectionActions` (party_menu.c:2607) :
 1509│   //   AppendToList(MENU_SUMMARY);
 1510│   //   for each field move: AppendToList(MENU_FIELD_MOVES + j);
 1511│   //   if (party[1].species != NONE) AppendToList(MENU_SWITCH);  ← ORDRE
 1512│   //   if (item is mail) AppendToList(MENU_MAIL); else AppendToList(MENU_ITEM);
 1513│   //   AppendToList(MENU_CANCEL1);
 1514│   _actionList = [MENU_SUMMARY];
 1515│   // TODO : add field moves (CUT/FLASH/SURF/etc.) si mon les connait.
 1516│   const party = gameState.party as PokemonInstance[];
 1517│   if (party.length > 1 && party[1] && party[1].speciesEnum !== 'SPECIES_NONE') {
 1518│     _actionList.push(MENU_SWITCH);  // ORDRE - si plus de 1 mon
 1519│   }
 1520│   // TODO : check si held item est mail → MENU_MAIL, sinon MENU_ITEM.
 1521│   _actionList.push(MENU_ITEM);
 1522│   _actionList.push(MENU_CANCEL1);
 1523│   _actionCursor = 0;
 1524│   const numActions = _actionList.length;
 1525│   // 1:1 décomp window template : bg=2 width=10 height=(numActions*2).
 1526│   // ⚠️ AddWindow (= 1:1 decomp AddWindow), PAS InitWindows qui wipe tous les
 1527│   // windows existants (= bug screen-noir si on l'utilisait ici).
 1528│   const tilemapTop = 19 - numActions * 2;
 1529│   _actionWindowId = AddWindow({
 1530│     bg: 2, tilemapLeft: 19, tilemapTop, width: 10, height: numActions * 2,
 1531│     paletteNum: 14, baseBlock: 0x2E9,
 1532│   });
 1533│   // 1:1 décomp : load user window frame tiles à baseTile 0x4F + palette 13.
 1534│   // ⚠️ DrawStdFrameWithCustomTileAndPalette est appelé dans _renderActionMenuContents
 1535│   // (PAS ici) — sinon le PutWindowTilemap suivant écrase le frame border et
 1536│   // le menu apparaît sans cadre.
 1537│   LoadUserWindowBorderGfx(0, 0x4F, 13 * 16);
 1538│   _phase = 'action_menu';
 1539│   _drawMsg();
 1540│   _renderActionMenuContents();
 1541│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_TryCreateSelectionWindow  —  party_menu.c:2731-2739 (9 l)
▌ ‖ port: CB2_InitPartyMenu (src/engine/party-screen.ts:1940-2038)  ← cite "party_menu.c:2731" @src/engine/party-screen.ts:2028
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2731-2739 ────────────────────────────────────────
 2731│ static void Task_TryCreateSelectionWindow(u8 taskId)
 2732│ {
 2733│     if (CreateSelectionWindow(taskId))
 2734│     {
 2735│         gTasks[taskId].data[0] = 0xFF;
 2736│         gTasks[taskId].func = Task_HandleSelectionMenuInput;
 2737│     }
 2738│ }
 2739│ 
├─ PORT src/engine/party-screen.ts:1940-2038 ────────────────────────────────────────
 1940│ export function CB2_InitPartyMenu(): void {
 1941│   const rt = getRuntime();
 1942│   if (!rt) return;
 1943│   switch (rt.gMain.state) {
 1944│     case 0: rt.SetVBlankCallback(null); rt.gMain.state++; break;
 1945│     case 1: rt.gMain.state++; break;
 1946│     case 2: rt.gMain.state++; break;
 1947│     case 3:
 1948│       ResetPaletteFade();
 1949│       rt.gPaletteFade.bufferTransferDisabled = true;
 1950│       rt.gMain.state++; break;
 1951│     case 4: ResetSpriteData(); rt.gMain.state++; break;
 1952│     case 5: rt.gMain.state++; break;
 1953│     case 6: ResetTasks(); rt.gMain.state++; break;
 1954│     case 7:
 1955│       _initPartyBgs(rt);
 1956│       _graphicsReady = false; _graphicsLoading = false;
 1957│       _windowsReady = false; _windowsLoading = false;
 1958│       rt.gMain.state++; break;
 1959│     case 8:
 1960│       if (!_loadPartyGraphicsCb2(rt)) break;
 1961│       rt.gMain.state++; break;
 1962│     case 9:
 1963│       if (!_windowsReady) {
 1964│         if (!_windowsLoading) {
 1965│           _windowsLoading = true;
 1966│           void _loadPartyWindowsCb2(rt).then(() => {
 1967│             _windowsReady = true;
 1968│             _windowsLoading = false;
 1969│           });
 1970│         }
 1971│         break;
 1972│       }
 1973│       rt.gMain.state++; break;
 1974│     case 10: _phase = 'open'; rt.gMain.state++; break;
 1975│     case 11: _drawAllSlots(); _drawMsg(); _drawCancelButtonWindow(); rt.gMain.state++; break;
 1976│     case 12:
 1977│       _inputTaskId = rt.CreateTask(Task_PartyMenu_HandleInput, 0);
 1978│       // 1:1 décomp : reset état d'anim icône par slot (animDelayCounter /
 1979│       // animCmdIndex / animNum=0 sAnim_0 / mode). AnimatePartySlot (case 14)
 1980│       // posera ensuite le mode + décalage sélection/désélection.
 1981│       _iconAnimDelay = [0, 0, 0, 0, 0, 0];
 1982│       _iconAnimCmdIdx = [0, 0, 0, 0, 0, 0];
 1983│       _iconAnimNum = [0, 0, 0, 0, 0, 0];
 1984│       _iconMode = [0, 0, 0, 0, 0, 0];
 1985│       _bounceTaskId = rt.CreateTask(Task_PartyMenu_BounceIcon, 1);
 1986│       rt.gMain.state++; break;
 1987│     case 13:
 1988│       // Spawn icon OAMs + cancel button + slot pokeballs async, advance immédiatement.
 1989│       void _spawnIconOams();
 1990│       // Sequence : _spawnCancelButtonOam load tiles → then _spawnSlotPokeballOams réutilise.
 1991│       void _spawnCancelButtonOam().then(() => { _spawnSlotPokeballOams(); });
 1992│       // 1:1 décomp LoadPartyMenuAilmentGfx + statusSpriteId par box +
 1993│       // SetPartyMonAilmentGfx (party_menu.c:4188-4205).
 1994│       void _loadStatusIconsGfx().then(() => {
 1995│         _spawnStatusOams();
 1996│         for (let i = 0; i < 6; i++) _updatePartyMonAilmentGfx(i);
 1997│       });
 1998│       // 1:1 décomp LoadHeldItemIcons + itemSpriteId par box + Update
 1999│       // PartyMonHeldItemSprite (party_menu.c:4021-4063).
 2000│       void _loadHeldItemGfx().then(() => {
 2001│         _spawnHeldItemOams();
 2002│         for (let i = 0; i < 6; i++) _updatePartyMonHeldItem(i);
 2003│       });
 2004│       rt.gMain.state++; break;
 2005│     case 14:
 2006│       // 1:1 décomp `AnimatePartySlot(gPartyMenu.slotId, 1)` (party_menu.c:1116) :
 2007│       // initial highlight du slot 0 + default unselected pour les autres mons.
 2008│       for (let i = 0; i < 6; i++) AnimatePartySlot(i, 0);
 2009│       AnimatePartySlot(_slotId, 1);
 2010│       rt.gMain.state++; break;
 2011│     case 15: rt.gMain.state++; break;
 2012│     case 16: rt.gMain.state++; break;
 2013│     case 17: rt.gMain.state++; break;
 2014│     case 18: rt.gMain.state++; break;
 2015│     case 19:
 2016│       BlendPalettes(0xFFFFFFFF, 16, 0);
 2017│       rt.gMain.state++; break;
 2018│     case 20:
 2019│       FadeScreen(FADE_FROM_BLACK, 0);
 2020│       rt.gPaletteFade.bufferTransferDisabled = false;
 2021│       PlaySE(6);
 2022│       rt.gMain.state++; break;
 2023│     default:
 2024│       rt.SetVBlankCallback(VBlankCB_PartyMenuRun);
 2025│       rt.SetMainCallback2(MainCB2_PartyMenuRun);
 2026│       _isOpen = true;
 2027│       // 1:1 décomp CB2_ReturnToPartyMenuFromSummaryScreen → Task_TryCreate
 2028│       // SelectionWindow (party_menu.c:2731) → CreateSelectionWindow : au
 2029│       // retour du résumé, la fenêtre de sélection se ré-ouvre sur le mon vu.
 2030│       // playSe=false : le SE_SELECT a été joué à CursorCb_Summary (entrée),
 2031│       // CreateSelectionWindow n'en rejoue pas.
 2032│       if (_reopenActionMenuAfterInit) {
 2033│         _reopenActionMenuAfterInit = false;
 2034│         _openActionMenu(rt, false);
 2035│       }
 2036│       return;
 2037│   }
 2038│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_HandleSelectionMenuInput  —  party_menu.c:2740-2769 (30 l)
▌ ‖ port: _handleActionMenuInput (src/engine/party-screen.ts:1845-1894)  ← cite "party_menu.c:2740" @src/engine/party-screen.ts:1846
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2740-2769 ────────────────────────────────────────
 2740│ static void Task_HandleSelectionMenuInput(u8 taskId)
 2741│ {
 2742│     if (!gPaletteFade.active && MenuHelpers_ShouldWaitForLinkRecv() != TRUE)
 2743│     {
 2744│         s8 input;
 2745│         s16 *data = gTasks[taskId].data;
 2746│ 
 2747│         if (sPartyMenuInternal->numActions <= 3)
 2748│             input = Menu_ProcessInputNoWrapAround_other();
 2749│         else
 2750│             input = ProcessMenuInput_other();
 2751│ 
 2752│         data[0] = Menu_GetCursorPos();
 2753│         switch (input)
 2754│         {
 2755│         case MENU_NOTHING_CHOSEN:
 2756│             break;
 2757│         case MENU_B_PRESSED:
 2758│             PlaySE(SE_SELECT);
 2759│             PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[2]);
 2760│             sCursorOptions[sPartyMenuInternal->actions[sPartyMenuInternal->numActions - 1]].func(taskId);
 2761│             break;
 2762│         default:
 2763│             PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[2]);
 2764│             sCursorOptions[sPartyMenuInternal->actions[input]].func(taskId);
 2765│             break;
 2766│         }
 2767│     }
 2768│ }
 2769│ 
├─ PORT src/engine/party-screen.ts:1845-1894 ────────────────────────────────────────
 1845│ /** Action menu input handler 1:1 décomp `Task_HandleSelectionMenuInput`
 1846│  *  (party_menu.c:2740) : UP/DOWN navigate, A select, B = cancel (= action
 1847│  *  at index numActions-1 = RETOUR). */
 1848│ function _handleActionMenuInput(rt: ReturnType<typeof getRuntime>): void {
 1849│   if (!rt) return;
 1850│   const newKeys = rt.gMain.newKeys;
 1851│   const newRepKeys = rt.gMain.newAndRepeatedKeys ?? newKeys;
 1852│   const KEY_A = 0x0001, KEY_B = 0x0002;
 1853│   const DPAD_UP = 0x40, DPAD_DOWN = 0x80;
 1854│   if (newRepKeys & DPAD_UP) {
 1855│     if (_actionCursor > 0) { _actionCursor--; PlaySE(5); _renderActionMenuContents(); }
 1856│   } else if (newRepKeys & DPAD_DOWN) {
 1857│     if (_actionCursor < _actionList.length - 1) { _actionCursor++; PlaySE(5); _renderActionMenuContents(); }
 1858│   } else if (newKeys & KEY_A) {
 1859│     PlaySE(5);
 1860│     const action = _actionList[_actionCursor];
 1861│     if (action === MENU_CANCEL1 /* RETOUR */) {
 1862│       _closeActionMenu();
 1863│     } else if (action === MENU_SUMMARY /* RESUME */) {
 1864│       // 1:1 décomp `CursorCb_Summary` (party_menu.c:2770-2775) :
 1865│       //   PlaySE(SE_SELECT);                                      ← déjà fait
 1866│       //   sPartyMenuInternal->exitCallback = CB2_ShowPokemonSummaryScreen;
 1867│       //   Task_ClosePartyMenu(taskId);   // fade-out party PUIS handoff CB2
 1868│       // Le party menu se ferme ENTIÈREMENT (fade gated → _freePartyMenu →
 1869│       // SetMainCallback2) AVANT que le résumé s'init = handoff séquentiel
 1870│       // identique au décomp. Ça supprime la race où OpenSummaryScreen était
 1871│       // appelé pendant que le party menu vivait encore (tâche de close
 1872│       // survivante → CB2_ReturnToFieldWithOpenMenu = OW+START bug #4, ou
 1873│       // CB2 stomp = crash fade bug #3).
 1874│       const mon = (gameState.party as PokemonInstance[])[_slotId];
 1875│       if (mon) {
 1876│         _summaryTargetMon = mon;
 1877│         _showSummaryPending = false;
 1878│         _partyTransientExitCb = CB2_ShowPokemonSummaryScreen_Manual;
 1879│         ClosePartyScreen();  // = Task_ClosePartyMenu (fade + handoff séquentiel)
 1880│       } else {
 1881│         _closeActionMenu();
 1882│       }
 1883│     } else if (action === MENU_SWITCH /* ORDRE */) {
 1884│       _cursorCbSwitch();
 1885│     } else if (action === MENU_ITEM /* OBJET */) {
 1886│       // TODO : ouvrir bag pour give/swap item
 1887│       console.log('[party-screen] TODO : OBJET → bag give/swap');
 1888│       _closeActionMenu();
 1889│     }
 1890│   } else if (newKeys & KEY_B) {
 1891│     PlaySE(5);
 1892│     _closeActionMenu();
 1893│   }
 1894│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CursorCb_Summary  —  party_menu.c:2770-2776 (7 l)
▌ ‖ port: _handleActionMenuInput (src/engine/party-screen.ts:1845-1894)  ← cite "party_menu.c:2770-2775" @src/engine/party-screen.ts:1864
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2770-2776 ────────────────────────────────────────
 2770│ static void CursorCb_Summary(u8 taskId)
 2771│ {
 2772│     PlaySE(SE_SELECT);
 2773│     sPartyMenuInternal->exitCallback = CB2_ShowPokemonSummaryScreen;
 2774│     Task_ClosePartyMenu(taskId);
 2775│ }
 2776│ 
├─ PORT src/engine/party-screen.ts:1845-1894 ────────────────────────────────────────
 1845│ /** Action menu input handler 1:1 décomp `Task_HandleSelectionMenuInput`
 1846│  *  (party_menu.c:2740) : UP/DOWN navigate, A select, B = cancel (= action
 1847│  *  at index numActions-1 = RETOUR). */
 1848│ function _handleActionMenuInput(rt: ReturnType<typeof getRuntime>): void {
 1849│   if (!rt) return;
 1850│   const newKeys = rt.gMain.newKeys;
 1851│   const newRepKeys = rt.gMain.newAndRepeatedKeys ?? newKeys;
 1852│   const KEY_A = 0x0001, KEY_B = 0x0002;
 1853│   const DPAD_UP = 0x40, DPAD_DOWN = 0x80;
 1854│   if (newRepKeys & DPAD_UP) {
 1855│     if (_actionCursor > 0) { _actionCursor--; PlaySE(5); _renderActionMenuContents(); }
 1856│   } else if (newRepKeys & DPAD_DOWN) {
 1857│     if (_actionCursor < _actionList.length - 1) { _actionCursor++; PlaySE(5); _renderActionMenuContents(); }
 1858│   } else if (newKeys & KEY_A) {
 1859│     PlaySE(5);
 1860│     const action = _actionList[_actionCursor];
 1861│     if (action === MENU_CANCEL1 /* RETOUR */) {
 1862│       _closeActionMenu();
 1863│     } else if (action === MENU_SUMMARY /* RESUME */) {
 1864│       // 1:1 décomp `CursorCb_Summary` (party_menu.c:2770-2775) :
 1865│       //   PlaySE(SE_SELECT);                                      ← déjà fait
 1866│       //   sPartyMenuInternal->exitCallback = CB2_ShowPokemonSummaryScreen;
 1867│       //   Task_ClosePartyMenu(taskId);   // fade-out party PUIS handoff CB2
 1868│       // Le party menu se ferme ENTIÈREMENT (fade gated → _freePartyMenu →
 1869│       // SetMainCallback2) AVANT que le résumé s'init = handoff séquentiel
 1870│       // identique au décomp. Ça supprime la race où OpenSummaryScreen était
 1871│       // appelé pendant que le party menu vivait encore (tâche de close
 1872│       // survivante → CB2_ReturnToFieldWithOpenMenu = OW+START bug #4, ou
 1873│       // CB2 stomp = crash fade bug #3).
 1874│       const mon = (gameState.party as PokemonInstance[])[_slotId];
 1875│       if (mon) {
 1876│         _summaryTargetMon = mon;
 1877│         _showSummaryPending = false;
 1878│         _partyTransientExitCb = CB2_ShowPokemonSummaryScreen_Manual;
 1879│         ClosePartyScreen();  // = Task_ClosePartyMenu (fade + handoff séquentiel)
 1880│       } else {
 1881│         _closeActionMenu();
 1882│       }
 1883│     } else if (action === MENU_SWITCH /* ORDRE */) {
 1884│       _cursorCbSwitch();
 1885│     } else if (action === MENU_ITEM /* OBJET */) {
 1886│       // TODO : ouvrir bag pour give/swap item
 1887│       console.log('[party-screen] TODO : OBJET → bag give/swap');
 1888│       _closeActionMenu();
 1889│     }
 1890│   } else if (newKeys & KEY_B) {
 1891│     PlaySE(5);
 1892│     _closeActionMenu();
 1893│   }
 1894│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CB2_ShowPokemonSummaryScreen  —  party_menu.c:2777-2789 (13 l)
▌ ‖ port: CB2_ShowPokemonSummaryScreen_Manual (src/engine/party-screen.ts:2058-2074)  ← cite "party_menu.c:2777" @src/engine/party-screen.ts:2058
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2777-2789 ────────────────────────────────────────
 2777│ static void CB2_ShowPokemonSummaryScreen(void)
 2778│ {
 2779│     if (gPartyMenu.menuType == PARTY_MENU_TYPE_IN_BATTLE)
 2780│     {
 2781│         UpdatePartyToBattleOrder();
 2782│         ShowPokemonSummaryScreen(SUMMARY_MODE_LOCK_MOVES, gPlayerParty, gPartyMenu.slotId, gPlayerPartyCount - 1, CB2_ReturnToPartyMenuFromSummaryScreen);
 2783│     }
 2784│     else
 2785│     {
 2786│         ShowPokemonSummaryScreen(SUMMARY_MODE_NORMAL, gPlayerParty, gPartyMenu.slotId, gPlayerPartyCount - 1, CB2_ReturnToPartyMenuFromSummaryScreen);
 2787│     }
 2788│ }
 2789│ 
├─ PORT src/engine/party-screen.ts:2058-2074 ────────────────────────────────────────
 2058│ /** 1:1 décomp `CB2_ShowPokemonSummaryScreen` (party_menu.c:2777) :
 2059│  *
 2060│  *      ShowPokemonSummaryScreen(SUMMARY_MODE_NORMAL, gPlayerParty,
 2061│  *          gPartyMenu.slotId, gPlayerPartyCount - 1,
 2062│  *          CB2_ReturnToPartyMenuFromSummaryScreen);
 2063│  *
 2064│  *  Le décomp est SYNCHRONE (ShowPokemonSummaryScreen → SetMainCallback2 dans
 2065│  *  la même frame). Notre `OpenSummaryScreen` est async (_loadAssets), donc ce
 2066│  *  CB2 est rappelé chaque frame jusqu'au SetMainCallback2(CB2_InitSummaryScreen)
 2067│  *  interne → garde one-shot `_showSummaryPending`. */
 2068│ export function CB2_ShowPokemonSummaryScreen_Manual(): void {
 2069│   if (_showSummaryPending) return;
 2070│   _showSummaryPending = true;
 2071│   const mon = _summaryTargetMon;
 2072│   _summaryTargetMon = null;
 2073│   if (mon) OpenSummaryScreen(mon, CB2_ReturnToPartyMenuFromSummary);
 2074│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CB2_ReturnToPartyMenuFromSummaryScreen  —  party_menu.c:2790-2796 (7 l)
▌ ‖ port: src/engine/party-screen.ts:278 (hors fonction)  ← cite "party_menu.c:2790" @src/engine/party-screen.ts:278
▌ ‖ port: CB2_ReturnToPartyMenuFromSummary (src/engine/party-screen.ts:2076-2107)  ← cite "party_menu.c:2790" @src/engine/party-screen.ts:2076
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2790-2796 ────────────────────────────────────────
 2790│ static void CB2_ReturnToPartyMenuFromSummaryScreen(void)
 2791│ {
 2792│     gPaletteFade.bufferTransferDisabled = TRUE;
 2793│     gPartyMenu.slotId = gLastViewedMonIndex;
 2794│     InitPartyMenu(gPartyMenu.menuType, KEEP_PARTY_LAYOUT, gPartyMenu.action, TRUE, PARTY_MSG_DO_WHAT_WITH_MON, Task_TryCreateSelectionWindow, gPartyMenu.exitCallback);
 2795│ }
 2796│ 
├─ PORT src/engine/party-screen.ts:2076-2107 ────────────────────────────────────────
 2076│ /** 1:1 décomp `CB2_ReturnToPartyMenuFromSummaryScreen` (party_menu.c:2790) :
 2077│  *
 2078│  *      gPaletteFade.bufferTransferDisabled = TRUE;
 2079│  *      gPartyMenu.slotId = gLastViewedMonIndex;
 2080│  *      InitPartyMenu(gPartyMenu.menuType, KEEP_PARTY_LAYOUT, gPartyMenu.action,
 2081│  *          TRUE, PARTY_MSG_DO_WHAT_WITH_MON, Task_TryCreateSelectionWindow,
 2082│  *          gPartyMenu.exitCallback);
 2083│  *
 2084│  *  → ré-init du party menu, curseur (= slotId) sur le mon vu en dernier
 2085│  *  (`gLastViewedMonIndex`), ET la fenêtre de sélection (RESUME/OBJET/RETOUR)
 2086│  *  se RÉ-OUVRE sur ce mon (Task_TryCreateSelectionWindow + PARTY_MSG_DO_WHAT
 2087│  *  _WITH_MON). On NE touche PAS gMain.savedCallback (= gPartyMenu.exitCallback
 2088│  *  préservé : B depuis party revient à l'ouvreur d'origine = start menu). */
 2089│ export function CB2_ReturnToPartyMenuFromSummary(): void {
 2090│   const rt = getRuntime();
 2091│   if (!rt) return;
 2092│   rt.gPaletteFade.bufferTransferDisabled = true;  // 1:1 décomp :2792
 2093│   // Le résumé a écrasé l'état visuel (VRAM/sprites/windows) → on force une
 2094│   // ré-init complète du party menu (flags readiness reset). _freePartyMenu
 2095│   // n'a PAS été appelé → _slotId est settable directement (1:1 slot = mon vu).
 2096│   _isOpen = false;
 2097│   _phase = 'idle';
 2098│   _graphicsReady = false; _graphicsLoading = false;
 2099│   _windowsReady = false; _windowsLoading = false;
 2100│   _showSummaryPending = false;
 2101│   _slotId = GetSummaryLastMonIndex();  // 1:1 gPartyMenu.slotId = gLastViewedMonIndex
 2102│   // 1:1 décomp : Task_TryCreateSelectionWindow → la fenêtre d'actions
 2103│   // (RESUME/OBJET/RETOUR) se ré-ouvre sur le mon vu (PARTY_MSG_DO_WHAT_WITH_MON).
 2104│   _reopenActionMenuAfterInit = true;
 2105│   rt.gMain.state = 0;
 2106│   rt.SetMainCallback2(CB2_InitPartyMenu);
 2107│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CursorCb_Switch  —  party_menu.c:2797-2821 (25 l)
▌ ‖ port: _drawMsg (src/engine/party-screen.ts:886-929)  ← cite "party_menu.c:2803" @src/engine/party-screen.ts:916
▌ ‖ port: _cursorCbSwitch (src/engine/party-screen.ts:1565-1583)  ← cite "party_menu.c:2797-2807" @src/engine/party-screen.ts:1565
▌ ‖ port: src/engine/party-screen.ts:1679 (hors fonction)  ← cite "party_menu.c:2809-2993" @src/engine/party-screen.ts:1679
▌ ‖ port: src/engine/party-screen.ts:1687 (hors fonction)  ← cite "party_menu.c:2809-2820" @src/engine/party-screen.ts:1687
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2797-2821 ────────────────────────────────────────
 2797│ static void CursorCb_Switch(u8 taskId)
 2798│ {
 2799│     PlaySE(SE_SELECT);
 2800│     gPartyMenu.action = PARTY_ACTION_SWITCH;
 2801│     PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
 2802│     PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[0]);
 2803│     DisplayPartyMenuStdMessage(PARTY_MSG_MOVE_TO_WHERE);
 2804│     AnimatePartySlot(gPartyMenu.slotId, 1);
 2805│     gPartyMenu.slotId2 = gPartyMenu.slotId;
 2806│     gTasks[taskId].func = Task_HandleChooseMonInput;
 2807│ }
 2808│ 
 2809│ #define tSlot1Left     data[0]
 2810│ #define tSlot1Top      data[1]
 2811│ #define tSlot1Width    data[2]
 2812│ #define tSlot1Height   data[3]
 2813│ #define tSlot2Left     data[4]
 2814│ #define tSlot2Top      data[5]
 2815│ #define tSlot2Width    data[6]
 2816│ #define tSlot2Height   data[7]
 2817│ #define tSlot1Offset   data[8]
 2818│ #define tSlot2Offset   data[9]
 2819│ #define tSlot1SlideDir data[10]
 2820│ #define tSlot2SlideDir data[11]
 2821│ 
├─ PORT src/engine/party-screen.ts:886-929 ────────────────────────────────────────
  886│ /** 1:1 décomp `DisplayPartyMenuStdMessage` (party_menu.c:2459) :
  887│  *  Remove existing msg window, add NEW window with appropriate template
  888│  *  selon stringId. Différents templates pour CHOOSE_MON vs DO_WHAT_WITH_MON
  889│  *  (= widths différents pour ne pas overlap avec action menu). */
  890│ function _drawMsg(): void {
  891│   // 1:1 décomp `if (*windowPtr != WINDOW_NONE) PartyMenuRemoveWindow(windowPtr);`
  892│   // PartyMenuRemoveWindow → ClearStdWindowAndFrameToTransparent + RemoveWindow.
  893│   // Sans clear, le frame border + texte précédent restent visibles en VRAM.
  894│   if (_msgWid >= 0) {
  895│     ClearStdWindowAndFrame(_msgWid, false);
  896│     CopyWindowToVram(_msgWid, 3);
  897│     RemoveWindow(_msgWid);
  898│     _msgWid = -1;
  899│   }
  900│   // 1:1 décomp ShouldUseChooseMonText : count alive mons.
  901│   const party = gameState.party as PokemonInstance[];
  902│   let numAlive = 0;
  903│   for (const m of party) {
  904│     if (m && m.currentHp > 0) numAlive++;
  905│     if (numAlive > 1) break;
  906│   }
  907│   const useChooseMon = numAlive > 1;
  908│   // 1:1 décomp switch sur stringId : DO_WHAT_WITH_MON ou CHOOSE_MON.
  909│   let msg: string;
  910│   let template: WindowTemplate;
  911│   if (_phase === 'action_menu') {
  912│     msg = getString('gText_DoWhatWithPokemon');  // "Que faire avec ce PKMN?"
  913│     template = DO_WHAT_WITH_MON_WINDOW_TEMPLATE;
  914│   } else if (_partyAction === PARTY_ACTION_SWITCH) {
  915│     // 1:1 décomp DisplayPartyMenuStdMessage(PARTY_MSG_MOVE_TO_WHERE)
  916│     // (party_menu.c:2803 ; party_menu.h:603 → gText_MoveToWhere ;
  917│     //  strings.c:431 = "Le mettre où?"). Même famille fenêtre que CHOOSE_MON.
  918│     msg = getString('gText_MoveToWhere');
  919│     template = MSG_WINDOW_TEMPLATE;
  920│   } else {
  921│     msg = useChooseMon ? getString('gText_ChoosePokemon') : getString('gText_ChoosePokemonCancel');
  922│     template = MSG_WINDOW_TEMPLATE;
  923│   }
  924│   _msgWid = AddWindow(template);
  925│   // 1:1 décomp `DrawStdFrameWithCustomTileAndPalette(*windowPtr, FALSE, 0x4F, 13)`.
  926│   DrawStdFrameWithCustomTileAndPalette(_msgWid, false, 0x4F, 13);
  927│   AddTextPrinterParameterized3(_msgWid, FONT_NORMAL, 0, 1, [1, 2, 3], TEXT_SKIP_DRAW, msg);
  928│   CopyWindowToVram(_msgWid, 3);
  929│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SwitchSelectedMons  —  party_menu.c:2822-2868 (47 l)
▌ ‖ port: _switchSelectedMons (src/engine/party-screen.ts:1807-1843)  ← cite "party_menu.c:2822-2866" @src/engine/party-screen.ts:1807
▌ ‖ port: Task_PartyMenu_HandleInput (src/engine/party-screen.ts:1896-1935)  ← cite "party_menu.c:2864/2962" @src/engine/party-screen.ts:1906
▌ ‖ port: Task_PartyMenu_HandleInput (src/engine/party-screen.ts:1896-1935)  ← cite "party_menu.c:2827-2830" @src/engine/party-screen.ts:1928
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2822-2868 ────────────────────────────────────────
 2822│ static void SwitchSelectedMons(u8 taskId)
 2823│ {
 2824│     s16 *data = gTasks[taskId].data;
 2825│     u8 windowIds[2];
 2826│ 
 2827│     if (gPartyMenu.slotId2 == gPartyMenu.slotId)
 2828│     {
 2829│         FinishTwoMonAction(taskId);
 2830│     }
 2831│     else
 2832│     {
 2833│         // Initialize switching party mons slide animation
 2834│         windowIds[0] = sPartyMenuBoxes[gPartyMenu.slotId].windowId;
 2835│         tSlot1Left = GetWindowAttribute(windowIds[0], WINDOW_TILEMAP_LEFT);
 2836│         tSlot1Top = GetWindowAttribute(windowIds[0], WINDOW_TILEMAP_TOP);
 2837│         tSlot1Width = GetWindowAttribute(windowIds[0], WINDOW_WIDTH);
 2838│         tSlot1Height = GetWindowAttribute(windowIds[0], WINDOW_HEIGHT);
 2839│         tSlot1Offset = 0;
 2840│         if (tSlot1Width == 10)
 2841│             tSlot1SlideDir = -1;
 2842│         else
 2843│             tSlot1SlideDir = 1;
 2844│         windowIds[1] = sPartyMenuBoxes[gPartyMenu.slotId2].windowId;
 2845│         tSlot2Left = GetWindowAttribute(windowIds[1], WINDOW_TILEMAP_LEFT);
 2846│         tSlot2Top = GetWindowAttribute(windowIds[1], WINDOW_TILEMAP_TOP);
 2847│         tSlot2Width = GetWindowAttribute(windowIds[1], WINDOW_WIDTH);
 2848│         tSlot2Height = GetWindowAttribute(windowIds[1], WINDOW_HEIGHT);
 2849│         tSlot2Offset = 0;
 2850│         if (tSlot2Width == 10)
 2851│             tSlot2SlideDir = -1;
 2852│         else
 2853│             tSlot2SlideDir = 1;
 2854│         sSlot1TilemapBuffer = Alloc(tSlot1Width * (tSlot1Height << 1));
 2855│         sSlot2TilemapBuffer = Alloc(tSlot2Width * (tSlot2Height << 1));
 2856│         CopyToBufferFromBgTilemap(0, sSlot1TilemapBuffer, tSlot1Left, tSlot1Top, tSlot1Width, tSlot1Height);
 2857│         CopyToBufferFromBgTilemap(0, sSlot2TilemapBuffer, tSlot2Left, tSlot2Top, tSlot2Width, tSlot2Height);
 2858│         ClearWindowTilemap(windowIds[0]);
 2859│         ClearWindowTilemap(windowIds[1]);
 2860│         gPartyMenu.action = PARTY_ACTION_SWITCHING;
 2861│         AnimatePartySlot(gPartyMenu.slotId, 1);
 2862│         AnimatePartySlot(gPartyMenu.slotId2, 1);
 2863│         SlidePartyMenuBoxOneStep(taskId);
 2864│         gTasks[taskId].func = Task_SlideSelectedSlotsOffscreen;
 2865│     }
 2866│ }
 2867│ 
 2868│ // returns FALSE if the slot has slid fully offscreen / back onscreen
├─ PORT src/engine/party-screen.ts:1807-1843 ────────────────────────────────────────
 1807│ /** 1:1 décomp `SwitchSelectedMons` (party_menu.c:2822-2866). Même slot →
 1808│  *  FinishTwoMonAction (annule, :2827-2830). Sinon : setup buffers + capture
 1809│  *  tilemap + ClearWindowTilemap + PARTY_ACTION_SWITCHING + AnimatePartySlot×2
 1810│  *  + 1er SlidePartyMenuBoxOneStep, puis task → SlideSelectedSlotsOffscreen. */
 1811│ function _switchSelectedMons(): void {
 1812│   if (_slotId2 === _slotId) {
 1813│     _finishTwoMonAction();
 1814│     return;
 1815│   }
 1816│   const w0 = _slotWindowIds[_slotId];
 1817│   _t1Left = GetWindowAttribute(w0, WINDOW_TILEMAP_LEFT);
 1818│   _t1Top  = GetWindowAttribute(w0, WINDOW_TILEMAP_TOP);
 1819│   _t1W    = GetWindowAttribute(w0, WINDOW_WIDTH);
 1820│   _t1H    = GetWindowAttribute(w0, WINDOW_HEIGHT);
 1821│   _t1Off = 0;
 1822│   _t1Dir = (_t1W === 10) ? -1 : 1;   // 1:1 :2840 (box gauche large 10 → -1)
 1823│   const w1 = _slotWindowIds[_slotId2];
 1824│   _t2Left = GetWindowAttribute(w1, WINDOW_TILEMAP_LEFT);
 1825│   _t2Top  = GetWindowAttribute(w1, WINDOW_TILEMAP_TOP);
 1826│   _t2W    = GetWindowAttribute(w1, WINDOW_WIDTH);
 1827│   _t2H    = GetWindowAttribute(w1, WINDOW_HEIGHT);
 1828│   _t2Off = 0;
 1829│   _t2Dir = (_t2W === 10) ? -1 : 1;
 1830│   // 1:1 :2854 Alloc(width * (height<<1)) = width*height u16 entries.
 1831│   _sSlot1Buf = new Uint16Array(_t1W * _t1H);
 1832│   _sSlot2Buf = new Uint16Array(_t2W * _t2H);
 1833│   CopyToBufferFromBgTilemap(0, _sSlot1Buf, _t1Left, _t1Top, _t1W, _t1H);
 1834│   CopyToBufferFromBgTilemap(0, _sSlot2Buf, _t2Left, _t2Top, _t2W, _t2H);
 1835│   ClearWindowTilemap(w0);
 1836│   ClearWindowTilemap(w1);
 1837│   _partyAction = PARTY_ACTION_SWITCHING;
 1838│   AnimatePartySlot(_slotId, 1);
 1839│   AnimatePartySlot(_slotId2, 1);
 1840│   _slidePartyMenuBoxOneStep();
 1841│   _phase = 'switching';
 1842│   _slideTaskFn = _taskSlideSelectedSlotsOffscreen;
 1843│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ TryMovePartySlot  —  party_menu.c:2869-2894 (26 l)
▌ ‖ port: src/engine/party-screen.ts:1707 (hors fonction)  ← cite "party_menu.c:2869-2893" @src/engine/party-screen.ts:1707
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2869-2894 ────────────────────────────────────────
 2869│ static bool8 TryMovePartySlot(s16 x, s16 width, u8 *leftMove, u8 *newX, u8 *newWidth)
 2870│ {
 2871│     if (x + width < 0)
 2872│         return FALSE;
 2873│     if (x > 31)
 2874│         return FALSE;
 2875│ 
 2876│     if (x < 0)
 2877│     {
 2878│         *leftMove = x * -1;
 2879│         *newX = 0;
 2880│         *newWidth = width + x;
 2881│     }
 2882│     else
 2883│     {
 2884│         *leftMove = 0;
 2885│         *newX = x;
 2886│         if (x + width > 31)
 2887│             *newWidth = 32 - x;
 2888│         else
 2889│             *newWidth = width;
 2890│ 
 2891│     }
 2892│     return TRUE;
 2893│ }
 2894│ 
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ MoveAndBufferPartySlot  —  party_menu.c:2895-2906 (12 l)
▌ ‖ port: _moveAndBufferPartySlot (src/engine/party-screen.ts:1716-1728)  ← cite "party_menu.c:2895-2905" @src/engine/party-screen.ts:1716
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2895-2906 ────────────────────────────────────────
 2895│ static void MoveAndBufferPartySlot(const void *rectSrc, s16 x, s16 y, s16 width, s16 height, s16 dir)
 2896│ {
 2897│     u8 srcX, newX, newWidth;
 2898│ 
 2899│     if (TryMovePartySlot(x, width, &srcX, &newX, &newWidth))
 2900│     {
 2901│         FillBgTilemapBufferRect_Palette0(0, 0, newX, y, newWidth, height);
 2902│         if (TryMovePartySlot(x + dir, width, &srcX, &newX, &newWidth))
 2903│             CopyRectToBgTilemapBufferRect(0, rectSrc, srcX, 0, width, height, newX, y, newWidth, height, 17, 0, 0);
 2904│     }
 2905│ }
 2906│ 
├─ PORT src/engine/party-screen.ts:1716-1728 ────────────────────────────────────────
 1716│ /** 1:1 décomp `MoveAndBufferPartySlot` (party_menu.c:2895-2905) : efface le
 1717│  *  footprint courant (FillBgTilemapBufferRect_Palette0) puis re-stampe le
 1718│  *  buffer capturé à la position suivante (x+dir) via CopyRectToBgTilemapBufferRect
 1719│  *  (palette1=17 = copie verbatim des entries). */
 1720│ function _moveAndBufferPartySlot(rectSrc: Uint16Array, x: number, y: number, width: number, height: number, dir: number): void {
 1721│   const r = _tryMovePartySlot(x, width);
 1722│   if (!r) return;
 1723│   FillBgTilemapBufferRect_Palette0(0, 0, r.newX, y, r.newWidth, height);
 1724│   const r2 = _tryMovePartySlot(x + dir, width);
 1725│   if (r2) {
 1726│     CopyRectToBgTilemapBufferRect(0, rectSrc, r2.leftMove, 0, width, height, r2.newX, y, r2.newWidth, height, 17, 0, 0);
 1727│   }
 1728│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ MovePartyMenuBoxSprites  —  party_menu.c:2907-2914 (8 l)
▌ ‖ port: _movePartyMenuBoxSprites (src/engine/party-screen.ts:1730-1744)  ← cite "party_menu.c:2907-2913" @src/engine/party-screen.ts:1730
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2907-2914 ────────────────────────────────────────
 2907│ static void MovePartyMenuBoxSprites(struct PartyMenuBox *menuBox, s16 offset)
 2908│ {
 2909│     gSprites[menuBox->pokeballSpriteId].x2 += offset * 8;
 2910│     gSprites[menuBox->itemSpriteId].x2 += offset * 8;
 2911│     gSprites[menuBox->monSpriteId].x2 += offset * 8;
 2912│     gSprites[menuBox->statusSpriteId].x2 += offset * 8;
 2913│ }
 2914│ 
├─ PORT src/engine/party-screen.ts:1730-1744 ────────────────────────────────────────
 1730│ /** 1:1 décomp `MovePartyMenuBoxSprites` (party_menu.c:2907-2913) : décale les
 1731│  *  sprites du box de `offset*8` px (x2). Décomp = 4 sprites ; notre modèle =
 1732│  *  4 sprites (pokeball + icône + statut + objet tenu) = 1:1 net. */
 1733│ function _movePartyMenuBoxSprites(slot: number, offset: number): void {
 1734│   const rt = getRuntime();
 1735│   if (!rt) return;
 1736│   const pk = rt.gSprites.get(_pokeballOamBySlot[slot]);
 1737│   const ic = rt.gSprites.get(_iconOamBySlot[slot]);
 1738│   const st = rt.gSprites.get(_statusOamBySlot[slot]);
 1739│   const it = rt.gSprites.get(_itemOamBySlot[slot]);
 1740│   if (pk) pk.x2 += offset * 8;
 1741│   if (ic) ic.x2 += offset * 8;
 1742│   if (st) st.x2 += offset * 8;   // 1:1 :2912 statusSpriteId.x2 += offset*8
 1743│   if (it) it.x2 += offset * 8;   // 1:1 :2910 itemSpriteId.x2 += offset*8
 1744│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SlidePartyMenuBoxSpritesOneStep  —  party_menu.c:2915-2924 (10 l)
▌ ‖ port: _slidePartyMenuBoxSpritesOneStep (src/engine/party-screen.ts:1746-1750)  ← cite "party_menu.c:2915-2923" @src/engine/party-screen.ts:1746
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2915-2924 ────────────────────────────────────────
 2915│ static void SlidePartyMenuBoxSpritesOneStep(u8 taskId)
 2916│ {
 2917│     s16 *data = gTasks[taskId].data;
 2918│ 
 2919│     if (tSlot1SlideDir != 0)
 2920│         MovePartyMenuBoxSprites(&sPartyMenuBoxes[gPartyMenu.slotId], tSlot1SlideDir);
 2921│     if (tSlot2SlideDir != 0)
 2922│         MovePartyMenuBoxSprites(&sPartyMenuBoxes[gPartyMenu.slotId2], tSlot2SlideDir);
 2923│ }
 2924│ 
├─ PORT src/engine/party-screen.ts:1746-1750 ────────────────────────────────────────
 1746│ /** 1:1 décomp `SlidePartyMenuBoxSpritesOneStep` (party_menu.c:2915-2923). */
 1747│ function _slidePartyMenuBoxSpritesOneStep(): void {
 1748│   if (_t1Dir !== 0) _movePartyMenuBoxSprites(_slotId, _t1Dir);
 1749│   if (_t2Dir !== 0) _movePartyMenuBoxSprites(_slotId2, _t2Dir);
 1750│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SlidePartyMenuBoxOneStep  —  party_menu.c:2925-2935 (11 l)
▌ ‖ port: _slidePartyMenuBoxOneStep (src/engine/party-screen.ts:1752-1757)  ← cite "party_menu.c:2925-2934" @src/engine/party-screen.ts:1752
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2925-2935 ────────────────────────────────────────
 2925│ static void SlidePartyMenuBoxOneStep(u8 taskId)
 2926│ {
 2927│     s16 *data = gTasks[taskId].data;
 2928│ 
 2929│     if (tSlot1SlideDir != 0)
 2930│         MoveAndBufferPartySlot(sSlot1TilemapBuffer, tSlot1Left + tSlot1Offset, tSlot1Top, tSlot1Width, tSlot1Height, tSlot1SlideDir);
 2931│     if (tSlot2SlideDir != 0)
 2932│         MoveAndBufferPartySlot(sSlot2TilemapBuffer, tSlot2Left + tSlot2Offset, tSlot2Top, tSlot2Width, tSlot2Height, tSlot2SlideDir);
 2933│     ScheduleBgCopyTilemapToVram(0);
 2934│ }
 2935│ 
├─ PORT src/engine/party-screen.ts:1752-1757 ────────────────────────────────────────
 1752│ /** 1:1 décomp `SlidePartyMenuBoxOneStep` (party_menu.c:2925-2934). */
 1753│ function _slidePartyMenuBoxOneStep(): void {
 1754│   if (_t1Dir !== 0 && _sSlot1Buf) _moveAndBufferPartySlot(_sSlot1Buf, _t1Left + _t1Off, _t1Top, _t1W, _t1H, _t1Dir);
 1755│   if (_t2Dir !== 0 && _sSlot2Buf) _moveAndBufferPartySlot(_sSlot2Buf, _t2Left + _t2Off, _t2Top, _t2W, _t2H, _t2Dir);
 1756│   ScheduleBgCopyTilemapToVram(0);
 1757│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_SlideSelectedSlotsOffscreen  —  party_menu.c:2936-2965 (30 l)
▌ ‖ port: _taskSlideSelectedSlotsOffscreen (src/engine/party-screen.ts:1759-1785)  ← cite "party_menu.c:2936-2964" @src/engine/party-screen.ts:1759
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2936-2965 ────────────────────────────────────────
 2936│ static void Task_SlideSelectedSlotsOffscreen(u8 taskId)
 2937│ {
 2938│     s16 *data = gTasks[taskId].data;
 2939│     u16 slidingSlotPositions[2];
 2940│ 
 2941│     SlidePartyMenuBoxOneStep(taskId);
 2942│     SlidePartyMenuBoxSpritesOneStep(taskId);
 2943│     tSlot1Offset += tSlot1SlideDir;
 2944│     tSlot2Offset += tSlot2SlideDir;
 2945│     slidingSlotPositions[0] = tSlot1Left + tSlot1Offset;
 2946│     slidingSlotPositions[1] = tSlot2Left + tSlot2Offset;
 2947│ 
 2948│     // Both slots have slid offscreen
 2949│     if (slidingSlotPositions[0] > 33 && slidingSlotPositions[1] > 33)
 2950│     {
 2951│         tSlot1SlideDir *= -1;
 2952│         tSlot2SlideDir *= -1;
 2953│         SwitchPartyMon();
 2954│         DisplayPartyPokemonData(gPartyMenu.slotId);
 2955│         DisplayPartyPokemonData(gPartyMenu.slotId2);
 2956│         PutWindowTilemap(sPartyMenuBoxes[gPartyMenu.slotId].windowId);
 2957│         PutWindowTilemap(sPartyMenuBoxes[gPartyMenu.slotId2].windowId);
 2958│         CopyToBufferFromBgTilemap(0, sSlot1TilemapBuffer, tSlot1Left, tSlot1Top, tSlot1Width, tSlot1Height);
 2959│         CopyToBufferFromBgTilemap(0, sSlot2TilemapBuffer, tSlot2Left, tSlot2Top, tSlot2Width, tSlot2Height);
 2960│         ClearWindowTilemap(sPartyMenuBoxes[gPartyMenu.slotId].windowId);
 2961│         ClearWindowTilemap(sPartyMenuBoxes[gPartyMenu.slotId2].windowId);
 2962│         gTasks[taskId].func = Task_SlideSelectedSlotsOnscreen;
 2963│     }
 2964│ }
 2965│ 
├─ PORT src/engine/party-screen.ts:1759-1785 ────────────────────────────────────────
 1759│ /** 1:1 décomp `Task_SlideSelectedSlotsOffscreen` (party_menu.c:2936-2964). */
 1760│ function _taskSlideSelectedSlotsOffscreen(): void {
 1761│   _slidePartyMenuBoxOneStep();
 1762│   _slidePartyMenuBoxSpritesOneStep();
 1763│   _t1Off += _t1Dir;
 1764│   _t2Off += _t2Dir;
 1765│   // 1:1 décomp :2939 `u16 slidingSlotPositions[2]` — sémantique UNSIGNED : la
 1766│   // box gauche (largeur 10, dir -1) fait UNDERFLOW (1+(-N) → ~0xFFFF) donc
 1767│   // > 33 = TRUE : c'est AINSI que la décomp détecte sa sortie par la gauche.
 1768│   // Le masque & 0xFFFF est OBLIGATOIRE (sinon -N reste négatif, jamais >33).
 1769│   const p0 = (_t1Left + _t1Off) & 0xFFFF;
 1770│   const p1 = (_t2Left + _t2Off) & 0xFFFF;
 1771│   if (p0 > 33 && p1 > 33) {
 1772│     _t1Dir *= -1;
 1773│     _t2Dir *= -1;
 1774│     _switchPartyMon();
 1775│     _displayPartyPokemonData(_slotId);
 1776│     _displayPartyPokemonData(_slotId2);
 1777│     PutWindowTilemap(_slotWindowIds[_slotId]);
 1778│     PutWindowTilemap(_slotWindowIds[_slotId2]);
 1779│     if (_sSlot1Buf) CopyToBufferFromBgTilemap(0, _sSlot1Buf, _t1Left, _t1Top, _t1W, _t1H);
 1780│     if (_sSlot2Buf) CopyToBufferFromBgTilemap(0, _sSlot2Buf, _t2Left, _t2Top, _t2W, _t2H);
 1781│     ClearWindowTilemap(_slotWindowIds[_slotId]);
 1782│     ClearWindowTilemap(_slotWindowIds[_slotId2]);
 1783│     _slideTaskFn = _taskSlideSelectedSlotsOnscreen;
 1784│   }
 1785│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_SlideSelectedSlotsOnscreen  —  party_menu.c:2966-2994 (29 l)
▌ ‖ port: _taskSlideSelectedSlotsOnscreen (src/engine/party-screen.ts:1787-1805)  ← cite "party_menu.c:2966-2993" @src/engine/party-screen.ts:1787
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2966-2994 ────────────────────────────────────────
 2966│ static void Task_SlideSelectedSlotsOnscreen(u8 taskId)
 2967│ {
 2968│     s16 *data = gTasks[taskId].data;
 2969│ 
 2970│     SlidePartyMenuBoxOneStep(taskId);
 2971│     SlidePartyMenuBoxSpritesOneStep(taskId);
 2972│ 
 2973│     // Both slots have slid back onscreen
 2974│     if (tSlot1SlideDir == 0 && tSlot2SlideDir == 0)
 2975│     {
 2976│         PutWindowTilemap(sPartyMenuBoxes[gPartyMenu.slotId].windowId);
 2977│         PutWindowTilemap(sPartyMenuBoxes[gPartyMenu.slotId2].windowId);
 2978│         ScheduleBgCopyTilemapToVram(0);
 2979│         Free(sSlot1TilemapBuffer);
 2980│         Free(sSlot2TilemapBuffer);
 2981│         FinishTwoMonAction(taskId);
 2982│     }
 2983│     // Continue sliding
 2984│     else
 2985│     {
 2986│         tSlot1Offset += tSlot1SlideDir;
 2987│         tSlot2Offset += tSlot2SlideDir;
 2988│         if (tSlot1Offset == 0)
 2989│             tSlot1SlideDir = 0;
 2990│         if (tSlot2Offset == 0)
 2991│             tSlot2SlideDir = 0;
 2992│     }
 2993│ }
 2994│ 
├─ PORT src/engine/party-screen.ts:1787-1805 ────────────────────────────────────────
 1787│ /** 1:1 décomp `Task_SlideSelectedSlotsOnscreen` (party_menu.c:2966-2993). */
 1788│ function _taskSlideSelectedSlotsOnscreen(): void {
 1789│   _slidePartyMenuBoxOneStep();
 1790│   _slidePartyMenuBoxSpritesOneStep();
 1791│   if (_t1Dir === 0 && _t2Dir === 0) {
 1792│     PutWindowTilemap(_slotWindowIds[_slotId]);
 1793│     PutWindowTilemap(_slotWindowIds[_slotId2]);
 1794│     ScheduleBgCopyTilemapToVram(0);
 1795│     _sSlot1Buf = null;            // 1:1 Free(sSlot1TilemapBuffer)
 1796│     _sSlot2Buf = null;            // 1:1 Free(sSlot2TilemapBuffer)
 1797│     _slideTaskFn = null;
 1798│     _finishTwoMonAction();        // remet _phase='open', _partyAction=CHOOSE_MON
 1799│   } else {
 1800│     _t1Off += _t1Dir;
 1801│     _t2Off += _t2Dir;
 1802│     if (_t1Off === 0) _t1Dir = 0;
 1803│     if (_t2Off === 0) _t2Dir = 0;
 1804│   }
 1805│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SwitchMenuBoxSprites  —  party_menu.c:2995-3015 (21 l)
▌ ‖ port: _switchMenuBoxSprites (src/engine/party-screen.ts:1585-1600)  ← cite "party_menu.c:2995-3014" @src/engine/party-screen.ts:1585
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:2995-3015 ────────────────────────────────────────
 2995│ static void SwitchMenuBoxSprites(u8 *spriteIdPtr1, u8 *spriteIdPtr2)
 2996│ {
 2997│     u8 spriteIdBuffer = *spriteIdPtr1;
 2998│     u16 xBuffer1, yBuffer1, xBuffer2, yBuffer2;
 2999│ 
 3000│     *spriteIdPtr1 = *spriteIdPtr2;
 3001│     *spriteIdPtr2 = spriteIdBuffer;
 3002│     xBuffer1 = gSprites[*spriteIdPtr1].x;
 3003│     yBuffer1 = gSprites[*spriteIdPtr1].y;
 3004│     xBuffer2 = gSprites[*spriteIdPtr1].x2;
 3005│     yBuffer2 = gSprites[*spriteIdPtr1].y2;
 3006│     gSprites[*spriteIdPtr1].x = gSprites[*spriteIdPtr2].x;
 3007│     gSprites[*spriteIdPtr1].y = gSprites[*spriteIdPtr2].y;
 3008│     gSprites[*spriteIdPtr1].x2 = gSprites[*spriteIdPtr2].x2;
 3009│     gSprites[*spriteIdPtr1].y2 = gSprites[*spriteIdPtr2].y2;
 3010│     gSprites[*spriteIdPtr2].x = xBuffer1;
 3011│     gSprites[*spriteIdPtr2].y = yBuffer1;
 3012│     gSprites[*spriteIdPtr2].x2 = xBuffer2;
 3013│     gSprites[*spriteIdPtr2].y2 = yBuffer2;
 3014│ }
 3015│ 
├─ PORT src/engine/party-screen.ts:1585-1600 ────────────────────────────────────────
 1585│ /** 1:1 décomp `SwitchMenuBoxSprites` (party_menu.c:2995-3014) : échange les
 1586│  *  2 ids sprite ET leurs x/y/x2/y2 (les sprites suivent visuellement le swap
 1587│  *  de données). Adapté à notre modèle 2-sprites/box (pokeball + icône) ;
 1588│  *  item/statut sont rendus dans la window slot (re-dessinés par _drawSlot). */
 1589│ function _switchMenuBoxSprites(arr: number[], i: number, j: number): void {
 1590│   const rt = getRuntime();
 1591│   const a = arr[i], b = arr[j];
 1592│   arr[i] = b; arr[j] = a;
 1593│   if (!rt) return;
 1594│   const sa = rt.gSprites.get(arr[i]);   // = ex-b
 1595│   const sb = rt.gSprites.get(arr[j]);   // = ex-a
 1596│   if (!sa || !sb) return;
 1597│   const x1 = sa.x, y1 = sa.y, x2 = sa.x2, y2 = sa.y2;
 1598│   sa.x = sb.x; sa.y = sb.y; sa.x2 = sb.x2; sa.y2 = sb.y2;
 1599│   sb.x = x1; sb.y = y1; sb.x2 = x2; sb.y2 = y2;
 1600│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SwitchPartyMon  —  party_menu.c:3016-3037 (22 l)
▌ ‖ port: _switchSlotIconGraphics (src/engine/party-screen.ts:1602-1640)  ← cite "party_menu.c:3033" @src/engine/party-screen.ts:1603
▌ ‖ port: _switchPartyMon (src/engine/party-screen.ts:1642-1667)  ← cite "party_menu.c:3016-3035" @src/engine/party-screen.ts:1642
▌ ‖ port: _switchPartyMon (src/engine/party-screen.ts:1642-1667)  ← cite "party_menu.c:3033" @src/engine/party-screen.ts:1653
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:3016-3037 ────────────────────────────────────────
 3016│ static void SwitchPartyMon(void)
 3017│ {
 3018│     struct PartyMenuBox *menuBoxes[2];
 3019│     struct Pokemon *mon1, *mon2;
 3020│     struct Pokemon *monBuffer;
 3021│ 
 3022│     menuBoxes[0] = &sPartyMenuBoxes[gPartyMenu.slotId];
 3023│     menuBoxes[1] = &sPartyMenuBoxes[gPartyMenu.slotId2];
 3024│     mon1 = &gPlayerParty[gPartyMenu.slotId];
 3025│     mon2 = &gPlayerParty[gPartyMenu.slotId2];
 3026│     monBuffer = Alloc(sizeof(struct Pokemon));
 3027│     *monBuffer = *mon1;
 3028│     *mon1 = *mon2;
 3029│     *mon2 = *monBuffer;
 3030│     Free(monBuffer);
 3031│     SwitchMenuBoxSprites(&menuBoxes[0]->pokeballSpriteId, &menuBoxes[1]->pokeballSpriteId);
 3032│     SwitchMenuBoxSprites(&menuBoxes[0]->itemSpriteId, &menuBoxes[1]->itemSpriteId);
 3033│     SwitchMenuBoxSprites(&menuBoxes[0]->monSpriteId, &menuBoxes[1]->monSpriteId);
 3034│     SwitchMenuBoxSprites(&menuBoxes[0]->statusSpriteId, &menuBoxes[1]->statusSpriteId);
 3035│ }
 3036│ 
 3037│ // Finish switching mons or using Softboiled
├─ PORT src/engine/party-screen.ts:1602-1640 ────────────────────────────────────────
 1602│ /** 1:1-NET décomp `SwitchMenuBoxSprites(&menuBoxes[0]->monSpriteId,
 1603│  *  &menuBoxes[1]->monSpriteId)` (party_menu.c:3033). Décomp : le sprite
 1604│  *  d'icône POSSÈDE son graphique (CreateMonIcon alloue ses propres tiles) →
 1605│  *  swapper les ids déplace l'icône AVEC le mon. NOTRE modèle : l'icône est
 1606│  *  SLOT-PINNED — `_updateMonIconFrame(slot)` force `oam.tileId =
 1607│  *  slot*ICON_TILES_PER_SLOT` CHAQUE frame (party-screen.ts:1182-1183) et le
 1608│  *  graphique objVram + la palette obj sont chargés à un offset indexé par
 1609│  *  SLOT (:980/:992). Le swap d'ids sprite ne déplace donc RIEN (re-pinné au
 1610│  *  slot l'instant d'après). L'équivalent NET du swap décomp = échanger
 1611│  *  l'état SLOT-OWNED de l'icône : tiles objVram du slot + palette obj +
 1612│  *  compteurs d'anim. (Bug A/B 2026-05-19 : sans ça "le sprite change pas,
 1613│  *  la palette si" — l'icône restait figée au slot.) */
 1614│ function _switchSlotIconGraphics(s1: number, s2: number): void {
 1615│   const rt = getRuntime();
 1616│   if (!rt) return;
 1617│   // 1) Tiles objVram : ICON_TILES_PER_SLOT*32 = 1024 octets / slot.
 1618│   const BYTES_PER_SLOT = ICON_TILES_PER_SLOT * 32;
 1619│   const off1 = (ICON_OBJ_TILE_OFFSET / 32 + s1 * ICON_TILES_PER_SLOT) * 32;
 1620│   const off2 = (ICON_OBJ_TILE_OFFSET / 32 + s2 * ICON_TILES_PER_SLOT) * 32;
 1621│   const vram = rt.gba.objVram;
 1622│   const tmp1 = new Uint8Array(BYTES_PER_SLOT);
 1623│   const tmp2 = new Uint8Array(BYTES_PER_SLOT);
 1624│   for (let k = 0; k < BYTES_PER_SLOT; k++) { tmp1[k] = vram[off1 + k]; tmp2[k] = vram[off2 + k]; }
 1625│   for (let k = 0; k < BYTES_PER_SLOT; k++) { vram[off1 + k] = tmp2[k]; vram[off2 + k] = tmp1[k]; }
 1626│   // 2) Palette obj du slot (bank ICON_OBJ_PAL_BASE+slot, 16 entries u16 @
 1627│   //    gPlttBuffer[256 + bank*16]). Swap Unfaded ET Faded (1:1 LoadPalette).
 1628│   const p1 = 256 + (ICON_OBJ_PAL_BASE + s1) * 16;
 1629│   const p2 = 256 + (ICON_OBJ_PAL_BASE + s2) * 16;
 1630│   for (const buf of [rt.gPlttBufferUnfaded, rt.gPlttBufferFaded]) {
 1631│     for (let i = 0; i < 16; i++) {
 1632│       const a = buf.get(p1 + i);
 1633│       buf.set(p1 + i, buf.get(p2 + i));
 1634│       buf.set(p2 + i, a);
 1635│     }
 1636│   }
 1637│   // 3) Compteurs d'anim idle du slot (suivent le mon → frame cohérente).
 1638│   const swap = (arr: number[]) => { const t = arr[s1]; arr[s1] = arr[s2]; arr[s2] = t; };
 1639│   swap(_iconAnimDelay); swap(_iconAnimCmdIdx);
 1640│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ FinishTwoMonAction  —  party_menu.c:3038-3061 (24 l)
▌ ‖ port: _finishTwoMonAction (src/engine/party-screen.ts:1669-1677)  ← cite "party_menu.c:3038-3047" @src/engine/party-screen.ts:1669
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:3038-3061 ────────────────────────────────────────
 3038│ static void FinishTwoMonAction(u8 taskId)
 3039│ {
 3040│     PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
 3041│     gPartyMenu.action = PARTY_ACTION_CHOOSE_MON;
 3042│     AnimatePartySlot(gPartyMenu.slotId, 0);
 3043│     gPartyMenu.slotId = gPartyMenu.slotId2;
 3044│     AnimatePartySlot(gPartyMenu.slotId2, 1);
 3045│     DisplayPartyMenuStdMessage(PARTY_MSG_CHOOSE_MON);
 3046│     gTasks[taskId].func = Task_HandleChooseMonInput;
 3047│ }
 3048│ 
 3049│ #undef tSlot1Left
 3050│ #undef tSlot1Top
 3051│ #undef tSlot1Width
 3052│ #undef tSlot1Height
 3053│ #undef tSlot2Left
 3054│ #undef tSlot2Top
 3055│ #undef tSlot2Width
 3056│ #undef tSlot2Height
 3057│ #undef tSlot1Offset
 3058│ #undef tSlot2Offset
 3059│ #undef tSlot1SlideDir
 3060│ #undef tSlot2SlideDir
 3061│ 
├─ PORT src/engine/party-screen.ts:1669-1677 ────────────────────────────────────────
 1669│ /** 1:1 décomp `FinishTwoMonAction` (party_menu.c:3038-3047). */
 1670│ function _finishTwoMonAction(): void {
 1671│   _partyAction = PARTY_ACTION_CHOOSE_MON;     // 1:1 :3041
 1672│   AnimatePartySlot(_slotId, 0);               // 1:1 :3042
 1673│   _slotId = _slotId2;                         // 1:1 :3043
 1674│   AnimatePartySlot(_slotId2, 1);              // 1:1 :3044
 1675│   _phase = 'open';
 1676│   _drawMsg();                                 // 1:1 DisplayPartyMenuStdMessage(CHOOSE_MON)
 1677│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CreatePartyMonIconSprite  —  party_menu.c:3928-3941 (14 l)
▌ ‖ port: _spawnIconOams (src/engine/party-screen.ts:1125-1193)  ← cite "party_menu.c:3937" @src/engine/party-screen.ts:1136
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:3928-3941 ────────────────────────────────────────
 3928│ static void CreatePartyMonIconSprite(struct Pokemon *mon, struct PartyMenuBox *menuBox, u32 slot)
 3929│ {
 3930│     bool32 handleDeoxys = TRUE;
 3931│     u16 species2;
 3932│ 
 3933│     // If in a multi battle, show partners Deoxys icon as Normal forme
 3934│     if (IsMultiBattle() == TRUE && gMain.inBattle)
 3935│         handleDeoxys = (sMultiBattlePartnersPartyMask[slot] ^ handleDeoxys) ? TRUE : FALSE;
 3936│ 
 3937│     species2 = GetMonData(mon, MON_DATA_SPECIES_OR_EGG);
 3938│     CreatePartyMonIconSpriteParameterized(species2, GetMonData(mon, MON_DATA_PERSONALITY), menuBox, 1, handleDeoxys);
 3939│     UpdatePartyMonHPBar(menuBox->monSpriteId, mon);
 3940│ }
 3941│ 
├─ PORT src/engine/party-screen.ts:1125-1193 ────────────────────────────────────────
 1125│ /** Spawn Pokémon icon OAM per slot. MVP : just placeholders (= no actual
 1126│  *  icon load). Future : load /decomp/em/pokemon/<dexid>/icon.png + .pal. */
 1127│ async function _spawnIconOams(): Promise<void> {
 1128│   const rt = getRuntime();
 1129│   if (!rt) return;
 1130│   _iconOamBySlot = [-1, -1, -1, -1, -1, -1];
 1131│   _iconBaseY = [0, 0, 0, 0, 0, 0];
 1132│   const party = gameState.party as PokemonInstance[];
 1133│   for (let i = 0; i < 6; i++) {
 1134│     const mon = party[i];
 1135│     if (!mon) continue;
 1136│     // 1:1 décomp `CreatePartyMonIconSprite` (party_menu.c:3937) : species2 =
 1137│     // MON_DATA_SPECIES_OR_EGG → SPECIES_EGG si œuf → gMonIconTable[SPECIES_EGG]
 1138│     // = icône d'ŒUF (pas l'icône de l'espèce dedans).
 1139│     const dexId = mon.isEgg ? 'egg' : mon.speciesEnum.replace(/^SPECIES_/, '').toLowerCase();
 1140│     const iconPalSpecies = mon.isEgg ? 'SPECIES_EGG' : mon.speciesEnum;
 1141│     try {
 1142│       const iconPng = await loadIndexedPngStrict(`/decomp/em/pokemon/${dexId}/icon.png`, 4);
 1143│       // 1:1 décomp pokemon_icon.png = 32×64 sheet vertical stack de 2 anim frames
 1144│       // 32×32. Une frame = 4×4 tiles = 16 tiles = 512 bytes 4bpp.
 1145│       // Charge LES DEUX frames (= 32 tiles = 1024 bytes) pour idle anim toggle.
 1146│       const BYTES_PER_FRAME = ICON_TILES_PER_FRAME * 32;  // 512
 1147│       const BYTES_PER_SLOT  = ICON_TILES_PER_SLOT  * 32;  // 1024
 1148│       const slotTileBase = ICON_OBJ_TILE_OFFSET / 32 + i * ICON_TILES_PER_SLOT;
 1149│       const slotByteOffset = slotTileBase * 32;
 1150│       // Frames stockées contiguës : tiles [slotTileBase..+15] = frame 0,
 1151│       //   [slotTileBase+16..+31] = frame 1.
 1152│       rt.gba.objVram.set(iconPng.charData.slice(0, BYTES_PER_SLOT), slotByteOffset);
 1153│       void BYTES_PER_FRAME;
 1154│       // 1:1 décomp `LoadMonIconPalette(species)` : lookup gMonIconPaletteIndices
 1155│       // pour obtenir l'index 0/1/2, puis load `gMonIconPalettes[index]` (= un
 1156│       // de 3 palettes shared between species). Pas normal.pal (= front sprite
 1157│       // palette, DIFFERENT from icon palette).
 1158│       const palIdx = MON_ICON_PALETTE_INDICES[iconPalSpecies] ?? 0;
 1159│       const iconPal = await loadGbaPal(`/decomp/em/pokemon/icon_palettes/icon_palette_${palIdx}.pal`);
 1160│       const palBank = ICON_OBJ_PAL_BASE + i;
 1161│       rt.LoadPaletteObj(iconPal, OBJ_PLTT_ID(palBank));
 1162│       // 1:1 décomp `CreateMonIconSprite(template, x, y, ...)` (= sprite center
 1163│       // coords in pixels). Notre `CreateSpriteAtOam` engine applique
 1164│       // CalcCenterToCornerVec INTERNE via le sprite.centerToCornerVec stocké
 1165│       // au create. Passer les coords DÉCOMP direct (= sprite center).
 1166│       const [x, y] = ICON_COORDS[i];
 1167│       const oamY = y;
 1168│       const spr = rt.CreateSpriteAtOam({
 1169│         x, y,
 1170│         shape: 0, size: 2,  // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32)
 1171│         tileId: slotTileBase,
 1172│         paletteBank: palBank,
 1173│         // 1:1 décomp `CreatePartyMonIconSpriteParameterized(..., priority=1)`
 1174│         // + CreateMonIcon subpriority=1 → icon EN FRONT du pokeball
 1175│         // (subpriority=8). Lower subpriority = front in OAM rendering.
 1176│         priority: 1,
 1177│         subpriority: 1,
 1178│       });
 1179│       _iconOamBySlot[i] = spr.spriteId;
 1180│       _iconBaseY[i] = oamY;
 1181│       // 1:1 décomp : CreateMonIconSprite appelle UpdateMonIconFrame une fois
 1182│       // (pokemon_icon.c:1046 → pose frame 0, delay 6, animCmdIndex 1) PUIS la
 1183│       // CB2 init fait AnimatePartySlot(i, 0/1). Comme notre spawn est async (il
 1184│       // peut finir APRÈS le case 14), on applique l'état initial ICI : reset
 1185│       // anim + frame 0 + décalage sélection/désélection sur le bon slot.
 1186│       _iconAnimDelay[i] = 0; _iconAnimCmdIdx[i] = 0; _iconAnimNum[i] = 0;
 1187│       _updateMonIconFrame(i);
 1188│       _animateSelectedPartyIcon(i, i === _slotId ? 1 : 0);
 1189│     } catch (e) {
 1190│       console.warn(`[party-screen] icon load failed for ${dexId}:`, e);
 1191│     }
 1192│   }
 1193│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ AnimateSelectedPartyIcon  —  party_menu.c:3978-4002 (25 l)
▌ ‖ port: _animateSelectedPartyIcon (src/engine/party-screen.ts:1392-1422)  ← cite "party_menu.c:3978" @src/engine/party-screen.ts:1393
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:3978-4002 ────────────────────────────────────────
 3978│ static void AnimateSelectedPartyIcon(u8 spriteId, u8 animNum)
 3979│ {
 3980│     gSprites[spriteId].data[0] = 0;
 3981│     if (animNum == 0)
 3982│     {
 3983│         if (gSprites[spriteId].x == 16)
 3984│         {
 3985│             gSprites[spriteId].x2 = 0;
 3986│             gSprites[spriteId].y2 = -4;
 3987│         }
 3988│         else
 3989│         {
 3990│             gSprites[spriteId].x2 = -4;
 3991│             gSprites[spriteId].y2 = 0;
 3992│         }
 3993│         gSprites[spriteId].callback = SpriteCB_UpdatePartyMonIcon;
 3994│     }
 3995│     else
 3996│     {
 3997│         gSprites[spriteId].x2 = 0;
 3998│         gSprites[spriteId].y2 = 0;
 3999│         gSprites[spriteId].callback = SpriteCB_BouncePartyMonIcon;
 4000│     }
 4001│ }
 4002│ 
├─ PORT src/engine/party-screen.ts:1392-1422 ────────────────────────────────────────
 1392│ /** 1:1 décomp `AnimateSelectedPartyIcon(u8 spriteId, u8 animNum)`
 1393│  *  (party_menu.c:3978) :
 1394│  *
 1395│  *      gSprites[spriteId].data[0] = 0;
 1396│  *      if (animNum == 0) {                         // non sélectionné
 1397│  *          if (gSprites[spriteId].x == 16) { x2 = 0;  y2 = -4; }  // slot 0 (box haute)
 1398│  *          else                            { x2 = -4; y2 = 0;  }  // slots 1-5 (colonne droite)
 1399│  *          callback = SpriteCB_UpdatePartyMonIcon; // frame only, garde le décalage
 1400│  *      } else {                                    // sélectionné
 1401│  *          x2 = 0; y2 = 0;
 1402│  *          callback = SpriteCB_BouncePartyMonIcon; // rebond y2
 1403│  *      }
 1404│  *
 1405│  *  C'ÉTAIT L'ANIM MANQUANTE (bug #1) : nos icônes restaient en permanence à
 1406│  *  la position SÉLECTIONNÉE (x2=0). Le décalage non-sélectionné (x2=-4 colonne
 1407│  *  droite / y2=-4 box gauche) n'était jamais appliqué → "décalé tout le temps"
 1408│  *  vs ROM où seul le slot sélectionné revient à la position de base + rebondit. */
 1409│ function _animateSelectedPartyIcon(slot: number, animNum: number): void {
 1410│   const rt = getRuntime(); if (!rt) return;
 1411│   const id = _iconOamBySlot[slot]; if (id < 0) return;
 1412│   const spr = rt.gSprites.get(id); if (!spr) return;
 1413│   if (spr.data) spr.data[0] = 0; // 1:1 gSprites[spriteId].data[0] = 0;
 1414│   if (animNum === 0) {
 1415│     if (spr.x === 16) { spr.x2 = 0;  spr.y2 = -4; } // slot 0 = grande box gauche
 1416│     else              { spr.x2 = -4; spr.y2 = 0;  } // slots 1-5 = colonne droite
 1417│     _iconMode[slot] = 0; // SpriteCB_UpdatePartyMonIcon
 1418│   } else {
 1419│     spr.x2 = 0; spr.y2 = 0;
 1420│     _iconMode[slot] = 1; // SpriteCB_BouncePartyMonIcon
 1421│   }
 1422│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SpriteCB_BouncePartyMonIcon  —  party_menu.c:4003-4015 (13 l)
▌ ‖ port: Task_PartyMenu_BounceIcon (src/engine/party-screen.ts:1424-1445)  ← cite "party_menu.c:4003" @src/engine/party-screen.ts:1427
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4003-4015 ────────────────────────────────────────
 4003│ static void SpriteCB_BouncePartyMonIcon(struct Sprite *sprite)
 4004│ {
 4005│     u8 animCmd = UpdateMonIconFrame(sprite);
 4006│ 
 4007│     if (animCmd != 0)
 4008│     {
 4009│         if (animCmd & 1) // % 2 also matches
 4010│             sprite->y2 = -3;
 4011│         else
 4012│             sprite->y2 = 1;
 4013│     }
 4014│ }
 4015│ 
├─ PORT src/engine/party-screen.ts:1424-1445 ────────────────────────────────────────
 1424│ /** Driver per-frame des callbacks d'icônes party. 1:1 décomp : chaque icône a
 1425│  *  son `sprite->callback` (SpriteCB_BouncePartyMonIcon OU SpriteCB_UpdateParty
 1426│  *  MonIcon) exécuté chaque frame ; on dispatch via `_iconMode[slot]` (même
 1427│  *  effet : 1 tick/frame). SpriteCB_BouncePartyMonIcon (party_menu.c:4003) :
 1428│  *    animCmd = UpdateMonIconFrame(sprite);
 1429│  *    if (animCmd != 0) sprite->y2 = (animCmd & 1) ? -3 : 1;
 1430│  *  SpriteCB_UpdatePartyMonIcon (:4016) : UpdateMonIconFrame(sprite) seul
 1431│  *  (le décalage x2/y2 posé par AnimateSelectedPartyIcon est conservé). */
 1432│ function Task_PartyMenu_BounceIcon(_task: DecompTask): void {
 1433│   if (!_isOpen) return;
 1434│   if (_phase !== 'open' && _phase !== 'action_menu') return;
 1435│   const rt = getRuntime();
 1436│   if (!rt) return;
 1437│   for (let i = 0; i < 6; i++) {
 1438│     if (_iconOamBySlot[i] < 0) continue;
 1439│     const animCmd = _updateMonIconFrame(i);
 1440│     if (_iconMode[i] === 1 && animCmd !== 0) {
 1441│       const spr = rt.gSprites.get(_iconOamBySlot[i]);
 1442│       if (spr) spr.y2 = (animCmd & 1) ? -3 : 1;
 1443│     }
 1444│   }
 1445│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CreatePartyMonHeldItemSprite  —  party_menu.c:4021-4029 (9 l)
▌ ‖ port: _spawnHeldItemOams (src/engine/party-screen.ts:1056-1077)  ← cite "party_menu.c:4021" @src/engine/party-screen.ts:1056
▌ ‖ port: CB2_InitPartyMenu (src/engine/party-screen.ts:1940-2038)  ← cite "party_menu.c:4021-4063" @src/engine/party-screen.ts:1999
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4021-4029 ────────────────────────────────────────
 4021│ static void CreatePartyMonHeldItemSprite(struct Pokemon *mon, struct PartyMenuBox *menuBox)
 4022│ {
 4023│     if (GetMonData(mon, MON_DATA_SPECIES) != SPECIES_NONE)
 4024│     {
 4025│         menuBox->itemSpriteId = CreateSprite(&sSpriteTemplate_HeldItem, menuBox->spriteCoords[2], menuBox->spriteCoords[3], 0);
 4026│         UpdatePartyMonHeldItemSprite(mon, menuBox);
 4027│     }
 4028│ }
 4029│ 
├─ PORT src/engine/party-screen.ts:1056-1077 ────────────────────────────────────────
 1056│ /** 1:1 décomp `CreatePartyMonHeldItemSprite` (party_menu.c:4021) :
 1057│  *  `CreateSprite(&sSpriteTemplate_HeldItem, spriteCoords[2], spriteCoords[3],
 1058│  *  0)` (8×8, sOamData_HeldItem priority=1). Créés invisibles. */
 1059│ function _spawnHeldItemOams(): void {
 1060│   const rt = getRuntime();
 1061│   if (!rt) return;
 1062│   _itemOamBySlot = [-1, -1, -1, -1, -1, -1];
 1063│   const party = gameState.party as PokemonInstance[];
 1064│   for (let i = 0; i < 6; i++) {
 1065│     if (!party[i]) continue;
 1066│     const [x, y] = ITEM_COORDS[i];
 1067│     const spr = rt.CreateSpriteAtOam({
 1068│       x, y,
 1069│       shape: 0, size: 0,                       // sOamData_HeldItem 8×8
 1070│       tileId: PARTY_HELDITEM_TILE_BASE,
 1071│       paletteBank: PARTY_HELDITEM_PAL_BANK,
 1072│       priority: 1, subpriority: 0,
 1073│     });
 1074│     _itemOamBySlot[i] = spr.spriteId;
 1075│     rt.setSpriteInvisible(spr.spriteId, true);
 1076│   }
 1077│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ UpdatePartyMonHeldItemSprite  —  party_menu.c:4040-4044 (5 l)
▌ ‖ port: _updatePartyMonHeldItem (src/engine/party-screen.ts:1079-1098)  ← cite "party_menu.c:4040-4059" @src/engine/party-screen.ts:1080
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4040-4044 ────────────────────────────────────────
 4040│ static void UpdatePartyMonHeldItemSprite(struct Pokemon *mon, struct PartyMenuBox *menuBox)
 4041│ {
 4042│     ShowOrHideHeldItemSprite(GetMonData(mon, MON_DATA_HELD_ITEM), menuBox);
 4043│ }
 4044│ 
├─ PORT src/engine/party-screen.ts:1079-1098 ────────────────────────────────────────
 1079│ /** 1:1 décomp `UpdatePartyMonHeldItemSprite`→`ShowOrHideHeldItemSprite`
 1080│  *  (party_menu.c:4040-4059) : ITEM_NONE → invisible ; sinon ItemIsMail →
 1081│  *  StartSpriteAnim(1) (tile+1), sinon StartSpriteAnim(0) (tile+0) + visible.
 1082│  *  (Mail non modélisé chez nous → toujours frame0 item, honnête 1:1.) */
 1083│ function _updatePartyMonHeldItem(slot: number): void {
 1084│   const rt = getRuntime();
 1085│   const id = _itemOamBySlot[slot];
 1086│   if (!rt || id === undefined || id < 0) return;
 1087│   const spr = rt.gSprites.get(id);
 1088│   if (!spr) return;
 1089│   const mon = (gameState.party as PokemonInstance[])[slot];
 1090│   const item = mon?.heldItem;
 1091│   if (!item) {                                   // ITEM_NONE → invisible
 1092│     rt.setSpriteInvisible(id, true);
 1093│     return;
 1094│   }
 1095│   const oam = rt.gba.oam[spr.oamIndex];
 1096│   if (oam) oam.tileId = PARTY_HELDITEM_TILE_BASE; // frame0 = item (mail n/a → 0)
 1097│   rt.setSpriteInvisible(id, false);
 1098│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ LoadHeldItemIcons  —  party_menu.c:4061-4066 (6 l)
▌ ‖ port: _loadHeldItemGfx (src/engine/party-screen.ts:1045-1054)  ← cite "party_menu.c:4061" @src/engine/party-screen.ts:1045
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4061-4066 ────────────────────────────────────────
 4061│ void LoadHeldItemIcons(void)
 4062│ {
 4063│     LoadSpriteSheet(&sSpriteSheet_HeldItem);
 4064│     LoadSpritePalette(&sSpritePalette_HeldItem);
 4065│ }
 4066│ 
├─ PORT src/engine/party-screen.ts:1045-1054 ────────────────────────────────────────
 1045│ /** 1:1 décomp `LoadHeldItemIcons` (party_menu.c:4061) : hold_icons.png
 1046│  *  (2 tiles 8×8 : frame0=item, frame1=mail). */
 1047│ async function _loadHeldItemGfx(): Promise<void> {
 1048│   const rt = getRuntime();
 1049│   if (!rt) return;
 1050│   const tiles = await loadTileBin('/decomp/em/party_menu/hold_icons.png', 4);
 1051│   const pal = await loadGbaPal('/decomp/em/party_menu/hold_icons.gbapal');
 1052│   rt.gba.objVram.set(tiles.slice(0, 2 * 32), PARTY_HELDITEM_TILE_BASE * 32);
 1053│   rt.LoadPaletteObj(pal, OBJ_PLTT_ID(PARTY_HELDITEM_PAL_BANK));
 1054│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CreatePartyMonPokeballSprite  —  party_menu.c:4122-4127 (6 l)
▌ ‖ port: _spawnSlotPokeballOams (src/engine/party-screen.ts:931-960)  ← cite "party_menu.c:4122" @src/engine/party-screen.ts:931
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4122-4127 ────────────────────────────────────────
 4122│ static void CreatePartyMonPokeballSprite(struct Pokemon *mon, struct PartyMenuBox *menuBox)
 4123│ {
 4124│     if (GetMonData(mon, MON_DATA_SPECIES) != SPECIES_NONE)
 4125│         menuBox->pokeballSpriteId = CreateSprite(&sSpriteTemplate_MenuPokeball, menuBox->spriteCoords[6], menuBox->spriteCoords[7], 8);
 4126│ }
 4127│ 
├─ PORT src/engine/party-screen.ts:931-960 ────────────────────────────────────────
  931│ /** 1:1 décomp `CreatePartyMonPokeballSprite` (party_menu.c:4122) :
  932│  *  Spawn une mini-pokeball OAM 32×32 à `menuBox->spriteCoords[6, 7]` pour
  933│  *  chaque slot occupé. Réutilise les tiles + palette du SORTIR pokeball
  934│  *  (= sSpriteTemplate_MenuPokeball, TAG_POKEBALL shared). */
  935│ function _spawnSlotPokeballOams(): void {
  936│   const rt = getRuntime();
  937│   if (!rt) return;
  938│   _pokeballOamBySlot = [-1, -1, -1, -1, -1, -1];
  939│   const party = gameState.party as PokemonInstance[];
  940│   const POKEBALL_TILE_BASE = 256;
  941│   const POKEBALL_PAL_BANK = 9;
  942│   for (let i = 0; i < 6; i++) {
  943│     const mon = party[i];
  944│     if (!mon) continue;
  945│     const [x, y] = POKEBALL_COORDS[i];
  946│     const spr = rt.CreateSpriteAtOam({
  947│       x, y,
  948│       shape: 0, size: 2,  // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32)
  949│       tileId: POKEBALL_TILE_BASE,  // frame 0 (Closed)
  950│       paletteBank: POKEBALL_PAL_BANK,
  951│       // 1:1 décomp CreatePartyMonPokeballSprite uses default OAM priority=1
  952│       // (= sSpriteTemplate_MenuPokeball template) + subpriority=8 from
  953│       // CreateSprite(..., x, y, 8) arg. Icon subpriority=1 → icon RENDU
  954│       // EN FRONT du pokeball (= ROM behavior, mini-pokeball partly behind icon).
  955│       priority: 1,
  956│       subpriority: 8,
  957│     });
  958│     _pokeballOamBySlot[i] = spr.spriteId;
  959│   }
  960│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CreatePokeballButtonSprite  —  party_menu.c:4138-4146 (9 l)
▌ ‖ port: _spawnCancelButtonOam (src/engine/party-screen.ts:1100-1123)  ← cite "party_menu.c:4138" @src/engine/party-screen.ts:1101
▌ ‖ port: _spawnCancelButtonOam (src/engine/party-screen.ts:1100-1123)  ← cite "party_menu.c:4142" @src/engine/party-screen.ts:1111
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4138-4146 ────────────────────────────────────────
 4138│ static u8 CreatePokeballButtonSprite(u8 x, u8 y)
 4139│ {
 4140│     u8 spriteId = CreateSprite(&sSpriteTemplate_MenuPokeball, x, y, 8);
 4141│ 
 4142│     gSprites[spriteId].oam.priority = 2;
 4143│     return spriteId;
 4144│ }
 4145│ 
 4146│ // For Confirm and Cancel when both are present
├─ PORT src/engine/party-screen.ts:1100-1123 ────────────────────────────────────────
 1100│ /** Spawn the "SORTIR" cancel button OAM (= big pokeball with text gravé)
 1101│  *  1:1 décomp `CreatePokeballButtonSprite(198, 148)` (party_menu.c:4138)
 1102│  *  → sprite 32×32 sSpriteTemplate_MenuPokeball, priority=2. */
 1103│ async function _spawnCancelButtonOam(): Promise<void> {
 1104│   const rt = getRuntime();
 1105│   if (!rt) return;
 1106│   try {
 1107│     await _loadPokeballGfx();
 1108│     const POKEBALL_TILE_BASE = 256;
 1109│     const POKEBALL_PAL_BANK = 9;
 1110│     // 1:1 décomp `CreateSprite(template, 198, 148, 8)` puis
 1111│     // `gSprites[spriteId].oam.priority = 2` (party_menu.c:4142).
 1112│     const spr = rt.CreateSpriteAtOam({
 1113│       x: 198, y: 148,
 1114│       shape: 0, size: 2,  // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32)
 1115│       tileId: POKEBALL_TILE_BASE,
 1116│       paletteBank: POKEBALL_PAL_BANK,
 1117│       priority: 2,
 1118│     });
 1119│     _cancelButtonOamId = spr.spriteId;
 1120│   } catch (e) {
 1121│     console.warn('[party-screen] cancel button load failed:', e);
 1122│   }
 1123│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CreatePartyMonStatusSprite  —  party_menu.c:4184-4192 (9 l)
▌ ‖ port: _spawnStatusOams (src/engine/party-screen.ts:984-1006)  ← cite "party_menu.c:4188" @src/engine/party-screen.ts:985
▌ ‖ port: CB2_InitPartyMenu (src/engine/party-screen.ts:1940-2038)  ← cite "party_menu.c:4188-4205" @src/engine/party-screen.ts:1993
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4184-4192 ────────────────────────────────────────
 4184│ static void CreatePartyMonStatusSprite(struct Pokemon *mon, struct PartyMenuBox *menuBox)
 4185│ {
 4186│     if (GetMonData(mon, MON_DATA_SPECIES) != SPECIES_NONE)
 4187│     {
 4188│         menuBox->statusSpriteId = CreateSprite(&sSpriteTemplate_StatusIcons, menuBox->spriteCoords[4], menuBox->spriteCoords[5], 0);
 4189│         SetPartyMonAilmentGfx(mon, menuBox);
 4190│     }
 4191│ }
 4192│ 
├─ PORT src/engine/party-screen.ts:984-1006 ────────────────────────────────────────
  984│ /** 1:1 décomp : `menuBox->statusSpriteId = CreateSprite(&sSpriteTemplate_
  985│  *  StatusIcons, spriteCoords[4], spriteCoords[5], 0)` (party_menu.c:4188).
  986│  *  sOamData_StatusCondition = 32×8 (shape1 size1). Créés invisibles ;
  987│  *  `_updatePartyMonAilmentGfx` les rend visibles selon l'ailment. */
  988│ function _spawnStatusOams(): void {
  989│   const rt = getRuntime();
  990│   if (!rt) return;
  991│   _statusOamBySlot = [-1, -1, -1, -1, -1, -1];
  992│   const party = gameState.party as PokemonInstance[];
  993│   for (let i = 0; i < 6; i++) {
  994│     if (!party[i]) continue;
  995│     const [x, y] = STATUS_COORDS[i];
  996│     const spr = rt.CreateSpriteAtOam({
  997│       x, y,
  998│       shape: 1, size: 1,                       // sOamData_StatusCondition 32×8
  999│       tileId: PARTY_STATUS_TILE_BASE,
 1000│       paletteBank: PARTY_STATUS_PAL_BANK,
 1001│       priority: 1, subpriority: 0,
 1002│     });
 1003│     _statusOamBySlot[i] = spr.spriteId;
 1004│     rt.setSpriteInvisible(spr.spriteId, true); // 1:1 défaut : caché tant que pas d'ailment
 1005│   }
 1006│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SetPartyMonAilmentGfx  —  party_menu.c:4203-4207 (5 l)
▌ ‖ port: _updatePartyMonAilmentGfx (src/engine/party-screen.ts:1022-1043)  ← cite "party_menu.c:4203-4221" @src/engine/party-screen.ts:1023
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4203-4207 ────────────────────────────────────────
 4203│ static void SetPartyMonAilmentGfx(struct Pokemon *mon, struct PartyMenuBox *menuBox)
 4204│ {
 4205│     UpdatePartyMonAilmentGfx(GetMonAilment(mon), menuBox);
 4206│ }
 4207│ 
├─ PORT src/engine/party-screen.ts:1022-1043 ────────────────────────────────────────
 1022│ /** 1:1 décomp `SetPartyMonAilmentGfx`→`UpdatePartyMonAilmentGfx`
 1023│  *  (party_menu.c:4203-4221) : AILMENT_NONE/PKRS → sprite invisible ;
 1024│  *  sinon `StartSpriteAnim(sprite, ailment-1)` (frame (ailment-1)*4) +
 1025│  *  visible. Statut slot-pinned (dérivé de gameState.party[slot].status). */
 1026│ function _updatePartyMonAilmentGfx(slot: number): void {
 1027│   const rt = getRuntime();
 1028│   const id = _statusOamBySlot[slot];
 1029│   if (!rt || id === undefined || id < 0) return;
 1030│   const spr = rt.gSprites.get(id);
 1031│   if (!spr) return;
 1032│   const mon = (gameState.party as PokemonInstance[])[slot];
 1033│   const ailment = _ailmentFromStatus(mon);
 1034│   if (ailment === 0 || ailment === 6) {         // 1:1 :4212-4213 AILMENT_NONE/PKRS → invisible
 1035│     rt.setSpriteInvisible(id, true);
 1036│     return;
 1037│   }
 1038│   // 1:1 :4217 StartSpriteAnim(sprite, ailment-1) → frame (ailment-1)*4
 1039│   // (PSN0/PAR4/SLP8/FRZ12/BRN16/FNT24 ; ailment FNT=7 → (7-1)*4=24).
 1040│   const oam = rt.gba.oam[spr.oamIndex];
 1041│   if (oam) oam.tileId = PARTY_STATUS_TILE_BASE + (ailment - 1) * 4;
 1042│   rt.setSpriteInvisible(id, false);
 1043│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ LoadPartyMenuAilmentGfx  —  party_menu.c:4223-4228 (6 l)
▌ ‖ port: _loadStatusIconsGfx (src/engine/party-screen.ts:974-982)  ← cite "party_menu.c:4223" @src/engine/party-screen.ts:974
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP party_menu.c:4223-4228 ────────────────────────────────────────
 4223│ static void LoadPartyMenuAilmentGfx(void)
 4224│ {
 4225│     LoadCompressedSpriteSheet(&sSpriteSheet_StatusIcons);
 4226│     LoadCompressedSpritePalette(&sSpritePalette_StatusIcons);
 4227│ }
 4228│ 
├─ PORT src/engine/party-screen.ts:974-982 ────────────────────────────────────────
  974│ /** 1:1 décomp `LoadPartyMenuAilmentGfx` (party_menu.c:4223) : charge
  975│  *  `gStatusGfx_Icons`/`gStatusPal_Icons` (= status_icons.png, 32 tiles).
  976│  *  Même asset que l'écran résumé (`_createSetStatusSprite`). */
  977│ async function _loadStatusIconsGfx(): Promise<void> {
  978│   const rt = getRuntime();
  979│   if (!rt) return;
  980│   const st = await rt.LoadCompressedSpriteSheet('/decomp/em/ui/interface/status_icons.png', PARTY_STATUS_TILE_BASE * 32);
  981│   rt.LoadPaletteObj(st.palette, OBJ_PLTT_ID(PARTY_STATUS_PAL_BANK));
  982│ }
└────────────────────────────────────────────────────────────

```
