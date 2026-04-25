# Route110_TrickHouseEnd

## Métadonnées
- **id** : `MAP_ROUTE110_TRICK_HOUSE_END`
- **layout** : `LAYOUT_ROUTE110_TRICK_HOUSE_END`
- **music** : `MUS_TRICK_HOUSE`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_TRICK_MASTER_END` | `OBJ_EVENT_GFX_MAN_1` | 4,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_TrickHouseEnd_EventScript_TrickMaster` | `FLAG_HIDE_TRICK_HOUSE_END_MAN` |

## Warps (2)
- #0 (10,1) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE1` warp #2
- #1 (2,1) → `MAP_ROUTE110_TRICK_HOUSE_CORRIDOR` warp #0

## Coord events / triggers (1)
- (2,2) → `Route110_TrickHouseEnd_EventScript_TrickMasterExitTrigger` (si `VAR_TEMP_2` == `0`)

## BG events / signs (1)
- (4,5) [hidden_item] → ``

## Variables référencées (6)
- `VAR_FACING`
- `VAR_RESULT`
- `VAR_TEMP_1`
- `VAR_TEMP_2`
- `VAR_TRICK_HOUSE_LEVEL`
- `VAR_TRICK_HOUSE_PRIZE_PICKUP`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_BagIsFull`
- `Common_EventScript_NoRoomForDecor`

## Scripts (30)
### Route110_TrickHouseEnd_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Route110_TrickHouseEnd_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Route110_TrickHouseEnd_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route110_TrickHouseEnd_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, Route110_TrickHouseEnd_OnWarp
```
### Route110_TrickHouseEnd_OnResume
```
call_if_eq VAR_TEMP_1, 1, Route110_TrickHouseEnd_EventScript_SetDoorClosedMetatile
end
```
### Route110_TrickHouseEnd_OnTransition
```
setvar VAR_TEMP_1, 0
setvar VAR_TEMP_2, 0
special SetTrickHouseNuggetFlag
end
```
### Route110_TrickHouseEnd_OnWarp
```
map_script_2 VAR_TEMP_2, 0, Route110_TrickHouseEnd_EventScript_SetTrickMasterPos
```
### Route110_TrickHouseEnd_EventScript_SetTrickMasterPos
```
addobject LOCALID_TRICK_MASTER_END
showobjectat LOCALID_TRICK_MASTER_END, MAP_ROUTE110_TRICK_HOUSE_END
turnobject LOCALID_TRICK_MASTER_END, DIR_EAST
end
```
### Route110_TrickHouseEnd_OnFrame
```
map_script_2 VAR_TEMP_1, 0, Route110_TrickHouseEnd_EventScript_CloseDoor
```
### Route110_TrickHouseEnd_EventScript_CloseDoor
```
setvar VAR_TEMP_1, 1
call Route110_TrickHouseEnd_EventScript_SetDoorClosedMetatile
special DrawWholeMapView
end
```
### Route110_TrickHouseEnd_EventScript_SetDoorClosedMetatile
```
setmetatile 10, 1, METATILE_GenericBuilding_TrickHouse_Door_Closed, TRUE
return
```
### Route110_TrickHouseEnd_EventScript_TrickMaster
```
lock
faceplayer
msgbox Route110_TrickHouseEnd_Text_YouveMadeItToMe, MSGBOX_DEFAULT
setvar VAR_TEMP_2, 1
switch VAR_TRICK_HOUSE_LEVEL
case 0, Route110_TrickHouseEnd_EventScript_CompletedPuzzle1
case 1, Route110_TrickHouseEnd_EventScript_CompletedPuzzle2
case 2, Route110_TrickHouseEnd_EventScript_CompletedPuzzle3
case 3, Route110_TrickHouseEnd_EventScript_CompletedPuzzle4
case 4, Route110_TrickHouseEnd_EventScript_CompletedPuzzle5
case 5, Route110_TrickHouseEnd_EventScript_CompletedPuzzle6
case 6, Route110_TrickHouseEnd_EventScript_CompletedPuzzle7
case 7, Route110_TrickHouseEnd_EventScript_CompletedPuzzle8
end
```
### Route110_TrickHouseEnd_EventScript_CompletedPuzzle1
```
msgbox Route110_TrickHouseEnd_Text_AllNightToPlantTrees, MSGBOX_DEFAULT
msgbox Route110_TrickHouseEnd_Text_YouHaveEarnedThisReward, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 0
giveitem ITEM_RARE_CANDY
call_if_eq VAR_RESULT, FALSE, Route110_TrickHouseEnd_EventScript_BagFull
msgbox Route110_TrickHouseEnd_Text_MakeNewTricksToStumpYou, MSGBOX_DEFAULT
closemessage
call Route110_TrickHouseEnd_EventScript_TrickMasterExit
release
end
```
### Route110_TrickHouseEnd_EventScript_CompletedPuzzle2
```
msgbox Route110_TrickHouseEnd_Text_AllNightToMakeMaze, MSGBOX_DEFAULT
msgbox Route110_TrickHouseEnd_Text_YouHaveEarnedThisReward, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 0
giveitem ITEM_TIMER_BALL
call_if_eq VAR_RESULT, FALSE, Route110_TrickHouseEnd_EventScript_BagFull
msgbox Route110_TrickHouseEnd_Text_MakeNewTricksToStumpYou, MSGBOX_DEFAULT
closemessage
call Route110_TrickHouseEnd_EventScript_TrickMasterExit
release
end
```
### Route110_TrickHouseEnd_EventScript_CompletedPuzzle3
```
msgbox Route110_TrickHouseEnd_Text_AllNightToPreparePanels, MSGBOX_DEFAULT
msgbox Route110_TrickHouseEnd_Text_YouHaveEarnedThisReward, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 0
giveitem ITEM_HARD_STONE
call_if_eq VAR_RESULT, FALSE, Route110_TrickHouseEnd_EventScript_BagFull
msgbox Route110_TrickHouseEnd_Text_MakeNewTricksToStumpYou, MSGBOX_DEFAULT
closemessage
call Route110_TrickHouseEnd_EventScript_TrickMasterExit
release
end
```
### Route110_TrickHouseEnd_EventScript_CompletedPuzzle4
```
msgbox Route110_TrickHouseEnd_Text_AllNightToShoveBoulders, MSGBOX_DEFAULT
msgbox Route110_TrickHouseEnd_Text_YouHaveEarnedThisReward, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 0
giveitem ITEM_SMOKE_BALL
call_if_eq VAR_RESULT, FALSE, Route110_TrickHouseEnd_EventScript_BagFull
msgbox Route110_TrickHouseEnd_Text_MakeNewTricksToStumpYou, MSGBOX_DEFAULT
closemessage
call Route110_TrickHouseEnd_EventScript_TrickMasterExit
release
end
```
### Route110_TrickHouseEnd_EventScript_CompletedPuzzle5
```
msgbox Route110_TrickHouseEnd_Text_AllNightToMakeMechadolls, MSGBOX_DEFAULT
msgbox Route110_TrickHouseEnd_Text_YouHaveEarnedThisReward, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 0
giveitem ITEM_TM_TAUNT
call_if_eq VAR_RESULT, FALSE, Route110_TrickHouseEnd_EventScript_BagFull
msgbox Route110_TrickHouseEnd_Text_MakeNewTricksToStumpYou, MSGBOX_DEFAULT
closemessage
call Route110_TrickHouseEnd_EventScript_TrickMasterExit
release
end
```
### Route110_TrickHouseEnd_EventScript_CompletedPuzzle6
```
msgbox Route110_TrickHouseEnd_Text_AllNightToInstallDoors, MSGBOX_DEFAULT
msgbox Route110_TrickHouseEnd_Text_YouHaveEarnedThisReward, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 0
giveitem ITEM_MAGNET
call_if_eq VAR_RESULT, FALSE, Route110_TrickHouseEnd_EventScript_BagFull
msgbox Route110_TrickHouseEnd_Text_MakeNewTricksToStumpYou, MSGBOX_DEFAULT
closemessage
call Route110_TrickHouseEnd_EventScript_TrickMasterExit
release
end
```
### Route110_TrickHouseEnd_EventScript_CompletedPuzzle7
```
msgbox Route110_TrickHouseEnd_Text_AllNightSettingUpArrows, MSGBOX_DEFAULT
msgbox Route110_TrickHouseEnd_Text_YouHaveEarnedThisReward, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 0
giveitem ITEM_PP_MAX
call_if_eq VAR_RESULT, FALSE, Route110_TrickHouseEnd_EventScript_BagFull
msgbox Route110_TrickHouseEnd_Text_MakeNewTricksToStumpYou, MSGBOX_DEFAULT
closemessage
call Route110_TrickHouseEnd_EventScript_TrickMasterExit
release
end
```
### Route110_TrickHouseEnd_EventScript_CompletedPuzzle8
```
msgbox Route110_TrickHouseEnd_Text_AllNightPolishingFloors, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_FACING, DIR_SOUTH, Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwaySouth
call_if_eq VAR_FACING, DIR_NORTH, Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayNorth
call_if_eq VAR_FACING, DIR_WEST, Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayWest
call_if_eq VAR_FACING, DIR_EAST, Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayEast
delay 30
msgbox Route110_TrickHouseEnd_Text_FountainOfIdeasRunDry, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_TRICK_MASTER_END, Common_Movement_FacePlayer
waitmovement 0
delay 30
msgbox Route110_TrickHouseEnd_Text_DefeatedMePreferWhichTent, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 0
call Route110_TrickHouseEnd_EventScript_ChooseTent
call_if_eq VAR_RESULT, FALSE, Route110_TrickHouseEnd_EventScript_NoRoomForTent
msgbox Route110_TrickHouseEnd_Text_LeavingOnJourney, MSGBOX_DEFAULT
call Route110_TrickHouseEnd_EventScript_TrickMasterExit
special ResetTrickHouseNuggetFlag
release
end
```
### Route110_TrickHouseEnd_EventScript_ChooseTent
```
multichoice 0, 0, MULTI_TENT, TRUE
switch VAR_RESULT
case 0, Route110_TrickHouseEnd_EventScript_GiveRedTent
goto Route110_TrickHouseEnd_EventScript_GiveBlueTent
```
### Route110_TrickHouseEnd_EventScript_GiveRedTent
```
givedecoration DECOR_RED_TENT
return
```
### Route110_TrickHouseEnd_EventScript_GiveBlueTent
```
givedecoration DECOR_BLUE_TENT
return
```
### Route110_TrickHouseEnd_EventScript_TrickMasterExit
```
applymovement LOCALID_TRICK_MASTER_END, Route110_TrickHouse_Movement_TrickMasterSpin
waitmovement 0
playse SE_M_EXPLOSION
applymovement LOCALID_TRICK_MASTER_END, Route110_TrickHouse_Movement_TrickMasterJumpAway
waitmovement 0
removeobject LOCALID_TRICK_MASTER_END
addvar VAR_TRICK_HOUSE_LEVEL, 1
return
```
### Route110_TrickHouseEnd_EventScript_BagFull
```
call Common_EventScript_BagIsFull
msgbox Route110_TrickHouseEnd_Text_NoRoomForThis, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 1
return
```
### Route110_TrickHouseEnd_EventScript_NoRoomForTent
```
call Common_EventScript_NoRoomForDecor
msgbox Route110_TrickHouseEnd_Text_NoRoomInPC, MSGBOX_DEFAULT
setvar VAR_TRICK_HOUSE_PRIZE_PICKUP, 1
return
```
### Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwaySouth
```
applymovement LOCALID_TRICK_MASTER_END, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayNorth
```
applymovement LOCALID_TRICK_MASTER_END, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
return
```
### Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayWest
```
applymovement LOCALID_TRICK_MASTER_END, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
return
```
### Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayEast
```
applymovement LOCALID_TRICK_MASTER_END, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
return
```
### Route110_TrickHouseEnd_EventScript_TrickMasterExitTrigger
```
lockall
turnobject LOCALID_TRICK_MASTER_END, DIR_WEST
playse SE_PIN
applymovement LOCALID_TRICK_MASTER_END, Common_Movement_ExclamationMark
waitmovement 0
delay 20
applymovement LOCALID_TRICK_MASTER_END, Route110_TrickHouseEnd_Movement_TrickMasterSurprise
waitmovement 0
playse SE_M_EXPLOSION
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox Route110_TrickHouseEnd_Text_YoureIgnoringMe, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, Route110_TrickHouseEnd_Movement_KeepPlayerInRoom
waitmovement 0
delay 4
turnobject LOCALID_TRICK_MASTER_END, DIR_EAST
releaseall
end
```
### Route110_TrickHouseEnd_Movement_KeepPlayerInRoom
```
walk_down
step_end
```
### Route110_TrickHouseEnd_Movement_TrickMasterSurprise
```
jump_in_place_left
step_end
```

## Textes (17)
### Route110_TrickHouseEnd_Text_YouveMadeItToMe
```
Aaargh! Tu m'as retrouvé?\nHmmm… Tu as l'œil!$
```
### Route110_TrickHouseEnd_Text_AllNightToPlantTrees
```
Il m'a fallu toute la nuit pour planter\ntous ces arbres…\pTu es presque aussi balèze que moi,\nà 1, 2, 3, 4, 5, 6 endroits près!$
```
### Route110_TrickHouseEnd_Text_AllNightToMakeMaze
```
Il m'a fallu toute la nuit pour faire ce\nlabyrinthe…\pTu es presque aussi balèze que moi,\nà 1, 2, 3, 4, 5 endroits près!$
```
### Route110_TrickHouseEnd_Text_AllNightToPreparePanels
```
Il m'a fallu toute la nuit pour préparer\nces pans de mur…\pTu es presque aussi balèze que moi,\nà un, deux, trois, quatre endroits près!$
```
### Route110_TrickHouseEnd_Text_AllNightToShoveBoulders
```
Il m'a fallu toute la nuit pour pousser\njusqu'ici tous ces rochers…\pTu es presque aussi balèze que moi,\nà un, deux, trois endroits près!$
```
### Route110_TrickHouseEnd_Text_AllNightToMakeMechadolls
```
Il m'a fallu une nuit pour fabriquer ces\nMECAPOUPEES et une pour les questions.\pTu es presque aussi balèze que moi,\nà un, deux endroits près!$
```
### Route110_TrickHouseEnd_Text_AllNightToInstallDoors
```
Il m'a fallu toute une nuit pour\ninstaller ces portes…\pTu es presque aussi balèze que moi!$
```
### Route110_TrickHouseEnd_Text_AllNightSettingUpArrows
```
Il m'a fallu toute la nuit pour installer\nces flèches…\pTu es aussi balèze que moi!$
```
### Route110_TrickHouseEnd_Text_AllNightPolishingFloors
```
Il m'a fallu toute la nuit pour cirer\nles parquets…\pTu es plus balèze que moi!\nIl est possible que…$
```
### Route110_TrickHouseEnd_Text_FountainOfIdeasRunDry
```
Que… Qu'est-ce que je vais faire? Mes\nsources d'inspiration sont épuisées…\pJe devrais peut-être parcourir le pays\nà la recherche de nouveaux pièges…$
```
### Route110_TrickHouseEnd_Text_DefeatedMePreferWhichTent
```
Ça me coûte de l'admettre, mais je\ncrois que tu as fait mieux que moi!\pCependant, mon charisme doit\nt'impressionner, puisque tu viens me\lvoir très souvent. Aucun doute!\pMais malgré tout, j'ai perdu!\pPour sceller cette nouvelle amitié\nentre toi, le disciple, et moi, le génie,\lje te propose de garder un petit\lsouvenir!\pTu as le choix entre une TENTE ROUGE\nou une TENTE BLEUE.\lQue préfères-tu?$
```
### Route110_TrickHouseEnd_Text_NoRoomInPC
```
Quoi? Plus de place dans ton PC?\nQu'est-ce que je vais faire de ça?\pJ'aimerais te dire tant pis, mais je suis\nsympa. J'attendrai que tu reviennes!$
```
### Route110_TrickHouseEnd_Text_LeavingOnJourney
```
… … … … … …\pJe vais partir à l'aventure.\nEn quête de nouveaux pièges!\pJ'espère que tu reviendras me voir\npour me divertir.\pBon, allez, à la prochaine!$
```
### Route110_TrickHouseEnd_Text_YouHaveEarnedThisReward
```
Excellent!\nTu as gagné cette récompense!$
```
### Route110_TrickHouseEnd_Text_NoRoomForThis
```
Quoi? Tu n'as plus de place?\nCombien d'objets transportes-tu déjà?\pSoit, puisque tu m'as trouvé, je garde\nta récompense. Reviens me voir.$
```
### Route110_TrickHouseEnd_Text_MakeNewTricksToStumpYou
```
Epargne-moi ce sourire narquois! Ne va\npas t'imaginer que tu as déjà gagné!\pJe trouverai de nouveaux pièges pour\nte coller. Après, tu pourras te moquer.\pReviens me voir pour un autre\ndéfi passionnant!$
```
### Route110_TrickHouseEnd_Text_YoureIgnoringMe
```
Quoi? Comment oses-tu? Tu m'ignores,\nmaintenant? Ça me fend le cœur!$
```
