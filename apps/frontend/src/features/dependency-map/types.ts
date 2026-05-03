// Extended types for the Dependency Map feature

export type DependencyType = 'REST' | 'GRPC' | 'EVENT_DRIVEN' | 'QUEUE_BASED';
export type CriticalityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GraphNode {
  id: string;
  data?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: DependencyType;
  isCritical?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ServiceDetail {
  id: string;
  name: string;
  ownerTeam: string;
  currentVersion: string;
  communicationType: string;
  criticalityLevel: CriticalityLevel;
  description?: string;
  repositoryUrl?: string;
}

export interface GraphFilters {
  search: string;
  dependencyTypes: DependencyType[];
  criticalOnly: boolean;
}
