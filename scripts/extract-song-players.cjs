#!/usr/bin/env node
/**
 * extract-song-players.cjs — extrait le mapping song → music player depuis la
 * song table de la décomp (sound/song_table.inc, 1:1 gSongTable).
 *
 * Sur GBA, chaque song est assignée à UN music player (colonne `ms`) :
 *   MUSIC_PLAYER_BGM=0 · MUSIC_PLAYER_SE1=1 · MUSIC_PLAYER_SE2=2 · MUSIC_PLAYER_SE3=3
 * C'est ce routage qui permet aux jingles MUS_* (mus_evolved, mus_level_up,
 * mus_obtain_item… tous sur SE2) de jouer PAR-DESSUS le BGM sans le couper —
 * le BGM (player 0) continue et « reprend sa place » à la fin du jingle
 * (bug évolution : PlayBGM(MUS_EVOLVED) coupait MUS_EVOLUTION chez nous).
 *
 * Sortie : src/engine/decomp-data/src/song-players.ts (GÉNÉRÉ, ne pas éditer).
 *
 * Usage : node scripts/extract-song-players.cjs
 */
const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const SRC = path.join(DECOMP, 'sound/song_table.inc');
const OUT = path.join(__dirname, '../src/engine/decomp-data/src/song-players.ts');

const text = fs.readFileSync(SRC, 'utf8');
// `song mus_evolved, MUSIC_PLAYER_SE2, 2` — la colonne 2 (ms) = player.
// La gSongTable répète certains noms (slots mus_dummy/se_dummy de remplissage) :
// dédup par nom, en vérifiant que les doublons ont le MÊME player.
const seen = new Map();
const re = /^\s*song\s+(\w+)\s*,\s*MUSIC_PLAYER_(BGM|SE1|SE2|SE3)\s*,/gm;
let m;
let total = 0;
while ((m = re.exec(text)) !== null) {
  const player = { BGM: 0, SE1: 1, SE2: 2, SE3: 3 }[m[2]];
  total++;
  if (seen.has(m[1])) {
    if (seen.get(m[1]) !== player)
      console.warn(`⚠️ ${m[1]} : players divergents (${seen.get(m[1])} vs ${player}) — première occurrence gardée`);
    continue;
  }
  seen.set(m[1], player);
}
const entries = [...seen.entries()];
console.log(`${total} lignes song, ${entries.length} noms uniques`);

if (entries.length < 500) {
  console.error(`⚠️ ${entries.length} entrées seulement (attendu ~614) — vérifier le parse`);
  process.exit(1);
}

const byPlayer = [0, 0, 0, 0];
for (const [, p] of entries) byPlayer[p]++;

const lines = entries.map(([name, p]) => `  "${name}": ${p},`);
const out = `/**
 * song-players.ts — GÉNÉRÉ par scripts/extract-song-players.cjs depuis
 * decomp sound/song_table.inc (gSongTable, colonne \`ms\` = music player).
 * NE PAS ÉDITER À LA MAIN.
 *
 * 1:1 GBA : MUSIC_PLAYER_BGM=0 · SE1=1 · SE2=2 · SE3=3. Le routage par player
 * est ce qui permet aux jingles MUS_* (SE2) de jouer PAR-DESSUS le BGM
 * (player 0) sans le couper — m4aSongNumStart route chaque song sur SON player.
 * ${entries.length} entrées (BGM=${byPlayer[0]} SE1=${byPlayer[1]} SE2=${byPlayer[2]} SE3=${byPlayer[3]}).
 */

/** song name (minuscules décomp) → music player 0-3. */
export const SONG_NAME_TO_PLAYER: Record<string, number> = {
${lines.join('\n')}
};

/** 1:1 gSongTable lookup — player d'une song (défaut BGM=0 si absente). */
export function getSongMusicPlayer(name: string): number {
  return SONG_NAME_TO_PLAYER[name] ?? 0;
}
`;
fs.writeFileSync(OUT, out);
console.log(`✅ ${entries.length} songs → ${OUT} (BGM=${byPlayer[0]} SE1=${byPlayer[1]} SE2=${byPlayer[2]} SE3=${byPlayer[3]})`);
