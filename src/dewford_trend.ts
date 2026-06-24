/**
 * dewford_trend.ts — miroir 1:1 de `src/dewford_trend.c` (mise à jour quotidienne
 * des tendances de Poivressel + tri).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/dewford_trend.c`.
 *
 * Concept :
 *   Poivressel (Dewford) a une « phrase tendance » (easy-chat) qui évolue. Jusqu'à
 *   SAVED_TRENDS_COUNT (5) tendances sont stockées (gSaveBlock1Ptr->dewfordTrends),
 *   chacune avec une « trendiness » (popularité) qui monte (gainingTrendiness) puis
 *   redescend, bornée par maxTrendiness. `UpdateDewfordTrendPerDay` (appelée par
 *   UpdatePerDay, clock.c) fait évoluer chaque tendance de `days` pas, puis re-trie
 *   le tableau (la plus tendance en tête) — dewfordTrends[0] = la phrase « tendance »
 *   lue par les specials de Poivressel.
 *
 *  ⚠️ Bitfields décomp (struct DewfordTrend) : trendiness:7, maxTrendiness:7,
 *  gainingTrendiness:1 → on masque les écritures (`& 0x7F` / `& 1`) pour reproduire
 *  la troncature GBA (critique pour `gainingTrendiness = (quotient ^ 1) & 1`).
 *
 *  Note placement : les SPECIALS de tendance (IsTrendyPhraseBoring, GetDewfordHall
 *  PaintingNameIndex, TrySetTrendyPhrase…) sont portés dans specials-registry ; ce
 *  module n'amène que la mise à jour quotidienne + le tri (non portés jusqu'ici).
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { Random } from './random';
import type { DewfordTrend } from './engine/save/save-blocks';

const SAVED_TRENDS_COUNT = 5;  // 1:1 décomp constants/global.h:65.

// 1:1 décomp enum (dewford_trend.c:58-62).
const SORT_MODE_NORMAL = 0;
const SORT_MODE_MAX_FIRST = 1;  // unused
const SORT_MODE_FULL = 2;

/** 1:1 décomp `CompareTrends(a, b, mode)` (dewford_trend.c:328) : renvoie TRUE si
 *  `a` doit passer avant `b`. Égalité (NORMAL/MAX_FIRST) → tie-break `Random() & 1`. */
function CompareTrends(a: DewfordTrend, b: DewfordTrend, mode: number): boolean {
  switch (mode) {
    case SORT_MODE_NORMAL:
      if (a.trendiness > b.trendiness) return true;
      if (a.trendiness < b.trendiness) return false;
      if (a.maxTrendiness > b.maxTrendiness) return true;
      if (a.maxTrendiness < b.maxTrendiness) return false;
      break;
    case SORT_MODE_MAX_FIRST: // Unused
      if (a.maxTrendiness > b.maxTrendiness) return true;
      if (a.maxTrendiness < b.maxTrendiness) return false;
      if (a.trendiness > b.trendiness) return true;
      if (a.trendiness < b.trendiness) return false;
      break;
    case SORT_MODE_FULL:
      if (a.trendiness > b.trendiness) return true;
      if (a.trendiness < b.trendiness) return false;
      if (a.maxTrendiness > b.maxTrendiness) return true;
      if (a.maxTrendiness < b.maxTrendiness) return false;
      if (a.rand > b.rand) return true;
      if (a.rand < b.rand) return false;
      if (a.words[0] > b.words[0]) return true;
      if (a.words[0] < b.words[0]) return false;
      if (a.words[1] > b.words[1]) return true;
      if (a.words[1] < b.words[1]) return false;
      return true;
  }
  // Mode invalide, ou tendances égales (NORMAL/MAX_FIRST) → choix aléatoire.
  return (Random() & 1) !== 0;
}

/** 1:1 décomp `SortTrends(trends, numTrends, mode)` (dewford_trend.c:209) : tri par
 *  sélection (swap si CompareTrends(trends[j], trends[i])). Le SWAP de structs C =
 *  échange des références d'objets dans le tableau (même ordre final). */
function SortTrends(trends: DewfordTrend[], numTrends: number, mode: number): void {
  for (let i = 0; i < numTrends; i++) {
    for (let j = i + 1; j < numTrends; j++) {
      if (CompareTrends(trends[j], trends[i], mode)) {
        const temp = trends[j];
        trends[j] = trends[i];
        trends[i] = temp;
      }
    }
  }
}

/** 1:1 décomp `UpdateDewfordTrendPerDay(days)` (dewford_trend.c:170) : fait évoluer
 *  chaque tendance de `days` pas (clockRand = days*5, déterministe), puis re-trie.
 *  Appelée par UpdatePerDay (clock.c) à chaque changement de jour. */
export function UpdateDewfordTrendPerDay(days: number): void {
  if (days !== 0) {
    const clockRand = days * 5;
    const trends = gSaveBlock1Ptr.dewfordTrends;

    for (let i = 0; i < SAVED_TRENDS_COUNT; i++) {
      let rand = clockRand;
      const trend = trends[i];

      if (!trend.gainingTrendiness) {
        // Tendance « ennuyeuse » : perd de la trendiness jusqu'à 0.
        if (trend.trendiness >= (rand & 0xFFFF)) {
          trend.trendiness = (trend.trendiness - rand) & 0x7F;
          if (trend.trendiness === 0) trend.gainingTrendiness = 1;
          continue;
        }
        rand -= trend.trendiness;
        trend.trendiness = 0;
        trend.gainingTrendiness = 1;
      }

      const trendiness = trend.trendiness + rand;
      if ((trendiness & 0xFFFF) > trend.maxTrendiness) {
        // Atteint la limite, reset de la trendiness.
        const newTrendiness = trendiness % trend.maxTrendiness;
        const quotient = Math.floor(trendiness / trend.maxTrendiness);
        trend.gainingTrendiness = (quotient ^ 1) & 1;
        if (trend.gainingTrendiness) trend.trendiness = newTrendiness & 0x7F;
        else trend.trendiness = (trend.maxTrendiness - newTrendiness) & 0x7F;
      } else {
        // Augmente la trendiness.
        trend.trendiness = trendiness & 0x7F;
        // Atteint son max → devient « ennuyeuse » et commence à perdre.
        if (trend.trendiness === trend.maxTrendiness) trend.gainingTrendiness = 0;
      }
    }
    SortTrends(trends, SAVED_TRENDS_COUNT, SORT_MODE_NORMAL);
  }
}

// Exposition dev (sonde déterministe), sans effet sur le jeu.
{
  (globalThis as Record<string, unknown>).UpdateDewfordTrendPerDay = UpdateDewfordTrendPerDay;
}
