# ArtisanCave_B1F

## Métadonnées
- **id** : `MAP_ARTISAN_CAVE_B1F`
- **layout** : `LAYOUT_ARTISAN_CAVE_B1F`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_ARTISAN_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 32,38 | `MOVEMENT_TYPE_LOOK_AROUND` | `ArtisanCave_B1F_EventScript_ItemHPUp` | `FLAG_ITEM_ARTISAN_CAVE_B1F_HP_UP` |

## Warps (2)
- #0 (8,48) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #10
- #1 (38,5) → `MAP_ARTISAN_CAVE_1F` warp #1

## BG events / signs (4)
- (32,29) [hidden_item] → ``
- (27,8) [hidden_item] → ``
- (7,5) [hidden_item] → ``
- (19,43) [hidden_item] → ``

## Flags référencés (1)
- `FLAG_LANDMARK_ARTISAN_CAVE`

## Scripts (2)
### ArtisanCave_B1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, ArtisanCave_B1F_OnTransition
```
### ArtisanCave_B1F_OnTransition
```
setflag FLAG_LANDMARK_ARTISAN_CAVE
end
```
