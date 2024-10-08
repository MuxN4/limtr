const Redis = require('ioredis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

class Limiter {
  constructor(options = {}) {
    this.options = {
      points: 10,
      duration: 1,
      keyPrefix: 'limtr',
      keyGenerator: (req) => req.ip, // Default key generator
      ...options
    };

    this.redisClient = new Redis(this.options.redisOptions);
    
    this.rateLimiter = new RateLimiterRedis({
      storeClient: this.redisClient,
      points: this.options.points,
      duration: this.options.duration,
      keyPrefix: this.options.keyPrefix,
    });
  }

  middleware() {
    return async (req, res, next) => {
      try {
        const key = this.options.keyGenerator(req);
        console.log('Generated key:', key); // Debugging line
        const rateLimiterRes = await this.rateLimiter.consume(key);
        
        res.setHeader('X-RateLimit-Limit', this.options.points);
        res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
        
        next();
      } catch (rejRes) {
        if (rejRes instanceof Error) {
          next(rejRes);
        } else {
          res.setHeader('Retry-After', Math.ceil(rejRes.msBeforeNext / 1000));
          res.status(429).send('Too Many Requests');
        }
      }
    };
  }

  close() {
    if (this.redisClient) {
      this.redisClient.quit();
    }
  }
}

module.exports = Limiter;