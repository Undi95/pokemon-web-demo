# JaggedPass

## Métadonnées
- **id** : `MAP_JAGGED_PASS`
- **layout** : `LAYOUT_JAGGED_PASS`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_JAGGED_PASS`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_HIKER` | 10,8 | `MOVEMENT_TYPE_FACE_RIGHT` | `JaggedPass_EventScript_Eric` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 16,35 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `JaggedPass_EventScript_Ethan` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 23,24 | `MOVEMENT_TYPE_LOOK_AROUND` | `JaggedPass_EventScript_ItemBurnHeal` | `FLAG_ITEM_JAGGED_PASS_BURN_HEAL` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 9,21 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `JaggedPass_EventScript_Diana` | `0` |
| `LOCALID_MAGMA_HIDEOUT_GUARD` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 16,19 | `MOVEMENT_TYPE_FACE_UP` | `JaggedPass_EventScript_MagmaHideoutGuard` | `FLAG_HIDE_JAGGED_PASS_MAGMA_GUARD` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 14,25 | `MOVEMENT_TYPE_FACE_RIGHT` | `JaggedPass_EventScript_Autumn` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M` | 18,25 | `MOVEMENT_TYPE_FACE_LEFT` | `JaggedPass_EventScript_Julio` | `0` |

## Warps (5)
- #0 (14,40) → `MAP_ROUTE112` warp #2
- #1 (15,40) → `MAP_ROUTE112` warp #3
- #2 (13,5) → `MAP_MT_CHIMNEY` warp #2
- #3 (14,5) → `MAP_MT_CHIMNEY` warp #3
- #4 (16,18) → `MAP_MAGMA_HIDEOUT_1F` warp #0

## Coord events / triggers (10)
- (13,15) → ``
- (21,12) → ``
- (14,15) → ``
- (18,17) → ``
- (22,19) → ``
- (21,15) → `JaggedPass_EventScript_OpenMagmaHideout` (si `VAR_JAGGED_PASS_STATE` == `1`)
- (22,20) → `JaggedPass_EventScript_OpenMagmaHideout` (si `VAR_JAGGED_PASS_STATE` == `1`)
- (21,20) → `JaggedPass_EventScript_OpenMagmaHideout` (si `VAR_JAGGED_PASS_STATE` == `1`)
- (14,15) → `JaggedPass_EventScript_OpenMagmaHideout` (si `VAR_JAGGED_PASS_STATE` == `1`)
- (13,15) → `JaggedPass_EventScript_OpenMagmaHideout` (si `VAR_JAGGED_PASS_STATE` == `1`)

## BG events / signs (2)
- (8,10) [hidden_item] → ``
- (7,29) [hidden_item] → ``

## Flags référencés (1)
- `FLAG_BEAT_MAGMA_GRUNT_JAGGED_PASS`

## Variables référencées (7)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_0x8007`
- `VAR_JAGGED_PASS_ASH_WEATHER`
- `VAR_JAGGED_PASS_STATE`
- `VAR_RESULT`

