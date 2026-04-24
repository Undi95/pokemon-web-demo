/**
 * Basic map editor for our own tile format (the placeholder one).
 * Loads/saves route1.json-like structures. Later this will be upgraded to
 * edit real Emerald maps (metatile IDs from pokeemeraude tilesets).
 */

interface MapData {
  name: string;
  width: number;
  height: number;
  tiles: number[][];
  collisions: number[][];
  playerStart: { x: number; y: number };
  npcs: unknown[];
}

const TILE_COLORS: Record<number, string> = {
  0: '#4a8a3a', // grass
  1: '#9a7a4a', // path
  2: '#6a4a2a', // path-center
  3: '#2a3a2a'  // wall/tree
};

const PALETTE_ENTRIES = Object.entries(TILE_COLORS);
const CELL = 32;
const DEFAULT_W = 20;
const DEFAULT_H = 15;

const canvas = document.getElementById('grid') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const paletteEl = document.getElementById('palette') as HTMLDivElement;
const outputEl = document.getElementById('output') as HTMLPreElement;
const collisionModeEl = document.getElementById('collisionMode') as HTMLInputElement;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
const loadBtn = document.getElementById('loadBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;

let selected = 0;
let map: MapData = blankMap();

function blankMap(): MapData {
  const tiles: number[][] = [];
  const collisions: number[][] = [];
  for (let y = 0; y < DEFAULT_H; y++) {
    const row: number[] = [];
    const crow: number[] = [];
    for (let x = 0; x < DEFAULT_W; x++) {
      const edge = y === 0 || y === DEFAULT_H - 1 || x === 0 || x === DEFAULT_W - 1;
      row.push(edge ? 3 : 0);
      crow.push(edge ? 1 : 0);
    }
    tiles.push(row);
    collisions.push(crow);
  }
  return {
    name: 'Nouvelle map',
    width: DEFAULT_W,
    height: DEFAULT_H,
    tiles,
    collisions,
    playerStart: { x: 1, y: 1 },
    npcs: []
  };
}

function buildPalette() {
  paletteEl.innerHTML = '';
  for (const [id, color] of PALETTE_ENTRIES) {
    const el = document.createElement('div');
    el.className = 'tile' + (Number(id) === selected ? ' selected' : '');
    el.style.background = color;
    el.title = `Tile ${id}`;
    el.addEventListener('click', () => {
      selected = Number(id);
      buildPalette();
    });
    paletteEl.appendChild(el);
  }
}

function render() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const id = map.tiles[y][x] ?? 0;
      ctx.fillStyle = TILE_COLORS[id] ?? '#ff00ff';
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.strokeRect(x * CELL + 0.5, y * CELL + 0.5, CELL - 1, CELL - 1);
      // Collision dot
      if (map.collisions[y][x] === 1) {
        ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
        ctx.beginPath();
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // Player start marker
  const ps = map.playerStart;
  ctx.strokeStyle = '#55aaff';
  ctx.lineWidth = 3;
  ctx.strokeRect(ps.x * CELL + 3, ps.y * CELL + 3, CELL - 6, CELL - 6);
  ctx.lineWidth = 1;
}

function paintAt(clientX: number, clientY: number, erase: boolean) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((clientX - rect.left) / CELL);
  const y = Math.floor((clientY - rect.top) / CELL);
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return;
  if (collisionModeEl.checked) {
    map.collisions[y][x] = erase ? 0 : (map.collisions[y][x] === 1 ? 0 : 1);
  } else {
    map.tiles[y][x] = erase ? 0 : selected;
  }
  render();
}

let painting = false;
canvas.addEventListener('mousedown', (e) => {
  painting = true;
  paintAt(e.clientX, e.clientY, e.button === 2);
});
canvas.addEventListener('mousemove', (e) => {
  if (painting) paintAt(e.clientX, e.clientY, e.buttons === 2);
});
window.addEventListener('mouseup', () => { painting = false; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

exportBtn.addEventListener('click', () => {
  outputEl.textContent = JSON.stringify(map, null, 2);
});
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${map.name.replace(/\s+/g, '_').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});
loadBtn.addEventListener('click', async () => {
  try {
    const r = await fetch('/src/data/maps/route1.json');
    // Vite serves these; if not, user can import manually
    if (r.ok) {
      map = await r.json();
      render();
      outputEl.textContent = `Loaded ${map.name}`;
    } else {
      outputEl.textContent = 'route1.json non accessible en dev';
    }
  } catch (e) {
    outputEl.textContent = `Erreur: ${String(e)}`;
  }
});
clearBtn.addEventListener('click', () => {
  map = blankMap();
  render();
});

buildPalette();
render();
outputEl.textContent = '(clique "Exporter JSON" pour voir la sortie)';
