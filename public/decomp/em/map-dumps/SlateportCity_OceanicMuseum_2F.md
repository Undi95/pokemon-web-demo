# SlateportCity_OceanicMuseum_2F

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_OCEANIC_MUSEUM_2F`
- **layout** : `LAYOUT_SLATEPORT_CITY_OCEANIC_MUSEUM_2F`
- **music** : `MUS_OCEANIC_MUSEUM`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_OCEANIC_MUSEUM_2F_CAPT_STERN` | `OBJ_EVENT_GFX_SCIENTIST_1` | 13,6 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_OceanicMuseum_2F_EventScript_CaptStern` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_2F_CAPTAIN_STERN` |
| `LOCALID_OCEANIC_MUSEUM_2F_ARCHIE` | `OBJ_EVENT_GFX_ARCHIE` | 6,1 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_2F_ARCHIE` |
| `LOCALID_OCEANIC_MUSEUM_2F_GRUNT_1` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 6,1 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_2F_AQUA_GRUNT_1` |
| `LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 6,1 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_2F_AQUA_GRUNT_2` |
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 12,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron1` | `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 9,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron2` | `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron3` | `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION` |

## Warps (1)
- #0 (6,1) → `MAP_SLATEPORT_CITY_OCEANIC_MUSEUM_1F` warp #2

## BG events / signs (21)
- (18,4) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample1`
- (18,7) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample2`
- (4,3) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SubmersibleReplica`
- (4,4) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SubmersibleReplica`
- (3,3) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SubmarineReplica`
- (2,3) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SubmarineReplica`
- (3,4) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SubmarineReplica`
- (3,6) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica`
- (4,6) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica`
- (13,7) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SSAnneReplica`
- (14,7) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SSAnneReplica`
- (18,1) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SurfaceSeawaterDisplay`
- (19,1) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SurfaceSeawaterDisplay`
- (15,1) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_DeepSeawaterDisplay`
- (16,1) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_DeepSeawaterDisplay`
- (8,1) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_HoennModel`
- (9,1) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_HoennModel`
- (12,1) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_PressureExperiment`
- (13,1) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_PressureExperiment`
- (3,7) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica`
- (4,7) [sign] → `SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica`

## Flags référencés (5)
- `FLAG_DELIVERED_DEVON_GOODS`
- `FLAG_HIDE_ROUTE_110_TEAM_AQUA`
- `FLAG_HIDE_ROUTE_116_DEVON_EMPLOYEE`
- `FLAG_HIDE_RUSTBORO_CITY_DEVON_CORP_3F_EMPLOYEE`
- `FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_AQUA_GRUNTS`

## Variables référencées (5)
- `VAR_0x8004`
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_REGISTER_BIRCH_STATE`
- `VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_PlayerHandedOverTheItem`

