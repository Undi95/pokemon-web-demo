# LilycoveCity_House4

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_HOUSE4`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_4` | 1,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_House4_EventScript_Man1` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_1` | 7,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_House4_EventScript_Man2` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_LILYCOVE_CITY` warp #11
- #1 (4,8) → `MAP_LILYCOVE_CITY` warp #11

## Scripts (2)
### LilycoveCity_House4_EventScript_Man1
```
msgbox LilycoveCity_House4_Text_MysteriesAtBottomOfSea, MSGBOX_NPC
end
```
### LilycoveCity_House4_EventScript_Man2
```
msgbox LilycoveCity_House4_Text_UnderwaterTrenchMossdeepSootopolis, MSGBOX_NPC
end
```

## Textes (2)
### LilycoveCity_House4_Text_MysteriesAtBottomOfSea
```
Les plus grands mystères de cette\nplanète se trouvent au fond de l'océan.\pQuelqu'un a dit ça, mais j'sais plus qui…$
```
### LilycoveCity_House4_Text_UnderwaterTrenchMossdeepSootopolis
```
Il y a un abîme tout au fond de l'eau,\nentre ALGATIA et ATALANOPOLIS.\pEn tout cas, c'est ce qu'on m'a dit.$
```
