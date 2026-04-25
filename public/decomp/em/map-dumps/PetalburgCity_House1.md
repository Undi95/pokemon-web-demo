# PetalburgCity_House1

## Métadonnées
- **id** : `MAP_PETALBURG_CITY_HOUSE1`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_PETALBURG`
- **region_map_section** : `MAPSEC_PETALBURG_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GIRL_1` | 7,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `PetalburgCity_House1_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `PetalburgCity_House1_EventScript_Man` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_PETALBURG_CITY` warp #0
- #1 (4,8) → `MAP_PETALBURG_CITY` warp #0

## Scripts (2)
### PetalburgCity_House1_EventScript_Man
```
msgbox PetalburgCity_House1_Text_TravelingIsWonderful, MSGBOX_NPC
end
```
### PetalburgCity_House1_EventScript_Woman
```
msgbox PetalburgCity_House1_Text_GoOnAdventure, MSGBOX_NPC
end
```

## Textes (2)
### PetalburgCity_House1_Text_TravelingIsWonderful
```
C'est formidable de voyager!\pQuand j'étais jeune, je sillonnais\nles mers et les montagnes!$
```
### PetalburgCity_House1_Text_GoOnAdventure
```
Oooh…\pJ'aimerais tant partir à l'aventure\navec des POKéMON…\pRamper dans l'herbe humide…\nGravir les montagnes escarpées…\pTraverser les eaux déchaînées…\nErrer dans l'obscurité des cavernes…\pEt même parfois, avoir le mal du pays…\nCe doit être fabuleux de voyager!$
```
