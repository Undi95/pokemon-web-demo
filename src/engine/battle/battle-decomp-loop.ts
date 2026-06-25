/**
 * battle/battle-decomp-loop.ts — Activation de la boucle combat décomp + harness
 * de vérification déterministe.
 *
 * CHANTIER #41 P0 : le combat tourne aujourd'hui sur le monolithe
 * `battle-flow.ts` (voie V). L'archi décomp fidèle (CB2_InitBattle →
 * CB2_HandleStartBattle → BattleMainCB1 + gBattleMainFunc + controllers) est
 * portée mais DORMANTE. Ce module l'active derrière un flag (défaut OFF =
 * fallback garanti sur battle-flow).
 *
 * Source de vérité du boot : `battle_main.c` :
 *   - `CB2_InitBattle` (588) → `CB2_InitBattleInternal` (619, pose
 *     SetUpBattleVarsAndBirchZigzagoon + callback2 = CB2_HandleStartBattle)
 *   - `CB2_HandleStartBattle` (953, case 15 = InitBattleControllers → pose
 *     gBattleMainFunc = BeginBattleIntro ; case 18 = callback1 = BattleMainCB1,
 *     callback2 = BattleMainCB2)
 *   - `BattleMainCB1` (3026) : gBattleMainFunc() + pump controllers chaque frame
 *
 * Le runtime tick `gMain.callback1()` PUIS `gMain.callback2()` chaque frame
 * (CallCallbacks, decomp-runtime.ts:2253) — exactement le modèle GBA AgbMain.
 * Donc « activer » = poser callback2 = CB2_InitBattle ; le runtime déroule tout.
 */

import { getRuntime, m4aSongNumStart, m4aMPlayAllStop, getCurrentSongId, FillPalBufferBlack } from '../../../harness/runtime/decomp-globals';
import { DestroySprite } from '../../sprite';
import { MAX_SPRITES } from '../../../harness/runtime/decomp-runtime';
import { FadeScreen, FADE_FROM_BLACK } from '../system/fade-screen';
import { gBattleControllerExecFlags, gBattlersCount, getBattlerControllerFunc, gBattleTypeFlags } from './state';
import { getRecentOpcodes } from './script-interpreter';
import { BATTLE_TYPE_TRAINER, BATTLE_TYPE_LINK } from './constants';
// (Le miroir src/game/battle_transition.ts est chargé par la scène — import ici
//  = cycle ESM TDZ au boot froid, BG_SCREEN_SIZE before initialization.)
import { MUS_VS_WILD, MUS_VS_TRAINER } from '../../../include/constants/songs';
// Transitions (flash/Slice/WhiteBars/PokeballsTrail) : MIROIR src/game/
// battle_transition.ts, consommé via la surface __battleTransitionMirror
// (déplacement condition C — l'import statique du miroir = cycle TDZ).
type _TransitionMirror = {
  startBattleIntroFlash?: () => void; tickBattleIntroFlash?: () => boolean;
  startBattleTransitionSlice?: () => void; tickBattleTransitionSlice?: () => boolean;
  startBattleTransitionWhiteBarsFade?: () => void; tickBattleTransitionWhiteBarsFade?: () => boolean;
  startBattleTransitionPokeballsTrail?: () => void; tickBattleTransitionPokeballsTrail?: () => boolean;
  startBattleTransitionAngledWipes?: () => void; tickBattleTransitionAngledWipes?: () => boolean;
  startBattleTransitionBlur?: () => void; tickBattleTransitionBlur?: () => boolean;
};
function _transitionMirror(): _TransitionMirror {
  return ((globalThis as Record<string, unknown>).__battleTransitionMirror as _TransitionMirror) ?? {};
}
import { ENUM_B_1 as B_TRANSITION } from '../../../include/battle_transition';
import { ensureBallGfxLoaded, ensureBallParticlesLoaded } from '../../../harness/boot/intro-asset-loader';

// ─── Flag d'activation ──────────────────────────────────────────────────────

/** Flag `__USE_DECOMP_BATTLE_LOOP__` (défaut OFF). Quand ON, l'entrée combat
 *  boote la voie décomp au lieu de battle-flow inline. Façon
 *  `isControllerDispatchEnabled` / `isBytecodeDamageEnabled`. */
export function isDecompBattleLoopEnabled(): boolean {
  // Défaut OFF : voie V (battle-flow) jouable pendant la RECONSTRUCTION miroir 1:1 de
  // la voie L (A/B 2026-06-07 : voie L bootable mais bugs terrain/sprite/anim = ad-hoc
  // hérité de la voie V). Voie L testable via `__decompBattleLoop.enable()` ou `&`+`'`.
  return !!(globalThis as { __USE_DECOMP_BATTLE_LOOP__?: boolean }).__USE_DECOMP_BATTLE_LOOP__;
}

// ─── Lazy lookups (= éviter cycles ESM ; tout est exposé sur globalThis) ────

function _CB2_InitBattle(): (() => void) | null {
  const m = (globalThis as Record<string, unknown>).__battleInit as {
    CB2_InitBattle?: () => void;
  } | undefined;
  return m?.CB2_InitBattle ?? null;
}

function _SetUpBattleVarsAndBirchZigzagoon(): void {
  const m = (globalThis as Record<string, unknown>).__battleSetupHelpers as {
    SetUpBattleVarsAndBirchZigzagoon?: () => void;
  } | undefined;
  m?.SetUpBattleVarsAndBirchZigzagoon?.();
}

function _InitBattleControllers(): void {
  const m = (globalThis as Record<string, unknown>).__battleControllersInit as {
    InitBattleControllers?: () => void;
  } | undefined;
  m?.InitBattleControllers?.();
}

function _BattleMainCB1(): void {
  const m = (globalThis as Record<string, unknown>).__battleCB2 as {
    BattleMainCB1?: () => void;
  } | undefined;
  m?.BattleMainCB1?.();
}

/** 1:1 décomp `GetWildBattleTransition()` (battle_setup.c:790). Lazy via global
 *  (= pattern anti-cycle de ce module). Défaut SLICE si le helper n'est pas chargé. */
function _GetWildBattleTransition(): number {
  const m = (globalThis as Record<string, unknown>).__battleSetupHelpers as {
    GetWildBattleTransition?: () => number;
  } | undefined;
  const t = m?.GetWildBattleTransition?.();
  return (typeof t === 'number') ? t : B_TRANSITION.B_TRANSITION_SLICE;
}

function _getBattleMainFuncName(): string {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    getBattleMainFunc?: () => (() => void) | null;
  } | undefined;
  return m?.getBattleMainFunc?.()?.name ?? '(null)';
}

function _setMainSavedCallback(cb: (() => void) | null): void {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setMainSavedCallback?: (cb: (() => void) | null) => void;
  } | undefined;
  m?.setMainSavedCallback?.(cb);
}

// ─── Boot réel (in-game) ────────────────────────────────────────────────────

// ─── BGM de combat (1:1 décomp PlayBattleBGM/GetBattleBGM, pokemon.c:6394-6464) ─
/** Chanson OW sauvée avant le combat, pour la reprendre au retour. */
let _savedOwSong: number | null = null;

/** 1:1 décomp `GetBattleBGM()` (pokemon.c:6394) : BGM selon gBattleTypeFlags.
 *  Wild → MUS_VS_WILD ; dresseur/link → MUS_VS_TRAINER (défaut ; les variantes
 *  leader/champion par trainerClass = raffinement quand gTrainers sera câblé voie
 *  L). Branches légendaires (Kyogre/Groudon/Regi) omises tant que ces combats
 *  n'existent pas. */
function _getBattleBGM(): number {
  if (gBattleTypeFlags & (BATTLE_TYPE_TRAINER | BATTLE_TYPE_LINK)) return MUS_VS_TRAINER;
  return MUS_VS_WILD;
}

/** 1:1 décomp `PlayBattleBGM()` (pokemon.c:6459) : stop la musique OW (ResetMapMusic
 *  + m4aMPlayAllStop) puis joue la BGM de combat. On sauve d'abord la chanson OW
 *  courante pour la reprendre au retour. loop=true (1:1 voie V, markers .mid). */
function _playBattleBGM(): void {
  // Blindage (retour user « plus de sons » 2026-06-11) : si une etape throw
  // (getCurrentSongId sur etat audio pas pret ?), les suivantes tournent —
  // la BGM combat ne doit JAMAIS sauter en silence.
  try { _savedOwSong = getCurrentSongId(); } catch (e) { _savedOwSong = null; console.warn('[battle-bgm] getCurrentSongId KO', e); }
  try { m4aMPlayAllStop(); } catch (e) { console.warn('[battle-bgm] m4aMPlayAllStop KO', e); }
  try { m4aSongNumStart(_getBattleBGM(), true); } catch (e) { console.warn('[battle-bgm] m4aSongNumStart KO', e); }
}

/** 1:1 décomp `Task_BattleStart` (battle_setup.c) + `Task_BattleTransition`
 *  (battle_transition.c:1063) : la TRANSITION d'entrée tourne en callback2 AVANT
 *  CB2_InitBattle, puis bascule sur CB2_InitBattle quand elle est terminée.
 *
 *  PHASE 1 = flash gris RGB(11,11,11) 3 cycles (`startBattleIntroFlash`), PHASE 2 =
 *  Slice (`startBattleTransitionSlice`) qui découpe l'OW en bandes glissantes puis
 *  `FadeScreenBlack` (écran noir instant). Quand le slice est fini → l'OW a disparu,
 *  l'écran est noir → SetMainCallback2(CB2_InitBattle) (= 1:1 Task_BattleStart state 1 :
 *  IsBattleTransitionDone → CleanupOverworld + SetMainCallback2(CB2_InitBattle)).
 *
 *  Mirror EXACT du flow voie V (battle-flow.ts:2105-2131). Gaté in-game (returnToOverworld) :
 *  le harness boote CB2_InitBattle direct (pas d'OW à découper). */
