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

**Phase E1 — KEYSTONE `gSprites` Map → `Sprite[64]` array** (le gros morceau, 87 call-sites).
Migrer `decomp-runtime.ts:552 gSprites: Map` → tableau fixe indexé (1:1 `CreateSprite` qui scanne le 1er slot
libre). Incrémental : adapter les accès `gSprites.get(id)` → `gSprites[id]` par lots, tsc + boot + A/B sprite
(le perso bouge, les NPC s'animent, un combat rend) après chaque lot. ⚠️ haut risque → petits lots vérifiés.

**Phase E2 — EXTRAIRE sprite.c → `game/sprite.ts`** : sortir CreateSprite/CreateSpriteAtEnd/DestroySprite/
AnimateSprites/BuildOamBuffer/AnimateSprite/ResetSprite/etc. du harness vers le home 1:1, noms/structure décomp,
écrivant dans `Gba.oam`. Rewire imports.

**Phase E3 — DÉ-SHIM les corps vidéo** : remplacer `_dgItf()`/`_dgRt().gSprites.get()`/`_dgBgX()` par accès
directs 1:1 (`gSprites[i]`, `gBattle_BG1_X`…) dans les battle-anims + field effects. A/B par famille (anim par anim).

**Phase E4 — bg.c / palette.c / dma** : aligner les fonctions BG (SetBgAttribute, CopyBgTilemapBufferToVram…),
palette (LoadPalette, BlendPalette, TransferPlttBuffer 1:1), DMA. Beaucoup déjà présent dans le harness.

**Phase E5 — main loop / CB2 / VBlank** : aligner AgbMain/SetMainCallback2/VBlankIntr 1:1 sur le tick existant.

## Cadence / sécurité
Boot doit rester vert (59.5 FPS) entre chaque commit. tsc=0 + sonde déterministe + **A/B pour tout rendu**
(le user valide les visuels). 1 lot vérifié = 1 commit. Jamais de big-bang sur les 87 sites. Le harness
(composeFrame/bridge/BIOS/m4a) ne bouge pas. Supersede le « moteur jamais 1:1 » de [mirror-port-1to1].
