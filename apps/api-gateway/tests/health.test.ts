import request from 'supertest';
import app from '../src/app';

describe('Health Check Endpoint', () => {
  it('should return 200 UP', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'UP',
      service: 'api-gateway'
    });
  });
});
