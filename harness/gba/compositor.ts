/**
 * Compositor 1:1 GBA — combine BG layers + OAM sprites par priority par scanline.
 *
 * Ordre de rendu pour un pixel (1:1 GBADEK) :
 *   1. Backdrop color (BG palette[0])
 *   2. BG layers visibles, par priority décroissante (3 → 0), puis BG3, BG2, BG1, BG0
 *   3. OAM sprites visibles, par priority puis sprite index croissant
 *   4. Blending (BLDCNT / BLDALPHA / BLDY) sur top 2 layers selon target1/target2
 *   5. Window masking (WIN0/WIN1/WINOBJ/WINOUT) — seuls les layers permis sont visibles
 *
 * Pour MVP minimal : juste BG layers, sans OAM/blend/window.
 * Ces étapes seront ajoutées dans des sessions suivantes.
 */
import {
  type AffineMatrix, type BgConfig, type BlendConfig, type HBlankCallback, type MosaicConfig,
  type OamEntry, type Windows, type TilePixels,
  LayerId, OAM_SIZES, SCREEN_W, SCREEN_H, windowsAreOff,
} from './types';
import { PaletteBanks } from './palette';
import { renderBgScanline, renderBgAffineScanline, createTileCache } from './bg-layer';
import { decodeTile4bpp, decodeTile8bpp } from './tile';

interface BgLayerData {
  config: BgConfig;
  vram: Uint8Array;        // char data (max 32KB)
  tilemap: Uint16Array;    // map entries
}

/**
 * Compositor minimal — render une frame complète dans `frameBuffer` (Uint8ClampedArray
 * de 240*160*4 = 153 600 bytes RGBA).
 *
 * Pour chaque scanline 0-159 :
 *   1. Run HBLANK callback si défini (avant rendu de cette scanline)
 *   2. Backdrop color
 *   3. Render chaque BG layer visible dans un scanline buffer temp
 *   4. Compose les BG layers par priority (priority 3 dessous, 0 dessus)
 *   5. Write scanline finale dans frameBuffer
 *
 * @param frameBuffer 240×160×4 bytes RGBA, OUT
 * @param bgs 4 BG layers (BG0-3)
 * @param palette palette banks
 * @param hblankCallback optional (frame avant scanline 0..159)
 */
// Module-level caches pour éviter allocations par frame (= GC pressure).
// Réinitialisés au besoin dans composeFrame.
const _scanlineBufsCache: Uint8ClampedArray[] = [];
const _tileCachesCache: ReturnType<typeof createTileCache>[] = [];

/** Invalide les tiles décodées en cache pour un BG donné (= range tileIds).
 *  À call après une écriture VRAM (= fillBgTilemap, copyPixelBufferToVram pour
 *  les windows). Sans ce clear, le BG renderer affiche le contenu STALE du
 *  cache (= tile rendered avant l'écriture VRAM).
 *
 *  La key du tileCache combine tileId + flipH<<10 + flipV<<11 + paletteMode<<12.
 *  On clear les 8 combinations possibles par tileId. */
export function invalidateBgTileCache(bgIdx: number, baseTileId: number, count: number): void {
  const cache = _tileCachesCache[bgIdx];
  if (!cache) return;
  for (let t = 0; t < count; t++) {
    const tileId = baseTileId + t;
    // 8 combinations : flipH × flipV × paletteMode (4bpp/8bpp).
    for (let mode = 0; mode < 2; mode++) {
      for (let fH = 0; fH < 2; fH++) {
        for (let fV = 0; fV < 2; fV++) {
          const key = tileId | (fH << 10) | (fV << 11) | (mode << 12);
          cache.delete(key);
        }
      }
    }
  }
}
const _oamPriorityBufsCache: Uint8ClampedArray[] = [
  new Uint8ClampedArray(SCREEN_W * 4),
  new Uint8ClampedArray(SCREEN_W * 4),
  new Uint8ClampedArray(SCREEN_W * 4),
  new Uint8ClampedArray(SCREEN_W * 4),
];
const _sortedBgsCache: number[] = [];
let _lastBgsLen = 0;

// Cache tiles décodées OAM. Reset chaque frame (= début de composeFrame).
// Key = decodeId | paletteMode<<13. Tiles changent rarement entre frames (=
// objVram updates) mais on reset par sécurité.
const _oamTileCache = new Map<number, TilePixels>();

// Cache OAM sort order par y (= 1:1 décomp subpriority pattern). Sort once
// per frame, reuse across scanlines. Y ascending → highest y processed last
// (= on top). Same y → higher OAM idx first (= sprite 0 wins ties = 1:1 GBA).
const _oamSortedIndices: number[] = [];

