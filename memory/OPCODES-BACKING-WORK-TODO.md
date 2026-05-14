# Opcodes — Backing systems TODO (post session 131)

**Contexte** : Session 131 a registered TOUS les opcodes du jeu (975 utilisés → 0 missing) en 1:1 décomp. Mais beaucoup attendent qu'un système backing soit codé pour avoir un effet gameplay réel. Ce doc liste ce qui reste à faire **par catégorie de difficulté**.

Format : opcode → status actuel → ce qui manque → fichier(s) décomp source → estimation.

---

## 🟢 ZÉRO travail — déjà 100% fonctionnel

Aucune action requise. Ces opcodes set/lisent du state correctement.

- `additem`/`removeitem`/`checkitem`/`checkitemspace`/`checkpcitem`/`addpcitem`/`checkitemtype` — bag operations
- `givemoney`/`takemoney`/`removemoney`/`checkmoney`/`givecoins`/`takecoins`/`removecoins`/`checkcoins`/`addcoins` — money/coins arithmetic sur `gSaveBlock1Ptr`
- `adddecoration`/`givedecoration`/`takedecoration`/`removedecoration`/`checkdecor`/`checkdecorspace` — decorations array
- `setmonmove`/`setmonmetlocation`/`setmodernfatefulencounter`/`checkmodernfatefulencounter` — party mon data
- `setberrytree` — block1.berryTrees write
- `warp`/`warpsilent`/`warpdoor`/`warpwhitefade`/`warphole` — pendingWarp dispatch
- `setdynamicwarp`/`setescapewarp` — saveBlock writes
- `gotostd`/`callstd`/`gotostd_if`/`callstd_if` — dispatch inline behavior (msgbox std types ok)
- `vgoto`/`vcall`/`vmessage`/`vbufferstring` + `_if` variants — delegate to non-virtual
- `callnative`/`gotonative` — invoke special by name
- `compare_*` variants — delegate to compare
- `applymovementat`/`waitmovementat`/`removeobjectat`/`addobjectat` — delegate to single-map
- `setvar`/`addvar`/`subvar`/`copyvar`/`setorcopyvar`/`setflag`/`clearflag`/`checkflag`
- `setobjectxy`/`setobjectxyperm`/`copyobjectxytoperm`/`setobjectmovementtype`/`turnobject`/`faceplayer`
- `showobject`/`hideobject`/`showobjectat`/`hideobjectat`/`addobject`/`removeobject`
- `opendoor`/`closedoor`/`waitdooranim`/`setdooropen`/`setdoorclosed`
- `lock`/`lockall`/`release`/`releaseall`
- `message`/`waitmessage`/`closemessage`/`waitbuttonpress`/`msgbox`/`messageautoscroll`/`messageinstant`/`braillemsgbox` (sans braille font)
- `yesnobox`/`multichoice`/`multichoicedefault`/`multichoicegrid`
- `playse`/`playfanfare`/`waitfanfare`/`playbgm`/`savebgm`/`fadedefaultbgm`/`fadenewbgm`/`fadeoutbgm`/`fadeinbgm`/`playsewithpan`/`loopsewithpan`/`playmoncry`
- `fadescreen`/`fadescreenspeed`/`fadescreenswapbuffers`/`setmetatile`
- `random`/`gettime`/`getplayerxy`/`getpartysize`/`countpokemon`/`checkpartymove`/`finditem`
- `setrespawn`/`incrementgamestat`/`setweather`/`doweather`
- `bufferspeciesname`/`bufferleadmonspeciesname`/`bufferpartymonnick`/`bufferitemname`/`bufferitemnameplural`/`bufferdecorationname`/`buffermovename`/`bufferattackname`/`buffernumberstring`/`buffermoneyamount`/`bufferstdstring`/`bufferstring`/`bufferboxname`/`buffertrainerclassname`/`buffertrainername`
- `givemon`/`givepokemon`/`giveegg`/`giveitem`/`pokenavcall`/`register_matchcall`
- `trainerbattle` + variants single/double/rematch/rematch_double/no_intro
- `pokemart` + decoration variants (delegate)
- `nop`/`nop1`/`returnram`/`endram`/`setmysteryeventstatus`/`setworldmapflag`/`setvaddress`/`drawbox`/`erasebox`/`drawboxtext`/`preparemsg`/`cmd5e` (no-op safe)

---

## 🟡 DOABLE NOW — registry intégré mais besoin que le module backing soit codé (~10-12h total)

