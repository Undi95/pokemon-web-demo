/**
 * M4A MIDI player Web Audio.
 *
 * Charge un fichier MIDI via @tonejs/midi (déjà dans deps), parse les tracks
 * et schedule chaque note via Web Audio API. Pour chaque note, résout le voice
 * via voice-resolver (selon program change MIDI) puis trigger via synth.playNote().
 *
 * Polyphonie : multiples notes peuvent être actives en même temps. On track les
 * `ActiveNote` par {trackIdx, noteId} pour pouvoir les stop au noteOff.
 *
 * Loops : @tonejs/midi gère les loop markers (meta event 0x6 "Marker") ou on
 * peut juste replay le MIDI quand il finit.
 */
import { Midi } from '@tonejs/midi';
import type { VoiceGroup } from './voice-types';
import { resolveVoice, type VoiceGroupLookup } from './voice-resolver';
import { playNote, stopAllActiveNotes, resetVoiceStealingCounter, getVoiceStealingCount, type ActiveNote } from './synth';
import { getAudioContext } from './audio-context';
import { loadSampleManifest } from './sample-loader';

interface PlaybackStats {
  totalNotes: number;
  played: number;
  skippedNoVoice: number;          // resolveVoice retourne null (keysplit non géré, etc.)
  skippedNoSample: number;         // DirectSound sample non trouvé dans manifest
  skippedUnknownType: number;      // ProgrammableWave ou type non implémenté
  skippedReasons: Map<string, number>; // détail par voice type / sample symbol manquant
}

/** 1:1 décomp slots de playback parallèles : `gMPlayInfo_BGM` / `gMPlayInfo_SE1`
 *  / `gMPlayInfo_SE2` (cf src/m4a.c:13-21). Chaque slot a son propre playback
 *  état, permettant à BGM et SE de coexister. Avant ce refactor : un seul
 *  `_currentPlayback` global → playSE écrasait la BGM (cf audit Bug 1). */
export type SlotKind = 'bgm' | 'se1' | 'se2';

interface PlaybackState {
  slot: SlotKind;
  song: Midi;
  voicegroup: VoiceGroup;
  vgLookup: VoiceGroupLookup;
  activeNotes: Map<string, ActiveNote>;   // key = `${trackIdx}_${noteName}_${time}`
  scheduledTimers: number[];
  startCtxTime: number;
  loop: boolean;
  stopped: boolean;
  generation: number;  // gen counter par slot — invalidé par stopSong(slot), vérifié par endTimer
  stats: PlaybackStats;
}

const _slots: Record<SlotKind, PlaybackState | null> = {
  bgm: null,
  se1: null,
  se2: null,
};
// Generation counter PAR SLOT incrémenté à chaque stopSong/playSong sur ce
// slot. Permet à un endTimer de loop de vérifier qu'il est toujours "actif".
const _playbackGen: Record<SlotKind, number> = { bgm: 0, se1: 0, se2: 0 };

/** Cache in-memory des Midi parsés pour éviter fetch+parse répétés.
 *  Critique pour transitions BGM (m4aSongNumStart) : sans ça, switch
 *  intro→intro_battle→title = ~50-150ms de gap silence par transition. */
const _midiCache = new Map<string, Midi>();

/** Charge un fichier MIDI depuis URL → Midi parsed object. Cached. */
export async function loadMidi(url: string): Promise<Midi> {
  const cached = _midiCache.get(url);
  if (cached) return cached;
  const arrBuf = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`MIDI fetch failed: ${url} → ${r.status}`);
    return r.arrayBuffer();
  });
  const midi = new Midi(arrBuf);
  _midiCache.set(url, midi);
  return midi;
}

/** Démarre la lecture d'un MIDI avec un voicegroup donné.
 *  @param song parsed Midi
 *  @param voicegroup le voicegroup à utiliser (ex: VOICEGROUP de title.ts)
 *  @param vgLookup callback pour résoudre les sub-voicegroups (keysplit)
 *  @param loop si true, replay quand fini
 *  @param slot bgm|se1|se2 (multi-slot 1:1 GBA)
 *  @param songVolume per-song volume scale 0-128 (1:1 décomp `mid2agb -Vxxx`).
 *                    `null`/undefined = pas de scaling (= 128 default).
 *  @returns Promise qui resolve quand la song termine (ou jamais si loop=true) */
