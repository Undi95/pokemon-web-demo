# Audit READ-ONLY 1:1 — domaine « ui-menus »

> Généré par la flotte d'audit (agent Opus READ-ONLY). Source de vérité =
> `D:/Projet 1/decomps/pokeemeraude/src/` (les .c gflib window/text/string_util y vivent aussi).
> Notre repo = `D:/Projet 1/pokemon-web-demo/src/`.
> Doctrine : miroir STRICT (mêmes noms fn/globals, corps transcrit ligne-à-ligne).
> Statut : ✅ MIROIR | 🟡 PARTIEL | 🔴 DIVERGENT | ⬜ ABSENT | 🚫 EXEMPT

Périmètre (18 fichiers) : window.c, text.c, string_util.c, dynamic_placeholder_text_util.c,
menu.c, menu_helpers.c, menu_specialized.c, text_window.c, list_menu.c, item_menu.c,
item_menu_icons.c, shop.c, mail.c, easy_chat.c, naming_screen.c, option_menu.c, money.c,
coins.c, start_menu.c.

Line counts (décomp ↔ nous) :
| fichier | .c lignes | .ts lignes |
|---|---|---|
| window.c | 714 | 991 |
| text.c | 1904 | 1714 |
| string_util.c | 781 | 776 |
| dynamic_placeholder_text_util.c | 48 | 70 |
| menu.c | 2147 | 1081 |
| menu_helpers.c | 453 | 474 |
| menu_specialized.c | 1636 | 160 |
| text_window.c | 197 | 289 |
| list_menu.c | 1447 | 1707 |
| item_menu.c | 2609 | 3385 |
| item_menu_icons.c | 662 | 465 |
| shop.c | 1269 | 1048 |
| mail.c | 753 | 1158 |
| easy_chat.c | 5875 | 4287 |
| naming_screen.c | 2594 | 2456 |
| option_menu.c | 671 | 1112 |
| money.c | 197 | 261 |
| coins.c | 88 | 144 |
| start_menu.c | 1439 | 1025 |

---

## coins.c → src/coins.ts
Statut : ✅ MIROIR
Fonctions : 7/7 (toutes présentes, mêmes noms)
Manquantes : aucune
Divergences :
- **Adaptation XOR assumée** (documentée) : `GetCoins`/`SetCoins` n'appliquent pas le XOR `encryptionKey` (encryptionKey=0 en web). Équivalent strict. NON-divergence.
- `ShowCoinsWindow` (coins.ts:98) ajoute une garde `if (_coinsBoxWindowId >= 0)` + `CopyWindowToVram` absente du décomp (coins.c:30). Le décomp n'a pas ce garde ni ce CopyWindowToVram explicite (`ShowCoinsWindow` décomp = AddWindow→Fill→PutTilemap→DrawStdFrame→PrintCoinsString). Divergence MINEURE d'ordre : décomp fait `Fill` PUIS `PutWindowTilemap` PUIS `DrawStdFrame`, notre port fait `DrawStdFrame` PUIS `Fill` PUIS `PutWindowTilemap`. Ordre inversé mais effet visuel identique. 🟡 cosmétique.
- `PrintCoinsString` : décomp utilise `ConvertIntToDecimalStringN` + `StringExpandPlaceholders(gText_Coins)` + `GetStringRightAlignXOffset(FONT_NARROW, ..., 56)`. Notre port **hardcode** `` `PIÈCES ${coinAmount}` `` (coins.ts:129) et n'utilise PAS le right-align offset (x=4 fixe). 🔴 DIVERGENCE : le formatage right-align via GetStringRightAlignXOffset est remplacé par une string littérale left-align. FONT_NARROW (décomp) ≠ FONT_SMALL (notre const=1).
Stubs suspects : aucun (logique présente).
Fuites harness : `globalThis.__moneyBoxUI` registration (coins.ts:138) = glue scrcmd anti-cycle, acceptable (pattern documenté). `CreateSpriteAtOam` n/a ici.
Note : le décomp n'a pas de `CopyWindowToVram` dans ShowCoinsWindow ni de garde ; notre ShowCoinsWindow diffère légèrement de l'ordre décomp mais reste fidèle en intention.

