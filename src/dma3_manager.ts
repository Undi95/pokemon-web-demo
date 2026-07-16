/**
 * dma3_manager.ts — miroir 1:1 décomp `src/dma3_manager.c` (queue DMA3 logicielle)
 * + relocation de `IsDma3ManagerBusyWithBgCopy` (décomp `bg.c:440`).
 *
 * ══ ADAPTATION MOTEUR (documentée) ══════════════════════════════════════════
 * Sur GBA, `RequestDma3Copy/Fill` empilent des requêtes dans `sDma3Requests`,
 * que `ProcessDma3Requests` (appelé en VBlank par main.c) draine par de VRAIS
 * DMA hardware (`DmaCopy##bit` sur adresses VRAM/RAM brutes, cf. include/dma3.h).
 * Notre port ne modélise PAS d'espace mémoire GBA plat : toutes les « copies
 * DMA » se font de façon SYNCHRONE via les abstractions runtime (LoadBgTiles,
 * CpuFill16, chargements d'assets async). => la queue `sDma3Requests` reste
 * STRUCTURELLEMENT VIDE : personne n'empile de requête sur CE module (les seuls
 * `RequestDma3Copy` du repo sont des `__wireTodo` locaux d'autres flux, non
 * câblés ici), donc `ProcessDma3Requests` n'entre jamais dans sa boucle. Ces
 * fonctions sont transcrites 1:1 pour la complétude du miroir mais restent
 * INERTES (CLAUDE.md Règle 1 : « Inerte-mais-1:1 > testable-mais-improvisé »).
 *
 * Le SEUL état VIVANT = le compteur « bg copies in flight » de
 * `IsDma3ManagerBusyWithBgCopy()`. Précédent : ce compteur vivait dans
 * `battle_bg.ts:660` (`_bgCopiesInFlight`, incrémenté par
 * `loadBattleTextboxAndBackground1to1`). Il est relogé ici (`markBgCopyStarted`/
 * `markBgCopyDone`) — c'est le miroir de `bg.c:440 IsDma3ManagerBusyWithBgCopy()`
 * qui, sur GBA, scanne `sDmaBusyBitfield` pour savoir si des copies BG (enfilées
 * via LoadBgTiles→RequestDma3Copy avec un bit de suivi) sont encore en vol. Chez
 * nous, ces copies BG = les chargements ASYNC tiles/tilemap/palettes du boot
 * combat ; le compteur les suit pour que le gate `!IsDma3ManagerBusyWithBgCopy()`
 * (case 0 de CB2_HandleStartBattle, etc.) attende leur fin.
 * ════════════════════════════════════════════════════════════════════════════
 */

// 1:1 décomp dma3_manager.c:4 — #define MAX_DMA_REQUESTS 128
const MAX_DMA_REQUESTS = 128;

// 1:1 décomp dma3_manager.c:6-9 — modes de requête.
const DMA_REQUEST_COPY32 = 1;
const DMA_REQUEST_FILL32 = 2;
const DMA_REQUEST_COPY16 = 3;
const DMA_REQUEST_FILL16 = 4;

// 1:1 décomp dma3_manager.c:11-18 — struct Dma3Request.
// Adaptation pointeur→vue : `const u8 *src` / `u8 *dest` → `Uint8Array | null`
// (standard du port pour u8*, cf. pokemon_storage_system.ts « u8[N] → Uint8Array »).
// NULL → null.
interface Dma3Request {
  src: Uint8Array | null;
  dest: Uint8Array | null;
  size: number;   // u16
  mode: number;   // u16
  value: number;  // u32
}

// 1:1 décomp dma3_manager.c:20 — static struct Dma3Request sDma3Requests[MAX_DMA_REQUESTS].
const sDma3Requests: Dma3Request[] = Array.from({ length: MAX_DMA_REQUESTS }, () => ({
  src: null, dest: null, size: 0, mode: 0, value: 0,
}));

// 1:1 décomp dma3_manager.c:22-23.
let sDma3ManagerLocked = false;  // vbool8
let sDma3RequestCursor = 0;      // u8

