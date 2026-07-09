# Audit 1:1 — Domaine « field-movement »

> READ-ONLY. Source de vérité décomp : `D:/Projet 1/decomps/pokeemeraude/src/`.
> Notre repo : `D:/Projet 1/pokemon-web-demo/`. Rapport incrémental.
> Périmètre : event_object_movement, field_player_avatar, field_effect, field_effect_helpers,
> tous les fldeff_*, bike, metatile_behavior, trainer_see, faraway_island.

Légende : ✅ MIROIR | 🟡 PARTIEL | 🔴 DIVERGENT | ⬜ ABSENT | 🚫 EXEMPT

---

## fldeff_dig.c → src/fldeff_dig.ts
Statut : 🔴 DIVERGENT (simplification documentée)
Fonctions : 3/4 portées + helpers hors-scope
- `SetUpFieldMove_Dig` (fldeff_dig.c:17) → ailleurs (party_menu.ts / party-screen ; documenté)
- `FieldCallback_Dig` (fldeff_dig.c:31) ✅ présent (fldeff_dig.ts:73) — 1:1 sauf `gFieldEffectArguments[0]` no-op assumé
- `FldEff_UseDig` (fldeff_dig.c:38) 🔴 corps RÉÉCRIT : la décomp fait `CreateFieldMoveTask` + stocke
  `StartDigFieldEffect` dans data[8/9] + `SetPlayerAvatarTransitionFlags(ON_FOOT)` sauf braille.
  Notre port (fldeff_dig.ts:47) fait directement `FieldEffectActiveListRemove` + `_warpToEscapeWarp()`.
- `StartDigFieldEffect` (fldeff_dig.c:49) 🔴 ABSENT tel quel : la logique décomp (`ShouldDoBrailleDigEffect`
  → `DoBrailleDigEffect` sinon `CreateTask(Task_UseDigEscapeRopeOnField)`) n'est pas portée.
Divergences : le port livre un warp fade simplifié (`_warpToEscapeWarp` state maison lisant
  `globalThis.__escapeWarp`) au lieu du field-effect + `Task_UseDigEscapeRopeOnField` (animation de
  creusage vers le bas). Le branchement braille (`ShouldDoBrailleDigEffect`/`DoBrailleDigEffect`,
  braille_puzzles.c) est absent → régence dig sur les tablettes braille (Sealed Chamber) non porté.
Stubs suspects : `CanUseDigOrEscapeRopeOnCurMap` (fldeff_dig.ts:55) 1:1 OK.
Note : simplification ASSUMÉE (commentaire honnête). Anim de creusage = follow-up rendu M3.

## fldeff_teleport.c → src/fldeff_teleport.ts
Statut : 🔴 DIVERGENT (simplification documentée)
Fonctions : 2/4 portées
- `SetUpFieldMove_Teleport` (fldeff_teleport.c:13) → ailleurs (party-screen ; documenté)
- `FieldCallback_Teleport` (fldeff_teleport.c:24) ✅ présent (fldeff_teleport.ts:62), 1:1
- `FldEff_UseTeleport` (fldeff_teleport.c:31) 🔴 corps RÉÉCRIT : décomp = `CreateFieldMoveTask` +
  data[8/9]=StartTeleportFieldEffect + `SetPlayerAvatarTransitionFlags(ON_FOOT)`. Notre port
  (fldeff_teleport.ts:37) = `FieldEffectActiveListRemove` + warp fade vers `respawnLocation` (STRING id).
- `StartTeleportFieldEffect` (fldeff_teleport.c:40) 🔴 non porté tel quel (fusionné dans le warp maison ;
  la vraie chaîne `FldEff_TeleportWarpOut` / `Task_TeleportWarpOut` spin-out/spin-in ABSENTE).
Divergences : spin-out/spin-in du joueur remplacé par simple `FadeScreen(FADE_TO_BLACK)`.
  Warp destination = `gSaveBlock1Ptr.respawnLocation` (string) résolu via `GetHealLocationByName`
  au lieu de `SetWarpDestinationToLastHealLocation` (lastHealLocation.{mapGroup,mapNum}).
Note : simplification ASSUMÉE (décision user 2026-06-17, commentaire honnête).

