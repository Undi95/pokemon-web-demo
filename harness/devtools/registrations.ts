/**
 * DEVTOOLS V2 — enregistrement de TOUT l'outillage existant au registre.
 *
 * Point unique de parité : chaque entrée ici = 1 commande console (dev.cmd) + 1
 * contrôle sidebar (panel-v2). Les handlers DÉLÈGUENT aux implémentations
 * historiques (window.cheat, __byteVm, dev.gfx, dev.battle, __devGotoMap,
 * window.rng, scope…) — lues sur globalThis au moment du CLIC (elles se posent à
 * des moments différents du boot ; jamais capturées à l'import).
 *
 * Migré depuis : devtools-panel.ts v1 (archivé) — téléport, cheats, scénarios
 * combat, rencontres event, easy chat, palettes, OAM, BG/blend, battle state,
 * audio monitor, studio (film/log textes/transitions) — et
 * harness/util/audio-devtool.ts (picker BGM/SE, absorbé en catégorie Audio).
 */
import {
  registerCommands, registerView, type DevArgOption,
} from './registry';
import type { DecompRuntime } from '../runtime/decomp-runtime';
import { MAX_SPRITES } from '../runtime/decomp-runtime';
import { getRuntime, m4aSongNumStart, PlaySE, m4aMPlayAllStop } from '../runtime/decomp-globals';
import { m4aMPlayStop, m4aMPlayContinue, gMPlayInfo_BGM } from '../../src/m4a';
import { setMasterVolume } from '../m4a/audio-context';
import { SONG_ID_TO_NAME } from '../../src/engine/decomp-data/src/song-table';
// Enum 1:1 des transitions de combat (include leaf, import statique sans risque de cycle).
import { ENUM_B_1 } from '../../include/battle_transition';
import {
  tpToRandomFeebasTile, tpToAlteringCave, cycleAlteringCaveTable,
  getAlteringCaveTable, alteringCaveLabel, loadAlteringCaveSpecies,
} from './dev-encounter-tools';
import { registerNativeAudioDevtools } from './dev-audio-tools';

// ─── Accès runtime + helpers (repris du panel v1) ─────────────────────────────

type GlobalProbe = {
  __rt?: DecompRuntime;
  __devNoclip?: boolean;
  __devGotoMap?: (mapId: string, x: number, y: number) => void;
  __testMoveAnim?: (moveId: string | number) => void;
  __forcedBattleTransition?: number;
  __uiTextLogEnabled?: boolean;
  __uiTextLog?: Array<{ at: number; t: string }>;
  __PlaySE?: ((id: number) => void) & { __dv2Wrapped?: boolean };
  __decompGlobals?: { IsSEPlaying?: () => boolean; IsCryPlaying?: () => boolean };
  __decompBattleLoop?: {
    harnessSetupParties?: (...a: unknown[]) => Promise<boolean>;
    bootDecompBattleLoop?: (returnToOverworld?: boolean) => void;
    harnessBootRivalBattle1?: () => Promise<void>;
    getRecentOpcodes?: () => unknown;
  };
  __battleAnimInterpreter?: { getAttacker?: () => number; getTarget?: () => number };
  __gObjectEvents?: Array<{ currentCoordsX?: number; currentCoordsY?: number } | undefined>;
  gSaveBlock1Ptr?: { pos: { x: number; y: number }; location?: { mapGroup?: number; mapNum?: number } };
  gMapHeader?: { regionMapSectionId?: number; mapLayoutId?: number };
  cheat?: Record<string, (...a: unknown[]) => unknown>;
  rng?: { value?: () => number; value2?: () => number; count?: () => number; SeedRng?: (s: number) => void };
  scope?: { flags?: () => unknown };
  dev?: Record<string, unknown>;
  __byteVm?: Record<string, ((...a: never[]) => unknown) | undefined>;
};

function g(): GlobalProbe { return globalThis as unknown as GlobalProbe; }

function rt(): DecompRuntime | undefined {
  const gg = g();
  if (gg.__rt) return gg.__rt;
  try { return getRuntime(); } catch { return undefined; }
}

function hex(n: number, pad = 2): string {
  return (n < 0 ? (n >>> 0) : n).toString(16).toUpperCase().padStart(pad, '0');
}
function rgb15FromRgba(r: number, gc: number, b: number): number {
  return ((r >> 3) & 0x1F) | (((gc >> 3) & 0x1F) << 5) | (((b >> 3) & 0x1F) << 10);
}
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Délégation défensive : la fonction cible peut ne pas encore être posée (boot). */
function requireFn<T>(v: T | undefined, what: string): T {
  if (!v) throw new Error(`${what} indisponible (jeu pas encore booté ?)`);
  return v;
}

/** '288' → 288, 'SPECIES_ZIGZAGOON' → tel quel (les cibles acceptent les deux). */
function numOrString(v: unknown): number | string {
  const s = String(v).trim();
  return /^\d+$/.test(s) ? parseInt(s, 10) : s;
}

const dvGfx = (): Record<string, (...a: never[]) => unknown> =>
  ((g().dev as { gfx?: Record<string, (...a: never[]) => unknown> } | undefined)?.gfx) ?? {};

// ─── Données v1 reprises telles quelles ───────────────────────────────────────

// Villes à Pokémon Center — coords = porte du PC (cf. panel v1 : extraites des
// map.json décomp via scripts/extract-pc-warps.py), spawn 1 tuile au SUD.
// Noms FR OFFICIELS verbatim map-names-fr.json (⚠️ Dewford=MYOKARA, Slateport=
// POIVRESSEL, Mauville=LAVANDIA, Fortree=CIMETRONELLE, Mossdeep=ALGATIA).
const TELEPORT_TOWNS: ReadonlyArray<{ name: string; id: string; pcx: number; pcy: number }> = [
  { name: 'ROSYERES',        id: 'MAP_OLDALE_TOWN',     pcx: 6,  pcy: 16 },
  { name: 'CLEMENTI-VILLE',  id: 'MAP_PETALBURG_CITY',  pcx: 20, pcy: 16 },
  { name: 'MEROUVILLE',      id: 'MAP_RUSTBORO_CITY',   pcx: 16, pcy: 38 },
  { name: 'VILLAGE MYOKARA', id: 'MAP_DEWFORD_TOWN',    pcx: 2,  pcy: 10 },
  { name: 'POIVRESSEL',      id: 'MAP_SLATEPORT_CITY',  pcx: 19, pcy: 19 },
  { name: 'LAVANDIA',        id: 'MAP_MAUVILLE_CITY',   pcx: 22, pcy: 5  },
  { name: 'VERGAZON',        id: 'MAP_VERDANTURF_TOWN', pcx: 16, pcy: 3  },
  { name: 'AUTEQUIA',        id: 'MAP_FALLARBOR_TOWN',  pcx: 14, pcy: 7  },
  { name: 'VERMILAVA',       id: 'MAP_LAVARIDGE_TOWN',  pcx: 9,  pcy: 6  },
  { name: 'CIMETRONELLE',    id: 'MAP_FORTREE_CITY',    pcx: 5,  pcy: 6  },
  { name: 'NENUCRIQUE',      id: 'MAP_LILYCOVE_CITY',   pcx: 24, pcy: 14 },
  { name: 'ALGATIA',         id: 'MAP_MOSSDEEP_CITY',   pcx: 28, pcy: 16 },
  { name: 'ATALANOPOLIS',    id: 'MAP_SOOTOPOLIS_CITY', pcx: 43, pcy: 31 },
  { name: 'PACIFIVILLE',     id: 'MAP_PACIFIDLOG_TOWN', pcx: 8,  pcy: 15 },
  { name: 'ETERNARA',        id: 'MAP_EVER_GRANDE_CITY',pcx: 27, pcy: 48 },
];

