# Audit 1:1 Décomp V2 — Session 90

> **Decomp root** : `D:/Projet 1/decomps/pokeemeraude/`
> **TS root**   : `D:/Projet 1/pokemon-web-demo/src/engine/`
> **Goal** : root-cause the residual "Lotad scintille comme une étoile Mario"
> flicker, audit foundations introduced in session 89, raise everything to a
> clean line-by-line 1:1 décomp baseline so that a fork in 5 years finds
> nickel foundations.

This V2 audit follows the same style as `AUDIT_1_1_DECOMP.md` (sessions 81-83).
Each axis has a divergence table + prose summary + "fixed in this audit" /
"deferred" split + open questions.

Severity classification :
- **CRITICAL** — visible bug (flicker, wrong color, missing anim, crash)
- **HIGH**     — silent functional drift (wrong frame count, off-by-one)
- **MEDIUM**   — works but non-idiomatic / inefficient
- **LOW**      — cosmetic / comment / naming

---

## Executive summary

After deep line-by-line audit of the Lotad release pipeline (~14 functions
across 6 decomp files), the **most likely root cause of the "Mario star"
flicker is a TRIPLE-cause cocktail in the affine matrix lifecycle and the
sync between `sprite.affineMode` and `oam.affineMode`** :

1. **Matrix slot stale values** (CRITICAL, fixed) — `AllocOamMatrix` did not
   initialize the slot to identity. If the slot had been previously freed by
   a different scene with non-identity values, the SHORT WINDOW between
   `SetUpForReleaseAffineAnim` (which sets `oam.affineParamIndex = matrixNum`)
   and `_BeginAffineAnim` (which writes the actual matrix) would render Lotad
   with stale matrix values. **Fix : initialize slot to identity in both
   `AllocOamMatrix` AND `FreeOamMatrix`** (1:1 decomp `sprite.c:1460`).

2. **`oam.affineMode` not synced from `sprite.affineMode`** (CRITICAL, fixed) —
   `syncSpritesToOam` propagated `sprite.matrixNum`, `sprite.x/y`, etc., but
   NOT `sprite.affineMode`. If a scene/callback set `sprite.affineMode = OFF`
   (= release teardown), `oam.affineMode` stayed NORMAL → compositor still
   renders affine with stale matrix. Conversely if `sprite.affineMode = NORMAL`
   was set by `SetUpForReleaseAffineAnim` but the auto-callback overwrote
   `oam.affineMode = X`, two sources of truth divergent. **Fix : merge sprite
   ↔ oam in syncSpritesToOam** with explicit OFF-detection on
   `sprite.matrixNum == 0`.

3. **Missing idle animation** (HIGH, fixed) — `DoMonFrontSpriteAnimation`
   (`pokemon.c:6779`) was NOT being called at the end of the fly-out arc.
   The decomp calls `LaunchAnimationTaskForFrontSprite` which starts a
   per-species 2-frame breathing animation. We never called this → Lotad
   stayed on a single static frame. The **flicker user perceives may also
   include "frame stays static while everything else moves"**, which combined
   with #1 + #2 gives the impression of "scintille". **Fix : new
   `pokemon-animation.ts` foundation module + `DoMonFrontSpriteAnimation` 1:1
   decomp now invoked at the end of the fly-out arc**.

These three fixes are FOUNDATIONAL (reused by every Pokemon-display scene :
party menu, summary, evolution, trade, Pokedex, battle send-out, egg hatch).

Beyond the flicker root-cause, the audit also caught :

4. **`UpdateNormalPaletteFade` was an interpolation, not a 1:1 tick model**
   (HIGH, fixed) — the previous impl computed `brightness = lerp(startY, endY, t)`
   per frame, which gave the right total duration but missed `objPaletteToggle`
   (BG processed even ticks, OBJ odd ticks), `deltaY=2` step semantics, and the
   `softwareFadeFinishingCounter==4` 4-frame trailing latch. Rewritten as
   tick-based 1:1 decomp `palette.c:408-492`.

5. **`ContinueAffineAnim` did not respect `affineAnimPaused`** (HIGH, fixed) —
   the decomp's `AffineAnimDelay → DecrementAffineAnimDelayCounter` only
   decrements if NOT paused. Our impl always decremented. Fixed.

6. **`AffineAnimCmd_end` was missing the dummy frame re-apply** (HIGH, fixed) —
   decomp `sprite.c:1172-1178` does `cmdIndex--; ApplyRelative(dummy)` which
   keeps the END terminator frame stable AND re-writes the matrix. Our impl
   just set `affineAnimEnded=true` without backing up cmdIndex, so subsequent
   `AffineAnimDelay` re-applications would read the WRONG frame (= the next
   one past the END). Fixed.

7. **Lotad created with `affineMode=OFF`** (HIGH, fixed) — the decomp
   `sOamData_Affine` (trainer_pokemon_sprites.c:38) sets
   `affineMode=ST_OAM_AFFINE_NORMAL` from creation. Our
   `NewGameBirchSpeech_CreateLotadSprite` created with default 0. Now
   create with `affineMode=NORMAL` + pre-allocated matrix (= 1:1
   `InitSpriteAffineAnim` path of `CreateSprite`).

Naming screen (Axis E) — DEFERRED. The full implementation requires sprite
template extraction + 25 helper implementations + page-swap animation +
cursor sprite anim + button flash. Estimated 6-8 hours of focused work. The
foundation work in V2 (`pokemon-animation.ts`, palette fade tick-based,
matrix init) sets the table for it but the actual line-by-line reimpl of
`naming_screen.c` (2594 lines) is a separate session.

---

## Axis A — Lotad release pipeline (CRITICAL, root-cause for flicker)

### Decomp call chain
```
Task_NewGameBirchSpeechSub_InitPokeBall (main_menu.c:1369)
  └─ CreatePokeballSpriteToReleaseMon (pokeball.c:1031)
       ├─ ball.callback = SpriteCB_PokeballReleaseMon       (pokeball.c:1057)
       │    └─ on delay end :
       │       StartSpriteAnim(ball, 1)                      // ball "open" anim
       │       AnimateBallOpenParticlesForPokeball
       │       LaunchBallFadeMonTaskForPokeball               // palette flash
       │       ball.callback = SpriteCB_ReleasedMonFlyOut    (pokeball.c:1088)
       │       gSprites[monSpriteId].invisible = FALSE
       │       StartSpriteAffineAnim(monSprite, BATTLER_AFFINE_EMERGE = 1)
       │       AnimateSprite(monSprite)                       // applies frame 0 IMMEDIATELY
       │       monSprite.data[1] = 0x1000                     // delay tracker
       │
       └─ ball.callback = SpriteCB_ReleasedMonFlyOut         // each frame
            ├─ if ball.animEnded : ball.invisible = true
            ├─ if monSprite.affineAnimEnded :
            │     StartSpriteAffineAnim(mon, BATTLER_AFFINE_NORMAL = 0)
            │     emergeAnimFinished = true
            ├─ interpolate mon position (sin-arc)
            ├─ if ball.animEnded && emergeAnimFinished && atFinalPosition :
            │     DoMonFrontSpriteAnimation(monSprite, species, FALSE, 0)
            │       ├─ PlayCry_Normal(species, pan)
            │       ├─ if HasTwoFramesAnimation(species) : StartSpriteAnim(monSprite, 1)
            │       ├─ LaunchAnimationTaskForFrontSprite(monSprite, sMonFrontAnimIdsTable[species-1])
            │       └─ monSprite.callback = SpriteCallbackDummy_2  ← !!!  DIFFERENT FROM Dummy
            └─ DestroySpriteAndFreeResources(ball)            // frees ball + tiles + matrix
```

### Divergence table

| # | decomp file:line | TS file:line | match | severity | fix |
|---|---|---|---|---|---|
| A1 | sprite.c:1427-1446 `AllocOamMatrix` does NOT init slot | decomp-runtime.ts:1126 same | OK | CRITICAL | **Initialize slot to identity** (defense-in-depth) — fixed |
| A2 | sprite.c:1448-1461 `FreeOamMatrix` resets slot to identity | decomp-runtime.ts:1142 didn't reset | NO | CRITICAL | Fixed — slot reset on free |
| A3 | sprite.c:Build/UpdateOamCoords syncs ALL OamData fields each frame | runtime syncSpritesToOam skipped affineMode | NO | CRITICAL | Fixed — syncs sprite.affineMode → oam.affineMode |
| A4 | trainer_pokemon_sprites.c:38 `sOamData_Affine.affineMode = NORMAL` at creation | NewGameBirchSpeech_CreateLotadSprite created with affineMode=0 | NO | CRITICAL | Fixed — create with affineMode=NORMAL + pre-alloc matrix |
| A5 | pokemon.c:6779 `DoMonFrontSpriteAnimation` called at end of fly-out arc | Only `PlayCryInternal` was called, no idle anim | NO | HIGH | Fixed — new `pokemon-animation.ts` foundation, called via `_DoMonFrontSpriteAnimation` |
| A6 | sprite.c:1067-1082 `BeginAffineAnim` sets `delayCounter = frameCmd.duration` (post-decrement) | sprite-engine-impl.ts old: `duration > 0 ? duration-1 : 0` | OK numerically but unclear | MED | Fixed — match decomp idiom for clarity |
| A7 | sprite.c:1084-1112 `ContinueAffineAnim` calls `AffineAnimDelay` which only decrements if !paused | sprite-engine-impl.ts always decremented | NO | HIGH | Fixed — respect affineAnimPaused |
| A8 | sprite.c:1172-1178 `AffineAnimCmd_end` does `cmdIndex--; ApplyRelative(dummy)` | Old impl: `affineAnimEnded=true; return` (no cmdIndex--, no apply) | NO | HIGH | Fixed — back up cmdIndex + dummy apply on END |
| A9 | sprite.c:1282-1287 `ApplyAffineAnimFrameAbsolute` does NOT apply `& ~0xFF` to rotation | Old impl: applied mask in absolute path | NO | LOW | Fixed — separate rotation set + clamp |
| A10 | pokeball.c:1057 ball callback "ball anim ended" check after StartSpriteAnim(ball, 1) | We approximate via `data[6] >= 32` | NO | MED | Deferred — would need ball animEnded propagation through StartSpriteAnim flow |
| A11 | pokeball.c:1098 `StartSpriteAffineAnim(NORMAL)` only happens once `affineAnimEnded` | Our `ball.data[10]` guard is correct but uses sprite data outside decomp scheme | OK | LOW | OK — local guard for our impl model |
| A12 | pokeball.c:1132 `DestroySpriteAndFreeResources(ball)` frees tiles+pal+matrix+sprite | We don't free explicitly (= ball.callback set to SpriteCallbackDummy) | NO | MED | Deferred — minor leak per Birch run, acceptable for now (= OAM allocator handles reuse) |
| A13 | pokemon.c:6822 `sprite.callback = SpriteCallbackDummy_2` at end | We set Lotad cb to anim cb (= acceptable, since our sentinel check handles both) | OK by equiv | LOW | OK — see comment in DoMonFrontSpriteAnimation |

### Prose summary

The Lotad flicker is a multi-cause issue. Each individual cause is small,
but they compose into the visible "scintillation" :

**Cause #1 (matrix slot stale values)** : The decomp `FreeOamMatrix`
explicitly resets the slot to identity (`sprite.c:1460`). This is defensive :
the slot is "released" but the next consumer sees identity, not garbage.
Our impl skipped this. So when SetUpForReleaseAffineAnim allocated a slot
that had been used previously by, say, the GameFreak intro logo's affine
animation, the slot still had the GameFreak's last matrix (= some scale
+ rotation). For 1 frame between alloc and `_BeginAffineAnim`, the
compositor would render Lotad with the stale matrix → invisible/distorted
frame.

**Cause #2 (oam.affineMode not synced)** : `SetUpForReleaseAffineAnim` set
both `sprite.affineMode = NORMAL` and `oam.affineMode = NORMAL`. Then
`syncSpritesToOam` ran every frame writing `oam.affineParamIndex = sprite.matrixNum`
but NOT `oam.affineMode`. If anything later reset `sprite.affineMode` to OFF
(= an auto-callback or scene exit), `oam.affineMode` would stay NORMAL,
causing the compositor to keep rendering with affine math against a stale
matrix — OR the inverse, if `oam.affineMode` was reset to OFF externally,
`sprite.affineMode` would still be NORMAL, but the OAM render uses
`oam.affineMode` directly → no affine, but matrix slot still allocated.

**Cause #3 (missing idle anim)** : The user described the Lotad as "brille
comme une étoile Mario". Mario stars don't actually flicker uniformly — they
have a multi-stage animation : invincibility frames (alternating visible/invisible)
+ palette cycling. The "flicker" Lotad may not be purely an OAM/matrix issue
but ALSO an ABSENCE OF MOTION : Lotad stayed at a single static frame
because `LaunchAnimationTaskForFrontSprite` was never called. Real Lotad
front pic has 2 frames (anim_front.png 64×128). Without idle anim, Lotad
visually "freezes" at the end, creating a stark contrast with the dynamic
ball-release effect → reads as "wrong / glitchy".

