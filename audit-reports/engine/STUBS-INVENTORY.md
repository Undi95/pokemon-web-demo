# Inventaire mécanique des stubs / no-op / TODO — moteur & hors-moteur

> Généré le **2026-07-16** · régénération : `node scripts/audit-engine-stubs.cjs` · **LECTURE SEULE** (aucun code édité).
> Scanne `src/` + `harness/` (.ts). Déterministe, écrase ce rapport à chaque run.

**Total findings : 1786** — MOTEUR : **205** · HORS-MOTEUR : **1581** · fichiers touchés : 199 / 376 scannés.

| Catégorie | Total | MOTEUR | HORS-MOTEUR |
|---|--:|--:|--:|
| `wireTodo` | 219 | 0 | 219 |
| `silent-default` | 2 | 2 | 0 |
| `transpiler-todo` | 320 | 0 | 320 |
| `marker` | 1153 | 191 | 962 |
| `warnOnce` | 4 | 0 | 4 |
| `ts-suppress` | 32 | 2 | 30 |
| `throw-stub` | 0 | 0 | 0 |
| `empty-body` | 10 | 0 | 10 |
| `console-miss` | 46 | 10 | 36 |

**Lecture des catégories** — `wireTodo` = symbole transpilé non câblé (throw à l'appel). `silent-default` = branche `default:` d'un switch de registres qui avale une valeur (break/return trivial). `transpiler-todo` = annotation `TRANSPILER-TODO` du transpileur c→ts (dette systémique, cf. §faux positifs). `marker` = mot-clé TODO/FIXME/XXX/STUB/stub/no-op/not implemented/non porté/non implémenté/unsupported/placeholder. `empty-body` = HEURISTIQUE (faux positifs possibles).

## Règle de classification appliquée

- **MOTEUR** = tout `harness/**` + fichiers `src/` (top-level) de la liste du plan : `sprite.ts, window.ts, text.ts, palette.ts, text_window.ts, main.ts, task.ts, gpu_regs.ts, string_util.ts, international_string_util.ts, dynamic_placeholder_text_util.ts, menu.ts, menu_helpers.ts, list_menu.ts, scanline_effect.ts, trig.ts, util.ts, random.ts, sound.ts`. (`dma3_manager.ts`, `io_reg.ts`, `malloc.ts`, `decompress.ts` n'existent pas comme fichiers `src/` dédiés — leurs symboles vivent dans `harness/runtime/*` et `harness/gba/*`, déjà MOTEUR.)
- **Extensions** (au-delà de la liste littérale, unambigument moteur) : `src/blit.ts` (primitive gfx), `src/engine/decomp-impls/**` (impl de sprite.c), `src/engine/wire-todo.ts` (sentinelle).
- **HORS-MOTEUR** = tout le reste de `src/`.
- **Nuance de priorité** : au sein de `harness/**`, `runtime/`, `gba/`, `m4a/`, `boot/` = moteur/runtime livré (prio haute) ; `devtools/` et `scenes/` = OUTILLAGE debug (harness, non 1:1, non livré) — findings réels mais prio basse.

---

## SECTION MOTEUR — 205 findings sur 40 fichiers

### Récap par fichier

| Fichier | Total | wireTodo | silent-def | transp-todo | marker | warnOnce | ts | throw | empty | cons-miss |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `harness/runtime/decomp-globals.ts` | **29** |  |  |  | 28 |  |  |  |  | 1 |
| `harness/devtools/registrations.ts` | **19** |  |  |  | 18 |  |  |  |  | 1 |
| `harness/runtime/decomp-runtime.ts` | **19** |  | 1 |  | 18 |  |  |  |  |  |
| `src/window.ts` | **17** |  |  |  | 17 |  |  |  |  |  |
| `src/text.ts` | **14** |  |  |  | 14 |  |  |  |  |  |
| `harness/scenes/TestOverworldScene.ts` | **13** |  |  |  | 13 |  |  |  |  |  |
| `harness/runtime/gba-global-scope.ts` | **11** |  |  |  | 11 |  |  |  |  |  |
| `src/list_menu.ts` | **10** |  |  |  | 10 |  |  |  |  |  |
| `harness/devtools/dev-bytevm-tools.ts` | **6** |  |  |  | 6 |  |  |  |  |  |
| `harness/runtime/decomp-bridge.ts` | **5** |  |  |  | 5 |  |  |  |  |  |
| `harness/runtime/decomp-helpers.ts` | **5** |  |  |  | 5 |  |  |  |  |  |
| `src/sprite.ts` | **5** |  |  |  | 5 |  |  |  |  |  |
| `harness/devtools/devtools-panel.ts` | **4** |  |  |  | 3 |  |  |  |  | 1 |
| `harness/runtime/decomp-asset-net.ts` | **4** |  |  |  | 4 |  |  |  |  |  |
| `src/menu_helpers.ts` | **4** |  |  |  | 4 |  |  |  |  |  |
| `harness/boot/boot-mode.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `harness/boot/intro-asset-loader.ts` | **3** |  |  |  | 1 |  |  |  |  | 2 |
| `harness/devtools/panel-v2.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `harness/scenes/BirchRuntimeScene.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `harness/scenes/DebugOverlayScene.ts` | **3** |  |  |  | 1 |  |  |  |  | 2 |
| `harness/boot/copyright-boot.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `harness/devtools/dev-bridge-audit-tools.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `harness/gba/phaser-bridge.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `harness/gba/png-loader.ts` | **2** |  |  |  | 1 |  |  |  |  | 1 |
| `src/sound.ts` | **2** |  |  |  | 1 |  | 1 |  |  |  |
| `harness/boot/intro-host.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `harness/devtools/dev-audit-tools.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `harness/devtools/dev-encounter-tools.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `harness/devtools/dev-scope.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `harness/devtools/registry.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `harness/gba/compositor.ts` | **1** |  |  |  |  |  |  |  |  | 1 |
| `harness/gba/palette.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `harness/m4a/audio-arbiter.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `harness/runtime/data-tables.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/decomp-impls/sprite-engine-impl.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/international_string_util.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/menu.ts` | **1** |  |  |  |  |  | 1 |  |  |  |
| `src/scanline_effect.ts` | **1** |  | 1 |  |  |  |  |  |  |  |
| `src/string_util.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/text_window.ts` | **1** |  |  |  |  |  |  |  |  | 1 |

### Détail par fichier

#### `harness/runtime/decomp-globals.ts` — 29 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 1705 | `*console.error*` — console.error(`[LoadCompressedSpriteSheet] ASSET MISSING : '${sheet.data}' (tag=${sheet.tag}) — tile data NOT in OBJ VR… |
| `marker` | 88 | `*no-op* · ¤comment` — // LoadOam : decomp-globals.ts a déjà sa version (no-op équivalent) — pas de re-export. |
| `marker` | 116 | `*no-op* · ¤comment` — // n'importe decomp-runtime qu'en `type` → ZÉRO cycle ESM. Plus aucune classe « no-op |
| `marker` | 185 | `*no-op* · ¤comment` — // 1:1 décomp src/sprite.c:SpriteCallbackDummy — no-op sprite callback. |
| `marker` | 189 | `*no-op*` — export function SpriteCallbackDummy(_sprite: unknown, _rt?: unknown): void { /* no-op */ } |
| `marker` | 281 | `*no-op*` — traceEntry.reason = `dest 0x${offset.toString(16)} out of VRAM range, no-op`; |
| `marker` | 346 | `*no-op* · ¤comment` — *  battle_intro.ts:536 `r.LoadBgTilemap?.()` = no-op silencieux (fn absente du runtime). */ |
| `marker` | 496 | `*stub,no-op* · ¤comment` — *  no-op silencieux — doctrine anti-stub, audit gfx-substrat 2026-07-02). */ |
| `marker` | 542 | `*TODO* · ¤comment` — // TODO LoadCompressedSpriteSheet(sSpriteSheet_TreesSmall) + LoadPalette(sTreesSmall_Pal, OBJ) |
| `marker` | 543 | `*TODO* · ¤comment` — // TODO CreateTreeSprites() — Phase 2 (= sprite OAM trees animés) |
| `marker` | 547 | `*no-op* · ¤comment` — // gReservedSpritePaletteCount = 8 → no-op chez nous (= alloc OBJ palette). |
| `marker` | 555 | `*no-op* · ¤comment` — // SCENE 2 STUBS (Phase 0b minimum viable — no-op pour ne pas crasher) |
| `marker` | 556 | `*TODO* · ¤comment` — // TODO Phase 0c : implementer 1:1 décomp src/intro.c |
| `marker` | 600 | `*stub* · ¤comment` — // 1:1 décomp intro.c:621-663 — table d'anims du joueur à vélo (le PÉDALAGE). Était un stub |
| `marker` | 732 | `*no-op* · ¤comment` — // Override le callback du template (FlygonLeftHalf no-op) pour le right half. |
| `marker` | 751 | `*no-op*` — return r.CreateTask(() => { /* no-op fallback */ }, 0); |
| `marker` | 791 | `*no-op* · ¤comment` — *  mode=1 : no-op (= pause cycling). |
| `marker` | 1067 | `*no-op* · ¤comment` — // cris d'anims étaient muets (no-op silencieux). Pan ignoré (même dette que |
| `marker` | 1179 | `*TODO* · ¤comment` — // TODO Phase 3 : implémenter pleinement Scene 3 avec preload + LZ77 + sprites. |
| `marker` | 1213 | `*no-op*` — export function FreeMonSpritesGfx(): void { /* no-op : pas de heap chez nous */ } |
| `marker` | 1228 | `*stub,no-op* · ¤comment` — // Length 256 max, retourne stub vide pour index inconnu (= no-op load). |
| `marker` | 1308 | `*no-op* · ¤comment` — *  Phase E fix : real impl (= était no-op qui laissait du garbage VRAM/tilemap |
| `marker` | 1444 | `*no-op* · ⚑legit-ctx · ¤comment` — *  (= no double-buffer), donc cette function est un no-op pour API compat |
| `marker` | 1447 | `*no-op* · ¤comment` — // No-op : compositor reads sprite OAM directly each frame. Foundation |
| `marker` | 1457 | `*no-op* · ¤comment` — *  écrit OBJ VRAM immédiatement). No queue → no-op. Foundation ready si |
| `marker` | 1460 | `*no-op* · ¤comment` — // No-op : sprite tile copies are eager (immediate write to objVram). |
| `marker` | 1464 | `*no-op*` — export function EnableInterrupts(_flag: number): void { /* no-op */ } |
| `marker` | 1766 | `*non-porté*` — console.error(`[LoadCompressedSpriteSheet] sheet tag='${tagStr}' a une data VIDE (asset non porté ?) — chargement refus… |
| `marker` | 2348 | `*TODO* · ¤comment` — // transparents (notre BG renderer skip idx 0 = GBATEK behavior 4bpp). TODO |

#### `harness/devtools/registrations.ts` — 19 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 209 | `*console.warn*` — console.warn('[devtools v2] déjà en combat — boot ignoré'); return; |
| `marker` | 267 | `*placeholder*` — { name: 'map', kind: 'string', placeholder: 'MAP_LITTLEROOT_TOWN' }, |
| `marker` | 268 | `*placeholder*` — { name: 'x', kind: 'number', placeholder: 'x' }, |
| `marker` | 269 | `*placeholder*` — { name: 'y', kind: 'number', placeholder: 'y' }, |
| `marker` | 314 | `*no-op*` — try { if (dn?.clear) await dn.clear(); } catch { /* noop */ } |
| `marker` | 316 | `*no-op*` — try { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); } catch { /* noop */ } |
| `marker` | 398 | `*placeholder*` — { name: 'species', kind: 'string', placeholder: '288 ou SPECIES_…', default: '288' }, |
| `marker` | 410 | `*placeholder*` — args: [{ name: 'id', kind: 'number', placeholder: '333' }], |
| `marker` | 431 | `*placeholder*` — args: [{ name: 'move', kind: 'string', placeholder: 'MOVE_MIST ou id' }], |
| `marker` | 459 | `*placeholder*` — args: [{ name: 'label', kind: 'string', placeholder: 'EventScript_PC' }], |
| `marker` | 470 | `*placeholder*` — args: [{ name: 'name', kind: 'string', placeholder: 'HealPlayerParty' }], |
| `marker` | 480 | `*placeholder*` — { name: 'var', kind: 'string', placeholder: 'VAR_0x8004' }, |
| `marker` | 481 | `*placeholder*` — { name: 'val', kind: 'number', placeholder: '0' }, |
| `marker` | 508 | `*placeholder*` — args: [{ name: 'id', kind: 'number', default: 4, placeholder: '4 = MULTI_CONTEST_TYPE' }], |
| `marker` | 766 | `*placeholder*` — { name: 'cb', kind: 'number', placeholder: 'charBase (0-3)', default: 0 }, |
| `marker` | 767 | `*placeholder*` — { name: 'id', kind: 'number', placeholder: 'tile id' }, |
| `marker` | 794 | `*placeholder*` — { name: 'rgb', kind: 'string', placeholder: '#FF00FF' }, |
| `marker` | 851 | `*placeholder*` — search.placeholder = `🔍 filtrer ${entries.length}…`; |
| `marker` | 1092 | `*placeholder*` — args: [{ name: 'seed', kind: 'number', placeholder: '0' }], |

#### `harness/runtime/decomp-runtime.ts` — 19 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `silent-default` | 833 | `*return 0* · switch@778: switch (reg) {` — default: |
| `marker` | 40 | `*no-op* · ¤comment` — // remplacent les anciens accès `globalThis.__sprite.X` vestigiaux (= classe « no-op silencieux »). |
| `marker` | 234 | `*stub* · ¤comment` — *  qu'on ne simule pas. Conservé comme stub pour matcher la struct C. */ |
| `marker` | 337 | `*no-op* · ¤comment` — *  callback2 : la fonction appelée chaque frame. null = no-op. |
| `marker` | 338 | `*stub,no-op* · ¤comment` — *  vblankCallback : appelée en VBlank (notre engine = stub no-op pour l'instant). */ |
| `marker` | 589 | `*no-op*` — function TaskDummy(_task: DecompTask): void { /* no-op */ } |
| `marker` | 683 | `*no-op* · ¤comment` — *  l'ordre décomp ; le runtime ne les rejoue PAS (no-op via ce flag). Sur les |
| `marker` | 1567 | `*placeholder* · ¤comment` — // (CreateSpriteInline supprimé — B3 2026-06-22 : les call-sites (battle anims placeholders |
| `marker` | 1617 | `*no-op* · ¤comment` — *  Notre engine : no-op pour l'instant (les VBlank effects passent par tickFixed |
| `marker` | 1919 | `*no-op* · ¤comment` — // AVANT ce branchement, StartSpriteAnim était un NO-OP pour ces sprites (early-return |
| `marker` | 1931 | `*no-op* · ¤comment` — // sprite sans `.anims` → no-op (la state-machine legacy spriteAnimStates est SUPPRIMÉE ; |
| `marker` | 1970 | `*no-op* · ¤comment` — *  tickFixed le re-appelle en fallback no-op. */ |
| `marker` | 1981 | `*no-op* · ¤comment` — *  son slot BuildOamBuffer ; tickFixed le re-appelle en fallback no-op. */ |
| `marker` | 2009 | `*stub* · ¤comment` — *    8. gMain.vblankCallback?.()    — stub VBlank effects (scanline, etc.) |
| `marker` | 2084 | `*no-op* · ¤comment` — //    scenes pré-overworld (intro/title/main_menu/birch/naming) → no-op. |
| `marker` | 2129 | `*no-op* · ¤comment` — //    (no-op si un CB2 owner comme MainCB2_Overworld l'a déjà appelé ce frame). |
| `marker` | 2139 | `*no-op* · ¤comment` — //    (no-op si un CB2 owner l'a déjà appelé ce frame via buildOamBuffer()). |
| `marker` | 2194 | `*no-op* · ¤comment` — // Devtools : auto-pause condition poll (= dev.pauseAt). Cheap noop si non-armé. |
| `marker` | 2201 | `*no-op* · ¤comment` — // capter le transitoire "spawn trop haut au warp". Cheap no-op si non-armé. |

#### `src/window.ts` — 17 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 727 | `*no-op* · ¤comment` — *   - direction 2 : `break` (no-op). |
| `marker` | 772 | `*no-op* · ¤comment` — // direction === 2 (ou autre) : 1:1 décomp `case 2: break;` → no-op. |
| `marker` | 852 | `*no-op* · ¤comment` — *  (call-sites en `rt.SetBgAttribute?.()` = no-op silencieux) → fond de la scène |
| `marker` | 884 | `*non-porté* · ¤comment` — *  chemin registre DISPCNT (Sync* non porté). Écart doctrinal connu (audit |
| `marker` | 910 | `*non-porté* · ¤comment` — *  VISIBLE du décomp non portés (harness sans ces attributs ; appelants passent des bg valides). */ |
| `marker` | 1076 | `*non-porté* · ¤comment` — *  wrapper de SetBgAffineInternal. INERTE (appelant rayquaza_scene non porté). */ |
| `marker` | 1406 | `*no-op* · ¤comment` — *  réassignable), et la copie se fait via CopyBgTilemapBufferToVram → no-op net. |
| `marker` | 1411 | `*no-op* · ¤comment` — /* no-op : le tilemap est la vue VRAM persistante du compositor (cf. mail.ts:1018) */ |
| `marker` | 1415 | `*no-op* · ¤comment` — *  Pendant du SetBgTilemapBuffer ci-dessus → no-op. */ |
| `marker` | 1417 | `*no-op* · ¤comment` — /* no-op : pendant de SetBgTilemapBuffer */ |
| `marker` | 1422 | `*no-op* · ¤comment` — *  frame (cf. CopyBgTilemapBufferToVram no-op) → modifs auto-prises = no-op |
| `marker` | 1425 | `*no-op* · ¤comment` — /* no-op : compositor reads tilemap each frame */ |
| `marker` | 1431 | `*no-op* · ¤comment` — *  tilemap chaque frame (cf. ScheduleBgCopyTilemapToVram = no-op) → aucun registre |
| `marker` | 1432 | `*no-op* · ¤comment` — *  à vider = no-op net 1:1. */ |
| `marker` | 1434 | `*no-op* · ¤comment` — /* no-op : pas de registre de copies planifiées (compositor lit tilemap chaque frame) */ |
| `marker` | 1442 | `*no-op* · ¤comment` — *  no-op net 1:1. */ |
| `marker` | 1444 | `*no-op* · ¤comment` — /* no-op : chargement tileset async direct, pas de pool de buffers temp */ |

#### `src/text.ts` — 14 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 66 | `*placeholder* · ¤comment` — /** Tokens placeholder de NOTRE format OW → `PLACEHOLDER_ID_*` (1:1 décomp). |
| `marker` | 69 | `*placeholder* · ¤comment` — *  `{LV_2}`…) NE sont PAS des placeholders → restent dans les segments littéraux |
| `marker` | 89 | `*placeholder* · ¤comment` — * Calqué sur `encodeTemplate` (battle-message.ts) : on scanne les tokens placeholder |
| `marker` | 113 | `*placeholder*` — flushSeg(i);                       // encode le littéral avant le placeholder |
| `marker` | 119 | `*placeholder* · ¤comment` — // {DYNAMIC <n>} → [CHAR_DYNAMIC(0xF7), n] : placeholder DYNAMIQUE 1:1 |
| `marker` | 131 | `*placeholder* · ¤comment` — // Token non-placeholder ({COLOR}/{LV_2}/…) : reste dans le segment → géré |
| `marker` | 164 | `*placeholder* · ¤comment` — * 0xFD placeholder + id). PAS un chemin 1:1 décomp — outil d'inspection seulement. |
| `marker` | 192 | `*placeholder*` — if (b === PLACEHOLDER_BEGIN) { i += 2; continue; } // placeholder (déjà résolu en principe) |
| `marker` | 409 | `*non-porté* · ¤comment` — *  (GetGlyphWidth_Braille = braille.c non porté ; FONT_BRAILLE jamais mesuré OW |
| `marker` | 489 | `*placeholder* · ¤comment` — * placeholders (gStringVar1-3 + CHAR_DYNAMIC), EXTRA_SYMBOL (0x100\|sym), KEYPAD_ICON, |
| `marker` | 522 | `*placeholder* · ¤comment` — // 1:1 décomp : walk d'un buffer placeholder (gStringVarN / dynamic ptr). |
| `marker` | 1036 | `*no-op* · ¤comment` — // déjà rempli PIXEL_FILL(1) → blanc-sur-blanc = no-op visuel. L'avance curseur |
| `marker` | 1138 | `*placeholder*` — if (b === 0xFD \|\| b === 0xFC) { i++; continue; }        // placeholders/ctrl (1 arg min) |
| `marker` | 1756 | `*no-op*` — return 1;  // 1:1 l.1606 : RestoreTextColors (no-op : état local) ; return 1. |

#### `harness/scenes/TestOverworldScene.ts` — 13 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 545 | `*no-op* · ¤comment` — // bytecode + les handlers installés. Idempotent (no-op si déjà chargé). |
| `marker` | 748 | `*no-op* · ¤comment` — //  UpdatePaletteFade en FALLBACK idempotent (no-op si déjà appelés ici ; |
| `marker` | 775 | `*no-op,non-porté* · ¤comment` — // HideMapNamePopUpWindow() — non porté (no-op). |
| `marker` | 809 | `*no-op* · ¤comment` — // + tickSpriteAnims + tickAllAffineAnims. Idempotent (tickFixed no-op après). |
| `marker` | 842 | `*no-op* · ¤comment` — // ── UpdatePaletteFade (overworld.c:1473). Idempotent (tickFixed no-op après). ── |
| `marker` | 915 | `*no-op* · ¤comment` — // re-init field et reprend exactement où il était. No-op si aucun |
| `marker` | 1064 | `*no-op* · ¤comment` — // déjà location juste (ApplyCurrentWarp en Phase 3 d'executeWarp) → no-op. |
| `marker` | 1217 | `*no-op* · ¤comment` — // puzzle config + reset gate orientations à VAR_TEMP_0. No-op si current |
| `marker` | 1325 | `*no-op* · ¤comment` — // boucle sur metatiles trouvent rien, no-op. Safe à call inconditionnel. |
| `marker` | 1494 | `*no-op* · ¤comment` — // fenêtres plein-écran, blend OW 2e-cible no-op) + (ré)active les 4 BG (ShowBg) |
| `marker` | 1657 | `*TODO* · ¤comment` — // 'secret_base' : SE handled dans leur task spécifique (= TODO port). |
| `marker` | 1992 | `*no-op* · ¤comment` — //   - OnFrame poll silent no-op sur la new map. |
| `marker` | 2003 | `*no-op* · ¤comment` — // no-op'd faute de scripts chargés. Route101 n'a pas d'OnLoad (= cf. |

#### `harness/runtime/gba-global-scope.ts` — 11 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 141 | `*stub* · ¤comment` — // n'a pas vraiment de HBlank, donc on stub HBlank et clear VBlank only. |
| `marker` | 144 | `*no-op* · ¤comment` — // SetHBlankCallback : pas implémenté côté engine, no-op safe. |
| `marker` | 147 | `*stub,no-op*` — SetHBlankCallback: (_cb: (() => void) \| null) => { /* no-op stub */ }, |
| `marker` | 461 | `*no-op* · ⚑legit-ctx · ¤comment` — // safe stubs (= no-op ou FALSE) pour éviter les ReferenceError. |
| `marker` | 463 | `*no-op* · ⚑legit-ctx` — CloseLink: (): void => { /* no-op : pas de wireless link en web */ }, |
| `marker` | 473 | `*no-op* · ⚑legit-ctx · ¤comment` — // REG_IE/REG_IME stubs — les writes sont no-op côté web (= pas de hardware |
| `marker` | 477 | `*stub,no-op*` — DisableInterrupts: (_flags: number): void => { /* no-op web stub */ }, |
| `marker` | 525 | `*no-op* · ¤comment` — // traduire 1:1 en JS. Ces helpers no-op runtime → si un de ces appels est |
| `marker` | 529 | `*stub,no-op* · ¤comment` — // No-op stub. Real impl would write `_value` to `_addr` (memory ptr). |
| `marker` | 532 | `*stub,no-op* · ¤comment` — // No-op stub. Real impl would do `*addr op= rhs`. |
| `marker` | 534 | `*stub*` — MEM_PRE_DEC: (_expr: unknown): number => 0,  // Lossy stub — returns 0. |

#### `src/list_menu.ts` — 10 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 244 | `*no-op* · ¤comment` — *  CopyWindowToVram. No-op tant que le rendu window n'est pas porté |
| `marker` | 254 | `*no-op* · ¤comment` — /** Wiré à l'étape 2 (rendu window 1:1). Tant que null → no-op (déféré |
| `marker` | 477 | `*no-op*` — function ListMenuDummyTask(_taskId: number): void { /* noop, 1:1 décomp */ } |
| `marker` | 1033 | `*non-porté* · ¤comment` — // BRANCHEMENT d'un écran consommateur (PC/shop NON portés → pas de consommateur |
| `marker` | 1086 | `*no-op*` — function Task_RedOutlineCursor(_taskId: number): void { /* noop, 1:1 :1216 */ } |
| `marker` | 1090 | `*no-op*` — function Task_RedArrowCursor(_taskId: number): void { /* noop, 1:1 :1377 */ } |
| `marker` | 1194 | `*no-op* · ¤comment` — // 1:1 :1360 Free(data->subspritesPtr) — no-op (GC JS). |
| `marker` | 1352 | `*non-porté* · ¤comment` — // l'écran = A/B user au branchement écran consommateur (non portés). 1:1 |
| `marker` | 1462 | `*no-op* · ¤comment` — // juste tile+flip, pas de boucle. StartSpriteAnim est no-op sur sprite |
| `marker` | 1637 | `*non-porté* · ¤comment` — // auto-géré (utilisé par mystery_gift.c, NON porté → pas de consommateur |

#### `harness/devtools/dev-bytevm-tools.ts` — 6 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 832 | `*no-op* · ¤comment` — *  setvar marqueur, avec species=SPECIES_NONE(0) → don no-op → party count INCHANGÉ |
| `marker` | 962 | `*stub* · ¤comment` — *  PETALBURG_CITY ; selectapproachingtrainer→gSelectedObjectEvent.index = getter(stub 0) ; |
| `marker` | 979 | `*stub* · ¤comment` — // selectapproachingtrainer → gSelectedObjectEvent.index = GetCurrentApproachingTrainerObjectEventId() (stub 0) |
| `marker` | 994 | `*stub*` — const details = { 'checkitemtype POKE_BALL → POCKET_POKE_BALLS(2)': pocketBall, 'checkitemtype POTION → POCKET_ITEMS(1)… |
| `marker` | 1000 | `*stub* · ¤comment` — *  VAR_RESULT + save block) ; buffercontestname (STR_VAR_1) ; checkpcitem (stub 0) ; ALIGNEMENT |
| `marker` | 1023 | `*stub* · ¤comment` — // checkpcitem item, qty → VAR_RESULT=0 (stub) |

#### `harness/runtime/decomp-bridge.ts` — 5 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 122 | `*placeholder* · ¤comment` — // Ces macros écrivent une séquence de placeholder bytes dans textVar (= un buffer |
| `marker` | 199 | `*no-op* · ¤comment` — /* sinon : no-op (les pointeurs JS abstraits ne sont pas copiables) */ |
| `marker` | 324 | `*no-op* · ¤comment` — /* sinon : no-op (les pointeurs JS abstraits ne sont pas remplissables) */ |
| `marker` | 477 | `*placeholder* · ¤comment` — // Pokenav (= NotImpl placeholders) |
| `marker` | 507 | `*TODO* · ¤comment` — /** Liste des helpers qui throw NotImplemented (= TODO list, à porter en priorité). |

#### `harness/runtime/decomp-helpers.ts` — 5 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 240 | `*stub* · ¤comment` — // Re-export audio stub from decomp-globals so auto-generated callbacks can import it. |
| `marker` | 260 | `*stub* · ¤comment` — /** 1:1 décomp `EnableInterrupts(mask)` — stub (pas d'émulation IRQ). */ |
| `marker` | 262 | `*stub,no-op* · ¤comment` — // no-op stub |
| `marker` | 265 | `*stub* · ¤comment` — /** 1:1 décomp `DisableInterrupts(mask)` — stub. */ |
| `marker` | 267 | `*stub,no-op* · ¤comment` — // no-op stub |

#### `src/sprite.ts` — 5 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 560 | `*no-op* · ¤comment` — *  `sprite.affineMode`/`matrixNum` (≠ `sprite->oam.*` du décomp). No-op pour les sprites |
| `marker` | 746 | `*no-op* · ¤comment` — *  No-op chez nous : compositor lit rt.gba.oam[] direct chaque frame. */ |
| `marker` | 748 | `*no-op* · ¤comment` — // No-op : pas de double-buffer (oamBuffer → OAM) chez nous. |
| `marker` | 880 | `*no-op* · ¤comment` — *  appelé via `__sprite.FreeSpriteTilesByTag` qui était UNDEFINED (= no-op silencieux latent). */ |
| `marker` | 1449 | `*no-op* · ¤comment` — // `rt.gSprites[obj]` rendait undefined → no-op SILENCIEUX (flèches pokenav_list |

#### `harness/devtools/devtools-panel.ts` — 4 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 511 | `*console.warn*` — console.warn('[devtools] déjà en combat — boot ignoré'); return; |
| `marker` | 585 | `*placeholder*` — <input id="dvt-mv-id" placeholder="MOVE_MIST / id" /> |
| `marker` | 618 | `*placeholder*` — <input id="dvt-film-n" placeholder="frames (12)" style="width:72px" /> |
| `marker` | 619 | `*placeholder*` — <input id="dvt-film-e" placeholder="1/N rAF (2)" style="width:72px" /> |

#### `harness/runtime/decomp-asset-net.ts` — 4 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 320 | `*no-op*` — try { localStorage.removeItem(MANIFEST_KEY); } catch { /* noop */ } |
| `marker` | 321 | `*no-op*` — if (_hasCaches) caches.delete(CACHE_NAME).catch(() => { /* noop */ }); |
| `marker` | 347 | `*no-op*` — if (_hasCaches) await caches.delete(CACHE_NAME).catch(() => { /* noop */ }); |
| `marker` | 352 | `*no-op*` — try { localStorage.removeItem(MANIFEST_KEY); } catch { /* noop */ } |

#### `src/menu_helpers.ts` — 4 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 14 | `*non-porté* · ⚑legit-ctx · ¤comment` — *    fourni par engine ; non porté ici. |
| `marker` | 237 | `*non-porté* · ¤comment` — // Avant : non porté → chaque écran re-câblait un dispatch yes/no à la main. |
| `marker` | 247 | `*no-op*` — let sYesNo: YesNoFuncTable = { yesFunc: () => { /* noop */ }, noFunc: () => { /* noop */ } }; |
| `marker` | 294 | `*no-op*` — let sMessageNextTask: (task: DecompTask) => void = () => { /* noop */ }; |

#### `harness/boot/boot-mode.ts` — 3 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 138 | `*placeholder* · ¤comment` — *     Sinon : default 'PLAYER' / MALE (= 1:1 décomp default placeholder). |
| `marker` | 526 | `*no-op* · ⚑legit-ctx · ¤comment` — // devient un no-op tant que le latch est ON. La SRAM existante est donc |
| `marker` | 576 | `*placeholder* · ¤comment` — // Default identity : "PLAYER" / MALE (= 1:1 décomp placeholder pre-Birch). |

#### `harness/boot/intro-asset-loader.ts` — 3 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 58 | `*console.warn*` — console.warn(`[intro-asset-loader] no ${binUrl}, fallback PNG canvas extraction`); |
| `console-miss` | 201 | `*console.warn*` — console.warn(`[intro-asset-loader] unknown ext for ${symbol}: ${source.ext}`); |
| `marker` | 280 | `*TODO* · ¤comment` — *  TODO Phase 2 : étendre l'extracteur intro-data.ts à intro_credits_graphics.c. */ |

#### `harness/devtools/panel-v2.ts` — 3 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 94 | `*no-op* · ¤comment` — // (no-op dès que ça tient), donc re-l'appeler ne « lutte » avec personne. |
| `marker` | 229 | `*placeholder*` — <input id="dv2-search" placeholder="🔍 filtrer les commandes… (Échap = vider)" autocomplete="off" spellcheck="false"/> |
| `marker` | 446 | `*placeholder*` — inp.placeholder = a.placeholder ?? `${a.label ?? a.name}${a.default !== undefined ? ` (${a.default})` : ''}`; |

#### `harness/scenes/BirchRuntimeScene.ts` — 3 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 34 | `*placeholder* · ¤comment` — *        → CB2_NewGame (= overworld welcome placeholder) |
| `marker` | 195 | `*no-op*` — const _VBlankCB_Birch: () => void = () => { /* no-op marker pour activer transfer */ }; |
| `marker` | 239 | `*placeholder* · ¤comment` — // déclenche la scene transition au lieu de run le placeholder welcome. |

#### `harness/scenes/DebugOverlayScene.ts` — 3 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 69 | `*console.warn*` — if (rt0?.gMain?.inBattle) { console.warn('[DebugOverlay] deja en combat — Numpad5 (rival) ignore'); return; } |
| `console-miss` | 117 | `*console.warn*` — if (rt0?.gMain?.inBattle) { console.warn("[DebugOverlay] deja en combat — ' (wild) ignore"); return; } |
| `marker` | 130 | `*no-op* · ¤comment` — // retour combat → (5,12) exact). Ce sync est donc un no-op en pratique ; il |

#### `harness/boot/copyright-boot.ts` — 2 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 37 | `*stub*` — function GameCubeMultiBoot_Init(_p: unknown): void { /* stub */ } |
| `marker` | 38 | `*stub*` — function GameCubeMultiBoot_Main(_p: unknown): void { /* stub */ } |

#### `harness/devtools/dev-bridge-audit-tools.ts` — 2 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 159 | `*TODO*` — '  unbridgedCalls()        : helpers callés mais ni bridgés ni définis (= TODO list)', |
| `marker` | 302 | `*stub*` — console.log('  unbridged (= need port or stub):', unbridged.slice(0, 30)); |

#### `harness/gba/phaser-bridge.ts` — 2 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 76 | `*no-op* · ¤comment` — *  Cette méthode reste pour API compatibility — no-op par sécurité. */ |
| `marker` | 78 | `*no-op* · ¤comment` — // No-op intentionnel. La texture sera cleanup par Phaser au scene shutdown. |

#### `harness/gba/png-loader.ts` — 2 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 215 | `*console.warn*` — console.warn(`[png-loader] ${binUrl} absent, fallback loadIndexedPngStrict (PNG indexé)`); |
| `marker` | 394 | `*unsupported*` — if (bitDepth !== 8 && bitDepth !== 4 && bitDepth !== 1) throw new Error(`PNG ${url}: bitDepth ${bitDepth} unsupported (… |

#### `src/sound.ts` — 2 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 658 | `*@ts-nocheck* · ¤comment` — // Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck) + le tick |
| `marker` | 530 | `*no-op* · ¤comment` — *  (gMPlay_PokemonCry NULL = déréférence 0 sur GBA, no-op de fait → garde.) */ |

#### `harness/boot/intro-host.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 81 | `*no-op* · ¤comment` — // Garde des références « used » pour les imports partagés avec GameScene (no-op runtime). |

#### `harness/devtools/dev-audit-tools.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 258 | `*placeholder* · ¤comment` — // Si pas de dev server avec ces endpoints, retourne placeholder. |

#### `harness/devtools/dev-encounter-tools.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 207 | `*no-op*` — try { PlayerFaceDirection(stand.dir); } catch { /* noop */ } |

#### `harness/devtools/dev-scope.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 1535 | `*no-op* · ¤comment` — *  runOneFrame (decomp-runtime.ts). Cheap no-op tant que l'OW n'est pas booté. */ |

#### `harness/devtools/registry.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 37 | `*placeholder*` — placeholder?: string; |

#### `harness/gba/compositor.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 600 | `*console.error*` — console.error( |

#### `harness/gba/palette.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 25 | `*stub* · ¤comment` — * stub dans decomp-globals.ts. |

#### `harness/m4a/audio-arbiter.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 16 | `*no-op* · ¤comment` — * pas deux navigateurs différents. No-op en build prod (import.meta.hot absent). |

#### `harness/runtime/data-tables.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 104 | `*placeholder* · ¤comment` — *  Skip ITEM_NONE (= placeholder décomp) et ITEM_B_USE_* (= virtual items |

#### `src/engine/decomp-impls/sprite-engine-impl.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 85 | `*no-op* · ¤comment` — // HandleBallAnimEnd). Semantique plateforme : anim no-op = finie immediatement |

#### `src/international_string_util.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 233 | `*placeholder* · ¤comment` — *  d'écrire dans `dest` (les callers passent `dest` comme placeholder — aliasing voulu, |

#### `src/menu.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 1078 | `*@ts-nocheck* · ¤comment` — // Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck). Rapatrié |

#### `src/scanline_effect.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `silent-default` | 225 | `*return 0* · switch@216: switch (regOffset) {` — default: return 0; |

#### `src/string_util.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 562 | `*no-op* · ¤comment` — *  No-op hors japonais (projet FR-only → jamais le chemin JPN, porté pour le miroir). */ |

#### `src/text_window.ts` — 1 finding(s) · MOTEUR

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 110 | `*console.warn*` — console.warn('[LoadMessageBoxGfx] gMessageBox_Pal not preloaded — fallback hardcoded grey palette'); |

---

## SECTION HORS-MOTEUR — 1581 findings sur 159 fichiers

### Récap par fichier

| Fichier | Total | wireTodo | silent-def | transp-todo | marker | warnOnce | ts | throw | empty | cons-miss |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `src/tv.ts` | **128** |  |  | 122 | 6 |  |  |  |  |  |
| `src/engine/script/specials-registry.ts` | **86** |  |  |  | 86 |  |  |  |  |  |
| `src/pokenav_conditions_gfx.ts` | **71** | 59 |  | 10 | 1 |  | 1 |  |  |  |
| `src/battle_script_commands.ts` | **59** |  |  |  | 57 |  | 1 |  |  | 1 |
| `src/pokenav_conditions.ts` | **58** | 14 |  | 42 | 1 |  | 1 |  |  |  |
| `src/battle_main.ts` | **52** |  |  |  | 51 |  | 1 |  |  |  |
| `src/pokenav_region_map.ts` | **47** | 39 |  | 6 | 1 |  | 1 |  |  |  |
| `src/pokenav_conditions_search_results.ts` | **43** | 27 |  | 14 | 1 |  | 1 |  |  |  |
| `src/pokenav_ribbons_list.ts` | **43** | 27 |  | 14 | 1 |  | 1 |  |  |  |
| `src/pokenav_ribbons_summary.ts` | **43** | 20 |  | 21 | 1 |  | 1 |  |  |  |
| `src/credits.ts` | **35** | 22 |  | 11 | 1 |  | 1 |  |  |  |
| `src/event_object_movement.ts` | **28** |  |  |  | 24 |  |  |  |  | 4 |
| `src/mail.ts` | **28** |  |  |  | 28 |  |  |  |  |  |
| `src/battle_controller_player.ts` | **25** |  |  |  | 24 |  |  |  |  | 1 |
| `src/overworld.ts` | **25** |  |  |  | 23 |  |  |  |  | 2 |
| `src/pokenav_main_menu.ts` | **25** | 3 |  | 15 | 6 |  | 1 |  |  |  |
| `src/battle_factory.ts` | **24** |  |  | 5 | 19 |  |  |  |  |  |
| `src/pokenav_menu_handler_gfx.ts` | **24** |  |  | 14 | 9 |  | 1 |  |  |  |
| `src/tileset_anims.ts` | **23** |  |  |  | 23 |  |  |  |  |  |
| `src/battle_message.ts` | **20** |  |  |  | 19 |  |  |  |  | 1 |
| `src/battle_util.ts` | **20** |  |  |  | 18 |  |  |  |  | 2 |
| `src/pokenav_match_call_gfx.ts` | **19** | 6 |  | 11 | 1 |  | 1 |  |  |  |
| `src/battle_pike.ts` | **18** |  |  |  | 18 |  |  |  |  |  |
| `src/battle_tent.ts` | **18** |  |  |  | 18 |  |  |  |  |  |
| `src/match_call.ts` | **18** |  |  | 17 |  |  | 1 |  |  |  |
| `src/scrcmd.ts` | **18** |  |  |  | 17 |  |  |  |  | 1 |
| `src/battle_anim.ts` | **17** |  |  |  | 10 | 4 |  |  |  | 3 |
| `src/ereader_helpers.ts` | **17** |  |  |  | 17 |  |  |  |  |  |
| `src/fieldmap.ts` | **16** |  |  |  | 14 |  |  |  |  | 2 |
| `src/item_menu.ts` | **16** |  |  |  | 16 |  |  |  |  |  |
| `src/battle_controllers.ts` | **15** |  |  |  | 15 |  |  |  |  |  |
| `src/engine/bag/bag-screen.ts` | **15** |  |  |  | 15 |  |  |  |  |  |
| `src/field_effect_helpers.ts` | **15** |  |  |  | 15 |  |  |  |  |  |
| `src/battle_palace.ts` | **14** |  |  |  | 14 |  |  |  |  |  |
| `src/field_specials.ts` | **14** |  |  |  | 12 |  |  |  | 2 |  |
| `src/main_menu.ts` | **12** |  |  |  | 9 |  | 2 |  | 1 |  |
| `src/mystery_event_script.ts` | **12** |  |  |  | 12 |  |  |  |  |  |
| `src/party_menu.ts` | **12** |  |  |  | 12 |  |  |  |  |  |
| `src/battle_controller_opponent.ts` | **11** |  |  |  | 10 |  |  |  |  | 1 |
| `src/battle_interface.ts` | **11** |  |  |  | 11 |  |  |  |  |  |
| `src/option_menu.ts` | **11** |  |  |  | 8 |  | 3 |  |  |  |
| `src/pokemon_storage_system.ts` | **10** |  |  |  | 8 |  |  |  | 1 | 1 |
| `src/engine/battle/script-interpreter.ts` | **9** |  |  |  | 9 |  |  |  |  |  |
| `src/evolution_scene.ts` | **9** |  |  |  | 8 |  |  |  |  | 1 |
| `src/pokenav_menu_handler.ts` | **9** | 1 |  | 5 | 2 |  | 1 |  |  |  |
| `src/reshow_battle_screen.ts` | **9** |  |  |  | 9 |  |  |  |  |  |
| `src/rotating_gate.ts` | **9** |  |  |  | 9 |  |  |  |  |  |
| `src/title_screen.ts` | **9** |  |  |  | 6 |  | 3 |  |  |  |
| `src/contest_effect.ts` | **8** |  |  |  | 4 |  |  |  | 4 |  |
| `src/engine/field/region-map.ts` | **8** |  |  |  | 7 |  |  |  |  | 1 |
| `src/intro.ts` | **8** |  |  |  | 6 |  | 2 |  |  |  |
| `src/pokeball.ts` | **8** |  |  |  | 8 |  |  |  |  |  |
| `src/battle_controller_player_partner.ts` | **7** |  |  |  | 6 |  |  |  |  | 1 |
| `src/battle_tv.ts` | **7** |  |  | 7 |  |  |  |  |  |  |
| `src/player_pc.ts` | **7** |  |  |  | 7 |  |  |  |  |  |
| `src/rtc.ts` | **7** |  |  |  | 7 |  |  |  |  |  |
| `src/start_menu.ts` | **7** |  |  |  | 7 |  |  |  |  |  |
| `src/wild_encounter.ts` | **7** |  |  |  | 7 |  |  |  |  |  |
| `src/battle_anim_throw.ts` | **6** |  |  |  | 6 |  |  |  |  |  |
| `src/battle_tower.ts` | **6** |  |  |  | 6 |  |  |  |  |  |
| `src/engine/battle/battle-decomp-loop.ts` | **6** |  |  |  | 5 |  |  |  |  | 1 |
| `src/field_control_avatar.ts` | **6** |  |  |  | 6 |  |  |  |  |  |
| `src/field_player_avatar.ts` | **6** |  |  |  | 6 |  |  |  |  |  |
| `src/naming_screen.ts` | **6** |  |  |  | 6 |  |  |  |  |  |
| `src/pokemon_summary_screen.ts` | **6** |  |  |  | 6 |  |  |  |  |  |
| `src/script.ts` | **6** |  |  |  | 4 |  |  |  |  | 2 |
| `src/battle_setup.ts` | **5** |  |  |  | 5 |  |  |  |  |  |
| `src/data/object_events/object_event_subsprites.ts` | **5** |  |  |  | 5 |  |  |  |  |  |
| `src/easy_chat.ts` | **5** |  |  |  | 5 |  |  |  |  |  |
| `src/pokemon_animation.ts` | **5** |  |  |  | 5 |  |  |  |  |  |
| `src/pokenav_list.ts` | **5** |  |  | 3 | 1 |  | 1 |  |  |  |
| `src/save.ts` | **5** |  |  |  | 4 |  | 1 |  |  |  |
| `src/battle_anim_effects_2.ts` | **4** |  |  |  | 3 |  |  |  |  | 1 |
| `src/data/decoration/header.ts` | **4** |  |  |  | 4 |  |  |  |  |  |
| `src/egg_hatch.ts` | **4** |  |  |  | 3 |  |  |  |  | 1 |
| `src/field_message_box.ts` | **4** |  |  |  | 4 |  |  |  |  |  |
| `src/pokenav_match_call_data.ts` | **4** | 1 |  |  | 2 |  | 1 |  |  |  |
| `src/pokenav_match_call_list.ts` | **4** |  |  | 2 | 1 |  | 1 |  |  |  |
| `src/battle_anim_effects_1b.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/battle_anim_effects_3.ts` | **3** |  |  |  | 2 |  |  |  | 1 |  |
| `src/battle_bg.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/battle_gfx_sfx_util.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/decoration_inventory.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/engine/battle/battle-sendout-anim.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/engine/battle/battle-sprites-data.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/engine/battle/memory-map.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/engine/field/movement-system.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/field_camera.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/field_effect.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/field_poison.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/field_tasks.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/fldeff_sweetscent.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/item_use.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/m4a_1.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/mon_markings.ts` | **3** |  |  |  | 1 |  |  |  |  | 2 |
| `src/pokedex.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/pokemon.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/trainer_card.ts` | **3** |  |  |  | 3 |  |  |  |  |  |
| `src/battle_anim_utility_funcs.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/battle_intro.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/berry.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/clock.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/data/object_events/object_event_anims.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/engine/battle/wire-bytecode-bridge.ts` | **2** |  |  |  | 1 |  |  |  |  | 1 |
| `src/field_door.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/field_weather.ts` | **2** |  |  |  | 1 |  |  |  | 1 |  |
| `src/fldeff_flash.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/intro_credits_graphics.ts` | **2** |  |  |  | 1 |  | 1 |  |  |  |
| `src/lilycove_lady.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/script_menu.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/starter_choose.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/strings.ts` | **2** |  |  |  | 2 |  |  |  |  |  |
| `src/battle_anim_dragon.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/battle_anim_effects_1.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/battle_anim_electric.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/battle_anim_ghost.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/battle_anim_mon_movement.ts` | **1** |  |  |  |  |  |  |  |  | 1 |
| `src/battle_anim_mons.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/battle_anim_poison.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/battle_anim_rock.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/battle_pyramid.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/berry_powder.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/data/battle_moves.ts` | **1** |  |  |  |  |  |  |  |  | 1 |
| `src/data/pokemon/species_info.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/daycare.ts` | **1** |  |  |  |  |  |  |  |  | 1 |
| `src/dewford_trend.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/bag/bag.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/battle/party-storage.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/battle/state.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/data/game-data.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/field/field-globals.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/field/fly-field-move.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/field/region-map-data.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/engine/save/save-blocks.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/event_object_lock.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/field_screen_effect.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/fldeff_cut.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/fldeff_dig.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/fldeff_rocksmash.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/fldeff_teleport.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/give_gift_ribbon_to_party.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/item.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/mail_data.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/metatile_behavior.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/play_time.ts` | **1** |  |  |  |  |  | 1 |  |  |  |
| `src/pokedex_area_region_map.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/pokedex_cry_screen.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/pokemon_icon.ts` | **1** |  |  |  |  |  |  |  |  | 1 |
| `src/pokemon_size_record.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/pokenav.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/post_battle_event_funcs.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/rotating_tile_puzzle.ts` | **1** |  |  | 1 |  |  |  |  |  |  |
| `src/scrcmd_fieldeffect.ts` | **1** |  |  |  |  |  |  |  |  | 1 |
| `src/scrcmd_trainer.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/shop.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/song_table.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/trainer_pokemon_sprites.ts` | **1** |  |  |  |  |  |  |  |  | 1 |
| `src/trainer_see.ts` | **1** |  |  |  | 1 |  |  |  |  |  |
| `src/union_room_chat.ts` | **1** |  |  |  | 1 |  |  |  |  |  |

### Détail par fichier

#### `src/tv.ts` — 128 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 1279 | `*no-op* · ¤comment` — // 1:1 StripExtCtrlCodes(show.nickname) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decod… |
| `marker` | 1525 | `*no-op* · ¤comment` — // 1:1 StripExtCtrlCodes(show.losingTrainerName) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-cod… |
| `marker` | 1588 | `*no-op* · ¤comment` — // 1:1 StripExtCtrlCodes(show.pokemonNickname) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes… |
| `marker` | 1666 | `*no-op* · ¤comment` — // 1:1 StripExtCtrlCodes(show.pokemonName) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (de… |
| `marker` | 1751 | `*no-op* · ¤comment` — // 1:1 StripExtCtrlCodes(show.nickname) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decod… |
| `marker` | 2370 | `*no-op* · ¤comment` — // 1:1 StripExtCtrlCodes(show.nickname) — no-op chez nous : les champs show = string JS déjà sans ext-ctrl-codes (decod… |
| `transpiler-todo` | 943 | show = gSaveBlock1Ptr.tvShows[j] /* TRANSPILER-TODO &élément scalaire (out-param ?) */; |
| `transpiler-todo` | 1041 | tvShow = gSaveBlock1Ptr.tvShows[VarGet(0x8004) /* gSpecialVar_0x8004 */] /* TRANSPILER-TODO &élément scalaire (out-para… |
| `transpiler-todo` | 1257 | show = gSaveBlock1Ptr.tvShows[sCurTVShowSlot] /* TRANSPILER-TODO &élément scalaire (out-param ?) */; |
| `transpiler-todo` | 1296 | let show = gSaveBlock1Ptr.tvShows[LAST_TVSHOW_IDX] /* TRANSPILER-TODO &élément scalaire (out-param ?) */; |
| `transpiler-todo` | … | *(+118 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/engine/script/specials-registry.ts` — 86 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 19 | `*stub* · ¤comment` — *   - Si pas encore implémenté → stub safe : `() => 0` (= fait scripts continuer |
| `marker` | 57 | `*stub* · ¤comment` — // stub-loop ; on les enregistre vers les vraies fns (dédup last-wins → registerSpecial gagne). |
| `marker` | 170 | `*placeholder* · ¤comment` — *  placeholder {STR_VAR_1} dans dialogues type "Hum, salut, GRAND/GRANDE !". |
| `marker` | 214 | `*stub* · ¤comment` — // SetCB2WhiteOut = K.O. poison field (EventScript_FieldWhiteOut). Dé-stubés 2026-07-02. |
| `marker` | 245 | `*stub* · ¤comment` — *  Stub ici pour audit-coverage ; vrai dispatch dans script-opcodes.ts. */ |
| `marker` | 250 | `*stub* · ¤comment` — *  Stub ici pour audit-coverage ; vrai dispatch dans script-opcodes.ts. */ |
| `marker` | 296 | `*no-op* · ⚑legit-ctx · ¤comment` — *  Multiplayer link warp. Stubs no-op. */ |
| `marker` | 297 | `*stub,no-op* · ⚑legit-ctx` — registerSpecial('SetCableClubWarp', () => { /* no-op stub */ }); |
| `marker` | 298 | `*stub,no-op* · ⚑legit-ctx` — registerSpecial('DoCableClubWarp', () => { /* no-op stub */ }); |
| `marker` | 302 | `*stub* · ¤comment` — // inline overlay). Pas de stub à enregistrer ici, car le dispatch ne tombe |
| `marker` | 379 | `*stub* · ¤comment` — *  par gFieldCallback ContinueScript (ex-stub MVP « skip rename » remplacé). */ |
| `marker` | 480 | `*no-op* · ¤comment` — *  generator). No-op safe pour démo. */ |
| `marker` | 481 | `*no-op*` — registerSpecial('ResetTVShowState', () => { /* no-op : pas de TV show generator */ }); |
| `marker` | 582 | `*stub,no-op* · ¤comment` — *  (= Latios/Latias). Used post-EV. Stub no-op. */ |
| `marker` | 583 | `*no-op*` — registerSpecial('InitRoamer', () => { /* no-op */ }); |
| `marker` | 592 | `*stub* · ¤comment` — // real body (= sum 6 EVs >= MAX_TOTAL_EVS=510). Stub supprimé. |
| `marker` | 594 | `*stub* · ¤comment` — /** 1:1 décomp `LoadBattlePyramidObjectEventTemplates` (battle_pyramid.c). Stub. */ |
| `marker` | 595 | `*no-op*` — registerSpecial('LoadBattlePyramidObjectEventTemplates', () => { /* no-op */ }); |
| `marker` | 647 | `*stub* · ¤comment` — /** 1:1 décomp `BufferEReaderTrainerName`. Stub. */ |
| `marker` | 648 | `*no-op*` — registerSpecial('BufferEReaderTrainerName', () => { /* no-op */ }); |
| `marker` | 698 | `*stub* · ¤comment` — *  in script-opcodes.ts via dynamic import to avoid circular deps. This stub |
| `marker` | 702 | `*stub* · ¤comment` — // of starter-choose-flow.ts). This stub is just a fallback for audit. |
| `marker` | 706 | `*no-op* · ¤comment` — *  depuis la grille courante. ⚠️ PAS un no-op : `MapGridSetMetatileIdAt` (fieldmap.ts:1789) |
| `marker` | 716 | `*stub* · ¤comment` — // Stub : returns 0 (= not registered) for early-game flow. Rematch flow |
| `marker` | 730 | `*no-op* · ⚑legit-ctx · ¤comment` — *  Notre party est déjà partagée en RAM, donc no-op suffit côté TS. */ |
| `marker` | 826 | `*no-op* · ¤comment` — *  par name "MAP_DEWFORD_TOWN" si stocké. Sinon no-op safe. */ |
| `marker` | 840 | `*no-op*` — registerSpecial('PetalburgGymSlideOpenRoomDoors', () => { /* no-op */ }); |
| `marker` | 841 | `*no-op*` — registerSpecial('PetalburgGymUnlockRoomDoors', () => { /* no-op */ }); |
| `marker` | 872 | `*stub* · ¤comment` — *  wallpaper customization). Late-game feature, stub for now. */ |
| `marker` | 943 | `*no-op*` — registerSpecial('ClearLinkContestFlags', () => { /* no-op */ }); |
| `marker` | 962 | `*stub* · ¤comment` — /** 1:1 décomp `LookThroughPorthole` (cinematic). Stub. */ |
| `marker` | 965 | `*no-op,non-porté* · ⚑legit-ctx · ¤comment` — *  non porté → no-op 1:1 strict justifié. */ |
| `marker` | 966 | `*non-porté* · ⚑legit-ctx` — registerSpecial('LookThroughPorthole', () => { /* 1:1 justified : ferry cinematic non porté */ }); |
| `marker` | 969 | `*no-op* · ⚑legit-ctx · ¤comment` — *  entrance. Notre projet web : pas de link adapter → no-op 1:1 strict justifié. */ |
| `marker` | 976 | `*no-op* · ⚑legit-ctx · ¤comment` — *  Notre projet : pas de link wireless/serial → no-op 1:1 strict justifié. */ |
| `marker` | 985 | `*no-op*` — registerSpecial('ShakeCamera', ShakeCamera);  // impl 1:1 (no-op différé) → src/field_specials.ts |
| `marker` | 986 | `*no-op*` — registerSpecial('SpawnCameraObject', SpawnCameraObject);  // impl 1:1 (no-op différé) → src/field_specials.ts |
| `marker` | 987 | `*no-op*` — registerSpecial('RemoveCameraObject', RemoveCameraObject);  // impl 1:1 (no-op différé) → src/field_specials.ts |
| `marker` | 1032 | `*stub* · ¤comment` — // (jalon multi Steven). Rebranché sur la vraie fn (retiré du stub `() => 0`). |
| `marker` | 1036 | `*no-op* · ⚑legit-ctx · ¤comment` — // (routage song table). No-op RETIRÉ (double registration = clobber). |
| `marker` | 1039 | `*no-op* · ⚑legit-ctx` — registerSpecial('RemoveRecordsWindow', () => { /* no-op */ }); |
| `marker` | 1040 | `*no-op* · ⚑legit-ctx` — registerSpecial('CloseBattlePointsWindow', () => { /* no-op */ }); |
| `marker` | 1041 | `*no-op* · ⚑legit-ctx` — registerSpecial('ShowBattlePointsWindow', () => { /* no-op */ }); |
| `marker` | 1045 | `*no-op*` — registerSpecial('ShowScrollableMultichoice', () => { /* no-op */ }); |
| `marker` | 1053 | `*stub* · ¤comment` — *  ⚠️ ADAPTATION v1 (PAS un stub silencieux — choix documenté, FILE-OPUS) : le menu |
| `marker` | 1108 | `*no-op*` — registerSpecial('PlayerEnteredTradeSeat', () => { /* no-op */ }); |
| `marker` | 1204 | `*placeholder* · ¤comment` — // le placeholder via constant resolution pour préserver le pattern décomp. |
| `marker` | 1284 | `*non-porté* · ¤comment` — *  Note 1:1 : sInFriendSecretBase est un static C ; non porté → flag implicite |
| `marker` | 1320 | `*no-op*` — registerSpecial('DoSecretBasePCTurnOffEffect', () => { /* no-op */ }); |
| `marker` | 1370 | `*no-op*` — registerSpecial('DoContestHallWarp', () => { /* no-op */ }); |
| `marker` | 1372 | `*no-op*` — registerSpecial('BufferContestWinnerMonName', () => { /* no-op */ }); |
| `marker` | 1375 | `*no-op*` — registerSpecial('ColosseumPlayerSpotTriggered', () => { /* no-op */ }); |
| `marker` | 1376 | `*no-op*` — registerSpecial('RecordMixingPlayerSpotTriggered', () => { /* no-op */ }); |
| `marker` | 1377 | `*no-op*` — registerSpecial('ShowFrontierExchangeCornerItemIconWindow', () => { /* no-op */ }); |
| `marker` | 1378 | `*no-op*` — registerSpecial('CloseFrontierExchangeCornerItemIconWindow', () => { /* no-op */ }); |
| `marker` | 1392 | `*stub* · ¤comment` — // ─── Puzzles d'arènes obligatoires — impls 1:1 (anti-clobber : retirés des stub-loops ci-dessus) ── |
| `marker` | 1400 | `*no-op*` — registerSpecial('Script_DoRayquazaScene', () => { /* no-op */ }); |
| `marker` | 1411 | `*no-op*` — registerSpecial('Script_FacePlayer', () => { /* no-op */ }); |
| `marker` | 1424 | `*stub* · ¤comment` — // enregistré dans le bloc PENSION ci-bas. STUB `() => 0` RETIRÉ (il court-circuitait |
| `marker` | 1461 | `*stub* · ¤comment` — *  Migré stub → port 1:1 (cleanup B12). */ |
| `marker` | 1499 | `*no-op* · ¤comment` — /** Misc post-game stubs (= return 0/no-op pour éviter NaN VAR_RESULT) : |
| `marker` | 1520 | `*stub* · ¤comment` — //   registerSpecial vers les vraies fns ci-bas (retirés de la stub-loop = anti-clobber). |
| `marker` | 1528 | `*stub* · ¤comment` — //   registerSpecial vers la vraie fn ci-bas (retiré de la stub-loop = anti-clobber). |
| `marker` | 1544 | `*stub* · ¤comment` — // choisis via gSelectedOrderFromParty. Rebranché sur la vraie fn (retiré du stub-loop). |
| `marker` | 1635 | `*no-op* · ¤comment` — *  Notre projet FR-only → ConvertInternationalString = no-op. */ |
| `marker` | 1755 | `*no-op* · ¤comment` — *  Notre projet FR-only → ConvertInternationalString = no-op. */ |
| `marker` | 1820 | `*non-porté* · ¤comment` — *  palette anim) non porté ; le flag visibility est wired, l'effet visuel |
| `marker` | 1958 | `*stub* · ¤comment` — // Safe stub returning 0. Real impl pourra venir au fur et à mesure. |
| `marker` | 2157 | `*stub,no-op* · ¤comment` — // 'ResetTVShowState' — no-op explicite documenté ci-dessus (~417). RETIRÉ du stub-loop |
| `marker` | 2158 | `*no-op* · ¤comment` — //   pour ne pas écraser silencieusement la registration explicite (même comportement, no-op). |
| `marker` | 2225 | `*stub* · ¤comment` — //   ci-dessus. RETIRÉ de la stub-loop (sinon `() => 0` écrase → accéder au PC ne ferait RIEN). |
| `marker` | 2335 | `*no-op* · ¤comment` — // Specials retirés de _SESSION_131_DECOMP_SPECIALS (étaient no-op) → handlers |
| `marker` | 2442 | `*TODO* · ¤comment` — *  sRivalAvatarGfxIds (NORMAL seul ; bike/surf/fishing/watering = TODO Phase 4), |
| `marker` | 2444 | `*non-porté* · ¤comment` — *  SetPlayerAvatarTransitionFlags non portés. Le sprite arrosoir du joueur n'est |
| `marker` | 2518 | `*no-op* · ¤comment` — *  FlagGet accepte maintenant numeric (= refactor B1) → no-op fallback `__flag_<id>`. */ |
| `marker` | 2568 | `*stub* · ¤comment` — // Tous RETIRÉS de _SESSION_131_DECOMP_SPECIALS (+ stub direct GetDaycareState) : |
| `marker` | 2661 | `*stub* · ¤comment` — // `IsLastMonThatKnowsSurf` real body ajouté ligne 415 (= remplace stub). |
| `marker` | 2993 | `*no-op* · ¤comment` — *  Notre projet : gLinkContestFlags == 0 → guard fail → no-op 1:1 strict justifié. */ |
| `marker` | 2995 | `*no-op* · ¤comment` — // 1:1 décomp guard fail (gLinkContestFlags == 0) → no-op. |
| `marker` | 3007 | `*no-op* · ¤comment` — *  Same pattern, no-op 1:1 strict justifié. */ |
| `marker` | 3009 | `*no-op* · ¤comment` — // 1:1 décomp guard fail (gLinkContestFlags == 0) → no-op. |
| `marker` | 3060 | `*stub* · ¤comment` — // extraites. Reste stub jusqu'à port mauville_old_man string tables. |
| `marker` | 3065 | `*stub* · ¤comment` — // le commentaire au-dessus de chaque entry). Aucun stub silencieux : tous les |
| `marker` | 3127 | `*non-porté* · ¤comment` — *    - GetBerryNameByBerryType + ItemIdToBerryType non portés (= dette R3 sur |
| `marker` | 4169 | `*non-porté* · ¤comment` — // (easy_chat.c:1573, écran d'affichage de la question du quiz) — écran non porté. |
| `marker` | 4172 | `*non-porté*` — console.warn('[specials] QuizLadyShowQuizQuestion : écran CB2_QuizLadyQuestion non porté (dette easy_chat)'); |

#### `src/pokenav_conditions_gfx.ts` — 71 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 36 | const AreLeftHeaderSpritesMoving: any = __wireTodo('AreLeftHeaderSpritesMoving'); |
| `wireTodo` | 37 | const BgDmaFill: any = __wireTodo('BgDmaFill'); |
| `wireTodo` | 38 | const BufferMonMarkingsMenuTiles: any = __wireTodo('BufferMonMarkingsMenuTiles'); |
| `wireTodo` | 39 | const ConditionGraph_Draw: any = __wireTodo('ConditionGraph_Draw'); |
| `wireTodo` | 40 | const ConditionGraph_InitResetScanline: any = __wireTodo('ConditionGraph_InitResetScanline'); |
| `wireTodo` | 41 | const ConditionGraph_InitWindow: any = __wireTodo('ConditionGraph_InitWindow'); |
| `wireTodo` | 42 | const ConditionGraph_ResetScanline: any = __wireTodo('ConditionGraph_ResetScanline'); |
| `wireTodo` | 43 | const ConditionGraph_SetNewPositions: any = __wireTodo('ConditionGraph_SetNewPositions'); |
| `wireTodo` | 44 | const ConditionGraph_TryUpdate: any = __wireTodo('ConditionGraph_TryUpdate'); |
| `wireTodo` | 45 | const ConditionMenu_UpdateMonEnter: any = __wireTodo('ConditionMenu_UpdateMonEnter'); |
| `wireTodo` | 46 | const ConditionMenu_UpdateMonExit: any = __wireTodo('ConditionMenu_UpdateMonExit'); |
| `wireTodo` | 47 | const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded'); |
| `wireTodo` | 48 | const CreateConditionSparkleSprites: any = __wireTodo('CreateConditionSparkleSprites'); |
| `wireTodo` | 49 | const CreateMonMarkingAllCombosSprite: any = __wireTodo('CreateMonMarkingAllCombosSprite'); |
| `wireTodo` | 50 | const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram'); |
| `wireTodo` | 51 | const DestroyConditionSparkleSprites: any = __wireTodo('DestroyConditionSparkleSprites'); |
| `wireTodo` | 52 | const DmaCopy16Defvars: any = __wireTodo('DmaCopy16Defvars'); |
| `wireTodo` | 53 | const FreeConditionSparkles: any = __wireTodo('FreeConditionSparkles'); |
| `wireTodo` | 54 | const FreeMonMarkingsMenu: any = __wireTodo('FreeMonMarkingsMenu'); |
| `wireTodo` | 55 | const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible'); |
| `wireTodo` | 56 | const GetConditionGraphCurrentListIndex: any = __wireTodo('GetConditionGraphCurrentListIndex'); |
| `wireTodo` | 57 | const GetConditionGraphMenuCurrentLoadIndex: any = __wireTodo('GetConditionGraphMenuCurrentLoadIndex'); |
| `wireTodo` | 58 | const GetConditionGraphPtr: any = __wireTodo('GetConditionGraphPtr'); |
| `wireTodo` | 59 | const GetConditionMonDataBuffer: any = __wireTodo('GetConditionMonDataBuffer'); |
| `wireTodo` | 60 | const GetConditionMonLocationText: any = __wireTodo('GetConditionMonLocationText'); |
| `wireTodo` | 61 | const GetConditionMonNameText: any = __wireTodo('GetConditionMonNameText'); |
| `wireTodo` | 62 | const GetConditionMonPal: any = __wireTodo('GetConditionMonPal'); |
| `wireTodo` | 63 | const GetConditionMonPicGfx: any = __wireTodo('GetConditionMonPicGfx'); |
| `wireTodo` | 64 | const GetMonListCount: any = __wireTodo('GetMonListCount'); |
| `wireTodo` | 65 | const GetNumConditionMonSparkles: any = __wireTodo('GetNumConditionMonSparkles'); |
| `wireTodo` | 66 | const InitBgTemplates: any = __wireTodo('InitBgTemplates'); |
| `wireTodo` | 67 | const InitMonMarkingsMenu: any = __wireTodo('InitMonMarkingsMenu'); |
| `wireTodo` | 68 | const IsConditionMenuSearchMode: any = __wireTodo('IsConditionMenuSearchMode'); |
| `wireTodo` | 69 | const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive'); |
| `wireTodo` | 70 | const LoadConditionGraphMenuGfx: any = __wireTodo('LoadConditionGraphMenuGfx'); |
| `wireTodo` | 71 | const LoadConditionMonPicTemplate: any = __wireTodo('LoadConditionMonPicTemplate'); |
| `wireTodo` | 72 | const LoadConditionSelectionIcons: any = __wireTodo('LoadConditionSelectionIcons'); |
| `wireTodo` | 73 | const LoadConditionSparkle: any = __wireTodo('LoadConditionSparkle'); |
| `wireTodo` | 74 | const LoadLeftHeaderGfxForIndex: any = __wireTodo('LoadLeftHeaderGfxForIndex'); |
| `wireTodo` | 75 | const LoadNextConditionMenuMonData: any = __wireTodo('LoadNextConditionMenuMonData'); |
| `wireTodo` | 76 | const MainMenuLoopedTaskIsBusy: any = __wireTodo('MainMenuLoopedTaskIsBusy'); |
| `wireTodo` | 77 | const MoveConditionMonOffscreen: any = __wireTodo('MoveConditionMonOffscreen'); |
| `wireTodo` | 78 | const OpenMonMarkingsMenu: any = __wireTodo('OpenMonMarkingsMenu'); |
| `wireTodo` | 79 | const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen'); |
| `wireTodo` | 80 | const PokenavFillPalette: any = __wireTodo('PokenavFillPalette'); |
| `wireTodo` | 81 | const Pokenav_AllocAndLoadPalettes: any = __wireTodo('Pokenav_AllocAndLoadPalettes'); |
| `wireTodo` | 82 | const PrintHelpBarText: any = __wireTodo('PrintHelpBarText'); |
| `wireTodo` | 83 | const ResetConditionSparkleSprites: any = __wireTodo('ResetConditionSparkleSprites'); |
| `wireTodo` | 84 | const SetLeftHeaderSpritesInvisibility: any = __wireTodo('SetLeftHeaderSpritesInvisibility'); |
| `wireTodo` | 85 | const SetPokenavVBlankCallback: any = __wireTodo('SetPokenavVBlankCallback'); |
| `wireTodo` | 86 | const SetVBlankCallback_: any = __wireTodo('SetVBlankCallback_'); |
| `wireTodo` | 87 | const ShowLeftHeaderGfx: any = __wireTodo('ShowLeftHeaderGfx'); |
| `wireTodo` | 88 | const SlideMenuHeaderDown: any = __wireTodo('SlideMenuHeaderDown'); |
| `wireTodo` | 89 | const TryGetMonMarkId: any = __wireTodo('TryGetMonMarkId'); |
| `wireTodo` | 90 | const WaitForHelpBar: any = __wireTodo('WaitForHelpBar'); |
| `wireTodo` | 91 | const gPokenavCondition_Gfx: any = __wireTodo('gPokenavCondition_Gfx'); |
| `wireTodo` | 92 | const gPokenavCondition_Pal: any = __wireTodo('gPokenavCondition_Pal'); |
| `wireTodo` | 93 | const gPokenavCondition_Tilemap: any = __wireTodo('gPokenavCondition_Tilemap'); |
| `wireTodo` | 94 | const gPokenavOptions_Tilemap: any = __wireTodo('gPokenavOptions_Tilemap'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 35 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 127 | `¤comment` — // TRANSPILER-TODO INCGFX : gConditionGraphData_Pal ← graphics/pokenav/condition/graph_data.pal (pipeline assets : load… |
| `transpiler-todo` | 130 | `¤comment` — // TRANSPILER-TODO INCGFX : gConditionText_Pal ← graphics/pokenav/condition/text.pal (pipeline assets : loadTileBin/loa… |
| `transpiler-todo` | 133 | `¤comment` — // TRANSPILER-TODO INCGFX : sConditionGraphData_Gfx ← graphics/pokenav/condition/graph_data.png (pipeline assets : load… |
| `transpiler-todo` | 136 | `¤comment` — // TRANSPILER-TODO INCGFX : sConditionGraphData_Tilemap ← graphics/pokenav/condition/graph_data.bin (pipeline assets : … |
| `transpiler-todo` | … | *(+6 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/battle_script_commands.ts` — 59 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 1505 | `*@ts-nocheck* · ¤comment` — *  all-auto.ts (= cassé : `gBattleTypeFlags is not defined` car @ts-nocheck + |
| `console-miss` | 12433 | `*console.warn*` — console.warn(`[cmd-batch-34] Cmd_various unknown caseId ${caseId}`); |
| `marker` | 967 | `*stub* · ¤comment` — *   0x0B Cmd_healthbarupdate  stub UI (= datahpupdate fait le HP write) |
| `marker` | 1009 | `*no-op* · ¤comment` — *  Si damage == 0 → no-op. Si damage > 0 et result == 0 → set to 1 (min damage). */ |
| `marker` | 1671 | `*no-op* · ¤comment` — *  Stubs : CheckWonderGuardAndLevitate = noop. */ |
| `marker` | 1759 | `*TODO* · ¤comment` — // TODO 1:1 (passe helpers) : CheckWonderGuardAndLevitate() (décomp l.1426-1499) raffine le |
| `marker` | 1773 | `*stub* · ¤comment` — *  l'ancien stub mettait COUNT=28 ce qui était FAUX, le décomp Em a 17 cases). */ |
| `marker` | 2783 | `*stub* · ¤comment` — *   0x84 Cmd_jumpifcantmakeasleep   partial (= Insomnia/VitalSpirit ; Uproar stub) |
| `marker` | 2824 | `*stub* · ¤comment` — *  n'a pas Soundproof. Stub side-effects (= ne set pas MULTISTRING_CHOOSER ici). */ |
| `marker` | 4641 | `*stub* · ¤comment` — *   0x6B atknameinbuff1       (1 byte — PREPARE_MON_NICK_BUFFER stub) |
| `marker` | 4642 | `*stub* · ¤comment` — *   0x6D resetsentmonsvalue   (1 byte — ResetSentPokesToOpponentValue stub) |
| `marker` | 4644 | `*stub* · ¤comment` — *   0x71 buffermovetolearn    (1 byte — BufferMoveToLearnIntoBattleTextBuff2 stub) |
| `marker` | 4970 | `*no-op* · ¤comment` — *   0x57 endlinkbattle           (1 byte — EmitEndLinkBattle 1:1 wire + Mark ; controller emit no-op Phase 1.4) |
| `marker` | 6534 | `*stub* · ¤comment` — // — wired via util.ts. PORTÉS 1:1, plus de stub. |
| `marker` | 7097 | `*no-op* · ¤comment` — *   0x83 nop                       (1 byte  — pure no-op) |
| `marker` | 8444 | `*no-op* · ¤comment` — *  est no-op car notre flush via batch C bridge garde gBattleMons sync direct. */ |
| `marker` | 8761 | `*stub* · ¤comment` — *  Wired vers gPlayerParty / gEnemyParty selon side (= pas plus de stub |
| `marker` | 8851 | `*stub* · ¤comment` — *  AUDIT FIX : précédemment stub return false → tous moves considérés single-turn. |
| `marker` | 9020 | `*no-op*` — .__battleStateMutators?.setMoveResultFlags ?? (() => { /* noop */ }); |
| `marker` | 9024 | `*no-op*` — .__battleStateMutators?.setCurrentMove ?? (() => { /* noop */ }); |
| `marker` | 9045 | `*no-op* · ¤comment` — // buffer (EmitGetMonData) étant un no-op, on charge directement depuis party[gBattlerPartyIndexes |
| `marker` | 9065 | `*non-porté* · ¤comment` — // (1:1 décomp 4662-4668 : flag Palace = BATTLE_TYPE_PALACE/Frontier, non porté.) |
| `marker` | 9433 | `*non-porté* · ⚑legit-ctx · ¤comment` — *    (sous-système réseau non porté, branches inatteignables en solo). |
| `marker` | 9434 | `*stub* · ⚑legit-ctx · ¤comment` — *  - DETTE R3 : SwitchPartyOrder porté mais _SwitchPartyMonSlots stub (swap réel |
| `marker` | 9493 | `*non-porté* · ⚑legit-ctx · ¤comment` — // DETTE LINK (sous-système réseau non porté) : GetLinkTrainerFlankId / |
| `marker` | 9581 | `*non-porté* · ⚑legit-ctx · ¤comment` — // (décomp 7369-7379) = sous-système réseau/multi non porté. Branches |
| `marker` | 10208 | `*no-op* · ¤comment` — *   2 : same que 3 + record action (= replay tracking, no-op single). |
| `marker` | 10231 | `*no-op* · ¤comment` — // Notre port : no-op (= buffer pas wired, monToSwitchIntoId déjà setté |
| `marker` | 10288 | `*stub* · ¤comment` — // (_monTryLearningNewMove appelle le VRAI MonTryLearningNewMove_Foyer — pas un stub : |
| `marker` | 10290 | `*stub* · ¤comment` — //  encore stubé auto-NO ci-dessous = dette UI battle « oublier une capacité ».) |
| `marker` | 10353 | `*stub* · ¤comment` — *  en oublier une). Était stubé « auto-NO » ; câblé 1:1 en réutilisant la MÊME machinerie |
| `marker` | 10515 | `*stub* · ¤comment` — // Pour stub Phase 1, on choose YES = advance pas jump. |
| `marker` | 10878 | `*no-op* · ¤comment` — // 1:1 décomp : wait DMA (no-op chez nous) + BG1_Y=0 (fait par OpenPage1). |
| `marker` | 13142 | `*no-op* · ¤comment` — // Stat+1 / Stat-1 / Stat+2 / Stat-2 / others default to sleep (= no-op). |
| `marker` | 13168 | `*stub* · ¤comment` — *  `gBattlerByTurnOrder[i] === battler`. AUDIT FIX : l'ancien stub `return battler` |
| `marker` | 13503 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13509 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13515 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13530 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13536 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13547 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13561 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13571 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13574 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13604 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13615 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13626 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13637 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13649 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13652 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13702 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13705 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13716 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13720 | `*stub* · ¤comment` — // EmitSetMonData stub |
| `marker` | 13738 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13747 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13765 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |
| `marker` | 13767 | `*no-op*` — } else if (eff === 59 /* MOVE_EFFECT_SP_ATK_TWO_DOWN (battle.h:304) = Surchauffe/Overheat ; 55=NOTHING_37 (no-op) */) { |
| `marker` | 13773 | `*no-op* · ¤comment` — // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance). |

#### `src/pokenav_conditions.ts` — 58 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 31 | const ConditionGraph_CalcPositions: any = __wireTodo('ConditionGraph_CalcPositions'); |
| `wireTodo` | 32 | const ConditionGraph_Init: any = __wireTodo('ConditionGraph_Init'); |
| `wireTodo` | 33 | const ConditionGraph_SetNewPositions: any = __wireTodo('ConditionGraph_SetNewPositions'); |
| `wireTodo` | 34 | const GET_NUM_CONDITION_SPARKLES: any = __wireTodo('GET_NUM_CONDITION_SPARKLES'); |
| `wireTodo` | 35 | const GetBoxNamePtr: any = __wireTodo('GetBoxNamePtr'); |
| `wireTodo` | 36 | const GetBoxOrPartyMonData: any = __wireTodo('GetBoxOrPartyMonData'); |
| `wireTodo` | 37 | const GetMonMarkingsData: any = __wireTodo('GetMonMarkingsData'); |
| `wireTodo` | 38 | const GetMonSpritePalFromSpeciesAndPersonality: any = __wireTodo('GetMonSpritePalFromSpeciesAndPersonality'); |
| `wireTodo` | 39 | const HandleMonMarkingsMenuInput: any = __wireTodo('HandleMonMarkingsMenuInput'); |
| `wireTodo` | 40 | const LZ77UnCompWram: any = __wireTodo('LZ77UnCompWram'); |
| `wireTodo` | 41 | const LoadSpecialPokePic: any = __wireTodo('LoadSpecialPokePic'); |
| `wireTodo` | 42 | const SetBoxMonDataAt: any = __wireTodo('SetBoxMonDataAt'); |
| `wireTodo` | 43 | const gKeyRepeatStartDelay: any = __wireTodo('gKeyRepeatStartDelay'); |
| `wireTodo` | 44 | const gMonFrontPicTable: any = __wireTodo('gMonFrontPicTable'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 30 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 95 | let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_ConditionM… |
| `transpiler-todo` | 107 | let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_ConditionM… |
| `transpiler-todo` | 347 | (void 0 /* TRANSPILER-TODO ASSIGN: *dst++ = *src++ */, n--); |
| `transpiler-todo` | 349 | void 0 /* TRANSPILER-TODO ASSIGN: *dst++ = CHAR_SPACE */; |
| `transpiler-todo` | … | *(+38 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/battle_main.ts` — 52 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 6433 | `*@ts-nocheck* · ¤comment` — // Bridge globalThis pour les auto-callbacks / battle code (= eval scope @ts-nocheck). |
| `marker` | 324 | `*stub* · ¤comment` — // runtime via globalThis.__scanlineEffectTick chaque VBlank. Stub ici pour |
| `marker` | 373 | `*placeholder*` — const VCOUNT = 0;  // placeholder |
| `marker` | 381 | `*stub* · ¤comment` — // 🐛 fix 2026-07-02 : la copie locale « stub minimal » de gBattleBgTemplates avait |
| `marker` | 600 | `*no-op* · ¤comment` — // Dette R3 : noop pour notre runtime web. |
| `marker` | 605 | `*no-op* · ¤comment` — // Dette R3 : noop. |
| `marker` | 610 | `*no-op* · ¤comment` — // Dette R3 : noop. |
| `marker` | 793 | `*stub,no-op* · ¤comment` — *  était un stub no-op). */ |
| `marker` | 836 | `*stub* · ¤comment` — *  d intro » 2026-06-11 : ce stub vide laissait le fade NOIR de la transition |
| `marker` | 859 | `*stub,no-op* · ¤comment` — // SetWildMonHeldItem : porté 1:1 dans party-storage (pokemon.c equiv) ; ex-stub no-op retiré. |
| `marker` | 880 | `*no-op*` — return m?.CB2_HandleStartBattle ?? ((): void => { /* noop */ }); |
| `marker` | 1219 | `*non-porté* · ⚑legit-ctx · ¤comment` — // CB2_HandleStartMulti* / PreInit* — non portés (Dette R3 multi/partner). |
| `marker` | 1222 | `*non-porté* · ⚑legit-ctx · ¤comment` — *  (SendBlock / GetBlockReceived / RNG-seed / Shedinja link) = LINK non porté, hors |
| `marker` | 1223 | `*non-porté* · ⚑legit-ctx · ¤comment` — *  périmètre solo (link non porté). Mirror EXACT du CB2_HandleStartBattle offline du port |
| `marker` | 1247 | `*non-porté* · ⚑legit-ctx · ¤comment` — // 1:1 :1189-1228 : la branche LINK (if BATTLE_TYPE_LINK) = link non porté, hors |
| `marker` | 1270 | `*non-porté* · ⚑legit-ctx · ¤comment` — //   link/tower, non porté solo ; la LINK_IN_BATTLE flag = gate link.) |
| `marker` | 1287 | `*non-porté* · ¤comment` — *  (party_menu.c non porté) ET le save/restore (inutile sans le party menu qui les |
| `marker` | 1454 | `*stub,no-op* · ¤comment` — // Champion d'Arène / Conseil 4 / Maître. (Ex-stub _AdjustFriendship no-op = dette soldée.) |
| `marker` | 2328 | `*stub* · ¤comment` — *  RunBattleScriptCommands_PopCallbacksStack. (Était un stub console.warn → |
| `marker` | 2706 | `*stub* · ¤comment` — *  partyOrder[0..2]] (4 bytes). INDISPENSABLE : sans ça (ancien stub vide), le |
| `marker` | 2720 | `*stub* · ¤comment` — *  stub vide), le `_MarkBattlerForControllerExec` qui suit (l.515) re-dispatchait le |
| `marker` | 2743 | `*stub,no-op* · ¤comment` — *  (ancien stub noop), le controller re-lit l'ANCIEN bufferA[0] (= CHOOSEMOVE) → le |
| `marker` | 2774 | `*stub* · ¤comment` — *  AUDIT FIX : l'ancien stub `return false` empêchait la détection « tous les moves |
| `marker` | 2795 | `*stub* · ¤comment` — *  AUDIT FIX : l'ancien stub `return false` laissait sélectionner un move |
| `marker` | 2886 | `*stub* · ¤comment` — *  l'ancien stub `return 0` désactivait les capacités de piégeage (Shadow Tag/Arena Trap) → le |
| `marker` | 2892 | `*stub* · ¤comment` — /** Délègue au vrai `AbilityBattleEffects` (battle_util, importé). AUDIT FIX : l'ancien stub |
| `marker` | 3534 | `*no-op* · ¤comment` — // 1:1 décomp : only restart if animNum != current. Pour now : noop. |
| `marker` | 4025 | `*stub* · ⚑legit-ctx · ¤comment` — * explicit + dette R3 commentée. Pas de stub silencieux : la signature |
| `marker` | 4273 | `*no-op* · ¤comment` — *  gBattleResources struct. Notre port : noop car gBattleStruct est statique. */ |
| `marker` | 4275 | `*no-op* · ¤comment` — // Dette R3 : reset gBattleResources tracker explicit. Pour now : noop. |
| `marker` | 4280 | `*no-op* · ¤comment` — // Dette R3 : reset sprite tracking tables battle. Notre port : noop. |
| `marker` | 4318 | `*no-op* · ¤comment` — // recorded battle system. Noop. |
| `marker` | 4480 | `*stub* · ¤comment` — // gEnemyParty côté adverse). En single-player LOCAL le buffer IPC est stub → on |
| `marker` | 4535 | `*stub* · ¤comment` — // (BattleMainCB2 : version réelle en tête de fichier — stub historique retiré.) |
| `marker` | 4538 | `*stub* · ¤comment` — *  l'appelle chaque frame). AVANT : STUB (`void cb`) → ne posait RIEN → la SEULE |
| `marker` | 4570 | `*no-op* · ¤comment` — // Dette R3 : text_buffers helper. Pour now : noop. |
| `marker` | 4927 | `*no-op* · ¤comment` — *  Wild battle : noop visible mais le struct hpStatus est setup quand même |
| `marker` | 5129 | `*non-porté* · ¤comment` — // NON PORTÉS (volontaire) : `BattleIntroSkipRecordMonsToDex` (battle_main.c:3705) |
| `marker` | 5255 | `*placeholder* · ¤comment` — *  contre les labels placeholder `__…` (= signaux non-script d'autres itemEffects). */ |
| `marker` | 5334 | `*stub* · ¤comment` — // battle-action-selection importe setBattleMainFunc d'ici). Stub = fallback. |
| `marker` | 5366 | `*stub* · ¤comment` — *  Fallback = stub si le module n'est pas chargé. */ |
| `marker` | 5377 | `*no-op* · ¤comment` — // No-op de secours : si on est ici, le module action-selection n'a pas chargé. |
| `marker` | 5529 | `*stub* · ¤comment` — // `gBattlescriptCurrInstr = {}` (stub) ne lançait PAS le script de victoire |
| `marker` | 5662 | `*stub* · ¤comment` — // FAUT poser ctx.scriptPtr sur l'offset (pas juste gBattlescriptCurrInstr=<stub>), |
| `marker` | 5827 | `*no-op* · ¤comment` — // l'avait remplacée (backupOwPartyForTest dans setupPartyForBattle). No-op pour |
| `marker` | 5852 | `*no-op* · ⚑legit-ctx · ¤comment` — // callback2 = savedCallback (one-shot devenu no-op) → MainCB2_Overworld jamais |
| `marker` | 6493 | `*no-op* · ¤comment` — // Dette R3 : noop pour notre runtime. |
| `marker` | 6496 | `*no-op* · ¤comment` — // Dette R3 : noop. |
| `marker` | 6594 | `*stub* · ⚑legit-ctx · ¤comment` — *  @body-parity-ok stub assumé : cascade link _BLE, hors périmètre solo */ |
| `marker` | 6620 | `*no-op* · ⚑legit-ctx · ¤comment` — *  connaît pas (voie link hors solo-core), la vraie fonction no-op proprement au lieu |
| `marker` | 6621 | `*stub* · ⚑legit-ctx · ¤comment` — *  du faux stub. */ |
| `marker` | 6640 | `*stub* · ⚑legit-ctx · ¤comment` — *  @body-parity-ok stub assumé : cascade link _BLE, hors périmètre solo */ |

#### `src/pokenav_region_map.ts` — 47 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 41 | const AreLeftHeaderSpritesMoving: any = __wireTodo('AreLeftHeaderSpritesMoving'); |
| `wireTodo` | 42 | const BgDmaFill: any = __wireTodo('BgDmaFill'); |
| `wireTodo` | 43 | const BlendRegionMap: any = __wireTodo('BlendRegionMap'); |
| `wireTodo` | 44 | const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded'); |
| `wireTodo` | 45 | const CreateRegionMapCursor: any = __wireTodo('CreateRegionMapCursor'); |
| `wireTodo` | 46 | const CreateRegionMapPlayerIcon: any = __wireTodo('CreateRegionMapPlayerIcon'); |
| `wireTodo` | 47 | const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram'); |
| `wireTodo` | 48 | const DoRegionMapInputCallback: any = __wireTodo('DoRegionMapInputCallback'); |
| `wireTodo` | 49 | const FadeToBlackExceptPrimary: any = __wireTodo('FadeToBlackExceptPrimary'); |
| `wireTodo` | 50 | const FreeRegionMapIconResources: any = __wireTodo('FreeRegionMapIconResources'); |
| `wireTodo` | 51 | const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible'); |
| `wireTodo` | 52 | const GetBgY: any = __wireTodo('GetBgY'); |
| `wireTodo` | 53 | const InitBgTemplates: any = __wireTodo('InitBgTemplates'); |
| `wireTodo` | 54 | const InitRegionMapData: any = __wireTodo('InitRegionMapData'); |
| `wireTodo` | 55 | const IsEventIslandMapSecId: any = __wireTodo('IsEventIslandMapSecId'); |
| `wireTodo` | 56 | const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive'); |
| `wireTodo` | 57 | const IsRegionMapZoomed: any = __wireTodo('IsRegionMapZoomed'); |
| `wireTodo` | 58 | const LZ77UnCompWram: any = __wireTodo('LZ77UnCompWram'); |
| `wireTodo` | 59 | const LoadLeftHeaderGfxForIndex: any = __wireTodo('LoadLeftHeaderGfxForIndex'); |
| `wireTodo` | 60 | const LoadRegionMapGfx: any = __wireTodo('LoadRegionMapGfx'); |
| `wireTodo` | 61 | const MainMenuLoopedTaskIsBusy: any = __wireTodo('MainMenuLoopedTaskIsBusy'); |
| `wireTodo` | 62 | const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen'); |
| `wireTodo` | 63 | const Pokenav_AllocAndLoadPalettes: any = __wireTodo('Pokenav_AllocAndLoadPalettes'); |
| `wireTodo` | 64 | const PrintHelpBarText: any = __wireTodo('PrintHelpBarText'); |
| `wireTodo` | 65 | const PutWindowRectTilemap: any = __wireTodo('PutWindowRectTilemap'); |
| `wireTodo` | 66 | const SetLeftHeaderSpritesInvisibility: any = __wireTodo('SetLeftHeaderSpritesInvisibility'); |
| `wireTodo` | 67 | const SetPokenavVBlankCallback: any = __wireTodo('SetPokenavVBlankCallback'); |
| `wireTodo` | 68 | const SetRegionMapDataForZoom: any = __wireTodo('SetRegionMapDataForZoom'); |
| `wireTodo` | 69 | const SetVBlankCallback_: any = __wireTodo('SetVBlankCallback_'); |
| `wireTodo` | 70 | const ShowLeftHeaderGfx: any = __wireTodo('ShowLeftHeaderGfx'); |
| `wireTodo` | 71 | const SlideMenuHeaderDown: any = __wireTodo('SlideMenuHeaderDown'); |
| `wireTodo` | 72 | const TrySetPlayerIconBlink: any = __wireTodo('TrySetPlayerIconBlink'); |
| `wireTodo` | 73 | const UpdateRegionMapRightHeaderTiles: any = __wireTodo('UpdateRegionMapRightHeaderTiles'); |
| `wireTodo` | 74 | const UpdateRegionMapVideoRegs: any = __wireTodo('UpdateRegionMapVideoRegs'); |
| `wireTodo` | 75 | const UpdateRegionMapZoom: any = __wireTodo('UpdateRegionMapZoom'); |
| `wireTodo` | 76 | const WaitForHelpBar: any = __wireTodo('WaitForHelpBar'); |
| `wireTodo` | 77 | const gRegionMapCityZoomText_Gfx: any = __wireTodo('gRegionMapCityZoomText_Gfx'); |
| `wireTodo` | 78 | const gRegionMapCityZoomTiles_Pal: any = __wireTodo('gRegionMapCityZoomTiles_Pal'); |
| `wireTodo` | 79 | const sPokenavCityMaps: any = __wireTodo('sPokenavCityMaps'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 40 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 138 | `¤comment` — // TRANSPILER-TODO INCGFX : sMapSecInfoWindow_Pal ← graphics/pokenav/region_map/info_window.pal (pipeline assets : load… |
| `transpiler-todo` | 141 | `¤comment` — // TRANSPILER-TODO INCGFX : sRegionMapCityZoomTiles_Gfx ← graphics/pokenav/region_map/zoom_tiles.png (pipeline assets :… |
| `transpiler-todo` | 241 | let state = AllocSubstruct(POKENAV_SUBSTRUCT_REGION_MAP_STATE, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RegionMapMenu… |
| `transpiler-todo` | 244 | if (!AllocSubstruct(POKENAV_SUBSTRUCT_REGION_MAP, 0 /* TRANSPILER-TODO sizeof(struct RegionMap) */)) |
| `transpiler-todo` | … | *(+2 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/pokenav_conditions_search_results.ts` — 43 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 40 | const AreLeftHeaderSpritesMoving: any = __wireTodo('AreLeftHeaderSpritesMoving'); |
| `wireTodo` | 42 | const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded'); |
| `wireTodo` | 43 | const CreatePokenavList: any = __wireTodo('CreatePokenavList'); |
| `wireTodo` | 44 | const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram'); |
| `wireTodo` | 45 | const DestroyPokenavList: any = __wireTodo('DestroyPokenavList'); |
| `wireTodo` | 46 | const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible'); |
| `wireTodo` | 47 | const GetBoxMonData: any = __wireTodo('GetBoxMonData'); |
| `wireTodo` | 49 | const InitBgTemplates: any = __wireTodo('InitBgTemplates'); |
| `wireTodo` | 50 | const IsCreatePokenavListTaskActive: any = __wireTodo('IsCreatePokenavListTaskActive'); |
| `wireTodo` | 51 | const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive'); |
| `wireTodo` | 52 | const LT_SET_STATE: any = __wireTodo('LT_SET_STATE'); |
| `wireTodo` | 53 | const LoadLeftHeaderGfxForIndex: any = __wireTodo('LoadLeftHeaderGfxForIndex'); |
| `wireTodo` | 54 | const MainMenuLoopedTaskIsBusy: any = __wireTodo('MainMenuLoopedTaskIsBusy'); |
| `wireTodo` | 55 | const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen'); |
| `wireTodo` | 56 | const PokenavList_GetSelectedIndex: any = __wireTodo('PokenavList_GetSelectedIndex'); |
| `wireTodo` | 57 | const PokenavList_IsMoveWindowTaskActive: any = __wireTodo('PokenavList_IsMoveWindowTaskActive'); |
| `wireTodo` | 58 | const PokenavList_MoveCursorDown: any = __wireTodo('PokenavList_MoveCursorDown'); |
| `wireTodo` | 59 | const PokenavList_MoveCursorUp: any = __wireTodo('PokenavList_MoveCursorUp'); |
| `wireTodo` | 60 | const PokenavList_PageDown: any = __wireTodo('PokenavList_PageDown'); |
| `wireTodo` | 61 | const PokenavList_PageUp: any = __wireTodo('PokenavList_PageUp'); |
| `wireTodo` | 62 | const PrintHelpBarText: any = __wireTodo('PrintHelpBarText'); |
| `wireTodo` | 63 | const SetLeftHeaderSpritesInvisibility: any = __wireTodo('SetLeftHeaderSpritesInvisibility'); |
| `wireTodo` | 64 | const ShowLeftHeaderGfx: any = __wireTodo('ShowLeftHeaderGfx'); |
| `wireTodo` | 65 | const SlideMenuHeaderDown: any = __wireTodo('SlideMenuHeaderDown'); |
| `wireTodo` | 66 | const gConditionSearchResultFramePal: any = __wireTodo('gConditionSearchResultFramePal'); |
| `wireTodo` | 67 | const gConditionSearchResultTilemap: any = __wireTodo('gConditionSearchResultTilemap'); |
| `wireTodo` | 68 | const gConditionSearchResultTiles: any = __wireTodo('gConditionSearchResultTiles'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 39 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 138 | `¤comment` — // TRANSPILER-TODO INCGFX : sListBg_Pal ← graphics/pokenav/condition/search_results_list.pal (pipeline assets : loadTil… |
| `transpiler-todo` | 196 | let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Search… |
| `transpiler-todo` | 199 | menu.monList = AllocSubstruct(POKENAV_SUBSTRUCT_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct PokenavMonList) */); |
| `transpiler-todo` | 213 | let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_SEARCH_RESULTS, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Search… |
| `transpiler-todo` | … | *(+10 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/pokenav_ribbons_list.ts` — 43 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 38 | const AreLeftHeaderSpritesMoving: any = __wireTodo('AreLeftHeaderSpritesMoving'); |
| `wireTodo` | 40 | const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded'); |
| `wireTodo` | 41 | const CreatePokenavList: any = __wireTodo('CreatePokenavList'); |
| `wireTodo` | 42 | const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram'); |
| `wireTodo` | 43 | const DestroyPokenavList: any = __wireTodo('DestroyPokenavList'); |
| `wireTodo` | 44 | const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible'); |
| `wireTodo` | 45 | const GetBoxMonData: any = __wireTodo('GetBoxMonData'); |
| `wireTodo` | 47 | const InitBgTemplates: any = __wireTodo('InitBgTemplates'); |
| `wireTodo` | 48 | const IsCreatePokenavListTaskActive: any = __wireTodo('IsCreatePokenavListTaskActive'); |
| `wireTodo` | 49 | const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive'); |
| `wireTodo` | 50 | const LT_SET_STATE: any = __wireTodo('LT_SET_STATE'); |
| `wireTodo` | 51 | const LoadLeftHeaderGfxForIndex: any = __wireTodo('LoadLeftHeaderGfxForIndex'); |
| `wireTodo` | 52 | const MainMenuLoopedTaskIsBusy: any = __wireTodo('MainMenuLoopedTaskIsBusy'); |
| `wireTodo` | 53 | const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen'); |
| `wireTodo` | 54 | const PokenavList_GetSelectedIndex: any = __wireTodo('PokenavList_GetSelectedIndex'); |
| `wireTodo` | 55 | const PokenavList_IsMoveWindowTaskActive: any = __wireTodo('PokenavList_IsMoveWindowTaskActive'); |
| `wireTodo` | 56 | const PokenavList_MoveCursorDown: any = __wireTodo('PokenavList_MoveCursorDown'); |
| `wireTodo` | 57 | const PokenavList_MoveCursorUp: any = __wireTodo('PokenavList_MoveCursorUp'); |
| `wireTodo` | 58 | const PokenavList_PageDown: any = __wireTodo('PokenavList_PageDown'); |
| `wireTodo` | 59 | const PokenavList_PageUp: any = __wireTodo('PokenavList_PageUp'); |
| `wireTodo` | 60 | const PrintHelpBarText: any = __wireTodo('PrintHelpBarText'); |
| `wireTodo` | 61 | const SetLeftHeaderSpritesInvisibility: any = __wireTodo('SetLeftHeaderSpritesInvisibility'); |
| `wireTodo` | 62 | const ShowLeftHeaderGfx: any = __wireTodo('ShowLeftHeaderGfx'); |
| `wireTodo` | 63 | const SlideMenuHeaderDown: any = __wireTodo('SlideMenuHeaderDown'); |
| `wireTodo` | 64 | const gMonRibbonListFramePal: any = __wireTodo('gMonRibbonListFramePal'); |
| `wireTodo` | 65 | const gMonRibbonListFrameTilemap: any = __wireTodo('gMonRibbonListFrameTilemap'); |
| `wireTodo` | 66 | const gMonRibbonListFrameTiles: any = __wireTodo('gMonRibbonListFrameTiles'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 37 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 122 | `¤comment` — // TRANSPILER-TODO INCGFX : sMonRibbonListUi_Pal ← graphics/pokenav/ribbons/list_ui.pal (pipeline assets : loadTileBin/… |
| `transpiler-todo` | 180 | let list = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsMonList… |
| `transpiler-todo` | 183 | list.monList = AllocSubstruct(POKENAV_SUBSTRUCT_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct PokenavMonList) */); |
| `transpiler-todo` | 194 | let list = AllocSubstruct(POKENAV_SUBSTRUCT_RIBBONS_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_RibbonsMonList… |
| `transpiler-todo` | … | *(+10 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/pokenav_ribbons_summary.ts` — 43 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 53 | const BgDmaFill: any = __wireTodo('BgDmaFill'); |
| `wireTodo` | 54 | const CopyPaletteIntoBufferUnfaded: any = __wireTodo('CopyPaletteIntoBufferUnfaded'); |
| `wireTodo` | 55 | const CreateMonPicSprite_HandleDeoxys: any = __wireTodo('CreateMonPicSprite_HandleDeoxys'); |
| `wireTodo` | 56 | const DecompressAndCopyTileDataToVram: any = __wireTodo('DecompressAndCopyTileDataToVram'); |
| `wireTodo` | 57 | const FreeSpriteOamMatrix: any = __wireTodo('FreeSpriteOamMatrix'); |
| `wireTodo` | 58 | const FreeTempTileDataBuffersIfPossible: any = __wireTodo('FreeTempTileDataBuffersIfPossible'); |
| `wireTodo` | 59 | const GetBoxMonData: any = __wireTodo('GetBoxMonData'); |
| `wireTodo` | 61 | const InitBgTemplates: any = __wireTodo('InitBgTemplates'); |
| `wireTodo` | 62 | const IsPaletteFadeActive: any = __wireTodo('IsPaletteFadeActive'); |
| `wireTodo` | 63 | const PokenavFadeScreen: any = __wireTodo('PokenavFadeScreen'); |
| `wireTodo` | 64 | const PokenavFillPalette: any = __wireTodo('PokenavFillPalette'); |
| `wireTodo` | 65 | const Pokenav_AllocAndLoadPalettes: any = __wireTodo('Pokenav_AllocAndLoadPalettes'); |
| `wireTodo` | 66 | const PrintHelpBarText: any = __wireTodo('PrintHelpBarText'); |
| `wireTodo` | 67 | const gGiftRibbonDescriptionPointers: any = __wireTodo('gGiftRibbonDescriptionPointers'); |
| `wireTodo` | 68 | const gKeyRepeatContinueDelay: any = __wireTodo('gKeyRepeatContinueDelay'); |
| `wireTodo` | 69 | const gKeyRepeatStartDelay: any = __wireTodo('gKeyRepeatStartDelay'); |
| `wireTodo` | 70 | const gPokenavRibbonsSummaryBg_Gfx: any = __wireTodo('gPokenavRibbonsSummaryBg_Gfx'); |
| `wireTodo` | 71 | const gPokenavRibbonsSummaryBg_Pal: any = __wireTodo('gPokenavRibbonsSummaryBg_Pal'); |
| `wireTodo` | 72 | const gPokenavRibbonsSummaryBg_Tilemap: any = __wireTodo('gPokenavRibbonsSummaryBg_Tilemap'); |
| `wireTodo` | 73 | const gRibbonDescriptionPointers: any = __wireTodo('gRibbonDescriptionPointers'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 49 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 265 | `¤comment` — // TRANSPILER-TODO INCGFX : sRibbonIcons1_Pal ← graphics/pokenav/ribbons/icons1.pal (pipeline assets : loadTileBin/load… |
| `transpiler-todo` | 268 | `¤comment` — // TRANSPILER-TODO INCGFX : sRibbonIcons2_Pal ← graphics/pokenav/ribbons/icons2.pal (pipeline assets : loadTileBin/load… |
| `transpiler-todo` | 271 | `¤comment` — // TRANSPILER-TODO INCGFX : sRibbonIcons3_Pal ← graphics/pokenav/ribbons/icons3.pal (pipeline assets : loadTileBin/load… |
| `transpiler-todo` | 274 | `¤comment` — // TRANSPILER-TODO INCGFX : sRibbonIcons4_Pal ← graphics/pokenav/ribbons/icons4.pal (pipeline assets : loadTileBin/load… |
| `transpiler-todo` | … | *(+17 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/credits.ts` — 35 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 49 | const CreateMonSpriteFromNationalDexNumber: any = __wireTodo('CreateMonSpriteFromNationalDexNumber'); |
| `wireTodo` | 50 | const GetStarterPokemon: any = __wireTodo('GetStarterPokemon'); |
| `wireTodo` | 51 | const InitHeap: any = __wireTodo('InitHeap'); |
| `wireTodo` | 52 | const LoadCreditsSceneGraphics: any = __wireTodo('LoadCreditsSceneGraphics'); |
| `wireTodo` | 53 | const SetCreditsSceneBgCnt: any = __wireTodo('SetCreditsSceneBgCnt'); |
| `wireTodo` | 54 | const SoftReset: any = __wireTodo('SoftReset'); |
| `wireTodo` | 55 | const data: any = __wireTodo('data'); |
| `wireTodo` | 56 | const gBirchBagGrass_Gfx: any = __wireTodo('gBirchBagGrass_Gfx'); |
| `wireTodo` | 57 | const gBirchBagGrass_Pal: any = __wireTodo('gBirchBagGrass_Pal'); |
| `wireTodo` | 58 | const gBirchGrassTilemap: any = __wireTodo('gBirchGrassTilemap'); |
| `wireTodo` | 59 | const gCreditsCopyrightEnd_Gfx: any = __wireTodo('gCreditsCopyrightEnd_Gfx'); |
| `wireTodo` | 60 | const gCreditsCopyrightEnd_Tilemap: any = __wireTodo('gCreditsCopyrightEnd_Tilemap'); |
| `wireTodo` | 61 | const gDecompressionBuffer: any = __wireTodo('gDecompressionBuffer'); |
| `wireTodo` | 62 | const gHeap: any = __wireTodo('gHeap'); |
| `wireTodo` | 63 | const gIntroCopyright_Pal: any = __wireTodo('gIntroCopyright_Pal'); |
| `wireTodo` | 64 | const gSpritePalettes_Credits: any = __wireTodo('gSpritePalettes_Credits'); |
| `wireTodo` | 65 | const gSpriteSheet_CreditsBicycle: any = __wireTodo('gSpriteSheet_CreditsBicycle'); |
| `wireTodo` | 66 | const gSpriteSheet_CreditsBrendan: any = __wireTodo('gSpriteSheet_CreditsBrendan'); |
| `wireTodo` | 67 | const gSpriteSheet_CreditsMay: any = __wireTodo('gSpriteSheet_CreditsMay'); |
| `wireTodo` | 68 | const gSpriteSheet_CreditsRivalBrendan: any = __wireTodo('gSpriteSheet_CreditsRivalBrendan'); |
| `wireTodo` | 69 | const gSpriteSheet_CreditsRivalMay: any = __wireTodo('gSpriteSheet_CreditsRivalMay'); |
| `wireTodo` | 70 | const sCreditsEntryPointerTable: any = __wireTodo('sCreditsEntryPointerTable'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 48 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 179 | `¤comment` — // TRANSPILER-TODO INCGFX : sCredits_Pal ← graphics/credits/credits.pal (pipeline assets : loadTileBin/loadGbaPal('/dec… |
| `transpiler-todo` | 229 | end: ANIMCMD_JUMP(0), /* TRANSPILER-TODO champ */ |
| `transpiler-todo` | 238 | end: ANIMCMD_JUMP(0), /* TRANSPILER-TODO champ */ |
| `transpiler-todo` | 254 | `¤comment` — /* TRANSPILER-TODO champ ? */ ANIMCMD_END }; |
| `transpiler-todo` | … | *(+7 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/event_object_movement.ts` — 28 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 7237 | `*console.warn*` — console.warn(`[object-events] OBJ_EVENT_GFX_VAR_${n} resolved to ${gfxIdValue} but no matching OBJ_EVENT_GFX_ const fou… |
| `console-miss` | 7334 | `*console.warn*` — console.warn(`[object-events] secondary PNG manquant pour ${graphicsKey} (path=${secondaryRelPath ?? 'undefined'})`); |
| `console-miss` | 8303 | `*console.warn*` — if (!graphics \|\| !graphics.png) { console.warn('[ObjectEventSetGraphicsId] gfx absent du catalogue: ' + graphicsId); re… |
| `console-miss` | 9190 | `*console.error*` — console.error(`[EOM] LoadObjectEventPalette : tag 0x${paletteTag.toString(16)} absent — précharger la palette (LoadSpri… |
| `marker` | 546 | `*no-op* · ¤comment` — *  Idempotent : si déjà cached, no-op rapide. |
| `marker` | 3108 | `*stub* · ¤comment` — // swap (= graphics_id EARLY→LATE stages) + sparkle FieldEffect = stub explicit. |
| `marker` | 3180 | `*no-op* · ¤comment` — // (= no-op sans gCopyPlayerMovementFuncs cascade). NPCs en COPY_PLAYER_X |
| `marker` | 3203 | `*non-porté* · ¤comment` — // JOG_IN_PLACE_* : faster in-place anim. Dette : static face (anim in-place non portée). |
| `marker` | 3218 | `*non-porté* · ¤comment` — // RUN_IN_PLACE_* : run anim in place. Dette : traité comme WALK_IN_PLACE (anim run non portée). |
| `marker` | 3368 | `*no-op* · ¤comment` — // littéraux indépendants des pics → on passe des buffers VIDES (subarray no-op) et |
| `marker` | 4110 | `*non-porté* · ¤comment` — // FindTallGrassFieldEffectSpriteId non porté (notre SpawnTallGrassEffect dédoublonne |
| `marker` | 4111 | `*no-op* · ¤comment` — // déjà par tuile) → on lance le spawn statique, qui no-op si doublon. |
| `marker` | 4181 | `*non-porté* · ¤comment` — // 1:1 décomp : garde ObjectEventIsFarawayIslandMew non portée (Faraway Island = |
| `marker` | 4308 | `*no-op* · ¤comment` — // mais 1:1 décomp les DoGroundEffects tournent quand même (no-op si les triggers |
| `marker` | 4340 | `*stub,no-op* · ¤comment` — // Actions critiques portées (FACE_X, WALK_X, etc.) ; les autres = stub no-op |
| `marker` | 5952 | `*non-porté* · ¤comment` — // disguise) non portée — l'action se termine ici (le dresseur déguisé n'a pas |
| `marker` | 6191 | `*no-op* · ¤comment` — // retournent done=TRUE immédiatement (= safe no-op) ; le system applymovement |
| `marker` | 6198 | `*no-op* · ¤comment` — /** Sentinel no-op : marque l'action done imm pour éviter freeze + signaler |
| `marker` | 6203 | `*non-porté* · ¤comment` — *  Actions non portées = `_movementActionNoOp` (= safe done immédiat). |
| `marker` | 6315 | `*non-porté* · ¤comment` — // emote sprite manque tant que FieldEffectStart(FLDEFF_X_ICON) non porté. |
| `marker` | 7040 | `*no-op* · ¤comment` — *  resynchroniser `animNum` chaque frame (no-op pour un arbre statique). */ |
| `marker` | 7224 | `*placeholder* · ¤comment` — // OBJ_EVENT_GFX_VAR_N (N=0..7) = placeholder graphics_id qui se résout à |
| `marker` | 7651 | `*placeholder* · ¤comment` — // pour un 16x32 (= placeholder vide `[]`), le primary est hidden + 0 |
| `marker` | 7694 | `*placeholder* · ¤comment` — // Primary sprite = placeholder logique pour le subsprite system. Décomp |
| `marker` | 8513 | `*no-op* · ¤comment` — *  suivante (= no-op rapide). */ |
| `marker` | 8854 | `*no-op* · ¤comment` — *  no-op si gCamera.active=FALSE. */ |
| `marker` | 9186 | `*no-op* · ¤comment` — *  déjà enregistré → no-op (= LoadSpritePaletteIfTagExists) ; sinon on HURLE |
| `marker` | 9230 | `*placeholder* · ¤comment` — // (la table 0 des sOamTables_* est le placeholder vide `{}`) → on ne pose |

#### `src/mail.ts` — 28 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 19 | `*stub* · ¤comment` — *     stub dans decomp-bridge (throw NI). On les wrap pour exposer un warn |
| `marker` | 20 | `*placeholder* · ¤comment` — *     non-throw (= mail readable avec placeholder, pas crash). |
| `marker` | 23 | `*no-op* · ¤comment` — *     `FreeAndDestroyMonIconSprite` — pas portés. Stubs no-op (= mail bead/dream |
| `marker` | 25 | `*stub,no-op* · ¤comment` — *   - scanline_effect.c : `ScanlineEffect_Stop` — stub runtime no-op (engine |
| `marker` | 27 | `*stub* · ¤comment` — *   - international_string_util.c : `ConvertInternationalPlayerName` — stub |
| `marker` | 28 | `*no-op* · ¤comment` — *     no-op (= player name déjà UTF-8 dans notre port). |
| `marker` | 642 | `*no-op* · ¤comment` — // Si tiles == null (échec réseau), on no-op (= mail wireframe). |
| `marker` | 715 | `*no-op* · ¤comment` — // 1:1 décomp sprite icon BEAD/DREAM. Stubs no-op tant que pokemon_icon |
| `marker` | 994 | `*non-porté* · ¤comment` — // ─── Stubs explicites pour dépendances non portées 1:1 ─────────────────────── |
| `marker` | 1016 | `*no-op* · ¤comment` — *  setBgTilemapBuffer = no-op (= équivalent fonctionnel 1:1, pas une |
| `marker` | 1022 | `*no-op*` — console.debug('[mail] SetBgTilemapBuffer : no-op (buffer = sMailRead.bg{1,2}TilemapBuffer module-local, copy via CopyBg… |
| `marker` | 1027 | `*no-op* · ¤comment` — /** 1:1 décomp `UnsetBgTilemapBuffer(bg)`. Pendant du SetBg ci-dessus : no-op. */ |
| `marker` | 1032 | `*no-op*` — console.debug('[mail] UnsetBgTilemapBuffer : no-op (pendant SetBgTilemapBuffer).'); |
| `marker` | 1037 | `*TODO* · ¤comment` — /** 1:1 TODO : `bg.c ResetTempTileDataBuffers()`. Notre engine ne défère pas |
| `marker` | 1039 | `*no-op* · ¤comment` — *  ResetTempTileDataBuffers = no-op. */ |
| `marker` | 1044 | `*no-op*` — console.debug('[mail] ResetTempTileDataBuffers : no-op (engine = direct upload, pas de defer queue).'); |
| `marker` | 1048 | `*TODO* · ¤comment` — /** 1:1 TODO : `bg.c FreeTempTileDataBuffersIfPossible()` — retourne TRUE si |
| `marker` | 1055 | `*TODO* · ¤comment` — /** 1:1 TODO : `bg.c DecompressAndCopyTileDataToVram(bg, src, size, offset, mode)`. |
| `marker` | 1059 | `*no-op* · ¤comment` — *  template. Tant que les assets ne sont pas extraits, src == null = no-op. */ |
| `marker` | 1090 | `*no-op*` — console.debug('[mail] LoadOam : no-op (engine VBlank).'); |
| `marker` | 1099 | `*no-op*` — console.debug('[mail] ProcessSpriteCopyRequests : no-op (engine direct copy).'); |
| `marker` | 1105 | `*no-op* · ¤comment` — // automatiquement à chaque VBlank tick. No-op ici. |
| `marker` | 1112 | `*no-op* · ¤comment` — // → no-op) ; la globale tique réellement l'icône mon (bead/dream) = 1:1 correct. |
| `marker` | 1120 | `*no-op* · ¤comment` — // 1:1 décomp : no-op callback. |
| `marker` | 1125 | `*stub* · ¤comment` — // L'ancien stub renvoyait '' (mail content vide) ; maintenant le vrai texte. |
| `marker` | 1128 | `*TODO* · ¤comment` — /** 1:1 TODO : `international_string_util.c ConvertInternationalPlayerName`. |
| `marker` | 1129 | `*no-op* · ¤comment` — *  Pour notre port FR : player name déjà en UTF-8, no-op acceptable. */ |
| `marker` | 1134 | `*no-op*` — console.debug('[mail] ConvertInternationalPlayerName : no-op (player name UTF-8).'); |

#### `src/battle_controller_player.ts` — 25 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 1686 | `*console.warn*` — console.warn('[L] PlayerHandlePrintString : byte path failed, fallback JS-string :', e); |
| `marker` | 323 | `*no-op* · ¤comment` — *  (battle_controller_player.c:1540-1548). R2 wire : no-op si combat actif |
| `marker` | 353 | `*no-op* · ¤comment` — *  gbaBg.tilemap chaque frame → no-op (cf. gba-window-system). */ |
| `marker` | 359 | `*stub* · ¤comment` — *  (transpilé, ex-stub dette R3 soldé). Import dyn anti-cycle (battle_tv → tv → |
| `marker` | 394 | `*no-op* · ¤comment` — *  → en SINGLE aucun battler ne passe (side != OPP && side != PLAYER = impossible) = NO-OP total |
| `marker` | 441 | `*non-porté* · ¤comment` — // mais elle n'exécute JAMAIS → non transcrite (dépendrait de PrintSafariMonInfo non porté). |
| `marker` | 463 | `*stub* · ¤comment` — *  AVANT (2026-07-11) : corps VIDE (stub « Dette R3 ») → une fois installé, aucune |
| `marker` | 589 | `*no-op* · ¤comment` — *  (battle_controller_player.c:1520-1528). R2 wire : no-op si combat actif. */ |
| `marker` | 780 | `*stub* · ¤comment` — *  "Report jusqu'à fin projet"). Pour now : stub R3 immediate complete. */ |
| `marker` | 1346 | `*no-op* · ¤comment` — // ci-dessous bouclerait en state 0 (_setHealthBoxAnimationState no-op → animState |
| `marker` | 1461 | `*no-op* · ¤comment` — *  PART (no-op silencieux). */ |
| `marker` | 1756 | `*stub* · ¤comment` — *  (transpilé, ex-stub dette R3 soldé). Le micro-délai dyn est sans effet |
| `marker` | 1765 | `*no-op,non-porté* · ¤comment` — // No-op : Frontier subsystem non porté. |
| `marker` | 2088 | `*no-op* · ¤comment` — *  directement (notre `Cmd_switchhandleorder` case 0 est un no-op : il lit |
| `marker` | 2256 | `*stub* · ¤comment` — *  (= stub R3 sprite id, K10 SetBattleBarStruct l'utilise mais |
| `marker` | 2257 | `*no-op* · ¤comment` — *  MoveBattleBarGraphically est hook no-op tant que healthbox UI pas wirée). */ |
| `marker` | 2340 | `*no-op* · ¤comment` — // faisait reculer/no-op. + PlaySE(SE_EXP=33) 1:1 (battle_controller_player.c:1215). |
| `marker` | 2387 | `*stub* · ¤comment` — /** Stub clear statusAnimActive (= gBattleSpritesDataPtr structure). */ |
| `marker` | 2662 | `*no-op* · ¤comment` — /** 1:1 décomp `BattleControllerDummy()` (battle_controllers.c) — no-op (le Task drive le send-out). */ |
| `marker` | 2663 | `*no-op*` — function _BattleControllerDummy(): void { /* no-op */ } |
| `marker` | 2852 | `*stub* · ¤comment` — *  attend la fin (CompleteOnFinishedBattleAnimation). Était un STUB ExecCompleted |
| `marker` | 2889 | `*no-op* · ¤comment` — *  RecordedBattle_RecordAllBattlerData = recorded non modélisé (no-op). */ |
| `marker` | 2894 | `*no-op*` — _PrintLinkStandbyMsg();       // gaté BATTLE_TYPE_LINK (décomp :3186) → no-op en single |
| `marker` | 2903 | `*no-op* · ⚑legit-ctx · ¤comment` — *  gaté `gBattleTypeFlags & BATTLE_TYPE_LINK` → no-op total en local single |
| `marker` | 2906 | `*no-op* · ⚑legit-ctx · ¤comment` — // no-op 1:1 hors link (gate décomp). |

#### `src/overworld.ts` — 25 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 578 | `*console.warn*` — console.warn(`[overworld] destWarpId ${destWarpId} out of range (${warps.length} warps), fallback 0`); |
| `console-miss` | 1279 | `*console.warn*` — console.warn('[CB2_ReturnToFieldLocal_Manual case 1] no _restoreOverworldFromMenu, skip'); |
| `marker` | 232 | `*non-porté* · ¤comment` — *  bateau M. Brine) = dette mineure (non porté ici). */ |
| `marker` | 411 | `*non-porté* · ¤comment` — *  `sFixedDiveWarp`/`sFixedHoleWarp` : statics non portés (dette dive/hole fixe |
| `marker` | 425 | `*non-porté* · ¤comment` — *  `sFixedDiveWarp`/`sFixedHoleWarp` = statics NON portés (dette dive/hole fixe |
| `marker` | 426 | `*no-op* · ¤comment` — *  déjà documentée sur ApplyCurrentWarp/SetDiveWarp) → no-op 1:1. */ |
| `marker` | 428 | `*non-porté* · ¤comment` — // sFixedDiveWarp = sDummyWarpData; sFixedHoleWarp = sDummyWarpData; (statics non portés) |
| `marker` | 443 | `*no-op* · ¤comment` — *  - `gMapHeader.mapLayout = GetMapLayout()` : no-op (le header du cache porte déjà |
| `marker` | 456 | `*no-op* · ¤comment` — *  est un no-op — le header du cache porte déjà son layout). */ |
| `marker` | 629 | `*stub* · ¤comment` — *  connexion (= "pas de dive ici", comportement honnête, pas un stub qui fait semblant). */ |
| `marker` | 643 | `*non-porté* · ¤comment` — // Branche fixed-dive-warp non portée (dette documentée). |
| `marker` | 735 | `*stub* · ¤comment` — // n'avaient JAMAIS été portés (Overworld_PlaySpecialMapMusic = stub savedMusic-only) |
| `marker` | 1120 | `*no-op* · ¤comment` — *  blend 2e-cible BG1/2/3+OBJ no-op par défaut (eva=13/evb=7), DISPCNT OW) + (ré)active |
| `marker` | 1315 | `*no-op* · ¤comment` — *   • ClearMirageTowerPulseBlendEffect() : no-op GARANTI chez nous (sMirageTowerPulseBlend |
| `marker` | 1319 | `*no-op* · ¤comment` — *     PERSISTANTS (field_camera.ts:389), pas des allocs heap → no-op structurel (les |
| `marker` | 1400 | `*non-porté* · ¤comment` — *  NON portés (subsystems ambient cry + roamer) → laissés INERTES (commentés 1:1). */ |
| `marker` | 1403 | `*non-porté* · ¤comment` — // ChooseAmbientCrySpecies();               // non porté (ambient cry) |
| `marker` | 1405 | `*non-porté* · ¤comment` — // UpdateLocationHistoryForRoamer();         // non porté (roamer) |
| `marker` | 1406 | `*non-porté* · ¤comment` — // RoamerMoveToOtherLocationSet();           // non porté (roamer) |
| `marker` | 1413 | `*non-porté* · ¤comment` — *  - SecretBaseMapPopupEnabled() : non porté (subsystem Secret Base) → assumé TRUE |
| `marker` | 1419 | `*non-porté*` — if (gMapHeader?.showMapName === true /* && SecretBaseMapPopupEnabled() (non porté → TRUE) */) |
| `marker` | 1452 | `*no-op* · ⚑legit-ctx · ¤comment` — *     au boot, pas de link web → no-op documenté. |
| `marker` | 1462 | `*no-op* · ⚑legit-ctx · ¤comment` — // FieldClearVBlankHBlankCallbacks(); — hardware link/interrupts/VBlank (no-op, cf. en-tête) |
| `marker` | 1477 | `*no-op* · ⚑legit-ctx · ¤comment` — *   - FieldClearVBlankHBlankCallbacks() : hardware (no-op, cf. CB2_NewGame). |
| `marker` | 1485 | `*no-op* · ⚑legit-ctx · ¤comment` — // FieldClearVBlankHBlankCallbacks(); — hardware link/interrupts/VBlank (no-op) |

#### `src/pokenav_main_menu.ts` — 25 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 81 | const LZ77UnCompWram: any = __wireTodo('LZ77UnCompWram'); |
| `wireTodo` | 82 | const RequestDma3Copy: any = __wireTodo('RequestDma3Copy'); |
| `wireTodo` | 94 | const gDecompressionBuffer: any = __wireTodo('gDecompressionBuffer'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 35 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `marker` | 40 | `*no-op* · ¤comment` — *  charBase*0x4000 du BG. `src == null` (asset pas encore wiré) = no-op. */ |
| `marker` | 48 | `*no-op* · ¤comment` — // (message/device/dots du menu-handler) → return no-op → tuiles JAMAIS uploadées = couleurs fausses. |
| `marker` | 63 | `*stub* · ¤comment` — // jamais au module-init → pas de TDZ). Remplace le stub __wireTodo qui faisait throw la SORTIE. |
| `marker` | 89 | `*no-op* · ¤comment` — *  du BG est géré direct par le moteur (copy via CopyBgTilemapBufferToVram), donc no-op (équiv 1:1, |
| `marker` | 92 | `*no-op* · ¤comment` — /* no-op */ |
| `transpiler-todo` | 205 | `¤comment` — // TRANSPILER-TODO INCGFX : sSpinningPokenav_Pal ← graphics/pokenav/nav_icon.png (pipeline assets : loadTileBin/loadGba… |
| `transpiler-todo` | 208 | `¤comment` — // TRANSPILER-TODO INCGFX : sSpinningPokenav_Gfx ← graphics/pokenav/nav_icon.png (pipeline assets : loadTileBin/loadGba… |
| `transpiler-todo` | 211 | `¤comment` — // TRANSPILER-TODO INCGFX : sBlueLightCopy ← graphics/pokenav/blue_light.png (pipeline assets : loadTileBin/loadGbaPal(… |
| `transpiler-todo` | 302 | `¤comment` — /* TRANSPILER-TODO [POKENAV_GFX_PARTY_MENU - POKENAV_GFX_SUBMENUS_STA */ |
| `transpiler-todo` | … | *(+11 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/battle_factory.ts` — 24 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 67 | `*non-porté* · ¤comment` — // ─── Socle Battle Frontier NON PORTÉ ────────────────────────────────────────── |
| `marker` | 70 | `*stub* · ¤comment` — // qui LÈVENT à tout accès/appel (Règle 3 : pas de stub muet ; le câblage futur du Frontier |
| `marker` | 74 | `*non-porté*` — get: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); }, |
| `marker` | 75 | `*non-porté*` — set: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); }, |
| `marker` | 92 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `SetBattleFacilityTrainerGfxId(u16 trainerId, u8 arrayId)` (battle_tower.c). */ |
| `marker` | 94 | `*non-porté*` — throw new Error('non porté : SetBattleFacilityTrainerGfxId (socle battle_tower)'); |
| `marker` | 96 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `u16 GetRandomScaledFrontierTrainerId(u8 challengeNum, u8 battleNum)` (battle_tower.c). */ |
| `marker` | 98 | `*non-porté*` — throw new Error('non porté : GetRandomScaledFrontierTrainerId (socle battle_tower)'); |
| `marker` | 100 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `u32 GetBoxMonData(struct BoxPokemon *boxMon, s32 field, u8 *data)` (pokemon.c). */ |
| `marker` | 102 | `*non-porté*` — throw new Error('non porté : GetBoxMonData (pokemon.c — BoxPokemon non modélisé)'); |
| `marker` | 104 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `u8 SetFacilityPtrsGetLevel(void)` (battle_tower.c). */ |
| `marker` | 106 | `*non-porté*` — throw new Error('non porté : SetFacilityPtrsGetLevel (socle battle_tower)'); |
| `marker` | 108 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `CreateMonWithEVSpreadNatureOTID(struct Pokemon*, u16, u8, u8, u8, u8, u32)` (pokemon.c). */ |
| `marker` | 110 | `*non-porté*` — throw new Error('non porté : CreateMonWithEVSpreadNatureOTID (pokemon.c)'); |
| `marker` | 112 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `SaveGameFrontier(void)` (frontier_util.c). */ |
| `marker` | 114 | `*non-porté*` — throw new Error('non porté : SaveGameFrontier (socle frontier_util)'); |
| `marker` | 116 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `DoBattleFactorySelectScreen`/`DoBattleFactorySwapScreen` (battle_factory_screen.c). */ |
| `marker` | 118 | `*non-porté*` — throw new Error('non porté : DoBattleFactorySelectScreen (battle_factory_screen)'); |
| `marker` | 121 | `*non-porté*` — throw new Error('non porté : DoBattleFactorySwapScreen (battle_factory_screen)'); |
| `transpiler-todo` | 703 | SetMonData(gEnemyParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[gFrontierTempParty[i]].ite… |
| `transpiler-todo` | 759 | SetMonData(gPlayerParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId] /* TR… |
| `transpiler-todo` | 788 | SetMonData(gEnemyParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[monId].itemTableId] /* TRA… |
| `transpiler-todo` | 1000 | SetMonData(gPlayerParty[i], MON_DATA_HELD_ITEM, gBattleFrontierHeldItems[gFacilityTrainerMons[gSaveBlock2Ptr.frontier.r… |
| `transpiler-todo` | … | *(+1 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/pokenav_menu_handler_gfx.ts` — 24 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 52 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `marker` | 56 | `*stub* · ¤comment` — // FreeSpriteOamMatrix : porté 1:1 dans sprite.ts (sa maison décomp) → importé (remplace le stub qui |
| `marker` | 57 | `*no-op* · ¤comment` — // faisait throw DestroyMenuOptionSprites au shutdown Pokénav). No-op sur les sprites d'options (non-affines). |
| `marker` | 61 | `*stub* · ¤comment` — // route par SetGpuReg → win0.x1/x2 PAR SCANLINE. (Ex-`__wireTodo` stub → le glow |
| `marker` | 74 | `*placeholder*` — let gPokenavOptions_Pal: any = new Uint16Array(0x100); // placeholder (zéros) — asset réel chargé en STEP B (chantier m… |
| `marker` | 592 | `*placeholder* · ¤comment` — //     (qui capturaient null/placeholder au module-load). Gate LT_PAUSE en case 0 (comme le bandeau). ─── |
| `marker` | 1217 | `*no-op* · ¤comment` — // les 6 assigns en `void 0` (no-op) ET `sprites++` sur un tableau JS → `sprites` devenait NaN |
| `marker` | 1243 | `*no-op* · ¤comment` — // le transpileur avait laissé l'assign en `void 0` (no-op) + `sprites++` → les icônes restaient invisibles. |
| `marker` | 1558 | `*no-op* · ¤comment` — // STATIQUE + les CpuFill16 no-op sont retirés ; câblé par le Lot A3, _applyRegFromValue→WIN0H). |
| `transpiler-todo` | 138 | `¤comment` — // TRANSPILER-TODO INCGFX : sPokenavBgDotsPal ← graphics/pokenav/bg_dots.png (pipeline assets : loadTileBin/loadGbaPal(… |
| `transpiler-todo` | 141 | `¤comment` — // TRANSPILER-TODO INCGFX : sPokenavBgDotsTiles ← graphics/pokenav/bg_dots.png (pipeline assets : loadTileBin/loadGbaPa… |
| `transpiler-todo` | 144 | `¤comment` — // TRANSPILER-TODO INCGFX : sPokenavBgDotsTilemap ← graphics/pokenav/bg_dots.bin (pipeline assets : loadTileBin/loadGba… |
| `transpiler-todo` | 147 | `¤comment` — // TRANSPILER-TODO INCGFX : sPokenavDeviceBgPal ← graphics/pokenav/device_outline.png (pipeline assets : loadTileBin/lo… |
| `transpiler-todo` | … | *(+10 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/tileset_anims.ts` — 23 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 9 | `*stub* · ¤comment` — *     « stub » ci-dessous est PÉRIMÉE (gardée pour l'historique des noms). |
| `marker` | 26 | `*TODO,stub* · ¤comment` — *     "rustboro"  → InitTilesetAnim_Rustboro   (stub TODO Phase 4.7+) |
| `marker` | 27 | `*stub* · ¤comment` — *     "dewford"   → InitTilesetAnim_Dewford    (stub) |
| `marker` | 28 | `*stub* · ¤comment` — *     "slateport" → InitTilesetAnim_Slateport  (stub) |
| `marker` | 29 | `*stub* · ¤comment` — *     "mauville"  → InitTilesetAnim_Mauville   (stub) |
| `marker` | 30 | `*stub* · ¤comment` — *     "lavaridge" → InitTilesetAnim_Lavaridge  (stub) |
| `marker` | 35 | `*stub* · ¤comment` — *     "ever_grande" → InitTilesetAnim_EverGrande (stub) |
| `marker` | 36 | `*stub* · ¤comment` — *     "pacifidlog"  → InitTilesetAnim_Pacifidlog (stub) |
| `marker` | 37 | `*stub* · ¤comment` — *     "sootopolis"  → InitTilesetAnim_Sootopolis (stub) |
| `marker` | 38 | `*stub* · ¤comment` — *     "battle_frontier_outside_west" → InitTilesetAnim_BattleFrontierOutsideWest (stub) |
| `marker` | 39 | `*stub* · ¤comment` — *     "battle_frontier_outside_east" → InitTilesetAnim_BattleFrontierOutsideEast (stub) |
| `marker` | 40 | `*stub* · ¤comment` — *     "underwater"     → InitTilesetAnim_Underwater   (stub) |
| `marker` | 41 | `*stub* · ¤comment` — *     "sootopolis_gym" → InitTilesetAnim_SootopolisGym (stub) |
| `marker` | 42 | `*stub* · ¤comment` — *     "cave"           → InitTilesetAnim_Cave          (stub) |
| `marker` | 43 | `*stub* · ¤comment` — *     "elite_four"     → InitTilesetAnim_EliteFour     (stub) |
| `marker` | 44 | `*stub* · ¤comment` — *     "mauville_gym"   → InitTilesetAnim_MauvilleGym   (stub) |
| `marker` | 45 | `*stub* · ¤comment` — *     "bike_shop"      → InitTilesetAnim_BikeShop       (stub) |
| `marker` | 46 | `*stub* · ¤comment` — *     "battle_pyramid" → InitTilesetAnim_BattlePyramid  (stub) |
| `marker` | 47 | `*stub* · ¤comment` — *     "battle_dome"    → InitTilesetAnim_BattleDome     (stub) |
| `marker` | 308 | `*no-op* · ¤comment` — /** Pause les tileset animations overworld (= no-op le dispatch per-frame). |
| `marker` | 1227 | `*no-op* · ¤comment` — *  Implémentation actuelle : NO-OP. Battle Dome non testé Phase 4.7. |
| `marker` | 1228 | `*TODO* · ¤comment` — *  TODO Phase 4.8+ : wire palette copy + blend (= besoin gPlttBufferUnfaded |
| `marker` | 1233 | `*stub* · ¤comment` — // Stub : palette blend non encore implémenté. Map Battle Dome rendering OK |

#### `src/battle_message.ts` — 20 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 135 | `*console.warn*` — console.warn('[battle-message] char absent du charmap.json: ' + JSON.stringify(ch) + ' (charcode ' + ch.charCodeAt(0) +… |
| `marker` | 12 | `*placeholder* · ¤comment` — *   placeholders, fallback "?", chemins "raw ASCII") et produit une JS-string |
| `marker` | 88 | `*placeholder* · ¤comment` — *  placeholder B_TXT_* dans les strings battle (≠ EXT_CTRL_CODE_BEGIN=0xFC). */ |
| `marker` | 142 | `*placeholder* · ¤comment` — *  placeholder : noms de moves/mons/abilities/items issus de nos tables FR). |
| `marker` | 151 | `*placeholder* · ¤comment` — *  charmap + codes placeholder, 1:1 comme le template byte du décomp : |
| `marker` | 190 | `*placeholder*` — flushSeg(i);                       // encode le littéral avant le placeholder |
| `marker` | 267 | `*no-op* · ¤comment` — *  nicknames byte se terminent déjà par EOS → no-op de troncature ici (la |
| `marker` | 343 | `*placeholder* · ¤comment` — /** Résout un code placeholder B_TXT_* → bytes à copier dans dst. |
| `marker` | 399 | `*non-porté* · ¤comment` — // lose-text (sTrainerBDefeatSpeech non porté) : différés → chaîne VIDE (pas de marqueur cru |
| `marker` | 538 | `*placeholder* · ¤comment` — *  sub-byte → skip (codes placeholder/ext résiduels). PAS pour le rendu (le |
| `marker` | 603 | `*placeholder* · ¤comment` — // FUSION 1:1 : battle-string-decoder.ts (=battle_message.c décodeur/placeholders, |
| `marker` | 888 | `*placeholder* · ¤comment` — // ─── Decode B_BUFF1/2/3 (= mini-format placeholder) 1:1 décomp ───────────── |
| `marker` | 1020 | `*placeholder* · ¤comment` — // placeholders {B_BUFF1/2/3}. Inverse exact de `_decodeTextBuff` ci-dessus. |
| `marker` | 1064 | `*placeholder* · ¤comment` — // ─── Placeholder substitution (= `{B_X}` markers dans strings.json) ───────── |
| `marker` | 1066 | `*placeholder* · ¤comment` — /** Map placeholder name → resolver function. 1:1 décomp `BattleStringExpand` |
| `marker` | 1070 | `*placeholder* · ¤comment` — *  `data/text/*.inc` ou `src/strings.c`). Si un placeholder n'est pas connu, |
| `marker` | 1150 | `*placeholder* · ¤comment` — // Prefix placeholders 1:1 décomp battle_message.c:2704-2728 : |
| `marker` | 1170 | `*placeholder* · ¤comment` — // Substitue les placeholders {B_X} d'une string template (= gText_WhatWillPkmnDo |
| `marker` | 1216 | `*placeholder* · ¤comment` — // substitue directement le moveName quand placeholder {B_BUFF2} apparaît. |
| `marker` | 2321 | `*non-porté* · ¤comment` — *  [ARENA] = sTextOnWindowsInfo_Arena). Arena non porté → NORMAL only. |

#### `src/battle_util.ts` — 20 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 988 | `*console.warn*` — else console.warn('[handle-action] BattleScriptExecute hook absent (battle-main-functions pas chargé)'); |
| `console-miss` | 1003 | `*console.warn*` — else console.warn('[handle-action] BattleScriptPushCursorAndCallback hook absent'); |
| `marker` | 284 | `*stub* · ¤comment` — /** 1:1 stub `BATTLE_PARTNER(id)` — défini déjà dans constants mais we inline. */ |
| `marker` | 287 | `*stub* · ¤comment` — /** 1:1 stub `GetBattlerTurnOrderNum(battler)` (battle_util.c). Retourne l'index |
| `marker` | 577 | `*no-op* · ¤comment` — // (= no-op web canvas, le scroll est piloté par le renderer side). |
| `marker` | 807 | `*no-op* · ¤comment` — *  HandleAction_Switch, même convention no-op). */ |
| `marker` | 907 | `*non-porté* · ⚑legit-ctx` — const linkPlayers = 0; // GetLinkPlayerCount() — link non porté (dette link). |
| `marker` | 1045 | `*non-porté* · ⚑legit-ctx` — throw new Error('[battle_util] HasNoMonsToSwitch: BATTLE_TYPE_MULTI (link) non porté (hors périmètre solo)'); |
| `marker` | 1391 | `*stub* · ¤comment` — // Stub : on assume item normal (= ITEM_ENIGMA_BERRY pas porté). |
| `marker` | 1457 | `*stub* · ¤comment` — // 1:1 décomp ll.414-417 : Enigma Berry test (stub - on assume item normal). |
| `marker` | 2259 | `*stub* · ¤comment` — /** Module-local stub `gBattleStruct->moneyMultiplier`. */ |
| `marker` | 2271 | `*non-porté*` — ? 0 /* gEnigmaBerries non porté */ |
| `marker` | 2309 | `*no-op* · ¤comment` — // 1:1 décomp battle_util.c:3606 — no-op. |
| `marker` | 2325 | `*no-op* · ¤comment` — // (= push/pop paired = no-op sur le script pointer). Le caller wire SetMoveEffect |
| `marker` | 2380 | `*stub* · ¤comment` — // 1:1 décomp : CalculatePPWithBonus pour max PP. Stub : getBattleMove(move).pp. |
| `marker` | 2868 | `*stub* · ¤comment` — *  AUDIT FIX : l'ancien stub renvoyait WEATHER_NONE → les combats n'héritaient JAMAIS de |
| `marker` | 3642 | `*stub* · ¤comment` — *  (battle_util.c). Stub : retourne battler avec plus high speed. |
| `marker` | 3971 | `*stub* · ¤comment` — /** Stub `UproarWakeUpCheck(battler)` — Phase 1.4 L extension. */ |
| `marker` | 4542 | `*TODO* · ¤comment` — //      (end-turn) ; consolidation vers ces versions publiques = TODO (vérifier |
| `marker` | 4543 | `*stub* · ¤comment` — //      bit-values avant de rebrancher). Le stub `_WEATHER_HAS_EFFECT=true` a été |

#### `src/pokenav_match_call_gfx.ts` — 19 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 57 | const CpuCopy32: any = __wireTodo('CpuCopy32'); |
| `wireTodo` | 58 | const DecompressPicFromTable: any = __wireTodo('DecompressPicFromTable'); |
| `wireTodo` | 61 | const LZ77UnCompWram: any = __wireTodo('LZ77UnCompWram'); |
| `wireTodo` | 71 | const RequestDma3Copy: any = __wireTodo('RequestDma3Copy'); |
| `wireTodo` | 125 | const gTrainerFrontPicPaletteTable: any = __wireTodo('gTrainerFrontPicPaletteTable'); |
| `wireTodo` | 126 | const gTrainerFrontPicTable: any = __wireTodo('gTrainerFrontPicTable'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 53 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 176 | `¤comment` — // TRANSPILER-TODO INCGFX : sOptionsCursor_Pal ← graphics/pokenav/match_call/options_cursor.png (pipeline assets : load… |
| `transpiler-todo` | 179 | `¤comment` — // TRANSPILER-TODO INCGFX : sOptionsCursor_Gfx ← graphics/pokenav/match_call/options_cursor.png (pipeline assets : load… |
| `transpiler-todo` | 182 | `¤comment` — // TRANSPILER-TODO INCGFX : sCallWindow_Pal ← graphics/pokenav/match_call/call_window.pal (pipeline assets : loadTileBi… |
| `transpiler-todo` | 185 | `¤comment` — // TRANSPILER-TODO INCGFX : sListWindow_Pal ← graphics/pokenav/match_call/list_window.pal (pipeline assets : loadTileBi… |
| `transpiler-todo` | … | *(+7 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/battle_pike.ts` — 18 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 210 | `*non-porté* · ¤comment` — // ─── Socle Battle Frontier NON PORTÉ ────────────────────────────────────────── |
| `marker` | 213 | `*stub* · ¤comment` — // références locales qui LÈVENT à tout accès/appel (Règle 3 : pas de stub muet ; le câblage |
| `marker` | 217 | `*non-porté*` — get: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); }, |
| `marker` | 218 | `*non-porté*` — set: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); }, |
| `marker` | 225 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `void SetBattleFacilityTrainerGfxId(u16 trainerId, u8 arrayId)` (battle_tower.c). */ |
| `marker` | 227 | `*non-porté*` — throw new Error('non porté : SetBattleFacilityTrainerGfxId (socle battle_tower)'); |
| `marker` | 229 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `u16 GetRandomScaledFrontierTrainerId(u8 challengeNum, u8 battleNum)` (battle_tower.c). */ |
| `marker` | 231 | `*non-porté*` — throw new Error('non porté : GetRandomScaledFrontierTrainerId (socle battle_tower)'); |
| `marker` | 233 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `void SetFrontierBrainObjEventGfx(u8 facility)` (frontier_util.c). */ |
| `marker` | 235 | `*non-porté*` — throw new Error('non porté : SetFrontierBrainObjEventGfx (socle frontier_util)'); |
| `marker` | 237 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `void FrontierSpeechToString(const u16 *words)` (battle_tower.c). */ |
| `marker` | 239 | `*non-porté*` — throw new Error('non porté : FrontierSpeechToString (socle battle_tower)'); |
| `marker` | 241 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `u8 GetPlayerSymbolCountForFacility(u8 facility)` (frontier_util.c). */ |
| `marker` | 243 | `*non-porté*` — throw new Error('non porté : GetPlayerSymbolCountForFacility (socle frontier_util)'); |
| `marker` | 245 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `s32 GetHighestLevelInPlayerParty(void)` (battle_tower.c). */ |
| `marker` | 247 | `*non-porté*` — throw new Error('non porté : GetHighestLevelInPlayerParty (socle battle_tower)'); |
| `marker` | 249 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `u8 GetAilmentFromStatus(u32 status)` (party_menu.c). */ |
| `marker` | 251 | `*non-porté*` — throw new Error('non porté : GetAilmentFromStatus (party_menu.c)'); |

#### `src/battle_tent.ts` — 18 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 36 | `*non-porté* · ¤comment` — // ─── Socle Battle Frontier NON PORTÉ ────────────────────────────────────────── |
| `marker` | 40 | `*stub* · ¤comment` — // pas de stub muet ; le câblage futur du Frontier forcera la réconciliation). |
| `marker` | 43 | `*non-porté*` — get: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); }, |
| `marker` | 44 | `*non-porté*` — set: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); }, |
| `marker` | 56 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `SetBattleFacilityTrainerGfxId(u16 trainerId, u8 arrayId)` (battle_tower.c). */ |
| `marker` | 58 | `*non-porté*` — throw new Error('non porté : SetBattleFacilityTrainerGfxId (socle battle_tower)'); |
| `marker` | 60 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `FrontierSpeechToString(const u16 *words)` (battle_tower.c). */ |
| `marker` | 62 | `*non-porté*` — throw new Error('non porté : FrontierSpeechToString (socle battle_tower)'); |
| `marker` | 64 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `GetFrontierTrainerName(u8 *dst, u16 trainerId)` (battle_tower.c). */ |
| `marker` | 66 | `*non-porté*` — throw new Error('non porté : GetFrontierTrainerName (socle battle_tower)'); |
| `marker` | 68 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `SaveGameFrontier(void)` (frontier_util.c). */ |
| `marker` | 70 | `*non-porté*` — throw new Error('non porté : SaveGameFrontier (socle frontier_util)'); |
| `marker` | 72 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `DoBattleFactorySelectScreen`/`DoBattleFactorySwapScreen` (battle_factory_screen.c). */ |
| `marker` | 74 | `*non-porté*` — throw new Error('non porté : DoBattleFactorySelectScreen (battle_factory_screen)'); |
| `marker` | 77 | `*non-porté*` — throw new Error('non porté : DoBattleFactorySwapScreen (battle_factory_screen)'); |
| `marker` | 79 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `CopyItemName(u16 itemId, u8 *dst)` (item.c). Variante locale non |
| `marker` | 80 | `*stub* · ¤comment` — *  partagée (item_menu.ts:989 → retourne string) : stub 2-arg décomp, INERTE. */ |
| `marker` | 82 | `*non-porté*` — throw new Error('non porté : CopyItemName (item.c, non exporté en commun)'); |

#### `src/match_call.ts` — 18 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (revue humaine faite sur le chemin critique SelectMatchCallMessage) |
| `transpiler-todo` | 1875 | `¤comment` — // TRANSPILER-TODO INCGFX : sMatchCallWindow_Pal ← graphics/pokenav/match_call/window.png (pipeline assets : loadTileBi… |
| `transpiler-todo` | 1878 | `¤comment` — // TRANSPILER-TODO INCGFX : sMatchCallWindow_Gfx ← graphics/pokenav/match_call/window.png (pipeline assets : loadTileBi… |
| `transpiler-todo` | 1881 | `¤comment` — // TRANSPILER-TODO INCGFX : sPokenavIcon_Pal ← graphics/pokenav/match_call/nav_icon.png (pipeline assets : loadTileBin/… |
| `transpiler-todo` | 1884 | `¤comment` — // TRANSPILER-TODO INCGFX : sPokenavIcon_Gfx ← graphics/pokenav/match_call/nav_icon.png (pipeline assets : loadTileBin/… |
| `transpiler-todo` | … | *(+13 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/scrcmd.ts` — 18 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 810 | `*console.warn*` — else { console.warn(`[trainerbattle] event-script '${label}' absent de l'image`); StopScript(ctx); } |
| `marker` | 181 | `*no-op* · ¤comment` — *  → template introuvable → no-op → Mom invisible. |
| `marker` | 328 | `*stub*` — SetupNativeScript(ctx, () => true); // stub temporaire (slice sans natifs) |
| `marker` | 571 | `*non-porté* · ¤comment` — // (exempt) → ClearRamScript non porté ; le StopScript est le comportement observable. |
| `marker` | 611 | `*non-porté* · ¤comment` — // ─── mon pic (1:1 scrcmd.c:1446/1456) — stubs identiques au parsé (ScriptMenu_ShowPokemonPic non porté) ── |
| `marker` | 628 | `*non-porté* · ¤comment` — // pokemartdecoration / pokemartdecoration2 : boutiques DÉCO non portées (decoration.c) — |
| `marker` | 629 | `*stub,no-op* · ¤comment` — // stub identique au parsé : consomme le ptr u32, no-op. |
| `marker` | 633 | `*stub,non-porté* · ¤comment` — // ─── checkpcitem (1:1 scrcmd.c:540) — stub VAR_RESULT=0 (PC items non portés, comme le parsé) ── |
| `marker` | 635 | `*stub* · ¤comment` — // (pc-items.ts ; ex-stub setResult(0) upgradé 2026-07-02). |
| `marker` | 644 | `*non-porté* · ¤comment` — // ─── Tier B — sous-systèmes NON portés (slot machine / rotating-tile puzzle / contest / |
| `marker` | 658 | `*no-op*` — const ScrCmd_trywondercardscript: ScrCmdFunc = () => false;       // :2227 (0 arg ; RAM script non valide → no-op) |
| `marker` | 672 | `*no-op* · ¤comment` — // erasebox : lit 4 octets, no-op (= décomp Menu_EraseWindowRect commenté). |
| `marker` | 681 | `*no-op* · ⚑legit-ctx · ¤comment` — // showelevmenu (:2121) : corps décomp intégralement commenté → no-op sans lecture. |
| `marker` | 700 | `*no-op* · ¤comment` — // messageautoscroll : lit le ptr texte (u32) puis no-op (dette autoscroll U-tier = parsé). |
| `marker` | 734 | `*no-op* · ¤comment` — // braille (UI braille — font non extraite → no-op = parsé). braillemessage lit le ptr (u32). |
| `marker` | 1215 | `*no-op* · ¤comment` — // = no-op mais LISENT leurs octets (alignement du flux). |
| `marker` | 1222 | `*no-op* · ¤comment` — // uniquement (0 usage solo, vérifié 2026-07-02) → consomment leurs octets 1:1, no-op. |
| `marker` | 1230 | `*no-op*` — const ScrCmd_copybyte: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); ScriptReadWord(ctx); return false; }; // no-op (= p… |

#### `src/battle_anim.ts` — 17 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `warnOnce` | 1425 | `*createsprite:*` — _warnOnceDette('createsprite:' + (tplName ?? ('0x' + (templatePtr >>> 0).toString(16)))); |
| `warnOnce` | 1481 | `*createvisualtask:*` — _warnOnceDette('createvisualtask:' + (taskName ?? ('0x' + (taskFuncPtr >>> 0).toString(16)))); |
| `warnOnce` | 1492 | function _warnOnceDette(what: string): void { |
| `warnOnce` | 1982 | `*createsoundtask:*` — _warnOnceDette('createsoundtask:' + (fnName ?? ('0x' + (funcPtr >>> 0).toString(16)))); |
| `console-miss` | 342 | `*console.warn*` — console.warn(`[battle-anim] unknown opcode 0x${(opcode ?? -1).toString(16)} @ PC ${_pc} — script termine (dette).`); |
| `console-miss` | 454 | `*console.warn*` — console.warn(`[battle-anim] label "${name}" absent du bytecode`); |
| `console-miss` | 2542 | `*console.warn*` — console.warn(`[anim-bridge] ${name}: callback ${g.callback} non porté (vague à venir) — fallback.`); |
| `marker` | 550 | `*no-op* · ¤comment` — // gSprites[objet]=undefined -> DestroySprite(objet)=no-op SILENCIEUX -> |
| `marker` | 934 | `*stub* · ¤comment` — /** Stub task helper : pour tasks anim_bg (Task_InitUpdateMonBg, etc.). |
| `marker` | 1033 | `*stub* · ¤comment` — // PALETTE FADE STUB WRAPPERS (= cascade vers notre runtime) |
| `marker` | 1037 | `*no-op* · ¤comment` — *  (appelé par Task_FadeToBg, battle_anim.c:1148-1183). Purge de la rustine no-op : |
| `marker` | 2044 | `*stub* · ¤comment` — // un STUB → la copie monbg_static du Dig restait affichée à (40,0) après le |
| `marker` | 2051 | `*stub* · ¤comment` — // le décomp (stub-true côté port → restaure toujours ; suffisant pour ne plus perdre le partenaire). |
| `marker` | 2220 | `*stub* · ¤comment` — /** Stub : GetBattlerSpriteSubpriority (battle_anim_mons.c). |
| `marker` | 2226 | `*stub* · ¤comment` — /** Stub : GetAnimBattlerSpriteId (battle_anim_mons.c). |
| `marker` | 2233 | `*stub* · ¤comment` — /** Stub : SetAnimBgAttribute (bg.c). */ |
| `marker` | 2542 | `*non-porté*` — console.warn(`[anim-bridge] ${name}: callback ${g.callback} non porté (vague à venir) — fallback.`); |

#### `src/ereader_helpers.ts` — 17 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 11 | `*stub* · ⚑legit-ctx · ¤comment` — * l'appel (Règle 3 : pas de stub muet). |
| `marker` | 65 | `*non-porté* · ⚑legit-ctx · ¤comment` — /** 1:1 `gShouldAdvanceLinkState` (link.c) — socle link non porté ; variable module INERTE. */ |
| `marker` | 67 | `*no-op* · ⚑legit-ctx · ¤comment` — /** Exemption matériel : `VBlankIntrWait()` (main.c) — attente d'interruption VBlank, no-op web. */ |
| `marker` | 70 | `*non-porté* · ¤comment` — // ─── Socle sauvegarde/flash + macros de layout NON PORTÉS ───────────────────── |
| `marker` | 74 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `u8 TryWriteSpecialSaveSector(u8 sector, u8 *src)` (save.c). */ |
| `marker` | 76 | `*non-porté*` — throw new Error('non porté : TryWriteSpecialSaveSector (socle save/flash)'); |
| `marker` | 78 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `u8 TryReadSpecialSaveSector(u8 sector, u8 *dst)` (save.c). */ |
| `marker` | 80 | `*non-porté*` — throw new Error('non porté : TryReadSpecialSaveSector (socle save/flash)'); |
| `marker` | 82 | `*no-op* · ¤comment` — /** NDEBUG (politique préproc) : `AGB_ASSERT_EX(cond, file, line)` = no-op. */ |
| `marker` | 83 | `*no-op*` — function AGB_ASSERT_EX(_cond: boolean, _file: string, _line: number): void { /* NDEBUG : no-op */ } |
| `marker` | 84 | `*non-porté* · ¤comment` — /** NON PORTÉ — layout mémoire des structs Trainer Hill non modélisé (sizeof/offsetof). */ |
| `marker` | 86 | `*non-porté*` — throw new Error(`non porté : ${name} (layout struct Trainer Hill non modélisé)`); |
| `marker` | 88 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `memset(dst, val, n)` sur struct non modélisée. */ |
| `marker` | 90 | `*non-porté*` — throw new Error('non porté : memset (struct Trainer Hill non modélisée)'); |
| `marker` | 92 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `memcpy(dst, src, n)` sur struct non modélisée. */ |
| `marker` | 94 | `*non-porté*` — throw new Error('non porté : memcpy (struct Trainer Hill non modélisée)'); |
| `marker` | 156 | `*stub* · ¤comment` — // → proxy qui LÈVE à tout accès (Règle 3/4 : marqueur honnête, pas de stub muet). |

#### `src/fieldmap.ts` — 16 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 914 | `*console.warn*` — console.warn(`[map-loader] connection ${connection.destMap} not in cache, skipping fill (= prefetch missed)`); |
| `console-miss` | 1377 | `*console.warn*` — console.warn(`[map-loader] TransitionToConnection: ${missingConns.length} connection(s) not cached (= ${missingConns.ma… |
| `marker` | 540 | `*placeholder*` — return 0;  // placeholder, resolved via raw string |
| `marker` | 820 | `*TODO* · ¤comment` — *  Audit Opus §3.3 : `RunOnLoadMapScript` était commenté TODO Phase 4.7 mais |
| `marker` | 827 | `*TODO* · ¤comment` — // SetOccupiedSecretBaseEntranceMetatiles(gMapHeader.events);  // TODO Phase 4.7 |
| `marker` | 1375 | `*no-op* · ¤comment` — // next hop). Si déjà en cache, no-op rapide. |
| `marker` | 1700 | `*no-op* · ¤comment` — //   (gMapHeader.events) : subsystem Secret Base DÉFÉRÉ (no-op 1:1 pour toutes |
| `marker` | 1701 | `*TODO* · ¤comment` — //   les maps supportées ; InitMap() marque déjà SetOccupied... TODO Phase 4.7 |
| `marker` | 1706 | `*no-op* · ¤comment` — //   subsystem TV DÉFÉRÉ (no-op 1:1 ; aucune TV sur les maps supportées). |
| `marker` | 1938 | `*no-op*` — ApplyGlobalTintToPaletteEntries(destOffset + 1, restEntries);  // no-op Emerald (1:1 décomp) |
| `marker` | 1949 | `*no-op*` — ApplyGlobalTintToPaletteEntries(destOffset, numEntries);  // no-op Emerald (1:1 décomp) |
| `marker` | 1954 | `*no-op* · ¤comment` — *  fonction VIDE marquée UNUSED dans la décomp (vestige FRLG global tint). Portée 1:1 = no-op. */ |
| `marker` | 1960 | `*no-op* · ¤comment` — *  fonction VIDE pour Emerald (le global tint FRLG n'y est pas implémenté). Portée 1:1 = no-op. |
| `marker` | 2031 | `*no-op* · ¤comment` — // include/constants/layouts.h) → setmaplayoutindex warn et no-op. gMapHeader et |
| `marker` | 2034 | `*TODO* · ¤comment` — *  Extraction TODO : générer ce mapping depuis le décomp `include/constants/layouts.h` |
| `marker` | 2046 | `*TODO*` — console.warn(`[map-layout-swap] layoutIdx ${layoutIdx} not in _LAYOUT_IDX_TO_ID — TODO extract from decomp layouts.h`); |

#### `src/item_menu.ts` — 16 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 473 | `*stub* · ¤comment` — // ─── Helpers étapes 4..9 non encore portés — STUB HONNÊTE LOUD ─────────────── |
| `marker` | 508 | `*non-porté* · ¤comment` — // CurrentBattlePyramidLocation()==NONE : pyramide non portée → branche |
| `marker` | 532 | `*placeholder* · ¤comment` — // exitCallbacks externes — résolus au câblage étape 9 (placeholders honnêtes |
| `marker` | 691 | `*stub*` — ListMenuLoadStdPalAt(BG_PLTT_ID(12), 1);                  // :2465 (maillon stub) |
| `marker` | 1256 | `*TODO*` — return rt.CreateTask(Task_BagMenu_HandleInput, 0); // TODO maillon: Task_WallyTutorialBagMenu (flux Wally) |
| `marker` | 1278 | `*no-op* · ¤comment` — //    no-op documenté, résolu en phase nommée, WORKING-MODE §2). ─────────── |
| `marker` | 1482 | `*no-op* · ¤comment` — // (flèches non créées → rien à détruire ; no-op honnête tracké Phase 2). ────── |
| `marker` | 1965 | `*no-op* · ⚑legit-ctx · ¤comment` — *  fichier). SELECT swap = CanSwapItems()==FALSE (étape 7, no-op honnête). |
| `marker` | 1982 | `*no-op* · ¤comment` — // si CanSwapItems (= FIELD/BATTLE non-TMHM/BERRIES). Sinon no-op. |
| `marker` | 2343 | `*stub* · ¤comment` — // l'instant, autres stub-cancel). |
| `marker` | 2348 | `*stub* · ¤comment` — // Stub : on suppose tout item utilisable en battle pour l'instant |
| `marker` | 2677 | `*non-porté* · ¤comment` — // ResetInitialPlayerAvatarState (dismount bike/surf avant warp) non portés. |
| `marker` | 2881 | `*placeholder* · ¤comment` — *  des placeholders {PLAYER}/{STR_VAR_1}/{STR_VAR_2}/{PAUSE_UNTIL_PRESS}/escapes — |
| `marker` | 3153 | `*placeholder* · ¤comment` — *  des placeholders {STR_VAR_n} (posés via setStringVar) — le `¥` vient du string. */ |
| `marker` | 3383 | `*no-op* · ¤comment` — // ("Aucun objet enregistré.") → pour l'instant : SELECT sans objet = no-op (false). |
| `marker` | 3514 | `*stub* · ¤comment` — /** STUB local — fade puis fermeture du sac. Le vrai est dans bag-menu.ts. */ |

#### `src/battle_controllers.ts` — 15 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 214 | `*no-op* · ⚑legit-ctx · ¤comment` — *  Link battle variant — pour notre port (= laissé de côté), noop documenté. */ |
| `marker` | 216 | `*no-op* · ⚑legit-ctx · ¤comment` — // User dit "laisse de côté link", noop documenté. |
| `marker` | 408 | `*non-porté* · ¤comment` — // = dette R3 offline (RecordedPlayer non porté) → on pose le chemin non-recorded |
| `marker` | 441 | `*non-porté* · ¤comment` — // Dette R3 : SetControllerToSafari non porté → fallback player. |
| `marker` | 444 | `*non-porté* · ¤comment` — // Dette R3 : SetControllerToWally non porté → fallback player. |
| `marker` | 498 | `*no-op* · ¤comment` — // 1:1 décomp ll. 100-104 : buffer party order (noop offline). |
| `marker` | 594 | `*placeholder* · ¤comment` — // (= placeholder for future Phase 1.4 events). |
| `marker` | 611 | `*stub* · ¤comment` — *  futur. Appelé par tickBattleControllers (= Phase 1 stub clear immédiat). */ |
| `marker` | 1274 | `*non-porté* · ¤comment` — // palette" signalé user. Seul ARENA_WIN_JUDGMENT_TEXT garde FALSE — non porté |
| `marker` | 1280 | `*non-porté* · ¤comment` — //  uniquement, jamais en B_WIN_TYPE_NORMAL → branche non portée.) |
| `marker` | 1372 | `*no-op*` — } catch { /* noop */ } |
| `marker` | 1485 | `*no-op* · ¤comment` — /** 1:1 décomp `BattleControllerDummy` (battle_controllers.c). No-op callback. |
| `marker` | 1489 | `*no-op* · ¤comment` — // 1:1 : callback no-op (le battler n'a pas encore de controller assigné). |
| `marker` | 1494 | `*no-op* · ⚑legit-ctx · ¤comment` — // Dette R3 : link battle handshake. Notre port : noop (no link battle). |
| `marker` | 1512 | `*stub* · ¤comment` — *  gBattleHistory.trainerItems depuis gTrainers[opponent].items. L'ancien stub local |

#### `src/engine/bag/bag-screen.ts` — 15 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 15 | `*TODO* · ¤comment` — *   A         : "use" message (= TODO real use logic en Phase 6+) |
| `marker` | 234 | `*stub*` — \| 'message'           // Generic field message (Use stub etc.) |
| `marker` | 552 | `*no-op* · ¤comment` — // _spawnBagSpriteOam dans _setupBackgroundTilemap. No-op pour pas casser |
| `marker` | 686 | `*TODO* · ¤comment` — // → petit badge "HM" 16×16. TODO : extraire hm_icon.png + blit. Pour |
| `marker` | 713 | `*TODO* · ¤comment` — // TODO étape 2 : blit du select_button.png (palette dédiée nécessaire = |
| `marker` | 1336 | `*placeholder* · ¤comment` — //   .matrixNum = 4 (= placeholder dans la struct, override par alloc) |
| `marker` | 1364 | `*no-op* · ¤comment` — //   sprite has affineMode != OFF, sinon no-op). |
| `marker` | 1727 | `*non-porté* · ¤comment` — *  Cas non portés (= cascade vers screens U-tier non encore portés) : |
| `marker` | 1869 | `*non-porté*` — console.warn('[bag-battle] battleUseFunc non porte:', useFunc, '(dette)'); |
| `marker` | 1876 | `*non-porté* · ¤comment` — // un fake — chaque action demande CB2 swap vers screen non porté). |
| `marker` | 2782 | `*no-op* · ¤comment` — *  frame (cf. decomp-runtime.ts:2047+), donc no-op. Marker pour le naming. */ |
| `marker` | 3071 | `*no-op* · ¤comment` — // ScanlineEffect_Stop (= no-op chez nous). |
| `marker` | 3143 | `*no-op* · ¤comment` — // AllocateBagItemListBuffers (= no-op, on n'alloc pas). |
| `marker` | 3167 | `*no-op* · ¤comment` — // CreateItemMenuSwapLine (= line marker pour swap mode, no-op). |
| `marker` | 3179 | `*no-op* · ¤comment` — // PrepareTMHMMoveWindow (= no-op chez nous). |

#### `src/field_effect_helpers.ts` — 15 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 50 | `*stub* · ¤comment` — *   ⏳ reste : reflets, shadow (stub à refaire, bloqué), long grass, footprints, surf blob, |
| `marker` | 1154 | `*non-porté* · ¤comment` — // ⚠️ DÉPENDANCE NON PORTÉE : FLDEFF_FIELD_MOVE_SHOW_MON (le Pokémon apparaît, effet commun à TOUS |
| `marker` | 1156 | `*no-op* · ¤comment` — // est gardé 1:1 mais no-op → `FieldEffectActiveListContains(FLDEFF_FIELD_MOVE_SHOW_MON)` = false → |
| `marker` | 1374 | `*no-op* · ¤comment` — // Séquence : preventStep → (show-mon no-op) → TryDoDiveWarp (warp vers la map underwater/surface). |
| `marker` | 1376 | `*no-op,non-porté* · ¤comment` — // ⚠️ MÊME DÉPENDANCE NON PORTÉE QUE SURF/WATERFALL : FLDEFF_FIELD_MOVE_SHOW_MON no-op → |
| `marker` | 1457 | `*no-op* · ¤comment` — //  les CS enchaînaient SANS montrer le mon (= le « no-op » historique de surf/waterfall/dive). |
| `marker` | 1568 | `*no-op* · ¤comment` — /** 1:1 décomp `SpriteCallbackDummy` (sprite.c) — no-op. */ |
| `marker` | 1569 | `*no-op*` — function FMSM_SpriteCallbackDummy(): void { /* no-op */ } |
| `marker` | 1592 | `*placeholder* · ¤comment` — /** Charge le front pic (front.png 64×64) + palette shiny\|normal → peuple le sprite placeholder. |
| `marker` | 2411 | `*no-op* · ¤comment` — // show-mon (no-op) → restore gfx joueur → run le callback de l'effet → preventStep=FALSE. |
| `marker` | 3527 | `*stub* · ¤comment` — //  UpdateRayquazaSpotlightEffect (field_effect_helpers.c:1510) — STUB + relocation. |
| `marker` | 3538 | `*stub* · ¤comment` — // @body-parity-ok stub assumé : 0 caller, bloc FldEff_RayquazaSpotlight (field_effect.c) à porter EN BLOC |
| `marker` | 3540 | `*stub* · ¤comment` — // Stub : implémentation reportée au chantier field_effect.c (cf. en-tête ci-dessus). |
| `marker` | 4083 | `*no-op* · ¤comment` — *  le slot reflet FIXE `reflSlot` QUE si reflectionPaletteTag != NONE — sinon NO-OP (le NPC régulier |
| `marker` | 4195 | `*no-op* · ¤comment` — // spécial(slot 11)/pont. NO-OP pour un NPC régulier (reflectionPaletteTag NONE → slot préchargé). |

#### `src/battle_palace.ts` — 14 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 30 | `*non-porté* · ¤comment` — // ─── Socle Battle Frontier NON PORTÉ ────────────────────────────────────────── |
| `marker` | 33 | `*stub* · ¤comment` — // portés → références locales qui LÈVENT à tout accès/appel (Règle 3 : pas de stub muet ; |
| `marker` | 37 | `*non-porté*` — get: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); }, |
| `marker` | 38 | `*non-porté*` — set: () => { throw new Error(`non porté : ${name} (socle battle_tower/frontier_util)`); }, |
| `marker` | 41 | `*non-porté* · ¤comment` — /** 1:1 `gFacilityTrainers` (battle_tower.c) — pointeur de façade, non porté. */ |
| `marker` | 43 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `SetBattleFacilityTrainerGfxId(u16 trainerId, u8 arrayId)` (battle_tower.c). */ |
| `marker` | 45 | `*non-porté*` — throw new Error('non porté : SetBattleFacilityTrainerGfxId (socle battle_tower)'); |
| `marker` | 47 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `FrontierSpeechToString(const u16 *words)` (battle_tower.c). */ |
| `marker` | 49 | `*non-porté*` — throw new Error('non porté : FrontierSpeechToString (socle battle_tower)'); |
| `marker` | 51 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `SaveGameFrontier(void)` (frontier_util.c). */ |
| `marker` | 53 | `*non-porté*` — throw new Error('non porté : SaveGameFrontier (socle frontier_util)'); |
| `marker` | 55 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `CopyItemName(u16 itemId, u8 *dst)` (item.c). Variante locale non |
| `marker` | 56 | `*stub* · ¤comment` — *  partagée (item_menu.ts:989 → retourne string) : stub 2-arg décomp, INERTE. */ |
| `marker` | 58 | `*non-porté*` — throw new Error('non porté : CopyItemName (item.c, non exporté en commun)'); |

#### `src/field_specials.ts` — 14 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `empty-body` | 450 | `*fn/arrow (heuristique)*` — export function Script_TryGainNewFanFromCounter(): number { return 0; } |
| `empty-body` | 649 | `*fn/arrow (heuristique)*` — export function SpawnCameraObject(): number { return 0; } |
| `marker` | 22 | `*non-porté* · ¤comment` — *    concours (Cool/Beauty/…) restent à 0 tant qu'aucun Pokébloc (non porté) → 1:1 |
| `marker` | 85 | `*non-porté* · ¤comment` — *  PNJ « montre-moi un POKéMON <stat> ». Conditions montent via Pokéblocs (non portés) |
| `marker` | 444 | `*no-op,non-porté* · ¤comment` — *  membre du fan club. Data/UI Lilycove non portée → no-op (état antérieur préservé). */ |
| `marker` | 445 | `*no-op,non-porté*` — export function BufferFanClubTrainerName(): void { /* no-op (data Lilycove non portée) */ } |
| `marker` | 473 | `*no-op,non-porté* · ¤comment` — *  Dette R3 : CB2_ShowDiploma (diploma screen UI) non porté → no-op + log. */ |
| `marker` | 482 | `*non-porté* · ¤comment` — *  Choisit la « chance » d'une machine à sous (Game Corner). PokeNews non porté → |
| `marker` | 503 | `*non-porté* · ¤comment` — // IsPokeNewsActive(POKENEWS_GAME_CORNER=2, STATE_ACTIVE=2) ; pokeNews non porté → vide. |
| `marker` | 548 | `*no-op* · ¤comment` — *  ⚠️ DÉFÉRÉ no-op (l'ancien bridge globalThis __game_bridge n'était jamais fourni = même |
| `marker` | 647 | `*no-op* · ¤comment` — *  caméra suit (TrySpawnObjectEvent OBJ_EVENT_GFX_CAMERA + CameraObject_Init). DÉFÉRÉ no-op |
| `marker` | 648 | `*non-porté* · ¤comment` — *  (object event CAMERA non porté). */ |
| `marker` | 652 | `*no-op,non-porté* · ¤comment` — *  DÉFÉRÉ no-op (object event CAMERA non porté). */ |
| `marker` | 653 | `*no-op,non-porté*` — export function RemoveCameraObject(): void { /* no-op — object event CAMERA non porté */ } |

#### `src/main_menu.ts` — 12 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 1164 | `*@ts-nocheck* · ¤comment` — // ─── Globals exposure pour auto callbacks (= eval scope @ts-nocheck) ──────── |
| `ts-suppress` | 1188 | `*@ts-nocheck* · ¤comment` — // (@ts-nocheck) → maintenant TYPÉE. Helpers de rendu (InitMainMenu, DrawMainMenu*, |
| `empty-body` | 1287 | `*fn/arrow (heuristique)*` — export const SpriteCB_Null: SpriteCallback = (_sprite, _rt) => {}; |
| `marker` | 623 | `*no-op* · ¤comment` — *  Retourne 0=GARÇON, 1=FILLE, -1=B pressed (no-op for Birch), -2=still processing. |
| `marker` | 704 | `*TODO* · ¤comment` — // (= ils étaient hors-scope là-bas car scene-Birch-specific). Tous /* TODO */ |
| `marker` | 1076 | `*no-op* · ¤comment` — // (Ex-stubs no-op locaux qui SHADOWAIENT les vrais ports de list_menu.ts — |
| `marker` | 1108 | `*no-op* · ¤comment` — // Notre DmaFill16/32 sont no-op (= préserve LZ77 char data déjà chargé). |
| `marker` | 1118 | `*no-op* · ¤comment` — // est implicite via `LoadPalette` qui no-op si symbol non-cache.) |
| `marker` | 1253 | `*stub* · ¤comment` — // Unresolved constants (auto-stub at 0; replace with real values when needed) : |
| `marker` | 1286 | `*placeholder* · ¤comment` — *  aussi (callback placeholder des sprites Birch/Lotad). */ |
| `marker` | 2546 | `*no-op* · ¤comment` — /** ⚠️ Generic patch (post-transpile-patches.mjs) — VBlankCB no-op. |
| `marker` | 2549 | `*no-op*` — const VBlankCB: () => void = () => { /* no-op */ }; |

#### `src/mystery_event_script.ts` — 12 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 17 | `*non-porté* · ¤comment` — * Fonctions décomp NON PORTÉES appelées ici → références locales qui LÈVENT (pas de |
| `marker` | 18 | `*stub* · ¤comment` — * stub silencieux) : InitRamScript (script.c:381), ValidateEReaderTrainer |
| `marker` | 58 | `*non-porté* · ¤comment` — // ─── Fonctions décomp NON PORTÉES appelées par ce module ────────────────────── |
| `marker` | 59 | `*stub* · ¤comment` — // Références locales qui LÈVENT (pas de stub silencieux). Fichier INERTE : jamais |
| `marker` | 61 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `InitRamScript` (script.c:381). Écrit un script en RAM (RAM-script |
| `marker` | 62 | `*non-porté* · ¤comment` — *  overworld) : dépend de ClearRamScript / CalculateRamScriptChecksum, non portés. */ |
| `marker` | 64 | `*non-porté*` — throw new Error('non porté : InitRamScript (mystery event)'); |
| `marker` | 66 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `ValidateEReaderTrainer` (battle_tower.c:2933). Dépend de |
| `marker` | 67 | `*non-porté* · ¤comment` — *  ClearEReaderTrainer, non porté. */ |
| `marker` | 69 | `*non-porté*` — throw new Error('non porté : ValidateEReaderTrainer (mystery event)'); |
| `marker` | 71 | `*non-porté* · ¤comment` — /** NON PORTÉ — 1:1 `UnlockTrendySaying` (easy_chat.c:5453). */ |
| `marker` | 73 | `*non-porté*` — throw new Error('non porté : UnlockTrendySaying (mystery event)'); |

#### `src/party_menu.ts` — 12 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 26 | `*non-porté* · ¤comment` — *   - Reste non porté = sous-systèmes hors jeu de base : Battle Frontier |
| `marker` | 1168 | `*no-op* · ¤comment` — // renverrait "ITEM_TM06" (enum) → RemoveBagItem no-op silencieux. |
| `marker` | 1192 | `*non-porté*` — throw new Error('CanMonLearnTMTutor: branche move-tutor non portée (gTutorMoves)'); |
| `marker` | 1702 | `*placeholder* · ¤comment` — /** Spawn Pokémon icon OAM per slot. MVP : just placeholders (= no actual |
| `marker` | 2443 | `*non-porté* · ¤comment` — *  (Battle Pyramid bag non porté → toujours CB2_ReturnToBagMenu.) */ |
| `marker` | 3162 | `*placeholder* · ¤comment` — /** Affiche un message softboiled FR (placeholders déjà résolus) puis attend A/B |
| `marker` | 3320 | `*placeholder* · ¤comment` — *  item_used_msg). Strip des placeholders {…} (PAUSE_UNTIL_PRESS, etc.). */ |
| `marker` | 3335 | `*stub* · ⚑legit-ctx · ¤comment` — *  le stub "dette R3". `action` = _actionList[_actionCursor] (>= MENU_FIELD_MOVES). |
| `marker` | 3492 | `*no-op* · ¤comment` — *    START → MoveCursorToConfirm (= no-op si pas chooseHalf) |
| `marker` | 3882 | `*no-op* · ¤comment` — // FR "déjà en plein combat" / "plus d'énergie" = polish ultérieur ; ici no-op). |
| `marker` | 3946 | `*no-op* · ¤comment` — // START: en single layout pas de Confirm → no-op |
| `marker` | 4502 | `*stub* · ¤comment` — /** Stub kept pour start-menu sub-state compat. CB2 swap take over. */ |

#### `src/battle_controller_opponent.ts` — 11 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 695 | `*console.warn*` — console.warn('[SwitchIn_ShowHealthbox] sprite mon absent (création échouée) — continue sans (dette party-storage[1+])'); |
| `marker` | 571 | `*no-op* · ¤comment` — *  1×/frame depuis BattleMainCB2 (comme tickBattleIntroSlideL). No-op si rien en attente. */ |
| `marker` | 776 | `*no-op*` — resetShinyAnimFlags: (m?.resetShinyAnimFlags as never) ?? (() => { /* no-op */ }), |
| `marker` | 1037 | `*no-op* · ¤comment` — // `__battleAnim.initAndLaunchSpecialAnimation` n'existait nulle part = no-op). |
| `marker` | 1061 | `*stub* · ¤comment` — // species → y_offset (front-pic coords) : _getMonFrontPicYOffset stub=8 (Dette R3) → ~8 steps |
| `marker` | 1148 | `*stub* · ¤comment` — // BUG CORRIGÉ : c'était un STUB (`void stringId; ExecCompleted()`) → AUCUN message |
| `marker` | 1386 | `*stub* · ¤comment` — *  Était un STUB → le 2e mon dresseur n'était jamais chargé (freeze switch-in). */ |
| `marker` | 1544 | `*no-op*` — void import('./pokeball').then((m) => m.DoHitAnimHealthboxEffect?.(hitBattler)).catch(() => { /* noop */ }); |
| `marker` | 1650 | `*no-op* · ¤comment` — /** 1:1 decomp `OpponentDummy()` (battle_controller_opponent.c) — no-op (le Task drive le send-out). */ |
| `marker` | 1651 | `*no-op*` — function OpponentDummy(): void { /* no-op */ } |
| `marker` | 1843 | `*stub* · ¤comment` — *  (CompleteOnFinishedBattleAnimation :718). Était un STUB → l'anim de stats |

#### `src/battle_interface.ts` — 11 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 174 | `*no-op* · ¤comment` — *  gHealthboxSpriteIds). Le default no-op ci-dessous n'est utilisé qu'AVANT ce |
| `marker` | 177 | `*no-op* · ¤comment` — // default no-op (overridé au boot par setMoveBattleBarGraphicallyHook). |
| `marker` | 646 | `*non-porté* · ¤comment` — // (Clause BATTLE_TYPE_ARENA omise : arenaLostMons non porté, type jamais set.) |
| `marker` | 1397 | `*no-op* · ¤comment` — *     boxes ; no-op en single opponent car hpNumbersNoBars=0). |
| `marker` | 1841 | `*no-op* · ¤comment` — // Si metaW === widthTiles → metatile order == row-major order, no-op. |
| `marker` | 1887 | `*no-op* · ¤comment` — // Comme metaW (8) === widthTiles (8), row-major == metatile order, no-op. |
| `marker` | 2108 | `*no-op* · ¤comment` — // IsDoubleBattle → single INCHANGÉ, dispatch no-op en single). |
| `marker` | 2464 | `*no-op* · ¤comment` — *  jusqu'à x2 == 0 (= ~23 frames à 5px). No-op si aucune slide active. */ |
| `marker` | 2819 | `*placeholder* · ¤comment` — // Sans ce fill, l'icône rend avec l'index 12 = placeholder BLEU de la palette |
| `marker` | 2948 | `*no-op* · ¤comment` — // rien par défaut) → ce primitive box-digits est no-op. Single player : INCHANGÉ. |
| `marker` | 3004 | `*no-op* · ¤comment` — *  Prend le healthboxSpriteId (1:1 signature décomp) → reconstruit le handle. No-op si |

#### `src/option_menu.ts` — 11 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 528 | `*@ts-nocheck* · ¤comment` — // `decomp-data/src/option_menu-callbacks-auto.ts` (@ts-nocheck) → maintenant TYPÉE. |
| `ts-suppress` | 821 | `*@ts-nocheck* · ¤comment` — // est @ts-nocheck transpilé C-style cassé. Les vraies impls 1:1 viennent de |
| `ts-suppress` | 826 | `*@ts-nocheck* · ¤comment` — // retiré — les fichiers `*-all-auto.ts` du barrel sont @ts-nocheck C-style cassés |
| `marker` | 507 | `*no-op* · ¤comment` — // Phase D-cleanup audit session 83 : retiré les stubs no-op locaux qui |
| `marker` | 673 | `*TODO* · ¤comment` — *  Fix session 82 : le TODO scene-transition (SetMainCallback2 vers |
| `marker` | 696 | `*TODO* · ¤comment` — *    - case 11 : SetMainCallback2(MainCB2) réel (était un TODO transpileur). */ |
| `marker` | 804 | `*no-op* · ¤comment` — /** Source: option_menu.c → MainCB2 (no-op : le runtime drive RunTasks + |
| `marker` | 807 | `*no-op* · ¤comment` — // No-op : runtime drives the rest. |
| `marker` | 812 | `*no-op* · ¤comment` — *  le flash bright pendant CB2_Init), donc body no-op suffit. */ |
| `marker` | 814 | `*no-op* · ¤comment` — // No-op : runtime appelle TransferPlttBuffer automatiquement quand vblankCallback est set. |
| `marker` | 828 | `*no-op* · ¤comment` — // directement dans les call-sites. flattenBarrelOnGlobalThis() ci-dessous devient no-op. |

#### `src/pokemon_storage_system.ts` — 10 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 1477 | `*console.warn*` — .catch((e) => console.warn('[pc-storage] item_info_frame.png absent :', e)); |
| `empty-body` | 116 | `*fn/arrow (heuristique)*` — function GetBgAttribute(_bg: number, _attr: number): number { return 0; } |
| `marker` | 1377 | `*no-op* · ¤comment` — // DoScheduledBgTilemapCopiesToVram : nos copies BG sont synchrones (ScheduleBgCopyTilemapToVram no-op). |
| `marker` | 3712 | `*stub* · ¤comment` — // (script « PC POKéMON »). L'écran des boîtes (EnterPokeStorage) = phase 2 (stub). |
| `marker` | 4617 | `*placeholder* · ¤comment` — // flux menu ; placeholder {DYNAMIC 0} → nom du mon affiché/relâché (DynamicPlaceholderTextUtil). ─── |
| `marker` | 4658 | `*placeholder* · ¤comment` — // Placeholder décomp {DYNAMIC 0} (= DynamicPlaceholderTextUtil_SetPlaceholderPtr(0, …)) : substitution |
| `marker` | 5315 | `*no-op* · ¤comment` — // Le décomp recopie sBoxTitleColors[wp] vers gPlttBufferUnfaded ; ici no-op 1:1 effectif. |
| `marker` | 5321 | `*non-porté*` — const WALDA_WALLPAPERS_COUNT = 5;      // ARRAY_COUNT(sWaldaWallpapers) — tables gfx non portées (inerte) |
| `marker` | 5830 | `*placeholder* · ¤comment` — // Adaptation moteur : on NE libère PAS globalement les buffers ici. Cf. [[pitfall-window-placeholder-flush-erases-fram… |
| `marker` | 5861 | `*no-op* · ¤comment` — // 1er frame overworld. Le faire ici (avant OW) serait un no-op. Cf. [[diag-pc-center-magenta-camera-decadree]]. |

#### `src/engine/battle/script-interpreter.ts` — 9 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 191 | `*no-op* · ¤comment` — /** 0x83 nop / unused slots → no-op + advance. */ |
| `marker` | 281 | `*stub* · ¤comment` — *  contrôleur finis). Était un stub « avance toujours » → les scripts enchaînaient |
| `marker` | 298 | `*stub* · ¤comment` — // Note : real byte compare via cmd-niveau-33 (= override ce stub). |
| `marker` | 306 | `*stub* · ¤comment` — // Note : real write via cmd-niveau-33 (= override ce stub). |
| `marker` | 312 | `*stub* · ¤comment` — /** Generic stub : log warn + advance (= aucun arg consumé, donc next opcode |
| `marker` | 335 | `*stub*` — console.warn(`[battle/script-interpreter] stub opcode ${name} — non override par cmd-niveau-* (= rare)`); |
| `marker` | 345 | `*stub* · ¤comment` — // Default ALL slots to stub-by-name. Real handlers below + cmd-niveau-N |
| `marker` | 356 | `*stub* · ¤comment` — // 0x2E setbyte : installed by cmd-niveau-33 (= utilise memory-map). Le legacy stub |
| `marker` | 367 | `*stub* · ¤comment` — // Legacy stub record kept dead for reference — OPCODE_NAMES above |

#### `src/evolution_scene.ts` — 9 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 398 | `*console.warn*` — if (!tiles) { console.warn('[evolution_scene] tiles absentes pour position', position); return 64; } |
| `marker` | 28 | `*no-op* · ¤comment` — *   - SetHBlankCallback : pas de HBlank plateforme (EvoDummyFunc = vide) — no-op doc. |
| `marker` | 184 | `*placeholder* · ¤comment` — /** Encode un gText_* (strings.json FR) en bytes charmap, placeholders {B_COPY_VAR_1} |
| `marker` | 219 | `*non-porté* · ⚑legit-ctx · ¤comment` — // ─── Helpers trade.c NON PORTÉS (fail-fast — link trade = P4, 0 caller vivant) ── |
| `marker` | 220 | `*non-porté* · ⚑legit-ctx` — function LoadTradeAnimGfx(): void { throw new Error('[evolution_scene] LoadTradeAnimGfx : trade.c non porté (link trade… |
| `marker` | 221 | `*non-porté* · ⚑legit-ctx` — function DrawTextOnTradeWindow(_windowId: number, _text: Uint8Array \| string, _speed: number): void { throw new Error('… |
| `marker` | 222 | `*non-porté* · ⚑legit-ctx` — function LinkTradeDrawWindow(): void { throw new Error('[evolution_scene] LinkTradeDrawWindow : trade.c non porté (link… |
| `marker` | 223 | `*non-porté* · ⚑legit-ctx` — function InitTradeSequenceBgGpuRegs(): void { throw new Error('[evolution_scene] InitTradeSequenceBgGpuRegs : trade.c n… |
| `marker` | 226 | `*non-porté* · ⚑legit-ctx · ¤comment` — // gWirelessCommType / wireless status indicator (link) : non portés — path trade only. |

#### `src/pokenav_menu_handler.ts` — 9 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 21 | const MAX_POKENAV_MENUITEMS = 6; // 1:1 include/pokenav.h:167. ⚠️ était __wireTodo (stub) → dans sMenuItems |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 20 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `marker` | 21 | `*stub*` — const MAX_POKENAV_MENUITEMS = 6; // 1:1 include/pokenav.h:167. ⚠️ était __wireTodo (stub) → dans sMenuItems |
| `transpiler-todo` | 143 | let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */); |
| `transpiler-todo` | 156 | let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */); |
| `transpiler-todo` | 169 | let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */); |
| `transpiler-todo` | 181 | let menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU_HANDLER, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_Menu) */); |
| `transpiler-todo` | … | *(+1 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/reshow_battle_screen.ts` — 9 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 21 | `*no-op* · ¤comment` — *    gReservedSpritePaletteCount, CpuFastFill VRAM) = abstraits/no-op par le runtime |
| `marker` | 138 | `*no-op* · ¤comment` — // ⚠️ Ce 2e appel n'est PAS un no-op en L : il réserve les slots OBJ 0-3 pour les |
| `marker` | 164 | `*no-op* · ¤comment` — // (async plateforme) → les cases 11-14 (CreateBattlerSprite) deviennent no-op. |
| `marker` | 202 | `*no-op* · ¤comment` — // 1:1 : CreateBattlerSprite(battler) — FUSIONNÉ dans cases 7-10 en L (no-op). |
| `marker` | 217 | `*no-op* · ¤comment` — // d'appel 1:1 présent, no-op tant que le module n'expose pas les fonctions). |
| `marker` | 243 | `*no-op*` — ClearBattleBgCntBaseBlocks();   // 1:1 :161 (no-op plateforme, cf. doc) |
| `marker` | 247 | `*stub*` — FillAroundBattleWindows();      // 1:1 :165 (stub, dette battle_gfx_sfx_util) |
| `marker` | 289 | `*no-op* · ¤comment` — *  loadBattleTextboxAndBackground) → no-op plateforme documenté. */ |
| `marker` | 291 | `*no-op* · ¤comment` — // no-op plateforme (cf. doc) — 1:1 graphe d'appel conservé (default case). |

#### `src/rotating_gate.ts` — 9 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 197 | `*non-porté* · ¤comment` — *  R4 dette : sprites Phaser non portés → tous restent MAX_SPRITES. */ |
| `marker` | 331 | `*no-op,non-porté* · ¤comment` — *  sprite.data[1/2]. R4 dette : sprites non portés → fonction no-op si pas |
| `marker` | 335 | `*non-porté* · ¤comment` — // R4 dette : sprite data[1/2] update non porté (= Phaser sprites pas créés). |
| `marker` | 366 | `*non-porté* · ¤comment` — *  gates entrant/sortant du viewport. R4 dette : sprites Phaser non portés |
| `marker` | 367 | `*no-op* · ¤comment` — *  → no-op. */ |
| `marker` | 371 | `*non-porté* · ¤comment` — // RotatingGate_DestroyGatesOutsideViewport non portés (= sprites Phaser). |
| `marker` | 377 | `*non-porté* · ¤comment` — *  non portés → load config seulement. */ |
| `marker` | 381 | `*non-porté* · ¤comment` — // non portés (= sprites Phaser). |
| `marker` | 450 | `*non-porté* · ¤comment` — // ─── R4 dette explicite (= sprites Phaser non portés) ────────────────────── |

#### `src/title_screen.ts` — 9 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 3 | `*@ts-nocheck* · ¤comment` — // Dissous depuis l'ex-`decomp-data/src/title_screen-callbacks-auto.ts` (@ts-nocheck, |
| `ts-suppress` | 7 | `*@ts-nocheck* · ¤comment` — // (résolues via globalThis sous @ts-nocheck) sont maintenant importées (bloc |
| `ts-suppress` | 39 | `*@ts-nocheck* · ¤comment` — // Constantes GBA (ex-bare globalThis sous @ts-nocheck) — foyers io_reg.h / decomp-runtime / palette. |
| `marker` | 426 | `*no-op* · ¤comment` — // main loop; ours is centralized in DecompRuntime.tickFixed. Keep this no-op |
| `marker` | 432 | `*TODO* · ¤comment` — // ScanlineEffect_InitHBlankDmaTransfer(); // TODO Phase 3+ |
| `marker` | 434 | `*TODO* · ¤comment` — // ProcessSpriteCopyRequests(); // TODO Phase 3+ |
| `marker` | 564 | `*no-op,non-porté* · ¤comment` — // (combo bouton clear-save rare) NON porté → no-op stopgap. |
| `marker` | 572 | `*no-op,non-porté* · ⚑legit-ctx · ¤comment` — // (combo bouton reset-RTC rare) NON porté → no-op stopgap. |
| `marker` | 581 | `*TODO* · ¤comment` — /* TODO scene transition: SetMainCallback2(CB2_InitBerryFixProgram) */; |

#### `src/contest_effect.ts` — 8 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `empty-body` | 303 | `*fn/arrow (heuristique)*` — function SetContestantEffectStringID(contestant: number, effectStringId: number): void {} |
| `empty-body` | 305 | `*fn/arrow (heuristique)*` — function SetContestantEffectStringID2(contestant: number, effectStringId: number): void {} |
| `empty-body` | 307 | `*fn/arrow (heuristique)*` — function SetStartledString(contestant: number, jam: number): void {} |
| `empty-body` | 309 | `*fn/arrow (heuristique)*` — function MakeContestantNervous(p: number): void {} |
| `marker` | 11 | `*placeholder* · ¤comment` — * instances placeholder ZÉRO-INIT (cf. commentaires « INERTE »). Les fonctions de `contest.c` |
| `marker` | 12 | `*no-op,placeholder* · ¤comment` — * pas encore portées (SetContestantEffectStringID…) : placeholders no-op « INERTE », |
| `marker` | 255 | `*placeholder* · ¤comment` — // ═══ état INERTE — placeholders ZÉRO-INIT ═══ |
| `marker` | 299 | `*no-op,placeholder* · ¤comment` — // ═══ fonctions de contest.c pas encore portées — placeholders INERTES (no-op) ═══ |

#### `src/engine/field/region-map.ts` — 8 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 671 | `*console.warn*` — console.warn('[region-map] bitmap font render failed, fallback monospace:', e); |
| `marker` | 144 | `*stub* · ¤comment` — *    depuis party menu). A confirme la destination, B annule. Stub posé pour |
| `marker` | 160 | `*stub* · ¤comment` — *              HM02 Fly transition (= stub, voir RegionMapMode). */ |
| `marker` | 192 | `*stub* · ¤comment` — *  Pour mode FLY (= stub) : si une callback `_flyCallback` était set par |
| `marker` | 208 | `*stub* · ¤comment` — // 1:1 décomp stub Fly : si mode FLY + confirmed + mapSec valide → fire le |
| `marker` | 311 | `*stub* · ¤comment` — // ─── Fly stub (= 1:1 décomp `SetFlyMapCallback`, region_map.c:1700) ───────── |
| `marker` | 317 | `*stub* · ¤comment` — *  la callback à exécuter quand le user confirme une destination Fly. Stub |
| `marker` | 972 | `*unsupported*` — if (!ctx) throw new Error('canvas 2d unsupported'); |

#### `src/intro.ts` — 8 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 5 | `*@ts-nocheck* · ¤comment` — // Dissous depuis l'ex-`decomp-data/src/intro-callbacks-auto.ts` (@ts-nocheck, |
| `ts-suppress` | 127 | `*@ts-nocheck* · ¤comment` — // Constantes GBA (ex-bare globalThis sous @ts-nocheck) — foyers io_reg / decomp-runtime / palette / defines. |
| `marker` | 151 | `*non-porté* · ¤comment` — // Cold-boot init NON porté : les 2 CB2 copyright d'intro.ts (AfterBootup/AfterTitleScreen) |
| `marker` | 177 | `*stub* · ¤comment` — // MANUAL FIX session 71 : remove local stub — real PlayCryInternal already |
| `marker` | 178 | `*stub* · ¤comment` — // imported from decomp-globals (line ~58). The transpileur emits a stub for |
| `marker` | 1089 | `*no-op* · ¤comment` — /* noop ResetSerial */; |
| `marker` | 2335 | `*no-op* · ¤comment` — /** ⚠️ Generic patch (post-transpile-patches.mjs) — VBlankCB no-op. |
| `marker` | 2338 | `*no-op*` — const VBlankCB: () => void = () => { /* no-op */ }; |

#### `src/pokeball.ts` — 8 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 24 | `*stub* · ¤comment` — *     coords) ; battle-anim-throw.ts:498 = stub "Dette R3". A porter avant le chain. |
| `marker` | 63 | `*placeholder* · ¤comment` — // gBallSpriteTemplates placeholders — = métadonnées d'extraction, importées par |
| `marker` | 255 | `*no-op* · ¤comment` — // 1:1 decomp task.c TaskDummy — task passive (no-op) ; le sprite CB prend le relais. |
| `marker` | 256 | `*no-op*` — function TaskDummy(_task: DecompTask): void { /* no-op */ } |
| `marker` | 468 | `*no-op* · ⚑legit-ctx · ¤comment` — // portes. Structure conditionnelle 1:1 conservee (no-op). |
| `marker` | 556 | `*non-porté* · ¤comment` — *  user : pas toucher SE) -> structure d'etats 1:1 conservee, PlayCry_* non portes ; |
| `marker` | 764 | `*TODO* · ¤comment` — // TODO PROPRE : implémenter `subpriority` dans CreateSpriteAtOam + |
| `marker` | 965 | `*no-op* · ¤comment` — // ball callback = SpriteCallbackDummy (= no-op idle, ball est déjà invisible). |

#### `src/battle_controller_player_partner.ts` — 7 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 833 | `*console.warn*` — console.warn('[bcpp] PrintString byte path failed, fallback:', e); |
| `marker` | 334 | `*non-porté* · ¤comment` — /** 1:1 décomp `gPartnerTrainerId` (posé par battle_setup/battle_tower, non porté) : |
| `marker` | 374 | `*no-op* · ¤comment` — /** 1:1 décomp `PlayerPartnerDummy()` / `BattleControllerDummy()` — no-op (Task drive). */ |
| `marker` | 375 | `*no-op*` — function _PlayerPartnerDummy(): void { /* no-op */ } |
| `marker` | 483 | `*stub* · ¤comment` — *  octet (CopyPlayerPartnerMonData) est stubée comme chez les 2 frères (le modèle |
| `marker` | 518 | `*stub* · ¤comment` — *  bytes bufferA → struct mon. Stub comme les 2 frères (modèle objet-JS = dette R3). */ |
| `marker` | 657 | `*non-porté* · ¤comment` — *  front-pic = dette R3 (GetFrontierTrainerFrontSpriteId non porté). Le slide reste |

#### `src/battle_tv.ts` — 7 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `transpiler-todo` | 1337 | `¤comment` — /* TRANSPILER-TODO preproc_def */ |
| `transpiler-todo` | 1356 | `¤comment` — /* TRANSPILER-TODO preproc_call */ |
| `transpiler-todo` | 1380 | `¤comment` — /* TRANSPILER-TODO preproc_def */ |
| `transpiler-todo` | 1381 | `¤comment` — /* TRANSPILER-TODO preproc_def */ |
| `transpiler-todo` | … | *(+3 autres `TRANSPILER-TODO` dans ce fichier — dette transpileur, cf. §faux positifs)* |

#### `src/player_pc.ts` — 7 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 351 | `*no-op* · ¤comment` — // ScheduleBgCopyTilemapToVram(0) — no-op chez nous (auto-tick). |
| `marker` | 998 | `*no-op* · ⚑legit-ctx · ¤comment` — // Fix B2 : `spr.oam.priority` n'existe pas dans DecompSprite (= no-op cast). |
| `marker` | 1654 | `*TODO* · ¤comment` — // 1:1 TODO : fade FADE_TO_BLACK + wait !gPaletteFade.active avant ReadMail. |
| `marker` | 1703 | `*stub* · ¤comment` — // STUB acceptable : draw direct sans clear (= l'overwrite suffit pour les |
| `marker` | 1724 | `*stub* · ¤comment` — // STUB : les swap line sprites ne sont pas spawn dans notre flow actuel |
| `marker` | 1728 | `*no-op* · ¤comment` — // Pas de warn pour éviter le bruit ; le call est silent no-op tant que |
| `marker` | 2069 | `*stub*` — console.warn('[bedroom-pc] _mailboxGive — STUB, port 1:1 complet différé (party_menu.c)'); |

#### `src/rtc.ts` — 7 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 2 | `*no-op* · ⚑legit-ctx · ¤comment` — // (user) : la "pile" RTC = horloge PC (new Date()), SiiRtc*/REG_IME no-op/adaptés, |
| `marker` | 33 | `*no-op* · ⚑legit-ctx · ¤comment` — *   (h/m/s gardent la troncature s8 = no-op, valeurs bornées, 1:1.) |
| `marker` | 101 | `*no-op* · ¤comment` — // h/m/s : troncature s8 1:1 struct Time (no-op, valeurs bornées 0-59/0-23). |
| `marker` | 131 | `*no-op* · ⚑legit-ctx · ¤comment` — *  PAS d'équivalent navigateur → no-op (structure 1:1 conservée). */ |
| `marker` | 135 | `*no-op* · ⚑legit-ctx · ¤comment` — *  `REG_IME = sSavedIme;`. No-op web (pas de REG_IME). */ |
| `marker` | 206 | `*no-op* · ⚑legit-ctx · ¤comment` — *  chip. Web : la "pile" = horloge PC (non réinitialisable) → no-op (structure 1:1). |
| `marker` | 216 | `*stub* · ⚑legit-ctx · ¤comment` — *  Lu par main_menu (RTC_ERR_FLAG_MASK). Foyer 1:1 ICI (était un stub `return 0` |

#### `src/start_menu.ts` — 7 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 5 | `*placeholder* · ¤comment` — *   POKéDEX  — placeholder (= "Pokédex non disponible") |
| `marker` | 10 | `*placeholder* · ¤comment` — *   OPTIONS  — placeholder (= "Options indisponible") |
| `marker` | 25 | `*placeholder* · ¤comment` — *   sub-state 'msg_wait'     : showing dialog message (placeholder ou success) |
| `marker` | 104 | `*placeholder* · ¤comment` — /** Texte affiché (= déjà résolu en FR, pas de placeholder à expand). */ |
| `marker` | 561 | `*placeholder* · ¤comment` — // {PLAYER} entry : décomp expand placeholder, nous on resolve direct (= nom joueur |
| `marker` | 585 | `*stub* · ¤comment` — // Règle 3 : .catch OBLIGATOIRE — sans lui, un throw au chargement de pokenav.ts (ex : stub |
| `marker` | 586 | `*no-op* · ¤comment` — // module-level) était avalé silencieusement (POKéNAV = no-op sans erreur visible). |

#### `src/wild_encounter.ts` — 7 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 455 | `*non-porté* · ¤comment` — // (Cas STENCH ×3/4 Battle Pyramid omis : Frontier non porté.) |
| `marker` | 485 | `*non-porté* · ¤comment` — *  sinon nature aléatoire. (Biais Pokéblock Safari Zone non porté → skip.) Retourne |
| `marker` | 594 | `*non-porté* · ⚑legit-ctx · ¤comment` — *  (Guards InBattlePike/Pyramid/UnionRoom omis : Frontier/link non portés = toujours false.) */ |
| `marker` | 648 | `*non-porté* · ¤comment` — // rencontre de bas niveau (check Pike Room Frontier omis, non porté). |
| `marker` | 814 | `*non-porté* · ¤comment` — // headerId == HEADER_NONE → branches Battle Pike/Pyramid (dette R3, Frontier non porté). |
| `marker` | 819 | `*non-porté* · ¤comment` — // Dette R3 : TryStartRoamerEncounter (roamer non porté). |
| `marker` | 921 | `*non-porté* · ¤comment` — // Dette R3 : TryStartRoamerEncounter (roamer non porté). |

#### `src/battle_anim_throw.ts` — 6 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 149 | `*no-op* · ¤comment` — // n'expose PAS DestroyAnimVisualTask → c'était un no-op silencieux). |
| `marker` | 163 | `*no-op*` — ?? ((_taskId: number): void => { /* no-op */ }), |
| `marker` | 1962 | `*no-op* · ¤comment` — // non, lazy via globalThis __decompGlobals — fallback no-op). |
| `marker` | 2342 | `*no-op* · ¤comment` — // No-op fallback (= sparkle anim still works visually, just no flash). |
| `marker` | 2343 | `*no-op*` — _blendPaletteFn = () => { /* no-op until decomp-globals loaded */ }; |
| `marker` | 2442 | `*TODO* · ¤comment` — // TODO 1:1 propre : enregistrer dans SPRITE_ANIMS/SPRITE_ANIM_TABLES (= |

#### `src/battle_tower.ts` — 6 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 107 | `*non-porté* · ¤comment` — * record-mixing / apprentice) = vague FRONTIER, non portées (FillPartnerParty n'est |
| `marker` | 153 | `*non-porté*` — console.warn('[battle_tower] FillPartnerParty : trainerId non-Steven non porté (frontier)', trainerId); |
| `marker` | 164 | `*non-porté* · ¤comment` — * (RecordedBattle_SaveBattleOutcome : non porté, recorded battles hors périmètre solo.) |
| `marker` | 219 | `*non-porté* · ¤comment` — * :2061-2167) = vague FRONTIER, non portés (ce special n'était câblé sur RIEN avant). |
| `marker` | 283 | `*non-porté* · ¤comment` — // non portés. DoSpecialTrainerBattle n'est câblé que pour STEVEN. |
| `marker` | 284 | `*non-porté*` — console.warn('[battle_tower] DoSpecialTrainerBattle : type non porté (frontier)', special); |

#### `src/engine/battle/battle-decomp-loop.ts` — 6 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 297 | `*console.warn*` — console.warn(`[decomp-loop] transition=${transition} non portée → fallback SLICE (visuel A/B à porter)`); |
| `marker` | 169 | `*non-porté* · ¤comment` — /** 1:1 décomp `GetFrontierOpponentClass(u16)` (battle_tower.c) — NON PORTÉ (Battle |
| `marker` | 174 | `*non-porté*` — throw new Error('[GetBattleBGM] GetFrontierOpponentClass non porté (Battle Frontier hors scope solo-core)'); |
| `marker` | 297 | `*non-porté*` — console.warn(`[decomp-loop] transition=${transition} non portée → fallback SLICE (visuel A/B à porter)`); |
| `marker` | 654 | `*no-op* · ¤comment` — // appel `__specials.HealPlayerParty()` était un NO-OP (__specials jamais exposé sur |
| `marker` | 1445 | `*placeholder* · ¤comment` — // le placeholder « B TRAINER1 LOSE TEXT » (verdict A/B, combat rival debug). |

#### `src/field_control_avatar.ts` — 6 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 697 | `*placeholder* · ¤comment` — // Notre impl : retourner placeholder pour la scene à dispatch. |
| `marker` | 771 | `*non-porté* · ¤comment` — // DETTE : branche Trainer Hill non portée (sous-système Trainer Hill absent). |
| `marker` | 799 | `*non-porté* · ¤comment` — // DETTE : secret base entrance (kind 'secret_base') non portée (sous-système base secrète). |
| `marker` | 820 | `*non-porté* · ¤comment` — *  DETTE : secret base + decoration metatiles non portés (sous-système base secrète). */ |
| `marker` | 940 | `*non-porté* · ¤comment` — *  ⚠️ DETTE : `StoreInitialPlayerAvatarState()` non porté (le joueur se ré-init sur la |
| `marker` | 1086 | `*non-porté* · ¤comment` — *  Wally/Scott/Roxanne/Rayquaza, Safari, SS Tidal = sous-systèmes non portés, |

#### `src/field_player_avatar.ts` — 6 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 1037 | `*non-porté* · ¤comment` — // non porté → PlaySpecialMapMusic est best-effort (même limite que le vélo), à compléter avec sound.c. |
| `marker` | 1329 | `*no-op* · ¤comment` — *  collision en COLLISION_WHEELIE_HOP / VERTICAL_RAIL / etc. Sinon no-op. |
| `marker` | 2469 | `*no-op* · ¤comment` — /** 1:1 STRICT décomp `PlayerAvatarTransition_Dummy` (field_player_avatar.c:827) — fishing/watering, no-op. */ |
| `marker` | 2471 | `*no-op* · ¤comment` — // no-op (décomp) |
| `marker` | 2490 | `*no-op* · ¤comment` — *  Appelée chaque frame en tête de PlayerStep (no-op si transitionFlags==0). */ |
| `marker` | 2994 | `*no-op* · ¤comment` — // Faraway Island Mew (collision spéciale fuite) — porté avec Faraway Island ; ailleurs no-op. |

#### `src/naming_screen.ts` — 6 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 1337 | `*no-op* · ¤comment` — // so rt.StartSpriteAnim is a silent no-op for it (Session 91 polish noted |
| `marker` | 1406 | `*no-op* · ¤comment` — // Direct FSM kick (= bypass rt.StartSpriteAnim, which is no-op here). |
| `marker` | 1746 | `*no-op* · ¤comment` — //   - NoIcon (0)             : explicit no-op (= no garbage drawn). |
| `marker` | 1765 | `*no-op*` — default: break;  // No-op (= NoIcon fallback) |
| `marker` | 2425 | `*no-op* · ¤comment` — // IsWideLetter retourne TOUJOURS FALSE → extraWidth toujours 0 (no-op). |
| `marker` | 2584 | `*no-op* · ¤comment` — // langues non-latines) : les DEUX branches retournent FALSE → no-op. |

#### `src/pokemon_summary_screen.ts` — 6 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 311 | `*placeholder*` — let gText_RibbonsVar1 = '';   // "RUBANS: {STR_VAR_1}" (placeholder substitué) |
| `marker` | 948 | `*no-op* · ¤comment` — // nouveau mon. No-op au 1er load (tag absent). Le sprite est re-créé via _createMonSprite. |
| `marker` | 1147 | `*placeholder* · ¤comment` — *  BYTE-LEVEL (Stage 3) : chaque placeholder JS-string (couleur/nature/niveau/lieu) |
| `marker` | 1294 | `*placeholder* · ¤comment` — // 1:1 décomp : gStringVar1/2/3 directement comme buffers placeholder. |
| `marker` | 1573 | `*no-op* · ¤comment` — *  SELECT_MOVE only → no-op flux party→RÉSUME (mode ≠ SELECT_MOVE). */ |
| `marker` | 2757 | `*placeholder* · ¤comment` — // placeholders = gStringVar1 (cur=max=pp du nouveau move) ; ExpandPlaceholders(gStringVar4). |

#### `src/script.ts` — 6 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 284 | `*console.warn*` — if (!ptr) { console.warn(`[byte-vm] script '${ptrOrLabel}' absent de l'image`); return false; } |
| `console-miss` | 379 | `*console.warn*` — if (!ptr) { console.warn(`[byte-vm] RunScriptImmediately: '${ptrOrLabel}' absent de l'image`); return; } |
| `marker` | 72 | `*non-porté* · ¤comment` — // Remplie par scrcmd.ts (installByteVmHandlers) ; les slots non portés restent `null`. |
| `marker` | 178 | `*non-porté*` — console.warn(`[byte-vm] cmd 0x${cmdCode.toString(16)} non porté (handler null)`); |
| `marker` | 325 | `*no-op* · ¤comment` — // `__SignalWaitState` (scrcmd.ts) et le no-op ShakeCamera historique qui prescrivait ce pont. |
| `marker` | 696 | `*non-porté* · ¤comment` — /** 1:1 décomp `RunOnDiveWarpMapScript()` (script.c:348). Dette R3 wire : Dive non porté. */ |

#### `src/battle_setup.ts` — 5 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 28 | `*non-porté* · ¤comment` — *   (trainer_see non porté → chemin ==0 partout). |
| `marker` | 460 | `*non-porté* · ¤comment` — // NON PORTÉ (volontaire) : `SetBattledTrainerFlag` (battle_setup.c:1252) est |
| `marker` | 473 | `*no-op* · ¤comment` — *  FIX : utilisait un hook `__FlagClear` JAMAIS câblé → `if (fc)` no-op silencieux |
| `marker` | 633 | `*non-porté* · ¤comment` — // ─── T-C : approche dresseur (callers = trainer_see.c, non porté) ─────────── |
| `marker` | 1358 | `*non-porté* · ¤comment` — *  (stats) + GetTrainerBattleTransition (transition spécifique → fallback SLICE) — non portés. */ |

#### `src/data/object_events/object_event_subsprites.ts` — 5 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 72 | `*placeholder*` — { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp |
| `marker` | 115 | `*placeholder*` — { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp |
| `marker` | 158 | `*placeholder*` — { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp |
| `marker` | 222 | `*placeholder*` — { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp |
| `marker` | 256 | `*placeholder*` — { subspriteCount: 0, subsprites: [] }, // {} placeholder décomp |

#### `src/easy_chat.ts` — 5 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 90 | `*TODO* · ¤comment` — // (interview TODO : CreateObjectGraphicsSprite viendra de './event_object_movement' |
| `marker` | 593 | `*TODO* · ¤comment` — // TODO Phase C : extraire les vraies chaînes FR ; null = message non affiché (parité). |
| `marker` | 830 | `*stub* · ¤comment` — // Section 4 sprite helpers (lignes 4624+) â€” STUB pour les call-sites lignes 3000-4500. |
| `marker` | 1262 | `*TODO* · ¤comment` — // TODO interview : CreateObjectGraphicsSprite(reporter, 76, 40) + joueur (52, 40). |
| `marker` | 3384 | `*non-porté* · ⚑legit-ctx · ¤comment` — *  Foyer réel = mystery_gift.c (feature multijoueur, NON portée volontairement), mais |

#### `src/pokemon_animation.ts` — 5 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 24 | `*no-op* · ¤comment` — * (2e frame du front-pic) — front.png 1-frame → no-op. L'anim AFFINE joue 1:1. |
| `marker` | 218 | `*no-op* · ¤comment` — // DoMonFrontSpriteAnimation ; no-op via Launch combat direct = pas de flag). |
| `marker` | 232 | `*no-op*` — function MonAnimDummySpriteCallback(_s: S): void { /* no-op (délai) */ } |
| `marker` | 2177 | `*no-op* · ¤comment` — *  sprite.data + sprite.callback → no-op (pas de registre runtime). */ |
| `marker` | 2178 | `*no-op*` — export function ResetAllMonAnimations(): void { /* no-op */ } |

#### `src/pokenav_list.ts` — 5 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 38 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 126 | `¤comment` — // TRANSPILER-TODO INCGFX : sListArrow_Pal ← graphics/pokenav/list_arrows.png (pipeline assets : loadTileBin/loadGbaPal… |
| `transpiler-todo` | 129 | `¤comment` — // TRANSPILER-TODO INCGFX : sListArrow_Gfx ← graphics/pokenav/list_arrows.png (pipeline assets : loadTileBin/loadGbaPal… |
| `transpiler-todo` | 139 | let list = AllocSubstruct(POKENAV_SUBSTRUCT_LIST, 0 /* TRANSPILER-TODO sizeof(struct PokenavList) */); |

#### `src/save.ts` — 5 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 688 | `*@ts-nocheck* · ¤comment` — // auto-générés (= eval scope @ts-nocheck). |
| `marker` | 543 | `*placeholder* · ¤comment` — *  currentBox) au lieu de l'ancien placeholder `{}`. Défaut = 1:1 |
| `marker` | 550 | `*placeholder* · ¤comment` — *  Une save pré-étape-6 a `{}` (ancien placeholder) → invalide → défaut. */ |
| `marker` | 577 | `*placeholder* · ¤comment` — // l'étape 6 a `pokemonStorage = {}` (ancien placeholder) — `{}` est |
| `marker` | 645 | `*no-op* · ⚑legit-ctx · ¤comment` — // le Proxy gSaveBlock2Ptr et l'auto-engine code) devient no-op silencieux. |

#### `src/battle_anim_effects_2.ts` — 4 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 1629 | `*console.warn*` — if (!sp) { console.warn('[ExSpeedReappear] sprite', task.data[15], 'ABSENT → destroy précoce (mon reste invisible !)');… |
| `marker` | 1305 | `*stub* · ¤comment` — // 1:1 GetAnimBattlerSpriteId local (le stub surface rend -1 — pattern mon_movement) |
| `marker` | 2036 | `*no-op* · ¤comment` — *  restore = no-op net : le snapshot du Launch restaure en fin de move). */ |
| `marker` | 2078 | `*no-op* · ¤comment` — // restore palette = no-op net (snapshot Launch, cf. _ggGrayscale). |

#### `src/data/decoration/header.ts` — 4 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 32 | `*stub* · ¤comment` — *     porté en assets. Pour l'instant : STUB null-friendly via string ID. |
| `marker` | 45 | `*TODO* · ¤comment` — *   - 1:1 TODO : porter `DecorGfx_*` arrays (`tiles.h:643l`) en assets binaires. |
| `marker` | 214 | `*stub* · ¤comment` — //   tiles: clé d'asset (= ex `"DecorGfx_SMALL_DESK"`). STUB ; résolution future |
| `marker` | 233 | `*stub* · ¤comment` — /** `const u16 *tiles;` → string identifier (clé asset, STUB). */ |

#### `src/egg_hatch.ts` — 4 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 378 | `*console.warn*` — if (!tiles) { console.warn('[egg_hatch] tiles mon absentes'); return 64; } |
| `marker` | 17 | `*no-op* · ⚑legit-ctx · ¤comment` — *  - `m4aSoundVSyncOn` = no-op (exemption hardware son) ; `SetBgTilemapBuffer`/ |
| `marker` | 464 | `*no-op* · ¤comment` — // SetBgTilemapBuffer(1/0, Alloc(...)) : no-op structurel (tilemap par-BG compositeur). |
| `marker` | 674 | `*no-op* · ¤comment` — // UnsetBgTilemapBuffer(0/1) : no-op structurel. |

#### `src/field_message_box.ts` — 4 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 11 | `*non-implémenté* · ¤comment` — * messages non implémentés. |
| `marker` | 77 | `*no-op,placeholder* · ¤comment` — /** No-op placeholder : depuis le swap palette 13→15 (= same as Birch dialog), |
| `marker` | 81 | `*no-op* · ¤comment` — /* no-op — kept for backward compat with TestOverworldScene boot */ |
| `marker` | 113 | `*placeholder* · ¤comment` — // résout les placeholders byte (0xFD + id : {PLAYER}/{RIVAL}/{STR_VAR_1..3}) DANS |

#### `src/pokenav_match_call_data.ts` — 4 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `wireTodo` | 51 | const BufferPokedexRatingForMatchCall: any = __wireTodo('BufferPokedexRatingForMatchCall'); |
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 27 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `marker` | 50 | `*stub* · ¤comment` — // Runtime-only (pas top-level) → laissés en stub, à câbler au parcours d'exécution. |

#### `src/pokenav_match_call_list.ts` — 4 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 1 | `*@ts-nocheck* · ¤comment` — // @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs) |
| `marker` | 30 | `*TODO* · ¤comment` — // ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ─── |
| `transpiler-todo` | 97 | let state = AllocSubstruct(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_MatchCallMenu)… |
| `transpiler-todo` | 429 | let trainer = gTrainers[GetTrainerIdxByRematchIdx(matchCallEntry.headerId)] /* TRANSPILER-TODO &élément scalaire (out-p… |

#### `src/battle_anim_effects_1b.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 161 | `*no-op* · ¤comment` — *  No-op tant que les palettes rainbow (AnimTask_MusicNotesRainbowBlend, non |
| `marker` | 195 | `*non-porté* · ¤comment` — *  data[2], puis destroy. (Partagé décomp avec AnimFrenzyPlantRoot, non porté.) */ |
| `marker` | 567 | `*no-op* · ¤comment` — *  palettes (sinon IndexOfSpritePaletteTag → 0xFF, no-op, 1:1). */ |

#### `src/battle_anim_effects_3.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `empty-body` | 2033 | `*fn/arrow (heuristique)*` — function _SpriteCallbackDummy(_sprite: _VSprite): void {} |
| `marker` | 2031 | `*no-op* · ¤comment` — /** 1:1 `SpriteCallbackDummy` (sprite.c) — no-op IDENTITAIRE : AnimGreenStar_Step2 |
| `marker` | 4002 | `*no-op* · ¤comment` — *  no-op net documenté (formes Castform non atteignables, cf. gfx_sfx_util). */ |

#### `src/battle_bg.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 562 | `*non-porté* · ¤comment` — *  [B_WIN_TYPE_ARENA] = sBattleArenaWindowTemplates. Arena non porté (Battle |
| `marker` | 573 | `*non-porté* · ¤comment` — *  Arena non porté → windowsType = B_WIN_TYPE_NORMAL constant (évite l'arête |
| `marker` | 623 | `*no-op* · ¤comment` — // voie L → SetPpNumbersPaletteInMoveSelection no-op (early-return) → les PP gardaient |

#### `src/battle_gfx_sfx_util.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 19 | `*no-op* · ¤comment` — *      (:1159, no-op plateforme doc) · LoadAndCreateEnemyShadowSprites (:1183) · |
| `marker` | 477 | `*no-op* · ¤comment` — *  DoMoveAnim, NORMAL après) — l'ancien no-op « géré par le runtime » était une |
| `marker` | 747 | `*no-op* · ¤comment` — // (DummyBattleInterfaceFunc = no-op 1:1.) |

#### `src/decoration_inventory.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 102 | `*TODO,stub,no-op* · ¤comment` — // Pour l'instant : stub no-op, marqué TODO. |
| `marker` | 103 | `*TODO* · ¤comment` — // 1:1 TODO : import InitDecorationContextItems from decoration.c when ported. |
| `marker` | 106 | `*no-op* · ¤comment` — // No-op tant que decoration.c n'est pas porté. |

#### `src/engine/battle/battle-sendout-anim.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 273 | `*no-op* · ¤comment` — /** Tick per-frame (gated ~60fps). No-op si pas actif. */ |
| `marker` | 831 | `*no-op* · ¤comment` — /** Tick per-frame (gated ~60fps). No-op si pas actif. */ |
| `marker` | 917 | `*no-op* · ¤comment` — /** Tick per-frame (gated ~60fps). No-op si pas actif. */ |

#### `src/engine/battle/battle-sprites-data.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 24 | `*no-op* · ¤comment` — * optionnels restent no-op via optional chaining côté caller). |
| `marker` | 251 | `*no-op* · ¤comment` — //     restent no-op si non définis ailleurs = optional chaining côté caller). ── |
| `marker` | 267 | `*no-op* · ¤comment` — // en no-op -> au reshow, ResetSpriteData détruit les tickers de bounce mais les flags |

#### `src/engine/battle/memory-map.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 316 | `*no-op* · ¤comment` — // cEFFECT_CHOOSER (= setmoveeffect macro) était no-op silent → tous moves |
| `marker` | 383 | `*no-op* · ¤comment` — *  des symbols battle script étaient no-op. Fix : `>>> 0` force unsigned. */ |
| `marker` | 463 | `*no-op* · ¤comment` — // SYMBOLS_BY_ID vide → write no-op silent → loops infinis Intimidate etc. |

#### `src/engine/field/movement-system.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 30 | `*no-op* · ¤comment` — * ignore le retour → no-op, comme la ROM). Le fallback maison a donc été SUPPRIMÉ : |
| `marker` | 66 | `*no-op* · ¤comment` — *  l'utilise pas — slot occupé = no-op). |
| `marker` | 100 | `*no-op* · ¤comment` — /** True si la queue ScriptMovement pour targetLocalId est done (= no-op si absent). */ |

#### `src/field_camera.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 10 | `*no-op* · ¤comment` — * Effect` (mirage_tower.c:303 — no-op, Mirage Tower pas porté). |
| `marker` | 817 | `*no-op* · ¤comment` — // → return (no-op). Si Mirage Tower port futur, ajouter DestroyTask + Unmark/Unload. |
| `marker` | 985 | `*no-op* · ¤comment` — // Runtime not yet set au boot très early → no-op safe. |

#### `src/field_effect.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 20 | `*stub* · ¤comment` — * Effects stub explicit (= cascade non-portée, marqué dette H3) : |
| `marker` | 139 | `*no-op* · ¤comment` — *  (blob→0, emote→0, cœur→2, NPC palettes) est INVISIBLE → free = no-op (1:1 décomp). Ne libère |
| `marker` | 188 | `*non-porté* · ¤comment` — // (l'opcode warn « FieldEffectStart not exposed »). Le dispatcher gère gracieusement les FLDEFF non portés. |

#### `src/field_poison.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 131 | `*non-porté* · ¤comment` — *  (= fldeff_misc.c, UI) reste DÉFÉRÉ (non porté). */ |
| `marker` | 145 | `*non-porté* · ¤comment` — // 1:1 : FldEffPoison_Start() (flash écran) si numFainted \|\| numPoisoned — DÉFÉRÉ (UI non portée). |
| `marker` | 176 | `*non-porté* · ¤comment` — // Frontier (FLDPSN_FRONTIER_WHITEOUT) déférée (non portée, hors jeu normal). |

#### `src/field_tasks.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 123 | `*placeholder* · ¤comment` — // sur DummyPerStepCallback (placeholder documenté) en attendant leur commit dédié. |
| `marker` | 182 | `*no-op* · ¤comment` — // (audio), FindTaskIdByFunc renvoie TASK_NONE → no-op pour l'instant. Structure |
| `marker` | 203 | `*no-op* · ¤comment` — // no-op (= STEP_CB_DUMMY, défaut). |

#### `src/fldeff_sweetscent.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 78 | `*no-op,non-porté* · ¤comment` — *        ClearMirageTowerPulseBlendEffect();                   ← mirage_tower.c non porté (no-op hors Route 111) |
| `marker` | 89 | `*no-op,non-porté* · ¤comment` — // ClearMirageTowerPulseBlendEffect() : mirage_tower.c non porté → no-op partout |
| `marker` | 99 | `*no-op* · ¤comment` — // TryStartMirageTowerPulseBlendEffect() : no-op (cf. ci-dessus). |

#### `src/item_use.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 135 | `*no-op* · ¤comment` — // (= la chaîne vélo/canne). Avant : null → fallback exitCallback WithOpenMenu → vélo no-op. |
| `marker` | 220 | `*no-op* · ¤comment` — // no-op silencieux (leçon CheckBagHasItem attend une CLÉ). |
| `marker` | 258 | `*placeholder* · ¤comment` — // ─── _expandStr : substitue placeholders FR (STR_VAR_1/2/3) ───────────────── |

#### `src/m4a_1.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 820 | `*no-op* · ¤comment` — // du mot » des sorties _081DD174/_081DD4F4 devient un no-op. Le duff-device stm |
| `marker` | 1071 | `*no-op*` — } else { // _081DD174 : stop (flush par-octet : no-op) |
| `marker` | 1194 | `*no-op* · ¤comment` — // _081DD4F4 : stop + flush partiel (no-op par-octet). |

#### `src/mon_markings.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 58 | `*console.warn*` — _markingsLoadPromise.catch((e) => console.warn('[mon_markings] asset mon_markings.png absent (à extraire) :', e)); |
| `console-miss` | 199 | `*console.warn*` — _menuLoadPromise.catch((e) => console.warn('[mon_markings] mon_markings_menu.png absent :', e)); |
| `marker` | 369 | `*no-op*` — function SpriteCB_Dummy(_sprite: unknown): void { /* no-op */ } |

#### `src/pokedex.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 4 | `*stub* · ¤comment` — * Remplace le stub overlay `engine/ui/pokedex-screen.ts` par le VRAI écran plein |
| `marker` | 22 | `*no-op* · ¤comment` — * Stubs des jalons suivants = no-op HONNÊTES documentés (jamais de fake silencieux, |
| `marker` | 4053 | `*no-op* · ¤comment` — // 🐛 Ce pont n'était posé par PERSONNE (specials silencieusement no-op) — |

#### `src/pokemon.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 580 | `*non-porté* · ¤comment` — // → table spéciale `sAlteringCaveWildMonHeldItems` (Mareep→Ganlon Berry, etc.). NON porté : en |
| `marker` | 769 | `*stub* · ¤comment` — // un stub partiel (pas de champ `abilities`) : un slot battler VIDE (espèce 0 — normal |
| `marker` | 1584 | `*no-op* · ¤comment` — // ignorée (= vrai trou 1:1, ex. GiveGiftRibbonToParty / Champion Ribbon no-op). |

#### `src/trainer_card.ts` — 3 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 434 | `*placeholder* · ¤comment` — *  placeholders (= "0 ECHANGES", "0 COMBATS LIEN") pour visual completeness. |
| `marker` | 768 | `*no-op* · ¤comment` — // SetCardFlipped : no-op transition (= 1:1 décomp = ready for unsquash). |
| `marker` | 1028 | `*stub* · ¤comment` — *  appelé (= MainCB2_TrainerCardRun take over). Stub safety. */ |

#### `src/battle_anim_utility_funcs.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 163 | `*no-op* · ¤comment` — *  `setarg 7, 0xFFFF` des scripts). UpdateAnimBg3ScreenSize = net no-op |
| `marker` | 595 | `*no-op* · ¤comment` — // 1:1 memcpy(Unfaded[idx], Faded[idx]) — alias chez nous → no-op net (documenté). |

#### `src/battle_intro.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 103 | `*no-op* · ¤comment` — // dispatch `rt()?.SetBgAttribute?.()` était un no-op silencieux (jamais porté). |
| `marker` | 537 | `*no-op* · ¤comment` — // 1:1 décomp bg.c:404 (LoadBgTilemap) — appel DIRECT (ex-`r.LoadBgTilemap?.()` = no-op |

#### `src/berry.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 300 | `*stub* · ¤comment` — *  via IsEnigmaBerryValid. Identity stub honnête : retourne stocked checksum. */ |
| `marker` | 540 | `*non-porté* · ¤comment` — // berry tree NPCs U-tier (= overworld interaction). Non porté ici — les |

#### `src/clock.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 50 | `*non-porté* · ¤comment` — // FLAG_SYS_CLOCK_SET (InPokemonCenter omis : non porté). `VAR_DAYS` = dernier jour |
| `marker` | 59 | `*non-porté* · ¤comment` — // UpdateBirchState, [Frontier×2/Shoal non portés], SetRandomLotteryNumber. |

#### `src/data/object_events/object_event_anims.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 18 | `*placeholder* · ¤comment` — *     sAnim_StayStill (= placeholder honnête) + commentaire `// [ANIM_STD_FOO]`. |
| `marker` | 736 | `*placeholder* · ¤comment` — // Trous sparse remplis avec sAnim_StayStill (= placeholder honnête, comme C |

#### `src/engine/battle/wire-bytecode-bridge.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 1044 | `*console.warn*` — console.warn('[ai] chooseOpponentMoveViaAI fallback:', e); |
| `marker` | 468 | `*stub* · ¤comment` — // HasNoMonsToSwitch(i, PARTY_SIZE, PARTY_SIZE) — 1:1 stub via cmd-niveau-32. |

#### `src/field_door.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 11 | `*placeholder* · ¤comment` — *      data[0..3] = (placeholders ; vrais frames/gfx via _doorTaskState side-map) |
| `marker` | 803 | `*placeholder* · ¤comment` — *  data[0..3] sont placeholder (= la décomp y stocke des u16 pointers vers |

#### `src/field_weather.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `empty-body` | 621 | `*fn/arrow (heuristique)*` — function DoNothing(): void { } |
| `marker` | 1092 | `*no-op* · ¤comment` — *  ⚠️ AUDIO SKIP : tout le corps est du son (PlaySE/IsSpecialSEPlaying) → no-op. */ |

#### `src/fldeff_flash.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 9 | `*non-porté* · ¤comment` — * le move — chantier séparé (non porté ici, mais ce qui est porté est 1:1 propre). |
| `marker` | 39 | `*no-op* · ¤comment` — *    gFieldEffectArguments[0] = GetCursorSelectionMonId();   // show-mon no-op (posé par le menu) |

#### `src/intro_credits_graphics.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 6 | `*@ts-nocheck* · ¤comment` — // (@ts-nocheck) → relocalisé à son foyer 1:1 + TYPÉ (relocate+retype). |
| `marker` | 35 | `*non-porté* · ¤comment` — // Data tables scenery CREDITS non portées (clouds/trees/houses) — utilisées seulement |

#### `src/lilycove_lady.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 908 | `*stub* · ¤comment` — *  à câbler avec l'écran. Reste dans la stub-list registry en attendant. */ |
| `marker` | 910 | `*non-porté*` — console.warn('[lilycove_lady] OpenPokeblockCase(PBLOCK_CASE_GIVE) : écran PokéblockCase non porté (dette sac #15)'); |

#### `src/script_menu.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 3 | `*TODO* · ¤comment` — * dont `ScriptMenu_Multichoice`/`ScriptMenu_MultichoiceWithDefault`, = TODO complétion 1:1). |
| `marker` | 197 | `*non-porté* · ¤comment` — *  numColumns ignoré, layout grille N×M non porté ; même comportement que le parsé). */ |

#### `src/starter_choose.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 444 | `*no-op* · ¤comment` — // OBJ palette (reserved=0 + tags=TAG_NONE). 🩸 ÉTAIT un no-op silencieux : appelé via |
| `marker` | 749 | `*no-op* · ¤comment` — // le tick-loop voie V (l.520) no-op ; on marque la flow ChooseStarter terminee |

#### `src/strings.ts` — 2 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 39 | `*placeholder* · ¤comment` — /** Chaîne vide `_("")` = juste le terminateur EOS (helper d'init des placeholders ; |
| `marker` | 106 | `*placeholder* · ¤comment` — /** True si la charmap transitoire est chargée (placeholders FR encodés). */ |

#### `src/battle_anim_dragon.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 160 | `*no-op*` — sprite.data[6] = (args[0] \| 0) & 0xFF; // garde-fou table trig (no-op pour les angles script 0..213) |

#### `src/battle_anim_effects_1.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 1576 | `*non-porté* · ¤comment` — *  AnimTask_MoonlightEndFade, non porté → cleanup fin d'anim). */ |

#### `src/battle_anim_electric.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 945 | `*no-op* · ¤comment` — *  StartSpriteAnim(1) (no-op silencieux ici : sprite inline sans table anims) |

#### `src/battle_anim_ghost.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 151 | `*non-porté* · ¤comment` — // 1:1 PlaySE12WithPanning(SE_M_CONFUSE_RAY, gAnimCustomPanning) — panning non porté (infra __PlaySE). |

#### `src/battle_anim_mon_movement.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 122 | `*console.warn*` — console.warn('[anim] ShakeMon2 args corrompus (bytecode) :', _args().slice(0, 5).join(','), '— skip'); |

#### `src/battle_anim_mons.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 403 | `*no-op* · ¤comment` — // = champs PLATS) -> no-op silencieux. Reecrit sur le modele reel. |

#### `src/battle_anim_poison.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 107 | `*stub,no-op* · ¤comment` — *  = stub no-op, monbg non câblé) → constantes documentées. */ |

#### `src/battle_anim_rock.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 285 | `*no-op* · ¤comment` — *  le matériel en mode text (BG3 combat = text) → no-op réel chez nous aussi. */ |

#### `src/battle_pyramid.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 133 | `*TODO* · ¤comment` — // TODO(frontier-data) : indexer par _offset quand les 16 variantes seront extraites. |

#### `src/berry_powder.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 12 | `*non-porté* · ¤comment` — * (ApplyNewEncryptionKey* non porté) → XOR 0 = identité en pratique, mais le |

#### `src/data/battle_moves.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 99 | `*console.warn*` — console.warn(`[battle-moves] unknown move id for ${moveName}`); |

#### `src/data/pokemon/species_info.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 104 | `*stub* · ¤comment` — // COMPLET → `.genderRatio = 0 = MON_MALE`. Notre record SPECIES_NONE est un stub partiel |

#### `src/daycare.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 1350 | `*console.warn*` — console.warn('[daycare] __ChooseMonForDaycare absent (party_menu pas chargé)'); |

#### `src/dewford_trend.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 225 | `*non-porté* · ¤comment` — *  ⚠️ TryPutTrendWatcherOnAir(phrase) (TV « Trend Watcher », tv.c) DÉFÉRÉ (TV non porté). */ |

#### `src/engine/bag/bag.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 100 | `*no-op* · ¤comment` — *  fields séparés existent déjà, no-op. */ |

#### `src/engine/battle/party-storage.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 236 | `*no-op* · ¤comment` — // (setupEnemyPartyForBattle) ne backup PAS → restore = no-op (la party de combat |

#### `src/engine/battle/state.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 130 | `*no-op* · ¤comment` — *  Auparavant fragmentée en 3 copies locales (player/opponent-noop/setup) ; |

#### `src/engine/data/game-data.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 217 | `*placeholder* · ¤comment` — // battle-string-decoder placeholder {B_TRAINER1_CLASS}/{B_TRAINER1_NAME}. |

#### `src/engine/field/field-globals.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 90 | `*no-op* · ¤comment` — *  No-op si pas registered yet (= boot). */ |

#### `src/engine/field/fly-field-move.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 23 | `*no-op* · ¤comment` — * curseur peut se poser n'importe où (le préfixe le confirme → no-op si non visitée). |

#### `src/engine/field/region-map-data.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 197 | `*non-porté* · ¤comment` — *  non porté pour la démo). */ |

#### `src/engine/save/save-blocks.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 32 | `*TODO* · ¤comment` — // TODO dédup : POKEMON_NAME_LENGTH / TRAINER_ID_LENGTH / PARTY_SIZE sont AUSSI dans |

#### `src/event_object_lock.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 22 | `*non-porté* · ⚑legit-ctx · ¤comment` — *  - `UnionRoom_UnlockPlayerAndChatPartner` (Union Room / link non porté). |

#### `src/field_screen_effect.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 5 | `*TODO* · ¤comment` — * = TODO restructure/complétion 1:1). D'autres fn de field_screen_effect.c vivent encore |

#### `src/fldeff_cut.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 53 | `*non-porté* · ¤comment` — *  ⚠️ DETTE mineure : `IncrementGameStat(GAME_STAT_USED_CUT)` non porté (stat cosmétique, comme PlaySE). */ |

#### `src/fldeff_dig.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 71 | `*no-op* · ¤comment` — *      gFieldEffectArguments[0] = GetCursorSelectionMonId();   // show-mon no-op |

#### `src/fldeff_rocksmash.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 49 | `*non-porté* · ¤comment` — *  ⚠️ DETTE mineure : `IncrementGameStat(GAME_STAT_USED_ROCK_SMASH)` non porté (stat cosmétique). */ |

#### `src/fldeff_teleport.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 60 | `*no-op* · ¤comment` — *      gFieldEffectArguments[0] = GetCursorSelectionMonId();   // show-mon no-op (posé par le menu) |

#### `src/give_gift_ribbon_to_party.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 49 | `*no-op* · ¤comment` — // côté décomp ; chez nous undefined → no-op sûr ; les callers passent 0-6.) |

#### `src/item.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 21 | `*no-op* · ¤comment` — *  "ITEM_TM01" → CheckBagHasItem rate → RemoveBagItem no-op silencieux). */ |

#### `src/mail_data.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 397 | `*stub* · ¤comment` — // Stage 4b : le stub local `PadNameString(string)` est retiré — remplacé par le |

#### `src/metatile_behavior.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 167 | `*TODO* · ¤comment` — // concordent ; ENUM_MB_0 comble les trous. TODO: basculer TOUT le fichier sur ENUM_MB_0. |

#### `src/play_time.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `ts-suppress` | 15 | `*@ts-nocheck* · ¤comment` — * @ts-nocheck + dépend de `STOPPED/RUNNING` constants non-portées → port |

#### `src/pokedex_area_region_map.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 50 | `*no-op* · ¤comment` — // ... (tilemap, mode 1) → buffer tilemap du BG (AddValToTilemapBuffer offset 0 = no-op). |

#### `src/pokedex_cry_screen.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 238 | `*no-op*` — ShiftWaveformOver(windowId, -8 * window.xPos, true);   // no-op (1:1) |

#### `src/pokemon_icon.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 166 | `*console.error*` — else console.error(`[pokemon_icon] LoadMonIconPalettes : palette ${palIdx} pas préchargée (PreloadMonIconPalettes manqu… |

#### `src/pokemon_size_record.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 173 | `*no-op* · ¤comment` — // jeté = no-op du modèle JS-string bridge) retiré. |

#### `src/pokenav.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 229 | `*non-porté* · ¤comment` — *  courant (`currentMenuCb1`, posé par SetActivePokenavMenu — inerte tant que non porté). */ |

#### `src/post_battle_event_funcs.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 83 | `*non-porté* · ¤comment` — // MON_DATA_CHAMPION_RIBBON) — générateurs TV `TryPut*OnAir` non portés |

#### `src/rotating_tile_puzzle.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `transpiler-todo` | 107 | sRotatingTilePuzzle = ({} as any) /* TRANSPILER-TODO AllocZeroed */; |

#### `src/scrcmd_fieldeffect.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 36 | `*console.warn*` — console.warn(`[dofieldeffect] FieldEffectStart non exposé — FLDEFF id=${effectId} ignoré`); |

#### `src/scrcmd_trainer.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 41 | `*no-op*` — export function SetCurrentApproachingTrainerObjectEventId(_id: number): void { /* no-op */ } |

#### `src/shop.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 824 | `*non-porté* · ¤comment` — // gris = non portés, hors des 5 bugs.) |

#### `src/song_table.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 8 | `*no-op* · ¤comment` — * trackCount 0 → no-op) : INERTE et sans danger. |

#### `src/trainer_pokemon_sprites.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `console-miss` | 125 | `*console.warn*` — console.warn(`[trainer_pokemon_sprites] CreateMonPicSprite_Affine: no substrate for ${species} (preload manquant)`); |

#### `src/trainer_see.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 752 | `*non-porté* · ¤comment` — // InTrainerHill()==TRUE → GetTrainerHillTrainerScript (non porté : hill exempt) ; |

#### `src/union_room_chat.ts` — 1 finding(s)

| Catégorie | Ligne | Détail / extrait |
|---|--:|---|
| `marker` | 15 | `*placeholder* · ¤comment` — *  cité 1:1). `{EMOJI_BIGSMILE}` = placeholder charmap du décomp, conservé. */ |

---

## Top 20 prioritaires (MOTEUR d'abord ; `__wireTodo` + `silent-default` en tête)

| # | Fichier:ligne | Catégorie | Extrait |
|--:|---|---|---|
| 1 | `harness/runtime/decomp-runtime.ts:833` ⚙️ | `silent-default` *(return 0)* | default: |
| 2 | `src/scanline_effect.ts:225` ⚙️ | `silent-default` *(return 0)* | default: return 0; |
| 3 | `src/menu.ts:1078` ⚙️ | `ts-suppress` *(@ts-nocheck)* | // Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck). Rapatrié |
| 4 | `src/sound.ts:658` ⚙️ | `ts-suppress` *(@ts-nocheck)* | // Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck) + le tick |
| 5 | `harness/boot/intro-asset-loader.ts:58` ⚙️ | `console-miss` *(console.warn)* | console.warn(`[intro-asset-loader] no ${binUrl}, fallback PNG canvas extraction`); |
| 6 | `harness/boot/intro-asset-loader.ts:201` ⚙️ | `console-miss` *(console.warn)* | console.warn(`[intro-asset-loader] unknown ext for ${symbol}: ${source.ext}`); |
| 7 | `harness/devtools/devtools-panel.ts:511` ⚙️ | `console-miss` *(console.warn)* | console.warn('[devtools] déjà en combat — boot ignoré'); return; |
| 8 | `harness/devtools/registrations.ts:209` ⚙️ | `console-miss` *(console.warn)* | console.warn('[devtools v2] déjà en combat — boot ignoré'); return; |
| 9 | `harness/gba/compositor.ts:600` ⚙️ | `console-miss` *(console.error)* | console.error( |
| 10 | `harness/gba/png-loader.ts:215` ⚙️ | `console-miss` *(console.warn)* | console.warn(`[png-loader] ${binUrl} absent, fallback loadIndexedPngStrict (PNG indexé)`); |
| 11 | `harness/runtime/decomp-globals.ts:1705` ⚙️ | `console-miss` *(console.error)* | console.error(`[LoadCompressedSpriteSheet] ASSET MISSING : '${sheet.data}' (tag=${sheet.tag}) — tile data NOT in OBJ VR… |
| 12 | `harness/scenes/DebugOverlayScene.ts:69` ⚙️ | `console-miss` *(console.warn)* | if (rt0?.gMain?.inBattle) { console.warn('[DebugOverlay] deja en combat — Numpad5 (rival) ignore'); return; } |
| 13 | `harness/scenes/DebugOverlayScene.ts:117` ⚙️ | `console-miss` *(console.warn)* | if (rt0?.gMain?.inBattle) { console.warn("[DebugOverlay] deja en combat — ' (wild) ignore"); return; } |
| 14 | `src/text_window.ts:110` ⚙️ | `console-miss` *(console.warn)* | console.warn('[LoadMessageBoxGfx] gMessageBox_Pal not preloaded — fallback hardcoded grey palette'); |
| 15 | `harness/boot/boot-mode.ts:138` ⚙️ | `marker` *(placeholder)* | *     Sinon : default 'PLAYER' / MALE (= 1:1 décomp default placeholder). |
| 16 | `harness/boot/boot-mode.ts:526` ⚙️ | `marker` *(no-op)* | // devient un no-op tant que le latch est ON. La SRAM existante est donc |
| 17 | `harness/boot/boot-mode.ts:576` ⚙️ | `marker` *(placeholder)* | // Default identity : "PLAYER" / MALE (= 1:1 décomp placeholder pre-Birch). |
| 18 | `harness/boot/copyright-boot.ts:37` ⚙️ | `marker` *(stub)* | function GameCubeMultiBoot_Init(_p: unknown): void { /* stub */ } |
| 19 | `harness/boot/copyright-boot.ts:38` ⚙️ | `marker` *(stub)* | function GameCubeMultiBoot_Main(_p: unknown): void { /* stub */ } |
| 20 | `harness/boot/intro-asset-loader.ts:280` ⚙️ | `marker` *(TODO)* | *  TODO Phase 2 : étendre l'extracteur intro-data.ts à intro_credits_graphics.c. */ |

---

## Faux positifs probables / whitelist candidate

Cette section signale les findings statistiquement les plus susceptibles d'être **légitimes** (à ne PAS transformer en throw), pour guider le lot « Gardes moteur » (PHASE B.2).

### 1. No-op / stub à contexte hardware-link (±3 lignes : link/serial/RTC/cable/save-hw) — 70

Ce sont des candidats **whitelist** (no-op LÉGITIMES : multijoueur / câble / RTC / save hardware, cf. exemptions du contrat).

| Fichier:ligne | Catégorie | Extrait |
|---|---|---|
| `harness/boot/boot-mode.ts:526` ⚙️ | `marker` | // devient un no-op tant que le latch est ON. La SRAM existante est donc |
| `harness/runtime/decomp-globals.ts:1444` ⚙️ | `marker` | *  (= no double-buffer), donc cette function est un no-op pour API compat |
| `harness/runtime/gba-global-scope.ts:461` ⚙️ | `marker` | // safe stubs (= no-op ou FALSE) pour éviter les ReferenceError. |
| `harness/runtime/gba-global-scope.ts:463` ⚙️ | `marker` | CloseLink: (): void => { /* no-op : pas de wireless link en web */ }, |
| `harness/runtime/gba-global-scope.ts:473` ⚙️ | `marker` | // REG_IE/REG_IME stubs — les writes sont no-op côté web (= pas de hardware |
| `src/battle_controller_player.ts:2903` | `marker` | *  gaté `gBattleTypeFlags & BATTLE_TYPE_LINK` → no-op total en local single |
| `src/battle_controller_player.ts:2906` | `marker` | // no-op 1:1 hors link (gate décomp). |
| `src/battle_controllers.ts:214` | `marker` | *  Link battle variant — pour notre port (= laissé de côté), noop documenté. */ |
| `src/battle_controllers.ts:216` | `marker` | // User dit "laisse de côté link", noop documenté. |
| `src/battle_controllers.ts:1494` | `marker` | // Dette R3 : link battle handshake. Notre port : noop (no link battle). |
| `src/battle_main.ts:1219` | `marker` | // CB2_HandleStartMulti* / PreInit* — non portés (Dette R3 multi/partner). |
| `src/battle_main.ts:1222` | `marker` | *  (SendBlock / GetBlockReceived / RNG-seed / Shedinja link) = LINK non porté, hors |
| `src/battle_main.ts:1223` | `marker` | *  périmètre solo (link non porté). Mirror EXACT du CB2_HandleStartBattle offline du port |
| `src/battle_main.ts:1247` | `marker` | // 1:1 :1189-1228 : la branche LINK (if BATTLE_TYPE_LINK) = link non porté, hors |
| `src/battle_main.ts:1270` | `marker` | //   link/tower, non porté solo ; la LINK_IN_BATTLE flag = gate link.) |
| `src/battle_main.ts:4025` | `marker` | * explicit + dette R3 commentée. Pas de stub silencieux : la signature |
| `src/battle_main.ts:5852` | `marker` | // callback2 = savedCallback (one-shot devenu no-op) → MainCB2_Overworld jamais |
| `src/battle_main.ts:6594` | `marker` | *  @body-parity-ok stub assumé : cascade link _BLE, hors périmètre solo */ |
| `src/battle_main.ts:6620` | `marker` | *  connaît pas (voie link hors solo-core), la vraie fonction no-op proprement au lieu |
| `src/battle_main.ts:6621` | `marker` | *  du faux stub. */ |
| `src/battle_main.ts:6640` | `marker` | *  @body-parity-ok stub assumé : cascade link _BLE, hors périmètre solo */ |
| `src/battle_script_commands.ts:9433` | `marker` | *    (sous-système réseau non porté, branches inatteignables en solo). |
| `src/battle_script_commands.ts:9434` | `marker` | *  - DETTE R3 : SwitchPartyOrder porté mais _SwitchPartyMonSlots stub (swap réel |
| `src/battle_script_commands.ts:9493` | `marker` | // DETTE LINK (sous-système réseau non porté) : GetLinkTrainerFlankId / |
| `src/battle_script_commands.ts:9581` | `marker` | // (décomp 7369-7379) = sous-système réseau/multi non porté. Branches |
| `src/battle_util.ts:907` | `marker` | const linkPlayers = 0; // GetLinkPlayerCount() — link non porté (dette link). |
| `src/battle_util.ts:1045` | `marker` | throw new Error('[battle_util] HasNoMonsToSwitch: BATTLE_TYPE_MULTI (link) non porté (hors périmètre solo)'); |
| `src/easy_chat.ts:3384` | `marker` | *  Foyer réel = mystery_gift.c (feature multijoueur, NON portée volontairement), mais |
| `src/egg_hatch.ts:17` | `marker` | *  - `m4aSoundVSyncOn` = no-op (exemption hardware son) ; `SetBgTilemapBuffer`/ |
| `src/engine/script/specials-registry.ts:296` | `marker` | *  Multiplayer link warp. Stubs no-op. */ |
| `src/engine/script/specials-registry.ts:297` | `marker` | registerSpecial('SetCableClubWarp', () => { /* no-op stub */ }); |
| `src/engine/script/specials-registry.ts:298` | `marker` | registerSpecial('DoCableClubWarp', () => { /* no-op stub */ }); |
| `src/engine/script/specials-registry.ts:730` | `marker` | *  Notre party est déjà partagée en RAM, donc no-op suffit côté TS. */ |
| `src/engine/script/specials-registry.ts:965` | `marker` | *  non porté → no-op 1:1 strict justifié. */ |
| `src/engine/script/specials-registry.ts:966` | `marker` | registerSpecial('LookThroughPorthole', () => { /* 1:1 justified : ferry cinematic non porté */ }); |
| `src/engine/script/specials-registry.ts:969` | `marker` | *  entrance. Notre projet web : pas de link adapter → no-op 1:1 strict justifié. */ |
| `src/engine/script/specials-registry.ts:976` | `marker` | *  Notre projet : pas de link wireless/serial → no-op 1:1 strict justifié. */ |
| `src/engine/script/specials-registry.ts:1036` | `marker` | // (routage song table). No-op RETIRÉ (double registration = clobber). |
| `src/engine/script/specials-registry.ts:1039` | `marker` | registerSpecial('RemoveRecordsWindow', () => { /* no-op */ }); |
| `src/engine/script/specials-registry.ts:1040` | `marker` | registerSpecial('CloseBattlePointsWindow', () => { /* no-op */ }); |
| `src/engine/script/specials-registry.ts:1041` | `marker` | registerSpecial('ShowBattlePointsWindow', () => { /* no-op */ }); |
| `src/ereader_helpers.ts:11` | `marker` | * l'appel (Règle 3 : pas de stub muet). |
| `src/ereader_helpers.ts:65` | `marker` | /** 1:1 `gShouldAdvanceLinkState` (link.c) — socle link non porté ; variable module INERTE. */ |
| `src/ereader_helpers.ts:67` | `marker` | /** Exemption matériel : `VBlankIntrWait()` (main.c) — attente d'interruption VBlank, no-op web. */ |
| `src/event_object_lock.ts:22` | `marker` | *  - `UnionRoom_UnlockPlayerAndChatPartner` (Union Room / link non porté). |
| `src/evolution_scene.ts:219` | `marker` | // ─── Helpers trade.c NON PORTÉS (fail-fast — link trade = P4, 0 caller vivant) ── |
| `src/evolution_scene.ts:220` | `marker` | function LoadTradeAnimGfx(): void { throw new Error('[evolution_scene] LoadTradeAnimGfx : trade.c non porté (link trade… |
| `src/evolution_scene.ts:221` | `marker` | function DrawTextOnTradeWindow(_windowId: number, _text: Uint8Array \| string, _speed: number): void { throw new Error('… |
| `src/evolution_scene.ts:222` | `marker` | function LinkTradeDrawWindow(): void { throw new Error('[evolution_scene] LinkTradeDrawWindow : trade.c non porté (link… |
| `src/evolution_scene.ts:223` | `marker` | function InitTradeSequenceBgGpuRegs(): void { throw new Error('[evolution_scene] InitTradeSequenceBgGpuRegs : trade.c n… |
| `src/evolution_scene.ts:226` | `marker` | // gWirelessCommType / wireless status indicator (link) : non portés — path trade only. |
| `src/item_menu.ts:1965` | `marker` | *  fichier). SELECT swap = CanSwapItems()==FALSE (étape 7, no-op honnête). |
| `src/menu_helpers.ts:14` ⚙️ | `marker` | *    fourni par engine ; non porté ici. |
| `src/overworld.ts:1452` | `marker` | *     au boot, pas de link web → no-op documenté. |
| `src/overworld.ts:1462` | `marker` | // FieldClearVBlankHBlankCallbacks(); — hardware link/interrupts/VBlank (no-op, cf. en-tête) |
| `src/overworld.ts:1477` | `marker` | *   - FieldClearVBlankHBlankCallbacks() : hardware (no-op, cf. CB2_NewGame). |
| `src/overworld.ts:1485` | `marker` | // FieldClearVBlankHBlankCallbacks(); — hardware link/interrupts/VBlank (no-op) |
| `src/party_menu.ts:3335` | `marker` | *  le stub "dette R3". `action` = _actionList[_actionCursor] (>= MENU_FIELD_MOVES). |
| `src/player_pc.ts:998` | `marker` | // Fix B2 : `spr.oam.priority` n'existe pas dans DecompSprite (= no-op cast). |
| `src/pokeball.ts:468` | `marker` | // portes. Structure conditionnelle 1:1 conservee (no-op). |

*(+10 autres — voir le détail par fichier.)*

### 2. Dette du transpileur c→ts : `TRANSPILER-TODO` — 320

Annotations **générées automatiquement** par `scripts/transpile-c.cjs` (majorité : `&élément scalaire (out-param ?)` = adresse-de-scalaire non résolue lors de la transpilation de tableaux `SaveBlock`). Ce ne sont **pas** des stubs manuels : elles marquent des points de transpilation à re-vérifier, pas des primitives absentes. À traiter par le chantier transpileur (cf. `audit-reports/transpile/`), séparément des gardes moteur. Répartition par fichier :

| Fichier | TRANSPILER-TODO |
|---|--:|
| `src/tv.ts` | 122 |
| `src/pokenav_conditions.ts` | 42 |
| `src/pokenav_ribbons_summary.ts` | 21 |
| `src/match_call.ts` | 17 |
| `src/pokenav_main_menu.ts` | 15 |
| `src/pokenav_conditions_search_results.ts` | 14 |
| `src/pokenav_menu_handler_gfx.ts` | 14 |
| `src/pokenav_ribbons_list.ts` | 14 |
| `src/credits.ts` | 11 |
| `src/pokenav_match_call_gfx.ts` | 11 |
| `src/pokenav_conditions_gfx.ts` | 10 |
| `src/battle_tv.ts` | 7 |
| `src/pokenav_region_map.ts` | 6 |
| `src/battle_factory.ts` | 5 |
| `src/pokenav_menu_handler.ts` | 5 |
| `src/pokenav_list.ts` | 3 |
| `src/pokenav_match_call_list.ts` | 2 |
| `src/rotating_tile_puzzle.ts` | 1 |

### 3. Marqueurs en commentaire de documentation — 950

Findings `marker` dont la ligne est un **commentaire** (`//`, `*`, `/*`). Une large part documente un comportement 1:1 (« no-op chez nous car … », « STUB décomp d'origine », descriptions de `placeholder`/`{STR_VAR}`) plutôt qu'une dette réelle. À trier manuellement — beaucoup sont légitimes.

### 4. `placeholder` = concept décomp — 123 findings `marker` contiennent « placeholder »

Le décomp emploie `placeholder` comme terme métier (`DYNAMIC_PLACEHOLDER`, `PLACEHOLDER_BEGIN`, `ExpandPlaceholders`, `{STR_VAR_n}`). Le filtre par limite de mot écarte déjà les identifiants camelCase (`ExpandPlaceholders`), mais les commentaires « placeholder {STR_VAR_1} » restent — majoritairement légitimes.

### 5. `empty-body` = HEURISTIQUE

La détection de corps vide/return trivial est **ligne-par-ligne** (ne voit PAS les corps multi-lignes) et peut confondre une signature avec un vrai no-op voulu. Chaque finding `empty-body` est à vérifier à la main (marqué *heuristique*).

---

_Fin du rapport — 1786 findings, généré par `scripts/audit-engine-stubs.cjs` le 2026-07-16._