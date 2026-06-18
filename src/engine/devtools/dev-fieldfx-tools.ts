/**
 * dev-fieldfx-tools.ts — devtools overworld / field effects ("commandes du jeu").
 *
 * Side-effect import depuis `main.ts` → expose tout sur `window.dev.fx.*`.
 * Co-existe avec `dev.audit` / `dev.breakpoint` / `dev.bridge` sans les toucher.
 *
 * POURQUOI un module bundlé (et pas un import() console) : ce module est dans le
 * bundle Vite, donc il touche les MÊMES instances live que le jeu fait tourner
 * (`gFieldEffectArguments`, `gObjectEvents`, le runtime…). Un `import()` dynamique
 * depuis la console F12 donnerait une instance Vite FRAÎCHE (pools vides) → piège payé.
 *
 * RÉSISTANCE À L'OBSOLESCENCE : on importe les exports par leur NOM TYPÉ. Si une
 * fonction décomp est renommée/déplacée, `npx tsc --noEmit` (lancé à chaque commit)
 * casse et pointe la ligne. `dev.fx.selftest()` vérifie en plus que tout résout au
 * runtime. La table FLDEFF est dérivée AUTOMATIQUEMENT des constantes (pas de hardcode).
 *
 * HORS MIROIR 1:1 — outillage dev pur, comme tout `src/engine/devtools/`. Jamais push.
 *
 * Usage console (F12) :
 *   dev.fx.help()                       — liste les commandes
 *   dev.fx.player()                     — l'object event du joueur (localId/map/pos/behavior)
 *   dev.fx.tp('MAP_ROUTE111', 14, 70)   — fast-travel (alias __devGotoMap)
 *   dev.fx.fldeffs()                    — table { nom: id } de tous les FLDEFF_*
 *   dev.fx.start('FLDEFF_RIPPLE', [x, y, 0, 1])  — set args + FieldEffectStart générique
 *   dev.fx.onPlayer('FLDEFF_SAND_PILE') — spawn un effet object-event-owned SUR le joueur
 *   dev.fx.sandPile()                   — raccourci : inSandPile=true + spawn sand pile
 *   dev.fx.list()                       — sprites d'effet actifs (oam x/y/tile/shape/vis)
 *   dev.fx.behaviorAt(x, y)             — metatile behavior à (x,y) en coords map
 *   dev.fx.selftest()                   — santé de l'outil (refs live résolues ?)
 */

import { FieldEffectStart, gFieldEffectArguments } from '../field/field-effect';
import { gObjectEvents, type ObjectEvent, GetObjectEventIdByLocalIdAndMap } from '../../game/event_object_movement';
import { gPlayerAvatar } from '../../game/field_player_avatar';
import { MapGridGetMetatileIdAt } from '../../game/fieldmap';
import { SetSurfBlob_BobState } from '../../game/field_effect_helpers';
import { StartRevealDisguise } from '../../game/field_effect_helpers';
import * as FE from '../decomp-data/include/constants/field_effects-data';
// ── Météo (game/field_weather + field_weather_effect) — vraies instances live (bundlé).
//    L'import de field_weather_effect déclenche _registerWeatherFuncs(ASH) sur la vraie table.
import {
  gWeatherPtr, StartWeather, FadeScreen, ApplyWeatherColorMapIfIdle, preloadWeatherFogPalette,
} from '../../game/field_weather';
import { ResumePausedWeather, SetWeather, preloadWeatherAshSprites, preloadWeatherFogHorizontalSprites, preloadWeatherCloudSprites } from '../../game/field_weather_effect';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { GetSpritePaletteTagByPaletteNum, FreeSpritePaletteByTag } from '../system/sprite';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Runtime live (posé par la scène overworld). */
function rt(): any {
  const w = window as any;
  return w.dev?._rt ?? (globalThis as any).__rt ?? null;
}

// ── Table FLDEFF auto-dérivée des constantes (nom → id et id → nom) ─────────────
const FLDEFF_BY_NAME: Record<string, number> = {};
const FLDEFF_BY_ID: Record<number, string> = {};
for (const [k, v] of Object.entries(FE)) {
  if (typeof v === 'number' && k.startsWith('FLDEFF_') && !k.startsWith('FLDEFF_PAL')) {
    FLDEFF_BY_NAME[k] = v;
    if (FLDEFF_BY_ID[v] === undefined) FLDEFF_BY_ID[v] = k;
  }
}

