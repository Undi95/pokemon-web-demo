# MtPyre_6F

## Métadonnées
- **id** : `MAP_MT_PYRE_6F`
- **layout** : `LAYOUT_MT_PYRE_6F`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_MT_PYRE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_HEX_MANIAC` | 6,3 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `MtPyre_6F_EventScript_Valerie` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 6,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `MtPyre_6F_EventScript_ItemTMShadowBall` | `FLAG_ITEM_MT_PYRE_6F_TM_SHADOW_BALL` |
| `` | `OBJ_EVENT_GFX_PSYCHIC_M` | 10,3 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `MtPyre_6F_EventScript_Cedric` | `0` |

## Warps (2)
- #0 (2,1) → `MAP_MT_PYRE_5F` warp #0
- #1 (1,10) → `MAP_MT_PYRE_5F` warp #2

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (4)
### MtPyre_6F_EventScript_Valerie
```
trainerbattle_single TRAINER_VALERIE_1, MtPyre_6F_Text_ValerieIntro, MtPyre_6F_Text_ValerieDefeat, MtPyre_6F_EventScript_RegisterValerie
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, MtPyre_6F_EventScript_RematchValerie
msgbox MtPyre_6F_Text_ValeriePostBattle, MSGBOX_DEFAULT
release
end
```
### MtPyre_6F_EventScript_RegisterValerie
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox MtPyre_6F_Text_ValerieRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_VALERIE_1
release
end
```
### MtPyre_6F_EventScript_RematchValerie
```
trainerbattle_rematch TRAINER_VALERIE_1, MtPyre_6F_Text_ValerieRematchIntro, MtPyre_6F_Text_ValerieRematchDefeat
msgbox MtPyre_6F_Text_ValeriePostRematch, MSGBOX_AUTOCLOSE
end
```
### MtPyre_6F_EventScript_Cedric
```
trainerbattle_single TRAINER_CEDRIC, MtPyre_6F_Text_CedricIntro, MtPyre_6F_Text_CedricDefeat
msgbox MtPyre_6F_Text_CedricPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (10)
### MtPyre_6F_Text_ValerieIntro
```
Quand je suis ici…\nUn étrange pouvoir s'empare de moi…$
```
### MtPyre_6F_Text_ValerieDefeat
```
Le pouvoir s'affaiblit…$
```
### MtPyre_6F_Text_ValeriePostBattle
```
Ce pouvoir vient peut-être des esprits\nerrants des POKéMON qui reposent ici…$
```
### MtPyre_6F_Text_ValerieRegister
```
… J'ai perdu ce match, mais…\nJ'ai ce petit don en moi…\pEt sans même poser les mains\nsur ton POKéNAV…$
```
### MtPyre_6F_Text_ValerieRematchIntro
```
Derrière toi…\nQu'est-ce que c'est…$
```
### MtPyre_6F_Text_ValerieRematchDefeat
```
Quelque chose a disparu…$
```
### MtPyre_6F_Text_ValeriePostRematch
```
Les POKéMON qui reposent ici…\nParfois, ils s'amusent…$
```
### MtPyre_6F_Text_CedricIntro
```
Est-ce que tu as perdu ton chemin?\nNe t'inquiète pas, je suis là!$
```
### MtPyre_6F_Text_CedricDefeat
```
Tu n'avais pas perdu ton chemin?$
```
### MtPyre_6F_Text_CedricPostBattle
```
Je pensais qu'un DRESSEUR perdu\nserait plus facile à battre.\pJe m'étais trompé et je ne\nrecommencerai plus…$
```
