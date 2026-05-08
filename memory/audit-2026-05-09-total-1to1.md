# TOTAL 1:1 décomp audit — Session 124 cold pass

Date : 2026-05-09
Scope : `src/engine/` priority files + `src/scenes/TestOverworldScene.ts:executeWarp` + transpiler patterns.
Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/`.

Légende : 🔴 critique (visual/gameplay bug observable) · 🟠 majeur (sémantique divergente) · 🟡 mineur (edge-case).

---

## 1. Executive summary — top 10 violations par impact user-visible

| # | Sévérité | Fichier:line | Violation | Lié à user feedback |
|---|---|---|---|---|
| 1 | 🔴 | `src/engine/decomp-runtime.ts:884-892` | `LoadPaletteBg`/`LoadPaletteObj` écrivent direct dans `gba.palette` (= PLTT register), bypass `bufferTransferDisabled` gate. Tout sprite/tileset palette load via ces helpers leak pendant un warp window. | A.1 (palette flash truck → Littleroot) |
| 2 | 🔴 | `src/engine/object-events.ts:606-627` (`tickLookAround`) + `src/engine/script-opcodes.ts:443-450` (`faceplayer`) | Mom est typiquement `MOVEMENT_TYPE_LOOK_AROUND`. Quand pas frozen, `tickLookAround` écrase `npc.facingDirection` à un random direction → face_player set par script est immédiatement perdu si l'opcode n'a pas freeze le NPC d'abord. | A.2 (Mom face_player visual ne s'update pas) |
| 3 | 🔴 | `src/engine/truck-cinematic.ts:151-170` | Bob timer `data[2]` partagé entre states 1+2+3 ; décomp utilise un task séparé (`Task_Truck2`) avec `tTimerVertical` qui resetent à 0 au state 3. Box bouncing phase déphasée vs ROM. | A.3 (truck box visual differs) |
| 4 | 🔴 | `src/engine/truck-cinematic.ts:155-157` | Décomp `Task_Truck1` (lignes 95-107 décomp) calcule box `yBox` depuis `tTimer` PRE-increment et `cameraYpan` depuis `tTimer` POST-increment → +1 frame offset entre box et camera. Notre impl utilise `data[2]` post-increment pour les deux → synchronisation parfaite mais incorrecte vs ROM. | A.3 |
| 5 | 🔴 | `src/engine/movement-system.ts:464-494` (`_tickWalkInPlace`) | Durations 2× trop longues : `walk_in_place_normal_*` = 32 frames (décomp = 16) ; `walk_in_place_slow_*` = 64 frames (décomp = 32) ; `walk_in_place_fast_*` = 16 (décomp = 8) ; `walk_in_place_faster_*` = 8 (décomp = 4). Toute scripted face-anim 2× plus longue qu'attendu. | — |
| 6 | 🔴 | `src/engine/movement-system.ts:325-329` (`walk_faster_*`) | Implémenté à 8 frames × 2px/frame = 16px ; décomp `MOVE_SPEED_FASTER` = 4 frames × Step4(4px) = 16px. Notre impl 2× plus lent que ROM (= mach bike speed). | — |
| 7 | 🔴 | `src/engine/movement-system.ts:230-362` | Seules ~30 actions sur **160** entries `MOVEMENT_ACTION_*` dans décomp (= `include/constants/event_object_movement.h`). Toute action absente (`acro_*`, `slide_*`, `ride_water_current_*`, `walk_diagonal_*`, `play_se_*`, `walk_left_affine`, `figure_8`, etc.) hit `console.warn` + skip immédiat → scripts contenant ces actions tournent muets. | — |
| 8 | 🟠 | `src/engine/script-opcodes.ts:410-441` | `lock`/`lockall` retournent `false` (= continue script) ; décomp `ScrCmd_lock` (`scrcmd.c:1217-1237`) appelle `SetupNativeScript(IsFreeze...Finished)` + return TRUE → script attend que player AND selected NPC finissent leur step en cours avant de continuer. Notre impl peut déclencher msgbox mid-step. | — |
| 9 | 🟠 | `src/engine/script-opcodes.ts:91-101` (`switch`/`case`) | Macros user-level non-expansés. Notre impl `switch arg0` = `copyvar VAR_0x8000, arg0`. `case cond, dest` = `compare VAR_0x8000, cond` + `goto_if_eq dest`. **OK** mais on ne supporte pas la varlocale `VAR_0x8000` shadowing si imbriqué (= rare cas d'usage Battle Frontier). | — |
| 10 | 🟠 | `src/engine/object-events.ts:858-878` (`TickObjectEventMovements`) | Pas de support pour `MOVEMENT_TYPE_BERRY_TREE_GROWTH`, `TREE_DISGUISE`, `MOUNTAIN_DISGUISE`, `COPY_PLAYER_*`, `WALK_SLOWLY_IN_PLACE_*`, `WALK_SEQUENCE_*`, `BURIED`, `INVISIBLE`, `JOG_IN_PLACE`. Ces NPCs spawnent statiques. | — |

---

## 2. Per-file findings

### 2.1 `src/engine/movement-system.ts` (vs `src/event_object_movement.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🔴 | 472-476 | A | `event_object_movement.c:5732-5826 InitMoveInPlace duration` | walk_in_place_normal=16 décomp, our=32 ; slow=32 décomp, our=64 ; fast=8 décomp, our=16 ; faster=4 décomp, our=8 | Diviser par 2 toutes les durations |
| 🔴 | 325-329 | A | `event_object_movement.c:8274-8278 sStep4Funcs (4 frames × Step4)` | walk_faster `8, 2` au lieu de `4, 4` | `_tickWalk(target, dir, frame, 4, 4)` |
| 🔴 | 305-329 | C | `event_object_movement.c:8302-8315 NpcTakeStep` | Décomp utilise lookup table `sStepTimes[speed]` + `sNpcStepFuncTables[speed]` ; nous hardcodons `(duration, pxPerFrame)`. Pas de Step3 pattern (= MOVE_SPEED_FAST_2 alterne {2,3,3,2,3,3}). Impact : water current speeds wrong. | Importer sStepTimes/sStep*Funcs depuis décomp via extracteur |
| 🟠 | 362 | D | `event_object_movement.c MovementAction_*_Step0/1` | Unknown action → `return true` (skip immediately). Décomp asserts ; mais notre fallback inflige une dégradation silencieuse. | Au minimum incrementer un compteur `__missingMovementActions` debuggable |
| 🟠 | 56-65 | B | `event_object_movement.c:5081 InitNpcForMovement` | Notre `_queues` est un Map TS séparé du `objectEvent` struct ; décomp stocke heldMovementActionId + heldMovementFinished sur l'`ObjectEvent` directement → script lock peut consulter `objectEvent->heldMovementFinished` par localId. Notre `isMovementDone(localId)` lookup le map. Equivalent fonctionnel mais lock tooling diverge. | Migrer le state vers `ObjectEvent.heldMovementActionId` + `heldMovementFinished` |
| 🟡 | 224-247 | E | — | `_tickAction` reset `gFieldCamera.movementSpeedX/Y = 0` au frame 0 de chaque action (player) pour éviter drift. Hack de fix Phase 4.10 — fonctionnel mais pas 1:1 décomp. | À documenter comme accepted divergence ou refactor pour matcher décomp `MovementAction_FinishedMovement` |
| 🟡 | 230-362 | C | `event_object_movement.c:5057-6320 MovementAction_*_Step0/1` | Notre tickAction = single function returning bool ; décomp utilise un sActionFuncId dispatching à Step0 puis Step1. Equivalent mais notre `frame === 0` check n'est pas isomorphe au `sActionFuncId` advancement. | Acceptable simplification pour MVP |

