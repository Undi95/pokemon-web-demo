# SootopolisCity_MysteryEventsHouse_1F

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_1F`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_1F`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MYSTERY_EVENTS_OLD_MAN` | `OBJ_EVENT_GFX_OLD_MAN` | 6,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `SootopolisCity_MysteryEventsHouse_1F_EventScript_OldMan` | `0` |

## Warps (3)
- #0 (3,7) → `MAP_SOOTOPOLIS_CITY` warp #12
- #1 (4,7) → `MAP_SOOTOPOLIS_CITY` warp #12
- #2 (3,1) → `MAP_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_B1F` warp #0

## Variables référencées (5)
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/std_msgbox.inc
- `Common_EventScript_SaveGame`

## Scripts (24)
### SootopolisCity_MysteryEventsHouse_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SootopolisCity_MysteryEventsHouse_1F_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, SootopolisCity_MysteryEventsHouse_1F_OnFrame
```
### SootopolisCity_MysteryEventsHouse_1F_OnTransition
```
frontier_checkvisittrainer
call_if_eq VAR_RESULT, 0, SootopolisCity_MysteryEventsHouse_1F_EventScript_SetTrainerVisitingLayout
call_if_ne VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 0, SootopolisCity_MysteryEventsHouse_1F_EventScript_MoveOldManToDoor
end
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_SetTrainerVisitingLayout
```
setvar VAR_TEMP_1, 1
setobjectxyperm LOCALID_MYSTERY_EVENTS_OLD_MAN, 3, 2
setobjectmovementtype LOCALID_MYSTERY_EVENTS_OLD_MAN, MOVEMENT_TYPE_FACE_DOWN
setmaplayoutindex LAYOUT_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_1F_STAIRS_UNBLOCKED
return
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_MoveOldManToDoor
```
setobjectxyperm LOCALID_MYSTERY_EVENTS_OLD_MAN, 2, 2
setobjectmovementtype LOCALID_MYSTERY_EVENTS_OLD_MAN, MOVEMENT_TYPE_FACE_RIGHT
return
```
### SootopolisCity_MysteryEventsHouse_1F_OnFrame
```
map_script_2 VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 1, SootopolisCity_MysteryEventsHouse_1F_EventScript_OldManCommentOnBattle
map_script_2 VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 2, SootopolisCity_MysteryEventsHouse_1F_EventScript_OldManCommentOnBattle
map_script_2 VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 3, SootopolisCity_MysteryEventsHouse_1F_EventScript_OldManCommentOnBattle
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_OldManCommentOnBattle
```
lockall
applymovement LOCALID_PLAYER, SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerExitStairs
waitmovement 0
applymovement LOCALID_MYSTERY_EVENTS_OLD_MAN, SootopolisCity_MysteryEventsHouse_1F_Movement_OldManWalkBehindPlayer
waitmovement 0
copyobjectxytoperm LOCALID_MYSTERY_EVENTS_OLD_MAN
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
call_if_eq VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 1, SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleWonComment
call_if_eq VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 2, SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleLostComment
call_if_eq VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 3, SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleTiedComment
special LoadPlayerParty
setvar VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 0
releaseall
end
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleWonComment
```
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_ThatWasSuperlative, MSGBOX_DEFAULT
return
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleLostComment
```
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_TooBadForYou, MSGBOX_DEFAULT
return
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_BattleTiedComment
```
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_BrilliantStandoff, MSGBOX_DEFAULT
return
```
### SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerExitStairs
```
walk_down
step_end
```
### SootopolisCity_MysteryEventsHouse_1F_Movement_OldManWalkBehindPlayer
```
walk_right
walk_in_place_faster_down
step_end
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_OldMan
```
lock
faceplayer
frontier_checkvisittrainer
goto_if_eq VAR_RESULT, 1, SootopolisCity_MysteryEventsHouse_1F_EventScript_InvalidVisitingTrainer
goto_if_eq VAR_TEMP_1, 1, SootopolisCity_MysteryEventsHouse_1F_EventScript_TrainerVisiting
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_OnlyAmusementWatchingBattles, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_InvalidVisitingTrainer
```
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_OnlyAmusementWatchingBattles, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_TrainerVisiting
```
special SavePlayerParty
special BufferEReaderTrainerName
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_ChallengeVisitingTrainer, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle
call SootopolisCity_MysteryEventsHouse_1F_EventScript_ChooseParty
goto_if_eq VAR_RESULT, 0, SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_SaveProgressBeforeBattle, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle
special LoadPlayerParty
call Common_EventScript_SaveGame
goto_if_eq VAR_RESULT, FALSE, SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle
special SavePlayerParty
special ReducePlayerPartyToSelectedMons
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_HopeToSeeGoodMatch, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_FACING, DIR_NORTH, SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementNorth
call_if_eq VAR_FACING, DIR_EAST, SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementEast
call_if_eq VAR_FACING, DIR_WEST, SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementWest
warp MAP_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_B1F, 3, 1
waitstate
release
end
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_DeclineBattle
```
special LoadPlayerParty
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_YouWontBattle, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_ChooseParty
```
msgbox SootopolisCity_MysteryEventsHouse_1F_Text_KeepItTo3On3, MSGBOX_DEFAULT
fadescreen FADE_TO_BLACK
special ChooseHalfPartyForBattle
return
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementNorth
```
applymovement VAR_LAST_TALKED, SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideLeft
applymovement LOCALID_PLAYER, SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementNorth
waitmovement 0
return
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementEast
```
applymovement VAR_LAST_TALKED, SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideRight
applymovement LOCALID_PLAYER, SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementEast
waitmovement 0
return
```
### SootopolisCity_MysteryEventsHouse_1F_EventScript_EnterBasementWest
```
applymovement VAR_LAST_TALKED, SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideLeft
applymovement LOCALID_PLAYER, SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementWest
waitmovement 0
return
```
### SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementNorth
```
delay_16
walk_up
walk_up
step_end
```
### SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementEast
```
delay_16
walk_right
walk_up
step_end
```
### SootopolisCity_MysteryEventsHouse_1F_Movement_PlayerEnterBasementWest
```
delay_16
walk_left
walk_up
step_end
```
### SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideLeft
```
walk_left
walk_in_place_faster_right
step_end
```
### SootopolisCity_MysteryEventsHouse_1F_Movement_OldManMoveAsideRight
```
walk_right
walk_in_place_faster_left
step_end
```

## Textes (14)
### SootopolisCity_MysteryEventsHouse_1F_Text_OnlyAmusementWatchingBattles
```
Quand j'étais jeune, j'étais DRESSEUR\nde POKéMON et j'ai parcouru le monde.\pMaintenant que je ne suis plus qu'un\nvieillard, mon seul plaisir, c'est de voir\lles combats des jeunes DRESSEURS.$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_DoorAppearsToBeLocked
```
The door appears to be locked.$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_ChallengeVisitingTrainer
```
Un DRESSEUR nommé {STR_VAR_1}\nest ici pour me rendre visite.\pÇa te dirait de te battre contre\n{STR_VAR_1}?$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_YouWontBattle
```
Tu ne vas pas combattre? Je suis déçu\nde ne pas pouvoir te voir au combat…$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_KeepItTo3On3
```
Bon, très bien!\pMais ma maison n'est pas si solide\nque ça!\pOn se contente d'un combat 3 contre 3?$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_SaveProgressBeforeBattle
```
Avant de combattre, tu devrais\nsauvegarder ta partie.$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_HopeToSeeGoodMatch
```
J'espère voir un beau combat!$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_StrVar1Tie
```
{STR_VAR_1}$
```
### SootopolisCity_MysteryEventsHouse_B1F_Text_MatchEndedUpDraw
```
Il y a égalité.$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_BrilliantStandoff
```
Il est impossible de vous départager.\pC'était un excellent combat, au cours\nduquel personne n'a rien concédé!$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_StrVar1Won
```
{STR_VAR_1}$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_ThatWasSuperlative
```
Excellent!\pJe me suis revu dans ma jeunesse!$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_StrVar1Lost
```
{STR_VAR_1}$
```
### SootopolisCity_MysteryEventsHouse_1F_Text_TooBadForYou
```
Ah, dommage pour toi!\pMais c'était un beau combat. J'espère\nque tu gagneras la prochaine fois.$
```
