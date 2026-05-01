/**
 * GBA M4A square wave aliased processor (AudioWorklet).
 *
 * 1:1 hardware GB Sound Channel 1/2 : square wave RAW (pas band-limited).
 * Le caractère "buzzy/edgy" 8-bit vient de l'aliasing du DAC GBA à 13.379 kHz.
 * Notre PeriodicWave 32-harmoniques était trop propre → cleané les leads.
 *
 * Phase accumulator simple : phase ∈ [0, 1), avance de freq/sampleRate par sample.
 * Output = +1 si phase < duty, -1 sinon. Aliasing libre (Web Audio sample rate).
 *
 * AudioParams :
 *   - frequency : Hz, a-rate (pour vibrato/pitch bend)
 *   - duty : 0-1 (default 0.5), k-rate (fixe à la création)
 */
class SquareProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
  }

  static get parameterDescriptors() {
    return [
      { name: 'frequency', defaultValue: 440, minValue: 1, maxValue: 24000, automationRate: 'a-rate' },
      { name: 'duty', defaultValue: 0.5, minValue: 0.01, maxValue: 0.99, automationRate: 'k-rate' },
    ];
  }

  process(inputs, outputs, parameters) {
    const out = outputs[0];
    if (!out || out.length === 0) return true;
    const ch0 = out[0];
    const sr = sampleRate;
    const duty = parameters.duty[0];
    const freqArr = parameters.frequency;
    const freqIsArray = freqArr.length > 1;

    for (let i = 0; i < ch0.length; i++) {
      const f = freqIsArray ? freqArr[i] : freqArr[0];
      this.phase += f / sr;
      while (this.phase >= 1) this.phase -= 1;
      ch0[i] = this.phase < duty ? 1 : -1;
    }

    for (let c = 1; c < out.length; c++) {
      const chc = out[c];
      for (let i = 0; i < chc.length; i++) chc[i] = ch0[i];
    }

    return true;
  }
}

registerProcessor('m4a-square-processor', SquareProcessor);
