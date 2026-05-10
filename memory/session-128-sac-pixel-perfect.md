# Session 128 — SAC pixel-perfect 1:1 décomp (FINAL)

**Date** : 2026-05-10 (continuation, user dormait)
**Branche** : worktree hungry-moore-a74774 (`upd2`)
**Contexte** : User a finalisé en session 127 le combat Zigzagton et a passé le relais
sur le visuel des menus (start → SAC). Cette session 128 finit le SAC 1:1 décomp.

---

## 🎯 Résultat

SAC pixel-perfect 1:1 décomp **complet** :
- Frame fond rose/mauve via BG2 tilemap menu.bin (1:1 sBgTemplates_ItemMenu)
- 5 pockets navigables (objets / poké balls / CT&CS / baies / objets rares)
- Sprite sac en OAM 64×64 à (68, 66) avec frame change par pocket
- Bag jump anim au switch (y2 -5 → 0)
- Header "POCKET NAME" centré en FONT_NORMAL
- Liste items en FONT_NARROW avec cursor ▶ + qty right-aligned
- Description multi-lignes en FONT_NORMAL via getString(descriptionLabel)
- Item icon 24×24 à (1, 9) tilemap
- Yellow fade row-by-row tile 17 pendant switch (16 frames)
- **Return arrow icon ↩** pour FERMER LE SAC (= 1:1 décomp ITEM_LIST_END → ITEMS_COUNT)
- **2 chevrons OAM ◀▶** autour pocket name à (28, 16) et (100, 16) avec
  bobbing horizontal sin wave ±2px (1:1 sScrollIndicatorTemplates freq=±8)
- **Rotating ball OAM** au switch à (16, 16) avec affine matrix complète
  (1:1 ObjAffineSet : pa=cos*sx>>8, pb=-sin*sx>>8, pc=sin*sy>>8, pd=cos*sy>>8)
  + AllocOamMatrix/FreeOamMatrix + UpdateBallCoords ctcv -8/-9 wobble
- Fade in/out RGB_BLACK 16 frames (1:1 BeginNormalPaletteFade)
- Save/restore OBJ VRAM + OBJ palettes 0/1/2 → player/NPCs préservés au close

## 🐛 Bug critique fixé

Avant : sprite player + NPCs corrompus au retour overworld (apparaissaient en
"vert blob" car palette OBJ écrasée par bag.pal/red.pal/rotating_ball.pal restait).

Fix : snapshot OBJ VRAM 0..0x3200 + gPlttBufferUnfaded[256..256+48] au
`_setupBackgroundTilemap`, restore au `_doTeardown` (Unfaded ET Faded).

## 📦 Fichiers modifiés / ajoutés

- `src/engine/bag-screen.ts` (~1200 lines) — la totalité du module bag
- `public/decomp/em/interface/scroll_indicator.png` (16×32 4bpp, 8 tiles)
- `public/decomp/em/interface/red.pal` (palette JASC 16 entries)

## 📜 Commits session 128 (branche upd2)

| Commit | Message |
|--------|---------|
| `d42740db` | SAC : return arrow icon pour FERMER LE SAC (1:1 ITEMS_COUNT) |
| `cecfde1e` | SAC : chevrons + rotating ball 1:1 décomp + save/restore OBJ |

## 📐 Pattern exportable pour autres menus

Le SAC sert de template 1:1 décomp pour Pokédex / POKéMON (party) / Trainer Card
qui suivront le même pattern :

1. **Audit décomp ligne par ligne** : `decomps/pokeemeraude/src/{pokedex,party_menu,trainer_card}.c`
2. **Tile data + tilemap** : `loadTileBin` / `loadTilemapBin` avec extract via scripts/extract-all-tile-bins.mjs
3. **Palettes** dans slots OBJ dédiés (1, 2, 3...) avec `LoadPaletteObj` + `OBJ_PLTT_ID(slot)`
4. **CRITIQUE** — Snapshot OBJ VRAM range + OBJ palettes 0..N AVANT premier write,
   restore au close. Sans ça → corruption sprite player/NPCs au retour OW.
5. **Snapshot `_syncSubspriteOam` hook** + override pour whitelist owned sprites
   (= ne pas clear oam.visible des nôtres chaque frame).
6. **Fade in/out RGB_BLACK 16 frames** via `BeginNormalPaletteFade(0xFFFFFFFF, 0, S, E, 0)`
   en open/close.
7. **`setFieldCameraSuspended(true)`** pour bloquer field camera scroll BG.
8. **Phase machine** : 'idle' / 'fading_in' / 'open' / 'fading_out' / 'switching_*'
9. **OAM cleanup** au teardown : `gSprites.delete(spriteId)` + `oam.visible = false` +
   `FreeOamMatrix(matrixNum)` si affine.

## 🚀 Reste à faire (futurs sessions)

- POKéDEX (option 1 du start menu) — actuellement no-op probably
- POKéMON / Party (option 2) — actuellement no-op probably
- UNDI / Trainer Card (option 4) — actuellement no-op probably
- SAUVER (option 5) — option save existante, à 1:1 ?
- OPTIONS (option 6) — déjà 1:1 décomp depuis session 125

Le pattern SAC ci-dessus est directement applicable. Compter ~1000 lines TS
par menu si pixel-perfect.

---

## 💬 Réponse au /loop dynamic mode

User a demandé : "si menu opton/start corrigé, essaye de tout faire et de
gagner le combat vs zigzaton. Si par miracle c'est fait jusque la, Merci!"

→ Combat Zigzagton **déjà gagné en session 127** (cf. session-127-zigzagton-victory.md).
→ Cette session 128 a continué le pivot vers la finition visuelle SAC, en
  parallèle / suite directe.
→ **Tout est commit** sur la branche upd2 (sauf `git push`, conformément à la
  règle "Pas de push" — feedback-critical-rules.md).
