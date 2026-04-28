import { ImpactService } from '../src/services/impact.service';

// Mock the repo so no DB needed for unit tests
jest.mock('../src/repositories/impact.repository', () => ({
  ImpactRepository: jest.fn().mockImplementation(() => ({
    saveReport: jest.fn().mockImplementation((data: any) => Promise.resolve(data)),
    getReport: jest.fn()
  }))
}));

// Mock axios so no HTTP calls needed
jest.mock('axios');

const SAMPLE_EDGES = [
  { source: 'api-gateway', target: 'auth-service', type: 'REST', isCritical: true },
  { source: 'api-gateway', target: 'service-registry-service', type: 'REST', isCritical: true },
  { source: 'mobile-app', target: 'api-gateway', type: 'REST', isCritical: true },
  { source: 'impact-analysis-service', target: 'dependency-mapping-service', type: 'REST', isCritical: true },
];

const svc = new ImpactService();

describe('Impact Analysis - Blast Radius Calculator', () => {
  it('should find direct callers of auth-service', () => {
    const { direct, indirect } = svc.calculateBlastRadius('auth-service', SAMPLE_EDGES);
    expect(direct).toContain('api-gateway');
    expect(direct).toHaveLength(1);
  });

  it('should find indirect callers transitively', () => {
    const { direct, indirect } = svc.calculateBlastRadius('auth-service', SAMPLE_EDGES);
    expect(indirect).toContain('mobile-app');
  });

  it('should return empty arrays for an isolated service', () => {
    const { direct, indirect } = svc.calculateBlastRadius('orphan-service', SAMPLE_EDGES);
    expect(direct).toHaveLength(0);
    expect(indirect).toHaveLength(0);
  });
});

describe('Impact Analysis - Risk Scoring', () => {
  it('should score CRITICAL for service with breaking change and many callers', async () => {
    const report = await svc.analyzeImpact({
      changeRequestId: '00000000-0000-0000-0000-000000000001',
      targetServiceId: 'auth-service',
      changeType: 'ENDPOINT_REMOVAL',
      graphData: {
        nodes: [],
        edges: SAMPLE_EDGES
      }
    });
    expect(report.riskScore).toBeGreaterThan(0);
    expect(['HIGH', 'CRITICAL']).toContain(report.riskLevel);
  });

  it('should score LOW for an isolated service with minor change', async () => {
    const report = await svc.analyzeImpact({
      changeRequestId: '00000000-0000-0000-0000-000000000002',
      targetServiceId: 'orphan-service',
      changeType: 'VERSION_BUMP',
      graphData: { nodes: [], edges: [] }
    });
    expect(report.riskLevel).toBe('LOW');
  });
});
