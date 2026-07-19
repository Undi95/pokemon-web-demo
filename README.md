# Pokémon Émeraude — port web 1:1

Port **miroir 1:1** de **Pokémon Émeraude** (Game Boy Advance) vers TypeScript / web.
Le code de gameplay est une **transcription ligne-à-ligne** de la décompilation
`pokeemerald` (projet [pret](https://github.com/pret/pokeemerald), branche française
[`pokeemeraude`](https://github.com/qigast/pokeemeraude)) : mêmes noms de fichiers,
de fonctions, de structures et de constantes, même ordre d'exécution.

Aucune ROM, aucun émulateur, aucun asset pré-rendu. Tout tourne sur un **moteur
maison** écrit à la main :

- **rendu type GBA** pixel-perfect (BG, OAM, palettes, fenêtres, blend, matrices affines) ;
- **byte-VM** qui exécute les scripts d'événements du jeu ;
- **moteur de son m4a** sample-exact (reproduction du driver audio de la GBA).

> C'est le jeu, pas une démo : l'objectif est le 1:1 complet, pas un MVP.

## État

La **partie solo complète est jouable** de bout en bout :

**nouvelle partie → 8 arènes → Ligue Pokémon → Panthéon → générique de fin.**

Sont portés et fonctionnels : combats (simples & doubles), Pokédex complet,
Match Call (Pokénav), stockage PC, sac & objets, CS de terrain (Coupe, Force, Surf,
Vol…), évolutions, centres Pokémon, boutiques.

> Projet en cours : quelques bugs graphiques de combat sont connus et en cours de
> correction. Le reste du chemin critique solo est complet.

## Lancer le jeu

```bash
npm install
npm run dev
```

Puis ouvre **http://localhost:5173** dans un navigateur.

> Le **premier chargement** peut être long (mode dev = beaucoup de modules chargés
> un par un). Ensuite, ça tourne normalement.

## Contrôles

| Touche | Bouton GBA |
| --- | --- |
| **Flèches** | Croix directionnelle |
| **W** | A (valider) |
| **X** | B (retour) |
| **N** | SELECT |
| **B** / **Entrée** / **Espace** | START |
| **Z** | R |
| **A** | L |

Remappables depuis le bouton **Remap** de la barre d'outils (persisté dans
`localStorage`).

### Session de test

Ouvre le jeu avec **`?debug`** — **http://localhost:5173/?debug** — pour charger une
équipe de test toute prête (dont un Léviator niv. 100 qui connaît Surf), pratique
pour tester un combat sans faire toute l'aventure. Détails dans
[`COMMENT-TESTER.md`](./COMMENT-TESTER.md).

## Architecture

- **`src/`** — miroir 1:1 des `.c` du décomp (un fichier TypeScript par fichier C :
  `battle_main.ts` ↔ `battle_main.c`, etc.).
- **`include/`** — miroir des en-têtes `.h` du décomp (types, prototypes, constantes).
- **`harness/`** — le **moteur / substrat web** (ce qui n'existe pas dans le décomp) :
  rendu GBA (`harness/gba`), audio m4a (`harness/m4a`), boucle de boot et runtime
  (`harness/runtime`, `harness/boot`), hôte de scènes (`harness/scenes`), devtools.
- **`public/decomp/`** — assets extraits du décomp (tilesets, sprites, palettes,
  cartes, données), régénérables.

## Régénérer les assets

Le jeu boote **sans** le décomp : les données extraites et le bytecode des scripts
sont versionnés. Pour tout régénérer, il faut une copie locale du décomp dans
`../decomps/pokeemeraude` :

```bash
npm run extract:em          # cartes, sprites, tilesets, données de base
npm run extract:all-bulk    # tous les extracteurs de données
```

Les extracteurs et générateurs se trouvent dans `scripts/` (voir les entrées
`extract:*` de `package.json`).

## Devtools

Une fois le jeu lancé, `window.dev` est exposé dans la console du navigateur
(contrôle de frame, savestates, pixel trace, dumps mémoire…). Tape `dev.help()`
pour la liste complète.

## Crédits

Développé en **pair-programming** par **[Undi95](https://github.com/Undi95)** et
**Claude** (modèles **Opus 4.8** & **Fable 5**, Anthropic).

Ce projet n'existe que grâce au travail des équipes de décompilation Pokémon.
**Tout le code de gameplay est transcrit** depuis leurs sources C — rien n'est
réinventé :

- **[pret/pokeemerald](https://github.com/pret/pokeemerald)** — décompilation de
  référence de Pokémon Emerald.
- **[pokeemeraude](https://github.com/qigast/pokeemeraude)** — branche française,
  source de vérité primaire de ce port (textes, données et IDs FR).

Merci à leurs contributeurs pour l'énorme travail de reverse engineering qui rend ce
port possible, ainsi qu'à la communauté de reverse engineering audio GBA dont les
données de samples ont servi de référence pour le moteur de son.

## Mentions légales

Projet **de fan, non commercial**, à but **éducatif et de préservation**.

**Pokémon** et **Pokémon Émeraude** sont des marques et des œuvres
© Nintendo / Creatures Inc. / GAME FREAK Inc. Ce projet **n'est ni affilié, ni
approuvé, ni sponsorisé** par ces sociétés.

Ce dépôt **ne contient et ne distribue aucune ROM** ni aucun binaire commercial du
jeu : uniquement du code original et des données dérivées de décompilations
open-source. Le code original de ce port est publié sous licence **MIT**.
