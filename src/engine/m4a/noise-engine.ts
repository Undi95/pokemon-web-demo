/**
 * Helpers GBA noise channel — 1:1 décomp pokeemeraude/src/m4a.c + m4a_tables.c.
 *
 * Approche : pré-calcule les séquences LFSR dans des AudioBuffer cachés.
 * Le synth.ts les utilise comme drop-in replacement pour le buffer white-noise
 * historique, avec la bonne playbackRate dérivée de gNoiseTable.
 *
 * Pas d'AudioWorklet : on garde le pipeline AudioBufferSourceNode existant pour
 * éviter de toucher au routing/envelope. La seule différence : le contenu du
 * buffer est la vraie séquence LFSR du GBA (= bonne couleur sonore), et la
 * playbackRate suit la formule NR43 hardware au lieu de noteFreq/440.
 */
import { getAudioContext } from './audio-context';

/** 1:1 décomp src/m4a_tables.c gNoiseTable[]. NR43 byte (s,r encoding) pour
 *  MIDI key 21..80 (clampé). */
const G_NOISE_TABLE: readonly number[] = Object.freeze([
  0xD7, 0xD6, 0xD5, 0xD4,
  0xC7, 0xC6, 0xC5, 0xC4,
  0xB7, 0xB6, 0xB5, 0xB4,
  0xA7, 0xA6, 0xA5, 0xA4,
  0x97, 0x96, 0x95, 0x94,
  0x87, 0x86, 0x85, 0x84,
  0x77, 0x76, 0x75, 0x74,
  0x67, 0x66, 0x65, 0x64,
  0x57, 0x56, 0x55, 0x54,
  0x47, 0x46, 0x45, 0x44,
  0x37, 0x36, 0x35, 0x34,
  0x27, 0x26, 0x25, 0x24,
  0x17, 0x16, 0x15, 0x14,
  0x07, 0x06, 0x05, 0x04,
  0x03, 0x02, 0x01, 0x00,
]);

/** Convertit MIDI note (0-127) → fréquence du LFSR (Hz). 1:1 décomp MidiKeyToCgbFreq. */
export function midiNoteToNoiseFreq(key: number): number {
  if (key <= 20) return decodeNr43(G_NOISE_TABLE[0]);
  let idx = key - 21;
  if (idx > 59) idx = 59;
  return decodeNr43(G_NOISE_TABLE[idx]);
}

/** NR43 byte → fréquence LFSR (Hz). bits 7-4 = shift clock (s), bits 2-0 = divisor (r).
 *  Formule hardware GB : freq = 524288 / divisor / 2^(s+1), divisor = (r==0) ? 0.5 : r. */
function decodeNr43(nr43: number): number {
  const s = (nr43 >> 4) & 0xF;
  const r = nr43 & 0x7;
  const divisor = r === 0 ? 0.5 : r;
  return 524288 / divisor / (1 << (s + 1));
}

// ─── LFSR buffer cache ──────────────────────────────────────────────────────
//
// On génère deux buffers (15-bit et 7-bit), à raison de 1 sample par tick LFSR.
// Le buffer 15-bit fait 32767 samples (1 période complète), le 7-bit en fait 127.
//
// À la lecture (synth.ts), on règle playbackRate = noiseFreqHz / sampleRate
// pour que le buffer joue à la cadence GBA originale.

let _buf15: AudioBuffer | null = null;
let _buf7: AudioBuffer | null = null;

/** Renvoie le buffer LFSR (15-bit ou 7-bit) — création paresseuse à la 1ère demande. */
export function getNoiseLfsrBuffer(is7bit: boolean): AudioBuffer {
  if (is7bit) {
    if (_buf7) return _buf7;
    _buf7 = buildLfsrBuffer(127, true);
    return _buf7;
  }
  if (_buf15) return _buf15;
  _buf15 = buildLfsrBuffer(32767, false);
  return _buf15;
}

/** Génère un AudioBuffer mono 1 cycle de LFSR (= len samples).
 *  L'AudioContext.sampleRate est utilisé comme rate du buffer (any rate marche
 *  car on contrôle la lecture via playbackRate côté synth). */
function buildLfsrBuffer(len: number, is7bit: boolean): AudioBuffer {
  const ctx = getAudioContext();
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  // 1:1 hardware GB : LFSR initial = tous les bits à 1 (0x7FFF / 0x7F).
  let lfsr = is7bit ? 0x7F : 0x7FFF;
  const mask = is7bit ? 0x7F : 0x7FFF;
  const newBitShift = is7bit ? 6 : 14;
  for (let i = 0; i < len; i++) {
    const bit0 = lfsr & 1;
    const bit1 = (lfsr >> 1) & 1;
    const newBit = bit0 ^ bit1;
    lfsr = ((lfsr >> 1) | (newBit << newBitShift)) & mask;
    // Sortie : -1 si bit 0 == 1, +1 sinon (1:1 hardware GB qui inverse).
    data[i] = (lfsr & 1) ? -1 : 1;
  }
  return buf;
}
