/**
 * Transcription LITTÉRALE en TS des bodyC SpriteCB_* + Create*Sprite* du décomp
 * `src/intro.c`. Chaque fonction ci-dessous est une copie 1:1 du bodyC extrait
 * dans `auto/src/sprite-system.ts SPRITE_CALLBACKS / SPRITE_HELPERS`, traduite
 * mot pour mot en remplaçant :
 *   - `gSprites[spriteId].sX` → sprite.data[N] (selon EXPR macros intro-data.ts)
 *   - `Sin(...)` / `Cos(...)` → helpers.Sin/Cos
 *   - `SetOamMatrix(...)` → helpers.SetOamMatrix(rt.gba, ...)
 *   - `CalcCenterToCornerVec(...)` → helpers.CalcCenterToCornerVec(rt.gba, ...)
 *   - `CpuCopy16(src, dst, size)` → palBuffer.cpuCopy16(...)
 *   - `gPlttBufferFaded[OBJ_PLTT_ID(N) + M]` → flatIdx (256 + N*16 + M)
 *   - `gIntroFrameCounter` → rt.gIntroFrameCounter
 *   - `StartSpriteAnim(sprite, idx)` → rt.StartSpriteAnim(spriteId, idx)
 *   - `StartSpriteAffineAnim(sprite, idx)` → rt.StartSpriteAffineAnim (TBD, simplifié)
 *   - `DestroySprite(sprite)` → rt.DestroySprite(spriteId)
 *   - macros sState/sTimer/sLetterId/sColorDelay/sLetterX → data[N] précis
 *
 * Sources canoniques :
 *   - SPRITE_CALLBACKS bodyC : auto/src/sprite-system.ts
 *   - intro-data.ts EXPR mappings :
 *     sState=data[0], sTimer/sBigDropSpriteId/sLetterId=data[2], sColorDelay=data[3],
 *     sLetterX=data[3], sScale=data[1], sRot=data[2], sPos=data[3]
 *   - sGameFreakLetterData / sGameFreakLetterStartDelays / sGameFreakLettersMoveSpeed :
 *     auto/src/sprite-system.ts SPRITE_DATA_TABLES
 *   - gIntroGameFreakTextFade_Pal : public/decomp/em/intro/scene_1/text.pal
 */
import { DecompRuntime, type DecompSprite } from '../decomp-runtime';
import { Sin, Cos, Q_8_8_TO_INT, SetOamMatrix, CalcCenterToCornerVec, ST_OAM_AFFINE_DOUBLE, ST_OAM_OBJ_BLEND, OBJ_PLTT_ID_FADED } from '../decomp-helpers';
import {
  SPRITE_DATA_TABLES,
} from '../decomp-data/auto/src/sprite-system';
import {
  TIMER_LOGO_APPEAR, TIMER_LOGO_DISAPPEAR, TIMER_LOGO_LETTERS_COLOR,
  COLOR_CHANGES,
} from '../decomp-data/intro-data';

// ─── Sprite data field aliases (1:1 EXPR macros intro-data.ts) ───────────────
// Pour chaque sprite type, les data[N] ont des noms symboliques. On les expose
// via getters/setters pour rendre la transcription bodyC plus lisible.
// (Les EXPR macros sont déjà documentées dans intro-data.ts.)

// ─── CreateGameFreakLogoSprites — 1:1 bodyC SPRITE_HELPERS.CreateGameFreakLogoSprites ─
/**
 * Crée 9 sprites letters "GAME FREAK" + 1 sprite logo central.
 * BodyC source décomp src/intro.c :
 *   for (i = 0; i < NUM_GF_LETTERS; i++) {
 *       spriteId = CreateSprite(&sSpriteTemplate_GameFreakLetter, sGameFreakLetterData[i][1] + x, y - 4, 0);
 *       gSprites[spriteId].sState = 0;
 *       gSprites[spriteId].sTimer = sGameFreakLetterStartDelays[i];
 *       gSprites[spriteId].sLetterId = i;
 *       gSprites[spriteId].invisible = TRUE;
 *       gSprites[spriteId].oam.matrixNum = i + 12;
 *       StartSpriteAnim(&gSprites[spriteId], sGameFreakLetterData[i][0]);
 *       StartSpriteAffineAnim(&gSprites[spriteId], 0);
 *   }
 *   spriteId = CreateSprite(&sSpriteTemplate_GameFreakLogo, 120, y - 6, 0);
 *   gSprites[spriteId].sState = 0;
 *   gSprites[spriteId].invisible = TRUE;
 *   gSprites[spriteId].oam.matrixNum = i + 12;  // i = 9 ici → matrixNum 21
 *   StartSpriteAffineAnim(&gSprites[spriteId], 1);
 *
 * @returns spriteId du logo central (= dernier créé, comme le décomp).
 */
