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
import { playNote, stopAllActiveNotes, type ActiveNote } from './synth';
import { getAudioContext } from './audio-context';
import { loadSampleManifest } from './sample-loader';

interface PlaybackState {
  song: Midi;
  voicegroup: VoiceGroup;
  vgLookup: VoiceGroupLookup;
  activeNotes: Map<string, ActiveNote>;   // key = `${trackIdx}_${noteName}_${time}`
  scheduledTimers: number[];
  startCtxTime: number;
  loop: boolean;
  stopped: boolean;
}

let _currentPlayback: PlaybackState | null = null;

/** Charge un fichier MIDI depuis URL → Midi parsed object. */
export async function loadMidi(url: string): Promise<Midi> {
  const arrBuf = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`MIDI fetch failed: ${url} → ${r.status}`);
    return r.arrayBuffer();
  });
  return new Midi(arrBuf);
}

/** Démarre la lecture d'un MIDI avec un voicegroup donné.
 *  @param song parsed Midi
 *  @param voicegroup le voicegroup à utiliser (ex: VOICEGROUP de title.ts)
 *  @param vgLookup callback pour résoudre les sub-voicegroups (keysplit)
 *  @param loop si true, replay quand fini
 *  @returns Promise qui resolve quand la song termine (ou jamais si loop=true) */
export async function playSong(
  song: Midi,
  voicegroup: VoiceGroup,
  vgLookup: VoiceGroupLookup,
  loop = false,
): Promise<void> {
  // Stop la song courante si une est en cours
  stopSong();

  // S'assure que le sample manifest est chargé (sinon DirectSound voices échouent)
  await loadSampleManifest();

  const ctx = getAudioContext();
  const startTime = ctx.currentTime + 0.05;  // léger lookahead

  const playback: PlaybackState = {
    song,
    voicegroup,
    vgLookup,
    activeNotes: new Map(),
    scheduledTimers: [],
    startCtxTime: startTime,
    loop,
    stopped: false,
  };
  _currentPlayback = playback;

  // Schedule chaque note de chaque track
  for (let tIdx = 0; tIdx < song.tracks.length; tIdx++) {
    const track = song.tracks[tIdx];
    // MIDI program change → influence le voicegroup voice index
    // @tonejs/midi expose track.instrument.number (0-127)
    const programNumber = track.instrument.number ?? 0;

    for (const note of track.notes) {
      const noteOnTime = startTime + note.time;
      const noteOffTime = noteOnTime + note.duration;
      const key = `${tIdx}_${note.midi}_${note.time.toFixed(3)}`;

      // Schedule noteOn via setTimeout (suffit pour MVP, scheduling ~16ms ahead)
      const timeoutMs = Math.max(0, (noteOnTime - ctx.currentTime) * 1000);
      const onTimer = window.setTimeout(async () => {
        if (playback.stopped) return;
        const voice = resolveVoice(voicegroup, programNumber, note.midi, vgLookup);
        if (!voice) return;
        const active = await playNote(voice, note.midi, Math.round(note.velocity * 127), 64, noteOnTime);
        if (active) playback.activeNotes.set(key, active);
      }, timeoutMs);
      playback.scheduledTimers.push(onTimer);

      // Schedule noteOff
      const offTimeoutMs = Math.max(0, (noteOffTime - ctx.currentTime) * 1000);
      const offTimer = window.setTimeout(() => {
        if (playback.stopped) return;
        const active = playback.activeNotes.get(key);
        if (active) {
          active.stop(noteOffTime);
          playback.activeNotes.delete(key);
        }
      }, offTimeoutMs);
      playback.scheduledTimers.push(offTimer);
    }
  }

  // Schedule end : si loop, replay (1:1 décomp `BTRACK_LOOP` / GOTO marker).
  // Si meta-event "loopStart" présent, on ne replay que depuis ce point (TODO :
  // @tonejs/midi expose les markers via track.controlChanges si présents).
  // Pour MVP : replay full song depuis le début.
  const endMs = Math.max(0, (startTime + song.duration - ctx.currentTime) * 1000);
  const endTimer = window.setTimeout(() => {
    if (playback.stopped) return;
    if (loop) {
      void playSong(song, voicegroup, vgLookup, loop);
    } else {
      _currentPlayback = null;
    }
  }, endMs + 100);
  playback.scheduledTimers.push(endTimer);

  return Promise.resolve();
}

/** Stop immédiat de la song courante (release toutes les notes + voice stealing). */
export function stopSong(): void {
  if (!_currentPlayback) return;
  _currentPlayback.stopped = true;
  for (const t of _currentPlayback.scheduledTimers) clearTimeout(t);
  for (const note of _currentPlayback.activeNotes.values()) {
    try { note.stop(); } catch { /* ignore */ }
  }
  _currentPlayback.activeNotes.clear();
  _currentPlayback = null;
  // Hard cleanup : kill toutes les notes orphelines (au cas où des voices stealing
  // ou notes sans entry dans activeNotes restent en mémoire)
  stopAllActiveNotes();
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

/** Vrai si une song est en cours. */
export function isPlaying(): boolean {
  return _currentPlayback !== null && !_currentPlayback.stopped;
}
