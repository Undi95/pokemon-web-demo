# MtPyre_4F

## Métadonnées
- **id** : `MAP_MT_PYRE_4F`
- **layout** : `LAYOUT_MT_PYRE_4F`
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
| `` | `OBJ_EVENT_GFX_HEX_MANIAC` | 11,7 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `MtPyre_4F_EventScript_Tasha` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `MtPyre_4F_EventScript_ItemSeaIncense` | `FLAG_ITEM_MT_PYRE_4F_SEA_INCENSE` |

## Warps (6)
- #0 (10,1) → `MAP_MT_PYRE_5F` warp #1
- #1 (2,5) → `MAP_MT_PYRE_3F` warp #1
- #2 (12,10) → `MAP_MT_PYRE_5F` warp #3
- #3 (12,12) → `MAP_MT_PYRE_5F` warp #4
- #4 (9,10) → `MAP_MT_PYRE_3F` warp #2
- #5 (2,12) → `MAP_MT_PYRE_3F` warp #3

## Scripts (1)
### MtPyre_5F_EventScript_Atsushi
```
trainerbattle_single TRAINER_ATSUSHI, MtPyre_5F_Text_AtsushiIntro, MtPyre_5F_Text_AtsushiDefeat
msgbox MtPyre_5F_Text_AtsushiPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (3)
### MtPyre_5F_Text_AtsushiIntro
```
Professeur…\nRegardez les progrès que j'ai faits!$
```
### MtPyre_5F_Text_AtsushiDefeat
```
Professeur…\nPardonnez-moi!$
```
### MtPyre_5F_Text_AtsushiPostBattle
```
Mon prof, qui repose ici, ne trouvera\nla paix que lorsque j'aurai progressé…$
```
