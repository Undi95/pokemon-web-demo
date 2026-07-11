/**
 * ereader_helpers.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/ereader_helpers.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/ereader_helpers.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 *
 * Fichier INERTE (importé nulle part). Cœur decode e-Reader (SendRecvMgr / transfert série)
 * transcrit 1:1 ; les registres MMIO GBA sont modélisés en variables module (exemption
 * matériel) ; l'I/O flash/save/link et les structs Trainer Hill non modélisées LÈVENT à
 * l'appel (Règle 3 : pas de stub muet).
 */

import { B_BUTTON, KEYS_MASK, SIO_115200_BPS, SIO_32BIT_MODE, SIO_38400_BPS, SIO_ENABLE, SIO_INTR_ENABLE, SIO_MULTI_MODE, SIO_MULTI_SD, SIO_MULTI_SI, TIMER_ENABLE, TIMER_INTR_ENABLE } from '../include/gba/io_reg';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { SAVE_STATUS_OK } from './save';
import { CalcByteArraySum } from './util';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const NUM_TRAINER_HILL_TRAINERS = 8; // 1:1 include/constants/trainer_hill.h:47 (à consolider dans include/)
const SECTOR_SIZE = 4096; // 1:1 include/save.h:10 (à consolider dans include/)
const HILL_TRAINERS_PER_FLOOR = 2; // 1:1 include/constants/trainer_hill.h:46 (à consolider dans include/)
const NUM_TRAINER_HILL_FLOORS = 4; // 1:1 include/constants/trainer_hill.h:17 (à consolider dans include/)
const SECTOR_ID_TRAINER_HILL = 30; // 1:1 include/save.h:28 (à consolider dans include/)
const EREADER_XFER_MASK = 3; // 1:1 include/ereader_helpers.h:19 (à consolider dans include/)
const EREADER_CHECKSUM_OK_MASK = 16; // 1:1 include/ereader_helpers.h:31 (à consolider dans include/)
const EREADER_CANCEL_KEY_MASK = 8; // 1:1 include/ereader_helpers.h:25 (à consolider dans include/)
const EREADER_CANCEL_TIMEOUT_MASK = 4; // 1:1 include/ereader_helpers.h:24 (à consolider dans include/)
const INTR_FLAG_TIMER3 = 64; // 1:1 include/gba/io_reg.h:723 (à consolider dans include/)
const INTR_FLAG_SERIAL = 128; // 1:1 include/gba/io_reg.h:724 (à consolider dans include/)
const EREADER_XFR_STATE_INIT = 0; // 1:1 include/ereader_helpers.h:0 (à consolider dans include/)
const EREADER_XFER_EXE = 1; // 1:1 include/ereader_helpers.h:16 (à consolider dans include/)
const EREADER_XFR_STATE_HANDSHAKE = 1; // 1:1 include/ereader_helpers.h:0 (à consolider dans include/)
const EREADER_CANCEL_KEY = 2; // 1:1 include/ereader_helpers.h:22 (à consolider dans include/)
const EREADER_XFR_STATE_DONE = 6; // 1:1 include/ereader_helpers.h:0 (à consolider dans include/)
const EREADER_XFR_STATE_START = 2; // 1:1 include/ereader_helpers.h:0 (à consolider dans include/)
const EREADER_XFR_STATE_TRANSFER = 3; // 1:1 include/ereader_helpers.h:0 (à consolider dans include/)
const EREADER_CANCEL_TIMEOUT = 1; // 1:1 include/ereader_helpers.h:21 (à consolider dans include/)
const EREADER_XFER_CHK = 2; // 1:1 include/ereader_helpers.h:17 (à consolider dans include/)
const EREADER_XFR_STATE_TRANSFER_DONE = 4; // 1:1 include/ereader_helpers.h:0 (à consolider dans include/)
const EREADER_XFR_STATE_CHECKSUM = 5; // 1:1 include/ereader_helpers.h:0 (à consolider dans include/)
const EREADER_XFER_SHIFT = 0; // 1:1 include/ereader_helpers.h:18 (à consolider dans include/)
const EREADER_CANCEL_SHIFT = 2; // 1:1 include/ereader_helpers.h:23 (à consolider dans include/)
const EREADER_CHECKSUM_SHIFT = 4; // 1:1 include/ereader_helpers.h:30 (à consolider dans include/)
const EREADER_HANDSHAKE = 52432; // 1:1 include/link.h:130 (à consolider dans include/)
const EREADER_CHECKSUM_OK = 1; // 1:1 include/ereader_helpers.h:28 (à consolider dans include/)
const EREADER_CHECKSUM_ERR = 2; // 1:1 include/ereader_helpers.h:29 (à consolider dans include/)

