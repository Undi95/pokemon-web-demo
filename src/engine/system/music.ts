/**
 * Pokemon Emerald music player — bridge vers l'engine M4A maison.
 *
 * Remplace l'ancien pipeline SpessaSynth (SF2 + AudioWorklet) par notre
 * moteur M4A natif (src/engine/m4a/) qui schedule les notes MIDI via
 * Web Audio API avec les voicegroups extraits du ROM original.
 *
 * API conservée 1:1 pour ne pas casser les callers (BirchSpeechScene,
 * OverworldScene, BattleScene, script-runner, etc.).
 */
import { getAudioContext, getMasterGain, isAudioReady } from '../m4a/audio-context';
import { loadMidi, playSong, stopSong, isPlaying } from '../m4a/player';
import { lookupVoicegroup } from '../m4a/voicegroups-data/_all-voicegroups-index';
import type { Midi } from '@tonejs/midi';

let started = false;
let currentSong: string | null = null;
let savedBgmUrl: string | null = null;
let pausedBgmUrl: string | null = null;
let restoreTimer: number | null = null;
let playGen = 0;

// Mapping chargé depuis song-voicegroups.json
let songVoicegroups: Record<string, string> = {};

const SONG_VG_URL = '/decomp/em/music/song-voicegroups.json';

/** Résout le voicegroup associé à une URL de fichier MIDI. */
function resolveVoicegroup(url: string): ReturnType<typeof lookupVoicegroup> {
  const m = url.match(/([\w_]+)\.mid$/);
  if (!m) return null;
  const vgName = songVoicegroups[m[1]];
  if (!vgName) {
    // Fallback : essayer le nom de fichier brut sans préfixe voicegroup_
    return lookupVoicegroup(m[1]);
  }
  return lookupVoicegroup(vgName);
}

export async function primeAudio(): Promise<void> {
  if (started) return;

  // Initialise l'AudioContext singleton M4A (master gain + reverb GBA)
  getAudioContext();

  // Charge le mapping song → voicegroup
  try {
    const resp = await fetch(SONG_VG_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    songVoicegroups = await resp.json();
  } catch (e) {
    console.warn('[music] song-voicegroups.json indisponible, fallback nom brut:', e);
  }

  started = true;
  console.log('[music] M4A engine ready, mappings:', Object.keys(songVoicegroups).length);
}

export function isAudioPrimed(): boolean {
  return started && isAudioReady();
}

// Cache des objets Midi parsés (évite re-parse à chaque jouer)
const midiCache = new Map<string, Midi>();
const midiMissing = new Set<string>();

async function fetchMidi(url: string): Promise<Midi | null> {
  if (midiMissing.has(url)) return null;
  const cached = midiCache.get(url);
  if (cached) return cached;

  try {
    const song = await loadMidi(url);
    midiCache.set(url, song);
    return song;
  } catch (e) {
    midiMissing.add(url);
    console.warn(`[music] MIDI introuvable/invalide : ${url}`, e);
    return null;
  }
}

/** Joue un MIDI en boucle (BGM). */
export async function playMidiLoop(url: string, _bankOverride?: number): Promise<void> {
  if (!started) {
    console.warn('[music] not primed, skip playMidiLoop');
    return;
  }
  if (currentSong === url && isPlaying()) return;

  const myGen = ++playGen;
  stopMusic();
  currentSong = url;

  const song = await fetchMidi(url);
  if (!song) return;
  if (myGen !== playGen) {
    console.log('[music] playMidiLoop aborted (superseded)', url);
    return;
  }

  const vg = resolveVoicegroup(url);
  if (!vg) {
    console.warn('[music] voicegroup introuvable pour', url);
    return;
  }

  await playSong(song, vg, lookupVoicegroup, true);
  console.log('[music] playing BGM', url);
}

/** Joue un sound effect (one-shot). Restaure la BGM si elle était active. */
export async function playSE(name: string): Promise<void> {
  if (!started) return;
  const url = name.endsWith('.mid') ? name : `/decomp/em/music/${name}.mid`;

  const myGen = ++playGen;
  const wasBgm = currentSong;

  // Si une BGM tourne, on la sauvegarde pour restauration post-SE
  const bgmToRestore = wasBgm && !wasBgm.startsWith('/decomp/em/music/se_') ? wasBgm : null;

  const song = await fetchMidi(url);
  if (!song) return;
  if (myGen !== playGen) return;

  const vg = resolveVoicegroup(url);
  if (!vg) {
    console.warn('[music] voicegroup introuvable pour SE', url);
    return;
  }

  currentSong = url;
  await playSong(song, vg, lookupVoicegroup, false);
  console.log('[music] playing SE', url);

  // Restaure la BGM après la durée du SE (+ marge)
  if (bgmToRestore) {
    if (restoreTimer) clearTimeout(restoreTimer);
    restoreTimer = window.setTimeout(() => {
      restoreTimer = null;
      if (currentSong === url) currentSong = null;
      // Ne restore que si rien d'autre n'a été demandé entre-temps
      if (!currentSong) {
        void playMidiLoop(bgmToRestore);
      }
    }, song.duration * 1000 + 250);
  }
}

/** Joue le cri d'un Pokémon (WAV pré-extrait). Routé via masterGain (= respect
 *  du volume slider topbar/devtool). Track end time pour IsCryPlaying / waitmoncry. */
export function playCry(species: string): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  // Accepte 'SPECIES_ZUBAT' (constante décomp — ce que passent pokeball send-out
  // et les FaintingCry) comme 'zubat' (nom dossier) : les WAV = nom sans préfixe.
  const file = species.toLowerCase().replace(/^species_/, '').replace(/[^a-z0-9]/g, '');
  const url = `/decomp/em/cries/${file}.wav`;
  fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => ctx.decodeAudioData(buf))
    .then(audioBuf => {
      if (!audioBuf) return;
      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      const gain = ctx.createGain();
      gain.gain.value = 0.7;
      src.connect(gain).connect(getMasterGain());
      src.start();
      // 1:1 décomp : track cry end time pour IsCryPlaying. Override le 1s
      // default set par PlayCryInternal avec la vraie durée du WAV.
      void import('../system/decomp-globals').then(({ _markAudioSlotActive }) => {
        _markAudioSlotActive('cry', audioBuf.duration * 1000);
      });
    })
    .catch(e => console.warn('[music] cry fail', species, e));
}

