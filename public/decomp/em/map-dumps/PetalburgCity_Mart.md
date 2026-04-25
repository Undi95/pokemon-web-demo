# PetalburgCity_Mart

## Métadonnées
- **id** : `MAP_PETALBURG_CITY_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_PETALBURG_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_PETALBURG_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `PetalburgCity_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_1` | 9,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `PetalburgCity_Mart_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 6,3 | `MOVEMENT_TYPE_FACE_DOWN` | `PetalburgCity_Mart_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 5,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `PetalburgCity_Mart_EventScript_Woman` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_PETALBURG_CITY` warp #5
- #1 (4,7) → `MAP_PETALBURG_CITY` warp #5

## Flags référencés (1)
- `FLAG_PETALBURG_MART_EXPANDED_ITEMS`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (7)
### PetalburgCity_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
goto_if_set FLAG_PETALBURG_MART_EXPANDED_ITEMS, PetalburgCity_Mart_EventScript_ExpandedItems
pokemart PetalburgCity_Mart_Pokemart_Basic
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### PetalburgCity_Mart_Pokemart_Basic
```
pokemartlistend
```
### PetalburgCity_Mart_EventScript_ExpandedItems
```
pokemart PetalburgCity_Mart_Pokemart_Expanded
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### PetalburgCity_Mart_Pokemart_Expanded
```
pokemartlistend
```
### PetalburgCity_Mart_EventScript_Woman
```
msgbox PetalburgCity_Mart_Text_WeakWillGrowStronger, MSGBOX_NPC
end
```
### PetalburgCity_Mart_EventScript_Boy
```
msgbox PetalburgCity_Mart_Text_RepelIsUseful, MSGBOX_NPC
end
```
### PetalburgCity_Mart_EventScript_Man
```
msgbox PetalburgCity_Mart_Text_TakeSomeAntidotesWithYou, MSGBOX_NPC
end
```

## Textes (3)
### PetalburgCity_Mart_Text_WeakWillGrowStronger
```
Même si un POKéMON est faible pour\nle moment, il deviendra plus fort.\pLe plus important, c'est l'amour!\nL'amour pour tes POKéMON!$
```
### PetalburgCity_Mart_Text_RepelIsUseful
```
Utilises-tu REPOUSSE?\nÇa maintient les POKéMON éloignés.\pTrès utile quand tu veux te dépêcher!$
```
### PetalburgCity_Mart_Text_TakeSomeAntidotesWithYou
```
As-tu des ANTIDOTES avec toi?\pSi tu avances avec un POKéMON\nempoisonné, il va perdre ses PV\ljusqu'à ce qu'il soit K.O. Alors\lprends des ANTIDOTES avec toi!$
```
