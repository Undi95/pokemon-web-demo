import { readFileSync } from 'fs';
const sf2 = readFileSync('D:/Projet 1/pokemon-web-demo/public/audio/emerald.sf2');
const view = new DataView(sf2.buffer, sf2.byteOffset, sf2.byteLength);
function fourcc(off) { return String.fromCharCode(sf2[off], sf2[off+1], sf2[off+2], sf2[off+3]); }
let off = 12, pdtaOff = -1, pdtaSize = 0;
while (off < sf2.byteLength) {
  if (fourcc(off) === 'LIST') {
    const sz = view.getUint32(off+4, true);
    if (fourcc(off+8) === 'pdta') { pdtaOff = off+12; pdtaSize = sz-4; break; }
    off += 8+sz;
  } else break;
}
let p = pdtaOff;
while (p < pdtaOff+pdtaSize) {
  const id = fourcc(p);
  const sz = view.getUint32(p+4, true);
  if (id === 'phdr') {
    const n = sz/38;
    const presetsByBank = {};
    for (let i=0; i<n; i++) {
      const eOff = p+8+i*38;
      const program = view.getUint16(eOff+20, true);
      const bank = view.getUint16(eOff+22, true);
      if (!presetsByBank[bank]) presetsByBank[bank] = [];
      presetsByBank[bank].push(program);
    }
    console.log('Bank 116 presets:', presetsByBank[116]?.sort((a,b)=>a-b) || 'NOT PRESENT');
    console.log('Bank 116 has prog 38?', (presetsByBank[116] || []).includes(38));
    console.log('Bank 116 has prog 27?', (presetsByBank[116] || []).includes(27));
    break;
  }
  p += 8+sz;
}