export function composeFrame(
  frameBuffer: Uint8ClampedArray,
  bgs: ReadonlyArray<BgLayerData>,
  palette: PaletteBanks,
  oam?: ReadonlyArray<OamEntry>,
  objVram?: Uint8Array,
  blend?: BlendConfig,
  windows?: Windows,
  affineParams?: ReadonlyArray<AffineMatrix>,
  bgAffineMatrices?: ReadonlyArray<AffineMatrix>,
  mosaic?: MosaicConfig,
  hblankCallback?: HBlankCallback,
): void {
  // Resize caches si bgs.length change (= rare).
  if (_scanlineBufsCache.length < bgs.length) {
    while (_scanlineBufsCache.length < bgs.length) {
      _scanlineBufsCache.push(new Uint8ClampedArray(SCREEN_W * 4));
      _tileCachesCache.push(createTileCache());
    }
  }
  const scanlineBufs = _scanlineBufsCache;
  const tileCaches = _tileCachesCache;
  const backdrop = palette.getBackdropRgba();

  // Pré-trier les BGs par priority. Re-trier seulement si bgs structure changé
  // (= len ou priorities). Pour MVP : re-tri à chaque frame mais réutilise
  // l'array (pas d'alloc) — sort() est in-place sur _sortedBgsCache.
  if (_sortedBgsCache.length !== bgs.length || _lastBgsLen !== bgs.length) {
    _sortedBgsCache.length = 0;
    for (let i = 0; i < bgs.length; i++) _sortedBgsCache.push(i);
    _lastBgsLen = bgs.length;
  }
  _sortedBgsCache.sort((a, b) => {
    const pa = bgs[a].config.priority;
    const pb = bgs[b].config.priority;
    if (pa !== pb) return pb - pa;  // priority haute (3) en arrière
    return b - a;                    // BG index haut (3) en arrière
  });
  const sortedBgs = _sortedBgsCache;

  // OAM scanline buffers : module-level cache. Toujours 4 (1 par priority).
  const oamPriorityBufs = oam ? _oamPriorityBufsCache : [];

  // Clear OAM tile cache au début de chaque frame (= objVram peut changer
  // entre frames, ex. player walk animation cycle change tileId).
  _oamTileCache.clear();

  // Clear BG tile caches au début de chaque frame également (= bg.vram peut
  // changer entre frames via LZ77UnCompVram, CpuCopy16, DmaCopy16, etc.).
  // Garde l'optim cache cross-scanline (= 30 tiles décodés une fois pour 160
  // scanlines). Perd l'optim cross-frame mais évite stale cache dans intro,
  // scene transitions, et tout VRAM write non-tracké. Tradeoff : ~0.5ms/frame
  // au pire (= 240 décodes max × 3 BG = 720 décodes/frame). Bug a0a6aff2 fix.
  for (const cache of _tileCachesCache) cache.clear();

  // 1:1 décomp BuildSpritePriorities + SortSprites (sprite.c:325-450).
  //   priority = subpriority | (oam.priority << 8)
  //   sort ASC by priority, tie-break by Y DESC (= larger Y at lower index).
  //   Render in this sorted order with "last write wins" → smaller index =
  //   drawn first = appears BEHIND. Larger index = drawn last = ON TOP.
  //
  // Hotfix Manectric/Brendan intro Z-bug : avant on triait par Y ASC seul,
  // ce qui ignorait subpriority. Quand Manectric (subpri=0) et Brendan
  // (subpri=2) se croisent en Y (= Sin/Cos circular pattern), la priorité
  // était inversée → Brendan apparaissait devant Manectric. Fix : honorer
  // subpriority comme dans le décomp.
  //
  // Note : "lower OAM index drawn first" matches our compositor "last write
  // wins" semantic (= larger OAM index in render order = on top).
  if (oam) {
    _oamSortedIndices.length = 0;
    for (let i = 0; i < oam.length; i++) _oamSortedIndices.push(i);
    _oamSortedIndices.sort((a, b) => {
      const sa = oam[a]; const sb = oam[b];
      // Primary : composite priority (lower = drawn FIRST = behind).
      const pa = (sa.subpriority ?? 0xFF) | (sa.priority << 8);
      const pb = (sb.subpriority ?? 0xFF) | (sb.priority << 8);
      if (pa !== pb) return pb - pa;  // higher priority first → ends drawn LAST = on top
      // Tie-break : Y ASC (= higher Y on screen drawn last = on top, matches
      // décomp `sprite1Y < sprite2Y → swap` insertion sort).
      if (sa.y !== sb.y) return sa.y - sb.y;
      // Secondary tie-break : OAM idx DESC (= sprite 0 wins for same y).
      return b - a;
    });
  }

  for (let y = 0; y < SCREEN_H; y++) {
    if (hblankCallback) hblankCallback(y);

    // Render chaque BG layer dans son scanline buf.
    // Optim : skip si bg.config.visible = false. On zero le buf alpha pour
    // que la priority loop ne l'utilise pas (= module-level cache pourrait
    // contenir stale data d'une frame où le BG était visible).
    for (let i = 0; i < bgs.length; i++) {
      const bg = bgs[i];
      const sl = scanlineBufs[i];
      if (!bg.config.visible) {
        // Zero alpha de toute la scanline (= invisible pour priority loop).
        // Pas de boucle 240 fois — on use Uint8ClampedArray.fill(0).
        sl.fill(0);
        continue;
      }
      if (bg.config.isAffine && bgAffineMatrices) {
        // Affine BG : utilise bgAffineMatrices[affineMatrixIndex]
        const matIdx = Math.min(1, Math.max(0, bg.config.affineMatrixIndex));
        const matrix = bgAffineMatrices[matIdx];
        renderBgAffineScanline(y, bg.config, matrix, bg.vram, bg.tilemap, palette, sl, tileCaches[i]);
      } else {
        renderBgScanline(y, bg.config, bg.vram, bg.tilemap, palette, sl, tileCaches[i]);
      }
      // Apply mosaic horizontal sur la scanline si bg.config.mosaic && mosaic.bgH > 0
      if (bg.config.mosaic && mosaic && mosaic.bgH > 0) {
        applyMosaicHorizontal(scanlineBufs[i], mosaic.bgH);
      }
    }
    

    // Mosaic vertical BG : si bgV > 0, repeat la scanline précédente sur N+1 lignes
    // Pour MVP simple : skip mosaic vertical (rare effet, demande tracking entre scanlines)

    // Render OAM sprites pour cette scanline (par priority)
    if (oam && objVram) {
      for (const buf of oamPriorityBufs) buf.fill(0);
      // Mosaic OBJ (REG_MOSAIC) : appliqué PAR SPRITE dans renderOamSpriteNormal (seuls
      // les sprites avec oam.mosaic=1), PAS globalement à tous les sprites — 1:1 HW GBA.
      _objMosH = mosaic ? mosaic.objH : 0;
      _objMosV = mosaic ? mosaic.objV : 0;
      renderOamScanline(y, oam, objVram, palette, oamPriorityBufs, affineParams);
    }

    // Compute WINOBJ mask scanline (bool[] de 240 entries) — pixels où un sprite
    // OBJ_WINDOW (objMode === 2) a un pixel opaque. Ces pixels suivent le layerMask
    // winObjInside au lieu de outsideEnable.
    let winObjMask: Uint8Array | null = null;
    if (windows && windows.winObjEnabled && oam && objVram) {
      winObjMask = computeWinObjScanline(y, oam, objVram, affineParams);
    }

    // Compute pixel layer mask + blend gate via windows pour chaque scanline.
    // Si aucune window active → tous layers visibles, blend partout (default GBA).
    // 1:1 GBATEK : si Y1>Y2 (idem X1>X2), le hardware wrap-around → window
    // covers [y1, screen_h) ∪ [0, y2). Cas du décomp starter_choose ARCKO
    // (labelLeft = 0*8 - 4 = -4 → u8 wraps to 252, x1=252 > x2=108 → box visible
    // sur [0, 108) via wrap). Avant : strict y1<y2 → ARCKO box invisible.
    const windowsActive = windows && !windowsAreOff(windows);
    const yInWin0 = windowsActive && windows.win0.enabled && (
      windows.win0.y1 <= windows.win0.y2
        ? (y >= windows.win0.y1 && y < windows.win0.y2)
        : (y >= windows.win0.y1 || y < windows.win0.y2)
    );
    const yInWin1 = windowsActive && windows.win1.enabled && (
      windows.win1.y1 <= windows.win1.y2
        ? (y >= windows.win1.y1 && y < windows.win1.y2)
        : (y >= windows.win1.y1 || y < windows.win1.y2)
    );

    // Compose pixel par pixel + tracking des top 2 layers par pixel pour blend.
    for (let x = 0; x < SCREEN_W; x++) {
      const off = x * 4;
      // Init avec backdrop
      let r1 = backdrop[0], g1 = backdrop[1], b1 = backdrop[2];
      let layer1 = LayerId.BD as number;
      let r2 = backdrop[0], g2 = backdrop[1], b2 = backdrop[2];
      let layer2 = LayerId.BD as number;
      // OBJ_BLEND tracking : si layer1 vient d'un sprite OBJ_BLEND (objMode===1),
      // GBA force ce sprite comme blend target1 indépendamment de BLDCNT_TGT1.
      // Voir GBATEK : "Mode 1 = Semi-Transparent OBJ → ignore BLDCNT TGT1, force blend".
      let layer1ObjBlend = false;

      // Détermine layer mask + blend gate pour ce pixel selon windows
      let layerMask = 0x3F;       // 0x3F = tous layers visibles
      let blendAllowed = true;    // peut appliquer le blend
      if (windowsActive) {
        // 1:1 GBATEK wrap-around X1>X2 → window covers [x1, screen_w) ∪ [0, x2).
        const xInWin0 = yInWin0 && (
          windows.win0.x1 <= windows.win0.x2
            ? (x >= windows.win0.x1 && x < windows.win0.x2)
            : (x >= windows.win0.x1 || x < windows.win0.x2)
        );
        const xInWin1 = yInWin1 && (
          windows.win1.x1 <= windows.win1.x2
            ? (x >= windows.win1.x1 && x < windows.win1.x2)
            : (x >= windows.win1.x1 || x < windows.win1.x2)
        );
        const xInWinObj = winObjMask && winObjMask[x] !== 0;
        // Priority : WIN0 > WIN1 > WINOBJ > WINOUT
        if (xInWin0) {
          layerMask = windows.win0Inside;
          blendAllowed = windows.win0BlendEnable;
        } else if (xInWin1) {
          layerMask = windows.win1Inside;
          blendAllowed = windows.win1BlendEnable;
        } else if (xInWinObj) {
          layerMask = windows.winObjInside;
          blendAllowed = windows.winObjBlendEnable;
        } else {
          layerMask = windows.outsideEnable;
          blendAllowed = windows.outsideBlendEnable;
        }
      }

      // Pour chaque priority de 3 → 0 (3 = arrière)
      for (let pri = 3; pri >= 0; pri--) {
        for (const bgIdx of sortedBgs) {
          if (bgs[bgIdx].config.priority !== pri) continue;
          // Skip si layer pas enabled par window
          if ((layerMask & (1 << bgIdx)) === 0) continue;
          const sl = scanlineBufs[bgIdx];
          const a = sl[off + 3];
          if (a > 0) {
            r2 = r1; g2 = g1; b2 = b1; layer2 = layer1;
            r1 = sl[off]; g1 = sl[off + 1]; b1 = sl[off + 2];
            layer1 = bgIdx; // 0..3 = LayerId.BG0..BG3
          }
        }
        if (oam && objVram && (layerMask & (1 << LayerId.OBJ))) {
          const obSl = oamPriorityBufs[pri];
          const a = obSl[off + 3];
          if (a > 0) {
            r2 = r1; g2 = g1; b2 = b1; layer2 = layer1;
            r1 = obSl[off]; g1 = obSl[off + 1]; b1 = obSl[off + 2];
            layer1 = LayerId.OBJ;
            // a === 128 : sprite OBJ_BLEND (Semi-Transparent) — force target1
            layer1ObjBlend = a === 128;
          }
        }
      }

      // Apply blend selon mode (gated par windows.blendAllowed) — SAUF l'OBJ
      // Semi-Transparent (objMode=1) : sur hardware il force l'alpha blend même
      // dans une région fenêtre au bit 5 (special effects) éteint. Référence :
      // zoom d'option Pokénav réel = fondu LISSE alors que WIN0 (glow) ne couvre
      // que la boîte de base et WINOUT=0x1F (effets off dehors) — vérifié vs
      // cartouche (user 2026-07-16) ; avant ce fix, le sprite zoomé rendait
      // opaque hors boîte (tranches) et fondu dedans (fantôme).
      let r = r1, g = g1, b = b1;
      if (blend && (blendAllowed || layer1ObjBlend)) {
        const top1Mask = 1 << layer1;
        // OBJ_BLEND : sprite Semi-Transparent force alpha blend en target1
        // INDÉPENDAMMENT du blend.mode + BLDCNT_TGT1. GBATEK : "Mode 1 OBJ
        // ignores BLDCNT — performs alpha blending using BLDALPHA's evA/evB
        // with itself as target1 and the next-down layer as target2 (if it
        // matches BLDCNT_TGT2)."
        if (layer1ObjBlend) {
          const top2Mask = 1 << layer2;
          if (blend.target2 & top2Mask) {
            const a1w = Math.min(blend.alpha1, 16) / 16;
            const a2w = Math.min(blend.alpha2, 16) / 16;
            r = r1 * a1w + r2 * a2w;
            g = g1 * a1w + g2 * a2w;
            b = b1 * a1w + b2 * a2w;
          }
        } else if (blend.mode > 0 && (blend.target1 & top1Mask)) {
          if (blend.mode === 2) {
            // Brightness inc : pixel + (white - pixel) × (BLDY/16)
            const w = blend.brightness / 16;
            r = r1 + (255 - r1) * w;
            g = g1 + (255 - g1) * w;
            b = b1 + (255 - b1) * w;
          } else if (blend.mode === 3) {
            // Brightness dec : pixel × (1 - BLDY/16)
            const w = 1 - blend.brightness / 16;
            r = r1 * w;
            g = g1 * w;
            b = b1 * w;
          } else if (blend.mode === 1) {
            // Alpha blend : nécessite que top2 soit dans target2
            const top2Mask = 1 << layer2;
            if (blend.target2 & top2Mask) {
              const a1w = Math.min(blend.alpha1, 16) / 16;
              const a2w = Math.min(blend.alpha2, 16) / 16;
              r = r1 * a1w + r2 * a2w;
              g = g1 * a1w + g2 * a2w;
              b = b1 * a1w + b2 * a2w;
            }
          }
        }
      }

      const fbOff = (y * SCREEN_W + x) * 4;
      frameBuffer[fbOff] = r;
      frameBuffer[fbOff + 1] = g;
      frameBuffer[fbOff + 2] = b;
      frameBuffer[fbOff + 3] = 255;
    }
  }
}

