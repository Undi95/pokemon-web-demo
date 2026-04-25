# Underwater_SeafloorCavern

## Métadonnées
- **id** : `MAP_UNDERWATER_SEAFLOOR_CAVERN`
- **layout** : `LAYOUT_UNDERWATER_SEAFLOOR_CAVERN`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_UNDERWATER_SEAFLOOR_CAVERN`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 5,4 | `MOVEMENT_TYPE_INVISIBLE` | `Underwater_SeafloorCavern_EventScript_CheckStolenSub` | `FLAG_HIDE_UNDERWATER_SEA_FLOOR_CAVERN_STOLEN_SUBMARINE` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 6,4 | `MOVEMENT_TYPE_INVISIBLE` | `Underwater_SeafloorCavern_EventScript_CheckStolenSub` | `FLAG_HIDE_UNDERWATER_SEA_FLOOR_CAVERN_STOLEN_SUBMARINE` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 7,4 | `MOVEMENT_TYPE_INVISIBLE` | `Underwater_SeafloorCavern_EventScript_CheckStolenSub` | `FLAG_HIDE_UNDERWATER_SEA_FLOOR_CAVERN_STOLEN_SUBMARINE` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 8,4 | `MOVEMENT_TYPE_INVISIBLE` | `Underwater_SeafloorCavern_EventScript_CheckStolenSub` | `FLAG_HIDE_UNDERWATER_SEA_FLOOR_CAVERN_STOLEN_SUBMARINE` |

## Warps (1)
- #0 (6,7) → `MAP_UNDERWATER_ROUTE128` warp #0

## Flags référencés (3)
- `FLAG_HIDE_UNDERWATER_SEA_FLOOR_CAVERN_STOLEN_SUBMARINE`
- `FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN`
- `FLAG_LANDMARK_SEAFLOOR_CAVERN`

## Scripts (7)
### Underwater_SeafloorCavern_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Underwater_SeafloorCavern_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Underwater_SeafloorCavern_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Underwater_SeafloorCavern_OnLoad
```
### Underwater_SeafloorCavern_OnTransition
```
setflag FLAG_LANDMARK_SEAFLOOR_CAVERN
goto_if_set FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN, Underwater_SeafloorCavern_EventScript_HideSubmarine
end
```
### Underwater_SeafloorCavern_EventScript_HideSubmarine
```
setflag FLAG_HIDE_UNDERWATER_SEA_FLOOR_CAVERN_STOLEN_SUBMARINE
end
```
### Underwater_SeafloorCavern_OnLoad
```
call_if_set FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN, Underwater_SeafloorCavern_EventScript_SetSubmarineGoneMetatiles
end
```
### Underwater_SeafloorCavern_EventScript_SetSubmarineGoneMetatiles
```
setmetatile 5, 3, METATILE_Underwater_RockWall, TRUE
setmetatile 6, 3, METATILE_Underwater_RockWall, TRUE
setmetatile 7, 3, METATILE_Underwater_RockWall, TRUE
setmetatile 8, 3, METATILE_Underwater_RockWall, TRUE
setmetatile 5, 4, METATILE_Underwater_FloorShadow, FALSE
setmetatile 6, 4, METATILE_Underwater_FloorShadow, FALSE
setmetatile 7, 4, METATILE_Underwater_FloorShadow, FALSE
setmetatile 8, 4, METATILE_Underwater_FloorShadow, FALSE
setmetatile 5, 5, METATILE_Underwater_FloorShadow, FALSE
setmetatile 6, 5, METATILE_Underwater_FloorShadow, FALSE
setmetatile 7, 5, METATILE_Underwater_FloorShadow, FALSE
setmetatile 8, 5, METATILE_Underwater_FloorShadow, FALSE
return
```
### Underwater_SeafloorCavern_OnResume
```
setdivewarp MAP_SEAFLOOR_CAVERN_ENTRANCE, 10, 17
end
```
### Underwater_SeafloorCavern_EventScript_CheckStolenSub
```
msgbox Underwater_SeafloorCavern_Text_SubExplorer1, MSGBOX_SIGN
end
```

## Textes (1)
### Underwater_SeafloorCavern_Text_SubExplorer1
```
Il est inscrit sur la coque:\n“SOUS-MARIN D'EXPLORATION 1”.\pC'est le sous-marin que la TEAM AQUA\na volé à POIVRESSEL!\pLa TEAM AQUA a dû venir\njusqu'à cette rive.$
```
