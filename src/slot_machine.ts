/**
 * slot_machine.ts — Port 1:1 STRICT de
 * `D:/Projet 1/decomps/pokeemeraude/src/slot_machine.c` (casino de Mauville).
 *
 * ⚠️ TRANSCRIPTION PARTIELLE — INERTE (non câblée). Cf. règle 1 du CONTRAT :
 * « Bloc trop gros pour un tour → transcrire une PARTIE en fonctions COMPLÈTES,
 * la laisser INERTE, continuer au tour suivant. Inerte-mais-1:1 > testable-mais-improvisé. »
 *
 * Le fichier décomp fait ~7955 lignes. Ce module transcrit, DANS L'ORDRE décomp,
 * les familles PUREMENT LOGIQUES (RNG / biais / ReelTime-draw / matching /
 * accès-symboles / avance-bobine) — celles qui ne dépendent QUE de `Random()` et
 * de l'état `sSlotMachine`. C'est le cœur « biais Pika/lightning + payouts » demandé.
 *
 * ─── PÉRIMÈTRE TRANSCRIT (ce tour) ───────────────────────────────────────────
 *   • #define / enums / struct SlotMachine + DigitalDisplaySprite  (l.31-421)
 *   • InitSlotMachine — portion logique (l.1191-1223, hors win/music/TV)
 *   • DrawMachineBias, ResetBiasFailure, GetBiasSymbol, ShouldTrySpecialBias,
 *     TrySelectBias_Special, TrySelectBias_Regular                 (l.1797-1907)
 *   • GetReelTimeSpinProbability, GetReelTimeDraw,
 *     ShouldReelTimeMachineExplode, ReelTimeSpeed                  (l.1913-1984)
 *   • GetMatchFromSymbols                                          (l.2078-2089)
 *   • GetSymbolAtRest, GetSymbol, GetReelTimeSymbol,
 *     AdvanceSlotReel(+ToNextSymbol), AdvanceReeltimeReel(+…)      (l.2174-2242)
 *   • Toutes les tables de données PUREMENT logiques               (l.5225-5515)
 *
 * ─── POINT D'ARRÊT (à transcrire aux tours suivants) ─────────────────────────
 *   PlaySlotMachine / CB2_SlotMachineSetup / CB2_SlotMachine et TOUT le sous-arbre
 *   gfx / OAM / sprites / tilemaps / fenêtres / animations ReelTime / Task_Payout
 *   (dépend de PlaySE, IsFanfareTaskInactive, JOY_*, gTasks, FlashMatchLine, …) +
 *   les CheckMatch_* (dépendent de FlashMatchLine, famille match-line gfx).
 *   ⚠️ ASSETS : sSlotMachineSpriteSheets / palettes / tilemaps (gSlotMachine_Gfx,
 *   gSlotMachineReelTime*, …) = blobs binaires → à extraire via le pipeline
 *   (`scripts/` + `public/decomp/`) sous forme TODO-ASSET au câblage du renderer.
 *
 * ─── CÂBLAGE SPECIALS ────────────────────────────────────────────────────────
 *   Le special `PlaySlotMachine` NE PEUT PAS être câblé ce tour : son point
 *   d'entrée `PlaySlotMachine()` amorce `CB2_SlotMachineSetup` (gfx/assets, non
 *   porté). Reste INERTE tant que le renderer n'est pas transcrit. Idem `roulette`.
 *
 * Source de vérité (ne JAMAIS diverger) : decomps/pokeemeraude/src/slot_machine.c
 * + include/constants/slot_machine.h.
 */

import { Random } from './random';

// ─── #define (slot_machine.c:31-117) ────────────────────────────────────────
const MAX_BET = 3;

const SYMBOLS_PER_REEL = 21;
const REEL_SYMBOL_HEIGHT = 24;
const REEL_HEIGHT = SYMBOLS_PER_REEL * REEL_SYMBOL_HEIGHT;

const REELTIME_SYMBOLS = 6;
const REELTIME_SYMBOL_HEIGHT = 20;
const REELTIME_REEL_HEIGHT = REELTIME_SYMBOLS * REELTIME_SYMBOL_HEIGHT;

// Biases (slot_machine.c:55-66)
const BIAS_REPLAY = 1 << 0;
const BIAS_CHERRY = 1 << 1;
const BIAS_LOTAD = 1 << 2;
const BIAS_AZURILL = 1 << 3;
const BIAS_POWER = 1 << 4;
const BIAS_REELTIME = 1 << 5;
const BIAS_MIXED_7 = 1 << 6;
const BIAS_STRAIGHT_7 = 1 << 7;

