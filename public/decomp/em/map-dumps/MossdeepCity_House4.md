# MossdeepCity_House4

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY_HOUSE4`
- **layout** : `LAYOUT_HOUSE_WITH_BED`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 3,4 | `MOVEMENT_TYPE_FACE_LEFT` | `MossdeepCity_House4_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 6,6 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `MossdeepCity_House4_EventScript_NinjaBoy` | `0` |
| `` | `OBJ_EVENT_GFX_SKITTY` | 2,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `MossdeepCity_House4_EventScript_Skitty` | `0` |

## Warps (2)
- #0 (4,7) → `MAP_MOSSDEEP_CITY` warp #7
- #1 (3,7) → `MAP_MOSSDEEP_CITY` warp #7

## Flags référencés (1)
- `FLAG_SYS_GAME_CLEAR`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (5)
### MossdeepCity_House4_EventScript_Woman
```
lock
faceplayer
goto_if_set FLAG_SYS_GAME_CLEAR, MossdeepCity_House4_EventScript_CanBattleAtSecretBases
msgbox MossdeepCity_House4_Text_BrotherLikesToFindBases, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_House4_EventScript_CanBattleAtSecretBases
```
msgbox MossdeepCity_House4_Text_BrotherLikesToVisitBasesAndBattle, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_House4_EventScript_NinjaBoy
```
lock
faceplayer
special CheckPlayerHasSecretBase
goto_if_eq VAR_RESULT, FALSE, MossdeepCity_House4_EventScript_NoSecretBase
special GetSecretBaseNearbyMapName
msgbox MossdeepCity_House4_Text_YouMadeSecretBaseNearX, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_House4_EventScript_NoSecretBase
```
msgbox MossdeepCity_House4_Text_MakeSecretBase, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_House4_EventScript_Skitty
```
lock
faceplayer
waitse
playmoncry SPECIES_SKITTY, CRY_MODE_NORMAL
msgbox MossdeepCity_House4_Text_Skitty, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (5)
### MossdeepCity_House4_Text_BrotherLikesToFindBases
```
Mon petit frère dit qu'il aime bien\nchercher les BASES SECRETES\ldes autres.$
```
### MossdeepCity_House4_Text_BrotherLikesToVisitBasesAndBattle
```
Mon petit frère dit qu'il aime bien voir\nles BASES SECRETES des autres\let mener des combats de POKéMON.$
```
### MossdeepCity_House4_Text_YouMadeSecretBaseNearX
```
C'est toi qui as aménagé une BASE\nSECRETE {STR_VAR_1}?$
```
### MossdeepCity_House4_Text_MakeSecretBase
```
Tu devrais t'aménager une BASE SECRETE\nquelque part. J'irai la chercher!$
```
### MossdeepCity_House4_Text_Skitty
```
DELCATTY: Delcaaah?$
```
