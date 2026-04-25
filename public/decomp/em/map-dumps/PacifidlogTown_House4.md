# PacifidlogTown_House4

## Métadonnées
- **id** : `MAP_PACIFIDLOG_TOWN_HOUSE4`
- **layout** : `LAYOUT_PACIFIDLOG_TOWN_HOUSE2`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_PACIFIDLOG_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 3,4 | `MOVEMENT_TYPE_FACE_DOWN` | `PacifidlogTown_House4_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_LITTLE_GIRL` | 7,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `PacifidlogTown_House4_EventScript_LittleGirl` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 7,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `PacifidlogTown_House4_EventScript_Boy` | `0` |

## Warps (2)
- #0 (4,8) → `MAP_PACIFIDLOG_TOWN` warp #4
- #1 (5,8) → `MAP_PACIFIDLOG_TOWN` warp #4

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (5)
### PacifidlogTown_House4_EventScript_LittleGirl
```
msgbox PacifidlogTown_House4_Text_SkyPokemon, MSGBOX_NPC
end
```
### PacifidlogTown_House4_EventScript_Woman
```
msgbox PacifidlogTown_House4_Text_PeopleSawHighFlyingPokemon, MSGBOX_NPC
end
```
### PacifidlogTown_House4_EventScript_Boy
```
lock
faceplayer
msgbox PacifidlogTown_House4_Text_WhereDidYouComeFrom, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, PacifidlogTown_House4_EventScript_Yes
goto_if_eq VAR_RESULT, NO, PacifidlogTown_House4_EventScript_No
end
```
### PacifidlogTown_House4_EventScript_Yes
```
msgbox PacifidlogTown_House4_Text_YesTown, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House4_EventScript_No
```
msgbox PacifidlogTown_House4_Text_YouHaveToComeFromSomewhere, MSGBOX_DEFAULT
release
end
```

## Textes (5)
### PacifidlogTown_House4_Text_PeopleSawHighFlyingPokemon
```
Les gens racontent qu'ils ont vu un\nPOKéMON VOLANT au-dessus de\lla région de HOENN.\pEst-ce qu'il vole tout le temps?\nIl doit bien se reposer, non?$
```
### PacifidlogTown_House4_Text_SkyPokemon
```
Un POKéMON ciel!\nUn POKéMON ciel!$
```
### PacifidlogTown_House4_Text_WhereDidYouComeFrom
```
D'où viens-tu?$
```
### PacifidlogTown_House4_Text_YesTown
```
Oui?\nOUI VILLE?\pJe n'ai jamais entendu parler de\ncet endroit.$
```
### PacifidlogTown_House4_Text_YouHaveToComeFromSomewhere
```
Non? Mais c'est n'importe quoi.\nTu dois bien venir de quelque part.\pOh! Attends! Tu ne vas pas me dire que\ntu viens du fond de l'océan?$
```