export function CreateGameFreakLogoSprites(rt: DecompRuntime, x: number, y: number): number {
  const letterData = SPRITE_DATA_TABLES['sGameFreakLetterData'] as { values: ReadonlyArray<readonly [number, number]> };
  const letterDelays = SPRITE_DATA_TABLES['sGameFreakLetterStartDelays'] as { values: ReadonlyArray<number> };
  const NUM_GF_LETTERS = letterData.values.length;

  let i: number;
  for (i = 0; i < NUM_GF_LETTERS; i++) {
    const [animIdx, xOffset] = letterData.values[i];
    const letterSpriteId = rt.CreateSpriteFromTemplate(
      'sSpriteTemplate_GameFreakLetter',
      xOffset + x,
      y - 4,
    );
    if (letterSpriteId < 0) continue;
    const s = rt.gSprites.get(letterSpriteId)!;
    s.data[0] = 0;                                  // sState = 0
    s.data[2] = letterDelays.values[i];             // sTimer = sGameFreakLetterStartDelays[i]
    // sLetterId : data[2] est aussi sLetterId selon EXPR (conflit !)
    // Décomp utilise sTimer + sLetterId à des moments différents — ici init :
    // sTimer (=data[2]) = delay, plus tard SpriteCB_LogoLetter écrit sLetterId.
    // Pour éviter conflit on store letterId séparément dans data[5] (slot libre).
    s.data[5] = i;                                  // letterId stocké à data[5]
    s.invisible = true;
    s.matrixNum = i + 12;                           // oam.matrixNum = i + 12
    rt.StartSpriteAnim(letterSpriteId, animIdx);    // StartSpriteAnim(letter, sGameFreakLetterData[i][0])
    // StartSpriteAffineAnim(sprite, 0) → simplification : pas implémenté
    rt.setSpriteCallback(letterSpriteId, SpriteCB_LogoLetter);
  }

  // Logo central
  const logoSpriteId = rt.CreateSpriteFromTemplate('sSpriteTemplate_GameFreakLogo', 120, y - 6);
  if (logoSpriteId < 0) return -1;
  const logo = rt.gSprites.get(logoSpriteId)!;
  logo.data[0] = 0;                  // sState = 0
  logo.invisible = true;
  logo.matrixNum = i + 12;           // matrixNum = 21 (NUM_GF_LETTERS + 12)
  // StartSpriteAffineAnim(sprite, 1) → simplification
  rt.setSpriteCallback(logoSpriteId, SpriteCB_GameFreakLogo);
  return logoSpriteId;
}

// ─── SpriteCB_GameFreakLogo — 1:1 bodyC ──────────────────────────────────────
/** Source décomp src/intro.c :
 *   switch(sprite->sState) {
 *   case 0: if (gIntroFrameCounter == TIMER_LOGO_APPEAR) { sprite->invisible = FALSE; sprite->sState++; } break;
 *   case 1: if (gIntroFrameCounter == TIMER_LOGO_DISAPPEAR) { StartSpriteAffineAnim(sprite, 3); sprite->sState++; } break;
 *   case 2: if (sprite->affineAnimEnded) DestroySprite(sprite); break;
 *   }
 */
export function SpriteCB_GameFreakLogo(sprite: DecompSprite, rt: DecompRuntime): void {
  // ⚠️ Décomp utilise `==` strict sur gIntroFrameCounter, mais notre fixed 60Hz peut
  // sauter de 1+ frames si Phaser delta varie ; on utilise `>=` + state machine pour
  // garantir le trigger.
  switch (sprite.data[0]) {  // sState
    case 0:
      if (rt.gIntroFrameCounter >= TIMER_LOGO_APPEAR) {
        sprite.invisible = false;
        sprite.data[0]++;
      }
      break;
    case 1:
      if (rt.gIntroFrameCounter >= TIMER_LOGO_DISAPPEAR) {
        // StartSpriteAffineAnim(sprite, 3) — affine grow/shrink avant disparition
        sprite.data[0]++;
      }
      break;
    case 2:
      // Affine anim sAffineAnim_GameFreak_GrowMedium dure 48 frames → destroy après
      if (rt.gIntroFrameCounter >= TIMER_LOGO_DISAPPEAR + 48) {
        rt.DestroySprite(sprite.spriteId);
      }
      break;
  }
}

