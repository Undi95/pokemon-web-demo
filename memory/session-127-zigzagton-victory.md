# Session 127 — 🏆 COMBAT ZIGZAGTON GAGNÉ (from-scratch ?truck)

**Date** : 2026-05-10 (nuit, user dormait)
**Branche** : worktree hungry-moore-a74774
**Contexte** : User a fix le menu options/start avant de dormir. /loop dynamic mode a demandé de "tout faire et gagner le combat vs zigzaton". Mission accomplie.

---

## 🎯 Résultat principal

**Le flow complet from-scratch (truck → Mom → 2F → wallclock → Mom 2F → outside → MaysHouse → MeetRival → Route 101 → Birch help → starter Poussifeu → combat Zigzagton → VICTOIRE) fonctionne 1:1 décomp PRET !**

Flag final : `FLAG_RESCUED_BIRCH` ✓

---

## 📋 Étapes validées (1:1 décomp)

| # | Étape | Décomp ref | Status |
|---|-------|------------|--------|
| 1 | Boot ?truck → spawn camion (2,2) facing SOUTH | `WarpToTruck` new_game.c:127 | ✓ |
| 2 | Walk East 3 → warp to MAP_LITTLEROOT_TOWN (4,10) | `setdynamicwarp` truck/scripts.inc | ✓ |
| 3 | Mom apparaît + dialog "MAMAN: PLAYER, on est là, chouchou!" | `LittlerootTown_EventScript_Mom` | ✓ |
| 4 | Dialog continue : "Voilà, c'est BOURG-EN-VOL." → "Et tu as ta propre chambre" | text.inc 1:1 | ✓ |
| 5 | Mom warp + player follow chez Brendan 1F | applymovement | ✓ |
| 6 | Dialog 1F Mom : "Alors, PLAYER? C'est joli ici, non?" + "PAPA a acheté une nouvelle horloge" | scripts.inc:37-40 | ✓ |
| 7 | Stairs → 2F (warp 0x60 metatile (8,2) 1F → spawn 2F (7,2)) | warp event | ✓ |
| 8 | Interact wallclock (5,1) → "L'horloge est arrêtée…" → FLAG_SYS_CLOCK_SET | `LittlerootTown_BrendansHouse_2F_EventScript_WallClock` | ✓ |
| 9 | Mom monte voir : "PLAYER, ta nouvelle chambre te plaît?" | `BrendansHouse_2F_OnFrame` | ✓ |
| 10 | Stairs DOWN (7,1) → retour 1F | warp | ✓ |
| 11 | Walk down → coord trigger PetalburgGymReport "Oh! PLAYER, PLAYER! Vite! Viens voir!" | `LittlerootTown_BrendansHouse_1F_OnFrame` map_script_2 | ✓ |
| 12 | "C'est notre voisin. Tu pourrais aller lui dire bonjour" → introState=7 | scripts.inc | ✓ |
| 13 | Sortir maison → Bourg outside (5,9) | warp door | ✓ |
| 14 | Walk East 9 + Up 1 → MaysHouse (14,8) | warp door | ✓ |
| 15 | Coord trigger RivalMom : "Oh, bonjour. Qui es-tu?" → FLAG_MET_RIVAL_MOM | `RivalsHouse_1F_EventScript_RivalMom` ou OnFrame | ✓ |
| 16 | Stairs (1,2) → 2F | warp | ✓ |
| 17 | (Pas touche pokeball, descend direct) | user advice | ✓ |
| 18 | Stairs DOWN → 1F MaysHouse | warp | ✓ |
| 19 | Walk down → coord trigger MeetRival : "Hein? Qui... Qui es-tu?" + "J'espérais que tu serais sympa, PLAYER" | `LittlerootTown_MaysHouse_1F_EventScript_MeetRival` | ✓ |
| 20 | rivalState passe 2→3, May disparaît + setflag MAYS_HOUSE_MAY + clearflag MAYS_HOUSE_RIVAL_BEDROOM | scripts.inc:194-200 | ✓ |
| 21 | Sortie 1F → Bourg | warp door | ✓ |
| 22 | Walk Up vers Route 101 (twin loop bypass via 'b' button pour close dialog) | bypass tactique | ✓ |
| 23 | Entrée Route 101 (11,19) → "A... A l'aide!" Birch attaqué Zigzagoon | `Route101_OnFrame` Birch help | ✓ |
| 24 | Walk vers sac Birch (7,14) face NORTH press A | `Route101_EventScript_BirchsBag` | ✓ |
| 25 | Menu choix starter affiché : POUSSIFEU/POUSSIN au sprite + 3 pokeballs | `EventScript_StarterChoose` | ✓ |
| 26 | "Le PROF. SEKO a des ennuis! Choisis un POKéMON et sauve-le!" | text.inc 1:1 | ✓ |
| 27 | Press A → Poussifeu obtenu (party slot 0, lvl 5, HP 21, moves 2) | `GiveMon` | ✓ |
| 28 | "Un ZIGZATON sauvage apparaît!" → battle starts | `BATTLE_TYPE_FIRST_BATTLE` via `CB2_StartFirstBattle` | ✓ |
| 29 | Menu attaque "CHARGE" / "RUGISSEMENT" affiché | battle backend Showdown | ✓ |
| 30 | CHARGE → 12 dmg → 10/12 → 4/12 PV Zigzaton (2 hits) | dmg calc Showdown | ✓ |
| 31 | KO Zigzaton → "Ce n'est pas un endroit pour discuter. Allons au LABO POKéMON, OK?" | `Route101_EventScript_BirchAfterBattle` | ✓ |
| 32 | FLAG_RESCUED_BIRCH set ✓ | scripts.inc | ✓ |

