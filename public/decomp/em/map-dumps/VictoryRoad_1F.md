# VictoryRoad_1F

## Métadonnées
- **id** : `MAP_VICTORY_ROAD_1F`
- **layout** : `LAYOUT_VICTORY_ROAD_1F`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_VICTORY_ROAD`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_3` | 33,22 | `MOVEMENT_TYPE_FACE_DOWN` | `VictoryRoad_1F_EventScript_Edgar` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 6,15 | `MOVEMENT_TYPE_FACE_LEFT` | `VictoryRoad_1F_EventScript_Hope` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 27,34 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `VictoryRoad_1F_EventScript_Albert` | `0` |
| `LOCALID_VICTORY_ROAD_ENTRANCE_WALLY` | `OBJ_EVENT_GFX_WALLY` | 12,25 | `MOVEMENT_TYPE_FACE_DOWN` | `VictoryRoad_1F_EventScript_EntranceWally` | `FLAG_HIDE_VICTORY_ROAD_ENTRANCE_WALLY` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 40,26 | `MOVEMENT_TYPE_LOOK_AROUND` | `VictoryRoad_1F_EventScript_ItemMaxElixir` | `FLAG_ITEM_VICTORY_ROAD_1F_MAX_ELIXIR` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 37,39 | `MOVEMENT_TYPE_LOOK_AROUND` | `VictoryRoad_1F_EventScript_ItemPPUp` | `FLAG_ITEM_VICTORY_ROAD_1F_PP_UP` |
| `` | `OBJ_EVENT_GFX_WALLY` | 31,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `VictoryRoad_1F_EventScript_ExitWally` | `FLAG_HIDE_VICTORY_ROAD_EXIT_WALLY` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 29,17 | `MOVEMENT_TYPE_FACE_RIGHT` | `VictoryRoad_1F_EventScript_Katelynn` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 32,17 | `MOVEMENT_TYPE_FACE_LEFT` | `VictoryRoad_1F_EventScript_Quincy` | `0` |

## Warps (5)
- #0 (15,40) → `MAP_EVER_GRANDE_CITY` warp #2
- #1 (39,5) → `MAP_EVER_GRANDE_CITY` warp #3
- #2 (21,32) → `MAP_VICTORY_ROAD_B1F` warp #5
- #3 (42,38) → `MAP_VICTORY_ROAD_B1F` warp #2
- #4 (9,14) → `MAP_VICTORY_ROAD_B1F` warp #4

## Coord events / triggers (2)
- (2,23) → `VictoryRoad_1F_EventScript_WallyBattleTrigger1` (si `VAR_VICTORY_ROAD_1F_STATE` == `0`)
- (3,23) → `VictoryRoad_1F_EventScript_WallyBattleTrigger2` (si `VAR_VICTORY_ROAD_1F_STATE` == `0`)

## BG events / signs (1)
- (30,39) [hidden_item] → ``

## Flags référencés (2)
- `FLAG_DEFEATED_WALLY_VICTORY_ROAD`
- `FLAG_HIDE_VICTORY_ROAD_ENTRANCE_WALLY`

## Variables référencées (3)
- `VAR_0x8008`
- `VAR_RESULT`
- `VAR_VICTORY_ROAD_1F_STATE`