// ─── Exemption matériel GBA (registres mappés mémoire) ────────────────────────
// io_reg.ts n'exporte que les *adresses* (REG_ADDR_*) et les *expressions* macro (REG_*_EXPR),
// pas d'accès valeur : les registres MMIO GBA (REG_IME/REG_IE/REG_SIOCNT/timers…) n'ont pas
// d'équivalent web. On les modélise en variables module (exemption matériel, cf. mémoire
// hardware-non-1to1-exemptions) — l'accès reste 1:1 en forme (`REG_SIOCNT |= SIO_ENABLE`).
// Câblage réel = émulation SIO/timers/interruptions, hors périmètre de cette brique INERTE.
let REG_IME = 0;
let REG_IE = 0;
let REG_IF = 0;
let REG_RCNT = 0;
let REG_SIOCNT = 0;
let REG_SIODATA32 = 0;
let REG_SIOMLT_SEND = 0;
let REG_TM3CNT_L = 0;
let REG_TM3CNT_H = 0;
let REG_KEYINPUT = 0;
/** 1:1 `gShouldAdvanceLinkState` (link.c) — socle link non porté ; variable module INERTE. */
let gShouldAdvanceLinkState = 0;
/** Exemption matériel : `VBlankIntrWait()` (main.c) — attente d'interruption VBlank, no-op web. */
function VBlankIntrWait(): void { /* attente VBlank GBA — absente en web (INERTE) */ }

// ─── Socle sauvegarde/flash + macros de layout NON PORTÉS ─────────────────────
// I/O secteur de sauvegarde (save.c/agb_flash.c) et macros sizeof/offsetof de structs Trainer
// Hill non modélisées : références locales qui LÈVENT à l'appel (Règle 3). Le câblage e-Reader /
// Trainer Hill forcera la réconciliation (modèle mémoire des structs + couche secteurs flash).
/** NON PORTÉ — 1:1 `u8 TryWriteSpecialSaveSector(u8 sector, u8 *src)` (save.c). */
function TryWriteSpecialSaveSector(_sector: number, _src: any): number {
  throw new Error('non porté : TryWriteSpecialSaveSector (socle save/flash)');
}
/** NON PORTÉ — 1:1 `u8 TryReadSpecialSaveSector(u8 sector, u8 *dst)` (save.c). */
function TryReadSpecialSaveSector(_sector: number, _dst: any): number {
  throw new Error('non porté : TryReadSpecialSaveSector (socle save/flash)');
}
/** NDEBUG (politique préproc) : `AGB_ASSERT_EX(cond, file, line)` = no-op. */
function AGB_ASSERT_EX(_cond: boolean, _file: string, _line: number): void { /* NDEBUG : no-op */ }
/** NON PORTÉ — layout mémoire des structs Trainer Hill non modélisé (sizeof/offsetof). */
function structLayoutRef(name: string): number {
  throw new Error(`non porté : ${name} (layout struct Trainer Hill non modélisé)`);
}
/** NON PORTÉ — 1:1 `memset(dst, val, n)` sur struct non modélisée. */
function memset(_dst: any, _val: number, _n: number): void {
  throw new Error('non porté : memset (struct Trainer Hill non modélisée)');
}
/** NON PORTÉ — 1:1 `memcpy(dst, src, n)` sur struct non modélisée. */
function memcpy(_dst: any, _src: any, _n: number): void {
  throw new Error('non porté : memcpy (struct Trainer Hill non modélisée)');
}

// Save data using TryWriteSpecialSaveSector is allowed to exceed SECTOR_DATA_SIZE (up to the counter field)

