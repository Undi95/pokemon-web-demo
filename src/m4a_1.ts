/**
 * src/m4a_1.ts — miroir 1:1 `src/m4a_1.s` (asm → sémantique TS, LOT 1 : SÉQUENCEUR).
 *
 * Transcrit : umul3232H32 · SoundMainBTM (= l'implémentation de Clear64byte) ·
 * RealClearChain · ply_fine · MPlayJumpTableCopy · ply_goto/patt/pend/rept/
 * prio/tempo/keysh/voice/vol/pan/bend/bendr/lfodl/modt/tune/port · MPlayMain ·
 * TrackStop · ChnVolSetAsm · ply_note · ply_endtie · clear_modM · ply_lfos ·
 * ply_mod.
 * LOT 2 (mixeur PCM, en bas de fichier) : SoundMain · SoundMainRAM
 * (+_Unk1/_Unk2, reverb, enveloppes DS, fixed/resampling/DPCM/reverse) ·
 * m4aSoundVSync.
 *
 * Adaptations moteur (documentées, cf. include/gba/m4a_internal.ts) :
 * - `gSoundMemory` = l'espace d'adressage unique des données son (cmdPtr, wav,
 *   voicegroups… = offsets u32) — précédent : l'image script du byte-VM.
 * - Registres son (NR10…, SOUND1CNT_L+n de ply_port) → `gSoundIoRam`
 *   (Uint8Array indexée par REG_OFFSET_* de include/gba/io_reg.ts) que la
 *   synthèse PSG du worklet lira — précédent : gScanlineEffectRegBuffers
 *   (registres vidéo → buffers lus par le runtime).
 * - Comparaisons d'ADRESSES de tracks (priorité de vol de canal dans ply_note :
 *   `chan->track > track`) → `track.addrOrder` attribué à la construction dans
 *   l'ordre de déclaration décomp (music_player_table.inc puis
 *   gPokemonCryTracks) — reproduit l'ordre des adresses statiques GBA.
 * - `chk_adr_r2` (garde anti-lecture BIOS de MPlayJumpTableCopy/ld_r3_tp_adr_i)
 *   : N/A hors GBA — lectures directes.
 */

import {
  CGB_CHANNEL_MO_PIT,
  CGB_CHANNEL_MO_VOL,
  CgbChannel,
  ID_NUMBER,
  MPT_FLG_EXIST,
  MPT_FLG_PITCHG,
  MPT_FLG_START,
  MPT_FLG_VOLCHG,
  MusicPlayerInfo,
  MusicPlayerTrack,
  PCM_DMA_BUF_SIZE,
  SOUND_CHANNEL_SF_ENV,
  SOUND_CHANNEL_SF_ENV_ATTACK,
  SOUND_CHANNEL_SF_ENV_DECAY,
  SOUND_CHANNEL_SF_IEC,
  SOUND_CHANNEL_SF_LOOP,
  SOUND_CHANNEL_SF_ON,
  SOUND_CHANNEL_SF_SPECIAL,
  SOUND_CHANNEL_SF_START,
  SOUND_CHANNEL_SF_STOP,
  SoundChannel,
  SoundInfo,
  TONEDATA_P_S_PAN,
  TONEDATA_TYPE_CGB,
  TONEDATA_TYPE_CMP,
  TONEDATA_TYPE_FIX,
  TONEDATA_TYPE_REV,
  TONEDATA_TYPE_RHY,
  TONEDATA_TYPE_SPL,
  WAVE_DATA_FLAG_LOOP,
  WAVE_DATA_HEADER_SIZE,
  WAVE_DATA_OFF_FLAGS,
  WAVE_DATA_OFF_LOOP_START,
  WAVE_DATA_OFF_SIZE,
  WAVE_DATA_OFF_TYPE,
} from '../include/gba/m4a_internal';
import { REG_OFFSET_SOUND1CNT_L, REG_OFFSET_VCOUNT } from '../include/gba/io_reg';
import { gClockTable, gDeltaEncodingTable, gMPlayJumpTableTemplate } from './m4a_tables';
import { FadeOutBody, MidiKeyToFreq, TrkVolPitSet } from './m4a';

// ─── Espace d'adressage son + registres émulés ────────────────────────────────

/** L'espace mémoire son unique : [0, SOUND_RAM_SIZE) = RAM audio (cry songs),
 *  ensuite l'image ROM audio extraite. Posé par le chargeur (lot données). */
export let gSoundMemory: Uint8Array = new Uint8Array(0);

export function setSoundMemory(mem: Uint8Array): void {
  gSoundMemory = mem;
}

/** Registres IO son émulés, indexés par REG_OFFSET_* (io_reg.ts). Le worklet
 *  PSG lira ce bloc ; ply_port/CgbSound/MPlayExtender y écrivent. 0x400 couvre
 *  toute la zone IO 0x04000000-0x040003FF (les regs son : 0x60-0xA8). */
export const gSoundIoRam: Uint8Array = new Uint8Array(0x400);

/** SOUND_INFO_PTR (IWRAM 0x3007FF0 sur GBA) — posé par SoundInit (m4a.ts). */
let _soundInfoPtr: SoundInfo | null = null;

export function setSoundInfoPtr(soundInfo: SoundInfo): void {
  _soundInfoPtr = soundInfo;
}

export function SOUND_INFO_PTR(): SoundInfo {
  if (!_soundInfoPtr) throw new Error('[m4a] SOUND_INFO_PTR lu avant SoundInit');
  return _soundInfoPtr;
}

// Helpers de lecture gSoundMemory (little-endian, 1:1 ldrb/ldr).
function rdU8(off: number): number {
  return gSoundMemory[off];
}
function rdU16(off: number): number {
  return gSoundMemory[off] | (gSoundMemory[off + 1] << 8);
}
function rdU32(off: number): number {
  return (gSoundMemory[off] | (gSoundMemory[off + 1] << 8) | (gSoundMemory[off + 2] << 16) | (gSoundMemory[off + 3] << 24)) >>> 0;
}
/** s8 (ldrsb). */
function s8(v: number): number {
  return (v << 24) >> 24;
}

/** 1:1 `ld_r3_tp_adr_i` : lit l'octet à cmdPtr et avance cmdPtr. */
function ld_r3_tp_adr_i(track: MusicPlayerTrack): number {
  const b = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
  return b;
}

// ─── umul3232H32 ──────────────────────────────────────────────────────────────

/** 1:1 : (multiplier × multiplicand) >> 32 non signé (umull, retourne le mot haut). */
export function umul3232H32(multiplier: number, multiplicand: number): number {
  return Number((BigInt(multiplier >>> 0) * BigInt(multiplicand >>> 0)) >> 32n) >>> 0;
}

// ─── SoundMainBTM = l'implémentation derrière Clear64byte (jump table [35]) ───

/** 1:1 `SoundMainBTM` : écrit 64 octets de zéros à l'adresse donnée. Sur nos
 *  structures TS : remet à zéro les 64 PREMIERS octets du layout —
 *  MusicPlayerTrack (0x00-0x3F) : tous les champs flags…unk_3C, chan et tone
 *  inclus, mais PAS cmdPtr (0x40) ni patternStack (posés par MPlayStart, ils
 *  survivent — vérifié sur constants/m4a_constants.inc) ;
 *  MusicPlayerInfo (sizeof 0x40 pile) : la structure entière. */
