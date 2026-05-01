import request from 'supertest';
import app from '../src/app';

jest.mock('../src/services/notification.service', () => ({
  NotificationService: jest.fn().mockImplementation(() => ({
    getForUser: jest.fn().mockResolvedValue([
      { id: '1', userId: 'user-1', type: 'CHANGE_SUBMITTED', title: 'Test', body: 'Test body', isRead: false }
    ]),
    markRead: jest.fn().mockResolvedValue({ id: '1', isRead: true }),
    markUnread: jest.fn().mockResolvedValue({ id: '1', isRead: false }),
  }))
}));

describe('Notification Service', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET / should list notifications for a user', async () => {
    const res = await request(app).get('/').query({ userId: 'user-1' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].type).toBe('CHANGE_SUBMITTED');
  });

  it('GET / without userId should return 400', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(400);
  });

  it('PATCH /:id/read should mark as read', async () => {
    const res = await request(app).patch('/1/read');
    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(true);
  });

  it('PATCH /:id/unread should mark as unread', async () => {
    const res = await request(app).patch('/1/unread');
    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(false);
  });
});
