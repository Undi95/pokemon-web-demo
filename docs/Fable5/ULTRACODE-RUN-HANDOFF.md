# ULTRACODE RUN — trace de reprise (2026-07-02, ~22h)

**Pour : Fable 5 (post-compaction) puis Opus 4.8 (quand les crédits Fable sont épuisés).**

## Mandat user (verbatim, autorisation EXPLICITE)

> « cloner la branch actuelle, on va lacher le workflow de l'ultracode entier, tu va laisser
> les bots tout corriger/implementer sous ta supervision, utilise tout ce que tu peux.
> Je veux que tout sois corrigé/implémenté jusqu'au mini détail prêt, corrigé si il le faut,
> dans n'importe quel ordre, fait un travail impeccable et ne lésigne pas sur les moyens.
> En gros bourre jusqu'à ce que mes credit soit out hahaha. »

⚠️ Cette autorisation LÈVE exceptionnellement, pour CE run et cette branche uniquement,
les règles mémoire « JAMAIS Workflow/ultracode » et « 100% SOLO sur le code ».
Tout le RESTE du contrat tient (voir ci-dessous).

## Branche & état (MàJ fin de quart Fable, 2026-07-02 ~23h30)

- **Branche de travail : `Byte-VM-ultra`** (clone de `Byte-VM` @ `db4b2f32`). JAMAIS push.
  `Byte-VM` reste la branche saine — n'y merger qu'après validation user.
- Commits du run (tous : contre-vérif adversariale CONFORME + tsc=0 + vérifiés en jeu) :
  - `a659d2b8` handoff initial.
  - **`8ec8a7eb` VAGUE 1** : ItemUseCB_TMHM 1:1 complet (testé : TOXIK sur ARCKO, remplacement
    via summary, CT consommée) · encodeur {PLAY_SE X}/{PLAY_BGM X} réel + messages party recalés
    (phases gate-printer vs A/B) · chaîne warp-music (sWarpDestination, TryFadeOutOldMapMusic,
    fix warpId u8→s8 + MAP_DYNAMIC copie dynamicWarp entier — trouvés par la contre-vérif) ·
    icône mail DÉ-animée (ROM fige les icônes SpriteCallbackDummy, pokemon_icon.c:1289 ;
    la prémisse « bob naming » du backlog était FAUSSE) · oracle : variante `_Manual` reconnue.
  - **`966eb39b` VAGUE 2** : **BUG STEPS SOLDÉ** (PlayerForceSetHeldMovement/PlayerFreeze/
    StopPlayerAvatar + FreezeObjectEventsExceptOne portés, event_object_lock.ts réécrit en
    tasks 1:1, ScrCmd_lock/lockall branches complètes, câblés start_menu + item_menu SELECT ;
    PROUVÉ par sonde 60 Hz : pas terminé au centre tuile puis FACE_X 1 frame après le lock) ·
    **DAYCARE COMPLET 67/67** (modèle unifié save-blocks, dépôt/retrait/coût/hérédité avec
    bug Emerald InheritIVs conservé/menu niveau/party menu mode DAYCARE, 12 stubs specials
    remplacés ; testé en jeu : dépôt ×2, annulation, menu niveau, retrait 100₽ exact).
- Décomp (source de vérité) : `D:/Projet 1/decomps/pokeemeraude` (build FR).
- Serveur : `preview_start` name `pokemon-web-demo` port 5173. Jeu : `http://localhost:5173/?debug`.

## ⚠️ À VALIDER PAR LE USER / TESTS RESTANTS (fin de quart Fable)

- **Steps à l'œil** : sonde + screenshot conformes, mais le verdict A/B user reste à prendre
  (marcher en continu + PNJ/éclosion/START ; protocole détaillé dans le rapport vague 2).
- **Daycare non testés en jeu** : production d'œuf du vieil homme (2 mons compatibles + ~256
  pas — `Debug_AddDaycareSteps` exporté comme sonde), hérédité IV/moves, mail au dépôt/retrait,
  compat string 2 mons, éclosion de l'œuf produit (non-régression P2.2 vérifiée sans pension).
- **Pierre d'évolution** : câblée depuis P2.1, TOUJOURS jamais testée en jeu.
- **Résidu transition éclosion** : ~4% pixels non-noirs sur 3 frames (naissance du fade-in ?).
- Warp porte (kind=door) revalidé vague 1 ; sortie Centre Pokémon = musique reprend.

