// Génère src/engine/decomp-data/include/constants/map_groups-data.ts depuis
// data/maps/map_groups.json (décomp) — 1:1 du générateur mapjson :
//   #define MAP_<SNAKE(name)> (num | (group << 8))
// Lancer depuis le checkout principal (PAS un worktree) :
//   node scripts/extract-map-groups.cjs
const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const OUT = path.join(__dirname, '..', 'src', 'engine', 'decomp-data', 'include', 'constants', 'map_groups-data.ts');

const d = JSON.parse(fs.readFileSync(path.join(DECOMP, 'data', 'maps', 'map_groups.json'), 'utf8'));

// 1:1 tools/mapjson - conversion CamelCase -> UPPER_SNAKE : underscore entre
// [a-z]->[A-Z] et entre [A-Z]->[A-Z][a-z] (acronymes SSTidal -> SS_TIDAL) ;
// PAS entre chiffre et majuscule (Rooms_1F -> ROOMS_1F, MtPyre_6F -> MT_PYRE_6F,
// verifie sur les 78 labels MAP_* de gRematchTable) ; _ existants conserves.
function toSnake(name) {
  let s = name.replace(/([a-z])([A-Z])/g, '$1_$2');
  s = s.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2');
  return s.toUpperCase();
}

const lines = [];
lines.push('/**');
lines.push(' * map_groups-data.ts — GENERE par scripts/extract-map-groups.cjs depuis');
lines.push(' * decomp data/maps/map_groups.json (la source du map_groups.h genere).');
lines.push(' * Valeur 1:1 : MAP_<NAME> = (num | (group << 8)) ; MAP_GROUP(m)=m>>8 ;');
lines.push(' * MAP_NUM(m)=m&0xFF. `MAP_IDS_BY_HEADER_ID` mappe le gMapHeader.id');
lines.push(' * runtime (nom CamelCase du JSON, ex. "Route118") vers la meme valeur.');
lines.push(' * NE PAS EDITER A LA MAIN.');
lines.push(' */');
lines.push('');
lines.push('export const MAP_CONSTANTS: Readonly<Record<string, number>> = {');
const byHeader = [];
let total = 0;
d.group_order.forEach((groupLabel, group) => {
  const maps = d[groupLabel];
  maps.forEach((name, num) => {
    const value = (num | (group << 8)) >>> 0;
    lines.push(`  MAP_${toSnake(name)}: 0x${value.toString(16).toUpperCase().padStart(4, '0')},`);
    byHeader.push(`  '${name}': 0x${value.toString(16).toUpperCase().padStart(4, '0')},`);
    total++;
  });
});
lines.push('};');
lines.push('');
lines.push('/** gMapHeader.id (CamelCase runtime) -> valeur MAP_* (num | group<<8). */');
lines.push('export const MAP_IDS_BY_HEADER_ID: Readonly<Record<string, number>> = {');
lines.push(...byHeader);
lines.push('};');
lines.push('');
lines.push('/** 1:1 include/constants/maps.h MAP_GROUP/MAP_NUM. */');
lines.push('export function MAP_GROUP(mapConstant: number): number { return (mapConstant >> 8) & 0xFF; }');
lines.push('export function MAP_NUM(mapConstant: number): number { return mapConstant & 0xFF; }');
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`OK ${total} maps -> ${OUT}`);
