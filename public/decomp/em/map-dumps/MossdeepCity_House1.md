# MossdeepCity_House1

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY_HOUSE1`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 3,3 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `MossdeepCity_House1_EventScript_BlackBelt` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 7,4 | `MOVEMENT_TYPE_FACE_LEFT` | `MossdeepCity_House1_EventScript_Woman` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_MOSSDEEP_CITY` warp #0
- #1 (4,7) → `MAP_MOSSDEEP_CITY` warp #0

## Variables référencées (2)
- `VAR_1`
- `VAR_RESULT`

## Scripts (3)
### MossdeepCity_House1_EventScript_BlackBelt
```
lock
faceplayer
bufferleadmonspeciesname STR_VAR_1
msgbox MossdeepCity_House1_Text_HmmYourPokemon, MSGBOX_DEFAULT
specialvar VAR_RESULT, GetPokeblockNameByMonNature
goto_if_eq VAR_RESULT, 0, MossdeepCity_House1_EventScript_NeutralNature
msgbox MossdeepCity_House1_Text_ItLikesXPokeblocks, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_House1_EventScript_NeutralNature
```
msgbox MossdeepCity_House1_Text_DoesntLikeOrDislikePokeblocks, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_House1_EventScript_Woman
```
msgbox MossdeepCity_House1_Text_HusbandCanTellPokeblockMonLikes, MSGBOX_NPC
end
```

## Textes (4)
### MossdeepCity_House1_Text_HmmYourPokemon
```
Hum!\nTon {STR_VAR_1}…$
```
### MossdeepCity_House1_Text_ItLikesXPokeblocks
```
Un {STR_VAR_1}, il aime bien ça,\nn'est-ce pas?\pJe suis catégorique là-dessus! Il aime\nbeaucoup le {STR_VAR_1}.$
```
### MossdeepCity_House1_Text_DoesntLikeOrDislikePokeblocks
```
Il semble insensible aux différents\ngoûts des {POKEBLOCK}S.$
```
### MossdeepCity_House1_Text_HusbandCanTellPokeblockMonLikes
```
En un clin d'œil, mon mari peut dire\nquels {POKEBLOCK}S un POKéMON aime.$
```
