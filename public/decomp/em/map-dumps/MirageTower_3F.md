# MirageTower_3F

## Métadonnées
- **id** : `MAP_MIRAGE_TOWER_3F`
- **layout** : `LAYOUT_MIRAGE_TOWER_3F`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_MIRAGE_TOWER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 3,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 4,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_12` |

## Warps (2)
- #0 (18,12) → `MAP_MIRAGE_TOWER_2F` warp #0
- #1 (2,4) → `MAP_MIRAGE_TOWER_4F` warp #0

## Scripts (2)
### MirageTower_3F_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, CaveHole_CheckFallDownHole
map_script MAP_SCRIPT_ON_TRANSITION, CaveHole_FixCrackedGround
map_script MAP_SCRIPT_ON_RESUME, MirageTower_3F_SetHoleWarp
```
### MirageTower_3F_SetHoleWarp
```
setstepcallback STEP_CB_CRACKED_FLOOR
setholewarp MAP_MIRAGE_TOWER_2F
end
```
