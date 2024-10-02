const express = require('express');
const Limiter = require('@muxn4/limtr'); // Import from the scoped package

// For ES modules, you would use:
// import express from 'express';
// import Limiter from 'limtr';

const app = express();

// Create a new Limiter instance
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

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, World! This route is rate limited.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Try making more than 5 requests in 60 seconds to see rate limiting in action.`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  limiter.close();
  process.exit(0);
});