# Audit 1:1 — Domaine BATTLE (INVENTAIRE, chantier combat EN PAUSE)

> Audit READ-ONLY. Le combat est un chantier EN PAUSE : ce rapport est un **inventaire d'écart**
> (quoi existe / quoi manque / où), PAS une liste de fixes urgents.
> Méthode : extraction des noms de fonctions de chaque `.c` décomp, croisement avec le `.ts` homonyme,
> puis Grep repo ENTIER pour les « manquantes » (détecter les consolidations N:1).
> « in-homonym » = présent dans le fichier de même basename. « ailleurs » = trouvé dans un autre fichier.
> Décomp = `D:/Projet 1/decomps/pokeemeraude/src` · Nous = `D:/Projet 1/pokemon-web-demo/src`.

## ⚠️ Corrections d'affirmations mémoire (vérifiées)
- **« ~50 sites `__sprite` restants dans battle_anim_* »** → **STALE / FAUX aujourd'hui.** Il y a **0 accès live au shim `__sprite`** dans les fichiers battle_anim (`grep '__sprite\.'` = 0 match). Le shim `globalThis.__sprite` n'est **plus défini nulle part**. Les 31 occurrences du token `__sprite` restantes dans src/ sont (a) des **commentaires historiques** (`ex-__sprite`, notes de migration 2026-06-30) et (b) deux globals DIFFÉRENTS toujours vivants : `__spriteResetCallbacks` et `__spriteAnimation`. La migration anim→import direct `sprite.ts` est **de fait terminée**. Détail §Sites __sprite.
- **« famille battle_message 1:1 COMPLÈTE »** → **quasi vrai** pour le moteur de strings, mais **`ChooseMoveUsedParticle` est ABSENT** (0 match repo) et `BattlePutTextOnWindow` / `GetCurrentPpToMaxPpState` / `SetPpNumbersPaletteInMoveSelection` vivent ailleurs (controllers/bg). Voir §battle_message.
- **« battle_setup 53 fns »** → notre `battle_setup.ts` couvre 68/102 fns décomp, MAIS le flux **wild/transition/CB2** est consolidé dans `engine/battle/battle-setup-helpers.ts` + `battle-decomp-loop.ts` (harness). Gaps réels : legendary/roamer/safari/wally-tutorial + `GetSpecialBattleTransition` + `PlayTrainerEncounterMusic` + `GetTrainerWonSpeech`. Voir §battle_setup.
- **« sac/capture/combat jouable »** → le **send-out** ball (pokeball.c) est porté 1:1, mais la **chaîne throw de CAPTURE** (`SpriteCB_BallThrow_*`) est **ABSENTE** de tout le repo (déférée par design). La capture jouable passe par une glue, pas par le miroir pokeball.c. Voir §pokeball.

---

## FAMILLE CŒUR (fichiers vivants — audit approfondi)

## battle_main.c → battle_main.ts
Statut : ✅ MIROIR (quasi complet)
Fonctions : 103/105 in-homonym.
Manquantes : `SetIdleSpriteCallback`, `SpriteCB_InitFlicker` (2 helpers sprite mineurs — à grep en reprise, probablement inline ailleurs).
Notes : 5270 l. décomp → miroir dense. Les `BtlController_Emit*` référencés depuis ici pointent vers `battle_controllers.ts`. Fichier fiable.

## battle_util.c → battle_util.ts
Statut : 🟡 PARTIEL (haut)
Fonctions : 44/51 in-homonym.
Manquantes : `HandleAction_WatchesCarefully` (Safari), `PressurePPLoseOnUsingImprison`, `PressurePPLoseOnUsingPerishSong`, `ResetSentPokesToOpponentValue`, `UpdateSentPokesToOpponentValue`, `TryClearRageStatuses`, `TrySetCantSelectMoveBattleScript`.
Notes : les `SentPokesToOpponent` touchent le **suivi « combien de mons le joueur a vu »** (utilisé par certains messages/EXP-share) — impact solo réel, à porter. `HandleAction_WatchesCarefully` = Safari (voir safari). PP-loss Imprison/PerishSong = mécaniques de combat manquantes.

