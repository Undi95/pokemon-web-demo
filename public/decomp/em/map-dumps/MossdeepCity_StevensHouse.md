# MossdeepCity_StevensHouse

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY_STEVENS_HOUSE`
- **layout** : `LAYOUT_MOSSDEEP_CITY_STEVENS_HOUSE`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_STEVENS_HOUSE_STEVEN` | `OBJ_EVENT_GFX_STEVEN` | 9,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `MossdeepCity_StevensHouse_EventScript_Steven` | `FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_STEVEN` |
| `LOCALID_STEVENS_HOUSE_BALL` | `OBJ_EVENT_GFX_ITEM_BALL` | 4,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `MossdeepCity_StevensHouse_EventScript_BeldumPokeball` | `FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_BELDUM_POKEBALL` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 6,4 | `MOVEMENT_TYPE_INVISIBLE` | `MossdeepCity_StevensHouse_EventScript_Letter` | `FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_INVISIBLE_NINJA_BOY` |

## Warps (2)
- #0 (3,7) → `MAP_MOSSDEEP_CITY` warp #6
- #1 (4,7) → `MAP_MOSSDEEP_CITY` warp #6

## BG events / signs (4)
- (0,1) [sign] → `MossdeepCity_StevensHouse_EventScript_RockDisplay`
- (1,1) [sign] → `MossdeepCity_StevensHouse_EventScript_RockDisplay`
- (10,4) [sign] → `MossdeepCity_StevensHouse_EventScript_RockDisplay`
- (10,6) [sign] → `MossdeepCity_StevensHouse_EventScript_RockDisplay`

## Flags référencés (7)
- `FLAG_HIDE_MOSSDEEP_CITY_SCOTT`
- `FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_BELDUM_POKEBALL`
- `FLAG_HIDE_SEAFLOOR_CAVERN_ENTRANCE_AQUA_GRUNT`
- `FLAG_OMIT_DIVE_FROM_STEVEN_LETTER`
- `FLAG_RECEIVED_BELDUM`
- `FLAG_RECEIVED_HM_DIVE`
- `FLAG_SYS_GAME_CLEAR`

