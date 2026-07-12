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
Ouvre la console du navigateur (`F12` → onglet **Console**) et colle :
```js
await __byteVm.load()
__byteVm.launchTB(51)   // combat double de démo (dresseurs Inès & Guy)
```

## Notes
- Certaines commandes « dev » (audits, lecture du décomp source) ne fonctionnent pas sans le dossier `decomps/` — **sans aucune importance pour jouer**.
- C'est un projet en cours : quelques bugs graphiques de combat sont connus et en cours de correction.
