import request from 'supertest';
import app from '../src/app';

// Mock DB
jest.mock('../src/services/dependency.service', () => {
  return {
    DependencyService: jest.fn().mockImplementation(() => {
      return {
        createDependency: jest.fn().mockResolvedValue({ id: '1', sourceServiceId: 'a', targetServiceId: 'b' }),
        getAllDependencies: jest.fn().mockResolvedValue([{ id: '1' }]),
        getGraph: jest.fn().mockResolvedValue({ nodes: [{id: 'a'}, {id: 'b'}], edges: [{source: 'a', target: 'b'}] }),
      };
    })
  };
});

describe('Dependency Mapping Service', () => {
  it('should return 200 for health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('should create a dependency', async () => {
    const res = await request(app).post('/').send({
      sourceServiceId: 'auth-service',
      targetServiceId: 'db-service'
    });
    expect(res.status).toBe(201);
  });

  it('should return graph representation', async () => {
    const res = await request(app).get('/graph');
    expect(res.status).toBe(200);
    expect(res.body.nodes.length).toBeGreaterThan(0);
  });
});
