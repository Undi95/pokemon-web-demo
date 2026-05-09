# Session 124 final — bugs visuels fix

Date : 2026-05-09
Branche : `upd2` (= **75 commits** ahead of `main`, NE PAS PUSH)

## TL;DR

User dort en micro-sieste, m'a dit de continuer en autonomous + tester. Session
suivant 4 fixes majeurs livrés.

## ✅ Bugs fixés (= 5 commits)

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

### Bug 3 partial — caisse 1-pixel coupée (`a3812632`)

User : "(un pixel visible lors du trajet) — Notre cinématique n'est pas 1:1
(preuve des cartons encore un peu bugué)"

Diagnostic 1:1 décomp : `sElevationToPriority[elevation]` détermine priority
OAM. Pour caisses elevation=8 → priority 1 au lieu de 2 hardcodé.

Le décomp utilise AUSSI `sElevationToSubspriteTableNum[8]=2` qui split sprite
16x16 en 2 sous-OAMs 16x8 (top priority 2, bottom priority 3). Ce split full
1:1 = TODO future (= complex car nécessite refactor NamingSubsprite layout
pour 16x16 boxes spécifiquement).

Pour l'instant : single OAM 16x16 avec priority elevation-corrected. Devrait
mitiger le 1-pixel artifact dans les cas communs où caisses overlap avec
player.

## ❌ Bugs restants

### Bug 3 full 1:1 — split subsprite 16x16 vers 2× 16x8

Pour eliminate complètement le 1-pixel artifact, il faut spawn 2 sous-OAMs
16x8 par caisse elevation=8 :
- Top half : x=-8, y=-8, shape=16x8 (= shape=1, size=0), tileOffset=0,
  priority=2
- Bottom half : x=-8, y=0, shape=16x8 (= shape=1, size=0), tileOffset=2,
  priority=3

Cf. `D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_
subsprites.h` for sOamTable_16x16_2 layout.

Notre engine a déjà `SetSubspriteTables` + `syncSubspriteOam` (= used pour
truck 48x48). À étendre pour 16x16 avec elevation=8 trigger.

### Bug 5 (mentioned nuit) — Battle polish

- Real HP bar tiles
- Shake on damage
- EXP gain + level-up
- PlayCry on starter confirm
- Battle BG transition fade

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