// (BIAS_7 / BIAS_SPECIAL / BIAS_REGULAR ne sont pas référencés par les familles
//  transcrites ce tour ; conservés en commentaire 1:1 pour la reprise.)
// const BIAS_7       = BIAS_STRAIGHT_7 | BIAS_MIXED_7;
// const BIAS_SPECIAL = BIAS_7 | BIAS_REELTIME;
// const BIAS_REGULAR = BIAS_REPLAY | BIAS_CHERRY | BIAS_LOTAD | BIAS_AZURILL | BIAS_POWER;

// (MAX_EXTRA_TURNS = 4 — utilisé par la famille DecideStop, non transcrite ce tour.)

const REEL_NORMAL_SPEED = 8;
const REEL_HALF_SPEED = 4;
const REEL_QUARTER_SPEED = 2;

// ─── constants/slot_machine.h ───────────────────────────────────────────────
const NUM_SLOT_MACHINE_IDS = 6;
const SLOT_MACHINE_UNLUCKIEST = 0;
const SLOT_MACHINE_UNLUCKIER = 1;
const SLOT_MACHINE_UNLUCKY = 2;
const SLOT_MACHINE_LUCKY = 3;
const SLOT_MACHINE_LUCKIER = 4;
const SLOT_MACHINE_LUCKIEST = 5;

// ─── enum SYMBOL_* (slot_machine.c:76-84) ───────────────────────────────────
const SYMBOL_7_RED = 0;
const SYMBOL_7_BLUE = 1;
const SYMBOL_AZURILL = 2;
const SYMBOL_LOTAD = 3;
const SYMBOL_CHERRY = 4;
const SYMBOL_POWER = 5;
const SYMBOL_REPLAY = 6;

// ─── enum MATCH_* (slot_machine.c:130-141) ──────────────────────────────────
const MATCH_CHERRY = 0; // Cherry in center of first reel
const MATCH_TOPBOT_CHERRY = 1; // Cherry in top/bottom of first reel
const MATCH_REPLAY = 2;
const MATCH_LOTAD = 3;
const MATCH_AZURILL = 4;
const MATCH_POWER = 5;
const MATCH_MIXED_7 = 6; // First two 7's are same color; last is other color
const MATCH_RED_7 = 7;
const MATCH_BLUE_7 = 8;
const MATCH_NONE = 9;

// ─── enum <reel ids> (slot_machine.c:152-157) ───────────────────────────────
const LEFT_REEL = 0;
const MIDDLE_REEL = 1;
const RIGHT_REEL = 2;
const NUM_REELS = 3;

// ─── enum SLOTTASK_* (slot_machine.c:159-189) — 1:1 (état state-machine) ─────
export const SLOTTASK_UNFADE = 0;
// (les autres SLOTTASK_* / PAYOUT_TASK_* / REEL_TASK_* / RT_TASK_* seront
//  transcrits avec les familles de tâches correspondantes.)

// ─── struct SlotMachine (slot_machine.c:367-414) ────────────────────────────
export interface SlotMachine {
    state: number;                    // u8
    machineId: number;                // u8
    pikaPowerBolts: number;           // u8
    luckyGame: number;                // bool8
    machineBias: number;              // u8
    reelTimeDraw: number;             // u8
    didNotFailBias: number;           // bool8
    biasSymbol: number;               // u8
    matches: number;                  // u16
    reelTimeSpinsLeft: number;        // u8
    reelTimeSpinsUsed: number;        // u8
    coins: number;                    // s16
    payout: number;                   // s16
    netCoinLoss: number;              // s16 (never negative)
    bet: number;                      // s16
    reeltimePixelOffset: number;      // s16
    reeltimePosition: number;         // s16
    currentReel: number;              // s16
    reelSpeed: number;                // s16
    reelPixelOffsets: number[];       // s16[NUM_REELS]
    reelShockOffsets: number[];       // u16[NUM_REELS]
    reelPositions: number[];          // s16[NUM_REELS]
    reelExtraTurns: number[];         // s16[NUM_REELS]
    winnerRows: number[];             // s16[NUM_REELS]
    slotReelTasks: number[];          // u8[NUM_REELS]
    digDisplayTaskId: number;         // u8
    pikaPowerBoltTaskId: number;      // u8
    reelTimePikachuSpriteId: number;  // u8
    reelTimeNumberGapSpriteId: number;// u8
    reelTimeExplosionSpriteId: number;// u8
    reelTimeBrokenMachineSpriteId: number; // u8
    reelTimeSmokeSpriteId: number;    // u8
    flashMatchLineSpriteIds: number[];// u8[NUM_MATCH_LINES]
    reelTimeMachineSpriteIds: number[];   // u8[2]
    reelTimeNumberSpriteIds: number[];    // u8[3]
    reelTimeShadowSpriteIds: number[];    // u8[2]
    reelTimeBoltSpriteIds: number[];      // u8[2]
    reelTimePikachuAuraSpriteIds: number[]; // u8[2]
    reelTimeDuckSpriteIds: number[];  // u8[4]
    win0h: number;                    // u16
    win0v: number;                    // u16
    winIn: number;                    // u16
    winOut: number;                   // u16
    backupMapMusic: number;           // u16
    prevMainCb: (() => void) | null;  // MainCallback
}

