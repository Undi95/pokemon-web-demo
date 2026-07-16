# Câblage écran CONDITION du Pokénav — 2026-07-16

Chantier : résorber les `__wireTodo` de `src/pokenav_conditions_gfx.ts` (59) et
`src/pokenav_conditions_search_results.ts` (27), + fermeture transitive
`src/pokenav_conditions.ts` (14 sentinelles + 6 lets INCGFX). **`npx tsc --noEmit` = 0.**
Pas encore testé en jeu (à faire par la session principale, recette en bas).

## Fichiers modifiés / étendus
- `src/menu_specialized.ts` — **+~1000 lignes transcrites 1:1** de `menu_specialized.c`
  (section B) : module ConditionGraph complet (:330-707), `GetBoxOrPartyMonData` (:893-913),
  `MoveConditionMon*`/`ConditionMenu_UpdateMon*` (:1093-1125), templates/sheets sprites +
  système sparkles complet (:1127-1511), constantes du header, macro `GET_NUM_CONDITION_SPARKLES`,
  `SHIFT_RIGHT_ADJUSTED`, factory `NewConditionGraph()` (adaptation Alloc-zéroé), assets +
  `PrefetchConditionSpriteAssets`/`ConditionSpriteAssetsReady`.
- `src/pokenav_conditions.ts` — câblé + revue transpileur (détail plus bas) + adaptation pics mon.
- `src/pokenav_conditions_gfx.ts` — câblé + 4 adaptations locales + assets + gates + box monTransitionX.
- `src/pokenav_conditions_search_results.ts` — câblé + assets + fixes ASSIGN/deref/sizeof.
- `src/mon_markings.ts` — `CreateMonMarkingAllCombosSprite` (mon_markings.c:570-575) +
  `sAnims_MarkingCombo` (16 combos, FRAME(i*4)) ; `CreateMarkingComboSprite` prend un param
  `anims` optionnel (null conservé pour le chemin PC).
- `src/pokenav.ts` — `SetVBlankCallback_` (1:1 pokenav.c:537-540, non-static) + appels
  `PrefetchConditionGraphAssets()`/`PrefetchConditionSearchResultsAssets()` dans `CB2_InitPokeNav`.
- `src/pokemon_storage_system.ts` — 4 exports ajoutés (aucune logique changée) :
  `GetBoxNamePtr`, `SetBoxMonDataAt`, `GetBoxMonData`, `GetAndCopyBoxMonDataAt`.
- `src/text.ts` — **case `EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW` implémenté 1:1**
  (text.c:995-1003, BEGIN+sub+3 args = avance de 5 ; même structure que les cases
  COLOR/HIGHLIGHT/SHADOW voisins). Sans lui, bg/shadow étaient rendus comme glyphes.
- `audit-reports/engine/assets-needed-conditions.md` — mapping assets (AUCUN manquant).

## Mapping wireTodo → résolution

