# Route116_TunnelersRestHouse

## Métadonnées
- **id** : `MAP_ROUTE116_TUNNELERS_REST_HOUSE`
- **layout** : `LAYOUT_ROUTE116_TUNNELERS_REST_HOUSE`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_ROUTE_116`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 6,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route116_TunnelersRestHouse_EventScript_Tunneler1` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 3,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_TunnelersRestHouse_EventScript_Tunneler3` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 7,2 | `MOVEMENT_TYPE_FACE_UP` | `Route116_TunnelersRestHouse_EventScript_Tunneler2` | `0` |

## Warps (2)
- #0 (4,8) → `MAP_ROUTE116` warp #1
- #1 (5,8) → `MAP_ROUTE116` warp #1

## Flags référencés (2)
- `FLAG_LANDMARK_TUNNELERS_REST_HOUSE`
- `FLAG_RUSTURF_TUNNEL_OPENED`

## Scripts (6)
### Route116_TunnelersRestHouse_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route116_TunnelersRestHouse_OnTransition
```
### Route116_TunnelersRestHouse_OnTransition
```
setflag FLAG_LANDMARK_TUNNELERS_REST_HOUSE
end
```
### Route116_TunnelersRestHouse_EventScript_Tunneler1
```
msgbox Route116_TunnelersRestHouse_Text_WeHadToStopBoring, MSGBOX_NPC
end
```
### Route116_TunnelersRestHouse_EventScript_Tunneler2
```
msgbox Route116_TunnelersRestHouse_Text_ManDiggingHisWayToVerdanturf, MSGBOX_NPC
end
```
### Route116_TunnelersRestHouse_EventScript_Tunneler3
```
lock
faceplayer
goto_if_set FLAG_RUSTURF_TUNNEL_OPENED, Route116_TunnelersRestHouse_EventScript_TunnelOpened
msgbox Route116_TunnelersRestHouse_Text_GetToVerdanturfWithoutTunnel, MSGBOX_DEFAULT
release
end
```
### Route116_TunnelersRestHouse_EventScript_TunnelOpened
```
msgbox Route116_TunnelersRestHouse_Text_TunnelHasGoneThrough, MSGBOX_DEFAULT
release
end
```

## Textes (4)
### Route116_TunnelersRestHouse_Text_WeHadToStopBoring
```
C'est le TUNNEL MERAZON, là-bas…\pAu début, de nombreux ouvriers\nperçaient les rochers avec d'énormes\lengins. Mais nous avons dû arrêter.\pOn s'est rendu compte que les travaux\navaient un effet négatif sur les\lPOKéMON sauvages de la région.\pMaintenant, nous n'avons plus rien\nà faire, à part flâner.$
```
### Route116_TunnelersRestHouse_Text_ManDiggingHisWayToVerdanturf
```
Il y a un homme qui creuse un TUNNEL\nvers VERGAZON, tout seul.\lIl veut absolument passer.\pIl affirme que s'il creuse petit à petit\nsans utiliser de machine, il ne\ldérangera pas les POKéMON et n'abîmera\lpas l'écosystème environnant.\pJe me demande s'il a déjà fini.$
```
### Route116_TunnelersRestHouse_Text_GetToVerdanturfWithoutTunnel
```
Pour atteindre VERGAZON sans utiliser\nce TUNNEL, tu devras naviguer jusqu'à\lMYOKARA, puis jusqu'à POIVRESSEL et\lenfin passer par LAVANDIA.$
```
### Route116_TunnelersRestHouse_Text_TunnelHasGoneThrough
```
Tu as entendu? Le TUNNEL pour\nVERGAZON est enfin terminé!\pParfois, si l'on souhaite très fort\nquelque chose, ça se réalise.$
```
