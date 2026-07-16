# AUDIT ENGINE — list_menu.c → src/list_menu.ts

**Réf** : `D:/Projet 1/decomps/pokeemeraude/src/list_menu.c` (1448 l) + `include/list_menu.h` (153 l)
**Port** : `D:/Projet 1/pokemon-web-demo/src/list_menu.ts` (1723 l)
**Date** : 2026-07-16 · Audit lecture seule, corps comparés ligne-à-ligne.

## Compteurs

- **48 fonctions C** au total : **40 ✅ 1:1** · **5 🟡 adaptations documentées** (aucune sur la logique état/scroll) · **3 ⛔ absentes (toutes `// unused` en C, 0 caller décomp)** · **0 🔴 stub** · **0 divergence logique**.
- **Cœur listes (scroll/cursor/itemsAbove)** : `ListMenu_ProcessInput` / `ListMenuChangeSelection` / `ListMenuUpdateSelectedRowIndexAndScrollOffset` / `ListMenuScroll` / `ListMenuPrintEntries` / `ListMenuDrawCursor` = **ligne-à-ligne EXACTS** (skip LIST_HEADER, centrage milieu-fenêtre `maxShowed/2 + maxShowed%2`, retours 0/1/2, `selectionChange |= ret`, cursorCount → ListMenuScroll partiel vs full-redraw).
- **Répétition touches** : réelle — `JOY_REPEAT` lit `gMain.newAndRepeatedKeys` (decomp-globals.ts:1481), alimenté par ReadKeys 1:1 (decomp-runtime.ts:1940-1959, keyRepeatCounter/startDelay/continueDelay).
- **Curseurs sprite RED_*** : portés 1:1 mais **inatteignables en Émeraude** — grep décomp : AUCUN template n'utilise `CURSOR_RED_OUTLINE`/`CURSOR_RED_ARROW` (tous `CURSOR_BLACK_ARROW` ou `CURSOR_INVISIBLE` ; le shop Émeraude = BLACK_ARROW, shop.c:220 — le « red outline shop » est du FireRed). Les seuls usages des littéraux RED_* du décomp sont internes à list_menu.c.

## Verdict

**✅ MOTEUR ~95 % 1:1, SAIN.** Aucune liste ne peut « sauter » à cause du moteur : l'état scroll/row est byte-exact. Les manques réels sont **(a)** un clone local du moteur encore vivant (`engine/bag/bag-screen.ts`, sac de combat + ItemPC) et **(b)** des CONSOMMATEURS non portés (ScrollableMultichoice no-op, move_relearner absent) — pas des trous dans list_menu.ts.

## Tableau fonctions

