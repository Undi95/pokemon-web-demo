# Route113

## Métadonnées
- **id** : `MAP_ROUTE113`
- **layout** : `LAYOUT_ROUTE113`
- **music** : `MUS_ROUTE113`
- **region_map_section** : `MAPSEC_ROUTE_113`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset 60) → `MAP_ROUTE112`
- left (offset 0) → `MAP_FALLARBOR_TOWN`
- right (offset 0) → `MAP_ROUTE111`

## Object events (16 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 66,12 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `Route113_EventScript_NinjaBoy` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 36,10 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `Route113_EventScript_Gentleman` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 62,8 | `MOVEMENT_TYPE_FACE_DOWN` | `Route113_EventScript_Jaylen` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 21,11 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `Route113_EventScript_Dillon` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 51,11 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `Route113_EventScript_Madeline` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 53,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route113_EventScript_ItemMaxEther` | `FLAG_ITEM_ROUTE_113_MAX_ETHER` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 79,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route113_EventScript_ItemSuperRepel` | `FLAG_ITEM_ROUTE_113_SUPER_REPEL` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 29,6 | `MOVEMENT_TYPE_BURIED` | `Route113_EventScript_Lao` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 71,2 | `MOVEMENT_TYPE_BURIED` | `Route113_EventScript_Lung` | `0` |
| `` | `OBJ_EVENT_GFX_TWIN` | 45,6 | `MOVEMENT_TYPE_FACE_DOWN` | `Route113_EventScript_Tori` | `0` |
| `` | `OBJ_EVENT_GFX_TWIN` | 46,6 | `MOVEMENT_TYPE_FACE_DOWN` | `Route113_EventScript_Tia` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 15,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route113_EventScript_ItemHyperPotion` | `FLAG_ITEM_ROUTE_113_HYPER_POTION` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 75,3 | `MOVEMENT_TYPE_FACE_LEFT` | `Route113_EventScript_Wyatt` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 71,4 | `MOVEMENT_TYPE_FACE_UP` | `Route113_EventScript_Lawrence` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 7,6 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route113_EventScript_Sophie` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 7,13 | `MOVEMENT_TYPE_WALK_UP_AND_DOWN` | `Route113_EventScript_Coby` | `0` |

## Warps (3)
- #0 (33,5) → `MAP_ROUTE113_GLASS_WORKSHOP` warp #0
- #1 (41,12) → `MAP_TERRA_CAVE_ENTRANCE` warp #0
- #2 (88,5) → `MAP_TERRA_CAVE_ENTRANCE` warp #0

## Coord events / triggers (19)
- (19,11) → ``
- (19,10) → ``
- (19,12) → ``
- (19,13) → ``
- (86,9) → ``
- (85,10) → ``
- (85,11) → ``
- (14,10) → ``
- (14,11) → ``
- (14,12) → ``
- (14,13) → ``
- (94,8) → ``
- (94,9) → ``
- (94,10) → ``
- (94,11) → ``
- (19,14) → ``
- (87,8) → ``
- (87,6) → ``
- (87,7) → ``

## BG events / signs (8)
- (85,6) [sign] → `Route113_EventScript_RouteSign111`
- (12,9) [sign] → `Route113_EventScript_RouteSignFallarbor`
- (58,4) [sign] → `Route113_EventScript_TrainerTipsRegisterKeyItems`
- (31,5) [sign] → `Route113_EventScript_GlassWorkshopSign`
- (49,8) [secret_base] → ``
- (66,3) [hidden_item] → ``
- (22,5) [hidden_item] → ``
- (73,3) [hidden_item] → ``

## Flags référencés (1)
- `FLAG_FORCE_MIRAGE_TOWER_VISIBLE`

