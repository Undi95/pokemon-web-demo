# FortreeCity_House3

## Métadonnées
- **id** : `MAP_FORTREE_CITY_HOUSE3`
- **layout** : `LAYOUT_FORTREE_CITY_HOUSE1`
- **music** : `MUS_FORTREE`
- **region_map_section** : `MAPSEC_FORTREE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MANIAC` | 0,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `FortreeCity_House3_EventScript_Maniac` | `0` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 5,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `FortreeCity_House3_EventScript_SchoolKidM` | `0` |

## Warps (2)
- #0 (3,5) → `MAP_FORTREE_CITY` warp #5
- #1 (4,5) → `MAP_FORTREE_CITY` warp #5

## Scripts (2)
### FortreeCity_House3_EventScript_Maniac
```
msgbox FortreeCity_House3_Text_MetStevenHadAmazingPokemon, MSGBOX_NPC
end
```
### FortreeCity_House3_EventScript_SchoolKidM
```
msgbox FortreeCity_House3_Text_OhYouHavePokedex, MSGBOX_NPC
end
```

## Textes (2)
### FortreeCity_House3_Text_MetStevenHadAmazingPokemon
```
En parlant de POKéDEX, ça me\nrappelle quelque chose.\pJ'ai rencontré ce DRESSEUR, PIERRE,\nquand je cherchais des pierres rares.\pSi t'avais vu comme ses POKéMON\nétaient surprenants!\pNon seulement ils étaient rares, mais\nils étaient également soumis à un rude\lentraînement.\pCe DRESSEUR est peut-être encore plus\nfort que le CHAMPION de cette ville…$
```
### FortreeCity_House3_Text_OhYouHavePokedex
```
Quelle est cette chose que tu as là?\p… … … … … …\pOh, ça s'appelle un POKéDEX?\nC'est très impressionnant!$
```
