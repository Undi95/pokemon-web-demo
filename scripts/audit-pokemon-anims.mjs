// Audit 1:1 : animations front Pokémon en combat. Confronte décomp
// src/pokemon.c sMonFrontAnimIdsTable ([SPECIES-1]=ANIM_X, 386 explicites)
// + sMonAnimationDelayTable ([SPECIES-1]=N, 55 explicites, reste=0) à
// public/decomp/em/pokemon-anims.json ({SPECIES:{frontAnimId,delay}}).
// = "graphismes 1:1" anim combat, vérifié DÉTERMINISTIQUEMENT (la
// donnée EST l'anim jouée). Parser INDÉPENDANT. Mirror méthodo
// audit-mon-pic-coords / audit-movement.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const P = 'D:/Projet 1/pokemon-web-demo';
const PK = `${DEC}/src/pokemon.c`;
const ANIMH = `${DEC}/include/pokemon_animation.h`;
const JSON_F = `${P}/public/decomp/em/pokemon-anims.json`;

const pk = readFileSync(PK, 'utf8');
const animSrc = readFileSync(ANIMH, 'utf8');

// ANIM_* value → name (pour défaut = valeur 0).
const animByVal = {};
for (const m of animSrc.matchAll(/^#define\s+(ANIM_\w+)\s+(\d+)\s*$/gm)) animByVal[+m[2]] = m[1];
const ANIM_DEFAULT = animByVal[0];  // unspecified array entry = 0

function tableBody(name) {
  const i = pk.indexOf(`${name}[NUM_SPECIES - 1] =`);
  if (i < 0) return '';
  const open = pk.indexOf('{', i);
  const close = pk.indexOf('\n};', open);
  return pk.slice(open, close);
}
const frontBody = tableBody('sMonFrontAnimIdsTable');
const delayBody = tableBody('sMonAnimationDelayTable');

const decFront = {};
for (const m of frontBody.matchAll(/\[(SPECIES_\w+)\s*-\s*1\]\s*=\s*(ANIM_\w+)/g)) decFront[m[1]] = m[2];
const decDelay = {};
for (const m of delayBody.matchAll(/\[(SPECIES_\w+)\s*-\s*1\]\s*=\s*(\d+)/g)) decDelay[m[1]] = +m[2];

const j = JSON.parse(readFileSync(JSON_F, 'utf8'));

let fMis = 0, dMis = 0, compared = 0;
const sample = [];
// Confronte sur les espèces explicitement listées front (= 386, toutes).
for (const sp of Object.keys(decFront)) {
  compared++;
  const o = j[sp];
  const expAnim = decFront[sp];
  const expDelay = decDelay[sp] ?? 0;  // sparse → défaut 0
  if (!o || o.frontAnimId !== expAnim) {
    fMis++;
    if (sample.length < 20) sample.push(`${sp}.front décomp=${expAnim} json=${o ? o.frontAnimId : '∅'}`);
  }
  if (!o || (o.delay ?? 0) !== expDelay) {
    dMis++;
    if (sample.length < 20) sample.push(`${sp}.delay décomp=${expDelay} json=${o ? o.delay : '∅'}`);
  }
}

console.log(`[audit pokemon-anims] décomp front=${Object.keys(decFront).length} delay-explicites=${Object.keys(decDelay).length} (défaut 0) | json keys=${Object.keys(j).length} | ANIM[0]=${ANIM_DEFAULT}`);
console.log(`  comparés : ${compared} | frontAnimId mismatch : ${fMis} | delay mismatch : ${dMis}`);
if (sample.length) { console.error('  ÉCARTS :'); for (const s of sample) console.error('   ' + s); }
const ok = fMis === 0 && dMis === 0 && compared > 350;
console.log(`\n${ok
  ? `✓ pokemon-anims : ${compared} espèces (frontAnimId + delay) 1:1 décomp — anim combat exacte.`
  : `✗ pokemon-anims : ${fMis} front + ${dMis} delay mismatch / ${compared} — PAS 1:1.`}`);
process.exit(ok ? 0 : 1);
