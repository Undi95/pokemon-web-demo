# SlateportCity_SternsShipyard_1F

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_STERNS_SHIPYARD_1F`
- **layout** : `LAYOUT_SLATEPORT_CITY_STERNS_SHIPYARD_1F`
- **music** : `MUS_SLATEPORT`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_DOCK` | `OBJ_EVENT_GFX_MAN_1` | 5,5 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_SternsShipyard_1F_EventScript_Dock` | `0` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 10,7 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_SternsShipyard_1F_EventScript_Scientist1` | `0` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 18,8 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `SlateportCity_SternsShipyard_1F_EventScript_Scientist2` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 12,11 | `MOVEMENT_TYPE_WANDER_AROUND` | `SlateportCity_SternsShipyard_1F_EventScript_Briney` | `FLAG_HIDE_SLATEPORT_CITY_STERNS_SHIPYARD_MR_BRINEY` |

## Warps (3)
- #0 (2,14) → `MAP_SLATEPORT_CITY` warp #2
- #1 (3,14) → `MAP_SLATEPORT_CITY` warp #2
- #2 (3,1) → `MAP_SLATEPORT_CITY_STERNS_SHIPYARD_2F` warp #0

## Flags référencés (5)
- `FLAG_BADGE07_GET`
- `FLAG_DELIVERED_DEVON_GOODS`
- `FLAG_DOCK_REJECTED_DEVON_GOODS`
- `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA`
- `FLAG_SYS_GAME_CLEAR`

