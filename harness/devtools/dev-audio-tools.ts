/**
 * dev-audio-tools.ts — diagnostic LIVE du moteur son m4a NATIF (devtools v2).
 *
 * Né du debug « plus de son » (2026-07-11) : quand le son lâche chez le user,
 * la cause est INVISIBLE sans outillage (ctx suspendu ? arbitre muté ? worklet
 * mort ? horloge de secours ?). Ce module affiche TOUT en temps réel dans la
 * sidebar F2 (catégorie Audio) et fournit le bouton de sauvetage 🚑.
 *
 * Console (parité dev.cmd) : dev.cmd('audio.unmute') · dev.cmd('audio.status')
 * · dev.cmd('audio.test') · dev.cmd('audio.psgGain', {v: 16}) · __m4aLog().
 */
import { registerCommands, registerView } from './registry';
import { getAudioDebugState } from '../m4a/audio-context';
import { forceClaimFocus, forceMute, isArbiterMuted } from '../m4a/audio-arbiter';
import { getAudioLog } from '../m4a/audio-log';
import { gMPlayInfo_BGM, gMPlayInfo_SE1, gMPlayInfo_SE2, gMPlayInfo_SE3 } from '../../src/m4a';
import { M4A_NATIVE } from '../m4a/native';

interface M4aStats {
  wr: number; rd: number; underruns: number;
  psgEnergy: number; dsEnergy: number; triggers: number;
}

interface NativeState { node: AudioWorkletNode | null; fallbackDriving: boolean }

function nativeState(): NativeState | null {
  return ((globalThis as Record<string, unknown>).__m4aNativeState as NativeState) ?? null;
}

