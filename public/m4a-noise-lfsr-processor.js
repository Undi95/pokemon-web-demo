/**
 * GBA noise channel LFSR — AudioWorklet temps-réel.
 *
 * 1:1 hardware Sound Channel 4 GBA :
 *   - 15-bit LFSR (period=0) ou 7-bit LFSR (period=1)
 *   - Chaque tick : nouveau bit calculé via XOR (LFSR feedback)
 *   - Output : ±1 selon bit 0
 *   - Tick frequency = NR43 décodé en Hz (cf. noise-engine.ts midiNoteToNoiseFreq)
 *
 * Avantages vs sample SF2 ripped :
 *   - PAS de loop répétitif (= continuous pseudo-random)
 *   - PAS de pitch shift artefact (= sample par sample temps-réel)
 *   - 1:1 hardware GBA noise channel exact
 *
 * AudioParams :
 *   - frequency : Hz du LFSR tick (a-rate, automation possible)
 *   - is7bit : 0 ou 1 (k-rate, fixe à la création de la note)
 */
class NoiseLfsrProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Init 15-bit (= tous bits à 1, comme hardware GBA reset).
    this.lfsr = 0x7FFF;
    this.is7bit = false;
    this.phase = 0;
  }

  static get parameterDescriptors() {
    return [
      { name: 'frequency', defaultValue: 4096, minValue: 1, maxValue: 524288, automationRate: 'a-rate' },
      { name: 'is7bit', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  process(inputs, outputs, parameters) {
    const out = outputs[0];
    if (!out || out.length === 0) return true;
    const ch0 = out[0];
    const sr = sampleRate;
    const freqArr = parameters.frequency;
    const freqIsArray = freqArr.length > 1;
    const is7bit = parameters.is7bit[0] >= 0.5;

    // Si is7bit toggle, reset LFSR to all-ones (= hardware behavior on retrigger).
    if (is7bit !== this.is7bit) {
      this.lfsr = is7bit ? 0x7F : 0x7FFF;
      this.is7bit = is7bit;
      this.phase = 0;
    }
    const mask = is7bit ? 0x7F : 0x7FFF;
    const newBitShift = is7bit ? 6 : 14;

    for (let i = 0; i < ch0.length; i++) {
      const f = freqIsArray ? freqArr[i] : freqArr[0];
      // Phase accumulator : avance de freq/sr par sample. Quand phase>=1, tick le LFSR.
      this.phase += f / sr;
      while (this.phase >= 1) {
        this.phase -= 1;
        // Tick LFSR : XOR bit0+bit1, shift right, inject newBit en haut.
        const bit0 = this.lfsr & 1;
        const bit1 = (this.lfsr >> 1) & 1;
        const newBit = bit0 ^ bit1;
        this.lfsr = ((this.lfsr >> 1) | (newBit << newBitShift)) & mask;
      }
      // Output : ±1 selon bit 0 du LFSR (1:1 hardware GBA inverted output).
      ch0[i] = (this.lfsr & 1) ? -1 : 1;
    }

    // Mirror sur tous les output channels (mono → stereo si demandé).
    for (let c = 1; c < out.length; c++) {
      const chc = out[c];
      for (let i = 0; i < chc.length; i++) chc[i] = ch0[i];
    }

    return true;
  }
}

registerProcessor('m4a-noise-lfsr', NoiseLfsrProcessor);