// Tous les types d'écran Easy Chat (EASY_CHAT_TYPE_*, include/constants/easy_chat.h).
const EASY_CHAT_TYPES: ReadonlyArray<{ t: number; label: string }> = [
  { t: 0,  label: 'Profil' },        { t: 1,  label: 'Début combat' },
  { t: 2,  label: 'Victoire' },      { t: 3,  label: 'Défaite' },
  { t: 4,  label: 'Lettre' },        { t: 5,  label: 'Interview' },
  { t: 6,  label: 'Chant barde' },   { t: 7,  label: 'Fan club' },
  { t: 8,  label: 'TV (dummy)' },    { t: 9,  label: 'Mot tendance' },
  { t: 10, label: 'Gabby & Ty' },    { t: 11, label: 'Interview concours' },
  { t: 12, label: 'Tour combat' },   { t: 13, label: 'Bon mot' },
  { t: 14, label: 'Question fan' },  { t: 15, label: 'Quiz réponse' },
  { t: 16, label: 'Quiz question' }, { t: 17, label: 'Quiz déf. question' },
  { t: 18, label: 'Quiz déf. réponse' }, { t: 19, label: 'Apprenti' },
  { t: 20, label: 'Questionnaire' },
];

// ─── Autoboot scénarios combat (repris v1 : refresh PUIS boot) ────────────────
// ⚠️ Host unifié (50ad420a) : un reload nu rejoue l'intro + écran titre → sans
// appuis touches l'overworld n'arrive JAMAIS, et les proxies « ready » du v1
// (playerX number, __decompBattleLoop présent) sont déjà vraies PENDANT l'intro
// → le combat bootait par-dessus l'intro et se faisait écraser par ses
// SetMainCallback2 (bug user 2026-07-10). Le scénario recharge donc en
// `?nointro` (resume direct de la save ; boot-mode verrouille la SRAM = la
// vraie save est protégée de la party de test) et le poll attend le VRAI
// overworld : gMain.callback2 = MainCB2_Overworld (TestOverworldScene.ts:617 ;
// préfixe, car le bundler peut suffixer le nom : « MainCB2_Overworld2 »).

const AUTOBOOT_KEY = '__dvtAutoboot';

function queueAutoboot(type: 'wild' | 'rival'): void {
  const url = new URL(window.location.href);
  const keep = url.searchParams.has('nointro'); // déjà en ?nointro → URL du user inchangée
  try { sessionStorage.setItem(AUTOBOOT_KEY, JSON.stringify({ t: type, keep })); } catch { /* défensif */ }
  if (keep) { window.location.reload(); return; }
  url.searchParams.append('nointro', '1');
  window.location.href = url.toString();
}

function resumeAutobootIfPending(): void {
  let raw: string | null = null;
  try { raw = sessionStorage.getItem(AUTOBOOT_KEY); } catch { return; }
  if (!raw) return;
  try { sessionStorage.removeItem(AUTOBOOT_KEY); } catch { /* défensif */ }
  let type = ''; let keep = true;
  try {
    const j = JSON.parse(raw) as { t?: string; keep?: boolean };
    type = j.t ?? ''; keep = !!j.keep;
  } catch { type = raw; } // legacy : valeur nue 'wild'/'rival' d'un onglet pré-fix
  if (type !== 'wild' && type !== 'rival') return;
  let tries = 0;
  const poll = window.setInterval(() => {
    tries++;
    const r = rt();
    const dl = g().__decompBattleLoop;
    const player = g().__gObjectEvents?.[0];
    const cb2 = (r?.gMain as unknown as { callback2?: { name?: string } } | undefined)
      ?.callback2?.name ?? '';
    const ready = !!r && !!dl?.harnessSetupParties && !!dl.bootDecompBattleLoop
      && cb2.startsWith('MainCB2_Overworld')
      && !(r!.gMain as unknown as { inBattle?: boolean }).inBattle
      && typeof player?.currentCoordsX === 'number';
    if (ready) {
      window.clearInterval(poll);
      if (!keep) {
        // Rendre son URL au user : le prochain F5 manuel repart sur le boot officiel.
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('nointro');
          window.history.replaceState(null, '', url.toString());
        } catch { /* défensif */ }
      }
      bootScenario(type as 'wild' | 'rival');
    } else if (tries > 120) { // ~30 s (boot ?nointro à froid)
      window.clearInterval(poll);
      console.warn('[devtools v2] autoboot abandonné : overworld pas prêt');
    }
  }, 250);
}

function syncPlayerPosBeforeBoot(): void {
  const gg = g();
  const sb1 = gg.gSaveBlock1Ptr;
  const player = gg.__gObjectEvents?.[0];
  if (sb1 && player && typeof player.currentCoordsX === 'number' && typeof player.currentCoordsY === 'number') {
    sb1.pos.x = player.currentCoordsX - 7; // MAP_OFFSET
    sb1.pos.y = player.currentCoordsY - 7;
  }
}

function bootScenario(type: 'wild' | 'rival'): void {
  const r = rt();
  if (r && (r.gMain as unknown as { inBattle?: boolean }).inBattle) {
    console.warn('[devtools v2] déjà en combat — boot ignoré'); return;
  }
  const dl = g().__decompBattleLoop;
  if (!dl) { console.warn('[devtools v2] __decompBattleLoop indisponible'); return; }
  syncPlayerPosBeforeBoot();
  if (type === 'rival') {
    dl.harnessBootRivalBattle1?.().catch((e) => console.error('[devtools v2] rival', e));
    return;
  }
  dl.harnessSetupParties?.(
    'SPECIES_TREECKO', 5, 'SPECIES_POOCHYENA', 5,
    { moves: ['MOVE_POUND', 'MOVE_LEER'] }, { moves: ['MOVE_TACKLE'] },
  ).then(() => dl.bootDecompBattleLoop?.(true))
    .catch((e) => console.error('[devtools v2] wild', e));
}

// ─── JEU ──────────────────────────────────────────────────────────────────────

