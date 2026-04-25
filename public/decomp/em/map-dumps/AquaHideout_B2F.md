# AquaHideout_B2F

## Métadonnées
- **id** : `MAP_AQUA_HIDEOUT_B2F`
- **layout** : `LAYOUT_AQUA_HIDEOUT_B2F`
- **music** : `MUS_AQUA_MAGMA_HIDEOUT`
- **region_map_section** : `MAPSEC_AQUA_HIDEOUT`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_AQUA`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_AQUA_HIDEOUT_MATT` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 23,19 | `MOVEMENT_TYPE_FACE_LEFT` | `AquaHideout_B2F_EventScript_Matt` | `FLAG_HIDE_AQUA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 23,10 | `MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_DOWN_RIGHT` | `AquaHideout_B2F_EventScript_Grunt4` | `FLAG_HIDE_AQUA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `AquaHideout_B2F_EventScript_ItemNestBall` | `FLAG_ITEM_AQUA_HIDEOUT_B2F_NEST_BALL` |
| `LOCALID_AQUA_HIDEOUT_SUBMARINE` | `OBJ_EVENT_GFX_SUBMARINE_SHADOW` | 19,20 | `MOVEMENT_TYPE_FACE_LEFT` | `0x0` | `FLAG_HIDE_AQUA_HIDEOUT_B2F_SUBMARINE_SHADOW` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_F` | 7,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `AquaHideout_B2F_EventScript_Grunt6` | `FLAG_HIDE_AQUA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 13,5 | `MOVEMENT_TYPE_FACE_LEFT` | `AquaHideout_B2F_EventScript_Grunt8` | `FLAG_HIDE_AQUA_HIDEOUT_GRUNTS` |

## Warps (10)
- #0 (18,1) → `MAP_AQUA_HIDEOUT_B1F` warp #1
- #1 (12,1) → `MAP_AQUA_HIDEOUT_B1F` warp #2
- #2 (3,3) → `MAP_AQUA_HIDEOUT_B1F` warp #3
- #3 (31,8) → `MAP_AQUA_HIDEOUT_B2F` warp #5
- #4 (8,8) → `MAP_AQUA_HIDEOUT_B2F` warp #8
- #5 (5,8) → `MAP_AQUA_HIDEOUT_B2F` warp #3
- #6 (18,13) → `MAP_AQUA_HIDEOUT_B2F` warp #7
- #7 (12,13) → `MAP_AQUA_HIDEOUT_B2F` warp #6
- #8 (31,17) → `MAP_AQUA_HIDEOUT_B2F` warp #4
- #9 (32,20) → `MAP_AQUA_HIDEOUT_B1F` warp #4

## Coord events / triggers (2)
- (28,17) → `AquaHideout_B2F_EventScript_MattNoticePlayer` (si `VAR_TEMP_1` == `0`)
- (28,16) → `AquaHideout_B2F_EventScript_MattNoticePlayer` (si `VAR_TEMP_1` == `0`)

## Flags référencés (2)
- `FLAG_HIDE_LILYCOVE_CITY_AQUA_GRUNTS`
- `FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE`

## Variables référencées (3)
- `VAR_0x8008`
- `VAR_0x8009`
- `VAR_TEMP_1`