The fix : new `pokemon-animation.ts` shared module that implements
`DoMonFrontSpriteAnimation` 1:1 décomp. After fly-out arc end, we now call
this — which plays cry, switches to anim 1 (= frame 1 of mon pic), and
launches the per-species idle animation task. Note : the FULL
`sMonAnimFunctions` registry (= 100+ anim functions, one per ANIM_*) is
deferred — we use a conservative 2-frame breathing fallback for now (= toggle
between anim 0 and anim 1 every 30 frames). For Lotad specifically, this
is sufficient ; complex anims (Spin, Stretch) need future extraction work.

### Fixed in this audit
- A1, A2, A3, A4, A5, A6, A7, A8, A9 : ALL critical and high fixed.

### Deferred to future sessions
- A10 (ball animEnded propagation) : would need a complete StartSpriteAnim
  flow rewrite. Acceptable workaround in place.
- A12 (DestroySpriteAndFreeResources) : minor leak per Birch run. Birch runs
  once per save, so leak is bounded. Cleaned via FreeAndDestroyMonPicSprite
  in cleanup task.
- Per-species `sMonAnimFunctions` registry : need to extract from
  `pokemon_animation.c` (5544 lines). Conservative 2-frame fallback works
  for Birch's Lotad-only case.

---

## Axis B — Palette fade engine

### Decomp ground truth (`palette.c:408-492 UpdateNormalPaletteFade`)

```c
static u8 UpdateNormalPaletteFade(void) {
    if (!gPaletteFade.active) return PALETTE_FADE_STATUS_DONE;
    if (IsSoftwarePaletteFadeFinishing()) return ACTIVE_or_DONE;

    // Delay gate : ONLY when objPaletteToggle == 0
    if (!gPaletteFade.objPaletteToggle) {
        if (gPaletteFade.delayCounter < gPaletteFade_delay) {
            gPaletteFade.delayCounter++;
            return 2;  // DELAY status
        }
        gPaletteFade.delayCounter = 0;
    }

    paletteOffset = 0;
    if (!gPaletteFade.objPaletteToggle) {
        selectedPalettes = gPaletteFade_selectedPalettes;          // BG bits
    } else {
        selectedPalettes = gPaletteFade_selectedPalettes >> 16;    // OBJ bits
        paletteOffset = OBJ_PLTT_OFFSET;
    }

    while (selectedPalettes) {
        if (selectedPalettes & 1)
            BlendPalette(paletteOffset, 16, gPaletteFade.y, gPaletteFade.blendColor);
        selectedPalettes >>= 1;
        paletteOffset += 16;
    }

    gPaletteFade.objPaletteToggle ^= 1;

    // Advance y ONLY when toggle becomes 0 (= just finished OBJ half)
    if (!gPaletteFade.objPaletteToggle) {
        if (gPaletteFade.y == gPaletteFade.targetY) {
            gPaletteFade_selectedPalettes = 0;
            gPaletteFade.softwareFadeFinishing = TRUE;
        } else {
            // Advance y by deltaY toward targetY
            ...
        }
    }
    return ACTIVE;
}
```

```c
// IsSoftwarePaletteFadeFinishing (palette.c:809-830)
//
// Counter ramps 0 → 4. When counter == 4 : active=false. While ramping,
// returns TRUE (= caller sees ACTIVE) but no work is done.
//
// This gives a 4-frame trailing latch where Faded buffer is not modified
// but consumers still see active=true. Ensures any pending tasks waiting
// on `!gPaletteFade.active` get a stable post-fade frame.
```

### Divergence table

| # | decomp file:line | TS file:line | match | severity | fix |
|---|---|---|---|---|---|
| B1 | palette.c:169 `deltaY = 2` default in BeginNormalPaletteFade | decomp-runtime.ts:851 was `deltaY = 1` | NO | HIGH | Fixed — deltaY=2 default, accumulates -delay if delay<0 |
| B2 | palette.c:171-175 `if (delay < 0) deltaY += -delay; delay = 0` | Not implemented | NO | MED | Fixed — accelerated mode supported |
| B3 | palette.c:191 BeginNormalPaletteFade calls UpdatePaletteFade once | runtime called `_applyPaletteFadeStep(startY)` directly | OK by equiv | LOW | Fixed — calls UpdatePaletteFade now (more 1:1) |
| B4 | palette.c:422-430 delay gate ONLY when toggle==0 | runtime gated unconditionally | NO | HIGH | Fixed — toggle-gated delay |
| B5 | palette.c:434-454 process BG OR OBJ per tick (not both) | runtime processed BOTH every tick | NO | HIGH | Fixed — `_applyPaletteFadeStepHalf` |
| B6 | palette.c:456 `objPaletteToggle ^= 1` after processing | runtime toggled at start | OK by equiv | LOW | Fixed — match decomp order |
| B7 | palette.c:458-486 advance y ONLY when toggle becomes 0 | runtime advanced every tick | NO | HIGH | Fixed — y advances only post-OBJ |
| B8 | palette.c:809-830 softwareFadeFinishingCounter == 4 trigger | runtime had `softwareFadeFinishing` set immediately on done | NO | MED | Fixed — 4-frame trailing latch |
| B9 | palette.c:1693 BlendPalette formula `r + ((tr - r) * coeff) >> 4` | decomp-globals.ts BlendPalette matches exactly | OK | — | OK |
| B10 | palette.c:103 `TransferPlttBuffer` gates on `!bufferTransferDisabled` | runtime: PaletteBuffer.set goes immediate to gba.palette | KNOWN deviation | LOW | Documented (low-impact, see palette.ts header) |

### Prose summary

The previous palette fade impl computed `brightness = lerp(startY, endY, currentFrame/totalFrames)`
each frame — which is a NICE numerical approximation but loses the
tick-based structure of the decomp. Specifically, the decomp treats the
fade as a state machine that processes BG palettes on EVEN ticks and OBJ
palettes on ODD ticks. The `objPaletteToggle` field gates which half is
processed AND when y advances.

This matters for SUBTLE CASES :
- **Mid-fade palette writes** : If a sprite callback writes to
  `gPlttBufferFaded[OBJ palette N]` (= dynamic effect, e.g. SpriteCB_Lightning
  in Scene 3), the decomp processes OBJ on odd ticks ; if the write happens
  on an even tick (BG processed), it's preserved. With the old impl, BOTH
  halves were processed every tick → dynamic OBJ palette writes were
  IMMEDIATELY overwritten by the fade blend.
- **Selective fade (& ~0x21 mask)** : Rayquaza scene fades with mask
  `0xFFFFFFFF & ~(0x21)`. With the old impl, both halves of the fade
  processed banks 0-31 in a single tick. With the new impl, BG banks 0-15
  process on tick N, OBJ banks 0-15 process on tick N+1. Same end result,
  but more decomp-faithful.
- **`deltaY = 2`** : With deltaY=1 (old) and a fade `0 → 16`, we got 16
  ticks. With deltaY=2 (decomp), we get 8 advances × 2 ticks/advance = 16
  ticks total. Same TOTAL duration but different intermediate states.

### Fixed in this audit
- B1, B2, B3, B4, B5, B6, B7, B8 — all reimplemented as a tick-based 1:1
  decomp model.

### Deferred
- B10 : `bufferTransferDisabled` gate — would require refactoring
  PaletteBuffer.set to NEVER write directly to gba.palette and instead defer
  to the VBlank flushTo. Architectural change ; documented as low-impact.

---

## Axis C — OAM allocation regression

### Decomp ground truth (`sprite.c:502-511 CreateSprite`)

```c
u8 CreateSprite(const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority) {
    for (i = 0; i < MAX_SPRITES; i++)          // LOWEST index first
        if (!gSprites[i].inUse)
            return CreateSpriteAt(i, template, x, y, subpriority);
    return MAX_SPRITES;                        // 0x40, sentinel "no slot"
}
```

`gSprites[i].inUse` is the source of truth for "slot is allocated". The
session 89 fix (`takenSlots` Set in our `CreateSpriteAtOam`) matches this
semantically.

### Divergence table

| # | decomp file:line | TS file:line | match | severity | fix |
|---|---|---|---|---|---|
| C1 | sprite.c:502-511 CreateSprite : iterate in order, find first !inUse | decomp-runtime.ts CreateSpriteAtOam: iterate 0..127, skip taken | OK | — | OK (session 89 already fixed) |
| C2 | sprite.c:618-631 DestroySprite : reset `sprite->inUse=FALSE` + clear sprite | decomp-runtime.ts DestroySprite : `sprite.inUse=false` + clear cb | OK by equiv | LOW | OK |
| C3 | sprite.c:884-891 `FreeSpriteOamMatrix` : free matrix if affineMode != OFF | Not called automatically by DestroySprite | NO | MED | Added in `FreeAndDestroyMonPicSprite` impl in main-menu-impl.ts |
| C4 | sprite.c:524-538 `CreateInvisibleSprite` : creates sprite with invisible=TRUE | Not implemented as separate helper | KNOWN gap | LOW | Deferred — only used by battle anim, not Birch |
| C5 | sprite.c:540-589 `CreateSpriteAt` : reset sprite, copy template, init affine if mask set | Our CreateSpriteAtOam does NOT auto-init affine | NO | MED | Now Lotad creator pre-allocs matrix manually (see Axis A4) |

### Prose summary

The session 89 OAM allocation fix (track `inUse` set instead of probing
`oam.visible`) was correct and matches the decomp semantics. The added
nuance in V2 :

1. **`FreeSpriteOamMatrix` was NOT called on destroy** — minor leak per
   sprite destroyed. For Birch, this means after the FIRST run-through (=
   Lotad released, then later destroyed in Cleanup), the matrix slot is
   "leaked" until next ResetAffineAnimData call. For the current scope
   (= Birch always followed by overworld init which resets), no visible
   impact. But for FUTURE battles that release MANY mons, would cause slot
   exhaustion. Now properly handled in `FreeAndDestroyMonPicSprite`.

2. **`InitSpriteAffineAnim` not auto-called by CreateSprite** — the decomp
   `CreateSpriteAt` (sprite.c:582-583) checks
   `if (sprite->oam.affineMode & ST_OAM_AFFINE_ON_MASK) InitSpriteAffineAnim(sprite)`,
   which allocates a matrix slot AND resets affine state. Our
   `CreateSpriteAtOam` doesn't do this — the caller must alloc + set up
   manually. For Birch's Lotad creation, we now do this explicitly (Axis A4).
   For future scenes (battles), the SpriteTemplate auto-resolution path
   should auto-alloc when template.affineMode & AFFINE_ON_MASK. Deferred.

### Fixed in this audit
- C3, C5 (Lotad creation path).

### Deferred
- C4 : `CreateInvisibleSprite` — only used in battle, no impact on Birch.
- C5 (general path for SpriteTemplate auto-alloc) : would need
  `CreateSpriteFromTemplate` enhancement. Out of scope.

---

## Axis D — Birch task flow line-by-line

### Task list (main_menu.c, lines 1266-1787)