| Fonction | Statut | C:ligne | Port (list_menu.ts) | Détail |
|---|---|---|---|---|
| `ListMenuDummyTask` | ✅ | :295 | :477 | noop, slot task |
| `DoMysteryGiftListMenu` | ✅/⚪ | :300-363 | :1655-1722 | Corps 1:1 (fallthrough drawMode 2→1 expansé, `palOffset>>4` ≡ `/16` u16) ; ⚪ 0 consommateur porté (mystery_gift = link) |
| `ListMenuInit` | ✅ | :365-372 | :676-681 | PutWindowTilemap + CopyWindowToVram(COPYWIN_GFX) |
| `ListMenuInitInRect` | ⛔ | :375-392 | — | `// unused` en C, 0 caller décomp (grep) — absence OK |
| `ListMenu_ProcessInput` | ✅ | :394-453 | :688-692 + :333-373 | Wrapper Map + cœur `_listMenuProcessInputOnObject` (usage interne seul). A→id, B→LIST_CANCEL, JOY_REPEAT UP/DOWN count=1, switch scrollMultiple NO/DPAD/L_R → count=maxShowed. Masques boutons vérifiés (L=0x200, R=0x100) |
| `DestroyListMenuTask` | ✅ | :455-468 | :697-708 | Out-params → objet retourné (consommé, ex. item_menu.ts:1611) ; RemoveCursorObject si taskId≠TASK_NONE, `cursorKind - CURSOR_OBJECT_START` 1:1 |
| `RedrawListMenu` | ✅ | :470-478 | :711-718 | Fill + PrintEntries + DrawCursor + CopyWindowToVram |
| `ChangeListMenuPals` | ⛔ | :481-488 | — | unused C, 0 caller |
| `ChangeListMenuCoords` | ⛔ | :491-497 | — | unused C, 0 caller |
| `ListMenuTestInput` | ✅ | :500-521 | :380-399 | Porté (unused C) — fonction de vérif déterministe |
| `ListMenuGetCurrentItemArrayId` | ✅ | :523-529 | :722-726 | out-param → return |
| `ListMenuGetScrollAndRow` | ✅ | :531-539 | :730-734 | idem |
| `ListMenuGetYCoordForPrintingArrowCursor` | ✅ | :541-547 | :738-743 | yMultiplier = MAX_LETTER_HEIGHT + itemVerticalPadding 1:1 |
| `ListMenuInitInternal` | ✅ | :549-578 | :643-672 | Copie template `{...}` (= copie struct C, items par ref = ptr) ; init gListMenuOverride ; clamp `maxShowed=totalItems` ; Fill/PrintEntries/DrawCursor/Callback(onInit=TRUE) — ordre exact |
| `ListMenuPrint` | ✅ | :580-607 | :509-531 | colors[fill,cursor,shadow] + AddTextPrinterParameterized4(…, TEXT_SKIP_DRAW) ; override one-shot reset `enabled=false` 1:1 |
| `ListMenuPrintEntries` | ✅ | :609-629 | :535-553 | header_X vs item_X sur LIST_HEADER ; **itemPrintFunc appelé AVANT ListMenuPrint** 1:1 |
| `ListMenuDrawCursor` | ✅ | :631-660 | :559-586 | 4 cursorKind ; RED_* : `TILEMAP_LEFT*8-1 / TOP*8+y-1` (outline) et `+x / +y` (arrow) exacts. Indices attr hardcodés 1/2 = corrects (window.ts:273-274) |
| `ListMenuAddCursorObject` | ✅ | :662-675 | :1288-1299 | CursorStruct{0, DISPLAY_HEIGHT, width*8+2, height+2, 0x4000, TAG_NONE, 15} 1:1 |
| `ListMenuErasePrintedCursor` | ✅ | :677-692 | :591-604 | BLACK_ARROW only ; GetMenuCursorDimensionByFont w/h |
| `ListMenuUpdateSelectedRowIndexAndScrollOffset` | ✅ | :694-777 | :178-239 | **LE cœur — exact** : newRow up = `maxShowed-(⌊/2⌋+%2)-1`, down = `⌊/2⌋+%2` ; bords scrollOffset==0 / ==totalItems-maxShowed ; while skip LIST_HEADER ; retours 0/1/2 |
| `ListMenuScroll` | ✅ | :779-817 | :609-636 | count≥maxShowed → full redraw ; sinon ScrollWindow(dir 1 up / 0 down) + PrintEntries partiel + FillWindowPixelRect haut/bas — offsets exacts |
| `ListMenuChangeSelection` | ✅ | :819-864 | :273-312 | for×count + do-while header-skip + `selectionChange\|=ret` exact ; switch 0/1/2-3 → Erase/Scroll/Draw/Callback/Copy (via hooks auto-wirés au chargement = appels directs) |
| `ListMenuCallSelectionChangedCallback` | ✅ | :866-870 | :262-265 | moveCursorFunc(id, onInit, list) |
| `ListMenuOverrideSetColors` | ✅ | :873-879 | :754-759 | enabled=true (couleurs par écran) — unused C mais porté |
| `ListMenuDefaultCursorMoveFunc` | ✅ | :881-885 | :747-750 | `if (!onInit) PlaySE(SE_SELECT)` — SE joué 1:1 (utilisé par daycare.ts:174) |
| `ListMenuGetTemplateField` | 🟡 | :888-930 | :765-805 | MOVECURSORFUNC/2 → retourne 0 (ptr fn non représentable) ; **unused C, 0 caller** — reste 15 champs 1:1 |
| `ListMenuSetTemplateField` | ✅ | :932-988 | :813-867 | 17 champs 1:1 ; callers décomp (item_menu.c:1445, player_pc.c:1277, battle_pyramid_bag.c:1314) ne passent que CURSORKIND scalaire |
| `SpriteCallback_ScrollIndicatorArrow` | 🟡 | :997-1022 | :1417-1442 | State machine + sine math exacts (`(u8)`→`&0xFF`, `/256` trunc) ; état 0 : StartSpriteAnim runtime possiblement no-op sur sprite dynamique — frame déjà appliquée statiquement à la création (net identique) |
| `AddScrollIndicatorArrowObject` | 🟡 | :1024-1043 | :1446-1490 | CreateSpriteAtOam (précédent summary-screen) ; anims single-frame dissoutes : FRAME(0)/FRAME(0,hFlip)/FRAME(4)/FRAME(4,vFlip) → tileOffset+flips statiques (vérifiés vs sSpriteAnim_* :127-149) ; invisible=TRUE + data[0..5] 1:1 |
| `AddScrollIndicatorArrowPair` | ✅ | :1052-1094 | :1495-1535 | `u16 *scrollOffset` → getter live (adaptation pointeur documentée) ; sheet 0x100 + pal TAG_NONE→LoadPalette(OBJ_PLTT_ID)/sinon LoadSpritePalette ; palNum ré-appliqué via oamIndex (pitfall `.oam.paletteNum` respecté) |
| `AddScrollIndicatorArrowPairParameterized` | ✅ | :1096-1124 | :1541-1566 | Remplissage gTempScrollArrowTemplate champ-à-champ exact |
| `Task_ScrollIndicatorArrowPair` | ✅ | :1126-1140 | :1571-1584 | Seuils visibilité exacts (`==fullyUp && !=0xFFFF`, `==fullyDown`) ; +normalisation obj\|id task (pattern runtime obligatoire) |
| `Task_ScrollIndicatorArrowPairOnMainMenu` | ✅ | :1144-1159 | :1590-1604 | tIsScrolled = data[15] lu sur la TASK (main_menu.c:871/910/922) — consommé par main_menu.ts:1536 |
| `RemoveScrollIndicatorArrowPair` | ✅ | :1163-1176 | :1621-1631 | Free tiles/pal par tag + DestroySprite×2 + DestroyTask |
| `ListMenuAddCursorObjectInternal` | ✅ | :1178-1188 | :1276-1284 | dispatch + default→RedOutline 1:1 |
| `ListMenuUpdateCursorObject` | ✅ | :1190-1201 | :1303-1312 | |
| `ListMenuRemoveCursorObject` | ✅ | :1203-1214 | :1316-1325 | |
| `Task_RedOutlineCursor` | ✅ | :1216-1219 | :1086 | vide |
| `ListMenuGetRedOutlineCursorSpriteCount` | ✅ | :1221-1238 | :937-948 | 4 coins + 2/tranche-8px |
| `ListMenuSetUpRedOutlineCursorSpriteOamTable` | ✅ | :1240-1295 | :955-1005 | Wrap s8 explicite `_toS8` (136→-120, rowWidth+128…) = comportement champ s8 C exact |
| `ListMenuAddRedOutlineCursorObject` | 🟡 | :1297-1346 | :1126-1175 | CreateSpriteAtOam + GetSpriteTileStartByTag + SetSubspriteTables (signature adaptée) ; subspriteTableNum=0 implicite (table unique) ; priority/subpriority 0 ✅ |
| `ListMenuUpdateRedOutlineCursorObject` | ✅ | :1348-1354 | :1179-1187 | x+120/y+120 |
| `ListMenuRemoveRedOutlineCursorObject` | ✅ | :1356-1369 | :1191-1201 | Free(ptr)→GC ; frees par tag + DestroySprite(id) (sprite.ts:1427 accepte number ✅) |
| `SpriteCallback_RedArrowCursor` | ✅ | :1371-1375 | :1096-1099 | `gSineTable[(u8)d0]/64` trunc + `d0+=8` (masque &0xFF rend le non-wrap s16 équivalent) |
| `Task_RedArrowCursor` | ✅ | :1377-1380 | :1090 | vide |
| `ListMenuAddRedArrowCursorObject` | 🟡 | :1382-1426 | :1205-1247 | CreateSpriteAtOam 16×16 (shape0/size1 ✅) ; x2=8/y2=8 ; callback câblé |
| `ListMenuUpdateRedArrowCursorObject` | ✅ | :1428-1434 | :1251-1259 | |
| `ListMenuRemoveRedArrowCursorObject` | ✅ | :1436-1447 | :1263-1272 | |

