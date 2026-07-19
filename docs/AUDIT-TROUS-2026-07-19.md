# AUDIT EXHAUSTIF DES TROUS RESTANTS — port 1:1 Pokémon Émeraude

> **2026-07-19 · LECTURE SEULE · aucun fix, aucun commit.** Cible auditée = SOLO COMPLET
> (new game → générique). Décomp de référence : `D:/Projet 1/decomps/pokeemeraude`.
> Méthode : grep large (FR+EN) des marqueurs (STUB/TODO/FIXME/no-op/non porté/INERTE/
> à câbler/DÉRIVE/approximation/simplifi/TRANSPILER-TODO/…) sur `src/` + `harness/` +
> `include/`, PUIS **vérification code-par-hit** (le piège connu du repo = marqueurs
> périmés). Chemin critique + climax vérifiés directement ; le reste balayé par 8
> sweeps parallèles (chaque hit relu et confronté au décomp).

---

## 1. SYNTHÈSE CHIFFRÉE

| Catégorie | Compte | Portée |
|---|--:|---|
| **BLOQUANT solo (crash/softlock sur chemin atteignable)** | **2** | 1 sur chemin OBLIGATOIRE (Arène 7) + 1 sur interaction optionnelle |
| **COSMÉTIQUE / MINEUR (réel, non bloquant)** | **~50** | visuels manquants, contenu optionnel, services annexes, écarts fins combat |
| **INERTE / NON CÂBLÉ (transcrit, jamais appelé en solo)** | **~18** | réserve 1:1 + hors-solo transcrit |
| **MARQUEURS PÉRIMÉS (code porté, commentaire mort)** | **~35** | dette d'hygiène (nettoyage) |
| **HORS PÉRIMÈTRE (exclu à raison)** | ~12 familles | link/multi/frontier/contest/braille/e-reader/hardware/minigames/i18n |

**Verdict global : le chemin new game → générique est fonctionnel à UNE exception dure près.**
Les jalons du plan « finir le solo » (Panthéon/HOF/crédits/Rayquaza/caméra/Steven multi/
CS de terrain/PC de rangement/évolution/sauvegarde) sont **réellement câblés et vérifiés**
au code. **Le seul trou dur sur un passage OBLIGATOIRE est l'Arène de Mossdeep (Arène 7)** —
crash du puzzle de tuiles tournantes — jamais rencontré en test car l'endgame a été validé
via warps debug, pas par une traversée propre de l'arène. Tout le reste est cosmétique,
optionnel, ou déjà porté (marqueur périmé).

> ✅ **Moteur de combat vérifié COMPLET** : table d'opcodes bytecode **249/249**
> (241 dans `battle_script_commands.ts` + 8 contrôle de flux dans `script-interpreter.ts`),
> table IA **99/99**, logique de tour / items / capacités 1:1, STEVEN multi fidèle,
> sauvegarde/restauration de la party OK (`SavePlayerPartyBackup`/`LoadPlayerPartyBackup`
> deep-copy). **Zéro bloquant dans le moteur de combat** — seulement des cosmétiques (§3.10)
> et des replis inertes de sous-systèmes hors-solo (Safari/Wally, §4).

---

## 2. BLOQUANT / VISIBLE SOLO

### 2.1 🔴 DUR — chemin OBLIGATOIRE

- **`src/rotating_tile_puzzle.ts:107` — Arène de Mossdeep (Arène 7, Lévy & Tatia) : CRASH.**
  `InitRotatingTilePuzzle` fait `sRotatingTilePuzzle = ({} as any) /* TRANSPILER-TODO
  AllocZeroed */` → `.objects` et `.numObjects` restent `undefined`. Dès qu'on marche sur
  un interrupteur-sol et que `MoveRotatingTileObjects` trouve une statue
  (`OBJ_EVENT_GFX_TRICK_HOUSE_STATUE`, 20+ sur les flèches) sur une flèche de la couleur
  active, `SaveRotatingTileObject` (:297) exécute
  `sRotatingTilePuzzle.objects[sRotatingTilePuzzle.numObjects].eventTemplateId = …` →
  `undefined[undefined]` → **TypeError**. Puzzle insoluble → Lévy & Tatia inatteignables →
  **Badge Esprit + progression bloqués** (l'arène est sur la route obligatoire vers
  Atlantis/le climax). Réf décomp `rotating_tile_puzzle.c:89` (`AllocZeroed` de
  `struct RotatingTilePuzzle{ objects[OBJECT_EVENT_TEMPLATES_COUNT]; numObjects; isTrickHouse }`)
  + `:306` (`SaveRotatingTileObject`). **Taille S** (init `{objects: […], numObjects:0}` +
  auto-vivification par index). Confiance HAUTE (vérifié 2×). *Impacte aussi la Trick House
  (`isTrickHouse`), optionnelle.*

