# Plan — Réconciliation 1:1 du MOTEUR (chantier engine, marathon)

> **Décision user 2026-06-21** : « si le moteur est portable (sauf PPU rasterizer + son), autant tout faire ».
> Re-challenge du dogme « le moteur ne sera jamais 1:1 » → **FAUX** : le moteur EST déjà un PPU software GBA
> fidèle, en prod, à 59.5 FPS. Le 1:1 moteur n'est pas un émulateur à écrire (fait) — c'est **consolider le
> code vidéo décomp PAR-DESSUS l'état GBA existant**. Git nous couvre si ça casse.

## Ce qui existe déjà (le socle, à NE PAS réécrire)
- `src/engine/gba/gba.ts` — classe `Gba` = **modèle hardware 1:1** : VRAM unifiée 96 Ko (`Uint8Array(0x18000)`,
  mappée 0x06000000), `oam: OamEntry[128]`, `objVram` 32 Ko, `palette` (PaletteBanks = gPlttBuffer),
  BGCNT/BLDCNT/windows/affine(32+2)/mosaic.
- `src/engine/gba/compositor.ts` `composeFrame()` — **vrai rasterizer PPU** par scanline (BG + OAM par
  priorité + blend + windows + affine + mosaic + HBlank). = HARNESS borné (exempté 1:1, comme m4a).
- `src/engine/gba/phaser-bridge.ts` — putImageData(framebuffer) → texture Phaser. **Phaser = juste la fenêtre.**
- **Perf validée : 59.5 FPS** en prod (composeFrame ~5.3ms + putImageData ~3ms). Aucun chemin sprite-Phaser parallèle.

## Le HARNESS borné (reste non-1:1, documenté, comme le son)
`composeFrame` (rasterizer PPU) · `phaser-bridge` (fenêtre) · BIOS/IO plumbing (REG_*, SoftReset, CpuSet…) ·
`m4a` (son). Tout le RESTE du code vidéo décomp → 1:1.

## L'écart à réconcilier (le « déjà fait, mal placé »)
La logique vidéo décomp vit dans le **harness** (`decomp-runtime.ts` 2723 l, `sprite-animation.ts`) en
**ré-architecture** : `gSprites = new Map()` (≠ décomp `struct Sprite gSprites[64]`), shims `_dgItf()`/
`_dgRt().gSprites.get()` dans les battle-anims, fonctions sprite.c éclatées hors de `game/sprite.ts` (inexistant).

## Keystone & phases (incrémental, boot 59.5fps vert entre CHAQUE commit, git couvre)
**Phase E0 — TYPES** : aligner `struct Sprite` + `struct OamData` 1:1 (décomp `include/sprite.h`) dans
`game/sprite.ts` (ou include/). Bas risque (types). Base des phases suivantes.

**Phase E1 — KEYSTONE `gSprites` Map → `Sprite[64]` array** (LE refactor du cœur, le + couplé du projet).
Accès analysés (2026-06-21) : `.get(id)`=239 (→`[id]`, mécanique) · `.set/.delete/.has`=0 (Map jamais mutée
via API — CreateSprite/DestroySprite gèrent en interne) · itérations `.forEach/.values/.size`=37 (SENSIBLE :
la décomp itère les 64 slots + check `inUse` ; Map.values ne voit que les set → à convertir avec soin) · chokepoint
`rt.gSprites` (424). ⚠️ **3 COUPLAGES DURS découverts (pas un simple swap)** :
  1. **Modèle d'ID** : notre Map est keyée par `spriteId` MONOTONE (`nextSpriteId++`) ≠ décomp `gSprites[64]`
     indexé par SLOT 0-63 réutilisé. Le keystone DOIT reconcilier le modèle (monotone→slot), ce qui change
     la sémantique des IDs partout (DestroySprite par id, les 239 `.get(id)`, spriteAnimStates…).
  2. **Signature callback** : `DecompSprite.callback = (sprite, rt) => void` — le `rt` passé explicitement est
     un ajout M3 ; décomp = `(sprite)` (rt global). Le 1:1 = retirer `rt` → touche TOUS les callbacks sprite.
  3. **Cycle ESM** : le type `Sprite` référence `DecompRuntime` (via le callback) → `game/sprite.ts` ↔
     `decomp-runtime.ts` cycle. À casser (rt global / type forward).
`DecompSprite` (decomp-runtime.ts:380) est DÉJÀ un `struct Sprite` 1:1 fidèle (champs cités sprite.h) → renommer
`DecompSprite`→`Sprite` dans `game/sprite.ts`. Exécution = lots vérifiés (scaffold transitionnel dual-API →
migrer les sites → retirer le compat), tsc + boot 59.5fps + **A/B sprite** (perso bouge / NPC s'animent / combat
rend) après CHAQUE lot. NE PAS big-bang. Aucune petite brique isolable (type/storage/signature/ID tous couplés)
→ c'est un run dédié et focalisé, pas une fin de tour.

