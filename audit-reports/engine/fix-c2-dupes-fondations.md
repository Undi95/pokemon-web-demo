# Fix C.2 — lot « dupes fondations » (PHASE C.1)

Agent Opus, 2026-07-16. Source : `docs/CHANTIER-MOTEUR-100.md` §PHASE C.1.
Validation : `npx tsc --noEmit` = 0 après chaque sous-lot (baseline : 0-2 erreurs
pré-existantes dans `pokenav.ts`, hors scope — imports vers les fichiers
`pokenav_conditions_*` en cours d'édition par d'autres agents ; disparues en fin
de run quand ces agents ont ajouté leurs exports). **PAS de serveur/jeu, PAS de git.**

---

## Sous-lot 1 — `src/dma3_manager.ts` miroir + relocation `IsDma3ManagerBusyWithBgCopy` — ✅ FAIT

**Fichiers touchés :** `src/dma3_manager.ts` (NOUVEAU), `src/battle_bg.ts`.

- Créé `src/dma3_manager.ts` : transcription 1:1 de `dma3_manager.c` — struct
  `Dma3Request`, statics (`sDma3Requests[128]`, `sDma3ManagerLocked`,
  `sDma3RequestCursor`), constantes de mode, `ClearDma3Requests`,
  `ProcessDma3Requests`, `RequestDma3Copy`, `RequestDma3Fill`,
  `CheckForSpaceForDma3Request` + les primitives `Dma3CopyLarge16_/32_` /
  `Dma3FillLarge16_/32_` (include/dma3.h) et le read VCOUNT.
- **ADAPTATION MOTEUR documentée en tête** : le port fait ses copies de façon
  synchrone → la queue `sDma3Requests` est STRUCTURELLEMENT VIDE (personne
  n'empile sur ce module ; les `RequestDma3Copy` du repo sont des `__wireTodo`
  d'autres flux, non câblés ici). Ces fonctions sont donc INERTES (1:1 pour la
  complétude, CLAUDE.md Règle 1 « Inerte-mais-1:1 »). Confirmé par grep : aucun
  appel réel de `ProcessDma3Requests`/`RequestDma3Copy` de CE module dans src/ ni harness/.
  Adaptations : `u8* src/dest → Uint8Array | null` ; VCOUNT non émulé (decomp-runtime.ts:945)
  → `readVCount()` renvoie 0 (garde vblank jamais franchie ; boucle jamais entrée).
- **Compteur migré** : `_bgCopiesInFlight` (battle_bg.ts:660) → `sBgCopiesInFlight`
  dans dma3_manager.ts, exposé par `markBgCopyStarted()` / `markBgCopyDone()`.
  `IsDma3ManagerBusyWithBgCopy()` (= miroir bg.c:440, adaptation compteur au lieu
  du `sDmaBusyBitfield` matériel) relogée ici, documentée avec le précédent battle_bg.
- **`battle_bg.ts`** : consomme la nouvelle API (`loadBattleTextboxAndBackground1to1`
  appelle `markBgCopyStarted()`/`markBgCopyDone()` dans son try/finally) et
  **RÉ-EXPORTE** `IsDma3ManagerBusyWithBgCopy` en une ligne :
  `export { IsDma3ManagerBusyWithBgCopy } from './dma3_manager';`. Les ~15 importeurs
  existants (pokenav_*, match_call, battle_main, battle_script_commands, PSS,
  pokenav_ribbons_*, pokenav_region_map…) continuent de compiler à l'identique
  (import inchangé depuis './battle_bg'). Les wrappers locaux
  `_IsDma3ManagerBusyWithBgCopy` (battle_controller_player:450, battle_main:5985)
  NON touchés (comme demandé). Redirection finale des imports = lot ultérieur.

**tsc = 0** (hors erreurs pré-existantes pokenav.ts).

---

## Sous-lot 2 — `GetBgAttribute` stub local PSS — ✅ FAIT

**Fichier touché :** `src/pokemon_storage_system.ts`.

- Supprimé le stub local `function GetBgAttribute(_bg,_attr){return 0}` (:116) et
  la constante locale `const BG_ATTR_BASETILE = 8` (:113).
