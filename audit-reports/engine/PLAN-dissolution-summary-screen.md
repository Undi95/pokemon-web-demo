# PLAN de consolidation 1:1 — `pokemon_summary_screen.ts`

Défrichage LECTURE SEULE — préparation de la consolidation de `pokemon_summary_screen.c`
(décomp 4183 l.) vers son foyer miroir `src/pokemon_summary_screen.ts`.

Oracle : `node scripts/decomp-index.cjs --file pokemon_summary_screen.c` →
**139 fns : 97 portées · 21 référencées(non-déclarées) · 21 absentes**.

> **DIFFÉRENCE MAJEURE avec le modèle `PLAN-dissolution-bag-screen.md` : il n'y a AUCUN
> CLONE à dissoudre.** `src/pokemon_summary_screen.ts` (3466 l.) EST le foyer miroir et
> l'unique implémentation. Le seul autre fichier `*summary*` du repo est
> `src/pokenav_ribbons_summary.ts` (écran Pokénav distinct, pas un clone). La
> « consolidation » ici = **restaurer le 1:1 STRUCTUREL** (noms exacts + state-machines
> frame-steppées) pour les fns qui vivent aujourd'hui sous **noms drift / inlinées / dans
> un autre foyer légitime**. **Fonctionnellement, l'écran est quasi-complet en solo.**

---

## 0. Résumé exécutif (verdicts)

| Question | Verdict |
|---|---|
| Que manque-t-il **VISIBLEMENT** en solo ? | **Presque rien.** Scroll de page ◄► = **OK**. Changement de mon ▲▼ (party/single) = **OK**. Cri = **OK**. Anims du mon (intro affine) = **OK**. Sprites (pic/ball/markings/statut) = **OK**. Pages Info/Talents/Capacités/Concours = **OK**. Sélection/réordre/remplacement de capacité (mode SELECT_MOVE) = **OK**. **Seule lacune solo-atteignable : la navigation ▲▼ entre mons D'UNE BOÎTE PC** (aujourd'hui mono-mon, `pokemon_storage_system.ts:6557-6560`). |
| Pourquoi l'oracle dit « 2/3 porté » alors que ça marche ? | **Drift de NOMS + inlining.** Les fns clés existent sous d'autres noms que l'oracle ne matche pas : `Task_HandleInput`→`Task_Summary_HandleInput` (:3160), `ChangePage`→`_changePage` (:2246), `PssScrollRight/Left`→`_taskPssScrollRight/Left` (:2170/:2204), `ChangeSummaryPokemon`+`Task_ChangeSummaryMon`→`_changeSummaryPokemon` (:2284). L'oracle mappe même `Task_HandleInput` vers `naming_screen.ts:2056` (collision de nom homonyme, FAUX positif). |
| Où vivent les fns « en adaptation » ? | **2 foyers légitimes** : (a) **`src/pokemon_animation.ts`** = anims mon-pic (`PokemonSummaryDoMonAnimation` :2030, `StopPokemonAnimations` :2063, `SummaryScreen_DestroyAnimDelayTask`/delay-task :2054-2058) ; (b) **`src/pokemon_storage_system.ts`** = navigation boîte (`AdvanceStorageMonIndex` :1087) + point d'entrée box (`OpenSummaryScreen` :6562). |
| Le changement de mon est-il 1:1 ? | **Fonctionnellement oui, STRUCTURELLEMENT non.** `_changeSummaryPokemon` (:2284) collapse la state-machine décomp `Task_ChangeSummaryMon` (13 cases 0-12, 1 case/frame, :1628-1694) en **une seule chaîne async `.then()`** (:2346-2385). Input bien gaté (task détruite pendant le change). C'est le SEUL vrai écart Règle-1 comportemental. |
| Le cri + l'anim sont-ils là ? | **OUI, 1:1.** `_playMonCryOnce` (:2139) = `PlayMonCry` (:3963) inliné (`PlayCry_ByMode` NORMAL/WEAK, skip si œuf) + `PokemonSummaryDoMonAnimation` (pokemon_animation.ts). Déclenchés via `_spriteCB_Pokemon` (:2063) = `SpriteCB_Pokemon` (:3994), gate `!gPaletteFade.active && data[2]!=1`. |
| Le loader mon-pic est-il là ? | **OUI.** `LoadMonGfxAndSprite` (:3900) = `_loadMonFrontPic` + `_createMonSprite` (:2029, commentaires :806/:936). Front-pic 2 frames chargé en OBJ VRAM. |
| Combien de lots ? | **6 lots** (5 de consolidation 1:1 structurelle + 1 lot fonctionnel BOX-nav), tous ≤ ~300 l. diff. Aucune régression : le foyer reste fonctionnel à chaque lot. |
| Risque n°1 | **La re-transcription de `Task_ChangeSummaryMon` en state-machine frame-steppée (Lot 3).** Remplacer la chaîne `.then()` par 13 cases synchrones touche le chemin le plus sensible (destroy sprites → extract data → reload pic → recreate sprites → slide statut). Un ordre de case faux = sprite du mauvais mon / freeze / statut fantôme (bugs déjà payés, cf. commentaires :2308-2384). |