export function SoundMainBTM(x: MusicPlayerTrack | MusicPlayerInfo): void {
  if (x instanceof MusicPlayerTrack) {
    x.flags = 0; x.wait = 0; x.patternLevel = 0; x.repN = 0;
    x.gateTime = 0; x.key = 0; x.velocity = 0; x.runningStatus = 0;
    x.keyM = 0; x.pitM = 0; x.keyShift = 0; x.keyShiftX = 0;
    x.tune = 0; x.pitX = 0; x.bend = 0; x.bendRange = 0;
    x.volMR = 0; x.volML = 0; x.vol = 0; x.volX = 0;
    x.pan = 0; x.panX = 0; x.modM = 0; x.mod = 0;
    x.modT = 0; x.lfoSpeed = 0; x.lfoSpeedC = 0; x.lfoDelay = 0;
    x.lfoDelayC = 0; x.priority = 0; x.pseudoEchoVolume = 0; x.pseudoEchoLength = 0;
    x.chan = null;
    x.tone.type = 0; x.tone.key = 0; x.tone.length = 0; x.tone.pan_sweep = 0;
    x.tone.wav = 0; x.tone.attack = 0; x.tone.decay = 0; x.tone.sustain = 0;
    x.tone.release = 0;
    x.timer = 0; x.unk_3C = 0;
    // cmdPtr / patternStack : hors des 64 octets — préservés.
  } else {
    x.songHeader = 0; x.status = 0; x.trackCount = 0; x.priority = 0;
    x.cmd = 0; x.unk_B = 0; x.clock = 0; x.memAccArea = 0;
    x.tempoD = 0; x.tempoU = 0; x.tempoI = 0; x.tempoC = 0;
    x.fadeOI = 0; x.fadeOC = 0; x.fadeOV = 0;
    x.tracks = null; x.tone = 0; x.ident = 0;
    x.MPlayMainNext = null; x.musicPlayerNext = null;
  }
}

// ─── RealClearChain (jump table [34], derrière ClearChain) ────────────────────

/** 1:1 : détache le canal de la liste chaînée de son track. */
export function RealClearChain(x: SoundChannel | CgbChannel): void {
  const track = x.track;
  if (track === null) return;
  const next = x.nextChannelPointer;
  const prev = x.prevChannelPointer;
  if (prev !== null && !(prev instanceof MusicPlayerTrack)) {
    prev.nextChannelPointer = next;
  } else {
    track.chan = next;
  }
  if (next !== null) next.prevChannelPointer = prev;
  x.track = null;
}

// ─── ply_fine ─────────────────────────────────────────────────────────────────

/** 1:1 : fin de piste — stoppe tous les canaux de la chaîne et tue la piste. */
export function ply_fine(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  let chan = track.chan;
  while (chan !== null) {
    if (chan.statusFlags & SOUND_CHANNEL_SF_ON) {
      chan.statusFlags |= SOUND_CHANNEL_SF_STOP;
    }
    RealClearChain(chan);
    chan = chan.nextChannelPointer;
  }
  track.flags = 0;
}

// ─── MPlayJumpTableCopy ───────────────────────────────────────────────────────

/** 1:1 : copie les 36 entrées de gMPlayJumpTableTemplate vers la table cible.
 *  (Le garde `chk_adr_r2` anti-BIOS est N/A ici.) */
export function MPlayJumpTableCopy(mplayJumpTable: Array<(...args: never[]) => void>): void {
  for (let i = 0; i < 36; i++) mplayJumpTable[i] = gMPlayJumpTableTemplate[i];
}

// ─── Handlers de commandes (0xB1+) ────────────────────────────────────────────

/** 1:1 `ply_goto` : cmdPtr = u32 little-endian lu à cmdPtr. */
export function ply_goto(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.cmdPtr = rdU32(track.cmdPtr);
}

/** 1:1 `ply_patt` : empile cmdPtr+4 (niveau max 3) puis goto ; sinon fine. */
export function ply_patt(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  if (track.patternLevel < 3) {
    track.patternStack[track.patternLevel] = (track.cmdPtr + 4) >>> 0;
    track.patternLevel++;
    ply_goto(mplayInfo, track);
  } else {
    ply_fine(mplayInfo, track);
  }
}

/** 1:1 `ply_pend` : dépile le pattern courant. */
export function ply_pend(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  if (track.patternLevel !== 0) {
    track.patternLevel--;
    track.cmdPtr = track.patternStack[track.patternLevel];
  }
}

/** 1:1 `ply_rept` : n=0 → boucle infinie (goto) ; sinon répète n fois. */
export function ply_rept(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  if (rdU8(track.cmdPtr) === 0) {
    track.cmdPtr = (track.cmdPtr + 1) >>> 0;
    ply_goto(mplayInfo, track);
    return;
  }
  track.repN = (track.repN + 1) & 0xff;
  const repCount = track.repN;
  const before = track.cmdPtr;
  const n = ld_r3_tp_adr_i(track);
  if (repCount < n) {
    ply_goto(mplayInfo, track);
    return;
  }
  track.repN = 0;
  track.cmdPtr = (before + 5) >>> 0; // saute n (1) + adresse cible (4)
}

/** 1:1 `ply_prio`. */
export function ply_prio(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.priority = ld_r3_tp_adr_i(track);
}

/** 1:1 `ply_tempo` : tempoD = 2×val ; tempoI = tempoD×tempoU >> 8. */
export function ply_tempo(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  mplayInfo.tempoD = (ld_r3_tp_adr_i(track) * 2) & 0xffff;
  mplayInfo.tempoI = ((mplayInfo.tempoD * mplayInfo.tempoU) >> 8) & 0xffff;
}

/** 1:1 `ply_keysh` : flags |= 0xC (= MPT_FLG_PITCHG entier, movs 0xC du .s). */
export function ply_keysh(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.keyShift = s8(ld_r3_tp_adr_i(track));
  track.flags = (track.flags | MPT_FLG_PITCHG) & 0xff;
}

/** 1:1 `ply_voice` : programme n → copie ToneData (12 bytes) du voicegroup. */
export function ply_voice(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  const n = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
  const toneOff = (mplayInfo.tone + n * 12) >>> 0;
  track.tone.readFromMemory(gSoundMemory, toneOff);
}

/** 1:1 `ply_vol`. */
export function ply_vol(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.vol = ld_r3_tp_adr_i(track);
  track.flags = (track.flags | MPT_FLG_VOLCHG) & 0xff;
}

/** 1:1 `ply_pan` (valeur − C_V). */
export function ply_pan(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.pan = s8(ld_r3_tp_adr_i(track) - 0x40);
  track.flags = (track.flags | MPT_FLG_VOLCHG) & 0xff;
}

/** 1:1 `ply_bend` (valeur − C_V). */
export function ply_bend(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.bend = s8(ld_r3_tp_adr_i(track) - 0x40);
  track.flags = (track.flags | MPT_FLG_PITCHG) & 0xff;
}

/** 1:1 `ply_bendr`. */
export function ply_bendr(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.bendRange = ld_r3_tp_adr_i(track);
  track.flags = (track.flags | MPT_FLG_PITCHG) & 0xff;
}

/** 1:1 `ply_lfodl`. */
export function ply_lfodl(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.lfoDelay = ld_r3_tp_adr_i(track);
}

/** 1:1 `ply_modt` : ne pose les flags que si le type change. */
export function ply_modt(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  const v = ld_r3_tp_adr_i(track);
  if (track.modT !== v) {
    track.modT = v;
    track.flags = (track.flags | MPT_FLG_VOLCHG | MPT_FLG_PITCHG) & 0xff;
  }
}

/** 1:1 `ply_tune` (valeur − C_V). */
export function ply_tune(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.tune = s8(ld_r3_tp_adr_i(track) - 0x40);
  track.flags = (track.flags | MPT_FLG_PITCHG) & 0xff;
}

/** 1:1 `ply_port` : écrit un registre son brut (SOUND1CNT_L + n ← valeur). */
export function ply_port(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  const regOffset = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
  const value = ld_r3_tp_adr_i(track);
  gSoundIoRam[REG_OFFSET_SOUND1CNT_L + regOffset] = value;
}

