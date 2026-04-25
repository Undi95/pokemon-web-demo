# LittlerootTown_MaysHouse_2F

## Métadonnées
- **id** : `MAP_LITTLEROOT_TOWN_MAYS_HOUSE_2F`
- **layout** : `LAYOUT_LITTLEROOT_TOWN_MAYS_HOUSE_2F`
- **music** : `MUS_LITTLEROOT`
- **region_map_section** : `MAPSEC_LITTLEROOT_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (16 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_RIVALS_HOUSE_2F_RIVAL` | `OBJ_EVENT_GFX_RIVAL_MAY_NORMAL` | 1,1 | `MOVEMENT_TYPE_FACE_DOWN` | `RivalsHouse_2F_EventScript_Rival` | `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_BEDROOM` |
| `` | `OBJ_EVENT_GFX_VAR_0` | 0,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_1` |
| `` | `OBJ_EVENT_GFX_VAR_1` | 1,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_2` |
| `` | `OBJ_EVENT_GFX_VAR_2` | 2,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_3` |
| `` | `OBJ_EVENT_GFX_VAR_3` | 3,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_4` |
| `` | `OBJ_EVENT_GFX_VAR_4` | 4,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_5` |
| `` | `OBJ_EVENT_GFX_VAR_5` | 5,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_6` |
| `` | `OBJ_EVENT_GFX_VAR_6` | 0,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_7` |
| `` | `OBJ_EVENT_GFX_VAR_7` | 1,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_8` |
| `` | `OBJ_EVENT_GFX_VAR_8` | 2,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_9` |
| `` | `OBJ_EVENT_GFX_VAR_9` | 3,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_10` |
| `` | `OBJ_EVENT_GFX_VAR_A` | 4,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_11` |
| `` | `OBJ_EVENT_GFX_VAR_B` | 5,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_12` |
| `LOCALID_PLAYERS_HOUSE_2F_MOM` | `OBJ_EVENT_GFX_MOM` | 1,1 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_BEDROOM_MOM` |
| `` | `OBJ_EVENT_GFX_PICHU_DOLL` | 3,4 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_PICHU_DOLL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 5,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `LittlerootTown_MaysHouse_2F_EventScript_RivalsPokeBall` | `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL` |

## Warps (1)
- #0 (1,1) → `MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F` warp #2

## BG events / signs (4)
- (5,1) [sign] → `PlayersHouse_2F_EventScript_GameCube`
- (7,1) [sign] → `PlayersHouse_2F_EventScript_Notebook`
- (3,1) [sign] → `LittlerootTown_MaysHouse_2F_EventScript_WallClock`
- (8,1) [sign] → `LittlerootTown_MaysHouse_2F_EventScript_PC`

## Flags référencés (4)
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_BEDROOM`
- `FLAG_MET_RIVAL_IN_HOUSE_AFTER_LILYCOVE`
- `FLAG_MET_RIVAL_LILYCOVE`

## Variables référencées (10)
- `VAR_0x8004`
- `VAR_BIRCH_LAB_STATE`
- `VAR_DEX_UPGRADE_JOHTO_STARTER_STATE`
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_LITTLEROOT_INTRO_STATE`
- `VAR_LITTLEROOT_RIVAL_STATE`
- `VAR_LITTLEROOT_TOWN_STATE`
- `VAR_RESULT`
- `VAR_SECRET_BASE_INITIALIZED`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PlayerHouseBootPC`
- `gText_PokemonTrainerSchoolEmail`
### data/scripts/secret_base.inc
- `SecretBase_EventScript_SetDecorationFlags`

