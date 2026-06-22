/**
 * strings.ts — miroir 1:1 (PARTIEL) de `decomp/src/strings.c` (+ include/strings.h).
 *
 * STAGE 0 du chantier TEXTE 1:1 (docs/TEXT-DATA-1TO1-MIGRATION-PLAN.md). Ne porte
 * QUE les `gText_ExpandedPlaceholder_*` nécessaires à `StringExpandPlaceholders`
 * (string_util.ts). Le RESTE de strings.c (data OW/menus = des milliers de chaînes)
 * = Stage 1 (ré-encodage de l'extraction `auto-asm/data/**` token→byte).
 *
 * ⚠️ BRIDGE TRANSITOIRE D'ENCODAGE : dans le décomp ces `const u8[]` sont encodés
 * au BUILD par le préprocesseur `_("…")` (charmap.txt). Ici on encode au RUNTIME
 * via `charmap.json` — c'est la convention du projet (gba-text-system /
 * battle-message encodent tous runtime). `InitTextData(charmap)` doit être appelé
 * une fois (boot — Stage 3 ; ou le test headless STAGE 0). Quand Stage 1 ré-encodera
 * la data au build, ce runtime-encode disparaîtra (data byte natif).
 */
import { EOS } from '../include/constants/characters';

// ─── Charmap transitoire (deviendra la charmap canonique de text.ts au Stage 2) ─
let _textCharmap: Record<string, number> | null = null;

/**
 * Bridge transitoire : encode une JS-string source FR → bytes charmap + EOS final.
 * = analogue RUNTIME du préprocesseur `_("…")` du décomp (build-time). Un char
 * absent de la charmap retombe sur l'espace (signal d'un char manquant à corriger
 * À LA SOURCE = charmap.json, pas par substitution). Avant InitTextData
 * (charmap null) → tout retombe sur 0 + EOS.
 */
function encodeFR(s: string): Uint8Array {
  const cm = _textCharmap;
  const out = new Uint8Array(s.length + 1);
  for (let i = 0; i < s.length; i++) {
    const b = cm ? cm[s[i]] : undefined;
    out[i] = (b === undefined) ? (cm?.[' '] ?? 0) : b;
  }
  out[s.length] = EOS;
  return out;
}

/** Chaîne vide `_("")` = juste le terminateur EOS (helper d'init des placeholders ;
 *  `new Uint8Array` pour uniformiser le type buffer avec `encodeFR`). */
function eos(): Uint8Array {
  const a = new Uint8Array(1);
  a[0] = EOS;
  return a;
}

// ════════════════════════════════════════════════════════════════════════════
//  1:1 décomp strings.c : gText_ExpandedPlaceholder_* (FR de pokeemeraude)
//  strings.c:7-20. Empty/Kun/Chan = _("") (vide en FR) → CONST [EOS]. Les autres
//  sont remplis par InitTextData (let → live-binding ES lu par string_util.ts).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp strings.c:7 `gText_ExpandedPlaceholder_Empty[] = _("")`. */
export const gText_ExpandedPlaceholder_Empty: Uint8Array = eos();
/** 1:1 décomp strings.c:8 `gText_ExpandedPlaceholder_Kun[] = _("")` (FR : vide). */
export const gText_ExpandedPlaceholder_Kun: Uint8Array = eos();
/** 1:1 décomp strings.c:9 `gText_ExpandedPlaceholder_Chan[] = _("")` (FR : vide). */
export const gText_ExpandedPlaceholder_Chan: Uint8Array = eos();

/** 1:1 décomp strings.c:12 `_("EMERAUDE")` (PLACEHOLDER_ID_VERSION). */
export let gText_ExpandedPlaceholder_Emerald: Uint8Array = eos();
/** 1:1 décomp strings.c:13 `_("AQUA")`. */
export let gText_ExpandedPlaceholder_Aqua: Uint8Array = eos();
/** 1:1 décomp strings.c:14 `_("MAGMA")`. */
export let gText_ExpandedPlaceholder_Magma: Uint8Array = eos();
/** 1:1 décomp strings.c:15 `_("ARTHUR")` (Archie en FR). */
export let gText_ExpandedPlaceholder_Archie: Uint8Array = eos();
/** 1:1 décomp strings.c:16 `_("MAX")` (Maxie en FR). */
export let gText_ExpandedPlaceholder_Maxie: Uint8Array = eos();
/** 1:1 décomp strings.c:17 `_("KYOGRE")`. */
export let gText_ExpandedPlaceholder_Kyogre: Uint8Array = eos();
/** 1:1 décomp strings.c:18 `_("GROUDON")`. */
export let gText_ExpandedPlaceholder_Groudon: Uint8Array = eos();
/** 1:1 décomp strings.c:19 `_("BRICE")` (Brendan/rival ♂ — utilisé quand joueuse). */
export let gText_ExpandedPlaceholder_Brendan: Uint8Array = eos();
/** 1:1 décomp strings.c:20 `_("FLORA")` (May/rivale ♀ — utilisée quand joueur). */
export let gText_ExpandedPlaceholder_May: Uint8Array = eos();

/**
 * Bridge transitoire : fournit la charmap + encode les `gText_ExpandedPlaceholder_*`
 * FR. À appeler une fois (boot — Stage 3 ; le test headless STAGE 0 l'appelle).
 * (Stage 1 ré-encodera ces data au build → ce runtime-encode disparaîtra.)
 */
export function InitTextData(charmap: Record<string, number>): void {
  _textCharmap = charmap;
  gText_ExpandedPlaceholder_Emerald = encodeFR('EMERAUDE');
  gText_ExpandedPlaceholder_Aqua = encodeFR('AQUA');
  gText_ExpandedPlaceholder_Magma = encodeFR('MAGMA');
  gText_ExpandedPlaceholder_Archie = encodeFR('ARTHUR');
  gText_ExpandedPlaceholder_Maxie = encodeFR('MAX');
  gText_ExpandedPlaceholder_Kyogre = encodeFR('KYOGRE');
  gText_ExpandedPlaceholder_Groudon = encodeFR('GROUDON');
  gText_ExpandedPlaceholder_Brendan = encodeFR('BRICE');
  gText_ExpandedPlaceholder_May = encodeFR('FLORA');
}

/**
 * Bridge transitoire pour `ExpandPlaceholder_PlayerName` (string_util.ts) : encode
 * un nom JS-string (gSaveBlock2.playerName) en bytes charmap. Stage 4 : playerName
 * deviendra u8[] natif → ce bridge disparaît.
 */
export function EncodePlayerNameFR(name: string): Uint8Array {
  return encodeFR(name);
}

/** True si la charmap transitoire est chargée (placeholders FR encodés). */
export function IsTextDataInitialized(): boolean {
  return _textCharmap !== null;
}
