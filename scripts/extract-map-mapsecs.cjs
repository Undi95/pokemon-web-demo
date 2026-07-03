// Extrait l'index MAP_X → MAPSEC_Y depuis les map.json de la décomp
// (= Overworld_GetMapHeaderByGroupAndId(...)->regionMapSectionId pour l'écran
// ZONE du Pokédex). Sortie : public/decomp/em/map-mapsecs.json.
const fs = require('fs');
const path = require('path');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const OUT = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/map-mapsecs.json';

const mapsDir = path.join(DECOMP, 'data/maps');
const out = {};
for (const dir of fs.readdirSync(mapsDir)) {
  const p = path.join(mapsDir, dir, 'map.json');
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (j.id && j.region_map_section) out[j.id] = j.region_map_section;
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(Object.keys(out).length, 'maps →', OUT);