export async function playSong(
  song: Midi,
  voicegroup: VoiceGroup,
  vgLookup: VoiceGroupLookup,
  loop = false,
  slot: SlotKind = 'bgm',
  songVolume: number | null = null,
): Promise<void> {
  // Stop la song courante DANS CE SLOT (BGM ne touche pas SE et vice-versa).
  stopSong(slot);

  // Nouvelle génération pour ce slot
  const myGeneration = ++_playbackGen[slot];

  // S'assure que le sample manifest est chargé (sinon DirectSound voices échouent)
  await loadSampleManifest();

  // Si une autre playSong a démarré entre-temps SUR LE MÊME SLOT (await yields), abort.
  if (myGeneration !== _playbackGen[slot]) return;

  const ctx = getAudioContext();
  const startTime = ctx.currentTime + 0.05;  // léger lookahead

  const playback: PlaybackState = {
    slot,
    song,
    voicegroup,
    vgLookup,
    activeNotes: new Map(),
    scheduledTimers: [],
    startCtxTime: startTime,
    loop,
    stopped: false,
    generation: myGeneration,
    stats: {
      totalNotes: 0,
      played: 0,
      skippedNoVoice: 0,
      skippedNoSample: 0,
      skippedUnknownType: 0,
      skippedReasons: new Map(),
    },
  };
  _slots[slot] = playback;
  resetVoiceStealingCounter();

  // Schedule chaque note de chaque track. 1:1 décomp m4a TrkVolPitSet :
  // chaque note utilise les CC actifs (volume CC7, expression CC11, pan CC10, pitch bend)
  // au moment de noteOn. @tonejs/midi expose track.controlChanges + track.pitchBends.
  for (let tIdx = 0; tIdx < song.tracks.length; tIdx++) {
    const track = song.tracks[tIdx];
    const programNumber = track.instrument.number ?? 0;

    // Build sorted lists of CC events per type pour lookup binaire au noteOn time
    // (volume CC=7, expression CC=11, pan CC=10) :
    type CcEvent = { time: number; value: number };
    const volEvents: CcEvent[] = [];
    const expEvents: CcEvent[] = [];
    const panEvents: CcEvent[] = [];
    const ccs = track.controlChanges as Record<string, Array<{ time: number; value: number }> | undefined>;
    for (const ccArr of Object.values(ccs)) {
      if (!Array.isArray(ccArr)) continue;
      for (const cc of ccArr) {
        // @tonejs/midi : ccArr est groupé par CC number (key string)
      }
    }
    const modEvents: CcEvent[] = [];     // CC1 modulation depth → vibrato
    const sustainEvents: CcEvent[] = []; // CC64 sustain pedal (>= 0.5 = on)
    if (ccs[7])  for (const cc of ccs[7])  volEvents.push({ time: cc.time, value: cc.value });
    if (ccs[11]) for (const cc of ccs[11]) expEvents.push({ time: cc.time, value: cc.value });
    if (ccs[10]) for (const cc of ccs[10]) panEvents.push({ time: cc.time, value: cc.value });
    if (ccs[1])  for (const cc of ccs[1])  modEvents.push({ time: cc.time, value: cc.value });
    if (ccs[64]) for (const cc of ccs[64]) sustainEvents.push({ time: cc.time, value: cc.value });
    volEvents.sort((a, b) => a.time - b.time);
    expEvents.sort((a, b) => a.time - b.time);
    panEvents.sort((a, b) => a.time - b.time);
    modEvents.sort((a, b) => a.time - b.time);
    sustainEvents.sort((a, b) => a.time - b.time);
    const pitchBends = track.pitchBends ?? [];
    const sortedBends = [...pitchBends].sort((a, b) => a.time - b.time);

    /** Trouve la dernière valeur d'une liste CC à un time donné, ou default. */
    const valueAtTime = (events: CcEvent[], t: number, defaultVal: number): number => {
      let val = defaultVal;
      for (const e of events) {
        if (e.time > t) break;
        val = e.value;
      }
      return val;
    };

    for (const note of track.notes) {
      const noteOnTime = startTime + note.time;
      const noteOffTime = noteOnTime + note.duration;
      const key = `${tIdx}_${note.midi}_${note.time.toFixed(3)}`;

      playback.stats.totalNotes++;

      const volCc = valueAtTime(volEvents, note.time, 1.0);
      const expCc = valueAtTime(expEvents, note.time, 1.0);
      const panCc = valueAtTime(panEvents, note.time, 0.5);
      // Per-song volume 1:1 décomp `mid2agb -Vxxx` arg (cf. midi.cfg).
      // NB : le master volume `(masterVol+1)/16` (default 13/16, m4a.c:80) est
      // appliqué uniquement côté DirectSound dans `m4a_1.s SoundMainRAM` — les
      // voices CGB passent par CgbModVol qui n'utilise pas ce factor. Donc on
      // l'applique côté synth.ts pour les DS seulement, pas ici globalement.
      const songVolNorm = songVolume !== null ? songVolume / 128 : 1.0;
      const trackVolume = volCc * expCc * songVolNorm;
      const panMidi = Math.round(panCc * 127);
      const bend = valueAtTime(sortedBends as CcEvent[], note.time, 0);
      // Modulation depth via CC1 (mod wheel). M4A traduit en track->mod 0-127.
      // Default lfoSpeed=22 (cf. m4a.c:247 default), modT=0 (vibrato).
      // Si MIDI a des CC propriétaires pour lfoSpeed/modT (mid2agb peut utiliser
      // CC alternatifs), on les supporte ici :
      //   CC 21 (général-purpose 1) → lfoSpeed
      //   CC 22 (général-purpose 2) → modT (0=vibrato, 1=tremolo, 2=pan_lfo)
      //   CC 26 (général-purpose 3) → lfoDelay ticks
      // Note : MIDI standard ne mappe pas ces CC à ces fonctions ; c'est une
      // convention si mid2agb les utilise. Sans mapping confirmé, on lit mais
      // les valeurs default GBA sont conservées si CC absent.
      const modCc = valueAtTime(modEvents, note.time, 0);
      let lfoConfig = null as null | { speed: number; depth: number; type: 0 | 1 | 2; delayTicks: number };
      if (modCc > 0) {
        const speedCc = ccs[21] ? valueAtTime(ccs[21] as CcEvent[], note.time, 22 / 127) : 22 / 127;
        const typeCc = ccs[22] ? valueAtTime(ccs[22] as CcEvent[], note.time, 0) : 0;
        const delayCc = ccs[26] ? valueAtTime(ccs[26] as CcEvent[], note.time, 0) : 0;
        const lfoSpeed = Math.max(1, Math.round(speedCc * 127)) || 22;
        const modT = (Math.round(typeCc * 2) % 3) as 0 | 1 | 2;
        lfoConfig = {
          speed: lfoSpeed,
          depth: Math.round(modCc * 127),
          type: modT,
          delayTicks: Math.round(delayCc * 30),
        };
      }

      const timeoutMs = Math.max(0, (noteOnTime - ctx.currentTime) * 1000);
      const onTimer = window.setTimeout(async () => {
        if (playback.stopped) return;
        const voice = resolveVoice(voicegroup, programNumber, note.midi, vgLookup);
        if (!voice) {
          playback.stats.skippedNoVoice++;
          incReason(playback.stats, `noVoice:program=${programNumber}`);
          return;
        }
        const active = await playNote(
          voice, note.midi, Math.round(note.velocity * 127),
          panMidi, noteOnTime, trackVolume, bend, lfoConfig,
        );
        // Re-check stopped APRÈS l'await async : si stopSong a été appelé
        // pendant playNote (ex: scene transition), on stop la note tout de
        // suite au lieu de la laisser stuck dans activeNotes.
        if (playback.stopped) {
          if (active) {
            try { active.stop(); } catch { /* ignore */ }
          }
          return;
        }
        if (active) {
          playback.activeNotes.set(key, active);
          playback.stats.played++;
        } else {
          if (voice.type === 'directsound' || voice.type === 'directsound_no_resample') {
            playback.stats.skippedNoSample++;
            incReason(playback.stats, `noSample:${voice.sampleSymbol}`);
          } else {
            playback.stats.skippedUnknownType++;
            incReason(playback.stats, `unknownType:${voice.type}`);
          }
        }
      }, timeoutMs);
      playback.scheduledTimers.push(onTimer);

      // Sustain pedal CC64 : si pédale active au noteOff, retarder le release
      // jusqu'au moment où la pédale relâche (CC64 < 0.5).
      // 1:1 décomp : sustain pedal tient toutes les notes du track.
      const sustainAtOff = valueAtTime(sustainEvents, note.time + note.duration, 0);
      let actualOffTime = noteOffTime;
      if (sustainAtOff >= 0.5) {
        // Trouver le prochain event où sustain retombe < 0.5
        for (const ev of sustainEvents) {
          if (ev.time > note.time + note.duration && ev.value < 0.5) {
            actualOffTime = startTime + ev.time;
            break;
          }
        }
      }

      // Schedule noteOff (potentially delayed par sustain pedal)
      const offTimeoutMs = Math.max(0, (actualOffTime - ctx.currentTime) * 1000);
      const offTimer = window.setTimeout(() => {
        if (playback.stopped) return;
        const active = playback.activeNotes.get(key);
        if (active) {
          active.stop(actualOffTime);
          playback.activeNotes.delete(key);
        }
      }, offTimeoutMs);
      playback.scheduledTimers.push(offTimer);
    }
  }

  // Schedule end : si loop, replay (1:1 décomp `BTRACK_LOOP` / GOTO marker).
  const endMs = Math.max(0, (startTime + song.duration - ctx.currentTime) * 1000);
  const endTimer = window.setTimeout(() => {
    // Double-check generation par slot : si stopSong/playSong a été appelé
    // sur ce slot entre temps, ne pas déclencher de loop iteration.
    if (playback.stopped) return;
    if (playback.generation !== _playbackGen[slot]) return;
    logPlaybackStats(playback.stats);
    if (loop) {
      void playSong(song, voicegroup, vgLookup, loop, slot);
    } else {
      _slots[slot] = null;
    }
  }, endMs + 100);
  playback.scheduledTimers.push(endTimer);

  return Promise.resolve();
}

