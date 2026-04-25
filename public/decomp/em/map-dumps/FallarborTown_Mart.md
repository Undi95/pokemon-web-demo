# FallarborTown_Mart

## Métadonnées
- **id** : `MAP_FALLARBOR_TOWN_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_FALLARBOR_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FALLARBOR_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `FallarborTown_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 5,3 | `MOVEMENT_TYPE_WANDER_AROUND` | `FallarborTown_Mart_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 9,6 | `MOVEMENT_TYPE_FACE_DOWN` | `FallarborTown_Mart_EventScript_PokefanM` | `0` |
| `` | `OBJ_EVENT_GFX_SKITTY` | 2,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `FallarborTown_Mart_EventScript_Skitty` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_2` | 7,2 | `MOVEMENT_TYPE_FACE_UP` | `FallarborTown_Mart_EventScript_MetronomeTutor` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_FALLARBOR_TOWN` warp #0
- #1 (4,7) → `MAP_FALLARBOR_TOWN` warp #0

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (5)
### FallarborTown_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart FallarborTown_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### FallarborTown_Mart_Pokemart
```
pokemartlistend
```
### FallarborTown_Mart_EventScript_Woman
```
msgbox FallarborTown_Mart_Text_DecidingSkittyEvolve, MSGBOX_NPC
end
```
### FallarborTown_Mart_EventScript_PokefanM
```
msgbox FallarborTown_Mart_Text_SellNuggetIFound, MSGBOX_NPC
end
```
### FallarborTown_Mart_EventScript_Skitty
```
lock
faceplayer
waitse
playmoncry SPECIES_SKITTY, CRY_MODE_NORMAL
msgbox FallarborTown_Mart_Text_Skitty, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (3)
### FallarborTown_Mart_Text_DecidingSkittyEvolve
```
J'ai du mal à me décider. Faut-il que\nje fasse évoluer mon SKITTY?\pIl me suffirait d'utiliser cette PIERRE\nLUNE, mais je n'arrive pas à me décider…\pSi je le fais évoluer, il sera bien plus\npuissant.\pMais il changera aussi d'apparence.$
```
### FallarborTown_Mart_Text_Skitty
```
SKITTY: Kiiiiity?$
```
### FallarborTown_Mart_Text_SellNuggetIFound
```
J'ai trouvé une PEPITE, ici…\nJe suppose que je vais devoir la vendre,\lpuisqu'elle ne sert à rien d'autre.$
```
