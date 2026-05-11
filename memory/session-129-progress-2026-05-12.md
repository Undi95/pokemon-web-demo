# Session 129 — Progress 2026-05-12 (post-revert)

## TL;DR

**Refactor CB2 swap pour le sac : tenté commit `cddfcfee` → REVERT par user**.
Cause : base "en mousse" (= bugs visuels accumulés, patches incrémentaux pas
1:1 décomp). HEAD revenu à `0cc98619` via `git reset --hard`.

User exige refactor 1:1 décomp STRICT sans patches. Voir
`C:/Users/Undi/.claude/projects/D--Projet-1-pokemon-web-demo/memory/feedback-bag-refactor-foam-base.md`
pour les leçons et le pattern correct.

## État actuel (HEAD `0cc98619`)

- `src/engine/bag-screen.ts` = état pré-refactor (= bf15a954 + commit asset)
  - Toujours avec hacks : save/restore VRAM, _syncSubspriteOam hook,
    setFieldCameraSuspended
  - Fonctionnel mais pas 1:1 décomp (= OW tick en parallèle)
- `src/engine/start-menu.ts` = état pré-refactor (= sacAction avec onClose
  callback + sub-state 'bag_screen')
- `src/scenes/TestOverworldScene.ts` = état original (= statusText visible)
- Asset `public/decomp/em/interface/std_menu.pal` toujours en place

## Ce qui a été tenté + reverté

**Approach 1 (cddfcfee, reverted)** :
1. Ajout `CB2_InitBagMenu` state machine 0..20 à bag-screen.ts
2. Ajout `MainCB2_BagMenuRun`, `Task_FadeAndClose/CloseBagMenu`
3. Suppression hacks (`_syncSubspriteOam`, `setFieldCameraSuspended`, save/restore)
4. Adaptation `sacAction` pour CB2 swap (= comme optionsAction)
5. BG=1 pour context menu (= 1:1 décomp)
6. Load `gStandardMenuPalette` à BG_PLTT_ID(15)
7. Hide Phaser statusText overlay

**Bugs accumulés** :
- Map name popup window persistait dans `gWindows` → leak visuel
- Palette 15 manquante initialement → context menu noir
- Item icon palette pas reload au 2nd open → icon noir
- BG=1 vs BG=0 vs PIXEL_FILL → 3 itérations pour le context menu
- Fade timing problématique (BlendPalettes avant que toutes palettes loaded)
- Async _loadBagMenuGraphics pas 1:1 décomp state machine

## Plan refactor 1:1 (next attempt) — strict, pas de patch

### Étape A — Préparer les helpers manquants (= AVANT le refactor)

1. **`InitWindows([template1, template2, ...])` doit retourner les window IDs array**
   - Actuel : `InitWindows(templates: readonly WindowTemplate[]): void`
   - Cible : `InitWindows(templates: readonly WindowTemplate[]): number[]`
   - C'est dans `gba-window-system.ts:148`
   - Cette fonction fait déjà `FreeAllWindowBuffers()` + AddWindow x N — parfait pour notre cas

2. **Vérifier `FreeAllWindowBuffers` clean correctement gWindows** (= gba-window-system.ts:167)
   - Doit aussi nettoyer le BG tilemap VRAM des anciennes windows (= optionnel mais safer)

3. **Helper `LoadCompressedPalette(pal, slot, size)`** doit exister
   - Probable : `LoadPalette(pal, slot * 16, size)` est l'équivalent simple

### Étape B — Refactor bag-screen.ts (= big edit, atomic, pas commit avant test complet)

Pattern 1:1 décomp à respecter :