### 2.2 🔴 CRASH sur interaction OPTIONNELLE

- **`src/pokenav_match_call_data.ts:51` — appel Match Call du Prof. Seko/Birch : throw.**
  Sentinelle **vivante** `const BufferPokedexRatingForMatchCall = __wireTodo(...)` appelée en
  `:1582` (`MatchCall_GetMessage_Birch`, gaté `FLAG_ENABLE_PROF_BIRCH_MATCH_CALL`, contact
  solo réel). Recevoir/passer l'appel « note Pokédex » du Prof. Birch → `__wireTodo` **throw**.
  **La fonction est déjà portée et exportée** (`match_call.ts:2730 BufferPokedexRatingForMatchCall`) :
  il manque juste l'import (sentinelle stale à la place). Réf `match_call.c:2064`. **Taille S**
  (1 ligne : importer la vraie fn, supprimer la sentinelle). Non bloquant pour finir le jeu,
  mais crash d'une interaction atteignable.

---

## 3. COSMÉTIQUE / MINEUR (réel, non bloquant)

### 3.1 Puzzles & rendu terrain (visible, franchissable)
- **`src/rotating_gate.ts:197,331-381` — grilles tournantes Fortree (Arène 6) + Trick House
  INVISIBLES.** Logique collision/rotation/poussée portée ET câblée
  (`field_player_avatar.ts:1390 CheckForRotatingGatePuzzleCollision`), mais **sprites des
  grilles non portés** (`LoadRotatingGatePics`/`CreateGate`). Mécaniquement franchissable
  (collision réelle) mais le joueur bute sur des grilles qu'il ne voit pas. Réf
  `rotating_gate.c`. **L**. *(Cosmétique le plus sévère : Arène 6 obligatoire.)*
- `src/field_specials.ts:842-843` (specials-registry) — `PetalburgGymSlideOpenRoomDoors` /
  `…UnlockRoomDoors` no-op → portes de l'Arène de Petalburg non animées. Passage par warps OK.
  Réf `field_specials.c`. **S**.

### 3.2 CS / effets de terrain (fonctionnels, anim dégradée)
- `src/fldeff_teleport.ts:31-55` — Téléport : warp OK, **fade** au lieu du spin-out/in. `field_effect.c:2356`. **M**. *(optionnel)*
- `src/fldeff_dig.ts:26-66` — Fuite/Corde Sortie : warp OK, anim creusage/spin déférée. `field_effect.c:2242`. **M**. *(optionnel)*
- `src/fldeff_flash.ts:8-9` — Flash : pénombre WIN0 portée, seule la transition blend d'entrée de grotte déférée. Flash non requis. **M**.
- `src/fldeff_cut.ts:11-13` — Coupe sur ARBRE (requise) OK ; Coupe sur HERBE (party-menu, optionnelle) déférée. **M**.
- `src/field_poison.ts:145` — `FldEffPoison_Start()` (flash écran poison) déféré ; dégâts+whiteout complets. `field_poison.c:44`. **S**.
- `src/field_screen_effect.ts:127-131` — Orbe (climax Groudon/Kyogre) OK ; seule la teinte tilemap (`__SetBgTilemapPalette`) no-op. **S**.
- `src/fldeff_cut.ts:53`, `src/fldeff_rocksmash.ts:49` — `IncrementGameStat(USED_CUT/ROCK_SMASH)` non portés (compteurs). **S**.
- `src/overworld.ts:511` / `field_control_avatar.ts:527` — chute sols fissurés Sky Pillar (`DoFallWarp`) : **le warp FONCTIONNE** (getWarpKindFor→'fall', executeWarp SE_FALL, `field_tasks.ts:261 CrackedFloorPerStepCallback`) ; seule l'anim spécifique « DoFallWarp » (chute) n'est pas transcrite en fonction. **S**. *(non-bloquant, à confirmer en jeu — plan incertitude ①.)*

### 3.3 Menus & objets
- **`src/party_menu.ts:3811` — `sFieldMoveCursorCallbacks` omet Coupe/Éclate-Roc/Cascade/
  Plongée/Pouvoir Caché** (fns `SetUpFieldMove_Cut/RockSmash/Waterfall/Dive/SecretPower`
  absentes). Sélectionner « COUPE » etc. depuis le menu d'action du mon = no-op silencieux
  (`:3851`). NON bloquant : ces CS passent par l'interaction terrain (déjà portée). Vraie
  divergence de table décomp `party_menu.h:770` / `party_menu.c:3896`. **M**.
