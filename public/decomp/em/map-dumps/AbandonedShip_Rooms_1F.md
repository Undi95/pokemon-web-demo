# AbandonedShip_Rooms_1F

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_ROOMS_1F`
- **layout** : `LAYOUT_ABANDONED_SHIP_ROOMS_1F`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_ABANDONED_SHIP`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 12,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `AbandonedShip_Rooms_1F_EventScript_Gentleman` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 4,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_Rooms_1F_EventScript_ItemHarborMail` | `FLAG_ITEM_ABANDONED_SHIP_ROOMS_1F_HARBOR_MAIL` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 10,11 | `MOVEMENT_TYPE_FACE_DOWN` | `AbandonedShip_Rooms_1F_EventScript_Thalia` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 10,16 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `AbandonedShip_Rooms_1F_EventScript_Demetrius` | `0` |

## Warps (6)
- #0 (4,16) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #4
- #1 (5,16) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #4
- #2 (4,1) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #6
- #3 (13,16) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #5
- #4 (13,1) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #7
- #5 (14,16) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #5

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (5)
### AbandonedShip_Rooms_1F_EventScript_Gentleman
```
msgbox AbandonedShip_Rooms_1F_Text_TakingALookAround, MSGBOX_NPC
end
```
### AbandonedShip_Rooms_1F_EventScript_Demetrius
```
trainerbattle_single TRAINER_DEMETRIUS, AbandonedShip_Rooms_1F_Text_DemetriusIntro, AbandonedShip_Rooms_1F_Text_DemetriusDefeat
msgbox AbandonedShip_Rooms_1F_Text_DemetriusPostBattle, MSGBOX_AUTOCLOSE
end
```
### AbandonedShip_Rooms_1F_EventScript_Thalia
```
trainerbattle_single TRAINER_THALIA_1, AbandonedShip_Rooms_1F_Text_ThaliaIntro, AbandonedShip_Rooms_1F_Text_ThaliaDefeat, AbandonedShip_Rooms_1F_EventScript_RegisterThalia
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, AbandonedShip_Rooms_1F_EventScript_ThaliaRematch
msgbox AbandonedShip_Rooms_1F_Text_ThaliaPostBattle, MSGBOX_DEFAULT
release
end
```
### AbandonedShip_Rooms_1F_EventScript_RegisterThalia
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox AbandonedShip_Rooms_1F_Text_ThaliaRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_THALIA_1
release
end
```
### AbandonedShip_Rooms_1F_EventScript_ThaliaRematch
```
trainerbattle_rematch TRAINER_THALIA_1, AbandonedShip_Rooms_1F_Text_ThaliaRematchIntro, AbandonedShip_Rooms_1F_Text_ThaliaRematchDefeat
msgbox AbandonedShip_Rooms_1F_Text_ThaliaPostRematch, MSGBOX_AUTOCLOSE
end
```

## Textes (11)
### AbandonedShip_Rooms_1F_Text_TakingALookAround
```
Les bateaux de ce genre sont rares,\nalors je vais y jeter un coup d'œil.\pHum…\nOn dirait qu'il y a d'autres cabines…$
```
### AbandonedShip_Rooms_1F_Text_ThaliaIntro
```
Qu'est-ce qui a bien pu te pousser\nà venir ici?\pTu ne sais pas que la curiosité est\nun vilain défaut?$
```
### AbandonedShip_Rooms_1F_Text_ThaliaDefeat
```
Et plutôt tenace en plus de ça!$
```
### AbandonedShip_Rooms_1F_Text_ThaliaPostBattle
```
L'homme d'à côté…\pIl dit qu'il est juste là pour voir le\npaysage, mais j'ai du mal à le croire.$
```
### AbandonedShip_Rooms_1F_Text_ThaliaRegister
```
Tu es si jeune pour un DRESSEUR!\nLaisse-moi t'enregistrer!$
```
### AbandonedShip_Rooms_1F_Text_ThaliaRematchIntro
```
Qu'est-ce qui a bien pu te pousser\nà revenir ici?\pQuelle curiosité, ma parole!$
```
### AbandonedShip_Rooms_1F_Text_ThaliaRematchDefeat
```
C'est normal d'avoir tant de force\ndans un si petit corps?$
```
### AbandonedShip_Rooms_1F_Text_ThaliaPostRematch
```
Je suis sûre que cet homme cherche\nquelque chose. Il est vraiment étrange!$
```
### AbandonedShip_Rooms_1F_Text_DemetriusIntro
```
Waaah!\nTu m'as trouvé!$
```
### AbandonedShip_Rooms_1F_Text_DemetriusDefeat
```
Oh, t'es pas ma maman toi!$
```
### AbandonedShip_Rooms_1F_Text_DemetriusPostBattle
```
J'ai peur de me faire gronder, alors\nje me cache…\pTu diras rien, d'accord?$
```
