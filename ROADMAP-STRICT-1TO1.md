# ROADMAP STRICT 1:1 — État + prochaines étapes

## Contexte projet

Port web (Phaser+TypeScript) **1:1 STRICT** ligne par ligne de Pokémon Émeraude.
Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/` (décomp officiel pokeemerald).
Cible : zéro divergence, zéro raccourci, zéro auto-générer naze.

**Règles dures** :
- 1:1 STRICT ligne par ligne (pas d'approximation, pas de couche compat).
- Source unique = arrays/structs primary du décomp.
- Pas de push sur `upd2`.
- Pas de save sans input user explicite.
- Pas toucher BGM/SE.
- Pas d'imports depuis `decomp-data/auto/` (= ce dossier a été purgé, plus jamais le ré-introduire).
- Mono-FR (skip multi-langue).

## Branche / commits récents (upd2 NON poussés)

| Commit | Phase | Sujet |
|---|---|---|
| `c78fa441` | 7 | Bitmap sync MarkObjTilesAllocated |
| `5f638396` | 9 | Bag/party/summary close 1:1 |
| `6a79f84d` | 10 | Fix NPC palette leak (mère verte) |
| `8eb50eac` | 11 | Migration sites → IndexOfSpritePaletteTag |
| `f1ecdc4e` | 12 | Fix bag item icon palette stale (BUGFIX décomp) |
| `2ecd07ea` | 13 | SSOT tag system |
| `e3748e29` | 14a | `trainer-pic-tables` hors auto/ + OverworldScene purgé |
| `66dec4f5` | 14b.1 | `auto/include/*` + `auto/src/*` migrés |
| `7951ea00` | 14b.2 | Purge totale `decomp-data/auto/` (~840 fichiers C-style) |
| `23b9d61e` | A3 | Retrait Maps secondaires `paletteTagToSlot`/`spriteSheetTagToTileStart` |
| `e445556e` | A2 | Retrait cursors `nextSpriteSheetByteOffset`/`nextObjPalSlot` |
| `c120e8df` | docs | Roadmap STRICT 1:1 état + prochaines étapes |
| `ec6b555e` | **A1** | NPC sprite system 1:1 strict (bitmap allocator + tag palette) |
| `9ebae008` | **A1c** | Réimport field-effect-emotes 1:1 strict trainer_see.c |
| `71471f97` | **A1d** | Fix tag mismatch number/string LoadCompressedSpriteSheet |
| `d725a6de` | **A1e** | Implement CreateSpriteAtEnd 1:1 (fix emote/NPC slot collision) |

## Bugs visibles post-A2/A3 (statut)

Tests user 2026-05-23 post-A2 :
- **Emote (!)** affiche le haut de la tête MOM au lieu du sprite exclamation → reste à vérifier post-A1
- **POTION sprite cassé** dans le PC + sac = "bout du sac" → bug **non-A1** (= tile data résiduel bag-screen)
- **Bouton retour sac cassé** = "bout du sac" → bug **non-A1** (= idem)
- **Scroll items** palette OK mais sprite brisé → bug **non-A1**
- **Open/close cycle** → corruption des arrows → bug **non-A1**

**Diagnostic A1 confirmé runtime** : NPCs alloués via bitmap général
`sSpriteTileAllocBitmap` 1:1 décomp (sprite.c:540-589 CreateSpriteAt branch
tileTag==TAG_NONE → AllocSpriteTiles), palette via tag system. Validation :
- Brendan tile=0 pal=0 (player)
- Twin tile=144 pal=1
- Boy_2 tile=216 pal=2
- Bag open/close cycle conserve allocations NPCs.

**Bugs sac restants (= A1b à investiguer)** : la palette est correcte mais
le tile data en VRAM contient un "bout du sac". User a flag `sprite brisé
≠ palette OK`. Hypothèse : un site bag-screen (= item icon, scroll arrow,
return button, rotating ball) utilise un cursor cached qui skip un
LoadSpriteSheet au cycle suivant → ResetSpriteData clear le bitmap, autre
sprite alloue à la même zone, écrasement. Sites suspects :
- `_bagAssetsLoadedToObj`, `_scrollArrowAssetsLoaded`, `_rotatingBallAssetsLoaded`
  (reset au close, mais peut-être insuffisant)
- `_drawItemIcon` utilise `BlitBitmapToWindow` (= BG layer, pas OAM) — différent
- Pattern `field-effect-emotes.ts` (= check `IndexOfSpriteTileTag` + force
  re-load) à appliquer ici si manquant

## ROADMAP RESTANTE

### PHASE A — Base saine sprite/palette/VRAM

**A1** — NPC sprite system 1:1 strict ✅ FAIT (commit `ec6b555e`)

**A1b (prochaine étape)** — Bugs sac sprite tile data résiduel
- Audit bag-screen.ts pour identifier sites bypass tag system
- Cibles : POTION/retour/scroll arrows visualement brisés
- Source décomp : `item_menu_icons.c` + `item_menu.c` (= setup graphics)

**A4** — Audit sous-dossiers `auto-engine/`, `auto-tasks/`, `auto-asm/`, `auto-test/`
- Lancer agent audit comme `auto/` (déjà purgé)
- Pour chaque fichier importé en externe, valider qualité ou refactor 1:1
- Source : `decomps/pokeemeraude/src/<corresponding>.c`

**A5** — Audit `decomp-data/src/*-callbacks-auto.ts` (migrés d'auto/)
- Vérifier qualité 1:1 ligne par ligne vs décomp
- Refactor ceux qui sont C-style cassés

### PHASE B — Dettes documentées (DETTES-1TO1-STRICT.md)

**B1** — Section 1 substrat sprite/camera/OAM (~30 STUBs) — pour mode "Décorer ma chambre"
**B2** — Section 2 menu helpers UI (~10 STUBs)
**B3** — Section 3 assets graphics extraction (mail BG, decoration icons)
**B4** — Section 4 helpers cross-modules (party_menu/TV/field-effect)
**B5** — Section 5 multi-langue — SKIP (mono-FR)
**B6** — Section 6 refactor architectural (sPCxxx struct, _itemStorage rename)
**B7** — Section 7 easy_chat setter wires (~50 setters non wirés)
**B8** — Section 8 misc dettes mineures

### PHASE C — Validation et cleanup

**C1** — Re-test exhaustif tous les écrans
**C2** — Cleanup commentaires obsolètes
**C3** — Audit final ligne par ligne fichiers critiques

## Workflow

1. Code l'étape
2. `git commit` sur upd2 (jamais push)
3. Si feature visible → demander test user en preview
4. Si pas visible → tester via `scope.*` + `preview_eval` solo
5. User confirme OK → étape suivante

## Fichiers de référence

- [DETTES-1TO1-STRICT.md](DETTES-1TO1-STRICT.md) — 79 STUBs documentés
- [AUTO-FILES-AUDIT.md](AUTO-FILES-AUDIT.md) — audit du dossier auto/ purgé
- [DEAD-CODE-AUDIT.md](DEAD-CODE-AUDIT.md) — 841 fichiers morts identifiés (purgés)
- [AUDIT-SPRITE-PALETTE-VRAM-1TO1.md](AUDIT-SPRITE-PALETTE-VRAM-1TO1.md) — audit sprite system
- Décomp officiel : `D:/Projet 1/decomps/pokeemeraude/src/` (source UNIQUE de vérité)

## État sources unique 1:1 strict (post-A3+A2)

- `sSpritePaletteTags[16]` (sprite.ts) = palette tags array, 1:1 décomp sprite.c:274
- `sSpriteTileRangeTags[64]` + `sSpriteTileRanges[128]` = tile range tags, 1:1 décomp sprite.c:271-272
- `sSpriteTileAllocBitmap[128]` = bitmap tile alloc, 1:1 décomp sprite.c:288
- `gReservedSpriteTileCount`, `gReservedSpritePaletteCount` = reserved counts, 1:1 décomp sprite.c:287/278

Tous les Maps/cursors secondaires retirés. Source UNIQUE = arrays primary.
