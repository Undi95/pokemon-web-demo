# Unification `pokemon_animation.c` — plan (3 impls → 1)

But : **un seul** mirroir TS de `src/pokemon_animation.c` (décomp). Aujourd'hui 2 fichiers
(après dédup `8aeaa4a4`) :

- **A** = `src/pokemon_animation.ts` (nom décomp, flat) : ~65 anims, chemin OAM via
  `battle_anim_mons.ts` (`SetSpriteRotScale`/`Prepare`/`Reset` → `ObjAffineSet` bridge),
  callbacks plats `(sprite)=>void`, assume `sDontFlip=TRUE`. Orchestration
  `LaunchAnimationTaskForFrontSprite(spriteId, animName:string)` (COMBAT, `battle_main`) +
  `DoMonFrontSpriteAnimation` (BIRCH, `decomp-globals`) + `WaitAnimEnd` avec le flag
  frame-base `_monFrontBaseFrameReset` (fix « session 96 »). **VALIDÉ en jeu.**
- **C** = `src/engine/ui/mon-summary-anim.ts` (2011 l.) : **~151 anims** (le + complet),
  arithmétique entière C stricte, OAM via `SetOamMatrix`+`AllocOamMatrix`+`CalcCenterToCornerVec`,
  `objAffineSet` local, gère `sDontFlip` (flip) + `sIsSummaryAnim`. Sert le RÉSUMÉ
  (`summary-screen.ts` : `PokemonSummaryDoMonAnimation`/`StartMonSummaryAnimation`/
  `StopPokemonAnimations`/`StopPokemonAnimationDelayTask`/`HasTwoFramesAnimation`/`preloadFrontPicAnims`).

## Décision (2 agents Plan croisés, 2026-06-23)

**Canonique = C** (151 anims, le sur-ensemble). On y greffe l'orchestration de A. 5 points durs :

1. **`pb` OAM** : A fait `-(x·sin)>>8` (négation AVANT shift = **BIOS exact**, `decomp-bridge.ts:1593`),
   C fait `-((x·sin)>>8)` (écart 1 LSB quand pb<0). → corriger C sur la forme A. Sub-pixel mais 1:1.
   (Les matrices sont sinon **identiques** ; le 3e calcul « inversé » `(0x10000/scale)` n'est utilisé
   par AUCUN des deux pour les fronts.)
2. **`sIsSummaryAnim`** : doit être une **variable de contexte** (FALSE combat/Birch, TRUE résumé),
   pas `const true`. Le décomp la pose FALSE dans `Task_HandleMonAnimation` (pkmn_anim.c:927),
   TRUE dans `StartMonSummaryAnimation` (:952). Elle gate `ResetSpriteAfterAnim` (:1066) :
   - résumé (TRUE) : `hFlip` + `FreeOamMatrix` + `affineMode=OFF`.
   - combat (FALSE, branche `#ifdef BUGFIX else`) : `affineMode=NORMAL`, **pas** de free/flip
     → sinon **bug Wailord** (sprite coupé) ressuscite.
3. **`data[1]=1` (sDontFlip TRUE)** : le wrapper combat/Birch DOIT le poser avant de lancer
   (1:1 `Task_HandleMonAnimation`), sinon les anims de C négativent xScale → mon en miroir.
4. **frame-base reset** : préserver le flag `_monFrontBaseFrameReset` + `WaitAnimEnd` de A
   (sinon mon figé sur frame alt en Birch — déjà payé `fdbf4a8b`).
5. **`HasTwoFramesAnimation`** : double signature — A `(species:number)`, C `(speciesEnum:string)`.
   Garder les deux (ou une qui accepte les deux). `battle_main` appelle la version number.

Type `data` = `number[]` (PAS Int16Array, `decomp-runtime.ts:367`) — les deux masquent à la main,
neutre. ESM : garder l'accès **lazy** (`globalThis.__pokemonAnimation`, `getRuntime()`) pour éviter
le cycle `decomp-globals ↔ canonique` en TDZ.

## Staging (NE PAS casser combat/Birch validés en premier)

- **Étape 1 (FAIT)** — durcir C en interne, **neutre résumé** : fix `pb` BIOS ; `sIsSummaryAnim`
  → `let` ; `ResetSpriteAfterAnim` branché (branche résumé = exact actuel, branche combat dormante).
- **Étape 2** — greffer sur C les **wrappers combat/Birch DORMANTS** (signatures = A) :
  `LaunchAnimationTaskForFrontSprite(spriteId, animName)` (pose sIsSummaryAnim=FALSE + data[1]=1 +
  map nom→animId), `DoMonFrontSpriteAnimation`, `WaitAnimEnd`+flag frame-base, `Stop`/`Reset`.
  Rien câblé encore.
- **Étape 3** — basculer le **résumé** sur le canonique (juste l'emplacement) → A/B résumé.
- **Étape 4** — basculer **Birch** (`decomp-globals.ts:2915` + re-exports) → A/B squish Lotad.
- **Étape 5** — basculer **combat** (`__pokemonAnimation` / `battle_main`) → A/B send-out adverse
  + **Wailord** (régression c2c/affineMode) + un mon volant.
- **Étape 6** — supprimer A, renommer C → `src/pokemon_animation.ts`, unifier `HasTwoFramesAnimation`.

**A/B visuels obligatoires** : combat send-out (squish, pas de flip, Wailord OK) · Birch squish Lotad
(+ retour frame base) · résumé (mon animé + flip selon espèce + glow + delay Jirachi).

Source de vérité : `decomps/pokeemeraude/src/pokemon_animation.c` (`Task_HandleMonAnimation:911`,
`SetAffineData:984`, `HandleStartAffineAnim:1003`, `ResetSpriteAfterAnim:1061` + BUGFIX `:1077`) +
`pokemon.c` (`DoMonFrontSpriteAnimation:6779`, `PokemonSummaryDoMonAnimation:6826`).