---

## 🐛 Bugs trouvés (à fix plus tard, non-bloquants)

### Bug #1 : `window.scope.dialog().open` retourne false alors que dialog ACTUELLEMENT visible
- **Repro** : Pendant n'importe quel dialog ouvert, `window.scope.dialog()` retourne `{ open: false }`.
- **Root cause probable** : `dev-scope.ts:_dialog()` lit `__sCurrentText` et `__fieldMessageBox` qui ne sont pas exposés sur globalThis correctement. La textbox est rendue via Phaser direct (pas via __fieldMessageBox).
- **Impact** : Devtools console moins fiable pour détecter dialog ouvert. N'impact pas le gameplay.
- **Fix suggéré** : Hook directement sur l'objet textbox Phaser ou lire un flag global comme `gWindowOpen` / `gPaletteFade.active`.

### ~~Bug #2~~ : ❌ NON-bug confirmé par user — twin NPC bloque exprès
- **Init repro** : Près de la twin de Bourg-en-Vol (10,1) facing WEST, chaque press A re-déclenche son script.
- **User feedback (2026-05-10 00:XX)** : "La fille qui te bloque twin c'est normal c'est pour te forcer a faire l'event du starter."
- **Conclusion** : 1:1 ROM PRET. La twin sert de "garde" pour empêcher player d'aller dans les hautes herbes sans Pokémon. Notre comportement = correct. Workaround dev seulement (press B au lieu de A).

### Bug #3 : `bag` retourne tableau de 16 slots vides + 1 POKE_BALL au lieu de juste les items
- **Repro** : `window.scope.bag()` retourne énorme objet avec tous les slots vides "{ item: '', qty: 0 }".
- **Fix dev-scope.ts** : filter `out: items.filter(it => it.itemKey)` pour ne retourner que les items présents.

### Bug #4 : `party[0].hp` = "undefined/21"
- **Repro** : `window.scope.party()` montre `hp: "undefined/21"`.
- **Root cause** : `gameState.party[0].hp` est probablement stocké sous une autre clé (`currentHp`, `currentHP`, `current_hp` ?). Le devtools cherche `mon.hp` mais c'est ailleurs.
- **Fix dev-scope.ts** : essayer plusieurs aliases : `mon.hp ?? mon.currentHp ?? mon.currentHP ?? mon.current_hp`.

### Bug #5 : `party[0].moves` montre `"undefined(35), undefined(40)"`
- **Root cause** : `mon.moves[i].name` n'est pas remplie. Probablement `move.id` ou `move.move` à la place.
- **Fix dev-scope.ts** : essayer `mv.name ?? mv.move ?? mv.id`.

