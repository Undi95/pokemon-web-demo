/**
 * public/m4a-native-processor.js — AudioWorkletProcessor du moteur m4a NATIF.
 *
 * Rôle : consommer les frames produites par le moteur 1:1 (main thread,
 * src/m4a.ts + src/m4a_1.ts — certifié sample-exact vs mGBA) et restituer :
 *  - DirectSound : les tranches du pcmBuffer (s8, 13379 Hz, R puis L),
 *    rééchantillonnées en zero-order hold — c'est le DAC PWM du GBA, sans
 *    interpolation ; l'aliasing résiduel EST la sonorité de la console.
 *  - PSG : synthèse des 4 canaux GB depuis le snapshot des registres NRxx
 *    (gSoundIoRam écrits par CgbSound), un snapshot par frame GBA appliqué
 *    à la frontière exacte de sa tranche DirectSound.
 *
 * ⚠️ Émulation HARDWARE (exemption hardware-non-1to1) : le PSG est le chip
 * GB, pas du code décomp — synthèse d'après GBATEK (duty 8 pas, wave 32
 * nibbles, LFSR 15/7 bits, enveloppe 64 Hz, sweep 128 Hz, length 256 Hz).
 * Sémantique des écritures driver (CgbSound, mp2k) : chaque write NRx4|0x80
 * = retrigger (enveloppe rechargée, phase duty CONSERVÉE — hardware GB) ;
 * le pont consomme le bit 7 après chaque snapshot (write-once).
 * Niveaux (GBATEK) : full scale ±0x200 ; FIFO 8 bits ×4 (100 %) ; chaque
 * canal PSG ≤ ±0x20 (le quart de range se partage entre les 4), NR50 ×(n+1)/8.
 *
 * Protocole port : ← {t:'frames', n, pcm(448×n s8 R|L), regs(80×n : 0x60-0xB0)}
 *                  ← {t:'reset'} (vide le ring, coupe le PSG)
 *                  → {t:'need', n} quand le ring passe sous le seuil.
 */
'use strict';

const SPV = 224; // pcmSamplesPerVBlank @13379 Hz (SOUND_MODE_FREQ_13379)
const GBA_RATE = 13379;
const RING_FRAMES = 64; // ~1.07 s
const LOW_WATER = 8; // demande de refill sous 8 frames (~134 ms)
const REG_BASE = 0x60; // snapshot = gSoundIoRam[0x60..0xB0)
const REG_LEN = 0x50;

