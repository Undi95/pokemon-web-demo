# Audit Lineage Trace — Boot → CB2_NewGame

**Date** : Session 95 (lineage walk-through)
**Scope** : Décomp `pokeemeraude` flow d'exécution depuis `AgbMain` jusqu'à juste avant le chargement de l'overworld map (= `SetMainCallback2(CB2_LoadMap)`).
**Méthode** : Lecture décomp ligne-par-ligne + cross-check impl TS + classification.
**Statuts** : ✅ porté 1:1 / ⚠️ porté avec hacks ou partiel / ❌ skippé / 🔍 manquant mais pas immédiatement nécessaire (= TODO Phase 4).

---

## Phase 1 — `AgbMain` + boot init (src/main.c)

### Décomp `AgbMain` (main.c:89-162)

Entry point ROM. Init hardware → set callback → main loop infinie qui tick à 60 Hz.

### Notre impl

`GameScene.create()` + `main.ts` Phaser config + `bootIntro()` async preload.

### Diff item-par-item

| Décomp init | Status | Notre impl | Notes |
|---|---|---|---|
| `RegisterRamReset(RESET_ALL)` | ❌ N/A | — | MODERN flag skip côté décomp, pas applicable web |
| `BG_PLTT = RGB_WHITE` (backdrop initial) | ❌ skipped | — | Backdrop noir Phaser. SetUpCopyrightScreen reset à blanc anyway |
| `InitGpuRegManager` | ⚠️ implicit | `new Gba()` | OK fonctionnellement |
| `REG_WAITCNT = ...` | ❌ N/A | — | GBA hardware specific, irrelevant web |
| `InitKeys()` (= gKeyRepeatStartDelay=40, Continue=5) | ⚠️ partial | `createKeys()` | Les `gKeyRepeat*` ne sont **PAS** initialisés à 40/5 dans notre runtime. Vérifier impact key-repeat naming screen + main menu nav |
| `InitIntrHandlers` (VBlank/HBlank/VCount/Serial table) | ⚠️ partial | `SetVBlankCallback` exists | Pas de table d'interrupts complète, juste VBlankCallback |
| `m4aSoundInit` | ✅ | M4A engine boot | OK |
| `EnableVCountIntrAtLine150` | ❌ skipped | — | Pas de scanline IRQ Phase 0 |
| `InitRFU` | ❌ N/A | — | Link cable, pas Phase 0 |
| `RtcInit` | ❌ N/A | — | GBA RTC, web utilise Date |
| `CheckForFlashMemory` | ❌ N/A | — | Save = localStorage |
| `InitMainCallbacks` → `SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)` | ✅ | bootIntro setMainCallback2 | OK |
| `gSaveBlock2Ptr = &gSaveblock2.block` | ⚠️ partial | gSaveBlock2Ptr stub | Existe mais pas relié à un vrai save block (= juste struct in-memory). Vérifier impact playerName/playerGender persistance |
| `gPokemonStoragePtr = &gPokemonStorage.block` | ❌ skipped | — | Pas Phase 0 |
| `InitMapMusic` | ❌ skipped | — | M4A tick autonome |
| `SeedRngWithRtc()` | ⚠️ partial | Math.random | Notre RNG = Math.random pas seedable. Impact : reproducibility tests |
| `ClearDma3Requests` | ❌ skipped | — | Pas de DMA queue dans notre engine |
| `ResetBgs` | ⚠️ implicit | Gba init | OK |
| `SetDefaultFontsPointer` | ✅ | preloadFontData() | OK |
| `InitHeap(gHeap, HEAP_SIZE)` | ❌ N/A | — | JS GC |
| `gSoftResetDisabled = FALSE` | ❌ skipped | — | Pas de soft reset web |

### Main loop (main.c:124-161)

| Décomp main loop | Status | Notre impl |
|---|---|---|
| `ReadKeys()` | ✅ | `pollInput()` + window keydown/keyup |
| Soft reset (A+B+START+SELECT) | ❌ skipped | — |
| `UpdateLinkAndCallCallbacks` | ⚠️ partial | tickFixed → callback2 only |
| `CallCallbacks()` (callback1 + callback2) | ⚠️ callback1 jamais appelé | `gMain.callback1` est dans le state mais `tickFixed` ne l'invoque pas |
| `PlayTimeCounter_Update` | ❌ skipped | — |
| `MapMusicMain` | ❌ skipped | — (M4A autonome) |
| `WaitForVBlank` | ✅ | Phaser fps target=60 forceSetTimeOut |

### Findings Phase 1

- 🔴 **`gKeyRepeatStartDelay` / `gKeyRepeatContinueDelay` jamais initialisés à 40/5** — la décomp les set dans `InitKeys()`. Notre `naming_screen.c:484` re-set `gKeyRepeatStartDelay = 16` après lecture initiale via `gKeyRepeatStartDelayCopy`. Sans l'init à 40, le restore au cleanup naming screen fait gKeyRepeatStartDelay = 0 → key repeat instantané partout après naming screen. **Bug latent Phase 4.**
- 🟡 **`gMain.callback1` jamais invoqué** — tickFixed n'appelle que callback2. Le décomp utilise callback1 pour overworld VBlank-tied logic. Pas immédiat mais TODO Phase 4.
- 🟡 **`gMain.intrCheck` non maintenu** — `WaitForVBlank` lit `gMain.intrCheck & INTR_FLAG_VBLANK`. Notre tick utilise Phaser FPS direct. Pas un bug en soi, mais `gMain.intrCheck` est référencé par certains code décomp pour synchronization.
- 🟢 **CB2 chain entry point OK** : `CB2_InitCopyrightScreenAfterBootup` est bien le 1er CB2 set après boot.

---

## Phase 2 — Copyright screen + Intro 3-scenes (src/intro.c)

### Décomp scope

- `CB2_InitCopyrightScreenAfterBootup` (intro.c:1147) — entry post-boot
- `CB2_InitCopyrightScreenAfterTitleScreen` (intro.c:1162) — re-entry après title
- `SetUpCopyrightScreen` (intro.c:1072) — state machine 0→141 (copyright display + fade in/out)
- `VBlankCB_Intro` (intro.c:1034) — LoadOam + ProcessSpriteCopyRequests + TransferPlttBuffer + ScanlineEffect_InitHBlankDmaTransfer
- `MainCB2_Intro` (intro.c:1042) — RunTasks + AnimateSprites + BuildOamBuffer + UpdatePaletteFade + skip-on-key
- `MainCB2_EndIntro` (intro.c:1054) — fade out → CB2_InitTitleScreen
- `LoadCopyrightGraphics` (intro.c:1060)
- `Task_Scene1_*` (water drops + GameFreak logo) → `Task_Scene2_*` (bicycle ride + Flygon) → `Task_Scene3_*` (Groudon/Kyogre/Rayquaza legendaries)

### Notre impl