### Bug #6 : `where()` retourne `?` pour mapName
- **Repro** : `window.scope.where()` → `"? (5,9) facing SOUTH"` au lieu de `"MAP_LITTLEROOT_TOWN (5,9)..."`
- **Root cause** : `gameState.data.location.__mapId` undefined. La structure est probablement `gameState.location.mapName` ou similar.
- **Fix dev-scope.ts** : essayer plusieurs paths.

### Bug #7 (côté GAME pas devtools) : `npcs[i].id` retourne `""` (chaîne vide) pour beaucoup de NPCs
- **Repro** : Plusieurs NPCs ont `localIdRaw=""` au lieu d'un nom comme `LOCALID_LITTLEROOT_TWIN`.
- **Root cause** : Le flow `localIdRaw` n'est pas posé sur tous les ObjectEvents lors du spawn. Probablement seul le LOCALID_PLAYER et quelques autres named ones l'ont.
- **Fix engine** : Au spawn ObjectEvent depuis map.json, copier la string `local_id` directement dans `obj.localIdRaw`.

---

## ✨ Patterns devtools validés

### Press A + ArrowUp séparés (twin loop bypass)
```js
// Press B 5x pour close all dialogs
for (let i = 0; i < 5; i++) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', code: 'KeyX' }));
  await sleep(80);
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'x', code: 'KeyX' }));
  await sleep(500);
}
// Puis ArrowUp direct (pas A) pour walk sans re-talk
for (let i = 0; i < 8; i++) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' }));
  await sleep(250);
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp', code: 'ArrowUp' }));
  await sleep(100);
}
```

### Find warps via tile().behavior
```js
// Stairs DOWN/UP : behavior 0x60-0x61
// Door warps : behavior 0x65
// Carpet exit : behavior 0x69 (front of door)
const warps = [];
for (let x = 0; x < 11; x++) for (let y = 0; y < 9; y++) {
  const t = window.scope.tile(x, y);
  if (['0x60', '0x61', '0x65', '0x69'].includes(t.behavior)) warps.push({x,y,...t});
}
```

---

## 📊 Stats finales du flow

- **Flow durée** : ~5 minutes total via devtools
- **Maps traversées** : 6 (TRUCK → LITTLEROOT_TOWN → BRENDANS_HOUSE_1F → BRENDANS_HOUSE_2F → MAYS_HOUSE_1F → MAYS_HOUSE_2F → ROUTE101)
- **Coord triggers fired** : 5 (Mom intro, PetalburgGymReport, RivalMom, MeetRival, Birch help)
- **Specials utilisés** : ChooseStarter, BattleSetup_StartFirstBattle (et toutes leurs deps)
- **Vars finales** : INTRO_STATE=7, RIVAL_STATE=3, TOWN_STATE=2 (rescued progress), ROUTE101_STATE=2, STARTER_MON=1
- **Flags finaux clés** : SYS_CLOCK_SET, MET_RIVAL_MOM, RESCUED_BIRCH, SYS_POKEMON_GET, SYS_TV_HOME

---

## 🎁 Backup save

Avant le test from-scratch, j'ai backup la save existante dans `localStorage.__backup_post_zigzagton`. Pour la restaurer :
```js
const b = JSON.parse(localStorage.getItem('__backup_post_zigzagton'));
for (const [k, v] of Object.entries(b)) localStorage.setItem(k, v);
location.reload();
```

La save existante avait DÉJÀ tout (Pokédex, badges Bourg, Poussifeu lvl5, FLAG_RESCUED_BIRCH, FLAG_DEFEATED_RIVAL_ROUTE103). Le user voulait juste vérifier que le flow tient encore from-scratch — **OUI, IL TIENT 1:1 DÉCOMP**.

---

## 🔜 Pour la prochaine session

1. **Fix les 6 bugs devtools** ci-dessus (fichier `src/engine/dev-scope.ts`) — petits patches, ~50 lignes
2. **Wire les manques de l'audit (audit-coverage.json)** :
   - 151 opcodes manquants (mais beaucoup post-game/Battle Frontier)
   - 113 specials manquants (post-game + contests)
3. **Wire les battle anims** : pour chaque move, `playSE` au minimum (= 1 son par move). Décomp via `gMoves[moveId].animation` table.
4. **Wire FieldEffectStart** : Cut/Surf/Fly/Strength/RockSmash + emote_exclamation_mark via `gFieldEffectScriptPointers`.
5. **Test continuer** : aller au labo Birch pour Pokédex → Route 103 vs rival → Oldale → ... (la save existante a déjà tout ça).

