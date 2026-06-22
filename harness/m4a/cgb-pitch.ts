/**
 * Pitch CGB (square 1/2, programmable wave) — 1:1 décomp `m4a.c:810-854 MidiKeyToCgbFreq`.
 *
 * Sur GBA, le hardware NRx3/NRx4 ne peut pas exprimer toutes les fréquences MIDI
 * exactement (chip 11 bits). Le décomp utilise deux tables :
 *
 *   gCgbScaleTable[131]  — pour chaque MIDI key (36..130), un byte qui encode
 *                          (octave << 4) | semitone. 12 entrées par octave.
 *   gCgbFreqTable[12]    — frequency offset 1:1 hardware GBA, négatif. À shifter
 *                          à droite par l'octave pour obtenir le bon registre.
 *
 * Le résultat est un NRx3/NRx4 raw value (0-2047), qui sur hardware GBA donne
 *   freq_hz = 131072 / (2048 - rawVal).
 *
 * Cette formule produit le « micro-detune CGB caractéristique » : certaines notes
 * sont légèrement plates ou hautes vs un piano tempéré. Sur emulator, c'est ce
 * qui donne le grain authentique 8-bit.
 */

/** 1:1 décomp `m4a_tables.c:118-131` — 132 entrées (en réalité 131 utiles). */
const G_CGB_SCALE_TABLE: readonly number[] = Object.freeze([
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B,
  0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B,
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B,
  0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x4B,
  0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x5B,
  0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x6B,
  0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x7B,
  0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8A, 0x8B,
  0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0x9B,
  0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xAB,
]);

/** 1:1 décomp `m4a_tables.c:133-147` — 12 entrées s16. */
const G_CGB_FREQ_TABLE: readonly number[] = Object.freeze([
  -2004, -1891, -1785, -1685, -1591, -1501,
  -1417, -1337, -1262, -1192, -1125, -1062,
]);

/** 1:1 décomp `m4a.c:810-854 MidiKeyToCgbFreq(chanNum, key, fineAdjust)`.
 *  Pour les canaux 1-3 (square/wave). Le canal 4 (noise) utilise gNoiseTable.
 *  Renvoie le NRx3/NRx4 raw value 0-2047. */
export function midiKeyToCgbRaw(key: number, fineAdjust: number = 0): number {
  let k = key;
  let fine = fineAdjust;
  if (k <= 35) {
    fine = 0;
    k = 0;
  } else {
    k -= 36;
    if (k > 130) {
      k = 130;
      fine = 255;
    }
  }
  const s1 = G_CGB_SCALE_TABLE[k];
  const val1 = G_CGB_FREQ_TABLE[s1 & 0xF] >> (s1 >> 4);
  const s2 = G_CGB_SCALE_TABLE[k + 1] ?? s1;
  const val2 = G_CGB_FREQ_TABLE[s2 & 0xF] >> (s2 >> 4);
  return val1 + ((fine * (val2 - val1)) >> 8) + 2048;
}

/** Convertit un NRx3 raw value (0-2047) en fréquence Hz (formule hardware GBA).
 *  freq = 131072 / (2048 - rawVal). Pour rawVal=2048 (cap théorique), retourne 0. */
export function cgbRawToHz(rawVal: number): number {
  const denom = 2048 - rawVal;
  if (denom <= 0) return 0;
  return 131072 / denom;
}

/** Combine : MIDI key → fréquence Hz exacte CGB. */
export function midiKeyToCgbFreqHz(key: number, fineAdjust: number = 0): number {
  return cgbRawToHz(midiKeyToCgbRaw(key, fineAdjust));
}
