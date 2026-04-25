# Underwater_SealedChamber

## Métadonnées
- **id** : `MAP_UNDERWATER_SEALED_CHAMBER`
- **layout** : `LAYOUT_UNDERWATER_SEALED_CHAMBER`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_UNDERWATER_SEALED_CHAMBER`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (1)
- #0 (7,1) → `MAP_UNDERWATER_ROUTE134` warp #0

## BG events / signs (1)
- (12,43) [sign] → `Underwater_SealedChamber_EventScript_Braille`

## Variables référencées (2)
- `VAR_0x8004`
- `VAR_0x8005`

## Scripts (5)
### Underwater_SealedChamber_MapScripts
```
map_script MAP_SCRIPT_ON_DIVE_WARP, Underwater_SealedChamber_OnDive
```
### Underwater_SealedChamber_OnDive
```
getplayerxy VAR_0x8004, VAR_0x8005
goto_if_ne VAR_0x8004, 12, Underwater_SealedChamber_EventScript_SurfaceRoute134
goto_if_ne VAR_0x8005, 44, Underwater_SealedChamber_EventScript_SurfaceRoute134
goto Underwater_SealedChamber_EventScript_SurfaceSealedChamber
```
### Underwater_SealedChamber_EventScript_SurfaceRoute134
```
setdivewarp MAP_ROUTE134, 60, 31
end
```
### Underwater_SealedChamber_EventScript_SurfaceSealedChamber
```
setdivewarp MAP_SEALED_CHAMBER_OUTER_ROOM, 10, 19
end
```
### Underwater_SealedChamber_EventScript_Braille
```
lockall
braillemsgbox Underwater_SealedChamber_Braille_GoUpHere
releaseall
end
```
