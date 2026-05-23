/**
 * game-state.ts — Module SHIM minimal pour préserver l'init ESM chain.
 *
 * **NON-1:1 décomp** : le décomp n'a PAS de class GameState. Il utilise
 * `gSaveBlock1Ptr` + `gSaveBlock2Ptr` (globals) + helpers (FlagSet/VarSet/etc)
 * direct. **Code engine : 0 sites utilisent `gameState.X`.**
 *
 * Ce module est gardé pour UNE SEULE raison :
 *   - La chaîne ESM eager `save-system → bag → game-state` est essentielle
 *     au boot. Sans game-state.ts qui charge la chaîne complète des helpers
 *     1:1, `main.ts` top-level ne s'exécute jamais (= boot stall silencieux
 *     après decomp-constants loaded).
 *
 * **Investigation menée en session 2026-05-23-2 (commit 3917a26f + cleanup
 * suivant)** :
 *   - Tentative suppression complète : ÉCHEC, boot stall.
 *   - Module vide (juste comments) : ÉCHEC, boot stall.
 *   - Conclusion : la chaîne d'init eager nécessite que ce module charge
 *     les helpers 1:1 (= cycle ESM subtil dans phaser → scenes → engine
 *     qui se résout grâce à ces imports eager).
 *
 * Ce module n'a PAS d'export. Les side-effect imports ci-dessous chargent
 * les helpers 1:1 qui doivent être init dans cet ordre pour le boot.
 *
 * **Helpers 1:1 à utiliser dans le code engine (= 0 dependence à ce module)** :
 *   - `gSaveBlock1Ptr` / `gSaveBlock2Ptr` (save-block-state.ts)
 *   - `FlagSet/FlagClear/FlagGet/VarSet/VarGet` (script-vars.ts)
 *   - `GetCurrentMap/SetCurrentMap` (load_save.ts)
 *   - `GetDynamicWarp/SetDynamicWarp` (warp-system.ts)
 *   - `SaveGame/LoadGameSave/ResetSaveBlocks/HasValidSave` (save-system.ts)
 *   - `GiveMonToPlayer` (pokemon.ts)
 *   - `gBagPockets` + helpers (bag.ts)
 *   - `GetObjectXY/SetObjectXY/GetTakenItemBalls` (web-overlays.ts)
 */

// Side-effect imports pour préserver l'init ESM eager chain.
// L'ordre importe : les modules sont chargés dans l'ordre déclaratif et le
// boot stall si l'un d'eux n'est pas dans cette chaîne.
import './pokemon';
import './bag';
import './save-system';
import './load_save';
import './save-block-state';
import './script-vars';
import './warp-system';
import './web-overlays';