## fldeff_cut.c → src/fldeff_cut.ts
Statut : 🔴 DIVERGENT (partiel — SEULE la branche ARBRE portée ; herbe/hyper-cutter absente)
Fonctions : 2/17 dans le fichier (compl(partout) ~5/17)
Présentes (fldeff_cut.ts) :
- `FldEff_UseCutOnTree` (fldeff_cut.c:300) ✅ 1:1 (via CreateFieldMoveTask ; `IncrementGameStat` non porté = dette)
- `StartCutTreeFieldEffect` (fldeff_cut.c:642) ✅ 1:1 (+ `SignalWaitState()` = adaptation waitstate port, documentée)
Manquantes [vivant] :
- `SetUpFieldMove_Cut` (fldeff_cut.c:138) — GROSSE fn : hyper-cutter, scan 3x3/5x5, `sHyperCutTiles`, `sHyperCutStruct`
- `FieldCallback_CutGrass` (fldeff_cut.c:278)
- `FldEff_UseCutOnGrass` (fldeff_cut.c:284)
- `StartCutGrassFieldEffect` (fldeff_cut.c:310)
- `FldEff_CutGrass` (fldeff_cut.c:316) — sprites rotatifs (`CutGrassSpriteCallback1/2/End`) + metatile swaps
- `SetCutGrassMetatile` (fldeff_cut.c:354), `SetCutGrassMetatiles` (419), `GetLongGrassCaseAt` (403),
  `HandleLongGrassOnHyper` (465), `FixLongGrassMetatilesWindowTop` (592), `FixLongGrassMetatilesWindowBottom` (615)
- `CutGrassSpriteCallback1/2/End` (553/561/576)
Note : le Cut ARBRE (interaction A → EventScript_CutTree) fonctionne 1:1 ; le Cut HERBE (party menu,
  hyper cutter, sprites de coupe, transformation des metatiles longues-herbes) = totalement absent.
  `FixLongGrassMetatilesWindow*` sont VIVANTS (appelés depuis field_camera.c DrawMetatile) → à vérifier.

## fldeff_rocksmash.c → src/fldeff_rocksmash.ts
Statut : 🟡 PARTIEL (branche interaction seule)
Fonctions : 2/10 dans le fichier
Présentes :
- `FldEff_UseRockSmash` (fldeff_rocksmash.c:150) ✅ 1:1 (via CreateFieldMoveTask ; IncrementGameStat non porté)
- `FieldMove_RockSmash` (nom décomp exact) ✅ 1:1 (+SignalWaitState adaptation)
Manquantes [vivant] : `SetUpFieldMove_RockSmash`, `FldEff_RockSmash`, les callbacks sprite d'éclatement
  du rocher, `RockSmashWildEncounter` (→ wild_encounter). La cartograph dit compl(partout)=7/10 (dispersé).
Note : le rocher se brise via le script EventScript_SmashRock (rock_smash_break opcode) — l'anim sprite
  de destruction du rocher (`FldEff_RockSmash`) n'est pas portée.

## fldeff_flash.c → src/fldeff_flash.ts
Statut : 🟡 PARTIEL (branche HM party-menu seule)
Fonctions : 2/20 dans le fichier
Présentes :
- `FldEff_UseFlash` (fldeff_flash.c:94) ✅ logique 1:1 (FlagSet + ScriptContext_SetupScript ; PlaySE skip)
- `FieldCallback_Flash` (fldeff_flash.c:87) ✅ 1:1 (via CreateFieldMoveTask)
Manquantes [vivant] : tout le système de transition de grotte BLDCNT/BLDALPHA (CB2_DoChangeMap /
  TryDoMapTransition / `Task_ExitCaveTransition1..3` / `sTransitionStructPtr` / `sFlashLevelPixelRadii`) —
  déclenché aux warps entrée/sortie de grotte, PAS par le move. Absent (transitions de grotte fondu circulaire).
Note : masque circulaire de pénombre existe (flash-mask.ts) + opcodes animateflash/setflashlevel.
  Ce qui manque = l'animation de fondu circulaire à l'ENTRÉE/SORTIE de grotte.

## fldeff_strength.c → ABSENT
Statut : ⬜ ABSENT
Fonctions : 0/4 (aucun port TS — seule `public/decomp/em/extracted-all/fldeff_strength.json` = data extraite)
Manquantes [vivant] :
- `SetUpFieldMove_Strength` (fldeff_strength.c:18) — `CheckObjectGraphicsInFrontOfPlayer(PUSHABLE_BOULDER)`
- `FieldCallback_Strength` (fldeff_strength.c:30)
- `FldEff_UseStrength` (fldeff_strength.c:36) — `CreateFieldMoveTask` + `GetMonNickname`→gStringVar1
- `StartStrengthFieldEffect` (fldeff_strength.c:46)
Note : Strength active le flag qui permet de pousser les rochers (`OBJ_EVENT_GFX_PUSHABLE_BOULDER`).
  Vérifier si le PUSH de rocher lui-même (movement) marche sans ce fichier — sinon HM Strength cassé.
  Grep : aucune fn de ce fichier trouvée dans src/ ni harness/.

## fldeff_escalator.c → ABSENT
Statut : ⬜ ABSENT
Fonctions : 0/6 (aucun port TS)
Manquantes :
- `StartEscalator` (fldeff_escalator.c:169) [vivant — appelé par event scripts escalator Pokémon Center 2F]
- `StopEscalator` (174), `IsEscalatorMoving` (179) [vivant]
- `Task_DrawEscalator` (113), `SetEscalatorMetatile` (66), `CreateEscalatorTask` (156) [vivant]
Note : anime les escalators (Centre Pokémon / grands magasins) via swap de metatiles 3-stages.
  Aucune trace dans src/ ni harness/. Escalators non animés (probablement warp sec).

