# FIX MOTEUR — Lot A1 palette (exécution des manques de `palette.md`)

**Source** : `audit-reports/engine/palette.md` (MANQUES CRITIQUES 1-5 + RUSTINES).
**Décomp de réf** : `src/palette.c` (1043 l) + `include/palette.h` (struct + unions).
**Règle** : transcription 1:1 stricte. `npx tsc --noEmit` = **0** après chaque fichier (vérifié ×4).
**Interdits respectés** : aucun serveur / jeu / git / commit ; aucune valeur magique sans citation.

Fichiers touchés :
- `harness/runtime/decomp-runtime.ts` (dispatch FAST + flush immédiat + alias/unions gPaletteFade)
- `src/palette.ts` (ResetPaletteFadeControl 1:1)
- `harness/runtime/decomp-globals.ts` (re-export ResetPaletteFadeControl)
- `src/battle_main.ts` (câblage _ResetPaletteFadeControl + _LoadCompressedPalette)
- `src/battle_anim.ts` (câblage _beginHardwarePaletteFade + _paletteFadeActive)

---

## FIX 1 — Dispatch FAST_FADE (MANQUE #1)

**C (palette.c:124-129)** :
```c
if (gPaletteFade.mode == NORMAL_FADE)       result = UpdateNormalPaletteFade();
else if (gPaletteFade.mode == FAST_FADE)    result = UpdateFastPaletteFade();
else                                        result = UpdateHardwarePaletteFade();
```

**Avant** : `decomp-runtime.ts UpdatePaletteFade()` ne routait que `HARDWARE_FADE` (inline) ;
tout le reste tombait dans le chemin NORMAL. Un `FAST_FADE` tournait donc le chemin NORMAL
avec `selectedPalettes` résiduel (=0 après le fade précédent) → **zéro write palette**, ~30 frames
brûlées puis `active=false`. Les 2 fins de combat `BeginFastPaletteFade(3)`
(`battle_main.ts:5743` HandleEndTurn_FinishBattle, `battle_script_commands.ts:9910` FinishAction)
ne produisaient **aucun fondu**.

**Diff** : ajout d'une branche `if (f.mode === FAST_FADE) { _UpdateFastPaletteFade(); return f.active; }`
juste après le bloc HARDWARE et **avant** le check `softwareFadeFinishing` inline. Import ajouté :
`UpdateFastPaletteFade as _UpdateFastPaletteFade` sur l'arête d'import EXISTANTE
`decomp-runtime → src/palette` (aucune nouvelle arête ESM → zéro risque TDZ).

**Contrat de retour** : le runtime `UpdatePaletteFade()` retourne `boolean` (`f.active`), identique
au chemin HARDWARE (`return f.active`) et au wrapper `decomp-globals.UpdatePaletteFade` (retourne
`r.gPaletteFade.active`). `UpdateFastPaletteFade` (src/palette.ts:377) retourne un `status` u8 qui
est **discardé** (sa valeur suit `gPaletteFade.active` de toute façon). ✅ cohérent.

**Idempotence par frame** : `_paletteFadeCalledThisFrame` est posé en tête d'`UpdatePaletteFade`
AVANT le dispatch ; `UpdateFastPaletteFade` **ne ré-appelle jamais** `UpdatePaletteFade`
(pas de récursion), donc un seul tick par appel. Le fallback `runOneFrame` (l.2053) ne double pas
l'appel. ✅ La fin de fast fade pose `mode=NORMAL_FADE` + `softwareFadeFinishing=true` (palette.c:721-722),
donc le tick suivant reprend le chemin NORMAL pour la rampe de fin (`IsSoftwarePaletteFadeFinishing`
×5 frames) — exactement comme le C.

---

## FIX 2 — Flush PLTT immédiat de BeginNormalPaletteFade (MANQUE #4)

