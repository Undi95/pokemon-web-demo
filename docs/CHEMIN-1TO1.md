# CHEMIN 1:1 — la route ordonnée vers le miroir complet

> **Synthèse de la flotte d'audit du 2026-07-02** : 13 agents Opus read-only, **310/310 .c de la décomp couverts** (zéro trou, vérifié par l'agent balayeur). Rapports détaillés par domaine : `audit-reports/fleet/*.md` (non commités). État au moment de l'audit : HEAD `a7774c7b`, branche `Byte-VM`, tsc=0.
>
> Doctrine : miroir STRICT (mêmes fichiers/fns/globals, transcription ligne à ligne). Exemptions confirmées et NON re-litigées : combat = PAUSE (inventaire fait, voir §Reprise-combat), link/multi/cadeau-mystère = flux non implémentés mais tout ce qu'ils utilisent côté solo est dû, son/save-IO/RTC = implémentation propre (API/structs 1:1), fieldmap = 4 adaptations assumées.

---

## Verdict en 6 lignes

1. **Le socle DATA est 100 % fidèle** — diffs COMPLETS (pas des échantillons) sur base stats, évolutions, moves, learnsets, items, wild, trainers+parties, easy chat, object events, exp, natures, type chart, pokédex : **0 divergence de valeur**. Tout trou du jeu est donc côté CODE, jamais côté données.
2. **Les fondations sont excellentes** : string_util 44/44 byte-level, option_menu 24/24 (modèle CB2), list_menu, text_window, mail-lecture, bike 56/56, metatile_behavior 144/144, field_camera/field_tasks/fieldmap/field_weather, random/trig/task/rtc/clock/time_events/mail_data, structs de save **champ-par-champ parfaits** (SaveBlock1 90/90, SaveBlock2 40/40, ~50 substructs).
3. **~10 systèmes sont cassés SILENCIEUSEMENT** (stub qui retourne 0 sans bruit) : évolution, éclosion des œufs, aggro-vision des dresseurs, GameClear post-Ligue, PC-boîtes, braille/Regis, opcodes scrcmd atteints par les scripts de gyms, SetBgAttribute, FAST_FADE, Move Relearner.
4. **La dette structurelle** = renommages `_camelCase`/FSM maison (party_menu, summary, start_menu, shop, event_object_movement, region_map, player_pc, trainer_card) : le jeu MARCHE mais l'import décomp trivial est bloqué là.
5. Corrections d'infos périmées : `__sprite` = **0 site vivant** (migration finie, combat inclus) · sprites interview REPORTER_M/F/BOY_1 **présents** au registre · 0 special clobberé · `SetGpuRegBits`/`ClearGpuRegBits` existent et sont 1:1.
6. Faux positifs cartograph connus : `contest_ai.c→battle_ai_script_commands.ts` et `diploma.c→option_menu.ts` = collisions de noms, pas des amorces. Le cartograph SOUS-estime aussi le domaine items/petits-.c (pattern « specials accessors » : l'état est porté dans specials-registry, seul l'écran manque → toujours croiser avec un grep specials).

---

## 🚀 COMMENCE ICI — les 12 premières actions, dans l'ordre

