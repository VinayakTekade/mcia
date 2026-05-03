// Auth / Users
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DEVELOPER' | 'ARCHITECT' | 'RELEASE_MANAGER' | 'ADMIN';
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

// Services
export interface ServiceEndpoint {
  id: string;
  method: string;
  path: string;
  version: string;
  visibility: 'PUBLIC' | 'INTERNAL';
  isDeprecated: boolean;
}

export interface Microservice {
  id: string;
  name: string;
  ownerTeam: string;
  repositoryUrl?: string;
  currentVersion: string;
  communicationType: 'REST' | 'GRPC' | 'GRAPHQL' | 'ASYNC_EVENT';
  criticalityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  endpoints: ServiceEndpoint[];
  createdAt: string;
  updatedAt: string;
}

// Dependencies
export interface Dependency {
  id: string;
  sourceServiceId: string;
  targetServiceId: string;
  dependencyType: 'REST' | 'GRPC' | 'EVENT_DRIVEN' | 'QUEUE_BASED';
  description?: string;
  contractReference?: string;
  isCritical: boolean;
}

export interface GraphData {
  nodes: { id: string; data?: any }[];
  edges: { id: string; source: string; target: string; type?: string; isCritical?: boolean }[];
}

// Change Requests
export type ChangeType = 'ENDPOINT_REMOVAL' | 'CONTRACT_CHANGE' | 'SCHEMA_UPDATE' | 'VERSION_BUMP' | 'DEPENDENCY_REMOVAL' | 'DEPENDENCY_ADDITION';
export type ChangeStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

export interface ReviewComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  targetServiceId: string;
  changeType: ChangeType;
  status: ChangeStatus;
  authorId: string;
  reviewerId?: string;
  comments: ReviewComment[];
  blastRadius?: number;
  impactAnalysis?: any;
  createdAt: string;
  updatedAt: string;
}

// Impact Reports
export interface ImpactReport {
  id: string;
  changeRequestId: string;
  targetServiceId: string;
  changeType: string;
  directImpacts: string[];
  indirectImpacts: string[];
  affectedServices: number;
  affectedContracts: number;
  blastRadius: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string[];
  createdAt: string;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}