function _makeBattleStartTransitionCB2(cb2InitBattle: () => void, transition: number): () => void {
  let state = 0;  // 0 = lance le flash, 1 = flash en cours, 2 = transition en cours
  // Dispatch 1:1 `CreateBattleStartTask(transition, …)` (battle_setup.c) : le flash gris
  // (CreateIntroTask) est COMMUN à toutes les transitions, puis la transition SÉLECTIONNÉE
  // s'exécute. PORTÉES : SLICE (ennemi < joueur) + WHITE_BARS_FADE (défaut zone normale,
  // = le cas du combat dev Treecko5/Poochyena5). Les autres (CAVE/WATER/FLASH : WAVE,
  // GRID_SQUARES, CLOCKWISE_WIPE, BLUR, RIPPLE) font un fallback gracieux SLICE + warn
  // (= chantier VISUEL/A/B restant). Le warn rend visible quelle transition le jeu veut.
  const m = _transitionMirror();
  let startTransition = m.startBattleTransitionSlice ?? ((): void => { /* miroir absent */ });
  let tickTransition = m.tickBattleTransitionSlice ?? ((): boolean => true);
  if (transition === B_TRANSITION.B_TRANSITION_WHITE_BARS_FADE && m.startBattleTransitionWhiteBarsFade && m.tickBattleTransitionWhiteBarsFade) {
    startTransition = m.startBattleTransitionWhiteBarsFade;
    tickTransition = m.tickBattleTransitionWhiteBarsFade;
  } else if (transition === B_TRANSITION.B_TRANSITION_POKEBALLS_TRAIL && m.startBattleTransitionPokeballsTrail && m.tickBattleTransitionPokeballsTrail) {
    startTransition = m.startBattleTransitionPokeballsTrail;
    tickTransition = m.tickBattleTransitionPokeballsTrail;
  } else if (transition === B_TRANSITION.B_TRANSITION_ANGLED_WIPES && m.startBattleTransitionAngledWipes && m.tickBattleTransitionAngledWipes) {
    startTransition = m.startBattleTransitionAngledWipes;
    tickTransition = m.tickBattleTransitionAngledWipes;
  } else if (transition === B_TRANSITION.B_TRANSITION_BLUR && m.startBattleTransitionBlur && m.tickBattleTransitionBlur) {
    startTransition = m.startBattleTransitionBlur;
    tickTransition = m.tickBattleTransitionBlur;
  } else if (transition !== B_TRANSITION.B_TRANSITION_SLICE && transition !== B_TRANSITION.B_TRANSITION_WHITE_BARS_FADE) {
    console.warn(`[decomp-loop] transition=${transition} non portée → fallback SLICE (visuel A/B à porter)`);
  }
  return function CB2_BattleStartTransition(): void {
    switch (state) {
      case 0:
        _transitionMirror().startBattleIntroFlash?.();
        state = 1;
        break;
      case 1:
        if (_transitionMirror().tickBattleIntroFlash?.() ?? true) {
          startTransition();
          state = 2;
        }
        break;
      case 2:
        if (tickTransition()) {
          // Transition terminée (écran noir via FadeScreenBlack) → boot du combat.
          getRuntime()?.SetMainCallback2?.(cb2InitBattle as never);
        }
        break;
    }
  };
}

/** Boote la voie décomp : pose `gMain.callback2 = CB2_InitBattle`. Le runtime
 *  déroule ensuite CB2_InitBattle → CB2_HandleStartBattle → BattleMainCB1/CB2.
 *  Suppose l'état combat (gBattleTypeFlags, gPlayerParty, gEnemyParty) déjà posé
 *  par le caller (= équivalent de BattleSetup_StartWildBattle côté setup data). */
let _animGfxPreloaded = false;
async function _ensureAnimSpriteGfx(): Promise<void> {
  if (_animGfxPreloaded) return;
  try {
    const { assetCache } = await import('../../../harness/runtime/decomp-globals');
    const { loadGbaPal } = await import('../../../harness/gba/png-loader');
    const loadBin = async (key: string, url: string) => {
      if (assetCache.has(key)) return;
      const resp = await fetch(url);
      assetCache.set(key, new Uint8Array(await resp.arrayBuffer()));
    };
    // les .4bpp.bin sont byte-exacts (convertisseur valide balls) — fetch direct.
    await loadBin('gAnimGfx_Impact', '/decomp/em/battle_anims/sprites/impact.4bpp.bin');
    if (!assetCache.has('gAnimPal_Impact')) assetCache.set('gAnimPal_Impact', await loadGbaPal('/decomp/em/battle_anims/sprites/impact.gbapal'));
    await loadBin('gAnimGfx_Scratch', '/decomp/em/battle_anims/sprites/scratch.4bpp.bin');
    if (!assetCache.has('gAnimPal_Scratch')) assetCache.set('gAnimPal_Scratch', await loadGbaPal('/decomp/em/battle_anims/sprites/scratch.gbapal'));
    await loadBin('gAnimGfx_NoiseLine', '/decomp/em/battle_anims/sprites/noise_line.4bpp.bin');
    if (!assetCache.has('gAnimPal_NoiseLine')) assetCache.set('gAnimPal_NoiseLine', await loadGbaPal('/decomp/em/battle_anims/sprites/noise_line.gbapal'));
    await loadBin('gAnimGfx_SmallEmber', '/decomp/em/battle_anims/sprites/small_ember.4bpp.bin');
    if (!assetCache.has('gAnimPal_SmallEmber')) assetCache.set('gAnimPal_SmallEmber', await loadGbaPal('/decomp/em/battle_anims/sprites/small_ember.gbapal'));
    await loadBin('gAnimGfx_Bubble', '/decomp/em/battle_anims/sprites/bubble.4bpp.bin');
    if (!assetCache.has('gAnimPal_Bubble')) assetCache.set('gAnimPal_Bubble', await loadGbaPal('/decomp/em/battle_anims/sprites/bubble.gbapal'));
    await loadBin('gAnimGfx_Orbs', '/decomp/em/battle_anims/sprites/orbs.4bpp.bin');
    if (!assetCache.has('gAnimPal_Orbs')) assetCache.set('gAnimPal_Orbs', await loadGbaPal('/decomp/em/battle_anims/sprites/orbs.gbapal'));
    await loadBin('gAnimGfx_GoldStars', '/decomp/em/battle_anims/sprites/gold_stars.4bpp.bin');
    if (!assetCache.has('gAnimPal_GoldStars')) assetCache.set('gAnimPal_GoldStars', await loadGbaPal('/decomp/em/battle_anims/sprites/gold_stars.gbapal'));
    await loadBin('gAnimGfx_MudSand', '/decomp/em/battle_anims/sprites/mud_sand_0.4bpp.bin');
    if (!assetCache.has('gAnimPal_MudSand')) assetCache.set('gAnimPal_MudSand', await loadGbaPal('/decomp/em/battle_anims/sprites/mud_sand_0.gbapal'));
    await loadBin('gAnimGfx_Leer', '/decomp/em/battle_anims/sprites/leer.4bpp.bin');
    if (!assetCache.has('gAnimPal_Leer')) assetCache.set('gAnimPal_Leer', await loadGbaPal('/decomp/em/battle_anims/sprites/leer.gbapal'));
    await loadBin('gAnimGfx_SharpTeeth', '/decomp/em/battle_anims/sprites/sharp_teeth.4bpp.bin');
    if (!assetCache.has('gAnimPal_SharpTeeth')) assetCache.set('gAnimPal_SharpTeeth', await loadGbaPal('/decomp/em/battle_anims/sprites/sharp_teeth.gbapal'));
    // PRELOAD TOTAL DES 289 GFX D'ANIM (fix « je vois presque aucun effet »,
    // user 2026-06-11) : le loader generique fetchait ASYNC au premier
    // loadspritegfx -> le sprite jouait AVANT l'arrivee de sa sheet (tiles
    // garbage/OW affichees, sheet arrivee trop tard). La decomp charge
    // SYNCHRONE (ROM mappee) -> on precharge TOUT au boot du combat
    // (~500KB local), chaque load devient synchrone comme en ROM.
    try {
      // DECOMP-DIRECT (directive user 2026-06-13 : « utiliser les palettes de
      // la décomp — le problème c'est nous, pas la décomp ») : précharge les
      // 289 tags depuis la table 1:1 gBattleAnimPicTable (par POSITION, recolors
      // croisés résolus) + les SOURCES png/.pal copiées AS-IS (sprites-src/),
      // décodées par png-loader = la même chaîne couleur que les mons/balls.
      // Remplace le manifest .bin/.gbapal intermédiaires (2 générations de
      // convertisseurs aux conventions divergentes : hit CYAN, mist ROSE).
      const [{ G_BATTLE_ANIM_PIC_TABLE }, pl] = await Promise.all([
        import('../decomp-data/src/battle_anim_pic_table-data'),
        import('../../../harness/gba/png-loader'),
      ]);
      const SRC = '/decomp/em/battle_anims/sprites-src/';
      await Promise.all(Object.entries(G_BATTLE_ANIM_PIC_TABLE).map(async ([tagValue, e]) => {
        const gfxKey = 'gAnimGfxTag_' + tagValue;
        const palKey = 'gAnimPalTag_' + tagValue;
        if (!assetCache.has(gfxKey)) {
          const [parts, pal] = await Promise.all([
            Promise.all(e.gfx.map((f) => pl.loadTileBin(SRC + f, 4))),
            e.pal
              ? (e.pal.endsWith('.pal')
                  ? pl.loadGbaPal(SRC + e.pal)
                  : pl.loadIndexedPngStrict(SRC + e.pal, 4).then((p) => p.palette))
              : Promise.resolve(null),
          ]);
          // concat (gfx multi-png .mk) + tronque/padde à size (octets ROM)
          let total = 0;
          for (const p of parts) total += p.length;
          let bin = new Uint8Array(Math.max(total, e.size));
          let off = 0;
          for (const p of parts) { bin.set(p, off); off += p.length; }
          if (bin.length > e.size) bin = bin.subarray(0, e.size);
          assetCache.set(gfxKey, bin);
          if (pal) assetCache.set(palKey, pal);
        }
      }));
      console.log('[decomp-loop] 289 anim gfx precharges DECOMP-DIRECT (sources png/pal, loads synchrones).');
    } catch (e) {
      console.warn('[decomp-loop] preload decomp-direct gfx:', e);
    }
    _animGfxPreloaded = true;
  } catch (e) {
    console.warn('[decomp-loop] anim sprite gfx preload:', e);
  }
}

