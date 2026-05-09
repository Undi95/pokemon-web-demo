# Next session — Bugs restants à fixer (5)

Date : 2026-05-09 fin user session
Branch : `upd2`

User a signalé 5 bugs visuels après les fixes de cette session.
Tous reproductibles, tous identifiés au visuel.

## Bug 1 — Vigoroth déménageurs 48x48 → garbage rendering

**Symptôme** : Dans Brendan's House 1F, les 2 Vigoroth déménageurs (= un
qui porte une boîte avec animation walk-left-and-right, un qui regarde
vers le haut walk-in-place-up) sont rendus avec **garbage tiles** au lieu
des sprites Vigoroth corrects.

**Données de spawn** (= map.json) :
```
LOCALID_VIGOROTH_CARRYING_BOX :
  graphics_id: OBJ_EVENT_GFX_VIGOROTH_CARRYING_BOX
  x: 1, y: 3
  movement_type: WALK_RIGHT_AND_LEFT
  flag: FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_2

LOCALID_VIGOROTH_FACING_AWAY :
  graphics_id: OBJ_EVENT_GFX_VIGOROTH_FACING_AWAY
  x: 4, y: 5
  movement_type: WALK_IN_PLACE_UP
  flag: FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_1
```

**Spec Vigoroth** : sprite 48×48 pixels (= 6×6 tiles). Notre runtime
support déjà ça (= subsprite tables) car le truck cinematic affiche un
Vigoroth qui SAUTE de la cinématique des boîtes correctement.

**Investigation à faire** :
1. Open Brendan's House (= warp player INTO house) puis `dev.audit.sprites()`
   pour voir le tile assignment des deux Vigoroths
2. Compare avec truck cinematic Vigoroths (= sprites OK)
3. Look at `object-event-graphics.ts` pour `OBJ_EVENT_GFX_VIGOROTH_CARRYING_BOX`
   spawn path : peut-être que la subsprite table n'est pas attached à ces
   spawns indoor
4. Check `_spawnSingleNpcFromTemplate` pour voir si 48×48 sprites sont
   handled differently vs 16×16 standard NPCs
5. Possible cause : tile cache collision entre 2 Vigoroths qui sharent
   des tile slots (= LoadCompressedSpriteSheet collision)

**Fichiers à investiguer** :
- `src/engine/object-events.ts:_spawnSingleNpcFromTemplate`
- `src/engine/object-event-graphics.ts` (= GFX catalog)
- Peut-être `src/engine/decomp-data/auto/src-all/event_object_movement-all-auto.ts` pour Vigoroth-specific anim funcs

## Bug 2 — Truck SE timing décalé (frustrant)

**Symptôme** : Le bruit du camion (= cinematic intro où boxes bouncent)
est décalé. SE1 joue, puis silence, puis SE2. Devrait être SE1 → SE2
direct sans silence.

User suggestion : "vérifie les logs si y a pas un spam/décalage,
normalement le son se joue sans couper".

**Investigation à faire** :
1. Lance `?truck=1` pour reproduire
2. Watch console logs pour spam `[playse]` ou `[playsewithpan]`
3. Identify quel SE est SE1 et SE2 (= probablement `SE_BIKE_BELL` et
   `SE_BANG`, ou similaire pour box bounce)
4. Check `playsewithpan` opcode in `script-opcodes.ts` (lignes ~1700+) :
   est-ce qu'il queue ou play immediate ?