## Scripts (8)
### SlateportCity_SternsShipyard_1F_EventScript_Dock
```
lockall
goto_if_set FLAG_SYS_GAME_CLEAR, SlateportCity_SternsShipyard_1F_EventScript_FerryReady
goto_if_set FLAG_BADGE07_GET, SlateportCity_SternsShipyard_1F_EventScript_BrineyJoined
goto_if_set FLAG_DELIVERED_DEVON_GOODS, SlateportCity_SternsShipyard_1F_EventScript_NeedVeteran
goto_if_set FLAG_DOCK_REJECTED_DEVON_GOODS, SlateportCity_SternsShipyard_1F_EventScript_GoFindStern
msgbox SlateportCity_SternsShipyard_1F_Text_CantMakeHeadsOrTails, MSGBOX_DEFAULT
applymovement LOCALID_DOCK, Common_Movement_FacePlayer
waitmovement 0
msgbox SlateportCity_SternsShipyard_1F_Text_MeetDockDeliverToStern, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_DOCK, Common_Movement_FaceOriginalDirection
waitmovement 0
setflag FLAG_DOCK_REJECTED_DEVON_GOODS
setflag FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA
releaseall
end
```
### SlateportCity_SternsShipyard_1F_EventScript_FerryReady
```
applymovement LOCALID_DOCK, Common_Movement_FacePlayer
waitmovement 0
msgbox SlateportCity_SternsShipyard_1F_Text_FerryIsReady, MSGBOX_DEFAULT
releaseall
end
```
### SlateportCity_SternsShipyard_1F_EventScript_BrineyJoined
```
applymovement LOCALID_DOCK, Common_Movement_FacePlayer
waitmovement 0
msgbox SlateportCity_SternsShipyard_1F_Text_BrineyJoinedUs, MSGBOX_DEFAULT
releaseall
end
```
### SlateportCity_SternsShipyard_1F_EventScript_GoFindStern
```
applymovement LOCALID_DOCK, Common_Movement_FacePlayer
waitmovement 0
msgbox SlateportCity_SternsShipyard_1F_Text_CouldYouFindStern, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_DOCK, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### SlateportCity_SternsShipyard_1F_EventScript_NeedVeteran
```
applymovement LOCALID_DOCK, Common_Movement_FacePlayer
waitmovement 0
msgbox SlateportCity_SternsShipyard_1F_Text_CouldUseAdviceFromVeteran, MSGBOX_DEFAULT
releaseall
end
```
### SlateportCity_SternsShipyard_1F_EventScript_Scientist1
```
msgbox SlateportCity_SternsShipyard_1F_Text_SeaIsLikeLivingThing, MSGBOX_NPC
end
```
### SlateportCity_SternsShipyard_1F_EventScript_Scientist2
```
msgbox SlateportCity_SternsShipyard_1F_Text_GetSeasickEasily, MSGBOX_NPC
end
```
### SlateportCity_SternsShipyard_1F_EventScript_Briney
```
msgbox SlateportCity_SternsShipyard_1F_Text_DecidedToHelpDock, MSGBOX_NPC
end
```

## Textes (9)
### SlateportCity_SternsShipyard_1F_Text_CantMakeHeadsOrTails
```
Hum… Si ceci va ici et si cela va là…\pMais, où va cette chose?\nEt ça, alors?\pAaargh! Ça n'a ni queue ni tête!$
```
### SlateportCity_SternsShipyard_1F_Text_MeetDockDeliverToStern
```
Hum?\nSalut, je suis ARCHIBALD.\pLe CAPT. POUPE m'a chargé\nde concevoir un ferry.\pOh! Ça, là…\nC'est le PACK DEVON?\pMais, hum…\nÇa ne va pas…\pLe CAPT. POUPE est sorti.\nIl a dit qu'il avait du travail.\pPourrais-tu aller trouver le\nCAPT. POUPE et le lui remettre?$
```
### SlateportCity_SternsShipyard_1F_Text_CouldYouFindStern
```
ARCHIBALD: Où le CAPT. POUPE peut-il\nbien être allé?\pPourrais-tu aller trouver le CAPT.\nPOUPE et lui remettre ce paquet?$
```
### SlateportCity_SternsShipyard_1F_Text_CouldUseAdviceFromVeteran
```
ARCHIBALD: Construire des bateaux est\nun art.\pBien des choses ne peuvent être\nrésolues rien que par des calculs.\pIl me faudrait les conseils d'un vieux\nloup de mer…$
```
### SlateportCity_SternsShipyard_1F_Text_BrineyJoinedUs
```
ARCHIBALD: Salut! M. MARCO nous\na rejoints pour nous proposer son aide.\pGrâce à l'expérience du navigateur,\nl'assemblage du ferry suit son cours.$
```
### SlateportCity_SternsShipyard_1F_Text_FerryIsReady
```
ARCHIBALD: Le ferry est enfin terminé!\pLe nouveau LE MARINA est une\nmerveille de technologie. Aucun doute!\pMais j'ai le sentiment que nous \npouvons encore l'améliorer.\pTu sais, la technologie est\nen perpétuelle évolution.$
```
### SlateportCity_SternsShipyard_1F_Text_DecidedToHelpDock
```
M. MARCO: Ah, {PLAYER}{KUN}!\nÇa faisait longtemps!\pHé, depuis notre dernière rencontre, le\nvieux loup de mer est d'humeur folâtre.\pAlors j'ai décidé d'aider ARCHIBALD\nà construire un ferry.\pHé, après tout, un ferry pourra\ntransporter plein de gens.\pMais, tu sais, cet ARCHIBALD, c'est\nvraiment quelqu'un!\pAvec ses connaissances et mon\nexpérience, je suis sûr qu'on va pouvoir\lconstruire un imposant bateau, hé, hé!$
```
### SlateportCity_SternsShipyard_1F_Text_SeaIsLikeLivingThing
```
Les saisons, le temps, le coefficient\nde marée…\pCes paramètres, parmi d'autres,\ninfluent sur l'état de la mer.\pC'est vrai!\nLa mer est comme un être vivant!$
```
### SlateportCity_SternsShipyard_1F_Text_GetSeasickEasily
```
J'ai facilement le mal de mer.\nAlors je reste souvent aider ici.$
```
