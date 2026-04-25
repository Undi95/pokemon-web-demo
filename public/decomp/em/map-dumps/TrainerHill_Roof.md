# TrainerHill_Roof

## Métadonnées
- **id** : `MAP_TRAINER_HILL_ROOF`
- **layout** : `LAYOUT_TRAINER_HILL_ROOF`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_TRAINER_HILL`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 12,7 | `MOVEMENT_TYPE_FACE_DOWN` | `TrainerHill_Roof_EventScript_Owner` | `0` |

## Warps (2)
- #0 (9,5) → `MAP_TRAINER_HILL_4F` warp #1
- #1 (15,5) → `MAP_TRAINER_HILL_ELEVATOR` warp #1

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `TrainerHill_Roof_Text_ArriveZippierNextTime`
- `TrainerHill_Roof_Text_FullUpBeBackLaterForThis`
- `TrainerHill_Roof_Text_GotHereMarvelouslyQuickly`
- `TrainerHill_Roof_Text_HaveTheMostMarvelousGift`
- `TrainerHill_Roof_Text_YouFinallyCameBravo`
- `TrainerHill_Roof_Text_YouWerentVeryQuick`
- `gText_TheBagIsFull`

## Scripts (11)
### TrainerHill_Roof_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, TrainerHill_OnResume
map_script MAP_SCRIPT_ON_FRAME_TABLE, TrainerHill_OnFrame
```
### TrainerHill_Roof_EventScript_Owner
```
trainerhill_settrainerflags
lock
faceplayer
trainerhill_getownerstate
switch VAR_RESULT
case 0, TrainerHill_Roof_EventScript_Arrived
case 1, TrainerHill_Roof_EventScript_GivePrize
case 2, TrainerHill_Roof_EventScript_AlreadyReceivedPrize
```
### TrainerHill_Roof_EventScript_Arrived
```
msgbox TrainerHill_Roof_Text_YouFinallyCameBravo, MSGBOX_DEFAULT
```
### TrainerHill_Roof_EventScript_GivePrize
```
trainerhill_giveprize
switch VAR_RESULT
case 0, TrainerHill_Roof_EventScript_ReceivePrize
case 1, TrainerHill_Roof_EventScript_NoRoomForPrize
case 2, TrainerHill_Roof_EventScript_CheckFinalTime
```
### TrainerHill_Roof_EventScript_ReceivePrize
```
msgbox TrainerHill_Roof_Text_HaveTheMostMarvelousGift, MSGBOX_DEFAULT
playfanfare MUS_LEVEL_UP
message gText_ObtainedTheItem
waitfanfare
waitmessage
goto TrainerHill_Roof_EventScript_CheckFinalTime
```
### TrainerHill_Roof_EventScript_NoRoomForPrize
```
msgbox TrainerHill_Roof_Text_HaveTheMostMarvelousGift, MSGBOX_DEFAULT
msgbox gText_TheBagIsFull, MSGBOX_DEFAULT
msgbox TrainerHill_Roof_Text_FullUpBeBackLaterForThis, MSGBOX_DEFAULT
goto TrainerHill_Roof_EventScript_CheckFinalTime
```
### TrainerHill_Roof_EventScript_CheckFinalTime
```
trainerhill_finaltime
switch VAR_RESULT
case 0, TrainerHill_Roof_EventScript_NewRecord
case 1, TrainerHill_Roof_EventScript_NoNewRecord
case 2, TrainerHill_Roof_EventScript_EndSpeakToOwner
```
### TrainerHill_Roof_EventScript_NewRecord
```
msgbox TrainerHill_Roof_Text_GotHereMarvelouslyQuickly, MSGBOX_DEFAULT
goto TrainerHill_Roof_EventScript_EndSpeakToOwner
end
```
### TrainerHill_Roof_EventScript_NoNewRecord
```
msgbox TrainerHill_Roof_Text_YouWerentVeryQuick, MSGBOX_DEFAULT
goto TrainerHill_Roof_EventScript_EndSpeakToOwner
end
```
### TrainerHill_Roof_EventScript_EndSpeakToOwner
```
msgbox TrainerHill_Roof_Text_ArriveZippierNextTime, MSGBOX_DEFAULT
release
end
```
### TrainerHill_Roof_EventScript_AlreadyReceivedPrize
```
msgbox TrainerHill_Roof_Text_ArriveZippierNextTime, MSGBOX_DEFAULT
release
end
```