/** 1:1 `struct SendRecvMgr` (ereader_helpers.c:21). */
interface SendRecvMgr {
  isParent: boolean;
  state: number;
  xferState: number;
  checksumResult: number;
  cancellationReason: number;
  data: Uint32Array;
  cursor: number;
  size: number;
  checksum: number;
}

/** 1:1 (ereader_helpers.c:41) */
const sSendRecvMgr: SendRecvMgr = { isParent: false, state: 0, xferState: 0, checksumResult: 0, cancellationReason: 0, data: null as any, cursor: 0, size: 0, checksum: 0 };

/** 1:1 `CpuFill32(0, &sSendRecvMgr, sizeof(sSendRecvMgr))` — remise à zéro du struct (modèle objet). */
function zeroSendRecvMgr(): void {
  Object.assign(sSendRecvMgr, { isParent: false, state: 0, xferState: 0, checksumResult: 0, cancellationReason: 0, data: null as any, cursor: 0, size: 0, checksum: 0 });
}

/** 1:1 (ereader_helpers.c:42) */
let sJoyNewOrRepeated = 0;

/** 1:1 (ereader_helpers.c:43) */
let sJoyNew = 0;

/** 1:1 (ereader_helpers.c:44) */
let sSendRecvStatus = 0;

/** 1:1 (ereader_helpers.c:45) */
let sCounter1 = 0;

/** 1:1 (ereader_helpers.c:46) */
let sCounter2 = 0;

/** 1:1 (ereader_helpers.c:47) */
let sSavedIme = 0;

/** 1:1 (ereader_helpers.c:48) */
let sSavedIe = 0;

/** 1:1 (ereader_helpers.c:49) */
let sSavedTm3Cnt = 0;

/** 1:1 (ereader_helpers.c:50) */
let sSavedSioCnt = 0;

/** 1:1 (ereader_helpers.c:51) */
let sSavedRCnt = 0;

// ─── sTrainerHillTrainerTemplates_JP — NON TRANSCRIT (INERTE) ─────────────────
// Table JP-only (4 × struct TrainerHillTrainer, ereader_helpers.c:53-374) : noms/nicknames
// encodés via la macro `__("…")` (charmap JAPONAIS), mots Easy Chat JP (EC_WORD_* absents du
// build FR), macro `DUMMY_HILL_MON`, constantes FACILITY_CLASS_*/TRAINER_HILL_OTID/MAX_FRIENDSHIP.
// Intranscriptible sans l'outillage charmap JP + le modèle struct TrainerHillTrainer/-Mon.
// Référencée uniquement par TryWriteTrainerHill_Internal (qui LÈVE déjà à memset/TryWriteSpecialSaveSector).
// → proxy qui LÈVE à tout accès (Règle 3/4 : marqueur honnête, pas de stub muet).
const sTrainerHillTrainerTemplates_JP: any = new Proxy({}, {
  get: () => { throw new Error('non transcrit : sTrainerHillTrainerTemplates_JP (table JP — charmap __() + DUMMY_HILL_MON + struct non modélisée)'); },
});

/** 1:1 `static u8 GetTrainerHillUnkVal(void)` (ereader_helpers.c:376-379). */
function GetTrainerHillUnkVal(): number {
  return (gSaveBlock1Ptr.trainerHill.unused + 1) % 256;
}

/** 1:1 `static bool32 ValidateTrainerChecksum(struct EReaderTrainerHillTrainer *hillTrainer)` (ereader_helpers.c:381-388). */
function ValidateTrainerChecksum(hillTrainer: any): boolean {
  // 1:1 `offsetof(typeof(*hillTrainer), checksum)` — layout struct non modélisé (LÈVE).
  let checksum = CalcByteArraySum(hillTrainer, structLayoutRef('offsetof(EReaderTrainerHillTrainer, checksum)'));
  if (checksum != hillTrainer.checksum)
    return false;
  return true;
}

