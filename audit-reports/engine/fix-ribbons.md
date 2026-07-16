# fix-ribbons — câblage des écrans RUBANS du Pokénav

Câblage 1:1 de `src/pokenav_ribbons_list.ts` + `src/pokenav_ribbons_summary.ts`
(transpilés, référencés par `pokenav.ts` indices 12-14). 47 `__wireTodo` réels
(27 liste + 20 summary — l'inventaire annonçait « 27 chacun » ; le grep donne 27 + 20).

## Résultat (47 wireTodo = 27 liste + 20 summary)
- **Câblés par import** : 36 (helpers déjà portés : `pokenav_main_menu` ×22, `pokenav_list` ×9,
  `pokenav_looped_task` ×1, `sprite` ×1, `decomp-globals` ×1, `decomp-runtime`/`gKeyRepeat` ×2)
- **Câblés par alias** : 2 (`GetBoxMonData = GetMonData`, liste + summary)
- **Transcrits 1:1** : 3 (fonction `CreateMonPicSprite_HandleDeoxys` + 2 tables data
  `gRibbonDescriptionPointers` / `gGiftRibbonDescriptionPointers`)
- **Assets data-gfx** : 6 wireTodo (`gMonRibbonListFrame*` ×3, `gPokenavRibbonsSummaryBg_*` ×3) —
  + les `let=null` INCGFX (`sRibbonIcons1..5_Pal`, `sMonInfo_Pal`, `sRibbonIcons{Small,Big}_Gfx`,
  `sMonRibbonListUi_Pal`) remplis par les mêmes loaders. **Tous les binaires déjà présents.**
- **Dépendances bloquées (fichiers interdits)** : **0**
- `npx tsc --noEmit` : mes 4 fichiers = **0 erreur**. (1 erreur résiduelle hors-scope, cf. bas.)

## Fichiers créés / modifiés
- `src/pokenav_ribbons_list.ts` — imports câblés, inits struct, loaders assets, fixes pointeurs.
- `src/pokenav_ribbons_summary.ts` — idem + data ribbon descriptions + structs data + mon-pic.
- `src/trainer_pokemon_sprites.ts` — **PORT 1:1** de `CreateMonPicSprite_HandleDeoxys` →
  `CreateMonPicSprite` → `CreatePicSprite` (voie non-affine, substrat sync, c:165-347).
- `src/pokenav.ts` — `PrefetchRibbonsListAssets()` + `PrefetchRibbonsSummaryAssets()` dans `CB2_InitPokeNav`.
- `audit-reports/engine/assets-needed-ribbons.md` — mapping assets (tous présents).

## Mapping wireTodo → résolution

### LISTE (`pokenav_ribbons_list.ts`) — 27
| # | symbole | résolution |
|---|---|---|
| 1-13 | `AreLeftHeaderSpritesMoving`, `CopyPaletteIntoBufferUnfaded`, `DecompressAndCopyTileDataToVram`, `FreeTempTileDataBuffersIfPossible`, `InitBgTemplates`, `IsPaletteFadeActive`, `LoadLeftHeaderGfxForIndex`, `MainMenuLoopedTaskIsBusy`, `PokenavFadeScreen`, `PrintHelpBarText`, `SetLeftHeaderSpritesInvisibility`, `ShowLeftHeaderGfx`, `SlideMenuHeaderDown` | **import `./pokenav_main_menu`** |
| 14-22 | `CreatePokenavList`, `DestroyPokenavList`, `IsCreatePokenavListTaskActive`, `PokenavList_GetSelectedIndex`, `PokenavList_IsMoveWindowTaskActive`, `PokenavList_MoveCursorDown`, `PokenavList_MoveCursorUp`, `PokenavList_PageDown`, `PokenavList_PageUp` | **import `./pokenav_list`** |
| 23 | `LT_SET_STATE` | **import `./pokenav_looped_task`** |
| 24 | `GetBoxMonData` | **alias `= GetMonData`** (modèle unifié BoxPokemon→Pokemon ; précédent `mail_data.ts:43`) |
| 25-27 | `gMonRibbonListFrameTiles`, `gMonRibbonListFrameTilemap`, `gMonRibbonListFramePal` | **asset** (module-var + `_loadRibbonsListAssets`, cf. assets-needed) |

### SUMMARY (`pokenav_ribbons_summary.ts`) — 20
| # | symbole | résolution |
|---|---|---|
| 1-9 | `CopyPaletteIntoBufferUnfaded`, `DecompressAndCopyTileDataToVram`, `FreeTempTileDataBuffersIfPossible`, `InitBgTemplates`, `IsPaletteFadeActive`, `PokenavFadeScreen`, `PokenavFillPalette`, `Pokenav_AllocAndLoadPalettes`, `PrintHelpBarText` | **import `./pokenav_main_menu`** |
| 10 | `FreeSpriteOamMatrix` | **import `./sprite`** |
| 11 | `BgDmaFill` | **import `../harness/runtime/decomp-globals`** |
| 12-13 | `gKeyRepeatContinueDelay`, `gKeyRepeatStartDelay` | **conteneur `gKeyRepeat.{continueDelay,startDelay}`** (`decomp-runtime`) — 2 lignes d'assignation réécrites (ESM export ≠ mutable) |
| 14 | `CreateMonPicSprite_HandleDeoxys` | **TRANSCRIT 1:1** dans `trainer_pokemon_sprites.ts` (foyer décomp = `trainer_pokemon_sprites.c`, NON interdit) |
| 15 | `GetBoxMonData` | **alias `= GetMonData`** |
| 16-17 | `gRibbonDescriptionPointers`, `gGiftRibbonDescriptionPointers` | **TRANSCRITS 1:1** (data `ribbon_descriptions.h` + `gift_ribbon_descriptions.h`, inclus dans le .c:144-145) → `encodeOwText` |
| 18-20 | `gPokenavRibbonsSummaryBg_Gfx`, `gPokenavRibbonsSummaryBg_Tilemap`, `gPokenavRibbonsSummaryBg_Pal` | **asset** (+ `_loadRibbonsSummaryAssets` remplit aussi les `let=null` INCGFX `sRibbonIcons*_Pal`/`sMonInfo_Pal`/`sRibbonIcons*_Gfx`) |

## Fixes TRANSPILER-TODO (hors __wireTodo — bloquaient le comportement correct)
- **Idiome `*ptr++ = CHAR`** (4 sites : `DrawListIndexNumber`, `BufferRibbonMonInfoText`,
  `PrintRibbbonsSummaryMonInfo`, `PrintRibbonsMonListIndex`) → `ptr[0]=CHAR; ptr=ptr.subarray(1)`
  (précédent `rtc.ts:229`). `ConvertIntToDecimalStringN`/`StringCopy` rendent le pointeur EOS.
- **`InsertMonListItem`** : `monData[i] = *item` = **copie par valeur** (le caller réutilise le même
  `item` local → stocker la référence pointerait toutes les entrées sur la dernière). → `{...item}`.
- **`sRibbonData` / `sRibbonGfxData`** : tableaux positionnels transpilés → **objets à champs nommés**
  (`{numBits,numRibbons,ribbonId,isGiftRibbon}` / `{tileNumOffset,palNumOffset}`) car le code lit `.numBits` etc.
- **`DrawAllRibbonsSmall`** : `&sRibbonDraw_Total` (out-param) → box `{v}` recopié dans le global ;
  `*(ribbonIds++)` → index `ribbonIds[ri++]`.
- **`GIFT_RIBBON_ROW`** : `FIRST_GIFT_RIBBON / RIBBONS_PER_ROW` = division **ENTIÈRE** C (25/9=2) →
  `Math.trunc(...)` (sinon `GIFT_RIBBON_START_POS` faux → positions gift ribbons décalées).
- **`sizeof(pal)`** en octets : `pal.length` (u16) → `pal.length * 2` (octets, `CopyPaletteIntoBufferUnfaded` fait `>>1`).
- **Inits structs** (AllocSubstruct rend `{}`) : `menu.buff`=Uint8Array(0x800) ; `monList.monData`=[] ;
  `ribbonIds`=U32(25) ; `giftRibbonIds`=U32(7) ; `tilemapBuffers`=[U8(0x800),U8(0x800)].

## Mon front pic (summary) — adaptation async
`CreateMonPicSprite_HandleDeoxys` porté 1:1 (substrat sync `_monPicSubstrate` keyé par enumName ;
bridge `species` numérique → `reverseDecompConstant`). Préchargement de la front pic du mon courant
(`front.png`+`normal.pal`, pattern pokédex `_preloadNewEntryMonPic`) lancé à `PokenavCallback_Init`
+ au `case 0` du switch-mon ; **gate `_settled`** au `case 6` (open) et `case 5` (switch) ; **gardes**
aux déréférencements `gSprites[spriteId]` (0xFFFF si pic 404/en vol → no-op, jamais de crash/freeze).

## Dépendances bloquées (fichiers interdits) : AUCUNE
`GetBoxMonData` (foyer `pokemon.c` interdit) résolu SANS éditer `pokemon.ts` (alias sur `GetMonData`
importé de `party-storage`). `CreateMonPicSprite_HandleDeoxys` vit dans `trainer_pokemon_sprites.c`
(NON interdit) → porté sur place.

## Commande debug « donner un ruban » (test en jeu)
`hasAnyRibbons` (⟹ entrée RUBANS visible) = `AnyMonHasRibbon()` = `GetMonData(mon, MON_DATA_RIBBON_COUNT) != 0`.
Les rubans sont des champs directs du mon (`mon.championRibbon`, `mon.coolRibbon`, …). `gSaveBlock1Ptr`
est exposé sur `globalThis` (`gba-global-scope.ts:103`) ; la party vit dans `gSaveBlock1Ptr.playerParty`.

**AVANT d'ouvrir le Pokénav**, en console :
```js
// 1 ruban (Champion) → entrée RUBANS apparaît + summary affiche 1 ruban
gSaveBlock1Ptr.playerParty[0].championRibbon = 1
```
```js
// Test riche : Champion + 4 rangs Sang-Froid + Beauté(2) + Effort + Artiste
Object.assign(gSaveBlock1Ptr.playerParty[0],
  { championRibbon:1, coolRibbon:4, beautyRibbon:2, effortRibbon:1, artistRibbon:1 })
```
(`coolRibbon:4` = 4 rubans concours normal→master ; `MON_DATA_RIBBONS` packe champion=bit0, cool<<1, …
1:1 `pokemon.ts:1483`.) `hasAnyRibbons` est calculé à l'ouverture du Pokénav → poser le ruban AVANT.

## Chemin d'inputs du test
1. `?debug` (équipe Léviator+Surf) → console : commande ruban ci-dessus.
2. Start menu (X puis flèches) → **POKéNAV** → menu principal ouvre.
3. Curseur sur **RUBANS** (visible car `hasAnyRibbons`) → **A** → écran LISTE (mons à rubans, `N/M`).
4. Flèches haut/bas = curseur ; gauche/droite = page. **A** sur un mon → écran SUMMARY.
5. Summary : front pic mon + rubans (petites icônes) + compteur. Haut/bas = changer de mon (slide).
6. **A** sur une icône ruban → zoom + nom/description (2 lignes). Flèches = déplacer la sélection.
7. **B** = replier ; **B** = retour LISTE ; **B** = retour menu principal.

## tsc — erreur(s) résiduelle(s) HORS-SCOPE (agent concurrent)
`pokenav.ts` référence des `Prefetch*Assets` de sous-menus CONDITION ajoutés par un agent concurrent,
pas encore exportés de leurs fichiers = **INTERDITS** (`pokenav_conditions_gfx.ts`,
`pokenav_conditions_search_results.ts`). Compte observé décroissant pendant mon travail (2 → 1 au fur
et à mesure que l'agent exporte) ; dernière mesure = **1** (`PrefetchConditionSearchResultsAssets`).
Se résout quand cet agent finit ; je n'y touche pas (interdits). **Mes 4 fichiers = 0 erreur.**
