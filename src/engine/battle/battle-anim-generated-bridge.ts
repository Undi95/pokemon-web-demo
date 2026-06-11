/**
 * battle-anim-generated-bridge.ts — PHASE 1a roadmap anims 1:1 (2026-06-11).
 *
 * Branche les DONNÉES GÉNÉRÉES (battle-anim-sprites.ts : 226 AnimCmd +
 * 185 AffineAnimCmd + 387 SpriteTemplates + 74 OAM, extraits de la décomp
 * par scripts/extract-battle-anim-sprites.mjs — zéro recopie) sur les
 * moteurs existants :
 *   - les AffineAnims/Tables → registre sprite-affine-extras (BeginAffineAnim
 *     1:1 les tick).
 *   - lookupGeneratedTemplate(name) : construit un AnimSpriteTemplate à la
 *     volée depuis le généré : tileTag = valeur ANIM_TAG (manifest Phase 0bis),
 *     oam = BATTLE_ANIM_OAMS résolu, anims = tables AnimCmd (format runtime),
 *     affineAnims = nom de table (registre extras), callback = RÉSOLU PAR NOM
 *     dans le registre des callbacks TS portés (la SEULE chose manuelle).
 *
 * Le registry (lookupAnimTemplate) tombe sur ce bridge quand le template
 * n'est pas enregistré manuellement → les 387 templates deviennent
 * disponibles ; ceux dont le callback n'est pas encore porté = fallback
 * warn-once (la liste de demande des vagues).
 */
import {
  BATTLE_ANIM_ANIMS, BATTLE_ANIM_ANIM_TABLES,
  BATTLE_ANIM_AFFINE_ANIMS, BATTLE_ANIM_AFFINE_TABLES,
  BATTLE_ANIM_TEMPLATES, BATTLE_ANIM_OAMS,
} from '../decomp-data/auto/src/battle-anim-sprites';
import { registerAffineAnim, registerAffineAnimTable } from '../decomp-impls/sprite-affine-extras';
import type { AnimSpriteTemplate } from './battle-anim-registry';

// ─── 1) Les affines générées → le registre extras (une fois) ────────────────
let _affinesRegistered = false;
function _ensureAffinesRegistered(): void {
  if (_affinesRegistered) return;
  _affinesRegistered = true;
  for (const [name, anim] of Object.entries(BATTLE_ANIM_AFFINE_ANIMS)) {
    // terminator JUMP:n / LOOP:n → END net (le moteur extras ne gère que END ;
    // les jump/loop affine = rares, dette douce tracée par le warn ci-dessous)
    const term = (anim as { terminator: string }).terminator;
    const a = anim as unknown as { frames: Array<{ xScale: number; yScale: number; rotation: number; duration: number }> };
    registerAffineAnim(name, {
      frames: a.frames,
      terminator: term.startsWith('JUMP') || term.startsWith('LOOP') ? 'END' : term,
    } as never);
  }
  for (const [name, refs] of Object.entries(BATTLE_ANIM_AFFINE_TABLES)) {
    registerAffineAnimTable(name, { affineAnims: refs as readonly string[] } as never);
  }
}

// ─── 2) Le manifest des tags (Phase 0bis) : nom ANIM_TAG_X → valeur ─────────
let _tagValues: Record<string, number> | null = null;
let _tagFetchStarted = false;
function _ensureTagValues(): void {
  if (_tagValues || _tagFetchStarted) return;
  _tagFetchStarted = true;
  void fetch('/decomp/em/battle_anims/anim-gfx-manifest.json')
    .then((r) => r.json())
    .then((j: Record<string, { tagValue: number }>) => {
      _tagValues = {};
      for (const [tag, e] of Object.entries(j)) _tagValues[tag] = e.tagValue;
    })
    .catch((e) => console.warn('[anim-bridge] manifest tags KO', e));
}
_ensureTagValues();

// ─── 3) Le registre des CALLBACKS par nom C (la seule chose manuelle) ───────
type AnimCallbackFn = (sprite: unknown) => void;
const _callbacks: Map<string, AnimCallbackFn> =
  ((globalThis as Record<string, unknown>).__animCallbackRegistry as Map<string, AnimCallbackFn>) ?? new Map();
(globalThis as Record<string, unknown>).__animCallbackRegistry = _callbacks;

/** Enregistre des callbacks TS portés sous leur nom C exact (AnimXxx). */
export function registerAnimCallbacks(map: Record<string, AnimCallbackFn>): void {
  for (const [k, v] of Object.entries(map)) _callbacks.set(k, v);
}

const _warned = new Set<string>();

// ─── 4) lookupGeneratedTemplate ──────────────────────────────────────────────
export function lookupGeneratedTemplate(name: string): AnimSpriteTemplate | undefined {
  const g = (BATTLE_ANIM_TEMPLATES as Record<string, {
    tileTag: string | null; paletteTag: string | null; oam: string | null;
    anims: string | null; affineAnims: string | null; callback: string | null;
  }>)[name];
  if (!g) return undefined;
  _ensureAffinesRegistered();
  // tileTag : ANIM_TAG_X → valeur (manifest) ; 0 si template contrôleur (tag 0/NULL)
  let tileTag = 0;
  if (g.tileTag && g.tileTag.startsWith('ANIM_TAG_')) {
    const v = _tagValues?.[g.tileTag];
    if (v === undefined) {
      if (!_warned.has(name)) { _warned.add(name); console.warn(`[anim-bridge] ${name}: tag ${g.tileTag} inconnu du manifest`); }
      return undefined;
    }
    tileTag = v;
  }
  // callback par nom (la liste de demande des vagues si absent)
  const cb = g.callback ? _callbacks.get(g.callback) : undefined;
  if (!cb) {
    if (g.callback && !_warned.has(name)) {
      _warned.add(name);
      console.warn(`[anim-bridge] ${name}: callback ${g.callback} non porté (vague à venir) — fallback.`);
    }
    return undefined;
  }
  // OAM résolu
  const oam = g.oam ? (BATTLE_ANIM_OAMS as Record<string, { shape: number | null; size: number | null }>)[g.oam] : undefined;
  // anims : la ref table → les tables AnimCmd (format runtime déjà)
  let anims: ReadonlyArray<ReadonlyArray<unknown>> | undefined;
  if (g.anims && g.anims !== 'gDummySpriteAnimTable') {
    const refs = (BATTLE_ANIM_ANIM_TABLES as Record<string, readonly string[]>)[g.anims];
    if (refs) {
      anims = refs
        .map((r) => (BATTLE_ANIM_ANIMS as Record<string, ReadonlyArray<unknown>>)[r])
        .filter((a): a is ReadonlyArray<unknown> => !!a);
    }
  }
  const tpl: AnimSpriteTemplate = {
    name,
    tileTag,
    paletteTag: tileTag,
    callback: cb as never,
    oam: oam && oam.shape !== null && oam.size !== null
      ? { shape: oam.shape as 0 | 1 | 2, size: oam.size as 0 | 1 | 2 | 3 }
      : { shape: 0, size: 2 },
    ...(anims && anims.length ? { anims } : {}),
    ...(g.affineAnims && g.affineAnims !== 'gDummySpriteAffineAnimTable' ? { affineAnims: g.affineAnims } : {}),
  };
  return tpl;
}

// Surface anti-cycle : le registry resout le genere via globalThis.
(globalThis as Record<string, unknown>).__animGeneratedBridge = { lookupGeneratedTemplate };
