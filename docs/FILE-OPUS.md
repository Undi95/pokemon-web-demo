# FILE-OPUS — la file d'exécution « jeu complet par Opus, dirigé »

# ⓪ DÉMARRE PILE ICI (passation Fable 5 → Opus, 2026-07-12)

**État au moment de la passation** : quête principale câblée de bout en bout
(boot officiel, CS, puzzles gyms, ShakeCamera, multi Steven lançable) ; combats
simples validés de longue date ; **doubles : logique 1:1 à ~95 % (différentiel
§A-ter), rendu en chantier (§A-bis)** ; dernier test user `launchTB(51)` = le
combat se joue mais bugs frais ci-dessous. Vague C 292/330 fns. Pokénav : dossier
§E.1 prêt. **Protocole par étape** : agent Opus sur spec fermée → `npx tsc
--noEmit`=0 → oracles (callgraph/body-parity/E2E) → review du rapport → commit
français signé du modèle actif → **test EN JEU par Undi sur GO explicite**
(jamais pendant qu'un agent écrit). JAMAIS push. Contrat CLAUDE.md = loi.

## ÉTAPE 1 — bugs frais du dernier test (logique double résiduelle) [D'ABORD]
1.1 **Le remplaçant exécute l'attaque du mon sorti** (« j'ai switché mes 2 mons ;
    Léviator fait Surf DÈS qu'il arrive ») : l'action `B_ACTION_USE_MOVE` du
    battler n'est pas remplacée/consommée par le switch. Tracer le scénario
    « 2 switches le même tour » pas à pas : HandleTurnActionSelectionState
    (bm.c:4129 — quand l'action passe de move→switch, gChosenMove/gBattleStruct
    ->chosenMovePositions doivent suivre), HandleAction_Switch (bu.c:294) et la
    re-liaison des actions après send-out. Vérifier AUSSI que le fix
    HasNoMonsToSwitch `1204283dc` est bien actif (le test user date d'AVANT ?
    re-tester d'abord, la corruption expliquait des symptômes similaires).
1.2 **Pacing** : « le temps de pause n'est pas respecté entre les attaques » —
    comparer les opcodes pause/waitmessage/B_WAIT_TIME du script interpreter
    (battle_script_commands.c Cmd_pause/Cmd_waitmessage/Cmd_waitstate + les
    délais des printstring) au port : chercher les waits court-circuités
    (delay compté en frames moteur vs réel ?).
1.3 **Valider en jeu les fixes `1204283dc`** (victoire au dernier mon, musique
    au retour) — pas encore confirmés par Undi.
1.4 Transition d'entrée = §A-bis B2 (assets PokeballsTrail) — la seule erreur
    console restante du boot combat.

## ÉTAPE 2 — rendu combat (§A-bis, dans l'ordre) : A3 sprites qui disparaissent
    (monbg/teamattack) → A4 barres PV stables (Q24.8 + CpuCopy32) → B2 assets
    PokeballsTrail → B1 retrait-ball ancré bas (⚠ vérifier renderer y2 d'abord)
    → B3 registry anims long tail. Test après chaque lot : launchTB(51) +
    combat simple témoin (zéro régression single).

## ÉTAPE 3 — outillage (déblocants) :
3.1 **Chip user conservé : fix `stripC` avale `//*ptr` dans
    audit-callgraph-closure.cjs** (le commentaire `//*dest = *ptr;` ouvre un
    faux bloc → engloutit des centaines de lignes → dépendances fantômes).
    Le fix existe déjà dans audit-body-parity.cjs (scanner un-passe) — le
    reporter à l'identique. Puis relancer l'oracle global (les stats bougent).
3.2 **`--merge` pour transpile-c.cjs** (§C) : LE déblocant des 168 fichiers
    partiels. S'appuyer sur body-parity pour savoir quoi émettre.
3.3 Whitelist body-parity (§F) : link|multi|recorded|tower/factory/tent/palace
    → le top devient pure dette solo à consommer au fil de l'eau.

## ÉTAPE 4 — vague C : lots 10-12 (mystery_gift srv/cli 32 fns, bard/braille 6,
    reliquats) puis socle frontier ciblé (les refs-throw des lots 6-8) via
    --merge ou transcription manuelle (§B).

## ÉTAPE 5 — POKÉNAV (§E.1, priorité user) : L1 socle LoopedTask+substruct+
    orchestrateur (jeter le squelette) → test bandeau/icônes → L3 Match Call
    (le mieux loti) → L2 carte Hoenn (gros : moteur region_map.c entier) →
    L4 Condition/Rubans en dernier.

## ÉTAPE 6 — chemin critique, fermeture : valider en jeu multi Steven
    (`launchStevenMulti()`) et le vrai double Lévy & Tatia (arène 7) ; scènes
    climax §0.4 : rayquaza_scene.c (~120 fns, cat.B — après --merge) + météo
    orbes (DoOrbEffect/WaitWeather) ; dettes visuelles Steven (back-pic).

## ÉTAPE 7 — contenu : Contests (§E.2 : contest.ts état réel + UI cat.B —
    contest_effect déjà prêt) puis Frontier (§E.3, après socle battle_tower).

## ÉTAPE 8 — dettes §F au fil de l'eau + polish §A-bis C.

**Critère de FIN : un run complet new game → Panthéon joué par Undi sans
blocage ni « visiblement faux », E2E boot-overworld + double-battle verts,
oracle body-parity sans dette solo-core non annotée.**

> Rédigé par Fable 5 (2026-07-11, ~15 % de quota restant). Ce document transforme le
> reste du chantier en **file exécutable par agents Opus** : chaque entrée = un
> périmètre fermé + un prompt-type + ses oracles + ses critères d'arrêt.
> Modèle validé en session (6 fixes + 212 fns transpilées + 4 paliers doubles pour
> ~1 % de quota Fable) : **spec fermée → agent Opus → oracles → review échantillon
> → test en jeu par Undi.**

## Règles transverses (à coller dans CHAQUE prompt d'agent)

1. **Contrat CLAUDE.md** : transcription ligne-à-ligne du décomp
   (`D:/Projet 1/decomps/pokeemeraude`), mêmes noms, jamais improviser, STOP+rapport
   si ambigu. `npx tsc --noEmit` = 0. PAS de commit par l'agent (review humaine).
2. **Session live** : si Undi teste en jeu, AUCUNE édition de fichiers qu'il exerce
   (HMR sert du code cassé). Fichiers NEUFS inertes = toujours sûrs.
3. **Adaptations** : toute divergence moteur = commentaire avec précédent in-file
   cité (fichier:ligne). Ce qui manque = ref locale qui `throw` nommé, JAMAIS de
   stub silencieux.
4. **🩸 Bugs transpileur récurrents** (vérifier à chaque lot) :
   ptr `u16*` déréférencé faux (→ vue `Uint16Array` LE) · arrays C dimensionnés à 1
   (`Int16Array.from([0])` au lieu de `new Int16Array(N)`) · arrays de POINTEURS
   aplatis en `NaN` (→ `Uint16Array[]`) · wraparound u8 (`x+255` = `x−1`, jamais
   littéral) · comparaisons de pointeurs (NULL = adresse 0, jamais déréférencer).
5. **Oracles** : `node scripts/audit-callgraph-closure.cjs --file X.c` (avant/après)
   · `npx tsc --noEmit` · `__e2e.run('boot-overworld')` pour les régressions boot ·
   test EN JEU par Undi = seul verdict final.

## 0. CHEMIN CRITIQUE — les 4 lots entre nous et le Panthéon (carte 2026-07-11)

Audit complet des ~42 jalons obligatoires : **CS toutes portées et réelles**
(Coupe/Surf/Force/Éclate-Roc/Cascade/Plongée/Flash/Vol), ~20 items d'histoire =
vrais handlers, évolution/aggro OK. Restent EXACTEMENT :

1. **`ShakeCamera` hang (fix EN VOL 2026-07-11)** — field_specials.ts:600 no-op
   sans signal waitstate → 4 scènes obligatoires suspendues à vie : Groudon
   (MagmaHideout_4F), Kyogre (SeafloorCavern_Room9), réveil Rayquaza
   (SkyPillar_Top), climax Sootopolis ×10 (ouvre GYM 8). 1 fix = tout l'endgame.
   Même famille (cosmétique) : SpawnCameraObject/RemoveCameraObject no-op.
2. **Puzzles d'arènes (fix EN VOL)** — Mauville badge 3 : MauvilleGymPressSwitch/
   SetDefaultBarriers/DeactivatePuzzle JAMAIS implémentés. Fortree badge 6 :
   RotatingGate_InitPuzzle(AndGraphics) EXISTENT (rotating_gate.ts:357/378)
   mais CLOBBERÉS par stub-loop :1483 → dé-clobber.
3. **Combats spéciaux** — multi Steven Space Center (DoSpecialTrainerBattle
   :1025, ChooseHalfPartyForBattle :1041, Save/LoadPlayerParty :725/726 no-op) ;
   double obligatoire Lévy & Tatia GYM 7 (data ✅, moteur = chantier A en cours).
4. **Scènes climax** (après le lot 1 : plus un hang, du visuel manquant) —
   rayquaza_scene.c ~120 fns (cat.B) + météo orbes (DoOrbEffect/WaitWeather stub).

Non bloquants notés : entrées party-menu Coupe/Éclate-Roc/Cascade/Plongée
absentes (voie overworld A fonctionne), coupe-sur-herbe, Cable Car (Jagged Pass
alternatif), setdivewarp fixe (post-game), BattleSetup_StartLegendaryBattle stub
(TOUS les légendaires capturables = post-Panthéon).

## A. DOUBLES — finir le premier-de-série (EN COURS, prioritaire)

État : intro complète ✅ (commits `8a4eb15f`, `ad3d0591`, `1a6bcd29`). Test :
`await __byteVm.load()` puis `__byteVm.launchTB(51)` (Inès & Guy ; 483 = Gina & Mia).

- **A1 (en vol)** : freeze après le choix du move — agent sur 4 hypothèses classées
  (HandleInputChooseTarget input-read / flèches silencieusement absentes /
  gMultiUsePlayerCursor init / gate d'émission). bcp.c:340-640.
- **A2 — healthboxes doubles 1:1 (chunk multi-fonctions)** : en double, les boxes
  joueur sont les PETITES (barre seule) ; SELECT bascule barres↔chiffres
  (`_SwapHpBarsWithHpText`, stub bcp.ts:~390). Exige : régions VRAM par POSITION
  (aujourd'hui side-keyées : les 2 boxes d'un côté partagent le tileId →
  contenu dupliqué, battle_interface.ts:1944/2430) + asset `battle_bar` à extraire
  (chiffres HP adverses, battle_gfx_sfx_util.ts:98-265 warn documenté) + layouts
  décomp battle_interface.c (GetHealthboxElementGfxPtr, sHealthboxElementsGfxTable).
- **A3 — anims partenaires** : helpers `battle_anim_*` qui renvoient 0xFF/-1
  (battle_anim_mon_movement.ts:67, battle_anim_normal.ts:238, battle_anim_water.ts:134,
  battle_anim_utility_funcs.ts:31,880,1046) → transcrire les vraies résolutions de
  partenaire (BATTLE_PARTNER) depuis les .c homonymes.
- **A4 — validation** : tour complet, moves multi-cibles (BOTH → 2 hits), IA de
  cible (`ChooseMoveOrAction_Doubles` porté, jamais confronté), switch/faint en
  double, EXP split. Puis un dresseur double RÉEL sur route (données
  `trainers.json` doubleBattle + approche 2 dresseurs `FreezeForApproachingTrainers`).

## A-bis. RENDU COMBAT — audit complet décomp↔port (2026-07-12, 7 symptômes user)

### Lot A (gameplay/lisibilité)
- **A1 clignotement de cible (~15 l, EN VOL)** : SpriteCB_ShowAsMoveTarget/BlinkVisible/
  HideAsMoveTarget DÉJÀ portés (battle_main.ts:3770/3777/3786) mais orphelins — les
  stubs _SpriteCB_* (bcp.ts:1011-1021) doivent poser les callbacks 1:1 (bcp.c:367-540).
- **A2 garde doubles level-up (~35 l, EN VOL)** : UpdateHpTextInHealthbox (bi.ts:1396)
  sans la garde `side==PLAYER && !IsDoubleBattle()` (bi.c:1146) → gros digits single
  dessinés en double ; router vers UpdateHpTextInHealthboxInDoubles (:2987, déjà 1:1).
- **A3 restauration OBJ post-monbg + team-attack doubles (~90 l)** : Cmd_clearmonbg
  restaure via getBattlerMonSpriteId (0xFF → reste invisible) ; Cmd_teamattack_
  movefwd/moveback quasi-stubs (C21→TS3, ba.c:1770/1807) ; IsBattlerSpriteVisible
  à réaligner (ba.c:649). = les « sprites qui disparaissent ».
- **A4 barres de PV stables (~50 l)** : MoveBattleBarGraphically (bi.ts:1178) tronque
  le Q24.8 (realHp :1189) + redraw complet au lieu du CpuCopy32 de 6 tuiles
  persistantes (bi.c:2298-2307) = saccade+flicker.

### Lot B (fidélité)
- **B1 retrait-ball ancré bas (~30 l + audit renderer)** : GetBattlerYDeltaFromSpriteId
  non porté → SetBattlerSpriteYOffsetFromYScale hardcode v=64 (bam.ts:703/726 vs
  bam.c:1873). ⚠️ vérifier D'ABORD que le renderer honore sprite.y2 sous affine.
- **B2 assets PokeballsTrail** : la transition dresseur NORMAL portée mais assets KO
  → fade-noir ~3 s (battle_transition.ts:100-116). Pipeline assets, petit.
- **B3 registry anims long tail** : Cmd_createvisualtask/createsprite skip silencieux
  (ba.ts:1450-1476/:1288) + objMode Blend jeté (battle-anim-registry.ts:30-33).

### Lot C (polish)
- Transitions spécifiques (BIG_POKEBALL, GRID_SQUARES, CLOCKWISE_WIPE, RIPPLE, WAVE,
  mugshots E4 — fallback SLICE gracieux aujourd'hui) · GetBattlerSpriteCoordAttr
  (C86→TS15) placement pixel-exact des particules.

### Top corps creux battle_* (oracle, à épaissir au fil de l'eau)
UpdateHpTextInHealthbox 50→9 · MoveBattleBarGraphically 44→12 · GetBattlerYDelta
50→9 · GetBattlerSpriteCoordAttr 86→15 · HandleSpeciesGfxDataChange 65→28 ·
MoveBattlerSpriteToBG 53→42 · UpdateNickInHealthbox 39→13 · BattleLoad*MonSpriteGfx
37/32→11 · Cmd_monbg_static 29→15 · UpdateLvlInHealthbox 22→10.
⚠️ Nuance oracle : battle_transition.c ~90 « absents » = structure custom
name-mismatch, 7 transitions réellement portées — ne pas surévaluer.

## A-ter. DOUBLES — LOGIQUE DU TOUR : différentiel complet (2026-07-12)

**Verdict : ~95 % 1:1.** Confrontés et FIDÈLES : HandleTurnActionSelectionState
(cancel-partner, absents), SetActionsAndBattlersTurnOrder (switch/objets d'abord,
tri 4 battlers), GetWhoStrikesFirst, Pursuit (2 opcodes), redirection cible morte
(follow-me/Lightning Rod/RANDOM/absent→partenaire, bu.c:78-261), HandleFainted
MonActions, MOVEEND_NEXT_TARGET, EXP split double (getexp c:3255-3428),
checkteamslost, outcomes/textes doubles, IA ChooseMoveOrAction_Doubles (0/112
deps suspectes). Seuls écarts (fixes intégrés au lot fin-de-combat EN VOL) :
- **HasNoMonsToSwitch** : 2 ré-impl ad-hoc n'excluent pas les mons ON-FIELD ni
  monToSwitchIntoId (bu.c:2262-2377) → prompt de remplaçant inexistant/softlock
  quand banc vide + partenaire vivant ; branche TWO_OPPONENTS absente.
- battlerPartyIndexes pré-switch : `= active` au lieu de `= gBattlerPartyIndexes
  [active]` (bm.c:4241) → Soin Naturel réécrit le mauvais slot.
Secondaires NON double-spécifiques (dette générale) : Cmd_switchindataupdate
mince · forcerandomswitch branches link + _SwitchPartyMonSlots · TryClearRage
Statuses stub.

## B. VAGUE C — lots restants (catégorie A, fichiers neufs inertes)

Commande : `node scripts/transpile-c.cjs --file X.c` (ou `--batch a.c,b.c`).
Faits : lots 1-7 = 212 fns (`848df7da`→`4af648d2`). Restent :

- **Lot 8** : `battle_pike.c` (54 fns) — refs-throw socle comme palace/factory/tent.
- **Lot 9** : `ereader_helpers.c` (26) — cœur decode pur ; I/O flash = refs-throw.
- **Lots 10-11** : `mystery_gift_server.c`+`mystery_gift_client.c` (32) — couche
  link = refs-throw (pattern mystery_event_script).
- **Lot 12** : `bard_music.c`+`braille.c` (6) + reliquat (berry_fix, reload_save).
- **Socle Frontier** (déblocant A/B) : les manquants de battle_tower.c/frontier_util.c
  listés dans les refs-throw des lots 6-8 (SetBattleFacilityTrainerGfxId,
  gFacilityTrainers/Mons, GetFrontierTrainerName…) — transpiler battle_tower.c en
  PARTIEL exige --merge (voir C) ou transcription manuelle ciblée de ces fonctions.

## C. OUTILLER `--merge` (déblocant majeur)

168 fichiers .c PARTIELS (le vrai backlog). `transpile-c.cjs` sait générer un
fichier NEUF ; il faut le mode « compléter un .ts existant » : détecter les
fonctions déjà portées (AST ou marqueurs), n'émettre QUE les manquantes de
l'oracle, à la fin du fichier, avec leurs imports. Spec : chantier outillage
(pas de risque jeu), tester sur un petit partiel (ex. `trainer_hill.c`).

## D. CATÉGORIE B — UI (594 fns, agents avec garde-fous renderer)

Top : `slot_machine.c` (254 !), `rayquaza_scene.c` (72), `battle_dome.c` (71),
`use_pokeblock.c` (51), `frontier_pass.c` (37). Chaque lot : transcrire la logique
+ RENDU 1:1 en suivant un écran déjà porté (option_menu/naming_screen comme
gabarits) ; toute valeur magique renderer = précédent cité sinon STOP.

## E. CÂBLAGES (premiers-de-série restants — design humain puis agents)

1. **Pokénav** (dossier complet 2026-07-12) : 100 % transpilé, 0 % câblé — **409
   sentinelles `__wireTodo` / 13 fichiers** (menu_handler 10 · handler_gfx 40 ·
   main_menu 19 · list 15 · region_map 48 · match_call data 5/list 21/gfx 67 ·
   conditions 17+66+36 · ribbons 35+30). Entrée START **DÉJÀ câblée**
   (start_menu.ts:558, gated FLAG_SYS_POKENAV_GET → StartMenu_OpenPokenav →
   CB2_InitPokeNav) mais ouvre le SQUELETTE pokenav.ts (écrit main, 0 sentinelle)
   — À JETER et réécrire en orchestrateur réel. Assets : DÉJÀ extraits
   (public/decomp/em/pokenav/**, 224 fichiers ; mapping symboles gfx→binaires =
   micro-tâche L1).
   **L1 (SOCLE)** : moteur `CreateLoopedTask`/`IsLoopedTaskActive`/`Task_RunLoopedTask`
   (pokenav.c:210-313, décode LT_INC/PAUSE/CONTINUE/FINISH, ⚠ id packé
   (taskId,seqId) à reproduire exactement) + allocateur substruct
   (gPokenavResources->substructPtrs, pokenav.h:72-93) + Task_Pokenav (:434) +
   table PokenavMenuCallbacks (:55-205) + CB2_InitPokeNav (:315) → puis câbler
   main_menu+menu_handler(+gfx). Sentinelles bg/DMA probablement aliasables aux
   helpers existants — vérifier avant de porter. Test : START → POKéNAV →
   bandeau+icônes, D-pad, Éteindre/B = CB2_ReturnToFieldWithOpenMenu.
   **L2 carte Hoenn** ⚠ plus gros qu'annoncé : le MOTEUR region_map.c entier est
   à porter (region_map.ts actuel = shim noms FR ; le Vol passe par fldeff_fly).
   **L3 Match Call** : le mieux loti (match_call.ts porté, data 5 sentinelles) —
   travail = UI list/gfx.
   **L4 Condition+Rubans** : ~184 sentinelles, post-passation.
   Pièges (mémoires) : ResetSpriteData+FreeAllSpritePalettes à l'init ·
   RunTasks→AnimateSprites→BuildOamBuffer→UpdatePaletteFade + VBlank
   TransferPlttBuffer→LoadOam→ProcessSpriteCopyRequests · baseBlock InitWindows
   sans chevauchement (précédent option_menu/naming) · nit : start_menu utilise
   gText_MenuOptionPokenav vs décomp gText_MenuPokenav.
2. **Contests** : contest_effect prêt (`c9bedba6`, dispatch exporté) ; il faut
   contest.ts (l'état eContestantStatus réel) + l'UI (cat.B) + les scripts.
3. **Frontier** : facilities transpilées inertes ; câblage après socle B.

## F. DETTES RÉPERTORIÉES (petites, spec fermée)

- Vestiges audio : preload `groudon.wav`/`kyogre.wav` (harness/boot/intro-host.ts:112)
  + map `SPECIES_NAMES→wav` morte (decomp-globals.ts:955-1000) → purger.
- Devtool « cri= » : référentiel moteur ≠ restitution (rafales en avance) →
  décaler l'indicateur de la latence du ring, ou étiqueter « (moteur) ».
- Calibration cris : moteur PROUVÉ 1:1 (peak 45 exact, oracle chiffré) mais jugés
  faibles à l'oreille → A/B avec vidéo GBA réelle, ne pas toucher au moteur.
- `PrintControls` naming : divergence fontId=1/x=4 vs décomp FONT_SMALL/x=2
  (commentée in-file) — aligner et re-valider à l'œil.
- Renommage cosmétique `TestOverworldScene` → `GameHostScene` (host unifié).
- Warns png-loader `.bin absents` (battle_anims sprites-src) : extraire les .bin
  ou baisser le log — fallback PNG fonctionnel, cosmétique.
- `initAllHealthboxes` fallback câblé 0/1 (chemin mort) — boucle gBattlersCount.
- `GetBattlerAtPosition` (battle_anim_mons.ts:57) retourne 0 au lieu de
  gBattlersCount sur no-match (décomp) — navigation cible avec battler KO/absent
  pourrait viser 0 au lieu de sauter. Fichier largement importé : chantier dédié.
- Flèche de sélection de cible (SpriteCB_ShowAsMoveTarget) = stubs no-op R3
  cosmétiques (bcp.ts:694 + HandleInputChooseTarget) — rendre la flèche 1:1.
- `SetDynamicWarp` 3-arg (port) vs 4-arg (décomp) — réconcilier au câblage Frontier.
- 🩸 **`gTrainers[].trainerClass` codé en dur à 0** (battle-trainer-data-bridge.ts:116,
  champ « déféré ») — neutralise le switch GetBattleBGM (porté entier `127565ce`),
  GetTrainerBattleTransition et _getTrainerClass. Peupler depuis
  gameDataTrainers[key].trainerClass (string→id) + re-valider transitions/noms.
- Whitelist body-parity à poser (audit-reports/body-parity-whitelist.json :
  link|multi|recorded_battle|battle_tower/factory/tent/palace) → le top devient
  pure dette solo. + BufferFanClubTrainerName (field_specials, était verrouillé).
- SpawnCameraObject/RemoveCameraObject : exige SpawnSpecialObjectEventParameterized
  (field_specials.c:1253) non porté — pans caméra scriptés cosmétiques.

## Protocole de reprise (chaque session)

1. Lire `MEMORY.md` (ligne stratégie = état à jour) + ce fichier.
2. Un agent Explore fait l'état des lieux si le chantier a bougé.
3. Lancer les lots en agents background (fichiers neufs = parallélisables).
4. Review par échantillon + oracles ; commits français signés du modèle actif.
5. Test en jeu par Undi = la seule validation finale. JAMAIS push.
