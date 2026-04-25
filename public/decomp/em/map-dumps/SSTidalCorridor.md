# SSTidalCorridor

## Métadonnées
- **id** : `MAP_SS_TIDAL_CORRIDOR`
- **layout** : `LAYOUT_SS_TIDAL_CORRIDOR`
- **music** : `MUS_SAILING`
- **region_map_section** : `MAPSEC_DYNAMIC`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SS_TIDAL_EXIT_SAILOR` | `OBJ_EVENT_GFX_SAILOR` | 1,11 | `MOVEMENT_TYPE_FACE_UP` | `SSTidalCorridor_EventScript_ExitSailor` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 16,7 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `SSTidalCorridor_EventScript_Sailor` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 9,2 | `MOVEMENT_TYPE_FACE_DOWN` | `SSTidalCorridor_EventScript_Briney` | `FLAG_HIDE_SS_TIDAL_CORRIDOR_MR_BRINEY` |
| `` | `OBJ_EVENT_GFX_WINGULL` | 7,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `SSTidalCorridor_EventScript_Peeko` | `FLAG_HIDE_SS_TIDAL_CORRIDOR_MR_BRINEY` |
| `LOCALID_SS_TIDAL_SCOTT` | `OBJ_EVENT_GFX_SCOTT` | 9,10 | `MOVEMENT_TYPE_FACE_LEFT` | `0x0` | `FLAG_HIDE_SS_TIDAL_CORRIDOR_SCOTT` |

## Warps (9)
- #0 (4,9) → `MAP_SS_TIDAL_ROOMS` warp #0
- #1 (7,9) → `MAP_SS_TIDAL_ROOMS` warp #2
- #2 (10,9) → `MAP_SS_TIDAL_ROOMS` warp #4
- #3 (13,9) → `MAP_SS_TIDAL_ROOMS` warp #6
- #4 (4,3) → `MAP_SS_TIDAL_ROOMS` warp #8
- #5 (7,3) → `MAP_SS_TIDAL_ROOMS` warp #9
- #6 (10,3) → `MAP_SS_TIDAL_ROOMS` warp #10
- #7 (13,3) → `MAP_SS_TIDAL_ROOMS` warp #11
- #8 (16,2) → `MAP_SS_TIDAL_LOWER_DECK` warp #0

## BG events / signs (12)
- (2,1) [sign] → `SSTidalCorridor_EventScript_Porthole`
- (4,1) [sign] → `SSTidalCorridor_EventScript_Porthole`
- (6,1) [sign] → `SSTidalCorridor_EventScript_Porthole`
- (8,1) [sign] → `SSTidalCorridor_EventScript_Porthole`
- (10,1) [sign] → `SSTidalCorridor_EventScript_Porthole`
- (12,1) [sign] → `SSTidalCorridor_EventScript_Porthole`
- (14,1) [sign] → `SSTidalCorridor_EventScript_Porthole`
- (16,1) [sign] → `SSTidalCorridor_EventScript_Porthole`
- (5,9) [sign] → `SSTidalCorridor_EventScript_Cabin1Sign`
- (8,9) [sign] → `SSTidalCorridor_EventScript_Cabin2Sign`
- (11,9) [sign] → `SSTidalCorridor_EventScript_Cabin3Sign`
- (14,9) [sign] → `SSTidalCorridor_EventScript_Cabin4Sign`

## Flags référencés (4)
- `FLAG_DEFEATED_SS_TIDAL_TRAINERS`
- `FLAG_HIDE_SS_TIDAL_ROOMS_SNATCH_GIVER`
- `FLAG_MET_SCOTT_ON_SS_TIDAL`
- `FLAG_RECEIVED_TM_SNATCH`

## Variables référencées (2)
- `VAR_SS_TIDAL_SCOTT_STATE`
- `VAR_SS_TIDAL_STATE`

## Scripts (33)
### SSTidalCorridor_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, SSTidalCorridor_OnFrame
```
### SSTidalCorridor_OnFrame
```
map_script_2 VAR_SS_TIDAL_SCOTT_STATE, 0, SSTidalCorridor_EventScript_ScottScene
map_script_2 VAR_SS_TIDAL_STATE, SS_TIDAL_BOARD_SLATEPORT, SSTidalCorridor_EventScript_DepartSlateportForLilycove
map_script_2 VAR_SS_TIDAL_STATE, SS_TIDAL_BOARD_LILYCOVE, SSTidalCorridor_EventScript_DepartLilycoveForSlateport
map_script_2 VAR_SS_TIDAL_STATE, SS_TIDAL_EXIT_CURRENTS_RIGHT, SSTidalCorridor_EventScript_HalfwayToLilycove
map_script_2 VAR_SS_TIDAL_STATE, SS_TIDAL_EXIT_CURRENTS_LEFT, SSTidalCorridor_EventScript_ArrivedInSlateport
```
### SSTidalCorridor_EventScript_DepartSlateportForLilycove
```
special SetSSTidalFlag
setvar VAR_SS_TIDAL_STATE, SS_TIDAL_DEPART_SLATEPORT
lockall
playse SE_DING_DONG
msgbox SSTidal_Text_FastCurrentsHopeYouEnjoyVoyage, MSGBOX_DEFAULT
releaseall
end
```
### SSTidalCorridor_EventScript_DepartLilycoveForSlateport
```
setvar VAR_SS_TIDAL_STATE, SS_TIDAL_DEPART_LILYCOVE
lockall
playse SE_DING_DONG
msgbox SSTidal_Text_HopeYouEnjoyVoyage, MSGBOX_DEFAULT
releaseall
end
```
### SSTidalRooms_EventScript_HalfwayToSlateport
```
special SetSSTidalFlag
setvar VAR_SS_TIDAL_STATE, SS_TIDAL_HALFWAY_SLATEPORT
playse SE_DING_DONG
msgbox SSTidal_Text_FastCurrentsHopeYouEnjoyVoyage, MSGBOX_DEFAULT
return
```
### SSTidalRooms_EventScript_ArrivedInLilycove
```
special ResetSSTidalFlag
setvar VAR_SS_TIDAL_STATE, SS_TIDAL_LAND_LILYCOVE
playse SE_DING_DONG
msgbox SSTidal_Text_MadeLandInLilycove, MSGBOX_DEFAULT
return
```
### SSTidalCorridor_EventScript_ReachedStepCount
```
goto_if_eq VAR_SS_TIDAL_STATE, SS_TIDAL_DEPART_SLATEPORT, SSTidalCorridor_EventScript_HalfwayToLilycove
goto_if_eq VAR_SS_TIDAL_STATE, SS_TIDAL_HALFWAY_SLATEPORT, SSTidalCorridor_EventScript_ArrivedInSlateport
end
```
### SSTidalCorridor_EventScript_HalfwayToLilycove
```
special ResetSSTidalFlag
setvar VAR_SS_TIDAL_STATE, SS_TIDAL_HALFWAY_LILYCOVE
lockall
playse SE_DING_DONG
msgbox SSTidal_Text_HopeYouEnjoyVoyage, MSGBOX_DEFAULT
releaseall
end
```
### SSTidalCorridor_EventScript_ArrivedInSlateport
```
special ResetSSTidalFlag
setvar VAR_SS_TIDAL_STATE, SS_TIDAL_LAND_SLATEPORT
lockall
playse SE_DING_DONG
msgbox SSTidal_Text_MadeLandInSlateport, MSGBOX_DEFAULT
releaseall
end
```
### SSTidalRooms_EventScript_ArrivedInSlateport
```
special ResetSSTidalFlag
setvar VAR_SS_TIDAL_STATE, SS_TIDAL_LAND_SLATEPORT
playse SE_DING_DONG
msgbox SSTidal_Text_MadeLandInSlateport, MSGBOX_DEFAULT
return
```
### SSTidalRooms_EventScript_ProgessCruiseAfterBed
```
switch VAR_SS_TIDAL_STATE
case SS_TIDAL_DEPART_SLATEPORT, SSTidalRooms_EventScript_ArrivedInLilycove
case SS_TIDAL_HALFWAY_LILYCOVE, SSTidalRooms_EventScript_ArrivedInLilycove
case SS_TIDAL_DEPART_LILYCOVE, SSTidalRooms_EventScript_HalfwayToSlateport
case SS_TIDAL_HALFWAY_SLATEPORT, SSTidalRooms_EventScript_ArrivedInSlateport
return
```
### SSTidalCorridor_EventScript_Briney
```
msgbox SSTidalCorridor_Text_BrineyWelcomeAboard, MSGBOX_NPC
end
```
### SSTidalCorridor_EventScript_Peeko
```
lock
faceplayer
waitse
playmoncry SPECIES_WINGULL, CRY_MODE_NORMAL
msgbox SSTidalCorridor_Text_Peeko, MSGBOX_DEFAULT
waitmoncry
release
end
```
### SSTidalCorridor_EventScript_Cabin1Sign
```
msgbox SSTidalCorridor_Text_Cabin1, MSGBOX_SIGN
end
```
### SSTidalCorridor_EventScript_Cabin2Sign
```
msgbox SSTidalCorridor_Text_Cabin2, MSGBOX_SIGN
end
```
### SSTidalCorridor_EventScript_Cabin3Sign
```
msgbox SSTidalCorridor_Text_Cabin3, MSGBOX_SIGN
end
```
### SSTidalCorridor_EventScript_Cabin4Sign
```
msgbox SSTidalCorridor_Text_Cabin4, MSGBOX_SIGN
end
```
### SSTidalCorridor_EventScript_ExitSailor
```
lock
faceplayer
goto_if_eq VAR_SS_TIDAL_STATE, SS_TIDAL_LAND_LILYCOVE, SSTidalCorridor_EventScript_ExitLilycove
goto_if_eq VAR_SS_TIDAL_STATE, SS_TIDAL_LAND_SLATEPORT, SSTidalCorridor_EventScript_ExitSlateport
msgbox SSTidalCorridor_Text_CanRestInCabin2, MSGBOX_DEFAULT
release
end
```
### SSTidalCorridor_EventScript_ExitLilycove
```
setrespawn HEAL_LOCATION_LILYCOVE_CITY
msgbox SSTidalCorridor_Text_WeveArrived, MSGBOX_DEFAULT
call_if_set FLAG_RECEIVED_TM_SNATCH, SSTidalCorridor_EventScript_HideSnatchGiver
warp MAP_LILYCOVE_CITY_HARBOR, 8, 11
waitstate
release
end
```
### SSTidalCorridor_EventScript_ExitSlateport
```
setrespawn HEAL_LOCATION_SLATEPORT_CITY
msgbox SSTidalCorridor_Text_WeveArrived, MSGBOX_DEFAULT
call_if_set FLAG_RECEIVED_TM_SNATCH, SSTidalCorridor_EventScript_HideSnatchGiver
warp MAP_SLATEPORT_CITY_HARBOR, 8, 11
waitstate
release
end
```
### SSTidalCorridor_EventScript_HideSnatchGiver
```
setflag FLAG_HIDE_SS_TIDAL_ROOMS_SNATCH_GIVER
return
```
### SSTidalCorridor_EventScript_Porthole
```
lockall
goto_if_eq VAR_SS_TIDAL_STATE, SS_TIDAL_DEPART_SLATEPORT, SSTidalCorridor_EventScript_LookThroughPorthole
goto_if_eq VAR_SS_TIDAL_STATE, SS_TIDAL_HALFWAY_SLATEPORT, SSTidalCorridor_EventScript_LookThroughPorthole
msgbox SSTidalCorridor_Text_HorizonSpreadsBeyondPorthole, MSGBOX_DEFAULT
releaseall
end
```
### SSTidalCorridor_EventScript_LookThroughPorthole
```
special LookThroughPorthole
end
```
### SSTidalCorridor_EventScript_Sailor
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_SS_TIDAL_TRAINERS, SSTidalCorridor_EventScript_EnjoyYourCruise
call SSTidalCorridor_EventScript_CheckIfTrainersDefeated
msgbox SSTidalCorridor_Text_VisitOtherCabins, MSGBOX_DEFAULT
release
end
```
### SSTidalCorridor_EventScript_EnjoyYourCruise
```
msgbox SSTidalCorridor_Text_EnjoyYourCruise, MSGBOX_DEFAULT
release
end
```
### SSTidalCorridor_EventScript_CheckIfTrainersDefeated
```
goto_if_not_defeated TRAINER_PHILLIP, SSTidalCorridor_EventScript_TrainerNotDefeated
goto_if_not_defeated TRAINER_LEONARD, SSTidalCorridor_EventScript_TrainerNotDefeated
goto_if_not_defeated TRAINER_COLTON, SSTidalCorridor_EventScript_TrainerNotDefeated
goto_if_not_defeated TRAINER_MICAH, SSTidalCorridor_EventScript_TrainerNotDefeated
goto_if_not_defeated TRAINER_THOMAS, SSTidalCorridor_EventScript_TrainerNotDefeated
goto_if_not_defeated TRAINER_LEA_AND_JED, SSTidalCorridor_EventScript_TrainerNotDefeated
goto_if_not_defeated TRAINER_GARRET, SSTidalCorridor_EventScript_TrainerNotDefeated
goto_if_not_defeated TRAINER_NAOMI, SSTidalCorridor_EventScript_TrainerNotDefeated
setflag FLAG_DEFEATED_SS_TIDAL_TRAINERS
goto SSTidalCorridor_EventScript_EnjoyYourCruise
return
```
### SSTidalCorridor_EventScript_TrainerNotDefeated
```
return
```
### SSTidalCorridor_EventScript_ScottScene
```
lockall
applymovement LOCALID_SS_TIDAL_SCOTT, SSTidalCorridor_Movement_ScottApproachPlayer
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox SSTidalCorridor_Text_ScottBattleFrontierInvite, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, SSTidalCorridor_Movement_PlayerWatchScottExit
applymovement LOCALID_SS_TIDAL_EXIT_SAILOR, SSTidalCorridor_Movement_SailorMoveForScott
applymovement LOCALID_SS_TIDAL_SCOTT, SSTidalCorridor_Movement_ScottExit
waitmovement 0
playse SE_EXIT
waitse
removeobject LOCALID_SS_TIDAL_SCOTT
applymovement LOCALID_SS_TIDAL_EXIT_SAILOR, SSTidalCorridor_Movement_SailorReturn
waitmovement 0
delay 30
setflag FLAG_MET_SCOTT_ON_SS_TIDAL
setvar VAR_SS_TIDAL_SCOTT_STATE, 1
releaseall
end
```
### SSTidalCorridor_Movement_ScottApproachPlayer
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### SSTidalCorridor_Movement_ScottExit
```
walk_in_place_faster_down
delay_16
delay_16
delay_16
delay_16
walk_down
walk_left
step_end
```
### SSTidalCorridor_Movement_PlayerWatchScottExit
```
delay_16
delay_16
delay_16
delay_16
delay_8
walk_in_place_faster_down
step_end
```
### SSTidalCorridor_Movement_SailorMoveForScott
```
delay_16
walk_right
walk_right
walk_in_place_faster_up
delay_16
walk_in_place_faster_left
step_end
```
### SSTidalCorridor_Movement_SailorReturn
```
walk_left
walk_left
walk_in_place_faster_up
step_end
```

## Textes (16)
### SSTidalCorridor_Text_ScottBattleFrontierInvite
```
SCOTT: Hé, bonjour, bonjour!\n{PLAYER}{KUN}, {PLAYER}{KUN}!\pJe suis pressé là, mais ça me fait\nplaisir de te voir!\pFélicitations, MAITRE de la LIGUE!\pIl y a un endroit où j'aimerais t'inviter.\nC'est pour les gens comme toi.\pC'est la…\nZONE DE COMBAT!\pA quoi ça ressemble?\nTu verras bien quand tu y seras!\pJ'en ai justement parlé avec le\nCAPITAINE.\pLa prochaine fois que tu prendras ce\nferry, tu pourras demander à ce qu'on\lt'emmène dans la ZONE DE COMBAT.\pBien, {PLAYER}{KUN}. A bientôt dans la \nZONE DE COMBAT, j'espère!$
```
### SSTidal_Text_FastCurrentsHopeYouEnjoyVoyage
```
Ce ferry est conçu pour naviguer dans\nles courants rapides.\pNous espérons que vous apprécierez\nvotre voyage.\pN'hésitez pas à explorer le navire.$
```
### SSTidal_Text_HopeYouEnjoyVoyage
```
Nous espérons que vous apprécierez\nvotre voyage à bord de notre ferry.$
```
### SSTidal_Text_MadeLandInSlateport
```
Nous avons touché terre à\nPOIVRESSEL.\pMerci d'avoir navigué avec nous.$
```
### SSTidal_Text_MadeLandInLilycove
```
Nous avons touché terre à NENUCRIQUE.\nMerci d'avoir navigué avec nous.$
```
### SSTidalCorridor_Text_CanRestInCabin2
```
A mon avis, nous ne toucherons pas\nterre avant un petit moment.\pAllez vous reposer dans votre cabine.\nC'est la Nº 2.\pLe lit est mou et épais.\nCroyez-moi, il est confortable!$
```
### SSTidalCorridor_Text_WeveArrived
```
Nous sommes arrivés!$
```
### SSTidalCorridor_Text_VisitOtherCabins
```
N'hésitez pas à entrer dans les\nautres cabines.\pLes DRESSEURS qui s'ennuient sur le\nferry seront partants pour un combat.$
```
### SSTidalCorridor_Text_EnjoyYourCruise
```
Amusez-vous bien pendant la croisière!$
```
### SSTidalCorridor_Text_HorizonSpreadsBeyondPorthole
```
Le hublot offre une belle vue sur\nl'horizon.$
```
### SSTidalCorridor_Text_BrineyWelcomeAboard
```
M. MARCO: Bienvenue à bord, {PLAYER}{KUN}!\pIls m'ont nommé capitaine du MARINA,\nà titre honorifique!\pTu peux m'appeler CAPITAINE MARCO,\nmaintenant!\pTu sais, j'avais pris ma retraite, mais\nquand j'ai vu ce magnifique bateau…\pDisons simplement que ça a réveillé\nmon âme de marin!$
```
### SSTidalCorridor_Text_Peeko
```
PIKO: Pihioo pihikooo…$
```
### SSTidalCorridor_Text_Cabin1
```
Cabine 1$
```
### SSTidalCorridor_Text_Cabin2
```
Cabine 2$
```
### SSTidalCorridor_Text_Cabin3
```
Cabine 3$
```
### SSTidalCorridor_Text_Cabin4
```
Cabine 4$
```
