# SeafloorCavern_Entrance

## Métadonnées
- **id** : `MAP_SEAFLOOR_CAVERN_ENTRANCE`
- **layout** : `LAYOUT_SEAFLOOR_CAVERN_ENTRANCE`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SEAFLOOR_CAVERN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 10,2 | `MOVEMENT_TYPE_FACE_UP` | `SeafloorCavern_Entrance_EventScript_Grunt` | `FLAG_HIDE_SEAFLOOR_CAVERN_ENTRANCE_AQUA_GRUNT` |

## Warps (2)
- #0 (10,18) → `MAP_UNDERWATER_ROUTE128` warp #0
- #1 (10,1) → `MAP_SEAFLOOR_CAVERN_ROOM1` warp #0

## Variables référencées (2)
- `VAR_FACING`
- `VAR_HAS_TALKED_TO_SEAFLOOR_CAVERN_ENTRANCE_GRUNT`

## Scripts (7)
### SeafloorCavern_Entrance_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, SeafloorCavern_Entrance_OnResume
```
### SeafloorCavern_Entrance_OnResume
```
setdivewarp MAP_UNDERWATER_SEAFLOOR_CAVERN, 6, 5
setescapewarp MAP_UNDERWATER_SEAFLOOR_CAVERN, 6, 5
end
```
### SeafloorCavern_Entrance_EventScript_Grunt
```
lockall
goto_if_eq VAR_HAS_TALKED_TO_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, 1, SeafloorCavern_Entrance_EventScript_GruntSpeechShort
waitse
playse SE_PIN
applymovement LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, Common_Movement_Delay48
waitmovement 0
delay 20
call_if_eq VAR_FACING, DIR_WEST, SeafloorCavern_Entrance_EventScript_GruntFacePlayerWest
call_if_eq VAR_FACING, DIR_EAST, SeafloorCavern_Entrance_EventScript_GruntFacePlayerEast
call_if_eq VAR_FACING, DIR_NORTH, SeafloorCavern_Entrance_EventScript_GruntFacePlayerNorth
delay 30
setvar VAR_HAS_TALKED_TO_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, 1
copyobjectxytoperm LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT
msgbox SeafloorCavern_Entrance_Text_HearMagmaNearMossdeep, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
releaseall
end
```
### SeafloorCavern_Entrance_EventScript_GruntSpeechShort
```
call_if_eq VAR_FACING, DIR_WEST, SeafloorCavern_Entrance_EventScript_GruntFacePlayerWest
call_if_eq VAR_FACING, DIR_EAST, SeafloorCavern_Entrance_EventScript_GruntFacePlayerEast
call_if_eq VAR_FACING, DIR_NORTH, SeafloorCavern_Entrance_EventScript_GruntFacePlayerNorth
msgbox SeafloorCavern_Entrance_Text_HearMagmaNearMossdeepShort, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
releaseall
end
```
### SeafloorCavern_Entrance_EventScript_GruntFacePlayerEast
```
applymovement LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
return
```
### SeafloorCavern_Entrance_EventScript_GruntFacePlayerWest
```
applymovement LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
return
```
### SeafloorCavern_Entrance_EventScript_GruntFacePlayerNorth
```
applymovement LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```

## Textes (2)
### SeafloorCavern_Entrance_Text_HearMagmaNearMossdeep
```
Hé!\nJe me souviens de toi!\pSi tu es là, ça veut dire que tu veux\nencore te mêler de nos affaires!\pTu penses vraiment qu'une demi-portion\ncomme toi peut gêner la TEAM AQUA?\pMais tu rêves complètement, ma parole.\pTu arriverais à peine à entrer dans\nla TEAM MAGMA, c'est dire!\pEn parlant d'eux, il paraît qu'on les a\nrepérés près d'ALGATIA.\pIls ne doivent pas faire les fiers\nsi près de la mer!$
```
### SeafloorCavern_Entrance_Text_HearMagmaNearMossdeepShort
```
Tu penses vraiment qu'une demi-portion\ncomme toi peut gêner la TEAM AQUA?\pMais tu rêves complètement, ma parole.\pTu arriverais à peine à entrer dans\nla TEAM MAGMA, c'est dire!\pEn parlant d'eux, il paraît qu'on les a\nrepérés près d'ALGATIA.\pIls ne doivent pas faire les fiers\nsi près de la mer!$
```
