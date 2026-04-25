# SeafloorCavern_Room9

## Métadonnées
- **id** : `MAP_SEAFLOOR_CAVERN_ROOM9`
- **layout** : `LAYOUT_SEAFLOOR_CAVERN_ROOM9`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SEAFLOOR_CAVERN`
- **weather** : `WEATHER_FOG_HORIZONTAL`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SEAFLOOR_CAVERN_KYOGRE` | `OBJ_EVENT_GFX_KYOGRE_FRONT` | 17,38 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_KYOGRE` |
| `LOCALID_SEAFLOOR_CAVERN_ARCHIE` | `OBJ_EVENT_GFX_ARCHIE` | 9,42 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_ARCHIE` |
| `LOCALID_SEAFLOOR_CAVERN_MAXIE` | `OBJ_EVENT_GFX_MAXIE` | 9,42 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_MAXIE` |
| `LOCALID_SEAFLOOR_CAVERN_GRUNT_1` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 8,41 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_MAGMA_GRUNTS` |
| `LOCALID_SEAFLOOR_CAVERN_GRUNT_2` | `OBJ_EVENT_GFX_MAGMA_MEMBER_F` | 8,42 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_MAGMA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 14,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `SeafloorCavern_Room9_EventScript_ItemTMEarthquake` | `FLAG_ITEM_SEAFLOOR_CAVERN_ROOM_9_TM_EARTHQUAKE` |
| `LOCALID_SEAFLOOR_CAVERN_KYOGRE_SLEEPING` | `OBJ_EVENT_GFX_KYOGRE_ASLEEP` | 17,38 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_KYOGRE_ASLEEP` |

## Warps (1)
- #0 (5,4) → `MAP_SEAFLOOR_CAVERN_ROOM8` warp #0

## Coord events / triggers (1)
- (17,42) → `SeafloorCavern_Room9_EventScript_ArchieAwakenKyogre` (si `VAR_SEAFLOOR_CAVERN_STATE` == `0`)

## Flags référencés (19)
- `FLAG_HIDE_MAP_NAME_POPUP`
- `FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_STEVEN`
- `FLAG_HIDE_ROUTE_128_ARCHIE`
- `FLAG_HIDE_ROUTE_128_MAXIE`
- `FLAG_HIDE_SEAFLOOR_CAVERN_AQUA_GRUNTS`
- `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_ARCHIE`
- `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_KYOGRE`
- `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_MAGMA_GRUNTS`
- `FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_MAXIE`
- `FLAG_HIDE_SOOTOPOLIS_CITY_ARCHIE`
- `FLAG_HIDE_SOOTOPOLIS_CITY_GROUDON`
- `FLAG_HIDE_SOOTOPOLIS_CITY_KYOGRE`
- `FLAG_HIDE_SOOTOPOLIS_CITY_MAN_1`
- `FLAG_HIDE_SOOTOPOLIS_CITY_MAXIE`
- `FLAG_HIDE_SOOTOPOLIS_CITY_RESIDENTS`
- `FLAG_HIDE_SOOTOPOLIS_CITY_STEVEN`
- `FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN`
- `FLAG_LEGENDARIES_IN_SOOTOPOLIS`
- `FLAG_SYS_WEATHER_CTRL`

## Variables référencées (9)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_0x8007`
- `VAR_RESULT`
- `VAR_ROUTE128_STATE`
- `VAR_SEAFLOOR_CAVERN_STATE`
- `VAR_SOOTOPOLIS_CITY_STATE`
- `VAR_STEVENS_HOUSE_STATE`

