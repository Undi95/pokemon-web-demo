# Audit M4A — Phase 8 systemic bug investigation (Session 77)

## Contexte

Le bisect Session 75-76 a confirmé que `synth.ts` post-Phase 8 (commit
`d9bab638`) introduit un **empilement de bugs numériques** vs pre-Phase 8
(`be7c2b48`). Le sustain CGB scale (`cgbSustainToGain`) a été identifié
comme facteur DOMINANT (~17× trop fort), mais **pas le seul** : Δ1-5 reverts
γ cumulatifs sonnent toujours mauvais.

Mission Session 77 : audit théorique fin du décomp `m4a.c` + `m4a_1.s` +
`m4a_tables.c` pour identifier TOUS les bugs numériques empilés, et
construire un patch candidat sur `bisect/audit-fix-candidate` pour test à
l'oreille du user.

## Sources lues

- `src/m4a.c:760-1232` — TrkVolPitSet, MidiKeyToCgbFreq, CgbModVol, CgbSound, CgbOscOff
- `src/m4a.c:70-100, 355-400` — m4aSoundInit, REG_SOUNDCNT_H, m4aSoundMode
- `src/m4a_1.s:1-320` — SoundMain, SoundMainRAM (DS envelope hardware)
- `src/m4a_1.s:1508-1536` — ChnVolSetAsm (volMR/volML calculation)
- `src/m4a_1.s:1538-1800` — ply_note (rhythmPan flag 0x80 decoding)
- `src/m4a_tables.c:100-180` — gCgbScaleTable, gCgbFreqTable, gNoiseTable, gCgb3Vol
- `include/gba/io_reg.h:615-633` — SOUNDCNT_H bit definitions
- `include/gba/m4a_internal.h:39-130` — ToneData, SoundChannel, CgbChannel structs
- `sound/voicegroups/**/*.inc` — recherche exhaustive 195 voicegroups
- `scripts/extract-voicegroups-m4a.mjs` — extracteur TS des voicegroups

## Bugs identifiés (par criticité)

### 🔴 BUG #1 — `cgbSustainToGain` ne reflète pas le PSG_VS_DS hardware ratio

**Source décomp** : `m4a.c:921` :
```c
chan->sustainGoal = (chan->envelopeGoal * chan->sustain + 15) >> 4;
```
→ retourne un `sustainGoal` 0-15 dans le DOMAINE PSG (NRx2 bits 7-4 hardware).

**Mixer hardware GBA** (`m4a.c:370`) :
```c
REG_SOUNDCNT_H = ... | SOUND_ALL_MIX_FULL;  // 0x000E
```
Décodage bits :
- bits 0-1 = `10` = `SOUND_CGB_MIX_FULL` (PSG ratio "full")
- bit 2     = `1`  = `SOUND_A_MIX_FULL`  (DS A "full")
- bit 3     = `1`  = `SOUND_B_MIX_FULL`  (DS B "full")

**MAIS même à `FULL/FULL`**, le PSG sortie est ~1/4 du DS sortie sur GBA hardware
parce que les DAC sont indépendants : PSG channel max amplitude = ~32 (5-bit
DAC interne), DS channel max = ~128 (8-bit signed PCM full scale). Ratio
inhérent ≈ 32/128 = 0.25.

**Bug post-P8** : `cgbSustainToGain(15, 15) = ((15×15+15)>>4)/15 = 1.0`
**vs pre-P8** : `gbaSustainToGain(15) = 15/255 ≈ 0.0588` → factor 17× écart.

**Fix appliqué** (commit `4c1efead`) :
- `envelope.ts` : ajoute `PSG_TO_DS_RATIO = 0.25` (pure hardware ratio).
- `synth.ts` : `sustainGain *= PSG_TO_DS_RATIO` pour CGB voices ; idem `envPeak`
  utilisé pour ATTACK ramp et RELEASE current level.
- Variable `envPeak` propagée pour cohérence (ATTACK target, sustainLevel
  normalisation, tremolo gain, pseudo-echo level).
- `programmable_wave` (channel 3) : applique `cgb3VolQuantize` (0%/25%/50%/100%)
  au sustainGain (1:1 décomp `m4a_tables.c:168-175 gCgb3Vol`). Helper existait
  mais **n'était jamais appelé** dans synth.ts post-P8.