Ces opcodes set du state ou cherchent à appeler un dispatcher qui n'existe pas encore. **Pas une grosse system port**, juste du wire-up TS. À faire dès qu'on a la motivation, ça améliorera l'expérience overworld.

### 1. `setobjectsubpriority` / `resetobjectsubpriority` — Object render order
- **Status** : Set `subpriority` field sur l'ObjectEvent + flag `fixedPriority`
- **À faire** : dans le sprite renderer, lire `obj.subpriority` au lieu du calcul automatique basé sur y
- **Source décomp** : `src/event_object_movement.c:SetObjectSubpriority` + sprite render loop dans `src/sprite.c`
- **Estimation** : ~30 min
- **Usages early game** : 73× dans extracted scripts. Important pour cutscenes (= NPC layered devant/derrière player).

### 2. `setflashlevel` / `animateflash` — Cave darkness mask
- **Status** : Set `_gFlashLevel` 0..7 global
- **À faire** : overlay noir avec cutout circulaire autour du player. 8 niveaux (0=plein jour, 7=pitch black). Animation `animateflash` = lerp 16 frames entre levels.
- **Source décomp** : `src/fldeff_flash.c` (= bgPlttBufferTransparent + scanline mask + radius shrink anim)
- **Estimation** : ~1h
- **Usages** : Granite Cave, Mt. Pyre, Cave of Origin, Sky Pillar (= mid-late game)

### 3. `createvobject` / `turnvobject` — Virtual sprite rendering
- **Status** : Stocke dans `_gVirtualObjects` Map<id, {gfx, x, y, elevation, direction}>
- **À faire** : OAM rendering séparé des ObjectEvents — virtual objects ont leur propre OAM allocation pool, pas de collision, pas d'interaction. Lecture `gfxId` → load sprite gfx + palette → render à (x,y).
- **Source décomp** : `src/event_object_movement.c:CreateVirtualObject` + `gVirtualObjectGraphicsInfoPointers`
- **Estimation** : ~1.5-2h
- **Usages early game** : 429× dans scripts. Très important — cutscenes (Birch escape, May/Brendan running by, etc.)

### 4. `showmoneybox` / `hidemoneybox` / `updatemoneybox` — Money UI window
- **Status** : Set `gMoneyBoxState = { visible, x, y }`
- **À faire** : render fenêtre 8x2 tiles avec amount centered, palette 12. `updatemoneybox` = redraw amount avec nouveau total. `hidemoneybox` = clear window + remove from VRAM.
- **Source décomp** : `src/money.c:DrawMoneyBox` / `ChangeAmountInMoneyBox` / `HideMoneyBox` + window template `sMoneyBoxWindowTemplate`
- **Estimation** : ~1h
- **Usages** : Pokemarts (Route 102 et après), Game Corner

### 5. `showcoinsbox` / `hidecoinsbox` / `updatecoinsbox` — Coins UI window
- **Status** : Set `gCoinsBoxState`
- **À faire** : same pattern que money box, palette 12, format "Pièces: 9999"
- **Source décomp** : `src/coins.c:ShowCoinsWindow` / `HideCoinsWindow` / `PrintCoinsString`
- **Estimation** : ~1h
- **Usages** : Game Corner (= Mauville casino, mid-game)

### 6. `waitse` / `waitmoncry` / `waitfieldeffect` / `hidemonpic` — Real wait
- **Status** : Frame-counted (16/30/60/8 frames)
- **À faire** : Replace par real tracking :
  - `waitse` → check `IsSEPlaying()` (= track active SE channel via spessasynth synth slot=se1/se2)
  - `waitmoncry` → check `IsCryPlaying()` (= track cry slot)
  - `waitfieldeffect` → check `FieldEffectActiveListContains(_sFieldEffectScriptId)` (= maintain active list)
  - `hidemonpic` → check pic fade-out task done
- **Source décomp** : `src/sound.c:IsSEPlaying`, `src/sound.c:IsCryFinished`, `src/field_effect.c:FieldEffectActiveListContains`, `src/script_menu.c:ScriptMenu_HidePokemonPic`
- **Estimation** : ~45 min
- **Usages** : `waitse` 499× / `waitmoncry` 198× / `waitfieldeffect` 41× / `hidemonpic` ~20×

