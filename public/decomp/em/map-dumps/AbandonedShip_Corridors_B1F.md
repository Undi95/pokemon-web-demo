# AbandonedShip_Corridors_B1F

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_CORRIDORS_B1F`
- **layout** : `LAYOUT_ABANDONED_SHIP_CORRIDORS_B1F`
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
| `` | `OBJ_EVENT_GFX_TUBER_M` | 2,8 | `MOVEMENT_TYPE_WANDER_AROUND` | `AbandonedShip_Corridors_B1F_EventScript_TuberM` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 9,6 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `AbandonedShip_Corridors_B1F_EventScript_Duncan` | `0` |

## Warps (8)
- #0 (6,4) → `MAP_ABANDONED_SHIP_ROOMS2_B1F` warp #2
- #1 (3,4) → `MAP_ABANDONED_SHIP_ROOMS2_B1F` warp #0
- #2 (5,7) → `MAP_ABANDONED_SHIP_ROOMS_B1F` warp #0
- #3 (8,7) → `MAP_ABANDONED_SHIP_ROOMS_B1F` warp #1
- #4 (11,7) → `MAP_ABANDONED_SHIP_ROOMS_B1F` warp #2
- #5 (11,4) → `MAP_ABANDONED_SHIP_ROOM_B1F` warp #0
- #6 (0,2) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #10
- #7 (8,2) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #9

## BG events / signs (1)
- (11,4) [sign] → `AbandonedShip_Corridors_B1F_EventScript_StorageRoomDoor`

## Flags référencés (1)
- `FLAG_USED_STORAGE_KEY`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (10)
### AbandonedShip_Corridors_B1F_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, AbandonedShip_Corridors_B1F_OnResume
map_script MAP_SCRIPT_ON_LOAD, AbandonedShip_Corridors_B1F_OnLoad
```
### AbandonedShip_Corridors_B1F_OnResume
```
setdivewarp MAP_ABANDONED_SHIP_UNDERWATER1, 5, 4
end
```
### AbandonedShip_Corridors_B1F_OnLoad
```
call_if_unset FLAG_USED_STORAGE_KEY, AbandonedShip_Corridors_B1F_EventScript_LockStorageRoom
call_if_set FLAG_USED_STORAGE_KEY, AbandonedShip_Corridors_B1F_EventScript_UnlockStorageRoom
end
```
### AbandonedShip_Corridors_B1F_EventScript_LockStorageRoom
```
setmetatile 11, 4, METATILE_InsideShip_IntactDoor_Bottom_Locked, TRUE
return
```
### AbandonedShip_Corridors_B1F_EventScript_UnlockStorageRoom
```
setmetatile 11, 4, METATILE_InsideShip_IntactDoor_Bottom_Unlocked, TRUE
return
```
### AbandonedShip_Corridors_B1F_EventScript_TuberM
```
msgbox AbandonedShip_Corridors_B1F_Text_YayItsAShip, MSGBOX_NPC
end
```
### AbandonedShip_Corridors_B1F_EventScript_StorageRoomDoor
```
lockall
goto_if_set FLAG_USED_STORAGE_KEY, AbandonedShip_Corridors_B1F_EventScript_DoorIsUnlocked
checkitem ITEM_STORAGE_KEY
goto_if_eq VAR_RESULT, FALSE, AbandonedShip_Corridors_B1F_EventScript_DoorIsLocked
msgbox AbandonedShip_Corridors_B1F_Text_InsertedStorageKey, MSGBOX_DEFAULT
playse SE_PIN
removeitem ITEM_STORAGE_KEY
setflag FLAG_USED_STORAGE_KEY
call AbandonedShip_Corridors_B1F_EventScript_UnlockStorageRoom
special DrawWholeMapView
releaseall
end
```
### AbandonedShip_Corridors_B1F_EventScript_DoorIsLocked
```
msgbox AbandonedShip_Corridors_B1F_Text_DoorIsLocked, MSGBOX_DEFAULT
releaseall
end
```
### AbandonedShip_Corridors_B1F_EventScript_DoorIsUnlocked
```
msgbox AbandonedShip_Text_TheDoorIsOpen, MSGBOX_DEFAULT
releaseall
end
```
### AbandonedShip_Corridors_B1F_EventScript_Duncan
```
trainerbattle_single TRAINER_DUNCAN, AbandonedShip_Corridors_B1F_Text_DuncanIntro, AbandonedShip_Corridors_B1F_Text_DuncanDefeat
msgbox AbandonedShip_Corridors_B1F_Text_DuncanPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (7)
### AbandonedShip_Corridors_B1F_Text_DuncanIntro
```
Nous, les MARINS, quand on sort en mer,\non emmène toujours nos POKéMON.\lQue dirais-tu d'un petit combat?$
```
### AbandonedShip_Corridors_B1F_Text_DuncanDefeat
```
Oups, je sombre!$
```
### AbandonedShip_Corridors_B1F_Text_DuncanPostBattle
```
L'arrière du bateau a sombré dans\nles profondeurs.\pSi un POKéMON savait aller sous l'eau,\non pourrait peut-être progresser…$
```
### AbandonedShip_Corridors_B1F_Text_YayItsAShip
```
Yé!\nC'est un bateau!$
```
### AbandonedShip_Corridors_B1F_Text_DoorIsLocked
```
La porte est fermée.\pIl est inscrit sur la porte:\n“STOCKAGE”.$
```
### AbandonedShip_Corridors_B1F_Text_InsertedStorageKey
```
{PLAYER} insère et tourne la \nCLE STOCKAGE.\pLa CLE insérée se coince un peu,\nmais la porte s'ouvre.$
```
### AbandonedShip_Text_TheDoorIsOpen
```
La porte est ouverte.$
```
