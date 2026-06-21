# Plan — Réplique 1:1 INTÉGRALE de l'arbre décomp (marathon)

> **Décision user 2026-06-21.** Objectif : que TOUT le port soit un miroir 1:1 strict et INTÉGRAL de
> `decomps/pokeemeraude`, fichier par fichier, fonction par fonction, import par import — arborescence
> comprise. Marathon assumé (« ultra long, je m'en fou »). Supersede `MIGRATION-GAME-1TO1.md` (migration
> game/ incrémentale) et lève le « plat verrouillé » sur l'axe structure (le src/ reste plat car décomp src/ plat).

## Décisions verrouillées
- **STRUCTURE = réplique 1:1 intégrale de l'arbre décomp.** On recrée l'arbre complet :
  `src/` (miroir PLAT des `.c`), `include/` (+ `constants/`, `gba/`), `data/` (tables/maps/scripts/.inc),
  `gfx/` (TOUS les assets), `sound/`. Le **harness pur maison** (scènes Phaser, devtools, émulation GBA,
  m4a synth, glu Vite) = **isolé dans un dossier clairement NON-décomp** (ex. `src/_harness/` ou `engine/`).
- **100 % SOLO** — zéro agent, même la passe de vérification. (Le « solo relaxé pour audit read-only » NE
  s'applique PAS à ce chantier.) Continuer d'ignorer « ultracode/Workflow ».
- **1:1 INTÉGRAL** : pas de port partiel laissé tel quel — chaque fichier décomp est complété à 100 % de
  ses fonctions, mêmes noms (fichier/fonction/global/constante), mêmes imports/inclusions, ligne-à-ligne.
- **Assets en masse** : importer TOUS les gfx/tilesets d'un coup (fini le goutte-à-goutte par feature).

## Contrat (inchangé, rappel)
Branche `mirroir`, **JAMAIS push**. **tsc=0 + A/B réel en jeu** avant chaque commit (jamais « zéro régression »
par raisonnement). 1 mécanisme/lot = 1 commit (msg FR heredoc Bash `<<'EOF'` + trailer
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`). Chemins absolus + `git -C`. Stage
EXPLICITE (jamais `git add -A`, jamais commit `audit-reports/1to1/COVERAGE-GLOBAL.md`). Audio : appeler
PlaySE/PlayCry/PlayBGM OK, NE PAS toucher le moteur SE/BGM. Décomp = `D:/Projet 1/decomps/pokeemeraude`.
User VISION RÉDUITE → sondes déterministes + décrire les visuels (et mode « stop avant commit + explique
quoi vérifier » pour le visuel). Zéro cast/approximation pour faire taire un type.

## Cible d'arborescence (à affiner au Phase 0)
```
src/
  src/            ← miroir PLAT des decomp/src/*.c → *.ts (même nom, mêmes fonctions)  [fusionne l'actuel game/]
  src/data/       ← decomp src/data/*.h (tables species/moves/items/trainers…) → data 1:1
  include/        ← decomp include/*.h → types/constantes 1:1
    constants/    ← include/constants/*.h
    gba/          ← include/gba/*.h
  data/           ← decomp data/ (maps/, scripts/, layouts/, tilesets/, *.inc, *.s)
  gfx/            ← decomp gfx/ (TOUS les png/tilesets, organisés comme la décomp)
  sound/          ← decomp sound/ (refs, pas le moteur)
  _harness/       ← MAISON, hors décomp : scenes Phaser, devtools, decomp-runtime/globals,
                    gba/ (émulation), m4a/ (synth), boot glu Vite. (= ex-engine/ non-mirroir)
```
> ⚠️ Beaucoup de l'actuel `src/engine/` est du HARNESS (→ `_harness/`) ; le reste (subsystems décomp-nommés
> éclatés dans engine/field, engine/script, engine/battle, engine/ui, engine/pokemon, engine/bag…) doit
> rejoindre `src/src/` (plat, nom décomp) ou `include/`/`data/` selon sa nature décomp.

## Phases (ordre recommandé — grind incrémental, commits vérifiés)
**Phase 0 — CARTOGRAPHIE complète (la « vérif tout fichier »).**
Énumérer TOUT l'arbre décomp (src/, include/, data/, gfx/, sound/, asm/). Pour chaque fichier décomp :
où vit-il chez nous (ou manquant) + % de complétude 1:1 + nature (logique/data/include/asset/harness).
Produire un CHECKLIST maître = le backlog du marathon. Réutiliser `scripts/audit-game-mirror.cjs` +
`npm run coverage:1to1` comme point de départ MAIS étendre à l'arbre entier (pas que les .c). Sortie :
`docs/FULL-1TO1-CHECKLIST.md` (vivant, coché au fur et à mesure).

**Phase 1 — RESTRUCTURE (arbre cible + rewire imports).**
Créer l'arbre cible. Déplacer les fichiers à leur place décomp, INCRÉMENTALEMENT par sous-système.
`git mv` + reroute imports (généraliser `scripts/migrate-game.cjs`) + tsc=0 + boot après chaque lot.
Isoler le harness dans `_harness/`. Ne JAMAIS casser le boot entre 2 commits.

**Phase 2 — IMPORT ASSETS en masse.**
Une extraction/import exhaustive de TOUS les gfx/tilesets décomp → `gfx/` (étendre les `extract:*`).
But : plus jamais d'import manuel par feature.

**Phase 3 — COMPLÉTION 1:1 fichier par fichier (le gros du marathon).**
Pour chaque entrée du checklist non-100% : compléter à 1:1 intégral (toutes les fonctions du .c,
mêmes noms/imports, ligne-à-ligne), tsc=0 + A/B réel, marquer `// #100%`, cocher le checklist, commit.
Prioriser le cœur jouable d'abord (overworld → combat → menus), différer les sous-systèmes hors-scope
SEULEMENT s'ils sont explicitement déférés (mais l'objectif est INTÉGRAL → à terme tout y passe).

## État au lancement
- HEAD `7a59a425` (branche mirroir, rien poussé). Couverture réelle ~37 % cœur cité 1:1 (cf. coverage).
- Outils : `audit-game-mirror.cjs`, `coverage:1to1`, `migrate-game.cjs` (non-trackés). `audit:scrcmd`/
  `audit:specials` réparés. Hook `__scriptRuntime.getOpcodeHandler`.
- ⚠️ BUG DÉFÉRÉ (diagnostiqué, non corrigé) : input pendant la marche (A → interaction acceptée à la frame
  de frontière alors que le sprite est visuellement mid-step = désync ~1 frame held-finish vs render M3 ;
  gate + tts confirmés 1:1). À reprendre après/pendant le restructure (le timing held-movement sera revu).

## Cadence
Marathon = grind par lots committés et vérifiés, JAMAIS un big-bang. Tenir le checklist à jour. Le boot
doit rester vert entre chaque commit. Avancer sous-système par sous-système jusqu'au 1:1 intégral.
