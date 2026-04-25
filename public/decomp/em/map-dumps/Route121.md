# Route121

## Métadonnées
- **id** : `MAP_ROUTE121`
- **layout** : `LAYOUT_ROUTE121`
- **music** : `MUS_ROUTE120`
- **region_map_section** : `MAPSEC_ROUTE_121`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset 20) → `MAP_ROUTE122`
- left (offset -80) → `MAP_ROUTE120`
- right (offset -10) → `MAP_LILYCOVE_CITY`

## Object events (29 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 29,14 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route121_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 14,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 15,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 16,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 17,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 64,14 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 65,14 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 66,14 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 67,14 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 39,9 | `MOVEMENT_TYPE_FACE_DOWN` | `Route121_EventScript_Kate` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 40,9 | `MOVEMENT_TYPE_FACE_DOWN` | `Route121_EventScript_Joy` | `0` |
| `LOCALID_ROUTE121_GRUNT_1` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 30,8 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_ROUTE_121_TEAM_AQUA_GRUNTS` |
| `LOCALID_ROUTE121_GRUNT_2` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 30,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_ROUTE_121_TEAM_AQUA_GRUNTS` |
| `LOCALID_ROUTE121_GRUNT_3` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 31,7 | `MOVEMENT_TYPE_FACE_LEFT` | `0x0` | `FLAG_HIDE_ROUTE_121_TEAM_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 32,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 65,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 63,5 | `MOVEMENT_TYPE_FACE_LEFT` | `Route121_EventScript_Vanessa` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 55,8 | `MOVEMENT_TYPE_FACE_LEFT` | `Route121_EventScript_Walter` | `0` |
| `` | `OBJ_EVENT_GFX_HEX_MANIAC` | 11,11 | `MOVEMENT_TYPE_FACE_UP` | `Route121_EventScript_Tammy` | `0` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 22,5 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `Route121_EventScript_Jessica` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 55,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route121_EventScript_ItemCarbos` | `FLAG_ITEM_ROUTE_121_CARBOS` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 26,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 11,6 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route121_EventScript_Cale` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 59,8 | `MOVEMENT_TYPE_FACE_DOWN` | `Route121_EventScript_Myles` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 59,13 | `MOVEMENT_TYPE_FACE_UP` | `Route121_EventScript_Pat` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 65,9 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route121_EventScript_Marcel` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 72,9 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `Route121_EventScript_Cristin` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 60,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route121_EventScript_ItemRevive` | `FLAG_ITEM_ROUTE_121_REVIVE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 38,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route121_EventScript_ItemZinc` | `FLAG_ITEM_ROUTE_121_ZINC` |

## Warps (1)
- #0 (37,5) → `MAP_ROUTE121_SAFARI_ZONE_ENTRANCE` warp #2

## Coord events / triggers (4)
- (25,5) → `Route121_EventScript_AquaGruntsMoveOut` (si `VAR_ROUTE121_STATE` == `0`)
- (25,6) → `Route121_EventScript_AquaGruntsMoveOut` (si `VAR_ROUTE121_STATE` == `0`)
- (25,7) → `Route121_EventScript_AquaGruntsMoveOut` (si `VAR_ROUTE121_STATE` == `0`)
- (25,8) → `Route121_EventScript_AquaGruntsMoveOut` (si `VAR_ROUTE121_STATE` == `0`)

## BG events / signs (10)
- (32,14) [sign] → `Route121_EventScript_MtPyrePierSign`
- (40,11) [secret_base] → ``
- (18,13) [secret_base] → ``
- (43,7) [secret_base] → ``
- (42,7) [secret_base] → ``
- (39,6) [sign] → `Route121_EventScript_SafariZoneSign`
- (23,10) [hidden_item] → ``
- (58,3) [hidden_item] → ``
- (72,5) [hidden_item] → ``
- (68,8) [hidden_item] → ``

## Variables référencées (2)
- `VAR_RESULT`
- `VAR_ROUTE121_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route121_Text_CalePostBattle`
- `Route121_Text_CristinPostBattle`
- `Route121_Text_CristinPostRematch`
- `Route121_Text_CristinRegister`
- `Route121_Text_JessicaPostBattle`
- `Route121_Text_JessicaPostRematch`
- `Route121_Text_JessicaRegister`
- `Route121_Text_JoyPostBattle`
- `Route121_Text_KatePostBattle`
- `Route121_Text_MarcelPostBattle`
- `Route121_Text_MylesPostBattle`
- `Route121_Text_PatPostBattle`
- `Route121_Text_TammyPostBattle`
- `Route121_Text_VanessaPostBattle`
- `Route121_Text_WalterPostBattle`
- `Route121_Text_WalterPostRematch`
- `Route121_Text_WalterRegister`

## Scripts (24)
### Route121_EventScript_Woman
```
msgbox Route121_Text_AheadLoomsMtPyre, MSGBOX_NPC
end
```
### Route121_EventScript_MtPyrePierSign
```
msgbox Route121_Text_MtPyrePierSign, MSGBOX_SIGN
end
```
### Route121_EventScript_SafariZoneSign
```
msgbox Route121_Text_SafariZoneSign, MSGBOX_SIGN
end
```
### Route121_EventScript_AquaGruntsMoveOut
```
lockall
playbgm MUS_ENCOUNTER_AQUA, FALSE
applymovement LOCALID_ROUTE121_GRUNT_2, Common_Movement_WalkInPlaceRight
waitmovement 0
msgbox Route121_Text_OkayMoveOutToMtPyre, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE121_GRUNT_1, Route121_Movement_Grunt1Exit
applymovement LOCALID_ROUTE121_GRUNT_2, Route121_Movement_Grunt2Exit
applymovement LOCALID_ROUTE121_GRUNT_3, Route121_Movement_Grunt3Exit
waitmovement 0
fadedefaultbgm
removeobject LOCALID_ROUTE121_GRUNT_1
removeobject LOCALID_ROUTE121_GRUNT_2
removeobject LOCALID_ROUTE121_GRUNT_3
setvar VAR_ROUTE121_STATE, 1
releaseall
end
```
### Route121_Movement_Grunt1Exit
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### Route121_Movement_Grunt2Exit
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### Route121_Movement_Grunt3Exit
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### Route121_EventScript_Vanessa
```
trainerbattle_single TRAINER_VANESSA, Route121_Text_VanessaIntro, Route121_Text_VanessaDefeat
msgbox Route121_Text_VanessaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Walter
```
trainerbattle_single TRAINER_WALTER_1, Route121_Text_WalterIntro, Route121_Text_WalterDefeat, Route121_EventScript_RegisterWalter
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route121_EventScript_RematchWalter
msgbox Route121_Text_WalterPostBattle, MSGBOX_DEFAULT
release
end
```
### Route121_EventScript_RegisterWalter
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route121_Text_WalterRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_WALTER_1
release
end
```
### Route121_EventScript_RematchWalter
```
trainerbattle_rematch TRAINER_WALTER_1, Route121_Text_WalterRematchIntro, Route121_Text_WalterRematchDefeat
msgbox Route121_Text_WalterPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Tammy
```
trainerbattle_single TRAINER_TAMMY, Route121_Text_TammyIntro, Route121_Text_TammyDefeat
msgbox Route121_Text_TammyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Kate
```
trainerbattle_double TRAINER_KATE_AND_JOY, Route121_Text_KateIntro, Route121_Text_KateDefeat, Route121_Text_KateNotEnoughMons
msgbox Route121_Text_KatePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Joy
```
trainerbattle_double TRAINER_KATE_AND_JOY, Route121_Text_JoyIntro, Route121_Text_JoyDefeat, Route121_Text_JoyNotEnoughMons
msgbox Route121_Text_JoyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Jessica
```
trainerbattle_single TRAINER_JESSICA_1, Route121_Text_JessicaIntro, Route121_Text_JessicaDefeat, Route121_EventScript_RegisterJessica
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route121_EventScript_RematchJessica
msgbox Route121_Text_JessicaPostBattle, MSGBOX_DEFAULT
release
end
```
### Route121_EventScript_RegisterJessica
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route121_Text_JessicaRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_JESSICA_1
release
end
```
### Route121_EventScript_RematchJessica
```
trainerbattle_rematch TRAINER_JESSICA_1, Route121_Text_JessicaRematchIntro, Route121_Text_JessicaRematchDefeat
msgbox Route121_Text_JessicaPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Cale
```
trainerbattle_single TRAINER_CALE, Route121_Text_CaleIntro, Route121_Text_CaleDefeat
msgbox Route121_Text_CalePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Myles
```
trainerbattle_single TRAINER_MYLES, Route121_Text_MylesIntro, Route121_Text_MylesDefeat
msgbox Route121_Text_MylesPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Pat
```
trainerbattle_single TRAINER_PAT, Route121_Text_PatIntro, Route121_Text_PatDefeat
msgbox Route121_Text_PatPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Marcel
```
trainerbattle_single TRAINER_MARCEL, Route121_Text_MarcelIntro, Route121_Text_MarcelDefeat
msgbox Route121_Text_MarcelPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route121_EventScript_Cristin
```
trainerbattle_single TRAINER_CRISTIN_1, Route121_Text_CristinIntro, Route121_Text_CristinDefeat, Route121_EventScript_RegisterCristin
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route121_EventScript_RematchCristin
msgbox Route121_Text_CristinPostBattle, MSGBOX_DEFAULT
release
end
```
### Route121_EventScript_RegisterCristin
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route121_Text_CristinRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_CRISTIN_1
release
end
```
### Route121_EventScript_RematchCristin
```
trainerbattle_rematch TRAINER_CRISTIN_1, Route121_Text_CristinRematchIntro, Route121_Text_CristinRematchDefeat
msgbox Route121_Text_CristinPostRematch, MSGBOX_AUTOCLOSE
end
```

## Textes (4)
### Route121_Text_OkayMoveOutToMtPyre
```
OK!\nOn va aller au MONT MEMORIA!$
```
### Route121_Text_AheadLoomsMtPyre
```
Devant nous se profile le MONT MEMORIA.\pC'est un monument naturel pour le salut\ndes âmes des POKéMON défunts…$
```
### Route121_Text_MtPyrePierSign
```
DIGUE DU MONT MEMORIA\p… Le panneau est vieux et usé.\nL'inscription est à peine lisible…$
```
### Route121_Text_SafariZoneSign
```
“Ça grouille de POKéMON rares!”\nPARC SAFARI$
```
