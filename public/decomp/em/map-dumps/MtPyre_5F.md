# MtPyre_5F

## Métadonnées
- **id** : `MAP_MT_PYRE_5F`
- **layout** : `LAYOUT_MT_PYRE_5F`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_MT_PYRE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 3,7 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `MtPyre_5F_EventScript_Atsushi` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 6,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `MtPyre_5F_EventScript_ItemLaxIncense` | `FLAG_ITEM_MT_PYRE_5F_LAX_INCENSE` |

## Warps (5)
- #0 (2,1) → `MAP_MT_PYRE_6F` warp #0
- #1 (10,5) → `MAP_MT_PYRE_4F` warp #0
- #2 (1,10) → `MAP_MT_PYRE_6F` warp #1
- #3 (12,10) → `MAP_MT_PYRE_4F` warp #2
- #4 (12,12) → `MAP_MT_PYRE_4F` warp #3

## Scripts (1)
### MtPyre_4F_EventScript_Tasha
```
trainerbattle_single TRAINER_TASHA, MtPyre_4F_Text_TashaIntro, MtPyre_4F_Text_TashaDefeat
msgbox MtPyre_4F_Text_TashaPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (3)
### MtPyre_4F_Text_TashaIntro
```
J'aime tout ce qui fait peur…\nC'est comme une maladie…\pQuand je suis ici…\nJe tremble de peur…$
```
### MtPyre_4F_Text_TashaDefeat
```
Perdre, je déteste ça…$
```
### MtPyre_4F_Text_TashaPostBattle
```
Je veux voir des choses atroces…\nJe ne peux pas partir…\pReste…\nTu ne vas pas rester avec moi?$
```