/** 1:1 `bool8 ValidateTrainerHillData(struct EReaderTrainerHillSet *hillSet)` (ereader_helpers.c:390-413). */
export function ValidateTrainerHillData(hillSet: any): boolean {
  let i = 0;
  let checksum = 0;
  let numTrainers = hillSet.numTrainers;
  // Validate number of trainers
  if (numTrainers < 1 || numTrainers > NUM_TRAINER_HILL_TRAINERS)
    return false;
  // Validate trainers
  for (i = 0; i < numTrainers; i++)
  {
    // 1:1 `&hillSet->trainers[i]` — trainers[] = tableau d'objets (le & disparaît).
    if (!ValidateTrainerChecksum(hillSet.trainers[i]))
      return false;
  }
  // Validate checksum
  checksum = CalcByteArraySum(hillSet.trainers, numTrainers * structLayoutRef('sizeof(EReaderTrainerHillTrainer)'));
  if (checksum != hillSet.checksum)
    return false;
  return true;
}

/** 1:1 `static bool32 ValidateTrainerHillChecksum(struct EReaderTrainerHillSet *hillSet)` (ereader_helpers.c:415-427). */
function ValidateTrainerHillChecksum(hillSet: any): boolean {
  let checksum = 0;
  let numTrainers = hillSet.numTrainers;
  if (numTrainers < 1 || numTrainers > NUM_TRAINER_HILL_TRAINERS)
    return false;
  checksum = CalcByteArraySum(hillSet.trainers, structLayoutRef('sizeof(EReaderTrainerHillSet) - offsetof(EReaderTrainerHillSet, trainers)'));
  if (checksum != hillSet.checksum)
    return false;
  return true;
}

/** 1:1 `static bool32 TryWriteTrainerHill_Internal(struct EReaderTrainerHillSet *hillSet, struct TrainerHillChallenge *challenge)` (ereader_helpers.c:429-466). */
function TryWriteTrainerHill_Internal(hillSet: any, challenge: any): boolean {
  let i = 0;
  AGB_ASSERT_EX(hillSet.dummy == 0, "cereader_tool.c", 450);
  AGB_ASSERT_EX(hillSet.id == 0, "cereader_tool.c", 452);
  memset(challenge, 0, SECTOR_SIZE);
  challenge.numTrainers = hillSet.numTrainers;
  challenge.unused1 = GetTrainerHillUnkVal();
  challenge.numFloors = Math.trunc((hillSet.numTrainers + 1) / HILL_TRAINERS_PER_FLOOR);
  for (i = 0; i < hillSet.numTrainers; i++)
  {
    if (!(i & 1))
    {
      challenge.floors[Math.trunc(i / HILL_TRAINERS_PER_FLOOR)].trainerNum1 = hillSet.trainers[i].trainerNum;
      challenge.floors[Math.trunc(i / HILL_TRAINERS_PER_FLOOR)].map = hillSet.trainers[i].map;
      challenge.floors[Math.trunc(i / HILL_TRAINERS_PER_FLOOR)].trainers[0] = hillSet.trainers[i].trainer;
    }
    else
    {
      challenge.floors[Math.trunc(i / HILL_TRAINERS_PER_FLOOR)].trainerNum2 = hillSet.trainers[i].trainerNum;
      challenge.floors[Math.trunc(i / HILL_TRAINERS_PER_FLOOR)].trainers[1] = hillSet.trainers[i].trainer;
    }
  }
  if (i & 1)
  {
    challenge.floors[Math.trunc(i / HILL_TRAINERS_PER_FLOOR)].trainers[1] = sTrainerHillTrainerTemplates_JP[Math.trunc(i / HILL_TRAINERS_PER_FLOOR)];
  }
  challenge.checksum = CalcByteArraySum(challenge.floors, NUM_TRAINER_HILL_FLOORS * structLayoutRef('sizeof(TrainerHillFloor)'));
  if (TryWriteSpecialSaveSector(SECTOR_ID_TRAINER_HILL, challenge) != SAVE_STATUS_OK)
    return false;
  return true;
}

/** 1:1 `bool32 TryWriteTrainerHill(struct EReaderTrainerHillSet *hillSet)` (ereader_helpers.c:468-474). */
export function TryWriteTrainerHill(hillSet: any): boolean {
  let buffer: any = new Uint8Array(SECTOR_SIZE); // 1:1 AllocZeroed(SECTOR_SIZE)
  let result = TryWriteTrainerHill_Internal(hillSet, buffer);
  void buffer /* Free — GC */;
  return result;
}