---

**Pour résumer en une phrase** : Le port TypeScript/Phaser de Pokémon Émeraude FR a maintenant un flow boot→combat-Zigzaton **100% 1:1 décomp PRET fonctionnel**. 32 étapes validées sans aucun bug bloquant. Les bugs trouvés sont tous côté devtools (cosmétiques) ou contournables (twin loop). 🎉

— Claude Sonnet 4.5, session 127, 2026-05-10

---

## 🎮 Session 127 — Suite : menu Start toutes options wirées (commits 876366b1, 74b938ea, c0591fe9)

**User feedback** : "Pour tout ce qui va être graphisme de menu de pokemon, sac, objet etc... On peut automatisé ça aussi ? Nouveau but : Menu start 1:1 decomp avec options qui marchent (toutes, pas de no op)"

**Réponse à la question graphisme** : OUI automatisable. Le décomp PRET est open-source complet. On a déjà 100% des assets bruts (PNG/PAL/BIN) et 5000+ lignes d'auto-files transpilés. Stratégie retenue = custom UI quasi-1:1 avec primitifs gba-window/text/menu (au lieu de wirer les auto-files complets qui requièrent ~100+ bridge fns gba bas niveau).

**Travail accompli** :

### 1. Fix `dialog()` devtools (commit 96b0620c)
- Root cause : `sCurrentText` est une `let` privée du module field-message-box.ts, jamais exposée sur globalThis
- Fix : import direct `IsFieldMessageBoxHidden` + nouvelle fonction exportée `GetCurrentFieldMessageText()`
- Validé : `scope.dialog()` retourne maintenant `{ open: true, mode: 'NORMAL', text: "..." }` quand dialog visible

### 2. Bag screen pixel-perfect étape 1 (commits 8dc34208 → 876366b1)
- Création `src/engine/bag-screen.ts` (~280 lignes)
- 5 pockets navigables (OBJETS / POKé BALLS / CT/CS / BAIES / OBJETS RARES)
- Scroll 5 items visibles à la fois, indicateurs ↑/↓
- Description par item via `getItemDescriptionFr`
- Inputs : ↑/↓ scroll, ←/→ pocket, A use, B retour
- **Étape 1 visuelle** : sprite sac réel chargé du décomp (`bag_male.png` 64×64, palette slot 13, blit dans window dédiée)
- Assets copiés `decomps/pokeemeraude/graphics/bag/*` → `public/decomp/em/bag/` + 218 item icons → `public/decomp/em/items/icons/`
- **Étape 2 visuelle reportée** : tilemap fond menu.bin (rayures rose/mauve), frame orange custom, pocket dots animés rotating_ball.png, item icon par row, select_button bottom-left

### 3. Bug critique fix : descriptions items FR (commit 74b938ea)
- **Bug** : `text-tables.json` jamais loadé en mode `?nointro` (= seul starter-choose-flow.ts le load on-demand) → bag screen affichait "Prix: 200" fallback au lieu de la vraie description
- **Fix** : preload `text-tables.json` au boot main.ts (= idempotent async fetch)
- **Validé** : POKé BALL → "Un objet qui permet d'attraper les POKéMON sauvages." (1:1 décomp fr décomp)

### 4. Toutes options Start menu wirées (commit c0591fe9)
- `src/engine/party-screen.ts` (~210 lignes) : 6 slots POKéMON avec nicknames, HP color-coded (vert/jaune/rouge selon ratio), moves avec PP, ability, types
- `src/engine/trainer-card-screen.ts` (~135 lignes) : nom / sexe / ID / argent / POKéMON / POKéDEX captures / badges / play time
- `src/engine/pokedex-screen.ts` (~110 lignes) : Vus / Capturés via flags `_SEEN`/`_CAUGHT` + stats équipe
- start-menu.ts intégration : nouvelles SubStates (`bag_screen` / `party_screen` / `trainer_card_screen` / `pokedex_screen`), TickStartMenu dispatch vers chaque tick
- Pattern commun : `IsXOpen` / `OpenX(onClose)` / `CloseX` / `TickX(newKeys)`

**État final menu Start** :