## Dettes mineures notées par les contre-vérifs (aucun bloquant, à solder au fil de l'eau)

- party_menu.ts ~2265/2475/3464 : CB2_GiveHoldItem/GiveItemToSelectedMon/switch-items utilisent
  encore `getItemKeyById` brut → clé sac fausse pour CT/CS en objet tenu → basculer sur
  `GetBagItemKey` (src/item.ts).
- CanMonLearnTMTutor : branche move-tutor = throw fail-fast (aucun appelant) — à transcrire
  au chantier move-tutor.
- Messages party std sans pause (« Impossible ici. ») : ROM = print instantané fenêtre std,
  nous = printer animé — divergence de timing, pré-existante.
- item_menu SELECT : `FreezeObjectEvents()` (item_menu.c:2059) omis car les CB de sortie vélo/
  itemfinder ne dégèlent pas — la vraie correction (porter l'unfreeze du CB vélo item_use.c:232
  PUIS ajouter le freeze) est maintenant possible.
- isPlayerStepFinished : gate `forceMovement===0` (stand-in door-walk) absent du décomp —
  freeze retardé pendant glace/courants ; à re-litiger si portes passent en tasks 1:1.
- start_menu OpenStartMenu : ordre lock/freeze inversé vs décomp (aucun effet, synchrone).
- save-blocks emptyDaycareMail : init [EOS] vs zérotage décomp pleine longueur (2 formes
  d'état vide, sans conséquence lue).
- daycare.ts : import PlaySE inutilisé ; party_menu BufferMonSelection : littéraux 6/7 au lieu
  de PARTY_SIZE importé.
- load_save.ts:478 GetCurrentMap lit loc.x/y (alias) — re-vérifier après le fix warpId s8.
- doLockForTrainer (scrcmd_trainer.ts) : adaptation simplifiée, à refondre au chantier P2.3
  avec FreezeForApproachingTrainers/IsFreezeObjectAndPlayerFinished (event_object_lock.c:151).

## Règles NON négociables (le contrat tient pour les bots aussi)

1. **TRANSCRIRE, pas improviser** — miroir 1:1 : mêmes noms de fichiers/fonctions/globals que
   la décomp. Pas de stub/pansement/hardcode « par flemme ». GREP la décomp avant d'écrire
   « non porté ».
2. **RIEN n'est « fini » sans** : `npx tsc --noEmit` = 0 **ET** vérification EN JEU (preview
   tools) **ET** diff mental vs décomp. Les findings d'agents se CONTRE-VÉRIFIENT AU SOL
   (leçon payée ×6) avant tout fix.
3. **Le superviseur (toi) garde la vérif en jeu** : le serveur preview est UNIQUE — ne jamais
   laisser plusieurs agents piloter le navigateur. Agents = lecture décomp + code + tsc ;
   superviseur = merge + test en jeu + commit.
4. Commits : staging EXPLICITE (jamais `git add -A` ; jamais `audit-reports/1to1|fleet/*`,
   `cartograph.json`, `callgraph-closure.json`) ; message heredoc `<<'EOF'` ; signature
   `Authored-by: Fable 5 & Undi <noreply@anthropic.com>` (Fable) ou
   `Authored-by: Opus 4.8 & Undi <noreply@anthropic.com>` (Opus).
5. cwd des outils = worktree fantôme → chemins absolus + `git -C "D:/Projet 1/pokemon-web-demo"`.
   Jamais `node -e` multiligne (muet) → Write un `.cjs`. Contrôles jeu = FLÈCHES
   (`scope.press('A'|'B'|'START')`, `scope.walk('LEFT', n)`).
6. Répondre au user en FR informel. JAMAIS demander « on s'arrête ? ».

## Outils / oracles (tout est committé)

- `node scripts/audit-callgraph-closure.cjs` — **l'anti-zap** : gaps globaux triés ;
  `--file X.c` = prépa chantier (fns du fichier + trous transitifs) ; `--sym Name` = fiche
  (défs, statut TS, appelants). C'est LA source du backlog exhaustif.
- `node scripts/find-import-cycle.cjs [src.ts] [dst.ts]` — chemins d'import (diag cycles ESM/TDZ).
- Preset `?debug` : ARCKO Lv15 (exp = Lv16-1, 5 SUPER BONBON → évolution), ŒUF Poussifeu
  slot 1 (éclosion en ~2 pas, se ré-arme au reload), Leveinard + 3 porteurs de CS,
  VIT. TEXTE 3 + CADRE 3. RAM-only (pas de save auto).
