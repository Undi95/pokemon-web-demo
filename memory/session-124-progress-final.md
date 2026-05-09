# Session 124 final — bugs visuels + battle polish + truck audit

Date : 2026-05-09
Branche : `upd2` (= **84 commits** ahead of `main`, NE PAS PUSH)

## TL;DR

Session 124 = **20 commits** : 4 bugs visuels signalés + 4 battle polish (EXP
gain, level up, cry, shake, HP bar visuel, fade transition) + 2 transpiler
updates + truck audit ligne par ligne (= HMR-safe + Task_Truck3 box update +
audio hacks reverted) + shiny support 1:1 + truck silence diagnostic
(= SF2 sample manquant, accepted MVP).

## ✅ Décisions architecture (= confirmation user session 124)

**1:1 décomp strict** sauf 2 exceptions justifiées :

| Module | 1:1 ? | Justification |
|--------|-------|---------------|
| Wallclock + RTC | NON | Fix bug critique 366-day overflow + UX (PC time as source) |
| Battle engine | Backend NON, Front-end OUI | Backend = Showdown (@pkmn/sim), Front-end = GBA visuel 1:1 |
| RNG | OUI | Critique pour ROM hacking community ("SR au boot pour shiny") |
| Tout le reste | OUI | Strict, audits réguliers |

**RNG decision** : reste 1:1. User a tâté l'idée de modifier mais on a conclu :
- Le 366-day était un BUG (= passe à day 366 → wrap → events cassés)
- Le RNG n'est PAS un bug — c'est une FEATURE attendue par la communauté
- ROM hackers ont des outils basés sur RNG behaviour ROM (= frame-perfect IVs)
- Pas de gain réel à modifier

## ✅ Bugs fixés (= 9 commits cette session)

### Bug 4 — WallClock freeze + 366-day overflow (`5950d0c5`)

User insight critique : "Le jeu d'origine à un problème, après 1 an, on passe
à jour 366 = pas d'année = retour jour 1 [...] cette fois ça brise le jeu."

