# BattleFrontier_BattleFactoryBattleRoom

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_FACTORY_BATTLE_ROOM`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_FACTORY_BATTLE_ROOM`
- **music** : `MUS_B_FACTORY`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FACTORY_BATTLE_SCIENTIST_1` | `OBJ_EVENT_GFX_SCIENTIST_1` | 0,6 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `LOCALID_FACTORY_BATTLE_OPPONENT` | `OBJ_EVENT_GFX_VAR_0` | 7,4 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `LOCALID_FACTORY_BATTLE_SCIENTIST_2` | `OBJ_EVENT_GFX_SCIENTIST_1` | 0,4 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `LOCALID_FACTORY_BATTLE_SCIENTIST_3` | `OBJ_EVENT_GFX_SCIENTIST_1` | 0,8 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `LOCALID_FACTORY_BATTLE_SCIENTIST_4` | `OBJ_EVENT_GFX_SCIENTIST_1` | 12,4 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `LOCALID_FACTORY_BATTLE_SCIENTIST_5` | `OBJ_EVENT_GFX_SCIENTIST_1` | 12,6 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `LOCALID_FACTORY_BATTLE_SCIENTIST_6` | `OBJ_EVENT_GFX_SCIENTIST_1` | 12,8 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `LOCALID_FACTORY_BATTLE_PLAYER` | `OBJ_EVENT_GFX_VAR_F` | 5,11 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `0` |

## Variables référencées (9)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_FRONTIER_BATTLE_MODE`
- `VAR_OBJ_GFX_ID_F`
- `VAR_RESULT`
- `VAR_TEMP_0`
- `VAR_TEMP_1`
- `VAR_TEMP_F`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `BattleFrontier_EventScript_IncrementWinStreak`
- `BattleFrontier_EventScript_SetBrainObjectGfx`
- `gStringVar4`