## Scripts (12)
### SeafloorCavern_Room9_EventScript_ArchieAwakenKyogre
```
lockall
setvar VAR_0x8004, LOCALID_SEAFLOOR_CAVERN_ARCHIE
setvar VAR_0x8005, LOCALID_SEAFLOOR_CAVERN_MAXIE
setvar VAR_0x8006, LOCALID_SEAFLOOR_CAVERN_GRUNT_1
setvar VAR_0x8007, LOCALID_SEAFLOOR_CAVERN_GRUNT_2
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
applymovement LOCALID_PLAYER, SeafloorCavern_Room9_Movement_Delay32
waitmovement 0
playbgm MUS_ENCOUNTER_AQUA, FALSE
msgbox SeafloorCavern_Room9_Text_ArchieHoldItRightThere, MSGBOX_DEFAULT
closemessage
addobject VAR_0x8004
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
applymovement VAR_0x8004, SeafloorCavern_Room9_Movement_ArchieApproachPlayer
waitmovement 0
msgbox SeafloorCavern_Room9_Text_ArchieSoItWasYou, MSGBOX_DEFAULT
applymovement VAR_0x8004, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox SeafloorCavern_Room9_Text_ArchieBeholdKyogre, MSGBOX_DEFAULT
applymovement VAR_0x8004, Common_Movement_FacePlayer
waitmovement 0
msgbox SeafloorCavern_Room9_Text_ArchieYouMustDisappear, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_ARCHIE, SeafloorCavern_Room9_Text_ArchieDefeat
msgbox SeafloorCavern_Room9_Text_ArchieWithThisRedOrb, MSGBOX_DEFAULT
setweather WEATHER_NONE
doweather
special Script_FadeOutMapMusic
msgbox SeafloorCavern_Room9_Text_RedOrbShinesByItself, MSGBOX_DEFAULT
special WaitWeather
setvar VAR_RESULT, 1
playse SE_M_DETECT
dofieldeffectsparkle 16, 42, 0
waitfieldeffect FLDEFF_SPARKLE
closemessage
setvar VAR_RESULT, 0
playfanfare MUS_AWAKEN_LEGEND
playse SE_ORB
special DoOrbEffect
applymovement VAR_0x8004, Common_Movement_WalkInPlaceFasterUp
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
delay 150
removeobject LOCALID_SEAFLOOR_CAVERN_KYOGRE_SLEEPING
addobject LOCALID_SEAFLOOR_CAVERN_KYOGRE
waitstate
delay 60
applymovement LOCALID_SEAFLOOR_CAVERN_KYOGRE, SeafloorCavern_Room9_Movement_KyogreApproach
waitmovement 0
special FadeOutOrbEffect
setvar VAR_0x8004, 1  @ vertical pan
setvar VAR_0x8005, 1  @ horizontal pan
setvar VAR_0x8006, 8  @ num shakes
setvar VAR_0x8007, 5  @ shake delay
special ShakeCamera
waitstate
applymovement LOCALID_SEAFLOOR_CAVERN_KYOGRE, SeafloorCavern_Room9_Movement_KyogreExit
waitmovement 0
removeobject LOCALID_SEAFLOOR_CAVERN_KYOGRE
delay 4
setvar VAR_0x8004, 2  @ vertical pan
setvar VAR_0x8005, 2  @ horizontal pan
setvar VAR_0x8006, 8  @ num shakes
setvar VAR_0x8007, 5  @ shake delay
special ShakeCamera
waitstate
delay 30
setvar VAR_0x8004, LOCALID_SEAFLOOR_CAVERN_ARCHIE
setvar VAR_0x8005, LOCALID_SEAFLOOR_CAVERN_MAXIE
setvar VAR_0x8006, LOCALID_SEAFLOOR_CAVERN_GRUNT_1
setvar VAR_0x8007, LOCALID_SEAFLOOR_CAVERN_GRUNT_2
msgbox SeafloorCavern_Room9_Text_ArchieWhereDidKyogreGo, MSGBOX_DEFAULT
playse SE_PC_LOGIN
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox SeafloorCavern_Room9_Text_ArchieAMessageFromOutside, MSGBOX_DEFAULT
closemessage
applymovement VAR_0x8004, SeafloorCavern_Room9_Movement_ArchieListenMessage
waitmovement 0
msgbox SeafloorCavern_Room9_Text_ArchieWhatRainingTooHard, MSGBOX_DEFAULT
closemessage
playse SE_PC_OFF
delay 20
applymovement VAR_0x8004, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox SeafloorCavern_Room9_Text_ArchieWhyDidKyogreDisappear, MSGBOX_DEFAULT
closemessage
addobject VAR_0x8005
addobject VAR_0x8006
addobject VAR_0x8007
applymovement VAR_0x8007, SeafloorCavern_Room9_Movement_MagmaGruntArrive
applymovement VAR_0x8006, SeafloorCavern_Room9_Movement_MagmaGruntArrive
applymovement VAR_0x8005, SeafloorCavern_Room9_Movement_MaxieArrive
waitmovement 0
applymovement VAR_0x8004, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox SeafloorCavern_Room9_Text_MaxieWhatHaveYouWrought, MSGBOX_DEFAULT
playse SE_PIN
applymovement VAR_0x8004, Common_Movement_ExclamationMark
waitmovement 0
applymovement VAR_0x8004, Common_Movement_Delay48
waitmovement 0
msgbox SeafloorCavern_Room9_Text_ArchieDontGetAllHighAndMighty, MSGBOX_DEFAULT
msgbox SeafloorCavern_Room9_Text_MaxieWeDontHaveTimeToArgue, MSGBOX_DEFAULT
closemessage
applymovement VAR_0x8005, SeafloorCavern_Room9_Movement_MaxieExit
applymovement VAR_0x8004, SeafloorCavern_Room9_Movement_ArchieExit
waitmovement 0
msgbox SeafloorCavern_Room9_Text_MaxieComeOnPlayer, MSGBOX_DEFAULT
setvar VAR_ROUTE128_STATE, 1
setvar VAR_SOOTOPOLIS_CITY_STATE, 1
clearflag FLAG_HIDE_SOOTOPOLIS_CITY_STEVEN
clearflag FLAG_HIDE_SOOTOPOLIS_CITY_ARCHIE
clearflag FLAG_HIDE_SOOTOPOLIS_CITY_MAXIE
clearflag FLAG_HIDE_SOOTOPOLIS_CITY_RESIDENTS
clearflag FLAG_HIDE_SOOTOPOLIS_CITY_GROUDON
clearflag FLAG_HIDE_SOOTOPOLIS_CITY_KYOGRE
setflag FLAG_HIDE_SOOTOPOLIS_CITY_MAN_1
setflag FLAG_LEGENDARIES_IN_SOOTOPOLIS
clearflag FLAG_HIDE_ROUTE_128_ARCHIE
clearflag FLAG_HIDE_ROUTE_128_MAXIE
setflag FLAG_SYS_WEATHER_CTRL
setflag FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN
setflag FLAG_HIDE_MOSSDEEP_CITY_STEVENS_HOUSE_STEVEN
setvar VAR_STEVENS_HOUSE_STATE, 2
setvar VAR_SEAFLOOR_CAVERN_STATE, 1
setflag FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_ARCHIE
setflag FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_MAXIE
setflag FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_MAGMA_GRUNTS
setflag FLAG_HIDE_SEAFLOOR_CAVERN_ROOM_9_KYOGRE
setflag FLAG_HIDE_SEAFLOOR_CAVERN_AQUA_GRUNTS
setflag FLAG_HIDE_MAP_NAME_POPUP
warp MAP_ROUTE128, 38, 22
waitstate
releaseall
end
```
### SeafloorCavern_Room9_Movement_ArchieApproachPlayer
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### SeafloorCavern_Room9_Movement_Unused1
```
walk_left
walk_left
step_end
```
### SeafloorCavern_Room9_Movement_ArchieListenMessage
```
walk_left
delay_16
step_end
```
### SeafloorCavern_Room9_Movement_Unused2
```
walk_right
step_end
```
### SeafloorCavern_Room9_Movement_ArchieExit
```
face_up
lock_facing_direction
walk_down
unlock_facing_direction
walk_in_place_faster_right
step_end
```
### SeafloorCavern_Room9_Movement_KyogreApproach
```
delay_16
delay_16
walk_slow_down
delay_16
delay_16
delay_16
walk_slow_down
delay_16
delay_16
delay_16
step_end
```
### SeafloorCavern_Room9_Movement_KyogreExit
```
slide_up
slide_up
step_end
```
### SeafloorCavern_Room9_Movement_MaxieArrive
```
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
step_end
```
### SeafloorCavern_Room9_Movement_MaxieExit
```
walk_right
walk_right
step_end
```
### SeafloorCavern_Room9_Movement_MagmaGruntArrive
```
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
step_end
```
### SeafloorCavern_Room9_Movement_Delay32
```
delay_16
delay_16
step_end
```

