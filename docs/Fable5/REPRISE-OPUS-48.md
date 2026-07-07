# REPRISE OPUS 4.8 — mode d'emploi COMPLET (2026-07-04, Fable ~10%)

## §0. PROTOCOLE D'EXÉCUTION — BUDGETS DURS (Fable, après 500k gaspillés sur 1 bug)
> Le problème n'est JAMAIS le manque d'information (tout est dans ce doc). C'est la
> discipline d'exécution. Ces gates sont MÉCANIQUES — pas de « juste cette fois ».
1. **Le cycle unique autorisé** : QUESTION (1 ligne, écrite avant) → 1 SONDE/ORACLE →
   VERDICT (1 ligne) → ACTION (édit/test). Jamais 2 sondes de suite sans édit entre
   elles, sauf verdict contradictoire explicite.
2. **Budget Read : 3 par chantier** (le C de LA fonction transcrite · l'API d'UN helper ·
   1 joker). **0 Read pour un bug** — un bug se diagnostique par sonde LIVE, jamais en
   lisant du source. Grep = trouver UNE définition (« où est X »), jamais « comprendre ».
3. **Sonde INSTALLÉE, pas jetable** : état pas accessible en eval → poser un pont
   `globalThis.__probe*` dans le module (2 min, réutilisable à vie) au lieu de 10 IIFE
   de 30 lignes. Preuve : `__playerOE` a résolu en 2 sondes ce que 40 appels d'archéologie
   n'avaient pas trouvé.
4. **Checkpoint tous les 10 tool calls** : 1 ligne « qu'ai-je appris depuis 10 appels ? ».
   Réponse vide → CHANGER de méthode (installer une sonde, filmer, oracle) — ne JAMAIS
   répéter l'appel qui n'a rien donné.
5. **Prose : 2 phrases max entre tool calls.** Le résultat, pas le trajet. Zéro plan
   re-narré, zéro option non retenue, zéro re-délibération d'un choix déjà tranché.
6. **La sortie d'un outil est un FAIT.** Oracle dit ABSENT → c'est absent, on n'en
   re-vérifie pas la sortie par un autre moyen sans contradiction concrète.
7. **Visuel → film d'abord** : `dev.gfx.film({every,seconds})` (précis : 1/every rAF
   pendant S s) PUIS déclencher. Croix ✕ sur la mosaïque. Un screenshot unique rate
   toute anim <1 s.
