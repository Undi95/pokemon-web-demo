# MauvilleCity_House1

## Métadonnées
- **id** : `MAP_MAUVILLE_CITY_HOUSE1`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MAUVILLE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 4,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `MauvilleCity_House1_EventScript_RockSmashDude` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_MAUVILLE_CITY` warp #4
- #1 (4,7) → `MAP_MAUVILLE_CITY` warp #4

## Flags référencés (2)
- `FLAG_HIDE_ROUTE_111_ROCK_SMASH_TIP_GUY`
- `FLAG_RECEIVED_HM_ROCK_SMASH`

## Scripts (2)
### MauvilleCity_House1_EventScript_RockSmashDude
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_HM_ROCK_SMASH, MauvilleCity_House1_EventScript_ReceivedRockSmash
msgbox MauvilleCity_House1_Text_ImRockSmashDudeTakeThis, MSGBOX_DEFAULT
giveitem ITEM_HM_ROCK_SMASH
setflag FLAG_RECEIVED_HM_ROCK_SMASH
setflag FLAG_HIDE_ROUTE_111_ROCK_SMASH_TIP_GUY
msgbox MauvilleCity_House1_Text_ExplainRockSmash, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_House1_EventScript_ReceivedRockSmash
```
msgbox MauvilleCity_House1_Text_MonCanFlyOutOfSmashedRock, MSGBOX_DEFAULT
release
end
```

## Textes (3)
### MauvilleCity_House1_Text_ImRockSmashDudeTakeThis
```
Woahou!\pLes gens m'appellent le TYPE\nECLATE-ROC, mais je n'aime pas trop ça.\pJe crois que je mérite un surnom\nplus flatteur, comme le MEC\lECLATE-ROC par exemple.\pWoahou!\pQuoi qu'il en soit, ton POKéMON semble\nplutôt fort.\pJ'aime ça!\nTiens, prends cette CS!$
```
### MauvilleCity_House1_Text_ExplainRockSmash
```
Cette CS contient ECLATE-ROC.\pSi tu te trouves face à de gros blocs\nde pierre bloquant le passage…\pEh bien, utilise l'attaque de cette CS\net pulvérise-les!\pOuaip! Eclate-les carrément!\nWoahou!$
```
### MauvilleCity_House1_Text_MonCanFlyOutOfSmashedRock
```
Ah, oui! Si tu détruis une pierre,\nun POKéMON peut en surgir.\pWoahou!$
```
