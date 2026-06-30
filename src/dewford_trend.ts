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
 *  Consolidation 1:1 : toute la logique de dewford_trend.c vit ICI (foyer miroir) —
 *  10/13 fonctions. Les specials (IsTrendyPhraseBoring, GetDewfordHallPaintingNameIndex)
 *  sont enregistrés depuis specials-registry (table gSpecials) qui importe ces fns.
 *  TrySetTrendyPhrase est appelé par le flow easy-chat (easy_chat.c:2980).
 *
 *  ── Différé (3/13) ──
 *   - `InitDewfordTrend` (seed des 5 tendances à la nouvelle partie) : BLOQUÉ sur
 *     `GetRandomEasyChatWordFromGroup` + EC_GROUP_CONDITIONS/LIFESTYLE/HOBBIES
 *     (infra word-group d'easy_chat pas encore portée). À câbler dans NewGameInitData.
 *   - `ReceiveDewfordTrendData` + `GetSavedTrendIndex` : échange d'enregistrements (link).
 *   - `TryPutTrendWatcherOnAir` (appelé par TrySetTrendyPhrase) : TV « Trend Watcher »
 *     (tv.c) pas porté → l'appel est commenté.
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { Random } from './random';
import { VarGet, FlagGet, FlagSet, gSpecialVar } from './engine/script/script-vars';
import { ConvertEasyChatWordsToString } from './easy_chat';
import { gStringVar1, StringCopy } from './string_util';
import { encodeOwText } from './text';
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

/** 1:1 décomp `BufferTrendyPhraseString(void)` (dewford_trend.c:290) :
 *    struct DewfordTrend *trend = &dewfordTrends[gSpecialVar_0x8004];
 *    ConvertEasyChatWordsToString(gStringVar1, trend->words, 2, 1);
 *  Convertit les 2 mots easy-chat de la tendance (slot VAR_0x8004) en string FR dans
 *  gStringVar1, pour affichage par le NPC du Hall de Poivressel. Le port de
 *  ConvertEasyChatWordsToString renvoie la string → on l'encode dans gStringVar1. */
export function BufferTrendyPhraseString(): void {
  const trend = gSaveBlock1Ptr.dewfordTrends[VarGet('VAR_0x8004')];
  const str = ConvertEasyChatWordsToString(null, trend.words, 2, 1);
  StringCopy(gStringVar1, encodeOwText(str));
}

/** Copie par VALEUR d'une DewfordTrend. En C, `dewfordTrends[j] = dewfordTrends[j-1]`
 *  copie les champs du struct ; en JS, assigner la référence créerait de l'aliasing →
 *  on clone explicitement (critique pour le décalage-insertion de TrySetTrendyPhrase). */
function cloneTrend(t: DewfordTrend): DewfordTrend {
  return {
    trendiness: t.trendiness, maxTrendiness: t.maxTrendiness,
    gainingTrendiness: t.gainingTrendiness, rand: t.rand,
    words: [t.words[0], t.words[1]],
  };
}

/** 1:1 décomp `SeedTrendRng(trend)` (dewford_trend.c:369-383) : maxTrendiness ∈ [30,127]
 *  (biaisé vers le bas via re-tirages), trendiness ∈ [30, maxTrendiness], rand = 16 bits.
 *  Bitfields décomp (trendiness:7, maxTrendiness:7) → masque `& 0x7F`. */
function SeedTrendRng(trend: DewfordTrend): void {
  let rand = Random() % 98;
  if (rand > 50) {
    rand = Random() % 98;
    if (rand > 80) rand = Random() % 98;
  }
  trend.maxTrendiness = (rand + 30) & 0x7F;
  trend.trendiness = (((Random() % (rand + 1)) + 30) & 0x7F);
  trend.rand = Random() & 0xFFFF;
}

/** 1:1 décomp `IsEasyChatPairEqual(words1, words2)` (dewford_trend.c:397-407) :
 *  les 2 mots easy-chat sont-ils identiques ? */
function IsEasyChatPairEqual(words1: ArrayLike<number>, words2: ArrayLike<number>): boolean {
  for (let i = 0; i < 2; i++) {
    if (words1[i] !== words2[i]) return false;
  }
  return true;
}

/** 1:1 décomp `IsPhraseInSavedTrends(phrase)` (dewford_trend.c:385-395) : la phrase est-elle
 *  déjà l'une des SAVED_TRENDS_COUNT tendances sauvées ? */
function IsPhraseInSavedTrends(phrase: ArrayLike<number>): boolean {
  const trends = gSaveBlock1Ptr.dewfordTrends;
  for (let i = 0; i < SAVED_TRENDS_COUNT; i++) {
    if (IsEasyChatPairEqual(phrase, trends[i].words)) return true;
  }
  return false;
}

/** 1:1 décomp `TrySetTrendyPhrase(phrase)` (dewford_trend.c:151-206). Renvoie TRUE si la
 *  phrase tendance COURANTE (slot 0) a changé. La phrase soumise est TOUJOURS sauvée dans
 *  dewfordTrends[] (insérée par trendiness décroissante). Appelée par easy_chat.c:2980
 *  (sEasyChatScreen->currentPhrase) quand le joueur soumet une phrase au Hall de Poivressel.
 *
 *  ⚠️ TryPutTrendWatcherOnAir(phrase) (TV « Trend Watcher », tv.c) DÉFÉRÉ (TV non porté). */
export function TrySetTrendyPhrase(phrase: ArrayLike<number>): boolean {
  const trends = gSaveBlock1Ptr.dewfordTrends;
  if (IsPhraseInSavedTrends(phrase)) return false;

  if (!FlagGet('FLAG_SYS_CHANGED_DEWFORD_TREND')) {
    FlagSet('FLAG_SYS_CHANGED_DEWFORD_TREND');
    // S'assure que le joueur n'a pas pu recevoir cette phrase par échange d'enregistrements.
    if (!FlagGet('FLAG_SYS_MIX_RECORD')) {
      // 1ère soumission : pose juste les nouveaux mots (pas de check/seed).
      trends[0].words[0] = phrase[0];
      trends[0].words[1] = phrase[1];
      return true;
    }
  }

  // Initialise une DewfordTrend à partir de la phrase donnée.
  const trend: DewfordTrend = {
    trendiness: 0, maxTrendiness: 0, gainingTrendiness: 1, rand: 0,
    words: [phrase[0], phrase[1]],
  };
  SeedTrendRng(trend);

  for (let i = 0; i < SAVED_TRENDS_COUNT; i++) {
    if (CompareTrends(trend, trends[i], SORT_MODE_NORMAL)) {
      // Nouvelle tendance plus « tendance » que trends[i] → décale pour insérer.
      let j = SAVED_TRENDS_COUNT - 1;
      while (j > i) { trends[j] = cloneTrend(trends[j - 1]); j--; }
      trends[i] = cloneTrend(trend);
      // 1:1 : if (i == SAVED_TRENDS_COUNT - 1) TryPutTrendWatcherOnAir(phrase) — TV déféré.
      return i === 0;  // i==0 → la phrase devient la phrase courante.
    }
  }

  // Moins « tendance » que toutes les autres → placée en dernier.
  trends[SAVED_TRENDS_COUNT - 1] = cloneTrend(trend);
  // 1:1 : TryPutTrendWatcherOnAir(phrase) — TV déféré.
  return false;
}

/** 1:1 décomp `IsTrendyPhraseBoring(void)` (dewford_trend.c:298-314) : pose
 *  gSpecialVar_Result = TRUE si la phrase courante (slot 0) est « ennuyeuse » (à peine plus
 *  tendance que slot 1, ne gagne pas, mais slot 1 gagne). Special du Hall de Poivressel. */
export function IsTrendyPhraseBoring(): number {
  const trends = gSaveBlock1Ptr.dewfordTrends;
  let result = 0;
  do {
    if ((trends[0].trendiness - trends[1].trendiness) > 1) break;
    if (trends[0].gainingTrendiness) break;
    if (!trends[1].gainingTrendiness) break;
    result = 1;
  } while (false);
  gSpecialVar.Result = result;
  return result;
}

/** 1:1 décomp `GetDewfordHallPaintingNameIndex(void)` (dewford_trend.c:320-323) :
 *  gSpecialVar_Result = (dewfordTrends[0].words[0] + words[1]) & 7. Le tableau du Hall
 *  choisit 1 nom parmi 8 selon la phrase courante. */
export function GetDewfordHallPaintingNameIndex(): number {
  const trend = gSaveBlock1Ptr.dewfordTrends?.[0];
  const result = (!trend?.words || trend.words.length < 2) ? 0 : (trend.words[0] + trend.words[1]) & 7;
  gSpecialVar.Result = result;
  return result;
}

// Hook globalThis (cycle-safe) consommé par specials-registry pour le special
// BufferTrendyPhraseString (le registry a déféré l'import easy_chat). Exposition dev
// (sondes déterministes) pour la logique de tendance.
{
  const _g = globalThis as Record<string, unknown>;
  _g.UpdateDewfordTrendPerDay = UpdateDewfordTrendPerDay;
  _g.__BufferTrendyPhraseString = BufferTrendyPhraseString;
  _g.__TrySetTrendyPhrase = TrySetTrendyPhrase;
  _g.__IsTrendyPhraseBoring = IsTrendyPhraseBoring;
  _g.__GetDewfordHallPaintingNameIndex = GetDewfordHallPaintingNameIndex;
}
