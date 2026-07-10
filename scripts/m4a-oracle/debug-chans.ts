/** Sonde ponctuelle : état des SoundChannels aux premières frames (diag étage B). */
import { readFileSync } from 'node:fs';
import { gSoundInfo, m4aSoundInit, m4aSoundMain, MPlayStart, gMPlayInfo_BGM } from '../../src/m4a';
import { m4aSoundVSync, setSoundMemory } from '../../src/m4a_1';

const rom = readFileSync('D:/Projet 1/rom/pokeemerald_us.gba');
const mem = new Uint8Array(0x08000000 + rom.length);
mem.set(rom, 0x08000000);
setSoundMemory(mem);
m4aSoundInit();
MPlayStart(gMPlayInfo_BGM, Number(process.argv[2] ?? 143841656) >>> 0);

for (let f = 1; f <= 3; f++) {
  m4aSoundVSync();
  m4aSoundMain();
  console.log(`── f${f} (reverb=${gSoundInfo.reverb}, masterVolume=${gSoundInfo.masterVolume}, maxChans=${gSoundInfo.maxChans})`);
  for (let i = 0; i < gSoundInfo.maxChans; i++) {
    const c = gSoundInfo.chans[i];
    if (!c.statusFlags && !c.envelopeVolume) continue;
    console.log(`  chan${i}: sf=0x${c.statusFlags.toString(16)} type=0x${c.type.toString(16)} atk=${c.attack} dec=${c.decay} sus=${c.sustain} rel=${c.release}`
      + ` env=${c.envelopeVolume} envR=${c.envelopeVolumeRight} envL=${c.envelopeVolumeLeft} volR=${c.rightVolume} volL=${c.leftVolume}`
      + ` wav=0x${c.wav.toString(16)} ptr=0x${c.currentPointer.toString(16)} count=${c.count} freq=${c.frequency} fw=${c.fw}`);
  }
  const buf = gSoundInfo.pcmBuffer;
  const spv = gSoundInfo.pcmSamplesPerVBlank;
  const dc = gSoundInfo.pcmDmaCounter;
  const cur = dc - 1 > 0 ? spv * (gSoundInfo.pcmDmaPeriod - (dc - 1)) : 0;
  const sl: number[] = [];
  for (let i = 0; i < 16; i++) sl.push(buf[cur + i]);
  console.log(`  tranche(dc=${dc})[0..15]: ${sl.join(',')}`);
}