### 2.2 `src/engine/object-events.ts` (vs `event_object_movement.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🔴 | 606-627 (tickLookAround) + 622 | C | `event_object_movement.c:2846-2893 MovementType_LookAround_Step*` | Notre impl coalesce step 0+1 en single tick + saute step 2 (= ObjectEventExecSingleMovementAction wait). Conséquence : si applymovement face_player set facing à `dir`, frame suivant tick rentrent dans case 4 et écrasent vers `pickRandomDirection`. ✅ User feedback A.2. | Implémenter le step machinery 1:1 décomp avec sActionFuncId, OR tester `npc.frozen` aussi dans `_setFacing` puis ne pas overriding pendant frozen state |
| 🔴 | 622 | D | `event_object_movement.c:2882-2892 LookAround_Step4` | Décomp pick direction ALEATOIRE depuis `gStandardDirections`, mais peut être override par `TryGetTrainerEncounterDirection`. Notre impl ne check pas. | Implémenter TryGetTrainerEncounterDirection (= gate sight line vers player) |
| 🔴 | 1108-1140 | A | `event_object_movement.c:1330+ subsprite tables` | `useSubsprites = true` set comme **hack** pour 16×16 et 32×32 NPCs (= "skip frame update"), mais ces sprites ne sont PAS subsprite-driven. Faux flag qui désactive `updateNpcSpriteFrame` même si on voudrait l'animer. | Distinguer subsprites (= true 48×48 truck) vs simple no-anim (= 16×16, 32×32 inanimate) avec un flag séparé |
| 🟠 | 663-680 (tickWanderAround) | C | `event_object_movement.c:2566-2630 MovementType_WanderAround_Step*` | Décomp split en step 1=face anim, step 2=wait Anim done, step 3=delay, step 4=pick dir, step 5=walk init, step 6=walk update. Notre impl skip step 1+2 (= face anim + wait) → NPC ne joue pas l'anim FaceDirection avant de bouger (= subtil mais visible si on regarde frame par frame). | Implémenter le step machinery complet |
| 🟠 | 1264-1305 (UpdateObjectEvents) | C | `field_camera.c:461 gSpriteCoordOffsetX` + `event_object_movement.c BuildOamBuffer` | Notre impl combine center → screen offset dans `sprite.x = npc.worldX + offX - panX + visualOffsetX`. Décomp utilise gSpriteCoordOffsetX/Y séparé puis BuildOamBuffer additione. Mais la signature visuelle finale est équivalente ; à valider si `pan` integration matche. | Tracer chaque composant pour confirmer parité pixel-exact |
| 🟠 | 437-444 | B | `event_object_movement.c sMovementTypeFacingDirections` | `movementTypeToInitialFacing` substring-matche `"FACE_DOWN"` etc., mais ne couvre pas `MOVEMENT_TYPE_FACE_DOWN_AND_UP` (= `dirs = [DIR_SOUTH, DIR_NORTH]` mais initial facing = SOUTH). Notre impl returne SOUTH dans tous les cas not-matched. | Importer `sFacingDirectionByMovementType` table depuis décomp |
| 🟡 | 50-53 | A | `event_object_movement.c:307+ sMovementDelaysMedium / Long / Short` | Importé `sMovementDelaysMedium = [32, 64, 96, 128]` mais pas de variants Long/Short utilisés par WANDER_LONG / FACE_*_AND_*_LONG variants. | Importer toutes les tables sMovementDelays* |