**Phase E2 — EXTRAIRE sprite.c → `game/sprite.ts`** : sortir CreateSprite/CreateSpriteAtEnd/DestroySprite/
AnimateSprites/BuildOamBuffer/AnimateSprite/ResetSprite/etc. du harness vers le home 1:1, noms/structure décomp,
écrivant dans `Gba.oam`. Rewire imports.
  - ✅ **E2.1** (`37d38cff`) : `git mv engine/system/sprite.ts → game/sprite.ts` (ce fichier ÉTAIT déjà notre
    sprite.c : AllocSpriteTiles/CalcCenterToCornerVec/LoadSpriteSheet/SetOamMatrix/AllocOamMatrix/allocateurs).
    Relocation pure, 43 specifiers réécrits (37 fichiers), zéro nouvel arc ESM. tsc=0, A/B OW+combat 59fps.
  - ⏳ **E2.2** : folder `sprite-animation.ts` (BeginAnim/ContinueAnim/AnimateSprite/StartSpriteAnim/SeekSpriteAnim/
    ProcessSpriteCopyRequests/RequestSpriteFrameImageCopy/ANIMCMD_*) DANS game/sprite.ts. ⚠️ crée un cycle VALEUR
    `game/sprite ↔ decomp-runtime` (sprite importe `OBJ_PLTT_ID`, decomp-runtime importe `AnimateSprite`) — sûr SI
    aucun usage top-level (fonctions = lazy), mais vérifier TDZ au boot.
  - ⏳ **E2.3** : extraire les MÉTHODES `DecompRuntime` → free functions dans game/sprite.ts, pattern délégation
    transitionnel (comme façade E1) : `CreateSpriteAtOam`→`CreateSprite`/`CreateSpriteAt` 1:1 (lit `struct
    SpriteTemplate`), `DestroySprite` (102 call-sites `rt.DestroySprite`), `ResetSpriteData` (13), `AnimateSprites`,
    `BuildOamBuffer`. Garder `rt.X` comme délégué pendant la migration des call-sites, retirer ensuite.

**Phase E3 — DÉ-SHIM les corps vidéo** : remplacer `_dgItf()`/`_dgRt().gSprites.get()`/`_dgBgX()` par accès
directs 1:1 (`gSprites[i]`, `gBattle_BG1_X`…) dans les battle-anims + field effects. A/B par famille (anim par anim).

**Phase E4 — bg.c / palette.c / dma** : aligner les fonctions BG (SetBgAttribute, CopyBgTilemapBufferToVram…),
palette (LoadPalette, BlendPalette, TransferPlttBuffer 1:1), DMA. Beaucoup déjà présent dans le harness.

**Phase E5 — main loop / CB2 / VBlank** : aligner AgbMain/SetMainCallback2/VBlankIntr 1:1 sur le tick existant.

## Avancement E1 (keystone) — 2026-06-21
- ✅ **Lot 1** (`e7a39e63`) : `gSprites` Map → `class SpriteArray` (tableau fixe 64 slots, façade Map
  transitionnelle). Modèle slot 0-63 déjà en place (CreateSprite scanne le 1er libre). Hot-path per-frame
  (syncSpritesToOam + tickSpriteAnims) en boucles indexées. A/B user OK, FPS 49→60.
- ✅ **Lot 2** (`7b542f0e`) : 8 boucles `gSprites.values()`/`.forEach` du GAMEPLAY → indexées `for i<MAX_SPRITES`
  + `.get(i)`. Générateurs gSprites retirés du gameplay. A/B user « tout OK », 59.8 FPS.
- ✅ **Lot 3a** (`e92953de`) : 19 itérateurs `gSprites.values()/.entries()/.keys()` + `for...of` par défaut
  → boucles indexées `for (i<MAX_SPRITES)` (incl. hot-paths `runSpriteCallbacks`/`tickAllAffineAnims`). A/B OK.
- ✅✅ **Lot 3b** (`cd6ac05d`) — **KEYSTONE E1 SOLDÉ** : `gSprites` Map/façade → **TABLEAU NU**
  `(DecompSprite|undefined)[] = new Array(MAX_SPRITES)`, accès `gSprites[i]` (1:1 décomp), classe `SpriteArray`
  SUPPRIMÉE. Big-bang tsc-guidé via 3 transforms paren/bracket-aware (non-trackés `scripts/migrate-gsprites-*.cjs`) :
  637 `.get(X)`→`[X]`/`?.[X]` · 131 annotations locales `Map<number,X>`→`Array<X|undefined>` · 31 `for...of`
  (`?? new Map()`/`.entries()`/`.values()`) → indexé · 48 méthodes (`.delete`→`[X]=undefined`, `.clear`→`.fill(undefined)`,
  `.set`→`[X]=Y`, `.has`→`[X]!==undefined`, `.size`→`.filter(Boolean).length`). Mains : 2 boucles gTasks sur-converties
  revert, type retour `_sprites()`, param `destroyAllNpcSprites`, gardes. **Zéro changement comportement/perf**
  (fidélité syntaxe pure). A/B COMPLET : OW (marche+warp, 59.7fps) + combat sauvage end-to-end (transition→send-out
  →ÉCRAS'FACE→K.O.+destruction sprite SANS fantôme, 59.5fps, 0 erreur). `gSprites` runtime = `Array(64)` confirmé.
  ➡️ **PROCHAIN : Phase E2** (extraire sprite.c → `game/sprite.ts`).

## Cadence / sécurité
Boot doit rester vert (59.5 FPS) entre chaque commit. tsc=0 + sonde déterministe + **A/B pour tout rendu**
(le user valide les visuels). 1 lot vérifié = 1 commit. Jamais de big-bang sur les 87 sites. Le harness
(composeFrame/bridge/BIOS/m4a) ne bouge pas. Supersede le « moteur jamais 1:1 » de [mirror-port-1to1].
