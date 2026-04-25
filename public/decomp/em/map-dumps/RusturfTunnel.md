# RusturfTunnel

## Métadonnées
- **id** : `MAP_RUSTURF_TUNNEL`
- **layout** : `LAYOUT_RUSTURF_TUNNEL`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_RUSTURF_TUNNEL`
- **weather** : `WEATHER_FOG_HORIZONTAL`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (10 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_RUSTURF_TUNNEL_WANDAS_BF` | `OBJ_EVENT_GFX_BLACK_BELT` | 23,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `RusturfTunnel_EventScript_WandasBoyfriend` | `FLAG_HIDE_RUSTURF_TUNNEL_WANDAS_BOYFRIEND` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 24,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_HIDE_RUSTURF_TUNNEL_ROCK_1` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `RusturfTunnel_EventScript_ItemPokeBall` | `FLAG_ITEM_RUSTURF_TUNNEL_POKE_BALL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 30,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `RusturfTunnel_EventScript_ItemMaxEther` | `FLAG_ITEM_RUSTURF_TUNNEL_MAX_ETHER` |
| `LOCALID_RUSTURF_TUNNEL_BRINEY` | `OBJ_EVENT_GFX_EXPERT_M` | 5,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_RUSTURF_TUNNEL_BRINEY` |
| `LOCALID_RUSTURF_TUNNEL_GRUNT` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 14,5 | `MOVEMENT_TYPE_FACE_LEFT` | `RusturfTunnel_EventScript_Grunt` | `FLAG_HIDE_RUSTURF_TUNNEL_AQUA_GRUNT` |
| `LOCALID_RUSTURF_TUNNEL_PEEKO` | `OBJ_EVENT_GFX_WINGULL` | 14,4 | `MOVEMENT_TYPE_FACE_LEFT` | `RusturfTunnel_EventScript_Peeko` | `FLAG_HIDE_RUSTURF_TUNNEL_PEEKO` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 24,4 | `MOVEMENT_TYPE_FACE_DOWN` | `EventScript_RockSmash` | `FLAG_HIDE_RUSTURF_TUNNEL_ROCK_2` |
| `` | `OBJ_EVENT_GFX_HIKER` | 32,13 | `MOVEMENT_TYPE_FACE_LEFT` | `RusturfTunnel_EventScript_Mike` | `0` |
| `LOCALID_RUSTURF_TUNNEL_WANDA` | `OBJ_EVENT_GFX_WOMAN_2` | 25,4 | `MOVEMENT_TYPE_FACE_LEFT` | `RusturfTunnel_EventScript_Wanda` | `FLAG_HIDE_RUSTURF_TUNNEL_WANDA` |

## Warps (3)
- #0 (4,10) → `MAP_ROUTE116` warp #0
- #1 (29,16) → `MAP_VERDANTURF_TOWN` warp #4
- #2 (18,20) → `MAP_ROUTE116` warp #2

## Coord events / triggers (5)
- (23,4) → `RusturfTunnel_EventScript_TunnelBlockagePos1` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (9,4) → `RusturfTunnel_EventScript_AquaGruntBackUp` (si `VAR_RUSTURF_TUNNEL_STATE` == `2`)
- (9,5) → `RusturfTunnel_EventScript_AquaGruntBackUp` (si `VAR_RUSTURF_TUNNEL_STATE` == `2`)
- (25,4) → `RusturfTunnel_EventScript_TunnelBlockagePos2` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (25,5) → `RusturfTunnel_EventScript_TunnelBlockagePos3` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)

## Flags référencés (5)
- `FLAG_DEVON_GOODS_STOLEN`
- `FLAG_HIDE_ROUTE_116_MR_BRINEY`
- `FLAG_RECEIVED_HM_STRENGTH`
- `FLAG_RECOVERED_DEVON_GOODS`
- `FLAG_TEMP_1`

## Variables référencées (5)
- `VAR_BRINEY_HOUSE_STATE`
- `VAR_LAST_TALKED`
- `VAR_RUSTBORO_CITY_STATE`
- `VAR_RUSTURF_TUNNEL_STATE`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `RusturfTunnel_EventScript_SetRusturfTunnelOpen`

## Scripts (48)
### RusturfTunnel_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, RusturfTunnel_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, RusturfTunnel_OnFrame
```
### RusturfTunnel_OnFrame
```
map_script_2 VAR_RUSTURF_TUNNEL_STATE, 4, RusturfTunnel_EventScript_ClearTunnelScene
map_script_2 VAR_RUSTURF_TUNNEL_STATE, 5, RusturfTunnel_EventScript_ClearTunnelScene
```
### RusturfTunnel_OnTransition
```
call_if_eq VAR_RUSTURF_TUNNEL_STATE, 2, RusturfTunnel_EventScript_SetAquaGruntAndPeekoPos
end
```
### RusturfTunnel_EventScript_SetAquaGruntAndPeekoPos
```
setobjectxyperm LOCALID_RUSTURF_TUNNEL_PEEKO, 13, 4
setobjectxyperm LOCALID_RUSTURF_TUNNEL_GRUNT, 13, 5
return
```
### RusturfTunnel_EventScript_Wanda
```
lock
faceplayer
msgbox RusturfTunnel_Text_BoyfriendOnOtherSideOfRock, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### RusturfTunnel_EventScript_WandasBoyfriend
```
lock
faceplayer
goto_if_set FLAG_TEMP_1, RusturfTunnel_EventScript_AlreadySpokenTo
setflag FLAG_TEMP_1
msgbox RusturfTunnel_Text_WhyCantTheyKeepDigging, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### RusturfTunnel_EventScript_AlreadySpokenTo
```
msgbox RusturfTunnel_Text_ToGetToVerdanturf, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### RusturfTunnel_EventScript_ClearTunnelScene
```
lockall
call_if_eq VAR_TEMP_1, 1, RusturfTunnel_EventScript_FaceWandasBoyfriend1
call_if_eq VAR_TEMP_1, 2, RusturfTunnel_EventScript_FaceWandasBoyfriend2
call_if_eq VAR_TEMP_1, 3, RusturfTunnel_EventScript_FaceWandasBoyfriend3
call RusturfTunnel_EventScript_WandasBoyfriendNotice
msgbox RusturfTunnel_Text_YouShatteredBoulderTakeHM, MSGBOX_DEFAULT
call_if_eq VAR_TEMP_1, 2, RusturfTunnel_EventScript_WandasBoyfriendApproachPlayer
call_if_eq VAR_TEMP_1, 3, RusturfTunnel_EventScript_WandasBoyfriendApproachPlayer
giveitem ITEM_HM_STRENGTH
setflag FLAG_RECEIVED_HM_STRENGTH
msgbox RusturfTunnel_Text_ExplainStrength, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_TEMP_1, 1, RusturfTunnel_EventScript_BoyfriendApproachWanda1
call_if_eq VAR_TEMP_1, 2, RusturfTunnel_EventScript_BoyfriendApproachWanda2
call_if_eq VAR_TEMP_1, 3, RusturfTunnel_EventScript_BoyfriendApproachWanda3
msgbox RusturfTunnel_Text_WandaReunion, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_TEMP_1, 1, RusturfTunnel_EventScript_WandaAndBoyfriendExit1
call_if_eq VAR_TEMP_1, 2, RusturfTunnel_EventScript_WandaAndBoyfriendExit
call_if_eq VAR_TEMP_1, 3, RusturfTunnel_EventScript_WandaAndBoyfriendExit
call RusturfTunnel_EventScript_SetRusturfTunnelOpen
releaseall
end
```
### RusturfTunnel_EventScript_BoyfriendApproachWanda1
```
applymovement LOCALID_PLAYER, RusturfTunnel_Movement_PlayerWatchBoyfriend1
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, RusturfTunnel_Movement_BoyfriendApproachWanda1
waitmovement 0
return
```
### RusturfTunnel_EventScript_BoyfriendApproachWanda2
```
applymovement LOCALID_PLAYER, RusturfTunnel_Movement_PlayerWatchBoyfriend
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, RusturfTunnel_Movement_BoyfriendApproachWanda
waitmovement 0
applymovement LOCALID_RUSTURF_TUNNEL_WANDA, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### RusturfTunnel_EventScript_BoyfriendApproachWanda3
```
applymovement LOCALID_PLAYER, RusturfTunnel_Movement_PlayerWatchBoyfriend
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, RusturfTunnel_Movement_BoyfriendApproachWanda
waitmovement 0
applymovement LOCALID_RUSTURF_TUNNEL_WANDA, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### RusturfTunnel_EventScript_FaceWandasBoyfriend1
```
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### RusturfTunnel_EventScript_FaceWandasBoyfriend2
```
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, RusturfTunnel_Movement_BoyfriendFaceRight
waitmovement 0
return
```
### RusturfTunnel_EventScript_FaceWandasBoyfriend3
```
return
```
### RusturfTunnel_EventScript_WandasBoyfriendApproachPlayer
```
closemessage
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, RusturfTunnel_Movement_WandasBoyfriendApproachPlayer
waitmovement 0
return
```
### RusturfTunnel_EventScript_WandaAndBoyfriendExit1
```
applymovement LOCALID_RUSTURF_TUNNEL_WANDA, RusturfTunnel_Movement_WandaExit1
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, RusturfTunnel_Movement_WandasBoyfriendExit1
waitmovement 0
return
```
### RusturfTunnel_EventScript_WandaAndBoyfriendExit
```
applymovement LOCALID_PLAYER, RusturfTunnel_Movement_PlayerWatchWandaExit
applymovement LOCALID_RUSTURF_TUNNEL_WANDA, RusturfTunnel_Movement_WandaExit
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, RusturfTunnel_Movement_WandasBoyfriendExit
waitmovement 0
return
```
### RusturfTunnel_EventScript_WandasBoyfriendNotice
```
playse SE_PIN
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_RUSTURF_TUNNEL_WANDAS_BF, Common_Movement_Delay48
waitmovement 0
return
```
### RusturfTunnel_Movement_WandaExit1
```
walk_right
walk_right
walk_right
walk_right
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### RusturfTunnel_Movement_WandaExit
```
walk_right
walk_right
walk_right
walk_right
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### RusturfTunnel_Movement_PlayerWatchWandaExit
```
delay_8
walk_in_place_faster_up
delay_16
delay_16
walk_in_place_faster_right
step_end
```
### RusturfTunnel_Movement_Unused1
```
walk_left
walk_in_place_faster_right
step_end
```
### RusturfTunnel_Movement_Unused2
```
walk_down
walk_in_place_faster_up
delay_8
walk_in_place_faster_right
step_end
```
### RusturfTunnel_Movement_Unused3
```
walk_up
walk_in_place_faster_down
delay_8
walk_in_place_faster_right
step_end
```
### RusturfTunnel_Movement_PlayerWatchBoyfriend1
```
walk_left
walk_in_place_faster_right
step_end
```
### RusturfTunnel_Movement_PlayerWatchBoyfriend
```
walk_right
walk_in_place_faster_left
step_end
```
### RusturfTunnel_Movement_BoyfriendFaceRight
```
walk_up
walk_in_place_faster_right
step_end
```
### RusturfTunnel_Movement_WandasBoyfriendExit1
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### RusturfTunnel_Movement_WandasBoyfriendExit
```
walk_up
walk_right
walk_right
walk_right
walk_right
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### RusturfTunnel_Movement_WandasBoyfriendApproachPlayer
```
walk_right
step_end
```
### RusturfTunnel_Movement_BoyfriendApproachWanda1
```
walk_in_place_fast_up
walk_in_place_fast_up
walk_fast_up
walk_fast_right
step_end
```
### RusturfTunnel_Movement_BoyfriendApproachWanda
```
walk_in_place_fast_right
walk_in_place_fast_right
walk_fast_right
walk_in_place_faster_up
step_end
```
### RusturfTunnel_EventScript_TunnelBlockagePos1
```
setvar VAR_TEMP_1, 1
end
```
### RusturfTunnel_EventScript_TunnelBlockagePos2
```
setvar VAR_TEMP_1, 2
end
```
### RusturfTunnel_EventScript_TunnelBlockagePos3
```
setvar VAR_TEMP_1, 3
end
```
### RusturfTunnel_EventScript_AquaGruntBackUp
```
lockall
msgbox RusturfTunnel_Text_ComeAndGetSome, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_RUSTURF_TUNNEL_GRUNT, RusturfTunnel_Movement_GruntAndPeekoBackUp
applymovement LOCALID_RUSTURF_TUNNEL_PEEKO, RusturfTunnel_Movement_GruntAndPeekoBackUp
waitmovement 0
copyobjectxytoperm LOCALID_RUSTURF_TUNNEL_GRUNT
copyobjectxytoperm LOCALID_RUSTURF_TUNNEL_PEEKO
setvar VAR_RUSTURF_TUNNEL_STATE, 3
releaseall
end
```
### RusturfTunnel_Movement_GruntAndPeekoBackUp
```
lock_facing_direction
walk_right
unlock_facing_direction
step_end
```
### RusturfTunnel_EventScript_Peeko
```
lock
faceplayer
waitse
playmoncry SPECIES_WINGULL, CRY_MODE_NORMAL
msgbox RusturfTunnel_Text_Peeko, MSGBOX_DEFAULT
waitmoncry
release
end
```
### RusturfTunnel_EventScript_Grunt
```
lock
faceplayer
playbgm MUS_ENCOUNTER_AQUA, FALSE
msgbox RusturfTunnel_Text_GruntIntro, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_GRUNT_RUSTURF_TUNNEL, RusturfTunnel_Text_GruntDefeat
msgbox RusturfTunnel_Text_GruntTakePackage, MSGBOX_DEFAULT
giveitem ITEM_DEVON_GOODS
closemessage
applymovement LOCALID_PLAYER, RusturfTunnel_Movement_PushPlayerAsideForGrunt
applymovement LOCALID_RUSTURF_TUNNEL_GRUNT, RusturfTunnel_Movement_GruntEscape
waitmovement 0
removeobject LOCALID_RUSTURF_TUNNEL_GRUNT
delay 50
addobject LOCALID_RUSTURF_TUNNEL_BRINEY
applymovement LOCALID_RUSTURF_TUNNEL_BRINEY, RusturfTunnel_Movement_BrineyApproachPeeko1
waitmovement 0
applymovement LOCALID_PLAYER, RusturfTunnel_Movement_PlayerMoveAsideForBriney
applymovement LOCALID_RUSTURF_TUNNEL_BRINEY, RusturfTunnel_Movement_BrineyApproachPeeko2
waitmovement 0
msgbox RusturfTunnel_Text_PeekoGladToSeeYouSafe, MSGBOX_DEFAULT
applymovement LOCALID_RUSTURF_TUNNEL_BRINEY, Common_Movement_FacePlayer
waitmovement 0
message RusturfTunnel_Text_ThankYouLetsGoHomePeeko
waitmessage
waitse
playmoncry SPECIES_WINGULL, CRY_MODE_NORMAL
waitbuttonpress
waitmoncry
closemessage
applymovement LOCALID_PLAYER, RusturfTunnel_Movement_PlayerWatchBrineyExit
applymovement LOCALID_RUSTURF_TUNNEL_BRINEY, RusturfTunnel_Movement_BrineyExit
applymovement LOCALID_RUSTURF_TUNNEL_PEEKO, RusturfTunnel_Movement_PeekoExit
waitmovement 0
removeobject LOCALID_RUSTURF_TUNNEL_BRINEY
removeobject LOCALID_RUSTURF_TUNNEL_PEEKO
clearflag FLAG_DEVON_GOODS_STOLEN
setflag FLAG_RECOVERED_DEVON_GOODS
setvar VAR_RUSTBORO_CITY_STATE, 4
setvar VAR_BRINEY_HOUSE_STATE, 1
setflag FLAG_HIDE_ROUTE_116_MR_BRINEY
release
end
```
### RusturfTunnel_Movement_PushPlayerAsideForGrunt
```
face_down
lock_facing_direction
walk_up
unlock_facing_direction
walk_in_place_faster_left
step_end
```
### RusturfTunnel_Movement_PlayerMoveAsideForBriney
```
walk_down
walk_in_place_faster_up
step_end
```
### RusturfTunnel_Movement_GruntEscape
```
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_left
walk_fast_left
step_end
```
### RusturfTunnel_Movement_BrineyApproachPeeko1
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
### RusturfTunnel_Movement_BrineyExit
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### RusturfTunnel_Movement_PlayerWatchBrineyExit
```
delay_16
delay_8
delay_4
walk_in_place_faster_left
step_end
```
### RusturfTunnel_Movement_BrineyApproachPeeko2
```
delay_16
walk_right
step_end
```
### RusturfTunnel_Movement_PeekoExit
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### RusturfTunnel_EventScript_Mike
```
trainerbattle_single TRAINER_MIKE_2, RusturfTunnel_Text_MikeIntro, RusturfTunnel_Text_MikeDefeat
msgbox RusturfTunnel_Text_MikePostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (16)
### RusturfTunnel_Text_ComeAndGetSome
```
Alors, tu me suis?$
```
### RusturfTunnel_Text_Peeko
```
PIKO: Pii pikooo!$
```
### RusturfTunnel_Text_GruntIntro
```
C'est pas possible…\pCe POKéMON pris en otage ne me\nsert à rien!\pEt quand je pense que je me suis enfui\npar ce tunnel qui ne mène nulle part!\pHé! Toi!\nAlors, tu veux te battre contre moi?$
```
### RusturfTunnel_Text_GruntDefeat
```
Arrrg! Ma carrière de criminel finit mal!$
```
### RusturfTunnel_Text_GruntTakePackage
```
C'est vraiment pas juste…\pLe CHEF m'avait dit que ce serait simple\ncomme bonjour.\pTout ce que j'avais à faire, c'était de\nvoler un paquet chez DEVON.\pPff! Si tu l'veux vraiment,\nt'as qu'à l'prendre!$
```
### RusturfTunnel_Text_PeekoGladToSeeYouSafe
```
PIKO! Tu es sauf! Quelle joie!$
```
### RusturfTunnel_Text_ThankYouLetsGoHomePeeko
```
PIKO te doit la vie!\pOn m'appelle M. MARCO.\nEt toi, comment t'appelles-tu?\p… … … … … … … …\n… … … … … … … …\pAh, alors tu es {PLAYER}{KUN}!\nJe te remercie infiniment!\pDésormais, s'il y a quoi que ce soit,\nn'hésite pas à m'en parler!\pTu peux me trouver dans ma maison\nen bord de mer près du BOIS CLEMENTI.\pAllez, viens PIKO. On rentre.\pPIKO: Pihikoh!$
```
### RusturfTunnel_Text_WhyCantTheyKeepDigging
```
… …\pPourquoi ne peuvent-ils plus creuser?\nLa roche est-elle trop dure?\pMa petite amie m'attend à VERGAZON,\nqui se trouve juste derrière…\pSi ce tunnel pouvait relier MEROUVILLE\net VERGAZON, je pourrais aller la\lvoir tous les jours…\pMais comme ça…\nQue faire?$
```
### RusturfTunnel_Text_ToGetToVerdanturf
```
Pour aller de MEROUVILLE à VERGAZON,\nil faut aller à MYOKARA et ensuite\lpasser par POIVRESSEL et LAVANDIA…$
```
### RusturfTunnel_Text_YouShatteredBoulderTakeHM
```
Waouh! Tu as pulvérisé ce bloc de pierre\nqui bouchait le passage.\pPour que tu saches combien j'apprécie,\nj'aimerais que tu prennes cette CS.$
```
### RusturfTunnel_Text_ExplainStrength
```
Cette CS contient FORCE.\pSi un POKéMON musclé l'apprend, il sera\ncapable de déplacer de gros rochers.$
```
### RusturfTunnel_Text_WandaReunion
```
SYLVIE! Maintenant, on peut\nse voir quand on veut!\pSYLVIE: C'est… merveilleux.\pRepose-toi un peu chez moi.$
```
### RusturfTunnel_Text_BoyfriendOnOtherSideOfRock
```
De l'autre côté de ce rocher…\nC'est là que se trouve mon petit ami.\pIl… Il ne creuse pas le tunnel juste\npour me voir.\pS'il travaille dur, c'est pour que tout\nle monde puisse en profiter.$
```
### RusturfTunnel_Text_MikeIntro
```
Comment appelle-t-on un homme vivant\ndans les montagnes?\pUn homme des montagnes?\nAlors pourquoi n'appelle-t-on pas un\lPOKéMON vivant dans les montagnes\lun POKéMON des montagnes?$
```
### RusturfTunnel_Text_MikeDefeat
```
Mes POKéMON…\nn'ont plus de pouvoir…$
```
### RusturfTunnel_Text_MikePostBattle
```
Ici, ils ont interrompu l'aménagement\npour protéger les POKéMON, pas vrai?\pC'est une question de bien-être!$
```
