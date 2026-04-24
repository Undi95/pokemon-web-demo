# Pokemon Web Demo — Dev Log

Projet exploratoire : utiliser les décomps GBA (`pokeemeraude`, `pokerougefeu`)
comme source d'assets et de données, + `@pkmn/sim` comme moteur de combat,
pour construire un jeu Pokémon web natif (pas une émulation GBA).

## État actuel

**Version : v0.1 — extraction + démo placeholder fonctionnels**

Stack : Vite + TypeScript + Phaser 3 + @pkmn/sim + @pkmn/dex

---

## Ce qui existe

### Extracteur de décomp (`scripts/extract-decomp.mjs`)

Script Node (pur ESM) qui lit un repo pokeemerald-decomp cloné en local et
recopie les assets consommables dans `public/decomp/<prefix>/`. Les fichiers
sont ensuite servis comme assets statiques par Vite.

**Utilisation :**
```bash
npm run extract:em      # pokeemeraude (Hoenn, FR) → public/decomp/em/
npm run extract:fr      # pokerougefeu (Kanto, FR) → public/decomp/fr/  (pas encore cloné)
```

**Premier run sur pokeemeraude :**
- 518 maps (map.json avec events, NPCs, warps, signs, triggers)
- 441 layouts (map.bin + border.bin = données binaires de tuiles)
- 3 tilesets primaires + 67 secondaires (tiles.png + metatiles.bin + palettes)
- 388 sprites Pokémon (front, back, shiny, icon, footprint, palettes)
- 92 sprites NPC overworld
- 93 sprites dresseurs (front) + 8 back pics
- ~14 MB total

### Moteur overworld (`src/scenes/OverworldScene.ts`)

- Map tuiles 20×15, rendu Phaser avec `Rectangle` colorés (placeholder,
  pas encore les vrais tilesets Emerald — ça vient ensuite)
- Joueur : sprite `brendan/walking.png` extrait (16×32, 2 tiles de haut)
- NPC : sprite `boy_1.png` extrait
- Déplacement grille avec ZQSD / flèches
- Changement de direction + flip horizontal pour "droite"
- Collisions depuis le JSON de map
- **W** pour interagir avec un NPC devant soi → dialogue → combat
- **B** pour ouvrir l'overlay menu

### Moteur de combat (`src/battle/runner.ts`)

Wrapper autour de `@pkmn/sim` en mode streaming. Packe les équipes au format
Showdown, lance un combat Gen 3 custom, parse le protocole Showdown ligne par
ligne et émet des événements (`move`, `damage`, `faint`, `win`, etc.).

