const express = require('express');
const request = require('supertest');
const Redis = require('ioredis-mock');
const Limiter = require('../src/limiter');

jest.mock('ioredis', () => require('ioredis-mock'));

describe('Limiter', () => {
  let app;
  let limiter;

  beforeEach(() => {
    app = express();
    limiter = new Limiter({
      points: 3,
      duration: 1,
      redisOptions: {}
    });
    app.use(limiter.middleware());
    app.get('/', (req, res) => res.sendStatus(200));
  });

  afterEach(() => {
    limiter.close();
  });

  it('should allow requests within the limit', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['x-ratelimit-limit']).toBe('3');
      expect(res.headers['x-ratelimit-remaining']).toBe((2 - i).toString());
    }
  });

  it('should block requests over the limit', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).get('/');
    }
    const res = await request(app).get('/');
    expect(res.status).toBe(429);
    expect(res.text).toBe('Too Many Requests');
    expect(res.headers['retry-after']).toBeDefined();
  });

  it('should use custom key generator if provided', async () => {
    const customKeyGenerator = jest.fn().mockReturnValue('custom-key');
    limiter = new Limiter({
      points: 1,
      duration: 1,
      redisOptions: {},
      keyGenerator: customKeyGenerator
    });
    app.use(limiter.middleware());

    await request(app).get('/');
    expect(customKeyGenerator).toHaveBeenCalled();

    const res = await request(app).get('/');
    expect(res.status).toBe(429);
  });
});