**Approche assumée NON-1:1** (= seul cas où on dévie strict) :
- Source RTC = `Date.now()` JS (= 53-bit safe → millions d'années)
- `gLocalTime.days` désormais un number JS (= no s16 wrap)
- Offset utilisateur en `localTimeOffsetMs: number` dans gSaveBlock2

**Fichiers nouveaux** :
- `src/engine/rtc.ts` — RtcCalcLocalTime + RtcGetMinuteCount + offset setters
  1:1 décomp signature, source = PC time. Expose `dev.wallclock.{set,reset,
  getOffsetMs,getLocalTime,getInGameDate,getInGame12Hour,getInGameDayOfWeek}`.
- `src/engine/wallclock-flow.ts` — UI overlay HTML/Canvas (cercle + aiguilles
  + AM/PM + chiffres + cloud floating). Modes VIEW/SET. Pas pixel-perfect ROM
  mais fonctionnel + joli (= cf. screenshot 12:15 PM en test).

**Fichiers modifiés** :
- `script-opcodes.ts` : opcode `special` intercepte `Special_ViewWallClock` +
  `StartWallClock` → `wallclock-flow.ts`. Opcode `gettime` ajouté 1:1 décomp
  `ScrCmd_gettime`.
- `script-runner.ts` (legacy) : fallback msgbox via rtc.ts source unifiée.
- `save-blocks.ts` : add `localTimeOffsetMs: number` field.
- `save-system.ts` : LoadGameSave restore offset → rtc.ts ; TrySavingData
  persiste offset via `globalThis.__rtcModule`.
- `specials-registry.ts` : retire stubs no-op (= obsolets).
- `main.ts` : `import './engine/rtc'; exposeRtcDevApi()`.

**Test live verified** : `dev.wallclock.getLocalTime()` retourne `{days:9625,
hours:12, minutes:15, seconds:30}` = 2026-05-09 PC time correct.
`startWallClockFlow('VIEW')` rend overlay correct.

### Bug 1 + Bug 4-lock + FieldClear stub (`b1c65e75`)

**Bug 1 - Vigoroth déménageurs garbage rendering** :
PNG `vigoroth.png` est 5 frames horizontaux 32×32 (= 160×32 = 20 tiles wide).
Code copiait `subarray(0, 16*32)` = 16 premiers tiles row-major = 4 frames
partiels horizontalement → garbage.

Fix : nouveau helper `pngTo1dObjLayoutSingleFrame()` qui réorganise un frame N
depuis PNG row-major vers OBJ 1D MAP (= 4×4 tiles séquentiels).

Frame index par graphics ID :
- VIGOROTH_CARRYING_BOX → frame 0 (1:1 sPicTable_VigorothCarryingBox[0])
- VIGOROTH_FACING_AWAY → frame 3 (1:1 sPicTable_VigorothFacingAway[0])

**Bug 4-lock** : le `waitstate` qui suit `Special_ViewWallClock` pollait un
map-switch jamais arrivé → freeze close UI.

Fix : nouveau `_waitStateSignaled` global + `SignalWaitState()` exporté.
L'opcode `waitstate` consume le signal (= équivalent décomp `ScriptContext_
Enable()`). `wallclock-flow.ts` à state DONE call `SignalWaitState()`.
Pattern réutilisable pour futurs UI flows.

**FieldClearVBlankHBlankCallbacks stub** : bug runtime préexistant — fonction
référencée par `overworld-callbacks-auto.ts` (11 callsites incl.
CB2_ContinueSavedGame) sans import → ReferenceError au Continue depuis main
menu. Fix : `gba-global-scope.ts` expose stub 1:1 décomp + `SetHBlankCallback`
no-op pour completness.

### Bug 2 — Truck SE timing (`b171a2f8`)

User insight critique : "Dans la rom, je pense que le bruit continue jusqu'à
ce que l'autre animation (arrêt) se joue. Ici, le son s'arrête avant que le
script d'arrêt commence."

Diagnostic : ROM SE_TRUCK_MOVE est probablement long sample with sustain
loop GBA m4a. Notre WAV pre-rendered 8s ONE-SHOT → finit avant SE_STOP.

Fix : nouveau helper `playPrerenderedSEWithLoop(songName, slot)` qui set
`source.loop = true` sur le BufferSource. Boucle infiniment jusqu'à
`stopPrerenderedSE`.

`truck-cinematic.ts` state 0→1 : `playPrerenderedSEWithLoop('se_truck_move',
'se1')` au lieu de `PlaySE(SE_TRUCK_MOVE)`. State 2→3 inchangé : stop loop +
play SE_STOP → no gap.

Restoré ROM `tTimer > 300` 1:1 décomp (mes attempts précédents d'aligner sur
durée audio sample = approche incorrect, reverted).

### Bug 3 partial → full — caisse 1-pixel coupée (`a3812632` + `594d3c3b`)

User : "(un pixel visible lors du trajet) — Notre cinématique n'est pas 1:1
(preuve des cartons encore un peu bugué)"

**Partial fix (`a3812632`)** : `sElevationToPriority[elevation]` 1:1 décomp.
Pour caisses elevation=8 → priority 1 (= au lieu de 2 hardcodé).

**Full fix (`594d3c3b`)** : Implémente `sOamTable_16x16_2` 1:1 décomp = split
sprite 16x16 en 2 sous-OAMs 16x8 :
- Top half : x=-8, y=-8, shape=16x8, tileOffset=0, priority 2 (= ABOVE)
- Bottom half : x=-8, y=0, shape=16x8, tileOffset=2, priority 3 (= BEHIND)

Élargi à toutes elevations qui ont subspriteTableNum=2 (= 4, 6, 8, 10, 12).
Use `SetSubspriteTables` existant (= partagé avec truck 48x48 system).

Permet le 1:1 décomp behavior où la moitié BOTTOM peut passer derrière
d'autres sprites priority 2 (= player, etc.).

### Bug 5 — EXP gain + level up post-victoire (`5d22d74a`)

Implémente le 1:1 décomp Gen 3 formula : `exp = (baseExp × defeatedLevel) / 7`.

`pokemon.ts` :
- `PokemonInstance` : add `currentExp?: number` + `growthRate?: string`.
- `createPokemonInstance` : init via `getExperienceForLevel(rate, level)`.
- `calculateExpGain(defeatedSpeciesEnum, defeatedLevel)`.
- `applyExpAward(mon, gained)` : add exp, loop level-up, recalc maxHp + heal
  proportionally (= 1:1 décomp).

`battle-flow.ts` :
- States `EXP_AWARD_TEXT/WAIT` + `LEVEL_UP_TEXT/WAIT` après `OPP_FAINTED_WAIT`.
- "PLAYER gagne X POINTS D'EXP.!" + "PLAYER monte au niveau N!" si applicable.

### Bug 5b — PlayCry au confirm starter (`11916b18`)

Au moment où player confirms son starter (= `COMMIT_INIT`), play le cri
via `playCry(speciesName)`. Reproduit le moment iconic de Gen 3.

### Bug 5c — shake on damage feedback visuel (`311763a1`)

Sprite shake horizontal 14 frames quand damage > 0, typeMul ≠ 0.
Décroissance linéaire amplitude (= 4px → 0). Trigger sur les deux camps
(= player damage opp ET opp damage player).

### Bug 6a — extractor parse C array sizes avec expressions (`7244d75f`)

Regex `RE_ANIMS_TABLE` + `RE_AFFINE_ANIMS_TABLE` relaxées de `\[\s*\]` à
`\[[^\]]*\]`. Capture maintenant `[NUM_PRESS_START_FRAMES + NUM_COPYRIGHT_FRAMES]`
→ `sStartCopyrightBannerAnimTable` extrait automatiquement (= patch manuel
session 113 supprimé).

### Bug 6b — extractor resolve constants extract-time (`74a11903`)

`parseAnimCmd(name, body, macros)` lookup les constants via macroCtx.
Résolution `tileNum: "VERSION_BANNER_RIGHT_TILEOFFSET"` → `tileNum: 64`
au extract-time → moins de runtime fallback `_resolveTileNum`.

### Truck cinematic — HMR-safe + Task_Truck3 box update + audio revert (`b98b4c74`, `d73230ee`)

**User insight final A/B test ROM** : "Soit il manque des notes de fin au
son 1, soit il y a un son entre les deux qu'on a pas. Sur la rom, y a un
son qu'on entend pas chez nous. Le timing 1:1 est juste, enlève tes hack."

→ Le timing décomp est PARFAIT 1:1. Le silence perçu = un sample audio
MANQUANT côté SF2 / spessasynth (= rendu MIDI imparfait vs ROM m4a
hardware). Ne peut pas être fix sans re-ripper les samples ROM proprement.

**Accepted as-is** pour MVP. Tous les hacks audio reverted dans `d73230ee` :
- Pas de `playPrerenderedSEWithLoop`
- Pas de mono-cut sur slot se1
- `PlaySE(SE_TRUCK_MOVE)` + `PlaySE(SE_TRUCK_STOP)` standard 1:1 décomp

**Conservé** (= bug fixes réels) :
- HMR-safe guard via globalThis (= empêche cacophonie 6× tasks)
- Task_Truck3 box update (= 1:1 décomp box continue X-shake when xpan===2)
- preloadPrerenderedSEs (= optimization no-harm, pre-load les 4 SE truck)

**TODO future** : re-rip ROM samples via bregalad gba-mus-ripper pour les
4 SE truck pour close le gap audio vs ROM authentic.

**User insight critique** : "c'est bizarre ce spam de lancement de musique
dans les logs" → HMR Vite reloadait le module à chaque commit, mais sans
détruire les anciens `Task_HandleTruckSequence` → 6 cinematics jouant leurs
SE simultanément = cacophonie audio + boxes "freezent" car 6 sources
écrivent leurs visualOffsets concurrently.

Fix HMR :
- Guard `_truckGlobal` via `globalThis` (= survit module reload).
- Track `taskId` courant. Au start : si guard active, kill ancien task +
  stop tous SE sur slots se1/se2.

Audit ligne par ligne décomp `field_special_scene.c` Task_Truck3 (lignes
152-178) : quand `sTruckCamera_HorizontalTable[step]===2`, le func task
swap de Task_Truck2 → Task_Truck3 :
- Y bob arrêté (cameraYpan=0)
- **Boxes Y revient à offset spawn (3, -3, 0)**
- Boxes X continue de follow le shake horizontal

Notre code n'updatait PAS les box positions dans ce cas → boxes "freezent".
Fix : nouveau helper `_applyBoxNoYBob(cameraXpan)` dans state 3 case xpan===2.

### Shiny support 1:1 décomp (`08d12977`)

User explicit demande : "Il faut aussi ajouté le caractère shiny support
showdown lors de l'import (pas dans la liste)".

`pokemon.c:CreateBoxMon` (lignes 2207-2244) implementation :
  ```
  personality = Random32();
  value = playerTrainerId;
  shinyValue = HIHALF(otId) ^ LOHALF(otId) ^ HIHALF(personality) ^ LOHALF(personality);
  isShiny = shinyValue < SHINY_ODDS;  // SHINY_ODDS = 8
  ```

Probability = 8/65536 = 1/8192 (= classic Gen 3 odds).

`PokemonInstance` add `personality` + `isShiny`. `pokemonToShowdownSet`
propage `shiny: p.isShiny ?? false` vers @pkmn/sim.

RNG impact : aucun — décomp utilise déjà 2× Random() pour personality
avant les IVs. Notre code matche cet order exact → frame-perfect compat.

## ❌ Bugs restants (= TODO Phase 5+)

### Truck SE samples manquants

Re-rip via bregalad gba-mus-ripper pour close le gap audio. User a confirmé
en A/B test ROM que le timing 1:1 est juste mais qu'il manque un son
intermediate (= peut-être queue de SE_MOVE, ou un SE_TRUCK_BRAKE entre
MOVE et STOP) absent de notre rendu SF2.

### HP bar tilemap pixel-perfect

Notre impl Bug 5d = simple FillWindowPixelRect. Le ROM utilise un tilemap
dédié avec gradient + drain animation. Phase 5 = real tilemap HP bar.

### Battle transition effects

Notre impl Bug 5e = simple BeginNormalPaletteFade. Le ROM utilise
`BattleStartTransition` avec swirl/wave effects multi-mode. Phase 5 =
real transition system avec `transition-type` selon trainer/wild/etc.

### Bug 6 — Update extractor/transpiler

(= conservé inchangé dans `next-session-bugs-2026-05-09.md`)
- 6a. sStartCopyrightBannerAnimTable designated initializer
- 6b. _resolveTileNum() runtime fallback could move to extractor
- 6c. CreateSprite subpriority pass-through preservation
- 6d. audit-extractor-output.mjs script

## 🛠 Architecture session 124

**Pattern WallClock UI inline** : reproductible pour futurs UI flows.
1. Module `xxx-flow.ts` exporte `startXxxFlow(): { tick(): boolean }`
2. Opcode `special` dispatcher dans `script-opcodes.ts` intercepte le
   special name → `SetupNativeScript` poll le tick.
3. Quand tick returns true (= UI done), call `SignalWaitState()` pour
   débloquer le `waitstate` qui suit (= 1:1 décomp `ScriptContext_Enable()`).
4. Le runtime advance au next opcode (= releaseall + end).

**Module RTC** : source unique de vérité = `rtc.ts:gLocalTime`. Les
auto-extracted clock-data.ts / time-events-data.ts continuent de marcher
SANS modification (= struct Time compat préservé).

**playPrerenderedSEWithLoop** : nouveau helper réutilisable pour BGM-like
SE qui doivent jouer continuously (= ROM audio-engine sustain loop emulé).

## 📂 Fichiers clés à read post-compaction

```
memory/session-124-progress-final.md         # ← CE FICHIER (= entry point)
memory/session-124-progress.md               # legacy progress (batch 4)
memory/next-session-bugs-2026-05-09.md       # liste 5 bugs orig + Bug 6
memory/MEMORY.md                             # directives + user pref
```

## 📅 Que faire ensuite

1. **Bug 3 full** : implémenter sOamTable_16x16_2 split via SetSubspriteTables
2. **Bug 5** : EXP gain + level-up + HP bar tiles + cry on starter
3. **Bug 6** : update transpiler + audit-extractor-output.mjs
4. **Phase 5** : Battle Engine refactor (BattleScene Phaser → 1:1 décomp)
5. **Phase 4 RNG sync** finale
