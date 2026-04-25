# SootopolisCity_House7

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_HOUSE7`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_HOUSE1`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 5,3 | `MOVEMENT_TYPE_FACE_LEFT` | `SootopolisCity_House7_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 1,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `SootopolisCity_House7_EventScript_PokefanF` | `0` |

## Warps (2)
- #0 (3,6) → `MAP_SOOTOPOLIS_CITY` warp #10
- #1 (4,6) → `MAP_SOOTOPOLIS_CITY` warp #10

## Scripts (2)
### SootopolisCity_House7_EventScript_OldMan
```
msgbox SootopolisCity_House7_Text_CityFromEruptedVolcano, MSGBOX_NPC
end
```
### SootopolisCity_House7_EventScript_PokefanF
```
msgbox SootopolisCity_House7_Text_CaveMadeToKeepSomething, MSGBOX_NPC
end
```

## Textes (2)
### SootopolisCity_House7_Text_CityFromEruptedVolcano
```
Un volcan immergé est entré en éruption\net remonté des profondeurs marines.\pSon cratère a émergé de la mer et\ns'est rempli d'eau de pluie.\pC'est ainsi que la ville d'ATALANOPOLIS\na été créée.$
```
### SootopolisCity_House7_Text_CaveMadeToKeepSomething
```
La grotte qui relie ATALANOPOLIS au\nmonde extérieur…\pC'est comme si elle avait été créée\npour empêcher quelque chose de sortir.\pOu s'agit-il juste de mon imagination?$
```
