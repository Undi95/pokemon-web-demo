# Route101

## Métadonnées
- **id** : `MAP_ROUTE101`
- **layout** : `LAYOUT_ROUTE101`
- **music** : `MUS_ROUTE101`
- **region_map_section** : `MAPSEC_ROUTE_101`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_OLDALE_TOWN`
- down (offset 0) → `MAP_LITTLEROOT_TOWN`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 16,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route101_EventScript_Youngster` | `0` |
| `LOCALID_ROUTE101_BIRCH` | `OBJ_EVENT_GFX_PROF_BIRCH` | 9,13 | `MOVEMENT_TYPE_JOG_IN_PLACE_RIGHT` | `0x0` | `FLAG_HIDE_ROUTE_101_BIRCH_ZIGZAGOON_BATTLE` |
| `` | `OBJ_EVENT_GFX_BIRCHS_BAG` | 7,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route101_EventScript_BirchsBag` | `FLAG_HIDE_ROUTE_101_BIRCH_STARTERS_BAG` |
| `LOCALID_ROUTE101_ZIGZAGOON` | `OBJ_EVENT_GFX_ZIGZAGOON_1` | 10,13 | `MOVEMENT_TYPE_JOG_IN_PLACE_LEFT` | `0x0` | `FLAG_HIDE_ROUTE_101_ZIGZAGOON` |
| `` | `OBJ_EVENT_GFX_PROF_BIRCH` | 5,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `ProfBirch_EventScript_RatePokedexOrRegister` | `FLAG_HIDE_ROUTE_101_BIRCH` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 2,13 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `Route101_EventScript_Boy` | `FLAG_HIDE_ROUTE_101_BOY` |

## Coord events / triggers (9)
- (10,19) → `Route101_EventScript_StartBirchRescue` (si `VAR_ROUTE101_STATE` == `1`)
- (11,19) → `Route101_EventScript_StartBirchRescue` (si `VAR_ROUTE101_STATE` == `1`)
- (10,18) → `Route101_EventScript_PreventExitSouth` (si `VAR_ROUTE101_STATE` == `2`)
- (11,18) → `Route101_EventScript_PreventExitSouth` (si `VAR_ROUTE101_STATE` == `2`)
- (6,16) → `Route101_EventScript_PreventExitWest` (si `VAR_ROUTE101_STATE` == `2`)
- (6,15) → `Route101_EventScript_PreventExitWest` (si `VAR_ROUTE101_STATE` == `2`)
- (6,17) → `Route101_EventScript_PreventExitWest` (si `VAR_ROUTE101_STATE` == `2`)
- (6,18) → `Route101_EventScript_PreventExitWest` (si `VAR_ROUTE101_STATE` == `2`)
- (7,13) → `Route101_EventScript_PreventExitNorth` (si `VAR_ROUTE101_STATE` == `2`)

## BG events / signs (1)
- (5,9) [sign] → `Route101_EventScript_RouteSign`

## Flags référencés (8)
- `FLAG_HIDE_LITTLEROOT_TOWN_BIRCHS_LAB_BIRCH`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_BEDROOM`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_BEDROOM`
- `FLAG_HIDE_MAP_NAME_POPUP`
- `FLAG_HIDE_ROUTE_101_BIRCH_STARTERS_BAG`
- `FLAG_HIDE_ROUTE_101_BIRCH_ZIGZAGOON_BATTLE`
- `FLAG_RESCUED_BIRCH`
- `FLAG_SYS_POKEMON_GET`

## Variables référencées (3)
- `VAR_BIRCH_LAB_STATE`
- `VAR_RESULT`
- `VAR_ROUTE101_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/prof_birch.inc
- `ProfBirch_EventScript_UpdateLocation`

