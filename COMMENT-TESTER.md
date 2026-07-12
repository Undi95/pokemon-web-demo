# Comment tester le jeu 🎮

Port 1:1 de **Pokémon Émeraude** en TypeScript / Vite. Voici comment le lancer en local.

## Prérequis
- [Node.js](https://nodejs.org) 18 ou plus
- [Git](https://git-scm.com)

## Installation & lancement
```bash
git clone https://github.com/Undi95/pokemon-web-demo.git
cd pokemon-web-demo
git checkout Opus-v2
npm install
npm run dev
```
Puis ouvre **http://localhost:5173** dans ton navigateur.

> ⏳ Le **premier chargement** peut prendre un moment (mode dev = beaucoup de modules chargés un par un). C'est normal, une fois lancé ça tourne bien.

## Contrôles
- **Flèches** : se déplacer / naviguer les menus
- **W** = A (valider) · **X** = B (retour)

## Tester un combat double directement (facultatif)
Pour ce raccourci il faut une équipe. Le plus simple : ouvre le jeu avec **`?debug`** dans l'URL — **http://localhost:5173/?debug** — ça charge une équipe de test toute prête (dont un **Léviator niv.100** qui connaît Surf). Ensuite ouvre la console du navigateur (`F12` → onglet **Console**) et colle :
```js
await __byteVm.load()
__byteVm.launchTB(51)   // combat double de démo (dresseurs Inès & Guy)
```
Joue le combat aux **flèches** + **W** (=A) / **X** (=B). Surf en double touche les deux adversaires **et** ton partenaire, c'est normal.

> Sans `?debug` (nouvelle partie classique), lance plutôt `launchTB(51)` **après** avoir obtenu au moins un Pokémon, sinon tu n'as pas d'équipe à envoyer.

## Notes
- Certaines commandes « dev » (audits, lecture du décomp source) ne fonctionnent pas sans le dossier `decomps/` — **sans aucune importance pour jouer**.
- C'est un projet en cours : quelques bugs graphiques de combat sont connus et en cours de correction.
