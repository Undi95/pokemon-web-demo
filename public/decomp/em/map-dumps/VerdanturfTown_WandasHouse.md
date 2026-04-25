# VerdanturfTown_WandasHouse

## Métadonnées
- **id** : `MAP_VERDANTURF_TOWN_WANDAS_HOUSE`
- **layout** : `LAYOUT_VERDANTURF_TOWN_WANDAS_HOUSE`
- **music** : `MUS_VERDANTURF`
- **region_map_section** : `MAPSEC_VERDANTURF_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WALLY` | 14,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `VerdanturfTown_WandasHouse_EventScript_Wally` | `FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WALLY` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 5,4 | `MOVEMENT_TYPE_FACE_DOWN` | `VerdanturfTown_WandasHouse_EventScript_WandasBoyfriend` | `FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WANDAS_BOYFRIEND` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `VerdanturfTown_WandasHouse_EventScript_WallysUncle` | `FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WALLYS_UNCLE` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 2,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `VerdanturfTown_WandasHouse_EventScript_WallysAunt` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 5,5 | `MOVEMENT_TYPE_FACE_LEFT` | `VerdanturfTown_WandasHouse_EventScript_Wanda` | `FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WANDA` |

## Warps (2)
- #0 (7,7) → `MAP_VERDANTURF_TOWN` warp #3
- #1 (8,7) → `MAP_VERDANTURF_TOWN` warp #3

## Flags référencés (5)
- `FLAG_DEFEATED_LAVARIDGE_GYM`
- `FLAG_DEFEATED_WALLY_MAUVILLE`
- `FLAG_DEFEATED_WALLY_VICTORY_ROAD`
- `FLAG_RUSTURF_TUNNEL_OPENED`
- `FLAG_WALLY_SPEECH`

## Scripts (13)
### VerdanturfTown_WandasHouse_EventScript_Wally
```
lock
faceplayer
goto_if_set FLAG_WALLY_SPEECH, VerdanturfTown_WandasHouse_EventScript_WallyShortSpeech
msgbox VerdanturfTown_WandasHouse_Text_StrongerSpeech, MSGBOX_DEFAULT
setflag FLAG_WALLY_SPEECH
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WallyShortSpeech
```
msgbox VerdanturfTown_WandasHouse_Text_StrongerSpeechShort, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WallysUncle
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_WALLY_VICTORY_ROAD, VerdanturfTown_WandasHouse_EventScript_WallysUncleEverGrande
goto_if_set FLAG_DEFEATED_LAVARIDGE_GYM, VerdanturfTown_WandasHouse_EventScript_WallysUncleSlippedOff
msgbox VerdanturfTown_WandasHouse_Text_WallysNextDoor, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WallysUncleSlippedOff
```
msgbox VerdanturfTown_WandasHouse_Text_WallySlippedOff, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WallysUncleEverGrande
```
msgbox VerdanturfTown_WandasHouse_Text_WallyGoneThatFar, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WandasBoyfriend
```
msgbox VerdanturfTown_WandasHouse_Text_CanSeeGirlfriendEveryDay, MSGBOX_NPC
end
```
### VerdanturfTown_WandasHouse_EventScript_Wanda
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_LAVARIDGE_GYM, VerdanturfTown_WandasHouse_EventScript_WandaDontWorry
goto_if_set FLAG_DEFEATED_WALLY_MAUVILLE, VerdanturfTown_WandasHouse_EventScript_MeetWanda
msgbox VerdanturfTown_WandasHouse_Text_DontWorryAboutWally, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_MeetWanda
```
msgbox VerdanturfTown_WandasHouse_Text_MeetWanda, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WandaDontWorry
```
msgbox VerdanturfTown_WandasHouse_Text_DontWorryAboutWally, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WallysAunt
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_WALLY_VICTORY_ROAD, VerdanturfTown_WandasHouse_EventScript_WallysAuntEverGrande
goto_if_set FLAG_DEFEATED_LAVARIDGE_GYM, VerdanturfTown_WandasHouse_EventScript_WallysAuntAnythingHappened
goto_if_set FLAG_RUSTURF_TUNNEL_OPENED, VerdanturfTown_WandasHouse_EventScript_WallysAuntTunnelOpen
msgbox VerdanturfTown_WandasHouse_Text_DaughtersBoyfriendDriven, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WallysAuntTunnelOpen
```
msgbox VerdanturfTown_WandasHouse_Text_DaughtersBoyfriendWasDigging, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WallysAuntAnythingHappened
```
msgbox VerdanturfTown_WandasHouse_Text_IfAnythingHappenedToWally, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_WandasHouse_EventScript_WallysAuntEverGrande
```
msgbox VerdanturfTown_WandasHouse_Text_WallyWasInEverGrande, MSGBOX_DEFAULT
release
end
```

