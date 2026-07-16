# FIX MOTEUR — Lot A4 `sprite.c` (source : `audit-reports/engine/sprite.md`)

> Objectif : combler les manques affine/anchor/subsprite/tri du port sprite. **1:1 strict,
> STRICTEMENT additif** (moteur affine partagé combat + zoom Pokénav + Pokéball). `tsc --noEmit` = 0.
> Aucun serveur/jeu/commit (hors périmètre du lot). Fichiers touchés :
> `src/engine/decomp-impls/sprite-engine-impl.ts`, `src/engine/decomp-impls/sprite-affine-extras.ts`,
> `harness/runtime/decomp-runtime.ts`, `src/sprite.ts`, `harness/runtime/decomp-globals.ts`,
> `harness/runtime/decomp-helpers.ts`, `harness/gba/compositor.ts`.

## 1. Système anchor-matrix COMPLET (sprite.c:1206-1244)

**C** (sprite.c) :
```c
void SetSpriteMatrixAnchor(struct Sprite *sprite, s16 x, s16 y) { sprite->sAnchorX=x; sprite->sAnchorY=y; sprite->anchored=TRUE; }
static s32 GetAnchorCoord(s32 a0, s32 a1, s32 coord) { ... return coord - ((u32)(coord*a1)/(u32)(a0) + var1); }
static void UpdateSpriteMatrixAnchorPos(struct Sprite *sprite, s32 x, s32 y) { ... sprite->x2 = GetAnchorCoord(dimension<<8, (dimension<<16)/gOamMatrices[m].a, x); ... }
// BeginAffineAnim l.1079-1080 / ContinueAffineAnim l.1109-1110 : if (sprite->anchored) UpdateSpriteMatrixAnchorPos(sprite, sAnchorX, sAnchorY);
```
**Diff** :
- `sprite-engine-impl.ts` : ajout `NO_ANCHOR=0x800`, table `sOamDimensions32[3][4]` (sprite.c:220-243), `GetAnchorCoord` (`Math.imul`+`>>>0` = u32 ; `Math.trunc` = division signée s32), `UpdateSpriteMatrixAnchorPos` (lit `sprite.matrixNum/shape/size` + `affineParams[m].pa/.pd`). `sAnchorX/Y` = `data[6]/data[7]` (`#define` sprite.c:8-9).
- Branches `if (sprite.anchored) UpdateSpriteMatrixAnchorPos(...)` câblées dans `BeginAffineAnim` (après delayCounter) ET `ContinueAffineAnim` aux 3 sorties non-paused (delay, END, dispatch frame/jump/loop) — **jamais** après le `return` paused (1:1 flux décomp).
- `SetSpriteMatrixAnchor` exportée dans `src/sprite.ts` (son home miroir) ; champ `anchored?: boolean` ajouté à `DecompSprite`.
- **Inerte pour tout sprite non-ancré** (`anchored` undefined → falsy). Seul consommateur décomp = `minigame_countdown.c:448` (non porté à ce jour) → prêt au câblage.

## 2. Loops affines à compteur + JUMP target≠0 (sprite.c:1124-1170)

**JUMP target≠0 (FAIT, 1:1)** : `AffineAnimCmd_jump` (sprite.c:1166) `cmdIndex = jump.target`. Ajout `jumpTarget?` à `AffineAnim` ; `ContinueAffineAnim` : `sprite.affineAnimCmdIndex = anim.jumpTarget ?? 0` (défaut 0 = ancien « jump index 0 »). Couvre les anims simples `FRAME* JUMP(n)` (26× JUMP(1), 1× JUMP(2), 1× JUMP(3) dans le décomp). Toutes les anims enregistrées (BallRotate = JUMP(0)) → **inchangées**.

