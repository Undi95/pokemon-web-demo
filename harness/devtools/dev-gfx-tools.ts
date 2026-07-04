/**
 * dev-gfx-tools.ts — sondes GRAPHIQUES réutilisables, exposées sur `window.dev.gfx`.
 *
 * Nées des sessions de diag Pokédex (2026-07) où ces sondes étaient retapées à la
 * main dans preview_eval à chaque bug : elles deviennent l'outillage standard.
 * Réparer/étendre l'outillage fait partie du job (WORKING-MODE).
 *
 * PRINCIPE : lecture de l'état LIVE via `globalThis.__rt` (jamais import() dyn —
 * instance Vite fraîche ≠ runtime live, piège connu). Observe-only sauf film()
 * qui pose un overlay DOM (retirable via filmClear()).
 *
 *   dev.gfx.oam(all?)          → dump compact des sprites (x,y,x2,y2,tile,pal,prio,SUB,cb)
 *   dev.gfx.tile(cb, id, bpp?) → une tile VRAM en ASCII (indices) + stats
 *   dev.gfx.objTile(id)        → idem mais VRAM OBJ
 *   dev.gfx.bgRow(bg, row)     → entrées tilemap d'une rangée (tileId:palette)
 *   dev.gfx.palBank(kind,bank) → 16 couleurs RGB15 hex d'une bank ('bg'|'obj')
 *   dev.gfx.lum(x?,y?,w?,h?)   → luminosité moyenne d'une zone du canvas (fades)
 *   dev.gfx.film(opts?)        → mosaïque de N frames rAF en overlay (transitions !)
 *   dev.gfx.filmClear()        → retire l'overlay film
 *   dev.gfx.findColor(rgb,tol) → où une couleur apparaît sur le canvas (géométrie)
 *
 * Recettes éprouvées :
 *   - Transition qui glitche → dev.gfx.film({frames: 12, every: 2}) PUIS déclencher
 *     la transition dans la ~seconde ; 1 screenshot lit les 12 frames d'un coup.
 *   - Fade suspect → échantillonner dev.gfx.lum() sur la durée (0 = noir).
 *   - Sprite corrompu → dev.gfx.oam() pour tile/sub/prio, puis dev.gfx.objTile(tile).
 *   - « Qu'est-ce qui référence ces tiles ? » → dev.gfx.bgRow(bg, row).
 */
import type { DecompRuntime } from '../runtime/decomp-runtime';

type Rt = DecompRuntime & {
  gba: {
    vram: Uint8Array;
    objVram: Uint8Array;
    bg(n: 0 | 1 | 2 | 3): { tilemap: Uint16Array; config: Record<string, unknown> };
    palette: {
      getBgRgba(bank: number, idx: number, mode: number): readonly [number, number, number, number];
      getObjRgba(bank: number, idx: number, mode: number): readonly [number, number, number, number];
    };
    oam: Array<Record<string, number | boolean> | undefined>;
  };
};

function rt(): Rt | null {
  return ((globalThis as { __rt?: Rt }).__rt) ?? null;
}

function gameCanvas(): HTMLCanvasElement | null {
  return (document.querySelector('#game canvas') ?? document.querySelector('canvas')) as HTMLCanvasElement | null;
}

/** Copie le canvas jeu (WebGL ou 2d) dans un contexte 2d lisible. */
function snap2d(): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const src = gameCanvas();
  if (!src) return null;
  const oc = document.createElement('canvas');
  oc.width = src.width; oc.height = src.height;
  const ctx = oc.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(src, 0, 0);
  return { ctx, w: oc.width, h: oc.height };
}

// ─── OAM dump ─────────────────────────────────────────────────────────────────

function oam(all = false): Array<Record<string, unknown>> {
  const r = rt();
  if (!r) return [];
  const out: Array<Record<string, unknown>> = [];
  for (let i = 0; i < r.gSprites.length; i++) {
    const s = r.gSprites[i] as unknown as Record<string, unknown> | undefined;
    if (!s || !s.inUse) continue;
    if (!all && s.invisible) continue;
    const o = r.gba.oam[(s.oamIndex as number) ?? -1];
    out.push({
      id: i, x: s.x, y: s.y, x2: s.x2, y2: s.y2,
      tile: o?.tileId ?? '—', pal: o?.paletteBank ?? '—',
      prio: o?.priority ?? '—', sub: s.subpriority,
      aff: s.affineMode || undefined, mtx: s.affineMode ? s.matrixNum : undefined,
      inv: s.invisible || undefined,
      cb: (s.callback as { name?: string } | undefined)?.name ?? '—',
    });
  }
  return out;
}

// ─── Tiles VRAM ───────────────────────────────────────────────────────────────