/**
 * Render OAM sprites pour une scanline donnée dans les 4 priority buffers.
 * Pour chaque sprite visible qui touche cette scanline, décode les tiles
 * pertinentes et écrit les pixels non-transparents au priority buf approprié.
 *
 * Layout OBJ char data : 1D mapping (DISPCNT bit 6 = 1, le plus commun).
 * En 1D mapping, les tiles d'un sprite multi-tile sont consécutives en mémoire.
 *
 * Si plusieurs sprites se chevauchent à la même priority, le sprite avec
 * l'index OAM le plus PETIT gagne (1:1 GBA).
 */
// Mosaic OBJ courant (REG_MOSAIC objH/objV), setté par composeFrame avant le rendu OAM.
// Appliqué PAR SPRITE dans renderOamSpriteNormal (seuls les sprites avec oam.mosaic=1) — 1:1 HW GBA.
let _objMosH = 0, _objMosV = 0;
function renderOamScanline(
  scanline: number,
  oam: ReadonlyArray<OamEntry>,
  objVram: Uint8Array,
  palette: PaletteBanks,
  priorityBufs: Uint8ClampedArray[],
  affineParams?: ReadonlyArray<AffineMatrix>,
): void {
  // Iterate sprites en y-ascending order (= sorted dans composeFrame).
  // Last write wins → highest y appears on top (= correct depth for
  // overworld where lower-on-screen NPCs sont devant ceux plus haut).
  for (const i of _oamSortedIndices) {
    const sprite = oam[i];
    if (!sprite.visible) continue;
    if (sprite.affineMode === 2) continue; // HIDE
    // OBJ_WINDOW (objMode === 2) ne dessine PAS de pixels colorés. Ces sprites
    // définissent uniquement la zone WINOBJ (= mask alpha pour les BG layers).
    // 1:1 GBATEK : "Object mode 2 = OBJ Window. Pixels are not displayed".
    // computeWinObjScanline les utilise déjà séparément pour le winObjMask.
    // Sans ce skip, ex. les shine sprites du title screen rendaient en blanc
    // visible au lieu de servir de mask invisible.
    if (sprite.objMode === 2) continue;

    const [wTiles, hTiles] = OAM_SIZES[sprite.shape][sprite.size];
    const wPx = wTiles * 8;
    const hPx = hTiles * 8;

    // Affine modes 1 (NORMAL_AFFINE) ou 3 (DOUBLE_AFFINE)
    if (sprite.affineMode === 1 || sprite.affineMode === 3) {
      if (!affineParams) continue;
      renderOamSpriteAffine(scanline, sprite, wPx, hPx, objVram, palette, priorityBufs, affineParams);
      continue;
    }

    // Mode 0 (NORMAL — non-affine)
    renderOamSpriteNormal(scanline, sprite, wPx, hPx, objVram, palette, priorityBufs);
  }
}