**Impact estimé** : -12 à -15 dB sur CGB voices. Match attendu vs pre-P8.

### 🔴 BUG #2 — `pan_sweep` byte décodé comme pan absolu

**Source décomp** : `m4a_1.s:1612-1618` :
```asm
ldrb r1, [r6, o_ToneData_pan_sweep]   @ r1 = pan_sweep byte
movs r0, 0x80
tst r0, r1
beq _081DDB94                          @ skip si bit 0x80 NOT set
subs r1, TONEDATA_P_S_PAN              @ r1 -= 0xC0
lsls r1, 1                             @ r1 <<= 1 → ∈ [-128, +126]
str r1, [sp, 0x14]                     @ rhythmPan = r1
```
→ `pan_sweep` byte est un PAN seulement si `bit 0x80 set`. Sinon ignoré.

**Recherche exhaustive 195 voicegroups Pokemon Emerald** : AUCUN n'a un byte
≥ 128 → **bit 0x80 jamais set** → `rhythmPan` toujours 0 hardware.

Les valeurs décimales `64, 54, 24, 84, 94, 104` qu'on voit dans les drumsets
(`emerald_drumset_1.inc`, `route110.inc`...) sont des **paddings/historiques
IGNORÉS par le hardware GBA** (hérités d'une convention mks4agb préservée
depuis Gen 1).

**Bug post-P8** : `voice.pan ?? voice.panSweep ?? 0` lit ces paddings BRUTS
sans décoder le flag 0x80 → tous les drumset `directsound_no_resample` voices
(snare, hand_clap, ambient_tom, cymbal_crash, conga, taiko...) **paniquent à
gauche/droite au lieu d'être centrées**.

**Fix appliqué** (commit `4ca6b4a4`) :
- `extract-voicegroups-m4a.mjs` : helper `decodePanSweep(byte)` qui décode
  le flag 0x80 → champ optionnel `panOverride: number ∈ [-128, +126]`.
  Sinon ABSENT (= cas Pokemon Emerald 100%).
- `voice-types.ts` : remplace `pan: number` / `panSweep: number` par
  `panOverride?: number`.
- `synth.ts` : utilise `voice.panOverride` ADDITIF à `panMidi` (1:1 m4a.c:777
  `y = 2 * track->pan + track->panX`). Si undefined, `panY = 2 × (panMidi - 64)`.
- Régénère 195 voicegroups : 0 occurrence de `panOverride` → confirmation
  empirique du décodage hardware.

**Impact estimé** : tous les drumset DirectSound voices (= ~70% du mix battle/BGM)
recentrés correctement. Effet stéréo très visible.

### 🟡 BUG #3 — MAX_POLYPHONY=16 trop large + anti-click 3ms linear ramp

**Source décomp** : `m4a.c:78-81` :
```c
m4aSoundMode(SOUND_MODE_DA_BIT_8 | SOUND_MODE_FREQ_13379
           | (12 << SOUND_MODE_MASVOL_SHIFT)
           | (5 << SOUND_MODE_MAXCHN_SHIFT));  // ← 5 DS channels
```
→ `maxChans = 5` DirectSound + 4 CGB hardware = **9 voices effectives**.

**Bug post-P8** : `MAX_POLYPHONY = 16` permet 16 voices simultanées vs 9
hardware → notes empilées au lieu d'être stolées comme sur GBA. Effet
perceptuel : leads "moins punchy" parce que les notes longues précédentes
ne sont pas coupées net.

**Anti-click `linearRampToValueAtTime(0, t + 0.003)` post-P8** : pour CGB
voices avec `release=0`, cause **2 notes superposées pendant 3ms** sur le
même CGB channel. Sur drumkits denses + leads CGB, cumulatif → mix flou.

Pre-P8 utilisait `setTargetAtTime(0, t, 0.001)` = courbe exponentielle
~5ms à -60dB MAIS ~1ms à -20dB (= imperceptible click) **sans overlap
audible**.

**Fix appliqué** (commit `9d269d53`) :
- `MAX_POLYPHONY = 9` (1:1 hardware Pokemon Emerald).
- Anti-click switch en `setTargetAtTime(0, t, 0.001)` pour CGB voices
  avec release=0. Cas release > 0 garde linearRamp (1:1 hardware envelope).