// ─── struct DigitalDisplaySprite (slot_machine.c:416-421) ───────────────────
export interface DigitalDisplaySprite {
    spriteTemplateId: number; // u8
    dispInfoId: number;       // u8
    spriteId: number;         // s16
}

/**
 * `struct SlotMachine *sSlotMachine` (slot_machine.c) — alloué par
 * `AllocZeroed(sizeof(*sSlotMachine))` dans PlaySlotMachine. Adaptation TS :
 * objet zéro-initialisé fabriqué par `AllocZeroed_SlotMachine()` (précédent
 * déjà porté : credits.ts / autres écrans allouent leur struct en objet TS).
 */
export let sSlotMachine: SlotMachine = AllocZeroed_SlotMachine();

/** Équivalent 1:1 de `AllocZeroed(sizeof(struct SlotMachine))` : tous les
 *  champs à 0 / tableaux de la bonne taille remplis de 0. */
export function AllocZeroed_SlotMachine(): SlotMachine {
    return {
        state: 0, machineId: 0, pikaPowerBolts: 0, luckyGame: 0, machineBias: 0,
        reelTimeDraw: 0, didNotFailBias: 0, biasSymbol: 0, matches: 0,
        reelTimeSpinsLeft: 0, reelTimeSpinsUsed: 0, coins: 0, payout: 0,
        netCoinLoss: 0, bet: 0, reeltimePixelOffset: 0, reeltimePosition: 0,
        currentReel: 0, reelSpeed: 0,
        reelPixelOffsets: [0, 0, 0], reelShockOffsets: [0, 0, 0],
        reelPositions: [0, 0, 0], reelExtraTurns: [0, 0, 0], winnerRows: [0, 0, 0],
        slotReelTasks: [0, 0, 0],
        digDisplayTaskId: 0, pikaPowerBoltTaskId: 0, reelTimePikachuSpriteId: 0,
        reelTimeNumberGapSpriteId: 0, reelTimeExplosionSpriteId: 0,
        reelTimeBrokenMachineSpriteId: 0, reelTimeSmokeSpriteId: 0,
        flashMatchLineSpriteIds: [0, 0, 0, 0, 0], // NUM_MATCH_LINES = 5
        reelTimeMachineSpriteIds: [0, 0], reelTimeNumberSpriteIds: [0, 0, 0],
        reelTimeShadowSpriteIds: [0, 0], reelTimeBoltSpriteIds: [0, 0],
        reelTimePikachuAuraSpriteIds: [0, 0], reelTimeDuckSpriteIds: [0, 0, 0, 0],
        win0h: 0, win0v: 0, winIn: 0, winOut: 0, backupMapMusic: 0, prevMainCb: null,
    };
}

// ════════════════════════════════════════════════════════════════════════════
// TABLES DE DONNÉES PUREMENT LOGIQUES (slot_machine.c:5225-5515)
// ════════════════════════════════════════════════════════════════════════════