### 2.3 `src/engine/script-opcodes.ts` (vs `src/scrcmd.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🔴 | 313-342 | A | `scrcmd.c trainerbattle*` | All 6 `trainerbattle_*` opcodes are stubs that auto-set `VAR_RESULT=1` (= win). Aucune battle réelle n'est lancée. Phase 5 BattleScene à venir. | Phase 5 |
| 🔴 | 615-638 | A | `scrcmd.c:1353-1370 ScrCmd_multichoice` | `multichoice` stub auto-set `VAR_RESULT=0` (= 1ère option). 117 usages. ChooseStarter dépend indirectement → starter selection bypass. | Phase 4+ |
| 🟠 | 410-417 | B | `scrcmd.c:1217-1237 ScrCmd_lock` | Décomp lock returns TRUE + SetupNativeScript(IsFreeze...Finished). Notre impl just sets `frozen = true` + return false (= ne wait PAS player step end). Edge case : interact pendant un step → script proceeds before player step finishes. | Wire `SetupNativeScript(ctx, () => isPlayerNotMoving())` |
| 🟠 | 91-101 | B | `scrcmd.c:148-149 ScrCmd_goto` | Décomp `ScriptJump(ctx, ScriptReadWord(ctx))` ; notre impl `getScript(label)` → null check. OK fonctionnel. Mais notre impl `console.warn + StopScript` pour un label introuvable ; décomp silencieusement set scriptPtr=NULL → SCRIPT_MODE_STOPPED. Equivalent. | — |
| 🟠 | 484-495 | C | `scrcmd.c ScrCmd_waitmessage` | Notre `SetupNativeScript(ctx, IsFieldMessageBoxHidden)` ; décomp use exactement ce pattern. ✅ |
| 🟠 | 705-733 (waitstate) | C | `scrcmd.c:142 ScrCmd_waitstate` | Notre impl poll `getPendingWarp() === null` AND `gMapHeader.id !== startMapId`. Décomp use ScriptContext_Stop (= statut WAITING) jusqu'à ce que ScriptContext_Enable soit call. Plus robuste mais notre poll équivalent fonctionnel. ✅ |
| 🟠 | 1204-1212 (fadescreen) | A | `scrcmd.c:626-631 ScrCmd_fadescreen` | Décomp call `FadeScreen(mode, 0)` qui appelle `BeginNormalPaletteFade(PALETTES_ALL, 0, ...)` puis `SetupNativeScript(ctx, IsPaletteNotActive)`. Notre impl ✅ matche. | — |
| 🟠 | 1240-1251 (setmetatile) | A | `scrcmd.c:2034-2048 ScrCmd_setmetatile` | Notre impl appelle pas `MapGridSetMetatileLayerTypeAt` selon `isImpassable` ; décomp ne fait pas non plus. ✅ Mais notre impl utilise `VarGet` direct ; décomp utilise `VarGet(ScriptReadHalfword(ctx))`. Equivalent. | — |
| 🟡 | 1314-1322 (setdynamicwarp) | C | `scrcmd.c:839-849 ScrCmd_setdynamicwarp` | Stocke uniquement (mapId, x, y) ; décomp stocke aussi `mapNum, mapGroup, warpId`. À ce stade fonctionnel. | — |
| 🟠 | 950-962 (applymovement) | C | `scrcmd.c:992-1000 ScrCmd_applymovement` | Notre impl ne stocke pas le movement sur `objectEvent->heldMovementId` directement → `waitmovement LOCALID_X` fait un lookup map au lieu de check `objectEvent->heldMovementFinished`. Equivalent mais sémantiquement différent. | Migrer state sur ObjectEvent |