// ─── MPlayMain — le séquenceur ────────────────────────────────────────────────

/** 1:1 `MPlayMain` (m4a_1.s:1129) : un appel par VBlank et par player.
 *  1. chaîne au player suivant (MPlayMainNext/musicPlayerNext),
 *  2. FadeOutBody, 3. ticks de séquence tant que tempoC ≥ 150 (gate time,
 *  running status, dispatch plynote/jump table/gClockTable, LFO),
 *  4. passe TrkVolPitSet → volumes/fréquences des canaux chaînés. */
export function MPlayMain(mplayInfo: MusicPlayerInfo): void {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;

  if (mplayInfo.MPlayMainNext !== null) {
    mplayInfo.MPlayMainNext(mplayInfo.musicPlayerNext as MusicPlayerInfo);
  }

  // status < 0 (signé) = bit PAUSE → rien à séquencer.
  if ((mplayInfo.status | 0) >= 0) {
    const soundInfo = SOUND_INFO_PTR();
    FadeOutBody(mplayInfo);
    if ((mplayInfo.status | 0) >= 0) {
      mplayInfo.tempoC = (mplayInfo.tempoC + mplayInfo.tempoI) & 0xffff;

      while (mplayInfo.tempoC >= 150) {
        // ── un tick de séquence sur chaque piste ──
        let trackCount = mplayInfo.trackCount;
        const tracks = mplayInfo.tracks as MusicPlayerTrack[];
        let bit = 1;
        let activeBits = 0;
        for (let ti = 0; ti < trackCount; ti++, bit = (bit << 1) >>> 0) {
          const track = tracks[ti];
          if (!(track.flags & MPT_FLG_EXIST)) continue;
          activeBits = (activeBits | bit) >>> 0;

          // gate time des canaux tenus par la piste.
          let chan = track.chan;
          while (chan !== null) {
            if (chan.statusFlags & SOUND_CHANNEL_SF_ON) {
              if (chan.gateTime !== 0) {
                chan.gateTime = (chan.gateTime - 1) & 0xff;
                if (chan.gateTime === 0) chan.statusFlags |= SOUND_CHANNEL_SF_STOP;
              }
            } else {
              RealClearChain(chan); // 1:1 ClearChain → jump[34]
            }
            chan = chan.nextChannelPointer;
          }

          // MPT_FLG_START : (ré)initialisation de piste (= m4aMPlayImmInit).
          if (track.flags & MPT_FLG_START) {
            SoundMainBTM(track); // 1:1 Clear64byte → jump[35]
            track.flags = MPT_FLG_EXIST;
            track.bendRange = 2;
            track.volX = 0x40;
            track.lfoSpeed = 22;
            track.tone.type = 1;
          }

          // boucle de commandes tant que wait == 0.
          while (track.wait === 0) {
            let cmd = rdU8(track.cmdPtr);
            if (cmd < 0x80) {
              cmd = track.runningStatus;
            } else {
              track.cmdPtr = (track.cmdPtr + 1) >>> 0;
              if (cmd >= 0xbd) track.runningStatus = cmd;
            }

            if (cmd >= 0xcf) {
              (soundInfo.plynote as (n: number, mi: MusicPlayerInfo, tr: MusicPlayerTrack) => void)(
                cmd - 0xcf, mplayInfo, track,
              );
            } else if (cmd > 0xb0) {
              mplayInfo.cmd = (cmd - 0xb1) & 0xff;
              const handler = (soundInfo.MPlayJumpTable as Array<(...a: never[]) => void>)[cmd - 0xb1] as
                unknown as (mi: MusicPlayerInfo, tr: MusicPlayerTrack) => void;
              handler(mplayInfo, track);
              if (track.flags === 0) break; // ply_fine a tué la piste
            } else {
              track.wait = gClockTable[cmd - 0x80];
            }
          }
          if (track.flags === 0) continue; // piste tuée pendant le dispatch

          if (track.wait !== 0) track.wait = (track.wait - 1) & 0xff;

          // LFO (vibrato/trémolo).
          if (track.lfoSpeed !== 0 && track.mod !== 0) {
            if (track.lfoDelayC !== 0) {
              track.lfoDelayC = (track.lfoDelayC - 1) & 0xff;
            } else {
              track.lfoSpeedC = (track.lfoSpeedC + track.lfoSpeed) & 0xff;
              let r2: number;
              if (s8(track.lfoSpeedC - 0x40) < 0) {
                r2 = s8(track.lfoSpeedC);
              } else {
                r2 = 0x80 - track.lfoSpeedC;
              }
              const modM = s8(((track.mod * r2) >> 6) & 0xff);
              if (track.modM !== (modM & 0xff)) {
                track.modM = modM & 0xff;
                track.flags = (track.flags | (track.modT === 0 ? MPT_FLG_PITCHG : MPT_FLG_VOLCHG)) & 0xff;
              }
            }
          }
        }

        mplayInfo.clock = (mplayInfo.clock + 1) >>> 0;
        if (activeBits === 0) {
          mplayInfo.status = 0x80000000 >>> 0; // plus aucune piste → PAUSE
          break;
        }
        mplayInfo.status = activeBits;
        mplayInfo.tempoC = (mplayInfo.tempoC - 150) & 0xffff;
        void trackCount;
      }

      // ── passe volumes/pitch (chaque VBlank, même sans tick) ──
      if ((mplayInfo.status | 0) >= 0) {
        const tracks = mplayInfo.tracks as MusicPlayerTrack[];
        for (let ti = 0; ti < mplayInfo.trackCount; ti++) {
          const track = tracks[ti];
          if (!(track.flags & MPT_FLG_EXIST)) continue;
          if (!(track.flags & (MPT_FLG_VOLCHG | MPT_FLG_PITCHG))) continue;
          TrkVolPitSet(mplayInfo, track);
          let chan = track.chan;
          while (chan !== null) {
            if (!(chan.statusFlags & SOUND_CHANNEL_SF_ON)) {
              RealClearChain(chan); // 1:1 ClearChain
              chan = chan.nextChannelPointer;
              continue;
            }
            const cgbType = chan.type & TONEDATA_TYPE_CGB;
            if (track.flags & MPT_FLG_VOLCHG) {
              ChnVolSetAsm(chan, track);
              if (cgbType !== 0) (chan as CgbChannel).modify |= CGB_CHANNEL_MO_VOL;
            }
            if (track.flags & MPT_FLG_PITCHG) {
              let key2 = chan.key + s8(track.keyM);
              if (key2 < 0) key2 = 0;
              if (cgbType !== 0) {
                const cgbChan = chan as CgbChannel;
                cgbChan.frequency = (soundInfo.MidiKeyToCgbFreq as (c: number, k: number, p: number) => number)(
                  cgbType, key2, track.pitM,
                ) >>> 0;
                cgbChan.modify |= CGB_CHANNEL_MO_PIT;
              } else {
                (chan as SoundChannel).frequency = MidiKeyToFreq((chan as SoundChannel).wav, key2, track.pitM) >>> 0;
              }
            }
            chan = chan.nextChannelPointer;
          }
          track.flags = track.flags & 0xf0;
        }
      }
    }
  }

  mplayInfo.ident = ID_NUMBER;
}

// ─── TrackStop ────────────────────────────────────────────────────────────────

/** 1:1 : coupe tous les canaux d'une piste (CgbOscOff pour les PSG). */
export function TrackStop(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  if (!(track.flags & MPT_FLG_EXIST)) return;
  let chan = track.chan;
  while (chan !== null) {
    if (chan.statusFlags !== 0) {
      const cgbType = chan.type & TONEDATA_TYPE_CGB;
      if (cgbType !== 0) {
        const soundInfo = SOUND_INFO_PTR();
        soundInfo.CgbOscOff?.(cgbType);
      }
      chan.statusFlags = 0;
    }
    chan.track = null;
    chan = chan.nextChannelPointer;
  }
  track.chan = null;
}

