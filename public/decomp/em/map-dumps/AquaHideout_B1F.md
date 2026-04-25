# AquaHideout_B1F

## Métadonnées
- **id** : `MAP_AQUA_HIDEOUT_B1F`
- **layout** : `LAYOUT_AQUA_HIDEOUT_B1F`
- **music** : `MUS_AQUA_MAGMA_HIDEOUT`
- **region_map_section** : `MAPSEC_AQUA_HIDEOUT`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_AQUA`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 28,16 | `MOVEMENT_TYPE_FACE_DOWN` | `AquaHideout_B1F_EventScript_Grunt2` | `FLAG_HIDE_AQUA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 6,6 | `MOVEMENT_TYPE_FACE_LEFT` | `AquaHideout_B1F_EventScript_Grunt3` | `FLAG_HIDE_AQUA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 29,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `AquaHideout_B1F_EventScript_ItemMaxElixir` | `FLAG_ITEM_AQUA_HIDEOUT_B1F_MAX_ELIXIR` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_F` | 20,18 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `AquaHideout_B1F_EventScript_Grunt5` | `FLAG_HIDE_AQUA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 15,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `AquaHideout_B1F_EventScript_ItemMasterBall` | `FLAG_ITEM_AQUA_HIDEOUT_B1F_MASTER_BALL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 16,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `AquaHideout_B1F_EventScript_Electrode1` | `FLAG_HIDE_AQUA_HIDEOUT_B1F_ELECTRODE_1` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 15,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `AquaHideout_B1F_EventScript_ItemNugget` | `FLAG_ITEM_AQUA_HIDEOUT_B1F_NUGGET` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 16,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `AquaHideout_B1F_EventScript_Electrode2` | `FLAG_HIDE_AQUA_HIDEOUT_B1F_ELECTRODE_2` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_F` | 28,21 | `MOVEMENT_TYPE_FACE_UP` | `AquaHideout_B1F_EventScript_Grunt7` | `FLAG_HIDE_AQUA_HIDEOUT_GRUNTS` |

## Warps (25)
- #0 (29,1) → `MAP_AQUA_HIDEOUT_1F` warp #2
- #1 (18,1) → `MAP_AQUA_HIDEOUT_B2F` warp #0
- #2 (12,1) → `MAP_AQUA_HIDEOUT_B2F` warp #1
- #3 (3,3) → `MAP_AQUA_HIDEOUT_B2F` warp #2
- #4 (31,4) → `MAP_AQUA_HIDEOUT_B1F` warp #7
- #5 (27,4) → `MAP_AQUA_HIDEOUT_B1F` warp #8
- #6 (20,4) → `MAP_AQUA_HIDEOUT_B1F` warp #10
- #7 (27,12) → `MAP_AQUA_HIDEOUT_B1F` warp #4
- #8 (3,15) → `MAP_AQUA_HIDEOUT_B1F` warp #5
- #9 (3,20) → `MAP_AQUA_HIDEOUT_B1F` warp #12
- #10 (32,19) → `MAP_AQUA_HIDEOUT_B1F` warp #6
- #11 (23,10) → `MAP_AQUA_HIDEOUT_B1F` warp #22
- #12 (45,3) → `MAP_AQUA_HIDEOUT_B1F` warp #9
- #13 (42,5) → `MAP_AQUA_HIDEOUT_B1F` warp #18
- #14 (45,5) → `MAP_AQUA_HIDEOUT_B1F` warp #12
- #15 (48,5) → `MAP_AQUA_HIDEOUT_B1F` warp #16
- #16 (42,9) → `MAP_AQUA_HIDEOUT_B1F` warp #15
- #17 (45,9) → `MAP_AQUA_HIDEOUT_B1F` warp #20
- #18 (48,9) → `MAP_AQUA_HIDEOUT_B1F` warp #13
- #19 (42,13) → `MAP_AQUA_HIDEOUT_B1F` warp #24
- #20 (45,13) → `MAP_AQUA_HIDEOUT_B1F` warp #17
- #21 (48,13) → `MAP_AQUA_HIDEOUT_B1F` warp #12
- #22 (42,17) → `MAP_AQUA_HIDEOUT_B1F` warp #11
- #23 (45,17) → `MAP_AQUA_HIDEOUT_B1F` warp #17
- #24 (48,17) → `MAP_AQUA_HIDEOUT_B1F` warp #19

## Flags référencés (5)
- `FLAG_DEFEATED_ELECTRODE_1_AQUA_HIDEOUT`
- `FLAG_DEFEATED_ELECTRODE_2_AQUA_HIDEOUT`
- `FLAG_HIDE_AQUA_HIDEOUT_B1F_ELECTRODE_1`
- `FLAG_HIDE_AQUA_HIDEOUT_B1F_ELECTRODE_2`
- `FLAG_SYS_CTRL_OBJ_DELETE`

## Variables référencées (2)
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_RemoveStaticPokemon`