**Impact estimé** : leads plus punchy ; drumkits denses moins flous.

### 🟡 BUG #4 — masterVolume mismatch (mineur)

**Source décomp** : `m4a_1.s:265-269` :
```asm
ldrb r0, [r0, o_SoundChannel_release]   @ = SoundInfo offset 7 = masterVolume
adds r0, 0x1                            @ masterVolume + 1
muls r0, r5                             @ × envVol
lsrs r5, r0, 4                          @ >> 4
```
→ DS final volume scale = `(masterVolume + 1) / 16`. Pour `masterVolume = 12`
(default Pokemon Emerald `m4a.c:80`) → `13/16 = 0.8125`.

**Bug pre-fix** : `player.ts` utilisait `12/15 = 0.8` (≈1.5% écart, -0.13dB).
Trivial à l'oreille mais on aligne 1:1 pour cohérence.

**Fix appliqué** (commit `b9d49d69`) :
- `player.ts` : `masterVolNorm = 13 / 16` au lieu de `12 / 15`.

## Bugs investigués mais NON corrigés (non-issues)

### Pan linéaire vs equal-power (post-P8 architecture α)
- Décomp `m4a.c:787-788` utilise pan linéaire (volMR/volML séparés).
- Post-P8 reproduit correctement (= GainNode L+R+ChannelMerger).
- Pre-P8 utilisait `StereoPannerNode` equal-power (= 3dB plus fort au centre).
- **Verdict** : pan linéaire post-P8 est CORRECT 1:1 hardware. Ce n'est pas
  un bug, juste un changement de caractère perçu comme "moins fort au centre".

### LFO vibrato range ±8 semitons
- Décomp `m4a.c:801` : `x += 16 × modM` puis `keyM = x >> 8`. modM ±127
  → keyM range = `(16×±127)>>8` = ±7.93 semitons.
- Post-P8 : `maxSemis = (depth/127) × 8` → matches hardware ±8.
- Pre-P8 : `× 1.0` (= ±1 semiton, TROP FAIBLE).
- **Verdict** : post-P8 a corrigé. Pas un bug régression.

### CGB pitch tables
- Décomp `m4a.c:810-854 MidiKeyToCgbFreq` utilise `gCgbScaleTable` +
  `gCgbFreqTable` pour produire le « micro-detune CGB » caractéristique.
- Post-P8 : `cgb-pitch.ts midiKeyToCgbFreqHz` reproduit 1:1.
- **Verdict** : 1:1 hardware. Bisect Δ1 a montré que reverter ça (= retour
  midiNoteToFreq 12-TET) sonne aussi mauvais → pas le bug solo.

### LFSR noise + AudioWorklet square + DFT wave
- Tous reproduisent fidèlement le hardware GBA.
- Bisect Δ2-Δ4 cumulatif les a tous reverts → toujours mauvais → ce ne sont
  pas les bugs solo.

## Hypothèses NON appliquées (à tester si le patch ne suffit pas)

### H1 — `currentLevel` pour cgbReleaseTimeSec
Si `cgbReleaseTimeSec` calcule basé sur `currentLevel × envelopeGoal` avec
envelopeGoal recalculé au stop time (= peut différer de noteOn si trackVolume
a changé), il y a un edge case. Solution simple : capturer `cgbGoal` dans
la closure du noteOn (déjà fait, `cgbGoal` est captured).

### H2 — Pan envelope LFO type 2 sign
- `m4a.c:780` : `if (modT == 2) y += track->modM;` — mod additionne directement
  à `y` (= pan signed -128..+127).
- Post-P8 : `lfoGain.connect(panR.gain)` + `-1 × lfoGain.connect(panL.gain)`.
- Vérifier si l'inversion est correcte sémantiquement.

### H3 — Reverb filter chain
- Décomp `m4a_1.s:96-118 SoundMainRAM_Reverb` : delay 1 V-blank + feedback
  via `(sample_now + sample_prev) × reverb >> 9`.
- Post-P8 `audio-context.ts` : delay 1 V-blank + feedback gain `reverb/256`
  + wet 40%/60% mix. Approx mais pas exact.