## fldeff_softboiled.c → src/party_menu.ts (consolidation N:1)
Statut : ✅ MIROIR (consolidé dans party_menu.ts, 🟠 dispersé côté cartograph)
Fonctions : 7/8 (ailleurs : toutes → src/party_menu.ts)
- `SetUpFieldMove_SoftBoiled` (party_menu.ts:2719) ✅
- `ChooseMonForSoftboiled` (2732) ✅
- `Task_TryUseSoftboiledOnPartyMon` (2792) ✅
- `Task_SoftboiledRestoreHealth` (2772) ✅
- `Task_DisplayHPRestoredMessage` (2757) ✅
- `Task_FinishSoftboiled` (2744) ✅
- `CantUseSoftboiledOnMon` (2782) ✅
- `Task_ChooseNewMonForSoftboiled` : fusionné (party_menu.ts:3070 commentaire) — à confirmer
Note : port propre aux noms décomp exacts, dans le bon fichier de consolidation (party_menu = party_menu.c).

## trainer_see.c → src/trainer_see.ts (+ dispersé)
Statut : 🔴 DIVERGENT (seule la section EMOTE ICONS portée ; TOUTE la détection dresseur ABSENTE)
Fonctions : 7/39 dans trainer_see.ts (compl(fichier) 5/39 par cartograph)
Présentes (trainer_see.ts, section icônes) — 1:1 propre :
- `FldEff_ExclamationMarkIcon` (696) ✅  ·  `FldEff_QuestionMarkIcon` (706) ✅  ·  `FldEff_HeartIcon` (716) ✅
- `SetIconSpriteData` (731) ✅  ·  `SpriteCB_TrainerIcons` (745) ✅
- (préchargement sheets = adaptation harness assumée, pas de fuite logique)
Manquantes [VIVANT — cœur détection dresseur] :
- `CheckForTrainersWantingBattle` (trainer_see.c:191) — appelée CHAQUE step par le field control (décomp).
  ⚠️ NON portée ET NON appelée dans field_control_avatar.ts (grep confirmé ligne 255 = liste des non-portés).
- `CheckTrainer` (248), `GetTrainerApproachDistance` (301) + South/North/West/East (327/338/349/360)
- `CheckPathBetweenTrainerAndPlayer` (370), `InitTrainerApproachTask` (412), `StartTrainerApproach` (422)
- `Task_RunTrainerSeeFuncList` (438) + les 16 états `sTrainerSeeFuncList`/`sTrainerSeeFuncList2`
  (TrainerExclamationMark, TrainerMoveToPlayer, PlayerFaceApproachingTrainer, Reveal Disguised/Buried…)
