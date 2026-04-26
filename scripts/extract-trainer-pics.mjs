#!/usr/bin/env node
/**
 * Copie les sprites front des dresseurs depuis le décomp.
 *
 * Sources :
 *   - `graphics/trainers/front_pics/*.png` (PNG 64×64 indexed 4bpp)
 *   - `include/constants/trainers.h` (TRAINER_PIC_X defines)
 *   - `src/data/graphics/trainers.h` (gTrainerFrontPic_X → PNG path)
 *
 * Sortie :
 *   - PNG copiés vers `public/decomp/em/trainer_pics/<name>.png`
 *   - `trainer-pics.json` : { "TRAINER_PIC_HIKER": { "png": "trainer_pics/hiker.png" }, ... }
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDir = join(decompPath, 'graphics', 'trainers', 'front_pics');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'trainer_pics');
const dataDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const dataDirPub = join(projectRoot, 'public', 'decomp', 'em');
mkdirSync(outDir, { recursive: true });
mkdirSync(dataDirSrc, { recursive: true });
mkdirSync(dataDirPub, { recursive: true });

// 1. Parse defines TRAINER_PIC_X
const headerPath = join(decompPath, 'include', 'constants', 'trainers.h');
const headerContent = readFileSync(headerPath, 'utf8');
const picMap = {};
const picRegex = /#define\s+TRAINER_PIC_(\w+)\s+(\d+)/g;
let m;
while ((m = picRegex.exec(headerContent)) !== null) {
  picMap[m[1]] = { index: Number(m[2]) };
}

// 2. Parse gTrainerFrontPic_X → PNG file
const dataPath = join(decompPath, 'src', 'data', 'graphics', 'trainers.h');
const dataContent = existsSync(dataPath) ? readFileSync(dataPath, 'utf8') : '';
const graphicsMap = {};
const gxRegex = /const u32 gTrainerFrontPic_(\w+)\[\][^"]*"graphics\/trainers\/front_pics\/([^"]+)/g;
while ((m = gxRegex.exec(dataContent)) !== null) {
  graphicsMap[m[1]] = m[2];
}

// 3. Map TRAINER_PIC_X (UPPER_SNAKE) → suffix (PascalCase)
function snakeToPascal(snake) {
  return snake.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
}

const manifest = {};
let copied = 0, notFound = 0;
for (const [picName] of Object.entries(picMap)) {
  const suffix = snakeToPascal(picName);
  const pngFile = graphicsMap[suffix];
  if (!pngFile) { notFound++; continue; }
  try {
    copyFileSync(join(srcDir, pngFile), join(outDir, pngFile));
    manifest[`TRAINER_PIC_${picName}`] = { png: `trainer_pics/${pngFile}` };
    copied++;
  } catch { notFound++; }
}

const json = JSON.stringify(manifest);
writeFileSync(join(dataDirSrc, 'trainer-pics.json'), json);
writeFileSync(join(dataDirPub, 'trainer-pics.json'), json);

console.log(`[extract-trainer-pics] ${copied} copiés, ${notFound} not found`);
console.log(`  spot HIKER:`, manifest.TRAINER_PIC_HIKER);
console.log(`  spot YOUNGSTER:`, manifest.TRAINER_PIC_YOUNGSTER);