## Scripts (20)
### JaggedPass_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, JaggedPass_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, JaggedPass_OnTransition
map_script MAP_SCRIPT_ON_LOAD, JaggedPass_OnLoad
```
### JaggedPass_OnResume
```
setstepcallback STEP_CB_ASH
call_if_eq VAR_JAGGED_PASS_STATE, 0, JaggedPass_EventScript_CheckHasMagmaEmblem
end
```
### JaggedPass_EventScript_CheckHasMagmaEmblem
```
checkitem ITEM_MAGMA_EMBLEM
goto_if_eq VAR_RESULT, TRUE, JaggedPass_EventScript_SetReadyToOpenHideout
return
```
### JaggedPass_EventScript_SetReadyToOpenHideout
```
setvar VAR_JAGGED_PASS_STATE, 1
return
```
### JaggedPass_OnTransition
```
call_if_eq VAR_JAGGED_PASS_ASH_WEATHER, 1, JaggedPass_EventScript_SetWeatherAsh
end
```
### JaggedPass_EventScript_SetWeatherAsh
```
setweather WEATHER_VOLCANIC_ASH
doweather
return
```
### JaggedPass_OnLoad
```
goto_if_le VAR_JAGGED_PASS_STATE, 1, JaggedPass_EventScript_ConcealHideoutEntrance
end
```
### JaggedPass_EventScript_ConcealHideoutEntrance
```
setmetatile 16, 17, METATILE_Lavaridge_RockWall, TRUE
setmetatile 16, 18, METATILE_Lavaridge_RockWall, TRUE
end
```
### JaggedPass_EventScript_OpenMagmaHideout
```
lockall
setvar VAR_0x8004, 1  @ vertical pan
setvar VAR_0x8005, 1  @ horizontal pan
setvar VAR_0x8006, 8  @ num shakes
setvar VAR_0x8007, 5  @ shake delay
special ShakeCamera
waitstate
msgbox JaggedPass_Text_BoulderShakingInResponseToEmblem, MSGBOX_DEFAULT
closemessage
setvar VAR_0x8004, 1   @ vertical pan
setvar VAR_0x8005, 1   @ horizontal pan
setvar VAR_0x8006, 16  @ num shakes
setvar VAR_0x8007, 3   @ shake delay
special ShakeCamera
waitstate
playse SE_EFFECTIVE
setmetatile 16, 17, METATILE_Lavaridge_CaveEntrance_Top, TRUE
setmetatile 16, 18, METATILE_Lavaridge_CaveEntrance_Bottom, FALSE
special DrawWholeMapView
delay 30
setvar VAR_JAGGED_PASS_STATE, 2
waitse
releaseall
end
```
### JaggedPass_EventScript_MagmaHideoutGuard
```
lockall
goto_if_set FLAG_BEAT_MAGMA_GRUNT_JAGGED_PASS, JaggedPass_EventScript_GuardDefeated
waitse
playse SE_PIN
applymovement LOCALID_MAGMA_HIDEOUT_GUARD, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_MAGMA_HIDEOUT_GUARD, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_MAGMA_HIDEOUT_GUARD, Common_Movement_FacePlayer
waitmovement 0
msgbox JaggedPass_Text_GruntIntro, MSGBOX_DEFAULT
closemessage
trainerbattle_no_intro TRAINER_GRUNT_JAGGED_PASS, JaggedPass_Text_GruntDefeat
setflag FLAG_BEAT_MAGMA_GRUNT_JAGGED_PASS
applymovement LOCALID_MAGMA_HIDEOUT_GUARD, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### JaggedPass_EventScript_GuardDefeated
```
applymovement LOCALID_MAGMA_HIDEOUT_GUARD, Common_Movement_FacePlayer
waitmovement 0
msgbox JaggedPass_Text_GoWhereverYouWant, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_MAGMA_HIDEOUT_GUARD, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### JaggedPass_EventScript_Eric
```
trainerbattle_single TRAINER_ERIC, JaggedPass_Text_EricIntro, JaggedPass_Text_EricDefeat
msgbox JaggedPass_Text_EricPostBattle, MSGBOX_AUTOCLOSE
end
```
### JaggedPass_EventScript_Diana
```
trainerbattle_single TRAINER_DIANA_1, JaggedPass_Text_DianaIntro, JaggedPass_Text_DianaDefeat, JaggedPass_EventScript_RegisterDiana
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, JaggedPass_EventScript_DianaRematch
msgbox JaggedPass_Text_DianaPostBattle, MSGBOX_DEFAULT
release
end
```
### JaggedPass_EventScript_RegisterDiana
```
special PlayerFaceTrainerAfterBattle
msgbox JaggedPass_Text_DianaRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_DIANA_1
release
end
```
### JaggedPass_EventScript_DianaRematch
```
trainerbattle_rematch TRAINER_DIANA_1, JaggedPass_Text_DianaRematchIntro, JaggedPass_Text_DianaRematchDefeat
msgbox JaggedPass_Text_DianaPostRematch, MSGBOX_AUTOCLOSE
end
```
### JaggedPass_EventScript_Ethan
```
trainerbattle_single TRAINER_ETHAN_1, JaggedPass_Text_EthanIntro, JaggedPass_Text_EthanDefeat, JaggedPass_EventScript_RegisterEthan
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, JaggedPass_EventScript_EthanRematch
msgbox JaggedPass_Text_EthanPostBattle, MSGBOX_DEFAULT
release
end
```
### JaggedPass_EventScript_RegisterEthan
```
special PlayerFaceTrainerAfterBattle
msgbox JaggedPass_Text_EthanRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ETHAN_1
release
end
```
### JaggedPass_EventScript_EthanRematch
```
trainerbattle_rematch TRAINER_ETHAN_1, JaggedPass_Text_EthanRematchIntro, JaggedPass_Text_EthanRematchDefeat
msgbox JaggedPass_Text_EthanPostRematch, MSGBOX_AUTOCLOSE
end
```
### JaggedPass_EventScript_Julio
```
trainerbattle_single TRAINER_JULIO, JaggedPass_Text_JulioIntro, JaggedPass_Text_JulioDefeat
msgbox JaggedPass_Text_JulioPostBattle, MSGBOX_AUTOCLOSE
end
```
### JaggedPass_EventScript_Autumn
```
trainerbattle_single TRAINER_AUTUMN, JaggedPass_Text_AutumnIntro, JaggedPass_Text_AutumnDefeat
msgbox JaggedPass_Text_AutumnPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (27)
### JaggedPass_Text_EricIntro
```
Le SENTIER SINUROC du MONT CHIMNEE…\pJ'ai toujours rêvé d'un endroit pareil…\pCe relief accidenté…\nJ'adore ça!$
```
### JaggedPass_Text_EricDefeat
```
La défaite me laisse amer!$
```
### JaggedPass_Text_EricPostBattle
```
Oui, je peux perdre avec les POKéMON…\pMais s'il s'agissait de notre amour pour\nla montagne, je te battrais!$
```
### JaggedPass_Text_DianaIntro
```
Tu n'te promènes pas ici par hasard.\nT'es pas là pour pique-niquer!$
```
### JaggedPass_Text_DianaDefeat
```
Oooh, non!\nCe sol est trop bosselé…$
```
### JaggedPass_Text_DianaPostBattle
```
Tu savais ça?\pLes plus habiles utilisent leur VELO\npour passer ce col très accidenté.$
```
### JaggedPass_Text_DianaRegister
```
Tu reviendras un jour par ici?\nSi c'est le cas, j'aimerais bien\lrefaire un match avec toi.$
```
### JaggedPass_Text_DianaRematchIntro
```
Un pique-nique, c'est toujours sympa.\nExactement comme les POKéMON!$
```
### JaggedPass_Text_DianaRematchDefeat
```
Si j'ai perdu, c'est juste à cause de ce\nsol trop bosselé!$
```
### JaggedPass_Text_DianaPostRematch
```
Je vais oublier ma défaite et apprécier\ncette randonnée à travers les bosses.$
```
### JaggedPass_Text_EthanIntro
```
C'est dur de marcher sur le SENTIER\nSINUROC.\pMais c'est super pour s'entraîner!$
```
### JaggedPass_Text_EthanDefeat
```
On essayait encore de trouver une\nbonne prise, alors que tout était\ldéjà terminé.$
```
### JaggedPass_Text_EthanPostBattle
```
Si j'avais un VELO CROSS, je pourrais\nsauter sur ces rebords rocheux.$
```
### JaggedPass_Text_EthanRegister
```
J'arriverai à te battre quand je me\nserai habitué à ces bosses!\pTu peux m'enregistrer dans ton\nPOKéNAV?$
```
### JaggedPass_Text_EthanRematchIntro
```
Je suis habitué à toutes ces bosses.\nMaintenant, je chante en grimpant.$
```
### JaggedPass_Text_EthanRematchDefeat
```
C'est quand même pas facile de se\nbattre sur ce sol tout bosselé…$
```
### JaggedPass_Text_EthanPostRematch
```
Il faudrait que j'aille à LAVANDIA pour\nque RODOLPHE me donne un VELO CROSS.$
```
### JaggedPass_Text_GruntIntro
```
Quoi?\nQu'est-ce que tu fais là?\pQu'est-ce que je fais dans un endroit\npareil?\pÇa te regarde?$
```
### JaggedPass_Text_GruntDefeat
```
Urrrgh…\pJ'aurais dû rester caché dans la\nPLANQUE…$
```
### JaggedPass_Text_GoWhereverYouWant
```
OK, OK…\nJe dois l'avouer, tu sais te battre!\pNe t'inquiète pas pour moi. Tu peux\naller où tu veux!$
```
### JaggedPass_Text_BoulderShakingInResponseToEmblem
```
Oh! Ce rocher semble réagir à la\nprésence du SCEAU MAGMA!$
```
### JaggedPass_Text_JulioIntro
```
Ça fait super peur de descendre la\nmontagne d'un coup!$
```
### JaggedPass_Text_JulioDefeat
```
J'ai l'impression de tomber en morceaux…$
```
### JaggedPass_Text_JulioPostBattle
```
Mon vélo s'est pris tellement de bosses\nque je ne sens plus mon dos.$
```
### JaggedPass_Text_AutumnIntro
```
Je gravis cette colline chaque jour.\nJ'ai confiance en ma force!$
```
### JaggedPass_Text_AutumnDefeat
```
Hum…\nQu'est-ce qui s'est passé?$
```
### JaggedPass_Text_AutumnPostBattle
```
Est-ce que tu sais ce qu'est cette\nétrange avancée rocheuse un peu\lplus loin?$
```
