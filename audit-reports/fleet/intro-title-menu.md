# Audit 1:1 — Domaine `intro-title-menu` (boot → intro → titre → menu principal → naissance du monde)

> Audit READ-ONLY, MIROIR STRICT. Décomp = `D:/Projet 1/decomps/pokeemeraude/src`. Nous = `D:/Projet 1/pokemon-web-demo/src`.
> Doctrine : mêmes noms fichiers/fns/globals, code transcrit ligne à ligne (tasks gTasks/.func + CB2). Harness = assumé non-1:1.

## Tableau de synthèse

| fichier .c | notre fichier | statut | fns portées/total | écart principal |
|---|---|---|---|---|
| `title_screen.c` | `src/title_screen.ts` | ✅ MIROIR | 18/20 (2 CB2 debug = no-op stopgap) | CB2 clear-save/reset-RTC no-op ; VBlankCB partiel |
| `intro.c` | `src/intro.ts` (+ harness) | 🟡 PARTIEL | 46/48 (6 boot/copyright = harness) | 🔴 Rayquaza `160` au lieu de `0x68` ; copyright en harness |
| `intro_credits_graphics.c` | `src/intro_credits_graphics.ts` | 🟡 PARTIEL | 14/20 (scenery credits stubbé) | metadata/anims clouds/trees/houses `declare` (scène credits) |
| `main_menu.c` | `src/main_menu.ts` | 🟡 PARTIEL | ~60/60 (state machine OK) | 3 stubs (scroll-arrow, dex-count=0) ; RNG `Math.random` ; commentaires mensongers |
| `starter_choose.c` | `src/starter_choose.ts` | ✅ MIROIR (adapté) | 18/18 | task-system Map local ; new-game logic hostée YES ; `cleanupScene` mort |
| `wallclock.c` | `src/wallclock.ts` | ✅ MIROIR | 25/25 | exemption async (loader assets) ; sinon 1:1 |
| `new_game.c` | ⬜ ABSENT (dispersé harness/engine) | 🔴 DIVERGENT | 0 miroir | fns → `engine/save/new-game-flags.ts` + `harness/boot/boot-mode.ts` |
| `credits.c` | ⬜ ABSENT | ⬜ | 0 | scène credits de fin non atteignable |
| `hall_of_fame.c` | ⬜ ABSENT | ⬜ | 0 | seul `AccessHallOfFamePC` = stub special |
| `mystery_gift_menu.c` | ⬜ ABSENT | 🚫 EXEMPT | 0 | flow link ; `IsMysteryGiftEnabled` stub utilisé côté solo |
| `clear_save_data_screen.c` | ⬜ ABSENT | frontière save-data | 0 | CB2 no-op stopgap depuis title_screen |
| `save_failed_screen.c` | ⬜ ABSENT | frontière save-data | 0 | — |
| `berry_fix_program.c` | ⬜ ABSENT | 🚫 EXEMPT | 0 | CB2 stub depuis title_screen |
| `multiboot.c` | ⬜ ABSENT | 🚫 EXEMPT | 0 | `GameCubeMultiBoot_*` stubs |

---

