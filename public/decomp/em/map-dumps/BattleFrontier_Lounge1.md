# BattleFrontier_Lounge1

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_LOUNGE1`
- **layout** : `LAYOUT_BATTLE_FRONTIER_LOUNGE2`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 0,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_Lounge1_EventScript_Breeder` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_3` | 7,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_Lounge1_EventScript_Boy1` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 5,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_Lounge1_EventScript_Boy2` | `0` |

## Warps (1)
- #0 (4,9) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #5

## Flags référencés (1)
- `FLAG_MET_BATTLE_FRONTIER_BREEDER`

## Variables référencées (5)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_0x8007`
- `VAR_RESULT`

## Scripts (26)
### BattleFrontier_Lounge1_EventScript_Breeder
```
lock
faceplayer
call_if_unset FLAG_MET_BATTLE_FRONTIER_BREEDER, BattleFrontier_Lounge1_EventScript_BreederIntro
call_if_set FLAG_MET_BATTLE_FRONTIER_BREEDER, BattleFrontier_Lounge1_EventScript_AlreadyMetBreeder
setflag FLAG_MET_BATTLE_FRONTIER_BREEDER
goto BattleFrontier_Lounge1_EventScript_ChooseMonToShowBreeder
end
```
### BattleFrontier_Lounge1_EventScript_ChooseMonToShowBreeder
```
special ChoosePartyMon
goto_if_ne VAR_0x8004, PARTY_NOTHING_CHOSEN, BattleFrontier_Lounge1_EventScript_ShowMonToBreeder
goto_if_eq VAR_0x8004, PARTY_NOTHING_CHOSEN, BattleFrontier_Lounge1_EventScript_CancelMonSelect
end
```
### BattleFrontier_Lounge1_EventScript_BreederIntro
```
msgbox BattleFrontier_Lounge1_Text_PokemonBreederIntro, MSGBOX_DEFAULT
return
```
### BattleFrontier_Lounge1_EventScript_AlreadyMetBreeder
```
msgbox BattleFrontier_Lounge1_Text_LetsLookAtYourPokemon, MSGBOX_DEFAULT
return
```
### BattleFrontier_Lounge1_EventScript_ShowMonToBreeder
```
specialvar VAR_RESULT, ScriptGetPartyMonSpecies
goto_if_eq VAR_RESULT, SPECIES_EGG, BattleFrontier_Lounge1_EventScript_ShowEggToBreeder
special BufferVarsForIVRater
goto_if_le VAR_0x8005, 90, BattleFrontier_Lounge1_EventScript_AverageTotalIVs       @ Average of 15
goto_if_le VAR_0x8005, 120, BattleFrontier_Lounge1_EventScript_AboveAverageTotalIVs @ Average of 20
goto_if_le VAR_0x8005, 150, BattleFrontier_Lounge1_EventScript_HighTotalIVs         @ Average of 25
goto_if_ge VAR_0x8005, 151, BattleFrontier_Lounge1_EventScript_VeryHighTotalIVs     @ Average of > 25
end
```
### BattleFrontier_Lounge1_EventScript_ShowEggToBreeder
```
msgbox BattleFrontier_Lounge1_Text_EvenICantTell, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_ChooseMonToShowBreeder
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVStat
```
goto_if_eq VAR_0x8006, STAT_HP, BattleFrontier_Lounge1_EventScript_HighestIVHP
goto_if_eq VAR_0x8006, STAT_ATK, BattleFrontier_Lounge1_EventScript_HighestIVAtk
goto_if_eq VAR_0x8006, STAT_DEF, BattleFrontier_Lounge1_EventScript_HighestIVDef
goto_if_eq VAR_0x8006, STAT_SPEED, BattleFrontier_Lounge1_EventScript_HighestIVSpeed
goto_if_eq VAR_0x8006, STAT_SPATK, BattleFrontier_Lounge1_EventScript_HighestIVSpAtk
goto_if_eq VAR_0x8006, STAT_SPDEF, BattleFrontier_Lounge1_EventScript_HighestIVSpDef
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVValue
```
goto_if_le VAR_0x8007, 15, BattleFrontier_Lounge1_EventScript_HighestIVLow
goto_if_le VAR_0x8007, 25, BattleFrontier_Lounge1_EventScript_HighestIVMid
goto_if_le VAR_0x8007, 30, BattleFrontier_Lounge1_EventScript_HighestIVHigh
goto_if_ge VAR_0x8007, 31, BattleFrontier_Lounge1_EventScript_HighestIVMax
end
```
### BattleFrontier_Lounge1_EventScript_EndBreederComments
```
release
end
```
### BattleFrontier_Lounge1_EventScript_AverageTotalIVs
```
msgbox BattleFrontier_Lounge1_Text_AverageAbility, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVStat
end
```
### BattleFrontier_Lounge1_EventScript_AboveAverageTotalIVs
```
msgbox BattleFrontier_Lounge1_Text_BetterThanAverageAbility, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVStat
end
```
### BattleFrontier_Lounge1_EventScript_HighTotalIVs
```
msgbox BattleFrontier_Lounge1_Text_ImpressiveAbility, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVStat
end
```
### BattleFrontier_Lounge1_EventScript_VeryHighTotalIVs
```
msgbox BattleFrontier_Lounge1_Text_OutstandingAbility, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVStat
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVHP
```
msgbox BattleFrontier_Lounge1_Text_BestAspectHP, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVValue
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVAtk
```
msgbox BattleFrontier_Lounge1_Text_BestAspectAtk, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVValue
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVDef
```
msgbox BattleFrontier_Lounge1_Text_BestAspectDef, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVValue
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVSpeed
```
msgbox BattleFrontier_Lounge1_Text_BestAspectSpeed, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVValue
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVSpAtk
```
msgbox BattleFrontier_Lounge1_Text_BestAspectSpAtk, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVValue
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVSpDef
```
msgbox BattleFrontier_Lounge1_Text_BestAspectSpDef, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_HighestIVValue
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVLow
```
msgbox BattleFrontier_Lounge1_Text_StatRelativelyGood, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_EndBreederComments
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVMid
```
msgbox BattleFrontier_Lounge1_Text_StatImpressive, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_EndBreederComments
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVHigh
```
msgbox BattleFrontier_Lounge1_Text_StatOutstanding, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_EndBreederComments
end
```
### BattleFrontier_Lounge1_EventScript_HighestIVMax
```
msgbox BattleFrontier_Lounge1_Text_StatFlawless, MSGBOX_DEFAULT
goto BattleFrontier_Lounge1_EventScript_EndBreederComments
end
```
### BattleFrontier_Lounge1_EventScript_CancelMonSelect
```
msgbox BattleFrontier_Lounge1_Text_NoTimeForMyAdvice, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Lounge1_EventScript_Boy1
```
msgbox BattleFrontier_Lounge1_Text_SaidMyMonIsOutstanding, MSGBOX_NPC
end
```
### BattleFrontier_Lounge1_EventScript_Boy2
```
msgbox BattleFrontier_Lounge1_Text_DidntDoAnythingSpecialRaisingIt, MSGBOX_NPC
end
```

