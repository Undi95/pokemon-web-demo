# Session 2026-05-09 — Status final

Date : 2026-05-09 (session matin user-driven debug + nuit autonomous loop)
Branch : `upd2` (= **70 commits** ahead of `main`, NE PAS PUSH)

## TL;DR

**Énorme session**. Démarrée nuit en autonomous loop (audit-driven coverage),
puis user-driven debug session après réveil. Title screen + warps + intro
+ Z-axis sont tous fixés. 5 bugs visuels mineurs encore à investiguer.

## ✅ Bugs fixés (= 12 commits ce matin)

### Bugs structurels

| Commit | Bug |
|---|---|
| `e14017a3` | Flags moms inversés Brendan↔May |
| `df9c0d2a` | **HOTFIX portes** — iter10 avait écrasé 5 opcodes valides (`opendoor`, `closedoor`, `waitdooranim`, `faceplayer`, `turnobject`) avec stubs no-op (= bulk-add ts dupes) |
| `9fc529ec` | INTRO_STATE 6→7, HOUSES_STATE 1→2 (cascading triggers cross-house), spawn gender-aware FEMALE→x=14, warpId parseInt |
| `67e89a11` | Mom position (4,5) FACE_UP overlay + `audit-registry-dupes.mjs` |
| `9b4804b9` | **Title screen part 1** — runtime `_resolveTileNum()` resolve string constants (= `VERSION_BANNER_RIGHT_TILEOFFSET`) au lieu fallback 0 |
| `78bcce7f` | **Title screen part 2** — patch missing `sStartCopyrightBannerAnimTable` (= extracteur ne capture pas designated initializer C `[INDEX] = value`) |
| `b3a0ee65` | Audit tooling : `audit-missing-anim-tables.mjs` |
| `c7d63fca` | **Z-axis intro Manectric/Brendan** — implement 1:1 décomp `BuildSpritePriorities` + `SortSprites` (= subpriority field on OAM + sprite, pass through CreateSprite/CreateSpriteFromTemplate, sort comparator `subpri \| (priority<<8)`) |
| `6a6a3976` | **Warps Bourg-en-Vol décalés** — `executeWarp` Phase 3 avait `if (warp.x >= 0)` AVANT `if (warpId valid)`. Map.json warps ont x/y >= 0 toujours → on plaçait player à position SOURCE au lieu de DEST. Fix : check warpId d'abord (= 1:1 décomp `SetPlayerCoordsFromWarp` overworld.c:603) |
| `d81fe8bf` | **New game intro broken** — decideBootMode default branch n'appelait pas `gameState.reset()` avant NewGameInit. Si user avait save `?nointro` avec INTRO_STATE=7, ça polluait les coord triggers post-Birch (= no truck cinematic, no Mom dialog). Fix : reset save d'abord, préserve playerName/gender |
| `0597290a` | **Stairs poussent UP au lieu de DOWN** — exit kind `non_anim` walkait dans `gPlayerAvatar.facing` (= 1:1 littéral). Pour stairs UP, facing=NORTH → walk NORTH off-map. Fix : force DIR_SOUTH au exit (= "trou d'escalier" behavior, push DOWN) |

### Audit infrastructure (= futureproof tooling)

- `scripts/audit-registry-dupes.mjs` : detect Map.set overwrite dupes
- `scripts/audit-missing-anim-tables.mjs` : detect missing SPRITE_ANIM_TABLES
- `scripts/audit-fullgame-{opcodes,specials}.mjs` : 100% main-story coverage
- `scripts/audit-{early,extended,fullgame}-game-*.mjs` : tiered coverage
- `package.json` aliases : `npm run audit:dupes` / `audit:opcodes` / `audit:specials` / `audit:all`

Current scan results : **287 opcodes + 130 specials registered, 0 dupes,
100% main-story (70 maps) coverage**.

## ❌ Bugs restants signalés par user (5)

### 1. Vigoroth déménageurs 48x48 → garbage rendering

**Symptôme** : Les déménageurs Vigoroth dans Brendan's House 1F sont rendus
en garbage tiles malgré qu'on supporte les sprites 48x48.

**Investigation à faire** :
- Vérifier `OBJ_EVENT_GFX_VIGOROTH_CARRYING_BOX` + `OBJ_EVENT_GFX_VIGOROTH_FACING_AWAY` dans `object-event-graphics.ts`
- Check tile assignment + palette bank pour 48x48 special-case
- Comparer avec the truck cinematic which uses similar 48x48 sprite (Vigoroth déjà fonctionnel là-bas)
- Possible : LOAD_SPRITE_GFX manquant ou tile cache collision