## title_screen.c → src/title_screen.ts
Statut : ✅ MIROIR
Fonctions : 18/20 (les 2 CB2 debug = no-op stopgap volontaire)
Manquantes : aucune structurellement.
Divergences :
- `CB2_GoToClearSaveDataScreen` (title_screen.c:838 ↔ title_screen.ts:561) : décomp fait `SetMainCallback2(CB2_InitClearSaveDataScreen)` ; notre TS = **no-op stopgap** (commentaire honnête). Écran debug rare (combo B+SELECT+↑), frontière save-data.
- `CB2_GoToResetRtcScreen` (title_screen.c:844 ↔ title_screen.ts:569) : idem, no-op stopgap (combo B+SELECT+←).
- `CB2_GoToBerryFixScreen` (title_screen.c:850 ↔ title_screen.ts:577) : appelle `m4aMPlayAllStop()` puis `/* TODO scene transition */` — berry_fix EXEMPT.
- `VBlankCB` (title_screen.c:563 ↔ title_screen.ts:431) : partiel — `ScanlineEffect_InitHBlankDmaTransfer`/`LoadOam`/`ProcessSpriteCopyRequests` commentés « TODO Phase 3+ » ; seuls `TransferPlttBuffer` + le `SetGpuReg(BG1VOFS)` (montée clouds) sont faits. Le scanline-wave BG1 du titre (l.670 `ScanlineEffect_InitWave`) ne s'affiche donc pas via H-DMA.
- `MainCB2` (title_screen.c:677 ↔ title_screen.ts:423) : no-op documenté (RunTasks/AnimateSprites/BuildOam/UpdatePaletteFade centralisés dans `tickFixed`). Adaptation architecturale.
- `Task_TitleScreenPhase2` yPos (title_screen.ts:365) : cast u32 rendu via `>>> 0` (documenté) — équivalent 1:1.
Corrections manuelles présentes (bien) : « MANUAL FIX session 81 » sur `SpriteCB_VersionBannerLeft/Right` (écrire `sprite.objMode` = source de vérité, sinon reste OBJ_BLEND), `Task_TitleScreenPhase1` DISPCNT = BG2+OBJ seul (transpileur avait expansé BG0-3), `CB2_GoToCopyrightScreen`.
Fuites harness / non-conformes : `(globalThis as any).gBattle_BG1_Y/X` + `gReservedSpritePaletteCount` (title_screen.ts:406-407/484) ; `BeginNormalPaletteFade("PALETTES_ALL", …, "RGB_WHITEALPHA")` en string au lieu de constantes numériques ; signatures `(sprite, rt)`/`(task, rt)`. Assumé (substrat runtime).

---

## intro.c → src/intro.ts (+ fuites harness)
Statut : 🟡 PARTIEL — scènes 1/2/3 quasi-complètes et fidèles (dont TOUTE l'anim légendaire), mais **1 divergence load-bearing** + fns boot/copyright hébergées en harness.
Fonctions : 46/48 dans intro.ts. Les 6 fns boot/copyright vivent **ailleurs** (harness, hors miroir `src/`) :
- `MainCB2_Intro` → `harness/boot/copyright-boot.ts:48`
- `SetUpCopyrightScreen` → `harness/boot/copyright-boot.ts:61`
- `LoadCopyrightGraphics` → `harness/boot/copyright-boot.ts:41`
- `CB2_InitCopyrightScreenAfterBootup` → `harness/boot/copyright-boot.ts:133` (+ copie MORTE `intro.ts:2161`)
- `CB2_InitCopyrightScreenAfterTitleScreen` → `harness/boot/copyright-boot.ts:148` (+ copie morte `intro.ts:2176`)
- `IntroResetGpuRegs` → méthode runtime `rt.IntroResetGpuRegs()` (harness/runtime/decomp-runtime)
Manquantes : `SerialCB_CopyrightScreen` (intro.c:1067) [code-mort côté web — hardware GameCube multiboot exempt].
Divergences :
- 🔴 **`Task_Scene3_Rayquaza` case 0 — décomp intro.c:2571 `if (data[1] == 0x68)` (=104) ↔ notre intro.ts:1933 `if (data[1] == 160)` (=0xA0).** `data[1]` init `0xA8`=168, décrémente de 2 chaque frame impaire → cible correcte = **104** (32 décréments), pas 160 (4 décréments). L'orbe Rayquaza recule/zoome ~28 frames trop tôt. **Vraie faute de transcription** (le `== 160` de `Task_Scene3_Groudon` case 0 intro.ts:1469 est correct lui — d'où la confusion). Fix : `160` → `0x68`.
- 🟡 RNG : `SpriteCB_PlayerOnBicycle` (intro.c:3119 `Random() & 3` ↔ intro.ts:778 `Math.random()`), gender `Task_Scene1_Load` (intro.c:1172 `MOD(Random(),GENDER_COUNT)` ↔ intro.ts:1042). Non-déterministe mais visuellement neutre.
- 🟡 `SpriteCB_Manectric` cast `(u8)` rendu `& 0xFF` (intro.ts:424) — équivalent.
- Commentaire mal-étiqueté : `intro.ts:1961` JSDoc « Source: intro.c → Task_EndIntroMovie » précède en fait `MainCB2_EndIntro` (l.1962), pas `Task_EndIntroMovie` (l.1967).
- `CB2_InitCopyrightScreenAfterBootup` (harness) : la branche `if(!SetUpCopyrightScreen())` du décomp init la save (SetSaveBlocksPointers/LoadGameSave/InitHeap/SetPokemonCryStereo) ; notre harness SKIP (stub commenté, frontière save-data).
Stubs suspects : aucun stub de flemme masquant de la logique. No-op assumés : `ResetSerial` (intro.ts:1088), `VBlankCB` marqueur (intro.ts:2337 — le vrai VBlank est réimplémenté verbatim dans copyright-boot.ts:98), `GameCubeMultiBoot_*` (multiboot exempt).
Scène 3 légendaire : ✅ CODE INTÉGRALEMENT PORTÉ ET 1:1 (Task_Scene3_Load/SpinPokeball/…/Groudon/Kyogre/Clouds/Lightning/Rayquaza/EndIntroMovie + CreateGroudonRock/KyogreBubble_Body/_Fins + Task_RayquazaAttack + SpriteCB GroudonRocks/KyogreBubbles/Lightning/RayquazaOrb, avec décompress `gIntroLegendBg_Gfx`/GpuReg/PanFadeAndZoom/cris exacts). **Donc « fond légendaire pas animé » = problème d'ASSET (legend_bg.png non-indexé, pas de PLTE), PAS moteur ni code manquant — CONFIRMÉ.** Seule anomalie = la constante Rayquaza ci-dessus.
Fuites harness : `(globalThis as any).X` pour EWRAM (sIntroCharacterGender, sFlygonYOffset, gIntroCredits_MovingSceneryV*, gReservedSpritePaletteCount, gSaveFileStatus) ; `rt.`-préfixe + signatures `(sprite/task, rt)` ; `_gs/_gt/_emptySprite`, `_CreateSpriteAtTemplate`, tags-strings, `INTRO3_RAW_PTR` ; `return -1;` morts après return valide (artefacts transpileur). `/* eslint-disable */`. Tous assumés (ex-`@ts-nocheck` dissous+typé).
Note : new_game.c N'EST PAS hébergé dans intro.ts (grep négatif). La note cartograph « new_game.c → intro.ts 2/13 » = les stubs `declare function Sav2_ClearSetDefault/ResetMenuAndMonGlobals` (intro.ts:158-159), pas de vraies fns.

