/**
 * Composition runtime des battle terrains depuis les assets décomp.
 *
 * Pipeline :
 *   1. Load `palette.json`, `map.bin` (u16 tilemap), `tiles.png` (atlas 16×16
 *      tiles 8×8) depuis `public/decomp/em/battle_terrains/<env>/`.
 *   2. Parse map.bin : chaque u16 = bits 0-9 tile_id + bit 10 flipH + bit 11
 *      flipV + bits 12-15 palette (ignoré MVP, on garde palette intégrée PNG).
 *   3. Compose dans un Phaser RenderTexture sauvegardé sous une key réutilisable.
 *
 * Conforme à la règle "no pre-rendering" : on extrait les sources brutes du
 * décomp, on compose à l'exécution.
 *
 * Cf. MASTER_PLAN.md §7.1 P1.1.
 */
import Phaser from 'phaser';

const BASE = '/decomp/em/battle_terrains';
const cachedKeys = new Set<string>(); // évite recompose si déjà fait

export async function loadBattleTerrain(scene: Phaser.Scene, name: string): Promise<string | null> {
  const key = `battle-terrain-${name}`;
  if (cachedKeys.has(key) && scene.textures.exists(key)) return key;

  const tilesKey = `bt-tiles-${name}`;
  const folder = `${BASE}/${name}`;

  // 1. Fetch JSON + binary en parallèle
  let mapBuf: ArrayBuffer;
  try {
    const mapRes = await fetch(`${folder}/map.bin`);
    if (!mapRes.ok) { console.warn(`[battle-terrain] ${name} not found`); return null; }
    mapBuf = await mapRes.arrayBuffer();
  } catch (e) {
    console.warn(`[battle-terrain] fetch fail ${name}:`, e);
    return null;
  }

  // 2. Charger le tileset comme spritesheet (8×8 tiles)
  if (!scene.textures.exists(tilesKey)) {
    await new Promise<void>((resolve) => {
      scene.load.spritesheet(tilesKey, `${folder}/tiles.png`, { frameWidth: 8, frameHeight: 8 });
      scene.load.once('complete', () => resolve());
      scene.load.once('loaderror', () => { console.warn(`[battle-terrain] tiles fail ${name}`); resolve(); });
      scene.load.start();
    });
  }
  if (!scene.textures.exists(tilesKey)) return null;

  // 3. Parse tilemap u16 (little-endian GBA)
  const map = new Uint16Array(mapBuf);
  // Battle GBA BG2 utilise BG_SIZE 1 = 64×32 (= 512×256 px) avec 2 sub-blocks
  // 32×32 concaténés (cf. `src/battle_bg.c` + GBA hardware ref). Le tilemap
  // 2048 entries = 2 sub-blocks × 1024 entries.
  // Adressage GBA : pour col >= 32, on passe au sub-block 1 (offset +1024).
  // Pour BG_SIZE 0 (1024 entries = 32×32), on render direct.
  const isLarge = map.length >= 2048;
  const W = isLarge ? 64 : 32;
  const H = 32;
  const subBlockSize = 1024; // 32×32 entries

  // 4. Composer dans un RenderTexture
  const rt = scene.add.renderTexture(0, 0, W * 8, H * 8).setVisible(false);
  const tilesTex = scene.textures.get(tilesKey);
  // Limite tile_id au framecount réel pour ne pas crash sur entries vides
  const maxFrame = Math.max(0, tilesTex.frameTotal - 2); // -1 pour __BASE, -1 securité

  // Image temp réutilisée pour chaque tile (perf + pas de leaks)
  const tmp = scene.add.image(0, 0, tilesKey, 0).setOrigin(0, 0).setVisible(false);

  for (let row = 0; row < H; row++) {
    for (let col = 0; col < W; col++) {
      // Sub-block addressing GBA pour BG_SIZE 1 (64 wide) :
      // sub-block 0 = cols 0-31, sub-block 1 = cols 32-63 (offset +1024 entries).
      const subBlock = isLarge && col >= 32 ? 1 : 0;
      const localCol = col % 32;
      const idx = subBlock * subBlockSize + row * 32 + localCol;
      if (idx >= map.length) continue;
      const entry = map[idx];
      const tileId = entry & 0x3FF;
      if (tileId === 0 || tileId > maxFrame) continue;
      const flipH = (entry >> 10) & 1;
      const flipV = (entry >> 11) & 1;
      tmp.setFrame(tileId);
      tmp.flipX = !!flipH;
      tmp.flipY = !!flipV;
      rt.draw(tmp, col * 8, row * 8);
    }
  }
  tmp.destroy();

  rt.saveTexture(key);
  rt.destroy();
  cachedKeys.add(key);
  return key;
}

/**
 * Mapping map.json `battle_scene` field → terrain name.
 * Décomp : `MAP_BATTLE_SCENE_NORMAL` est le défaut, mais le terrain réel est
 * souvent déterminé par le metatile sur lequel on est (herbe/eau/cave/etc).
 * MVP : on prend le `battle_scene` ou un fallback `long_grass`.
 */
export function chooseBattleTerrain(battleScene?: string): string {
  if (!battleScene) return 'long_grass';
  // MAP_BATTLE_SCENE_GYM, _MAGMA, _AQUA, _SIDNEY, etc → stadium
  // MAP_BATTLE_SCENE_NORMAL → fallback selon metatile (herbe par défaut)
  const map: Record<string, string> = {
    MAP_BATTLE_SCENE_NORMAL: 'long_grass',
    MAP_BATTLE_SCENE_GYM: 'stadium',
    MAP_BATTLE_SCENE_MAGMA: 'stadium',
    MAP_BATTLE_SCENE_AQUA: 'stadium',
    MAP_BATTLE_SCENE_SIDNEY: 'stadium',
    MAP_BATTLE_SCENE_PHOEBE: 'stadium',
    MAP_BATTLE_SCENE_GLACIA: 'stadium',
    MAP_BATTLE_SCENE_DRAKE: 'stadium',
    MAP_BATTLE_SCENE_FRONTIER: 'stadium',
    MAP_BATTLE_SCENE_GROUDON: 'cave',
    MAP_BATTLE_SCENE_KYOGRE: 'underwater',
    MAP_BATTLE_SCENE_RAYQUAZA: 'sky',
  };
  return map[battleScene] ?? 'long_grass';
}
