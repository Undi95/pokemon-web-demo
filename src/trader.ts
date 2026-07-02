/**
 * trader.ts — Port 1:1 STRICT (MIROIR partiel) de `src/trader.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/trader.c`.
 *
 * Périmètre porté : le SEEDING new-game (`TraderSetup`, appelé par
 * `SetupTrader` → `SetMauvilleOldMan`) + `Trader_ResetFlag`. Le menu
 * d'échange de décorations (CreateAvailableDecorationsMenu et la chaîne
 * Task_*) = chantier ultérieur (couplé menu/decoration UI).
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { gGameLanguage } from './main';
import { NUM_TRADER_ITEMS } from '../include/constants/global';
import {
  DECOR_DUSKULL_DOLL, DECOR_BALL_CUSHION, DECOR_TIRE, DECOR_PRETTY_FLOWERS,
} from '../include/constants/decorations';

/** 1:1 décomp `sDefaultTraderNames[NUM_TRADER_ITEMS]` (trader.c:18-24) =
 *  gText_Tristan/Philip/Dennis/Roberto — strings FR ROM (strings.json build FR,
 *  texte cité 1:1, pas un enum dérivable). */
const sDefaultTraderNames: readonly string[] = [
  'FRANCK',   // gText_Tristan
  'AYMERIC',  // gText_Philip
  'GILLES',   // gText_Dennis
  'ROBERTO',  // gText_Roberto
];

/** 1:1 décomp `sDefaultTraderDecorations[NUM_TRADER_ITEMS]` (trader.c:26-32). */
const sDefaultTraderDecorations: readonly number[] = [
  DECOR_DUSKULL_DOLL,
  DECOR_BALL_CUSHION,
  DECOR_TIRE,
  DECOR_PRETTY_FLOWERS,
];

// 1:1 décomp constants/mauville_old_man.h:6 (importer mauville_old_man.ts ici
// créerait un cycle trader ↔ mauville_old_man — même valeur, même nom).
const MAUVILLE_MAN_TRADER = 2;

/** 1:1 décomp `void TraderSetup(void)` (trader.c:34-48). */
export function TraderSetup(): void {
  const playerNames: string[] = [];
  const decorations: number[] = [];
  const language: number[] = [];
  for (let i = 0; i < NUM_TRADER_ITEMS; i++) {
    playerNames.push(sDefaultTraderNames[i]);          // 1:1 :44 StringCopy
    decorations.push(sDefaultTraderDecorations[i]);    // 1:1 :45
    language.push(gGameLanguage);                      // 1:1 :46 GAME_LANGUAGE
  }
  gSaveBlock1Ptr.oldMan = {
    id: MAUVILLE_MAN_TRADER,
    kind: 'trader',
    alreadyTraded: 0,   // 1:1 :40 trader->alreadyTraded = FALSE
    playerNames,
    decorations,
    language,
  };
}

/** 1:1 décomp `void Trader_ResetFlag(void)` (trader.c:50-54). */
export function Trader_ResetFlag(): void {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'trader') om.alreadyTraded = 0;
}
