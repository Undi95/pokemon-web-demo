/**
 * Animation runtime des tiles de tilesets (water, flower, sand_water_edge,
 * waterfall) — reproduit `TilesetAnim_General` (src/tileset_anims.c:632).
 *
 * Stratégie :
 *  1. Au boot : convertit l'atlas metatiles en canvas texture (modifiable).
 *  2. Toutes les 267ms (16 frames @ 60fps), avance le frame index de chaque anim.
 *  3. Pour chaque metatile animé (cf. tileset-anims.json), modifie les pixels
 *     concernés dans le canvas avec la frame courante.
 *  4. Refresh la texture → Phaser tilemap se met à jour automatiquement.
 *
 * Cf. DECOMP_ORIGIN_FILES.md F. World/Map.
 */
import Phaser from 'phaser';

interface AnimDef {
  vramStart: number;
  numTiles: number;
  frames: number;
  frameSeq?: number[];   // Custom frame sequence (ex. flower [0,1,0,2])
  framesPath: string;
  periodMs: number;
}

interface AnimatedSubTile {
  animName: string;
  layer: 'lower' | 'upper';
  subTileIdx: number;     // 0-3 (top-left, top-right, bottom-left, bottom-right)
  vramTile: number;
  tileOffsetInAnim: number;
}

export interface TilesetAnimsJson {
  tilesets: Record<string, Record<string, AnimDef>>;
  general_animated_metatiles: Record<string, AnimatedSubTile[]>;
}

const ANIM_FRAME_KEY_PREFIX = 'tilesetanim-';
const ATLAS_LOWER_KEY = 'metatiles-lower';
const ATLAS_UPPER_KEY = 'metatiles-upper';
const ANIM_LOWER_KEY = 'metatiles-lower-anim';
const ANIM_UPPER_KEY = 'metatiles-upper-anim';

let animatorScene: Phaser.Scene | null = null;
let animsData: TilesetAnimsJson | null = null;
let atlasCols = 0;
let lowerCanvas: HTMLCanvasElement | null = null;
let upperCanvas: HTMLCanvasElement | null = null;
let timer: Phaser.Time.TimerEvent | null = null;
const frameCounters: Record<string, number> = {};

/** Préload les PNG frames de chaque animation (water 0-7, flower 0-2, etc.). */
export function preloadTilesetAnims(scene: Phaser.Scene, animsJson: TilesetAnimsJson) {
  for (const [animName, def] of Object.entries(animsJson.tilesets.general)) {
    const totalFrames = def.frameSeq ? Math.max(...def.frameSeq) + 1 : def.frames;
    for (let f = 0; f < totalFrames; f++) {
      const key = `${ANIM_FRAME_KEY_PREFIX}${animName}-${f}`;
      if (!scene.textures.exists(key)) {
        scene.load.image(key, `/decomp/em/${def.framesPath}/${f}.png`);
      }
    }
  }
}

/** Stop l'ancien animator (cleanup avant scene restart). */
export function stopTilesetAnimator() {
  if (timer) { timer.remove(); timer = null; }
  animatorScene = null;
  animsData = null;
  lowerCanvas = null;
  upperCanvas = null;
  for (const k of Object.keys(frameCounters)) delete frameCounters[k];
}

/**
 * Démarre l'animator pour la scène + atlas courants.
 *
 * @param scene Phaser scene
 * @param animsJson JSON `tileset-anims.json`
 * @param atlasColsCount Nombre de colonnes dans l'atlas metatiles (cf. TilesetPairInfo.atlasCols)
 */
export function startTilesetAnimator(
  scene: Phaser.Scene,
  animsJson: TilesetAnimsJson,
  atlasColsCount: number,
) {
  stopTilesetAnimator();
  animatorScene = scene;
  animsData = animsJson;
  atlasCols = atlasColsCount;

  // Convertit les atlas en canvas modifiables (clone de l'image source).
  lowerCanvas = imageToCanvas(scene, ATLAS_LOWER_KEY);
  upperCanvas = imageToCanvas(scene, ATLAS_UPPER_KEY);
  if (!lowerCanvas || !upperCanvas) {
    console.warn('[tileset-animator] atlas indisponible, abort');
    return;
  }

  // Remplace les textures dans Phaser par des canvas refreshables.
  if (scene.textures.exists(ANIM_LOWER_KEY)) scene.textures.remove(ANIM_LOWER_KEY);
  if (scene.textures.exists(ANIM_UPPER_KEY)) scene.textures.remove(ANIM_UPPER_KEY);
  scene.textures.addCanvas(ANIM_LOWER_KEY, lowerCanvas);
  scene.textures.addCanvas(ANIM_UPPER_KEY, upperCanvas);

  // Init compteurs.
  for (const animName of Object.keys(animsJson.tilesets.general)) {
    frameCounters[animName] = 0;
  }

  // Initial draw (frame 0).
  applyFrame();

  // Timer cyclic : chaque 267ms, advance + redraw.
  // Le décomp lance chaque anim à un offset différent (water timer%16==1,
  // flower==0, etc.) → on simule en décalant les compteurs initiaux.
  let i = 0;
  for (const animName of Object.keys(animsJson.tilesets.general)) {
    frameCounters[animName] = i++;
  }

  timer = scene.time.addEvent({
    delay: 267, // 16 frames @ 60fps
    loop: true,
    callback: () => {
      for (const animName of Object.keys(animsJson.tilesets.general)) {
        frameCounters[animName]++;
      }
      applyFrame();
    },
  });
}

