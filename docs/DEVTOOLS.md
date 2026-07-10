# Devtools v2 — registre unique, parité console / sidebar

> Mandat (2026-07-10) : « les MÊMES fonctions toi et moi — toi par commande,
> moi par l'UI. Un truc ergonomique qui me cache pas le jeu. »

## Utilisation

| Côté | Comment |
|---|---|
| **UI (sidebar)** | `F2` ou bouton flottant 🛠 en bas à droite. Onglets par catégorie, recherche en haut, résultats dans le drawer bas (copiables). |
| **Console** | `dev.cmds()` = liste complète · `dev.cmd('jeu.tp', {ville:'MAP_MAUVILLE_CITY'})` = exécution · `dev.help2('jeu.tp')` = fiche d'une commande. |

Les deux côtés passent par le **même** `runCommand()` — une commande ajoutée au
registre apparaît automatiquement des deux côtés. La liste à jour est TOUJOURS
`dev.cmds()` (pas ce fichier).

## La sidebar ne cache jamais le jeu

- Ouverte, elle **pousse** le layout (`padding-right` sur `<body>`) : le canvas
  se recentre dans l'espace restant.
- Si le zoom courant déborde de l'espace restant, **fit-to-space** : descente au
  plus grand zoom **entier** qui tient (pixel-perfect conservé, via
  `setGameZoom`), zoom d'origine **restauré** à la fermeture. Si tu changes le
  zoom topbar pendant que c'est ouvert, ton choix gagne (pas de restauration).
- Onglet actif et état ouvert/fermé persistés (`localStorage`).

## Architecture (harness/devtools/)

| Fichier | Rôle |
|---|---|
| `registry.ts` | Types + store : `registerCommand(s)` / `registerView` / `runCommand` + frontend console (`dev.cmd/cmds/help2`). |
| `panel-v2.ts` | Sidebar DOM pure (hors canvas Phaser) générée du registre : onglets, formulaires auto (args typés), grilles (`ui:'grid'`), vues live (`mount`/`update` ~7 Hz, zéro travail fermée), drawer, lightbox 📷 zoom pixel, fit-to-space. |
| `registrations.ts` | Mapping de TOUT l'outillage existant au registre — **délègue** aux implémentations historiques (`scope.*`, `__byteVm.*`, `cheat.*`, `dev.gfx.*`, `__devGotoMap`, `window.rng`…), qui restent les alias console. |

Archivés (plus importés, conservés en référence) : `devtools-panel.ts` (panel v1
overlay) et `harness/util/audio-devtool.ts` (panneau bas, absorbé dans l'onglet
Audio).

## Ajouter une commande (3 lignes)

```ts
// dans registrations.ts (ou n'importe quel module chargé au boot)
registerCommand({
  id: 'jeu.maCommande', category: 'jeu', label: '✨ Ma commande',
  description: 'Ce que fait la commande — visible en tooltip et dans dev.help2',
  args: [{ name: 'n', kind: 'number', default: 1 }],
  run: ({ n }) => `résultat ${n}`,   // retour → drawer UI / console
});
```

- `kind` : `number` · `string` · `boolean` · `select` (avec `options`).
- `ui: 'grid'` : commande à 1 arg `select` rendue en grille de boutons
  (ex. téléport, easy chat).
- `danger: true` : confirmation avant exécution. `hidden: true` : console only.
- Vue live : `registerView({ id, category, label, mount(el), update?(el) })` —
  `update` n'est appelé que si la sidebar est ouverte, l'onglet actif et la
  section dépliée.

## Catégories

`jeu` 🗺 (TP, goto, noclip, rencontres event) · `joueur` 🎮 (cheats) ·
`combat` ⚔ (wild/dresseur/scénarios/anim/transitions + état live) ·
`scripts` 📜 (byte-VM : launchScript/special/setVar/easy chat/démos + log
textes) · `gfx` 🎨 (palettes/OAM/BG live + film/tile/lum/findColor) ·
`audio` 🎵 (pickers BGM/SE, volume master sync topbar, monitor) ·
`save` 💾 (état/export/import/clear `em_flash_v3`) · `sys` ⚙ (RNG, seed,
seek, savestate, tasks, info).

Le header (toujours visible) porte : stats live (frame/tasks/sprites/fps),
pause/step ×1 ×8, vitesses ¼–4×, 🎬 film 2 s, 📷 snapshot → lightbox à zoom
pixel (comparaison œil/décomp, cf. règle « code attendu vs écran »).
