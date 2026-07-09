# Vérificateur graphique 1:1 — oracle interne déterministe

But : **vérifier que le rendu de l'engine est 1:1 avec la décomp SANS œil humain**, parce que
l'auteur ne peut ni faire d'A/B visuel fiable ni juger une frame sur fichiers seuls.

## Le principe : le visuel GBA = un système fermé de primitives numérotées

La GBA ne sait dessiner que via un petit ensemble FINI de primitives, chacune un nombre avec un
id et une **source de vérité dans la décomp** :

| Primitive | Ce que c'est | Source décomp |
|---|---|---|
| Palette | 256 BG + 256 OBJ, RGB15, banques de 16 | `palettes/NN.pal` (JASC) |
| Tile | 8×8, 4bpp (32o) / 8bpp (64o) = index palette | `tiles.png` (indexé) |
| Métatile | 8 tiles (2×2 ×2 couches) + flip + banque | `metatiles.bin` (u16) |
| Attribut métatile | couche NORMAL/COVERED/SPLIT, behavior | `metatile_attributes.bin` |
| Tilemap | grille d'entrées u16 (tileId+flip+banque) | map data / draw runtime |
| Fenêtre / boîte | `WindowTemplate` {bg,x,y,w,h,palNum,baseBlock} | gfx cadre + géométrie |
| Texte / font | glyphes indexés + triplet couleur | font gfx + string |
| Sprite / OAM | 128 entrées {x,y,tile,banque,shape,size,prio,affine} | sprite sheet + `.pal` |

Aucun pixel à l'écran qui ne soit le résultat déterministe de ces lookups. « Imaginer la frame en
lisant la décomp » = exécuter ces lookups. C'est ça qu'on automatise.

## Architecture — NON-CIRCULAIRE

```
  ENGINE (navigateur)                       NODE (accès disque décomp)
  dump de l'état hardware live    ───────▶  comparateur vs SOURCE décomp
  (gPlttBufferUnfaded, VRAM,                (D:/Projet 1/decomps/pokeemeraude)
   metatiles, OAM, regs…)                   → rapport slot/tile/octet
```

- **Référence = la décomp** (`.pal`, `.png`, `.bin`), PAS les assets importés de l'engine
  → non-circulaire (≠ ancien `uicheck` qui comparait l'engine à lui-même).
- **Sujet = l'état hardware live** (ce que le GPU a réellement reçu) → teste la logique de
  chargement runtime, pas juste l'import statique.

### Transport anti-corruption (piège payé)
Recopier un gros dump (VRAM 32 Ko) à la main via la sortie LLM corrompt ~3 tiles/467
(coquilles hex). Deux parades :
1. **Hash FNV-1a** : l'engine hashe le blob et ne transporte que le hash (incorruptible). On
   recompute le hash de la source décomp et on compare. Hash identique = 1:1. (métatiles)
2. **Dump sparse + skip** : tiles non-vides en hex, et toute tile ≠ 64 hex est marquée
   « skip transport » (exclue du verdict, pas comptée comme bug). (tiles)

## Vérificateurs livrés (phase 1 — rendu statique de fond)

| Script | Vérifie | Transport |
|---|---|---|
| `scripts/gfx-verify-palette.cjs` | palette BG vs `.pal` (modélise `LoadTilesetPalette`) | dump direct |
| `scripts/gfx-verify-tiles.cjs` | tiles VRAM vs `tiles.png` (décodeur PNG indexé maison) | sparse hex |
| `scripts/gfx-verify-metatiles.cjs` | métatiles + attributs vs `.bin` | hash FNV-1a |

Dump live via `preview_eval` (voir snippets dans l'historique) → écrit dans `audit-reports/gfx/`.

### Vérités décomp encodées (à ne pas redécouvrir)
- `LoadTilesetPalette` (fieldmap.c:875) : primaire → slot 0 forcé `RGB_BLACK`, puis couleurs du
  `.pal` **à partir de l'index 1** (couleur 0 jetée), bloc contigu 6 banques ;
  secondaire → chargement direct depuis banque `NUM_PALS_IN_PRIMARY` (6) → slots 96..207.
  `ApplyGlobalTintToPaletteEntries` = **stub vide** (aucune teinte).
- `NUM_PALS_IN_PRIMARY=6`, `NUM_PALS_TOTAL=13`, `NUM_TILES_IN_PRIMARY=512`, `NUM_TILES_TOTAL=1024`.
- Banques BG 14/15 = fenêtre texte/UI (`DLG_WINDOW_PALETTE_NUM=15`, `STD_WINDOW_PALETTE_NUM=14`),
  PAS le tileset. Banque 12 = dernière banque tileset.
- Tiles animées : `tileset_anims.c`. Ex. `building` TV → tiles 496..499
  (`AppendTilesetAnimToBuffer(..., TILE_OFFSET_4BPP(496), 4*TILE_SIZE_4BPP)`). En VRAM = frame
  courante ≠ frame statique du `tiles.png` → écart ATTENDU, pas un bug.
- Tile 8bpp PNG (secondaire) → valeur 4bpp VRAM = `index & 0x0F` (la banque est dans l'attribut).

## Résultats — MAP_MOSSDEEP_CITY_MART (overworld derrière le shop)

- Palette : **208/208** slots 1:1 au bit près.
- Tiles : **1019/1023** bit-exact ; les 4 restantes = anim TV live (prouvée par tileset_anims.c).
- Métatiles + attributs : **4/4** hash FNV identiques.

→ Tous les ingrédients de fond de cet écran sont prouvés 1:1, déterministe, zéro coup d'œil.

## Roadmap — phase 2 (dynamique / composition) = cible des bugs réels

Les bugs vécus (₽ manquant, prix sur fond blanc, PNJ disparus du buy-menu) sont dans la
COMPOSITION et les SPRITES, pas les ingrédients statiques. Restent à porter :

1. **Tilemap / composition** : quelle métatile à quelle cellule (le fond assemblé).
2. **OAM / sprites** : chaque object-event a-t-il un sprite visible à la bonne position ?
   (`gObjectEvents` pas exposé sur window/`dev._rt` → trouver l'accès) → attrape « PNJ disparus ».
3. **Fenêtres / texte** : cadre vs gfx décomp + glyphes vs font → attrape « ₽ » et « fond blanc ».
4. **Call-graph completeness** : « le dessin a-t-il seulement été appelé ? »
   (`scripts/shop-callgraph-completeness.cjs` a déjà trouvé `BuyMenuDrawObjectEvents` non porté).

Cible : ouvrir le **buy-menu** réel et faire tourner OAM + fenêtres + call-graph dessus.
