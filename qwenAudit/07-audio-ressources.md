# Audit 7/8 : Audio et ressources

## Comparaison web projet vs décomp pokeemeraude

### Architecture décomp audio

**Fichiers décomp clés** :
- `src/m4a_1.s` (~3 500 lignes asm) — SoundMainRAM, m4aSoundInit, m4aMain, m4aClock, mixing loop, reverb, volume/pitch ramping, fade in/out
- `src/m4a.c` (~1 200 lignes C) — m4aSoundInit, m4aSongNumStart, m4aMPlayStart/Stop/FadeIn/FadeOut, m4aMPlayContinue, VoiceGroup parsing, noise channel, DAC output
- `src/m4a_tables.c` (~500 lignes) — gNoiseTable, gCgbFreqTable, gSineTable, gPanTable, key split tables
- `src/sound.c` (~800 lignes) — PlayBGM, PlaySE, PlayCry, StopBgmOnMapChange, MapMusicMain, sound effect management
- `sound/voicegroups/*.inc` (~100 voicegroups × 30-60 lignes = ~3 000-6 000 lignes) — voice_square_1/2, voice_directsound, voice_noise, voice_programmable_wave, keysplit definitions
- `sound/direct_sound_samples/*.wav` (~200 samples) — PCM samples pour les voice_directsound entries
- `sound/music/*.mid` (~300 songs) — MIDI files pré-compilés par mid2agb
- `sound/se_*.mid` (~80 SE) — Sound effects
- `sound/cries/*.wav` (~200 cries) — Pokémon cries avec pitch shifting runtime

**Total décomp audio** : ~9 000-11 000 lignes code + 300 songs + 200 samples + 200 cries

### Architecture web projet

**Fichiers correspondants** :
- `src/engine/m4a/audio-context.ts` (127 lignes) — AudioContext singleton, master gain, DAC filter, reverb chain, limiter
- `src/engine/m4a/player.ts` (676 lignes) — Multi-slot synth (bgm/se1/se2), MIDI playback via spessasynth_lib + SF2, noise routing, custom synth fallback, fade in/out
- `src/engine/m4a/voice-types.ts` (148 lignes) — VoiceType enum, Voice interfaces (DirectSound, Square, Noise, ProgrammableWave, Keysplit)
- `src/engine/m4a/voice-resolver.ts` (~80 lignes) — resolveVoice recursive (voicegroup + MIDI program → Voice concret)
- `src/engine/m4a/synth.ts` (~300 lignes) — Web Audio synth (OscillatorNode square, AudioBufferSource noise/DS, ADSR envelope, pan, polyphony management)
- `src/engine/m4a/noise-engine.ts` (~100 lignes) — LFSR noise LFSR 15-bit/7-bit, gNoiseTable, decodeNr43
- `src/engine/m4a/square-engine.ts` (~50 lignes) — AudioWorklet square wave non band-limited
- `src/engine/m4a/se-noise-engine.ts` (~150 lignes) — SE noise routing, noise track detection + strip
- `src/engine/m4a/se-noise-prerendered.ts` (~50 lignes) — Prerendered noise SE
- `src/engine/m4a/cgb-pitch.ts` (~40 lignes) — CGB pitch shifting helpers
- `src/engine/m4a/envelope.ts` (~40 lignes) — ADSR envelope helpers
- `src/engine/m4a/programmable-wave.ts` (~40 lignes) — Programmable wave table
- `src/engine/m4a/sample-loader.ts` (~100 lignes) — DirectSound sample manifest + cache, smpl chunk parsing
- `src/engine/m4a/voicegroups-data/` (~100+ fichiers × 20-100 lignes = ~5 000-8 000 lignes) — Voicegroups data extracted from decomp
- `src/engine/music.ts` (246 lignes) — Bridge API (playMidiLoop, playSE, playCry, playFanfare, stopMusic)

**Total web audio** : ~4 000-5 000 lignes code + ~5 000-8 000 lignes voicegroups data

---

## Écarts détectés

### ERREUR E7.1 — Dual architecture audio : spessasynth + custom synth (HIGH)

**Décomp** : le M4A engine est un seul pipeline unifié. Toutes les voices (square, noise, DS, programmable wave) passent par le même mixer software (`m4aMain` → `m4aClock` → mixing → DAC output).