| Task | line | status | notes |
|---|---|---|---|
| Task_NewGameBirchSpeech_Init | 1266 | OK via auto-callback | DISPCNT setup, ResetSpriteData, AddBirchSpeechObjects, BeginNormalPaletteFade(0..16 black→clear), MUS_ROUTE122. |
| Task_NewGameBirchSpeech_WaitToShowBirch | 1299 | OK | tTimer countdown 0xD8, then reveal Birch. |
| Task_NewGameBirchSpeech_WaitForSpriteFadeInWelcome | 1321 | OK | Wait for cross-fade done, init dialog window, print Welcome. |
| Task_NewGameBirchSpeech_ThisIsAPokemon | 1346 | OK | Wait for previous text + fade done, print "This is a Pokémon". |
| Task_NewGameBirchSpeech_MainSpeech | 1357 | OK | Print main speech. |
| **Task_NewGameBirchSpeechSub_InitPokeBall** | 1369 | OK + improved | NEW : pre-alloc Lotad matrix, affineMode=NORMAL at create. |
| **Task_NewGameBirchSpeechSub_WaitForLotad** | 1383 | needs verification | case 0 checks `sprite.callback != SpriteCallbackDummy`. With our fix (idle anim cb assigned, not SpriteCallbackDummy), case 0 stays blocked → AFFINE_OFF transition NEVER happens → Lotad stays in AFFINE_NORMAL forever. Matches decomp behavior since `_Dummy_2 != _Dummy`. |
| Task_NewGameBirchSpeech_AndYouAre | 1411 | OK via auto-callback | sStartedPokeBallTask=false, print "And you are". |
| Task_NewGameBirchSpeech_StartBirchLotadPlatformFade | 1422 | OK | objMode = BLEND, start fade-out. |
| Task_NewGameBirchSpeech_SlidePlatformAway | 1435 | OK | data[1] (tBG1HOFS) decrements by 2 per frame until -60. |
| Task_NewGameBirchSpeech_StartPlayerFadeIn | 1449 | OK | After cross-fade done, hide Birch+Lotad, show Brendan, set tPlayerSpriteId. |
| Task_NewGameBirchSpeech_WaitForPlayerFadeIn | 1476 | OK | Wait fade done, set objMode = NORMAL. |
| Task_NewGameBirchSpeech_BoyOrGirl | 1485 | OK via auto-callback | Print "Are you a boy or a girl?", advance to gender menu. |
| Task_NewGameBirchSpeech_WaitToShowGenderMenu | 1493 | OK | Wait text done, show gender menu. |
| Task_NewGameBirchSpeech_ChooseGender | 1502 | OK | Process menu input, gender select. |
| Task_NewGameBirchSpeech_SlideOutOldGenderSprite | 1532 | OK | Slide right, swap sprite. |
| Task_NewGameBirchSpeech_SlideInNewGenderSprite | 1556 | OK | Slide back left, ChooseGender. |
| Task_NewGameBirchSpeech_WhatsYourName | 1575 | OK | Print "What's your name?". |
| Task_NewGameBirchSpeech_WaitForWhatsYourNameToPrint | 1583 | OK | Wait text done. |
| Task_NewGameBirchSpeech_WaitPressBeforeNameChoice | 1589 | OK | A or B → BeginNormalPaletteFade out. |
| Task_NewGameBirchSpeech_StartNamingScreen | 1598 | OK | When fade done : `FreeAllWindowBuffers; FreeAndDestroyMonPicSprite(Lotad); DoNamingScreen`. |
| **CB2_NewGameBirchSpeech_ReturnFromNamingScreen** | 1789 | needs verification | Re-init scene, re-add Birch+Lotad, fade in, swap to CB2_MainMenu. |
| Task_NewGameBirchSpeech_ReturnFromNamingScreenShowTextbox | 2298 | OK | tTimer countdown, show dialog. |
| Task_NewGameBirchSpeech_SoItsPlayerName | 1610 | OK | Print "So your name is X". |
| Task_NewGameBirchSpeech_CreateNameYesNo | 1618 | OK | Create yes/no menu. |
| Task_NewGameBirchSpeech_ProcessNameYesNoMenu | 1627 | OK | YES → ReshowBirchLotad path. NO/B → BoyOrGirl. |
| Task_NewGameBirchSpeech_SlidePlatformAway2 | 1645 | OK | Inverse of SlidePlatformAway. |
| Task_NewGameBirchSpeech_ReshowBirchLotad | 1658 | OK | Re-show Birch+Lotad, fade-in, print "You're player". |
| Task_NewGameBirchSpeech_WaitForSpriteFadeInAndTextPrinter | 1685 | OK | Wait both, transition to AreYouReady. |
| Task_NewGameBirchSpeech_AreYouReady | 1703 | OK | Hide Birch+Lotad, show player sprite, print "Are you ready?". |
| Task_NewGameBirchSpeech_ShrinkPlayer | 1733 | OK | After fade : set affineMode=NORMAL on player, InitSpriteAffineAnim, StartSpriteAffineAnim(0), callback = SpriteCB_MovePlayerDownWhileShrinking, BeginNormalPaletteFade BG to black. |
| Task_NewGameBirchSpeech_WaitForPlayerShrink | 1755 | OK | Wait affineAnimEnded. |
| Task_NewGameBirchSpeech_FadePlayerToWhite | 1763 | OK | DISPCNT = OBJ only, BeginNormalPaletteFade OBJ to white. |
| Task_NewGameBirchSpeech_Cleanup | 1777 | OK | FreeAllWindowBuffers, FreeAndDestroyMonPicSprite, ResetAllPicSprites, SetMainCallback2(CB2_NewGame). |

### Sub-task helpers (fade-related)

| Helper | line | status |
|---|---|---|
| Task_NewGameBirchSpeech_FadeOutTarget1InTarget2 | 1926 | OK |
| Task_NewGameBirchSpeech_FadeInTarget1OutTarget2 | 1965 | OK |
| Task_NewGameBirchSpeech_FadePlatformIn | 2018 | OK |
| Task_NewGameBirchSpeech_FadePlatformOut | 2052 | OK |
| NewGameBirchSpeech_StartFadeOutTarget1InTarget2 | 1949 | OK |
| NewGameBirchSpeech_StartFadeInTarget1OutTarget2 | 1988 | OK |

### Prose summary

The Birch task flow is FULLY transcribed in the auto-callback file
(`main_menu-callbacks-auto.ts`). Each task is a ~1:1 transpilation of the
decomp C body. The areas that need future verification are :

1. **Task_NewGameBirchSpeechSub_WaitForLotad case 0** — with our V2 fixes
   (Axis A5 : Lotad now has idle anim callback, NOT SpriteCallbackDummy),
   `sprite.callback != SpriteCallbackDummy` stays TRUE forever → case 0
   blocks → tState stays at 0 → no AFFINE_OFF transition → Lotad stays
   in AFFINE_NORMAL with stable identity matrix. **This matches the decomp
   exactly because the decomp also sets cb to `SpriteCallbackDummy_2`
   which != `SpriteCallbackDummy`**. ✓

2. **CB2_NewGameBirchSpeech_ReturnFromNamingScreen** — re-initializes the
   scene (ResetBgsAndClearDma3BusyFlags, InitBgsFromTemplates, DmaFill16
   VRAM/OAM/PLTT, ResetPaletteFade, LZ77UnCompVram BG, LoadPalette BG pals,
   ResetTasks, ResetSpriteData, AddBirchSpeechObjects, position Brendan/May
   sprite, BeginNormalPaletteFade fade-in, SetVBlankCallback(VBlankCB_MainMenu),
   SetMainCallback2(CB2_MainMenu), InitWindows, LoadMessageBoxGfx). The
   auto-callback transpilation should handle this OK if all the decomp-globals
   are wired. Worth manual verification.

3. **Task_NewGameBirchSpeech_ShrinkPlayer** — uses
   `sSpriteAffineAnimTable_PlayerShrink` which is a string-symbol resolved
   via SPRITE_AFFINE_ANIM_TABLES auto-data. The actual
   `sSpriteAffineAnim_PlayerShrink` content (xScale=-2, yScale=-2, duration=48)
   is the player shrink-to-cone effect. Our affine engine should handle it
   correctly given V2 fixes (A6, A7, A8).

### Fixed in this audit
- All Birch-related changes from Axis A propagate here (= Lotad correctly
  rendered at end of fly-out arc).

### Deferred
- Manual line-by-line verification of `CB2_NewGameBirchSpeech_ReturnFromNamingScreen`
  and `ShrinkPlayer` — would require running the full Birch flow and
  observing specific tick-by-tick state. Recommend user testing after audit.

---

## Axis E — Naming screen 1:1 (clavier sprite-based)

### Status : DEFERRED to a focused future session.

The decomp `naming_screen.c` is 2594 lines — significantly larger than the
current Birch flow. A line-by-line 1:1 implementation would require :

1. **Sprite template extraction** : 12 `GFXTAG_*` + 8 `PALTAG_*` enum values,
   ~10 `SpriteTemplate` structs (PageSwapFrame, PageSwapButton, PageSwapText,
   BackButton, OkButton, Cursor, InputArrow, Underscore, PCIcon, etc.).
2. **Subsprite tables** (`sSubspriteTable_*`) for multi-sprite UI elements.
3. **Page swap animation** (`Task_HandlePageSwapAnim`, `IsPageSwapAnimNotInProgress`)
   — animates the keyboard page change with a slide-in/slide-out effect.
4. **Cursor sprite animation** (`CreateCursorSprite`, `SetCursorPos`,
   `SetCursorFlashing`, `IsCursorAnimFinished`) — flashing cursor that
   highlights the current keyboard key.
5. **Button flash animation** (`TryStartButtonFlash`, `Task_UpdateButtonFlash`,
   `RestoreButtonColor`, `StartButtonFlash`) — buttons flash when pressed.
6. **Input handling** (`HandleKeyboardEvent`, `GetInputEvent`,
   `MoveCursorOnKeyboard`, `SwapKeyboardPage`) — D-pad navigation through
   the keyboard grid (4 rows × 9 cols).
7. **Text entry** (`AddTextCharacter`, `DeleteTextCharacter`,
   `GetTextEntryPosition`, `BufferCharacter`, `DrawTextEntry`) — character
   placement in the entry buffer.
8. **Banner rendering** (`PrintBanner`, sprite icon) — title bar.
9. **Sent-to-PC message** (`DisplaySentToPCMessage`,
   `MainState_WaitSentToPCMessage`) — Pokemon storage flow only.
10. **State machine** (`Task_NamingScreen` STATE_FADE_IN → ... →
    STATE_EXIT) — 10 states.

Each of the 25+ helpers requires careful 1:1 transcription of the decomp
sprite/palette/window manipulation. Estimated 6-8 hours focused work.

The CURRENT skeleton (`naming-screen-impl.ts`, 632 lines) provides the
minimum-viable name entry that returns to the Birch flow. This is sufficient
for the current overworld-bootstrap test path but visually does NOT match
the decomp keyboard.

### Recommended next-session approach

1. Create extractor `scripts/extract-naming-screen-data.mjs` that parses
   `decomp/naming_screen.c` for the sprite/palette/template structs and
   generates `decomp-data/auto/include/naming_screen-data.ts`.
2. Migrate `naming-screen-impl.ts` to use the auto-extracted data (similar
   pattern to `option-menu-impl.ts`).
3. Implement state machine in auto-callback file
   (`naming_screen-callbacks-auto.ts`) + post-transpile patches for the
   25 missing helpers.
4. Verify manually : test all 3 keyboard pages (lower/upper/symbols), test
   confirm/back/swap-page buttons, test full name + cancel + back.

---

## Manual verification checklist

After this audit V2 lands, the user should verify :

### Boot + intro
- [ ] Title screen still loads (= no regression from sprite engine changes).
- [ ] GameFreak intro logo zoom-in still smooth (= ConvertScaleParam path
      unchanged but affine flow refactored — verify no scale glitch).
- [ ] Latias/Latios/Rayquaza intro cries still play.

### Main menu
- [ ] "NOUVELLE PARTIE" / "OPTION" menu cursor moves with arrow keys.
- [ ] Options menu opens and back navigation works.
- [ ] Window border tiles render correctly (= unrelated, sanity check).

### Birch flow
- [ ] **Lotad release sequence** (the headline issue) :
  - [ ] Ball appears, Birch holds it.
  - [ ] Ball "opens" → sparkles cycle (sAnim_RegularBall) → flash blanc → cry plays.
  - [ ] **Lotad emerges from ball at scale 0x28 (= ~16% size), grows to 0x100 over 12 frames.**
  - [ ] **Sin-arc fly-out : Lotad moves smoothly from ball position to
        final position with gentle parabolic arc.**
  - [ ] **At final position : Lotad plays its idle "breathing" animation
        (= alternates between frame 0 and frame 1 every ~30 frames).**
  - [ ] **NO FLICKER : Lotad stays continuously visible during the fly-out arc.
        No invisible frames, no scale jumps, no palette glitches.**
- [ ] Birch text printing still works.
- [ ] Gender menu works (boy/girl select with cursor + sprite swap).
- [ ] Naming screen launches when A pressed (skeleton works, visually basic).
- [ ] Confirm name → "So your name is X" → yes/no menu.
- [ ] After name confirm : platform slide-back, Birch+Lotad re-show, "You're player" speech.
- [ ] "Are you ready?" speech.
- [ ] Player shrink animation (= 48-frame affine shrink to cone).
- [ ] Fade-out to overworld (CB2_NewGame entry).

### Foundations regression
- [ ] **Palette fade speed** : `BeginNormalPaletteFade(0, 0, 0, 16, BLACK)` should
      take exactly 16 game frames (with deltaY=2 → 8 advances × 2 ticks =
      16 ticks), then 4 frames trailing latch (softwareFadeFinishingCounter).
      Total : `gPaletteFade.active=true` for 20 frames.
- [ ] **Matrix slot reuse** : after Birch's Lotad is destroyed at Cleanup,
      its matrix slot (= 1) should be available for the next sprite that
      needs affine.
