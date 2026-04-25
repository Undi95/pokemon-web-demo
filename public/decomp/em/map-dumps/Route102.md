# Route102

## Métadonnées
- **id** : `MAP_ROUTE102`
- **layout** : `LAYOUT_ROUTE102`
- **music** : `MUS_ROUTE101`
- **region_map_section** : `MAPSEC_ROUTE_102`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset -10) → `MAP_PETALBURG_CITY`
- right (offset 0) → `MAP_OLDALE_TOWN`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_LITTLE_BOY` | 18,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route102_EventScript_LittleBoy` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 33,14 | `MOVEMENT_TYPE_FACE_DOWN` | `Route102_EventScript_Calvin` | `0` |
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 25,15 | `MOVEMENT_TYPE_FACE_UP` | `Route102_EventScript_Rick` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 8,7 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route102_EventScript_Tiana` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 37,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route102_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 11,15 | `MOVEMENT_TYPE_FACE_DOWN` | `Route102_EventScript_ItemPotion` | `FLAG_ITEM_ROUTE_102_POTION` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 24,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 25,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 19,4 | `MOVEMENT_TYPE_FACE_DOWN` | `Route102_EventScript_Allen` | `0` |

## BG events / signs (2)
- (17,2) [sign] → `Route102_EventScript_RouteSignPetalburg`
- (40,9) [sign] → `Route102_EventScript_RouteSignOldale`

## Flags référencés (1)
- `FLAG_HAS_MATCH_CALL`

## Variables référencées (2)
- `VAR_0x8004`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route102_Text_AllenPostBattle`
- `Route102_Text_CalvinPostBattle`
- `Route102_Text_CalvinRegister`
- `Route102_Text_CalvinRegisterShort`
- `Route102_Text_CalvinRematchPostBattle`
- `Route102_Text_RickPostBattle`
- `Route102_Text_TianaPostBattle`

## Scripts (13)
### Route102_EventScript_LittleBoy
```
msgbox Route102_Text_ImNotVeryTall, MSGBOX_NPC
end
```
### Route102_EventScript_RouteSignOldale
```
msgbox Route102_Text_RouteSignOldale, MSGBOX_SIGN
end
```
### Route102_EventScript_RouteSignPetalburg
```
msgbox Route102_Text_RouteSignPetalburg, MSGBOX_SIGN
end
```
### Route102_EventScript_Boy
```
msgbox Route102_Text_CatchWholeBunchOfPokemon, MSGBOX_NPC
end
```
### Route102_EventScript_Calvin
```
trainerbattle_single TRAINER_CALVIN_1, Route102_Text_CalvinIntro, Route102_Text_CalvinDefeated, Route102_EventScript_CalvinRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route102_EventScript_CalvinRematch
setvar VAR_0x8004, TRAINER_CALVIN_1
specialvar VAR_RESULT, IsTrainerRegistered
goto_if_eq VAR_RESULT, FALSE, Route102_EventScript_CalvinTryRegister
msgbox Route102_Text_CalvinPostBattle, MSGBOX_DEFAULT
release
end
```
### Route102_EventScript_CalvinRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
goto_if_set FLAG_HAS_MATCH_CALL, Route102_EventScript_CalvinRegisterMatchCall
release
end
```
### Route102_EventScript_CalvinRegisterMatchCall
```
msgbox Route102_Text_CalvinRegisterShort, MSGBOX_DEFAULT
register_matchcall TRAINER_CALVIN_1
release
end
```
### Route102_EventScript_CalvinTryRegister
```
goto_if_set FLAG_HAS_MATCH_CALL, Route102_EventScript_CalvinRegister
msgbox Route102_Text_CalvinPostBattle, MSGBOX_DEFAULT
release
end
```
### Route102_EventScript_CalvinRegister
```
msgbox Route102_Text_CalvinRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_CALVIN_1
release
end
```
### Route102_EventScript_CalvinRematch
```
trainerbattle_rematch TRAINER_CALVIN_1, Route102_Text_CalvinRematchIntro, Route102_Text_CalvinRematchDefeated
msgbox Route102_Text_CalvinRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route102_EventScript_Rick
```
trainerbattle_single TRAINER_RICK, Route102_Text_RickIntro, Route102_Text_RickDefeated
msgbox Route102_Text_RickPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route102_EventScript_Tiana
```
trainerbattle_single TRAINER_TIANA, Route102_Text_TianaIntro, Route102_Text_TianaDefeated
msgbox Route102_Text_TianaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route102_EventScript_Allen
```
trainerbattle_single TRAINER_ALLEN, Route102_Text_AllenIntro, Route102_Text_AllenDefeated
msgbox Route102_Text_AllenPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (7)
### Route102_Text_WatchMeCatchPokemon
```
TIMMY: {PLAYER}…\nLes POKéMON se cachent dans les hautes\lherbes comme celles-là, pas vrai?\pObserve-moi et regarde si j'arrive à en\nattraper un correctement.\p… Waouh!$
```
### Route102_Text_WallyIDidIt
```
TIMMY: J'ai réussi… C'est mon…\nMon POKéMON!$
```
### Route102_Text_LetsGoBack
```
Merci, {PLAYER}!\nRetournons à l'ARENE!$
```
### Route102_Text_ImNotVeryTall
```
Je… ne suis pas très grand, alors je\nm'enfonce dans les hautes herbes.\pL'herbe chatouille mes narines…\nAaaaaaaaaaaaaa…\pAtchoum!$
```
### Route102_Text_CatchWholeBunchOfPokemon
```
Je vais attraper tout un tas de\nPOKéMON!$
```
### Route102_Text_RouteSignOldale
```
ROUTE 102\n{RIGHT_ARROW} ROSYERES$
```
### Route102_Text_RouteSignPetalburg
```
ROUTE 102\n{LEFT_ARROW} CLEMENTI-VILLE$
```