// ─── ChnVolSetAsm ─────────────────────────────────────────────────────────────

/** 1:1 : volumes G/D du canal = velocity × (128±rhythmPan) × volM(R|L) >> 14,
 *  saturés à 255. */
export function ChnVolSetAsm(chan: SoundChannel | CgbChannel, track: MusicPlayerTrack): void {
  const velocity = chan.velocity;
  const rhythmPan = s8(chan.rhythmPan);
  let right = (((0x80 + rhythmPan) * velocity * track.volMR) >> 14);
  if (right > 0xff) right = 0xff;
  chan.rightVolume = right;
  let left = (((0x7f - rhythmPan) * velocity * track.volML) >> 14);
  if (left > 0xff) left = 0xff;
  chan.leftVolume = left;
}

// ─── ply_note — allocation et démarrage de canal ─────────────────────────────

/** 1:1 `ply_note` (m4a_1.s:1538) : note_cmd = cmd − 0xCF (0 = TIE).
 *  Lit key/velocity/gtp optionnels, résout key-split/rhythm, choisit le canal
 *  (CGB fixe ou DirectSound par priorité), le chaîne au track et l'arme. */
export function ply_note(noteCmd: number, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  const soundInfo = SOUND_INFO_PTR();

  track.gateTime = gClockTable[noteCmd];
  // paramètres optionnels (< 0x80) : key, velocity, gtp (gateTime += gtp).
  let b = rdU8(track.cmdPtr);
  if (b < 0x80) {
    track.key = b;
    track.cmdPtr = (track.cmdPtr + 1) >>> 0;
    b = rdU8(track.cmdPtr);
    if (b < 0x80) {
      track.velocity = b;
      track.cmdPtr = (track.cmdPtr + 1) >>> 0;
      b = rdU8(track.cmdPtr);
      if (b < 0x80) {
        track.gateTime = (track.gateTime + b) & 0xff;
        track.cmdPtr = (track.cmdPtr + 1) >>> 0;
      }
    }
  }

  // Résolution key-split / rhythm → tone effectif (offset ROM ou tone du track).
  let rhythmPan = 0;
  let key: number;
  // « tone effectif » : soit le ToneData du track (objet), soit une entrée de
  // sous-voicegroup lue dans gSoundMemory (offset). On matérialise les champs.
  let toneType: number;
  let toneWav: number;
  let toneAttack: number;
  let toneDecay: number;
  let toneSustain: number;
  let toneRelease: number;
  let toneLength: number;
  let tonePanSweep: number;

  if (track.tone.type & (TONEDATA_TYPE_RHY | TONEDATA_TYPE_SPL)) {
    let note: number;
    if (track.tone.type & TONEDATA_TYPE_SPL) {
      // keySplitTable ≡ les 4 octets ADSR du tone relus comme pointeur u32
      // (constants/m4a_constants.inc:190 — .equiv keySplitTable, attack).
      const keySplitTable =
        (track.tone.attack | (track.tone.decay << 8) | (track.tone.sustain << 16) | (track.tone.release << 24)) >>> 0;
      note = rdU8((keySplitTable + track.key) >>> 0);
    } else {
      note = track.key;
    }
    const subToneOff = (track.tone.wav + note * 12) >>> 0;
    const subType = rdU8(subToneOff);
    if (subType & (TONEDATA_TYPE_SPL | TONEDATA_TYPE_RHY)) return; // 1:1 abandon
    if (track.tone.type & TONEDATA_TYPE_RHY) {
      const ps = rdU8(subToneOff + 3);
      if (ps & 0x80) rhythmPan = ((ps - TONEDATA_P_S_PAN) << 1) & 0xff;
      key = rdU8(subToneOff + 1); // la clé jouée = tone.key du percussif
    } else {
      // Key-split : la valeur de table (`note`) n'est QUE l'index du sous-tone ;
      // la clé jouée RESTE track.key (m4a_1.s:1585 — r3 jamais réécrit en SPL).
      // 🩸 Payé à l'oracle A-bis : key=2 (l'index) → basse fantôme à 234 Hz.
      key = track.key;
    }
    toneType = subType;
    tonePanSweep = rdU8(subToneOff + 3);
    toneLength = rdU8(subToneOff + 2);
    toneWav = rdU32(subToneOff + 4);
    toneAttack = rdU8(subToneOff + 8);
    toneDecay = rdU8(subToneOff + 9);
    toneSustain = rdU8(subToneOff + 10);
    toneRelease = rdU8(subToneOff + 11);
  } else {
    key = track.key;
    toneType = track.tone.type;
    tonePanSweep = track.tone.pan_sweep;
    toneLength = track.tone.length;
    toneWav = track.tone.wav;
    toneAttack = track.tone.attack;
    toneDecay = track.tone.decay;
    toneSustain = track.tone.sustain;
    toneRelease = track.tone.release;
  }

  // priorité effective = priorité player + priorité piste (sat. 255).
  let priority = mplayInfo.priority + track.priority;
  if (priority > 0xff) priority = 0xff;

  const cgbType = toneType & TONEDATA_TYPE_CGB;
  let chan: SoundChannel | CgbChannel | null = null;

  if (cgbType !== 0) {
    // Canal PSG fixe cgbChans[type-1] — occupé et pas en release : volé
    // seulement si sa priorité est plus basse, ou égale avec un track
    // d'adresse ≥ la nôtre (1:1 cmp/bcs de m4a_1.s:1658-1668).
    if (soundInfo.cgbChans === null) return;
    const cgbChan = soundInfo.cgbChans[cgbType - 1];
    if ((cgbChan.statusFlags & SOUND_CHANNEL_SF_ON) && !(cgbChan.statusFlags & SOUND_CHANNEL_SF_STOP)) {
      if (cgbChan.priority > priority) return;
      if (cgbChan.priority === priority && (cgbChan.track as MusicPlayerTrack).addrOrder < track.addrOrder) return;
    }
    chan = cgbChan;
  } else {
    // DirectSound (1:1 m4a_1.s:1669-1718) : premier canal libre → pris direct.
    // Sinon vol : baselines initiales = notre (priorité, track) ; le premier
    // canal en release devient candidat direct et RESET les baselines ; dès
    // qu'un release existe, les canaux actifs ne concourent plus. Un canal
    // vole le candidat si priorité plus basse, ou égale avec track ≥ baseline.
    let bestPriority = priority;
    let bestTrackOrder = track.addrOrder;
    let candidate: SoundChannel | null = null;
    let foundReleasing = 0;
    for (let i = 0; i < soundInfo.maxChans; i++) {
      const c = soundInfo.chans[i];
      if (!(c.statusFlags & SOUND_CHANNEL_SF_ON)) { chan = c; break; } // libre
      if (c.statusFlags & SOUND_CHANNEL_SF_STOP) {
        if (foundReleasing === 0) {
          foundReleasing = 1;
          bestPriority = c.priority;
          bestTrackOrder = (c.track as MusicPlayerTrack).addrOrder;
          candidate = c;
          continue;
        }
      } else if (foundReleasing !== 0) {
        continue; // canal actif ignoré dès qu'un release est en lice
      }
      if (c.priority < bestPriority) {
        bestPriority = c.priority;
        bestTrackOrder = (c.track as MusicPlayerTrack).addrOrder;
        candidate = c;
      } else if (c.priority === bestPriority) {
        if ((c.track as MusicPlayerTrack).addrOrder >= bestTrackOrder) {
          bestTrackOrder = (c.track as MusicPlayerTrack).addrOrder;
          candidate = c;
        }
      }
    }
    if (chan === null) {
      if (candidate === null) return; // rien à voler (1:1 r8 == 0)
      chan = candidate;
    }
  }

  // Chaînage du canal au track (tête de liste).
  RealClearChain(chan); // 1:1 ClearChain
  chan.prevChannelPointer = null;
  const head = track.chan;
  chan.nextChannelPointer = head;
  if (head !== null) head.prevChannelPointer = chan;
  track.chan = chan;
  chan.track = track;

  track.lfoDelayC = track.lfoDelay;
  if (track.lfoDelay !== 0) clear_modM(mplayInfo, track);
  TrkVolPitSet(mplayInfo, track);

  chan.gateTime = track.gateTime;
  chan.midiKey = track.key;
  chan.velocity = track.velocity;
  chan.priority = priority;
  chan.key = key;
  chan.rhythmPan = rhythmPan;
  chan.type = toneType;
  chan.attack = toneAttack;
  chan.decay = toneDecay;
  chan.sustain = toneSustain;
  chan.release = toneRelease;
  chan.pseudoEchoVolume = track.pseudoEchoVolume;
  chan.pseudoEchoLength = track.pseudoEchoLength;
  ChnVolSetAsm(chan, track);

  let key2 = chan.key + s8(track.keyM);
  if (key2 < 0) key2 = 0;

  if (cgbType !== 0) {
    const cgbChan = chan as CgbChannel;
    cgbChan.length = toneLength;
    // sweep : NRx0 réel si (pan_sweep & 0x80) == 0 et (pan_sweep & 0x70) != 0,
    // sinon 8 (= pas de sweep).
    if (!(tonePanSweep & 0x80) && (tonePanSweep & 0x70)) {
      cgbChan.sweep = tonePanSweep;
    } else {
      cgbChan.sweep = 8;
    }
    // wavePointer (canal 3) : le « pointeur wave » = l'offset wav du tone.
    cgbChan.wavePointer = toneWav;
    cgbChan.frequency = ((soundInfo.MidiKeyToCgbFreq as (c: number, k: number, p: number) => number)(
      cgbType, key2, track.pitM,
    )) >>> 0;
  } else {
    const dsChan = chan as SoundChannel;
    dsChan.wav = toneWav;
    dsChan.count = track.unk_3C >>> 0; // XCMD 0D (progrès de lecture, cris)
    dsChan.frequency = MidiKeyToFreq(toneWav, key2, track.pitM) >>> 0;
  }

  chan.statusFlags = SOUND_CHANNEL_SF_START;
  track.flags = track.flags & 0xf0;
}