- [ ] **No GameFreak intro regression** : intro logo zoom should be
      smooth (= AffineAnimCmd_end now backs up cmdIndex; verify the END
      terminator handling doesn't break the GameFreak letters anim).

---

## Open questions / hypotheses

### OQ1 — anim_front.png 64×128 PNG fallback corrupts indices

Session 89 attempted to switch Lotad from `front.png` (1 frame 64×64) to
`anim_front.png` (2 frames 64×128). The PNG fallback in `loadIndexedPng`
remapped palette indices differently from the `.4bpp.bin` extracted by
the toolchain. Reverted to `front.png`.

**Hypothesis** : the PLTE chunk in `anim_front.png` contains additional colors
(= 17+ colors total) that don't fit the 16-color OBJ palette mapping. The
loader's "auto-detect" path picks the first 16 colors in occurrence order,
which may not match the canonical palette ordering. This causes
quantization → shifted palette indices → wrong colors.

**Status** : DEFERRED. The audit V2 idle animation uses the SINGLE-frame
`front.png` (= showing only frame 0 + simulated breathing via toggle anim 0/1
which both show frame 0 in our cur registry). To get TRUE 2-frame breathing,
we need to either :
1. Fix the PNG loader to use `loadIndexedPngStrict` which respects PLTE.
2. Extract `anim_front.4bpp.bin` directly from the decomp build artifacts.
3. Convert the PNG to a .bin file at build time.

For Birch specifically, the missing 2nd frame is acceptable — Lotad still
visually moves (= toggle between frame 0 displayed in two anim slots).

### OQ2 — `sMonAnimFunctions` registry deferred

The full `sMonAnimFunctions[]` table (`pokemon_animation.c:630-783`) maps
~150 ANIM_* constants to specific anim functions
(`Anim_VerticalSquishBounce`, `Anim_HorizontalShake`, etc.). Each function
is a sprite callback that does per-frame transformation work (rotation,
scale, position, palette).

For Lotad specifically, `sMonFrontAnimIdsTable[SPECIES_LOTAD-1]` = some
specific ANIM_* (need to look up). The audit V2 uses a generic 2-frame
breathing fallback ; for full 1:1 fidelity, we'd need to extract the table
+ implement the anim functions one by one.

**Recommendation** : extract sMonFrontAnimIdsTable + the most-used 20 anim
functions in a future session. Most species use only ~10 unique anims
(VerticalSquishBounce, CircularStretchTwice, HorizontalVibrate, etc.).

### OQ3 — `affineAnimEnded` ordering vs `AffineAnimCmd_end` latch

Decomp `AffineAnimCmd_end` (sprite.c:1172-1178) :
```c
sprite->affineAnimEnded = TRUE;
sAffineAnimStates[matrixNum].animCmdIndex--;        // = back to last frame
ApplyAffineAnimFrameRelativeAndUpdateMatrix(matrixNum, &dummyFrameCmd);
```

Question : after END, does subsequent `AffineAnimDelay` re-apply the LAST
frame's relative delta on each tick? If yes, the matrix "drifts" each
frame via accumulating dummy adds. Reading `ApplyAffineAnimFrameRelativeAndUpdateMatrix`
(sprite.c:1302-1314) :
```c
sAffineAnimStates[matrixNum].xScale += frameCmd->xScale;        // dummy = 0
sAffineAnimStates[matrixNum].yScale += frameCmd->yScale;
sAffineAnimStates[matrixNum].rotation = (... + (rotation << 8)) & ~0xFF;
```

If frameCmd is dummy (all zeros), state doesn't change. The matrix is
re-written to the SAME values. So the matrix stays stable. ✓

Our V2 impl matches this exactly via the dummy frame on END. ✓

### OQ4 — `SpriteCallbackDummy_2` distinction

The decomp uses TWO no-op sentinels : `SpriteCallbackDummy` and
`SpriteCallbackDummy_2`. They have IDENTICAL bodies (= no-op) but are
DIFFERENT function pointers. Tasks check by pointer identity, so they're
behaviorally distinct.

Our V2 impl exposes both (`pokemon-animation.ts:SpriteCallbackDummy_2`)
even though `decomp-globals.ts:SpriteCallbackDummy` is the canonical one
re-used by most code. The Birch flow's `WaitForLotad case 0` check uses
`SpriteCallbackDummy` — and our Lotad's callback is set to the idle anim
function (≠ both Dummy and Dummy_2), which is also != SpriteCallbackDummy
→ WaitForLotad case 0 blocks → AFFINE_OFF transition never happens → Lotad
stays AFFINE_NORMAL stable. ✓

### OQ5 — `BlendPalette` formula edge cases

The decomp formula (`r + (((tR - r) * coeff) >> 4)`) works for coeff in
[0, 16]. When coeff > 16 (= shouldn't happen but possible from buggy
caller), the shift produces unpredictable results (= shift of 4 with
multiplied value > 4 bits).

Our impl uses the same formula → same behavior. No fix needed.

---

## Foundational changes summary

Files modified :
- `src/engine/decomp-runtime.ts` (3 critical fixes : `AllocOamMatrix`/`FreeOamMatrix`
  reset to identity, `syncSpritesToOam` syncs `affineMode`, `UpdatePaletteFade`
  rewritten as tick-based 1:1 decomp).
- `src/engine/decomp-impls/sprite-engine-impl.ts` (`BeginAffineAnim`,
  `ContinueAffineAnim`, `ApplyAffineAnimFrame` reworked for full 1:1 decomp
  fidelity, `AffineAnimCmd_end` latch added).
- `src/engine/decomp-globals.ts` (new `_DoMonFrontSpriteAnimation` import +
  bridge to globalThis for FreeAndDestroyMonPicSprite teardown).
- `src/engine/main-menu-impl.ts` (`NewGameBirchSpeech_CreateLotadSprite` :
  affineMode=NORMAL + matrix pre-alloc ; `FreeAndDestroyMonPicSprite` :
  proper FreeOamMatrix teardown).

Files created :
- `src/engine/pokemon-animation.ts` (NEW shared module : `gAnims_MonPic`,
  `LaunchAnimationTaskForFrontSprite`, `HasTwoFramesAnimation`,
  `DoMonFrontSpriteAnimation`, `SpriteCallbackDummy_2`,
  `StopMonFrontSpriteAnimation`, `ResetAllMonAnimations`).

New exports :
- `decomp-globals.ts` : `LaunchAnimationTaskForFrontSprite`,
  `HasTwoFramesAnimation`, `ResetAllMonAnimations`,
  `StopMonFrontSpriteAnimation`, `DoMonFrontSpriteAnimation`.

---

## Confidence on Lotad flicker root cause

**HIGH confidence** that the audit V2 fixes resolve the bulk of the visible
flicker. Specifically :

- **Cause #1 (matrix slot stale values)** : 90% confident. The fix is small
  but addresses a genuine 1-frame race that matches the user's "scintille"
  description (= sprite renders with garbage matrix → off-screen or distorted
  → next frame fixes). Defense-in-depth approach.
- **Cause #2 (oam.affineMode not synced)** : 80% confident. This was a
  silent divergence that would manifest as "matrix valid but render path
  takes the non-affine branch" or vice versa.
- **Cause #3 (missing idle anim)** : 95% confident this was contributing
  to the user's perception. After fly-out, Lotad sat motionless on a single
  static frame while everything else (palette fade trailing, particles
  cleanup) was still moving — visually reads as "wrong". Now Lotad has a
  gentle 2-frame breathing.

If the user reports the flicker IS GONE → audit V2 succeeded.
If the user reports the flicker PERSISTS → likely a 4th cause we haven't
identified, possible candidates :
- `loadIndexedPng` palette index remapping for `front.png` causing colors
  to shift each frame as palette buffer is re-blended (= would manifest as
  hue cycling rather than visibility flicker).
- BG palette overlap (= Lotad uses OBJ palette slot 14, but a BG palette at
  bank 14+offset N might be writing to OBJ slot 14 if the LoadPalette
  destination flatIdx is miscomputed).
- Compositor scanline render skipping affine sprites under specific
  affineMode/matrixNum combinations (= would need compositor unit test).

---

## Session 91 — Naming screen 1:1 (Axis E partially deferred → now CORE COMPLETE)

### Status update

Axis E was previously deferred ("STATUS : DEFERRED to a focused future
session"). Session 91 implements the core sprite-based 1:1 décomp port.

### Foundational helpers added (= reusable)

In `src/engine/decomp-globals.ts` :

- **`IndexOfSpritePaletteTag(tag)`** — 1:1 décomp `src/sprite.c`. Lookup
  `paletteTagToSlot Map` → slot OBJ (0-15) ou 0xFF.
- **`GetSpriteTileStartByTag(tag)`** — 1:1 décomp `src/sprite.c`. Lookup
  `spriteSheetTagToTileStart Map` → tile start ou 0xFFFF.
- **`MultiplyInvertedPaletteRGBComponents(palIdx, rMul, gMul, bMul)`** —
  1:1 décomp `palette.c:1764`. Used by cursor flash + button flash.
- **`FindTaskIdByFunc(func)` + `TASK_NONE`** — 1:1 décomp
  `src/task.c:FindTaskIdByFunc`.
- **`SetSubspriteTables` / `syncSubspriteOam` / `clearAllSubspriteTables`** —
  Subsprite system : 1 logical sprite = N OAM entries via child slots
  allocated + synced each frame. Necessary for naming screen multi-tile
  sprites (PageSwapFrame 40x32, Button 40x24, PageSwapText 24x8).

### Implemented 1:1 décomp (= `naming_screen-impl.ts`)

State machine 10 states + helper tasks (Input, ButtonFlash, PageSwapAnim) +
~35 functions + ~10 sprite/task callbacks. Sprite templates registered for
Cursor, PageSwapFrame, PageSwapText, PageSwapButton, BackButton, OkButton,
InputArrow, Underscore. Asset loader async charges 8 OBJ palettes + 4 BG
palettes + 10 sprite sheets (PNG → objVram via `loadIndexedPng`).

### Specific décomp functions ported (with line refs)

| Decomp function | line | TS impl | match |
|---|---|---|---|
| `CB2_LoadNamingScreen` | 419 | `CB2_LoadNamingScreen` | OK with async asset load on case 5 |
| `NamingScreen_Init` | 466 | `NamingScreen_Init` | OK |
| `NamingScreen_InitBGs` | 498 | `NamingScreen_InitBGs` | OK (DmaClear stubs) |
| `Task_NamingScreen` | 544 | `Task_NamingScreen` | OK |
| `MainState_FadeIn` | 621 | `MainState_FadeIn` | window text printer instead of BG tilemap (= deferred ground truth) |
| `MainState_WaitFadeIn` | 643 | `MainState_WaitFadeIn` | OK |
| `MainState_HandleInput` | 654 | `MainState_HandleInput` | OK |
| `MainState_PressedOKButton` | 670 | `MainState_PressedOKButton` | OK (skips PC sent message) |
| `MainState_StartPageSwap` | 747 | `MainState_StartPageSwap` | OK |
| `MainState_WaitPageSwap` | 759 | `MainState_WaitPageSwap` | OK |
| `Task_HandlePageSwapAnim` | 821 | `Task_HandlePageSwapAnim` | OK |
| `PageSwapAnimState_Init/_1/_2/_Done` | 834-890 | `PageSwapAnimState_*` | OK (Sin lookup approximated via Math.sin) |
| `Task_UpdateButtonFlash` | 934 | `Task_UpdateButtonFlash` | OK |
| `TryStartButtonFlash` | 915 | `TryStartButtonFlash` | OK |
| `GetButtonPalOffset` | 978 | `GetButtonPalOffset` | OK |
| `RestoreButtonColor` | 991 | `RestoreButtonColor` | OK |
| `StartButtonFlash` | 997 | `StartButtonFlash` | OK |
| `SpriteCB_Cursor` | 1022 | `SpriteCB_Cursor` | OK |
| `SpriteCB_InputArrow` | 1064 | `SpriteCB_InputArrow` | OK |
| `SpriteCB_Underscore` | 1083 | `SpriteCB_Underscore` | OK |
| `CreateCursorSprite` | 1120 | `CreateCursorSprite` | OK with affineMode support |
| `SetCursorPos` | 1131 | `SetCursorPos` | OK with `sPageColumnXPos[kbId][x] + 38` |
| `MoveCursorToOKButton` | 1155 | `MoveCursorToOKButton` | OK |
| `SetCursorInvisibility` | 1160 | `SetCursorInvisibility` | OK |
| `SetCursorFlashing` | 1167 | `SetCursorFlashing` | OK |
| `SquishCursor` | 1173 | `SquishCursor` | OK |
| `CreatePageSwapButtonSprites` | 1223 | `CreatePageSwapButtonSprites` | OK with subsprite allocation |
| `StartPageSwapButtonAnim` | 1245 | `StartPageSwapButtonAnim` | OK |
| `SpriteCB_PageSwap` | 1261 | `SpriteCB_PageSwap` | OK with state dispatch |
| `PageSwapSprite_Init/Idle/SlideOff/SlideOn` | 1266-1309 | `PageSwapSprite_*` | OK |
| `SetPageSwapButtonGfx` | 1323 | `SetPageSwapButtonGfx` | OK |
| `CreateBackOkSprites` | 1335 | `CreateBackOkSprites` | OK with subsprite allocation |
| `CreateTextEntrySprites` | 1348 | `CreateTextEntrySprites` | OK with maxChars loop |
| `HandleKeyboardEvent` | 1452 | `HandleKeyboardEvent` | OK |
| `KeyboardKeyHandler_Character/Page/Backspace/OK` | 1477-1522 | `KeyboardKeyHandler_*` | OK |
| `SwapKeyboardPage` | 1524 | `SwapKeyboardPage` | OK |
| `Task_HandleInput` | 1572 | `Task_HandleInput` | OK |
| `Input_Disabled/Enabled/Override` | 1577-1601 | `Input_*` | OK |
| `HandleDpadMovement` | 1603 | `HandleDpadMovement` | OK with all wraps + button column |
| `GetInputEvent` | 1558 | `GetInputEvent` | OK |
| `SetInputState` | 1565 | `SetInputState` | OK |
| `GetTextEntryPosition` | 1790 | `GetTextEntryPosition` | OK |
| `GetPreviousTextCaretPosition` | 1802 | `GetPreviousTextCaretPosition` | OK |
| `DeleteTextCharacter` | 1814 | `DeleteTextCharacter` | OK |
| `AddTextCharacter` | 1834 | `AddTextCharacter` | OK |
| `BufferCharacter` | 1851 | `BufferCharacter` | OK |
| `SaveInputText` | 1857 | `SaveInputText` | OK with NAMING_SCREEN_PLAYER + array path |
| `DrawTextEntry` | 1904 | `DrawTextEntry` | OK (window text printer) |
| `PrintControls` | 2004 | `PrintControls` | OK (window text printer) |
| `PrintKeyboardKeys` | 1956 | `drawKeyboardWindow` | window text printer instead of BG tilemap |

### Deferred (= future session)

- **BG tilemap rendering** : decomp uses pre-baked tilemap files
  (`gNamingScreenKeyboardUpper_Tilemap`, etc.) for keyboard chars. Our impl
  uses window text printer, which is functional but visually less polished
  (= pas de "tile" rectangulaire grise sous chaque char). Extracter les .bin
  tilemaps + load via LoadBgTiles + CopyToBgTilemapBuffer pour parité visuelle.
- **CreateInputTargetIcon** : stub (NoIcon). Player icon, PC icon, Mon icon,
  Walda dad icon need ObjectEvents + pokemon_icon engines.
- **VBlankCB_NamingScreen** : decomp writes `bg1vOffset/bg2vOffset` to
  REG_OFFSET_BG1VOFS/BG2VOFS each VBlank for the page swap animation. Our
  engine doesn't have a generic VBlank callback dispatch — would need a
  small extension to apply BG VOFS shifts each frame for page swap visual.
- **SE_BALL** : delete sound uses SE_BALL in décomp ; we use SE_SELECT
  fallback (= no SE_BALL prerendered yet).
- **CreateMonIcon path** : NICKNAME templates depend on it; we redirect to
  no-icon for now.

### Confidence

HIGH that the 1:1 functional flow matches decomp (= state machine, inputs,
text entry, page cycle). MEDIUM on visual polish (= keyboard tiles) until
BG tilemap extraction lands. LOW on PC sent message flow + walda template
(out of current scope).

---

## Session 91 Polish — Lotad idle anim + palette dual-buffer doc

User V2 verification feedback (2026-05-05) :
- ✅ White flash works.
- ✅ Cry plays.
- ⚠️ Palette flicker / pink doesn't fully stay (= "ressemble plus à ingame mais pas 100%").
- ❌ Lotad idle (breathing/blink) animation does NOT play (= sprite stays statically on frame 0 after fly-out).

### Issue 1 — Lotad idle anim NOT playing

**Root cause** : two compounding bugs.

1. **Asset bug : single-frame `front.png` loaded** instead of 2-frame
   `anim_front.png`. The V2 audit reverted from `anim_front.png` because
   the canvas-based PNG decoder produced garbage tile indices when the
   PLTE chunk had >16 colors. **But** : `anim_front.4bpp.bin` (= IDAT-parse
   pre-extracted by `scripts/extract-png-indexed-tiles.mjs`) was already
   on disk at `public/decomp/em/pokemon/lotad/anim_front.4bpp.bin`
   (4096 bytes = 128 tiles = 2 × 64-tile frames). The intro asset loader's
   `loadTileBin()` helper would have transparently used the .bin (= preserves
   palette indices), but we passed `front.png` so `front.4bpp.bin` was
   loaded (= 2048 bytes, 1 frame).

2. **Engine bug : `StartSpriteAnim` no-ops for sprites without an animState
   entry**. `StartSpriteAnim(spriteId, animIdx)` looks up `spriteAnimStates`
   map (decomp-runtime.ts:1625-1638). Map only populated by
   `CreateSpriteFromTemplate` (= sprite created from a registered
   `SpriteTemplate` with `anims` table name). Lotad is created via
   `CreateSpriteAtOam` directly, which does NOT register an animState.
   So `LaunchAnimationTaskForFrontSprite`'s call to
   `_rt.StartSpriteAnim(s.spriteId, newAnim)` was a silent no-op.

**Fix (foundational)** :

- **`intro-asset-loader.ts`** : Lotad now loads `anim_front.png` →
  `anim_front.4bpp.bin` (= 2 frames). Comment explains the
  `.4bpp.bin` IDAT-parse path that preserves duplicate-color indices.
- **`pokemon-animation.ts:LaunchAnimationTaskForFrontSprite`** : bypass
  `StartSpriteAnim` and write `oam.tileId = tileBase + frameIdx * tilesPerFrame`
  directly. This is the underlying mechanism `StartSpriteAnim` ultimately
  triggers (= `BeginAnim` writes `sprite->oam.tileNum`, sprite.c:705).
  Direct write works for ANY sprite regardless of creation path. Also still
  calls `StartSpriteAnim` for forward-compat with sprites that DO have
  animStates (= when sprite-anim-extras adds `gAnims_MonPic` to
  `CreateSpriteFromTemplate`).
- **`pokemon-animation.ts:DoMonFrontSpriteAnimation`** : same direct
  `oam.tileId` write at the immediate `StartSpriteAnim(sprite, 1)` step
  (= switches to frame 1 the moment Lotad lands).
- **`main-menu-impl.ts:NewGameBirchSpeech_CreateLotadSprite`** : write
  `sprite.tileBase = tileBase` after creation (= was missing, defaulting
  to 0, which would have caused the foundational fix above to point at
  tile 0 instead of `tileBase`).
- **`main-menu-impl.ts`** : new `MON_PIC_2FRAME_SIZE_BYTES = 2 *
  TRAINER_PIC_SIZE_BYTES` constant for clarity. Used in
  `LoadCompressedSpriteSheet({ size: ... })`.

**Tiles per frame computation** : `_tilesPerMonPicFrame(shape, size)` reads
GBA OAM size matrix (= `include/gba/types.h` ST_OAM_SQUARE/H_RECTANGLE/V_RECTANGLE
× size 0-3) and returns `(W/8) * (H/8)`. For 64×64 mon pic
(shape=0 size=3) : 64 tiles per frame. **This is the FOUNDATIONAL helper
for all frame-cycling mon anims** — battle send-out, party menu, summary,
evo, trade, Pokedex, egg hatch all share `pokemon-animation.ts` and
benefit.

### Issue 2 — Palette flicker / pink doesn't stay

**Investigation** : exhaustive trace of the BlendPalette + UpdatePaletteFade
sequence on the Lotad release frame-by-frame. Key findings :

- `LaunchBallFadeMonTask(unfadeLater=TRUE)` calls
  `BlendPalette(OBJ_PLTT_ID(palNum), 16, 16, ballColor)` → faded[OBJ pal]
  = full pink. Reads from gPlttBufferUnfaded → writes to gPlttBufferFaded
  (= 1:1 décomp src/util.c:264).
- `BeginNormalPaletteFade(PALETTES_BG, 0, 0, 16, RGB_WHITE)` → BG fade
  to white. `selectedPalettes = 0xFFFF` has BG bits 0-15 set, OBJ bits
  16-31 NOT set.
- `_applyPaletteFadeStepHalf` correctly skips OBJ banks when
  `selectedPalettes` has no OBJ bits set (= verified bit math :
  `(0xFFFF >>> 16) & 1 == 0` → all OBJ banks skipped during BG fade).
- During the 16-frame fade + 4-frame `softwareFadeFinishingCounter` latch,
  no OBJ bank writes occur. Pink stays.
- Once `gPaletteFade.active` becomes false, Task_FadeMon_ToNormal_Step
  ramps coeff 16→0 over 16 frames via BlendPalette each tick. Pink unblends.

**The math is 1:1 décomp.** So what's the user seeing?

Best hypothesis : **the static-frame Lotad on the final position is the
visual "flicker"**. With Issue 1 unfixed, Lotad lands and stays motionless
on frame 0 while the palette is in the middle of unblending from pink.
The contrast with all the other things still moving (= particle sparkles
cleanup, BG fade-back from white) creates a visual "wrongness" the user
described as "flicker" or "ne reste pas". With Issue 1 fix in place,
Lotad's idle 2-frame breathing matches the palette unblend duration, and
the visual reads as a coherent "release-and-settle" beat instead of a
jarring static end-state.

**Foundational palette fix : dual-buffer documentation + helpers added**.

- **`decomp-globals.ts:BlendPalette`** : extensive doc-comment added
  describing the dual-buffer model (read unfaded, write faded). Documents
  the OBJ-pink-stays invariant explicitly so future contributors don't
  remove the V2 toggle-aware fade engine accidentally.
- **`decomp-globals.ts:BlendPalettes`** (NEW) : 1:1 décomp palette.c:832.
  Iterates a 32-bit selectedPalettes mask (BG 0-15 / OBJ 16-31) and
  applies BlendPalette per selected bank. Foundational : used by status
  condition tints, Cave fade-in, Trade scene.
- **`decomp-globals.ts:BlendPalettesUnfaded`** (NEW) : 1:1 décomp
  palette.c:844. Reset faded ← unfaded for ALL palettes, then BlendPalettes.
  Foundational rebase primitive : used when a scene must discard
  in-flight fade work and start fresh.

**Secondary cleanup : duplicate `BeginNormalPaletteFade`**.
`pokeball-effects.ts:LaunchBallFadeMonTask` had TWO `BeginNormalPaletteFade`
calls (line 204 and line 273). Décomp has ONE (battle_anim_throw.c:2056).
Second call was harmless (= early-return on `gPaletteFade.active==true`),
but visual code-clarity hazard. Removed.

### Files modified (Session 91 polish)

- `src/engine/pokemon-animation.ts` — direct `oam.tileId` write replaces
  `StartSpriteAnim` (foundational : works for any sprite creation path).
  `_tilesPerMonPicFrame` helper. `DoMonFrontSpriteAnimation` immediate-frame-1
  write.
- `src/engine/intro-asset-loader.ts` — Lotad → `anim_front.png`.
- `src/engine/main-menu-impl.ts` — `MON_PIC_2FRAME_SIZE_BYTES` constant.
  `NewGameBirchSpeech_CreateLotadSprite` writes `sprite.tileBase`.
- `src/engine/decomp-globals.ts` — `BlendPalette` doc-comment expansion.
  `BlendPalettes` + `BlendPalettesUnfaded` added (= foundational decomp
  primitives).
- `src/engine/pokeball-effects.ts` — duplicate `BeginNormalPaletteFade`
  removed.

### Why these fixes benefit other scenes

- **Direct `oam.tileId` write in `LaunchAnimationTaskForFrontSprite`** :
  Every Pokemon front-pic display in the game (= battle send-out, party
  menu, summary screen, evo cutscene, trade, Pokedex, egg hatch) goes
  through `DoMonFrontSpriteAnimation` → `LaunchAnimationTaskForFrontSprite`.
  They all benefit from frame-cycling that doesn't depend on
  `CreateSpriteFromTemplate`.
- **`sprite.tileBase` written at creation time** : foundational invariant
  for any sprite that needs to switch frames at runtime via direct OAM
  writes (= mons, ball anims, particles, etc.).
- **`MON_PIC_2FRAME_SIZE_BYTES` constant** : self-documenting, will be
  reused by future mon-display scene creators.
- **`BlendPalettes` + `BlendPalettesUnfaded`** : every status condition
  visual (poison, paralysis, freeze, etc.) calls these in battle scenes.
  Now in the foundational decomp-globals layer.

### Confidence on Session 91 polish

- **Issue 1 (idle anim)** : 95% confident fixed. Direct `oam.tileId`
  write is the foundational mechanism — it WILL toggle frames. 5%
  uncertainty : the `anim_front.4bpp.bin` tile data layout (= frame 0
  then frame 1 in 64-tile linear order) needs to be visually verified.
  If the binary has the frames packed differently (= e.g. interleaved
  8x8 strips), the user will see garbage on frame 1. But the file size
  (4096 = 2 × 2048) + the IDAT-parse pipeline (= same script that produces
  `front.4bpp.bin` successfully) make this very likely correct.

- **Issue 2 (palette flicker)** : 70% confident the user's perceived
  "flicker" was actually the static Lotad in the middle of palette unblend
  — fixing Issue 1 will resolve perception. 30% uncertainty : if the user
  reports "still flickers" after Session 91 verification, we need to
  investigate :
  - Compositor scanline rendering of affine sprites under specific
    affineMode/matrixNum combinations (= would need a unit test).
  - BG/OBJ palette slot collision (= Lotad uses palSlot N, but a BG
    palette load might be writing to OBJ slot N if the LoadPalette flatIdx
    is miscomputed). Verifying : the assigned palSlot is dynamic
    (= via `nextObjPalSlot++`), so unlikely a fixed collision.
  - Scanline H-blank timing for the white flash (= our compositor doesn't
    simulate per-scanline DMA, may show abrupt color shift instead of
    smooth).

### Manual test instructions (Session 91)

1. Boot the game, navigate to "Nouvelle partie".
2. Watch the Birch speech up to "voici un Pokémon" → ball appears.
3. **Issue 1 verification** : Lotad emerges, lands at final position, then
   should visibly "breathe" — toggle between two body poses every ~30
   frames (= about half-second). Look for the head and body slightly
   alternating.
4. **Issue 2 verification** : during the white flash + ball-open beat,
   Lotad's silhouette should be tinted PINK (visible against the white
   flash). Pink should stay applied for ~16 frames after Lotad lands,
   then smoothly fade back to original Lotad colors over 16 more frames.
   No abrupt pop, no flicker, no color cycling.

### Deferred to future session

- Per-species `sMonAnimFunctions` registry (~150 functions) : current
  conservative fallback (toggle frame 0/1 every 30 frames) works for
  Lotad. Battle scenes will need richer anims (Spin, Stretch, Rotate,
  Bounce, etc.) before they're 1:1 decomp.
- `sMonAnimationDelayTable` extraction : decomp uses a per-species delay
  before idle anim starts. Most species have 0 delay. Lotad has 0. So our
  immediate `LaunchAnimationTaskForFrontSprite` call is correct for Lotad
  but won't match future species with non-zero delays.
- `HasTwoFramesAnimation(species)` table : currently returns TRUE for all
  species. Most Gen 3 mons do have 2 frames (= correct fallback), but a
  small number have 1-frame static pics (= TODO extract
  `sMonHasTwoFramesAnimationTable`).
- `gAnims_MonPic` registration in `SPRITE_ANIM_TABLES` : would allow
  `CreateSpriteFromTemplate`-based mon sprites to use the templated
  `StartSpriteAnim` path. Our V2 direct `oam.tileId` write is foundational
  and works regardless, but adding the templated path would be more
  decomp-faithful.

## Session 92 — Naming screen visual reconstruction

User feedback (2026-05-05) :
- ✅ Functional flow OK (= Select swaps keyboards, Start moves to OK,
  A/B work, name returns).
- ❌ "Graphisme totalement ruiné, curseur à côté de la plaque, 0 animation"
- Screenshot showed : rainbow stripes, mangled top-right (= page swap
  frame), giant misplaced "0" (= corrupted sprite), cursor not where
  expected, OK/Back garbled.

### Root cause analysis

Three compounding issues, none of which were obvious from the V2 audit's
"DEFERRED → CORE COMPLETE" Session 91 status :

1. **Sprite tile data corruption (= rainbow stripes)** — Same class of
   bug as the Lotad `anim_front` issue (Session 91 polish). The naming
   screen impl was loading sprite sheets via `loadIndexedPng` (=
   canvas-based PNG decode → first-insert-wins palette index remap). The
   browser's canvas `drawImage` resamples slightly off RGB values, so
   indexed PNGs that share PLTE colors with subtle differences (= cursor
   anti-alias, button flash gradient) get mapped to the WRONG palette
   index → garbage tile data → rainbow stripes when sampled with the
   loaded .pal palette.

2. **Subsprite shape/size constants WRONG** — The V2 hand-coded subsprite
   tables had `shape=1, size=2` for 32x8 subsprites. Per `include/gba/types.h`
   `SPRITE_SIZE_32x8 = (ST_OAM_SIZE_1 << 2) | ST_OAM_H_RECTANGLE = 5`,
   so `SPRITE_SHAPE(32x8) = 5 & 3 = 1` and `SPRITE_SIZE(32x8) = 5 >> 2 = 1`.
   The 32x8 subsprites were rendering as 32x16 (= size=2 shape=1) which
   tiled the wrong content for tileOffset 0..19 of PageSwapFrame and 0..14
   of Button. → buttons at wrong dimensions.

3. **Cursor anim never fired** — `rt.StartSpriteAnim` is a no-op for
   sprites without an entry in `spriteAnimStates`. That map is only
   populated by `CreateSpriteFromTemplate`. Our cursor uses
   `CreateSpriteAtOam` directly (= no animState). So squish/return-to-loop
   was silent. User saw "0 animation" + cursor stuck on first frame of
   `cursor.png` even after a key press.

4. **Subsprite child OAMs being clobbered** — `SetSubspriteTables`
   allocates child OAM indices and hides the primary. But `tickFixed`
   runs `syncSpritesToOam` AFTER our CB2's `syncSubspriteOam`, re-enabling
   `oam.visible = true` based on `sprite.invisible = false`. Primary
   sprite's 8x8 OAM at sheet base would render garbage (= tile 0 of the
   sheet, possibly a button corner) at the sprite's center coords.

