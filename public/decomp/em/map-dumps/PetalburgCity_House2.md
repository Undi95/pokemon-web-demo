# PetalburgCity_House2

## Métadonnées
- **id** : `MAP_PETALBURG_CITY_HOUSE2`
- **layout** : `LAYOUT_HOUSE_WITH_BED`
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
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 2,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `PetalburgCity_House2_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 7,5 | `MOVEMENT_TYPE_FACE_DOWN` | `PetalburgCity_House2_EventScript_SchoolKid` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_PETALBURG_CITY` warp #4
- #1 (4,7) → `MAP_PETALBURG_CITY` warp #4

## Scripts (2)
### PetalburgCity_House2_EventScript_Woman
```
msgbox PetalburgCity_House2_Text_NormanBecameGymLeader, MSGBOX_NPC
end
```
### PetalburgCity_House2_EventScript_SchoolKid
```
msgbox PetalburgCity_House2_Text_BattledNormanOnce, MSGBOX_NPC
end
```

## Textes (2)
### PetalburgCity_House2_Text_NormanBecameGymLeader
```
NORMAN est le nouveau CHAMPION\nD'ARENE de notre ville.\pJe crois qu'il a fait venir sa famille\nd'une région lointaine.$
```
### PetalburgCity_House2_Text_BattledNormanOnce
```
J'ai affronté NORMAN une fois.\nMais il était bien trop fort.\pComment dire…\pJ'ai le sentiment qu'il ne vit\nque pour les POKéMON.$
```
