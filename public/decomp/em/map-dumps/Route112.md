# Route112

## Métadonnées
- **id** : `MAP_ROUTE112`
- **layout** : `LAYOUT_ROUTE112`
- **music** : `MUS_ROUTE110`
- **region_map_section** : `MAPSEC_ROUTE_112`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset -60) → `MAP_ROUTE113`
- left (offset 40) → `MAP_LAVARIDGE_TOWN`
- right (offset -20) → `MAP_ROUTE111`

## Object events (14 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_ROUTE112_GRUNT_1` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 26,30 | `MOVEMENT_TYPE_FACE_UP` | `Route112_EventScript_MagmaGrunts` | `FLAG_HIDE_ROUTE_112_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_HIKER` | 24,34 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `Route112_EventScript_Brice` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 29,49 | `MOVEMENT_TYPE_FACE_DOWN` | `Route112_EventScript_Larry` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 22,46 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `Route112_EventScript_Carol` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 15,40 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `Route112_EventScript_Trent` | `0` |
| `LOCALID_ROUTE112_GRUNT_2` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 27,30 | `MOVEMENT_TYPE_FACE_UP` | `Route112_EventScript_MagmaGrunts` | `FLAG_HIDE_ROUTE_112_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 27,6 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 28,6 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 29,6 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 30,6 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 8,50 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route112_EventScript_Hiker` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 14,43 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route112_EventScript_ItemNugget` | `FLAG_ITEM_ROUTE_112_NUGGET` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 31,7 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route112_EventScript_Bryant` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 31,11 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `Route112_EventScript_Shayla` | `0` |

## Warps (6)
- #0 (28,27) → `MAP_ROUTE112_CABLE_CAR_STATION` warp #0
- #1 (29,27) → `MAP_ROUTE112_CABLE_CAR_STATION` warp #1
- #2 (6,46) → `MAP_JAGGED_PASS` warp #0
- #3 (7,46) → `MAP_JAGGED_PASS` warp #1
- #4 (11,36) → `MAP_FIERY_PATH` warp #0
- #5 (22,10) → `MAP_FIERY_PATH` warp #1

## BG events / signs (3)
- (19,44) [sign] → `Route112_EventScript_MtChimneySign`
- (22,37) [sign] → `Route112_EventScript_MtChimneyCableCarSign`
- (4,49) [sign] → `Route112_EventScript_RouteSignLavaridge`

## Flags référencés (1)
- `FLAG_FORCE_MIRAGE_TOWER_VISIBLE`