## battle_util2.c → (consolidé, pas de homonyme)
Statut : ✅ MIROIR (ailleurs)
Fonctions : 5/5, **toutes ailleurs** : `AdjustFriendshipOnBattleFaint`→battle_script_commands.ts · `AllocateBattleResources`→battle_main.ts + engine/battle/battle-sprites-data.ts · `FreeBattleResources`→battle_main.ts + engine/battle/battle-link-end.ts · `BattlePalace_TryEscapeStatus`→battle_script_commands.ts · `SwitchPartyOrderInGameMulti`→battle_main.ts.
Notes : petit fichier (215 l.) entièrement absorbé. RAS.

## battle_script_commands.c → battle_script_commands.ts
Statut : ✅ MIROIR (quasi complet)
Fonctions : 275/287 in-homonym (les 12 « manquantes » = surtout des Cmd_* variantes/helpers à re-grep ; noyau des 249 opcodes présent — cf. battle-coverage.md « Opcodes Cmd_* 249/249 »).
Notes : 10331 l. décomp, plus gros fichier du domaine. `Cmd_openpartyscreen` (10066), `Cmd_switchhandleorder` (10202), `Cmd_getswitchedmondata` (7392) présents. Fichier central du combat scripté, fiable.

## battle_setup.c → battle_setup.ts (+ engine/battle/battle-setup-helpers.ts, battle-decomp-loop.ts)
Statut : 🟡 PARTIEL (split mirror/harness)
Fonctions : 68/102 in-homonym ; part du reste **ailleurs** (helpers) :
- **battle_setup.ts** (miroir) : tout le cluster **trainer + rematch** (ConfigureTrainerBattle, TrainerBattleLoadArgs, gRematchTable, Get/Set/ClearTrainerFlag, rematch table complète, IsTrainerReadyForRematch…). Solide.
- **ailleurs (engine/battle/battle-setup-helpers.ts)** : `BattleSetup_StartScriptedWildBattle`, `SetUpBattleVarsAndBirchZigzagoon`, `CreateScriptedWildMon`, `StartFirstBattle`, `BattleSetup_StartTrainerBattle`, `BattleSetup_GetEnvironmentId`, `GetBattleTransitionTypeByMap`, `GetSumOfPlayer/EnemyPartyLevel`, `GetWildBattleTransition`, `GetTrainerBattleTransition`, `GetTrainerALoseText`, `CB2_EndScriptedWildBattle`, `CB2_StartFirstBattle`, `CB2_EndFirstBattle`.
- **ailleurs (battle-decomp-loop.ts / wild_encounter.ts)** : `BattleSetup_StartWildBattle`, `DoStandardWildBattle`, `Task_BattleStart`, `CreateBattleStartTask`, `CB2_EndWildBattle`.
Manquantes (**ABSENTES du repo entier**) : `BattleSetup_StartLegendaryBattle` + `StartLegendaryBattle` · `BattleSetup_StartRoamerBattle` + `StartRoamerBattle` · `BattleSetup_StartLatiBattle` · `StartGroudonKyogreBattle` · `StartRegiBattle` · `StartWallyTutorialBattle` · `DoSafariBattle` · `BattleSetup_StartBattlePikeWildBattle` / `DoBattlePikeWildBattle` / `DoBattlePyramidTrainerHillBattle` (frontier) · `GetSpecialBattleTransition` · `PlayTrainerEncounterMusic` · `GetTrainerWonSpeech` · `GetTrainerBLoseText` · `SetTrainerFacingDirection`.
Notes : combats sauvages/dresseurs standard **marchent en jeu** via le split mirror+harness. Les gaps = **combats spéciaux** (légendaires roamer/regi/groudon-kyogre, wally-tutorial, safari) → ces flux ne se lancent pas 1:1 aujourd'hui. `GetSpecialBattleTransition` + `PlayTrainerEncounterMusic` = 2 pièces réutilisées côté solo à porter.

## battle_message.c → battle_message.ts
Statut : ✅ MIROIR (moteur strings complet) · 🟡 pièces satellites
Fonctions : 6/10 in-homonym. Le **noyau expand/buffer est présent** : `BattleStringExpandPlaceholders`, `BattleStringExpandPlaceholdersToDisplayedString`, `BufferStringBattle`, `ExpandBattleTextBuffPlaceholders`, `ChooseTypeOfMoveUsedString`, `TryGetStatusString`. Tables STRINGID (381), STRINGID_NAMES, BATTLE_STRINGS_TABLE, B_TXT_NAME_TO_CODE complètes.
Ailleurs : `BattlePutTextOnWindow`→battle_controllers.ts (+ controllers/main) · `GetCurrentPpToMaxPpState`→battle_controller_player.ts · `SetPpNumbersPaletteInMoveSelection`→battle_bg.ts + controller_player.ts.
Manquantes (**ABSENTE**) : `ChooseMoveUsedParticle` (0 match — helper de sélection de particule pour le texte de move ; petit).
Notes : la réputation « 1:1 COMPLÈTE » tient pour l'affichage byte-level ; seul `ChooseMoveUsedParticle` manque vraiment.

