# Audit 3/8 : Overworld, rendu, déplacement

## Comparaison web projet vs décomp pokeemeraude

### Architecture décomp overworld

**Fichiers décomp clés** :
- `src/overworld.c` — CB2_NewGame, CB2_ContinueSavedGame, CB2_Overworld, LoadMap, ResumeMap
- `src/fieldmap.c` — InitMap, MapGridGet*, CopyMapTilesetsToVram, DrawWholeMapView
- `src/field_camera.c` — CameraUpdate, DrawMetatile, sFieldCameraOffset circular buffer 32x32
- `src/field_player_avatar.c` — PlayerStep, MovePlayerNotOnBike, InitPlayerAvatar, collision
- `src/event_object_movement.c` — TrySpawnObjectEvents, MovementType_*_Step*, ObjectEventUpdate
- `src/field_door.c` — sDoorAnimGraphicsTable, DoorOpen/Close animation, GetDoorSoundEffect
- `src/field_control_avatar.c` — ProcessPlayerFieldInput, TryStartWarpEventScript, TryArrowWarp, TryDoorWarp
- `src/field_screen_effect.c` — DoWarp, DoDoorWarp, Task_WarpAndLoadMap, Task_ExitDoor
- `src/metatile_behavior.h` — MB_* constants, IsMetatileDirectionallyImpassable
- `src/field_tasks.c` — Task_UpdateFieldCamera, Task_UpdateObjectEvents

### Architecture web projet

**Fichiers correspondants** :
- `TestOverworldScene.ts` — CB2_Overworld, executeWarp, map transitions, MainCB2_Overworld
- `map-loader.ts` — InitMap, loadMapByName, MapGridGet*, CopyMapTilesetsToVram, DrawMetatile
- `field-camera.ts` — sFieldCameraOffset, CameraUpdate, DrawWholeMapView, scrolling 32x32
- `player-avatar.ts` — PlayerStep, checkPlayerCollision, InitPlayerAvatar, updateSpriteFrame
- `object-events.ts` — SpawnObjectEventsOnMap, MovementType_*, UpdateObjectEvents
- `door-anim.ts` / `field-door.ts` — door animation, GetDoorSoundEffect, FieldAnimateDoorOpen/Close
- `warp-system.ts` — WarpKind, pending warp state, getWarpAtPlayerPos, exit task dispatch
- `movement-system.ts` — applyMovement, MovementAction_* step functions, tickMovementQueues
- `metatile-behaviors.ts` — MB_* constants, behavior lookups
- `direction-coords.ts` — DIR_*, DIR_TO_DX, DIR_TO_DY, MoveCoords helpers

---

## Écarts détectés

### ERREUR E3.1 — PlayerStep : bike/surf/underwater non implémenté

**Décomp** : `PlayerStep` (field_player_avatar.c:332) dispatche selon `runningState` :
- `MovePlayerNotOnBike` — walk normal (✅ implémenté)
- `MovePlayerOnBike` — bike 2× speed + bike sprites (❌ absent)
- `MovePlayerOnSurf` — surf with water effects (❌ absent)
- `gPlayerAvatar.invincible` — post-battle invincibility timer (❌ absent)

**Web** : seul le walk normal + dashing est implémenté. Les flags `PLAYER_AVATAR_FLAG_SURFING`, `PLAYER_AVATAR_FLAG_WATERING` non supportés.

**Impact** : pas de vélo (Route 113+), pas de surf (water routes), invincibilité post-battle manquante.

**Fichiers** : `src/engine/player-avatar.ts`
**Criticité** : MEDIUM — bloque la progression du jeu (routes, water routes)

### ERREUR E3.2 — Camera : sFieldCameraOffset circular buffer partiel

**Décomp** : `CameraUpdate` (field_camera.c:360-426) fait :
1. Set movementSpeedX/Y depuis player
2. AddCameraTileOffset si tile boundary crossed
3. RedrawMapSlice* dans la direction du scroll
4. AddCameraPixelOffset(speedX, speedY)
5. gTotalCameraPixelOffsetX/Y -= speed
6. FieldUpdateBgTilemapScroll → REG_BGxHOFS/VOFS