## Variables référencées (5)
- `VAR_1`
- `VAR_2`
- `VAR_RESULT`
- `VAR_STEVENS_HOUSE_STATE`
- `VAR_TEMP_TRANSFERRED_SPECIES`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_NameReceivedPartyMon`
- `gText_NicknameThisPokemon`
### data/scripts/pc_transfer.inc
- `Common_EventScript_GetGiftMonPartySlot`
- `Common_EventScript_NameReceivedBoxMon`
- `Common_EventScript_NoMoreRoomForPokemon`
- `Common_EventScript_TransferredToPC`

## Scripts (21)
### MossdeepCity_StevensHouse_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, MossdeepCity_StevensHouse_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, MossdeepCity_StevensHouse_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, MossdeepCity_StevensHouse_OnFrame
```
### MossdeepCity_StevensHouse_OnLoad
```
call_if_unset FLAG_SYS_GAME_CLEAR, MossdeepCity_StevensHouse_EventScript_HideStevensNote
end
```
### MossdeepCity_StevensHouse_EventScript_HideStevensNote
```
setmetatile 6, 4, METATILE_GenericBuilding_TableEdge, TRUE
return
```
### MossdeepCity_StevensHouse_OnTransition
```
call_if_eq VAR_STEVENS_HOUSE_STATE, 2, MossdeepCity_StevensHouse_EventScript_SetStevenPos
end
```
### MossdeepCity_StevensHouse_EventScript_SetStevenPos
```
setobjectxyperm LOCALID_STEVENS_HOUSE_STEVEN, 6, 5
setobjectmovementtype LOCALID_STEVENS_HOUSE_STEVEN, MOVEMENT_TYPE_FACE_UP
return
```
### MossdeepCity_StevensHouse_OnFrame
```
map_script_2 VAR_STEVENS_HOUSE_STATE, 1, MossdeepCity_StevensHouse_EventScript_StevenGivesDive
```
### MossdeepCity_StevensHouse_EventScript_StevenGivesDive
```
lockall
applymovement LOCALID_STEVENS_HOUSE_STEVEN, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
playse SE_PIN
applymovement LOCALID_STEVENS_HOUSE_STEVEN, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_STEVENS_HOUSE_STEVEN, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_STEVENS_HOUSE_STEVEN, MossdeepCity_StevensHouse_Movement_StevenApproachPlayer
waitmovement 0
msgbox MossdeepCity_StevensHouse_Text_YouveEarnedHMDive, MSGBOX_DEFAULT
giveitem ITEM_HM_DIVE
setflag FLAG_RECEIVED_HM_DIVE
setflag FLAG_OMIT_DIVE_FROM_STEVEN_LETTER
msgbox MossdeepCity_StevensHouse_Text_ExplainDive, MSGBOX_DEFAULT
closemessage
delay 20
applymovement LOCALID_STEVENS_HOUSE_STEVEN, MossdeepCity_StevensHouse_Movement_StevenReturn
waitmovement 0
setflag FLAG_HIDE_MOSSDEEP_CITY_SCOTT
setflag FLAG_HIDE_SEAFLOOR_CAVERN_ENTRANCE_AQUA_GRUNT
setvar VAR_STEVENS_HOUSE_STATE, 2
releaseall
end
```
### MossdeepCity_StevensHouse_Movement_StevenApproachPlayer
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_down
step_end
```
### MossdeepCity_StevensHouse_Movement_StevenReturn
```
walk_up
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### MossdeepCity_StevensHouse_EventScript_BeldumPokeball
```
lockall
msgbox MossdeepCity_StevensHouse_Text_TakeBallContainingBeldum, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MossdeepCity_StevensHouse_EventScript_LeaveBeldum
goto MossdeepCity_StevensHouse_EventScript_GiveBeldum
end
```
### MossdeepCity_StevensHouse_EventScript_LeaveBeldum
```
msgbox MossdeepCity_StevensHouse_Text_LeftPokeBallWhereItWas, MSGBOX_DEFAULT
releaseall
end
```
### MossdeepCity_StevensHouse_EventScript_GiveBeldum
```
setvar VAR_TEMP_TRANSFERRED_SPECIES, SPECIES_BELDUM
givemon SPECIES_BELDUM, 5
goto_if_eq VAR_RESULT, MON_GIVEN_TO_PARTY, MossdeepCity_StevensHouse_EventScript_SendBeldumParty
goto_if_eq VAR_RESULT, MON_GIVEN_TO_PC, MossdeepCity_StevensHouse_EventScript_SendBeldumPC
goto Common_EventScript_NoMoreRoomForPokemon
end
```
### MossdeepCity_StevensHouse_EventScript_SendBeldumParty
```
call MossdeepCity_StevensHouse_EventScript_ReceivedBeldumFanfare
msgbox gText_NicknameThisPokemon, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MossdeepCity_StevensHouse_EventScript_ReceivedBeldum
call Common_EventScript_GetGiftMonPartySlot
call Common_EventScript_NameReceivedPartyMon
goto MossdeepCity_StevensHouse_EventScript_ReceivedBeldum
end
```
### MossdeepCity_StevensHouse_EventScript_SendBeldumPC
```
call MossdeepCity_StevensHouse_EventScript_ReceivedBeldumFanfare
msgbox gText_NicknameThisPokemon, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MossdeepCity_StevensHouse_EventScript_BeldumTransferredToPC
call Common_EventScript_NameReceivedBoxMon
goto MossdeepCity_StevensHouse_EventScript_BeldumTransferredToPC
end
```
### MossdeepCity_StevensHouse_EventScript_BeldumTransferredToPC
```
call Common_EventScript_TransferredToPC
goto MossdeepCity_StevensHouse_EventScript_ReceivedBeldum
end
```
### MossdeepCity_StevensHouse_EventScript_ReceivedBeldumFanfare
```
bufferspeciesname STR_VAR_2, SPECIES_BELDUM
removeobject LOCALID_STEVENS_HOUSE_BALL
playfanfare MUS_OBTAIN_ITEM
message MossdeepCity_StevensHouse_Text_ObtainedBeldum
waitmessage
waitfanfare
bufferspeciesname STR_VAR_1, SPECIES_BELDUM
return
```
### MossdeepCity_StevensHouse_EventScript_ReceivedBeldum
```
setflag FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_BELDUM_POKEBALL
setflag FLAG_RECEIVED_BELDUM
releaseall
end
```
### MossdeepCity_StevensHouse_EventScript_RockDisplay
```
msgbox MossdeepCity_StevensHouse_Text_CollectionOfRareRocks, MSGBOX_SIGN
end
```
### MossdeepCity_StevensHouse_EventScript_Steven
```
msgbox MossdeepCity_StevensHouse_Text_UnderwateCavernBetweenMossdeepSootopolis, MSGBOX_NPC
end
```
### MossdeepCity_StevensHouse_EventScript_Letter
```
lockall
msgbox MossdeepCity_StevensHouse_Text_LetterFromSteven, MSGBOX_DEFAULT
releaseall
end
```
### MossdeepCity_StevensHouse_EventScript_DiveItemBall
```
finditem ITEM_HM_DIVE
setflag FLAG_RECEIVED_HM_DIVE
end
```