### 7. `setstepcallback` — Per-step callback dispatch
- **Status** : Set `gActivePerStepCallbackId`
- **À faire** : appeler la callback function à chaque tile move du player (= dans movement-system après step complete). Callbacks = `STEP_CB_DEWFORD_TRENDS` (= step counter for Trendy phrases), `STEP_CB_PACIFIDLOG_BRIDGE` (= sink bridges), `STEP_CB_ASH_GRASS` (= ash piles), etc.
- **Source décomp** : `src/overworld.c:gPerStepCallbacks[]` + chaque callback dans des fichiers map-spécifiques
- **Estimation** : ~45 min (+ implémenter chaque callback = work iteratif)
- **Usages** : 41× (= maps post-Route 102)

### 8. `dotimebasedevents` — Berry growth + daily events
- **Status** : No-op
- **À faire** : Réel decrement de `berryTrees[i].minutesUntilNextStage` selon delta RTC depuis dernier check. Aussi : daily flag clears (= `ClearDailyFlags` 1:1 `event_data.c:ClearDailyFlagsAfterChallenge`).
- **Source décomp** : `src/berry.c:DoTimeBasedEvents` + `src/event_data.c:GetSavedTimeBasedEvents`
- **Estimation** : ~1h
- **Usages** : 45×

### 9. `setmaplayoutindex` — Dynamic layout swap
- **Status** : Set `gPendingMapLayoutIndex`
- **À faire** : recharger tile data + collision data sans recharger toute la map (= preserve objects, player pos, etc.). Re-render BG layers.
- **Source décomp** : `src/fieldmap.c:SetCurrentMapLayout`
- **Estimation** : ~1.5h
- **Usages** : 54× (= Pacifidlog day/night, Sootopolis ice cracks après gym 7)

### 10. `setdivewarp` / `setholewarp` consumers
- **Status** : Stockent `gDiveWarp` / `gHoleWarp` globals
- **À faire** :
  - `setdivewarp` → quand player utilise HM Dive (Plongée), lire `gDiveWarp` pour la destination
  - `setholewarp` → déjà consommé par `warphole` (= via `gHoleWarp.destMap`) ✓
- **Source décomp** : `src/dive.c:GetDiveWarpDestination`
- **Estimation** : ~30 min (Dive comes mid-game)
- **Usages** : `setdivewarp` 48×, `setholewarp` ~10×

### 11. `disable_jump_landing_ground_effect` consumer
- **Status** : Set flag `disableJumpLandingGroundEffect` sur l'ObjectEvent
- **À faire** : dans le jump landing handler (= movement-system), check ce flag avant de spawn le dust effect
- **Source décomp** : `src/event_object_movement.c:DoLandingEffect`
- **Estimation** : ~15 min
- **Usages** : ~5×

### 12. `lockfortrainer` full freeze tracking
- **Status** : Freeze all NPCs + 4 frames wait
- **À faire** : `IsFreezeObjectAndPlayerFinished` réel = vérifier que le player + tous les NPCs ont fini leur step animation courant (= ne pas resume pendant un walk_left in progress)
- **Source décomp** : `src/trainer_see.c:FreezeForApproachingTrainers` / `IsFreezeObjectAndPlayerFinished`
- **Estimation** : ~45 min
- **Usages** : ~50×

### 13. Mossdeep rotating tile puzzle
- **Status** : Set/clear `gRotatingTilePuzzleState` global
- **À faire** : `MoveRotatingTileObjects` = rotate les tiles de 90° + déplacer les NPCs sur leurs nouvelles positions
- **Source décomp** : `src/mossdeep_gym.c` ~500 lignes
- **Estimation** : ~2h
- **Usages** : ~10× (Mossdeep Gym 7, mid-late game)

### 14. Field effects sparkle/etc. real rendering
- **Status** : `dofieldeffectsparkle` set args + appelle dofieldeffect avec id FLDEFF_SPARKLE
- **À faire** : implémenter FLDEFF_SPARKLE rendering (= 4 frames sparkle anim avec palette flicker)
- **Source décomp** : `src/field_effect.c:FLDEFF_SPARKLE` callback
- **Estimation** : ~30 min
- **Usages** : 39× (hidden items shimmer)

**Total estimé tier 🟡 : ~10-13 heures de focus**

---

## 🔴 DÉFÉRÉ — opcodes mènent à un stub parce qu'on peut RÉELLEMENT pas le faire maintenant

Chacun est un sous-système ~2000-5000 lignes décomp. Doit attendre que les fondations soient posées (battle script interpreter Phase 1, ou simplement priorisé après le scénario principal).