## Scripts (31)
### SlateportCity_OceanicMuseum_2F_EventScript_CaptStern
```
lock
faceplayer
msgbox SlateportCity_OceanicMuseum_2F_Text_ThankYouForTheParts, MSGBOX_DEFAULT
closemessage
playbgm MUS_ENCOUNTER_AQUA, TRUE
addobject LOCALID_OCEANIC_MUSEUM_2F_GRUNT_1
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_1, SlateportCity_OceanicMuseum_2F_Movement_FirstGruntEnter
waitmovement 0
addobject LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2, SlateportCity_OceanicMuseum_2F_Movement_SecondGruntEnter
waitmovement 0
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_1, SlateportCity_OceanicMuseum_2F_Movement_FirstGruntApproach
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2, SlateportCity_OceanicMuseum_2F_Movement_SecondGruntApproach
waitmovement 0
call_if_eq VAR_FACING, DIR_SOUTH, SlateportCity_OceanicMuseum_2F_EventScript_PlayerFaceGrunts
call_if_eq VAR_FACING, DIR_EAST, SlateportCity_OceanicMuseum_2F_EventScript_PlayerFaceGrunts
msgbox SlateportCity_OceanicMuseum_2F_Text_WellTakeThoseParts, MSGBOX_DEFAULT
call_if_ne VAR_FACING, DIR_EAST, SlateportCity_OceanicMuseum_2F_EventScript_SternFaceGrunts
msgbox SlateportCity_OceanicMuseum_2F_Text_SternWhoAreYou, MSGBOX_DEFAULT
msgbox SlateportCity_OceanicMuseum_2F_Text_WereTeamAqua, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2, SlateportCity_OceanicMuseum_2F_Movement_GruntApproachToBattle
waitmovement 0
call_if_eq VAR_FACING, DIR_SOUTH, SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntSouth
call_if_eq VAR_FACING, DIR_WEST, SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntWest
trainerbattle_no_intro TRAINER_GRUNT_MUSEUM_1, SlateportCity_OceanicMuseum_2F_Text_Grunt1Defeat
msgbox SlateportCity_OceanicMuseum_2F_Text_BossGoingToBeFurious, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2, SlateportCity_OceanicMuseum_2F_Movement_GruntDefeated
waitmovement 0
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_1, SlateportCity_OceanicMuseum_2F_Movement_GruntApproachToBattle
waitmovement 0
msgbox SlateportCity_OceanicMuseum_2F_Text_LetMeTakeCareOfThis, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_GRUNT_MUSEUM_2, SlateportCity_OceanicMuseum_2F_Text_Grunt2Defeat
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_1, SlateportCity_OceanicMuseum_2F_Movement_GruntDefeated
waitmovement 0
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_1, Common_Movement_WalkInPlaceFasterDown
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox SlateportCity_OceanicMuseum_2F_Text_MeddlingKid, MSGBOX_DEFAULT
closemessage
delay 35
addobject LOCALID_OCEANIC_MUSEUM_2F_ARCHIE
applymovement LOCALID_OCEANIC_MUSEUM_2F_ARCHIE, SlateportCity_OceanicMuseum_2F_Movement_ArchieEnter
applymovement LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2, SlateportCity_OceanicMuseum_2F_Movement_GruntMoveForArchie
waitmovement 0
msgbox SlateportCity_OceanicMuseum_2F_Text_CameToSeeWhatsTakingSoLong, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_OCEANIC_MUSEUM_2F_ARCHIE, SlateportCity_OceanicMuseum_2F_Movement_ArchieApproachPlayer
waitmovement 0
msgbox SlateportCity_OceanicMuseum_2F_Text_ArchieWarning, MSGBOX_DEFAULT
closemessage
savebgm MUS_DUMMY
fadedefaultbgm
fadescreen FADE_TO_BLACK
removeobject LOCALID_OCEANIC_MUSEUM_2F_ARCHIE
removeobject LOCALID_OCEANIC_MUSEUM_2F_GRUNT_1
removeobject LOCALID_OCEANIC_MUSEUM_2F_GRUNT_2
fadescreen FADE_FROM_BLACK
delay 30
setflag FLAG_HIDE_SLATEPORT_CITY_OCEANIC_MUSEUM_AQUA_GRUNTS
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox SlateportCity_OceanicMuseum_2F_Text_SternThankYouForSavingUs, MSGBOX_DEFAULT
setvar VAR_0x8004, ITEM_DEVON_GOODS
call Common_EventScript_PlayerHandedOverTheItem
msgbox SlateportCity_OceanicMuseum_2F_Text_SternIveGotToGo, MSGBOX_DEFAULT
closemessage
fadescreen FADE_TO_BLACK
playfanfare MUS_HEAL
waitfanfare
special HealPlayerParty
removeobject LOCALID_OCEANIC_MUSEUM_2F_CAPT_STERN
setflag FLAG_HIDE_ROUTE_110_TEAM_AQUA
call_if_eq VAR_REGISTER_BIRCH_STATE, 0, SlateportCity_OceanicMuseum_2F_EventScript_ReadyRegisterBirch
setflag FLAG_DELIVERED_DEVON_GOODS
clearflag FLAG_HIDE_ROUTE_116_DEVON_EMPLOYEE
setflag FLAG_HIDE_RUSTBORO_CITY_DEVON_CORP_3F_EMPLOYEE
setvar VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE, 1
fadescreen FADE_FROM_BLACK
release
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_ReadyRegisterBirch
```
setvar VAR_REGISTER_BIRCH_STATE, 1
return
```
### SlateportCity_OceanicMuseum_2F_EventScript_PlayerFaceGrunts
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
return
```
### SlateportCity_OceanicMuseum_2F_EventScript_SternFaceGrunts
```
applymovement LOCALID_OCEANIC_MUSEUM_2F_CAPT_STERN, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
return
```
### SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntSouth
```
applymovement LOCALID_PLAYER, SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntSouth
waitmovement 0
return
```
### SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntWest
```
applymovement LOCALID_PLAYER, SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntWest
waitmovement 0
return
```
### SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntSouth
```
walk_left
walk_down
walk_in_place_faster_left
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntWest
```
walk_up
walk_left
walk_left
walk_down
walk_in_place_faster_left
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_Unused
```
walk_up
walk_left
walk_left
walk_left
walk_left
walk_left
walk_up
walk_up
walk_left
walk_left
walk_up
walk_up
delay_8
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_ArchieApproachPlayer
```
walk_right
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_ArchieEnter
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_GruntApproachToBattle
```
walk_right
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_FirstGruntEnter
```
walk_down
walk_right
walk_in_place_faster_down
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_FirstGruntApproach
```
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_GruntDefeated
```
lock_facing_direction
walk_left
unlock_facing_direction
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_SecondGruntEnter
```
walk_down
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_SecondGruntApproach
```
walk_down
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
step_end
```
### SlateportCity_OceanicMuseum_2F_Movement_GruntMoveForArchie
```
delay_16
delay_16
delay_16
delay_16
delay_16
delay_16
delay_16
delay_16
delay_8
walk_fast_down
walk_in_place_faster_up
step_end
```
### SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample1
```
msgbox SlateportCity_OceanicMuseum_2F_Text_WaterQualitySample1, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample2
```
msgbox SlateportCity_OceanicMuseum_2F_Text_WaterQualitySample2, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_PressureExperiment
```
msgbox SlateportCity_OceanicMuseum_2F_Text_PressureExperiment, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_HoennModel
```
msgbox SlateportCity_OceanicMuseum_2F_Text_HoennModel, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_DeepSeawaterDisplay
```
msgbox SlateportCity_OceanicMuseum_2F_Text_DeepSeawaterDisplay, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_SurfaceSeawaterDisplay
```
msgbox SlateportCity_OceanicMuseum_2F_Text_SurfaceSeawaterDisplay, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica
```
msgbox SlateportCity_OceanicMuseum_2F_Text_SSTidalReplica, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_SubmarineReplica
```
msgbox SlateportCity_OceanicMuseum_2F_Text_SubmarineReplica, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_SubmersibleReplica
```
msgbox SlateportCity_OceanicMuseum_2F_Text_SumbersibleReplica, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_SSAnneReplica
```
msgbox SlateportCity_OceanicMuseum_2F_Text_SSAnneReplica, MSGBOX_SIGN
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron1
```
msgbox SlateportCity_OceanicMuseum_2F_Text_RemindsMeOfAbandonedShip, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron2
```
msgbox SlateportCity_OceanicMuseum_2F_Text_DontRunInMuseum, MSGBOX_NPC
end
```
### SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron3
```
lock
faceplayer
msgbox SlateportCity_OceanicMuseum_2F_Text_WantToRideSubmarine, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```