## Scripts (27)
### Route101_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route101_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route101_OnFrame
```
### Route101_OnTransition
```
call ProfBirch_EventScript_UpdateLocation
end
```
### Route101_OnFrame
```
map_script_2 VAR_ROUTE101_STATE, 0, Route101_EventScript_HideMapNamePopup
```
### Route101_EventScript_HideMapNamePopup
```
setflag FLAG_HIDE_MAP_NAME_POPUP
setvar VAR_ROUTE101_STATE, 1
end
```
### Route101_EventScript_StartBirchRescue
```
lockall
playbgm MUS_HELP, TRUE
msgbox Route101_Text_HelpMe, MSGBOX_DEFAULT
closemessage
setobjectxy LOCALID_ROUTE101_BIRCH, 0, 15
setobjectxy LOCALID_ROUTE101_ZIGZAGOON, 0, 16
applymovement LOCALID_PLAYER, Route101_Movement_EnterScene
applymovement LOCALID_ROUTE101_BIRCH, Route101_Movement_BirchRunAway1
applymovement LOCALID_ROUTE101_ZIGZAGOON, Route101_Movement_ZigzagoonChase1
waitmovement 0
applymovement LOCALID_ROUTE101_ZIGZAGOON, Route101_Movement_ZigzagoonChaseInCircles
applymovement LOCALID_ROUTE101_BIRCH, Route101_Movement_BirchRunInCircles
waitmovement 0
applymovement LOCALID_ROUTE101_BIRCH, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
applymovement LOCALID_ROUTE101_ZIGZAGOON, Route101_Movement_ZigzagoonFaceBirch
applymovement LOCALID_ROUTE101_BIRCH, Route101_Movement_BirchFaceZigzagoon
waitmovement 0
msgbox Route101_Text_PleaseHelp, MSGBOX_DEFAULT
closemessage
setvar VAR_ROUTE101_STATE, 2
releaseall
end
```
### Route101_EventScript_PreventExitSouth
```
lockall
msgbox Route101_Text_DontLeaveMe, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, Route101_Movement_PreventExitSouth
waitmovement 0
releaseall
end
```
### Route101_EventScript_PreventExitWest
```
lockall
msgbox Route101_Text_DontLeaveMe, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, Route101_Movement_PreventExitWest
waitmovement 0
releaseall
end
```
### Route101_EventScript_PreventExitNorth
```
lockall
msgbox Route101_Text_DontLeaveMe, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, Route101_Movement_PreventExitNorth
waitmovement 0
releaseall
end
```
### Route101_Movement_PreventExitSouth
```
walk_up
step_end
```
### Route101_Movement_PreventExitWest
```
walk_right
step_end
```
### Route101_Movement_PreventExitNorth
```
walk_down
step_end
```
### Route101_Movement_ZigzagoonChaseInCircles
```
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_left
walk_fast_left
step_end
```
### Route101_Movement_ZigzagoonChase1
```
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_up
step_end
step_end
```
### Route101_Movement_ZigzagoonFaceBirch
```
walk_in_place_fast_left
walk_in_place_fast_left
walk_in_place_fast_left
walk_in_place_fast_left
step_end
```
### Route101_Movement_EnterScene
```
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_in_place_faster_left
step_end
```
### Route101_Movement_BirchRunInCircles
```
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_left
walk_fast_left
walk_fast_left
step_end
```
### Route101_Movement_BirchRunAway1
```
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_up
walk_fast_up
step_end
step_end
```
### Route101_Movement_BirchFaceZigzagoon
```
walk_in_place_fast_right
walk_in_place_fast_right
walk_in_place_fast_right
walk_in_place_fast_right
step_end
```
### Route101_Movement_Unused1
```
walk_up
walk_up
step_end
```
### Route101_Movement_Unused2
```
walk_up
walk_left
walk_up
step_end
```
### Route101_EventScript_Youngster
```
msgbox Route101_Text_TakeTiredPokemonToPokeCenter, MSGBOX_NPC
end
```
### Route101_EventScript_Boy
```
msgbox Route101_Text_WildPokemonInTallGrass, MSGBOX_NPC
end
```
### Route101_EventScript_RouteSign
```
msgbox Route101_Text_RouteSign, MSGBOX_SIGN
end
```
### Route101_EventScript_BirchsBag
```
lock
faceplayer
setflag FLAG_SYS_POKEMON_GET
setflag FLAG_RESCUED_BIRCH
fadescreen FADE_TO_BLACK
removeobject LOCALID_ROUTE101_ZIGZAGOON
setobjectxy LOCALID_PLAYER, 6, 13
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
special ChooseStarter
applymovement LOCALID_ROUTE101_BIRCH, Route101_Movement_BirchApproachPlayer
waitmovement 0
msgbox Route101_Text_YouSavedMe, MSGBOX_DEFAULT
special HealPlayerParty
setflag FLAG_HIDE_ROUTE_101_BIRCH_ZIGZAGOON_BATTLE
clearflag FLAG_HIDE_LITTLEROOT_TOWN_BIRCHS_LAB_BIRCH
setflag FLAG_HIDE_ROUTE_101_BIRCH_STARTERS_BAG
setvar VAR_BIRCH_LAB_STATE, 2
setvar VAR_ROUTE101_STATE, 3
clearflag FLAG_HIDE_MAP_NAME_POPUP
checkplayergender
call_if_eq VAR_RESULT, MALE, Route101_EventScript_HideMayInBedroom
call_if_eq VAR_RESULT, FEMALE, Route101_EventScript_HideBrendanInBedroom
warp MAP_LITTLEROOT_TOWN_PROFESSOR_BIRCHS_LAB, 6, 5
waitstate
release
end
```
### Route101_EventScript_HideMayInBedroom
```
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_BEDROOM
return
```
### Route101_EventScript_HideBrendanInBedroom
```
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_BEDROOM
return
```
### Route101_Movement_BirchApproachPlayer
```
walk_right
step_end
```

## Textes (7)
### Route101_Text_HelpMe
```
A… A l'aide!$
```
### Route101_Text_PleaseHelp
```
Hé! Toi, là-bas!\nJe t'en supplie! Aide-moi!\pDans mon SAC!\nIl y a des POKé BALLS!$
```
### Route101_Text_DontLeaveMe
```
Où… Où est-ce que tu vas?!\nNe me laisse pas comme ça!$
```
### Route101_Text_YouSavedMe
```
PROF. SEKO: Ouf…\pJ'étudiais les POKéMON sauvages\ndans les hautes herbes, quand il m'a\lsauté dessus.\pTu m'as sauvé.\nMerci beaucoup!\pOh?\pHé, c'est toi, {PLAYER}{KUN}!\pCe n'est pas un endroit pour discuter.\nAllons au LABO POKéMON, OK?$
```
### Route101_Text_TakeTiredPokemonToPokeCenter
```
Si tes POKéMON sont fatigués,\nemmène-les dans un CENTRE POKéMON.\pIl y a un CENTRE POKéMON à ROSYERES,\ntout près d'ici.$
```
### Route101_Text_WildPokemonInTallGrass
```
Les POKéMON sauvages vont te sauter\ndessus dans les hautes herbes.\pPour attraper des POKéMON,\ntu dois aller dans les hautes herbes\let chercher.$
```
### Route101_Text_RouteSign
```
ROUTE 101\n{UP_ARROW} ROSYERES$
```