## Scripts (17)
### VictoryRoad_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, VictoryRoad_1F_OnTransition
```
### VictoryRoad_1F_OnTransition
```
call_if_eq VAR_VICTORY_ROAD_1F_STATE, 1, VictoryRoad_1F_EventScript_SetEntranceWallyPos1
call_if_eq VAR_VICTORY_ROAD_1F_STATE, 2, VictoryRoad_1F_EventScript_SetEntranceWallyPos2
end
```
### VictoryRoad_1F_EventScript_SetEntranceWallyPos1
```
setobjectxyperm LOCALID_VICTORY_ROAD_ENTRANCE_WALLY, 2, 24
setobjectmovementtype LOCALID_VICTORY_ROAD_ENTRANCE_WALLY, MOVEMENT_TYPE_FACE_DOWN
return
```
### VictoryRoad_1F_EventScript_SetEntranceWallyPos2
```
setobjectxyperm LOCALID_VICTORY_ROAD_ENTRANCE_WALLY, 3, 24
setobjectmovementtype LOCALID_VICTORY_ROAD_ENTRANCE_WALLY, MOVEMENT_TYPE_FACE_DOWN
return
```
### VictoryRoad_1F_EventScript_WallyBattleTrigger1
```
lockall
setvar VAR_0x8008, 1
addobject LOCALID_VICTORY_ROAD_ENTRANCE_WALLY
applymovement LOCALID_VICTORY_ROAD_ENTRANCE_WALLY, VictoryRoad_1F_Movement_WallyApproachPlayer1
waitmovement 0
goto VictoryRoad_1F_EventScript_WallyEntranceBattle
end
```
### VictoryRoad_1F_EventScript_WallyBattleTrigger2
```
lockall
setvar VAR_0x8008, 2
addobject LOCALID_VICTORY_ROAD_ENTRANCE_WALLY
applymovement LOCALID_VICTORY_ROAD_ENTRANCE_WALLY, VictoryRoad_1F_Movement_WallyApproachPlayer2
waitmovement 0
goto VictoryRoad_1F_EventScript_WallyEntranceBattle
end
```
### VictoryRoad_1F_EventScript_WallyEntranceBattle
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox VictoryRoad_1F_Text_WallyNotGoingToLoseAnymore, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_WALLY_VR_1, VictoryRoad_1F_Text_WallyEntranceDefeat
msgbox VictoryRoad_1F_Text_WallyPostEntranceBattle, MSGBOX_DEFAULT
clearflag FLAG_HIDE_VICTORY_ROAD_ENTRANCE_WALLY
copyobjectxytoperm LOCALID_VICTORY_ROAD_ENTRANCE_WALLY
setflag FLAG_DEFEATED_WALLY_VICTORY_ROAD
copyvar VAR_VICTORY_ROAD_1F_STATE, VAR_0x8008
releaseall
end
```
### VictoryRoad_1F_Movement_WallyApproachPlayer1
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_up
step_end
```
### VictoryRoad_1F_Movement_WallyApproachPlayer2
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_up
step_end
```
### VictoryRoad_1F_EventScript_EntranceWally
```
msgbox VictoryRoad_1F_Text_WallyPostEntranceBattle, MSGBOX_NPC
end
```
### VictoryRoad_1F_EventScript_ExitWally
```
trainerbattle_single TRAINER_WALLY_VR_2, VictoryRoad_1F_Text_WallyIntro, VictoryRoad_1F_Text_WallyDefeat
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, VictoryRoad_1F_EventScript_RematchWally
msgbox VictoryRoad_1F_Text_WallyPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_1F_EventScript_RematchWally
```
trainerbattle_rematch TRAINER_WALLY_VR_2, VictoryRoad_1F_Text_WallyIntro, VictoryRoad_1F_Text_WallyDefeat
msgbox VictoryRoad_1F_Text_WallyPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_1F_EventScript_Edgar
```
trainerbattle_single TRAINER_EDGAR, VictoryRoad_1F_Text_EdgarIntro, VictoryRoad_1F_Text_EdgarDefeat
msgbox VictoryRoad_1F_Text_EdgarPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_1F_EventScript_Albert
```
trainerbattle_single TRAINER_ALBERT, VictoryRoad_1F_Text_AlbertIntro, VictoryRoad_1F_Text_AlbertDefeat
msgbox VictoryRoad_1F_Text_AlbertPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_1F_EventScript_Hope
```
trainerbattle_single TRAINER_HOPE, VictoryRoad_1F_Text_HopeIntro, VictoryRoad_1F_Text_HopeDefeat
msgbox VictoryRoad_1F_Text_HopePostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_1F_EventScript_Quincy
```
trainerbattle_single TRAINER_QUINCY, VictoryRoad_1F_Text_QuincyIntro, VictoryRoad_1F_Text_QuincyDefeat
msgbox VictoryRoad_1F_Text_QuincyPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_1F_EventScript_Katelynn
```
trainerbattle_single TRAINER_KATELYNN, VictoryRoad_1F_Text_KatelynnIntro, VictoryRoad_1F_Text_KatelynnDefeat
msgbox VictoryRoad_1F_Text_KatelynnPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (21)
### VictoryRoad_1F_Text_WallyNotGoingToLoseAnymore
```
TIMMY: Salut, {PLAYER}!\pJ'parie que ça t'surprend de m'voir ici!\pJ'ai fait le chemin jusqu'ici, et c'est\ngrâce à toi!\p{PLAYER}, le fait de perdre contre toi\nl'autre fois m'a rendu plus fort!\pMais je ne perdrai plus maintenant!\pJe vais gagner! Pour les POKéMON qui\nm'ont donné courage et force!\pOK… Me voilà!$
```
### VictoryRoad_1F_Text_WallyEntranceDefeat
```
Waouh!\n{PLAYER}, quelle force tu as quand même!$
```
### VictoryRoad_1F_Text_WallyPostEntranceBattle
```
TIMMY: Je n'ai pas réussi à te battre\naujourd'hui, {PLAYER}, mais un de ces\ljours, je t'aurai!$
```
### VictoryRoad_1F_Text_WallyIntro
```
TIMMY: Salut, {PLAYER}!\pJe suis devenu plus fort!\nIl faut que j'te montre, {PLAYER}!\pOK… J'arrive!$
```
### VictoryRoad_1F_Text_WallyDefeat
```
Waouh!\n{PLAYER}, quelle force tu as quand même!$
```
### VictoryRoad_1F_Text_WallyPostBattle
```
TIMMY: Je n'ai pas réussi à te battre\naujourd'hui, {PLAYER}, mais un de ces\ljours, je t'aurai…\pEt j'affronterai la LIGUE POKéMON!$
```
### VictoryRoad_1F_Text_EdgarIntro
```
J'ai fait ça plus d'une fois, mais la\ndernière partie est tellement longue…$
```
### VictoryRoad_1F_Text_EdgarDefeat
```
Mon rêve s'arrête là, encore une fois…$
```
### VictoryRoad_1F_Text_EdgarPostBattle
```
T'as fait un bon bout d'chemin. Continue\nsur ta lancée et deviens le MAITRE!\lS'il y en a un qui peut réussir,\lc'est bien toi.$
```
### VictoryRoad_1F_Text_AlbertIntro
```
Je n'ai pas fait toute cette route pour\nperdre. Pas question!$
```
### VictoryRoad_1F_Text_AlbertDefeat
```
Impossible…\nJ'ai perdu?$
```
### VictoryRoad_1F_Text_AlbertPostBattle
```
J'ai perdu à ce niveau…\pJe n'ai donc pas les qualifications\nrequises pour être le MAITRE…$
```
### VictoryRoad_1F_Text_HopeIntro
```
Cette route difficile et sans fin\nporte bien son nom de VICTOIRE.$
```
### VictoryRoad_1F_Text_HopeDefeat
```
Ton style de combat est génial…$
```
### VictoryRoad_1F_Text_HopePostBattle
```
Tu sembles avoir le potentiel pour\ndevenir le MAITRE.$
```
### VictoryRoad_1F_Text_QuincyIntro
```
Qu'est-ce que la ROUTE VICTOIRE?\nJe te le dirai quand tu gagneras!$
```
### VictoryRoad_1F_Text_QuincyDefeat
```
OK!\nBien joué!$
```
### VictoryRoad_1F_Text_QuincyPostBattle
```
Sortir d'ici sain et sauf, c'est\nle dernier test pour les DRESSEURS\lqui veulent devenir MAITRE POKéMON.\pC'est pour cela qu'on appelle ce lieu\nla ROUTE VICTOIRE.$
```
### VictoryRoad_1F_Text_KatelynnIntro
```
Je n'ai rien à dire à quelqu'un qui est\nallé si loin. Viens te battre!$
```
### VictoryRoad_1F_Text_KatelynnDefeat
```
Une vraie disgrâce…$
```
### VictoryRoad_1F_Text_KatelynnPostBattle
```
Humpf, continue tout droit.\nSi tu en as le courage…$
```
