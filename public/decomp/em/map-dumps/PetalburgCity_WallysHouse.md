# PetalburgCity_WallysHouse

## Métadonnées
- **id** : `MAP_PETALBURG_CITY_WALLYS_HOUSE`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_PETALBURG`
- **region_map_section** : `MAPSEC_PETALBURG_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_WALLYS_HOUSE_WALLYS_DAD` | `OBJ_EVENT_GFX_POKEFAN_M` | 3,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `PetalburgCity_WallysHouse_EventScript_WallysDad` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 7,5 | `MOVEMENT_TYPE_FACE_LEFT` | `PetalburgCity_WallysHouse_EventScript_WallysMom` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_PETALBURG_CITY` warp #1
- #1 (4,7) → `MAP_PETALBURG_CITY` warp #1

## Flags référencés (3)
- `FLAG_DEFEATED_WALLY_VICTORY_ROAD`
- `FLAG_RECEIVED_HM_SURF`
- `FLAG_THANKED_FOR_PLAYING_WITH_WALLY`

## Variables référencées (1)
- `VAR_PETALBURG_CITY_STATE`

## Scripts (11)
### PetalburgCity_WallysHouse_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, PetalburgCity_WallysHouse_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, PetalburgCity_WallysHouse_OnWarp
```
### PetalburgCity_WallysHouse_OnWarp
```
map_script_2 VAR_PETALBURG_CITY_STATE, 4, PetalburgCity_WallysHouse_EventScript_PlayerWallysDadFaceEachOther
```
### PetalburgCity_WallysHouse_EventScript_PlayerWallysDadFaceEachOther
```
turnobject LOCALID_PLAYER, DIR_EAST
turnobject LOCALID_WALLYS_HOUSE_WALLYS_DAD, DIR_WEST
end
```
### PetalburgCity_WallysHouse_OnFrame
```
map_script_2 VAR_PETALBURG_CITY_STATE, 4, PetalburgCity_WallysHouse_EventScript_GiveHMSurf
```
### PetalburgCity_WallysHouse_EventScript_GiveHMSurf
```
lockall
msgbox PetalburgCity_WallysHouse_Text_PleaseExcuseUs, MSGBOX_DEFAULT
giveitem ITEM_HM_SURF
setflag FLAG_RECEIVED_HM_SURF
msgbox PetalburgCity_WallysHouse_Text_SurfGoAllSortsOfPlaces, MSGBOX_DEFAULT
setvar VAR_PETALBURG_CITY_STATE, 5
releaseall
end
```
### PetalburgCity_WallysHouse_EventScript_WallysDad
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_WALLY_VICTORY_ROAD, PetalburgCity_WallysHouse_EventScript_DefeatedWallyInVictoryRoad
goto_if_set FLAG_RECEIVED_HM_SURF, PetalburgCity_WallysHouse_EventScript_ReceievedHMSurf
goto_if_set FLAG_THANKED_FOR_PLAYING_WITH_WALLY, PetalburgCity_WallysHouse_EventScript_PlayedWithWally
msgbox PetalburgCity_WallysHouse_Text_ThanksForPlayingWithWally, MSGBOX_DEFAULT
setflag FLAG_THANKED_FOR_PLAYING_WITH_WALLY
release
end
```
### PetalburgCity_WallysHouse_EventScript_ReceievedHMSurf
```
msgbox PetalburgCity_WallysHouse_Text_WallyIsComingHomeSoon, MSGBOX_DEFAULT
release
end
```
### PetalburgCity_WallysHouse_EventScript_DefeatedWallyInVictoryRoad
```
msgbox PetalburgCity_WallysHouse_Text_YouMetWallyInEverGrandeCity, MSGBOX_DEFAULT
release
end
```
### PetalburgCity_WallysHouse_EventScript_PlayedWithWally
```
msgbox PetalburgCity_WallysHouse_Text_WonderHowWallyIsDoing, MSGBOX_DEFAULT
release
end
```
### PetalburgCity_WallysHouse_EventScript_WallysMom
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_HM_SURF, PetalburgCity_WallysHouse_EventScript_ReceivedHMSurf
msgbox PetalburgCity_WallysHouse_Text_WallyWasReallyHappy, MSGBOX_DEFAULT
release
end
```
### PetalburgCity_WallysHouse_EventScript_ReceivedHMSurf
```
msgbox PetalburgCity_WallysHouse_Text_WallyLeftWithoutTelling, MSGBOX_DEFAULT
release
end
```

## Textes (8)
### PetalburgCity_WallysHouse_Text_ThanksForPlayingWithWally
```
Tu es…\nAh, tu dois être {PLAYER}{KUN}, n'est-ce pas?\pMerci d'avoir joué avec TIMMY.\pIl est faible et maladif depuis\nqu'il est tout petit.\pNous l'avons envoyé chez des parents à\nVERGAZON pour quelque temps.\pL'air qu'on y respire est bien\nmeilleur qu'ici.\pComment ça? Où est TIMMY?\nIl est déjà parti, notre TIMMY.\pJe me demande où il peut bien\nêtre en ce moment.$
```
### PetalburgCity_WallysHouse_Text_WonderHowWallyIsDoing
```
Comment va notre TIMMY?$
```
### PetalburgCity_WallysHouse_Text_PleaseExcuseUs
```
{PLAYER}{KUN}! Merci d'avoir accepté\nde venir.\pNotre TIMMY est en meilleure santé\ndepuis qu'il est allé à VERGAZON.\pEt c'est à toi que nous le devons!\pQuand TIMMY a quitté la ville, tu l'as\naidé à attraper un POKéMON, pas vrai?\pJe pense que ça l'a rendu très heureux.\pEn fait, il n'y a pas que lui. Cela m'a\naussi rendu heureux, moi son père.\pQuelle chance pour lui d'avoir comme\ncamarade quelqu'un d'aussi bien que toi!\pCe n'est pas pour te flatter, mais\nj'aimerais que tu acceptes ça.$
```
### PetalburgCity_WallysHouse_Text_SurfGoAllSortsOfPlaces
```
Si ton POKéMON peut utiliser SURF,\ntu découvriras toutes sortes de lieux.$
```
### PetalburgCity_WallysHouse_Text_WallyIsComingHomeSoon
```
TIMMY va bientôt rentrer.\nJe l'attends avec impatience.$
```
### PetalburgCity_WallysHouse_Text_YouMetWallyInEverGrandeCity
```
Ah? Tu as vu TIMMY à ETERNARA?\pOh, {PLAYER}{KUN}, ne dis pas n'importe quoi!\pMême s'il va mieux, il n'a pas\npu aller aussi loin tout seul.$
```
### PetalburgCity_WallysHouse_Text_WallyWasReallyHappy
```
TIMMY était très content de nous\ndire qu'il avait attrapé un POKéMON.\pÇa faisait une éternité que je ne\nl'avais pas vu sourire comme ça.$
```
### PetalburgCity_WallysHouse_Text_WallyLeftWithoutTelling
```
N'en parle pas à mon mari…\pMais notre TIMMY a quitté VERGAZON\nsans rien dire à personne.\pTu sais, TIMMY est frêle, mais\nil a beaucoup de volonté.\pJe suis sûre qu'il rentrera bientôt\nsain et sauf.$
```
