# MagmaHideout_3F_2R

## Métadonnées
- **id** : `MAP_MAGMA_HIDEOUT_3F_2R`
- **layout** : `LAYOUT_MAGMA_HIDEOUT_3F_2R`
- **music** : `MUS_AQUA_MAGMA_HIDEOUT`
- **region_map_section** : `MAPSEC_MAGMA_HIDEOUT`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 16,3 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `MagmaHideout_3F_2R_EventScript_Grunt10` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 5,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `MagmaHideout_3F_2R_EventScript_ItemPPMax` | `FLAG_ITEM_MAGMA_HIDEOUT_3F_2R_PP_MAX` |

## Warps (1)
- #0 (12,15) → `MAP_MAGMA_HIDEOUT_3F_1R` warp #1

## Scripts (1)
### MagmaHideout_3F_2R_EventScript_Grunt10
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_10, MagmaHideout_3F_2R_Text_Grunt10Intro, MagmaHideout_3F_2R_Text_Grunt10Defeat
msgbox MagmaHideout_3F_2R_Text_Grunt10PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (3)
### MagmaHideout_3F_2R_Text_Grunt10Intro
```
Je suis d'accord avec tout ce que dit\nnotre leader. Mais tu sais quoi?\pFaire des trucs comme exhumer\nun POKéMON super vieux et voler\lle METEORITE de quelqu'un…\pJe crois qu'on va peut-être un peu\ntrop loin. T'es pas d'accord?$
```
### MagmaHideout_3F_2R_Text_Grunt10Defeat
```
Ouaip, je pense vraiment qu'on fait\nquelque chose de mal.$
```
### MagmaHideout_3F_2R_Text_Grunt10PostBattle
```
Tu sais, perdre permet de prendre\nconscience de certaines choses.\pLa prochaine fois que je verrai notre\nleader, je lui parlerai de ce que nous\lsommes en train de faire.$
```
