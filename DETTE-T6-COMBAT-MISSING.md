# T6 — Fonctions .c COMBAT manquantes : classification exhaustive (dette explicite)

> Contrat du goal : « porter 1:1 **ou dette explicite** ». Ce document classe
> CHAQUE fonction listée `missing` par l'audit ULTRACODE
> (`AUDIT-GAME-VS-DECOMP-2026-06.md`, run wf_589021c5) pour les fichiers
> COMBAT, avec sa disposition. Mis à jour 2026-06-11 (CLÔTURE goal 8 tranches).
> Catégories : ✅ PORTÉ-DEPUIS (comblé par les tranches de cette session) ·
> ☠️ MORT (UNUSED décomp / code mort prouvé) · 🔗 LINK/MULTI (hors-scope
> single offline) · 🎪 PALACE/SAFARI/CONTEST/TRADE (hors-scope démo) ·
> 🐛 DEBUG (fonctions Debug_* décomp) · 📋 À-PORTER (le vrai backlog, priorisé).

## battle_main (14)
- ✅ `BattleTurnPassed` — porté (`_BattleTurnPassed` + wire bytecode, documenté).
- ✅ `IsRunningFromBattleImpossible` — vit dans try-run-from-battle.ts (wire) ; re-export nominal = cosmétique.
- 📋 `RunBattleScriptCommands` (battle_main.c:5266) — le stepper réel = script-interpreter.ts (équivalent structurel) ; le nom-miroir manque. PRIORITÉ BASSE (plomberie nominale).
- 🔗 `CB2_InitEndLinkBattle`, `CB2_EndLinkBattle`, `EndLinkBattleInSteps`, `CB2_InitAskRecordBattle`, `CB2_AskRecordBattle`, `AskRecordBattle`, `SetMultiPartnerMenuParty` (7).
- ☠️ `SpriteCB_InitFlicker`, `SetIdleSpriteCallback`, `BattleIntroSkipRecordMonsToDex`, `BattleIntroSwitchInPlayerMons` (4, UNUSED décomp).

## battle_controller_player (30)
- ✅ `CompleteWhenChoseItem` (T2 sac : `_CompleteWhenChoseItem`), `CompleteOnSpecialAnimDone` (T-capture), `CB2_SetUpReshowBattleScreenAfterMenu(/2)` (reshow-battle-screen.ts, wire validé switch+sac).
- ✅ partiel : `Task_GiveExpToMon`/`Task_PrepareToGiveExpWithExpBar`/`Task_GiveExpWithExpBar`/`Task_LaunchLvlUpAnim`/`Task_UpdateLvlInHealthbox`/`DestroyExpTaskAndCompleteOnInactiveTextPrinter` — le flux EXP/level-up voie L FONCTIONNE (A/B KO-runs : EXP donnée, level-up, learn-move) via l'implémentation exp existante ; le nom-miroir des 6 tasks manque. 📋 PRIORITÉ BASSE (renames).
- ✅ `HandleMoveSwitching` — PORTÉ 1:1 (2026-06-11, T5) : SELECT→mode switch, swap bufferA moves/pp/ppBonuses 2-bits + gBattleMons + party mon, A/B validé (swap 0↔3).
- ✅ `PlayerDoMoveAnimation` — PORTÉ 1:1 (2026-06-11, T4) : state machine PlayerHandleMoveAnimation cases 0-3 (substitute-skip → DoMoveAnim → tick → ExecCompleted).
- 📋 `DoSwitchOutAnimation`/`FreeMonSpriteAfterSwitchOutAnim`/`CompleteOnFinishedBattleAnimation` — équivalents comportementaux en place (switch/faint validés A/B) ; noms-miroir manquants. BASSE.
- ✅ `PlayerHandleYesNoInput` + `PlayerHandleYesNoBox` — PORTÉS 1:1 (2026-06-11, T5) : curseur défaut NON, A→emit 14/13, B→clear ; + helper réutilisable `runBattleYesNoMachine(stateIdx)` (suggestion user) dans battle-script-commands.
- 📋 `Intro_*` (3) + `SwitchIn_*` (3) — la séquence intro/switch-in joueur marche (A/B) via les wires existants ; noms-miroir manquants. BASSE.
- 📋 `CompleteOnBankSpritePosX_0`, `CompleteOnBattlerSpriteCallbackDummy`, `CompleteOnBankSpriteCallbackDummy2`, `FreeTrainerSpriteAfterSlide`, `Task_PlayerController_RestoreBgmAfterCry`, `CompleteOnInactiveTextPrinter` — petits waiters ; équivalents en place. BASSE.
- 🔗 `SetLinkBattleEndCallbacks` ; ✅-équiv `SetBattleEndCallbacks` (le savedCallback retour OW, battle-decomp-loop).