5. Check `m4a` audio engine SE slot management (= se1 slot vs se2 slot,
   peut-être SE2 attend la fin de SE1 alors qu'il devrait override)
6. Compare avec real GBA timing (= via mGBA emulator si possible)

**Fichiers à investiguer** :
- `src/engine/script-opcodes.ts` (`playse`, `playsewithpan`, `waitse`)
- `src/engine/m4a/audio-context.ts` (= SE slot allocation)
- `src/engine/decomp-globals.ts` (`PlaySE` impl)

**Truck cinematic script** :
```
data/maps/InsideOfTruck/scripts.inc
```
Cherche `playse SE_*` séquences pour identifier les sons + leur timing.

## Bug 3 — Caisse camion coupée visuellement

**Symptôme** : "La caisse en bas dans le camion coupée en deux ne ne l'est
pas, c'est ce qu'il y a au dessus (haut d'une autre boite) qui la cache
(un pixel visible lors du trajet)".

User explication : visuellement la caisse semble coupée mais en réalité
c'est UNE AUTRE caisse qui passe AU-DESSUS et la masque. Mais 1 pixel
restant est visible pendant le trajet (= le trajet de la caisse qui
descend dans la cinematic).

**Investigation à faire** :
1. Lance `?truck=1`
2. Watch attentivement la cinématique des boîtes qui bouncent
3. Identifier la caisse "en bas" qui semble coupée
4. Determine which sprite is rendered ABOVE it (= subsprite or different OAM)
5. 1-pixel visible suggère sub-tile alignment issue, ou un Z-clip qui
   cut le sprite à un pixel près

**Possibles causes** :
- Subsprite table boundary off-by-one
- OAM x/y offset différent entre sprite parent et child
- Compositor "last write wins" bordering edge case

**Fichiers à investiguer** :
- `src/engine/decomp-data/auto/src-all/intro-all-auto.ts` (= truck cinematic boxes)
- `src/engine/decomp-runtime.ts:syncSpritesToOam` (= OAM sync logic)
- `src/engine/gba/compositor.ts` (= rendering)

## Bug 4 — WallClock UI freeze

**Symptôme** : Quand player interagit avec l'horloge dans la chambre 2F
(ou ailleurs), le jeu freeze.

User suggestion : "dans notre ancien code on avait mis un skip qui
affiche l'heure du PC au lieu de la mettre manuellement (ce serait
toujours 1:1 dans le concept : l'heure du PC simule l'heure du jeu, la
pile et l'internal clock)".

**Solution** :
1. Find `Special_ViewWallClock` and `StartWallClock` in
   `src/engine/specials-registry.ts` ou `src/engine/script-runner.ts`
2. Implement comme :
   ```ts
   registerSpecial('Special_ViewWallClock', () => {
     const d = new Date();
     const h = d.getHours();
     const m = d.getMinutes().toString().padStart(2, '0');
     // Show via msgbox (= bypass UI heavyweight)
     ShowFieldMessage(`Il est ${h}h${m}.`);
     return 0;
   });
   registerSpecial('StartWallClock', () => {
     // 1:1 décomp StartWallClock ouvrirait CB2_WallClock UI pour set RTC.
     // On skip car notre RTC = PC time (= Date.now()).
     // Set FLAG_SET_WALL_CLOCK pour que le script continue.
     setFlag('FLAG_SET_WALL_CLOCK');
     return 0;
   });
   ```
3. Cleanup any callsite that opens the WallClock UI scene/task

**Note** : An older commit had this skip — chercher avec
`git log --oneline --all | xargs -I {} git show {} -- '*wallclock*' 2>/dev/null | grep -B3 'PC time'`
ou similaire pour retrouver le commit perdu.

**Fichiers à investiguer** :
- `src/engine/specials-registry.ts`
- `src/engine/script-runner.ts` (= legacy SPECIALS table)
- `src/engine/decomp-data/auto/src-all/wallclock-all-auto.ts` (= auto-extracted UI)

## Bug 5 — (Mentioned nuit, pas prioritaire) Battle polish

- Real HP bar tiles instead of text
- Shake on damage
- EXP gain + level-up after winning (= j'allais commencer ça avant la
  pause user)
- Battle BG transition fade

**Préparé pour ça** :
- `experience-tables.json` already in `public/decomp/em/`
- `species-info.json` has `expYield` field per species
- Formule Gen 3 : `expGain = (baseExp × level) / 7` (= défait Pokemon's)

## 🛠️ Bug 6 — Update extractor/transpiler avec nos fixes manuels

User explicit : "Ajoute aussi de mettre à jour le transpiler avec nos
fix manuel".

**Patches manuels actuellement en place dans des auto-files** (= s'effacent
si on re-run l'extracteur sans le mettre à jour) :

### 6a. `src/engine/decomp-data/auto/src/sprite-system.ts`

Ajout manuel de `sStartCopyrightBannerAnimTable` dans `SPRITE_ANIM_TABLES`
(= line ~485). L'extracteur ne parse pas le designated initializer C :

```c
// src/title_screen.c:271-284
static const union AnimCmd *const sStartCopyrightBannerAnimTable[
  NUM_PRESS_START_FRAMES + NUM_COPYRIGHT_FRAMES] =
{
    sAnim_PressStart_0,
    sAnim_PressStart_1,
    sAnim_PressStart_2,
    sAnim_PressStart_3,
    sAnim_PressStart_4,
    [NUM_PRESS_START_FRAMES] =        // ← designated initializer skip
    sAnim_Copyright_0,
    sAnim_Copyright_1,
    sAnim_Copyright_2,
    sAnim_Copyright_3,
    sAnim_Copyright_4,
};
```

**Fix transpiler** : updater `scripts/extract-sprite-system.mjs` (ou wherever
l'extracteur sprite-system lit le C) pour gérer le pattern
`[CONSTANT_NAME] = value`. Le parser doit :
1. Détecter `\[\s*([A-Z_][A-Z0-9_]*)\s*\]\s*=` dans les array initializers
2. Résoudre le `CONSTANT_NAME` via `_define_constants` map
3. Skip aux entries entre les indices implicites jusqu'à l'index résolu
4. Continue l'array

Pre-search : run `audit-missing-anim-tables.mjs` après extracteur update
pour confirm que toutes les anim tables sont définies.

### 6b. Garder le hotfix `_resolveTileNum()` du runtime

Le helper `_resolveTileNum()` dans `decomp-runtime.ts:32-42` résout les
string constants (= e.g. `"VERSION_BANNER_RIGHT_TILEOFFSET"`) qui restent
dans les SPRITE_ANIMS data. C'est un fallback runtime — peut rester
indéfiniment, mais idéalement l'extracteur résoudrait ces constantes
DIRECTEMENT et stockerait des numbers.

Look at the SPRITE_ANIMS extractor : trouver les `tileNum: "STRING"` et
résoudre via `_define_constants`. Aujourd'hui une seule string :
`VERSION_BANNER_RIGHT_TILEOFFSET = 64`.

### 6c. (Possible) Subpriority dans CreateSprite

Le compositor sort utilise maintenant `subpriority` (= commit `c7d63fca`).
L'extracteur pourrait s'assurer que les CreateSprite calls dans les
auto-bodies passent bien le 4ème arg (= subpriority) — pas un fallback
silencieux à `0xFF`. Currently OK car le décomp source a déjà ces args
explicites, mais à double-check si on régénère.

### 6d. Audit script à ajouter

Créer `scripts/audit-extractor-output.mjs` qui :
1. Run après chaque `extract:*` script
2. Run all our `audit-*.mjs` (= dupes, missing, etc.)
3. Fail loud avec exit 1 si regression
4. Output résumé clair : "X regressions, Y new entries, Z deletions"

## ⚠️ Workflow pour fix ces bugs

1. **Lire ce fichier** + `session-2026-05-09-status.md` AVANT toute action
2. **Lire decomp source** AVANT d'écrire impl (= 1:1 strict)
3. **AVANT bulk-add** : `npm run audit:dupes` pour 0 dupes
4. **Test live après chaque fix** via `?nointro=1` ou `?truck=1`
5. **Commit séparément** chaque bug fix avec message explicite
6. **AVANT re-extract** : check ce file pour les manual patches à conserver

## 📅 Que faire ensuite (= roadmap post-bugs)

Après ces 5 bugs, retour au plan original :
1. **EXP gain + level-up** post-battle (= ce que je commençais)
2. **Real HP bar tiles** in battle (= visual polish)
3. **PlayCry on starter confirm** in ChooseStarter (= TODO from earlier)
4. **More opcode coverage** if needed (= 131 missing globally still)