// ─── SpriteCB_LogoLetter — 1:1 bodyC simplifié (state machine 9 stades) ─────
/** Source décomp src/intro.c (long bodyC, state machine 0-5 pour fade letters
 *  rouge/jaune via CpuCopy16 de gIntroGameFreakTextFade_Pal).
 *
 *  Simplifications acceptables ici (faisable de raffiner après) :
 *    - states 2-3 (color cycle complet via gIntroGameFreakTextFade_Pal) → simplifié
 *      en juste "wait + show", la palette swap effective sera ajoutée quand on
 *      load text.pal au runtime
 *    - states 4-5 (affine anim disappear + slide) → simplifié en juste hide
 *
 *  States décomp :
 *    0 : wait sTimer (= sGameFreakLetterStartDelays[i]) frames, puis invisible=FALSE
 *    1 : wait TIMER_LOGO_LETTERS_COLOR
 *    2-3 : color fade in+out via gIntroGameFreakTextFade_Pal
 *    4 : wait TIMER_LOGO_DISAPPEAR puis StartSpriteAffineAnim(2)
 *    5 : slide outward avec sLetterX += sGameFreakLettersMoveSpeed[sLetterId], puis destroy
 */
export function SpriteCB_LogoLetter(sprite: DecompSprite, rt: DecompRuntime): void {
  const moveSpeed = SPRITE_DATA_TABLES['sGameFreakLettersMoveSpeed'] as { values: ReadonlyArray<number> };

  switch (sprite.data[0]) {  // sState
    case 0:
      // if (sprite->sTimer != 0) { sprite->sTimer--; }
      // else { sprite->invisible = FALSE; StartSpriteAffineAnim(sprite, 1); sprite->sState++; }
      if (sprite.data[2] !== 0) {  // sTimer
        sprite.data[2]--;
      } else {
        sprite.invisible = false;
        sprite.data[0]++;  // sState++
      }
      break;
    case 1:
      if (rt.gIntroFrameCounter === TIMER_LOGO_LETTERS_COLOR) {
        sprite.data[0]++;
        sprite.data[2] = COLOR_CHANGES;  // sTimer = COLOR_CHANGES
        sprite.data[3] = 2;               // sColorDelay = 2
      }
      break;
    case 2:
      // Color fade IN — palette swap depuis gIntroGameFreakTextFade_Pal vers OBJ_PLTT_ID(1)+15/4/10
      // Simplification : decrement sTimer, à 0 → state++. Le palette swap sera
      // implémenté quand on chargera text.pal dans rt.
      if (sprite.data[3] === 0) {  // sColorDelay == 0
        sprite.data[3] = 2;
        if (sprite.data[2] !== 0) {  // sTimer != 0
          // CpuCopy16(text.pal[sTimer], gPlttBufferFaded[OBJ_PLTT_ID(1)+15])
          // → simplification : on skip, le palette swap nécessite text.pal loaded
          sprite.data[2]--;
        } else {
          sprite.data[0]++;
        }
      } else {
        sprite.data[3]--;
      }
      break;
    case 3:
      // Color fade OUT — symétrique
      if (sprite.data[3] !== 0) {
        sprite.data[3]--;
      } else {
        sprite.data[3] = 2;
        if (sprite.data[2] <= COLOR_CHANGES) {
          sprite.data[2]++;
        } else {
          sprite.data[0]++;
        }
      }
      break;
    case 4:
      if (rt.gIntroFrameCounter === TIMER_LOGO_DISAPPEAR) {
        // StartSpriteAffineAnim(sprite, 2) → simplification
        sprite.objMode = ST_OAM_OBJ_BLEND;  // 1
        sprite.data[0]++;
      }
      break;
    case 5: {
      // sLetterX += sGameFreakLettersMoveSpeed[sLetterId];
      // sprite->x2 = (sLetterX & 0xFF00) >> 8;
      // if (sLetterId < 4) x2 = -x2;
      // if (affineAnimEnded) DestroySprite();
      const letterId = sprite.data[5];  // letterId stored à data[5] par CreateGameFreakLogoSprites
      const speed = moveSpeed.values[letterId] ?? 0;
      sprite.data[3] += speed;  // sLetterX (= data[3] aussi)
      let x2 = (sprite.data[3] & 0xFF00) >> 8;
      if (letterId < 4) x2 = -x2;
      sprite.x2 = x2;
      // Destroy quand letter sort de l'écran
      if (Math.abs(sprite.x + sprite.x2) > 280) {
        rt.DestroySprite(sprite.spriteId);
      }
      break;
    }
  }
}