---

## 1. Cartographie du foyer

### 1.a Ce que le foyer `.ts` COUVRE réellement (au-delà des 97 « déclarés »)

Le foyer porte **tout le cycle de vie + les 5 pages + la navigation + le mode SELECT_MOVE**.
Sous-systèmes complets (drift de noms tolérés) :

| Sous-système | Fns foyer (`.ts:ligne`) | Décomp (`.c:ligne`) | État |
|---|---|---|---|
| **Boot / CB2 / graphics** | `CB2_InitSummaryScreen`:3279, `_initBGs`:692, `_loadSummaryGraphicsCb2`, `_decompressGraphics`, `_resetWindows`:894 | `CB2_InitSummaryScreen`:1170, `LoadGraphics`:1175 (25 états), `InitBGs`:1302, `DecompressGraphics`:1321, `ResetWindows`:2721 | ✅ 1:1 |
| **Extraction mon** | `_extractMonData` (appelé :2343) | `CopyMonToSummaryStruct`:1386 + `ExtractMonDataToSummaryStruct`:1400 | ✅ (2 fns fusionnées) |
| **Page INFO** | `_printInfoPageText`:1209, `_bufferMonTrainerMemo`:1149, gender inliné :1021, œuf `_printEgg*`:1175-1206 | `PrintInfoPageText`:3028, `BufferMonTrainerMemo`:3116, `PrintGenderSymbol`:2805, `PrintEgg*`:3241-3277 | ✅ 1:1 |
| **Page TALENTS (skills)** | `_printSkillsPageText`:1370, `_bufferLeft/RightColumnStats`:1270/1292, `_drawExperienceProgressBar`:1332, `_printExpPointsNextLevel`:1309 | `PrintSkillsPageText`:3301, `Buffer*ColumnStats`:3391/3421, `DrawExperienceProgressBar`:2636 | ✅ 1:1 |
| **Pages CAPACITÉS / CONCOURS** | `_printBattleMoves`:1500, `_printContestMoves`:1518, `_drawContestMoveHearts`:1475, `_printMoveNameAndPP`:1401, `_printMoveDetails`:1447 | `PrintBattleMoves`:3460, `PrintContestMoves`:3595, `DrawContestMoveHearts`:2678 | ✅ 1:1 |
| **Print tasks (frame-steppées)** | `_taskPrintInfoPage`:~1555, `_taskPrintBattleMoves`:1574, `_taskPrintContestMoves`:1611, `_taskPrintSkillsPage` | `Task_PrintInfoPage`:3048, `Task_PrintBattleMoves`:3482, `Task_PrintContestMoves`:3609, `Task_PrintSkillsPage`:3312 | ✅ 1:1 (drift nom) |
| **Nav PAGE ◄►** | `Task_Summary_HandleInput`:3160, `_changePage`:2246, `_taskPssScrollRight`:2170, `_taskPssScrollLeft`:2204 | `Task_HandleInput`:1532, `ChangePage`:1761, `PssScrollRight`:1785(+End:1815), `PssScrollLeft`:1828(+End:1845) | ✅ 1:1 (drift nom ; `*End` inlinés) |
| **Nav MON ▲▼** | `_changeSummaryPokemon`:2284 (AdvanceMonIndex inliné :2289-2298) | `ChangeSummaryPokemon`:1578 + `Task_ChangeSummaryMon`:1628 + `AdvanceMonIndex`:1696 | 🟡 fonctionne mais **async `.then()` ≠ state-machine** (drift structurel) |
| **Sprites mon** | `_createMonSprite`:2029, `_spriteCB_Pokemon`:2063, `_createSetStatusSprite`:2075, `_createMonMarkingsSprite`:2098, `_createCaughtBallSprite`:2117 | `CreateMonSprite`:3975, `SpriteCB_Pokemon`:3994, `CreateSetStatusSprite`:4079, `CreateMonMarkingsSprite`:4048, `CreateCaughtBallSprite`:4069 | ✅ 1:1 |
| **Cri + anim** | `_playMonCryOnce`:2139 (→ `PokemonSummaryDoMonAnimation`) | `PlayMonCry`:3963, `LoadMonGfxAndSprite`:3900 | ✅ 1:1 (anim dans pokemon_animation.ts) |
| **Icônes type** | `_setTypeIcons`:2012, `_setMonTypeIcons`:1958, `_setMoveTypeIcons`:1975, `_setContestMoveTypeIcons`:1990, `_createMoveTypeIcons`:1902 | `SetTypeIcons`:3776 … `CreateMoveTypeIcons`:3794 | ✅ 1:1 |
| **Mode SELECT_MOVE** | `Task_HandleInput_MoveSelect`:2843, `Task_HandleInput_MovePositionSwitch`:2937, `Task_HandleReplaceMoveInput`:3041, `Task_HandleInputCantForgetHMsMoves`:3078, `_changeSelectedMove`:2872, `_switchToMoveSelection`:2814, `_swapMonMoves`:2978, curseurs `_createMoveSelectorSprites`:2663/`_spriteCB_MoveSelector`:2649 | `Task_HandleInput_MoveSelect`:1911 … `SwapMonMoves`:2115, `CreateMoveSelectorSprites`:4099, `SpriteCB_MoveSelector`:4127 | ✅ 1:1 |
| **Fenêtres glissantes** | `_positionStatusSlidingWindow`:2446 + task `_slideStatusTaskId`, `_positionPowerAccSlidingWindow`:2524, `_positionAppealJamSlidingWindow`:2567 | `PositionStatusSlidingWindow`:2541 + `Task_SlideStatusWindow`:2558, `Task_SlidePowerAccWindow`:2452, `Task_SlideAppealJamWindow`:2505 | 🟡 statut=task ; power/acc + appeal/jam **synchrones** (drift, cf. note :3076) |
| **Fermeture** | `_beginCloseSummaryScreen`:3196, `Task_CloseSummary`:3213, `_freeSummary`:3240 | `BeginCloseSummaryScreen`:1508, `CloseSummaryScreen`:1514, `FreeSummaryScreen`:1502 | ✅ 1:1 |