---

## main_menu.c → src/main_menu.ts
Statut : 🟡 PARTIEL — state machine complète et fidèle (CB2_InitMainMenu → Task_MainMenu* → séquence Task_NewGameBirchSpeech_* → CB2_NewGame, ex-`main_menu-callbacks-auto` fusionné/supprimé). Divergences = helpers de rendu ré-écrits, 3 stubs, patterns harness.
Fonctions : ~60/60 présentes (aucune absente). Notes « ailleurs » :
- Vrai `CreateMonPicSprite_Affine` existe (`src/trainer_pokemon_sprites.ts:111`) mais main_menu.ts NE l'appelle PAS → ré-implémente `NewGameBirchSpeech_CreateLotadSprite` (main_menu.ts:818) en ad-hoc.
- Vrais `AddScrollIndicatorArrowPair`/`RemoveScrollIndicatorArrowPair` existent (`src/list_menu.ts:1495/1606`) mais main_menu.ts définit ses PROPRES no-op stubs locaux (ts:1109-1120) qui les shadowent.
Manquantes : aucune.
Divergences (décomp:L ↔ notre:L) :
- 🟡 `CB2_InitEReader`/`CB2_InitMysteryGift`/`CB2_InitMysteryEventMenu` (décomp:1077-1085 ↔ ts:1749-1763) : les 3 handoffs `SetMainCallback2` remplacés par `console.warn + DestroyTask`. Flow link EXEMPT (adaptation hardware), mais non-1:1 si atteint.
- 🟡 `HandleMainMenuInput` (ts:296) lit `rt.gMain.newKeys` alors que le reste utilise `JOY_NEW(...)` — 2 sources d'input dans le même fichier.
- 🟡 RNG : `NewGameBirchSpeech_SetDefaultPlayerName(Random() % NUM_PRESET_NAMES)` (décomp:1604) ↔ `Math.random()` (ts:2195). Non-déterministe vs `Random()` LCG décomp.
- 🟡 `MainMenu_FormatSavegamePlayer/Pokedex/Time/Badges` (décomp:2140-2193 = 4 fns séparées) ↔ inline dans une seule `MainMenu_FormatSavegameText` (ts:419-484) → 4 noms de fns miroir manquants.
- 🟡 Format temps : template JS `${h}:${mm}` (ts:451) au lieu de `ConvertIntToDecimalStringN` + séparateur glyphe `0xF0` (décomp:2153).
- 🟡 `CreateMainMenuErrorWindow` (décomp:2124 `AddTextPrinterParameterized`) ↔ ts:505 `AddTextPrinterParameterized3` + couleurs `[1,2,3]` hardcodées.
- 🟡 `NewGameBirchSpeech_ClearWindow` (décomp:2242 dims dynamiques via GetFontAttribute) ↔ ts:520 `FillWindowPixelRect(...,216,32)` figé (faux pour windows 1/2).
- 🟡 `NewGameBirchSpeech_ClearGenderWindow` (décomp PIXEL_FILL(1)) ↔ ts:596 PIXEL_FILL(0). Fill-value divergent.
Stubs suspects :
1. `_countCaughtPokedexFlags` (ts:489) : `return 0` en dur (« TODO Phase 4+ ») → **le compteur Pokédex de l'écran Continue affiche toujours 0** (décomp = GetHoennPokedexCount(FLAG_GET_CAUGHT)).
2. `AddScrollIndicatorArrowPair`/`RemoveScrollIndicatorArrowPair`/`Task_ScrollIndicatorArrowPairOnMainMenu` (ts:1109-1120) : no-op locaux qui shadowent les vrais de `list_menu.ts` → scrollbar Mystery Events jamais affichée (masqué car HAS_MYSTERY_EVENTS inatteignable = code-mort de fait).
3. `NewGameBirchSpeech_CreateNameYesNo` (ts:713) : corps « TODO Phase D » vide MAIS **code mort** (vraie logique dans `Task_NewGameBirchSpeech_CreateNameYesNo` ts:2211). Sans équivalent décomp → à supprimer (scaffold résiduel).
Fuites harness / noms non-conformes / commentaires obsolètes :
- Signatures `(task, rt)` + `_gt(rt,id)`/`_gs(rt,id)` au lieu de `gTasks[]`/`gSprites[]` globaux.
- Macros `data[i]` numériques au lieu des `#define tMenuType/tCurrItem/...` (sémantique perdue).
- `(globalThis as any).sCurrItemAndOptionMenuCheck/.sStartedPokeBallTask/.sBirchSpeechMainTaskId` (EWRAM exposés via globalThis).
- 🟠 Commentaires MENSONGERS « NewGameBirchSpeech_* stubs à implémenter Phase D » (ts:24, 149-167, 220-251) alors que la Phase D EST FAITE (state machine réel plus bas). À corriger.
- 🟠 `SpriteCB_Null` (ts:1335) commentaire « TODO empty bodyC » trompeur — le décomp `SpriteCB_Null` (main_menu.c:1865) est légitimement vide. Nettoyer.
- `console.log` diagnostic laissé dans `InitMainMenu` (ts:1198-1203).
Jonction main_menu → naming_screen : ✅ correcte. `Task_NewGameBirchSpeech_StartNamingScreen` (ts:2189) → `DoNamingScreen(NAMING_SCREEN_PLAYER, ...)` fidèle décomp:1598-1607. RÉSERVE : `DoNamingScreen` (ts:1054) délègue en `import()` async dynamique (handoff qui devrait être sync). Retour `CB2_NewGameBirchSpeech_ReturnFromNamingScreen` (ts:2514) porté quasi-1:1.
Jonction main_menu → new_game/Birch : ✅ correcte. NEW GAME → `Task_NewGameBirchSpeech_Init` (fidèle décomp:1059) ; fin → `Task_NewGameBirchSpeech_Cleanup` (ts:2379) → `SetMainCallback2(CB2_NewGame)` (fidèle décomp:1777). CONTINUE → `CB2_ContinueSavedGame`. OPTIONS → `CB2_InitOptionMenu` + savedCallback=CB2_ReinitMainMenu (fidèle décomp:1071).