// ─── SpriteCB_FlygonSilhouette — 1:1 bodyC ───────────────────────────────────
/** Source décomp : long bodyC trigonometric. Switch sState 0/1/2 :
 *    0 : init affine + scale=128 + sState=1
 *    1 : x2 = -Sin(sPos, 140); y2 = -Sin(sPos, 120); sScale += 7; sPos += 3 ;
 *        si x+x2 <= -16, switch state 2 + reset
 *    2 : trajectoire elliptique vers le centre + zoom
 *  Avec affine matrix calculé via Sin/Cos × scale + SetOamMatrix(1, ...).
 */
export function SpriteCB_FlygonSilhouette(sprite: DecompSprite, rt: DecompRuntime): void {
  // sTimer (=data[2] selon EXPR sCosYIdx_EXPR/sScale_EXPR conflit, mais pour Flygon :
  // sScale = data[1], sRot = data[2], sPos = data[3], sTimer compté séparément data[4])
  sprite.data[4]++;  // sTimer++

  if (sprite.data[0] !== 0) {  // sState != 0
    // Compute affine matrix via Sin/Cos
    const rot = sprite.data[2];   // sRot
    const scale = sprite.data[1]; // sScale
    const sin = ((rot & 0xFF) < 256) ? Sin(rot, 256) : 0;  // gSineTable[rot] direct
    const cos = ((rot & 0xFF) < 256) ? Cos(rot, 256) : 0;
    // d = Q_8_8_TO_INT( cos * scale)
    const d = Q_8_8_TO_INT(cos * scale);
    const c = Q_8_8_TO_INT(-sin * scale);
    const b = Q_8_8_TO_INT(sin * scale);
    const a = Q_8_8_TO_INT(cos * scale);
    SetOamMatrix(rt.gba, 1, a, b, c, d);
  }

  switch (sprite.data[0]) {  // sState
    case 0:
    default:
      // sprite->oam.affineMode = ST_OAM_AFFINE_DOUBLE;
      // sprite->oam.matrixNum = 1;
      // CalcCenterToCornerVec(sprite, SPRITE_SHAPE(64x32), SPRITE_SIZE(64x32), ST_OAM_AFFINE_DOUBLE);
      sprite.matrixNum = 1;
      rt.gba.oam[sprite.oamIndex].affineMode = 3;  // DOUBLE
      CalcCenterToCornerVec(rt.gba, sprite.oamIndex, 64, 32, ST_OAM_AFFINE_DOUBLE);
      sprite.invisible = false;
      sprite.data[0] = 1;     // sState = 1
      sprite.data[1] = 128;   // sScale
      sprite.data[2] = 0;     // sRot
      sprite.data[3] = 0;     // sPos
      break;
    case 1:
      // x2 = -Sin(sPos, 140); y2 = -Sin(sPos, 120); sScale += 7; sPos += 3
      sprite.x2 = -Sin(sprite.data[3], 140);
      sprite.y2 = -Sin(sprite.data[3], 120);
      sprite.data[1] += 7;     // sScale += 7
      sprite.data[3] += 3;     // sPos += 3
      if (sprite.x + sprite.x2 <= -16) {
        rt.gba.oam[sprite.oamIndex].priority = 3;
        sprite.data[0]++;     // sState++
        sprite.x = 20;
        sprite.y = 40;
        sprite.data[1] = 512;  // sScale = 512
        sprite.data[2] = 0;     // sRot = 0
        sprite.data[3] = 16;    // sPos = 16
      }
      break;
    case 2:
      // x2 = Sin(sPos, 34); y2 = -Cos(sPos, 60); sScale += 2; if (sTimer % 5 == 0) sPos++
      sprite.x2 = Sin(sprite.data[3], 34);
      sprite.y2 = -Cos(sprite.data[3], 60);
      sprite.data[1] += 2;     // sScale += 2
      if (sprite.data[4] % 5 === 0) sprite.data[3]++;  // sTimer % 5 == 0 : sPos++
      break;
  }
}