export function bootDecompBattleLoop(returnToOverworld = false): void {
  // Side-effect modules (T3/T4) en DYNAMIQUE : un import statique provoquait
  // la TDZ ST_OAM_AFFINE_DOUBLE (cycle ESM via pokeball) -> l'app ne bootait
  // plus. Charges ici = poses avant tout usage en combat.
  // DEVTOOL chantier anims-de-move (2026-06-11) : tester l'anim d'un move
  // directement au menu, sans jouer le tour. Usage (console/harness) :
  //   await __testMoveAnim(33 /* MOVE_POUND */)  -> { ok, frames, residuels }
  // Joue DoMoveAnim(moveId) attacker 0 -> target 1, tick jusqu'a fin
  // (timeout 900 ticks), compte les sprites anim residuels (doit etre 0).
  // ─── VERIF FIDELITE 1:1 (qualification user 2026-06-11) : trace d'opcodes ──
  // __verifyMoveAnim(id) : joue le move en mode trace et rapporte les DEFAUTS
  // (sheet 0xFFFF, sprite/task non resolus, duree garde-fou, residuels).
  (globalThis as Record<string, unknown>).__verifyMoveAnim = async (moveId: number, attacker = 0, target = 1): Promise<unknown> => {
    const g = globalThis as Record<string, unknown>;
    g.__animVerifyMode = true;
    g.__animTrace = [];
    const r = await (g.__testMoveAnim as (m: number, a?: number, t?: number) => Promise<{ ok: boolean; frames: number; oamResiduels: unknown[]; monDeplace?: unknown }>)(moveId, attacker, target);
    g.__animVerifyMode = false;
    const trace = (g.__animTrace as Array<Record<string, unknown>>) ?? [];
    const defects: string[] = [];
    for (const e of trace) {
      if (e.op === 'load' && e.tileStart === 0xFFFF) defects.push(`sheet:${e.tag}`);
      if (e.op === 'sprite' && !e.resolved) defects.push(`sprite:${e.name}`);
      if (e.op === 'sprite' && e.resolved && e.cb === 'none' && (e.tileTag as number) > 0) defects.push(`cb-none:${e.name}`);
      if (e.op === 'task' && !e.resolved) defects.push(`task:${e.name}`);
    }
    if (r.frames >= 590) defects.push(`duree:${r.frames}`);
    if ((r.oamResiduels?.length ?? 0) > 0) defects.push(`residuels:${r.oamResiduels.length}`);
    const nSprites = trace.filter((e) => e.op === 'sprite').length;
    const nTasks = trace.filter((e) => e.op === 'task').length;
    return { moveId, ok: r.ok, frames: r.frames, nSprites, nTasks, defects, fidele: defects.length === 0 };
  };
  // Le sweep complet : tous les moves -> classement par defaut.
  (globalThis as Record<string, unknown>).__fidelitySweep = async (ids: number[]): Promise<unknown> => {
    const g = globalThis as Record<string, unknown>;
    const verify = g.__verifyMoveAnim as (m: number) => Promise<{ moveId: number; frames: number; defects: string[]; fidele: boolean }>;
    const out: Array<{ moveId: number; frames: number; defects: string[]; fidele: boolean }> = [];
    for (const id of ids) {
      try { out.push(await verify(id)); }
      catch (e) { out.push({ moveId: id, frames: -1, defects: ['EXC:' + String(e).slice(0, 60)], fidele: false }); }
    }
    g.__fidelityResults = out;
    const parDefaut: Record<string, number[]> = {};
    for (const r of out) {
      for (const d of r.defects) {
        const k = d.split(':')[0] + ':' + (d.split(':')[1] ?? '');
        (parDefaut[k] ??= []).push(r.moveId);
      }
    }
    return { total: out.length, fideles: out.filter((r) => r.fidele).length, parDefaut };
  };
  (globalThis as Record<string, unknown>).__testMoveAnim = async (moveId: number, attacker = 0, target = 1): Promise<unknown> => {
    const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as {
      setBattleAnimAttackerTarget?: (a: number, t: number) => void;
      DoMoveAnim?: (m: number) => void;
      tickAnimScript?: () => void;
      isAnimScriptActive?: () => boolean;
    } | undefined;
    if (!itf?.DoMoveAnim) return { ok: false, err: 'interpreter absent (boot un combat d abord)' };
    const rt = (globalThis as Record<string, unknown>).__rt as {
      gSprites?: Array<{ callback?: { name?: string } | null } | undefined>;
      gba?: { oam?: Array<{ visible?: boolean; tileId?: number; x?: number; y?: number }> };
    } | undefined;
    // SNAPSHOT OAM avant (regle user « rien ne doit rester affiche » : le
    // critere = AUCUN NOUVEAU OAM visible apres l'anim vs avant).
    const visAvant = new Set<number>();
    const tasksAvant = new Set<number>((rt as { gTasks?: unknown[] } | undefined)?.gTasks?.keys() ?? []);
    rt?.gba?.oam?.forEach((o, i) => { if (o.visible) visAvant.add(i); });
    // snapshot des BATTLERS (retour user : des moves deplacent le mon) :
    // position/flips identiques apres l'anim, sinon monDeplace signale.
    const co2 = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
    const monAvant: Array<{ id: number; x: number; y: number; x2: number; y2: number; hFlip: boolean }> = [];
    for (let b = 0; b < 2; b++) {
      const id = co2?.getBattlerMonSpriteId?.(b);
      const sp = id !== undefined && id >= 0 ? rt?.gSprites?.[id] as { x?: number; y?: number; x2?: number; y2?: number; hFlip?: boolean } | undefined : undefined;
      if (sp) monAvant.push({ id: id as number, x: sp.x ?? 0, y: sp.y ?? 0, x2: sp.x2 ?? 0, y2: sp.y2 ?? 0, hFlip: !!sp.hFlip });
    }
    itf.DoMoveAnim(moveId);
    // APRES DoMoveAnim (qui ecrase avec gBattlerAttacker/Target du tour —
    // 0/0 hors tour = l'anim se jouait SUR NOTRE MON, retour user « tu
    // t'attaques toi-meme » 2026-06-11). Les Cmd lisent gBattleAnim* aux
    // ticks -> poser ici = correct.
    itf.setBattleAnimAttackerTarget?.(attacker, target);
    let frames = 0;
    // 1 tick = 1 VRAIE frame (les AnimTasks sont tickees par runOneFrame — le
    // spam de ticks faisait timeout les anims dependant de tasks a N frames
    // reelles : faux rouges ABSORB/SMOG, fix 2026-06-11).
    while ((itf.isAnimScriptActive?.() ?? false) && frames < 1800) {
      itf.tickAnimScript?.();
      frames++;
      await new Promise(r => setTimeout(r, 0));
    }
    // CLEANUP SYSTEMIQUE (2026-06-11 v2) : tuer TOUTE task creee PENDANT le
    // move et encore vivante (diff de taskIds — robuste aux noms, les steps
    // `_Blend*` underscores echappaient au filtre par nom -> zombies cumules,
    // chaque move suivant partait au garde-fou 600f en cascade).
    {
      try {
        if (frames >= 590) (itf as { forceFinishAnim?: () => void }).forceFinishAnim?.();
        const gT = (rt as { gTasks?: { func?: { name?: string } }[] } | undefined)?.gTasks;
        const dT = (rt as { DestroyTask?: (id: number) => void } | undefined)?.DestroyTask;
        if (gT && dT) {
          for (const [tid, t] of gT.entries()) {
            if (!tasksAvant.has(tid)) {
              const n = t.func?.name ?? '';
              // epargner les tasks systeme legitimes (cry, healthbox...)
              if (!/Cry|Health|Intro|SlideIn/i.test(n)) { try { dT(tid); } catch { /* morte */ } }
            }
          }
        }
        // re-zero le compteur anim (les zombies l'avaient gonfle)
        (itf as { forceFinishAnim?: () => void }).forceFinishAnim?.();
      } catch { /* best effort */ }
    }
    // laisser 30 frames de jeu (les sprites a vie propre finissent)
    await new Promise(r => setTimeout(r, 600));
    const residuels: string[] = [];
    for (let _si = 0; _si < MAX_SPRITES; _si++) {
      const sp = rt?.gSprites?.[_si];
      if (sp === undefined) continue;
      const n = sp.callback?.name ?? '';
      if (/Anim|Splat|Scratch|Noise|Ember|Orb|Translate|Shiny|Dirt|Leer/i.test(n)) residuels.push('cb:' + n);
    }
    const oamResiduels: string[] = [];
    rt?.gba?.oam?.forEach((o, i) => {
      if (o.visible && !visAvant.has(i)) oamResiduels.push(`oam${i}@${o.x},${o.y} tile${o.tileId}`);
    });
    // CLEANUP du test (2026-06-11) : un sprite d'anim peut survivre si un
    // controller ecrase son callback via un spriteId PERIME (vu : dirt slot 3
    // -> SpriteCallbackDummy -> orphelin affiche ; DETTE : trouver l'ecraseur).
    // On detruit tout sprite d'anim encore lie a une sheet de tag anim (tile
    // >= reserve 0x140) qui n'etait pas visible avant — le test reste fiable.
    if (rt?.gSprites) {
      for (let id = 0; id < MAX_SPRITES; id++) {
        const sp = rt.gSprites[id];
        if (sp === undefined) continue;
        const oamIdx = (sp as { oamIndex?: number }).oamIndex;
        const o = oamIdx !== undefined ? rt.gba?.oam?.[oamIdx] : undefined;
        if (o?.visible && !visAvant.has(oamIdx as number) && (o.tileId ?? 0) >= 0x140) {
          try { DestroySprite(id); } catch { /* deja mort */ }
        }
      }
    }
    const monDeplace: string[] = [];
    for (const m of monAvant) {
      const sp = rt?.gSprites?.[m.id] as { x?: number; y?: number; x2?: number; y2?: number; hFlip?: boolean } | undefined;
      if (!sp) { monDeplace.push(`mon${m.id} DETRUIT`); continue; }
      if ((sp.x ?? 0) !== m.x || (sp.y ?? 0) !== m.y || (sp.x2 ?? 0) !== m.x2 || (sp.y2 ?? 0) !== m.y2 || !!sp.hFlip !== m.hFlip) {
        monDeplace.push(`mon${m.id} x:${m.x}->${sp.x} y:${m.y}->${sp.y} x2:${m.x2}->${sp.x2} y2:${m.y2}->${sp.y2} flip:${m.hFlip}->${!!sp.hFlip}`);
      }
    }
    return { ok: frames < 1800, frames, residuels, oamResiduels, monDeplace };
  };

  // FIX user 2026-06-11 (« ton dernier a casse nos barres de PV ») : nos
  // healthbox/mons utilisent des tiles OBJ FIXES (0..~300) SANS marquer le
  // bitmap d'allocation -> les sheets d'anim par tag (AllocSpriteTiles)
  // s'allouaient PAR-DESSUS (scratch.png ecrasait le panneau nom de la box).
  // Reserve 1:1-mecanisme (gReservedSpriteTileCount, cf. pokemon_storage 0x280):
  // l'allocateur scanne a partir de 0x140 -> zone fixe intouchable.
  (globalThis as Record<string, unknown>).gReservedSpriteTileCount = 0x140;
  void Promise.all([
    import('../../battle_anim_mon_movement'),  // registry AnimTask/templates (T4)
    import('../../battle_anim_normal'),        // registry hitsplat + gfx IMPACT (T4)
    import('../../battle_anim_effects_3'),     // registry scratch + noise lines (T4)
    import('../../battle_anim_sound_tasks'),   // registry sound tasks Growl (T4)
    import('../../battle_anim_fire'),           // registry Ember + projectile generique (T4)
    import('../../battle_anim_water'),          // registry Bubble (T4)
    import('../../battle_anim_effects_1'),      // registry Absorb orbs (T4)
    import('../../battle_anim_ground'),          // registry Sand-Attack (C1b)
    import('../../battle_anim_dark'),             // registry Bite crocs (micro-vague)
    import('./battle-anim-generated-bridge'),           // PHASE 1a : donnees generees (387 tpl)
    import('../../battle_anim_rock'),               // vague 2c : vortex
    import('../../battle_anim_utility_funcs'),       // vague 2e : BlendBattleAnimPal (89 usages)
    import('../../battle_anim_fight'),                // vague 3h : poings/pieds
    import('../../battle_anim_electric'),                 // port massif 2026-06-11
    import('../../battle_anim_ice'),                 // port massif 2026-06-11
    import('../../battle_anim_poison'),                 // port massif 2026-06-11
    import('../../battle_anim_bug'),                 // port massif 2026-06-11
    import('../../battle_anim_psychic'),                 // port massif 2026-06-11
    import('../../battle_anim_ghost'),                 // port massif 2026-06-11
    import('../../battle_anim_dragon'),                 // port massif 2026-06-11
    import('../../battle_anim_effects_1b'),             // port massif (musique/fingers)
    import('../../battle_anim_flying'),                  // port massif (vols)
    import('../../battle_anim_effects_2'),               // port massif (38 callbacks)
    import('../../battle_anim_smokescreen'),             // F50 (SmokescreenImpact)
    import('../../battle_gfx_sfx_util'),       // surface __battleGfxSfxUtil (statut T3)
  ]).catch((e) => console.warn('[decomp-loop] side-effect anim modules:', e));
  void _ensureAnimSpriteGfx();
  const cb = _CB2_InitBattle();
  if (!cb) {
    console.warn('[decomp-loop] CB2_InitBattle indisponible (battle-init pas chargé)');
    return;
  }
  // Reset la couche healthbox voie-L (gHealthboxSpriteIds + _hbInitState) AU DÉBUT du
  // boot — AVANT CB2_InitBattle → AVANT _BattleInitAllSprites (case 18) qui (re)crée le
  // healthbox. (Mettre ce reset dans BattleStartClearSetData échouait : il tourne APRÈS
  // case 18, donc il effaçait les ids que la création ASYNC venait de poser = course.)
  (globalThis as { __battleHealthbox?: { resetHealthboxL?: () => void } }).__battleHealthbox?.resetHealthboxL?.();
  // Précharge le gfx de la Poke Ball (gBallGfx_Poke/gBallPal_Poke/gOpenPokeballGfx) dans assetCache
  // pour CHAQUE combat. Sinon LoadBallGfx (pokeball.c:1309, résolu SYNC via getAsset) échoue hors
  // flux Birch (assetCache miss → ball tileId 0 + palette bank noire = garble "Tetris" signalé user).
  // Async, mais terminé bien avant le send-out (~250f après le boot, > la latence de fetch). 1:1 : la
  // décomp a gBallGfx_Poke en ROM (toujours dispo) ; ici on précharge dans notre cache équivalent.
  void ensureBallGfxLoaded();
  // Précharge AUSSI les étincelles d'ouverture de ball (gBattleAnimSpriteGfx/Pal_Particles) dans
  // assetCache pour CHAQUE combat. AnimateBallOpenParticles (pokeball.ts SpriteCB_ReleaseMonFromBall)
  // les résout SYNC via getAsset ; hors flux Birch elles manquaient (console "Particles not in cache")
  // → 0 étincelle au send-out (#5). Même mécanisme/raison que ensureBallGfxLoaded.
  void ensureBallParticlesLoaded();
  // RETOUR OW : ReturnFromBattleToOverworld (battle_main.c:5249) fait
  // `SetMainCallback2(gMain.savedCallback)`. Lancée hors encounter (touche dev '),
  // la voie L n'a PAS de savedCallback posé → à la fin du combat, la boucle reste
  // affichée = FREEZE (pas de retour OW, signalé user). On pose un CB2 de retour qui
  // re-init le field via `_restoreOverworldFromMenu` (= 1:1 CB2_ReturnToField, ce que
  // fait aussi battle-flow voie V au cleanup : re-load tilesets/palettes/sprites OW
  // après le VRAM wipe du combat). One-shot (le restore réétablit le rendu OW).
  // ⚠️ returnToOverworld DÉFAUT false → le harness (probe jetable qui restaure ses
  // propres callbacks + break à ReturnFromBattleToOverworld) n'est PAS affecté.
  if (returnToOverworld) {
    // 1:1 décomp `BattleSetup_StartWildBattle` → `PlayBattleBGM()` AVANT la transition :
    // stop la musique OW + joue la BGM de combat (loop). Gaté sur le boot IN-GAME
    // (dev `'` / vraies rencontres) ; les probes harness (returnToOverworld=false) ne
    // jouent pas de musique. Reprise OW au retour (ci-dessous).
    _playBattleBGM();
    let restored = false;
    _setMainSavedCallback(() => {
      if (restored) return;
      restored = true;
      // 1:1 decomp CB2_EndWildBattle/CB2_EndTrainerBattle (battle_setup.c:614/1327) :
      // defaite (B_OUTCOME_LOST=2) ou nul (DREW=3) -> CB2_WhiteOut (overworld.c) ->
      // DoWhiteOut (overworld.c:358) : RunScriptImmediately(EventScript_WhiteOut) +
      // SetMoney(money/2) + HealPlayerParty() + Overworld_ResetStateAfterWhiteOut() +
      // SetWarpDestinationToLastHealLocation() + WarpIntoMap().
      // Port : money/2 + heal directs ici ; le WARP de respawn (vers le dernier Centre)
      // est pose comme pending warp dans le .then() du restore (= MainCB2_Overworld le
      // consomme au frame suivant). isWhiteout gate ce warp (PAS sur victoire).
      let isWhiteout = false;
      try {
        const oc = (globalThis as { __battleState?: { getBattleOutcome?: () => number } }).__battleState?.getBattleOutcome?.() ?? 0;
        isWhiteout = (oc === 2 || oc === 3);
        if (isWhiteout) {
          const sb1 = (globalThis as Record<string, unknown>).gSaveBlock1 as { money?: number } | undefined;
          if (sb1 && typeof sb1.money === 'number') sb1.money = Math.floor(sb1.money / 2);
          // 1:1 décomp `HealPlayerParty()` : soigne l'équipe (PV/PP/statuts). ⚠️ FIX : l'ancien
          // appel `__specials.HealPlayerParty()` était un NO-OP (__specials jamais exposé sur
          // globalThis) → l'équipe N'ÉTAIT PAS soignée au whiteout. invokeSpecial dispatch le
          // handler 1:1 enregistré (le MÊME que `special HealPlayerParty` de la nurse).
          void import('../../scrcmd').then((m) => {
            try { m.invokeSpecial('HealPlayerParty'); } catch (e) { console.warn('[whiteout] heal KO', e); }
          });
          void import('../../script').then((m) => {
            // EventScript_WhiteOut (event_scripts.s:584) = reset Elite Four + Mr Briney
            // (PAS le warp ; le warp est fait en C par DoWhiteOut, porté ci-dessous).
            try { m.RunScriptImmediately('EventScript_WhiteOut'); } catch (e) { console.warn('[whiteout] script reset KO', e); }
          });
        }
      } catch (e) { console.warn('[whiteout] net-effect KO', e); }
      const restore = (globalThis as Record<string, unknown>)._restoreOverworldFromMenu as (() => Promise<void>) | undefined;
      if (typeof restore === 'function') {
        // Reprend la BGM OW (sauvée par _playBattleBGM) après le re-init du field
        // (= 1:1 décomp CB2_ReturnToField → Overworld_PlaySpecialMapMusic).
        restore()
          .then(() => {
            // 1:1 décomp `DoWhiteOut` (overworld.c:364-365) : SetWarpDestinationToLastHealLocation()
            // + WarpIntoMap() → warp vers le DERNIER CENTRE (respawnLocation, posé par setrespawn à
            // l'entrée du Centre). Le port résout respawnLocation (string) → heal location (map,x,y)
            // via la table heal_location → pending warp, consommé par MainCB2_Overworld au frame
            // suivant (= même mécanisme que Téléport). Sans ça : perdre → soigné mais reste sur place.
            if (isWhiteout) {
              void Promise.all([
                import('../../heal_location'),
                import('../field/warp-system'),
                import('../save/save-block-state'),
                import('../../overworld'),
              ]).then(([hl, ws, sb, ow]) => {
                // 1:1 décomp `Overworld_ResetStateAfterWhiteOut()` (DoWhiteOut, AVANT le warp) :
                // remet l'avatar à pied + coupe surf/strength/flash/vélo (sinon respawn en surfant).
                ow.Overworld_ResetStateAfterWhiteOut();
                const respawn = (sb.gSaveBlock1Ptr as { respawnLocation?: string }).respawnLocation;
                const heal = hl.GetHealLocationByName(respawn);
                if (heal) {
                  ws.setPendingWarp({ destMap: heal.map, x: heal.x, y: heal.y, elevation: 0, warpId: -1 }, 'step');
                  console.log(`[whiteout] respawn warp → ${heal.map} (${heal.x},${heal.y})`);
                } else {
                  console.warn('[whiteout] respawnLocation non résolue:', respawn);
                }
              });
            }
            // 1:1 décomp `FieldCB_ReturnToFieldNoScriptCheckMusic` (field_screen_effect.c:463),
            // lancé par `CB2_EndWildBattle` (battle_setup.c:614) via gFieldCallback →
            // `RunFieldCallback` au case 2 de `ReturnToFieldLocal` (overworld.c) :
            //   1) `Overworld_PlaySpecialMapMusic()` → reprise BGM OW (ci-dessous).
            //   2) `FadeInFromBlack()` (field_screen_effect.c:95) = `FillPalBufferBlack()` +
            //      `FadeScreen(FADE_FROM_BLACK, 0)` → fondu DEPUIS le noir laissé par
            //      `BeginFastPaletteFade(3)` en fin de combat (HandleEndTurn_FinishBattle).
            //   Sans ça, `_restoreOverworldFromMenu` a réécrit gPlttBufferFaded en couleurs
            //   vives (LoadMapTilesetPalettes) → la 1re frame MainCB2_Overworld les flush =
            //   POP instantané. Le fade ici = ordre 1:1 (musique PUIS FadeInFromBlack).
            // ⚠️ SPÉCIFIQUE au retour COMBAT : PAS dans `_restoreOverworldFromMenu` (partagé
            //   bag/option-menu qui, 1:1 décomp, n'ont PAS de fade-in). Pattern identique aux
            //   chemins resume (TestOverworldScene:436-442) / warp.
            if (_savedOwSong) m4aSongNumStart(_savedOwSong, true);
            const r = getRuntime();
            if (r) {
              FillPalBufferBlack();
              r.gPlttBufferFaded.flushTo();
              r.gPaletteFade.bufferTransferDisabled = false;
              FadeScreen(FADE_FROM_BLACK, 0);
            }
          })
          .catch((e) => console.error('[decomp-loop] _restoreOverworldFromMenu THREW:', e));
      } else {
        console.warn('[decomp-loop] retour OW : _restoreOverworldFromMenu non exposé — combat sans retour');
      }
    });
    // 1:1 décomp : wild → CreateBattleStartTask(GetWildBattleTransition()) (battle_setup.c:414) ;
    // dresseur → CreateBattleStartTask(GetTrainerBattleTransition()) (DoTrainerBattle :461).
    // La transition d'entrée tourne AVANT CB2_InitBattle ; fallback SLICE pour les
    // visuels pas encore portés. Le harness (returnToOverworld=false) boote direct.
    const isTrainer = (gBattleTypeFlags & BATTLE_TYPE_TRAINER) !== 0;
    const helpers = (globalThis as Record<string, unknown>).__battleSetupHelpers as {
      GetTrainerBattleTransition?: () => number;
    } | undefined;
    const transition = (isTrainer && helpers?.GetTrainerBattleTransition)
      ? helpers.GetTrainerBattleTransition()
      : _GetWildBattleTransition();
    getRuntime()?.SetMainCallback2?.(_makeBattleStartTransitionCB2(cb, transition) as never);
    return;
  }
  getRuntime()?.SetMainCallback2?.(cb as never);
}