// sReelSymbols[NUM_REELS][SYMBOLS_PER_REEL] (slot_machine.c:5225-5296)
const sReelSymbols: number[][] = [
    /* [LEFT_REEL] = */ [
        SYMBOL_7_RED, SYMBOL_CHERRY, SYMBOL_AZURILL, SYMBOL_REPLAY, SYMBOL_POWER,
        SYMBOL_LOTAD, SYMBOL_7_BLUE, SYMBOL_LOTAD, SYMBOL_CHERRY, SYMBOL_POWER,
        SYMBOL_REPLAY, SYMBOL_AZURILL, SYMBOL_7_RED, SYMBOL_POWER, SYMBOL_LOTAD,
        SYMBOL_REPLAY, SYMBOL_AZURILL, SYMBOL_7_BLUE, SYMBOL_POWER, SYMBOL_LOTAD,
        SYMBOL_REPLAY,
    ],
    /* [MIDDLE_REEL] = */ [
        SYMBOL_7_RED, SYMBOL_CHERRY, SYMBOL_REPLAY, SYMBOL_LOTAD, SYMBOL_AZURILL,
        SYMBOL_CHERRY, SYMBOL_REPLAY, SYMBOL_POWER, SYMBOL_POWER, SYMBOL_LOTAD,
        SYMBOL_7_BLUE, SYMBOL_LOTAD, SYMBOL_REPLAY, SYMBOL_CHERRY, SYMBOL_AZURILL,
        SYMBOL_LOTAD, SYMBOL_REPLAY, SYMBOL_CHERRY, SYMBOL_LOTAD, SYMBOL_REPLAY,
        SYMBOL_CHERRY,
    ],
    /* [RIGHT_REEL] = */ [
        SYMBOL_7_RED, SYMBOL_POWER, SYMBOL_7_BLUE, SYMBOL_REPLAY, SYMBOL_LOTAD,
        SYMBOL_AZURILL, SYMBOL_REPLAY, SYMBOL_LOTAD, SYMBOL_POWER, SYMBOL_AZURILL,
        SYMBOL_REPLAY, SYMBOL_LOTAD, SYMBOL_AZURILL, SYMBOL_POWER, SYMBOL_REPLAY,
        SYMBOL_LOTAD, SYMBOL_AZURILL, SYMBOL_POWER, SYMBOL_REPLAY, SYMBOL_LOTAD,
        SYMBOL_CHERRY,
    ],
];

// sReelTimeSymbols[] (slot_machine.c:5298-5300)
const sReelTimeSymbols: number[] = [1, 0, 5, 4, 3, 2];

// sInitialReelPositions[NUM_REELS][2] — col0 normal, col1 lucky (5304-5308)
const sInitialReelPositions: number[][] = [
    /* [LEFT_REEL]   = */ [0, 6],
    /* [MIDDLE_REEL] = */ [0, 10],
    /* [RIGHT_REEL]  = */ [0, 2],
];

// sSpecialDrawOdds[NUM_SLOT_MACHINE_IDS][MAX_BET] (5310-5317)
const sSpecialDrawOdds: number[][] = [];
sSpecialDrawOdds[SLOT_MACHINE_UNLUCKIEST] = [1, 1, 12];
sSpecialDrawOdds[SLOT_MACHINE_UNLUCKIER] = [1, 1, 14];
sSpecialDrawOdds[SLOT_MACHINE_UNLUCKY] = [2, 2, 14];
sSpecialDrawOdds[SLOT_MACHINE_LUCKY] = [2, 2, 14];
sSpecialDrawOdds[SLOT_MACHINE_LUCKIER] = [2, 3, 16];
sSpecialDrawOdds[SLOT_MACHINE_LUCKIEST] = [3, 3, 16];

// sBiasProbabilities_Special[][NUM_SLOT_MACHINE_IDS] (5319-5347)
// Ligne 0 = BIAS_STRAIGHT_7, 1 = BIAS_REELTIME, 2 = BIAS_MIXED_7.
// Colonnes indexées par SLOT_MACHINE_* (UNLUCKIEST..LUCKIEST = 0..5).
const sBiasProbabilities_Special: number[][] = [
    [25, 25, 30, 40, 40, 50], // BIAS_STRAIGHT_7
    [25, 25, 30, 30, 35, 35], // BIAS_REELTIME
    [25, 25, 30, 25, 25, 30], // BIAS_MIXED_7
];

// sBiasProbabilities_Regular[][NUM_SLOT_MACHINE_IDS] (5349-5395)
// Ligne 0 = BIAS_POWER, 1 = BIAS_AZURILL, 2 = BIAS_LOTAD, 3 = BIAS_CHERRY, 4 = BIAS_REPLAY.
const sBiasProbabilities_Regular: number[][] = [
    [20, 25, 25, 20, 25, 25], // BIAS_POWER
    [12, 15, 15, 18, 19, 22], // BIAS_AZURILL
    [25, 25, 25, 30, 30, 40], // BIAS_LOTAD
    [25, 25, 20, 20, 15, 15], // BIAS_CHERRY
    [40, 40, 35, 35, 40, 40], // BIAS_REPLAY
];

// sReelTimeProbabilities_NormalGame[][17] — ligne = nb de spins (0..5) (5412-5419)
const sReelTimeProbabilities_NormalGame: number[][] = [
    [243, 243, 243, 80, 80, 80, 80, 40, 40, 40, 40, 40, 40, 5, 5, 5, 5],       // 0 spins
    [5, 5, 5, 150, 150, 150, 150, 130, 130, 130, 130, 130, 130, 100, 100, 100, 5], // 1 spin
    [4, 4, 4, 20, 20, 20, 20, 80, 80, 80, 80, 80, 80, 100, 100, 100, 40],      // 2 spins
    [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 45, 45, 45, 100],                  // 3 spins
    [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 100],                     // 4 spins
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6],                       // 5 spins
];