function registerJeu(): void {
  registerView({
    id: 'jeu.position', category: 'jeu', label: '📍 Position',
    description: 'Map + coords joueur (logiques et brutes)',
    mount: () => { /* update-only */ },
    update: (el) => {
      const gg = g();
      const sb1 = gg.gSaveBlock1Ptr;
      const player = gg.__gObjectEvents?.[0];
      if (!sb1) { el.innerHTML = '<div class="dv2-dim">save pas chargée</div>'; return; }
      // gMapHeader.id = map RÉELLEMENT chargée (sb1.location n'est pas tenu à
      // jour par le TP dev) ; MAPSEC en dim pour le nom région.
      const hdr = gg.gMapHeader as { id?: string; regionMapSectionId?: string } | undefined;
      const raw = player && typeof player.currentCoordsX === 'number'
        ? ` · obj(${player.currentCoordsX},${player.currentCoordsY}) <span class="dv2-dim">= logique+7</span>` : '';
      el.innerHTML = `<div class="dv2-kv"><b>${hdr?.id ?? '?'}</b>`
        + `${hdr?.regionMapSectionId ? ` <span class="dv2-dim">${hdr.regionMapSectionId}</span>` : ''}</div>`
        + `<div class="dv2-kv">pos <b>${sb1.pos.x},${sb1.pos.y}</b>${raw}</div>`;
    },
  });

  registerCommands([
    {
      id: 'jeu.tp', category: 'jeu', label: '🗺 Téléport (devant les PC)', ui: 'grid',
      description: 'TP devant le Pokémon Center de la ville (spawn 1 tuile au sud de la porte)',
      args: [{
        name: 'ville', kind: 'select',
        options: TELEPORT_TOWNS.map((t) => ({ value: t.id, label: t.name })),
      }],
      run: ({ ville }) => {
        const t = TELEPORT_TOWNS.find((x) => x.id === ville);
        if (!t) throw new Error(`ville inconnue '${String(ville)}'`);
        requireFn(g().__devGotoMap, '__devGotoMap')(t.id, t.pcx, t.pcy + 1);
        return `TP → ${t.name} (${t.id})`;
      },
    },
    {
      id: 'jeu.debugmap1', category: 'jeu', label: '🕳️ Debug_1 grotte (CS)', ui: 'grid',
      description: 'TP map de test CS : Flash/Surf/Pêche/Cascade/Plongée/Coupe/Force/Éclate-Roc/Doux Parfum/Cherch\'Objet',
      run: () => String((g().dev as { debugMap?: (n: number) => string } | undefined)?.debugMap?.(1) ?? 'dev.debugMap absent'),
    },
    {
      id: 'jeu.debugmap2', category: 'jeu', label: '🏠 Debug_2 PC', ui: 'grid',
      description: 'TP map de test : Centre/PC',
      run: () => String((g().dev as { debugMap?: (n: number) => string } | undefined)?.debugMap?.(2) ?? 'dev.debugMap absent'),
    },
    {
      id: 'jeu.debugmap3', category: 'jeu', label: '🌊 Debug_3 fond marin', ui: 'grid',
      description: 'TP map de test : fond sous-marin (remontée par le trou central)',
      run: () => String((g().dev as { debugMap?: (n: number) => string } | undefined)?.debugMap?.(3) ?? 'dev.debugMap absent'),
    },
    {
      id: 'jeu.goto', category: 'jeu', label: '🎯 Goto map',
      description: 'TP arbitraire — __devGotoMap(map, x, y) ; la case doit être WALKABLE',
      args: [
        { name: 'map', kind: 'string', placeholder: 'MAP_LITTLEROOT_TOWN' },
        { name: 'x', kind: 'number', placeholder: 'x' },
        { name: 'y', kind: 'number', placeholder: 'y' },
      ],
      run: ({ map, x, y }) => {
        requireFn(g().__devGotoMap, '__devGotoMap')(String(map), Number(x), Number(y));
        return `TP → ${String(map)} (${String(x)},${String(y)})`;
      },
    },
    {
      id: 'jeu.noclip', category: 'jeu', label: '👻 Noclip (toggle)',
      description: 'Traverse les collisions (flag __devNoclip)',
      run: () => {
        const gg = g();
        gg.__devNoclip = !gg.__devNoclip;
        return `noclip ${gg.__devNoclip ? 'ON' : 'OFF'}`;
      },
    },
    {
      id: 'jeu.feebas', category: 'jeu', label: '🐟 TP spot Barpau',
      description: 'Route 119 + TP devant une tuile Barpau du jour (noclip conseillé pour l\'eau)',
      run: async () => (await tpToRandomFeebasTile()).msg,
    },
    {
      id: 'jeu.altcave', category: 'jeu', label: '🦇 TP Altering Cave',
      description: 'TP dans l\'Altering Cave',
      run: () => { tpToAlteringCave(); return 'TP → Altering Cave'; },
    },
    {
      id: 'jeu.altcycle', category: 'jeu', label: '🔄 Altering Cave : table suivante',
      description: 'Cycle la table de spawn 0..8 (1:1 VAR_ALTERING_CAVE_WILD_SET)',
      run: async () => {
        await loadAlteringCaveSpecies();
        const t = cycleAlteringCaveTable();
        return `Altering Cave → table ${alteringCaveLabel(t)} (actuelle : ${alteringCaveLabel(getAlteringCaveTable())})`;
      },
    },
    {
      id: 'jeu.refresh', category: 'jeu', label: '⟳ Recharger la page',
      run: () => { window.location.reload(); },
    },
    {
      // Remplace CTRL+ALT+R : vide TOUTES les Cache API (decomp-net + packs, toutes versions)
      // puis recharge. À utiliser quand le cache d'assets sert de vieux octets après régé.
      id: 'jeu.cacherefresh', category: 'jeu', label: '🗑 Vide cache + recharger',
      run: async () => {
        const dn = (window as unknown as { __decompNet?: { clear?: () => Promise<unknown> } }).__decompNet;
        try { if (dn?.clear) await dn.clear(); } catch { /* noop */ }
        if ('caches' in window) {
          try { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); } catch { /* noop */ }
        }
        window.location.reload();
      },
    },
  ]);
}

// ─── JOUEUR (cheats — window.cheat, dev-cheat.ts) ─────────────────────────────

function registerJoueur(): void {
  const cheat = (name: string) => (...a: unknown[]): unknown => {
    const c = requireFn(g().cheat, 'window.cheat');
    return requireFn(c[name], `cheat.${name}`)(...a);
  };
  registerCommands([
    {
      id: 'joueur.heal', category: 'joueur', label: '💊 Soigner l\'équipe',
      description: 'PV + PP + statuts de toute l\'équipe',
      run: () => { cheat('heal')(); return 'équipe soignée'; },
    },
    {
      id: 'joueur.money', category: 'joueur', label: '💰 Donner de l\'argent',
      description: '+N ₽ (cap 1:1 à 999 999)',
      args: [{ name: 'montant', kind: 'number', default: 10000 }],
      run: ({ montant }) => { cheat('money')(Number(montant)); return `+${Number(montant)}₽`; },
    },
    {
      id: 'joueur.natdex', category: 'joueur', label: '📕 Dex National',
      description: 'EnableNationalPokedex 1:1 (magic + var + flag) — rouvrir le dex',
      run: () => { cheat('nationalDex')(); return 'Dex National activé'; },
    },
    {
      id: 'joueur.skipintro', category: 'joueur', label: '⏩ Skip intro',
      description: 'Pose les flags/vars de début d\'aventure + save',
      run: () => { cheat('skipIntro')(); return 'intro skippée + save'; },
    },
  ]);
}

// ─── COMBAT ───────────────────────────────────────────────────────────────────