// ─── Harness de vérification déterministe ───────────────────────────────────

interface DecompLoopFrame {
  f: number;
  cb2: string;
  cb1: string;
  mainFunc: string;
  execFlags: number;
  ctrl0: string;
  ctrl1: string;
}

interface DecompLoopHarnessResult {
  frames: DecompLoopFrame[];
  reachedActionMenu: boolean;
  crashed: boolean;
  error: string | null;
  finalMainFunc: string;
  framesRun: number;
}

/** Vérif déterministe P0 : tick `callback1()` PUIS `callback2()` à la main
 *  (= mime CallCallbacks runtime), N frames, et enregistre la progression de
 *  `gBattleMainFunc`. Boote via callback2 = CB2_InitBattle. Suppose un état
 *  combat valide déjà en place (lancer un combat normal avant, puis appeler).
 *
 *  Succès P0 = `gBattleMainFunc` walk BeginBattleIntro → intro states →
 *  TryDoEventsBeforeFirstTurn → `_HandleTurnActionSelectionStateStub` (la
 *  frontière du menu d'action) SANS crash.
 *
 *  ⚠️ Mute la progression de l'état combat partagé (BattleStartClearSetData) —
 *  à n'utiliser que comme probe jetable (reload après). */
export function harnessRunDecompLoop(maxFrames = 1200): DecompLoopHarnessResult {
  const rt = getRuntime();
  const frames: DecompLoopFrame[] = [];
  let crashed = false;
  let error: string | null = null;
  let reachedActionMenu = false;

  if (!rt) {
    return {
      frames, reachedActionMenu: false, crashed: true,
      error: 'runtime indisponible', finalMainFunc: '(null)', framesRun: 0,
    };
  }

  // Sauvegarde les callbacks runtime AVANT de booter la voie décomp, pour les
  // RESTAURER en sortie : le harness est un probe jetable, il ne doit PAS laisser
  // le runtime piloté par la boucle décomp (= écran noir, car le rendu est encore
  // sur la voie V). Sans ça, après un run de harness l'écran reste noir.
  const _gmain = rt.gMain as { callback1?: unknown; callback2?: unknown };
  const _savedCb1 = _gmain.callback1;
  const _savedCb2 = _gmain.callback2;

  // Boot : callback2 = CB2_InitBattle.
  bootDecompBattleLoop();

  let f = 0;
  for (; f < maxFrames; f++) {
    try {
      const g = rt.gMain as { callback1?: ((rt: unknown) => void) | null; callback2?: ((rt: unknown) => void) | null };
      if (g.callback1) g.callback1(rt);
      if (g.callback2) g.callback2(rt);
    } catch (e) {
      crashed = true;
      error = `frame ${f} (${_getBattleMainFuncName()}): ${(e as Error)?.message ?? String(e)}`;
      break;
    }

    const g = rt.gMain as { callback1?: { name?: string } | null; callback2?: { name?: string } | null };
    const mainFunc = _getBattleMainFuncName();
    // N'enregistre que les frames "intéressantes" (changement) pour limiter le bruit.
    const prev = frames[frames.length - 1];
    const frame: DecompLoopFrame = {
      f,
      cb2: g.callback2?.name ?? '(null)',
      cb1: g.callback1?.name ?? '(null)',
      mainFunc,
      execFlags: gBattleControllerExecFlags,
      ctrl0: getBattlerControllerFunc(0)?.name ?? '(null)',
      ctrl1: getBattlerControllerFunc(1)?.name ?? '(null)',
    };
    if (!prev || prev.mainFunc !== frame.mainFunc || prev.cb2 !== frame.cb2
        || prev.execFlags !== frame.execFlags || prev.ctrl0 !== frame.ctrl0
        || prev.ctrl1 !== frame.ctrl1) {
      frames.push(frame);
    }

    // Menu VIVANT = gBattleMainFunc à HandleTurnActionSelectionState ET le
    // controller joueur a installé un handler d'input (HandleInputChooseAction /
    // HandleChooseActionAfterDma3) = la sélection d'action attend l'input.
    const ctrl0Now = getBattlerControllerFunc(0)?.name ?? '';
    if ((mainFunc === 'HandleTurnActionSelectionState' && /^Handle(Input|Choose)/.test(ctrl0Now))
        || mainFunc === '_HandleTurnActionSelectionStateStub') {
      reachedActionMenu = true;
      break;
    }
  }

  // Restaure les callbacks runtime (= le rendu V reprend la main, pas d'écran
  // noir post-harness). L'état combat scratch reste muté par le test → reload
  // conseillé avant de rejouer, mais au moins l'écran n'est pas figé en noir.
  _gmain.callback1 = _savedCb1;
  _gmain.callback2 = _savedCb2;

  return {
    frames, reachedActionMenu, crashed, error,
    finalMainFunc: _getBattleMainFuncName(), framesRun: f,
  };
}