## battle_controllers.c → battle_controllers.ts
Statut : 🟡 PARTIEL (noyau solo présent, link absent)
Fonctions : 42/68 in-homonym.
Manquantes — **cluster LINK/buffer (EXEMPT flux)** : `CreateTasksForSendRecvLinkBuffers`, `Task_HandleSendLinkBuffersData`, `Task_HandleCopyReceivedLinkBuffersData`, `TryReceiveLinkBattleData`, `HandleLinkBattleSetup` (ce dernier est un no-op dans battle-setup-helpers.ts).
Manquantes — **cluster `BtlController_Emit*`** : 21 emitters (EmitChooseAction, EmitChooseMove, EmitChooseItem, EmitSetRawMonData, EmitGetRawMonData, EmitSuccessBallThrowAnim, EmitPaletteFade, EmitDataTransfer, EmitDMA3Transfer, EmitCmd23/32, EmitPause, EmitPlayBGM, EmitStatusXor…). **Beaucoup vivent ailleurs** : `BtlController_EmitChooseAction`/`EmitChooseMove`→battle_main.ts · `EmitSetRawMonData`→battle_controller_opponent.ts. Mais `EmitSuccessBallThrowAnim` = **ABSENT** (lié à la capture, cf. pokeball).
Notes : le protocole controller solo fonctionne (les emitters critiques sont câblés via main/opponent). Le sous-système de **buffers link** est délibérément non porté (flux multi exempt).