function registerCombat(): void {
  registerView({
    id: 'combat.state', category: 'combat', label: '⚔ État combat',
    mount: () => { /* update-only */ },
    update: (el) => {
      const r = rt();
      if (!r) { el.innerHTML = '<div class="dv2-dim">runtime indisponible</div>'; return; }
      const inB = !!(r.gMain as unknown as { inBattle?: boolean }).inBattle;
      const cb2 = (r.gMain as unknown as { callback2?: { name?: string } }).callback2?.name ?? '—';
      const lines = [`<div class="dv2-kv">inBattle=<b>${inB}</b> · CB2=<b>${esc(cb2)}</b></div>`];
      const ai = g().__battleAnimInterpreter;
      if (ai?.getAttacker || ai?.getTarget) {
        lines.push(`<div class="dv2-kv">anim atk=${ai.getAttacker?.() ?? '—'} tgt=${ai.getTarget?.() ?? '—'}</div>`);
      }
      const forced = g().__forcedBattleTransition;
      if (forced !== undefined) lines.push(`<div class="dv2-kv">transition forcée=<b>${forced}</b></div>`);
      try {
        const ops = g().__decompBattleLoop?.getRecentOpcodes?.();
        if (ops != null) {
          const txt = Array.isArray(ops) ? ops.slice(-8).map(String).join(' ') : String(ops);
          lines.push(`<div class="dv2-kv dv2-dim">opcodes: ${esc(txt).slice(0, 200)}</div>`);
        }
      } catch { /* défensif */ }
      el.innerHTML = lines.join('');
    },
  });

  const transitions: DevArgOption[] = [
    { value: -1, label: '— transition normale —' },
    ...Object.entries(ENUM_B_1)
      .filter(([k]) => k.startsWith('B_TRANSITION_') && !k.endsWith('_COUNT'))
      .sort((a, b) => a[1] - b[1])
      .map(([k, v]) => ({ value: v, label: `${v} ${k.replace('B_TRANSITION_', '')}` })),
  ];

  registerCommands([
    {
      id: 'combat.wild', category: 'combat', label: '🌿 Combat sauvage (direct)',
      description: 'dev.battle.startWild(species, lvl) — depuis l\'overworld',
      args: [
        { name: 'species', kind: 'string', placeholder: '288 ou SPECIES_…', default: '288' },
        { name: 'lvl', kind: 'number', default: 5 },
      ],
      run: ({ species, lvl }) => {
        const battle = (g().dev as { battle?: { startWild?: (sp: number | string, l: number) => unknown } } | undefined)?.battle;
        requireFn(battle?.startWild, 'dev.battle.startWild')(numOrString(species), Number(lvl));
        return `combat sauvage ${String(species)} lv${Number(lvl)}`;
      },
    },
    {
      id: 'combat.tb', category: 'combat', label: '🥊 Combat dresseur (id)',
      description: '__byteVm.load() puis launchTB(id) — ex. 333 (May), 114 (Roxanne)',
      args: [{ name: 'id', kind: 'number', placeholder: '333' }],
      run: async ({ id }) => {
        const bv = requireFn(g().__byteVm, '__byteVm');
        await (bv.load as (() => Promise<unknown>) | undefined)?.();
        requireFn(bv.launchTB, '__byteVm.launchTB')(Number(id) as never);
        return `trainer battle #${Number(id)}`;
      },
    },
    {
      id: 'combat.scnWild', category: 'combat', label: '🌿 Scénario : refresh + sauvage',
      description: 'Recharge la page PUIS boote Treecko vs Poochyena (état propre)',
      run: () => { queueAutoboot('wild'); },
    },
    {
      id: 'combat.scnRival', category: 'combat', label: '🧑 Scénario : refresh + rival #1',
      description: 'Recharge la page PUIS boote le combat rival 1',
      run: () => { queueAutoboot('rival'); },
    },
    {
      id: 'combat.moveAnim', category: 'combat', label: '▶ Anim d\'attaque',
      description: '__testMoveAnim(id|MOVE_…) — nécessite d\'être en combat',
      args: [{ name: 'move', kind: 'string', placeholder: 'MOVE_MIST ou id' }],
      run: ({ move }) => {
        requireFn(g().__testMoveAnim, '__testMoveAnim')(numOrString(move));
        return `anim ${String(move)}`;
      },
    },
    {
      id: 'combat.transition', category: 'combat', label: '🌀 Forcer la transition',
      description: 'Force B_TRANSITION_* pour tous les prochains combats (−1 = normale)',
      args: [{ name: 'id', kind: 'select', options: transitions, default: -1 }],
      run: ({ id }) => {
        const v = Number(id);
        g().__forcedBattleTransition = v >= 0 ? v : undefined;
        return v >= 0 ? `transition forcée : ${v}` : 'transition normale';
      },
    },
  ]);
}

// ─── SCRIPTS (byte-VM) ────────────────────────────────────────────────────────

function registerScripts(): void {
  const bv = (): NonNullable<GlobalProbe['__byteVm']> => requireFn(g().__byteVm, '__byteVm');

  /** Attend la fin d'un warp __devGotoMap : fade éteint + CB2 overworld. */
  const waitOverworldSettled = (timeoutMs = 6000): Promise<boolean> =>
    new Promise((resolve) => {
      const t0 = Date.now();
      const iv = setInterval(() => {
        const r = rt();
        const cb2Name = (r?.gMain as { callback2?: { name?: string } | null } | undefined)?.callback2?.name ?? '';
        const settled = !!r && !(r.gPaletteFade as { active?: boolean }).active && cb2Name.includes('Overworld');
        if (settled || Date.now() - t0 > timeoutMs) { clearInterval(iv); resolve(settled); }
      }, 120);
    });

  /** TP devant un vrai PC, face NORD (tap up = turn), puis lance le script PC. */
  const tpFacePcAndLaunch = async (map: string, x: number, y: number, script: string, label: string): Promise<string> => {
    const b = bv();
    await (b.load as (() => Promise<unknown>) | undefined)?.();
    requireFn(g().__devGotoMap, '__devGotoMap')(map, x, y);
    if (!(await waitOverworldSettled())) return `${label} : warp timeout (fade/cb2)`;
    (g().scope as { press?: (k: string) => void } | undefined)?.press?.('up');
    await new Promise((res) => setTimeout(res, 450));
    requireFn(b.launchScript, '__byteVm.launchScript')(script as never);
    return `${label} : script ${script} lancé`;
  };

  registerCommands([
    {
      id: 'scripts.launch', category: 'scripts', label: '🚀 Lancer un script',
      description: '__byteVm.launchScript(label) — ex. EventScript_PC',
      args: [{ name: 'label', kind: 'string', placeholder: 'EventScript_PC' }],
      run: async ({ label }) => {
        const b = bv();
        await (b.load as (() => Promise<unknown>) | undefined)?.();
        requireFn(b.launchScript, '__byteVm.launchScript')(String(label) as never);
        return `script ${String(label)} lancé`;
      },
    },
    {
      id: 'scripts.special', category: 'scripts', label: '✨ Appeler un special',
      description: '__byteVm.special(name) — special du décomp par nom',
      args: [{ name: 'name', kind: 'string', placeholder: 'HealPlayerParty' }],
      run: ({ name }) => {
        const r = requireFn(bv().special, '__byteVm.special')(String(name) as never);
        return r === undefined ? `special ${String(name)} appelé` : r;
      },
    },
    // ─── PC (user 2026-07-17) : tp devant le VRAI PC + interaction réelle.
    //     On ne lance JAMAIS un script PC loin d'un PC : DoPCTurnOnEffect écrit
    //     le metatile de la case devant le joueur SANS garde (1:1 field_specials
    //     .c:1046) → à distance, ça poserait un tile PC fantôme impassable. ────
    {
      id: 'scripts.pcMaison', category: 'scripts', label: '🛏 PC maison (tp + script)',
      description: 'TP chambre Littleroot (selon genre) devant le PC + script du PC (menu 4 options)',
      run: async () => {
        const female = ((globalThis as { gSaveBlock2Ptr?: { playerGender?: number } }).gSaveBlock2Ptr?.playerGender ?? 0) === 1;
        return female
          ? tpFacePcAndLaunch('MAP_LITTLEROOT_TOWN_MAYS_HOUSE_2F', 8, 2, 'LittlerootTown_MaysHouse_2F_EventScript_PC', 'PC maison (May)')
          : tpFacePcAndLaunch('MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F', 0, 2, 'LittlerootTown_BrendansHouse_2F_EventScript_PC', 'PC maison');
      },
    },
    {
      id: 'scripts.pcCentre', category: 'scripts', label: '🏥 PC Centre (tp + script)',
      description: 'TP Centre Pokémon d\'Oldale devant le PC (metatile MB_PC en 10,1) + EventScript_PC',
      run: () => tpFacePcAndLaunch('MAP_OLDALE_TOWN_POKEMON_CENTER_1F', 10, 2, 'EventScript_PC', 'PC Centre'),
    },
    {
      id: 'scripts.setVar', category: 'scripts', label: '🔧 setVar',
      description: '__byteVm.setVar(VAR_…, valeur)',
      args: [
        { name: 'var', kind: 'string', placeholder: 'VAR_0x8004' },
        { name: 'val', kind: 'number', placeholder: '0' },
      ],
      run: ({ var: v, val }) => {
        requireFn(bv().setVar, '__byteVm.setVar')(String(v) as never, Number(val) as never);
        return `${String(v)} = ${Number(val)}`;
      },
    },
    {
      id: 'scripts.easyChat', category: 'scripts', label: '💬 Easy Chat (démo)', ui: 'grid',
      description: 'Ouvre chaque type d\'écran Easy Chat avec des mots factices',
      args: [{
        name: 'type', kind: 'select',
        options: EASY_CHAT_TYPES.map((e) => ({ value: e.t, label: e.label })),
      }],
      run: ({ type }) => {
        const b = bv();
        const open = (b.openEasyChatDemo ?? b.openEasyChat) as ((t: number) => unknown) | undefined;
        requireFn(open, '__byteVm.openEasyChatDemo')(Number(type));
        return `easy chat type ${Number(type)}`;
      },
    },
    // ⚠️ Les launch* du byte-VM exigent l'image script chargée (cmdIdOf/
    // getScriptOffset) → `await load()` d'abord, comme scripts.launch — sans ça :
    // « Error: cmdId introuvable pour ScrCmd_yesnobox » (bug user 2026-07-10).
    {
      id: 'scripts.multichoice', category: 'scripts', label: '☰ Multichoice (démo)',
      description: '__byteVm.launchMultichoice(id) — menu multichoice réel (4 = MULTI_CONTEST_TYPE, 6 choix)',
      args: [{ name: 'id', kind: 'number', default: 4, placeholder: '4 = MULTI_CONTEST_TYPE' }],
      run: async ({ id }) => {
        const b = bv();
        await (b.load as (() => Promise<unknown>) | undefined)?.();
        return requireFn(b.launchMultichoice, '__byteVm.launchMultichoice')(Number(id) as never);
      },
    },
    {
      id: 'scripts.yesno', category: 'scripts', label: '❓ Oui/Non (démo)',
      description: '__byteVm.launchYesNo() — boîte OUI/NON de test',
      run: async () => {
        const b = bv();
        await (b.load as (() => Promise<unknown>) | undefined)?.();
        return requireFn(b.launchYesNo, '__byteVm.launchYesNo')();
      },
    },
    {
      id: 'scripts.pokemart', category: 'scripts', label: '🛒 Pokémart (démo)',
      description: '__byteVm.launchPokemart() — boutique de test (mart d\'Oldale)',
      run: async () => {
        const b = bv();
        await (b.load as (() => Promise<unknown>) | undefined)?.();
        return requireFn(b.launchPokemart, '__byteVm.launchPokemart')();
      },
    },
    {
      id: 'scripts.diag', category: 'scripts', label: '🩺 Diag byte-VM',
      description: '__byteVm.diag() — état du moteur script',
      run: () => requireFn(bv().diag, '__byteVm.diag')(),
    },
  ]);

  // Log des textes affichés (studio v1) — vue avec toggle.
  registerView({
    id: 'scripts.txtlog', category: 'scripts', label: '📜 Log des textes', collapsed: true,
    description: 'Journalise tous les textes affichés (session)',
    mount: (el) => {
      el.innerHTML = `<label class="dv2-check"><input type="checkbox" id="dv2-txtlog-en"> activer</label>
        <div id="dv2-txtlog" style="display:none;max-height:180px;overflow-y:auto;font-size:10px;
        background:#0a0e14;padding:4px;white-space:pre-wrap;border-radius:4px;margin-top:4px"></div>`;
      el.querySelector('#dv2-txtlog-en')?.addEventListener('change', (e) => {
        const on = (e.target as HTMLInputElement).checked;
        g().__uiTextLogEnabled = on;
        const box = el.querySelector('#dv2-txtlog') as HTMLElement;
        box.style.display = on ? 'block' : 'none';
      });
    },
    update: (el) => {
      const box = el.querySelector('#dv2-txtlog') as HTMLElement | null;
      if (!box || box.style.display === 'none') return;
      const log = g().__uiTextLog ?? [];
      const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 8;
      box.textContent = log.map((l) => `[${l.at.toFixed(1)}s] ${l.t.replace(/\n/g, ' · ')}`).join('\n');
      if (atBottom) box.scrollTop = box.scrollHeight;
    },
  });
}

