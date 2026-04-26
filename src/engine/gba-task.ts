/**
 * gba-task.ts
 * ------------
 * Mini-runtime de tasks 1:1 décomp `src/task.c` (gTasks[] + RunTasks).
 *
 * Pattern décomp :
 *   gTasks[i] = { func, data: i16[16], active }
 *   chaque frame, RunTasks() itère et appelle .func(taskId)
 *   les tasks transitionnent via `gTasks[id].func = NewTaskFunc`
 *
 * Notre simplification web :
 *   - Tasks attachées à une Scene Phaser (pas de gTasks global)
 *   - Tick automatique via scene.update event
 *   - data : Int16Array[16] (= GBA i16[16])
 *
 * Cf. main_menu.c BirchSpeech 32 tasks (TASK_NAMES dans main-menu-data.ts).
 * Permet de reproduire les state machines décomp sans inventer une logique.
 */
import Phaser from 'phaser';

export type TaskFunc = (taskId: number) => void;

export interface Task {
  func: TaskFunc;
  data: Int16Array;        // i16[16] = 32 bytes (1:1 décomp gTasks[].data)
  active: boolean;
}

export class TaskRunner {
  private tasks: Task[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Tick chaque frame (60 fps default Phaser)
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.tick, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.UPDATE, this.tick, this);
      this.tasks = [];
    });
  }

  /** Crée une nouvelle task. Returns task id. 1:1 décomp `CreateTask(func, priority)`. */
  createTask(func: TaskFunc): number {
    const id = this.tasks.findIndex(t => !t.active);
    const task: Task = { func, data: new Int16Array(16), active: true };
    if (id >= 0) {
      this.tasks[id] = task;
      return id;
    }
    this.tasks.push(task);
    return this.tasks.length - 1;
  }

  /** Détruit une task. 1:1 décomp `DestroyTask(taskId)`. */
  destroyTask(taskId: number): void {
    if (this.tasks[taskId]) this.tasks[taskId].active = false;
  }

  /** Accès direct à task data (1:1 décomp `gTasks[id].data[N]`). */
  getTask(taskId: number): Task | undefined {
    return this.tasks[taskId]?.active ? this.tasks[taskId] : undefined;
  }

  /** Set la prochaine task func (transition d'état 1:1 décomp `gTasks[id].func = NewFn`). */
  setTaskFunc(taskId: number, func: TaskFunc): void {
    const t = this.tasks[taskId];
    if (t?.active) t.func = func;
  }

  /** Tick (interne) : appelle .func sur chaque task active. */
  private tick(): void {
    for (let i = 0; i < this.tasks.length; i++) {
      const t = this.tasks[i];
      if (t?.active) t.func(i);
    }
  }
}