- `src/engine/copyright-boot.ts` — port manuel `CB2_InitCopyrightScreenAfterBootup`, `SetUpCopyrightScreen`, `MainCB2_Intro`, `LoadCopyrightGraphics`
- `auto/src/intro-callbacks-auto.ts` — 62 callbacks auto-transpilées : 22 SpriteCB + Task_Scene1_* (5 tasks) + Task_Scene2_* (4 tasks) + Task_Scene3_* (16 tasks) + MainCB2_EndIntro
- `intro-asset-loader.ts` — preload Scene1/2/3 assets (gfx + palettes + tilemaps)

### Diff item-par-item

| Décomp | Status | Notre impl | Notes |
|---|---|---|---|
| `CB2_InitCopyrightScreenAfterBootup` ladder save (SetSaveBlocksPointers/ResetMenuAndMonGlobals/Save_ResetSaveCounters/LoadGameSave/Sav2_ClearSetDefault/SetPokemonCryStereo) | ❌ skipped entirely | — | Bypass save system. Conséquence : `gSaveBlock2Ptr->optionsSound` jamais set → impact mineur sur stéréo cris |
| `SetUpCopyrightScreen` state machine | ✅ 1:1 | `copyright-boot.ts:SetUpCopyrightScreen` | Port manuel fidèle |
| `VBlankCB_Intro` (LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer/ScanlineEffect_InitHBlankDmaTransfer) | ❌ stubbed | `() => { /* stub */ }` | Notre compositor fait Load OAM/PLTT chaque frame, donc fonctionnellement OK. **MAIS** ScanlineEffect_InitHBlankDmaTransfer = effet H-blank scanline (ex: BG wave distortion) = pas dispo si une scene en a besoin (Task_Scene3 narrow window utilise potentiellement ça). 🔍 À vérifier Phase 3 |
| `SerialCB_CopyrightScreen` + `GameCubeMultiBoot_*` | ❌ N/A stub | — | Link cable web N/A |
| `MainCB2_Intro` skip-on-key | ✅ 1:1 | `copyright-boot.ts:MainCB2_Intro` | OK |
| `MainCB2_Intro` increment `gIntroFrameCounter` | ⚠️ moved | tickFixed | Décomp incrémente dans MainCB2_Intro. Notre impl le fait dans tickFixed (= 1 frame → 1 increment). Comportement identique mais pas 1:1 strict |
| `MainCB2_EndIntro` fade out → CB2_InitTitleScreen | ✅ auto | auto-transpiled | OK |
| `Task_Scene1_Load` BG init + sprite load + GameFreak logo create | ✅ auto | auto-transpiled | Vérifier SerialReset stub |
| `Task_Scene1_FadeIn` `m4aSongNumStart(MUS_INTRO)` + `ResetSerial()` | ⚠️ partial | auto-transpiled | `m4aSongNumStart` ✓ via M4A engine, `ResetSerial` ❌ stub (= link cable) |
| `Task_Scene1_WaterDrops` water drop spawn + sparkles | ✅ auto | auto-transpiled | |
| `Task_Scene1_PanUp` BG pan up | ✅ auto | auto-transpiled | |
| `Task_Scene1_End` → Task_Scene2_Load | ✅ auto | auto-transpiled | |
| `Task_Scene2_*` bicycle + Flygon parallax | ✅ auto | auto-transpiled + Task_BicycleBgAnimation BG scroll | |
| `Task_Scene3_*` Groudon/Kyogre/Rayquaza legendaries | ✅ auto | auto-transpiled (16 tasks) | |
| `gIntroCharacterGender = MOD(Random(), GENDER_COUNT)` | ⚠️ Math.random | auto-transpiled | Notre Random() = Math.random — non-seedable |

### Findings Phase 2

- 🟢 **L'intro tourne end-to-end** post-Session 91+ fixes (= cris Latias/Latios/Rayquaza restored après loadSpeciesNamesAsync depuis species-data.ts, Manectric tile flicker fix via ResetSpriteData FreeSpriteTileRanges, etc.).
- 🟡 **`VBlankCB_Intro` stubbed** — fonctionnellement OK mais `ScanlineEffect_InitHBlankDmaTransfer` absent. Si une scene utilise scanline effects, l'effet manquera silencieusement. Pas observé de bug actuel mais flag pour Phase 4 (= overworld a des scanline effects pour water/grass tiles).
- 🟡 **`gMain.callback1` jamais set par l'intro non plus** — décomp main loop ne s'attend pas à callback1 actif pendant intro, mais en overworld ça va devenir critique (= overworld VBlank/HBlank tied logic).
- 🟡 **`ResetSerial` stub** — appelé après `m4aSongNumStart(MUS_INTRO)` dans `Task_Scene1_FadeIn`. Pas d'impact web mais flag.
- 🟢 **Save system bypass acceptable Phase 0-3** — `gSaveBlock2Ptr` est un struct in-memory init avec defaults. Phase 4 (overworld save) devra implémenter un vrai LoadGameSave depuis localStorage.

---

## Phase 3 — Title screen + Rayquaza intro (src/title_screen.c)

### Décomp scope

- `CB2_InitTitleScreen` (title_screen.c:572) — entry post-EndIntro
- `MainCB2 / VBlankCB` (title screen main loop)
- `Task_TitleScreenPhase1` (line 686) — logo + version banner appear
- `Task_TitleScreenPhase2` (line 734) — press start blink + Pokemon logo shine
- `Task_TitleScreenPhase3` (line 782) — legendary BG anim + 5 input handlers (A/Start, clear save combo, RTC reset combo, berry fix combo, BGM end timeout)
- `UpdateLegendaryMarkingColor` (line 859) — Rayquaza eye color cycle (Cos-driven RGB)
- 5 exit CB2 : `CB2_GoToMainMenu` / `CB2_GoToCopyrightScreen` (= BGM end timeout) / `CB2_GoToClearSaveDataScreen` / `CB2_GoToResetRtcScreen` / `CB2_GoToBerryFixScreen`

### Notre impl

- `auto/src/title_screen-callbacks-auto.ts` — 21 exports : tous les CB2 + Tasks + SpriteCBs + helpers `CreatePressStartBanner` / `CreateCopyrightBanner`
- Sprite callbacks (`SpriteCB_VersionBannerLeft/Right`, `SpriteCB_PressStartCopyrightBanner`, `SpriteCB_PokemonLogoShine`/`_Fast`) enregistrés dans `GameScene.create()` (= sans ce wiring, sprites stuck à y=4)

### Diff item-par-item

