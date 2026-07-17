# Fix — hygiène du signal engine-sweep

Deux volets : (1) extraire les `.4bpp.bin` manquants pour éliminer les fallbacks
PNG de `loadTileBin`, (2) recalibrer `engine-sweep` pour que `warn ≠ error`.

## Volet 1 — extraction des `.4bpp.bin` manquants

### Pipeline réutilisé (aucune invention)

L'extracteur canonique est **`scripts/extract-png-indexed-tiles.mjs`** (invoqué par
`scripts/extract-all-tile-bins.mjs`). Il parse l'IDAT PNG directement (raw indices
palette, ordre PLTE préservé), gère colorType 3 (indexed) **et** colorType 0
(grayscale → inversion gbagfx `index = 15 - idx`), puis packe en tiles 8×8
row-major (4bpp = 32 o/tile, low nibble = pixel gauche).

Invocation identique à `extract-all-tile-bins.mjs` :
`node scripts/extract-png-indexed-tiles.mjs <src.png> <out.4bpp.bin> 4`

`loadTileBin(url, 4)` (png-loader.ts) cherche `url.replace('.png','.4bpp.bin')` ;
absent → `console.warn(...) + loadIndexedPngStrict` (fallback). Fournir le `.bin`
supprime le warn ET force le chemin 1:1 (indices raw, pas d'approximation canvas).

### Format source (les 9 PNG cibles)

Tous **colorType 3, bitDepth 4, PLTE 16 couleurs** (aucun grayscale → l'inversion
gbagfx ne s'applique pas ici). Dimensions multiples de 8. Donc format identique
aux `.bin` de référence existants.

### Preuve byte-exacte (AVANT génération)

Script scratch `prove-and-gen.cjs` : régénère 2 `.4bpp.bin` **existants** (mêmes
PNG source) et diffe octet-à-octet contre les fichiers commités.

| .bin de référence régénéré | taille | diff |
|---|---|---|
| `summary_screen/tiles.4bpp.bin` | 7680 o | **0 diff** |
| `summary_screen/move_select.4bpp.bin` | 1024 o | **0 diff** |

→ Pipeline prouvé byte-exact. Génération des manquants seulement après ce gate.

### `.4bpp.bin` produits (9 nouveaux)

| fichier | taille | format |
|---|---|---|
| `pokenav/match_call/nav_icon.4bpp.bin` | 4096 o | 4×32 tiles |
| `pokenav/match_call/options_cursor.4bpp.bin` | 64 o | 1×2 tiles |
| `pokenav/match_call/pokeball.4bpp.bin` | 64 o | 1×2 tiles |
| `pokenav/match_call/ui.4bpp.bin` | 512 o | 4×4 tiles |
| `pokenav/match_call/window.4bpp.bin` | 256 o | 8×1 tiles |
| `shop/menu.4bpp.bin` | 928 o | 29×1 tiles |
| `shop/money.4bpp.bin` | 256 o | 4×2 tiles |
| `summary_screen/a_button.4bpp.bin` | 128 o | 2×2 tiles |
| `summary_screen/b_button.4bpp.bin` | 128 o | 2×2 tiles |

Tailles = `tilesX·tilesY·32` attendues d'après l'IHDR de chaque PNG.

### Fichiers NON touchés (garde-fous)

- **Aucun PNG modifié**, **aucun `.bin` existant modifié**.
- `ui.bin` (match_call) et `menu.bin` (shop) sont des **tilemaps** (`loadTilemapBin`),
  PAS les graphismes — laissés intacts.
- L'extracteur émet aussi un `.gbapal` quand une PLTE existe. Pour respecter
  « seulement de NOUVEAUX `.4bpp.bin` », la génération sort dans le scratch puis
  **copie uniquement le `.bin`** vers le repo → les `.gbapal` restent dans le
  scratch (jamais écrits dans `public/decomp/em/...`). Les `.pal`/`.gbapal`
  pré-existants (`call_window.pal`, `pokeball.pal`, `move_select.gbapal`, …) sont
  intacts. Les palettes de ces écrans sont chargées séparément (`.pal` /
  `extractPngPlte`) — hors périmètre des warns visés.

## Volet 2 — recalibrage `harness/e2e/engine-sweep.ts`

Ancien comportement : `ok = !threw && S.curErrors.size === 0` où `curErrors`
mélangeait `console.error` ET `console.warn` (préfixé `[warn]`) → un simple warn
(ex. fallback PNG d'un asset non-critique) rendait l'écran KO en permanence.

Changements :

- Deux maps distinctes : `S.curErrors` (`console.error`) et `S.curWarns`
  (`console.warn`, clés toujours préfixées `[warn]`). Helper `recordErr` remplacé
  par `record(map, msg, captureStack)` ; `captureStack` réservé aux erreurs (la
  stack d'un warn n'est plus une « cause » de KO).
- `errors[]` (affichage) reste la **fusion** THROW + erreurs + warns `[warn]` —
  les warns restent COLLECTÉS, comme avant.
- **KO recalibré** : `ok = !threw && S.curErrors.size === 0`. Seuls
  `console.error`, throws et asserts échoués (qui throwent) font KO ; les
  `console.warn` ne font **plus** KO.
- Compteurs par écran ajoutés : `nErrors` (= `console.error` distincts + throw) et
  `nWarns` (= `console.warn` distincts). `console.table` affiche `errors`/`warns`
  séparément.
- Récap final : `{screens, ok, ko, totalErrors, totalWarns}` (nouveau
  `totalWarns`, sommes des `nErrors`/`nWarns`). Additif → aucun consommateur de
  `window.__engineSweepReport` cassé (seule réf externe = mention doc
  `CHANTIER-MOTEUR-100.md`).
- Doc d'en-tête + resets d'idempotence (boot + `runScreen`) mis à jour.

Validation : **`npx tsc --noEmit` = 0**.

## Portée

Fichiers modifiés : `harness/e2e/engine-sweep.ts` + 9 nouveaux `.4bpp.bin`.
Aucun serveur/navigateur, aucun git. Script de preuve en scratch.
