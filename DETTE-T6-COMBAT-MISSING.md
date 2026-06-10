# T6 — Fonctions .c COMBAT manquantes : classification exhaustive (dette explicite)

> Contrat du goal : « porter 1:1 **ou dette explicite** ». Ce document classe
> CHAQUE fonction listée `missing` par l'audit ULTRACODE
> (`AUDIT-GAME-VS-DECOMP-2026-06.md`, run wf_589021c5) pour les fichiers
> COMBAT, avec sa disposition. Mis à jour 2026-06-10 (post-tranches goal).
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
- 📋 `HandleMoveSwitching` (réarrangement des moves au menu, L=A+SELECT) — fonctionnalité réelle absente. PRIORITÉ MOYENNE.
- 📋 `PlayerDoMoveAnimation`/`DoSwitchOutAnimation`/`FreeMonSpriteAfterSwitchOutAnim`/`CompleteOnFinishedBattleAnimation` — les équivalents comportementaux existent (switch/faint/anim validés A/B) ; noms-miroir manquants. BASSE.
- 📋 `PlayerHandleYesNoInput` — la yes/no controller (≠ la yes/no script, portée T1). MOYENNE (utilisée par learn-move prompt — qui marche via un autre chemin aujourd'hui).
- 📋 `Intro_*` (3) + `SwitchIn_*` (3) — la séquence intro/switch-in joueur marche (A/B) via les wires existants ; noms-miroir manquants. BASSE.
- 📋 `CompleteOnBankSpritePosX_0`, `CompleteOnBattlerSpriteCallbackDummy`, `CompleteOnBankSpriteCallbackDummy2`, `FreeTrainerSpriteAfterSlide`, `Task_PlayerController_RestoreBgmAfterCry`, `CompleteOnInactiveTextPrinter` — petits waiters ; équivalents en place. BASSE.
- 🔗 `SetLinkBattleEndCallbacks` ; ✅-équiv `SetBattleEndCallbacks` (le savedCallback retour OW, battle-decomp-loop).

## battle_controller_opponent (13)
- ✅-équiv : `Intro_*`/`SwitchIn_*` (6) — la séquence adverse complète marche (A/B send-out/switch/shiny différé) ; noms-miroir manquants. BASSE.
- 📋 `TryShinyAnimAfterMonAnim` — l'anim shiny = chantier dédié (jamais portée). MOYENNE.
- 📋 `GetOpponentMonData`/`OpponentDoMoveAnimation`/`DoSwitchOutAnimation`/`FreeMonSpriteAfterSwitchOutAnim`/`CompleteOnFinishedBattleAnimation` — équivalents en place. BASSE.

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
- 📋 `TryHandleLaunchBattleTableAnimation` + `Task_ClearBitWhenBattleTableAnimDone` + `ShouldAnimBeDoneRegardlessOfSubstitute` — les anims GENERAL par table (statuts : poison/para/sommeil visuels). **PRIORITÉ HAUTE** (les anims de statut sont visibles en combat) — chantier anims (avec les 415 moves).
- 📋 `InitAndLaunchChosenStatusAnimation` — idem statuts. HAUTE (même chantier).
- 📋 `SpriteCB_WaitForBattlerBallReleaseAnim`, `SpriteCB_TrainerSlideIn`, `SpriteCB_TrainerSlideVertical`, `IsMoveWithoutAnimation`, `ShouldPlayNormalMonCry`, `BattleLoadAllHealthBoxesGfx`, `ClearSpritesBattlerHealthboxAnimData`, `Task_ClearBitWhenSpecialAnimDone` — équivalents/petits. BASSE.

## battle_anim_mons (111)
- ✅ +3 portées ce commit : `TrySetSpriteRotScale`, `ResetSpriteRotScale_PreserveAffine`, `SetBattlerSpriteYOffsetFromRotation` (complètent la famille rot/scale réparée).
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
- 📋 `DoHitAnimHealthboxEffect` + `SpriteCB_HitAnimHealthoxEffect` — le shake healthbox au hit. MOYENNE (visuel combat).
- 📋 `DestroySpriteAndFreeResources_Ball` — utilisé par les chemins ball morts/trade. BASSE.

## Synthèse priorisée du backlog réel (hors équivalents/morts/hors-scope)
1. **HAUTE** : anims de STATUT (TryHandleLaunchBattleTableAnimation + InitAndLaunchChosenStatusAnimation + la table B_ANIM general) — préalable léger du chantier anims de move.
2. **MOYENNE** : TryShinyAnimAfterMonAnim (shiny), HandleMoveSwitching (réarrangement moves), DoHitAnimHealthboxEffect (shake hit), PlayerHandleYesNoInput.
3. **BASSE** : les renames-miroir des équivalents fonctionnels (~40 noms) — à faire mécaniquement avec la dépose des shims (T4b).
4. **CHANTIER DÉDIÉ** : battle_anim_mons 108 helpers + les 415 scripts d'anims de move + la régénération du bytecode anim (tables Special/General incluses).