/** 1:1 `static bool32 TryReadTrainerHill_Internal(struct EReaderTrainerHillSet *dest, u8 *buffer)` (ereader_helpers.c:476-486). */
function TryReadTrainerHill_Internal(dest: any, buffer: Uint8Array): boolean {
  if (TryReadSpecialSaveSector(SECTOR_ID_TRAINER_HILL, buffer) != SAVE_STATUS_OK)
    return false;
  memcpy(dest, buffer, structLayoutRef('sizeof(EReaderTrainerHillSet)'));
  if (!ValidateTrainerHillChecksum(dest))
    return false;
  return true;
}

/** 1:1 `static bool32 TryReadTrainerHill(struct EReaderTrainerHillSet *hillSet)` (ereader_helpers.c:488-494). */
function TryReadTrainerHill(hillSet: any): boolean {
  let buffer: any = new Uint8Array(SECTOR_SIZE); // 1:1 AllocZeroed(SECTOR_SIZE)
  let result = TryReadTrainerHill_Internal(hillSet, buffer);
  void buffer /* Free — GC */;
  return result;
}

/** 1:1 `bool32 ReadTrainerHillAndValidate(void)` (ereader_helpers.c:496-502). */
export function ReadTrainerHillAndValidate(): boolean {
  let hillSet: any = new Uint8Array(SECTOR_SIZE); // 1:1 AllocZeroed(SECTOR_SIZE)
  let result = TryReadTrainerHill(hillSet);
  void hillSet /* Free — GC */;
  return result;
}

/** 1:1 `int EReader_Send(int size, const void *src)` (ereader_helpers.c:504-543). */
export function EReader_Send(size: number, src: any): number {
  let result = 0;
  let sendStatus = 0;
  EReaderHelper_SaveRegsState();
  while (1)
  {
    GetKeyInput();
    if (sJoyNew & B_BUTTON)
      gShouldAdvanceLinkState = 2;
    sendStatus = EReaderHandleTransfer(1, size, src, null);
    sSendRecvStatus = sendStatus;
    if ((sSendRecvStatus & EREADER_XFER_MASK) == 0 && sSendRecvStatus & EREADER_CHECKSUM_OK_MASK)
    {
      result = 0;
      break;
    }
    else if (sSendRecvStatus & EREADER_CANCEL_KEY_MASK)
    {
      result = 1;
      break;
    }
    else if (sSendRecvStatus & EREADER_CANCEL_TIMEOUT_MASK)
    {
      result = 2;
      break;
    }
    else
    {
      gShouldAdvanceLinkState = 0;
      VBlankIntrWait();
    }
  }
  zeroSendRecvMgr(); // 1:1 CpuFill32(0, &sSendRecvMgr, sizeof(sSendRecvMgr))
  EReaderHelper_RestoreRegsState();
  return result;
}

/** 1:1 `int EReader_Recv(void *dest)` (ereader_helpers.c:545-584). */
export function EReader_Recv(dest: any): number {
  let result = 0;
  let recvStatus = 0;
  EReaderHelper_SaveRegsState();
  while (1)
  {
    GetKeyInput();
    if (sJoyNew & B_BUTTON)
      gShouldAdvanceLinkState = 2;
    recvStatus = EReaderHandleTransfer(0, 0, null, dest);
    sSendRecvStatus = recvStatus;
    if ((sSendRecvStatus & EREADER_XFER_MASK) == 0 && sSendRecvStatus & EREADER_CHECKSUM_OK_MASK)
    {
      result = 0;
      break;
    }
    else if (sSendRecvStatus & EREADER_CANCEL_KEY_MASK)
    {
      result = 1;
      break;
    }
    else if (sSendRecvStatus & EREADER_CANCEL_TIMEOUT_MASK)
    {
      result = 2;
      break;
    }
    else
    {
      gShouldAdvanceLinkState = 0;
      VBlankIntrWait();
    }
  }
  zeroSendRecvMgr(); // 1:1 CpuFill32(0, &sSendRecvMgr, sizeof(sSendRecvMgr))
  EReaderHelper_RestoreRegsState();
  return result;
}

