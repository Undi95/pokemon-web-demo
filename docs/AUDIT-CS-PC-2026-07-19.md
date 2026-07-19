# AUDIT CS / field-moves + PC de rangement — 2026-07-19

Audit **PUR** (aucune modification de code, aucun commit). Diagnostic dynamique en jeu
(onglet isolé `?debug`, sondes console) + lecture décomp `D:/Projet 1/decomps/pokeemeraude`.
Objectif : cause racine EXACTE de chaque bug pour que le fix devienne mécanique.

Cartes de test devtools v2 (onglet Jeu) : `dev.debugMap(1)` grotte sombre CS, `dev.debugMap(2)`
Centre/PC, `dev.debugMap(3)` fond marin. Équipe `?debug` : ARCKO, LEVEINARD, LEVIATOR,
LINEON (Cut+Rock Smash), HELEDELLE.

> **TL;DR verdicts** :
> - **Bug 1 (Flash)** : NE REPRODUIT PAS sur le code actuel (Cut + Éclate-Roc testés en jeu → pénombre INTACTE). Correctif re-arm déjà en place (`2b85acb5d`). Caveats plus bas.
> - **Bug 2 (Force freeze)** : **CAUSE RACINE TROUVÉE** — rocher debug a `script:'0x0'` → lock sans release. Fix S.
> - **Bug 3 (Plongée)** : data 100 % correcte, sprite OK au warp direct + à l'émersion. Corruption = spécifique à la TRANSITION (preload/palette). Pistes fermes.
> - **Bug 4 (Surf)** : **musique = bug 1-ligne CONFIRMÉ** (`Overworld_PlaySpecialMapMusic` au lieu de `Overworld_ChangeMusicToDefault`). Bobble : s'arrête correctement dans mon test.
> - **Bug 5 (Coupe herbe)** : **modèle utilisateur INVERSÉ** — Coupe party-menu = NO-OP (vérifié en jeu), Coupe direct-A sur ARBRE = MARCHE, Coupe sur HERBE = PAS PORTÉE du tout.
> - **Bug 6 (PC démoli)** : **FAUSSE PISTE** — le PC utilise `LoadSpriteSheet` (PAS `LoadCompressedSpriteSheet`), rendu 100 % correct en jeu. `ddeb7ef86` n'affecte pas le PC.

---

## Bug 1 — Pénombre grotte : une CS quelconque enlèverait la noirceur

**Symptôme rapporté** : retour dans la grotte → utiliser N'IMPORTE QUELLE CS enlève la pénombre.

**Statut repro : NE REPRODUIT PAS (code actuel).**
Testé en jeu sur `MAP_DEBUG_1` (grotte, `GetFlashLevel()===7`, `WINOUT=0x1`, WIN0 scanline actif) :
- **Éclate-Roc** (direct-A sur `OBJ_EVENT_GFX_BREAKABLE_ROCK` @8,6) → animation complète, rocher cassé → **pénombre INTACTE** (`WINOUT=0x1`, cercle visible, `GetFlashLevel()===7`).
- **Coupe** (direct-A sur `OBJ_EVENT_GFX_CUTTABLE_TREE` @8,3) → animation complète, arbre coupé → **pénombre INTACTE**.