## Scripts (40)
### LittlerootTown_MaysHouse_2F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, LittlerootTown_MaysHouse_2F_OnTransition
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, LittlerootTown_MaysHouse_2F_OnWarp
```
### LittlerootTown_MaysHouse_2F_OnTransition
```
call_if_lt VAR_LITTLEROOT_RIVAL_STATE, 2, LittlerootTown_MaysHouse_2F_EventScript_CheckSetReadyToMeetMay
call_if_ge VAR_LITTLEROOT_RIVAL_STATE, 3, LittlerootTown_MaysHouse_2F_EventScript_CheckShouldUpdateMayPos
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 4, PlayersHouse_2F_EventScript_BlockStairsUntilClockIsSet
call SecretBase_EventScript_SetDecorationFlags
setvar VAR_SECRET_BASE_INITIALIZED, 0
end
```
### LittlerootTown_MaysHouse_2F_EventScript_CheckShouldUpdateMayPos
```
goto_if_set FLAG_MET_RIVAL_LILYCOVE, LittlerootTown_MaysHouse_2F_EventScript_TryUpdateMayPos
goto_if_ge VAR_BIRCH_LAB_STATE, 2, LittlerootTown_MaysHouse_2F_EventScript_Ret
goto LittlerootTown_MaysHouse_2F_EventScript_TryUpdateMayPos
```
### LittlerootTown_MaysHouse_2F_EventScript_TryUpdateMayPos
```
checkplayergender
goto_if_eq VAR_RESULT, FEMALE, LittlerootTown_MaysHouse_2F_EventScript_Ret
goto_if_ge VAR_DEX_UPGRADE_JOHTO_STARTER_STATE, 2, LittlerootTown_MaysHouse_2F_EventScript_Ret
setobjectxyperm LOCALID_RIVALS_HOUSE_2F_RIVAL, 8, 2
setobjectmovementtype LOCALID_RIVALS_HOUSE_2F_RIVAL, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_MaysHouse_2F_EventScript_Ret
```
return
```
### LittlerootTown_MaysHouse_2F_EventScript_CheckSetReadyToMeetMay
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, LittlerootTown_MaysHouse_2F_EventScript_SetReadyToMeetMay
return
```
### LittlerootTown_MaysHouse_2F_EventScript_SetReadyToMeetMay
```
setvar VAR_LITTLEROOT_RIVAL_STATE, 2
return
```
### LittlerootTown_MaysHouse_2F_OnWarp
```
map_script_2 VAR_SECRET_BASE_INITIALIZED, 0, LittlerootTown_MaysHouse_2F_EventScript_CheckInitDecor
```
### LittlerootTown_MaysHouse_2F_EventScript_CheckInitDecor
```
checkplayergender
goto_if_eq VAR_RESULT, FEMALE, SecretBase_EventScript_InitDecorations
end
```
### LittlerootTown_MaysHouse_2F_EventScript_RivalsPokeBall
```
lockall
goto_if_eq VAR_LITTLEROOT_RIVAL_STATE, 2, LittlerootTown_MaysHouse_2F_EventScript_MeetMay
msgbox RivalsHouse_2F_Text_ItsRivalsPokeBall, MSGBOX_DEFAULT
releaseall
end
```
### LittlerootTown_MaysHouse_2F_EventScript_MeetMay
```
delay 10
addobject LOCALID_RIVALS_HOUSE_2F_RIVAL
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayEnters
waitmovement 0
playse SE_PIN
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, Common_Movement_Delay48
waitmovement 0
delay 10
playbgm MUS_ENCOUNTER_MAY, TRUE
call_if_eq VAR_FACING, DIR_NORTH, LittlerootTown_MaysHouse_2F_EventScript_MeetMayNorth
call_if_eq VAR_FACING, DIR_SOUTH, LittlerootTown_MaysHouse_2F_EventScript_MeetMaySouth
call_if_eq VAR_FACING, DIR_WEST, LittlerootTown_MaysHouse_2F_EventScript_MeetMayWest
call_if_eq VAR_FACING, DIR_EAST, LittlerootTown_MaysHouse_2F_EventScript_MeetMayEast
setvar VAR_LITTLEROOT_RIVAL_STATE, 3
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL
clearflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_BEDROOM
setvar VAR_LITTLEROOT_TOWN_STATE, 1
savebgm MUS_DUMMY
fadedefaultbgm
releaseall
end
```
### LittlerootTown_MaysHouse_2F_EventScript_MeetMayNorth
```
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerNorth
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox RivalsHouse_2F_Text_MayWhoAreYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayNorth
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCNorth
waitmovement 0
return
```
### LittlerootTown_MaysHouse_2F_EventScript_MeetMaySouth
```
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerSouth
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox RivalsHouse_2F_Text_MayWhoAreYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMaySouth
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCSouth
waitmovement 0
return
```
### LittlerootTown_MaysHouse_2F_EventScript_MeetMayWest
```
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerWest
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox RivalsHouse_2F_Text_MayWhoAreYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCWest
waitmovement 0
return
```
### LittlerootTown_MaysHouse_2F_EventScript_MeetMayEast
```
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerEast
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox RivalsHouse_2F_Text_MayWhoAreYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayEast
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCEast
waitmovement 0
return
```
### LittlerootTown_MaysHouse_2F_Movement_MayEnters
```
walk_down
walk_down
walk_in_place_faster_right
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerNorth
```
walk_right
walk_right
walk_down
walk_down
walk_right
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCNorth
```
walk_up
walk_up
walk_up
walk_in_place_faster_right
walk_right
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayNorth
```
delay_16
walk_in_place_faster_up
delay_16
delay_16
delay_16
delay_16
walk_in_place_faster_right
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerSouth
```
walk_right
walk_right
walk_right
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCSouth
```
walk_up
walk_in_place_faster_right
walk_right
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMaySouth
```
delay_16
walk_in_place_faster_up
delay_16
delay_16
walk_in_place_faster_right
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerWest
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_in_place_faster_down
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCWest
```
walk_up
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayWest
```
delay_16
delay_16
walk_in_place_faster_right
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerEast
```
walk_right
walk_right
walk_down
walk_in_place_faster_right
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCEast
```
walk_up
walk_up
walk_right
walk_right
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayEast
```
delay_16
walk_in_place_faster_up
delay_16
delay_16
walk_in_place_faster_right
step_end
```
### RivalsHouse_2F_EventScript_Rival
```
lockall
goto_if_set FLAG_MET_RIVAL_LILYCOVE, RivalsHouse_2F_EventScript_RivalPostLilycove
checkplayergender
goto_if_eq VAR_RESULT, MALE, RivalsHouse_2F_EventScript_May
goto_if_eq VAR_RESULT, FEMALE, RivalsHouse_2F_EventScript_Brendan
end
```
### RivalsHouse_2F_EventScript_May
```
msgbox RivalsHouse_2F_Text_MayGettingReady, MSGBOX_DEFAULT
releaseall
end
```
### RivalsHouse_2F_EventScript_Brendan
```
msgbox RivalsHouse_2F_Text_BrendanGettingReady, MSGBOX_DEFAULT
releaseall
end
```
### RivalsHouse_2F_EventScript_RivalPostLilycove
```
applymovement VAR_LAST_TALKED, Common_Movement_FacePlayer
waitmovement 0
checkplayergender
call_if_eq VAR_RESULT, MALE, RivalsHouse_2F_EventScript_MayPostLilycove
call_if_eq VAR_RESULT, FEMALE, RivalsHouse_2F_EventScript_BrendanPostLilycove
setflag FLAG_MET_RIVAL_IN_HOUSE_AFTER_LILYCOVE
releaseall
end
```
### RivalsHouse_2F_EventScript_MayPostLilycove
```
goto_if_set FLAG_MET_RIVAL_IN_HOUSE_AFTER_LILYCOVE, RivalsHouse_2F_EventScript_MayWhereShouldIGoNext
msgbox RivalsHouse_2F_Text_MayJustCheckingMyPokedex, MSGBOX_DEFAULT
return
```
### RivalsHouse_2F_EventScript_BrendanPostLilycove
```
goto_if_set FLAG_MET_RIVAL_IN_HOUSE_AFTER_LILYCOVE, RivalsHouse_2F_EventScript_BrendanWhereShouldIGoNext
msgbox RivalsHouse_2F_Text_BrendanJustCheckingMyPokedex, MSGBOX_DEFAULT
return
```
### RivalsHouse_2F_EventScript_MayWhereShouldIGoNext
```
msgbox RivalsHouse_2F_Text_MayWhereShouldIGoNext, MSGBOX_DEFAULT
return
```
### RivalsHouse_2F_EventScript_BrendanWhereShouldIGoNext
```
msgbox RivalsHouse_2F_Text_BrendanWhereShouldIGoNext, MSGBOX_DEFAULT
return
```
### LittlerootTown_MaysHouse_2F_EventScript_PC
```
lockall
checkplayergender
goto_if_eq VAR_RESULT, MALE, LittlerootTown_MaysHouse_2F_EventScript_CheckRivalsPC
goto_if_eq VAR_RESULT, FEMALE, LittlerootTown_MaysHouse_2F_EventScript_CheckPlayersPC
end
```
### LittlerootTown_MaysHouse_2F_EventScript_CheckRivalsPC
```
msgbox gText_PokemonTrainerSchoolEmail, MSGBOX_DEFAULT
releaseall
end
```
### LittlerootTown_MaysHouse_2F_EventScript_CheckPlayersPC
```
setvar VAR_0x8004, PC_LOCATION_MAYS_HOUSE
special DoPCTurnOnEffect
playse SE_PC_ON
msgbox gText_PlayerHouseBootPC, MSGBOX_DEFAULT
special BedroomPC
releaseall
end
```
### LittlerootTown_MaysHouse_2F_EventScript_TurnOffPlayerPC
```
setvar VAR_0x8004, PC_LOCATION_MAYS_HOUSE
playse SE_PC_OFF
special DoPCTurnOffEffect
releaseall
end
```

