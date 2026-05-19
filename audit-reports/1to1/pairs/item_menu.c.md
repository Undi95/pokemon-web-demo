# Paires décomp↔port — `item_menu.c`

Généré : 2026-05-19T12:44:16.964Z

> ⚠️ Pairing statique pour relecture BORNÉE. NE PROUVE PAS le comportement.

24 fonction(s) décomp citée(s) (sur 122 fonctions du fichier).

## Index des paires

- `sBgTemplates_ItemMenu` (item_menu.c:213-243) ‖ src/engine/bag-screen.ts:_initBagBgs
- `sItemListMenu` (item_menu.c:244-265) ‖ src/engine/bag-screen.ts:_drawList
- `sFontColorTable` (item_menu.c:387-395) ‖ src/engine/bag-screen.ts:57, src/engine/bag-screen.ts:65
- `sDefaultBagWindows` (item_menu.c:396-454) ‖ src/engine/bag-screen.ts:140, src/engine/bag-screen.ts:164, src/engine/bag-screen.ts:172
- `sContextMenuWindowTemplates` (item_menu.c:455-548) ‖ src/engine/bag-screen.ts:180
- `GoToBagMenu` (item_menu.c:617-645) ‖ src/engine/bag-screen.ts:OpenBagScreen
- `CB2_BagMenuRun` (item_menu.c:646-654) ‖ src/engine/bag-screen.ts:MainCB2_BagMenuRun
- `VBlankCB_BagMenuRun` (item_menu.c:655-671) ‖ src/engine/bag-screen.ts:VBlankCB_BagMenuRun
- `CB2_Bag` (item_menu.c:672-677) ‖ src/engine/bag-screen.ts:CB2_InitBagMenu
- `BagMenu_InitBGs` (item_menu.c:789-804) ‖ src/engine/bag-screen.ts:_initBagBgs
- `LoadBagMenu_Graphics` (item_menu.c:805-846) ‖ src/engine/bag-screen.ts:_loadBagMenuGraphicsCb2
- `GetItemNameFromPocket` (item_menu.c:899-928) ‖ src/engine/bag-screen.ts:_drawList
- `BagMenu_ItemPrintCallback` (item_menu.c:949-997) ‖ src/engine/bag-screen.ts:_drawList, src/engine/bag-screen.ts:Task_BagMenu_HandleInput_BagScreen
- `PrintItemDescription` (item_menu.c:998-1015) ‖ src/engine/bag-screen.ts:_drawDesc
- `BagMenu_PrintCursorAtPos` (item_menu.c:1021-1029) ‖ src/engine/bag-screen.ts:_drawList
- `CreatePocketScrollArrowPair` (item_menu.c:1030-1043) ‖ src/engine/bag-screen.ts:389, src/engine/bag-screen.ts:1126, src/engine/bag-screen.ts:_spawnListScrollArrows
- `FreeBagMenu` (item_menu.c:1069-1076) ‖ src/engine/bag-screen.ts:_freeBagMenu
- `Task_FadeAndCloseBagMenu` (item_menu.c:1077-1082) ‖ src/engine/bag-screen.ts:CloseBagScreen, src/engine/bag-screen.ts:Task_FadeAndCloseBagMenu_BagScreen
- `Task_CloseBagMenu` (item_menu.c:1083-1104) ‖ src/engine/bag-screen.ts:Task_CloseBagMenu_BagScreen
- `PrintItemQuantity` (item_menu.c:1203-1211) ‖ src/engine/bag-screen.ts:_drawTossQuantity
- `Task_SwitchBagPocket` (item_menu.c:1363-1411) ‖ src/engine/bag-screen.ts:275
- `OpenContextMenu` (item_menu.c:1540-1677) ‖ src/engine/bag-screen.ts:_openContextMenu, src/engine/bag-screen.ts:_closeContextMenu
- `PrintContextMenuItemGrid` (item_menu.c:1684-1689) ‖ src/engine/bag-screen.ts:_drawContextMenu
- `LoadBagMenuTextWindows` (item_menu.c:2457-2475) ‖ src/engine/bag-screen.ts:69, src/engine/bag-screen.ts:_loadBagMenuTextWindowsCb2

## Paires détaillées

