const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each user to 100 requests per window
  keyGenerator: (req) => req.user?.userId || req.ip, // Use userId if authenticated, else IP
  message: 'Too many requests, please try again later.',
});

module.exports = limiter;