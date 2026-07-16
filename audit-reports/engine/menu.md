# AUDIT ENGINE — menu.c & menu_helpers.c (lecture seule, 2026-07-16)

Référence : `D:/Projet 1/decomps/pokeemeraude/src/menu.c` (2148 l., 123 fonctions) et
`src/menu_helpers.c` (454 l., 25 fonctions). Ports audités : `src/menu.ts` (1082 l.),
`src/menu_helpers.ts` (475 l.), `src/menu_specialized.ts` (161 l. — miroir de
menu_specialized.c, PAS de menu.c ; ne contient aucune fonction de menu.c),
plus relocalisations dans `src/window.ts` et `harness/runtime/decomp-globals.ts`.

Légende : ✅ 1:1 · 🟡 DIVERGENT · 🟠 PARTIEL/inliné/local · 🔴 STUB · ⛔ ABSENT · ⚪ NON-ATTEIGNABLE (link) · ❓ INCERTAIN.

---

## SECTION A — menu.c → menu.ts (+ window.ts / harness)

### Compteurs (101 fonctions hors-UNUSED + 22 UNUSED)

| Statut | Hors-UNUSED | Détail |
|---|---|---|
| ✅ 1:1 | **66** | dont 3 relocalisées : CreateWindowTemplate, CopyToBufferFromBgTilemap (window.ts) |
| 🟡 DIVERGENT | **9** | extensions/no-ops documentés + '▶' hardcodé |
| 🟠 PARTIEL (inliné/copie locale) | **13** | start-menu window ×3, map popup ×3, pipeline tile-data ×3, SetBgTilemapPalette, ResetBgPositions, BlitMenuInfoIcon, BufferSaveMenuText |
| 🔴 STUB local | **1** | AddTextPrinterParameterized5 |
| ⛔ ABSENT | **11** | dont DisplayItemMessageOnField, HofPCTopBar ×4 |
| ⚪ link-only | **1** | EraseFieldMessageBox |
| UNUSED (22) | 4 portés-voidés ✅, 18 absents (classe OK — jamais appelés dans la décomp) |

**Verdict A : 🟠 PARTIEL-SOLIDE.** Le noyau (frames std/dialogue, curseur, YesNo, grid,
printers P2/P3/P4, tables window) est transcrit corps-à-corps et conforme. Les manques sont
périphériques mais plusieurs ont engendré des **copies locales divergentes entre elles**
(pipeline tile-data) — c'est la vraie dette.

