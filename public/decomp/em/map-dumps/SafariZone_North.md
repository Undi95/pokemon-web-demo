# SafariZone_North

## Métadonnées
- **id** : `MAP_SAFARI_ZONE_NORTH`
- **layout** : `LAYOUT_SAFARI_ZONE_NORTH`
- **music** : `MUS_SAFARI_ZONE`
- **region_map_section** : `MAPSEC_SAFARI_ZONE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_SAFARI_ZONE_NORTHWEST`
- down (offset 0) → `MAP_SAFARI_ZONE_SOUTH`
- right (offset 0) → `MAP_SAFARI_ZONE_NORTHEAST`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 22,9 | `MOVEMENT_TYPE_WANDER_AROUND` | `SafariZone_North_EventScript_Fisherman` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 6,29 | `MOVEMENT_TYPE_WANDER_AROUND` | `SafariZone_North_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 25,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 25,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 28,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 23,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 20,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 27,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 7,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_North_EventScript_ItemCalcium` | `FLAG_ITEM_SAFARI_ZONE_NORTH_CALCIUM` |

## Scripts (2)
### SafariZone_North_EventScript_Fisherman
```
msgbox SafariZone_North_Text_Fisherman, MSGBOX_NPC
end
```
### SafariZone_North_EventScript_Man
```
msgbox SafariZone_North_Text_Man, MSGBOX_NPC
end
```
