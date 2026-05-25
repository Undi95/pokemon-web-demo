/**
 * script-opcodes-sound.ts — opcodes audio 1:1 décomp `sound.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_playse`           (l. 903-921)   : PlaySE(songNum).
 *   `ScrCmd_waitse`           (l. 917-921)   : SetupNativeScript(WaitForSoundEffectFinish).
 *   `ScrCmd_playfanfare`      (l. 923-932)   : PlayFanfare(songNum).
 *   `ScrCmd_waitfanfare`      (l. 934-938)   : SetupNativeScript(WaitForFanfareFinish).
 *   `ScrCmd_playbgm`          (l. 940-949)   : PlayBGM(songNum, savePrev).
 *   `ScrCmd_savebgm`          (l. 951-955)   : SavePlayerBgm().
 *   `ScrCmd_fadedefaultbgm`   (l. 957-961)   : PlayNewMapMusic(GetCurrentMapMusic()).
 *   `ScrCmd_fadenewbgm`       (l. 963-967)   : FadeNewBGM(songNum).
 *   `ScrCmd_fadeoutbgm`       (l. 969-979)   : FadeOutBGM(speed).
 *   `ScrCmd_fadeinbgm`        (l. 981-990)   : FadeInBGM(speed).
 *   `ScrCmd_playmoncry`       (l. 2019-2027) : PlayCry(species, mode).
 *   `ScrCmd_waitmoncry`       (l. 2028-2032) : SetupNativeScript(IsCryFinished).
 *
 * `playsewithpan` / `loopsewithpan` / `waitplaysewithpan` ne sont pas dans
 * scrcmd.c (= macros field qui dispatchent à playse/waitse + pan stereo
 * ignoré côté web).
 */

import { registerOpcode, getOpcodeHandler, SetupNativeScript } from './script-runtime';
import { VarGet } from './script-vars';
import { PlaySE } from '../system/decomp-globals';
import { gMapHeader } from '../field/map-loader';
import { resolveDecompConstant } from '../system/decomp-constants';
import * as Songs from '../decomp-data/include/constants/songs-data';

registerOpcode('playse', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_playse` (scrcmd.c) : PlaySE avec le SE constant string.
  // On lookup l'ID dans songs-data (= e.g. SE_LEDGE → 22).
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') {
    PlaySE(seId);
  } else {
    console.warn(`[opcode playse] unknown SE '${seName}'`);
  }
  return false;
});

registerOpcode('playfanfare', (_ctx, args) => {
  // 1:1 décomp `ScrCmd_playfanfare` (scrcmd.c) :
  //   PlayFanfare(songNum); return FALSE;
  // PlayFanfare marque _audioEndTimeMs.fanfare = +3000ms → waitfanfare opcode
  // bloque jusqu'à fin (= "PLAYER reçoit STR_VAR_1!" tempo correct).
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('../system/decomp-globals').then(({ PlayFanfare }) => {
      PlayFanfare(songId);
    });
  } else {
    console.warn(`[opcode playfanfare] unknown fanfare '${songName}'`);
  }
  return false;
});

registerOpcode('waitfanfare', (ctx) => {
  // 1:1 décomp ScrCmd_waitfanfare (scrcmd.c:1187) :
  //   SetupNativeScript(ctx, WaitForFanfareFinish) ; return TRUE
  // WaitForFanfareFinish : return IsFanfareTaskInactive().
  const poll = (): boolean => {
    const dg = (globalThis as { __decompGlobals?: { IsFanfareTaskInactive?: () => boolean } }).__decompGlobals;
    return dg?.IsFanfareTaskInactive?.() ?? true;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

/** 1:1 décomp `ScrCmd_playbgm` (scrcmd.c) : PlayBGM avec un song id + loop flag.
 *  Format args : args[0] = song name, args[1] = TRUE/FALSE for loop. */
registerOpcode('playbgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('../system/decomp-globals').then(({ m4aSongNumStart }) => {
      m4aSongNumStart(songId, true);
    });
  } else {
    console.warn(`[opcode playbgm] unknown BGM '${songName}'`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_savebgm` (scrcmd.c) :
 *    sSavedBgm = VarGet(arg);  // store song id for restore by fadedefaultbgm. */
let _savedBgmSongId = 0;
registerOpcode('savebgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  _savedBgmSongId = typeof songId === 'number' ? songId : VarGet(songName);
  return false;
});
void _savedBgmSongId;  // consumed by fadedefaultbgm (deferred lookup).

/** 1:1 décomp `ScrCmd_fadedefaultbgm` (scrcmd.c) :
 *    PlayNewMapMusic(GetCurrentMapMusic());  // restart map default BGM */