**Web** : DEUX pipelines parallèles :
1. **spessasynth_lib + SF2** (`player.ts:186`) — MIDI playback via WorkletSynthesizer. Utilise un SoundFont rippé de la ROM pour les samples DirectSound. C'est le pipeline principal pour les BGM.
2. **Custom synth** (`player.ts:608`) — Web Audio native (OscillatorNode + AudioBufferSource). Utilisé pour les SE noise que le SF2 ne reproduit pas correctement.

**Problème** : l'architecture dual pipeline est fondamentalement différente du décomp. Le décomp a un seul mixer. Le web a :
- BGM = spessasynth/SF2 (samples SF2 ≠ samples ROM exacts)
- SE noise = custom synth LFSR (correct)
- SE non-noise = spessasynth/SF2 OU custom synth selon `songUsesNoiseVoice`

**Impact** : le son des BGM peut diverger du décomp car :
- Les samples SF2 sont rippés mais peuvent différer des DirectSoundWaveData originaux (différents loop points, different resolution)
- Les voicegroups spessasynth ne respectent PAS les definitions décomp (sweep square 1, duty cycle, programmable wave) — le SF2 contourne tout ça avec des samples pré-enregistrés
- Le timing note-on/note-off peut différer (spessasynth a son propre scheduler vs le m4aClock décomp)

