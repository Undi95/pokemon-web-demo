# AbandonedShip_CaptainsOffice

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_CAPTAINS_OFFICE`
- **layout** : `LAYOUT_ABANDONED_SHIP_CAPTAINS_OFFICE`
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
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 3,4 | `MOVEMENT_TYPE_FACE_DOWN` | `AbandonedShip_CaptainsOffice_EventScript_CaptSternAide` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 0,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_CaptainsOffice_EventScript_ItemStorageKey` | `FLAG_ITEM_ABANDONED_SHIP_CAPTAINS_OFFICE_STORAGE_KEY` |

## Warps (2)
- #0 (7,6) → `MAP_ABANDONED_SHIP_DECK` warp #4
- #1 (8,6) → `MAP_ABANDONED_SHIP_DECK` warp #4

## Flags référencés (2)
- `FLAG_EXCHANGED_SCANNER`
- `FLAG_ITEM_ABANDONED_SHIP_HIDDEN_FLOOR_ROOM_2_SCANNER`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (3)
### AbandonedShip_CaptainsOffice_EventScript_CaptSternAide
```
lock
faceplayer
goto_if_set FLAG_EXCHANGED_SCANNER, AbandonedShip_CaptainsOffice_EventScript_ThisIsSSCactus
checkitem ITEM_SCANNER
goto_if_eq VAR_RESULT, TRUE, AbandonedShip_CaptainsOffice_EventScript_CanYouDeliverScanner
goto_if_set FLAG_ITEM_ABANDONED_SHIP_HIDDEN_FLOOR_ROOM_2_SCANNER, AbandonedShip_CaptainsOffice_EventScript_ThisIsSSCactus
msgbox AbandonedShip_CaptainsOffice_Text_NoSuccessFindingScanner, MSGBOX_DEFAULT
release
end
```
### AbandonedShip_CaptainsOffice_EventScript_CanYouDeliverScanner
```
msgbox AbandonedShip_CaptainsOffice_Text_OhCanYouDeliverScanner, MSGBOX_DEFAULT
release
end
```
### AbandonedShip_CaptainsOffice_EventScript_ThisIsSSCactus
```
msgbox AbandonedShip_CaptainsOffice_Text_ThisIsSSCactus, MSGBOX_DEFAULT
release
end
```

## Textes (3)
### AbandonedShip_CaptainsOffice_Text_NoSuccessFindingScanner
```
J'examine ce bateau pour le\nCAPT. POUPE.\pIl m'a aussi demandé de rapporter un\nSCANNER, mais je n'en ai pas trouvé…$
```
### AbandonedShip_CaptainsOffice_Text_OhCanYouDeliverScanner
```
Oh, c'est un SCANNER!\pEcoute, je peux te demander d'apporter\nça au CAPT. POUPE?\pJe voudrais continuer d'examiner ce\nbateau.$
```
### AbandonedShip_CaptainsOffice_Text_ThisIsSSCactus
```
Ce navire s'appelle LE CACTUS.\nIl semble être d'une autre époque.$
```