// sReelTimeProbabilities_LuckyGame[][17] (5436-5443)
const sReelTimeProbabilities_LuckyGame: number[][] = [
    [243, 243, 243, 200, 200, 200, 200, 160, 160, 160, 160, 160, 160, 70, 70, 70, 5], // 0 spins
    [5, 5, 5, 25, 25, 25, 25, 5, 5, 5, 5, 5, 5, 2, 2, 2, 6],                    // 1 spin
    [4, 4, 4, 25, 25, 25, 25, 30, 30, 30, 30, 30, 30, 40, 40, 40, 35],          // 2 spins
    [2, 2, 2, 3, 3, 3, 3, 30, 30, 30, 30, 30, 30, 100, 100, 100, 50],           // 3 spins
    [1, 1, 1, 2, 2, 2, 2, 30, 30, 30, 30, 30, 30, 40, 40, 40, 100],             // 4 spins
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 60],                       // 5 spins
];

// sReelTimeExplodeProbability[] (5445-5447)
const sReelTimeExplodeProbability: number[] = [128, 175, 200, 225, 256];

// sReelTimeSpeed_Probabilities[][2] — col0 half-speed, col1 base quarter-speed (5451-5457)
const sReelTimeSpeed_Probabilities: number[][] = [
    [10, 5],
    [10, 10],
    [10, 15],
    [10, 25],
    [10, 35],
];

// sQuarterSpeed_ProbabilityBoost[] (5460-5462)
const sQuarterSpeed_ProbabilityBoost: number[] = [0, 5, 10, 15, 20];

// sBiasSymbols[] (5464-5473) — symbole associé à chaque bit de bias
const sBiasSymbols: number[] = [
    SYMBOL_REPLAY,  // BIAS_REPLAY
    SYMBOL_CHERRY,  // BIAS_CHERRY
    SYMBOL_LOTAD,   // BIAS_LOTAD
    SYMBOL_AZURILL, // BIAS_AZURILL
    SYMBOL_POWER,   // BIAS_POWER
    SYMBOL_7_RED,   // BIAS_REELTIME
    SYMBOL_7_RED,   // BIAS_MIXED_7
    SYMBOL_7_RED,   // BIAS_STRAIGHT_7
];

// sBiasesSpecial[] (5475-5477)
const sBiasesSpecial: number[] = [BIAS_STRAIGHT_7, BIAS_REELTIME, BIAS_MIXED_7];

// sBiasesRegular[] (5479-5481)
const sBiasesRegular: number[] = [BIAS_POWER, BIAS_AZURILL, BIAS_LOTAD, BIAS_CHERRY, BIAS_REPLAY];

// sSymbolToMatch[] (5483-5491) — indexé par SYMBOL_*
const sSymbolToMatch: number[] = [];
sSymbolToMatch[SYMBOL_7_RED] = MATCH_RED_7;
sSymbolToMatch[SYMBOL_7_BLUE] = MATCH_BLUE_7;
sSymbolToMatch[SYMBOL_AZURILL] = MATCH_AZURILL;
sSymbolToMatch[SYMBOL_LOTAD] = MATCH_LOTAD;
sSymbolToMatch[SYMBOL_CHERRY] = MATCH_CHERRY;
sSymbolToMatch[SYMBOL_POWER] = MATCH_POWER;
sSymbolToMatch[SYMBOL_REPLAY] = MATCH_REPLAY;

// sSlotMatchFlags[] (5493-5503) — indexé par MATCH_*
const sSlotMatchFlags: number[] = [];
sSlotMatchFlags[MATCH_CHERRY] = 1 << MATCH_CHERRY;
sSlotMatchFlags[MATCH_TOPBOT_CHERRY] = 1 << MATCH_TOPBOT_CHERRY;
sSlotMatchFlags[MATCH_REPLAY] = 1 << MATCH_REPLAY;
sSlotMatchFlags[MATCH_LOTAD] = 1 << MATCH_LOTAD;
sSlotMatchFlags[MATCH_AZURILL] = 1 << MATCH_AZURILL;
sSlotMatchFlags[MATCH_POWER] = 1 << MATCH_POWER;
sSlotMatchFlags[MATCH_MIXED_7] = 1 << MATCH_MIXED_7;
sSlotMatchFlags[MATCH_RED_7] = 1 << MATCH_RED_7;
sSlotMatchFlags[MATCH_BLUE_7] = 1 << MATCH_BLUE_7;