## Textes (9)
### RivalsHouse_2F_Text_MayWhoAreYou
```
Hein?\nQui… Qui es-tu?\p… … … … … … … …\n… … … … … … … …\pOh, tu es {PLAYER}{KUN}.\nDonc, tu as emménagé aujourd'hui.\pHeu… Je m'appelle FLORA.\nEnchantée de te rencontrer!\pJe…\nJ'ai rêvé que les POKéMON du monde\lentier devenaient mes amis.\pJ… J'ai entendu parler de toi, {PLAYER}{KUN}.\nPar mon papa, le PROF. SEKO.\pJ'espérais que tu serais sympa,\n{PLAYER}{KUN}, et qu'on pourrait devenir amis.\pOh, c'est un peu bête, non?\nJe… Je te connais à peine, {PLAYER}{KUN}.\pHi hi hi hi…\pOh, non! J'oubliais!\pJe devais aller aider papa à attraper\ndes POKéMON sauvages!\p{PLAYER}{KUN}, on se retrouve plus tard. OK?$
```
### RivalsHouse_2F_Text_MayGettingReady
```
POKéMON en pleine santé!\nObjets rangés, et… Hein?$
```
### RivalsHouse_2F_Text_BrendanWhoAreYou
```
Hé!\nToi…\pQui es-tu?\pOh, mais tu es {PLAYER}, n'est-ce pas?\nTu viens d'emménager à côté, c'est ça?\pJe ne savais pas que tu étais une fille.\pMon père, le PROF. SEKO, m'a dit que\nle père du nouvel arrivant était un\lCHAMPION D'ARENE, donc j'ai supposé\lque tu étais un garçon.\pJe m'appelle BRICE.\nEh bien, bonjour, voisine!\pMais? Hé, {PLAYER}, tu n'as pas de\nPOKéMON?\pTu veux que je t'en attrape un?\pOh, non, mince, j'oubliais…\pJe dois aller aider mon père à attraper\ndes POKéMON sauvages.\pA très bientôt, OK?$
```
### RivalsHouse_2F_Text_BrendanGettingReady
```
POKéMON en pleine santé!\nObjets rangés, et… Hein?$
```
### RivalsHouse_2F_Text_ItsRivalsPokeBall
```
C'est la POKé BALL de {RIVAL}!\pIl vaut mieux la laisser où elle est.$
```
### RivalsHouse_2F_Text_MayJustCheckingMyPokedex
```
FLORA: {PLAYER}{KUN}!\pJ'étais en train de regarder mon\nPOKéDEX.\pJ'ai déjà vu beaucoup de POKéMON,\nmais je n'en ai pas attrapé tant que ça.\pEt il y en a sûrement beaucoup qui\névoluent plus tard.\pJe me demande où je devrais aller\npour attraper des POKéMON.$
```
### RivalsHouse_2F_Text_MayWhereShouldIGoNext
```
FLORA: Je me demande où je vais aller\nattraper des POKéMON cette fois.\pÇa serait marrant si on se croisait,\ntous les deux, hein, {PLAYER}{KUN}?$
```
### RivalsHouse_2F_Text_BrendanJustCheckingMyPokedex
```
BRICE: Hé, mais c'est {PLAYER}.\pJ'étais en train de regarder mon\nPOKéDEX.\pJe sais, j'ai encore beaucoup de\nPOKéMON à attraper, mais c'est\lquand même un bon début.\pVérifier mon POKéDEX m'a donné envie\nde repartir en quête de POKéMON.$
```
### RivalsHouse_2F_Text_BrendanWhereShouldIGoNext
```
BRICE: Je ne sais pas encore où je vais\naller pour attraper des POKéMON.\pHé, {PLAYER}, si on se croise pendant que\nj'attrape des POKéMON, on pourra\lfaire un petit combat, si tu veux.$
```
