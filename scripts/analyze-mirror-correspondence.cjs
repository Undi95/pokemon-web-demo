// Pour chaque .ts vivant de engine/ : a-t-il un .c décomp homonyme (kebab->snake) ?
// => MIROIRISABLE vers game/ (logique jeu) vs PLATEFORME/GLUE (pas de .c).
const fs = require('fs');
const path = require('path');
const SRC = 'D:/Projet 1/pokemon-web-demo/src';
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src';

// set des .c décomp (basename sans extension)
const cFiles = new Set();
function walkC(dir){ for (const e of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,e.name); if(e.isDirectory()) walkC(p); else if(e.name.endsWith('.c')) cFiles.add(e.name.replace(/\.c$/,'')); } }
walkC(DECOMP);

function walk(dir, acc){ for (const e of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,e.name); if(e.isDirectory()) walk(p,acc); else if(e.name.endsWith('.ts')) acc.push(p);} }

// dossiers engine à classer (hors decomp-data = données, m4a = audio infra)
const dirs = ['battle','field','ui','bag','script','pokemon','save','system','gba','boot','devtools'];
console.log('=== correspondance engine/<dir> <-> décomp .c (kebab->snake) ===');
let totMir=0, totMirL=0, totPlat=0, totPlatL=0;
for (const d of dirs) {
  const root = path.join(SRC, 'engine', d);
  let files=[]; try{ walk(root, files);}catch{ continue; }
  let mir=0,mirL=0,plat=0,platL=0; const platNames=[];
  for (const f of files) {
    const base = path.basename(f).replace(/\.ts$/,'');
    const snake = base.replace(/-/g,'_');
    const lines = fs.readFileSync(f,'utf8').split('\n').length;
    if (cFiles.has(snake)) { mir++; mirL+=lines; }
    else { plat++; platL+=lines; platNames.push(base); }
  }
  totMir+=mir; totMirL+=mirL; totPlat+=plat; totPlatL+=platL;
  console.log(`\n  engine/${d.padEnd(9)} : MIROIRISABLE ${String(mir).padStart(3)} fich/${String(mirL).padStart(6)}l  |  PLATEFORME ${String(plat).padStart(3)} fich/${String(platL).padStart(6)}l`);
  if (platNames.length) console.log(`      (plateforme/glue: ${platNames.slice(0,18).join(', ')}${platNames.length>18?' …':''})`);
}
console.log(`\n=== TOTAL engine (hors m4a/decomp-data) : MIROIRISABLE ${totMir} fich / ${totMirL} l  |  PLATEFORME ${totPlat} fich / ${totPlatL} l ===`);
