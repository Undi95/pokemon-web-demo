# OldaleTown

## Métadonnées
- **id** : `MAP_OLDALE_TOWN`
- **layout** : `LAYOUT_OLDALE_TOWN`
- **music** : `MUS_OLDALE`
- **region_map_section** : `MAPSEC_OLDALE_TOWN`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_TOWN`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE103`
- down (offset 0) → `MAP_ROUTE101`
- left (offset 0) → `MAP_ROUTE102`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GIRL_3` | 16,11 | `MOVEMENT_TYPE_FACE_LEFT` | `OldaleTown_EventScript_Girl` | `0` |
| `LOCALID_OLDALE_MART_EMPLOYEE` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 13,7 | `MOVEMENT_TYPE_FACE_DOWN` | `OldaleTown_EventScript_MartEmployee` | `0` |
| `LOCALID_FOOTPRINTS_MAN` | `OBJ_EVENT_GFX_MANIAC` | 8,9 | `MOVEMENT_TYPE_FACE_RIGHT` | `OldaleTown_EventScript_FootprintsMan` | `0` |
| `LOCALID_OLDALE_RIVAL` | `OBJ_EVENT_GFX_VAR_0` | 11,19 | `MOVEMENT_TYPE_FACE_UP` | `OldaleTown_EventScript_Rival` | `FLAG_HIDE_OLDALE_TOWN_RIVAL` |

## Warps (4)
- #0 (5,7) → `MAP_OLDALE_TOWN_HOUSE1` warp #0
- #1 (15,16) → `MAP_OLDALE_TOWN_HOUSE2` warp #0
- #2 (6,16) → `MAP_OLDALE_TOWN_POKEMON_CENTER_1F` warp #0
- #3 (14,6) → `MAP_OLDALE_TOWN_MART` warp #0

## Coord events / triggers (4)
- (0,10) → `OldaleTown_EventScript_BlockedPath` (si `VAR_OLDALE_TOWN_STATE` == `0`)
- (8,19) → `OldaleTown_EventScript_RivalTrigger1` (si `VAR_OLDALE_RIVAL_STATE` == `1`)
- (9,19) → `OldaleTown_EventScript_RivalTrigger2` (si `VAR_OLDALE_RIVAL_STATE` == `1`)
- (10,19) → `OldaleTown_EventScript_RivalTrigger3` (si `VAR_OLDALE_RIVAL_STATE` == `1`)

## BG events / signs (5)
- (11,9) [sign] → `OldaleTown_EventScript_TownSign`
- (7,16) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (15,6) [sign] → `Common_EventScript_ShowPokemartSign`
- (8,16) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (16,6) [sign] → `Common_EventScript_ShowPokemartSign`

## Flags référencés (5)
- `FLAG_ADVENTURE_STARTED`
- `FLAG_HIDE_OLDALE_TOWN_RIVAL`
- `FLAG_RECEIVED_POTION_OLDALE`
- `FLAG_TEMP_1`
- `FLAG_VISITED_OLDALE_TOWN`

## Variables référencées (5)
- `VAR_0x8009`
- `VAR_FACING`
- `VAR_OLDALE_RIVAL_STATE`
- `VAR_OLDALE_TOWN_STATE`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_TooBadBagIsFull`
### data/scripts/rival_graphics.inc
- `Common_EventScript_SetupRivalGfxId`

