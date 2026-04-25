# GraniteCave_B1F

## Métadonnées
- **id** : `MAP_GRANITE_CAVE_B1F`
- **layout** : `LAYOUT_GRANITE_CAVE_B1F`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_GRANITE_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 15,21 | `MOVEMENT_TYPE_LOOK_AROUND` | `GraniteCave_B1F_EventScript_ItemPokeBall` | `FLAG_ITEM_GRANITE_CAVE_B1F_POKE_BALL` |

## Warps (7)
- #0 (25,13) → `MAP_GRANITE_CAVE_1F` warp #1
- #1 (4,21) → `MAP_GRANITE_CAVE_1F` warp #2
- #2 (29,13) → `MAP_GRANITE_CAVE_B2F` warp #0
- #3 (28,21) → `MAP_GRANITE_CAVE_B2F` warp #1
- #4 (8,5) → `MAP_GRANITE_CAVE_B2F` warp #2
- #5 (12,3) → `MAP_GRANITE_CAVE_B2F` warp #3
- #6 (29,2) → `MAP_GRANITE_CAVE_B2F` warp #4

## Scripts (2)
### GraniteCave_B1F_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, CaveHole_CheckFallDownHole
map_script MAP_SCRIPT_ON_TRANSITION, CaveHole_FixCrackedGround
map_script MAP_SCRIPT_ON_RESUME, GraniteCave_B1F_SetHoleWarp
```
### GraniteCave_B1F_SetHoleWarp
```
setstepcallback STEP_CB_CRACKED_FLOOR
setholewarp MAP_GRANITE_CAVE_B2F
end
```