**C (palette.c:191-199)** :
```c
UpdatePaletteFade();
temp = gPaletteFade.bufferTransferDisabled;
gPaletteFade.bufferTransferDisabled = FALSE;
CpuCopy32(gPlttBufferFaded, (void *)PLTT, PLTT_SIZE);   // flush IMMÉDIAT
sPlttBufferTransferPending = FALSE;
if (gPaletteFade.mode == HARDWARE_FADE && gPaletteFade.active)
    UpdateBlendRegisters();
gPaletteFade.bufferTransferDisabled = temp;
```

**Avant** : après `this.UpdatePaletteFade()`, le port se contentait d'un commentaire « différé au
VBlank ». Or le flush VBlank (`runOneFrame` l.2070) est gaté par `gMain.vblankCallback != null` →
un Begin pendant l'init d'écran (`vblankCallback == null`) n'affichait pas son `startY` (PLTT figé).

**Diff** : transcription littérale. `this.gPlttBufferFaded.flushTo()` = `CpuCopy32(Faded → PLTT)`
(flushTo ignore `bufferTransferDisabled`, le gate est chez l'appelant — cf. decomp-helpers.ts:159).
Le sauve/restaure `temp` de `bufferTransferDisabled` + la branche HARDWARE `UpdateBlendRegisters`
(BLDCNT=0x050, BLDY=0x054) sont transcrits pour fidélité ; la branche HARDWARE est **inerte ici**
(BeginNormalPaletteFade pose toujours `mode=NORMAL_FADE`) mais présente 1:1.

**Note comportement** : n'a d'effet observable que quand `vblankCallback == null` (init de scène) —
exactement le cas anti-flash du décomp. Pour un fade-in-from-black `startY=16`, le buffer Faded est
noir → flush noir → aucun flash. Pour les fades normaux (vblankCallback posé), le flush VBlank de fin
de frame rend l'ajout redondant (même frame). ⇒ narrow, 1:1, revert facile si régression d'init.

---

## FIX 3 — ResetPaletteFadeControl 1:1 exportée + câblée (MANQUE #5)

**C (palette.c:363-381)** : 16 assignations sur `gPaletteFade` (multipurpose1/2=0, delayCounter=0,
y=0, targetY=0, blendColor=0, active=FALSE, yDec=0, bufferTransferDisabled=FALSE,
shouldResetBlendRegisters=FALSE, hardwareFadeFinishing=FALSE, softwareFadeFinishing=FALSE,
softwareFadeFinishingCounter=0, objPaletteToggle=0, deltaY=2).

**Avant** : la vraie impl n'existait qu'INLINÉE dans `decomp-globals.ResetPaletteFade` ; l'en-tête
`src/palette.ts:11` la PROMETTAIT (mensonger) ; le call-site `battle_main.ts:593` `_ResetPaletteFadeControl`
= stub vide « Dette R3 » (chemin recorded-battle B-quit, l.671).

**Diff** :
- `src/palette.ts` : nouvelle `export function ResetPaletteFadeControl()` — 16 assignations
  écrites via les **alias 1:1** (y/targetY/blendColor/delayCounter/multipurpose1/2 — cf. FIX 5),
  donc lisibles exactement comme le C.
- `decomp-globals.ts` : ajout de `ResetPaletteFadeControl` au bloc de re-export depuis `src/palette`.
- `battle_main.ts` : `_ResetPaletteFadeControl()` **délègue** désormais à `ResetPaletteFadeControl()`
  (import ajouté depuis decomp-globals). Call-site l.671 inchangé (risque nul).

**NON refactorisé (délibéré)** : `decomp-globals.ResetPaletteFade` n'a **pas** été réécrit pour
appeler `ResetPaletteFadeControl`. Raison : elle contient des resets de champs-fantômes harness
(startY/currentFrame/totalFrames) ET un `mode = 0` **non-décomp** (le C ResetPaletteFade ne touche pas
`mode`). La factoriser changerait ce comportement → laissé tel quel pour éviter toute régression.
Les deux fonctions sont donc légitimement distinctes.

---

## FIX 4 — Purge des rustines listées

### 4a. `battle_anim.ts:1036/1042` (MANQUE #2 / RUSTINE #1)
**Avant** : `_beginHardwarePaletteFade` = no-op ; `_paletteFadeActive()` = `return false` en dur.
`Task_FadeToBg` (battle_anim.c:1148-1183, changement de décor des anims de move) chargeait donc le BG
**sans fondu** et ne s'arrêtait jamais sur `paletteFadeActive`.

**Diff** : bodies **délégués** aux vraies fonctions moteur —
`BeginHardwarePaletteFade` (src/palette.ts:472) et `!!gPaletteFade.active` (proxy src/palette).
Import ajouté `import { BeginHardwarePaletteFade, gPaletteFade } from './palette'`. Signatures/args
1:1 (`0xE8, 0, 0, 16, 0` = blendCnt/delay/y/targetY/shouldReset). Call-sites (945/949/957/961) et
l'objet `__battleAnimInterpreter` (2365/2366) **inchangés** (les noms `_beginHardwarePaletteFade` /
`_paletteFadeActive` survivent comme wrappers 1:1). Le mode HARDWARE_FADE est déjà tické par
`UpdatePaletteFade` (BLDCNT/BLDY → compositor) — **même voie que le reshow de combat validé**.

