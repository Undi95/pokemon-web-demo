/**
 * Floating audio devtool panel.
 *
 * Top-right corner. 2 dropdowns (BGM / SE) + Play / Stop buttons.
 * Permet de tester rapidement n'importe quel song sans taper en console.
 *
 * BGM = mus_*  (joué sans loop pour tester)
 * SE  = se_* / ph_*  (one-shot natural)
 *
 * Activé seulement en dev (= !import.meta.env.PROD). Désactivable via
 * localStorage : `localStorage.setItem('audioDevtool', 'off')`.
 */
import { SONG_ID_TO_NAME } from '../engine/decomp-data/auto/src/song-table';
import { m4aSongNumStart, PlaySE, m4aMPlayAllStop } from '../engine/decomp-globals';

interface SongEntry { id: number; name: string; }

function buildSongLists(): { bgm: SongEntry[]; se: SongEntry[] } {
  const bgm: SongEntry[] = [];
  const se: SongEntry[] = [];
  for (const idStr in SONG_ID_TO_NAME) {
    const id = Number(idStr);
    const name = SONG_ID_TO_NAME[id];
    if (!name) continue;
    if (name.startsWith('mus_')) bgm.push({ id, name });
    else if (name.startsWith('se_') || name.startsWith('ph_')) se.push({ id, name });
  }
  bgm.sort((a, b) => a.name.localeCompare(b.name));
  se.sort((a, b) => a.name.localeCompare(b.name));
  return { bgm, se };
}

export function createAudioDevtool(): void {
  if (localStorage.getItem('audioDevtool') === 'off') return;
  if (document.getElementById('audio-devtool')) return; // already created

  const { bgm, se } = buildSongLists();

  const panel = document.createElement('div');
  panel.id = 'audio-devtool';
  // Positionné EN DESSOUS du jeu (= dans le flow du body, après le canvas Phaser)
  panel.style.cssText = `
    background: rgba(20, 20, 30, 0.92);
    color: #eee;
    font: 12px monospace;
    padding: 10px 12px;
    border-radius: 6px;
    margin: 12px auto;
    width: 480px;
    max-width: 95vw;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    user-select: none;
  `;

  // Header avec collapse toggle
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;cursor:pointer;font-weight:bold;';
  header.innerHTML = '<span>🎵 Audio devtool</span><span id="audio-devtool-toggle">−</span>';
  panel.appendChild(header);

  const body = document.createElement('div');
  body.id = 'audio-devtool-body';
  panel.appendChild(body);

  header.addEventListener('click', () => {
    const collapsed = body.style.display === 'none';
    body.style.display = collapsed ? '' : 'none';
    document.getElementById('audio-devtool-toggle')!.textContent = collapsed ? '−' : '+';
  });

  // ─── BGM section ────────────────────────────────────────────────────────
  const bgmSection = document.createElement('div');
  bgmSection.style.cssText = 'margin-bottom:8px;';
  bgmSection.innerHTML = `<div style="margin-bottom:3px;color:#8af;">BGM (no loop):</div>`;
  const bgmSelect = document.createElement('select');
  bgmSelect.style.cssText = 'width:100%;background:#222;color:#eee;border:1px solid #444;padding:2px;font:11px monospace;';
  for (const entry of bgm) {
    const opt = document.createElement('option');
    opt.value = String(entry.id);
    opt.textContent = `${entry.id}: ${entry.name}`;
    bgmSelect.appendChild(opt);
  }
  bgmSection.appendChild(bgmSelect);
  const bgmButtons = document.createElement('div');
  bgmButtons.style.cssText = 'display:flex;gap:4px;margin-top:4px;';
  const bgmPlayBtn = document.createElement('button');
  bgmPlayBtn.textContent = '▶ Play';
  bgmPlayBtn.style.cssText = 'flex:1;background:#2a5a8a;color:#fff;border:none;padding:4px;cursor:pointer;font:11px monospace;';
  const bgmStopBtn = document.createElement('button');
  bgmStopBtn.textContent = '⏹ Stop all';
  bgmStopBtn.style.cssText = 'flex:1;background:#5a2a2a;color:#fff;border:none;padding:4px;cursor:pointer;font:11px monospace;';
  bgmButtons.appendChild(bgmPlayBtn);
  bgmButtons.appendChild(bgmStopBtn);
  bgmSection.appendChild(bgmButtons);
  body.appendChild(bgmSection);

  bgmPlayBtn.addEventListener('click', () => {
    const id = Number(bgmSelect.value);
    if (Number.isFinite(id)) {
      // Stop d'abord pour éviter overlap
      m4aMPlayAllStop();
      m4aSongNumStart(id);
    }
  });
  bgmStopBtn.addEventListener('click', () => {
    m4aMPlayAllStop();
  });

  // ─── SE section ─────────────────────────────────────────────────────────
  const seSection = document.createElement('div');
  seSection.innerHTML = `<div style="margin-bottom:3px;color:#fa8;">SE (one-shot):</div>`;
  const seSelect = document.createElement('select');
  seSelect.style.cssText = 'width:100%;background:#222;color:#eee;border:1px solid #444;padding:2px;font:11px monospace;';
  for (const entry of se) {
    const opt = document.createElement('option');
    opt.value = String(entry.id);
    opt.textContent = `${entry.id}: ${entry.name}`;
    seSelect.appendChild(opt);
  }
  seSection.appendChild(seSelect);
  const sePlayBtn = document.createElement('button');
  sePlayBtn.textContent = '▶ Play SE';
  sePlayBtn.style.cssText = 'width:100%;margin-top:4px;background:#8a5a2a;color:#fff;border:none;padding:4px;cursor:pointer;font:11px monospace;';
  seSection.appendChild(sePlayBtn);
  body.appendChild(seSection);

  sePlayBtn.addEventListener('click', () => {
    const id = Number(seSelect.value);
    if (Number.isFinite(id)) PlaySE(id);
  });

  // Footer hint
  const hint = document.createElement('div');
  hint.style.cssText = 'margin-top:6px;font-size:9px;color:#888;';
  hint.textContent = `${bgm.length} BGM, ${se.length} SE — click header to collapse`;
  body.appendChild(hint);

  document.body.appendChild(panel);
}