// ─── GFX (vues live + sondes dev.gfx) ─────────────────────────────────────────

let _showObj = true;
let _showBg = true;
let _visiblesOnly = true;
let _selectedSpriteId: number | null = null;

const OAM_SIZES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[1, 1], [2, 2], [4, 4], [8, 8]], // square
  [[2, 1], [4, 1], [4, 2], [8, 4]], // wide
  [[1, 2], [1, 4], [2, 4], [4, 8]], // tall
];

function paletteGrid(
  label: string,
  get: (bank: number, idx: number) => readonly [number, number, number, number],
): string {
  let cells = '';
  for (let bank = 0; bank < 16; bank++) {
    for (let idx = 0; idx < 16; idx++) {
      const [r, gc, b] = get(bank, idx);
      const rgb15 = rgb15FromRgba(r, gc, b);
      const title = `${label} bank ${bank} idx ${idx} — #${hex(rgb15, 4)} rgb(${r},${gc},${b})`;
      cells += `<div class="dv2-palcell" style="background:rgb(${r},${gc},${b})" title="${title}"></div>`;
    }
  }
  return `<div class="dv2-kv">${label} <span class="dv2-dim">(16 banks × 16)</span></div>`
    + `<div class="dv2-palgrid">${cells}</div>`;
}

function spriteHighlightEl(): HTMLElement {
  let hl = document.getElementById('dv2-hl');
  if (!hl) {
    hl = document.createElement('div');
    hl.id = 'dv2-hl';
    document.body.appendChild(hl);
  }
  return hl;
}

function updateSpriteHighlight(): void {
  const hl = spriteHighlightEl();
  const r = rt();
  const s = _selectedSpriteId != null ? r?.gSprites[_selectedSpriteId] : undefined;
  const canvas = document.querySelector('#game canvas') as HTMLCanvasElement | null;
  if (!r || !s || !canvas) { hl.style.display = 'none'; return; }
  const oam = r.gba.oam[s.oamIndex];
  if (!oam) { hl.style.display = 'none'; return; }
  const [tw, th] = OAM_SIZES[oam.shape]?.[oam.size] ?? [1, 1];
  const rect = canvas.getBoundingClientRect();
  const sx = rect.width / 240, sy = rect.height / 160; // résolution interne GBA
  hl.style.display = 'block';
  hl.style.left = `${rect.left + oam.x * sx}px`;
  hl.style.top = `${rect.top + oam.y * sy}px`;
  hl.style.width = `${tw * 8 * sx}px`;
  hl.style.height = `${th * 8 * sy}px`;
}

