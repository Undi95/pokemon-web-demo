# Route117

## Métadonnées
- **id** : `MAP_ROUTE117`
- **layout** : `LAYOUT_ROUTE117`
- **music** : `MUS_ROUTE110`
- **region_map_section** : `MAPSEC_ROUTE_117`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_VERDANTURF_TOWN`
- right (offset 0) → `MAP_MAUVILLE_CITY`

## Object events (24 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 13,13 | `MOVEMENT_TYPE_FACE_DOWN` | `Route117_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_LITTLE_BOY` | 25,5 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_LEFT_UP` | `Route117_EventScript_LittleBoy` | `0` |
| `LOCALID_DAYCARE_MAN` | `OBJ_EVENT_GFX_OLD_MAN` | 47,4 | `MOVEMENT_TYPE_FACE_DOWN` | `Route117_EventScript_DaycareMan` | `0` |
| `` | `OBJ_EVENT_GFX_ZIGZAGOON_2` | 33,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 39,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_AZUMARILL` | 42,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_PIKACHU` | 49,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_RUNNING_TRIATHLETE_M` | 38,16 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route117_EventScript_Dylan` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 8,10 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `Route117_EventScript_Lydia` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 33,11 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `Route117_EventScript_Isaac` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 41,13 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 42,13 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 43,13 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 16,18 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route117_EventScript_ItemGreatBall` | `FLAG_ITEM_ROUTE_117_GREAT_BALL` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 15,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 9,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route117_EventScript_ItemRevive` | `FLAG_ITEM_ROUTE_117_REVIVE` |
| `` | `OBJ_EVENT_GFX_RUNNING_TRIATHLETE_F` | 26,13 | `MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_RIGHT_DOWN` | `Route117_EventScript_Maria` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 17,12 | `MOVEMENT_TYPE_FACE_UP` | `Route117_EventScript_Derek` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 43,6 | `MOVEMENT_TYPE_FACE_DOWN` | `Route117_EventScript_Meg` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 42,6 | `MOVEMENT_TYPE_FACE_DOWN` | `Route117_EventScript_Anna` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_2` | 48,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route117_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 15,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route117_EventScript_Brandi` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 21,4 | `MOVEMENT_TYPE_FACE_LEFT` | `Route117_EventScript_Aisha` | `0` |
| `` | `OBJ_EVENT_GFX_RUNNING_TRIATHLETE_F` | 16,4 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route117_EventScript_Melina` | `0` |

## Warps (1)
- #0 (51,5) → `MAP_ROUTE117_POKEMON_DAY_CARE` warp #0

## BG events / signs (4)
- (16,6) [sign] → `Route117_EventScript_RouteSignVerdanturf`
- (49,12) [sign] → `Route117_EventScript_RouteSignMauville`
- (49,5) [sign] → `Route117_EventScript_DayCareSign`
- (3,18) [hidden_item] → ``

## Flags référencés (1)
- `FLAG_PENDING_DAYCARE_EGG`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route117_Text_AishaPostBattle`
- `Route117_Text_AnnaAndMegRegister`
- `Route117_Text_AnnaPostBattle`
- `Route117_Text_AnnaPostRematch`
- `Route117_Text_BrandiPostBattle`
- `Route117_Text_DerekPostBattle`
- `Route117_Text_DylanPostBattle`
- `Route117_Text_DylanPostRematch`
- `Route117_Text_DylanRegister`
- `Route117_Text_IsaacPostBattle`
- `Route117_Text_IsaacPostRematch`
- `Route117_Text_IsaacRegister`
- `Route117_Text_LydiaPostBattle`
- `Route117_Text_LydiaPostRematch`
- `Route117_Text_LydiaRegister`
- `Route117_Text_MariaPostBattle`
- `Route117_Text_MariaPostRematch`
- `Route117_Text_MariaRegister`
- `Route117_Text_MegPostBattle`
- `Route117_Text_MegPostRematch`
- `Route117_Text_MelinaPostBattle`

