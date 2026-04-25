# MauvilleCity_Mart

## Métadonnées
- **id** : `MAP_MAUVILLE_CITY_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_MAUVILLE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MAUVILLE_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `MauvilleCity_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 5,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `MauvilleCity_Mart_EventScript_ExpertM` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 5,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `MauvilleCity_Mart_EventScript_Man` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_MAUVILLE_CITY` warp #3
- #1 (4,7) → `MAP_MAUVILLE_CITY` warp #3

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (4)
### MauvilleCity_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart MauvilleCity_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_Mart_Pokemart
```
pokemartlistend
```
### MauvilleCity_Mart_EventScript_ExpertM
```
msgbox MauvilleCity_Mart_Text_ItemsToTemporarilyElevateStats, MSGBOX_NPC
end
```
### MauvilleCity_Mart_EventScript_Man
```
msgbox MauvilleCity_Mart_Text_DecisionsDetermineBattle, MSGBOX_NPC
end
```

## Textes (2)
### MauvilleCity_Mart_Text_ItemsToTemporarilyElevateStats
```
Certains objets augmentent de façon\ntemporaire les stats d'un POKéMON.\pCeux qu'on utilise au combat sont\nl'ATTAQUE + et la DEFENSE +.\pJe crois qu'il y en a encore \nd'autres comme ça.$
```
### MauvilleCity_Mart_Text_DecisionsDetermineBattle
```
Utiliser une certaine capacité ou\nutiliser un objet à la place…\pA mon avis, les décisions des DRESSEURS\ninfluent sur le déroulement du combat.$
```