- Sondes runtime (console preview_eval) : `window.__rt` (gSprites/gTasks/gPaletteFade/gba),
  `window.__gPlayerParty`, `window.__gWeatherPtr`, `window.__byteVm.diag()`,
  `window.__m4aNowPlaying()`, `window.__sLockFieldControls`, `window.scope.*`.
  ⚠️ `import()` dynamique en console = 2e instance de module → sonder UNIQUEMENT via les
  exposés globalThis. Loggers setInterval : durée FIXE, jamais de cap silencieux.

## Pièges payés (NE PAS repayer)

- **Pattern task OBLIGATOIRE** : le runtime appelle `t.func?.(t)` (OBJET task, pas taskId) →
  `CreateTask((t) => Task_X(t.taskId), prio)` sinon `DestroyTask(objet)` = no-op → task zombie.
- **Cycles ESM/TDZ** : jamais d'import statique code-jeu → `harness/main.ts` ; jamais de gros
  module jeu dans le sous-arbre d'init de `decomp-globals` (flash-mask ↔ field_screen_effect
  payé) ; ponts `globalThis.__X` posés par le module propriétaire. Diag : find-import-cycle.cjs.
  Symptôme : boot mort « Cannot access 'X' before initialization », AUCUNE erreur console
  visible — tester `import('/harness/main.ts')` dans la console pour voir l'erreur.
- **HMR ment** : après tout changement de graphe d'imports → restart serveur (preview_stop/start),
  pas juste reload.
- Bitfields décomp : setter `v & 1` (pas truthy) — cf. isEgg 0x46 (egg_hatch).
- Arithmétique C : divisions ENTIÈRES (`(x/256)|0`), `USHRT_MAX/2` = 32767, wrap s16 `(v<<16)>>16`.
- specials portés = les RETIRER de `_SESSION_131_DECOMP_SPECIALS` (stub-loop clobber).
- `*/` dans un commentaire TS = fin de bloc → tsc après CHAQUE édit.
- Fenêtres UI : layout EXACT décomp (tilemapLeft/Top/baseBlock) — jamais « à peu près ».

## Backlog (ordre libre, « jusqu'au mini détail ») — MàJ fin de quart Fable

