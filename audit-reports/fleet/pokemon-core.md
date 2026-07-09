# Audit READ-ONLY 1:1 — domaine « pokemon-core »

> Généré par la flotte d'agents audit (READ-ONLY). Source de vérité = décomp
> `D:/Projet 1/decomps/pokeemeraude/src/*.c`. Notre repo = `D:/Projet 1/pokemon-web-demo`.
> Doctrine : miroir STRICT 1:1 (mêmes noms fichiers/fns/globals, corps transcrit).
> Combat `battle_*` = EXEMPT (chantier en pause). Chiffrement BoxMon (substructs) =
> adaptation modèle-plat ASSUMÉE et documentée (voir §pokemon.c).

Périmètre : pokemon.c, pokemon_animation.c, trainer_pokemon_sprites.c, pokemon_icon.c,
pokemon_size_record.c, daycare.c, evolution_scene.c, evolution_graphics.c, mon_markings.c,
pokedex.c, pokedex_area_screen.c, pokedex_cry_screen.c.

---

## pokemon.c → src/pokemon.ts
Statut : 🟡 PARTIEL
Fonctions : 50/160 dans `src/pokemon.ts` + 14 « ailleurs » = **64/160 portées** (≈40 %). 96 manquantes.

### Modèle & adaptation-clé (NON une divergence, mais à connaître)
Notre `struct Pokemon` (`src/pokemon.ts:128`) stocke les champs **décodés en clair** ;
le décomp les stocke chiffrés dans `BoxPokemon.secure.substructs` (4 substructs XOR-chiffrés,
ordre par personality % 24). Conséquence : toute la **couche chiffrement** est volontairement
absente et remplacée par des accès directs. Fns concernées (toutes ABSENTES, justifiées) :
`EncryptBoxMon`, `DecryptBoxMon`, `GetSubstruct`, `CalculateBoxMonChecksum`,
`GetMonData3`/`GetBoxMonData3` (impl chiffrée → fusionnée dans notre `GetMonData` plat),
`SetBoxMonData` (→ fusionné dans `SetMonData`). C'est cohérent et documenté dans les JSDoc.
`GetMonData`/`SetMonData` (`src/pokemon.ts:1038`/`:1182`) sont un `switch(field)` plat bien
transcrit (IVS packé, RIBBONS packé, KNOWN_MOVES bitmask — tous 1:1). ⚠️ le `default: return 0`
de `GetMonData` masque les champs non gérés (le décomp a un `retVal` par défaut = 0 aussi, OK).

### Ailleurs (14 — trouvées sous le même nom hors pokemon.ts)
- `ClearBattleMonForms` → `src/engine/battle/battle-setup-helpers.ts`
- `CopyMonToPC` → `src/engine/battle/party-storage.ts`
- `GiveMonToPlayer` → `src/engine/battle/party-storage.ts`
- `DoMonFrontSpriteAnimation`, `PokemonSummaryDoMonAnimation`, `HasTwoFramesAnimation`,
  `StopPokemonAnimationDelayTask` → `src/pokemon_animation.ts` (relocalisation domaine anim)
- `GetEvolutionTargetSpecies`, `HandleSetPokedexFlag`, `SpeciesToNationalPokedexNum` → `src/battle_main.ts` **(nom≠, décomp = pokemon.c)** — mauvais foyer, à rapatrier
- `GetFlavorRelationByPersonality` → `src/engine/battle/data/flavor-compat.ts`
- `GetItemEffectParamOffset` → `src/engine/battle/data/item-effects.ts`
- `HoennToNationalOrder`, `NationalPokedexNumToSpecies`, `NationalToHoennOrder` → `src/engine/ui/pokedex-flags.ts`
- `SpeciesToHoennPokedexNum` → `src/engine/data/game-data.ts`
- `PokemonUseItemEffects` → `src/engine/bag/bag-item-effects.ts` (gros système items in-battle)