## Scripts (16)
### AquaHideout_B1F_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, AquaHideout_B1F_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, AquaHideout_B1F_OnTransition
```
### AquaHideout_B1F_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, AquaHideout_B1F_EventScript_TryRemoveElectrode
end
```
### AquaHideout_B1F_EventScript_TryRemoveElectrode
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject VAR_LAST_TALKED
return
```
### AquaHideout_B1F_OnTransition
```
call_if_unset FLAG_DEFEATED_ELECTRODE_1_AQUA_HIDEOUT, AquaHideout_B1F_EventScript_ShowElectrode1
call_if_unset FLAG_DEFEATED_ELECTRODE_2_AQUA_HIDEOUT, AquaHideout_B1F_EventScript_ShowElectrode2
end
```
### AquaHideout_B1F_EventScript_ShowElectrode1
```
clearflag FLAG_HIDE_AQUA_HIDEOUT_B1F_ELECTRODE_1
return
```
### AquaHideout_B1F_EventScript_ShowElectrode2
```
clearflag FLAG_HIDE_AQUA_HIDEOUT_B1F_ELECTRODE_2
return
```
### AquaHideout_B1F_EventScript_Electrode1
```
lock
faceplayer
setwildbattle SPECIES_ELECTRODE, 30
waitse
playmoncry SPECIES_ELECTRODE, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setflag FLAG_SYS_CTRL_OBJ_DELETE
dowildbattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, AquaHideout_B1F_EventScript_DefeatedElectrode1
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, AquaHideout_B1F_EventScript_DefeatedElectrode1
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, AquaHideout_B1F_EventScript_DefeatedElectrode1
setflag FLAG_DEFEATED_ELECTRODE_1_AQUA_HIDEOUT
release
end
```
### AquaHideout_B1F_EventScript_DefeatedElectrode1
```
setflag FLAG_DEFEATED_ELECTRODE_1_AQUA_HIDEOUT
goto Common_EventScript_RemoveStaticPokemon
end
```
### AquaHideout_B1F_EventScript_Electrode2
```
lock
faceplayer
setwildbattle SPECIES_ELECTRODE, 30
waitse
playmoncry SPECIES_ELECTRODE, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setflag FLAG_SYS_CTRL_OBJ_DELETE
dowildbattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, AquaHideout_B1F_EventScript_DefeatedElectrode2
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, AquaHideout_B1F_EventScript_DefeatedElectrode2
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, AquaHideout_B1F_EventScript_DefeatedElectrode2
setflag FLAG_DEFEATED_ELECTRODE_2_AQUA_HIDEOUT
release
end
```
### AquaHideout_B1F_EventScript_DefeatedElectrode2
```
setflag FLAG_DEFEATED_ELECTRODE_2_AQUA_HIDEOUT
goto Common_EventScript_RemoveStaticPokemon
end
```
### AquaHideout_B1F_EventScript_Grunt2
```
trainerbattle_single TRAINER_GRUNT_AQUA_HIDEOUT_2, AquaHideout_B1F_Text_Grunt2Intro, AquaHideout_B1F_Text_Grunt2Defeat, AquaHideout_B1F_EventScript_Grunt2Defeated
msgbox AquaHideout_B1F_Text_Grunt2PostBattle, MSGBOX_AUTOCLOSE
end
```
### AquaHideout_B1F_EventScript_Grunt2Defeated
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox AquaHideout_B1F_Text_Grunt2PostBattle, MSGBOX_DEFAULT
release
end
```
### AquaHideout_B1F_EventScript_Grunt3
```
trainerbattle_single TRAINER_GRUNT_AQUA_HIDEOUT_3, AquaHideout_B1F_Text_Grunt3Intro, AquaHideout_B1F_Text_Grunt3Defeat, AquaHideout_B1F_EventScript_Grunt3Defeated
msgbox AquaHideout_B1F_Text_Grunt3PostBattle, MSGBOX_AUTOCLOSE
end
```
### AquaHideout_B1F_EventScript_Grunt3Defeated
```
msgbox AquaHideout_B1F_Text_Grunt3PostBattle, MSGBOX_DEFAULT
release
end
```
### AquaHideout_B1F_EventScript_Grunt5
```
trainerbattle_single TRAINER_GRUNT_AQUA_HIDEOUT_5, AquaHideout_B1F_Text_Grunt5Intro, AquaHideout_B1F_Text_Grunt5Defeat
msgbox AquaHideout_B1F_Text_Grunt5PostBattle, MSGBOX_AUTOCLOSE
end
```
### AquaHideout_B1F_EventScript_Grunt7
```
trainerbattle_single TRAINER_GRUNT_AQUA_HIDEOUT_7, AquaHideout_B1F_Text_Grunt7Intro, AquaHideout_B1F_Text_Grunt7Defeat
msgbox AquaHideout_B1F_Text_Grunt7PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (12)
### AquaHideout_B1F_Text_Grunt2Intro
```
Si tu veux connaître le secret de notre\nPLANQUE, il faut que tu me battes!$
```
### AquaHideout_B1F_Text_Grunt2Defeat
```
Je ne peux absolument pas gagner…$
```
### AquaHideout_B1F_Text_Grunt2PostBattle
```
Le secret de notre PLANQUE?\pEh bien, disons que…\nIl y a un sous-marin tout au bout!\pMais, pour le moment…\nHep, hep, hep…$
```
### AquaHideout_B1F_Text_Grunt3Intro
```
Chargement réserve d'essence OK!\nChargement nourriture trajet OK!\pPlus rien à faire à part mettre K.O. une\npersonne gênante.$
```
### AquaHideout_B1F_Text_Grunt3Defeat
```
J'ai pris une bonne raclée!$
```
### AquaHideout_B1F_Text_Grunt3PostBattle
```
Hum!\nÇa devait arriver!\pIl fallait juste que je te retienne!$
```
### AquaHideout_B1F_Text_Grunt5Intro
```
Bâillement… J'en ai marre de monter la\ngarde dans la PLANQUE. Je te défie!$
```
### AquaHideout_B1F_Text_Grunt5Defeat
```
Bâillement…\nOh, j'ai perdu…$
```
### AquaHideout_B1F_Text_Grunt5PostBattle
```
Si tu te précipites trop, d'autres types\nde la TEAM AQUA pourraient t'avoir.$
```
### AquaHideout_B1F_Text_Grunt7Intro
```
Hé!\nToi là!\pTu préfères quoi?\nL'uniforme de la TEAM AQUA ou celui\lde la TEAM MAGMA?$
```
### AquaHideout_B1F_Text_Grunt7Defeat
```
J'ai perdu avec panache!$
```
### AquaHideout_B1F_Text_Grunt7PostBattle
```
Avec un uniforme comme le mien,\non reste cool même si on perd!$
```
