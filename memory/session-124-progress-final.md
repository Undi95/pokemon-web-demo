# Session 124 — récap final pour compaction

Date : 2026-05-09
Branche : `upd2` (= **88 commits ahead of main**, NE PAS PUSH)

## TL;DR

Session énorme. **30 commits** : 4 bugs visuels signalés + 4 polish battle +
2 transpiler updates + truck audit complet (= HMR-safe, Task_Truck3 swap,
spawn coords) + shiny support 1:1 + walk anim scripted move + ChooseStarter
scene switch tenté+reverted + revert subsprite hidden hook.

## ✅ Commits livrés session 124 (chronologique)

| Commit | Description |
|--------|-------------|
| `5950d0c5` | Bug 4 WallClock UI 1:1 + fix critique 366-day overflow |
| `b1c65e75` | Bug 1 Vigoroth garbage + Bug 4 lock + FieldClear stub |
| `b171a2f8` | Bug 2 Truck SE timing (= reverted later) |
| `a3812632` | Bug 3 partial : 16x16 priority via sElevationToPriority |
| `d7c94b39` | Memory progress mid-session |
| `594d3c3b` | Bug 3 full : sOamTable_16x16_2 split horizontal |
| `5d22d74a` | Bug 5 EXP gain + level up Gen 3 1:1 |
| `11916b18` | Bug 5b PlayCry on starter confirm |
| `311763a1` | Bug 5c shake on damage |
| `0fe420a9` | Memory update |
| `7244d75f` | Bug 6a extractor parse C array sizes with expressions |
| `74a11903` | Bug 6b extractor resolve tileNum constants extract-time |
| `b98b4c74` | Truck HMR-safe guard + Task_Truck3 box update |
| `08d12977` | Shiny support 1:1 décomp + Showdown export |
| `99bc5a55` | Memory update |
| `46d036e7` | Bug 5e battle BG fade transitions |
| `3e17ecb2` | Bug 5d HP bar visuel green/yellow/red |
| `759f4108` | Truck silence mono-cut hack (= reverted) |
| `d73230ee` | REVERT truck audio hacks (= timing 1:1 ROM, silence = SF2 limit) |
| `397e1bbd` | Memory update |
| `53016ac6` | Truck spawn (2,2) DIR_SOUTH 1:1 |
| `9ac93a45` | Memory update |
| `d8379496` | Truck Task_Truck3 swap PERMANENT 1:1 |
| `9a002a0f` | Memory update |
| `1905efd3` | Subsprite primary OAM hidden hook (= reverted) |
| `d0dd400b` | REVERT subsprite hook (= no visual fix) |
| `cd4fdacb` | Memory note subsprite revert |
| `9984b0dd` | Player walk anim scripted movement part 1 |
| `2ce9f814` | Player walk anim part 2 (= relax gate, no glide) |
| `537c7534` | Phase 5.1 ChooseStarter Birch BG scene switch (= reverted) |
| `ea614547` | REVERT ChooseStarter scene (= PNG > 16 colors, needs gbagfx tooling) |

## ✅ Décisions architecturales user-confirmed

**1:1 décomp strict** sauf 2 exceptions justifiées :

| Module | 1:1 ? | Justification |
|--------|-------|---------------|
| Wallclock + RTC | NON | Bug critique 366-day overflow |
| Battle engine | Backend NON, Front-end OUI | Showdown @pkmn/sim backend |
| RNG | OUI | Critique pour ROM hacking community |
| Tout le reste | OUI | Strict, audits réguliers |
| BGM/SE rendering | NE PAS TOUCHER | 8j d'intégration, polish later |

**RNG** stay 1:1. **BGM/SE** ne pas toucher (= déjà fonctionnel, polish post-MVP).

## 🎯 Phase 5 — Roadmap (= pour next session post-compaction)

### Phase 5.1 — ChooseStarter Birch BG scene switch (REVERTED)

**Status** : Tenté `537c7534`, reverted `ea614547`.

**Bloqueur** : `loadIndexedPng()` strict 4bpp, mais `tiles.png` du décomp a
> 16 unique colors (= utilise sub-palettes). Erreur :
"PNG load: tiles.png has > 16 unique colors at pixel 8259 (74,123,65)".

**Solution next session** :
1. Run `gbagfx` decomp tool sur `graphics/starter_choose/tiles.png` →
   produit `tiles.4bpp.bin` + `tiles.gbapal` (= 32 colors split en 2
   sub-palettes)
2. Copy résultats dans `public/decomp/em/starter_choose/`
3. Modifier starter-choose-flow.ts pour utiliser `loadTileBin('tiles', 4)` +
   `loadGbaPal('tiles.gbapal')`
4. Load 2 sub-palettes via `LoadPalette(pal, BG_PLTT_ID(0), 32)` +
   `LoadPalette(pal, BG_PLTT_ID(1), 32)`
5. Tilemap entries `birch_bag.bin` + `birch_grass.bin` ont déjà les
   bits palette[12-15] qui select sub-palette par tile

