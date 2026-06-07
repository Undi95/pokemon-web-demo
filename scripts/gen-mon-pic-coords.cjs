// Generateur one-shot : lit l'extraction mon-pic-coords.json -> src/game/data/mon_pic_coords.ts
// (module mirroir sync de gMonFront/BackPicCoords). Supprime apres usage.
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const d = require(path.join(root, 'public/decomp/em/mon-pic-coords.json'));
const keys = Object.keys(d).sort();
let body = '';
for (const k of keys) {
  const e = d[k]; const f = e.front, b = e.back;
  body += '  ' + k + ': { front: { w: ' + f.w + ', h: ' + f.h + ', yOffset: ' + f.yOffset +
          ' }, back: { w: ' + b.w + ', h: ' + b.h + ', yOffset: ' + b.yOffset + ' } },\n';
}
const out = `/**
 * game/data/mon_pic_coords.ts — Port MIROIR 1:1 des tables ROM
 *   src/data/pokemon_graphics/front_pic_coordinates.h (gMonFrontPicCoords)
 *   src/data/pokemon_graphics/back_pic_coordinates.h  (gMonBackPicCoords)
 *
 * MonCoords decomp = { u8 size = MON_COORDS_SIZE(w,h) ; u8 y_offset }. Ici on garde
 * w/h bruts (dimensions de .size) + yOffset (= .y_offset). yOffset est ce dont
 * GetBattlerSpriteCoord (#19) a besoin (grounding du sprite). Cle = nom enum SPECIES_X.
 *
 * SOURCE : extraction /decomp/em/mon-pic-coords.json (= les .h ci-dessus), embarquee
 * STATIQUEMENT (module PUR, sync, import()-verifiable) : pas de fetch async ni d'etat
 * runtime. Genere par scripts/gen-mon-pic-coords.cjs (lit le JSON). NE PAS editer a la main.
 *
 * DETTE (suivi) : battle-controller-opponent.ts:_loadMonPicCoords charge encore le
 * MEME JSON via fetch async (public/). A migrer vers ce module sync (puis le public
 * peut etre retire) pour supprimer la duplication. Non fait ici (touche la voie L active).
 *
 * 1:1 verifie : BULBASAUR front yOffset=14 / back=16 (front_pic_coordinates.h:8).
 */

export interface MonPicCoord { w: number; h: number; yOffset: number; }
export interface MonPicCoords { front: MonPicCoord; back: MonPicCoord; }

/** 1:1 (gMonFrontPicCoords + gMonBackPicCoords) groupes par espece (cle = nom enum SPECIES_X). */
export const gMonPicCoords: Readonly<Record<string, MonPicCoords>> = {
${body}};

const _NONE: MonPicCoords = gMonPicCoords['SPECIES_NONE'] ?? { front: { w: 64, h: 64, yOffset: 0 }, back: { w: 64, h: 64, yOffset: 0 } };

/** 1:1 gMonFrontPicCoords[species] (front pic = mon ADVERSE). Espece hors table -> SPECIES_NONE. */
export function getMonFrontPicCoords(speciesEnum: string): MonPicCoord {
  return (gMonPicCoords[speciesEnum] ?? _NONE).front;
}
/** 1:1 gMonBackPicCoords[species] (back pic = mon JOUEUR). Espece hors table -> SPECIES_NONE. */
export function getMonBackPicCoords(speciesEnum: string): MonPicCoord {
  return (gMonPicCoords[speciesEnum] ?? _NONE).back;
}
`;
fs.mkdirSync(path.join(root, 'src/game/data'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/game/data/mon_pic_coords.ts'), out);
console.log('OK ecrit', keys.length, 'especes,', out.length, 'octets');
