# RustboroCity_DevonCorp_2F

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_DEVON_CORP_2F`
- **layout** : `LAYOUT_RUSTBORO_CITY_DEVON_CORP_2F`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 6,5 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_DevonCorp_2F_EventScript_TalkToPokemonScientist` | `0` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 1,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_DevonCorp_2F_EventScript_BallScientist` | `0` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 2,6 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `RustboroCity_DevonCorp_2F_EventScript_PokenavScientist` | `0` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 10,5 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_DevonCorp_2F_EventScript_PokemonDreamsScientist` | `0` |
| `LOCALID_FOSSIL_SCIENTIST` | `OBJ_EVENT_GFX_SCIENTIST_1` | 14,8 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_DevonCorp_2F_EventScript_FossilScientist` | `0` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 14,5 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_DevonCorp_2F_EventScript_MatchCallScientist` | `0` |

## Warps (2)
- #0 (14,1) → `MAP_RUSTBORO_CITY_DEVON_CORP_1F` warp #2
- #1 (2,1) → `MAP_RUSTBORO_CITY_DEVON_CORP_3F` warp #0

## Flags référencés (3)
- `FLAG_MET_DEVON_EMPLOYEE`
- `FLAG_RECEIVED_POKENAV`
- `FLAG_RECEIVED_REVIVED_FOSSIL_MON`