### 2.4 `src/engine/script-runtime.ts` (vs `src/script.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🟢 | — | — | `script.c:71-125 RunScriptCommand` | Inner while(1) loop matches décomp : run opcodes consécutifs jusqu'à wait ou STOPPED. ✅ |
| 🟡 | 353 | E | — | `for (let iter = 0; iter < 10000; iter++)` safety cap. Décomp pas de cap (= infinite loop si bug). Acceptable pour debug. | — |
| 🟠 | 86-97 | B | `script.c sGlobalScriptContext / sImmediateScriptContext` | Notre 2 context match décomp. ✅ |
| 🟠 | 543-579 (TryRunOnWarpIntoMapScript) | A | `script.c:364 TryRunOnWarpIntoMapScript` | Implémenté ✅. Iter map_script_2 avec var match comme décomp. | — |
| 🟠 | 585-606 (TryRunCoordEventScript) | A | `field_control_avatar.c:733 TryRunCoordEventScript` | Implémenté ✅, mais notre impl skip si `sGlobalScriptContextStatus !== CONTEXT_SHUTDOWN`. Décomp skip seulement pendant un script déjà running (= équivalent). | — |
| 🟠 | 109-125 (classifyAsMovement) | E | — | Heuristic (= last opcode == "step_end" + pas de virgules) pour distinguer movement vs script. Failure mode : un script avec un seul opcode `face_default` ou `walk_in_place_down` est classifié comme movement. | Faire un classifier plus strict (= regex de toutes les MOVEMENT_ACTION_*) |
| 🟢 | — | — | `script.c:241 ScriptContext_SetupScript` | Notre impl ✅ matches : InitScriptContext + SetupBytecodeScript + LockPlayerFieldControls. | — |

### 2.5 `src/engine/player-avatar.ts` (vs `field_player_avatar.c` + `event_object_movement.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🟠 | 458-462 | A | `event_object_movement.c sPicTable_BrendanNormal[18]` | Player frame layout 1:1 ✅ : 0..8 walk, 9..17 run. Mais `dashOffset` calc utilise `gPlayerAvatar.dashing && runningState=MOVING && stepFramesLeft > 0` → revient aux walk frames hors active step. Décomp `sAnim_RunSouth` → `running.png` reste actif tant que PLAYER_AVATAR_FLAG_DASH set. Subtil : court visuel si user lache B mid-step. | Lecture flag PLAYER_AVATAR_FLAG_DASH directement |
| 🟠 | 410-486 (updateSpriteFrame) | A | `event_object_movement.c:5713 MovementAction_WalkInPlace_Step1` | `collideFramesLeft >= 16` → walk anim, sinon face. Décomp use sActionFuncId. Visual matche. Mais après collide cycle done, ne vérifie pas si `collideFramesLeft` doit re-re-trigger sur user input held. | OK : ré-trigger ✓ déjà ligne 745-757 |
| 🟠 | 478-485 | A | `field_camera.c:461 gSpriteCoordOffsetY` + `event_object_movement.c BuildOamBuffer` | `sprite.x = 120 - panX, sprite.y = 72 + jumpY - panY`. Décomp BuildOamBuffer avec `coordOffsetEnabled` ne s'applique pas au player (= player sprite est fixed). Notre impl bypasse OK. | — |
| 🟠 | 769-872 (step end branch) | A | `field_player_avatar.c:588-596 CheckMovementInputNotOnBike` | `runningState` reste MOVING en fin de step → mid-walk turn = continuous walk sans pause. ✅ matches décomp. | — |
| 🟡 | 808-830 (warp step end) | A | `field_control_avatar.c:702 TryStartWarpEventScript` | Step-end check skip 'arrow' kind ; ✅ matches décomp. | — |
| 🟠 | 1056-1068 (DestroyPlayerAvatar) | C | `field_player_avatar.c` (no direct equivalent) | Custom helper. Décomp ne destroy pas le sprite player explicitement entre warps (= reuse le sprite struct). Notre impl destroy + InitPlayerAvatar respawn. Functionally equivalent mais OAM slot fluctue. | — |
| 🟠 | 996-1010 (door warp from player) | C | `field_control_avatar.c:833 TryDoorWarp` | check direction = NORTH + behavior MB_ANIMATED_DOOR. ✅ matches. | — |