```
// 1:1 décomp item_menu.c:617 GoToBagMenu
function _gotoBagMenu(location, pocket, exitCallback) {
  // Pas d'AllocZeroed (= notre gBagMenu est implicite via _phase/_isOpen)
  _bagLocation = location;
  _pocketIdx = pocket;
  _exitCallback = exitCallback;  // = CB2_ReturnToFieldWithOpenMenu_Manual depuis sacAction
  rt.SetMainCallback2(CB2_InitBagMenu);
}

// 1:1 décomp item_menu.c:672 CB2_Bag
export function CB2_InitBagMenu() {
  // Décomp boucle while jusqu'à TRUE. Nous : 1 case par frame.
  switch (rt.gMain.state) {
    case 0:  rt.SetVBlankCallback(null);
             ClearScheduledBgCopiesToVram();  // si dispo
             rt.gMain.state++; break;
    case 1:  ScanlineEffect_Stop();           // no-op si dispo
             rt.gMain.state++; break;
    case 2:  FreeAllSpritePalettes();         // si dispo
             rt.gMain.state++; break;
    case 3:  ResetPaletteFade();
             rt.gPaletteFade.bufferTransferDisabled = true;
             rt.gMain.state++; break;
    case 4:  ResetSpriteData();
             rt.gMain.state++; break;
    case 5:  rt.gMain.state++; break;
    case 6:  ResetTasks();
             rt.gMain.state++; break;
    case 7:  _bagMenuInitBGs();   // = ResetVramOamAndBgCntRegs + BG templates
             _graphicsLoadState = 0;
             rt.gMain.state++; break;
    case 8:  if (!_loadBagMenuGraphics()) break;
             rt.gMain.state++; break;
    case 9:  _loadBagMenuTextWindows();
             rt.gMain.state++; break;
    case 10: _updatePocketItemLists() / _initPocketListPositions();
             rt.gMain.state++; break;
    case 11: _allocateBagItemListBuffers();   // = no-op si pas alloc
             rt.gMain.state++; break;
    case 12: _loadBagItemListBuffers(_pocketIdx);
             rt.gMain.state++; break;
    case 13: _printPocketNames(...) / _drawAll();
             rt.gMain.state++; break;
    case 14: _bagInputTaskId = rt.CreateTask(Task_BagMenu_HandleInput, 0);
             // ListMenuInit pour le cursor (= déjà géré par notre TickBagScreen)
             rt.gMain.state++; break;
    case 15: _spawnBagSpriteOam(_assets);    // = AddBagVisualSprite
             rt.gMain.state++; break;
    case 16: rt.gMain.state++; break;        // CreateItemMenuSwapLine (no-op)
    case 17: _spawnPocketArrows(_assets);
             _spawnListScrollArrows();
             rt.gMain.state++; break;
    case 18: rt.gMain.state++; break;        // PrepareTMHMMoveWindow (no-op)
    case 19: BlendPalettes(0xFFFFFFFF, 16, 0);
             rt.gMain.state++; break;
    case 20: rt.BeginNormalPaletteFade(0xFFFFFFFF, 0, 16, 0, 0);
             rt.gPaletteFade.bufferTransferDisabled = false;
             rt.gMain.state++; break;
    default: rt.SetVBlankCallback(VBlankCB_BagMenuRun);
             rt.SetMainCallback2(MainCB2_BagMenuRun);
             _isOpen = true;
             return;
  }
}

// 1:1 décomp item_menu.c:789 BagMenu_InitBGs
function _bagMenuInitBGs() {
  // 1:1 ResetVramOamAndBgCntRegs (= menu_helpers.c:94)
  rt.SetGpuReg(REG_DISPCNT, 0);
  rt.SetGpuReg(REG_BG3CNT, 0); rt.SetGpuReg(REG_BG2CNT, 0);
  rt.SetGpuReg(REG_BG1CNT, 0); rt.SetGpuReg(REG_BG0CNT, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const o = rt.gba.oam[i];
    o.visible = false; o.x = 0; o.y = 0;
    o.tileId = 0; o.paletteBank = 0; o.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) {
    rt.gPlttBufferUnfaded.set(i, 0);
    rt.gPlttBufferFaded.set(i, 0);
  }
  // 1:1 décomp BagMenu_InitBGs
  // memset tilemapBuffer = 0 (no-op chez nous, on n'a pas de buffer global)
  // ResetBgsAndClearDma3BusyFlags(0)
  // InitBgsFromTemplates(0, sBgTemplates_ItemMenu, 3) :
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = 0; bg0c.mapBaseIndex = 31; bg0c.screenSize = 0;
  bg0c.paletteMode = 0; bg0c.priority = 1; bg0c.visible = true;
  bg0c.hofs = 0; bg0c.vofs = 0;
  const bg1c = rt.gba.bg(1).config;
  bg1c.charBaseIndex = 0; bg1c.mapBaseIndex = 30; bg1c.screenSize = 0;
  bg1c.paletteMode = 0; bg1c.priority = 0; bg1c.visible = true;
  bg1c.hofs = 0; bg1c.vofs = 0;
  const bg2c = rt.gba.bg(2).config;
  bg2c.charBaseIndex = 3; bg2c.mapBaseIndex = 29; bg2c.screenSize = 0;
  bg2c.paletteMode = 0; bg2c.priority = 2; bg2c.visible = true;
  bg2c.hofs = 0; bg2c.vofs = 0;
  // SetBgTilemapBuffer (no-op chez nous, on écrit direct dans VRAM)
  // ResetAllBgsCoordinates
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0); // BG0HOFS/VOFS
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0); // BG2HOFS/VOFS
  // ScheduleBgCopyTilemapToVram(2) (= we do direct write)
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400); // OBJ + 1D + BG0/1/2
  ShowBg(0); ShowBg(1); ShowBg(2);
  HideBg(3);
  rt.SetGpuReg(0x50, 0); // BLDCNT = 0
}

// 1:1 décomp item_menu.c:2457 LoadBagMenuTextWindows
function _loadBagMenuTextWindows() {
  // CRITIQUE : InitWindows reset gWindows = clean slate
  const ids = InitWindows([
    SPRITE_WINDOW_TEMPLATE,
    HEADER_WINDOW_TEMPLATE,
    LIST_WINDOW_TEMPLATE,
    DESC_WINDOW_TEMPLATE,
    ITEM_ICON_WINDOW_TEMPLATE,
  ]);
  _spriteWid = ids[0]; _headerWid = ids[1];
  _listWid = ids[2]; _descWid = ids[3]; _itemIconWid = ids[4];
  // DeactivateAllTextPrinters (= clear printer state if any)
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);  // baseTile=1 in décomp, = 0x214 in our STD_FRAME_TILE
  LoadMessageBoxGfx(0, 10, 13 * 16);  // 1:1 décomp dialog frame
  // ListMenuLoadStdPalAt(BG_PLTT_ID(12), 1) (= list palette)
  // CRITIQUE : load gStandardMenuPalette à BG_PLTT_ID(15) — sans ça context menu = noir
  const stdMenu = await loadGbaPal('/decomp/em/interface/std_menu.pal');
  LoadPalette(stdMenu, 15 * 16, 32);
  for (const wid of ids) {
    FillWindowPixelBuffer(wid, 0x00);  // PIXEL_FILL(0) = transparent
    PutWindowTilemap(wid);
  }
  // ScheduleBgCopyTilemapToVram(0,1) (= we do direct)
}
```

