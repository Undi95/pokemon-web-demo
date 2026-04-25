# RustboroCity_Flat2_2F

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_FLAT2_2F`
- **layout** : `LAYOUT_RUSTBORO_CITY_FLAT2_2F`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 11,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_Flat2_2F_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 7,3 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `RustboroCity_Flat2_2F_EventScript_NinjaBoy` | `0` |

## Warps (2)
- #0 (3,1) → `MAP_RUSTBORO_CITY_FLAT2_1F` warp #2
- #1 (1,1) → `MAP_RUSTBORO_CITY_FLAT2_3F` warp #0

## Flags référencés (1)
- `FLAG_RECEIVED_PREMIER_BALL_RUSTBORO`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (3)
### RustboroCity_Flat2_2F_EventScript_OldMan
```
msgbox RustboroCity_Flat2_2F_Text_DevonWasTinyInOldDays, MSGBOX_NPC
end
```
### RustboroCity_Flat2_2F_EventScript_NinjaBoy
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_PREMIER_BALL_RUSTBORO, RustboroCity_Flat2_2F_EventScript_GavePremierBall
msgbox RustboroCity_Flat2_2F_Text_MyDaddyMadeThisYouCanHaveIt, MSGBOX_DEFAULT
giveitem ITEM_PREMIER_BALL
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_PREMIER_BALL_RUSTBORO
release
end
```
### RustboroCity_Flat2_2F_EventScript_GavePremierBall
```
msgbox RustboroCity_Flat2_2F_Text_GoingToWorkAtDevonToo, MSGBOX_DEFAULT
release
end
```

## Textes (3)
### RustboroCity_Flat2_2F_Text_DevonWasTinyInOldDays
```
A l'époque, DEVON n'était qu'une toute\npetite, une minuscule entreprise.$
```
### RustboroCity_Flat2_2F_Text_MyDaddyMadeThisYouCanHaveIt
```
Mon papa travaille chez DEVON.\pC'est mon papa qu'a fait ça!\nMais ça m'sert pas. Tu peux l'prendre.$
```
### RustboroCity_Flat2_2F_Text_GoingToWorkAtDevonToo
```
Mon papa travaille chez DEVON.\pQuand j'serai grand, moi aussi\nj'travaillerai pour DEVON.$
```
