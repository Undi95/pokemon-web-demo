import Phaser from 'phaser';

/**
 * Animation de porte au warp.
 *
 * Source décomp : `src/field_door.c`
 *   - `sDoorAnimGraphicsTable[]` (50+ entries METATILE_X_Door → png + palette + sound)
 *   - `sDoorOpenAnimFrames[]` (5 frames d'ouverture, 4 ticks chacune)
 *
 * Lookup au runtime :
 *   1. Au warp, on récupère le metatile à la position du warp
 *   2. On match METATILE_* numérique → label via `metatile-labels.json`
 *   3. On lookup le label dans `doors.json` → png + sound
 *   4. On joue la spritesheet PNG (16×96 = 6 frames de 16×16)
 */

const DOOR_BASE = '/decomp/em/ui/doors';
const DOOR_TEX_PREFIX = 'door-tex-';

interface DoorEntry {
  png: string | null;
  paletteSet: string;
  sound: string;
  tilesName: string;
}

let doorsCatalog: Record<string, DoorEntry> = {};
let metatileLabels: Record<string, number> | null = null;
// Reverse multimap : numeric metatile id → ALL labels (un même ID peut être
// taggé sous plusieurs labels selon le tileset secondary, ex. ID 584 =
// METATILE_Petalburg_Door_Littleroot dans Petalburg, mais aussi
// METATILE_TrickHousePuzzle_RedDoorH_Open_Tile0 dans TrickHouse).
let metatileIdToLabels: Map<number, string[]> | null = null;

export function loadDoorsCatalog(json: Record<string, DoorEntry>) {
  doorsCatalog = json || {};
}

export function loadMetatileLabels(json: Record<string, number>) {
  metatileLabels = json;
  metatileIdToLabels = new Map();
  for (const [label, id] of Object.entries(json)) {
    if (!metatileIdToLabels.has(id)) metatileIdToLabels.set(id, []);
    metatileIdToLabels.get(id)!.push(label);
  }
}

/** Préload TOUTES les door PNGs présentes dans le catalog.
 *  Format réel : 16×96 px = **3 frames de 16×32** chacune.
 *  Cf. field_door.c:289 CopyDoorTilesToVram + sDoorOpenAnimFrames offsets {0, 0x100, 0x200}.
 *  Chaque frame = 8 tiles = 256 bytes = 0x100. Donc 16x32 (2 tiles wide × 4 tiles tall).
 *  La sprite couvre 2 tiles verticaux (tileY-1 et tileY) — décomp dessine x,y-1 + x,y. */
export function preloadAllDoors(scene: Phaser.Scene) {
  for (const entry of Object.values(doorsCatalog)) {
    if (!entry.png) continue;
    const key = `${DOOR_TEX_PREFIX}${entry.png}`;
    if (!scene.textures.exists(key)) {
      scene.load.spritesheet(key, `${DOOR_BASE}/${entry.png}`, { frameWidth: 16, frameHeight: 32 });
    }
  }
}

/** Setup alpha pour TOUTES les door textures chargées.
 *  Frames de 16x32 (3 frames stacked verticalement = PNG 16x96). */
export function setupAllDoors(scene: Phaser.Scene) {
  for (const entry of Object.values(doorsCatalog)) {
    if (!entry.png) continue;
    const srcKey = `${DOOR_TEX_PREFIX}${entry.png}`;
    const aKey = `${srcKey}-a`;
    if (scene.textures.exists(aKey) || !scene.textures.exists(srcKey)) continue;

    const img = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement;
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    if (!ctx) continue;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height);
    const p = d.data;
    // Sample (0,0) du PNG = palette idx 0 = BG transparent.
    // Note: les door PNGs utilisent (255, 0, 255) magenta comme transparent par convention.
    const tr = p[0], tg = p[1], tb = p[2];
    for (let i = 0; i < p.length; i += 4) {
      if (p[i] === tr && p[i + 1] === tg && p[i + 2] === tb) p[i + 3] = 0;
    }
    ctx.putImageData(d, 0, 0);
    const ct = scene.textures.addCanvas(aKey, c);
    if (ct) {
      // 3 frames de 16x32 stackées verticalement
      const frameH = 32;
      const frames = Math.floor(c.height / frameH);
      for (let f = 0; f < frames; f++) ct.add(f, 0, 0, f * frameH, 16, frameH);
    }
  }
}