- `Task_SetBuriedTrainerMovement` (625), `SetBuriedTrainerMovement` (650) [→ appelé event_object_movement.ts:5679 en DETTE H3]
- `DoTrainerApproach` (655), `Task_EndTrainerApproach` (660), `TryPrepareSecondApproachingTrainer` (666)
- `GetCurrentApproachingTrainerObjectEventId` (776), `GetChosenApproachingTrainerObjectEventId` (784)
- `PlayerFaceTrainerAfterBattle` (794)
Divergences : la détection passive de ligne de vue dresseur (marcher dans le champ de vision → « ! » →
  le dresseur s'approche → combat) n'existe PAS via la machine 1:1. battle_setup.ts a un flux custom
  (`sShouldCheckTrainerBScript`, `SetUpTwoTrainersBattle` via `EventScript_StartTrainerApproach` transpilé,
  `ConfigureTwoTrainersBattle` avec dette documentée). Les callers trainer_see sont marqués « non porté »
  dans battle_setup.ts:568. => l'aggro-vision dresseur repose sur les event-scripts, pas sur CheckForTrainersWantingBattle.
Stubs suspects : aucun stub silencieux — c'est une ABSENCE assumée (commentaires honnêtes).
ORACLE : entrer sur une route avec un dresseur, se placer dans sa ligne de vue sans lui parler →
  vérifier si le « ! » apparaît et s'il s'approche automatiquement. (Probable : ne se déclenche pas.)

## faraway_island.c → ABSENT (assumé)
Statut : ⬜ ABSENT (sous-système Faraway Island / Mew non porté — décision documentée)
Fonctions : 0/15
Manquantes [vivant sur Faraway Island seulement] : `GetMewMoveDirection` (46), `ObjectEventIsFarawayIslandMew`
  (335), `IsMewPlayingHideAndSeek` (347), `ShouldMewShakeGrass` (361), `SetMewAboveGrass` (370),
  `UpdateFarawayIslandStepCounter` (321), `CanMewMoveToCoords` (270), `GetValidMewMoveDirection` (282),
  `DestroyMewEmergingGrassSprite` (411), + Should/Get* helpers (417-461).
Note : `SetMewAboveGrass` est enregistré comme special (specials-registry.ts:1415) mais probablement stub.
  event_object_movement.ts:2914 + :3920 documentent explicitement la garde `ObjectEventIsFarawayIslandMew`
  NON portée. `IsMewPlayingHideAndSeek` référencé par fldeff_cut.c (grass cut → HideMew) : chez nous non câblé.
  Faraway Island = île event Mew (accès Old Sea Map, contenu post-game rare) → priorité basse. ABSENCE assumée.

## field_player_avatar.c → src/field_player_avatar.ts
Statut : 🟡 PARTIEL (bon — 84%, 148/177 ; cœur mouvement/pêche/forced-movement/transitions PRÉSENT et propre)
Fonctions : ~153/177 dans le fichier + ~5 ailleurs (consolidations)
Vérifié PRÉSENT & 1:1 (grep body confirmé) : `Task_Fishing` (+ 16 états Fishing_*), tous les
  `ForcedMovement_*` (Walk/Slide/Pushed*ByCurrent/MatJump/MatSpin/MuddySlope/Slip), `GetForcedMovementBy
  MetatileBehavior`, `TryDoMetatileBehaviorForcedMovement`, `PlayerAvatarTransition_*` (Normal/MachBike/
  AcroBike/Surfing/Underwater/ReturnToField/Dummy), `DoPlayerAvatarTransition`, `InitPlayerAvatar`,
  `MovePlayerAvatarUsingKeypadInput`, `CheckForPlayerAvatarCollision`, `ShouldJumpLedge`, `TryPushBoulder`+
  `PushBoulder_*`+`Task_PushBoulder`, `StartStrengthAnim`, `PlayerRun`, `MovePlayerNotOnBike`, la famille
  `PlayerNotOnBike*`, `Task_StopSurfingInit`/`Task_WaitStopSurfing`, `TrySpinPlayerForWarp`, etc.
Manquantes/ailleurs (24, majoritairement mineures) :
- `GetPlayerAvatarFlags` (fpa.c:1191) — INLINÉ partout comme `gPlayerAvatar.flags` (33 usages fpa.ts). OK.
- `GetPlayerAvatarGenderByGraphicsId` (1262), `GetFRLGAvatarGraphicsIdByGender`, `GetRSAvatarGraphicsIdBy
  Gender` — 🔴 ABSENTS. `GetRivalAvatarGraphicsIdByStateIdAndGender` → ailleurs (engine/field/object-event-graphics.ts:258).
  La résolution gender→gfx passe par le pattern gender-flags-routing (object-event-graphics.ts).
- `MovementType_Player` (322) + `ObjectEventCB2_NoMovement2` (327) — 🔴 ABSENTS sous ce nom. Le callback
  de mouvement joueur est piloté autrement (movement-system.ts / UpdateObjectEventCurrentMovement). À vérifier
  que le joueur reçoit bien un callback équivalent (input keypad OK en jeu → probablement recâblé).
- `PlayerForceSetHeldMovement` (fpa.c) — 🔴 ABSENT (grep vide). Utilisé pour forcer un mouvement scripté.
- `MovePlayerToMapCoords` — 🔴 ABSENT. `player_get_pos_including_state_based_drift` — 🔴 ABSENT.
- `PlayerNotOnBikeCollideWithFarawayIslandMew` — ABSENT (dépend faraway_island, assumé).
- cluster Secret Base Mat (`PlayerAvatar_DoSecretBaseMatSpin` + Step0-3, `DoPlayerAvatarSecretBaseMatJump`) :
  partiellement présent dans fpa.ts (DoPlayerAvatarSecretBaseMatJump/PlayerAvatar_DoSecretBaseMatSpin trouvés).
- `PlayerFreeze`/`StopPlayerAvatar` → ailleurs (event_object_lock.ts, item_menu.ts). `PlayerGetCopyableMovement`
  → event_object_movement.ts. `SetPlayerAvatarWatering` → specials-registry.ts. `SetPlayerInvisibility` → fpa.ts.
Stubs suspects : aucun détecté. Fix pêche `TryEnableObjectEventAnim` (commit 5018dc78) = vérifié soldé.
Note : fichier globalement fidèle. Reliquats = accessors gender-gfx (FRLG/RS/gender-by-id) + le callback
  nommé `MovementType_Player` + 2-3 helpers de repositionnement. Faible levier sauf MovementType_Player à confirmer.

## field_effect_helpers.c → src/field_effect_helpers.ts
Statut : ✅ MIROIR (94% — 77/79 ; consolidé, contient AUSSI les effets Surf/Dive/Waterfall/ShowMon de field_effect.c)
Fonctions : 77/79 dans le fichier
Manquantes [vivant sur Rayquaza scene seulement] :
- `AnimateRayquazaInFigure8`, `InitRayquazaForFigure8Anim` — 🔴 ABSENTS (anim légendaire Rayquaza, post-game)
Note : le fichier a AUSSI absorbé (consolidation) les effets CS de field_effect.c : `SurfFieldEffect_*`,
  `DiveFieldEffect_*`, `WaterfallFieldEffect_*`, `PokecenterHealEffect_*`, `CreateMonSprite_FieldMove`,
  `FldEff_FieldMoveShowMon*`. Excellente fidélité. Seul reliquat = les 2 fns Rayquaza (priorité basse).

## field_effect.c → src/field_effect.ts (+ field_effect_helpers.ts) — consolidation
Statut : 🟡 PARTIEL (dispatcher + effets sol/CS portés 1:1 ; TOUTES les grandes séquences warp/anim ABSENTES)
Fonctions : ~90/224 (dispatcher + FieldEffectScript VM + ~35 FldEff_* + effets sol via helpers)
PRÉSENT & structurellement 1:1 :
- `FieldEffectStart` (field_effect.ts:297) ✅ — modélise la boucle bytecode `gFieldEffectScriptPointers[id]`
  (commandes loadfadedpal/loadpal/callnative/end = `FieldEffectScript_LoadFadedPalette/LoadPalette/CallNative`).
  `FieldEffectActiveListAdd(id)` en tête = 1:1 (fix documenté du gate CS). BON design.
- `FieldEffectStop` (173), `FieldEffectFreeGraphicsResources` (162), `FieldEffectFreePaletteIfUnused` (142) ✅
- `FieldEffectActiveList{Add,Remove,Contains,Clear}` → engine/field/field-effect-active-list.ts ✅ (leaf anti-cycle)
- Tous les FldEff_ effets de terrain (grass/splash/footprints/dust/ripple/bubbles/sparkle/disguise/surfblob) ✅
- `FldEff_UseSurf/UseDive/UseWaterfall/PokecenterHeal/FieldMoveShowMon(+Init)` ✅ (bodies dans helpers)
Manquantes [VIVANT — grosses séquences warp/anim] :
- **Fly bird animation** (~25 fns) : `FldEff_UseFly`, `FldEff_FlyIn`, `FldEff_NPCFlyOut`, `FlyOut/InFieldEffect_*`
  (BirdLeaveBall/SwoopDown/JumpOnBird/FlyOffWithBird…), `CreateFlyBirdSprite`, `SpriteCB_FlyBird*`,
  `Task_FlyOut/FlyIn/FlyIntoMap/UseFly`, `SetFlyBirdPlayerSpriteId`, `GetFlyBirdAnimCompleted`.
  → l'oiseau de Vol + anim envol/atterrissage ABSENTS. Le Vol warpe (fly-field-move.ts) SANS l'oiseau.
- **Escalator warp** (~20 fns) : `Task_EscalatorWarpIn/Out`, `EscalatorWarpIn/Out_*`, `StartEscalatorWarp`,
  `RideUp/DownEscalatorOut`, `WarpAtEndOfEscalator`, `FadeOutAtEndOfEscalator` — ABSENT (cohérent fldeff_escalator manquant).
- **Fall/pitfall warp** (~9 fns) : `Task_FallWarpFieldEffect`, `FallWarpEffect_*`, `FieldCB_FallWarpExit` —
  ABSENT. Chute par trou (grottes/Sky Pillar) non animée.
- **Teleport spin warp** : `FldEff_TeleportWarpOut`, `Task_TeleportWarpOut/In`, `TeleportWarpOut/InFieldEffect_*`
  (SpinExit/SpinGround/SpinEnter) — ABSENT (cohérent fldeff_teleport simplifié).
- **Escape rope spin** : `EscapeRopeWarpOut/InEffect_*`, `Task_EscapeRopeWarpOut/In` — ABSENT (fldeff_dig.ts a
  une version simplifiée `StartEscapeRopeFieldEffect`, PAS la vraie chaîne spin).
- **Lavaridge Gym warp** (~19 fns) : `LavaridgeGym1F/B1FWarpEffect_*` (AshPuff/Launch/Rise/Warp…) — ABSENT.
- **Deoxys rock** (~9 fns), **Hall of Fame record** (~6 fns), **Rayquaza spotlight** — ABSENT (post-game/légendaire).
- **Bandeau CS Show Mon** : `Task_FieldMoveShowMonIndoors/Outdoors`, `SlideIndoorBanner*`,
  `LoadFieldMoveOutdoorStreaksTilemap`, `VBlankCB_*` — le bandeau graphique « utilise [CS] ! » (streaks + slide)
  partiellement absent (le mon apparaît via ShowMon mais le décor bandeau complet à vérifier).
- `CreateTrainerSprite`, `CreateMonSprite_PicBox`, `CreateHofMonitorSprite` — ABSENT.
- `MultiplyPaletteRGBComponents`/`MultiplyInvertedPaletteRGBComponents` — 🔴 ABSENT (helpers palette teleport/warp).
Stubs suspects : `FieldEffectStart` warn « FLDEFF id not yet ported » pour les id absents (honnête, pas silencieux).
Note : dispatcher + effets de terrain + CS de base = 1:1 solides. Ce qui manque = les GROSSES cinématiques
  warp (escalator, chute-trou, vol-oiseau, spin téléport/corde, Lavaridge, légendaires).

## event_object_movement.c → src/event_object_movement.ts (+ engine/field, data/object_events)
Statut : 🔴 DIVERGENT STRUCTUREL (le mouvement FONCTIONNE mais via une machine tick MAISON, pas les tables 1:1)
Fonctions : ~130/705 aux noms 1:1 + ~52 handlers ré-implémentés sous forme custom (25% cartograph)
Le CŒUR API held-movement est PORTÉ 1:1 (noms exacts) :
- `ObjectEventSetHeldMovement`/`ForceSetHeldMovement`/`ClearHeldMovement*`/`CheckHeldMovementStatus`/
  `GetHeldMovementActionId`/`IsHeldMovementActive`/`IsMovementOverridden` ✅ (eom.ts:791-989)
- `ShiftObjectEventCoords`, `ObjectEventUpdateMetatileBehaviors`, `FreezeObjectEvent`/`UnfreezeObjectEvent` ✅
- Tous les `Get*MovementAction` (Face/WalkNormal/WalkSlow/WalkFast/Jump/Acro*…) ✅ (eom.ts:6161-6452, source UNIQUE — pas de dual-source bridge)
- `GetFaceDirectionAnimNum`/`GetMoveDirection*AnimNum` → engine/field/direction-coords.ts ✅
DIVERGENCE STRUCTURELLE MAJEURE (improvisation assumée = « substrat » spine) :
- Décomp : **261 `MovementAction_*_Step*`** (par direction × type) + **141 `MovementType_*` callbacks** =
  402 fns table-dispatch (`gMovementActionFuncs[]`, `gMovementTypeFuncs[]`, `UpdateObjectEventCurrentMovement`).
- Notre port : **46 `_MovementAction_*_Step*`** (underscore-préfixés → NON conformes au nom décomp) +
  **6 dispatchers `tick*` MAISON** (`tickLookAround`/`tickWanderAround`/`tickRotate`/`tickWalkBackAndForth`/
  `tickWalkSequence`/`tickBerryTreeGrowth`) + `dispatchSpecialMovement`. Les `MovementType_*` (LookAround,
  WanderAround, FaceDown, WalkInPlace, BerryTree…) N'EXISTENT PAS sous leur nom — remplacés par des ticks
  paramétrés + `movementTypeToInitialFacing`/`movementTypeHasRange`/`canWalk`/`isOtherNpcAt` (helpers maison).
- `UpdateObjectEventCurrentMovement` N'EXISTE QU'EN COMMENTAIRE (eom.ts:2796/4038) — le vrai update per-frame
  est piloté par le spine/movement-system autrement. => c'est la « state-machine maison » que la doctrine
  interdit (mais elle FONCTIONNE en jeu : NPC wander/look/rotate/walk-route, sauts, ledges OK).
Manquantes VIVANTES (helpers réels non ré-implémentés) :
- `AllowObjectAtPosTriggerGroundEffects` (🔴 TRULY MISSING — utilisé par FldEff_CutGrass pour les ground fx post-cut)
- `RemoveObjectEvent` / `RemoveObjectEventInternal` / `RemoveAllObjectEventsExceptPlayer` /
  `RemoveObjectEventByLocalIdAndMap` / `RemoveObjectEventIfOutsideView` (🔴 TRULY MISSING — despawn NPC ; à
  confirmer si géré autrement via destroyAllNpcSprites)
- `SpawnSpecialObjectEventParameterized` (🔴 MISSING — spawn NPC dynamique paramétré, utilisé par specials)
- `DoJumpAnim`/`DoJumpAnimStep`/`DoJumpSpecialAnim`/`UpdateJumpAnim`/`InitJump*`/`GetJumpY`/`SetJumpSpriteData`
  (🔴 MISSING sous ce nom — le saut est fait dans les `_MovementAction_*Jump*` maison à la place)
- `DoFigure8Anim`/`InitFigure8Anim`/`GetFigure8X/YOffset`/`AnimateSpriteInFigure8` (🔴 MISSING — anim figure-8,
  utilisée pour certains NPC/légendaires)
- `GetLimitedVectorDirection_*` (12 fns — diagonale→direction limitée, utilisé par sight/copy movement) MISSING
- `CopyablePlayerMovement_*` (9 fns — mouvement NPC qui COPIE le joueur, ex. rival/suiveur) MISSING
- `MoveUnionRoomObjectUp/Down`, `SpriteCB_VirtualObject`, `VirtualObject_UpdateAnim` (union room / virtual obj) MISSING
- `InitObjectEventPalettes`/`LoadObjectEventPalette`/`PatchObjectPaletteRange`/`FindObjectEventPaletteIndexByTag`
  (gestion palettes OE — partiellement dans object-event-graphics.ts, à confirmer complétude)
- `ResetObjectEvents`/`ClearAllObjectEvents`/`ClearObjectEvent` (🔴 MISSING sous ce nom — reset géré via destroyAllNpcSprites?)
Ailleurs (consolidations légitimes) : `FreezeObjectEventsExceptOne` → event_object_lock.ts ; `PatchObjectPalette`
  → object-event-graphics.ts ; `GetObjectEventBerryTreeId` → berry.ts ; `GetLedgeJumpDirection` → field_player_avatar.ts.
Stubs suspects : à surveiller — `RemoveObjectEvent*` absents pourrait laisser des NPC fantômes après removeobject scripté.
Registre graphics : ✅ 239/239 sprites RÉELS présents (data/object_events/object_event_graphics_info.ts = 246 entrées).
  Les 17 « manquants » = `OBJ_EVENT_GFX_VAR_0..F`+`VARS` = placeholders dynamiques runtime (résolus via VAR_OBJ_GFX_ID),
  PAS de vrais sprites. => l'inquiétude « REPORTER_M/F/BOY_1 manquants » du mandat est PÉRIMÉE : ils sont présents.
Note : c'est le plus gros fichier du domaine + la plus grosse divergence STRUCTURELLE (table-dispatch décomp →
  tick maison). Fonctionnellement OK en jeu, mais loin du miroir 1:1 strict sur MovementType_*/MovementAction_*.