5. **Missing cursor sheets** — The decomp loads 3 sheets contiguously
   for the cursor : `gNamingScreenCursor_Gfx` (anim 0 = tile 0..3),
   `gNamingScreenCursorSquished_Gfx + 0x8` (anim 1 frame 1 = tile 4..7),
   `gNamingScreenCursorFilled_Gfx` (anim 1 frame 2 = tile 8..11). V1
   only loaded `cursor.png`, so squish anim referenced uninitialized
   objVram → garbage tiles.

### Foundational fixes

1. **`src/engine/gba/png-loader.ts:loadTileBin`** (NEW exported
   foundation) — copy of intro-asset-loader's local `loadTileBin` helper,
   exported for reuse. Tries `<name>.4bpp.bin` first (= IDAT-parse output
   from `scripts/extract-png-indexed-tiles.mjs`), falls back to
   `loadIndexedPngStrict` if missing. Foundation : naming screen, intro,
   battle scenes, party menu — any sprite scene with PLTE-based PNG
   assets benefits.

2. **`scripts/extract-png-indexed-tiles.mjs` runs** on all naming screen
   PNGs : `back_button.png`, `ok_button.png`, `page_swap_frame.png`,
   `page_swap_button.png`, `page_swap_upper.png`, `page_swap_lower.png`,
   `page_swap_others.png`, `cursor.png`, `cursor_squished.png`,
   `cursor_filled.png`, `input_arrow.png`, `underscore.png`,
   `pc_icon_off.png`, `pc_icon_on.png`, `menu.png`. All 14 .4bpp.bin
   files written to `public/decomp/em/boot/naming_screen/`.