function registerGfx(): void {
  registerView({
    id: 'gfx.palettes', category: 'gfx', label: '🎨 Palettes (rendu réel)', collapsed: true,
    mount: (el) => {
      el.innerHTML = `<div style="display:flex;gap:10px;margin-bottom:4px">
        <label class="dv2-check"><input type="checkbox" id="dv2-pal-obj" checked> OBJ</label>
        <label class="dv2-check"><input type="checkbox" id="dv2-pal-bg" checked> BG</label>
      </div><div id="dv2-pal-grids"></div>`;
      el.querySelector('#dv2-pal-obj')?.addEventListener('change', (e) => {
        _showObj = (e.target as HTMLInputElement).checked;
      });
      el.querySelector('#dv2-pal-bg')?.addEventListener('change', (e) => {
        _showBg = (e.target as HTMLInputElement).checked;
      });
    },
    update: (el) => {
      const host = el.querySelector('#dv2-pal-grids') as HTMLElement | null;
      if (!host) return;
      const r = rt();
      if (!r) { host.innerHTML = '<div class="dv2-dim">runtime indisponible</div>'; return; }
      const pal = r.gba.palette;
      let html = '';
      if (_showObj) html += paletteGrid('OBJ', (bank, idx) => pal.getObjRgba(bank, idx, 0));
      if (_showBg) html += paletteGrid('BG', (bank, idx) => pal.getBgRgba(bank, idx, 0));
      host.innerHTML = html || '<div class="dv2-dim">(rien sélectionné)</div>';
    },
  });

  registerView({
    id: 'gfx.sprites', category: 'gfx', label: '🧩 Sprites / OAM', collapsed: true,
    description: 'Table des sprites actifs — clic = surligner sur le canvas',
    mount: (el) => {
      el.innerHTML = `<label class="dv2-check" style="margin-bottom:4px">
        <input type="checkbox" id="dv2-spr-vis" checked> visibles seulement</label>
        <div id="dv2-spr-tbl"></div>`;
      el.querySelector('#dv2-spr-vis')?.addEventListener('change', (e) => {
        _visiblesOnly = (e.target as HTMLInputElement).checked;
      });
      // Délégation : survit aux re-render innerHTML.
      el.addEventListener('click', (e) => {
        const row = (e.target as HTMLElement).closest('[data-sid]') as HTMLElement | null;
        if (!row) return;
        const id = parseInt(row.dataset.sid ?? '', 10);
        _selectedSpriteId = (_selectedSpriteId === id) ? null : id;
      });
    },
    update: (el) => {
      const host = el.querySelector('#dv2-spr-tbl') as HTMLElement | null;
      if (!host) return;
      const r = rt();
      if (!r) { host.innerHTML = '<div class="dv2-dim">runtime indisponible</div>'; return; }
      const rows: string[] = [];
      const ids: number[] = [];
      for (let i = 0; i < MAX_SPRITES; i++) if (r.gSprites[i] !== undefined) ids.push(i);
      let shown = 0;
      for (const id of ids) {
        const s = r.gSprites[id];
        if (!s) continue;
        const oam = r.gba.oam[s.oamIndex];
        const renderedVisible = !!oam && oam.visible && !s.invisible && s.inUse;
        if (_visiblesOnly && !renderedVisible) continue;
        shown++;
        const x = oam ? oam.x : Math.round(s.x + s.x2);
        const y = oam ? oam.y : Math.round(s.y + s.y2);
        const cb = (s.callback && s.callback.name) ? s.callback.name : '—';
        const sel = id === _selectedSpriteId ? ' dv2-sel' : '';
        const mute = renderedVisible ? '' : ' dv2-mute';
        rows.push(
          `<tr class="dv2-row${sel}${mute}" data-sid="${id}">`
          + `<td>${id}</td><td>${x},${y}</td><td>${oam ? oam.tileId : 0}</td><td>${oam ? oam.paletteBank : 0}</td>`
          + `<td>${oam ? oam.priority : 0}${oam?.objMode ? '/' + oam.objMode : ''}${oam?.affineMode ? 'A' + oam.affineMode : ''}</td>`
          + `<td>${s.animNum}</td><td style="max-width:84px;overflow:hidden;text-overflow:ellipsis" title="${esc(cb)}">${esc(cb)}</td></tr>`,
        );
      }
      host.innerHTML = `<div class="dv2-dim">${shown} affiché(s) / ${ids.length} total</div>`
        + '<table class="dv2-tbl"><thead><tr>'
        + '<th>id</th><th>x,y</th><th>tile</th><th>pal</th><th>pr/m</th><th>anim</th><th>cb</th>'
        + '</tr></thead><tbody>' + rows.join('') + '</tbody></table>';
      updateSpriteHighlight();
    },
  });

  registerView({
    id: 'gfx.bg', category: 'gfx', label: '🗺 BG / Blend / Window', collapsed: true,
    mount: () => { /* update-only */ },
    update: (el) => {
      const r = rt();
      if (!r) { el.innerHTML = '<div class="dv2-dim">runtime indisponible</div>'; return; }
      const rows: string[] = [];
      for (let i = 0; i < 4; i++) {
        try {
          const c = r.gba.bg(i as 0 | 1 | 2 | 3).config as unknown as Record<string, unknown>;
          const num = (k: string): string => (typeof c[k] === 'number' ? String(c[k]) : '—');
          rows.push(
            `<tr><td>BG${i} ${c.visible ? '●' : '○'}</td><td>pr ${num('priority')}</td>`
            + `<td>char ${num('charBaseIndex')}</td><td>map ${num('mapBaseIndex')}</td>`
            + `<td>sz ${num('screenSize')}</td><td>${c.paletteMode ? '8bpp' : '4bpp'}</td></tr>`,
          );
        } catch { /* défensif */ }
      }
      let blendHtml = '';
      try {
        const bl = (r.gba as unknown as { blend?: Record<string, number> }).blend;
        if (bl) {
          const modeName = ['off', 'alpha', 'lighten', 'darken'][bl.mode ?? 0] ?? '?';
          blendHtml = `<div class="dv2-kv"><b>Blend</b> mode=<b>${modeName}</b> `
            + `t1=${hex(bl.target1 ?? 0)} t2=${hex(bl.target2 ?? 0)} `
            + `α1=${bl.alpha1 ?? 0} α2=${bl.alpha2 ?? 0} bright=${bl.brightness ?? 0}</div>`;
        }
      } catch { /* défensif */ }
      let winHtml = '';
      try {
        const w = (r.gba as unknown as { windows?: { win0?: { enabled?: boolean }; win1?: { enabled?: boolean }; obj?: { enabled?: boolean } } }).windows;
        if (w) {
          winHtml = `<div class="dv2-kv"><b>Win</b> w0=${w.win0?.enabled ? 'on' : 'off'} `
            + `w1=${w.win1?.enabled ? 'on' : 'off'} obj=${w.obj?.enabled ? 'on' : 'off'}</div>`;
        }
      } catch { /* défensif */ }
      el.innerHTML = '<table class="dv2-tbl">' + rows.join('') + '</table>' + blendHtml + winHtml;
    },
  });

  registerCommands([
    {
      id: 'gfx.film', category: 'gfx', label: '🎬 Film (mosaïque de frames)',
      description: 'dev.gfx.film — capture 1 frame / every rAF, N frames en overlay',
      args: [
        { name: 'frames', kind: 'number', default: 12 },
        { name: 'every', kind: 'number', default: 2 },
      ],
      run: ({ frames, every }) =>
        (dvGfx().film as ((o: object) => unknown) | undefined)?.({ frames: Number(frames), every: Number(every) })
        ?? 'dev.gfx.film indisponible',
    },
    {
      id: 'gfx.filmClear', category: 'gfx', label: '🎬✕ Retirer le film',
      run: () => { (dvGfx().filmClear as (() => unknown) | undefined)?.(); },
    },
    {
      id: 'gfx.tile', category: 'gfx', label: '🔍 Tile VRAM (ASCII)',
      description: 'dev.gfx.tile(cb, id) — une tile en indices ASCII + stats',
      args: [
        { name: 'cb', kind: 'number', placeholder: 'charBase (0-3)', default: 0 },
        { name: 'id', kind: 'number', placeholder: 'tile id' },
      ],
      run: ({ cb, id }) => (dvGfx().tile as ((c: number, i: number) => unknown) | undefined)?.(Number(cb), Number(id))
        ?? 'dev.gfx.tile indisponible',
    },
    {
      id: 'gfx.palBank', category: 'gfx', label: '🎨 Dump palette bank',
      description: 'dev.gfx.palBank(kind, bank) — 16 couleurs RGB15 hex',
      args: [
        {
          name: 'kind', kind: 'select', default: 'obj',
          options: [{ value: 'obj', label: 'OBJ' }, { value: 'bg', label: 'BG' }],
        },
        { name: 'bank', kind: 'number', default: 0 },
      ],
      run: ({ kind, bank }) => (dvGfx().palBank as ((k: string, b: number) => unknown) | undefined)?.(String(kind), Number(bank))
        ?? 'dev.gfx.palBank indisponible',
    },
    {
      id: 'gfx.lum', category: 'gfx', label: '💡 Luminosité canvas',
      description: 'dev.gfx.lum() — luminosité moyenne (0 = noir, diag des fades)',
      run: () => (dvGfx().lum as (() => unknown) | undefined)?.() ?? 'dev.gfx.lum indisponible',
    },
    {
      id: 'gfx.findColor', category: 'gfx', label: '🎯 Trouver une couleur',
      description: 'dev.gfx.findColor(\'#RRGGBB\', tol) — où la couleur apparaît sur le canvas',
      args: [
        { name: 'rgb', kind: 'string', placeholder: '#FF00FF' },
        { name: 'tol', kind: 'number', default: 8 },
      ],
      run: ({ rgb, tol }) => (dvGfx().findColor as ((c: string, t: number) => unknown) | undefined)?.(String(rgb), Number(tol))
        ?? 'dev.gfx.findColor indisponible',
    },
    {
      id: 'gfx.oam', category: 'gfx', label: '🧩 Dump OAM (console)',
      description: 'dev.gfx.oam() — dump compact des sprites en console',
      run: () => (dvGfx().oam as (() => unknown) | undefined)?.() ?? 'dev.gfx.oam indisponible',
    },
  ]);
}

