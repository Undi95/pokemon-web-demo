# pokemon-web-demo

Démo expérimentale d'un jeu Pokémon **web natif** qui consomme les
décompilations FR (`pokeemeraude`, `pokerougefeu`) comme source d'assets et
[`@pkmn/sim`](https://github.com/pkmn/ps) comme moteur de combat.

État actuel et roadmap : voir [`DEV_LOG.md`](./DEV_LOG.md).

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173/ — Vite a du HMR, les modifs de fichiers
sont rechargées à chaud.

## Régénérer les assets depuis les décomps

Pré-requis : avoir cloné `pokeemeraude` à côté du projet.
```bash
mkdir -p ../decomps && git clone --depth 1 https://github.com/qigast/pokeemeraude.git ../decomps/pokeemeraude
```

Puis dans l'ordre :
```bash
npm run extract:em                              # maps, sprites, tilesets, musique, ui
node scripts/extract-object-events.mjs          # mapping graphics_id → PNG
node scripts/extract-scripts.mjs                # scripts.inc + textes par map
node scripts/render-metatile-atlas.mjs --all    # atlases lower/upper par paire
```

Sortie : `public/decomp/em/`. Pour Kanto plus tard, idem avec `fr` et `pokerougefeu`.

## Stack

- Vite + TypeScript + Phaser 3
- `@pkmn/sim` + `@pkmn/dex` (combat Showdown, Gen 3 par défaut)
- `pngjs` (build-time) pour décoder les PNG indexés des tilesets

## Structure

```
src/
  scenes/         OverworldScene, BattleScene, MenuOverlayScene
  engine/         tilemap-loader, character-anims, npc-loader,
                  script-runner, dialogue-box
  data/           map-names-fr, trainers
  util/           sprite-transparency
scripts/          extracteurs Node ESM (.mjs)
public/decomp/em/ assets extraits (régénérables)
```
