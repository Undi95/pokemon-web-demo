import Phaser from 'phaser';
import { getRuntime } from '../runtime/decomp-globals';
import { gSpriteCoordOffset, GetCameraTopLeftCoords, GetCameraOffsetWithPan } from '../../src/field_camera';

/**
 * Overlay debug affiché sur TOUTES les scènes.
 * Remplace le statusText vert local de GameScene par un overlay global.
 *
 * MASQUÉ PAR DÉFAUT (sinon il recouvre la vraie barre de titre du jeu et
 * trompe la lecture visuelle / l'A/B vs ROM).
 *
 * Touches (= AZERTY top-row, non-shiftées) :
 *   « & » — toggle visibilité du devmenu.
 *   « é » — freeze / unfreeze la frame en cours (= `runtime.paused`).
 *           Actif uniquement quand le devmenu est visible. Utile pour
 *           figer un bug visuel et le montrer sans qu'il bouge.
 *   « " » — toggle noclip (= player marche à travers tout). Actif
 *           uniquement quand le devmenu est visible. Bypass dans
 *           `player-avatar.checkPlayerCollision` via le flag global
 *           `__devNoclip`.
 *   « ' » — lance un combat de TEST voie L (Treecko Lv5 vs MEDHYENA/
 *           Poochyena Lv5) via bootDecompBattleLoop. Actif uniquement
 *           quand le devmenu est ouvert. Pour itérer vite sur les bugs combat.
 */
