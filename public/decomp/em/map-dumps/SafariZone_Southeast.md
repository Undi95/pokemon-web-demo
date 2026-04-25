# SafariZone_Southeast

## Métadonnées
- **id** : `MAP_SAFARI_ZONE_SOUTHEAST`
- **layout** : `LAYOUT_SAFARI_ZONE_SOUTHEAST`
- **music** : `MUS_SAFARI_ZONE`
- **region_map_section** : `MAPSEC_SAFARI_ZONE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_SAFARI_ZONE_SOUTH`
- up (offset 0) → `MAP_SAFARI_ZONE_NORTHEAST`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_RICH_BOY` | 7,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_Southeast_EventScript_RichBoy` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 20,30 | `MOVEMENT_TYPE_WANDER_AROUND` | `SafariZone_Southeast_EventScript_FatMan` | `0` |
| `` | `OBJ_EVENT_GFX_LITTLE_GIRL` | 8,26 | `MOVEMENT_TYPE_WANDER_AROUND` | `SafariZone_Southeast_EventScript_LittleGirl` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 31,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_Southeast_EventScript_ItemBigPearl` | `FLAG_ITEM_SAFARI_ZONE_SOUTH_EAST_BIG_PEARL` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 12,16 | `MOVEMENT_TYPE_FACE_LEFT` | `SafariZone_Southeast_EventScript_ExpansionZoneAttendant` | `FLAG_HIDE_SAFARI_ZONE_SOUTH_EAST_EXPANSION` |

## BG events / signs (2)
- (19,36) [hidden_item] → ``
- (32,33) [hidden_item] → ``