Deux IA random pour le démo. À remplacer plus tard par :
- Input joueur pour p1
- IA dresseur scripté (ou l'AI script d'Emerald qu'on aura extrait)

### Battle scene (`src/scenes/BattleScene.ts`)

- Reçoit le trainer depuis l'overworld
- Affiche sprite front du Pokémon ennemi (depuis `/decomp/em/pokemon/<species>/front.png`)
- Affiche sprite back du Pokémon joueur
- Log textuel des coups traduits en FR depuis le protocole Showdown
- ESC/ESPACE pour revenir

### Menu overlay (`src/scenes/MenuOverlayScene.ts`)

Mockup du menu Start style Gen 3 (POKéDEX, POKéMON, SAC, etc.). Non fonctionnel,
juste visuel.

### Éditeur de map (`editor.html` + `src/editor/editor.ts`)

Page séparée accessible depuis le lien en haut du jeu.
- Palette de 4 tuiles (pour le format placeholder actuel)
- Clic = peindre, clic droit = effacer
- Mode collision séparé (toggle sur clic)
- Export JSON / Download .json / Load route1.json / Clear

À étendre : pouvoir charger une vraie layout Emerald (map.bin + metatiles +
tileset PNG) et éditer en vrais metatiles Gen 3.

---

## Ce qu'il reste à faire (roadmap)

### Phase 2 — Import Hoenn vrai

- [ ] **Loader de metatiles** : lit `map.bin` + `metatiles.bin` + `tiles.png`
      + palettes `.pal` → produit une texture rendue pour une map donnée
- [ ] Charger Littleroot Town (layout `LAYOUT_LITTLEROOT_TOWN`) et marcher
      dessus avec le vrai rendu Emerald
- [ ] Parser `.pal` JASC-PAL → appliquer les palettes correctement aux tuiles
      (les tuiles 4bpp utilisent une palette 16 couleurs indexée)
- [ ] Extraire et afficher les warps (portes) pour passer d'une map à l'autre
- [ ] Afficher les NPCs depuis `map.json.object_events` avec leur vrai
      `graphics_id`

### Phase 3 — Scripts NPC minimaux

- [ ] Parser `data/maps/<Name>/scripts.inc` → IR JSON
- [ ] Parser les chaines `.string`/text files → table de dialogues
- [ ] Implémenter un interprète des 20-30 commandes de script les plus
      utilisées (msgbox, applymovement, trainerbattle, giveitem, setflag, etc.)
- [ ] Système de flags unifié (FR + Em namespacés)

### Phase 4 — Intégration FR (Kanto)

- [ ] Cloner `pokerougefeu`
- [ ] `npm run extract:fr` → `public/decomp/fr/`
- [ ] Harmoniser tile IDs (namespace `fr_*` pour tilesets FR)
- [ ] Créer un portail créatif entre Hoenn et Kanto (bateau, train, portail
      magique — reste à imaginer)
- [ ] Vérifier que les scripts FR passent dans notre interprète

### Phase 5 — Le vrai jeu

- [ ] Vraie boucle : écran titre → start → Littleroot → Prof Birch → premier
      Pokémon → premier combat
- [ ] Sauvegarde localStorage
- [ ] Sacs, Pokédex réels
- [ ] Grand écran + règles de scaling (menu scaled x3, map x2, ou un truc
      comme ça)

---

## Décisions techniques

- **Pas de fork des décomps** : on les utilise en lecture seule comme source de
  données, pas comme code à modifier. Ça nous affranchit de toute la
  complexité du moteur C décompilé.
- **@pkmn/sim > réimplementer le moteur de combat Em** : le moteur de combat
  Gen 3 est 10 000+ lignes avec plein d'edge cases. Showdown le fait déjà
  parfaitement, c'est open source et packagé pour le navigateur.
- **Assets en `public/decomp/<prefix>/`** : servis statiquement par Vite,
  fetch au runtime. Pas dans `src/` pour éviter de les envoyer dans le
  dependency graph de Vite (trop de fichiers).
- **FR d'abord (Emerald)** plutôt que Kanto : Em a les 386 Pokémon Gen 1-3,
  la Battle Frontier, les doubles, les talents → couvre les features dès la
  région 1. Kanto ajoutera juste du contenu.

---

## Historique des itérations

### 2026-04-24 — session de démarrage

- Scaffolding Vite + TS + Phaser + configs
- Scène overworld avec map placeholder + joueur + 1 NPC, interaction W, menu B
- Wrapper @pkmn/sim en mode streaming
- Extracteur de décomp Node ESM
- **Extraction pokeemeraude réussie : 518 maps, 441 layouts, 388 Pokémon,
  92 NPCs, ~14 MB**
- Sprites overworld réels (brendan, boy_1) branchés dans l'overworld
- Sprites Pokémon réels (front/back) branchés dans la battle scene
- Éditeur de map placeholder fonctionnel (palette + peinture + export JSON)
- **Fix transparence** : les PNG indexés du décomp n'ont pas de canal alpha marqué,
  la palette color 0 est "transparente" par convention. Util
  `src/util/sprite-transparency.ts` qui remappe au runtime : lit pixel (0,0),
  met tous les pixels de cette couleur à alpha=0, rebuild une canvas-texture
  Phaser. Appliqué aux NPCs overworld et aux sprites Pokémon battle.

## Insight du jour

Puisqu'on utilise Showdown comme moteur, **changer de gen = une ligne de code**
(`formatid: 'gen3customgame'` → `'gen9customgame'`). On peut facilement
proposer "mode rétro Gen 3" ou "mode moderne Gen 9" comme réglage. Chaque
combat peut même avoir sa propre gen. Les Pokémon sont stockés une fois, leurs
règles dépendent du format choisi.

## Session 2 — Musique + Renderer metatiles

### Extraction étendue

- **530 MIDI** copiés dans `public/decomp/em/music/` (MUS_LITTLEROOT.mid,
  MUS_ROUTE101.mid, toutes les musiques de Hoenn + Battle Frontier + combats)
- **105 WAV** de samples/SFX dans `public/decomp/em/sfx/`
- **388 cries Pokémon** dans `public/decomp/em/cries/`

### Renderer de metatiles (`scripts/render-layouts.mjs`)

Pipeline de rendu depuis les données brutes du décomp :
1. Lit `tiles.png` (PNG indexé) du tileset primary + secondary
2. Reverse-lookup des pixels RGBA → indices bruts via la palette du PNG
3. Parse `metatiles.bin` (8 tile refs de 16 bits par metatile)
4. Parse les `.pal` JASC-PAL pour les vraies couleurs
5. Parse `map.bin` (2 octets par tile : metatile ID + collision/élévation)
6. Compose le tout en PNG RGBA + JSON de collisions

**Subtilités galères trouvées en route :**
- PNG primary `general` est en **8bpp** (256 couleurs), encode directement
  `palSlot * 16 + colorIdx` dans chaque pixel.
  Secondary `petalburg` est en **4bpp** (16 couleurs), laisse le metatile
  décider du palSlot.
- `NUM_PALS_IN_PRIMARY = 6` dans `include/fieldmap.h` → palettes 0-5 viennent
  du primary, **6-12 viennent du secondary** (pas 7-12). Premier essai avec
  le mauvais split : fenêtres des maisons en noir.
- Upper layer : color 0 = transparent (pour qu'on voie la lower layer).

**Résultat : 441 layouts rendered, 0 failed, ~65 MB total.**

### OverworldScene branchée sur le vrai rendu

- Charge `/decomp/em/rendered/LittlerootTown.png` comme background
- Charge `/decomp/em/rendered/meta/LittlerootTown.json` pour les collisions
- Caméra qui suit le joueur (map 320×320 > viewport 320×240)
- Label de map en HUD, fixé à l'écran
- NPC démo placé à (8, 12), interaction W → combat via Showdown

### Ce qui reste pour la v0.2

- [ ] Parser `map.json` du décomp → spawner les vrais NPCs (Brendan, May,
  Professeur Seko/Birch, etc.) avec leur graphics_id réel
- [ ] Lecteur MIDI navigateur (Tone.js + soundfont, ou lib plus légère)
- [ ] Warp events : porter d'une map à l'autre (Littleroot ↔ labo intérieur
      ↔ Route 101)
- [ ] Script runner minimal : au moins `msgbox` et `trainerbattle`

## Architecture : Kanto-as-addon sur le moteur Emerald

**Décision (session 5, affinée) :**

Direction d'ensemble : **Kanto tourne sur le moteur Hoenn**, UI/menu/textbox/font
 d'Emeraude garde la main partout. Mais pour l'extraction : on prend **TOUT des deux décomps** (full `em/` + full `rf/` en parallèle), on décide sur le tas au runtime lesquelles sources on consomme pour chaque feature.

Concrètement :
- **Extracteur em** (déjà fait) : tout pokeemeraude dans `public/decomp/em/`.
- **Extracteur rf** (à écrire) : tout pokerougefeu dans `public/decomp/fr/`, même pipeline, même structure, rien de coupé à l'extraction.
- **Au runtime** : par défaut on consomme `em/` pour UI/menus/battle-UI/fonts ; on consomme `fr/` pour le contenu Kanto (maps, scripts, trainers Kanto, tilesets Kanto). Les choix se font scène par scène, asset par asset — pas de règle figée à l'extraction.

**Why :** plus flexible pour des mélanges imprévus (ex : tileset d'intérieur Kanto qu'on voudrait utiliser à Hoenn, ou sprite dresseur d'Emerald réutilisé à Kanto). Coûte juste ~80-100 MB de disque en plus, c'est rien.

**How to apply :** quand on attaquera Kanto, réutiliser `scripts/extract-decomp.mjs` avec les arguments `pokerougefeu` / `fr` (il est déjà paramétré pour ça, voir `npm run extract:fr`). Puis `render-metatile-atlas.mjs` et `render-layouts.mjs` avec les paires Kanto.

## Session 5 — NPCs réels, dialogues, textbox authentique

- Extracteur `extract-object-events.mjs` : parse les 4 headers C du décomp
  pour mapper `graphics_id` → PNG + dimensions (168/239 résolus).
- NPC loader runtime : parse `map.json.object_events`, résout sprite, spawn.
  **Flags FLAG_HIDE_* : unset par défaut = NPC visible** (l'inverse de ce que
  j'avais fait d'abord).
- Signs depuis `bg_events[type=sign]` : cliquables au W, même traitement que
  les NPCs.
- Extracteur `extract-scripts.mjs` : parse tous les `scripts.inc` du décomp,
  sort 468 maps × ~15 scripts moyens + ~11 texts chacun. Total 7042 scripts,
  5145 textes en JSON.
- Runner de scripts (`src/engine/script-runner.ts`) : implémente lock, release,
  faceplayer, msgbox, goto, call, goto_if_set/unset/eq/ne, call_if_*.
  Etat initial : tous les flags unset, toutes les vars = 0. Les branches
  conditionnelles sont résolues en conséquence (cohérent pour dialogues de
  début de jeu).
- Textbox authentique : `DialogueBox` utilise `text_window/1.png` en 9-slice.
  Multi-pages via `\p`, sauts de ligne via `\n`/`\l`.

**À reprendre la prochaine fois :**
- Petit souci signalé par user sur le dialogue (non précisé, à inspecter).
- Font Emerald authentique : PNG + charmap.json déjà extraits sous
  `public/decomp/em/ui/`, rendu char-par-char à écrire. Pour l'instant
  monospace CSS.
- Camions manquants à Littleroot : NPC `OBJ_EVENT_GFX_TRUCK` résolu dans
  extractor mais à vérifier qu'il passe bien. Event spécial lié au sexe
  du joueur, peut nécessiter de gérer un flag spécifique.
- Système de flags/vars runtime (pour progression au-delà du début de jeu).

## Session 4 — Fixes retours utilisateur

Retour direct sur la session 3 :
- "Tiles qui se superposent sur le joueur alors qu'ils ne le font pas dans
  le jeu d'origine" → parser `metatile_attributes.bin` pour respecter
  `METATILE_LAYER_TYPE_COVERED` (ponts/tunnels). Pour COVERED, les deux
  moitiés du metatile sont composées dans l'atlas LOWER (sous le joueur) et
  l'atlas UPPER est vide pour cette tile. Fix dans `render-metatile-atlas.mjs`.
- "La caméra doit rester centrée sur le joueur" → suppression du deadzone,
  `startFollow(player, true, 1, 1)` pour un verrou strict. Également : plus
  de `setBounds` sur la caméra pour voir la bordure hors-map.
- "Toutes les maps ont un tileset qui se répète out of bound" → lecture de
  `border.bin` (8 octets = 2×2 metatiles), composition d'un canvas 32×32
  depuis les atlases, utilisé comme texture d'un `Phaser.TileSprite`
  gigantesque à depth -1 qui couvre toute la zone visible hors-map.
- "Les animations de marche de Brice sont dans le mauvais ordre" → correction
  de la disposition des frames :
    - 0 : regarde en bas | 1 : regarde en haut | 2 : regarde à gauche (flip
      pour droite)
    - 3-4 : pas en bas #1 / #2 | 5-6 : pas en haut | 7-8 : pas à gauche
  Nouvelle logique : un appui = UN pas (pas#1 ou pas#2 alterné), puis retour
  auto à idle. Pas d'animation cyclique continue. `playSingleStep()` remplace
  `playWalk()` + `setIdleFrame()` séparés.

## Session 3 — Rendu live, Z-order, animations, français

### Pivot de rendu : metatile atlases au lieu de maps pré-rendues

La session 2 pré-rendait chaque map entière en PNG → marchait visuellement
mais **cassait tout ce qui est dynamique** (Z-order, animations de tiles,
portes). Pivot : on rend UN atlas de metatiles par paire de tilesets
(primary + secondary), et Phaser compose la map live à partir du `map.bin`.

`scripts/render-metatile-atlas.mjs` :
- Produit `metatiles-lower.png` (couche basse, opaque) et
  `metatiles-upper.png` (couche haute, color 0 = transparent) par paire.
- `info.json` à côté : dimensions de l'atlas, IDs primary/secondary.
- Lance `--all` → toutes les paires uniques + `layout-to-pair.json` index.

Runtime (`src/engine/tilemap-loader.ts`) :
- Lit `map.bin` binaire, décode chaque tile (metatile ID + collision).
- Construit deux `Phaser.Tilemaps.TilemapLayer` : lower à depth 0, upper à
  depth 20. Le joueur à depth 10 → **les toits, cimes d'arbres, surplombs
  cachent naturellement le sprite** quand on passe derrière.

### Animations de marche (`src/engine/character-anims.ts`)

Strips NPC pokeemerald = 144×32 = 9 frames de 16×32 :
- 0-2 : face bas (idle + 2 pas)
- 3-5 : face haut
- 6-8 : face côté (droite = flipX)

Anims Phaser `walk-down/walk-up/walk-side` avec cycle [step1, idle, step2, idle].
Déclenchées au `tryMove()`, stop + idle frame au onComplete du tween.

### Tout en français

- Noms de zones Hoenn : extraits depuis `region_map_sections.json` →
  `src/data/map-names-fr.ts`. Ex : Bourg-en-Vol, Clémenti-Ville, Poivressel.
- UI combat, dialogues, HUD : caractères français (é, à, ô).
- Label de zone en HUD utilise `getMapNameFr(MAPSEC_ID)`.

### Dette technique à ne pas oublier (levée session 3)

Le rendu pré-compilé des maps en PNG (session 2) était un shortcut qui casse
plusieurs features. On pivote vers du rendu live par metatile, MAIS certains
systèmes restent à faire plus tard :

- [ ] **Animations de map** : eau qui bouge, fleurs qui respirent, cascades,
  champs de contest, machines. Les données sont dans
  `data/tilesets/<kind>/<name>/anim/` (PNGs de frames). Chaque tileset a son
  propre cycle d'animation. À wirer avec Phaser's tile animations ou un
  custom ticker.
- [ ] **Portes animées** : 4 frames d'ouverture quand le joueur entre. Les
  sprites sont dans `graphics/maps/doors/` ou dans les tilesets selon le cas.
- [ ] **Transition de warp** : fade noir + téléport + fade, plutôt que snap
  instantané entre deux maps.
- [ ] **Réflexions/ombres** sur l'eau et les surfaces brillantes (sprite
  flippé verticalement sous le joueur).
- [ ] **Lumière/ambiance** : certaines maps ont un overlay sombre (grottes).
  Flag `weather` du map.json à interpréter.
- [ ] **Sprites d'herbe qui frémissent** quand on marche dedans (tout le
  monde a vécu ça). Animation courte déclenchée à l'entrée sur une tile
  d'herbe haute.