// ─── Primitives DMA (include/dma3.h:26-47) ──────────────────────────────────
// Macros `Dma3CopyLarge16_/32_` / `Dma3FillLarge16_/32_` = DMA hardware par blocs
// de MAX_DMA_BLOCK_SIZE. Adaptation : copie/remplissage typed-array (src/dest =
// vues Uint8Array). INERTES (queue vide) — transcrites pour la complétude du
// miroir de `ProcessDma3Requests`. `size` est en OCTETS dans les deux variantes
// (la largeur 16/32 = juste la largeur de transfert DMA, sans effet sur les
// octets copiés) ; seul `Dma3FillLarge*` distingue la largeur de la valeur.
function Dma3CopyLarge16_(src: Uint8Array | null, dest: Uint8Array | null, size: number): void {
  if (!src || !dest) return;
  dest.set(src.subarray(0, size));
}
function Dma3CopyLarge32_(src: Uint8Array | null, dest: Uint8Array | null, size: number): void {
  if (!src || !dest) return;
  dest.set(src.subarray(0, size));
}
function Dma3FillLarge16_(value: number, dest: Uint8Array | null, size: number): void {
  if (!dest) return;
  const lo = value & 0xFF, hi = (value >> 8) & 0xFF;
  for (let i = 0; i < size; i++) dest[i] = (i & 1) ? hi : lo;
}
function Dma3FillLarge32_(value: number, dest: Uint8Array | null, size: number): void {
  if (!dest) return;
  for (let i = 0; i < size; i++) dest[i] = (value >>> (8 * (i & 3))) & 0xFF;
}

// 1:1 décomp dma3_manager.c:58 — `*(u8 *)REG_ADDR_VCOUNT`. VCOUNT (scanline
// courante) n'est PAS émulé par le port (cf. decomp-runtime.ts:945 : DISPSTAT/
// VCOUNT = HW non émulés) → lu comme 0. La garde vblank ci-dessous n'est donc
// jamais franchie ; de toute façon la boucle n'entre jamais (queue vide).
function readVCount(): number { return 0; }

// 1:1 décomp dma3_manager.c:25-40.
export function ClearDma3Requests(): void {
  let i: number;

  sDma3ManagerLocked = true;
  sDma3RequestCursor = 0;

  for (i = 0; i < MAX_DMA_REQUESTS; i++) {
    sDma3Requests[i].size = 0;
    sDma3Requests[i].src = null;
    sDma3Requests[i].dest = null;
  }

  sDma3ManagerLocked = false;
}

// 1:1 décomp dma3_manager.c:42-96 — INERTE (queue structurellement vide, cf. en-tête).
export function ProcessDma3Requests(): void {
  let bytesTransferred: number;

  if (sDma3ManagerLocked)
    return;

  bytesTransferred = 0;

  // as long as there are DMA requests to process (unless size or vblank is an issue), do not exit
  while (sDma3Requests[sDma3RequestCursor].size !== 0) {
    bytesTransferred += sDma3Requests[sDma3RequestCursor].size;

    if (bytesTransferred > 40 * 1024)
      return; // don't transfer more than 40 KiB
    if (readVCount() > 224)
      return; // we're about to leave vblank, stop

    switch (sDma3Requests[sDma3RequestCursor].mode) {
      case DMA_REQUEST_COPY32: // regular 32-bit copy
        Dma3CopyLarge32_(sDma3Requests[sDma3RequestCursor].src,
                         sDma3Requests[sDma3RequestCursor].dest,
                         sDma3Requests[sDma3RequestCursor].size);
        break;
      case DMA_REQUEST_FILL32: // repeat a single 32-bit value across RAM
        Dma3FillLarge32_(sDma3Requests[sDma3RequestCursor].value,
                         sDma3Requests[sDma3RequestCursor].dest,
                         sDma3Requests[sDma3RequestCursor].size);
        break;
      case DMA_REQUEST_COPY16:    // regular 16-bit copy
        Dma3CopyLarge16_(sDma3Requests[sDma3RequestCursor].src,
                         sDma3Requests[sDma3RequestCursor].dest,
                         sDma3Requests[sDma3RequestCursor].size);
        break;
      case DMA_REQUEST_FILL16: // repeat a single 16-bit value across RAM
        Dma3FillLarge16_(sDma3Requests[sDma3RequestCursor].value,
                         sDma3Requests[sDma3RequestCursor].dest,
                         sDma3Requests[sDma3RequestCursor].size);
        break;
    }

    // Free the request
    sDma3Requests[sDma3RequestCursor].src = null;
    sDma3Requests[sDma3RequestCursor].dest = null;
    sDma3Requests[sDma3RequestCursor].size = 0;
    sDma3Requests[sDma3RequestCursor].mode = 0;
    sDma3Requests[sDma3RequestCursor].value = 0;
    sDma3RequestCursor++;

    if (sDma3RequestCursor >= MAX_DMA_REQUESTS) // loop back to the first DMA request
      sDma3RequestCursor = 0;
  }
}

