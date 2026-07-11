/**
 * harness/m4a/native.ts — pont du moteur son m4a NATIF (1:1, certifié
 * sample-exact vs mGBA) vers WebAudio.
 *
 * Modèle : le MOTEUR vit dans le main thread (src/m4a.ts + src/m4a_1.ts —
 * les appels du jeu m4aSongNumStart/PlaySE/… restent synchrones, comme les
 * appels du CPU GBA) ; le worklet (public/m4a-native-processor.js) ne fait
 * que restituer. Cadence pilotée par la CONSOMMATION : le worklet demande
 * ({t:'need'}) → produceFrames() exécute m4aSoundVSync()+m4aSoundMain() par
 * frame (l'ordre réel de main.c : VCountIntr→VSync puis VBlankIntr→SoundMain)
 * et poste la tranche pcmBuffer écrite + le snapshot des registres PSG.
 * Comme l'interruption VBlank du GBA, cette cadence ne dépend PAS du rAF
 * (onglet caché : la musique continue).
 *
 * Données : public/decomp/em/m4a/sound-data.bin — blob BYTE-EXACT à la ROM
 * (généré des sources par scripts/m4a-data/build-sound-region.cjs), posé à
 * SOUND_RAM_SIZE avec translation d'adresses (setSoundMemoryTranslate,
 * certifiée par run-trace-ts --blob).
 *
 * Triggers PSG : CgbSound écrit NRx4|0x80 (retrigger hardware) ; après
 * chaque snapshot on CONSOMME le bit 7 (write-once, cf. processor).
 */
import {
  gSoundIoRam,
  m4aSoundVSync,
  setSoundMemory,
  setSoundMemoryTranslate,
} from '../../src/m4a_1';
import { gMPlayInfo_BGM, gMPlayInfo_SE1, gMPlayInfo_SE2, gSoundInfo, m4aSoundInit, m4aSoundMain, setGVoicegroup000, SOUND_RAM_SIZE } from '../../src/m4a';
import { setGSongTable } from '../../src/song_table';
import { PCM_DMA_BUF_SIZE } from '../../include/gba/m4a_internal';
import { getAudioContext, getMasterGain } from './audio-context';

/** Mode moteur : NATIF par défaut ; `?m4a-legacy` = shim historique
 *  (spessasynth). Constant au boot — le dispatch vit dans decomp-globals. */
export const M4A_NATIVE = typeof location !== 'undefined'
  && !new URLSearchParams(location.search).has('m4a-legacy');

const BLOB_URL = '/decomp/em/m4a/sound-data.bin';
const INDEX_URL = '/decomp/em/m4a/sound-data.json';
// ⚠️ Fichier de public/ servi statique : SANS cache-bust, le navigateur peut
// garder un processor PÉRIMÉ à travers les éditions (payé : comportements
// fantômes chez le user pendant que le pane teste la version fraîche).
const PROCESSOR_URL = `/m4a-native-processor.js?v=${encodeURIComponent(import.meta.env?.DEV ? Date.now() : '1')}`;

const REG_BASE = 0x60; // snapshot gSoundIoRam[0x60..0xB0) (NRxx + bias + WAVE_RAM)
const REG_LEN = 0x50;
// NR14/NR24/NR34/NR44 : bit 7 = trigger one-shot, consommé après snapshot.
const TRIGGER_REGS = [0x65, 0x6d, 0x75, 0x7d];

interface SoundDataIndex {
  base: number;
  size: number;
  gSongTable: number;
  voicegroup000: number;
  labels: Record<string, number>;
}

// État SINGLETON sur globalThis : le module peut être évalué deux fois
// (import dynamique de main.ts + graphe statique, et HMR) — deux instances
// créeraient DEUX worklets consommant le même moteur (×2 de cadence, payé
// au câblage : wr avançait à 90 fps au lieu de 59,7).
interface M4aNativeState {
  ready: Promise<boolean> | null;
  node: AudioWorkletNode | null;
  producing: boolean;
  starting: boolean;
  fallbackClock: number | null;
}
const _state: M4aNativeState = ((globalThis as Record<string, unknown>).__m4aNativeState ??= {
  ready: null,
  node: null,
  producing: false,
  starting: false,
  fallbackClock: null,
}) as M4aNativeState;

/** Charge le blob de données + initialise le moteur (m4aSoundInit). Idempotent.
 *  Résout false (avec hurlement console) si le blob est absent. */
