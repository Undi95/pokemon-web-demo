# VerdanturfTown_Mart

## Métadonnées
- **id** : `MAP_VERDANTURF_TOWN_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_VERDANTURF_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_VERDANTURF_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `VerdanturfTown_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 5,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `VerdanturfTown_Mart_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 8,5 | `MOVEMENT_TYPE_FACE_LEFT` | `VerdanturfTown_Mart_EventScript_ExpertF` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 3,2 | `MOVEMENT_TYPE_FACE_LEFT` | `VerdanturfTown_Mart_EventScript_Lass` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_VERDANTURF_TOWN` warp #1
- #1 (4,7) → `MAP_VERDANTURF_TOWN` warp #1

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (5)
### VerdanturfTown_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart VerdanturfTown_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_Mart_Pokemart
```
pokemartlistend
```
### VerdanturfTown_Mart_EventScript_Boy
```
msgbox VerdanturfTown_Mart_Text_XSpecialIsCrucial, MSGBOX_NPC
end
```
### VerdanturfTown_Mart_EventScript_ExpertF
```
msgbox VerdanturfTown_Mart_Text_NoStrategyGuidesForBattleTent, MSGBOX_NPC
end
```
### VerdanturfTown_Mart_EventScript_Lass
```
msgbox VerdanturfTown_Mart_Text_NestBallOnWeakenedPokemon, MSGBOX_NPC
end
```

## Textes (3)
### VerdanturfTown_Mart_Text_XSpecialIsCrucial
```
Pour les combats de POKéMON, SPECIAL +\nest crucial.\pCela permet d'augmenter la puissance de\ncertaines attaques pendant un combat.$
```
### VerdanturfTown_Mart_Text_NoStrategyGuidesForBattleTent
```
Je ne trouve aucun livre de stratégie\nsur les TENTES DE COMBAT…\pPeut-être qu'il faut simplement suivre\nson instinct, après tout…$
```
### VerdanturfTown_Mart_Text_NestBallOnWeakenedPokemon
```
La FAIBLO BALL fonctionne mieux\nsur les POKéMON faibles.\pOn ne peut en acheter qu'à VERGAZON.$
```
