# TICK LOOP REFERENCE — field_control_avatar.c → OverworldScene.update()

> Spec issue de l'audit Agent Explore (very thorough) du 2026-04-25.
> Source : `D:\Projet 1\decomps\pokeemeraude\src\field_control_avatar.c` + `src/script.c`.
> But : guider le refactor de `OverworldScene.update()` pour fidélité au décomp.

---

## 1. Ordre exact d'exécution dans `ProcessPlayerFieldInput()` (à chaque frame)

```
1. CheckForTrainersWantingBattle()              → return TRUE si script lancé
2. TryRunOnFrameMapScript()                     → À CHAQUE FRAME (ligne 150)
   (MapHeaderCheckScriptTable(MAP_SCRIPT_ON_FRAME_TABLE))
3. Si pressedBButton :
   TrySetupDiveEmergeScript()
4. Si tookStep (joueur a complété un pas) :
   a. IncrementGameStat(GAME_STAT_STEPS)
   b. TryStartStepBasedScript() :
      - TryStartCoordEventScript()
      - TryStartWarpEventScript()
      - TryStartMiscWalkingScripts()
      - TryStartStepCountScript()
      - UpdateRepelCounter()
5. Si checkStandardWildEncounter :
   CheckStandardWildEncounter()
6. Si heldDirection ET dpadDirection == playerDirection :
   TryArrowWarp()
7. GetInFrontOfPlayerPosition()
8. Si pressedAButton :
   TryStartInteractionScript()
9. Si heldDirection2 ET dpadDirection == playerDirection :
   TryDoorWarp() (DIR_NORTH uniquement)
10. Si pressedAButton + ocean :
    TrySetupDiveDownScript()
11. Si pressedStartButton : ShowStartMenu()
12. Si pressedSelectButton : UseRegisteredKeyItemOnField()
```

---

## 2. Phases d'input (4 types distincts)

| Phase | Trigger | Use |
|---|---|---|
| `tookStep` | `tileTransitionState == T_TILE_CENTER && runningState == MOVING` | Step-based scripts (coord, warp, etc.) |
| `heldDirection` | direction tenue 2+ frames | Arrow warps |
| `heldDirection2` | idem alternative | Door warps |
| `dpadDirection` | direction enfoncée actuelle (UP > DOWN > LEFT > RIGHT) | Quelle dir vérifier |
| `pressedAButton` | new press A | Interaction / dive |
| `pressedStartButton` | new press START | Menu |
| `pressedBButton` | new press B | Dive emerge |
| `checkStandardWildEncounter` | `T_TILE_CENTER && !forcedMove` | Wild encounter |

**Guards** :
- `forcedMove` (MetatileBehavior_IsForcedMovementTile) → désactive buttons
- `PLAYER_SPEED_FASTEST` (cutscene) → no input

---

## 3. Map scripts — fréquence d'appel

| Type | ID | Fréquence | C function |
|---|---|---|---|
| `MAP_SCRIPT_ON_LOAD` | 1 | Une fois au load | `RunOnLoadMapScript()` |
| `MAP_SCRIPT_ON_TRANSITION` | 3 | Une fois au warp | `RunOnTransitionMapScript()` |
| `MAP_SCRIPT_ON_RESUME` | 5 | Au load + à chaque retour menu/combat | `RunOnResumeMapScript()` |
| `MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE` | 4 | Une fois post-objects load (var-conditional) | `TryRunOnWarpIntoMapScript()` (script.c:365) |
| `MAP_SCRIPT_ON_FRAME_TABLE` | 2 | **À CHAQUE FRAME** post fade-in (var-conditional) | `TryRunOnFrameMapScript()` (script.c:353) |
| `MAP_SCRIPT_ON_DIVE_WARP` | 6 | À chaque dive/emerge | `RunOnDiveWarpMapScript()` |
| `MAP_SCRIPT_ON_RETURN_TO_FIELD` | 7 | Retour au field après battle/menu | `RunOnReturnToFieldMapScript()` |

---

## 4. Format des tables `_TABLE` (FRAME / WARP_INTO_MAP)