// sSlotPayouts[] (5505-5515) — indexé par MATCH_*
const sSlotPayouts: number[] = [];
sSlotPayouts[MATCH_CHERRY] = 2;
sSlotPayouts[MATCH_TOPBOT_CHERRY] = 4;
sSlotPayouts[MATCH_REPLAY] = 0;
sSlotPayouts[MATCH_LOTAD] = 6;
sSlotPayouts[MATCH_AZURILL] = 12;
sSlotPayouts[MATCH_POWER] = 3;
sSlotPayouts[MATCH_MIXED_7] = 90;
sSlotPayouts[MATCH_RED_7] = 300;
sSlotPayouts[MATCH_BLUE_7] = 300;

// ════════════════════════════════════════════════════════════════════════════
// FAMILLE : BIAIS (slot_machine.c:1797-1907)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `DrawMachineBias` (slot_machine.c:1797-1822). */
export function DrawMachineBias(): void {
    let whichBias: number;

    if (sSlotMachine.reelTimeSpinsLeft === 0) {
        if (!(sSlotMachine.machineBias & (BIAS_STRAIGHT_7 | BIAS_MIXED_7))) {
            if (ShouldTrySpecialBias()) {
                whichBias = TrySelectBias_Special();
                if (whichBias !== sBiasesSpecial.length) { // A bias was selected
                    sSlotMachine.machineBias |= sBiasesSpecial[whichBias];

                    // ReelTime was not selected; don't add other biases
                    if (whichBias !== 1) return;
                }
            }

            whichBias = TrySelectBias_Regular();
            if (whichBias !== sBiasesRegular.length) // A bias was selected
                sSlotMachine.machineBias |= sBiasesRegular[whichBias];
        }
    }
}

/** 1:1 `ResetBiasFailure` (slot_machine.c:1825-1830). */
export function ResetBiasFailure(): void {
    sSlotMachine.didNotFailBias = 0; // FALSE
    if (sSlotMachine.machineBias)
        sSlotMachine.didNotFailBias = 1; // TRUE
}

/** 1:1 `GetBiasSymbol` (slot_machine.c:1833-1844). */
export function GetBiasSymbol(machineBias: number): number {
    let i: number;

    for (i = 0; i < 8; i++) {
        if (machineBias & 1)
            return sBiasSymbols[i];
        machineBias >>= 1;
    }
    return 0;
}

/** 1:1 `ShouldTrySpecialBias` (slot_machine.c:1853-1859).
 *  `u8 rval = Random();` → troncature au low byte (& 0xff). */
export function ShouldTrySpecialBias(): boolean {
    const rval = Random() & 0xff;
    if (sSpecialDrawOdds[sSlotMachine.machineId][sSlotMachine.bet - 1] > rval)
        return true;
    return false;
}

/** 1:1 `TrySelectBias_Special` (slot_machine.c:1866-1878). */
export function TrySelectBias_Special(): number {
    let whichBias: number;

    for (whichBias = 0; whichBias < sBiasesSpecial.length; whichBias++) {
        const rval = Random() & 0xff;
        const value = sBiasProbabilities_Special[whichBias][sSlotMachine.machineId];
        if (value > rval)
            break;
    }
    return whichBias;
}

/** 1:1 `TrySelectBias_Regular` (slot_machine.c:1880-1907). */
export function TrySelectBias_Regular(): number {
    let whichBias: number;

    for (whichBias = 0; whichBias < sBiasesRegular.length; whichBias++) {
        const rval = Random() & 0xff;
        let value = sBiasProbabilities_Regular[whichBias][sSlotMachine.machineId];

        // Boost odds of BIAS_POWER if it's a lucky game.
        if (whichBias === 0 && sSlotMachine.luckyGame === 1 /* TRUE */) {
            value += 10;
            if (value > 0x100)
                value = 0x100;
        }
        // Reduce odds of BIAS_REPLAY if it's a lucky game
        else if (whichBias === 4 && sSlotMachine.luckyGame === 1 /* TRUE */) {
            value -= 10;
            if (value < 0)
                value = 0;
        }
        if (value > rval)
            break;
    }
    return whichBias;
}