## Textes (12)
### VerdanturfTown_WandasHouse_Text_StrongerSpeech
```
TIMMY: J'ai perdu contre toi, {PLAYER},\nmais je ne me sens plus déprimé.\pMaintenant, j'ai un nouveau but dans\nla vie. Avec mon TARSAL, je vais\pparcourir les ARENES et devenir un\ngrand DRESSEUR.\pRegarde-moi bien, {PLAYER}.\nJe vais devenir plus fort que toi.\pQuand ce sera le cas, je te défierai\nencore une fois.$
```
### VerdanturfTown_WandasHouse_Text_StrongerSpeechShort
```
TIMMY: Regarde-moi bien, {PLAYER}.\nJe vais devenir plus fort que toi.\pQuand ce sera le cas, je te défierai\nencore une fois.$
```
### VerdanturfTown_WandasHouse_Text_WallysNextDoor
```
TONTON: Oh! {PLAYER}{KUN}!\nTIMMY est juste à côté.\pMais avant, j'ai quelque chose à te dire.\pCet environnement naturel fait des\nmerveilles sur la santé de TIMMY.\pMais ce n'est pas seulement\nl'environnement. Les POKéMON lui\ldonnent aussi beaucoup d'espoir.$
```
### VerdanturfTown_WandasHouse_Text_WallySlippedOff
```
TIMMY est parti…\nIl suit son propre chemin…$
```
### VerdanturfTown_WandasHouse_Text_WallyGoneThatFar
```
TONTON: C'est vrai?\nTIMMY est allé aussi loin tout seul…\pEh bien, il faudra que je le félicite.\nC'est bien le fils de mon frère.$
```
### VerdanturfTown_WandasHouse_Text_MeetWanda
```
SYLVIE: Qui es-tu?\nOh, d'accord, j'y suis!\pTu es {PLAYER}. TIMMY m'a parlé de toi.\pJe suis la cousine de TIMMY.\nEnchantée de te rencontrer!\pJe crois que TIMMY est bien plus enjoué\net solide depuis qu'il est arrivé ici.$
```
### VerdanturfTown_WandasHouse_Text_DontWorryAboutWally
```
SYLVIE: Ne t'inquiète pas pour\nTIMMY. Tout ira bien pour lui.\pJe connais bien mon petit cousin.\nEn plus, il a un POKéMON avec lui.$
```
### VerdanturfTown_WandasHouse_Text_CanSeeGirlfriendEveryDay
```
Grâce à toi, je peux voir ma copine\ntous les jours.\pSi je suis content? Bien entendu!$
```
### VerdanturfTown_WandasHouse_Text_DaughtersBoyfriendDriven
```
Le petit ami de ma fille est un garçon\ntrès expansif et passionné.\pIl creuse jour et nuit un tunnel juste\npour voir ma fille.\pMa fille est un peu inquiète, donc elle\nva souvent voir si le tunnel est fini.$
```
### VerdanturfTown_WandasHouse_Text_DaughtersBoyfriendWasDigging
```
Incroyable, le petit ami de ma fille a\ncreusé le tunnel de ses propres mains!\pC'est hallucinant!$
```
### VerdanturfTown_WandasHouse_Text_IfAnythingHappenedToWally
```
Si quelque chose arrivait à TIMMY,\nje ne pourrais plus regarder ses\lparents en face…$
```
### VerdanturfTown_WandasHouse_Text_WallyWasInEverGrande
```
TIMMY était à ETERNARA?\pSes parents, qui sont à CLEMENTI,\nseraient stupéfaits d'entendre ça!$
```