/** Render OAM sprite NORMAL (sans affine) sur une scanline. */
function renderOamSpriteNormal(
  scanline: number,
  sprite: OamEntry,
  wPx: number,
  hPx: number,
  objVram: Uint8Array,
  palette: PaletteBanks,
  priorityBufs: Uint8ClampedArray[],
): void {
  // 1:1 HW GBA : l'OAM y est un champ 8-bit NON-SIGNÉ. Le hardware tronque la
  // position à [0,255] puis dessine la scanline si `(scanline - objY) & 0xFF < height`.
  // Conséquence : un sprite dont le bas dépasse 256 RÉAPPARAÎT en haut de l'écran
  // (TOP-WRAP) — c'est ce qui rend les champs météo continus (cendre/brouillard/neige
  // qui défilent et bouclent ; cf. field_weather_effect.c UpdateAshSprite y=coordOffsetY
  // +tOffsetY non borné). Les sprites à y NÉGATIF restent 1:1 : oam.y=-46 → objY=210,
  // (scanline-210)&0xFF = scanline+46 → identique à l'ancien `scanline-(-46)` (drops
  // d'eau à oam.y=-46 inchangés). Seule nouveauté : y≥160 (positif) qui re-boucle.
  const objY = (sprite.y | 0) & 0xFF;
  const localY = (scanline - objY) & 0xFF;
  if (localY >= hPx) return;

  const wTiles = wPx / 8;

  // OAM X = 9-bit (0-511) côté HW GBA → wrap-around horizontal (symétrique du
  // wrap Y 8-bit ci-dessus, objY & 0xFF). Sans ça, un sprite qui dérive loin à
  // gauche (nuages WEATHER_SUNNY_CLOUDS : `sprite->x--` non borné) reste hors
  // champ au lieu de réapparaître à droite → « passe une seule fois » au lieu
  // d'en continu. Sprites dans [-256, 511] inchangés (la maths concorde).
  const objX = (sprite.x | 0) & 0x1FF;
  // Mosaic OBJ : quantifie les coords d'échantillonnage (relatif au coin du sprite),
  // seulement si CE sprite a le bit mosaic — 1:1 GBATEK (REG_MOSAIC objH/objV).
  const mosH = sprite.mosaic ? _objMosH : 0;
  const mLocalY = (sprite.mosaic && _objMosV > 0) ? localY - (localY % (_objMosV + 1)) : localY;
  for (let dx = 0; dx < wPx; dx++) {
    const screenX = (objX + dx) & 0x1FF;
    if (screenX >= SCREEN_W) continue;

    const mdx = mosH > 0 ? dx - (dx % (mosH + 1)) : dx;
    const localX = sprite.flipH ? (wPx - 1 - mdx) : mdx;
    const adjLocalY = sprite.flipV ? (hPx - 1 - mLocalY) : mLocalY;

    const tileX = (localX / 8) | 0;
    const tileY = (adjLocalY / 8) | 0;
    const subX = localX % 8;
    const subY = adjLocalY % 8;

    let tileIdOffset: number;
    if (sprite.paletteMode === 0) {
      tileIdOffset = tileY * wTiles + tileX;
    } else {
      tileIdOffset = (tileY * wTiles + tileX) * 2;
    }
    const finalTileId = sprite.tileId + tileIdOffset;

    // OAM tileNum est en unités 32 bytes peu importe le BPP (cf GBATEK).
    // decodeTile8bpp attend tileId en unités tile-byte (= 64 bytes/tile 8bpp).
    // Donc /2 avant de décoder en 8bpp. 4bpp inchangé.
    const decodeId = sprite.paletteMode === 0 ? finalTileId : (finalTileId >> 1);
    // PERF : cache tiles décodées (= sprite 16×32 visit 8 fois la même tile par
    // scanline = wasteful sans cache). Key = decodeId | paletteMode<<13.
    const cacheKey = decodeId | (sprite.paletteMode << 13);
    let pixels = _oamTileCache.get(cacheKey);
    if (!pixels) {
      pixels = sprite.paletteMode === 0
        ? decodeTile4bpp(objVram, decodeId, false, false)
        : decodeTile8bpp(objVram, decodeId, false, false);
      _oamTileCache.set(cacheKey, pixels);
    }
    const colorIdx = pixels[subY * 8 + subX];
    if (colorIdx === 0) continue;  // transparent

    // ⚠️ FIX session : truncate screenX (sprite.x peut être fractionnel via
    // sprite.x2 ou affine anim), GBA hardware OBJ ne supporte pas sub-pixel
    // → tous les writes doivent landing sur integer pixel boundary. Sans
    // truncation, off = 73.25*4 = 293 = G channel of pixel 73 → écrit le
    // pixel R à offset G/B/A → corrupt G,B,A AND R-of-next-pixel. Visuellement
    // sprite invisible / colors mélangées (= bug audit Lotad release : sprite
    // affine 64×64 avec oam.x=73.25 ne rendait rien).
    const off = (screenX | 0) * 4;
    const buf = priorityBufs[sprite.priority];
    // Hot path : write RGB direct (= évite alloc array via getObjRgba).
    palette.writeObjRgbaTo(sprite.paletteBank, colorIdx, sprite.paletteMode, buf, off);
    // Encode objMode dans le canal alpha :
    //   255 = OBJ_NORMAL (objMode 0)
    //   128 = OBJ_BLEND  (objMode 1, GBA Semi-Transparent — force blend target1)
    // Le compositor lit `a === 128` pour ajouter OBJ à blend.target1 implicite.
    buf[off + 3] = sprite.objMode === 1 ? 128 : 255;
  }
}