## Textes (21)
### BattleFrontier_Lounge1_Text_PokemonBreederIntro
```
Ça fait 70 ans que j'élève des POKéMON!\nOn m'appelle l'ELEVEUR DE POKéMON\llégendaire!\pQuand tu auras pris autant de bouteille\nque moi, tu reconnaîtras les capacités\ld'un POKéMON au premier regard.\pTu es un DRESSEUR. Tu veux connaître\nles capacités de tes POKéMON?\pAllez!\nJe vais jeter un œil à tes POKéMON!$
```
### BattleFrontier_Lounge1_Text_AverageAbility
```
Hum…\pCelui-là, je dirais que ses capacités\nsont dans la moyenne.$
```
### BattleFrontier_Lounge1_Text_BetterThanAverageAbility
```
Hum…\pCelui-là, je dirais que ses capacités\nsont au-dessus de la moyenne.$
```
### BattleFrontier_Lounge1_Text_ImpressiveAbility
```
Hum…\pCelui-là, je dirais que ses capacités\nsont plutôt impressionnantes!$
```
### BattleFrontier_Lounge1_Text_OutstandingAbility
```
Hum…\pCelui-là, je dirais que ses capacités\nsont vraiment excellentes!$
```
### BattleFrontier_Lounge1_Text_BestAspectHP
```
Son point fort, ce sont ses PV…$
```
### BattleFrontier_Lounge1_Text_BestAspectAtk
```
Son point fort, c'est son ATTAQUE…$
```
### BattleFrontier_Lounge1_Text_BestAspectDef
```
Son point fort, c'est sa DEFENSE…$
```
### BattleFrontier_Lounge1_Text_BestAspectSpAtk
```
Son point fort, c'est son ATTAQUE\nSPECIALE…$
```
### BattleFrontier_Lounge1_Text_BestAspectSpDef
```
Son point fort, c'est sa DEFENSE\nSPECIALE…$
```
### BattleFrontier_Lounge1_Text_BestAspectSpeed
```
Son point fort, c'est sa VITESSE…$
```
### BattleFrontier_Lounge1_Text_StatRelativelyGood
```
Cette stat est relativement bonne.\nHum… Oui, oui.$
```
### BattleFrontier_Lounge1_Text_StatImpressive
```
Cette stat est assez impressionnante.\nHum… Oui, oui.$
```
### BattleFrontier_Lounge1_Text_StatOutstanding
```
Cette stat est excellente!\nHum… Oui, oui.$
```
### BattleFrontier_Lounge1_Text_StatFlawless
```
Cette stat est parfaite!\nHum… Oui, oui.$
```
### BattleFrontier_Lounge1_Text_NoTimeForMyAdvice
```
Comment?\nTu n'as pas le temps?\pTu ne devrais jamais refuser l'aide de\ntes aînés!$
```
### BattleFrontier_Lounge1_Text_HaveBusinessNeedsTending
```
Yes, what is it now?\pI have business that needs tending!\nSave it for next time!$
```
### BattleFrontier_Lounge1_Text_LetsLookAtYourPokemon
```
Dis, mon petit! Tu aimerais en savoir\nplus sur les capacités de tes POKéMON?\pBien, bien!\nJetons un œil à ces POKéMON!$
```
### BattleFrontier_Lounge1_Text_EvenICantTell
```
Comment pourrais-je évaluer un POKéMON\nqui n'a pas encore éclos!\pMontre-moi un POKéMON!\nC'est un POKéMON que je veux voir!$
```
### BattleFrontier_Lounge1_Text_SaidMyMonIsOutstanding
```
Il a dit que mon POKéMON est\nexcellent! Je m'en suis bien occupé!$
```
### BattleFrontier_Lounge1_Text_DidntDoAnythingSpecialRaisingIt
```
Mon POKéMON est excellent, il a dit!\nJe n'ai rien fait de spécial, pourtant…$
```
