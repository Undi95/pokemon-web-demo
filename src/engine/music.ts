/**
 * Pokemon Emerald music player via SpessaSynth + SF2 authentique GBA.
 *
 * Pipeline :
 *   1. AudioContext + AudioWorklet (thread séparé pour pas glitch)
 *   2. Charge `emerald.sf2` (~7.7 MB, ripped du ROM original via GBAMusRiper)
 *   3. WorkletSynthesizer joue le SF2
 *   4. Sequencer charge les MIDI standard (.mid) et drive le synth
 *
 * Avantages vs ancien sappy-player.ts (570 lignes de synthèse manuelle) :
 *   - Son authentique : SF2 contient les samples DirectSound originaux
 *   - Polyphonie + ADSR + LFO gérés par SpessaSynth (lib testée)
 *   - 60 lignes au lieu de 570
 *
 * Pré-requis : `public/decomp/em/music/emerald.sf2` (à télécharger manuellement)
 *   Source : https://archive.org/download/emerald_sf2/Emerald.sf2
 *
 * Cf. SAPPY_MUSIC_REFERENCE.md + audit agent du 2026-04-25.
 */
import { WorkletSynthesizer, Sequencer } from 'spessasynth_lib';

let ctx: AudioContext | null = null;
let synth: WorkletSynthesizer | null = null;
let sequencer: Sequencer | null = null;
let started = false;
let currentSong: string | null = null;
// Slot "saved BGM" du décomp (cf. asm/macros/event.inc savebgm/playbgm,save).
// `playbgm SONG, TRUE` set ce slot. `savebgm MUS_DUMMY` le clear (= null).
// Lu par fadedefaultbgm pour décider si fade vers map default ou non.
let savedBgmUrl: string | null = null;
// BGM en pause pendant une fanfare : restaurée à la fin du jingle.
let pausedBgmUrl: string | null = null;
// Compteur de génération pour invalider les playMidiLoop/playFanfare en vol.
// Incrémenté à chaque nouvelle requête. Si entre `await fetchMidi` et
// `sequencer.play()` un autre call vient, l'ancien voit son gen != current
// et abort → évite 2 sequencers qui jouent en parallèle (race condition
// rencontrée quand softSwitch.playMidiLoop(map BGM) court avec un script
// `playbgm` lancé juste après par checkCoordEvent).
let playGen = 0;

// Mappings décomp pour le bank SF2 correct (sinon SpessaSynth tape dans bank 0 incomplet).
let songVoicegroups: Record<string, string> = {};   // mus_X → voicegroup_Y
let voicegroupBanks: Record<string, number> = {};   // voicegroup_Y → bank N

const SF2_URL = '/decomp/em/music/emerald.sf2';
const WORKLET_URL = '/spessasynth_processor.min.js';
const SONG_VG_URL = '/decomp/em/music/song-voicegroups.json';
const VG_BANKS_URL = '/decomp/em/music/voicegroup-banks.json';

export async function primeAudio(): Promise<void> {
  if (started) return;
  ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch (e) { console.warn('[music] ctx.resume fail', e); }
  }

  // Load AudioWorklet processor (thread séparé pour le synth)
  try {
    await ctx.audioWorklet.addModule(WORKLET_URL);
  } catch (e) {
    console.error('[music] worklet load fail (vérifier public/spessasynth_processor.min.js):', e);
    return;
  }

  synth = new WorkletSynthesizer(ctx);

  // Charge le SF2 Pokemon Emerald
  try {
    const resp = await fetch(SF2_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const ct = resp.headers.get('content-type') || '';
    if (ct.includes('text/html')) {
      throw new Error('serveur retourne HTML (= fichier introuvable). Télécharge Emerald.sf2 dans public/decomp/em/music/');
    }
    const sf2Buf = await resp.arrayBuffer();
    // Vérifie magic bytes "RIFF" pour confirmer SF2 valide
    const magic = new Uint8Array(sf2Buf, 0, 4);
    const magicStr = String.fromCharCode(...magic);
    if (magicStr !== 'RIFF') {
      throw new Error(`fichier invalide, magic "${magicStr}" au lieu de "RIFF" (taille: ${sf2Buf.byteLength} bytes)`);
    }
    await synth.soundBankManager.addSoundBank(sf2Buf, 'emerald');
    await synth.isReady;
  } catch (e) {
    console.error('[music] ⚠️ SF2 manquant ou invalide :', (e as Error).message);
    console.error('[music] → Télécharge https://archive.org/download/emerald_sf2/Emerald.sf2');
    console.error('[music] → Renomme en "emerald.sf2" et place dans public/decomp/em/music/');
    return;
  }

  // Charge les mappings voicegroup en parallèle (non-bloquant si fail)
  try {
    const [sv, vb] = await Promise.all([
      fetch(SONG_VG_URL).then(r => r.json()),
      fetch(VG_BANKS_URL).then(r => r.json()),
    ]);
    songVoicegroups = sv;
    voicegroupBanks = vb;
  } catch (e) {
    console.warn('[music] mapping voicegroup-banks indisponible, bank=0 fallback:', e);
  }

  synth.connect(ctx.destination);
  started = true;
  console.log('[music] SpessaSynth ready, SF2 loaded, ctx:', ctx.state, 'rate:', ctx.sampleRate,
              'mappings:', Object.keys(songVoicegroups).length, 'songs /', Object.keys(voicegroupBanks).length, 'banks');
}