### pokenav_conditions_gfx.ts (59)
| Résolution | Symboles |
|---|---|
| import `./pokenav_main_menu` (16, existants) | AreLeftHeaderSpritesMoving, CopyPaletteIntoBufferUnfaded, DecompressAndCopyTileDataToVram, FreeTempTileDataBuffersIfPossible, InitBgTemplates, IsPaletteFadeActive, LoadLeftHeaderGfxForIndex, MainMenuLoopedTaskIsBusy, PokenavFadeScreen, PokenavFillPalette, Pokenav_AllocAndLoadPalettes, PrintHelpBarText, SetLeftHeaderSpritesInvisibility, ShowLeftHeaderGfx, SlideMenuHeaderDown, WaitForHelpBar |
| import `./pokenav_conditions` (14, existants) | GetConditionGraphCurrentListIndex, GetConditionGraphMenuCurrentLoadIndex, GetConditionGraphPtr, GetConditionMonDataBuffer, GetConditionMonLocationText, GetConditionMonNameText, GetConditionMonPal, GetConditionMonPicGfx, GetMonListCount, GetNumConditionMonSparkles, IsConditionMenuSearchMode, LoadConditionGraphMenuGfx, LoadNextConditionMenuMonData, TryGetMonMarkId |
| **TRANSCRITS** `./menu_specialized` (16) | ConditionGraph_Draw, _InitResetScanline, _InitWindow, _ResetScanline, _SetNewPositions, _TryUpdate, ConditionMenu_UpdateMonEnter/Exit, MoveConditionMonOffscreen, Create/Destroy/Free/Reset ConditionSparkle*, LoadConditionSparkle, LoadConditionSelectionIcons, LoadConditionMonPicTemplate |
| import `./mon_markings` (4 ; 1 TRANSCRIT) | BufferMonMarkingsMenuTiles, FreeMonMarkingsMenu, InitMonMarkingsMenu, OpenMonMarkingsMenu (existants) + **CreateMonMarkingAllCombosSprite (transcrit)** |
| import `./pokenav` (2 ; 1 TRANSCRIT) | SetPokenavVBlankCallback (existant), **SetVBlankCallback_ (transcrit 1:1 pokenav.c:537)** |
| import harness (1, existant) | BgDmaFill (decomp-globals) |
| **ADAPTATION LOCALE** (1) | DmaCopy16Defvars → écrit `rt.gba.objVram` (adresse OBJ VRAM → offset ; précédent match-call :1328) |
| **ASSETS** (4) | gPokenavCondition_Gfx/Pal/Tilemap, gPokenavOptions_Tilemap (cf. assets-needed-conditions.md) |
| + 5 lets INCGFX câblés | gConditionGraphData_Pal, gConditionText_Pal, sConditionGraphData_Gfx, sConditionGraphData_Tilemap, sMonMarkings_Pal |

Adaptations locales supplémentaires (shadowing des imports, documentées dans le fichier) :
`LZ77UnCompVram(asset, bufferStruct)` (copie RAM→RAM, nos assets sont déjà décompressés),
`SetBgTilemapBuffer(bg, buffer)` (matérialise le « pointage » : copie dans le tilemap live,
window.ts:1420 est no-op), `CpuFill32(v, buffer, n)` (dest = TypedArray).

### pokenav_conditions_search_results.ts (27)
| Résolution | Symboles |
|---|---|
| import `./pokenav_main_menu` (13) | AreLeftHeaderSpritesMoving, CopyPaletteIntoBufferUnfaded, DecompressAndCopyTileDataToVram, FreeTempTileDataBuffersIfPossible, InitBgTemplates, IsPaletteFadeActive, LoadLeftHeaderGfxForIndex, MainMenuLoopedTaskIsBusy, PokenavFadeScreen, PrintHelpBarText, SetLeftHeaderSpritesInvisibility, ShowLeftHeaderGfx, SlideMenuHeaderDown |
| import `./pokenav_list` (9) | CreatePokenavList, DestroyPokenavList, IsCreatePokenavListTaskActive, PokenavList_GetSelectedIndex/_IsMoveWindowTaskActive/_MoveCursorDown/_MoveCursorUp/_PageDown/_PageUp |
| import `./pokenav_looped_task` (1) | LT_SET_STATE |
| import `./pokemon_storage_system` (1, export ajouté) | GetBoxMonData |
| **ASSETS** (3) | gConditionSearchResultFramePal/Tilemap/Tiles |
| + 1 let INCGFX câblé | sListBg_Pal |