## Scripts (12)
### AquaHideout_B2F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, AquaHideout_B2F_OnTransition
```
### AquaHideout_B2F_OnTransition
```
call_if_set FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE, AquaHideout_B2F_EventScript_PreventMattNoticing
end
```
### AquaHideout_B2F_EventScript_PreventMattNoticing
```
setvar VAR_TEMP_1, 1
return
```
### AquaHideout_B2F_EventScript_MattNoticePlayer
```
lockall
setvar VAR_0x8008, LOCALID_AQUA_HIDEOUT_MATT
playse SE_PIN
applymovement VAR_0x8008, Common_Movement_ExclamationMark
waitmovement 0
applymovement VAR_0x8008, Common_Movement_FacePlayer
waitmovement 0
setvar VAR_TEMP_1, 1
releaseall
end
```
### AquaHideout_B2F_EventScript_Matt
```
trainerbattle_single TRAINER_MATT, AquaHideout_B2F_Text_MattIntro, AquaHideout_B2F_Text_MattDefeat, AquaHideout_B2F_EventScript_SubmarineEscape
msgbox AquaHideout_B2F_Text_MattPostBattle, MSGBOX_DEFAULT
release
end
```
### AquaHideout_B2F_EventScript_SubmarineEscape
```
setvar VAR_0x8008, LOCALID_AQUA_HIDEOUT_MATT
setvar VAR_0x8009, LOCALID_AQUA_HIDEOUT_SUBMARINE
applymovement VAR_0x8008, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
delay 20
applymovement VAR_0x8008, Common_Movement_FacePlayer
waitmovement 0
msgbox AquaHideout_B2F_Text_OurBossGotThroughHisPreparations, MSGBOX_DEFAULT
closemessage
applymovement VAR_0x8008, Common_Movement_WalkInPlaceFasterLeft
applymovement VAR_0x8009, AquaHideout_B2F_Movement_SumbarineDepartLeft
waitmovement 0
removeobject VAR_0x8009
delay 20
applymovement VAR_0x8008, Common_Movement_FacePlayer
waitmovement 0
msgbox AquaHideout_B2F_Text_MattPostBattle, MSGBOX_DEFAULT
setflag FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE
setflag FLAG_HIDE_LILYCOVE_CITY_AQUA_GRUNTS
release
end
```
### AquaHideout_B2F_Movement_SumbarineDepartLeft
```
walk_left
walk_left
walk_left
walk_left
step_end
```
### AquaHideout_B2F_Movement_SumbarineDepartRight
```
walk_right
walk_right
walk_right
walk_right
step_end
```
### AquaHideout_B2F_EventScript_Grunt4
```
trainerbattle_single TRAINER_GRUNT_AQUA_HIDEOUT_4, AquaHideout_B2F_Text_Grunt4Intro, AquaHideout_B2F_Text_Grunt4Defeat, AquaHideout_B2F_EventScript_Grunt4Defeated
msgbox AquaHideout_B2F_Text_Grunt4PostBattle, MSGBOX_AUTOCLOSE
end
```
### AquaHideout_B2F_EventScript_Grunt4Defeated
```
msgbox AquaHideout_B2F_Text_Grunt4PostBattle, MSGBOX_DEFAULT
release
end
```
### AquaHideout_B2F_EventScript_Grunt6
```
trainerbattle_single TRAINER_GRUNT_AQUA_HIDEOUT_6, AquaHideout_B2F_Text_Grunt6Intro, AquaHideout_B2F_Text_Grunt6Defeat
msgbox AquaHideout_B2F_Text_Grunt6PostBattle, MSGBOX_AUTOCLOSE
end
```
### AquaHideout_B2F_EventScript_Grunt8
```
trainerbattle_single TRAINER_GRUNT_AQUA_HIDEOUT_8, AquaHideout_B2F_Text_Grunt8Intro, AquaHideout_B2F_Text_Grunt8Defeat
msgbox AquaHideout_B2F_Text_Grunt8PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (13)
### AquaHideout_B2F_Text_MattIntro
```
Hé, hé, hé…\pOn avait sous-estimé tes compétences!\pMais cette fois, ça y est!\pJe suis un cran au-dessus des SBIRES\nque tu as vus.\pJe n'vais pas flancher.\nJe vais te pulvériser!$
```
### AquaHideout_B2F_Text_MattDefeat
```
Hé, hé, hé…\nAlors moi aussi, j'ai perdu…$
```
### AquaHideout_B2F_Text_OurBossGotThroughHisPreparations
```
Hé, hé, hé!\pPendant que je m'amusais avec toi,\nnotre CHEF a terminé ses préparatifs!$
```
### AquaHideout_B2F_Text_MattPostBattle
```
Hé, hé, hé!\pNotre CHEF est déjà en route vers\nune caverne sous la mer!\pSi tu veux te lancer à sa poursuite, tu\nferais bien de chercher dans le vaste\locéan derrière NENUCRIQUE.\pMais est-ce que tu vas la trouver?\nHé, hé, hé!$
```
### AquaHideout_B2F_Text_Grunt4Intro
```
Ouaaah, ça m'fatigue d'attendre!\nEn plus, tu m'dois un combat!$
```
### AquaHideout_B2F_Text_Grunt4Defeat
```
Fatigué d'attendre…\nVaincu et abasourdi…$
```
### AquaHideout_B2F_Text_Grunt4PostBattle
```
CHEF…\nC'est assez bien?$
```
### AquaHideout_B2F_Text_Grunt6Intro
```
Les téléporteurs, c'est la fierté et la\nréussite de notre PLANQUE!\pTu n'sais pas trop où tu es,\nn'est-ce pas?\pDécontenancer et fatiguer l'ennemi,\npuis lui serrer la vis! C'est notre plan!$
```
### AquaHideout_B2F_Text_Grunt6Defeat
```
Qu'est-ce qui ne va pas chez toi?\nTu ne montres pas le moindre signe\lde fatigue.$
```
### AquaHideout_B2F_Text_Grunt6PostBattle
```
Ça m'rappelle… Je ne sais plus où\nj'ai mis la MASTER BALL.\pSi je n'ai pas réussi à la garder, le\nCHEF va me passer un savon…$
```
### AquaHideout_B2F_Text_Grunt8Intro
```
La première chose que j'ai dû faire en\narrivant ici, c'est comprendre comment\lces téléporteurs fonctionnent.$
```
### AquaHideout_B2F_Text_Grunt8Defeat
```
J'étais trop occupé à penser aux\ntéléporteurs…$
```
### AquaHideout_B2F_Text_Grunt8PostBattle
```
Je vais devoir apprendre comment\nme battre plus efficacement.$
```