**Fichiers** : `src/engine/m4a/player.ts`
**Criticité** : HIGH — le dual pipeline crée une divergence fondamentale avec le décomp. Les BGM sonnent probablement différemment (même si c'est subtil). Les SE noise sont corrects mais le routing est bifurqué.

### ERREUR E7.2 — m4aClock absent : scheduling MIDI vs M4A tick

**Décomp** : `m4aClock` est appelé chaque frame (ou plus fréquemment selon VBlank). Il fait :
1. Ramping volume/pitch per-channel
2. LFO processing (tremolo, vibrato)
3. Reverb processing (1 frame delay + feedback)
4. Mixing all channels → output buffer
5. DAC output via DMA

**Web** : pas de m4aClock. Le scheduling est délégué à :
- `spessasynth Sequencer` — MIDI events scheduling interne
- `playNote` (synth.ts) — Web Audio scheduling explicite (`when = startTime + note.time`)

**Impact** : le timing des notes est différent. Le décomp schedule les notes au tick M4A (= résolution frame). Le web schedule au timestamp AudioContext (= résolution sample). Les rampes volume/pitch sont différentes (décomp = linéaire par frame, web = Web Audio exponential/linear).

**Fichiers** : `src/engine/m4a/player.ts`, `src/engine/m4a/synth.ts`
**Criticité** : MEDIUM — la résolution sample est techniquement PLUS précise que la résolution frame, mais les rampes et le timing global ne sont pas 1:1.

### ERREUR E7.3 — Noise channel : LFSR correct mais dual implémentation

**Décomp** : `m4a.c` noise channel :
- NR43 register → LFSR frequency
- gNoiseTable mapping MIDI key → NR43 byte
- 15-bit et 7-bit LFSR modes
- Mono channel (nouvelle note cut la précédente)

**Web** : DEUX implémentations noise :
1. **LFSR AudioBuffer** (`noise-engine.ts` + `synth.ts`) — pré-compute la séquence LFSR dans un AudioBuffer caché, joué via AudioBufferSource avec playbackRate. Correcte mais pas temps-réel.
2. **AudioWorklet LFSR** (`player.ts:438`) — 1 bit pseudo-random par audio sample. Temps-réel. Utilisée par `playNoteNoiseWorklet`.

**Vérification** :
- `gNoiseTable` 1:1 décomp ✅ (60 entries, MIDI key 21-80)
- `decodeNr43` ✅ (freq = 524288 / divisor / 2^(s+1))
- `midiNoteToNoiseFreq` ✅ (clamp 20-80)
- LFSR 15-bit (32767 samples) et 7-bit (127 samples) ✅
- Mono-cut entre notes ✅ (_slotLfsrSources + _slotNoiseWorklets)

**Problème** : les 2 implémentations coexistent mais ne convergent pas. `playNoteNoiseLFSR` utilise l'implémentation 1, `playNoteNoiseWorklet` utilise l'implémentation 2. Le choix est fait par le caller, pas par le type de voice.

**Criticité** : LOW — les 2 implémentations sont correctes individuellement. La coexistence est un technical debt mais pas un bug audible.

### ERREUR E7.4 — Square wave : AudioWorklet non band-limited ✅

**Décomp** : les canaux square 1/2 génèrent des carrés parfaits non band-limited. L'aliasing est un artifact attendu du DAC 13.379 kHz.

**Web** : `square-engine.ts` crée un AudioWorkletNode `m4a-square-processor` qui génère des carrés non band-limited. Le double lowpass à 6.5 kHz dans `audio-context.ts` simule le filtrage DAC analog.

**Vérification** :
- Duty cycle parameter ✅ (12.5%, 25%, 50%, 75%)
- Frequency parameter ✅
- Sweep (square 1) partiel — sweep est géré par le voicegroup definition mais le runtime sweep processing est absent

**Criticité** : LOW — le sweep square 1 n'est pas un runtime effect mais une paramètre statique dans le voicegroup. Fonctionnel.

### ERREUR E7.5 — Reverb : 1:1 décomp ✅

**Décomp** : `SoundMainRAM_Reverb` (m4a_1.s) — simple delay 1 frame + feedback.
- `output = (sample_now + sample_prev) × reverb >> 9`
- Reverb level 0-127 (default ~50 pour Pokemon Emerald)

**Web** : `audio-context.ts` (ligne 44-78) :
- `DelayNode` avec `delayTime = 1 / 59.7275` ✅ (V-blank GBA exact)
- `feedback.gain = 50 / 256` ✅ (~20% feedback)
- `wet.gain = 0.4` ✅ (wet/dry mix)
- `setReverb(value)` 0-127 range ✅

**Criticité** : ✅ CORRECT — reverb chain 1:1 fidèle

### ERREUR E7.6 — DAC filter : double lowpass Butterworth ✅

**Décomp** : DAC GBA à 13.379 kHz. Nyquist = ~6.690 Hz. Tout au-dessus de 6.7 kHz est filtré par le hardware.

**Web** : `audio-context.ts` (ligne 27-42) — double cascade de BiquadFilterNode lowpass à 6.5 kHz, Q=0.7071 (Butterworth flat). -24 dB/oct.

**Vérification** : le cut-off 6.5 kHz est légèrement en dessous du Nyquist 6.690 kHz du décomp, ce qui donne un filtrage légèrement plus agressif. Acceptable car le but est de simuler le grain "vintage".

**Criticité** : ✅ CORRECT — approximation raisonnable du DAC GBA

### ERREUR E7.7 — DirectSound samples : manifest + cache ✅

**Décomp** : `DirectSoundWaveData_*` symbols pointent vers les PCM samples dans la ROM. Les samples sont joués avec pitch shifting basé sur la note MIDI vs baseKey.

**Web** : `sample-loader.ts` charge un manifest JSON (`_manifest.json`) qui mappe les symboles asm → URL WAV. Cache par symbole. Parse le smpl chunk pour les loop points.

**Vérification** :
- Manifest loading ✅
- Symbol resolution ✅
- smpl chunk parsing ✅ (RIFF header + fmt + smpl + data)
- Loop points extraction ✅

**Criticité** : ✅ CORRECT — pipeline DirectSound samples fonctionnel

### ERREUR E7.8 — Voicegroups : ~100 voicegroups extraits ✅

**Décomp** : ~100 voicegroups dans `sound/voicegroups/*.inc`.

**Web** : ~100+ fichiers dans `voicegroups-data/` (abandoned_ship, b_arena, contest, drum_emerald_1/2, encounter_*, gym, intro, etc.). Index centralisé via `_all-voicegroups-index.ts`.

**Vérification** :
- Keysplit tables ✅ (`_keysplit-tables.ts`)
- Recursive resolve ✅ (resolveVoice depth ≤ 5)
- Drumset support ✅ (offset mapping, keysplit_all)

**Criticité** : ✅ CORRECT — voicegroups complets avec keysplit recursive

### ERREUR E7.9 — MapMusicMain absent : transition BGM incomplète

**Décomp** : `MapMusicMain` (sound.c) appelé chaque frame dans le main loop. Gère :
1. Transition BGM sur changement de map
2. Volume ramping BGM
3. Check si BGM doit changer selon le contexte (battle, event, etc.)
4. Saved BGM restoration

**Web** : `MapMusicMain` absent du tick loop. La gestion BGM est faite via :
- `playMidiLoop(url)` (music.ts:84) — start BGM loop
- `setSavedBgm` / `getSavedBgm` (music.ts:173) — save/restore BGM
- `restoreTimer` (music.ts:140) — restore BGM après SE

**Impact** : les transitions BGM lors des changements de map ne sont pas gérées par un équivalent de MapMusicMain. Le fade out/in existe (`fadeOutBgm`/`fadeInBgm`) mais le routing contextuel (e.g., stop music quand on entre en battle, resume après) est géré manuellement par les callers.

**Fichiers** : `src/engine/music.ts`, `src/engine/decomp-runtime.ts`
**Criticité** : MEDIUM — les transitions BGM contextuelles (battle start/end, map change) peuvent manquer des fades ou jouer des SE par-dessus la BGM sans restauration.

### ERREUR E7.10 — Pokémon cries : WAV playback simple ✅

**Décomp** : `PlayCry` (sound.c) — charge le cry WAV, applique pitch shift basé sur le species + level, joue via DirectSound channel.

**Web** : `playCry` (music.ts:153) — fetch WAV, decode AudioBuffer, play via AudioBufferSourceNode avec gain 0.7.

**Manquant** :
- Pitch shift par species/level ❌ — le web joue le cry à la pitch originale
- DirectSound channel routing ❌ — le cry passe par le master gain mais pas par le DS channel M4A

**Impact** : les cries sonnent à la bonne hauteur pour le species par défaut mais pas pour le level du Pokémon. Le pitch shift décomp ajuste le cry selon le niveau et les stats.

**Criticité** : LOW — les cries fonctionnent mais sans le pitch shift contextuel.

### ERREUR E7.11 — m4aSongNumStart bridge : correct ✅

**Décomp** : `m4aSongNumStart(songNum, voicegroup)` — start MIDI playback from song header table.

**Web** : `m4aSongNumStart` exposed via `decomp-globals.ts` → bridge vers `music.playMidiLoop(url)`. Le mapping songNum → URL est géré par la table des songs décomp.

**Vérification** :
- `m4aSongNumStart` bridge ✅
- Song table mapping songNum → filename ✅
- Voicegroup resolution ✅ (via `lookupVoicegroup` + `song-voicegroups.json`)

**Criticité** : ✅ CORRECT

### ERREUR E7.12 — Polyphony : 128 voices vs 6 channels hardware

**Décomp** : le hardware M4A GBA a 6 canaux audio (2 DS + 2 square + wave + noise). Le software M4A multiplexe ~16 virtual channels.

**Web** : `MAX_POLYPHONY = 128` (synth.ts:47). Pas de limite hardware. Voice stealing FIFO avec logging quand dépassement.

**Impact** : le web peut jouer beaucoup plus de notes simultanément que le GBA. Les BGM denses (contest, champion battle) sonnent plus "pleines" car aucune note n'est volée.

**Criticité** : LOW — la polyphonie accrue est objectivement meilleure audio-wise. Pas un bug, une amélioration.

### ERREUR E7.13 — Fade in/out : correct mais timing différent

**Décomp** : `m4aMPlayFadeOut` — fadeOV part de 64, décroît de 4 par step. 16 steps × speed frames.

**Web** : `_fade` (player.ts:376) — interpolate masterGain synth sur 16 steps × speed. Utilise `window.setInterval` à 30Hz.

**Vérification** :
- `fadeOutBgm(speed)` ✅
- `fadeInBgm(speed)` ✅
- Cancel fade on stopSong ✅ (prevFade clearInterval)
- Timing : 30Hz poll vs 60Hz décomp → fade 2× plus grossier mais audible identique

**Criticité** : ✅ CORRECT — différence de résolution non audible

### ERREUR E7.14 — Master limiter : présent ✅

**Décomp** : pas de limiter hardware. Le mixing M4A clippe à ±1.0.

**Web** : `DynamicsCompressorNode` (audio-context.ts:62-68) — limiter strict (20:1 ratio, -3dB threshold, 1ms attack). Empêche le clipping audible quand BGM + SE se superposent.

**Criticité** : ✅ CORRECT — amélioration web. Le clipping décomp est un artifact hardware.

### ERREUR E7.15 — Programmable wave : partiel

**Décomp** : le canal wave génère une forme d'onde personnalisée à partir d'une table de 32 samples 4-bit. Chaque voice_programmable_wave a sa propre wave table.

**Web** : `programmable-wave.ts` (~40 lignes) — existe mais partiel. Le synth.ts handle le type mais la wave table resolution est incomplète.

**Impact** : les instruments utilisant programmable wave (flûte, harpe, etc.) peuvent ne pas sound correctement si la wave table n'est pas résolue.

**Criticité** : MEDIUM — affecte quelques BGM qui utilisent des instruments wave-based.

### ERREUR E7.16 — SE restoration : timer-based heuristic

**Décomp** : les SE jouent sur SE1/SE2 slots dédiés. La BGM continue indépendamment sur le slot BGM. Pas de "restore" — les 3 slots coexistent.

**Web** : `playSE` (music.ts:113) — sauvegarde la BGM courante, joue le SE, puis restore la BGM après `song.duration + 250ms`.

**Problème** : le décomp n'a pas besoin de restaurer la BGM car elle continue de jouer sur son propre slot. Le web stop la BGM avant de jouer le SE (= `stopSong()` dans `playSong` ligne 195) et la restore après. C'est un workaround du fait que le slot BGM et le slot SE partagent le même synth spessasynth dans certains cas.

**Impact** : si le player appuie rapidement sur A pendant un SE, la BGM peut être stoppée et restaurée de façon audible (glitch court).

**Criticité** : MEDIUM — la restoration timer-based peut causer des glitches audibles dans les transitions rapides.

### ERREUR E7.17 — primeAudio : correct ✅

**Décomp** : `m4aSoundInit` initialisé au boot.

**Web** : `primeAudio` (music.ts:40) — init AudioContext + load song-voicegroups mapping. `primeAudioContext` (audio-context.ts:102) — resume + silent buffer warmup.

**Vérification** :
- Autoplay policy handling ✅
- DAC warmup ✅ (silent buffer 50ms)
- Song-voicegroups mapping ✅

**Criticité** : ✅ CORRECT

---

## Ressources (assets, tilemaps, palettes)

### ERREUR E7.18 — PNG loader : runtime decode vs pré-compilé

**Décomp** : les assets sont stockés en format GBA (LZ77/HuffCompress/RLE → VRAM 4bpp). Le code boot charge les tiles depuis la ROM.

**Web** : `png-loader.ts` décode les PNG au runtime. Le browser décode en RGBA, puis le code rebuild la palette par ordre d'apparition des couleurs uniques et pack en 4bpp.

**Vérification** :
- `loadIndexedPng` ✅ (canvas → ImageData → palette build → 4bpp pack)
- `transparentRgb` override ✅ (force idx 0)
- 16 couleurs max 4bpp ✅
- 32 bytes/tile row-major ✅

**Problème** : l'ordre des indices peut différer du PNG original si la palette n'est pas spécifiée explicitement. Le `expectedPalette` parameter existe mais n'est pas utilisé systématiquement.

**Criticité** : LOW — les assets critiques (dialog box, fonts, battle terrain) ont des palettes explicites. Les assets décoratifs peuvent avoir des indices légèrement décalés.

### ERREUR E7.19 — Compositor : priority-based scanline ✅

**Décomp** : le PPU GBA composite les BG layers par priority, puis les OAM sprites, puis applique blending et window masking.

**Web** : `compositor.ts` implemente :
1. Backdrop color ✅
2. BG layers par priority (3→0) ✅
3. OAM sprites par priority + index ✅ (partiel — MVP sans OAM complet)
4. Blending (BLDCNT/BLDALPHA/BLDY) ❌ — pas implémenté
5. Window masking ❌ — pas implémenté

**Vérification** :
- `composeFrame` ✅ (scanline-by-scanline, priority-based)
- `invalidateBgTileCache` ✅ (tile cache invalidation après VRAM write)
- Tile cache per-BG ✅ (_tileCachesCache)
- OAM priority buffers ✅ (_oamPriorityBufsCache)

**Criticité** : LOW — le blending et le window masking sont cosmétiques. Le path critique BG layers + priority est correct.

### ERREUR E7.20 — Asset extraction : MIDI + WAV + tiles

**Décomp** : les assets sont extraits depuis la ROM via des scripts Python (`extract-intro-decoded.py`, `extract-direct-sound-samples.mjs`, etc.).

**Web** :
- MIDI files (`/decomp/em/music/*.mid`) ✅ — pré-extraits depuis le décomp
- WAV samples (`/decomp/em/sound/direct_sound_samples/`) ✅ — pré-extraits avec manifest
- Pokémon cries (`/decomp/em/cries/*.wav`) ✅ — pré-extraits
- PNG tiles (`/decomp/em/`) ✅ — PNG indexed convertis en char data runtime
- JSON data (latfont, charmap, palettes, down_arrow, font-widths) ✅

**Vérification** :
- SF2 SoundFont (`/audio/emerald.sf2`) ✅ — rippé de la ROM pour le pipeline spessasynth
- Worklet processors (`/spessasynth_processor.min.js`, `/m4a-noise-lfsr-processor.js`, `/m4a-square-processor.js`) ✅

**Criticité** : ✅ CORRECT — pipeline d'extraction complet

---

## Résumé passage 7

| ID     | Type        | Criticité | Description courte                                          |
|--------|------------|-----------|-------------------------------------------------------------|
| E7.1   | Dual arch | HIGH      | spessasynth/SF2 + custom synth non-convergents             |
| E7.2   | Manquant    | MEDIUM    | m4aClock absent (scheduling MIDI vs M4A tick)               |
| E7.3   | Dual impl   | LOW       | Noise channel : 2 implémentations coexistantes              |
| E7.4   | Partiel     | LOW       | Square wave AudioWorklet (sweep statique)                   |
| E7.5   | ✅ CORRECT  | —         | Reverb chain 1:1 décomp (V-blank delay + feedback)         |
| E7.6   | ✅ CORRECT  | —         | DAC filter double lowpass Butterworth 6.5 kHz              |
| E7.7   | ✅ CORRECT  | —         | DirectSound samples manifest + cache + smpl loop points     |
| E7.8   | ✅ CORRECT  | —         | ~100 voicegroups extraits + keysplit recursive              |
| E7.9   | Manquant    | MEDIUM    | MapMusicMain absent (transitions BGM contextuelles)          |
| E7.10  | Partiel     | LOW       | Pokémon cries sans pitch shift contextuel                   |
| E7.11  | ✅ CORRECT  | —         | m4aSongNumStart bridge fonctionnel                         |
| E7.12  | Amélioration| LOW       | Polyphony 128 vs 6 channels GBA (audio migliorato)         |
| E7.13  | ✅ CORRECT  | —         | Fade in/out timing différent mais audible identique         |
| E7.14  | ✅ CORRECT  | —         | Master limiter empêche clipping audible                    |
| E7.15  | Partiel     | MEDIUM    | Programmable wave partiel (wave table resolution)           |
| E7.16  | Workaround  | MEDIUM    | SE restoration timer-based (glitch transition rapide)       |
| E7.17  | ✅ CORRECT  | —         | primeAudio + DAC warmup + autoplay policy                  |
| E7.18  | Adaptation  | LOW       | PNG runtime decode vs pré-compilé GBA                      |
| E7.19  | Partiel     | LOW       | Compositor priority-based (blending/window masking absents) |
| E7.20  | ✅ CORRECT  | —         | Asset extraction complète (MIDI, WAV, tiles, JSON, SF2)     |

**Couverture globale audio** :
- Audio pipeline : ~40% (dual architecture, pas de m4aClock, scheduling MIDI vs M4A tick)
- Voice types : ~70% (square ✅, noise ✅, DS ✅, programmable wave partiel, keysplit ✅)
- Voicegroups : ~95% (~100 voicegroups extraits, keysplit tables, drumsets)
- Reverb/DAC/filter : ~90% (reverb 1:1, DAC filter approximation, limiter)
- MIDI playback : ~60% (spessasynth/SF2 vs M4A native, SE restoration heuristic)
- Samples/cries : ~70% (manifest ✅, cries sans pitch shift)
- Assets extraction : ~85% (MIDI ✅, WAV ✅, tiles ✅, SF2 ✅)
- Compositor : ~60% (BG layers ✅, OAM partiel, blending ❌, windows ❌)

**Fort** : le pipeline audio est impressionnant dans sa couverture. Les voicegroups sont complets (~100), le reverb 1:1 décomp est correct, le noise LFSR est hardware-accurate, et les DirectSound samples sont bien gérés. Le SF2 SoundFont permet une reproduction acceptable des BGM sans réimplémenter le mixer M4A.

**Faible** : l'architecture dual pipeline (spessasynth + custom synth) est fondamentalement différente du décomp. Le m4aClock absent signifie que le timing, les rampes, et le scheduling ne sont pas 1:1. La restoration BGM timer-based est un workaround qui peut glitcher.

**Priorité correction** : E7.1 (dual pipeline — divergence fondamentale), E7.2 (m4aClock — timing/ramping), E7.9 (MapMusicMain — transitions BGM), E7.16 (SE restoration — glitches), E7.15 (programmable wave — instruments manquants).
