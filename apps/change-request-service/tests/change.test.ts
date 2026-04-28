import request from 'supertest';
import app from '../src/app';

// Mock Dependencies
jest.mock('../src/lib/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn()
}));

jest.mock('../src/services/change.service', () => {
  return {
    ChangeService: jest.fn().mockImplementation(() => {
      return {
        createDraft: jest.fn().mockResolvedValue({ id: '1', status: 'DRAFT' }),
        submitForReview: jest.fn().mockResolvedValue({ id: '1', status: 'SUBMITTED' }),
        review: jest.fn().mockResolvedValue({ id: '1', status: 'APPROVED' }),
        getAll: jest.fn().mockResolvedValue([{ id: '1' }]),
      };
    })
  };
});

describe('Change Request Service', () => {
  it('should return 200 for health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('should create a draft', async () => {
    const res = await request(app).post('/draft').send({
      title: 'Update API',
      description: 'Updating the core auth API',
      targetServiceId: 'auth-service',
      changeType: 'SCHEMA_UPDATE'
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('DRAFT');
  });

  it('should submit a draft', async () => {
    const res = await request(app).post('/1/submit');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SUBMITTED');
  });

  it('should review a request', async () => {
    const res = await request(app).post('/1/review').send({
      action: 'APPROVE',
      comment: 'Looks good'
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('APPROVED');
  });
});