---

## intro_credits_graphics.c → src/intro_credits_graphics.ts
Statut : 🟡 PARTIEL — sprites/templates intro (Brendan/May/Flygon/bicycle) portés 1:1 ; data scenery CREDITS stubbée.
Fonctions : 14/20. Portées : SpriteCB_MovingScenery, SpriteCB_Bicycle, SpriteCB_FlygonRightHalf, SpriteCB_Player (vide 1:1), SpriteCB_FlygonLeftHalf (vide 1:1), Task_BicycleBgAnimation, CreateBicycleBgAnimationTask, CreateMovingScenerySprites, CreateCloudSprites, CreateTreeSprites, CreateHouseSprites, CreateIntroBrendanSprite, CreateIntroMaySprite, CreateIntroFlygonSprite.
Manquantes / stubbées :
- `LoadIntroPart2Graphics` (intro_credits_graphics.c:729) — NON dans ce fichier ; consommée par intro (importée depuis decomp-globals). [ailleurs/harness]
- `SetIntroPart2BgCnt` (c:761) — idem, importée depuis decomp-globals dans intro.ts. [ailleurs]
- `LoadCreditsSceneGraphics` (c:838) [code-mort — scène credits non atteignable]
- `SetCreditsSceneBgCnt` (c:889) [code-mort credits]
- `CycleSceneryPalette` (c:989) — importée depuis decomp-globals par intro.ts. [ailleurs]
- `CreateIntroFlygonSprite_Unused` (c:1151) [code-mort — UNUSED décomp].
Divergences :
- Data tables scenery CREDITS `declare const sAnims_Clouds/Trees/HouseSilhouette` + `sSpriteMetadata_Clouds/Trees/HouseSilhouette` (intro_credits_graphics.ts:38-43) = **stubs `declare` ambiants**, jamais résolus. Comment honnête : « utilisées seulement par Create*Sprites credits (scène credits non atteignable) → stubs ambient ». Donc `CreateCloudSprites/CreateTreeSprites/CreateHouseSprites` (portées) référencent des données inexistantes → non fonctionnelles tant que credits pas faits. Acceptable (scène credits hors chemin).
- `sAnims_Player` : la version TS (intro_credits_graphics.ts:149-157) ajoute 4 anims (Slow/Fast/LookBack/LookForward) ; le décomp `sAnims_Player[]` (c:460) n'a que `sAnim_Player` (1 entrée, JUMP(0)). Divergence de table (les Fast/LookBack/LookForward viennent de la version credits) — sur-ensemble, pas un manque.
- `Task_BicycleBgAnimation` cast `(u16)bgXSpeed << 4` (décomp c:954) rendu `bg1Speed << 4` sans cast u16 (intro_credits_graphics.ts:188) — pour vitesses positives OK, divergence pour négatives.
Fuites harness : mêmes patterns (`_gs/_gt`, `rt.`, tags-strings, `_CreateSpriteAtTemplate`). Assumé.