- `src/item_use.ts:606` — objets X (X Attaque…) EN combat : effet appliqué mais message =
  « Ça n'aura aucun effet » au lieu de « ATTAQUE augmente ! ». `pokemon.c:5433`. **S**. *(optionnel)*
- `src/item_menu.ts:2889-2896` — `ItemUseOutOfBattle_PokeblockCase/Berry/WailmerPail` →
  fallback `DadsAdvice`. Arrosoir Wailmer + certaines poses baie non portés (planter via
  specials OK). PokéblockCase = concours (exempt). `item_use.c:1063`. **M**. *(optionnel)*
- `src/shop.ts:834-835` — flèches de défilement + curseur gris de la liste d'achat non
  portés (visuel). Flux achat/vente 1:1 complet. **S**.
- `src/engine/bag/bag-item-effects.ts:534-540` — Super Bonbon utilisé EN combat : soin HP du
  level-up = `amount=0` (`gBattleScripting.levelUpHP` non porté). Cas de bord. `pokemon.c:5065`. **S**.
- `src/pokemon_summary_screen.ts:423,1162` — dette met-location (id→MAPSEC) : lieu de
  rencontre possiblement vide sur la page INFO. **S** — *incertain, impact minime.*
- `src/pokemon_storage_system.ts:4736` — sur `MENU_SHIFT` quand `!CanShiftMon()` : `_pcActionTodo`
  au lieu de SE_FAILURE + message « C'est ton dernier POKéMON ! ». Pas de softlock. `pss.c:2628`. **S**.
- `src/pokemon_storage_system.ts:3744` — `sMainMenuTexts` hardcode les libellés FR au lieu de
  `getString()`. Texte correct à l'écran. `pss.c:882`. **S**.

### 3.4 Services annexes non fonctionnels (no-op → PNJ sans effet)
- **Tuteurs de capacités / Rappel de capacités / Effaceur** — `ChooseMonForMoveTutor`,
  `ChooseMonForMoveRelearner`, `BufferMoveDeleterNicknameAndMove` = `() => 0`
  (specials-registry.ts:1920-1921,1463). Les PNJ (Fallarbor/Lilycove/Mossdeep) « ne font
  rien ». Optionnels, non bloquants, sans crash (la branche `throw` de
  `party_menu.ts:1222 CanMonLearnTMTutor` n'est PAS atteinte — le flux passe par le special
  no-op). **M**.
- **`ShowScrollableMultichoice` = no-op** (specials-registry.ts:1043) → menus des vendeurs
  optionnels non ouvrables : **stands du marché de Poivressel, Atelier de Verre (Route 113),
  Fan Club de Clémenti-Ville**. `field_specials.c`. **M**.
- `src/field_specials.ts:449` — `BufferFanClubTrainerName` no-op (data Lilycove non portée). **S**.
- `src/field_specials.ts:478` — `Special_ShowDiploma` (écran diplôme post-Pokédex complet) no-op+log. **S**.
- specials-registry.ts:968 — `LookThroughPorthole` (hublot du ferry SS Tidal) no-op. **S**.
- specials-registry.ts:4066 — `QuizLadyShowQuizQuestion` (écran quiz Lilycove) non porté. **S**. *(easy_chat)*
- `src/mauville_old_man.ts` — Vieil Homme de Mauville (barde/conteur/Giddy) partiellement
  déféré (seeding+gfx OK). `mauville_old_man.c`. **M** — *incertain (partie via specials).* 

### 3.5 Légendaires (visible mais post-crédits)
- **`BattleSetup_StartLegendaryBattle` = `() => 0`** + `StartRegiBattle` = `() => 0`
  (specials-registry.ts:1032,1458) → **aucun combat/capture de légendaire statique**
  (Groudon/Kyogre/Rayquaza/Regis/Mew/Deoxys/Latias-Latios/Ho-Oh/Lugia). Interagir avec le
  Pokémon ne lance rien. **TOUS post-Panthéon / hors chemin-crédits**, mais gros pan de
  contenu non fonctionnel. **L**.
- `src/roamer.ts:6-9` + `overworld.ts:1548` — mouvement du roamer (Latias/Latios) non porté
  (seeding new-game seul). Le légendaire baladeur n'apparaît jamais. Post-Ligue/optionnel. `roamer.c`. **L**.
- `src/battle_transition.ts:536-538` — transitions d'entrée spéciales non portées → **coupe
  instantanée** au lieu de l'anim pour : mugshots Conseil 4/Champion, Magma/Aqua, légendaires
  (Regi/Kyogre/Groudon/Rayquaza). Combats obligatoires jouables, transition manquante. `battle_transition.c:347`. **L**.