### Tableau par fonction (hors-UNUSED)

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| InitStandardTextBoxWindows | ✅ | 143 | menu.ts:234 | |
| FreeAllOverworldWindowBuffers | ✅ | 150 | menu.ts:241 | |
| InitTextBoxGfxAndPrinters | ✅ | 155 | menu.ts:246 | |
| RunTextPrintersAndIsPrinter0Active | ✅ | 163 | menu.ts:78 | u16→boolean, OK |
| AddTextPrinterParameterized2 | ✅ | 169 | menu.ts:88 | `useAlternateDownArrow=false` + template 1:1 |
| AddTextPrinterForMessage | ✅ | 191 | menu.ts:136 | |
| AddTextPrinterForMessage_2 | ✅ | 198 | menu.ts:143 | |
| AddTextPrinterWithCustomSpeedForMessage | ✅ | 204 | menu.ts:150 | |
| LoadMessageBoxAndBorderGfx | ✅ | 210 | menu.ts:254 | 0x200/0x214 + BG_PLTT_ID 15/14 exacts |
| DrawDialogueFrame | ✅ | 216 | menu.ts:262 | |
| DrawStdWindowFrame | ✅ | 225 | menu.ts:271 | |
| ClearDialogWindowAndFrame | ✅ | 234 | menu.ts:280 | |
| ClearStdWindowAndFrame | ✅ | 243 | menu.ts:289 | |
| WindowFunc_DrawStandardFrame | ✅ | 252 | menu.ts:298 | 9 tiles base 0x214 pal 14 — 1:1 tile par tile |
| WindowFunc_DrawDialogueFrame | ✅ | 319 | menu.ts:312 | base 0x200 pal 15, V_FLIP bas — 1:1 |
| WindowFunc_ClearStdWindowAndFrame | ✅ | 414 | menu.ts:329 | rect −1/+2 pal 14 |
| WindowFunc_ClearDialogWindowAndFrame | ✅ | 419 | menu.ts:334 | rect −3/+6 pal **14** (STD, comme le C) |
| SetStandardWindowBorderStyle | ✅ | 424 | menu.ts:341 | |
| LoadMessageBoxAndFrameGfx | ✅ | 429 | menu.ts:346 | |
| Menu_LoadStdPal | ✅ | 435 | menu.ts:457 | PLTT_SIZEOF(10)=20 octets exact |
| Menu_LoadStdPalAt | ✅ | 440 | menu.ts:462 | |
| **DisplayItemMessageOnField** | **⛔** | 457 | — | ~43 call-sites solo décomp (player_pc 12, decoration 18, item_use 7, shop 2, secret_base 3) ré-inlinés écran par écran (shop.ts:1054, item_menu.ts:2676 « DETTE ») |
| DisplayYesNoMenuDefaultYes | ✅ | 464 | menu.ts:755 | |
| DisplayYesNoMenuWithDefault | ✅ | 469 | menu.ts:760 | |
| GetPlayerTextSpeed | ✅ | 474 | menu.ts:62 | |
| GetPlayerTextSpeedDelay | ✅ | 481 | menu.ts:69 | clamp >FAST→MID 1:1 |
| AddStartMenuWindow | 🟠 | 490 | start_menu.ts:175/598 | template `(0,22,1,7,n*2+2,15,0x139)` cité et respecté, mais inliné (`sWindowId` local) — pas de foyer menu.ts |
| GetStartMenuWindowId | 🟠 | 497 | start_menu.ts:128 | id. |
| RemoveStartMenuWindow | 🟠 | 502 | start_menu.ts:448-453 | id. |
| AddMapNamePopUpWindow | 🟠 | 521 | map_name_popup.ts:373 | `AddWindow(POPUP_WINDOW_TEMPLATE)` local, garde `<0` ≈ WINDOW_NONE ; template menu.c:524 cité |
| GetMapNamePopUpWindowId | 🟠 | 528 | map_name_popup.ts | `_popupWindowId` local |
| RemoveMapNamePopUpWindow | 🟠 | 533 | map_name_popup.ts | inliné |
| AddTextPrinterWithCallbackForMessage | ✅ | 542 | menu.ts:158 | corps 1:1 ; le commentaire du port dit à tort « EXTENSION (pas une fn décomp) » — elle EST dans menu.c:542 |
| EraseFieldMessageBox | ⚪ | 548 | — | seul appelant décomp = cable_club.c:1080 (link) |
| DrawDialogFrameWithCustomTileAndPalette | ✅ | 555 | menu.ts:352 | side-channel sTileNum/sPaletteNum 1:1 |
| WindowFunc_DrawDialogFrameWithCustomTileAndPalette | ✅ | 577 | menu.ts:375 | 14 rects 1:1 |
| ClearDialogWindowAndFrameToTransparent | ✅ | 672 | menu.ts:392 | PIXEL_FILL(0) |
| WindowFunc_ClearDialogWindowAndFrameNullPalette | ✅ | 682 | menu.ts:401 | pal 0 |
| DrawStdFrameWithCustomTileAndPalette | ✅ | 687 | menu.ts:406 | |
| DrawStdFrameWithCustomTile | ✅ | 699 | menu.ts:417 | « Never used » — porté voidé |
| WindowFunc_DrawStdFrameWithCustomTileAndPalette | ✅ | 710 | menu.ts:429 | 8 rects 1:1 |
| ClearStdWindowAndFrameToTransparent | ✅ | 770 | menu.ts:441 | |
| WindowFunc_ClearStdWindowAndFrameToTransparent | ✅ | 779 | menu.ts:450 | pal 0 |
| **HofPCTopBar_AddWindow** | **⛔** | 785 | — | hall_of_fame.ts : 0 occurrence « TopBar » |
| **HofPCTopBar_Print** | **⛔** | 816 | — | id. |
| **HofPCTopBar_PrintPair** | **⛔** | 837 | — | id. |
| **HofPCTopBar_RemoveWindow** | **⛔** | 890 | — | id. |
| InitMenu | ✅ | 902 | menu.ts:534 | |
| InitMenuNormal | ✅ | 927 | menu.ts:555 | |
| RedrawMenuCursor | 🟡 | 938 | menu.ts:561 | corps 1:1 MAIS `gText_SelectorArrow3 = '▶'` **hardcodé** (menu.ts:507) au lieu de `getString` — règle no-hardcoded-strings |
| Menu_MoveCursor | ✅ | 948 | menu.ts:569 | wrap 1:1 |
| Menu_MoveCursorNoWrapAround | ✅ | 964 | menu.ts:583 | clamp 1:1 |
| Menu_GetCursorPos | ✅ | 980 | menu.ts:597 | |
| Menu_ProcessInput | ✅ | 985 | menu.ts:602 | JOY_NEW + APressMuted 1:1 |
| Menu_ProcessInputNoWrap | ✅ | 1013 | menu.ts:621 | SE seulement si bouge 1:1 |
| ProcessMenuInput_other | ✅ | 1043 | menu.ts:639 | JOY_REPEAT==DPAD_UP/DOWN 1:1 |
| Menu_ProcessInputNoWrapAround_other | ✅ | 1071 | menu.ts:658 | |
| PrintMenuActionTextsAtPos | ✅ | 1101 | menu.ts:801 | |
| PrintMenuActionTexts | ✅ | 1122 | menu.ts:808 | `printer.unk` omis (champ inexistant TS) |
| SetWindowTemplateFields | ✅ | 1154 | menu.ts:1042 | |
| CreateWindowTemplate | ✅ | 1165 | window.ts:992 | relocalisé ; **cité à tort « bg.c »** dans son commentaire |
| AddWindowParameterized | ✅ | 1172 | menu.ts:1053 | exporté (static en C) |
| CreateYesNoMenuAtPos | ✅ | 1180 | menu.ts:729 | |
| Menu_ProcessInputNoWrapClearOnChoose | ✅ | 1211 | menu.ts:765 | |
| EraseYesNoWindow | 🟡 | 1219 | menu.ts:776 | + `sYesNoWindowId = -1` (glue engine documentée pour start-menu non-1:1 — à purger) |
| PrintMenuActionGridText | ✅ | 1225 | menu.ts:852 | voidé |
| PrintMenuActionGrid | ✅ | 1242 | menu.ts:861 | y = MAX_LETTER_HEIGHT*i 1:1 |
| InitMenuGrid | ✅ | 1278 | menu.ts:892 | voidé (comme en C : seul appelant = UNUSED) |
| MoveMenuGridCursor | 🟡 | 1313 | menu.ts:916 | corps 1:1, même '▶' hardcodé |
| ChangeMenuGridCursorPosition | ✅ | 1327 | menu.ts:930 | wrap ligne/colonne + rollback >max 1:1 |
| ChangeGridMenuCursorPosition | ✅ | 1363 | menu.ts:961 | clamp 1:1 (nom inversé décomp respecté) |
| Menu_ProcessGridInput | ✅ | 1436 | menu.ts:993 | corps 1:1 ; `GetLRKeysPressed` en import dynamique différé (anti-cycle ESM documenté ; L/R inactif ~1er frame) |
| InitMenuInUpperLeftCorner | ✅ | 1557 | menu.ts:676 | |
| InitMenuInUpperLeftCornerNormal | ✅ | 1581 | menu.ts:696 | |
| PrintMenuTable | ✅ | 1586 | menu.ts:825 | x=8, y=i*16+1, fontId littéral 1 conservé |
| PrintMenuActionTextsInUpperLeftCorner | ✅ | 1596 | menu.ts:832 | |
| CreateYesNoMenu | ✅ | 1623 | menu.ts:711 | `getString('gText_YesNo')`, x=8/y=1 1:1 |
| PrintMenuGridTable | ✅ | 1648 | menu.ts:882 | |
| InitMenuActionGrid | ✅ | 1691 | menu.ts:1017 | |
| ClearScheduledBgCopiesToVram | 🟡 | 1718 | window.ts:1244 | **no-op assumé** : compositor lit les buffers chaque frame (adaptation net-effect documentée) |
| ScheduleBgCopyTilemapToVram | 🟡 | 1723 | window.ts:1235 | no-op id. ; commentaire cite « bg.c » à tort |
| DoScheduledBgTilemapCopiesToVram | ⛔ | 1728 | — | cohérent avec le no-op ; transcrit en commentaires aux call-sites (starter_choose.ts:550, pokemon_storage_system.ts:1377) |
| ResetTempTileDataBuffers | 🟡 | 1752 | window.ts:1254 | no-op + **DOUBLON local** mail.ts:1040 |
| FreeTempTileDataBuffersIfPossible | 🟠 | 1760 | mail.ts:1050, pokenav_main_menu.ts:67 | pas de foyer ; 2 copies locales `return false` (upload synchrone) |
| DecompressAndCopyTileDataToVram | 🟠 | 1780 | mail.ts:1060, pokenav_main_menu.ts:41 | pas de foyer ; **les 2 copies DIVERGENT entre elles** : pokenav ajoute `baseTile*32` (fix 2026-07-14), mail écrit à `charBase*0x4000` brut |
| DecompressAndLoadBgGfxUsingHeap | 🟠 | 1798 | easy_chat.ts:805 | local : `LoadBgTiles` direct (asset pré-décompressé) ; pas de task free-buf |
| task_free_buf_after_copying_tile_data_to_vram | ⛔ | 1812 | — | mécanisme malloc/DMA non émulé (adaptation GC/copies synchrones) |
| malloc_and_decompress | ⛔ | 1821 | — | assets pré-décompressés (exemption INCBIN) |
| copy_decompressed_tile_data_to_vram | ⛔ | 1838 | — | id. |
| SetBgTilemapPalette | 🟠 | 1851 | pokemon_summary_screen.ts:677 | local `_setBgTilemapPalette`, corps équivalent (`&0x0FFF | pal<<12`) mais écrit dans les buffers écran, pas GetBgTilemapBuffer |
| CopyToBufferFromBgTilemap | ✅ | 1866 | window.ts:1186 | relocalisé ; stride 32 documenté |
| AddValToTilemapBuffer | ⛔ | 1879 | — | contourné (pokedex_area_region_map.ts:50 « offset 0 = no-op ») |
| ResetBgPositions | 🟠 | 1898 | pokenav_main_menu.ts:84 | copie locale ; pas de foyer menu.ts |
| BgDmaFill | 🟡 | 1910 | harness/runtime/decomp-globals.ts:345 | RequestDma3Fill→LoadBgTiles sync ; **paletteMode ignoré** (32 o/tile fixe vs `?64:32` C), baseTile supposé 0 — divergence documentée dans son propre commentaire |
| AddTextPrinterParameterized3 | 🟡 | 1917 | menu.ts:103 | corps 1:1 + **EXTENSION** `speed<0 → GetPlayerTextSpeedDelay()` (documentée ⚠️ ; inoffensive pour les appels décomp qui passent 0xFF) |
| AddTextPrinterParameterized4 | 🟡 | 1938 | menu.ts:120 | même extension |
| **AddTextPrinterParameterized5** | **🔴** | 1959 | pokemon_storage_system.ts:125 | stub local qui **JETTE letterSpacing/lineSpacing/callback/speed** (retombe sur AddTextPrinterParameterized speed 0) ; étiqueté à tort « text.c » ; menu.ts:848 le note « DIFFÉRÉ » |
| **PrintPlayerNameOnWindow** | **⛔** | 1981 | — | script_menu.ts:239 le mentionne en commentaire (multichoice) |
| ListMenuLoadStdPalAt | ✅ | 2077 | menu.ts:1061 | switch 3 palettes 1:1 |
| BlitMenuInfoIcon | 🟠 | 2098 | item_menu.ts:1391 | copie locale, calcul srcX/srcY équivalent au `offset*32` du C ; dépend de `_bagAssets` local |
| BufferSaveMenuText | 🟠 | 2103 | start_menu.ts:400-430 | inliné partiel (compte Pokédex/badges/temps recodés à l'identique logique) mais **codes couleur EXT_CTRL_CODE_COLOR/SHADOW non émis** et pas de fonction réutilisable (5 call-sites décomp start_menu.c:1358-1388) |

**UNUSED (22)** : portés-voidés ✅ = Menu_GetStdPal (:467), Menu_GetStdPalColor (:473),
DrawDialogFrameWithCustomTile (:363), CreateYesNoMenuInTopLeft (:749). Absents (18, classe
OK) : GetDialogFrameBaseTileNum, GetStandardFrameBaseTileNum, HofPCTopBar_CopyToVram,
HofPCTopBar_Clear, InitMenuDefaultCursorHeight, PrintMenuActionTextsWithSpacing,
PrintMenuActionTextsAtTop(ById), InitMenuGridDefaultCursorHeight,
Menu_ProcessGridInput_NoSoundLimit, Menu_ProcessGridInputRepeat(_NoSoundLimit),
PrintMenuActionGridTextAtTop, PrintMenuActionGrid_TopLeft, PrintMenuActionGridTextNoSpacing,
UnusedBlitBitmapRect, LoadMonIconPalAtOffset, DrawMonIconAtPos.

### 📌 Note mission — flèches de scroll (AddScrollIndicatorArrowPair & co)

Elles ne sont **PAS dans menu.c** : foyer décomp = `list_menu.c:997-1176`. Port foyer =
`src/list_menu.ts:1417-1631` — corps 1:1-adaptés (SpriteCallback sinus `*mult/256` trunc,
Task_ScrollIndicatorArrowPair seuils fullyUp/Down & 0xFFFF, Parameterized remplit
gTempScrollArrowTemplate, Remove libère tiles/pal par tag + DestroySprite + DestroyTask).
Adaptations documentées : CreateSpriteAtOam au lieu de CreateSprite(template) + frame
appliquée statiquement (hFlip/vFlip) + normalisation task obj|id. **Utilisé par** :
item_menu.ts (:1323/:1332), main_menu.ts (:1534). **Réinvention parallèle ENCORE LIVE** :
`src/engine/bag/bag-screen.ts:1125-1290` (`_spawnPocketArrows`/`_despawnPocketArrows` +
callback local) — bag-screen est encore chargé par battle_controller_player.ts:2059,
harness/main.ts:93, player_pc.ts:621. Les flèches Pokénav (match call) = `pokenav_list.c`,
système distinct, hors menu.c/list_menu.c. **shop.ts n'appelle pas le foyer** alors que
shop.c utilise AddScrollIndicatorArrowPairParameterized (cf. orphelins).

---

## SECTION B — menu_helpers.c → menu_helpers.ts (+ window.ts)

### Compteurs (25 fonctions)

| Statut | N | Fonctions |
|---|---|---|
| ✅ 1:1 | **14** | dont 2 relocalisées window.ts (ResetVramOamAndBgCntRegs, ResetAllBgsCoordinates) |
| 🟡 DIVERGENT | **9** | 4 link-effondrés + 4 swap-line adaptés + LoadListMenuSwapLineGfx |
| ⚪ link-only | **1** | IsActiveOverworldLinkBusy (static absorbé) |
| ⛔ ABSENT | **1** | SetVBlankHBlankCallbacksToNull |

**Verdict B : 🟡 BON.** Logique liste/curseur/quantité/YesNo-callbacks/message-continuation
= 1:1 corps-à-corps. Les 🟡 link sont inoffensifs en solo (conditions toujours fausses)
mais les corps ne sont plus transcrits. 2 vraies dettes : fuite ressources swap-line,
SetVBlankHBlankCallbacksToNull absent.

### Tableau par fonction

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| ResetVramOamAndBgCntRegs | ✅ | 94 | window.ts:960 | net-effect 1:1 (DISPCNT/BGxCNT=0 + clear VRAM/OAM/PLTT buffers + RAM hw) ; relocalisé |
| ResetAllBgsCoordinates | ✅ | 106 | window.ts:981 | relocalisé |
| **SetVBlankHBlankCallbacksToNull** | **⛔** | 118 | — | call-sites en commentaires : shop.ts:486, item_menu.ts:589, bag-screen.ts:3066 |
| DisplayMessageAndContinueTask | ✅ | 124 | menu_helpers.ts:311 | `str !== gStringVar4` + canABSpeedUpPrint + reroute task 1:1 |
| RunTextPrintersRetIsActive | ✅ | 138 | menu_helpers.ts:297 | |
| Task_ContinueTaskAfterMessagePrints | ✅ | 144 | menu_helpers.ts:303 | |
| DoYesNoFuncWithChoice | ✅ | 150 | menu_helpers.ts:267 | |
| CreateYesNoMenuWithCallbacks | ✅ | 156 | menu_helpers.ts:276 | 3 params unused conservés |
| Task_CallYesOrNoCallback | ✅ | 163 | menu_helpers.ts:251 | case 0 / 1|B 1:1 |
| AdjustQuantityAccordingToDPadInput | ✅ | 180 | menu_helpers.ts:91 | restructuré (lecture JOY_REPEAT unique vs 4 macros) — sémantique par frame identique ; `s16*` → IntRef |
| GetLRKeysPressed | ✅ | 252 | menu_helpers.ts:119 | |
| GetLRKeysPressedAndHeld | ✅ | 265 | menu_helpers.ts:129 | |
| IsHoldingItemAllowed | 🟡 | 278 | menu_helpers.ts:144 | corps effondré `return true` (Enigma Berry/Trade Center/UnionRoom toujours faux solo — documenté ; à re-transcrire si link) |
| IsWritingMailAllowed | 🟡 | 290 | menu_helpers.ts:151 | `if (false && ItemIsMail(itemId))` — id. |
| MenuHelpers_IsLinkActive | 🟡 | 298 | menu_helpers.ts:161 | `return false` — id. |
| IsActiveOverworldLinkBusy | ⚪ | 306 | — | static absorbé par le false |
| MenuHelpers_ShouldWaitForLinkRecv | 🟡 | 314 | menu_helpers.ts:166 | `return false` — id. |
| SetItemListPerPageCount | ✅ | 322 | menu_helpers.ts:176 | out-params `u8*` → retour `{pageItems,totalItems}` ; corps 1:1 (+1 ANNULER, clamp) |
| SetCursorWithinListBounds | ✅ | 343 | menu_helpers.ts:190 | ListPos muté 1:1 |
| SetCursorScrollWithinListBounds | ✅ | 357 | menu_helpers.ts:205 | 2 branches parité 1:1 |
| LoadListMenuSwapLineGfx | 🟡 | 393 | menu_helpers.ts:394 | adaptation INCBIN : clés assetCache `__swapLine*` (preload async requis) + LoadSpritePalette (vs LoadCompressedSpritePalette — data non compressée) |
| CreateSwapLineSprites | 🟡 | 399 | menu_helpers.ts:405 | CreateSpriteAtOam + setSpriteAnims/StartSpriteAnim au lieu de CreateSprite(&sSpriteTemplate_SwapLine) ; + param `baseIdx` (arithmétique pointeur `&spriteIds[n]`) ; anims 0/1 et invisible=true 1:1 |
| DestroySwapLineSprites | 🟡 | 413 | menu_helpers.ts:435 | **MANQUE `DestroySpriteAndFreeResources` sur le DERNIER sprite** (C:419-420) → sheet+palette tag 109 jamais libérés (fuite slots) |
| SetSwapLineSpritesInvisibility | 🟡 | 426 | menu_helpers.ts:446 | ajoute `count & ~SWAP_LINE_HAS_MARGIN` + guards NONE — absent du C (défensif, comportement identique pour les appels décomp) |
| UpdateSwapLineSpritesPos | ✅ | 434 | menu_helpers.ts:462 | hasMargin → dernier à x−8 ; `y = 1 + y` 1:1 |

---

## 🚨 MANQUES CRITIQUES

1. **`DisplayItemMessageOnField` (menu.c:457) ⛔** — LA primitive message-objet overworld,
   ~43 call-sites solo décomp. Chaque écran porté la ré-inline (shop.ts:1054 flow manuel,
   item_menu.ts:2676 marqué « DETTE », player_pc.ts ~12 refs en commentaires). 3 lignes à
   transcrire au foyer menu.ts (LoadMessageBoxAndBorderGfx + DisplayMessageAndContinueTask
   déjà portés) puis re-câbler.
2. **`AddTextPrinterParameterized5` (menu.c:1959) 🔴** — stub local PSS qui jette
   letterSpacing/lineSpacing/speed/callback : tout texte du PC storage passant par lui peut
   diverger au pixel. Le foyer menu.ts est trivial (template + AddTextPrinter).
3. **Famille `HofPCTopBar_*` (menu.c:785-900) + sHofPC_TopBar_Pal + sTextColors ⛔** —
   le bandeau contrôles/équipe du Hall of Fame PC (contenu solo) n'existe pas.
4. **Pipeline tile-data sans foyer** (`DecompressAndCopyTileDataToVram` /
   `FreeTempTileDataBuffersIfPossible` / `DecompressAndLoadBgGfxUsingHeap`,
   menu.c:1760-1849) — 3 copies locales dont 2 **divergentes entre elles** (pokenav ajoute
   baseTile, mail non) : le prochain écran copiera le mauvais modèle.
5. **`SetVBlankHBlankCallbacksToNull` (menu_helpers.c:118) ⛔** + **fuite
   `DestroySwapLineSprites`** (pas de FreeResources sur le dernier sprite → tags 109
   accumulés à chaque sortie de swap).
6. Secondaires : `BufferSaveMenuText` (couleurs non émises), `PrintPlayerNameOnWindow`,
   `AddValToTilemapBuffer`, `DoScheduledBgTilemapCopiesToVram` (OK si le no-op reste le
   contrat moteur, à documenter au foyer).

## DONNÉES / TABLES

| Donnée | Statut | Port | Détail |
|---|---|---|---|
| gStandardMenuPalette (C:75) | ✅ | menu.ts:227 + preloadStdMenuPalette :484 | INCGFX → assetCache (adaptation INCBIN) |
| sTextSpeedFrameDelays (C:77) | ✅ | menu.ts:54 | 8/4/1 |
| sStandardTextBox_WindowTemplates (C:84) | ✅ | menu.ts:213 | (2,15,27×4,pal15,0x194)+DUMMY |
| sYesNo_WindowTemplates (C:98) | ✅ | menu.ts:220 | (21,9,5×4,pal15,0x125) |
| sHofPC_TopBar_Pal (C:109) | ⛔ | — | avec la famille HofPC |
| sTextColors (C:110) | ⛔ | — | id. |
| sMenuInfoIcons (C:113) | 🟡 | item_menu.ts:~1340 | table locale **RÉINDEXÉE** (via _TYPE_NAME_TO_ICON_IDX ; offsets identiques pour les 18 types + TYPE/POWER/ACC/PP) mais **manque [23] EFFECT (0xE8, unused), [24] BALL_RED (0xAE), [25] BALL_BLUE (0xAF)** — requis par decoration.c:930-932 (solo) |
| sMenu (C:65) | ✅ | menu.ts:526 | struct complet 12 champs |
| sTileNum/sPaletteNum (C:66-67) | ✅ | menu.ts:203-204 | |
| sStartMenuWindowId/sMapNamePopupWindowId (C:63-64) | 🟡 | menu.ts:207-208 | déclarés mais **INERTES** (voidés « lus en V4 ») — les vrais IDs vivent en doublon local dans start_menu.ts:128 / map_name_popup.ts |
| sYesNoWindowId (C:68) | 🟡 | menu.ts:708 | init `-1` sentinel engine (C init 0) — glue documentée pour start-menu non-porté |
| sScheduledBgCopiesToVram / sTempTileDataBuffer(+Idx) (C:71-73) | ⛔ | — | mécanisme remplacé par no-op/copies synchrones |
| B: sOamData/sAnims/sSpriteSheet/sSpritePalette/sSpriteTemplate_SwapLine (C:30-91) | 🟡 | menu_helpers.ts:339-373 | adaptés registerExtraAnim + CreateSpriteAtOam ; **anim [2] LeftArrow (hFlip) non enregistrée** (documenté « activable plus tard » — consommateur = PC item storage StartSpriteAnim(..,2)) |
| B: sYesNo / sMessageWindowId / sMessageNextTask (C:25-28) | ✅ | menu_helpers.ts:247/293-294 | |

## RUSTINES À PURGER (après fix moteur/foyer)

1. `pokemon_storage_system.ts:125` — stub AddTextPrinterParameterized5 → foyer menu.ts.
2. `item_menu.ts:1340-1403` — sMenuInfoIcons réindexée + BlitMenuInfoIcon local → foyer
   menu.ts avec la table décomp complète (indices TYPE_+1 réels + BALL_RED/BLUE).
3. `mail.ts:1036-1082` + `pokenav_main_menu.ts:38-69` + `easy_chat.ts:805-811` — copies
   locales du pipeline tile-data → foyer unique avec la sémantique baseTile 1:1 (bg.c:382).
4. `pokemon_summary_screen.ts:677` `_setBgTilemapPalette` → foyer SetBgTilemapPalette.
5. `pokenav_main_menu.ts:84` ResetBgPositions local → foyer menu.ts.
6. `engine/bag/bag-screen.ts:1125-1290` — flèches scroll maison (doublon live de
   list_menu.ts) ; à dissoudre avec la migration bag-screen→item_menu.
7. `menu.ts:507` `gText_SelectorArrow3 = '▶'` hardcodé → getString.
8. `menu.ts:103/:120` extension `speed<0` P3/P4 → appelants field-message-box explicites.
9. `menu.ts:708/779` sentinel sYesNoWindowId=-1 → à retirer au port 1:1 de start_menu.c
   (documenté dans le code).
10. `menu_helpers.ts:449` masque HAS_MARGIN ajouté dans SetSwapLineSpritesInvisibility.
11. Citations fausses à corriger en passant : window.ts:990 « bg.c » (=menu.c:1165),
    window.ts:1231 « bg.c » (=menu.c:1723), mail.ts:1037 « bg.c » (=menu.c:1752+),
    pokemon_storage_system.ts:124 « text.c » (=menu.c:1959), menu.ts:156 « EXTENSION »
    (=menu.c:542 réelle).
12. Hors périmètre strict mais même règle : `menu_specialized.ts:57` sLvlUpStatStrings
    hardcodées FR → getString.

## CALL-SITES ORPHELINS (décomp appelle, port sans foyer)

- **DisplayItemMessageOnField** : item_use.c(7)/player_pc.c(12)/shop.c(2)/decoration.c(18)/
  secret_base.c(3) → ports inlinés ou à venir (decoration/secret_base menus).
- **AddScrollIndicatorArrowPairParameterized** : shop.c (buy menu) → `shop.ts` n'appelle
  pas le foyer list_menu.ts (flèches boutique à vérifier/câbler) ; player_pc.ts:1765
  (RemoveScrollIndicator en commentaire de flow).
- **BlitMenuInfoIcon BALL_RED/BLUE** : decoration.c:930-932 → decoration.ts : 0 occurrence.
- **HofPCTopBar_*** : hall_of_fame.c → hall_of_fame.ts : 0 occurrence.
- **SetVBlankHBlankCallbacksToNull / ClearScheduledBgCopiesToVram** : ~15 écrans décomp →
  transcrits en commentaires (shop.ts:486, item_menu.ts:589, bag-screen.ts:3066…).
- **BufferSaveMenuText** : start_menu.c:1358-1388 (5 appels) → inline partiel
  start_menu.ts ; hall_of_fame.c → non câblé.
- **AddItemMenuActionTextPrinters** (mission « ? ») : n'existe PAS dans la décomp (0 hit).
  **CreateMonIconNoPersonality** : foyer décomp = pokemon_icon.c (hors menu.c).
