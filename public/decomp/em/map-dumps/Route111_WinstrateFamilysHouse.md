# Route111_WinstrateFamilysHouse

## Métadonnées
- **id** : `MAP_ROUTE111_WINSTRATE_FAMILYS_HOUSE`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_ROUTE_111`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_WINSTRATE_HOUSE_VIVI` | `OBJ_EVENT_GFX_LASS` | 7,5 | `MOVEMENT_TYPE_FACE_LEFT` | `Route111_WinstrateFamilysHouse_EventScript_Vivi` | `0` |
| `LOCALID_WINSTRATE_HOUSE_VICTOR` | `OBJ_EVENT_GFX_MAN_1` | 4,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route111_WinstrateFamilysHouse_EventScript_Victor` | `0` |
| `LOCALID_WINSTRATE_HOUSE_VICTORIA` | `OBJ_EVENT_GFX_POKEFAN_F` | 7,4 | `MOVEMENT_TYPE_FACE_LEFT` | `Route111_WinstrateFamilysHouse_EventScript_Victoria` | `0` |
| `LOCALID_WINSTRATE_HOUSE_VICKY` | `OBJ_EVENT_GFX_EXPERT_F` | 4,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route111_WinstrateFamilysHouse_EventScript_Vicky` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_ROUTE111` warp #0
- #1 (4,7) → `MAP_ROUTE111` warp #0

## Flags référencés (2)
- `FLAG_RECEIVED_MACHO_BRACE`
- `FLAG_TEMP_4`

## Variables référencées (2)
- `VAR_0x8008`
- `VAR_RESULT`

## Scripts (7)
### Route111_WinstrateFamilysHouse_EventScript_Victor
```
lock
faceplayer
setvar VAR_0x8008, LOCALID_WINSTRATE_HOUSE_VICTOR
msgbox Route111_WinstrateFamilysHouse_Text_MySonIsStrongerThanYou, MSGBOX_DEFAULT
goto Route111_WinstrateFamilysHouse_EventScript_FaceOriginalDirection
end
```
### Route111_WinstrateFamilysHouse_EventScript_Victoria
```
lock
faceplayer
setvar VAR_0x8008, LOCALID_WINSTRATE_HOUSE_VICTORIA
goto_if_set FLAG_RECEIVED_MACHO_BRACE, Route111_WinstrateFamilysHouse_EventScript_ReceivedMachoBrace
msgbox Route111_WinstrateFamilysHouse_Text_LikeYouToHaveMachoBrace, MSGBOX_DEFAULT
giveitem ITEM_MACHO_BRACE
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_MACHO_BRACE
goto Route111_WinstrateFamilysHouse_EventScript_FaceOriginalDirection
end
```
### Route111_WinstrateFamilysHouse_EventScript_ReceivedMachoBrace
```
msgbox Route111_WinstrateFamilysHouse_Text_PassionateAboutBattles, MSGBOX_DEFAULT
goto Route111_WinstrateFamilysHouse_EventScript_FaceOriginalDirection
end
```
### Route111_WinstrateFamilysHouse_EventScript_Vivi
```
lock
faceplayer
setvar VAR_0x8008, LOCALID_WINSTRATE_HOUSE_VIVI
msgbox Route111_WinstrateFamilysHouse_Text_StrongerFamilyMembers, MSGBOX_DEFAULT
goto Route111_WinstrateFamilysHouse_EventScript_FaceOriginalDirection
end
```
### Route111_WinstrateFamilysHouse_EventScript_Vicky
```
lock
faceplayer
setvar VAR_0x8008, LOCALID_WINSTRATE_HOUSE_VICKY
goto_if_set FLAG_TEMP_4, Route111_WinstrateFamilysHouse_EventScript_AlreadySpokenTo
msgbox Route111_WinstrateFamilysHouse_Text_GrandsonStrong, MSGBOX_DEFAULT
setflag FLAG_TEMP_4
goto Route111_WinstrateFamilysHouse_EventScript_FaceOriginalDirection
end
```
### Route111_WinstrateFamilysHouse_EventScript_AlreadySpokenTo
```
msgbox Route111_WinstrateFamilysHouse_Text_GrandsonStrongShort, MSGBOX_DEFAULT
goto Route111_WinstrateFamilysHouse_EventScript_FaceOriginalDirection
end
```
### Route111_WinstrateFamilysHouse_EventScript_FaceOriginalDirection
```
closemessage
applymovement VAR_0x8008, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```

## Textes (6)
### Route111_WinstrateFamilysHouse_Text_MySonIsStrongerThanYou
```
C'est la première fois que je vois un\nDRESSEUR qui maîtrise aussi bien\lses POKéMON.\pMais il vaut mieux que je te prévienne,\nmon fils est plus fort que toi.\pIl a même relevé le défi de la LIGUE\nPOKéMON, j'te signale.$
```
### Route111_WinstrateFamilysHouse_Text_LikeYouToHaveMachoBrace
```
Nous utilisons ce BRAC. MACHO\npour améliorer l'entraînement\lde nos POKéMON.\pJe ne sais pas si tu en auras besoin,\nmais comme tu nous as tous battus ici,\lnous t'offrons notre BRAC. MACHO.$
```
### Route111_WinstrateFamilysHouse_Text_PassionateAboutBattles
```
Lorsqu'on parle de combats de POKéMON,\non est souvent très passionnés.$
```
### Route111_WinstrateFamilysHouse_Text_StrongerFamilyMembers
```
Maman est plus forte que papa.\pJe suis plus forte que maman.\pEt mémé est plus forte que moi!\pMais mon grand frère est encore plus\nfort que mémé.$
```
### Route111_WinstrateFamilysHouse_Text_GrandsonStrong
```
Aucun doute, tu es très robuste.\pMais si tu te mesurais à mon petit-fils,\ntu pleurerais comme un bébé.\pNotre famille n'a jamais vu un DRESSEUR\naussi fort que lui.\pEn ce moment, il doit défier le MAITRE\nde la LIGUE POKéMON.\pTel que je connais mon petit-fils, il est\npeut-être déjà le MAITRE!$
```
### Route111_WinstrateFamilysHouse_Text_GrandsonStrongShort
```
En ce moment, mon petit-fils doit défier\nle MAITRE de la LIGUE POKéMON.\pTel que je le connais, il est\npeut-être déjà le MAITRE!$
```