// ─── AUDIO (absorbe harness/util/audio-devtool.ts) ────────────────────────────

const _seLog: Array<{ id: number; n: number }> = [];

function wireSeMonitor(): void {
  // Wrap RÉVERSIBLE et passthrough de __PlaySE : journalise puis rappelle l'original.
  const gg = g();
  const cur = gg.__PlaySE;
  if (cur && !cur.__dv2Wrapped) {
    const orig = cur;
    const wrapped = ((id: number) => {
      const last = _seLog[_seLog.length - 1];
      if (last && last.id === id) last.n++;
      else { _seLog.push({ id, n: 1 }); if (_seLog.length > 12) _seLog.shift(); }
      return orig(id);
    }) as NonNullable<GlobalProbe['__PlaySE']>;
    wrapped.__dv2Wrapped = true;
    gg.__PlaySE = wrapped;
  }
}

interface SongEntry { id: number; name: string }

function buildSongLists(): { bgm: SongEntry[]; se: SongEntry[] } {
  const bgm: SongEntry[] = [];
  const se: SongEntry[] = [];
  for (const idStr in SONG_ID_TO_NAME) {
    const id = Number(idStr);
    const name = SONG_ID_TO_NAME[id];
    if (!name) continue;
    if (name.startsWith('mus_')) bgm.push({ id, name });
    else if (name.startsWith('se_')) se.push({ id, name });
  }
  bgm.sort((a, b) => a.name.localeCompare(b.name));
  se.sort((a, b) => a.name.localeCompare(b.name));
  return { bgm, se };
}

function songPicker(
  el: HTMLElement, entries: SongEntry[], accent: string,
  buttons: Array<{ label: string; title?: string; onClick: (id: number, refresh: () => void) => void }>,
): void {
  const search = document.createElement('input');
  search.placeholder = `🔍 filtrer ${entries.length}…`;
  search.style.cssText = 'width:100%;box-sizing:border-box;margin-bottom:3px';
  const sel = document.createElement('select');
  sel.style.cssText = 'width:100%;box-sizing:border-box';
  sel.size = 1;
  const refill = (): void => {
    const q = search.value.trim().toLowerCase();
    sel.innerHTML = '';
    for (const e of entries) {
      if (q && !e.name.toLowerCase().includes(q) && !String(e.id).includes(q)) continue;
      const o = document.createElement('option');
      o.value = String(e.id);
      o.textContent = `${e.id}: ${e.name}`;
      sel.appendChild(o);
    }
    if (!sel.options.length) {
      const o = document.createElement('option');
      o.textContent = '(aucun match)';
      o.disabled = true;
      sel.appendChild(o);
    }
  };
  refill();
  search.addEventListener('input', refill);
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:4px;margin-top:4px';
  const refreshAll = (): void => { /* re-render hook des libellés (play/pause) */ };
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.textContent = b.label;
    if (b.title) btn.title = b.title;
    btn.style.cssText = `flex:1;color:${accent}`;
    btn.addEventListener('click', () => {
      const id = Number(sel.value);
      if (Number.isFinite(id)) b.onClick(id, refreshAll);
    });
    btnRow.appendChild(btn);
  }
  el.appendChild(search);
  el.appendChild(sel);
  el.appendChild(btnRow);
}

function registerAudio(): void {
  registerView({
    id: 'audio.now', category: 'audio', label: '🔊 En cours (observe-only)',
    mount: () => { wireSeMonitor(); },
    update: (el) => {
      wireSeMonitor(); // __PlaySE peut être (re)posé après le boot
      let bgm = '—';
      // Statut natif : status + songHeader du player BGM (gMPlayInfo_BGM du moteur
      // m4a) — le shim getCurrentSongId (song id legacy) a été dissous.
      try {
        const st = gMPlayInfo_BGM.status >>> 0;
        bgm = (st & 0xffff) === 0 ? '(aucun)' : `0x${st.toString(16)} sh=0x${(gMPlayInfo_BGM.songHeader >>> 0).toString(16)}`;
      } catch { /* défensif */ }
      let se = '', cry = '';
      try {
        const dg = g().__decompGlobals;
        if (dg?.IsSEPlaying) se = dg.IsSEPlaying() ? 'oui' : 'non';
        if (dg?.IsCryPlaying) cry = dg.IsCryPlaying() ? 'oui' : 'non';
      } catch { /* défensif */ }
      const log = _seLog.length
        ? _seLog.map((e) => `${e.id}${e.n > 1 ? '×' + e.n : ''}`).join(' ')
        : '(aucun capté)';
      el.innerHTML =
        `<div class="dv2-kv">BGM=<b>${bgm}</b>${se ? ' · SE=' + se : ''}${cry ? ' · cri=' + cry : ''}</div>`
        + `<div class="dv2-kv dv2-dim">SE récents : ${esc(log)}</div>`;
    },
  });

  registerView({
    id: 'audio.volume', category: 'audio', label: '🔉 Volume master',
    mount: (el) => {
      const initial = Math.max(0, Math.min(1, parseFloat(localStorage.getItem('audioDevtoolVolume') ?? '1') || 1));
      el.innerHTML = `<div style="display:flex;align-items:center;gap:8px">
        <input type="range" id="dv2-vol" min="0" max="100" value="${Math.round(initial * 100)}" style="flex:1"/>
        <span id="dv2-vol-val" style="min-width:34px;text-align:right">${Math.round(initial * 100)}%</span></div>`;
      const slider = el.querySelector('#dv2-vol') as HTMLInputElement;
      const val = el.querySelector('#dv2-vol-val') as HTMLElement;
      slider.addEventListener('input', () => {
        const v = Number(slider.value) / 100;
        setMasterVolume(v);
        val.textContent = `${slider.value}%`;
        localStorage.setItem('audioDevtoolVolume', String(v));
        // Sync topbar (même mécanisme que l'ancien audio-devtool).
        window.dispatchEvent(new CustomEvent('audio-volume-changed', { detail: { volume: v } }));
      });
      window.addEventListener('audio-volume-changed', (e) => {
        const v = (e as CustomEvent<{ volume: number }>).detail.volume;
        if (Math.abs(Number(slider.value) / 100 - v) < 0.005) return;
        slider.value = String(Math.round(v * 100));
        val.textContent = `${slider.value}%`;
      });
    },
  });

  const lists = buildSongLists();

  registerView({
    id: 'audio.bgm', category: 'audio', label: `🎵 BGM (${lists.bgm.length})`,
    description: 'Jouer une musique — Play/Pause, Loop forcée, Stop',
    mount: (el) => {
      let playState: 'stopped' | 'playing' | 'paused' = 'stopped';
      let activeId: number | null = null;
      songPicker(el, lists.bgm, '#a7f3d0', [
        {
          label: '▶⏸', title: 'Play / Pause / Resume',
          onClick: (id) => {
            const same = activeId === id;
            if (playState === 'playing' && same) { m4aMPlayStop(gMPlayInfo_BGM); playState = 'paused'; }
            else if (playState === 'paused' && same) { m4aMPlayContinue(gMPlayInfo_BGM); playState = 'playing'; }
            else { m4aMPlayAllStop(); m4aSongNumStart(id); activeId = id; playState = 'playing'; }
          },
        },
        {
          label: '🔁', title: 'Play avec loop forcée (ignore les markers MIDI)',
          onClick: (id) => { m4aMPlayAllStop(); m4aSongNumStart(id, true); activeId = id; playState = 'playing'; },
        },
        {
          label: '⏹', title: 'Stop tout',
          onClick: () => { m4aMPlayAllStop(); playState = 'stopped'; activeId = null; },
        },
      ]);
    },
  });

  registerView({
    id: 'audio.se', category: 'audio', label: `🔔 SE (${lists.se.length})`,
    description: 'Jouer un effet sonore (one-shot)',
    mount: (el) => {
      songPicker(el, lists.se, '#fbbf24', [
        { label: '▶ Play SE', onClick: (id) => PlaySE(id) },
      ]);
    },
  });

  registerCommands([
    {
      id: 'audio.play', category: 'audio', label: '▶ Jouer BGM (id)', hidden: true,
      description: 'm4aSongNumStart(id, loop?) — console',
      args: [
        { name: 'id', kind: 'number' },
        { name: 'loop', kind: 'boolean', default: false, optional: true },
      ],
      run: ({ id, loop }) => { m4aMPlayAllStop(); m4aSongNumStart(Number(id), loop === true); return `BGM ${Number(id)}`; },
    },
    {
      id: 'audio.se', category: 'audio', label: '🔔 Jouer SE (id)', hidden: true,
      args: [{ name: 'id', kind: 'number' }],
      run: ({ id }) => { PlaySE(Number(id)); return `SE ${Number(id)}`; },
    },
    {
      id: 'audio.stop', category: 'audio', label: '⏹ Stop tout',
      description: 'm4aMPlayAllStop() — coupe BGM + SE',
      run: () => { m4aMPlayAllStop(); return 'audio stoppé'; },
    },
  ]);
}