function lastStats(): M4aStats | null {
  return ((globalThis as Record<string, unknown>).__m4aStats as M4aStats) ?? null;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function playerLine(name: string, p: { status: number; songHeader: number }): string {
  const st = p.status >>> 0;
  const active = (st & 0xffff) !== 0 && !(st & 0x80000000);
  const paused = (st & 0x80000000) !== 0;
  const badge = active ? '▶' : paused ? '⏸' : '—';
  return `${name} ${badge} st=0x${st.toString(16)}${p.songHeader ? ` sh=0x${(p.songHeader >>> 0).toString(16)}` : ''}`;
}

/** Dump complet (retourné par audio.status — copiable pour Claude). */
function audioStatus(): Record<string, unknown> {
  const dbg = getAudioDebugState();
  const ns = nativeState();
  const s = lastStats();
  return {
    mode: M4A_NATIVE ? 'natif' : 'legacy (?m4a-legacy)',
    ctx: dbg.ctxState,
    sampleRate: dbg.sampleRate,
    arbitre: isArbiterMuted() ? 'MUET' : 'sonore',
    arbiterGain: +dbg.arbiterGain.toFixed(3),
    masterVolume: dbg.masterVolume,
    worklet: ns?.node ? 'monté' : 'absent',
    horloge: ns?.fallbackDriving ? 'SECOURS (audio off)' : 'audio-drive',
    ring: s ? { level: s.wr - s.rd, underruns: s.underruns } : null,
    energies: s ? { psg: Math.round(s.psgEnergy), ds: Math.round(s.dsEnergy) } : null,
    players: {
      bgm: { st: (gMPlayInfo_BGM.status >>> 0).toString(16), sh: (gMPlayInfo_BGM.songHeader >>> 0).toString(16) },
      se1: { st: (gMPlayInfo_SE1.status >>> 0).toString(16) },
      se2: { st: (gMPlayInfo_SE2.status >>> 0).toString(16) },
      se3: { st: (gMPlayInfo_SE3.status >>> 0).toString(16) },
    },
    journal: getAudioLog().slice(-12).map((e) => `${e.wall} ${e.event}${e.detail ? ` — ${e.detail}` : ''}`),
  };
}

export function registerNativeAudioDevtools(): void {
  registerView({
    id: 'audio.native',
    category: 'audio',
    label: '🎛 Moteur natif (live)',
    description: 'État complet de la chaîne son : contexte, arbitre, worklet, players, journal.',
    mount: () => { /* rendu entier dans update */ },
    update: (el) => {
      const dbg = getAudioDebugState();
      const ns = nativeState();
      const s = lastStats();
      ns?.node?.port.postMessage({ t: 'stats' }); // rafraîchit pour le prochain tick

      const muted = isArbiterMuted();
      const ctxBad = dbg.ctxState !== 'running';
      const rows: string[] = [];
      rows.push(`<div class="dv2-kv">CTX <b style="color:${ctxBad ? '#f66' : '#6f6'}">${esc(dbg.ctxState)}</b>`
        + ` · ${dbg.sampleRate || '—'} Hz · worklet ${ns?.node ? '✓' : '<b style="color:#f66">absent</b>'}`
        + ` · horloge ${ns?.fallbackDriving ? '<b style="color:#fa0">SECOURS</b>' : 'audio'}</div>`);
      rows.push(`<div class="dv2-kv">Arbitre <b style="color:${muted ? '#f66' : '#6f6'}">${muted ? 'MUET' : 'sonore'}</b>`
        + ` · gain=${dbg.arbiterGain.toFixed(2)} · volume=${dbg.masterVolume.toFixed(2)}</div>`);
      if (s) {
        rows.push(`<div class="dv2-kv">Ring ${s.wr - s.rd}/64 · underruns=${s.underruns}`
          + ` · E psg=${Math.round(s.psgEnergy / 1000)}k ds=${Math.round(s.dsEnergy / 1000)}k</div>`);
      }
      rows.push(`<div class="dv2-kv dv2-dim">${esc(playerLine('BGM', gMPlayInfo_BGM))} · ${esc(playerLine('SE1', gMPlayInfo_SE1))}`
        + ` · ${esc(playerLine('SE2', gMPlayInfo_SE2))} · ${esc(playerLine('SE3', gMPlayInfo_SE3))}</div>`);
      const log = getAudioLog().slice(-8);
      rows.push(`<div class="dv2-kv dv2-dim" style="white-space:pre-line">${log.length
        ? log.map((e) => esc(`${e.wall.slice(3)} ${e.event}${e.detail ? ` — ${e.detail}` : ''}`)).join('\n')
        : '(journal vide)'}</div>`);
      el.innerHTML = rows.join('');
    },
  });

  registerCommands([
    {
      id: 'audio.unmute',
      category: 'audio',
      label: '🚑 Remettre le son (unmute + resume)',
      description: 'Sauvetage : démute l\'arbitre, reprend le focus audio et résume le contexte.',
      run: async () => {
        forceClaimFocus();
        const ns = nativeState();
        const ctx = ns?.node?.context as AudioContext | undefined;
        if (ctx && ctx.state === 'suspended') {
          try { await ctx.resume(); } catch { /* pend sans geste — le prochain clic prendra */ }
        }
        return audioStatus();
      },
    },
    {
      id: 'audio.status',
      category: 'audio',
      label: '📋 État complet (dump)',
      description: 'Dump JSON de toute la chaîne son + journal — à copier pour Claude.',
      run: () => audioStatus(),
    },
    {
      id: 'audio.mute',
      category: 'audio',
      label: '🔇 Couper cette instance',
      description: 'Coupe l\'étage de sortie de CETTE instance (l\'arbitre multi-instance).',
      run: () => { forceMute(); return audioStatus(); },
    },
    {
      id: 'audio.test',
      category: 'audio',
      label: '🎧 Test d\'écoute guidé (20 s)',
      description: 'Joue chaque famille de sons espacée : title, blast PSG, bip, cri, fanfare.',
      run: () => {
        const t = (globalThis as { __m4aTest?: () => void }).__m4aTest;
        if (!t) return 'moteur natif absent';
        t();
        return 'séquence lancée — regarde la console pour les étapes';
      },
    },
    {
      id: 'audio.psgGain',
      category: 'audio',
      label: '🎚 Gain PSG (défaut 16)',
      description: 'Niveau des canaux Game Boy (square/wave/noise). GBATEK strict=4, défaut=16.',
      args: [{ name: 'v', kind: 'number', label: 'gain', default: 16 }],
      run: (args) => {
        const v = Number(args.v ?? 16);
        const ns = nativeState();
        ns?.node?.port.postMessage({ t: 'psgGain', v });
        return `PSG_GAIN = ${v}`;
      },
    },
  ]);
}