// ════════════════════════════════════════════════════════════════════════════
// FAMILLE : REELTIME DRAW / SPEED (slot_machine.c:1913-1984)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `GetReelTimeSpinProbability` (slot_machine.c:1913-1919). */
export function GetReelTimeSpinProbability(spins: number): number {
    if (sSlotMachine.luckyGame === 0 /* FALSE */)
        return sReelTimeProbabilities_NormalGame[spins][sSlotMachine.pikaPowerBolts];
    else
        return sReelTimeProbabilities_LuckyGame[spins][sSlotMachine.pikaPowerBolts];
}

/** 1:1 `GetReelTimeDraw` (slot_machine.c:1930-1946).
 *  `rval` est u8 → `Random() & 0xff`. */
export function GetReelTimeDraw(): void {
    let rval: number;
    let spins: number;

    sSlotMachine.reelTimeDraw = 0;
    rval = Random() & 0xff;
    if (rval < GetReelTimeSpinProbability(0))
        return;
    for (spins = 5; spins > 0; spins--) {
        rval = Random() & 0xff;
        if (rval < GetReelTimeSpinProbability(spins))
            break;
    }
    sSlotMachine.reelTimeDraw = spins;
}

/** 1:1 `ShouldReelTimeMachineExplode` (slot_machine.c:1950-1957). */
export function ShouldReelTimeMachineExplode(check: number): boolean {
    const rval = Random() & 0xff;
    if (rval < sReelTimeExplodeProbability[check])
        return true;
    else
        return false;
}

/** 1:1 `ReelTimeSpeed` (slot_machine.c:1959-1984). */
export function ReelTimeSpeed(): number {
    let i = 0;
    let rval: number;
    let value: number;
    if (sSlotMachine.netCoinLoss >= 300)
        i = 4;
    else if (sSlotMachine.netCoinLoss >= 250)
        i = 3;
    else if (sSlotMachine.netCoinLoss >= 200)
        i = 2;
    else if (sSlotMachine.netCoinLoss >= 150)
        i = 1;

    rval = Random() % 100;
    value = sReelTimeSpeed_Probabilities[i][0];
    if (rval < value)
        return REEL_HALF_SPEED;

    rval = Random() % 100;
    value = sReelTimeSpeed_Probabilities[i][1] + sQuarterSpeed_ProbabilityBoost[sSlotMachine.reelTimeSpinsUsed];
    if (rval < value)
        return REEL_QUARTER_SPEED;

    return REEL_NORMAL_SPEED;
}

// ════════════════════════════════════════════════════════════════════════════
// FAMILLE : MATCHING (partie pure — slot_machine.c:2078-2089)
// NOTE : CheckMatch / CheckMatch_CenterRow / _TopAndBottom / _Diagonals
//        dépendent de FlashMatchLine (gfx, famille match-line) → transcrites au
//        tour du renderer. Les tables sSlotPayouts/sSlotMatchFlags sont prêtes.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `GetMatchFromSymbols` (slot_machine.c:2078-2089). */
export function GetMatchFromSymbols(sym1: number, sym2: number, sym3: number): number {
    if (sym1 === sym2 && sym1 === sym3)
        return sSymbolToMatch[sym1];
    if (sym1 === SYMBOL_7_RED && sym2 === SYMBOL_7_RED && sym3 === SYMBOL_7_BLUE)
        return MATCH_MIXED_7;
    if (sym1 === SYMBOL_7_BLUE && sym2 === SYMBOL_7_BLUE && sym3 === SYMBOL_7_RED)
        return MATCH_MIXED_7;
    if (sym1 === SYMBOL_CHERRY)
        return MATCH_CHERRY;
    return MATCH_NONE;
}

// ════════════════════════════════════════════════════════════════════════════
// FAMILLE : ACCÈS SYMBOLES / AVANCE BOBINE (slot_machine.c:2174-2242)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `GetSymbolAtRest` (slot_machine.c:2174-2180). */
export function GetSymbolAtRest(reel: number, offset: number): number {
    let pos = (sSlotMachine.reelPositions[reel] + offset) % SYMBOLS_PER_REEL;
    if (pos < 0)
        pos += SYMBOLS_PER_REEL;
    return sReelSymbols[reel][pos];
}

/** 1:1 `GetSymbol` (slot_machine.c:2183-2190). */
export function GetSymbol(reel: number, offset: number): number {
    let inc = 0;
    const pixelOffset = sSlotMachine.reelPixelOffsets[reel] % REEL_SYMBOL_HEIGHT;
    if (pixelOffset !== 0)
        inc = -1;
    return GetSymbolAtRest(reel, offset + inc);
}

/** 1:1 `GetReelTimeSymbol` (slot_machine.c:2192-2198). */
export function GetReelTimeSymbol(offset: number): number {
    let newPosition = (sSlotMachine.reeltimePosition + offset) % REELTIME_SYMBOLS;
    if (newPosition < 0)
        newPosition += REELTIME_SYMBOLS;
    return sReelTimeSymbols[newPosition];
}