**Mécanisme (lecture décomp + port)** :
La pénombre = fenêtre **WIN0 par-scanline** (cercle midpoint → `REG_WIN0H` à chaque HBlank ;
intérieur WIN0 = map, extérieur = `WINOUT=WIN01_BG0` = BG0 seul = noir).
- Setup : `InitCurrentFlashLevelScanlineEffect` (port `overworld.ts:1228`, décomp `overworld.c:1794`) au chargement de map (`TestOverworldScene.ts:1585`).
- Tick permanent : `__scanlineEffectTick` (`scanline_effect.ts:205`) appelé **inconditionnellement** chaque frame (`decomp-runtime.ts:2274`).
- La bannière **show-mon INDOORS** (variante des grottes, `MAP_TYPE_UNDERGROUND` — vérifié `gMapHeader.mapType`) DÉVIE en écrivant `WININ`/`WINOUT`/`outsideEnable` (déviation port DOCUMENTÉE, `field_effect_helpers.ts:1884-1912`) alors que le décomp INDOORS ne touche QUE WIN1.
- **Correctif port déjà en place** : `_reArmFlashScanlineAfterFieldMoveBanner()` (`field_effect_helpers.ts:1833`), appelé à la fin des deux bannières (`_End` outdoors :1845 / indoors :1986), ré-arme si `GetFlashLevel() > 0`. Le `_End` indoors restaure aussi `WININ`/`WINOUT` sauvegardés (:1981-1982).

**Pourquoi ça ne casse plus** : le re-arm est correctement gaté (`GetFlashLevel()===7` en grotte) et
restaure `WININ`/`WINOUT` + ré-inscrit le buffer scanline. Introduit par `2b85acb5d`
(« FLASH par-scanline réel + rustine flash-mask PURGÉE »). **Le rapport utilisateur précède
probablement ce commit.**