---

## starter_choose.c → src/starter_choose.ts
Statut : ✅ MIROIR (avec adaptations architecturales documentées)
Fonctions : 18/18 (toutes présentes, mêmes noms).
Divergences (documentées) :
- Système de tasks : `_tasks = new Map<number, DecompTask>()` module-local + `CreateTask/getTask` locaux (starter_choose.ts:237-250) au lieu de `gTasks` global + substrat runtime. Non-conforme au contrat « substrat + tasks-témoin gTasks » mais isolé et fonctionnel.
- `CB2_ChooseStarter` async (preloadAssets) au lieu de sync LZ77UnCompVram (ROM-resident) — exemption asset async documentée (comme wallclock/save).
- `Task_HandleConfirmStarterInput` YES (starter_choose.ts:693-758) : le décomp fait juste `gSpecialVar_Result = tStarterSelection ; ResetAllPicSprites() ; SetMainCallback2(gMain.savedCallback)`. Notre TS **héberge en plus la logique de battle_setup.c `CB2_GiveStarter`** : `VarSet('VAR_STARTER_MON')` + `CreateMon` numérique + `GiveMonToPlayer` + `StartFirstBattle`. Divergence de hosting (logique new-game/battle-setup inline ici) — documentée, vérifiée en jeu.
- `GetStarterPokemon` : bug off-by-one `if (chosenStarterId > STARTER_MON_COUNT)` (devrait être `>=`) — **présent à l'identique dans décomp c:353** = 1:1 fidèle (bug décomp reproduit).
- `cleanupScene` (starter_choose.ts:982) = **CODE MORT** documenté (restaurait l'OW avant combat = cassait la transition BLUR ; conservé temporairement, à supprimer).
- `getDexCategoryFr`/`_preloadDexEntries` : helpers non-décomp (remplacent `CopyMonCategoryText`+`SpeciesToNationalPokedexNum`). Adaptation données FR.
Stubs suspects : `FreeAllSpritePalettes` était un no-op silencieux (`__sprite.FreeAllSpritePalettes?.()` undefined) → corrigé en import direct (commentaire l.442-448, bug palette collision résolu). Bon.
Note RENDU (hors code starter_choose) : les 2 soucis connus (mosaïque OBJ pendant BLUR ; cercle noir≠blanc) sont côté renderer, PAS une divergence de starter_choose.c — confirmé.
Fuites harness : `getRuntime()`, `rt.gba.oam`, `_CreateSpriteAtTemplate`, imports `engine/battle/*`, `harness/gba/png-loader`, `harness/m4a/music`. Assumé.

---

## wallclock.c → src/wallclock.ts
Statut : ✅ MIROIR
Fonctions : 25/25 (toutes présentes : Task_SetClock_*, Task_ViewClock_*, CalcNewMinHandAngle, CalcMinHandDelta, AdvanceClock, UpdateClockPeriod, InitClockWithRtc, SpriteCB_MinuteHand/HourHand/PMIndicator/AMIndicator, LoadWallClockGraphics, WallClockInit, CB2_WallClock/StartWallClock/ViewWallClock/InitWallClock, VBlankCB_WallClock).
Divergences (documentées) :
- Signatures adaptées : Task_* prennent `DecompTask`, SpriteCB_* prennent `rt` (au lieu de `u8 taskId`/`struct Sprite*`). Substrat runtime.
- Exemption async : `_loadAssets` fetch PNG async + `CB2_InitWallClock` loader orchestrateur (la ROM fait tout sync via LZ77UnCompVram). Comme save/RTC/son.
- Masquage AM/PM via priorité OBJ 3 (1:1, derrière le cadran) — pas un `invisible`.
- Helpers non-décomp : `_spawnHandSprites`, `_loadClockTilemap`, `_drawButtonLabel`, `_freeWallClock`, `OpenWallClock`, `IsWallClockOpen` (glue wiring special StartWallClock/ViewWallClock → SetMainCallback2). Substrat.
Wiring : `OpenWallClock('SET')` = new-game horloge de la chambre ; `OpenWallClock('VIEW')` = horloge murale 2F. **Sur le chemin du new-game complet — présent et fonctionnel.**

---

## new_game.c → ⬜ ABSENT (pas de src/new_game.ts)
Statut : 🔴 DIVERGENT (dispersion hors miroir)
Fonctions : 0 miroir homonyme. Les 13 fns de new_game.c sont dispersées :
- `NewGameInitData`, `InitPlayerTrainerId`, `SetDefaultOptions`, `ClearPokedexFlags`, `SetTrainerId/GetTrainerId/CopyTrainerId` → `src/engine/save/new-game-flags.ts` (nom≠, non-miroir).
- `WarpToTruck`, `NewGameInit` (cinématique) → `harness/boot/boot-mode.ts` + `harness/scenes/*` (harness, non-1:1).
- `ResetMenuAndMonGlobals`, `Sav2_ClearSetDefault` → stubs `declare` dans intro.ts:158-159.
Manquantes (miroir) : `ClearFrontierRecord`, `ResetMiniGamesRecords`, `ClearAllContestWinnerPics` [probablement code-mort/stub côté web].
Écart : new_game.c mériterait un `src/new_game.ts` homonyme pour rapatrier la logique dispersée (chemin naissance-du-monde). Actuellement éclaté harness/engine.

---

## Fichiers frontière / EXEMPT (absents, confirmé)
- `credits.c` → ⬜ ABSENT. Seules réfs = intro.ts/intro_credits_graphics.ts (partage assets). Scène credits de fin non atteignable — non dû sur ce chemin.
- `hall_of_fame.c` → ⬜ ABSENT. Seul `AccessHallOfFamePC` = entrée dans la liste de specials stubbés (specials-registry.ts:1909). Pas sur le chemin intro-title-menu.
- `mystery_gift_menu.c` → 🚫 EXEMPT (flow link). Côté solo, `IsMysteryGiftEnabled()` est utilisé par main_menu.ts (détermine si l'item de menu s'affiche) — stub présent, appelé au bon endroit.
- `clear_save_data_screen.c` → frontière save-data. CB2 no-op stopgap depuis title_screen (combo debug rare).
- `save_failed_screen.c` → frontière save-data. Aucune réf.
- `berry_fix_program.c` → 🚫 EXEMPT. CB2 stub depuis title_screen (`m4aMPlayAllStop` + TODO).
- `multiboot.c` → 🚫 EXEMPT. `GameCubeMultiBoot_*` = stubs dans copyright-boot.ts (hardware GameCube).

---

## TOP 5 (levier × effort — quoi corriger en premier)

Oracle en jeu commun : boot complet `root → A → GameScene` (intro complète) ; `?nointro` pour sauter à la suite ; `?debug` ; le new-game passe title → main_menu → Birch (genre/nom) → naming → starter_choose → 1er combat → chambre (wallclock).

1. **[S] 🔴 `intro.ts:1933` : `160` → `0x68` (Task_Scene3_Rayquaza).** Bug de transcription pur, 1 caractère. L'orbe Rayquaza recule/zoome ~28 frames trop tôt à la fin de l'intro. Oracle : laisser tourner l'intro jusqu'à la scène 3 finale (Rayquaza). Levier haut / effort minimal.

2. **[S] 🟠 `main_menu.ts` : câbler les 3 no-op scroll-arrow sur les vrais `list_menu.ts` + supprimer le stub mort `NewGameBirchSpeech_CreateNameYesNo` (ts:713) + nettoyer les commentaires MENSONGERS « Phase D à implémenter » (fait) et « TODO empty bodyC » sur `SpriteCB_Null`.** Le vrai port existe déjà (import direct). Retire 3 stubs silencieux + mensonges d'en-tête. Effort faible.

3. **[S] 🟡 `main_menu.ts:489` `_countCaughtPokedexFlags` : brancher le vrai comptage (`GetHoennPokedexCount(FLAG_GET_CAUGHT)`).** Actuellement l'écran « Continuer » affiche « Pokédex : 0 » en dur. Visible dès qu'une save existe. Oracle : title → CONTINUE (avec save). Effort faible (le compteur de flags existe côté event_data/pokedex).

4. **[M] 🟡 Rapatrier les fns boot/copyright dans `src/intro.ts` (au lieu de `harness/boot/copyright-boot.ts`) + créer `src/new_game.ts` homonyme.** Deux fuites miroir structurelles sur le chemin naissance-du-monde : `SetUpCopyrightScreen`/`MainCB2_Intro`/`LoadCopyrightGraphics`/`CB2_InitCopyrightScreen*` vivent en harness ; new_game.c est éclaté dans `engine/save/new-game-flags.ts` + `boot-mode.ts`. Consolider aux noms 1:1. Effort moyen (déplacement + retype, pas de nouvelle logique). Attention : la branche save-init de `CB2_InitCopyrightScreenAfterBootup` reste frontière save-data.

5. **[M] 🟡 Déterminisme RNG : remplacer `Math.random()` par `Random()` (LCG décomp) dans `intro.ts` (gender l.1042, bicycle l.778) et `main_menu.ts:2195` (preset name).** Non-1:1 comportemental sur le RNG seedé. Effort moyen (le port `Random`/`random.ts` existe déjà ; juste re-câbler les appelants). Levier modéré (fidélité, reproductibilité).

Note transverse (hors TOP 5, faible levier immédiat) : `title_screen.ts:431` VBlankCB partiel (scanline-wave BG1 H-DMA non porté) ; `starter_choose.ts:982` `cleanupScene` mort à supprimer ; `intro_credits_graphics.ts:38-43` data scenery credits `declare` (à porter quand la scène credits sera faite).