## Scripts (43)
### OldaleTown_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, OldaleTown_OnTransition
```
### OldaleTown_OnTransition
```
call Common_EventScript_SetupRivalGfxId
setflag FLAG_VISITED_OLDALE_TOWN
call_if_unset FLAG_ADVENTURE_STARTED, OldaleTown_EventScript_BlockWestEntrance
call_if_unset FLAG_RECEIVED_POTION_OLDALE, OldaleTown_EventScript_MoveMartEmployee
call_if_set FLAG_ADVENTURE_STARTED, OldaleTown_EventScript_SetOldaleState
end
```
### OldaleTown_EventScript_SetOldaleState
```
setvar VAR_OLDALE_TOWN_STATE, 1
return
```
### OldaleTown_EventScript_BlockWestEntrance
```
setobjectxyperm LOCALID_FOOTPRINTS_MAN, 1, 11
setobjectmovementtype LOCALID_FOOTPRINTS_MAN, MOVEMENT_TYPE_FACE_LEFT
return
```
### OldaleTown_EventScript_MoveMartEmployee
```
setobjectxyperm LOCALID_OLDALE_MART_EMPLOYEE, 13, 14
setobjectmovementtype LOCALID_OLDALE_MART_EMPLOYEE, MOVEMENT_TYPE_FACE_DOWN
return
```
### OldaleTown_EventScript_TownSign
```
msgbox OldaleTown_Text_TownSign, MSGBOX_SIGN
end
```
### OldaleTown_EventScript_Girl
```
msgbox OldaleTown_Text_SavingMyProgress, MSGBOX_NPC
end
```
### OldaleTown_EventScript_MartEmployee
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_POTION_OLDALE, OldaleTown_EventScript_ExplainPotion
goto_if_set FLAG_TEMP_1, OldaleTown_EventScript_ExplainPotion
setflag FLAG_TEMP_1
playbgm MUS_FOLLOW_ME, FALSE
msgbox OldaleTown_Text_IWorkAtPokemonMart, MSGBOX_DEFAULT
closemessage
switch VAR_FACING
case DIR_SOUTH, OldaleTown_EventScript_GoToMartSouth
case DIR_NORTH, OldaleTown_EventScript_GoToMartNorth
case DIR_EAST, OldaleTown_EventScript_GoToMartEast
end
```
### OldaleTown_EventScript_GoToMartSouth
```
applymovement LOCALID_OLDALE_MART_EMPLOYEE, OldaleTown_Movement_EmployeeSouth
applymovement LOCALID_PLAYER, OldaleTown_Movement_PlayerSouth
waitmovement 0
goto OldaleTown_EventScript_ExplainPokemonMart
end
```
### OldaleTown_EventScript_GoToMartNorth
```
applymovement LOCALID_OLDALE_MART_EMPLOYEE, OldaleTown_Movement_EmployeeNorth
applymovement LOCALID_PLAYER, OldaleTown_Movement_PlayerNorth
waitmovement 0
goto OldaleTown_EventScript_ExplainPokemonMart
end
```
### OldaleTown_EventScript_GoToMartEast
```
applymovement LOCALID_PLAYER, OldaleTown_Movement_PlayerEast
applymovement LOCALID_OLDALE_MART_EMPLOYEE, OldaleTown_Movement_EmployeeEast
waitmovement 0
goto OldaleTown_EventScript_ExplainPokemonMart
end
```
### OldaleTown_EventScript_ExplainPokemonMart
```
msgbox OldaleTown_Text_ThisIsAPokemonMart, MSGBOX_DEFAULT
giveitem ITEM_POTION
goto_if_eq VAR_RESULT, FALSE, OldaleTown_EventScript_BagIsFull
msgbox OldaleTown_Text_PotionExplanation, MSGBOX_DEFAULT
setflag FLAG_RECEIVED_POTION_OLDALE
fadedefaultbgm
release
end
```
### OldaleTown_EventScript_ExplainPotion
```
msgbox OldaleTown_Text_PotionExplanation, MSGBOX_DEFAULT
release
end
```
### OldaleTown_EventScript_BagIsFull
```
msgbox gText_TooBadBagIsFull, MSGBOX_DEFAULT
fadedefaultbgm
release
end
```
### OldaleTown_Movement_EmployeeEast
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_in_place_faster_down
step_end
```
### OldaleTown_Movement_EmployeeSouth
```
walk_left
walk_up
walk_up
walk_right
walk_up
walk_up
walk_up
walk_up
walk_up
walk_in_place_faster_down
step_end
```
### OldaleTown_Movement_EmployeeNorth
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_in_place_faster_down
step_end
```
### OldaleTown_Movement_Unknown1
```
walk_up
walk_up
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
walk_up
walk_up
walk_up
delay_8
walk_in_place_faster_down
step_end
```
### OldaleTown_Movement_PlayerEast
```
walk_right
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### OldaleTown_Movement_PlayerSouth
```
delay_16
delay_16
delay_16
delay_16
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### OldaleTown_Movement_PlayerNorth
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### OldaleTown_Movement_Unknown2
```
walk_left
walk_up
walk_up
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
walk_up
walk_up
step_end
```
### OldaleTown_EventScript_FootprintsMan
```
lock
faceplayer
goto_if_set FLAG_ADVENTURE_STARTED, OldaleTown_EventScript_NotBlockingPath
msgbox OldaleTown_Text_DiscoveredFootprints, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_FOOTPRINTS_MAN, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### OldaleTown_EventScript_BlockedPath
```
lockall
applymovement LOCALID_PLAYER, OldaleTown_Movement_PlayerStepBack
applymovement LOCALID_FOOTPRINTS_MAN, OldaleTown_Movement_BackUp
waitmovement 0
msgbox OldaleTown_Text_WaitDontComeInHere, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_FOOTPRINTS_MAN, OldaleTown_Movement_ReturnToOriginalPosition
waitmovement 0
releaseall
end
```
### OldaleTown_EventScript_NotBlockingPath
```
msgbox OldaleTown_Text_FinishedSketchingFootprints, MSGBOX_DEFAULT
release
end
```
### OldaleTown_EventScript_Rival
```
lockall
applymovement LOCALID_OLDALE_RIVAL, Common_Movement_FacePlayer
waitmovement 0
setvar VAR_0x8009, 0
goto OldaleTown_EventScript_ShowRivalMessage
end
```
### OldaleTown_EventScript_RivalTrigger1
```
lockall
applymovement LOCALID_OLDALE_RIVAL, OldaleTown_Movement_RivalApproachPlayer1
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
setvar VAR_0x8009, 1
goto OldaleTown_EventScript_ShowRivalMessage
end
```
### OldaleTown_EventScript_RivalTrigger2
```
lockall
applymovement LOCALID_OLDALE_RIVAL, OldaleTown_Movement_RivalApproachPlayer2
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
setvar VAR_0x8009, 1
goto OldaleTown_EventScript_ShowRivalMessage
end
```
### OldaleTown_EventScript_RivalTrigger3
```
lockall
applymovement LOCALID_OLDALE_RIVAL, OldaleTown_Movement_RivalApproachPlayer3
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
setvar VAR_0x8009, 1
goto OldaleTown_EventScript_ShowRivalMessage
end
```
### OldaleTown_EventScript_ShowRivalMessage
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, OldaleTown_EventScript_ShowMayMessage
goto_if_eq VAR_RESULT, FEMALE, OldaleTown_EventScript_ShowBrendanMessage
end
```
### OldaleTown_EventScript_ShowMayMessage
```
msgbox OldaleTown_Text_MayLetsGoBack, MSGBOX_DEFAULT
goto OldaleTown_EventScript_RivalFinish
end
```
### OldaleTown_EventScript_ShowBrendanMessage
```
msgbox OldaleTown_Text_BrendanLetsGoBack, MSGBOX_DEFAULT
goto OldaleTown_EventScript_RivalFinish
end
```
### OldaleTown_EventScript_RivalFinish
```
closemessage
call_if_eq VAR_0x8009, 0, OldaleTown_EventScript_DoExitMovement1
call_if_eq VAR_0x8009, 1, OldaleTown_EventScript_DoExitMovement2
applymovement LOCALID_OLDALE_RIVAL, OldaleTown_Movement_RivalExit
waitmovement 0
removeobject LOCALID_OLDALE_RIVAL
setvar VAR_OLDALE_RIVAL_STATE, 2
setflag FLAG_HIDE_OLDALE_TOWN_RIVAL
releaseall
end
```
### OldaleTown_EventScript_DoExitMovement1
```
goto_if_ne VAR_FACING, DIR_SOUTH, OldaleTown_EventScript_DoExitMovement2
applymovement LOCALID_OLDALE_RIVAL, OldaleTown_Movement_RivalExit
waitmovement 0
return
```
### OldaleTown_EventScript_DoExitMovement2
```
applymovement LOCALID_PLAYER, OldaleTown_Movement_WatchRivalExit
applymovement LOCALID_OLDALE_RIVAL, OldaleTown_Movement_RivalExit
waitmovement 0
return
```
### OldaleTown_Movement_RivalApproachPlayer1
```
walk_left
walk_left
step_end
```
### OldaleTown_Movement_RivalApproachPlayer2
```
walk_left
step_end
```
### OldaleTown_Movement_RivalApproachPlayer3
```
face_left
step_end
```
### OldaleTown_Movement_RivalExit
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### OldaleTown_Movement_WatchRivalExit
```
delay_8
delay_4
walk_in_place_faster_down
step_end
```
### OldaleTown_Movement_PlayerStepBack
```
delay_8
walk_right
step_end
```
### OldaleTown_Movement_BackUp
```
walk_fast_up
walk_in_place_faster_left
lock_facing_direction
walk_right
unlock_facing_direction
step_end
```
### OldaleTown_Movement_ReturnToOriginalPosition
```
walk_down
walk_left
step_end
```

