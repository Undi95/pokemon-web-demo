# SAPPY MUSIC REFERENCE — m4a engine décomp pokeemeraude

> Audit Agent Explore very thorough du 2026-04-25.
> Sources : `D:\Projet 1\decomps\pokeemeraude\sound\` + `include\gba\m4a_internal.h` + `src\m4a*.c`.
> But : refacto playback audio fidèle GBA Sappy/m4a sans hardcode.

---

## 1. Architecture m4a (Music for All) — vue d'ensemble

```
MIDI compilé (.mid) → bytecode events → voicegroup (program → instrument)
  → trigger sample PCM (DirectSound A/B) ou PSG channel
  → mix 32 kHz mono (SOUND_MODE_FREQ_31536)
```

**Channels GBA** :
- DirectSound A/B (PCM 8-bit DMA)
- PSG : Square 1, Square 2, Wave, Noise
- `MAX_DIRECTSOUND_CHANNELS = 12` (priority-based voice stealing)

---

## 2. Voicegroups (`sound/voicegroups/*.inc`)

Format ARM assembly. Chaque voicegroup a 128 entrées (1 par MIDI program 0-127).

Exemple `route101.inc` :
- `voice_keysplit_all voicegroup_route101_drumset` (program 0 = redirect drumset complet)
- `voice_square_1 60, 0, 0, 2, 0, 0, 15, 0` (rootKey=60, pan=0, sweep=0, duty=2, ADSR=0,0,15,0)
- `voice_directsound 60, 0, DirectSoundWaveData_X, 255, 249, 25, 149` (sample PCM + ADSR)
- `voice_keysplit voicegroup_strings_keysplit, keysplit_strings` (note → slot via lookup table)

### Struct `ToneData` (m4a_internal.h:57-68)
```c
struct ToneData {
  u8 type;        // 0x40 = DirectSound, 0x80 = Rhythm, 0x07 = CGB, 0x08 = Fixed
  u8 key;         // rootKey (MIDI 0-127)
  u8 length;      // CGB compat
  u8 pan_sweep;   // 0x40 = center
  WaveData *wav;  // pointeur sample PCM (NULL pour PSG)
  u8 attack;      // ADSR (0-255)
  u8 decay;
  u8 sustain;     // 0-127
  u8 release;
};
```

### Encodage ADSR (échelle 0-255)
- `attack` : (255 - a) / 255 × max_period
- `decay` : (255 - d) / 255 × period
- `sustain` : s / 127 (niveau)
- `release` : (255 - r) / 255 × period

Exemple nylon guitar : `255, 249, 25, 149` → attaque immediate, décroissance rapide vers 20% sustain, release ~3s naturel.

---

## 3. Samples PCM (`sound/direct_sound_data.inc`)

```asm
DirectSoundWaveData_sc88pro_nylon_str_guitar::
  .incbin "sound/direct_sound_samples/sc88pro_nylon_str_guitar.bin"
```

**Note** : déjà convertis en .wav dans le décomp moderne (`sound/direct_sound_samples/*.wav`, 430+ fichiers).

### Struct `WaveData` (m4a_internal.h:39-47)
```c
struct WaveData {
  u16 type;
  u16 status;
  u32 freq;       // Hz
  u32 loopStart;  // sample index
  u32 size;       // bytes (8-bit signé)
  s8 data[1];
};
```

### Pitch shift par note (transposition GBA)
```c
frequency = base_freq_hz × 2^((midi_note - rootKey) / 12.0)
```
Le GBA DMA joue le sample à freq calculée → transpose.

---

## 4. Keysplits (`sound/keysplit_tables.inc`)

```asm
keysplit_piano: split 0, 55  | split 1, 70  | split 2, 91  | split 3, 108
```
Trick mks4agb : label placé `36 bytes avant` le tableau pour que note 36 ↔ index 0 sans calcul.

---

## 5. Bytecode opcodes (`sound/MPlayDef.s`)

| Opcode | Hex | Sémantique | Args |
|---|---|---|---|
| WAIT | 0x80-0xBB | wait N ticks | N |
| FINE | 0xB1 | fin track | - |
| GOTO | 0xB2 | loop | addr (3B) |
| TEMPO | 0xBB | BPM/2 | val (1B) |
| VOICE | 0xBD | program change | prog (1B) |
| VOL | 0xBE | volume | 0-127 |
| PAN | 0xBF | pan | 0x40 = center |
| BEND | 0xC0 | pitch bend | val |
| MOD | 0xC4 | modulation | depth |
| MODT | 0xC5 | mod type | 0=vibrato, 1=trémolo, 2=autopan |
| EOT | 0xCE | tie note end | - |
| TIE | 0xCF | sustain note | - |
| N01-N96 | 0xD0-0xFF | note avec gate time implicite | - |
| XCMD | 0xCD | extended | sub+args |

---

## 6. Sample rate GBA (m4a_internal.h:18-31)
```c
SOUND_MODE_FREQ_31536  // 31.5 kHz nominal Pokémon Émeraude
```

---

## 7. État côté pokemon-web-demo

### Extracteurs ✅
- `extract-voicegroups.mjs` : `voicegroups.json`, `samples.json`, `keysplits.json`, `song-voicegroups.json`
- `extract-decomp.mjs` : 530 MIDI dans `public/decomp/em/music/*.mid`
- `samples` : 430+ WAV copiés dans `public/decomp/em/sfx/`

### Playback engine actuel (`music.ts`) — **faiblesses identifiées**
| Problème | Cause | Impact |
|---|---|---|
| Sons "synthétiques" | Tone.Synth pulse ≠ GBA PSG square | Timbre faux |
| Pas de DSP GBA | Pas de reverb / pseudo-echo (xIECV/L) | Sonne plat |
| ADSR approximatif | Courbe Tone ≠ hardware | Transitions moins réalistes |
| Pitch shift artifacts | Tone.Sampler stretch trop (1 sample / instrument) | Granulé |
| Pas de voice stealing | Tone autorise N voices | Trop de notes simultanées |
| Pas de modulation | MOD/MODT ignorés | Perte expression |

---

## 8. Plan refacto recommandé

### Stratégie A — Web Audio API direct (long terme, qualité production)

Nouveau module `src/engine/sappy-player.ts` :
- `AudioContext` master + `GainNode` + `StereoPannerNode`
- Per-note : `AudioBufferSourceNode` avec `detune.value = semitones × 100` (cents)
- Loop natif : `source.loop = true`, `loopStart`, `loopEnd` depuis WAV `smpl` chunk
- ADSR envelope manuelle : `gain.linearRampToValueAtTime` + `setValueAtTime`
- Voice stealing : compteur max 12 actives, drop low-priority
- Modulation : `OscillatorNode` LFO sur `detune` (vibrato) ou `gain` (trémolo)

**Effort** : L (1-2 sessions dédiées)
**Bénéfice** : son fidèle GBA, contrôle pixel-perfect

### Stratégie B — Quick wins Tone.js (court terme MVP)

1. **Vrais samples WAV pour PSG square** :
   - Pré-générer 4 WAV (duty 1/8, 1/4, 1/2, 3/4) à 32 kHz
   - Charger comme Tone.Sampler → meilleur timbre instantané
   - Effort : S (4h), gain ~60% timbre PSG

2. **ADSR courbe exact GBA** :
   - `exponentialRampToValueAtTime` au lieu de `linearRampToValueAtTime` pour attack/release
   - `linearRampToValueAtTime` pour decay (rapide)
   - Effort : S (3h), gain ~20% réalisme

3. **Pseudo-reverb convolver** :
   - Charger une IR WAV "cathedral" ou similaire
   - `ConvolverNode` en parallèle du dry signal
   - Effort : S (2h), gain ~40% ambiance

**Total quick wins** : ~9h, gain global ~50% qualité ressentie

---

## 9. Extracteurs manquants

### `extract-pcm-samples.mjs` (potentiel)
- Si certains samples sont encore en .bin (pas .wav), convertir en WAV avec loop point
- Format struct `WaveData` à parser pour récupérer freq + loopStart

### `extract-reverb-impulse.mjs` (optionnel)
- Exporter pseudo-echo GBA en impulse response WAV pour ConvolverNode
- Approximation suffisante pour MVP

---

## 10. Bugs mineurs identifiés dans extract-voicegroups.mjs actuel

- **square_2_alt offset ADSR** (line 99-105) : décale tokens de -1, à vérifier
- Reste : parsing OK, voicegroups + keysplits + samples + song-voicegroups corrects à 95%

---

## 11. Recommandation finale

**Court terme (cette session ou la suivante)** : Stratégie B quick wins
1. Pré-générer WAV samples pour PSG square (4 duty cycles)
2. Améliorer courbes ADSR
3. Ajouter ConvolverNode reverb

**Moyen terme** : Stratégie A
- Refacto vers Web Audio API direct
- Implémenter voice stealing GBA
- Support modulation MOD/MODT
- Multi-samples par instrument (keysplit avancé)

**Long terme** : étudier `agbplay` (C++ référence open-source) pour parser bytecode m4a directement et avoir le timing tick-perfect GBA.

---

## 12. Réf bibliographique

- `agbplay` (C++) : référence implémentation Sappy, https://github.com/ipatix/agbplay
- m4a docs : https://www.pokecommunity.com/showthread.php?t=180464