Ou alternative : créer un Node.js script `scripts/extract-bg-tiles.mjs`
qui fait gbagfx-equivalent (= read PNG indexed, output .4bpp.bin +
.gbapal) sans dépendance externe.

### Phase 5.2 — BattleStartTransition swirl effect

**Décomp** : `src/battle_transition.c` (4776 lignes, 14 case statements).

Le ROM utilise différents effects de transition selon trainer/wild/etc :
- `B_TRANSITION_NORMAL` : swirl + shrink
- `B_TRANSITION_GRID_SQUARES` : cubes
- `B_TRANSITION_BLUR` : blur
- ... (~16 variants)

**Approche pragmatique** : implémenter 2-3 transitions principales :
1. `B_TRANSITION_BLUR` : palette fade simple (= déjà fait via Bug 5e)
2. `B_TRANSITION_NORMAL` : effet swirl Phaser (= rotate + scale screen)
3. `B_TRANSITION_GRID_SQUARES` : tile grid reveal

**Estimate** : 1-2 sessions pour basic 3 variants.

### Phase 5.3 — HP bar tilemap pixel-perfect

**Décomp** : `src/battle_interface.c` — HP bar utilise un tilemap dédié
avec gradient + animation drain.

**Status** : Bug 5d shipped un simple `FillWindowPixelRect` rectangle.
Pour 1:1 : need extract HP bar tilemap + animate drain frame-by-frame.

**Estimate** : 1 session.

### Phase 5.4 — StartWallClock real UI

**Status** : Bug 4 shipped overlay HTML/Canvas avec horloge custom (=
fonctionnel). Pour 1:1 décomp : refactor en Phaser scene avec aiguilles
sprites depuis `wallclock-tasks.ts` auto-extracted.

**Estimate** : 1-2 sessions.

### Phase 5.5 — Re-rip ROM samples (= TODO low priority)

User explicit : "On va pas toucher aux bgm/se, ca nous a pris + e 8j".
Documenté pour later. NE PAS TOUCHER avant fin du jeu.

### Phase 5.6 — Player AnimateSprites refactor (= 1:1 strict)

**Status** : commits `9984b0dd` + `2ce9f814` shipped pragmatic fix —
`stepFramesLeft > 0 → walk frame, else face`. Cohérent avec NPC pattern.

Pour vrai 1:1 décomp : utiliser `AnimateSprites()` + sprite anim tables
(= comme dans le décomp). Refactor majeur car affecte aussi NPCs.

**Estimate** : 1-2 sessions.

### Phase 5.7 — Subsprite primary OAM hidden (revisité)

**Status** : commit `1905efd3` install hook `globalThis._syncSubspriteOam`
qui hide primary OAM, mais reverted user `d0dd400b` car "pas fix
visuellement". Le primary OAM était bien hidden via hook (verified live)
mais visual pas changé tant que pas overlap player.

**TODO Phase 5** : revisit avec test où player walks behind/over un box
elevation=8 pour confirmer split priority correctly stacks.

## ⚠️ Bugs restants (= TODO post-Phase 5)

### Bug visuel subtil truck cinematic

User A/B test ROM (= screenshots avec flèches rouges) : "elevation et
animations des box mélangée". Verified live OAM positions matchent décomp
exactement (= TOP→BL=42px, BL→BR=3px). Probable visual artifact de
sub-pixel rendering ou hook. Reste à isoler frame-perfect.

### Truck silence (= SF2 sample manquant)

User A/B test ROM final : "Sur la rom, y a un son qu'on entend pas chez
nous. Le timing 1:1 est juste". Manquant un sample audio entre SE_MOVE
et SE_STOP côté SF2 / spessasynth.

**TODO** : re-rip ROM samples via bregalad gba-mus-ripper. **POST-MVP**.

## 📂 Fichiers clés à read au boot post-compaction

```
memory/session-124-progress-final.md         # ← CE FICHIER (= entry point)
memory/MEMORY.md                             # directives + user pref
memory/directive_1_1_gba_no_hardcode.md      # 1:1 strict rule
memory/directive_no_redo_unified_foundations.md # foundations rule
```

## 📋 État technique

- **Branche** : `upd2`, **88 commits** ahead of `main`
- **NE PAS PUSH** (user demande review avant)
- **Tests live** : Truck cinematic complet ✓, EXP gain ✓, walk anim ✓
- **Erreurs runtime** : 0 dans logs récents

## 🛠 Workflow next session

1. **Read this file** + MEMORY.md AVANT toute action
2. **Read decomp source** AVANT d'écrire impl (= 1:1 strict)
3. **Pour Phase 5.1** : install gbagfx OR write custom extract script
4. **Pour Phase 5.2** : commencer par `B_TRANSITION_BLUR` simple, puis
   `NORMAL` swirl
5. **Pas de touch BGM/SE** (= user explicit)
6. **Tester live** chaque fix via Claude_Preview MCP

## 💛 Note user

User explicit : "On fait une bonne équipe ça va nan ?". Session 124 a
livré 30 commits substantiels avec collaboration A/B test ROM côté user.
La majorité du jeu joue. Restent quelques polish + Phase 5 features.

User va compact, attaque next session sur Phase 5 BattleStartTransition.