### Bloqués par Phase 1 battle script interpreter
Les `specials` Battle Frontier ne peuvent pas exister sans un système de combats fonctionnel.

1. **Battle Frontier (7 facilities)** — `frontier_set`/`get`/etc., `tower_*`, `dome_*`, `factory_*`, `pike_*`, `palace_*`, `arena_*`, `pyramid_*`
   - Specials : `CallFrontierUtilFunc`, `CallBattleTowerFunc`, `CallBattleDomeFunction`, `CallBattleFactoryFunction`, `CallBattlePikeFunction`, `CallBattlePalaceFunction`, `CallBattleArenaFunction`, `CallBattlePyramidFunction`
   - Décomp : `src/battle_tower.c` 3500 lignes + `src/battle_dome.c` 2800 lignes + `src/battle_factory.c` 1800 lignes + `src/battle_pike.c` 2200 lignes + `src/battle_palace.c` 1800 lignes + `src/battle_arena.c` 1600 lignes + `src/battle_pyramid.c` 2500 lignes + `src/frontier_util.c` 4000 lignes
   - Estimation : ~3-4 SEMAINES après Phase 1 battle

2. **Battle Tents (3)** — `verdanturftent_save`, `fallarbortent_save`, `slateporttent_save`
   - Specials : `CallVerdanturfTentFunction`, `CallFallarborTentFunction`, `CallSlateportTentFunction`
   - Décomp : `src/battle_tent.c` ~1500 lignes
   - Estimation : ~5 jours après Phase 1

3. **Apprentice** — 23 specials (`apprentice_*` opcodes via `CallApprenticeFunction`)
   - Décomp : `src/apprentice.c` ~2500 lignes
   - Estimation : ~1 semaine après Phase 1

4. **Trainer Hill** — scene dédiée, opcodes `trainerhill_*` via `CallTrainerHillFunction`
   - Décomp : `src/trainer_hill.c` ~1500 lignes
   - Estimation : ~5 jours après Phase 1

### Bloqués par d'autres sous-systèmes massifs

5. **Daycare** — egg gen, level gain, compatibility
   - Specials : `GiveEggFromDaycare`, `TakePokemonFromDaycare`, `StoreSelectedPokemonInDaycare`, `ChooseSendDaycareMon`, `RejectEggFromDayCare`, `GetDaycareCost`, `GetDaycareMonNicknames`, `ShowDaycareLevelMenu`, `GetNumLevelsGainedFromDaycare`, `CheckDaycareMonReceivedMail`, `EggHatch`, `ScriptHatchMon`, `SetDaycareCompatibilityString`, `IsContestDebugActive`
   - Décomp : `src/daycare.c` 2200 lignes + `src/egg_hatch.c` 1200 lignes
   - Estimation : ~2 semaines

6. **Contest complet** — 4 categories, AI, scoring, paintings
   - Specials : `ShowContestEntryMonPic`, `HideContestEntryMonPic`, `BufferContestTrainerAndMonNames`, `BufferContestWinnerTrainerName`, `GetContestPlayerId`, `GetContestMonCondition`, `GetContestMonConditionRanking`, `GetContestantNamesAtRank`, `GetContestLadyCategory`, `GetContestLadyMonSpecies`, `HasMonWonThisContestBefore`, `IsContestWithRSPlayer`, `IsTVShowAlreadyInQueue`, `SetContestTrainerGfxIds`, `SetContestCategoryStringVarForInterview`, `OpenPokeblockCaseForContestLady`, `ScrollableMultichoice_*`, `TryEnterContestMon`, `Script_BufferContestLadyCategoryAndMonName`, `ShouldContestLadyShowGoOnAir`, `SetContestLadyGivenPokeblock`, `HasPlayerGivenContestLadyPokeblock`, `ShouldReadyContestArtist`, `DoesContestCategoryHaveMuseumPainting`, `ShowContestPainting`, `SaveMuseumContestPainting`, `GiveMonContestRibbon`, `GiveMonArtistRibbon`, `BufferContestWinnerTrainerName`, etc.
   - Décomp : `src/contest.c` 3500 lignes + `src/contest_painting.c` 600 lignes + `src/contest_link.c` 800 lignes
   - Estimation : ~3 semaines