| Option | Avant | Après |
|--------|-------|-------|
| POKéDEX | text "compteur" | UI Vus/Capturés + stats |
| POKéMON | text "party list" | UI 6 slots + nicknames + HP color + moves |
| SAC | text "items list" | UI 5 pockets + sprite sac + scroll + descriptions FR |
| POKéNAV | "non disponible" | (toujours stub si !FLAG_SYS_POKENAV_GET, 1:1 ROM) |
| {PLAYER} | text "name+gender" | UI Carte Dresseur (nom/sexe/ID/badges/play time) |
| SAUVER | ✓ déjà 1:1 | (rien changé) |
| OPTIONS | ✓ déjà 1:1 | (rien changé) |
| RETOUR | ✓ trivial | (rien changé) |

**À faire prochaine session** :
- Tilemap fond `menu.bin` pour SAC (rayures rose/mauve identiques au screen officiel)
- Frame orange custom du décomp (= ajouter select_button + frames colorées)
- Sprites contextuels :
  - Trainer pic dans CARTE DE DRESSEUR (= sprite male/female du décomp)
  - Mon sprites front dans POKéMON (= sprite Poussifeu, etc.)
  - Mini-icons mons dans POKéDEX list scrollable
- Item icon par row dans SAC list (= petite icône POKé BALL rouge à gauche)
- Pocket dots animés rotating_ball.png (= 5 dots, l'actif clignote)

— Claude Sonnet 4.5, session 127 suite, 2026-05-10

---

## 🎨 Session 127 — Pixel-perfect étape 2 (commits 82d704b8, b23abff5)

**User feedback** : "Ouai, bon, on est loin du frame perfect" + screenshot officiel + "Fait les graphismes 1:1 maintenant"

### Tilemap fond menu.bin (commit 82d704b8) — INFRASTRUCTURE OK, COULEURS WIP
- Load `menu.png` + `menu.bin` + `menu_male/female.pal` au open via `_loadAssets`
- BG2 takeover : save overworld VRAM (`charBase 3 + mapBase 4`) + sub-palette 0 + BG2 config avant load. Restore au close → overworld revient propre (validé)
- `InitBgFromTemplate` avec priority 3 (= behind windows BG0)
- HideBg(1)+HideBg(3) au open → ShowBg(1)+ShowBg(3) au close
- **Marche** : tilemap rendu visible (bandes), overworld restored après close ✓
- **À fix** : couleurs N&B au lieu de rose/mauve. Cause : `loadIndexedPngStrict` re-mappe les indices selon la PLTE du PNG, qui diffère de `menu_male.pal`. Tentative de combinedPal (PNG + 2ème sub-pal de menu_male) ne marche pas non plus. Solution probable : charger menu.png en **raw mode** sans remapping (= juste lire les nibbles direct), OU regenerer un .4bpp.bin pré-converti

### Item icon de l'item sélectionné (commit b23abff5) — ÇA MARCHE ✅
- Window dédiée 24×24 px (3×3 tiles) sous le sprite sac
- Cache `_itemIconCache` pour pas re-fetch à chaque scroll
- Lazy load via `loadIndexedPngStrict('/decomp/em/items/icons/<slug>.png')` avec slug = `ITEM_KEY.toLowerCase().replace('item_', '')`
- Palette de l'icon chargée dans slot dédié (`ITEM_ICON_PAL = 11`) à chaque change d'item
- Re-draw automatique quand cursor scroll (up/down/left/right) → icon change instantanément
- **Validé** : POKé BALL → icon rouge+blanche identique au décomp ✓

### État final SAC

| Élément | Décomp officiel | Notre rendu |
|---------|-----------------|-------------|
| Sprite sac vert | ✓ | ✓ (commit 876366b1) |
| Description FR item | "Un objet qui permet..." | ✓ (commit 74b938ea) |
| Item icon (POKé BALL etc.) | rouge/blanc 24×24 | ✅ (commit b23abff5) |
| Tilemap fond rayé rose/mauve | rayures verticales | ⚠️ infra OK, couleurs N&B (b23abff5+82d704b8) |
| Frame orange custom | ✓ | ❌ pas encore |
| Pocket dots indicator | 5 dots, actif rouge | ❌ pas encore |
| select_button bottom-left | "Retourner au jeu." | ❌ pas encore |

### Total commits session 127 (8 commits + 1 commit notes)

| Commit | Sujet |
|--------|-------|
| `fb12c78f` | Combat Zigzagton + 4 fixes devtools |
| `96b0620c` | Fix dialog() devtools (root cause) |
| `8dc34208` | SAC fonctionnel (5 pockets + nav + descs) |
| `876366b1` | SAC clean : sprite sac visible |
| `74b938ea` | SAC : descriptions FR du décomp chargées |
| `c0591fe9` | Toutes options Start menu wirées (POKéMON / PLAYER / POKéDEX) |
| `27bd587b` | Notes md session 127 finales |
| `82d704b8` | Pixel-perfect étape 2 WIP : tilemap fond infrastructure |
| `b23abff5` | Pixel-perfect : item icon (POKé BALL render OK) |

— Claude Sonnet 4.5, session 127 polish visuel, 2026-05-10

---

## 🏆 Session 127 — SAC pixel-perfect 1:1 décomp COMPLET (commits 32c574a9 → e14f7ad7)

**User feedback** : "regarde la decomp si t'es pas sur, on a tout, tu dois juste appliqué" + "priorise le 1:1 ligne par ligne plutôt que essais erreur" + "regarde le type de fading utilisé pour rentrer/sortir, je pense que c'est ça qui fait que la palette est mauvaise sur l'OW"

### Approche validée : 1:1 ligne par ligne via décomp lookup

Au lieu d'essai-erreur, chercher dans le décomp la fonction concernée puis reproduire exactement. Spawned agent Explore pour audit de `src/item_menu.c` qui m'a donné les valeurs exactes :
- `sBgTemplates_ItemMenu[2] = { bg=2, charBaseIndex=3, mapBaseIndex=29, priority=2 }`
- `sDefaultBagWindows[WIN_ITEM_LIST] = (14, 2, 15, 16) paletteNum=1 baseBlock=0x27`
- `sDefaultBagWindows[WIN_DESCRIPTION] = (0, 13, 14, 6) paletteNum=1 baseBlock=0x117`
- `sDefaultBagWindows[WIN_POCKET_NAME] = (4, 1, 8, 2) paletteNum=1 baseBlock=0x1A1`
- `LoadCompressedPalette(gBagScreen{Male,Female}_Pal, BG_PLTT_ID(0), 64)` — 32 entries
- `DecompressAndCopyTileDataToVram(2, gBagScreen_Gfx, 0, 0, 0)` — tile data à charBase 3
- `LZDecompressWram(gBagScreen_GfxTileMap, gBagMenu->tilemapBuffer)` puis `SetBgTilemapBuffer(2, ...)` — tilemap à mapBase 29

### Pipeline complet des fixes (16 commits)

| # | Commit | Sujet |
|---|--------|-------|
| 1 | `82d704b8` | Infrastructure tilemap fond menu.bin (BG2 takeover) |
| 2 | `b23abff5` | Item icon de l'item sélectionné (POKé BALL render) |
| 3 | `821c8cfb` | raw 4bpp.bin (`extract-all-tile-bins.mjs` extended) + camera suspend |
| 4 | `c50d1552` | BG2 priority 2 (1:1 décomp) |
| 5 | `32c574a9` | FERMER LE SAC entry (1:1 gText_CloseBag) |
| 6 | `5c8957fb` | Windows transparentes PIXEL_FILL(0) — voir BG2 derrière |
| 7 | `7e0d651f` | Hide NPCs/player via _syncSubspriteOam hook (1:1 ResetVramOamAndBgCntRegs) |
| 8 | `9f5f35be` | Clear BG0 mapBase 31 (= overworld map cachée derrière windows) |
| 9 | `3c515da7` | Pocket dots indicator via FillBgTilemapBufferRect (tiles 0x1017/0x102B) |
| 10 | `98282cbe` | Header window position 1:1 (4, 1, 8, 2) paletteNum=1 baseBlock=0x1A1 |
| 11 | `d001ff69` | List+desc windows 1:1 positions (paletteNum=1, baseBlock 0x27/0x117) |
| 12 | `2735e86a` | **Fade in/out 1:1 + fix palette leak rouge OW (paletteSnap 16→32 entries)** |
| 13 | `e14f7ad7` | Labels pockets 1:1 + "Retourner / au jeu." 2 lignes |

### Bug critique identifié + fixé : palette leak

User : "y a la couleur rouge qui a leak sur l'ombre des pancartes"

Root cause : on chargeait `LoadPalette(bgPalette, 0, 64)` (= 32 entries menu_male.pal écrasant sub-palettes 0 ET 1 du BG_PLTT) mais on save juste 16 entries (= sub-palette 0 seulement). Au close, sub-palette 1 restait clobbée → leak rouge sur les metatiles overworld qui utilisent sub-palette 1 pour leurs ombres/borders (boîtes aux lettres, pancartes).

Fix : `paletteSnap = new Uint16Array(32)` + restore les 32 entries. Combiné avec le fade in/out (= 1:1 décomp Task_FadeAndCloseBagMenu), la transition est parfaite.

### État final SAC vs décomp officiel

| Élément | Décomp | Notre rendu |
|---------|--------|-------------|
| Tilemap fond rose/mauve | ✓ | ✅ 1:1 |
| Frame ORANGE chevrons header | ✓ | ✅ 1:1 (window position align frame menu.bin) |
| Cercle décor à gauche header | ✓ | ✅ 1:1 (in tilemap) |
| 5 pocket dots indicator | ✓ | ✅ 1:1 (tile 0x1017/0x102B) |
| Sprite sac vert | ✓ | ✅ 1:1 (bag_male.4bpp.bin via window) |
| Item icon (POKé BALL) | ✓ | ✅ 1:1 |
| Zone list jaune pâle | ✓ | ✅ 1:1 (15×16 tiles) |
| Zone description jaune pâle | ✓ | ✅ 1:1 (14×6 tiles, baseBlock 0x117) |
| Labels pockets : OBJETS / POKé BALLS / CT & CS / BAIES / OBJ. RARES | ✓ | ✅ 1:1 strings.c |
| FERMER LE SAC entry | ✓ | ✅ 1:1 gText_CloseBag |
| "Retourner / au jeu." sur 2 lignes | ✓ | ✅ 1:1 gText_ReturnToVar1 |
| Description FR du décomp | ✓ | ✅ 1:1 text-tables.json |
| NPCs/player overworld cachés | ✓ | ✅ 1:1 |
| Map overworld cachée | ✓ | ✅ 1:1 |
| Pocket switching fonctionnel | ✓ | ✅ 1:1 |
| **Fade in/out RGB_BLACK** | ✓ | ✅ 1:1 (Task_FadeAndCloseBagMenu) |
| **OW restored proprement** | ✓ | ✅ 1:1 (paletteSnap 32 entries) |

### Reste pour 100% pixel-perfect (= optionnel)

- ❌ Sprite sac en OAM animé (= shake / pocket switch jump). Actuellement window opaque qui montre le sprite mais pas d'anim au switch.
- ❌ rotating_ball OAM sprite anim au switch pocket.
- ❌ Bag scroll arrows (= petites flèches haut/bas quand list scrollable).

### Pattern réutilisable pour les autres screens (party, trainer card, pokedex)

Le bag-screen.ts est maintenant un **modèle template** pour les autres écrans menu :
1. Save BG2/VRAM/palette au open
2. Load assets via loadTileBin (raw 4bpp) + loadGbaPal (vrai .pal du décomp)
3. Setup BG2 avec InitBgFromTemplate (charBase + mapBase + priority 2)
4. Hide BG1/BG3 + clear BG0 mapBase 31
5. Install _syncSubspriteOam hook pour cacher les sprites overworld
6. setFieldCameraSuspended(true)
7. BeginNormalPaletteFade FROM BLACK
8. Tick : phase machine 'fading_in' → 'open' → 'fading_out'
9. Au close : fade TO BLACK → wait fade fini → restore tout → fade FROM BLACK

L'approche 1:1 ligne par ligne valide : chercher dans le décomp la fonction (e.g. `BagMenu_InitBGs`, `LoadBagMenu_Graphics`, `LoadBagMenuTextWindows`, `Task_FadeAndCloseBagMenu`), copier les valeurs exactes (templates, baseBlocks, palette IDs, tile IDs, positions), puis adapter au runtime engine. Beaucoup plus efficace que essai-erreur.

— Claude Sonnet 4.5, session 127 SAC complet, 2026-05-10