## Scripts (32)
### Route117_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route117_OnTransition
```
### Route117_OnTransition
```
call Route117_EventScript_TryMoveDayCareMan
end
```
### Route117_EventScript_TryMoveDayCareMan
```
goto_if_unset FLAG_PENDING_DAYCARE_EGG, Route117_EventScript_StopMoveDayCareMan
setobjectxyperm LOCALID_DAYCARE_MAN, 47, 6
```
### Route117_EventScript_StopMoveDayCareMan
```
return
```
### Route117_EventScript_Woman
```
msgbox Route117_Text_ArentTheseFlowersPretty, MSGBOX_NPC
end
```
### Route117_EventScript_LittleBoy
```
msgbox Route117_Text_AirIsTastyHere, MSGBOX_NPC
end
```
### Route117_EventScript_Girl
```
msgbox Route117_Text_DayCarePokemonHadNewMove, MSGBOX_NPC
end
```
### Route117_EventScript_RouteSignVerdanturf
```
msgbox Route117_Text_RouteSignVerdanturf, MSGBOX_SIGN
end
```
### Route117_EventScript_RouteSignMauville
```
msgbox Route117_Text_RouteSignMauville, MSGBOX_SIGN
end
```
### Route117_EventScript_DayCareSign
```
msgbox Route117_Text_DayCareSign, MSGBOX_SIGN
end
```
### Route117_EventScript_Isaac
```
trainerbattle_single TRAINER_ISAAC_1, Route117_Text_IsaacIntro, Route117_Text_IsaacDefeat, Route117_EventScript_RegisterIsaac
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route117_EventScript_RematchIsaac
msgbox Route117_Text_IsaacPostBattle, MSGBOX_DEFAULT
release
end
```
### Route117_EventScript_RegisterIsaac
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route117_Text_IsaacRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ISAAC_1
release
end
```
### Route117_EventScript_RematchIsaac
```
trainerbattle_rematch TRAINER_ISAAC_1, Route117_Text_IsaacRematchIntro, Route117_Text_IsaacRematchDefeat
msgbox Route117_Text_IsaacPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Lydia
```
trainerbattle_single TRAINER_LYDIA_1, Route117_Text_LydiaIntro, Route117_Text_LydiaDefeat, Route117_EventScript_RegisterLydia
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route117_EventScript_RematchLydia
msgbox Route117_Text_LydiaPostBattle, MSGBOX_DEFAULT
release
end
```
### Route117_EventScript_RegisterLydia
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route117_Text_LydiaRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_LYDIA_1
release
end
```
### Route117_EventScript_RematchLydia
```
trainerbattle_rematch TRAINER_LYDIA_1, Route117_Text_LydiaRematchIntro, Route117_Text_LydiaRematchDefeat
msgbox Route117_Text_LydiaPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Dylan
```
trainerbattle_single TRAINER_DYLAN_1, Route117_Text_DylanIntro, Route117_Text_DylanDefeat, Route117_EventScript_RegisterDylan
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route117_EventScript_RematchDylan
msgbox Route117_Text_DylanPostBattle, MSGBOX_DEFAULT
release
end
```
### Route117_EventScript_RegisterDylan
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route117_Text_DylanRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_DYLAN_1
release
end
```
### Route117_EventScript_RematchDylan
```
trainerbattle_rematch TRAINER_DYLAN_1, Route117_Text_DylanRematchIntro, Route117_Text_DylanRematchDefeat
msgbox Route117_Text_DylanPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Maria
```
trainerbattle_single TRAINER_MARIA_1, Route117_Text_MariaIntro, Route117_Text_MariaDefeat, Route117_EventScript_RegisterMaria
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route117_EventScript_RematchMaria
msgbox Route117_Text_MariaPostBattle, MSGBOX_DEFAULT
release
end
```
### Route117_EventScript_RegisterMaria
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route117_Text_MariaRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_MARIA_1
release
end
```
### Route117_EventScript_RematchMaria
```
trainerbattle_rematch TRAINER_MARIA_1, Route117_Text_MariaRematchIntro, Route117_Text_MariaRematchDefeat
msgbox Route117_Text_MariaPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Derek
```
trainerbattle_single TRAINER_DEREK, Route117_Text_DerekIntro, Route117_Text_DerekDefeat
msgbox Route117_Text_DerekPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Anna
```
trainerbattle_double TRAINER_ANNA_AND_MEG_1, Route117_Text_AnnaIntro, Route117_Text_AnnaDefeat, Route117_Text_AnnaNotEnoughMons, Route117_EventScript_RegisterAnna
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route117_EventScript_RematchAnna
msgbox Route117_Text_AnnaPostBattle, MSGBOX_DEFAULT
release
end
```
### Route117_EventScript_RegisterAnna
```
msgbox Route117_Text_AnnaAndMegRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ANNA_AND_MEG_1
release
end
```
### Route117_EventScript_RematchAnna
```
trainerbattle_rematch_double TRAINER_ANNA_AND_MEG_1, Route117_Text_AnnaRematchIntro, Route117_Text_AnnaRematchDefeat, Route117_Text_AnnaRematchNotEnoughMons
msgbox Route117_Text_AnnaPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Meg
```
trainerbattle_double TRAINER_ANNA_AND_MEG_1, Route117_Text_MegIntro, Route117_Text_MegDefeat, Route117_Text_MegNotEnoughMons, Route117_EventScript_RegisterMeg
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route117_EventScript_RematchMeg
msgbox Route117_Text_MegPostBattle, MSGBOX_DEFAULT
release
end
```
### Route117_EventScript_RegisterMeg
```
msgbox Route117_Text_AnnaAndMegRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ANNA_AND_MEG_1
release
end
```
### Route117_EventScript_RematchMeg
```
trainerbattle_rematch_double TRAINER_ANNA_AND_MEG_1, Route117_Text_MegRematchIntro, Route117_Text_MegRematchDefeat, Route117_Text_MegRematchNotEnoughMons
msgbox Route117_Text_MegPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Melina
```
trainerbattle_single TRAINER_MELINA, Route117_Text_MelinaIntro, Route117_Text_MelinaDefeat
msgbox Route117_Text_MelinaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Brandi
```
trainerbattle_single TRAINER_BRANDI, Route117_Text_BrandiIntro, Route117_Text_BrandiDefeat
msgbox Route117_Text_BrandiPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route117_EventScript_Aisha
```
trainerbattle_single TRAINER_AISHA, Route117_Text_AishaIntro, Route117_Text_AishaDefeat
msgbox Route117_Text_AishaPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### Route117_Text_DayCarePokemonHadNewMove
```
J'ai laissé mon POKéMON à la PENSION.\pQuand je l'ai récupéré, il avait appris\nune nouvelle capacité.\lJ'étais vraiment très surprise.$
```
### Route117_Text_ArentTheseFlowersPretty
```
Qu'en penses-tu? Ces fleurs ne\nsont-elles pas magnifiques?\pJe les ai toutes plantées moi-même!$
```
### Route117_Text_AirIsTastyHere
```
L'air embaume ici!$
```
### Route117_Text_RouteSignVerdanturf
```
ROUTE 117\n{LEFT_ARROW} VERGAZON$
```
### Route117_Text_RouteSignMauville
```
ROUTE 117\n{RIGHT_ARROW} LAVANDIA$
```
### Route117_Text_DayCareSign
```
PENSION POKéMON\n“Nous élevons vos POKéMON!”$
```