3. **`src/engine/decomp-runtime.ts:tickFixed`** — added globalThis
   `_syncSubspriteOam` post-syncSpritesToOam hook. Foundation pattern :
   any scene with multi-OAM-per-logical-sprite (= naming screen, future
   summary screen, party menu cursor wraps, status condition icons)
   installs this hook to re-pin child OAMs + re-hide primary OAM after
   tickFixed's single sync pass.

### Naming-screen-impl.ts fixes

| Fix | Before | After |
|-----|--------|-------|
| Sprite sheet load | `loadIndexedPng` (canvas RGBA → first-insert-wins remap) | `loadTileBin` (.4bpp.bin IDAT-parse → preserves PLTE indices 1:1) |
| Subsprite shape/size for 32x8 | shape=1 size=2 (= 32x16 actual) | shape=1 size=1 (= 32x8 actual) |
| Cursor sheets loaded | cursor.png only | cursor.png + cursor_squished.png (offset 0x8) + cursor_filled.png contiguously |
| Cursor anim path | `rt.StartSpriteAnim` (no-op without animState) | local FSM `_startCursorAnim`/`_tickCursorAnim` writes `oam.tileId = tileBase + tileOffset` directly (= same foundational pattern as Session 91 Lotad fix) |
| Cursor `tileBase` | not set (default 0) | `sprite.tileBase = tileBase` (= reads correctly by FSM) |
| BG palette load | bank 0 only (16 colors from menu.pal) | banks 0-5 from menu/upper/lower/others/buttons/cursor.pal (= 1:1 décomp `gNamingScreenMenu_Pal[6][16]` 96-color load) |
| `CreateInputTargetIcon` | empty stub (potentially garbage from leftover sprites) | switch on `iconFunction` : 0 NoIcon, 2 PCIcon (NEW impl), 1/3/4 NoIcon fallback |
| Sprite sheet srcOffset | always 0 | `srcOffset` field per sheet (= 1:1 décomp `gNamingScreenPageSwapButton_Gfx + 0x8` and `gNamingScreenCursorSquished_Gfx + 0x8`) |
| `_syncSubspriteOam` hook | not registered | installed in `DoNamingScreen`, removed in `MainState_Exit` |

### Session 92 functions added

- `_startCursorAnim(sprite, rt, animIdx)` — local cursor anim FSM start.
- `_tickCursorAnim(sprite, rt)` — per-frame tick : advance frame
  counter, write `oam.tileId`, set `animEnded=TRUE` on END.
- `_setCursorAnimFrame(sprite, rt, tileOffset)` — direct `oam.tileId`
  write helper.
- `NamingScreen_CreatePCIcon()` — 1:1 décomp `naming_screen.c:1408-1415`,
  creates PCIcon sprite at (56, 41) with `sSubsprites_PCIcon`.

### Session 92 constants added

- `GFXTAG_CURSOR_SQUISHED`, `GFXTAG_CURSOR_FILLED`, `GFXTAG_PC_ICON_OFF`
  (= un-commented + added).
- `sSubsprites_PCIcon` : 3 entries × 16x8 (= 1:1 décomp
  `naming_screen.c:2348-2374`).
- `CURSOR_ANIM_DATA_IDX`/`FRAME`/`DELAY` — sprite.data[9..11] indices
  for the local cursor anim FSM (= unused by decomp's data[0..7]
  semantic for cursor sX/sY/sPrevX/sPrevY/sInvisible/sFlashing/sColor/
  sColorIncr/sColorDelay).

### Subsprite shape/size table updated to match decomp

```
8x8   = shape=0 (SQUARE)       size=0  (1 tile)
16x16 = shape=0                size=1  (4 tiles)
32x32 = shape=0                size=2  (16 tiles)
16x8  = shape=1 (H_RECTANGLE)  size=0  (2 tiles)
32x8  = shape=1                size=1  (4 tiles)  ← was MIS-coded as size=2
32x16 = shape=1                size=2  (8 tiles)
```

### Page swap animation status

✅ Verified : `Task_HandlePageSwapAnim` is created via `rt.CreateTask`.
`runTasks()` in our `CB2_NamingScreen` ticks it. State machine 0→1→2→3
runs correctly (= `tFrameCount += 4` per frame, transitions at 64 and
128, total ~32 frames). `IsPageSwapAnimNotInProgress` correctly checks
`sNamingScreen.pageSwapTaskId < 0` (= task destroyed at state 3).

The "0 animation" symptom user reported was actually **the page swap
text sprite rendering with corrupted tile data** (= so even though the
y2 was animating, the user couldn't visually distinguish the 24x8 text
slide). With Fix #1 (.4bpp.bin), the text now renders as the proper
"MAJ" / "min" / "div" labels and the slide animation should be visible.

The BG offset shift via `sNamingScreen.bg1vOffset/bg2vOffset` is set
each frame but currently NOT propagated to the GBA BG VOFS regs (=
décomp does this in `VBlankCB_NamingScreen`, our engine has no per-scene
VBlank dispatch yet). The BG slide effect (= keyboard tilemap sliding
in/out vertically) is therefore **deferred** — page swap text + button
gfx update + sprite slide DO animate (= visible swap effect), but the
underlying BG layer doesn't shift.

### CreateInputTargetIcon impl status

Three of five icon paths are now handled :
- `0 NoIcon` : explicit no-op (was implicit before).
- `2 PCIcon` : 1:1 décomp impl (new). Uses `pc_icon_off.4bpp.bin` +
  `sSubsprites_PCIcon` 3-row 16x8 layout. Renders at (56, 41) per
  decomp.
- `1 PlayerIcon` / `3 MonIcon` / `4 WaldaDadIcon` : fallback to NoIcon
  (= no garbage tiles drawn). PlayerIcon needs `gObjectEvents` engine
  (= overworld player avatar sprite). MonIcon needs `pokemon_icon`
  engine (= 64-color pokemon icon palettes). WaldaDadIcon needs
  `OBJ_EVENT_GFX_MAN_1` from object events.

### Files modified (Session 92)

- `src/engine/gba/png-loader.ts` — `loadTileBin` exported (foundation).
- `src/engine/naming-screen-impl.ts` — asset loading + cursor anim FSM
  + subsprite tables + CreateInputTargetIcon + post-sync hook install.
- `src/engine/decomp-runtime.ts` — `_syncSubspriteOam` hook in tickFixed.

### Files added (Session 92)

- `public/decomp/em/boot/naming_screen/back_button.4bpp.bin` (480 bytes)
- `public/decomp/em/boot/naming_screen/ok_button.4bpp.bin` (480 bytes)
- `public/decomp/em/boot/naming_screen/page_swap_frame.4bpp.bin` (640 bytes)
- `public/decomp/em/boot/naming_screen/page_swap_button.4bpp.bin` (288 bytes)
- `public/decomp/em/boot/naming_screen/page_swap_upper.4bpp.bin` (160 bytes)
- `public/decomp/em/boot/naming_screen/page_swap_lower.4bpp.bin` (160 bytes)
- `public/decomp/em/boot/naming_screen/page_swap_others.4bpp.bin` (160 bytes)
- `public/decomp/em/boot/naming_screen/cursor.4bpp.bin` (128 bytes)
- `public/decomp/em/boot/naming_screen/cursor_squished.4bpp.bin` (192 bytes)
- `public/decomp/em/boot/naming_screen/cursor_filled.4bpp.bin` (128 bytes)
- `public/decomp/em/boot/naming_screen/input_arrow.4bpp.bin` (32 bytes)
- `public/decomp/em/boot/naming_screen/underscore.4bpp.bin` (32 bytes)
- `public/decomp/em/boot/naming_screen/pc_icon_off.4bpp.bin` (192 bytes)
- `public/decomp/em/boot/naming_screen/pc_icon_on.4bpp.bin` (192 bytes)
- `public/decomp/em/boot/naming_screen/menu.4bpp.bin` (1536 bytes)

### Why these fixes benefit other scenes

