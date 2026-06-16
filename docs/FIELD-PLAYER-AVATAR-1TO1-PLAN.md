# Plan 1:1 — `field_player_avatar.c` + `field_control_avatar.c` (couche INPUT joueur)

> État au 2026-06-16. Recherche décomp complète. Le **rendu** joueur est déjà 1:1
> (sprite unifié au slot, anim par le système partagé, actions = bons MovementActions).
> Il reste la couche **INPUT → décision** : notre `PlayerStep` est une machine à états
> MAISON (compteurs `stepFramesLeft`/`turnFramesLeft`/`collideFramesLeft`) qui pose les
> bons held movements, mais ne MIROIR PAS structurellement la décomp.

## La boucle d'input décomp (cible) — `overworld.c::DoCB1_Overworld`
```
chaque frame (CB1) :
  UpdatePlayerAvatarTransitionState()          // dérive tileTransitionState du held movement
  FieldClearPlayerInput(&input)
  FieldGetPlayerInput(&input, newKeys, heldKeys)   // gate l'input aux frontières de tuile
  if (!ArePlayerFieldControlsLocked()):
    if (ProcessPlayerFieldInput(&input) == 1):  // warps/scripts/encounters → consomme
      LockPlayerFieldControls(); HideMapNamePopUpWindow()
  ...
  PlayerStep(direction, newKeys, heldKeys)     // machine de MOUVEMENT pure (field_player_avatar.c)
```

### `tileTransitionState` = clé de voûte (`UpdatePlayerAvatarTransitionState`, fpa.c:884)
```c
tileTransitionState = T_NOT_MOVING;
if (PlayerIsAnimActive())                                   // ObjectEventIsMovementOverridden
  if (!PlayerCheckIfAnimFinishedOrInactive())               // ObjectEventCheckHeldMovementStatus != 0
    if (!PlayerAnimIsMultiFrameStationary())  T_TILE_TRANSITION;   // walk en cours
  else
    if (!PlayerAnimIsMultiFrameStationaryAndStateNotTurning()) T_TILE_CENTER;  // pas centré (1 frame)
```
- `PlayerIsAnimActive` = `ObjectEventIsMovementOverridden(playerObjEvent)`.
- `PlayerCheckIfAnimFinishedOrInactive` = `ObjectEventCheckHeldMovementStatus(playerObjEvent)` (0 = actif&pas fini ; sinon truthy).
- `PlayerAnimIsMultiFrameStationary` = movementActionId ∈ {≤FACE_RIGHT, DELAY_*, WALK_IN_PLACE_*, ACRO_WHEELIE stationary}.
- `…AndStateNotTurning` = ci-dessus && runningState != TURN_DIRECTION.

### `PlayerStep` décomp (fpa.c:332) — machine de mouvement PURE (zéro warp/encounter)
```c
HideShowWarpArrow(playerObjEvent)
if (!preventStep):
  Bike_TryAcroBikeHistoryUpdate(newKeys, heldKeys)
  if (TryInterruptObjectEventSpecialAnim(playerObjEvent, dir) == 0):   // gate : held pas fini → return
    npc_clear_strange_bits(playerObjEvent)                              // clear inanimate/disableAnim/DASH
    DoPlayerAvatarTransition()                                         // état (à pied/vélo/surf/…)
    if (TryDoMetatileBehaviorForcedMovement() == 0):                   // glace/courant/slide/cascade/tapis
      MovePlayerAvatarUsingKeypadInput(dir, newKeys, heldKeys)         // → MovePlayerNotOnBike (à pied)
      PlayerAllowForcedMovementIfMovingSameDirection()
```
`TryInterruptObjectEventSpecialAnim` = LE remplaçant des compteurs : si un held movement
spécial est en cours et pas fini → `return TRUE` (on ne fait rien, le pas continue tout
seul via `TickObjectEventMovements`). Si fini → `ObjectEventClearHeldMovementIfFinished` →
gate ouvert. C'est ça qui clear le held à la fin du pas (et permet à `PlayerSetAnimId` de
re-poser via son guard).

### Dispatch à pied (fpa.c:583)
```c
MovePlayerNotOnBike(dir, held):  sPlayerNotOnBikeFuncs[CheckMovementInputNotOnBike(dir)](dir, held)
CheckMovementInputNotOnBike(dir):
  DIR_NONE → runningState=NOT_MOVING ; dir!=movementDir && runningState!=MOVING → TURN_DIRECTION ; else MOVING
sPlayerNotOnBikeFuncs = { [NOT_MOVING]=PlayerNotOnBikeNotMoving, [TURN_DIRECTION]=…TurningInPlace, [MOVING]=…Moving }
PlayerNotOnBikeNotMoving → PlayerFaceDirection(GetPlayerFacingDirection())   // re-pose FACE à l'arrêt
PlayerNotOnBikeTurningInPlace → PlayerTurnInPlace(dir)
PlayerNotOnBikeMoving → collision=CheckForPlayerAvatarCollision(dir) ;
   ledge→PlayerJumpLedge ; collide→PlayerNotOnBikeCollide ; surf→PlayerWalkFast ;
   (B & FLAG_SYS_B_DASH & !IsRunningDisallowed)→PlayerRun ; else→PlayerWalkNormal
```

