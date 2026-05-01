// Inspect MIDI controllers (CC) per file to detect reverb level (CC 91)
import { readFileSync } from 'node:fs';
const paths = process.argv.slice(2);

function parseCcs(path) {
  const buf = readFileSync(path);
  let pos = 14;
  let runningStatus = 0;
  const cc = {};
  function readVlq() {
    let v = 0;
    for (let n = 0; n < 4; n++) {
      const b = buf[pos++];
      v = (v << 7) | (b & 0x7F);
      if (!(b & 0x80)) break;
    }
    return v;
  }
  // Find first MTrk
  while (pos < buf.length - 8) {
    if (buf[pos] !== 0x4D || buf[pos + 1] !== 0x54 || buf[pos + 2] !== 0x72 || buf[pos + 3] !== 0x6B) {
      pos++;
      continue;
    }
    pos += 4;
    const len = (buf[pos] << 24) | (buf[pos + 1] << 16) | (buf[pos + 2] << 8) | buf[pos + 3];
    pos += 4;
    const trackEnd = pos + len;
    while (pos < trackEnd) {
      readVlq();
      let status = buf[pos];
      if (status < 0x80) status = runningStatus;
      else { runningStatus = status; pos++; }
      if (status === 0xFF) { pos++; const l = readVlq(); pos += l; }
      else if (status === 0xF0) { const l = readVlq(); pos += l; }
      else {
        const cmd = status & 0xF0;
        if (cmd === 0xB0) {
          const ccNum = buf[pos++], ccVal = buf[pos++];
          cc[ccNum] = ccVal;
        } else if (cmd === 0xC0 || cmd === 0xD0) pos++;
        else pos += 2;
      }
    }
    pos = trackEnd;
  }
  return cc;
}

for (const p of paths) {
  console.log(p, parseCcs(p));
}