7. **Secret Base** — decoration placement, neighbor visit, base battle
   - Specials : `CheckPlayerHasSecretBase`, `SetPlayerSecretBase`, `ClearAndLeaveSecretBase`, `EnterSecretBase`, `EnterNewlyCreatedSecretBase`, `MoveOutOfSecretBase`, `MoveOutOfSecretBaseFromOutside`, `InitSecretBaseVars`, `InitSecretBaseDecorationSprites`, `SetSecretBaseOwnerGfxId`, `GetSecretBaseNearbyMapName`, `GetSecretBaseOwnerAndState`, `GetSecretBaseTypeInFrontOfPlayer`, `ShowSecretBaseDecorationMenu`, `ShowSecretBaseRegistryMenu`, `IsCurSecretBaseOwnedByAnotherPlayer`, `CopyCurSecretBaseOwnerName_StrVar1`, `GetCurSecretBaseRegistrationValidity`, `ToggleCurSecretBaseRegistry`, `IsDecorationCategoryFull`, `DoesPlayerHaveNoDecorations`, `SetDecoration`, `WonSecretBaseBattle`, `LostSecretBaseBattle`, `DrewSecretBaseBattle`, `PrepSecretBaseBattleFlags`, `CheckInteractedWithFriends*Decor`, `PutAwayDecorationIteration`, `InteractWithShieldOrTVDecoration`
   - Décomp : `src/secret_base.c` 2500 lignes + `src/decoration.c` 2200 lignes + `src/decoration_inventory.c` 800 lignes
   - Estimation : ~2 semaines

8. **Pokemon Storage System UI** — PC boxes
   - Specials : `ShowPokemonStorageSystemPC`, `ScriptCheckFreePokemonStorageSpace`, `GetPCBoxToSendMon`, `ChangeBoxPokemonNickname`, `ShouldShowBoxWasFullMessage`
   - Décomp : `src/pokemon_storage_system.c` 5500 lignes 😭
   - Estimation : ~3 semaines

9. **TV shows** — ~30 show types, recording + playback
   - Specials : `DoTVShow`, `DoTVShowInSearchOfTrainers`, `ResetTVShowState`, `IsTVShowAlreadyInQueue`, `GetRandomActiveShowIdx`, `GetNextActiveShowIfMassOutbreak`, `PutFanClubSpecialOnTheAir`, `TryPutLotteryWinnerReportOnAir`, `TryPutNameRaterShowOnTheAir`, `TryPutTreasureInvestigatorsOnAir`, `TryPutTrainerFanClubOnAir`, `PutLilycoveContestLadyShowOnTheAir`, `IsGabbyAndTyShowOnTheAir`, `GabbyAndTyAfterInterview`, `GabbyAndTyBeforeInterview`, `GabbyAndTyGetBattleNum`, `GabbyAndTyGetLastBattleTrivia`, `GabbyAndTyGetLastQuote`, `GetGabbyAndTyLocalIds`, `InterviewAfter`, `GetSelectedTVShow`, `GetNpcContestantLocalId`, `ShouldHideFanClubInterviewer`, `TryHideBattleTowerReporter`, `TryInitBattleTowerAwardManObjectEvent`, `CheckForPlayersHouseNews`, `DoPokeNews`, `GetMomOrDadStringForTVMessage`, `UpdateTrainerFanClubGameClear`, `SetPlayerGotFirstFans`, `TryLoseFansFromPlayTime`, `TryLoseFansFromPlayTimeAfterLinkBattle`
   - Décomp : `src/tv.c` 4500 lignes
   - Estimation : ~3 semaines

10. **Lottery** — ID match logic
    - Specials : `PickLotteryCornerTicket`, `RetrieveLotteryNumber`, `DoLotteryCornerComputerEffect`, `EndLotteryCornerComputerEffect`, `BufferLottoTicketNumber`
    - Décomp : `src/lottery_corner.c` ~500 lignes
    - Estimation : ~3 jours

11. **Mauville Old Man** — bard/storyteller/giddy/hipster/trader (5 sub-systems)
    - Specials : `Script_GetCurrentMauvilleMan`, `PlayBardSong`, `SaveBardSongLyrics`, `HasBardSongBeenChanged`, `GenerateGiddyLine`, `GiddyShouldTellAnotherTale`, `TraderDoDecorationTrade`, `TraderMenuGetDecoration`, `TraderShowDecorationMenu`, `GetTraderTradedFlag`, `Script_StorytellerDisplayStory`, `Script_StorytellerInitializeRandomStat`, `StorytellerGetFreeStorySlot`, `StorytellerStoryListMenu`, `StorytellerUpdateStat`, `HasStorytellerAlreadyRecorded`, `HasHipsterTaughtWord`, `SetHipsterTaughtWord`, `HipsterTryTeachWord`, `IsTrendyPhraseBoring`, `BufferTrendyPhraseString`, `BufferDeepLinkPhrase`, `SetMauvilleOldManObjEventGfx`
    - Décomp : `src/mauville_old_man.c` 2500 lignes
    - Estimation : ~2 semaines