### 1.b Ce qui vit en ADAPTATION (foyer légitime ailleurs — NE PAS rapatrier)

- **`src/pokemon_animation.ts`** (foyer miroir de `pokemon.c` anim + les 5 fns anim de
  summary_screen.c) : `PokemonSummaryDoMonAnimation` (:2030, décomp pokemon.c:6826),
  `StopPokemonAnimations` (:2063, décomp summary:4030), `SummaryScreen_DestroyAnimDelayTask`
  (:2054-2058, décomp :4013), framework delay-task `_animDelayTaskId` (:1932-2058, décomp
  `SummaryScreen_SetAnimDelayTaskId`:4008). **C'est le bon domicile** (anim partagée avec
  d'autres écrans) — l'oracle le confirme (`StopPokemonAnimations` [✓]→pokemon_animation.ts:2063).
- **`src/pokemon_storage_system.ts`** : `AdvanceStorageMonIndex` (:1087, décomp
  pokemon_storage_system.c) = nav mon DANS une boîte ; c'est le domicile correct (la struct
  boîte est là). Le point d'entrée box (`OpenSummaryScreen` :6562) y vit aussi.

### 1.c Ce qui MANQUE fonctionnellement (solo)

1. **[SEULE VRAIE LACUNE VISIBLE] Nav ▲▼ multi-mon dans une BOÎTE PC.** `pokemon_storage_system.ts:6557-6560`
   passe `monList = [summaryMon]` (mono-mon) en mode BOX → ▲▼ ne fait rien sur un mon boîté.
   Décomp : `ChangeSummaryPokemon`:1584-1601 branche `isBoxMon` → `AdvanceStorageMonIndex`
   (navigue toute la boîte, saute les slots vides). Adaptation assumée dans le code (:6555-6556
   « nav multi-boîte = lot ultérieur, évite les slots vides »). **Fixe = Lot 6.**
