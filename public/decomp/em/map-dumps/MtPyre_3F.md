# MtPyre_3F

## Métadonnées
- **id** : `MAP_MT_PYRE_3F`
- **layout** : `LAYOUT_MT_PYRE_3F`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_MT_PYRE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PSYCHIC_M` | 1,4 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `MtPyre_3F_EventScript_William` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 11,4 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `MtPyre_3F_EventScript_Kayla` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 0,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `MtPyre_3F_EventScript_ItemSuperRepel` | `FLAG_ITEM_MT_PYRE_3F_SUPER_REPEL` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 6,4 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `MtPyre_3F_EventScript_Gabrielle` | `0` |

## Warps (6)
- #0 (10,1) → `MAP_MT_PYRE_2F` warp #1
- #1 (2,1) → `MAP_MT_PYRE_4F` warp #1
- #2 (9,10) → `MAP_MT_PYRE_4F` warp #4
- #3 (1,12) → `MAP_MT_PYRE_4F` warp #5
- #4 (10,12) → `MAP_MT_PYRE_2F` warp #2
- #5 (6,12) → `MAP_MT_PYRE_2F` warp #3

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (5)
### MtPyre_3F_EventScript_William
```
trainerbattle_single TRAINER_WILLIAM, MtPyre_3F_Text_WilliamIntro, MtPyre_3F_Text_WilliamDefeat
msgbox MtPyre_3F_Text_WilliamPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtPyre_3F_EventScript_Kayla
```
trainerbattle_single TRAINER_KAYLA, MtPyre_3F_Text_KaylaIntro, MtPyre_3F_Text_KaylaDefeat
msgbox MtPyre_3F_Text_KaylaPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtPyre_3F_EventScript_Gabrielle
```
trainerbattle_single TRAINER_GABRIELLE_1, MtPyre_3F_Text_GabrielleIntro, MtPyre_3F_Text_GabrielleDefeat, MtPyre_3F_EventScript_RegisterGabrielle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, MtPyre_3F_EventScript_RematchGabrielle
msgbox MtPyre_3F_Text_GabriellePostBattle, MSGBOX_DEFAULT
release
end
```
### MtPyre_3F_EventScript_RegisterGabrielle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox MtPyre_3F_Text_GabrielleRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_GABRIELLE_1
release
end
```
### MtPyre_3F_EventScript_RematchGabrielle
```
trainerbattle_rematch TRAINER_GABRIELLE_1, MtPyre_3F_Text_GabrielleRematchIntro, MtPyre_3F_Text_GabrielleRematchDefeat
msgbox MtPyre_3F_Text_GabriellePostRematch, MSGBOX_AUTOCLOSE
end
```

## Textes (13)
### MtPyre_3F_Text_WilliamIntro
```
L'air pur de la montagne a augmenté\nmon pouvoir psychique!\pUn p'tit mioche comme toi…\nTu rêves de gagner?$
```
### MtPyre_3F_Text_WilliamDefeat
```
J'ai honte de moi…$
```
### MtPyre_3F_Text_WilliamPostBattle
```
Mes pouvoirs psychiques se sont sans\naucun doute accrus, mais…$
```
### MtPyre_3F_Text_KaylaIntro
```
Ah ah ah ah!\pC'est pas un endroit pour les mômes,\nencore moins pour toi!$
```
### MtPyre_3F_Text_KaylaDefeat
```
Il est clair que j'ai perdu…$
```
### MtPyre_3F_Text_KaylaPostBattle
```
Ça veut dire que mon entraînement\nn'est pas encore suffisant…\pIl faut que je continue à travailler\npour arriver au plus haut niveau…\pAllez! Je suis motivée!$
```
### MtPyre_3F_Text_GabrielleIntro
```
Qu'est-ce que tu viens faire ici?$
```
### MtPyre_3F_Text_GabrielleDefeat
```
C'était époustouflant!\nTu es un DRESSEUR d'exception!$
```
### MtPyre_3F_Text_GabriellePostBattle
```
Les POKéMON qui ne sont plus de\nce monde…\lLes POKéMON à tes côtés maintenant…\pEt les POKéMON que tu rencontreras\ndans le futur…\pIls méritent tous d'être aimés de la\nmême façon. Ne l'oublie pas!$
```
### MtPyre_3F_Text_GabrielleRegister
```
J'aimerais revoir tes POKéMON quand\nils auront plus d'expérience…\pLaisse-moi voir ton POKéNAV.$
```
### MtPyre_3F_Text_GabrielleRematchIntro
```
Oh, c'est toi…\pTu es là pour me montrer comme tes\nPOKéMON ont progressé?$
```
### MtPyre_3F_Text_GabrielleRematchDefeat
```
Incroyable! Je suis vraiment heureuse\nde connaître quelqu'un comme toi!$
```
### MtPyre_3F_Text_GabriellePostRematch
```
Les POKéMON qui ne sont plus de\nce monde…\lLes POKéMON à tes côtés maintenant…\pEt les POKéMON que tu rencontreras\ndans le futur…\pIls méritent tous d'être aimés de la\nmême façon. Je vois que tu n'as\lpas oublié!$
```