// ─── Harness P2 : pilote un tour en SIMULANT l'input joueur ────────────────

interface DriveTurnResult {
  frames: string[];
  actionPicked: boolean;
  movePicked: boolean;
  reachedExec: boolean;
  crashed: boolean;
  error: string | null;
  finalMainFunc: string;
  framesRun: number;
}

/** Vérif déterministe P2 : boote la voie décomp + injecte gMain.newKeys = A_BUTTON
 *  sur le menu d'action (cursor 0 = ATTAQUE/USE_MOVE), et s'arrête quand le
 *  sous-menu de MOVES est atteint (HandleInputChooseMove installé). Prouve la
 *  chaîne sélection : menu action → A → EmitChooseAction/Move → sous-menu moves,
 *  1:1, SANS exécuter le script du move (qui attend des timers texte async non
 *  résolubles dans une boucle synchrone → freeze). Restaure les callbacks.
 *
 *  ⚠️ À lancer APRÈS un combat V (gBattleMons peuplé), reload après. */
export function harnessDriveTurn(maxFrames = 300, injectInput = false): DriveTurnResult {
  const A_BUTTON = 1 << 0;
  const rt = getRuntime();
  const frames: string[] = [];
  let crashed = false, error: string | null = null;
  let actionPicked = false, movePicked = false, reachedExec = false;

  if (!rt) {
    return { frames, actionPicked, movePicked, reachedExec, crashed: true,
      error: 'runtime indisponible', finalMainFunc: '(null)', framesRun: 0 };
  }

  const gm = rt.gMain as { newKeys?: number; callback1?: ((rt: unknown) => void) | null; callback2?: ((rt: unknown) => void) | null };
  const savedCb1 = gm.callback1, savedCb2 = gm.callback2, savedKeys = gm.newKeys;

  bootDecompBattleLoop();

  let pending = 0;
  let prevLine = '';
  let f = 0;
  for (; f < maxFrames; f++) {
    gm.newKeys = pending;                       // injecte l'input AVANT le tick
    try {
      if (gm.callback1) gm.callback1(rt);
      if (gm.callback2) gm.callback2(rt);
    } catch (e) {
      crashed = true;
      error = `frame ${f} (${_getBattleMainFuncName()}): ${(e as Error)?.message ?? String(e)}`;
      break;
    }
    gm.newKeys = 0;                             // edge : l'appui ne dure qu'1 frame
    pending = 0;

    const ctrl0 = getBattlerControllerFunc(0)?.name ?? '';
    const mf = _getBattleMainFuncName();
    const line = `mf=${mf} ex=${gBattleControllerExecFlags} c0=${ctrl0}`;
    if (line !== prevLine) { frames.push(`f${f} ${line}`); prevLine = line; }

    if (!injectInput) {
      // MODE SÛR (défaut) : vérifie juste que le menu d'action est ATTEINT
      // (input handler installé), puis STOP. NE touche PAS à l'input : un tick
      // SYNCHRONE post-input gèle le thread (boucle within-frame qui attend un
      // timer texte `setTimeout`, lequel ne peut pas s'exécuter pendant une
      // boucle synchrone). La vérif input/tour réelle = frame-loop ASYNC.
      if (/^Handle(Input|Choose)/.test(ctrl0)) { reachedExec = true; break; }
      continue;
    }

    // MODE INPUT (injectInput=true) — ⚠️ GÈLE actuellement : boucle within-frame
    // dans la réponse à l'appui A. À ne réactiver qu'après diagnostic de la boucle.
    if (ctrl0 === 'HandleInputChooseAction' && !actionPicked) { pending = A_BUTTON; actionPicked = true; }
    if (actionPicked && ctrl0 === 'HandleInputChooseMove') {
      movePicked = true;
      reachedExec = true;
      break;
    }
  }

  gm.callback1 = savedCb1; gm.callback2 = savedCb2; gm.newKeys = savedKeys;

  return { frames, actionPicked, movePicked, reachedExec, crashed, error,
    finalMainFunc: _getBattleMainFuncName(), framesRun: f };
}

// ─── Harness P2 : EXÉCUTION D'UN TOUR via la voie L (ASYNC, anti-freeze) ────

interface ExecuteTurnLResult {
  ok: boolean;
  reason?: string;
  moveSlot0: number;          // ID numérique du move réellement utilisé (gBattleMons[0].moves[0])
  enemySpecies: string;
  hpBefore: number;
  hpAfter: number;
  damage: number;
  framesRun: number;
  reachedEnd: boolean;        // gCurrentTurnActionNumber >= gBattlersCount
  finalActionFuncId: number;
  finalScriptPtr: number;
  transitions: string[];      // log des changements (action/turn/execFlags/scriptPtr/HP)
  messages: string[];         // textes affichés observés (B_WIN_MSG)
  recentOpcodes: string[];    // dernières commandes exécutées (ring buffer)
  maxMoveDamage: number;      // diag : max gBattleMoveDamage observé
  lastResultFlags: number;    // diag : dernier gMoveResultFlags non nul
  expGain: number;            // diag : gain d'EXP gBattleMons[0] (barre) sur le tour
  partyExpGain: number;       // diag : gain d'EXP gPlayerParty[0] (= où getexp dépose)
  lvlBefore: number;
  lvlAfter: number;
  partyLvlAfter: number;
  gBattleOutcome: number;     // 0/WON(1)/LOST(2)/…
}

/** Vérif P2 du MODÈLE D'EXÉCUTION DU TOUR 1:1 (pièces 1+2+3a), en frame-loop
 *  ASYNC (= jamais de freeze : 1 tick logique puis `await sleep`, donc les
 *  timers texte `setTimeout` de BattlePutTextOnWindow peuvent s'exécuter).
 *
 *  Monte un combat ad-hoc (createPokemonInstance + fillActiveBattleMonsForBattleStart),
 *  installe les controllers Player/Opponent, pose un tour `[USE_MOVE, FINISHED]`
 *  (= isole le move du JOUEUR), puis tick RunTurnActionsFunctions + controllers
 *  1×/frame. Prouve : le script déroule commande/commande (scriptPtr avance par
 *  frame), se bloque sur le texte (execFlags!=0 → scriptPtr figé pendant l'affichage),
 *  applique les dégâts (gBattleMons[1].hp baisse), et atteint
 *  Cmd_end → TRY_FINISH → ActionFinished (fin de tour).
 *
 *  ⚠️ Mute l'état combat partagé (probe jetable). N'injecte AUCUN input clavier
 *  (pas de gMain.newKeys) → ne touche pas au rendu V. */