2. **[hors-solo] Nav multi-battle** (`AdvanceMultiBattleMonIndex`:1723, `IsValidToViewInMulti`:1751,
   `IsInGamePartnerMon`:3231) — combat LINK/2v2-partenaire. Skip solo.
3. **[hors-solo] Memo « échangé / origine GBA »** (`DoesMonOTMatchOwner`==FALSE branch,
   `DidMonComeFromRSE`:3223, `DidMonComeFromGBAGames`:3215) — inatteignable sans échange
   (tous nos mons OT=joueur). Le foyer inline seulement la branche `==TRUE` (:1145). Skip solo.

---

## 2. Call-sites entrants (grep `src/`)

Le foyer expose **2 entrées** (`ShowSelectMovePokemonSummaryScreen` :3124, `OpenSummaryScreen`
:3394) + une variante party (`CB2_ShowPokemonSummaryScreen_Manual` :4438 party_menu.ts).
Modes réellement utilisés en **solo** (décomp `SUMMARY_MODE_{NORMAL=0, LOCK_MOVES=1, BOX=2,
SELECT_MOVE=3}`) :

| Call-site | Fn appelée | Mode | Statut |
|---|---|---|---|
| `party_menu.ts:4438` `CB2_ShowPokemonSummaryScreen_Manual` (via `CursorCb_Summary` RÉSUME) | `OpenSummaryScreen` | **NORMAL** | ✅ MARCHE (« party→summary OK ») |
| `pokemon_storage_system.ts:6562` `SCREEN_CHANGE_SUMMARY_SCREEN` | `OpenSummaryScreen` (monList/mode) | **NORMAL** (party dans PC) / **BOX** (mon boîté) | ✅ NORMAL · 🟡 BOX mono-mon |
| `party_menu.ts:1105` (apprentissage capacité party : TM/HM/level-up) | `ShowSelectMovePokemonSummaryScreen` | **SELECT_MOVE** | ✅ MARCHE |
| `battle_script_commands.ts:10423` (oubli capacité en combat) | `ShowSelectMovePokemonSummaryScreen` | **SELECT_MOVE** | ✅ MARCHE (async gate :10347) |
| `evolution_scene.ts:1116` + `:1479` (capacité apprise post-évolution / level-up) | `ShowSelectMovePokemonSummaryScreen` | **SELECT_MOVE** | ✅ MARCHE |

- **NORMAL** (0) : consultation depuis party menu / PC. min=INFO, max=CONTEST_MOVES,
  lockMovesFlag=FALSE (réordre autorisé). ✅