/** Render OAM sprite AFFINE (mode 1 ou 3) sur une scanline.
 *  Mode 1 (NORMAL_AFFINE) : bounding box = wPx × hPx normale
 *  Mode 3 (DOUBLE_AFFINE) : bounding box = 2× wPx × 2× hPx (rotation préservée)
 *
 *  Pour chaque pixel screen dans la bounding box, on applique la matrice affine
 *  (transformation inverse) pour trouver le pixel source dans la texture du sprite.
 *  Si la coord source est dans [0, wPx) × [0, hPx), on lookup le pixel ; sinon
 *  pixel transparent (la rotation peut faire dépasser).
 */
function renderOamSpriteAffine(
  scanline: number,
  sprite: OamEntry,
  wPx: number,
  hPx: number,
  objVram: Uint8Array,
  palette: PaletteBanks,
  priorityBufs: Uint8ClampedArray[],
  affineParams: ReadonlyArray<AffineMatrix>,
): void {
  const isDouble = sprite.affineMode === 3;
  const bboxW = isDouble ? wPx * 2 : wPx;
  const bboxH = isDouble ? hPx * 2 : hPx;

  // Y position : top du bbox (le sprite est centré dans bbox en mode DOUBLE)
  // NB : le TOP-WRAP 8-bit OAM y (cf. renderOamSpriteNormal) n'est PAS modélisé ici —
  // aucun sprite affine actuel ne défile au-delà de 256 (météo = non-affine, mons de
  // combat = centrés à l'écran). On garde le y signé complet (préserve le sub-pixel
  // des anims affine). À ajouter si un sprite affine wrappant apparaît.
  const bboxYTop = sprite.y;
  const localBboxY = scanline - bboxYTop;
  if (localBboxY < 0 || localBboxY >= bboxH) return;

  const matrix = affineParams[sprite.affineParamIndex] ?? { pa: 256, pb: 0, pc: 0, pd: 256 };
  const wTiles = wPx / 8;

  // Centre de la bounding box (= centre du sprite dans le bbox)
  const cxBbox = bboxW / 2;
  const cyBbox = bboxH / 2;
  // Centre source : moitié de la texture
  const cxTex = wPx / 2;
  const cyTex = hPx / 2;

  // relY screen → relY texture via matrix (constant pour cette scanline)
  const relY = localBboxY - cyBbox;

  for (let dx = 0; dx < bboxW; dx++) {
    const screenX = sprite.x + dx;
    if (screenX < 0 || screenX >= SCREEN_W) continue;

    const relX = dx - cxBbox;

    // Apply affine matrix : (texX, texY) = matrix × (relX, relY) + (cxTex, cyTex)
    // matrix is 8.8 fixed → divide by 256
    const texX = ((matrix.pa * relX + matrix.pb * relY) >> 8) + cxTex;
    const texY = ((matrix.pc * relX + matrix.pd * relY) >> 8) + cyTex;

    if (texX < 0 || texX >= wPx || texY < 0 || texY >= hPx) continue;

    const tileX = (texX / 8) | 0;
    const tileY = (texY / 8) | 0;
    const subX = texX % 8;
    const subY = texY % 8;

    let tileIdOffset: number;
    if (sprite.paletteMode === 0) {
      tileIdOffset = tileY * wTiles + tileX;
    } else {
      tileIdOffset = (tileY * wTiles + tileX) * 2;
    }
    const finalTileId = sprite.tileId + tileIdOffset;

    // OAM tileNum est en unités 32 bytes peu importe le BPP (cf GBATEK).
    // decodeTile8bpp attend tileId en unités tile-byte (= 64 bytes/tile 8bpp).
    // Donc /2 avant de décoder en 8bpp. 4bpp inchangé.
    const decodeId = sprite.paletteMode === 0 ? finalTileId : (finalTileId >> 1);
    // PERF : cache tiles décodées (= partagé avec renderOamSpriteNormal).
    const cacheKey = decodeId | (sprite.paletteMode << 13);
    let pixels = _oamTileCache.get(cacheKey);
    if (!pixels) {
      pixels = sprite.paletteMode === 0
        ? decodeTile4bpp(objVram, decodeId, false, false)
        : decodeTile8bpp(objVram, decodeId, false, false);
      _oamTileCache.set(cacheKey, pixels);
    }
    const colorIdx = pixels[subY * 8 + subX];
    if (colorIdx === 0) continue;  // transparent

    // ⚠️ FIX session : voir renderOamSpriteNormal — truncate screenX pour
    // éviter writes aux mauvais byte offsets quand sprite.x est fractionnel.
    const off = (screenX | 0) * 4;
    const buf = priorityBufs[sprite.priority];
    palette.writeObjRgbaTo(sprite.paletteBank, colorIdx, sprite.paletteMode, buf, off);
    // OBJ_BLEND encoding (voir renderOamSpriteNormal) : 128 = semi-transparent.
    buf[off + 3] = sprite.objMode === 1 ? 128 : 255;
  }
}