## Textes (26)
### SlateportCity_OceanicMuseum_2F_Text_ThankYouForTheParts
```
Oui? Si tu cherches POUPE,\nc'est bien moi.\pAh! Ça doit être ce que j'avais\ncommandé à M. ROCHARD de DEVON.\pMerci. Formidable! Nous allons désormais\npouvoir préparer l'expédition!$
```
### SlateportCity_OceanicMuseum_2F_Text_WellTakeThoseParts
```
Hé, hé, hé, pas si vite!\nOn va prendre ces pièces!$
```
### SlateportCity_OceanicMuseum_2F_Text_SternWhoAreYou
```
CAPT. POUPE: Qu… quoi?\nQui êtes-vous, jeunes gens?$
```
### SlateportCity_OceanicMuseum_2F_Text_WereTeamAqua
```
On est la TEAM AQUA!\pNotre CHEF veut ces pièces!\nFerme-la et balance-les!$
```
### SlateportCity_OceanicMuseum_2F_Text_Grunt1Defeat
```
Aaaaah!\nSe faire battre par un gosse!$
```
### SlateportCity_OceanicMuseum_2F_Text_BossGoingToBeFurious
```
Oh, mon dieu, quel désastre…\nLe CHEF va être furieux…$
```
### SlateportCity_OceanicMuseum_2F_Text_LetMeTakeCareOfThis
```
Hum, espèce de mauviette!\nLaisse-moi régler ça!$
```
### SlateportCity_OceanicMuseum_2F_Text_Grunt2Defeat
```
Quoi?!\nMoi aussi, j'ai perdu!$
```
### SlateportCity_OceanicMuseum_2F_Text_MeddlingKid
```
Et maintenant? Si on ne récupère\npas les pièces, on est faits!\pAh, j'avais pas prévu d'être gêné\npar un mouflet qui se mêle de tout!$
```
### SlateportCity_OceanicMuseum_2F_Text_CameToSeeWhatsTakingSoLong
```
Je venais voir pourquoi vous mettiez\ntant de temps à récupérer les pièces et\pje constate que vous êtes retenus par\nun simple mioche!$
```
### SlateportCity_OceanicMuseum_2F_Text_ArchieWarning
```
Nous sommes la TEAM AQUA,\net nous adorons la mer!\pMoi, je suis ARTHUR, le leader\nde la TEAM AQUA.\pDis-moi, pourquoi te mêles-tu de\nnos affaires?\pAttends un peu, appartiendrais-tu\nà la TEAM MAGMA?\pNon, ce n'est pas possible, tu ne\nportes pas leur uniforme.\p… … … … … …\n… … … … … …\pLes POKéMON, les gens, toute la vie\ndépend de la mer.\pC'est pourquoi le but premier de la\nTEAM AQUA est l'expansion de la mer.\pNous défendons une noble cause.\nTu ne crois pas? \pAh, oui…\nTu es trop jeune pour comprendre.\pÇa ne facilite pas les choses que tu\nne comprennes pas nos idéaux.\pMais je te préviens, ne t'avise pas\nde te mêler encore de nos histoires.\pLes conséquences seraient terribles.\pN'oublie pas ce conseil!$
```
### SlateportCity_OceanicMuseum_2F_Text_SternThankYouForSavingUs
```
CAPT. POUPE: Tu es…\nAh oui, tu es {PLAYER}{KUN}…\pEn tout cas, que de tension!\nMerci de nous avoir sauvés!\pAh oui, j'avais presque oublié que tu\navais apporté les pièces de DEVON!$
```
### SlateportCity_OceanicMuseum_2F_Text_SternIveGotToGo
```
CAPT. POUPE: Zou!\nIl n'y a pas de temps à perdre!\pIl faut qu'on prépare cette expédition\nsous-marine au plus vite.\pMerci encore, mais il faut que j'y\naille maintenant.\pMais n'hésite pas à jeter un œil\nici si tu en as envie.$
```
### SlateportCity_OceanicMuseum_2F_Text_RemindsMeOfAbandonedShip
```
J'ai vu la maquette d'un bateau ici.\pÇa m'a fait penser à l'EPAVE,\nprès du VILLAGE MYOKARA…$
```
### SlateportCity_OceanicMuseum_2F_Text_DontRunInMuseum
```
N'essaie même pas de courir\ndans le MUSEE!$
```
### SlateportCity_OceanicMuseum_2F_Text_WantToRideSubmarine
```
Waouh, quel sous-marin imposant!\nJe veux faire un tour!$
```
### SlateportCity_OceanicMuseum_2F_Text_WaterQualitySample1
```
L'étiquette indique: “ECHANTILLON\nPOUR TEST DE LA QUALITE DE L'EAU”.\pLa mer forme un seul ensemble, mais\nl'eau est différente selon les régions.$
```
### SlateportCity_OceanicMuseum_2F_Text_WaterQualitySample2
```
L'étiquette indique: “ECHANTILLON\nPOUR TEST DE LA QUALITE DE L'EAU”.\pLa salinité de l'eau diffère peut-être\nd'une région à l'autre…$
```
### SlateportCity_OceanicMuseum_2F_Text_PressureExperiment
```
Une balle en caoutchouc s'allonge\net rétrécit.\p“Dans la mer, le poids de l'eau\nexerce lui-même une pression.”\p“En eau peu profonde, la pression\nn'est pas très élevée.”\p“Par contre, en profondeur, la pression\npeut atteindre des dizaines de milliers\lde tonnes sur une petite surface.”$
```
### SlateportCity_OceanicMuseum_2F_Text_HoennModel
```
MAQUETTE DE LA REGION DE HOENN\pC'est un diorama de la région de HOENN.\pOù est représenté BOURG-EN-VOL?$
```
### SlateportCity_OceanicMuseum_2F_Text_DeepSeawaterDisplay
```
C'est la représentation du mouvement\nde l'eau de mer.\p“Au fond de la mer, les variations de\ncertains facteurs tels que la\ltempérature et la salinité provoquent\lle mouvement de l'eau.”$
```
### SlateportCity_OceanicMuseum_2F_Text_SurfaceSeawaterDisplay
```
C'est la représentation du mouvement\nde l'eau de mer.\p“En surface, l'eau de mer circule comme\ndes courants poussés par le vent.”$
```
### SlateportCity_OceanicMuseum_2F_Text_SSTidalReplica
```
Le ferry LE MARINA\pRéplique à l'échelle du bateau en\nconstruction au CHANTIER NAVAL\lDE POUPE.$
```
### SlateportCity_OceanicMuseum_2F_Text_SubmarineReplica
```
SOUS-MARIN D'EXPLORATION 1\pRéplique du performant sous-marin\nd'exploration des fonds marins.$
```
### SlateportCity_OceanicMuseum_2F_Text_SumbersibleReplica
```
CAPSULE SUBMERSIBLE\pRéplique d'une capsule compacte\npour explorer les fonds marins.$
```
### SlateportCity_OceanicMuseum_2F_Text_SSAnneReplica
```
L'OCEANE\pRéplique du luxueux paquebot\nqui fait le tour de la planète.$
```