## Variables référencées (2)
- `VAR_JAGGED_PASS_ASH_WEATHER`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route112_Text_BricePostBattle`
- `Route112_Text_BryantPostBattle`
- `Route112_Text_CarolPostBattle`
- `Route112_Text_LarryPostBattle`
- `Route112_Text_ShaylaPostBattle`
- `Route112_Text_TrentPostBattle`
- `Route112_Text_TrentRegister`
- `Route112_Text_TrentRematchPostBattle`

## Scripts (15)
### Route112_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route112_OnTransition
```
### Route112_OnTransition
```
clearflag FLAG_FORCE_MIRAGE_TOWER_VISIBLE
setvar VAR_JAGGED_PASS_ASH_WEATHER, 0
end
```
### Route112_EventScript_MagmaGrunts
```
lockall
delay 40
applymovement LOCALID_ROUTE112_GRUNT_1, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 20
msgbox Route112_Text_LeaderGoingToAwakenThing, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE112_GRUNT_1, Common_Movement_FaceOriginalDirection
waitmovement 0
delay 40
applymovement LOCALID_ROUTE112_GRUNT_2, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
delay 20
msgbox Route112_Text_YeahWeNeedMeteorite, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE112_GRUNT_2, Common_Movement_FaceOriginalDirection
waitmovement 0
delay 40
applymovement LOCALID_ROUTE112_GRUNT_1, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 20
msgbox Route112_Text_OhThatsWhyCrewWentToFallarbor, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE112_GRUNT_1, Common_Movement_FaceOriginalDirection
waitmovement 0
delay 40
applymovement LOCALID_ROUTE112_GRUNT_2, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
delay 20
msgbox Route112_Text_CantLetAnyonePassUntilTheyreBack, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE112_GRUNT_2, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### Route112_EventScript_MtChimneyCableCarSign
```
msgbox Route112_Text_MtChimneyCableCarSign, MSGBOX_SIGN
end
```
### Route112_EventScript_MtChimneySign
```
msgbox Route112_Text_MtChimneySign, MSGBOX_SIGN
end
```
### Route112_EventScript_RouteSignLavaridge
```
msgbox Route112_Text_RouteSignLavaridge, MSGBOX_SIGN
end
```
### Route112_EventScript_Hiker
```
msgbox Route112_Text_NotEasyToGetBackToLavaridge, MSGBOX_NPC
end
```
### Route112_EventScript_Brice
```
trainerbattle_single TRAINER_BRICE, Route112_Text_BriceIntro, Route112_Text_BriceDefeat
msgbox Route112_Text_BricePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route112_EventScript_Trent
```
trainerbattle_single TRAINER_TRENT_1, Route112_Text_TrentIntro, Route112_Text_TrentDefeat, Route112_EventScript_RegisterTrent
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route112_EventScript_RematchTrent
msgbox Route112_Text_TrentPostBattle, MSGBOX_DEFAULT
release
end
```
### Route112_EventScript_RegisterTrent
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route112_Text_TrentRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_TRENT_1
release
end
```
### Route112_EventScript_RematchTrent
```
trainerbattle_rematch TRAINER_TRENT_1, Route112_Text_TrentRematchIntro, Route112_Text_TrentRematchDefeat
msgbox Route112_Text_TrentRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route112_EventScript_Larry
```
trainerbattle_single TRAINER_LARRY, Route112_Text_LarryIntro, Route112_Text_LarryDefeat
msgbox Route112_Text_LarryPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route112_EventScript_Carol
```
trainerbattle_single TRAINER_CAROL, Route112_Text_CarolIntro, Route112_Text_CarolDefeat
msgbox Route112_Text_CarolPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route112_EventScript_Bryant
```
trainerbattle_single TRAINER_BRYANT, Route112_Text_BryantIntro, Route112_Text_BryantDefeat
msgbox Route112_Text_BryantPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route112_EventScript_Shayla
```
trainerbattle_single TRAINER_SHAYLA, Route112_Text_ShaylaIntro, Route112_Text_ShaylaDefeat
msgbox Route112_Text_ShaylaPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (8)
### Route112_Text_LeaderGoingToAwakenThing
```
Euh… Tu crois que notre chef\nveut vraiment réveiller cette chose?$
```
### Route112_Text_YeahWeNeedMeteorite
```
En tout cas, ça y ressemble. Mais il va\nlui falloir une METEORITE, non?$
```
### Route112_Text_OhThatsWhyCrewWentToFallarbor
```
Oh, j'ai compris maintenant!\pC'est pour ça que le reste de la TEAM\nest parti à AUTEQUIA.$
```
### Route112_Text_CantLetAnyonePassUntilTheyreBack
```
T'as compris? Et jusqu'à leur retour,\npersonne ne passe! OK?$
```
### Route112_Text_NotEasyToGetBackToLavaridge
```
Hé, j'aimerais aller à LAVANDIA, mais\nsi je descends par ce rebord, ça va pas\lêtre facile de revenir à VERMILAVA.$
```
### Route112_Text_MtChimneyCableCarSign
```
TELEPHERIQUE DU MONT CHIMNEE\n“{UP_ARROW} Avancez de quelques pas!”$
```
### Route112_Text_MtChimneySign
```
MONT CHIMNEE\p“Pour VERMILAVA ou le sommet,\nveuillez prendre le TELEPHERIQUE.”$
```
### Route112_Text_RouteSignLavaridge
```
ROUTE 112\n{LEFT_ARROW} VERMILAVA$
```