// ─── Helpers : mosaic + WINOBJ ──────────────────────────────────────────────

/** Apply mosaic horizontal sur une scanline RGBA : repeat le pixel à x = i × (factor+1)
 *  sur les `factor` pixels suivants. Effet pixelisation horizontale. */
function applyMosaicHorizontal(scanline: Uint8ClampedArray, factor: number): void {
  if (factor <= 0) return;
  const blockSize = factor + 1;
  for (let xBlock = 0; xBlock < SCREEN_W; xBlock += blockSize) {
    const srcOff = xBlock * 4;
    for (let dx = 1; dx < blockSize && xBlock + dx < SCREEN_W; dx++) {
      const dstOff = (xBlock + dx) * 4;
      scanline[dstOff]     = scanline[srcOff];
      scanline[dstOff + 1] = scanline[srcOff + 1];
      scanline[dstOff + 2] = scanline[srcOff + 2];
      scanline[dstOff + 3] = scanline[srcOff + 3];
    }
  }
}

/** Compute WINOBJ scanline mask : pour chaque pixel x sur la scanline `scanline`,
 *  retourne 1 si un sprite OBJ_WINDOW (objMode === 2) a un pixel OPAQUE à cette
 *  position, 0 sinon. Ces sprites NE sont PAS rendus visuellement, juste une
 *  zone de window pour les autres layers. */