export function initM4aNative(): Promise<boolean> {
  _state.ready ??= (async () => {
    const [binRes, idxRes] = await Promise.all([fetch(BLOB_URL), fetch(INDEX_URL)]);
    if (!binRes.ok || !idxRes.ok) {
      console.error(`[m4a-native] sound-data introuvable (${binRes.status}/${idxRes.status}) — régénérer : node scripts/m4a-data/build-sound-region.cjs --emit`);
      return false;
    }
    const blob = new Uint8Array(await binRes.arrayBuffer());
    const index = (await idxRes.json()) as SoundDataIndex;

    const mem = new Uint8Array(SOUND_RAM_SIZE + blob.length);
    mem.set(blob, SOUND_RAM_SIZE);
    setSoundMemory(mem);
    setSoundMemoryTranslate(index.base - SOUND_RAM_SIZE);
    setGSongTable(index.gSongTable);
    setGVoicegroup000(index.voicegroup000);
    // gCryTable/gCryTable_Reverse (sound.c:28-29 extern) — import différé
    // pour ne pas tirer sound.ts (et son sous-graphe jeu) dans ce module.
    const { setGCryTables } = await import('../../src/sound');
    setGCryTables(index.labels.gCryTable, index.labels.gCryTable_Reverse);
    m4aSoundInit();
    installFallbackClock(); // le moteur tourne dès l'init, audio autorisé ou non
    console.log(`[m4a-native] moteur initialisé — blob ${blob.length} octets @0x${index.base.toString(16)} (byte-exact ROM)`);
    return true;
  })();
  return _state.ready;
}

/** Monte le worklet et branche la restitution sur le graphe audio du harness
 *  (masterGain → limiter → arbitre). Idempotent. */
