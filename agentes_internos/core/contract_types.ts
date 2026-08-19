/**
 * Tipos y Contratos de Comunicación para el Enjambre Agéntico (SNC 2.0)
 * ShopDigital - Luz 01 Orquestadora Central
 */

export type BunkerId = 
  | 'BUNKER_01_FRONTEND'
  | 'BUNKER_02_UX_ARI'
  | 'BUNKER_03_ONBOARDING'
  | 'BUNKER_04_FINANZAS_MATEO'
  | 'BUNKER_05_BACKEND_BRUNO'
  | 'BUNKER_06_FIRESTORE'
  | 'BUNKER_07_WEBHOOKS'
  | 'BUNKER_08_EXPANSION_FRACTAL'
  | 'BUNKER_09_SECOPS_THOR'
  | 'BUNKER_10_DOBERMAN'
  | 'BUNKER_11_QA_TESTING'
  | 'BUNKER_12_DIRECTOR_WALY';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AgentRole = 
  | 'ORQUESTADORA_LUZ'
  | 'GENERAL_MATEO'
  | 'GENERAL_BRUNO'
  | 'GENERAL_THOR'
  | 'GENERAL_ARI'
  | 'SUBAGENT_UI_BUILDER'
  | 'SUBAGENT_FIRESTORE_PATCHER'
  | 'SUBAGENT_CODE_AUDITOR'
  | 'SUBAGENT_SCRAPER';

export interface TaskPayload {
  taskId: string;
  sourceAgent: AgentRole;
  targetRole: AgentRole;
  bunkerId: BunkerId;
  priority: TaskPriority;
  instructions: string;
  targetFiles?: string[];
  verificationCommand?: string;
  createdAt: string;
}

export interface ResultPayload {
  taskId: string;
  executingRole: AgentRole;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  summary: string;
  modifiedFiles: string[];
  logs?: string;
  errorTrace?: string;
  completedAt: string;
}