/** 1:1 `static void CloseSerial(void)` (ereader_helpers.c:586-594). */
function CloseSerial(): void {
  REG_IME = 0;
  REG_IE &= ~(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL);
  REG_IME = 1;
  REG_SIOCNT = 0;
  REG_TM3CNT_H = 0;
  REG_IF = INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL;
}

/** 1:1 `static void OpenSerialMulti(void)` (ereader_helpers.c:596-610). */
function OpenSerialMulti(): void {
  REG_IME = 0;
  REG_IE &= ~(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL);
  REG_IME = 1;
  REG_RCNT = 0;
  REG_SIOCNT = SIO_MULTI_MODE;
  REG_SIOCNT |= SIO_INTR_ENABLE | SIO_115200_BPS;
  REG_IME = 0;
  REG_IE |= INTR_FLAG_SERIAL;
  REG_IME = 1;
  if (sSendRecvMgr.state == 0)
    zeroSendRecvMgr(); // 1:1 CpuFill32(0, &sSendRecvMgr, sizeof(sSendRecvMgr))
}

/** 1:1 `static void OpenSerial32(void)` (ereader_helpers.c:612-620). */
function OpenSerial32(): void {
  REG_RCNT = 0;
  REG_SIOCNT = SIO_32BIT_MODE | SIO_INTR_ENABLE;
  REG_SIOCNT |= SIO_MULTI_SD;
  gShouldAdvanceLinkState = 0;
  sCounter1 = 0;
  sCounter2 = 0;
}

/** 1:1 `int EReaderHandleTransfer(u8 mode, size_t size, const void *data, void *recvBuffer)` (ereader_helpers.c:622-703). */
export function EReaderHandleTransfer(mode: number, size: number, data: any, recvBuffer: any): number {
  switch (sSendRecvMgr.state) {
    case EREADER_XFR_STATE_INIT:
      OpenSerialMulti();
      sSendRecvMgr.xferState = EREADER_XFER_EXE;
      sSendRecvMgr.state = EREADER_XFR_STATE_HANDSHAKE;
      break;
    case EREADER_XFR_STATE_HANDSHAKE:
      if (DetermineSendRecvState(mode))
        EnableSio();
      if (gShouldAdvanceLinkState == 2)
      {
        sSendRecvMgr.cancellationReason = EREADER_CANCEL_KEY;
        sSendRecvMgr.state = EREADER_XFR_STATE_DONE;
      }
      break;
    case EREADER_XFR_STATE_START:
      OpenSerial32();
      SetUpTransferManager(size, data, recvBuffer);
      sSendRecvMgr.state = EREADER_XFR_STATE_TRANSFER;
    // fall through
    case EREADER_XFR_STATE_TRANSFER:
      if (gShouldAdvanceLinkState == 2)
      {
        sSendRecvMgr.cancellationReason = EREADER_CANCEL_KEY;
        sSendRecvMgr.state = EREADER_XFR_STATE_DONE;
      }
      else
      {
        sCounter1++;
        sCounter2++;
        if (!sSendRecvMgr.isParent && sCounter2 > 60)
        {
          sSendRecvMgr.cancellationReason = EREADER_CANCEL_TIMEOUT;
          sSendRecvMgr.state = EREADER_XFR_STATE_DONE;
        }
        if (sSendRecvMgr.xferState != EREADER_XFER_CHK)
        {
          if (sSendRecvMgr.isParent && sCounter1 > 2)
          {
            EnableSio();
            sSendRecvMgr.xferState = EREADER_XFER_CHK;
          }
          else
          {
            EnableSio();
            sSendRecvMgr.xferState = EREADER_XFER_CHK;
          }
        }
      }
      break;
    case EREADER_XFR_STATE_TRANSFER_DONE:
      OpenSerialMulti();
      sSendRecvMgr.state = EREADER_XFR_STATE_CHECKSUM;
      break;
    case EREADER_XFR_STATE_CHECKSUM:
      if (sSendRecvMgr.isParent == true && sCounter1 > 2)
        EnableSio();
      if (++sCounter1 > 60)
      {
        sSendRecvMgr.cancellationReason = EREADER_CANCEL_TIMEOUT;
        sSendRecvMgr.state = EREADER_XFR_STATE_DONE;
      }
      break;
    case EREADER_XFR_STATE_DONE:
      if (sSendRecvMgr.xferState)
      {
        CloseSerial();
        sSendRecvMgr.xferState = 0;
      }
      break;
  }
  return (sSendRecvMgr.xferState << EREADER_XFER_SHIFT) | (sSendRecvMgr.cancellationReason << EREADER_CANCEL_SHIFT) | (sSendRecvMgr.checksumResult << EREADER_CHECKSUM_SHIFT);
}

