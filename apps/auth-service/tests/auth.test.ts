import request from 'supertest';
import app from '../src/app';

// Mock the dependencies to avoid actual DB calls during simple unit tests
jest.mock('../src/services/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => {
      return {
        register: jest.fn().mockResolvedValue({ id: '1', email: 'test@mcia.local', name: 'Test', role: 'DEVELOPER' }),
        login: jest.fn().mockResolvedValue({ token: 'mock-token', user: { id: '1', email: 'test@mcia.local' } }),
        getProfile: jest.fn().mockResolvedValue({ id: '1', email: 'test@mcia.local', name: 'Test', role: 'DEVELOPER' })
      };
    })
  };
});

describe('Auth Service', () => {
  it('should return 200 for health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('should register a user', async () => {
    const res = await request(app).post('/register').send({
      email: 'test@mcia.local',
      password: 'password123',
      name: 'Test'
    });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@mcia.local');
  });

  it('should login a user', async () => {
    const res = await request(app).post('/login').send({
      email: 'test@mcia.local',
      password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail profile fetch without token', async () => {
    const res = await request(app).get('/profile');
    expect(res.status).toBe(401);
  });
});