- **BOX** (2) : consultation d'un mon boîté. Idem NORMAL côté pages ; lockMovesFlag=FALSE
  (le décomp autorise le réordre d'un mon boîté). ✅ pages · 🟡 nav ▲▼ mono-mon.
- **SELECT_MOVE** (3) : oubli/remplacement. min=BATTLE_MOVES, `lockMonFlag=TRUE` (:3141),
  5e « capacité » = newMove. ✅ (`ShowSelectMovePokemonSummaryScreen`:3124).
- **LOCK_MOVES** (1) : **aucun call-site solo trouvé** (usage décomp = battle-tower/link).
  Skip. À vérifier si un futur écran solo l'exige.

> **À vérifier au câblage :** `ShowSelectMovePokemonSummaryScreen` pose `lockMovesFlag=false`
> (:3142) alors que le décomp SELECT_MOVE met `lockMovesFlag=TRUE`. Sans effet visible (en
> SELECT_MOVE on remplace, on ne réordonne pas), mais à confirmer contre `ChangeSelectedMove`.

---

## 3. Mapping des 42 restantes (21 référencées + 21 absentes)

Colonnes : **où c'est AUJOURD'HUI** → **action de consolidation** · **priorité solo**
(🟥 fonctionnel · 🟧 structurel 1:1 · ⬜ hors-solo/documenter).

### 3.a Les 21 « référencées non-déclarées » [·] — **déjà implémentées** (drift/inline) → RENOMMER

| Décomp (`.c`) | Vit aujourd'hui (`.ts`) | Action | Prio |
|---|---|---|---|
| `PssScrollRight`:1785 / `PssScrollLeft`:1828 | `_taskPssScrollRight`:2170 / `_taskPssScrollLeft`:2204 | Renommer aux noms exacts | 🟧 |
| `Task_ChangeSummaryMon`:1628 | inliné async dans `_changeSummaryPokemon`:2346-2385 | **Re-transcrire en state-machine** (Lot 3) | 🟧 (risque n°1) |
| `LoadMonGfxAndSprite`:3900 | `_loadMonFrontPic`+`_createMonSprite`:2029 | Extraire fn nommée | 🟧 |
| `PlayMonCry`:3963 | inliné `_playMonCryOnce`:2139 | Extraire fn nommée | 🟧 |
| `SpriteCB_MoveSelector`:4127 | `_spriteCB_MoveSelector`:2649 | Renommer | 🟧 |
| `Task_PrintInfoPage`:3048 / `Task_PrintBattleMoves`:3482 / `Task_PrintContestMoves`:3609 / `Task_PrintSkillsPage`:3312 | `_taskPrintInfoPage`:1555 / `_taskPrintBattleMoves`:1574 / `_taskPrintContestMoves`:1611 / `_taskPrintSkillsPage` | Renommer | 🟧 |
| `Task_SlideStatusWindow`:2558 | `_slideStatusTaskId` task (:2446) | Renommer | 🟧 |
| `Task_SlidePowerAccWindow`:2452 / `Task_SlideAppealJamWindow`:2505 | synchrones (`_positionPowerAccSlidingWindow`:2524 / `_positionAppealJamSlidingWindow`:2567) | Re-transcrire en tasks | 🟧 |
| `CopyMonToSummaryStruct`:1386 / `ExtractMonDataToSummaryStruct`:1400 | fusionnés dans `_extractMonData` | Séparer en 2 fns nommées | 🟧 |
| `DecompressGraphics`:1321 / `LoadGraphics`:1175 | `_decompressGraphics` / `_loadSummaryGraphicsCb2`+CB2 state-machine | Renommer | 🟧 |
| `ShowPokemonSummaryScreen`:1100 | `OpenSummaryScreen`:3394 (+ setup par-mode partiel) | Renommer + compléter le `switch(mode)` min/maxPageIndex | 🟧 |
| `SummaryScreen_DestroyAnimDelayTask`:4013 | `StopPokemonAnimationDelayTask` (pokemon_animation.ts:2054) | **Déjà au bon foyer** — rien | ⬜ |
| `SetSpriteInvisibility`:3759 | inliné (`DestroySprite`/`invisible=true`) | Extraire helper nommé | 🟧 |
| `VBlank`:1163 | `VBlankCB_SummaryRun`:3276 (no-op, transferts auto) | Renommer/documenter | ⬜ |

### 3.b Les 21 « absentes » [✗] — inlinées, ou à créer, ou hors-solo

| Décomp (`.c`) | État réel | Action | Prio |
|---|---|---|---|
| `PssScrollRightEnd`:1815 / `PssScrollLeftEnd`:1845 | inlinés dans `_taskPssScroll*` (bloc `data[0]>0xFF`) | Extraire en fns nommées (avec `SwitchTaskToFollowupFunc`) | 🟧 |
| `AdvanceMonIndex`:1696 | inliné `_changeSummaryPokemon`:2289-2298 | Extraire fn nommée | 🟧 |
| `LimitEggSummaryPageDisplay`:2713 | inliné :2354-2356 (`_changeBgX(3, isEgg…)`) | Extraire fn nommée | 🟧 |
| `RemoveAndCreateMonMarkingsSprite`:4062 | `_createMonMarkingsSprite`:2098 (create seul) | Ajouter le wrapper remove+create | 🟧 |
| `FreeSummaryScreen`:1502 | `_freeSummary`:3240 | Renommer | 🟧 |
| `BufferNatureString`:3173 / `GetMetLevelString`:3180 / `DoesMonOTMatchOwner`:3189 | inlinés `_bufferMonTrainerMemo`:1154-1166 (branche OT==TRUE) | Extraire 3 fns nommées | 🟧 |
| `PrintGenderSymbol`:2805 | inliné :1021 | Extraire fn nommée | 🟧 |
| `DestroySpriteInArray`:3750 / `ResetSpriteIds`:3742 | inlinés (DestroySprite + init spriteIds) | Extraire helpers nommés | 🟧 |
| `SummaryScreen_SetAnimDelayTaskId`:4008 | `_animDelayTaskId=tid` (pokemon_animation.ts:2047) | **Au bon foyer** — rien | ⬜ |
| `IsMonAnimationFinished`:4022 | géré en interne par le framework anim (pokemon_animation.ts) | Vérifier/exposer si un appelant l'exige | ⬜ |
| `SwapBoxMonMoves`:2150 | absent (`SwapMonMoves`:2115 porté) | À transcrire **si** réordre de capacité d'un mon boîté visé (Lot 6) | 🟥 (BOX) |
| `AdvanceMultiBattleMonIndex`:1723 / `IsValidToViewInMulti`:1751 / `IsInGamePartnerMon`:3231 | absents | Documenter EXEMPT (multi/link) | ⬜ |
| `DidMonComeFromRSE`:3223 / `DidMonComeFromGBAGames`:3215 | absents | Documenter EXEMPT (échange/origine) | ⬜ |
| `ShowPokemonSummaryScreenHandleDeoxys`:1148 | absent (variante d'entrée forme Deoxys) | Transcrire seulement si Deoxys-forme visé (event-mon, très basse prio) | ⬜ |

**Bilan : sur 42, ~30 sont 🟧 (renommage/extraction 1:1 sans changement de comportement),
2 sont ⬜ « déjà au bon foyer », ~7 ⬜ hors-solo, ~2 🟥 fonctionnels (BOX-nav + SwapBoxMonMoves).**

---

## 4. Plan d'exécution (6 lots ≤ ~300 l. diff)

> Invariant : `npx tsc --noEmit`=0 après chaque édit ; le foyer reste **fonctionnel** à
> chaque lot (les lots 1-2-4-5 sont des renommages/extractions **iso-comportement**).

### LOT 1 — Renommage 1:1 des fns « nav + scroll + input » (iso-comportement)
- **Fichier** : `src/pokemon_summary_screen.ts`.
- **Contenu** : renommer aux noms décomp exacts : `Task_Summary_HandleInput`→`Task_HandleInput`,
  `_changePage`→`ChangePage`, `_taskPssScrollRight/Left`→`PssScrollRight/Left`,
  `_changeSummaryPokemon`→`ChangeSummaryPokemon`, `_beginCloseSummaryScreen`→`BeginCloseSummaryScreen`,
  `Task_CloseSummary`→`CloseSummaryScreen`, `_freeSummary`→`FreeSummaryScreen`. Mettre à jour
  les refs internes. **Aucun changement de logique.**
- **Test** : `tsc` vert + boot sain. (Renommage → pas de test en jeu requis.)
- **Critère** : grep des anciens noms = 0 hors commentaires.

### LOT 2 — Extraction des helpers inlinés (iso-comportement)
- **Fichier** : `src/pokemon_summary_screen.ts`.
- **Contenu** : extraire en fns nommées 1:1 : `AdvanceMonIndex` (depuis :2289), `PssScrollRightEnd`/
  `PssScrollLeftEnd` (depuis les blocs `data[0]>0xFF`), `LimitEggSummaryPageDisplay` (:2354),
  `BufferNatureString`/`GetMetLevelString`/`DoesMonOTMatchOwner` (:1154), `PrintGenderSymbol` (:1021),
  `SetSpriteInvisibility`/`ResetSpriteIds`/`DestroySpriteInArray`, `RemoveAndCreateMonMarkingsSprite`.
  Renommer les `_taskPrint*`→`Task_Print*`, `_spriteCB_MoveSelector`→`SpriteCB_MoveSelector`.
- **Test** : `tsc` vert + boot sain.
- **Critère** : compile ; oracle re-run → « référencées » et « absentes » chutent.

### LOT 3 — Re-transcrire `Task_ChangeSummaryMon` en state-machine (⚠️ RISQUE n°1)
- **Fichier** : `src/pokemon_summary_screen.ts`.
- **Contenu** : remplacer la chaîne `.then()` de `ChangeSummaryPokemon` (:2346-2385) par la task
  frame-steppée `Task_ChangeSummaryMon` (cases 0-12, 1:1 :1628-1694 : StopCry → DestroyAnimDelay
  → destroy MON/BALL sprites → CopyMon → ExtractMon (return si FALSE) → markings → ball → pokerus/
  statut-in → LoadMonGfxAndSprite → SetTypeIcons → PrintMonInfo → PrintPageSpecificText+LimitEgg →
  data[2]=0 → default: retour `Task_HandleInput` gaté `!FuncIsActiveTask(Task_SlideStatusWindow)`).
  Adapter le chargement async front-pic (le seul point qui ne peut pas être 1-frame : garder un
  `return` de case jusqu'à `_graphicsReady`, 1:1 esprit du `if(...==FALSE) return` case 4).
- **Test EN JEU** : party menu → RÉSUMÉ → ▲▼ rapides sur toute l'équipe (dont mon avec statut
  PSN/PAR → mon sain → mon avec statut), pages INFO et non-INFO (saut des œufs). Screenshot.
  Vérifier : bon sprite/cri/anim à chaque mon, pas de statut fantôme, pas de freeze sur slide-out.
- **Critère** : mon-change 1:1 structurel ; 0 régression vs `.then()`.

### LOT 4 — Sliding windows power/acc + appeal/jam en tasks 1:1
- **Fichier** : `src/pokemon_summary_screen.ts`.
- **Contenu** : transcrire `Task_SlidePowerAccWindow` (:2452) + `Task_SlideAppealJamWindow` (:2505)
  comme vraies tasks frame-steppées (aujourd'hui synchrones, note :3076). Câbler
  `PositionPowerAccSlidingWindow`/`PositionAppealJamSlidingWindow` dessus.
- **Test EN JEU** : mode SELECT_MOVE (apprendre une capacité) → ◄► entre pages CAPACITÉS/CONCOURS
  → vérifier le glissement fenêtre puissance/précision + attrait/gêne (animation, pas snap).
- **Critère** : slides animées 1:1 ; `Task_HandleInputCantForgetHMsMoves` peut re-garder
  `FuncIsActiveTask(Task_SlidePowerAccWindow)` (retire l'adaptation « synchrone » de :3076).

### LOT 5 — Compléter `ShowPokemonSummaryScreen` (setup par-mode) + documenter EXEMPTS
- **Fichiers** : `src/pokemon_summary_screen.ts`.
- **Contenu** : renommer `OpenSummaryScreen`→`ShowPokemonSummaryScreen`, transcrire le
  `switch(mode)` complet (:1100-1140 : min/maxPageIndex + lockMovesFlag par mode NORMAL/LOCK_MOVES/
  BOX/SELECT_MOVE). Ajouter un bloc de commentaire EXEMPT listant `AdvanceMultiBattleMonIndex`,
  `IsValidToViewInMulti`, `IsInGamePartnerMon`, `DidMonComeFromRSE`, `DidMonComeFromGBAGames`,
  `ShowPokemonSummaryScreenHandleDeoxys` (multi/link/échange/event — hors solo).
- **Test EN JEU** : NORMAL (party), SELECT_MOVE (level-up) — non-régression. Screenshot.
- **Critère** : setup par-mode 1:1 ; exempts documentés (0 « stub » silencieux).

### LOT 6 — [FONCTIONNEL] Nav ▲▼ multi-mon dans une BOÎTE PC
- **Fichiers** : `src/pokemon_storage_system.ts`, `src/pokemon_summary_screen.ts`.
- **Contenu** : (a) dans `ChangeSummaryPokemon`, transcrire la branche `isBoxMon` →
  `AdvanceStorageMonIndex(monList.boxMons, curMonIndex, maxMonIndex, delta)` (décomp :1584-1601 ;
  `AdvanceStorageMonIndex` existe déjà pokemon_storage_system.ts:1087). (b) Côté PC storage,
  passer la **vraie liste de boîte** (au lieu de `[summaryMon]` :6560) + `isBoxMon=true` +
  maxIndex=IN_BOX_COUNT-1. (c) Optionnel : `SwapBoxMonMoves` (:2150) si réordre capacité mon boîté.
- **Test EN JEU** : PC → boîte pleine de mons → RÉSUMÉ sur un mon → ▲▼ navigue la boîte (saute
  les slots vides), retour PC curseur au bon slot. Screenshot.
- **Critère** : nav boîte 1:1 ; la seule lacune fonctionnelle solo est comblée.

---

## 5. Risques (par ordre de danger)

1. **[MAJEUR] Re-transcription `Task_ChangeSummaryMon` (Lot 3).** Le chemin le plus sensible de
   l'écran. La chaîne `.then()` actuelle encapsule des correctifs DÉJÀ PAYÉS documentés inline :
   stop-anim avant destroy sprite (bug JIRACHI recyclé, :2316-2320), gate `data[2]` cri/anim
   (:2361-2376), slide-out statut sur mon quitté (:2326-2333), retour input gaté
   `!FuncIsActiveTask(Task_SlideStatusWindow)` en POLL (freeze slide-out-seul, :2377-2384).
   **Toute re-transcription doit préserver ces 4 invariants** — les recopier case-par-case, ne
   pas « nettoyer ». Point dur : la case `LoadMonGfxAndSprite` charge le front-pic **async** chez
   nous ; garder un `return` de case jusqu'au chargement (fidèle à l'esprit du `if(...==FALSE)
   return` de la case 4 décomp).

2. **[MOYEN] Mon-pic / front-pic loader.** `LoadMonGfxAndSprite` (:3900) = `_loadMonFrontPic`
   charge un PNG 2-frames async (≠ décomp `HandleLoadSpecialPokePic` synchrone depuis ROM). Le
   renommage (Lots 1-2) est sûr, mais la state-machine (Lot 3) ne doit pas supposer le pic
   disponible en 1 frame. Palette OBJ : bien vérifier `FreeAllSpritePalettes` au boot (:3293,
   correctif « mon/ball/markings noirs » déjà payé) reste en place.

3. **[MOYEN] Fenêtres (windows) + BG ping-pong.** Le scroll de page utilise BG1/BG2 en ping-pong
   (`bgDisplayOrder`) + BG3 pour INFO. Le renommage `PssScroll*` (Lot 1) doit préserver la note
   critique :2213-2228 (copie BG **différée** post-`SetBgTilemapBuffer` — sinon page contest
   affichée sur slot skills). Ne PAS réordonner `_scheduleBgCopy`/`_setBgTilemapBuffer`.

4. **[MOYEN] BOX-nav (Lot 6).** Passer la vraie liste de boîte expose les **slots vides**
   (`SPECIES_NONE`) — `AdvanceStorageMonIndex` les saute déjà (:1091-1096), mais vérifier que
   `_changeSummaryPokemon` ne déréférence pas un `boxMons[i]` null (cf. mémoire SPECIES_NONE
   crash `06b02dc85`). Tester une boîte à trous.

5. **[FAIBLE] Données de capacités (moves).** Les pages CAPACITÉS/CONCOURS lisent `gBattleMoves`/
   `gContestMoves`/`gMoveNames`/`gMoveDescriptions` (imports :43). Déjà servies (l'écran marche) ;
   aucune extraction data nouvelle requise pour la consolidation (contrairement au `battleUsage`
   du bag-screen). Pas de risque.

6. **[FAIBLE] Modes non-solo.** LOCK_MOVES (1) sans call-site solo ; multi-battle/échange/Deoxys
   exempts. Risque nul tant que documentés EXEMPT (Lot 5) et non « stubés » en silence.

---

### Annexe — vérification finale
`node scripts/decomp-index.cjs --file pokemon_summary_screen.c` après Lots 1-5 → « référencées »
et « absentes » doivent chuter de ~42 vers ~9 (les EXEMPTS multi/link/échange/Deoxys + les 2
« déjà au bon foyer » anim). Le reliquat = uniquement du hors-solo documenté.