/** 1:1 `static u16 DetermineSendRecvState(u8 mode)` (ereader_helpers.c:705-713). */
function DetermineSendRecvState(mode: number): number {
  let resp = false;
  // 1:1 `*(vu32 *)REG_ADDR_SIOCNT` = valeur du registre SIOCNT (= REG_SIOCNT, modèle module).
  if ((REG_SIOCNT & (SIO_MULTI_SI | SIO_MULTI_SD)) == SIO_MULTI_SD && mode)
    resp = sSendRecvMgr.isParent = true;
  else
    resp = sSendRecvMgr.isParent = false;
  return +resp;
}

/** 1:1 `static void SetUpTransferManager(size_t size, const void *data, void *recvBuffer)` (ereader_helpers.c:715-730). */
function SetUpTransferManager(size: number, data: any, recvBuffer: any): void {
  if (sSendRecvMgr.isParent)
  {
    REG_SIOCNT |= SIO_38400_BPS;
    sSendRecvMgr.data = data;
    REG_SIODATA32 = size;
    sSendRecvMgr.size = Math.trunc(size / 4) + 1;
    StartTm3();
  }
  else
  {
    REG_SIOCNT = REG_SIOCNT;
    sSendRecvMgr.data = recvBuffer;
  }
}

/** 1:1 `static void StartTm3(void)` (ereader_helpers.c:732-739). */
function StartTm3(): void {
  REG_TM3CNT_L = -601;
  REG_TM3CNT_H = TIMER_INTR_ENABLE;
  REG_IME = 0;
  REG_IE |= INTR_FLAG_TIMER3;
  REG_IME = 1;
}

/** 1:1 `void EReaderHelper_Timer3Callback(void)` (ereader_helpers.c:741-745). */
export function EReaderHelper_Timer3Callback(): void {
  DisableTm3();
  EnableSio();
}