## battle_controller_opponent (13)
- ✅-équiv : `Intro_*`/`SwitchIn_*` (6) — la séquence adverse complète marche (A/B send-out/switch/shiny différé) ; noms-miroir manquants. BASSE.
- ✅ `TryShinyAnimAfterMonAnim` — net-effect PORTÉ (2026-06-11, T5) : TryShinyAnimation 1:1 (battle_anim_throw.c:2228, GET_SHINY_VALUE) + Task_ShinyStars ×2 (encircle Sin/Cos r24 + diagonal + SE) + palette shiny.pal du mon (GetMonSpritePalFromSpeciesAndPersonality payé) + câblage à l'APPARITION (_BattleAnimateFrontSprite). A/B : Grahyena DORÉ + étoiles, screenshot.
- ✅ `OpponentDoMoveAnimation` — PORTÉ 1:1 (2026-06-11, T4, même machine que player).
- 📋 `GetOpponentMonData`/`DoSwitchOutAnimation`/`FreeMonSpriteAfterSwitchOutAnim`/`CompleteOnFinishedBattleAnimation` — équivalents en place. BASSE.

## battle_interface (18)
- 🎪 `CreateSafariPlayerHealthboxSprites`, `PrintSafariMonInfo`, `UpdateSafariBallsTextOnHealthbox`, `UpdateLeftNoOfBallsTextOnHealthbox` (4, Safari).
- 🐛 `Debug_DrawNumber`, `Debug_DrawNumberPair`, `Debug_TestHealthBar`, `Debug_TestHealthBar_Helper`, `DummiedOutFunction`, `DummyBattleInterfaceFunc` (6).
- 📋 `UpdateHpTextInHealthboxInDoubles`, `SwapHpBarsWithHpText` (doubles/affichage HP texte) — DOUBLES hors-scope actuel. BASSE.
- 📋 `GetHealthboxElementGfxPtr`, `UpdateSpritePos`, `GetStatusIconForBattlerId`, `FillHealthboxObject`, `RemoveWindowOnHealthbox`, `SafariTextIntoHealthboxObject` — helpers internes ; la healthbox complète marche via les impl actuelles. BASSE.

## battle_gfx_sfx_util (21)
- ✅ `InitAndLaunchSpecialAnimation` — équivalent porté T-capture (`Special_BallThrow_TS` + SetAnimBattlers ; la généralisation table Special = avec le chantier anims).
- ✅-équiv `BattleStopLowHpSound`/`HandleLowHpMusicChange`/`HandleBattleLowHpMusicChange` — le low-HP beep existe côté audio ; noms-miroir manquants. BASSE.
- 🎪 `ChooseMoveAndTargetInBattlePalace`, `GetBattlePalaceMoveGroup`, `GetBattlePalaceTarget` (3, Palace).
- ☠️ `BattleGfxSfxDummy2/3` (2).
- ✅ `TryHandleLaunchBattleTableAnimation` — PORTÉ 1:1 (2026-06-11, T3) : statuts bout-en-bout (poison/para/sommeil/brûlure/gel via la table General + bytecode), A/B poison visible.
- ✅ `InitAndLaunchChosenStatusAnimation` — PORTÉ 1:1 (2026-06-11, T3, même tranche).
- 📋 `SpriteCB_WaitForBattlerBallReleaseAnim`, `SpriteCB_TrainerSlideIn`, `SpriteCB_TrainerSlideVertical`, `IsMoveWithoutAnimation`, `ShouldPlayNormalMonCry`, `BattleLoadAllHealthBoxesGfx`, `ClearSpritesBattlerHealthboxAnimData`, `Task_ClearBitWhenSpecialAnimDone` — équivalents/petits. BASSE.

