# RustboroCity_House3

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_HOUSE3`
- **layout** : `LAYOUT_RUSTBORO_CITY_HOUSE`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 4,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_House3_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_WOMAN` | 7,5 | `MOVEMENT_TYPE_FACE_LEFT` | `RustboroCity_House3_EventScript_OldWoman` | `0` |
| `` | `OBJ_EVENT_GFX_PIKACHU` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `RustboroCity_House3_EventScript_Pekachu` | `0` |

## Warps (2)
- #0 (5,8) → `MAP_RUSTBORO_CITY` warp #11
- #1 (6,8) → `MAP_RUSTBORO_CITY` warp #11

## Scripts (3)
### RustboroCity_House3_EventScript_OldMan
```
msgbox RustboroCity_House3_Text_IGivePerfectlySuitedNicknames, MSGBOX_NPC
end
```
### RustboroCity_House3_EventScript_OldWoman
```
msgbox RustboroCity_House3_Text_NamingPikachuPekachu, MSGBOX_NPC
end
```
### RustboroCity_House3_EventScript_Pekachu
```
lock
faceplayer
waitse
playmoncry SPECIES_PIKACHU, CRY_MODE_NORMAL
msgbox RustboroCity_House3_Text_Pekachu, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (3)
### RustboroCity_House3_Text_IGivePerfectlySuitedNicknames
```
Moi, à mes POKéMON, je leur donne\ndes surnoms très appropriés!\pC'est l'expression de, euh…\nmon originalité, oui, c'est ça!$
```
### RustboroCity_House3_Text_NamingPikachuPekachu
```
Mais surnommer PEKACHU un PIKACHU,\nça ne rime à rien.\pC'est sûrement bien d'utiliser un nom\nfacile à comprendre, mais de là à…$
```
### RustboroCity_House3_Text_Pekachu
```
PEKACHU: Peka!$
```