## bike.c → src/bike.ts
Statut : ✅ MIROIR (100% — 56/56, body-vérifié)
Fonctions : 56/56. Spot-check `GetOnOffBike` (bike.c:974) = corps 1:1 (flags MACH/ACRO → ON_FOOT + music).
Note : Mach/Acro bike, wheelies, forced movement bike, collision acro = tous portés aux noms exacts. RAS.

## metatile_behavior.c → src/metatile_behavior.ts
Statut : ✅ MIROIR (100% — 144/144, body-vérifié)
Fonctions : 144/144. Spot-check `MetatileBehavior_IsPokeGrass` = corps 1:1 (MB_TALL_GRASS||MB_LONG_GRASS).
Note : tous les prédicats de comportement de metatile portés 1:1. RAS.

## event_object_lock.c → src/event_object_lock.ts (+ dispersé)
Statut : 🟡 PARTIEL (50% fichier ; fonctionnellement couvert par dispersion)
Fonctions : 7-8/14 dans event_object_lock.ts, reste ailleurs
Présentes : `IsPlayerStandingStill`, `FreezeObjects_WaitForPlayer(+AndSelected)`, `IsFreezePlayerFinished`,
  `ScriptUnfreezeObjectEvents`, `Script_FacePlayer`, `FreezeForApproachingTrainers`, `Task_FreezeObjectAndPlayer`.