## battle_anim_mons (111)
- ✅ +3 portées (2026-06-10) : `TrySetSpriteRotScale`, `ResetSpriteRotScale_PreserveAffine`, `SetBattlerSpriteYOffsetFromRotation` (famille rot/scale).
- ✅ VAGUE Translate* COMMENCÉE (2026-06-11, T4) : `TranslateAnimSpriteToTargetMonLocation` + `StartAnimLinearTranslation` + `InitAnimLinearTranslation` + `AnimTranslateLinear`(+`_WithFollowup`) — LE projectile générique 1:1 (fixed-point bits de signe), dans battle_anim_fire.ts (à re-ranger dans battle_anim_mons.ts à la prochaine vague). + mouvements (battle_anim_mon_movement.ts) : `AnimTask_ShakeMon`/`ShakeMon2`, `DoHorizontalLunge`, `SlideMonToOffset`, `SlideMonToOriginalPos`, `TranslateSpriteLinearById`(+FixedPoint), `InitSpriteDataForLinearTranslation`.
- 📋 Le reste (~108) = la BOÎTE À OUTILS du système d'anims de move (Translate*/
  InitSpritePos*/GetBattleAnimBg*/AnimLoad*) — consommée par les 415 scripts
  d'anim de move (0 porté). **C'est LE chantier « anims de move » déjà identifié**
  (bytecode anim partiel + createsprite/createvisualtask à résoudre). Porter ces
  111 helpers AVANT le chantier = prématuré (zéro consommateur). Disposition :
  à porter PAR VAGUES avec le chantier anims de move, en commençant par les
  Translate* (les plus consommés par les scripts).

## battle_intro (1)
- ☠️ `DrawBattlerOnBgDMA` (UNUSED décomp).

## pokeball (25)
- ☠️ `SpriteCB_BallThrow` → `SpriteCB_BallThrow_CaptureMon` (10) — **code mort
  décomp PROUVÉ** (« These do not seem to get run », pokeball.c:~423 ; la vraie
  capture = battle_anim_throw.c, portée et validée outcome 7).
- ✅-équiv `AnimateBallOpenParticlesForPokeball`/`LaunchBallFadeMonTaskForPokeball` — wrappers vers les versions battle_anim_throw (portées, pokeball-effects).
- 🎪 `CreateTradePokeballSprite` + `SpriteCB_TradePokeball*` (4, échange/trade hors-scope).
- 📋 `CreatePokeballSpriteToReleaseMon` + `SpriteCB_PokeballReleaseMon` + `SpriteCB_ReleasedMonFlyOut` — le release HORS combat (donner un mon au PC/évolution). BASSE.
- 📋 `StartHealthboxSlideIn` + `SpriteCB_HealthboxSlideIn(Delayed)` — le slide-in healthbox EXISTE (A/B intro validée) via l'impl healthbox-l ; noms-miroir manquants. BASSE.
- ✅ `DoHitAnimHealthboxEffect` + `SpriteCB_HitAnimHealthoxEffect` — PORTÉS 1:1 (2026-06-11, T5, typo décomp conservée) : y2 ±1 alterné 21 frames sur la healthbox, câblé PlayerHandleHitAnimation. A/B validé.
- 📋 `DestroySpriteAndFreeResources_Ball` — utilisé par les chemins ball morts/trade. BASSE.