12. **Slot machine** — scene dédiée
    - Specials : (= via opcode `playslotmachine`)
    - Décomp : `src/slot_machine.c` 2500 lignes
    - Estimation : ~2 semaines

13. **Roulette** — scene dédiée
    - Specials : `PlayRoulette`
    - Décomp : `src/roulette.c` 2000 lignes
    - Estimation : ~1.5 semaines

14. **Berry Blender** — multi-player minigame
    - Specials : `DoBerryBlending`, `ShowBerryBlenderRecordWindow`, `TryBerryBlenderLinkup`
    - Décomp : `src/berry_blender.c` 3000 lignes
    - Estimation : ~2 semaines

15. **Pokemon Jump / Dodrio Berry Picking / Berry Crush** — minigames link
    - Specials : `IsPokemonJumpSpeciesInParty`, `ShowPokemonJumpRecords`, `ShowBerryCrushRankings`, `ShowDodrioBerryPickingRecords`, `IsDodrioInParty`, `TryBattleLinkup`, `TryRecordMixLinkup`, `TryTradeLinkup`, `TryContestEModeLinkup`, `TryContestGModeLinkup`, `TryJoinLinkGroup`, `TryBecomeLinkLeader`, `InitUnionRoom`, `LinkContestWaitForConnection`, `LinkContestTryShowWirelessIndicator`, `LinkContestTryHideWirelessIndicator`, `SpawnLinkPartnerObjectEvent`, `Script_ResetUnionRoomTrade`, `Script_StartWiredTrade`, `BattleTowerReconnectLink`, `LinkRetireStatusWithBattleTowerPartner`, `SaveForBattleTowerLink`, `SetBattleTowerLinkPlayerGfx`, `ReturnFromLinkRoom`, `CleanupLinkRoomState`, `ExitLinkRoom`, `Script_ShowLinkTrainerCard`, `ShowWirelessCommunicationScreen`, `GetWirelessCommType`, `GetLinkPartnerNames`
    - Décomp : `src/pokemon_jump.c` 2000 + `src/dodrio_berry_picking.c` 2500 + `src/berry_crush.c` 2200
    - Estimation : ~3 semaines pour les 3

16. **Pokeblock** — flavor + nature interaction
    - Specials : `OpenPokeblockCaseForContestLady`, `OpenPokeblockCaseOnFeeder`, `GetPokeblockFeederInFront`, `GetPokeblockNameByMonNature`
    - Décomp : `src/pokeblock.c` 1500 lignes + `src/pokeblock_feed.c` 1200 lignes
    - Estimation : ~1.5 semaines

17. **Easy Chat screen** — phrase composition
    - Specials : `ShowEasyChatScreen`, `ShowEasyChatProfile`, `ValidateMixingGameLanguage`
    - Décomp : `src/easy_chat.c` 2200 lignes
    - Estimation : ~2 semaines

18. **Quiz lady / Favor lady** — Lilycove ladies
    - Specials : `GetQuizLadyState`, `SetQuizLadyState_*`, `QuizLadyGetPlayerAnswer`, `QuizLadyPickNewQuestion`, `QuizLadyRecordCustomQuizData`, `QuizLadySetCustomQuestion`, `QuizLadySetWaitingForChallenger`, `IsQuizLadyWaitingForChallenger`, `QuizLadyShowQuizQuestion`, `QuizLadyTakePrizeForCustomQuiz`, `BufferQuizAuthorNameAndCheckIfLady`, `BufferQuizCorrectAnswer`, `BufferQuizPrizeItem`, `BufferQuizPrizeName`, `GetQuizAuthor`, `IsQuizAnswerCorrect`, `ClearQuizLadyPlayerAnswer`, `ClearQuizLadyQuestionAndAnswer`, `Script_QuizLadyOpenBagMenu`, `DidFavorLadyLikeItem`, `IsFavorLadyThresholdMet`, `HasAnotherPlayerGivenFavorLadyItem`, `BufferFavorLadyItemName`, `BufferFavorLadyPlayerName`, `FavorLadyGetPrize`, `Script_DoesFavorLadyLikeItem`, `Script_FavorLadyOpenBagMenu`, `GetFavorLadyState`, `SetFavorLadyState_Complete`, `SetLilycoveLadyGfx`, `Script_GetLilycoveLadyId`
    - Décomp : `src/lilycove_lady.c` 1800 lignes
    - Estimation : ~1.5 semaines