### 2.6 `src/engine/field-camera.ts` (vs `src/field_camera.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🟢 | 553-635 | — | `field_camera.c:360-426 CameraUpdate` | 1:1 incluant **le bug décomp lignes 400-406** (= deltaX au lieu de deltaY pour Y branch). ✅ |
| 🟢 | 206-216 | — | `field_camera.c:74-86 FieldUpdateBgTilemapScroll` | Le `+8` BG_VOFS ✅. |
| 🟠 | 663 | A | `field_camera.c GetSpriteCoordOffsetY` | `GetBgVofsBaseline` returns `sVerticalCameraPan + 8`. Décomp `gSpriteCoordOffsetY = gTotalCameraPixelOffsetY - sVerticalCameraPan - 8`. Le `-8` au lieu de `+8` selon le sens. Notre wrapper fonctionne mais pas pixel-perfect avec `gSpriteCoordOffsetY`. | À cross-check avec le rendu sprite |
| 🟠 | 452-548 (CameraMove) | A | `fieldmap.c:649-678 CameraMove` | Cross-border path implémenté ✅, mais `gPlayerAvatar.x/y += delta` est volontairement OMIS (= laissé au step end). Décomp fait `pos.x += x` immédiatement. Note dans le code documente bien la divergence intentionnelle. | Doc explicite ; à valider que tous les call-sites en aval handle correct |

### 2.7 `src/engine/map-loader.ts` (vs `src/fieldmap.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🟢 | 1431-1445 | — | `fieldmap.c:925-932 CopyMapTilesetsToVram` | ✅ |
| 🟢 | 1448-1462 | — | `fieldmap.c:934-941 LoadMapTilesetPalettes` | ✅ via `LoadPalette` qui write to `gPlttBufferFaded` (= gated). |
| 🟠 | 1392-1418 (LoadTilesetPalette) | A | `fieldmap.c:875-898 LoadTilesetPalette` | Primary : load BLACK + skip first color. ✅ matches. Secondary : load `palettes[NUM_PALS_IN_PRIMARY]..` ✅. **MAIS** notre `flattenPaletteBanks` peut load des banks vides (= bytes 0) si la map n'utilise pas tous les banks → écrase entries valides du précédent map (rare mais possible). | Bound check le `numEntries` exactement à `tileset.palettes.length * 16` |

### 2.8 `src/engine/decomp-runtime.ts` (vs `src/main.c` + `palette.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🔴 | 884-892 (LoadPaletteBg/Obj) | C | `palette.c:91-95 LoadPalette` | Écrit DIRECTLY dans `gba.palette` (= PLTT register), bypass `gPlttBufferFaded` ET `bufferTransferDisabled`. Tout sprite/tileset asset loader call LoadPaletteBg/Obj → leak palette pendant le warp window. **Cause directe user A.1**. | Refactor pour write dans `gPlttBufferFaded` à la place ; le flush au prochain VBlank respectera le gate. |
| 🔴 | 884-892 | D | — | API de l'engine doit unifier sur `gPlttBufferFaded` comme single source of truth ; tous les call-sites direct `gba.palette.loadObjRange` doivent migrer. | Revue de tous les call-sites |
| 🟠 | 1980-1988 (vblankCallback flush) | C | `palette.c:103 TransferPlttBuffer` | ✅ Gated. |
| 🟠 | 1981-1986 | A | — | Le `gPlttBufferFaded.flushTo()` itère 256 BG + 256 OBJ entries CHAQUE FRAME. Performant mais inefficient (= devrait copy seulement le delta). Pas un bug. | — |
| 🟢 | — | — | Audit V2 a déjà couvert : runOneFrame ordering, ReadKeys, BeginNormalPaletteFade yDec, ResetPaletteFade deltaY, UpdatePaletteFade softwareFadeFinishing. ✅ |

### 2.9 `src/engine/warp-system.ts` + `TestOverworldScene:executeWarp` (vs `field_screen_effect.c` + `overworld.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🔴 | scene 770-826 | C | `field_screen_effect.c:74 WarpFadeInScreen` + `palette.c:152 FillPalBufferBlack` | `bufferTransferDisabled = true` set avant `loadAndInitMap`. Mais `LoadPaletteBg/Obj` (cf. 2.8) bypass le gate. Si l'engine load des sprite assets pendant cette window → leak palette. **Note** : la séquence FillPalBufferBlack + flushTo + bufferTransferDisabled=false est correcte sur le path principal, mais asset loaders inline peuvent leak. | Fix 2.8 d'abord |
| 🟠 | scene 686-700 (door warp pre-anim) | A | `field_screen_effect.c:677-728 Task_DoDoorWarp` | Notre séquence : PlaySE + AnimDoorOpen + walk-up + SetPlayerVisibility(false) + AnimDoorClose. ✅ matches décomp case 0..2. | — |
| 🟠 | scene 793-803 (Pre-Phase 4 setup) | A | `field_screen_effect.c:325-330 Task_ExitDoor case 0` | SetPlayerVisibility(false) + FieldSetDoorOpened AVANT fade in. ✅ matches décomp. | — |
| 🟠 | scene 822-826 | C | `palette.c FillPalBufferBlack + flushTo` | FillPalBufferBlack + flushTo + bufferTransferDisabled=false. ✅ matches décomp pattern. | — |
| 🟠 | scene 838-842 (defensive redraw) | A | — | Force `clearOverworldTilemaps + DrawWholeMapView + flushOverworldTilemaps + FieldUpdateBgTilemapScroll`. Décomp ne fait pas tout ça à chaque warp (= déjà fait par loadAndInitMap). Defensive ; peut masquer un bug ailleurs. | À valider si nécessaire ou redondant |
| 🟠 | scene 960-973 (waitForForcedWalkComplete) | C | — | Promise polling avec setTimeout(check, 17ms). 1 frame GBA = 16.67ms. **Acceptable** mais pas exactement frame-aligné. | — |

