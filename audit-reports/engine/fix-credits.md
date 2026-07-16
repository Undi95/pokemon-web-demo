# fix-credits — câblage de l'écran CREDITS (générique de fin)

`src/credits.ts` (transpilé 1:1 de `decomps/pokeemeraude/src/credits.c`, `@ts-nocheck`)
contenait **22 `__wireTodo`**. Tous résolus. `npx tsc --noEmit` = **0**.

## Compteur
- **Câblé (import direct)** : 6 · **Transcrit 1:1** : 3 fonctions + 1 data-table (55 pages) + le
  système « moving scenery » (metadata/anims/sheets + 5 fns) · **Buffers/exemptions** : 4 ·
  **Assets (assetCache)** : 8 · **Artefact transpileur supprimé** : 1 (`data`).
- **Inert/dégradé** (TRANSPILER-TODO non-`__wireTodo`, notés ci-dessous) : mon-bg blob, palette
  birch, écran THE END (fill tilemap).

## Mapping des 22 `__wireTodo`
| # | symbole | catégorie | résolution |
|---|---|---|---|
| 1 | `CreateMonSpriteFromNationalDexNumber` | déjà porté | `export` + import de `src/pokedex.ts` |
| 2 | `GetStarterPokemon` | déjà porté | `export` + import de `src/starter_choose.ts` (rend un NOM → `resolveDecompConstant` avant `SpeciesToNationalPokedexNum`) |
| 3 | `InitHeap` | exemption matérielle | no-op local (heap GBA = GC JS) |
| 4 | `LoadCreditsSceneGraphics` | transcrit 1:1 | fonction hôte dans credits.ts (1:1 `intro_credits_graphics.c:838`) |
| 5 | `SetCreditsSceneBgCnt` | transcrit 1:1 | fonction hôte dans credits.ts (1:1 `intro_credits_graphics.c:889`) |
| 6 | `SoftReset` | exemption matérielle | no-op + `console.warn` (reset BIOS non reproductible web) |
| 7 | `data` | artefact transpileur | SUPPRIMÉ (4 consts `#define tTaskId_X data[N]`) + accès `.tTaskId_X` expansés en `.data[0/1/2/3/15]` |
| 8 | `gBirchBagGrass_Gfx` | asset | clé assetCache (LZ77UnCompVram) — préchargé |
| 9 | `gBirchBagGrass_Pal` | asset | assetCache (u16) — préchargé |
| 10 | `gBirchGrassTilemap` | asset | clé assetCache — préchargé |
| 11 | `gCreditsCopyrightEnd_Gfx` | asset | clé assetCache — préchargé |
| 12 | `gCreditsCopyrightEnd_Tilemap` | asset | clé assetCache — préchargé |
| 13 | `gDecompressionBuffer` | buffer | vrai `Uint8Array(0x4000)` (1:1 decompress.c) |
| 14 | `gHeap` | exemption | `null` (heap = GC) |
| 15 | `gIntroCopyright_Pal` | asset | assetCache (u16, déjà preload Scene 1) |
| 16 | `gSpritePalettes_Credits` | data 1:1 | objet hôte (1:1 `intro_credits_graphics.c:691`) |
| 17 | `gSpriteSheet_CreditsBicycle` | data 1:1 | objet hôte (`sBicycle_Gfx`) |
| 18 | `gSpriteSheet_CreditsBrendan` | data 1:1 | objet hôte (`sBrendanCredits_Gfx` 0x3800) |
| 19 | `gSpriteSheet_CreditsMay` | data 1:1 | objet hôte (`sMayCredits_Gfx` 0x3800) |
| 20 | `gSpriteSheet_CreditsRivalBrendan` | data 1:1 | objet hôte (0x2000) |
| 21 | `gSpriteSheet_CreditsRivalMay` | data 1:1 | objet hôte (0x2000) |
| 22 | `sCreditsEntryPointerTable` | data-table | `src/data/credits.ts` (55 pages, encodage LAZY `encodeOwText`) |

## Fichiers créés / modifiés
- **Créé** `src/data/credits.ts` — miroir 1:1 `data/credits.h` (169 libellés + table 55×5),
  généré par `scratchpad/gen-credits-data.cjs` (transcription mécanique). `.text` = getter LAZY
  (`encodeOwText` mémoïsé — charmap OW prête au runtime credits ; évite encodage au module-load).
- **Modifié** `src/credits.ts` — imports re-pointés (les Create* vélo `intro_credits_graphics.ts`
  rt-first → `decomp-globals` game-form) ; bloc `__wireTodo` remplacé ; `data` supprimé + 4 accès
  `.tTaskId_X` expansés ; `sCreditsData` alloué en vraie struct (typed arrays) ; hôte 1:1
  `LoadCreditsSceneGraphics`/`SetCreditsSceneBgCnt` + moving scenery ; `_bindCreditsAssets()`.
- **Modifié** `src/pokedex.ts` — `export` de `CreateMonSpriteFromNationalDexNumber`.
- **Modifié** `src/starter_choose.ts` — `export` de `GetStarterPokemon`.
- **Modifié** `harness/boot/intro-asset-loader.ts` — `preloadCreditsAssets()` (tous les assets scène/sprite/THE END).
- **Créé** `audit-reports/engine/assets-needed-credits.md`.

