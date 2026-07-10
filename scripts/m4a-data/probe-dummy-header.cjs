// Sonde ponctuelle : que pointe dummy_song_header dans la ROM ?
'use strict';
const fs = require('fs');
const rom = fs.readFileSync('D:/Projet 1/rom/pokeemerald_us.gba');
const TABLE = 0x86B49F0 - 0x08000000;

// Entrées : mus_dummy (0) et les dummy_song_header (indices 278+ dans le .inc
// = lignes 279-… → comptées par le validateur : cherchons des répétitions).
for (const i of [0, 277, 278, 279, 280]) {
  const h = rom.readUInt32LE(TABLE + 8 * i);
  const ms = rom.readUInt16LE(TABLE + 8 * i + 4);
  const me = rom.readUInt16LE(TABLE + 8 * i + 6);
  const off = h - 0x08000000;
  const nTrks = rom[off];
  console.log(`entry ${i}: header=0x${h.toString(16)} ms=${ms} me=${me} | NumTrks=${nTrks} bytes=${rom.subarray(off, off + 12).toString('hex')}`);
}