- `src/battle_bg.ts:340` — overrides `MAP_BATTLE_SCENE_*` (fond Groudon/Kyogre/Rayquaza) non
  portés → fond générique sur combats légendaires. `battle_bg.c:760`. **M**.

### 3.6 Anims de combat (auto-terminées, softlock-safe)
- `src/battle_anim_mon_movement.ts:117-124` — `AnimTask_ShakeMon` : décodage **s16 des
  opérandes `createvisualtask`** corrompu pour ~15 moves (Laser Glace, Vive-Attaque…) →
  garde-fou saute le shake (anim continue). **Seul vrai bug latent** ; impact cosmétique. **S**.
- `src/battle_anim.ts:2572` + long-tail — quelques callbacks C rares/partagés non enregistrés
  (`AnimFrenzyPlantRoot`, `AnimTask_MusicNotesRainbowBlend`, `AnimTask_MoonlightEndFade`…) →
  fallback warn-once (visuel sauté, anim terminée). **S/M** par callback.
- `src/battle_anim.ts:522`, `battle_anim_sound_tasks.ts:57,100,268` — ducking BGM moves bruyants
  + panning stéréo SE (mono) + echo cris : cosmétiques audio. **S**.

### 3.7 Mail / Décoration / TV (contenu solo optionnel)
- `src/mail.ts:243+` — mails affichés en **fil de fer** (12 designs `sMailGraphics` = assets
  non extraits) ; **écriture** de mail non câblée (easy_chat UI section 4 incomplète,
  `easy_chat.ts:1251`). `graphics/mail/*`. **M**. *(optionnel)*
- `src/player_pc.ts:1901` — Boîte aux lettres « DONNER » = stub warn+cancel
  (`ChooseMonToGiveMailFromMailbox` manquant). `player_pc.c:881`. **S**.
- `src/player_pc.ts:1487,1529-1563` — Mailbox saute le `FADE_TO_BLACK` avant lecture + sprites
  swap-line no-op (réordonner objets marche, visuel absent). `player_pc.c:792,1087`. **S**.
- `src/decoration.ts` (~1302/1439/2094/2718) + `decoration_inventory.ts:105` — pose de
  décoration INERTE : `gDecorations[].tiles` (tiles.h) + `gDecorIconTable` (icon.h) non
  extraits → décos possédées non rendues ; `InitDecorationContextItems` no-op. « Décorer sa
  base/chambre » limité (inventaire OK). `decoration.c:453,515`. **L**. *(optionnel)*
- `src/tv.ts:118-124` + `post_battle_event_funcs.ts:82` + `dewford_trend.ts:225` — générateurs
  de TV shows (`TryPut*OnAir`, `gContestMons` vide) non portés → émissions concours/cuties/
  trend non générées (news basiques OK). **M**. *(optionnel cosmétique)*

### 3.8 Titre / intro / crédits (cosmétique)

