/**
 * dev-audit-tools.ts — devtools complémentaires pour audit + debug rapide.
 *
 * Side-effect import depuis `main.ts` → expose tout sur `window.dev.audit.*`.
 * Co-existe avec `engine-devtools.ts` (= window.dev.* base) sans le toucher.
 *
 * Pourquoi un fichier séparé : les helpers ici ne dépendent PAS du runtime
 * actif (= pas de `getRuntime()` requis), donc utilisables dès le boot de
 * n'importe quelle scene. Et ils servent surtout à mon (= Claude) workflow
 * d'audit 1:1 décomp : verify preload, dump game state, save findings.
 *
 * Usage console (= tape dans devtools console F12) :
 *
 *   dev.audit.help()              // liste tous les helpers
 *   dev.audit.state()             // résumé game state (= map, coords, flags, options, save)
 *   dev.audit.save()              // localStorage save slots raw
 *   dev.audit.assets(filter?)     // assetCache contents
 *   dev.audit.bag()               // contents bag par pocket
 *   dev.audit.party()             // playerParty détail
 *   dev.audit.flags(prefix?)      // FLAG_* set (= grep par prefix)
 *   dev.audit.vars(prefix?)       // VAR_* != 0
 *   dev.audit.tile(t, c, p)       // ASCII art du tile
 *   dev.audit.windowDump(id)      // pixel buffer du window
 *   dev.audit.dumpAll()           // snapshot complet → console.log + window.__lastDump
 *   dev.audit.fetchDecomp(path)   // récupère un fichier décomp via fetch
 *   dev.audit.compare(symbol)     // (async) compare symbol entre décomp et port
 *
 * Découle de la directive #1 "1:1 décomp ZÉRO hardcode" : pour vérifier
 * qu'on est 1:1, il faut pouvoir comparer les états vite. Avant ce devtool,
 * je perdais 5+ tool calls juste pour lire 3 fichiers et grep une valeur.
 */

import { GetSaveBlock1, GetSaveBlock2, GetSaveFileStatus, HasValidSave } from '../save/save-system';
import { GetPlayerFacingDirection } from '../field/player-avatar';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { assetCache, getRuntime } from '../system/decomp-globals';
import { gMapHeader } from '../field/map-loader';
import { bagContents } from '../bag/bag';
// Migration miroir : flags/vars sont id-indexés (number[]) → on énumère via les
// tables résolues nom→id + le bridge FlagGet/VarGet.
import { FlagGet, VarGet } from '../script/script-vars';
import * as FLAGS from '../../game/include/constants/flags';
import * as VARS from '../../game/include/constants/vars';

interface DevAudit {
  help: () => string;
  state: () => Record<string, unknown>;
  save: () => unknown;
  assets: (filter?: string) => Array<{ key: string; type: string; size: number }>;
  bag: () => Array<{ pocket: string; itemKey: string; quantity: number }>;
  party: () => Array<{ slot: number; species: string | undefined; level?: number; nick?: string }>;
  flags: (prefix?: string) => string[];
  vars: (prefix?: string) => Array<{ name: string; value: number }>;
  tile: (tileId: number, charBase?: number, paletteBank?: number) => string;
  windowDump: (windowId: number) => unknown;
  dumpAll: () => Record<string, unknown>;
  fetchDecomp: (path: string) => Promise<string>;
  compare: (symbol: string) => Promise<{ decomp: string[]; port: string[] }>;
  saveAuditReport: (name: string, content: string) => Promise<string>;
}

