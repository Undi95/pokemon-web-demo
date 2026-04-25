# LilycoveCity_LilycoveMuseum_1F

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_LILYCOVE_MUSEUM_1F`
- **layout** : `LAYOUT_LILYCOVE_CITY_LILYCOVE_MUSEUM_1F`
- **music** : `MUS_LILYCOVE_MUSEUM`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (10 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BEAUTY` | 5,12 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_LilycoveMuseum_1F_EventScript_Greeter` | `0` |
| `LOCALID_MUSEUM_1F_CURATOR` | `OBJ_EVENT_GFX_GENTLEMAN` | 16,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_LilycoveMuseum_1F_EventScript_Curator` | `FLAG_HIDE_LILYCOVE_MUSEUM_CURATOR` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 13,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_LilycoveMuseum_1F_EventScript_SchoolKidM` | `0` |
| `` | `OBJ_EVENT_GFX_ARTIST` | 13,10 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `LilycoveCity_LilycoveMuseum_1F_EventScript_Artist1` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 2,8 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_LilycoveMuseum_1F_EventScript_NinjaBoy` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 3,8 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_LilycoveMuseum_1F_EventScript_Woman1` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 11,3 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_LilycoveMuseum_1F_EventScript_Woman2` | `FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_1` |
| `LOCALID_MUSEUM_1F_ARTIST_2` | `OBJ_EVENT_GFX_ARTIST` | 19,3 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_LilycoveMuseum_1F_EventScript_Artist2` | `FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_4` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 2,2 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_LilycoveMuseum_1F_EventScript_FatMan` | `FLAG_HIDE_LILYCOVE_MUSEUM_TOURISTS` |
| `` | `OBJ_EVENT_GFX_PSYCHIC_M` | 6,2 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_LilycoveMuseum_1F_EventScript_PsychicM` | `FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_3` |

## Warps (3)
- #0 (9,13) → `MAP_LILYCOVE_CITY` warp #3
- #1 (10,13) → `MAP_LILYCOVE_CITY` warp #13
- #2 (16,1) → `MAP_LILYCOVE_CITY_LILYCOVE_MUSEUM_2F` warp #0

## BG events / signs (16)
- (1,1) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_FantasyPainting`
- (2,1) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_FantasyPainting`
- (5,1) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_BerryPainting`
- (6,1) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_BerryPainting`
- (9,1) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_OldPainting`
- (3,6) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_WomanPainting`
- (2,6) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_WomanPainting`
- (15,12) [sign] → `LilycoveCity_LilycoveMuseum_EventScript_BirdSculpture`
- (11,1) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_OldPainting`
- (6,6) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_GrassPokemonPainting`
- (17,9) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_StoneTablet`
- (19,1) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_LegendaryPokemonPainting`
- (20,1) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_LegendaryPokemonPainting`
- (18,9) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_StoneTablet`
- (18,11) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_PokeBallSculpture`
- (16,9) [sign] → `LilycoveCity_LilycoveMuseum_1F_EventScript_StoneTablet`

## Variables référencées (2)
- `VAR_FACING`
- `VAR_RESULT`

## Scripts (30)
### LilycoveCity_LilycoveMuseum_1F_EventScript_Greeter
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_WelcomeToLilycoveMuseum, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_Curator
```
lockall
applymovement LOCALID_MUSEUM_1F_CURATOR, Common_Movement_FacePlayer
message LilycoveCity_LilycoveMuseum_1F_Text_ImCuratorHaveYouViewedOurPaintings
waitmessage
multichoice 20, 8, MULTI_VIEWED_PAINTINGS, TRUE
goto_if_eq VAR_RESULT, 0, LilycoveCity_LilycoveMuseum_1F_EventScript_SawPaintings
goto_if_eq VAR_RESULT, 1, LilycoveCity_LilycoveMuseum_1F_EventScript_NotYet
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_NotYet
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_NotDisturbYouTakeYourTime, MSGBOX_NPC
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_SawPaintings
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_HaveYouAnInterestInPaintings, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, LilycoveCity_LilycoveMuseum_1F_EventScript_NotInterested
goto_if_eq VAR_RESULT, YES, LilycoveCity_LilycoveMuseum_1F_EventScript_InterestedInPaintings
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_NotInterested
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_HonoredYoudVisitInSpiteOfThat, MSGBOX_SIGN
releaseall
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_InterestedInPaintings
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_ExcellentCanYouComeWithMe, MSGBOX_SIGN
applymovement LOCALID_MUSEUM_1F_CURATOR, LilycoveCity_LilycoveMuseum_1F_Movement_CuratorEnterStairs
waitmovement 0
removeobject LOCALID_MUSEUM_1F_CURATOR
switch VAR_FACING
case DIR_NORTH, LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorNorth
case DIR_WEST, LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorWest
case DIR_EAST, LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorEast
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorNorth
```
lockall
applymovement LOCALID_PLAYER, LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorNorth
waitmovement 0
warp MAP_LILYCOVE_CITY_LILYCOVE_MUSEUM_2F, 11, 8
waitstate
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorWest
```
lockall
applymovement LOCALID_PLAYER, LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorWest
waitmovement 0
warp MAP_LILYCOVE_CITY_LILYCOVE_MUSEUM_2F, 11, 8
waitstate
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorEast
```
lockall
applymovement LOCALID_PLAYER, LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorEast
waitmovement 0
warp MAP_LILYCOVE_CITY_LILYCOVE_MUSEUM_2F, 11, 8
waitstate
end
```
### LilycoveCity_LilycoveMuseum_1F_Movement_CuratorEnterStairs
```
walk_up
step_end
```
### LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorWest
```
walk_left
walk_up
step_end
```
### LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorEast
```
walk_right
walk_up
step_end
```
### LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorNorth
```
walk_up
walk_up
step_end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_OldPainting
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_VeryOldPainting, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_FantasyPainting
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_OddLandscapeFantasticScenery, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_WomanPainting
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_PaintingOfBeautifulWoman, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_LegendaryPokemonPainting
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_PaintingOfLegendaryPokemon, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_GrassPokemonPainting
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_PaintingOfGrassPokemon, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_BerryPainting
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_PaintingOfBerries, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_EventScript_BirdSculpture
```
msgbox LilycoveCity_LilycoveMuseum_Text_BirdPokemonSculptureReplica, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_PokeBallSculpture
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_BigPokeBallCarvedFromStone, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_StoneTablet
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_StoneTabletWithAncientText, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_SchoolKidM
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_MustntForgetLoveForFineArts, MSGBOX_NPC
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_Artist1
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_ThisMuseumIsInspiration, MSGBOX_NPC
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_NinjaBoy
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_ThisLadyIsPretty, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_Woman1
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_ThisPokemonIsAdorable, MSGBOX_SIGN
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_Woman2
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_HeardMuseumGotNewPaintings, MSGBOX_NPC
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_PsychicM
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_CuratorHasBeenCheerful, MSGBOX_NPC
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_Artist2
```
lock
faceplayer
msgbox LilycoveCity_LilycoveMuseum_1F_Text_AimToSeeGreatPaintings, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_MUSEUM_1F_ARTIST_2, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### LilycoveCity_LilycoveMuseum_1F_EventScript_FatMan
```
msgbox LilycoveCity_LilycoveMuseum_1F_Text_MuseumTouristDestination, MSGBOX_NPC
end
```

## Textes (24)
### LilycoveCity_LilycoveMuseum_1F_Text_WelcomeToLilycoveMuseum
```
Bienvenue au MUSEE NENUCRIQUE.\pPrenez le temps d'apprécier notre\nsuperbe collection sur les POKéMON.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_ImCuratorHaveYouViewedOurPaintings
```
Je suis le CONSERVATEUR de ce\nMUSEE des beaux-arts.\pC'est encourageant de voir quelqu'un\nd'aussi jeune dans notre MUSEE.\pAs-tu déjà vu notre collection de\ntableaux?$
```
### LilycoveCity_LilycoveMuseum_1F_Text_NotDisturbYouTakeYourTime
```
Bon, alors je ne te dérange pas.\nPrends tout ton temps.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_HaveYouAnInterestInPaintings
```
Oh? Tu m'as tout l'air d'un DRESSEUR\nde POKéMON.\pEt tu t'intéresses également à la\npeinture?$
```
### LilycoveCity_LilycoveMuseum_1F_Text_HonoredYoudVisitInSpiteOfThat
```
Je vois…\pJe suis honoré que tu nous rendes\nvisite malgré tout.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_ExcellentCanYouComeWithMe
```
Ah, très bien!\nTu aimes effectivement la peinture!\pAlors peut-être voudrais-tu me suivre?$
```
### LilycoveCity_LilycoveMuseum_1F_Text_VeryOldPainting
```
C'est un tableau très ancien.\nLa peinture s'écaille ici et là.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_OddLandscapeFantasticScenery
```
C'est un curieux paysage avec des vues\nétranges et fantastiques.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_PaintingOfBeautifulWoman
```
C'est la représentation d'une\ncharmante femme avec un POKéMON\lsur ses genoux.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_PaintingOfLegendaryPokemon
```
C'est la représentation d'un POKéMON\nlégendaire de l'ancien temps.\pIl est issu de l'imagination du peintre.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_PaintingOfGrassPokemon
```
C'est la représentation de POKéMON du\ntype PLANTE qui vacillent au vent.\pIls ont l'air d'aimer sentir la caresse\ndu vent.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_PaintingOfBerries
```
C'est une exquise représentation\nde BAIES.\pCe tableau vous donnerait faim!$
```
### LilycoveCity_LilycoveMuseum_Text_BirdPokemonSculptureReplica
```
C'est une réplique de sculpture connue.\pC'est un antique POKéMON OISEAU.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_BigPokeBallCarvedFromStone
```
C'est une grosse POKé BALL sculptée\ndans une pierre noire.\pElle était apparemment utilisée jadis,\nlors de festivals.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_StoneTabletWithAncientText
```
C'est une immense plaque en pierre. \nDes POKéMON et un texte compact,\lécrit dans une langue ancienne\lindéchiffrable, sont gravés dessus.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_WorksOfMagnificence
```
Hmmm…\nWhat works of great magnificence…$
```
### LilycoveCity_LilycoveMuseum_1F_Text_MustntForgetLoveForFineArts
```
C'est un plaisir d'affronter les\nPOKéMON, je te l'accorde.\pMais il ne faut pas oublier notre amour\npour les beaux-arts.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_ThisMuseumIsInspiration
```
Ce MUSEE D'ART… Eh bien, tu peux y\nvoir beaucoup de fabuleux tableaux.\pEt le CONSERVATEUR est extraordinaire.\pPour les artistes tels que moi, ce MUSEE\nest une véritable source d'inspiration.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_ThisLadyIsPretty
```
Cette dame est jolie!\nElle est comme maman!$
```
### LilycoveCity_LilycoveMuseum_1F_Text_ThisPokemonIsAdorable
```
Ce POKéMON est adorable!\nTout comme notre petit fiston!$
```
### LilycoveCity_LilycoveMuseum_1F_Text_HeardMuseumGotNewPaintings
```
J'ai entendu dire que ce MUSEE D'ART\navait acquis de nouveaux tableaux.\pAlors évidemment, je m'y suis\nprécipitée.\pLes nouveaux tableaux sont-ils en\nhaut, à l'étage?$
```
### LilycoveCity_LilycoveMuseum_1F_Text_CuratorHasBeenCheerful
```
Ces temps-ci, le CONSERVATEUR est\nplus joyeux que d'habitude.\pJe parie qu'il lui est arrivé quelque\nchose de bien. C'est sûr!$
```
### LilycoveCity_LilycoveMuseum_1F_Text_AimToSeeGreatPaintings
```
Je viens ici pour voir plein de grands\ntableaux et en tirer des enseignements.\pJe rêve d'avoir un jour mes œuvres\nexposées ici.$
```
### LilycoveCity_LilycoveMuseum_1F_Text_MuseumTouristDestination
```
Le MUSEE D'ART est devenu très\nprisé par les touristes.\pC'est super pour NENUCRIQUE.\nNon, super pour la région de HOENN!\pJ'ai entendu dire que tous les tableaux\ndu haut proviennent du même DRESSEUR.$
```