function resolveFldeff(idOrName: number | string): number {
  if (typeof idOrName === 'number') return idOrName;
  const key = idOrName.startsWith('FLDEFF_') ? idOrName : 'FLDEFF_' + idOrName.toUpperCase();
  const id = FLDEFF_BY_NAME[key];
  if (id === undefined) throw new Error(`[dev.fx] FLDEFF inconnu: "${idOrName}" (essaie dev.fx.fldeffs())`);
  return id;
}

function playerObjEvent(): ObjectEvent | undefined {
  for (const o of gObjectEvents) if (o && o.active && o.isPlayer) return o;
  return undefined;
}

/** spriteIds appartenant à un object-event (NPC/joueur) → à exclure de la liste d'effets. */
function objectEventSpriteIds(): Set<number> {
  const ids = new Set<number>();
  for (const o of gObjectEvents) if (o && o.active && o.spriteId >= 0) ids.add(o.spriteId);
  if (gPlayerAvatar.spriteId >= 0) ids.add(gPlayerAvatar.spriteId);
  return ids;
}

const fx = {
  help() {
    const lines = [
      'dev.fx — overworld / field effects',
      "  player()                 → object event du joueur (localId/map/pos/behavior)",
      "  tp(map, x, y)            → fast-travel (alias __devGotoMap)",
      "  fldeffs()                → table { nom: id } des FLDEFF_*",
      "  start(idOrName, args[])  → set gFieldEffectArguments + FieldEffectStart",
      "  onPlayer(idOrName, flags[])  → spawn effet object-event-owned sur le joueur",
      "                               (flags posés true avant : ['inHotSprings'], …)",
      "  setFlag(name, val=true)  → pose un flag sur l'object event joueur",
      "  sandPile() / stopSandPile()  → raccourci sand pile",
      "  list()                   → sprites d'effet actifs (non object-event)",
      "  behaviorAt(x, y)         → metatile behavior (coords map)",
      "  selftest()               → santé de l'outil",
    ];
    console.log(lines.join('\n'));
    return lines.length;
  },

  fldeffs() { return { ...FLDEFF_BY_NAME }; },

  player() {
    const p = playerObjEvent();
    if (!p) return null;
    const r = rt();
    const spr = r && gPlayerAvatar.spriteId >= 0 ? r.gSprites.get(gPlayerAvatar.spriteId) : null;
    return {
      objectEventId: GetObjectEventIdByLocalIdAndMap(p.localId, p.mapNum, p.mapGroup),
      localId: p.localId, mapNum: p.mapNum, mapGroup: p.mapGroup,
      mapX: (p as any).currentCoordsX, mapY: (p as any).currentCoordsY,
      graphicsId: p.graphicsId, spriteId: gPlayerAvatar.spriteId,
      currentMetatileBehavior: '0x' + (p.currentMetatileBehavior >>> 0).toString(16),
      inSandPile: (p as any).inSandPile, inShortGrass: (p as any).inShortGrass,
      screenX: spr?.x, screenY: spr?.y,
    };
  },

  /** 1:1 chemin réel : pose gFieldEffectArguments[0..] puis FieldEffectStart(id). */
  start(idOrName: number | string, args: number[] = []): number {
    const id = resolveFldeff(idOrName);
    for (let i = 0; i < 8; i++) gFieldEffectArguments[i] = args[i] ?? 0;
    return FieldEffectStart(id);
  },

  /** Pose un flag (ex. 'inSandPile') sur l'object event LIVE du joueur. */
  setFlag(name: string, val = true) {
    const p = playerObjEvent();
    if (!p) throw new Error('[dev.fx] object event joueur introuvable');
    (p as any)[name] = val;
    return { [name]: (p as any)[name] };
  },

  /** Spawn un effet object-event-owned (args = localId/mapNum/mapGroup) sur le joueur.
   *  `flags` = flags à poser true AVANT le spawn (sinon l'Update despawn aussitôt) — ex.
   *  ['inSandPile'], ['inHotSprings'], ['inShortGrass']. */
  onPlayer(idOrName: number | string, flags: string[] = []): { started: number; sprites: any[] } {
    const p = playerObjEvent();
    if (!p) throw new Error('[dev.fx] object event joueur introuvable (overworld pas chargé ?)');
    for (const f of flags) (p as any)[f] = true;
    const started = fx.start(idOrName, [p.localId, p.mapNum, p.mapGroup]);
    return { started, sprites: fx.list() };
  },

  /** Raccourci sand pile (inSandPile). */
  sandPile() { return fx.onPlayer('FLDEFF_SAND_PILE', ['inSandPile']); },
  stopSandPile() { fx.setFlag('inSandPile', false); return fx.list(); },

  /** Raccourci disguise : spawn un déguisement (kind='tree'|'mountain'|'sand') sur le joueur. */
  disguise(kind = 'tree') {
    const p = playerObjEvent();
    if (!p) throw new Error('[dev.fx] object event joueur introuvable');
    const map: Record<string, string> = { tree: 'FLDEFF_TREE_DISGUISE', mountain: 'FLDEFF_MOUNTAIN_DISGUISE', sand: 'FLDEFF_SAND_DISGUISE' };
    const sid = fx.start(map[kind] ?? map.tree, [p.localId, p.mapNum, p.mapGroup]);
    (p as any).fieldEffectSpriteId = sid;  // 1:1 : le caller MovementAction stocke le spriteId.
    return { disguiseSpriteId: sid, sprites: fx.list() };
  },
  /** Déclenche la révélation (1:1 StartRevealDisguise : directionSeqIdx=1 → reveal anim → despawn). */
  revealDisguise() {
    const p = playerObjEvent();
    if (!p) throw new Error('[dev.fx] object event joueur introuvable');
    (p as any).directionSeqIdx = 1;
    StartRevealDisguise(rt(), p as any);
    return { directionSeqIdx: (p as any).directionSeqIdx, fieldEffectSpriteId: (p as any).fieldEffectSpriteId };
  },

  /** Raccourci surf blob : spawn la monture sur le joueur + BOB_PLAYER_AND_MON (bobbing+sync). */
  surfBlob() {
    const p = playerObjEvent();
    if (!p) throw new Error('[dev.fx] object event joueur introuvable');
    const objId = GetObjectEventIdByLocalIdAndMap(p.localId, p.mapNum, p.mapGroup);
    const blobId = fx.start('FLDEFF_SURF_BLOB', [(p as any).currentCoordsX, (p as any).currentCoordsY, objId]);
    SetSurfBlob_BobState(rt(), blobId, 1);  // BOB_PLAYER_AND_MON
    return { blobSpriteId: blobId, sprites: fx.list() };
  },

  /** Sprites d'effet actifs (= tous les sprites SAUF ceux d'un object event). */
  list() {
    const r = rt(); if (!r) return [];
    const owned = objectEventSpriteIds();
    const out: any[] = [];
    for (const s of r.gSprites.values()) {
      if (owned.has(s.spriteId)) continue;
      const oam = r.gba.oam[s.oamIndex];
      out.push({
        id: s.spriteId, x: s.x, y: s.y, y2: s.y2,
        oamX: oam?.x, oamY: oam?.y, tile: oam?.tileId,
        shape: oam?.shape, size: oam?.size, vis: oam?.visible,
        prio: oam?.priority, sub: s.subpriority, coordOff: s.coordOffsetEnabled,
      });
    }
    return out;
  },

  metatileIdAt(x: number, y: number): number { return MapGridGetMetatileIdAt(x, y); },

  // ── Météo (A/B chantier field_weather) ──────────────────────────────────────
  weather: {
    /** Nombre de slots palette OBJ libres (StartWeather en alloue 2). */
    freeObjPalSlots(): number[] {
      const free: number[] = [];
      for (let i = 0; i < 16; i++) if (GetSpritePaletteTagByPaletteNum(i) === 0xFFFF) free.push(i);
      return free;
    },
    /** Force une météo (défaut = 7 VOLCANIC_ASH) sur les vraies instances. NE rappelle
     *  PAS StartWeather (le câblage map-init l'a fait tôt → palette déjà allouée valide ;
     *  un re-StartWeather ré-allouerait avec les slots pleins). Pose saved weather +
     *  ResumePausedWeather (curr=next=météo) + readyForInit (Task_WeatherInit -> *_InitAll). */
    async force(weatherId = 7) {
      await preloadWeatherFogPalette();
      await preloadWeatherAshSprites();
      await preloadWeatherFogHorizontalSprites();
      await preloadWeatherCloudSprites();
      gSaveBlock1Ptr.weather = weatherId;
      ResumePausedWeather();          // curr=next=météo (réutilise la palette météo allouée tôt)
      gWeatherPtr.readyForInit = true; // Task_WeatherInit -> sWeatherFuncs[curr].initAll
      return fx.weather.state();
    },
    /** A/B FIDÈLE : déclenche la VRAIE transition météo (SetWeather -> SetNextWeather),
     *  qui crée l'écart curr≠next -> Task_WeatherMain déroule finish() de l'ancienne
     *  (cleanup sprites) puis initVars() de la nouvelle (pose target/blend). Indispensable
     *  pour vérifier la chaîne d'init d'une météo (force() pose curr direct sans initVars). */
    async transition(weatherId = 7) {
      await preloadWeatherFogPalette();
      await preloadWeatherAshSprites();
      await preloadWeatherFogHorizontalSprites();
      await preloadWeatherCloudSprites();
      SetWeather(weatherId);
      gWeatherPtr.readyForInit = true;
      return fx.weather.state();
    },
    /** État courant du gWeatherPtr (+ compteur de sprites ash vivants). */
    state() {
      const w = gWeatherPtr;
      let ashCount = 0;
      for (let i = 0; i < 20; i++) if (w.sprites.s2.ashSprites[i]) ashCount++;
      return {
        curr: w.currWeather, next: w.nextWeather, palState: w.palProcessingState,
        gfxLoaded: w.weatherGfxLoaded, ashCreated: w.ashSpritesCreated, ashCount,
        palIdx: w.contrastColorMapSpritePalIndex, blendEVA: w.currBlendEVA, blendEVB: w.currBlendEVB,
        ashBaseSpritesX: w.ashBaseSpritesX, freeObjPals: fx.weather.freeObjPalSlots().length,
        colorMapIndex: w.colorMapIndex, target: w.targetColorMapIndex, stepDelay: w.colorMapStepDelay,
      };
    },
    /** A/B color-map seul : applique un index de color map (1..19) si IDLE. */
    applyColorMap(idx: number) { ApplyWeatherColorMapIfIdle(idx); return fx.weather.state(); },
    /** Dump des 16 tags de palette OBJ (0xFFFF = libre). Diagnostic budget palette. */
    palTags(): Record<number, string> {
      const out: Record<number, string> = {};
      for (let i = 0; i < 16; i++) out[i] = '0x' + (GetSpritePaletteTagByPaletteNum(i) >>> 0).toString(16);
      return out;
    },
    /** Libère un slot OBJ par tag (A/B : faire de la place pour la palette météo). */
    freeByTag(tag: number) { FreeSpritePaletteByTag(tag); return fx.weather.freeObjPalSlots(); },
  },

  behaviorAt(x: number, y: number): string {
    const w = window as any;
    const fn = w.MapGridGetMetatileBehaviorAt ?? rt()?.MapGridGetMetatileBehaviorAt;
    if (typeof fn !== 'function') return 'n/a (MapGridGetMetatileBehaviorAt absent)';
    return '0x' + (fn(x, y) >>> 0).toString(16);
  },

  tp(map: string, x: number, y: number) {
    const fn = (globalThis as any).__devGotoMap;
    if (typeof fn !== 'function') throw new Error('[dev.fx] __devGotoMap absent');
    return fn(map, x, y);
  },

  selftest() {
    return {
      FieldEffectStart: typeof FieldEffectStart === 'function',
      gFieldEffectArguments: Array.isArray(gFieldEffectArguments) && gFieldEffectArguments.length === 8,
      gObjectEvents: Array.isArray(gObjectEvents),
      gPlayerAvatar: !!gPlayerAvatar,
      GetObjectEventIdByLocalIdAndMap: typeof GetObjectEventIdByLocalIdAndMap === 'function',
      runtime: !!rt(),
      gotoMap: typeof (globalThis as any).__devGotoMap === 'function',
      fldeffCount: Object.keys(FLDEFF_BY_NAME).length,
      playerFound: !!playerObjEvent(),
    };
  },
};

if (typeof window !== 'undefined') {
  const w = window as unknown as { dev?: Record<string, unknown> };
  w.dev = w.dev ?? {};
  (w.dev as Record<string, unknown>).fx = fx;
  console.log('[dev-fieldfx-tools] window.dev.fx installed — try dev.fx.help()');
}

export {};