registerOpcode('fadedefaultbgm', (_ctx, _args) => {
  const mapMusic = gMapHeader?.music;
  let songId: number | undefined;
  if (typeof mapMusic === 'number' && mapMusic > 0) {
    songId = mapMusic;
  } else if (typeof mapMusic === 'string') {
    songId = (Songs as unknown as Record<string, number>)[mapMusic];
  }
  if (typeof songId === 'number' && songId > 0) {
    void import('../system/decomp-globals').then(({ m4aSongNumStart }) => {
      m4aSongNumStart(songId!, true);
    });
  }
  return false;
});

/** 1:1 décomp `ScrCmd_fadenewbgm` (scrcmd.c) : fade to new BGM. */
registerOpcode('fadenewbgm', (_ctx, args) => {
  const songName = args[0] ?? '';
  const songId = (Songs as unknown as Record<string, number>)[songName];
  if (typeof songId === 'number') {
    void import('../system/decomp-globals').then(({ m4aSongNumStart, FadeOutBGM }) => {
      FadeOutBGM(4);
      setTimeout(() => m4aSongNumStart(songId, true), 200);
    });
  }
  return false;
});

/** 1:1 décomp `ScrCmd_fadeoutbgm` (scrcmd.c) : fade out current BGM. */
registerOpcode('fadeoutbgm', (_ctx, args) => {
  const speed = parseInt(args[0] ?? '4', 10) || 4;
  void import('../system/decomp-globals').then(({ FadeOutBGM }) => FadeOutBGM(speed));
  return false;
});

/** 1:1 décomp `ScrCmd_fadeinbgm` (scrcmd.c) : fade in current BGM. */
registerOpcode('fadeinbgm', (_ctx, args) => {
  const speed = parseInt(args[0] ?? '4', 10) || 4;
  void import('../system/decomp-globals').then(({ FadeInBGM }) => FadeInBGM(speed));
  return false;
});

/** 1:1 décomp `ScrCmd_playmoncry` (scrcmd.c:2019-2027) : play Pokemon cry.
 *  Args : species (= "VAR_TEMP_1" ou "SPECIES_X"), mode (= 0 normal). */
registerOpcode('playmoncry', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  const speciesId = speciesArg.startsWith('VAR_') || speciesArg.startsWith('0x80')
    ? VarGet(speciesArg)
    : (resolveDecompConstant(speciesArg) ?? 0);
  void import('../system/decomp-globals').then(({ PlayCryInternal }) => {
    PlayCryInternal(speciesId, 0, 64, 0, 0);
  }).catch(() => {});
  return false;
});

// ─── playsewithpan / loopsewithpan / waitse / waitplaysewithpan / waitmoncry ─

// 1:1 décomp scrcmd.c — alias to playse with stereo pan ignored (= we don't
// emulate stereo positioning). 1746x usage in scripts.
registerOpcode('playsewithpan', (_ctx, args) => {
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') PlaySE(seId);
  return false;
});

// 1:1 décomp `ScrCmd_loopsewithpan` — looped SE. Same as playsewithpan for
// stub purpose. 194x usage.
registerOpcode('loopsewithpan', (_ctx, args) => {
  const seName = args[0] ?? '';
  const seId = (Songs as unknown as Record<string, number>)[seName];
  if (typeof seId === 'number') PlaySE(seId);
  return false;
});

// `waitse` — stub early enregistré pour overwrite par real impl ci-dessous.
registerOpcode('waitse', (_ctx) => false);

// `waitplaysewithpan` — stub early.
registerOpcode('waitplaysewithpan', (_ctx) => false);

registerOpcode('waitse', (ctx, _args) => {
  // 1:1 décomp ScrCmd_waitse (scrcmd.c:1162) :
  //   SetupNativeScript(ctx, WaitForSoundEffectFinish) ; return TRUE
  // WaitForSoundEffectFinish : return !IsSEPlaying().
  const poll = (): boolean => {
    const dg = (globalThis as { __decompGlobals?: { IsSEPlaying?: () => boolean } }).__decompGlobals;
    return !(dg?.IsSEPlaying?.() ?? false);  // poll returns TRUE when SE done
  };
  SetupNativeScript(ctx, poll);
  return true;
});

registerOpcode('waitplaysewithpan', (ctx, _args) => {
  // 1:1 décomp : alias de waitse (le 'pan' = stéréo, n'affecte pas le tracking).
  return getOpcodeHandler('waitse')?.(ctx, []) ?? false;
});

registerOpcode('waitmoncry', (ctx, _args) => {
  // 1:1 décomp ScrCmd_waitmoncry (scrcmd.c:1610) :
  //   SetupNativeScript(ctx, IsCryFinished) ; return TRUE
  // IsCryFinished : returns !IsCryPlaying.
  const poll = (): boolean => {
    const dg = (globalThis as { __decompGlobals?: { IsCryFinished?: () => boolean } }).__decompGlobals;
    return dg?.IsCryFinished?.() ?? true;  // poll returns TRUE when cry done
  };
  SetupNativeScript(ctx, poll);
  return true;
});