## Textes (15)
### SeafloorCavern_Room9_Text_ArchieHoldItRightThere
```
ARTHUR: Ne bouge pas! Reste là!$
```
### SeafloorCavern_Room9_Text_ArchieSoItWasYou
```
ARTHUR: Hummm…\nAlors c'était toi en fait.$
```
### SeafloorCavern_Room9_Text_ArchieBeholdKyogre
```
ARTHUR: Regarde!\pVois comme c'est beau, la silhouette\nendormie de l'ancien POKéMON KYOGRE!\pJ'ai attendu ce jour si longtemps…$
```
### SeafloorCavern_Room9_Text_ArchieYouMustDisappear
```
ARTHUR: Je suis surpris de voir que tu\nas réussi à me suivre jusqu'ici.\pMais tout est fini désormais.\pPour que je puisse réaliser mon rêve,\nil faut que tu disparaisses maintenant!$
```
### SeafloorCavern_Room9_Text_ArchieDefeat
```
Quoi?!\pTu m'as vraiment battu?!$
```
### SeafloorCavern_Room9_Text_ArchieWithThisRedOrb
```
ARTHUR: Hummm…\pJe te félicite. Je dois reconnaître que\ntu as vraiment du talent.\pMais!\nJ'ai ceci en ma possession!\pAvec cet ORBE ROUGE, KYOGRE\npeut…$
```
### SeafloorCavern_Room9_Text_RedOrbShinesByItself
```
L'ORBE ROUGE commence soudain\nà briller!$
```
### SeafloorCavern_Room9_Text_ArchieWhereDidKyogreGo
```
ARTHUR: Quoi?!\pJe n'ai rien fait du tout.\nPourquoi l'ORBE ROUGE…\pOù est passé KYOGRE?$
```
### SeafloorCavern_Room9_Text_ArchieAMessageFromOutside
```
ARTHUR: Hum? C'est un message envoyé\npar nos membres qui sont à l'extérieur…$
```
### SeafloorCavern_Room9_Text_ArchieWhatRainingTooHard
```
ARTHUR: Oui, qu'y a-t-il?\pHum…\nIl pleut beaucoup?\pBon… Ça devait arriver. C'est pour\ncela que nous avons réveillé KYOGRE,\lpour réaliser le désir de la TEAM AQUA\ld'étendre la mer.\pQuoi?!\pIl pleut bien plus que prévu?\nC'est dangereux?\pCe n'est pas…\nC'est tout simplement impossible…\pRestez à vos postes et maîtrisez\nla situation!$
```
### SeafloorCavern_Room9_Text_ArchieWhyDidKyogreDisappear
```
ARTHUR: Quelque chose est anormal…\pL'ORBE ROUGE est censé réveiller et\ncontrôler KYOGRE…\pMais… Pourquoi?\nPourquoi KYOGRE a-t-il disparu?\pPourquoi?!$
```
### SeafloorCavern_Room9_Text_MaxieWhatHaveYouWrought
```
MAX: Qu'est-ce que t'as fabriqué?\pARTHUR, tu as finalement réveillé\nKYOGRE, n'est-ce pas?\pQue va devenir le monde si cette\nforte pluie continue à tomber pour\ll'éternité?\pToute la surface terrestre sera noyée\ndans les eaux profondes de la mer.$
```
### SeafloorCavern_Room9_Text_ArchieDontGetAllHighAndMighty
```
ARTHUR: Qu'est-ce que tu dis?\nNe prends pas ce ton avec moi!\pN'est-ce pas vous, la TEAM MAGMA,\nqui avez rendu GROUDON furieux?\pL'ORBE ROUGE devrait me permettre\nde contrôler KYOGRE…\pJe devais pouvoir le contrôler…$
```
### SeafloorCavern_Room9_Text_MaxieWeDontHaveTimeToArgue
```
MAX: On n'a pas le temps de discuter\nde ça ici!\pVa dehors et vois par toi-même!\pVois si ce que tu as fait correspond\nau monde de tes rêves!$
```
### SeafloorCavern_Room9_Text_MaxieComeOnPlayer
```
MAX: {PLAYER}, viens, il faut\naussi que tu partes d'ici!$
```
