# FallarborTown_CozmosHouse

## Métadonnées
- **id** : `MAP_FALLARBOR_TOWN_COZMOS_HOUSE`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_FALLARBOR`
- **region_map_section** : `MAPSEC_FALLARBOR_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 6,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `FallarborTown_CozmosHouse_EventScript_ProfCozmo` | `FLAG_HIDE_FALLARBOR_HOUSE_PROF_COZMO` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 5,6 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `FallarborTown_CozmosHouse_EventScript_CozmosWife` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_FALLARBOR_TOWN` warp #3
- #1 (4,8) → `MAP_FALLARBOR_TOWN` warp #3

## Flags référencés (3)
- `FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY`
- `FLAG_RECEIVED_TM_RETURN`
- `FLAG_TEMP_2`

## Variables référencées (2)
- `VAR_0x8004`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_PlayerHandedOverTheItem`

## Scripts (9)
### FallarborTown_CozmosHouse_EventScript_ProfCozmo
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_RETURN, FallarborTown_CozmosHouse_EventScript_GaveMeteorite
checkitem ITEM_METEORITE
goto_if_eq VAR_RESULT, TRUE, FallarborTown_CozmosHouse_EventScript_PlayerHasMeteorite
msgbox FallarborTown_CozmosHouse_Text_MeteoriteWillNeverBeMineNow, MSGBOX_DEFAULT
release
end
```
### FallarborTown_CozmosHouse_EventScript_PlayerHasMeteorite
```
call_if_unset FLAG_TEMP_2, FallarborTown_CozmosHouse_EventScript_NoticeMeteorite
call_if_set FLAG_TEMP_2, FallarborTown_CozmosHouse_EventScript_AskForMeteorite
goto_if_eq VAR_RESULT, NO, FallarborTown_CozmosHouse_EventScript_DeclineGiveMeteorite
msgbox FallarborTown_CozmosHouse_Text_PleaseUseThisTM, MSGBOX_DEFAULT
giveitem ITEM_TM_RETURN
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setvar VAR_0x8004, ITEM_METEORITE
call Common_EventScript_PlayerHandedOverTheItem
setflag FLAG_RECEIVED_TM_RETURN
msgbox FallarborTown_CozmosHouse_Text_ReallyGoingToHelpMyResearch, MSGBOX_DEFAULT
release
end
```
### FallarborTown_CozmosHouse_EventScript_NoticeMeteorite
```
msgbox FallarborTown_CozmosHouse_Text_MeteoriteWillNeverBeMineNow, MSGBOX_DEFAULT
msgbox FallarborTown_CozmosHouse_Text_IsThatMeteoriteMayIHaveIt, MSGBOX_YESNO
return
```
### FallarborTown_CozmosHouse_EventScript_AskForMeteorite
```
msgbox FallarborTown_CozmosHouse_Text_MayIHaveMeteorite, MSGBOX_YESNO
return
```
### FallarborTown_CozmosHouse_EventScript_DeclineGiveMeteorite
```
setflag FLAG_TEMP_2
msgbox FallarborTown_CozmosHouse_Text_CrushedWithDisappointment, MSGBOX_DEFAULT
release
end
```
### FallarborTown_CozmosHouse_EventScript_GaveMeteorite
```
msgbox FallarborTown_CozmosHouse_Text_ReallyGoingToHelpMyResearch, MSGBOX_DEFAULT
release
end
```
### FallarborTown_CozmosHouse_EventScript_CozmosWife
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_RETURN, FallarborTown_CozmosHouse_EventScript_CozmoIsHappy
goto_if_set FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY, FallarborTown_CozmosHouse_EventScript_CozmoIsSad
msgbox FallarborTown_CozmosHouse_Text_CozmoWentToMeteorFalls, MSGBOX_DEFAULT
release
end
```
### FallarborTown_CozmosHouse_EventScript_CozmoIsSad
```
msgbox FallarborTown_CozmosHouse_Text_FeelSorryForCozmo, MSGBOX_DEFAULT
release
end
```
### FallarborTown_CozmosHouse_EventScript_CozmoIsHappy
```
msgbox FallarborTown_CozmosHouse_Text_CozmoIsSoHappy, MSGBOX_DEFAULT
release
end
```

## Textes (9)
### FallarborTown_CozmosHouse_Text_MeteoriteWillNeverBeMineNow
```
PROF. KOSMO: Oh…\nJe n'aurais jamais dû me laisser rouler\ldans la farine et avouer à la TEAM MAGMA\loù on peut trouver des METEORITES…\pCe METEORITE du SITE METEORE…\nIl ne sera jamais à moi, maintenant…$
```
### FallarborTown_CozmosHouse_Text_IsThatMeteoriteMayIHaveIt
```
Oh!\nHein?\pMais, cet objet…\pC'est impossible!?!\pEst-ce le METEORITE que la TEAM\nMAGMA a pris au SITE METEORE?\pS'il te plaît, tu peux me le donner?\pJe suis prêt à te l'échanger contre un\nobjet de valeur. Que dirais-tu d'une CT?$
```
### FallarborTown_CozmosHouse_Text_PleaseUseThisTM
```
PROF. KOSMO: Cette CT est le symbole\nde ma gratitude à ton égard.\pN'hésite pas à l'utiliser!$
```
### FallarborTown_CozmosHouse_Text_ReallyGoingToHelpMyResearch
```
PROF. KOSMO: Oh, je n'arrive pas à\ny croire. C'est vraiment super génial!\pÇa va faire avancer mes recherches!$
```
### FallarborTown_CozmosHouse_Text_CrushedWithDisappointment
```
PROF. KOSMO: Oh, mais…\nJe suis extrêmement déçu…$
```
### FallarborTown_CozmosHouse_Text_MayIHaveMeteorite
```
PROF. KOSMO: S'il te plaît, tu peux\nme donner ce METEORITE?\pJe suis prêt à te l'échanger contre un\nobjet de valeur. Que dirais-tu d'une CT?$
```
### FallarborTown_CozmosHouse_Text_CozmoWentToMeteorFalls
```
Le PROF. KOSMO est parti au SITE\nMETEORE, sur la ROUTE 114, avec\ldes types de la TEAM MAGMA.$
```
### FallarborTown_CozmosHouse_Text_FeelSorryForCozmo
```
Pauvre PROF. KOSMO… Il est si déprimé…\nÇa me fend le cœur.$
```
### FallarborTown_CozmosHouse_Text_CozmoIsSoHappy
```
Regarde le PROF. KOSMO…\nIl est tellement content! C'est génial!$
```
