# BattleFrontier_BattlePikeRoomWildMons

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_WILD_MONS`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_WILD_MONS`
- **music** : `MUS_B_PIKE`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Coord events / triggers (7)
- (4,3) → `BattleFrontier_BattlePikeRoomWildMons_EventScript_Exit` (si `VAR_TEMP_1` == `0`)
- (3,18) → `BattleFrontier_BattlePikeRoomWildMons_EventScript_SetEnteredRoom` (si `VAR_TEMP_2` == `0`)
- (4,18) → `BattleFrontier_BattlePikeRoomWildMons_EventScript_SetEnteredRoom` (si `VAR_TEMP_2` == `0`)
- (5,18) → `BattleFrontier_BattlePikeRoomWildMons_EventScript_SetEnteredRoom` (si `VAR_TEMP_2` == `0`)
- (3,19) → `BattleFrontier_BattlePikeRoomWildMons_EventScript_NoTurningBack` (si `VAR_TEMP_3` == `1`)
- (4,19) → `BattleFrontier_BattlePikeRoomWildMons_EventScript_NoTurningBack` (si `VAR_TEMP_3` == `1`)
- (5,19) → `BattleFrontier_BattlePikeRoomWildMons_EventScript_NoTurningBack` (si `VAR_TEMP_3` == `1`)

## Variables référencées (4)
- `VAR_RESULT`
- `VAR_TEMP_0`
- `VAR_TEMP_1`
- `VAR_TEMP_4`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/battle_pike.inc
- `BattleFrontier_BattlePikeRoom_EventScript_ResetSketchedMoves`

## Scripts (8)
### BattleFrontier_BattlePikeRoomWildMons_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, BattleFrontier_BattlePikeRoomWildMons_OnResume
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattlePikeRoomWildMons_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, BattleFrontier_BattlePikeRoomWildMons_OnWarp
```
### BattleFrontier_BattlePikeRoomWildMons_OnFrame
```
map_script_2 VAR_TEMP_0, 0, BattleFrontier_BattlePikeRoomWildMons_EventScript_SetInWildMonRoom
map_script_2 VAR_TEMP_1, 1, BattleFrontier_BattlePikeRoomWildMons_EventScript_WarpToLobbyLost
```
### BattleFrontier_BattlePikeRoomWildMons_EventScript_SetInWildMonRoom
```
setvar VAR_TEMP_0, 1
pike_inwildmonroom
end
```
### BattleFrontier_BattlePikeRoomWildMons_EventScript_WarpToLobbyLost
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_LOST
warp MAP_BATTLE_FRONTIER_BATTLE_PIKE_LOBBY, 5, 6
waitstate
end
```
### BattleFrontier_BattlePikeRoomWildMons_OnWarp
```
map_script_2 VAR_TEMP_4, 0, BattleFrontier_BattlePikeRoomWildMons_EventScript_TurnPlayerNorth
```
### BattleFrontier_BattlePikeRoomWildMons_EventScript_TurnPlayerNorth
```
setvar VAR_TEMP_4, 1
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### BattleFrontier_BattlePikeRoomWildMons_OnResume
```
call BattleFrontier_BattlePikeRoom_EventScript_ResetSketchedMoves
frontier_get FRONTIER_DATA_BATTLE_OUTCOME
goto_if_eq VAR_RESULT, B_OUTCOME_LOST, BattleFrontier_BattlePikeRoomWildMons_EventScript_SetLost
goto_if_eq VAR_RESULT, B_OUTCOME_DREW, BattleFrontier_BattlePikeRoomWildMons_EventScript_SetLost
end
```
### BattleFrontier_BattlePikeRoomWildMons_EventScript_SetLost
```
setvar VAR_TEMP_1, 1
end
```