/** Slot "saved music" du décomp (savebgm / playbgm). */
export function setSavedBgm(name: string | null): void {
  if (!name || name.toLowerCase() === 'mus_dummy') {
    savedBgmUrl = null;
    return;
  }
  const url = name.endsWith('.mid') ? name : `/decomp/em/music/${name}.mid`;
  savedBgmUrl = url;
}
export function getSavedBgm(): string | null {
  return savedBgmUrl;
}
export function getCurrentBgm(): string | null {
  return currentSong;
}

/** Joue une fanfare (jingle court). Pause la BGM, restore après. */
export async function playFanfare(name: string): Promise<void> {
  if (!started) return;
  const url = name.endsWith('.mid') ? name : `/decomp/em/music/${name}.mid`;

  const myGen = ++playGen;

  // Pause BGM
  if (currentSong && !currentSong.startsWith('/decomp/em/music/se_')) {
    pausedBgmUrl = currentSong;
  }
  stopMusic();

  const song = await fetchMidi(url);
  if (!song) {
    restoreFanfareBgm();
    return;
  }
  if (myGen !== playGen) {
    console.log('[music] fanfare aborted (superseded)', url);
    return;
  }

  const vg = resolveVoicegroup(url);
  if (!vg) {
    console.warn('[music] voicegroup introuvable pour fanfare', url);
    restoreFanfareBgm();
    return;
  }

  currentSong = url;
  await playSong(song, vg, lookupVoicegroup, false);
  console.log('[music] playing fanfare', url);

  if (restoreTimer) clearTimeout(restoreTimer);
  restoreTimer = window.setTimeout(() => {
    restoreTimer = null;
    if (currentSong === url) currentSong = null;
    restoreFanfareBgm();
  }, song.duration * 1000 + 250);
}

function restoreFanfareBgm(): void {
  if (!pausedBgmUrl) return;
  const url = pausedBgmUrl;
  pausedBgmUrl = null;
  void playMidiLoop(url);
}

/** Stop immédiat de toute la musique + annule les restores planifiés. */
export function stopMusic(): void {
  if (restoreTimer) {
    clearTimeout(restoreTimer);
    restoreTimer = null;
  }
  stopSong();
  currentSong = null;
}
