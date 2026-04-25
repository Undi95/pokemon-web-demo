# PacifidlogTown_House2

## Métadonnées
- **id** : `MAP_PACIFIDLOG_TOWN_HOUSE2`
- **layout** : `LAYOUT_PACIFIDLOG_TOWN_HOUSE2`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_PACIFIDLOG_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 3,5 | `MOVEMENT_TYPE_FACE_DOWN` | `PacifidlogTown_House2_EventScript_FanClubYoungerBrother` | `0` |
| `` | `OBJ_EVENT_GFX_AZURILL` | 8,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `PacifidlogTown_House2_EventScript_HappyAzurill` | `0` |
| `` | `OBJ_EVENT_GFX_AZURILL` | 1,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `PacifidlogTown_House2_EventScript_UnhappyAzurill` | `0` |

## Warps (2)
- #0 (4,8) → `MAP_PACIFIDLOG_TOWN` warp #2
- #1 (5,8) → `MAP_PACIFIDLOG_TOWN` warp #2

## Flags référencés (2)
- `FLAG_MET_FANCLUB_YOUNGER_BROTHER`
- `FLAG_RECEIVED_FANCLUB_TM_THIS_WEEK`

## Variables référencées (2)
- `VAR_1`
- `VAR_RESULT`

## Scripts (11)
### PacifidlogTown_House2_EventScript_FanClubYoungerBrother
```
lock
faceplayer
dotimebasedevents
call PacifidlogTown_House2_EventScript_UpdateFanClubTMFlag
goto_if_set FLAG_RECEIVED_FANCLUB_TM_THIS_WEEK, PacifidlogTown_House2_EventScript_ComeBackInXDays
call_if_set FLAG_MET_FANCLUB_YOUNGER_BROTHER, PacifidlogTown_House2_EventScript_MonAssessment
call_if_unset FLAG_MET_FANCLUB_YOUNGER_BROTHER, PacifidlogTown_House2_EventScript_FirstMonAssessment
setflag FLAG_MET_FANCLUB_YOUNGER_BROTHER
specialvar VAR_RESULT, GetLeadMonFriendshipScore
goto_if_ge VAR_RESULT, FRIENDSHIP_150_TO_199, PacifidlogTown_House2_EventScript_GiveReturn
specialvar VAR_RESULT, GetLeadMonFriendshipScore
goto_if_ge VAR_RESULT, FRIENDSHIP_50_TO_99, PacifidlogTown_House2_EventScript_PutInEffort
goto PacifidlogTown_House2_EventScript_GiveFrustration
end
```
### PacifidlogTown_House2_EventScript_UpdateFanClubTMFlag
```
goto_if_unset FLAG_RECEIVED_FANCLUB_TM_THIS_WEEK, Common_EventScript_NopReturn
specialvar VAR_RESULT, GetDaysUntilPacifidlogTMAvailable
call_if_eq VAR_RESULT, 0, PacifidlogTown_House2_EventScript_ClearReceivedFanClubTM
return
```
### PacifidlogTown_House2_EventScript_MonAssessment
```
msgbox PacifidlogTown_House2_Text_AhYourPokemon, MSGBOX_DEFAULT
return
```
### PacifidlogTown_House2_EventScript_FirstMonAssessment
```
msgbox PacifidlogTown_House2_Text_ChairmansYoungerBrotherOnVacation, MSGBOX_DEFAULT
msgbox PacifidlogTown_House2_Text_AhYourPokemon, MSGBOX_DEFAULT
return
```
### PacifidlogTown_House2_EventScript_ClearReceivedFanClubTM
```
clearflag FLAG_RECEIVED_FANCLUB_TM_THIS_WEEK
return
```
### PacifidlogTown_House2_EventScript_GiveReturn
```
msgbox PacifidlogTown_House2_Text_AdoringPokemonTakeThis, MSGBOX_DEFAULT
giveitem ITEM_TM_RETURN
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_FANCLUB_TM_THIS_WEEK
special SetPacifidlogTMReceivedDay
msgbox PacifidlogTown_House2_Text_ExplainReturnFrustration, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House2_EventScript_PutInEffort
```
msgbox PacifidlogTown_House2_Text_PutInSomeMoreEffort, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House2_EventScript_GiveFrustration
```
msgbox PacifidlogTown_House2_Text_ViciousPokemonTakeThis, MSGBOX_DEFAULT
giveitem ITEM_TM_FRUSTRATION
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_FANCLUB_TM_THIS_WEEK
special SetPacifidlogTMReceivedDay
msgbox PacifidlogTown_House2_Text_ExplainReturnFrustration, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House2_EventScript_ComeBackInXDays
```
specialvar VAR_RESULT, GetDaysUntilPacifidlogTMAvailable
buffernumberstring STR_VAR_1, VAR_RESULT
msgbox PacifidlogTown_House2_Text_GetGoodTMInXDays, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House2_EventScript_HappyAzurill
```
lock
faceplayer
waitse
playmoncry SPECIES_AZURILL, CRY_MODE_NORMAL
msgbox PacifidlogTown_House2_Text_Rurii, MSGBOX_DEFAULT
waitmoncry
msgbox PacifidlogTown_House2_Text_VeryFriendlyWithTrainer, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House2_EventScript_UnhappyAzurill
```
lock
faceplayer
waitse
playmoncry SPECIES_AZURILL, CRY_MODE_ENCOUNTER
msgbox PacifidlogTown_House2_Text_Rururi, MSGBOX_DEFAULT
waitmoncry
msgbox PacifidlogTown_House2_Text_DoesntLikeTrainerVeryMuch, MSGBOX_DEFAULT
release
end
```

## Textes (11)
### PacifidlogTown_House2_Text_ChairmansYoungerBrotherOnVacation
```
Hum-hum!\pJe suis la personne la plus influente\ndu FAN CLUB POKéMON. Je suis\lle petit frère du PRESIDENT.\pJe suis ici en vacances, avec mes\nPOKéMON, bien entendu.$
```
### PacifidlogTown_House2_Text_AhYourPokemon
```
Ah!\nTon POKéMON…$
```
### PacifidlogTown_House2_Text_AdoringPokemonTakeThis
```
Il t'aime énormément, pas de doute.\pUn POKéMON aussi adorable et adoré\nmérite bien une CT comme ça, non?$
```
### PacifidlogTown_House2_Text_PutInSomeMoreEffort
```
Hmm… Ce n'est pas mal, mais ce n'est\npas génial non plus.\pToi, en tant que DRESSEUR, tu dois faire\nplus d'efforts.$
```
### PacifidlogTown_House2_Text_ViciousPokemonTakeThis
```
Il a un regard mauvais.\pUn POKéMON aussi effrayant mérite\nune CT comme ça.$
```
### PacifidlogTown_House2_Text_ExplainReturnFrustration
```
Lorsqu'un POKéMON t'aime beaucoup,\nla puissance de RETOUR est augmentée.\pS'il ne t'aime pas, la puissance de\nFRUSTRATION est augmentée.$
```
### PacifidlogTown_House2_Text_GetGoodTMInXDays
```
Je devrais bientôt recevoir une ou deux\nbonnes CT. Tu veux savoir dans combien\lde jours? {STR_VAR_1}, je pense…\pReviens me voir à ce moment-là.\nJe te donnerai une CT qui correspond\là ton POKéMON.$
```
### PacifidlogTown_House2_Text_Rurii
```
AZURILL: Uriii.$
```
### PacifidlogTown_House2_Text_VeryFriendlyWithTrainer
```
Il a l'air d'être très ami avec le\nDRESSEUR.$
```
### PacifidlogTown_House2_Text_Rururi
```
AZURILL: Uuuurill!$
```
### PacifidlogTown_House2_Text_DoesntLikeTrainerVeryMuch
```
Il n'a pas l'air d'aimer beaucoup le\nDRESSEUR.$
```
