/**
 * wallclock-flow.ts — Special_ViewWallClock + StartWallClock UI inline.
 *
 * Approche : flow native script (= comme starter-choose-flow.ts), polled par
 * l'opcode `special` dispatch dans script-opcodes.ts. Pas de scene Phaser
 * séparée. On dessine un overlay HTML/Canvas via le runtime engine.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/wallclock.c` (= 1101 lignes UI complète)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/clock.c` (= InitTimeBasedEvents)
 *
 * **Différence assumée vs décomp** : on utilise PC time comme source via
 * `rtc.ts` au lieu du chip Sii GBA → no overflow long-terme. Le UI lui-même
 * reste 1:1 fidèle visuellement (cercle d'horloge + aiguilles + AM/PM).
 *
 * Modes :
 *   - VIEW : `Special_ViewWallClock`. Read-only display, press A/B to close.
 *   - SET  : `StartWallClock`. Hidden behind dev console (= user explicit
 *            request session 124 : "menu caché pour changer l'heure"). Player
 *            adjusts hour/minute via arrow keys, A confirms, B cancels.
 *            Le mode SET est techniquement réachable via `dev.wallclock.openSet()`
 *            ou `?wallclock=set` query param.
 *
 * State machine :
 *   INIT       : create canvas overlay + show
 *   WAIT_INPUT : poll keys for advance (SET) / close (VIEW)
 *   CONFIRM    : SET only, after A press, ask Yes/No
 *   COMMIT     : SET only, write offset to RTC + save
 *   FADE_OUT   : remove overlay
 *   DONE       : flow returns true → script unblocks waitstate
 */

import { gMain, getRuntime } from './decomp-globals';
import { RtcCalcLocalTime, gLocalTime, RtcCalcLocalTimeOffset } from './rtc';
import { FlagSet } from './script-vars';
import { SignalWaitState } from './script-opcodes';

// GBA key masks (= 1:1 décomp gba/key.h).
const A_BUTTON   = 0x01;
const B_BUTTON   = 0x02;
const DPAD_RIGHT = 0x10;
const DPAD_LEFT  = 0x20;
const DPAD_UP    = 0x40;
const DPAD_DOWN  = 0x80;

type Mode = 'VIEW' | 'SET';
type State = 'INIT' | 'TICK' | 'CONFIRM_INIT' | 'CONFIRM_WAIT' | 'COMMIT' | 'FADE_OUT' | 'DONE';

interface WallClockFlow { tick(): boolean; }

/**
 * Crée + retourne un flow controller. Le tick() est appelé chaque frame depuis
 * SetupNativeScript jusqu'à ce qu'il retourne true.
 */
