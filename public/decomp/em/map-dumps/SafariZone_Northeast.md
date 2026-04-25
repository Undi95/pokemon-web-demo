# SafariZone_Northeast

## Métadonnées
- **id** : `MAP_SAFARI_ZONE_NORTHEAST`
- **layout** : `LAYOUT_SAFARI_ZONE_NORTHEAST`
- **music** : `MUS_SAFARI_ZONE`
- **region_map_section** : `MAPSEC_SAFARI_ZONE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_SAFARI_ZONE_NORTH`
- down (offset 0) → `MAP_SAFARI_ZONE_SOUTHEAST`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BOY_3` | 8,20 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_Northeast_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 30,22 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_Northeast_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 11,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 13,35 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_Northeast_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 8,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 9,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 8,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 12,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 8,17 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_Northeast_EventScript_ItemNugget` | `FLAG_ITEM_SAFARI_ZONE_NORTH_EAST_NUGGET` |

## BG events / signs (2)
- (31,35) [hidden_item] → ``
- (21,5) [hidden_item] → ``
