# EverGrandeCity_HallOfFame

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_HALL_OF_FAME`
- **layout** : `LAYOUT_EVER_GRANDE_CITY_HALL_OF_FAME`
- **music** : `MUS_HALL_OF_FAME_ROOM`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_HALL_OF_FAME_WALLACE` | `OBJ_EVENT_GFX_WALLACE` | 6,16 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `0` |

## Warps (1)
- #0 (7,11) → `MAP_EVER_GRANDE_CITY_CHAMPIONS_ROOM` warp #1

## Variables référencées (2)
- `VAR_RESULT`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/hall_of_fame.inc
- `EverGrandeCity_HallOfFame_EventScript_SetGameClearFlags`

## Scripts (9)
### EverGrandeCity_HallOfFame_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, EverGrandeCity_HallOfFame_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, EverGrandeCity_HallOfFame_OnWarp
```
### EverGrandeCity_HallOfFame_OnWarp
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_HallOfFame_EventScript_TurnPlayerNorth
```
### EverGrandeCity_HallOfFame_EventScript_TurnPlayerNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### EverGrandeCity_HallOfFame_OnFrame
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_HallOfFame_EventScript_EnterHallOfFame
```
### EverGrandeCity_HallOfFame_EventScript_EnterHallOfFame
```
lockall
applymovement LOCALID_HALL_OF_FAME_WALLACE, EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame1
applymovement LOCALID_PLAYER, EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame1
waitmovement 0
applymovement LOCALID_HALL_OF_FAME_WALLACE, Common_Movement_WalkInPlaceFasterRight
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox EverGrandeCity_HallOfFame_Text_HereWeHonorLeagueChampions, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_HALL_OF_FAME_WALLACE, EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame2
applymovement LOCALID_PLAYER, EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame2
waitmovement 0
delay 20
applymovement LOCALID_HALL_OF_FAME_WALLACE, Common_Movement_WalkInPlaceFasterRight
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox EverGrandeCity_HallOfFame_Text_LetsRecordYouAndYourPartnersNames, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_HALL_OF_FAME_WALLACE, Common_Movement_WalkInPlaceFasterUp
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
delay 20
dofieldeffect FLDEFF_HALL_OF_FAME_RECORD
waitfieldeffect FLDEFF_HALL_OF_FAME_RECORD
delay 40
setvar VAR_TEMP_1, 1
call EverGrandeCity_HallOfFame_EventScript_SetGameClearFlags
checkplayergender
goto_if_eq VAR_RESULT, MALE, EverGrandeCity_HallOfFame_EventScript_GameClearMale
goto_if_eq VAR_RESULT, FEMALE, EverGrandeCity_HallOfFame_EventScript_GameClearFemale
end
```
### EverGrandeCity_HallOfFame_EventScript_GameClearMale
```
setrespawn HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F
fadescreenspeed FADE_TO_BLACK, 24
special GameClear
releaseall
end
```
### EverGrandeCity_HallOfFame_EventScript_GameClearFemale
```
setrespawn HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE_2F
fadescreenspeed FADE_TO_BLACK, 24
special GameClear
releaseall
end
```
### EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame1
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### EverGrandeCity_HallOfFame_Movement_WalkIntoHallOfFame2
```
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```

## Textes (2)
### EverGrandeCity_HallOfFame_Text_HereWeHonorLeagueChampions
```
MARC: Cette pièce…\pC'est là que les performances des\nPOKéMON qui remportent les combats\lles plus difficiles sont conservées.\pC'est ici que les MAITRES de la LIGUE\nPOKéMON sont honorés.$
```
### EverGrandeCity_HallOfFame_Text_LetsRecordYouAndYourPartnersNames
```
MARC: Viens inscrire ton nom et\nceux de tes partenaires de combat. On\lte reconnaîtra comme l'un des glorieux\lDRESSEURS de la LIGUE POKéMON.$
```