### Divergences de CORPS (fns portées mais corps ≠ décomp)
1. **`CalculateMonStats`** (`src/pokemon.ts:590` ↔ décomp pokemon.c:2824) — 3 écarts :
   - décomp : `level = GetLevelFromMonExp(mon)` PUIS `SetMonData(MON_DATA_LEVEL, &level)`.
     Nous : `const level = mon.level || 1`, **jamais** re-dérivé de l'EXP, **MON_DATA_LEVEL pas re-set**.
     → un mon dont l'EXP franchit un palier sans que `.level` soit à jour aura des stats fausses.
   - décomp pose `gBattleScripting.levelUpHP = newMaxHP - oldMaxHP` (=1 si 0). **Absent chez nous**
     → l'affichage « +N PV » au level-up n'a pas sa source 1:1 (probablement calculé ailleurs).
   - décomp GARDE le bug Pomeg berry (`currentHP += diff` peut passer ≤0, pas de clamp hors BUGFIX).
     Nous : `if (mon.hp <= 0) mon.hp = 1` → comportement **BUGFIX**, pas 1:1 (divergence assumée ?).
2. **`MonGainEVs`** (`src/pokemon.ts:323` ↔ décomp pokemon.c:5975) — port PARTIEL :
   - signature `defeatedSpeciesEnum: string` (adaptation modèle) au lieu de `u16 defeatedSpecies`.
   - **Pokérus ×2 NON câblé** (`multiplier = 1` en dur, commentaire l'admet) ; **MACHO_BRACE ×2 différé** ;
     hold-effects EV (`HOLD_EFFECT_*_POWER`, Pokérus) du décomp non transcrits. Le cap MAX_TOTAL/PER_STAT
     est correct. → gain d'EV sous-évalué quand pokérus actif / macho brace tenu.

### Manquantes VIVANTES (single-player, à porter) — extrait priorisé
- `CreateMonWithNature` (2306) **[VIVANT]** — utilisé par de nombreux scripts de dons/starters.
  ⚠️ GOTCHA connu : NE PAS recâbler la génération WILD dessus (casse Cute Charm) ; la voie wild
  reste `CreateMonWithGenderNatureLetter`/chemin dédié. Absent aussi : `CreateMonWithGenderNatureLetter`
  (2319), `CreateMaleMon` (2350), `CreateMonWithIVsPersonality`/`OTID`, `CreateMonWithEVSpread(NatureOTID)`.
- `GetLevelFromMonExp` (2911) **[VIVANT, CRITIQUE]** — requis par un vrai `CalculateMonStats` 1:1.
- `MonTryLearningNewMove` (3015) **[VIVANT]** — apprentissage de capacités au level-up (evolution/party).
- `TryIncrementMonLevel` (6211) **[VIVANT]** — montée de niveau (combat/rare candy).
- `HealStatusConditions` (5293) **[VIVANT]** — soin statut (centre Pokémon / objets).
- `GetEvolutionTargetSpecies` (5490) **[VIVANT]** — présent en STUB dans battle_main.ts (voir stubs).
- `GetMoveRelearnerMoves`/`GetNumberOfRelearnableMoves`/`GetLevelUpMovesBySpecies` (6271/6321/6310) **[VIVANT]** — Move Relearner (Fallarbor) + résumé.
- `SpeciesToCryId` (5688) **[VIVANT]** — cri Pokédex/combat (data-driven).
- `GetMonSpritePalStruct(FromOtIdPersonality)`, `GetMonFrontSpritePal`, `GetMonSpritePalFromSpeciesAndPersonality`
  (6501-6531) **[VIVANT]** — palettes sprites mon (shiny). Utilisées party/summary/combat.
- `SetMultiuseSpriteTemplateToPokemon/TrainerBack/TrainerFront` (3488-3526) **[VIVANT]** — templates sprites mon/dresseur.
- `SetMonPreventsSwitchingString` (6618), `RemoveMonPPBonus`/`RemoveBattleMonPPBonus` (6643/6650) **[VIVANT]**.
- `GetTrainerEncounterMusicId` (5855) **[VIVANT]** — musique de rencontre dresseur.
- `HoennPokedexNumToSpecies` (5610), `SpeciesToPokedexNum` (6364), `IsSpeciesInHoennDex` (6379) **[VIVANT]** (Pokédex).
- `CreateMonSpritesGfxManager`/`DestroyMonSpritesGfxManager`/`MonSpritesGfxManager_GetSpritePtr` (7021+) **[VIVANT]** — gestionnaire GFX sprites (summary/party/starter).
- `PlayMapChosenOrBattleBGM`/`GetBattleBGM`/`PlayBattleBGM` (6394-6479) **[VIVANT]** (audio, mais data 1:1 attendu).

### Manquantes CODE-MORT ou combat/link-only (basse priorité)
- Deoxys : `ShouldIgnoreDeoxysForm` (2643), `GetDeoxysStat` (2699), `SetDeoxysStats` (2716) — combat/forme, quasi mort (Deoxys hors Émeraude base).
- Battle Tower/frontier/apprentice : `CreateBattleTowerMon(_HandleLevel)`, `ConvertPokemonToBattleTowerPokemon`,
  `CreateApprenticeMon`, `GetUnionRoomTrainerPic/Class`, `GetTrainerPartnerName`, `GetOpposingLinkMultiBattlerId`,
  `GetOwnOpposingLinkMultiBattlerId`, `GetLinkTrainerFlankId`, `GetBattlerMultiplayerId`, `GetPlayerFlankId` — frontier/link (EXEMPT-adjacent).
- `CreateSecretBaseEnemyParty` (4550), `GetSecretBaseTrainerPicIndex/Class` — secret base (partiel ailleurs).
- `CreateEventMon`/`CreateEnemyEventMon` (2634/2774) — mystery gift (link, EXEMPT).
- `BattleAnimateFrontSprite`/`BattleAnimateBackSprite`/`DoMonFrontSpriteAnimation` (combat) — mais DoMonFront est ailleurs (pokemon_animation.ts).
- `CopyPlayerPartyMonToBattleData` (4655), `CountAliveMonsInBattle` (3375), `ShouldGetStatBadgeBoost` (3408),
  `CalculateBaseDamage`… (combat — plusieurs sont ailleurs / partiellement dans le foyer).
- `ExecuteTableBasedItemEffect`/`PokemonUseItemEffects` — le 2e est ailleurs (bag-item-effects.ts).
- `DrawSpindaSpots`(Unused) (5787/5795) — cosmétique Spinda (VIVANT léger, non porté).

### Stubs suspects
- `src/battle_main.ts:3845` `function GetEvolutionTargetSpecies(_mon, _evoMode, _levelUpBits): number` —
  args préfixés `_` = **STUB** (probable `return 0`). L'évolution VIVANTE (pierre/niveau/échange) en dépend.
  À vérifier : voir §evolution_scene.c. Nom au bon nom mais MAUVAIS foyer (décomp = pokemon.c) + corps stub.

### Fuites harness / non-conformités
- Sondes dev `(globalThis).__CreateMon` / `__GiveMonInitialMoveset` posées dans `pokemon.ts` (l.757/859) —
  substrat de vérif, tolérable mais = fuite mineure dans un fichier miroir.
- `PokemonInstance`/`createPokemonInstance` : **bien supprimés** (interface + factory). Restent uniquement
  des mentions en commentaires d'historique (« calque effondré 2026-07-02 »). Aucun pont/type fantôme actif.

---

## pokemon_animation.c → src/pokemon_animation.ts
Statut : ✅ MIROIR
Fonctions : ≈237/241 (98 %). Fichier fortement transcrit.
Ailleurs (relocalisées DEPUIS pokemon.c, bon foyer domaine anim) : `DoMonFrontSpriteAnimation`,
`PokemonSummaryDoMonAnimation`, `HasTwoFramesAnimation`, `StopPokemonAnimationDelayTask`,
`BattleAnimateFrontSprite`, `Task_*AnimateAfterDelay`.
Manquantes :
- `GetSpeciesBackAnimSet` (885), `LaunchAnimationTaskForBackSprite` (956), `Task_HandleMonAnimation` (911)
  [combat — back sprite ; appelées par `BattleAnimateBackSprite` (pokemon.c:6862)] → EXEMPT combat.
- `SetSpriteCB_MonAnimDummy` (979) [helper trivial, VIVANT léger].
Note factory : les 9 `Anim_ShakeGlow{Red,Green,Blue}[_Fast/_Slow]` NE sont PAS absentes — elles
sont générées par `makeShakeGlow(dur, count, color)` (`pokemon_animation.ts:1747`) et enregistrées dans
`sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_*]`. Transcription helper-isée = acceptable (params 1:1 vérifiés).
Stubs suspects : aucun. Le split substrat OAM (résumé = réel / combat = flag) est documenté en tête et cohérent.

---

## trainer_pokemon_sprites.c → src/trainer_pokemon_sprites.ts
Statut : 🟡 PARTIEL (renommage-port assumé)
Fonctions : ≈5/23 par nom décomp (cartograph). Le fichier EXISTE et gère le vrai système mon-pic.
Divergence de NOMMAGE (assumée, documentée en tête) : la fn publique s'appelle `CreateMonPicSprite_Affine`
au lieu du décomp `CreateMonPicSprite`/`CreatePicSprite` ; free = `FreeAndDestroyMonPicSprite`/
`FreeAndDestroyPicSpriteInternal`/`FreeAndDestroyTrainerPicSprite` (ceux-là 1:1). `sSpritePics[]` + registry OK.
Adaptation hardware-exempt (ASSET) : `DecompressPic` (ROM sync) remplacé par un substrat sync
`_monPicSubstrate` (Map species vers {tileData,palette}) pré-rempli async par le caller AVANT l'appel sync 1:1.
Justifié (assets = chargement propre, cf. hardware-non-1to1-exemptions).
Manquantes (VIVANT single-player, couvertes par renommage ci-dessus ou trainer_card EXEMPT-adjacent) :
`CreateTrainerCardSprite`/`CreateTrainerCardTrainerPicSprite`/`CreateTrainerCardMonIconSprite` (trainer_card),
`LoadMonPicInWindow`/`LoadPicSpriteInWindow`/`LoadTrainerPicInWindow` (fenêtres — naming/trade),
`AssignSpriteAnimsTable`, `DecompressPic(_HandleDeoxys)`, `LoadPicPaletteBySlot`/`ByTagOrSlot`.
Non-conformité : noms de fns diffèrent du décomp (à réconcilier vers `CreateMonPicSprite`/`CreatePicSprite`
avec un flag affine plutôt qu'un suffixe `_Affine`, pour la doctrine miroir stricte).

---

## pokemon_icon.c → src/pokemon_icon.ts
Statut : 🟡 AMORCE (renommage-port)
Fonctions : ≈6-8/23. Noms décomp présents : `FreeAndDestroyMonIconSprite`, `LoadMonIconPalette`,
`FreeMonIconPalette`, `GetIconSpecies`, `GetIconSpeciesNoPersonality`, `CreateMonIconNoPersonality`.
Manquantes VIVANTES (single-player — party menu, storage box, résumé, level-up) :
`CreateMonIcon` (canonique), `CreateMonIconSprite`, `SpriteCB_MonIcon`, `UpdateMonIconFrame`,
`GetMonIconTiles`, `GetMonIconPtr`, `GetMonIconPaletteIndexFromSpecies`, `GetValidMonIconPalIndex`,
`LoadMonIconPalettes`/`FreeMonIconPalettes`/`TryLoadAllMonIconPalettesAtOffset`,
`Safe(Load/Free)MonIconPalette`, `SetPartyHPBarSprite`, `FreeAndDestroyMonIconSprite_`.
Non-conformité : `CreateMonIconNoPersonality` = nom custom (décomp a `CreateMonIcon(species,...)`
avec un paramètre `handleDeoxys`, pas une variante "NoPersonality"). Icônes mon = besoin single-player
majeur (party/PC/résumé) → gros reliquat.

---

## pokemon_size_record.c → src/pokemon_size_record.ts
Statut : ✅ MIROIR
Fonctions : 12/12. Helpers internes portés ligne à ligne : `GetMonSizeHash` (46), `TranslateBigMonSizeTableIndex`
(61), `GetMonSize` (73), `FormatMonSizeRecord` (90), `CompareMonSize` (102), `GetMonSizeRecordInfo` (140).
Les 6 specials Seedot/Lotad (`Init/Get/Compare x {Seedot,Lotad}`) NE sont PAS absents : ils sont
enregistrés via `registerSpecial('InitSeedotSizeRecord', …)` etc. (arrow lambdas, l.182-209). Corps 1:1
vérifié (s16 casts explicites, `sBigMonSizeTable[16]` valeurs exactes, DEFAULT_MAX_SIZE=0x8000, gText_Marco="MARCUS").
Adaptations mineures assumées : `sizeRecord` passé par nom de VAR (au lieu d'un pointeur), `#ifdef
UNITS_IMPERIAL` non activé (FR), height/weight via `GetPokedexHeightWeight`. Aucun stub.
ORACLE : PNJ Pacifidlog (records Seedot/Lotad) — mettre un Seedot/Lotad en 1re position et lui parler.

---

## daycare.c → src/daycare.ts
Statut : 🔴 DIVERGENT / AMORCE (1/67)
Fonctions : 1/67 (`CreateEgg`). Le reste (66) = ABSENT.
`CreateEgg` (`daycare.ts:54` ↔ daycare.c:828) : port fidèle avec adaptations assumées (retourne le mon
au lieu d'un pointeur sortie ; nickname = `getString('gText_EggNickname')` "OEUF" au lieu du
`sJapaneseEggNickname` japonais ; `eggCycles` via `gSpeciesInfo[species]`). OK pour `giveegg` script.
Manquantes VIVANTES (Pension Route 117 — système complet single-player) :
- Stockage : `StorePokemonInDaycare`, `StorePokemonInEmptyDaycareSlot`, `StoreSelectedPokemonInDaycare`,
  `TakePokemonFromDaycare`, `TakeSelectedPokemonFromDaycare(...ShiftSlots)`, `ShiftDaycareSlots`,
  `Daycare_FindEmptySpot`, `ClearDaycareMon(Mail)`, `ClearAllDaycareData`, `CountPokemonInDaycare`, `GetDaycarePokemonCount`.
- Reproduction : `TriggerPendingDaycareEgg`, `TryProduceOrHatchEgg`, `GiveEggFromDaycare`,
  `DetermineEggSpeciesAndParentSlots`, `GetEggSpecies`, `SetInitialEggData`, `BuildEggMoveset`,
  `InheritIVs`/`RemoveIVIndexFromList`, `GetParentToInheritNature`, `AlterEggSpeciesWithIncenseItem`,
  `GiveVoltTackleIfLightBall`, `EggGroupsOverlap`, `GetDaycareCompatibilityScore(FromSave)`, `SetDaycareCompatibilityString`.
- Menu/UI : `ShowDaycareLevelMenu`, `Task_HandleDaycareLevelMenuInput`, `GetDaycareLevelMenuText/LevelText`,
  `DaycarePrintMonInfo/Lvl/Nickname`, `GetNumLevelsGainedFromDaycare/Steps`, `ApplyDaycareExperience`,
  `GetDaycareCost(ForMon/ForSelectedMon)`, `GetLevelAfterDaycareSteps`.
Wiring décomp = specials (GetDaycareCostForMon, etc.) appelés par scripts overworld = VIVANT.
→ Système daycare quasi-entièrement à porter (chantier dédié).

---

## evolution_scene.c → ABSENT (stubs dans src/battle_main.ts)
Statut : 🔴 DIVERGENT (stubs silencieux qui BLOQUENT l'évolution)
Fonctions : 0/25 portées. `EvolutionScene`/`TradeEvolutionScene`/`BeginEvolutionScene`/`Task_EvolutionScene`
+ toute la scène (BG anim palette, Shedinja, mon anim/cry) = ABSENTS.
STUBS CRITIQUES (`src/battle_main.ts`) :
- `GetEvolutionTargetSpecies(_mon,_evoMode,_levelUpBits)` (l.3845) → `return SPECIES_NONE` inconditionnel.
  ⚠️ le décomp GetEvolutionTargetSpecies vit dans **pokemon.c** (table `gEvolutionTable` + matcher condition
  niveau/pierre/échange/heure/beauté) ; ici c'est un stub → AUCUN Pokémon n'évolue jamais (level-up,
  pierre, échange). Appelé par `TryEvolvePokemon` (battle_main.c:5201, PORTÉ) + `PokemonUseItemEffects`
  (pokemon.c:5170) + party_menu.c:5104 (pierres). Dette "R3" documentée mais = trou single-player MAJEUR.
- `EvolutionScene(_mon,_species,_canStopEvo,_partyId)` (l.3852) → `console.warn(...)` no-op.
`TryEvolvePokemon` / `FreeResetData_ReturnToOvOrDoEvolutions` (flux post-combat) SONT portés dans
battle_main.ts, mais tournent à vide faute de cible d'évolution.
Non-conformité de foyer : ces 2 fns devraient vivre en pokemon.ts (GetEvolutionTargetSpecies) et
evolution_scene.ts (EvolutionScene), pas dans battle_main.ts.
ORACLE : monter un Chenipan/Poussifeu au niveau d'évolution en combat → devrait déclencher la scène (ne le fait pas).

---

## evolution_graphics.c → ABSENT
Statut : ⬜ ABSENT (0/37)
Fonctions : 0/37. Toute la couche sparkles d'évolution (`EvolutionSparkles_*`, `CreateSparkle_*`,
`Task_Sparkles_*`, `Task_CycleEvolutionMonSprite_*`, `SpriteCB_*`, `LoadEvoSparkleSpriteAndPal`,
`SetEvoSparklesMatrices`) = absente. Dépendance directe d'evolution_scene.c → bloqué tant que la scène
d'évolution n'est pas portée. VIVANT (single-player) mais chantier couplé à evolution_scene.

---

## mon_markings.c → ABSENT (2 sprites d'affichage dans pokemon_summary_screen.ts)
Statut : 🔴 DIVERGENT / AMORCE (2/16)
Fonctions : 2/16. Présentes dans `pokemon_summary_screen.ts` : `CreateMonMarkingAllCombosSprite` (mon_markings.c:570)
et le combo sprite d'affichage (avec `sMonMarkings_Gfx`, palette `markings.pal`, tile 344+). Ce sont les
sprites d'AFFICHAGE des marques (résumé), 1:1 des données.
Manquantes VIVANTES (le MENU interactif d'édition des marques, accessible depuis le résumé) :
`InitMonMarkingsMenu`, `OpenMonMarkingsMenu`, `HandleMonMarkingsMenuInput`, `CreateMonMarkingsMenuSprites`,
`FreeMonMarkingsMenu`, `UpdateMonMarkingTiles`, `BufferMonMarkingsMenuTiles`, `BufferMenuFrame/WindowTiles`,
`CreateMarkingComboSprite`, `SpriteCB_Marking`. → le joueur ne peut pas (dé)cocher les marques d'un mon.
ORACLE : résumé d'un mon → bouton marques → devrait ouvrir le menu à 4 marques (absent).

---

## pokedex.c → src/pokedex.ts
Statut : 🟡 AMORCE (chantier EN PAUSE, jalon 1a fait)
Fonctions : 46/140 dans pokedex.ts (+ helpers flags/height ailleurs). Porté : ouverture (`CB2_OpenPokedex`),
liste défilante (`CreatePokedexList`, `Task_HandlePokedexInput`, scroll/scrollbar, sprites liste,
`CreateMonListEntry`/`CreateMonName`/`CreateMonDexNum`), scaffold info-screen (`LoadInfoScreen`,
`Task_LoadInfoScreen`, `Task_HandleInfoScreenInput`, `SpriteCB_MoveMonForInfoScreen`), VBlank.
Ailleurs : `GetSetPokedexFlag`, `GetPokedexHeightWeight`, `HoennToNationalOrder`, `NationalToHoennOrder`,
`NationalPokedexNumToSpecies` → `src/engine/ui/pokedex-flags.ts` ; `SpeciesToNationalPokedexNum` idem.
Manquantes VIVANTES :
- Fiche détaillée : `PrintMonInfo`, `DisplayCaughtMonDexPage`, `Task_DisplayCaughtMonDexPage`,
  `PrintMonHeight`/`PrintMonWeight`, `DrawFootprint`/`RS_DrawFootprint`, `CreateSizeScreenTrainerPic`,
  `PrintCryScreenSpeciesName`, `GetPokedexCategoryName`.
- Recherche : `LoadSearchMenu`, `DoPokedexSearch`, `SetDefaultSearchModeAndOrder`, `PrintSearchParameterText`,
  tout le cluster `*SearchMenu*`/`*SearchParameter*`/`Task_*Search*`.
- Comptage : `GetHoennPokedexCount`, `GetKantoPokedexCount`, `GetNationalPokedexCount`, `HasAllHoennMons`,
  `HasAllKantoMons`, `HasAllMons`, `ResetPokedex`, `CB2_Pokedex`.
Cohérent avec « pokédex en pause ». Le CB2 cadre + liste marchent ; fiches/recherche à faire.

---

## pokedex_area_screen.c → ABSENT
Statut : ⬜ ABSENT (0/19)
Fonctions : 0/19. `ShowPokedexAreaScreen`, `Task_ShowPokedexAreaScreen`, `Task_HandlePokedexAreaScreenInput`,
`FindMapsWithMon`, `MapHasSpecies`/`MonListHasSpecies`, `BuildAreaGlowTilemap`, `DoAreaGlow`/`DrawAreaGlow`/
`StartAreaGlow`, `CreateAreaMarkerSprites`/`CreateAreaUnknownSprites`, etc. = absent.
VIVANT (single-player : carte de répartition d'une espèce depuis la fiche Pokédex, bouton "ZONE"), mais
couplé à la fiche pokédex (elle-même partielle). Chantier couplé pokédex.

---

## pokedex_cry_screen.c → ABSENT
Statut : ⬜ ABSENT (0/14) — catégorie « Son (harness) »
Fonctions : 0/14. `LoadCryWaveformWindow`, `UpdateCryWaveformWindow`, `DrawWaveformSegment/Window/Flatline`,
`BufferCryWaveformSegment`, `PlayCryScreenCry`, `CryScreenPlayButton`, `SpriteCB_CryMeterNeedle`,
`SetCryMeterNeedleTarget`, `LoadCryMeter`, `FreeCryScreen`, etc. = absent.
Écran "CRI" de la fiche Pokédex (waveform + aiguille de compteur). Le waveform réel dépend du moteur
audio m4a (harness, hors 1:1 strict), mais le CADRE/tilemap/needle sont du code 1:1 portable. VIVANT mais
basse priorité (couplé fiche pokédex, dépend du son).

---

## TOP 5 (levier x effort)

1. **evolution_scene.c + GetEvolutionTargetSpecies (pokemon.c) — DÉ-STUBER l'évolution.**
   Taille : **L**. Impact énorme : actuellement `GetEvolutionTargetSpecies` renvoie toujours SPECIES_NONE
   → aucun Pokémon n'évolue (niveau, pierre, échange). Étapes : (a) porter `GetEvolutionTargetSpecies`
   dans pokemon.ts avec `gEvolutionTable` (matcher EVO_LEVEL/ITEM/FRIENDSHIP/…), (b) porter la scène
   evolution_scene.c + evolution_graphics.c (sparkles). (a) seul débloque déjà la logique.
   ORACLE : Poussifeu niv.16 en combat → doit lancer l'évolution ; Pierre Feu sur Évoli via sac/party.

2. **pokemon.c : CalculateMonStats — corriger level/levelUpHP + porter GetLevelFromMonExp/TryIncrementMonLevel.**
   Taille : **M**. `CalculateMonStats` (pokemon.ts:590) n'appelle pas `GetLevelFromMonExp` ni ne pose
   `gBattleScripting.levelUpHP` ; stats potentiellement fausses après gain d'EXP, "+PV" au level-up sans
   source 1:1. Porter `GetLevelFromMonExp` (2911), `TryIncrementMonLevel` (6211), `MonTryLearningNewMove` (3015).
   ORACLE : gagner un combat qui fait franchir un niveau → HP max/stats recalculés + capacité apprise.

3. **daycare.c — porter le système Pension complet (66 fns).**
   Taille : **L**. Route 117 : dépôt/retrait de mons, reproduction, œufs, hérédité IV/moves, coût, niveaux gagnés.
   Uniquement `CreateEgg` porté. Gros bloc single-player. Peut se découper (stockage → reproduction → menu).
   ORACLE : déposer 2 mons compatibles à la Pension → dialogue "un œuf !" du gardien après quelques pas.

4. **pokemon_icon.c — porter CreateMonIcon + palettes (party/PC/résumé).**
   Taille : **M**. Icônes mon partout (party menu, boîtes PC, résumé, level-up). ~6/23 aujourd'hui,
   noms custom (`CreateMonIconNoPersonality`). Réconcilier vers `CreateMonIcon`/`CreateMonIconSprite`/
   `SpriteCB_MonIcon`/`UpdateMonIconFrame` + gestion palettes (`LoadMonIconPalettes`, `GetValidMonIconPalIndex`).
   ORACLE : ouvrir le menu Pokémon → chaque mon affiche son icône animée 2-frames correcte.

5. **pokemon.c : MonGainEVs — câbler Pokérus x2 + MACHO_BRACE + hold-effects EV.**
   Taille : **S**. `multiplier = 1` en dur (pokemon.ts:335) ignore le doublement Pokérus et le MACHO_BRACE ;
   hold-effects EV du décomp (Power items) non transcrits. Gain d'EV sous-évalué.
   ORACLE : mon infecté Pokérus (ou tenant Macho Brace) bat un ennemi → EV gagnés doublés (vérifier via devtools EV).