// ─── ply_endtie ───────────────────────────────────────────────────────────────

/** 1:1 : EOT — stoppe le canal tenu (TIE) dont midiKey == key. */
export function ply_endtie(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  let key: number;
  const b = rdU8(track.cmdPtr);
  if (b < 0x80) {
    key = b;
    track.key = b;
    track.cmdPtr = (track.cmdPtr + 1) >>> 0;
  } else {
    key = track.key;
  }
  let chan = track.chan;
  while (chan !== null) {
    if (
      (chan.statusFlags & (SOUND_CHANNEL_SF_START | SOUND_CHANNEL_SF_ENV))
      && !(chan.statusFlags & SOUND_CHANNEL_SF_STOP)
      && chan.midiKey === key
    ) {
      chan.statusFlags |= SOUND_CHANNEL_SF_STOP;
      return;
    }
    chan = chan.nextChannelPointer;
  }
}

// ─── clear_modM / ply_lfos / ply_mod ─────────────────────────────────────────

/** 1:1 `clear_modM` (version .s — pose modM=0, lfoSpeedC=0 + flag). */
export function clear_modM(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.modM = 0;
  track.lfoSpeedC = 0;
  track.flags = (track.flags | (track.modT === 0 ? MPT_FLG_PITCHG : MPT_FLG_VOLCHG)) & 0xff;
}

/** 1:1 `ply_lfos`. */
export function ply_lfos(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  track.lfoSpeed = ld_r3_tp_adr_i(track);
  if (track.lfoSpeed === 0) clear_modM(mplayInfo, track);
}

/** 1:1 `ply_mod`. */
export function ply_mod(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  track.mod = ld_r3_tp_adr_i(track);
  if (track.mod === 0) clear_modM(mplayInfo, track);
}

// ═════════════════════════════════════════════════════════════════════════════
// LOT 2 — MIXEUR PCM (m4a_1.s:20-86 SoundMain, 88-466 SoundMainRAM,
// 469-709 SoundMainRAM_Unk1/_Unk2, 1070-1127 m4aSoundVSync).
//
// Modèle : les accumulations « 4 samples par mot 32-bit tournant » de l'ARM
// (add r6, r1, r6 ror 8 + compteur dans les bits 30-31 de r5) sont transcrites
// PAR OCTET : chaque octet du produit (vol*sample)>>8 s'additionne modulo 256
// dans pcmBuffer (Int8Array) — les retenues inter-octets sont perdues dans le
// mot ARM (l'octet accumulé est toujours en position 24-31, la retenue sort au
// bit 32), l'effet mémoire est donc STRICTEMENT identique ; le « flush partiel
// du mot » des sorties _081DD174/_081DD4F4 devient un no-op. Le duff-device stm
// du zéro-fill NoReverb (lsrs/bcc + 4×stm) écrit exactement samplesPerVBlank
// octets par moitié → buf.fill équivalent. Même esprit que « registres →
// gSoundIoRam » (adaptations d'en-tête de fichier).
// ═════════════════════════════════════════════════════════════════════════════

// gba_constants.inc:51-52 (deadline scanline de SoundMain — chemin mort tant
// que soundInfo.maxLines = 0, REG_VCOUNT n'avance jamais dans gSoundIoRam).
const VCOUNT_VBLANK = 160;
const TOTAL_SCANLINES = 228;

/** sDecodingBuffer (EWRAM, m4a.c) : le bloc DPCM de 64 samples décodé courant. */
const sDecodingBuffer = new Uint8Array(0x40);

/** 1:1 `SoundMain` (m4a_1.s:20-86) : le point d'entrée par frame du driver —
 *  séquenceur (MPlayMain sur la tête de chaîne), CgbSound, puis mixage PCM de
 *  la tranche courante du double buffer (sélectionnée par pcmDmaCounter). */
export function SoundMain(): void {
  const soundInfo = SOUND_INFO_PTR();
  if (soundInfo.ident !== ID_NUMBER) return;
  soundInfo.ident++; // lock (SoundMainRAM le relâche en sortie, _081DD24A)

  // maxLines → deadline scanline ([sp,0x14]) ; 0 = pas de maximum.
  let deadline = soundInfo.maxLines;
  if (deadline !== 0) {
    let vcount = gSoundIoRam[REG_OFFSET_VCOUNT];
    if (vcount < VCOUNT_VBLANK) vcount += TOTAL_SCANLINES;
    deadline += vcount;
  }

  if (soundInfo.MPlayMainHead !== null) {
    soundInfo.MPlayMainHead(soundInfo.musicPlayerHead as MusicPlayerInfo);
  }
  // bx r3 inconditionnel (l.58-59) : CgbSound est posé par MPlayExtender avant
  // tout SoundMain — null ⇒ TypeError, fidèle au crash GBA.
  (soundInfo.CgbSound as () => void)();

  const samplesPerVBlank = soundInfo.pcmSamplesPerVBlank; // r8
  let cur = 0; // r5 : offset de la tranche courante dans pcmBuffer
  const dmaCounter = soundInfo.pcmDmaCounter; // r4
  if (dmaCounter - 1 > 0) {
    cur += samplesPerVBlank * ((soundInfo.pcmDmaPeriod - (dmaCounter - 1)) | 0);
  }
  SoundMainRAM(soundInfo, dmaCounter, cur, samplesPerVBlank, deadline);
}

