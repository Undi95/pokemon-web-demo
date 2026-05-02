// Liste les presets (bank, program, name) du SF2 ripped pour vérifier qu'ils
// matchent les bank/program utilisés par les .mid (notamment SE).
//
// SF2 format : RIFF sfbk { LIST INFO, LIST sdta, LIST pdta }
//   pdta contains : phdr (preset headers), pbag, pmod, pgen, inst, ibag, imod, igen, shdr
//   phdr : array of 38-byte preset entries:
//     u8 name[20], u16 preset, u16 bank, u16 bagIndex, u32 library, genre, morpho

import { readFileSync } from 'fs';

const sf2 = readFileSync('D:/Projet 1/pokemon-web-demo/public/audio/emerald.sf2');
const view = new DataView(sf2.buffer, sf2.byteOffset, sf2.byteLength);

function fourcc(off) {
  return String.fromCharCode(sf2[off], sf2[off+1], sf2[off+2], sf2[off+3]);
}

// Walk RIFF
if (fourcc(0) !== 'RIFF' || fourcc(8) !== 'sfbk') {
  console.error('Not a valid SF2 file');
  process.exit(1);
}

let offset = 12;
let pdtaOffset = -1, pdtaSize = 0;
while (offset < sf2.byteLength) {
  if (fourcc(offset) === 'LIST') {
    const sz = view.getUint32(offset + 4, true);
    const type = fourcc(offset + 8);
    if (type === 'pdta') {
      pdtaOffset = offset + 12;
      pdtaSize = sz - 4;
      break;
    }
    offset += 8 + sz;
  } else {
    break;
  }
}

if (pdtaOffset < 0) { console.error('pdta not found'); process.exit(1); }

// Walk pdta sub-chunks
let p = pdtaOffset;
const pdtaEnd = pdtaOffset + pdtaSize;
while (p < pdtaEnd) {
  const id = fourcc(p);
  const sz = view.getUint32(p + 4, true);
  if (id === 'phdr') {
    const nEntries = sz / 38;
    console.log(`Found phdr : ${nEntries} preset entries`);
    const presets = [];
    for (let i = 0; i < nEntries; i++) {
      const eOff = p + 8 + i * 38;
      const name = String.fromCharCode(...sf2.slice(eOff, eOff + 20)).replace(/\0+$/, '').trim();
      const program = view.getUint16(eOff + 20, true);
      const bank = view.getUint16(eOff + 22, true);
      presets.push({ bank, program, name });
    }
    // Group by bank
    const banks = new Map();
    for (const p of presets) {
      if (!banks.has(p.bank)) banks.set(p.bank, []);
      banks.get(p.bank).push(p);
    }
    const bankIds = [...banks.keys()].sort((a,b) => a - b);
    console.log(`Banks present: ${bankIds.length} unique banks: [${bankIds.slice(0, 30).join(', ')}${bankIds.length > 30 ? ', ...' : ''}]`);
    // Show bank 115 specifically
    if (banks.has(115)) {
      console.log(`\nBank 115 (= voicegroup_rs_sfx_1 ?) presets : ${banks.get(115).length} total`);
      // Show full list
      for (const p of banks.get(115)) {
        console.log(`  prog ${p.program}: ${p.name}`);
      }
    } else {
      console.log(`\n!!! Bank 115 NOT FOUND in SF2 — explains the bird tweet bug.`);
    }
    // ALWAYS show bank 0 prog 120-127 (= où spessasynth fallback si en mode GM)
    console.log(`\nBank 0 programs 120-127 (= où ça fallback en GM mode) :`);
    for (const p of (banks.get(0) || []).filter(p => p.program >= 120)) {
      console.log(`  prog ${p.program}: ${p.name}`);
    }
    // Bank 128 (= drumkits standard)
    if (banks.has(128)) {
      console.log(`\nBank 128 (drumkit) presets : ${banks.get(128).length}`);
      for (const p of banks.get(128).slice(0, 5)) console.log(`  prog ${p.program}: ${p.name}`);
    }
    break;
  }
  p += 8 + sz;
}