| # | Action | Effort | Oracle en jeu |
|---|--------|--------|---------------|
| 1 | Fix transcription `intro.ts:1933` : `160` → `0x68` | 1 caractère | Intro scène 3 : l'orbe Rayquaza recule au bon moment |
| 2 | Passe honnêteté : corriger/supprimer les ~10 commentaires menteurs + 2 fns mortes (liste au Palier 0) | S | grep = 0 mensonge restant |
| 3 | ~~Opcodes scrcmd « atteints par les gyms »~~ → **FAUX POSITIF réfuté au sol** (désassemblage d'agent désaligné sur les args variables de `trainerbattle` ; 0 usage .inc vérifié) — table néanmoins COMPLÉTÉE à 225/225 pour tuer la classe de bug (fait, `0d072805`+suivant) | ✅ | `[byte-vm] 227 handlers installés` + self-test PASS |
| 4 | Les **14 mismatch de l'oracle argbytes** — tous vérifiés BÉNINS (readWarp=7 octets cachés à l'oracle ; nop1 partagé par les opcodes FRLG = désalignement IDENTIQUE au vrai jeu ; hidemoneybox = 2 octets `0` exécutés comme 2 nops, comme sur GBA) | ✅ | oracle re-run : 216 analysés, 14 bénins documentés |
| 5 | `GameClear` + `SetCB2WhiteOut` (post_battle_event_funcs.c, 2 fns) | S | Vaincre la Ligue → Hall of Fame déclenché |
| 6 | `GetEvolutionTargetSpecies` RÉEL dans pokemon.ts (la data `evolutions.json` est vérifiée prête) | M | Poussifeu niv.16 → l'évolution se DÉCLENCHE (même sans la scène : logique d'abord) |
| 7 | `CalculateMonStats` 1:1 (`GetLevelFromMonExp` + `levelUpHP` + bug Pomeg préservé) + `TryIncrementMonLevel` + `MonTryLearningNewMove` | M | Passage de niveau en combat : stats recalculées + capacité apprise |
| 8 | Seedings new-game non-zéro : `SetMauvilleOldMan`, `InitEasyChatPhrases`, `InitLilycoveLady` + regrouper en vraie `NewGameInitData` (ordre new_game.c:149-207) | M | New game → parler au Papy de Mauville ; phrases easy chat par défaut |
| 9 | Dispatcher fade 1:1 (`UpdatePaletteFade` palette.c:116-134 : câbler FAST_FADE) | S/M | Entrer/sortir d'une grotte → fondu rapide animé, pas un snap |
| 10 | `SetBgAttribute`/`GetBgAttribute` réels (bg.c:476/504 — aujourd'hui `rt()?.SetBgAttribute?.()` = no-op fantôme) | M | Résumé Pokémon / battle intro : aucun écran à tuiles corrompues |
| 11 | `WaitForWeatherFadeIn` + `GetMapPairFadeFromType/ToType` + consolidation warp → `field_screen_effect.ts` aux noms 1:1 | M | **Piste n°1 du bug fadescreen** : sortir d'une maison sous la pluie ×10 → fade-in jamais figé |
| 12 | Aggro dresseurs : `CheckForTrainersWantingBattle` + `sTrainerSeeFuncList` (trainer_see.c) + appel en tête de `ProcessPlayerFieldInput` | M | Marcher dans la ligne de vue d'un dresseur → « ! » + approche + combat |

Après ça, dérouler les paliers ci-dessous dans l'ordre.

---

## Palier 0 — Honnêteté & fixes à coût quasi nul (tout en une session)

Le contrat « pas de commentaire mensonger » est violé à ~10 endroits, prouvés par grep. Coût de correction ≈ 0, crédibilité ≥ tout.

- **`intro.ts:1933`** : `if (data[1] == 160)` → `0x68` (décomp intro.c:2571). data[1] part de 0xA8 et décrémente de 2 → cible 104. **Seul vrai bug de transcription load-bearing trouvé par toute la flotte.**
- **`play_time.ts:77`** : `playTimeVBlanks = 0` → `= 59` (play_time.c:72).
- **Commentaires menteurs** (corriger le commentaire OU livrer la marchandise) :
  - ~~`specials-registry.ts` : specials TV Gabby&Ty « sans handler »~~ → **FAUX POSITIF vérifié au sol** : les 10 handlers (Before/AfterInterview, IsGabbyAndTyShowOnTheAir…) existent avec corps 1:1 complets (l.1081-4007). L'agent était tombé dans le piège du grep naïf sur les listes commentées. Rien à corriger.
  - `main_menu.ts:24, 149-167, 220-251` : « NewGameBirchSpeech_* stubs à implémenter Phase D » alors que la Phase D est FAITE plus bas. Aussi `SpriteCB_Null` (ts:1335) « TODO empty body » — le décomp est légitimement vide.
  - `window.ts:616-618` : ShowBg « appelle SyncBgVisibilityAndMode IMMÉDIATEMENT » — faux, n'appelle rien.
  - `decomp-globals.ts:1559-1560` : ResetPaletteFade sous-décrit le vrai C (16 PaletteStruct + control).
  - `intro.ts:1961` : JSDoc « Task_EndIntroMovie » posé sur `MainCB2_EndIntro`.
- **Code mort à supprimer** : `NewGameBirchSpeech_CreateNameYesNo` (main_menu.ts:713, doublon vide du vrai à ts:2211) · `cleanupScene` (starter_choose.ts:982) · `console.log` diagnostic dans `InitMainMenu` (main_menu.ts:1198-1203). ⚠️ Les « copies mortes » `CB2_InitCopyrightScreen*` d'intro.ts sont en réalité VOLONTAIRES et documentées (corps 1:1 gardés, supersédés par copyright-boot — en-tête intro.ts:150-154) : NE PAS supprimer, les rapatrier en vif au Palier 3.9.
- **Oracle mort** : `scripts/audit-opcode-argbytes.cjs:19` lit `src/scrcmd_bytevm.ts` (supprimé) → re-cibler `src/scrcmd.ts`.
- **`AllocZeroed` stub `{}`** (decomp-bridge.ts:173) → `new Uint8Array(n)` (ou throw fail-fast, doctrine du bridge lui-même) ; **`CpuSet`/`CpuFastSet` no-op** (decomp-globals.ts:441/447) → vraies copies typed-array.
- **Main_menu scroll-arrows** : supprimer les no-op locaux (ts:1109-1120) qui shadowent les vrais `AddScrollIndicatorArrowPair` de list_menu.ts.
- **`Math.random()` → `Random()`** (LCG décomp, port existant) : intro.ts:778/1042, main_menu.ts:2195, specials-registry `GetMomOrDadStringForTVMessage` (~l.476).

## Palier 1 — Quick-wins gameplay (S, quelques jours)

1. **Opcodes scrcmd manquants** — ✅ FAIT (2026-07-02), avec CORRECTION : la « preuve » de l'agent (opcodes atteints par Bastien/Trick House) était un **désassemblage désaligné** (args variables de `trainerbattle` → opcodes fantômes). Contre-vérification : **0 usage** de ces opcodes dans les .inc décomp (morts ou gift_*/mystery-gift exempt). La table a néanmoins été COMPLÉTÉE à **225/225 opcodes** (`227 handlers installés`) : gotostd_if/callstd_if (logique réelle), vcall_if (alias 1:1), **ports RÉELS** initclock/gettime (rtc.ts), addpcitem + upgrade checkpcitem (pc-items.ts), removedecoration/checkdecor (decoration_inventory.ts), checkmodernfatefulencounter (GetMonData), et consommation d'octets 1:1 documentée pour la famille pointeur-RAM/v*/callnative (précédent copybyte). La classe de bug « cmd non porté → script STOP » est éliminée structurellement. Reste du point : investiguer les **37 `unresolvedRelocs`** du bytecode (méta compile-scripts).
2. **`GameClear`/`SetCB2WhiteOut`** (stub-loop specials-registry:1415/2112) — 2 fns, débloque tout le end-game.
3. **Compteur Pokédex de l'écran Continue** : `_countCaughtPokedexFlags` (main_menu.ts:489) = `return 0` en dur → brancher le vrai comptage flags CAUGHT.
4. **`MonGainEVs`** (pokemon.ts:335) : câbler Pokérus ×2 + MACHO_BRACE + hold-effects EV (multiplier=1 en dur aujourd'hui).
5. **`fadeoutbgm`/`fadeinbgm`** : installer `SetupNativeScript(IsBGMPausedOrStopped)` (scrcmd.c:977) pour bloquer le script pendant le fade ; **`TryRunOnWarpIntoMapScript`** : `Number(valueTok)` → `VarGet` (les 2 opérandes passent par VarGet, cf. MapHeaderCheckScriptTable).
6. **`SetContinueGameWarpStatus`/`ClearContinueGameWarpStatus`** manquants + créer le foyer **`save_location.ts`** (10 fns, aujourd'hui inliné dans load_save.ts).
7. **map_name_popup** : compléter `MAPSEC_TO_THEME` (Fiery Path, Jagged Pass, Seafloor Cavern, Terra Cave… → fallback 'wood' faux) + FONT_NARROW + `GetStringCenterAlignXOffset` (S).
8. **field_door** : réintroduire le garde `FuncIsActiveTask(Task_AnimateDoor)` + `GetLastDoorFrame` 1:1 (S).
9. **`fldeff_strength.c`** (4 fns) + **`fldeff_escalator.c`** (6 fns) — 2 fichiers ENTIERS absents, petits. Oracle : rocher poussable avec Force ; escalator du Centre Pokémon animé.
10. **Quirk balls items.json** : la décomp encode `.type = ITEM_X - FIRST_BALL` pour les 12 balls ; nous stockons le symbole brut → vérifier le consommateur côté capture (S, vérification).

## Palier 2 — Les systèmes cassés silencieusement (M, le cœur du chemin)

Chacun est borné, découpable, avec data prête et oracle clair. Ordre recommandé :

1. **ÉVOLUTION** (le trou solo n°1 — aucun Pokémon ne peut évoluer) :
   - (a) `GetEvolutionTargetSpecies` réel dans **pokemon.ts** (foyer décomp = pokemon.c:5490, PAS battle_main.ts) — matcher EVO_LEVEL/ITEM/FRIENDSHIP/BEAUTY/échange sur `evolutions.json` (vérifié 172/172 fidèle). Rapatrier aussi `HandleSetPokedexFlag`/`SpeciesToNationalPokedexNum` (mauvais foyer battle_main.ts). **(a) seul débloque la logique.**
   - (b) `evolution_scene.c` (25 fns) + `evolution_graphics.c` (37 fns, sparkles) — la scène. `TryEvolvePokemon` post-combat est déjà porté et tourne à vide.
   - ⚠️ Gotcha préservé : ne PAS recâbler la génération wild sur `CreateMonWithNature` (Cute Charm). Porter aussi la famille `CreateMonWithNature`/`CreateMonWithGenderNatureLetter` (dons scriptés).
   - Oracle : Poussifeu 16 en combat ; Pierre Tonnerre sur Pikachu via sac.
2. **ÉCLOSION** (`egg_hatch.c`, 25 fns — `EggHatch`/`ScriptHatchMon` = `()=>0`) : la Pension donne l'œuf mais l'éclosion ne fait RIEN. À faire après (1b) — même famille de scène. Oracle : œuf Route 117 → marche → scène + mon ajouté.
3. **AGGRO DRESSEURS** (`trainer_see.c` 7/39 — seuls les émoticons portés) : `CheckForTrainersWantingBattle` + `CheckTrainer` + `GetTrainerApproachDistance*` + `sTrainerSeeFuncList` (16 états) + appel par step dans `ProcessPlayerFieldInput`. Oracle : ligne de vue → « ! » → approche → combat.
4. **FADESCREEN/WARP** (`field_screen_effect.c` 0/77 — fichier miroir VIDE, logique éclatée dans warp-system) : porter `WarpFadeInScreen`/`WarpFadeOutScreen`/`GetMapPairFadeFromType/ToType` (0 hit repo !) + synchro `WaitForWeatherFadeIn`, re-router les Task_Exit* aux noms 1:1. **Candidat racine du bug fadescreen intermittent** (FadeScreen lui-même est 1:1 dans field_weather.ts — c'est l'ORCHESTRATION qui manque). + le point FAST_FADE du Palier 0/1.
5. **field_control_avatar re-routage** : `ProcessPlayerFieldInput` doit appeler les `TryArrowWarp`/`TryStartWarpEventScript`/`TryDoorWarp` 1:1 (portées mais code-mort → double implémentation avec warp-system) + porter `TryStartMiscWalkingScripts` (trou fissuré !), le check flag objet-caché (`FLAG_HIDDEN_ITEMS_START` — objet ramassé re-proposé sinon), le bloc secret-base de `GetInteractedMetatileScript`, et compléter `TryStartStepCountScript` au fur des systèmes (egg hatch, safari, match call). Oracle : trou de sol fissuré → chute ; objet caché non re-proposé.
6. **AFFINE + gfx fantômes** : vrai `InitSpriteAffineAnim` (cascade AllocOamMatrix+CalcCenterToCornerVec+AffineAnimStateReset — le no-op de decomp-globals:2627 est un mensonge, le runtime affine EXISTE dans sprite-engine-impl.ts) + réconcilier le doublon gba-global-scope.ts:159 + porter les affine LOOP cmds (sprite.c:1124-1161) + `SetSpriteSheetFrameTileNum`, `CreateSpriteAndAnimate`. Oracle : intro Birch — le Pokémon rétrécit en douceur.
7. **BRAILLE + REGIS** (`braille.c` 3 fns + `braille_puzzles.c` ~18 fns + branchement `ShouldDoBrailleDigEffect` dans fldeff_dig) : police braille + puzzles → accès aux 3 Regis + Chambre Scellée. Oracle : braille lisible en Chambre Scellée ; Dig ouvre Regirock.
8. **Easy chat reste** : handlers `ECFUNC_QUIZ_*` (`return false` silencieux, easy_chat.ts:1784-1787 → dame quiz Mauville) + corps sprite de `TryAddInterviewObjectEvents` (TODO — les GFX REPORTER_M/F existent au registre). Reliquats connus hors-bug : offset rendu ~8px curseur↔texte (métrique police, positions 1:1 exactes) ; ordre des groupes = flags de déblocage save (re-tester après le seeding `InitEasyChatPhrases` du Palier 1).
9. **Icônes mon** (`pokemon_icon.c` ~6/23, noms custom) : `CreateMonIcon`/`CreateMonIconSprite`/`SpriteCB_MonIcon`/`UpdateMonIconFrame` + palettes (`LoadMonIconPalettes`/`GetValidMonIconPalIndex`). Utilisé partout (party/PC/résumé). Oracle : icônes animées 2 frames dans le menu Pokémon.
10. **Cut herbe + hyper-cutter** (`fldeff_cut.c` 2/17 — l'arbre marche, l'herbe non) : `SetUpFieldMove_Cut` scan 3×3/5×5 + `FldEff_CutGrass` + `SetCutGrassMetatiles` + `FixLongGrassMetatilesWindow*` (appelés par field_camera !) + `AllowObjectAtPosTriggerGroundEffects` (event_object_movement, vraiment absent). Oracle : Coupe dans les hautes herbes → carré 3×3 fauché.

## Palier 3 — Systèmes absents (L, découpables en lots vérifiables)

1. **PC-BOÎTES** (`pokemon_storage_system.c` 4/380 — le plus gros trou fonctionnel du jeu : un mon envoyé au PC est irrécupérable) :
   - Lot 1 (S/M) : **accessors box-data** (`GetBoxedMonPtr`, `GetBoxNamePtr`, `GetBoxMonDataAt`, `SetBoxMonDataAt`, `CreateBoxMonAt`, `SetCurrentBox`…) — débloquent daycare/TV/pokénav AVANT l'UI.
   - Lot 2 (S/M) : specials `ChoosePartyMon` (stub `()=>0` specials-registry:909), `ChooseMonForMoveRelearner` (:1947), `ShowPokemonStorageSystemPC` (:2150) → câbler les entrées.
   - Lot 3 (L) : l'UI boîtes complète (Task_PokeStorage state-machine, curseur, multi-move, wallpapers).
   - Oracle : PC → DÉPÔT/RETRAIT fonctionnels.
2. **PENSION** (`daycare.c` 1/67) : stockage → reproduction/œuf (hérédité IV/egg moves — data egg-moves vérifiée) → menu/coût. Se marie avec ÉCLOSION (Palier 2.2). Oracle : 2 mons compatibles → « un œuf ! ».
3. **MOUVEMENT NPC tables 1:1** (`event_object_movement.c` ~130/705 — HUB 3) : remplacer la machine tick maison (46 `_MovementAction_*` + 6 `tick*`) par les vraies tables `gMovementTypeFuncs`/`gMovementActionFuncs` (141+261 fns) + `UpdateObjectEventCurrentMovement` + `RemoveObjectEvent*` (NPC fantômes possibles après `removeobject`) + `DoJumpAnim`/figure-8/`CopyablePlayerMovement_*`/`GetLimitedVectorDirection_*`. LE plus gros chantier structurel field — découper par familles de MovementType. Oracle : wander/look-around frame-par-frame vs émulateur ; saut de ledge au timing exact.
4. **START MENU réécriture 1:1** (`start_menu.c` 0/80 — state-machine maison intégrale) : `StartMenuTask` + `gMenuCallback` poll + `sStartMenuItems[]`/`BuildNormalStartMenu` + chaîne save (SaveConfirm/Overwrite/DoSave, ~20 fns). Modèle éprouvé = option_menu.ts. Oracle : gTasks contient `StartMenuTask` ; SAUVEGARDER OUI→succès.
5. **SHOP 1:1** (`shop.c` 5/57) : outer menu ACHETER/VENDRE/QUITTER (`CreateShopMenu`/`Task_ShopMenu`) + **`BuyMenuDrawMapGraphics`** (la carte + PNJ derrière la liste — visuellement très visible). Oracle : buy-menu Rosyères = carte floue derrière, comme l'émulateur.
6. **Cinématiques warp** (`field_effect.c` ~90/224) : Vol-oiseau (~25 fns), chute-trou, spin téléport/corde (vraies chaînes pour fldeff_dig/teleport simplifiés), Lavaridge, escalator-warp, orbe Groudon/Kyogre (`DoOrbEffect` + `gOrbEffectBackgroundLayerFlags` introuvable). Oracle : Vol → l'oiseau emporte le joueur.
7. **TV** (`tv.c` 5/207) : chaîne Interview→`TryPutXxxOnAir`→`DoTVShow` (~30 handlers) + PokeNews. Lié aux sprites interview easy_chat (Palier 2.8). Oracle : Gabby&Ty après un combat → le show passe à la TV.
8. **Bases secrètes** (`secret_base.c` 1/99) : cluster entrée/warp (`SetCurSecretBaseIdFromPosition`, `EnterSecretBase`, `ToggleSecretBaseEntranceMetatile`…) puis registre. + `decoration.c` placement UI (0/135) + `player_pc.c` mailbox/deposit 1:1 + `trader.c`. Oracle : buisson → créer/entrer sa base.
9. **Étape-5 gfx / dissolution des fourre-tout** (mécanique, tsc-driven) : rapatrier depuis `decomp-globals.ts` (2632 l, 264 exports, 111 importeurs) vers les foyers 1:1 — `gpu_regs.ts` complet (buffer sGpuRegBuffer + sync VBlank, 8 fns), `decompress.ts` (21 fns dont `LoadSpecialPokePic*` = LOGIQUE jeu : Unown/Deoxys/Spinda), `sound.ts` (~32 fns d'API son éclatées dans le harness — le fichier actuel est un shim mince), `palette.ts` (dispatcher UpdatePaletteFade 1:1), window.c fns pures (`SetWindowAttribute`, `PutWindowRectTilemap`, `AddWindowWithoutTileMap`, famille 8bpp), text.c (`DrawKeypadIcon` — icônes L/R absentes de tous les menus, `RenderTextHandleBold`, `GenerateFontHalfRowLookupTable`), menu.c gfx-decompress (`DecompressAndLoadBgGfxUsingHeap` & co, dupliqués en stub dans mail/easy_chat/pokedex/fieldmap), `gMain` nommé 1:1, `new_game.ts` + copyright/boot dans intro.ts.
10. **Petits absents solo bornés** : roamer.c (13 fns, S/M) · cable_car.c (Mt. Chimney, M) · move_relearner.c (M, après PC lot 2) · mirage_tower effets (M) · berry pont Wailmer + `berry_tag_screen.c` (M, #17) · rotating_tile_puzzle (S) · landmark `GetLandmarkName` (S) · birch_pc rating (S) · mon_markings menu édition (S/M) · rotating_gate sprites (dette R4) · hof_pc + confetti (après GameClear) · écrans clear_save/save_failed (S/M) · `rayquaza_scene.c` (~120 fns, cinématique réveil Rayquaza — L, post-braille).

## Palier 4 — Domaines dédiés (XL, à planifier comme des chantiers à part)

- **POKÉNAV** (14 fichiers + match_call.c ≈ 639 fns, 0 porté) : objet clé solo (carte, appels/rematchs, condition, rubans). Clusters bien découpés par la décomp — à traiter comme un domaine entier, pas en balayage. Prérequis : accessors box-data (Palier 3.1), gym_leader_rematch.c.
- **POKÉDEX fiches** (pokedex.c 46/140 + area_screen + cry_screen) : chantier en pause, reprendre après les icônes mon (fiche détaillée → recherche → comptages → zone).
- **CONCOURS + POKÉBLOCKS** : pokeblock.c/use_pokeblock/pokeblock_feed + berry_blender (mode solo PNJ existe) + contest*.c (moteur ~530 fns ; la data moves-concours du summary est déjà couverte).
- **CASINO** (roulette 104, slot_machine 270) + **trade.c in-game** (échanges PNJ scénarisés) + **credits.c/hall_of_fame.c** écrans.
- **REPRISE COMBAT** — inventaire prêt (voir `audit-reports/fleet/battle-inventaire.md`) ; le TOP à la reprise : ① chaîne throw de CAPTURE (`SpriteCB_BallThrow_*` absente de tout le repo — la capture passe par une glue) ② anim EXP/level-up (`Task_GiveExpWithExpBar`…) ③ `SentPokesToOpponent` + PP-loss Imprison/PerishSong + piste switch-on-faint (duplication `HandleAction_Switch` battle_util vs battle-switch, `_resetBattleStructForSwitch`) ④ combats spéciaux (légendaires/roamer/Wally/Safari + `GetSpecialBattleTransition` + `PlayTrainerEncounterMusic`) ⑤ helpers `BlendColorCycle*`/`TintPalettes` (débloquent des dizaines d'anims) puis clusters anims par type ; battle_transition ~24/210 ; frontier = plus tard. Bon socle : IA 100 %, battle_main 103/105, script_commands 275/287, controllers solo OK.

## Dette de renommage (mécanique, pas de logique — faisable au fil de l'eau)

Bloque l'« import trivial » mais pas le gameplay. À traiter par fichier, tsc-driven, quand on touche le domaine :
- `party_menu.ts` : FSM `_phase` + 72 `_camelCase` → `Task_*`/`CursorCb_*`/`ShowPartyMenu`/`InitPartyMenu` (L — HUB 1b).
- `pokemon_summary_screen.ts` : 134 `_camelCase` → noms 1:1 (M, architecture déjà fidèle ; le noyau oubli-de-capacité est DÉJÀ 1:1).
- `trainer_pokemon_sprites.ts` : `CreateMonPicSprite_Affine` → `CreateMonPicSprite`/`CreatePicSprite` (S).
- `item.c` : rapatrier `engine/bag/**` → `item.ts` aux noms 1:1 + trancher le chiffrement ItemSlot (M/L).
- `region_map.ts` : l'écran Vol vit en Phaser custom dans engine/field (997 l) — réécrire aux noms 1:1 (L, faible priorité : fonctionne).
- `trainer_card.ts`, `player_pc.ts` : fusionner les `_helpers` vers les noms décomp (M chacun).
- SwitchPartyMonSlots → `SwitchPartyMon` ; `GiveItemToMon` & co : passer par SetMonData au lieu de `mon.heldItem=` (~10 sites, S).

## Méthode & garde-fous (issus de l'audit)

- **Toujours croiser cartograph + grep specials** avant de déclarer « absent » (pattern « specials accessors » : l'état vit dans specials-registry).
- **Chaque special porté → RETIRER son nom des 2 stub-loops** de specials-registry (pitfall clobber ; 0 clobber actif aujourd'hui, vérifié). Idée robuste : `registerSpecialIfAbsent` pour les boucles.
- **Les scripts d'audit data du scratchpad** (`audit-species/evolutions/moves/learnsets/...cjs`) = oracles de non-régression réutilisables.
- Nouveau bug visuel → d'abord `rt.gba.getFrameBuffer()` (mesure pixel) + tracer la VALEUR dans la décomp avant de suspecter le moteur.
- Écran neuf : modèle = `option_menu.ts` (CB2+tasks 1:1) ; jamais de state-machine maison.