19. **Match Call rematch logic** — Pokenav rematch
    - Specials : `SetMatchCallRegisteredFlag`, etc.
    - Décomp : `src/match_call.c` 1500 lignes
    - Estimation : ~1 semaine

20. **Misc post-game features**
    - Mirage Tower (`StartMirageTowerDisintegration`, etc.) ~500 lignes
    - Cycling Road challenge ~300 lignes
    - Glass Workshop (`ShowGlassWorkshopMenu`) ~400 lignes
    - Berry Powder vendor (`DisplayBerryPowderVendorMenu`, etc.) ~300 lignes
    - Hall of Fame PC (`AccessHallOfFamePC`) ~600 lignes
    - Department Store elevator ~200 lignes
    - SS Tidal (`ScriptMenu_CreateLilycoveSSTidalMultichoice`, etc.) ~300 lignes
    - Cable Car (`CableCar`, `CableCarWarp`) ~400 lignes
    - Region Map (`FieldShowRegionMap`) ~600 lignes
    - Safari Zone (`EnterSafariMode`, `ExitSafariMode`) ~500 lignes
    - Rock Smash wild encounter (`RockSmashWildEncounter`) ~100 lignes
    - Mass Outbreaks (`UpdateShoalTideFlag`, `SetRoute119Weather`, `SetRoute123Weather`, `CreateAbnormalWeatherEvent`, `GetAbnormalWeatherMapNameAndType`) ~300 lignes
    - Mystery Gift / Wonder Card (`ValidateSavedWonderCard`, `WonderNews_GetRewardInfo`, etc.) ~1000 lignes
    - E-Reader (`ValidateEReaderTrainer`, `CopyEReaderTrainerGreeting`, `SetEReaderTrainerGfxId`) ~500 lignes
    - Mystery Event (`SetMysteryEventScriptStatus`) ~300 lignes
    - Mauville Gym puzzle (`MauvilleGymDeactivatePuzzle`, `MauvilleGymSetDefaultBarriers`) ~200 lignes
    - Sootopolis ice metatiles (`SetSootopolisGymCrackedIceMetatiles`) ~150 lignes
    - Mirage Island generation (`IsMirageIslandPresent`) ~50 lignes
    - Trick House nugget (`ResetTrickHouseNuggetFlag`, `SetTrickHouseNuggetFlag`) ~50 lignes
    - Eon Ticket (`ShouldDistributeEonTicket`) ~100 lignes
    - Pacifidlog TM (`GetDaysUntilPacifidlogTMAvailable`, `SetPacifidlogTMReceivedDay`) ~100 lignes
    - Sealed Chamber / Regis braille (`ShouldDoBrailleRegicePuzzle`, `ShouldDoBrailleRegirockEffectOld`, `closebraillemessage`) ~200 lignes + braille font asset
    - Cyclage Road challenge (`UpdateCyclingRoadState`, `FinishCyclingRoadChallenge`, `GetRecordedCyclingRoadResults`) ~300 lignes
    - Pyramid bag (`TryStoreHeldItemsInPyramidBag`, `ChooseItemsToTossFromPyramidBag`) ~400 lignes
    - Deoxys (`SetDeoxysRockPalette`, `DoDeoxysRockInteraction`) ~200 lignes
    - Mew (`SetMewAboveGrass`, `DestroyMewEmergingGrassSprite`, `LoopWingFlapSE`) ~150 lignes
    - Latias/Latios (`BattleSetup_StartLatiBattle`) ~50 lignes
    - Groudon/Kyogre (`StartGroudonKyogreBattle`, `StartDroughtWeatherBlend`) ~100 lignes
    - Regi battle (`StartRegiBattle`) ~50 lignes
    - Mirage Tower (`DoMirageTowerCeilingCrumble`, `StartMirageTowerShake`, `StartMirageTowerFossilFallAndSink`, `StartPlayerDescendMirageTower`, `SetMirageTowerVisibility`) ~600 lignes
    - Move Deleter (`MoveDeleterChooseMoveToForget`, `MoveDeleterForgetMove`) ~200 lignes
    - Move Tutor / Relearner (`ChooseMonForMoveRelearner`, `ChooseMonForMoveTutor`, `TeachMoveRelearnerMove`, `BufferBattleFrontierTutorMoveName`, `GetBattleFrontierTutorMoveIndex`, `CloseBattleFrontierTutorWindow`) ~500 lignes
    - Soft reset (`DoSoftReset`, `SetCB2WhiteOut`, `SetChampionSaveWarp`, `TryFieldPoisonWhiteOut`) ~150 lignes
    - Daycare/Mom (`CheckPlayerHasSecretBase`, `GetMomOrDadStringForTVMessage`, `CountPartyAliveNonEggMons*`, `CountPartyNonEggMons`) ~150 lignes
    - IV Rater (`BufferVarsForIVRater`) ~100 lignes
    - Dewford trends (`SetHipsterTaughtWord`, `HipsterTryTeachWord`, etc.) — déjà comptés dans Mauville Old Man
    - Frontier Maniac/Gambler messages (`ShowFrontierGamblerGoMessage`, `ShowFrontierGamblerLookingMessage`, `ShowFrontierManiacMessage`) ~100 lignes
    - Nature Girl (`ShowNatureGirlMessage`) ~50 lignes
    - Pokedex Rating (`ShowPokedexRatingMessage`) ~100 lignes
    - Berry interactions (`ObjectEventInteractionGetBerryCountString`, `ObjectEventInteractionGetBerryTreeData`, `ObjectEventInteractionPickBerryTree`, `ObjectEventInteractionPlantBerryTree`, `ObjectEventInteractionRemoveBerryTree`, `ObjectEventInteractionWaterBerryTree`, `DoWateringBerryTreeAnim`) ~400 lignes
    - Abandoned Ship keys (`FoundAbandonedShipRoom1Key`, etc.) ~100 lignes
    - Lead mon checks (`CheckLeadMonBeauty`, `CheckLeadMonCool`, `CheckLeadMonCute`, `CheckLeadMonSmart`, `CheckLeadMonTough`, `LeadMonHasEffortRibbon`, `GiveLeadMonEffortRibbon`, `IsLeadMonNicknamedOrNotEnglish`, `IsMonOTIDNotPlayers`, `MonOTNameNotPlayer`) ~200 lignes (= party operations OK seuls)
    - Trainer flags (`GetTrainerFlag`, `GetTrainerBattleMode`, `OffsetCameraForBattle`) ~100 lignes
    - Player utilities (`GetPlayerTrainerIdOnesDigit`, `LoadPlayerBag`, `PlayerPC`, `Overworld_PlaySpecialMapMusic`, `Script_FadeOutMapMusic`, `StopMapMusic`, `SaveGame`, `CableClubSaveGame`) — quelques-uns sont 5-20 lignes triviaux, à wire au cas par cas
    - Estimation : ~5-8 semaines pour le total

