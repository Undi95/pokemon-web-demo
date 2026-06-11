/**
 * scanline_effect.ts — Port MIROIR 1:1 de la décomp `src/scanline_effect.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/scanline_effect.c
 *                  + include/scanline_effect.h
 *
 * Système d'effet par-scanline : à chaque HBlank, un DMA copie une valeur de
 * `gScanlineEffectRegBuffers[srcBuffer][ligne]` vers un registre vidéo (ex.
 * REG_BG3HOFS) → chaque ligne de l'écran a un offset BG différent (scroll
 * « cisaillé » de l'intro de combat, vagues d'eau, etc.).
 *
 * === Adaptations HW (// HW-emu) — la LOGIQUE reste 1:1 ===
 *  - Pas de DMA matériel. Le « DMA HBlank » est émulé par `rt.gba.setHBlankCallback`
 *    que le compositor appelle AVANT de rendre chaque scanline (= exactement le
 *    timing HBlank du GBA) ; le cb écrit `gScanlineEffectRegBuffers[srcBuffer][y]`
 *    dans le registre cible (= mute `bg(n).config.hofs/vofs`).
 *  - `dmaDest` = REG_OFFSET du registre (0x10..0x1E) au lieu d'un pointeur.
 *  - Double-buffer (`srcBuffer ^= 1`) élidé : pas de DMA concurrent en JS
 *    mono-thread (le buffer est rempli au main-loop puis lu au rendu de la même
 *    frame). Le résultat visuel est identique. `srcBuffer` reste donc fixe.
 *  - Primitives runtime (setHBlankCallback, bg config, CreateTask/gTasks) via le
 *    runtime central `globalThis.__rt` (lazy → évite les cycles ESM).
 */
import { gSineTable } from './trig';

// ─── Runtime central (HW-emu, lazy) ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rt(): any { return (globalThis as any).__rt; }

// ─── Constantes (1:1 gba/io_reg.h + scanline_effect.h) ─────────────────────
// Exportée : les consommateurs (Dig/Extrasensory/AcidArmor) composent
// `dmaDest: REG_OFFSET_BG0HOFS + SCANLINE_EFFECT_REG_*` (= &REG_BGnHOFS du C).
export const REG_OFFSET_BG0HOFS = 0x10;  // base ; +regOffset relatif = BGnH/VOFS
const DISPLAY_HEIGHT = 160;
const TASK_NONE = 0xFF;

/** 1:1 `SCANLINE_EFFECT_DMACNT_16BIT/32BIT` (scanline_effect.h:5-6). HW-emu : on
 *  n'utilise que la distinction 16/32 bit (→ CopyValue16/32Bit). Valeurs-marqueurs. */
export const SCANLINE_EFFECT_DMACNT_16BIT = 0x0016;
export const SCANLINE_EFFECT_DMACNT_32BIT = 0x0032;

/** 1:1 `SCANLINE_EFFECT_REG_*` (scanline_effect.h:8-15) : offset RELATIF (bytes)
 *  depuis REG_ADDR_BG0HOFS. */
export const SCANLINE_EFFECT_REG_BG0HOFS = 0x00;
export const SCANLINE_EFFECT_REG_BG0VOFS = 0x02;
export const SCANLINE_EFFECT_REG_BG1HOFS = 0x04;
export const SCANLINE_EFFECT_REG_BG1VOFS = 0x06;
export const SCANLINE_EFFECT_REG_BG2HOFS = 0x08;
export const SCANLINE_EFFECT_REG_BG2VOFS = 0x0A;
export const SCANLINE_EFFECT_REG_BG3HOFS = 0x0C;
export const SCANLINE_EFFECT_REG_BG3VOFS = 0x0E;

// ─── Types (1:1 scanline_effect.h:17-36) ────────────────────────────────────
export interface ScanlineEffectParams {
  dmaDest: number;     // HW-emu : REG_OFFSET (0x10..0x1E) au lieu d'un pointeur
  dmaControl: number;
  initState: number;
  unused9?: number;
}

interface ScanlineEffect {
  dmaSrcBuffers: [number, number];  // HW-emu : index de buffer (0/1) au lieu d'un pointeur
  dmaDest: number;
  dmaControl: number;
  setFirstScanlineReg: () => void;
  srcBuffer: number;
  state: number;
  unused16: number;
  unused17: number;
  waveTaskId: number;
}