## Scripts (32)
### BattleFrontier_BattleFactoryBattleRoom_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, BattleFrontier_BattleFactoryBattleRoom_OnTransition
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, BattleFrontier_BattleFactoryBattleRoom_OnWarp
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattleFactoryBattleRoom_OnFrame
```
### BattleFrontier_BattleFactoryBattleRoom_OnTransition
```
frontier_settrainers
checkplayergender
call_if_eq VAR_RESULT, MALE, BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxMale
call_if_eq VAR_RESULT, FEMALE, BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxFemale
frontier_getbrainstatus
copyvar VAR_TEMP_F, VAR_RESULT
goto_if_ne VAR_RESULT, FRONTIER_BRAIN_NOT_READY, BattleFrontier_BattleFactoryBattleRoom_EventScript_SetUpFactoryHeadObj
end
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_SetUpFactoryHeadObj
```
call BattleFrontier_EventScript_SetBrainObjectGfx
setobjectxyperm LOCALID_FACTORY_BATTLE_OPPONENT, 7, 9
end
```
### BattleFrontier_BattleFactoryBattleRoom_OnWarp
```
map_script_2 VAR_TEMP_1, 0, BattleFrontier_BattleFactoryBattleRoom_EventScript_HideObjects
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_HideObjects
```
setvar VAR_TEMP_1, 1
hideobjectat LOCALID_PLAYER, MAP_BATTLE_FRONTIER_BATTLE_FACTORY_BATTLE_ROOM
goto_if_ne VAR_TEMP_F, FRONTIER_BRAIN_NOT_READY, BattleFrontier_BattleFactoryBattleRoom_EventScript_EndHideObjects
hideobjectat LOCALID_FACTORY_BATTLE_OPPONENT, MAP_BATTLE_FRONTIER_BATTLE_FACTORY_BATTLE_ROOM
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_EndHideObjects
```
end
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxMale
```
setvar VAR_OBJ_GFX_ID_F, OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL
return
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxFemale
```
setvar VAR_OBJ_GFX_ID_F, OBJ_EVENT_GFX_RIVAL_MAY_NORMAL
return
```
### BattleFrontier_BattleFactoryBattleRoom_OnFrame
```
map_script_2 VAR_TEMP_0, 0, BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoom
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoomFactoryHeadBattle
```
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_GetAMoveOn, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_FACTORY_BATTLE_OPPONENT, BattleFrontier_BattleFactoryBattleRoom_Movement_NolandMoveToBattle
applymovement LOCALID_FACTORY_BATTLE_PLAYER, BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerEnterRoom
applymovement LOCALID_PLAYER, BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerEnterRoom
waitmovement 0
call BattleFrontier_BattleFactoryBattleRoom_EventScript_ScientistsFaceBattle
goto BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleOpponent
end
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoom
```
goto_if_ne VAR_TEMP_F, FRONTIER_BRAIN_NOT_READY, BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoomFactoryHeadBattle
applymovement LOCALID_FACTORY_BATTLE_PLAYER, BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerEnterRoom
applymovement LOCALID_PLAYER, BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerEnterRoom
waitmovement 0
call BattleFrontier_BattleFactoryBattleRoom_EventScript_ScientistsFaceBattle
factory_setopponentgfx
removeobject LOCALID_FACTORY_BATTLE_OPPONENT
setobjectxyperm LOCALID_FACTORY_BATTLE_OPPONENT, 7, 1
addobject LOCALID_FACTORY_BATTLE_OPPONENT
applymovement LOCALID_FACTORY_BATTLE_OPPONENT, BattleFrontier_BattleFactoryBattleRoom_Movement_OpponentEnter
waitmovement 0
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleOpponent
```
goto_if_ne VAR_TEMP_F, FRONTIER_BRAIN_NOT_READY, BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNoland
palace_getopponentintro
lockall
msgbox gStringVar4, MSGBOX_DEFAULT
waitmessage
closemessage
frontier_set FRONTIER_DATA_RECORD_DISABLED, FALSE
special HealPlayerParty
setvar VAR_0x8004, SPECIAL_BATTLE_FACTORY
setvar VAR_0x8005, 0
special DoSpecialTrainerBattle
switch VAR_RESULT
case 1, BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedOpponent
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyLost
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_LOST
goto BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobby
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedOpponent
```
factory_get FACTORY_DATA_WIN_STREAK_SWAPS
goto_if_eq VAR_RESULT, MAX_STREAK, BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementWinStreak
addvar VAR_RESULT, 1
setorcopyvar VAR_0x8006, VAR_RESULT
factory_set FACTORY_DATA_WIN_STREAK_SWAPS  @ uses VAR_0x8006 above
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementWinStreak
```
call BattleFrontier_EventScript_IncrementWinStreak
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementBattleNum
```
frontier_get FRONTIER_DATA_BATTLE_NUM
addvar VAR_RESULT, 1
frontier_set FRONTIER_DATA_BATTLE_NUM, VAR_RESULT
switch VAR_RESULT
case 7, BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyWon
setvar VAR_0x8006, 1
warp MAP_BATTLE_FRONTIER_BATTLE_FACTORY_PRE_BATTLE_ROOM, 8, 8
waitstate
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyWon
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_WON
goto BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobby
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNoland
```
switch VAR_TEMP_F
case FRONTIER_BRAIN_GOLD, BattleFrontier_BattleFactoryBattleRoom_EventScript_IntroNolandGold
case FRONTIER_BRAIN_STREAK, BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandSilver
case FRONTIER_BRAIN_STREAK_LONG, BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandGold
frontier_get FRONTIER_DATA_HEARD_BRAIN_SPEECH
goto_if_ne VAR_RESULT, FALSE, BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandSilver
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_NolandImFactoryHead, MSGBOX_DEFAULT
frontier_set FRONTIER_DATA_HEARD_BRAIN_SPEECH
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandSilver
```
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_ShakeOutKnowledgeBringItOn, MSGBOX_DEFAULT
call BattleFrontier_BattleFactoryBattleRoom_EventScript_DoNolandBattle
goto_if_eq VAR_RESULT, 1, BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandSilver
goto BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyLost
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandSilver
```
frontier_getsymbols
goto_if_ne VAR_RESULT, 0, BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNoland
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_NolandLetsSeeFrontierPass, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_FACTORY_BATTLE_PLAYER, BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerApproachNoland
waitmovement 0
playfanfare MUS_OBTAIN_SYMBOL
message BattleFrontier_BattleFactoryBattleRoom_Text_ReceivedKnowledgeSymbol
waitmessage
waitfanfare
frontier_givesymbol
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_NextTimeNoHoldsBarred, MSGBOX_DEFAULT
goto BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNoland
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_IntroNolandGold
```
frontier_get FRONTIER_DATA_HEARD_BRAIN_SPEECH
goto_if_ne VAR_RESULT, FALSE, BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandGold
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_HarderLookThanLastTime, MSGBOX_DEFAULT
frontier_set FRONTIER_DATA_HEARD_BRAIN_SPEECH
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandGold
```
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_AllRightBringItOn, MSGBOX_DEFAULT
call BattleFrontier_BattleFactoryBattleRoom_EventScript_DoNolandBattle
goto_if_eq VAR_RESULT, 1, BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandGold
goto BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyLost
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandGold
```
frontier_getsymbols
goto_if_eq VAR_RESULT, 2, BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNoland
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_OutOfMyLeagueLetsSeePass, MSGBOX_DEFAULT
waitmessage
applymovement LOCALID_FACTORY_BATTLE_PLAYER, BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerApproachNoland
waitmovement 0
playfanfare MUS_OBTAIN_SYMBOL
message BattleFrontier_BattleFactoryBattleRoom_Text_KnowledgeSymbolTookGoldenShine
waitmessage
waitfanfare
frontier_givesymbol
msgbox BattleFrontier_BattleFactoryBattleRoom_Text_LastTimeILoseToYou, MSGBOX_DEFAULT
goto BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNoland
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_DoNolandBattle
```
closemessage
frontier_set FRONTIER_DATA_RECORD_DISABLED, FALSE
special HealPlayerParty
setvar VAR_0x8004, SPECIAL_BATTLE_FACTORY
setvar VAR_0x8005, 0
special DoSpecialTrainerBattle
return
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNoland
```
factory_get FACTORY_DATA_WIN_STREAK_SWAPS
goto_if_eq VAR_RESULT, MAX_STREAK, BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementWinStreak
addvar VAR_RESULT, 1
setorcopyvar VAR_0x8006, VAR_RESULT
factory_set FACTORY_DATA_WIN_STREAK_SWAPS  @ uses VAR_0x8006 above
factory_get FACTORY_DATA_WIN_STREAK
goto_if_eq VAR_RESULT, MAX_STREAK, BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementBattleNum
addvar VAR_RESULT, 1
factory_set FACTORY_DATA_WIN_STREAK, VAR_RESULT
frontier_get FRONTIER_DATA_BATTLE_NUM
addvar VAR_RESULT, 1
goto BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyWon
end
```
### BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerEnterRoom
```
walk_up
walk_up
walk_up
walk_up
walk_up
face_right
step_end
```
### BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerApproachNoland
```
walk_right
step_end
```
### BattleFrontier_BattleFactoryBattleRoom_Movement_OpponentEnter
```
walk_down
walk_down
walk_down
walk_down
walk_down
face_left
step_end
```
### BattleFrontier_BattleFactoryBattleRoom_Movement_NolandMoveToBattle
```
walk_up
walk_up
walk_up
face_left
step_end
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobby
```
copyvar VAR_RESULT, VAR_FRONTIER_BATTLE_MODE
goto_if_eq VAR_RESULT, FRONTIER_MODE_DOUBLES, BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyDoubles
warp MAP_BATTLE_FRONTIER_BATTLE_FACTORY_LOBBY, 4, 8
waitstate
end
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyDoubles
```
warp MAP_BATTLE_FRONTIER_BATTLE_FACTORY_LOBBY, 14, 8
waitstate
end
```
### BattleFrontier_BattleFactoryBattleRoom_EventScript_ScientistsFaceBattle
```
applymovement LOCALID_FACTORY_BATTLE_SCIENTIST_1, Common_Movement_WalkInPlaceFasterRight
applymovement LOCALID_FACTORY_BATTLE_SCIENTIST_2, Common_Movement_WalkInPlaceFasterRight
applymovement LOCALID_FACTORY_BATTLE_SCIENTIST_3, Common_Movement_WalkInPlaceFasterRight
applymovement LOCALID_FACTORY_BATTLE_SCIENTIST_4, Common_Movement_WalkInPlaceFasterLeft
applymovement LOCALID_FACTORY_BATTLE_SCIENTIST_5, Common_Movement_WalkInPlaceFasterLeft
applymovement LOCALID_FACTORY_BATTLE_SCIENTIST_6, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
return
```

