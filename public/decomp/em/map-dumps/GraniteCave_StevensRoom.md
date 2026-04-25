# GraniteCave_StevensRoom

## Métadonnées
- **id** : `MAP_GRANITE_CAVE_STEVENS_ROOM`
- **layout** : `LAYOUT_GRANITE_CAVE_STEVENS_ROOM`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_GRANITE_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_GRANITE_CAVE_STEVEN` | `OBJ_EVENT_GFX_STEVEN` | 7,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `GraniteCave_StevensRoom_EventScript_Steven` | `FLAG_HIDE_GRANITE_CAVE_STEVEN` |

## Warps (1)
- #0 (7,3) → `MAP_GRANITE_CAVE_1F` warp #3

## Flags référencés (2)
- `FLAG_DELIVERED_STEVEN_LETTER`
- `FLAG_REGISTERED_STEVEN_POKENAV`

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_FACING`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_PlayerHandedOverTheItem`

## Scripts (8)
### GraniteCave_StevensRoom_EventScript_Steven
```
lock
faceplayer
msgbox GraniteCave_StevensRoom_Text_ImStevenLetterForMe, MSGBOX_DEFAULT
setvar VAR_0x8004, ITEM_LETTER
call Common_EventScript_PlayerHandedOverTheItem
setflag FLAG_DELIVERED_STEVEN_LETTER
msgbox GraniteCave_StevensRoom_Text_ThankYouTakeThis, MSGBOX_DEFAULT
giveitem ITEM_TM_STEEL_WING
call_if_eq VAR_RESULT, FALSE, GraniteCave_StevensRoom_EventScript_BagFull
msgbox GraniteCave_StevensRoom_Text_CouldBecomeChampionLetsRegister, MSGBOX_DEFAULT
closemessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox GraniteCave_StevensRoom_Text_RegisteredSteven, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_REGISTERED_STEVEN_POKENAV
msgbox GraniteCave_StevensRoom_Text_IveGotToHurryAlong, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_FACING, DIR_NORTH, GraniteCave_StevensRoom_EventScript_StevenExitNorth
call_if_eq VAR_FACING, DIR_SOUTH, GraniteCave_StevensRoom_EventScript_StevenExitSouth
call_if_eq VAR_FACING, DIR_WEST, GraniteCave_StevensRoom_EventScript_StevenExitWestEast
call_if_eq VAR_FACING, DIR_EAST, GraniteCave_StevensRoom_EventScript_StevenExitWestEast
playse SE_EXIT
removeobject LOCALID_GRANITE_CAVE_STEVEN
release
end
```
### GraniteCave_StevensRoom_EventScript_StevenExitNorth
```
applymovement LOCALID_GRANITE_CAVE_STEVEN, GraniteCave_StevensRoom_Movement_StevenExit
waitmovement 0
return
```
### GraniteCave_StevensRoom_EventScript_StevenExitWestEast
```
applymovement LOCALID_PLAYER, GraniteCave_StevensRoom_Movement_PlayerTurnTowardExit
applymovement LOCALID_GRANITE_CAVE_STEVEN, GraniteCave_StevensRoom_Movement_StevenExit
waitmovement 0
return
```
### GraniteCave_StevensRoom_EventScript_StevenExitSouth
```
applymovement LOCALID_PLAYER, GraniteCave_StevensRoom_Movement_PlayerTurnTowardExit
applymovement LOCALID_GRANITE_CAVE_STEVEN, GraniteCave_StevensRoom_Movement_StevenExitSouth
waitmovement 0
return
```
### GraniteCave_StevensRoom_EventScript_BagFull
```
msgbox GraniteCave_StevensRoom_Text_OhBagIsFull, MSGBOX_DEFAULT
return
```
### GraniteCave_StevensRoom_Movement_StevenExit
```
walk_up
walk_up
walk_up
walk_up
walk_up
delay_8
step_end
```
### GraniteCave_StevensRoom_Movement_PlayerTurnTowardExit
```
delay_16
delay_16
delay_16
walk_in_place_faster_up
step_end
```
### GraniteCave_StevensRoom_Movement_StevenExitSouth
```
walk_left
walk_up
walk_up
walk_up
walk_right
walk_up
walk_up
delay_8
step_end
```

## Textes (6)
### GraniteCave_StevensRoom_Text_ImStevenLetterForMe
```
Je suis PIERRE.\pJe m'intéresse aux pierres rares, alors\nje vais ici et là.\pOh?\nC'est une LETTRE pour moi?$
```
### GraniteCave_StevensRoom_Text_ThankYouTakeThis
```
PIERRE: OK, merci.\pTu as fait tout ça rien que pour me la \nremettre? Il faut que je te remercie.\pLaisse-moi voir…\nJe vais te donner cette CT.\pElle contient ma capacité préférée,\nAILE D'ACIER.$
```
### GraniteCave_StevensRoom_Text_CouldBecomeChampionLetsRegister
```
PIERRE: Tes POKéMON semblent être\ntout à fait compétents.\pEn continuant à t'entraîner, un jour, \ntu pourrais même devenir le MAITRE de la\lLIGUE POKéMON. Je le pense vraiment.\pJe sais, puisqu'on se connaît\nmaintenant, enregistrons nos numéros\ldans nos POKéNAVS.\p… … … … … …$
```
### GraniteCave_StevensRoom_Text_RegisteredSteven
```
Vous avez enregistré PIERRE\ndans le POKéNAV.$
```
### GraniteCave_StevensRoom_Text_IveGotToHurryAlong
```
Maintenant, il faut que je me dépêche.$
```
### GraniteCave_StevensRoom_Text_OhBagIsFull
```
Oh, ton SAC est plein…\nC'est dommage.$
```
