# DewfordTown_House2

## Métadonnées
- **id** : `MAP_DEWFORD_TOWN_HOUSE2`
- **layout** : `LAYOUT_HOUSE4`
- **music** : `MUS_DEWFORD`
- **region_map_section** : `MAPSEC_DEWFORD_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_3` | 6,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `DewfordTown_House2_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 2,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `DewfordTown_House2_EventScript_Boy` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_DEWFORD_TOWN` warp #4
- #1 (4,8) → `MAP_DEWFORD_TOWN` warp #4

## Flags référencés (1)
- `FLAG_RECEIVED_SILK_SCARF`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (4)
### DewfordTown_House2_EventScript_Man
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_SILK_SCARF, DewfordTown_House2_EventScript_ExplainSilkScarf
msgbox DewfordTown_House2_Text_WantYouToHaveSilkScarf, MSGBOX_DEFAULT
giveitem ITEM_SILK_SCARF
goto_if_eq VAR_RESULT, FALSE, DewfordTown_House2_EventScript_NoRoomForScarf
setflag FLAG_RECEIVED_SILK_SCARF
release
end
```
### DewfordTown_House2_EventScript_NoRoomForScarf
```
msgbox DewfordTown_House2_Text_NoRoom, MSGBOX_DEFAULT
release
end
```
### DewfordTown_House2_EventScript_ExplainSilkScarf
```
msgbox DewfordTown_House2_Text_ExplainSilkScarf, MSGBOX_DEFAULT
release
end
```
### DewfordTown_House2_EventScript_Boy
```
msgbox DewfordTown_House2_Text_BrawlySoCool, MSGBOX_NPC
end
```

## Textes (4)
### DewfordTown_House2_Text_WantYouToHaveSilkScarf
```
Regarde-moi cette merveille!\pC'est un MOUCH. SOIE. C'est à la pointe\nde la mode!\pOh, je vois une lueur dans tes yeux!\nMon style éblouissant te plaît!\pOh, tu me fais plaisir!\nTiens, voilà. Je te le donne!$
```
### DewfordTown_House2_Text_NoRoom
```
Oh, tu n'as plus de place?\pBon, écoute-moi bien, cet objet est\nindispensable! Il vaut bien tous les\lobjets que j'ai sur moi.$
```
### DewfordTown_House2_Text_ExplainSilkScarf
```
Le MOUCH. SOIE augmente la puissance\ndes attaques de type NORMAL.\pC'est un MOUCHOIR merveilleux assorti à\npresque tous les POKéMON!$
```
### DewfordTown_House2_Text_BrawlySoCool
```
Ouah, tu as franchi la mer pour\nvenir visiter MYOKARA?\pTu es peut-être ici parce que tu\nas entendu parler de BASTIEN?\pIl est super cool…\nTout le monde l'adore.$
```
