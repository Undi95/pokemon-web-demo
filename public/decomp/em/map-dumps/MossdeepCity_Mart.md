# MossdeepCity_Mart

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MOSSDEEP_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `MossdeepCity_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 1,5 | `MOVEMENT_TYPE_FACE_UP` | `MossdeepCity_Mart_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 8,3 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `MossdeepCity_Mart_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 5,3 | `MOVEMENT_TYPE_WANDER_AROUND` | `MossdeepCity_Mart_EventScript_Sailor` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_MOSSDEEP_CITY` warp #4
- #1 (4,7) → `MAP_MOSSDEEP_CITY` warp #4

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (5)
### MossdeepCity_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart MossdeepCity_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_Mart_Pokemart
```
pokemartlistend
```
### MossdeepCity_Mart_EventScript_Woman
```
msgbox MossdeepCity_Mart_Text_ReviveIsFantastic, MSGBOX_NPC
end
```
### MossdeepCity_Mart_EventScript_Boy
```
msgbox MossdeepCity_Mart_Text_MaxRepelLastsLongest, MSGBOX_NPC
end
```
### MossdeepCity_Mart_EventScript_Sailor
```
msgbox MossdeepCity_Mart_Text_NetAndDiveBallsRare, MSGBOX_NPC
end
```

## Textes (3)
### MossdeepCity_Mart_Text_ReviveIsFantastic
```
RAPPEL est fabuleux!\pSi tu en donnes à un POKéMON K.O.,\nil reprend connaissance.\pMais attention, RAPPEL ne restitue\npas les PP des capacités déjà utilisés.$
```
### MossdeepCity_Mart_Text_MaxRepelLastsLongest
```
MAX REPOUSSE maintient les POKéMON\nfaibles à l'écart.\pParmi tous les REPOUSSES, c'est celui\nqui dure le plus longtemps.$
```
### MossdeepCity_Mart_Text_NetAndDiveBallsRare
```
Les FILET BALLS et les SCUBA BALLS\nsont des POKé BALLS rares, qui ne\lsont fabriquées qu'à ALGATIA.\pLa FILET BALL est efficace contre les\nPOKéMON des types INSECTE et EAU.\pLa SCUBA BALL est plus efficace\ncontre les POKéMON qui vivent\lau fond de la mer.$
```