function incReason(stats: PlaybackStats, reason: string): void {
  stats.skippedReasons.set(reason, (stats.skippedReasons.get(reason) || 0) + 1);
}

function logPlaybackStats(stats: PlaybackStats): void {
  const skippedTotal = stats.skippedNoVoice + stats.skippedNoSample + stats.skippedUnknownType;
  const stealing = getVoiceStealingCount();
  console.log(`[m4a] Playback stats : ${stats.played}/${stats.totalNotes} notes played` +
              ` (${skippedTotal} skipped : noVoice=${stats.skippedNoVoice}, noSample=${stats.skippedNoSample}, unknownType=${stats.skippedUnknownType})` +
              ` | Voice stealing: ${stealing} events`);
  if (stats.skippedReasons.size > 0) {
    const top = [...stats.skippedReasons.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    console.log('[m4a] Top skip reasons:');
    for (const [reason, count] of top) console.log(`  ${count}× ${reason}`);
  }
}

/** Stop immédiat de la song courante (release toutes les notes + voice stealing).
 *  @param slot 'bgm' (default) | 'se1' | 'se2'. Si omis, stoppe BGM uniquement
 *  (= ne pas tuer les SE en train de jouer). Pour stopper TOUT, appeler
 *  `stopAllSongs()`. */
export function stopSong(slot: SlotKind = 'bgm'): void {
  // Bump generation pour invalider tout endTimer pending de ce slot.
  _playbackGen[slot]++;
  const playback = _slots[slot];
  if (!playback) return;
  playback.stopped = true;
  for (const t of playback.scheduledTimers) clearTimeout(t);
  for (const note of playback.activeNotes.values()) {
    try { note.stop(); } catch { /* ignore */ }
  }
  playback.activeNotes.clear();
  _slots[slot] = null;
  // Hard cleanup : kill TOUTES les notes orphelines (= voice stealing ou
  // notes sans entry dans activeNotes). Note : ce cleanup est global, pas
  // par-slot — accepté car les SE sont courts et le voice stealing est rare.
  stopAllActiveNotes();
}

/** Stop TOUS les slots (BGM + SE1 + SE2). 1:1 décomp `m4aMPlayAllStop()`. */
export function stopAllSongs(): void {
  stopSong('bgm');
  stopSong('se1');
  stopSong('se2');
}

/** Détecte si la song a un loopStart marker (meta event 0x6) via @tonejs/midi.
 *  Retourne le time en seconds ou null si pas de marker.
 *  TODO : @tonejs/midi expose les markers via `header.timeSignatures` ou
 *  `track.events` selon version. Pour MVP on retourne null (replay full). */
export function detectLoopStart(_song: Midi): number | null {
  // @tonejs/midi v2 expose marker meta events via Marker class si présents.
  // Skip pour MVP — la plupart des MIDI Pokemon Emerald n'ont pas ces markers.
  return null;
}

/** Vrai si une song est en cours sur le slot donné (default: bgm). */
export function isPlaying(slot: SlotKind = 'bgm'): boolean {
  const playback = _slots[slot];
  return playback !== null && !playback.stopped;
}
