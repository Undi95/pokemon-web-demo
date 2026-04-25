# NavelRock_Harbor

## Métadonnées
- **id** : `MAP_NAVEL_ROCK_HARBOR`
- **layout** : `LAYOUT_ISLAND_HARBOR`
- **music** : `MUS_RG_SEVII_ROUTE`
- **region_map_section** : `MAPSEC_NAVEL_ROCK`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_NAVEL_ROCK_SAILOR` | `OBJ_EVENT_GFX_SAILOR` | 8,5 | `MOVEMENT_TYPE_FACE_UP` | `NavelRock_Harbor_EventScript_Sailor` | `0` |
| `LOCALID_NAVEL_ROCK_SS_TIDAL` | `OBJ_EVENT_GFX_SS_TIDAL` | 8,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `0` |

## Warps (1)
- #0 (8,2) → `MAP_NAVEL_ROCK_EXTERIOR` warp #0

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_FerryDepartIsland`
- `EventTicket_Text_AsYouLike`
- `EventTicket_Text_SailHome`
- `NavelRock_Harbor_Text_SailorReturn`

## Scripts (2)
### NavelRock_Harbor_EventScript_Sailor
```
lock
faceplayer
msgbox NavelRock_Harbor_Text_SailorReturn, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, NavelRock_Harbor_EventScript_AsYouLike
msgbox EventTicket_Text_SailHome, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 30
hideobjectat LOCALID_NAVEL_ROCK_SAILOR, MAP_NAVEL_ROCK_HARBOR
setvar VAR_0x8004, LOCALID_NAVEL_ROCK_SS_TIDAL
call Common_EventScript_FerryDepartIsland
warp MAP_LILYCOVE_CITY_HARBOR, 8, 11
waitstate
release
end
```
### NavelRock_Harbor_EventScript_AsYouLike
```
msgbox EventTicket_Text_AsYouLike, MSGBOX_DEFAULT
release
end
```
