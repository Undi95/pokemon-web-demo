# AbandonedShip_Rooms_B1F

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_ROOMS_B1F`
- **layout** : `LAYOUT_ABANDONED_SHIP_ROOMS_B1F`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_ABANDONED_SHIP`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 25,6 | `MOVEMENT_TYPE_FACE_LEFT` | `AbandonedShip_Rooms_B1F_EventScript_FatMan` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 6,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_Rooms_B1F_EventScript_ItemEscapeRope` | `FLAG_ITEM_ABANDONED_SHIP_ROOMS_B1F_ESCAPE_ROPE` |

## Warps (3)
- #0 (4,1) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #2
- #1 (13,1) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #3
- #2 (22,1) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #4

## Scripts (3)
### AbandonedShip_Rooms_B1F_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, AbandonedShip_Rooms_B1F_OnResume
```
### AbandonedShip_Rooms_B1F_OnResume
```
setdivewarp MAP_ABANDONED_SHIP_UNDERWATER2, 17, 4
end
```
### AbandonedShip_Rooms_B1F_EventScript_FatMan
```
msgbox AbandonedShip_Rooms_B1F_Text_GettingQueasy, MSGBOX_NPC
end
```

## Textes (1)
### AbandonedShip_Rooms_B1F_Text_GettingQueasy
```
Hoooou…\pJ'ai mal au cœur rien que d'être à bord\nde ce bateau…\pÇa ne bouge même pas, mais…$
```