Ailleurs : `Task_FreezePlayer` → script-opcodes-helpers.ts ; `Script_FacePlayer`/`Script_ClearHeldMovement`
  → specials-registry.ts ; `LockPlayerFieldControls`/`UnlockPlayerFieldControls` → battle-setup-helpers / region-map.
Manquantes : `ScriptFreezeObjectEvents` (🔴 MISSING sous ce nom), `UnionRoom_UnlockPlayerAndChatPartner` (link, N-A).
Note : le verrou joueur unifié utilise `globalThis.__sLockFieldControls` (gotcha connu). Fonctionnel.

## fldeff_sweetscent.c → src/fldeff_sweetscent.ts
Statut : 🟡 PARTIEL (67% fichier, 100% partout — cartograph)
Fonctions : 4/6 dans le fichier ; `FldEff_SweetScent`, `FieldCallback_SweetScent`, `TrySweetScentEncounter`,
  `FailSweetScentEncounter` présents. `SetUpFieldMove_SweetScent`/`StartSweetScentFieldEffect` (party-menu / ailleurs).
Note : Doux Parfum (encounter forcé) fonctionnel. Faible reliquat.

## TOP 5 — écarts prioritaires du domaine (levier × effort)

1. **event_object_movement.c — MovementType_*/MovementAction_* en machine tick MAISON (pas les tables 1:1).**
   Levier ÉNORME (cœur mouvement NPC/joueur, 733 fns, tout le field en dépend), effort **L** (réécrire 402 fns
   table-dispatch = gMovementActionFuncs/gMovementTypeFuncs + UpdateObjectEventCurrentMovement). C'est LA dette
   miroir du domaine : 46 `_MovementAction_` + 6 `tick*` vs 261+141 décomp. Fonctionne mais non 1:1 strict.
   ORACLE : overworld, observer un NPC « wander around » et un « walk in place » — le mouvement doit correspondre
   frame-par-frame ; comparer un saut de ledge (DoJumpAnim) au timing décomp.