export async function startM4aNativeAudio(): Promise<void> {
  if (_state.node || _state.starting) return;
  _state.starting = true;
  const ok = await initM4aNative();
  if (!ok) { _state.starting = false; return; }
  const ctx = getAudioContext();
  await ctx.audioWorklet.addModule(PROCESSOR_URL);
  if (_state.node) return; // course entre deux appels
  const _node = new AudioWorkletNode(ctx, 'm4a-native', {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  _state.node = _node;
  _node.port.onmessage = (e: MessageEvent) => {
    const m = e.data as { t: string; n?: number };
    if (m.t === 'stats') {
      (globalThis as Record<string, unknown>).__m4aStats = m;
      return;
    }
    if (m.t === 'need') {
      (globalThis as { __m4aNeedCount?: number }).__m4aNeedCount =
        ((globalThis as { __m4aNeedCount?: number }).__m4aNeedCount ?? 0) + 1;
      produceFrames(Math.min(m.n ?? 8, 32));
    }
  };
  _node.onprocessorerror = (e) => console.error('[m4a-native] processor error', e);
  _node.connect(getMasterGain());

  // Autoplay policy : le contexte peut naître SUSPENDU (reload sans media
  // engagement — payé : silence permanent chez le user, « recliquer ne fait
  // rien »). Le resume vivait dans m4aPrime(), un chemin du SHIM que le
  // dispatch natif ne traverse plus → on résume ici sur chaque geste humain.
  const resumeOnGesture = (): void => {
    if (ctx.state === 'suspended') {
      ctx.resume().catch((e) => console.error('[m4a-native] resume', e));
    }
  };
  window.addEventListener('pointerdown', resumeOnGesture);
  window.addEventListener('keydown', resumeOnGesture);
  resumeOnGesture();
  produceFrames(8); // pré-remplissage (~134 ms)
}

/** Produit n frames GBA : moteur + tranche PCM écrite (formule certifiée par
 *  l'oracle B) + snapshot des registres PSG. */
function produceFrames(n: number, post: boolean = true): void {
  if (_state.producing) return; // ré-entrance (need pendant produce)
  if (post && !_state.node) return;
  _state.producing = true;
  try {
    produceFramesInner(n, post);
  } catch (e) {
    console.error('[m4a-native] produceFrames', e);
  } finally {
    _state.producing = false;
  }
}

function produceFramesInner(n: number, post: boolean): void {
  {
    const spv = gSoundInfo.pcmSamplesPerVBlank;
    const period = gSoundInfo.pcmDmaPeriod;
    const pcm = new Int8Array(n * spv * 2);
    const regs = new Uint8Array(n * REG_LEN);
    for (let f = 0; f < n; f++) {
      m4aSoundVSync();
      m4aSoundMain();
      const dc = gSoundInfo.pcmDmaCounter;
      const cur = dc - 1 > 0 ? spv * (period - (dc - 1)) : 0;
      for (let i = 0; i < spv; i++) {
        pcm[f * spv * 2 + i] = gSoundInfo.pcmBuffer[cur + i]; // R
        pcm[f * spv * 2 + spv + i] = gSoundInfo.pcmBuffer[cur + i + PCM_DMA_BUF_SIZE]; // L
      }
      regs.set(gSoundIoRam.subarray(REG_BASE, REG_BASE + REG_LEN), f * REG_LEN);
      for (const r of TRIGGER_REGS) gSoundIoRam[r] &= 0x7f; // trigger consommé
    }
    if (post) {
      _state.node!.port.postMessage({ t: 'frames', n, pcm: pcm.buffer, regs: regs.buffer }, [pcm.buffer, regs.buffer]);
    }
  }
}

/** Horloge de secours — 1:1 sémantique GBA : le driver tourne sur VBlank,
 *  TOUJOURS, que le son sorte ou non. Sans elle, un AudioContext suspendu
 *  (autoplay sans geste) figeait le MOTEUR entier : MUS_TITLE restait à
 *  « 0 piste » → le demo-loop du titre (status & 0xFFFF == 0) rebootait
 *  l'intro instantanément, et WaitFanfare/IsSEPlaying gelaient (🩸 payé :
 *  « ça reboot sans input, ça tient avec »). Produit à 59,7275 Hz par
 *  accumulateur temps-réel, SANS poster au worklet (le ring reste vide :
 *  au resume, le son repart frais, sans latence accumulée). */
function installFallbackClock(): void {
  if (_state.fallbackClock) return;
  let last = performance.now();
  let acc = 0;
  _state.fallbackClock = window.setInterval(() => {
    const now = performance.now();
    const ctx = _state.node?.context as AudioContext | undefined;
    const audioDrives = !!ctx && ctx.state === 'running';
    if (audioDrives) {
      last = now;
      acc = 0;
      return; // le worklet cadence (need-driven)
    }
    acc += (now - last) * (59.7275 / 1000);
    last = now;
    const frames = Math.floor(acc);
    if (frames > 0) {
      acc -= frames;
      produceFrames(Math.min(frames, 8), false);
    }
  }, 16);
}

/** Vide le ring du worklet (transitions dures type reset de jeu). */
export function resetM4aNativeAudio(): void {
  _state.node?.port.postMessage({ t: 'reset' });
}

/** Test d'écoute guidé (console user) : joue chaque famille de sons espacée,
 *  loggue ce qui DOIT s'entendre — permet de localiser une famille muette. */
function m4aTest(): void {
  const g = globalThis as unknown as Record<string, ((...a: number[]) => void) | undefined>;
  const step = (ms: number, label: string, fn: () => void): void => {
    setTimeout(() => { console.log(`[m4a-test] 🔊 ${label}`); fn(); }, ms);
  };
  console.log('[m4a-test] séquence de 20 s — dis-moi ce que tu entends/manque :');
  step(0, '1. MUS_TITLE (musique du titre, DirectSound)', () => g.__soundPlayBGM?.(413));
  step(5000, '2. SE_INTRO_BLAST (laser Rayquaza, PSG square+noise)', () => g.__soundPlaySE?.(103));
  step(8000, '3. se_select (bip menu, PSG)', () => g.__soundPlaySE?.(5));
  step(10000, '4. Cri de Bulbasaur (DirectSound compressé)', () => g.__soundPlayCryInternal?.(1, 0, 120, 10, 0));
  step(13000, '5. Fanfare level-up (pause BGM + reprise)', () => g.__soundPlayFanfare?.(367));
  step(19000, '6. Retour MUS_TITLE', () => g.__soundPlayBGM?.(413));
}

// Sondes dev (lecture uniquement).
(globalThis as Record<string, unknown>).__m4aTest = m4aTest;
(globalThis as Record<string, unknown>).__m4aNative = {
  init: initM4aNative,
  start: startM4aNativeAudio,
  reset: resetM4aNativeAudio,
  info: () => gSoundInfo,
  bgm: () => gMPlayInfo_BGM,
  se1: () => gMPlayInfo_SE1,
  se2: () => gMPlayInfo_SE2,
  node: () => _state.node,
  stats: () => { _state.node?.port.postMessage({ t: 'stats' }); },
  psgGain: (v: number) => { _state.node?.port.postMessage({ t: 'psgGain', v }); },
};