### ✅ SOLDÉS par les vagues 1-2 (ne pas refaire)
- ~~Steps/events~~ → `966eb39b` (freeze différé 1:1, prouvé sonde ; verdict à l'œil user restant).
- ~~ItemUseCB_TMHM~~, ~~{PLAY_SE X}~~, ~~messages ▼~~, ~~TryFadeOutOldMapMusic/sWarpDestination~~,
  ~~« bob » icône naming~~ (prémisse fausse : ROM statique ; mail dé-animé) → `8ec8a7eb`.
- ~~Daycare complet~~ → `966eb39b` (67/67, tests œuf/hérédité/mail restants en jeu).

### Bugs ouverts
1. Transition éclosion : reste ~4% de pixels non-noirs sur 3 frames (naissance du fade-in ?)
   — vérifier si ROM-exact ou résidu (sonde `__transProbe` pattern dans la session).
2. Rythme dialogues scène évolution : amplitude des pauses = traînes des WAV SE rippés —
   verdict émulateur user requis (pas actionnable sans lui).

### Dettes notées (mémoire/commits)
- Pierre d'évolution : câblée (bag → BeginEvolutionScene), JAMAIS testée en jeu.
- P1.1 : 37 `unresolvedRelocs` byte-VM.
- Anim EMERGE au reveal éclosion : sondée correcte, jamais validée frame-par-frame à l'œil.
- + la section « Dettes mineures notées par les contre-vérifs » ci-dessus.

### ✅ AGGRO DRESSEURS P2.3 — FAIT ET VALIDÉ EN JEU (`bb6b3b6b`, Opus 4.8, 2026-07-03)
trainer_see.c 36/36. Chaîne complète testée Route 110 (KINESISTE EDOUARD) : vision → « ! » →
approche multi-tuiles → intro → combat → post-combat (joueur face au dresseur + gotobeatenscript)
→ unlock ; déjà-battu = pas de re-aggro ; 2e dresseur aggro OK. Fixes superviseur au sol :
- DATA trainerType : `fieldmap.ts parseTrainerType` (était 0) + spawn copie trainerType/
  trainerRange du template (event_object_movement.c:1330/1332). Sinon 0 dresseur vu.
- Bug waitstate : DoTrainerApproach = PLAIN special (pas special-flow — doublait le waitstate
  opcode → freeze) ; Task_EndTrainerApproach émet SignalWaitState.
- Cascade cycles ESM/TDZ (P2.3 réordonnait l'init) : ponts globalThis trainer_see→scrcmd/
  battle_setup, field_control_avatar→trainer_see ; OPPOSITE_DIR→direction-coords ; mail MALE/
  FEMALE→global.ts. Diag : `import('/harness/main.ts')` console + find-import-cycle.cjs.
RESTE (dettes, non bloquant) : double-battle non testé en jeu ; disguise reveal arbre/montagne
non porté (StartRevealDisguise) ; musique de rencontre = MALE pour tous tant que le bridge
battle-trainer-data ne mappe pas encounterMusic (string trainer-parties.json) → id.

### (archive) plan P2.3 d'origine — pour référence
État : moitié AVAL portée et démarrable (opcode trainerbattle → TrainerBattleLoadArgs →
dotrainerbattle → BattleSetup_StartTrainerBattle, scripts trainer_battle.inc dans l'image
byte-VM) ; moitié AMONT (trainer_see.c) absente à 83% (6/36, seulement les icônes FldEff_*).
⚠️ DoTrainerApproach = stub `() => 0` (specials-registry:~1966 via _SESSION_131) + waitstate
= FREEZE GARANTI si EventScript_StartTrainerApproach se lance. Plan (11 étapes, fichiers :
trainer_see.ts, event_object_movement.ts, battle_setup.ts, field_control_avatar.ts, scrcmd.ts,
pokemon.ts, specials-registry.ts) :
1. GetMonsStateToDoubles_2 (pokemon.c:4514) → src/pokemon.ts (à côté de GetMonsStateToDoubles :283).
2. event_object_movement.ts : SetTrainerMovementType (c:4636), GetTrainerFacingDirectionMovementType
   (c:4645, table gTrainerFacingDirectionMovementTypes c:881), TryOverrideTemplateCoordsForObjectEvent
   (c:2499 + GetBaseTemplateForObjectEvent c:2462) ; compléter _MovementAction_RevealTrainer_Step0
   (:5677, branche BURIED → SetBuriedTrainerMovement + chemin disguise). FreezeObjectEventsExceptOne
   DÉJÀ porté (vague 2).
3. EWRAM dans trainer_see.ts : gApproachingTrainers[2] {objectEventId, trainerScriptPtr {buf,off},
   radius, taskId}, gNoOfApproachingTrainers, gApproachingTrainerId, gTrainerApproachedPlayer,
   gPostBattleMovementScript — REMPLACER les const figés 0 de battle_setup.ts:117-119 (cycle ESM :
   trainer_see→battle_setup + pont si besoin).
4. Vision : sDirectionalApproachDistanceFuncs + GetTrainerApproachDistance{,South,North,West,East}
   (c:301-368) + CheckPathBetweenTrainerAndPlayer (c:370-405, masque COLLISION_OUTSIDE_RANGE, wrap s16).
5. Machine TRSEE : enum + sTrainerSeeFuncList/2 (c:74-118) + 15 handlers (c:412-664) ;
   CreateTask((t) => Task_RunTrainerSeeFuncList(t.taskId), 0x50) ; data[] tFuncId=0, tTrainerRange=3,
   tOutOfAshSpriteId=4, tTrainerObjectEventId=7 ; Task_EndTrainerApproach = DestroyTask +
   ScriptContext_Enable (c'est LUI qui relâche le waitstate).
6. CheckTrainer (c:248) + CheckForTrainersWantingBattle (c:191) : scriptPtr NPC = getScriptOffset
   (npc.scriptLabel) → {buf, off} ; peek mode = buf[off+1] ; variante byte-VM de
   GetTrainerFlagFromScriptPointer (u16 LE à off+2 → FlagGet(1280+id)).
7. ConfigureAndSetUpOneTrainerBattle (battle_setup.c:1193) forme byte-VM ; factoriser
   makeByteVmTrainerArgSource (scrcmd.ts:606) pour curseur arbitraire ; refondre
   ConfigureTwoTrainersBattle/SetUpTwoTrainersBattle (la forme {opcodes,idx} actuelle est morte).
8. Câbler `if (CheckForTrainersWantingBattle()) return true;` en TÊTE de ProcessPlayerFieldInput
   (field_control_avatar.ts:261, 1:1 field_control_avatar.c:147).
9. Specials réels : DoTrainerApproach (RETIRER de _SESSION_131), SetTrainerFacingDirection
   (battle_setup.c:1224), TryPrepareSecondApproachingTrainer (trainer_see.c:666),
   GetCurrentApproachingTrainerObjectEventId (scrcmd_trainer.ts:23 stub) +
   GetChosenApproachingTrainerObjectEventId (c:784), PlayTrainerEncounterMusic (routage song-table).
10. Post-combat : PlayerFaceTrainerAfterBattle (c:794, gPostBattleMovementScript +
    ScriptMovement_StartObjectMovementScript script_movement.ts:464) — remplace le no-op registry:530.
11. Vérif : oracle --file trainer_see.c ≈36/36 ; test EN JEU superviseur (aggro Route 102/103,
    exclamation, approche multi-tuiles, déjà-battu = pas d'aggro, post-combat face au joueur).

### Gros chantiers (CHEMIN + pauses) — l'oracle donne les listes exactes
- **CHEMIN P2.4+** : fadescreen/WaitForWeatherFadeIn (partiellement porté à l'éclosion),
  suite de `docs/CHEMIN-1TO1.md`.
- **Combat (EN PAUSE)** : reprise = capture-throw, EXP-anim, SentPokes/switch-on-faint,
  combats spéciaux, helpers blend (`audit-reports/fleet/battle-inventaire.md`,
  mémoire `RESUME-combat-finish-1to1`). ~1 800 gaps oracle dominés par battle.
- **Pokédex (EN PAUSE)** : mémoire `chantier-pokedex-1to1`.
- **Pension/daycare** : dépôt/retrait, GiveEggFromDaycare, hérédité IV/moves — la production
  d'œuf est portée mais dormante (`--file daycare.c` pour la liste).
- **Sac : gros écrans restants** : mail ÉCRITURE (DoEasyChatScreen), PokéblockCase,
  Berry plant/Wailmer, étiquettes baies.
- **Son m4a** (accepté user, mémoire `chantier-son-m4a`) : porter m4a.c + sémantique m4a_1.s
  → AudioWorklet ; oracle = diff sample/sample vs dump mGBA. GROS — probablement pour un run dédié.
- **Sprite P3.9** : CreateSpriteAtEnd par nom + fns sprite.c restantes (39× appelants).
- Divers oracle top : GetBattlerForBattleScript, DisplayPartyMenuMessage, GetMonNickname,
  ResetInitialPlayerAvatarState, SetWarpDestination, LZDecompressWram…

### Mini-détails (exemples de la granularité attendue)
- Commentaires obsolètes au fil de l'eau (contrat : les corriger en passant).
- `_Manual` suffixes : ajouter la variante au matcher de l'oracle (audit-callgraph-closure
  `findPorted`) pour éviter les faux ABSENT (CB2_ReturnToField_Manual…).
- Icônes/positions/palettes UI : tout écart visuel vs décomp est un bug.

## Orchestration recommandée (Workflow tool)

- **Phases** : (1) inventaire ciblé (agents read-only → backlog JSON par domaine),
  (2) vagues d'implémentation par domaine avec `isolation: 'worktree'` (1 item = 1 agent,
  prompt = extrait décomp + fichiers cibles + règles 1:1), (3) contre-vérif adversariale
  (agents skeptiques sur chaque diff), (4) superviseur : merge, tsc, test EN JEU, commit.
- Prompts d'agents : TOUJOURS inclure le chemin décomp exact (fichier:lignes), l'interdiction
  des stubs, l'exigence tsc=0, et les pièges ci-dessus. Les agents ne touchent PAS au preview.
- Après chaque vague : `npx tsc --noEmit`, restart serveur, boot ?debug, smoke test (marche,
  party, un flux), puis commit de vague.
- Budget : bourrer jusqu'à épuisement (mandat user), mais chaque vague committée = progrès
  sûr. Petites vagues > grosse vague ratée.

## Recipe smoke-test en jeu (5 min)

1. `?debug` → canvas + zéro erreur console.
2. Marcher 3 pas → éclosion (« Hein? » → scène → OUI → naming avec icône → retour, unlock,
   BGM, POUSSIFEU dans la party).
3. Reload → START → SAC → SUPER BONBON sur ARCKO → learn/replace → évolution MASSKO complète.
4. START → sortir du menu → le start menu se rouvre en fondu.
