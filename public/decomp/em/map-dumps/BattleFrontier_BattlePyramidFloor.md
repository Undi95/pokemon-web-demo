# BattleFrontier_BattlePyramidFloor

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR`
- **music** : `MUS_NONE`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Object events (16 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 0,0 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 1,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 2,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 3,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 4,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 5,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 6,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 7,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 0,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 1,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 3,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 4,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 5,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 6,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 7,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 2,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |

## Variables référencées (9)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_0x8007`
- `VAR_RESULT`
- `VAR_TEMP_CHALLENGE_STATUS`
- `VAR_TEMP_D`
- `VAR_TEMP_F`
- `VAR_TEMP_PLAYING_PYRAMID_MUSIC`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `BattleFrontier_EventScript_IncrementWinStreak`

## Scripts (19)
### BattleFrontier_BattlePyramidFloor_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, BattleFrontier_BattlePyramidFloor_OnResume
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattlePyramidFloor_OnFrame
map_script MAP_SCRIPT_ON_TRANSITION, BattleFrontier_BattlePyramidFloor_OnTransition
```
### BattleFrontier_BattlePyramidFloor_OnFrame
```
map_script_2 VAR_TEMP_D, 1, BattleFrontier_BattlePyramidFloor_EventScript_UpdateLight
map_script_2 VAR_TEMP_PLAYING_PYRAMID_MUSIC, 0, BattleFrontier_BattlePyramidFloor_EventScript_PlayPyramidMusic
map_script_2 VAR_TEMP_F, 1, BattleFrontier_BattlePyramidFloor_EventScript_ShowMapName
```
### BattleFrontier_BattlePyramidFloor_EventScript_UpdateLight
```
lockall
setvar VAR_0x8004, BATTLE_PYRAMID_FUNC_UPDATE_LIGHT
setvar VAR_0x8005, 4
setvar VAR_0x8006, PYRAMID_LIGHT_INCR_RADIUS
setvar VAR_0x8007, SE_SAVE
setvar VAR_RESULT, 0
```
### BattleFrontier_BattlePyramidFloor_EventScript_UpdateLightLoop
```
special CallBattlePyramidFunction
delay 2
goto_if_ne VAR_RESULT, 2, BattleFrontier_BattlePyramidFloor_EventScript_UpdateLightLoop
setvar VAR_TEMP_D, 0
releaseall
end
```
### BattleFrontier_BattlePyramidFloor_EventScript_ShowMapName
```
special ShowMapNamePopup
setvar VAR_TEMP_F, 0
end
```
### BattleFrontier_BattlePyramidFloor_EventScript_PlayPyramidMusic
```
playbgm MUS_B_PYRAMID, FALSE
setvar VAR_TEMP_PLAYING_PYRAMID_MUSIC, 1
end
```
### BattleFrontier_BattlePyramidFloor_OnResume
```
pyramid_setfloorpal
frontier_getstatus
switch VAR_TEMP_CHALLENGE_STATUS
case 0, BattleFrontier_BattlePyramidFloor_EventScript_ReadyChallenge
case CHALLENGE_STATUS_SAVING, BattleFrontier_BattlePyramid_EventScript_WarpToLobby
case CHALLENGE_STATUS_PAUSED, BattleFrontier_BattlePyramidFloor_EventScript_ReadyChallenge
frontier_get FRONTIER_DATA_BATTLE_OUTCOME
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, BattleFrontier_BattlePyramidFloor_EventScript_ResetParty
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, BattleFrontier_BattlePyramidFloor_EventScript_ResetParty
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattlePyramidFloor_EventScript_ResetParty
goto_if_eq VAR_RESULT, B_OUTCOME_LOST, BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost
goto_if_eq VAR_RESULT, B_OUTCOME_DREW, BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost
goto_if_eq VAR_RESULT, B_OUTCOME_FORFEITED, BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost
frontier_isbattletype BATTLE_TYPE_TRAINER  @ VAR_RESULT seems to be ignored here
setvar VAR_TEMP_D, 1
```
### BattleFrontier_BattlePyramidFloor_EventScript_ResetParty
```
pyramid_resetparty
end
```
### BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_LOST
pyramid_set PYRAMID_DATA_TRAINER_FLAGS, 255
```
### BattleFrontier_BattlePyramid_EventScript_WarpToLobby
```
pyramid_updatelight 0, PYRAMID_LIGHT_SET_RADIUS
pyramid_clearhelditems
special HealPlayerParty
warpsilent MAP_BATTLE_FRONTIER_BATTLE_PYRAMID_LOBBY, 7, 13
waitstate
end
```
### BattleFrontier_BattlePyramidFloor_EventScript_ReadyChallenge
```
pyramid_save CHALLENGE_STATUS_SAVING
special SavePlayerParty
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
pyramid_settrainers
frontier_setpartyorder FRONTIER_PARTY_SIZE
setvar VAR_TEMP_F, 1
end
```
### BattleFrontier_BattlePyramidFloor_OnTransition
```
call BattleFrontier_BattlePyramidFloor_EventScript_SetLightRadius
setvar VAR_TEMP_F, 1
end
```
### BattleFrontier_BattlePyramidFloor_EventScript_SetLightRadius
```
pyramid_updatelight 32, PYRAMID_LIGHT_SET_RADIUS
return
```
### BattlePyramid_WarpToNextFloor
```
call BattleFrontier_EventScript_IncrementWinStreak
frontier_get FRONTIER_DATA_BATTLE_NUM  @ Floor number
addvar VAR_RESULT, 1
frontier_set FRONTIER_DATA_BATTLE_NUM, VAR_RESULT
goto_if_eq VAR_RESULT, 7, BattlePyramid_WarpToTop
pyramid_seedfloor
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
setvar VAR_RESULT, 0
warp MAP_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR, 1, 1
waitstate
end
```
### BattlePyramid_WarpToTop
```
warp MAP_BATTLE_FRONTIER_BATTLE_PYRAMID_TOP, 17, 17
waitstate
end
```
### BattlePyramid_TrainerBattle
```
trainerbattle TRAINER_BATTLE_PYRAMID, TRAINER_PHILLIP, LOCALID_NONE, BattleFacility_TrainerBattle_PlaceholderText, BattleFacility_TrainerBattle_PlaceholderText
pyramid_showhint
waitmessage
waitbuttonpress
closemessage
releaseall
end
```
### BattlePyramid_FindItemBall
```
pyramid_setitem
callstd STD_FIND_ITEM
goto_if_eq VAR_0x8007, 0, BattlePyramid_FindItemBallEnd
pyramid_hideitem
```
### BattlePyramid_FindItemBallEnd
```
end
```
### BattlePyramid_Retire
```
goto BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost
```

