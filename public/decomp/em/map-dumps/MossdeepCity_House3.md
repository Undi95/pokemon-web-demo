# MossdeepCity_House3

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY_HOUSE3`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 4,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `MossdeepCity_House3_EventScript_SuperRodFisherman` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_MOSSDEEP_CITY` warp #5
- #1 (4,7) → `MAP_MOSSDEEP_CITY` warp #5

## Flags référencés (1)
- `FLAG_RECEIVED_SUPER_ROD`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (3)
### MossdeepCity_House3_EventScript_SuperRodFisherman
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_SUPER_ROD, MossdeepCity_House3_EventScript_ReceivedSuperRod
msgbox MossdeepCity_House3_Text_YouWantSuperRod, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MossdeepCity_House3_EventScript_DeclineSuperRod
msgbox MossdeepCity_House3_Text_SuperRodIsSuper, MSGBOX_DEFAULT
giveitem ITEM_SUPER_ROD
setflag FLAG_RECEIVED_SUPER_ROD
msgbox MossdeepCity_House3_Text_TryDroppingRodInWater, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_House3_EventScript_ReceivedSuperRod
```
msgbox MossdeepCity_House3_Text_GoAfterSeafloorPokemon, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_House3_EventScript_DeclineSuperRod
```
msgbox MossdeepCity_House3_Text_DontYouLikeToFish, MSGBOX_DEFAULT
release
end
```

## Textes (5)
### MossdeepCity_House3_Text_YouWantSuperRod
```
Hé, toi, DRESSEUR!\nUne MEGA CANNE, c'est vraiment super!\pTu peux dire c'que tu veux, ce bébé peut\nattraper des POKéMON au fond de la mer!\pQu'est-ce que t'en penses?\nTu veux qu'on essaie, hein?$
```
### MossdeepCity_House3_Text_SuperRodIsSuper
```
Tu paries, tu paries! Après tout, une\nMEGA CANNE, c'est super!$
```
### MossdeepCity_House3_Text_TryDroppingRodInWater
```
S'il y a de l'eau, essaie de lancer ta\nCANNE et attends de voir si ça mord!$
```
### MossdeepCity_House3_Text_DontYouLikeToFish
```
Hum?\nT'aimes pas pêcher?$
```
### MossdeepCity_House3_Text_GoAfterSeafloorPokemon
```
Essaie d'attraper les POKéMON au fond\nde la mer avec ta MEGA CANNE.$
```