## DONNÉES / TABLES

| Donnée | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `sMysteryGiftLinkMenu` | ✅ | :73-78 | :1648 | |
| `gTempScrollArrowTemplate` | 🟡 | :80 | :1389 | **Non exporté** — move_relearner.c:877-879 y écrit directement ; à exporter au port du move relearner |
| `gListMenuOverride` | ✅ | :83-91 | :433-440 | Module-privé OK (grep décomp : utilisé UNIQUEMENT dans list_menu.c) |
| `gMultiuseListMenuTemplate` | ✅ | :93 | :445-464 | Exporté, consommé par item_menu.ts ; copié par valeur dans Init 1:1 |
| `sScrollIndicatorTemplates` | ✅ | :96-108 | :1376-1381 | freq -8 stockée signée (round-trip u16→s16 identique) |
| `sOamData/sSpriteAnim*/sSpriteTemplate_ScrollArrowIndicator` | 🟡 | :110-168 | dissous :1460-1487 | 16×16 shape0/size1 + frames statiques (équivalence vérifiée frame par frame) |
| `sSubsprite_RedOutline1..8` | ✅ | :170-248 | :925-932 | tileOffset 0..7, 8×8 |
| `sOamData/anim/template_RedArrowCursor` | 🟡 | :250-287 | dissous :1222-1243 | 16×16 + callback ; FRAME(0,30) single = statique |
| `sRedInterface_Pal` / `sScrollIndicator_Gfx` / `sOutlineCursor_Gfx` / `sArrowCursor_Gfx` | ✅ | :289-292 | :1058-1060, :1385 | Clés assets → getAsset (adaptation INCBIN standard) |
| `gText_SelectorArrow2` | 🟡 | strings.c:215 | :428 | **Hardcodé `'▶'`** au lieu de `getString('gText_SelectorArrow2')` (règle never-hardcode-strings) ; player_pc.ts:1714 fait déjà le getString |
| Constantes/enums/structs list_menu.h | ✅ | h:6-126 | :68-170 | LIST_*, CURSOR_*, SCROLL_ARROW_*, LISTFIELD_*, structs — tous 1:1 |