| Décomp | Status | Notre impl | Notes |
|---|---|---|---|
| `CB2_InitTitleScreen` BG init + sprites + tilemaps | ✅ auto | auto-transpiled | OK |
| `Task_TitleScreenPhase1` logo + version banner appear | ✅ auto | auto-transpiled | OK |
| `Task_TitleScreenPhase2` press start blink + logo shine sweep | ✅ auto | auto-transpiled | OK |
| `Task_TitleScreenPhase3` legendary BG anim | ✅ auto | auto-transpiled | OK |
| `Task_TitleScreenPhase3` A/Start → CB2_GoToMainMenu | ✅ auto | auto-transpiled | OK |
| `Task_TitleScreenPhase3` `JOY_HELD(CLEAR_SAVE_BUTTON_COMBO)` → CB2_InitClearSaveDataScreen | ⚠️ partial | route exists, target stubbed | `CB2_InitClearSaveDataScreen` n'est pas porté → si user appuie combo, dead-end (mais combo = Up+Select+B simultanés, peu probable accidentel) |
| `Task_TitleScreenPhase3` `JOY_HELD(RESET_RTC_BUTTON_COMBO)` + `CanResetRTC()` → CB2_GoToResetRtcScreen | ⚠️ N/A | route exists, target absent | Pas de RTC web |
| `Task_TitleScreenPhase3` `JOY_HELD(BERRY_UPDATE_BUTTON_COMBO)` → CB2_GoToBerryFixScreen | ⚠️ N/A | route exists, target absent | e-Reader berry fix, N/A web |
| `Task_TitleScreenPhase3` `gMPlayInfo_BGM.status == 0` → CB2_GoToCopyrightScreen (= BGM end timeout) | ⚠️ status check | auto-transpiled | Notre M4A track `gMPlayInfo_BGM.status` ? À vérifier — sinon BGM end ne déclenche pas timeout return |
| `gBattle_BG1_X/Y` writes (= shared globals, used Phase3 BG scroll) | ⚠️ partial | exists ? | Pas vérifié si nos BG offsets writes sont bien synced sur ces globals partagés |
| `UpdateLegendaryMarkingColor` Rayquaza eye cycle | ✅ auto | auto-transpiled | OK |
| `FadeOutBGM(4)` au A/Start press + RTC reset + berry combo | ⚠️ partial | auto-transpiled | Notre M4A a une équivalence FadeOutBGM ? À vérifier |
| `CB2_GoToMainMenu` fade + SetMainCallback2(CB2_InitMainMenu) | ✅ auto | auto-transpiled | Transition vers Phase 4 OK |

### Findings Phase 3