**Caveats à surveiller (non reproduits mais théoriquement fragiles)** :
1. **La bannière show-mon (mon qui apparaît + stries) ne s'est PAS affichée visuellement** pendant Coupe/Éclate-Roc, et aucune tâche `Task_FieldMoveShowMonIndoors` n'a été captée. Si la bannière est un no-op de fait, la déviation `WININ/WINOUT` n'a jamais lieu → rien à re-armer. À CLARIFIER : commentaires contradictoires dans `field_effect_helpers.ts:1155-1158` (« NON PORTÉ → no-op ») vs `:1282-1284` (« PORTÉ »). Si la bannière doit rendre le mon et ne le fait pas, c'est un bug séparé (mon-show manquant), mais il PROTÈGE la pénombre.
2. Tout chemin grotte qui reset `WININ/WINOUT`/state **sans jouer la bannière** ne serait pas re-armé (ex. `ReturnToFieldLocal_Manual` `overworld.ts:1312-1317` — dépend du re-arm de `loadAndInitMap` `TestOverworldScene.ts:1585`).
3. **Le move Flash lui-même** (`AnimateFlash`) non testé (nécessite Flash dans l'équipe).

**Plan de fix** : aucun (ne reproduit pas). Si durcissement voulu : clarifier le statut réel de
la bannière show-mon (§caveat 1). **Taille : néant / S** (clarification bannière).

**Réfs** : `src/field_screen_effect.ts:138,147,386` · `src/field_effect_helpers.ts:1833,1884-1912,1972-1988` · `src/overworld.ts:1228,1312` · décomp `field_effect.c:2781-2862`, `field_screen_effect.c:985`, `overworld.c:1794`.

---

## Bug 2 — Force freeze le jeu (CAUSE RACINE TROUVÉE)

**Symptôme** : sur `MAP_DEBUG_1`, interagir (A) avec le rocher Force gèle le jeu.

**Repro (100 %)** : A devant `OBJ_EVENT_GFX_PUSHABLE_BOULDER` @(8,10) → `sLockFieldControls=true`,
joueur figé (ne bouge plus), aucun script, aucune tâche field-move, aucun dialogue. Console :
```
[field-control] interaction script → '0x0' at INTERNAL=(15,17) dir=2 mb=0x8
[byte-vm] script '0x0' absent de l'image
```

**Cause racine — chaîne complète** :
1. **DONNÉE** : le rocher de la debug-map a `script: '0x0'` — `harness/devtools/debug-maps.ts:162` :
   ```ts
   // Rocher Force : poussé par collision (TryPushBoulder + FLAG_SYS_USE_STRENGTH), pas de script.
   oe('OBJ_EVENT_GFX_PUSHABLE_BOULDER', 8, 10, '0x0', 'FLAG_TEMP_13', 'MOVEMENT_TYPE_NONE'),
   ```
   Le commentaire est **FAUX** : les VRAIES maps donnent toutes `'EventScript_StrengthBoulder'`
   au rocher (vérifié : `SeafloorCavern_Room1.json`, `VictoryRoad_B1F.json`, `MagmaHideout_1F.json`).
   Ce script est ce qui ACTIVE Force (checkpartymove → msgbox → `dofieldeffect FLDEFF_USE_STRENGTH`
   → `setflag FLAG_SYS_USE_STRENGTH`). Sans lui, on ne peut jamais activer Force au rocher.
2. **GARDE INSUFFISANTE** : `GetInteractedObjectEventScript` (`src/field_control_avatar.ts:774-775`)
   fait `const script = gObjectEvents[id].scriptLabel; if (!script) return null;`. Or le pointeur
   nul du décomp est stringifié en **`'0x0'` (chaîne TRUTHY)** → passe le `if (!script)` → retourne `'0x0'`.
   Le décomp, lui, aurait `script == NULL` → `GetInteractionScript` retombe sur bg/metatile/water →
   NULL → **pas d'interaction, pas de lock**.
3. **RETOUR TRUTHY IGNORANT L'ÉCHEC** : `TryStartInteractionScript` (`src/field_control_avatar.ts:920-928`)
   appelle `ScriptContext_SetupScript('0x0')` **mais IGNORE sa valeur de retour** et fait `return true` (:927).
   Or `ScriptContext_SetupScript` (`src/script.ts:282-291`) fait `ptr = ptrFromLabel('0x0')` = null →
   **early-return `false` SANS locker** (:284, le `LockPlayerFieldControls()` est APRÈS à :287).
4. **LE LOCK VIENT DE LA SCÈNE** : `ProcessPlayerFieldInput` renvoie `true` (`field_control_avatar.ts:347-348`)
   → `TestOverworldScene.ts:791-793` :
   ```ts
   _inputConsumed = ProcessPlayerFieldInput(sFieldInput);
   if (_inputConsumed) { LockPlayerFieldControls(); ... }
   ```
   → `sLockFieldControls=true`, mais **aucun script ne tourne pour appeler `releaseall`/Unlock** → **FREEZE définitif**.

Le décomp (`overworld.c:1438`, cf. commentaire port `field_control_avatar.ts:780`) fait la même
séquence `if (ProcessPlayerFieldInput()==1) LockPlayerFieldControls()` — elle n'est sûre que parce
que le script nul y renvoie NULL en amont. Notre port stringifie NULL→`'0x0'` et casse cette garantie.

**Plan de fix (2 volets, faire les deux)** :
- **DATA** : `debug-maps.ts:162` → donner `'EventScript_StrengthBoulder'` au rocher (comme les vraies maps).
  Restaure l'activation de Force sur la debug-map.
- **CODE (durcissement, protège TOUTES les maps)** : traiter `'0x0'` (et `'0'`/`'0x00000000'`) comme null.
  Le mieux 1:1 : dans `GetInteractedObjectEventScript` (`field_control_avatar.ts:775`), remplacer
  `if (!script)` par un test qui capte aussi le pointeur nul stringifié → `return null` (= comportement
  décomp : pointeur NULL → pas d'interaction). Alternative/complément : `TryStartInteractionScript`
  (:927) doit renvoyer le retour de `ScriptContext_SetupScript` au lieu de `return true` inconditionnel.

**Taille : S** (une ligne data + un guard).

**⚠️ Instance bonus du même bug** : le PNJ `OBJ_EVENT_GFX_MAN_1` @(5,14) a aussi `script:'0x0'`
(`debug-maps.ts:164`) → lui parler gèle le jeu de façon IDENTIQUE. Le guard code le corrige d'un coup.

---

## Bug 3 — Plongée : sprite joueur corrompu (algues vertes / silhouette « chauve-souris »)

**Statut repro : NON reproduit sur les debug-maps (data correcte).**
- Warp direct `dev.debugMap(3)` (sous-marin) : avatar = `OBJ_EVENT_GFX_BRENDAN_UNDERWATER`, flags=16
  (UNDERWATER), **OAM correct 32×32** (`oam.shape=0 size=2`, tile 144), rendu plausible (échantillon
  pixels du sprite : bleu/gris/noir, **aucun vert franc**).
- Émersion (B → « Voulez-vous utiliser PLONGÉE ? » → OUI) → `MAP_DEBUG_1` en surf : avatar =
  `OBJ_EVENT_GFX_BRENDAN_SURFING`, flags=8, OAM 32×32 — **pas de silhouette « chauve-souris »** visible.

**Data layer : 100 % correcte** (contrairement à une piste graphicsId/table manquante) :
- `build_gObjectEventGraphicsInfo_BrendanUnderwater` (`src/data/object_events/object_event_graphics_info.ts:2658-2677`) : `size:512, width:32, height:32, oam:gObjectEventBaseOam_32x32, paletteSlot:PALSLOT_PLAYER, paletteTag:OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER` (May = idem mais `PALSLOT_NPC_SPECIAL`). 1:1 décomp `object_event_graphics_info.h:2129`.
- `ObjectEventSetGraphicsId` (`src/event_object_movement.ts:8288-8375`) applique bien `oam.shape/size` du graphicsInfo (:8347-8348).

**Nuance trouvée (latente, PAS la corruption)** : `sprite.shape/size` reste **stale à 16×32** après le
swap (seul `rt.gba.oam[oamIndex].shape/size` est mis à jour à 32×32, `event_object_movement.ts:8347-8348`).
Le compositeur rend via l'OAM (correct) → pas de corruption visible. Mais l'incohérence
`sprite.shape/size` ≠ `oam.shape/size` est une dette à assainir.

**Où est la vraie corruption (transition-spécifique, à vérifier par le fixeur)** — 3 pistes solides :
1. **Palette source** (« silhouette noire / couleurs fausses ») : le port NE porte PAS le `.pal` dédié
   `player_underwater.pal` (dette `event_object_movement.ts:9295`) ; il prend la palette embarquée du PNG
   via `PatchObjectEventPalette(png.palette, PALSLOT_PLAYER, …)` (`:8341`). Si la PLTE du PNG diffère de
   `player_underwater.pal` (ordre/valeurs), couleurs fausses. (Observé ici : `paletteBank=0` — à valider.)
2. **Re-packing 32×32** (« algues vertes » = garbage de tuiles) : `pngTo1dObjLayoutAllFrames(png.charData,
   png.widthTiles, 32, 32)` (`:8308`) re-agence le PNG 32×32 (la plupart des NPC sont 16×32) ; un mauvais
   agencement de frames scramble les tuiles.
3. **Trou de preload au return-to-field** : le preload underwater (`TestOverworldScene.ts:1189`) est gaté
   `if (!returnToField)` (:1179). Revenir d'un combat/menu SUR la map sous-marine → `ObjectEventSetGraphicsId`
   avec PNG non chargé → **bail** (`event_object_movement.ts:8305` « PNG non préchargé ») → l'avatar garde
   l'ANCIEN gfx (surf/normal) avec l'OAM underwater → **corruption**. C'est le scénario le plus probable du
   rapport user (plongée depuis le surf quand le PNG underwater n'est pas encore prêt).

**Plan de fix** : (a) surveiller la console pour `[ObjectEventSetGraphicsId] PNG non préchargé` pendant une
VRAIE plongée depuis le surf ; (b) porter `player_underwater.pal` OU vérifier que la PLTE du PNG underwater
matche ; (c) étendre le preload underwater au chemin `returnToField`. **Taille : M** (investigation +
preload/palette ; data déjà bonne).

**Réfs** : `src/event_object_movement.ts:8288-8375,8308,8341,9295` · `src/data/object_events/object_event_graphics_info.ts:2658` · `harness/scenes/TestOverworldScene.ts:1179-1189` · décomp `field_player_avatar.c:871`, `event_object_movement.c:456,493`.

---

## Bug 4 — Blob de surf : musique de surf persiste + bobble résiduel

### ④②-musique — **BUG CONFIRMÉ (1 ligne)**

`CreateStopSurfingTask` (`src/field_player_avatar.ts:1037-1053`) :
```ts
Overworld_ClearSavedMusic();
Overworld_PlaySpecialMapMusic();          // :1044  ← BUG (décomp = Overworld_ChangeMusicToDefault)
gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_SURFING;   // :1045  flag surf effacé APRÈS
```
Le décomp (`field_player_avatar.c:1636`) appelle `Overworld_ChangeMusicToDefault()`. Le commentaire port
(:1039-1042) reconnaît lui-même que `PlaySpecialMapMusic` est « best-effort ».

**Pourquoi la musique de surf ne s'arrête pas** : `Overworld_PlaySpecialMapMusic` (`src/overworld.ts:950-964`)
fait `else if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_SURFING)) music = MUS_SURF;` (:958-959). Comme le
flag SURFING est encore posé (effacé seulement à :1045, APRÈS l'appel :1044), la fonction re-sélectionne
`MUS_SURF` et ne rétablit jamais la musique de map. `Overworld_ChangeMusicToDefault` (`src/overworld.ts:989-993`)
existe déjà et fond inconditionnellement vers `GetCurrLocationDefaultMusic()` (ignore le flag surf).

**Plan de fix** : `field_player_avatar.ts:1044` → remplacer `Overworld_PlaySpecialMapMusic()` par
`Overworld_ChangeMusicToDefault()` (déjà porté). **Taille : S** (1 ligne, 1:1 décomp).

### ④②-bobble — **NE REPRODUIT PAS dans mon test**

Test : après un cycle plongée→émersion→surf (le scénario « sprite stale » suspecté), forçage du démontage
via `__CreateStopSurfingTask(1)`. Résultat (trace 150 frames) : `flags 40→33` (SURFING effacé, ON_FOOT posé),
saut hors du blob puis **`player.y2` retombe à 0** (plus d'oscillation), avatar NORMAL, blob disparu.
Les mécanismes d'arrêt sont tous présents et fonctionnent : `SetSurfBlob_BobState(…, BOB_JUST_MON)`
(`field_player_avatar.ts:1064`), `DestroySprite(fieldEffectSpriteId)` (:1079), `triggerGroundEffectsOnMove=true` (:1082).

**Piste restante (subagent, non reproduite ici)** : le sprite dummy de bobbing underwater
(`StartUnderwaterSurfBlobBobbing`, `field_effect_helpers.ts:2779`) ne semble jamais détruit → si
`fieldEffectSpriteId` pointe un sprite obsolète au moment du `DestroySprite` (:1079), le mauvais sprite est
tué et le blob vivant continue le bobbing. **N'a pas manifesté dans mon test** ; à confirmer si le user le
revoit (repro exacte : quel enchaînement ?).

### ④①-direction du blob au refresh — **NON TESTÉ**

« au refresh de l'OW en surfant, le blob pointe parfois dans la mauvaise direction » : non reproduit
(nécessite un refresh/HMR en plein surf). Piste : restauration de l'`animNum`/direction du blob au
re-spawn de l'OW. À investiguer séparément.

**Réfs** : `src/field_player_avatar.ts:1037-1085` · `src/overworld.ts:950-964,989-993` · décomp `field_player_avatar.c:1630-1669`, `overworld.c:1150,1193`.

---

## Bug 5 — Coupe ne coupe pas l'herbe en direct-A (le modèle utilisateur est INVERSÉ)

**Vérité décomp** : le Cut-sur-HERBE est **party-menu UNIQUEMENT** (`SetUpFieldMove_Cut` scanne un carré
3×3/5×5 pour `MetatileBehavior_IsPokeGrass`/`IsCuttableGrass` → `FieldCallback_CutGrass` →
`FLDEFF_USE_CUT_ON_GRASS` → `FldEff_CutGrass` remplace la métatuile + spawn sprites `CutGrass`).
**Le direct-A-sur-herbe N'EXISTE PAS dans le décomp** (pas de branche metatile-script pour l'herbe ;
`GetInteractedMetatileScript` n'a aucune branche herbe/arbre/rocher). Presser A face à l'herbe ne fait rien
(l'herbe ne déclenche que des rencontres au PAS, pas à l'interaction).

**Notre port (vérifié EN JEU)** — le modèle du user est inversé :
| Chemin | Décomp | Port | Vérifié en jeu |
|---|---|---|---|
| Coupe **party-menu** (herbe ou arbre) | marche | **NO-OP** (pas de callback) | ✅ sélection « COUPE » → RIEN (menu reste ouvert, aucun message ; « RESUME » répond, donc menu OK) |
| Coupe **direct-A sur ARBRE** | marche | **MARCHE** | ✅ arbre @8,3 coupé (`EventScript_CutTree`) |
| Coupe **direct-A sur HERBE** | n'existe pas | n'existe pas | (conforme décomp) |
| Coupe **sur HERBE (party-menu)** | marche | **PAS PORTÉ** | — |

Détail code :
- `sFieldMoveCursorCallbacks` (`src/party_menu.ts:3811-3821`) n'a **QUE `[FIELD_MOVE_STRENGTH]`** —
  aucune entrée `[FIELD_MOVE_CUT]` (ni Rock Smash, Dig, Sweet Scent). Sélectionner Coupe →
  `CursorCb_FieldMove` (`:3844`) → `cb` undefined → early-return silencieux (:3849). **Confirmé en jeu :
  « COUPE » ET « ÉCLATE-ROC » sont des no-ops ; seul « RESUME » a répondu.**
- `SetUpFieldMove_Cut` **n'existe pas** dans le port (juste nommé en commentaire `fldeff_cut.ts:11`).
- Cut-sur-herbe entièrement absent : pas de `FLDEFF_USE_CUT_ON_GRASS`, `FldEff_CutGrass`, sprites, ni
  remplacement de métatuile. `MetatileBehavior_IsCuttableGrass` (`metatile_behavior.ts:831`) existe mais
  n'a **aucun appelant** Cut.

**Plan de fix (pour couper l'herbe 1:1)** — implémenter le sous-système, PAS un chemin direct-A herbe :
1. `SetUpFieldMove_Cut` (scan herbe 3×3/5×5 + check `CheckObjectGraphicsInFrontOfPlayer(CUTTABLE_TREE)`) —
   décomp `fldeff_cut.c:138-276`.
2. Entrée `sFieldMoveCursorCallbacks[FIELD_MOVE_CUT] = { fieldMoveFunc: SetUpFieldMove_Cut, msgId:'gText_CantUseHere' }` (`party_menu.ts:3811`).
3. `FieldCallback_CutGrass` + `FLDEFF_USE_CUT_ON_GRASS`→`FldEff_UseCutOnGrass`→`StartCutGrassFieldEffect`→
   `FldEff_CutGrass` (remplace `METATILE_General_TallGrass→…Grass`, spawn 8 sprites) — décomp `fldeff_cut.c:278-392`.

**Taille : L** (sous-système complet — `SetUpFieldMove_Cut` + callbacks party-menu + effet CutGrass +
remplacement métatuile). **NE PAS** ajouter de direct-A-sur-herbe (hors décomp).

**Réfs** : `src/party_menu.ts:3811-3821,3844-3850` · `src/fldeff_cut.ts:1-14,40-54` · `src/field_control_avatar.ts:756-778,823-867` · décomp `fldeff_cut.c:138-392`, `field_move_scripts.inc:2-20`.

---

## Bug 6 — PC de rangement « démoli » (FAUSSE PISTE / NE REPRODUIT PAS)

**Statut : le PC rend 100 % correctement en jeu.** Vérifié sur `dev.debugMap(2)` via
`__byteVm.launchScript('EventScript_PC')` → PC de ??? → RETIRER POKéMON :
- Vue BOÎTE : titre « BOITE 1 », wallpaper vert, icône mon (BULBIZARRE), preview mon, curseur main,
  menus (« ÉQUIPE PkMn », « FERMER BOITE ») — **tout rendu, allocations tuiles saines** (tileBase 0/64/68/132/136/150/166, aucun garbage tile-0).
- Scroll de boîte (curseur), panneau preview (vide sur case vide = normal), sortie (« Continuer gestion
  BOITE ? » OUI/NON, cadres corrects) — **flow complet fonctionnel**.

**La « hot lead » `ddeb7ef86` N'AFFECTE PAS le PC** :
- Le PC utilise **`LoadSpriteSheet`** (non compressé, `src/sprite.ts:967`), PAS `LoadCompressedSpriteSheet`.
  Le commit `ddeb7ef86` n'a modifié QUE `LoadCompressedSpriteSheet`. La seule mention de
  `LoadCompressedSpriteSheet` dans `pokemon_storage_system.ts` est un **COMMENTAIRE** (`:1517`).
- Toutes les sheets PC (`handCursorGfx` 0x800, `chooseBoxCenterGfx` 0x800, `boxTitleTiles` 0x200,
  item icons 0x200, cf. `pokemon_storage_system.ts:2700,3327,3592`) passent par `LoadSpriteSheet`.
  Les **icônes de mon** aussi (via `CreateMonIconSprite`→`LoadSpriteSheet`, `pokemon_storage_system.ts:1168`).
- `LoadSpriteSheet` (`src/sprite.ts:967-983`) clampe TOUJOURS à `sheet.size` (:968, :980) — comportement
  inchangé depuis longtemps. Si une sheet PC sur-déclarait `size < usage`, elle serait cassée depuis
  toujours (pas une régression). Elles rendent correctement → sheets bien dimensionnées.

**Hypothèse pour le « démoli » observé** : état transitoire (Service Worker / cache assets périmé — piège
documenté « vider les caches ne suffit pas, DÉSENREGISTRER le SW »), ou observation antérieure à un fix.
**Recommandation** : re-tester après désenregistrement SW + refresh dur.

**Réfs** : `src/pokemon_storage_system.ts:1517-1518,2700-2701,3327,3592,1168` · `src/sprite.ts:967-983` · commit `ddeb7ef86` (`harness/runtime/decomp-globals.ts:1764-1815`).

---

## Régressions potentielles du fix `LoadCompressedSpriteSheet` (`ddeb7ef86`)

**Le changement** (`harness/runtime/decomp-globals.ts:1775-1776,1802`) :
```ts
const declaredSize = (typeof sheet.size === 'number' && sheet.size > 0) ? sheet.size : bytes.length;
const needed = Math.min(declaredSize, bytes.length);   // AVANT : needed = bytes.length
// … tileCount = needed>>5 ; copySize = min(needed, objVram - offset)
```

**Périmètre EXACT du risque** : le clamp ne change le comportement QUE quand `sheet.size < bytes.length`
(taille déclarée < longueur DÉCOMPRESSÉE). Trois cas :
- `size == bytes.length` (sheets normales) → `min` inerte → **aucun changement**. C'est le cas très majoritaire.
- `size > bytes.length` → `min = bytes.length` → **identique à avant** (sûr).
- `size < bytes.length` → charge MOINS de tuiles (`size` seulement). **Seul cas à risque.**
  - Si le décomp déclare aussi cette `size` (chargement partiel VOULU, ex. sheets « rival » du générique
    `gSpriteSheet_CreditsRivalMay` size 0x2000 d'un gfx 0x3800) → le clamp est **1:1 CORRECT** (c'est le
    bug que le commit CORRIGE).
  - Si NOTRE `size` est déclarée **par erreur plus petite** que la `size` réelle du décomp → la sheet est
    désormais TRONQUÉE (les tuiles hautes manquent), alors qu'AVANT elle marchait « par accident »
    (on chargeait tout `bytes.length`). **C'est la classe de régression à auditer.**

**Ce que j'ai vérifié en jeu (rendu correct, donc PAS de régression sur ces flux)** :
- PC de rangement (n'utilise PAS `LoadCompressedSpriteSheet` — cf. Bug 6).
- Party-menu + summary (icônes mon, cadres).
- Vue boîte + wallpaper + curseur.
- Intro combat sauvage (sprites mon Nosferapti/Tentacool, HUD, menus combat).
- Générique / reboot (contexte du commit — déjà vérifié par l'auteur).

**29 fichiers** appellent `LoadCompressedSpriteSheet` (`src/`) : credits, hall_of_fame, rayquaza_scene,
wallclock, item_menu, item_menu_icons, pokenav_*, main_menu, intro, starter_choose, party_menu, pokedex,
pokedex_area_screen, battle-sendout-anim, pokeball, pokemon_summary_screen, item_icon, digit_obj_util,
list_menu, title_screen, money, menu_helpers, battle_gfx_sfx_util, pokemon_storage_system (comment only).

**Recommandation d'audit ciblé** (non fait ici, hors périmètre dynamique) : pour chaque appelant, comparer
la `size` déclarée à la `size` du décomp source. Toute sheet où `size_port < size_décomp` est une
régression potentielle (tuiles hautes tronquées). Le commit étant « strictement réducteur », seules les
sheets **sur-déclarées trop petites** (par rapport au décomp) sont exposées. Aucune trouvée dans les flux
testés ci-dessus.

---

## Autres constats (en route)

- **PNJ `MAN_1` @(5,14) `MAP_DEBUG_1`** : `script:'0x0'` (`debug-maps.ts:164`) → lui parler **gèle** le jeu
  (même bug que Bug 2). Le guard code de Bug 2 le corrige.
- **Rencontres sauvages sur l'eau des debug-maps** : denses (Nosferapti, Tentacool) — gênent les tests
  surf/plongée. (Pas un bug produit ; note d'outillage.)
- **`sprite.shape/size` stale vs `oam.shape/size`** après `ObjectEventSetGraphicsId` (cf. Bug 3) : dette
  d'assainissement (le compositeur lit l'OAM, donc inoffensif au rendu).
- **Bannière field-move show-mon (mon + stries) non visible** pendant Coupe/Éclate-Roc en grotte (cf. Bug 1
  caveat 1) — à clarifier (commentaires code contradictoires).

---

## Récap dynamique (testé EN JEU, onglet isolé `tab-3`)

| Bug | Reproduit ? | Cause racine | Taille fix |
|---|---|---|---|
| 1 Flash | ❌ (Cut+RockSmash OK, pénombre intacte) | re-arm déjà en place `2b85acb5d` | néant / S |
| 2 Force freeze | ✅ 100 % | rocher `script:'0x0'` + `'0x0'` truthy → lock sans release | **S** |
| 3 Plongée corruption | ❌ (warp+émersion OK) | data OK ; corruption = transition (preload/palette) | M |
| 4 Surf musique | ✅ (confirmé code) | `Overworld_PlaySpecialMapMusic` avant clear flag SURFING | **S** |
| 4 Surf bobble | ❌ (s'arrête, y2→0) | mécanismes présents ; piste sprite stale non manifestée | M (investig.) |
| 5 Coupe herbe | ✅ (party-menu = no-op) | pas de callback Cut + Cut-herbe pas porté ; modèle user inversé | **L** |
| 6 PC démoli | ❌ (rendu 100 % OK) | fausse piste — PC utilise `LoadSpriteSheet` | néant |