// ─── Globals (1:1 EWRAM_DATA scanline_effect.c:13-19) ───────────────────────
/** Per-scanline register values. Double-buffered (décomp). [2][0x3C0]. */
export const gScanlineEffectRegBuffers: [Uint16Array, Uint16Array] = [
  new Uint16Array(0x3C0),
  new Uint16Array(0x3C0),
];

export const gScanlineEffect: ScanlineEffect = {
  dmaSrcBuffers: [0, 1],
  dmaDest: 0,
  dmaControl: 0,
  setFirstScanlineReg: () => { /* posé par SetParams */ },
  srcBuffer: 0,
  state: 0,
  unused16: 0,
  unused17: 0,
  waveTaskId: TASK_NONE,
};

let sShouldStopWaveTask = false;

// ─── HW-emu : écrit une valeur de buffer dans le registre BGnH/VOFS ─────────
// (= ce que le DMA fait vers REG_ADDR_BGnHOFS). dmaDest est un REG_OFFSET absolu.
function _applyRegFromValue(dmaDest: number, value: number): void {
  const off = dmaDest - REG_OFFSET_BG0HOFS;           // 0x00..0x0E
  const bgIndex = Math.min(3, Math.max(0, Math.floor(off / 4)));
  const isVofs = (off % 4) === 2;
  const bg = rt()?.gba?.bg(bgIndex);
  if (!bg) return;
  // Le compositor fait un modulo positif (screenSize) → 0xFF10 ≡ -240, etc.
  if (isVofs) bg.config.vofs = value & 0xFFFF;
  else bg.config.hofs = value & 0xFFFF;
}

// ─── ScanlineEffect_Stop (1:1 scanline_effect.c:21-30) ──────────────────────
export function ScanlineEffect_Stop(): void {
  gScanlineEffect.state = 0;
  try { rt()?.gba?.setHBlankCallback(null); } catch { /* runtime absent */ }  // DmaStop(0)
  if (gScanlineEffect.waveTaskId !== TASK_NONE) {
    try { rt()?.DestroyTask?.(gScanlineEffect.waveTaskId); } catch { /* */ }
    gScanlineEffect.waveTaskId = TASK_NONE;
  }
}

// ─── ScanlineEffect_Clear (1:1 scanline_effect.c:32-44) ─────────────────────
export function ScanlineEffect_Clear(): void {
  gScanlineEffectRegBuffers[0].fill(0);
  gScanlineEffectRegBuffers[1].fill(0);
  gScanlineEffect.dmaSrcBuffers[0] = 0;
  gScanlineEffect.dmaSrcBuffers[1] = 0;
  gScanlineEffect.dmaDest = 0;
  gScanlineEffect.dmaControl = 0;
  gScanlineEffect.srcBuffer = 0;
  gScanlineEffect.state = 0;
  gScanlineEffect.unused16 = 0;
  gScanlineEffect.unused17 = 0;
  gScanlineEffect.waveTaskId = TASK_NONE;
}

// ─── CopyValue16/32Bit (1:1 scanline_effect.c:101-115) ──────────────────────
// Copie manuelle de la 1re scanline (le DMA HBlank ne s'active qu'après).
function CopyValue16Bit(): void {
  _applyRegFromValue(gScanlineEffect.dmaDest, gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][0]);
}
function CopyValue32Bit(): void {
  // 1:1 : `*(vu32*)dest = *(vu32*)src` = écrit les DEUX registres adjacents
  // (ex. BG2HOFS+BG2VOFS) depuis le buffer entrelacé [0]=HOFS, [1]=VOFS.
  const buf = gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer];
  _applyRegFromValue(gScanlineEffect.dmaDest, buf[0]);
  _applyRegFromValue(gScanlineEffect.dmaDest + 2, buf[1]);
}

