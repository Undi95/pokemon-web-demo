# ShoalCave_LowTideStairsRoom

## Métadonnées
- **id** : `MAP_SHOAL_CAVE_LOW_TIDE_STAIRS_ROOM`
- **layout** : `LAYOUT_SHOAL_CAVE_LOW_TIDE_STAIRS_ROOM`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_SHOAL_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 13,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `ShoalCave_LowTideStairsRoom_EventScript_ItemIceHeal` | `FLAG_ITEM_SHOAL_CAVE_STAIRS_ROOM_ICE_HEAL` |

## Warps (2)
- #0 (3,12) → `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM` warp #1
- #1 (7,4) → `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM` warp #2

## BG events / signs (1)
- (11,11) [sign] → `ShoalCave_LowTideStairsRoom_EventScript_ShoalSalt3`

## Flags référencés (1)
- `FLAG_RECEIVED_SHOAL_SALT_3`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `ShoalCave_Text_WasShoalSaltNowNothing`

## Scripts (6)
### ShoalCave_LowTideStairsRoom_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, ShoalCave_LowTideStairsRoom_OnLoad
```
### ShoalCave_LowTideStairsRoom_OnLoad
```
call ShoalCave_LowTideStairsRoom_EventScript_SetShoalItemMetatiles
end
```
### ShoalCave_LowTideStairsRoom_EventScript_SetShoalItemMetatiles
```
goto_if_set FLAG_RECEIVED_SHOAL_SALT_3, ShoalCave_LowTideStairsRoom_EventScript_SetShoalItemMetatilesEnd
setmetatile 11, 11, METATILE_Cave_ShoalCave_DirtPile_Large, TRUE
return
```
### ShoalCave_LowTideStairsRoom_EventScript_SetShoalItemMetatilesEnd
```
return
```
### ShoalCave_LowTideStairsRoom_EventScript_ShoalSalt3
```
lockall
goto_if_set FLAG_RECEIVED_SHOAL_SALT_3, ShoalCave_LowTideStairsRoom_EventScript_ReceivedShoalSalt
giveitem ITEM_SHOAL_SALT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setmetatile 11, 11, METATILE_Cave_ShoalCave_DirtPile_Small, FALSE
special DrawWholeMapView
setflag FLAG_RECEIVED_SHOAL_SALT_3
releaseall
end
```
### ShoalCave_LowTideStairsRoom_EventScript_ReceivedShoalSalt
```
msgbox ShoalCave_Text_WasShoalSaltNowNothing, MSGBOX_DEFAULT
releaseall
end
```