## pokeball.c → pokeball.ts (+ engine/battle/battle-sendout-anim.ts harness)
Statut : 🟡 PARTIEL (send-out miroir, capture déférée)
Fonctions : 19/37 in-homonym.
**Porté 1:1 (send-out)** : `DoPokeballSendOutAnimation`, `Task_DoPokeballSendOutAnim`, `SpriteCB_PlayerMonSendOut_1/2`, `SpriteCB_OpponentMonSendOut`, `SpriteCB_ReleaseMon(2)FromBall`, `HandleBallAnimEnd`, `LoadBallGfx`/`FreeBallGfx`, `GetBattlerPokeballItemId`, tables ball (templates/sheets/palettes).
**ABSENTES du repo — chaîne throw CAPTURE** : `SpriteCB_BallThrow_ReachMon`, `_Shake`, `_StartShakes`, `_ShrinkMon`, `_StartShrinkMon`, `_StartCaptureMon`, `_CaptureMon`, `_FallToGround`, `_Close`, `LaunchBallFadeMonTaskForPokeball`, `DestroySpriteAndFreeResources_Ball`, `StartHealthboxSlideIn`, `SpriteCB_HealthboxSlideIn(Delayed)`.
**ABSENTES — trade** : `CreateTradePokeballSprite`, `SpriteCB_TradePokeball(SendOff|End)` (contexte échange, hors combat).
Notes : l'en-tête de pokeball.ts documente explicitement le périmètre SEND-OUT et défère la capture. **Le send-out réel tourne encore sur l'ad-hoc `battle-sendout-anim.ts`** (le miroil pokeball.ts est écrit mais « DORMANT / non câblé » selon son en-tête #22). La capture jouable passe par `battle_anim_throw.ts` (`SpriteCB_BallThrow` + shakes y sont-ils ? → cf. battle_anim_throw : les `_ReachMon/_Shake` y sont ABSENTS aussi). ⚠️ **Écart le plus visible en reprise.**

## battle_anim.c → battle_anim.ts
Statut : ✅ MIROIR
Fonctions : 78/78 in-homonym.
Sites __sprite : 2 (commentaires + import direct sprite.ts). 0 live-shim.
Notes : réconciliation confirmée. Fichier fiable.

## battle_anim_mons.c → battle_anim_mons.ts
Statut : 🟡 PARTIEL
Fonctions : 74/128 in-homonym.
Manquantes : ~54, cluster **helpers d'animation mon** (translations/oscillations avancées, sprites internes). Le noyau (GetBattlerSpriteCoord, InitAnimArcTranslation, AnimTranslateLinear, TranslateAnimHorizontalArc) est présent et utilisé par pokeball/anim.
Sites __sprite : 1 (import direct, non-shim).

## battle_anim_throw.c → battle_anim_throw.ts
Statut : 🟡 PARTIEL
Fonctions : 69/78 in-homonym.
Manquantes : `SpriteCB_PokeBlock_Arc/LiftArm/Throw`, `SpriteCB_ThrowPokeBlock_Free` (Pokéblock/Safari), `SpriteCB_ShinyStars_Diagonal/Encircle`, `Task_FadeMon_ToNormal_Step`, `Task_PlayerThrow_Wait`, `AnimTask_UnusedLevelUpHealthBox_Step`.
Notes : `ItemIdToBallId`, `AnimateBallOpenParticles`, `LaunchBallFadeMonTask`, `SetUpForReleaseAffineAnim`, `AnimTask_ThrowBall` présents. ⚠️ Les callbacks de **shake de capture** (`SpriteCB_BallThrow_ReachMon/_Shake`) NE sont PAS ici non plus → la séquence visuelle de capture 1:1 n'existe dans aucun fichier miroir.

## battle_interface.c → battle_interface.ts
Statut : 🟡 PARTIEL
Fonctions : 38/53 in-homonym.
Manquantes : `CreateSafariPlayerHealthboxSprites`, `PrintSafariMonInfo`, `SafariTextIntoHealthboxObject`, `Update(Left)No/SafariBallsText…` (**Safari**) · `Debug_DrawNumber(Pair)`, `Debug_TestHealthBar(_Helper)`, `DummiedOutFunction`, `DummyBattleInterfaceFunc` (**dead/debug**) · `FillHealthboxObject`, `GetStatusIconForBattlerId`, `RemoveWindowOnHealthbox`, `UpdateHpTextInHealthboxInDoubles`.
Notes : les manquantes « utiles solo » = `GetStatusIconForBattlerId`, `FillHealthboxObject`, `UpdateHpTextInHealthboxInDoubles`. Le reste = Safari + debug mort.

## battle_bg.c → battle_bg.ts
Statut : 🟡 PARTIEL
Fonctions : 6/12 in-homonym.
Manquantes : `InitLinkBattleVsScreen`, `DrawLinkBattleParticipantPokeballs`, `DrawLinkBattleVsScreenOutcomeText` (**LINK**) · `CB2_UnusedBattleInit`, `UnusedBattleInit` (**dead**) · `LoadChosenBattleElement`.
Notes : gaps = quasi tous link ou dead. `LoadChosenBattleElement` (chargement du décor de combat selon terrain) = seul vraiment solo-pertinent à vérifier.

## battle_intro.c → battle_intro.ts
Statut : ✅ MIROIR
Fonctions : 10/11 in-homonym. Manquante : `DrawBattlerOnBgDMA` (helper DMA du sprite intro).

## battle_gfx_sfx_util.c → battle_gfx_sfx_util.ts
Statut : ✅ MIROIR (quasi)
Fonctions : 47/53 in-homonym.
Manquantes : `BattleGfxSfxDummy1/2/3`, `UnusedDoBattleSpriteAffineAnim` (**dead/dummy**), `GetBattlePalaceTarget` (**palace/frontier**), `ShouldPlayNormalMonCry` (audio-lié, à vérifier).

## battle_controller_player.c → battle_controller_player.ts
Statut : 🟡 PARTIEL (haut)
Fonctions : 109/123 in-homonym.
Manquantes — **EXP/LEVEL-UP task-based (ABSENTES du repo)** : `Task_GiveExpWithExpBar`, `Task_PrepareToGiveExpWithExpBar`, `Task_LaunchLvlUpAnim`, `Task_UpdateLvlInHealthbox`, `DestroyExpTaskAndCompleteOnInactiveTextPrinter`, `CompleteOnInactiveTextPrinter`. → La barre d'EXP/level-up animée 1:1 n'est pas portée (harness ad-hoc `battle-levelup-box.ts` à la place).
Manquantes — **link/reshow/unused** : `SetLinkBattleEndCallbacks`, `CB2_SetUpReshowBattleScreenAfterMenu2`, `HandleMoveInputUnused`, `UnusedEndBounceEffect`, `CompleteOnBankSpriteCallbackDummy2`, `CompleteOnBankSpritePosX_0`, `FreeTrainerSpriteAfterSlide`, `SwitchIn_TryShinyAnimShowHealthbox` (→ battle_interface.ts).
Notes : contrôleur joueur solo largement porté ; le vrai trou fonctionnel = **EXP-gain animation**.

## battle_controller_opponent.c → battle_controller_opponent.ts
Statut : ✅ MIROIR
Fonctions : 86/87 in-homonym.

## reshow_battle_screen.c → reshow_battle_screen.ts
Statut : ✅ MIROIR
Fonctions : 7/7.

---

## AI (audit fonction — fichiers vivants, 100%)

## battle_ai_script_commands.c → battle_ai_script_commands.ts
Statut : ✅ MIROIR · Fonctions : 115/115.

## battle_ai_switch_items.c → battle_ai_switch_items.ts
Statut : ✅ MIROIR · Fonctions : 13/13.
Notes : le cerveau IA (choix de move + switch/item) est **entièrement porté**. Excellent socle pour les combats dresseurs.

---

## ANIMATIONS PAR TYPE (battle_anim_<type>.c — profondeur count)

> Tous : 0 accès live `__sprite` (comptes bruts = commentaires/`__spriteAnimation`). Import direct sprite.ts.
> Pattern : noyau des attaques courantes porté, **helpers Unused/Step/Task avancés manquants par clusters**.

| Fichier | Statut | Fns |
|---|---|---|
| battle_anim_bug.ts | ✅ MIROIR | 13/13 |
| battle_anim_dark.ts | 🟡 PARTIEL | 16/25 (manque Memento/TearDrop/MetallicShine_Step/UnusedBagSteal) |
| battle_anim_dragon.ts | 🟡 PARTIEL | 7/11 (Overheat/DragonDance waver) |
| battle_anim_electric.ts | 🟡 PARTIEL | 30/37 (ShockWave, Unused*) |
| battle_anim_fight.ts | ✅ quasi | 30/31 |
| battle_anim_fire.ts | 🟡 PARTIEL | 27/35 (Eruption, Ember/BurnFlame) |
| battle_anim_flying.ts | 🔴 bas | 15/31 (bcp *_Step ; DiveBall/Spray→battle_anim_water.ts) |
| battle_anim_ghost.ts | ✅ quasi | 34/37 (DestinyBond/Grudge/Curse Step) |
| battle_anim_ground.ts | ✅ quasi | 24/25 |
| battle_anim_ice.ts | 🔴 bas | 18/32 (Hail/Swirl/IceBall/PoisonGasCloud) |
| battle_anim_normal.ts | 🟡 PARTIEL | 23/36 (**cluster BlendColorCycle*/TintPalettes** — helpers réutilisés partout) |
| battle_anim_poison.ts | ✅ quasi | 8/9 (AnimBubbleEffect) |
| battle_anim_psychic.ts | 🟡 PARTIEL | 22/27 (RedX/SkillSwap/Extrasensory Step) |
| battle_anim_rock.ts | 🔴 bas | 11/22 (Rollout/FallingRock/Vortex Step) |
| battle_anim_water.ts | 🟡 PARTIEL | 40/48 (SurfWave/WaterBubble/WaterSpout) |
| battle_anim_effects_1.ts | 🟡 PARTIEL | ~114/151 (~37 manquants : MusicNote/Ingrain/NeedleArm/Metronome…) |
| battle_anim_effects_2.ts | 🟡 PARTIEL | ~90/118 (~28 manquants : AirWave/Guillotine/Fury/Bullet…) |
| battle_anim_effects_3.ts | ✅ MIROIR | ~135/135 |
| battle_anim_mon_movement.ts | ✅ MIROIR | ~27/27 |
| battle_anim_smokescreen.ts | ✅ trivial | 1/1 |
| battle_anim_sound_tasks.ts | 🚫 audio-exempt | 0 anim (tâches son) |
| battle_anim_status_effects.ts | ✅ quasi | 6/8 |
| battle_anim_utility_funcs.ts | ✅ quasi | 38/39 |

Note : `battle_anim_normal.ts` manque le **cluster BlendColorCycle*/TintPalettes/UnpackSelectedBattlePalettes** — ce sont des helpers de blend palette réutilisés par de nombreuses animations d'autres types → levier transversal élevé pour compléter les anims.

---

## battle_transition.c → battle_transition.ts
Statut : 🔴 DIVERGENT (fortement partiel)
Fonctions : ~24/210 in-homonym (839 l. vs 4776 l. décomp).
**Porté** : Blur, Slice, AngledWipes, PokeballsTrail (FldEff), WhiteBarsFade, Task_Intro/BattleTransition_Intro, FadeScreenBlack, CreateIntroTask.
Manquantes : ~186 — la **grande majorité des transitions** (Mugshot, Ripple, Wave, Aqua, Wild double, Groudon/Kyogre/Rayquaza, Frontier…). C'est un très gros fichier de données+effets.
Notes : les combats démarrent (une poignée de transitions marchent), mais le catalogue 1:1 des transitions est largement à faire.

## safari_zone.c → (quasi ABSENT)
Statut : 🔴 quasi ABSENT
Fonctions : 0/17 in-homonym. Seuls `EnterSafariMode`/`ExitSafariMode`/`GetPokeblockFeederInFront` existent (stubs dans engine/script/specials-registry.ts).
Manquantes : tout le cœur Safari (`CB2_EndSafariBattle`, `SafariZoneTakeStep`, feeders Pokéblock, flags, compteur de pas, `DoSafariBattle`).
Notes : combat Safari non implémenté en tant que flux 1:1.

## recorded_battle.c → ABSENT
Statut : 🚫 EXEMPT (flux replay/link non implémenté). 866 l. décomp, aucun homonyme.

---

## FRONTIER (inventaire léger — contenu lointain, non prioritaire)

| Fichier .c | fns C | Notre fichier | État |
|---|---|---|---|
| battle_arena.c | 18 | ABSENT | non porté |
| battle_dome.c | 71 | ABSENT | non porté |
| battle_factory.c | 26 | ABSENT | non porté |
| battle_factory_screen.c | 118 | ABSENT | non porté |
| battle_palace.c | 11 | ABSENT | non porté |
| battle_pike.c | 54 | ABSENT | non porté |
| battle_pyramid.c | 51 | battle_pyramid.ts | amorce partielle (~30% échantillon) |
| battle_pyramid_bag.c | 81 | ABSENT | non porté |
| battle_tower.c | 83 | ABSENT | non porté |
| battle_tent.c | 29 | ABSENT | non porté |
| battle_records.c | 31 | ABSENT | non porté |
| battle_tv.c | 12 | ABSENT | non porté (TV séparé) |
| battle_transition_frontier.c | 34 | ABSENT | non porté |

Notes : les « échantillons trouvés » en Grep pour ces fichiers matchent surtout des **noms génériques** (`CompleteOnFinishedBattleAnimation`, etc.) partagés avec les controllers de base — ce ne sont PAS des portages du contenu Frontier. Seul `battle_pyramid.ts` a une amorce réelle.

---

## CONTROLLERS variantes (link/recorded/safari/wally/player_partner)

Aucun fichier `.ts` dédié pour ces variantes. Réalité :
- **Link / recorded** (`battle_controller_link_opponent/partner`, `battle_controller_recorded_opponent/player`) : 🚫 **EXEMPT flux multi**. Leurs callbacks « CompleteOn* » sont des copies des controllers de base player/opponent (déjà présents).
- **`battle_controller_player_partner.c`** (combats doubles côté joueur) : ABSENT dédié ; callbacks partagés présents dans opponent/controllers. Le partenaire de double solo n'est pas un flux 1:1 dédié.
- **`battle_controller_safari.c`** (72 fns) : ABSENT. **Pertinent solo** (Safari Zone) — non porté (cohérent avec safari_zone.c).
- **`battle_controller_wally.c`** (81 fns) : ABSENT. **Pertinent solo** (tuto capture Wally) — non porté (cohérent avec `StartWallyTutorialBattle` absent).
Dépendances solo à porter au retour : Safari + Wally controllers, quand safari_zone/wally-tutorial seront attaqués.

---

## Sites `__sprite` — inventaire précis
- **Total token `__sprite` dans src/ : 31 occurrences / 23 fichiers**, MAIS :
  - **Accès live au shim `globalThis.__sprite.*` : 0** (grep `__sprite\.` = 0 match). Le shim n'est **plus défini** (aucun `globalThis.__sprite =`).
  - battle_anim*.ts (18 fichiers, ~20 occ.) = **commentaires** (`ex-__sprite`, notes migration 2026-06-30) + import direct sprite.ts.
  - Hors combat (sprite.ts×3, field_player_avatar×3, naming_screen×2, starter_choose×1, trainer_pokemon_sprites×1) = commentaires + les globals **différents** `__spriteResetCallbacks` / `__spriteAnimation` (toujours vivants, ce ne sont PAS le shim `__sprite`).
- **Conclusion : la migration `__sprite`→import direct est terminée pour battle_anim_*. Aucun résidu à traiter.** (Contredit la note mémoire « ~50 sites restants ».)

---

## Piste bug switch-on-faint (lecture seule)
Le flux switch-après-KO passe par `Cmd_openpartyscreen` (battle_script_commands.ts:10066, 1:1 de battle_script_commands.c:4868-5147) → `Cmd_switchhandleorder` (10202, décomp:5155-5220) → `Cmd_getswitchedmondata` (7392). Le côté action/état est éclaté entre `battle_util.ts` (`HandleAction_Switch`), `engine/battle/battle-switch.ts` (`SwitchInClearSetData`, `HandleAction_Switch`, `TriggerBattleSwitch`) et `engine/battle/battle-turn-helpers.ts` (`SwitchPartyOrder`). **Points de suspicion à instrumenter en reprise** (pas creusé plus, read-only) :
1. `battle-switch.ts:_resetBattleStructForSwitch` + `SwitchInClearSetData` : divergence possible vs `SwitchInClearSetData` décomp (reset de `gBattleStruct->monToSwitchIntoId`, disableStructs, protect).
2. Les `SentPokesToOpponent` **manquants** (battle_util : `Reset/UpdateSentPokesToOpponentValue`) sont sollicités au switch-in dans la décomp → leur absence peut fausser l'état après un KO.
3. Duplication `HandleAction_Switch` (battle_util.ts ET battle-switch.ts) : risque que deux versions divergent.

---

## TOP 5 — écarts à plus fort impact à la reprise du chantier combat

1. **Chaîne throw de CAPTURE Poké Ball (pokeball.c / battle_anim_throw.c)** — `SpriteCB_BallThrow_ReachMon/_Shake/_StartShakes/_ShrinkMon/_CaptureMon` + `EmitSuccessBallThrowAnim` sont **ABSENTS de tout le repo**. Taille **M**. Levier ÉNORME (chaque tentative de capture = animation la plus regardée du jeu). Oracle : `__byteVm.launchWild` → lancer une Ball, observer la séquence secousses/capture 1:1. **Actuellement sur glue, pas miroir.**

2. **Animation EXP-gain / level-up (battle_controller_player.c)** — `Task_GiveExpWithExpBar`, `Task_PrepareToGiveExpWithExpBar`, `Task_LaunchLvlUpAnim`, `Task_UpdateLvlInHealthbox` **ABSENTS**. Taille **M**. Levier élevé (fin de chaque combat gagné). Oracle : gagner un combat sauvage, vérifier la barre d'EXP animée + fanfare level-up 1:1 (aujourd'hui ad-hoc `battle-levelup-box.ts`).