/** 1:1 `void EReaderHelper_SerialCallback(void)` (ereader_helpers.c:747-834). */
export function EReaderHelper_SerialCallback(): void {
  let i = 0;
  let cnt1 = 0;
  let cnt2 = 0;
  let recv32 = 0;
  const recv = new Uint16Array(4);
  switch (sSendRecvMgr.state) {
    case EREADER_XFR_STATE_HANDSHAKE:
      REG_SIOMLT_SEND = EREADER_HANDSHAKE;
      // exemption matériel : lecture 64-bit SIOMULTI0..3 (`*(u64 *)recv = REG_SIOMLT_RECV`)
      // → recv[0..3]. Pas de matériel SIO en web → recv reste à 0 (INERTE).
      for ((i = 0, (cnt1 = 0, cnt2 = 0)); i < 4; i++)
      {
        if (recv[i] == EREADER_HANDSHAKE)
          cnt1++;
        else if (recv[i] != 0xFFFF)
          cnt2++;
      }
      if (cnt1 == 2 && cnt2 == 0)
        sSendRecvMgr.state = 2;
      break;
    case EREADER_XFR_STATE_TRANSFER:
      recv32 = REG_SIODATA32;
      // The first value sent by the EReader is the payload size
      if (!sSendRecvMgr.cursor && !sSendRecvMgr.isParent)
        sSendRecvMgr.size = Math.trunc(recv32 / 4) + 1;
      if (sSendRecvMgr.isParent == true)
      {
        // Send mode
        if (sSendRecvMgr.cursor < sSendRecvMgr.size)
        {
          REG_SIODATA32 = sSendRecvMgr.data[sSendRecvMgr.cursor];
          sSendRecvMgr.checksum += sSendRecvMgr.data[sSendRecvMgr.cursor];
        }
        else
        {
          REG_SIODATA32 = sSendRecvMgr.checksum;
        }
      }
      else
      {
        // Receive mode
        if (sSendRecvMgr.cursor > 0 && sSendRecvMgr.cursor < sSendRecvMgr.size + 1)
        {
          sSendRecvMgr.data[sSendRecvMgr.cursor - 1] = recv32;
          sSendRecvMgr.checksum += recv32;
        }
        else if (sSendRecvMgr.cursor)
        {
          if (sSendRecvMgr.checksum == recv32)
            sSendRecvMgr.checksumResult = EREADER_CHECKSUM_OK;
          else
            sSendRecvMgr.checksumResult = EREADER_CHECKSUM_ERR;
        }
        sCounter2 = 0;
      }
      if (++sSendRecvMgr.cursor < sSendRecvMgr.size + 2)
      {
        if (sSendRecvMgr.isParent)
          REG_TM3CNT_H |= TIMER_ENABLE;
        else
          EnableSio();
      }
      else
      {
        sSendRecvMgr.state = EREADER_XFR_STATE_TRANSFER_DONE;
        sCounter1 = 0;
      }
      break;
    case EREADER_XFR_STATE_CHECKSUM:
      if (!sSendRecvMgr.isParent)
        REG_SIOMLT_SEND = sSendRecvMgr.checksumResult;
      // exemption matériel : lecture 64-bit SIOMULTI0..3 (`*(vu64 *)recv = REG_SIOMLT_RECV`)
      // → recv[0..3]. Pas de matériel SIO en web → recv reste à 0 (INERTE).
      if (recv[1] == EREADER_CHECKSUM_OK || recv[1] == EREADER_CHECKSUM_ERR)
      {
        if (sSendRecvMgr.isParent == true)
          sSendRecvMgr.checksumResult = recv[1];
        // EReader has (in)validated the payload
        sSendRecvMgr.state = EREADER_XFR_STATE_DONE;
      }
      break;
  }
}

/** 1:1 `static void EnableSio(void)` (ereader_helpers.c:836-839). */
function EnableSio(): void {
  REG_SIOCNT |= SIO_ENABLE;
}

/** 1:1 `static void DisableTm3(void)` (ereader_helpers.c:841-845). */
function DisableTm3(): void {
  REG_TM3CNT_H &= ~TIMER_ENABLE;
  REG_TM3CNT_L = 0xFDA7;
}

/** 1:1 `static void GetKeyInput(void)` (ereader_helpers.c:847-852). */
function GetKeyInput(): void {
  let rawKeys = REG_KEYINPUT ^ KEYS_MASK;
  sJoyNew = rawKeys & ~sJoyNewOrRepeated;
  sJoyNewOrRepeated = rawKeys;
}

/** 1:1 `void EReaderHelper_SaveRegsState(void)` (ereader_helpers.c:854-861). */
export function EReaderHelper_SaveRegsState(): void {
  sSavedIme = REG_IME;
  sSavedIe = REG_IE;
  sSavedTm3Cnt = REG_TM3CNT_H;
  sSavedSioCnt = REG_SIOCNT;
  sSavedRCnt = REG_RCNT;
}

/** 1:1 `void EReaderHelper_RestoreRegsState(void)` (ereader_helpers.c:863-870). */
export function EReaderHelper_RestoreRegsState(): void {
  REG_IME = sSavedIme;
  REG_IE = sSavedIe;
  REG_TM3CNT_H = sSavedTm3Cnt;
  REG_SIOCNT = sSavedSioCnt;
  REG_RCNT = sSavedRCnt;
}

/** 1:1 `void EReaderHelper_ClearSendRecvMgr(void)` (ereader_helpers.c:872-875). */
export function EReaderHelper_ClearSendRecvMgr(): void {
  zeroSendRecvMgr(); // 1:1 CpuFill32(0, &sSendRecvMgr, sizeof(sSendRecvMgr))
}
