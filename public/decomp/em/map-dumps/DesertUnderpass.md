# DesertUnderpass

## Métadonnées
- **id** : `MAP_DESERT_UNDERPASS`
- **layout** : `LAYOUT_DESERT_UNDERPASS`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_DESERT_UNDERPASS`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_UNDERPASS_FOSSIL` | `OBJ_EVENT_GFX_FOSSIL` | 132,10 | `MOVEMENT_TYPE_FACE_DOWN` | `DesertUnderpass_EventScript_Fossil` | `FLAG_HIDE_DESERT_UNDERPASS_FOSSIL` |

## Warps (1)
- #0 (10,12) → `MAP_ROUTE114_FOSSIL_MANIACS_TUNNEL` warp #2

## Flags référencés (3)
- `FLAG_CHOSE_CLAW_FOSSIL`
- `FLAG_CHOSE_ROOT_FOSSIL`
- `FLAG_LANDMARK_DESERT_UNDERPASS`

## Scripts (5)
### DesertUnderpass_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, DesertUnderpass_OnTransition
```
### DesertUnderpass_OnTransition
```
setflag FLAG_LANDMARK_DESERT_UNDERPASS
end
```
### DesertUnderpass_EventScript_Fossil
```
lock
faceplayer
goto_if_set FLAG_CHOSE_ROOT_FOSSIL, DesertUnderpass_EventScript_GiveClawFossil
goto_if_set FLAG_CHOSE_CLAW_FOSSIL, DesertUnderpass_EventScript_GiveRootFossil
release
end
```
### DesertUnderpass_EventScript_GiveClawFossil
```
giveitem ITEM_CLAW_FOSSIL
removeobject LOCALID_UNDERPASS_FOSSIL
release
end
```
### DesertUnderpass_EventScript_GiveRootFossil
```
giveitem ITEM_ROOT_FOSSIL
removeobject LOCALID_UNDERPASS_FOSSIL
release
end
```

## Textes (2)
### DesertUnderpass_Text_FoundRootFossil
```
{PLAYER} found the ROOT FOSSIL.$
```
### DesertUnderpass_Text_FoundClawFossil
```
{PLAYER} found the CLAW FOSSIL.$
```