export async function harnessExecuteTurnL(opts?: {
  playerSpecies?: string;
  playerLevel?: number;
  forceMoveNum?: number;      // ID NUMÉRIQUE de move forcé au slot 0 (post-fill) ; sinon moves naturels.
  forceEnemyMoveNum?: number; // idem pour l'ENNEMI (slot 0) ; utile pour scénarios déterministes (ex. défaite joueur).
  enemySpecies?: string;
  enemyLevel?: number;
  bothTurns?: boolean;        // true = [USE_MOVE, USE_MOVE] (tour ennemi inclus, peut bloquer sur CompleteOnHealthbarDone)
  runToTurnEnd?: boolean;     // true = continue APRÈS les actions du tour, jusqu'à BattleTurnPassed (poison/burn/météo) + le menu suivant. Pour tester les effets de FIN DE TOUR.
  playerStatus1?: number;     // injecte gBattleMons[0].status1 (ex. STATUS1_BURN=0x10, POISON=0x08) après le setup, pour tester les effets de statut.
  enemyStatus1?: number;      // idem gBattleMons[1].status1.
  playerHp?: number;          // injecte gBattleMons[0].hp après le setup (ex. PV bas pour tester drain/heal).
  enemyHp?: number;           // idem gBattleMons[1].hp.
  maxFrames?: number;
  frameDelayMs?: number;
}): Promise<ExecuteTurnLResult> {
  const playerSpecies = opts?.playerSpecies ?? 'SPECIES_TREECKO';
  const playerLevel = opts?.playerLevel ?? 10;
  const enemySpecies = opts?.enemySpecies ?? 'SPECIES_POOCHYENA';
  const enemyLevel = opts?.enemyLevel ?? 3;
  const maxFrames = opts?.maxFrames ?? 2000;
  const frameDelayMs = opts?.frameDelayMs ?? 4;

  const fail = (reason: string): ExecuteTurnLResult => ({
    ok: false, reason, moveSlot0: -1, enemySpecies, hpBefore: 0, hpAfter: 0, damage: 0,
    framesRun: 0, reachedEnd: false, finalActionFuncId: -1, finalScriptPtr: -1,
    transitions: [], messages: [], recentOpcodes: [], maxMoveDamage: 0, lastResultFlags: 0,
    expGain: 0, partyExpGain: 0, lvlBefore: 0, lvlAfter: 0, partyLvlAfter: 0, gBattleOutcome: 0,
  });

  // Imports dynamiques (= anti-cycle ; résolus au runtime).
  const si = await import('./script-interpreter');
  await si.loadBattleScriptBytecode();
  const ps = await import('./party-storage');
  const pk = await import('../pokemon/pokemon');
  const st = await import('./state');
  const td = await import('./battle-turn-dispatch');
  const bmf = await import('./battle-main-functions');
  const cp = await import('../../battle_controller_player');
  const co = await import('../../battle_controller_opponent');
  const C = await import('./constants');

  // 1. Combat ad-hoc + peuplement gBattleMons[0],[1].
  const playerMon = pk.createPokemonInstance(playerSpecies, playerLevel);
  const enemyMon = pk.createPokemonInstance(enemySpecies, enemyLevel);
  ps.setupPartyForBattle([playerMon as never], [enemyMon as never]);
  ps.fillActiveBattleMonsForBattleStart();

  if (!st.gBattleMons[0] || !st.gBattleMons[1]) return fail('gBattleMons non peuplé');

  // Override optionnel : ID NUMÉRIQUE direct du move au slot 0 (post-fill = pas
  // de résolution de format string). Sinon, le mon utilise ses moves naturels.
  if (typeof opts?.forceMoveNum === 'number') {
    st.gBattleMons[0].moves[0] = opts.forceMoveNum;
    st.gBattleMons[0].pp[0] = 35;
  }
  if (typeof opts?.forceEnemyMoveNum === 'number') {
    st.gBattleMons[1].moves[0] = opts.forceEnemyMoveNum;
    st.gBattleMons[1].pp[0] = 35;
  }
  if (typeof opts?.playerStatus1 === 'number') st.gBattleMons[0].status1 = opts.playerStatus1;
  if (typeof opts?.enemyStatus1 === 'number') st.gBattleMons[1].status1 = opts.enemyStatus1;
  if (typeof opts?.playerHp === 'number') st.gBattleMons[0].hp = opts.playerHp;
  if (typeof opts?.enemyHp === 'number') st.gBattleMons[1].hp = opts.enemyHp;

  // 2. Reset state per-tour propre (= comme prepareTestBattle).
  st.setBattleOutcome(0);
  st.setBattleMoveDamage(0);
  st.setCritMultiplier(1);
  st.setBattleControllerExecFlags(0);
  st.setHitMarker(0);
  st.setMoveResultFlags(0);
  st.gBattlerPartyIndexes[0] = 0;
  st.gBattlerPartyIndexes[1] = 0;
  si.gBattleScriptContext.scriptPtr = -1;
  si.gBattleScriptContext.scriptPtrStack.length = 0;
  // Reset l'état de la chaîne EXP/faint entre runs harness (= le jeu le fait via
  // BattleStartClearSetData, NON lancé par le harness). SANS ça, `givenExpMons` reste
  // posé d'un run précédent → GiveExp est SKIP au 2e+ run de la même session →
  // partyExpGain=0 (artefact d'ISOLATION, pas un bug jeu : le 1er run après reload donne
  // bien l'EXP 1:1, ex. Poochyena Lv2 → 15).
  {
    const bs = st.gBattleStruct as {
      givenExpMons?: number; expGetterMonId?: number; faintedActionsState?: number; wildVictorySong?: number;
    };
    bs.givenExpMons = 0;
    bs.expGetterMonId = 0;
    bs.faintedActionsState = 0;
    bs.wildVictorySong = 0;
    (st.gBattleScripting as { getexpState?: number }).getexpState = 0;
  }

  // 3. Installer les controllers (1:1 InitSinglePlayerBtlControllers).
  st.setActiveBattler(0); cp.SetControllerToPlayer();
  st.setActiveBattler(1); co.SetControllerToOpponent();

  // 4. Poser le tour : positions de move (slot 0), chosen moves, turn order.
  const chosenPos = st.gBattleStruct.chosenMovePositions as number[] | undefined;
  if (chosenPos) { chosenPos[0] = 0; chosenPos[1] = 0; }
  st.gChosenMoveByBattler[0] = st.gBattleMons[0].moves[0];
  st.gChosenMoveByBattler[1] = st.gBattleMons[1].moves[0];
  st.gBattlerByTurnOrder[0] = 0;
  st.gBattlerByTurnOrder[1] = 1;
  st.gActionsByTurnOrder[0] = C.B_ACTION_USE_MOVE;
  st.gActionsByTurnOrder[1] = opts?.bothTurns ? C.B_ACTION_USE_MOVE : C.B_ACTION_FINISHED;
  st.setCurrentTurnActionNumber(0);
  st.setCurrentActionFuncId(st.gActionsByTurnOrder[0]);
  // gBattleMainFunc = RunTurnActionsFunctions (= 1:1 ; le harness tick gBattleMainFunc
  // DYNAMIQUEMENT, pour suivre BattleScriptExecute qui le bascule vers
  // RunBattleScriptCommands_PopCallbacksStack pendant les scripts imbriqués).
  bmf.setBattleMainFunc(td.RunTurnActionsFunctions);
  // La cible : le port (_getMoveTargetForBattler) retourne gBattlerTarget global
  // (dette : table gBattleStruct.moveTarget[] par-battler différée). Dans le vrai
  // flux, gBattlerTarget est posé par la sélection ; le harness le simule (joueur
  // 0 → cible 1). Sinon datahpupdate applique les dégâts à l'attaquant.
  st.setBattlerTarget(1);
  const moveTarget = (st.gBattleStruct as { moveTarget?: number[] }).moveTarget;
  if (moveTarget) { moveTarget[0] = 1; moveTarget[1] = 0; }
  // gSentPokesToOpponent : posé par le send-out in-game (= bitmask des party slots
  // du joueur ayant participé face à l'ennemi). getexp (BattleScript_GiveExp) en a
  // besoin pour distribuer l'XP. Harness : le joueur (slot 0) a participé → flank 0.
  st.gSentPokesToOpponent[0] = 1;
  st.gSentPokesToOpponent[1] = 0;

  // 5. Frame-loop ASYNC.
  const B_WIN_MSG = 0;  // 1:1 décomp battle.h.
  const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
  const ctx = si.gBattleScriptContext;
  const hpBefore = st.gBattleMons[1].hp;
  const expBefore = st.gBattleMons[0].experience ?? 0;
  const lvlBefore = st.gBattleMons[0].level;
  const _pp0 = () => ps.gPlayerParty[0] as { experience?: number; level?: number } | undefined;
  const partyExpBefore = _pp0()?.experience ?? 0;
  const transitions: string[] = [];
  const messages: string[] = [];
  let prevLine = '';
  let lastMsg = '';
  let reachedEnd = false;
  let turnActionsDone = false;  // runToTurnEnd : passe à true quand les actions du tour sont finies, pour ensuite breaker au menu suivant (après BattleTurnPassed).
  let frame = 0;
  let maxMoveDamage = 0;   // diag : max de gBattleMoveDamage observé (calcul OK ?)
  let lastResultFlags = 0;

  for (; frame < maxFrames; frame++) {
    // Tick gBattleMainFunc DYNAMIQUE (= 1:1 BattleMainCB1) : suit BattleScriptExecute
    // qui bascule gBattleMainFunc vers RunBattleScriptCommands_PopCallbacksStack.
    const mainFn = bmf.getBattleMainFunc();
    if (mainFn) mainFn();
    for (let b = 0; b < st.gBattlersCount; b++) {
      st.setActiveBattler(b);
      st.getBattlerControllerFunc(b)?.();
    }
    if (Math.abs(st.gBattleMoveDamage) > Math.abs(maxMoveDamage)) maxMoveDamage = st.gBattleMoveDamage;
    if (st.gMoveResultFlags) lastResultFlags = st.gMoveResultFlags;

    // Capture texte affiché (B_WIN_MSG).
    const dt = (globalThis as { __battleDisplayedText?: Record<number, string | number> }).__battleDisplayedText;
    const curMsg = dt ? String(dt[B_WIN_MSG] ?? '') : '';
    if (curMsg && curMsg !== lastMsg) { messages.push(`f${frame}: ${curMsg}`); lastMsg = curMsg; }

    const mfName = bmf.getBattleMainFunc()?.name ?? '?';
    const fas = (st.gBattleStruct as { faintedActionsState?: number }).faintedActionsState ?? 0;
    const line = `mf=${mfName} act=${st.gCurrentActionFuncId} turn=${st.gCurrentTurnActionNumber} fas=${fas} out=${st.gBattleOutcome} ex=${st.gBattleControllerExecFlags} sp=${ctx.scriptPtr} hp1=${st.gBattleMons[1].hp}`;
    if (line !== prevLine) { transitions.push(`f${frame} ${line}`); prevLine = line; }

    // Fin :
    //  - tour normal terminé SANS issue de combat (outcome==0) → stop (combat continue).
    //  - sinon (outcome!=0) on LAISSE tourner la chaîne de fin (HandleEndTurn_BattleWon
    //    → script PayDay → HandleEndTurn_FinishBattle → cleanup+fade) jusqu'à l'état
    //    terminal (FreeResetData / retour overworld).
    if (st.gBattleOutcome === 0 && st.gCurrentTurnActionNumber >= st.gBattlersCount) {
      if (!opts?.runToTurnEnd) { reachedEnd = true; break; }
      turnActionsDone = true;  // continue : laisse tourner BattleTurnPassed (effets de fin de tour)
    }
    // runToTurnEnd : break quand le menu du tour SUIVANT réapparaît (= BattleTurnPassed + effets de fin de tour terminés).
    if (opts?.runToTurnEnd && turnActionsDone && mfName === 'HandleTurnActionSelectionState') { reachedEnd = true; break; }
    if (mfName === 'FreeResetData_ReturnToOvOrDoEvolutions' || mfName === 'ReturnFromBattleToOverworld') { reachedEnd = true; break; }
    await sleep(frameDelayMs);
  }

  const hpAfter = st.gBattleMons[1].hp;
  return {
    ok: true,
    moveSlot0: st.gBattleMons[0].moves[0], enemySpecies,
    hpBefore, hpAfter, damage: hpBefore - hpAfter,
    framesRun: frame,
    reachedEnd,
    finalActionFuncId: st.gCurrentActionFuncId,
    finalScriptPtr: ctx.scriptPtr,
    transitions,
    messages,
    recentOpcodes: si.getRecentOpcodes().map((o) => `@0x${o.scriptPtr.toString(16)} ${o.name}`),
    maxMoveDamage,
    lastResultFlags,
    expGain: (st.gBattleMons[0].experience ?? 0) - expBefore,
    partyExpGain: (_pp0()?.experience ?? 0) - partyExpBefore,
    lvlBefore,
    lvlAfter: st.gBattleMons[0].level,
    partyLvlAfter: _pp0()?.level ?? 0,
    gBattleOutcome: st.gBattleOutcome,
  };
}