// ─── SAVE ─────────────────────────────────────────────────────────────────────

const FLASH_KEY = 'em_flash_v3'; // cf. src/save.ts

function registerSave(): void {
  registerView({
    id: 'save.state', category: 'save', label: '💾 État de la flash',
    mount: () => { /* update-only */ },
    update: (el) => {
      let raw: string | null = null;
      try { raw = localStorage.getItem(FLASH_KEY); } catch { /* défensif */ }
      if (!raw) { el.innerHTML = `<div class="dv2-kv">localStorage <b>${FLASH_KEY}</b> : <b>vide</b> (pas de save)</div>`; return; }
      el.innerHTML = `<div class="dv2-kv">localStorage <b>${FLASH_KEY}</b> : <b>${raw.length.toLocaleString('fr-FR')}</b> chars</div>`;
    },
  });

  registerCommands([
    {
      id: 'save.export', category: 'save', label: '⬇ Exporter la save (.json)',
      description: `Télécharge le contenu de localStorage ${FLASH_KEY}`,
      run: () => {
        const raw = localStorage.getItem(FLASH_KEY);
        if (!raw) throw new Error('aucune save à exporter');
        const blob = new Blob([raw], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${FLASH_KEY}-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        return `exporté (${raw.length.toLocaleString('fr-FR')} chars)`;
      },
    },
    {
      id: 'save.import', category: 'save', label: '⬆ Importer une save (.json)', danger: true,
      description: `Remplace localStorage ${FLASH_KEY} par un fichier exporté, puis recharge`,
      run: () => new Promise<string>((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt';
        input.onchange = () => {
          const f = input.files?.[0];
          if (!f) { reject(new Error('aucun fichier choisi')); return; }
          f.text().then((txt) => {
            JSON.parse(txt); // valide que c'est bien du JSON (sinon throw)
            localStorage.setItem(FLASH_KEY, txt);
            resolve(`importé (${txt.length.toLocaleString('fr-FR')} chars) — rechargement…`);
            setTimeout(() => window.location.reload(), 600);
          }).catch(reject);
        };
        input.click();
      }),
    },
    {
      id: 'save.clear', category: 'save', label: '🗑 Effacer la save', danger: true,
      description: `Supprime localStorage ${FLASH_KEY} (la partie en cours n'est pas touchée avant reload)`,
      run: () => { localStorage.removeItem(FLASH_KEY); return 'save effacée — recharger pour repartir à zéro'; },
    },
  ]);
}

// ─── SYS ──────────────────────────────────────────────────────────────────────

function registerSys(): void {
  registerView({
    id: 'sys.rng', category: 'sys', label: '🎲 RNG',
    mount: () => { /* update-only */ },
    update: (el) => {
      const rng = g().rng;
      if (!rng?.value) { el.innerHTML = '<div class="dv2-dim">window.rng indisponible</div>'; return; }
      el.innerHTML = `<div class="dv2-kv">gRngValue=<b>0x${hex(rng.value() >>> 0, 8)}</b>`
        + `${rng.value2 ? ` · gRng2Value=<b>0x${hex(rng.value2() >>> 0, 8)}</b>` : ''}`
        + `${rng.count ? ` · calls=<b>${rng.count()}</b>` : ''}</div>`;
    },
  });

  const dv = (): Record<string, unknown> => (g().dev ?? {});

  registerCommands([
    {
      id: 'sys.seed', category: 'sys', label: '🎲 SeedRng',
      description: 'window.rng.SeedRng(seed) — re-seed le RNG principal',
      args: [{ name: 'seed', kind: 'number', placeholder: '0' }],
      run: ({ seed }) => {
        requireFn(g().rng?.SeedRng, 'window.rng.SeedRng')(Number(seed));
        return `SeedRng(${Number(seed)})`;
      },
    },
    {
      id: 'sys.seek', category: 'sys', label: '⏩ Seek N frames',
      description: 'Pause + avance en rafale de N frames (dev.step)',
      args: [{ name: 'n', kind: 'number', default: 60 }],
      run: ({ n }) => {
        const r = rt();
        if (!r) throw new Error('runtime indisponible');
        r.paused = true;
        r.stepBudget += Number(n);
        return `burst ${Number(n)} frames`;
      },
    },
    {
      id: 'sys.savestate', category: 'sys', label: '📸 Savestate',
      description: 'dev.savestate(name) — snapshot runtime en mémoire',
      args: [{ name: 'name', kind: 'string', default: 'dv2', optional: true }],
      run: ({ name }) => {
        const fn = dv().savestate as ((n?: string) => unknown) | undefined;
        return requireFn(fn, 'dev.savestate')(String(name ?? 'dv2'));
      },
    },
    {
      id: 'sys.loadstate', category: 'sys', label: '⏪ Loadstate',
      description: 'dev.loadstate(name) — restaure un snapshot',
      args: [{ name: 'name', kind: 'string', default: 'dv2', optional: true }],
      run: ({ name }) => {
        const fn = dv().loadstate as ((n?: string) => unknown) | undefined;
        return requireFn(fn, 'dev.loadstate')(String(name ?? 'dv2'));
      },
    },
    {
      id: 'sys.tasks', category: 'sys', label: '🧵 Dump tasks (console)',
      description: 'dev.tasks() — liste des gTasks actives',
      run: () => {
        const fn = dv().tasks as (() => unknown) | undefined;
        return requireFn(fn, 'dev.tasks')();
      },
    },
    {
      id: 'sys.info', category: 'sys', label: 'ℹ Info runtime (console)',
      description: 'dev.info() — état général du runtime',
      run: () => {
        const fn = dv().info as (() => unknown) | undefined;
        return requireFn(fn, 'dev.info')();
      },
    },
  ]);
}

// ─── Entrée unique ────────────────────────────────────────────────────────────

let _registered = false;

export function registerAllDevtools(): void {
  if (_registered) return;
  _registered = true;
  registerJeu();
  registerJoueur();
  registerCombat();
  registerScripts();
  registerGfx();
  registerAudio();
  registerNativeAudioDevtools();
  registerSave();
  registerSys();
  // Reprend les responsabilités de boot du panel v1 / audio-devtool :
  resumeAutobootIfPending();
  const vol = Math.max(0, Math.min(1, parseFloat(localStorage.getItem('audioDevtoolVolume') ?? '1') || 1));
  setMasterVolume(vol);
}
