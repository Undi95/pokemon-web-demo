# LavaridgeTown_House

## Métadonnées
- **id** : `MAP_LAVARIDGE_TOWN_HOUSE`
- **layout** : `LAYOUT_HOUSE3`
- **music** : `MUS_OLDALE`
- **region_map_section** : `MAPSEC_LAVARIDGE_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 2,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `LavaridgeTown_House_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_ZIGZAGOON_2` | 6,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `LavaridgeTown_House_EventScript_Zigzagoon` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 8,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `LavaridgeTown_House_EventScript_MimicTutor` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_LAVARIDGE_TOWN` warp #4
- #1 (4,7) → `MAP_LAVARIDGE_TOWN` warp #4

## Scripts (2)
### LavaridgeTown_House_EventScript_OldMan
```
msgbox LavaridgeTown_House_Text_WifeWarmingEggInHotSprings, MSGBOX_NPC
end
```
### LavaridgeTown_House_EventScript_Zigzagoon
```
lock
faceplayer
waitse
playmoncry SPECIES_ZIGZAGOON, CRY_MODE_NORMAL
msgbox LavaridgeTown_House_Text_Zigzagoon, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (2)
### LavaridgeTown_House_Text_WifeWarmingEggInHotSprings
```
Ma femme tente de faire éclore un OEUF\ndans les sources chaudes. Elle\lvient de me le dire.\pElle a laissé deux POKéMON à la PENSION.\nEt ils ont découvert cet OEUF!$
```
### LavaridgeTown_House_Text_Zigzagoon
```
ZIGZATON: Zigzaaa!$
```