### 2.10 `src/engine/truck-cinematic.ts` (vs `field_special_scene.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🔴 | 138-244 | A | `field_special_scene.c:89-178 Task_Truck1/2/3` | Inline 3 tasks dans 1 state machine ; bobTimer `data[2]` partagé entre states 1+2+3 sans reset au state 3. Décomp Task_Truck2 alloué fresh task → `tTimerVertical = 0`. Notre `data[2]` = ~450 au state 3 → box jump phase wrong. ✅ Cause user A.3. | Reset `data[2] = 0` au state 2→3 transition |
| 🔴 | 155-157 | A | `field_special_scene.c:95-107 Task_Truck1` | Décomp box bouncing utilise `tTimer` PRE-increment ; camera Y bobbing utilise `tTimer` POST-increment (= +1 frame offset). Notre impl utilise même `data[2]` post-increment pour les 2 → box et camera Y synchronisés (= incorrect). | `_applyBoxBouncing(data[2] - 1, ...)` OR refactor pour matcher décomp ordering |
| 🟠 | 122-127 | A | `field_special_scene.c:262-268 ExecuteTruckSequence` | Décomp `CpuFastFill(0, gPlttBufferFaded, PLTT_SIZE)` (= write 0 partout). Notre `BeginNormalPaletteFade(...0, 16, 16, 'RGB_BLACK')` (= startY=endY=16 → instant black via fade machinery). Functionally equivalent mais use le software fade pipeline plutôt que CpuFastFill direct. | — |
| 🟠 | 230-233 | A | `field_special_scene.c:251 DrawWholeMapView` | Au state 5 (= door swap), `DrawWholeMapView` ✅ matches décomp. Mais on call avec `gPlayerAvatar.x/y` → si player hors-truck (= mid-warp), redraw position invalide. **Edge case**. | Use `GetCameraTopLeftCoords()` à la place |
| 🟡 | 86-105 (boxBouncing helpers) | A | `field_special_scene.c:96-100 LOCALID_TRUCK_BOX_*` | OK ✅ matches. | — |

### 2.11 `src/engine/random.ts` (vs `src/random.c`)

| Sévérité | Line | Type | Décomp ref | Issue | Fix |
|---|---|---|---|---|---|
| 🟢 | 30-71 | — | `random.c:1-33` | 1:1 ✅. Bug Emerald préservé (gRngValue init à 0). |
| 🟡 | 112-119 (SeedRngAndSetTrainerId) | A | `main.c:201` | Use `Date.now()` au lieu de `REG_TM1CNT_L`. Non-déterministe par run, donc perte de RNG-replay. **Acceptable** pour démo, à fix si on veut traces deterministes. | Use une stub timer counter qui simule TM1 (= incrément par tick, snapshot au boot) |

### 2.12 Transpilers (`scripts/transpile-callbacks.mjs` + extracteurs)