/** Résout le bank SF2 depuis l'URL du MIDI via song-voicegroups + voicegroup-banks. */
function resolveBank(url: string): number {
  const m = url.match(/((?:mus|se)_\w+)\.mid$/);
  if (!m) return 0;
  const vg = songVoicegroups[m[1]];
  if (!vg) return 0;
  return voicegroupBanks[vg] ?? 0;
}

// Cache des MIDI buffers (évite refetch à chaque jouer SE/musique).
const midiCache = new Map<string, ArrayBuffer>();
const midiMissing = new Set<string>(); // 404 connus → skip silent
async function fetchMidi(url: string): Promise<ArrayBuffer | null> {
  if (midiMissing.has(url)) return null;
  const cached = midiCache.get(url);
  if (cached) return cached.slice(0); // copy : SpessaSynth peut modifier le buffer
  const resp = await fetch(url);
  if (!resp.ok) {
    midiMissing.add(url);
    console.warn(`[music] MIDI introuvable : ${url} (HTTP ${resp.status})`);
    return null;
  }
  const ct = resp.headers.get('content-type') || '';
  if (ct.includes('text/html')) {
    // Vite dev server retourne du HTML quand le fichier n'existe pas → SpessaSynth crash
    midiMissing.add(url);
    console.warn(`[music] MIDI introuvable (serveur retourne HTML) : ${url}`);
    return null;
  }
  const buf = await resp.arrayBuffer();
  // Vérifie magic "MThd" pour confirmer MIDI valide
  const magic = new Uint8Array(buf, 0, 4);
  if (magic[0] !== 0x4D || magic[1] !== 0x54 || magic[2] !== 0x68 || magic[3] !== 0x64) {
    midiMissing.add(url);
    console.warn(`[music] MIDI invalide (pas de magic MThd) : ${url}`);
    return null;
  }
  midiCache.set(url, buf);
  return buf.slice(0);
}

// Sequencers actifs pour SE one-shot (pour cleanup auto à songEnded).
const seSequencers = new Set<Sequencer>();

export function isAudioPrimed(): boolean { return started; }

/**
 * Joue un MIDI en boucle. Le bank SF2 est résolu auto via song-voicegroups + voicegroup-banks
 * (le SF2 Emerald a 176 banks, 1 par voicegroup ; bank 0 = incomplet → instruments manquants).
 * @param bankOverride — force un bank spécifique (debug / fallback si auto-résolution rate)
 */
export async function playMidiLoop(url: string, bankOverride?: number): Promise<void> {
  if (!started || !synth || !ctx) {
    console.warn('[music] not ready, skip play');
    return;
  }
  if (currentSong === url && sequencer) return; // déjà en lecture

  const myGen = ++playGen;
  stopMusic();
  currentSong = url;
  const bank = bankOverride ?? resolveBank(url);

  try {
    const midiBuf = await fetchMidi(url);
    if (!midiBuf) return; // 404 ou HTML → silent skip (déjà loggé dans fetchMidi)
    // Une autre playMidiLoop/playFanfare est venue après nous : abort, sinon on
    // se retrouve avec 2 sequencers qui jouent en parallèle (BGM map + event).
    if (myGen !== playGen) {
      console.log('[music] aborted (superseded)', url);
      return;
    }
    sequencer = new Sequencer(synth, { skipToFirstNoteOn: true });
    sequencer.loadNewSongList([{ binary: midiBuf }]);
    sequencer.loopCount = Infinity; // sentinel réel = Infinity ; -1 fail (cond `loopCount > 0` interne)
    if (bank > 0) {
      for (let ch = 0; ch < 16; ch++) {
        synth.controllerChange(ch, 0, bank);
      }
    }
    sequencer.play();
    console.log('[music] playing', url, 'bank=', bank);
  } catch (e) {
    console.warn('[music] échec lecture', url, e);
  }
}

/**
 * Joue un sound effect (se_*.mid) en one-shot via SpessaSynth.
 * Utilise le même synth que la musique → les voices SE s'ajoutent à la polyphonie active.
 * Le bank SF2 est résolu auto via le mapping (rs_sfx_1, rs_sfx_2, frlg_sfx selon le SE).
 * @param name — nom court (ex: 'se_ball_throw') ou URL complète vers .mid
 */