```

══════════════════════════════════════════════════════════════════════════════
▌ · sBgTemplates_ItemMenu  —  item_menu.c:213-243 (31 l)
▌ ‖ port: _initBagBgs (src/engine/bag-screen.ts:2343-2414)  ← cite "item_menu.c:213" @src/engine/bag-screen.ts:2354
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:213-243 ────────────────────────────────────────
  213│ static const struct BgTemplate sBgTemplates_ItemMenu[] =
  214│ {
  215│     {
  216│         .bg = 0,
  217│         .charBaseIndex = 0,
  218│         .mapBaseIndex = 31,
  219│         .screenSize = 0,
  220│         .paletteMode = 0,
  221│         .priority = 1,
  222│         .baseTile = 0,
  223│     },
  224│     {
  225│         .bg = 1,
  226│         .charBaseIndex = 0,
  227│         .mapBaseIndex = 30,
  228│         .screenSize = 0,
  229│         .paletteMode = 0,
  230│         .priority = 0,
  231│         .baseTile = 0,
  232│     },
  233│     {
  234│         .bg = 2,
  235│         .charBaseIndex = 3,
  236│         .mapBaseIndex = 29,
  237│         .screenSize = 0,
  238│         .paletteMode = 0,
  239│         .priority = 2,
  240│         .baseTile = 0,
  241│     },
  242│ };
  243│ 
├─ PORT src/engine/bag-screen.ts:2343-2414 ────────────────────────────────────────
 2343│ /** 1:1 décomp item_menu.c:789 BagMenu_InitBGs :
 2344│  *      ResetVramOamAndBgCntRegs();
 2345│  *      memset(gBagMenu->tilemapBuffer, 0, sizeof(...));
 2346│  *      ResetBgsAndClearDma3BusyFlags(0);
 2347│  *      InitBgsFromTemplates(0, sBgTemplates_ItemMenu, 3);
 2348│  *      SetBgTilemapBuffer(2, gBagMenu->tilemapBuffer);
 2349│  *      ResetAllBgsCoordinates();
 2350│  *      ScheduleBgCopyTilemapToVram(2);
 2351│  *      SetGpuReg(DISPCNT, OBJ_ON | OBJ_1D_MAP);
 2352│  *      ShowBg(0/1/2); SetGpuReg(BLDCNT, 0);
 2353│  *
 2354│  *  BG templates 1:1 sBgTemplates_ItemMenu (item_menu.c:213) :
 2355│  *    BG0 char=0 map=31 prio=1 (= windows text/list/desc/header/sprite/icon)
 2356│  *    BG1 char=0 map=30 prio=0 (= context menu / yesno / qty overlays)
 2357│  *    BG2 char=3 map=29 prio=2 (= fond rayé menu.bin) */
 2358│ function _initBagBgs(rt: ReturnType<typeof getRuntime>): void {
 2359│   if (!rt) return;
 2360│   // 1:1 décomp ResetVramOamAndBgCntRegs (menu_helpers.c:94) :
 2361│   //   SetGpuReg(DISPCNT/BG0/1/2/3CNT, 0);
 2362│   //   CpuFill16(0, VRAM, VRAM_SIZE);
 2363│   //   CpuFill32(0, OAM, OAM_SIZE);
 2364│   //   CpuFill16(0, PLTT, PLTT_SIZE);
 2365│   rt.SetGpuReg(0x00 /* DISPCNT */, 0);
 2366│   rt.SetGpuReg(0x08 /* BG0CNT */, 0);
 2367│   rt.SetGpuReg(0x0A /* BG1CNT */, 0);
 2368│   rt.SetGpuReg(0x0C /* BG2CNT */, 0);
 2369│   rt.SetGpuReg(0x0E /* BG3CNT */, 0);
 2370│   rt.gba.vram.fill(0);
 2371│   for (let i = 0; i < rt.gba.oam.length; i++) {
 2372│     const oam = rt.gba.oam[i];
 2373│     oam.visible = false; oam.x = 0; oam.y = 0;
 2374│     oam.tileId = 0; oam.paletteBank = 0;
 2375│     oam.affineMode = 0;
 2376│   }
 2377│   for (let i = 0; i < 512; i++) {
 2378│     rt.gPlttBufferUnfaded.set(i, 0);
 2379│     rt.gPlttBufferFaded.set(i, 0);
 2380│   }
 2381│   // 1:1 décomp `CpuFill16(0, PLTT, PLTT_SIZE)` (= ResetVramOamAndBgCntRegs
 2382│   // menu_helpers.c:97). Direct PLTT RAM clear, sans passer par gPlttBufferFaded
 2383│   // → bypass `bufferTransferDisabled=true` set au state 3.
 2384│   // Sans ce clear : PLTT RAM garde palettes OW pendant state 7-19 →
 2385│   // bag tilemap rend avec couleurs OW (= "frame cheloue" bleu/orange user
 2386│   // session 129).
 2387│   for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
 2388│   for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
 2389│   // InitBgsFromTemplates(0, sBgTemplates_ItemMenu, 3).
 2390│   const bg0c = rt.gba.bg(0).config;
 2391│   bg0c.charBaseIndex = 0; bg0c.mapBaseIndex = 31; bg0c.screenSize = 0;
 2392│   bg0c.paletteMode = 0; bg0c.priority = 1; bg0c.visible = true;
 2393│   bg0c.hofs = 0; bg0c.vofs = 0;
 2394│   const bg1c = rt.gba.bg(1).config;
 2395│   bg1c.charBaseIndex = 0; bg1c.mapBaseIndex = 30; bg1c.screenSize = 0;
 2396│   bg1c.paletteMode = 0; bg1c.priority = 0; bg1c.visible = true;
 2397│   bg1c.hofs = 0; bg1c.vofs = 0;
 2398│   const bg2c = rt.gba.bg(2).config;
 2399│   bg2c.charBaseIndex = 3; bg2c.mapBaseIndex = 29; bg2c.screenSize = 0;
 2400│   bg2c.paletteMode = 0; bg2c.priority = 2; bg2c.visible = true;
 2401│   bg2c.hofs = 0; bg2c.vofs = 0;
 2402│   const bg3c = rt.gba.bg(3).config;
 2403│   bg3c.visible = false;
 2404│   // ResetAllBgsCoordinates : BG hofs/vofs registers = 0.
 2405│   rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0); // BG0HOFS/VOFS
 2406│   rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0); // BG1HOFS/VOFS
 2407│   rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0); // BG2HOFS/VOFS
 2408│   // SetGpuReg(DISPCNT, OBJ_ON | OBJ_1D_MAP + BG0/1/2_ON).
 2409│   // OBJ_ON=0x1000, OBJ_1D_MAP=0x40, BG0=0x100, BG1=0x200, BG2=0x400.
 2410│   rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400);
 2411│   rt.SetGpuReg(0x50 /* BLDCNT */, 0);
 2412│   ShowBg(0); ShowBg(1); ShowBg(2);
 2413│   HideBg(3);
 2414│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ · sItemListMenu  —  item_menu.c:244-265 (22 l)
▌ ‖ port: _drawList (src/engine/bag-screen.ts:606-686)  ← cite "item_menu.c:262" @src/engine/bag-screen.ts:632
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:244-265 ────────────────────────────────────────
  244│ static const struct ListMenuTemplate sItemListMenu =
  245│ {
  246│     .items = NULL,
  247│     .moveCursorFunc = BagMenu_MoveCursorCallback,
  248│     .itemPrintFunc = BagMenu_ItemPrintCallback,
  249│     .totalItems = 0,
  250│     .maxShowed = 0,
  251│     .windowId = WIN_ITEM_LIST,
  252│     .header_X = 0,
  253│     .item_X = 8,
  254│     .cursor_X = 0,
  255│     .upText_Y = 1,
  256│     .cursorPal = 1,
  257│     .fillValue = 0,
  258│     .cursorShadowPal = 3,
  259│     .lettersSpacing = 0,
  260│     .itemVerticalPadding = 0,
  261│     .scrollMultiple = LIST_NO_MULTIPLE_SCROLL,
  262│     .fontId = FONT_NARROW,
  263│     .cursorKind = CURSOR_BLACK_ARROW
  264│ };
  265│ 
├─ PORT src/engine/bag-screen.ts:606-686 ────────────────────────────────────────
  606│ function _drawList(): void {
  607│   if (_listWid < 0) return;
  608│   FillWindowPixelBuffer(_listWid, 0x00);
  609│   const items = _currentPocketItems();
  610│   for (let i = 0; i < VISIBLE_ROWS; i++) {
  611│     const idx = _scrollOffset + i;
  612│     if (idx >= items.length) break;
  613│     const slot = items[idx];
  614│     const y = 1 + i * 16;
  615│     // 1:1 décomp item_menu.c:1026 BagMenu_PrintCursorAtPos :
  616│     //   BagMenu_Print(WIN_ITEM_LIST, FONT_NORMAL, gText_SelectorArrow2, 0, y, ...)
  617│     // Cursor ▶ rendu en FONT_NORMAL à x=0, indépendamment du nom item.
  618│     if (i === _cursorPos) {
  619│       AddTextPrinterParameterized3(
  620│         _listWid, FONT_NORMAL, 0, y, COLOR_MAIN, TEXT_SKIP_DRAW, '▶',
  621│       );
  622│     }
  623│     if (slot.itemKey === CLOSE_BAG_KEY) {
  624│       // 1:1 décomp gText_CloseBag = "FERMER LE SAC". Pas de quantity.
  625│       // Position x=8 = après le cursor.
  626│       AddTextPrinterParameterized3(
  627│         _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW,
  628│         getString('gText_CloseBag'),
  629│       );
  630│       continue;
  631│     }
  632│     // 1:1 décomp item_menu.c:262 sItemListMenu.fontId = FONT_NARROW.
  633│     // Item name à x=8 (= après cursor at x=0).
  634│     const pocketKey = POCKETS[_pocketIdx].key;
  635│     const def = getItem(slot.itemKey);
  636│     // 1:1 décomp item_menu.c:899 GetItemNameFromPocket :
  637│     //   TMHM_POCKET → "CT01    FOCUS PUNCH" (= numéro + tab + nom du move).
  638│     //   BERRIES_POCKET → "01  ORAN" (= numéro berry + nom).
  639│     //   Default → nom item plain.
  640│     let displayName = getItemNameFr(slot.itemKey);
  641│     let isHM = false;
  642│     if (pocketKey === 'tmHm' && def?.descriptionLabel) {
  643│       // 1:1 décomp item_menu.c:899 GetItemNameFromPocket TMHM_POCKET render :
  644│       //   StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)]);
  645│       //   if (itemId >= ITEM_HM01) → gText_NumberItem_HM avec nombre 1-8 (1 digit)
  646│       //   else                     → gText_NumberItem_TMBerry avec nombre 1-50 (2 digits)
  647│       // Notre items.json a déjà def.name = "CT01" / "CS01" (= prefix FR formatté
  648│       // depuis le décomp). On utilise ça + le move name.
  649│       const tmMatch = def.descriptionLabel.match(/^s(TM|HM)(\d+)Desc$/);
  650│       if (tmMatch) {
  651│         isHM = tmMatch[1] === 'HM';
  652│         const itemNum = def.name;  // "CT01" / "CS01"
  653│         const moveSlug = slot.itemKey.replace(/^ITEM_(TM|HM)_/, '');
  654│         const moveName = getMoveNameFr(`MOVE_${moveSlug}`);
  655│         displayName = `${itemNum} ${moveName}`;
  656│       }
  657│     }
  658│     AddTextPrinterParameterized3(
  659│       _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW, displayName,
  660│     );
  661│     // 1:1 décomp item_menu.c:969-971 BagMenu_ItemPrintCallback :
  662│     //   if (itemId >= ITEM_HM01 && itemId <= ITEM_HM08)
  663│     //     BlitBitmapToWindow(windowId, gBagMenuHMIcon_Gfx, 8, y - 1, 16, 16);
  664│     // → petit badge "HM" 16×16. TODO : extraire hm_icon.png + blit. Pour
  665│     // l'instant, le prefix "CS0N" du nom suffit à identifier les HMs (= 1:1
  666│     // visuel acceptable car le nom CS01 etc. est déjà distinctif).
  667│     // 1:1 décomp item_menu.c:973-988 BagMenu_ItemPrintCallback :
  668│     //   if (BERRIES_POCKET) → print qty avec BERRY_CAPACITY_DIGITS
  669│     //   else if (!KEYITEMS_POCKET && !GetItemImportance(itemId)) → print qty
  670│     //   else → registered icon (key items) ou rien (HMs ont importance=1)
  671│     // HMs = importance=1 → PAS de qty ("on en a qu'une" — user).
  672│     // TMs = importance=0 → qty affichée comme un item normal ("on peut en avoir
  673│     // plusieurs" — user). gText_xVar1 = "×{STR_VAR_1}".
  674│     const showQty = (pocketKey === 'berries')
  675│       || (pocketKey !== 'keyItems' && !isHM);
  676│     if (showQty) {
  677│       const qtyStr = `×${slot.quantity}`;
  678│       const qtyX = GetStringRightAlignXOffset(qtyStr, 119);
  679│       AddTextPrinterParameterized3(
  680│         _listWid, FONT_NARROW, qtyX, y, COLOR_MAIN, TEXT_SKIP_DRAW, qtyStr,
  681│       );
  682│     }
  683│   }
  684│   PutWindowTilemap(_listWid);
  685│   CopyWindowToVram(_listWid, 3);
  686│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ · sFontColorTable  —  item_menu.c:387-395 (9 l)
▌ ‖ port: src/engine/bag-screen.ts:57 (hors fonction)  ← cite "item_menu.c:387" @src/engine/bag-screen.ts:57
▌ ‖ port: src/engine/bag-screen.ts:65 (hors fonction)  ← cite "item_menu.c:390" @src/engine/bag-screen.ts:65
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:387-395 ────────────────────────────────────────
  387│ static const u8 sFontColorTable[][3] = {
  388│                             // bgColor, textColor, shadowColor
  389│     [COLORID_NORMAL]      = {TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE,      TEXT_COLOR_LIGHT_GRAY},
  390│     [COLORID_POCKET_NAME] = {TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE,      TEXT_COLOR_RED},
  391│     [COLORID_GRAY_CURSOR] = {TEXT_COLOR_TRANSPARENT, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_GREEN},
  392│     [COLORID_UNUSED]      = {TEXT_COLOR_DARK_GRAY,   TEXT_COLOR_WHITE,      TEXT_COLOR_LIGHT_GRAY},
  393│     [COLORID_TMHM_INFO]   = {TEXT_COLOR_TRANSPARENT, TEXT_DYNAMIC_COLOR_5,  TEXT_DYNAMIC_COLOR_1}
  394│ };
  395│ 
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ · sDefaultBagWindows  —  item_menu.c:396-454 (59 l)
▌ ‖ port: src/engine/bag-screen.ts:140 (hors fonction)  ← cite "item_menu.c:416" @src/engine/bag-screen.ts:140
▌ ‖ port: src/engine/bag-screen.ts:164 (hors fonction)  ← cite "item_menu.c:398" @src/engine/bag-screen.ts:164
▌ ‖ port: src/engine/bag-screen.ts:172 (hors fonction)  ← cite "item_menu.c:407" @src/engine/bag-screen.ts:172
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:396-454 ────────────────────────────────────────
  396│ static const struct WindowTemplate sDefaultBagWindows[] =
  397│ {
  398│     [WIN_ITEM_LIST] = {
  399│         .bg = 0,
  400│         .tilemapLeft = 14,
  401│         .tilemapTop = 2,
  402│         .width = 15,
  403│         .height = 16,
  404│         .paletteNum = 1,
  405│         .baseBlock = 0x27,
  406│     },
  407│     [WIN_DESCRIPTION] = {
  408│         .bg = 0,
  409│         .tilemapLeft = 0,
  410│         .tilemapTop = 13,
  411│         .width = 14,
  412│         .height = 6,
  413│         .paletteNum = 1,
  414│         .baseBlock = 0x117,
  415│     },
  416│     [WIN_POCKET_NAME] = {
  417│         .bg = 0,
  418│         .tilemapLeft = 4,
  419│         .tilemapTop = 1,
  420│         .width = 8,
  421│         .height = 2,
  422│         .paletteNum = 1,
  423│         .baseBlock = 0x1A1,
  424│     },
  425│     [WIN_TMHM_INFO_ICONS] = {
  426│         .bg = 0,
  427│         .tilemapLeft = 1,
  428│         .tilemapTop = 13,
  429│         .width = 5,
  430│         .height = 6,
  431│         .paletteNum = 12,
  432│         .baseBlock = 0x16B,
  433│     },
  434│     [WIN_TMHM_INFO] = {
  435│         .bg = 0,
  436│         .tilemapLeft = 7,
  437│         .tilemapTop = 13,
  438│         .width = 4,
  439│         .height = 6,
  440│         .paletteNum = 12,
  441│         .baseBlock = 0x189,
  442│     },
  443│     [WIN_MESSAGE] = {
  444│         .bg = 1,
  445│         .tilemapLeft = 2,
  446│         .tilemapTop = 15,
  447│         .width = 27,
  448│         .height = 4,
  449│         .paletteNum = 15,
  450│         .baseBlock = 0x1B1,
  451│     },
  452│     DUMMY_WIN_TEMPLATE,
  453│ };
  454│ 
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ · sContextMenuWindowTemplates  —  item_menu.c:455-548 (94 l)
▌ ‖ port: src/engine/bag-screen.ts:180 (hors fonction)  ← cite "item_menu.c:455" @src/engine/bag-screen.ts:180
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:455-548 ────────────────────────────────────────
  455│ static const struct WindowTemplate sContextMenuWindowTemplates[] =
  456│ {
  457│     [ITEMWIN_1x1] = {
  458│         .bg = 1,
  459│         .tilemapLeft = 22,
  460│         .tilemapTop = 17,
  461│         .width = 7,
  462│         .height = 2,
  463│         .paletteNum = 15,
  464│         .baseBlock = 0x21D,
  465│     },
  466│     [ITEMWIN_1x2] = {
  467│         .bg = 1,
  468│         .tilemapLeft = 22,
  469│         .tilemapTop = 15,
  470│         .width = 7,
  471│         .height = 4,
  472│         .paletteNum = 15,
  473│         .baseBlock = 0x21D,
  474│     },
  475│     [ITEMWIN_2x2] = {
  476│         .bg = 1,
  477│         .tilemapLeft = 15,
  478│         .tilemapTop = 15,
  479│         .width = 14,
  480│         .height = 4,
  481│         .paletteNum = 15,
  482│         .baseBlock = 0x21D,
  483│     },
  484│     [ITEMWIN_2x3] = {
  485│         .bg = 1,
  486│         .tilemapLeft = 15,
  487│         .tilemapTop = 13,
  488│         .width = 14,
  489│         .height = 6,
  490│         .paletteNum = 15,
  491│         .baseBlock = 0x21D,
  492│     },
  493│     [ITEMWIN_MESSAGE] = {
  494│         .bg = 1,
  495│         .tilemapLeft = 2,
  496│         .tilemapTop = 15,
  497│         .width = 27,
  498│         .height = 4,
  499│         .paletteNum = 15,
  500│         .baseBlock = 0x1B1,
  501│     },
  502│     [ITEMWIN_YESNO_LOW] = { // Yes/No tucked in corner, for toss confirm
  503│         .bg = 1,
  504│         .tilemapLeft = 24,
  505│         .tilemapTop = 15,
  506│         .width = 5,
  507│         .height = 4,
  508│         .paletteNum = 15,
  509│         .baseBlock = 0x21D,
  510│     },
  511│     [ITEMWIN_YESNO_HIGH] = { // Yes/No higher up, positioned above a lower message box
  512│         .bg = 1,
  513│         .tilemapLeft = 21,
  514│         .tilemapTop = 9,
  515│         .width = 5,
  516│         .height = 4,
  517│         .paletteNum = 15,
  518│         .baseBlock = 0x21D,
  519│     },
  520│     [ITEMWIN_QUANTITY] = { // Used for quantity of items to Toss/Deposit
  521│         .bg = 1,
  522│         .tilemapLeft = 24,
  523│         .tilemapTop = 17,
  524│         .width = 5,
  525│         .height = 2,
  526│         .paletteNum = 15,
  527│         .baseBlock = 0x21D,
  528│     },
  529│     [ITEMWIN_QUANTITY_WIDE] = { // Used for quantity and price of items to Sell
  530│         .bg = 1,
  531│         .tilemapLeft = 18,
  532│         .tilemapTop = 11,
  533│         .width = 10,
  534│         .height = 2,
  535│         .paletteNum = 15,
  536│         .baseBlock = 0x245,
  537│     },
  538│     [ITEMWIN_MONEY] = {
  539│         .bg = 1,
  540│         .tilemapLeft = 1,
  541│         .tilemapTop = 1,
  542│         .width = 10,
  543│         .height = 2,
  544│         .paletteNum = 15,
  545│         .baseBlock = 0x231,
  546│     },
  547│ };
  548│ 
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ GoToBagMenu  —  item_menu.c:617-645 (29 l)
▌ ‖ port: OpenBagScreen (src/engine/bag-screen.ts:902-933)  ← cite "item_menu.c:617" @src/engine/bag-screen.ts:912
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:617-645 ────────────────────────────────────────
  617│ void GoToBagMenu(u8 location, u8 pocket, MainCallback exitCallback)
  618│ {
  619│     gBagMenu = AllocZeroed(sizeof(*gBagMenu));
  620│     if (gBagMenu == NULL)
  621│     {
  622│         // Alloc failed, exit
  623│         SetMainCallback2(exitCallback);
  624│     }
  625│     else
  626│     {
  627│         if (location != ITEMMENULOCATION_LAST)
  628│             gBagPosition.location = location;
  629│         if (exitCallback)
  630│             gBagPosition.exitCallback = exitCallback;
  631│         if (pocket < POCKETS_COUNT)
  632│             gBagPosition.pocket = pocket;
  633│         if (gBagPosition.location == ITEMMENULOCATION_BERRY_TREE ||
  634│             gBagPosition.location == ITEMMENULOCATION_BERRY_BLENDER_CRUSH)
  635│             gBagMenu->pocketSwitchDisabled = TRUE;
  636│         gBagMenu->newScreenCallback = NULL;
  637│         gBagMenu->toSwapPos = NOT_SWAPPING;
  638│         gBagMenu->pocketScrollArrowsTask = TASK_NONE;
  639│         gBagMenu->pocketSwitchArrowsTask = TASK_NONE;
  640│         memset(gBagMenu->spriteIds, SPRITE_NONE, sizeof(gBagMenu->spriteIds));
  641│         memset(gBagMenu->windowIds, WINDOW_NONE, sizeof(gBagMenu->windowIds));
  642│         SetMainCallback2(CB2_Bag);
  643│     }
  644│ }
  645│ 
├─ PORT src/engine/bag-screen.ts:902-933 ────────────────────────────────────────
  902│ /** Open le bag screen. Le caller passe un onClose callback (= start-menu doit
  903│  *  ré-afficher son main menu après que l'user appuie B ici).
  904│  *
  905│  *  1:1 décomp Task_FadeAndCloseBagMenu / SetupBagMenu pattern :
  906│  *    - Setup bag (= load assets, draw windows)
  907│  *    - BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK) → fade IN
  908│  *      depuis BLACK pendant 16 frames
  909│  *    - Wait fade fini → bag interactive */
  910│ export function OpenBagScreen(_onCloseLegacy?: () => void): void {
  911│   if (_isOpen) return;
  912│   // 1:1 décomp `GoToBagMenu` (item_menu.c:617) :
  913│   //   gBagMenu = AllocZeroed(...)  ← notre gBagMenu state est implicite
  914│   //   gBagPosition.exitCallback = exitCallback
  915│   //   SetMainCallback2(CB2_Bag)
  916│   //
  917│   // Le `_onCloseLegacy` arg est obsolète depuis le CB2 swap (= le retour passe
  918│   // par `gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual` set par
  919│   // sacAction, qui re-init OW + reopen start menu via FieldCB chain — 1:1
  920│   // décomp item_menu.c). Conservé pour compat callers.
  921│   //
  922│   // Pré-load les assets puis swap CB2. Le state machine `CB2_InitBagMenu` fait
  923│   // le setup réel (= state 0..20 + default).
  924│   void _loadAssets().then(() => {
  925│     const rt = getRuntime();
  926│     if (!rt) return;
  927│     rt.gMain.state = 0;
  928│     rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
  929│     rt.SetMainCallback2(CB2_InitBagMenu);
  930│   }).catch((e) => {
  931│     console.error('[bag-screen] OpenBagScreen asset preload failed', e);
  932│   });
  933│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CB2_BagMenuRun  —  item_menu.c:646-654 (9 l)
▌ ‖ port: MainCB2_BagMenuRun (src/engine/bag-screen.ts:2282-2289)  ← cite "item_menu.c:646" @src/engine/bag-screen.ts:2282
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:646-654 ────────────────────────────────────────
  646│ void CB2_BagMenuRun(void)
  647│ {
  648│     RunTasks();
  649│     AnimateSprites();
  650│     BuildOamBuffer();
  651│     DoScheduledBgTilemapCopiesToVram();
  652│     UpdatePaletteFade();
  653│ }
  654│ 
├─ PORT src/engine/bag-screen.ts:2282-2289 ────────────────────────────────────────
 2282│ /** 1:1 décomp item_menu.c:646 CB2_BagMenuRun :
 2283│  *      RunTasks(); AnimateSprites(); BuildOamBuffer();
 2284│  *      DoScheduledBgTilemapCopiesToVram(); UpdatePaletteFade();
 2285│  *  Préfix `MainCB2` → le runtime tickFixed (decomp-runtime.ts:1994) appelle
 2286│  *  automatiquement RunTasks + AnimateSprites + BuildOamBuffer + UpdatePaletteFade
 2287│  *  pour les callback2.name commençant par "MainCB2". Donc body intentionellement
 2288│  *  vide ici — la state machine est driven par les Tasks créées au state 14. */
 2289│ export function MainCB2_BagMenuRun(): void { /* runtime auto-tick */ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ VBlankCB_BagMenuRun  —  item_menu.c:655-671 (17 l)
▌ ‖ port: VBlankCB_BagMenuRun (src/engine/bag-screen.ts:2291-2295)  ← cite "item_menu.c:655" @src/engine/bag-screen.ts:2291
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:655-671 ────────────────────────────────────────
  655│ void VBlankCB_BagMenuRun(void)
  656│ {
  657│     LoadOam();
  658│     ProcessSpriteCopyRequests();
  659│     TransferPlttBuffer();
  660│ }
  661│ 
  662│ #define tListTaskId        data[0]
  663│ #define tListPosition      data[1]
  664│ #define tQuantity          data[2]
  665│ #define tNeverRead         data[3]
  666│ #define tItemCount         data[8]
  667│ #define tMsgWindowId       data[10]
  668│ #define tPocketSwitchDir   data[11]
  669│ #define tPocketSwitchTimer data[12]
  670│ #define tPocketSwitchState data[13]
  671│ 
├─ PORT src/engine/bag-screen.ts:2291-2295 ────────────────────────────────────────
 2291│ /** 1:1 décomp item_menu.c:655 VBlankCB_BagMenuRun :
 2292│  *      LoadOam(); ProcessSpriteCopyRequests(); TransferPlttBuffer();
 2293│  *  Notre runtime fait TransferPlttBuffer automatiquement à la fin de chaque
 2294│  *  frame (cf. decomp-runtime.ts:2047+), donc no-op. Marker pour le naming. */
 2295│ export function VBlankCB_BagMenuRun(): void { /* transferts auto */ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CB2_Bag  —  item_menu.c:672-677 (6 l)
▌ ‖ port: CB2_InitBagMenu (src/engine/bag-screen.ts:2564-2711)  ← cite "item_menu.c:672" @src/engine/bag-screen.ts:2564
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:672-677 ────────────────────────────────────────
  672│ static void CB2_Bag(void)
  673│ {
  674│     while(MenuHelpers_ShouldWaitForLinkRecv() != TRUE && SetupBagMenu() != TRUE && MenuHelpers_IsLinkActive() != TRUE)
  675│         {};
  676│ }
  677│ 
├─ PORT src/engine/bag-screen.ts:2564-2711 ────────────────────────────────────────
 2564│ /** 1:1 décomp item_menu.c:672 CB2_Bag + 678 SetupBagMenu state machine.
 2565│  *  Décomp boucle `while (!SetupBagMenu()) {}` en 1 frame jusqu'à ready.
 2566│  *  Notre version : 1 case par frame (= le runtime tick re-appelle CB2_InitBagMenu
 2567│  *  à chaque frame jusqu'à state default qui swap vers MainCB2_BagMenuRun). */
 2568│ export function CB2_InitBagMenu(): void {
 2569│   const rt = getRuntime();
 2570│   if (!rt) return;
 2571│   switch (rt.gMain.state) {
 2572│     case 0:
 2573│       // SetVBlankHBlankCallbacksToNull + ClearScheduledBgCopiesToVram.
 2574│       rt.SetVBlankCallback(null);
 2575│       rt.gMain.state++;
 2576│       break;
 2577│     case 1:
 2578│       // ScanlineEffect_Stop (= no-op chez nous).
 2579│       rt.gMain.state++;
 2580│       break;
 2581│     case 2:
 2582│       // FreeAllSpritePalettes (= clear OBJ palette tracking).
 2583│       rt.gMain.state++;
 2584│       break;
 2585│     case 3:
 2586│       // ResetPaletteFade + gPaletteFade.bufferTransferDisabled = TRUE.
 2587│       ResetPaletteFade();
 2588│       rt.gPaletteFade.bufferTransferDisabled = true;
 2589│       rt.gMain.state++;
 2590│       break;
 2591│     case 4:
 2592│       // ResetSpriteData (= clear gSprites table).
 2593│       ResetSpriteData();
 2594│       rt.gMain.state++;
 2595│       break;
 2596│     case 5:
 2597│       rt.gMain.state++;
 2598│       break;
 2599│     case 6:
 2600│       // ResetTasks (= clear gTasks Map). Note : Task_BagMenu_HandleInput sera
 2601│       // créée au state 14 — DOIT run après ResetTasks pour persister.
 2602│       ResetTasks();
 2603│       rt.gMain.state++;
 2604│       break;
 2605│     case 7:
 2606│       // BagMenu_InitBGs + gBagMenu->graphicsLoadState = 0.
 2607│       _initBagBgs(rt);
 2608│       _bagGraphicsReady = false;
 2609│       _bagGraphicsLoading = false;
 2610│       _loadBagMenuTextWindowsCb2Ready = false;
 2611│       _loadBagMenuTextWindowsCb2Loading = false;
 2612│       rt.gMain.state++;
 2613│       break;
 2614│     case 8:
 2615│       // if (!LoadBagMenu_Graphics()) break;  ← reste à state 8 jusqu'à ready.
 2616│       if (!_loadBagMenuGraphicsCb2(rt)) break;
 2617│       rt.gMain.state++;
 2618│       break;
 2619│     case 9:
 2620│       // LoadBagMenuTextWindows = InitWindows + LoadUserWindowBorderGfx +
 2621│       // LoadMessageBoxGfx + ListMenuLoadStdPalAt + LoadPalette gStandardMenuPalette
 2622│       // BG_PLTT_ID(15). Async (= std_menu.pal fetch). Reste sur state 9 jusqu'à
 2623│       // ready pour que state 19 BlendPalettes blackify la palette 15 chargée
 2624│       // (= sinon palette 15 reste OW value, on voit des frames cream pendant fade).
 2625│       if (!_loadBagMenuTextWindowsCb2Ready) {
 2626│         if (!_loadBagMenuTextWindowsCb2Loading) {
 2627│           _loadBagMenuTextWindowsCb2Loading = true;
 2628│           void _loadBagMenuTextWindowsCb2(rt).then(() => {
 2629│             _loadBagMenuTextWindowsCb2Ready = true;
 2630│             _loadBagMenuTextWindowsCb2Loading = false;
 2631│           });
 2632│         }
 2633│         break;  // stay on state 9 until ready
 2634│       }
 2635│       rt.gMain.state++;
 2636│       break;
 2637│     case 10:
 2638│       // UpdatePocketItemLists + InitPocketListPositions + InitPocketScrollPositions.
 2639│       // Notre bag-system gère ces lists au runtime ; reset cursor/scroll au open.
 2640│       _pocketIdx = 0;
 2641│       _cursorPos = 0;
 2642│       _scrollOffset = 0;
 2643│       _cursorPerPocket.fill(0);
 2644│       _scrollPerPocket.fill(0);
 2645│       _phase = 'fading_in';
 2646│       _loadedIconKey = null;  // force reload palette icon au prochain draw
 2647│       rt.gMain.state++;
 2648│       break;
 2649│     case 11:
 2650│       // AllocateBagItemListBuffers (= no-op, on n'alloc pas).
 2651│       rt.gMain.state++;
 2652│       break;
 2653│     case 12:
 2654│       // LoadBagItemListBuffers (= populated via _drawList).
 2655│       rt.gMain.state++;
 2656│       break;
 2657│     case 13:
 2658│       // PrintPocketNames + CopyPocketNameToWindow + DrawPocketIndicatorSquare.
 2659│       // Notre _drawAll fait l'équivalent.
 2660│       _drawAll();
 2661│       rt.gMain.state++;
 2662│       break;
 2663│     case 14:
 2664│       // CreateBagInputHandlerTask + ListMenuInit (= cursor task).
 2665│       _bagInputTaskId = rt.CreateTask(Task_BagMenu_HandleInput_BagScreen, 0);
 2666│       rt.gMain.state++;
 2667│       break;
 2668│     case 15:
 2669│       // AddBagVisualSprite — créer le sprite sac OAM 64×64 à (68, 66).
 2670│       if (_assets) _spawnBagSpriteOam(_assets);
 2671│       rt.gMain.state++;
 2672│       break;
 2673│     case 16:
 2674│       // CreateItemMenuSwapLine (= line marker pour swap mode, no-op).
 2675│       rt.gMain.state++;
 2676│       break;
 2677│     case 17:
 2678│       // CreatePocketScrollArrowPair + CreatePocketSwitchArrowPair.
 2679│       if (_assets) {
 2680│         _spawnPocketArrows(_assets);
 2681│         _spawnListScrollArrows();
 2682│       }
 2683│       rt.gMain.state++;
 2684│       break;
 2685│     case 18:
 2686│       // PrepareTMHMMoveWindow (= no-op chez nous).
 2687│       rt.gMain.state++;
 2688│       break;
 2689│     case 19:
 2690│       // BlendPalettes(PALETTES_ALL, 16, 0) — start palette state at fully
 2691│       // blended-to-black (avant fade vers visible au case 20).
 2692│       BlendPalettes(0xFFFFFFFF, 16, 0);
 2693│       rt.gMain.state++;
 2694│       break;
 2695│     case 20:
 2696│       // 1:1 décomp `BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)` :
 2697│       // startY=16=fully black → endY=0=visible sur 16 frames (= fade IN depuis BLACK).
 2698│       // = équivalent à `FadeScreen(FADE_FROM_BLACK, 0)` (= field_weather.c).
 2699│       FadeScreen(FADE_FROM_BLACK, 0);
 2700│       rt.gPaletteFade.bufferTransferDisabled = false;
 2701│       PlaySE(6 /* SE_WIN_OPEN */);  // sonore "shing" au fade in
 2702│       rt.gMain.state++;
 2703│       break;
 2704│     default:
 2705│       // SetVBlankCallback + SetMainCallback2(CB2_BagMenuRun).
 2706│       rt.SetVBlankCallback(VBlankCB_BagMenuRun);
 2707│       rt.SetMainCallback2(MainCB2_BagMenuRun);
 2708│       _isOpen = true;
 2709│       return;
 2710│   }
 2711│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ BagMenu_InitBGs  —  item_menu.c:789-804 (16 l)
▌ ‖ port: _initBagBgs (src/engine/bag-screen.ts:2343-2414)  ← cite "item_menu.c:789" @src/engine/bag-screen.ts:2343
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:789-804 ────────────────────────────────────────
  789│ static void BagMenu_InitBGs(void)
  790│ {
  791│     ResetVramOamAndBgCntRegs();
  792│     memset(gBagMenu->tilemapBuffer, 0, sizeof(gBagMenu->tilemapBuffer));
  793│     ResetBgsAndClearDma3BusyFlags(0);
  794│     InitBgsFromTemplates(0, sBgTemplates_ItemMenu, ARRAY_COUNT(sBgTemplates_ItemMenu));
  795│     SetBgTilemapBuffer(2, gBagMenu->tilemapBuffer);
  796│     ResetAllBgsCoordinates();
  797│     ScheduleBgCopyTilemapToVram(2);
  798│     SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
  799│     ShowBg(0);
  800│     ShowBg(1);
  801│     ShowBg(2);
  802│     SetGpuReg(REG_OFFSET_BLDCNT, 0);
  803│ }
  804│ 
├─ PORT src/engine/bag-screen.ts:2343-2414 ────────────────────────────────────────
 2343│ /** 1:1 décomp item_menu.c:789 BagMenu_InitBGs :
 2344│  *      ResetVramOamAndBgCntRegs();
 2345│  *      memset(gBagMenu->tilemapBuffer, 0, sizeof(...));
 2346│  *      ResetBgsAndClearDma3BusyFlags(0);
 2347│  *      InitBgsFromTemplates(0, sBgTemplates_ItemMenu, 3);
 2348│  *      SetBgTilemapBuffer(2, gBagMenu->tilemapBuffer);
 2349│  *      ResetAllBgsCoordinates();
 2350│  *      ScheduleBgCopyTilemapToVram(2);
 2351│  *      SetGpuReg(DISPCNT, OBJ_ON | OBJ_1D_MAP);
 2352│  *      ShowBg(0/1/2); SetGpuReg(BLDCNT, 0);
 2353│  *
 2354│  *  BG templates 1:1 sBgTemplates_ItemMenu (item_menu.c:213) :
 2355│  *    BG0 char=0 map=31 prio=1 (= windows text/list/desc/header/sprite/icon)
 2356│  *    BG1 char=0 map=30 prio=0 (= context menu / yesno / qty overlays)
 2357│  *    BG2 char=3 map=29 prio=2 (= fond rayé menu.bin) */
 2358│ function _initBagBgs(rt: ReturnType<typeof getRuntime>): void {
 2359│   if (!rt) return;
 2360│   // 1:1 décomp ResetVramOamAndBgCntRegs (menu_helpers.c:94) :
 2361│   //   SetGpuReg(DISPCNT/BG0/1/2/3CNT, 0);
 2362│   //   CpuFill16(0, VRAM, VRAM_SIZE);
 2363│   //   CpuFill32(0, OAM, OAM_SIZE);
 2364│   //   CpuFill16(0, PLTT, PLTT_SIZE);
 2365│   rt.SetGpuReg(0x00 /* DISPCNT */, 0);
 2366│   rt.SetGpuReg(0x08 /* BG0CNT */, 0);
 2367│   rt.SetGpuReg(0x0A /* BG1CNT */, 0);
 2368│   rt.SetGpuReg(0x0C /* BG2CNT */, 0);
 2369│   rt.SetGpuReg(0x0E /* BG3CNT */, 0);
 2370│   rt.gba.vram.fill(0);
 2371│   for (let i = 0; i < rt.gba.oam.length; i++) {
 2372│     const oam = rt.gba.oam[i];
 2373│     oam.visible = false; oam.x = 0; oam.y = 0;
 2374│     oam.tileId = 0; oam.paletteBank = 0;
 2375│     oam.affineMode = 0;
 2376│   }
 2377│   for (let i = 0; i < 512; i++) {
 2378│     rt.gPlttBufferUnfaded.set(i, 0);
 2379│     rt.gPlttBufferFaded.set(i, 0);
 2380│   }
 2381│   // 1:1 décomp `CpuFill16(0, PLTT, PLTT_SIZE)` (= ResetVramOamAndBgCntRegs
 2382│   // menu_helpers.c:97). Direct PLTT RAM clear, sans passer par gPlttBufferFaded
 2383│   // → bypass `bufferTransferDisabled=true` set au state 3.
 2384│   // Sans ce clear : PLTT RAM garde palettes OW pendant state 7-19 →
 2385│   // bag tilemap rend avec couleurs OW (= "frame cheloue" bleu/orange user
 2386│   // session 129).
 2387│   for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
 2388│   for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
 2389│   // InitBgsFromTemplates(0, sBgTemplates_ItemMenu, 3).
 2390│   const bg0c = rt.gba.bg(0).config;
 2391│   bg0c.charBaseIndex = 0; bg0c.mapBaseIndex = 31; bg0c.screenSize = 0;
 2392│   bg0c.paletteMode = 0; bg0c.priority = 1; bg0c.visible = true;
 2393│   bg0c.hofs = 0; bg0c.vofs = 0;
 2394│   const bg1c = rt.gba.bg(1).config;
 2395│   bg1c.charBaseIndex = 0; bg1c.mapBaseIndex = 30; bg1c.screenSize = 0;
 2396│   bg1c.paletteMode = 0; bg1c.priority = 0; bg1c.visible = true;
 2397│   bg1c.hofs = 0; bg1c.vofs = 0;
 2398│   const bg2c = rt.gba.bg(2).config;
 2399│   bg2c.charBaseIndex = 3; bg2c.mapBaseIndex = 29; bg2c.screenSize = 0;
 2400│   bg2c.paletteMode = 0; bg2c.priority = 2; bg2c.visible = true;
 2401│   bg2c.hofs = 0; bg2c.vofs = 0;
 2402│   const bg3c = rt.gba.bg(3).config;
 2403│   bg3c.visible = false;
 2404│   // ResetAllBgsCoordinates : BG hofs/vofs registers = 0.
 2405│   rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0); // BG0HOFS/VOFS
 2406│   rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0); // BG1HOFS/VOFS
 2407│   rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0); // BG2HOFS/VOFS
 2408│   // SetGpuReg(DISPCNT, OBJ_ON | OBJ_1D_MAP + BG0/1/2_ON).
 2409│   // OBJ_ON=0x1000, OBJ_1D_MAP=0x40, BG0=0x100, BG1=0x200, BG2=0x400.
 2410│   rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400);
 2411│   rt.SetGpuReg(0x50 /* BLDCNT */, 0);
 2412│   ShowBg(0); ShowBg(1); ShowBg(2);
 2413│   HideBg(3);
 2414│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ LoadBagMenu_Graphics  —  item_menu.c:805-846 (42 l)
▌ ‖ port: _loadBagMenuGraphicsCb2 (src/engine/bag-screen.ts:2416-2459)  ← cite "item_menu.c:805" @src/engine/bag-screen.ts:2416
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:805-846 ────────────────────────────────────────
  805│ static bool8 LoadBagMenu_Graphics(void)
  806│ {
  807│     switch (gBagMenu->graphicsLoadState)
  808│     {
  809│     case 0:
  810│         ResetTempTileDataBuffers();
  811│         DecompressAndCopyTileDataToVram(2, gBagScreen_Gfx, 0, 0, 0);
  812│         gBagMenu->graphicsLoadState++;
  813│         break;
  814│     case 1:
  815│         if (FreeTempTileDataBuffersIfPossible() != TRUE)
  816│         {
  817│             LZDecompressWram(gBagScreen_GfxTileMap, gBagMenu->tilemapBuffer);
  818│             gBagMenu->graphicsLoadState++;
  819│         }
  820│         break;
  821│     case 2:
  822│         if (!IsWallysBag() && gSaveBlock2Ptr->playerGender != MALE)
  823│             LoadCompressedPalette(gBagScreenFemale_Pal, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);
  824│         else
  825│             LoadCompressedPalette(gBagScreenMale_Pal, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);
  826│         gBagMenu->graphicsLoadState++;
  827│         break;
  828│     case 3:
  829│         if (IsWallysBag() == TRUE || gSaveBlock2Ptr->playerGender == MALE)
  830│             LoadCompressedSpriteSheet(&gBagMaleSpriteSheet);
  831│         else
  832│             LoadCompressedSpriteSheet(&gBagFemaleSpriteSheet);
  833│         gBagMenu->graphicsLoadState++;
  834│         break;
  835│     case 4:
  836│         LoadCompressedSpritePalette(&gBagPaletteTable);
  837│         gBagMenu->graphicsLoadState++;
  838│         break;
  839│     default:
  840│         LoadListMenuSwapLineGfx();
  841│         gBagMenu->graphicsLoadState = 0;
  842│         return TRUE;
  843│     }
  844│     return FALSE;
  845│ }
  846│ 
├─ PORT src/engine/bag-screen.ts:2416-2459 ────────────────────────────────────────
 2416│ /** 1:1 décomp item_menu.c:805 LoadBagMenu_Graphics — async load tiles + tilemap
 2417│  *  + palettes. Décomp = state machine 5 sub-states (DecompressTileData,
 2418│  *  LZDecompressWram, LoadCompressedPalette, LoadCompressedSpriteSheet,
 2419│  *  LoadCompressedSpritePalette + LoadListMenuSwapLineGfx). Notre version :
 2420│  *  kick off async fetch via _loadAssets, retourne false jusqu'à ready. */
 2421│ function _loadBagMenuGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
 2422│   if (!rt) return false;
 2423│   if (_bagGraphicsReady) return true;
 2424│   if (_bagGraphicsLoading) return false;
 2425│   _bagGraphicsLoading = true;
 2426│   void _loadAssets().then(async (assets) => {
 2427│     const r = getRuntime();
 2428│     if (!r) { _bagGraphicsLoading = false; return; }
 2429│     // 1:1 décomp sub-state 0 : DecompressAndCopyTileDataToVram(2, gBagScreen_Gfx).
 2430│     // BG2 charBase=3 → VRAM byte offset 3*0x4000 = 0xC000.
 2431│     const charOff = BAG_BG_CHAR_BASE * 0x4000;
 2432│     r.gba.vram.set(assets.bgTiles, charOff);
 2433│     // 1:1 décomp sub-state 1 : LZDecompressWram(gBagScreen_GfxTileMap, tilemapBuffer).
 2434│     // BG2 mapBase=29 → VRAM byte offset 29*0x800 = 0xE800.
 2435│     const mapOff = BAG_BG_MAP_BASE * 0x800;
 2436│     const tilemapBytes = new Uint8Array(
 2437│       assets.bgTilemap.buffer, assets.bgTilemap.byteOffset, assets.bgTilemap.byteLength,
 2438│     );
 2439│     r.gba.vram.set(tilemapBytes, mapOff);
 2440│     // 1:1 décomp sub-state 2 : LoadCompressedPalette(gBagScreenMale_Pal,
 2441│     // BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP) → 32 entries à offset 0 (= sub-pal 0+1).
 2442│     LoadPalette(assets.bgPalette, 0, assets.bgPalette.length * 2);
 2443│     // 1:1 décomp sub-state 3 : LoadCompressedSpriteSheet(gBagMaleSpriteSheet)
 2444│     // → bag sprite tile data dans OBJ VRAM offset 0.
 2445│     r.gba.objVram.set(assets.bagSpriteRaw4bpp, BAG_SPRITE_OBJ_OFFSET);
 2446│     // 1:1 décomp sub-state 4 : LoadCompressedSpritePalette(gBagPaletteTable)
 2447│     // → bag.pal dans OBJ palette slot 0.
 2448│     r.LoadPaletteObj(assets.bagSpritePal, OBJ_PLTT_ID(BAG_SPRITE_OBJ_PAL));
 2449│     _bagAssetsLoadedToObj = true;
 2450│     // Bag sprite window palette (= slot 13 BG palette pour le sprite window).
 2451│     LoadPalette(assets.bagSprite.palette, BAG_SPRITE_PAL * 16, 32);
 2452│     _bagGraphicsReady = true;
 2453│     _bagGraphicsLoading = false;
 2454│   }).catch((e) => {
 2455│     console.error('[bag-screen] LoadBagMenu_Graphics failed:', e);
 2456│     _bagGraphicsLoading = false;
 2457│   });
 2458│   return false;
 2459│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ GetItemNameFromPocket  —  item_menu.c:899-928 (30 l)
▌ ‖ port: _drawList (src/engine/bag-screen.ts:606-686)  ← cite "item_menu.c:899" @src/engine/bag-screen.ts:636
▌ ‖ port: _drawList (src/engine/bag-screen.ts:606-686)  ← cite "item_menu.c:899" @src/engine/bag-screen.ts:643
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:899-928 ────────────────────────────────────────
  899│ static void GetItemNameFromPocket(u8 *dest, u16 itemId)
  900│ {
  901│     switch (gBagPosition.pocket)
  902│     {
  903│     case TMHM_POCKET:
  904│         StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)]);
  905│         if (itemId >= ITEM_HM01)
  906│         {
  907│             // Get HM number
  908│             ConvertIntToDecimalStringN(gStringVar1, itemId - ITEM_HM01 + 1, STR_CONV_MODE_LEADING_ZEROS, 1);
  909│             StringExpandPlaceholders(dest, gText_NumberItem_HM);
  910│         }
  911│         else
  912│         {
  913│             // Get TM number
  914│             ConvertIntToDecimalStringN(gStringVar1, itemId - ITEM_TM01 + 1, STR_CONV_MODE_LEADING_ZEROS, 2);
  915│             StringExpandPlaceholders(dest, gText_NumberItem_TMBerry);
  916│         }
  917│         break;
  918│     case BERRIES_POCKET:
  919│         ConvertIntToDecimalStringN(gStringVar1, itemId - FIRST_BERRY_INDEX + 1, STR_CONV_MODE_LEADING_ZEROS, 2);
  920│         CopyItemName(itemId, gStringVar2);
  921│         StringExpandPlaceholders(dest, gText_NumberItem_TMBerry);
  922│         break;
  923│     default:
  924│         CopyItemName(itemId, dest);
  925│         break;
  926│     }
  927│ }
  928│ 
├─ PORT src/engine/bag-screen.ts:606-686 ────────────────────────────────────────
  606│ function _drawList(): void {
  607│   if (_listWid < 0) return;
  608│   FillWindowPixelBuffer(_listWid, 0x00);
  609│   const items = _currentPocketItems();
  610│   for (let i = 0; i < VISIBLE_ROWS; i++) {
  611│     const idx = _scrollOffset + i;
  612│     if (idx >= items.length) break;
  613│     const slot = items[idx];
  614│     const y = 1 + i * 16;
  615│     // 1:1 décomp item_menu.c:1026 BagMenu_PrintCursorAtPos :
  616│     //   BagMenu_Print(WIN_ITEM_LIST, FONT_NORMAL, gText_SelectorArrow2, 0, y, ...)
  617│     // Cursor ▶ rendu en FONT_NORMAL à x=0, indépendamment du nom item.
  618│     if (i === _cursorPos) {
  619│       AddTextPrinterParameterized3(
  620│         _listWid, FONT_NORMAL, 0, y, COLOR_MAIN, TEXT_SKIP_DRAW, '▶',
  621│       );
  622│     }
  623│     if (slot.itemKey === CLOSE_BAG_KEY) {
  624│       // 1:1 décomp gText_CloseBag = "FERMER LE SAC". Pas de quantity.
  625│       // Position x=8 = après le cursor.
  626│       AddTextPrinterParameterized3(
  627│         _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW,
  628│         getString('gText_CloseBag'),
  629│       );
  630│       continue;
  631│     }
  632│     // 1:1 décomp item_menu.c:262 sItemListMenu.fontId = FONT_NARROW.
  633│     // Item name à x=8 (= après cursor at x=0).
  634│     const pocketKey = POCKETS[_pocketIdx].key;
  635│     const def = getItem(slot.itemKey);
  636│     // 1:1 décomp item_menu.c:899 GetItemNameFromPocket :
  637│     //   TMHM_POCKET → "CT01    FOCUS PUNCH" (= numéro + tab + nom du move).
  638│     //   BERRIES_POCKET → "01  ORAN" (= numéro berry + nom).
  639│     //   Default → nom item plain.
  640│     let displayName = getItemNameFr(slot.itemKey);
  641│     let isHM = false;
  642│     if (pocketKey === 'tmHm' && def?.descriptionLabel) {
  643│       // 1:1 décomp item_menu.c:899 GetItemNameFromPocket TMHM_POCKET render :
  644│       //   StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)]);
  645│       //   if (itemId >= ITEM_HM01) → gText_NumberItem_HM avec nombre 1-8 (1 digit)
  646│       //   else                     → gText_NumberItem_TMBerry avec nombre 1-50 (2 digits)
  647│       // Notre items.json a déjà def.name = "CT01" / "CS01" (= prefix FR formatté
  648│       // depuis le décomp). On utilise ça + le move name.
  649│       const tmMatch = def.descriptionLabel.match(/^s(TM|HM)(\d+)Desc$/);
  650│       if (tmMatch) {
  651│         isHM = tmMatch[1] === 'HM';
  652│         const itemNum = def.name;  // "CT01" / "CS01"
  653│         const moveSlug = slot.itemKey.replace(/^ITEM_(TM|HM)_/, '');
  654│         const moveName = getMoveNameFr(`MOVE_${moveSlug}`);
  655│         displayName = `${itemNum} ${moveName}`;
  656│       }
  657│     }
  658│     AddTextPrinterParameterized3(
  659│       _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW, displayName,
  660│     );
  661│     // 1:1 décomp item_menu.c:969-971 BagMenu_ItemPrintCallback :
  662│     //   if (itemId >= ITEM_HM01 && itemId <= ITEM_HM08)
  663│     //     BlitBitmapToWindow(windowId, gBagMenuHMIcon_Gfx, 8, y - 1, 16, 16);
  664│     // → petit badge "HM" 16×16. TODO : extraire hm_icon.png + blit. Pour
  665│     // l'instant, le prefix "CS0N" du nom suffit à identifier les HMs (= 1:1
  666│     // visuel acceptable car le nom CS01 etc. est déjà distinctif).
  667│     // 1:1 décomp item_menu.c:973-988 BagMenu_ItemPrintCallback :
  668│     //   if (BERRIES_POCKET) → print qty avec BERRY_CAPACITY_DIGITS
  669│     //   else if (!KEYITEMS_POCKET && !GetItemImportance(itemId)) → print qty
  670│     //   else → registered icon (key items) ou rien (HMs ont importance=1)
  671│     // HMs = importance=1 → PAS de qty ("on en a qu'une" — user).
  672│     // TMs = importance=0 → qty affichée comme un item normal ("on peut en avoir
  673│     // plusieurs" — user). gText_xVar1 = "×{STR_VAR_1}".
  674│     const showQty = (pocketKey === 'berries')
  675│       || (pocketKey !== 'keyItems' && !isHM);
  676│     if (showQty) {
  677│       const qtyStr = `×${slot.quantity}`;
  678│       const qtyX = GetStringRightAlignXOffset(qtyStr, 119);
  679│       AddTextPrinterParameterized3(
  680│         _listWid, FONT_NARROW, qtyX, y, COLOR_MAIN, TEXT_SKIP_DRAW, qtyStr,
  681│       );
  682│     }
  683│   }
  684│   PutWindowTilemap(_listWid);
  685│   CopyWindowToVram(_listWid, 3);
  686│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ BagMenu_ItemPrintCallback  —  item_menu.c:949-997 (49 l)
▌ ‖ port: _drawList (src/engine/bag-screen.ts:606-686)  ← cite "item_menu.c:969-971" @src/engine/bag-screen.ts:661
▌ ‖ port: _drawList (src/engine/bag-screen.ts:606-686)  ← cite "item_menu.c:973-988" @src/engine/bag-screen.ts:667
▌ ‖ port: Task_BagMenu_HandleInput_BagScreen (src/engine/bag-screen.ts:2334-2341)  ← cite "item_menu.c:990" @src/engine/bag-screen.ts:2336
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:949-997 ────────────────────────────────────────
  949│ static void BagMenu_ItemPrintCallback(u8 windowId, u32 itemIndex, u8 y)
  950│ {
  951│     u16 itemId;
  952│     u16 itemQuantity;
  953│     int offset;
  954│ 
  955│     if (itemIndex != LIST_CANCEL)
  956│     {
  957│         if (gBagMenu->toSwapPos != NOT_SWAPPING)
  958│         {
  959│             // Swapping items, draw cursor at original item's location
  960│             if (gBagMenu->toSwapPos == (u8)itemIndex)
  961│                 BagMenu_PrintCursorAtPos(y, COLORID_GRAY_CURSOR);
  962│             else
  963│                 BagMenu_PrintCursorAtPos(y, COLORID_NONE);
  964│         }
  965│ 
  966│         itemId = BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, itemIndex);
  967│         itemQuantity = BagGetQuantityByPocketPosition(gBagPosition.pocket + 1, itemIndex);
  968│ 
  969│         // Draw HM icon
  970│         if (itemId >= ITEM_HM01 && itemId <= ITEM_HM08)
  971│             BlitBitmapToWindow(windowId, gBagMenuHMIcon_Gfx, 8, y - 1, 16, 16);
  972│ 
  973│         if (gBagPosition.pocket == BERRIES_POCKET)
  974│         {
  975│             // Print berry quantity
  976│             ConvertIntToDecimalStringN(gStringVar1, itemQuantity, STR_CONV_MODE_RIGHT_ALIGN, BERRY_CAPACITY_DIGITS);
  977│             StringExpandPlaceholders(gStringVar4, gText_xVar1);
  978│             offset = GetStringRightAlignXOffset(FONT_NARROW, gStringVar4, 119);
  979│             BagMenu_Print(windowId, FONT_NARROW, gStringVar4, offset, y, 0, 0, TEXT_SKIP_DRAW, COLORID_NORMAL);
  980│         }
  981│         else if (gBagPosition.pocket != KEYITEMS_POCKET && GetItemImportance(itemId) == FALSE)
  982│         {
  983│             // Print item quantity
  984│             ConvertIntToDecimalStringN(gStringVar1, itemQuantity, STR_CONV_MODE_RIGHT_ALIGN, BAG_ITEM_CAPACITY_DIGITS);
  985│             StringExpandPlaceholders(gStringVar4, gText_xVar1);
  986│             offset = GetStringRightAlignXOffset(FONT_NARROW, gStringVar4, 119);
  987│             BagMenu_Print(windowId, FONT_NARROW, gStringVar4, offset, y, 0, 0, TEXT_SKIP_DRAW, COLORID_NORMAL);
  988│         }
  989│         else
  990│         {
  991│             // Print registered icon
  992│             if (gSaveBlock1Ptr->registeredItem != ITEM_NONE && gSaveBlock1Ptr->registeredItem == itemId)
  993│                 BlitBitmapToWindow(windowId, sRegisteredSelect_Gfx, 96, y - 1, 24, 16);
  994│         }
  995│     }
  996│ }
  997│ 
├─ PORT src/engine/bag-screen.ts:606-686 ────────────────────────────────────────
  606│ function _drawList(): void {
  607│   if (_listWid < 0) return;
  608│   FillWindowPixelBuffer(_listWid, 0x00);
  609│   const items = _currentPocketItems();
  610│   for (let i = 0; i < VISIBLE_ROWS; i++) {
  611│     const idx = _scrollOffset + i;
  612│     if (idx >= items.length) break;
  613│     const slot = items[idx];
  614│     const y = 1 + i * 16;
  615│     // 1:1 décomp item_menu.c:1026 BagMenu_PrintCursorAtPos :
  616│     //   BagMenu_Print(WIN_ITEM_LIST, FONT_NORMAL, gText_SelectorArrow2, 0, y, ...)
  617│     // Cursor ▶ rendu en FONT_NORMAL à x=0, indépendamment du nom item.
  618│     if (i === _cursorPos) {
  619│       AddTextPrinterParameterized3(
  620│         _listWid, FONT_NORMAL, 0, y, COLOR_MAIN, TEXT_SKIP_DRAW, '▶',
  621│       );
  622│     }
  623│     if (slot.itemKey === CLOSE_BAG_KEY) {
  624│       // 1:1 décomp gText_CloseBag = "FERMER LE SAC". Pas de quantity.
  625│       // Position x=8 = après le cursor.
  626│       AddTextPrinterParameterized3(
  627│         _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW,
  628│         getString('gText_CloseBag'),
  629│       );
  630│       continue;
  631│     }
  632│     // 1:1 décomp item_menu.c:262 sItemListMenu.fontId = FONT_NARROW.
  633│     // Item name à x=8 (= après cursor at x=0).
  634│     const pocketKey = POCKETS[_pocketIdx].key;
  635│     const def = getItem(slot.itemKey);
  636│     // 1:1 décomp item_menu.c:899 GetItemNameFromPocket :
  637│     //   TMHM_POCKET → "CT01    FOCUS PUNCH" (= numéro + tab + nom du move).
  638│     //   BERRIES_POCKET → "01  ORAN" (= numéro berry + nom).
  639│     //   Default → nom item plain.
  640│     let displayName = getItemNameFr(slot.itemKey);
  641│     let isHM = false;
  642│     if (pocketKey === 'tmHm' && def?.descriptionLabel) {
  643│       // 1:1 décomp item_menu.c:899 GetItemNameFromPocket TMHM_POCKET render :
  644│       //   StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)]);
  645│       //   if (itemId >= ITEM_HM01) → gText_NumberItem_HM avec nombre 1-8 (1 digit)
  646│       //   else                     → gText_NumberItem_TMBerry avec nombre 1-50 (2 digits)
  647│       // Notre items.json a déjà def.name = "CT01" / "CS01" (= prefix FR formatté
  648│       // depuis le décomp). On utilise ça + le move name.
  649│       const tmMatch = def.descriptionLabel.match(/^s(TM|HM)(\d+)Desc$/);
  650│       if (tmMatch) {
  651│         isHM = tmMatch[1] === 'HM';
  652│         const itemNum = def.name;  // "CT01" / "CS01"
  653│         const moveSlug = slot.itemKey.replace(/^ITEM_(TM|HM)_/, '');
  654│         const moveName = getMoveNameFr(`MOVE_${moveSlug}`);
  655│         displayName = `${itemNum} ${moveName}`;
  656│       }
  657│     }
  658│     AddTextPrinterParameterized3(
  659│       _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW, displayName,
  660│     );
  661│     // 1:1 décomp item_menu.c:969-971 BagMenu_ItemPrintCallback :
  662│     //   if (itemId >= ITEM_HM01 && itemId <= ITEM_HM08)
  663│     //     BlitBitmapToWindow(windowId, gBagMenuHMIcon_Gfx, 8, y - 1, 16, 16);
  664│     // → petit badge "HM" 16×16. TODO : extraire hm_icon.png + blit. Pour
  665│     // l'instant, le prefix "CS0N" du nom suffit à identifier les HMs (= 1:1
  666│     // visuel acceptable car le nom CS01 etc. est déjà distinctif).
  667│     // 1:1 décomp item_menu.c:973-988 BagMenu_ItemPrintCallback :
  668│     //   if (BERRIES_POCKET) → print qty avec BERRY_CAPACITY_DIGITS
  669│     //   else if (!KEYITEMS_POCKET && !GetItemImportance(itemId)) → print qty
  670│     //   else → registered icon (key items) ou rien (HMs ont importance=1)
  671│     // HMs = importance=1 → PAS de qty ("on en a qu'une" — user).
  672│     // TMs = importance=0 → qty affichée comme un item normal ("on peut en avoir
  673│     // plusieurs" — user). gText_xVar1 = "×{STR_VAR_1}".
  674│     const showQty = (pocketKey === 'berries')
  675│       || (pocketKey !== 'keyItems' && !isHM);
  676│     if (showQty) {
  677│       const qtyStr = `×${slot.quantity}`;
  678│       const qtyX = GetStringRightAlignXOffset(qtyStr, 119);
  679│       AddTextPrinterParameterized3(
  680│         _listWid, FONT_NARROW, qtyX, y, COLOR_MAIN, TEXT_SKIP_DRAW, qtyStr,
  681│       );
  682│     }
  683│   }
  684│   PutWindowTilemap(_listWid);
  685│   CopyWindowToVram(_listWid, 3);
  686│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ PrintItemDescription  —  item_menu.c:998-1015 (18 l)
▌ ‖ port: _drawDesc (src/engine/bag-screen.ts:688-736)  ← cite "item_menu.c:1008" @src/engine/bag-screen.ts:696
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:998-1015 ────────────────────────────────────────
  998│ static void PrintItemDescription(int itemIndex)
  999│ {
 1000│     const u8 *str;
 1001│     if (itemIndex != LIST_CANCEL)
 1002│     {
 1003│         str = GetItemDescription(BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, itemIndex));
 1004│     }
 1005│     else
 1006│     {
 1007│         // Print 'Cancel' description
 1008│         StringCopy(gStringVar1, gBagMenu_ReturnToStrings[gBagPosition.location]);
 1009│         StringExpandPlaceholders(gStringVar4, gText_ReturnToVar1);
 1010│         str = gStringVar4;
 1011│     }
 1012│     FillWindowPixelBuffer(WIN_DESCRIPTION, PIXEL_FILL(0));
 1013│     BagMenu_Print(WIN_DESCRIPTION, FONT_NORMAL, str, 3, 1, 0, 0, 0, COLORID_NORMAL);
 1014│ }
 1015│ 
├─ PORT src/engine/bag-screen.ts:688-736 ────────────────────────────────────────
  688│ function _drawDesc(): void {
  689│   if (_descWid < 0) return;
  690│   FillWindowPixelBuffer(_descWid, 0x00);
  691│   // TODO étape 2 : blit du select_button.png (palette dédiée nécessaire =
  692│   // bag.pal n'a pas les couleurs du button → glitch). Pour l'instant juste texte.
  693│   const TEXT_LEFT = 4;
  694│   const itemKey = _selectedItemKey();
  695│   if (itemKey === CLOSE_BAG_KEY) {
  696│     // 1:1 décomp item_menu.c:1008 PrintItemDescription LIST_CANCEL :
  697│     //   StringCopy(gStringVar1, gBagMenu_ReturnToStrings[location]);
  698│     //   StringExpandPlaceholders(gStringVar4, gText_ReturnToVar1);
  699│     // gText_ReturnToVar1 = "Retourner\n{STR_VAR_1}." → dynamique selon location :
  700│     // FIELD="au jeu", BATTLE="au combat", PC="au PC", PARTY="à la LISTE POKéMON".
  701│     const tpl = getString('gText_ReturnToVar1');  // "Retourner\\n{STR_VAR_1}."
  702│     const field = getString(RETURN_TO_STRINGS[_bagLocation]);
  703│     const expanded = tpl.replace('{STR_VAR_1}', field);  // "Retourner\\nau jeu."
  704│     // Le \n est literal dans le JSON, on split sur \\n ou \n.
  705│     const lines = expanded.split(/\\n|\n/);
  706│     for (let i = 0; i < Math.min(lines.length, 3); i++) {
  707│       AddTextPrinterParameterized3(
  708│         _descWid, FONT_NORMAL, TEXT_LEFT, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW,
  709│         lines[i],
  710│       );
  711│     }
  712│     PutWindowTilemap(_descWid);
  713│     CopyWindowToVram(_descWid, 3);
  714│     return;
  715│   }
  716│   if (itemKey) {
  717│     // 1:1 décomp item.c GetItemDescription(itemId) = gItems[itemId].description
  718│     // = pointer vers le symbol "sPokeBallDesc". Notre items.json a
  719│     // `descriptionLabel: "sPokeBallDesc"` → lookup direct dans strings.json
  720│     // (= zéro hardcode, vraies descriptions FR du décomp).
  721│     // Les newlines literals "\n" du décomp = déjà placés pour les 3 lignes max.
  722│     const def = getItem(itemKey);
  723│     const desc = def?.descriptionLabel ? getString(def.descriptionLabel) : '';
  724│     const lines = desc.split(/\\n|\n/);
  725│     for (let i = 0; i < Math.min(lines.length, 3); i++) {
  726│       AddTextPrinterParameterized3(
  727│         _descWid, FONT_NORMAL, TEXT_LEFT, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW,
  728│         lines[i],
  729│       );
  730│     }
  731│   }
  732│   // Note : pas de else branch (= itemKey null). _currentPocketItems append
  733│   // toujours CLOSE_BAG_KEY donc une entry sélectionnable existe toujours.
  734│   PutWindowTilemap(_descWid);
  735│   CopyWindowToVram(_descWid, 3);
  736│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ BagMenu_PrintCursorAtPos  —  item_menu.c:1021-1029 (9 l)
▌ ‖ port: _drawList (src/engine/bag-screen.ts:606-686)  ← cite "item_menu.c:1026" @src/engine/bag-screen.ts:615
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1021-1029 ────────────────────────────────────────
 1021│ static void BagMenu_PrintCursorAtPos(u8 y, u8 colorIndex)
 1022│ {
 1023│     if (colorIndex == COLORID_NONE)
 1024│         FillWindowPixelRect(WIN_ITEM_LIST, PIXEL_FILL(0), 0, y, GetMenuCursorDimensionByFont(FONT_NORMAL, 0), GetMenuCursorDimensionByFont(FONT_NORMAL, 1));
 1025│     else
 1026│         BagMenu_Print(WIN_ITEM_LIST, FONT_NORMAL, gText_SelectorArrow2, 0, y, 0, 0, 0, colorIndex);
 1027│ 
 1028│ }
 1029│ 
├─ PORT src/engine/bag-screen.ts:606-686 ────────────────────────────────────────
  606│ function _drawList(): void {
  607│   if (_listWid < 0) return;
  608│   FillWindowPixelBuffer(_listWid, 0x00);
  609│   const items = _currentPocketItems();
  610│   for (let i = 0; i < VISIBLE_ROWS; i++) {
  611│     const idx = _scrollOffset + i;
  612│     if (idx >= items.length) break;
  613│     const slot = items[idx];
  614│     const y = 1 + i * 16;
  615│     // 1:1 décomp item_menu.c:1026 BagMenu_PrintCursorAtPos :
  616│     //   BagMenu_Print(WIN_ITEM_LIST, FONT_NORMAL, gText_SelectorArrow2, 0, y, ...)
  617│     // Cursor ▶ rendu en FONT_NORMAL à x=0, indépendamment du nom item.
  618│     if (i === _cursorPos) {
  619│       AddTextPrinterParameterized3(
  620│         _listWid, FONT_NORMAL, 0, y, COLOR_MAIN, TEXT_SKIP_DRAW, '▶',
  621│       );
  622│     }
  623│     if (slot.itemKey === CLOSE_BAG_KEY) {
  624│       // 1:1 décomp gText_CloseBag = "FERMER LE SAC". Pas de quantity.
  625│       // Position x=8 = après le cursor.
  626│       AddTextPrinterParameterized3(
  627│         _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW,
  628│         getString('gText_CloseBag'),
  629│       );
  630│       continue;
  631│     }
  632│     // 1:1 décomp item_menu.c:262 sItemListMenu.fontId = FONT_NARROW.
  633│     // Item name à x=8 (= après cursor at x=0).
  634│     const pocketKey = POCKETS[_pocketIdx].key;
  635│     const def = getItem(slot.itemKey);
  636│     // 1:1 décomp item_menu.c:899 GetItemNameFromPocket :
  637│     //   TMHM_POCKET → "CT01    FOCUS PUNCH" (= numéro + tab + nom du move).
  638│     //   BERRIES_POCKET → "01  ORAN" (= numéro berry + nom).
  639│     //   Default → nom item plain.
  640│     let displayName = getItemNameFr(slot.itemKey);
  641│     let isHM = false;
  642│     if (pocketKey === 'tmHm' && def?.descriptionLabel) {
  643│       // 1:1 décomp item_menu.c:899 GetItemNameFromPocket TMHM_POCKET render :
  644│       //   StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)]);
  645│       //   if (itemId >= ITEM_HM01) → gText_NumberItem_HM avec nombre 1-8 (1 digit)
  646│       //   else                     → gText_NumberItem_TMBerry avec nombre 1-50 (2 digits)
  647│       // Notre items.json a déjà def.name = "CT01" / "CS01" (= prefix FR formatté
  648│       // depuis le décomp). On utilise ça + le move name.
  649│       const tmMatch = def.descriptionLabel.match(/^s(TM|HM)(\d+)Desc$/);
  650│       if (tmMatch) {
  651│         isHM = tmMatch[1] === 'HM';
  652│         const itemNum = def.name;  // "CT01" / "CS01"
  653│         const moveSlug = slot.itemKey.replace(/^ITEM_(TM|HM)_/, '');
  654│         const moveName = getMoveNameFr(`MOVE_${moveSlug}`);
  655│         displayName = `${itemNum} ${moveName}`;
  656│       }
  657│     }
  658│     AddTextPrinterParameterized3(
  659│       _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW, displayName,
  660│     );
  661│     // 1:1 décomp item_menu.c:969-971 BagMenu_ItemPrintCallback :
  662│     //   if (itemId >= ITEM_HM01 && itemId <= ITEM_HM08)
  663│     //     BlitBitmapToWindow(windowId, gBagMenuHMIcon_Gfx, 8, y - 1, 16, 16);
  664│     // → petit badge "HM" 16×16. TODO : extraire hm_icon.png + blit. Pour
  665│     // l'instant, le prefix "CS0N" du nom suffit à identifier les HMs (= 1:1
  666│     // visuel acceptable car le nom CS01 etc. est déjà distinctif).
  667│     // 1:1 décomp item_menu.c:973-988 BagMenu_ItemPrintCallback :
  668│     //   if (BERRIES_POCKET) → print qty avec BERRY_CAPACITY_DIGITS
  669│     //   else if (!KEYITEMS_POCKET && !GetItemImportance(itemId)) → print qty
  670│     //   else → registered icon (key items) ou rien (HMs ont importance=1)
  671│     // HMs = importance=1 → PAS de qty ("on en a qu'une" — user).
  672│     // TMs = importance=0 → qty affichée comme un item normal ("on peut en avoir
  673│     // plusieurs" — user). gText_xVar1 = "×{STR_VAR_1}".
  674│     const showQty = (pocketKey === 'berries')
  675│       || (pocketKey !== 'keyItems' && !isHM);
  676│     if (showQty) {
  677│       const qtyStr = `×${slot.quantity}`;
  678│       const qtyX = GetStringRightAlignXOffset(qtyStr, 119);
  679│       AddTextPrinterParameterized3(
  680│         _listWid, FONT_NARROW, qtyX, y, COLOR_MAIN, TEXT_SKIP_DRAW, qtyStr,
  681│       );
  682│     }
  683│   }
  684│   PutWindowTilemap(_listWid);
  685│   CopyWindowToVram(_listWid, 3);
  686│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ CreatePocketScrollArrowPair  —  item_menu.c:1030-1043 (14 l)
▌ ‖ port: src/engine/bag-screen.ts:389 (hors fonction)  ← cite "item_menu.c:1033" @src/engine/bag-screen.ts:389
▌ ‖ port: src/engine/bag-screen.ts:1126 (hors fonction)  ← cite "item_menu.c:1030" @src/engine/bag-screen.ts:1126
▌ ‖ port: _spawnListScrollArrows (src/engine/bag-screen.ts:1128-1163)  ← cite "item_menu.c:1033" @src/engine/bag-screen.ts:1128
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1030-1043 ────────────────────────────────────────
 1030│ static void CreatePocketScrollArrowPair(void)
 1031│ {
 1032│     if (gBagMenu->pocketScrollArrowsTask == TASK_NONE)
 1033│         gBagMenu->pocketScrollArrowsTask = AddScrollIndicatorArrowPairParameterized(
 1034│             SCROLL_ARROW_UP,
 1035│             172,
 1036│             12,
 1037│             148,
 1038│             gBagMenu->numItemStacks[gBagPosition.pocket] - gBagMenu->numShownItems[gBagPosition.pocket],
 1039│             TAG_POCKET_SCROLL_ARROW,
 1040│             TAG_POCKET_SCROLL_ARROW,
 1041│             &gBagPosition.scrollPosition[gBagPosition.pocket]);
 1042│ }
 1043│ 
├─ PORT src/engine/bag-screen.ts:1128-1163 ────────────────────────────────────────
 1128│ /** 1:1 décomp item_menu.c:1033 CreatePocketScrollArrowPair :
 1129│  *    AddScrollIndicatorArrowPairParameterized(SCROLL_ARROW_UP, 172, 12, 148,
 1130│  *      numItemStacks - numShownItems, TAG_POCKET_SCROLL_ARROW, TAG_POCKET_SCROLL_ARROW,
 1131│  *      &scrollPosition);
 1132│  *  → UP arrow à (172, 12), DOWN arrow à (172, 148). Spawn quand list overflow,
 1133│  *  visible selon scroll position. */
 1134│ function _spawnListScrollArrows(): void {
 1135│   const rt = getRuntime();
 1136│   if (!rt) return;
 1137│   // Idempotent — gfx + palette déjà loadés par _spawnPocketArrows (= même
 1138│   // scroll_indicator.png + red.pal).
 1139│   if (!_scrollArrowAssetsLoaded) return;
 1140│   const baseTile = SCROLL_ARROW_OBJ_OFFSET / 32;
 1141│   // 1:1 décomp animNum=2 = ANIMCMD_FRAME(4, 30) → tile 4 (= frame UP/DOWN base).
 1142│   // Pour UP : no flip. Pour DOWN : vflip (= animNum=3 ANIMCMD_FRAME(4, 30, 0, 1)).
 1143│   const up = rt.CreateSpriteAtOam({
 1144│     tileId: baseTile + 4, paletteBank: SCROLL_ARROW_OBJ_PAL,
 1145│     x: 172, y: 12,
 1146│     shape: 0, size: 1,
 1147│     priority: 0,
 1148│   });
 1149│   _arrowUpOamId = up.spriteId;
 1150│   _arrowUpOamIndex = up.oamIndex;
 1151│   const down = rt.CreateSpriteAtOam({
 1152│     tileId: baseTile + 4, paletteBank: SCROLL_ARROW_OBJ_PAL,
 1153│     x: 172, y: 148,
 1154│     shape: 0, size: 1,
 1155│     priority: 0,
 1156│   });
 1157│   _arrowDownOamId = down.spriteId;
 1158│   _arrowDownOamIndex = down.oamIndex;
 1159│   const ds = rt.gSprites.get(_arrowDownOamId);
 1160│   if (ds) ds.vFlip = true;
 1161│   _arrowSinePosUp = 0;
 1162│   _arrowSinePosDown = 0;
 1163│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ FreeBagMenu  —  item_menu.c:1069-1076 (8 l)
▌ ‖ port: _freeBagMenu (src/engine/bag-screen.ts:2508-2562)  ← cite "item_menu.c:1069" @src/engine/bag-screen.ts:2508
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1069-1076 ────────────────────────────────────────
 1069│ static void FreeBagMenu(void)
 1070│ {
 1071│     Free(sListBuffer2);
 1072│     Free(sListBuffer1);
 1073│     FreeAllWindowBuffers();
 1074│     Free(gBagMenu);
 1075│ }
 1076│ 
├─ PORT src/engine/bag-screen.ts:2508-2562 ────────────────────────────────────────
 2508│ /** 1:1 décomp item_menu.c:1069 FreeBagMenu + Task_CloseBagMenu cleanup :
 2509│  *      Free(sListBuffer2); Free(sListBuffer1);
 2510│  *      FreeAllWindowBuffers(); Free(gBagMenu);
 2511│  *      ResetSpriteData(); FreeAllSpritePalettes();
 2512│  *      BagDestroyPocketScrollArrowPair();
 2513│  *
 2514│  *  Pas de save/restore VRAM/palette — CB2_ReturnToFieldWithOpenMenu_Manual
 2515│  *  va re-init OW from scratch via `_restoreOverworldFromMenu` (= loadAndInitMap
 2516│  *  reload tilesets + palettes + spawn NPCs). */
 2517│ function _freeBagMenu(): void {
 2518│   const rt = getRuntime();
 2519│   // Destroy bag sprite OAM (= 1:1 décomp ResetSpriteData clear all OAM).
 2520│   if (_bagSpriteOamId >= 0 && rt) {
 2521│     const spr = rt.gSprites.get(_bagSpriteOamId);
 2522│     if (spr) spr.inUse = false;
 2523│     rt.gSprites.delete(_bagSpriteOamId);
 2524│     const oam = rt.gba.oam[spr?.oamIndex ?? -1];
 2525│     if (oam) oam.visible = false;
 2526│   }
 2527│   _bagSpriteOamId = -1;
 2528│   _bagSpriteOamIndex = -1;
 2529│   _bagAssetsLoadedToObj = false;
 2530│   // 1:1 décomp BagDestroyPocketScrollArrowPair + RemoveScrollIndicatorArrowPair.
 2531│   _despawnPocketArrows();
 2532│   _despawnListScrollArrows();
 2533│   _scrollArrowAssetsLoaded = false;
 2534│   _despawnRotatingBall();
 2535│   _rotatingBallAssetsLoaded = false;
 2536│   // 1:1 décomp FreeAllWindowBuffers — remove all bag windows.
 2537│   if (_spriteWid >= 0) { RemoveWindow(_spriteWid); _spriteWid = -1; }
 2538│   if (_itemIconWid >= 0) { RemoveWindow(_itemIconWid); _itemIconWid = -1; }
 2539│   if (_headerWid >= 0) {
 2540│     ClearStdWindowAndFrame(_headerWid, true); RemoveWindow(_headerWid); _headerWid = -1;
 2541│   }
 2542│   if (_listWid >= 0) {
 2543│     ClearStdWindowAndFrame(_listWid, true); RemoveWindow(_listWid); _listWid = -1;
 2544│   }
 2545│   if (_descWid >= 0) {
 2546│     ClearStdWindowAndFrame(_descWid, true); RemoveWindow(_descWid); _descWid = -1;
 2547│   }
 2548│   if (_ctxWid >= 0) {
 2549│     ClearStdWindowAndFrame(_ctxWid, true); RemoveWindow(_ctxWid); _ctxWid = -1;
 2550│   }
 2551│   if (_yesNoWid >= 0) {
 2552│     ClearStdWindowAndFrame(_yesNoWid, true); RemoveWindow(_yesNoWid); _yesNoWid = -1;
 2553│   }
 2554│   if (_qtyWid >= 0) {
 2555│     ClearStdWindowAndFrame(_qtyWid, true); RemoveWindow(_qtyWid); _qtyWid = -1;
 2556│   }
 2557│   _loadedIconKey = null;
 2558│   _isOpen = false;
 2559│   _phase = 'idle';
 2560│   _bagGraphicsReady = false;
 2561│   _bagGraphicsLoading = false;
 2562│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_FadeAndCloseBagMenu  —  item_menu.c:1077-1082 (6 l)
▌ ‖ port: CloseBagScreen (src/engine/bag-screen.ts:2032-2062)  ← cite "item_menu.c:1077" @src/engine/bag-screen.ts:2040
▌ ‖ port: Task_FadeAndCloseBagMenu_BagScreen (src/engine/bag-screen.ts:2297-2307)  ← cite "item_menu.c:1077" @src/engine/bag-screen.ts:2297
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1077-1082 ────────────────────────────────────────
 1077│ void Task_FadeAndCloseBagMenu(u8 taskId)
 1078│ {
 1079│     BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
 1080│     gTasks[taskId].func = Task_CloseBagMenu;
 1081│ }
 1082│ 
├─ PORT src/engine/bag-screen.ts:2032-2062 ────────────────────────────────────────
 2032│ /** Drive depuis le tick start-menu. Lit gMain.newKeys et navigue.
 2033│  *  Caller doit consume les keys après cet appel.
 2034│  *
 2035│  *  1:1 décomp list_menu.c:ListMenu_ProcessInput utilise :
 2036│  *    - JOY_NEW(A/B)         : new press only (= newKeys & KEY)
 2037│  *    - JOY_REPEAT(UP/DOWN)  : new press OU repeated key (= hold to scroll)
 2038│  *  JOY_REPEAT lit gMain.newAndRepeatedKeys. Le runtime maintient ce field
 2039│  *  avec gKeyRepeatStartDelay=40 + gKeyRepeatContinueDelay=5 (1:1 main.c). */
 2040│ /** Démarre le close du bag screen. 1:1 décomp item_menu.c:1077
 2041│  *  Task_FadeAndCloseBagMenu pattern :
 2042│  *    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
 2043│  *    gTasks[taskId].func = Task_CloseBagMenu;  // wait fade
 2044│  *
 2045│  *  Le Task créé tick chaque frame via RunTasks dans MainCB2_BagMenuRun.
 2046│  *  Quand fade fini, Task_CloseBagMenu free les ressources et
 2047│  *  SetMainCallback2(gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual)
 2048│  *  pour return à l'OW + reopen start menu. */
 2049│ export function CloseBagScreen(): void {
 2050│   if (!_isOpen || _phase === 'fading_out') return;
 2051│   _phase = 'fading_out';
 2052│   const rt = getRuntime();
 2053│   if (!rt) return;
 2054│   // Kill l'input task pour stopper TickBagScreen pendant fade out
 2055│   // (= sinon il consume les keys, user pourrait re-A pendant fade).
 2056│   if (_bagInputTaskId >= 0) {
 2057│     rt.DestroyTask(_bagInputTaskId);
 2058│     _bagInputTaskId = -1;
 2059│   }
 2060│   // 1:1 décomp Task_FadeAndCloseBagMenu — créé directement.
 2061│   rt.CreateTask(Task_FadeAndCloseBagMenu_BagScreen, 0);
 2062│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_CloseBagMenu  —  item_menu.c:1083-1104 (22 l)
▌ ‖ port: Task_CloseBagMenu_BagScreen (src/engine/bag-screen.ts:2309-2332)  ← cite "item_menu.c:1083" @src/engine/bag-screen.ts:2309
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1083-1104 ────────────────────────────────────────
 1083│ static void Task_CloseBagMenu(u8 taskId)
 1084│ {
 1085│     s16 *data = gTasks[taskId].data;
 1086│     if (!gPaletteFade.active)
 1087│     {
 1088│         DestroyListMenuTask(tListTaskId, &gBagPosition.scrollPosition[gBagPosition.pocket], &gBagPosition.cursorPosition[gBagPosition.pocket]);
 1089│ 
 1090│         // If ready for a new screen (e.g. party menu for giving an item) go to that screen
 1091│         // Otherwise exit the bag and use callback set up when the bag was first opened
 1092│         if (gBagMenu->newScreenCallback != NULL)
 1093│             SetMainCallback2(gBagMenu->newScreenCallback);
 1094│         else
 1095│             SetMainCallback2(gBagPosition.exitCallback);
 1096│ 
 1097│         BagDestroyPocketScrollArrowPair();
 1098│         ResetSpriteData();
 1099│         FreeAllSpritePalettes();
 1100│         FreeBagMenu();
 1101│         DestroyTask(taskId);
 1102│     }
 1103│ }
 1104│ 
├─ PORT src/engine/bag-screen.ts:2309-2332 ────────────────────────────────────────
 2309│ /** 1:1 décomp item_menu.c:1083 Task_CloseBagMenu :
 2310│  *      if (!gPaletteFade.active) {
 2311│  *        DestroyListMenuTask(tListTaskId, ...);
 2312│  *        SetMainCallback2(gBagPosition.exitCallback);
 2313│  *        BagDestroyPocketScrollArrowPair();
 2314│  *        ResetSpriteData(); FreeAllSpritePalettes(); FreeBagMenu();
 2315│  *        DestroyTask(taskId);
 2316│  *      } */
 2317│ function Task_CloseBagMenu_BagScreen(task: DecompTask): void {
 2318│   const rt = getRuntime();
 2319│   if (!rt || rt.gPaletteFade.active) return;
 2320│   _freeBagMenu();
 2321│   // 1:1 décomp `SetMainCallback2(gBagPosition.exitCallback)` (= notre
 2322│   // gMain.savedCallback set par sacAction = CB2_ReturnToFieldWithOpenMenu_Manual).
 2323│   const exitCb = rt.gMain.savedCallback;
 2324│   if (exitCb) {
 2325│     rt.SetMainCallback2(exitCb);
 2326│   } else {
 2327│     console.warn('[bag-screen] Task_CloseBagMenu : no savedCallback');
 2328│     rt.SetMainCallback2(null);
 2329│   }
 2330│   rt.DestroyTask(task.taskId);
 2331│   _bagInputTaskId = -1;
 2332│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ PrintItemQuantity  —  item_menu.c:1203-1211 (9 l)
▌ ‖ port: _drawTossQuantity (src/engine/bag-screen.ts:1678-1695)  ← cite "item_menu.c:1203" @src/engine/bag-screen.ts:1682
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1203-1211 ────────────────────────────────────────
 1203│ static void PrintItemQuantity(u8 windowId, s16 quantity, u32 speed)
 1204│ {
 1205│     u8 numDigits = (gBagPosition.pocket == BERRIES_POCKET) ? BERRY_CAPACITY_DIGITS : BAG_ITEM_CAPACITY_DIGITS;
 1206│     ConvertIntToDecimalStringN(gStringVar1, quantity, STR_CONV_MODE_LEADING_ZEROS, numDigits);
 1207│     StringExpandPlaceholders(gStringVar4, gText_xVar1);
 1208│     AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar4, GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar4, 0x28), 2, speed, NULL);
 1209│ }
 1210│ 
 1211│ // Prints the quantity of items to be sold and the amount that would be earned
├─ PORT src/engine/bag-screen.ts:1678-1695 ────────────────────────────────────────
 1678│ function _drawTossQuantity(): void {
 1679│   if (_qtyWid < 0) return;
 1680│   // PIXEL_FILL(1) = cream opaque (palette 15 idx 1 std_menu.pal).
 1681│   FillWindowPixelBuffer(_qtyWid, 0x11);
 1682│   // 1:1 décomp item_menu.c:1203 PrintItemQuantity :
 1683│   //   ConvertIntToDecimalStringN(... STR_CONV_MODE_LEADING_ZEROS, BAG_ITEM_CAPACITY_DIGITS=2);
 1684│   //   StringExpandPlaceholders(gStringVar4, gText_xVar1);  // "×{STR_VAR_1}"
 1685│   //   AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar4,
 1686│   //     GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar4, 0x28), 2, ...);
 1687│   // → "×01".."×99" avec leading zero, centered dans 0x28 (= 40 px), y=2.
 1688│   const qtyStr = `×${String(_tossQty).padStart(2, '0')}`;
 1689│   const xOffset = GetStringCenterAlignXOffset(qtyStr, 0x28);
 1690│   AddTextPrinterParameterized3(
 1691│     _qtyWid, FONT_NORMAL, xOffset, 2, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW, qtyStr,
 1692│   );
 1693│   PutWindowTilemap(_qtyWid);
 1694│   CopyWindowToVram(_qtyWid, 3);
 1695│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Task_SwitchBagPocket  —  item_menu.c:1363-1411 (49 l)
▌ ‖ port: src/engine/bag-screen.ts:275 (hors fonction)  ← cite "item_menu.c:1363" @src/engine/bag-screen.ts:275
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1363-1411 ────────────────────────────────────────
 1363│ static void Task_SwitchBagPocket(u8 taskId)
 1364│ {
 1365│     s16 *data = gTasks[taskId].data;
 1366│ 
 1367│     if (!MenuHelpers_IsLinkActive() && !IsWallysBag())
 1368│     {
 1369│         switch (GetSwitchBagPocketDirection())
 1370│         {
 1371│         case SWITCH_POCKET_LEFT:
 1372│             ChangeBagPocketId(&gBagPosition.pocket, tPocketSwitchDir);
 1373│             SwitchTaskToFollowupFunc(taskId);
 1374│             SwitchBagPocket(taskId, MENU_CURSOR_DELTA_LEFT, TRUE);
 1375│             return;
 1376│         case SWITCH_POCKET_RIGHT:
 1377│             ChangeBagPocketId(&gBagPosition.pocket, tPocketSwitchDir);
 1378│             SwitchTaskToFollowupFunc(taskId);
 1379│             SwitchBagPocket(taskId, MENU_CURSOR_DELTA_RIGHT, TRUE);
 1380│             return;
 1381│         }
 1382│     }
 1383│     switch (tPocketSwitchState)
 1384│     {
 1385│     case 0:
 1386│         DrawItemListBgRow(tPocketSwitchTimer);
 1387│         if (!(++tPocketSwitchTimer & 1))
 1388│         {
 1389│             if (tPocketSwitchDir == MENU_CURSOR_DELTA_RIGHT)
 1390│                 CopyPocketNameToWindow((u8)(tPocketSwitchTimer >> 1));
 1391│             else
 1392│                 CopyPocketNameToWindow((u8)(8 - (tPocketSwitchTimer >> 1)));
 1393│         }
 1394│         if (tPocketSwitchTimer == 16)
 1395│             tPocketSwitchState++;
 1396│         break;
 1397│     case 1:
 1398│         ChangeBagPocketId(&gBagPosition.pocket, tPocketSwitchDir);
 1399│         LoadBagItemListBuffers(gBagPosition.pocket);
 1400│         tListTaskId = ListMenuInit(&gMultiuseListMenuTemplate, gBagPosition.scrollPosition[gBagPosition.pocket], gBagPosition.cursorPosition[gBagPosition.pocket]);
 1401│         PutWindowTilemap(WIN_DESCRIPTION);
 1402│         PutWindowTilemap(WIN_POCKET_NAME);
 1403│         ScheduleBgCopyTilemapToVram(0);
 1404│         CreatePocketScrollArrowPair();
 1405│         CreatePocketSwitchArrowPair();
 1406│         SwitchTaskToFollowupFunc(taskId);
 1407│     }
 1408│ }
 1409│ 
 1410│ // The background of the item list is a lighter color than the surrounding menu
 1411│ // When the pocket is switched this lighter background is redrawn row by row
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ OpenContextMenu  —  item_menu.c:1540-1677 (138 l)
▌ ‖ port: _openContextMenu (src/engine/bag-screen.ts:1443-1499)  ← cite "item_menu.c:1573" @src/engine/bag-screen.ts:1471
▌ ‖ port: _openContextMenu (src/engine/bag-screen.ts:1443-1499)  ← cite "item_menu.c:1638" @src/engine/bag-screen.ts:1477
▌ ‖ port: _closeContextMenu (src/engine/bag-screen.ts:1540-1560)  ← cite "item_menu.c:1591" @src/engine/bag-screen.ts:1554
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1540-1677 ────────────────────────────────────────
 1540│ static void OpenContextMenu(u8 taskId)
 1541│ {
 1542│     switch (gBagPosition.location)
 1543│     {
 1544│     case ITEMMENULOCATION_BATTLE:
 1545│     case ITEMMENULOCATION_WALLY:
 1546│         if (GetItemBattleUsage(gSpecialVar_ItemId))
 1547│         {
 1548│             gBagMenu->contextMenuItemsPtr = sContextMenuItems_BattleUse;
 1549│             gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_BattleUse);
 1550│         }
 1551│         else
 1552│         {
 1553│             gBagMenu->contextMenuItemsPtr = sContextMenuItems_Cancel;
 1554│             gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_Cancel);
 1555│         }
 1556│         break;
 1557│     case ITEMMENULOCATION_BERRY_BLENDER_CRUSH:
 1558│         gBagMenu->contextMenuItemsPtr = sContextMenuItems_BerryBlenderCrush;
 1559│         gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_BerryBlenderCrush);
 1560│         break;
 1561│     case ITEMMENULOCATION_APPRENTICE:
 1562│         if (!GetItemImportance(gSpecialVar_ItemId) && gSpecialVar_ItemId != ITEM_ENIGMA_BERRY)
 1563│         {
 1564│             gBagMenu->contextMenuItemsPtr = sContextMenuItems_Apprentice;
 1565│             gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_Apprentice);
 1566│         }
 1567│         else
 1568│         {
 1569│             gBagMenu->contextMenuItemsPtr = sContextMenuItems_Cancel;
 1570│             gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_Cancel);
 1571│         }
 1572│         break;
 1573│     case ITEMMENULOCATION_FAVOR_LADY:
 1574│         if (!GetItemImportance(gSpecialVar_ItemId) && gSpecialVar_ItemId != ITEM_ENIGMA_BERRY)
 1575│         {
 1576│             gBagMenu->contextMenuItemsPtr = sContextMenuItems_FavorLady;
 1577│             gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_FavorLady);
 1578│         }
 1579│         else
 1580│         {
 1581│             gBagMenu->contextMenuItemsPtr = sContextMenuItems_Cancel;
 1582│             gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_Cancel);
 1583│         }
 1584│         break;
 1585│     case ITEMMENULOCATION_QUIZ_LADY:
 1586│         if (!GetItemImportance(gSpecialVar_ItemId) && gSpecialVar_ItemId != ITEM_ENIGMA_BERRY)
 1587│         {
 1588│             gBagMenu->contextMenuItemsPtr = sContextMenuItems_QuizLady;
 1589│             gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_QuizLady);
 1590│         }
 1591│         else
 1592│         {
 1593│             gBagMenu->contextMenuItemsPtr = sContextMenuItems_Cancel;
 1594│             gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_Cancel);
 1595│         }
 1596│         break;
 1597│     case ITEMMENULOCATION_PARTY:
 1598│     case ITEMMENULOCATION_SHOP:
 1599│     case ITEMMENULOCATION_BERRY_TREE:
 1600│     case ITEMMENULOCATION_ITEMPC:
 1601│     default:
 1602│         if (MenuHelpers_IsLinkActive() == TRUE || InUnionRoom() == TRUE)
 1603│         {
 1604│             if (gBagPosition.pocket == KEYITEMS_POCKET || !IsHoldingItemAllowed(gSpecialVar_ItemId))
 1605│             {
 1606│                 gBagMenu->contextMenuItemsPtr = sContextMenuItems_Cancel;
 1607│                 gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_Cancel);
 1608│             }
 1609│             else
 1610│             {
 1611│                 gBagMenu->contextMenuItemsPtr = sContextMenuItems_Give;
 1612│                 gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_Give);
 1613│             }
 1614│         }
 1615│         else
 1616│         {
 1617│             switch (gBagPosition.pocket)
 1618│             {
 1619│             case ITEMS_POCKET:
 1620│                 gBagMenu->contextMenuItemsPtr = gBagMenu->contextMenuItemsBuffer;
 1621│                 gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_ItemsPocket);
 1622│                 memcpy(&gBagMenu->contextMenuItemsBuffer, &sContextMenuItems_ItemsPocket, sizeof(sContextMenuItems_ItemsPocket));
 1623│                 if (ItemIsMail(gSpecialVar_ItemId) == TRUE)
 1624│                     gBagMenu->contextMenuItemsBuffer[0] = ACTION_CHECK;
 1625│                 break;
 1626│             case KEYITEMS_POCKET:
 1627│                 gBagMenu->contextMenuItemsPtr = gBagMenu->contextMenuItemsBuffer;
 1628│                 gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_KeyItemsPocket);
 1629│                 memcpy(&gBagMenu->contextMenuItemsBuffer, &sContextMenuItems_KeyItemsPocket, sizeof(sContextMenuItems_KeyItemsPocket));
 1630│                 if (gSaveBlock1Ptr->registeredItem == gSpecialVar_ItemId)
 1631│                     gBagMenu->contextMenuItemsBuffer[1] = ACTION_DESELECT;
 1632│                 if (gSpecialVar_ItemId == ITEM_MACH_BIKE || gSpecialVar_ItemId == ITEM_ACRO_BIKE)
 1633│                 {
 1634│                     if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE))
 1635│                         gBagMenu->contextMenuItemsBuffer[0] = ACTION_WALK;
 1636│                 }
 1637│                 break;
 1638│             case BALLS_POCKET:
 1639│                 gBagMenu->contextMenuItemsPtr = sContextMenuItems_BallsPocket;
 1640│                 gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_BallsPocket);
 1641│                 break;
 1642│             case TMHM_POCKET:
 1643│                 gBagMenu->contextMenuItemsPtr = sContextMenuItems_TmHmPocket;
 1644│                 gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_TmHmPocket);
 1645│                 break;
 1646│             case BERRIES_POCKET:
 1647│                 gBagMenu->contextMenuItemsPtr = sContextMenuItems_BerriesPocket;
 1648│                 gBagMenu->contextMenuNumItems = ARRAY_COUNT(sContextMenuItems_BerriesPocket);
 1649│                 break;
 1650│             }
 1651│         }
 1652│     }
 1653│     if (gBagPosition.pocket == TMHM_POCKET)
 1654│     {
 1655│         ClearWindowTilemap(WIN_DESCRIPTION);
 1656│         PrintTMHMMoveData(gSpecialVar_ItemId);
 1657│         PutWindowTilemap(WIN_TMHM_INFO_ICONS);
 1658│         PutWindowTilemap(WIN_TMHM_INFO);
 1659│         ScheduleBgCopyTilemapToVram(0);
 1660│     }
 1661│     else
 1662│     {
 1663│         CopyItemName(gSpecialVar_ItemId, gStringVar1);
 1664│         StringExpandPlaceholders(gStringVar4, gText_Var1IsSelected);
 1665│         FillWindowPixelBuffer(WIN_DESCRIPTION, PIXEL_FILL(0));
 1666│         BagMenu_Print(WIN_DESCRIPTION, FONT_NORMAL, gStringVar4, 3, 1, 0, 0, 0, COLORID_NORMAL);
 1667│     }
 1668│     if (gBagMenu->contextMenuNumItems == 1)
 1669│         PrintContextMenuItems(BagMenu_AddWindow(ITEMWIN_1x1));
 1670│     else if (gBagMenu->contextMenuNumItems == 2)
 1671│         PrintContextMenuItems(BagMenu_AddWindow(ITEMWIN_1x2));
 1672│     else if (gBagMenu->contextMenuNumItems == 4)
 1673│         PrintContextMenuItemGrid(BagMenu_AddWindow(ITEMWIN_2x2), 2, 2);
 1674│     else
 1675│         PrintContextMenuItemGrid(BagMenu_AddWindow(ITEMWIN_2x3), 2, 3);
 1676│ }
 1677│ 
├─ PORT src/engine/bag-screen.ts:1443-1499 ────────────────────────────────────────
 1443│ /** 1:1 décomp item_menu.c:OpenContextMenu :
 1444│  *    switch (gBagPosition.pocket) {
 1445│  *      case ITEMS_POCKET → sContextMenuItems_ItemsPocket (4 actions)
 1446│  *      case BERRIES_POCKET → sContextMenuItems_BerriesPocket (6 actions)
 1447│  *      ...
 1448│  *    }
 1449│  *  Setup les actions + display description "{ITEM} est sélectionné" + créer
 1450│  *  le window 2x2 ou 2x3 selon pocket. */
 1451│ function _openContextMenu(): void {
 1452│   const itemKey = _selectedItemKey();
 1453│   if (!itemKey || itemKey === CLOSE_BAG_KEY) return;
 1454│   const pocketKey = POCKETS[_pocketIdx].key;
 1455│   // 1:1 décomp dispatch par pocket.
 1456│   let actions: ItemAction[];
 1457│   switch (pocketKey) {
 1458│     case 'items':     actions = [...CTX_ITEMS_POCKET]; break;
 1459│     case 'keyItems':  actions = [...CTX_KEY_ITEMS_POCKET]; break;
 1460│     case 'pokeBalls': actions = [...CTX_BALLS_POCKET]; break;
 1461│     case 'tmHm':      actions = [...CTX_TMHM_POCKET]; break;
 1462│     case 'berries':   actions = [...CTX_BERRIES_POCKET]; break;
 1463│   }
 1464│   _ctxActions = actions;
 1465│   _ctxCursor = 0;
 1466│   _ctxItemKey = itemKey;
 1467│   _ctxItemPocketIdx = _pocketIdx;
 1468│   _ctxItemListIdx = _scrollOffset + _cursorPos;
 1469│   _phase = 'context_menu';
 1470│ 
 1471│   // 1:1 décomp item_menu.c:1573 OpenContextMenu → BagDestroyPocketScrollArrowPair :
 1472│   // hide chevrons pocket (LEFT/RIGHT) + flèches UP/DOWN list pendant le context
 1473│   // menu (= sinon flèches OAM rendent par-dessus la window context).
 1474│   _despawnPocketArrows();
 1475│   _despawnListScrollArrows();
 1476│ 
 1477│   // 1:1 décomp item_menu.c:1638 : description = "{ITEM} est\nsélectionné."
 1478│   // FillWindowPixelBuffer(WIN_DESCRIPTION, 0) + BagMenu_Print gText_Var1IsSelected.
 1479│   if (_descWid >= 0) {
 1480│     FillWindowPixelBuffer(_descWid, 0x00);
 1481│     const tpl = getString('gText_Var1IsSelected');  // "{STR_VAR_1} est\nsélectionné."
 1482│     const itemName = getItemNameFr(itemKey);
 1483│     const expanded = tpl.replace('{STR_VAR_1}', itemName);
 1484│     const lines = expanded.split(/\\n|\n/);
 1485│     for (let i = 0; i < Math.min(lines.length, 3); i++) {
 1486│       AddTextPrinterParameterized3(
 1487│         _descWid, FONT_NORMAL, 4, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW, lines[i],
 1488│       );
 1489│     }
 1490│     PutWindowTilemap(_descWid);
 1491│     CopyWindowToVram(_descWid, 3);
 1492│   }
 1493│ 
 1494│   // Create + draw context menu window.
 1495│   const tpl = (actions.length > 4) ? CTX_2X3_WINDOW_TEMPLATE : CTX_2X2_WINDOW_TEMPLATE;
 1496│   _ctxWid = AddWindow(tpl);
 1497│   DrawStdFrameWithCustomTileAndPalette(_ctxWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
 1498│   _drawContextMenu();
 1499│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ PrintContextMenuItemGrid  —  item_menu.c:1684-1689 (6 l)
▌ ‖ port: _drawContextMenu (src/engine/bag-screen.ts:1501-1538)  ← cite "item_menu.c:1684" @src/engine/bag-screen.ts:1502
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:1684-1689 ────────────────────────────────────────
 1684│ static void PrintContextMenuItemGrid(u8 windowId, u8 columns, u8 rows)
 1685│ {
 1686│     PrintMenuActionGrid(windowId, FONT_NARROW, 8, 1, 56, columns, rows, sItemMenuActions, gBagMenu->contextMenuItemsPtr);
 1687│     InitMenuActionGrid(windowId, 56, columns, rows, 0);
 1688│ }
 1689│ 
├─ PORT src/engine/bag-screen.ts:1501-1538 ────────────────────────────────────────
 1501│ /** Render le context menu (= 2x2 ou 2x3 grid de labels + cursor ▶).
 1502│  *  1:1 décomp item_menu.c:1684 PrintContextMenuItemGrid :
 1503│  *    PrintMenuActionGrid(windowId, FONT_NARROW, 8, 1, 56, columns, rows,
 1504│  *      sItemMenuActions, gBagMenu->contextMenuItemsPtr);
 1505│  *  → FONT_NARROW (= même que la list des items), left=8, top=1, optionWidth=56 px. */
 1506│ function _drawContextMenu(): void {
 1507│   if (_ctxWid < 0) return;
 1508│   // 1:1 décomp item_menu.c PrintContextMenuItemGrid → PrintMenuActionGrid.
 1509│   // PIXEL_FILL(1) = 0x11 (= idx 1 = cream/off-white std_menu.pal palette 15).
 1510│   // Le pixel buffer interior est opaque cream → items list BG=0 derrière reste
 1511│   // visible MAIS le context menu écrit ses tiles par-dessus à priority=0.
 1512│   FillWindowPixelBuffer(_ctxWid, 0x11);
 1513│   const cols = 2;
 1514│   const colWidth = 56;  // 1:1 décomp optionWidth = 56 px par colonne.
 1515│   const rowHeight = 16;
 1516│   for (let i = 0; i < _ctxActions.length; i++) {
 1517│     const action = _ctxActions[i];
 1518│     if (action === ItemAction.DUMMY) continue;
 1519│     const col = i % cols;
 1520│     const row = Math.floor(i / cols);
 1521│     const x = 8 + col * colWidth;
 1522│     const y = 1 + row * rowHeight;
 1523│     if (i === _ctxCursor) {
 1524│       // Cursor "▶" en couleur dark gray sur cream (= matche text).
 1525│       AddTextPrinterParameterized3(
 1526│         _ctxWid, FONT_NORMAL, x - 8, y, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW, '▶',
 1527│       );
 1528│     }
 1529│     const textKey = ACTION_TEXT_KEYS[action];
 1530│     const label = getString(textKey);
 1531│     // 1:1 décomp FONT_NARROW + COLORID_NORMAL [bg=1, fg=2, shadow=3] sur cream.
 1532│     AddTextPrinterParameterized3(
 1533│       _ctxWid, FONT_NARROW, x, y, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW, label,
 1534│     );
 1535│   }
 1536│   PutWindowTilemap(_ctxWid);
 1537│   CopyWindowToVram(_ctxWid, 3);
 1538│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ LoadBagMenuTextWindows  —  item_menu.c:2457-2475 (19 l)
▌ ‖ port: src/engine/bag-screen.ts:69 (hors fonction)  ← cite "item_menu.c:2466" @src/engine/bag-screen.ts:69
▌ ‖ port: _loadBagMenuTextWindowsCb2 (src/engine/bag-screen.ts:2461-2506)  ← cite "item_menu.c:2457" @src/engine/bag-screen.ts:2461
▌ ‖ port: _loadBagMenuTextWindowsCb2 (src/engine/bag-screen.ts:2461-2506)  ← cite "item_menu.c:2467" @src/engine/bag-screen.ts:2498
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP item_menu.c:2457-2475 ────────────────────────────────────────
 2457│ static void LoadBagMenuTextWindows(void)
 2458│ {
 2459│     u8 i;
 2460│ 
 2461│     InitWindows(sDefaultBagWindows);
 2462│     DeactivateAllTextPrinters();
 2463│     LoadUserWindowBorderGfx(0, 1, BG_PLTT_ID(14));
 2464│     LoadMessageBoxGfx(0, 10, BG_PLTT_ID(13));
 2465│     ListMenuLoadStdPalAt(BG_PLTT_ID(12), 1);
 2466│     LoadPalette(&gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
 2467│     for (i = 0; i <= WIN_POCKET_NAME; i++)
 2468│     {
 2469│         FillWindowPixelBuffer(i, PIXEL_FILL(0));
 2470│         PutWindowTilemap(i);
 2471│     }
 2472│     ScheduleBgCopyTilemapToVram(0);
 2473│     ScheduleBgCopyTilemapToVram(1);
 2474│ }
 2475│ 
├─ PORT src/engine/bag-screen.ts:2461-2506 ────────────────────────────────────────
 2461│ /** 1:1 décomp item_menu.c:2457 LoadBagMenuTextWindows :
 2462│  *      InitWindows(sDefaultBagWindows);    ← clear gWindows AND alloc new
 2463│  *      DeactivateAllTextPrinters();
 2464│  *      LoadUserWindowBorderGfx(0, 1, BG_PLTT_ID(14));
 2465│  *      LoadMessageBoxGfx(0, 10, BG_PLTT_ID(13));
 2466│  *      ListMenuLoadStdPalAt(BG_PLTT_ID(12), 1);
 2467│  *      LoadPalette(&gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
 2468│  *      for (i = 0; i <= WIN_POCKET_NAME; i++) { FillWindowPixelBuffer(i, 0); PutWindowTilemap(i); }
 2469│  *      ScheduleBgCopyTilemapToVram(0); ScheduleBgCopyTilemapToVram(1);
 2470│  *
 2471│  *  CRITIQUE : `InitWindows` clear gWindows = wipe les windows OW (map name
 2472│  *  popup, dialog leftovers) avant d'alloc les windows bag. Sans ça, les tiles
 2473│  *  OW persistent visuellement. */
 2474│ async function _loadBagMenuTextWindowsCb2(rt: ReturnType<typeof getRuntime>): Promise<void> {
 2475│   if (!rt) return;
 2476│   // 1:1 décomp : `InitWindows(sDefaultBagWindows)` reset gWindows + alloc 5
 2477│   // windows nouveaux. IDs retournés en ordre des templates.
 2478│   const ids = InitWindows([
 2479│     LIST_WINDOW_TEMPLATE,        // WIN_ITEM_LIST   (= sDefaultBagWindows[0])
 2480│     DESC_WINDOW_TEMPLATE,        // WIN_DESCRIPTION (= sDefaultBagWindows[1])
 2481│     HEADER_WINDOW_TEMPLATE,      // WIN_POCKET_NAME (= sDefaultBagWindows[2])
 2482│     ITEM_ICON_WINDOW_TEMPLATE,   // notre extra (= icon rendering via window jusqu'à port OAM)
 2483│   ]);
 2484│   _listWid = ids[0];
 2485│   _descWid = ids[1];
 2486│   _headerWid = ids[2];
 2487│   _itemIconWid = ids[3];
 2488│   // 1:1 décomp : bag sprite est OAM (= AddBagVisualSprite), PAS un window BG.
 2489│   // -1 → les anciens helpers qui checkent skipperont gracieusement.
 2490│   _spriteWid = -1;
 2491│   // 1:1 décomp : frame tiles + palette 14 à BG=0 baseTile=STD_FRAME_TILE.
 2492│   LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
 2493│   // 1:1 décomp : `LoadPalette(gStandardMenuPalette, BG_PLTT_ID(15), 32)` —
 2494│   // CRITIQUE : sans ce load, context menu + yesno + qty (= paletteNum=15)
 2495│   // rendent noir car palette 15 = all zeros.
 2496│   const stdMenuPal = await _ensureStdMenuPal();
 2497│   LoadPalette(stdMenuPal, 15 * 16, 32);
 2498│   // 1:1 décomp item_menu.c:2467 : `for (i = 0; i <= WIN_POCKET_NAME; i++) {
 2499│   //   FillWindowPixelBuffer(i, PIXEL_FILL(0)); PutWindowTilemap(i); }`.
 2500│   // → AUCUN DrawStdFrameWithCustomTileAndPalette pour header/list/desc !
 2501│   // Le fond rayé menu.bin (= BG2) fournit déjà le layout visuel "bag screen".
 2502│   FillWindowPixelBuffer(_listWid, 0x00); PutWindowTilemap(_listWid);
 2503│   FillWindowPixelBuffer(_descWid, 0x00); PutWindowTilemap(_descWid);
 2504│   FillWindowPixelBuffer(_headerWid, 0x00); PutWindowTilemap(_headerWid);
 2505│   FillWindowPixelBuffer(_itemIconWid, 0x00); PutWindowTilemap(_itemIconWid);
 2506│ }
└────────────────────────────────────────────────────────────

```