### pokenav_conditions.ts (fermeture transitive, 14 sentinelles)
| Résolution | Symboles |
|---|---|
| **TRANSCRITS** `./menu_specialized` (5) | ConditionGraph_CalcPositions, ConditionGraph_Init, ConditionGraph_SetNewPositions, GET_NUM_CONDITION_SPARKLES (macro), GetBoxOrPartyMonData |
| import `./pokemon_storage_system` (2, exports ajoutés) | GetBoxNamePtr, SetBoxMonDataAt |
| import `./mon_markings` (1, existant) | HandleMonMarkingsMenuInput |
| import `./pokenav_conditions_gfx` (1, existant — arête 1:1 des deux .c via pokenav.h) | GetMonMarkingsData |
| **ADAPTATIONS assets** (5) | LoadSpecialPokePic + LZ77UnCompWram + GetMonSpritePalFromSpeciesAndPersonality + gMonFrontPicTable → fetch `anim_front.png` frame 0 + `normal.pal` DANS les buffers struct (précédent EXACT : `PreloadDisplayMonPic` pokemon_storage_system.ts:1348) ; gKeyRepeatStartDelay → let local no-op (précédent :1401) |

## Revue transpileur (TRANSPILER-TODO résolus, tous flaggés dans les fichiers)
- `CopyStringLeftAlignedToConditionData` : les `*dst++ = *src++` étaient des `void 0` →
  **boucle infinie garantie** (src jamais consommé). Réécrit en index-walk 1:1.
- `CopyConditionMonNameGender` : corps entier en `void 0` (aucun texte écrit) → index-walk 1:1
  complet (codes couleur, genre ♂/♀, niveau, padding). Frontières strings JS
  (gText_EggNickname, gSpeciesNames, gText_InParty, GetBoxNamePtr) → `encodeOwText`.
- `CONDITION_GRAPH_CENTER_Y` inliné à **91.5** (division JS) — la division C entière donne
  **91**. Consolidé via l'import menu_specialized.
- `InsertMonListItem` : `monData[i] = item` (TRANSPILER-TODO deref) partageait LA MÊME ref
  pour toutes les entrées (l'appelant réutilise `item`) → copie par valeur `{...}`.
- `BufferSearchMonListItem` / `PrintSearchResultListMenuItems` : `*s++ = X` / `*gStringVar1 = EOS`
  en `void 0` → index-walk ; `GetMonData/GetBoxMonData(mon, NICKNAME, gStringVar3)` n'écrit pas
  dst chez nous (string JS) → `StringCopy(gStringVar3, encodeOwText(...))` (garde bd6ee7f31).
- `sizeof(sListBg_Pal)` rendu `.length` (=16) au lieu d'octets → `.length * 2`.
- `SetMonData(..., MON_DATA_MARKINGS, markings)` recevait le box `{v}` (lu 0) → `.v`.
- `&gSprites[id]` perdus par le transpileur : sans impact (DestroySprite accepte id|objet).

## Adaptations moteur (toutes avec précédent cité en commentaire)
1. **Assets fetch + gate LT_PAUSE** (précédent `PrefetchMatchCallAssets` + case 0 match-call) :
   3 Prefetch* appelés dès CB2_InitPokeNav ; gates aux case 0 des looped-tasks d'ouverture ;
   échec = console.error (jamais de gel silencieux, Règle 3).
2. **Pics mon async** (précédent `PreloadDisplayMonPic` PC storage) : écrit dans les buffers
   struct stables `menu.monPicGfx/monPal[loadId]` ; champ d'adaptation `menu.monPicLoaded[]`
   + `IsConditionMonPicLoaded(loadId)` gate les 3 sites `CreateConditionMonPic` (open case 7,
   TransitionMons case 4, MoveCursorNoTransition case 3). Slot « Cancel » = marqué prêt
   (sinon gel sur équipe 100 % œufs).
3. **`menu.monTransitionX` = box `{v}`** (convention pointer-walks C → refs) : `&x` est muté
   par MoveConditionMon*/ConditionMenu_UpdateMon* ; 2 sites réécrits (`.v = -80`, `.v + 38`),
   les 6 appels passent la box telle quelle.
4. **Matérialisation des structs** (précédent match-call `trainerPicGfx = new Uint8Array`) :
   `_materializeConditionMenu` (monPal/monPicGfx/nameText/locationText/graph/numSparkles/monMarks),
   `NewConditionGraph()`, tilemapBuffers/partyPokeballSpriteIds/marksMenu/conditionSparkleSprites
   dans OpenConditionGraphMenu, `monData[426]` (2 sites AllocSubstruct MON_LIST — objets distincts).
5. **Scanline WIN0H/WIN1H** : `sConditionGraphScanline` = dmaDest REG_OFFSET_WIN0H + 32-bit →
   le harness écrit WIN0H et WIN1H depuis le buffer entrelacé (scanline_effect.ts:190-192,
   support déjà en place). `ConditionGraph_Draw` remplit `gScanlineEffectRegBuffers[0|1]` 1:1.
6. **Quirk décomp conservé** : `sConditionSparkle_Gfx` = PALETTE et `sConditionSparkle_Pal` =
   TILES (noms inversés dans menu_specialized.c:1129-1130) — commenté aux deux bouts.

## Ce qui reste inerte / hors périmètre
- `GetConditionMenuMonString` / `BufferConditionMenuSpacedStringN` /
  `GetConditionMenuMonNameAndLocString` / `GetConditionMenuMonConditions` /
  `GetConditionMenuMonGfx` (menu_specialized.c:916-1091) : consommés UNIQUEMENT par
  use_pokeblock.c (hors périmètre solo Pokénav) — NON transcrits, listés dans l'en-tête du fichier.
- `pokenav_ribbons_list.ts` (27 wireTodo, dont le même `GetBoxMonData` désormais exporté) :
  autre chantier, non touché (agents en vol).
- `pokenav_menu_handler_gfx.ts` / `pokenav_region_map.ts` ont chacun un wrapper local
  `SetVBlankCallback_` dupliqué — consolidation possible vers l'export pokenav.ts (region_map
  = fichier interdit ce tour, non touché).
