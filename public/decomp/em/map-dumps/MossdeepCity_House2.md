# MossdeepCity_House2

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY_HOUSE2`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_4` | 6,6 | `MOVEMENT_TYPE_FACE_LEFT` | `MossdeepCity_House2_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_TWIN` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `MossdeepCity_House2_EventScript_Twin` | `0` |
| `LOCALID_MOSSDEEP_HOUSE_WINGULL` | `OBJ_EVENT_GFX_WINGULL` | 4,5 | `MOVEMENT_TYPE_FACE_UP` | `MossdeepCity_House2_EventScript_Wingull` | `FLAG_HIDE_MOSSDEEP_CITY_HOUSE_2_WINGULL` |

## Warps (2)
- #0 (3,8) → `MAP_MOSSDEEP_CITY` warp #3
- #1 (4,8) → `MAP_MOSSDEEP_CITY` warp #3

## Flags référencés (2)
- `FLAG_HIDE_FORTREE_CITY_HOUSE_4_WINGULL`
- `FLAG_WINGULL_DELIVERED_MAIL`

## Variables référencées (1)
- `VAR_FACING`

## Scripts (7)
### MossdeepCity_House2_EventScript_Man
```
msgbox MossdeepCity_House2_Text_SisterMailsBoyfriendInFortree, MSGBOX_NPC
end
```
### MossdeepCity_House2_EventScript_Twin
```
msgbox MossdeepCity_House2_Text_PokemonCarriesMailBackAndForth, MSGBOX_NPC
end
```
### MossdeepCity_House2_EventScript_Wingull
```
lock
faceplayer
waitse
playmoncry SPECIES_WINGULL, CRY_MODE_NORMAL
msgbox MossdeepCity_House2_Text_Wingull, MSGBOX_DEFAULT
waitmoncry
closemessage
setflag FLAG_WINGULL_DELIVERED_MAIL
clearflag FLAG_HIDE_FORTREE_CITY_HOUSE_4_WINGULL
call_if_eq VAR_FACING, DIR_NORTH, MossdeepCity_House2_EventScript_WingullExitNorth
call_if_eq VAR_FACING, DIR_WEST, MossdeepCity_House2_EventScript_WingullExitWest
removeobject LOCALID_MOSSDEEP_HOUSE_WINGULL
release
end
```
### MossdeepCity_House2_EventScript_WingullExitNorth
```
applymovement LOCALID_MOSSDEEP_HOUSE_WINGULL, MossdeepCity_House2_Movement_WingullExitNorth
waitmovement 0
return
```
### MossdeepCity_House2_EventScript_WingullExitWest
```
applymovement LOCALID_MOSSDEEP_HOUSE_WINGULL, MossdeepCity_House2_Movement_WingullExitEast
waitmovement 0
return
```
### MossdeepCity_House2_Movement_WingullExitNorth
```
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_left
walk_fast_down
delay_8
step_end
```
### MossdeepCity_House2_Movement_WingullExitEast
```
walk_fast_down
walk_fast_down
walk_fast_down
delay_8
step_end
```

## Textes (3)
### MossdeepCity_House2_Text_SisterMailsBoyfriendInFortree
```
Ma petite sœur échange des LETTRES\navec son petit ami de CIMETRONELLE.\pJe ne l'envie pas du tout.$
```
### MossdeepCity_House2_Text_PokemonCarriesMailBackAndForth
```
Même si je ne peux pas voir mon ami à\nCIMETRONELLE, mon POKéMON fait les\lallers et retours avec nos LETTRES.\pNous sommes séparés, mais je ne\nme sens pas seule.$
```
### MossdeepCity_House2_Text_Wingull
```
GOELISE: Goéééliiise!$
```