const audit: DevAudit = {
  help(): string {
    return [
      'dev.audit.* — helpers Claude pour audit + debug rapide',
      '  state()           : map / coords / flags count / options / save status',
      '  save()            : localStorage save slots (raw)',
      '  assets(filter?)   : assetCache (filter par substring du key)',
      '  bag()             : bag contents par pocket',
      '  party()           : playerParty détail',
      '  flags(prefix?)    : FLAG_* set (= grep par prefix)',
      '  vars(prefix?)     : VAR_* != 0',
      '  tile(t,c,p)       : ASCII art du tile (= charBase 0..3, paletteBank 0..15)',
      '  windowDump(id)    : pixel buffer + tilemap entries du window',
      '  dumpAll()         : snapshot complet (console + window.__lastDump)',
      '  fetchDecomp(path) : fetch décomp source (e.g. \'src/main_menu.c\')',
      '  compare(sym)      : grep symbol dans décomp et port simultané',
      '  saveAuditReport(name, content) : POST le rapport vers /__dev/audit-reports/<name>.md',
    ].join('\n');
  },

  state(): Record<string, unknown> {
    const sb1 = GetSaveBlock1();
    const sb2 = GetSaveBlock2();
    // Migration miroir : flags = bit-packé number[] → compte les bits set ;
    // vars = number[] → compte les non-zéro.
    const flags = (sb1.flags ?? []) as number[];
    const vars = (sb1.vars ?? []) as number[];
    const flagCount = flags.reduce((n, b) => { let c = 0, x = b & 0xFF; while (x) { c += x & 1; x >>= 1; } return n + c; }, 0);
    const varCount = vars.filter((v) => v !== 0).length;
    return {
      // Player position
      mapId: gMapHeader?.id ?? 'NONE',
      x: gSaveBlock1Ptr.pos.x,
      y: gSaveBlock1Ptr.pos.y,
      facing: GetPlayerFacingDirection(),
      // Identity
      playerName: sb2.playerName,
      gender: sb2.playerGender === 1 ? 'FEMALE' : 'MALE',
      trainerId: sb2.playerTrainerId,
      // Options
      options: {
        textSpeed: ['SLOW', 'MID', 'FAST'][sb2.optionsTextSpeed ?? 1],
        sound: sb2.optionsSound === 1 ? 'STEREO' : 'MONO',
        battleStyle: sb2.optionsBattleStyle === 1 ? 'SET' : 'SHIFT',
        battleSceneOff: !!sb2.optionsBattleSceneOff,
        buttonMode: sb2.optionsButtonMode,
        windowFrameType: sb2.optionsWindowFrameType,
      },
      // Save
      saveStatus: ['EMPTY', 'OK', 'CORRUPT', '?', 'NO_FLASH'][GetSaveFileStatus()] ?? `?(${GetSaveFileStatus()})`,
      hasValidSave: HasValidSave(),
      // Counts
      partySize: sb1.playerParty?.length ?? 0,
      bagItemCount: bagContents().length,
      flagsSet: flagCount,
      varsNonZero: varCount,
      // Game progress
      varLittlerootIntroState: VarGet('VAR_LITTLEROOT_INTRO_STATE'),
      varLittlerootTownState: VarGet('VAR_LITTLEROOT_TOWN_STATE'),
    };
  },

  save(): unknown {
    if (typeof localStorage === 'undefined') return null;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('em_save_v') && !key.startsWith('pokemon-web-demo:')) continue;
      const raw = localStorage.getItem(key);
      try {
        result[key] = raw ? JSON.parse(raw) : null;
      } catch {
        result[key] = raw;
      }
    }
    return result;
  },

  assets(filter?: string): Array<{ key: string; type: string; size: number }> {
    const out: Array<{ key: string; type: string; size: number }> = [];
    for (const [key, data] of assetCache.entries()) {
      if (filter && !key.toLowerCase().includes(filter.toLowerCase())) continue;
      const type = data instanceof Uint8Array ? 'u8'
        : data instanceof Uint16Array ? 'u16' : typeof data;
      const size = (data as { length?: number; byteLength?: number }).length ?? (data as { byteLength?: number }).byteLength ?? 0;
      out.push({ key, type, size });
    }
    return out.sort((a, b) => a.key.localeCompare(b.key));
  },

  bag(): Array<{ pocket: string; itemKey: string; quantity: number }> {
    return bagContents();
  },

  party(): Array<{ slot: number; species: string | undefined; level?: number; nick?: string }> {
    const sb1 = GetSaveBlock1();
    const party = (sb1.playerParty ?? []) as Array<{
      species?: string;
      speciesNameFr?: string;
      level?: number;
      nickname?: string;
    }>;
    return party.map((mon, i) => ({
      slot: i,
      species: mon.speciesNameFr ?? mon.species,
      level: mon.level,
      nick: mon.nickname,
    }));
  },

  flags(prefix?: string): string[] {
    // Migration miroir : énumère les FLAG_* SET via les noms résolus + FlagGet (id-indexé).
    const set = Object.keys(FLAGS)
      .filter((n) => n.startsWith('FLAG_') && FlagGet((FLAGS as unknown as Record<string, number>)[n]));
    return prefix ? set.filter((k) => k.includes(prefix)) : set;
  },

  vars(prefix?: string): Array<{ name: string; value: number }> {
    const out: Array<{ name: string; value: number }> = [];
    for (const name of Object.keys(VARS)) {
      if (!name.startsWith('VAR_')) continue;
      if (prefix && !name.includes(prefix)) continue;
      const value = VarGet(name);
      if (value === 0) continue;
      out.push({ name, value });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  },

  tile(tileId: number, charBase = 2, paletteBank = 14): string {
    const rt = getRuntime();
    if (!rt) return 'no runtime';
    const vram = rt.gba.vram;
    const baseByte = (charBase & 3) * 0x4000 + tileId * 32;
    if (baseByte + 32 > vram.length) return `out of bounds (byte 0x${baseByte.toString(16)})`;
    // Decode 4bpp tile
    const lines: string[] = [];
    lines.push(`tile #0x${tileId.toString(16)} @ charBase=${charBase} paletteBank=${paletteBank} byte=0x${baseByte.toString(16)}`);
    // Show hex
    const hexBytes: string[] = [];
    for (let i = 0; i < 32; i++) hexBytes.push(vram[baseByte + i].toString(16).padStart(2, '0'));
    lines.push('hex: ' + hexBytes.join(' '));
    // ASCII art (= each row 8 px, render via palette index 0-F as space-to-#)
    const palOff = paletteBank * 16;
    const chars = ' .:;~+=*xXM%#@';
    for (let row = 0; row < 8; row++) {
      let line = '';
      for (let col = 0; col < 4; col++) {
        const byte = vram[baseByte + row * 4 + col];
        const lo = byte & 0xF;
        const hi = (byte >> 4) & 0xF;
        // Interpret palette index — map to ASCII intensity heuristic
        line += chars[lo] ?? '?';
        line += chars[hi] ?? '?';
      }
      // Show palette index on each row tail
      const colorIdx = vram[baseByte + row * 4] & 0xF;
      const rgb15 = rt.gPlttBufferFaded.get(palOff + colorIdx);
      const r = (rgb15 & 0x1F) * 8;
      const g = ((rgb15 >> 5) & 0x1F) * 8;
      const b = ((rgb15 >> 10) & 0x1F) * 8;
      lines.push(line + `   row${row} idx0=${colorIdx} → rgb(${r},${g},${b})`);
    }
    return lines.join('\n');
  },

  windowDump(windowId: number): unknown {
    // Lecture via globalThis pour éviter une dep circulaire.
    const fn = (globalThis as { __dev_dumpWindow?: (id: number) => unknown }).__dev_dumpWindow;
    if (typeof fn === 'function') return fn(windowId);
    return { error: 'window dump not registered (= gba-window-system.ts must register __dev_dumpWindow)' };
  },

  dumpAll(): Record<string, unknown> {
    const dump = {
      timestamp: new Date().toISOString(),
      state: audit.state(),
      save: audit.save(),
      bag: audit.bag(),
      party: audit.party(),
      flagsCount: audit.flags().length,
      varsNonZero: audit.vars(),
      assets: audit.assets().slice(0, 50),  // top 50 par alphabétique
    };
    (window as unknown as { __lastDump?: unknown }).__lastDump = dump;
    console.log('[dev.audit.dumpAll] saved → window.__lastDump');
    console.log(dump);
    return dump;
  },

  async fetchDecomp(path: string): Promise<string> {
    // Le user doit avoir un dev server qui sert /__decomp/* depuis D:/Projet 1/decomps/pokeemeraude.
    // Fallback : essayer un path absolu via le file:// si servi.
    const url = path.startsWith('/') ? path : `/__decomp/${path}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`fetchDecomp(${path}) → ${resp.status}`);
    return resp.text();
  },

  async compare(symbol: string): Promise<{ decomp: string[]; port: string[] }> {
    // Best-effort : fetch grep results from dev server endpoints.
    // Si pas de dev server avec ces endpoints, retourne placeholder.
    try {
      const dResp = await fetch(`/__grep/decomp?q=${encodeURIComponent(symbol)}`);
      const pResp = await fetch(`/__grep/port?q=${encodeURIComponent(symbol)}`);
      const decomp = dResp.ok ? (await dResp.json() as string[]) : [];
      const port = pResp.ok ? (await pResp.json() as string[]) : [];
      return { decomp, port };
    } catch {
      console.warn('[dev.audit.compare] no /__grep/* endpoints — install Vite plugin for grep support');
      return { decomp: [], port: [] };
    }
  },

  async saveAuditReport(name: string, content: string): Promise<string> {
    // POST vers un endpoint dev qui écrit le rapport à `memory/audit-<name>.md`.
    // Si pas de endpoint, fallback localStorage.
    const sanitized = name.replace(/[^a-z0-9_-]/gi, '_');
    const date = new Date().toISOString().slice(0, 10);
    const filename = `audit-${date}-${sanitized}.md`;
    try {
      const resp = await fetch(`/__dev/audit-reports/${filename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/markdown' },
        body: content,
      });
      if (resp.ok) {
        console.log(`[dev.audit.saveAuditReport] saved → memory/${filename}`);
        return `memory/${filename}`;
      }
    } catch { /* fallthrough */ }
    // Fallback : localStorage
    const lsKey = `audit_report:${filename}`;
    localStorage.setItem(lsKey, content);
    console.log(`[dev.audit.saveAuditReport] no /__dev endpoint — saved → localStorage[${lsKey}]`);
    return `localStorage:${lsKey}`;
  },
};

// Install on window.dev.audit
if (typeof window !== 'undefined') {
  const w = window as unknown as { dev?: Record<string, unknown> };
  w.dev = w.dev ?? {};
  (w.dev as Record<string, unknown>).audit = audit;
  // Auto-print help à l'install — discrète, 1 ligne.
  console.log("[dev-audit-tools] window.dev.audit installed — try dev.audit.help() or dev.audit.state()");
}