// ─── Harness P3 : boot voie L en ASYNC (traverse l'intro → menu) ───────────

/** Comme harnessRunDecompLoop mais ASYNC (await sleep entre frames) → les textes
 *  d'intro (setTimeout) peuvent s'exécuter (le sync les fige). Pose
 *  `__battleTextInstant` pour accélérer. Boote la voie L (callback2=CB2_InitBattle),
 *  tick callback1/callback2 du runtime chaque frame, et s'arrête quand le menu
 *  d'action est atteint (HandleTurnActionSelectionState + input handler installé)
 *  OU au cap. Restaure les callbacks en sortie (probe jetable, reload après).
 *  ⚠️ Lancer APRÈS un combat (startWild) pour avoir gPlayerParty/gEnemyParty. */
export async function harnessRunDecompLoopAsync(maxFrames = 3000, frameDelayMs = 0, injectInput = false): Promise<{
  reachedMenu: boolean; reachedTurn: boolean; crashed: boolean; error: string | null; finalMainFunc: string;
  framesRun: number; frames: string[]; m0hp: number; m1hp: number; m1hpStart: number;
}> {
  const rt = getRuntime();
  const frames: string[] = [];
  if (!rt) return { reachedMenu: false, reachedTurn: false, crashed: true, error: 'runtime indisponible', finalMainFunc: '(null)', framesRun: 0, frames, m0hp: 0, m1hp: 0, m1hpStart: 0 };
  const G = globalThis as { __battleTextInstant?: boolean };
  const savedInstant = G.__battleTextInstant;
  G.__battleTextInstant = true;
  const gmain = rt.gMain as { callback1?: ((rt: unknown) => void) | null; callback2?: ((rt: unknown) => void) | null; newKeys?: number };
  const savedCb1 = gmain.callback1, savedCb2 = gmain.callback2, savedKeys = gmain.newKeys;
  const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
  const bs = (globalThis as { __battleState?: { gBattleMons?: Array<{ hp: number }>; gCurrentActionFuncId?: number } }).__battleState;
  const A_BUTTON = 1 << 0;
  let crashed = false, error: string | null = null, reachedMenu = false, reachedTurn = false, prevLine = '', f = 0;
  let pending = 0, actionPicked = false, movePicked = false, m1hpStart = -1;
  // Setup parties (party-storage) AVANT le boot : l'intro L
  // (BattleIntroDrawTrainersOrMonsSprites) lit _getEnemyParty()/gBattlerPartyIndexes,
  // et CB2_InitBattle init le MOTEUR sans peupler les parties (= 1:1 : le code qui
  // déclenche le combat pose gPlayerParty/gEnemyParty AVANT CB2_InitBattle). Le
  // reste (fillActiveBattleMons, gBattleMons, controllers) est fait par l'intro.
  const _pk = await import('../pokemon/pokemon');
  const _ps = await import('./party-storage');
  const _pMon = _pk.createPokemonInstance('SPECIES_TREECKO', 10);
  const _eMon = _pk.createPokemonInstance('SPECIES_POOCHYENA', 7);
  _ps.setupPartyForBattle([_pMon as never], [_eMon as never]);
  bootDecompBattleLoop();
  for (; f < maxFrames; f++) {
    gmain.newKeys = pending; pending = 0;          // injecte l'input AVANT le tick
    try {
      if (gmain.callback1) gmain.callback1(rt);
      if (gmain.callback2) gmain.callback2(rt);
    } catch (e) { crashed = true; error = `f${f} (${_getBattleMainFuncName()}): ${(e as Error)?.message ?? String(e)}`; break; }
    gmain.newKeys = 0;                             // l'appui ne dure qu'1 frame (edge)
    const mf = _getBattleMainFuncName();
    const ctrl0 = getBattlerControllerFunc(0)?.name ?? '';
    const ctrl1 = getBattlerControllerFunc(1)?.name ?? '';
    const bsx = bs as unknown as { gBattleCommunication?: number[]; gChosenActionByBattler?: number[]; gChosenMoveByBattler?: number[] };
    const comm = (bsx?.gBattleCommunication ?? []).slice(0, 6).join(',');
    const ca = (bsx?.gChosenActionByBattler ?? []).slice(0, 2).join(',');
    const cm = (bsx?.gChosenMoveByBattler ?? []).slice(0, 2).join(',');
    const line = `mf=${mf} ex=${gBattleControllerExecFlags} c0=${ctrl0} c1=${ctrl1} comm=[${comm}] ca=[${ca}] cm=[${cm}] hp1=${bs?.gBattleMons?.[1]?.hp ?? '?'}`;
    if (line !== prevLine) { frames.push(`f${f} ${line}`); prevLine = line; }
    const atMenu = (mf === 'HandleTurnActionSelectionState' && /^Handle(Input|Choose)/.test(ctrl0)) || mf === '_HandleTurnActionSelectionStateStub';
    if (atMenu && !reachedMenu) { reachedMenu = true; m1hpStart = bs?.gBattleMons?.[1]?.hp ?? -1; }
    if (!injectInput) {
      if (reachedMenu) break;
    } else {
      if (ctrl0 === 'HandleInputChooseAction' && !actionPicked) { pending = A_BUTTON; actionPicked = true; }
      else if (actionPicked && ctrl0 === 'HandleInputChooseMove' && !movePicked) { pending = A_BUTTON; movePicked = true; }
      const hp1 = bs?.gBattleMons?.[1]?.hp ?? -1;
      if (movePicked && ((mf === 'RunTurnActionsFunctions' && (bs?.gCurrentActionFuncId ?? 0) === 10) || (m1hpStart >= 0 && hp1 >= 0 && hp1 < m1hpStart))) {
        reachedTurn = true;
        if (m1hpStart >= 0 && hp1 < m1hpStart) break;   // dégâts appliqués → succès
      }
    }
    await sleep(frameDelayMs);
  }
  gmain.callback1 = savedCb1; gmain.callback2 = savedCb2; gmain.newKeys = savedKeys;
  G.__battleTextInstant = savedInstant;
  return { reachedMenu, reachedTurn, crashed, error, finalMainFunc: _getBattleMainFuncName(), framesRun: f, frames,
    m0hp: bs?.gBattleMons?.[0]?.hp ?? -1, m1hp: bs?.gBattleMons?.[1]?.hp ?? -1, m1hpStart };
}

/** Setup parties (party-storage) AVANT un run du harness SYNC. Async (await
 *  import anti-cycle), mais ne tick RIEN (= rapide). Pose gPlayerParty/gEnemyParty
 *  que l'intro L lit (= 1:1 : le déclencheur de combat peuple les parties avant
 *  CB2_InitBattle). À appeler depuis l'eval AVANT harnessRunDecompLoopSync. */
export async function harnessSetupParties(
  playerSpecies = 'SPECIES_TREECKO', playerLevel = 10,
  enemySpecies = 'SPECIES_POOCHYENA', enemyLevel = 7,
  pOpts?: { moves?: string[]; nature?: string; ivs?: object; evs?: object; ability?: string; personality?: number },
  eOpts?: { moves?: string[]; nature?: string; ivs?: object; evs?: object; ability?: string; personality?: number },
  trainerOpponent?: number,
): Promise<boolean> {
  const pk = await import('../pokemon/pokemon');
  const ps = await import('./party-storage');
  const si = await import('./script-interpreter');
  const st = await import('./state');
  const cst = await import('./constants');
  await si.loadBattleScriptBytecode();
  // pOpts/eOpts → createPokemonInstance : permet de FORCER moves (slot 0 = move
  // testé par autoPlay), nature, ivs/evs, ability, personality (PID → shiny/nature/
  // gender) pour les vérifs 1:1 ciblées (statut/drain/multi-hit/type, EV/IV/shiny).
  const pMon = pk.createPokemonInstance(playerSpecies, playerLevel, pOpts as never);
  const eMon = pk.createPokemonInstance(enemySpecies, enemyLevel, eOpts as never);
  ps.setupPartyForBattle([pMon as never], [eMon as never]);
  // Type de combat : DRESSEUR (BATTLE_TYPE_TRAINER + gTrainerBattleOpponent_A pour
  // getmoneyreward/classe/intro) si trainerOpponent fourni, sinon SAUVAGE. On ne
  // touche QUE le bit TRAINER (preserve le reste) + reset entre runs pour éviter
  // qu'un combat dresseur contamine le wild suivant. battle-init ne reset pas le flag.
  if (trainerOpponent !== undefined) {
    st.setBattleTypeFlags((st.gBattleTypeFlags | cst.BATTLE_TYPE_TRAINER) >>> 0);
    st.setTrainerBattleOpponentA(trainerOpponent);
  } else {
    st.setBattleTypeFlags((st.gBattleTypeFlags & ~cst.BATTLE_TYPE_TRAINER) >>> 0);
  }
  return true;
}

/** Variante MULTI-MON de harnessSetupParties : parties à plusieurs Pokémon (test
 *  switch-in / faint→send-next). Chaque spec = {species, level, opts?}. Combat
 *  DRESSEUR si trainerOpponent fourni. NB : CreateNPCTrainerParty no-ope sans data
 *  dresseur (return early AVANT ZeroEnemyPartyMons) → les mons fournis ici restent,
 *  donc on teste la machinerie de switch-in sans dépendre du port CreateNPCTrainerParty. */
export async function harnessSetupPartiesN(
  players: Array<{ species: string; level: number; opts?: object }>,
  enemies: Array<{ species: string; level: number; opts?: object }>,
  trainerOpponent?: number,
): Promise<boolean> {
  const pk = await import('../pokemon/pokemon');
  const ps = await import('./party-storage');
  const si = await import('./script-interpreter');
  const st = await import('./state');
  const cst = await import('./constants');
  await si.loadBattleScriptBytecode();
  const pMons = players.map((p) => pk.createPokemonInstance(p.species, p.level, p.opts as never));
  const eMons = enemies.map((e) => pk.createPokemonInstance(e.species, e.level, e.opts as never));
  ps.setupPartyForBattle(pMons as never, eMons as never);
  if (trainerOpponent !== undefined) {
    st.setBattleTypeFlags((st.gBattleTypeFlags | cst.BATTLE_TYPE_TRAINER) >>> 0);
    st.setTrainerBattleOpponentA(trainerOpponent);
    // Combat dresseur : charge gTrainers (pic + données) AVANT le boot — en jeu réel
    // c'est le flux trainerbattle qui l'await ; sans ça le sprite dresseur (intro
    // DrawTrainerPic + TrainerSlide victoire) est silencieusement absent en harness.
    const tb = await import('./battle-trainer-data-bridge');
    await tb.ensureGTrainersLoaded();
  } else {
    st.setBattleTypeFlags((st.gBattleTypeFlags & ~cst.BATTLE_TYPE_TRAINER) >>> 0);
  }
  return true;
}

/** Variante SYNCHRONE de harnessRunDecompLoopAsync : tick callback1+callback2 en
 *  boucle for PURE (pas d'await) → monopolise le thread → le rAF du runtime ne
 *  s'intercale PAS (sinon double-tick = gel). Le texte est rendu instantané+sync
 *  (BattlePutTextOnWindow + __battleTextInstant) → pas de blocage sur les pollers.
 *  Suppose les parties déjà posées (harnessSetupParties). Outil de vérif menu→turn. */