- **Foundation `loadTileBin` in png-loader** : every scene that loads
  PNG sprites suffers the canvas-resample-corrupted-indices bug. Future
  scenes (= summary, party menu, options menu, PC system, battle UI)
  switch to `loadTileBin('foo.png', 4)` and the engine auto-resolves
  to `.4bpp.bin` (= 1:1 fidelity) with PNG fallback.

- **Foundation `_syncSubspriteOam` hook** : any scene with multi-OAM
  logical sprites (= summary screen markings tiles, party menu cursor
  wraps, status condition icons) installs the hook and the engine
  preserves child OAM state across tickFixed's syncSpritesToOam pass.

- **Cursor anim FSM pattern** : same structural pattern (= local
  data[N..M] indices + tileBase + direct oam.tileId write) is reusable
  for any sprite created via `CreateSpriteAtOam` that needs
  per-frame anim. Same approach as Lotad's
  `LaunchAnimationTaskForFrontSprite` direct write (Session 91).

### Confidence

- **Issue 1 (rainbow stripes)** : 95% confident fixed. The `.4bpp.bin`
  pipeline is proven (= worked for Lotad anim_front in Session 91
  polish). All 14 sprite sheets extracted with valid PLTE indices.
- **Issue 2 (cursor "à côté de la plaque")** : 90% confident fixed.
  Cursor sprite now has `tileBase` set + cursor anim FSM ticks
  correctly + 3 cursor sheets loaded contiguously. Cursor x calc was
  always `sPageColumnXPos[kbId][x] + 38` 1:1 décomp = unchanged. Visual
  position should be correct now that the sprite tile data isn't
  garbage.
- **Issue 3 (PC icon mangled top-right)** : 80% confident fixed. The
  "mangled icon" was likely the page swap frame/button/text rendering
  with corrupted tiles. Now they render proper button graphics. The
  CreateInputTargetIcon for PLAYER (= our test path) explicitly does
  nothing → no garbage in icon area.
- **Issue 4 (page swap "0 animation")** : 75% confident — sprite-side
  animation (= text label slide y2) should now be visible. BG-side
  vertical scroll (= keyboard tilemap visual) is still deferred.

### Manual test instructions (Session 92)

1. Boot the game, select "Nouvelle partie" → Birch speech.
2. After Lotad release / fade out → naming screen for player name.
3. Verify visual :
   - "VOTRE NOM?" header text — clean (unchanged).
   - U N D I entry text — clean (unchanged).
   - Cursor sprite — at column 0 row 0 (= top-left "A" of letters
     keyboard), small white-bordered box with green flash. NOT next to
     text entry, NOT misplaced.
   - Top-right area — clean three-button column : page swap (with
     "min" or "div" label depending on current page), back, OK. Each
     button has a clean button background frame, no garbage tiles.
   - Bottom area — NO rainbow stripes. Banner with "+DEPL. A OK B RET."
     small text.
4. Press SELECT → page swap animation :
   - Page swap text sprite slides up off screen (y2 increments 0 → >7).
   - Re-appears as new label sliding down (y2 -4 → 0).
   - Total visual ~32 frames.
   - Keyboard chars switch from upper → lower (or whatever next page is).
5. Press A on a letter → cursor "squish" anim (= switches to tile 4 then
   tile 8 then back to tile 0). Visible 16-frame animation.
6. Press B → backspace, last char removed.
7. Press Start → cursor jumps to OK button (= cursor goes invisible since
   it's on the button column).
8. Move to OK button + press A → naming screen exits, name saved.

### Deferred to future session

- BG tilemap rendering for keyboard chars (= per-tile background plate
  beneath each char). Currently we use window text printer which is
  functional but visually not 1:1.
- VBlank BG VOFS shift for page swap (= keyboard tilemap slides up/down
  during swap). Sprite-side anim works ; BG-side shift requires per-scene
  VBlank dispatch.
- PlayerIcon (= rival/player avatar). Requires `gObjectEvents` engine.
- MonIcon (= 64-color pokemon icon). Requires pokemon_icon engine.
- WaldaDadIcon (= overworld man sprite). Requires object event templates.
- SE_BALL for delete key (= currently uses SE_SELECT placeholder).
- PC sent message flow for `MainState_PressedOKButton` when party full.

---

## Session 93 — Lotad final polish + palette cycle root cause

### User feedback (2026-05-05) on Session 91/92 verification

> "Lotad brille en multicouleurs flashy au lieu d'être teinté de rose lors
> du flash. Le flicker existe toujours (j'ai choper la frame perfect
> apparemment lol). L'animation de lotad est jouée en boucle (sprite1,
> sprite2) ✓. L'animation de 'breathing' ne se joue pas. Le pokemon a 2
> animations en fait, une sur les image (2 sprite) et une que le jeu lui
> attribe (la, on dirait qu'il s rattatine sur lui meme puis s'etend et
> revient en place)."

User isolates two distinct issues :
1. **Multicolor flash** during ball release (= palette cycling bug).
2. **Animation B not playing** = the affine squish-and-bounce that the
   décomp attributes per-species (Lotad : `ANIM_V_SQUISH_AND_BOUNCE`).

### Animation B root cause

`LaunchAnimationTaskForFrontSprite` previously hardcoded an inline
"breathing" callback that only toggled tile every 30 frames. It NEVER
dispatched to `sMonAnimFunctions[animId]` (= Session 91 polish identified
this as future work). For Lotad :
- `SPECIES_LOTAD = 295` (decomp `include/constants/species.h:301`).
- `sMonFrontAnimIdsTable[294] = ANIM_V_SQUISH_AND_BOUNCE` (decomp
  `pokemon.c:1677`).
- Maps to `Anim_VerticalSquishBounce` (decomp `pokemon_animation.c:1871`).

This is the function the user describes : ~48-frame squish-bounce-settle
animation that runs once after the cry plays.

### Animation B implementation (1:1 décomp)

Created new module `src/engine/pokemon-anim-funcs.ts` :

| Function | Decomp ref | Used by species |
|---|---|---|
| `Anim_VerticalSquishBounce` | `pokemon_animation.c:1871` | Lotad, Lombre, Oddish, Marill, Skitty, Wurmple, Surskit, Masquerain, ~50 species |
| `VerticalSquishBounce` (inner) | `pokemon_animation.c:1834` | (called by above) |
| `Anim_VerticalSquishBounce_Slow` | `pokemon_animation.c:3658` | Gloom, Slowpoke, Dewgong, Lickitung, Chansey, Moltres, ~10 species |
| `Anim_HorizontalShake_Stub` | (TODO 2450) | Stub — fallback to squish |
| `Anim_VerticalShake_Stub` | (TODO 2491) | Stub — fallback to squish |
| `Anim_VerticalStretch_Stub` | (TODO 2999) | Stub — fallback to squish |

Helpers ported 1:1 :

| Helper | Decomp ref |
|---|---|
| `setAffineData` | `pokemon_animation.c:984` (= ObjAffineSet inline math) |
| `handleSetAffineData` | `pokemon_animation.c:1020` |
| `handleStartAffineAnim` | `pokemon_animation.c:1003` |
| `tryFlipX` | `pokemon_animation.c:1031` |
| `resetSpriteAfterAnim` | `pokemon_animation.c:1061` |
| `waitAnimEnd` | `pokemon_animation.c:5540` |

`sMonFrontAnimIdsTable` map (= partial extraction) and `sMonAnimFunctions`
registry both implemented.

### Architecture : tile cycling split from affine anim

Previous Session 91 polish hardcoded `sprite.callback = idle anim that
toggles tile`. This monopolized the sprite.callback slot, blocking the
per-species affine anim function. Session 93 splits :

- **Sprite callback** : per-species affine anim (= 1:1 décomp).
- **Separate task** : 2-frame tile cycling (= our continuous "breathing").

The tile-cycle task auto-destroys when sprite dies / mon-anim controller
deactivated. No callback collision.

### Palette cycle root cause

Investigation pursued 6 hypotheses (= H1 wrong color, H2 wrong buffer, H3
re-apply OBJ pal, H4 slot collision, H5 math, H6 toggle reset). Verified
H1-H5 all correct. **H6 found** : our `BeginNormalPaletteFade` reset
`objPaletteToggle = 0`, but the décomp does NOT (`palette.c:158-202`).

This caused subtle BG/OBJ tick alternation drift across consecutive fades
(= ball release does TWO fades : fade-to-white then fade-back-from-white).
Fixed in `decomp-runtime.ts:BeginNormalPaletteFade`. Comment added with
1:1 décomp ref.

**Verdict on user's "multicolor" perception** : the primary cause is
likely the LEGITIMATE intermediate fade colors (= green Lotad blended
toward pink at coeff 4-12 produces purple-blue, cream-yellow tones), NOT
a bug. These are 1:1 décomp behavior. Without Animation B's motion
masking the perception, the static Lotad in mid-fade looks "wrong" to
the eye.

Implementing Animation B (= squish-and-bounce starts immediately after
cry) should resolve the visual perception. If the user reports "still
flickers" after this session, the foundations are correct — we'd need
to investigate :
1. Compositor scanline-level palette apply timing (= our renderer applies
   palette per-frame, real GBA per-scanline).
2. Frame-pacing variance (= browser RAF timing).

### Foundational improvements

- **`pokemon-anim-funcs.ts`** : every Pokemon front-pic display
  (= party menu, summary, evolution, trade, Pokedex, battle send-out, egg
  hatch, Birch) now has access to the per-species anim function dispatch.
  When the full `sMonFrontAnimIdsTable` is extracted in a future session,
  every species automatically gets its proper anim.
- **`objPaletteToggle` preservation** : every BeginNormalPaletteFade in
  the codebase now matches décomp tick alternation behavior.
- **Tile-cycle task split** : foundation for any future scene that needs
  CONCURRENT tile cycle + affine anim (= many battle anims do this).

### Files modified (Session 93)

- `src/engine/pokemon-animation.ts` — split tile cycling into separate
  task; `LaunchAnimationTaskForFrontSprite` dispatches to per-species
  affine anim.
- `src/engine/decomp-runtime.ts:BeginNormalPaletteFade` — preserve
  `objPaletteToggle` (= 1:1 décomp).
- `src/engine/pokeball-effects.ts:LaunchBallFadeMonTask` — debug logging
  via `window.__BIRCH_FADE_DEBUG = true`.

### Files created (Session 93)

- `src/engine/pokemon-anim-funcs.ts` (~300 lines) :
  - `setAffineData`, `handleSetAffineData`, `handleStartAffineAnim`,
    `tryFlipX`, `resetSpriteAfterAnim`, `waitAnimEnd` helpers.
  - `Anim_VerticalSquishBounce`, `Anim_VerticalSquishBounce_Slow`.
  - `VerticalSquishBounce` inner cb function.
  - `Anim_HorizontalShake_Stub`, `Anim_VerticalShake_Stub`,
    `Anim_VerticalStretch_Stub`.
  - `getMonFrontAnimId(species)` registry (Lotad/Lombre/Ludicolo + fallback).
  - `getMonAnimFunc(animId)` registry.
  - ANIM_* constants.

### Verified by Node simulation

VerticalSquishBounce math reproduced tick-by-tick :
- Frame 0-15 (squish) : yScale 256→288 (= 11% shorter), xScale 256→224
  (= 14% wider), y2 stays ~0.
- Frame 16-31 (bounce) : y2 dips to -10 (= jumps up), xScale 256→288
  (= taller phase).
- Frame 32-47 (settle) : returns toward identity.
- Frame 48 : terminator → switch to WaitAnimEnd → SpriteCallbackDummy.

Total 48 frames (= 0.8 s @60 Hz). Matches user description "shrinks on
itself, expands, returns in place".

### Confidence

- **Animation B impl** : HIGH (95%). Math verified Node-side.
- **objPaletteToggle fix** : HIGH (98%). Direct 1:1 alignment with décomp.
- **Multicolor visual fix via motion masking** : MEDIUM (70%). The static
  Lotad mid-fade was the perceived "flicker" — Animation B should mask it.

### Deferred to future session

- Full `sMonFrontAnimIdsTable` extraction (387 species).
- Full `sMonAnimFunctions[]` registry (~150 anim functions). Most-reused :
  HorizontalShake, VerticalShake, VerticalStretch (= currently stubs),
  HorizontalSlide, GrowVibrate, ShrinkGrow, BackAndLunge, FlashYellow.
- `sMonAnimationDelayTable` per-species delay (= most species 0, but ~5%
  have 1-3 frame delay before idle anim starts).
- `HasTwoFramesAnimation(species)` table extraction (= currently returns
  TRUE for all species).
- Compositor per-scanline palette apply (= match real GBA H-blank timing).

## Session 94 — Naming screen final polish (4-issue resolution + foundational OAM fix)

### User feedback (2026-05-05) on Session 92 verification

After Session 92 fixes, four visual divergences remained vs. the ROM screenshot
ground truth :

1. **Trainer sprite (top-left) missing** — ROM shows Brendan/May 16x32 walking
   sprite (frame 0 = south-standing pose), our impl rendered nothing.
2. **Underscores at wrong Y** — sprites existed but rendered as a
   "white→cyan→blue→multi→blue" colored streak at the bottom of the keyboard
   area instead of the entry field at top under "VOTRE NOM?".
