import request from 'supertest';
import app from '../../src/app';

// Mock DB and Redis so tests don't need real services
jest.mock('../../src/db/client', () => ({
  db: {
    raw: jest.fn().mockResolvedValue({}),
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(null),
    insert: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([
      { id: 'test-uuid', email: 'test@example.com', role: 'user', created_at: new Date() },
    ]),
  },
}));

jest.mock('../../src/db/redis', () => ({
  redis: {
    ping: jest.fn().mockResolvedValue('PONG'),
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
  },
}));

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/register', () => {
  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });
});