export function harnessRunDecompLoopSync(maxFrames = 600, injectInput = false, autoPlay = false): {
  reachedMenu: boolean; reachedTurn: boolean; crashed: boolean; error: string | null;
  finalMainFunc: string; framesRun: number; frames: string[];
  m0hp: number; m1hp: number; m1hpStart: number; actionPicked: boolean; movePicked: boolean;
  gBattleOutcome: number; turnsPlayed: number; messages: string[];
} {
  const rt = getRuntime();
  const frames: string[] = [];
  if (!rt) return { reachedMenu: false, reachedTurn: false, crashed: true, error: 'runtime indisponible', finalMainFunc: '(null)', framesRun: 0, frames, m0hp: 0, m1hp: 0, m1hpStart: 0, actionPicked: false, movePicked: false, gBattleOutcome: 0, turnsPlayed: 0, messages: [] };
  const G = globalThis as { __battleTextInstant?: boolean };
  const savedInstant = G.__battleTextInstant;
  G.__battleTextInstant = true;
  const gmain = rt.gMain as { callback1?: ((rt: unknown) => void) | null; callback2?: ((rt: unknown) => void) | null; newKeys?: number };
  const savedCb1 = gmain.callback1, savedCb2 = gmain.callback2, savedKeys = gmain.newKeys;
  const bs = (globalThis as { __battleState?: { gBattleMons?: Array<{ hp: number }>; gCurrentActionFuncId?: number; gBattleOutcome?: number } }).__battleState;
  const A_BUTTON = 1 << 0;
  let crashed = false, error: string | null = null, reachedMenu = false, reachedTurn = false, prevLine = '', prevCtrl0 = '', f = 0;
  let pending = 0, actionPicked = false, movePicked = false, m1hpStart = -1, turnsPlayed = 0, maxOutcome = 0;
  const seenMsgs = new Set<string>();
  const messages: string[] = [];
  bootDecompBattleLoop();
  for (; f < maxFrames; f++) {
    gmain.newKeys = pending; pending = 0;
    try {
      if (gmain.callback1) gmain.callback1(rt);
      if (gmain.callback2) gmain.callback2(rt);
    } catch (e) { crashed = true; error = `f${f} (${_getBattleMainFuncName()}): ${(e as Error)?.message ?? String(e)}`; break; }
    gmain.newKeys = 0;
    const mf = _getBattleMainFuncName();
    const ctrl0 = getBattlerControllerFunc(0)?.name ?? '';
    const ctrl1 = getBattlerControllerFunc(1)?.name ?? '';
    const bsx = bs as unknown as { gBattleCommunication?: number[]; gChosenActionByBattler?: number[]; gChosenMoveByBattler?: number[] };
    const comm = (bsx?.gBattleCommunication ?? []).slice(0, 6).join(',');
    const ca = (bsx?.gChosenActionByBattler ?? []).slice(0, 2).join(',');
    const cm = (bsx?.gChosenMoveByBattler ?? []).slice(0, 2).join(',');
    const line = `mf=${mf} ex=${gBattleControllerExecFlags} c0=${ctrl0} c1=${ctrl1} comm=[${comm}] ca=[${ca}] cm=[${cm}] hp1=${bs?.gBattleMons?.[1]?.hp ?? '?'}`;
    if (line !== prevLine) { frames.push(`f${f} ${line}`); prevLine = line; }
    const atMenu = (mf === 'HandleTurnActionSelectionState' && /^Handle(Input|Choose)/.test(ctrl0)) || mf === '_HandleTurnActionSelectionStateStub';
    if (atMenu && !reachedMenu) { reachedMenu = true; m1hpStart = bs?.gBattleMons?.[1]?.hp ?? -1; }
    // Capture des textes affichés (chasse aux textes faux : {codes} non résolus,
    // undefined, NaN, mauvais nom). Dédupliqué, ordre d'apparition.
    const dt = (globalThis as { __battleDisplayedText?: Record<number, unknown> }).__battleDisplayedText;
    if (dt) {
      for (const v of Object.values(dt)) {
        if (typeof v === 'string' && v && !seenMsgs.has(v)) { seenMsgs.add(v); messages.push(v); }
      }
    }
    if (!injectInput) {
      if (reachedMenu) break;
    } else if (autoPlay) {
      // Multi-tour : ré-injecte A à CHAQUE ouverture de menu (transition vers le
      // handler) → choisit ATTAQUE (slot 0) puis le move (slot 0), tour après tour,
      // jusqu'à la fin du combat (gBattleOutcome != 0).
      if (ctrl0 === 'HandleInputChooseAction' && prevCtrl0 !== 'HandleInputChooseAction') { pending = A_BUTTON; turnsPlayed++; }
      else if (ctrl0 === 'HandleInputChooseMove' && prevCtrl0 !== 'HandleInputChooseMove') { pending = A_BUTTON; }
      else {
        // Yes/No box du SCRIPT (faint joueur sauvage « Utiliser le POKéMON suivant? »,
        // opcode 0x67 'yesnobox', ≠ yesnoboxlearnmove) : répondre YES (curseur reste 0
        // → jump vers FaintedMonTryChoose → openpartyscreen). C'est un opcode de script,
        // pas un controller func → détecté via le dernier opcode exécuté (getRecentOpcodes).
        // 1:1 = le joueur choisit d'envoyer le mon suivant.
        const recent = getRecentOpcodes();
        if (recent.length && recent[recent.length - 1].name === 'yesnobox') { pending = A_BUTTON; }
      }
      const hp1 = bs?.gBattleMons?.[1]?.hp ?? -1;
      if (m1hpStart >= 0 && hp1 >= 0 && hp1 < m1hpStart) reachedTurn = true;
      // Capture l'outcome AVANT que la fin de combat ne le reset à 0.
      // gBattleOutcome s'accède via getBattleOutcome() (fonction), pas la propriété.
      const bsg = bs as unknown as { getBattleOutcome?: () => number; gBattleOutcome?: number };
      const oc = bsg?.getBattleOutcome?.() ?? bsg?.gBattleOutcome ?? 0;
      if (oc !== 0 && maxOutcome === 0) maxOutcome = oc;
      // Fin définitive du combat (retour overworld) → stop.
      if (mf === 'ReturnFromBattleToOverworld' || mf === 'FreeResetData_ReturnToOvOrDoEvolutions') break;
    } else {
      if (ctrl0 === 'HandleInputChooseAction' && !actionPicked) { pending = A_BUTTON; actionPicked = true; }
      else if (actionPicked && ctrl0 === 'HandleInputChooseMove' && !movePicked) { pending = A_BUTTON; movePicked = true; }
      const hp1 = bs?.gBattleMons?.[1]?.hp ?? -1;
      if (movePicked && ((mf === 'RunTurnActionsFunctions' && (bs?.gCurrentActionFuncId ?? 0) === 10) || (m1hpStart >= 0 && hp1 >= 0 && hp1 < m1hpStart))) {
        reachedTurn = true;
        if (m1hpStart >= 0 && hp1 < m1hpStart) break;
      }
    }
    prevCtrl0 = ctrl0;
  }
  gmain.callback1 = savedCb1; gmain.callback2 = savedCb2; gmain.newKeys = savedKeys;
  G.__battleTextInstant = savedInstant;
  return { reachedMenu, reachedTurn, crashed, error, finalMainFunc: _getBattleMainFuncName(), framesRun: f, frames,
    m0hp: bs?.gBattleMons?.[0]?.hp ?? -1, m1hp: bs?.gBattleMons?.[1]?.hp ?? -1, m1hpStart, actionPicked, movePicked,
    gBattleOutcome: maxOutcome || ((bs as unknown as { gBattleOutcome?: number })?.gBattleOutcome ?? 0), turnsPlayed, messages };
}

// ─── Devtools expose ───────────────────────────────────────────────────────

/** Dev (A/B animations) : boote le COMBAT RIVAL #1 (May/Flora Route 103) sur voie L, pour iterer vite
 *  sur les animations de combat DRESSEUR (opponent trainer slide-in/throw, send-out, ball, idle bob...).
 *  player Treecko Lv5 vs May (BATTLE_TYPE_TRAINER + gTrainerBattleOpponent_A=numId) ; la party rival est
 *  generee au boot par CreateNPCTrainerParty depuis gTrainers[numId] (charge ici via ensureGTrainersLoaded).
 *  Le starter exact importe peu pour les anims (3 rivaux selon le starter ; on prend TREECKO). Bouton
 *  « ( » (numpad-5, DebugOverlayScene). A utiliser depuis l'overworld (PAS pendant un combat). */
export async function harnessBootRivalBattle1(): Promise<void> {
  const bdb = await import('./battle-trainer-data-bridge');
  await bdb.ensureGTrainersLoaded();
  const numId = bdb.resolveTrainerNumId('TRAINER_MAY_ROUTE_103_TREECKO');
  await harnessSetupParties(
    'SPECIES_TREECKO', 5, 'SPECIES_TORCHIC', 5,
    { moves: ['MOVE_POUND', 'MOVE_LEER', 'MOVE_ABSORB'] },
    { moves: ['MOVE_SCRATCH', 'MOVE_GROWL'] },
    numId,
  );
  const st = await import('./state');
  st.setBattleOutcome(0);
  bootDecompBattleLoop(true);   // CreateNPCTrainerParty (au boot) genere la party rival depuis gTrainers
}

(globalThis as Record<string, unknown>).__decompBattleLoop = {
  harnessDriveTurn,
  harnessBootRivalBattle1,
  harnessExecuteTurnL,
  harnessRunDecompLoopAsync,
  harnessSetupParties,
  harnessSetupPartiesN,
  harnessRunDecompLoopSync,
  isDecompBattleLoopEnabled,
  bootDecompBattleLoop,
  harnessRunDecompLoop,
  getRecentOpcodes,
  enable: () => { (globalThis as { __USE_DECOMP_BATTLE_LOOP__?: boolean }).__USE_DECOMP_BATTLE_LOOP__ = true; },
  disable: () => { (globalThis as { __USE_DECOMP_BATTLE_LOOP__?: boolean }).__USE_DECOMP_BATTLE_LOOP__ = false; },
};

// ─── DEVTOOL combat de test USER (2026-06-11, demande directe) ──────────────
// VRAI combat : ton pokemon avec les moves a tester, adversaire INCREVABLE
// (Wailord lvl 100, Splash uniquement -> 0 degat). Tu joues les tours TOI-MEME
// (vraies frames entieres, vrai flux controller).
// Console : __combatTest(['MOVE_SCRATCH','MOVE_BITE','MOVE_EMBER','MOVE_GROWL'])
(globalThis as Record<string, unknown>).__combatTest = async (moves?: string[]): Promise<string> => {
  const mv = (moves && moves.length) ? moves.slice(0, 4) : ['MOVE_SCRATCH', 'MOVE_BITE', 'MOVE_EMBER', 'MOVE_GROWL'];
  await harnessSetupPartiesN(
    [{ species: 'SPECIES_TREECKO', level: 60, opts: { moves: mv } }],
    [{ species: 'SPECIES_WAILORD', level: 100, opts: { moves: ['MOVE_SPLASH'] } }],
  );
  void bootDecompBattleLoop(true);
  return 'combat de test : TREECKO lvl60 [' + mv.join(', ') + '] vs WAILORD increvable (Splash only)';
};