function tileAscii(vram: Uint8Array, tileId: number, bpp: 4 | 8): { ascii: string; nonZero: number; indices: number[] } {
  const HEXC = '0123456789ABCDEF';
  const rows: string[] = [];
  const idxSet = new Set<number>();
  let nonZero = 0;
  if (bpp === 4) {
    const off = tileId * 32;
    for (let y = 0; y < 8; y++) {
      let row = '';
      for (let bx = 0; bx < 4; bx++) {
        const b = vram[off + y * 4 + bx];
        const lo = b & 0xf, hi = (b >> 4) & 0xf;
        row += (lo ? HEXC[lo] : '.') + (hi ? HEXC[hi] : '.');
        if (lo) { nonZero++; idxSet.add(lo); }
        if (hi) { nonZero++; idxSet.add(hi); }
      }
      rows.push(row);
    }
  } else {
    const off = tileId * 64;
    for (let y = 0; y < 8; y++) {
      let row = '';
      for (let x = 0; x < 8; x++) {
        const v = vram[off + y * 8 + x];
        row += v ? HEXC[v & 0xf] : '.';
        if (v) { nonZero++; idxSet.add(v); }
      }
      rows.push(row);
    }
  }
  return { ascii: rows.join('\n'), nonZero, indices: [...idxSet].sort((a, b) => a - b) };
}

/** Tile VRAM BG : charBase (0-3) + tileId relatif au charBase. */
function tile(charBase: number, tileId: number, bpp: 4 | 8 = 4): { ascii: string; nonZero: number; indices: number[] } | null {
  const r = rt();
  if (!r) return null;
  const base = (charBase & 3) * 0x4000;
  const res = tileAscii(r.gba.vram.subarray(base), tileId, bpp);
  console.log(`charBase ${charBase} tile ${tileId} (${bpp}bpp) — ${res.nonZero} px non-0, indices [${res.indices}]\n${res.ascii}`);
  return res;
}

/** Tile VRAM OBJ (tileId en unités 32 octets, comme oam.tileId 4bpp). */
function objTile(tileId: number, bpp: 4 | 8 = 4): { ascii: string; nonZero: number; indices: number[] } | null {
  const r = rt();
  if (!r) return null;
  const res = tileAscii(r.gba.objVram, tileId, bpp);
  console.log(`OBJ tile ${tileId} (${bpp}bpp) — ${res.nonZero} px non-0, indices [${res.indices}]\n${res.ascii}`);
  return res;
}

/** Rangée de tilemap d'un BG : « tileId:pal » ×32 (répérer les tiles fantômes). */
function bgRow(bg: 0 | 1 | 2 | 3, row: number): string[] {
  const r = rt();
  if (!r) return [];
  const tm = r.gba.bg(bg).tilemap;
  const out: string[] = [];
  for (let x = 0; x < 32; x++) {
    const e = tm[row * 32 + x];
    out.push(`${e & 0x3ff}${(e >> 12) ? ':' + (e >> 12) : ''}`);
  }
  return out;
}

// ─── Palettes ─────────────────────────────────────────────────────────────────

function palBank(kind: 'bg' | 'obj', bank: number): string[] {
  const r = rt();
  if (!r) return [];
  const out: string[] = [];
  for (let i = 0; i < 16; i++) {
    const [rr, gg, bb] = kind === 'bg'
      ? r.gba.palette.getBgRgba(bank, i, 0)
      : r.gba.palette.getObjRgba(bank, i, 0);
    out.push(`#${((rr << 16) | (gg << 8) | bb).toString(16).padStart(6, '0')}`);
  }
  return out;
}

// ─── Luminosité (fades) ───────────────────────────────────────────────────────

/** Luminosité moyenne (0-765) d'une zone du canvas natif 240×160. Défaut : bande centrale. */
function lum(x = 0, y = 40, w = 240, h = 80): number {
  const s = snap2d();
  if (!s) return -1;
  const img = s.ctx.getImageData(x, y, Math.min(w, s.w - x), Math.min(h, s.h - y));
  let sum = 0, n = 0;
  for (let i = 0; i < img.data.length; i += 16) { sum += img.data[i] + img.data[i + 1] + img.data[i + 2]; n++; }
  return Math.round(sum / n);
}

/** Localise une couleur sur le canvas : x moyen par rangée (géométrie d'une ligne/forme).
 *  rgb = [r,g,b], tol = tolérance par canal. */
function findColor(rgb: readonly [number, number, number], tol = 30): Array<{ y: number; xAvg: number; n: number }> {
  const s = snap2d();
  if (!s) return [];
  const rows = new Map<number, number[]>();
  const img = s.ctx.getImageData(0, 0, s.w, s.h);
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const o = (y * s.w + x) * 4;
      if (Math.abs(img.data[o] - rgb[0]) <= tol && Math.abs(img.data[o + 1] - rgb[1]) <= tol && Math.abs(img.data[o + 2] - rgb[2]) <= tol) {
        let a = rows.get(y); if (!a) { a = []; rows.set(y, a); }
        a.push(x);
      }
    }
  }
  return [...rows.entries()].map(([y, xs]) => ({ y, xAvg: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length), n: xs.length }));
}