## Textes (11)
### BattleFrontier_BattleFactoryBattleRoom_Text_GetAMoveOn
```
Hé, toi!\nAvance!$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_NolandImFactoryHead
```
Je m'appelle SAM!\nC'est moi le responsable de cet endroit,\lje suis le CHEF D'USINE!\pJ'ai regardé tes scores au COMBAT\nECHANGE.\pTu as de bonnes idées, mais ce n'est\npas encore tout à fait ça!\pEcoute-moi. Lire des livres et faire des\nexercices, ça ne suffit pas.\pEn fait…\nSans la pratique, ça ne sert à rien!\pTu dois travailler avec ton cœur et ton\ncorps, tu comprends?\pJe vais me battre dans les mêmes\nconditions que toi.\pMoi aussi, je vais utiliser des POKéMON\nde location!$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_ShakeOutKnowledgeBringItOn
```
Creuse-toi la tête, sors ta science et\nbats-toi!$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_NolandLetsSeeFrontierPass
```
SAM: Joli combat!\nMontre-moi ton PASSE ZONE.$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_ReceivedKnowledgeSymbol
```
Le SYMBOLE SAVOIR a été ajouté sur le\nPASSE ZONE!$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_NextTimeNoHoldsBarred
```
Hé…\nTu sais de quoi tu parles…\pLa prochaine fois je ne te laisserai\naucune chance, compris?\pContinue d'étudier!$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_HarderLookThanLastTime
```
SAM: Hé! Comment vas-tu?\nTu continues d'étudier?\pOh?\pTon regard est plus dur que la dernière\nfois.\pJe crois que je vais bien m'amuser!\nJe suis impatient de commencer!$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_AllRightBringItOn
```
Allez!\nAu combat!$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_OutOfMyLeagueLetsSeePass
```
SAM: Mais…\nTu es déjà au niveau supérieur!\pPfff!\nTon PASSE ZONE…$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_KnowledgeSymbolTookGoldenShine
```
Le SYMBOLE SAVOIR a pris une couleur\ndorée!$
```
### BattleFrontier_BattleFactoryBattleRoom_Text_LastTimeILoseToYou
```
Pfff!\pC'est la dernière fois que je perds\ncontre toi!\pOn refera un combat, d'accord?$
```