export function startWallClockFlow(mode: Mode): WallClockFlow {
  let state: State = 'INIT';
  let overlay: HTMLDivElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let confirmDiv: HTMLDivElement | null = null;
  let confirmIdx = 0;  // 0 = Oui, 1 = Non
  let lastA = false, lastB = false, lastUp = false, lastDown = false, lastL = false, lastR = false;

  // Editable hour/minute pour mode SET. Initialement = current PC time.
  RtcCalcLocalTime();
  let editHour = gLocalTime.hours;
  let editMinute = gLocalTime.minutes;

  // Animation timer pour aiguilles smooth
  let animTimer = 0;

  const cleanup = () => {
    if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
    overlay = null;
    canvas = null;
    confirmDiv = null;
  };

  const tick = (): boolean => {
    animTimer++;

    switch (state) {
      case 'INIT': {
        if (typeof document === 'undefined') {
          // Headless / test mode → skip UI, return done.
          state = 'DONE';
          return false;
        }
        // Mount overlay au-dessus du canvas Phaser.
        overlay = document.createElement('div');
        overlay.id = 'wallclock-overlay';
        overlay.style.cssText = `
          position: fixed; left: 0; top: 0; width: 100%; height: 100%;
          z-index: 9999; pointer-events: none;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0, 0, 0, 0.85);
          opacity: 0; transition: opacity 0.3s ease-in;
          font-family: 'Courier New', monospace;
          color: #fafafa;
        `;

        // Wrapper container pour clock + label.
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          display: flex; flex-direction: column; align-items: center; gap: 18px;
        `;

        // Canvas pour dessiner l'horloge.
        canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        canvas.style.cssText = `
          image-rendering: pixelated;
          background: linear-gradient(180deg, #4488dd 0%, #6699ee 100%);
          border: 3px solid #ffffff;
          border-radius: 8px;
          box-shadow: 0 0 24px rgba(255,255,255,0.3);
        `;
        wrapper.appendChild(canvas);

        // Label en bas.
        const label = document.createElement('div');
        label.id = 'wallclock-label';
        label.style.cssText = `
          font-size: 18px; font-weight: bold; letter-spacing: 1px;
          text-shadow: 2px 2px 0 #000;
        `;
        label.textContent = mode === 'VIEW' ? 'Appuie sur A pour quitter' : 'Réglez l\'heure (←→: heure, ↑↓: minutes, A: confirmer)';
        wrapper.appendChild(label);

        overlay.appendChild(wrapper);
        document.body.appendChild(overlay);

        // Trigger fade in.
        requestAnimationFrame(() => { if (overlay) overlay.style.opacity = '1'; });

        state = 'TICK';
        return false;
      }

      case 'TICK': {
        if (!canvas) return false;

        const heldKeys = gMain?.heldKeys ?? 0;
        const newKeys = gMain?.newKeys ?? 0;
        const aPressed = !!(newKeys & A_BUTTON);
        const bPressed = !!(newKeys & B_BUTTON);
        const upPressed = !!(newKeys & DPAD_UP);
        const downPressed = !!(newKeys & DPAD_DOWN);
        const leftPressed = !!(newKeys & DPAD_LEFT);
        const rightPressed = !!(newKeys & DPAD_RIGHT);
        const leftHeld = !!(heldKeys & DPAD_LEFT);
        const rightHeld = !!(heldKeys & DPAD_RIGHT);
        const upHeld = !!(heldKeys & DPAD_UP);
        const downHeld = !!(heldKeys & DPAD_DOWN);

        // Edge detect (= avoid double counts)
        const aEdge = aPressed && !lastA;
        const bEdge = bPressed && !lastB;
        lastA = aPressed; lastB = bPressed;

        // VIEW : update from PC time chaque frame
        if (mode === 'VIEW') {
          RtcCalcLocalTime();
          editHour = gLocalTime.hours;
          editMinute = gLocalTime.minutes;
        } else {
          // SET : edit local hour/minute. Repeat avec held keys après 8 frames.
          if (leftPressed || (leftHeld && animTimer % 5 === 0)) {
            editHour = (editHour + 23) % 24;
          }
          if (rightPressed || (rightHeld && animTimer % 5 === 0)) {
            editHour = (editHour + 1) % 24;
          }
          if (upPressed || (upHeld && animTimer % 3 === 0)) {
            editMinute = (editMinute + 1) % 60;
          }
          if (downPressed || (downHeld && animTimer % 3 === 0)) {
            editMinute = (editMinute + 59) % 60;
          }
          // Suppress lint warning about lastUp/etc unused.
          lastUp = upPressed; lastDown = downPressed;
          lastL = leftPressed; lastR = rightPressed;
        }

        // Render horloge.
        renderClock(canvas, editHour, editMinute, animTimer, mode);

        // Exit handling.
        if (mode === 'VIEW' && (aEdge || bEdge)) {
          state = 'FADE_OUT';
          return false;
        }
        if (mode === 'SET' && bEdge) {
          // Cancel sans save.
          state = 'FADE_OUT';
          return false;
        }
        if (mode === 'SET' && aEdge) {
          state = 'CONFIRM_INIT';
          return false;
        }
        return false;
      }

      case 'CONFIRM_INIT': {
        if (!overlay) { state = 'DONE'; return false; }
        confirmDiv = document.createElement('div');
        confirmDiv.style.cssText = `
          position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
          background: #fafafa; color: #000; padding: 12px 20px;
          border-radius: 6px; border: 2px solid #555;
          font-family: 'Courier New', monospace; font-size: 16px;
          display: flex; flex-direction: column; gap: 6px;
        `;
        const formattedH = editHour < 12 ? (editHour === 0 ? 12 : editHour) : (editHour === 12 ? 12 : editHour - 12);
        const period = editHour < 12 ? 'AM' : 'PM';
        confirmDiv.innerHTML = `
          <div>Régler l'horloge à ${formattedH}:${String(editMinute).padStart(2,'0')} ${period}?</div>
          <div id="wc-yn" style="display:flex; gap:16px; padding-top:6px;">
            <span data-idx="0">▶ OUI</span>
            <span data-idx="1">  NON</span>
          </div>
        `;
        overlay.appendChild(confirmDiv);
        confirmIdx = 0;
        state = 'CONFIRM_WAIT';
        return false;
      }

      case 'CONFIRM_WAIT': {
        const newKeys = gMain?.newKeys ?? 0;
        const aPressed = !!(newKeys & A_BUTTON);
        const bPressed = !!(newKeys & B_BUTTON);
        const upPressed = !!(newKeys & DPAD_UP);
        const downPressed = !!(newKeys & DPAD_DOWN);
        const aEdge = aPressed && !lastA;
        const bEdge = bPressed && !lastB;
        lastA = aPressed; lastB = bPressed;

        if (upPressed || downPressed) {
          confirmIdx = 1 - confirmIdx;
          if (confirmDiv) {
            const ynRow = confirmDiv.querySelector('#wc-yn');
            if (ynRow) {
              const spans = ynRow.querySelectorAll('span');
              spans.forEach((s, i) => {
                s.textContent = (i === confirmIdx ? '▶ ' : '  ') + (i === 0 ? 'OUI' : 'NON');
              });
            }
          }
        }
        if (bEdge) {
          // Cancel → back to TICK
          if (confirmDiv && confirmDiv.parentElement) confirmDiv.parentElement.removeChild(confirmDiv);
          confirmDiv = null;
          state = 'TICK';
          return false;
        }
        if (aEdge) {
          if (confirmIdx === 0) {
            state = 'COMMIT';
          } else {
            // NON → back to TICK
            if (confirmDiv && confirmDiv.parentElement) confirmDiv.parentElement.removeChild(confirmDiv);
            confirmDiv = null;
            state = 'TICK';
          }
          return false;
        }
        return false;
      }

      case 'COMMIT': {
        // 1:1 décomp wallclock.c:861-866 Task_SetClock_Confirmed : pas de
        // save SRAM ici. Seuls RtcCalcLocalTimeOffset + setFlag. La save SRAM
        // se fait UNIQUEMENT via START → SAUVER explicite. (Avant :
        // `gameState.save()` ici → cause user-flag "save random" 2026-05-21.)
        RtcCalcLocalTime();
        const currentDays = gLocalTime.days;
        RtcCalcLocalTimeOffset(currentDays, editHour, editMinute, 0);
        FlagSet('FLAG_SYS_CLOCK_SET');
        console.log(`[wallclock] in-game time set to ${editHour}:${String(editMinute).padStart(2,'0')}`);
        state = 'FADE_OUT';
        return false;
      }

      case 'FADE_OUT': {
        if (overlay) {
          overlay.style.opacity = '0';
          setTimeout(() => cleanup(), 320);
        }
        // Audit session 126 : 1:1 décomp `wallclock.c:864,892`
        // `BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)` (= unfade)
        // au retour à overworld. Sans ça, le `fadescreen FADE_TO_BLACK` du
        // script `SetWallClock` qui a précédé reste actif → BG noir post-confirm.
        // Le décomp ROM le fait dans CB2_StartWallClock cleanup ; notre flow
        // standalone doit le faire explicitement.
        try {
          getRuntime().BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
        } catch (e) { console.warn('[wallclock-flow] BeginNormalPaletteFade failed:', e); }
        state = 'DONE';
        return false;
      }

      case 'DONE': {
        // Session 124 fix Bug 4 : signal le `waitstate` qui suit (= 1:1 décomp
        // pattern `ScriptContext_Enable()` appelé par CB2_ReturnToFieldContinue
        // ScriptPlayMapMusic). Sans ça, le waitstate poll un map-switch qui
        // n'arrive jamais → freeze du jeu après close de l'horloge.
        SignalWaitState();
        return true;
      }
    }
    return false;
  };

  return { tick };
}

// ─── Render impl (= cercle + aiguilles + chiffres) ────────────────────────

function renderClock(canvas: HTMLCanvasElement, hour: number, minute: number, animTimer: number, mode: Mode): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(cx, cy) - 30;

  // Background (= clear + GBA bleu ciel)
  ctx.fillStyle = '#5a99dd';
  ctx.fillRect(0, 0, w, h);

  // Cloud decorations (= GBA wallclock has clouds floating BG)
  drawClouds(ctx, w, h, animTimer);

  // Clock face circle.
  ctx.save();
  ctx.fillStyle = '#fafafa';
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Tick marks (= 12 numbers around).
  ctx.save();
  ctx.fillStyle = '#222';
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const tx = cx + Math.cos(angle) * (r - 22);
    const ty = cy + Math.sin(angle) * (r - 22);
    ctx.fillText(String(i), tx, ty);
  }
  // Minor ticks
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#444';
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const angle = (i * 6 - 90) * Math.PI / 180;
    const x1 = cx + Math.cos(angle) * (r - 6);
    const y1 = cy + Math.sin(angle) * (r - 6);
    const x2 = cx + Math.cos(angle) * (r - 12);
    const y2 = cy + Math.sin(angle) * (r - 12);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  ctx.restore();

  // Hour hand.
  const hourAngle = ((hour % 12) * 30 + minute * 0.5 - 90) * Math.PI / 180;
  ctx.save();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hourAngle) * (r * 0.55), cy + Math.sin(hourAngle) * (r * 0.55));
  ctx.stroke();
  ctx.restore();

  // Minute hand.
  const minuteAngle = (minute * 6 - 90) * Math.PI / 180;
  ctx.save();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(minuteAngle) * (r * 0.78), cy + Math.sin(minuteAngle) * (r * 0.78));
  ctx.stroke();
  ctx.restore();

  // Center pivot dot.
  ctx.save();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cc4444';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Digital readout (bottom).
  ctx.save();
  const period = hour < 12 ? 'AM' : 'PM';
  const h12 = hour < 12 ? (hour === 0 ? 12 : hour) : (hour === 12 ? 12 : hour - 12);
  ctx.fillStyle = '#222';
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const digital = `${String(h12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
  ctx.fillText(digital, cx, cy + r + 4);
  ctx.restore();

  // Mode banner (top).
  ctx.save();
  ctx.fillStyle = mode === 'SET' ? '#cc6600' : '#226633';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(mode === 'SET' ? '— RÉGLAGE —' : '— HORLOGE —', cx, 8);
  ctx.restore();
}

function drawClouds(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  // 3 clouds slowly floating left → right.
  const tn = (t / 80) % 1;
  const cloudColor = 'rgba(255,255,255,0.55)';
  ctx.fillStyle = cloudColor;
  for (let i = 0; i < 3; i++) {
    const baseX = ((i * 0.4) + tn) % 1.2 - 0.1;
    const x = baseX * w;
    const y = 30 + i * 40;
    drawCloud(ctx, x, y);
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.arc(x + 14, y - 8, 12, 0, Math.PI * 2);
  ctx.arc(x + 28, y, 14, 0, Math.PI * 2);
  ctx.arc(x + 14, y + 6, 13, 0, Math.PI * 2);
  ctx.fill();
}

// Pour debug : suppress unused warnings on lastUp/lastDown/lastL/lastR.
// Ces refs sont là pour future use (= held repeat avec edge detect plus fin).
// Aucun impact runtime.
