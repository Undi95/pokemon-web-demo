# UnionRoom

## Métadonnées
- **id** : `MAP_UNION_ROOM`
- **layout** : `LAYOUT_UNION_ROOM`
- **music** : `MUS_EVER_GRANDE`
- **region_map_section** : `MAPSEC_DYNAMIC`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_FRONTIER`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_UNION_ROOM_NURSE` | 3,2 | `MOVEMENT_TYPE_FACE_DOWN` | `UnionRoom_EventScript_Attendant` | `0` |
| `LOCALID_UNION_ROOM_PLAYER_4` | `OBJ_EVENT_GFX_VAR_3` | 1,8 | `MOVEMENT_TYPE_WANDER_AROUND` | `UnionRoom_EventScript_Player4` | `FLAG_HIDE_UNION_ROOM_PLAYER_4` |
| `LOCALID_UNION_ROOM_PLAYER_8` | `OBJ_EVENT_GFX_VAR_7` | 7,8 | `MOVEMENT_TYPE_WANDER_AROUND` | `UnionRoom_EventScript_Player8` | `FLAG_HIDE_UNION_ROOM_PLAYER_8` |
| `LOCALID_UNION_ROOM_PLAYER_7` | `OBJ_EVENT_GFX_VAR_6` | 1,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `UnionRoom_EventScript_Player7` | `FLAG_HIDE_UNION_ROOM_PLAYER_7` |
| `LOCALID_UNION_ROOM_PLAYER_6` | `OBJ_EVENT_GFX_VAR_5` | 7,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `UnionRoom_EventScript_Player6` | `FLAG_HIDE_UNION_ROOM_PLAYER_6` |
| `LOCALID_UNION_ROOM_PLAYER_5` | `OBJ_EVENT_GFX_VAR_4` | 13,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `UnionRoom_EventScript_Player5` | `FLAG_HIDE_UNION_ROOM_PLAYER_5` |
| `LOCALID_UNION_ROOM_PLAYER_3` | `OBJ_EVENT_GFX_VAR_2` | 10,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `UnionRoom_EventScript_Player3` | `FLAG_HIDE_UNION_ROOM_PLAYER_3` |
| `LOCALID_UNION_ROOM_PLAYER_2` | `OBJ_EVENT_GFX_VAR_1` | 13,8 | `MOVEMENT_TYPE_WANDER_AROUND` | `UnionRoom_EventScript_Player2` | `FLAG_HIDE_UNION_ROOM_PLAYER_2` |
| `LOCALID_UNION_ROOM_PLAYER_1` | `OBJ_EVENT_GFX_VAR_0` | 4,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `UnionRoom_EventScript_Player1` | `FLAG_HIDE_UNION_ROOM_PLAYER_1` |

## Warps (2)
- #0 (7,11) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #1 (8,11) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC

## Flags référencés (8)
- `FLAG_HIDE_UNION_ROOM_PLAYER_1`
- `FLAG_HIDE_UNION_ROOM_PLAYER_2`
- `FLAG_HIDE_UNION_ROOM_PLAYER_3`
- `FLAG_HIDE_UNION_ROOM_PLAYER_4`
- `FLAG_HIDE_UNION_ROOM_PLAYER_5`
- `FLAG_HIDE_UNION_ROOM_PLAYER_6`
- `FLAG_HIDE_UNION_ROOM_PLAYER_7`
- `FLAG_HIDE_UNION_ROOM_PLAYER_8`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (13)
### UnionRoom_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, UnionRoom_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, UnionRoom_OnTransition
```
### UnionRoom_OnResume
```
setflag FLAG_HIDE_UNION_ROOM_PLAYER_1
setflag FLAG_HIDE_UNION_ROOM_PLAYER_2
setflag FLAG_HIDE_UNION_ROOM_PLAYER_3
setflag FLAG_HIDE_UNION_ROOM_PLAYER_4
setflag FLAG_HIDE_UNION_ROOM_PLAYER_5
setflag FLAG_HIDE_UNION_ROOM_PLAYER_6
setflag FLAG_HIDE_UNION_ROOM_PLAYER_7
setflag FLAG_HIDE_UNION_ROOM_PLAYER_8
removeobject LOCALID_UNION_ROOM_PLAYER_1
removeobject LOCALID_UNION_ROOM_PLAYER_2
removeobject LOCALID_UNION_ROOM_PLAYER_3
removeobject LOCALID_UNION_ROOM_PLAYER_4
removeobject LOCALID_UNION_ROOM_PLAYER_5
removeobject LOCALID_UNION_ROOM_PLAYER_6
removeobject LOCALID_UNION_ROOM_PLAYER_7
removeobject LOCALID_UNION_ROOM_PLAYER_8
special RunUnionRoom
end
```
### UnionRoom_OnTransition
```
end
```
### UnionRoom_EventScript_Player1
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_PLAYER_1
waitstate
release
end
```
### UnionRoom_EventScript_Player2
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_PLAYER_2
waitstate
release
end
```
### UnionRoom_EventScript_Player3
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_PLAYER_3
waitstate
release
end
```
### UnionRoom_EventScript_Player4
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_PLAYER_4
waitstate
release
end
```
### UnionRoom_EventScript_Player5
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_PLAYER_5
waitstate
release
end
```
### UnionRoom_EventScript_Player6
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_PLAYER_6
waitstate
release
end
```
### UnionRoom_EventScript_Player7
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_PLAYER_7
waitstate
release
end
```
### UnionRoom_EventScript_Player8
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_PLAYER_8
waitstate
release
end
```
### UnionRoom_EventScript_Attendant
```
lock
faceplayer
setvar VAR_RESULT, UR_INTERACT_ATTENDANT
waitstate
release
end
```
### UnionRoom_EventScript_Unused
```
lockall
setvar VAR_RESULT, UR_INTERACT_UNUSED
waitstate
releaseall
end
```