// ─── Film de transition (mosaïque de frames) ──────────────────────────────────

const FILM_ID = '__devGfxFilm';

/** Capture `frames` images (1 toutes les `every` rAF) en mosaïque plein écran.
 *  Lancer PUIS déclencher la transition. 1 screenshot = tout le déroulé.
 *  Mode précis : `seconds` remplace `frames` → capture pendant S secondes à 1/every rAF
 *  (ex. film({every:15, seconds:2}) = toutes les 15 frames pendant 2 s ≈ 8 vignettes). */
function film(opts: { frames?: number; every?: number; cols?: number; seconds?: number } = {}): string {
  const every = opts.every ?? 2;
  const frames = opts.seconds !== undefined
    ? Math.max(1, Math.ceil((opts.seconds * 60) / every))
    : (opts.frames ?? 12);
  const cols = opts.cols ?? 4;
  filmClear();
  const src = gameCanvas();
  if (!src) return 'canvas introuvable';
  const rows = Math.ceil(frames / cols);
  // Wrapper (id = FILM_ID pour filmClear) : canvas + croix ✕ EN HAUT À DROITE de la
  // mosaïque (le panel devtools est caché derrière elle — la croix doit être dessus).
  const wrap = document.createElement('div');
  wrap.id = FILM_ID;
  wrap.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483001;width:100vw;max-height:100vh;overflow:auto;';
  const mc = document.createElement('canvas');
  mc.width = 240 * cols; mc.height = 160 * rows;
  mc.style.cssText = 'display:block;background:#222;image-rendering:pixelated;width:100vw;';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.title = 'Fermer la mosaïque';
  closeBtn.style.cssText = 'position:fixed;top:8px;right:14px;z-index:2147483002;background:#c0392b;color:#fff;'
    + 'border:none;border-radius:4px;width:32px;height:32px;font-size:18px;cursor:pointer;box-shadow:0 1px 4px #000;';
  closeBtn.onclick = filmClear;
  wrap.appendChild(mc);
  wrap.appendChild(closeBtn);
  const ctx = mc.getContext('2d');
  if (!ctx) return 'ctx 2d indisponible';
  let raf = 0, f = 0;
  const t0 = performance.now();
  const tick = (): void => {
    if (raf % every === 0 && f < frames) {
      const x = (f % cols) * 240, y = Math.floor(f / cols) * 160;
      ctx.drawImage(src, x, y);
      ctx.strokeStyle = '#444';
      ctx.strokeRect(x + 0.5, y + 0.5, 239, 159);
      // Timestamp SECONDES depuis le lancement (lisible sur chaque vignette).
      const sec = ((performance.now() - t0) / 1000).toFixed(2) + 's';
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(x + 2, y + 2, ctx.measureText(sec).width + 6, 14);
      ctx.fillStyle = '#ffe200';
      ctx.fillText(sec, x + 5, y + 13);
      f++;
    }
    raf++;
    if (f < frames) requestAnimationFrame(tick);
    else { document.body.appendChild(wrap); console.log(`[dev.gfx.film] ${frames} frames posées (1/${every} rAF) — croix ✕ ou dev.gfx.filmClear() pour retirer`); }
  };
  requestAnimationFrame(tick);
  return `capture de ${frames} frames (1/${every} rAF) lancée — déclenche la transition MAINTENANT`;
}

function filmClear(): void {
  document.getElementById(FILM_ID)?.remove();
}

// ─── Installation sur window.dev.gfx ─────────────────────────────────────────

export function installGfxTools(): void {
  const w = globalThis as unknown as { dev?: Record<string, unknown> };
  w.dev ??= {};
  w.dev.gfx = {
    oam, tile, objTile, bgRow, palBank, lum, findColor, film, filmClear,
    help(): string {
      return [
        'dev.gfx — sondes graphiques (voir en-tête dev-gfx-tools.ts pour les recettes)',
        '  oam(all?)            dump sprites actifs (+invisibles si all)',
        '  tile(charBase, id)   tile VRAM BG en ASCII',
        '  objTile(id)          tile VRAM OBJ en ASCII',
        '  bgRow(bg, row)       32 entrées tilemap « tile:pal »',
        '  palBank(kind, bank)  16 couleurs hex (kind = bg|obj)',
        '  lum(x?,y?,w?,h?)     luminosité moyenne canvas (fades)',
        '  findColor([r,g,b])   géométrie d\'une couleur (xAvg par rangée)',
        '  film({frames,every}) mosaïque de frames rAF (transitions)',
        '  film({every,seconds}) mode précis : 1/every rAF pendant S secondes',
        '  filmClear()          retire la mosaïque',
      ].join('\n');
    },
  };
}
