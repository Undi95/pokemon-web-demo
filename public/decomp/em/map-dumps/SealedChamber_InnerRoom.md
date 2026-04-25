# SealedChamber_InnerRoom

## Métadonnées
- **id** : `MAP_SEALED_CHAMBER_INNER_ROOM`
- **layout** : `LAYOUT_SEALED_CHAMBER_INNER_ROOM`
- **music** : `MUS_SEALED_CHAMBER`
- **region_map_section** : `MAPSEC_SEALED_CHAMBER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (1)
- #0 (10,19) → `MAP_SEALED_CHAMBER_OUTER_ROOM` warp #0

## BG events / signs (9)
- (10,4) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleBackWall`
- (6,8) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleStoryPart1`
- (14,8) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleStoryPart2`
- (4,13) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleStoryPart3`
- (16,13) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleStoryPart4`
- (6,18) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleStoryPart5`
- (14,18) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleStoryPart6`
- (9,4) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleBackWall`
- (11,4) [sign] → `SealedChamber_InnerRoom_EventScript_BrailleBackWall`

## Flags référencés (1)
- `FLAG_REGI_DOORS_OPENED`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_DoorOpenedFarAway`

## Scripts (8)
### SealedChamber_InnerRoom_EventScript_BrailleBackWall
```
lockall
braillemsgbox SealedChamber_InnerRoom_Braille_FirstWailordLastRelicanth
goto_if_set FLAG_REGI_DOORS_OPENED, SealedChamber_InnerRoom_EventScript_NoEffect
specialvar VAR_RESULT, CheckRelicanthWailord
goto_if_eq VAR_RESULT, FALSE, SealedChamber_InnerRoom_EventScript_NoEffect
fadeoutbgm 0
playse SE_TRUCK_MOVE
special DoSealedChamberShakingEffect_Long
delay 40
special DoSealedChamberShakingEffect_Short
playse SE_DOOR
delay 40
special DoSealedChamberShakingEffect_Short
playse SE_DOOR
delay 40
special DoSealedChamberShakingEffect_Short
playse SE_DOOR
delay 40
msgbox gText_DoorOpenedFarAway, MSGBOX_DEFAULT
closemessage
fadeinbgm 0
setflag FLAG_REGI_DOORS_OPENED
releaseall
end
```
### SealedChamber_InnerRoom_EventScript_NoEffect
```
releaseall
end
```
### SealedChamber_InnerRoom_EventScript_BrailleStoryPart1
```
lockall
braillemsgbox SealedChamber_InnerRoom_Braille_InThisCaveWeHaveLived
releaseall
end
```
### SealedChamber_InnerRoom_EventScript_BrailleStoryPart2
```
lockall
braillemsgbox SealedChamber_InnerRoom_Braille_WeOweAllToThePokemon
releaseall
end
```
### SealedChamber_InnerRoom_EventScript_BrailleStoryPart3
```
lockall
braillemsgbox SealedChamber_InnerRoom_Braille_ButWeSealedThePokemonAway
releaseall
end
```
### SealedChamber_InnerRoom_EventScript_BrailleStoryPart4
```
lockall
braillemsgbox SealedChamber_InnerRoom_Braille_WeFearedIt
releaseall
end
```
### SealedChamber_InnerRoom_EventScript_BrailleStoryPart5
```
lockall
braillemsgbox SealedChamber_InnerRoom_Braille_ThoseWithCourageHope
releaseall
end
```
### SealedChamber_InnerRoom_EventScript_BrailleStoryPart6
```
lockall
braillemsgbox SealedChamber_InnerRoom_Braille_OpenDoorEternalPokemonWaits
releaseall
end
```