### 4b. `battle_main.ts:6614` `_LoadCompressedPalette` (RUSTINE #3)
**C (battle_bg.c:864)** : `LoadCompressedPalette(gBattleTextboxPalette, BG_PLTT_ID(0), 2*PLTT_SIZE_4BPP)`.
**Avant** : stub vide « Dette R3 », appelé avec `null` (l.6730) dans `CB2_InitEndLinkBattle`.

**Diff** : body **délègue** à la VRAIE `LoadCompressedPalette` (decomp-globals → src/palette), en
résolvant le symbole décomp `'gBattleTextboxPalette'` quand `data` est null.
⚠️ **Partiel documenté** : `CB2_InitEndLinkBattle` est une voie **LINK** (hors solo-core) et
**synchrone**, alors que notre pipeline charge la palette textbox de façon **asynchrone** ailleurs
(`battle_bg.ts loadBattleTextbox`, la voie solo qui MARCHE). Le symbole `gBattleTextboxPalette` n'est
donc pas dans `assetCache` → `getAsset` retourne null + **warn** (aligné Règle 3 : le gate HURLE) et
la vraie fonction no-op proprement. Le **stub est purgé** (la vraie voie moteur est câblée) ; le
chargement effectif de cette palette dans l'écran link reste une limite de pipeline async, hors
périmètre solo. Aucune régression solo (la voie n'est jamais atteinte en solo).

---

## FIX 5 — Alias 1:1 + unification des unions gPaletteFade (MANQUE #3 / RUSTINE)

**C (palette.h:35-53 + defines 4-7)** : `struct PaletteFadeControl` avec 2 **unions** #define :
`gPaletteFade_selectedPalettes` = `gPaletteFade_blendCnt` = `multipurpose1` ;
`gPaletteFade_delay` = `gPaletteFade_submode` = `multipurpose2`.

**Avant** : la classe `PaletteFade` (decomp-runtime.ts) avait renommé y→brightness, targetY→endY,
delayCounter→delayRemaining, blendColor→targetR/G/B **et brisé les 2 unions** (`selectedPalettes` et
`delayPerStep` étaient des champs SÉPARÉS de multipurpose1/2). Un futur transpilé lisant
`gPaletteFade.y` / `.multipurpose1` (pendant un fade normal) lisait `undefined` / 0 en silence.

**Diff (accesseurs get/set sur la classe, prototype = transparents au state-proxy)** :
- Alias purs (rename, 1 seul stockage) : `y`↔brightness, `targetY`↔endY, `delayCounter`↔delayRemaining,
  `blendColor`↔(targetR/G/B recomposé RGB15).
- **Unification des unions** : champs `selectedPalettes` et `delayPerStep` **retirés** (déclarations) et
  convertis en accesseurs sur `multipurpose1` / `multipurpose2` (les vrais champs du struct C).
  ⇒ « les deux noms coexistent » : `selectedPalettes` ET `multipurpose1` pointent le MÊME stockage
  (= l'union réelle). `delayPerStep` ET `multipurpose2` idem.

**Sûreté vérifiée (grep exhaustif des lecteurs/écrivains)** : NORMAL, FAST et HARDWARE fade sont
**mutuellement exclusifs** (`mode` unique), donc `selectedPalettes`(normal) et `blendCnt`(hardware) ne
coexistent JAMAIS, ni `delayPerStep`(normal) et `submode`(fast)/`delay`(hardware). Les seuls
consommateurs sont : decomp-runtime (chemins normal/hardware), src/palette (hardware/fast),
decomp-globals (reset), engine-devtools (lecture debug) — tous transparents aux accesseurs.
**Bonus 1:1** : `ResetPaletteFadeControl`/`ResetPaletteFade` posant `multipurpose1 = 0` remettent
désormais aussi `selectedPalettes` à 0 (comme l'union C) → corrige le point ligne 22 de palette.md.
**Changement mineur** : le boot de `selectedPalettes` passe de `0xFFFFFFFF` (défaut non-décomp) à `0`
(= `gPaletteFade = {0}` du C). Sûr : `selectedPalettes` n'est lu que `active`, toujours posé par un
`BeginNormalPaletteFade` avant.

---

## Points NON faits / hors-scope (raison)

1. **`_LoadCompressedPalette` (link)** : stub purgé (vraie fonction câblée) mais l'asset
   `gBattleTextboxPalette` n'est pas résolu **synchroniquement** dans la voie link `CB2_InitEndLinkBattle`
   (pipeline async + hors solo-core). No-op-with-warn documenté ci-dessus. Ce n'est pas un manque du
   MOTEUR palette mais une limite pipeline link.
2. **Rustines palette.md #4-#9 NON dans le périmètre du lot** (task point 4 ne listait que battle_anim +
   _LoadCompressedPalette) : `InvertPlttBuffer` bypass (battle_anim_normal.ts:655), fallback
   BlendPalettesGradually (palette.ts:667), doublon `_blendPalette` (palette.ts:756), doublons orphelins
   UpdateHardwarePaletteFade/UpdateBlendRegisters/IsSoftwarePaletteFadeFinishing (palette.ts:489/535/554
   vs inline runtime), latch-clear softwareFadeFinishing (decomp-runtime:1262), en-têtes inexacts
   src/palette.ts:7-11. → À traiter dans un lot « dédup palette » ultérieur (Phase C).
3. **decomp-globals.ResetPaletteFade non refactorisée** (cf. FIX 3) — conserve resets fantômes + `mode=0`
   non-décomp pour éviter tout changement de comportement.

---

## Écrans à RE-TESTER en jeu (obligatoire avant « fini »)

- **Fin de combat = FAST_FADE (FIX 1)** : lancer un combat, gagner OU fuir → l'écran doit **fondre au
  noir** proprement (`BeginFastPaletteFade(3)` = FAST_FADE_OUT_TO_BLACK) puis retour overworld/évolution.
  Avant le fix : coupe sèche / ~0.5 s de gel sans fondu.
- **Anims de move avec changement de décor = `Task_FadeToBg` (FIX 4a)** : déclencher un move qui change
  le BG d'anim → fondu-out (BLDY) → load BG → fondu-in. Le `paletteFadeActive` gate doit maintenant
  vraiment attendre la fin du fondu.
- **Reshow de combat** : non touché mais partage la voie HARDWARE_FADE — vérifier absence de régression.
- **Inits d'écran / transitions avec BeginNormalPaletteFade (FIX 2)** : battle intro, menus, warps —
  vérifier **aucun flash d'init** nouveau (le flush immédiat ne doit rien changer visuellement au cas
  vblankCallback posé ; surveiller le cas init vblankCallback==null).
- **Quit recorded-battle (bouton B) (FIX 3)** : chemin link/recorded (hors solo) — au minimum vérifier
  qu'aucun crash n'apparaît ; `ResetPaletteFadeControl` réinitialise l'état fade 1:1.

**tsc** : `npx tsc --noEmit` = **0** (exit 0) après tous les édits.