### Étape C — Refactor sacAction (start-menu.ts)

```ts
function sacAction(): boolean {
  // 1:1 décomp StartMenuBagCallback (start_menu.c:763)
  void preloadBagAssets().then(() => {
    rt.gMain.state = 0;
    rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
    rt.SetMainCallback2(CB2_InitBagMenu);
  });
  return true;  // close start menu now
}
```

### Étape D — Test visuel state-by-state

Pour chaque case du CB2 state machine :
1. Eval `rt.gMain.state` après chaque press
2. Screenshot
3. Compare avec ROM screenshot
4. Si différence → FIX, pas continue

États critiques à vérifier :
- Après state 7 (`_bagMenuInitBGs`) : screen full black, BG configs OK
- Après state 8 (`_loadBagMenuGraphics`) : bag tiles in OBJ VRAM, BG2 fond rayé visible
- Après state 9 (`_loadBagMenuTextWindows`) : windows registered, palette 15 loaded
- Après state 13 (`_drawAll`) : tous textes visibles dans windows
- Après state 17 (chevrons) : OAM chevrons spawn + bobbing
- Après state 20 (fade): fade in started, gPaletteFade.active=true
- Après default (= MainCB2 swap): callback2=MainCB2_BagMenuRun, tasks=1

### Étape E — Cleanup hacks bag-screen.ts post-refactor

Supprimer (= obsolète avec CB2 swap proper) :
- `_setupBackgroundTilemap` + `_teardownBackgroundTilemap`
- `_savedBgState`, `_savedObjVram`, `_savedObjPalettes`, `_savedSyncSubspriteHook`
- Hook globalThis._syncSubspriteOam
- setFieldCameraSuspended calls
- `_onClose` callback
- 'bag_screen' substate in start-menu.ts (= bag drives itself maintenant)

### Étape F — Hide Phaser statusText overlay

Petit fix dans `TestOverworldScene.ts` :
```ts
this.statusText = this.add.text(4, 14, 'Loading...', { ... })
  .setDepth(100).setVisible(false);
```

Le devtool DebugOverlay green text reste pour fps/tasks.

## Règles strictes (= rappel)

1. **PAS de commit tant que rendu pas 1:1 ROM** — user a déjà revert 1 commit pour ça
2. **Test visuel après CHAQUE state du state machine**, pas en bloc à la fin
3. **Utiliser InitWindows** pour reset gWindows, pas AddWindow direct
4. **Load palette 15** dans LoadBagMenuTextWindows, pas en attente d'erreur
5. **Toutes palettes loaded AVANT BlendPalettes** (state 19)
6. **No patch incrémental** : si bug, c'est qu'on a raté un helper du décomp → vérifier item_menu.c + helpers

## Reset done

```
git log --oneline -3
0cc98619 Plan session 129 : refactor CB2 scene swap 1:1 décomp pour bag + menus
0fe45fe9 Asset : std_menu.pal copié depuis décomp
bf15a954 SAC : TMHM format final 1:1 décomp + context menu FONT_NARROW
```

HEAD `0cc98619` = état pré-refactor + plan MD. Working tree clean (sauf le
fichier session-129-progress-2026-05-12.md untracked).