### 2. Truck SE timing décalé

**Symptôme** : "Le bruit du camion est toujours décalé c'est frustrant".
SE 1 puis SE 2 doivent jouer **direct, sans silence**. Actuellement il y a
un gap.

**Investigation à faire** :
- Check les logs spam `[playse]` pendant cinématique camion
- Vérifier `playsewithpan` opcode (= alias to playse, peut-être y a un délai côté audio engine)
- Audio engine `m4a` SE slot management — peut-être SE2 attend la fin de SE1 alors qu'il devrait override

### 3. Caisse camion coupée visuellement

**Symptôme** : "La caisse en bas dans le camion coupée en deux ne ne l'est
pas, c'est ce qu'il y a au dessus (haut d'une autre boite) qui la cache
(un pixel visible lors du trajet)".

**Investigation à faire** :
- Check OAM rendering pour subsprite 48x48 boxes pendant truck cinematic
- 1-pixel offset visible during transit suggère un sub-tile render issue
- Maybe priority/clipping différent entre frames de boxes

### 4. WallClock UI freeze

**Symptôme** : "L'horloge nous freeze, dans notre ancien code on avait mis
un skip qui affiche l'heure du PC au lieu de la mettre manuellement (ce
serait toujours 1:1 dans le concept : l'heure du PC simule l'heure du jeu,
la pile et l'internal clock)".

**Investigation à faire** :
- Find `StartWallClock` / `Special_ViewWallClock` in code
- Vérifier our specials-registry impl (= il y avait un stub skip dans
  un ancien commit, peut-être perdu)
- Use `new Date()` to populate gSaveBlock2.timeOfDay or similar
- 1:1 conceptuel : PC clock = in-game RTC

### 5. (Mentionné nuit) Battle BG / sprite Z polish

Quelques scènes battle pourraient bénéficier de plus polish (= shake on
damage, real HP bars, EXP gain). Pas urgent.

## 🎯 Plan que j'avais (= AVANT user reports)

J'allais reprendre :
- **EXP gain + level-up** post-victoire (= experience-tables.json déjà
  available, formule Gen 3 `(baseExp × level) / 7`)

Mais user a priorité absolue sur les 5 bugs visuels ci-dessus.

## 📂 Fichiers clés à read au boot post-compaction

```
memory/session-2026-05-09-status.md          # ← CE FICHIER (= entry point)
memory/audit-2026-05-09-start-of-game-deep.md # Audit Opus 1 (= 5 issues found)
memory/audit-2026-05-09-followup.md           # Audit Opus 2 (= follow-up analysis)
memory/upd2-final-snapshot.md                 # Cumulé nuit (= 56 commits)
memory/upd2-troubleshooting.md                # Audit workflow + métriques
```

## 🧪 Tests verified live (= état actuel)

```
http://localhost:5173/?nointro=1
```

- ✅ Title screen : "POKEMON / VERSION EMERAUDE / APPUYEZ SUR START / © 2005 GAMEFREAK inc."
- ✅ Warps Brendan/May : entrent dans la bonne maison à la bonne position (8, 8)
- ✅ Stairs 1F→2F : player monte + push DOWN dans bedroom (= n'est plus poussé en haut off-map)
- ✅ Z-axis intro Manectric : Brendan derrière Manectric pendant circular run
- ✅ Doors animations : opendoor/closedoor/waitdooranim restorées (= iter10 stubs no-op supprimés)

```
http://localhost:5173/?truck=1
```

- ✅ Truck cinematic : player exit truck, MAMAN dialog "MAMAN: PLAYER, on est là, chouchou!"

## ⚠️ Workflow pour future sessions

1. **AVANT bulk-add d'opcodes/specials** : `npm run audit:all` pour confirm 0 dupes
2. **AVANT changes systémique** (= map-loader, decomp-runtime) : run live test minimal
3. **Pour les warps** : `warp.x/y` est SOURCE position, pas dest. Use `getPlayerCoordsFromWarp(destHeader, warpId)` first
4. **Pour les stairs/holes** : exit task force DIR_SOUTH (= 1:1 user-described behavior)
5. **For new game flow** : reset save before NewGameInit (= 1:1 décomp Sav2_ClearSetDefault)

## 💛 Note user

User explicit : "Enorme session, merci". Game runs better than ever.
Visible bugs reduced from ~7 to 4. Title screen et warps complètement
fixés (= les bugs qui cassaient le plus l'experience).

NE PAS push to main yet. User wants review first.
