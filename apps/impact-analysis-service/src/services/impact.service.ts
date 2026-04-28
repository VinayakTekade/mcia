import { ImpactRepository } from '../repositories/impact.repository';
import axios from 'axios';

export class ImpactService {
  private repo = new ImpactRepository();

  async fetchGraphData() {
    const depUrl = process.env.DEPENDENCY_SERVICE_URL || 'http://localhost:3003';
    try {
      const res = await axios.get(`${depUrl}/api/dependencies/graph`);
      return res.data;
    } catch (e) {
      console.error('Failed to fetch dependency graph', e);
      return { nodes: [], edges: [] };
    }
  }

  async fetchServiceData(serviceId: string) {
    const regUrl = process.env.REGISTRY_SERVICE_URL || 'http://localhost:3002';
    try {
      const res = await axios.get(`${regUrl}/api/services/${serviceId}`);
      return res.data;
    } catch (e) {
      return { criticalityLevel: 'MEDIUM', endpoints: [] };
    }
  }

  calculateBlastRadius(targetServiceId: string, edges: any[]) {
    // Blast radius means "who calls this service either directly or indirectly"
    // Since targetServiceId is changing, anything that depends on it is affected.
    // So we traverse backwards (where target === current node -> next node is source)
    
    const directImpacts = new Set<string>();
    const indirectImpacts = new Set<string>();

    // Find direct callers
    const directEdges = edges.filter(e => e.target === targetServiceId);
    directEdges.forEach(e => directImpacts.add(e.source));

    // BFS for indirect callers
    const queue = Array.from(directImpacts);
    const visited = new Set<string>([targetServiceId, ...directImpacts]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentEdges = edges.filter(e => e.target === current);
      
      for (const e of currentEdges) {
        if (!visited.has(e.source)) {
          visited.add(e.source);
          indirectImpacts.add(e.source);
          queue.push(e.source);
        }
      }
    }

    return {
      direct: Array.from(directImpacts),
      indirect: Array.from(indirectImpacts)
    };
  }

  async analyzeImpact(data: { changeRequestId: string, targetServiceId: string, changeType: string, graphData?: any }) {
    const graph = data.graphData || await this.fetchGraphData();
    const serviceMeta = await this.fetchServiceData(data.targetServiceId);

    const { direct, indirect } = this.calculateBlastRadius(data.targetServiceId, graph.edges || []);
    
    let riskScore = 0;
    const explanation: string[] = [];

    // MVP Rule: direct dependency impact = high weight (20 points each)
    if (direct.length > 0) {
      riskScore += direct.length * 20;
      explanation.push(`${direct.length} direct downstream consumers affected (+${direct.length * 20} risk)`);
    }

    // MVP Rule: indirect dependency impact = medium weight (10 points each)
    if (indirect.length > 0) {
      riskScore += indirect.length * 10;
      explanation.push(`${indirect.length} indirect downstream consumers affected (+${indirect.length * 10} risk)`);
    }

    // MVP Rule: critical services increase risk
    if (serviceMeta.criticalityLevel === 'CRITICAL') {
      riskScore += 50;
      explanation.push(`Target service is marked as CRITICAL (+50 risk)`);
    } else if (serviceMeta.criticalityLevel === 'HIGH') {
      riskScore += 30;
      explanation.push(`Target service is marked as HIGH criticality (+30 risk)`);
    }

    // MVP Rule: public API changes increase risk
    const hasPublicEndpoints = serviceMeta.endpoints?.some((e: any) => e.visibility === 'PUBLIC');
    if (hasPublicEndpoints) {
      riskScore += 40;
      explanation.push(`Target service exposes PUBLIC endpoints which might be affected (+40 risk)`);
    }

    // MVP Rule: high impact change types
    if (['ENDPOINT_REMOVAL', 'CONTRACT_CHANGE'].includes(data.changeType)) {
      riskScore += 50;
      explanation.push(`Change type '${data.changeType}' represents a potential breaking contract change (+50 risk)`);
    }

    let riskLevel = 'LOW';
    if (riskScore >= 100) riskLevel = 'CRITICAL';
    else if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    const reportData = {
      changeRequestId: data.changeRequestId,
      targetServiceId: data.targetServiceId,
      changeType: data.changeType,
      directImpacts: direct,
      indirectImpacts: indirect,
      affectedServices: direct.length + indirect.length,
      affectedContracts: direct.length, // Simplified assumption
      blastRadius: direct.length + indirect.length,
      riskScore,
      riskLevel,
      explanation
    };

    return this.repo.saveReport(reportData);
  }

  async getReport(changeRequestId: string) {
    const report = await this.repo.getReport(changeRequestId);
    if (!report) throw { status: 404, message: 'Report not found' };
    return report;
  }
}