2. **trainer_see.c — détection passive de ligne de vue dresseur ABSENTE (`CheckForTrainersWantingBattle`).**
   Levier HAUT (aggro dresseur = mécanique de base du jeu), effort **M** (porter CheckForTrainersWantingBattle +
   CheckTrainer + GetTrainerApproachDistance* + le sTrainerSeeFuncList 16 états + câbler dans field_control_avatar
   par step). Actuellement seuls les emote-icons sont portés ; l'approche passe par des event-scripts custom.
   ORACLE : route avec dresseur, marcher DANS sa ligne de vue sans lui parler → un « ! » doit apparaître et le
   dresseur s'approcher automatiquement pour lancer le combat.

3. **field_effect.c — grandes cinématiques warp/anim ABSENTES (Vol-oiseau, Escalator, Chute-trou, Spin téléport/corde).**
   Levier MOYEN-HAUT (Vol = CS majeure ; escalators/chutes = maps courantes), effort **L** (chaque séquence =
   task multi-état + sprites). Fly warpe sans l'oiseau Fearow ; escalators/chutes/spin-téléport = warp sec.
   ORACLE : utiliser Vol depuis le menu → vérifier l'oiseau qui emporte/dépose le joueur. Monter un escalator
   au Centre Pokémon 2F → vérifier l'anim de metatiles. Tomber dans un trou → vérifier la chute + camera shake.