- 🟢 **Title screen tourne fully** : Phase1+2+3 + transition vers main menu. Aucun crash signalé.
- 🟡 **`gMPlayInfo_BGM.status` BGM end check** — la décomp utilise ce status pour détecter "BGM finie" → return to copyright. Notre M4A doit exposer un equivalent sinon le looping BGM ne déclenche jamais ce timeout (= comportement web légèrement différent : title reste indéfiniment au lieu de looper sur l'intro). À vérifier mais low priority.
- 🟡 **`FadeOutBGM(4)`** — fade BGM volume sur 4 frames avant transition. Notre M4A doit avoir un equivalent sinon le son coupe net au lieu de fade out.
- 🟡 **`gBattle_BG1_X/Y` partagés** — utilisés par Phase3 ET par battle scenes. Si pas synced, le BG scroll de Phase3 ne s'affiche pas. À vérifier que la lecture/écriture passe bien par les mêmes pointers.
- ❌ **Auxiliary screens absents** : ClearSaveData / ResetRtc / BerryFix tous routés mais cibles non portées. Pas critique Phase 0-3 (= combos rares, contexte spécial).

---

## Phase 4 — Main menu (src/main_menu.c CB2_InitMainMenu + Task_HandleMainMenu*)

### Décomp scope

- `CB2_InitMainMenu` (main_menu.c:548) → `InitMainMenu(FALSE)` (line 558)
- `CB2_ReinitMainMenu` (line 553) → `InitMainMenu(TRUE)` (= return from options menu)
- `CB2_MainMenu` (line 533) — RunTasks + AnimateSprites + BuildOamBuffer + UpdatePaletteFade
- `VBlankCB_MainMenu` (line 541) — LoadOam + ProcessSpriteCopyRequests + TransferPlttBuffer
- `InitMainMenu` BG init + window init + LoadMainMenuWindowFrameTiles + spawn Task_MainMenuCheckSaveFile
- `Task_MainMenuCheckSaveFile` — examine `gSaveFileStatus`, dispatch tMenuType (HAS_NO_SAVED_GAME / HAS_SAVED_GAME / HAS_MYSTERY_GIFT / HAS_MYSTERY_EVENTS)
- `Task_WaitForSaveFileErrorWindow`
- `Task_MainMenuCheckBattery` — `RtcGetErrorStatus` check
- `Task_WaitForBatteryDryErrorWindow`
- `Task_DisplayMainMenu` — draw menu items per tMenuType
- `Task_HighlightSelectedMainMenuItem`
- `Task_HandleMainMenuInput` — D-pad nav + scroll arrows
- `Task_HandleMainMenuAPressed` — dispatch action selected
- `Task_HandleMainMenuBPressed` — back to title
- `Task_DisplayMainMenuInvalidActionError` (= error if user picks invalid combo)
- `Task_NewGameBirchSpeech_Init` (entry to Phase 5)
- Helpers : `LoadMainMenuWindowFrameTiles`, `DrawMainMenuWindowBorder`, `ClearMainMenuWindowTilemap`, `HighlightSelectedMainMenuItem`, `MainMenu_FormatSavegameText`, `CreateMainMenuErrorWindow`, etc.

### Notre impl

- `auto/src/main_menu-callbacks-auto.ts` — 56 exports (Tasks + sprite CBs + transitions)
- `main-menu-impl.ts` — helpers (LoadMainMenuWindowFrameTiles, DrawMainMenuWindowBorder, HandleMainMenuInput, HighlightSelectedMainMenuItem, MainMenu_FormatSavegameText, CreateMainMenuErrorWindow, plus toute la chaîne Birch + DoNamingScreen bridge)

### Diff item-par-item

| Décomp | Status | Notre impl | Notes |
|---|---|---|---|
| `CB2_InitMainMenu` / `CB2_ReinitMainMenu` | ✅ auto | auto-transpiled | OK |
| `CB2_MainMenu` (RunTasks + AnimateSprites + BuildOamBuffer + UpdatePaletteFade) | ✅ implicit | tickFixed | tickFixed fait équivalent |
| `VBlankCB_MainMenu` | ❌ stubbed | — | Idem VBlankCB_Intro, compositor handles Phase 0-3 |
| `InitMainMenu` BG init + DmaFill VRAM/OAM/PLTT + ResetTasks/SpriteData/FreeAllSpritePalettes | ✅ auto | auto-transpiled | OK |
| `Task_MainMenuCheckSaveFile` (gSaveFileStatus dispatch) | ⚠️ partial | auto-transpiled | `gSaveFileStatus` jamais set (= save system stubbed) → toujours SAVE_STATUS_EMPTY → HAS_NO_SAVED_GAME → menu shows "Nouvelle partie" + "Options" only |
| `IsWirelessAdapterConnected` | ❌ stubbed | — | N/A web |
| `IsMysteryGiftEnabled` check | ⚠️ partial | auto-transpiled | Stubbed, toujours false → pas Mystery Gift menu item |
| `Task_WaitForSaveFileErrorWindow` | ✅ auto | auto-transpiled | OK (mais jamais hit Phase 0) |
| `Task_MainMenuCheckBattery` (`RtcGetErrorStatus`) | ⚠️ partial | auto-transpiled | RTC stubbed, skip directement à Task_DisplayMainMenu |
| `Task_DisplayMainMenu` | ✅ auto | auto-transpiled | OK |
| `Task_HighlightSelectedMainMenuItem` | ✅ auto | auto-transpiled | OK |
| `Task_HandleMainMenuInput` D-pad nav + JOY_NEW(A) → APressed + JOY_NEW(B) → BPressed | ✅ auto | auto-transpiled | OK (= user a confirmé que sélection garçon/fille marche) |
| `Task_HandleMainMenuAPressed` New Game → Task_NewGameBirchSpeech_Init | ✅ auto | auto-transpiled | OK (= chemin testé, Birch flow lance) |
| `Task_HandleMainMenuAPressed` Continue → CB2_ContinueSavedGame (= load save + overworld) | ❌ N/A Phase 0 | — | Save system bypass, pas testable. À implémenter Phase 4+ |
| `Task_HandleMainMenuAPressed` Options → CB2_InitOptionMenu | ✅ auto | auto-transpiled + option-menu-impl.ts | OK |
| `Task_HandleMainMenuAPressed` Mystery Gift / Events | ❌ N/A | — | Wireless features |
| `Task_HandleMainMenuBPressed` → CB2_InitTitleScreen | ✅ auto | auto-transpiled | OK |
| `LoadMainMenuWindowFrameTiles` (= window border tiles charge) | ✅ manuel | main-menu-impl.ts | OK |
| `DrawMainMenuWindowBorder` (= dessine border autour text box) | ✅ manuel | main-menu-impl.ts | OK |
| `MainMenu_FormatSavegameText` (= "PRENOM ……X badge(s)…IDx…") | ⚠️ stub | main-menu-impl.ts existe | Lit gSaveBlock2Ptr stub → texte par défaut. Pas critique Phase 0 |
| `sScrollArrowsTemplate_MainMenu` (= scroll arrows si menu > N items) | ✅ data | exported | OK |
| `Task_DisplayMainMenuInvalidActionError` | ✅ auto | auto-transpiled | OK |

### Findings Phase 4

- 🟢 **Main menu fully fonctionnel Phase 0** : New Game + Options sélectionnables via D-pad + A. B retourne au title screen. Le menu se draw correctement avec window borders.
- 🟡 **`gSaveFileStatus` toujours SAVE_STATUS_EMPTY** → seul New Game accessible. Pour Phase 4 (overworld + save) faut implémenter LoadGameSave + status detection depuis localStorage.
- 🟡 **`MainMenu_FormatSavegameText`** existe mais lit save stub → si on active Continue, le texte affiché sera vide ou bidon. Pas critique Phase 0.
- 🟢 **Transitions vers Phase 5 (Birch) et Phase Options confirmées OK** par tests user.
- 🔍 **`gSaveBlock2Ptr->playerName` / `playerGender`** — initialisés à default ("RUBY"/0 ?) avant que naming screen écrive. Vérifier flow d'initialisation.

---

## Phase 5 — Birch speech flow (src/main_menu.c Task_NewGameBirchSpeech_*)

### Décomp scope (35 tasks + 1 CB2)

**Main flow tasks** (1266-1787) :
- Init → WaitToShowBirch → WaitForSpriteFadeInWelcome → ThisIsAPokemon → MainSpeech → AndYouAre → StartBirchLotadPlatformFade → SlidePlatformAway → StartPlayerFadeIn → WaitForPlayerFadeIn → BoyOrGirl → WaitToShowGenderMenu → ChooseGender → SlideOutOldGenderSprite ↔ SlideInNewGenderSprite (loop on gender change) → WhatsYourName → WaitForWhatsYourNameToPrint → WaitPressBeforeNameChoice → StartNamingScreen
- Post-naming : SoItsPlayerName → CreateNameYesNo → ProcessNameYesNoMenu → SlidePlatformAway2 → ReshowBirchLotad → WaitForSpriteFadeInAndTextPrinter → AreYouReady → ShrinkPlayer → WaitForPlayerShrink → FadePlayerToWhite → Cleanup

**Sub-task helpers** (1926-2052) :
- Task_NewGameBirchSpeech_FadeOutTarget1InTarget2 (alpha blend out/in)
- Task_NewGameBirchSpeech_FadeInTarget1OutTarget2
- Task_NewGameBirchSpeech_FadePlatformIn (= sBirchSpeechBgGradientPal[0..7] anim)
- Task_NewGameBirchSpeech_FadePlatformOut

**Post-naming CB2 + task** (1789-1862, 2298) :
- `CB2_NewGameBirchSpeech_ReturnFromNamingScreen` — recharge BG/sprites/palettes après naming screen
- `Task_NewGameBirchSpeech_ReturnFromNamingScreenShowTextbox`

**Helpers** :
- `AddBirchSpeechObjects` (1883) — crée Birch + Lotad + Brendan + May sprites
- `AddNewGameBirchObject` — Birch overworld sprite via `gObjectEventGraphicsInfo_NewGameBirch`
- `CreateTrainerSprite` — Brendan/May trainer pic (= via `FacilityClassToPicIndex(FACILITY_CLASS_BRENDAN/MAY)`)
- `NewGameBirchSpeech_CreateLotadSprite` — `CreateMonPicSprite_Affine(SPECIES_LOTAD, ...)`
- `SpriteCB_Null`, `SpriteCB_MovePlayerDownWhileShrinking`

**Lotad ball release pipeline** (pokeball.c) :
- `CreatePokeballSpriteToReleaseMon`, `SpriteCB_PokeballReleaseMon`, `SpriteCB_ReleasedMonFlyOut`
- `LaunchBallFadeMonTask`, `AnimateBallOpenParticles`, `SetUpForReleaseAffineAnim`
- `SpriteCB_ReleasedMonFlyOut` end → `DoMonFrontSpriteAnimation` → `LaunchAnimationTaskForFrontSprite`

### Notre impl

- `auto/src/main_menu-callbacks-auto.ts` — 37 exports (= 30 main + 4 sub + 1 ReturnFromNamingScreenShowTextbox + 1 CB2_NewGameBirchSpeech_ReturnFromNamingScreen + helpers)
- `main-menu-impl.ts` — `AddBirchSpeechObjects`, `AddNewGameBirchObject`, `CreateTrainerSprite`, `NewGameBirchSpeech_CreateLotadSprite`, `FreeAndDestroyMonPicSprite`, fade Start helpers, palette gradient pal, etc.
- `pokeball-effects.ts` — `LaunchBallFadeMonTask`, `AnimateBallOpenParticles`, `SetUpForReleaseAffineAnim`, `gBallOpenFadeColors`
- `decomp-globals.ts` — `CreatePokeballSpriteToReleaseMon`, `SpriteCB_ReleasedMonFlyOut_Birch`, `BlendPalette`, `BlendPalettes*`, etc.
- `pokemon-animation.ts` — `DoMonFrontSpriteAnimation`, `LaunchAnimationTaskForFrontSprite`, `SpriteCallbackDummy_2`
- `pokemon-anim-funcs.ts` — `Anim_VerticalSquishBounce`, `getMonAnimFunc`

### Diff item-par-item (focus on gaps, since flow tourne end-to-end)

| Décomp | Status | Notre impl | Notes |
|---|---|---|---|
| 30 main flow tasks | ✅ auto | auto-transpiled | OK, user a confirmé fonctionnel |
| 4 sub-tasks fade alpha + platform | ✅ auto | auto-transpiled | OK, utilisés via `NewGameBirchSpeech_Start*` helpers |
| `CB2_NewGameBirchSpeech_ReturnFromNamingScreen` | ⚠️ partial | auto-transpiled (line 1280) | Transpile stats noted "Residual `->` unmapped C pointer access — fallback to ." → vérifier si toutes les lignes sont semantically correctes |
| `Task_NewGameBirchSpeech_ReturnFromNamingScreenShowTextbox` | ✅ auto | auto-transpiled | OK |
| `AddBirchSpeechObjects` | ✅ manuel | main-menu-impl.ts | OK, crée Birch+Lotad+Brendan+May tous invisible initialement |
| `AddNewGameBirchObject` | ⚠️ stub | main-menu-impl.ts | Notre impl utilise un sprite custom, pas le `gObjectEventGraphicsInfo_NewGameBirch` framework. Workaround OK Phase 0-3 mais devra migrer Phase 4 (object_event framework) |
| `CreateTrainerSprite` (Brendan/May trainer pic) | ⚠️ stub | main-menu-impl.ts utilise gTrainerFrontPic_Brendan/May | Décomp passe par `FacilityClassToPicIndex(FACILITY_CLASS_BRENDAN)` → `gTrainerFrontPicTable[]` indirection. Notre impl bypass et hardcode les symboles. Phase 4 (battle scenes) devra porter la table |
| `NewGameBirchSpeech_CreateLotadSprite` (`CreateMonPicSprite_Affine`) | ✅ manuel | main-menu-impl.ts | OK avec fix Session 89-94 (matrix slot pre-alloc + tile data load + affineMode set at create) |
| `SpriteCB_Null` | ✅ trivial | inline | OK |
| `SpriteCB_MovePlayerDownWhileShrinking` (= shrink anim) | ⚠️ N/A vérifié | Existence à confirmer | Utilisé par Task_ShrinkPlayer. Si manquant, le shrink final visuellement broken |
| `CreatePokeballSpriteToReleaseMon` | ✅ manuel | decomp-globals.ts | OK |
| `SpriteCB_PokeballReleaseMon` | ✅ manuel | decomp-globals.ts | OK |
| `SpriteCB_ReleasedMonFlyOut_Birch` (sin-arc fly-out) | ✅ manuel | decomp-globals.ts | OK |
| `LaunchBallFadeMonTask` (white→pink fade) | ✅ manuel | pokeball-effects.ts | Math 1:1 décomp confirmé via Session 93. **Issue déféré** : palette multicolor visible — root cause non identifié (= peut-être compositor scanline, peut-être OBJ palette slot collision avec un autre sprite) |
| `AnimateBallOpenParticles` (sparkles) | ✅ manuel | pokeball-effects.ts | OK |
| `SetUpForReleaseAffineAnim` | ✅ manuel | pokeball-effects.ts | OK |
| `DoMonFrontSpriteAnimation` end | ✅ manuel | pokemon-animation.ts | OK |
| `LaunchAnimationTaskForFrontSprite` | ✅ manuel | pokemon-animation.ts | OK pattern (= sprite.callback dispatch + tile-cycling task) |
| `Anim_VerticalSquishBounce` (Lotad squish/expand) | ⚠️ partial | pokemon-anim-funcs.ts | Math 1:1 décomp + matrix params écrits sur `gba.affineParams[matrixNum]`. **Issue déféré** : user reporte squish non visible. Soit matrix slot écrasé par autre sprite, soit la transition AFFINE_NORMAL→AFFINE_DOUBLE crée un glitch, soit le compositor ne pickup pas l'affine update au bon moment |
| `sMonAnimationDelayTable[species]` (= delay before idle anim starts) | ❌ skipped | — | Pas extracté. La décomp delay le LaunchAnimationTaskForFrontSprite par N frames. Notre impl le call immédiatement → pourrait expliquer le timing différent du visuel |
| `HasTwoFramesAnimation(species)` table | ⚠️ stub TRUE | pokemon-animation.ts:65 | Default TRUE pour tous, valid pour Lotad mais pas extrait |
| `gMonFrontPicTable[species]` (= mapping species → 2-frame .4bpp) | ⚠️ partial | extracted via intro-asset-loader | Lotad anim_front.4bpp.bin loaded, mais si on étend à d'autres species besoin extraction systématique |

### Findings Phase 5

- 🟢 **Birch flow tourne end-to-end** : tous les 35 tasks sont portés (30 main + 4 sub + 1 ShowTextbox + helpers). User a confirmé visuellement OK pour le flow lui-même.
- 🟢 **Ball release pipeline 1:1** : flash + sparkles + cri + sin-arc fly-out + sprite tile cycle. Foundationals (UpdatePaletteFade idempotency, OAM allocation, AllocOamMatrix, BlendPalette dual-buffer, objPaletteToggle preservation) tous landed Sessions 89-94.
- 🔴 **Lotad squish/expand affine non visible** : `Anim_VerticalSquishBounce` est appelé (= confirmed via console traces ?), math est 1:1, matrix params écrits, mais le compositor ne semble pas appliquer le transform visuellement. Hypothèses :
  - **Matrix slot écrasé** par un autre sprite affine entre le write et le render frame
  - **`affineMode = AFFINE_DOUBLE` transition** crée un 1-frame glitch (= sprite render avec bbox 2× mais matrix encore identity)
  - **`sMonAnimationDelayTable` manque** → anim launched trop tôt, avant que les autres systems soient stables
  - **Compositor skip path** pour AFFINE_DOUBLE + matrixNum > 0 a un bug
  - À investiguer en Phase 5+ avec frame-stepping en mGBA savestate
- 🔴 **Palette multicolor flicker Lotad** : malgré les fix V2+S93+S94 (objPaletteToggle preserve, BlendPalette dual buffer, BeginNormalPaletteFade preserve toggle), user voit encore cycle multicolor. Hypothèses :
  - **OBJ palette slot collision** (= un autre sprite share la même slot palette que Lotad → fade ticks d'un sprite affectent l'autre)
  - **Compositor scanline timing** (= H-blank palette swap décomp pas émulé)
  - **`gPlttBufferUnfaded` vs `gPlttBufferFaded` race** lors de BlendPalette write
- 🟡 **`sMonAnimationDelayTable` extraction** = TODO foundational. Sans elle, timings non-1:1 pour beaucoup de species + scenes (= pas seulement Birch, aussi battle send-out, evo, etc.)
- 🟡 **`AddNewGameBirchObject` + `CreateTrainerSprite` bypass framework décomp** : Birch = NPC overworld sprite, Brendan/May = trainer pic. Décomp passe par `gObjectEventGraphicsInfo_*` (Birch) et `gTrainerFrontPicTable` (trainer pics). Notre impl hardcode les symboles. Phase 4 (overworld + battle) devra porter ces frameworks.
- 🟡 **Transpile stats note `Residual ->`** sur `CB2_NewGameBirchSpeech_ReturnFromNamingScreen` → un access pointer non remappé. Pas crash, mais semantic peut être off.

---

## Phase 6 — Naming screen (src/naming_screen.c)

### Décomp scope

- `DoNamingScreen(templateNum, destBuffer, monSpecies, monGender, monPersonality, returnCallback)` (entry, ~line 396)
- `CB2_LoadNamingScreen` state machine 0-7 (= NamingScreen_Init, NamingScreen_InitBGs, ResetPaletteFade, ResetSpriteData+FreeAllSpritePalettes, ResetTasks, LoadPalettes, LoadGfx, CreateSprites+UpdatePaletteFade+ShowBgs, default → CreateHelperTasks+CreateNamingScreenTask)
- `NamingScreen_Init` (466-485) — state machine init, template select, charBaseXPos compute, gKeyRepeatStartDelay = 16
- `NamingScreen_InitBGs` (498-536) — DmaClear VRAM/OAM/PLTT + ResetBgsAndClearDma3BusyFlags + InitBgsFromTemplates + ChangeBg{X,Y} all 0 + InitStandardTextBoxWindows + AddWindow x WIN_COUNT + REG_DISPCNT + BLDCNT/BLDALPHA + SetBgTilemapBuffer + FillBgTilemapBufferRect_Palette0
- `Task_NamingScreen` state machine : FADE_IN, WAIT_FADE_IN, MAIN_INPUT, MOVE_TO_OK_BUTTON, START_PAGE_SWAP, WAIT_PAGE_SWAP, PRESSED_OK, WAIT_SENT_TO_PC_MESSAGE
- `CreateSprites` → `CreateCursorSprite` + `CreatePageSwapButtonSprites` + `CreateBackOkSprites` + `CreateTextEntrySprites` + `CreateInputTargetIcon`
- `CreateInputTargetIcon` dispatch : NoIcon (0) / PlayerIcon (1) / PCIcon (2) / MonIcon (3) / WaldaDadIcon (4)
- `NamingScreen_CreatePlayerIcon` (1397-1406) — `CreateObjectGraphicsSprite(rivalGfxId, SpriteCallbackDummy, 56, 37, 0)` + `StartSpriteAnim(ANIM_STD_GO_SOUTH)`
- Page swap state machine `sPageSwapAnimStateFuncs[0..3]`
- Cursor anim
- `SpriteCB_Underscore`, `SpriteCB_InputArrow`, `SpriteCB_Cursor`, `SpriteCB_PCIcon`
- Input handling : `HandleKeyboardEvent`, `SwapKeyboardPage`, `MoveCursor`, `MoveCursorToOKButton`, `Cursor_GetPosition`, `Cursor_SetX/Y`
- Text entry helpers : `AppendCharToBuffer`, `DeleteTextCharacter`, `TryStartButtonFlash`, `BufferCharacter`, `SetSpritesVisible`
- ~50 functions in naming_screen.c total

### Notre impl (naming-screen-impl.ts ~1100+ lines)

- `DoNamingScreen` (= bridge avec gender field shifted — Session 94 fix)
- `CB2_LoadNamingScreen` state machine 0-7 ✓ avec **Session 95 fix** : VRAM/OAM/PLTT clears manquants ajoutés à `NamingScreen_InitBGs`
- `NamingScreen_Init` ✓
- `NamingScreen_InitBGs` ✓ avec clears
- `Task_NamingScreen` state machine ✓ (10 STATE_*)
- `CreateCursorSprite` + cursor anim FSM (= squish + return-to-idle) ✓
- `CreatePageSwapButtonSprites` + page swap state machine ✓
- `CreateBackOkSprites` ✓
- `CreateTextEntrySprites` ✓ avec **Session 95 fix** : `invisible = true` initial (1:1 décomp)
- `CreateInputTargetIcon` dispatch : NoIcon ✓, PlayerIcon ⚠️ (= Brendan/May trainer with **OFF-DECOMP** hardcoded `SpriteCB_WalkInPlaceSouth` Session 95), PCIcon ✓, MonIcon ❌ stubbed, WaldaDadIcon ❌ stubbed
- `SetSpritesVisible` ✓ (1:1 décomp:487-496)
- `MoveCursor*`, `Cursor_GetPosition`, etc. ✓
- Page swap animation (text slide + button transitions) ✓
- ~25+ foundational helpers ajoutés sessions 91-94

### Diff item-par-item

| Décomp | Status | Notre impl | Notes |
|---|---|---|---|
| `DoNamingScreen` entry | ✅ | naming-screen-impl.ts | OK avec gender field fix Session 94 |
| `CB2_LoadNamingScreen` state machine 0-7 | ✅ | OK | OK |
| `NamingScreen_Init` | ✅ | OK | gKeyRepeatStartDelay = 16 set ✓ |
| `NamingScreen_InitBGs` `DmaClear VRAM/OAM/PLTT` | ✅ Session 95 | CpuFill32 + CpuFill16 ajoutés | **Fix Session 95** : avant skippé → leftover Birch BG/palette bleed |
| `NamingScreen_InitBGs` `BLDCNT_EFFECT_BLEND` + targets | ✅ | OK | OK |
| `NamingScreen_InitBGs` `SetBgTilemapBuffer` x3 + `FillBgTilemapBufferRect_Palette0` | ✅ | OK | OK |
| `NamingScreen_InitBGs` `InitStandardTextBoxWindows` + `InitTextBoxGfxAndPrinters` | ⚠️ partial | Window init via AddWindow boucle | Pas certain que `InitStandardTextBoxWindows` = exact match, vérifier impact texte rendering |
| Task_NamingScreen 10 states | ✅ | OK | OK |
| `CreateCursorSprite` | ✅ | OK | OK avec cursor anim FSM |
| `CreatePageSwapButtonSprites` | ✅ | OK avec subsprite tables (Session 92 fix shape/size) | OK |
| `CreateBackOkSprites` | ✅ | OK | OK |
| `CreateTextEntrySprites` | ✅ Session 95 | invisible=true initial fix | OK |
| `CreateInputTargetIcon` PLAYER | ⚠️ OFF-DECOMP | `SpriteCB_WalkInPlaceSouth` hardcoded `[0,8,0,16]` | **Bug 1:1** : décomp utilise `CreateObjectGraphicsSprite(rivalGfxId, ...)` + `StartSpriteAnim(ANIM_STD_GO_SOUTH)` qui passe par `gObjectEventGraphicsInfo_*` + `sPicTable_*` framework. Notre impl bypass = trainer cycle frames différentes (= nord/west visibles au lieu de sud walk-in-place) |
| `CreateInputTargetIcon` PC | ✅ | OK Session 92 | OK |
| `CreateInputTargetIcon` MON | ❌ stub | — | Future (= NICKNAME / CAUGHT_MON contexts) |
| `CreateInputTargetIcon` WALDA | ❌ stub | — | Future (= WALDA context) |
| `SpriteCB_Cursor` (cursor flash via `MultiplyInvertedPaletteRGBComponents`) | ✅ | OK | OK avec foundational helper Session 92 |
| `SpriteCB_Underscore` (bob anim active char) | ✅ | OK | OK |
| `SpriteCB_InputArrow` | ✅ | OK | OK |
| Page swap animation (`PageSwapAnimState_Init`/`_1`/`_2`/`_Done`) | ⚠️ partial | sprite slide OK, BG tilemap slide ❌ | Décomp slide BG1+BG2 via `bg1vOffset`/`bg2vOffset` writes dans VBlankCB. Notre VBlankCB = stubbed → BG slide invisible. **Déféré** dans audit V2 |
| Keyboard chars rendering (BG tilemap `gNamingScreenKeyboardUpper_Tilemap` etc.) | ⚠️ stub | window text printer fallback | Décomp utilise pre-baked tilemaps. Notre impl draw chars via window text printer → fonctionnel mais pas 1:1 visuellement |
| Cursor positioning vs char tilemap | 🔴 BUG | offset par 1 col | User screenshot photo 4/5 : cursor sur "D" affiche vide (= D est typed dans entry), photo 5 cursor sur "C" affiche le "D". Notre `MoveCursor` calcule via `inputCharBaseXPos` mais le char rendering (= window text printer) utilise un offset différent → 1-col offset visible |
| Input handling (D-pad, A/B/Select/Start) | ✅ | OK | User a confirmé fonctionnel |
| Name buffer + return | ✅ | OK | User a confirmé : nom retourne au flow Birch correctement |
| `gKeyRepeatStartDelay = 16` set au Init, restore au Cleanup | ⚠️ partial | OK set, mais original gKeyRepeat* jamais init à 40/5 (cf Phase 1) | Si on restore au cleanup, on restore à la valeur juste avant qui peut être 0 → key repeat instantané partout après naming screen. **Bug latent** lié au Phase 1 finding |
| `SetSpritesVisible` au fade-in | ✅ | OK | OK (= passe les sprites créés invisible visibles) |

### Findings Phase 6

- 🟢 **Naming screen fonctionnellement OK** : input handling, page swap, OK confirm, B backspace, name retour. User valide.
- 🟢 **Sessions 91-95 ont fixé** :
  - sprite tile data corruption (= `.4bpp.bin` extraction)
  - subsprite shape/size constants
  - cursor anim FSM (= direct oam.tileId write pattern)
  - subsprite child OAM allocation (`getSubspriteChildOamIndices`)
  - VRAM/OAM/PLTT clears (= no more Birch ground bleed)
  - underscores invisible initial
  - trainer asset load + bridge args
- 🔴 **Trainer walk-in-place wrong frames** : Session 95 fix hardcoded `[0, 8, 16]` tile offsets = OFF-DECOMP shortcut. Décomp passe par `CreateObjectGraphicsSprite` → `gObjectEventGraphicsInfo_BrendanNormal` → `sPicTable_BrendanNormal` (= mapping frame→tile range) + `gAnims_StandardSouth` (anim cmd table). À fix Phase 5+ via port object_event_graphics framework.
- 🔴 **Cursor position offset 1 col** vs char tilemap. Decomp `Cursor_SetX` utilise `keyboardX + col * 8` dans le coord system du naming screen. Notre `MoveCursor` calcule depuis `inputCharBaseXPos` qui est pour le ENTRY field (= top), pas le KEYBOARD area (= bottom). Bug atomique distinct du trainer.
- 🟡 **BG tilemap chars** : keyboard chars dessinés via text printer au lieu de pre-baked `gNamingScreenKeyboardUpper_Tilemap`. Visuellement basique mais OK fonctionnel. Migration optionnelle.
- 🟡 **Page swap BG slide** : sprite slide OK, BG slide manquant (= VBlankCB stub). Effet visuel partiel.
- 🟡 **MonIcon / WaldaDadIcon** stubbed → naming nicknames / Walda PC box fonctionne mais sans icône contextuelle.

---

## Phase 7 — CB2_NewGame transition (= boundary to Phase 4 overworld)

### Décomp scope

**`CB2_NewGame` (overworld.c:1532)** — entry point appelé par `Task_NewGameBirchSpeech_Cleanup` :
- `FieldClearVBlankHBlankCallbacks` (= clear les VBlank/HBlank callbacks Birch)
- `StopMapMusic`
- `ResetSafariZoneFlag_`
- `NewGameInitData()` (= massive init data, voir below)
- `ResetInitialPlayerAvatarState`
- `PlayTimeCounter_Start`
- `ScriptContext_Init` (= scripting engine pour cutscenes overworld)
- `UnlockPlayerFieldControls`
- `gFieldCallback = ExecuteTruckSequence` (= cinématique truck d'arrivée à Littleroot)
- `gFieldCallback2 = NULL`
- `DoMapLoadLoop(&gMain.state)` (= map loading state machine)
- `SetFieldVBlankCallback` (= overworld VBlank: object events anim + scanline effects)
- `SetMainCallback1(CB1_Overworld)` (= overworld input + map scroll + object event tick logic, callback1 = pre-VBlank)
- `SetMainCallback2(CB2_Overworld)` (= overworld main loop tick)

**`NewGameInitData` (new_game.c:149)** — initialise tout le save state d'une nouvelle partie :
- `gSaveBlock2Ptr->encryptionKey = 0`
- `ZeroPlayerPartyMons` / `ZeroEnemyPartyMons` (= party reset)
- `ResetPokedex` / `ClearPokedexFlags`
- `ClearFrontierRecord` / `ClearSav1` / `ClearAllMail` / `ClearTVShowData` / `ClearSecretBases` / `ClearBerryTrees`
- `InitPlayerTrainerId` (= TID/SID via Random)
- `PlayTimeCounter_Reset`
- `InitEventData` (= flags + vars init)
- `SetMoney(3000)` / `SetCoins(0)`
- `ResetGameStats`
- `ClearBag` / `NewGameInitPCItems` (= initial PC items)
- `ClearPokeblocks` / `ClearDecorationInventories`
- `InitEasyChatPhrases` / `SetMauvilleOldMan` / `InitDewfordTrend` / `ResetFanClub` / `ResetLotteryCorner`
- `WarpToTruck` (= warp player position to truck map MAP_INSIDE_OF_TRUCK)
- `RunScriptImmediately(EventScript_ResetAllMapFlags)`
- `InitMatchCallCounters` / `ClearMysteryGift` / `ResetTrainerHillResults` / etc.

### Notre impl

**`src/engine/overworld-welcome-impl.ts`** — STUB `CB2_OverworldWelcomePlaceholder` :
- Reset BGs/OAM/PLTT
- Init un BG0 simple + 1 window dialogue
- Affiche "BIENVENUE EN HOENN, [playerName] !\nOverworld bientôt 1:1 décomp."
- Lance `MUS_LITTLEROOT` BGM
- Loop : RunTasks/AnimateSprites/BuildOamBuffer/UpdatePaletteFade

### Diff item-par-item

| Décomp | Status | Notre impl | Notes |
|---|---|---|---|
| `CB2_NewGame` 1:1 décomp | ❌ stub | `CB2_OverworldWelcomePlaceholder` | Boundary explicite : Phase 4 |
| `FieldClearVBlankHBlankCallbacks` | ❌ | — | Pas implémenté |
| `StopMapMusic` | ❌ | — | M4A continue à jouer |
| `ResetSafariZoneFlag_` | ❌ N/A | — | Safari Zone non porté |
| `NewGameInitData` (~50 inits) | ❌ | — | **Foundational miss critique pour Phase 4** : tout le save state init |
| `ZeroPlayerPartyMons` | ❌ | — | Party system pas porté |
| `ResetPokedex` / `ClearPokedexFlags` | ❌ | — | Pokedex pas porté |
| `InitPlayerTrainerId` (TID/SID Random) | ❌ | — | Pas init TID/SID. Si battle scene tirée, comportement undefined |
| `InitEventData` (flags + vars init) | ❌ | — | Event flag/var system pas porté |
| `SetMoney(3000)` / `ClearBag` / `NewGameInitPCItems` | ❌ | — | Inventory system pas porté |
| `WarpToTruck` (= MAP_INSIDE_OF_TRUCK warp) | ❌ | — | Warp system + map system pas portés |
| `gFieldCallback = ExecuteTruckSequence` | ❌ | — | Cutscene script pas porté |
| `DoMapLoadLoop` | ❌ | — | Map load engine pas porté |
| `SetMainCallback1(CB1_Overworld)` | ❌ | — | callback1 jamais utilisé (cf Phase 1 finding) |
| `SetMainCallback2(CB2_Overworld)` | ❌ | — | Main overworld loop pas porté |
| `SetFieldVBlankCallback` | ❌ | — | VBlankCB stub partout |
| `MUS_LITTLEROOT` BGM | ✅ | OK via M4A | Au moins le son est là |

### Findings Phase 7

- 🔴 **CB2_NewGame est une stub TOTALE** : on a juste un écran de bienvenue + BGM. Tout le système overworld (= map loading, object events, player avatar movement, scripts, warps, field weather, scanline effects, save system, party, bag, pokedex, etc.) reste à porter. **C'est la Phase 4 entière.**
- 🟢 **Boundary clean** : la transition Birch → Welcome se fait via `SetMainCallback2(CB2_OverworldWelcomePlaceholder)` qui correspond conceptuellement au `SetMainCallback2(CB2_NewGame)` décomp. Quand on porte CB2_NewGame réel, on swap le placeholder.
- 🟡 **`gSaveBlock2Ptr->playerName` lu correctement** dans la welcome stub → confirme que le naming screen écrit bien dans le save block partagé.

---

## Synthèse globale + roadmap

### Récap status par phase

| Phase | Scope | État | Critique pour Phase 4 ? |
|---|---|---|---|
| 1. AgbMain | boot init | ⚠️ partial | 🟡 InitKeys, callback1, intrCheck |
| 2. Copyright + Intro | intro 3-scenes | ✅ tourne | 🟢 OK |
| 3. Title screen | logo + press start | ✅ tourne | 🟢 OK |
| 4. Main menu | New Game / Options | ✅ tourne (sans Continue) | 🟡 save status detection |
| 5. Birch speech | 35 tasks + ball release | ✅ tourne (Lotad polish déféré) | 🟡 object_event framework |
| 6. Naming screen | clavier + 25 helpers | ⚠️ visuel (cursor offset + trainer wrong frames) | 🟡 object_event framework |
| 7. CB2_NewGame | overworld init | ❌ stub | 🔴 c'EST la Phase 4 |

### Top issues à fixer AVANT Phase 4 (= overworld réel)

#### 🔴 Critiques (bloquantes pour qualité Phase 4)

1. **Port `object_event_graphics` framework** (`gObjectEventGraphicsInfo_*` + `sPicTable_*` + `gAnims_Standard{South,North,West,East}` + `CreateObjectGraphicsSprite`). Bénéficie : naming screen trainer (= fix wrong frames), Birch sprite (= remplace AddNewGameBirchObject hack), futur overworld NPCs, future battle trainer sprites. **Sans ça, Phase 4 va re-générer les mêmes hacks scene-specific.**
2. **Fix cursor offset 1 col** sur naming screen (= bug atomique distinct du framework).
3. **Init `gKeyRepeatStartDelay = 40` / `gKeyRepeatContinueDelay = 5`** au boot (1:1 `InitKeys`). Sans ça, key repeat instable après naming screen cleanup.
4. **`callback1` invocation** dans `tickFixed`. CB1_Overworld est appelé chaque frame avant CB2 dans la décomp. Sans ça, l'overworld ne pourra pas tick proprement (= movement, object events).

#### 🟡 Importantes (qualité 1:1 mais pas bloquantes)

5. **`sMonAnimationDelayTable` + `sMonFrontAnimIdsTable` extraction** (= 387 species). Bénéficie : fix Lotad squish/expand timing + tous les autres species pour battle/evo/Pokedex.
6. **`HasTwoFramesAnimation` table** extraction.
7. **VBlankCB_*** réels (= LoadOam + ProcessSpriteCopyRequests + TransferPlttBuffer + ScanlineEffect_InitHBlankDmaTransfer). Notre compositor handle 3/4 implicitement, mais ScanlineEffect = manquant pour overworld weather/water effects.
8. **Page swap BG slide naming screen** (= `bg1vOffset`/`bg2vOffset` writes via VBlankCB). Cosmétique mais visuel non 1:1.
9. **Trainer pic table** (`gTrainerFrontPicTable` + `FacilityClassToPicIndex`). Bénéficie battle scenes Phase 4+.
10. **Save system port** (`gSaveBlock1Ptr` + `gSaveBlock2Ptr` + `LoadGameSave` + `SaveGame` via localStorage). Bénéficie Continue option main menu + save persist Phase 4.

#### 🟢 Mineures (cosmétique / N/A web)

11. Lotad palette multicolor (= compositor scanline / palette slot collision investigation)
12. `MainMenu_FormatSavegameText` réel (= dépend save system)
13. MonIcon / WaldaDadIcon naming screen (= dépend Pokemon icon system + ObjectEvent system)
14. BGM `gMPlayInfo_BGM.status` end check (= title screen BGM timeout)
15. `FadeOutBGM(N)` smooth fade (= M4A enhancement)
16. BG tilemap rendering pour keyboard chars (= migration text printer → pre-baked tilemap)

### Méta-finding

Le projet a une **bonne hiérarchie** : Layer 1 (GBA hardware) ✅, Layer 2 (system primitives) ✅ mostly, Layer 3 (frameworks) ⚠️ partiel — c'est là que les hacks scene-specific ont compensé, et c'est ce qui force à refaire à la main quand une scene a besoin d'un framework manquant. **Phase 4 sera viable uniquement après port des frameworks Layer 3 critiques** (= object_event_graphics + save + script + map loading).

L'audit ne révèle PAS de bug architectural fondamental. Les fondations sont solides. Manquent des couches d'abstraction que la décomp nous offre gratuitement et qu'on doit porter une fois pour toutes plutôt que continuer à réinventer scene-by-scene.

---













