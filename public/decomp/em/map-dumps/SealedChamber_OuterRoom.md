# SealedChamber_OuterRoom

## Métadonnées
- **id** : `MAP_SEALED_CHAMBER_OUTER_ROOM`
- **layout** : `LAYOUT_SEALED_CHAMBER_OUTER_ROOM`
- **music** : `MUS_SEALED_CHAMBER`
- **region_map_section** : `MAPSEC_SEALED_CHAMBER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (1)
- #0 (10,2) → `MAP_SEALED_CHAMBER_INNER_ROOM` warp #0

## BG events / signs (29)
- (5,6) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleABC`
- (5,9) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleGHI`
- (5,12) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleMNO`
- (5,15) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleTUV`
- (11,6) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleDEF`
- (11,9) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleJKL`
- (11,12) [sign] → `SealedChamber_OuterRoom_EventScript_BraillePQRS`
- (11,15) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleWXYZ`
- (16,6) [sign] → `SealedChamber_OuterRoom_EventScript_BraillePeriod`
- (16,9) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleComma`
- (10,2) [sign] → `SealedChamber_OuterRoom_EventScript_InnerRoomEntranceWall`
- (6,6) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleABC`
- (4,6) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleABC`
- (4,9) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleGHI`
- (6,9) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleGHI`
- (4,12) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleMNO`
- (6,12) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleMNO`
- (4,15) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleTUV`
- (6,15) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleTUV`
- (10,6) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleDEF`
- (12,6) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleDEF`
- (10,9) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleJKL`
- (12,9) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleJKL`
- (10,12) [sign] → `SealedChamber_OuterRoom_EventScript_BraillePQRS`
- (12,12) [sign] → `SealedChamber_OuterRoom_EventScript_BraillePQRS`
- (10,15) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleWXYZ`
- (12,15) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleWXYZ`
- (9,2) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleDigHere`
- (11,2) [sign] → `SealedChamber_OuterRoom_EventScript_BrailleDigHere`

## Flags référencés (2)
- `FLAG_LANDMARK_SEALED_CHAMBER`
- `FLAG_SYS_BRAILLE_DIG`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_BigHoleInTheWall`

## Scripts (18)
### SealedChamber_OuterRoom_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, SealedChamber_OuterRoom_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, SealedChamber_OuterRoom_OnTransition
map_script MAP_SCRIPT_ON_LOAD, SealedChamber_OuterRoom_OnLoad
```
### SealedChamber_OuterRoom_OnResume
```
setdivewarp MAP_UNDERWATER_SEALED_CHAMBER, 12, 44
setescapewarp MAP_UNDERWATER_SEALED_CHAMBER, 12, 44
end
```
### SealedChamber_OuterRoom_OnTransition
```
setflag FLAG_LANDMARK_SEALED_CHAMBER
end
```
### SealedChamber_OuterRoom_OnLoad
```
call_if_unset FLAG_SYS_BRAILLE_DIG, SealedChamber_OuterRoom_EventScript_CloseInnerRoomEntrance
end
```
### SealedChamber_OuterRoom_EventScript_CloseInnerRoomEntrance
```
setmetatile 9, 1, METATILE_Cave_EntranceCover, TRUE
setmetatile 10, 1, METATILE_Cave_EntranceCover, TRUE
setmetatile 11, 1, METATILE_Cave_EntranceCover, TRUE
setmetatile 9, 2, METATILE_Cave_SealedChamberBraille_Mid, TRUE
setmetatile 10, 2, METATILE_Cave_SealedChamberBraille_Mid, TRUE
setmetatile 11, 2, METATILE_Cave_SealedChamberBraille_Mid, TRUE
return
```
### SealedChamber_OuterRoom_EventScript_BrailleABC
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_ABC
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BrailleGHI
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_GHI
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BrailleMNO
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_MNO
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BrailleTUV
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_TUV
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BrailleDEF
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_DEF
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BrailleJKL
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_JKL
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BraillePQRS
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_PQRS
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BraillePeriod
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_Period
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BrailleWXYZ
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_WXYZ
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BrailleComma
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_Comma
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_InnerRoomEntranceWall
```
lockall
goto_if_set FLAG_SYS_BRAILLE_DIG, SealedChamber_OuterRoom_EventScript_HoleInWall
braillemsgbox SealedChamber_OuterRoom_Braille_DigHere
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_HoleInWall
```
msgbox gText_BigHoleInTheWall, MSGBOX_DEFAULT
releaseall
end
```
### SealedChamber_OuterRoom_EventScript_BrailleDigHere
```
lockall
braillemsgbox SealedChamber_OuterRoom_Braille_DigHere
releaseall
end
```
