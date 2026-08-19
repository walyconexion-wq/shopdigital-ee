/**
 * Multiplexor Central de Eventos y Tareas (SNC 2.0)
 * Responsable de encaminar directivas de Luz 01 a los Búnkeres y Subagentes.
 */

import { TaskPayload, ResultPayload, AgentRole, BunkerId } from './contract_types';

export class AgentMultiplexor {
  private activeTasks: Map<string, TaskPayload> = new Map();
  private completedResults: Map<string, ResultPayload> = new Map();

  /**
   * Registra y despacha una nueva directiva desde la Orquestadora Central (Luz 01)
   */
  public dispatchTask(task: TaskPayload): void {
    console.log(`[Luz 01 Multiplexor] Despachando tarea ${task.taskId} a ${task.targetRole} (${task.bunkerId})`);
    this.activeTasks.set(task.taskId, task);
  }

  /**
   * Recibe el informe de finalización de un subagente o general
   */
  public registerResult(result: ResultPayload): void {
    console.log(`[Luz 01 Multiplexor] Tarea ${result.taskId} finalizada con estado: ${result.status}`);
    this.activeTasks.delete(result.taskId);
    this.completedResults.set(result.taskId, result);
  }

  /**
   * Obtiene las tareas activas en cola
   */
  public getActiveTasks(): TaskPayload[] {
    return Array.from(this.activeTasks.values());
  }
}

export const globalMultiplexor = new AgentMultiplexor();