function computeWinObjScanline(
  scanline: number,
  oam: ReadonlyArray<OamEntry>,
  objVram: Uint8Array,
  affineParams?: ReadonlyArray<AffineMatrix>,
): Uint8Array {
  const mask = new Uint8Array(SCREEN_W);
  for (const sprite of oam) {
    if (!sprite.visible) continue;
    if (sprite.affineMode === 2) continue;
    if (sprite.objMode !== 2) continue;

    const [wTiles, hTiles] = OAM_SIZES[sprite.shape][sprite.size];
    const wPx = wTiles * 8;
    const hPx = hTiles * 8;

    // Sprites OBJ_WINDOW AFFINE (mode 1/3 — ex. spotlight Encore/Flatter) :
    // même transfo inverse que renderOamSpriteAffine, mais on écrit le MASK.
    if (sprite.affineMode === 1 || sprite.affineMode === 3) {
      if (!affineParams) continue;
      const isDouble = sprite.affineMode === 3;
      const bboxW = isDouble ? wPx * 2 : wPx;
      const bboxH = isDouble ? hPx * 2 : hPx;
      const localBboxY = scanline - sprite.y;
      if (localBboxY < 0 || localBboxY >= bboxH) continue;
      const matrix = affineParams[sprite.affineParamIndex] ?? { pa: 256, pb: 0, pc: 0, pd: 256 };
      const cxBbox = bboxW / 2, cyBbox = bboxH / 2;
      const cxTex = wPx / 2, cyTex = hPx / 2;
      const relY = localBboxY - cyBbox;
      for (let dx = 0; dx < bboxW; dx++) {
        const screenX = sprite.x + dx;
        if (screenX < 0 || screenX >= SCREEN_W) continue;
        if (mask[screenX]) continue;
        const relX = dx - cxBbox;
        const texX = ((matrix.pa * relX + matrix.pb * relY) >> 8) + cxTex;
        const texY = ((matrix.pc * relX + matrix.pd * relY) >> 8) + cyTex;
        if (texX < 0 || texX >= wPx || texY < 0 || texY >= hPx) continue;
        const tileX = (texX / 8) | 0, tileY = (texY / 8) | 0;
        const subX = texX % 8, subY = texY % 8;
        const tileIdOffset = sprite.paletteMode === 0
          ? tileY * wTiles + tileX
          : (tileY * wTiles + tileX) * 2;
        const finalTileId = sprite.tileId + tileIdOffset;
        const decodeId = sprite.paletteMode === 0 ? finalTileId : (finalTileId >> 1);
        const pixels = sprite.paletteMode === 0
          ? decodeTile4bpp(objVram, decodeId, false, false)
          : decodeTile8bpp(objVram, decodeId, false, false);
        if (pixels[subY * 8 + subX] === 0) continue;
        mask[(screenX | 0)] = 1;
      }
      continue;
    }

    const localY = scanline - sprite.y;
    if (localY < 0 || localY >= hPx) continue;

    for (let dx = 0; dx < wPx; dx++) {
      const screenX = sprite.x + dx;
      if (screenX < 0 || screenX >= SCREEN_W) continue;
      if (mask[screenX]) continue;

      const localX = sprite.flipH ? (wPx - 1 - dx) : dx;
      const adjLocalY = sprite.flipV ? (hPx - 1 - localY) : localY;
      const tileX = (localX / 8) | 0;
      const tileY = (adjLocalY / 8) | 0;
      const subX = localX % 8;
      const subY = adjLocalY % 8;
      const tileIdOffset = sprite.paletteMode === 0
        ? tileY * wTiles + tileX
        : (tileY * wTiles + tileX) * 2;
      const finalTileId = sprite.tileId + tileIdOffset;
      // OAM tileNum unités 32B → /2 pour 8bpp (= 64B tile-byte units).
      const decodeId = sprite.paletteMode === 0 ? finalTileId : (finalTileId >> 1);
      const pixels = sprite.paletteMode === 0
        ? decodeTile4bpp(objVram, decodeId, false, false)
        : decodeTile8bpp(objVram, decodeId, false, false);
      const colorIdx = pixels[subY * 8 + subX];
      if (colorIdx === 0) continue;
      mask[screenX] = 1;
    }
  }
  return mask;
}