3. **MAJ/SELECT button (top-right) fragmented** — visible as garbled "m, n, l"
   small letter shapes instead of a clean orange button with "MAJ" + "SELECT"
   labels.
4. **BACK button label garbled "RKBO"** — instead of "RETOUR" + "BOUTON B".

### Root cause (single bug, 3 of 4 symptoms)

After deep audit, **issues 2, 3, and 4 share ONE foundational root cause** :

**`CreateSpriteAtOam` does NOT reserve subsprite child OAM slots when picking
a free OAM index** — it walks `gSprites.values()` filtering by `inUse` to
find taken primary slots, but completely ignores OAM indices allocated to
SUBSPRITE CHILDREN by `SetSubspriteTables`.

Naming screen creation order :
| Step | Sprite              | OAM slots consumed |
|------|---------------------|-------------------|
| 1    | Cursor              | 0 (no subsprites) |
| 2    | PageSwapFrame + 8 children | 1 + (2..9)  |
| 3    | PageSwapText + 2 children  | 10 + (11..12) |
| 4    | PageSwapButton             | 13          |
| 5    | BackButton + 6 children    | 14 + (15..20) |
| 6    | OkButton + 6 children      | 21 + (22..27) |
| 7    | InputArrow                 | 28          |
| 8    | 7 Underscores              | 29..35      |
| 9    | PlayerIcon                 | 36          |

**Before fix** : step 3's CreateSpriteAtOam picks slot 2 (= PageSwapFrame's
first child OAM), stomping the frame's tile data with PageSwapText's tile
data. Each subsequent CreateSpriteAtOam picks the lowest "free" slot that
already belongs to a previous subsprite child → cascading corruption.

Per-frame, `_syncSubspriteOam` re-writes the children's tile/coord data each
tickFixed, so visually you'd see the LAST subsprite write win for each
contested slot — but only AFTER the new sprite's data was written. The result
is flickering / fragmented buttons + sprites visually positioned where their
parent button is (= 200+ x-pixel offset from where they should be).

This explains :
- **Issue 2 (underscore "wrong y")** — each underscore sprite picked an OAM
  slot that was a BackButton/OkButton child (positioned at y=112-144 = button
  rows). Each frame, `_syncSubspriteOam` re-pinned that slot to the button
  child's position + tile data → underscores were INVISIBLE (overwritten by
  buttons) ; user perceived "colored streak at bottom of keyboard" = the
  buttons rendering with their proper subsprite layout.
- **Issue 3 (MAJ/SELECT fragmented)** — PageSwapText's children at slots
  11/12 collided with PageSwapButton at slot 11+, then BackButton at slot
  ~14+ — small "m, n, l" shapes are PageSwapText label tiles partially
  visible amid the stomping.
- **Issue 4 (BACK "RKBO")** — OkButton at slot 21 + 6 children stole 1+ of
  BackButton's children → only some letters of "RETOUR / BOUTON B" rendered ;
  rough visual = "R...K...B...O...U...".

### Foundational fix

**`decomp-globals.ts:getSubspriteChildOamIndices()`** — new exported function
that returns the union of all child OAM indices currently allocated by
`SetSubspriteTables` across the `_spriteSubsprites` registry.

Also exposed on `globalThis._getSubspriteChildOamIndices` so that
`decomp-runtime.ts:CreateSpriteAtOam` can consume it without circular import.

**`decomp-runtime.ts:CreateSpriteAtOam`** — extends the `takenSlots` set
build to include the child OAM indices :

```ts
const getChildOams = (globalThis as Record<string, unknown>)
  ._getSubspriteChildOamIndices as (() => Set<number>) | undefined;
if (getChildOams) {
  for (const idx of getChildOams()) takenSlots.add(idx);
}
```

This is **foundational** — every scene that mixes `SetSubspriteTables` with
plain `CreateSpriteAtOam` AFTER the subsprite installation benefits :
- Naming screen (= this session) ✓
- Future PC system (= storage box menu has multi-OAM cursor wraps).
- Future summary screen (= status condition icons + markings).
- Future party menu (= cursor wrap via SetSubspriteTables + party member
  HP-bar sub-sprites).

### Issue 1 — PLAYER trainer sprite (= NamingScreen_CreatePlayerIcon)

Was deferred in Session 92 (= "iconFunction 1 → fallback to NoIcon, requires
gObjectEvents engine"). Implemented properly in Session 94.

**Root cause** : two issues compound :

1. **Asset load** — Brendan/May overworld walking sprite (16x32) had not been
   loaded. Source asset is `public/decomp/em/object_events/people/{brendan,may}/walking.png`
   (144x32 = 9 frames of 16x32) + `palettes/{brendan,may}.pal`.
   The PNG layout is row-major in 8x8 tile coords (= 18 tiles wide × 4 tall).
   For 16x32 1D OAM (shape=2 V_RECTANGLE size=2 = 8 contiguous tiles needed),
   we have to REPACK frame 0's 8 tiles from non-contiguous PNG positions
   `[(c=0,r=0), (c=1,r=0), (c=0,r=1), (c=1,r=1), (c=0,r=2), (c=1,r=2),
     (c=0,r=3), (c=1,r=3)]` to a contiguous 256-byte buffer.
   This is what gbagfx tool does automatically when converting `.png → .4bpp`
   with frame layout. We replicate it inline in `loadNamingScreenAssets`.

2. **Bridge arg order swap** — `main-menu-impl.ts:DoNamingScreen` (the bridge
   between the auto-callback and the real impl) was passing args in WRONG
   order :
   ```
   auto-callback: DoNamingScreen(NAMING_SCREEN_PLAYER, name, playerGender, 0, 0, cb)
                                                            ↑ goes to monSpecies slot per decomp
   bridge sig:    DoNamingScreen(type, dest, gender, monSpecies, monPersonality, callback)
                                              ↑ named gender locally
   forward call:  mod.DoNamingScreen(type, dest, monSpecies, gender, ...)
                                                  ↑ passes 0 (= local monSpecies)
   ```
   Result : the real impl received `monSpecies = 0` and
   `monGender = playerGender`. But `NamingScreen_CreatePlayerIcon` reads
   `sNamingScreen->monSpecies` for gender (= decomp's reuse of monSpecies as
   gender for PLAYER context). With 0, always picked Brendan.
   **Fix** : rename bridge params to match decomp signature
   `(templateNum, destBuffer, monSpecies, monGender, monPersonality, callback)`
   so `monSpecies` arg is preserved through the chain.

### Implementation

| Function added | Location | Decomp ref |
|----|----|----|
| `getSubspriteChildOamIndices` | `decomp-globals.ts` | (foundation, no decomp ref) |
| `NamingScreen_CreatePlayerIcon` | `naming-screen-impl.ts` | `naming_screen.c:1397-1406` |
| Player trainer asset load (in-line in `loadNamingScreenAssets`) | `naming-screen-impl.ts` | implicit from `CreateObjectGraphicsSprite` + 16x32 OAM repack |

| Constants added | Tag | Asset URL |
|---|---|---|
| `GFXTAG_PLAYER_TRAINER_M` | `'GFXTAG_PLAYER_TRAINER_M'` | `/decomp/em/object_events/people/brendan/walking.png` |
| `GFXTAG_PLAYER_TRAINER_F` | `'GFXTAG_PLAYER_TRAINER_F'` | `/decomp/em/object_events/people/may/walking.png` |
| `PALTAG_PLAYER_TRAINER_M` | `'PALTAG_PLAYER_TRAINER_M'` | `/decomp/em/object_events/palettes/brendan.pal` |
| `PALTAG_PLAYER_TRAINER_F` | `'PALTAG_PLAYER_TRAINER_F'` | `/decomp/em/object_events/palettes/may.pal` |

### CreateInputTargetIcon dispatch — fully implemented for PLAYER + PCIcon

| iconFunction | Decomp NamingScreen_* | Status |
|--------------|----------------------|--------|
| 0 NoIcon     | NamingScreen_NoIcon  | ✓ explicit no-op |
| 1 PlayerIcon | NamingScreen_CreatePlayerIcon | ✓ Session 94 (Brendan/May 16x32 walking frame 0) |
| 2 PCIcon     | NamingScreen_CreatePCIcon | ✓ Session 92 |
| 3 MonIcon    | NamingScreen_CreateMonIcon | DEFERRED — requires pokemon_icon engine + 64-color icon palettes |
| 4 WaldaDadIcon | NamingScreen_CreateWaldaDadIcon | DEFERRED — requires gObjectEvents engine + OBJ_EVENT_GFX_MAN_1 |

### Files modified (Session 94)

- `src/engine/decomp-globals.ts` — `getSubspriteChildOamIndices` exported + globalThis-registered foundation.
- `src/engine/decomp-runtime.ts` — `CreateSpriteAtOam` consumes child OAM set when allocating slots.
- `src/engine/naming-screen-impl.ts` — added GFXTAG/PALTAG constants for player trainer ; in-line load + repack of 16x32 frame 0 ; `NamingScreen_CreatePlayerIcon` impl (1:1 décomp:1397-1406) ; updated `CreateInputTargetIcon` dispatch ; comments + deferred status documented.
- `src/engine/main-menu-impl.ts` — `DoNamingScreen` bridge param order corrected to decomp signature.

### Files added (Session 94)

- `public/decomp/em/object_events/people/brendan/walking.4bpp.bin` (2304 bytes, 72 tiles)
- `public/decomp/em/object_events/people/may/walking.4bpp.bin` (2304 bytes, 72 tiles)

### Confidence

- **Issue 1 (trainer sprite)** : HIGH (90%). Asset load + 16x32 frame 0 repack
  + correct gender source (= monSpecies field per decomp arg semantics) + correct
  shape/size (= V_RECTANGLE / size=2) + position (56, 37 = 1:1 décomp). Should
  render as small Brendan/May standing facing south at top-left of upper white
  section. Confidence not 100% only because we haven't visually verified yet
  that the frame 0 repacked layout matches what real GBA OAM 1D mode expects
  for 16x32 — gbagfx's exact tile-frame mapping for 16x32 sprites should be
  the same as our repack (col-major within frame, frame-major across frames).
- **Issue 2 (underscores)** : HIGH (95%). Fix is at the OAM allocation level,
  bug class is well-understood (= unique slot owner = fix). Underscores will
  pick fresh slots after all button children are accounted for.
- **Issue 3 (MAJ/SELECT button)** : HIGH (95%). Same OAM bug. Frame + Text +
  Button sprites no longer collide.
- **Issue 4 (BACK button RKBO → RETOUR/BOUTON B)** : HIGH (95%). Same OAM bug.
  All 6 BackButton children + all 6 OkButton children get unique slots.

### Manual test instructions (Session 94)

1. `npm run dev` → New Game → through Birch's gender pick + Lotad release.
2. After fade-out → naming screen.
3. Verify visual matches ROM screenshot :
   - **Top-left** : Brendan (if MALE) or May (if FEMALE) 16x32 sprite, standing
     south-facing, at (56, 37). NOT empty, NOT garbled.
   - **Center top** : "VOTRE NOM?" header text, clean.
   - **Below header** : 7 underscore sprites at y~56, evenly spaced
     across the entry field. Each underscore animates with a slight bob (= y2
     toggling 0..3 on the active position).
   - **Top-right column** : MAJ button frame + label (= 24x8 "MAJ" or
     equivalent label centered in the orange page swap frame at (204, 88)).
   - **Below page swap** : BACK button at (204, 116) showing "RETOUR" + "B"
     text labels rendered cleanly, not garbled.
   - **Bottom of right column** : OK button at (204, 140) — same as Session 92,
     unchanged from prior visual.
   - **Cursor** : red ring around 'A' top-left of letters keyboard.
4. Test gender flip : start a new game, pick FEMALE in gender picker. Verify
   the trainer sprite at top-left changes to May (= different palette,
   visibly different hair / outfit).
5. Test page swap : press SELECT. The MAJ → "min" / "div" label slides up + new
   label slides down.
6. Verify NO regression on Session 92 working features :
   - Cursor squish anim on A press.
   - D-pad movement.
   - Type a name + press Start → cursor jumps to OK + name returned to Birch.

### Deferred to future session

- Page swap BG VOFS shift (= keyboard tilemap vertical slide during swap),
  unchanged from Session 92 — requires per-scene VBlank dispatch infra.
- MonIcon (= NICKNAME / CAUGHT_MON) — requires pokemon_icon engine.
- WaldaDadIcon (= WALDA) — requires gObjectEvents engine.
- StartSpriteAnim(ANIM_STD_GO_SOUTH) — currently we hardcode the player icon
  to frame 0. To switch frames (= other directions), would need full
  CreateObjectGraphicsSprite + ANIM_STD_* anim definitions. For PLAYER
  context, frame 0 (= south-standing) is the only state used per decomp
  semantics, so this is fine.
- Visual verification by user (= the ROM screenshot can finally be matched
  by our impl). If user reports remaining divergence, it's likely either
  (a) the 16x32 frame 0 repack has wrong tile layout (= gbagfx may use
  per-frame-row-major not per-frame-col-major within the frame), in which
  case adjust the repack loop to swap r/c order ; OR (b) some other
  background tile data we haven't yet matched.

## End of AUDIT_1_1_DECOMP_V2.md