/** Trouve la door appropriée pour un metatile à une position donnée.
 *  Itère TOUS les labels candidats pour cet ID et retourne le 1er qui matche
 *  une entrée du catalog doors.json. Permet de gérer le namespace par tileset. */
export function findDoorForMetatile(metatileId: number): DoorEntry | null {
  if (!metatileIdToLabels) return null;
  const labels = metatileIdToLabels.get(metatileId);
  if (!labels) return null;
  for (const label of labels) {
    if (doorsCatalog[label]) return doorsCatalog[label];
  }
  return null;
}

/**
 * Joue l'animation d'ouverture à (tileX, tileY) puis appelle `onDone`.
 * Utilise le metatileId pour lookup la bonne porte. Si introuvable, fallback
 * à la première door dispo (généralement General_Door).
 */
export function playDoorOpen(
  scene: Phaser.Scene,
  tileX: number,
  tileY: number,
  onDone: () => void,
  metatileId?: number,
): void {
  let entry = metatileId !== undefined ? findDoorForMetatile(metatileId) : null;
  // Fallback : prendre la 1ère door entry dispo (general)
  if (!entry || !entry.png) entry = Object.values(doorsCatalog).find(e => e.png) ?? null;
  if (!entry || !entry.png) {
    // Pas de door asset → skip anim, callback direct
    onDone();
    return;
  }

  const aKey = `${DOOR_TEX_PREFIX}${entry.png}-a`;
  if (!scene.textures.exists(aKey)) {
    onDone();
    return;
  }

  // Sprite 16x32 anchorée par le BAS = couvre tile (tileY-1) en haut + tile (tileY) en bas.
  // Décomp DrawCurrentDoorAnimFrame dessine le metatile à x, y-1 ET x, y (field_door.c:343-347).
  const sprite = scene.add.sprite(tileX * 16 + 8, tileY * 16 + 16, aKey, 0);
  sprite.setOrigin(0.5, 1).setDepth(tileY * 16 + 16);
  // sDoorOpenAnimFrames : { closed, frame0, frame1, frame2 } chacun 4 ticks GBA = 67ms.
  // On skip "closed" (= map's static tile, pas de sprite). 3 frames d'anim sur ~200ms.
  // Reste sur frame 2 (open) jusqu'à onDone.
  const frameSeq = [0, 1, 2];
  const tickMs = 67; // 4 frames GBA
  let i = 0;
  const tick = () => {
    if (!sprite.active) return;
    sprite.setFrame(frameSeq[i]);
    i++;
    if (i < frameSeq.length) {
      scene.time.delayedCall(tickMs, tick);
    } else {
      // Frame finale (open) reste affichée pendant que le warp se fait.
      // Auto-destroy après ~200ms supplémentaires (fin du warp).
      scene.time.delayedCall(200, () => {
        if (sprite.active) sprite.destroy();
        onDone();
      });
    }
  };
  tick();
}

// ─── Backward compat (ancienne API utilisée si besoin) ───────────────────────
export function preloadDoorAnim(scene: Phaser.Scene) {
  // Charger un placeholder default (le full preload se fait via preloadAllDoors).
  if (!scene.textures.exists(`${DOOR_TEX_PREFIX}littleroot.png`)) {
    scene.load.spritesheet(`${DOOR_TEX_PREFIX}littleroot.png`, `${DOOR_BASE}/littleroot.png`, {
      frameWidth: 16, frameHeight: 16
    });
  }
}

export function setupDoorAnim(scene: Phaser.Scene) {
  setupAllDoors(scene);
}
