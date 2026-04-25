# Route103

## Métadonnées
- **id** : `MAP_ROUTE103`
- **layout** : `LAYOUT_ROUTE103`
- **music** : `MUS_ROUTE101`
- **region_map_section** : `MAPSEC_ROUTE_103`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset 0) → `MAP_OLDALE_TOWN`
- right (offset -60) → `MAP_ROUTE110`

## Object events (20 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_3` | 49,12 | `MOVEMENT_TYPE_FACE_LEFT` | `Route103_EventScript_Man` | `0` |
| `LOCALID_ROUTE103_RIVAL` | `OBJ_EVENT_GFX_VAR_0` | 10,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route103_EventScript_Rival` | `FLAG_HIDE_ROUTE_103_RIVAL` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 71,11 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route103_EventScript_Daisy` | `0` |
| `` | `OBJ_EVENT_GFX_TWIN` | 65,12 | `MOVEMENT_TYPE_FACE_DOWN` | `Route103_EventScript_Liv` | `0` |
| `` | `OBJ_EVENT_GFX_TWIN` | 64,12 | `MOVEMENT_TYPE_FACE_DOWN` | `Route103_EventScript_Amy` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 50,8 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route103_EventScript_Andrew` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 58,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 59,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 60,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 20,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route103_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_PROF_BIRCH` | 7,3 | `MOVEMENT_TYPE_WANDER_AROUND` | `ProfBirch_EventScript_RatePokedexOrRegister` | `FLAG_HIDE_ROUTE_103_BIRCH` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 56,13 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route103_EventScript_Miguel` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 50,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route103_EventScript_ItemGuardSpec` | `FLAG_ITEM_ROUTE_103_GUARD_SPEC` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 67,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 72,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 67,5 | `MOVEMENT_TYPE_FACE_DOWN` | `Route103_EventScript_Rhett` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 67,9 | `MOVEMENT_TYPE_FACE_UP` | `Route103_EventScript_Marcos` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 36,6 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route103_EventScript_Isabelle` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 36,13 | `MOVEMENT_TYPE_WALK_UP_AND_DOWN` | `Route103_EventScript_Pete` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 64,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route103_EventScript_ItemPPUp` | `FLAG_ITEM_ROUTE_103_PP_UP` |

## Warps (1)
- #0 (45,6) → `MAP_ALTERING_CAVE` warp #0

## BG events / signs (1)
- (11,9) [sign] → `Route103_EventScript_RouteSign`

## Flags référencés (4)
- `FLAG_DEFEATED_RIVAL_ROUTE103`
- `FLAG_HIDE_LITTLEROOT_TOWN_BIRCHS_LAB_RIVAL`
- `FLAG_HIDE_OLDALE_TOWN_RIVAL`
- `FLAG_SYS_GAME_CLEAR`

