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
  - ✅ **E2.2a** (`d0e5fd39`) : macros `PLTT_ID`/`BG_PLTT_ID`/`OBJ_PLTT_ID`/offsets → `palette.ts` (home 1:1
    palette.h, qui a déjà PALETTES_BG/OBJECTS/ALL). **Casse à la racine** l'arc valeur `game/sprite → decomp-runtime`
    (game/sprite importe OBJ_PLTT_ID depuis palette.ts) → plus de cycle possible au fold. decomp-runtime re-exporte
    (importeurs historiques inchangés). tsc=0, A/B OW palettes OK.
  - ✅ **E2.2b** (`6c16bac4`) : fold `sprite-animation.ts` (BeginAnim/ContinueAnim/AnimCmd_*/AnimateSprite/
    StartSpriteAnim/SeekSpriteAnim/Request+ProcessSpriteCopyRequests/ANIMCMD_*) DANS game/sprite.ts, 13 importeurs
    recâblés, fichier supprimé. Zéro cycle (grâce à E2.2a). tsc=0, A/B OW marche-anim + combat 59.3fps.
    ⚠️ payé : `*/` dans le commentaire d'en-tête (AnimCmd_*/X) a cassé esbuild — [[pitfall-comment-star-slash-tsc]].
  - ⏳ **E2.3** : extraire les MÉTHODES `DecompRuntime` → free functions dans game/sprite.ts, pattern délégation
    transitionnel (comme façade E1, forme `fn(rt, …)` comme AnimateSprite). Garder `rt.X` comme délégué pendant
    la migration des call-sites, retirer ensuite.
    - ✅ **E2.3a** (`c874a5e9`) : `DestroySprite` (sprite.c:618) → `DestroySprite(rt, spriteId)` dans game/sprite.ts ;
      méthode `rt.DestroySprite` = délégué (102 call-sites + bridge intacts) ; 2 champs M3 rendus accessibles
      (`spriteAnimStates`, `_matrixUsed`). A/B combat K.O. sprite détruit sans fantôme, 57.8fps.
    - ✅ **E2.3b** (`65a8e7dd`) : `ResetSpriteData` (sprite.c:294, 13 call-sites) → `ResetSpriteData(rt)` dans
      game/sprite.ts ; méthode = délégué. BONUS réalisé : arrays `sSpriteTile*` accédés EN DIRECT (statics du
      même module, 1:1) au lieu du hack `globalThis.__sprite` (identité vérifiée) + `setReservedSpriteTileCount(0)`.
      Champs `nextOamSlot`/`nextSpriteId` → accessibles. A/B : boot OW + OW→combat (ResetSpriteData ×2), combat
      rendu propre sans sprite OW résiduel, 59.4fps.
    - ✅🐛 **E2.3c — BUG LATENT CORRIGÉ** (`7eabf32d`) : DOUBLE allocateur OAM matrix à état séparé (Set `_matrixUsed`
      VS bitmap `gOamMatrixAllocBitmap`) → consolidé sur l'état UNIQUE = le bitmap 1:1 décomp. Free fns `Alloc/
      FreeOamMatrix` (game/sprite.ts) = allocateur canonique, méthode runtime y délègue, `_matrixUsed` SUPPRIMÉ,
      DestroySprite/ResetSpriteData/reset() basculés sur le bitmap. Scan dès i=1 (slot 0 réservé M3) + sentinel 0xFF
      (1:1, aucun call-site ne teste le retour). BONUS 1:1 : `FreeOamMatrix` rajoute le reset identité au release
      (sprite.c:1460) qui manquait. A/B affine : send-out (chemin méthode) + lunge battle_anim_mons (chemin free fn)
      rendus corrects, `slot0free=true`, 57.3fps.
    - ✅ **E2.3d** (`eb182de2`) : `CreateSpriteAtOam` (cœur de création, 160 l, 112 call-sites — crée TOUS les
      sprites) extrait du harness → `CreateSpriteAtOam(rt, cfg)` dans game/sprite.ts ; méthode = délégué (signature
      via `Parameters<typeof …>`). Relocation pure (corps inchangé), `CalcCenterToCornerVec` local vérifié identique,
      `_oamExhaustedWarned`→accessible. A/B large OW+combat+UI, 58.5fps. ⚠️ NB : reste une primitive M3 (cfg, pas
      `struct SpriteTemplate`). **Le vrai 1:1 `CreateSprite(template)→CreateSpriteAt`** = chantier SÉPARÉ : notre
      `CreateSprite` (decomp-bridge) est un dispatcher 3-voies (images inline / tileTag / nom) → l'unifier exige de
      fusionner les 3 modèles de chargement gfx. Gros, pas un lot mécanique.
    - ✅ **E2.3e** (`f38c691d`) : `AnimateSprites`/`BuildOamBuffer` (sprite.c:308/325) relocalisés decomp-globals →
      game/sprite.ts (decomp-globals re-exporte). Wrappers FINS (délèguent aux méthodes per-frame runtime) → relocation
      byte-identique. Dup locale M3 dans `ui/mail.ts` (animateAllSprites/buildOamBuffer) NON touchée.
    - 🏁 **CONSTAT (fin de la série « extract method »)** : les extractions SUBSTANTIELLES du cœur sprite sont FAITES
      (DestroySprite, ResetSpriteData, allocateur matrix + bug, CreateSpriteAtOam). `game/sprite.ts` est le home
      consolidé du système sprite. Ce qui reste est d'une AUTRE nature, à faire en chantiers DÉDIÉS :
      - ✅ **(A) hot-path FAIT** : `runSpriteCallbacks`+`syncSpritesToOam` (A1 `bd558ba6`) + `tickSpriteAnims`
        +`_resolveTileNum` (A2 `9c5bb11d`) relocalisés vers game/sprite.ts (relocalisation pure, méthodes délèguent ;
        cycle ESM géré : sprite-system/decomp-constants = leaves, edge runtime one-way decomp-runtime→game/sprite).
        A/B hot-path OW (`.anims` cyclent) + combat (legacy spriteAnimStates+_resolveTileNum) OK. **Le cœur sprite.c
        per-frame est 100% dans game/sprite.ts.**
      - **(B) `CreateSprite` 1:1** : unifier le dispatcher 3-voies en `CreateSprite(template)→CreateSpriteAt`. GROS.
        - **CARTOGRAPHIE (investiguée 2026-06-22)** : les 3 voies du bridge `CreateSprite` convergent toutes vers la
          primitive `CreateSpriteAtOam(rt, cfg)` mais résolvent les champs autrement :
          (1) **inline** `rt.CreateSpriteInline` (template.images → AllocSpriteTiles + _writeToObjVram) = voie décomp
          `tileTag==TAG_NONE` ; (2) **tileTag** : bloc manuel (GetSpriteTileStartByTag + patch champs) = voie décomp
          `tileTag!=TAG_NONE` ; (3) **par-nom** `rt.CreateSpriteFromTemplate(name)` : résout `SPRITE_TEMPLATES[name]`
          → catalogues string `OAM_DATAS`/`SPRITE_ANIM_TABLES`/`SPRITE_ANIMS` (= format d'EXTRACTION M3, ABSENT du décomp ;
          c'est LA voie overworld) + pose l'anim legacy `spriteAnimStates`.
        - **OBSTACLE = ampleur** : `CreateSpriteAtOam` a **~110 appels DIRECTS** (30 fichiers UI/combat/field) — primitive
          M3 que le décomp n'a pas (lui : `CreateSprite(template)→CreateSpriteAt` direct sur `gSprites[index]`). `ResetSprite`
          pas porté. Le 1:1 INTÉGRAL (convertir les 110 sites en `struct SpriteTemplate`) = énorme, hors-budget.
        - **PLAN PRAGMATIQUE (incrémental, à valider user)** : garder `CreateSpriteAtOam` = primitive interne (frontière
          harness documentée, comme composeFrame). B1 : porter `CreateSpriteAt(index, template, x,y,subpri)` +
          `CreateSprite`/`CreateSpriteAtEnd`/`CreateInvisibleSprite` 1:1 dans game/sprite.ts (2 voies gfx décomp), routant
          via la primitive ; bridge voies inline+tileTag délèguent. B2 : résolveur `name→SpriteTemplate` (lit les catalogues)
          → voie 3 normalisée puis CreateSpriteAt unique. B3 : retrait `CreateSpriteInline`/`CreateSpriteFromTemplate` du
          harness. A/B par voie (combat send-out = inline+tileTag ; OW = par-nom). NE PAS big-banger (hottest path).
        - ✅ **B1 FAIT** (`b3f87d61`) : `CreateSprite(rt, template, x,y,subpri)` + interface `SpriteTemplate` portés dans
          game/sprite.ts (2 voies gfx décomp : `tileTag==TAG_NONE` inline / sheet par tag, branche sprite.c:562). Bridge
          voies 1+2 + `DecompRuntime.CreateSpriteInline` y délèguent (impl UNIQUE ; corps relocalisé mot-pour-mot, fixes
          F77/objMode/sheetTileStart conservés). `CreateSpriteAtEnd`/`CreateInvisibleSprite` via gfx voies NON portés
          (aucun appelant = pas de code mort ; `CreateInvisibleSprite` existe déjà local dans field_effect_helpers.ts).
          `_writeToObjVram` passé public. A/B combat (inline pic mon + tileTag ball) + sonde placeholder `images:[]` +
          OW (par-nom inchangée). tsc=0.
        - ⚠️ **B2/B3 — MUR découvert (2026-06-22)** : la voie 3 (par-nom) ne se réduit PAS à un résolveur mécanique. Elle
          porte (a) le système d'anim LEGACY `spriteAnimStates` (Map ≠ `sprite.anims` inline) que tickSpriteAnims fait
          vivre pour l'OW, (b) des `tileTag` **STRING** (game `CreateSprite` exige `typeof tileTag === 'number'`), (c) la
          résolution callback string→fn (spriteCallbacks/globalThis). Router voie 3 via game `CreateSprite` ⇒ desserrer son
          contrat (tileTag string) + garder un post-step OW anim+callback = DEMI-MESURE (gain = dédup field-patch ;
          risque hot-path réel : tout NPC/intro/title). Le 1:1 INTÉGRAL = converger l'anim OW sur `sprite.anims` (gros
          chantier COMPORTEMENTAL, big-bang INTERDIT par le contrat). B3 = migrer ~45 sites `CreateSpriteFromTemplate`
          (surtout auto-gen intro/title) + ~31 `CreateSpriteInline?.()` (piège optional-call). → **DÉCISION USER requise**
          sur la direction (demi-mesure dédup vs convergence anim OW vs s'arrêter à B1).
        - ✅✅✅ **CONVERGENCE ANIM OW — COMPLÈTE & SHIM SUPPRIMÉ (`ac3c855c`)** (décision user 2026-06-22 : « le but
          c'est le 1:1 miroir vrai, pas juste ça marche »). TOUS les consommateurs `spriteAnimStates` (state-machine
          legacy M3, ABSENTE du décomp) migrés vers `sprite.anims` (table AnimCmd inline = le système du décomp). Le shim
          ENTIER est retiré (interface SpriteAnimState, Map, spriteAnimStatesRegister, branche legacy StartSpriteAnim,
          boucle legacy tickSpriteAnims, delete/clear) → −131 l. **Désormais TOUT sprite anime via `sprite.anims` +
          AnimateSprite (chemin inline 1:1 décomp).** Débloque B2/B3 (voie 3 → game `CreateSprite`).
          - **Outil** (`29832cae`) : `resolveAnimTableToAnimCmds` (catalogue M3 → AnimCmd[][]) + `setSpriteAnims`
            (attache anims + usingSheet/sheetTileStart, remplace `spriteAnimStatesRegister`). Sémantique END/JUMP/multi-frame
            vérifiée identique au legacy frame-par-frame.
          - **CONSTAT clé** : le **live overworld est DÉJÀ convergé** (`event_object_movement.ts:7169` pose
            `sprite.anims = graphicsInfo.anims` ; sonde runtime en OW = `spriteAnimStates.size === 0`). Le chemin inline
            JUMP/walk est donc PROUVÉ en prod. Les consommateurs legacy restants sont PÉRIPHÉRIQUES.
          - **Familles `spriteAnimStates` (modèle sheet `tileBase + tileNum`)** :
            - ✅ **F-sac** (`29832cae`) : `item_menu_icons.AddBagVisualSprite` → setSpriteAnims. A/B menu→SAC : sprite rendu,
              switch poche OBJETS→POKé BALLS (FSM bounce + StartSpriteAnim inline), sonde `oam.tileId=192` = exact offset.
            - ✅ **F-CreateSpriteFromTemplate** (`6de41598`) : intro/title/starter/credits. A/B boot : Flygon d'intro animé +
              version banner "EMERAUDE" (tileNum string) + Birch ; flux complet propre.
            - ✅ **F-CreateObjectGraphicsSprite** (`3b209b62`) : naming/starter/intro-credits (walk JUMP loop). A/B naming
              screen : Brendan rendu+animé, sonde id=14 anims=4, animNum=0, animCmdIndex=2 (cycle marche ACTIF via AnimCmd_jump).
            - ✅ **F-swap-line** (`5cb7ce07`) : sonde sac — 8 sprites convergés, i=0 off=0 (RightArrow), i=1..7 off=4 (Line).
          - ✅ **F-mon-front** (`8edad4e9`) : `battle_main.ts`. ⚠️ était suspecté images-model, mais quand `twoFrames`
            (battle_controller_opponent) les 2 frames sont chargées CONTIGUËS à tileBase (`subarray(0, FRAME0*2)`) → modèle
            sheet valide → `oam.tileId = tileBase + f*64` identique au legacy. A/B startWild : front-sprite rendu + anim
            2-frames ACTIVE (animCmdIndex cycle). Déviation pré-existante (usingSheet sur sprite CreateSpriteInline ; le vrai
            1:1 décomp = frame-images dynamiques `RequestSpriteFrameImageCopy`) = rework gfx NOTÉ pour plus tard, hors-shim.
        - ✅ **B3-inline (`c4c6471a`) : méthode `CreateSpriteInline` RETIRÉE.** Pur pass-through (M3) → les ~31 call-sites
          directs `rt.CreateSpriteInline?.()` (battle anims `images:[]`, clone mon, pokeball healthbox) appellent la free-fn
          bridge `CreateSprite()` (voie inline). Garde `images.length>0` du bridge retiré (Array.isArray suffit). Piège
          optional-call payé (garde pokeball `!rt?.CreateSpriteInline` → `!rt`). Script `migrate-createspriteinline.cjs`
          (alias bridge par fichier). A/B : méthode `undefined`, send-out + OW rendus, tsc=0.
        - ⏳ **B3-template (CreateSpriteFromTemplate)** : NON un pass-through (corps réel = résolveur nom→catalogue
          `SPRITE_TEMPLATES`/`OAM_DATAS` + anim + callback + affine). **CONSTAT** : c'est le résolveur nom→template (=
          l'équivalent runtime du pointeur de template C ; le décomp passe `&sSpriteTemplate_X`, nous passons le NOM). =
          **frontière harness LÉGITIME, comme `CreateSpriteAtOam`** (M3 nécessaire, pas un shim à supprimer). Les ~45
          call-sites directs `rt.CreateSpriteFromTemplate(name)` sont surtout AUTO-GÉNÉRÉS (intro/title `-callbacks-auto.ts`)
          → les router via `CreateSprite(name)` exigerait une MAJ du GÉNÉRATEUR (+ ~12 sites manuels decomp-globals/starter).
          Valeur modeste (le bridge `CreateSprite` reste l'entrée 1:1 ; la voie 3 = résolution de nom). DÉCISION : garder
          CreateSpriteFromTemplate = frontière documentée ; routage des call-sites = optionnel (chantier générateur séparé).
      - **(C) cleanup délégués** : migrer les call-sites `rt.X(...)` → free fns + retirer les méthodes-déléguées du harness.
        - ✅ **ResetSpriteData** (`58c37787`) : méthode RETIRÉE. Bridge `ResetSpriteData()` route vers l'impl ; 12 sites
          forme-méthode migrés. + fix devtool `startWild` résout le nom d'espèce (`383e7f8b`, Pikachu Lv1 au lieu de ????).
        - ✅ **DestroySprite** (`ace8d2c1` combat + `8c37eedf` field/UI/intro + `0e77524f` cluster battle_anim) : méthode
          RETIRÉE. ~76 sites migrés (dont ~51 en forme optional-call `rt.DestroySprite?.(id)` — piège silencieux, cf.
          [[pitfall-remove-delegate-method-optional-call]]). Receveurs lâches → `getRuntime()`, zéro cast.
        - ⏳ RESTE : `AllocOamMatrix`/`FreeOamMatrix` (petit) + `CreateSpriteAtOam` (112 sites, REPORTÉ à B car chevauche
          l'unification du dispatcher). Mécanique mais large (receveurs variés, optional-chaining).
      - ✅ **(D) dédup mail.ts FAIT** (`cdd32bd7` : animateAllSprites/buildOamBuffer locaux → globales).

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