- Le shiny n'est pas résolu pour le pic (normal.pal, comme le PC storage — même dette).

## Comment tester en jeu (session principale)
1. **Mode équipe** : ouvrir le menu Start → POKéNAV → CONDITION (2e entrée) → « ÉQUIPE » (index 7).
   Attendu : fond graph, radar pentagonal animé (transition depuis le centre), pic du mon glissant
   depuis la gauche, nom+genre+niveau (fenêtre haut-droite), 6 pokéballs + CANCEL à droite,
   sparkles si sheen > 0. ↑/↓ = mon suivant/précédent (graphe interpolé 10 frames, pic slide out/in).
   Sur « ANNULER » : graphe se vide, pic sort. B ou A-sur-CANCEL = retour menu CONDITION.
2. **Mode recherche** : CONDITION → SUPER (index 8..12 : SANG-FROID/BEAUTÉ/GRÂCE/INTELLIGENCE/ROBUSTESSE)
   → liste des mons triés (rang « Nº ») ; ↑/↓ scroll, ←/→ page ; A = graphe du mon
   (localisation ÉQUIPE/nom de boîte + « Nº xxx »), A = menu MARQUER (●■▲♥ via mon_markings),
   B = retour liste (liste conservée), B = retour menu recherche.
3. Sondes utiles : `window.__rt` ; `rt.gPlttBufferUnfaded.get(16*1+i)` (pal graph),
   `.get(16*3+i)` (graph_data), `.get(16*15+i)` (texte) ; les gates loggent en console.error
   en cas d'asset manquant.

## Risques connus pour le test
- Rendu du POLYGONE : dépend du pipeline scanline→compositor par-ligne (WIN0H/WIN1H). Le code
  et les buffers sont 1:1 ; si le compositor n'applique pas WIN0H par scanline (fix ④ de la
  file d'audit moteur), le graphe apparaîtra plein-cadre ou absent — bug MOTEUR, pas écran.
- Blend BLDCNT (BG2 sur BG3, alpha 11/4) : dépend du support blend du compositor.
- Premier lancement réseau froid : les gates attendent les fetchs (console.error si échec).