```c
// script.c:299-326
u8 *MapHeaderCheckScriptTable(u8 tag) {
    while (1) {
        u16 varIndex1 = T1_READ_16(ptr); ptr += 2;
        if (!varIndex1) return NULL;       // fin table
        u16 varIndex2 = T1_READ_16(ptr); ptr += 2;
        if (VarGet(varIndex1) == VarGet(varIndex2))
            return T2_READ_PTR(ptr);       // 1er match → script
        ptr += 4;
    }
}
```

Structure : `[var1 (2B)] [var2 (2B)] [scriptPtr (4B)] [...]`. **Itère jusqu'au premier match**, retour immédiat. **Pas de mécanisme "ne pas rejouer"** — le script lui-même doit modifier les vars (ex. setvar VAR_LITTLEROOT_INTRO_STATE 3 → 4) pour ne plus matcher.

---

## 5. Re-entry guards (mécanismes)

Le décomp **n'a PAS** de `gIsScriptActive` global. Mécanismes utilisés :

1. **Return TRUE de `ProcessPlayerFieldInput`** → l'overworld loop ne re-call pas tant qu'un script tourne.
2. **Coord events conditionnels** : `if (VarGet(coordEvent.trigger) == coordEvent.index)`. Le script doit avancer la var pour ne plus se re-trigger.
3. **Step-based seulement si `tookStep == TRUE`** → 1 step = 1 check.
4. **ON_FRAME table** : 1 seul match par frame (premier `return`), puis le script avance ses vars.
5. **Wild encounter immunity** : 4 steps après spawn/warp avant rencontres possibles.

---

## 6. Plan refactor `OverworldScene.update()` (fidèle au décomp)

```ts
private isScriptRunning = false;

update() {
  if (!this.mapReady) return;

  // Phase 1 : ON_FRAME check à CHAQUE FRAME
  if (!this.isScriptRunning) {
    void this.tryRunOnFrameMapScript();   // pré-lock sync inside
    if (this.dialogueOpen) return;
  }

  // Phase 2 : trainer wanting battle
  if (!this.isScriptRunning && this.checkForTrainersWantingBattle()) return;

  // Phase 3 : input (event-driven actuel)
  if (this.dialogueOpen || this.isScriptRunning) return;
  this.processPlayerInput();
}

private async tryRunOnFrameMapScript() {
  if (this.isScriptRunning) return;
  this.isScriptRunning = true;
  this.dialogueOpen = true; // SYNC pré-lock ← critique
  try {
    // Itère map_script_2 entries jusqu'au premier match
    const ctx = this.buildScriptContext();
    await runOnFrameTable(this.parsedScripts, this.mapName, ctx);
  } finally {
    this.isScriptRunning = false;
    this.dialogueOpen = false; // libère si script a pas fait releaseall
  }
}

private tryStartStepBasedScript(): boolean {
  // Appelé après tookStep == TRUE :
  if (this.tryStartCoordEventScript()) return true;
  if (this.tryStartWarpEventScript()) return true;
  if (this.tryStartMiscWalkingScript()) return true; // holes, mats
  if (this.tryStartStepCountScript()) return true;   // poison, hatch
  return false;
}
```

**Points critiques** :
1. ON_FRAME appelé à CHAQUE frame (pas une seule fois au spawn) ✅ fait session 19
2. `dialogueOpen=true` set **synchroneously** avant `await` pour fermer la fenêtre micro-gap d'input ✅ fait session 19
3. Step-based scripts triggered uniquement sur `tookStep == TRUE` ✅ déjà fait dans `onComplete` du tween
4. ON_FRAME doit s'auto-skip via `isScriptRunning` ✅ fait

---

## 7. Effets périphériques (notés pour plus tard)

- **Wild encounter immunity** : 4 steps après spawn avant rencontre possible
- **Poison damage** : counter par step, %=4 → tick HP
- **Friendship walker** : counter par step, boost amitié à 128
- **Repel counter** : `UpdateRepelCounter()` chaque step
- **Forced movement tiles** : bloquent buttons + certains scripts
- **Egg hatch** : check à chaque step, `ShouldEggHatch()`
- **Dive/emerge** : guard FLAG_BADGE07_GET, map underwater séparée