export async function playSE(name: string): Promise<void> {
  if (!started || !synth || !ctx) return;
  const url = name.endsWith('.mid') ? name : `/decomp/em/music/${name}.mid`;
  const bank = resolveBank(url);

  try {
    const midiBuf = await fetchMidi(url);
    if (!midiBuf) return;
    const seq = new Sequencer(synth, { skipToFirstNoteOn: true });
    seq.loadNewSongList([{ binary: midiBuf }]);
    seq.loopCount = 0; // one-shot
    if (bank > 0) {
      // SE utilise les channels supérieurs typiquement (priority m4a) : on force bank
      // sur les 16 channels MAIS on n'écrase pas le bank de la musique en cours
      // car SpessaSynth réutilise les channels — caveat : la musique peut avoir un glitch
      // momentané sur les channels SE. Acceptable pour MVP.
      for (let ch = 0; ch < 16; ch++) {
        synth.controllerChange(ch, 0, bank);
      }
    }
    seSequencers.add(seq);
    seq.eventHandler.addEvent('songEnded', `cleanup-${Date.now()}`, () => {
      seSequencers.delete(seq);
      // Restore bank de la musique principale si elle joue encore
      if (currentSong && sequencer) {
        const musicBank = resolveBank(currentSong);
        if (musicBank > 0) {
          for (let ch = 0; ch < 16; ch++) synth!.controllerChange(ch, 0, musicBank);
        }
      }
    });
    seq.play();
  } catch (e) {
    console.warn('[music] échec SE', url, e);
  }
}

/**
 * Joue le cri d'un Pokémon (WAV pré-extrait, pas via SF2).
 * @param species — slug minuscule, ex: 'rayquaza', 'pikachu'
 */
export function playCry(species: string): void {
  if (!ctx) return;
  const url = `/decomp/em/cries/${species.toLowerCase()}.wav`;
  // Phaser-free path : utilise Web Audio direct pour éviter de dépendre du Sound Manager Phaser
  fetch(url).then(r => r.arrayBuffer()).then(buf => {
    if (!ctx) return;
    return ctx.decodeAudioData(buf);
  }).then(audioBuf => {
    if (!ctx || !audioBuf) return;
    const src = ctx.createBufferSource();
    src.buffer = audioBuf;
    const gain = ctx.createGain();
    gain.gain.value = 0.7;
    src.connect(gain).connect(ctx.destination);
    src.start();
  }).catch(e => console.warn('[music] cry fail', species, e));
}

/** Slot "saved music" du décomp (savebgm SONG / playbgm SONG,TRUE). */
export function setSavedBgm(name: string | null): void {
  if (!name || name.toLowerCase() === 'mus_dummy') { savedBgmUrl = null; return; }
  const url = name.endsWith('.mid') ? name : `/decomp/em/music/${name}.mid`;
  savedBgmUrl = url;
}
export function getSavedBgm(): string | null { return savedBgmUrl; }
export function getCurrentBgm(): string | null { return currentSong; }

/**
 * Joue une fanfare (jingle court). Pause la BGM courante, joue le jingle one-shot,
 * restore la BGM au songEnded. Cf. décomp `playfanfare` / `m4aMPlayFadeOutTemporarily`.
 *
 * Sans pause, le SE joue par-dessus + change le bank des channels du synth, ce qui
 * "casse" la BGM en cours (instruments incorrects pendant ~5s pour mus_help).
 */
export async function playFanfare(name: string): Promise<void> {
  if (!started || !synth || !ctx) return;
  const url = name.endsWith('.mid') ? name : `/decomp/em/music/${name}.mid`;

  const myGen = ++playGen;
  // Pause BGM si elle joue (et marque pour restauration)
  if (sequencer && currentSong) {
    pausedBgmUrl = currentSong;
    try { sequencer.pause(); } catch {/* ignore */}
    sequencer = null;
    currentSong = null;
    try { synth.stopAll(true); } catch {/* ignore */}
  }

  const bank = resolveBank(url);
  try {
    const buf = await fetchMidi(url);
    if (!buf) { restoreFanfareBgm(); return; }
    if (myGen !== playGen) { console.log('[music] fanfare aborted (superseded)', url); return; }
    const seq = new Sequencer(synth, { skipToFirstNoteOn: true });
    seq.loadNewSongList([{ binary: buf }]);
    seq.loopCount = 0;
    if (bank > 0) for (let ch = 0; ch < 16; ch++) synth.controllerChange(ch, 0, bank);
    seSequencers.add(seq);
    seq.eventHandler.addEvent('songEnded', `fanfare-${Date.now()}`, () => {
      seSequencers.delete(seq);
      restoreFanfareBgm();
    });
    seq.play();
    console.log('[music] fanfare', url, 'bank=', bank);
  } catch (e) {
    console.warn('[music] fanfare fail', url, e);
    restoreFanfareBgm();
  }
}

function restoreFanfareBgm(): void {
  if (!pausedBgmUrl) return;
  const url = pausedBgmUrl;
  pausedBgmUrl = null;
  void playMidiLoop(url);
}

export function stopMusic(): void {
  if (sequencer) {
    try { sequencer.pause(); } catch {/* ignore */}
    sequencer = null;
  }
  // Stop tous les SE one-shot encore actifs
  for (const seq of seSequencers) {
    try { seq.pause(); } catch {/* ignore */}
  }
  seSequencers.clear();
  if (synth) {
    try { synth.stopAll(true); } catch {/* ignore */}
  }
  currentSong = null;
}