3. **`SentPokesToOpponent` + PP-loss Imprison/PerishSong (battle_util.c)** + **piste switch-on-faint** — `Reset/UpdateSentPokesToOpponentValue`, `PressurePPLose*`, `TryClearRageStatuses` absents ; possible cause racine du bug switch-on-faint. Taille **S/M**. Levier fiabilité combat (état correct après KO/switch). Oracle : combat dresseur multi-mons, KO puis switch, vérifier l'état/messages.

4. **Combats spéciaux non lançables (battle_setup.c)** — legendary/roamer/regi/groudon-kyogre/wally-tutorial + `GetSpecialBattleTransition` + `PlayTrainerEncounterMusic` **ABSENTS**. Taille **M/L**. Levier scénarisation (tous les combats scriptés « à enjeu »). Oracle : déclencher un légendaire/roamer via script.

5. **Cluster helpers palette d'animation `BlendColorCycle*`/`TintPalettes` (battle_anim_normal.c) + clusters anim manquants (effects_1/2, water, ice, rock, flying)** — helpers de blend réutilisés transversalement + ~200 anims spécifiques manquantes. Taille **L** (mais parallélisable par type). Levier visuel large (beaucoup d'attaques rendues incomplètes). Oracle : lancer des moves variés en combat et comparer l'animation. Faire les **helpers blend d'abord** (débloquent plusieurs types d'un coup).