### Leaf (fpa.c:949) — DÉJÀ vérifiés équivalents, à porter comme fonctions nommées
`PlayerSetAnimId(actionId, copyMove)` = `if (!PlayerIsAnimActive()) { PlayerSetCopyableMovement(copyMove); ObjectEventSetHeldMovement(player, actionId); }`
→ `PlayerWalkNormal`/`PlayerRun`/`PlayerFaceDirection`/`PlayerTurnInPlace`/`PlayerJumpLedge`/`PlayerNotOnBikeCollide` (cf. mapping vérifié dans [[plan-unifier-sprite-joueur-slot]]).

### `field_control_avatar.c::ProcessPlayerFieldInput` (fca.c:134) — warps/scripts/encounters
Dispatch sur les flags posés par `FieldGetPlayerInput` (eux-mêmes gatés par `tileTransitionState`) :
`tookStep`→TryStartStepBasedScript ; `checkStandardWildEncounter`→CheckStandardWildEncounter ;
`heldDirection`+dpad==facing→TryArrowWarp ; `pressedAButton`→TryStartInteractionScript ; door warp ; dive ; Start ; Select.

## ⚠️ Le couplage (pourquoi pas de petite tranche)
`tileTransitionState` correct ⇄ clearing du held à la fin du pas (`TryInterruptObjectEventSpecialAnim`)
⇄ re-posing FACE à l'arrêt (`PlayerNotOnBikeNotMoving`). Sans le clearing, le held « fini mais actif »
reste → `tileTransitionState` bloqué à `T_TILE_CENTER` à l'arrêt (faux). Donc la machine de mouvement
se porte d'un bloc, pas en confettis.