// ─── ScanlineEffect_SetParams (1:1 scanline_effect.c:46-70) ─────────────────
export function ScanlineEffect_SetParams(params: ScanlineEffectParams): void {
  if (params.dmaControl === SCANLINE_EFFECT_DMACNT_16BIT) {
    // HW-emu : dmaSrcBuffers = index (le décomp pointe sur [buf]+1 pour la 2e
    // scanline car le 1er DMA a lieu après la 1re scanline ; ici le cb gère y direct).
    gScanlineEffect.dmaSrcBuffers[0] = 0;
    gScanlineEffect.dmaSrcBuffers[1] = 1;
    gScanlineEffect.setFirstScanlineReg = CopyValue16Bit;
  } else {
    gScanlineEffect.dmaSrcBuffers[0] = 0;
    gScanlineEffect.dmaSrcBuffers[1] = 1;
    gScanlineEffect.setFirstScanlineReg = CopyValue32Bit;
  }
  gScanlineEffect.dmaControl = params.dmaControl;
  gScanlineEffect.dmaDest = params.dmaDest;
  gScanlineEffect.state = params.initState;
  gScanlineEffect.unused16 = params.unused9 ?? 0;
  gScanlineEffect.unused17 = params.unused9 ?? 0;
}

// ─── ScanlineEffect_InitHBlankDmaTransfer (1:1 scanline_effect.c:72-96) ──────
// Appelé chaque VBlank (runtime via __scanlineEffectTick).
export function ScanlineEffect_InitHBlankDmaTransfer(): void {
  if (gScanlineEffect.state === 0) {
    return;
  } else if (gScanlineEffect.state === 3) {
    gScanlineEffect.state = 0;
    try { rt()?.gba?.setHBlankCallback(null); } catch { /* */ }  // DmaStop(0)
    sShouldStopWaveTask = true;
  } else {
    // DmaSet(0, &buffer[srcBuffer], dmaDest, HBLANK|REPEAT) HW-emu : installe un
    // cb HBlank qui écrit buffer[srcBuffer][y] dans le registre dmaDest chaque scanline.
    // Mode 32BIT (1:1 DMA_32BIT) : 4 bytes/HBlank = les DEUX registres adjacents
    // (HOFS+VOFS) depuis le buffer entrelacé [y*2]/[y*2+1] (cf. AcidArmor).
    const r = rt();
    if (!r?.gba?.setHBlankCallback) return;
    r.gba.setHBlankCallback((y: number) => {
      if (gScanlineEffect.state === 0) return;
      if (y >= 0 && y < DISPLAY_HEIGHT) {
        const buf = gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer];
        if (gScanlineEffect.dmaControl === SCANLINE_EFFECT_DMACNT_32BIT) {
          _applyRegFromValue(gScanlineEffect.dmaDest, buf[y * 2]);
          _applyRegFromValue(gScanlineEffect.dmaDest + 2, buf[y * 2 + 1]);
        } else {
          _applyRegFromValue(gScanlineEffect.dmaDest, buf[y]);
        }
      }
    });
    gScanlineEffect.setFirstScanlineReg();  // 1re scanline manuelle (1:1)
    // gScanlineEffect.srcBuffer ^= 1;  // HW double-buffer élidé (cf. en-tête)
  }
}

// Le runtime appelle ce tick chaque frame (= VBlankCB → ScanlineEffect_InitHBlankDmaTransfer).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__scanlineEffectTick = ScanlineEffect_InitHBlankDmaTransfer;

// ─── Wave effect (1:1 scanline_effect.c:117-254) ────────────────────────────
// Task data fields (1:1 #define scanline_effect.c:117-124).
const T_START_LINE = 0, T_END_LINE = 1, T_WAVE_LENGTH = 2, T_SRC_BUFFER_OFFSET = 3;
const T_FRAMES_UNTIL_MOVE = 4, T_DELAY_INTERVAL = 5, T_REG_OFFSET = 6, T_APPLY_BATTLE_BG_OFFSETS = 7;

/** HW-emu : gBattle_BGn_X/Y (battle_main.c globals) exposés sur globalThis. */
function _battleBgOffset(regOffset: number): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  switch (regOffset) {
    case SCANLINE_EFFECT_REG_BG0HOFS: return g.gBattle_BG0_X | 0;
    case SCANLINE_EFFECT_REG_BG0VOFS: return g.gBattle_BG0_Y | 0;
    case SCANLINE_EFFECT_REG_BG1HOFS: return g.gBattle_BG1_X | 0;
    case SCANLINE_EFFECT_REG_BG1VOFS: return g.gBattle_BG1_Y | 0;
    case SCANLINE_EFFECT_REG_BG2HOFS: return g.gBattle_BG2_X | 0;
    case SCANLINE_EFFECT_REG_BG2VOFS: return g.gBattle_BG2_Y | 0;
    case SCANLINE_EFFECT_REG_BG3HOFS: return g.gBattle_BG3_X | 0;
    case SCANLINE_EFFECT_REG_BG3VOFS: return g.gBattle_BG3_Y | 0;
    default: return 0;
  }
}