// 1:1 décomp dma3_manager.c:98-128.
export function RequestDma3Copy(src: Uint8Array | null, dest: Uint8Array | null, size: number, mode: number): number {
  let cursor: number;
  let i = 0;

  sDma3ManagerLocked = true;
  cursor = sDma3RequestCursor;

  while (i < MAX_DMA_REQUESTS) {
    if (sDma3Requests[cursor].size === 0) { // an empty request was found.
      sDma3Requests[cursor].src = src;
      sDma3Requests[cursor].dest = dest;
      sDma3Requests[cursor].size = size;

      if (mode === 1)
        sDma3Requests[cursor].mode = DMA_REQUEST_COPY32;
      else
        sDma3Requests[cursor].mode = DMA_REQUEST_COPY16;

      sDma3ManagerLocked = false;
      return cursor;
    }
    if (++cursor >= MAX_DMA_REQUESTS) // loop back to start.
      cursor = 0;
    i++;
  }
  sDma3ManagerLocked = false;
  return -1;  // no free DMA request was found
}

// 1:1 décomp dma3_manager.c:130-161.
export function RequestDma3Fill(value: number, dest: Uint8Array | null, size: number, mode: number): number {
  let cursor: number;
  let i = 0;

  cursor = sDma3RequestCursor;
  sDma3ManagerLocked = true;

  while (i < MAX_DMA_REQUESTS) {
    if (sDma3Requests[cursor].size === 0) { // an empty request was found.
      sDma3Requests[cursor].dest = dest;
      sDma3Requests[cursor].size = size;
      sDma3Requests[cursor].mode = mode;
      sDma3Requests[cursor].value = value;

      if (mode === 1)
        sDma3Requests[cursor].mode = DMA_REQUEST_FILL32;
      else
        sDma3Requests[cursor].mode = DMA_REQUEST_FILL16;

      sDma3ManagerLocked = false;
      return cursor;
    }
    if (++cursor >= MAX_DMA_REQUESTS) // loop back to start.
      cursor = 0;
    i++;
  }
  sDma3ManagerLocked = false;
  return -1;  // no free DMA request was found
}

// 1:1 décomp dma3_manager.c:163-183.
export function CheckForSpaceForDma3Request(index: number): number {
  let i = 0;

  if (index === -1) { // check if all requests are free
    while (i < MAX_DMA_REQUESTS) {
      if (sDma3Requests[i].size !== 0)
        return -1;
      i++;
    }
    return 0;
  } else { // check the specified request
    if (sDma3Requests[index].size !== 0)
      return -1;
    return 0;
  }
}

// ─── Compteur « bg copies in flight » (relocation depuis battle_bg.ts:660) ───
// = seul état VIVANT du module, miroir de `bg.c:440 IsDma3ManagerBusyWithBgCopy`
// (voir en-tête). Adaptation : nos « copies BG » = chargements async, suivis par
// un compteur au lieu du `sDmaBusyBitfield` matériel.
let sBgCopiesInFlight = 0;

/** Adaptation moteur : une copie BG async démarre. Précédent : `_bgCopiesInFlight++`
 *  (battle_bg.ts:645, dans loadBattleTextboxAndBackground1to1). */
export function markBgCopyStarted(): void { sBgCopiesInFlight++; }

/** Adaptation moteur : une copie BG async se termine (finally). Précédent :
 *  `_bgCopiesInFlight--` (battle_bg.ts:651). */
export function markBgCopyDone(): void { sBgCopiesInFlight--; }

/** 1:1 décomp `bool8 IsDma3ManagerBusyWithBgCopy(void)` (bg.c:440-462).
 *  Sur GBA : scanne `sDmaBusyBitfield` (bits posés par les copies BG enfilées via
 *  RequestDma3Copy) et renvoie TRUE tant qu'une requête BG n'a pas retrouvé de
 *  place libre (= copie encore en vol). ADAPTATION : le port fait ses copies BG
 *  en async ; `sBgCopiesInFlight` tient lieu de bitfield (TRUE tant qu'au moins
 *  une copie async n'est pas terminée). */
export function IsDma3ManagerBusyWithBgCopy(): boolean { return sBgCopiesInFlight > 0; }
