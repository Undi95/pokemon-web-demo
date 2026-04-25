# LavaridgeTown_Mart

## Métadonnées
- **id** : `MAP_LAVARIDGE_TOWN_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
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
| `LOCALID_LAVARIDGE_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `LavaridgeTown_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 4,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Mart_EventScript_ExpertM` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_WOMAN` | 9,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `LavaridgeTown_Mart_EventScript_OldWoman` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_LAVARIDGE_TOWN` warp #2
- #1 (4,7) → `MAP_LAVARIDGE_TOWN` warp #2

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (4)
### LavaridgeTown_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart LavaridgeTown_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LavaridgeTown_Mart_Pokemart
```
pokemartlistend
```
### LavaridgeTown_Mart_EventScript_ExpertM
```
msgbox LavaridgeTown_Mart_Text_XSpeedFirstStrike, MSGBOX_NPC
end
```
### LavaridgeTown_Mart_EventScript_OldWoman
```
msgbox LavaridgeTown_Mart_Text_LocalSpecialtyOnMtChimney, MSGBOX_NPC
end
```

## Textes (2)
### LavaridgeTown_Mart_Text_XSpeedFirstStrike
```
Utilise VITESSE + pour augmenter la\nVITESSE d'un POKéMON au combat.\pÇa lui donnera plus de chances de\nfrapper le premier, un sacré avantage!$
```
### LavaridgeTown_Mart_Text_LocalSpecialtyOnMtChimney
```
Au sommet du MONT CHIMNEE, on\ntrouve une spécialité locale qu'on ne\lpeut acheter que là-haut.\pDonne-la à un POKéMON. Il sera ravi.$
```
