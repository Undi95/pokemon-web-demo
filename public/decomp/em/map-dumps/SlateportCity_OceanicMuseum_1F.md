# SlateportCity_OceanicMuseum_1F

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_OCEANIC_MUSEUM_1F`
- **layout** : `LAYOUT_SLATEPORT_CITY_OCEANIC_MUSEUM_1F`
- **music** : `MUS_OCEANIC_MUSEUM`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (14 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BEAUTY` | 7,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_OceanicMuseum_1F_EventScript_EntranceAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 18,5 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt3` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 12,2 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt4` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 2,8 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt2` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_F` | 3,4 | `MOVEMENT_TYPE_FACE_LEFT` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt1` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 14,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt5` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 12,7 | `MOVEMENT_TYPE_FACE_LEFT` | `SlateportCity_OceanicMuseum_1F_EventScript_EntranceAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 8,3 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt6` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 4,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron1` | `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 10,2 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron2` | `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 17,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron3` | `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION` |
| `` | `OBJ_EVENT_GFX_LITTLE_GIRL` | 18,8 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron4` | `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION` |
| `LOCALID_OCEANIC_MUSEUM_FAMILIAR_GRUNT` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 9,4 | `MOVEMENT_TYPE_FACE_UP_LEFT_AND_RIGHT` | `SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGrunt` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_FAMILIAR_AQUA_GRUNT` |
| `` | `OBJ_EVENT_GFX_REPORTER_M` | 7,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `SlateportCity_OceanicMuseum_1F_EventScript_Reporter` | `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION` |

## Warps (3)
- #0 (9,8) → `MAP_SLATEPORT_CITY` warp #5
- #1 (10,8) → `MAP_SLATEPORT_CITY` warp #7
- #2 (6,1) → `MAP_SLATEPORT_CITY_OCEANIC_MUSEUM_2F` warp #0

## Coord events / triggers (2)
- (9,7) → `SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeLeft` (si `VAR_SLATEPORT_MUSEUM_1F_STATE` == `0`)
- (10,7) → `SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeRight` (si `VAR_SLATEPORT_MUSEUM_1F_STATE` == `0`)

## BG events / signs (13)
- (2,7) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_WhirlpoolExperiment`
- (2,4) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_WaterfallExperiment`
- (9,1) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_OceanSoilDisplay`
- (12,1) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_BeachSandDisplay`
- (10,1) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_OceanSoilDisplay`
- (13,1) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_BeachSandDisplay`
- (15,4) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact1`
- (18,4) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact2`
- (18,7) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact3`
- (2,1) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_FossilDisplay`
- (3,1) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_FossilDisplay`
- (16,1) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_DepthMeasuringMachine`
- (17,1) [sign] → `SlateportCity_OceanicMuseum_1F_EventScript_DepthMeasuringMachine`

## Flags référencés (3)
- `FLAG_DELIVERED_DEVON_GOODS`
- `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_FAMILIAR_AQUA_GRUNT`
- `FLAG_RECEIVED_TM_THIEF`

## Variables référencées (3)
- `VAR_FACING`
- `VAR_RESULT`
- `VAR_SLATEPORT_MUSEUM_1F_STATE`

## Scripts (37)
### SlateportCity_OceanicMuseum_1F_EventScript_EntranceAttendant
```
msgbox SlateportCity_OceanicMuseum_1F_Text_PleaseEnjoyYourself, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeLeft
```
lockall
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
goto SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFee
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeRight
```
lockall
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
goto SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFee
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFee
```
showmoneybox 0, 0
msgbox SlateportCity_OceanicMuseum_1F_Text_WouldYouLikeToEnter, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, SlateportCity_OceanicMuseum_1F_EventScript_CheckMoneyForFee
closemessage
hidemoneybox
applymovement LOCALID_PLAYER, SlateportCity_OceanicMuseum_1F_Movement_PushPlayerBackFromCounter
waitmovement 0
releaseall
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_CheckMoneyForFee
```
checkmoney 50
goto_if_eq VAR_RESULT, FALSE, SlateportCity_OceanicMuseum_1F_EventScript_NotEnoughMoney
playse SE_SHOP
removemoney 50
updatemoneybox
msgbox SlateportCity_OceanicMuseum_1F_Text_PleaseEnjoyYourself, MSGBOX_DEFAULT
setvar VAR_SLATEPORT_MUSEUM_1F_STATE, 1
hidemoneybox
releaseall
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_NotEnoughMoney
```
goto_if_unset FLAG_DELIVERED_DEVON_GOODS, SlateportCity_OceanicMuseum_1F_EventScript_AllowEntranceAnyway
msgbox SlateportCity_OceanicMuseum_1F_Text_NotEnoughMoney, MSGBOX_DEFAULT
closemessage
hidemoneybox
applymovement LOCALID_PLAYER, SlateportCity_OceanicMuseum_1F_Movement_PushPlayerBackFromCounter
waitmovement 0
releaseall
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_AllowEntranceAnyway
```
msgbox SlateportCity_OceanicMuseum_1F_Text_CatchUpWithYourGroup, MSGBOX_DEFAULT
setvar VAR_SLATEPORT_MUSEUM_1F_STATE, 1
hidemoneybox
releaseall
end
```
### SlateportCity_OceanicMuseum_1F_Movement_PushPlayerBackFromCounter
```
walk_down
step_end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt1
```
msgbox SlateportCity_OceanicMuseum_1F_Text_AquaExistForGoodOfAll, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt2
```
msgbox SlateportCity_OceanicMuseum_1F_Text_OurBossIsntHere, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt3
```
msgbox SlateportCity_OceanicMuseum_1F_Text_WouldStuffHereMakeMeRich, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt4
```
msgbox SlateportCity_OceanicMuseum_1F_Text_CanLearnForNefariousDeeds, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt5
```
msgbox SlateportCity_OceanicMuseum_1F_Text_RustboroBungled, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt6
```
msgbox SlateportCity_OceanicMuseum_1F_Text_DidntHaveMoney, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_WhirlpoolExperiment
```
msgbox SlateportCity_OceanicMuseum_1F_Text_WhirlpoolExperiment, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_WaterfallExperiment
```
msgbox SlateportCity_OceanicMuseum_1F_Text_WaterfallExperiment, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_OceanSoilDisplay
```
msgbox SlateportCity_OceanicMuseum_1F_Text_OceanSoilDisplay, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_BeachSandDisplay
```
msgbox SlateportCity_OceanicMuseum_1F_Text_BeachSandDisplay, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact1
```
msgbox SlateportCity_OceanicMuseum_1F_Text_OceanicMinifact1, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact2
```
msgbox SlateportCity_OceanicMuseum_1F_Text_OceanicMinifact2, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact3
```
msgbox SlateportCity_OceanicMuseum_1F_Text_OceanicMinifact3, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_FossilDisplay
```
msgbox SlateportCity_OceanicMuseum_1F_Text_FossilDisplay, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_DepthMeasuringMachine
```
msgbox SlateportCity_OceanicMuseum_1F_Text_DepthMeasuringMachine, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron1
```
msgbox SlateportCity_OceanicMuseum_1F_Text_LearnAboutSeaForBattling, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron2
```
msgbox SlateportCity_OceanicMuseum_1F_Text_SternIsRoleModel, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron3
```
msgbox SlateportCity_OceanicMuseum_1F_Text_MustBePokemonWeDontKnow, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron4
```
msgbox SlateportCity_OceanicMuseum_1F_Text_WantSeaPokemon, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGrunt
```
lock
faceplayer
delay 8
playse SE_PIN
applymovement LOCALID_OCEANIC_MUSEUM_FAMILIAR_GRUNT, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_OCEANIC_MUSEUM_FAMILIAR_GRUNT, Common_Movement_Delay48
waitmovement 0
msgbox SlateportCity_OceanicMuseum_1F_Text_RememberMeTakeThis, MSGBOX_DEFAULT
giveitem ITEM_TM_THIEF
goto_if_eq VAR_RESULT, 0, SlateportCity_OceanicMuseum_1F_EventScript_NoRoomForThief
setflag FLAG_RECEIVED_TM_THIEF
msgbox SlateportCity_OceanicMuseum_1F_Text_HopeINeverSeeYouAgain, MSGBOX_DEFAULT
closemessage
goto_if_eq VAR_FACING, DIR_NORTH, SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitNorth
goto_if_eq VAR_FACING, DIR_SOUTH, SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitSouth
goto_if_eq VAR_FACING, DIR_WEST, SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitWestEast
goto_if_eq VAR_FACING, DIR_EAST, SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitWestEast
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitNorth
```
applymovement LOCALID_PLAYER, SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitNorth
applymovement LOCALID_OCEANIC_MUSEUM_FAMILIAR_GRUNT, SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExitNorth
waitmovement 0
goto SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExited
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitSouth
```
applymovement LOCALID_OCEANIC_MUSEUM_FAMILIAR_GRUNT, SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExit
waitmovement 0
goto SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExited
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitWestEast
```
applymovement LOCALID_PLAYER, SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitWestEast
applymovement LOCALID_OCEANIC_MUSEUM_FAMILIAR_GRUNT, SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExit
waitmovement 0
goto SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExited
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExited
```
setflag FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_FAMILIAR_AQUA_GRUNT
playse SE_EXIT
removeobject LOCALID_OCEANIC_MUSEUM_FAMILIAR_GRUNT
release
end
```
### SlateportCity_OceanicMuseum_1F_EventScript_NoRoomForThief
```
msgbox SlateportCity_OceanicMuseum_1F_Text_YouHaveToTakeThis, MSGBOX_DEFAULT
release
end
```
### SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitNorth
```
delay_16
delay_8
delay_4
walk_in_place_faster_down
step_end
```
### SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitWestEast
```
delay_16
walk_in_place_faster_down
step_end
```
### SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExit
```
face_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
delay_8
step_end
```
### SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExitNorth
```
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
delay_8
step_end
```

## Textes (26)
### SlateportCity_OceanicMuseum_1F_Text_WouldYouLikeToEnter
```
Bienvenue au MUSEE OCEANOGRAPHIQUE.\pL'entrée coûte 50¥.\nVoulez-vous entrer?$
```
### SlateportCity_OceanicMuseum_1F_Text_PleaseEnjoyYourself
```
Bonne visite!$
```
### SlateportCity_OceanicMuseum_1F_Text_NotEnoughMoney
```
Oh, désolée, mais vous ne semblez pas\navoir suffisamment d'argent.$
```
### SlateportCity_OceanicMuseum_1F_Text_CatchUpWithYourGroup
```
Oh, vous faites partie du groupe qui\nest entré tout à l'heure?\pIls doivent déjà être loin.\nVous feriez bien de les rattraper!$
```
### SlateportCity_OceanicMuseum_1F_Text_AquaExistForGoodOfAll
```
Nous, la TEAM AQUA, nous existons \npour le bien de tous!$
```
### SlateportCity_OceanicMuseum_1F_Text_OurBossIsntHere
```
On nous a dit de nous regrouper ici,\nalors on l'a fait, mais…\pNotre CHEF, le pivot du groupe,\nn'est pas là.$
```
### SlateportCity_OceanicMuseum_1F_Text_WouldStuffHereMakeMeRich
```
Si je piquais tout ce qu'il y a ici,\nest-ce que ça me rendrait riche?$
```
### SlateportCity_OceanicMuseum_1F_Text_CanLearnForNefariousDeeds
```
Ce que j'apprends ici, je peux m'en\nservir pour agir de façon infâme…$
```
### SlateportCity_OceanicMuseum_1F_Text_RustboroBungled
```
Si cet imbécile n'avait pas échoué\nà MEROUVILLE, on n'en serait pas là.$
```
### SlateportCity_OceanicMuseum_1F_Text_DidntHaveMoney
```
Je n'avais pas les 50¥, alors j'ai dû\nparlementer avec la réceptionniste.$
```
### SlateportCity_OceanicMuseum_1F_Text_LearnAboutSeaForBattling
```
Je veux tirer des enseignements de la\nmer et m'en servir pour combattre.$
```
### SlateportCity_OceanicMuseum_1F_Text_SternIsRoleModel
```
Je suis tout excité quand je vois\nla mer!\pLe CAPT. POUPE est un exemple pour moi!$
```
### SlateportCity_OceanicMuseum_1F_Text_MustBePokemonWeDontKnow
```
La mer est sans limite et d'une\ninfinie profondeur…\pIl doit y avoir de nombreux POKéMON\ndont on ignore tout.$
```
### SlateportCity_OceanicMuseum_1F_Text_WantSeaPokemon
```
Je veux un POKéMON de la mer.\pJe crois que ce serait sympa de le tenir\ncontre moi.$
```
### SlateportCity_OceanicMuseum_1F_Text_RememberMeTakeThis
```
Héééé!\nQu'est-ce que tu fais là?\pMoi? Je suis le membre de la TEAM AQUA\nque tu as déjà affronté. Tu t'souviens?\lC'était dans le TUNNEL MERAZON!\pTiens, prends ça!\nEt pardonne-moi!$
```
### SlateportCity_OceanicMuseum_1F_Text_HopeINeverSeeYouAgain
```
Cette CT te sera plus utile qu'à moi.\pJ'espère ne jamais te revoir!\nOuahahaha!$
```
### SlateportCity_OceanicMuseum_1F_Text_YouHaveToTakeThis
```
Allez, viens!\nPrends ça et laisse-moi partir!$
```
### SlateportCity_OceanicMuseum_1F_Text_WhirlpoolExperiment
```
Un liquide bleu forme une spirale à\nl'intérieur d'un récipient en verre.\p“C'est un tourbillon reproduit\nartificiellement avec du vent.”$
```
### SlateportCity_OceanicMuseum_1F_Text_WaterfallExperiment
```
Une balle rouge monte et descend à\nl'intérieur d'un récipient en verre.\p“C'est une expérience simulant\nune CASCADE avec la flottabilité\lde la balle.”$
```
### SlateportCity_OceanicMuseum_1F_Text_OceanSoilDisplay
```
C'est un échantillon provenant du fond\nde l'océan.\p“Les débris de toutes formes de vie\nse sont au fur et à mesure amassés au\lfond de la mer, formant des couches\lsédimentaires.”\p“L'analyse de ces sédiments \nrévèle le temps passé.”$
```
### SlateportCity_OceanicMuseum_1F_Text_BeachSandDisplay
```
C'est un échantillon de sable de plage.\p“Les roches des montagnes sont\ndétrempées par les rivières, ce qui les\lrend friables et les décompose.”\p“Elles sont réduites en poussière\net deviennent le sable des plages.”$
```
### SlateportCity_OceanicMuseum_1F_Text_OceanicMinifact1
```
DEVINETTE SUR LA MER 1\nPourquoi l'eau de mer est-elle bleue?\pLes rayons de lumière sont composés\nde nombreuses couleurs.\pLa plupart d'entre eux perdent leur\ncouleur lorsqu'ils traversent l'eau.\pMais les rayons bleus, eux, sont\nréfléchis, rendant la mer bleue.$
```
### SlateportCity_OceanicMuseum_1F_Text_OceanicMinifact2
```
DEVINETTE SUR LA MER 2\nPourquoi l'eau de mer est-elle salée?\pL'eau de mer contient du sel dissous\nsous forme d'ions sodium et chlorure.\pCes ions proviennent des roches\net la pluie les transporte dans la mer.\pLa concentration en sel dissous\nrend la mer salée.$
```
### SlateportCity_OceanicMuseum_1F_Text_OceanicMinifact3
```
DEVINETTE SUR LA MER 3\nQuelle est la plus vaste? La mer\lou la terre?\pLa mer couvre environ 70% de la\nplanète et la terre, le reste.\pLa mer est donc au moins deux fois\nplus vaste que la terre.$
```
### SlateportCity_OceanicMuseum_1F_Text_FossilDisplay
```
C'est un fossile à stries ondulées.\p“Le fond de l'océan est drainé\npar la marée.”\p“Le mouvement de l'eau de mer dessine\ndes stries et des creux sur le sol.”\p“Si ce sol se fossilise, on parle\nd'ondulation.”$
```
### SlateportCity_OceanicMuseum_1F_Text_DepthMeasuringMachine
```
Un engin étrange pivote sous un\ndôme en verre.\pPeut-être est-ce pour mesurer la\nprofondeur de quelque chose…$
```