| Sévérité | Item | Issue | Fix vector |
|---|---|---|---|
| 🟠 | `transpile-callbacks.mjs` scope | Couvre uniquement SpriteCB / Task / CB2 callbacks. Ignore : `gMovementActionFuncs[]` (160 entries × 2 step funcs = ~320 funcs), `gSpecials[]` (527 entries), `gFieldEffectScripts[]`, `sScrCmdTable[]` opcodes décomp (~250 commands), MapHeaderCheckScriptTable variants, `field_effect_helpers.c` patterns. | V1-V4 next session — cf. roadmap |
| 🟠 | `extract-movement-action-funcs.mjs` exists | Extracts but doesn't transpile bodies. Movement actions have ~3-line bodies typically (= `Init...; return ...Step1();`) → low-hanging fruit. | V3 vector |
| 🟠 | extracteurs des opcodes | `extract-decomp.mjs` produit des labels script JSON ; aucun extracteur traverse `sScrCmdTable[]` pour générer un dispatcher TS auto-wired. Tous les opcodes sont implémentés à la main dans `script-opcodes.ts`. | À ajouter |
| 🟡 | `extract-decomp-task-machines.mjs` | Capture les tâches mais pas le `data` aliases (#define tX data[N]). Les générées tâches `auto/src/<scene>-callbacks-auto.ts` font `task.data[N]` direct. | Acceptable |

---

## 3. Architectural concerns

### 3.1 Palette pipeline split

**Issue** : Trois paths de palette write coexistent :
1. `gPlttBufferFaded.set(...)` puis attente du VBlank flushTo (= gated par `bufferTransferDisabled`).
2. `gPlttBufferFaded.flushTo()` direct (= bypass gate, mais utilisé seulement par `TransferPlttBuffer`).
3. `gba.palette.loadBgRange/loadObjRange` (= write direct au PLTT register, bypass tout gate).

Path 3 est le **principal vecteur de palette flash**. Tous les call-sites de `LoadPaletteBg/Obj` (= asset loaders, sprite sheets) doivent être migrés au path 1 pour respecter `bufferTransferDisabled`.

### 3.2 Double state pour movement actions

`movement-system.ts._queues` (= TS Map keyed par localId) et `ObjectEvent` struct (= `walkFramesLeft, walkDirection`) sont **deux state machines parallèles**. Décomp utilise une seule (= `objectEvent->heldMovementActionId/Finished` + `sprite->sActionFuncId`). Notre dual-state cause edge cases :
- `applymovement` + `setobjectmovementtype` peuvent set des states contradictoires.
- `tickWanderAround` modifie `walkFramesLeft` mais ne s'occupe pas du queue movement-system.

**Fix** : Unifier sur `ObjectEvent.heldMovementActionId` + per-sprite `sActionFuncId`. Plus 1:1 décomp + élimine la divergence.

### 3.3 Movement actions coverage gap

160 actions décomp vs ~30 implémentées. Auto-port via transpiler V3 (= `gMovementActionFuncs[][2]` + 320 step functions) est high-impact, low-risk car la plupart des step bodies sont des helpers déjà existants (`InitMovementNormal`, `UpdateMovementNormal`, etc.).

### 3.4 Frozen NPC vs movement-system override

Quand un NPC est `frozen` (= dialog en cours), `TickObjectEventMovements` skip le state machine. **MAIS** :
- `applymovement` via movement-system PEUT continuer à modifier `npc.facingDirection` via `_setFacing`.
- Si la queue movement-system applique `face_player` à un NPC `frozen`, l'écriture passe → bon.
- Mais après dialog end (= `frozen = false`), `tickLookAround` reprend et écrase `facingDirection` aléatoirement.

**Cause user A.2** : Mom est `LOOK_AROUND`. Script applymovement face_player → `_setFacing(MOM, dir)` ✓. Mais ensuite `tickLookAround` tick 1 frame plus tard → `npc.movementStep === 4` peut-être → écrase facing.

Fix : Le script doit `setobjectmovementtype FACE_DOWN` (= statique) AVANT le applymovement face_player, pour empêcher LOOK_AROUND de re-randomize. Le décomp utilise ce pattern dans Mom_OnTransition. **Vérifier** que c'est bien fait dans nos scripts JSON pré-extraits.

### 3.5 Subsprite handling pour 16×16 et 32×32

`useSubsprites = true` est utilisé comme **flag opaque** pour skip `updateNpcSpriteFrame` dans 3 cas :
- True subsprites (= 48×48 truck avec 12 OAMs)
- Inanimate 16×16 (= boxes)
- Inanimate 32×32 (= Vigoroth)

→ Si on voulait animer un 32×32 Pokemon NPC plus tard (e.g. wagging tail), ce flag bloquerait les frame updates. Architectural lock-in.

**Fix** : Flag séparé `npc.frameAnimDisabled` ou `npc.useSubsprites` strict (= true uniquement pour multi-OAM).

---

## 4. Recommended remediation order (= dependency-ordered)

1. **🔴 Fix #2.8 LoadPaletteBg/Obj** : Refactor pour write to `gPlttBufferFaded` au lieu de `gba.palette` direct. Régresse user A.1 immédiatement (= palette flash truck → Littleroot). **Estimate** : 30 min refactor + 2h test.

2. **🔴 Fix #2.10 truck cinematic state 3 bobTimer reset** : Reset `data[2] = 0` au state 2→3 transition + ajouter `_applyBoxBouncing(data[2] - 1, ...)` pour matcher PRE/POST increment offset décomp. Régresse user A.3. **Estimate** : 15 min + visual replay test.

3. **🔴 Fix #2.2 LookAround face_player race** : Solution rapide = vérifier que `setobjectmovementtype FACE_DOWN` est dans Mom_OnTransition JSON ; sinon ajouter le pattern dans pre-script. Solution propre = implémenter `tickLookAround` avec sActionFuncId machinery (= step 1 ne reset pas si NPC vient juste de set face). **Estimate** : 30 min quick fix + 3h proper.

4. **🔴 Fix #2.1 movement-system walk_in_place_* durations** : Diviser par 2. **Estimate** : 5 min.

5. **🔴 Fix #2.1 walk_faster_* speed** : `_tickWalk(target, dir, frame, 4, 4)`. **Estimate** : 5 min.

6. **🟠 Auto-port gMovementActionFuncs[]** : V3 vector. ~100 actions à porter. Débloque scripts rares (= acro bike, surf, ride water, slide). **Estimate** : 1 jour transpiler + 1 jour test.

7. **🟠 Fix #2.3 lock/release** : Wire `SetupNativeScript` pour wait player step end. **Estimate** : 1h.

8. **🟠 Fix #2.7 LoadTilesetPalette bound check** : Bound `numEntries` à `tileset.palettes.length * 16`. **Estimate** : 15 min.

9. **🟠 Architectural #3.5 useSubsprites split** : Renommer en `frameAnimDisabled` + créer un vrai `useSubsprites` strict. **Estimate** : 2h.

10. **🟠 Fix #2.6 GetBgVofsBaseline** : Cross-check sign avec `gSpriteCoordOffsetY`. **Estimate** : 1h investigation + fix.

11. **🟢 Architectural #3.2 unify movement state** : Migrer `movement-system._queues` vers `ObjectEvent.heldMovementActionId`. **Estimate** : 1 jour refactor + 1 jour test.

12. **🟡 Fix #2.11 SeedRngAndSetTrainerId** : Utiliser un timer simulé. **Estimate** : 30 min.

---

## 5. Devtools recommendations (= dev.audit.X functions à ajouter)

Pour chaque type de violation common, un dev tool live-checkable :

1. **`dev.audit.palette.gateLeaks()`** : Hook les call-sites `gba.palette.loadBgRange/loadObjRange` pour log avec stack trace TOUTE écriture pendant `bufferTransferDisabled = true`. Output : list de paths qui leak. → Cible 2.8.

2. **`dev.audit.movement.unknownActions()`** : Track tous les `console.warn unknown action` du movement-system, dédupliqués. Output : list des actions manquantes. → Cible 2.1.

3. **`dev.audit.object.frozenButFacingChanged(npcId)`** : Hook `_setFacing` + `tickLookAround` ; log si facing change pendant `frozen = true` OU si tickLookAround écrase un facing récemment set par script. → Cible user A.2.

4. **`dev.audit.truck.bobPhase()`** : Live-print `data[2]` (bobTimer) au state transitions du truck task ; vérifie que reset à 0 au state 3. → Cible user A.3.

5. **`dev.audit.warp.timeline()`** : Trace timeline complet d'un warp : Phase 1 start, lockControls, fade-out, loadAndInitMap (= avec timestamps de chaque step), fade-in, exitTask. → Cible user A.1 + general warp debugging.

6. **`dev.audit.opcode.coverage()`** : Liste tous les opcodes du `_scriptsByLabel` map non-couverts par `registerOpcode` (= vont fallthrough au default). Output : opcodes manquants. → Cible 2.3 generally.

7. **`dev.audit.stepTimes()`** : Live-print durations par MOVE_SPEED_* utilisés vs décomp `sStepTimes[]`. → Cible 2.1.

8. **`dev.audit.movement.queue(localId)`** : Print state du movement-system `_queues` ET `ObjectEvent.walkFramesLeft/walkDirection` ; flag si divergent → Cible 3.2.

9. **`dev.audit.connection.spawnTimeline()`** : Trace les NPCs spawned post-cross-border, vérifie qu'aucun n'arrive avec stale `gFieldCamera` state. → Cross-border debug.

---

## 6. Notes finales

- Audit **V2** existant (= `AUDIT_1_1_DECOMP_V2.md`) couvre déjà : palette fade engine, OAM allocation, naming screen, Birch flow, Lotad anim. **Ne pas dupliquer**.
- Les fichiers **`battle_*`, `pokenav_*`, `pokedex_*`, `pokemon_storage_*`** sont **out-of-scope** (= pas encore implémentés en TS, pas dans `src/engine/`).
- Le **directive "1:1 décomp + foundations unifiées"** (= `directive_no_redo_unified_foundations.md`) est respectée pour la majorité du code, mais l'architecture #3.1 (palette split paths) et #3.2 (movement dual-state) sont des entorses.
- **User A.1, A.2, A.3** ont des fixes identifiés (= remédiations 1-3 ci-dessus). À appliquer en priorité.
- **160 movement actions vs ~30** = le single biggest 1:1 gap. Auto-port via transpiler V3 critique.

---

End of audit.