**Total estimé tier 🔴 : ~6 MOIS de dev focus**.

---

## Priorisation recommandée

1. **Phase 1 battle script interpreter** (= bloque 30% des 🔴) — FIRST
2. **Tier 🟡 quick wins** (~10-13h) — pendant breaks ou en parallèle
3. **Pokemon Storage System UI** (= post-Phase 1, important pour mid-game PC access)
4. **Daycare** (= mid-game Route 117)
5. **Mauville Old Man + Lottery + TV shows** (= mid-game Hoenn)
6. **Contests** (= mid-game Lilycove)
7. **Secret Base** (= mid-game post-Secret Power TM)
8. **Battle Frontier complet** (= post-E4, LAST priority)
9. Minigames, Easy Chat, Match Call : opportunistic / post-MVP

---

## Notes

- Tous les opcodes sont **registered en 1:1 décomp** → aucun script ne crashera
- VAR_RESULT = 0 par défaut pour les specials stubs → scripts qui `goto_if_eq VAR_RESULT, TRUE, X` prendront le path FALSE par défaut → game flow continue gracieusement
- Quand on implémente un sous-système (= ex: Mauville Old Man), on remplace les `() => 0` par les vraies impls dans `specials-registry.ts`
- L'opcode registry lui-même n'a PAS besoin d'être touché lors de l'impl d'un sous-système (= juste registerSpecial avec le real handler)

**Bottom line** : on a un système opcode complet et 1:1 décomp aujourd'hui. Le reste, c'est porter les sous-systèmes du jeu (= ce qui ferait 50%+ du codebase Emerald complet). Long mais structuré.
