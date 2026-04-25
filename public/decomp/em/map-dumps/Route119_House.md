# Route119_House

## Métadonnées
- **id** : `MAP_ROUTE119_HOUSE`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_ROUTE_119`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Route119_House_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_WINGULL` | 1,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route119_House_EventScript_Wingull` | `0` |
| `` | `OBJ_EVENT_GFX_WINGULL` | 0,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route119_House_EventScript_Wingull` | `0` |
| `` | `OBJ_EVENT_GFX_WINGULL` | 2,2 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route119_House_EventScript_Wingull` | `0` |
| `` | `OBJ_EVENT_GFX_WINGULL` | 8,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route119_House_EventScript_Wingull` | `0` |
| `` | `OBJ_EVENT_GFX_WINGULL` | 6,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route119_House_EventScript_Wingull` | `0` |
| `` | `OBJ_EVENT_GFX_WINGULL` | 5,3 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route119_House_EventScript_Wingull` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_ROUTE119` warp #1
- #1 (4,8) → `MAP_ROUTE119` warp #1

## Scripts (2)
### Route119_House_EventScript_Woman
```
msgbox Route119_House_Text_RumorAboutCaveOfOrigin, MSGBOX_NPC
end
```
### Route119_House_EventScript_Wingull
```
lock
faceplayer
waitse
playmoncry SPECIES_WINGULL, CRY_MODE_NORMAL
msgbox Route119_House_Text_Wingull, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (2)
### Route119_House_Text_RumorAboutCaveOfOrigin
```
J'ai entendu parler d'une grotte\nappelée la GROTTE ORIGINE.\pLes gens racontent que les esprits des\nPOKéMON y sont ranimés.\pC'est possible, une chose pareille?$
```
### Route119_House_Text_Wingull
```
GOELISE: Liiise?$
```