## Synthèse priorisée du backlog réel — MISE À JOUR FINALE GOAL (2026-06-11)
**FAIT par les tranches du goal (commits + A/B harness + screenshots)** :
- ~~HAUTE : anims de STATUT~~ ✅ T3 (bout-en-bout, poison visible).
- ~~MOYENNE : TryShinyAnimAfterMonAnim / HandleMoveSwitching / DoHitAnimHealthboxEffect / PlayerHandleYesNoInput~~ ✅ T5 4/4 (+ helper yes/no réutilisable).
- Shims re-export engine/battle→src/game : **9/9 réels déposés** (le « 13 » du plan = estimation ; l'inventaire réel = 9, dont 4 sans importeurs supprimés directs + redirections).
- Renames-miroir tombés EN VRAI (pas des alias) : PlayerDoMoveAnimation, OpponentDoMoveAnimation, PlayerHandlePlayFanfareOrBGM (réel, plus stub), PlayerHandleStatusAnimation, OpponentHandleStatusAnimation, TryShinyAnimation, Task_ShinyStars(+_Wait), DoHitAnimHealthboxEffect, SpriteCB_HitAnimHealthoxEffect, HandleMoveSwitching, PlayerHandleYesNoBox/Input, AnimSpriteOnMonPos (Scratch), AnimRoarNoiseLine(+_Step), SoundTask_PlayDoubleCry, SoundTask_WaitForCry, AnimHitSplatBasic, AnimAbsorptionOrb, TranslateAnimSpriteToTargetMonLocation, StartAnimLinearTranslation, InitAnimLinearTranslation, AnimTranslateLinear(+_WithFollowup), AnimTask_ShakeMon(2), DoHorizontalLunge, SlideMonToOffset/OriginalPos, TranslateSpriteLinearById(+FixedPoint), InitSpriteDataForLinearTranslation (~30 noms).

**DETTE RÉSIDUELLE explicite (par ordre de valeur)** :
1. **Renames nominaux restants (~15, BASSE — équivalents fonctionnels validés A/B)** : RunBattleScriptCommands (stepper=script-interpreter), les 6 Task_GiveExp* (flux EXP marche, barre+SE fixés 2026-06-11), Intro_*/SwitchIn_* (12 wires), DoSwitchOutAnimation ×2, FreeMonSpriteAfterSwitchOutAnim ×2, petits CompleteOn*/waiters, StartHealthboxSlideIn, BattleStopLowHpSound/HandleLowHpMusicChange, helpers internes battle_interface (FillHealthboxObject…).
2. **CHANTIER anims de move (vagues suivantes)** : ~103 helpers battle_anim_mons restants + templates/callbacks des ~409 moves non-portés (6 faits : Tackle/Growl/Scratch/Ember/Bubble/Absorb). Fallback ACTUEL documenté : move sans template registry = terminaison propre warn-once (le script/SE joue, le sprite visuel est sauté). Pattern industrialisé : png→4bpp byte-exact → targetTileBase FIXE zone haute (704-1008 occupés) → template registry → callback 1:1.
3. **T7 (clause goal « sinon dette re-documentée » ACTIVÉE)** : DoNamingScreen (renommage du mon capturé — auto-NO documenté) + CB2_DisplayDexInfo (écran dex post-capture) — nécessitent le backbone naming-screen/pokédex complet, hors-périmètre combat pur.
4. **Dettes douces visuelles tracées** : offset Y du hitsplat (Y_PIC_OFFSET), oscillation flare Ember, trajectoire sinusoïdale Bubble, mini-étoiles shiny en OAM 16x16 (8x8 décomp), SE_SHINY id à vérifier (255 supposé), pixels corrompus haut du mon shiny pendant son anim 2-frames (bug user EN STOCK, non diagnostiqué).
5. **Hors-scope goal (inchangé)** : link/multi (8), Palace/Safari/Contest/Trade (11), Debug (6), morts décomp (17), doubles (2).