**Web** : implémente les 6 étapes. Circular buffer 32x32 ✅. DrawWholeMapView ✅.
**MAIS** : `gCamera.movementSpeedX/Y` n'est pas persisté correctement entre les frames lors des warps (le pending warp reset la camera).

**Fichiers** : `src/engine/field-camera.ts`, `src/scenes/TestOverworldScene.ts`
**Criticité** : MEDIUM — le camera snap après warp n'est pas smooth (camera reste figée pendant le warp fade)

### ERREUR E3.3 — Map : DrawMetatile layer handling correct mais pas de screen effects

**Décomp** : `DrawMetatile` (field_camera.c:526-633) gère 3 layers :
- NORMAL → BG2 (bottom) + BG1 (top)
- COVERED → BG3 (bottom) + BG2 (top)
- SPLIT → BG3 (bottom) + BG1 (top)

**Web** : les 3 layers sont implémentés ✅.

**Manquant** :
- `DrawWholeMapView` ne fait pas les screen fade effects (le décomp gère le fade in/out progressif pendant le draw)
- Pas de `SaveMapView` / `RestoreMapView` pour les transitions entre connections

**Impact** : les map transitions fonctionnent mais sans le screen effect progressif (fade in du draw au lieu d'un flash instantané).

**Criticité** : LOW — fonctionnel mais pas visuellement 1:1

### ERREUR E3.4 — Map : border handling + connections partielles

**Décomp** : `DrawWholeMapView` (field_camera.c:635-721) inclut :
- `MapPosToBgTilemapOffset` pour la circular buffer math
- `GetIncomingConnection` pour chaque bord de map (N/S/E/W)
- `IsCoordInsideObjectEventMovementRange` pour les NPC spawn bounds
- `gMapHeader.layoutId → MapLayout` resolution

**Web** :
- Layout resolution ✅
- GetIncomingConnection ✅ (partiel — gère les 4 bords mais pas le fallback connection)
- IsCoordInsideObjectEventMovementRange ❌ absent → les NPCs peuvent spawn hors des bounds de mouvement

**Impact** : les NPCs avec un spawn point en dehors de leur movement range ne sont pas clippés correctement.

**Fichiers** : `src/engine/map-loader.ts`
**Criticité** : LOW — les maps standards ont les NPCs dans les bounds; les edge cases (grands maps, connections) peuvent avoir des NPCs OOB

### ERREUR E3.5 — Player collision : directionnellement impassable correct ✅

**Décomp** : `GetCollisionAtCoords` (event_object_movement.c:4658) check :
1. IsCoordOutsideObjectEventMovementRange
2. MapGridGetCollisionAt
3. GetMapBorderIdAt == CONNECTION_INVALID
4. IsMetatileDirectionallyImpassable
5. IsElevationMismatchAt
6. DoesObjectCollideWithObjectAt

**Web** : les 6 checks sont implémentés ✅.
- Outside range : skipped pour player (correct, player n'a pas de movement range)
- MapGridGetCollisionAt ✅
- CONNECTION_INVALID ❌ — pas checké dans `checkPlayerCollision`. Si le border tile retourne CONNECTION_INVALID (edge de map), le player pourrait sortir.
- IsMetatileDirectionallyImpassable ✅
- IsElevationMismatchAt ✅ (avec ELEVATION_TRANSITION fix)
- DoesObjectCollideWithObjectAt ✅

**Fichiers** : `src/engine/player-avatar.ts`
**Criticité** : MEDIUM — `GetMapBorderIdAt == CONNECTION_INVALID` manquant → player peut potentiellement sortir des maps sans border défini

### ERREUR E3.6 — Player : collide anim + wall sound partiel

**Décomp** : `PlayerNotOnBikeCollide` (field_player_avatar.c:882) :
- `WalkInPlaceSlow` — 32 frames cycle, bump anim ralentie
- `PlayCollisionSoundIfNotFacingWarp` — SE_WALL_HIT si pas sur arrow warp tile
- `sArrowWarpMetatileBehaviorChecks[direction-1]` — skip SE si arrow warp

**Web** :
- WalkInPlaceSlow ✅ (collideFramesLeft 32→1)
- SE_WALL_HIT ✅ (lignes 585-599)
- Arrow warp skip ✅ (isArrowWarpMetatileBehavior)
- Door bump skip ✅ (IsWarpDoor)

**Criticité** : ✅ CORRECT — pas d'erreur ici

### ERREUR E3.7 — Object events : COUNT = 16 correct mais pas de LOCALID_FISHING

**Décomp** : gObjectEvents a 16 entries. Les LOCALID incluent :
- LOCALID_PLAYER = 0x64 (100)
- LOCALID_FISHING = 0x65 (101) — fishing rod effect
- LOCALID_BERRY_GLASSES = 0x66 (102) — berry picking glasses effect
- LOCALID_103 = 0x67 (103) — reserved

**Web** : 16 entries ✅. LOCALID_PLAYER ✅. LOCALID_FISHING/BERRY_GLASSES ❌.

**Impact** : pas de fishing rod effect ni berry picking glasses.

**Criticité** : LOW — hors scope MVP, post-overworld

### ERREUR E3.8 — Object events : movement types manquants

**Décomp** : ~30 movement types :
- LOOK_AROUND ✅
- WANDER ✅
- WANDER_UP_AND_DOWN ❌ — wander only up/down
- WANDER_LEFT_AND_RIGHT ❌ — wander only left/right
- LOOK_DOWN_AND_UP ❌
- LOOK_LEFT_AND_RIGHT ❌
- LOOK_DOWN_LEFT_RIGHT ❌
- LOOK_UP_LEFT_RIGHT ❌
- WALK_IN_PLACE_NORMAL_* ❌ — face animation sans mouvement
- FACE_PLAYER ❌ — NPC face player on interact (distinct de faceplayer opcode)
- JUMP_AROUND ❌ — NPC jump animation
- WAVE ❌ — NPC wave animation
- HOLD_FISHING_ROD ❌ — fishing NPC animation
- SLIDE_AND_STAND_STILL ❌ — slide then stand
- RUN_IN_CIRCLE_FEROCIOUSLY ❌ — battle arena NPC

**Web** : implémente LOOK_AROUND, WANDER, FACE_DOWN/UP/LEFT/RIGHT, et WALK_NORMAL.

**Impact** : les NPCs avec les movement types avancés restent statiques au lieu de faire leur animation spécifique.

**Fichiers** : `src/engine/object-events.ts`
**Criticité** : MEDIUM — les NPCs avec WANDER_UP_AND_DOWN ou LOOK_DOWN_AND_UP ne bougent pas → comportement NPC incorrect

### ERREUR E3.9 — Object events : pas de object event collision entre NPCs

**Décomp** : `DoesObjectCollideWithObjectAt` check player contre NPCs ✅, mais aussi NPC↔NPC collision pour les scripted movements.

**Web** : seul player↔NPC collision checké. NPC↔NPC collision ❌.

**Impact** : les scripted movements (applymovement) peuvent chevaucher d'autres NPCs.

**Criticité** : LOW — impacte principalement les scripted movements avancés (intro cinematics, gym battles)

### ERREUR E3.10 — Warp : 7 warp kinds corrects mais pas de warphole/warpteleport

**Décomp** :
- Step warp ✅ (door/exit)
- Door warp ✅ (animated)
- Arrow warp ✅ (directional)
- Ladder warp ✅
- Fall warp ✅ (cracked floor)
- Teleport warp ✅ (aqua hideout)
- Escalator warp ✅

**Web** : les 7 warp kinds sont implémentés ✅.

**Manquant** :
- `warphole` (ScrCmd_warphole) — warp travers un trou au sol (differ de fall par la dest map)
- `warpteleport` (ScrCmd_warpteleport) — roamer teleport
- `warpmossdeepgym` — gym spécial Mossdeep
- `setwarp` — set warp destination dynamiquement

**Impact** : les roamers ne peuvent pas être teleportés, le gym Mossdeep n'est pas accessible via son warp spécial.

**Fichiers** : `src/engine/warp-system.ts`
**Criticité** : MEDIUM — limite la navigation dans le jeu (roamers, gym mossdeep)

### ERREUR E3.11 — Door animation : partiel mais fonctionnel

**Décomp** : `field_door.c` (2200+ lignes) gère :
- 50+ door graphics entries
- 5 frames d'ouverture, 4 ticks chacune
- Door sound effect par type
- CopyDoorTilesToVram avec palette + tile swap
- FieldCB_DoDoorWarpExit / FieldCB_ExitDoor callbacks

**Web** :
- Door catalog lookup ✅
- Door tile preload ✅
- FieldAnimateDoorOpen ✅ (3 frames, 4 ticks/frame = 1:1)
- FieldAnimateDoorClose ✅
- GetDoorSoundEffect ✅
- FieldSetDoorOpened ✅
- FieldCB callbacks ❌ — les door warp exit callbacks ne sont pas 1:1 avec le décomp (simplifiés)

**Impact** : les portes s'ouvrent et se ferment correctement mais le callback exit n'est pas fidèle au décomp.

**Criticité** : LOW — fonctionnel, pas 1:1 mais acceptable

### ERREUR E3.12 — Movement system : scripted movement correct pour les basics

**Décomp** : `script_movement.c` (~150 MovementAction_*_Step* functions).

**Web** : `movement-system.ts` + `movement-action-dispatch.ts` implémentent :
- WalkNormal ✅
- FaceDir ✅
- RunUp/Down/Left/Right ❌ — run movement actions (différentes de walk)
- JumpShort/JumpHigh/JumpFar ❌ — jump movements
- Bounce ❌
- Hop ✅ (partiel — direction only, pas de bounce height)
- MoveToPos ✅
- Shake ❌
- Spin ❌
- QuakeHead ❌
- ShrinkSlow ❌
- GrowSlow ❌
- HoldFishingRod ❌
- ShrinkFast ❌
- GrowFast ❌
- FloatUp ❌
- FloatDown ❌
- TeleportTo ❌
- TeleportFrom ❌
- FlyAway ❌
- HopTo ❌
- HopToFast ❌
- BounceTo ❌
- JumpTo ❌
- JumpUpDown ❌
- FloatUpTo ❌
- FloatDownTo ❌
- MoveFromPlayer ❌
- MoveToPlayer ❌
- HopInPlace ❌
- FloatUpInPlace ❌
- GrowHopTo ❌
- ShrinkHopTo ❌
- MoveToSlow ❌
- RunInPlace ❌
- MoveToPlayerFast ❌
- MoveFromPlayerFast ❌
- HopInPlaceFast ❌
- HopInPlaceVeryFast ❌
- HopToVeryFast ❌
- HopToFastTo ❌
- BounceToFast ❌
- JumpUpDownTo ❌
- BounceInPlace ❌

**Web** : ~15 actions implémentées sur ~50 décomp.

**Impact** : les scripted movements basiques (walk, face, move_to_pos) fonctionnent pour les dialogues de maison. Les mouvements avancés (jump, bounce, teleport, shrink, grow, fly) ne fonctionnent pas.

**Fichiers** : `src/engine/movement-system.ts`
**Criticité** : MEDIUM — impacte les scripted cinematics (Birch PC, truck intro, rival battle, gym intros)

### ERREUR E3.13 — Field effects : tall grass + shadow + dust implémentés

**Décomp** : `field_effect.c` + `field_effect_helpers.c` gèrent :
- Tall grass effect ✅
- Jump landing dust ✅
- Shadow sprites ✅
- Arrow warp sprites ✅
- Grass sway effect ✅ (partiel)
- Dust cloud effect ❌ — dust quand on marche sur sand/dirt
- Leaf flutter effect ❌
- Sparkle effect ❌
- Heal bubbles ❌
- Misty effect ❌
- Mud shot effect ❌
- Puddle splash ❌
- Berry tree effect ❌
- Rocksmash dust ❌
- Cut grass effect ❌
- Strength carry effect ❌

**Web** : tall grass, jump dust, shadow, arrow warp ✅. Les autres effects ❌.

**Impact** : pas de visual feedback pour sand/dirt walking, leaf flutter, etc.

**Criticité** : LOW — les effects sont cosmétiques, pas critiques pour la navigation

### ERREUR E3.14 — Tileset animations : partiel

**Décomp** : `tileset_anims.c` gère :
- `InitTilesetAnimations` ✅
- `UpdateTilesetAnimations` ✅
- `TransferTilesetAnimsBuffer` ✅
- Wave animation (water) ✅
- Grass sway ✅ (partiel)
- Lamp glow ❌
- Elevator panel ❌
- TV screen ❌

**Web** : l'infrastructure tileset anim est en place ✅ mais seulement l'eau et l'herbe basique sont animées.

**Impact** : les animations de lampes, ascenseurs, écrans TV ne sont pas animées.

**Criticité** : LOW — cosmétique

### ERREUR E3.15 — Coord event scripts : correct mais pas de OnTransition complet

**Décomp** : les coord events sont dispatchés via `ProcessPlayerCoordEvent` (field_control_avatar.c) :
- OnTransition (map enter) ✅
- OnTransition2 (secondary enter) ✅
- OnFrame (per-frame check) ✅ (partiel — pas tous les triggers)
- OnStep (per-step check) ✅ (partiel)
- OnAButton (A button interact) ✅
- OnBButton (B button interact) ❌ — B button triggers

**Web** : OnTransition ✅, OnFrame ✅ (partiel), OnAButton ✅. OnBButton ❌.

**Impact** : les coord triggers B button (rarity check, exit sign, etc.) ne fonctionnent pas.

**Fichiers** : `src/engine/script-runtime.ts`
**Criticité** : MEDIUM — les B button triggers sont utilisés pour la machine à sous, les signes de sortie, etc.

---

## Résumé passage 3

| ID     | Type        | Criticité | Description courte                                          |
|--------|-------------|---------|-----------------------------------------------------------|
| E3.1   | Manquant    | MEDIUM  | Bike/surf/underwater player movement                      |
| E3.2   | Incohérent  | MEDIUM  | Camera snap post-warp (speed persist missing)              |
| E3.3   | Partiel     | LOW     | DrawWholeMapView screen fade effects                      |
| E3.4   | Partiel     | LOW     | NPC movement range bounds check absent                    |
| E3.5   | Partiel     | MEDIUM  | CONNECTION_INVALID border check manquant dans collision    |
| E3.6   | ✅ CORRECT  | —       | Player collide anim + wall sound                          |
| E3.7   | Manquant    | LOW     | LOCALID_FISHING/BERRY_GLASSES                             |
| E3.8   | Manquant    | MEDIUM  | ~20 movement types NPCs absents (WANDER_UP_AND_DOWN, etc.) |
| E3.9   | Manquant    | LOW     | NPC↔NPC collision                                         |
| E3.10  | Manquant    | MEDIUM  | Warphole/teleport/gym warps + setwarp                     |
| E3.11  | Partiel     | LOW     | Door callbacks exit simplifiés                            |
| E3.12  | Manquant    | MEDIUM  | ~35/50 scripted movement actions absents                  |
| E3.13  | Manquant    | LOW     | ~12/16 field effects absents                              |
| E3.14  | Partiel     | LOW     | ~3/6 tileset animations absents                           |
| E3.15  | Manquant    | MEDIUM  | OnBButton coord triggers                                  |

**Coverture globale overworld** :
- Player movement : ~60% (walk ✅, run ✅, bike ❌, surf ❌, collision ~85%)
- Camera : ~80% (scrolling, tilemap, circular buffer ✅, post-warp smooth ❌)
- Map loading : ~70% (tilesets, palettes, layout ✅, connections partielles)
- NPCs : ~40% (spawn ✅, basic movement ✅, advanced movement types ❌, NPC↔NPC ❌)
- Warps : ~70% (7/7 warp kinds ✅, variants ❌)
- Doors : ~75% (anim ✅, sound ✅, exit callbacks partiel)
- Scripted movement : ~30% (15/50 actions implémentées)
- Field effects : ~25% (tall grass ✅, shadow ✅, ~12 effects ❌)
- Tileset animations : ~50% (water/grass ✅, lamp/TV/elevator ❌)

**Fort** : le path critique walk/collide/warp/door est fidèle au décomp. La camera et le tilemap sont corrects.
**Faible** : les features avancées (bike, surf, scripted movement, NPC movement types) sont significativement incomplètes.

**Priorité correction** : E3.1 (bike/surf — progression), E3.10 (warp variants — navigation), E3.8 (NPC movement — behavior), E3.12 (scripted movement — cinematics), E3.5 (collision completeness).