## Variables référencées (5)
- `VAR_BIRCH_LAB_STATE`
- `VAR_FACING`
- `VAR_OLDALE_RIVAL_STATE`
- `VAR_RESULT`
- `VAR_STARTER_MON`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route103_Text_AmyLivRegister`
- `Route103_Text_AmyPostBattle`
- `Route103_Text_AmyRematchPostBattle`
- `Route103_Text_AndrewPostBattle`
- `Route103_Text_DaisyPostBattle`
- `Route103_Text_IsabellePostBattle`
- `Route103_Text_LivPostBattle`
- `Route103_Text_LivRematchPostBattle`
- `Route103_Text_MarcosPostBattle`
- `Route103_Text_MiguelPostBattle`
- `Route103_Text_MiguelRegister`
- `Route103_Text_MiguelRematchPostBattle`
- `Route103_Text_PetePostBattle`
- `Route103_Text_RhettPostBattle`
### data/scripts/prof_birch.inc
- `ProfBirch_EventScript_UpdateLocation`
### data/scripts/rival_graphics.inc
- `Common_EventScript_SetupRivalGfxId`

## Scripts (44)
### Route103_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route103_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route103_OnLoad
```
### Route103_OnTransition
```
call Common_EventScript_SetupRivalGfxId
call ProfBirch_EventScript_UpdateLocation
end
```
### Route103_OnLoad
```
call_if_set FLAG_SYS_GAME_CLEAR, Route103_EventScript_OpenAlteringCave
end
```
### Route103_EventScript_OpenAlteringCave
```
setmetatile 45, 5, METATILE_General_CaveEntrance_Top, TRUE
setmetatile 45, 6, METATILE_General_CaveEntrance_Bottom, FALSE
return
```
### Route103_EventScript_Rival
```
lockall
checkplayergender
goto_if_eq VAR_RESULT, MALE, Route103_EventScript_RivalMay
goto_if_eq VAR_RESULT, FEMALE, Route103_EventScript_RivalBrendan
end
```
### Route103_EventScript_RivalMay
```
msgbox Route103_Text_MayRoute103Pokemon, MSGBOX_DEFAULT
closemessage
playbgm MUS_ENCOUNTER_MAY, TRUE
applymovement LOCALID_ROUTE103_RIVAL, Common_Movement_FacePlayer
waitmovement 0
applymovement LOCALID_ROUTE103_RIVAL, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_ROUTE103_RIVAL, Common_Movement_Delay48
waitmovement 0
msgbox Route103_Text_MayLetsBattle, MSGBOX_DEFAULT
switch VAR_STARTER_MON
case 0, Route103_EventScript_StartMayBattleTreecko
case 1, Route103_EventScript_StartMayBattleTorchic
case 2, Route103_EventScript_StartMayBattleMudkip
end
```
### Route103_EventScript_RivalBrendan
```
msgbox Route103_Text_BrendanRoute103Pokemon, MSGBOX_DEFAULT
closemessage
playbgm MUS_ENCOUNTER_BRENDAN, TRUE
applymovement LOCALID_ROUTE103_RIVAL, Common_Movement_FacePlayer
waitmovement 0
applymovement LOCALID_ROUTE103_RIVAL, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_ROUTE103_RIVAL, Common_Movement_Delay48
waitmovement 0
msgbox Route103_Text_BrendanLetsBattle, MSGBOX_DEFAULT
switch VAR_STARTER_MON
case 0, Route103_EventScript_StartBrendanBattleTreecko
case 1, Route103_EventScript_StartBrendanBattleTorchic
case 2, Route103_EventScript_StartBrendanBattleMudkip
end
```
### Route103_EventScript_StartMayBattleTreecko
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_103_TREECKO, Route103_Text_MayDefeated
goto Route103_EventScript_AfterMayBattle
end
```
### Route103_EventScript_StartMayBattleTorchic
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_103_TORCHIC, Route103_Text_MayDefeated
goto Route103_EventScript_AfterMayBattle
end
```
### Route103_EventScript_StartMayBattleMudkip
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_103_MUDKIP, Route103_Text_MayDefeated
goto Route103_EventScript_AfterMayBattle
end
```
### Route103_EventScript_StartBrendanBattleTreecko
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_103_TREECKO, Route103_Text_BrendanDefeated
goto Route103_EventScript_AfterBrendanBattle
end
```
### Route103_EventScript_StartBrendanBattleTorchic
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_103_TORCHIC, Route103_Text_BrendanDefeated
goto Route103_EventScript_AfterBrendanBattle
end
```
### Route103_EventScript_StartBrendanBattleMudkip
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_103_MUDKIP, Route103_Text_BrendanDefeated
goto Route103_EventScript_AfterBrendanBattle
end
```
### Route103_EventScript_AfterMayBattle
```
msgbox Route103_Text_MayTimeToHeadBack, MSGBOX_DEFAULT
goto Route103_EventScript_RivalExit
end
```
### Route103_EventScript_AfterBrendanBattle
```
msgbox Route103_Text_BrendanTimeToHeadBack, MSGBOX_DEFAULT
goto Route103_EventScript_RivalExit
end
```
### Route103_EventScript_RivalExit
```
closemessage
switch VAR_FACING
case DIR_SOUTH, Route103_EventScript_RivalExitFacingSouth
case DIR_NORTH, Route103_EventScript_RivalExitFacingNorth
case DIR_WEST, Route103_EventScript_RivalExitFacingEastOrWest
case DIR_EAST, Route103_EventScript_RivalExitFacingEastOrWest
end
```
### Route103_EventScript_RivalExitFacingNorth
```
applymovement LOCALID_PLAYER, Route103_Movement_WatchRivalExitFacingNorth
applymovement LOCALID_ROUTE103_RIVAL, Route103_Movement_RivalExitFacingNorth1
waitmovement 0
playse SE_LEDGE
applymovement LOCALID_ROUTE103_RIVAL, Route103_Movement_RivalExitFacingNorth2
waitmovement 0
goto Route103_EventScript_RivalEnd
end
```
### Route103_EventScript_RivalExitFacingEastOrWest
```
applymovement LOCALID_PLAYER, Route103_Movement_WatchRivalExitFacingEastOrWest
applymovement LOCALID_ROUTE103_RIVAL, Route103_Movement_RivalExit1
waitmovement 0
playse SE_LEDGE
applymovement LOCALID_ROUTE103_RIVAL, Route103_Movement_RivalExit2
waitmovement 0
goto Route103_EventScript_RivalEnd
end
```
### Route103_EventScript_RivalExitFacingSouth
```
applymovement LOCALID_ROUTE103_RIVAL, Route103_Movement_RivalExit1
waitmovement 0
playse SE_LEDGE
applymovement LOCALID_ROUTE103_RIVAL, Route103_Movement_RivalExit2
waitmovement 0
goto Route103_EventScript_RivalEnd
end
```
### Route103_EventScript_RivalEnd
```
removeobject LOCALID_ROUTE103_RIVAL
setvar VAR_BIRCH_LAB_STATE, 4
clearflag FLAG_HIDE_LITTLEROOT_TOWN_BIRCHS_LAB_RIVAL
setflag FLAG_DEFEATED_RIVAL_ROUTE103
setvar VAR_OLDALE_RIVAL_STATE, 1
clearflag FLAG_HIDE_OLDALE_TOWN_RIVAL
savebgm MUS_DUMMY
fadedefaultbgm
releaseall
end
```
### Route103_Movement_RivalExitFacingNorth1
```
walk_left
walk_down
step_end
```
### Route103_Movement_RivalExitFacingNorth2
```
jump_2_down
delay_16
walk_down
walk_down
walk_down
walk_down
step_end
```
### Route103_Movement_WatchRivalExitFacingNorth
```
delay_16
delay_4
walk_in_place_faster_left
delay_16
walk_in_place_faster_down
step_end
```
### Route103_Movement_RivalExit1
```
walk_down
step_end
```
### Route103_Movement_RivalExit2
```
jump_2_down
delay_16
walk_down
walk_down
walk_down
step_end
```
### Route103_Movement_WatchRivalExitFacingEastOrWest
```
delay_16
walk_in_place_faster_down
step_end
```
### Route103_EventScript_Boy
```
msgbox Route103_Text_ShouldHaveBroughtPotion, MSGBOX_NPC
end
```
### Route103_EventScript_Man
```
msgbox Route103_Text_ShortcutToOldale, MSGBOX_NPC
end
```
### Route103_EventScript_RouteSign
```
msgbox Route103_Text_RouteSign, MSGBOX_SIGN
end
```
### Route103_EventScript_Daisy
```
trainerbattle_single TRAINER_DAISY, Route103_Text_DaisyIntro, Route103_Text_DaisyDefeated
msgbox Route103_Text_DaisyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route103_EventScript_Amy
```
trainerbattle_double TRAINER_AMY_AND_LIV_1, Route103_Text_AmyIntro, Route103_Text_AmyDefeated, Route103_Text_AmyNotEnoughPokemon, Route102_EventScript_AmyRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route102_EventScript_AmyRematch
msgbox Route103_Text_AmyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route102_EventScript_AmyRegisterMatchCallAfterBattle
```
msgbox Route103_Text_AmyLivRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_AMY_AND_LIV_1
release
end
```
### Route102_EventScript_AmyRematch
```
trainerbattle_rematch_double TRAINER_AMY_AND_LIV_1, Route103_Text_AmyRematchIntro, Route103_Text_AmyRematchDefeated, Route103_Text_AmyRematchNotEnoughPokemon
msgbox Route103_Text_AmyRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route103_EventScript_Liv
```
trainerbattle_double TRAINER_AMY_AND_LIV_1, Route103_Text_LivIntro, Route103_Text_LivDefeated, Route103_Text_LivNotEnoughPokemon, Route102_EventScript_LivRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route102_EventScript_LivRematch
msgbox Route103_Text_LivPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route102_EventScript_LivRegisterMatchCallAfterBattle
```
msgbox Route103_Text_AmyLivRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_AMY_AND_LIV_1
release
end
```
### Route102_EventScript_LivRematch
```
trainerbattle_rematch_double TRAINER_AMY_AND_LIV_1, Route103_Text_LivRematchIntro, Route103_Text_LivRematchDefeated, Route103_Text_LivRematchNotEnoughPokemon
msgbox Route103_Text_LivRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route103_EventScript_Andrew
```
trainerbattle_single TRAINER_ANDREW, Route103_Text_AndrewIntro, Route103_Text_AndrewDefeated
msgbox Route103_Text_AndrewPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route103_EventScript_Miguel
```
trainerbattle_single TRAINER_MIGUEL_1, Route103_Text_MiguelIntro, Route103_Text_MiguelDefeated, Route102_EventScript_MiguelRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route103_EventScript_MiguelRematch
msgbox Route103_Text_MiguelPostBattle, MSGBOX_DEFAULT
release
end
```
### Route102_EventScript_MiguelRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route103_Text_MiguelRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_MIGUEL_1
release
end
```
### Route103_EventScript_MiguelRematch
```
trainerbattle_rematch TRAINER_MIGUEL_1, Route103_Text_MiguelRematchIntro, Route103_Text_MiguelRematchDefeated
msgbox Route103_Text_MiguelRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route103_EventScript_Marcos
```
trainerbattle_single TRAINER_MARCOS, Route103_Text_MarcosIntro, Route103_Text_MarcosDefeated
msgbox Route103_Text_MarcosPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route103_EventScript_Rhett
```
trainerbattle_single TRAINER_RHETT, Route103_Text_RhettIntro, Route103_Text_RhettDefeated
msgbox Route103_Text_RhettPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route103_EventScript_Pete
```
trainerbattle_single TRAINER_PETE, Route103_Text_PeteIntro, Route103_Text_PeteDefeated
msgbox Route103_Text_PetePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route103_EventScript_Isabelle
```
trainerbattle_single TRAINER_ISABELLE, Route103_Text_IsabelleIntro, Route103_Text_IsabelleDefeated
msgbox Route103_Text_IsabellePostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (11)
### Route103_Text_MayRoute103Pokemon
```
FLORA: Voyons… Les POKéMON trouvés\nsur la ROUTE 103 comprennent…$
```
### Route103_Text_MayLetsBattle
```
Oh, salut {PLAYER}{KUN}!\p… Oh, je vois. Mon père t'a fait cadeau\nd'un POKéMON.\pPuisqu'on est là, on n'a qu'à se faire\nun petit combat!\pJe vais te montrer ce que c'est qu'être\nun DRESSEUR.$
```
### Route103_Text_MayDefeated
```
Waouh! C'était génial!\n{PLAYER}{KUN}, tu as beaucoup de talent!$
```
### Route103_Text_MayTimeToHeadBack
```
FLORA: Maintenant, je crois savoir\npourquoi mon père garde un œil sur toi.\pC'est vrai, tu viens juste d'avoir ce\nPOKéMON et il t'aime déjà.\pTu peux peut-être nouer des liens avec\nn'importe quel type de POKéMON.\pBon, il est temps de retourner au\nLABO.$
```
### Route103_Text_BrendanRoute103Pokemon
```
BRICE: OK! Alors c'est celui-ci et\ncelui-là qui vivent sur la ROUTE 103…$
```
### Route103_Text_BrendanLetsBattle
```
Hé, c'est {PLAYER}!\p… Oh, super, papa t'a donné un POKéMON.\pPuisqu'on est là, pourquoi ne pas se\nfaire un petit combat?\pJe vais t'apprendre ce que c'est que\nd'être DRESSEUR!$
```
### Route103_Text_BrendanDefeated
```
Hum, {PLAYER}, t'es pas si minable que ça.$
```
### Route103_Text_BrendanTimeToHeadBack
```
BRICE: Ça y est, je sais.\nMaintenant, je sais pourquoi mon père\lgarde un œil sur toi.\pRegarde, ton POKéMON t'aime déjà, alors\nque tu viens juste de l'avoir.\p{PLAYER}, il me semble que tu peux nouer\ndes liens avec n'importe quel POKéMON.\pOn devrait retourner au LABO.$
```
### Route103_Text_ShouldHaveBroughtPotion
```
Mon POKéMON est terriblement fatigué…\nJ'aurais dû apporter une POTION…$
```
### Route103_Text_ShortcutToOldale
```
Si tu traverses la mer ici, tu trouveras\nun raccourci pour ROSYERES.\pHum, hum… Utile, hein?$
```
### Route103_Text_RouteSign
```
ROUTE 103\n{DOWN_ARROW} ROSYERES$
```