## Déjà fait / déjà là
- ✅ Rendu joueur 1:1 (commits `1447003f`/`3bb52a63`).
- ✅ Actions/MovementActions 1:1 (walk/run/turn/collide/jump posent les bons held).
- 🟡 `field-control-avatar.ts` PORTÉ mais **JAMAIS ACTIVÉ** : a `FieldInput`, `FieldClearPlayerInput`,
  `FieldGetPlayerInput` (lit `T_TILE_CENTER` qu'on ne pose jamais → mort), helpers warps
  (TryArrowWarp/TryStartWarpEventScript/TryDoorWarp), interactions (TryStartInteractionScript),
  step counters. MANQUE : `ProcessPlayerFieldInput` (le dispatcher) + le wiring dans la boucle.

## Plan staged (1 mécanisme = 1 commit, A/B réel à chaque étape, git checkout = filet)
1. **Machine de mouvement à pied** (LE bloc couplé) : porter `UpdatePlayerAvatarTransitionState`
   (+ helpers), `TryInterruptObjectEventSpecialAnim` (gate+clear), `npc_clear_strange_bits`,
   `MovePlayerNotOnBike`/`CheckMovementInputNotOnBike`/`sPlayerNotOnBikeFuncs`/`PlayerNotOnBike*`,
   `PlayerSetAnimId`+wrappers+`PlayerSetCopyableMovement`, `CheckForPlayerAvatarCollision`.
   RETIRER `stepFramesLeft`/`turnFramesLeft`/`collideFramesLeft`. A/B : walk/dash/turn/collide/ledge.
2. **`ProcessPlayerFieldInput` + activation** : porter le dispatcher (fca.c:134), wirer
   `UpdatePlayerAvatarTransitionState → FieldGetPlayerInput → ProcessPlayerFieldInput → PlayerStep`
   dans la boucle scène ; SORTIR les checks warp/encounter/coord/arrow de PlayerStep (ils passent
   par `input->tookStep`/`checkStandardWildEncounter` gatés par `tileTransitionState`). A/B : door/arrow
   warp, encounter herbe, coord event, panneau/PNJ interact.
3. **Forced movement** : `sForcedMovementFuncs`/`sForcedMovementTestFuncs` (glace, courants, slides,
   cascade, tapis secret base, pente boueuse) + `TryDoMetatileBehaviorForcedMovement`.
4. **DoPlayerAvatarTransition + états** : `PlayerAvatarTransition_*` (Normal/MachBike/AcroBike/Surfing/
   Underwater/ReturnToField). Débloque vélo/surf/plongée.
5. **Features** (séparées, plus tard) : `MovePlayerOnBike` (mach/acro), surf, fishing (Task_Fishing),
   boulder push (Strength), secret base mat jump/spin, warp spin, `InitPlayerAvatar` via vrai
   `SpawnSpecialObjectEvent`, VRAM dynamique (alloc 8 tiles/frame au lieu de précharge 18).

## Pièges connus
- `ObjectEventCheckHeldMovementStatus` : 0=actif&pas fini, 1=actif&fini, 16=pas actif. `PlayerCheckIf
  AnimFinishedOrInactive` = `!== 0`.
- `MovePlayerAvatarUsingKeypadInput` choisit `MovePlayerOnBike` vs `MovePlayerNotOnBike` selon flags vélo.
- `PlayerSetAnimId` ne CLEAR pas — il guard sur `!PlayerIsAnimActive()`. Le clear vient de
  `TryInterruptObjectEventSpecialAnim` (à porter dans la même étape 1, sinon le guard bloque le re-pose).
- NE PAS déplacer player-avatar.ts/object-events.ts vers `src/game/` tant que pas 100% ligne-par-ligne.

---

## 📐 Étape 1b-iii + 2 — call-graph PRÉCIS (recherche décomp 2026-06-16) + résolution du couplage

### Déjà 1:1 (rien à faire)
- ✅ `UpdatePlayerAvatarTransitionState` + helpers (commit `4cd5cd73`) — pose enfin `T_TILE_CENTER`.
- ✅ Chaîne de collision : `CheckForPlayerAvatarCollision` → `CheckForObjectEventCollision` (+ static variant)
  → `GetCollisionAtCoords` (ledge/boulder/rotating gate/acro). `checkPlayerCollision` = noclip dev + delegate 1:1.
- ✅ Leaf actions : `PlayerWalkNormal`/`PlayerRun`/`PlayerTurnInPlace`/`PlayerJumpLedge`/`PlayerNotOnBikeCollide`/
  `PlayerFaceDirection`/`PlayerSetAnimId`/`PlayerSetCopyableMovement`/`PlayerIsAnimActive`.
- ✅ `PlayerNotOnBikeNotMoving` (commit `f2ab1b62`).

### `PlayerStep` cible (field_player_avatar.c:332) — à RÉ-ÉCRIRE 1:1
```
HideShowWarpArrow(playerObjEvent)
if (!preventStep):
  Bike_TryAcroBikeHistoryUpdate(newKeys, heldKeys)            // étape 5 (acro) → stub no-op
  if (TryInterruptObjectEventSpecialAnim(playerObjEvent, dir) == 0):   // ← LE GATE (remplace compteurs)
    npc_clear_strange_bits(playerObjEvent)                    // inanimate/disableAnim/facingLocked=FALSE + clear DASH flag
    DoPlayerAvatarTransition()                                // étape 4 (états) → stub no-op pour l'instant
    if (TryDoMetatileBehaviorForcedMovement() == 0):          // étape 3 (glace/courant) → stub return 0
      MovePlayerAvatarUsingKeypadInput(dir, newKeys, heldKeys)   // → MovePlayerNotOnBike (vélo = étape 5)
      PlayerAllowForcedMovementIfMovingSameDirection()        // if runningState==MOVING → clear CONTROLLABLE flag
```

### `TryInterruptObjectEventSpecialAnim` (fpa.c:355) — LE remplaçant des compteurs
```
if (ObjectEventIsMovementOverridden(p) && !ObjectEventClearHeldMovementIfFinished(p)):  // held actif ET pas fini
  id = ObjectEventGetHeldMovementActionId(p)
  if (id > WALK_FAST_RIGHT(0x18) && id < WALK_IN_PLACE_NORMAL_DOWN(0x1D)):   // = WALK_IN_PLACE_SLOW (collide bump), interruptible
    if (dir == DIR_NONE) return TRUE
    if (p->movementDirection != dir) { ObjectEventClearHeldMovement(p); return FALSE }       // change de dir → interrompt le bump
    if (CheckForPlayerAvatarStaticCollision(dir) == COLLISION_NONE) { ObjectEventClearHeldMovement(p); return FALSE }  // mur parti → interrompt
  return TRUE      // gate : held en cours → PlayerStep ne fait RIEN ce frame (le held avance via TickObjectEventMovements)
return FALSE       // held fini (cleared par IfFinished) OU aucun → on procède
```
⚠️ `ObjectEventClearHeldMovementIfFinished` = quand le held est FINI il le CLEAR + return truthy → `!...` = false →
le `&&` court-circuite → return FALSE → gate ouvert. **C'est ça qui ouvre le gate en fin de pas, pas un compteur.**

### Dispatch (fpa.c:583)
```
MovePlayerNotOnBike(dir, held): sPlayerNotOnBikeFuncs[CheckMovementInputNotOnBike(dir)](dir, held)
CheckMovementInputNotOnBike(dir):                                   // ÉCRIT runningState ET le retourne
  dir==DIR_NONE → runningState=NOT_MOVING ; dir!=GetPlayerMovementDirection() && runningState!=MOVING → TURN_DIRECTION ; else MOVING
sPlayerNotOnBikeFuncs = {[NOT_MOVING]=PlayerNotOnBikeNotMoving, [TURN_DIRECTION]=…TurningInPlace, [MOVING]=…Moving}
PlayerNotOnBikeNotMoving(dir,held)    → PlayerFaceDirection(GetPlayerFacingDirection())   // ✅ déjà porté
PlayerNotOnBikeTurningInPlace(dir,held) → PlayerTurnInPlace(dir)
PlayerNotOnBikeMoving(dir,held):
  collision = CheckForPlayerAvatarCollision(dir)
  if (collision): LEDGE_JUMP→PlayerJumpLedge ; (mew island skip) ; else (collision-COLLISION_STOP_SURFING > 3)→PlayerNotOnBikeCollide
  SURFING→PlayerWalkFast (étape 5) ; (B & FLAG_SYS_B_DASH & !IsRunningDisallowed)→PlayerRun+set DASH flag ; else→PlayerWalkNormal
```

### 🔴 LE COUPLAGE (= pourquoi pas incrémentable, à porter d'un bloc avec une amorce d'étape 2)
Notre `PlayerStep` actuel utilise les compteurs `stepFramesLeft/turnFramesLeft/collideFramesLeft` pour DEUX choses :
(a) **gater l'input** (→ remplacé par `TryInterruptObjectEventSpecialAnim`), (b) **déclencher le step-end**
(warp/rencontre/coord + `SyncPlayerObjectEvent`) à `stepFramesLeft===0`. Le pas AVANCE déjà via le held movement
(TickObjectEventMovements, indépendant de PlayerStep) → (a) est pur remplacement. MAIS (b) : dans la décomp le
warp/rencontre est dans **`ProcessPlayerFieldInput`** (fca.c:134, tourne AVANT PlayerStep dans CB1), gaté par
`tileTransitionState == T_TILE_CENTER`. Donc retirer les compteurs OBLIGE à déplacer le step-end → c'est l'**étape 2**.
→ 1b-iii et 2 se portent ENSEMBLE.

⚠️ **Risque à vérifier en premier** (déterministe, AVANT la ré-écriture) : `SyncPlayerObjectEvent` au step-end
réconcilie `slot.currentCoords` (avancé par le held `ShiftStillObjectEventCoords`) avec `gSaveBlock1Ptr.pos`
(avancé par `CameraMove` au tile boundary). **Tester** : après un held walk, `slot.currentCoords === gSaveBlock1Ptr.pos` ?
Si OUI → SyncPlayerObjectEvent redondant (le held + caméra suffisent), ré-écriture simplifiée. Si NON (drift) →
il faut déclencher Sync sur held-finished. (Sonde : `gSaveBlock1Ptr` PAS sur `rt` au runtime — trouver l'accesseur,
ex. `window.gSaveBlock1Ptr` ou via dev-scope, avant de tester.)

### Plan d'attaque du bloc (focused, A/B à chaque sous-étape, git checkout = filet)
1. Vérifier le sync pos/coords (ci-dessus) → décide si on garde/retire SyncPlayerObjectEvent.
2. Porter `TryInterruptObjectEventSpecialAnim` + `npc_clear_strange_bits` + `MovePlayerNotOnBike`/
   `CheckMovementInputNotOnBike`/`sPlayerNotOnBikeFuncs`/`PlayerNotOnBikeTurningInPlace`/`PlayerNotOnBikeMoving`.
3. Ré-écrire `PlayerStep` = la structure cible ci-dessus (DoPlayerAvatarTransition + TryDoMetatileBehaviorForcedMovement
   = stubs). Retirer `stepFramesLeft/turnFramesLeft/collideFramesLeft`.
4. Amorcer étape 2 : sortir warp/rencontre/coord/arrow de PlayerStep → check gaté `T_TILE_CENTER` (activer
   `field-control-avatar.ts::FieldGetPlayerInput`/`ProcessPlayerFieldInput` déjà ~porté).
5. A/B EXHAUSTIF : walk/dash/turn/collide(bump+SE)/ledge jump/door warp/arrow warp/encounter herbe/coord event/
   interact PNJ/cutscène scriptée. Aucune régression tolérée.
