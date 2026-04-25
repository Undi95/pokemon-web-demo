# ShoalCave_LowTideLowerRoom

## Métadonnées
- **id** : `MAP_SHOAL_CAVE_LOW_TIDE_LOWER_ROOM`
- **layout** : `LAYOUT_SHOAL_CAVE_LOW_TIDE_LOWER_ROOM`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_SHOAL_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 25,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 11,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `ShoalCave_LowTideLowerRoom_EventScript_BlackBelt` | `0` |

## Warps (4)
- #0 (7,2) → `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM` warp #3
- #1 (2,6) → `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM` warp #4
- #2 (19,11) → `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM` warp #5
- #3 (28,11) → `MAP_SHOAL_CAVE_LOW_TIDE_ICE_ROOM` warp #0

## BG events / signs (1)
- (18,2) [sign] → `ShoalCave_LowTideLowerRoom_EventScript_ShoalSalt4`

## Flags référencés (2)
- `FLAG_RECEIVED_FOCUS_BAND`
- `FLAG_RECEIVED_SHOAL_SALT_4`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `ShoalCave_Text_WasShoalSaltNowNothing`

## Scripts (8)
### ShoalCave_LowTideLowerRoom_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, ShoalCave_LowTideLowerRoom_OnLoad
```
### ShoalCave_LowTideLowerRoom_OnLoad
```
call ShoalCave_LowTideLowerRoom_EventScript_SetShoalItemMetatiles
end
```
### ShoalCave_LowTideLowerRoom_EventScript_SetShoalItemMetatiles
```
goto_if_set FLAG_RECEIVED_SHOAL_SALT_4, ShoalCave_LowTideLowerRoom_EventScript_SetShoalItemMetatilesEnd
setmetatile 18, 2, METATILE_Cave_ShoalCave_DirtPile_Large, TRUE
return
```
### ShoalCave_LowTideLowerRoom_EventScript_SetShoalItemMetatilesEnd
```
return
```
### ShoalCave_LowTideLowerRoom_EventScript_ShoalSalt4
```
lockall
goto_if_set FLAG_RECEIVED_SHOAL_SALT_4, ShoalCave_LowTideLowerRoom_EventScript_ReceivedShoalSalt
giveitem ITEM_SHOAL_SALT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setmetatile 18, 2, METATILE_Cave_ShoalCave_DirtPile_Small, FALSE
special DrawWholeMapView
setflag FLAG_RECEIVED_SHOAL_SALT_4
releaseall
end
```
### ShoalCave_LowTideLowerRoom_EventScript_ReceivedShoalSalt
```
msgbox ShoalCave_Text_WasShoalSaltNowNothing, MSGBOX_DEFAULT
releaseall
end
```
### ShoalCave_LowTideLowerRoom_EventScript_BlackBelt
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_FOCUS_BAND, ShoalCave_LowTideLowerRoom_EventScript_ReceivedFocusBand
msgbox ShoalCave_LowTideLowerRoom_Text_CanOvercomeColdWithFocus, MSGBOX_DEFAULT
giveitem ITEM_FOCUS_BAND
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_FOCUS_BAND
release
end
```
### ShoalCave_LowTideLowerRoom_EventScript_ReceivedFocusBand
```
msgbox ShoalCave_LowTideLowerRoom_Text_EverythingStartsWithFocus, MSGBOX_DEFAULT
release
end
```

## Textes (2)
### ShoalCave_LowTideLowerRoom_Text_CanOvercomeColdWithFocus
```
Ce froid pénétrant dans les alentours\nest un obstacle à l'entraînement.\pMais avec un peu de concentration,\non peut le vaincre!\pAvec ce BANDEAU, tu t'y mets\net tu résistes au froid!$
```
### ShoalCave_LowTideLowerRoom_Text_EverythingStartsWithFocus
```
Tout vient de la concentration!$
```
