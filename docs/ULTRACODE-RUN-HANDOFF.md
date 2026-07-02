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

## Branche & état

- **Branche de travail : `Byte-VM-ultra`** (clone de `Byte-VM` @ `db4b2f32`). JAMAIS push.
  `Byte-VM` reste la branche saine — n'y merger qu'après validation user.
- Derniers commits : `08652a65` (éclosion P2.2 complète A→Z) → `db4b2f32` (3 fixes verdict :
  affine EMERGE, DISPCNT bit OBJ, icône mon naming screen). Tous vérifiés en jeu, tsc=0.
- Décomp (source de vérité) : `D:/Projet 1/decomps/pokeemeraude` (build FR).
- Serveur : `preview_start` name `pokemon-web-demo` port 5173. Jeu : `http://localhost:5173/?debug`.

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

## Backlog (ordre libre, « jusqu'au mini détail »)

### Bugs ouverts (verdict user, diag fait)
1. **Steps/events** (GLOBAL, préexistant) : en ROM le joueur TERMINE son anim de pas puis est
   locké en position neutre avant tout event (dialogue, éclosion…) ; chez nous l'event coupe
   le pas. `FieldGetPlayerInput`/`UpdatePlayerAvatarTransitionState` (field_player_avatar.ts)
   vérifiés 1:1 → suspect = timing/frames des anims de pas du held movement
   (event_object_movement) vs ROM, ou l'ordre PlayerStep/tick. Diag AU SOL requis
   (sonde : frame d'anim du sprite joueur au moment du lock).
2. Transition éclosion : reste ~4% de pixels non-noirs sur 3 frames (naissance du fade-in ?)
   — vérifier si ROM-exact ou résidu (sonde `__transProbe` pattern dans la session).
3. Rythme dialogues scène évolution : amplitude des pauses = traînes des WAV SE rippés —
   verdict émulateur user requis (pas actionnable sans lui).

### Dettes notées (mémoire/commits)
- Pierre d'évolution : câblée (bag → BeginEvolutionScene), JAMAIS testée en jeu.
- `ItemUseCB_TMHM` non porté (branche CT/CS de `_taskLearnedMove` = console.warn).
- Encodeur : `{PLAY_SE X}` à argument nommé strippé (party_menu `_preparePartyMsg`).
- Messages party génériques posés par bag-item-effects : vieux strip, sans ▼ final.
- `TryFadeOutOldMapMusic` (TODO TestOverworldScene) ; `GetWarpDestinationMusic` adapté
  (sWarpDestination non exposé).
- Icône naming : bob idle 2 frames non animé (statique frame 0 — moteur pokemon_icon,
  `UpdateMailMonIcon` n'est tické que par le mail).
- P1.1 : 37 `unresolvedRelocs` byte-VM.
- Anim EMERGE au reveal éclosion : sondée correcte, jamais validée frame-par-frame à l'œil.

### Gros chantiers (CHEMIN + pauses) — l'oracle donne les listes exactes
- **CHEMIN P2.3+** : aggro dresseurs (CheckForTrainersWantingBattle), fadescreen/
  WaitForWeatherFadeIn (partiellement porté à l'éclosion), suite de `docs/CHEMIN-1TO1.md`.
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