## 🚨 MANQUES CRITIQUES

**Aucun dans le moteur lui-même.** Les 3 fonctions absentes (`ListMenuInitInRect`, `ChangeListMenuPals`, `ChangeListMenuCoords`) sont `// unused` en C avec 0 call-site décomp. Divergences fines sans effet en pratique :
1. Bitfields du template (`upText_Y:4`, `fontId:6`…) non masqués en TS — sans effet avec les valeurs décomp (toutes dans les plages).
2. `ListMenuGetTemplateField(MOVECURSORFUNC)` → 0 au lieu du pointeur (unused C, documenté).
3. `itemPrintFunc` reçoit `id` signé (LIST_HEADER=-3) vs cast u32 C — comparaisons équivalentes.
4. `sprite.data` = number[] (pas Int16Array comme le commentaire :1095 le prétend) — équivalent via masques `&0xFF`, mais le commentaire ment.

## RUSTINES À PURGER

1. **🚨 `src/engine/bag/bag-screen.ts` = CLONE local du moteur** (AddScrollIndicatorArrowPair :1125, SpriteCallback_ScrollIndicatorArrow :1192, Task_ScrollIndicatorArrowPair :1275, logique ProcessInput :2286-2372) — **ENCORE VIVANT** sur 2 chemins : sac de COMBAT (`src/battle_controller_player.ts:2062 → OpenBagScreenForBattle`) et ItemPC (`src/player_pc.ts:621 → OpenBagScreen(BAG_LOCATION_ITEMPC)`). Le sac overworld passe déjà par item_menu.ts (start_menu.ts:90). À purger quand item_menu.ts couvre BATTLE/ITEMPC (étape 9 du plan bag, cf. item_menu.ts:83-86/498).
2. **Indirection `_renderHooks`** (list_menu.ts:247-258 + auto-wire :876-881) — échafaudage de l'incrément 1 ; auto-wiré au chargement du module donc comportement 1:1, mais l'indirection `?.` peut être fusionnée en appels directs (le C appelle directement).
3. `const rt` morts dans ListMenuRemoveRed*CursorObject / RemoveScrollIndicatorArrowPair (list_menu.ts:1197, :1268, :1626) — variables inutilisées.
4. `gText_SelectorArrow2 = '▶'` hardcodé (list_menu.ts:428) → migrer vers `getString`.

## CALL-SITES ORPHELINS (moteur prêt, consommateurs absents)

Décomp : 16 fichiers / 77 appels de l'API. Port : 6 consommateurs branchés ✅ (`item_menu.ts`, `shop.ts`, `player_pc.ts`, `daycare.ts`, `main_menu.ts`, `international_string_util.ts` [type]). Manquent :

| Décomp (appels) | Port | Impact solo |
|---|---|---|
| `field_specials.c` ScrollableMultichoice (:2625, 3 appels) | `specials-registry.ts:1045` = **no-op** ; rien dans field_specials.ts | 🔴 SOLO (Frontier exchange, vendeurs scrollables) |
| `move_relearner.c` (5 appels + écrit gTempScrollArrowTemplate :877) | **aucun port** | 🔴 SOLO (Maître des Capacités) |
| `pokeblock.c` (6) | pokeblock.ts SANS la liste (juste sSavedPokeblockData :65-73) | 🔴 SOLO (PokéblockCase, déjà connu) |
| `decoration.c` (3) / `secret_base.c` (3) | ports existent, partie liste absente | 🟠 SOLO (décos/base secrète) |
| `menu_specialized.c` (2, dont gMultiuseListMenuTemplate :296) | menu_specialized.ts sans liste | 🟠 (move relearner UI) |
| `battle_pyramid_bag.c` (7) | aucun port | 🟠 frontier |
| `union_room.c` (12), `mystery_gift_menu/view.c` (4) | aucun port | ⚪ link |
