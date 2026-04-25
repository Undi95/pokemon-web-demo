# VerdanturfTown

## Métadonnées
- **id** : `MAP_VERDANTURF_TOWN`
- **layout** : `LAYOUT_VERDANTURF_TOWN`
- **music** : `MUS_VERDANTURF`
- **region_map_section** : `MAPSEC_VERDANTURF_TOWN`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_TOWN`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset -80) → `MAP_ROUTE116`
- right (offset 0) → `MAP_ROUTE117`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_2` | 4,17 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `VerdanturfTown_EventScript_Man` | `0` |
| `LOCALID_VERDANTURF_TWIN` | `OBJ_EVENT_GFX_TWIN` | 9,2 | `MOVEMENT_TYPE_FACE_LEFT` | `VerdanturfTown_EventScript_Twin` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 7,11 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `VerdanturfTown_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 7,6 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `VerdanturfTown_EventScript_Camper` | `0` |

## Warps (7)
- #0 (3,7) → `MAP_VERDANTURF_TOWN_BATTLE_TENT_LOBBY` warp #0
- #1 (12,3) → `MAP_VERDANTURF_TOWN_MART` warp #0
- #2 (16,3) → `MAP_VERDANTURF_TOWN_POKEMON_CENTER_1F` warp #0
- #3 (10,14) → `MAP_VERDANTURF_TOWN_WANDAS_HOUSE` warp #0
- #4 (8,1) → `MAP_RUSTURF_TUNNEL` warp #1
- #5 (1,14) → `MAP_VERDANTURF_TOWN_FRIENDSHIP_RATERS_HOUSE` warp #0
- #6 (17,15) → `MAP_VERDANTURF_TOWN_HOUSE` warp #0

## BG events / signs (8)
- (14,3) [sign] → `Common_EventScript_ShowPokemartSign`
- (14,6) [sign] → `VerdanturfTown_EventScript_TownSign`
- (17,3) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (7,14) [sign] → `VerdanturfTown_EventScript_WandasHouseSign`
- (13,3) [sign] → `Common_EventScript_ShowPokemartSign`
- (18,3) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (1,8) [sign] → `VerdanturfTown_EventScript_BattleTentSign`
- (7,3) [sign] → `VerdanturfTown_EventScript_RusturfTunnelSign`

## Flags référencés (2)
- `FLAG_RUSTURF_TUNNEL_OPENED`
- `FLAG_VISITED_VERDANTURF_TOWN`

## Variables référencées (1)
- `VAR_CONTEST_HALL_STATE`

## Scripts (12)
### VerdanturfTown_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, VerdanturfTown_OnTransition
```
### VerdanturfTown_OnTransition
```
setflag FLAG_VISITED_VERDANTURF_TOWN
setvar VAR_CONTEST_HALL_STATE, 0
end
```
### VerdanturfTown_EventScript_Twin
```
lock
faceplayer
goto_if_set FLAG_RUSTURF_TUNNEL_OPENED, VerdanturfTown_EventScript_TwinTunnelOpen
msgbox VerdanturfTown_Text_ManTryingToDigTunnel, MSGBOX_DEFAULT
applymovement LOCALID_VERDANTURF_TWIN, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### VerdanturfTown_EventScript_TwinTunnelOpen
```
msgbox VerdanturfTown_Text_ManDugTunnelForLove, MSGBOX_DEFAULT
applymovement LOCALID_VERDANTURF_TWIN, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### VerdanturfTown_EventScript_Man
```
msgbox VerdanturfTown_Text_AirCleanHere, MSGBOX_NPC
end
```
### VerdanturfTown_EventScript_Camper
```
msgbox VerdanturfTown_Text_MakeBattleTentDebut, MSGBOX_NPC
end
```
### VerdanturfTown_EventScript_Boy
```
lock
faceplayer
goto_if_set FLAG_RUSTURF_TUNNEL_OPENED, VerdanturfTown_EventScript_BoyTunnelOpen
msgbox VerdanturfTown_Text_GuyTryingToBustThroughCave, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_EventScript_BoyTunnelOpen
```
msgbox VerdanturfTown_Text_EasyToGetToRustboroNow, MSGBOX_DEFAULT
release
end
```
### VerdanturfTown_EventScript_TownSign
```
msgbox VerdanturfTown_Text_TownSign, MSGBOX_SIGN
end
```
### VerdanturfTown_EventScript_WandasHouseSign
```
msgbox VerdanturfTown_Text_WandasHouse, MSGBOX_SIGN
end
```
### VerdanturfTown_EventScript_BattleTentSign
```
msgbox VerdanturfTown_Text_BattleTentSign, MSGBOX_SIGN
end
```
### VerdanturfTown_EventScript_RusturfTunnelSign
```
msgbox VerdanturfTown_Text_RusturfTunnelSign, MSGBOX_SIGN
end
```

## Textes (10)
### VerdanturfTown_Text_ManTryingToDigTunnel
```
Mon papa m'a tout raconté.\pIl dit que ce tunnel est rempli de\nPOKéMON craintifs.\pIls ont tous peur du bruit et font\nbeaucoup de brouhaha.\pAlors ils ont été obligés d'arrêter le\nprojet du tunnel.\pMais il y a encore un homme. Il essaie de\ncreuser le tunnel tout seul!$
```
### VerdanturfTown_Text_ManDugTunnelForLove
```
Il y a un type qui a creusé un\ntunnel pour la fille qu'il aime.\pMoi, je n'le ferais pas, mais bon,\naprès tout…$
```
### VerdanturfTown_Text_AirCleanHere
```
Le vent n'amène jamais les cendres\nvolcaniques par là.\pL'air est sain et délicieux ici.\nVivre ici est très bénéfique, surtout\lpour les personnes chétives et malades.$
```
### VerdanturfTown_Text_MakeBattleTentDebut
```
Mes POKéMON et moi venons de réussir\nune grande série de victoires\lconsécutives.\pAlors j'ai décidé de nous essayer à la\nTENTE DE COMBAT de cette ville.$
```
### VerdanturfTown_Text_GuyTryingToBustThroughCave
```
As-tu vu la caverne près de la\nBOUTIQUE POKéMON?\pIl y a un type là-bas qui essaie de\ncasser des rochers pour pouvoir passer\let se rendre de ce côté.\pCe serait super de pouvoir passer…\nÇa serait facile d'aller à MEROUVILLE.$
```
### VerdanturfTown_Text_EasyToGetToRustboroNow
```
Tu sais, cette caverne près de la\nBOUTIQUE POKéMON, elle relie\ldésormais les deux côtés.\pC'est super! Plus de problème pour faire\ndes courses chez DEVON à MEROUVILLE.$
```
### VerdanturfTown_Text_TownSign
```
VERGAZON\p“Les montagnes où le vent souffle et\noù le doux parfum de l'herbe se dégage.”$
```
### VerdanturfTown_Text_WandasHouse
```
MAISON DE SYLVIE$
```
### VerdanturfTown_Text_BattleTentSign
```
TENTE DE COMBAT de VERGAZON\n“Venez admirer nos combats!”$
```
### VerdanturfTown_Text_RusturfTunnelSign
```
TUNNEL MERAZON\n“Passage entre MEROUVILLE\let VERGAZON”.\p“Le projet de création du tunnel\na été annulé.”$
```