/** 1:1 `SoundMainRAM` (m4a_1.s:88-466) : reverb OU zéro-fill de la tranche,
 *  puis par canal DirectSound : enveloppe ADSR + pseudo-écho, et mixage
 *  (fixed / resampling interpolé / DPCM / reverse via _Unk1). */
export function SoundMainRAM(
  soundInfo: SoundInfo,
  dmaCounter: number,
  cur: number,
  samplesPerVBlank: number,
  deadline: number,
): void {
  const buf = soundInfo.pcmBuffer;
  const reverbLvl = soundInfo.reverb; // r3

  if (reverbLvl !== 0) {
    // ── SoundMainRAM_Reverb (ARM, l.96-118) : mélange la tranche avec la
    // tranche « suivante » (ou le début du buffer quand dmaCounter == 2).
    let r7 = dmaCounter === 2 ? 0 : cur + samplesPerVBlank;
    let r5 = cur;
    for (let n = samplesPerVBlank; n > 0; n--) {
      let s = buf[r5 + PCM_DMA_BUF_SIZE] + buf[r5] + buf[r7 + PCM_DMA_BUF_SIZE] + buf[r7];
      r7++;
      s = Math.imul(s, reverbLvl) >> 9;
      if (s & 0x80) s += 1; // arrondi asymétrique du .s (tst 0x80 / addne 1)
      buf[r5 + PCM_DMA_BUF_SIZE] = s;
      buf[r5] = s;
      r5++;
    }
  } else {
    // ── SoundMainRAM_NoReverb (l.120-145) : zéro-fill des deux moitiés.
    buf.fill(0, cur, cur + samplesPerVBlank);
    buf.fill(0, cur + PCM_DMA_BUF_SIZE, cur + PCM_DMA_BUF_SIZE + samplesPerVBlank);
  }

  // _081DCF36
  const divFreq = soundInfo.divFreq; // r12
  const maxChans = soundInfo.maxChans;

  chanLoop:
  for (let chanIdx = 0; chanIdx < maxChans; chanIdx++) {
    const chan = soundInfo.chans[chanIdx]; // r4
    const wav = chan.wav; // r3

    // Deadline scanline (l.156-167) — morte tant que maxLines == 0.
    if (deadline !== 0) {
      let vcount = gSoundIoRam[REG_OFFSET_VCOUNT];
      if (vcount < VCOUNT_VBLANK) vcount += TOTAL_SCANLINES;
      if (vcount >= deadline) break; // b _081DD24A
    }

    let status = chan.statusFlags; // r6
    if (!(status & SOUND_CHANNEL_SF_ON)) continue; // _081DD240

    // ── Enveloppe ADSR + pseudo-écho (l.177-263) ──
    let envVol: number; // r5
    let doAttack = false;
    if (status & SOUND_CHANNEL_SF_START) {
      if (status & SOUND_CHANNEL_SF_STOP) { // _081DCFB0 : kill avant démarrage
        chan.statusFlags = 0;
        continue;
      }
      status = SOUND_CHANNEL_SF_ENV_ATTACK;
      chan.statusFlags = status;
      chan.currentPointer = (wav + WAVE_DATA_HEADER_SIZE + chan.count) >>> 0;
      chan.count = (rdU32(wav + WAVE_DATA_OFF_SIZE) - chan.count) | 0;
      envVol = 0;
      chan.envelopeVolume = 0;
      chan.fw = 0;
      if (rdU8(wav + WAVE_DATA_OFF_FLAGS) & WAVE_DATA_FLAG_LOOP) {
        status |= SOUND_CHANNEL_SF_LOOP;
        chan.statusFlags = status;
      }
      doAttack = true; // b _081DCFF8
    } else {
      envVol = chan.envelopeVolume;
      if (status & SOUND_CHANNEL_SF_IEC) {
        // pseudo-écho en cours (l.210-213) : bhi sur (length - 1).
        const before = chan.pseudoEchoLength;
        chan.pseudoEchoLength = (before - 1) & 0xff;
        if (before - 1 <= 0) { // _081DCFB0
          chan.statusFlags = 0;
          continue;
        }
      } else if (status & SOUND_CHANNEL_SF_STOP) {
        // release (l.218-227)
        envVol = (envVol * chan.release) >> 8;
        if (envVol <= chan.pseudoEchoVolume) {
          // _081DCFC8 : bascule pseudo-écho
          envVol = chan.pseudoEchoVolume;
          if (envVol === 0) {
            chan.statusFlags = 0;
            continue;
          }
          status |= SOUND_CHANNEL_SF_IEC;
          chan.statusFlags = status;
        }
      } else if ((status & SOUND_CHANNEL_SF_ENV) === SOUND_CHANNEL_SF_ENV_DECAY) {
        // decay (l.236-251)
        envVol = (envVol * chan.decay) >> 8;
        const sustain = chan.sustain;
        if (envVol <= sustain) {
          envVol = sustain;
          if (envVol === 0) {
            // _081DCFC8 : sustain nul → pseudo-écho direct
            envVol = chan.pseudoEchoVolume;
            if (envVol === 0) {
              chan.statusFlags = 0;
              continue;
            }
            status |= SOUND_CHANNEL_SF_IEC;
            chan.statusFlags = status;
          } else {
            status = (status - 1) & 0xff; // DECAY → SUSTAIN
            chan.statusFlags = status;
          }
        }
      } else if ((status & SOUND_CHANNEL_SF_ENV) === SOUND_CHANNEL_SF_ENV_ATTACK) {
        doAttack = true; // _081DCFF8
      }
      // SUSTAIN : envVol inchangé.
    }
    if (doAttack) {
      envVol += chan.attack;
      if (envVol >= 0xff) {
        envVol = 0xff;
        status = (status - 1) & 0xff; // ATTACK → DECAY
        chan.statusFlags = status;
      }
    }

    // _081DD006 : volumes effectifs. Le .s lit [soundInfo +
    // o_SoundChannel_release(=7)] = o_SoundInfo_masterVolume (coïncidence
    // d'offsets exploitée par l'asm) → masterVolume.
    chan.envelopeVolume = envVol & 0xff;
    envVol = ((soundInfo.masterVolume + 1) * envVol) >> 4;
    chan.envelopeVolumeRight = ((chan.rightVolume * envVol) >> 8) & 0xff;
    chan.envelopeVolumeLeft = ((chan.leftVolume * envVol) >> 8) & 0xff;

    // Info de boucle ([sp,0x10]/[sp,0xC], l.278-289).
    let loopLen = status & SOUND_CHANNEL_SF_LOOP;
    let loopStartPtr = 0;
    if (loopLen !== 0) {
      const ls = rdU32(wav + WAVE_DATA_OFF_LOOP_START);
      loopStartPtr = (wav + WAVE_DATA_HEADER_SIZE + ls) >>> 0;
      loopLen = (rdU32(wav + WAVE_DATA_OFF_SIZE) - ls) | 0;
    }

    // ── Mixage (ARM _081DD044-) ──
    let r5 = cur; // [sp,0x8] : base de la tranche pour ce canal
    let count = chan.count | 0; // r2
    let ptr = chan.currentPointer >>> 0; // r3
    let fw = chan.fw >>> 0; // r9
    const volR = chan.envelopeVolumeRight; // r10
    const volL = chan.envelopeVolumeLeft; // r11

    if (chan.type & (TONEDATA_TYPE_CMP | TONEDATA_TYPE_REV)) {
      const r = SoundMainRAM_Unk1(
        chan, buf, cur, samplesPerVBlank, divFreq, loopLen, volR, volL, fw, count, ptr,
      );
      chan.fw = r.fw >>> 0; // b _081DD228 : fw puis count/currentPointer
      chan.count = r.count | 0;
      chan.currentPointer = r.ptr >>> 0;
      continue;
    }

    let r8local = samplesPerVBlank; // r8 : samples restants de la frame
    let sub = 0;
    const mix = (s: number): void => {
      buf[r5 + sub] += (volR * s) >> 8;
      buf[r5 + sub + PCM_DMA_BUF_SIZE] += (volL * s) >> 8;
    };

    if (chan.type & TONEDATA_TYPE_FIX) {
      // ── _081DD07C : fréquence fixe (1 sample source = 1 sample sortie) ──
      fixedOuter:
      while (true) {
        if (count > 4) {
          count = (count - r8local) | 0;
          let rel = 0; // r9 réutilisé : reliquat de frame après fin de wave
          if (count <= 0) {
            rel = r8local;
            count = (count + r8local) | 0;
            r8local = count - 4;
            rel = rel - r8local;
            count &= 3;
            if (count === 0) count = 4;
          }
          do { // _081DD0A8 : blocs de 4 samples sans test de fin
            for (sub = 0; sub < 4; sub++) mix(s8(gSoundMemory[ptr + sub]));
            ptr = (ptr + 4) >>> 0;
            r5 += 4;
            r8local -= 4;
          } while (r8local > 0);
          r8local += rel;
          if (r8local === 0) break; // → _081DD22C
        }
        // _081DD0EC : queue sample par sample (fin de wave possible)
        while (true) {
          for (sub = 0; sub < 4; sub++) {
            mix(s8(gSoundMemory[ptr]));
            ptr = (ptr + 1) >>> 0;
            count = (count - 1) | 0;
            if (count === 0) {
              if (loopLen !== 0) { // _081DD164 : boucle
                count = loopLen;
                ptr = loopStartPtr;
              } else { // _081DD174 : stop (flush par-octet : no-op)
                chan.statusFlags = 0;
                continue chanLoop; // sans stores (b _081DD234)
              }
            }
          }
          r5 += 4;
          r8local -= 4;
          if (r8local > 0) continue fixedOuter; // bgt _081DD07C
          break fixedOuter; // → _081DD22C
        }
      }
      chan.count = count | 0; // _081DD22C (fw non stocké en fixed)
      chan.currentPointer = ptr >>> 0;
      continue;
    }

    // ── _081DD19C : resampling avec interpolation linéaire ──
    const step = Math.imul(divFreq, chan.frequency) >>> 0; // mul r4, r12, r1
    let cur0 = s8(gSoundMemory[ptr]); // ldrsb r0, [r3]
    ptr = (ptr + 1) >>> 0;
    let delta = s8(gSoundMemory[ptr]) - cur0; // r1 = next - cur
    resampOuter:
    while (true) { // _081DD1B4
      for (sub = 0; sub < 4; sub++) { // _081DD1BC
        const interp = (cur0 + (Math.imul(fw, delta) >> 23)) | 0;
        mix(interp);
        fw = (fw + step) >>> 0;
        const adv = fw >>> 23;
        if (adv !== 0) {
          fw = (fw & ~0x3f800000) >>> 0; // bic bits 23-29
          count = (count - adv) | 0;
          if (count <= 0) {
            // _081DD134 : fin de wave
            if (loopLen === 0) { // _081DD158 → _081DD174 : stop
              chan.statusFlags = 0;
              continue chanLoop;
            }
            let lr = (0 - count) | 0; // rsb lr, r2, 0
            while (true) { // _081DD148
              count = (count + loopLen) | 0;
              if (count > 0) break;
              lr = (lr - loopLen) | 0;
            }
            // b _081DD1FC (Z=0 ⇒ ldrsbne exécuté) :
            ptr = (loopStartPtr + lr) >>> 0;
            cur0 = s8(gSoundMemory[ptr]);
            ptr = (ptr + 1) >>> 0;
            delta = s8(gSoundMemory[ptr]) - cur0;
          } else {
            let a = adv - 1; // subs lr, 1
            if (a === 0) {
              cur0 = (cur0 + delta) | 0; // addeq r0, r0, r1 (ldrsbne sauté)
            } else { // _081DD1FC
              ptr = (ptr + a) >>> 0;
              cur0 = s8(gSoundMemory[ptr]);
            }
            ptr = (ptr + 1) >>> 0;
            delta = s8(gSoundMemory[ptr]) - cur0;
          }
        }
      }
      r5 += 4;
      r8local -= 4;
      if (r8local <= 0) break; // bgt _081DD1B4
    }
    ptr = (ptr - 1) >>> 0; // sub r3, 1 (r3 pointait sur next)
    chan.fw = fw >>> 0; // _081DD228
    chan.count = count | 0; // _081DD22C
    chan.currentPointer = ptr >>> 0;
  }

  // _081DD24A : unlock.
  soundInfo.ident = ID_NUMBER;
}