## Textes (10)
### OldaleTown_Text_SavingMyProgress
```
Si je veux faire une pause, alors je\nsauvegarde ma partie.$
```
### OldaleTown_Text_IWorkAtPokemonMart
```
Bonjour! Je travaille dans une BOUTIQUE\nPOKéMON.\pJe peux t'emmener avec moi?$
```
### OldaleTown_Text_ThisIsAPokemonMart
```
C'est une BOUTIQUE POKéMON.\nOn la reconnaît à son toit bleu.\pNous vendons divers produits, dont les\nPOKé BALLS pour attraper les POKéMON.\pJ'aimerais que tu prennes ça, comme\nsi c'était une offre promotionnelle.$
```
### OldaleTown_Text_PotionExplanation
```
Une POTION s'utilise à tout moment.\nAlors dans certaines situations, c'est\lplus pratique qu'un CENTRE POKéMON.$
```
### OldaleTown_Text_WaitDontComeInHere
```
Aaaaaah! Attends!\nNe va pas par là!\pJe viens de découvrir les empreintes\nd'un POKéMON rare!\pAttends que je finisse de les\nreproduire, d'accord?$
```
### OldaleTown_Text_DiscoveredFootprints
```
Je viens juste de découvrir les\nempreintes d'un POKéMON rare!\pAttends que je finisse de les\nreproduire, d'accord?$
```
### OldaleTown_Text_FinishedSketchingFootprints
```
J'ai fini de reproduire les empreintes\nd'un POKéMON rare.\pMais je pense qu'il ne s'agit en fait\nque de mes propres pas…$
```
### OldaleTown_Text_MayLetsGoBack
```
FLORA: {PLAYER}{KUN}!\pPar là!\nVite, au LABO!$
```
### OldaleTown_Text_BrendanLetsGoBack
```
BRICE: Je retourne au LABO de\npapa, maintenant.\p{PLAYER}, tu ferais bien de n'pas tarder.$
```
### OldaleTown_Text_TownSign
```
ROSYERES\n“Là où les choses se font rares.”$
```