// 1:1 scanline_effect.c:126-195
function TaskFunc_UpdateWavePerFrame(taskId: number): void {
  const r = rt();
  const task = r?.gTasks?.get?.(taskId);  // HW-emu : rt.gTasks = Map
  if (!task) return;
  const data: number[] = task.data;
  let value = 0;
  let i: number;
  let offset: number;

  if (sShouldStopWaveTask) {
    r.DestroyTask(taskId);
    gScanlineEffect.waveTaskId = TASK_NONE;
    return;
  }

  if (data[T_APPLY_BATTLE_BG_OFFSETS]) {
    value = _battleBgOffset(data[T_REG_OFFSET]);
  }

  const sBuf = gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer];
  if (data[T_FRAMES_UNTIL_MOVE] !== 0) {
    data[T_FRAMES_UNTIL_MOVE]--;
    offset = data[T_SRC_BUFFER_OFFSET] + 320;
    for (i = data[T_START_LINE]; i < data[T_END_LINE]; i++) {
      sBuf[i] = (gScanlineEffectRegBuffers[0][offset] + value) & 0xFFFF;
      offset++;
    }
  } else {
    data[T_FRAMES_UNTIL_MOVE] = data[T_DELAY_INTERVAL];
    offset = data[T_SRC_BUFFER_OFFSET] + 320;
    for (i = data[T_START_LINE]; i < data[T_END_LINE]; i++) {
      sBuf[i] = (gScanlineEffectRegBuffers[0][offset] + value) & 0xFFFF;
      offset++;
    }
    data[T_SRC_BUFFER_OFFSET]++;
    if (data[T_SRC_BUFFER_OFFSET] === data[T_WAVE_LENGTH]) data[T_SRC_BUFFER_OFFSET] = 0;
  }
}

// 1:1 scanline_effect.c:197-208
function GenerateWave(buffer: Uint16Array, base: number, frequency: number, amplitude: number): void {
  let i = 0;
  let theta = 0;
  while (i < 256) {
    buffer[base + i] = ((gSineTable[theta] * amplitude) / 256) & 0xFFFF;
    theta = (theta + frequency) & 0xFF;
    i++;
  }
}

// 1:1 scanline_effect.c:214-254
export function ScanlineEffect_InitWave(
  startLine: number, endLine: number, frequency: number, amplitude: number,
  delayInterval: number, regOffset: number, applyBattleBgOffsets: boolean,
): number {
  let i: number;
  let offset: number;

  ScanlineEffect_Clear();

  ScanlineEffect_SetParams({
    dmaDest: REG_OFFSET_BG0HOFS + regOffset,   // HW-emu : REG_ADDR_BG0HOFS + regOffset
    dmaControl: SCANLINE_EFFECT_DMACNT_16BIT,
    initState: 1,
    unused9: 0,
  });

  const r = rt();
  // HW-emu : la task func reçoit l'objet DecompTask → wrap pour passer task.taskId.
  const taskId: number = r.CreateTask((tk: { taskId: number }) => TaskFunc_UpdateWavePerFrame(tk.taskId), 0);
  const data: number[] = r.gTasks.get(taskId).data;  // HW-emu : rt.gTasks = Map

  data[T_START_LINE] = startLine;
  data[T_END_LINE] = endLine;
  data[T_WAVE_LENGTH] = (256 / frequency) | 0;
  data[T_SRC_BUFFER_OFFSET] = 0;
  data[T_FRAMES_UNTIL_MOVE] = delayInterval;
  data[T_DELAY_INTERVAL] = delayInterval;
  data[T_REG_OFFSET] = regOffset;
  data[T_APPLY_BATTLE_BG_OFFSETS] = applyBattleBgOffsets ? 1 : 0;

  gScanlineEffect.waveTaskId = taskId;
  sShouldStopWaveTask = false;

  // GenerateWave écrit dans gScanlineEffectRegBuffers[0][320..320+256] (zone source).
  GenerateWave(gScanlineEffectRegBuffers[0], 320, frequency, amplitude);

  offset = 320;
  for (i = startLine; i < endLine; i++) {
    gScanlineEffectRegBuffers[0][i] = gScanlineEffectRegBuffers[0][offset];
    gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][offset];
    offset++;
  }

  return taskId;
}