## Textes (129)
### BattleFacility_TrainerBattle_PlaceholderText
```
C'est le message d'essai.$
```
### gText_BattlePyramidConfirmRest
```
Votre quête à la PYRAMIDE DE COMBAT\nsera sauvegardée pour que vous\lpuissiez faire une pause. OK?$
```
### gText_BattlePyramidConfirmRetire
```
Voulez-vous vraiment abandonner votre\nquête à la PYRAMIDE?$
```
### BattlePyramid_Text_ExitHintUp1
```
Pour sortir de ce niveau, il faut aller\ndans cette direction: {UP_ARROW}.$
```
### BattlePyramid_Text_ExitHintLeft1
```
Pour sortir de ce niveau, il faut aller\ndans cette direction: {LEFT_ARROW}.$
```
### BattlePyramid_Text_ExitHintRight1
```
Pour sortir de ce niveau, il faut aller\ndans cette direction: {RIGHT_ARROW}.$
```
### BattlePyramid_Text_ExitHintDown1
```
Pour sortir de ce niveau, il faut aller\ndans cette direction: {DOWN_ARROW}.$
```
### BattlePyramid_Text_ExitHintUp2
```
La sortie de ce niveau se trouve\ndans cette direction: {UP_ARROW}.$
```
### BattlePyramid_Text_ExitHintLeft2
```
La sortie de ce niveau se trouve\ndans cette direction: {LEFT_ARROW}.$
```
### BattlePyramid_Text_ExitHintRight2
```
La sortie de ce niveau se trouve\ndans cette direction: {RIGHT_ARROW}.$
```
### BattlePyramid_Text_ExitHintDown2
```
La sortie de ce niveau se trouve\ndans cette direction: {DOWN_ARROW}.$
```
### BattlePyramid_Text_ExitHintUp3
```
Va dans la direction {UP_ARROW}\npour sortir.$
```
### BattlePyramid_Text_ExitHintLeft3
```
Va dans la direction {LEFT_ARROW}\npour sortir.$
```
### BattlePyramid_Text_ExitHintRight3
```
Va dans la direction {RIGHT_ARROW}\npour sortir.$
```
### BattlePyramid_Text_ExitHintDown3
```
Va dans la direction {DOWN_ARROW}\npour sortir.$
```
### BattlePyramid_Text_ExitHintUp4
```
A ce niveau, la sortie se trouve\npar là: {UP_ARROW}.$
```
### BattlePyramid_Text_ExitHintLeft4
```
A ce niveau, la sortie se trouve\npar là: {LEFT_ARROW}.$
```
### BattlePyramid_Text_ExitHintRight4
```
A ce niveau, la sortie se trouve\npar là: {RIGHT_ARROW}.$
```
### BattlePyramid_Text_ExitHintDown4
```
A ce niveau, la sortie se trouve\npar là: {DOWN_ARROW}.$
```
### BattlePyramid_Text_ExitHintUp5
```
La sortie?\nC'est par là, mon petit: {UP_ARROW}.$
```
### BattlePyramid_Text_ExitHintLeft5
```
La sortie?\nC'est par là, mon petit: {LEFT_ARROW}.$
```
### BattlePyramid_Text_ExitHintRight5
```
La sortie?\nC'est par là, mon petit: {RIGHT_ARROW}.$
```
### BattlePyramid_Text_ExitHintDown5
```
La sortie?\nC'est par là, mon petit: {DOWN_ARROW}.$
```
### BattlePyramid_Text_ExitHintUp6
```
Pour sortir de ce niveau, va dans\ncette direction: {UP_ARROW}.$
```
### BattlePyramid_Text_ExitHintLeft6
```
Pour sortir de ce niveau, va dans\ncette direction: {LEFT_ARROW}.$
```
### BattlePyramid_Text_ExitHintRight6
```
Pour sortir de ce niveau, va dans\ncette direction: {RIGHT_ARROW}.$
```
### BattlePyramid_Text_ExitHintDown6
```
Pour sortir de ce niveau, va dans\ncette direction: {DOWN_ARROW}.$
```
### BattlePyramid_Text_EightItemsRemaining1
```
Tu cherches des objets?\pIl reste huit objets à trouver.$
```
### BattlePyramid_Text_SevenItemsRemaining1
```
Tu cherches des objets?\pIl reste sept objets à trouver.$
```
### BattlePyramid_Text_SixItemsRemaining1
```
Tu cherches des objets?\pIl reste six objets à trouver.$
```
### BattlePyramid_Text_FiveItemsRemaining1
```
Tu cherches des objets?\pIl reste cinq objets à trouver.$
```
### BattlePyramid_Text_FourItemsRemaining1
```
Tu cherches des objets?\pIl reste quatre objets à trouver.$
```
### BattlePyramid_Text_ThreeItemsRemaining1
```
Tu cherches des objets?\pIl reste trois objets à trouver.$
```
### BattlePyramid_Text_TwoItemsRemaining1
```
Tu cherches des objets?\pIl reste deux objets à trouver.$
```
### BattlePyramid_Text_OneItemRemaining1
```
Tu cherches des objets?\pIl reste un objet à trouver.$
```
### BattlePyramid_Text_ZeroItemsRemaining1
```
Tu cherches des objets?\pIl n'y a plus d'objets à trouver!$
```
### BattlePyramid_Text_EightItemsRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl y a huit objets à trouver.$
```
### BattlePyramid_Text_SevenItemsRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl y a sept objets à trouver.$
```
### BattlePyramid_Text_SixItemsRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl y a six objets à trouver.$
```
### BattlePyramid_Text_FiveItemsRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl y a cinq objets à trouver.$
```
### BattlePyramid_Text_FourItemsRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl y a quatre objets à trouver.$
```
### BattlePyramid_Text_ThreeItemsRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl y a trois objets à trouver.$
```
### BattlePyramid_Text_TwoItemsRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl y a deux objets à trouver.$
```
### BattlePyramid_Text_OneItemRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl y a un objet à trouver.$
```
### BattlePyramid_Text_ZeroItemsRemaining2
```
Tu as gagné, alors je vais te confier\nun petit secret!\pIl n'y a plus d'objets à trouver.$
```
### BattlePyramid_Text_EightItemsRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il reste huit objets à\nramasser par terre.$
```
### BattlePyramid_Text_SevenItemsRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il reste sept objets à\nramasser par terre.$
```
### BattlePyramid_Text_SixItemsRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il reste six objets à\nramasser par terre.$
```
### BattlePyramid_Text_FiveItemsRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il reste cinq objets à\nramasser par terre.$
```
### BattlePyramid_Text_FourItemsRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il reste quatre objets à\nramasser par terre.$
```
### BattlePyramid_Text_ThreeItemsRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il reste trois objets à\nramasser par terre.$
```
### BattlePyramid_Text_TwoItemsRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il reste deux objets à\nramasser par terre.$
```
### BattlePyramid_Text_OneItemRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il reste un objet à\nramasser par terre.$
```
### BattlePyramid_Text_ZeroItemsRemaining3
```
Comment se porte ton stock d'objets?\pJe dirais qu'il ne reste plus d'objets à\nramasser par terre.$
```
### BattlePyramid_Text_EightItemsRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il reste huit objets\nà ramasser.$
```
### BattlePyramid_Text_SevenItemsRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il reste sept objets\nà ramasser.$
```
### BattlePyramid_Text_SixItemsRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il reste six objets\nà ramasser.$
```
### BattlePyramid_Text_FiveItemsRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il reste cinq objets\nà ramasser.$
```
### BattlePyramid_Text_FourItemsRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il reste quatre objets\nà ramasser.$
```
### BattlePyramid_Text_ThreeItemsRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il reste trois objets\nà ramasser.$
```
### BattlePyramid_Text_TwoItemsRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il reste deux objets\nà ramasser.$
```
### BattlePyramid_Text_OneItemRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il reste un objet\nà ramasser.$
```
### BattlePyramid_Text_ZeroItemsRemaining4
```
Tu es balèze, tu as bien mérité\nune information!\pIl semble qu'il ne reste aucun objet\nà ramasser.$
```
### BattlePyramid_Text_EightItemsRemaining5
```
A ce niveau de la PYRAMIDE,\nil y a huit objets à trouver…$
```
### BattlePyramid_Text_SevenItemsRemaining5
```
A ce niveau de la PYRAMIDE,\nil y a sept objets à trouver…$
```
### BattlePyramid_Text_SixItemsRemaining5
```
A ce niveau de la PYRAMIDE,\nil y a six objets à trouver…$
```
### BattlePyramid_Text_FiveItemsRemaining5
```
A ce niveau de la PYRAMIDE,\nil y a cinq objets à trouver…$
```
### BattlePyramid_Text_FourItemsRemaining5
```
A ce niveau de la PYRAMIDE,\nil y a quatre objets à trouver…$
```
### BattlePyramid_Text_ThreeItemsRemaining5
```
A ce niveau de la PYRAMIDE,\nil y a trois objets à trouver…$
```
### BattlePyramid_Text_TwoItemsRemaining5
```
A ce niveau de la PYRAMIDE,\nil y a deux objets à trouver…$
```
### BattlePyramid_Text_OneItemRemaining5
```
A ce niveau de la PYRAMIDE,\nil y a un objet à trouver…$
```
### BattlePyramid_Text_ZeroItemsRemaining5
```
A ce niveau de la PYRAMIDE,\nil n'y a pas d'objets à trouver…$
```
### BattlePyramid_Text_EightItemsRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il en reste huit à ce\nniveau.$
```
### BattlePyramid_Text_SevenItemsRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il en reste sept à ce\nniveau.$
```
### BattlePyramid_Text_SixItemsRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il en reste six à ce\nniveau.$
```
### BattlePyramid_Text_FiveItemsRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il en reste cinq à ce\nniveau.$
```
### BattlePyramid_Text_FourItemsRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il en reste quatre à ce\nniveau.$
```
### BattlePyramid_Text_ThreeItemsRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il en reste trois à ce\nniveau.$
```
### BattlePyramid_Text_TwoItemsRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il en reste deux à ce\nniveau.$
```
### BattlePyramid_Text_OneItemRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il en reste un à ce\nniveau.$
```
### BattlePyramid_Text_ZeroItemsRemaining6
```
Est-ce que tu as trouvé des objets?\pJe pense qu'il n'en reste plus à ce\nniveau.$
```
### BattlePyramid_Text_SevenTrainersRemaining1
```
Tu as été formidable!\pMais il y a encore sept DRESSEURS\nà battre!$
```
### BattlePyramid_Text_SixTrainersRemaining1
```
Tu as été formidable!\pMais il y a encore six DRESSEURS\nà battre!$
```
### BattlePyramid_Text_FiveTrainersRemaining1
```
Tu as été formidable!\pMais il y a encore cinq DRESSEURS\nà battre!$
```
### BattlePyramid_Text_FourTrainersRemaining1
```
Tu as été formidable!\pMais il y a encore quatre DRESSEURS\nà battre!$
```
### BattlePyramid_Text_ThreeTrainersRemaining1
```
Tu as été formidable!\pMais il y a encore trois DRESSEURS\nà battre!$
```
### BattlePyramid_Text_TwoTrainersRemaining1
```
Tu as été formidable!\pMais il y a encore deux DRESSEURS\nà battre!$
```
### BattlePyramid_Text_OneTrainersRemaining1
```
Tu as été formidable!\pMais il y a encore un DRESSEUR\nà battre!$
```
### BattlePyramid_Text_ZeroTrainersRemaining1
```
Tu as été formidable!\pIl n'y a plus de DRESSEUR\nà battre!$
```
### BattlePyramid_Text_SevenTrainersRemaining2
```
C'est rageant!\pMais il y a sept autres DRESSEURS!\nTu ne résisteras pas!$
```
### BattlePyramid_Text_SixTrainersRemaining2
```
C'est rageant!\pMais il y a six autres DRESSEURS!\nTu ne résisteras pas!$
```
### BattlePyramid_Text_FiveTrainersRemaining2
```
C'est rageant!\pMais il y a cinq autres DRESSEURS!\nTu ne résisteras pas!$
```
### BattlePyramid_Text_FourTrainersRemaining2
```
C'est rageant!\pMais il y a quatre autres DRESSEURS!\nTu ne résisteras pas!$
```
### BattlePyramid_Text_ThreeTrainersRemaining2
```
C'est rageant!\pMais il y a trois autres DRESSEURS!\nTu ne résisteras pas!$
```
### BattlePyramid_Text_TwoTrainersRemaining2
```
C'est rageant!\pMais il y a deux autres DRESSEURS!\nTu ne résisteras pas!$
```
### BattlePyramid_Text_OneTrainersRemaining2
```
C'est rageant!\pMais il y a un autre DRESSEUR!\nTu ne résisteras pas!$
```
### BattlePyramid_Text_ZeroTrainersRemaining2
```
C'est rageant!\pIl ne reste plus de DRESSEUR!$
```
### BattlePyramid_Text_SevenTrainersRemaining3
```
C'est impressionnant!\pIl reste sept DRESSEURS à ce niveau.\nArriveras-tu à tous les battre?$
```
### BattlePyramid_Text_SixTrainersRemaining3
```
C'est impressionnant!\pIl reste six DRESSEURS à ce niveau.\nArriveras-tu à tous les battre?$
```
### BattlePyramid_Text_FiveTrainersRemaining3
```
C'est impressionnant!\pIl reste cinq DRESSEURS à ce niveau.\nArriveras-tu à tous les battre?$
```
### BattlePyramid_Text_FourTrainersRemaining3
```
C'est impressionnant!\pIl reste quatre DRESSEURS à ce niveau.\nArriveras-tu à tous les battre?$
```
### BattlePyramid_Text_ThreeTrainersRemaining3
```
C'est impressionnant!\pIl reste trois DRESSEURS à ce niveau.\nArriveras-tu à tous les battre?$
```
### BattlePyramid_Text_TwoTrainersRemaining3
```
C'est impressionnant!\pIl reste deux DRESSEURS à ce niveau.\nArriveras-tu à tous les battre?$
```
### BattlePyramid_Text_OneTrainersRemaining3
```
C'est impressionnant!\pIl reste un DRESSEUR à ce niveau.\nArriveras-tu à le battre?$
```
### BattlePyramid_Text_ZeroTrainersRemaining3
```
C'est impressionnant!\pIl ne reste plus de DRESSEURS\nà ce niveau.$
```
### BattlePyramid_Text_SevenTrainersRemaining4
```
Peut-être réussiras-tu à résister\naux sept autres DRESSEURS du niveau.$
```
### BattlePyramid_Text_SixTrainersRemaining4
```
Peut-être réussiras-tu à résister\naux six autres DRESSEURS du niveau.$
```
### BattlePyramid_Text_FiveTrainersRemaining4
```
Peut-être réussiras-tu à résister\naux cinq autres DRESSEURS du niveau.$
```
### BattlePyramid_Text_FourTrainersRemaining4
```
Peut-être réussiras-tu à résister aux\nquatre autres DRESSEURS du niveau.$
```
### BattlePyramid_Text_ThreeTrainersRemaining4
```
Peut-être réussiras-tu à résister\naux trois autres DRESSEURS du niveau.$
```
### BattlePyramid_Text_TwoTrainersRemaining4
```
Peut-être réussiras-tu à résister\naux deux autres DRESSEURS du niveau.$
```
### BattlePyramid_Text_OneTrainersRemaining4
```
Peut-être réussiras-tu à résister\nau dernier DRESSEUR du niveau.$
```
### BattlePyramid_Text_ZeroTrainersRemaining4
```
Tu as résisté à tous les DRESSEURS\ndu niveau. Il n'en reste aucun.$
```
### BattlePyramid_Text_SevenTrainersRemaining5
```
Si ça se trouve, tu vas battre les\nsept autres DRESSEURS.$
```
### BattlePyramid_Text_SixTrainersRemaining5
```
Si ça se trouve, tu vas battre les\nsix autres DRESSEURS.$
```
### BattlePyramid_Text_FiveTrainersRemaining5
```
Si ça se trouve, tu vas battre les\ncinq autres DRESSEURS.$
```
### BattlePyramid_Text_FourTrainersRemaining5
```
Si ça se trouve, tu vas battre les\nquatre autres DRESSEURS.$
```
### BattlePyramid_Text_ThreeTrainersRemaining5
```
Si ça se trouve, tu vas battre les\ntrois autres DRESSEURS.$
```
### BattlePyramid_Text_TwoTrainersRemaining5
```
Si ça se trouve, tu vas battre les\ndeux autres DRESSEURS.$
```
### BattlePyramid_Text_OneTrainersRemaining5
```
Si ça se trouve, tu vas battre le\ndernier DRESSEUR.$
```
### BattlePyramid_Text_ZeroTrainersRemaining5
```
Tu te bats à la perfection.\pIl ne reste aucun DRESSEUR à\nbattre.$
```
### BattlePyramid_Text_SevenTrainersRemaining6
```
Je me demande si tu vas battre\nles sept autres DRESSEURS!$
```
### BattlePyramid_Text_SixTrainersRemaining6
```
Je me demande si tu vas battre\nles six autres DRESSEURS!$
```
### BattlePyramid_Text_FiveTrainersRemaining6
```
Je me demande si tu vas battre\nles cinq autres DRESSEURS!$
```
### BattlePyramid_Text_FourTrainersRemaining6
```
Je me demande si tu vas battre\nles quatre autres DRESSEURS!$
```
### BattlePyramid_Text_ThreeTrainersRemaining6
```
Je me demande si tu vas battre\nles trois autres DRESSEURS!$
```
### BattlePyramid_Text_TwoTrainersRemaining6
```
Je me demande si tu vas battre\nles deux autres DRESSEURS!$
```
### BattlePyramid_Text_OneTrainersRemaining6
```
Je me demande si tu vas battre\nle dernier DRESSEUR!$
```
### BattlePyramid_Text_ZeroTrainersRemaining6
```
Il n'y a plus de DRESSEUR à\nbattre ici…$
```
