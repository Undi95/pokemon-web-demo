# AbandonedShip_Rooms2_1F

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_ROOMS2_1F`
- **layout** : `LAYOUT_ABANDONED_SHIP_ROOMS2_1F`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_ABANDONED_SHIP`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_4` | 7,13 | `MOVEMENT_TYPE_FACE_DOWN` | `AbandonedShip_Rooms2_1F_EventScript_Dan` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 6,13 | `MOVEMENT_TYPE_FACE_DOWN` | `AbandonedShip_Rooms2_1F_EventScript_Kira` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 4,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_Rooms2_1F_EventScript_ItemRevive` | `FLAG_ITEM_ABANDONED_SHIP_ROOMS_2_1F_REVIVE` |
| `` | `OBJ_EVENT_GFX_HIKER` | 3,2 | `MOVEMENT_TYPE_FACE_RIGHT` | `AbandonedShip_Rooms2_1F_EventScript_Garrison` | `0` |
| `` | `OBJ_EVENT_GFX_TUBER_F` | 7,2 | `MOVEMENT_TYPE_FACE_LEFT` | `AbandonedShip_Rooms2_1F_EventScript_Jani` | `0` |

## Warps (3)
- #0 (4,16) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #8
- #1 (5,16) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #8
- #2 (4,1) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #11

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (8)
### AbandonedShip_Rooms2_1F_EventScript_Dan
```
trainerbattle_double TRAINER_KIRA_AND_DAN_1, AbandonedShip_Rooms2_1F_Text_DanIntro, AbandonedShip_Rooms2_1F_Text_DanDefeat, AbandonedShip_Rooms2_1F_Text_DanNotEnoughMons, AbandonedShip_Rooms2_1F_EventScript_RegisterDan
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, AbandonedShip_Rooms2_1F_EventScript_DanRematch
msgbox AbandonedShip_Rooms2_1F_Text_DanPostBattle, MSGBOX_DEFAULT
release
end
```
### AbandonedShip_Rooms2_1F_EventScript_RegisterDan
```
msgbox AbandonedShip_Rooms2_1F_Text_KiraRegister, MSGBOX_DEFAULT  @ Kira speaks for both when registering KiraAndDan
register_matchcall TRAINER_KIRA_AND_DAN_1
release
end
```
### AbandonedShip_Rooms2_1F_EventScript_DanRematch
```
trainerbattle_rematch_double TRAINER_KIRA_AND_DAN_1, AbandonedShip_Rooms2_1F_Text_DanRematchIntro, AbandonedShip_Rooms2_1F_Text_DanRematchDefeat, AbandonedShip_Rooms2_1F_Text_DanRematchNotEnoughMons
msgbox AbandonedShip_Rooms2_1F_Text_DanPostRematch, MSGBOX_AUTOCLOSE
end
```
### AbandonedShip_Rooms2_1F_EventScript_Kira
```
trainerbattle_double TRAINER_KIRA_AND_DAN_1, AbandonedShip_Rooms2_1F_Text_KiraIntro, AbandonedShip_Rooms2_1F_Text_KiraDefeat, AbandonedShip_Rooms2_1F_Text_KiraNotEnoughMons, AbandonedShip_Rooms2_1F_EventScript_RegisterKira
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, AbandonedShip_Rooms2_1F_EventScript_KiraRematch
msgbox AbandonedShip_Rooms2_1F_Text_KiraPostBattle, MSGBOX_DEFAULT
release
end
```
### AbandonedShip_Rooms2_1F_EventScript_RegisterKira
```
msgbox AbandonedShip_Rooms2_1F_Text_KiraRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_KIRA_AND_DAN_1
release
end
```
### AbandonedShip_Rooms2_1F_EventScript_KiraRematch
```
trainerbattle_rematch_double TRAINER_KIRA_AND_DAN_1, AbandonedShip_Rooms2_1F_Text_KiraRematchIntro, AbandonedShip_Rooms2_1F_Text_KiraRematchDefeat, AbandonedShip_Rooms2_1F_Text_KiraRematchNotEnoughMons
msgbox AbandonedShip_Rooms2_1F_Text_KiraPostRematch, MSGBOX_AUTOCLOSE
end
```
### AbandonedShip_Rooms2_1F_EventScript_Jani
```
trainerbattle_single TRAINER_JANI, AbandonedShip_Rooms2_1F_Text_JaniIntro, AbandonedShip_Rooms2_1F_Text_JaniDefeat
msgbox AbandonedShip_Rooms2_1F_Text_JaniPostBattle, MSGBOX_AUTOCLOSE
end
```
### AbandonedShip_Rooms2_1F_EventScript_Garrison
```
trainerbattle_single TRAINER_GARRISON, AbandonedShip_Rooms2_1F_Text_GarrisonIntro, AbandonedShip_Rooms2_1F_Text_GarrisonDefeat
msgbox AbandonedShip_Rooms2_1F_Text_GarrisonPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (23)
### AbandonedShip_Rooms2_1F_Text_DanIntro
```
JOE: En cherchant des trésors,\non a découvert un DRESSEUR!$
```
### AbandonedShip_Rooms2_1F_Text_DanDefeat
```
JOE: On n'a pas réussi à gagner,\nmême en se mettant ensemble…$
```
### AbandonedShip_Rooms2_1F_Text_DanPostBattle
```
JOE: On n'a pas trouvé de trésors…\nQuelqu'un les aurait-il déjà pris?$
```
### AbandonedShip_Rooms2_1F_Text_DanNotEnoughMons
```
JOE: Tu n'as même pas deux POKéMON.\nN'espère pas nous battre comme ça.$
```
### AbandonedShip_Rooms2_1F_Text_KiraIntro
```
RITA: Oh?! On cherchait des trésors,\nmais on n'a trouvé qu'un DRESSEUR.$
```
### AbandonedShip_Rooms2_1F_Text_KiraDefeat
```
RITA: Oh, waouh, quelle force!$
```
### AbandonedShip_Rooms2_1F_Text_KiraPostBattle
```
RITA: Je me demande où les trésors\npeuvent bien être cachés.\pJe sais déjà ce que je vais m'acheter\nquand on les aura trouvés!$
```
### AbandonedShip_Rooms2_1F_Text_KiraNotEnoughMons
```
RITA: Tu n'as pas deux POKéMON?\nOn se battra une autre fois alors!$
```
### AbandonedShip_Rooms2_1F_Text_KiraRegister
```
RITA: Tu m'as mise en colère!\nJe vais t'enregistrer pour la peine!$
```
### AbandonedShip_Rooms2_1F_Text_DanRematchIntro
```
JOE: On a passé tout ce temps à\nchercher des trésors.\pNos POKéMON sont devenus plus forts.\nOn t'fait voir, OK?$
```
### AbandonedShip_Rooms2_1F_Text_DanRematchDefeat
```
JOE: Toujours autant de force!$
```
### AbandonedShip_Rooms2_1F_Text_DanPostRematch
```
JOE: On n'a pas trouvé de trésors,\non a perdu notre combat de POKéMON…\pJe veux rentrer à la maison… Mais si je\ndis ça, elle va m'en vouloir…$
```
### AbandonedShip_Rooms2_1F_Text_DanRematchNotEnoughMons
```
JOE: Tu n'as même pas deux POKéMON.\nN'espère pas nous battre comme ça.$
```
### AbandonedShip_Rooms2_1F_Text_KiraRematchIntro
```
RITA: Oh, salut! Comme on s'retrouve!\pTout comme nous, t'as pas arrêté de\nchercher des trésors!\pSi on se battait? Et le perdant arrête\nde chercher!$
```
### AbandonedShip_Rooms2_1F_Text_KiraRematchDefeat
```
RITA: Oh, on a encore perdu…$
```
### AbandonedShip_Rooms2_1F_Text_KiraPostRematch
```
RITA: On va élever le niveau de nos\nPOKéMON.\pEt on ne rentrera pas à la maison avant\nd'avoir trouvé des trésors!$
```
### AbandonedShip_Rooms2_1F_Text_KiraRematchNotEnoughMons
```
RITA: Tu n'as pas deux POKéMON?\nOn se battra une autre fois alors!$
```
### AbandonedShip_Rooms2_1F_Text_JaniIntro
```
Je ne sais pas bien nager, mais quand\nil s'agit de se battre…$
```
### AbandonedShip_Rooms2_1F_Text_JaniDefeat
```
Oups, ça n'a pas vraiment bien marché.$
```
### AbandonedShip_Rooms2_1F_Text_JaniPostBattle
```
Ça ne se fait pas vraiment de marcher\npieds nus sur un bateau.$
```
### AbandonedShip_Rooms2_1F_Text_GarrisonIntro
```
Force et compassion…\nCe sont les trésors d'un DRESSEUR!$
```
### AbandonedShip_Rooms2_1F_Text_GarrisonDefeat
```
Quelque chose brille en toi, ça se\nvoit tout de suite.$
```
### AbandonedShip_Rooms2_1F_Text_GarrisonPostBattle
```
J'ai vu quelque chose briller dans une\ndes cabines du bateau.$
```