4. **fldeff_strength.c + fldeff_escalator.c — fichiers ENTIÈREMENT absents (0 port).**
   Levier MOYEN (Strength = HM de progression donjon ; escalator = anim), effort **S** (petits fichiers :
   strength 4 fns, escalator 6 fns). Strength : vérifier que POUSSER un rocher marche sans SetUpFieldMove_Strength.
   ORACLE : face à un rocher poussable avec un Pokémon connaissant Force → le menu doit proposer Force et pousser
   le rocher. Escalator Centre Pokémon → anim de tapis roulant.

5. **fldeff_cut.c — Cut sur HERBE + hyper-cutter ABSENTS (seule la branche ARBRE portée).**
   Levier MOYEN (couper l'herbe = usage courant de Coupe), effort **M** (SetUpFieldMove_Cut scan 3×3/5×5 +
   FldEff_CutGrass sprites rotatifs + SetCutGrassMetatiles + HandleLongGrassOnHyper). L'arbre marche, l'herbe non.
   ORACLE : dans l'herbe haute, utiliser Coupe depuis le menu → un carré 3×3 d'herbe doit être fauché avec l'anim
   de coupe rotative ; avec un Pokémon Hyper Cutter → carré 5×5.

## Synthèse domaine
| fichier | statut | fns portées/total | écart principal |
|---|---|---|---|
| event_object_movement.c | 🔴 DIVERGENT struct | ~130/705 (+52 custom) | MovementType/Action = tick maison, pas tables 1:1 |
| field_player_avatar.c | 🟡 PARTIEL | 148/177 | gender-gfx getters + MovementType_Player absents |
| field_effect.c | 🟡 PARTIEL | ~90/224 | cinématiques warp (fly/escalator/fall/spin) absentes |
| field_effect_helpers.c | ✅ MIROIR | 77/79 | 2 fns Rayquaza figure-8 |
| trainer_see.c | 🔴 DIVERGENT | 7/39 | détection ligne de vue dresseur absente |
| bike.c | ✅ MIROIR | 56/56 | — |
| metatile_behavior.c | ✅ MIROIR | 144/144 | — |
| event_object_lock.c | 🟡 PARTIEL | 7/14 (+dispersé) | fonctionnel via dispersion |
| fldeff_cut.c | 🔴 DIVERGENT | 2/17 | Cut herbe/hyper-cutter absent (arbre OK) |
| fldeff_rocksmash.c | 🟡 PARTIEL | 2/10 | anim éclatement rocher absente (interaction OK) |
| fldeff_flash.c | 🟡 PARTIEL | 2/20 | transitions grotte fondu circulaire absentes |
| fldeff_dig.c | 🔴 DIVERGENT | 3/4 | warp simplifié (pas Task_UseDigEscapeRope + braille) |
| fldeff_teleport.c | 🔴 DIVERGENT | 2/4 | warp simplifié (pas spin-out/in) |
| fldeff_sweetscent.c | 🟡 PARTIEL | 4/6 | fonctionnel |
| fldeff_softboiled.c | ✅ MIROIR | 7/8 → party_menu.ts | consolidé propre |
| fldeff_strength.c | ⬜ ABSENT | 0/4 | fichier entier non porté |
| fldeff_escalator.c | ⬜ ABSENT | 0/6 | fichier entier non porté |
| faraway_island.c | ⬜ ABSENT | 0/15 | sous-système Mew non porté (assumé) |