/** Returns the keys to use for tilemap layers (substitute for the default atlas keys). */
export function getAnimatedAtlasKeys() {
  return { lower: ANIM_LOWER_KEY, upper: ANIM_UPPER_KEY };
}

function imageToCanvas(scene: Phaser.Scene, textureKey: string): HTMLCanvasElement | null {
  if (!scene.textures.exists(textureKey)) return null;
  const img = scene.textures.get(textureKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img as CanvasImageSource, 0, 0);
  return canvas;
}

/**
 * Convertit une frame PNG en canvas avec idx 0 transparentisé.
 * Le décomp utilise palette idx 0 comme "transparent par convention" mais le
 * browser le rend opaque. Sans ce fix, drawImage écrase la transparence du
 * UPPER layer atlas → flowers/water tiles couvrent les tiles voisines opaques
 * (effet "blob" sur les chemins, fleurs qui paraissent avoir un fond carré).
 */
const animFrameCanvasCache = new Map<string, HTMLCanvasElement>();
function getAnimFrameCanvas(scene: Phaser.Scene, textureKey: string): HTMLCanvasElement | null {
  if (animFrameCanvasCache.has(textureKey)) return animFrameCanvasCache.get(textureKey)!;
  const img = scene.textures.get(textureKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img as CanvasImageSource, 0, 0);
  // Sample pixel (0,0) = palette idx 0 = BG color du décomp.
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const p = data.data;
  const tr = p[0], tg = p[1], tb = p[2];
  for (let i = 0; i < p.length; i += 4) {
    if (p[i] === tr && p[i + 1] === tg && p[i + 2] === tb) p[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  animFrameCanvasCache.set(textureKey, canvas);
  return canvas;
}

function applyFrame() {
  if (!animatorScene || !animsData || !lowerCanvas || !upperCanvas) return;

  const anims = animsData.tilesets.general;
  const animatedMetatiles = animsData.general_animated_metatiles;

  for (const [mtIdStr, hits] of Object.entries(animatedMetatiles)) {
    const mtId = Number(mtIdStr);
    const atlasCol = mtId % atlasCols;
    const atlasRow = Math.floor(mtId / atlasCols);
    const baseX = atlasCol * 16;
    const baseY = atlasRow * 16;

    for (const hit of hits) {
      const animDef = anims[hit.animName];
      if (!animDef) continue;
      // Pick frame index (utilise frameSeq si dispo, sinon cyclique linéaire).
      const counter = frameCounters[hit.animName] ?? 0;
      const frameIdx = animDef.frameSeq
        ? animDef.frameSeq[counter % animDef.frameSeq.length]
        : counter % animDef.frames;

      // Source PNG : tile à la position tileOffsetInAnim
      const frameKey = `${ANIM_FRAME_KEY_PREFIX}${hit.animName}-${frameIdx}`;
      if (!animatorScene.textures.exists(frameKey)) continue;
      const frameImg = getAnimFrameCanvas(animatorScene, frameKey);
      if (!frameImg) continue;

      // PNG anim = arrangé en grille 2 cols (16px wide) × N rows.
      const animCols = Math.floor(frameImg.width / 8);
      const srcX = (hit.tileOffsetInAnim % animCols) * 8;
      const srcY = Math.floor(hit.tileOffsetInAnim / animCols) * 8;

      // Destination dans l'atlas : sub-tile position dans le metatile 16x16
      const dstSubX = baseX + (hit.subTileIdx % 2) * 8;
      const dstSubY = baseY + Math.floor(hit.subTileIdx / 2) * 8;

      const targetCanvas = hit.layer === 'upper' ? upperCanvas : lowerCanvas;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) continue;
      // Clear destination region (especially important for upper layer with transparency)
      ctx.clearRect(dstSubX, dstSubY, 8, 8);
      ctx.drawImage(frameImg as CanvasImageSource, srcX, srcY, 8, 8, dstSubX, dstSubY, 8, 8);
    }
  }

  // Refresh GPU.
  (animatorScene.textures.get(ANIM_LOWER_KEY) as Phaser.Textures.CanvasTexture).refresh();
  (animatorScene.textures.get(ANIM_UPPER_KEY) as Phaser.Textures.CanvasTexture).refresh();
}