/** 1:1 `AdvanceSlotReel` (slot_machine.c:2200-2205).
 *  `s16 pos = SYMBOLS_PER_REEL - offset/HEIGHT` : la division C est entière
 *  (troncature vers 0) → `Math.trunc` (offset toujours ≥ 0 ici, `| 0` suffirait). */
export function AdvanceSlotReel(reelIndex: number, value: number): void {
    sSlotMachine.reelPixelOffsets[reelIndex] += value;
    sSlotMachine.reelPixelOffsets[reelIndex] %= REEL_HEIGHT;
    sSlotMachine.reelPositions[reelIndex] =
        SYMBOLS_PER_REEL - Math.trunc(sSlotMachine.reelPixelOffsets[reelIndex] / REEL_SYMBOL_HEIGHT);
}

/** 1:1 `AdvanceSlotReelToNextSymbol` (slot_machine.c:2209-2220). */
export function AdvanceSlotReelToNextSymbol(reelIndex: number, value: number): number {
    let offset = sSlotMachine.reelPixelOffsets[reelIndex] % REEL_SYMBOL_HEIGHT;
    if (offset !== 0) {
        if (offset < value)
            value = offset;
        AdvanceSlotReel(reelIndex, value);
        offset = sSlotMachine.reelPixelOffsets[reelIndex] % REEL_SYMBOL_HEIGHT;
    }
    return offset;
}

/** 1:1 `AdvanceReeltimeReel` (slot_machine.c:2222-2227). */
export function AdvanceReeltimeReel(value: number): void {
    sSlotMachine.reeltimePixelOffset += value;
    sSlotMachine.reeltimePixelOffset %= REELTIME_REEL_HEIGHT;
    sSlotMachine.reeltimePosition =
        REELTIME_SYMBOLS - Math.trunc(sSlotMachine.reeltimePixelOffset / REELTIME_SYMBOL_HEIGHT);
}

/** 1:1 `AdvanceReeltimeReelToNextSymbol` (slot_machine.c:2231-2242). */
export function AdvanceReeltimeReelToNextSymbol(value: number): number {
    let offset = sSlotMachine.reeltimePixelOffset % REELTIME_SYMBOL_HEIGHT;
    if (offset !== 0) {
        if (offset < value)
            value = offset;
        AdvanceReeltimeReel(value);
        offset = sSlotMachine.reeltimePixelOffset % REELTIME_SYMBOL_HEIGHT;
    }
    return offset;
}

// ════════════════════════════════════════════════════════════════════════════
// InitSlotMachine — PORTION LOGIQUE (slot_machine.c:1191-1223)
// NOTE : SlotMachine_InitFromTask (task), win/GetCurrentMapMusic (gfx/audio) et
//        AlertTVThatPlayerPlayedSlotMachine (TV) transcrits au câblage du renderer.
//        GetCoins reste importable mais coupe la « pureté » du module → laissée
//        au tour de câblage. Ici : init des champs purement numériques + bobines.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 portion logique de `InitSlotMachine` (slot_machine.c:1196-1221) —
 *  hors InitFromTask / coins / win / musique / TV (dépendances non portées). */
export function InitSlotMachine_LogicOnly(): void {
    let i: number;

    sSlotMachine.state = SLOTTASK_UNFADE;
    sSlotMachine.pikaPowerBolts = 0;
    sSlotMachine.luckyGame = Random() & 1;
    sSlotMachine.machineBias = 0;
    sSlotMachine.matches = 0;
    sSlotMachine.reelTimeSpinsLeft = 0;
    sSlotMachine.reelTimeSpinsUsed = 0;
    sSlotMachine.payout = 0;
    sSlotMachine.netCoinLoss = 0;
    sSlotMachine.bet = 0;
    sSlotMachine.currentReel = LEFT_REEL;
    sSlotMachine.reelSpeed = REEL_NORMAL_SPEED;

    for (i = 0; i < NUM_REELS; i++) {
        sSlotMachine.reelShockOffsets[i] = 0;
        sSlotMachine.reelPositions[i] = sInitialReelPositions[i][sSlotMachine.luckyGame] % SYMBOLS_PER_REEL;
        sSlotMachine.reelPixelOffsets[i] = REEL_HEIGHT - sSlotMachine.reelPositions[i] * REEL_SYMBOL_HEIGHT;
        sSlotMachine.reelPixelOffsets[i] %= REEL_HEIGHT;
    }
}