## Variables référencées (7)
- `VAR_1`
- `VAR_2`
- `VAR_FOSSIL_RESURRECTION_STATE`
- `VAR_RESULT`
- `VAR_RUSTBORO_CITY_STATE`
- `VAR_TEMP_TRANSFERRED_SPECIES`
- `VAR_WHICH_FOSSIL_REVIVED`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_NameReceivedPartyMon`
- `gText_NicknameThisPokemon`
### data/scripts/pc_transfer.inc
- `Common_EventScript_GetGiftMonPartySlot`
- `Common_EventScript_NameReceivedBoxMon`
- `Common_EventScript_NoMoreRoomForPokemon`
- `Common_EventScript_TransferredToPC`

## Scripts (37)
### RustboroCity_DevonCorp_2F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, RustboroCity_DevonCorp_2F_OnTransition
```
### RustboroCity_DevonCorp_2F_OnTransition
```
call_if_eq VAR_FOSSIL_RESURRECTION_STATE, 1, RustboroCity_DevonCorp_2F_EventScript_SetFossilReady
end
```
### RustboroCity_DevonCorp_2F_EventScript_SetFossilReady
```
setvar VAR_FOSSIL_RESURRECTION_STATE, 2
return
```
### RustboroCity_DevonCorp_2F_EventScript_TalkToPokemonScientist
```
lock
faceplayer
call_if_eq VAR_FOSSIL_RESURRECTION_STATE, 1, RustboroCity_DevonCorp_2F_EventScript_SetFossilReady
msgbox RustboroCity_DevonCorp_2F_Text_DeviceForTalkingToPokemon, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_BallScientist
```
lock
faceplayer
call_if_eq VAR_FOSSIL_RESURRECTION_STATE, 1, RustboroCity_DevonCorp_2F_EventScript_SetFossilReady
goto_if_set FLAG_MET_DEVON_EMPLOYEE, RustboroCity_DevonCorp_2F_EventScript_DevelopedBalls
msgbox RustboroCity_DevonCorp_2F_Text_DevelopingNewBalls, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_DevelopedBalls
```
msgbox RustboroCity_DevonCorp_2F_Text_WeFinallyMadeNewBalls, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_PokenavScientist
```
lock
faceplayer
call_if_eq VAR_FOSSIL_RESURRECTION_STATE, 1, RustboroCity_DevonCorp_2F_EventScript_SetFossilReady
goto_if_set FLAG_RECEIVED_POKENAV, RustboroCity_DevonCorp_2F_EventScript_HasPokenav
msgbox RustboroCity_DevonCorp_2F_Text_IMadePokenav, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_HasPokenav
```
msgbox RustboroCity_DevonCorp_2F_Text_WowThatsAPokenav, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_PokemonDreamsScientist
```
lock
faceplayer
call_if_eq VAR_FOSSIL_RESURRECTION_STATE, 1, RustboroCity_DevonCorp_2F_EventScript_SetFossilReady
msgbox RustboroCity_DevonCorp_2F_Text_DeviceToVisualizePokemonDreams, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_FossilScientist
```
lock
faceplayer
goto_if_eq VAR_FOSSIL_RESURRECTION_STATE, 2, RustboroCity_DevonCorp_2F_EventScript_FossilMonReady
goto_if_eq VAR_FOSSIL_RESURRECTION_STATE, 1, RustboroCity_DevonCorp_2F_EventScript_StillRegenerating
msgbox RustboroCity_DevonCorp_2F_Text_DevelopDeviceToResurrectFossils, MSGBOX_DEFAULT
checkitem ITEM_ROOT_FOSSIL
goto_if_eq VAR_RESULT, TRUE, RustboroCity_DevonCorp_2F_EventScript_NoticeRootFossil
checkitem ITEM_CLAW_FOSSIL
goto_if_eq VAR_RESULT, TRUE, RustboroCity_DevonCorp_2F_EventScript_NoticeClawFossil
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_NoticeRootFossil
```
closemessage
playse SE_PIN
applymovement LOCALID_FOSSIL_SCIENTIST, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_FOSSIL_SCIENTIST, Common_Movement_Delay48
waitmovement 0
msgbox RustboroCity_DevonCorp_2F_Text_WantToBringFossilBackToLife, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, RustboroCity_DevonCorp_2F_EventScript_DeclineGiveFossil
checkitem ITEM_CLAW_FOSSIL
goto_if_eq VAR_RESULT, TRUE, RustboroCity_DevonCorp_2F_EventScript_ChooseFossil
goto RustboroCity_DevonCorp_2F_EventScript_GiveRootFossil
end
```
### RustboroCity_DevonCorp_2F_EventScript_GiveRootFossil
```
bufferitemname STR_VAR_1, ITEM_ROOT_FOSSIL
msgbox RustboroCity_DevonCorp_2F_Text_HandedFossilToResearcher, MSGBOX_DEFAULT
removeitem ITEM_ROOT_FOSSIL
setvar VAR_FOSSIL_RESURRECTION_STATE, 1
setvar VAR_WHICH_FOSSIL_REVIVED, 1
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_NoticeClawFossil
```
closemessage
playse SE_PIN
applymovement LOCALID_FOSSIL_SCIENTIST, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_FOSSIL_SCIENTIST, Common_Movement_Delay48
waitmovement 0
msgbox RustboroCity_DevonCorp_2F_Text_WantToBringFossilBackToLife, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, RustboroCity_DevonCorp_2F_EventScript_DeclineGiveFossil
checkitem ITEM_ROOT_FOSSIL
goto_if_eq VAR_RESULT, TRUE, RustboroCity_DevonCorp_2F_EventScript_ChooseFossil
goto RustboroCity_DevonCorp_2F_EventScript_GiveClawFossil
end
```
### RustboroCity_DevonCorp_2F_EventScript_GiveClawFossil
```
bufferitemname STR_VAR_1, ITEM_CLAW_FOSSIL
msgbox RustboroCity_DevonCorp_2F_Text_HandedFossilToResearcher, MSGBOX_DEFAULT
removeitem ITEM_CLAW_FOSSIL
setvar VAR_FOSSIL_RESURRECTION_STATE, 1
setvar VAR_WHICH_FOSSIL_REVIVED, 2
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_DeclineGiveFossil
```
msgbox RustboroCity_DevonCorp_2F_Text_OhIsThatSo, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_StillRegenerating
```
msgbox RustboroCity_DevonCorp_2F_Text_FossilRegeneratorTakesTime, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_FossilMonReady
```
goto_if_eq VAR_WHICH_FOSSIL_REVIVED, 1, RustboroCity_DevonCorp_2F_EventScript_LileepReady
goto_if_eq VAR_WHICH_FOSSIL_REVIVED, 2, RustboroCity_DevonCorp_2F_EventScript_AnorithReady
end
```
### RustboroCity_DevonCorp_2F_EventScript_LileepReady
```
bufferspeciesname STR_VAR_2, SPECIES_LILEEP
msgbox RustboroCity_DevonCorp_2F_Text_FossilizedMonBroughtBackToLife, MSGBOX_DEFAULT
goto RustboroCity_DevonCorp_2F_EventScript_ReceiveLileep
end
```
### RustboroCity_DevonCorp_2F_EventScript_AnorithReady
```
bufferspeciesname STR_VAR_2, SPECIES_ANORITH
msgbox RustboroCity_DevonCorp_2F_Text_FossilizedMonBroughtBackToLife, MSGBOX_DEFAULT
goto RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorith
end
```
### RustboroCity_DevonCorp_2F_EventScript_ReceiveLileep
```
setvar VAR_TEMP_TRANSFERRED_SPECIES, SPECIES_LILEEP
givemon SPECIES_LILEEP, 20
goto_if_eq VAR_RESULT, MON_GIVEN_TO_PARTY, RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepParty
goto_if_eq VAR_RESULT, MON_GIVEN_TO_PC, RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepPC
goto Common_EventScript_NoMoreRoomForPokemon
end
```
### RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepParty
```
call RustboroCity_DevonCorp_2F_EventScript_ReceivedLileepFanfare
msgbox gText_NicknameThisPokemon, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, RustboroCity_DevonCorp_2F_EventScript_FinishReceivingLileep
call Common_EventScript_GetGiftMonPartySlot
call Common_EventScript_NameReceivedPartyMon
goto RustboroCity_DevonCorp_2F_EventScript_FinishReceivingLileep
end
```
### RustboroCity_DevonCorp_2F_EventScript_ReceiveLileepPC
```
call RustboroCity_DevonCorp_2F_EventScript_ReceivedLileepFanfare
msgbox gText_NicknameThisPokemon, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, RustboroCity_DevonCorp_2F_EventScript_TransferLileepToPC
call Common_EventScript_NameReceivedBoxMon
goto RustboroCity_DevonCorp_2F_EventScript_TransferLileepToPC
end
```
### RustboroCity_DevonCorp_2F_EventScript_TransferLileepToPC
```
call Common_EventScript_TransferredToPC
goto RustboroCity_DevonCorp_2F_EventScript_FinishReceivingLileep
end
```
### RustboroCity_DevonCorp_2F_EventScript_ReceivedLileepFanfare
```
bufferspeciesname STR_VAR_2, SPECIES_LILEEP
playfanfare MUS_OBTAIN_ITEM
message RustboroCity_DevonCorp_2F_Text_ReceivedMonFromResearcher
waitmessage
waitfanfare
bufferspeciesname STR_VAR_1, SPECIES_LILEEP
return
```
### RustboroCity_DevonCorp_2F_EventScript_FinishReceivingLileep
```
setvar VAR_FOSSIL_RESURRECTION_STATE, 0
setflag FLAG_RECEIVED_REVIVED_FOSSIL_MON
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorith
```
setvar VAR_TEMP_TRANSFERRED_SPECIES, SPECIES_ANORITH
givemon SPECIES_ANORITH, 20
goto_if_eq VAR_RESULT, MON_GIVEN_TO_PARTY, RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithParty
goto_if_eq VAR_RESULT, MON_GIVEN_TO_PC, RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithPC
goto Common_EventScript_NoMoreRoomForPokemon
end
```
### RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithParty
```
call RustboroCity_DevonCorp_2F_EventScript_ReceivedAnorithFanfare
msgbox gText_NicknameThisPokemon, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, RustboroCity_DevonCorp_2F_EventScript_FinishReceivingAnorith
call Common_EventScript_GetGiftMonPartySlot
call Common_EventScript_NameReceivedPartyMon
goto RustboroCity_DevonCorp_2F_EventScript_FinishReceivingAnorith
end
```
### RustboroCity_DevonCorp_2F_EventScript_ReceiveAnorithPC
```
call RustboroCity_DevonCorp_2F_EventScript_ReceivedAnorithFanfare
msgbox gText_NicknameThisPokemon, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, RustboroCity_DevonCorp_2F_EventScript_TransferAnorithToPC
call Common_EventScript_NameReceivedBoxMon
goto RustboroCity_DevonCorp_2F_EventScript_TransferAnorithToPC
end
```
### RustboroCity_DevonCorp_2F_EventScript_TransferAnorithToPC
```
call Common_EventScript_TransferredToPC
goto RustboroCity_DevonCorp_2F_EventScript_FinishReceivingAnorith
end
```
### RustboroCity_DevonCorp_2F_EventScript_ReceivedAnorithFanfare
```
bufferspeciesname STR_VAR_2, SPECIES_ANORITH
playfanfare MUS_OBTAIN_ITEM
message RustboroCity_DevonCorp_2F_Text_ReceivedMonFromResearcher
waitmessage
waitfanfare
bufferspeciesname STR_VAR_1, SPECIES_ANORITH
return
```
### RustboroCity_DevonCorp_2F_EventScript_FinishReceivingAnorith
```
setvar VAR_FOSSIL_RESURRECTION_STATE, 0
setflag FLAG_RECEIVED_REVIVED_FOSSIL_MON
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_ChooseFossil
```
message RustboroCity_DevonCorp_2F_Text_TwoFossilsPickOne
waitmessage
multichoice 17, 6, MULTI_FOSSIL, FALSE
switch VAR_RESULT
case 0, RustboroCity_DevonCorp_2F_EventScript_ChooseClawFossil
case 1, RustboroCity_DevonCorp_2F_EventScript_ChooseRootFossil
case 2, RustboroCity_DevonCorp_2F_EventScript_CancelFossilSelect
case MULTI_B_PRESSED, RustboroCity_DevonCorp_2F_EventScript_CancelFossilSelect
end
```
### RustboroCity_DevonCorp_2F_EventScript_ChooseClawFossil
```
goto RustboroCity_DevonCorp_2F_EventScript_GiveClawFossil
end
```
### RustboroCity_DevonCorp_2F_EventScript_ChooseRootFossil
```
goto RustboroCity_DevonCorp_2F_EventScript_GiveRootFossil
end
```
### RustboroCity_DevonCorp_2F_EventScript_CancelFossilSelect
```
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_MatchCallScientist
```
lock
faceplayer
call_if_eq VAR_FOSSIL_RESURRECTION_STATE, 1, RustboroCity_DevonCorp_2F_EventScript_SetFossilReady
goto_if_ge VAR_RUSTBORO_CITY_STATE, 6, RustboroCity_DevonCorp_2F_EventScript_WorkOnNext
msgbox RustboroCity_DevonCorp_2F_Text_DevelopNewPokenavFeature, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_2F_EventScript_WorkOnNext
```
msgbox RustboroCity_DevonCorp_2F_Text_WhatToWorkOnNext, MSGBOX_DEFAULT
release
end
```

## Textes (17)
### RustboroCity_DevonCorp_2F_Text_DeviceForTalkingToPokemon
```
Nous développons un appareil\npermettant de communiquer avec\lles POKéMON.\pMais ce n'est pas encore au point…$
```
### RustboroCity_DevonCorp_2F_Text_DevelopingNewBalls
```
Je mets au point de nouvelles sortes de\nPOKé BALLS…\pMais je n'ai pas trop progressé…$
```
### RustboroCity_DevonCorp_2F_Text_WeFinallyMadeNewBalls
```
Nous avons élaboré de nouvelles\nPOKé BALLS!\pLa BIS BALL permet d'attraper plus\nfacilement un type de POKéMON que\ltu as déjà capturé.\pLa CHRONO BALL est plus efficace\nsi le combat dure longtemps.\pToutes deux sont fièrement produites\npar DEVON.\pIl faut les essayer!$
```
### RustboroCity_DevonCorp_2F_Text_IMadePokenav
```
J'ai inventé le POKéNAV!\pEn tant qu'ingénieur, je suis enchanté\nd'avoir créé un appareil si génial!$
```
### RustboroCity_DevonCorp_2F_Text_WowThatsAPokenav
```
Oh, waouh!\nC'est un POKéNAV!\pIl a été conçu pour répondre au souhait\nde notre DIRECTEUR. Il voulait mieux\lconnaître les POKéMON.\pVeux-tu que je te décrive précisément\nses caractéristiques?\pEt puis non. Tu t'en rendras vite compte\nrien qu'en l'essayant, de toute façon.$
```
### RustboroCity_DevonCorp_2F_Text_DeviceToVisualizePokemonDreams
```
J'essaie de mettre au point un appareil\npermettant de reproduire visuellement\lles rêves des POKéMON…\pMais ça ne marche pas bien.$
```
### RustboroCity_DevonCorp_2F_Text_DevelopDeviceToResurrectFossils
```
J'ai créé un appareil pour faire revivre\ndes POKéMON à partir de fossiles…\pEt ça marche!$
```
### RustboroCity_DevonCorp_2F_Text_WantToBringFossilBackToLife
```
Attends! Ce que tu as là…\nC'est un fossile de POKéMON?\pVeux-tu ramener ce POKéMON\nà la vie?\pJe peux le faire avec mon tout nouveau\nREGENERATEUR DE FOSSILE.$
```
### RustboroCity_DevonCorp_2F_Text_OhIsThatSo
```
Non, tu ne veux pas?\pMais le savoir-faire technologique de\nDEVON est remarquable, je t'assure.$
```
### RustboroCity_DevonCorp_2F_Text_TwoFossilsPickOne
```
Oh, ça c'est une surprise!\nTu n'as pas un, mais deux fossiles!\pMalheureusement, ma machine ne peut\nrégénérer qu'un POKéMON à la fois.\pVeux-tu choisir un de tes fossiles\npour la régénération?$
```
### RustboroCity_DevonCorp_2F_Text_HandedFossilToResearcher
```
Parfait!\nFaisons-le tout de suite!\p{PLAYER} donne {STR_VAR_1} au\nCHERCHEUR DE DEVON.$
```
### RustboroCity_DevonCorp_2F_Text_FossilRegeneratorTakesTime
```
Le REGENERATEUR DE FOSSILE que\nj'ai créé est incroyable!\pMais il a un inconvénient: il est\nlent dans son fonctionnement.\pAlors, euh… et si tu te baladais un peu\nen attendant?$
```
### RustboroCity_DevonCorp_2F_Text_FossilizedMonBroughtBackToLife
```
Merci d'avoir patienté!\pTon POKéMON fossilisé a repris vie!\pLe fossile était un ancien POKéMON.\nC'était un {STR_VAR_2}!$
```
### RustboroCity_DevonCorp_2F_Text_ReceivedMonFromResearcher
```
{PLAYER} reçoit {STR_VAR_2} de la part\ndu CHERCHEUR DE DEVON.$
```
### RustboroCity_DevonCorp_2F_Text_TooManyPokemon
```
Uh-oh, you've got too many POKéMON.\nYou have no room for this one.$
```
### RustboroCity_DevonCorp_2F_Text_DevelopNewPokenavFeature
```
J'essaie de développer une nouvelle\nfonction pour le POKéNAV…\pMais ce n'est pas très concluant…$
```
### RustboroCity_DevonCorp_2F_Text_WhatToWorkOnNext
```
Bon, sur quoi est-ce que je vais bien\npouvoir travailler maintenant?\pCette compagnie nous permet de\ntravailler sur ce que l'on souhaite.\pUn ingénieur ne pourrait pas rêver\nde meilleur environnement.$
```