## Textes (9)
### MossdeepCity_StevensHouse_Text_YouveEarnedHMDive
```
PIERRE: {PLAYER}{KUN}…\pComme tu vois, il n'y a pas grand\nchose ici, mais je m'y sens bien.\pMerci pour tout ce que tu as fait.\pPour te prouver ma gratitude, je\nvoudrais te donner cette CS!\pElle contient PLONGEE. Tu la mérites\nvraiment, tu ne peux pas refuser.$
```
### MossdeepCity_StevensHouse_Text_ExplainDive
```
PIERRE: Quand tu utiliseras SURF,\ntu verras des zones d'eau plus sombres.\pUtilise PLONGEE si tu es au-dessus des\nprofondeurs. Tu iras au fond de la mer.\pSi tu veux remonter à la surface,\nutilise PLONGEE à nouveau.\pCependant, à certains endroits, il ne\nsera pas possible de remonter.$
```
### MossdeepCity_StevensHouse_Text_UnderwateCavernBetweenMossdeepSootopolis
```
PIERRE: Apparemment, il y a une caverne\nsous l'eau entre ALGATIA et\lATALANOPOLIS.\pTu sais, celle que le CAPT. POUPE\na découverte avec son sous-marin.$
```
### MossdeepCity_StevensHouse_Text_TakeBallContainingBeldum
```
{PLAYER} examine la POKé BALL.\pElle contient le POKéMON\nTERHAL.\pPrendre la POKé BALL?$
```
### MossdeepCity_StevensHouse_Text_ObtainedBeldum
```
{PLAYER} reçoit un TERHAL.$
```
### MossdeepCity_StevensHouse_Text_NoSpaceForAnotherMon
```
There is no space for another POKéMON.$
```
### MossdeepCity_StevensHouse_Text_LeftPokeBallWhereItWas
```
{PLAYER} laisse la POKé BALL à sa place.$
```
### MossdeepCity_StevensHouse_Text_LetterFromSteven
```
C'est une lettre.\p… … … … … …\pPour {PLAYER}{KUN}…\pJ'ai décidé de faire un petit examen de\nconscience et de m'entraîner en route.\pJe ne prévois pas de rentrer chez moi\ntout de suite.\pJ'ai un service à te demander.\pJe veux que tu prennes la POKé BALL\nqui est sur le bureau.\pA l'intérieur, il y a un TERHAL, mon\nPOKéMON préféré.\pJe compte sur toi.\pNos chemins se croiseront peut-être\nà nouveau.\pPIERRE ROCHARD$
```
### MossdeepCity_StevensHouse_Text_CollectionOfRareRocks
```
C'est une collection de roches et de\npierres rares réunies par PIERRE.$
```