/** 1:1 `SoundMainRAM_Unk1` (m4a_1.s:469-667) : mixage des canaux DPCM
 *  compressés (TONEDATA_TYPE_CMP) et/ou joués à l'envers (TONEDATA_TYPE_REV).
 *  Retourne les registres que l'appelant stocke (b _081DD228 : fw/count/ptr). */
export function SoundMainRAM_Unk1(
  chan: SoundChannel,
  buf: Int8Array,
  cur: number,
  samplesPerVBlank: number,
  divFreq: number,
  loopLen: number,
  volR: number,
  volL: number,
  fw: number,
  count: number,
  ptr: number,
): { fw: number; count: number; ptr: number } {
  const wav = chan.wav; // ldr r6, [r4, wav]
  let status = chan.statusFlags;
  if (!(status & SOUND_CHANNEL_SF_SPECIAL)) {
    // Première frame du canal : conversions de pointeur (l.475-491).
    status |= SOUND_CHANNEL_SF_SPECIAL;
    chan.statusFlags = status;
    if (chan.type & TONEDATA_TYPE_REV) {
      // ptr miroir depuis la fin : wav*2 + size + 0x20 - ptr.
      ptr = ((rdU32(wav + WAVE_DATA_OFF_SIZE) + (wav << 1) + 0x20) - ptr) >>> 0;
      chan.currentPointer = ptr;
    }
    if (rdU16(wav + WAVE_DATA_OFF_TYPE) !== 0) {
      // compressé : le pointeur devient un OFFSET dans les samples décodés.
      ptr = (ptr - wav - 0x10) >>> 0;
      chan.currentPointer = ptr;
    }
  }
  // push {r8,r12,lr} ; les lsl 16 des volumes sont absorbés par le modèle
  // par-octet (cf. bandeau LOT 2).
  let step: number;
  if (chan.type & TONEDATA_TYPE_FIX) step = 0x800000;
  else step = Math.imul(divFreq, chan.frequency) >>> 0;

  let remaining = samplesPerVBlank; // [sp] (slot du push) : compteur de frame
  let r5 = cur;
  let sub = 0;
  const mix = (s: number): void => {
    buf[r5 + sub] += (volR * s) >> 8;
    buf[r5 + sub + PCM_DMA_BUF_SIZE] += (volL * s) >> 8;
  };
  const stop = (): { fw: number; count: number; ptr: number } => {
    // _081DD4F4 : stop + flush partiel (no-op par-octet).
    chan.statusFlags = 0;
    return { fw, count, ptr };
  };

  if (rdU16(wav + WAVE_DATA_OFF_TYPE) !== 0) {
    // ── samples COMPRESSÉS : lectures via SoundMainRAM_Unk2 ──
    // str 32-bit sur o_SoundChannel_xpi : couvre xpi+xpc ; xpi porte ici la
    // valeur u32 entière (numéro de bloc, 0xFF000000 = cache invalide).
    chan.xpi = 0xff000000;
    if (!(chan.type & TONEDATA_TYPE_REV)) {
      // _081DD308 : forward
      let cur0 = SoundMainRAM_Unk2(chan, ptr);
      ptr = (ptr + 1) >>> 0;
      let delta = SoundMainRAM_Unk2(chan, ptr) - cur0;
      while (true) {
        for (sub = 0; sub < 4; sub++) { // _081DD310
          const interp = (cur0 + (Math.imul(fw, delta) >> 23)) | 0;
          mix(interp);
          fw = (fw + step) >>> 0;
          const adv = fw >>> 23;
          if (adv !== 0) {
            fw = (fw & ~0x3f800000) >>> 0;
            count = (count - adv) | 0;
            if (count <= 0) {
              // _081DD398 : fin de wave
              if (loopLen === 0) return stop(); // [sp,0x1C] == 0 → _081DD4F4
              let lr = (0 - count) | 0;
              while (true) { // _081DD3B0
                count = (count + loopLen) | 0;
                if (count > 0) break;
                lr = (lr - loopLen) | 0;
              }
              // → _081DD358 : offset loopStart + lr, relecture cur/next.
              ptr = (rdU32(wav + WAVE_DATA_OFF_LOOP_START) + lr) >>> 0;
              cur0 = SoundMainRAM_Unk2(chan, ptr);
              ptr = (ptr + 1) >>> 0; // _081DD364
              delta = SoundMainRAM_Unk2(chan, ptr) - cur0;
            } else {
              const a = adv - 1; // subs lr, 1
              if (a === 0) {
                cur0 = (cur0 + delta) | 0; // add r0, r1 ; b _081DD364
              } else { // _081DD358
                ptr = (ptr + a) >>> 0;
                cur0 = SoundMainRAM_Unk2(chan, ptr);
              }
              ptr = (ptr + 1) >>> 0; // _081DD364
              delta = SoundMainRAM_Unk2(chan, ptr) - cur0;
            }
          }
        }
        r5 += 4;
        remaining -= 4;
        if (remaining <= 0) { // bgt _081DD308
          ptr = (ptr - 1) >>> 0; // sub r3, 1
          return { fw, count, ptr }; // _081DD4F0
        }
      }
    }
    // _081DD3C0 : reverse compressé (pas de boucle de loop)
    ptr = (ptr - 1) >>> 0;
    let cur0 = SoundMainRAM_Unk2(chan, ptr);
    ptr = (ptr - 1) >>> 0;
    let delta = SoundMainRAM_Unk2(chan, ptr) - cur0;
    while (true) {
      for (sub = 0; sub < 4; sub++) { // _081DD3E0
        const interp = (cur0 + (Math.imul(fw, delta) >> 23)) | 0;
        mix(interp);
        fw = (fw + step) >>> 0;
        const adv = fw >>> 23;
        if (adv !== 0) {
          fw = (fw & ~0x3f800000) >>> 0;
          count = (count - adv) | 0;
          if (count <= 0) return stop(); // ble _081DD4F4
          const a = adv - 1;
          if (a === 0) {
            cur0 = (cur0 + delta) | 0; // add r0, r1 ; b _081DD434
          } else { // _081DD428
            ptr = (ptr - a) >>> 0;
            cur0 = SoundMainRAM_Unk2(chan, ptr);
          }
          ptr = (ptr - 1) >>> 0; // _081DD434
          delta = SoundMainRAM_Unk2(chan, ptr) - cur0;
        }
      }
      r5 += 4;
      remaining -= 4;
      if (remaining <= 0) { // bgt _081DD3D8
        ptr = (ptr + 2) >>> 0; // add r3, 2
        return { fw, count, ptr };
      }
    }
  }

  // _081DD468 : non compressé — seul le reverse arrive ici (Unk1 ⇒ CMP|REV).
  if (!(chan.type & TONEDATA_TYPE_REV)) return { fw, count, ptr }; // beq _081DD4F0

  ptr = (ptr - 1) >>> 0; // ldrsb r0, [r3, -1]!
  let cur0 = s8(gSoundMemory[ptr]);
  let delta = s8(gSoundMemory[ptr - 1]) - cur0; // ldrsb r1, [r3, -1] (sans wb)
  while (true) { // _081DD480
    for (sub = 0; sub < 4; sub++) { // _081DD488
      const interp = (cur0 + (Math.imul(fw, delta) >> 23)) | 0;
      mix(interp);
      fw = (fw + step) >>> 0;
      const adv = fw >>> 23;
      if (adv !== 0) {
        fw = (fw & ~0x3f800000) >>> 0;
        count = (count - adv) | 0;
        if (count <= 0) return stop(); // ble _081DD4F4
        ptr = (ptr - adv) >>> 0; // ldrsb r0, [r3, -lr]!
        cur0 = s8(gSoundMemory[ptr]);
        delta = s8(gSoundMemory[ptr - 1]) - cur0;
      }
    }
    r5 += 4;
    remaining -= 4;
    if (remaining <= 0) { // bgt _081DD480
      ptr = (ptr + 1) >>> 0; // add r3, 1
      return { fw, count, ptr };
    }
  }
}