**Compteur de boucle (FAIT, chemin dual additif)** :
- État `affineAnimLoopCounter?` ajouté à `DecompSprite` + reset 1:1 dans `AffineAnimStateReset`/`StartAnim` (sprite.c:1257/1265).
- Modèle **command-array** complet ajouté (`AffineAnimCmd` union + `cmds?` sur `AffineAnim`) → transcription LITTÉRALE de `ContinueAffineAnim`/`AffineAnimCmd_{loop,jump,end,frame}`/`BeginAffineAnimLoop`/`ContinueAffineAnimLoop`/`JumpToTopOfAffineAnimLoop` (scan des marqueurs `kind==='loop'`, récursion Begin→Continue 1:1) dans `continueAffineAnimCmds`/`beginAffineAnimCmds`/`affineAnimCmdLoopCmds`/`jumpToTopOfAffineAnimLoopCmds`. Activé **uniquement si `anim.cmds` présent** → le chemin legacy `frames[]+terminator` (toutes les anims actuelles) est **byte-identique**.
- Le terminator `'LOOP'` legacy gère le cas simple `FRAME* LOOP(n)` (top=0) avec le compteur.

## 3. AddSubspritesToOamBuffer : enfants héritent affineMode+matrixNum (sprite.c:1683-1755)

**C** : `destOam[i] = *oam;` (l.1746) copie TOUT l'OAM parent, puis surcharge seulement `shape/size/x/y/tileNum/priority` → `affineMode` + `matrixNum` **conservés**.
**Diff** (`decomp-globals.ts`) : `SetSubspriteTables` + `syncSubspriteOam` — remplacé `oam.affineMode = 0; oam.affineParamIndex = 0;` (forçage non-affine) par héritage `= r.gba.oam[sprite.oamIndex].affineMode / .affineParamIndex` (setup) et `= primaryOam.affineMode / .affineParamIndex` (par-frame). **Additif** : tous les sprites à subsprites actuels (naming/healthbars/camion) ont un parent non-affine (affineMode 0) → enfant hérite 0 = comportement inchangé.

## 4. SortSprites : décalage Y AFFINE_DOUBLE+SIZE_3 (sprite.c:382-411)

**C** : `sprite1Y = oam.y; if (y>=160) y-=256; if (affineMode==DOUBLE && size==3 && (shape==SQUARE||V_RECT)) if (y>128) y-=256;`
**Diff** (`compositor.ts`) : helper `_spriteSortY(oam)` = `y = oam.y & 0xFF` (stockage u8 hardware) puis, pour AFFINE_DOUBLE(3)+SIZE_3 square/vrect `y>128?y-256:y`, sinon `y>=160?y-256:y`. Le comparateur du tri utilise `_spriteSortY(sa)-_spriteSortY(sb)` au lieu de `sa.y-sb.y`.
**Démonstration d'équivalence** (les 2 étapes décomp fusionnent pour l'affine-double) : y0∈[0,128]→y0 ; y0∈[129,159]→y0-256 (step2) ; y0∈[160,255]→y0-256 (step1, step2 no-op). ≡ `let y=y0&0xFF; if(y>128)y-=256;`. **Zéro régression visible** : pour tout sprite ON-screen (y brut ∈[-64,96] pour un 64px affine-double, ∈[0,159] pour un normal), `_spriteSortY == oam.y` d'origine ; seuls les sprites off-screen/wrappés (y u8 ∈[129,255]) changent, dans le sens hardware-correct.

## 5. SetOamMatrix : UNE sémantique 1:1 signée (sprite.c:674)