> ⏳ **NOTE (2026-07-19)** : les bugs graphiques **Panthéon / générique / retour intro**
> (fenêtre info-joueur noire, mon-bg crédits, `hall_of_fame.ts`/`credits.ts`/`text_window.ts`
> + `.pal`) sont **EN COURS DE FIX par un agent parallèle**. Les entrées ci-dessous marquées
> ⏳ ne sont donc PAS des trous ouverts à retraiter — juste consignées pour traçabilité.
- `src/title_screen.ts:432,434` — `ScanlineEffect_InitHBlankDmaTransfer` + `ProcessSpriteCopyRequests`
  commentés → effet scanline du logo titre absent (titre s'affiche sinon). **M**.
- `src/title_screen.ts:564,572,581` — combos titre clear-save / reset-RTC / BerryFix no-op.
  Aucun requis pour le solo. **S**.
- Cinématique d'intro attract (avant le titre) : scènes 2/3 stubbées
  (`decomp-globals.ts:563,1188` TODO Phase 0c/3, `CreateTreeSprites` Phase 2). Cosmétique pré-titre. **M**.
- ⏳ `src/credits.ts:69,438` — `TRANSPILER-TODO` : fond coloré des mons (mon-bg) dégradé +
  `SetBgTilemapBuffer({})` (AllocZeroed). Générique jouable (validé en jeu), rendu dégradé.
  **EN COURS DE FIX (agent parallèle).** **S**.
- `src/hall_of_fame.ts:31` — records HOF ne survivent pas à un reload (secteurs HOF non
  modélisés) → visualiseur HOF post-game vide après reload. **S**.
- ⏳ `src/hall_of_fame.ts:566,1123` — fenêtre info-joueur du Panthéon possiblement noire (dette
  `GetTextWindowPalette`/`preloadTextWindowFrames`, transverse). Plan B2. **EN COURS DE FIX
  (agent parallèle).** **S**.
- `src/hall_of_fame.ts:387` — rejeu HOF au CONTINUE (`gGameContinueCallback`) sauté (documenté). **S**.

### 3.9 Divers cosmétiques
- `src/overworld.ts:444-461,676` — `sFixedDiveWarp`/`sFixedHoleWarp` (dive/hole fixe) non
  portés → no-op 1:1 (post-game). **S**.
- `src/overworld.ts:1546` — cris ambiants sauvages (`ChooseAmbientCrySpecies`) non portés. **S**.
- `src/give_gift_ribbon_to_party.ts` — fn complète, script PNJ rubans-cadeaux non porté (rubans cosmétiques). **S**.
- specials-registry.ts:1312 — `WaitWeather = () => 0` alors qu'une impl réelle existe orpheline
  (`time_events.ts:109`) : à recâbler (1 ligne). Non bloquant (plan B2). **S**.
- `src/match_call.ts:1875-1884,1958` — INCGFX window/nav-icon + `sizeof` (TRANSPILER-TODO) —
  *probablement résolu par le pipeline assets async ; UI validée en mémoire.* **S** — *incertain.*

### 3.10 Logique de combat (moteur complet — écarts fins)
- **Tutoriel de capture de Pierrick/Wally (Petalburg)** — `LoadWallyZigzagoon` +
  `StartWallyTutorialBattle` = no-op log (specials-registry.ts:755,763). **NON bloquant** :
  le script `PetalburgCity/scripts.inc:40` enchaîne `special StartWallyTutorialBattle` puis
  directement `msgbox` (**pas de `waitstate`**) → le stub saute la démo, Wally dit « J'ai
  réussi ! » et l'histoire continue (les runs new-game passent Petalburg). Démo de capture
  perdue. `battle_setup.c:480`. **M**.
- `src/battle_script_commands.ts:1759` — `CheckWonderGuardAndLevitate()` non appelé dans
  `Cmd_accuracycheck` : raffine seulement le MESSAGE de raté (Lévitation/Garde Mystik). La
  vraie immunité est gérée 1:1 par `TypecalcImpl` (:12817). `bsc.c:1426`. **S**.
- `src/battle_script_commands.ts:10497` — `Cmd_yesnoboxstoplearningmove` (0x5B) auto-résout
  (« abandonner ») sans poller l'input. Boîte SECONDAIRE ; la principale `yesnoboxlearnmove`
  (0x5A) est câblée 1:1. Pas de softlock. `bsc.c:5514`. **S**.
- `src/battle_util.ts:2380` — Baie Mepo (Leppa) : PP restauré = `getBattleMove(move).pp` au
  lieu de `CalculatePPWithBonus` → sous-restaure si PP Plus. **S**.
- `src/battle_util.ts:3972,4360` — `_UproarWakeUpCheckETT` (fin de tour) simplifié : ignore
  Insonorisation + ne pose pas MULTISTRING_CHOOSER. Edge Soundproof-pendant-Brouhaha rare
  (la variante principale `:2825` est complète). `bsc.c:6804`. **S**.
- `src/battle_message.ts:414` — `B_TXT_TRAINER2_LOSE_TEXT` = chaîne vide → le 2e dresseur d'un
  combat 2-adversaires n'a pas de réplique de défaite (dresseur A OK). `battle_message.c:2740`. **S**.
- `src/battle_script_commands.ts:13721` — REMOVE_PARALYSIS (Stimulant/Sels) : status effacé +
  jump OK, mais l'`EmitSetMonData` de sync party/healthbox différé. Move rare. **S**.

---

## 4. INERTE / NON CÂBLÉ (transcrit, jamais appelé en solo)

- `src/contest_effect.ts` (1382 l.) + `src/contest.ts` (72 l., seul le seeding new-game câblé)
  — logique concours transcrite, module non importé. Concours = hors solo. **L**.
- `src/image_processing_effects.ts` — module entier INERTE (0 importeur ; effets photo/concours). **S**.
- `src/intro_credits_graphics.ts:38-43,275-295` — `CreateCloudSprites`/`CreateTreeSprites`/
  `CreateHouseSilhouetteSprites` = **doublons morts** (référencent des `declare const` ambient
  → ReferenceError si appelés) ; la scène crédits utilise ses propres copies (`credits.ts:1747`).
  Candidat suppression. **S**.
- `src/walda_phrase.ts` — mot de passe wallpaper Walda (Mossdeep), aucun import. `walda_phrase.c`. **M**. *(optionnel)*
- `src/trader.ts` — menu d'échange déco (`CreateAvailableDecorationsMenu`) non porté, seeding OK. `trader.c:60`. **M**. *(optionnel)*
- `src/roamer.ts` — voir §3.5 (mouvement roamer, INERTE post-Ligue). **L**.
- `src/party_menu.ts:1222` — branche move-tutor de `CanMonLearnTMTutor` (`throw`) : jamais
  atteinte (flux tuteur = special no-op §3.4). Inerte des deux côtés. **S**.
- `src/item_menu.ts:1262` — `Task_WallyTutorialBagMenu` déféré (`ITEMMENULOCATION_WALLY`
  atteignable seulement via le combat-tuto Wally, lui-même stubbé §3.10). Inatteignable. **S**.
- `src/battle_gfx_sfx_util.ts:689` — `BattleInitAllSprites` porté mais dormant (voie vive =
  `battle-decomp-loop` case 18 → `initAllHealthboxes`). `bgsu.c:846`. **M**.
- `src/battle_anim_throw.ts:436` — `AnimTask_UnusedLevelUpHealthBox` : squelette porté, Unused
  dans le décomp AUSSI (le warn `:416` « not yet ported » est trompeur). Inerte des deux côtés.
- `src/engine/decomp-impls/sprite-engine-impl.ts:468`, `sprite-affine-extras.ts:52` — chemin
  anim affine « command-array » INERTE (toutes les anims en frames[]+terminator). Latent. **M**.
- `src/trainer_pokemon_sprites.ts:376` — `CreateTrainerCard*` (voie window-blit) non porté ;
  cœur `CreateMonPicSprite`/`CreateTrainerPicSprite` (HOF, intro combat) porté. **L**.
- `src/dma3_manager.ts` — file DMA3 INERTE (adaptation moteur : copies eager). Intentionnel.
- **Zone Safari** — `battle_controllers.ts:441 SetControllerToSafari` + les actions Safari
  (`battle_main.ts:2377` : `SAFARI_WATCH/BALL/POKEBLOCK/GO_NEAR/RUN` aliasées vers
  `HandleAction_RunBattleScript`) non portées ; `BATTLE_TYPE_SAFARI` jamais posé (pas de
  `DoSafariBattle`). → mécaniques Safari (appât/caillou/fuite) non fonctionnelles. Zone Safari
  = contenu solo OPTIONNEL. `battle_controllers.c:162`, `battle_main.c:536`. **M**.
- `src/battle_controllers.ts:444` — `SetControllerToWally` → repli player. Inatteignable
  (special Wally no-op, §3.10). `battle_controllers.c:168`. **M**.
- `src/battle_factory.ts` / `battle_palace.ts` / `battle_pike.ts` / `battle_tent.ts` /
  `battle_pyramid.ts` — socle Frontier, **fichiers INERTES importés nulle part**, symboles
  gardés par `throw 'non porté'`. Hors solo. **L**.
- `src/pokemon_storage_system.ts:903,1147,5336` — helpers UNUSED + wallpapers Walda inertes
  (feature secrète). **S**.
- `src/pokemon.ts:578` — `SetWildMonHeldItem` : table `sAlteringCaveWildMonHeldItems` non portée
  (Altering Cave = inerte en vanilla). Correct. **S**.

---

## 5. MARQUEURS PÉRIMÉS (code réellement porté — à nettoyer)

> Ces commentaires STUB/TODO/INERTE mentent : le code sous-jacent est complet. Purge = dette d'hygiène.

- **`src/pokemon_storage_system.ts:4691,6027,3446,3729`** — « tasks d'action non portées »,
  « PROVISOIRE cases MOVE+B », « scroll FONDATIONS inertes », « écran boîtes = stub ».
  **FAUX** : PC de rangement COMPLET (Move/Shift/Withdraw/Deposit/Release/Summary/Mark/scroll
  14 boîtes tous implémentés). *(La note MEMORY « PC 2/380 quasi non porté » est PÉRIMÉE.)*
- `src/pokemon.ts:1583` — « Champion Ribbon no-op » : FAUX, décrit un bug corrigé (:1585 pose les rubans).
- `src/rayquaza_scene.ts:11` — en-tête « transcrit COMPLET mais NON CÂBLÉ, Script_DoRayquazaScene
  reste no-op » : **PÉRIMÉ**, câblé en `specials-registry.ts:1347` (climax Rayquaza fonctionnel).
- `src/pokenav.ts:2,342` — en-tête « SQUELETTE UI » / « BLOQUÉ par stubs gfx » : PÉRIMÉ,
  orchestrateur 100 % câblé (`CB2_InitPokeNav`→`Task_Pokenav`, table `PokenavMenuCallbacks[15]`).
- `src/pokenav_match_call_gfx.ts:57,58,61,71,125,126` + `pokenav_main_menu.ts:81,82,94` —
  **9 sentinelles `__wireTodo` MORTES** (jamais référencées ; remplacées par copie manuelle +
  fetch async). Candidat suppression. **S**.
- `src/engine/battle/battle-decomp-loop.ts:131-139` (+ notes jumelles `battle_setup.ts:1599`,
  `battle_main.ts:4379`) — « DETTE trainerClass=0 → tous les dresseurs sur default MUS_VS_TRAINER » :
  **RÉSOLU** (`battle-trainer-data-bridge.ts:117` résout `trainerClass` via `resolveDecompConstant` ;
  les 855 dresseurs de `trainer-parties.json` le portent). Musique arène/champion/Aqua-Magma/rival OK.
- `src/battle_gfx_sfx_util.ts:311,366` — « Transform/Substitute non câblés » / « doll non extrait » :
  FAUX (`HandleSpeciesGfxDataChange` câblé ; doll byte-exact `:369`, vague F79).
- `src/battle_anim.ts:69` — « LoadMoveBg stubbed » : FAUX (`:887` charge depuis le manifest anim-bg).
- `src/reshow_battle_screen.ts:248` — « FillAroundBattleWindows stub » : FAUX (corps réel `battle_gfx_sfx_util.ts:670`).
- `src/berry.ts:537-543` — « ObjectEventInteraction* non porté » : FAUX (plant/water/pick 1:1 dans
  `specials-registry.ts:2276`). Baies fonctionnelles.
- `src/clock.ts:34,52` — « dette future ClearDailyFlags/Dewford/TV/Weather/Mirage/lottery » :
  FAUX, les l.60-68 les appellent tous.
- `src/secret_base.ts:16-18` — en-tête « specials NON enregistrés / INERTE » : FAUX (33
  `registerSpecial` présents ; Enter/MoveOut/menus déco).
- `src/scrcmd_trainer.ts:41` — `SetCurrentApproachingTrainerObjectEventId` no-op : shim inutilisé
  (aggro dresseur réelle via `trainer_see`/`event_object_lock.c:151`).
- `src/field_player_avatar.ts:1303` — « bug latent (StartStrengthAnim stubbé) » : PÉRIMÉ (Force/
  boulders Route Victoire câblés `:1387`).
- `src/metatile_behavior.ts:167`, `src/tileset_anims.ts:9,26` — « TODO ENUM », en-tête « stub » :
  nettoyage seulement (comportements/anims corrects).
- `src/match_call.ts:2232,2241,2258,2293,2298` — « TRANSPILER-TODO &élément scalaire » : pas des
  trous (retour de l'objet par référence ≡ `&element` C).
- `src/mon_markings.ts:391`, `map_name_popup.ts:15,236`, `berry_powder.ts:12` — no-op/skip 1:1 corrects.
- `src/item_menu.ts:476,2110,1875` — « sac PAS wiré », « handlers STUBS », « à porter » : FAUX
  (sac wiré `CB2_BagMenuFromStartMenu`, `sItemMenuActions`/`ItemMenu_UseOutOfBattle` dispatchent tout).
- `src/start_menu.ts:5,10` — en-tête « POKéDEX/OPTIONS placeholder » : FAUX (ouvrent les vrais écrans).
- `src/main_menu.ts:496,703` — « Birch Speech stubs Phase D » : FAUX (discours Birch complet + `DoNamingScreen`).
- `src/naming_screen.ts:2331,2371` — « INERTE templates CAUGHT_MON/NICKNAME » : FAUX (câblés capture/éclosion).
- `src/party_menu.ts:2814` — `CursorCb_Give` « DETTE » : FAUX (donner-objet entièrement câblé).
- `src/engine/battle/script-interpreter.ts:310` — `_Cmd_stub` sur 239 opcodes : banc de test
  « voie L » ; le combat en jeu passe par « voie V » (wire-bytecode-bridge). Non atteint en solo.
- `src/battle_script_commands.ts:967,2783,2824,4641,9434,10290,8851` — « healthbarupdate stub »,
  « jumpifcantmakeasleep partial », « Uproar stub », « atknameinbuff1/resetsentmonsvalue/
  buffermovetolearn stub », « _SwitchPartyMonSlots stub », « yesnoboxlearnmove auto-NO »,
  « stub return false » : **TOUS FAUX** — les fonctions (`:2213/:2825/:4667/battle_main.ts:2108/
  :10359`) sont portées 1:1 (plusieurs commentaires narrent un AUDIT FIX déjà appliqué).
- `src/battle_util.ts:2868,4543` — stubs météo (`WEATHER_HAS_EFFECT=true`) : explicitement
  RETIRÉS (le vrai `WEATHER_HAS_EFFECT` est branché partout).
- `src/battle_controllers.ts:519-540,638` + `battle_controller_opponent.ts:1148,1386,1843` +
  `battle_controller_player.ts:467,2877` — en-têtes « Emit* = stubs vides » / « Était un STUB » :
  FAUX (les `Emit*` écrivent bufferA + enqueue ; le code réel narre des correctifs passés).
- ~40 commentaires `TRANSPILER-TODO INCGFX` (pokenav/match_call) : assets chargés async, stales.

---

## 6. HORS PÉRIMÈTRE (exclu à raison — une ligne chacun)

- **Link / multijoueur / union room / trade / RFU** — branches `battle_controllers` link,
  `cable_club.inc` (dont `Script_FacePlayer` no-op, utilisé uniquement par le cable club),
  `link*.ts`, `union_room_chat.ts` : exemption actée, jamais atteint en solo.
- **Recorded battles / record mixing** — no-op documentés (RecordedPlayer/RecordAllBattlerData).
- **Battle Frontier / Tower / Factory / Pike / Palace / Pyramid / Arena / Dome / Apprentice /
  Trainer Hill** — post-game hors solo ; fichiers INERTES + `Call*Function` specials `() => 0`.
  *(Exception : `DoSpecialTrainerBattle` STEVEN — combat multi Space Center — EST câblé et vérifié.)*
- **E-reader / Mystery Gift / Wonder News/Card** — `ereader_helpers.ts` (throws save-flash),
  `mystery_event_script.ts` (throws), `mystery_gift.ts`, `wonder_news.ts` : exempts.
- **Braille** — exemption architecturale actée (`text.ts:409 FONT_BRAILLE` ; moteur-texte émulé).
- **Contest (concours)** — `contest*.ts`, `pokeblock.ts`, PokéblockCase : hors solo.
- **Minigames** — slot_machine, roulette, pokemon_jump, dodrio, berry_blender : hors solo obligatoire.
- **International / multi-langue** — `ConvertInternationalString`/`…PlayerName` no-op (jeu mono-FR).
- **Son bas niveau hardware** — moteur m4a = port 1:1 séparé validé (ne pas ré-auditer) ;
  `SetHBlankCallback`/interrupts/REG_IE = no-op web légitimes.
- **Save-flash / RTC hardware** — secteurs de sauvegarde flash + RTC matériel non modélisés
  (la logique save/load des blocs + l'horloge de jeu, elles, SONT portées et fonctionnelles).
- **Chiffrement/checksum BoxPokemon (Mauvais Œuf)** — DETTE ASSUMÉE documentée (modèle plat
  non chiffré, neutre gameplay, pas de `.sav` externe) : `pokemon.ts:1087` skip.
- **Devtools / harness scenes** (`harness/devtools/**`, `TestOverworldScene`) — outillage
  debug, non 1:1, non livré.

---

## 7. NOTES DE FIABILITÉ & INCERTITUDES

- **Audit STATIQUE** (lecture code + décomp), non rejoué en jeu. Le bloquant §2.1 (Mossdeep)
  est vérifié 2× au code (confiance haute) mais mérite confirmation en jeu.
- Fichiers massifs (`pokemon_storage_system` 6726 l., `event_object_movement` ~9000 l.,
  `battle_script_commands`) : inventaire de fonctions + chemins porteurs vérifiés, pas chaque
  ligne. La long-tail `event_object_movement` (MovementActions JOG/RUN/EMOTE/déguisement) est
  cosmétique (WALK/FACE/JUMP critiques portés → aucun mouvement scénarisé obligatoire ne hang).
- **Moteur de combat** (battle_main/script_commands/util/IA/controllers/setup/message) :
  sweep dédié TERMINÉ → table d'opcodes 249/249 + IA 99/99 complètes, STEVEN multi + party
  save/restore OK, zéro bloquant ; écarts fins en §3.10. La seule incertitude « à confirmer
  en jeu » de ce lot (softlock Wally) est TRANCHÉE ici : non bloquant (pas de `waitstate` dans
  le script Petalburg, cf. §3.10).
- Points « incertains » signalés explicitement : `match_call` INCGFX, `mauville_old_man`
  interactif, `pokemon_summary_screen` met-location, `bag-item-effects` pierre d'évolution
  (vérifié OK : `ItemUseCB_EvolutionStone` porté `party_menu.ts:1310`).
- La **Zone Safari** (§4) est optionnelle mais NON fonctionnelle (mécaniques de combat Safari
  non câblées) — à valider si un chemin solo la traverse (elle ne contient rien d'obligatoire).