- Importé `GetBgAttribute` + `BG_ATTR_BASETILE` depuis `./window` (ajout au bloc
  d'import window existant, à côté de `SetBgAttribute, BG_ATTR_PALETTEMODE`).

**PREUVE de no-op de comportement (demandée) :**
- Les 2 call-sites (`:1942`, `:1955`, `UpdateItemInfoWindowSlideIn/SlideOut`)
  appellent **toujours `GetBgAttribute(0, BG_ATTR_BASETILE)` — BG 0**.
- `sBgTemplates` du PSS (`pokemon_storage_system.ts:698`, 1:1 décomp
  pokemon_storage_system.c:1012) : **BG 0 a `baseTile = 0`**. (BG 1 = 0x100, BG 2/3 = 0,
  mais jamais interrogés ici.)
- La vraie `GetBgAttribute` (window.ts:810, bg.c:504-545) rend `cfg.baseTile ?? 0`
  pour `BG_ATTR_BASETILE` → **0 pour BG 0** = identique à ce que le stub rendait. **No-op.**
- ⚠️ **Divergence de constante trouvée** : l'ancien stub déclarait
  `BG_ATTR_BASETILE = 8` (commentaire mal étiqueté « include/gba/types.h »). La
  VRAIE valeur décomp (include/bg.h:15, 10ᵉ valeur de l'enum à base 1) **= 10**, et
  window.ts la définit correctement à 10. Sans effet ici car le stub ignorait son
  argument ; le call-site importe désormais la constante correcte (10) ET la vraie
  fonction, cohérents entre eux. Preuve documentée en commentaire au site de suppression.

**tsc = 0.**

---

## Sous-lot 3 — `CreateInvisibleSpriteWithCallback` local `battle_main` — ✅ FAIT

**Fichiers touchés :** `src/sprite.ts`, `src/battle_main.ts`.

- **Correction du rapport source** : la fonction décomp NE vit PAS dans sprite.c mais
  dans **util.c:119-125**. Le port l'avait explicitement DIFFÉRÉE vers la couche
  sprite (util.ts:6 « CreateInvisibleSpriteWithCallback → couche sprite » +
  sprite.ts:38 la liste comme dette). Home retenu = **sprite.ts** (cohérent avec la
  décision archi existante du port ET l'instruction du sous-lot). Elle n'existait
  pas encore dans sprite.ts (seul battle_main avait une copie locale
  `_CreateInvisibleSpriteWithCallback`).
- Transcrit `CreateInvisibleSpriteWithCallback` 1:1 dans `sprite.ts` (export), en
  consolidant la copie locale battle_main **à l'identique** (mêmes valeurs :
  x=248/y=168 = DISPLAY_WIDTH+8/HEIGHT+8, subpriority 14, invisible+callback).
  **ADAPTATION substrat documentée** : le décomp fait
  `CreateSprite(&sInvisibleSpriteTemplate, …)` (template dummy `tileTag=0`) ; comme
  le sprite est immédiatement invisible (aucune tuile affichée), on alloue le slot
  via `CreateSpriteAtOam` (tileId/paletteBank 0) — ce qui **évite le warning « sheet
  tag 0 non chargée »** que déclencherait le dispatcher `CreateSprite` de sprite.ts.
  Callback typé `(sprite: any)` = pont de type (les callbacks combat utilisent le
  type structurel local `BattleSprite` ≠ `DecompSprite`) ; comportement 1:1.
- **`battle_main.ts`** (modification minimale) : ajout de
  `CreateInvisibleSpriteWithCallback` à l'import `./sprite` existant, suppression de
  la copie locale `_CreateInvisibleSpriteWithCallback` (remplacée par un commentaire
  de provenance), et le seul call-site (`DoBounceEffect`, :3866) passe de
  `_CreateInvisibleSpriteWithCallback(...)` à `CreateInvisibleSpriteWithCallback(...)`.

**tsc = 0** (arbre entièrement vert).

---

## Sous-lot 4 — `AddTextPrinterParameterized5` stub PSS (CONDITIONNEL) — ⛔ BLOQUÉ (attendu)

- Grep src/ + harness/ : `AddTextPrinterParameterized5` n'existe **exportée NULLE
  PART**. Seules occurrences : le stub local PSS (`:127-128`), son call-site
  (`:1926`, `PrintItemDescription`), et un commentaire menu.ts:849 « text.c, pas
  encore porté ».
- La vraie vit dans **text.c** (`AddTextPrinterParameterized5`, menu.md:132 la situe
  menu.c:1959 côté déclaration ; corps text.c). **`src/text.ts` est INTERDIT** (agent
  en vol).
- Conformément à la consigne conditionnelle : **NE RIEN FAIRE**. Stub local PSS
  conservé intact. **À transcrire dans `text.ts` au prochain lot text**, puis
  rediriger + supprimer le stub PSS (rustine listée menu.md « RUSTINES À PURGER » §1).

---

## Sous-lot 5 — pipeline tile-data ×3 (CONDITIONNEL) — ⛔ DIFFÉRÉ (entanglement interdit + rendu non vérifiable)

Sous-lots 1-3 faits, 4 résolu → j'ai instruit le sous-lot 5. **Conclusion : ne pas
consolider sous les contraintes actuelles.** Justification per-site (l'audit disait
« 3 copies » mais l'investigation révèle une réalité bien plus entrelacée) :

**Sites réels de la famille pipeline tile-data (menu.c:1752-1849) :**
| Impl | Fichier | Comportement | Statut |
|---|---|---|---|
| `DecompressAndCopyTileDataToVram` | `mail.ts:1060` (local) | inline `vram.set(src, charBase*0x4000)` — **ignore mode/offset/baseTile** | divergent |
| `DecompressAndCopyTileDataToVram` | `pokenav_main_menu.ts:41` (**export partagé**) | inline `vram.set(src, charBase*0x4000 + baseTile*32)` mode 0 / `CopyToBgTilemapBuffer` mode 1 — **ignore offset** ; fix baseTile 2026-07-14 | divergent |
| `DecompressAndCopyTileDataToVram` | `region_map.ts:2163` (local) | copie locale | **INTERDIT** |
| `DecompressAndLoadBgGfxUsingHeap` | `easy_chat.ts:805` (local) | `LoadBgTiles(bg, data, data.length, offset)` — **déjà canonique** (route via LoadBgTiles) | ~ok |

**Raisons du différé :**
1. **Le site pokenav = export PARTAGÉ, pas une copie isolée.**
   `pokenav_main_menu.ts:DecompressAndCopyTileDataToVram` est importé par **6+ modules**,
   dont plusieurs **INTERDITS / agents en vol** : `pokenav_ribbons_list`,
   `pokenav_ribbons_summary`, `pokenav_conditions_gfx`,
   `pokenav_conditions_search_results`, `pokenav_region_map` (+ pokenav_menu_handler_gfx,
   pokenav_match_call_gfx non-interdits). Le consolider (déplacer vers menu.ts et
   rediriger, ou le faire déléguer) **change le primitif d'upload tuiles partagé de
   tous ces écrans en cours d'édition** → collision directe avec les agents en vol.
   → **SKIP** (règle interdit : « si l'un des fichiers touchés est interdit »).
2. **`region_map.ts` est explicitement INTERDIT.** → **SKIP**.
3. **`mail.ts` (+ `easy_chat.ts`) : consolidation = changement de RENDU non vérifiable.**
   La copie mail IGNORE `mode`/`offset`/`baseTile` (écrit brut à `charBase*0x4000`) ;
   router vers l'impl canonique (menu.c : mode 0 → `LoadBgTiles`, mode 1 →
   `LoadBgTilemap`, qui appliquent baseTile+offset 1:1) **modifie le chemin d'upload
   tuiles d'un écran LIVE (mail)**. Même si l'inspection SUGGÈRE l'équivalence pour ses
   appels (`DecompressAndCopyTileDataToVram(1, tiles, 0, 0, 0)`, mail.ts:643, si BG1
   baseTile=0 + offset 0 + mode 0), **CLAUDE.md Règle 5 interdit de commiter un rendu
   non testé EN JEU**, et **la mission interdit serveur/navigateur**. easy_chat est déjà
   quasi-canonique (délègue à LoadBgTiles) → gain marginal pour un risque rendu identique.

**Reste à faire (prochain chantier, AVEC accès jeu) :** créer le foyer canonique dans
`menu.ts` (`ResetTempTileDataBuffers` no-op, `FreeTempTileDataBuffersIfPossible`
→false, `DecompressAndCopyTileDataToVram`/`DecompressAndLoadBgGfxUsingHeap` →
`copy_decompressed_tile_data_to_vram` = LoadBgTiles/LoadBgTilemap 1:1 avec `size||src.length`),
puis rediriger mail + easy_chat (non-interdits) et **valider par screenshot** (écran
mail, easy chat) ; le bloc pokenav/region_map attendra la fin des agents en vol.
Rustine associée : menu.md « RUSTINES À PURGER » §3.

---

## Observations annexes (hors scope, notées au passage)
- `easy_chat.ts:812` possède SON PROPRE `IsDma3ManagerBusyWithBgCopy(){ return false }`
  local (stub « copie synchrone → jamais busy »), distinct du compteur bg-copy du
  sous-lot 1. C'est une dédup SÉPARÉE (pas le compteur battle_bg) — à traiter avec la
  redirection générale des imports `IsDma3ManagerBusyWithBgCopy` (lot ultérieur).
- `pokenav_main_menu.ts:56` (pokenav_match_call_gfx) et `:82` gardent des
  `__wireTodo('RequestDma3Copy')` / `CheckForSpaceForDma3Request` locaux pour des flux
  d'assets pokenav distincts — NON touchés (redirection = lot ultérieur, et fichiers
  proches des agents en vol).