/** 1:1 `SoundMainRAM_Unk2` (m4a_1.s:670-709) : lit le sample DPCM à l'offset
 *  `pos` — décode le bloc de 64 (1 sample brut + 63 deltas nibble via
 *  gDeltaEncodingTable, 0x21 octets/bloc) dans sDecodingBuffer si le cache
 *  (chan.xpi = numéro de bloc) ne le tient pas déjà. */
export function SoundMainRAM_Unk2(chan: SoundChannel, pos: number): number {
  const blockNum = pos >>> 6;
  if (blockNum !== chan.xpi) {
    chan.xpi = blockNum;
    let src = (chan.wav + 0x10 + blockNum * 0x21) >>> 0;
    let out = 0;
    let acc = gSoundMemory[src]; // 1er sample brut
    src = (src + 1) >>> 0;
    sDecodingBuffer[out++] = acc;
    let byteVal = gSoundMemory[src];
    src = (src + 1) >>> 0;
    let n = 0x40; // r7
    while (true) { // b _081DD57C : nibble BAS du 1er byte, puis haut/bas
      acc = (acc + gDeltaEncodingTable[byteVal & 0xf]) & 0xff;
      sDecodingBuffer[out++] = acc;
      n -= 2;
      if (n <= 0) break; // bgt _081DD568
      byteVal = gSoundMemory[src];
      src = (src + 1) >>> 0;
      acc = (acc + gDeltaEncodingTable[byteVal >> 4]) & 0xff;
      sDecodingBuffer[out++] = acc;
    }
  }
  return s8(sDecodingBuffer[pos & 0x3f]); // ldrsb
}

/** 1:1 `m4aSoundVSync` (m4a_1.s:1070-1127) : décompte du double buffer DMA.
 *  Appelé chaque VCount intr (main.c:386, VCountIntr) — quand le compteur
 *  tombe à 0, recharge pcmDmaPeriod. Le réarmement DMA1/DMA2 FIFO (REG_DMA*)
 *  est du hardware pur : le worklet consommera pcmBuffer directement (lot
 *  worklet), rien d'autre à émuler ici. */
export function m4aSoundVSync(): void {
  const soundInfo = _soundInfoPtr;
  if (!soundInfo) return;
  // ident ∈ {ID_NUMBER, ID_NUMBER+1} : accepte le lock posé par SoundMain.
  if (((soundInfo.ident - ID_NUMBER) >>> 0) > 1) return;
  const before = soundInfo.pcmDmaCounter;
  soundInfo.pcmDmaCounter = (before - 1) & 0xff;
  if (before - 1 > 0) return; // bgt Done
  soundInfo.pcmDmaCounter = soundInfo.pcmDmaPeriod;
}