## ADAPTATION notable (au-delà du câblage des 22) — func-identity
`credits.c` compare `gTasks[x].func == Task_CreditsMain` en **3 endroits** (CB2_Credits,
Task_UpdatePage case 2 = impression des pages, Task_ShowMons case 2). Le runtime appelle
`t.func?.(t)` (objet-task), donc le transpileur enrobe chaque `.func` en arrow
`(t)=>TaskX(t.taskId)` → l'identité `== Task_CreditsMain` serait TOUJOURS fausse → **le texte du
générique ne s'imprimerait jamais**. Correctif minimal et FIDÈLE (2 lignes) : `.func` reçoit la
**référence nue** `Task_CreditsMain` (Task_WaitPaletteFade) + Task_CreditsMain normalise l'arg
objet→taskId. Les autres tasks (jamais comparées) gardent leurs arrows. Sémantique 1:1 exacte
(func == Task_CreditsMain ⟺ la task principale est dans l'état Task_CreditsMain).

## Commande de test (console `?debug`, jeu booté)
```js
// Écran CREDITS en direct. Prérequis : jeu démarré (window.__rt, charmap OW + species names
// chargés au boot). Recommandé : save avec Pokémon CAPTURÉS (flags Pokédex) pour le diaporama.
const [{ CB2_StartCreditsSequence }, { preloadCreditsAssets }] = await Promise.all([
  import('/src/credits.ts'),
  import('/harness/boot/intro-asset-loader.ts'),
]);
await preloadCreditsAssets();                 // OBLIGATOIRE avant (LoadX synchrones dans le CB2)
window.__rt.SetMainCallback2(CB2_StartCreditsSequence);
```
Prérequis d'état :
- `CB2_StartCreditsSequence` est autonome (ne lit pas la save HoF hormis flags Pokédex +
  `VAR_STARTER_MON`). Lancement à froid OK (dégrade sans crash si dex vide → mons = dex 0).
- `DeterminePokemonToShow()` lit `GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT)` : pour un diaporama
  réaliste, charger une save avec des captures. Sans → tous les slides = dex 0 (log, non-figeant).
- `gHasHallOfFameRecords` (export credits.ts) : mis à `true` par le vrai chemin HoF ; contrôle
  seulement l'accélération B (`JOY_HELD(B_BUTTON)`), non requis pour lancer.
- Le vrai chemin (fin de Ligue E4 → Panthéon → `CB2_StartCreditsSequence`) n'a PAS encore
  d'appelant câblé dans `src/` (hors scope : c'est le climax, séparé).

## Ce qui reste INERTE / dégradé (TRANSPILER-TODO, hors `__wireTodo` — à traiter au niveau transpileur)
1. **Écran THE END — bloquant partiel.** `LoadTheEndScreen` (credits.c) : `((VRAM +
   tileOffsetWrite))[i] = baseTile;` écrit sur un NOMBRE (adresse) → `TypeError` en mode strict
   ESM. Le gfx/palette THE END se chargent (LZ77UnCompVram OK) mais le remplissage du tilemap à
   `baseTile` throw (capté par runTasks → THE END stalle sur Task_CreditsTheEnd3, spam console).
   Fix = écrire dans la vue u16 de la VRAM runtime (adaptation pointeur, non modélisée par le transpileur).
2. **Fond coloré des mons (mon-bg).** `Task_LoadShowMons` : `gDecompressionBuffer + MON_PIC_SIZE`
   et `&gDecompressionBuffer[MONBG_OFFSET]` (arith. de pointeur non modélisée) → les 3 teintes
   jaune/rouge/bleu derrière les Pokémon ne se remplissent pas. Les mons eux-mêmes s'affichent
   (`CreateMonSpriteFromNationalDexNumber`). Non-figeant (buffer réel, écritures directes OK).
3. **Palette BG interludes.** `LoadPalette(gBirchBagGrass_Pal + 1, …)` : `Uint16Array + 1` →
   arg invalide → LoadPalette log/no-op. Palette du BG birch décalée. Non-figeant.
4. **Sizeof THE END palette.** `LoadPalette(gIntroCopyright_Pal, …, gIntroCopyright_Pal.length)` :
   `.length` (16) au lieu de `.byteLength` (32) → demi-palette chargée. Non-figeant.
5. **`InitCreditsBgsAndWindows`** : `SetBgTilemapBuffer(0, {})` (AllocZeroed du bridge rend `{}`) —
   comportement établi partagé (non introduit ici) ; à vérifier en jeu (rendu du tilemap BG0).
6. **`src/intro_credits_graphics.ts`** : la version rt-first de `CreateCloud/Tree/HouseSprites` +
   `SpriteCB_MovingScenery` + les `declare const sSpriteMetadata_*` stubs restent du **code mort**
   à réconcilier (le port 1:1 vit désormais dans credits.ts). Non touché (zéro import externe).

## Risques
- Import edge NOUVELLE credits.ts → pokedex/starter_choose : credits.ts est une FEUILLE (aucun
  code ne l'importe) → pas de cycle/TDZ au boot ; l'edge ne se charge qu'au lancement credits.
- Assets « PNG seul » (brendan/may_credits, the_end_copyright) : fallback canvas PNG (indices
  palette approximés) — cf. assets-needed-credits.md. Rendu strict = pré-extraire les `.4bpp.bin`.
- Non testé EN JEU (session principale) : le vrai symptôme visuel (défilement texte + scènes vélo
  + interludes) reste à valider ; `tsc` vert + revue 1:1 seulement.