export class DebugOverlayScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private _visible = false;
  private _keyHandler?: (e: KeyboardEvent) => void;

  constructor() {
    super({ key: 'DebugOverlayScene', active: true });
  }

  create() {
    this.statusText = this.add.text(2, 2, 'debug...', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#00FF88',
      backgroundColor: '#00000088',
    }).setScrollFactor(0).setDepth(999999);
    // Masqué par défaut.
    this.statusText.setVisible(this._visible);

    // Met à jour toutes les 30 frames (~0.5s) — seulement si visible.
    // Le scheduler de Phaser tourne sur `game.loop`, indépendant de
    // `runtime.paused` → le tag [FROZEN] continue de s'afficher correctement
    // quand on freeze la frame logique.
    this.time.addEvent({
      delay: 500,
      callback: () => this.updateDebug(),
      loop: true,
    });

    // Window listener (= marche quelle que soit la scène focus). Cleanup
    // au SHUTDOWN/DESTROY de la scène.
    this._keyHandler = (e: KeyboardEvent): void => {
      // « & » — toggle visibilité, toujours actif.
      if (e.key === '&') {
        this._visible = !this._visible;
        this.statusText.setVisible(this._visible);
        if (this._visible) this.updateDebug();
        return;
      }
      // « ( » (= numpad-5 sur le clavier de l'user) — DEV : lance le COMBAT RIVAL #1 (May/Flora Route 103)
      // voie L, pour A/B les animations de combat dresseur (opponent send-out, ball, idle bob...). TOUJOURS
      // actif (hors combat), comme « & ». Garde anti-chain-boot (ne boote pas si deja en combat).
      if (e.key === '(') {
        const rt0 = getRuntime();
        if (rt0?.gMain?.inBattle) { console.warn('[DebugOverlay] deja en combat — Numpad5 (rival) ignore'); return; }
        const dlr = (globalThis as unknown as {
          __decompBattleLoop?: { harnessBootRivalBattle1?: () => Promise<void> };
        }).__decompBattleLoop;
        if (dlr?.harnessBootRivalBattle1) {
          // sync pos pour le retour OW post-combat (= comme le combat de test « ' »).
          const gg = globalThis as unknown as {
            gSaveBlock1Ptr?: { pos: { x: number; y: number } };
            __gObjectEvents?: Array<{ currentCoordsX: number; currentCoordsY: number } | undefined>;
          };
          const sb1 = gg.gSaveBlock1Ptr; const player = gg.__gObjectEvents?.[0];
          if (sb1 && player && typeof player.currentCoordsX === 'number') {
            sb1.pos.x = player.currentCoordsX - 7; sb1.pos.y = player.currentCoordsY - 7;
          }
          void dlr.harnessBootRivalBattle1();
        } else {
          console.warn('[DebugOverlay] harnessBootRivalBattle1 indisponible');
        }
        return;
      }
      // Les commandes ci-dessous = uniquement quand devmenu ouvert
      // (= évite trigger accidentel pendant gameplay normal).
      if (!this._visible) return;
      // « é » — freeze runtime tick (= rt.paused gate `tickFixed`,
      // cf. decomp-runtime.ts:1976). Phaser garde le rendu actif
      // → la dernière frame logique reste visible figée.
      if (e.key === 'é') {
        const rt = getRuntime();
        rt.paused = !rt.paused;
        this.updateDebug();
        return;
      }
      // « " » — toggle noclip. Bypass dans player-avatar.ts via flag global.
      if (e.key === '"') {
        const g = globalThis as unknown as { __devNoclip?: boolean };
        g.__devNoclip = !g.__devNoclip;
        this.updateDebug();
        return;
      }
      // « ' » — lance un combat de TEST voie L (Treecko Lv5 vs MEDHYENA/Poochyena
      // Lv5) via bootDecompBattleLoop. Setup party-storage + boot via le bridge
      // global __decompBattleLoop (= évite un import direct du module battle depuis
      // une scène Phaser). Pour itérer vite sur les bugs combat. À utiliser depuis
      // l'overworld (pas pendant un combat déjà en cours).
      if (e.key === "'") {
        // Garde anti-chain-boot (= bloqueur double-combat) : ne boote PAS si deja en combat
        // (un 2e boot par-dessus accumule l'etat runtime -> crash, lecon user 2026-06-09).
        const rt0 = getRuntime();
        if (rt0?.gMain?.inBattle) { console.warn("[DebugOverlay] deja en combat — ' (wild) ignore"); return; }
        const dl = (globalThis as unknown as {
          __decompBattleLoop?: {
            harnessSetupParties: (...a: unknown[]) => Promise<boolean>;
            bootDecompBattleLoop: (returnToOverworld?: boolean) => void;
          };
        }).__decompBattleLoop;
        if (dl) {
          // Sync DÉFENSIF de gSaveBlock1.pos à la position courante du joueur avant
          // de booter. Le retour post-combat (ReturnToFieldFromBattleOrMenu) spawn le
          // joueur à gSaveBlock1.pos. EN JEU NORMAL c'est déjà bon : gSaveBlock1.pos
          // suit la marche (CameraMove, field-camera.ts:633 mute _camPos = alias
          // gSaveBlock1Ptr.pos à chaque pas) — vérifié runtime (marche (5,9)→(5,12),
          // retour combat → (5,12) exact). Ce sync est donc un no-op en pratique ; il
          // garantit seulement qu'un boot déclenché EN PLEIN PAS (currentCoords en
          // avance d'1 tuile sur pos pas-encore-commitée) ne décale pas le retour.
          // currentCoords = logique + MAP_OFFSET(7).
          {
            const gg = globalThis as unknown as {
              gSaveBlock1Ptr?: { pos: { x: number; y: number } };
              __gObjectEvents?: Array<{ currentCoordsX: number; currentCoordsY: number } | undefined>;
            };
            const sb1 = gg.gSaveBlock1Ptr;
            const player = gg.__gObjectEvents?.[0];
            if (sb1 && player && typeof player.currentCoordsX === 'number') {
              sb1.pos.x = player.currentCoordsX - 7; // MAP_OFFSET
              sb1.pos.y = player.currentCoordsY - 7;
            }
          }
          // bootDecompBattleLoop(true) = pose le savedCallback de retour OW (sinon
          // freeze en fin de combat : la voie L hors encounter n'a pas de retour wiré).
          void dl.harnessSetupParties(
            'SPECIES_TREECKO', 5, 'SPECIES_POOCHYENA', 5,
            { moves: ['MOVE_POUND', 'MOVE_LEER'] }, { moves: ['MOVE_TACKLE'] },
          ).then(() => dl.bootDecompBattleLoop(true));
        } else {
          console.warn('[DebugOverlay] __decompBattleLoop non exposé — combat de test indisponible');
        }
        return;
      }
    };
    window.addEventListener('keydown', this._keyHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
    });
    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
    });
  }

  private updateDebug() {
    if (!this._visible) return;
    try {
      const rt = getRuntime();
      const frozen = rt.paused ? ' [FROZEN]' : '';
      const noclip = (globalThis as unknown as { __devNoclip?: boolean }).__devNoclip
        ? ' [NOCLIP]' : '';
      // ── Bloc warp/caméra : offset sprite + top-left caméra + position écran Y
      //    du sprite joueur + latch glitch (cf. scope.coordTrace).
      //    Rappel 1:1 : off.y = -40 est NORMAL en régime stable (sVerticalCameraPan
      //    = 32). Le glitch warp = un SAUT transitoire de pY.
      let camLine = '';
      try {
        const off = gSpriteCoordOffset;
        const tl = GetCameraTopLeftCoords();
        const pa = (globalThis as unknown as { gPlayerAvatar?: { spriteId?: number } }).gPlayerAvatar;
        const s = (pa && typeof pa.spriteId === 'number') ? rt.gSprites[pa.spriteId] : undefined;
        const ss = s as unknown as { y?: number; y2?: number; coordOffsetEnabled?: boolean } | undefined;
        const pY = (ss && typeof ss.y === 'number')
          ? ss.y + (ss.y2 ?? 0) + (ss.coordOffsetEnabled ? off.y : 0)
          : null;
        const bg = GetCameraOffsetWithPan();
        camLine = `\noff:(${off.x},${off.y}) cam:(${tl.x},${tl.y}) bgV:${bg.y} pY:${pY ?? '?'}`;
      } catch { /* OW pas booté */ }
      const glitch = (globalThis as unknown as { __warpGlitch?: { f: number; dBV?: number; dPY?: number } }).__warpGlitch;
      const glitchLine = glitch
        ? ` !GLITCH@F${glitch.f} dBV${(glitch.dBV ?? 0) >= 0 ? '+' : ''}${glitch.dBV ?? 0} dPY${(glitch.dPY ?? 0) >= 0 ? '+' : ''}${glitch.dPY ?? 0}`
        : '';
      this.statusText.setText(
        `frame:${rt.gIntroFrameCounter} tasks:${rt.GetTaskCount()} sprites:${rt.gSprites.filter(Boolean).length} fps:${Math.round(this.game.loop.actualFps)}${frozen}${noclip}${camLine}${glitchLine}`,
      );
    } catch {
      this.statusText.setText(`fps:${Math.round(this.game.loop.actualFps)}`);
    }
  }
}