8. **Scoper = 5 appels max avant la 1re ligne écrite.** tsc pointera les trous restants
   (c'est SON travail) ; on colmate après, pas avant.

> **LIS D'ABORD** : `MEMORY.md` (index mémoire) → topic `chantier-combat-100pct.md` (mandat final 17% en tête, ordre strict, cases à cocher). Contrat : **port miroir 1:1 STRICT** de `D:/Projet 1/decomps/pokeemeraude` — TRANSCRIRE ligne à ligne, jamais improviser, mêmes noms fichiers/fns/globals/imports. RIEN n'est « fini » sans test EN JEU. SOLO sur le code. Branche `Byte-VM-ultra`, JAMAIS push. Commits heredoc signés `Authored-by: Fable 5 & Undi <noreply@anthropic.com>`. Vérif : `npx tsc --noEmit` = 0 **ET** boot sain **ET** sonde en jeu.

## 1. Boucle de travail standard
1. Oracle → cible. 2. Lire le C (chemins absolus, `git -C`). 3. Transcrire (append-only si gros fichier). 4. `npx tsc --noEmit`. 5. Reload preview ×1 (HMR MENT — toujours reload complet). 6. Sonde en jeu (recettes §4). 7. Commit ciblé (JAMAIS `git add -A`, jamais audit-reports/). 8. Encrer mémoire.

## 2. ORACLES (lancer AVANT tout chantier)
| Outil | Rôle |
|---|---|
| `node scripts/audit-callgraph-closure.cjs --file X.c` | EXISTENCE des fns (✓/≈/✗) ; `--sym Name` = fiche |
| `node scripts/audit-stub-bodies.cjs [--file X\|--json]` | SUBSTANCE (corps vides, aveux stub/dette) — heuristique, croiser avec le C, marqueurs souvent PÉRIMÉS |
| `node scripts/audit-stub-priority.cjs [--min N]` | stub-bodies × refs C = kill-list par impact |
| `node scripts/audit-anim-callbacks.cjs [--min N]` | templates anims × callbacks enregistrés + tasks (createvisual/soundtask) × registered = **anims à vide**. Restants connus : AnimBounceBallLand, SpriteCB_PokeBlock_Throw, AnimTask_SwapMonSpriteToFromSubstitute (Clonage), Load/FreeBallGfx |
| `node scripts/find-import-cycle.cjs` | cycles ESM (boot mort silencieux = TDZ ; casser l'arête NON-C du chemin) |
| `scripts/extract-png-indexed-tiles.mjs <png> <out.4bpp.bin> 4` | asset byte-exact depuis png INDEXÉ décomp (+ .gbapal ordre PLTE) — LE workflow pour tout visuel « palette mauvaise » |

## 3. PIÈGES SYSTÉMIQUES (payés ×5 — grep AVANT de coder)
1. **Lecteur globalThis sans écrivain** : `globalThis.__X` lu mais jamais écrit = no-op silencieux (payé : `__itemsEnum`, `__playCry`). Symptôme muet/invisible → grep l'écrivain D'ABORD.
2. **`rt.X?.()` sur méthode inexistante** : optional chaining silencieux (payé : `rt.LoadSpritePalette`). Vérifier l'existence, préférer les imports directs sprite.ts.
3. **`import('...').then(m => m.fn(gActiveBattler))`** : les live-bindings sont lus à la RÉSOLUTION (post-boucle CB1) = dernier battler itéré. CAPTURER la valeur avant l'import (payé : shake healthbox).
4. **Deux implémentations divergentes** : un vrai port existe à côté d'un stub local vide que le flux appelle (payé : BattleAI_HandleItemUseBeforeAISetup, LoadBattleMenuWindowGfx). Grep les DEUX définitions.
5. **`sprite.oam.paletteNum` n'existe pas** : le réel = `paletteBank` via `rt.gba.oam[sprite.oamIndex]` ; `?? 0` teinte le battler joueur.
6. Autres : `node -e` multiligne muet → Write .cjs · heredoc >100 lignes casse sous Git Bash Windows → Write scratchpad + `cat >> cible` · jamais `perl -pi` C:→D: · `scope.press('a')` noms LOGIQUES (pas 'W') · sac combat rouvre sur OBJETS/curseurs mémorisés → screenshot avant valider · captures RAM perdues au reload.

## 4. RECETTES EN JEU (preview MCP, serveur port 5173)
- Boot : reload → attendre ~12 s → `gMain.callback2.name === 'MainCB2_Overworld2'`. Si MORT = cycle TDZ (diag `import('/harness/main.ts')` en console + find-import-cycle).
- Combat sauvage : `dev.battle.startWild(species, lvl)` (288=ZIGZATON). Lvl > joueur → transition SWIRL.
- Combat dresseur : `await __byteVm.load()` PUIS `__byteVm.launchTB(id)` — 333=ALLEN (2 mons L3-4), 114=CINDY (1 mon L7 + TOTAL SOIN → teste l'IA objets), 483=GINA&MIA (DOUBLE). ⚠️ launchTB ne pose pas le lose text (artefact « B TRAINER1 LOSE TEXT ») — le bouton « Combat rival » du panel le pose, lui.
- Avancer : `scope.press('a'/'b'/'down'...)` ; auto-A : setInterval 2500 ms avec stop-condition regex sur `__battleDisplayedText[0]`.
- K.O. forcé : `__battleState.gBattleMons[i].hp = 1` (+ `__gPlayerParty[slot].hp`).
- IA objets : sonder `__battleAi.gBattleHistory` (trainerItems/itemsNo) ; re-remplir `trainerItems[0]=19` pour re-tester. Wrap `__battleControllersIpc.BtlController_EmitTwoReturnValues` = voir les décisions IA.
- **Panel F2 → 🎬 Studio** : 🎥 Filmer (mosaïque horodatée secondes — LE juge visuel, `dev.gfx.filmClear()` avant tout screenshot montré au user !) · 📜 Log textes (hook AddTextPrinter, `__uiTextLog`) · ⚔ Transitions forcées (`__forcedBattleTransition`, les 42, mugshots inclus).
- Sondes : `dev.gfx.{oam,tile,palBank,lum,film}` · anim statut : `__battleGfxSfxUtil.InitAndLaunchChosenStatusAnimation(false, 0x10)` en combat = flammes brûlure à la demande · `dev.battle.state()` = gBattleMainFunc courant · `dev.audit.party()`.
- ⚠️ `isStatusAnimActive` prouve le SCRIPT actif, PAS le rendu — croiser avec un diff OAM avant/pendant.

## 5. PIPELINE BYTECODE (si regen nécessaire)
`node scripts/extract-decomp-asm.mjs && node scripts/compile-decomp-bytecode.mjs` puis NETTOYER les artefacts non trackés (seuls 6 fichiers battle_* + _stats + _symbols-table sont trackés). Vérifier `unresolvedSymbols: 0`. `DEBUG_WARN_FILE=battle_scripts_2` liste les unresolved. Toute constante migrée vers include/ RACINE doit être scrapée (déjà fixé).

## 6. ÉTAT COMBAT (2026-07-04) — ce qui est FAIT
Dresseurs A→Z sains (intro/switch-in ennemi/INTIMIDATION/argent exact/OW) · IA objets complète (« GUERISON est utilisé(e) par… ») · sprite fantôme soldé (reshow check HP==0) · annonce mon entrant · cris d'anims + flammes brûlure + bulles + gaz poison · lose text rival · shake healthbox · level-up box refresh · transitions : 7 portées (SLICE/WHITE_BARS/POKEBALLS_TRAIL(balls ROUGES)/ANGLED_WIPES/BLUR/SWIRL/SHUFFLE), le dispatcher log en console la transition demandée non portée (fallback SLICE).

## 7. RESTE (ordre user, mandat final — cocher dans chantier-combat-100pct.md)

> **MAJ run autonome Opus 4.8 (2026-07-04) — vérifié EN JEU (sondes/film), plusieurs « restes » ci-dessous sont PÉRIMÉS :**
> - ✅ **CS/moves OW SAINS** : VOL affine réparé (`f9aa988c`). FLDEFF_FIELD_MOVE_SHOW_MON marche (fond noir+rayures défilantes = **design 1:1**, PAS un bug — assets préchargés au boot via `harness/scenes/TestOverworldScene.ts`, cf. [[showmon-banner-is-1to1]]). Les CS (Surf/Cut/Fly/...) montrent le mon+cri (Surf vérifié : ARCKO glisse + surf blob).
> - ✅ **Combat sauvage A→Z SAIN** : menu→attaque(ÉCRAS'FACE)→dégâts→K.O.→EXP→retour OW, vérifié.
> - ✅ **Mail écriture PORTÉ** (point 7) : Easy Chat fonctionnel — écran principal + sélecteur de groupes de mots (`CB2_EasyChatScreen`, ouvre via `__byteVm.openEasyChat`).
> - ✅ **Anims combat** (point 8) : oracle `audit-anim-callbacks` = FAUX POSITIFS (SwapMonSprite/healthbox-flash/Substitute portés+enregistrés). Vrais trous marginaux seulement : AnimBounceBallLand (Rebond), SpriteCB_PokeBlock_Throw (concours).
> - 🔴 **VRAI RESTE #1 = POKÉNAV** (point 5) : squelette CONFIRMÉ — le menu s'affiche (CARTE DE HOENN/CONDITION/MATCH CALL/RUBANS/ÉTEINDRE) mais fond NOIR (pas de décor bg) + options NON câblées (press A = no-op). LE prochain gros chantier.

5. **Pokénav UI squelette** (pokenav.c : CB2_InitPokenav/menu handler — structure seule, contenu après).
6. **CS/moves OW** (AUDIT FAIT 2026-07-04) : `FldEff_FieldMoveShowMon` PORTÉ+câblé (field_effect.ts:271) — le mugshot manque À L'USAGE → vérifier que les chaînes de CS (Coupe/Surf/Flash) déclenchent FLDEFF_FIELD_MOVE_SHOW_MON. **VOL : Task_UseFly / FieldCallback_UseFly / Task_FlyIntoMap / FldEff_NPCFlyOut = ✗** (aucune anim d'envol/atterrissage). field_effect.c = 149 ✗ au callgraph (l'interpréteur FieldEffectScript_* est inliné chez nous = faux positifs, trier).
7. **SAC/OBJETS** (AUDIT FAIT) : item_use.c ✗ apparents (DisplayCannotUseItemMessage/DadsAdvice/Bike CB) = vérifier les foyers réels AVANT de porter (le vélo marche). Restes RÉELS (topic chantier-sac-objets-complet) : mail ÉCRITURE (DoEasyChatScreen), PokéblockCase, Berry plant/Wailmer, ÉTIQUETTES/DESCRIPTIONS BAIES, message item-combat joueur.
8. **Anims pas 1:1** (KILL-LIST PRODUITE) : grep `net-effect|dette douce|timing fixe` → 19 fichiers. TOP : battle_anim_effects_3 (9 aveux), _normal (8), _water (7), _sound_tasks (7 — cris à timing fixe vs IsCryFinished, pan stéréo ignoré PARTOUT), _psychic (5), _utility_funcs (4), _throw, _mons, _fire… Méthode : lire chaque aveu → comparer au C → filmer (🎥 Studio) avant/après.
Transitions restantes : WAVE, GRID_SQUARES, CLOCKWISE_WIPE, RIPPLE, BIG_POKEBALL (gym), AQUA/MAGMA, mugshots ligue, légendaires — pattern scanline commun établi (voir SWIRL/SHUFFLE en fin de battle_transition.ts, ~70 lignes chacune).
Dresseurs : ShouldSwitch tactique · aggro réelle Route 110 bout-en-bout · musiques par classe (encounterMusic string→id) · doubles · EXP split multi-mons.
