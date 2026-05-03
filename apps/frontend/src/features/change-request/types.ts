import type { ChangeType, ChangeStatus } from '../../types';

// ---- Form Schema Types ----

export interface ChangeRequestFormData {
  title: string;
  description: string;
  targetServiceId: string;
  changeType: ChangeType;
  affectedEndpoints: string;
  versionChange: string;
}

// ---- API Response Types ----

export interface ReviewComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface ChangeRequestDetail {
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
  impactAnalysis?: object;
  createdAt: string;
  updatedAt: string;
}

export interface ImpactSummary {
  id: string;
  changeRequestId: string;
  blastRadius: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedServices: number;
  directImpacts: string[];
  indirectImpacts: string[];
  explanation: string[];
}

export type ReviewAction = 'APPROVE' | 'REJECT' | 'NEEDS_REVISION';
