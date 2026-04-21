import request from 'supertest';
import app from '../src/app';

// Mock DB
jest.mock('../src/services/registry.service', () => {
  return {
    RegistryService: jest.fn().mockImplementation(() => {
      return {
        createService: jest.fn().mockResolvedValue({ id: '1', name: 'test-service' }),
        getServices: jest.fn().mockResolvedValue({ data: [{ id: '1', name: 'test-service' }], total: 1 }),
        getServiceById: jest.fn().mockResolvedValue({ id: '1', name: 'test-service' })
      };
    })
  };
});

describe('Registry Service', () => {
  it('should return 200 for health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('should create a service', async () => {
    const res = await request(app).post('/').send({
      name: 'test-service',
      ownerTeam: 'Core',
      communicationType: 'REST'
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('test-service');
  });

  it('should list services', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});