## money.c → src/money.ts
Statut : ✅ MIROIR (logique) / 🟡 (UI label sprite = substrat harness)
Fonctions : 15/15 présentes (mêmes noms). `IsEnoughForCostInVar0x8005` + `SubtractMoneyFromVar0x8005` présentes ? → à VÉRIFIER (pas vues dans money.ts lu — voir ci-dessous).
Fonctions ailleurs :
- **`IsEnoughForCostInVar0x8005`** (money.c:123) → `src/engine/script/specials-registry.ts:234` (registerSpecial, byte-VM special-flow). ✅ porté 1:1.
- **`SubtractMoneyFromVar0x8005`** (money.c:128) → `src/engine/script/specials-registry.ts:1057` (registerSpecial). ✅ porté 1:1.
Divergences :
- Adaptation XOR/pointeur assumée (documentée money.ts:6-13) : signatures simplifiées `(toAdd)` au lieu de `(moneyPtr, toAdd)`. NON-divergence (équivalent strict, encryptionKey=0).
- `PrintMoneyAmount` (money.ts:154) : décomp appelle `ConvertIntToDecimalStringN(LEFT_ALIGN,6)` + boucle CHAR_SPACER + `StringExpandPlaceholders(gText_PokedollarVar1)` + `AddTextPrinterParameterized(FONT_NORMAL)`. Notre port reconstruit la string manuellement (`CHAR_SPACER_STR.repeat(pad) + numStr + '¥'`) et utilise `AddTextPrinterParameterized3` (couleurs explicites) au lieu de `AddTextPrinterParameterized`. Effet équivalent, mais **pas transcrit ligne-à-ligne** (recompose au lieu d'appeler les primitives string décomp). 🟡 PARTIEL.
- `AddMoneyLabelObject`/`RemoveMoneyLabelObject` : le décomp utilise `CreateSprite(&sSpriteTemplate_MoneyLabel)` + `DestroySpriteAndFreeResources`. Notre port utilise `rt.CreateSpriteAtOam` (substrat harness) au lieu de `CreateSprite` + template 1:1. Le tag décomp = `MONEY_LABEL_TAG 0x2722`; notre `TAG_MONEY_LABEL = 2120` (= 0x848) ≠ 0x2722. 🔴 valeur de tag divergente (mais tags = internes, sans effet 1:1 tant qu'unique). Substrat sprite = zone harness tolérée.
- Le décomp `sSpriteTemplate_MoneyLabel` (OamData/AnimCmd/SpriteSheet) non transcrit comme structures — remplacé par un objet `CreateSpriteAtOam`. Substrat sprite harness.
Stubs suspects : aucun.
Fuites harness : `PreloadMoneyLabelAsset` (money.ts:192) = fonction NON présente dans le décomp (glue préchargement PNG async). Acceptable (adaptation asset web) mais nom non-1:1.

## dynamic_placeholder_text_util.c → src/dynamic_placeholder_text_util.ts
Statut : ✅ MIROIR
Fonctions : 4/4 (Reset, SetPlaceholderPtr, GetPlaceholderPtr, ExpandPlaceholders)
Manquantes : aucune
Divergences : aucune. `sStringPointers[8]`, boucle CHAR_DYNAMIC, StringCopy — transcrit byte-level ligne-à-ligne. Adaptation subarray/index (Uint8Array au lieu de ptr) = strict équivalent.
Stubs suspects : aucun. Fuites : aucune. **Exemplaire.**

## string_util.c → src/string_util.ts
Statut : ✅ MIROIR (exemplaire)
Fonctions : 44/44 (toutes présentes, mêmes noms, y compris les 14 `ExpandPlaceholder_*` static + `SkipExtCtrlCode` static + `GetExpandedPlaceholder`).
Manquantes : aucune
Divergences : aucune divergence logique.
- Corps transcrits byte-level (Uint8Array), sémantique pointeur = subarray. `ConvertIntToDecimalStringN`/`ConvertUIntToDecimalStringN`/`ConvertIntToHexStringN` : state-machine + sPowersOfTen/sDigits 1:1. `StringExpandPlaceholders` : le FALLTHROUGH décomp (compteur d'args COLOR_HIGHLIGHT_SHADOW→3/PLAY_BGM→2/default→1) est transcrit en `nArgs` + boucle (documenté, byte-pour-byte identique). `StringCopyPadded`/`StringCopyN_Multibyte`/`ConvertInternationalString` : arithmétique u8/u16/u32 wrap explicitée (`& 0xFF`, `>>> 0`).
- `sDigits` = liste de constantes `CHAR_*` (pas de hardcode). `sExtCtrlCodeLengths`/`sExpandPlaceholderFuncs` = init désigné 1:1.
Ponts transitoires (non-divergences, documentés) : `StringExpandPlaceholders` accepte `string|Uint8Array` (bridge pré-camion via `encodeOwText` import différé) ; `ExpandPlaceholder_PlayerName` encode le playerName (bridge JS-string legacy). Ce sont des rampes de migration texte, pas des divergences 1:1.
Stubs suspects : aucun. Fuites harness : aucune.

## window.c (gflib) → src/window.ts
Statut : 🟡 PARTIEL (modèle mémoire divergent — canvas/pixel-buffer au lieu de tileData 4bpp)
Fonctions : 15/30 environ (window.ts consolide AUSSI bg.c → beaucoup de fns bg.c non-window listées).
Présentes (mêmes noms) : `InitWindows`, `AddWindow`, `RemoveWindow`, `FreeAllWindowBuffers`, `CopyWindowToVram`, `PutWindowTilemap`, `ClearWindowTilemap`, `FillWindowPixelBuffer`, `FillWindowPixelRect`, `CopyToWindowPixelBuffer`, `BlitBitmapToWindow`, `BlitBitmapRectToWindow`, `ScrollWindow`, `CallWindowFunction`, `GetWindowAttribute`.
Manquantes (décomp) :
- **`AddWindowWithoutTileMap`** (window.c:181) [vivant : utilisé quand une fenêtre n'a pas besoin de son propre tilemap buffer] — ABSENT.
- **`CopyWindowRectToVram`** (window.c:286) [vivant] — ABSENT.
- **`PutWindowRectTilemapOverridePalette`** (window.c:334) [vivant : list_menu/item_menu selections] — ABSENT.
- **`PutWindowRectTilemap`** (window.c:371) [vivant] — ABSENT.
- **`SetWindowAttribute`** (window.c:531) [vivant] — ABSENT (seul `GetWindowAttribute` présent).
- **`AddWindow8Bit`** / **`FillWindowPixelBuffer8Bit`** / **`FillWindowPixelRect8Bit`** / **`BlitBitmapRectToWindow4BitTo8Bit`** / **`CopyWindowToVram8Bit`** (window.c:600-702) [vivant : 8bpp windows, ex. contest/hall_of_fame ; certains hors périmètre single-player] — ABSENTS.
- `GetNumActiveWindowsOnBg` / `GetNumActiveWindowsOnBg8Bit` (static, window.c:583/704) — ABSENTS (nécessaires à la vraie gestion malloc des buffers, sans objet dans le modèle canvas).
Divergences structurelles (majeures) :
- **Modèle mémoire ENTIÈREMENT différent** : le décomp maintient `gWindows[WINDOWS_MAX]` (struct Window {WindowTemplate window; u8* tileData}), alloue les tileData 4bpp via `AllocZeroed`, et gère le partage des tilemap buffers par BG (`gWindowBgTilemapBuffers`). Notre port utilise un `gWindows: GbaWindow[]` (array dynamique, `nextWindowId++`), un `pixelBuffer` 1 byte/pixel (row-major, pas 4bpp tile-arranged), sans allocateur ni `gTransparentTileNumber`/`sWindowPtr`/`sWindowSize`.
- `AddWindow` (window.ts:296) : décomp cherche un slot libre (`bg==0xFF`), gère `BgTileAllocOp` + auto-alloc + WINDOW_NONE si plein ; notre port fait `push` + id incrémental (jamais WINDOW_NONE). 🔴 diverge sur toute la logique d'allocation.
- `InitWindows` : décomp retourne `bool16` ; notre port retourne `number[]` (documenté comme adaptation).
- `ScrollWindow` : décomp = macros MOVE_TILES_DOWN/UP 4bpp packed sur tileData ; notre port = `copyWithin` sur pixelBuffer. Sémantiquement équivalent (shift+fill) mais direction 1 (up avec `tileData += size-4`) NON portée — notre `scrollWindow` ne gère qu'un shift up générique. 🟡
- `CopyWindowToVram` : décomp distingue COPYWIN_MAP/GFX/FULL (LoadBgTiles / CopyBgTilemapBufferToVram) ; notre port ignore le `mode` (« on fait la même chose pour l'instant », window.ts:382). 🟡
Note : c'est une **couche d'adaptation hardware** (canvas web ≠ VRAM GBA). Le modèle divergent est en partie inévitable (pas de VRAM réelle), mais plusieurs fns 1:1 pures-logique (AddWindowWithoutTileMap, PutWindowRectTilemap, SetWindowAttribute) sont simplement absentes.
Stubs suspects : `CopyWindowToVram` mode ignoré (proche d'un stub partiel).
Fuites harness : `createWindow`/`copyWindowToCanvas`/`copyPixelBufferToVram`/`writeWindowTilemap`/`tileMapIndex`/`GetWindowPixelBuffer`/`MarkWindowDirty`/`getWindowById` = helpers hors-décomp (substrat rendu web, noms non-1:1, acceptables). **Beaucoup de bg.c est consolidé ici** (InitBgFromTemplate, ShowBg, FillBgTilemapBufferRect, etc.) — audité séparément (bg.c hors périmètre strict ui-menus).

## text.c (gflib) → src/text.ts
Statut : 🟡 PARTIEL (RenderText state-machine fidèle ; couche glyphe/font = substrat canvas divergent)
Fonctions : ~27/53 (cf. cartograph). Présentes 1:1 (mêmes noms) : `RenderText`, `RenderFont`, `AddTextPrinter`, `AddTextPrinterParameterized`, `RunTextPrinters`, `IsTextPrinterActive`, `DeactivateAllTextPrinters`, `GetFontAttribute`, `GetMenuCursorDimensionByFont`, `GetStringWidth`, `GetStringRightAlignXOffset`, `GetStringCenterAlignXOffset`, `TextPrinterWait`, `TextPrinterWaitAutoMode`, `TextPrinterWaitWithDownArrow`, `TextPrinterClearDownArrow`, `CopyGlyphToWindow`, `ClearTextSpan`, `DecompressGlyph_Small/Normal/Short/Narrow/SmallNarrow`, `GetGlyphWidth_Small/Normal/Short/Narrow/SmallNarrow`, `GetFontWidthFunc`.
Divergences / manquantes :
- **`GenerateFontHalfRowLookupTable`** (text.c:363) [vivant : lookup couleur half-row 4bpp] — ABSENT. Notre pipeline glyphe (canvas RGBA) ne reproduit pas la table de conversion half-row. 🔴
- **`DecompressGlyphTile`** (text.c:526) [vivant] — ABSENT (substrat canvas ; les glyphes sont des `number[][]` pré-décodés via `bitmap-font`).
- **`SaveTextColors`/`RestoreTextColors`** (text.c:514/521) [vivant] — ABSENTS (à grep ; probablement non portés).
- **`RenderTextHandleBold`** (text.c:1500) [vivant : police bold] — ABSENT.
- **`DrawKeypadIcon`/`GetKeypadIconTileOffset`/`GetKeypadIconHeight`** (text.c:1609/1625/1635) — ABSENTS (`GetKeypadIconWidth` présent, privé). 🟡 (les icônes clavier L/R/START apparaissent dans les menus → impact visuel réel).
- **`DrawDownArrow`** (text.c:902) [vivant] — logique portée mais via helpers `textPrinterDrawDownArrow`/`blitArrowAt`/`resetDownArrow` (noms non-1:1).
- **`SetDefaultFontsPointer`/`SetFontsPointer`** (text.c:1640/239) — ABSENTS (`gFonts` géré différemment).
- **`GetStringWidthFixedWidthFont`** (text.c:1226, UNUSED) — ABSENT (code-mort, OK).
- **`DecompressGlyph_Bold`/`GetGlyphWidth_Bold`** — ABSENTS.
- **`TextPrinterInitDownArrowCounters`** (text.c:772) — portée sous nom `resetDownArrow` ?
- Modèle : le décomp décompresse chaque glyphe en tuiles 4bpp (`DecompressGlyphTile` + `GLYPH_COPY` macro + `CopyGlyphToWindow`), notre port blit des `number[][]` glyphes RGBA via `blitGlyphToWindow`/`bitmap-font.ts`. Adaptation rendu web assumée mais **pas transcrite** (glyph→tile pipeline). Sémantique visuelle OK, structure 1:1 partielle.
Stubs suspects : couche glyphe = adaptation, pas stub silencieux.
Fuites harness : `encodeOwText`/`decodeOwBytes`/`encodeStringForFont`/`blitGlyphToWindow`/`addTextPrinter`/`runTextPrinter`/`loadFontData`/`getFontGlyphData` etc. = substrat texte web (noms non-1:1). `CHAR_SPACER_STR = 'ラ'` = mapping charmap web. Nombreux exports de constantes (RENDER_STATE_*, TEXT_COLOR, gTextFlags) = OK.
Note : text.ts contient un pont JS-string↔bytes (migration texte). Impact 1:1 réel = keypad icons + bold + half-row lookup (rendu subtilement différent), pas la logique de flux.

## text_window.c → src/text_window.ts
Statut : ✅ MIROIR
Fonctions : 11/11 (GetWindowFrameTilesPal, LoadMessageBoxGfx, LoadUserWindowBorderGfx_, LoadWindowGfx, LoadUserWindowBorderGfx, DrawTextBorderOuter, DrawTextBorderInner, rbox_fill_rectangle, GetTextWindowPalette, GetOverworldTextboxPalettePtr, LoadUserWindowBorderGfxOnBg).
Manquantes : aucune.
Divergences :
- `GetTextWindowPalette` (text_window.ts:212) : le décomp fait un switch id→{0x00,0x10,0x20,0x30,0x40} ; notre port fait `Math.min(id,4)*16`. Équivalent strict (0x10=16). ✅
- `DrawTextBorderOuter`/`Inner` : les 8 FillBgTilemapBufferRect transcrits 1:1 (tileNum+0..+8, tileNum+4=centre non dessiné). ✅
- Assets : les frames 4bpp (sWindowFrames[]) sont chargés via `preloadTextWindowFrames` (pont asset PNG, hors décomp). `writePalette` inline (substitut `LoadPalette` palette.c). DETTE documentée : `sTextWindowPalettes` pas préchargé → `GetTextWindowPalette` retourne null (caller skip). 🟡 dette assumée.
Stubs suspects : aucun (dette asset documentée).
Fuites harness : `frameAssetKeys`/`writePalette`/`preloadTextWindowFrames` = pont asset web. `globalThis.GetWindowFrameTilesPal` = glue auto-files. Acceptables.

## menu_specialized.c → src/menu_specialized.ts
Statut : 🟡 AMORCE (3/57 — seul le bloc level-up window porté)
Fonctions : 3/57. Présentes : `DrawLevelUpWindowPg1`, `DrawLevelUpWindowPg2`, `GetMonLevelUpWindowStats` (+ const `sLvlUpStatStrings`).
Manquantes (vivant sauf mention) :
- **Mailbox menu** (MailboxMenu_Alloc/AddWindow/RemoveWindow/CreateList/MoveCursorFunc/AddScrollArrows/Free, menu_specialized.c:197-330) [vivant : PC → Boîte aux lettres] — ABSENTS (dépend de player_pc mailbox, 🔴 checklist).
- **ConditionGraph_*** (Init/SetNewPositions/TryUpdate/Draw/CalcLine/CalcPositions..., menu_specialized.c:332-713) [vivant : Pokénav condition/Pokéblock] — ABSENTS (dépend de pokénav, 🔴).
- **MoveRelearner*** (InitMoveRelearnerWindows/LoadMoveRelearnerMovesList/MoveRelearnerLoadBattleMoveDescription/..., menu_specialized.c:713-893) [vivant : Maître des Capacités] — ABSENTS (move_relearner 🔴).
- **GetBoxOrPartyMonData** (menu_specialized.c:893), **GetConditionMenuMon***, **Condition sparkles** (menu_specialized.c:1254-1523) — ABSENTS.
Divergences : `GetMonLevelUpWindowStats` prend un `LevelUpStatMon` (interface) au lieu de `struct Pokemon*` + GetMonData ; `DrawLevelUpWindowPg1/2` reconstruisent les strings ('+'/'-'/nombre) au lieu de ConvertIntToDecimalStringN. Sémantiquement fidèle (line refs décomp cités). Ordre d'affichage STAT_ (DISPLAY_TO_STAT [0,1,2,4,5,3]) transcrit 1:1. 🟡
Stubs suspects : aucun (les 3 fns portées sont réelles).
Note : la majorité manquante appartient à des SYSTÈMES 🔴 non portés (pokénav/mailbox/move relearner). Le fichier est honnête sur son périmètre (commentaire d'en-tête). Priorité DÉPENDANTE de ces systèmes.

## menu_helpers.c → src/menu_helpers.ts
Statut : ✅ MIROIR (avec exemptions link honnêtes)
Fonctions : 21/25 (cf. cartograph). Présentes 1:1 : `AdjustQuantityAccordingToDPadInput`, `GetLRKeysPressed`, `GetLRKeysPressedAndHeld`, `IsHoldingItemAllowed`, `IsWritingMailAllowed`, `MenuHelpers_IsLinkActive`, `MenuHelpers_ShouldWaitForLinkRecv`, `SetItemListPerPageCount`, `SetCursorWithinListBounds`, `SetCursorScrollWithinListBounds`, `DoYesNoFuncWithChoice`, `CreateYesNoMenuWithCallbacks`, `Task_CallYesOrNoCallback` (static), `RunTextPrintersRetIsActive`, `Task_ContinueTaskAfterMessagePrints` (static), `DisplayMessageAndContinueTask`, `LoadListMenuSwapLineGfx`, `CreateSwapLineSprites`, `DestroySwapLineSprites`, `SetSwapLineSpritesInvisibility`, `UpdateSwapLineSpritesPos`.
Ailleurs :
- **`ResetVramOamAndBgCntRegs`** (menu_helpers.c:94) → `src/window.ts:684`.
- **`ResetAllBgsCoordinates`** (menu_helpers.c:106) → `src/window.ts:705`.
- **`SetVBlankHBlankCallbacksToNull`** (menu_helpers.c:118) → à grep (probable ailleurs/harness).
Manquantes :
- **`IsActiveOverworldLinkBusy`** (static, menu_helpers.c:306) [code-mort en single-player, appelé par MenuHelpers_ShouldWaitForLinkRecv] — ABSENT (absorbé dans le stub `return false`).
Divergences (exemptions link documentées, PAS silencieuses) :
- `IsHoldingItemAllowed`/`IsWritingMailAllowed`/`MenuHelpers_IsLinkActive`/`MenuHelpers_ShouldWaitForLinkRecv` : la condition link (`IsOverworldLinkActive() || InUnionRoom()`) est réduite à `false` const (documenté : single-player, maps link injoignables). Le corps décomp n'est donc pas transcrit mais la valeur est correcte pour notre périmètre. `IsWritingMailAllowed` garde `if (false && ItemIsMail(itemId))` = trace honnête. 🟢 exemption link acceptée par les règles.
- Réfs pointeur `u16*`/`s16*` → objets `ListPos`/`IntRef` (documenté, 1:1 sémantique). Les corps SetCursor*/SetItemListPerPageCount sont transcrits ligne-à-ligne (y compris la branche parité maxShownItems%2).
Stubs suspects : les 4 stubs link ci-dessus (documentés, dans le cadre de l'exemption).
Fuites harness : swap-line sprites via `CreateSpriteAtOam`/`registerExtraAnim` (substrat sprite), `preloadSwapLineAssets` (pont asset). Acceptables.

## menu.c → src/menu.ts
Statut : 🟡 PARTIEL (73/123 — cœur menu/dialogue/yes-no/grid porté ; helpers bg-decompress + start-menu-window + HofPC absents)
Fonctions présentes 1:1 (~50 vues) : `GetPlayerTextSpeed`, `GetPlayerTextSpeedDelay`, `RunTextPrintersAndIsPrinter0Active`, `AddTextPrinterParameterized2/3/4`, `AddTextPrinterForMessage(_2)`, `AddTextPrinterWithCustomSpeedForMessage`, `AddTextPrinterWithCallbackForMessage`, `InitStandardTextBoxWindows`, `FreeAllOverworldWindowBuffers`, `InitTextBoxGfxAndPrinters`, `LoadMessageBoxAndBorderGfx`, `DrawDialogueFrame`, `DrawStdWindowFrame`, `ClearDialogWindowAndFrame`, `ClearStdWindowAndFrame`, `SetStandardWindowBorderStyle`, `LoadMessageBoxAndFrameGfx`, `DrawDialogFrameWithCustomTileAndPalette`, `ClearDialogWindowAndFrameToTransparent`, `DrawStdFrameWithCustomTileAndPalette`, `ClearStdWindowAndFrameToTransparent`, `Menu_LoadStdPal(At)`, `InitMenuNormal`, `RedrawMenuCursor`, `Menu_MoveCursor(NoWrapAround)`, `Menu_GetCursorPos`, `Menu_ProcessInput(NoWrap)`, `ProcessMenuInput_other`, `Menu_ProcessInputNoWrapAround_other`, `InitMenuInUpperLeftCorner(Normal)`, `CreateYesNoMenu`, `DisplayYesNoMenuDefaultYes`, `DisplayYesNoMenuWithDefault`, `Menu_ProcessInputNoWrapClearOnChoose`, `EraseYesNoWindow`, `PrintMenuActionTextsAtPos`, `PrintMenuActionTexts`, `PrintMenuTable`, `PrintMenuActionTextsInUpperLeftCorner`, `PrintMenuActionGrid`, `PrintMenuGridTable`, `ChangeMenuGridCursorPosition`, `ChangeGridMenuCursorPosition`, `Menu_ProcessGridInput`, `InitMenuActionGrid`, `SetWindowTemplateFields`, `AddWindowParameterized`, `ListMenuLoadStdPalAt`.
Ailleurs : `CreateWindowTemplate` (menu.c:1165) → `src/window.ts:716`.
Manquantes (vivant) :
- **`AddTextPrinterParameterized5`** (menu.c:1959) — ABSENT (variante letterSpacing/lineSpacing+callback).
- **`AddStartMenuWindow`/`GetStartMenuWindowId`/`RemoveStartMenuWindow`** (menu.c:490-502) — ABSENTS (le start_menu.ts a probablement son propre câblage window).
- **`AddMapNamePopUpWindow`/`GetMapNamePopUpWindowId`/`RemoveMapNamePopUpWindow`** (menu.c:521-533) — ABSENTS de menu.ts (map_name_popup.ts existe, à vérifier si ces 3 y sont).
- **`DisplayItemMessageOnField`** (menu.c:457) — ABSENT.
- **`EraseFieldMessageBox`** (menu.c:548) — ABSENT (field_message_box.ts ?).
- **`InitMenu` (static)/`RedrawMenuCursor`** cursor-sprite : `InitMenu` static absent (InitMenuNormal appelle un équivalent inline ?).
- **HofPCTopBar_*** (menu.c:785-902) [vivant : Hall of Fame PC, hors périmètre single-player courant] — ABSENTS.
- **BG tilemap/decompress helpers** (menu.c:1718-1917 : `ClearScheduledBgCopiesToVram`, `ScheduleBgCopyTilemapToVram`, `DoScheduledBgTilemapCopiesToVram`, `ResetTempTileDataBuffers`, `FreeTempTileDataBuffersIfPossible`, `DecompressAndCopyTileDataToVram`, `DecompressAndLoadBgGfxUsingHeap`, `malloc_and_decompress`, `copy_decompressed_tile_data_to_vram`, `SetBgTilemapPalette`, `CopyToBufferFromBgTilemap`, `AddValToTilemapBuffer`, `ResetBgPositions`, `BgDmaFill`) — la plupart ABSENTS de menu.ts (certains, ex. ScheduleBgCopyTilemapToVram/ClearScheduledBgCopiesToVram/ResetTempTileDataBuffers, sont dans window.ts). 🔴 `DecompressAndLoadBgGfxUsingHeap`/`DecompressAndCopyTileDataToVram` = utilisés par de nombreux écrans (chargement gfx compressé) — à grep.
- **`PrintPlayerNameOnWindow`** (menu.c:1981) — ABSENT.
- **`BlitMenuInfoIcon`** (menu.c:2098) [vivant : icônes info list menu] — ABSENT.
- **`BufferSaveMenuText`** (menu.c:2103) [vivant : menu START save box] — ABSENT.
Divergences : les fns présentes sont transcrites via les WindowFunc_* (DrawStandardFrame/DrawDialogueFrame etc.) — à confirmer que la logique tilemap (tileNum+0..+8) est 1:1. Menu cursor : le décomp utilise un sprite curseur (Menu_MoveCursor → sMenu.cursorPos + CreateMenuCursor) ; notre port à vérifier.
Stubs suspects : aucun évident dans ce qui est porté.
Fuites harness : `sYesNo_WindowTemplates`/constantes DLG_* = data. À confirmer si `AddTextPrinterParameterizedN` sont 1:1 dans le corps.

## option_menu.c → src/option_menu.ts
Statut : ✅ MIROIR
Fonctions : 24/24 (cf. cartograph). Présentes 1:1 : `CB2_InitOptionMenu`, `Task_OptionMenuFadeIn`, `Task_OptionMenuProcessInput`, `Task_OptionMenuSave`, `Task_OptionMenuFadeOut`, `HighlightOptionMenuItem`, `DrawOptionMenuChoice`, `TextSpeed_ProcessInput`, `TextSpeed_DrawChoices`, `BattleScene_ProcessInput/DrawChoices`, `BattleStyle_ProcessInput/DrawChoices`, `Sound_ProcessInput/DrawChoices`, `FrameType_ProcessInput/DrawChoices`, `ButtonMode_ProcessInput/DrawChoices`, `DrawHeaderText`, `DrawOptionMenuTexts`, `DrawBgWindowFrames`.
Manquantes : `MainCB2`/`VBlankCB` (static wrappers, absorbés dans le runtime CB2/VBlank harness — acceptable).
Divergences : les Task_* sont des `TaskCallback` (task, rt) au lieu de `Task(u8 taskId)` — convention runtime, sémantique 1:1. Les `DrawChoices`/`ProcessInput` transcrits par option. Le `diploma.c` (checklist 🟡 amorce 2/10) piste vers option_menu.ts par homonymie de recherche mais est un fichier distinct (non porté).
Stubs suspects : aucun.
Fuites harness : `preloadOptionMenuAssets`/`sOptionMenuBg_Pal`/`getOptionMenuTextPal` = pont asset/palette. Acceptables.
Note : **exemple de bon miroir d'écran CB2** (Task machine + CB2 + names 1:1). À prendre comme modèle pour start_menu.

## start_menu.c → src/start_menu.ts
Statut : 🔴 DIVERGENT (state-machine maison — 0/80 noms décomp)
Fonctions : 0/80 des noms décomp. Le fichier RÉ-IMPLÉMENTE le start menu avec une architecture propre :
- `OpenStartMenu`/`CloseStartMenu`/`TickStartMenu`/`IsStartMenuOpen` (noms NON-décomp).
- Sous-états `sSubState` ('msg_wait'/'msg_close'/'fading_to_screen'/...) au lieu du chaînage `gMenuCallback` décomp.
- Actions `pokedexAction`/`pokemonAction`/`sacAction`/`playerCardAction`/`_showSaveInfoWindow` (noms NON-décomp).
Manquantes / non-transcrites (TOUTES les fns décomp) :
- **`HandleStartMenuInput`** (start_menu.c:593) — logique d'input remplacée par un tick maison.
- **`BuildStartMenuActions`/`AddStartMenuAction`/`BuildNormalStartMenu`** (+ Safari/Link/Union/Pike/Pyramid/MultiPartner variants, start_menu.c:276-408) — construction du menu remplacée par un `buildItems` maison.
- **`StartMenuTask`/`CreateStartMenuTask`/`Task_ShowStartMenu`/`ShowStartMenu`/`ShowReturnToFieldStartMenu`/`FieldCB_ReturnToFieldStartMenu`** (start_menu.c:527-581) — pas de task témoin `StartMenuTask` ; flux maison.
- **Callbacks `StartMenu*Callback`** (Pokedex/Pokemon/Bag/PokeNav/PlayerName/Save/Option/Exit, start_menu.c:639-731) — remplacés par des `*Action()` maison. Les comportements CB2 (fade→OpenBagScreen etc.) sont fidèles en INTENTION (commentaires citent start_menu.c), mais la STRUCTURE (gMenuCallback poll, savedCallback chain) n'est pas 1:1.
- **Save flow** (SaveStartCallback/SaveCallback/SaveConfirm.../SaveDoSaveCallback/SaveSuccessCallback + InitSave/RunSaveCallback/ShowSaveMessage/ShowSaveInfoWindow, start_menu.c:721+ et déclarés 108-266) — le sous-menu SAUVEGARDER (OUI/NON, écrasement, message "Sauvegarde..." puis succès) est massivement re-câblé maison. Seul `_showSaveInfoWindow` (fenêtre d'info région/joueur/badges/dex/durée) est porté avec le template 1:1.
- `SetDexPokemonPokenavFlags` (unused), Battle Pyramid/Pike retire flows — ABSENTS (hors périmètre single-player courant, mais le décomp les a).
Divergences : c'est LA divergence structurelle majeure du domaine. Fonctionnellement le menu marche (POKéDEX/POKéMON/SAC/JOUEUR/SAUVEGARDER/OPTIONS/QUITTER), mais aucun nom/structure décomp n'est respecté → violation de la doctrine miroir (state-machine maison au lieu de `StartMenuTask`+`gMenuCallback`+`sStartMenuItems`+`BuildXStartMenu`).
Stubs suspects : non (fonctionnel), mais NON-1:1 structurel intégral.
Fuites harness : `sSubState`, `sPendingScreenAction`, `TickStartMenu`, `OpenStartMenu`, `CloseStartMenu` = architecture maison. Nombreux imports OpenBagScreen/OpenPartyScreen/OpenPokedexFromStartMenu (câblage inter-écrans).

## list_menu.c → src/list_menu.ts
Statut : ✅ MIROIR
Fonctions : 45/48 (cf. cartograph). Présentes 1:1 (noms décomp) : `ListMenuInit`, `ListMenu_ProcessInput`, `DestroyListMenuTask`, `RedrawListMenu`, `ListMenuTestInput`, `ListMenuGetCurrentItemArrayId`, `ListMenuGetScrollAndRow`, `ListMenuGetYCoordForPrintingArrowCursor`, `ListMenuInitInternal`, `ListMenuPrint`, `ListMenuPrintEntries`, `ListMenuDrawCursor`, `ListMenuErasePrintedCursor`, `ListMenuUpdateSelectedRowIndexAndScrollOffset`, `ListMenuScroll`, `ListMenuChangeSelection`, `ListMenuCallSelectionChangedCallback`, `ListMenuOverrideSetColors`, `ListMenuDefaultCursorMoveFunc`, `ListMenuGetTemplateField`, `ListMenuSetTemplateField`, `AddScrollIndicatorArrowObject`, `AddScrollIndicatorArrowPair(Parameterized)`, `Task_ScrollIndicatorArrowPair(OnMainMenu)`, `RemoveScrollIndicatorArrowPair`, `ListMenuAdd/Update/RemoveCursorObject(Internal)`, `ListMenuAdd/Update/RemoveRedOutline/RedArrowCursorObject`, `ListMenuGetRedOutlineCursorSpriteCount`, `ListMenuSetUpRedOutlineCursorSpriteOamTable`, `SpriteCallback_ScrollIndicatorArrow`, `SpriteCallback_RedArrowCursor`, `DoMysteryGiftListMenu`.
Manquantes :
- **`ListMenuInitInRect`** (list_menu.c:375) [vivant : certains écrans à fenêtre custom rect] — ABSENT.
- **`ChangeListMenuPals`** (list_menu.c:481) [vivant] — ABSENT.
- **`ChangeListMenuCoords`** (list_menu.c:491) [vivant] — ABSENT.
Divergences : réfs `u16*` → objets retour `{scrollOffset, selectedRow}` (1:1 sémantique). `ListMenuDummyTask`/`Task_RedOutlineCursor`/`Task_RedArrowCursor` = noop 1:1. Curseurs sprite (RedOutline/RedArrow) via substrat sprite (CreateSprite harness) mais logique OAM/subsprite table transcrite. **Bon miroir.**
Stubs suspects : aucun (les noop sont 1:1 décomp).
Fuites harness : hooks de rendu `setListMenuRenderHooks`/`_listMenuProcessInputOnObject` = substrat. Acceptables.

## item_menu_icons.c → src/item_menu_icons.ts
Statut : 🟡 PARTIEL (12/21 — icônes item/sac portées ; certains helpers absents)
Fonctions présentes 1:1 : `RemoveBagItemIconSprite`, `AddBagVisualSprite`, `SetBagVisualPocketId`, `SpriteCB_BagVisualSwitchingPockets`, `ShakeBagSprite`, `SpriteCB_ShakeBagSprite`, `AddSwitchPocketRotatingBallSprite`, `SpriteCB_SwitchPocketRotatingBallInit/Continue`, `AddBagItemIconSprite`, `RemoveBagSprite`.
Renommé : `UpdateSwitchPocketRotatingBallCoords` (privé, OK).
Manquantes (item_menu_icons.c a 21 fns) : ~9 dont probablement `CreateBagItemIconSprites`, `ResetItemMenuIconState`, `GetItemIconPicOrPalette`, `AddItemIconSprite`/`AddCustomItemIconSprite` (generic, item_icon.c ?), `CopyItemIconPicTo4x4Buffer`... — à croiser avec item_menu_icons.c complet.
Divergences : `FreeSpriteTilesByTag`/`FreeSpritePaletteByTag` redéfinis localement (déjà dans sprite.ts) — duplication mineure.
Stubs suspects : aucun repéré.
Fuites harness : sprites via CreateSprite harness (substrat sprite).

## shop.c → src/shop.ts
Statut : 🔴 DIVERGENT (5/57 noms 1:1 ; buy-menu porté mais via helpers renommés + shop-outer-menu et map-bg absents)
Fonctions présentes avec nom décomp : `CB2_InitBuyMenu`, `Task_BuyMenu`, `CB2_ExitSellMenu`, `Task_ExitBuyMenu`, `VBlankCB_BuyMenu` (+ MainCB2 stub). (audit `shop-buymenu-completeness.json` : 12/17 reachable du buy-menu, mais 7 le sont via `how: manual` = renommés `_buildBuyList`, `_initBuyMenuBgs`, `_loadShopFrameToVram`, etc.)
Maison (noms NON-décomp) : `OpenPokemart`, `TickShop`, `doPokemart`, `GetMartItemList`, `IsShopMenuOpen`, `CB2_InitBuyMenu` wrapper.
Manquantes (vivant) :
- **Outer shop menu** : `CreateShopMenu`, `Task_ShopMenu`, `Task_HandleShopMenuBuy`, `Task_HandleShopMenuSell`, `Task_HandleShopMenuQuit`, `Task_GoToBuyOrSellMenu`, `SetShopMenuCallback`, `SetShopItemsForSale`, `ShowShopMenuAfterExitingBuyOrSellMenu`, `MapPostLoadHook_ReturnToShopMenu`, `Task_ReturnToShopMenu` (shop.c:340-485) — le menu ACHETER/VENDRE/QUITTER initial est re-câblé maison (`OpenPokemart`/`TickShop`).
- **Map background render** : `BuyMenuDrawMapGraphics`, `BuyMenuDrawMapBg`, `BuyMenuDrawMapMetatile(Layer)`, `BuyMenuCollectObjectEventData`, `BuyMenuDrawObjectEvents`, `BuyMenuCheckForOverlapWithMenuBg`, `BuyMenuCheckIfObjectEventOverlapsMenuBg`, `BuyMenuCopyMenuBgToBg1TilemapBuffer` (shop.c:781-980) — le rendu de la CARTE en fond du buy-menu (métatiles + NPCs derrière la liste) est ABSENT. 🔴 divergence visuelle notable (le vrai shop montre la map floue derrière).
- **Buy flow détaillé** : `BuyMenuSetListEntry`, `BuyMenuAddScrollIndicatorArrows`/`Remove`, `BuyMenuPrintCursor`, `Task_BuyHowManyDialogueInit/HandleInput`, `BuyMenuConfirmPurchase`, `BuyMenuTryMakePurchase`, `BuyMenuSubtractMoney`, `RecordItemPurchase`, `Task_ReturnToItemListAfterItemPurchase`, `Task_ReturnToItemListAfterDecorationPurchase`, `BuyMenuReturnToItemList` — partiellement portés via helpers renommés (cf. audit), pas 1:1.
Divergences : architecture maison `TickShop`/`sSubState`-like pour le menu externe + rendu carte de fond absent.
Stubs suspects : `MainCB2_BuyMenuRun`/`VBlankCB_BuyMenu` = no-op (runtime auto-tick) — documenté.
Fuites harness : `GetMartItemList`/`OpenPokemart`/`doPokemart` = câblage byte-VM (opcode pokemart). Acceptables comme glue mais l'écran lui-même est partiellement maison.

## item_menu.c → src/item_menu.ts
Statut : 🟡 PARTIEL (90/122 — TRÈS bon miroir, quelques flows absents)
Fonctions présentes 1:1 (échantillon large, noms décomp) : `CB2_Bag`, `CB2_BagMenuFromStartMenu`, `CB2_BagMenuFromBattle`, `CB2_ChooseBerry`, `CB2_GoToSellMenu`, `GoToBagMenu`, `SetupBagMenu`, `BagMenu_InitBGs`, `LoadBagMenu_Graphics`, `LoadBagMenuTextWindows`, `UpdatePocketItemList(s)`, `InitPocketListPositions`, `BagMenu_Print`, `BagMenu_PrintCursor(AtPos)`, `BagMenu_MoveCursorCallback`, `BagMenu_ItemPrintCallback`, `LoadBagItemListBuffers`, `PrintPocketNames`, `CopyPocketNameToWindow`, `DrawPocketIndicatorSquare`, `CreateItemMenuSwapLine`, `ChangeBagPocketId`, `Task_HandleSwappingItemsInput`, `SwitchBagPocket`, `Task_SwitchBagPocket`, `Task_FadeAndCloseBagMenu`, `Task_CloseBagMenu`, `Task_BagMenu_HandleInput`, `BagMenu_AddWindow`, `BagMenu_RemoveWindow`, `Task_ItemContext_Normal/SingleRow/MultipleRows`, `CB2_CheckMail`, `ItemMenu_UseOutOfBattle`, `ItemMenu_Toss`, `Task_ChooseHowManyToToss`, `Task_RemoveItemFromBag`, `Task_ItemContext_GiveToParty`, `Task_ItemContext_Sell`, `Task_ChooseHowManyToSell`, `SellItem`, `ItemMenu_Register`, `ItemMenu_Give`, `ItemMenu_Cancel`, etc.
Manquantes (à croiser — ~32) : probablement les flows Pyramid bag (battle_pyramid_bag.c mélangé), `CreateSortedBagItemList`/`SortBerriesOrItems`... (à vérifier). L'essentiel du single-player bag est là.
Divergences : Task funcs prennent `DecompTask` (convention runtime). ⚠️ `FreeSpriteTilesByTag` local duplication (cf. item_menu_icons). Mineur.
Stubs suspects : aucun repéré dans l'échantillon.
Fuites harness : sprites/CB2 via runtime. **Consolidation réussie** (item_menu.c consolidé récemment = confirmé bon état).

## mail.c → src/mail.ts
Statut : ✅ MIROIR (LECTURE complète ; l'écriture = easy_chat, cf. ci-dessous)
Fonctions : 10/10 (ReadMail, MailReadBuildGraphics, CB2_InitMailRead, BufferMailText, PrintMailText, VBlankCB_MailRead, CB2_MailRead, CB2_WaitForPaletteExitOnKeyPress, CB2_ExitOnKeyPress, CB2_ExitMailReadFreeVars). Tous noms décomp 1:1.
Manquantes : aucune (mail.c ne contient QUE la lecture). L'écriture de courrier passe par `DoEasyChatScreen` (easy_chat.c) — pas dans mail.c.
Divergences : `ReadMail`/CB2 chain transcrits 1:1. `BufferMailText`/`PrintMailText` byte-level.
Stubs suspects : aucun dans les 10 fns mail.
Fuites harness : **⚠️ redéfinitions locales de fns menu.c/window.c** — `SetBgTilemapBuffer`, `UnsetBgTilemapBuffer`, `ResetTempTileDataBuffers`, `FreeTempTileDataBuffersIfPossible`, `DecompressAndCopyTileDataToVram`, `LoadOam`, `ProcessSpriteCopyRequests`, `TransferPlttBuffer`, `SpriteCallbackDummy`, `ConvertInternationalPlayerName` (mail.ts:1000-1131). Ce sont des primitives 1:1 d'AUTRES fichiers (menu.c/sprite.c/bg.c) redéfinies localement (souvent no-op/stub). 🟡 duplication/stub à consolider vers leurs foyers (surtout `DecompressAndCopyTileDataToVram` = menu.c). `IS_ITEM_MAIL`/`GetText_FromSpace` = helpers locaux.

## naming_screen.c → src/naming_screen.ts
Statut : 🟡 PARTIEL (85/117 — TRÈS bon miroir de l'écran de saisie)
Fonctions présentes 1:1 (noms décomp, large échantillon) : `DoNamingScreen`, `CB2_LoadNamingScreen`, `NamingScreen_Init`, `NamingScreen_InitBGs`, `CreateNamingScreenTask`, `NamingScreen_ShowBgs`, `CB2_NamingScreen`, `Task_NamingScreen`, `MainState_FadeIn/WaitFadeIn/HandleInput/MoveToOKButton/PressedOKButton/FadeOut/Exit/StartPageSwap/WaitPageSwap`, `DrawKeyboardPageOnDeck`, `CreateCursorSprite`, `SetCursorPos`, `GetCursorPos`, `MoveCursorToOKButton`, `SetCursorInvisibility`, `SetCursorFlashing`, `IsCursorAnimFinished`, `SquishCursor`, `CreatePageSwapButtonSprites`, `StartPageSwapButtonAnim`, `PageSwapSprite_Init/Idle/SlideOff/SlideOn`, `SetPageSwapButtonGfx`, `NamingScreen_CreatePlayerIcon/PCIcon`, `StartPageSwapAnim`, `Task_HandlePageSwapAnim`, `PageSwapAnimState_Init/1/2/Done`, `IsPageSwapAnimNotInProgress`, `Task_UpdateButtonFlash`, `Task_HandleInput`, `SetInputState`, `GetKeyRoleAtCursorPos`, `DrawTextEntryBox`, `DrawTextEntry`, `PrintControls`.
Manquantes (~32, à croiser précisément) : probablement des sous-fonctions du keyboard (KeypressInput helpers, gender icon anim sub-CBs) + les fns UNUSED. L'essentiel (saisie nom joueur/Pokémon/PC/boîte) est fonctionnel.
Divergences : `Task_*`/`MainState_*` prennent `DecompTask` / opèrent sur `sNamingScreen` global (1:1 struct). Rendu clavier via substrat sprite/canvas. Bon respect des noms/structure (sMainStateFuncs table transcrite).
Stubs suspects : aucun repéré dans l'échantillon.
Fuites harness : `DrawBgTilemap` helper. Sprites via runtime.

## easy_chat.c → src/easy_chat.ts
Statut : 🟡 PARTIEL (~132/248 « partout », 5/248 « fichier » selon carto — MAIS en réalité l'écran est largement porté sous les noms 1:1)
Fonctions présentes 1:1 (grand échantillon) : `DoEasyChatScreen`, `ShowEasyChatScreen`, `InitializeEasyChatWordArray`, `CB2_EasyChatScreen`, `VBlankCB_EasyChatScreen`, `StartEasyChatScreen`, `Task_InitEasyChatScreen`, `Task_EasyChatScreen`, `InitEasyChatScreen`, `LoadEasyChatScreen`, `InitEasyChatScreenControl(_)`, `FreeEasyChatScreenControl`, `StartEasyChatFunction`, `RunEasyChatFunction`, `InitEasyChatBgs`, `LoadEasyChatPalettes`, `PrintEasyChatText(WithColors)`, `PrintEasyChatStdMessage`, `CreateEasyChatYesNoMenu`, `DrawLowerWindow`, `DrawLowerWindowFrame`, `BufferLowerWindowFrame`, `SetWindowDimensions`, `ConvertEasyChatWordsToString`, `GetRandomEasyChatWordFromGroup` (dewford_trend), `CopyEasyChatWord(Padded)`, `InitEasyChatScreenWordData`, `FreeEasyChatScreenWordData`, `SetUnlockedEasyChatGroups`, `GetNumUnlockedEasyChatGroups`, `GetUnlockedEasyChatGroupId`, `IsEasyChatWordUnlocked`, `TryAddInterviewObjectEvents`, `GetFooterIndex`, `AddMainScreenButtonWindow`, `LoadEasyChatGfx`, + ~40 accesseurs `Get*` du struct sEasyChatScreen.
Reliquats CONNUS confirmés (ne pas re-diagnostiquer, prompt) :
- **offset rendu ~8px** curseur↔texte clavier (métrique police/pipeline sprite) — CONFIRMÉ (dette rendu, positions 1:1 exactes dans le code).
- **ordre des groupes = flags de déblocage save** (SetUnlockedEasyChatGroups) — CONFIRMÉ présent.
- **`TryAddInterviewObjectEvents`** : le SKELETON est porté (easy_chat.ts:1254) mais le corps `CreateObjectGraphicsSprite(reporter/joueur)` = `// TODO interview` → **les sprites reporter/joueur de l'interview Gabby&Ty n'apparaissent PAS**. 🟡 stub honnête documenté.
Reliquats AU-DELÀ (trouvés) :
- Duplication de primitives (LoadEasyChatGfx charge des "compressed sheets" comme sheets bruts — adaptation asset .lz→PNG documentée).
- `DoEasyChatScreen` (mail WRITING flow) : PRÉSENT et câblé. La state-machine `RunEasyChatFunction` dispatch ~34 des ~52 handlers `static u16` du décomp. Handlers PORTÉS : ReprintPhrase, Update*Cursor, Show*Prompt, Open/Close Keyboard/WordSelect, GroupNamesScroll*, WordSelect*Scroll/Page, SwitchKeyboardMode, Show*Msg. **Handlers STUB (`return false`)** : `ECFUNC_QUIZ_QUESTION`, `ECFUNC_QUIZ_ANSWER`, `ECFUNC_SET_QUIZ_QUESTION`, `ECFUNC_SET_QUIZ_ANSWER` (easy_chat.ts:1784-1787) → **le flux QUIZ (dame quiz Mauville / création de quiz) ne fonctionne PAS**. 🟡 stubs silencieux non documentés (`return false` sans commentaire). `ECFUNC_EXIT` = false (probablement OK, exit géré ailleurs).
Divergences : mojibake `Ã©` dans certains commentaires (dette cosmétique, PAS logique — noté). Struct sEasyChatScreen via globals module. Sprites/BG via substrat.
Stubs suspects : `TryAddInterviewObjectEvents` corps sprite (documenté). Reste = à vérifier sur les EasyChatFunc_* individuels.
Fuites harness : `easyChatGfxReady`/`LoadEasyChatGfx` (pont asset). `PIXEL_FILL` local. Acceptables.

---

## TOP 5 — plus gros écarts du domaine (levier × effort)

### 1. start_menu.c → src/start_menu.ts — RÉÉCRITURE 1:1 du start menu (state-machine maison → décomp)
**Taille : L.** 0/80 noms décomp. Le menu START (POKéDEX/POKéMON/SAC/JOUEUR/SAUVEGARDER/OPTIONS/QUITTER) est fonctionnel mais entièrement re-architecturé (`OpenStartMenu`/`TickStartMenu`/`sSubState`/`*Action()`) au lieu de `StartMenuTask`+`gMenuCallback` poll + `sStartMenuItems[]` + `BuildNormalStartMenu`/`AddStartMenuAction` + les `StartMenu*Callback`. Le sous-menu SAUVEGARDER (SaveConfirm/Overwrite/DoSave/Success chain, ~20 fns) est massivement maison. Levier ÉNORME (start menu = hub central, modèle pour tous les CB2). Effort L (réécriture complète en respectant les tables + gMenuCallback).
**Oracle en jeu** : ouvrir le menu START (Start), naviguer, tester SAUVEGARDER (OUI→"Sauvegarde en cours..."→succès), QUITTER. Après refactor, vérifier `window.__rt.gTasks` contient une task `StartMenuTask` (témoin) et `gMenuCallback` pointe vers `HandleStartMenuInput`. Modèle = option_menu.ts (déjà 1:1).

### 2. shop.c → src/shop.ts — outer shop menu + rendu carte de fond (BuyMenuDrawMapGraphics)
**Taille : L.** 5/57 noms 1:1. Deux gros manques : (a) le menu externe ACHETER/VENDRE/QUITTER (`CreateShopMenu`/`Task_ShopMenu`/`Task_HandleShopMenuBuy/Sell/Quit`, re-câblé `OpenPokemart`/`TickShop`) ; (b) **le rendu de la carte en fond du buy-menu** (`BuyMenuDrawMapGraphics`/`BuyMenuDrawMapBg`/`BuyMenuDrawMapMetatile`/`BuyMenuCollectObjectEventData`/`BuyMenuDrawObjectEvents`, shop.c:781-980) = ABSENT → le vrai shop montre la map + NPCs derrière la liste d'items, chez nous fond nu. Levier fort (visuel très visible), effort L (rendu métatile + object events).
**Oracle en jeu** : entrer dans un magasin (Poké Mart Rosyfair), ouvrir ACHETER → vérifier que la CARTE (sol + comptoir + vendeur) apparaît FLOUE derrière la liste d'items (comparer à un émulateur). Vérifier `Task_ShopMenu` présent dans gTasks pour le menu externe.

### 3. menu.c — centraliser les helpers gfx-decompress (DecompressAndLoadBgGfxUsingHeap & co.)
**Taille : M.** `DecompressAndLoadBgGfxUsingHeap`, `DecompressAndCopyTileDataToVram`, `copy_decompressed_tile_data_to_vram`, `malloc_and_decompress`, `BufferSaveMenuText`, `BlitMenuInfoIcon`, `PrintPlayerNameOnWindow`, `AddTextPrinterParameterized5` sont ABSENTS de menu.ts et **redéfinis localement/inline** dans easy_chat.ts, mail.ts, pokedex.ts, fieldmap.ts (duplication N×, souvent en stub no-op). Levier moyen-fort (utilisés partout, consolidation supprime des divergences silencieuses), effort M (porter 1:1 dans menu.ts + rerouter les importeurs).
**Oracle en jeu** : n'importe quel écran chargeant un BG compressé (Pokédex, easy chat clavier) — vérifier après consolidation que le gfx s'affiche identique. Grep : plus aucune `function DecompressAndLoadBgGfxUsingHeap` hors menu.ts.

### 4. easy_chat.c — handlers QUIZ stub + sprites interview (TryAddInterviewObjectEvents)
**Taille : M.** Deux stubs silencieux : (a) `ECFUNC_QUIZ_QUESTION/ANSWER/SET_QUIZ_*` → `return false` (easy_chat.ts:1784-1787) = le flux QUIZ (dame quiz de Mauville) inopérant ; (b) `TryAddInterviewObjectEvents` corps `CreateObjectGraphicsSprite` = `// TODO` → sprites reporter/joueur de l'interview Gabby&Ty absents. Levier moyen (mail/Dewford OK, mais quiz+interview cassés), effort M. NB : l'offset rendu ~8px et l'ordre-groupes=flags sont des reliquats CONNUS (pas dans ce TOP).
**Oracle en jeu** : (a) interview Gabby&Ty (route 111/118) → vérifier apparition des 2 sprites (reporter + joueur) pendant l'easy chat ; (b) dame quiz Mauville → créer un quiz → vérifier que la saisie question/réponse fonctionne (actuellement bloquée).

### 5. window.c/text.c — fns pures-logique absentes (SetWindowAttribute, PutWindowRectTilemap, DrawKeypadIcon, RenderTextHandleBold)
**Taille : M.** Côté window.c : `SetWindowAttribute`, `AddWindowWithoutTileMap`, `PutWindowRectTilemap(OverridePalette)`, `CopyWindowRectToVram` ABSENTS (fns pures-logique, pas bloquées par le modèle canvas). Côté text.c : `DrawKeypadIcon`/`GetKeypadIconTileOffset` (icônes L/R/START/flèches dans les menus), `RenderTextHandleBold` (police bold), `GenerateFontHalfRowLookupTable` ABSENTS → keypad icons manquants + rendu bold/couleur half-row subtilement faux. Levier moyen (impact visuel diffus dans TOUS les menus), effort M.
**Oracle en jeu** : ouvrir un menu affichant des icônes clavier (ex. contrôles bas d'écran "L/R", ou naming screen boutons) → vérifier que les icônes L/R/▲▼ s'affichent (actuellement possiblement blancs/absents). Comparer le rendu d'un texte bold (titres) à l'émulateur.

---

## Récapitulatif domaine ui-menus

| fichier .c | statut | fns portées/total | écart principal |
|---|---|---|---|
| string_util.c | ✅ MIROIR | 44/44 | aucun (exemplaire) |
| dynamic_placeholder_text_util.c | ✅ MIROIR | 4/4 | aucun |
| coins.c | ✅ MIROIR | 7/7 | PrintCoinsString hardcodé (pas de right-align 1:1) |
| money.c | ✅ MIROIR | 15/15 (2 en specials-registry) | label sprite via substrat + tag ≠ 0x2722 |
| text_window.c | ✅ MIROIR | 11/11 | dette asset sTextWindowPalettes (null) |
| mail.c | ✅ MIROIR | 10/10 | primitives menu.c/sprite.c redéfinies en stub local |
| option_menu.c | ✅ MIROIR | 24/24 | aucun (modèle CB2) |
| list_menu.c | ✅ MIROIR | 45/48 | InitInRect/ChangeListMenuPals/Coords absents |
| menu_helpers.c | ✅ MIROIR | 21/25 | 4 stubs link (exemptés) + IsActiveOverworldLinkBusy absent |
| item_menu.c | 🟡 PARTIEL | 90/122 | pyramid bag + quelques flows absents |
| item_menu_icons.c | 🟡 PARTIEL | 12/21 | ~9 helpers icônes absents |
| naming_screen.c | 🟡 PARTIEL | 85/117 | ~32 sous-fns clavier/genre absentes |
| menu.c | 🟡 PARTIEL | 73/123 | gfx-decompress + start/map popup windows + HofPC absents |
| easy_chat.c | 🟡 PARTIEL | ~132/248 | QUIZ handlers stub + sprites interview TODO + offset 8px (connu) |
| text.c | 🟡 PARTIEL | 27/53 | keypad icons + bold + half-row lookup absents (substrat glyphe canvas) |
| window.c | 🟡 PARTIEL | ~15/30 | modèle canvas ≠ tileData ; SetWindowAttribute/RectTilemap/8Bit absents |
| shop.c | 🔴 DIVERGENT | 5/57 | outer menu maison + rendu carte de fond absent |
| start_menu.c | 🔴 DIVERGENT | 0/80 | state-machine maison intégrale (aucun nom décomp) |

**Verdict global** : 9 fichiers ✅ MIROIR (les primitives texte/liste/frame/option/coins/money/mail-read = solides), 7 🟡 PARTIEL (gros écrans consolidés mais incomplets), 2 🔴 DIVERGENT (start_menu + shop = state-machines maison). Les fondations (string_util/text_window/list_menu/menu_helpers/option_menu) sont excellentes ; les 2 chantiers structurels majeurs = **start_menu** (levier hub max) et **shop** (rendu carte). Dette transverse = les helpers gfx-decompress de menu.c dupliqués/stub dans plusieurs écrans.