// Duty 8 pas (GBATEK) : 12.5 %, 25 %, 50 %, 75 %.
const DUTY = [
  [0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
];
// NR32 bits 5-6 → volume wave (×[0, 1, 0.5, 0.25]) ; bit 7 = force 75 %.
const WAVE_VOL = [0, 1, 0.5, 0.25];

class M4aNativeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.pcm = new Int8Array(RING_FRAMES * SPV * 2); // par frame : R×224 puis L×224
    this.regs = new Uint8Array(RING_FRAMES * REG_LEN);
    this.wr = 0; // frames écrites (index absolu)
    this.rd = 0; // frames consommées
    this.srcPos = 0; // position fractionnaire dans la frame courante [0, SPV)
    this.step = GBA_RATE / sampleRate;
    this.needSent = false;
    this.underruns = 0;
    this.lastApplied = -1; // dernière frame dont les regs ont été appliqués

    // État PSG (hardware) — 2 squares, wave, noise.
    this.sq = [
      { on: false, dutyPos: 0, timer: 0, freq: 0, vol: 0, envDir: 0, envPer: 0, envCnt: 0, len: 0, lenOn: false, swPer: 0, swCnt: 0, swShift: 0, swDir: 0, swOn: false },
      { on: false, dutyPos: 0, timer: 0, freq: 0, vol: 0, envDir: 0, envPer: 0, envCnt: 0, len: 0, lenOn: false },
    ];
    this.wave = { on: false, pos: 0, timer: 0, freq: 0, ram: new Uint8Array(16), len: 0, lenOn: false };
    this.noise = { on: false, lfsr: 0x7fff, timer: 0, vol: 0, envDir: 0, envPer: 0, envCnt: 0, len: 0, lenOn: false, width7: false, period: 8 };
    this.frameSeq = 0; // séquenceur 512 Hz (env 64 Hz, len 256 Hz, sweep 128 Hz)
    this.frameSeqTimer = 0;
    this.curRegs = new Uint8Array(REG_LEN);

    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.t === 'frames') {
        const pcm = new Int8Array(m.pcm);
        const regs = new Uint8Array(m.regs);
        for (let f = 0; f < m.n; f++) {
          if (this.wr - this.rd >= RING_FRAMES) break; // plein : drop (main en avance)
          const slot = this.wr % RING_FRAMES;
          this.pcm.set(pcm.subarray(f * SPV * 2, (f + 1) * SPV * 2), slot * SPV * 2);
          this.regs.set(regs.subarray(f * REG_LEN, (f + 1) * REG_LEN), slot * REG_LEN);
          this.wr++;
        }
        this.needSent = false;
      } else if (m.t === 'stats') {
        this.port.postMessage({
          t: 'stats', wr: this.wr, rd: this.rd, underruns: this.underruns,
          srcPos: this.srcPos, step: this.step, sampleRate,
        });
      } else if (m.t === 'reset') {
        this.rd = this.wr;
        this.srcPos = 0;
        for (const s of this.sq) s.on = false;
        this.wave.on = false;
        this.noise.on = false;
      }
    };
  }

  /** Applique le snapshot de regs de la frame qui commence (triggers NRx4). */
  applyRegs(slot) {
    const r = this.regs.subarray(slot * REG_LEN, (slot + 1) * REG_LEN);
    this.curRegs.set(r);
    const g = (off) => r[off - REG_BASE];

    // Square 1 & 2
    for (let i = 0; i < 2; i++) {
      const s = this.sq[i];
      const nrx1 = g(i === 0 ? 0x62 : 0x68);
      const nrx2 = g(i === 0 ? 0x63 : 0x69);
      const nrx3 = g(i === 0 ? 0x64 : 0x6c);
      const nrx4 = g(i === 0 ? 0x65 : 0x6d);
      s.freq = nrx3 | ((nrx4 & 0x07) << 8);
      s.lenOn = !!(nrx4 & 0x40);
      if (nrx4 & 0x80) { // trigger : enveloppe/length rechargées, duty CONSERVÉ
        s.on = true;
        s.vol = nrx2 >> 4;
        s.envDir = (nrx2 >> 3) & 1;
        s.envPer = nrx2 & 7;
        s.envCnt = s.envPer;
        if (s.len === 0) s.len = 64 - (nrx1 & 0x3f);
        s.timer = (2048 - s.freq) * 4; // cycles @4.19 MHz par pas de duty... voir tick()
        if (i === 0) {
          const nr10 = g(0x60);
          s.swPer = (nr10 >> 4) & 7;
          s.swShift = nr10 & 7;
          s.swDir = (nr10 >> 3) & 1;
          s.swCnt = s.swPer || 8;
          s.swOn = s.swPer !== 0 || s.swShift !== 0;
        }
        if ((nrx2 & 0xf8) === 0) s.on = false; // DAC off
      } else if ((nrx2 & 0xf8) === 0) {
        s.on = false;
      }
    }

    // Wave (ch 3)
    const w = this.wave;
    const nr30 = g(0x70);
    const nr34 = g(0x75);
    w.freq = g(0x74) | ((nr34 & 0x07) << 8);
    w.lenOn = !!(nr34 & 0x40);
    if (nr34 & 0x80) {
      w.on = true;
      w.pos = 0; // le trigger wave RESET la position (hardware)
      if (w.len === 0) w.len = 256 - g(0x72);
      for (let k = 0; k < 16; k++) w.ram[k] = g(0x90 + k);
    }
    if (!(nr30 & 0x80)) w.on = false; // DAC wave off

    // Noise (ch 4)
    const n = this.noise;
    const nr42 = g(0x79);
    const nr43 = g(0x7c);
    const nr44 = g(0x7d);
    n.lenOn = !!(nr44 & 0x40);
    const rDiv = nr43 & 7;
    const shift = nr43 >> 4;
    n.width7 = !!(nr43 & 0x08);
    n.period = (rDiv === 0 ? 8 : rDiv * 16) << shift; // cycles @4.19 MHz
    if (nr44 & 0x80) {
      n.on = true;
      n.vol = nr42 >> 4;
      n.envDir = (nr42 >> 3) & 1;
      n.envPer = nr42 & 7;
      n.envCnt = n.envPer;
      if (n.len === 0) n.len = 64 - (g(0x78) & 0x3f);
      n.lfsr = 0x7fff;
      if ((nr42 & 0xf8) === 0) n.on = false;
    } else if ((nr42 & 0xf8) === 0) {
      n.on = false;
    }
  }

  /** Séquenceur de frames GB (512 Hz) : length 256 Hz, sweep 128 Hz, env 64 Hz. */
  tickFrameSeq() {
    const step = this.frameSeq;
    this.frameSeq = (this.frameSeq + 1) & 7;
    if ((step & 1) === 0) { // 256 Hz : length
      for (const s of this.sq) {
        if (s.lenOn && s.len > 0 && --s.len === 0) s.on = false;
      }
      const w = this.wave;
      if (w.lenOn && w.len > 0 && --w.len === 0) w.on = false;
      const n = this.noise;
      if (n.lenOn && n.len > 0 && --n.len === 0) n.on = false;
    }
    if (step === 2 || step === 6) { // 128 Hz : sweep (square 1)
      const s = this.sq[0];
      if (s.on && s.swOn && s.swPer && --s.swCnt <= 0) {
        s.swCnt = s.swPer;
        const d = s.freq >> s.swShift;
        const nf = s.swDir ? s.freq - d : s.freq + d;
        if (nf > 2047) s.on = false;
        else if (s.swShift) s.freq = nf & 0x7ff;
      }
    }
    if (step === 7) { // 64 Hz : enveloppes
      for (const c of [this.sq[0], this.sq[1], this.noise]) {
        if (c.on && c.envPer && --c.envCnt <= 0) {
          c.envCnt = c.envPer;
          if (c.envDir && c.vol < 15) c.vol++;
          else if (!c.envDir && c.vol > 0) c.vol--;
        }
      }
    }
  }

  /** Un sample PSG stéréo à la position courante. Retourne [L, R] en unités
   *  hardware (full scale ±0x200). */
  psgSample(dt) {
    // dt = secondes écoulées pour ce sample de sortie (avance des timers).
    const cycles = dt * 4194304; // horloge GB

    // Frame sequencer 512 Hz
    this.frameSeqTimer += dt * 512;
    while (this.frameSeqTimer >= 1) {
      this.frameSeqTimer -= 1;
      this.tickFrameSeq();
    }

    const nr50 = this.curRegs[0x80 - REG_BASE];
    const nr51 = this.curRegs[0x81 - REG_BASE];
    const volL = (((nr50 >> 4) & 7) + 1) / 8;
    const volR = ((nr50 & 7) + 1) / 8;
    let L = 0;
    let R = 0;
    const add = (chBit, v) => {
      if (nr51 & (chBit << 4)) L += v;
      if (nr51 & chBit) R += v;
    };

    // Squares : period (2048-f)×4 cycles par 1/8 de duty.
    for (let i = 0; i < 2; i++) {
      const s = this.sq[i];
      if (!s.on) continue;
      const per = (2048 - s.freq) * 4;
      s.timer -= cycles;
      while (s.timer <= 0) {
        s.timer += per;
        s.dutyPos = (s.dutyPos + 1) & 7;
      }
      const nrx1 = this.curRegs[(i === 0 ? 0x62 : 0x68) - REG_BASE];
      const bit = DUTY[nrx1 >> 6][s.dutyPos];
      // Unipolaire 0..vol, centré : ±vol/2, échelle ±0x20 max → ×4.
      add(1 << i, ((bit ? s.vol : 0) - s.vol / 2) * 4);
    }

    // Wave : period (2048-f)×2 cycles par nibble.
    const w = this.wave;
    if (w.on) {
      const per = (2048 - w.freq) * 2;
      w.timer -= cycles;
      while (w.timer <= 0) {
        w.timer += per;
        w.pos = (w.pos + 1) & 31;
      }
      const byte = w.ram[w.pos >> 1];
      const nib = (w.pos & 1) ? (byte & 0xf) : (byte >> 4);
      const nr32 = this.curRegs[0x73 - REG_BASE];
      const wv = (nr32 & 0x80) ? 0.75 : WAVE_VOL[(nr32 >> 5) & 3];
      add(4, (nib - 7.5) * wv * 4);
    }

    // Noise : LFSR.
    const n = this.noise;
    if (n.on) {
      n.timer -= cycles;
      while (n.timer <= 0) {
        n.timer += n.period;
        const x = (n.lfsr ^ (n.lfsr >> 1)) & 1;
        n.lfsr = (n.lfsr >> 1) | (x << 14);
        if (n.width7) n.lfsr = (n.lfsr & ~0x40) | (x << 6);
      }
      const bit = (~n.lfsr) & 1;
      add(8, ((bit ? n.vol : 0) - n.vol / 2) * 4);
    }

    return [L * volL, R * volR];
  }

  process(_inputs, outputs) {
    const out = outputs[0];
    const chL = out[0];
    const chR = out.length > 1 ? out[1] : out[0];
    const dt = 1 / sampleRate;

    for (let i = 0; i < chL.length; i++) {
      // Regs de la frame courante (une seule fois par frame, y compris la 1re).
      if (this.rd < this.wr && this.lastApplied !== this.rd) {
        this.lastApplied = this.rd;
        this.applyRegs(this.rd % RING_FRAMES);
      }

      // Avance de la tête de lecture DirectSound (ZOH 13379 Hz).
      this.srcPos += this.step;
      while (this.srcPos >= SPV) {
        this.srcPos -= SPV;
        if (this.rd < this.wr) this.rd++;
        else this.underruns++;
      }

      let dsR = 0;
      let dsL = 0;
      if (this.rd < this.wr) {
        const slot = (this.rd % RING_FRAMES) * SPV * 2;
        const idx = this.srcPos | 0;
        dsR = this.pcm[slot + idx];
        dsL = this.pcm[slot + SPV + idx];
      }

      const [pL, pR] = this.psgSample(dt);
      // Full scale ±0x200 : FIFO s8 ×4 (100 %), PSG déjà en unités hardware.
      chL[i] = (dsL * 4 + pL) / 512;
      chR[i] = (dsR * 4 + pR) / 512;
    }

    // Refill : demander quand on passe sous le seuil.
    const level = this.wr - this.rd;
    if (level < LOW_WATER && !this.needSent) {
      this.needSent = true;
      this.port.postMessage({ t: 'need', n: RING_FRAMES - level });
    }

    return true;
  }
}

registerProcessor('m4a-native', M4aNativeProcessor);
