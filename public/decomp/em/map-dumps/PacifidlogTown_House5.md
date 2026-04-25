# PacifidlogTown_House5

## Métadonnées
- **id** : `MAP_PACIFIDLOG_TOWN_HOUSE5`
- **layout** : `LAYOUT_PACIFIDLOG_TOWN_HOUSE1`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_PACIFIDLOG_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 9,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `PacifidlogTown_House5_EventScript_MirageIslandWatcher` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 3,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `PacifidlogTown_House5_EventScript_Gentleman` | `0` |

## Warps (2)
- #0 (4,8) → `MAP_PACIFIDLOG_TOWN` warp #5
- #1 (5,8) → `MAP_PACIFIDLOG_TOWN` warp #5

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (3)
### PacifidlogTown_House5_EventScript_MirageIslandWatcher
```
lock
faceplayer
specialvar VAR_RESULT, IsMirageIslandPresent
goto_if_eq VAR_RESULT, TRUE, PacifidlogTown_House5_EventScript_MirageIslandPresent
msgbox PacifidlogTown_House5_Text_CantSeeMirageIslandToday, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House5_EventScript_MirageIslandPresent
```
msgbox PacifidlogTown_House5_Text_CanSeeMirageIslandToday, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House5_EventScript_Gentleman
```
msgbox PacifidlogTown_House5_Text_MirageIslandAppearDependingOnWeather, MSGBOX_NPC
end
```

## Textes (3)
### PacifidlogTown_House5_Text_CantSeeMirageIslandToday
```
Je n'vois pas l'ILE MIRAGE aujourd'hui…$
```
### PacifidlogTown_House5_Text_CanSeeMirageIslandToday
```
Oh! Oh mon Dieu! On peut voir\nl'ILE MIRAGE aujourd'hui!$
```
### PacifidlogTown_House5_Text_MirageIslandAppearDependingOnWeather
```
ILE MIRAGE…\pElle devient probablement visible ou\ninvisible en fonction du climat…\lParfois, on peut voir le mirage.\pOu peut-être apparaît-elle ou\ndisparaît-elle pour de bon?$
```
