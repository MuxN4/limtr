# limtr

A flexible rate-limiting middleware for Express applications using Redis for storage.

## Features

- Easy to integrate with Express applications
- Uses Redis for distributed rate limiting
- Customizable rate limits and time windows
- Supports custom key generation for fine-grained control
- Informative rate limit headers

## Installation

```bash
npm install limtr
```

Make sure you have Redis installed and running on your system.

## Usage

Here's a basic example of how to use limtr in your Express application:

```javascript
const express = require('express');
const Limiter = require('limtr');

const app = express();

const limiter = new Limiter({
  points: 5, // Allow 5 requests
  duration: 60, // Per 60 seconds
  redisOptions: {
    host: 'localhost',
    port: 6379
  }
});

// Apply the rate limiting middleware globally
app.use(limiter.middleware());

app.get('/', (req, res) => {
  res.send('Hello, World! This route is rate limited.');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## Configuration

The `Limiter` constructor accepts the following options:

- `points` (Number): Maximum number of requests allowed within the duration (default: 10)
- `duration` (Number): Time window in seconds (default: 1)
- `keyPrefix` (String): Prefix for Redis keys (default: 'limtr')
- `redisOptions` (Object): Options for the Redis client (see [ioredis documentation](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options))
- `keyGenerator` (Function): Custom function to generate keys (default: uses IP address)

## Headers

limtr sets the following headers on responses:

- `X-RateLimit-Limit`: The maximum number of requests allowed in the current time window
- `X-RateLimit-Remaining`: The number of requests remaining in the current time window
- `X-RateLimit-Reset`: The time at which the current time window resets (in UTC epoch seconds)

When the rate limit is exceeded, it also sets:

- `Retry-After`: The number of seconds to wait before making another request

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.