- Effet : sur Pokemon Emerald default reverb=50, le wet est moins prononcé
  qu'un feedback hardware. Probable contributeur secondaire.

## Branche & commits

Branche locale : `bisect/audit-fix-candidate` (depuis `be7c2b48` main).

Commits :
| # | Hash | Message |
|---|------|---------|
| 0 | `463cb73e` | apply post-P8 d9bab638 (= broken baseline) |
| 1 | `4c1efead` | fix #1 PSG_TO_DS_RATIO + cgb3VolQuantize ch3 |
| 2 | `4ca6b4a4` | fix #2 décoder flag 0x80 sur pan_sweep |
| 3 | `9d269d53` | fix #3 MAX_POLYPHONY=9 + anti-click exponential |
| 4 | `b9d49d69` | fix #4 masterVolume = 13/16 |

## Stratégie de test à l'oreille

### Plan A : tester le patch entier
1. `git checkout bisect/audit-fix-candidate`
2. Lancer le dev server (`npm run dev`)
3. Comparer Title BGM ou Battle BGM vs `main` (= pre-P8 baseline OK)
4. Si **mieux ou égal** : le patch est viable. Continuer tests sur autres
   BGM/SE pour valider.
5. Si **dégradé** vs main : revert progressif.

### Plan B : revert progressif si Plan A dégrade
Tester en ordre INVERSE des commits, depuis le plus suspect :

1. **Revert fix #3** (MAX_POLYPHONY 9 → 16, anti-click linear 3ms).
   Ce fix est le plus opinionated (changement architectural). Si ça reste
   mauvais après revert, le bug est numérique.

2. **Revert fix #4** (masterVolume 13/16 → 12/15). 1.5% écart → trivial,
   utile uniquement si le test est extrêmement précis.

3. **Revert fix #2** (panOverride decoding). Si ce revert sonne MIEUX, c'est
   que le hardware GBA utilise quand même les paddings 64/54/24 comme pans
   (= mon analyse asm est fausse). Très improbable mais à tester.

4. **Revert fix #1** (PSG_TO_DS_RATIO). Si revert et ça sonne mieux, c'est
   que le ratio 0.25 est trop bas. Tester d'autres valeurs : 0.125 (1/8),
   0.5 (1/2), 1.0 (= post-P8 original).

### Plan C : ajuster `PSG_TO_DS_RATIO`
Si le mix est dans le bon sens (CGB pas trop fort) mais légèrement faux,
ajuster la constante dans `envelope.ts:PSG_TO_DS_RATIO`. Valeurs à essayer :
- `0.0588` (= match pre-P8 empirique 15/255)
- `0.125` (= 1/8 hardware approx)
- `0.25` (= valeur courante du patch)
- `0.5` (= 1/2)

## Risques résiduels

1. **Hypothèse PSG_TO_DS_RATIO=0.25 non vérifiée empiriquement** : dérivée
   du raisonnement DAC PSG vs DS, mais le ratio exact dépend aussi des
   filtres analog GBA et de la calibration DAC. Pre-P8 empirique = 0.0588
   (= 1/17) est très différent de 0.25 (= 1/4). Si le test Plan A donne
   "CGB encore trop fort", essayer 0.125 ou 0.0588.

2. **Reverb chain non corrigée** (H3 ci-dessus). Probable contributeur
   secondaire qui ne sera pas adressé par ce patch.

3. **Effet du sweep (NR10 register, ch1)** : non simulé du tout. Sur Pokemon
   Emerald, peu de voicegroups l'utilisent (= bytes 0x10..0x7F sur pan_sweep),
   mais quelques-uns oui. Pas un bug régression.

4. **Voice stealing FIFO behavior** : sur GBA, le stealing est par PRIORITÉ
   (cf. `m4a_1.s:1685-1718`), pas par âge FIFO. Notre implémentation est
   simplifiée. À voir si c'est audible.

## Memory mise à jour

`project_audio_engine_status.md` doit être mis à jour pour Session 77 :
- Audit théorique complet effectué (4 bugs identifiés + 4 corrections).
- Branche `bisect/audit-fix-candidate` (commits 463cb73e..b9d49d69).
- En attente test à l'oreille du user.