**Constat** : les 2 impls (`decomp-helpers.ts:46` param `gba` ; `src/sprite.ts:611` via `_rt`) sont **déjà toutes deux SIGNÉES** (aucun `& 0xFFFF`). La « 2e impl masquée globals:1141 » de l'audit = en réalité `PanFadeAndZoomScreen` écrivant les matrices **BG** (`bgAffineMatrices`, `& 0xFFFF`) — **système différent**, pas un `SetOamMatrix` OAM. Il n'existe donc pas de divergence active.
**Diff** : verrou d'invariant — commentaires croisés sur les 2 impls (chacune cite sprite.c:674, désigne l'autre comme miroir, impose `s16` non-masqué). **Délégation d'appel rejetée** : elle créerait un cycle d'import TDZ `sprite.ts → decomp-helpers → decomp-globals → sprite.ts` (CLAUDE.md « nouvelle arête d'import tôt = bombes TDZ »), et forcerait la réécriture des ~10 call-sites `./sprite` (battle_anim_*) d'une primitive partagée. Les 2 signatures (avec/sans `gba`) servent 2 familles d'appelants distinctes ; les garder byte-identiques + verrouillées satisfait le 1:1 sans risque.

## 6. Copy{To,From}Sprites + gAffineAnimsDisabled (sprite.c:292/824-846/1414-1425)

- **gAffineAnimsDisabled** (FAIT, 1:1 structurel) : modélisé sur `globalThis` (même substrat que `gOamMatrixAllocBitmap`). `tickAllAffineAnims` : `if (globalThis.gAffineAnimsDisabled) return;` (1:1 `AnimateSprite` sprite.c:905 `if (!gAffineAnimsDisabled)`). Getters `AreAffineAnimsDisabled`/`SetAffineAnimsDisabled` exportés. Reset FALSE dans `ResetSpriteData` (ci-dessous). Consommateur = link trade (hors solo, non câblé).
- **ResetAffineAnimData complété** (audit 🟠) : `ResetSpriteData` (sprite.ts) ajoute `gAffineAnimsDisabled=false` + `ResetOamMatrices()` (identité sur les 32 slots affineParams — MANQUAIT). Le reset per-sprite ×32 reste moot (gSprites déjà `fill(undefined)`).
- **Copy{From,To}Sprites** (FAIT, adaptation de représentation) : le décomp fait un memcpy byte-à-byte de `sizeof(struct Sprite)*MAX_SPRITES` (savestate) ; le modèle PLAT (objets `DecompSprite`, **pas de layout binaire**) n'a pas d'équivalent byte-exact → transcription de l'EFFET (snapshot/restore de tous les sprites) par deep-clone (`data` répliqué en `Int16Array` = wrap s16 conservé). **INERTES** (savestate web = autre chemin JS ; aucun call-site) — fournies pour la complétude du miroir.

---

## NON-FAITS / réserves

- **Loops affines à MARQUEURS intercalés `LOOP(0)…LOOP(n)`** (battle_anim_effects/electric/psychic, object_event_anims, slot_machine) : le moteur `cmds` est **transcrit 1:1 mais INERTE** — aucune de ces anims « long tail » n'est enregistrée dans `sprite-affine-extras.ts` (registre = Battler Emerge/Return/Normal/Flipped + BallRotate, tous `frames[]+terminator`). Le chemin `cmds` n'a donc **pas été exercé en jeu** (dette : à valider au 1er consommateur qui enregistrera une anim `cmds`). Choix Règle 1 : transcrire le moteur complet + le laisser inerte plutôt qu'improviser un LOOP simplifié sur le modèle normalisé (qui ne peut pas coder les marqueurs).
- **SetOamMatrix** : consolidation par verrou-commentaire, PAS par délégation d'appel (cycle TDZ — cf. §5). L'invariant signé est déjà respecté ; la divergence `& 0xFFFF` de l'audit n'existe pas dans le code actuel.

## À RE-TESTER EN JEU (régression, moteur affine partagé)

1. **Zoom option Pokénav** (StartOptionZoom) — les 4 pièces AFFINE_DOUBLE+OBJ_BLEND (sensible aux fixes #4 tri + #2 jump + engine anchor branches).
2. **Anims affines combat** — send-out ball (`sAffineAnim_BallRotate_4` JUMP), Emerge/Return des mons (BeginAffineAnim/ContinueAffineAnim retouchés), Substitut/minimize.
3. **Pokéball throw** (rotation continue JUMP(0) = terminator JUMP, jumpTarget défaut 0).
4. **Intro GameFreak / légendaires** (gros sprites affine-double → tri #4).
5. **Healthbars / camion / naming screen** (subsprites #3 — parent non-affine, doit rester identique).
6. **Transitions de scène** (ResetSpriteData → ResetOamMatrices ajouté).
