# GraniteCave_B2F

## Métadonnées
- **id** : `MAP_GRANITE_CAVE_B2F`
- **layout** : `LAYOUT_GRANITE_CAVE_B2F`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_GRANITE_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 4,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `GraniteCave_B2F_EventScript_ItemRepel` | `FLAG_ITEM_GRANITE_CAVE_B2F_REPEL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 29,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `GraniteCave_B2F_EventScript_ItemRareCandy` | `FLAG_ITEM_GRANITE_CAVE_B2F_RARE_CANDY` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 5,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 3,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 2,16 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 7,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 4,22 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 6,22 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 3,21 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_17` |

## Warps (5)
- #0 (29,13) → `MAP_GRANITE_CAVE_B1F` warp #2
- #1 (28,21) → `MAP_GRANITE_CAVE_B1F` warp #3
- #2 (8,5) → `MAP_GRANITE_CAVE_B1F` warp #4
- #3 (12,3) → `MAP_GRANITE_CAVE_B1F` warp #5
- #4 (29,2) → `MAP_GRANITE_CAVE_B1F` warp #6

## BG events / signs (2)
- (28,6) [hidden_item] → ``
- (15,11) [hidden_item] → ``