## Variables référencées (3)
- `VAR_RESULT`
- `VAR_TEMP_0`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route113_Text_CobyPostBattle`
- `Route113_Text_DillonPostBattle`
- `Route113_Text_JaylenPostBattle`
- `Route113_Text_LaoPostBattle`
- `Route113_Text_LaoPostRematch`
- `Route113_Text_LaoRegister`
- `Route113_Text_LawrencePostBattle`
- `Route113_Text_LungPostBattle`
- `Route113_Text_MadelinePostBattle`
- `Route113_Text_MadelinePostRematch`
- `Route113_Text_MadelineRegister`
- `Route113_Text_SophiePostBattle`
- `Route113_Text_TiaPostBattle`
- `Route113_Text_ToriPostBattle`
- `Route113_Text_WyattPostBattle`

## Scripts (26)
### Route113_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Route113_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Route113_OnTransition
```
### Route113_OnResume
```
setstepcallback STEP_CB_ASH
end
```
### Route113_OnTransition
```
clearflag FLAG_FORCE_MIRAGE_TOWER_VISIBLE
call Route113_EventScript_CheckSetAshWeather
end
```
### Route113_EventScript_CheckSetAshWeather
```
getplayerxy VAR_TEMP_0, VAR_TEMP_1
goto_if_lt VAR_TEMP_0, 19, Route113_EventScript_DontSetAshWeather
goto_if_gt VAR_TEMP_0, 84, Route113_EventScript_DontSetAshWeather
setweather WEATHER_VOLCANIC_ASH
return
```
### Route113_EventScript_DontSetAshWeather
```
return
```
### Route113_EventScript_Gentleman
```
msgbox Route113_Text_AshCanBeFashionedIntoGlass, MSGBOX_NPC
end
```
### Route113_EventScript_NinjaBoy
```
msgbox Route113_Text_FunWalkingThroughAsh, MSGBOX_NPC
end
```
### Route113_EventScript_RouteSign111
```
msgbox Route113_Text_RouteSign111, MSGBOX_SIGN
end
```
### Route113_EventScript_RouteSignFallarbor
```
msgbox Route113_Text_RouteSignFallarbor, MSGBOX_SIGN
end
```
### Route113_EventScript_GlassWorkshopSign
```
msgbox Route113_Text_GlassWorkshopSign, MSGBOX_SIGN
end
```
### Route113_EventScript_TrainerTipsRegisterKeyItems
```
msgbox Route113_Text_TrainerTipsRegisterKeyItems, MSGBOX_SIGN
end
```
### Route113_EventScript_Jaylen
```
trainerbattle_single TRAINER_JAYLEN, Route113_Text_JaylenIntro, Route113_Text_JaylenDefeat
msgbox Route113_Text_JaylenPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Dillon
```
trainerbattle_single TRAINER_DILLON, Route113_Text_DillonIntro, Route113_Text_DillonDefeat
msgbox Route113_Text_DillonPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Madeline
```
trainerbattle_single TRAINER_MADELINE_1, Route113_Text_MadelineIntro, Route113_Text_MadelineDefeat, Route113_EventScript_RegisterMadeline
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route113_EventScript_RematchMadeline
msgbox Route113_Text_MadelinePostBattle, MSGBOX_DEFAULT
release
end
```
### Route113_EventScript_RegisterMadeline
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route113_Text_MadelineRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_MADELINE_1
release
end
```
### Route113_EventScript_RematchMadeline
```
trainerbattle_rematch TRAINER_MADELINE_1, Route113_Text_MadelineRematchIntro, Route113_Text_MadelineRematchDefeat
msgbox Route113_Text_MadelinePostRematch, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Lao
```
trainerbattle_single TRAINER_LAO_1, Route113_Text_LaoIntro, Route113_Text_LaoDefeat, Route113_EventScript_RegisterLao
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route113_EventScript_RematchLao
msgbox Route113_Text_LaoPostBattle, MSGBOX_DEFAULT
release
end
```
### Route113_EventScript_RegisterLao
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route113_Text_LaoRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_LAO_1
release
end
```
### Route113_EventScript_RematchLao
```
trainerbattle_rematch TRAINER_LAO_1, Route113_Text_LaoRematchIntro, Route113_Text_LaoRematchDefeat
msgbox Route113_Text_LaoPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Lung
```
trainerbattle_single TRAINER_LUNG, Route113_Text_LungIntro, Route113_Text_LungDefeat
msgbox Route113_Text_LungPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Tori
```
trainerbattle_double TRAINER_TORI_AND_TIA, Route113_Text_ToriIntro, Route113_Text_ToriDefeat, Route113_Text_ToriNotEnoughMons
msgbox Route113_Text_ToriPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Tia
```
trainerbattle_double TRAINER_TORI_AND_TIA, Route113_Text_TiaIntro, Route113_Text_TiaDefeat, Route113_Text_TiaNotEnoughMons
msgbox Route113_Text_TiaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Sophie
```
trainerbattle_single TRAINER_SOPHIE, Route113_Text_SophieIntro, Route113_Text_SophieDefeat
msgbox Route113_Text_SophiePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Coby
```
trainerbattle_single TRAINER_COBY, Route113_Text_CobyIntro, Route113_Text_CobyDefeat
msgbox Route113_Text_CobyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Lawrence
```
trainerbattle_single TRAINER_LAWRENCE, Route113_Text_LawrenceIntro, Route113_Text_LawrenceDefeat
msgbox Route113_Text_LawrencePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route113_EventScript_Wyatt
```
trainerbattle_single TRAINER_WYATT, Route113_Text_WyattIntro, Route113_Text_WyattDefeat
msgbox Route113_Text_WyattPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### Route113_Text_AshCanBeFashionedIntoGlass
```
Waaaah! Quelle merveille la technologie\nd'aujourd'hui!\pPrends ces cendres volcaniques.\nOn peut en faire des objets en verre.$
```
### Route113_Text_FunWalkingThroughAsh
```
C'est drôle de marcher dans les cendres\nvolcaniques sur le sol et dans l'herbe.\pTu peux voir où tu as marché. C'est\ntrop fort!$
```
### Route113_Text_RouteSign111
```
ROUTE 113\n{RIGHT_ARROW} ROUTE 111$
```
### Route113_Text_RouteSignFallarbor
```
ROUTE 113\n{LEFT_ARROW} AUTEQUIA$
```
### Route113_Text_TrainerTipsRegisterKeyItems
```
CONSEILS AUX DRESSEURS\pVous pouvez enregistrer un des OBJETS\nRARES de votre SAC comme fonction\ldu bouton SELECT.\pIl suffit d'appuyer sur SELECT pour\nutiliser l'objet enregistré à votre gré.$
```
### Route113_Text_GlassWorkshopSign
```
ATELIER DU VERRE\n“Ici, on transforme les cendres\lvolcaniques en objets en verre!”$
```
