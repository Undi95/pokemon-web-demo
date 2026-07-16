# Assets — écran CREDITS (générique de fin)

Source décomp → chemin runtime attendu (`public/decomp/em/…`) → clé `assetCache`.
Préchargés par `preloadCreditsAssets()` (`harness/boot/intro-asset-loader.ts`), à appeler
**AVANT** `CB2_StartCreditsSequence` (les `LZ77UnCompVram`/`LoadPalette` sont SYNCHRONES).

## Bilan : AUCUN binaire manquant
Tous les fichiers requis existent déjà dans `public/decomp/em/`. Rien à (re)générer.
Les seuls « trous » sont des **pré-extractions `.4bpp.bin` absentes** pour 3 PNG (fallback
canvas PNG actif dans `loadTileBin` → fonctionne, indices palette potentiellement approximés).

## Scènes vélo (`intro_credits_graphics.c` `LoadCreditsSceneGraphics`)
| clé assetCache | source décomp | fichier runtime | présent |
|---|---|---|---|
| `sGrass_Gfx` / `_Pal` | graphics/intro/scene_2/grass.png (.4bpp.lz / .gbapal) | intro/scene_2/grass.4bpp.bin + .gbapal | ✅ |
| `sGrass_Tilemap` | grass_map.bin (.lz) | intro/scene_2/grass_map.bin | ✅ |
| `sGrassSunset_Pal` | grass_sunset.pal | intro/scene_2/grass_sunset.pal | ✅ |
| `sGrassNight_Pal` | grass_night.pal | intro/scene_2/grass_night.pal | ✅ |
| `sCloudsBg_Gfx` / `_Pal` | clouds_bg.png / clouds_bg.pal | intro/scene_2/clouds_bg.4bpp.bin + .pal | ✅ |
| `sCloudsBg_Tilemap` | clouds_bg_map.bin | intro/scene_2/clouds_bg_map.bin | ✅ |
| `sCloudsBgSunset_Pal` | clouds_bg_sunset.pal | intro/scene_2/clouds_bg_sunset.pal | ✅ |
| `sClouds_Gfx` / `sClouds_Pal` | clouds.png / clouds.png(.gbapal) | intro/scene_2/clouds.4bpp.bin + .gbapal | ✅ |
| `sCloudsSunset_Pal` | clouds_sunset.pal | intro/scene_2/clouds_sunset.pal | ✅ |
| `sTrees_Gfx` / `_Tilemap` | trees.png / trees_map.bin | intro/scene_2/trees.4bpp.bin + trees_map.bin | ✅ |
| `sTreesSunset_Pal` | trees_sunset.pal | intro/scene_2/trees_sunset.pal | ✅ |
| `sTreesSmall_Gfx` / `_Pal` | trees_small.png | intro/scene_2/trees_small.4bpp.bin + .gbapal | ✅ |
| `sHouses_Gfx` / `_Pal` / `_Tilemap` | houses.png / houses.pal / houses_map.bin | intro/scene_2/houses.* | ✅ |
| `sHouseSilhouette_Gfx` / `_Pal` | house_silhouette.png | intro/scene_2/house_silhouette.* | ✅ |

## Sprites vélo credits (Brendan/May grande feuille + rival + vélo/latios/latias)
| clé | source décomp | fichier runtime | présent |
|---|---|---|---|
| `sBrendanCredits_Gfx` / `_Pal` | intro/scene_2/brendan_credits.png (.4bpp.lz) | intro/scene_2/brendan_credits.png | ⚠️ PNG seul (pas de `.4bpp.bin`) |
| `sMayCredits_Gfx` / `_Pal` | intro/scene_2/may_credits.png | intro/scene_2/may_credits.png | ⚠️ PNG seul |
| `sBicycle_Gfx` | intro/scene_2/bicycle.png | intro/scene_2/bicycle.4bpp.bin | ✅ (déjà preload Scene 2) |
| `sLatios_Pal` / `sLatias_Pal` | latios.png / latias.png (.gbapal) | intro/scene_2/latios.gbapal / latias.gbapal | ✅ |

## Interludes Pokémon (`credits.c` Task_LoadShowMons, BG = `starter_choose.c`)
| clé | source décomp | fichier runtime | présent |
|---|---|---|---|
| `gBirchBagGrass_Gfx` / `_Pal` | starter_choose/tiles.png (.4bpp.lz / .gbapal) | starter_choose/tiles.4bpp.bin + .gbapal | ✅ |
| `gBirchGrassTilemap` | starter_choose/birch_grass.bin (.lz) | starter_choose/birch_grass.bin | ✅ |

## Écran THE END (`credits.c` LoadTheEndScreen / DrawTheEnd)
| clé | source décomp | fichier runtime | présent |
|---|---|---|---|
| `gCreditsCopyrightEnd_Gfx` | graphics/credits/the_end_copyright.png (.4bpp.lz) | credits/the_end_copyright.png | ⚠️ PNG seul |
| `gCreditsCopyrightEnd_Tilemap` | graphics/credits/the_end_copyright.bin.lz | credits/the_end_copyright.bin | ✅ |
| `gIntroCopyright_Pal` | (copyright screen) | déjà preload Scene 1 | ✅ |
| `sCredits_Pal` | graphics/credits/credits.pal | credits/credits.pal | ✅ |

## Notes
- ⚠️ **PNG seul** (`brendan_credits`, `may_credits`, `the_end_copyright`) : pas de `.4bpp.bin`
  pré-extrait → `loadTileBin` retombe sur l'extraction canvas PNG. Fonctionne, mais les indices
  palette peuvent différer du build ROM (couleurs dupliquées). Pour un rendu strict : générer
  `scripts/extract-png-indexed-tiles.mjs` sur ces 3 PNG (HORS scope — ne pas toucher aux scripts).
- Ces clés ne sont PAS dans `public/decomp/asset-manifest.json` (prefetch/Service Worker) : le
  préchargement se fait par `fetch` direct dans `preloadCreditsAssets()`. Impact = premier accès
  non-caché offline uniquement (aucun impact correctness en ligne). Manifest NON modifié (scope).
